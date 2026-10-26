# Agent entry point

This root file is intentionally short so Codex, GitHub Copilot, and other repo agents can discover the project instructions quickly.

At the start of every task, read and follow:

- `/PROJECT_RULES.md` for project-specific agent rules, when present
- `/AI_CONTEXT.md` for stable project/domain context
- `.cursor/skills/skill-index.md` for skill routing and shared references
- `docs/orchestration/ORCHESTRATOR.md` for the local backlog orchestrator
- current repository docs/source/tests/Makefile/package scripts relevant to the task

Current repository source and docs override stale memories, summaries, or old prompts.

All agents, including the orchestrator and delegated agents, must create
disposable helper files (such as request JSON, scratch scripts, and temporary
logs) under `/tmp`, outside the repository working tree. Persistent documents
and evidence required by a workflow stay in that workflow's designated paths.

Do not use Git staging or commit commands. Skills call
`tooling/git/git-action message` only; they do not stage, commit, or push. On
the manual path the user performs writes through the same tool. In the
orchestrated path only the Grok orchestrator runs `claim`, `commit`, and
`push`.

Do not use Markdown tables in chat replies or in files you write or edit; use headings and bullet lists instead.

Allocate `BUG{N}` / `FEATURE-{N}` only from the clean root registries
`docs/planning/BUGS.md` and `docs/planning/FEATURES.md`: read **Next unused
integer**, confirm the destination path is free, add the registry heading with
a direct plan link first, create the dedicated plan from
`docs/planning/templates/work-items/`, then bump the next integer. Do not invent
IDs from memory or from a private notes file. If the local template link is
missing or broken, stop and run `make init` — do not fall back to a W-flow
absolute source path. Process detail stays in the registries and type profiles,
not in this entry point.

`docs/planning/BACKLOG.md` is a compact, non-canonical index of work that is
not `DONE`. List order is priority; rows are not numbered. It must link to the
canonical plan (directly or through a clean-registry heading); it never
allocates IDs or stores plan detail. Only `w-review-feature-plan` or
`w-review-bug-plan` adds an item, and only after approving its canonical plan.
Only `w-implement-review` removes an item, and only after the final checkpoint
receives review PASS and the canonical plan is `DONE`; delete only that row —
do not renumber or edit other rows.
