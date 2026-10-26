#!/usr/bin/env bash
set -euo pipefail

PKG_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$PKG_ROOT/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/n8n-docker/compose.yaml")

mkdir -p "$PKG_ROOT/workflows"
if [[ -n "${WORKFLOW_ID:-}" ]]; then
    [[ "$WORKFLOW_ID" =~ ^[a-zA-Z0-9_-]+$ ]] || { echo "Invalid WORKFLOW_ID" >&2; exit 2; }
    "${COMPOSE[@]}" exec -T n8n n8n export:workflow --id="$WORKFLOW_ID" --separate --output=/data/n8n-workflows/workflows
else
    "${COMPOSE[@]}" exec -T n8n n8n export:workflow --all --separate --output=/data/n8n-workflows/workflows
fi
