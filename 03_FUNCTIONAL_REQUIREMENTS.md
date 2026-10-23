# 03 — Functional Requirements

Priority: **M** = must (required for acceptance), **O** = optional feature of the system (never forced on the user).

## 1. Authentication (FR-AUTH)
| ID | Requirement | P |
|---|---|---|
| FR-AUTH-1 | Register with name, email, password; email unique (case-insensitive) | M |
| FR-AUTH-2 | Passwords hashed with bcrypt; never returned or logged | M |
| FR-AUTH-3 | Login returns a JWT; protected routes require it | M |
| FR-AUTH-4 | Logout clears the client token and calls `POST /api/auth/logout` | M |
| FR-AUTH-5 | Update display name; change password with current password | M |

## 2. Household (FR-HH)
| ID | Requirement | P |
|---|---|---|
| FR-HH-1 | Create household: name, optional location, totalMembers, earningMembers, dependentMembers, childrenCount, elderlyCount, monthlyIncome | M |
| FR-HH-2 | Optionally include expense items in the create request (atomic) | M |
| FR-HH-3 | View, edit, delete household (delete asks confirmation, cascades) | M |
| FR-HH-4 | Cross-field validation rules from `19` | M |
| FR-HH-5 | A user may own up to 10 households; the UI shows an active-household switcher | M |
| FR-HH-6 | Editing current data never alters saved monthly records | M |

## 3. Expenses (FR-EXP)
| ID | Requirement | P |
|---|---|---|
| FR-EXP-1 | Add/edit/delete expense items with category, amount, isEssential, optional description | M |
| FR-EXP-2 | Category default essential flag is pre-selected but user-changeable | M |
| FR-EXP-3 | Total expenses = backend sum of items; any client-supplied total is ignored | M |
| FR-EXP-4 | Show non-essential items as "potentially reducible" with careful wording | M |

## 4. Analytics (FR-AN)
| ID | Requirement | P |
|---|---|---|
| FR-AN-1 | Compute dependency ratio, level, savings, savings rate, expense ratio, essential/non-essential totals and percentages | M |
| FR-AN-2 | Handle zero income and zero earning members without division by zero | M |
| FR-AN-3 | Return deterministic plain-language explanations and warnings | M |
| FR-AN-4 | Recalculate immediately after any edit | M |
| FR-AN-5 | Clearly separate Dependency Level, Financial Condition and Risk Level | M |

## 5. Prediction (FR-ML)
| ID | Requirement | P |
|---|---|---|
| FR-ML-1 | Backend builds the 10 ML features and calls the Python service | M |
| FR-ML-2 | Return predicted risk level, vote-share probabilities, top factors, model version | M |
| FR-ML-3 | Store each distinct prediction; flag stale ones after data changes | M |
| FR-ML-4 | If ML is unavailable, return `503 ML_UNAVAILABLE`; analytics still work | M |
| FR-ML-5 | Require ≥ 1 expense item with total > 0 | M |

## 6. AI insights (FR-AI)
| ID | Requirement | P |
|---|---|---|
| FR-AI-1 | Backend sends only calculated, de-identified analytics + prediction to Gemini | M |
| FR-AI-2 | Output structured into five sections (understandHousehold, expenseReview, savingsStability, growthOpportunities, thingsToMonitor) | M |
| FR-AI-3 | Cache by input hash; `force=true` regenerates, rate-limited | M |
| FR-AI-4 | Gemini failure returns `503 AI_UNAVAILABLE` with the standard message; nothing else breaks | M |
| FR-AI-5 | Safe-wording rules and disclaimer always displayed | M |

## 7. Monthly tracking (FR-MON) — optional for the user
| ID | Requirement | P |
|---|---|---|
| FR-MON-1 | "Save as Monthly Record" snapshots current data for a chosen month/year | O |
| FR-MON-2 | One record per household per month; overwrite requires explicit confirmation | O |
| FR-MON-3 | Future months rejected; no auto-fill of missing months | O |
| FR-MON-4 | Trend chart only when history exists; helpful empty state otherwise | M |
| FR-MON-5 | View, delete records | O |

## 8. Reports (FR-REP) — optional for the user
| ID | Requirement | P |
|---|---|---|
| FR-REP-1 | Generate CURRENT report from live data | O |
| FR-REP-2 | Generate MONTHLY report only for an existing saved record | O |
| FR-REP-3 | Preview report data in the app and download PDF | O |
| FR-REP-4 | PDF contains the 12 sections listed in `18` | O |
| FR-REP-5 | PDF failure returns `500 REPORT_GENERATION_FAILED`, app keeps working | M |

## 9. UI (FR-UI)
| ID | Requirement | P |
|---|---|---|
| FR-UI-1 | 14 pages specified in `15` | M |
| FR-UI-2 | Loading, empty, error, success states on every data page | M |
| FR-UI-3 | Responsive on mobile, tablet, laptop, desktop | M |
| FR-UI-4 | Confirmation dialog for every destructive action | M |
| FR-UI-5 | Biscoff/cream theme tokens from `14` | M |
