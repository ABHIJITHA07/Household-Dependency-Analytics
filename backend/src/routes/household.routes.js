import { Router } from 'express';
import { HouseholdController } from '../controllers/household.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { InsightController } from '../controllers/insight.controller.js';
import { MonthlyRecordController } from '../controllers/monthlyRecord.controller.js';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { householdIdParamSchema } from '../validators/common.validator.js';
import { createHouseholdSchema, updateHouseholdSchema } from '../validators/household.validator.js';
import { createMonthlyRecordSchema } from '../validators/monthlyRecord.validator.js';
import { createReportSchema } from '../validators/report.validator.js';
import { z } from 'zod';

const paramIdSchema = z.union([
  z.number(),
  z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
]);

const monthlyRecordParamsSchema = z.object({
  id: paramIdSchema,
  recordId: paramIdSchema
});

const router = Router();

// Protect all household endpoints with authentication middleware
router.use(authenticate);

router.get('/', HouseholdController.list);
router.post('/', validate(createHouseholdSchema), HouseholdController.create);

router.get('/:id', validate(householdIdParamSchema, 'params'), HouseholdController.getById);
router.put('/:id', validate(householdIdParamSchema, 'params'), validate(updateHouseholdSchema), HouseholdController.update);
router.delete('/:id', validate(householdIdParamSchema, 'params'), HouseholdController.delete);

// Deterministic Analytics Engine route
router.get('/:id/analytics', validate(householdIdParamSchema, 'params'), AnalyticsController.getAnalytics);

// Gemini AI Insights route
router.post('/:id/insights', validate(householdIdParamSchema, 'params'), InsightController.getInsights);

// Monthly Record Snapshot Routes
router.post('/:id/monthly-records', validate(householdIdParamSchema, 'params'), validate(createMonthlyRecordSchema), MonthlyRecordController.create);
router.get('/:id/monthly-records', validate(householdIdParamSchema, 'params'), MonthlyRecordController.list);
router.get('/:id/monthly-records/:recordId', validate(monthlyRecordParamsSchema, 'params'), MonthlyRecordController.getById);
router.delete('/:id/monthly-records/:recordId', validate(monthlyRecordParamsSchema, 'params'), MonthlyRecordController.delete);

// Household Report Routes
router.post('/:id/reports', validate(householdIdParamSchema, 'params'), validate(createReportSchema), ReportController.create);
router.get('/:id/reports', validate(householdIdParamSchema, 'params'), ReportController.listByHousehold);

export default router;
