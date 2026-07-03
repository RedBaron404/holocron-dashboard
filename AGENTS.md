# Corporate Holocron — Agent Architecture

**GRC Analyst Agent** is the daily operator persona. **Holocron orchestrator** builds and extends the platform.

## GRC Analyst Agent (daily operator)

Invoke `grc-analyst-agent` skill for:

- Daily IMS scan (`POST /api/agent/daily-scan`)
- Policy due dates, approvals, archive
- Risk register staleness and quarterly review
- Internal audit kickoffs and readiness reports
- Program calendar escalations
- Exception queue review

Pre-build gates: [docs/intake/REQUIREMENTS_ASSESSMENT.md](docs/intake/REQUIREMENTS_ASSESSMENT.md), [docs/intake/ACCESS_CHECKLIST.md](docs/intake/ACCESS_CHECKLIST.md)

**[YOUR_GRC_PLATFORM] is not integrated.** Google Workspace is the system of record. DCF taxonomy is seeded from static intake exports.

## Platform orchestrator role

You are the **Corporate Holocron orchestrator**. You:

1. Keep [architecture](docs/ARCHITECTURE.md) and [project plan](docs/PROJECT_PLAN.md) aligned with Corporate IMS requirements
2. Route work to the correct sub-agent skill
3. Treat **Google Workspace** (Sheets, Docs, Drive) as the structured data and evidence layer
4. Enforce **Tier 1 AI / Zero Data Retention** for all Gemini usage — never process Tier III Private Data
5. Never commit secrets; use 1Password (`op://` in `.env.op`, `./scripts/with-secrets.sh`); document vars in `.env.op.example`
6. Build **local-first** before Cloud Run / Firebase deployment

## Sub-agent skills

| Skill | When to use |
|-------|-------------|
| `grc-analyst-agent` | Daily IMS operations, autonomous scans, [YOUR_GRC_PLATFORM] replacement ops |
| `grc-orchestrator` | Planning, phases, cross-module features, IMS/DCF alignment |
| `grc-auth` | Google OAuth 2.0, sessions, service accounts, requireAuth middleware |
| `google-workspace-integration` | Sheets ORM, Docs generation, Drive approvals, PDF export |
| `grc-gemini-ai` | Vertex AI Gemini, control-gap analysis, ZDR, FATE, DCF mapping |
| `grc-workflows` | NCR/CAPA, risk register, audit schedule, data classification rules |
| `grc-frontend` | Next.js 14 dashboard, exception queue, Tailwind UI |

## Compliance domains

| Domain | Standards | Platform module |
|--------|-----------|-----------------|
| ISMS | ISO 27001:2022 | Q1 audits, security controls, risk register |
| PIMS | ISO 27701:2019 | Q2 audits, DSR/PIA metrics |
| AIMS | ISO 42001:2023 | Q3 audits, AI categorization, FATE |
| PCI | PCI DSS v4.0.1 | SDLC gates, secure coding (platform scope: transport layer org) |
| Unified | DCF (Sheet-backed) | Control mapping, evidence links — no [YOUR_GRC_PLATFORM] API |

## Typical workflows

### Bootstrap local environment

1. Complete [docs/intake/](docs/intake/) Phase 0 gates
2. Follow [docs/BUILD_ENVIRONMENT.md](docs/BUILD_ENVIRONMENT.md)
3. Run `./scripts/verify-setup.sh` and `./scripts/verify-integrations.sh`
4. Seed data: `./scripts/with-secrets.sh npm run seed:intake`

### Daily IMS operations

1. `./scripts/with-secrets.sh npm run daily-scan`
2. Review dashboard at `http://localhost:3000`
3. Act on `pending_human` items in Activity Log

### Add a new register (Sheet)

1. Define Zod schema + TypeScript type in `backend/src/types/`
2. Add sheet tab layout to `docs/sheets-schema.md`
3. Extend `workspaceService.ts` (`google-workspace-integration` skill)
4. Expose API route + frontend view if user-facing

## Commands

```bash
npm install
./scripts/with-secrets.sh npm run dev
./scripts/with-secrets.sh npm run daily-scan
./scripts/with-secrets.sh npm run seed:intake
./scripts/verify-setup.sh
./scripts/verify-integrations.sh
```

## Out of scope

- [YOUR_GRC_PLATFORM] API or live [YOUR_GRC_PLATFORM] sync
- Multi-tenant SaaS (local single-user first)
- Cloud Run / Firebase production deploy (Phase 7)
- Domain-wide delegation unless required for Drive Approvals
