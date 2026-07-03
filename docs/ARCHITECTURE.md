# Architecture — Corporate Holocron

## Overview

Local-first monorepo: **Next.js frontend** talks to **Express backend**, which orchestrates **Google Workspace APIs** (Sheets, Docs, Drive) and **Vertex AI Gemini** for compliance automation.

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│  Next.js 14     │ ◄────────────► │  Express API     │
│  (localhost:3000)│   session/JWT  │  (localhost:4000)│
└─────────────────┘                └────────┬─────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
     ┌────────────────┐          ┌─────────────────┐          ┌─────────────────┐
     │ Google OAuth   │          │ Service Account │          │ Vertex AI       │
     │ (user actions) │          │ (Sheets CRUD)   │          │ (Gemini + ZDR)  │
     └────────────────┘          └─────────────────┘          └─────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
              ┌──────────────────────────────────────────┐
              │ Google Workspace                          │
              │  • Sheets — Risk Register, NCR, Assets    │
              │  • Docs — Policy drafts                   │
              │  • Drive — Archive, approvals, PDFs       │
              └──────────────────────────────────────────┘
```

## Data layer: Google Sheets as registers

Sheets act as the authoritative structured store (not a replacement for immutable PDF evidence in Drive).

| Register | Primary key | Key fields |
|----------|-------------|------------|
| Risk Register | `risk_id` | aspect, impact, likelihood, severity, treatment, owner |
| NCR Log | `ncr_id` | title, description, phase, dcf_control, status |
| CAPA | `capa_id` | ncr_id, root_cause, corrective, preventive, verified |
| Asset Inventory | `asset_id` | name, classification, owner, criticality |
| DCF Map | `dcf_id` | framework_refs, evidence_source |

Internal TypeScript types in `backend/src/types/` map to sheet ranges via `workspaceService.ts` (ORM layer).

## Authentication model (local dev)

| Actor | Method | Use case |
|-------|--------|----------|
| Human user | OAuth 2.0 desktop flow | UI sessions, document approvals |
| Backend jobs | Service account JWT | Spreadsheet CRUD, folder uploads |

Sessions stored server-side (memory or file store for dev). Production will use encrypted cookie + Secret Manager.

## AI boundary (Tier 1 / ZDR)

- **Allowed in prompts:** Internal and Confidential compliance metadata, sanitized scanner excerpts
- **Blocked:** Tier III Private Data (PHI, PAN, SSN patterns) — validated before API call
- **Config:** Vertex AI with enterprise ZDR; no training/logging flags documented in `aiService.ts`

## Security controls (platform SDLC)

- Zod validation on all external input
- Helmet + CORS allowlist
- Generic 4xx/5xx responses (no stack traces)
- Secrets via 1Password / env only
- Immutable `readonly` types where possible; strict TypeScript

## Repository layout

```
corporate-holocron/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express + googleapis + Vertex AI
├── docs/              # Architecture, plan, build env
├── scripts/           # with-secrets.sh, verify-setup.sh
├── .cursor/skills/    # Agent sub-skills
└── AGENTS.md          # Orchestrator routing
```

## Future production (Phase 7)

- Cloud Run container from `backend/Dockerfile`
- Firebase Hosting for static/SSR frontend
- Cloud Logging for audit trail (ISO A.8.15)
