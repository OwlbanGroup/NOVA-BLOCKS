try:
    import tensorflow as tf
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    TF_AVAILABLE = True
except ImportError:
    print("Warning: TensorFlow not available - using fallback mode")
    TF_AVAILABLE = False

try:
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    print("Warning: scikit-learn not available - some functionality limited")
    SKLEARN_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    print("Warning: matplotlib not available - plotting disabled")
    MATPLOTLIB_AVAILABLE = False

import pandas as pd
import numpy as np

class OptionsAITrainer:
    def __init__(self, data_path):
        self.data_path = data_path
        self.model = self._build_model()
        self.history = None
        
    def _build_model(self):
        """Construct neural network architecture"""
        if not TF_AVAILABLE:
            raise ImportError("TensorFlow is required for model building")
            
        try:
            model = tf.keras.Sequential([
                LSTM(128, return_sequences=True, input_shape=(30, 10)),
                Dropout(0.2),
                LSTM(64),
                Dropout(0.2),
                Dense(32, activation='relu'),
                Dense(3, activation='linear')  # Predicts [premium, optimal_strike, probability]
            ])
            
            model.compile(
                optimizer=tf.keras.optimizers.Adam(0.001),
                loss='mse',
                metrics=['mae']
            )
            return model
        except Exception as e:
            print(f"Error building model: {str(e)}")
            return None
            
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
        """Train the model"""
        X, y = self.load_and_preprocess()
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)
        
        self.history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(patience=5),
                tf.keras.callbacks.ModelCheckpoint('best_model.h5')
            ]
        )
        
    def evaluate(self):
        """Evaluate model performance"""
        if self.history is None:
            raise ValueError("Model must be trained first")
            
        metrics = {
            'final_train_loss': self.history.history['loss'][-1],
            'final_val_loss': self.history.history['val_loss'][-1],
            'best_epoch': np.argmin(self.history.history['val_loss']) + 1
        }
        
        if MATPLOTLIB_AVAILABLE:
            try:
                import matplotlib.pyplot as plt
                plt.plot(self.history.history['loss'], label='Training Loss')
                plt.plot(self.history.history['val_loss'], label='Validation Loss')
                plt.legend()
                plt.savefig('training_history.png')
                plt.close()
            except Exception as e:
                print(f"Warning: Could not generate plots - {str(e)}")
        
        return metrics
            
    def save_model(self, path='options_ai_model.h5'):
        """Save trained model"""
        self.model.save(path)
        print(f"Model saved to {path}")

if __name__ == "__main__":
    trainer = OptionsAITrainer('historical_options_data.csv')
    print("Starting model training...")
    trainer.train(epochs=50)
    metrics = trainer.evaluate()
    print(f"Training completed. Best validation loss: {metrics['final_val_loss']:.4f}")
    trainer.save_model()
