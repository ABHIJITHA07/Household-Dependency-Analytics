# 09 — API Specification

All API endpoints are hosted by the Node/Express backend (`/api`). The API returns standard JSON with camelCase keys. Protected endpoints require a HTTP `Authorization: Bearer <token>` header.

## 1. Response & Error Standard Wrappers

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable success message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "monthlyIncome",
        "message": "Monthly income must be greater than or equal to 0"
      }
    ]
  }
}
```

---

## 2. API Endpoints Matrix

### 2.1 System & Auth

#### `GET /api/health`
- **Auth:** Public
- **Purpose:** System liveness check.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "timestamp": "2026-10-06T19:50:00.000Z",
      "services": { "database": "UP", "mlService": "UP" }
    }
  }
  ```

#### `POST /api/auth/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Validation:**
  - `name`: 2–100 characters.
  - `email`: Valid email format, normalized to lowercase.
  - `password`: Minimum 8 characters.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```
- **Error `409 Conflict`:** Email already registered (`EMAIL_EXISTS`).

#### `POST /api/auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```
- **Error `401 Unauthorized`:** `INVALID_CREDENTIALS`.

#### `GET /api/auth/me`
- **Auth:** Protected (Bearer JWT)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": { "id": 1, "name": "John Doe", "email": "john@example.com" }
  }
  ```

#### `POST /api/auth/logout`
- **Auth:** Protected (Bearer JWT)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Successfully logged out"
  }
  ```

#### `PUT /api/auth/profile`
- **Auth:** Protected (Bearer JWT)
- **Request Body:** `{ "name": "Jane Doe" }`
- **Response `200 OK`:** Returns updated user object.

#### `PUT /api/auth/password`
- **Auth:** Protected (Bearer JWT)
- **Request Body:** `{ "currentPassword": "OldPassword123!", "newPassword": "NewPassword123!" }`
- **Response `200 OK`:** `{ "success": true, "message": "Password updated successfully" }`

---

### 2.2 Household Management

#### `GET /api/households`
- **Auth:** Protected
- **Response `200 OK`:** List of user's households.

#### `POST /api/households`
- **Auth:** Protected
- **Request Body:**
  ```json
  {
    "name": "Doe Family",
    "location": "Mumbai",
    "totalMembers": 4,
    "earningMembers": 2,
    "dependentMembers": 2,
    "childrenCount": 1,
    "elderlyCount": 0,
    "monthlyIncome": 85000.00,
    "expenses": [
      { "category": "HOUSING", "amount": 25000.00, "isEssential": true, "description": "Rent" },
      { "category": "FOOD", "amount": 15000.00, "isEssential": true, "description": "Groceries" }
    ]
  }
  ```
- **Validation Rules:**
  - `earningMembers + dependentMembers <= totalMembers`
  - `childrenCount + elderlyCount <= totalMembers`
  - `monthlyIncome >= 0`
- **Response `201 Created`:** Created household with assigned `id`.

#### `GET /api/households/:id`
- **Auth:** Protected (Must be owner)
- **Response `200 OK`:** Household details + expense items array.

#### `PUT /api/households/:id`
- **Auth:** Protected (Must be owner)
- **Request Body:** Editable household demographic/income fields.
- **Response `200 OK`:** Updated household payload. Mark active predictions/insights `isStale = true`.

#### `DELETE /api/households/:id`
- **Auth:** Protected (Must be owner)
- **Response `200 OK`:** `{ "success": true, "message": "Household deleted" }` (Cascades in DB).

---

### 2.3 Expenses Management

#### `GET /api/households/:id/expenses`
- **Auth:** Protected
- **Response `200 OK`:** List of expense items for household.

#### `POST /api/households/:id/expenses`
- **Auth:** Protected
- **Request Body:** `{ "category": "HEALTHCARE", "amount": 5000.00, "isEssential": true, "description": "Medicines" }`
- **Response `201 Created`:** Created expense object.

#### `PUT /api/households/:id/expenses/:expenseId`
- **Auth:** Protected
- **Request Body:** Fields to update (`category`, `amount`, `isEssential`, `description`).
- **Response `200 OK`:** Updated expense item.

#### `DELETE /api/households/:id/expenses/:expenseId`
- **Auth:** Protected
- **Response `200 OK`:** `{ "success": true, "message": "Expense item removed" }`

---

### 2.4 Analytics & Intelligence APIs

#### `GET /api/households/:id/analytics`
- **Auth:** Protected
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "householdId": 1,
      "demographics": {
        "totalMembers": 4,
        "earningMembers": 2,
        "dependentMembers": 2,
        "childrenCount": 1,
        "elderlyCount": 0
      },
      "dependencyRatio": 100.00,
      "dependencyLevel": "MEDIUM",
      "financials": {
        "monthlyIncome": 85000.00,
        "totalExpenses": 40000.00,
        "essentialExpenses": 40000.00,
        "nonEssentialExpenses": 0.00,
        "savings": 45000.00,
        "savingsRate": 52.94,
        "expenseRatio": 47.06,
        "essentialPercentage": 100.00,
        "nonEssentialPercentage": 0.00,
        "financialCondition": "HEALTHY"
      },
      "explanations": {
        "dependencyText": "Your household has 2 dependents per 2 earning members (100.00%).",
        "financialText": "Healthy savings rate of 52.94% gives strong buffer."
      }
    }
  }
  ```

