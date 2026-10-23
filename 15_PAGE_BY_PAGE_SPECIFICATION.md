# 15 — Page-by-Page Specification

Detailed specification for all 14 pages of the application.

---

## Page Matrix & Specifications

### 1. Landing Page (`/`)
- **Purpose:** Introduce the application, key value props, and login/register calls to action.
- **Layout:** Hero section with Biscoff theme visuals, feature cards, sample analytics preview, footer.
- **API Calls:** None.

### 2. Register Page (`/register`)
- **Purpose:** User account creation.
- **Layout:** Centered card form (Name, Email, Password, Confirm Password).
- **Validation:** Name $\ge 2$ chars, valid email, password $\ge 8$ chars, passwords match.
- **API Calls:** `POST /api/auth/register`. On success: save JWT, navigate to `/dashboard`.

### 3. Login Page (`/login`)
- **Purpose:** User authentication.
- **Layout:** Centered card form (Email, Password).
- **API Calls:** `POST /api/auth/login`. On success: save JWT, navigate to `/dashboard`.

### 4. Dashboard (`/dashboard`)
- **Purpose:** High-level summary of active household's financial health, dependency indicators, and recent updates.
- **Layout:** Top active-household selector bar, 4 summary metric cards, quick action links, mini trend preview.
- **API Calls:** `GET /api/households`, `GET /api/households/:id/analytics`.

### 5. Household List (`/households`)
- **Purpose:** Manage multiple household profiles owned by the user.
- **Layout:** Grid of household cards displaying members, income, active status badge, and "Set Active" button.
- **API Calls:** `GET /api/households`, `DELETE /api/households/:id`.

### 6. Add/Edit Household (`/households/new`, `/households/:id/edit`)
- **Purpose:** Create or edit demographic and income parameters.
- **Layout:** 2-step wizard. Step 1: Name, location, demographic counts, monthly income. Step 2: Initial expense items table.
- **API Calls:** `POST /api/households` or `PUT /api/households/:id`.

### 7. Expense Management (`/households/:id/expenses`)
- **Purpose:** Categorized expense item management.
- **Layout:** Category filter chips, expense item table (Category, Description, Essential Toggle, Amount, Actions), running sum footer.
- **API Calls:** `GET /api/households/:id/expenses`, `POST /api/households/:id/expenses`, `PUT`, `DELETE`.

### 8. Analytics (`/households/:id/analytics`)
- **Purpose:** View deterministic demographic dependency metrics and financial analytics breakdown.
- **Layout:** Dual metric gauges (Dependency Ratio & Savings Rate), expense category breakdown Doughnut chart, explanation cards.
- **API Calls:** `GET /api/households/:id/analytics`.

### 9. Prediction (`/households/:id/prediction`)
- **Purpose:** Request and review ML Household Risk Level prediction.
- **Layout:** Predicted Risk Badge (`LOW`/`MEDIUM`/`HIGH`), vote-share progress bars, top contributing factors list, "Run Prediction" button.
- **API Calls:** `POST /api/households/:id/predict`, `GET /api/households/:id/predictions/latest`.

### 10. AI Insights (`/households/:id/insights`)
- **Purpose:** View Gemini-powered explanations and actionable suggestions.
- **Layout:** 5 collapsible accordion cards (*Understand Your Household*, *Expense Review*, *Savings & Stability*, *Growth Opportunities*, *Things to Monitor*), disclaimer footer, "Regenerate Insights" button.
- **API Calls:** `POST /api/households/:id/insights`.

### 11. Monthly History (`/households/:id/history`)
- **Purpose:** View historical monthly snapshots and timeline trend charts.
- **Layout:** "Save as Monthly Record" action button, multi-month savings & dependency Line chart, snapshot history list.
- **API Calls:** `GET /api/households/:id/monthly-records`, `POST /api/households/:id/monthly-records`, `DELETE`.

### 12. Reports (`/households/:id/reports`)
- **Purpose:** Generate and list downloadable PDF reports.
- **Layout:** "Generate Report" modal form (Report Type: CURRENT / MONTHLY), report history table with "Preview" and "Download PDF" actions.
- **API Calls:** `POST /api/households/:id/reports`, `GET /api/households/:id/reports`.

### 13. Report Preview (`/reports/:reportId`)
- **Purpose:** In-browser print preview of a generated report before downloading.
- **Layout:** Paper-styled preview document, "Download PDF" header button.
- **API Calls:** `GET /api/reports/:reportId`, `GET /api/reports/:reportId/download`.

### 14. Settings / Profile (`/settings`)
- **Purpose:** Update user profile display name and password.
- **Layout:** Profile information form, change password form.
- **API Calls:** `PUT /api/auth/profile`, `PUT /api/auth/password`.
