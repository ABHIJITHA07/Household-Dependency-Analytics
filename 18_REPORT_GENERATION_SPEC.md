# 18 — Report Generation & PDF Specification

## 1. Overview & Report Types

The system provides server-side PDF generation using `pdfkit`. Reports capture complete demographic, financial, predictive, and AI analysis into formal vector-rendered PDF documents.

### Two Supported Report Types
1. **CURRENT Report (`reportType: "CURRENT"`):** Generated from live, real-time household data and current analytics.
2. **MONTHLY Report (`reportType: "MONTHLY"`):** Generated from a specific historical `monthly_record` snapshot.

---

## 2. Server-Side PDF Architecture (`pdf.service.js`)

- **Library:** `pdfkit` (Node.js).
- **Execution:** Vector rendering via pure code (draws shapes, lines, tables, text natively). Requires NO headless browser (Puppeteer) or native canvas dependencies.
- **Output:** Streams binary PDF data to the client with response headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="Household_Report_<id>.pdf"`

---

## 3. PDF Document Structure (12 Standard Sections)

1. **Header & Branding:** System title ("Household Dependency Analytics System"), timestamp, report ID.
2. **Household Overview:** Name, location, date created/modified.
3. **Demographic Breakdown:** Table showing total members, earners, dependents, children, and elderly counts.
4. **Dependency Ratio Analysis:** Official dependency ratio %, dependency level badge, and explanatory narrative.
5. **Financial Health Summary:** Income, total expenses, net savings, savings rate %, expense ratio %, financial condition badge.
6. **Expense Categorization:** Detailed table of all expenses (Category, Amount, Essential status, Description).
7. **Essential vs. Discretionary Analysis:** Comparative progress bar and percentages.
8. **ML Risk Level Assessment:** Predicted risk level (`LOW`/`MEDIUM`/`HIGH`), model confidence estimates, top contributing factors, and model version.
9. **Gemini AI Insights & Growth Plan:** Structured 5 sections (*Understand Household*, *Expense Review*, *Savings & Stability*, *Growth Opportunities*, *Things to Monitor*).
10. **Historical Context:** (Monthly reports only) Snapshot period label and user notes.
11. **Analytical Disclaimers:** Explicit disclaimers regarding synthetic ML data and non-advisory AI suggestions.
12. **Footer:** Page numbers ("Page X of Y"), confidentiality notice.
