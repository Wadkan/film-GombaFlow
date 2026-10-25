#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../.." && pwd)"
compose_file="${N8N_COMPOSE_FILE:-$repo_root/n8n-docker/compose.yaml}"
workflow_file="$repo_root/n8n-workflows/youtube-upload/workflows/youtube-meta-folder-picker.json"
chat_webhook_id="$(node -e 'const w=require(process.argv[1]); process.stdout.write(w.nodes.find(n=>n.name==="Metaadat-chat").webhookId)' "$workflow_file")"

context="$(node "$repo_root/n8n-workflows/youtube-upload/scripts/load-channel-context.js" freezwithme)"
CONTEXT_JSON="$context" PACKAGE_ROOT="$repo_root/n8n-workflows/youtube-upload" node <<'NODE'
const assert = require('node:assert/strict');
const result = JSON.parse(process.env.CONTEXT_JSON);
assert.equal(result.ok, true, 'channel loader must succeed');
const path = require('node:path');
const registry = require(path.join(process.env.PACKAGE_ROOT, 'config/channels.json'));
const channel = registry.channels.find(c => c.key === 'freezwithme');
const expected = channel.sourceFiles.map(file => path.resolve(require('node:fs').realpathSync(process.env.PACKAGE_ROOT), channel.sourcePath, file));
assert.deepEqual(result.files.filter((file) => path.isAbsolute(file.path)).map((file) => file.path), expected);
assert.deepEqual(result.missingFiles, [], 'all registry files must be mounted and readable');
NODE

test_dir="$(mktemp -d /tmp/youtube-meta-chat-flow.XXXXXX)"
cleanup() { rm -rf "$test_dir"; }
trap cleanup EXIT
response_file="$test_dir/error-response.json"
status="$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
  -H 'Content-Type: application/json' \
  --data '{"action":"sendMessage","sessionId":"flow-test-invalid-channel","chatInput":"teszt","metadata":{"channelKey":"not-a-real-channel","videoFolder":"flow-test"}}' \
  "http://127.0.0.1:5678/webhook/$chat_webhook_id/chat")"
body="$(cat "$response_file")"
if [[ "$status" != 200 ]]; then
  printf 'FAIL: chat error flow returned HTTP %s: %s\n' "$status" "$body" >&2
  exit 1
fi
if [[ "$body" == *'Unknown error'* || "$body" == *'Error in workflow'* || "$body" == *'Internal Server Error'* ]]; then
  printf 'FAIL: chat exposed a generic workflow error instead of an actionable message: %s\n' "$body" >&2
  exit 1
fi
if [[ "$body" != *'csatorna'* && "$body" != *'channel'* && "$body" != *'forrás'* ]]; then
  printf 'FAIL: chat response did not explain the invalid channel: %s\n' "$body" >&2
  exit 1
fi

page_file="$test_dir/chat.html"
status="$(curl --silent --show-error --output "$page_file" --write-out '%{http_code}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'channelKey=freezwithme&videoFolder=flow-test' \
  'http://127.0.0.1:5678/webhook/youtube-meta-submit')"
if [[ "$status" != 200 ]]; then
  printf 'FAIL: chat page returned HTTP %s: %s\n' "$status" "$(cat "$page_file")" >&2
  exit 1
fi

chrome_bin="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [[ ! -x "$chrome_bin" ]]; then
  printf 'FAIL: Chrome is required for the chat UI flow test; set CHROME_BIN to its executable.\n' >&2
  exit 1
fi
"$chrome_bin" --headless --disable-gpu --no-sandbox --disable-dev-shm-usage \
  --allow-file-access-from-files --user-data-dir="$test_dir/chrome-profile" \
  --virtual-time-budget=10000 --dump-dom "file://$page_file" \
  > "$test_dir/chat-dom.html" 2> "$test_dir/chrome.log"
CHAT_DOM="$test_dir/chat-dom.html" node <<'NODE'
const assert = require('node:assert/strict');
const html = require('node:fs').readFileSync(process.env.CHAT_DOM, 'utf8');
assert.match(html, /<textarea[^>]*data-test-id="chat-input"[^>]*placeholder="Írd be az üzeneted/,
  'rendered chat must contain its message input');
assert.doesNotMatch(html, /<textarea[^>]*data-test-id="chat-input"[^>]*disabled/,
  'rendered chat input must be enabled');
assert.doesNotMatch(html, /Powered by n8n/i, 'unrequested n8n branding must be absent');
NODE

printf 'PASS: declared channel sources, explicit chat errors, enabled browser input, and footer removal.\n'
