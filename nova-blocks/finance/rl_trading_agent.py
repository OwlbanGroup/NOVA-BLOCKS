import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import random

class PrioritizedReplayBuffer:
    def __init__(self, capacity, alpha=0.6):
        self.capacity = capacity
        self.alpha = alpha
        self.buffer = []
        self.pos = 0
        self.priorities = np.zeros((capacity,), dtype=np.float32)

    def push(self, state, action, reward, next_state, done):
        max_prio = self.priorities.max() if self.buffer else 1.0
        if len(self.buffer) < self.capacity:
            self.buffer.append((state, action, reward, next_state, done))
        else:
            self.buffer[self.pos] = (state, action, reward, next_state, done)
        self.priorities[self.pos] = max_prio
        self.pos = (self.pos + 1) % self.capacity

    def sample(self, batch_size, beta=0.4):
        if len(self.buffer) == self.capacity:
            prios = self.priorities
        else:
            prios = self.priorities[:self.pos]
        probs = prios ** self.alpha
        probs /= probs.sum()

        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        samples = [self.buffer[idx] for idx in indices]

        total = len(self.buffer)
        weights = (total * probs[indices]) ** (-beta)
        weights /= weights.max()
        weights = np.array(weights, dtype=np.float32)

        batch = list(zip(*samples))
        states = np.vstack(batch[0])
        actions = batch[1]
        rewards = batch[2]
        next_states = np.vstack(batch[3])
        dones = batch[4]

        return states, actions, rewards, next_states, dones, indices, weights

    def update_priorities(self, batch_indices, batch_priorities):
        for idx, prio in zip(batch_indices, batch_priorities):
            self.priorities[idx] = prio

class DuelingDQN_LSTM(nn.Module):
    def __init__(self, state_size, action_size, hidden_size=64, lstm_layers=1):
        super(DuelingDQN_LSTM, self).__init__()
        self.lstm = nn.LSTM(state_size, hidden_size, lstm_layers, batch_first=True)
        self.fc_adv = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Linear(64, action_size)
        )
        self.fc_val = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        # x shape: (batch, seq_len, features)
        lstm_out, _ = self.lstm(x)
        lstm_out = lstm_out[:, -1, :]  # take last output
        adv = self.fc_adv(lstm_out)
        val = self.fc_val(lstm_out)
        q = val + adv - adv.mean(dim=1, keepdim=True)
        return q

class TradingAgent:
    def __init__(self, state_size, action_size, seq_len=10):
        self.state_size = state_size
        self.action_size = action_size
        self.seq_len = seq_len
        self.memory = PrioritizedReplayBuffer(2000)
        self.gamma = 0.95
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DuelingDQN_LSTM(state_size, action_size).to(self.device)
        self.target_model = DuelingDQN_LSTM(state_size, action_size).to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)
        self.loss_fn = nn.MSELoss()
        self.update_target_model()
        self.state_buffer = deque(maxlen=seq_len)

    def remember(self, state, action, reward, next_state, done):
        self.memory.push(state, action, reward, next_state, done)

    def act(self, state):
        self.state_buffer.append(state)
        if len(self.state_buffer) < self.seq_len:
            return random.randrange(self.action_size)
        state_seq = np.array(self.state_buffer)
        state_seq = torch.FloatTensor(state_seq).unsqueeze(0).to(self.device)  # (1, seq_len, features)
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        with torch.no_grad():
            act_values = self.model(state_seq)
        return act_values.argmax().item()

    def replay(self, batch_size=32, beta=0.4):
        if len(self.memory.buffer) < batch_size:
            return
        states, actions, rewards, next_states, dones, indices, weights = self.memory.sample(batch_size, beta)
        states = torch.FloatTensor(states).view(batch_size, self.seq_len, self.state_size).to(self.device)
        next_states = torch.FloatTensor(next_states).view(batch_size, self.seq_len, self.state_size).to(self.device)
        actions = torch.LongTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)
        weights = torch.FloatTensor(weights).to(self.device)

        current_q = self.model(states).gather(1, actions.unsqueeze(1)).squeeze(1)
        next_q = self.target_model(next_states).max(1)[0].detach()
        target_q = rewards + (1 - dones) * self.gamma * next_q

        loss = (weights * self.loss_fn(current_q, target_q)).mean()
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        prios = (target_q - current_q).abs().detach().cpu().numpy()
        self.memory.update_priorities(indices, prios)

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def update_target_model(self):
        self.target_model.load_state_dict(self.model.state_dict())

    def save_model(self, path='rl_trading_agent.pth'):
        torch.save(self.model.state_dict(), path)
        print(f"Model saved to {path}")

class MarketEnvironment:
    def __init__(self, data, initial_balance=10000):
        self.data = data
        self.initial_balance = initial_balance
        self.reset()

    def reset(self):
        self.balance = self.initial_balance
        self.portfolio = 0
        self.current_step = 0
        self.done = False
        return self._get_state()

    def _get_state(self):
        state = self.data.iloc[self.current_step].values
        state = np.append(state, [self.balance / self.initial_balance, self.portfolio / 100])
        return np.reshape(state, [1, len(state)])

    def step(self, action):
        current_price = self.data.iloc[self.current_step]['close']
        reward = 0

        if action == 1 and self.balance > 0:
            self.portfolio += self.balance / current_price
            self.balance = 0
        elif action == 2 and self.portfolio > 0:
            self.balance = self.portfolio * current_price
            self.portfolio = 0
            reward = (self.balance - self.initial_balance) / self.initial_balance

        self.current_step += 1
        if self.current_step >= len(self.data) - 1:
            self.done = True

        next_state = self._get_state()
        return next_state, reward, self.done

if __name__ == "__main__":
    import pandas as pd

    data = pd.read_csv('market_data.csv')
    data = data[['open', 'high', 'low', 'close', 'volume']]

    env = MarketEnvironment(data)
    agent = TradingAgent(state_size=data.shape[1] + 2, action_size=3)

    episodes = 1000
    batch_size = 32

    for e in range(episodes):
        state = env.reset()
        total_reward = 0

        while not env.done:
            action = agent.act(state)
            next_state, reward, done = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward

            if done:
                agent.update_target_model()
                print(f"Episode: {e + 1}/{episodes}, Total Reward: {total_reward:.2f}")

            if len(agent.memory.buffer) > batch_size:
                agent.replay(batch_size)

    agent.save_model()
