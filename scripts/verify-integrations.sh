#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; ERR=1; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

ERR=0
APPROVALS_ONLY=false

for arg in "$@"; do
  if [[ "$arg" == "--approvals" ]]; then
    APPROVALS_ONLY=true
  fi
done

if [[ -f .env.op ]] && command -v op >/dev/null 2>&1; then
  eval "$(op run --env-file=.env.op -- env 2>/dev/null | grep -E '^(GCP_|GOOGLE_|SHEET_|DRIVE_|GMAIL_|AGENT_|API_)' | sed 's/^/export /')" || true
elif [[ -f .env ]]; then
  set -a; source .env; set +a
fi

echo "=== Holocron Integration Verification ==="
echo

if [[ "$APPROVALS_ONLY" == true ]]; then
  warn "Drive Approvals: manual verification required — see docs/intake/DRIVE_APPROVALS.md"
  exit 0
fi

# Backend health
if curl -sf "${API_URL:-http://localhost:4000}/health" >/dev/null 2>&1; then
  pass "Backend health endpoint"
else
  warn "Backend not running — start with ./scripts/with-secrets.sh npm run dev"
fi

check_api() {
  local path=$1
  local label=$2
  local url="${API_URL:-http://localhost:4000}${path}"
  if curl -sf "$url" >/dev/null 2>&1; then
    pass "$label"
  else
    fail "$label ($url)"
  fi
}

# API endpoints (fail if workspace not configured — expected until sheets shared)
for ep in \
  "/api/policies:Policy register" \
  "/api/risks:Risk register" \
  "/api/program/calendar:Program calendar" \
  "/api/audits:Audit calendar" \
  "/api/dcf:DCF map" \
  "/api/agent/exceptions:Agent exceptions"; do
  IFS=':' read -r path label <<< "$ep"
  check_api "$path" "$label"
done

echo
if [[ ${ERR:-0} -eq 0 ]]; then
  echo -e "${GREEN}Integration checks passed.${NC}"
  echo "Update docs/intake/ACCESS_CHECKLIST.md statuses to verified."
else
  echo -e "${RED}Some integration checks failed.${NC}"
  echo "See docs/intake/ACCESS_CHECKLIST.md for provisioning steps."
  exit 1
fi
