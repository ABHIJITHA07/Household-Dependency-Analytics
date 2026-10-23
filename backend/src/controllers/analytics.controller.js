import { AnalyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';

export class AnalyticsController {
  /**
   * GET /api/households/:id/analytics
   * Retrieve deterministic analytics for a household owned by authenticated user.
   */
  static async getAnalytics(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const userId = req.user.userId;

      const analytics = await AnalyticsService.getHouseholdAnalytics(householdId, userId);
      return sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }
}
