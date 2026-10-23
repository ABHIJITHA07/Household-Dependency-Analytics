# 16 — Component Specification

Specifications for reusable React components in `src/components/`.

---

## Component Index & Interface Contracts

### 1. `MetricCard`
- **Purpose:** Display a key numeric metric with label, icon, subtext, and status color.
- **Props:**
  - `label` (string)
  - `value` (string | number)
  - `unit` (string, optional, e.g. "%" or "₹")
  - `status` ('low' | 'medium' | 'high' | 'healthy' | 'deficit')
  - `subtext` (string, optional)

### 2. `StatusBadge`
- **Purpose:** Consistent pill badge for `DependencyLevel`, `FinancialCondition`, and `RiskLevel`.
- **Props:**
  - `type` ('dependency' | 'financial' | 'risk')
  - `value` (string)
- **Styling Rules:**
  - `LOW` / `HEALTHY`: Sage background (`--accent-sage`), dark green text.
  - `MEDIUM` / `MODERATE` / `TIGHT`: Amber background (`--accent-amber`), dark amber text.
  - `HIGH` / `DEFICIT` / `NO_INCOME`: Rust red background (`--accent-rust`), white text.

### 3. `ExpenseTable`
- **Purpose:** Interactive expense item manager.
- **Props:**
  - `items` (Array of Expense Objects)
  - `onAdd` (function)
  - `onEdit` (function)
  - `onDelete` (function)

### 4. `ExpenseBreakdownChart`
- **Purpose:** Chart.js Doughnut rendering expense totals by category.
- **Props:**
  - `categoryBreakdown` (`[ { category, total, isEssential } ]`)

### 5. `SavingsTrendChart`
- **Purpose:** Chart.js Line chart displaying historical monthly savings and expense trends.
- **Props:**
  - `historyRecords` (Array of Monthly Record Objects)

### 6. `ConfirmModal`
- **Purpose:** Accessible confirmation modal for destructive actions (e.g. deletion, overwriting monthly records).
- **Props:**
  - `isOpen` (boolean)
  - `title` (string)
  - `message` (string)
  - `onConfirm` (function)
  - `onCancel` (function)
