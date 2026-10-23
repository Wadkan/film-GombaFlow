#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

[[ -f .env ]] || exit 0

if grep -q '^N8N_INSTANCE_AI_SANDBOX_API_URL=' .env; then
	sed -i '' '/^N8N_INSTANCE_AI_SANDBOX_API_URL=/d' .env
	echo "Removed obsolete N8N_INSTANCE_AI_SANDBOX_API_URL from .env"
fi
