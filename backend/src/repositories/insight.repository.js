import db from '../config/db.js';

export class InsightRepository {
  /**
   * Find an existing cached AI insight for a household matching canonical input hash.
   * @param {number} householdId
   * @param {string} inputHash
   * @returns {Promise<object|null>}
   */
  static async findByHouseholdIdAndHash(householdId, inputHash) {
    const [rows] = await db.query(
      `SELECT id, household_id, prediction_id, input_hash, content_json, model_name, created_at
       FROM ai_insights
       WHERE household_id = ? AND input_hash = ?
       ORDER BY id DESC LIMIT 1`,
      [householdId, inputHash]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      householdId: row.household_id,
      predictionId: row.prediction_id,
      inputHash: row.input_hash,
      contentJson: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
      modelName: row.model_name,
      createdAt: row.created_at
    };
  }

  /**
   * Insert a new AI insight into database.
   * @param {object} data
   * @returns {Promise<object>}
   */
  static async create({ householdId, predictionId = null, inputHash, contentJson, modelName = 'gemini-1.5-flash' }) {
    const jsonStr = typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson);

    const [result] = await db.query(
      `INSERT INTO ai_insights (household_id, prediction_id, input_hash, content_json, model_name)
       VALUES (?, ?, ?, ?, ?)`,
      [householdId, predictionId, inputHash, jsonStr, modelName]
    );

    const [rows] = await db.query(
      `SELECT id, household_id, prediction_id, input_hash, content_json, model_name, created_at
       FROM ai_insights WHERE id = ?`,
      [result.insertId]
    );

    const row = rows[0];
    return {
      id: row.id,
      householdId: row.household_id,
      predictionId: row.prediction_id,
      inputHash: row.input_hash,
      contentJson: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
      modelName: row.model_name,
      createdAt: row.created_at
    };
  }

  /**
   * Find the latest insight for a household regardless of hash.
   * @param {number} householdId
   * @returns {Promise<object|null>}
   */
  static async findLatestByHouseholdId(householdId) {
    const [rows] = await db.query(
      `SELECT id, household_id, prediction_id, input_hash, content_json, model_name, created_at
       FROM ai_insights
       WHERE household_id = ?
       ORDER BY id DESC LIMIT 1`,
      [householdId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      householdId: row.household_id,
      predictionId: row.prediction_id,
      inputHash: row.input_hash,
      contentJson: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
      modelName: row.model_name,
      createdAt: row.created_at
    };
  }
}
