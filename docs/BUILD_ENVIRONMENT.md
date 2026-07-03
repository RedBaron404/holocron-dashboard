# Build Environment — Corporate Holocron

This document lists everything required on your machine and in Google Cloud / Google Workspace before local development can succeed. **Phase 0 is setup; Phase 1+ is application code.**

## Local machine prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 20 LTS or 22 LTS | Backend (Express) + tooling |
| npm | 10+ (bundled with Node) | Package management |
| Git | 2.x | Version control |
| 1Password CLI (`op`) | Latest | Secret injection (preferred over plaintext `.env`) |
| Google Chrome | Latest | OAuth consent during local dev |

Optional but recommended:

- **Docker** — for backend container builds (future Cloud Run)
- **gcloud CLI** — for Vertex AI project verification and future deployment

## Google Cloud Project (single project for dev)

Create one GCP project (e.g. `corporate-holocron-dev`) tied to the Corporate org billing account.

### APIs to enable

Enable these in **APIs & Services → Library**:

| API | Used for |
|-----|----------|
| Google Sheets API | Risk register, NCR log, asset inventory |
| Google Drive API | Document storage, approvals, PDF archive |
| Google Docs API | Policy generation, signature insertion |
| Vertex AI API | Gemini model calls (compliance gap analysis) |
| IAM Service Account Credentials API | Service account auth |

```bash
gcloud services enable \
  sheets.googleapis.com \
  drive.googleapis.com \
  docs.googleapis.com \
  aiplatform.googleapis.com \
  iamcredentials.googleapis.com \
  --project=YOUR_PROJECT_ID
```

### OAuth 2.0 (user-facing actions)

For local development, use a **Desktop app** OAuth client:

1. **APIs & Services → OAuth consent screen**
   - User type: **Internal** (Corporate Workspace users only) if available; otherwise External with test users
   - Scopes (minimum):
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/documents`
     - `openid`, `email`, `profile`
2. **Credentials → Create OAuth client ID → Desktop app**
   - Download JSON → store in 1Password (never commit)
   - Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in `.env.op`

Redirect URI for local backend callback:

```
http://localhost:4000/auth/callback
```

### Service account (background CRUD)

1. **IAM → Service Accounts → Create**
   - Name: `holocron-backend`
   - No admin roles on GCP (principle of least privilege)
2. Create JSON key → store in 1Password as `GOOGLE_SERVICE_ACCOUNT_JSON` (path or inline via op)
3. **Share Workspace assets** with the service account email (`...@....iam.gserviceaccount.com`):
   - Risk Register spreadsheet (Editor)
   - NCR log spreadsheet (Editor)
   - GRC archive Drive folder (Editor)

> **Domain-wide delegation** is optional for Phase 1. Sharing specific Sheets/Drive folders with the service account is simpler for local dev.

### Vertex AI / Gemini (Tier 1 + Zero Data Retention)

1. Enable Vertex AI in the same GCP project and region (e.g. `us-central1`)
2. Request or confirm **Zero Data Retention (ZDR)** / no-training terms with Google for enterprise Gemini use (contractual + API flags)
3. Environment variables:
   - `GCP_PROJECT_ID`
   - `GCP_LOCATION=us-central1`
   - `GEMINI_MODEL=gemini-2.0-flash` (or current stable model)

Application code must pass settings that disable logging/training where supported. See `grc-gemini-ai` skill.

**Data boundary:** Never send Tier III Private Data (PHI, full PAN, government IDs) to Gemini. Block at validation layer (Zod + server-side classifier).

## Google Workspace assets (create before coding)

Create these in the Corporate Workspace (or a dev Shared Drive):

| Asset | Type | Sheet/tab or folder name |
|-------|------|--------------------------|
| Risk Register | Google Sheet | Tabs: `Risks`, `Treatments`, `Metadata` |
| NCR / CAPA Log | Google Sheet | Tabs: `NCR`, `CAPA`, `Evidence` |
| Asset Inventory | Google Sheet | Tab: `Assets` |
| Policy Archive | Drive folder | `GRC/Archive/Approved` |
| Draft Policies | Drive folder | `GRC/Drafts` |
| DCF Control Map | Google Sheet | Tab: `DCF` (import from [YOUR_GRC_PLATFORM] export or manual seed) |

Record IDs in `.env` (non-secret):

```env
SHEET_RISK_REGISTER_ID=
SHEET_NCR_LOG_ID=
SHEET_ASSET_INVENTORY_ID=
DRIVE_ARCHIVE_FOLDER_ID=
DRIVE_DRAFTS_FOLDER_ID=
```

Share each with the service account email.

## Drive Approvals API note

The Drive `files.approvals` endpoints require:

- Google Workspace **Business Plus, Enterprise**, or equivalent tier with Drive approvals enabled
- Appropriate OAuth scopes and user impersonation or user-delegated OAuth for approval actions

Verify availability in your Workspace edition before building Phase 3 approval automation. If unavailable, Phase 1 can stub approvals and use manual Drive workflow.

## Secrets management

| Variable | Secret? | Source |
|----------|---------|--------|
| `GOOGLE_OAUTH_CLIENT_ID` | No | OAuth client JSON |
| `GOOGLE_OAUTH_CLIENT_SECRET` | **Yes** | OAuth client JSON |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | **Yes** | Service account key file path or JSON string |
| `SESSION_SECRET` | **Yes** | Random 32+ byte string |
| `GCP_PROJECT_ID` | No | GCP console |
| Sheet/Drive IDs | No | Workspace URLs |

Use `./scripts/with-secrets.sh` for all dev commands. See `.env.op.example`.

## Verification checklist

Run after setup:

```bash
# 1. Secrets load
./scripts/with-secrets.sh node -e "console.log('env ok', !!process.env.GOOGLE_OAUTH_CLIENT_ID)"

# 2. Service account can read risk register (after backend scaffold)
./scripts/with-secrets.sh npm run dev --workspace=backend

# 3. OAuth login
open http://localhost:4000/auth/login

# 4. Vertex AI (after aiService scaffold)
./scripts/with-secrets.sh npm run test:ai --workspace=backend
```

## Out of scope for local Phase 1

- Cloud Run / Firebase Hosting deployment
- External IdP (Okta, etc.) — Google OAuth only
- Multi-tenant user management
- Production PCI CDE hosting (platform manages compliance metadata, not cardholder data)

## Related docs

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — phased delivery
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design
- [../AGENTS.md](../AGENTS.md) — agent routing
