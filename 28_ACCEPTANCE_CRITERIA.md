# 28 — Acceptance Criteria

Acceptance criteria checklist required for final system verification and project sign-off.

---

## Acceptance Criteria Matrix

### 1. Authentication & Security
- [ ] User can register with valid credentials (`POST /api/auth/register`).
- [ ] Duplicate email returns `409 Conflict` (`EMAIL_EXISTS`).
- [ ] User can log in with valid credentials, receiving JWT token.
- [ ] Invalid password returns `401 Unauthorized`.
- [ ] Unauthenticated requests to protected endpoints return `401 Unauthorized`.
- [ ] `GEMINI_API_KEY`, `JWT_SECRET`, and `ML_SERVICE_API_KEY` exist ONLY in backend `.env` and are never exposed to frontend code or client bundles.

### 2. Household & Expense Management
- [ ] User can create household profile with total, earning, dependent, children, and elderly counts.
- [ ] Cross-field validations reject invalid member sums (`earning + dependent > total`).
- [ ] User can add, edit, and delete expense items categorized into 11 categories.
- [ ] Backend recomputes total expenses from item list, ignoring client-supplied totals.

### 3. Deterministic Analytics Engine
- [ ] Dependency Ratio correctly computed as $(\text{Dependents} / \text{Earners}) \times 100$.
- [ ] Dependency Ratio returns `null` and `dependencyLevel = HIGH` when `earningMembers = 0` without division by zero errors.
- [ ] Savings correctly computed as $\text{Monthly Income} - \text{Total Expenses}$.
- [ ] Savings Rate and Expense Ratio correctly computed.
- [ ] Zero monthly income sets rates to `null` and `financialCondition = NO_INCOME` without `NaN` or `Infinity`.

### 4. Machine Learning Service Integration
- [ ] Python FastAPI service responds to `POST /predict` with `X-API-Key` auth.
- [ ] Returns predicted `riskLevel` (`LOW`, `MEDIUM`, `HIGH`), vote-share probabilities, and top factors.
- [ ] UI labels probabilities as "Model Confidence Estimate" and displays synthetic dataset disclaimer.
- [ ] ML service failure returns `503 ML_UNAVAILABLE`; core analytics remain operational.

### 5. Gemini AI Integration
- [ ] Backend calls Gemini via `@google/genai` with de-identified analytics JSON payload.
- [ ] Gemini output parsed into exact 5 structured JSON sections.
- [ ] Responses cached in `ai_insights` using SHA-256 canonical hash.
- [ ] Gemini API key invalid/offline returns `503 AI_UNAVAILABLE`; application functionality is unaffected.

### 6. Optional Monthly Tracking & Reports
- [ ] User can optionally save current household state as a monthly snapshot.
- [ ] Editing current household data DOES NOT modify previously saved monthly records.
- [ ] Saving duplicate month returns `409 Conflict` unless `overwrite = true`.
- [ ] PDF report generated server-side via PDFKit for both CURRENT and MONTHLY report types.
- [ ] Download PDF returns valid binary stream (`application/pdf`).

### 7. User Interface & Aesthetics
- [ ] Biscoff / Cream / Caramel color theme (`#F8F1E7`, `#F3E4CF`, `#D8B38A`, `#B98255`, `#6B4A35`).
- [ ] No neon or generic purple "AI dashboard" styles.
- [ ] Responsive layout across Mobile (360px), Tablet (768px), and Desktop (1024px+).
- [ ] All data pages implement Loading, Empty, Error, and Success UI states.
