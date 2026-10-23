# 06 — System Architecture

## 1. Components
| Component | Tech | Exposure | Responsibility |
|---|---|---|---|
| `frontend` | React + Vite | Public (static host) | UI only; talks only to Node |
| `backend` | Node + Express | Public HTTPS | Auth, validation, business logic, analytics engine, DB access, orchestration of ML + Gemini, PDF |
| `ml-service` | FastAPI + scikit-learn | **Private** (called only by backend, API-key protected) | Serve the trained Random Forest |
| `database` | MySQL 8 | Private | Persistence |
| Gemini API | Google | External, outbound only from backend | Language generation |

## 2. Layered backend
```
Request → routes → middleware (auth, validate, rate-limit)
        → controllers (HTTP in/out only)
        → services (business logic: analytics, prediction, insight, monthly, report, pdf)
        → repositories (SQL, parameterized)  → MySQL
services/prediction.service → ML client (axios, timeout, API key)
services/insight.service    → Gemini client (@google/genai, timeout)
```
Rules: controllers never contain SQL or formulas; repositories never contain business rules; the analytics engine imports nothing from Express or the DB.

## 3. Data flow summary
1. **Write path:** React → controller → zod validation → service → repository → MySQL (transaction for multi-row).
2. **Analytics path:** service loads household + expenses → `calculateAnalytics()` → response (nothing stored).
3. **Prediction path:** analytics → `buildMlFeatures()` → hash → lookup/insert → ML call if needed.
4. **Insight path:** analytics (+ latest prediction) → `buildGeminiPayload()` (de-identified) → Gemini → validate → store.
5. **Report path:** assemble `reportData` → store snapshot → PDFKit streams on download.

## 4. Why these boundaries
- Calculation in plain code is testable and exact; an LLM is neither.
- The ML service has its own runtime (Python) and is replaceable without touching the frontend.
- Gemini key and ML key exist only on the backend.
- The frontend has one base URL (`VITE_API_BASE_URL`), so CORS and secrets stay simple.

## 5. Cross-cutting concerns
| Concern | Approach |
|---|---|
| Config | `config/env.js` reads and validates env vars at startup; fails fast if required ones missing |
| Errors | `AppError(code, status, message, details)`; central `errorHandler` formats the standard error body |
| Logging | `utils/logger.js` (console JSON); request id; never log passwords, tokens, API keys |
| Money | `utils/money.js` rounds to 2 dp; mysql2 `decimalNumbers: true` |
| Hashing | `utils/hash.js` (SHA-256 of canonical JSON) |
| Time | UTC everywhere in DB |

## 6. Deployment view
Vercel (static frontend) → Render/Railway (Node) → Render/Railway (FastAPI, private or key-protected) → managed MySQL. Details in `26`.

## 7. Technology rationale (viva-ready)
| Choice | Reason |
|---|---|
| MySQL | Relational data with clear FKs; widely taught |
| mysql2 without ORM | Transparent SQL, parameterized, fewer dependencies |
| Random Forest | Handles mixed numeric features, robust, gives feature importances, easy to explain |
| FastAPI | Typed request models, auto docs, quick to serve scikit-learn |
| PDFKit | No headless browser or native canvas; deploys anywhere |
| Context API | Auth and active household are the only global state |
