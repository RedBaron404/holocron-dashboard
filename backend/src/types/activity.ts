import { z } from 'zod';

export const activityOutcomeSchema = z.enum([
  'success',
  'skipped',
  'error',
  'pending_human',
]);

export const activityLogSchema = z.object({
  logId: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  outcome: activityOutcomeSchema,
  details: z.string().optional(),
});

export type ActivityLogEntry = z.infer<typeof activityLogSchema>;

export const ACTIVITY_COLUMNS = [
  'log_id',
  'timestamp',
  'actor',
  'action',
  'target_type',
  'target_id',
  'outcome',
  'details',
] as const;
