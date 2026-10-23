import { ReportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';

export class ReportController {
  static async create(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const report = await ReportService.createReport(req.user.userId, householdId, req.body);
      return sendSuccess(res, report, 'Report created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const report = await ReportService.getReportById(req.user.userId, reportId);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  static async downloadPDF(req, res, next) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const { pdfBuffer, filename } = await ReportService.downloadReportPDF(req.user.userId, reportId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async listByHousehold(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const reports = await ReportService.getHouseholdReports(req.user.userId, householdId);
      return sendSuccess(res, reports);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      await ReportService.deleteReport(req.user.userId, reportId);
      return sendSuccess(res, { success: true }, 'Report deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
