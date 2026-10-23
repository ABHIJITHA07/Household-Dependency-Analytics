import { HouseholdService } from '../services/household.service.js';
import { sendSuccess } from '../utils/response.js';

export class HouseholdController {
  /**
   * Controller handler for POST /api/households
   */
  static async create(req, res, next) {
    try {
      const household = await HouseholdService.createHousehold(req.user.userId, req.body);
      return sendSuccess(res, household, 'Household created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for GET /api/households
   */
  static async list(req, res, next) {
    try {
      const households = await HouseholdService.getUserHouseholds(req.user.userId);
      return sendSuccess(res, households, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for GET /api/households/:id
   */
  static async getById(req, res, next) {
    try {
      const household = await HouseholdService.getHouseholdById(req.params.id, req.user.userId);
      return sendSuccess(res, household, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for PUT /api/households/:id
   */
  static async update(req, res, next) {
    try {
      const updated = await HouseholdService.updateHousehold(req.params.id, req.user.userId, req.body);
      return sendSuccess(res, updated, 'Household updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for DELETE /api/households/:id
   */
  static async delete(req, res, next) {
    try {
      await HouseholdService.deleteHousehold(req.params.id, req.user.userId);
      return sendSuccess(res, null, 'Household deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
