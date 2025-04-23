import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque
import random

class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, 64)
        self.fc2 = nn.Linear(64, 64)
        self.fc3 = nn.Linear(64, action_size)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return self.fc3(x)

class TradingAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95  # discount rate
        self.epsilon = 1.0  # exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DQN(state_size, action_size).to(self.device)
        self.target_model = DQN(state_size, action_size).to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)
        self.loss_fn = nn.MSELoss()
        self.update_target_model()
        
    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay memory"""
        self.memory.append((state, action, reward, next_state, done))
        
    def act(self, state):
        """Select action using epsilon-greedy policy"""
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        state = torch.FloatTensor(state).to(self.device)
        with torch.no_grad():
            act_values = self.model(state)
        return act_values.argmax().item()
            
    def replay(self, batch_size=32):
        """Train on batch from memory"""
        if len(self.memory) < batch_size:
            return
            
        minibatch = random.sample(self.memory, batch_size)
        states = torch.FloatTensor(np.array([i[0][0] for i in minibatch])).to(self.device)
        actions = torch.LongTensor(np.array([i[1] for i in minibatch])).to(self.device)
        rewards = torch.FloatTensor(np.array([i[2] for i in minibatch])).to(self.device)
        next_states = torch.FloatTensor(np.array([i[3][0] for i in minibatch])).to(self.device)
        dones = torch.FloatTensor(np.array([i[4] for i in minibatch])).to(self.device)
        
        # Get current Q values
        current_q = self.model(states).gather(1, actions.unsqueeze(1))
        
        # Get next Q values from target model
        next_q = self.target_model(next_states).max(1)[0].detach()
        
        # Compute target Q values
        target_q = rewards + (1 - dones) * self.gamma * next_q
        
        # Compute loss and optimize
        loss = self.loss_fn(current_q.squeeze(), target_q)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        # Decay exploration rate
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
            
    def update_target_model(self):
        """Update target network weights"""
        self.target_model.load_state_dict(self.model.state_dict())
        
    def save_model(self, path='rl_trading_agent.pth'):
        """Save trained model"""
        torch.save(self.model.state_dict(), path)
        print(f"Model saved to {path}")

class MarketEnvironment:
    def __init__(self, data, initial_balance=10000):
        self.data = data
        self.initial_balance = initial_balance
        self.reset()
        
    def reset(self):
        """Reset environment state"""
        self.balance = self.initial_balance
        self.portfolio = 0
        self.current_step = 0
        self.done = False
        return self._get_state()
        
    def _get_state(self):
        """Get current market state"""
        # Normalize market data
        state = self.data.iloc[self.current_step].values
        state = np.append(state, [self.balance/self.initial_balance, self.portfolio/100])
        return np.reshape(state, [1, len(state)])
        
    def step(self, action):
        """Execute trading action"""
        current_price = self.data.iloc[self.current_step]['close']
        reward = 0
        
        # Action space: 0=hold, 1=buy, 2=sell
        if action == 1 and self.balance > 0:  # Buy
            self.portfolio += self.balance / current_price
            self.balance = 0
        elif action == 2 and self.portfolio > 0:  # Sell
            self.balance = self.portfolio * current_price
            self.portfolio = 0
            reward = (self.balance - self.initial_balance) / self.initial_balance
            
        # Move to next time step
        self.current_step += 1
        if self.current_step >= len(self.data) - 1:
            self.done = True
            
        next_state = self._get_state()
        return next_state, reward, self.done

if __name__ == "__main__":
    # Example usage
    import pandas as pd
    
    # Load and prepare market data
    data = pd.read_csv('market_data.csv')
    data = data[['open', 'high', 'low', 'close', 'volume']]
    
    # Initialize environment and agent
    env = MarketEnvironment(data)
    agent = TradingAgent(state_size=data.shape[1]+2, action_size=3)
    
    # Training parameters
    episodes = 1000
    batch_size = 32
    
    # Training loop
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
                print(f"Episode: {e+1}/{episodes}, Total Reward: {total_reward:.2f}")
                
            if len(agent.memory) > batch_size:
                agent.replay(batch_size)
                
    # Save trained model
    agent.save_model()
