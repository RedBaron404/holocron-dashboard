#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.op ]] && command -v op >/dev/null 2>&1; then
  exec op run --env-file=.env.op -- "$@"
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  exec "$@"
else
  echo "No .env.op or .env found. Copy .env.example or .env.op.example first." >&2
  exit 1
fi
