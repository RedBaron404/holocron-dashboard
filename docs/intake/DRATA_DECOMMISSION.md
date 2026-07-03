# [YOUR_GRC_PLATFORM] Decommission Checklist

Holocron fully replaces [YOUR_GRC_PLATFORM]. **No [YOUR_GRC_PLATFORM] API integration exists in this codebase.**

## Parity validation

| [YOUR_GRC_PLATFORM] capability | Holocron replacement | Verified |
|------------------|---------------------|----------|
| Policy / document control | Policy Register + Docs + Drive archive | [ ] |
| Control framework (DCF) | `DCF` Sheet tab (static seed) | [ ] |
| Risk register | `Risks` tab + risk workflows | [ ] |
| Internal audit schedule | `AuditCalendar` + audit program service | [ ] |
| Program calendar / tasks | `ProgramCalendar` + daily scan | [ ] |
| NCR / CAPA | `NCR` tab + workflow service | [ ] |
| Agent activity / audit trail | `AgentActivity` tab | [ ] |
| Evidence archive | Drive archive folders | [ ] |

## Pre-cutover

1. [ ] All seed data pushed: `npm run seed:intake`
2. [ ] `REQUIREMENTS_ASSESSMENT.md` approved
3. [ ] `ACCESS_CHECKLIST.md` required items verified
4. [ ] Daily scan runs successfully for 5 consecutive business days
5. [ ] Dashboard exception queue reflects live data

## Auditor evidence package

Generate before external audit:

```bash
# Export registers (manual or via API)
curl http://localhost:4000/api/policies > evidence/policy-register.json
curl http://localhost:4000/api/risks > evidence/risk-register.json
curl http://localhost:4000/api/audits > evidence/audit-calendar.json
curl http://localhost:4000/api/agent/activity > evidence/agent-activity.json
```

Store exports in read-only Drive folder for external auditor.

## Cutover

1. [ ] Set Holocron as authoritative system of record
2. [ ] Export final snapshot from [YOUR_GRC_PLATFORM] (static files only — no API)
3. [ ] Archive [YOUR_GRC_PLATFORM] exports to Drive
4. [ ] Cancel [YOUR_GRC_PLATFORM] subscription
5. [ ] Remove any [YOUR_GRC_PLATFORM] bookmarks / SSO tiles
6. [ ] Confirm zero [YOUR_GRC_PLATFORM] logins required for routine IMS operations

## Post-cutover

- [ ] Update `docs/intake/DATA_INVENTORY.md` with final Doc IDs
- [ ] No `DRATA_*` env vars in `.env.op`
- [ ] No [YOUR_GRC_PLATFORM] references in runtime code (grep verified)
