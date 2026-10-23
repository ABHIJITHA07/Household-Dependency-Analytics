import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid positive integer string')
    .transform(val => parseInt(val, 10))
});

export const householdIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Household ID must be a valid positive integer string')
    .transform(val => parseInt(val, 10))
});
