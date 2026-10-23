import { HouseholdRepository } from '../repositories/household.repository.js';
import { ExpenseRepository } from '../repositories/expense.repository.js';
import { computeAnalytics } from '../utils/analytics.engine.js';
import { AppError } from '../utils/errors.js';

export class AnalyticsService {
  /**
   * Get pure deterministic household analytics for an authenticated owner.
   * @param {number} householdId
   * @param {number} userId
   * @returns {Promise<object>} Analytics data object matching API spec
   */
  static async getHouseholdAnalytics(householdId, userId) {
    const household = await HouseholdRepository.findByIdAndUserId(householdId, userId);
    if (!household) {
      throw AppError.notFound('Household not found');
    }

    const expenseTotals = await ExpenseRepository.calculateTotals(householdId, userId);
    const categoryBreakdown = await ExpenseRepository.findCategoryBreakdown(householdId, userId);

    return computeAnalytics(household, expenseTotals, categoryBreakdown);
  }
}
