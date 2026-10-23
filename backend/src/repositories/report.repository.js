import db from '../config/db.js';

export class ReportRepository {
  /**
   * Insert a new report record.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create({ householdId, reportType, monthlyRecordId = null, title, periodLabel = null, snapshotJson }) {
    const snapStr = typeof snapshotJson === 'string' ? snapshotJson : JSON.stringify(snapshotJson);

    const [result] = await db.query(
      `INSERT INTO reports (household_id, report_type, monthly_record_id, title, period_label, snapshot_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [householdId, reportType, monthlyRecordId, title, periodLabel, snapStr]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find single report by ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM reports WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  /**
   * Find all reports for a household sorted by creation date descending.
   * @param {number} householdId
   * @returns {Promise<Array<object>>}
   */
  static async findAllByHouseholdId(householdId) {
    const [rows] = await db.query(
      `SELECT * FROM reports
       WHERE household_id = ?
       ORDER BY created_at DESC`,
      [householdId]
    );

    return rows.map(row => this._mapRow(row));
  }

  /**
   * Delete report by ID.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM reports WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  static _mapRow(row) {
    return {
      id: row.id,
      householdId: row.household_id,
      reportType: row.report_type,
      monthlyRecordId: row.monthly_record_id,
      title: row.title,
      periodLabel: row.period_label,
      snapshotJson: typeof row.snapshot_json === 'string' ? JSON.parse(row.snapshot_json) : row.snapshot_json,
      createdAt: row.created_at
    };
  }
}
