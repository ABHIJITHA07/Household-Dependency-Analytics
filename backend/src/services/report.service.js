import { ReportRepository } from '../repositories/report.repository.js';
import { HouseholdService } from './household.service.js';
import { ExpenseRepository } from '../repositories/expense.repository.js';
import { MonthlyRecordRepository } from '../repositories/monthlyRecord.repository.js';
import { InsightRepository } from '../repositories/insight.repository.js';
import { AnalyticsService } from './analytics.service.js';
import { MlService } from './ml.service.js';
import { PdfService } from './pdf.service.js';
import { AppError } from '../utils/errors.js';

export class ReportService {
  /**
   * Create a new report record.
   */
  static async createReport(userId, householdId, { reportType = 'CURRENT', monthlyRecordId = null }) {
    const household = await HouseholdService.getHouseholdById(householdId, userId);

    let title = 'Household Dependency Analytics Report';
    let periodLabel = 'Current Live Profile';
    let snapshotJson = {};

    if (reportType === 'MONTHLY') {
      if (!monthlyRecordId) {
        throw new AppError('INVALID_INPUT', 400, 'monthlyRecordId is required for MONTHLY reports');
      }

      const snapshot = await MonthlyRecordRepository.findById(monthlyRecordId);
      if (!snapshot || snapshot.householdId !== Number(householdId)) {
        throw new AppError('RECORD_NOT_FOUND', 404, 'Monthly snapshot record not found');
      }

      periodLabel = `Month ${snapshot.recordMonth}/${snapshot.recordYear}`;
      title = `Household Historical Report (${snapshot.recordMonth}/${snapshot.recordYear})`;

      let insightData = null;
      if (snapshot.insightId) {
        const ins = await InsightRepository.findLatestByHouseholdId(householdId);
        if (ins) insightData = ins.contentJson;
      }

      snapshotJson = {
        title,
        periodLabel,
        generatedAt: new Date().toISOString(),
        householdInfo: {
          id: household.id,
          name: household.name,
          location: household.location
        },
        demographics: {
          totalMembers: snapshot.totalMembers,
          earningMembers: snapshot.earningMembers,
          dependentMembers: snapshot.dependentMembers,
          childrenCount: snapshot.childrenCount,
          elderlyCount: snapshot.elderlyCount
        },
        financials: {
          monthlyIncome: snapshot.monthlyIncome,
          totalExpenses: snapshot.totalExpenses,
          essentialExpenses: snapshot.essentialExpenses,
          nonEssentialExpenses: snapshot.nonEssentialExpenses,
          savings: snapshot.monthlySavings,
          savingsRate: snapshot.savingsRate,
          expenseRatio: snapshot.expenseRatio,
          dependencyRatio: snapshot.dependencyRatio,
          dependencyLevel: snapshot.dependencyLevel,
          financialCondition: snapshot.financialCondition
        },
        expenseBreakdown: snapshot.expenseBreakdown || [],
        prediction: {
          predictedRiskLevel: snapshot.predictedRiskLevel,
          predictionId: snapshot.predictionId
        },
        insight: insightData,
        monthlyRecord: {
          recordMonth: snapshot.recordMonth,
          recordYear: snapshot.recordYear,
          notes: snapshot.notes
        }
      };
    } else {
      // Live CURRENT report
      const expenses = await ExpenseRepository.findAllByHouseholdIdAndUserId(householdId, userId);
      const analytics = await AnalyticsService.getHouseholdAnalytics(householdId, userId);
      const mlResult = await MlService.predictRisk(analytics);
      const latestInsight = await InsightRepository.findLatestByHouseholdId(householdId);

      periodLabel = 'Current Live Profile';
      title = 'Household Live Financial Analytics Report';

      snapshotJson = {
        title,
        periodLabel,
        generatedAt: new Date().toISOString(),
        householdInfo: {
          id: household.id,
          name: household.name,
          location: household.location
        },
        demographics: analytics.demographics,
        financials: analytics.financials,
        expenseBreakdown: expenses,
        prediction: mlResult,
        insight: latestInsight ? latestInsight.contentJson : null
      };
    }

    return await ReportRepository.create({
      householdId,
      reportType,
      monthlyRecordId: reportType === 'MONTHLY' ? monthlyRecordId : null,
      title,
      periodLabel,
      snapshotJson
    });
  }

  /**
   * Get single report record detail by ID.
   */
  static async getReportById(userId, reportId) {
    const report = await ReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('REPORT_NOT_FOUND', 404, 'Report not found');
    }

    // Ownership verification via HouseholdService (throws 404 if not owner)
    try {
      await HouseholdService.getHouseholdById(report.householdId, userId);
    } catch {
      throw new AppError('REPORT_NOT_FOUND', 404, 'Report not found'); // Ownership safe 404
    }

    return report;
  }

  /**
   * Download report PDF binary buffer.
   */
  static async downloadReportPDF(userId, reportId) {
    const report = await this.getReportById(userId, reportId);
    const pdfBuffer = await PdfService.generateReportPDF(report.snapshotJson);
    return {
      pdfBuffer,
      filename: `Household_Report_${report.id}.pdf`
    };
  }

  /**
   * List all reports for a household.
   */
  static async getHouseholdReports(userId, householdId) {
    await HouseholdService.getHouseholdById(householdId, userId);
    return await ReportRepository.findAllByHouseholdId(householdId);
  }

  /**
   * Delete report record.
   */
  static async deleteReport(userId, reportId) {
    const report = await this.getReportById(userId, reportId);
    return await ReportRepository.delete(report.id);
  }
}
