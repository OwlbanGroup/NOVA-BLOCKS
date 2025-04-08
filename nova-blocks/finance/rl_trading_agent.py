import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.optimizers import Adam
from collections import deque
import random

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
        self.model = self._build_model()
        self.target_model = self._build_model()
        
    def _build_model(self):
        """Build DQN model architecture"""
        inputs = Input(shape=(self.state_size,))
        x = Dense(64, activation='relu')(inputs)
        x = Dense(64, activation='relu')(x)
        outputs = Dense(self.action_size, activation='linear')(x)
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        model.compile(loss='mse', optimizer=Adam(learning_rate=self.learning_rate))
        return model
        
    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay memory"""
        self.memory.append((state, action, reward, next_state, done))
        
    def act(self, state):
        """Select action using epsilon-greedy policy"""
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        act_values = self.model.predict(state, verbose=0)
        return np.argmax(act_values[0])
        
    def replay(self, batch_size=32):
        """Train on batch from memory"""
        if len(self.memory) < batch_size:
            return
            
        minibatch = random.sample(self.memory, batch_size)
        states = np.array([i[0] for i in minibatch])
        actions = np.array([i[1] for i in minibatch])
        rewards = np.array([i[2] for i in minibatch])
        next_states = np.array([i[3] for i in minibatch])
        dones = np.array([i[4] for i in minibatch])
        
        # Predict Q-values for current and next states
        current_q = self.model.predict(states, verbose=0)
        next_q = self.target_model.predict(next_states, verbose=0)
        
        # Update Q-values using Bellman equation
        for i in range(batch_size):
            if dones[i]:
                current_q[i][actions[i]] = rewards[i]
            else:
                current_q[i][actions[i]] = rewards[i] + self.gamma * np.amax(next_q[i])
                
        # Train model
        self.model.fit(states, current_q, epochs=1, verbose=0)
        
        # Decay exploration rate
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
            
    def update_target_model(self):
        """Update target network weights"""
        self.target_model.set_weights(self.model.get_weights())
        
    def save_model(self, path='rl_trading_agent.h5'):
        """Save trained model"""
        self.model.save(path)
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
