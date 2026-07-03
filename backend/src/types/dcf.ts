import { z } from 'zod';

export const dcfEntrySchema = z.object({
  dcfId: z.string(),
  title: z.string(),
  iso27001Ref: z.string().optional(),
  pciDssRef: z.string().optional(),
  evidenceSource: z.string().optional(),
  domain: z.string().optional(),
});

export type DcfEntry = z.infer<typeof dcfEntrySchema>;

export const DCF_COLUMNS = [
  'dcf_id',
  'title',
  'iso_27001_ref',
  'pci_dss_ref',
  'evidence_source',
  'domain',
] as const;
