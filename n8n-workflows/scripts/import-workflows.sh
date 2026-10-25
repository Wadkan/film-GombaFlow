#!/usr/bin/env bash
set -euo pipefail

PKG_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$PKG_ROOT/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/n8n-docker/compose.yaml")

"${COMPOSE[@]}" exec -T n8n n8n import:workflow --separate --input=/data/n8n-workflows/workflows
