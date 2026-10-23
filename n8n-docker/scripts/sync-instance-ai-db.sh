#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set -a
# shellcheck disable=SC1091
source .env
set +a

[[ "${N8N_INSTANCE_AI_SANDBOX_ENABLED:-}" == "true" ]] || exit 0

VOLUME=n8n-docker_n8n_data

db_query() {
	docker run --rm -v "${VOLUME}:/data:ro" alpine sh -ce "
		apk add --no-cache sqlite >/dev/null
		sqlite3 /data/database.sqlite \"$1\"
	"
}

row="$(db_query "SELECT value FROM settings WHERE key = 'instanceAi.settings';" || true)"
if [[ -z "$row" ]]; then
	exit 0
fi

enabled="$(db_query "SELECT json_extract(value, '$.sandboxEnabled') FROM settings WHERE key = 'instanceAi.settings';")"
provider="$(db_query "SELECT json_extract(value, '$.sandboxProvider') FROM settings WHERE key = 'instanceAi.settings';")"

if [[ "$enabled" == "1" && ( -z "$provider" || "$provider" == "n8n-sandbox" ) ]]; then
	exit 0
fi

echo "Aligning instance AI sandbox settings in database with .env …"
docker compose -f compose.yaml stop n8n

docker run --rm -v "${VOLUME}:/data" alpine sh -ce "
	apk add --no-cache sqlite >/dev/null
	sqlite3 /data/database.sqlite \"
		UPDATE settings
		SET value = json_set(
			json_set(value, '$.sandboxEnabled', json('true')),
			'$.sandboxProvider', 'n8n-sandbox'
		)
		WHERE key = 'instanceAi.settings';
	\"
"
