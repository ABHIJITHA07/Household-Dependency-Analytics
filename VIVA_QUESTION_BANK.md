# VIVA VOCE TECHNICAL QUESTION BANK & EXPLANATION GUIDE

**Project Name:** Household Dependency Analytics & Prediction System  
**Phase:** Phase 13 — Final QA, Acceptance Testing & Viva Readiness  
**Target Audience:** Viva Examiners, Technical Reviewers & Academic Evaluators  
**Date:** October 9, 2026  

---

## Technical Q&A Directory

### Q1: What is the core architectural philosophy of this project?
**Answer:**  
The core philosophy is **"The backend calculates the truth, the ML model predicts vulnerability, and Gemini AI explains and suggests."**
- **Node.js Express Backend:** Computes deterministic, authoritative accounting formulas for demographic dependency and financial health.
- **Python FastAPI ML Microservice:** Evaluates overall household risk classification (`LOW`, `MEDIUM`, `HIGH`) using a trained Random Forest model.
- **Google Gemini API (`@google/genai`):** Generates de-identified, natural-language strategic financial advice and growth recommendations based on pre-computed metrics.

---

### Q2: Explain the 3-Tier request flow when a user opens the Analytics page.
**Answer:**  
1. **Frontend Request:** The React client sends `GET /api/households/:id/analytics` with a JWT bearer token.
2. **Auth & Authorization:** Express middleware validates the JWT token and verifies household ownership (`user_id === req.user.userId`).
3. **Backend Accounting Calculation:** The backend queries MySQL for household demographics and itemized expense totals, executing pure math functions (`analytics.engine.js`).
4. **ML Microservice Call:** Express sends a server-to-server POST request to the Python FastAPI microservice (`http://localhost:8000/predict`) passing 10 scaled numeric features.
5. **Response Synthesis:** Express combines the deterministic analytics, ML prediction object (`riskLevel`, `confidence`), and input hash into a unified JSON response sent back to React.

---

### Q3: What is the exact formula for Dependency Ratio and how are edge cases handled?
**Answer:**  
$$\text{Dependency Ratio} = \left( \frac{\text{Dependent Members}}{\text{Earning Members}} \right) \times 100$$
- **Normal Case:** If a household has 2 dependents and 2 earners, ratio is $(2 / 2) \times 100 = 100.00\%$.
- **Zero Earners Edge Case (`earningMembers === 0`):** Division by zero is prevented by explicitly returning `null` (never `Infinity` or `NaN`). The Dependency Level is automatically classified as `HIGH` with explanation text: *"Not computable (0 earning members). High demographic dependency risk."*

---

### Q4: How is Financial Condition classified, and how is zero income handled?
**Answer:**  
Financial Condition is classified deterministically based on Monthly Income, Net Savings ($\text{Income} - \text{Expenses}$), and Savings Rate ($\frac{\text{Savings}}{\text{Income}} \times 100$):
1. `NO_INCOME`: Triggered if `monthlyIncome === 0` (Savings Rate is returned as `null`).
2. `DEFICIT`: Triggered if `Savings < 0` (expenses exceed income).
3. `TIGHT`: Triggered if `Savings Rate < 10%`.
4. `MODERATE`: Triggered if `10% <= Savings Rate < 20%`.
5. `HEALTHY`: Triggered if `Savings Rate >= 20%`.

---

### Q5: How was the Machine Learning model trained, and why synthetic data?
**Answer:**  
The Random Forest model (`rf-v1.0.0`) was trained on a documented synthetic dataset of 1,000 households (`synthetic_households.csv`).
- **Dataset Rationale:** Real household micro-financial data is protected by privacy laws and unavailable for academic baseline development.
- **Academic Disclaimer:** The dataset uses synthetic distributions designed for demonstration and model evaluation. It is explicitly documented as non-representative of real-world populations.
- **Model Evaluation Results:** Evaluated on a 20% stratified test split (200 test households):
  - **Accuracy:** `79.00%`
  - **Precision (Macro):** `79.50%`
  - **Recall (Macro):** `79.44%`
  - **F1-Score (Macro):** `79.45%`

---

### Q6: How did you prevent Target Leakage during ML dataset generation?
**Answer:**  
Target leakage occurs when a model target is a trivial mathematical transformation of input features. To prevent this, the target label was generated using a **Continuous Latent Vulnerability Index ($V$) with stochastic noise**:
$$V = 1.2 \cdot Z(\text{Expense-to-Income}) + 1.0 \cdot Z(\text{Essential Ratio}) + 1.0 \cdot Z(\text{Dependency Load}) - 1.5 \cdot Z(\text{Savings Rate}) + \epsilon$$
where $\epsilon \sim N(0, 0.8^2)$ represents unobserved environmental and financial shocks. Households were discretized into quantiles (top 30% = `HIGH`, bottom 30% = `LOW`, middle 40% = `MEDIUM`). This ensures features are realistically correlated with risk while preventing target leakage.

---

