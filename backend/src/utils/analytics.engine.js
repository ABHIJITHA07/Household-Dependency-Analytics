import crypto from 'crypto';

/**
 * Pure deterministic calculation function for Dependency Ratio.
 * Dependency Ratio = (dependentMembers / earningMembers) * 100
 * @param {number} dependentMembers
 * @param {number} earningMembers
 * @returns {number|null} Ratio rounded to 2 decimals, or null if earningMembers === 0
 */
export function calculateDependencyRatio(dependentMembers, earningMembers) {
  if (!earningMembers || earningMembers === 0) {
    return null;
  }
  const ratio = (dependentMembers / earningMembers) * 100;
  return Number(ratio.toFixed(2));
}

/**
 * Classify Dependency Level based on Dependency Ratio and Earning Members count.
 * LOW: ratio < 50%
 * MEDIUM: 50% <= ratio <= 100%
 * HIGH: ratio > 100% or zero earning members
 * @param {number|null} dependencyRatio
 * @param {number} earningMembers
 * @returns {'LOW'|'MEDIUM'|'HIGH'}
 */
export function classifyDependencyLevel(dependencyRatio, earningMembers) {
  if (earningMembers === 0 || dependencyRatio === null) {
    return 'HIGH';
  }
  if (dependencyRatio < 50) {
    return 'LOW';
  }
  if (dependencyRatio >= 50 && dependencyRatio <= 100) {
    return 'MEDIUM';
  }
  return 'HIGH';
}

/**
 * Calculate Savings: Monthly Income - Total Expenses.
 * @param {number} monthlyIncome
 * @param {number} totalExpenses
 * @returns {number}
 */
export function calculateSavings(monthlyIncome, totalExpenses) {
  const savings = Number(monthlyIncome) - Number(totalExpenses);
  return Number(savings.toFixed(2));
}

/**
 * Calculate Savings Rate: (Savings / Monthly Income) * 100.
 * If monthlyIncome === 0, returns null.
 * @param {number} savings
 * @param {number} monthlyIncome
 * @returns {number|null}
 */
export function calculateSavingsRate(savings, monthlyIncome) {
  if (!monthlyIncome || Number(monthlyIncome) === 0) {
    return null;
  }
  const rate = (savings / Number(monthlyIncome)) * 100;
  return Number(rate.toFixed(2));
}

/**
 * Calculate Expense Ratio: (Total Expenses / Monthly Income) * 100.
 * If monthlyIncome === 0, returns null.
 * @param {number} totalExpenses
 * @param {number} monthlyIncome
 * @returns {number|null}
 */
export function calculateExpenseRatio(totalExpenses, monthlyIncome) {
  if (!monthlyIncome || Number(monthlyIncome) === 0) {
    return null;
  }
  const ratio = (Number(totalExpenses) / Number(monthlyIncome)) * 100;
  return Number(ratio.toFixed(2));
}

/**
 * Calculate Essential Expense Percentage: (Essential Expenses / Total Expenses) * 100.
 * If totalExpenses === 0, returns 0.00.
 * @param {number} essentialExpenses
 * @param {number} totalExpenses
 * @returns {number}
 */
export function calculateEssentialPercentage(essentialExpenses, totalExpenses) {
  if (!totalExpenses || Number(totalExpenses) === 0) {
    return 0.00;
  }
  const pct = (Number(essentialExpenses) / Number(totalExpenses)) * 100;
  return Number(pct.toFixed(2));
}

/**
 * Calculate Non-Essential Expense Percentage: (Non-Essential Expenses / Total Expenses) * 100.
 * If totalExpenses === 0, returns 0.00.
 * @param {number} nonEssentialExpenses
 * @param {number} totalExpenses
 * @returns {number}
 */
export function calculateNonEssentialPercentage(nonEssentialExpenses, totalExpenses) {
  if (!totalExpenses || Number(totalExpenses) === 0) {
    return 0.00;
  }
  const pct = (Number(nonEssentialExpenses) / Number(totalExpenses)) * 100;
  return Number(pct.toFixed(2));
}

/**
 * Classify Financial Condition based on Income, Savings, and Savings Rate.
 * Rules (from 11_ANALYTICS_AND_FORMULAS.md):
 * 1. NO_INCOME: If monthlyIncome === 0
 * 2. DEFICIT: If Savings < 0
 * 3. TIGHT: If Savings Rate < 10%
 * 4. MODERATE: If 10% <= Savings Rate < 20%
 * 5. HEALTHY: If Savings Rate >= 20%
 * @param {number} monthlyIncome
 * @param {number} savings
 * @param {number|null} savingsRate
 * @returns {'NO_INCOME'|'DEFICIT'|'TIGHT'|'MODERATE'|'HEALTHY'}
 */
export function classifyFinancialCondition(monthlyIncome, savings, savingsRate) {
  if (Number(monthlyIncome) === 0) {
    return 'NO_INCOME';
  }
  if (savings < 0) {
    return 'DEFICIT';
  }
  if (savingsRate === null) {
    return 'NO_INCOME';
  }
  if (savingsRate < 10) {
    return 'TIGHT';
  }
  if (savingsRate >= 10 && savingsRate < 20) {
    return 'MODERATE';
  }
  return 'HEALTHY';
}

/**
 * Generate human-readable explanation texts for demographics and financials.
 * @param {object} params
 * @returns {{ dependencyText: string, financialText: string }}
 */
