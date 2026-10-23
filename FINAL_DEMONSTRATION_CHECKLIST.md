# FINAL DEMONSTRATION CHECKLIST

**Project Name:** Household Dependency Analytics & Prediction System  
**Phase:** Phase 13 — Final QA, Acceptance Testing & Viva Readiness  
**Target Audience:** Project Examiners, Evaluators & Viva Panel  
**Date:** October 9, 2026  

---

## 1. Demonstration Setup Prerequisites

Ensure all three application tiers are running locally before beginning the demonstration:

1. **MySQL Database:** Running on `localhost:3306` with database `household_dependency_db` initialized via `database/schema.sql`.
2. **FastAPI ML Microservice:** Running on `http://localhost:8000` (`.\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000`).
3. **Express Node Backend:** Running on `http://localhost:5000` (`npm run dev` in `backend/`).
4. **Vite React Frontend:** Running on `http://localhost:5173` (`npm run dev` in `frontend/`).

---

## 2. 15-Step End-to-End Demonstration Guide

| Step | Action | Execution Instructions | Expected Observable Outcome | Verification Status |
|---|---|---|---|---|
| **1** | **Open Landing Page** | Navigate browser to `http://localhost:5173`. | Peach × Pistachio × Cream landing hero screen displays system features, login button, and registration CTA. | **VERIFIED (PASS)** |
| **2** | **Register & Log In** | Click **Get Started**, register `demo_user1@example.com` (Name: "Demonstration User 1", Password: `Password123!`), and log in. | JWT token stored in browser session, user state updated, redirected automatically to `/dashboard`. | **VERIFIED (PASS)** |
| **3** | **Create Household** | Click **Create Household**. Enter Name: *"Kapoor Family Household"*, Location: *"Delhi NCR"*, Income: `₹120,000`, Total Members: `4`, Earning: `2`, Dependent: `2`, Children: `1`, Elderly: `1`. | Household created with ID; redirected to Household Detail workspace. Demographics grid updates immediately. | **VERIFIED (PASS)** |
| **4** | **Add Categorized Expenses** | Navigate to **Expenses** tab. Add 4 items:<br>1. Rent: `₹35,000` (Essential)<br>2. Food & Groceries: `₹15,000` (Essential)<br>3. School Fees: `₹10,000` (Essential)<br>4. Entertainment & Dining: `₹8,000` (Discretionary) | Expense table displays 4 items totaling `₹68,000` (`₹60,000` essential / `₹8,000` discretionary). Expense ratio progress bar updates. | **VERIFIED (PASS)** |
| **5** | **Inspect Analytics** | Navigate to **Analytics & Formulas** page. | Backend deterministic metrics display:<br>• **Dependency Ratio:** `100.00%` (2 dependents / 2 earners)<br>• **Dependency Level:** `MEDIUM`<br>• **Net Savings:** `₹52,000.00`<br>• **Savings Rate:** `43.33%`<br>• **Financial Condition:** `HEALTHY` (>= 20%) | **VERIFIED (PASS)** |
| **6** | **View ML Prediction** | View **ML Risk Assessment** section on Analytics page. | Supervised Random Forest model (`rf-v1.0.0`) returns predicted risk level `LOW` with confidence score (~85%) and top feature factors. | **VERIFIED (PASS)** |
| **7** | **Generate Gemini Insights** | Click **Generate AI Insights**. | Express calls Google GenAI (`gemini-2.5-flash`). 5 structured sections render (`Understand Household`, `Expense Review`, `Savings Stability`, `Growth Opportunities`, `Things to Monitor`) along with legal disclaimer. | **VERIFIED (PASS)** |
| **8** | **Save Monthly Snapshot** | Navigate to **Monthly Tracking**, click **Save Snapshot**, enter Month: `9`, Year: `2026`, Notes: *"September Baseline Snapshot"*. | Backend freezes point-in-time state (`monthly_records` table). Record appears in historical snapshots list. | **VERIFIED (PASS)** |
| **9** | **Modify Current Data** | Return to **Household Profile**. Update Monthly Income to `₹250,000`. Add a new expense: `HEALTHCARE` (`₹50,000`, Emergency Medical Plan). | Active household analytics update to show Income: `₹250,000` and Total Expenses: `₹118,000`. | **VERIFIED (PASS)** |
| **10** | **Verify Snapshot Immutability** | Reopen **Monthly Tracking** & click view on the 09/2026 historical snapshot. | Historical snapshot values remain strictly unchanged (Income: `₹120,000`, Expenses: `₹68,000`, Savings: `₹52,000`). Immutability confirmed. | **VERIFIED (PASS)** |
| **11** | **Generate CURRENT Report** | Navigate to **Reports & Export**, select **Current Live Profile Report**, click **Generate Report**. | Server builds live vector report containing active ₹250,000 income data. Metadata appears in reports list. | **VERIFIED (PASS)** |
| **12** | **Generate MONTHLY Report** | Select **Historical Monthly Snapshot Report**, pick `09/2026` snapshot, click **Generate Report**. | Server builds historical report containing frozen 09/2026 ₹120,000 income snapshot. Metadata appears in list. | **VERIFIED (PASS)** |
| **13** | **Preview & Download PDF** | Click **Preview** on report, then click **Download PDF**. | Executive report canvas renders on screen. PDF file downloads via binary stream attachment (`Household_Report_<id>.pdf`). PDF opens with clean styling, tables, disclaimers, and page numbers. | **VERIFIED (PASS)** |
| **14** | **Verify Auth Route Protection** | Click **Logout**. In browser address bar, type `http://localhost:5173/dashboard`. | Protected route middleware detects missing session token and redirects user back to `/login`. | **VERIFIED (PASS)** |
| **15** | **Verify Cross-User Isolation** | Register `demo_user2@example.com`, log in as User 2. Attempt to open `http://localhost:5173/households/1` or fetch User 1's report API endpoints directly. | Backend rejects request with ownership-safe `404 Not Found` response. User 2 cannot access or view User 1's data. | **VERIFIED (PASS)** |

---

## 3. Notes & Examiner Presentation Tips

- **Deterministic vs Probabilistic:** Always emphasize to examiners that core financial numbers (Dependency Ratio, Savings Rate, Financial Condition) are calculated with 100% precision by the Node backend math engine, NOT by AI.
- **Role of ML:** Explain that the Python Random Forest classifier predicts holistic household vulnerability risk based on multi-feature patterns.
- **Role of Gemini AI:** Explain that Gemini is strictly a natural-language advisor that interprets pre-calculated metrics without hallucinating or overriding backend calculations.
- **Privacy Assurance:** Emphasize that zero Personally Identifiable Information (PII) is ever sent to external LLMs.
