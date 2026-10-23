from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional

class PredictRequest(BaseModel):
    totalMembers: int = Field(..., ge=1, le=50, description="Total count of household members")
    earningMembers: int = Field(..., ge=0, le=50, description="Earning members count")
    dependentMembers: int = Field(..., ge=0, le=50, description="Dependent members count")
    childrenCount: int = Field(..., ge=0, le=50, description="Children count")
    elderlyCount: int = Field(..., ge=0, le=50, description="Elderly count")
    monthlyIncome: float = Field(..., ge=0.0, description="Total household monthly income in INR")
    totalExpenses: float = Field(..., ge=0.0, description="Total monthly expenses in INR")
    essentialRatio: float = Field(..., ge=0.0, le=1.0, description="Ratio of essential expenses to total expenses")
    savingsRate: float = Field(..., ge=-10.0, le=1.0, description="Ratio of savings to monthly income")
    expenseIncomeRatio: float = Field(..., ge=0.0, le=50.0, description="Ratio of total expenses to monthly income")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "totalMembers": 4,
                "earningMembers": 2,
                "dependentMembers": 2,
                "childrenCount": 1,
                "elderlyCount": 0,
                "monthlyIncome": 85000.0,
                "totalExpenses": 40000.0,
                "essentialRatio": 0.8,
                "savingsRate": 0.5294,
                "expenseIncomeRatio": 0.4706
            }
        }
    )

class PredictResponse(BaseModel):
    predictedRiskLevel: str = Field(..., description="Predicted household risk level: LOW, MEDIUM, or HIGH")
    probabilities: Dict[str, float] = Field(..., description="Model confidence estimate / vote share per class")
    topFactors: List[str] = Field(..., description="Top risk/safety factors derived from features")
    modelVersion: str = Field(..., description="Model artifact version string")
    modelMetadata: Optional[Dict] = Field(None, description="Model training & architecture metadata")
