# 20 — Security Specification

## 1. Security Architecture & Threat Model

The application enforces OWASP Web Application Security best practices across all architectural layers.

```
React Frontend (Vite)  ──►  Express Backend (Node.js)  ──►  MySQL 8 / FastAPI ML / Gemini
   [No Secrets]             [Strict Secrets: ENV]          [Parameterized Queries]
```

---

## 2. Server-Side Secret Isolation (Critical Rule)

- **Backend-Only Environment Variables:**
  - `JWT_SECRET`
  - `GEMINI_API_KEY`
  - `ML_SERVICE_API_KEY`
  - `DB_PASSWORD`
- **Frontend Environment Variables:**
  - `VITE_API_BASE_URL` (Public Node backend URL only).
- **Enforcement Rule:** Secrets MUST NEVER use the `VITE_` prefix. Automated inspection scripts verify that frontend build artifacts contain zero references to `GEMINI_API_KEY` or `JWT_SECRET`.

---

## 3. Vulnerability Mitigation Controls

### 3.1 SQL Injection Protection
- All database queries MUST use parameterized prepared statements provided by `mysql2/promise`:
  ```javascript
  // CORRECT: Parameterized SQL query
  const [rows] = await db.query(
    'SELECT * FROM households WHERE id = ? AND user_id = ?',
    [householdId, userId]
  );
  ```
- Dynamic string interpolation/concatenation in SQL statements is strictly FORBIDDEN.

### 3.2 Cross-Site Scripting (XSS) & Input Sanitization
- React automatically escapes rendered strings in JSX.
- HTTP security headers applied via `helmet()` middleware:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`

### 3.3 Rate Limiting & Denial of Service Defense
- Global rate limiter via `express-rate-limit`: 100 requests per 15-minute window per IP.
- Auth endpoint rate limiter (`/api/auth/*`): 10 requests per 15-minute window to prevent brute-force attacks.

### 3.4 Cross-Origin Resource Sharing (CORS)
- CORS middleware restricted explicitly to `process.env.CORS_ORIGIN` (default `http://localhost:5173`). Wildcard `*` origins are forbidden in production.
