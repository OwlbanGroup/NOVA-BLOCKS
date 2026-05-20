"""
AI Training Module for NOVA BLOCKS Options Trading.

This module provides PyTorch-based neural network models and training infrastructure
for options trading prediction and analysis, optimized for NVIDIA Blackwell GPUs.
"""

try:
    import torch  # type: ignore
    import torch.nn as nn  # type: ignore
    import torch.optim as optim  # type: ignore
    from torch.utils.data import Dataset, DataLoader  # type: ignore
    from torch.cuda.amp import autocast, GradScaler  # type: ignore
    TORCH_AVAILABLE = True
except ImportError:
    torch = None
    nn = None
    optim = None
    Dataset = None
    DataLoader = None
    autocast = None
    GradScaler = None
    TORCH_AVAILABLE = False

try:
    from sklearn.model_selection import train_test_split  # type: ignore
    SKLEARN_AVAILABLE = True
except ImportError:
    train_test_split = None
    SKLEARN_AVAILABLE = False

try:
    import pandas as pd  # type: ignore
    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False

try:
    import numpy as np  # type: ignore
    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

try:
    import matplotlib.pyplot as plt  # type: ignore
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    plt = None
    MATPLOTLIB_AVAILABLE = False

class OptionsDataset(Dataset):
    """Dataset for options trading sequences and targets."""

    def __init__(self, sequences, targets):
        self.sequences = torch.FloatTensor(sequences)
        self.targets = torch.FloatTensor(targets)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]

class Attention(nn.Module):
    """Attention mechanism for LSTM outputs."""

    def __init__(self, hidden_size):
        super(Attention, self).__init__()
        self.attention = nn.Linear(hidden_size, 1)

    def forward(self, lstm_output):
        weights = torch.softmax(self.attention(lstm_output), dim=1)
        weighted_output = torch.sum(weights * lstm_output, dim=1)
        return weighted_output

class OptionsModel(nn.Module):
    """PyTorch model for options trading prediction with Blackwell optimizations."""

    def __init__(self, input_size, hidden_size, num_layers, output_size):
        super(OptionsModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.attention = Attention(hidden_size)
        self.fc1 = nn.Linear(hidden_size, 32)
        self.fc2 = nn.Linear(32, output_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

        # Blackwell optimizations
        self.scaler = GradScaler()
        self.use_blackwell = torch.cuda.is_available() and torch.cuda.get_device_name(0).startswith('NVIDIA Blackwell')

    def forward(self, x):
        if self.use_blackwell:
            with autocast():
                out, _ = self.lstm(x)
                attn_out = self.attention(out)
                out = self.dropout(attn_out)
                out = self.relu(self.fc1(out))
                out = self.fc2(out)
        else:
            out, _ = self.lstm(x)
            attn_out = self.attention(out)
            out = self.dropout(attn_out)
            out = self.relu(self.fc1(out))
            out = self.fc2(out)
        return out

class OptionsAITrainer:
    """Trainer class for options trading AI models with Blackwell GPU support."""

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
        self.optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
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
        """Train the PyTorch model with Blackwell optimizations"""
        x, y = self.load_and_preprocess()
        x_train, x_val, y_train, y_val = train_test_split(x, y, test_size=0.2, random_state=42)

        train_dataset = OptionsDataset(x_train, y_train)
        val_dataset = OptionsDataset(x_val, y_val)

        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, num_workers=0)

        self.history = {'train_loss': [], 'val_loss': []}

        # Move model to GPU if Blackwell available
        if self.model.use_blackwell:
            self.model = self.model.cuda()
            print("Using NVIDIA Blackwell GPU for training")

        for epoch in range(epochs):
            self.model.train()
            train_loss = 0
            for sequences, targets in train_loader:
                if self.model.use_blackwell:
                    sequences, targets = sequences.cuda(), targets.cuda()

                self.optimizer.zero_grad()

                if self.model.use_blackwell:
                    with autocast():
                        outputs = self.model(sequences)
                        loss = self.criterion(outputs, targets)
                    self.model.scaler.scale(loss).backward()
                    self.model.scaler.step(self.optimizer)
                    self.model.scaler.update()
                else:
                    outputs = self.model(sequences)
                    loss = self.criterion(outputs, targets)
                    loss.backward()
                    self.optimizer.step()

                train_loss += loss.item()

            self.model.eval()
            val_loss = 0
            with torch.no_grad():
                for sequences, targets in val_loader:
                    if self.model.use_blackwell:
                        sequences, targets = sequences.cuda(), targets.cuda()
                    outputs = self.model(sequences)
                    val_loss += self.criterion(outputs, targets).item()

            avg_train_loss = train_loss / len(train_loader)
            avg_val_loss = val_loss / len(val_loader)
            self.history['train_loss'].append(avg_train_loss)
            self.history['val_loss'].append(avg_val_loss)

            print(f'Epoch {epoch+1}/{epochs}, Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}')

# FIX: Early stopping - check if current > minimum of previous 5 epochs (not min of last 5)
            if epoch > 5:
                min_prev_5 = min(self.history['val_loss'][-6:-1])  # Exclude current epoch
                if avg_val_loss > min_prev_5:
                    print(f"Early stopping at epoch {epoch+1} - no improvement for 5 epochs")
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
