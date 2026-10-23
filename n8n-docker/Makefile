.PHONY: start-n8n stop-n8n config-check ensure-volume

.DEFAULT_GOAL := start-n8n

COMPOSE := docker compose
SANDBOX_ENV := --env-file sandbox/.env
SANDBOX_COMPOSE := $(COMPOSE) $(SANDBOX_ENV) -f sandbox/compose.yaml
N8N_COMPOSE := $(COMPOSE) -f compose.yaml

ensure-volume:
	docker volume inspect n8n-docker_n8n_data >/dev/null 2>&1 || docker volume create n8n-docker_n8n_data

start-n8n: ensure-volume
	@./scripts/fix-env.sh
	$(SANDBOX_COMPOSE) up -d --wait
	@./scripts/sync-instance-ai-db.sh
	$(N8N_COMPOSE) up -d

stop-n8n:
	$(N8N_COMPOSE) stop
	$(SANDBOX_COMPOSE) stop

config-check:
	$(N8N_COMPOSE) config
	$(SANDBOX_COMPOSE) config
