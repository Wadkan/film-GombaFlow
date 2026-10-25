.PHONY: export import flow-test file-write-test

REPO_ROOT := $(abspath ../..)
N8N_COMPOSE := $(REPO_ROOT)/n8n-docker/compose.yaml
COMPOSE := docker compose -f $(N8N_COMPOSE)

export:
	@./scripts/export-workflows.sh

import:
	@./scripts/import-workflows.sh

flow-test:
	@./scripts/test-meta-chat-flow.sh

file-write-test:
	@./scripts/test-file-write-tool.sh
