import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { householdIdParamSchema } from '../validators/common.validator.js';
import {
  expenseIdParamSchema,
  createExpenseSchema,
  updateExpenseSchema
} from '../validators/expense.validator.js';

const router = Router({ mergeParams: true });

// Household-nested routes: /api/households/:id/expenses
router.get('/households/:id/expenses', authenticate, validate(householdIdParamSchema, 'params'), ExpenseController.listByHousehold);
router.post('/households/:id/expenses', authenticate, validate(householdIdParamSchema, 'params'), validate(createExpenseSchema), ExpenseController.addByHousehold);
router.put('/households/:id/expenses/:expenseId', authenticate, validate(householdIdParamSchema, 'params'), validate(expenseIdParamSchema, 'params'), validate(updateExpenseSchema), ExpenseController.update);
router.delete('/households/:id/expenses/:expenseId', authenticate, validate(householdIdParamSchema, 'params'), validate(expenseIdParamSchema, 'params'), ExpenseController.delete);

// Standalone expense routes: /api/expenses/:expenseId
router.put('/expenses/:expenseId', authenticate, validate(expenseIdParamSchema, 'params'), validate(updateExpenseSchema), ExpenseController.update);
router.delete('/expenses/:expenseId', authenticate, validate(expenseIdParamSchema, 'params'), ExpenseController.delete);

export default router;
