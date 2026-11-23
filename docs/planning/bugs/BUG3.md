# BUG3 — Omit redundant word refs from retained ranges

**Status:** PLANNED

## Goal and measurable outcome

`retained_ranges` entries in `retake_plan.json` carry only `recording_id`,
`source_id`, `source_start` and `source_end`; word-level `word_refs` are not
duplicated from the transcripts into the persisted plan.

## Current repository evidence

- `3-flow-test` `retake_plan.json` `retained_ranges` entries include `word_refs`
  with word text already present in the transcript JSONs.
- `3c-resolve-review-timeline.md` (100–103) reads only `recording_id`,
  `source_id`, `source_start` and `source_end` from each `retained_ranges`
  element, so `word_refs` is unused downstream.
- `2b-retake-plan.md` (324–327) requires the word references in the schema.
- `apply_retakes_silence.py` `_apply_group` copies and filters `word_refs`.

## Agreed decisions

- Stop persisting `word_refs` on `retained_ranges`; keep word-level checks
  during split verification internal to the CLI.
- Leave deletion-decision evidence fields unchanged.

## Reproduction and impact

- Any 2b run writes word text into `retained_ranges`, duplicating transcript
  data and enlarging the plan for no downstream use.

## Current behavior versus required behavior

- Current: `retained_ranges` entries may contain `word_refs`.
- Required: `retained_ranges` entries contain only the four timeline fields.

## Root-cause evidence

- The 2b schema and the silence CLI both carry `word_refs` into the output.

## Regression and compatibility surface

- Preserve deletion decisions, command exclusions, coverage gate, and the
  four retained-range timeline fields that 3c consumes.

## Smallest safe fix

- [ ] Remove `word_refs` from the persisted `retained_ranges` output - TODO

## Explicitly out of scope

- Deletion/command fields, transcript files, and 3c consumer behavior.

## Required corrected behavior

- The `retake_plan.json` output has no `word_refs` inside `retained_ranges`,
  and the targeted tests still pass.

## Architecture and state ownership

- Word-level provenance stays the transcripts' data; the plan only persists
  retention boundaries.

## Security, privacy, failure, and operational handling

- Read local JSON only. No behavioral change to validation or recovery.

## Ordered TDD implementation tasks

1. In `tests/test_retake_silence.py`, adjust the talking-head case to assert
   the output `retained_ranges` entries carry no `word_refs`; observe it fail
   against the current CLI. Run `python3 -m unittest test_retake_silence` to
   register the failure - TODO
2. Change `apply_retakes_silence.py` `_apply_group` and `2b-retake-plan.md`
   (324–327) so `word_refs` is not persisted on `retained_ranges` while the
   split verification stays internal; rerun the test to green - TODO

## Automated validation

- `make test-localworkflows` to run the focused local-workflow tests.

## Manual validation

- Run the silence CLI on the `/tmp` `3-flow-test` copy and confirm the output
  `retained_ranges` has no `word_refs`, while the four timeline fields remain.

## Rollout and rollback

- Applies on the next 2b run. Revert the schema and CLI change to restore the
  prior output.

## Checkpoints

### Checkpoint 1 — Omit redundant word refs from retained ranges

Status: TODO

Commit message:

```text
<SKILL> <BUG3> Omit redundant word refs from retained ranges
```

### Unreleased

Unreleased: none — local workflow instruction change adds no VPS work.
