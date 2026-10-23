import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../validators/common.validator.js';
import { z } from 'zod';

const reportIdParamSchema = z.object({
  reportId: z.string().regex(/^\d+$/, 'reportId must be a valid positive integer')
    .transform(val => parseInt(val, 10))
});

const router = Router();

router.use(authenticate);

// Direct Report endpoints (/api/reports/*)
router.get('/:reportId', validate(reportIdParamSchema, 'params'), ReportController.getById);
router.get('/:reportId/download', validate(reportIdParamSchema, 'params'), ReportController.downloadPDF);
router.delete('/:reportId', validate(reportIdParamSchema, 'params'), ReportController.delete);

export default router;
