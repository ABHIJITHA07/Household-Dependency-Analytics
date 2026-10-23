# 01 — Project Overview

## 1. What it is
A web application where a user records a household's demographics and monthly finances. The system then **calculates** dependency and financial metrics, **predicts** a household risk level with a machine-learning model, and shows **AI-generated, plain-language suggestions** for improving resilience. Users may optionally save monthly snapshots and download PDF reports.

## 2. Who uses it
| User | Goal |
|---|---|
| Household member / family planner | Understand how many people depend on each earner and where money goes |
| Student / evaluator | See a clean full-stack + ML + AI integration with sound engineering |

## 3. Feature summary
| Area | Features |
|---|---|
| Accounts | Register, login, logout, profile name, change password |
| Household | Create / view / edit / delete; demographics; current monthly income |
| Expenses | 11 categories, per-item essential flag, description; backend recomputes totals |
| Analytics | Dependency ratio + level, savings, savings rate, expense ratio, essential vs non-essential, plain-language explanations |
| Prediction | Random Forest risk level LOW/MEDIUM/HIGH, vote-share probabilities, top factors, disclaimer |
| AI insights | Five themed suggestion groups from Gemini, regenerable within limits |
| Monthly history (optional) | "Save as Monthly Record", trend charts, never forced |
| Reports (optional) | Current or monthly PDF with charts, insights and disclaimer |

## 4. How a typical session goes
1. Register and log in.
2. Create a household: members, income, expense items.
3. Open **Analytics** — numbers plus explanations.
4. Open **Prediction** — risk level, probabilities, factors.
5. Open **AI Insights** — suggestions in five groups.
6. Edit income or expenses any time; analytics refresh instantly.
7. Optionally click **Save as Monthly Record** to keep a snapshot.
8. Optionally generate and download a report.

## 5. Design principles
1. **Separation of truth:** deterministic code → numbers; ML → classification; Gemini → language.
2. **Graceful degradation:** if ML or Gemini is down, everything else still works.
3. **Honest wording:** "potentially reducible", "analytical estimate", never certainty.
4. **Optional history:** current data and history are separate concepts.
5. **Simplicity:** one backend, one ML service, one database.

## 6. Glossary
| Term | Meaning |
|---|---|
| Household | A group of people sharing income and expenses |
| Earning member | Member who contributes income |
| Dependent member | Member who relies on household income |
| Dependency ratio | Dependents ÷ earners × 100 |
| Essential expense | Expense the user classified as essential |
| Non-essential expense | Expense the user classified as non-essential ("potentially reducible") |
| Monthly record | Optional immutable snapshot of one month |
| Risk level | ML-predicted LOW / MEDIUM / HIGH estimate |
| Insight | Gemini-generated explanation/suggestion set |
