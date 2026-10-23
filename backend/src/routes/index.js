import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import householdRoutes from './household.routes.js';
import expenseRoutes from './expense.routes.js';
import reportRoutes from './report.routes.js';
import aiRoutes from './ai.routes.js';
import { validate } from '../middleware/validate.middleware.js';
import { z } from 'zod';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// System Health & Liveness
router.use('/', healthRoutes);

// Authentication Routes (/api/auth/*)
router.use('/auth', authRoutes);

// Interactive Gemini AI Chat Routes (/api/ai/*)
router.use('/ai', aiRoutes);

// Expense Routes (/api/expenses/* and /api/households/:id/expenses)
router.use('/', expenseRoutes);

// Household CRUD Routes (/api/households/*)
router.use('/households', householdRoutes);

// Direct Report Routes (/api/reports/*)
router.use('/reports', reportRoutes);

// Test-only validation route (Mounted strictly in development and test environments)
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  const dummySchema = z.object({
    income: z.number({ required_error: 'Income is required' }).min(0, 'Income must be >= 0')
  });

  router.post('/test-validate', validate(dummySchema), (req, res) => {
    return sendSuccess(res, req.body);
  });
}

export default router;
