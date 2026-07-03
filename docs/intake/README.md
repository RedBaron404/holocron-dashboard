# IMS Intake Package

Deposit Corporate IMS artifacts here **before** Holocron becomes authoritative. [YOUR_GRC_PLATFORM] is not integrated — only static exports.

## Required artifacts

| Path | Artifact | Status |
|------|----------|--------|
| `policies/` | Full `[YOUR-POLICY-*]` policy set (PDF or Doc exports) | **Pending user deposit** |
| `policies/internal-audit-policy.pdf` | Internal audit policy + schedule | Pending |
| `exports/risk-register.csv` | Current risk register | See `seed/risk-register.csv` for template |
| `exports/dcf-map.csv` | DCF / control map snapshot | See `seed/dcf-map.csv` |
| `exports/policy-register.csv` | Policy metadata + Doc IDs | See `seed/policy-register.csv` |
| `exports/program-calendar.csv` | Recurring IMS tasks | See `seed/program-calendar.csv` |
| `exports/ncr-log.csv` | Open NCR/CAPA items (if any) | Optional |
| `raci/owners.csv` | Policy owners and approvers | Optional |

## Seed templates

The `seed/` directory contains CSV templates aligned with [`sheets-schema.md`](../sheets-schema.md). Run `npm run seed:intake` (from repo root) after configuring Google Sheets IDs to push seed data.

## Linked Drive folders

Document canonical locations in [`DATA_INVENTORY.md`](./DATA_INVENTORY.md) when policies remain in Drive (recommended).
