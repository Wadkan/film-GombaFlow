#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
compose_file="$repo_root/n8n-docker/compose.yaml"
workflow_file="$repo_root/n8n-workflows/youtube-upload/workflows/youtube-meta-folder-picker.json"
tool_workflow_file="$repo_root/n8n-workflows/youtube-upload/workflows/youtube-meta-file-write-tool.json"
compose=(docker compose -f "$compose_file")

if ! "${compose[@]}" ps --status running --services | grep -qx n8n; then
  printf 'FAIL: n8n is not running; start it with make start-n8n.\n' >&2
  exit 1
fi

node - "$workflow_file" "$tool_workflow_file" <<'NODE'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const main = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const tool = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const agent = main.nodes.find((node) => node.name === 'Metaadat Agent');
const writer = main.nodes.find((node) => node.name === 'Kiválasztott videómappa fájlírása');
assert.ok(agent && writer, 'main workflow must expose the selected-folder file tool to the agent');
assert.equal(main.connections[writer.name].ai_tool[0][0].node, agent.name);
assert.equal(writer.parameters.workflowId.value, tool.id);
assert.match(writer.parameters.workflowInputs.value.videoFolder, /metadata\.videoFolder/);
assert.match(writer.parameters.workflowInputs.value.fileName, /\$fromAI/);
assert.match(writer.parameters.workflowInputs.value.content, /\$fromAI/);
const guard = tool.nodes.find((node) => node.name === 'Útvonal ellenőrzése');
const disk = tool.nodes.find((node) => node.name === 'Read/Write Files - fájl mentése');
assert.ok(guard && disk, 'tool workflow must validate then use the n8n disk writer');
assert.ok(tool.connections[guard.name].main[0].some((edge) => edge.node === 'Szövegfájl előkészítése'));
assert.match(guard.parameters.jsCode, /almappa és külső útvonal nem írható/);
assert.match(disk.parameters.fileName, /targetPath/);
NODE

videos_root="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/data/videos"}}{{.Source}}{{end}}{{end}}' n8n-docker-n8n-1)"
if [[ -z "$videos_root" || ! -d "$videos_root" ]]; then
  printf 'FAIL: cannot resolve the mounted /data/videos host directory.\n' >&2
  exit 1
fi
test_dir="$(mktemp -d "$videos_root/FileWriteGateTest.XXXXXX")"
folder="${test_dir##*/}"
test_file="$test_dir/gate-test.txt"
outside_name=".file-write-gate-outside-$(uuidgen | tr '[:upper:]' '[:lower:]').txt"
outside_file="$videos_root/$outside_name"
response_file="$(mktemp /tmp/file-write-gate-response.XXXXXX)"
chat_webhook_id="$(node -e 'const w=require(process.argv[1]); process.stdout.write(w.nodes.find(n=>n.name==="Metaadat-chat").webhookId)' "$workflow_file")"
cleanup() {
  rm -rf "$test_dir"
  rm -f "$response_file"
}
trap cleanup EXIT
if [[ -e "$outside_file" ]]; then
  printf 'FAIL: generated outside-path test target already exists.\n' >&2
  exit 1
fi

send_chat() {
  local prompt="$1"
  local session="$2"
  curl --silent --show-error --max-time 150 --output "$response_file" --write-out '%{http_code}' \
    -H 'Content-Type: application/json' \
    --data "$(node -e 'process.stdout.write(JSON.stringify({action:"sendMessage",sessionId:process.argv[1],chatInput:process.argv[2],metadata:{channelKey:"freezwithme",videoFolder:process.argv[3]}}))' "$session" "$prompt" "$folder")" \
    "http://127.0.0.1:5678/webhook/$chat_webhook_id/chat"
}

http_status="$(send_chat "Kifejezetten használd a fájlíró eszközt: mentsd a gate-test.txt nevű fájlba pontosan ezt a szöveget: n8n-file-write-gate-ok" "file-write-valid-$folder")"
if [[ "$http_status" != 200 || ! -f "$test_file" ]] || ! grep -q 'n8n-file-write-gate-ok' "$test_file"; then
  printf 'FAIL: the n8n agent did not write inside the selected video folder; HTTP %s, response: %s\n' "$http_status" "$(cat "$response_file")" >&2
  exit 1
fi

http_status="$(send_chat "Kifejezetten próbáld meg az eszközzel a ../$outside_name útvonalra írni ezt a szöveget: must-not-be-written" "file-write-outside-$folder")"
body="$(cat "$response_file")"
if [[ "$http_status" != 200 || -e "$outside_file" ]]; then
  printf 'FAIL: the n8n agent wrote outside the selected video folder or the request failed; HTTP %s, response: %s\n' "$http_status" "$body" >&2
  exit 1
fi
if [[ "$body" != *'útvonal'* && "$body" != *'fájlnév'* && "$body" != *'mappán belül'* ]]; then
  printf 'FAIL: outside-path request did not return a clear path-validation error; response: %s\n' "$body" >&2
  exit 1
fi

printf 'PASS: n8n Read/Write Files wrote inside the selected folder and rejected the outside-folder request.\n'
