import { z } from 'zod';
import { severitySchema } from './ncr.js';

export const riskTreatmentSchema = z.enum([
  'Mitigate',
  'Transfer',
  'Avoid',
  'Accept',
]);

export const riskStatusSchema = z.enum(['Open', 'Monitoring', 'Closed', 'Draft']);

export const riskEntrySchema = z.object({
  riskId: z.string(),
  aspect: z.string(),
  impact: severitySchema,
  likelihood: severitySchema,
  severity: severitySchema,
  treatment: riskTreatmentSchema,
  owner: z.string(),
  leadershipApprover: z.string().optional(),
  status: riskStatusSchema,
  updatedAt: z.string(),
});

export const RISK_COLUMNS = [
  'risk_id',
  'aspect',
  'impact',
  'likelihood',
  'severity',
  'treatment',
  'owner',
  'leadership_approver',
  'status',
  'updated_at',
] as const;

export type RiskStatus = z.infer<typeof riskStatusSchema>;
export type RiskTreatment = z.infer<typeof riskTreatmentSchema>;
export type RiskEntry = z.infer<typeof riskEntrySchema>;

export const createRiskSchema = riskEntrySchema
  .omit({ riskId: true, updatedAt: true })
  .extend({
    riskId: z.string().optional(),
  });

export type CreateRiskEntry = z.infer<typeof createRiskSchema>;
