import db from '../config/db.js';

export class HouseholdRepository {
  /**
   * Find all households belonging to a specific authenticated user.
   * @param {number} userId
   * @returns {Promise<Array<object>>}
   */
  static async findAllByUserId(userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, name, location, total_members, earning_members, 
              dependent_members, children_count, elderly_count, monthly_income, 
              created_at, updated_at 
       FROM households 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Find a specific household by ID with strict ownership validation (user_id = userId).
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<object|null>}
   */
  static async findByIdAndUserId(id, userId) {
    const [rows] = await db.query(
      `SELECT id, user_id, name, location, total_members, earning_members, 
              dependent_members, children_count, elderly_count, monthly_income, 
              created_at, updated_at 
       FROM households 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Insert a new household record.
   * @param {object} data
   * @returns {Promise<object>} Created household record
   */
  static async create({
    userId,
    name,
    location = null,
    totalMembers,
    earningMembers,
    dependentMembers,
    childrenCount,
    elderlyCount,
    monthlyIncome
  }) {
    const [result] = await db.query(
      `INSERT INTO households (
        user_id, name, location, total_members, earning_members, 
        dependent_members, children_count, elderly_count, monthly_income
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        location ? location.trim() : null,
        totalMembers,
        earningMembers,
        dependentMembers,
        childrenCount,
        elderlyCount,
        monthlyIncome
      ]
    );

    return this.findByIdAndUserId(result.insertId, userId);
  }

  /**
   * Update a household record with strict ownership isolation.
   * @param {number} id
   * @param {number} userId
   * @param {object} data
   * @returns {Promise<object|null>} Updated household or null if not owned/found
   */
  static async update(id, userId, {
    name,
    location = null,
    totalMembers,
    earningMembers,
    dependentMembers,
    childrenCount,
    elderlyCount,
    monthlyIncome
  }) {
    const [result] = await db.query(
      `UPDATE households 
       SET name = ?, location = ?, total_members = ?, earning_members = ?, 
           dependent_members = ?, children_count = ?, elderly_count = ?, monthly_income = ?
       WHERE id = ? AND user_id = ?`,
      [
        name.trim(),
        location ? location.trim() : null,
        totalMembers,
        earningMembers,
        dependentMembers,
        childrenCount,
        elderlyCount,
        monthlyIncome,
        id,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findByIdAndUserId(id, userId);
  }

  /**
   * Delete a household record with strict ownership isolation.
   * Foreign key constraints automatically cascade and remove related expenses, snapshots, etc.
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<boolean>} True if deleted, false if not owned/found
   */
  static async delete(id, userId) {
    const [result] = await db.query(
      'DELETE FROM households WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}
