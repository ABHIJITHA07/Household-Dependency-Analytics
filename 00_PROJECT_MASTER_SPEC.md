# 00 — Project Master Specification

**Project:** Household Dependency Analytics & Prediction System
**Type:** College Full Stack Development project
**Audience:** AI coding agent *Antigravity*, project team, evaluators

> **Authority rule.** This file is the single source of truth. If any other file disagrees with this file, **this file wins**. For details this file only indexes, the owning file wins: formulas → `11`, database → `07`, API → `09`, ML → `12`, Gemini → `13`. If two files still conflict, stop and report the conflict instead of guessing.

---

## 1. One-sentence principle

> **The backend calculates the truth. The ML model predicts. Gemini explains and suggests.**

```
                    HOUSEHOLD USER
                          │
                          ▼
                   REACT FRONTEND  (never calls Python or Gemini)
                          │  REST /api/*  (JWT)
                          ▼
                  NODE + EXPRESS  (single public backend)
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
       MYSQL          ANALYTICS         PYTHON FASTAPI
      DATABASE          ENGINE          ML SERVICE (private)
                    (pure functions)         │
                          │                  ▼
                          │           RISK PREDICTION
                          └────────┬─────────┘
                                   ▼
                              GEMINI API  (called only by Node)
                                   │
                                   ▼
                          EXPLANATIONS & SUGGESTIONS
                                   │
                                   ▼
                       DASHBOARD  →  PDF REPORTS
```

Flow: **Household data → Analytics → Prediction → Intelligent growth suggestions → optional history → optional report.**

## 2. Responsibilities (never blur these)

| Layer | Does | Must NOT do |
|---|---|---|
| Analytics engine (Node, pure functions) | Dependency ratio, savings, savings rate, expense ratio, essential/non-essential totals, levels, deterministic explanation text, input hashes | Call external services |
| ML service (Python) | Predict household **risk level** (LOW/MEDIUM/HIGH) from backend-computed features | Recompute official metrics, touch the database, be called by the browser |
| Gemini (via Node only) | Explanation + improvement/growth suggestions as structured JSON | Calculate numbers, override the ML result, invent values, promise returns |
| React | Display, forms, client-side pre-validation | Hold secrets, call Python/Gemini, trust its own totals |
| MySQL | Persist users, households, expenses, history, predictions, insights, report metadata | Store derived values that can be recomputed (except documented snapshots) |

## 3. Three different "levels" (do not confuse them)

| Name | Source | Values | Meaning |
|---|---|---|---|
| **Dependency Level** | Deterministic rule on dependency ratio | LOW / MEDIUM / HIGH | Household *structure* only |
| **Financial Condition** | Deterministic rule on savings rate | HEALTHY / MODERATE / TIGHT / DEFICIT / NO_INCOME | Monthly cash-flow situation |
| **Household Risk Level** (the prediction) | ML model | LOW / MEDIUM / HIGH | Combined analytical estimate across demographic + financial features |

The dependency ratio alone never determines financial health. The UI always labels these three separately.

## 4. Fixed decisions registry

### 4.1 Technology stack
| Concern | Choice |
|---|---|
| Frontend | React 18 + Vite, react-router-dom v6, axios, Chart.js + react-chartjs-2, plain CSS with CSS variables |
| State | React Context (`AuthContext`, `HouseholdContext`) + custom hooks. **No Redux.** |
| Backend | Node.js 20 LTS + Express 4 (CommonJS or ESM — pick one and stay consistent; default **ES modules**) |
| DB access | `mysql2/promise` with parameterized queries, repository layer, **no ORM** |
| Validation | `zod` (backend, authoritative); hand-written mirror validators in frontend |
| Auth | bcryptjs (cost 12) + JWT (HS256) via `jsonwebtoken` |
| Database | MySQL 8.0.16+ (CHECK constraints enforced) |
| ML | Python 3.11, pandas, numpy, scikit-learn, joblib, FastAPI, uvicorn |
| AI | Google Gemini via server-side `@google/genai` SDK (model name from `GEMINI_MODEL`) |
| PDF | `pdfkit` (server-side, vector charts drawn by code — no native canvas dependency) |
| Security libs | `helmet`, `cors`, `express-rate-limit` |
| Tests | Jest + Supertest (backend), Vitest + React Testing Library (frontend), pytest (ML) |

### 4.2 Ports (local)
Frontend `5173` · Backend `5000` · ML service `8000` · MySQL `3306`.

### 4.3 Enums (exact spellings, used in DB, API, UI)
- `DependencyLevel`: `LOW | MEDIUM | HIGH`
- `FinancialCondition`: `HEALTHY | MODERATE | TIGHT | DEFICIT | NO_INCOME`
- `RiskLevel`: `LOW | MEDIUM | HIGH`
- `ExpenseCategory`: `HOUSING | FOOD | EDUCATION | HEALTHCARE | TRANSPORTATION | UTILITIES | INSURANCE | DEBT | ENTERTAINMENT | SHOPPING | OTHER`
- `ReportType`: `CURRENT | MONTHLY`

Display labels: Housing / Rent, Food, Education, Healthcare, Transportation, Utilities, Insurance, Debt / Loans, Entertainment, Shopping, Other.

### 4.4 Formulas (full detail in `11`)
```
DependencyRatio  = DependentMembers / EarningMembers × 100          (EarningMembers = 0 → null, level HIGH)
Savings          = MonthlyIncome − TotalExpenses
SavingsRate      = Savings / MonthlyIncome × 100                    (Income = 0 → null)
ExpenseRatio     = TotalExpenses / MonthlyIncome × 100              (Income = 0 → null)
DependencyLevel  = LOW if ratio < 50 · MEDIUM if 50 ≤ ratio ≤ 100 · HIGH if ratio > 100
FinancialCondition: NO_INCOME if income = 0 · DEFICIT if savings < 0 · TIGHT if rate < 10 · MODERATE if rate < 20 · HEALTHY otherwise
```
`TotalExpenses` is always the **sum of expense items** recalculated by the backend.

