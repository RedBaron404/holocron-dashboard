# Risk Register — tab `Risks`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| risk_id | string | yes | e.g. AA-08 |
| aspect | string | yes | Threat description |
| impact | enum | yes | Negligible … Critical |
| likelihood | enum | yes | Negligible … Critical |
| severity | enum | yes | Calculated or manual |
| treatment | enum | yes | Mitigate, Transfer, Avoid, Accept |
| owner | string | yes | Process owner email |
| leadership_approver | string | no | Required if treatment=Accept |
| status | enum | yes | Open, Monitoring, Closed |
| updated_at | ISO8601 | yes | |

# NCR Log — tab `NCR`

| Column | Type | Required |
|--------|------|----------|
| ncr_id | string | yes (auto UUID) |
| title | string | yes |
| description | string | yes |
| impact | enum | yes |
| likelihood | enum | yes |
| phase | enum | yes |
| dcf_control_id | string | no |
| containment_action | string | no |
| root_cause | string | no |
| corrective_action | string | no |
| preventive_action | string | no |
| verified_by | string | no |
| created_at | ISO8601 | yes |
| created_by | string | yes |

# CAPA — tab `CAPA`

| Column | Type | Required |
|--------|------|----------|
| capa_id | string | yes |
| ncr_id | string | yes |
| root_cause | string | yes |
| corrective | string | yes |
| preventive | string | no |
| effectiveness_verified | boolean | yes |
| closed_at | ISO8601 | no |

# Asset Inventory — tab `Assets`

| Column | Type | Required |
|--------|------|----------|
| asset_id | string | yes |
| name | string | yes |
| classification | enum | Public, Internal, Confidential, Tier III |
| owner | string | yes |
| criticality | enum | Low, Medium, High |

# DCF Map — tab `DCF`

| Column | Type | Required |
|--------|------|----------|
| dcf_id | string | yes |
| title | string | yes |
| iso_27001_ref | string | no |
| pci_dss_ref | string | no |
| evidence_source | string | no |

# Audit Calendar — tab `AuditCalendar`

| Column | Type | Required |
|--------|------|----------|
| audit_id | string | yes |
| quarter | enum | Q1, Q2, Q3, Q4 |
| domain | enum | ISMS, PIMS, AIMS, Integrated |
| control_ref | string | yes |
| scheduled_date | date | yes |
| status | enum | Planned, In Progress, Complete |
| lead_auditor | string | no |
| auditee | string | no |
| kickoff_date | date | no |
| evidence_folder_id | string | no |
| finding_count | number | no |
| report_doc_id | string | no |

# Policy Register — tab `Policies`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| policy_id | string | yes | e.g. [YOUR POLICY FOR IMS Management Review] |
| title | string | yes | |
| frameworks | string | yes | Semicolon-separated |
| owner | string | yes | Email |
| approver | string | yes | Email |
| version | string | yes | e.g. Rev 03 |
| effective_date | date | yes | |
| next_review_date | date | yes | |
| status | enum | yes | Draft, In Review, Approved, Archived, Superseded, Retired |
| doc_id | string | no | Google Doc ID |
| archive_file_id | string | no | Approved PDF in Drive |
| dcf_controls | string | no | Semicolon-separated DCF IDs |
| review_cadence_days | number | no | Default 365 |

# Program Calendar — tab `ProgramCalendar`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| task_id | string | yes | e.g. PC-001 |
| category | string | yes | Policy reviews, Internal audit, etc. |
| title | string | yes | |
| cadence | enum | yes | Monthly, Quarterly, Annual |
| owner | string | yes | Email |
| next_due_date | date | yes | |
| linked_register | string | no | PolicyRegister, Risks, AuditCalendar |
| linked_id | string | no | Foreign key to linked register |
| escalation_days | number | yes | Days before due to escalate |
| status | enum | yes | Active, Paused, Complete |

# Agent Activity Log — tab `AgentActivity`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| log_id | string | yes | UUID |
| timestamp | ISO8601 | yes | |
| actor | string | yes | `agent` or user email |
| action | string | yes | e.g. daily_scan, policy_nudge |
| target_type | string | yes | policy, risk, audit, program_task |
| target_id | string | yes | |
| outcome | enum | yes | success, skipped, error, pending_human |
| details | string | no | JSON metadata, no Tier III |
