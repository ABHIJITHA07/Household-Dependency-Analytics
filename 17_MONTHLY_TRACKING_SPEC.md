# 17 — Monthly Tracking Specification

## 1. Optional Nature & Core Principle

Monthly financial tracking is an **optional feature** for the user. The primary workflow (Household Creation $\rightarrow$ Current Analytics $\rightarrow$ Prediction $\rightarrow$ Insights) operates independently without requiring historical monthly records.

> **Immutable Snapshot Rule:** Historical monthly records stored in `monthly_records` are point-in-time snapshots. Subsequent edits to current household demographics, income, or expenses MUST NEVER alter, overwrite, or recalculate existing monthly records.

---

## 2. Snapshot Creation Algorithm (`POST /api/households/:id/monthly-records`)

When a user clicks **"Save as Monthly Record"**:

1. **Input Validation:** User selects `recordMonth` (1–12), `recordYear` (2000–2100), and optional `notes`. Future months are rejected (`422 INVALID_PERIOD`).
2. **Duplicate Check:** Check `monthly_records` for existing `(household_id, record_year, record_month)`.
   - If record exists and `overwrite !== true`: Return `409 Conflict` (`code: "RECORD_EXISTS"`). The UI displays a modal asking: *"A record for October 2026 already exists. Overwrite?"*
3. **Snapshot Freeze:** The backend loads active household data + expenses, computes deterministic analytics, retrieves the latest active `prediction_id` and `insight_id` (if input hashes match), serializes `expense_breakdown_json`, and inserts/updates the `monthly_records` table.

---

## 3. Data Integrity & Cascade Rules

- **Deleting Current Expenses:** Does NOT delete or alter monthly records.
- **Deleting Predictions / Insights:** If a linked prediction or insight row is deleted, foreign keys in `monthly_records` set `prediction_id` / `insight_id` to `NULL` via `ON DELETE SET NULL`, preserving the metric snapshot values intact.
- **Deleting Household:** Deleting the household cascades and deletes its historical monthly records (`ON DELETE CASCADE`).
