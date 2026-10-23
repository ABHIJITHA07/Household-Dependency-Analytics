import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/errors.js';
import { ErrorCode } from '../config/constants.js';
import env from '../config/env.js';

const BCRYPT_SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Generate JWT authentication token.
   * @param {object} user - User object { id, email }
   * @returns {string} JWT string
   */
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      env.jwt.secret,
      {
        expiresIn: env.jwt.expiresIn,
        algorithm: 'HS256'
      }
    );
  }

  /**
   * Register new user account.
   * @param {object} param0
   * @param {string} param0.name
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<{user: {id: number, name: string, email: string}, token: string}>}
   */
  static async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user by email
    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw AppError.conflict(
        ErrorCode.EMAIL_EXISTS,
        'An account with this email address already exists'
      );
    }

    // Hash password with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user in database
    const user = await UserRepository.createUser({
      name,
      email: normalizedEmail,
      passwordHash
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  /**
   * Authenticate user with credentials.
   * @param {object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<{user: {id: number, name: string, email: string}, token: string}>}
   */
  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Generic error message to prevent user account enumeration
    const genericAuthError = AppError.unauthorized(
      'Invalid email or password',
      ErrorCode.INVALID_CREDENTIALS
    );

    const user = await UserRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw genericAuthError;
    }

    // Compare plaintext password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  /**
   * Get user details by ID.
   * @param {number} userId
   * @returns {Promise<{id: number, name: string, email: string}>}
   */
  static async getCurrentUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User account not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  /**
   * Update user display name profile.
   * @param {number} userId
   * @param {object} param1
   * @param {string} param1.name
   * @returns {Promise<{id: number, name: string, email: string}>}
   */
  static async updateProfile(userId, { name }) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User account not found');
    }

    await UserRepository.updateName(userId, name);

    return {
      id: user.id,
      name: name.trim(),
      email: user.email
    };
  }

  /**
   * Change user password.
   * @param {number} userId
   * @param {object} param1
   * @param {string} param1.currentPassword
   * @param {string} param1.newPassword
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) {
      throw AppError.notFound('User account not found');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      throw AppError.unauthorized('Current password entered is incorrect', ErrorCode.INVALID_CREDENTIALS);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await UserRepository.updatePasswordHash(userId, newPasswordHash);

    return true;
  }
}
