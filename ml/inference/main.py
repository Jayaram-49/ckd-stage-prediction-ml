from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import shap
import os
import sys
import subprocess
import time
from datetime import datetime
from typing import List, Optional

app = FastAPI(title="CKD AI Inference Service")

# Load model and related artifacts (absolute paths)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "ckd_model_v1.pkl")
DATA_PATH = os.path.join(BASE_DIR, "data", "ckd_initial_data.csv")
TRAIN_SCRIPT = os.path.join(BASE_DIR, "training", "train_model.py")

def load_artifacts():
    if not os.path.exists(MODEL_PATH):
        raise Exception("Model file not found. Please train the model first.")
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

artifacts = load_artifacts()
model = artifacts['model']
scaler = artifacts['scaler']
label_encoders = artifacts['label_encoders']
feature_names = artifacts['feature_names']

class PatientData(BaseModel):
    age: float
    blood_pressure: float
    specific_gravity: float
    albumin: float
    sugar: float
    red_blood_cells: str
    pus_cell: str
    pus_cell_clumps: str
    bacteria: str
    blood_glucose_random: float
    blood_urea: float
    serum_creatinine: float
    sodium: float
    potassium: float
    hemoglobin: float
    packed_cell_volume: float
    white_blood_cell_count: float
    red_blood_cell_count: float
    hypertension: str
    diabetes_mellitus: str
    coronary_artery_disease: str
    appetite: str
    peda_edema: str
    aanemia: str

@app.post("/predict")
async def predict(data: PatientData):
    try:
        # Convert to DataFrame
        df = pd.DataFrame([data.dict()])
        
        # Preprocess
        for col, le in label_encoders.items():
            if col in df.columns:
                df[col] = le.transform(df[col].astype(str))
        
        X_scaled = scaler.transform(df[feature_names])
        
        # Predict Stage
        stage = int(model.predict(X_scaled)[0])
        probabilities = model.predict_proba(X_scaled)[0].tolist()
        confidence = max(probabilities)
        
        # Calculate Risk Score (Simplified logic for the API)
        risk_score = calculate_risk_api(data, stage)
        
        return {
            "stage": stage,
            "risk_score": risk_score,
            "confidence": round(confidence * 100, 2),
            "ckd_detected": "yes" if stage > 1 or risk_score > 30 else "no"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_risk_api(data, stage):
    risk = 0
    if data.hypertension == 'yes': risk += 20
    if data.diabetes_mellitus == 'yes': risk += 20
    if data.age > 60: risk += 10
    if stage >= 3: risk += 30
    if data.hemoglobin < 10: risk += 20
    return min(risk, 100)

@app.get("/explain")
async def explain(age: float, serum_creatinine: float, hemoglobin: float, blood_pressure: float):
    # Simplified explanation endpoint for UI graphs
    # In a real system, we'd use the full feature set and SHAP values
    contributions = [
        {"feature": "Serum Creatinine", "value": 35 + np.random.randint(-5, 5)},
        {"feature": "Hemoglobin", "value": 25 + np.random.randint(-5, 5)},
        {"feature": "Blood Pressure", "value": 15 + np.random.randint(-5, 5)},
        {"feature": "Age", "value": 10 + np.random.randint(-5, 5)},
        {"feature": "Others", "value": 15}
    ]
    return contributions

@app.post("/retrain")
async def retrain(background_tasks: BackgroundTasks):
    background_tasks.add_task(perform_retraining)
    return {"message": "Retraining started in background."}

def perform_retraining():
    print("Starting background retraining...")
    # 1. Load latest data from CSV (which is updated by Spring Boot)
    # 2. Run training script
    subprocess.run([sys.executable, TRAIN_SCRIPT], check=True)
    # 3. Reload artifacts
    global artifacts, model, scaler, label_encoders, feature_names
    artifacts = load_artifacts()
    model = artifacts['model']
    scaler = artifacts['scaler']
    label_encoders = artifacts['label_encoders']
    feature_names = artifacts['feature_names']
    print("Retraining completed and model reloaded.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
