#!/usr/bin/env bash
set -euo pipefail

PKG_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$PKG_ROOT/../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/n8n-docker/compose.yaml")

mkdir -p "$PKG_ROOT/workflows"
"${COMPOSE[@]}" exec -T n8n n8n export:workflow --all --separate --output=/data/youtube-upload/workflows
