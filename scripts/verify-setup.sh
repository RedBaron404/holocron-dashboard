#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; ERR=1; }

ERR=0

echo "=== Corporate Holocron Setup Verification ==="
echo

# Node
if command -v node >/dev/null 2>&1; then
  pass "Node.js $(node -v)"
else
  fail "Node.js not installed (need 20+)"
fi

# Env file
if [[ -f .env.op ]] || [[ -f .env ]]; then
  pass "Environment file present"
else
  fail "Missing .env or .env.op — copy from .env.example"
fi

# Load env for checks
if [[ -f .env.op ]] && command -v op >/dev/null 2>&1; then
  eval "$(op run --env-file=.env.op -- env | grep -E '^(GCP_|GOOGLE_|SHEET_|DRIVE_|SESSION_)' | sed 's/^/export /')" 2>/dev/null || true
elif [[ -f .env ]]; then
  set -a; source .env; set +a
fi

# Required vars (Phase 0)
check_var() {
  local name=$1
  local label=$2
  if [[ -n "${!name:-}" ]]; then
    pass "$label ($name)"
  else
    fail "$label ($name) not set"
  fi
}

check_var GCP_PROJECT_ID "GCP project"
check_var GOOGLE_OAUTH_CLIENT_ID "OAuth client ID"
check_var GOOGLE_SERVICE_ACCOUNT_JSON "Service account path/ref"
check_var SHEET_RISK_REGISTER_ID "Risk register sheet ID"
check_var SHEET_NCR_LOG_ID "NCR log sheet ID"
check_var SHEET_POLICY_REGISTER_ID "Policy register sheet ID"
check_var SHEET_PROGRAM_CALENDAR_ID "Program calendar sheet ID"
check_var SHEET_ACTIVITY_LOG_ID "Agent activity log sheet ID"
check_var DRIVE_ARCHIVE_FOLDER_ID "Archive folder ID"

# gcloud optional
if command -v gcloud >/dev/null 2>&1; then
  pass "gcloud CLI available"
else
  echo "  (optional) Install gcloud for API enablement checks"
fi

# op optional
if command -v op >/dev/null 2>&1; then
  pass "1Password CLI available"
fi

echo
if [[ ${ERR:-0} -eq 0 ]]; then
  echo -e "${GREEN}All required checks passed.${NC}"
  echo "Next: npm install && ./scripts/with-secrets.sh npm run dev"
else
  echo -e "${RED}Some checks failed — see docs/BUILD_ENVIRONMENT.md${NC}"
  exit 1
fi
