import { HouseholdRepository } from '../repositories/household.repository.js';
import { ExpenseRepository } from '../repositories/expense.repository.js';
import { InsightRepository } from '../repositories/insight.repository.js';
import { AnalyticsService } from './analytics.service.js';
import { MlService } from './ml.service.js';
import { GeminiService } from './gemini.service.js';
import { calculateCanonicalInputHash } from '../utils/analytics.engine.js';
import { AppError } from '../utils/errors.js';

export class InsightService {
  /**
   * Orchestrate household AI insight retrieval, handling caching, deterministic analytics, ML prediction, and Gemini generation.
   * @param {number} householdId
   * @param {number} userId
   * @param {object} options - { force: boolean }
   * @returns {Promise<object>} Structured AI Insight matching API specification
   */
  static async getHouseholdInsights(householdId, userId, options = {}) {
    const force = Boolean(options.force);

    // 1. Verify Household Ownership
    const household = await HouseholdRepository.findByIdAndUserId(householdId, userId);
    if (!household) {
      throw AppError.notFound('Household not found');
    }

    // 2. Fetch Deterministic Analytics
    const analytics = await AnalyticsService.getHouseholdAnalytics(householdId, userId);

    // 3. Fetch Category Breakdown for Canonical Input Hash
    const categoryBreakdown = await ExpenseRepository.findCategoryBreakdown(householdId, userId);

    // 4. Compute Canonical SHA-256 Input Hash
    const inputHash = calculateCanonicalInputHash(household, analytics.financials, categoryBreakdown);

    // 5. Cache Lookup (unless force === true)
    if (!force) {
      const cached = await InsightRepository.findByHouseholdIdAndHash(householdId, inputHash);
      if (cached) {
        return {
          insightId: cached.id,
          cached: true,
          modelName: cached.modelName,
          sections: cached.contentJson.sections,
          disclaimer: cached.contentJson.disclaimer,
          createdAt: cached.createdAt
        };
      }
    }

    // 6. Fetch ML Prediction
    const mlPrediction = await MlService.predictRisk(analytics);

    // 7. Fetch Expense Items for De-identified Category Summary
    const expenseItems = await ExpenseRepository.findAllByHouseholdIdAndUserId(householdId, userId);
    const categorySummary = expenseItems.map(item => ({
      category: item.category,
      amount: item.amount,
      isEssential: Boolean(item.is_essential ?? item.isEssential)
    }));

    // 8. Generate Insights via Gemini Service
    const geminiResult = await GeminiService.generateInsights(analytics, mlPrediction, categorySummary);

    // 9. Persist to Database
    const created = await InsightRepository.create({
      householdId,
      inputHash,
      contentJson: {
        sections: geminiResult.sections,
        disclaimer: geminiResult.disclaimer
      },
      modelName: geminiResult.modelName
    });

    return {
      insightId: created.id,
      cached: false,
      modelName: created.modelName,
      sections: created.contentJson.sections,
      disclaimer: created.contentJson.disclaimer,
      createdAt: created.createdAt
    };
  }
}
