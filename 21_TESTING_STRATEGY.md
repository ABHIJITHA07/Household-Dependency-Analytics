# 21 — Testing Strategy

## 1. Overview & Test Pyramid

The testing strategy ensures high correctness across deterministic calculations, machine learning prediction, AI fallback handling, and UI workflows.

```
       ▲
      / \        End-to-End Verification (Manual Script / Supertest)
     /   \       ---------------------------------------------------
    /  I  \      Backend & ML Integration Tests (Jest, Pytest)
   /   N   \     ---------------------------------------------------
  /    U    \    Unit Tests: Analytics Engine Pure Functions, Zod Schemas
 /_____T_____\   ---------------------------------------------------
```

---

## 2. Testing Frameworks & Execution Matrix

| Domain | Scope | Framework | Execution Command |
|---|---|---|---|
| Backend Unit | Analytics Engine & Pure Functions | Jest | `npm run test:unit` |
| Backend Integration | REST Controllers, Repositories, Auth | Jest + Supertest | `npm run test:integration` |
| ML Service | Feature Scaling, Model Artifact, FastAPI | Pytest | `pytest` |
| Frontend Unit | Component Rendering, Form Validators | Vitest + RTL | `npm run test` |

---

## 3. Mandatory Test Coverage Rules

1. **Pure Analytics Engine:** $100\%$ function coverage on `analytics.engine.js`. Every edge case (0 earners, 0 income, 100% essential expenses) MUST have explicit unit assertions.
2. **Graceful Fallback Tests:** Test that if Gemini or ML FastAPI endpoints return `503`, the application core continues serving analytics without crashing.
3. **Data Isolation Tests:** Verify that User A cannot read or modify User B's household data.
