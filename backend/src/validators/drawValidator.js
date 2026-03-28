import { z } from 'zod';

export const runDrawSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
  mode: z.enum(['random', 'weighted'], { message: 'Mode must be random or weighted' }),
});

export const verifyWinnerSchema = z.object({
  winner_id: z.string().uuid('Invalid winner ID'),
  status: z.enum(['verified', 'rejected'], { message: 'Status must be verified or rejected' }),
  notes: z.string().optional(),
});
