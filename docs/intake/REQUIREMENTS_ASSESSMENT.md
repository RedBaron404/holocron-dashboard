# Requirements Assessment — Corporate IMS / GRC Analyst Agent

**Date:** [Current Year]-07-02  
**Status:** Draft — pending user sign-off  
**Intake reviewed:** `docs/intake/seed/*` templates + ims-management-review-[Current Year] cross-reference

## Executive summary

Holocron can replace [YOUR_GRC_PLATFORM] for **policy lifecycle**, **risk register**, **internal audit program**, **program calendar**, and **NCR/CAPA** without retaining any [YOUR_GRC_PLATFORM] API integration. Seed templates establish the minimum viable data model; full `POL-OC-*` PDF/Doc deposits in `docs/intake/policies/` remain **pending** for final owner/approver validation.

## Extracted rules (from intake + IMS context)

### Policy lifecycle

| Rule | Source | Encoding |
|------|--------|----------|
| Default annual review for `POL-OC-*` | Plan + seed policy-register | `review_cadence_days=365` unless overridden |
| [YOUR POLICY FOR IMS Management Review] tied to Q4 Management Review | ims-management-review-[Current Year] | Program calendar task `PC-006` |
| Document control via [YOUR_CONTROL_ID] | grc-workflows skill | `dcf_controls` on Policy Register |
| Approval before archive | Plan autonomy matrix | Human confirms before `initiateDocumentApproval` |
| Post-audit policy candidates | Management Review [Current Year] deck | Agent proposes; human approves ([YOUR POLICY FOR DLP] DLP, etc.) |

### Internal audit program

| Quarter | Domain | Scope |
|---------|--------|-------|
| Q1 | ISMS | Clauses 4–10, Annex A |
| Q2 | PIMS | Clauses 5–8, Annex A.9–A.12 |
| Q3 | AIMS | Clauses 4–10, AI controls |
| Q4 | Integrated | Management Review ([YOUR POLICY FOR IMS Management Review] §7–§8) |

Kickoff requires human confirmation. Agent generates checklist from DCF map filtered by domain.

### Risk register

| Rule | Encoding |
|------|----------|
| Impact × Likelihood → Severity | `riskWorkflowService.calculateSeverity()` |
| `Accept` requires `leadership_approver` | Zod + write gate |
| Quarterly review reminders | Program calendar `PC-002` |
| Staleness threshold | 90 days default (`RISK_STALE_DAYS` env) |

### Program calendar (recurring IMS tasks)

All tasks in `seed/program-calendar.csv` are in scope for v1 daily scan. Deferred: vendor risk module, full LMS/HR attestations.

## Gaps vs. plan

| Gap | Severity | Resolution |
|-----|----------|------------|
| Full POL-OC-* corpus not deposited | Medium | User adds PDFs to `docs/intake/policies/`; update policy-register.csv with real `doc_id` values |
| Drive folder IDs unknown | High | Complete ACCESS_CHECKLIST.md Phase 0b |
| Drive Approvals API tier unknown | Medium | Verify in 0b; fallback = manual `status=In Review` in register |
| Notification channel not chosen | Medium | Default: log + daily digest API; Gmail when verified |
| Real owner emails in seed are placeholders | Low | Replace with RACI export |

## Scope adjustments

1. **[YOUR_GRC_PLATFORM]:** No runtime integration. One-time CSV seed only.
2. **Security metrics:** Optional v1 — link to security-analytics-dashboard later.
3. **External auditor portal:** Phase G — read-only Drive folder.

## Sign-off

- [ ] User approves requirements as stated
- [ ] User deposits full policy suite to `docs/intake/policies/`
- [ ] ACCESS_CHECKLIST.md all required items `verified`

**Approved by:** _________________ **Date:** _________
