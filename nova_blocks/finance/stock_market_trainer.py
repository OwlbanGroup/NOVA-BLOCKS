"""
Stock Market Trainer for NOVA BLOCKS Finance.

This module implements a hybrid LSTM + Attention model for stock market prediction,
optimized for NVIDIA Blackwell GPUs with TensorRT acceleration.
"""

# Import numpy first to avoid tensorflow numpy issues
try:
    import numpy as np  # type: ignore
    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

try:
    import tensorflow as tf  # type: ignore
    from tensorflow.keras.layers import LSTM, Dense, Attention, Concatenate  # type: ignore
    from tensorflow.keras.models import Model  # type: ignore
    TENSORFLOW_AVAILABLE = True
except ImportError:
    tf = None
    LSTM = None
    Dense = None
    Attention = None
    Concatenate = None
    Model = None
    TENSORFLOW_AVAILABLE = False

try:
    import pandas as pd  # type: ignore
    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False

try:
    from sklearn.preprocessing import RobustScaler  # type: ignore
    SKLEARN_AVAILABLE = True
except ImportError:
    RobustScaler = None
    SKLEARN_AVAILABLE = False



# TensorRT and PyCUDA imports removed as they are unused

class StockMarketTrainer:
    """Stock market trainer with hybrid LSTM + Attention model."""

    def __init__(self):
        self.model = self._build_hybrid_model()
        self.scalers = {}
        
    def _build_hybrid_model(self):
        """Build LSTM + Attention model architecture"""
        # Technical features input
        tech_input = tf.keras.Input(shape=(60, 15), name='tech_input')
        lstm_layer = LSTM(128, return_sequences=True)(tech_input)
        attention = Attention()([lstm_layer, lstm_layer])

        # Fundamental features input
        fund_input = tf.keras.Input(shape=(20,), name='fund_input')
        fund_dense = Dense(64, activation='relu')(fund_input)

        # Combined model
        combined = Concatenate()([attention[:, -1, :], fund_dense])
        dense1 = Dense(128, activation='relu')(combined)
        dropout = tf.keras.layers.Dropout(0.3)(dense1)
        output = Dense(3, activation='linear')(dropout)  # [price_change, volatility, momentum]

        return Model(inputs=[tech_input, fund_input], outputs=output)
    
    def preprocess_data(self, tech_data, fund_data):
        """Prepare and scale training data"""
        # Technical data scaling
        self.scalers['tech'] = RobustScaler()
        tech_scaled = self.scalers['tech'].fit_transform(tech_data)

        # Fundamental data scaling
        self.scalers['fund'] = RobustScaler()
        fund_scaled = self.scalers['fund'].fit_transform(fund_data)

        # Create sequences
        tech_sequences, fund_sequences, targets = [], [], []
        for i in range(60, len(tech_data)):
            tech_sequences.append(tech_scaled[i-60:i])
            fund_sequences.append(fund_scaled[i])
            targets.append([
                tech_data['close'].pct_change().iloc[i],  # Price change
                tech_data['close'].rolling(5).std().iloc[i],  # Volatility
                tech_data['close'].iloc[i] / tech_data['close'].iloc[i-20] - 1  # Momentum
            ])

        return np.array(tech_sequences), np.array(fund_sequences), np.array(targets)
    
    def train(self, tech_data, fund_data, targets, epochs=100):
        """Train the hybrid model"""
        # Fit scalers if not already done
        if not self.scalers:
            # For sequences, fit scalers on flattened data
            self.scalers['tech'] = RobustScaler()
            self.scalers['fund'] = RobustScaler()
            # Reshape tech_data to 2D for scaling
            tech_reshaped = tech_data.reshape(-1, tech_data.shape[-1])
            self.scalers['tech'].fit(tech_reshaped)
            self.scalers['fund'].fit(fund_data)

        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(0.0005),
            loss='mse',
            metrics=['mae']
        )

        history = self.model.fit(
            [tech_data, fund_data], targets,
            epochs=epochs,
            batch_size=64,
            validation_split=0.2,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(patience=10),
                tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5)
            ]
        )
        return history
    
    def predict_market(self, tech_data, fund_data):
        """Generate market predictions"""
        # Preprocess input data - reshape tech_data for scaling
        tech_reshaped = tech_data.reshape(-1, tech_data.shape[-1])
        tech_data_scaled = self.scalers['tech'].transform(tech_reshaped)
        fund_data_scaled = self.scalers['fund'].transform(fund_data)

        # Reshape back to original shape for prediction
        tech_data_scaled = tech_data_scaled.reshape(tech_data.shape)

        # Make prediction
        return self.model.predict([tech_data_scaled, fund_data_scaled])
    
    def save_model(self, path='stock_market_ai.h5'):
        """Save trained model"""
        self.model.save(path)
        print(f"Model saved to {path}")

if __name__ == "__main__":
    # Example usage
    trainer = StockMarketTrainer()
    
    # Load sample data (replace with actual data loading)
    tech_data = pd.read_csv('technical_indicators.csv', index_col=0)
    fund_data = pd.read_csv('fundamental_data.csv', index_col=0)
    
    # Preprocess and train
    tech_sequences, fund_sequences, targets = trainer.preprocess_data(tech_data, fund_data)
    print("Starting model training...")
    trainer.train(tech_sequences, fund_sequences, targets)
    trainer.save_model()