export function generateExplanations({
  dependentMembers,
  earningMembers,
  dependencyRatio,
  financialCondition,
  savingsRate
}) {
  let dependencyText;
  if (earningMembers === 0 || dependencyRatio === null) {
    dependencyText = 'Not computable (0 earning members). High demographic dependency risk.';
  } else {
    dependencyText = `Your household has ${dependentMembers} dependents per ${earningMembers} earning members (${dependencyRatio.toFixed(2)}%).`;
  }

  let financialText;
  switch (financialCondition) {
    case 'NO_INCOME':
      financialText = 'Zero monthly income reported. Financial condition classified as NO_INCOME.';
      break;
    case 'DEFICIT':
      financialText = 'Monthly expenses exceed monthly income, resulting in a financial deficit.';
      break;
    case 'TIGHT':
      financialText = `Tight savings rate of ${savingsRate !== null ? savingsRate.toFixed(2) : '0.00'}% provides minimal financial cushion.`;
      break;
    case 'MODERATE':
      financialText = `Moderate savings rate of ${savingsRate !== null ? savingsRate.toFixed(2) : '0.00'}% offers moderate financial buffer.`;
      break;
    case 'HEALTHY':
      financialText = `Healthy savings rate of ${savingsRate !== null ? savingsRate.toFixed(2) : '0.00'}% gives strong financial buffer.`;
      break;
    default:
      financialText = 'Financial summary evaluated.';
  }

  return { dependencyText, financialText };
}

/**
 * Compute SHA-256 canonical input hash for caching per 11_ANALYTICS_AND_FORMULAS.md.
 * @param {object} household
 * @param {object} financials
 * @param {Array<{category: string, total: number}>} categoryBreakdown
 * @returns {string} SHA-256 hash string
 */
export function calculateCanonicalInputHash(household, financials, categoryBreakdown = []) {
  const sortedCategoryTotals = [...categoryBreakdown]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map(c => ({
      category: c.category,
      total: Number(c.total).toFixed(2)
    }));

  const canonicalPayload = JSON.stringify({
    totalMembers: household.totalMembers,
    earningMembers: household.earningMembers,
    dependentMembers: household.dependentMembers,
    childrenCount: household.childrenCount,
    elderlyCount: household.elderlyCount,
    monthlyIncome: Number(household.monthlyIncome).toFixed(2),
    totalExpenses: Number(financials.totalExpenses).toFixed(2),
    essentialExpenses: Number(financials.essentialExpenses).toFixed(2),
    nonEssentialExpenses: Number(financials.nonEssentialExpenses).toFixed(2),
    expenseCategoryBreakdown: sortedCategoryTotals
  });

  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

/**
 * Master pure function to compute complete household analytics.
 * @param {object} household - DB household row
 * @param {object} expenseTotals - { totalExpenses, essentialExpenses, nonEssentialExpenses }
 * @param {Array} categoryBreakdown - [{ category, total }]
 * @returns {object} Standard API analytics data object
 */
export function computeAnalytics(household, expenseTotals, categoryBreakdown = []) {
  const totalMembers = Number(household.total_members ?? household.totalMembers);
  const earningMembers = Number(household.earning_members ?? household.earningMembers);
  const dependentMembers = Number(household.dependent_members ?? household.dependentMembers);
  const childrenCount = Number(household.children_count ?? household.childrenCount);
  const elderlyCount = Number(household.elderly_count ?? household.elderlyCount);
  const monthlyIncome = Number(household.monthly_income ?? household.monthlyIncome);

  const totalExpenses = Number(expenseTotals.totalExpenses || 0);
  const essentialExpenses = Number(expenseTotals.essentialExpenses || 0);
  const nonEssentialExpenses = Number(expenseTotals.nonEssentialExpenses || 0);

  // 1. Dependency Analysis
  const dependencyRatio = calculateDependencyRatio(dependentMembers, earningMembers);
  const dependencyLevel = classifyDependencyLevel(dependencyRatio, earningMembers);

  // 2. Financial Analytics
  const savings = calculateSavings(monthlyIncome, totalExpenses);
  const savingsRate = calculateSavingsRate(savings, monthlyIncome);
  const expenseRatio = calculateExpenseRatio(totalExpenses, monthlyIncome);
  const essentialPercentage = calculateEssentialPercentage(essentialExpenses, totalExpenses);
  const nonEssentialPercentage = calculateNonEssentialPercentage(nonEssentialExpenses, totalExpenses);
  const financialCondition = classifyFinancialCondition(monthlyIncome, savings, savingsRate);

  // 3. Explanations
  const explanations = generateExplanations({
    dependentMembers,
    earningMembers,
    dependencyRatio,
    financialCondition,
    savingsRate
  });

  const financials = {
    monthlyIncome: Number(monthlyIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    essentialExpenses: Number(essentialExpenses.toFixed(2)),
    nonEssentialExpenses: Number(nonEssentialExpenses.toFixed(2)),
    savings,
    savingsRate,
    expenseRatio,
    essentialPercentage,
    nonEssentialPercentage,
    financialCondition
  };

  // 4. Input Hash
  const inputHash = calculateCanonicalInputHash(
    {
      totalMembers,
      earningMembers,
      dependentMembers,
      childrenCount,
      elderlyCount,
      monthlyIncome
    },
    financials,
    categoryBreakdown
  );

  return {
    householdId: household.id,
    demographics: {
      totalMembers,
      earningMembers,
      dependentMembers,
      childrenCount,
      elderlyCount
    },
    dependencyRatio,
    dependencyLevel,
    financials,
    explanations,
    inputHash
  };
}
