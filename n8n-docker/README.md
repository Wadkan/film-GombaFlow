# n8n with Docker

Self-hosted [n8n Assistant](https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-n8n-assistant/) using **Setup 2**: n8n in this folder, code sandbox in [`sandbox/`](sandbox/).

## Layout

- `compose.yaml` — n8n, external task runners, SearXNG (web search)
- `sandbox/compose.yaml` — `sandbox-certs`, `sandbox-api`, `sandbox-runner-1` (privileged DinD)

Általános n8n export/import eszközök: [`../n8n-workflows/README.md`](../n8n-workflows/README.md), a konténer útvonala `/data/n8n-workflows`.

Both stacks share the Docker network `n8n_assistant` so n8n can reach `http://sandbox-api:8080`.

## First-time setup

From the repository root:

```sh
cp n8n-docker/env.example n8n-docker/.env
cp n8n-docker/sandbox/env.example n8n-docker/sandbox/.env
```

Edit both `.env` files:

- In `sandbox/.env`: generate secrets for `SANDBOX_API_*` / `SANDBOX_RUNNER_*`.
- In `n8n-docker/.env`: set `N8N_SANDBOX_SERVICE_API_KEY` to the **same** value as `SANDBOX_API_KEYS` in `sandbox/.env`.

Add your LLM key in the n8n UI (you already use OpenRouter) or set e.g. `OPENROUTER_API_KEY` / `N8N_INSTANCE_AI_MODEL_API_KEY` in `n8n-docker/.env`.

## Start / stop

From the repository root (default goal is `start-n8n`):

```sh
make
```

Or from this directory:

```sh
make start-n8n
```

`start-n8n` creates the n8n data volume if needed, prunes obsolete env keys, starts the sandbox stack (waits for `sandbox-api` to be healthy), aligns persisted Instance AI sandbox flags with `.env` when needed, then starts n8n.

Stop n8n before the sandbox stack:

```sh
make stop-n8n
```

`stop` keeps containers and volumes. Avoid `docker compose down -v` unless you intend to wipe data.

Data lives in the Docker volume `n8n-docker_n8n_data`. Sandbox API state is in `sandbox-api-data` on the sandbox stack.

## Sandbox connection (Setup 2)

Configure the sandbox in **`n8n-docker/.env`**, not in the Assistant UI:

| Variable                           | Value                                        |
| ---------------------------------- | -------------------------------------------- |
| `N8N_INSTANCE_AI_SANDBOX_ENABLED`  | `true`                                       |
| `N8N_INSTANCE_AI_SANDBOX_PROVIDER` | `n8n-sandbox`                                |
| `N8N_SANDBOX_SERVICE_URL`          | `http://sandbox-api:8080`                    |
| `N8N_SANDBOX_SERVICE_API_KEY`      | same as `SANDBOX_API_KEYS` in `sandbox/.env` |

When these variables are set, n8n treats URL and provider as environment-managed. `make start-n8n` also sets `sandboxEnabled` / `sandboxProvider` in the database when they disagree with `.env`.

## Verify (Setup 2)

```sh
docker compose --env-file n8n-docker/sandbox/.env -f n8n-docker/sandbox/compose.yaml ps
docker compose -f n8n-docker/compose.yaml exec n8n wget -qO- http://sandbox-api:8080/healthz
```

Expected: `{"status":"ok"}`.

Docs: [Self-host the sandbox manually](https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-n8n-assistant#setup-2-self-host-the-sandbox-manually-advanced), [Docker Compose guide](https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/).
