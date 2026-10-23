import { z } from 'zod';

export const createReportSchema = z.object({
  reportType: z.enum(['CURRENT', 'MONTHLY'], {
    required_error: 'reportType is required'
  }),
  monthlyRecordId: z.number().int().positive('monthlyRecordId must be a positive integer').optional().nullable()
});
