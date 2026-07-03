# IT Request — GCP Project for Corporate Holocron

Copy the section below into Slack, email, or your internal ticket system.

---

## Subject

New GCP dev project: `corporate-holocron-dev` (Corporate Holocron — local GRC compliance tool)

## Request body

Hi,

I'm building **Corporate Holocron**, a local-first GRC compliance tool that integrates with our **Google Workspace** (Sheets/Docs/Drive for risk registers, NCR/CAPA, policy evidence) and **Vertex AI Gemini** (control-gap analysis with Zero Data Retention). This is development-only for now — not production hosting.

Please create a **new GCP project** separate from `corporate-ai-dev` so compliance automation is isolated from general AI Studio experimentation.

### Project details

| Field | Value |
|-------|--------|
| **Display name** | Corporate Holocron Dev |
| **Project ID** | `corporate-holocron-dev` (or org naming equivalent) |
| **Environment** | Development / non-production |
| **Billing** | Corporate org billing account (required for Vertex AI) |
| **Purpose** | OAuth + service account for Workspace APIs; Vertex AI for compliance gap analysis |

### APIs to enable

- Google Sheets API (`sheets.googleapis.com`)
- Google Drive API (`drive.googleapis.com`)
- Google Docs API (`docs.googleapis.com`)
- Vertex AI API (`aiplatform.googleapis.com`)
- IAM Service Account Credentials API (`iamcredentials.googleapis.com`)

### IAM for requester

Grant **`[YOUR_EMAIL] (adjust if different):

- **Editor** on the project, *or* minimum:
  - Create/manage OAuth clients (APIs & Services → Credentials)
  - Create service accounts and keys
  - Enable APIs listed above

Alternatively, IT can create the items below and send me the values securely (not email/Slack for secrets).

### Artifacts IT can create (optional — I can do if granted Editor)

1. **OAuth consent screen**
   - User type: **Internal** (Google Workspace users only)
   - App name: `Corporate Holocron (Dev)`
   - Scopes: spreadsheets, drive, documents, openid, email, profile

2. **OAuth client — Desktop app**
   - Redirect URI: `http://localhost:4000/auth/callback`
   - Deliver: Client ID + Client Secret (via 1Password or secure channel)

3. **Service account**
   - Name: `holocron-backend`
   - No GCP admin roles
   - JSON key delivered securely (I will store locally only, never in git)

4. **Vertex AI**
   - Confirm billing attached
   - Note whether **Zero Data Retention / no-training** enterprise terms apply to this project (required before processing Confidential compliance data in Gemini)

### What I will configure after project exists

- Google Workspace spreadsheets and Drive folders (InfoSec-owned)
- Share those assets with the `holocron-backend@…iam.gserviceaccount.com` email
- Local `.env` with project ID and asset IDs (no secrets in repo)

### Reference

- Repo (local): `corporate-holocron`
- Setup doc: `docs/BUILD_ENVIRONMENT.md`
- Similar existing project: `corporate-ai-dev` (please **do not** reuse for Holocron — separate lifecycle)

Thanks,
[Your name]

---

## After IT responds — record here

| Item | Value |
|------|--------|
| Project ID | |
| OAuth Client ID | → `.env` |
| OAuth Client Secret | → `.env` (secure) |
| Service account email | → share Workspace assets |
| SA JSON key path | → `data/secrets/` + `.env` |
| ZDR confirmed? | yes / no / pending |
| Your IAM role | |

Then run:

```bash
cd /Users/[your-username]/projects/corporate-holocron
# Edit .env — set GCP_PROJECT_ID=...
./scripts/verify-setup.sh
```
