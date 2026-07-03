import { z } from 'zod';

export const programCadenceSchema = z.enum([
  'Monthly',
  'Quarterly',
  'Annual',
]);

export const programTaskStatusSchema = z.enum([
  'Active',
  'Paused',
  'Complete',
]);

export const programTaskSchema = z.object({
  taskId: z.string(),
  category: z.string(),
  title: z.string(),
  cadence: programCadenceSchema,
  owner: z.string().email(),
  nextDueDate: z.string(),
  linkedRegister: z.string().optional(),
  linkedId: z.string().optional(),
  escalationDays: z.coerce.number(),
  status: programTaskStatusSchema,
});

export type ProgramTask = z.infer<typeof programTaskSchema>;

export const PROGRAM_COLUMNS = [
  'task_id',
  'category',
  'title',
  'cadence',
  'owner',
  'next_due_date',
  'linked_register',
  'linked_id',
  'escalation_days',
  'status',
] as const;

export interface ProgramTaskAlert {
  readonly task: ProgramTask;
  readonly daysUntilDue: number;
  readonly severity: 'overdue' | 'escalation' | 'due_soon';
}
