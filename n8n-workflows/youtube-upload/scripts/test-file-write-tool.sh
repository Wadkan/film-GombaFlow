#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
compose_file="${N8N_COMPOSE_FILE:-$repo_root/n8n-docker/compose.yaml}"
compose=(docker compose -f "$compose_file")
if ! "${compose[@]}" ps --status running --services | rg -qx n8n; then
  printf 'FAIL: n8n is not running; start it with make start-n8n.\n' >&2
  exit 1
fi
scratch="$(mktemp -d /tmp/meta-runtime-test.XXXXXX)"
fixture_folder="MetaRuntimeTest.$(uuidgen | tr '[:upper:]' '[:lower:]')"
container_scratch="/tmp/$fixture_folder"
broker_port="$((20000 + $$ % 20000))"
cleanup() {
  "${compose[@]}" exec -T n8n sh -c 'rm -rf -- "$1" "$2" "$3"' sh "$container_scratch" "/data/videos/$fixture_folder" "/data/videos/$fixture_folder-outside.json" >/dev/null 2>&1 || true
  rm -rf -- "$scratch"
}
trap cleanup EXIT
"${compose[@]}" exec -T n8n sh -c 'test ! -e "$1"' sh "/data/videos/$fixture_folder-outside.json"
node "$repo_root/n8n-workflows/youtube-upload/tests/build-writer-fixtures.js" "$scratch" "$fixture_folder"
"${compose[@]}" exec -T n8n sh -c 'mkdir -- "$1" "$2"' sh "$container_scratch" "/data/videos/$fixture_folder"
cp "$repo_root/n8n-workflows/youtube-upload/tests/assert-runtime-output.js" "$scratch/assert-runtime-output.js"
"${compose[@]}" cp "$scratch/." "n8n:$container_scratch/" >/dev/null
isolated=("${compose[@]}" exec -T -e DB_TYPE=sqlite -e "N8N_USER_FOLDER=$container_scratch/cli" -e N8N_RUNNERS_MODE=internal -e "N8N_RUNNERS_BROKER_PORT=$broker_port" -e N8N_DIAGNOSTICS_ENABLED=false n8n)
# Import only into a disposable CLI database, never into the running editor's database.
for kind in turn-md turn-denied turn-json outside; do
  if ! "${isolated[@]}" n8n import:workflow --input="$container_scratch/$kind.json" > "$scratch/$kind-import.log" 2>&1; then
    cat "$scratch/$kind-import.log" >&2; exit 1
  fi
  workflow_id="metadata-$kind"
  [[ "$kind" == outside ]] && workflow_id="metadata-regression-outside"
  if "${isolated[@]}" n8n execute --id="$workflow_id" --rawOutput > "$scratch/$kind-result.log" 2>&1; then
    if [[ "$kind" == outside ]]; then
      printf 'FAIL: outside-folder write was not rejected.\n' >&2; exit 1
    fi
  elif [[ "$kind" != outside ]]; then
    cat "$scratch/$kind-result.log" >&2; exit 1
  fi
  if [[ "$kind" == turn-denied ]]; then
    "${compose[@]}" exec -T n8n sh -c 'test ! -e "$1"' sh "/data/videos/$fixture_folder/meta.json"
  fi
done
"${compose[@]}" exec -T n8n node "$container_scratch/assert-runtime-output.js" "$container_scratch/cli/.n8n/database.sqlite" "$fixture_folder"
"${compose[@]}" exec -T n8n node - "$fixture_folder" <<'NODE'
const fs=require('node:fs');const assert=require('node:assert/strict');
const folder=process.argv[2];const base='/data/videos/'+folder;
assert.equal(fs.readFileSync(base+'/meta.md','utf8'),'# Title\nIzolált n8n fájlírás\n');
const meta=JSON.parse(fs.readFileSync(base+'/meta.json','utf8'));assert.equal(meta.title,'Izolált teszt');assert.equal(meta.status,'ready');
assert.equal(fs.existsSync('/data/videos/'+folder+'-outside.json'),false);
NODE
printf 'PASS: isolated n8n Read/Write Files wrote and verified MD/JSON; outside-folder request rejected.\n'
