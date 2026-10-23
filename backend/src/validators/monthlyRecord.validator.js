import { z } from 'zod';

export const createMonthlyRecordSchema = z.object({
  recordMonth: z.number({ required_error: 'recordMonth is required' })
    .int('recordMonth must be an integer')
    .min(1, 'recordMonth must be between 1 and 12')
    .max(12, 'recordMonth must be between 1 and 12'),
  recordYear: z.number({ required_error: 'recordYear is required' })
    .int('recordYear must be an integer')
    .min(2000, 'recordYear must be between 2000 and 2100')
    .max(2100, 'recordYear must be between 2000 and 2100'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  overwrite: z.boolean().optional().default(false)
});
