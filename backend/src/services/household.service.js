import { HouseholdRepository } from '../repositories/household.repository.js';
import { AppError } from '../utils/errors.js';

export class HouseholdService {
  /**
   * Format DB row (snake_case) to API payload (camelCase).
   * @param {object} row
   * @returns {object}
   */
  static formatHousehold(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      location: row.location,
      totalMembers: row.total_members,
      earningMembers: row.earning_members,
      dependentMembers: row.dependent_members,
      childrenCount: row.children_count,
      elderlyCount: row.elderly_count,
      monthlyIncome: typeof row.monthly_income === 'number' ? row.monthly_income : parseFloat(row.monthly_income),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Create a new household.
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async createHousehold(userId, data) {
    const row = await HouseholdRepository.create({
      userId,
      ...data
    });
    return this.formatHousehold(row);
  }

  /**
   * Get all households belonging to the authenticated user.
   * @param {number} userId
   * @returns {Promise<Array<object>>}
   */
  static async getUserHouseholds(userId) {
    const rows = await HouseholdRepository.findAllByUserId(userId);
    return rows.map(row => this.formatHousehold(row));
  }

  /**
   * Get household by ID with ownership check.
   * Throws 404 NOT_FOUND if household does not exist or belongs to another user.
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<object>}
   */
  static async getHouseholdById(id, userId) {
    const row = await HouseholdRepository.findByIdAndUserId(id, userId);
    if (!row) {
      throw AppError.notFound('Requested resource was not found');
    }
    return this.formatHousehold(row);
  }

  /**
   * Update household with ownership check.
   * Throws 404 NOT_FOUND if household does not exist or belongs to another user.
   * @param {number} id
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async updateHousehold(id, userId, data) {
    const row = await HouseholdRepository.update(id, userId, data);
    if (!row) {
      throw AppError.notFound('Requested resource was not found');
    }
    return this.formatHousehold(row);
  }

  /**
   * Delete household with ownership check.
   * Throws 404 NOT_FOUND if household does not exist or belongs to another user.
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  static async deleteHousehold(id, userId) {
    const isDeleted = await HouseholdRepository.delete(id, userId);
    if (!isDeleted) {
      throw AppError.notFound('Requested resource was not found');
    }
    return true;
  }
}
