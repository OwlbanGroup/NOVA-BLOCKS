import numpy as np
import pandas as pd
from stock_market_trainer import StockMarketTrainer
from rl_trading_agent import TradingAgent, MarketEnvironment
from options_trading_engine import OptionsTradingAI
from backtesting_engine import Backtester

class AITradingSystem:
    def __init__(self, config):
        """
        Initialize complete AI trading system
        
        Args:
            config (dict): Configuration parameters including:
                - data_paths: Dictionary of data file paths
                - model_paths: Dictionary of model save paths
                - trading_params: Trading parameters
        """
        self.config = config
        self.models = {}
        self.data = {}
        
        # Initialize components
        self._load_data()
        self._initialize_models()
        
    def _load_data(self):
        """Load all required market data"""
        print("Loading market data...")
        self.data = {
            'stocks': pd.read_csv(self.config['data_paths']['stocks']),
            'options': pd.read_csv(self.config['data_paths']['options']),
            'fundamentals': pd.read_csv(self.config['data_paths']['fundamentals'])
        }
        
    def _initialize_models(self):
        """Initialize all AI models"""
        print("Initializing AI models...")
        
        # Stock prediction model
        self.models['stock_predictor'] = StockMarketTrainer()
        
        # Options trading model
        self.models['options_ai'] = OptionsTradingAI(
            api_key=self.config.get('api_key', 'demo')
        )
        
        # RL trading agent
        self.models['rl_agent'] = TradingAgent(
            state_size=15,  # Number of features
            action_size=3   # Hold/Buy/Sell
        )
        
    def train_all_models(self):
        """Train all components of the trading system"""
        print("\nTraining stock prediction model...")
        X_tech, X_fund, y = self.models['stock_predictor'].preprocess_data(
            self.data['stocks'], 
            self.data['fundamentals']
        )
        self.models['stock_predictor'].train(X_tech, X_fund, y)
        
        print("\nTraining RL trading agent...")
        env = MarketEnvironment(self.data['stocks'])
        self._train_rl_agent(env)
        
        print("\nTraining complete for all models")
        
    def _train_rl_agent(self, env, episodes=1000):
        """Train reinforcement learning agent"""
        agent = self.models['rl_agent']
        
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
                    
                if len(agent.memory) > 32:
                    agent.replay(32)
    
    def run_live_trading(self, paper_trading=True):
        """Run live trading simulation"""
        print("\nInitializing live trading session...")
        
        if paper_trading:
            print("Running in paper trading mode")
            
        # Main trading loop
        while True:
            # Get latest market data
            current_market = self._get_latest_market_data()
            
            # Generate predictions
            stock_pred = self.models['stock_predictor'].predict_market(
                current_market['tech'],
                current_market['fundamentals']
            )
            
            # RL agent decision
            state = self._create_state_vector(stock_pred, current_market)
            action = self.models['rl_agent'].act(state)
            
            # Execute trades
            self._execute_trades(action, current_market, paper_trading)
            
            # Monitor and adjust positions
            self._manage_positions(current_market)
    
    def save_all_models(self):
        """Save all trained models"""
        print("\nSaving all models...")
        self.models['stock_predictor'].save_model(
            self.config['model_paths']['stock_predictor']
        )
        self.models['rl_agent'].save_model(
            self.config['model_paths']['rl_agent']
        )
        print("All models saved successfully")

if __name__ == "__main__":
    # Example configuration
    config = {
        'data_paths': {
            'stocks': 'data/stock_prices.csv',
            'options': 'data/options_chain.csv',
            'fundamentals': 'data/fundamentals.csv'
        },
        'model_paths': {
            'stock_predictor': 'models/stock_predictor.h5',
            'rl_agent': 'models/rl_agent.h5'
        },
        'trading_params': {
            'initial_balance': 100000,
            'risk_per_trade': 0.01
        }
    }
    
    # Initialize and run system
    trading_system = AITradingSystem(config)
    trading_system.train_all_models()
    trading_system.save_all_models()
    trading_system.run_live_trading(paper_trading=True)
