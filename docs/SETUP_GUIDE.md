# Corporate Holocron — Step-by-Step Setup

Work through these in order. Each step has a **gate**: do not proceed until the gate passes.

| Step | Topic | Gate |
|------|--------|------|
| 1 | Local dev baseline | `node -v` ≥ 20, `npm install` succeeds |
| 2 | Secrets file scaffold | `.env.op` or `.env` exists |
| 3 | GCP project + APIs | 5 APIs enabled, project ID recorded |
| 4 | OAuth desktop client | Client ID + secret in 1Password |
| 5 | Service account | JSON key in 1Password, email copied |
| 6 | Workspace spreadsheets | 4 sheets created, IDs in env |
| 7 | Workspace Drive folders | 2 folders created, IDs in env |
| 8 | Share assets with SA | SA can read Risk Register (manual test) |
| 9 | Vertex AI | API enabled, billing linked, ZDR noted |
| 10 | Full verification | `./scripts/verify-setup.sh` passes |

Track progress in [SETUP_PROGRESS.md](./SETUP_PROGRESS.md).
