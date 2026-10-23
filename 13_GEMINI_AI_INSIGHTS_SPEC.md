# 13 — Gemini AI Insights Specification

Google Gemini API is integrated server-side via the `@google/genai` Node.js SDK to generate tailored plain-language explanations and practical growth suggestions.

> **Core Boundary Rule:** Gemini is **NOT** the official analytics engine. The backend calculates official metrics, and the Python ML service generates risk predictions. Gemini only explains already computed numbers.

---

## 1. Security & Privacy Rules

- **Zero PII Policy:** The payload sent to Gemini MUST NEVER contain user names, emails, addresses, household names, location strings, or free-text descriptions.
- **Backend Isolation:** `GEMINI_API_KEY` is kept strictly on the Node.js backend environment. It MUST NEVER be shipped to the frontend React bundle.

---

## 2. Gemini Input Payload JSON Structure

The Node.js backend constructs the de-identified prompt payload from pre-calculated database records:

```json
{
  "demographics": {
    "totalMembers": 4,
    "earningMembers": 2,
    "dependentMembers": 2,
    "childrenCount": 1,
    "elderlyCount": 0
  },
  "metrics": {
    "dependencyRatio": "100.00%",
    "dependencyLevel": "MEDIUM",
    "monthlyIncome": 85000.00,
    "totalExpenses": 40000.00,
    "essentialExpenses": 32000.00,
    "nonEssentialExpenses": 8000.00,
    "savings": 45000.00,
    "savingsRate": "52.94%",
    "expenseRatio": "47.06%",
    "financialCondition": "HEALTHY"
  },
  "mlPrediction": {
    "riskLevel": "LOW",
    "confidence": "85.00%",
    "modelVersion": "rf-v1.0.0"
  },
  "expenseCategorySummary": [
    { "category": "HOUSING", "amount": 20000.00, "isEssential": true },
    { "category": "FOOD", "amount": 12000.00, "isEssential": true },
    { "category": "ENTERTAINMENT", "amount": 8000.00, "isEssential": false }
  ]
}
```

---

## 3. Gemini System Prompt & Output Schema

### System Prompt
```text
You are an expert household financial analyst assistant. 
Analyze the provided structured financial and demographic data for a household.
You must return your response STRICTLY as a valid JSON object with the exact specified structure.
Do NOT invent numbers, household members, or income amounts.
Do NOT calculate new metrics; use only the provided values.
Use prudent, non-prescriptive language ("potentially reducible", "consider reviewing").
Do NOT promise investment returns or pretend to be a licensed financial advisor.
```

### Required Output JSON Schema
```json
{
  "understandHousehold": "Summary of demographic structure and earner-to-dependent dynamics...",
  "expenseReview": "Analysis of essential vs non-essential spending patterns...",
  "savingsStability": "Evaluation of monthly cash flow buffer and savings rate resilience...",
  "growthOpportunities": "Practical, actionable recommendations to improve financial health...",
  "thingsToMonitor": "Key financial risks or upcoming demographic factors to watch...",
  "disclaimer": "This analysis is automatically generated for educational purposes and does not constitute certified financial advice."
}
```

---

## 4. Response Caching & Regeneration Policy

1. **Caching via Hash:** Before invoking Gemini, the backend computes the SHA-256 hash of the canonical analytics data + prediction ID.
2. **Lookup:** If an entry in `ai_insights` matches `input_hash`, the cached JSON response is immediately returned (`cached: true`).
3. **Force Regeneration:** A user may click **"Regenerate Insights"**, passing `force: true` to `POST /api/households/:id/insights`. This bypasses cache lookup, calls Gemini, inserts a new `ai_insights` record, and updates the active household state.

---

## 5. Graceful Degradation & Timeout Handling

- **Timeout:** Server-side call to Gemini has an 8-second timeout (`AbortController`).
- **Failure Behavior:** If Gemini API fails, times out, or returns invalid JSON:
  - Backend logs the error silently (`logger.error`).
  - Returns HTTP `503 Service Unavailable`:
    ```json
    {
      "success": false,
      "error": {
        "code": "AI_UNAVAILABLE",
        "message": "AI suggestions are temporarily unavailable. Your household analytics and ML predictions are fully functional."
      }
    }
    ```
  - **No Cascade Failure:** The rest of the dashboard, analytics calculation, and ML prediction services remain completely functional.
