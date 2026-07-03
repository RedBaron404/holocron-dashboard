# Daily IMS Scan — Cursor Automation

Schedule the GRC Analyst Agent to run every business day.

## Trigger

- **Type:** Scheduled (cron)
- **Schedule:** `0 7 * * 1-5` (7:00 AM weekdays, adjust timezone in editor)
- **Repo:** `corporate-holocron`
- **Branch:** `main` (or your working branch)

## Action options

### Option A — Backend API (recommended when Holocron is running)

Prompt the agent:

```
Run the Holocron daily IMS scan:
1. Execute POST http://localhost:4000/api/agent/daily-scan with X-Agent-Key if configured
2. Or run: ./scripts/with-secrets.sh npm run daily-scan
3. Summarize exceptions from GET /api/agent/exceptions
4. If any item is blocked, update docs/intake/ACCESS_CHECKLIST.md with status
```

### Option B — SDK script (when backend runs as service)

```bash
./scripts/with-secrets.sh npm run daily-scan
```

## Environment

| Variable | Purpose |
|----------|---------|
| `AGENT_API_KEY` | Secures `/api/agent/*` endpoints |
| `API_URL` | Backend URL (default `http://localhost:4000`) |
| `COMPLIANCE_OFFICER_EMAIL` | Digest recipient |

## Verification

```bash
./scripts/with-secrets.sh npm run daily-scan
curl http://localhost:4000/api/agent/exceptions
```

## Human review

Daily digest should require <5 min review. Items with `pending_human` outcome need same-day action.
