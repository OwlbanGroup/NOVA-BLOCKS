import tensorflow as tf
from tensorflow.keras.layers import LSTM, Dense, Attention, Concatenate
from tensorflow.keras.models import Model
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler

class StockMarketTrainer:
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
        X_tech, X_fund, y = [], [], []
        for i in range(60, len(tech_data)):
            X_tech.append(tech_scaled[i-60:i])
            X_fund.append(fund_scaled[i])
            y.append([
                tech_data['close'].pct_change().iloc[i],  # Price change
                tech_data['close'].rolling(5).std().iloc[i],  # Volatility
                tech_data['close'].iloc[i] / tech_data['close'].iloc[i-20] - 1  # Momentum
            ])
            
        return np.array(X_tech), np.array(X_fund), np.array(y)
    
    def train(self, X_tech, X_fund, y, epochs=100):
        """Train the hybrid model"""
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(0.0005),
            loss='mse',
            metrics=['mae']
        )
        
        history = self.model.fit(
            [X_tech, X_fund], y,
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
        # Preprocess input data
        X_tech = self.scalers['tech'].transform(tech_data)[-60:]
        X_fund = self.scalers['fund'].transform(fund_data.iloc[-1:])
        
        # Reshape for prediction
        X_tech = np.expand_dims(X_tech, axis=0)
        X_fund = np.expand_dims(X_fund, axis=0)
        
        # Make prediction
        return self.model.predict([X_tech, X_fund])
    
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
    X_tech, X_fund, y = trainer.preprocess_data(tech_data, fund_data)
    print("Starting model training...")
    trainer.train(X_tech, X_fund, y)
    trainer.save_model()
