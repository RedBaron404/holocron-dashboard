# Data Inventory — Intake → Holocron mapping

Maps intake artifacts to Google Workspace resources and Sheet tabs.

## Sheet tabs (single workbook or separate sheets per env var)

| Env var | Tab name | Intake source | Schema doc |
|---------|----------|---------------|------------|
| `SHEET_RISK_REGISTER_ID` | Risks | `seed/risk-register.csv` | sheets-schema.md |
| `SHEET_NCR_LOG_ID` | NCR | `seed/` (optional ncr export) | sheets-schema.md |
| `SHEET_NCR_LOG_ID` | CAPA | same workbook, CAPA tab | sheets-schema.md |
| `SHEET_ASSET_INVENTORY_ID` | Assets | manual / future export | sheets-schema.md |
| `SHEET_DCF_MAP_ID` | DCF | `seed/dcf-map.csv` | sheets-schema.md |
| `SHEET_POLICY_REGISTER_ID` | Policies | `seed/policy-register.csv` | sheets-schema.md |
| `SHEET_PROGRAM_CALENDAR_ID` | ProgramCalendar | `seed/program-calendar.csv` | sheets-schema.md |
| `SHEET_AUDIT_CALENDAR_ID` | AuditCalendar | `seed/audit-calendar.csv` | sheets-schema.md |
| `SHEET_ACTIVITY_LOG_ID` | AgentActivity | runtime only | sheets-schema.md |

## Drive folders

| Env var | Purpose | Contents |
|---------|---------|----------|
| `DRIVE_ARCHIVE_FOLDER_ID` | Approved policy PDFs | `{policy_id}-{version}-approved.pdf` |
| `DRIVE_DRAFTS_FOLDER_ID` | Working policy drafts | Google Docs in Draft/In Review |
| `DRIVE_AUDIT_EVIDENCE_FOLDER_ID` | Per-audit evidence | Subfolder per `audit_id` |

## Policy documents (pending user deposit)

| policy_id | Drive doc_id | Archive file_id | Notes |
|-----------|--------------|-----------------|-------|
| [YOUR POLICY FOR DLP] | _pending_ | _pending_ | DLP policy — audit finding candidate |
| [YOUR POLICY FOR IMS Management Review] | _pending_ | _pending_ | Management Review |
| [YOUR POLICY FOR POLICY-20] | _pending_ | _pending_ | Internal audit |
| [YOUR POLICY FOR POLICY-25] | _pending_ | _pending_ | Risk management |

Update this table when policies are linked from Google Drive.

## [YOUR_GRC_PLATFORM] replacement note

No [YOUR_GRC_PLATFORM] URLs or API keys. Historical exports (if any) should be copied to Drive archive folders and referenced here as static file paths only.
