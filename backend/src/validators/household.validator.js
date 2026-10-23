import { z } from 'zod';

export const createHouseholdSchema = z.object({
  name: z.string({ required_error: 'Household name is required' })
    .min(2, 'Household name must be at least 2 characters')
    .max(100, 'Household name cannot exceed 100 characters')
    .trim(),
  location: z.string().max(120, 'Location cannot exceed 120 characters').optional().nullable(),
  totalMembers: z.number({ required_error: 'Total members count is required' })
    .int('Total members must be an integer')
    .min(1, 'Total members must be at least 1')
    .max(50, 'Total members cannot exceed 50'),
  earningMembers: z.number({ required_error: 'Earning members count is required' })
    .int('Earning members must be an integer')
    .min(0, 'Earning members cannot be negative')
    .max(50, 'Earning members cannot exceed 50'),
  dependentMembers: z.number({ required_error: 'Dependent members count is required' })
    .int('Dependent members must be an integer')
    .min(0, 'Dependent members cannot be negative')
    .max(50, 'Dependent members cannot exceed 50'),
  childrenCount: z.number({ required_error: 'Children count is required' })
    .int('Children count must be an integer')
    .min(0, 'Children count cannot be negative')
    .max(50, 'Children count cannot exceed 50'),
  elderlyCount: z.number({ required_error: 'Elderly count is required' })
    .int('Elderly count must be an integer')
    .min(0, 'Elderly count cannot be negative')
    .max(50, 'Elderly count cannot exceed 50'),
  monthlyIncome: z.number({ required_error: 'Monthly income is required' })
    .min(0, 'Monthly income cannot be negative')
}).refine(data => data.earningMembers <= data.totalMembers, {
  message: 'Earning members cannot exceed total members',
  path: ['earningMembers']
}).refine(data => data.dependentMembers <= data.totalMembers, {
  message: 'Dependent members cannot exceed total members',
  path: ['dependentMembers']
}).refine(data => data.earningMembers + data.dependentMembers <= data.totalMembers, {
  message: 'Earning members plus dependent members cannot exceed total members',
  path: ['earningMembers']
}).refine(data => data.childrenCount + data.elderlyCount <= data.totalMembers, {
  message: 'Children count plus elderly count cannot exceed total members',
  path: ['childrenCount']
});

export const updateHouseholdSchema = createHouseholdSchema;
