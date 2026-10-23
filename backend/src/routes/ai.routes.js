import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { GeminiService } from '../services/gemini.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { MlService } from '../services/ml.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// Require authentication for AI chat
router.use(authenticate);

/**
 * POST /api/ai/chat
 * Interactive Gemini AI Chat endpoint.
 * Body: { message: string, householdId?: number }
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, householdId } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw AppError.badRequest('Message content is required');
    }

    if (message.length > 1000) {
      throw AppError.badRequest('Message exceeds maximum length of 1000 characters');
    }

    let context = null;

    if (householdId && !isNaN(parseInt(householdId, 10))) {
      try {
        const parsedId = parseInt(householdId, 10);
        const analytics = await AnalyticsService.getHouseholdAnalytics(parsedId, req.user.userId);
        const prediction = await MlService.predictRisk(analytics);

        context = {
          name: analytics.householdName || 'Selected Household',
          demographics: analytics.demographics,
          financials: analytics.financials,
          dependencyRatio: analytics.dependencyRatio,
          dependencyLevel: analytics.dependencyLevel,
          mlPrediction: prediction
        };
      } catch (err) {
        // Context fetch error - fall back to general chat context without breaking request
        context = null;
      }
    }

    const result = await GeminiService.chat(message.trim(), context);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
