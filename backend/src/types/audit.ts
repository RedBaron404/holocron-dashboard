import { z } from 'zod';

export const auditDomainSchema = z.enum([
  'ISMS',
  'PIMS',
  'AIMS',
  'Integrated',
]);

export const auditStatusSchema = z.enum([
  'Planned',
  'In Progress',
  'Complete',
]);

export const auditEntrySchema = z.object({
  auditId: z.string(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  domain: auditDomainSchema,
  controlRef: z.string(),
  scheduledDate: z.string(),
  status: auditStatusSchema,
  leadAuditor: z.string().optional(),
  auditee: z.string().optional(),
  kickoffDate: z.string().optional(),
  evidenceFolderId: z.string().optional(),
  findingCount: z.coerce.number().optional(),
  reportDocId: z.string().optional(),
});

export type AuditEntry = z.infer<typeof auditEntrySchema>;

export const AUDIT_COLUMNS = [
  'audit_id',
  'quarter',
  'domain',
  'control_ref',
  'scheduled_date',
  'status',
  'lead_auditor',
  'auditee',
  'kickoff_date',
  'evidence_folder_id',
  'finding_count',
  'report_doc_id',
] as const;

export const QUARTERLY_AUDIT_SCOPE: Record<
  z.infer<typeof auditDomainSchema>,
  string
> = {
  ISMS: 'Clauses 4–10, Annex A',
  PIMS: 'Clauses 5–8, Annex A.9–A.12',
  AIMS: 'Clauses 4–10, AI controls',
  Integrated: 'Management Review prep ([YOUR POLICY FOR IMS Management Review])',
};
