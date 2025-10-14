import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class Backtester:
    def __init__(self, start_date, end_date, initial_capital=100000, agent=None, data=None):
        self.start_date = start_date
        self.end_date = end_date
        self.capital = initial_capital
        self.portfolio = {}
        self.agent = agent
        self.data = data if data is not None else self._load_historical_data()
        self.current_step = 0
        self.done = False
        self.state_buffer = []

    def _load_historical_data(self):
        """Load OHLCV and options data for backtesting period"""
        # Implementation would connect to data source
        return pd.DataFrame()  # Placeholder

    def reset(self):
        self.capital = 100000
        self.portfolio = {}
        self.current_step = 0
        self.done = False
        self.state_buffer = []
        if self.agent and hasattr(self.agent, 'state_buffer'):
            self.agent.state_buffer.clear()

    def run_backtest(self, strategy_params):
        """Execute backtest with given strategy parameters"""
        self.reset()
        results = []

        while not self.done and self.current_step < len(self.data):
            state = self._get_state()
            self.state_buffer.append(state)
            if self.agent:
                action = self.agent.act(state)
            else:
                action = 0  # default hold

            next_state, reward, done = self.step(action)
            if self.agent:
                self.agent.remember(state, action, reward, next_state, done)
                self.agent.replay()

            results.append({
                'date': self.data.index[self.current_step],
                'capital': self.capital,
                'positions': len(self.portfolio),
                'reward': reward
            })

            self.current_step += 1
            self.done = done

        return pd.DataFrame(results)

    def _get_state(self):
        """Get current market state"""
        if self.current_step >= len(self.data):
            return None
        state = self.data.iloc[self.current_step].values
        return state

    def step(self, action):
        current_price = self.data.iloc[self.current_step]['close']
        reward = 0

        if action == 1 and self.capital > 0:
            self.portfolio['position'] = self.capital / current_price
            self.capital = 0
        elif action == 2 and self.portfolio.get('position', 0) > 0:
            self.capital = self.portfolio['position'] * current_price
            self.portfolio['position'] = 0
            reward = (self.capital - 100000) / 100000

        done = self.current_step >= len(self.data) - 1
        return self._get_state(), reward, done

    def generate_report(self, results):
        """Generate performance analytics"""
        metrics = {
            'total_return': (results['capital'].iloc[-1] - results['capital'].iloc[0]) / results['capital'].iloc[0],
            'max_drawdown': self._calculate_max_drawdown(results),
            'win_rate': len(results[results['reward'] > 0]) / len(results),
            'sharpe_ratio': self._calculate_sharpe(results)
        }
        return metrics

    def _calculate_max_drawdown(self, results):
        capital = results['capital']
        roll_max = capital.cummax()
        drawdown = (capital - roll_max) / roll_max
        return drawdown.min()

    def _calculate_sharpe(self, results, risk_free_rate=0.01):
        returns = results['capital'].pct_change().dropna()
        excess_returns = returns - risk_free_rate / 252
        return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

if __name__ == "__main__":
    from datetime import datetime
    import pandas as pd
    from rl_trading_agent import TradingAgent

    data = pd.read_csv('market_data.csv', index_col=0, parse_dates=True)
    data = data[['open', 'high', 'low', 'close', 'volume']]

    agent = TradingAgent(state_size=data.shape[1], action_size=3)

    backtester = Backtester(
        start_date=datetime(2020, 1, 1),
        end_date=datetime(2023, 12, 31),
        agent=agent,
        data=data
    )

    results = backtester.run_backtest({})
    report = backtester.generate_report(results)
    print("Backtest Results:")
    print(f"Total Return: {report['total_return']:.2%}")
    print(f"Max Drawdown: {report['max_drawdown']:.2%}")
    print(f"Win Rate: {report['win_rate']:.2%}")
    print(f"Sharpe Ratio: {report['sharpe_ratio']:.2f}")
