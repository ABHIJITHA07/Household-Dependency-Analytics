import { ExpenseService } from '../services/expense.service.js';
import { sendSuccess } from '../utils/response.js';

export class ExpenseController {
  /**
   * Controller handler for GET /api/households/:id/expenses
   */
  static async listByHousehold(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const result = await ExpenseService.getHouseholdExpenses(householdId, req.user.userId);
      return sendSuccess(res, result, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for POST /api/households/:id/expenses
   */
  static async addByHousehold(req, res, next) {
    try {
      const householdId = parseInt(req.params.id, 10);
      const result = await ExpenseService.addExpense(householdId, req.user.userId, req.body);
      return sendSuccess(res, result, 'Expense item added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for PUT /api/expenses/:expenseId or /api/households/:id/expenses/:expenseId
   */
  static async update(req, res, next) {
    try {
      const expenseId = parseInt(req.params.expenseId || req.params.id, 10);
      const result = await ExpenseService.updateExpense(expenseId, req.user.userId, req.body);
      return sendSuccess(res, result, 'Expense item updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Controller handler for DELETE /api/expenses/:expenseId or /api/households/:id/expenses/:expenseId
   */
  static async delete(req, res, next) {
    try {
      const expenseId = parseInt(req.params.expenseId || req.params.id, 10);
      const result = await ExpenseService.deleteExpense(expenseId, req.user.userId);
      return sendSuccess(res, result, 'Expense item deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
