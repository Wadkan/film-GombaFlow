---
name: workflow-flow-audit
description: Checks whether a folder's workflow and its agent skills/prompts form a complete sequential flow and agree with one another. Use when asked to audit workflow-to-skill consistency or flow completeness.
---

# Workflow Flow Audit

Audit the workflow and the skills/prompts that implement it in one user-specified folder. The audit itself is read-only. Only make changes after the user explicitly accepts the offered fixes.

## Required input

The user must provide the folder to inspect when invoking this skill. If no folder is provided, stop immediately and ask which folder to inspect. Do not assume the workspace root, the current file's folder, or a previously mentioned folder. If the provided path does not exist or cannot be accessed, stop and ask for a valid path.

## Procedure

1. Locate and read the folder's `WORKFLOW.md` or `workflow.md` (case-insensitive filename). If there is no workflow document, report that as the blocker and stop.
2. Identify the skills, agent prompts, or other executable instruction files in that folder that implement the workflow. Read each relevant file fully. Follow workflow references to schemas, templates, indexes, and output artifacts when needed to verify the stated contracts.
3. Trace the workflow in order. For every stage, identify its inputs, outputs, owner/responsibility, and the next stage that consumes its output. Check that the handoffs form a continuous flow from the initial input to the intended terminal outcome, including any stated publishing, archival, or status-update steps.
4. Compare the workflow against the implementing skill/prompt files. Check stage coverage and ordering, file paths and names, input/output formats and schemas, field ownership, status/score rules, and restrictions such as whether an agent may modify another stage's data. Treat contradictions, unimplemented stages, and outputs with no consumer as findings; do not infer missing behavior as implemented.
5. Report only actionable changes needed to close the flow or resolve discrepancies. Keep the response very short, in the user's language, as flat bullets. Name the relevant stage or file and state what to change. If the flow is complete and consistent, say so in one short sentence and do not offer fixes.
6. After listing findings, ask whether the user wants you to apply those fixes. Do not edit anything until the user explicitly agrees.
7. If the user agrees, apply only the smallest changes required to fix the listed findings. Do not refactor, reformat unrelated content, improve unreported issues, or change any other behavior or files. If a listed fix would require broader changes than described, ask before expanding scope.
8. After editing, verify that the listed findings are resolved and that no unrelated files or content were changed. Summarize the exact fixes briefly.

## Guardrails

- Base findings only on files in the provided folder and explicit references from those files.
- Distinguish a genuinely missing stage from a stage implemented in a differently named file; search the provided folder before reporting it missing.
- Do not treat a documentation-only description as an implemented skill unless an instruction file actually defines the stage's behavior.
- Before explicit user approval, do not make changes in the target folder; the audit is read-only.
- After approval, modify only the files and lines necessary for the findings the user accepted. Preserve surrounding content and existing conventions.
