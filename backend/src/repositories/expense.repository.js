import db from '../config/db.js';

export class ExpenseRepository {
  /**
   * Find all expense items belonging to a specific household, ensuring the household is owned by userId.
   * @param {number} householdId
   * @param {number} userId
   * @returns {Promise<Array<object>>}
   */
  static async findAllByHouseholdIdAndUserId(householdId, userId) {
    const [rows] = await db.query(
      `SELECT e.id, e.household_id, e.category, e.amount, e.is_essential, e.description, e.created_at, e.updated_at
       FROM expenses e
       JOIN households h ON e.household_id = h.id
       WHERE e.household_id = ? AND h.user_id = ?
       ORDER BY e.created_at DESC`,
      [householdId, userId]
    );
    return rows;
  }

  /**
   * Find a specific expense item by expenseId ensuring its household is owned by userId.
   * @param {number} expenseId
   * @param {number} userId
   * @returns {Promise<object|null>}
   */
  static async findByIdAndUserId(expenseId, userId) {
    const [rows] = await db.query(
      `SELECT e.id, e.household_id, e.category, e.amount, e.is_essential, e.description, e.created_at, e.updated_at
       FROM expenses e
       JOIN households h ON e.household_id = h.id
       WHERE e.id = ? AND h.user_id = ?`,
      [expenseId, userId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Insert a new expense item into database.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create({ householdId, category, amount, isEssential, description = null }) {
    const [result] = await db.query(
      `INSERT INTO expenses (household_id, category, amount, is_essential, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        householdId,
        category,
        amount,
        isEssential ? 1 : 0,
        description ? description.trim() : null
      ]
    );

    const [rows] = await db.query(
      'SELECT id, household_id, category, amount, is_essential, description, created_at, updated_at FROM expenses WHERE id = ?',
      [result.insertId]
    );
    return rows[0];
  }

  /**
   * Update an existing expense item ensuring ownership.
   * @param {number} expenseId
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<object|null>}
   */
  static async update(expenseId, userId, { category, amount, isEssential, description = null }) {
    // Verify ownership before update
    const existing = await this.findByIdAndUserId(expenseId, userId);
    if (!existing) return null;

    await db.query(
      `UPDATE expenses 
       SET category = ?, amount = ?, is_essential = ?, description = ?
       WHERE id = ?`,
      [
        category,
        amount,
        isEssential ? 1 : 0,
        description ? description.trim() : null,
        expenseId
      ]
    );

    return this.findByIdAndUserId(expenseId, userId);
  }

  /**
   * Delete an expense item ensuring ownership.
   * @param {number} expenseId
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  static async delete(expenseId, userId) {
    const existing = await this.findByIdAndUserId(expenseId, userId);
    if (!existing) return false;

    const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [expenseId]);
    return result.affectedRows > 0;
  }

  /**
   * Calculate authoritative expense totals (total, essential, non-essential) from database rows.
   * @param {number} householdId
   * @param {number} userId
   * @returns {Promise<{totalExpenses: number, essentialExpenses: number, nonEssentialExpenses: number}>}
   */
  static async calculateTotals(householdId, userId) {
    const [rows] = await db.query(
      `SELECT 
         COALESCE(SUM(amount), 0) AS total_expenses,
         COALESCE(SUM(CASE WHEN is_essential = 1 THEN amount ELSE 0 END), 0) AS essential_expenses,
         COALESCE(SUM(CASE WHEN is_essential = 0 THEN amount ELSE 0 END), 0) AS non_essential_expenses
       FROM expenses e
       JOIN households h ON e.household_id = h.id
       WHERE e.household_id = ? AND h.user_id = ?`,
      [householdId, userId]
    );

    const row = rows[0];
    return {
      totalExpenses: typeof row.total_expenses === 'number' ? row.total_expenses : parseFloat(row.total_expenses || 0),
      essentialExpenses: typeof row.essential_expenses === 'number' ? row.essential_expenses : parseFloat(row.essential_expenses || 0),
      nonEssentialExpenses: typeof row.non_essential_expenses === 'number' ? row.non_essential_expenses : parseFloat(row.non_essential_expenses || 0)
    };
  }

  /**
   * Find expense breakdown grouped by category for a household owned by userId.
   * @param {number} householdId
   * @param {number} userId
   * @returns {Promise<Array<{category: string, total: number}>>}
   */
  static async findCategoryBreakdown(householdId, userId) {
    const [rows] = await db.query(
      `SELECT e.category, COALESCE(SUM(e.amount), 0) AS total
       FROM expenses e
       JOIN households h ON e.household_id = h.id
       WHERE e.household_id = ? AND h.user_id = ?
       GROUP BY e.category
       ORDER BY e.category ASC`,
      [householdId, userId]
    );

    return rows.map(r => ({
      category: r.category,
      total: typeof r.total === 'number' ? r.total : parseFloat(r.total || 0)
    }));
  }
}
