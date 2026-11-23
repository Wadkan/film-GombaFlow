# BUG3 — Omit redundant word refs from retained ranges

**Status:** DONE

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

- [x] Remove `word_refs` from the persisted `retained_ranges` output - DONE

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

1. In `tests/test_retake_silence.py`, update
   `test_protected_groups_and_other_clip_types_are_preserved`. Keep the
   existing legacy `word_refs` in the talking-head draft range and add valid
   legacy `word_refs` to the B-roll draft range that bypasses pause cutting.
   Assert that both output ranges have exactly `recording_id`, `source_id`,
   `source_start`, and `source_end`. Expect the talking-head bounds to be
   `[11.0, 13.17)` and the B-roll bounds to remain `[5.0, 13.0)`. Run the
   following command from the repository root and confirm the assertions fail
   against the current CLI - DONE

    ```sh
    PYTHONPATH=tests python3 -m unittest -q \
      test_retake_silence.RetakeSilenceTests.test_protected_groups_and_other_clip_types_are_preserved
    ```

2. Update the `retained_ranges` schema in `2b-retake-plan.md` and the output
   of `apply_retakes_silence.py` so every persisted range has only the four
   timeline fields, including ranges that bypass pause cutting. Keep the
   split verification internal. Rerun the test and confirm it passes - DONE

## Automated validation

- `make test-localworkflows` to run the focused local-workflow tests.

## Manual validation

- Run the silence CLI on the `3-flow-test` plan and confirm the output
  `retained_ranges` has no `word_refs`, while the four timeline fields remain.
  From the repository root, run:

    ```sh
    python3 local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/scripts/apply_retakes_silence.py \
      --draft local-workflows/script-and-cut-workflows/gombaFlow/projects/3-flow-test/retake_plan.json \
      --index local-workflows/script-and-cut-workflows/gombaFlow/projects/3-flow-test/recording_index.json \
      --config local-workflows/recording-config.json \
      --output /tmp/bug3-manual-retake-plan.json
    ```

## Rollout and rollback

- Applies on the next 2b run. Revert the schema and CLI change to restore the
  prior output.

## Checkpoints

### Checkpoint 1 — Omit redundant word refs from retained ranges

Status: APPROVED (review PASS)

Commit message:

```text
<SKILL> <BUG3> Omit redundant word refs from retained ranges
```

#### Unreleased

Unreleased: none — local workflow instruction change adds no VPS work.

No API bump is required; this change affects only the local workflow JSON plan.
