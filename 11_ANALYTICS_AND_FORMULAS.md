# 11 — Analytics & Formulas Specification

All analytics calculations are **deterministic**, pure JavaScript functions executed strictly within the Node.js backend. The frontend and external services MUST NOT perform official metric calculations.

---

## 1. Demographic Dependency Formulas

### 1.1 Dependency Ratio
$$\text{Dependency Ratio} = \left( \frac{\text{dependentMembers}}{\text{earningMembers}} \right) \times 100$$

- **Zero Earners Edge Case:**
  - If `earningMembers === 0`:
    - `dependencyRatio` = `null`
    - `dependencyLevel` = `"HIGH"`
    - Explanation: *"Not computable (0 earning members). High demographic dependency risk."*

### 1.2 Dependency Level Classification
- `LOW`: $\text{Dependency Ratio} < 50\%$
- `MEDIUM`: $50\% \le \text{Dependency Ratio} \le 100\%$
- `HIGH`: $\text{Dependency Ratio} > 100\%$ (or `earningMembers === 0`)

---

## 2. Financial Analytics Formulas

### 2.1 Savings Calculation
$$\text{Savings} = \text{monthlyIncome} - \text{totalExpenses}$$
*(Note: `totalExpenses` is always the backend sum of active expense item amounts).*

### 2.2 Savings Rate
$$\text{Savings Rate} = \left( \frac{\text{Savings}}{\text{monthlyIncome}} \right) \times 100$$
- If `monthlyIncome === 0`: `savingsRate = null`.

### 2.3 Expense Ratio
$$\text{Expense Ratio} = \left( \frac{\text{totalExpenses}}{\text{monthlyIncome}} \right) \times 100$$
- If `monthlyIncome === 0`: `expenseRatio = null`.

### 2.4 Essential vs. Non-essential Expense Totals
- $\text{essentialExpenses} = \sum \text{amount where } \text{isEssential} = \text{true}$
- $\text{nonEssentialExpenses} = \sum \text{amount where } \text{isEssential} = \text{false}$
- $\text{essentialPercentage} = \left( \frac{\text{essentialExpenses}}{\text{totalExpenses}} \right) \times 100$ (If `totalExpenses === 0`, `0.00`)
- $\text{nonEssentialPercentage} = \left( \frac{\text{nonEssentialExpenses}}{\text{totalExpenses}} \right) \times 100$ (If `totalExpenses === 0`, `0.00`)

### 2.5 Financial Condition Classification Rules
1. `NO_INCOME`: If `monthlyIncome === 0`.
2. `DEFICIT`: If `Savings < 0` (Expenses exceed income).
3. `TIGHT`: If `Savings Rate < 10%`.
4. `MODERATE`: If `10% <= Savings Rate < 20%`.
5. `HEALTHY`: If `Savings Rate >= 20%`.

---

## 3. Canonical Hashing Specification

To power caching and staleness detection for ML predictions and Gemini insights without re-querying or duplicating executions:

### SHA-256 Input Hash Formula
```javascript
const canonicalPayload = JSON.stringify({
  totalMembers: household.totalMembers,
  earningMembers: household.earningMembers,
  dependentMembers: household.dependentMembers,
  childrenCount: household.childrenCount,
  elderlyCount: household.elderlyCount,
  monthlyIncome: household.monthlyIncome.toFixed(2),
  totalExpenses: analytics.totalExpenses.toFixed(2),
  essentialExpenses: analytics.essentialExpenses.toFixed(2),
  nonEssentialExpenses: analytics.nonEssentialExpenses.toFixed(2),
  expenseCategoryBreakdown: sortedCategoryTotals // Categories sorted alphabetically
});

const inputHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
```

---

## 4. Verification Sample Test Scenario

For developer testing & unit test assertions:

**Input:**
- Members: Total 5, Earning 2, Dependent 3, Children 1, Elderly 1
- Monthly Income: ₹1,00,000.00
- Expenses:
  - Housing: ₹30,000 (Essential)
  - Food: ₹20,000 (Essential)
  - Entertainment: ₹10,000 (Non-essential)

**Expected Backend Output:**
- `dependencyRatio`: `150.00%`
- `dependencyLevel`: `"HIGH"`
- `totalExpenses`: `₹60,000.00`
- `essentialExpenses`: `₹50,000.00` (83.33%)
- `nonEssentialExpenses`: `₹10,000.00` (16.67%)
- `savings`: `₹40,000.00`
- `savingsRate`: `40.00%`
- `expenseRatio`: `60.00%`
- `financialCondition`: `"HEALTHY"`
