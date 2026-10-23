# 10 — Authentication & Authorization Specification

## 1. Authentication Scheme
The application uses Stateless JSON Web Token (JWT) authentication for API requests.

### Password Hashing
- **Algorithm:** `bcryptjs`
- **Cost Factor:** `12` rounds
- Plaintext passwords are never logged, stored in DB, or returned in API responses.

### JWT Specification
- **Algorithm:** `HS256`
- **Secret Key:** `JWT_SECRET` (Configured via backend `.env`, minimum 32 characters)
- **Token Expiration:** `JWT_EXPIRES_IN` (Default: `7d`)
- **Payload Structure:**
  ```json
  {
    "userId": 1,
    "email": "john@example.com",
    "iat": 1759780000,
    "exp": 1760384800
  }
  ```

---

## 2. Authentication Flow

```
Client (React)                          Backend (Node/Express)
   │                                              │
   ├────── POST /api/auth/login ─────────────────►│
   │       { email, password }                    │ Verify credentials with bcrypt
   │                                              │ Sign JWT with JWT_SECRET
   │◄───── 200 OK { token, user } ────────────────┤
   │       Store token in localStorage            │
   │                                              │
   ├────── GET /api/households ──────────────────►│
   │       Header: Authorization: Bearer <token>  │ Verify JWT via authMiddleware
   │                                              │ Attach req.user = { userId }
   │◄───── 200 OK { data: [...] } ────────────────┤
```

---

## 3. Middleware Implementation Rules (`auth.middleware.js`)

1. Extract `Authorization` header from incoming HTTP request.
2. Check format: `Bearer <token>`. If missing or malformed, return `401 Unauthorized` (`code: "NO_TOKEN_PROVIDED"`).
3. Verify token signature using `jwt.verify(token, process.env.JWT_SECRET)`.
4. If expired: return `401 Unauthorized` (`code: "TOKEN_EXPIRED"`).
5. If invalid signature: return `401 Unauthorized` (`code: "INVALID_TOKEN"`).
6. Attach verified `userId` to Express request context (`req.user = decodedToken`).
7. Proceed to next route controller.

---

## 4. Authorization & Ownership Enforcements

- **Resource Ownership Rule:** Every household, expense, analytics, prediction, insight, monthly record, and report query **MUST** be scoped to `req.user.userId`.
- **Cross-User Data Isolation:**
  ```sql
  SELECT * FROM households WHERE id = ? AND user_id = ?;
  ```
- **Access Violation Response:** If a user attempts to access or modify a resource owned by another user ID, the backend MUST return `404 NOT_FOUND` (rather than `403 FORBIDDEN`) to prevent user enumeration attacks.