### 4.5 Database tables
`users`, `households`, `expenses`, `monthly_records`, `predictions`, `ai_insights`, `reports` (demographics live as columns of `households`; the prompt's optional `household_members` table is intentionally **not** created).

### 4.6 API index (prefix `/api`, JSON, camelCase, success wrapper `{ "data": … }`)
| # | Method | URL | Purpose |
|---|---|---|---|
| 1 | GET | `/api/health` | Liveness |
| 2 | POST | `/api/auth/register` | Register |
| 3 | POST | `/api/auth/login` | Login |
| 4 | GET | `/api/auth/me` | Current user |
| 5 | POST | `/api/auth/logout` | Logout (stateless acknowledgement) |
| 6 | PUT | `/api/auth/profile` | Update name |
| 7 | PUT | `/api/auth/password` | Change password |
| 8 | GET | `/api/households` | List user's households |
| 9 | POST | `/api/households` | Create (optionally with expenses) |
| 10 | GET | `/api/households/:id` | Get with expenses |
| 11 | PUT | `/api/households/:id` | Update household fields |
| 12 | DELETE | `/api/households/:id` | Delete (cascade) |
| 13 | GET | `/api/households/:id/expenses` | List expenses |
| 14 | POST | `/api/households/:id/expenses` | Add expense |
| 15 | PUT | `/api/households/:id/expenses/:expenseId` | Edit expense |
| 16 | DELETE | `/api/households/:id/expenses/:expenseId` | Delete expense |
| 17 | GET | `/api/households/:id/analytics` | Deterministic analytics |
| 18 | POST | `/api/households/:id/predict` | Run/return ML prediction |
| 19 | GET | `/api/households/:id/predictions/latest` | Latest stored prediction |
| 20 | POST | `/api/households/:id/insights` | Generate/return Gemini insights |
| 21 | GET | `/api/households/:id/insights/latest` | Latest stored insights |
| 22 | POST | `/api/households/:id/monthly-records` | Save optional monthly snapshot |
| 23 | GET | `/api/households/:id/monthly-records` | List snapshots |
| 24 | GET | `/api/households/:id/monthly-records/:recordId` | One snapshot |
| 25 | DELETE | `/api/households/:id/monthly-records/:recordId` | Delete snapshot |
| 26 | POST | `/api/households/:id/reports` | Generate report record (CURRENT or MONTHLY) |
| 27 | GET | `/api/households/:id/reports` | List reports |
| 28 | GET | `/api/reports/:reportId` | Report detail / preview data |
| 29 | GET | `/api/reports/:reportId/download` | PDF download |
| 30 | DELETE | `/api/reports/:reportId` | Delete report record |

ML service (private, called only by Node): `GET /health`, `GET /model-info`, `POST /predict`, header `X-API-Key`.

### 4.7 Frontend routes
`/` · `/register` · `/login` · `/dashboard` · `/households` · `/households/new` · `/households/:householdId` · `/households/:householdId/edit` · `/households/:householdId/expenses` · `/households/:householdId/analytics` · `/households/:householdId/prediction` · `/households/:householdId/insights` · `/households/:householdId/history` · `/households/:householdId/reports` · `/reports/:reportId` · `/settings`

### 4.8 Global conventions
- Currency: INR, `₹`, formatted with `Intl.NumberFormat('en-IN')`. Stored as `DECIMAL(12,2)`. Percentages rounded to 2 dp for output only.
- Timestamps: UTC in DB (`DATETIME`), ISO-8601 in API, displayed in the browser's local time.
- Error body: `{ "error": { "code": "…", "message": "…", "details": [ { "field": "…", "message": "…" } ] } }`.
- Ownership: a user may only access their own households; foreign/nonexistent ids both return `404 NOT_FOUND`.
- Monthly tracking and reports are **optional**; nothing in the core flow depends on them.

## 5. Document map
| File | Topic |
|---|---|
| 01–02 | Overview, problem, objectives, scope |
| 03–04 | Functional / non-functional requirements |
| 05–06 | Flows, architecture |
| 07–08 | Database, ER |
| 09–10 | API, authentication |
| 11–13 | Formulas, ML, Gemini |
| 14–16 | UI/UX, pages, components |
| 17–18 | Monthly tracking, reports |
| 19–20 | Errors/validation, security |
| 21–22 | Testing |
| 23–26 | Folders, env, setup, deployment |
| 27–28 | Antigravity guide, acceptance criteria |
| 29 | Viva explanation |

## 6. Global assumptions
1. One household = one **current** state (income, members, expense items). History exists only if the user saves it.
2. `earning + dependent ≤ total members`; the remaining members are "other members" (neither earning nor dependent). Children and elderly are demographic counts that **may overlap** with earning/dependent (e.g., a working elderly member) and only need `children + elderly ≤ total`.
3. Expense items are **monthly** amounts.
4. Users enter their own essential/non-essential classification; the app never overrides it.
5. The ML model is trained on **synthetic** data and gives an analytical estimate, not a forecast of real outcomes.
6. Suggestions are general educational information, not licensed financial advice.

## 7. Explicit non-goals
Microservices beyond the one ML service, Redis/Kafka/Kubernetes, social login, multi-currency, bank integrations, mobile apps, real-time sync, mandatory monthly entry, Gemini-computed numbers.
