# {{PROJECT_NAME}} AI Context

Purpose: stable project/domain context. Workflow, Git/staging rules, plan format, and review rules belong in `/AGENTS.md` and W-flow shared skills — not here.

This file is not a project diary. Do not store temporary implementation reports, current batch status, old review outcomes, or hardcoded version numbers here. Current repository files and docs remain the source of truth.

Stack facts: `/project-stack.md`; live deploy: `docs/deployment/`.

---

## Project mission

TODO: Describe what this project is and its primary engineering direction.

---

## Architecture boundaries

TODO: Define source-of-truth boundaries, what frontend/backend must not duplicate, and API contract rules.

---

## Domain rules

TODO: Business, privacy, and other domain constraints that are not stack facts.

---

## Source loading guidance

For new chats in this repository, load:

- `/AGENTS.md` for the shared agent entry point
- `/AI_CONTEXT.md` for stable project/domain context
- `/project-stack.md` for stack facts
- current repo docs/source relevant to the task

---

## AI agent completion style

TODO: Optional project-specific completion preferences, or keep lean completions (direct answers, blockers only, optional max 3-line summary when everything went well).
