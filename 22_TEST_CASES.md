# 22 — Test Cases Specification

Comprehensive repository of test cases for system validation.

---

## Test Cases Suite

### 1. Authentication (TC-AUTH)
- **TC-AUTH-01:** Register new user with valid inputs. Expected: `201 Created`, JWT returned.
- **TC-AUTH-02:** Register duplicate email. Expected: `409 Conflict`, error code `EMAIL_EXISTS`.
- **TC-AUTH-03:** Login with incorrect password. Expected: `401 Unauthorized`, error code `INVALID_CREDENTIALS`.
- **TC-AUTH-04:** Access protected route `/api/households` without Bearer token. Expected: `401 Unauthorized`.
- **TC-AUTH-05:** Access protected route with expired token. Expected: `401 Unauthorized`, error code `TOKEN_EXPIRED`.

### 2. Household & Demographics (TC-HH)
- **TC-HH-01:** Create valid household with 4 members, 2 earners, 2 dependents. Expected: `201 Created`.
- **TC-HH-02:** Create household where `earningMembers + dependentMembers > totalMembers`. Expected: `422 Unprocessable Entity` validation error.
- **TC-HH-03:** Delete household. Expected: `200 OK`, all related expenses and monthly records cascaded in DB.

### 3. Analytics & Calculation Edge Cases (TC-AN)
- **TC-AN-01 (Zero Earners):** Household with 0 earning members and 3 dependents. Expected: `dependencyRatio: null`, `dependencyLevel: "HIGH"`, explanation text explicitly notes 0 earners.
- **TC-AN-02 (Zero Income):** Household with 0 monthly income. Expected: `savingsRate: null`, `expenseRatio: null`, `financialCondition: "NO_INCOME"`. No `NaN` or `Infinity`.
- **TC-AN-03 (Deficit Spending):** Income ₹50,000, Expenses ₹70,000. Expected: `savings: -20000`, `financialCondition: "DEFICIT"`.

### 4. ML Prediction Service (TC-ML)
- **TC-ML-01:** Send 10 features to FastAPI `/predict`. Expected: `200 OK`, valid `predictedRiskLevel`, vote-share probabilities, top factors.
- **TC-ML-02 (ML Service Down):** Node backend receives connection refused from FastAPI service. Expected: Backend returns `503 ML_UNAVAILABLE`. Core analytics continue working.

### 5. Gemini AI Insights (TC-GEM)
- **TC-GEM-01:** Request insights for valid analytics hash. Expected: `200 OK`, 5 structured sections returned, cached in DB.
- **TC-GEM-02 (API Key Invalid / Service Offline):** Gemini call throws error. Expected: Backend catches exception, returns `503 AI_UNAVAILABLE`. Analytics and ML views remain available.

### 6. Monthly Snapshot Immutability (TC-MON)
- **TC-MON-01:** Save monthly snapshot for October 2026. Then update current household income from ₹50,000 to ₹80,000. Expected: Current analytics show ₹80,000, but historical record for October 2026 remains ₹50,000.
- **TC-MON-02 (Duplicate Month):** Save snapshot for October 2026 twice without `overwrite: true`. Expected: `409 Conflict`, error code `RECORD_EXISTS`.
