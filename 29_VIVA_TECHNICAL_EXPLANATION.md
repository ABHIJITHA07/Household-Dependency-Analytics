# 29 — Viva Technical Explanation & Defense Guide

Technical cheat-sheet for answering questions during project evaluation and Viva voce examination.

---

## Core Viva Questions & Technical Answers

### Q1: What is the core architectural principle of your project?
**Answer:** The core principle is **"The backend calculates the truth, the ML model predicts, and Gemini explains and suggests."**
- **Node.js Backend:** Evaluates deterministic formulas for demographic dependency and financial health.
- **Python FastAPI ML Service:** Predicts overall household risk level (`LOW`, `MEDIUM`, `HIGH`) using a Random Forest classifier.
- **Google Gemini API:** Generates natural language explanations and practical growth recommendations from pre-computed metrics.

---

### Q2: What is the difference between Dependency Level, Financial Condition, and ML Risk Level?
**Answer:** They represent three completely distinct concepts:
1. **Dependency Level:** Purely structural demographic metric based on ratio of dependents to earners ($\text{LOW} < 50\%$, $\text{MEDIUM } 50-100\%$, $\text{HIGH} > 100\%$).
2. **Financial Condition:** Deterministic monthly cash-flow health based on savings rate ($\text{HEALTHY}$, $\text{MODERATE}$, $\text{TIGHT}$, $\text{DEFICIT}$, $\text{NO\_INCOME}$).
3. **ML Household Risk Level:** Predictive classification (`LOW`, `MEDIUM`, `HIGH`) combining 10 demographic and financial features through a Random Forest model.

---

### Q3: Did you train your ML model on real demographic data or synthetic data? How did you avoid target leakage?
**Answer:** The model was trained on a documented **synthetic dataset of 1,000 households** generated via Python (`numpy`/`pandas`) using realistic demographic and financial distributions.
- **Target Leakage Prevention:** The target label is *overall household vulnerability/risk status*, derived from holistic financial resilience (savings rate, expense ratio, essential ratio, member load). The exact `dependency_ratio` is **not** used as an input feature or target label.

---

### Q4: Why is Gemini NOT allowed to calculate analytics or override ML predictions?
**Answer:** Large Language Models (LLMs) are probabilistic text generators and are prone to hallucinations or math errors. Deterministic business logic must run in audited JavaScript/Python code. Gemini's role is strictly limited to explaining already calculated numbers and providing educational growth suggestions.

---

### Q5: How do you handle security, API keys, and sensitive user data?
**Answer:**
1. **Secret Isolation:** `GEMINI_API_KEY`, `JWT_SECRET`, and `ML_SERVICE_API_KEY` are stored strictly in server-side `.env` files and never exposed to the frontend bundle.
2. **SQL Injection Protection:** All database operations use parameterized prepared statements (`mysql2/promise`).
3. **Password Security:** User passwords hashed using `bcryptjs` (cost factor 12).
4. **Privacy:** Gemini receives zero PII (no names, emails, addresses, or free text).

---

### Q6: How do optional monthly records work and why are they immutable?
**Answer:** Monthly records are point-in-time historical snapshots. When a user clicks *"Save as Monthly Record"*, the backend freezes and persists the active state. Subsequent changes to current household data do NOT alter past monthly records, preserving historical financial integrity.

---

### Q7: How is PDF generation handled?
**Answer:** Server-side using `pdfkit` in Node.js. It renders vector graphics, headers, tables, and text natively in code, eliminating heavy headless browser (Puppeteer) overhead and allowing fast streaming downloads.
