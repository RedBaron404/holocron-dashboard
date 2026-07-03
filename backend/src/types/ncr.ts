import { z } from 'zod';

export const ncrPhaseSchema = z.enum([
  'Identify',
  'Contain',
  'Analyze',
  'Plan',
  'Correct',
  'Verify',
  'Closed',
]);

export const severitySchema = z.enum([
  'Negligible',
  'Low',
  'Moderate',
  'High',
  'Critical',
]);

export type Severity = z.infer<typeof severitySchema>;

export const createNcrSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  impact: severitySchema,
  likelihood: severitySchema,
  dcfControlId: z.string().optional(),
});

export type NCRPhase = z.infer<typeof ncrPhaseSchema>;
export type CreateNCREntry = z.infer<typeof createNcrSchema>;

export interface NCREntry extends CreateNCREntry {
  readonly ncrId: string;
  readonly phase: NCRPhase;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly containmentAction?: string;
  readonly rootCause?: string;
  readonly correctiveAction?: string;
  readonly preventiveAction?: string;
  readonly verifiedBy?: string;
}

export const NCR_COLUMNS = [
  'ncr_id',
  'title',
  'description',
  'impact',
  'likelihood',
  'phase',
  'dcf_control_id',
  'containment_action',
  'root_cause',
  'corrective_action',
  'preventive_action',
  'verified_by',
  'created_at',
  'created_by',
] as const;

export const NCR_PHASE_ORDER: readonly NCRPhase[] = [
  'Identify',
  'Contain',
  'Analyze',
  'Plan',
  'Correct',
  'Verify',
  'Closed',
];
