import db from '../config/db.js';

export class HealthRepository {
  /**
   * Ping database connection to verify MySQL availability.
   * @returns {Promise<boolean>}
   */
  static async checkDatabaseHealth() {
    try {
      const [rows] = await db.query('SELECT 1 AS alive');
      return rows && rows.length > 0 && rows[0].alive === 1;
    } catch (err) {
      return false;
    }
  }
}
