import db from '../config/db.js';

export class MonthlyRecordRepository {
  /**
   * Find existing record by household ID, year, and month.
   * @param {number} householdId
   * @param {number} recordYear
   * @param {number} recordMonth
   * @returns {Promise<object|null>}
   */
  static async findByHouseholdAndPeriod(householdId, recordYear, recordMonth) {
    const [rows] = await db.query(
      `SELECT * FROM monthly_records 
       WHERE household_id = ? AND record_year = ? AND record_month = ?
       LIMIT 1`,
      [householdId, recordYear, recordMonth]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  /**
   * Insert a new monthly record snapshot.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create(data) {
    const expenseBreakdownJson = typeof data.expenseBreakdownJson === 'string'
      ? data.expenseBreakdownJson
      : JSON.stringify(data.expenseBreakdownJson || []);

    const [result] = await db.query(
      `INSERT INTO monthly_records (
        household_id, record_month, record_year,
        total_members, earning_members, dependent_members, children_count, elderly_count,
        monthly_income, total_expenses, essential_expenses, non_essential_expenses,
        monthly_savings, savings_rate, expense_ratio, dependency_ratio,
        dependency_level, financial_condition, expense_breakdown_json,
        predicted_risk_level, prediction_id, insight_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.householdId,
        data.recordMonth,
        data.recordYear,
        data.totalMembers,
        data.earningMembers,
        data.dependentMembers,
        data.childrenCount,
        data.elderlyCount,
        data.monthlyIncome,
        data.totalExpenses,
        data.essentialExpenses,
        data.nonEssentialExpenses,
        data.monthlySavings,
        data.savingsRate,
        data.expenseRatio,
        data.dependencyRatio,
        data.dependencyLevel,
        data.financialCondition,
        expenseBreakdownJson,
        data.predictedRiskLevel || null,
        data.predictionId || null,
        data.insightId || null,
        data.notes || null
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update an existing monthly record.
   * @param {number} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async update(id, data) {
    const expenseBreakdownJson = typeof data.expenseBreakdownJson === 'string'
      ? data.expenseBreakdownJson
      : JSON.stringify(data.expenseBreakdownJson || []);

    await db.query(
      `UPDATE monthly_records SET
        total_members = ?, earning_members = ?, dependent_members = ?,
        children_count = ?, elderly_count = ?, monthly_income = ?,
        total_expenses = ?, essential_expenses = ?, non_essential_expenses = ?,
        monthly_savings = ?, savings_rate = ?, expense_ratio = ?,
        dependency_ratio = ?, dependency_level = ?, financial_condition = ?,
        expense_breakdown_json = ?, predicted_risk_level = ?, prediction_id = ?,
        insight_id = ?, notes = ?
      WHERE id = ?`,
      [
        data.totalMembers,
        data.earningMembers,
        data.dependentMembers,
        data.childrenCount,
        data.elderlyCount,
        data.monthlyIncome,
        data.totalExpenses,
        data.essentialExpenses,
        data.nonEssentialExpenses,
        data.monthlySavings,
        data.savingsRate,
        data.expenseRatio,
        data.dependencyRatio,
        data.dependencyLevel,
        data.financialCondition,
        expenseBreakdownJson,
        data.predictedRiskLevel || null,
        data.predictionId || null,
        data.insightId || null,
        data.notes || null,
        id
      ]
    );

    return this.findById(id);
  }

  /**
   * Find single record by ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM monthly_records WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  /**
   * Find all monthly records for a household sorted by period descending.
   * @param {number} householdId
   * @returns {Promise<Array<object>>}
   */
  static async findAllByHouseholdId(householdId) {
    const [rows] = await db.query(
      `SELECT * FROM monthly_records 
       WHERE household_id = ? 
       ORDER BY record_year DESC, record_month DESC`,
      [householdId]
    );

    return rows.map(row => this._mapRow(row));
  }

  /**
   * Delete a monthly record by ID.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const [result] = await db.query(
      `DELETE FROM monthly_records WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Helper to map database snake_case row to camelCase object.
   */
  static _mapRow(row) {
    return {
      id: row.id,
      householdId: row.household_id,
      recordMonth: row.record_month,
      recordYear: row.record_year,
      totalMembers: row.total_members,
      earningMembers: row.earning_members,
      dependentMembers: row.dependent_members,
      childrenCount: row.children_count,
      elderlyCount: row.elderly_count,
      monthlyIncome: row.monthly_income,
      totalExpenses: row.total_expenses,
      essentialExpenses: row.essential_expenses,
      nonEssentialExpenses: row.non_essential_expenses,
      monthlySavings: row.monthly_savings,
      savingsRate: row.savings_rate !== null ? Number(row.savings_rate) : null,
      expenseRatio: row.expense_ratio !== null ? Number(row.expense_ratio) : null,
      dependencyRatio: row.dependency_ratio !== null ? Number(row.dependency_ratio) : null,
      dependencyLevel: row.dependency_level,
      financialCondition: row.financial_condition,
      expenseBreakdown: typeof row.expense_breakdown_json === 'string'
        ? JSON.parse(row.expense_breakdown_json)
        : (row.expense_breakdown_json || []),
      predictedRiskLevel: row.predicted_risk_level,
      predictionId: row.prediction_id,
      insightId: row.insight_id,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
