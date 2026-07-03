# Corporate Holocron

Local-first **Governance, Risk, and Compliance** platform using **Google Workspace** (Sheets, Docs, Drive) as the data layer and **Vertex AI Gemini** for control-gap analysis. Includes the **GRC Analyst Agent** for daily autonomous IMS operations — **fully replaces [YOUR_GRC_PLATFORM]** (no [YOUR_GRC_PLATFORM] API).

Aligned with Corporate IMS: ISO 27001:2022, ISO 27701:2019, ISO 42001:2023, PCI DSS v4.0.1, and DCF control taxonomy (Sheet-backed).

## GRC Analyst Agent

- Daily IMS scan: `./scripts/with-secrets.sh npm run daily-scan`
- Exception dashboard: http://localhost:3000
- Intake & access gates: [docs/intake/](docs/intake/)
- Agent skill: [.cursor/skills/grc-analyst-agent/](.cursor/skills/grc-analyst-agent/)

## Quick start

### 1. Prerequisites

See [docs/BUILD_ENVIRONMENT.md](docs/BUILD_ENVIRONMENT.md) for the full checklist:

- Node.js 20+
- GCP project with Sheets, Drive, Docs, Vertex AI APIs enabled
- OAuth desktop client + service account
- Google Sheets and Drive folders created and shared with the service account

### 2. Install

```bash
cd corporate-holocron
npm install
cp .env.example .env
# Prefer 1Password: cp .env.op.example .env.op
```

### 3. Configure secrets

Edit `.env` or `.env.op` with your GCP and Workspace IDs. Never commit real values.

### 4. Run locally

```bash
./scripts/with-secrets.sh npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/health

### 5. Verify setup

```bash
./scripts/verify-setup.sh
```

## Project structure

```
├── frontend/          Next.js 14 dashboard
├── backend/           Express API + googleapis + Gemini
├── docs/              Architecture, plan, build environment
├── scripts/           Secret wrapper, setup verification
├── .cursor/skills/    Agent sub-skills for Cursor IDE
└── AGENTS.md          Orchestrator routing
```

## Development phases

| Phase | Focus |
|-------|--------|
| **0** | GCP + Workspace setup (current) |
| **1** | Auth + Sheets NCR/Risk CRUD |
| **2** | Gemini control-gap analysis |
| **3** | Docs, approvals, PDF archive |
| **4** | Full dashboard UI |
| **5** | IMS workflows (audit calendar, CAPA) |
| **6** | SDLC hardening |
| **7** | Cloud Run + Firebase (future) |

Details: [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)

## Agent skills

Open this repo in Cursor and invoke skills from [AGENTS.md](AGENTS.md):

- `grc-orchestrator` — planning and cross-cutting work
- `grc-auth` — OAuth and service accounts
- `google-workspace-integration` — Sheets/Docs/Drive
- `grc-gemini-ai` — Vertex AI with ZDR
- `grc-workflows` — NCR/CAPA, risk, audits
- `grc-frontend` — Next.js UI

## Security

- No hardcoded secrets; use `./scripts/with-secrets.sh`
- Tier III Private Data must never be sent to Gemini
- Zod validation on all API inputs
- Generic error responses to clients

## License

Private — Corporate internal use.
