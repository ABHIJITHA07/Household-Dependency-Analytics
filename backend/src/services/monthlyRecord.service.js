import { MonthlyRecordRepository } from '../repositories/monthlyRecord.repository.js';
import { HouseholdService } from './household.service.js';
import { ExpenseRepository } from '../repositories/expense.repository.js';
import { PredictionRepository } from '../repositories/prediction.repository.js';
import { InsightRepository } from '../repositories/insight.repository.js';
import { AnalyticsService } from './analytics.service.js';
import { MlService } from './ml.service.js';
import { AppError } from '../utils/errors.js';
import { computeCanonicalHash } from '../utils/hash.js';

export class MonthlyRecordService {
  /**
   * Save active household state as an immutable monthly snapshot.
   */
  static async createSnapshot(userId, householdId, { recordMonth, recordYear, notes = null, overwrite = false }) {
    // 1. Ownership check (throws 404 if not found or not owner)
    const household = await HouseholdService.getHouseholdById(householdId, userId);

    // 2. Future Period Validation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    if (recordYear > currentYear || (recordYear === currentYear && recordMonth > currentMonth)) {
      throw new AppError('INVALID_PERIOD', 422, 'Cannot create a monthly record for a future period');
    }

    // 3. Duplicate Period Check
    const existing = await MonthlyRecordRepository.findByHouseholdAndPeriod(householdId, recordYear, recordMonth);
    if (existing && !overwrite) {
      throw new AppError(
        'RECORD_EXISTS',
        409,
        `A monthly record for period ${recordMonth}/${recordYear} already exists. Overwrite?`
      );
    }

    // 4. Snapshot Freeze Calculation
    const analytics = await AnalyticsService.getHouseholdAnalytics(householdId, userId);
    const expenses = await ExpenseRepository.findAllByHouseholdIdAndUserId(householdId, userId);

    // Predict Risk & Save Prediction Record
    const mlResult = await MlService.predictRisk(analytics);
    const inputHash = computeCanonicalHash({ household, analytics, expenses, mlResult });
    
    let predictionRecord = await PredictionRepository.findByHouseholdIdAndHash(householdId, inputHash);
    if (!predictionRecord) {
      predictionRecord = await PredictionRepository.create({
        householdId,
        inputHash,
        featuresJson: analytics,
        predictedRiskLevel: mlResult.riskLevel,
        probabilitiesJson: mlResult.probabilities,
        topFactorsJson: mlResult.topFactors,
        modelVersion: mlResult.modelVersion
      });
    }

    // Fetch Latest AI Insight
    const latestInsight = await InsightRepository.findLatestByHouseholdId(householdId);

    const snapshotPayload = {
      householdId,
      recordMonth: Number(recordMonth),
      recordYear: Number(recordYear),
      totalMembers: household.totalMembers,
      earningMembers: household.earningMembers,
      dependentMembers: household.dependentMembers,
      childrenCount: household.childrenCount,
      elderlyCount: household.elderlyCount,
      monthlyIncome: analytics.financials.monthlyIncome,
      totalExpenses: analytics.financials.totalExpenses,
      essentialExpenses: analytics.financials.essentialExpenses,
      nonEssentialExpenses: analytics.financials.nonEssentialExpenses,
      monthlySavings: analytics.financials.savings,
      savingsRate: analytics.financials.savingsRate,
      expenseRatio: analytics.financials.expenseRatio,
      dependencyRatio: analytics.dependencyRatio,
      dependencyLevel: analytics.dependencyLevel,
      financialCondition: analytics.financials.financialCondition,
      expenseBreakdownJson: expenses,
      predictedRiskLevel: mlResult.riskLevel,
      predictionId: predictionRecord ? predictionRecord.id : null,
      insightId: latestInsight ? latestInsight.id : null,
      notes: notes ? String(notes).trim() : null
    };

    if (existing && overwrite) {
      return await MonthlyRecordRepository.update(existing.id, snapshotPayload);
    } else {
      return await MonthlyRecordRepository.create(snapshotPayload);
    }
  }

  /**
   * Get list of historical monthly snapshot records for a household.
   */
  static async getSnapshotHistory(userId, householdId) {
    await HouseholdService.getHouseholdById(householdId, userId);
    return await MonthlyRecordRepository.findAllByHouseholdId(householdId);
  }

  /**
   * Get single historical snapshot by record ID.
   */
  static async getSnapshotById(userId, householdId, recordId) {
    await HouseholdService.getHouseholdById(householdId, userId);

    const record = await MonthlyRecordRepository.findById(recordId);
    if (!record || record.householdId !== Number(householdId)) {
      throw new AppError('RECORD_NOT_FOUND', 404, 'Monthly snapshot record not found');
    }

    return record;
  }

  /**
   * Delete a monthly snapshot.
   */
  static async deleteSnapshot(userId, householdId, recordId) {
    await HouseholdService.getHouseholdById(householdId, userId);

    const record = await MonthlyRecordRepository.findById(recordId);
    if (!record || record.householdId !== Number(householdId)) {
      throw new AppError('RECORD_NOT_FOUND', 404, 'Monthly snapshot record not found');
    }

    return await MonthlyRecordRepository.delete(recordId);
  }
}
