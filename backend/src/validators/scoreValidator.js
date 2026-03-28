import { z } from 'zod';

export const scoreSchema = z.object({
  score: z.number().int().min(18, 'Score must be at least 18').max(200, 'Score must be at most 200'),
  course_name: z.string().min(2, 'Course name is required').max(200),
  played_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const updateScoreSchema = z.object({
  score: z.number().int().min(18).max(200).optional(),
  course_name: z.string().min(2).max(200).optional(),
  played_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
