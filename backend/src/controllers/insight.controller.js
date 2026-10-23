import { InsightService } from '../services/insight.service.js';
import { sendSuccess } from '../utils/response.js';

export class InsightController {
  /**
   * POST /api/households/:id/insights
   * Retrieve AI-generated insights for an owned household, utilizing SHA-256 caching and Gemini SDK.
   */
  static async getInsights(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const userId = req.user.userId;
      const force = Boolean(req.body && req.body.force);

      const insights = await InsightService.getHouseholdInsights(householdId, userId, { force });
      return sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }
}
