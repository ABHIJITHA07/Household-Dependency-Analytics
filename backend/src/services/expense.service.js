import { ExpenseRepository } from '../repositories/expense.repository.js';
import { HouseholdRepository } from '../repositories/household.repository.js';
import { AppError } from '../utils/errors.js';

export class ExpenseService {
  /**
   * Format DB row (snake_case) to API payload (camelCase).
   * @param {object} row
   * @returns {object}
   */
  static formatExpense(row) {
    if (!row) return null;
    return {
      id: row.id,
      householdId: row.household_id,
      category: row.category,
      amount: typeof row.amount === 'number' ? row.amount : parseFloat(row.amount),
      isEssential: Boolean(row.is_essential),
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Verify household ownership by user ID.
   * Throws 404 NOT_FOUND if household does not exist or belongs to another user.
   * @param {number} householdId
   * @param {number} userId
   */
  static async verifyHouseholdOwnership(householdId, userId) {
    const household = await HouseholdRepository.findByIdAndUserId(householdId, userId);
    if (!household) {
      throw AppError.notFound('Requested resource was not found');
    }
    return household;
  }

  /**
   * Get all expense items for a household with calculated authoritative totals.
   * @param {number} householdId
   * @param {number} userId
   * @returns {Promise<{items: Array<object>, totals: {totalExpenses: number, essentialExpenses: number, nonEssentialExpenses: number}}>}
   */
  static async getHouseholdExpenses(householdId, userId) {
    await this.verifyHouseholdOwnership(householdId, userId);

    const rows = await ExpenseRepository.findAllByHouseholdIdAndUserId(householdId, userId);
    const totals = await ExpenseRepository.calculateTotals(householdId, userId);

    return {
      items: rows.map(row => this.formatExpense(row)),
      totals
    };
  }

  /**
   * Add a new expense item to a household.
   * @param {number} householdId
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<{expense: object, totals: object}>}
   */
  static async addExpense(householdId, userId, data) {
    await this.verifyHouseholdOwnership(householdId, userId);

    const row = await ExpenseRepository.create({
      householdId,
      ...data
    });

    const totals = await ExpenseRepository.calculateTotals(householdId, userId);

    return {
      expense: this.formatExpense(row),
      totals
    };
  }

  /**
   * Update an existing expense item with ownership validation.
   * @param {number} expenseId
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<{expense: object, totals: object}>}
   */
  static async updateExpense(expenseId, userId, data) {
    const row = await ExpenseRepository.update(expenseId, userId, data);
    if (!row) {
      throw AppError.notFound('Requested resource was not found');
    }

    const totals = await ExpenseRepository.calculateTotals(row.household_id, userId);

    return {
      expense: this.formatExpense(row),
      totals
    };
  }

  /**
   * Delete an existing expense item with ownership validation.
   * @param {number} expenseId
   * @param {number} userId
   * @returns {Promise<{totals: object}>}
   */
  static async deleteExpense(expenseId, userId) {
    const existing = await ExpenseRepository.findByIdAndUserId(expenseId, userId);
    if (!existing) {
      throw AppError.notFound('Requested resource was not found');
    }

    const householdId = existing.household_id;
    await ExpenseRepository.delete(expenseId, userId);

    const totals = await ExpenseRepository.calculateTotals(householdId, userId);

    return {
      totals
    };
  }
}
