# BUG2 — Accept script-headed topic IDs for local projects

**Status:** PLANNED

## Goal and measurable outcome

The recording index recognizes a spoken topic number when the selected script's
header and the cut workflow state already identify the topic, even if that topic
is not present in `projects/registry.json`.

## Current repository evidence

- `2-recording-index.md` (28–30) reads `projects/registry.json` and uses its
  `topic_id` / `project_dir` as the source of the script location; (76–79, 130)
  require the spoken numbers to be identified against that registry.
- `projects/registry.json` lists only the YouTube-sourced topics
  `1-postgresql-hybrid-search-course` and `2-unlimited-claude-code-for`; a local
  project is not registered there.
- `3-flow-test/3-script.md` declares `Témaazonosító: 3-flow-test`, which has no
  entry in `projects/registry.json`.

## Agreed decisions

- When the registry lacks the topic, resolve it from the selected script's
  header `Témaazonosító` and `cut_workflow_state.json` `topic_id`, then locate
  the project folder from that same value.

## Reproduction and impact

- A local project created outside the video registry, filmed and transcribed;
  the index step marks valid spoken topics as `needs_review`.

## Current behavior versus required behavior

- Current: topic must be present in the registry.
- Required: a matching script-header and workflow-state topic is accepted.

## Root-cause evidence

- The index skill uses the video-only registry as the single topic source;
  local projects are not registered there.

## Regression and compatibility surface

- Preserve registry-driven resolution for registered videos, magic-word
  variants, clip types, timeline and script-ID checks.

## Smallest safe fix

- [ ] Allow script-header/workflow-state topic resolution when the registry
      has no entry for the spoken topic - TODO

## Explicitly out of scope

- Registry data changes; retrieve/deletion changes; timeline or clip-type rules.

## Required corrected behavior

- A spoken topic that matches the selected script's header and workflow state
  is recognized, and its recordings are identified without a new registry entry.
  No API bump.

## Architecture and state ownership

- The script header is authoritative for its own topic; the registry remains
  authoritative only for registered videos.

## Security, privacy, failure, and operational handling

- Read local JSON only. Never invent a topic when both sources disagree.

## Ordered TDD implementation tasks

1. On a disposable `/tmp` fixture with a script header topic that is absent from
   `projects/registry.json`, run the 2-recording-index agent and capture that the
   spoken `timeline N script M` recording stays `needs_review` with the
   registry-missing reason, then amend `2-recording-index.md` (28–30, 76–79, 130) so the topic resolves from the selected script's header `Témaazonosító`
   and `cut_workflow_state.json` `topic_id`; rerun and confirm the recording
   becomes `identified` with the matching `script_id` - TODO

## Automated validation

- `make test-localworkflows` to keep the local-workflow suite green.

## Manual validation

- Run the 2-recording-index agent on the disposable `/tmp` fixture and confirm
  the spoken `timeline N script M` recording becomes `identified` with the
  matching `script_id`, without changing the preserved source ranges.

## Rollout and rollback

- Applies on the next index run. Revert the wording to require the registry.

## Checkpoints

### Checkpoint 1 — Accept script-headed topic IDs

Status: TODO

Commit message:

```text
<SKILL> <BUG2> Accept script-headed topic IDs for local projects
```

### Unreleased

Unreleased: none — local workflow instruction change adds no VPS work.
