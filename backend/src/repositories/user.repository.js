import db from '../config/db.js';

export class UserRepository {
  /**
   * Find user record by email (case-insensitive lookup).
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = ?',
      [normalizedEmail]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find user record by ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find user record by ID including password_hash for authentication/password verification.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findByIdWithPassword(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Insert new user record into database.
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {string} param0.passwordHash
   * @returns {Promise<object>} Created user object (without password hash)
   */
  static async createUser({ name, email, passwordHash }) {
    const normalizedEmail = email.toLowerCase().trim();
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash]
    );

    return {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail
    };
  }

  /**
   * Update user display name.
   * @param {number} id
   * @param {string} name
   * @returns {Promise<boolean>}
   */
  static async updateName(id, name) {
    const [result] = await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update user password hash.
   * @param {number} id
   * @param {string} passwordHash
   * @returns {Promise<boolean>}
   */
  static async updatePasswordHash(id, passwordHash) {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  }
}
