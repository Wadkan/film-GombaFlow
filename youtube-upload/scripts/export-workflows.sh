#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/n8n-docker/compose.yaml")

mkdir -p "$ROOT/youtube-upload/workflows"
"${COMPOSE[@]}" exec -T n8n n8n export:workflow --all --separate --output=/data/youtube-upload/workflows
