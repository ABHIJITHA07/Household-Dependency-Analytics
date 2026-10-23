import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export class AuthController {
  /**
   * Controller handler for POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for GET /api/auth/me
   */
  static async me(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for POST /api/auth/logout
   */
  static async logout(req, res, next) {
    try {
      // Stateless JWT acknowledgment
      return sendSuccess(res, null, 'Successfully logged out', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for PUT /api/auth/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updatedUser = await AuthService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, updatedUser, 'Profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for PUT /api/auth/password
   */
  static async changePassword(req, res, next) {
    try {
      await AuthService.changePassword(req.user.userId, req.body);
      return sendSuccess(res, null, 'Password updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
