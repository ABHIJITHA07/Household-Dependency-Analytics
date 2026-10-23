import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, Security, Depends
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import joblib

from app.schemas.predict import PredictRequest, PredictResponse
from app.train import train_model

load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model_artifact()
    yield

app = FastAPI(
    title="Household Dependency Risk Prediction Service",
    description="Private Machine Learning Microservice serving Random Forest prediction model",
    version="1.0.0",
    lifespan=lifespan
)

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

MODEL_PATH = os.getenv("MODEL_PATH", "app/models/rf_model.joblib")
ML_SERVICE_API_KEY = os.getenv("ML_SERVICE_API_KEY", "internal_ml_service_secret_api_key_2026")

model_artifact = None

def get_model_artifact():
    global model_artifact
    if model_artifact is None:
        if not os.path.exists(MODEL_PATH):
            print(f"Model file not found at {MODEL_PATH}, running auto-training...")
            model_artifact = train_model(model_output_path=MODEL_PATH)
        else:
            model_artifact = joblib.load(MODEL_PATH)
    return model_artifact

def verify_api_key(api_key: Optional[str] = Depends(api_key_header)):
    if ML_SERVICE_API_KEY and api_key != ML_SERVICE_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing ML service API key"
        )
    return api_key

def generate_top_factors(req: PredictRequest) -> List[str]:
    factors = []
    if req.savingsRate >= 0.30:
        factors.append("Model-associated factor: High savings rate (>30%) correlates with lower risk")
    elif req.savingsRate < 0:
        factors.append("Model-associated factor: Negative savings rate indicates monthly budget deficit")
    elif req.savingsRate < 0.10:
        factors.append("Model-associated factor: Tight savings rate (<10%) offers minimal financial cushion")

    if req.dependentMembers > req.earningMembers:
        factors.append("Model-associated factor: High dependent-to-earner ratio increases demographic vulnerability")
    elif req.dependentMembers <= req.earningMembers:
        factors.append("Model-associated factor: Balanced earner-to-dependent ratio")

    if req.essentialRatio > 0.80:
        factors.append("Model-associated factor: High proportion of essential expenses (>80%) restricts spending flexibility")

    if req.monthlyIncome == 0:
        factors.append("Model-associated factor: Zero monthly income reported")

    if not factors:
        factors.append("Model-associated factor: Standard household demographic and financial parameters")

    return factors

@app.get("/")
def read_root():
    return {
        "service": "Household Risk ML Prediction Service",
        "status": "RUNNING"
    }

@app.get("/health")
def health_check():
    artifact = get_model_artifact()
    return {
        "status": "UP",
        "service": "ml-prediction-service",
        "modelLoaded": artifact is not None,
        "modelVersion": artifact.get("version", "rf-v1.0.0") if artifact else "UNKNOWN",
        "metrics": artifact.get("metrics") if artifact else None
    }

@app.post("/predict", response_model=PredictResponse)
def predict_household_risk(
    req: PredictRequest,
    api_key: str = Depends(verify_api_key)
):
    try:
        artifact = get_model_artifact()
        scaler = artifact["scaler"]
        model = artifact["model"]
        classes = artifact["classes"]
        features = artifact["features"]
        version = artifact.get("version", "rf-v1.0.0")

        # Feature DataFrame in exact trained feature order
        feature_df = pd.DataFrame([{
            "total_members": req.totalMembers,
            "earning_members": req.earningMembers,
            "dependent_members": req.dependentMembers,
            "children_count": req.childrenCount,
            "elderly_count": req.elderlyCount,
            "monthly_income": req.monthlyIncome,
            "total_expenses": req.totalExpenses,
            "essential_ratio": req.essentialRatio,
            "savings_rate": req.savingsRate,
            "expense_income_ratio": req.expenseIncomeRatio
        }])[features]

        X_scaled = scaler.transform(feature_df)

        pred_class = str(model.predict(X_scaled)[0])
        pred_probs = model.predict_proba(X_scaled)[0]

        probabilities = {
            cls: round(float(prob), 4)
            for cls, prob in zip(classes, pred_probs)
        }

        top_factors = generate_top_factors(req)

        return PredictResponse(
            predictedRiskLevel=pred_class,
            probabilities=probabilities,
            topFactors=top_factors,
            modelVersion=version,
            modelMetadata={
                "features": features,
                "metrics": artifact.get("metrics")
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction execution failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)
