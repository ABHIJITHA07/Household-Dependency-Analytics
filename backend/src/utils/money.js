/**
 * Financial Rounding and Formatting Utilities
 */

/**
 * Rounds a financial number to 2 decimal places.
 * @param {number} val
 * @returns {number}
 */
export function roundMoney(val) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a numeric value into INR currency string (₹).
 * @param {number} val
 * @returns {string}
 */
export function formatCurrencyINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}
