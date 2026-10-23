# 02 — Problem Statement, Objectives and Scope

## 1. Problem statement
Households often cannot see how many people depend on each earning member, how much of the budget is essential vs. discretionary, or how fragile their savings position is. Spreadsheets show raw numbers without interpretation, and generic AI chatbots may invent numbers or give unsafe financial advice. A focused tool is needed that **computes metrics reliably, classifies risk with a documented ML model, and explains results in simple language**.

## 2. Objectives
| ID | Objective |
|---|---|
| O1 | Capture household demographics and categorized monthly expenses |
| O2 | Compute dependency and financial metrics deterministically and verifiably |
| O3 | Train and serve a Random Forest model that predicts LOW/MEDIUM/HIGH household risk without target leakage |
| O4 | Use Gemini only for explanations and general improvement suggestions, with safe wording |
| O5 | Let users edit current data freely and *optionally* keep monthly history |
| O6 | Produce clear PDF reports (current and monthly) |
| O7 | Deliver a polished, responsive, accessible UI in a Biscoff/cream theme |
| O8 | Demonstrate clean layered full-stack architecture suitable for demo and viva |

## 3. Scope
### In scope
Authentication; household CRUD; expense CRUD; analytics; ML prediction service; Gemini insights; optional monthly snapshots and trend charts; PDF reports; responsive UI; tests; deployment guide.

### Out of scope
Bank/UPI integration; multiple currencies; family-member sharing between accounts; admin panel; email verification and password reset by email; push notifications; real-world statistical claims; automated investment products; model retraining from the UI.

### Optional (clearly marked, build only after all acceptance criteria pass)
Dark mode; CSV export of monthly records.

## 4. Assumptions
See `00` §6. Additionally: single currency (INR); users enter honest data; browsers are modern evergreen browsers.

## 5. Limitations (stated in the UI and the viva)
- Dependency ratio is a structural indicator, not a verdict on financial health.
- Prediction is trained on synthetic data and is an analytical estimate.
- AI suggestions are general information; they are not licensed advice.
- Essential/non-essential classification is subjective and user-defined.

## 6. Success criteria
All items in `28_ACCEPTANCE_CRITERIA.md` pass; the sample scenario in `11` reproduces exactly; core features work with Gemini disabled.
