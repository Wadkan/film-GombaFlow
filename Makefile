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
	@python3 local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/run_transcript_flow.py

test:
	@python3 -m unittest discover -s tests -v

format:
	@tmp_dir=$$(mktemp -d /tmp/film-gombaflow-format.XXXXXX); \
	trap 'rm -rf "$$tmp_dir"' EXIT; \
	run_hook() { \
		hook="$$1"; output="$$tmp_dir/$$hook.log"; \
		if $(call run_pre_commit,run "$$hook" --all-files) >"$$output" 2>&1; then \
			cat "$$output"; \
		else \
			status=$$?; \
			if ! grep -q 'files were modified by this hook' "$$output"; then cat "$$output"; return "$$status"; fi; \
			if $(call run_pre_commit,run "$$hook" --all-files) >"$$output" 2>&1; then cat "$$output"; else cat "$$output"; return 1; fi; \
		fi; \
	}; \
	run_hook ruff-format && run_hook isort
	@$(MAKE) docs-format

docs-format:
	@repo_root=$$(pwd); \
	find "$$repo_root" -type f \( -name '*.md' -o -name '*.mdx' \) \
		-not -path "$$repo_root/.git/*" \
		-not -path '*/node_modules/*' \
		-not -path '*/.next/*' \
		-not -path '*/.pytest_cache/*' \
		-not -path '*/.venv/*' \
		-exec npx --yes prettier@3.8.3 --write {} +

