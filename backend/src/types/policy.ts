import { z } from 'zod';

export const policyStatusSchema = z.enum([
  'Draft',
  'In Review',
  'Approved',
  'Archived',
  'Superseded',
  'Retired',
]);

export const policyEntrySchema = z.object({
  policyId: z.string(),
  title: z.string(),
  frameworks: z.string(),
  owner: z.string().email(),
  approver: z.string().email(),
  version: z.string(),
  effectiveDate: z.string(),
  nextReviewDate: z.string(),
  status: policyStatusSchema,
  docId: z.string().optional(),
  archiveFileId: z.string().optional(),
  dcfControls: z.string().optional(),
  reviewCadenceDays: z.coerce.number().optional(),
});

export type PolicyStatus = z.infer<typeof policyStatusSchema>;
export type PolicyEntry = z.infer<typeof policyEntrySchema>;

export const POLICY_COLUMNS = [
  'policy_id',
  'title',
  'frameworks',
  'owner',
  'approver',
  'version',
  'effective_date',
  'next_review_date',
  'status',
  'doc_id',
  'archive_file_id',
  'dcf_controls',
  'review_cadence_days',
] as const;

export const policyDueWindowSchema = z.enum(['overdue', '30', '14', '7', '1']);

export interface PolicyDueItem {
  readonly policy: PolicyEntry;
  readonly window: z.infer<typeof policyDueWindowSchema>;
  readonly daysUntilDue: number;
}