#### `POST /api/households/:id/predict`
- **Auth:** Protected
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "predictionId": 12,
      "predictedRiskLevel": "LOW",
      "probabilities": { "LOW": 0.85, "MEDIUM": 0.12, "HIGH": 0.03 },
      "topFactors": [
        "High Savings Rate (>50%) reduces financial stress",
        "Moderate Dependency Ratio (100%)"
      ],
      "modelVersion": "rf-v1.0.0",
      "isStale": false,
      "createdAt": "2026-10-06T19:50:00.000Z"
    }
  }
  ```

#### `POST /api/households/:id/insights`
- **Auth:** Protected
- **Request Body (optional):** `{ "force": false }`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "insightId": 8,
      "cached": true,
      "modelName": "gemini-1.5-flash",
      "sections": {
        "understandHousehold": "Your household maintains a balanced structure with 2 earners.",
        "expenseReview": "All current expenses are essential. Review non-essential categories if added later.",
        "savingsStability": "Strong financial position with ₹45,000 monthly savings buffer.",
        "growthOpportunities": "Consider emergency fund accumulation equivalent to 6 months of expenses.",
        "thingsToMonitor": "Monitor medical expenses as dependents age."
      },
      "disclaimer": "This analysis is for educational purposes only and does not constitute financial advice."
    }
  }
  ```

---

### 2.5 Monthly History & Snapshot APIs

#### `POST /api/households/:id/monthly-records`
- **Auth:** Protected
- **Request Body:** `{ "recordMonth": 10, "recordYear": 2026, "notes": "Saved after salary increment", "overwrite": false }`
- **Response `201 Created`:** Created snapshot record.
- **Error `409 Conflict`:** `RECORD_EXISTS` (requires `overwrite: true`).

#### `GET /api/households/:id/monthly-records`
- **Auth:** Protected
- **Response `200 OK`:** Array of monthly snapshot records sorted by year/month descending.

#### `GET /api/households/:id/monthly-records/:recordId`
- **Auth:** Protected
- **Response `200 OK`:** Single snapshot record detail.

#### `DELETE /api/households/:id/monthly-records/:recordId`
- **Auth:** Protected
- **Response `200 OK`:** `{ "success": true, "message": "Monthly snapshot deleted" }`

---

### 2.6 Report APIs

#### `POST /api/households/:id/reports`
- **Auth:** Protected
- **Request Body:**
  ```json
  {
    "reportType": "CURRENT",
    "monthlyRecordId": null
  }
  ```
  *(For `MONTHLY` report, `monthlyRecordId` is required).*
- **Response `201 Created`:** Returns report record object with `reportId`.

#### `GET /api/reports/:reportId`
- **Auth:** Protected
- **Response `200 OK`:** Report detail and preview data (`snapshotJson`).

#### `GET /api/reports/:reportId/download`
- **Auth:** Protected
- **Response `200 OK`:** PDF binary stream (`Content-Type: application/pdf`).

#### `DELETE /api/reports/:reportId`
- **Auth:** Protected
- **Response `200 OK`:** Report metadata record deleted.
