# 19 — Error Handling & Validation Specification

## 1. Standard Error Body Format

All API errors return a consistent JSON schema with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for incoming request data",
    "details": [
      {
        "field": "earningMembers",
        "message": "Earning members cannot exceed total members"
      }
    ]
  }
}
```

---

## 2. Standard Error Code Matrix

| Error Code | HTTP Status | Description | User Message |
|---|---|---|---|
| `VALIDATION_ERROR` | `422` | Request body failed Zod validation | "Please check your input fields." |
| `UNAUTHORIZED` | `401` | Invalid or missing authentication token | "Please log in to continue." |
| `TOKEN_EXPIRED` | `401` | JWT session has expired | "Session expired. Please log in again." |
| `INVALID_CREDENTIALS` | `401` | Email or password incorrect | "Invalid email or password." |
| `FORBIDDEN` | `403` | User lacks permission | "You do not have access to this resource." |
| `NOT_FOUND` | `404` | Household or resource does not exist | "Requested resource was not found." |
| `EMAIL_EXISTS` | `409` | Email already registered | "An account with this email already exists." |
| `RECORD_EXISTS` | `409` | Monthly snapshot already exists | "A snapshot for this month already exists." |
| `ML_UNAVAILABLE` | `503` | ML FastAPI service offline/timed out | "Risk prediction temporarily unavailable." |
| `AI_UNAVAILABLE` | `503` | Gemini API offline/timed out | "AI suggestions temporarily unavailable." |
| `REPORT_FAILED` | `500` | PDF compilation error | "Failed to generate PDF report. Please try again." |
| `INTERNAL_ERROR` | `500` | Unhandled server exception | "An unexpected server error occurred." |

---

## 3. Zod Input Validation Rules Matrix

### 3.1 Household Schema (`household.validator.js`)
```javascript
const householdSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().max(120).optional().nullable(),
  totalMembers: z.number().int().min(1).max(50),
  earningMembers: z.number().int().min(0).max(50),
  dependentMembers: z.number().int().min(0).max(50),
  childrenCount: z.number().int().min(0).max(50),
  elderlyCount: z.number().int().min(0).max(50),
  monthlyIncome: z.number().min(0)
}).refine(data => data.earningMembers + data.dependentMembers <= data.totalMembers, {
  message: "Earning members plus dependent members cannot exceed total members",
  path: ["earningMembers"]
}).refine(data => data.childrenCount + data.elderlyCount <= data.totalMembers, {
  message: "Children plus elderly count cannot exceed total members",
  path: ["childrenCount"]
});
```

### 3.2 Expense Schema (`expense.validator.js`)
```javascript
const expenseSchema = z.object({
  category: z.enum([
    'HOUSING', 'FOOD', 'EDUCATION', 'HEALTHCARE', 'TRANSPORTATION',
    'UTILITIES', 'INSURANCE', 'DEBT', 'ENTERTAINMENT', 'SHOPPING', 'OTHER'
  ]),
  amount: z.number().positive("Amount must be greater than 0"),
  isEssential: z.boolean().default(true),
  description: z.string().max(255).optional().nullable()
});
```
