import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

class OptionsDataset(Dataset):
    def __init__(self, sequences, targets):
        self.sequences = torch.FloatTensor(sequences)
        self.targets = torch.FloatTensor(targets)
        
    def __len__(self):
        return len(self.sequences)
    
    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]

class OptionsModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(OptionsModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc1 = nn.Linear(hidden_size, 32)
        self.fc2 = nn.Linear(32, output_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]  # Get last timestep output
        out = self.dropout(out)
        out = self.relu(self.fc1(out))
        out = self.fc2(out)
        return out

class OptionsAITrainer:
    def __init__(self, data_path):
        self.data_path = data_path
        self.model = self._build_model()
        self.history = None
        self.criterion = nn.MSELoss()
        self.optimizer = None
        
    def _build_model(self):
        """Construct PyTorch neural network"""
        model = OptionsModel(
            input_size=10,  # Number of features
            hidden_size=128,
            num_layers=2,
            output_size=3   # Predicts [premium, optimal_strike, probability]
        )
        self.optimizer = optim.Adam(model.parameters(), lr=0.001)
        return model
            
    def load_and_preprocess(self):
        """Load and prepare training data"""
        df = pd.read_csv(self.data_path)
        
        # Feature engineering
        df['iv_rank'] = df['implied_volatility'] / df['historical_volatility']
        df['moneyness'] = (df['strike'] - df['spot']) / df['spot']
        
        # Create sequences for LSTM
        sequences = []
        targets = []
        for i in range(len(df) - 30):
            seq = df.iloc[i:i+30][[
                'iv_rank', 'moneyness', 'volume', 'open_interest',
                'delta', 'gamma', 'theta', 'vega',
                'rsi_14', 'macd'
            ]].values
            target = df.iloc[i+30][[
                'premium', 'optimal_strike', 'probability_itm'
            ]].values
            sequences.append(seq)
            targets.append(target)
            
        return np.array(sequences), np.array(targets)
    
    def train(self, epochs=100, batch_size=32):
        """Train the PyTorch model"""
        X, y = self.load_and_preprocess()
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)
        
        train_dataset = OptionsDataset(X_train, y_train)
        val_dataset = OptionsDataset(X_val, y_val)
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=batch_size)
        
        self.history = {'train_loss': [], 'val_loss': []}
        
        for epoch in range(epochs):
            self.model.train()
            train_loss = 0
            for sequences, targets in train_loader:
                self.optimizer.zero_grad()
                outputs = self.model(sequences)
                loss = self.criterion(outputs, targets)
                loss.backward()
                self.optimizer.step()
                train_loss += loss.item()
                
            self.model.eval()
            val_loss = 0
            with torch.no_grad():
                for sequences, targets in val_loader:
                    outputs = self.model(sequences)
                    val_loss += self.criterion(outputs, targets).item()
                    
            avg_train_loss = train_loss/len(train_loader)
            avg_val_loss = val_loss/len(val_loader)
            self.history['train_loss'].append(avg_train_loss)
            self.history['val_loss'].append(avg_val_loss)
            
            print(f'Epoch {epoch+1}/{epochs}, Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}')
            
            # Early stopping
            if epoch > 5 and avg_val_loss > min(self.history['val_loss'][-5:]):
                print("Early stopping")
                break

    def evaluate(self):
        """Evaluate model performance"""
        if self.history is None:
            raise ValueError("Model must be trained first")
            
        plt.plot(self.history['train_loss'], label='Training Loss')
        plt.plot(self.history['val_loss'], label='Validation Loss')
        plt.legend()
        plt.savefig('training_history.png')
        plt.close()
        
        return {
            'final_train_loss': self.history['train_loss'][-1],
            'final_val_loss': self.history['val_loss'][-1],
            'best_epoch': np.argmin(self.history['val_loss']) + 1
        }
            
    def save_model(self, path='options_ai_model.pth'):
        """Save trained PyTorch model"""
        torch.save(self.model.state_dict(), path)
        print(f"PyTorch model saved to {path}")

if __name__ == "__main__":
    trainer = OptionsAITrainer('historical_options_data.csv')
    print("Starting model training...")
    trainer.train(epochs=50)
    metrics = trainer.evaluate()
    print(f"Training completed. Best validation loss: {metrics['final_val_loss']:.4f}")
    trainer.save_model()
