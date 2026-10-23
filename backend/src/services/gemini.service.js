import { GoogleGenAI } from '@google/genai';
import { ErrorCode } from '../config/constants.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class GeminiService {
  /**
   * Helper to execute content generation with automatic model fallback across supported models.
   * @param {string} apiKey
   * @param {string} primaryModel
   * @param {string|object} contents
   * @param {object} config
   * @returns {Promise<{text: string, usedModel: string}>}
   */
  static async _generateWithFallback(apiKey, primaryModel, contents, config = {}) {
    const ai = new GoogleGenAI({ apiKey });
    const candidateModels = Array.from(new Set([
      primaryModel,
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ])).filter(Boolean);

    let lastError = null;

    for (const modelCandidate of candidateModels) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Gemini API request timed out after 10000ms for ${modelCandidate}`)), 10000);
        });

        const generatePromise = ai.models.generateContent({
          model: modelCandidate,
          contents,
          config
        });

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const text = result.text || (result.response && typeof result.response.text === 'function' ? result.response.text() : '');

        if (text && text.trim().length > 0) {
          return { text, usedModel: modelCandidate };
        }
      } catch (err) {
        lastError = err;
        logger.warn(`Gemini model ${modelCandidate} failed: ${err.message}. Trying next fallback...`);
      }
    }

    throw lastError || new Error('All Gemini model candidates failed');
  }

  /**
   * Generate structured natural-language insights using Google GenAI SDK (@google/genai).
   * @param {object} analytics - Deterministic analytics object
   * @param {object} mlPrediction - ML prediction object { riskLevel, confidence, modelVersion }
   * @param {Array<{category: string, amount: number, isEssential: boolean}>} categorySummary - Expense category totals
   * @returns {Promise<{sections: object, disclaimer: string, modelName: string}>}
   */
  static async generateInsights(analytics, mlPrediction, categorySummary = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_google_gemini_api_key') || apiKey.includes('your_gemini_api_key')) {
      logger.warn('Gemini API key is not configured in backend environment.');
      throw AppError.serviceUnavailable(
        ErrorCode.AI_UNAVAILABLE,
        'AI suggestions are temporarily unavailable. Your household analytics and ML predictions are fully functional.'
      );
    }

    // Construct de-identified JSON input payload (Zero PII)
    const promptPayload = {
      demographics: {
        totalMembers: analytics.demographics.totalMembers,
        earningMembers: analytics.demographics.earningMembers,
        dependentMembers: analytics.demographics.dependentMembers,
        childrenCount: analytics.demographics.childrenCount,
        elderlyCount: analytics.demographics.elderlyCount
      },
      metrics: {
        dependencyRatio: analytics.dependencyRatio !== null ? `${analytics.dependencyRatio.toFixed(2)}%` : 'Not computable (0 earners)',
        dependencyLevel: analytics.dependencyLevel,
        monthlyIncome: analytics.financials.monthlyIncome,
        totalExpenses: analytics.financials.totalExpenses,
        essentialExpenses: analytics.financials.essentialExpenses,
        nonEssentialExpenses: analytics.financials.nonEssentialExpenses,
        savings: analytics.financials.savings,
        savingsRate: analytics.financials.savingsRate !== null ? `${analytics.financials.savingsRate.toFixed(2)}%` : 'N/A (No income)',
        expenseRatio: analytics.financials.expenseRatio !== null ? `${analytics.financials.expenseRatio.toFixed(2)}%` : 'N/A (No income)',
        essentialPercentage: `${analytics.financials.essentialPercentage.toFixed(2)}%`,
        nonEssentialPercentage: `${analytics.financials.nonEssentialPercentage.toFixed(2)}%`,
        financialCondition: analytics.financials.financialCondition
      },
      mlPrediction: {
        riskLevel: mlPrediction.riskLevel,
        confidence: mlPrediction.confidence,
        modelVersion: mlPrediction.modelVersion
      },
      expenseCategorySummary: categorySummary.map(c => ({
        category: String(c.category).replace(/[^\w\s\/-]/g, ''),
        amount: Number(c.amount),
        isEssential: Boolean(c.isEssential)
      }))
    };

    const systemPrompt = `You are an expert household financial analyst assistant.
Analyze the provided structured financial and demographic data for a household.
You MUST return your response STRICTLY as a valid JSON object matching the exact specified schema.
Do NOT invent numbers, family members, income amounts, debt, or unlisted expenses.
Do NOT calculate new metrics; use only the provided values.
Use prudent, non-prescriptive language ("potentially reducible", "consider reviewing", "may explore").
Do NOT promise guaranteed investment returns or pretend to be a licensed financial advisor.
Never alter the ML prediction risk level or official backend metrics.

Required Output JSON Schema:
{
  "understandHousehold": "Explanation of household demographic structure and earner-to-dependent ratio...",
  "expenseReview": "Review of essential vs non-essential spending patterns...",
  "savingsStability": "Evaluation of monthly cash flow buffer and savings rate resilience...",
  "growthOpportunities": "Practical, realistic suggestions to explore for financial buffer growth...",
  "thingsToMonitor": "Key financial risk factors or demographic elements to monitor...",
  "disclaimer": "This analysis is automatically generated for educational purposes and does not constitute certified financial advice."
}`;

    const fullPrompt = `${systemPrompt}\n\nStructured Household Data:\n\`\`\`json\n${JSON.stringify(promptPayload, null, 2)}\n\`\`\``;

    try {
      const { text, usedModel } = await this._generateWithFallback(apiKey, modelName, fullPrompt, {
        responseMimeType: 'application/json'
      });

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanText);
      }

      const requiredFields = ['understandHousehold', 'expenseReview', 'savingsStability', 'growthOpportunities', 'thingsToMonitor'];
      for (const field of requiredFields) {
        if (!parsed[field] || typeof parsed[field] !== 'string') {
          throw new Error(`Missing or invalid section field in Gemini JSON response: ${field}`);
        }
      }

      const disclaimer = parsed.disclaimer || 'This analysis is automatically generated for educational purposes and does not constitute certified financial advice.';

      return {
        sections: {
          understandHousehold: parsed.understandHousehold,
          expenseReview: parsed.expenseReview,
          savingsStability: parsed.savingsStability,
          growthOpportunities: parsed.growthOpportunities,
          thingsToMonitor: parsed.thingsToMonitor
        },
        disclaimer,
        modelName: usedModel
      };
    } catch (err) {
      logger.error(`Gemini Service Error: ${err.message}`);
      throw AppError.serviceUnavailable(
        ErrorCode.AI_UNAVAILABLE,
        'AI suggestions are temporarily unavailable. Your household analytics and ML predictions are fully functional.'
      );
    }
  }

  /**
   * Interactive Gemini Chat Assistant for Dashboard.
   * @param {string} userMessage - User's chat question
   * @param {object|null} context - Authorized household financial context (optional)
   * @returns {Promise<{reply: string, disclaimer: string, modelName: string}>}
   */
  static async chat(userMessage, context = null) {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_google_gemini_api_key') || apiKey.includes('your_gemini_api_key')) {
      logger.warn('Gemini API key is not configured in backend environment.');
      throw AppError.serviceUnavailable(
        ErrorCode.AI_UNAVAILABLE,
        'Gemini AI Assistant is currently offline. Please ensure GEMINI_API_KEY is configured.'
      );
    }

    const contextBlock = context ? `
Context (Authorized User Household Financial Summary):
- Household Name: ${context.name || 'N/A'}
- Demographics: Total Members ${context.demographics?.totalMembers || 'N/A'}, Earning Members ${context.demographics?.earningMembers || 'N/A'}, Dependent Members ${context.demographics?.dependentMembers || 'N/A'}
- Monthly Income: ₹${context.financials?.monthlyIncome !== undefined ? context.financials.monthlyIncome : 'N/A'}
- Total Monthly Expenses: ₹${context.financials?.totalExpenses !== undefined ? context.financials.totalExpenses : 'N/A'}
- Monthly Net Savings: ₹${context.financials?.savings !== undefined ? context.financials.savings : 'N/A'}
- Savings Rate: ${context.financials?.savingsRate !== null && context.financials?.savingsRate !== undefined ? context.financials.savingsRate + '%' : 'N/A'}
- Dependency Ratio: ${context.dependencyRatio !== null && context.dependencyRatio !== undefined ? context.dependencyRatio + '%' : 'N/A'} (${context.dependencyLevel || 'N/A'})
- Financial Condition: ${context.financials?.financialCondition || 'N/A'}
- Supervised ML Risk Prediction: ${context.mlPrediction?.predictedRiskLevel || 'N/A'}
` : `
Context: No specific household profile attached. Provide helpful, general household budgeting and financial resilience guidance.
`;

    const systemInstructions = `You are "Gemini AI Assistant", a friendly, knowledgeable, and prudent household financial resilience expert integrated into the Household Dependency Analytics & Prediction System.

Your Mission:
1. Provide practical, easy-to-understand household budgeting advice, savings strategies, debt reduction techniques, emergency buffer guidance, and dependency explanations.
2. If household financial context is provided above, use those exact numbers to personalize your response. NEVER invent fake figures, loans, or unlisted expenses.
3. If no household context is provided, answer the user's question clearly with general best practices and kindly note that they can select a household profile on the dashboard for tailored guidance.
4. Maintain a supportive, encouraging, professional tone. Avoid certified legal, tax, or investment promises ("guaranteed returns").
5. Format your response cleanly using markdown (bullet points, bold highlights).
`;

    const fullPrompt = `${systemInstructions}\n${contextBlock}\nUser Question: ${userMessage}`;

    try {
      const { text, usedModel } = await this._generateWithFallback(apiKey, modelName, fullPrompt);

      return {
        reply: text,
        disclaimer: 'This guidance is generated by AI for educational self-assessment purposes and does not constitute certified financial advice.',
        modelName: usedModel
      };
    } catch (err) {
      logger.error(`Gemini Chat Error: ${err.message}`);
      throw AppError.serviceUnavailable(
        ErrorCode.AI_UNAVAILABLE,
        'Gemini AI Assistant is temporarily unavailable. Please try again shortly.'
      );
    }
  }
}
