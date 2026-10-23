# Household Dependency Analytics & Prediction System

A full-stack, machine learning, and AI-assisted financial analytics web application built for academic evaluation, technical demonstration, and real working deployment.

---

## 🌟 Key Features

1. **Demographic Dependency Analytics:** Calculates official dependency ratio, dependency level (`LOW`, `MEDIUM`, `HIGH`), and handles 0 earner edge cases safely.
2. **Financial Health Analytics:** Computes savings, savings rate %, expense ratio %, essential vs non-essential spending, and financial condition.
3. **ML Household Risk Prediction:** Serves a Random Forest model via Python FastAPI predicting overall household risk status with model confidence estimates.
4. **Gemini AI Insights:** Server-side Google Gemini integration providing 5 structured insight sections cached via SHA-256 canonical input hashes.
5. **Optional Monthly Tracking:** Creates immutable point-in-time financial snapshots for historical trend analysis.
6. **Server-Side PDF Reports:** Renders downloadable PDF analytics reports using vector graphics (`pdfkit`).
7. **Secure Authentication:** JWT-based authentication with bcrypt password hashing and parameterized SQL protection.

---

## 🏗️ Architecture

```
React 18 + Vite (Frontend, Port 5173)
      │
      ▼ REST API (JWT)
Node.js + Express (Backend API, Port 5000)
      │
      ├───► MySQL 8 (Database, Port 3306)
      ├───► Python FastAPI (ML Service, Port 8000)
      └───► Google Gemini API (Server-Side @google/genai)
```

---

## 📁 Repository & Specification Index

For full technical specifications, refer to the documents in `files/`:

| Spec ID | Document Title | Focus Area |
|---|---|---|
| `00` | [00_PROJECT_MASTER_SPEC.md](./00_PROJECT_MASTER_SPEC.md) | Single Source of Truth & Principles |
| `07` | [07_DATABASE_DESIGN.md](./07_DATABASE_DESIGN.md) | MySQL DDL, Schema, Indexes, Constraints |
| `09` | [09_API_SPECIFICATION.md](./09_API_SPECIFICATION.md) | REST Endpoints, Payloads & Responses |
| `11` | [11_ANALYTICS_AND_FORMULAS.md](./11_ANALYTICS_AND_FORMULAS.md) | Deterministic Analytics & SHA-256 Hashing |
| `12` | [12_ML_PREDICTION_SPEC.md](./12_ML_PREDICTION_SPEC.md) | Random Forest Model, Dataset & FastAPI |
| `13` | [13_GEMINI_AI_INSIGHTS_SPEC.md](./13_GEMINI_AI_INSIGHTS_SPEC.md) | Gemini Integration, Caching & Fallback |
| `14` | [14_FRONTEND_UI_UX_SPEC.md](./14_FRONTEND_UI_UX_SPEC.md) | Biscoff Design Tokens & Layout Rules |
| `25` | [25_SETUP_AND_RUN_GUIDE.md](./25_SETUP_AND_RUN_GUIDE.md) | Step-by-Step Installation & Local Execution |
| `29` | [29_VIVA_TECHNICAL_EXPLANATION.md](./29_VIVA_TECHNICAL_EXPLANATION.md) | Viva voce Question & Answer Defense Guide |

---

## 🚀 Quick Start (Local Execution)

1. **Database:** Import `database/schema.sql` into MySQL 8.
2. **ML Microservice:**
   ```bash
   cd ml-service
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   python app/train.py
   uvicorn app.main:app --port 8000
   ```
3. **Node Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. **React Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Open browser at `http://localhost:5173`.
