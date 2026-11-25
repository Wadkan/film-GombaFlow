# BUG1 — Record recognized HIBA retake deletions in the 2b plan

**Status:** DONE

## Goal and measurable outcome

A fully recognized `HIBA` / `HIBA újra` retake command persists its deletion
into the canonical `deletions` field, so the failed attempt no longer stays in
`retained_ranges`.

## Current repository evidence

- `2b-retake-plan.md` (60–66) instructs marking the replaced speech from the
  restarted takeover word through the error signal; (325–327) requires recording
  each retake deletion decision.
- `tests/test_retake_silence.py` (196–197) names the per-group fields
  `deletions` and `command_omissions`.
- The 2b schema describes the deletion decision without pinning its field name,
  so the canonical field is not stated anywhere in `2b-retake-plan.md`.

## Agreed decisions

- Pin `deletions` for retake deletions and `command_omissions` for command
  exclusions, matching `tests/test_retake_silence.py`.
- A recognized `HIBA` / `HIBA újra` pair writes one `deletions` entry whose
  replaced span runs from the restarted takeover word through the magic-word
  pair; the takeover word is identified by `2b-retake-plan.md` (63–65), not an
  invented boundary.

## Reproduction and impact

- A 2b run can persist the decision under an unintended field name, so downstream
  consumers and validators cannot rely on the schema.

## Current behavior versus required behavior

- Current: the deletion decision field name is unspecified.
- Required: recognized retakes land in `deletions`; command exclusions in
  `command_omissions`.

## Root-cause evidence

- The schema explains the decision content but never names the persisted field,
  so the recognized `HIBA` outcome is not structurally checkable.

## Regression and compatibility surface

- Preserve cue/command omission, silence cutting, coverage gate, and every
  group that has no confident retake boundary.

## Smallest safe fix

- [x] Pin `deletions` and `command_omissions` in `2b-retake-plan.md` (325–330)
      and state that a recognized `HIBA` pair writes its replaced span into
      `deletions` at (60–66) - DONE

## Explicitly out of scope

- Whisper transcript changes; recording-index or magic-word changes; silence
  threshold changes; word-reference output changes.

## Required corrected behavior

- With a recognized retake pair and an identified takeover word, 2b emits
  exactly one `deletions` entry covering the replaced span (takeover word
  through the magic-word pair) and drops that span from `retained_ranges`.
  No API bump.

## Architecture and state ownership

- 2b stays the owner of deletion decisions; the transcript and index are
  read-only. `deletions` is the authoritative field.

## Security, privacy, failure, and operational handling

- Read local JSON only. Keep the whole take when the takeover word is not
  confidently identifiable.

## Ordered TDD implementation tasks

1. Confirm `tests/test_retake_silence.py` uses `deletions`, then update
   `2b-retake-plan.md` (325–330) to name `deletions` and `command_omissions`
   and (60–66) to state the recognized `HIBA` pair writes the replaced span
   into `deletions`; verify a disposable talking-head fixture with a recognized
   pair produces a `deletions` entry and no failed span in `retained_ranges` - DONE

## Automated validation

- `make test-localworkflows` to keep the local-workflow suite green.

## Manual validation

- Run the 2b agent on a disposable talking-head fixture with a fully recognized
  `HIBA újra` pair and confirm the output `deletions` entry covers the takeover
  word through the magic-word pair, and the failed span is absent from
  `retained_ranges` - PASS. Four recognized retake deletions were checked.
  Each begins at the previous attempt's takeover word, ends at the matching
  command's closing magic word, has complete transcript word references, and
  overlaps no retained range. The 2b validator exited successfully.

## Rollout and rollback

- Applies on the next 2b run. Revert the 2b wording to restore prior behavior.

## Checkpoints

### Checkpoint 1 — Record recognized HIBA retake deletions

Status: APPROVED (review PASS)

Commit message:

```text
<SKILL> <BUG1> Record recognized HIBA retake deletions in the 2b plan
```

### Unreleased

Unreleased: none — local workflow instruction change adds no VPS work.
