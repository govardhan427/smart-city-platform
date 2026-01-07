import pandas as pd # used ONLY locally for generating data
import joblib
import random
import os
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime, timedelta

# --- 1. SETUP PATHS ---
# This ensures the model is saved exactly where Django looks for it
# Get the current directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# If your app name is 'parking', use 'parking'. If 'transport', use 'transport'.
# Based on your previous code, it seems your app folder is 'parking'.
APP_NAME = 'parking' 
MODEL_DIR = os.path.join(BASE_DIR) # Since this script is INSIDE the app folder, BASE_DIR is correct
MODEL_PATH = os.path.join(MODEL_DIR, 'parking_model.pkl')

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def generate_dummy_data(rows=2000):
    """
    Generates fake historical parking data.
    """
    data = []
    start_date = datetime.now() - timedelta(days=365)

    for _ in range(rows):
        random_days = random.randint(0, 365)
        current_date = start_date + timedelta(days=random_days)
        
        day_of_week = current_date.weekday() # 0=Mon, 6=Sun
        hour = random.randint(6, 23)         # 6 AM - 11 PM
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # --- Ground Truth Logic ---
        occupancy = random.randint(10, 30) # Base
        
        # Peak Hours (5 PM - 8 PM)
        if 17 <= hour <= 20:
            occupancy += random.randint(30, 50)
        
        # Weekend Bump
        if is_weekend:
            occupancy += random.randint(10, 20)

        occupancy = min(100, occupancy)
        data.append([day_of_week, hour, is_weekend, occupancy])

    return pd.DataFrame(data, columns=['day_of_week', 'hour', 'is_weekend', 'occupancy_percent'])

def train():
    print("🤖 Generating synthetic training data...")
    df = generate_dummy_data()
    
    # --- CRITICAL CHANGE FOR VERCEL ---
    # Convert to Numpy Arrays (.values) before training.
    # This ensures the saved model does NOT depend on Pandas.
    X = df[['day_of_week', 'hour', 'is_weekend']].values 
    y = df['occupancy_percent'].values

    print("🧠 Training Random Forest Regressor (Numpy Mode)...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    print(f"💾 Saving model to: {MODEL_PATH}")
    joblib.dump(model, MODEL_PATH)
    print("✅ Model Trained without Pandas dependency!")

if __name__ == "__main__":
    train()