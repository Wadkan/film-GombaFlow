.PHONY: export import

REPO_ROOT := $(abspath ..)
N8N_COMPOSE := $(REPO_ROOT)/n8n-docker/compose.yaml
COMPOSE := docker compose -f $(N8N_COMPOSE)

export:
	@./scripts/export-workflows.sh

import:
	@./scripts/import-workflows.sh


