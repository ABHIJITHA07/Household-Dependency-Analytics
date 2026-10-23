import { z } from 'zod';
import { ExpenseCategory } from '../config/constants.js';

const validCategories = Object.values(ExpenseCategory);

export const expenseIdParamSchema = z.object({
  expenseId: z.string().regex(/^\d+$/, 'Expense ID must be a valid positive integer string')
    .transform(val => parseInt(val, 10))
});

export const createExpenseSchema = z.object({
  category: z.enum(validCategories, {
    errorMap: () => ({ message: `Category must be one of: ${validCategories.join(', ')}` })
  }),
  amount: z.number({ required_error: 'Expense amount is required' })
    .min(0, 'Expense amount cannot be negative'),
  isEssential: z.boolean().default(true),
  description: z.string().max(255, 'Description cannot exceed 255 characters').optional().nullable()
});

export const updateExpenseSchema = createExpenseSchema;
