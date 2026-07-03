# Access Checklist — GRC Analyst Agent

Track every integration. Status: `pending` | `in_progress` | `verified` | `blocked` | `optional`

Run verification: `./scripts/verify-setup.sh` and `./scripts/verify-integrations.sh`

| ID | Integration | Required | Provisioned by | Verification | Status | Notes |
|----|-------------|----------|----------------|--------------|--------|-------|
| AC-01 | Google OAuth (desktop client) | Yes | You + IT | `GET /auth/login` redirects to Google | pending | Set `GOOGLE_OAUTH_CLIENT_ID` in `.env.op` |
| AC-02 | Google service account | Yes | You + IT | SA reads Risk Register row 1 | pending | Share all GRC sheets + Drive folders with SA email |
| AC-03 | Google Sheets — Risk/NCR/CAPA/Assets | Yes | You | `GET /api/risks` returns data | pending | `SHEET_RISK_REGISTER_ID`, `SHEET_NCR_LOG_ID` |
| AC-04 | Google Sheets — Policy Register | Yes | You | `GET /api/policies` returns data | pending | `SHEET_POLICY_REGISTER_ID` |
| AC-05 | Google Sheets — Program Calendar | Yes | You | `GET /api/program/calendar` returns data | pending | `SHEET_PROGRAM_CALENDAR_ID` |
| AC-06 | Google Sheets — Agent Activity Log | Yes | You | Daily scan writes log entry | pending | `SHEET_ACTIVITY_LOG_ID` |
| AC-07 | Google Sheets — DCF Map | Yes | You | `GET /api/dcf` returns data | pending | `SHEET_DCF_MAP_ID` |
| AC-08 | Google Drive — Archive folder | Yes | You | SA uploads test file | pending | `DRIVE_ARCHIVE_FOLDER_ID` |
| AC-09 | Google Drive — Drafts folder | Yes | You | SA creates draft doc | pending | `DRIVE_DRAFTS_FOLDER_ID` |
| AC-10 | Google Drive — Audit evidence | Yes | You | SA lists audit evidence folder | pending | `DRIVE_AUDIT_EVIDENCE_FOLDER_ID` |
| AC-11 | Google Docs — policy generation | Yes | You | `POST /api/documents/draft` succeeds | pending | |
| AC-12 | Drive Approvals API | No | You + IT | Go/no-go in `docs/intake/DRIVE_APPROVALS.md` | pending | Fallback: manual approval tracking |
| AC-13 | Gmail notifications | No | You + IT | Test digest email delivered | optional | `GMAIL_SENDER`, `COMPLIANCE_OFFICER_EMAIL` |
| AC-14 | Google Calendar | No | You | Test event create | optional | `GOOGLE_CALENDAR_ID` |
| AC-15 | GCP / Vertex AI | Yes | IT | `npm run test:ai --workspace=backend` | pending | `GCP_PROJECT_ID`, ZDR confirmed |
| AC-16 | 1Password CLI | Yes | You | `./scripts/with-secrets.sh env` loads vars | pending | |
| AC-17 | Cursor Automation / API key | Yes | You | Dry-run `scripts/run-daily-grc-scan.ts` | pending | `CURSOR_API_KEY` for SDK path |
| AC-18 | Security metrics feeds | No | You | One collector returns data | optional | security-analytics-dashboard |

## IT request templates

- GCP: [`docs/IT_REQUEST_GCP_PROJECT.md`](../IT_REQUEST_GCP_PROJECT.md)
- Slack (optional): [`docs/IT_REQUEST_SLACK.txt`](../IT_REQUEST_SLACK.txt)

## Blocked item protocol

When status is `blocked`, document exact steps here:

| ID | Blocker | Action required |
|----|---------|-----------------|
| | | |
