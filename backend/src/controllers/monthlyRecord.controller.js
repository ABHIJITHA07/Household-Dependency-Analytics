import { MonthlyRecordService } from '../services/monthlyRecord.service.js';
import { sendSuccess } from '../utils/response.js';

export class MonthlyRecordController {
  static async create(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const record = await MonthlyRecordService.createSnapshot(req.user.userId, householdId, req.body);
      return sendSuccess(res, record, 'Monthly snapshot created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const records = await MonthlyRecordService.getSnapshotHistory(req.user.userId, householdId);
      return sendSuccess(res, records);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const recordId = parseInt(req.params.recordId, 10);
      const record = await MonthlyRecordService.getSnapshotById(req.user.userId, householdId, recordId);
      return sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const recordId = parseInt(req.params.recordId, 10);
      await MonthlyRecordService.deleteSnapshot(req.user.userId, householdId, recordId);
      return sendSuccess(res, { success: true }, 'Monthly snapshot deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