### Q7: Why is Gemini AI NOT allowed to compute financial numbers or alter predictions?
**Answer:**  
Large Language Models (LLMs) are probabilistic text completion engines and are inherently prone to mathematical errors or hallucinations.
- **Backend Guardrails:** Deterministic financial formulas run exclusively in audited JavaScript code.
- **System Prompt Instructions:** Gemini's system prompt explicitly enforces: *"Do NOT calculate new metrics; use only the provided values. Never alter the ML prediction risk level or official backend metrics."*
- **Fail-Safe Design:** If Gemini is unreachable or rate-limited, the system catches the error and displays deterministic analytics and ML predictions uninterrupted.

---

### Q8: How does SHA-256 Canonical Input Hashing and AI caching work?
**Answer:**  
To prevent redundant API calls to Gemini and optimize latency:
1. **Canonical Input Construction:** The backend creates a standardized JSON string of all meaningful input metrics (`demographics`, `financials`, sorted `expenseCategoryBreakdown`).
2. **SHA-256 Digest:** Computes a 64-character hex hash (`crypto.createHash('sha256')`).
3. **Database Cache Check:** Queries `gemini_insights` table for a matching `input_hash` and `model_version`.
4. **Cache Invalidation:** If any household value or expense category changes, the computed SHA-256 hash changes, instantly invalidating stale insights and triggering a fresh generation.

---

### Q9: How do optional monthly snapshot records work, and why are they immutable?
**Answer:**  
- **Optional Snapshot:** Monthly snapshots are completely optional point-in-time financial records.
- **Snapshot Freeze:** When saved (`POST /api/households/:id/monthly-records`), the system freezes and stores active income, expenses, category breakdowns, ML risk level, and Gemini insights in the `monthly_records` table.
- **Immutability Guarantee:** Subsequent updates to active household data (e.g. updating current income or adding new expenses) modify `households` and `expenses` tables, leaving past `monthly_records` rows 100% untouched.

---

### Q10: How is server-side PDF report generation implemented?
**Answer:**  
PDF generation is implemented in Node.js using `pdfkit`.
- **Vector Rendering:** Renders vector banners, card layouts, table grids, headers, disclaimers, and page numbers directly in memory without headless browser overhead (Puppeteer/Chromium).
- **Streaming Response:** Streams the compiled binary PDF buffer directly to the client with headers `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="Household_Report_<id>.pdf"`.

---

### Q11: How do you enforce security and prevent cross-user data access?
**Answer:**  
1. **Authentication:** All private routes require a valid JWT token signed with `JWT_SECRET`.
2. **Ownership Verification:** All repository queries filter by both resource ID and `userId` (`WHERE id = ? AND user_id = ?`).
3. **Ownership-Safe 404:** If User B attempts to access User A's household, snapshot, or report, the server returns `404 Not Found` (rather than `403 Forbidden`) to prevent resource enumeration.
4. **SQL Injection Protection:** 100% parameterized queries using `mysql2/promise`.
5. **Secret Protection:** Zero API keys or secrets in frontend build artifacts or client code.

---

### Q12: What is the difference between Dependency Level, Financial Condition, and ML Risk Level?
**Answer:**  
They represent three distinct analytical dimensions:
1. **Dependency Level (`LOW`, `MEDIUM`, `HIGH`):** Purely demographic metric based on ratio of dependents to earners.
2. **Financial Condition (`HEALTHY`, `MODERATE`, `TIGHT`, `DEFICIT`, `NO_INCOME`):** Deterministic cash-flow metric based on monthly savings rate.
3. **ML Risk Level (`LOW`, `MEDIUM`, `HIGH`):** Statistical risk classification predicting holistic household vulnerability based on 10 combined demographic and financial features.

---

### Q13: What happens if the Python ML service goes down?
**Answer:**  
The Node backend catches ML connection errors using `AppError.serviceUnavailable` gracefully. The user still receives complete deterministic analytics (Dependency Ratio, Savings, Savings Rate, Financial Condition) and household management capabilities without system crashes.

---

### Q14: What automated test suites exist and what is the current regression coverage?
**Answer:**  
The project maintains 3 independent automated test suites:
1. **Backend Jest Suite (`backend/tests/`):** 7 test suites, **109/109 tests PASS** (Auth, Household, Expense, Analytics Engine, Insight Caching, Phase 12 Reports).
2. **Python FastAPI Pytest Suite (`ml-service/tests/`):** **21/21 tests PASS** (Model loading, feature scaling, prediction endpoint, input schema validation).
3. **Frontend Vitest Integration Suite (`frontend/src/test/`):** **8/8 tests PASS** (Auth flow, Household CRUD, Analytics rendering, disclaimers).
4. **Production Build:** Vite production bundle builds in **23.72s** with zero errors.

---

### Q15: What are the current limitations of the system and future work?
**Answer:**  
- **Synthetic ML Model:** Current ML model is trained on synthetic data; future work involves validating against anonymized national socio-economic survey datasets.
- **Single Currency:** Currently supports INR (₹); multi-currency conversion support can be added.
- **Offline Mode:** Requires internet connection for Gemini API insights; local micro-LLM integration (e.g. Ollama/Llama 3) could enable offline strategic guidance.
