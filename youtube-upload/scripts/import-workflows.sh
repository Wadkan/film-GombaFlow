#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/n8n-docker/compose.yaml")

"${COMPOSE[@]}" exec -T n8n n8n import:workflow --separate --input=/data/youtube-upload/workflows
