import { HealthService } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  /**
   * Controller handler for GET /api/health
   */
  static async getHealth(req, res, next) {
    try {
      const healthData = await HealthService.getSystemHealth();
      const statusCode = healthData.services.database === 'UP' ? 200 : 503;
      return sendSuccess(res, healthData, undefined, statusCode);
    } catch (err) {
      next(err);
    }
  }
}
