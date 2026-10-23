# 12 — Machine Learning Prediction Specification

## 1. Overview & Objective
The Machine Learning service predicts the overall **Household Risk Level** (`LOW`, `MEDIUM`, `HIGH`). It is implemented as an isolated Python FastAPI microservice that exposes a secure `/predict` REST endpoint.

> **Target Leakage Prevention Rule:** The ML target is household vulnerability/risk status. The exact `dependency_ratio` is **NOT** used as an input feature or as the direct classification label.

---

## 2. Model Features Specification (10 Input Features)

The Node.js backend extracts and constructs the 10 numeric features before forwarding them to the FastAPI ML service:

| # | Feature Name | Description | Range / Unit |
|---|---|---|---|
| 1 | `total_members` | Total count of household members | 1 – 50 |
| 2 | `earning_members` | Earning members count | 0 – 50 |
| 3 | `dependent_members` | Dependent members count | 0 – 50 |
| 4 | `children_count` | Children count | 0 – 50 |
| 5 | `elderly_count` | Elderly count | 0 – 50 |
| 6 | `monthly_income` | Total household monthly income | $\ge 0$ (INR) |
| 7 | `total_expenses` | Total monthly expenses | $\ge 0$ (INR) |
| 8 | `essential_ratio` | $\text{Essential Expenses} / \text{Total Expenses}$ | 0.0 – 1.0 |
| 9 | `savings_rate` | $\text{Savings} / \text{Monthly Income}$ | $-2.0$ to $1.0$ (clipped) |
| 10 | `expense_income_ratio` | $\text{Total Expenses} / \text{Monthly Income}$ | $0.0$ to $3.0$ (clipped) |

---

## 3. Synthetic Dataset Generation (`train.py`)

Since real-world demographic financial census data with household risk labels is restricted/unavailable, a documented **synthetic dataset** of 1,000 households is generated via Python (`pandas`, `numpy`).

### Dataset Generator Rules & Code
```python
import numpy as np
import pandas as pd

np.random.seed(42)
n_samples = 1000

total_members = np.random.randint(1, 10, size=n_samples)
earning_members = np.array([np.random.randint(0, m + 1) for m in total_members])
dependent_members = total_members - earning_members
children_count = np.array([np.random.randint(0, m + 1) for m in dependent_members])
elderly_count = dependent_members - children_count

monthly_income = np.random.uniform(15000, 200000, size=n_samples)
# Zero income for 5% of households
zero_inc_idx = np.random.choice(n_samples, size=int(0.05 * n_samples), replace=False)
monthly_income[zero_inc_idx] = 0.0

total_expenses = np.where(
    monthly_income > 0,
    monthly_income * np.random.uniform(0.3, 1.2, size=n_samples),
    np.random.uniform(10000, 40000, size=n_samples)
)

essential_ratio = np.random.uniform(0.5, 0.95, size=n_samples)
savings = monthly_income - total_expenses
savings_rate = np.where(monthly_income > 0, savings / monthly_income, -1.0)
expense_income_ratio = np.where(monthly_income > 0, total_expenses / monthly_income, 2.0)

# Target synthetic labeling rule (Holistic Risk)
# HIGH risk: negative savings OR (earning == 0) OR (savings_rate < 0.05 and dependent > 2)
# LOW risk: savings_rate > 0.30 and dependent <= earning
# MEDIUM risk: otherwise
conditions = [
    (monthly_income == 0) | (savings < 0) | (earning_members == 0) | ((savings_rate < 0.05) & (dependent_members > 2)),
    (savings_rate >= 0.30) & (dependent_members <= earning_members)
]
choices = ['HIGH', 'LOW']
risk_level = np.select(conditions, choices, default='MEDIUM')

df = pd.DataFrame({
    'total_members': total_members,
    'earning_members': earning_members,
    'dependent_members': dependent_members,
    'children_count': children_count,
    'elderly_count': elderly_count,
    'monthly_income': monthly_income,
    'total_expenses': total_expenses,
    'essential_ratio': essential_ratio,
    'savings_rate': savings_rate,
    'expense_income_ratio': expense_income_ratio,
    'risk_level': risk_level
})

df.to_csv('app/data/synthetic_households.csv', index=False)
```

---

## 4. Model Training & Evaluation Setup

- **Model:** `RandomForestClassifier` (`n_estimators=100`, `max_depth=6`, `random_state=42`)
- **Split:** $80\%$ Train, $20\%$ Test (Stratified)
- **Scaler:** `StandardScaler` fitted on training set
- **Artifact Output:** Model pipeline saved as `app/models/rf_model.joblib` containing both scaler and classifier.
- **Evaluation Target Metrics:** Precision $\ge 0.85$, Recall $\ge 0.85$, F1-Score $\ge 0.85$.

---

## 5. FastAPI Private API Contract

### Request: `POST /predict`
- **Headers:** `X-API-Key: <ML_SERVICE_API_KEY>`
- **Request Body:**
  ```json
  {
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
  ```

### Response: `200 OK`
```json
{
  "predictedRiskLevel": "LOW",
  "probabilities": {
    "LOW": 0.85,
    "MEDIUM": 0.12,
    "HIGH": 0.03
  },
  "topFactors": [
    "High savings rate (>50%) provides strong financial security",
    "Balanced earner-to-dependent ratio"
  ],
  "modelVersion": "rf-v1.0.0"
}
```

---

## 6. Model Limitations & UI Terminology Rules

1. **Probability Terminology:** Output probabilities MUST be labeled as **"Model Confidence Estimate / Vote Share"** in the UI. Never present them as "Guaranteed Future Outcome".
2. **Synthetic Data Disclaimer:** The UI MUST display:
   > *"Notice: The 1,000-household dataset is synthetic and designed for demonstration, model-development, and academic evaluation. Its distributions are assumptions created for this project and must not be interpreted as representative of real-world household populations."*
