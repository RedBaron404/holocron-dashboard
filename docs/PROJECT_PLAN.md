# Project Plan — Corporate Holocron

**Goal:** A locally runnable GRC tool that digitizes Corporate IMS workflows using Google Workspace as the data layer and Gemini for control-gap analysis — before any multi-user or cloud deployment.

**End state (future):** ISO 27001 / 27701 / 42001 + PCI DSS v4.0.1 aligned platform on GCP Cloud Run + Firebase, integrated with [YOUR_GRC_PLATFORM] Control Framework (DCF), NCR/CAPA, audit scheduling, and Management Review metrics.

---

## Phase 0 — Environment & integrations (current focus)

**Outcome:** All APIs authenticated; empty registers reachable from a health-check script.

| Task | Owner skill | Done when |
|------|-------------|-----------|
| GCP project + API enablement | `grc-orchestrator` | All 5 APIs enabled |
| OAuth desktop client + consent screen | `grc-auth` | Login redirects and returns session |
| Service account + Sheet/Drive sharing | `google-workspace-integration` | SA reads Risk Register row 1 |
| Workspace spreadsheets & folders created | `grc-orchestrator` | IDs in `.env` |
| 1Password / `.env.op` wired | `secure-credentials` | `with-secrets.sh` runs backend |
| Vertex AI project + ZDR confirmation | `grc-gemini-ai` | Test prompt returns JSON (no Tier III data) |
| Verify Drive Approvals API availability | `google-workspace-integration` | Documented go/no-go |

**Exit criteria:** `./scripts/verify-setup.sh` passes all checks.

---

## Phase 1 — Backend foundation

**Outcome:** Express API with auth, typed models, and Sheets CRUD for Risk Register + NCR.

| Module | Deliverable |
|--------|-------------|
| Auth | `/auth/login`, `/auth/callback`, `/auth/logout`, `requireAuth` middleware |
| Sheets ORM | `getRiskRegister()`, `appendNCREntry()` with Zod validation |
| Health | `/health`, `/api/me` |
| Security | Helmet, CORS, generic errors, no stack traces to client |

**Exit criteria:** POST `/api/ncr` appends a row to NCR sheet; GET `/api/risks` returns register.

---

## Phase 2 — Gemini compliance assistant

**Outcome:** Structured control-gap analysis from audit findings.

| Module | Deliverable |
|--------|-------------|
| `aiService.analyzeControlGap()` | JSON output: controlId, framework, severity, remediationPlan |
| DCF cross-reference | System prompt includes DCF + ISO + PCI mapping instructions |
| ZDR | Documented API config; input sanitizer blocks Tier III patterns |
| API route | `POST /api/ai/analyze-gap` (auth required) |

**Exit criteria:** Sample Vuln-Scanner-style finding maps to DCF/ISO/PCI JSON.

---

## Phase 3 — Document lifecycle

**Outcome:** Policy draft → signature → approval → PDF archive.

| Module | Deliverable |
|--------|-------------|
| `generatePolicyDocument()` | Docs API create + InsertInlineImageRequest for signature |
| `initiateDocumentApproval()` | Drive approvals:start (or documented fallback) |
| `exportDocToPDF()` | Export + upload to archive folder |
| Routes | `/api/documents/*` |

**Exit criteria:** End-to-end test doc appears as PDF in archive folder.

---

## Phase 4 — Frontend dashboard

**Outcome:** Next.js 14 App Router UI for daily compliance operations.

| View | Component |
|------|-----------|
| Overview | Open NCRs, pending approvals, audit quarter status |
| NCR form | Zod-validated submit to backend |
| AI panel | Paste scanner output → structured gap analysis |
| Risk register | Read-only table from Sheets |

**Exit criteria:** Local `localhost:3000` dashboard fully drives Phase 1–2 flows.

---

## Phase 5 — GRC workflows (IMS alignment)

**Outcome:** Core Corporate IMS processes encoded in software.

| Workflow | IMS reference |
|----------|---------------|
| Quarterly audit schedule | Q1 ISMS, Q2 PIMS, Q3 AIMS, Q4 integrated review |
| Risk treatment | Mitigate / Transfer / Avoid / Accept with approval gate |
| NCR/CAPA lifecycle | Identify → Contain → Analyze → Plan → Correct → Verify |
| Data classification guardrails | Block Tier III in LLM and exports |
| Management Review inputs | Aggregate metrics placeholders (patching, DSR, PIA, AI events) |

**Exit criteria:** Audit calendar generates checklist items; NCR state machine enforced in Sheets schema.

---

## Phase 6 — Hardening & SDLC gates

**Outcome:** PCI DSS / ISO SDLC alignment for the platform itself.

- SAST in CI (eslint-security, npm audit)
- PR template: no self-approval, AI-generated code labeled
- RFC template for architectural changes
- Dockerfile for backend; dev/prod env separation documented

---

## Phase 7 — Cloud deployment (future)

**Not started in local-first phase.**

- Cloud Run (backend container)
- Firebase Hosting (frontend)
- Secret Manager instead of local `.env`
- FinOps baseline per BUILD_ENVIRONMENT cost notes

---

## Agent routing

| Work type | Invoke skill |
|-----------|--------------|
| Planning, phases, cross-cutting | `grc-orchestrator` |
| OAuth, sessions, service accounts | `grc-auth` |
| Sheets, Docs, Drive, PDF | `google-workspace-integration` |
| Gemini, ZDR, FATE, control mapping | `grc-gemini-ai` |
| NCR, CAPA, risk, audits, DCF | `grc-workflows` |
| Next.js UI | `grc-frontend` |

See [AGENTS.md](../AGENTS.md).

---

## Success metrics (local MVP)

1. Compliance officer can log in with Google (MFA via Workspace)
2. Submit an NCR that persists to Google Sheets
3. Paste a vulnerability finding and receive DCF-mapped JSON remediation
4. Generate a policy doc and archive a PDF (Phase 3)
5. No secrets in git; no Tier III data sent to Gemini

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Drive Approvals API not in Workspace tier | Fallback: manual approval + metadata tracking |
| Sheets as DB — concurrent edits | Optimistic locking via version column; ORM abstraction |
| Gemini hallucinated control IDs | Human review required before auto-NCR; confidence field in JSON |
| Service account access too broad | Share only required files; no domain-wide admin |
