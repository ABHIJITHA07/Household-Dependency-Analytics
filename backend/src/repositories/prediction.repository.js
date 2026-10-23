import db from '../config/db.js';

export class PredictionRepository {
  /**
   * Find latest prediction for a household matching canonical input hash.
   * @param {number} householdId
   * @param {string} inputHash
   * @returns {Promise<object|null>}
   */
  static async findByHouseholdIdAndHash(householdId, inputHash) {
    const [rows] = await db.query(
      `SELECT * FROM predictions
       WHERE household_id = ? AND input_hash = ?
       ORDER BY id DESC LIMIT 1`,
      [householdId, inputHash]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  /**
   * Insert a new prediction record.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create({ householdId, inputHash, featuresJson, predictedRiskLevel, probabilitiesJson, topFactorsJson, modelVersion }) {
    const featStr = typeof featuresJson === 'string' ? featuresJson : JSON.stringify(featuresJson);
    const probStr = typeof probabilitiesJson === 'string' ? probabilitiesJson : JSON.stringify(probabilitiesJson);
    const topStr = typeof topFactorsJson === 'string' ? topFactorsJson : JSON.stringify(topFactorsJson);

    const [result] = await db.query(
      `INSERT INTO predictions (household_id, input_hash, features_json, predicted_risk_level, probabilities_json, top_factors_json, model_version)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [householdId, inputHash, featStr, predictedRiskLevel, probStr, topStr, modelVersion]
    );

    return this.findById(result.insertId);
  }

  /**
   * Find single prediction by ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM predictions WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  /**
   * Find latest prediction for a household regardless of hash.
   * @param {number} householdId
   * @returns {Promise<object|null>}
   */
  static async findLatestByHouseholdId(householdId) {
    const [rows] = await db.query(
      `SELECT * FROM predictions
       WHERE household_id = ?
       ORDER BY id DESC LIMIT 1`,
      [householdId]
    );

    if (rows.length === 0) return null;
    return this._mapRow(rows[0]);
  }

  static _mapRow(row) {
    return {
      id: row.id,
      householdId: row.household_id,
      inputHash: row.input_hash,
      featuresJson: typeof row.features_json === 'string' ? JSON.parse(row.features_json) : row.features_json,
      predictedRiskLevel: row.predicted_risk_level,
      probabilitiesJson: typeof row.probabilities_json === 'string' ? JSON.parse(row.probabilities_json) : row.probabilities_json,
      topFactorsJson: typeof row.top_factors_json === 'string' ? JSON.parse(row.top_factors_json) : row.top_factors_json,
      modelVersion: row.model_version,
      createdAt: row.created_at
    };
  }
}
