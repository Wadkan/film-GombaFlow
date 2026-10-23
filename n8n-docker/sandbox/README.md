# n8n code sandbox (Assistant)

Privileged Docker-in-Docker runner for n8n Assistant. See the parent [README](../README.md) for how this connects to the main n8n stack.

Copy `env.example` to `.env` in this folder before starting. Secrets are read from `.env` for Compose substitution only (not mounted into the runner via `env_file`).

```sh
# from repo root
docker compose --env-file n8n-docker/sandbox/.env -f n8n-docker/sandbox/compose.yaml up -d --wait
```

Health (from the n8n container after both stacks are up):

```sh
docker compose -f n8n-docker/compose.yaml exec n8n wget -qO- http://sandbox-api:8080/healthz
```
