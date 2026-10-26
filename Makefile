.PHONY: start-n8n stop-n8n gomba1-transcript test format docs-format

.DEFAULT_GOAL := start-n8n

PRE_COMMIT_PYTHON := $(shell sed -n 's/^INSTALL_PYTHON=//p' .git/hooks/pre-commit 2>/dev/null | tr -d '"')

define run_pre_commit
if [ -x "$(PRE_COMMIT_PYTHON)" ]; then "$(PRE_COMMIT_PYTHON)" -m pre_commit $(1); else pre-commit $(1); fi
endef

start-n8n:
	@$(MAKE) -C n8n-docker start-n8n

stop-n8n:
	@$(MAKE) -C n8n-docker stop-n8n

gomba1-transcript:
	@python3 local-workflows/gomba-1-script-writer/run_transcript_flow.py

test:
	@python3 -m unittest discover -s tests -v

format:
	@$(call run_pre_commit,run ruff-format --all-files) || $(call run_pre_commit,run ruff-format --all-files)
	@$(call run_pre_commit,run isort --all-files) || $(call run_pre_commit,run isort --all-files)
	@$(MAKE) docs-format

docs-format:
	@repo_root=$$(pwd); \
	files=$$(find "$$repo_root" -type f \( -name '*.md' -o -name '*.mdx' \) \
		-not -path "$$repo_root/.git/*" \
		-not -path '*/node_modules/*' \
		-not -path '*/.next/*' \
		-not -path '*/.pytest_cache/*' \
		-not -path '*/.venv/*'); \
	if [ -z "$$files" ]; then \
		echo "No Markdown documentation files found."; \
	else \
		npx --yes prettier@3.8.3 --write $$files; \
	fi

