# FEATURE-6 — Mark talking-head pauses for review

**Status:** DONE

## Goal and measurable outcome

The 2b step records cuts for pauses longer than the configured threshold in
talking-head content after the cue. Running the existing Full Takes workflow
then shows those cuts as gaps between retention markers on the original footage.

## Current repository evidence

- `gomba-2-cut/scripts/transcribe_recordings.py` writes source-relative word
  start and end times. The saved T002 transcript and recording index yield a
  2.17-second gap at 11.00–13.17 seconds inside the cue-delimited content.
- `gomba-2-cut/2-recording-index.md` defines `clip_type`, `cue`,
  `content_start`, `content_end`, and `transcript_path`. The existing
  `local-workflows/recording-config.json` stores `magic_word`.
- `gomba-2-cut/2b-retake-plan.md` owns the 1.1 plan format, coverage gate and
  `retained_ranges`. Its current silence rule has no programmatic detection
  or validation and mentions pre-cue silence. `3c-resolve-review-timeline.md`
  already maps retention ranges to `KEEP IN` / `KEEP OUT` markers.
- The local `gomba-2-cut/WORKFLOW.md` currently stops on technical errors
  and separates final status from user communication. The local
  `orchestrator.md` already routes short user notices. The repair loop needs
  a narrow exception in those instructions.
- Root `make test-localworkflows` runs Python unittest and is included in
  `make test`.

## Agreed decisions

- Use existing Whisper word times. A gap may include speech Whisper missed.
- Read `silence_min_seconds` from the shared recording config. Ship value
  `2` and apply a strict greater-than comparison with decimal arithmetic.
- The agent owns cue and retake decisions. Python validates the completed
  draft, computes eligible pause cuts, and validates the result.
- The agent repairs fixable plan errors, reports each repair through the
  orchestrator, and retries within three total Python calls.

## MVP in scope

- [x] Add one standard-library Python CLI and the config setting - DONE
- [x] Integrate validation, pause processing, and repair reporting into 2b,
      with only the necessary local workflow and orchestrator edits - DONE

## Explicitly out of scope

- Changes to B-roll or cue handling, repeat recognition, Whisper, FFmpeg,
  marker types, 3c, Rough Cut, a UI, or a public API.
- General JSON validation framework or unrelated refactoring.

## Acceptance criteria

- Process identified `talking head` recordings with a verified cue. Inside
  `[content_start, content_end)`, find uncovered intervals from the union
  of clipped word spans, including gaps next to either content boundary.
  Use only recordings with usable words in that window. Unassigned pre-cue
  material, B-roll, and other clip types are outside this pass.
- Compare the full gap to the configured duration before intersecting it
  with existing retained ranges for the same recording. Preserve the
  retained order, existing cue and retake decisions, and every group marked
  for manual review. A pause pass may not empty a previously non-empty
  group. An existing empty `blocked` group in a valid `needs_review` plan
  passes structural validation and reaches the missing-footage gate.
- Validate before processing and again before publishing. Return a specific
  JSON field or record identifier and reason for each detected error. A failure
  leaves the last durable recovery save unchanged. Publish the validated
  final plan atomically. On continuation, apply pause processing only to
  rebuilt groups, including rebuilt groups pending from an interrupted pass.
  A repeated pass on the same result produces the same retained ranges.
- Each repair receives a brief user notice via the orchestrator and the step
  continues. Stop with the concrete error when correction is impossible from
  existing evidence or the third Python call fails. Missing footage still
  uses the existing coverage gate.

## Architecture and state ownership

Add `gomba-2-cut/scripts/apply_retakes_silence.py`. Its arguments are
`--draft`, `--index`, `--config`, and `--output`. The agent owns semantic
coverage, including deciding whether retained speech conveys each script
sentence and setting the existing coverage and readiness fields. The agent
writes the structured draft under `/tmp` before publishing the final plan.
The CLI reads the index and its referenced
transcripts, checks the plan's 1.1 schema, verifies the index and script
hashes, and validates group/record associations, coverage state and
finite, non-empty, bounded and non-overlapping retention intervals.
Use existing field shapes and verify word references against each resulting
span when splitting it. Python checks that the agent's coverage fields and
group states are structurally consistent, then preserves them. Parse JSON
timestamp and threshold numbers as decimals so that subtraction and the
strict comparison use the stored decimal values.

Keep the existing durable recovery saves in `retake_plan.json`: save
`needs_review` with `coverage_checked: false` before rebuilding, and save
each group's raw decisions and recording order as it is analyzed. In the
same recovery write, record rebuilt script IDs awaiting pause processing
in an optional `pending_pause_group_ids` list. Pass the list in the draft on
continuation, including any pending IDs from an earlier interrupted run.
Validate the whole draft, apply pause processing only to the listed groups,
and preserve other groups. The agent lists all newly analyzed groups on an
initial run.

The CLI emits the validated result only on success and clears the pending
list in that result. Publish only the output of the current successful call.
The 2b agent atomically replaces `retake_plan.json`
with the validated result and reads it back before returning. A failed pass
preserves the latest recovery save and its pending IDs. A valid final
`needs_review` result still goes through the agent's missing-footage gate.

## Security, privacy, failure, and operational handling

Read local JSON only. A positive finite numeric threshold is required.
Invalid draft data can be corrected from the index, script and transcripts.
Missing or corrupt authoritative inputs may block immediately if the agent
cannot correct the draft from those inputs. Keep one call counter per 2b
invocation, including the initial call. Report each repair separately from
the final status via progress messages. If the isolated executor cannot send
progress to its caller, log each repair in the existing `problems.md` and
have the orchestrator relay those notices after return, before advancing.
Neither path adds a user approval gate. Keep the final return value a workflow
status and use the existing failure and review gates.

## Ordered TDD implementation tasks

1. [x] Add `tests/test_retake_silence.py`, with `test_pause_ranges_respect_cue_threshold_and_existing_cuts`
       (including a 2.4–4.4-second boundary pair that must be retained,
       a 2.4–4.41-second pair that passes the threshold, and a configured
       alternate value),
       `test_protected_groups_and_other_clip_types_are_preserved`, and
       `test_invalid_plan_reports_location_without_writing_output`,
       `test_valid_needs_review_plan_preserves_empty_blocked_group`, and
       `test_failed_continuation_pass_preserves_recovery_save`. The latter
       starts from a durable per-group save and checks that failure preserves
       its bytes and pending IDs. On retry, verify that only pending groups
       are processed. Include repeated processing, bounds and word references.
       Register the module in `make test-localworkflows` and observe failure - DONE
2. [x] Implement the smallest CLI and config change to make those tests pass.
       Keep any cleanup inside the new helper - DONE
3. [x] Update 2b, the local workflow, and orchestrator instructions narrowly
       to run the CLI, relay repairs, preserve the retry limit and retain
       existing stage stops - DONE
4. [x] Run automated validation and perform the short agent handoff check
       below - DONE

## Automated validation

- `make test-localworkflows` for the focused local workflow tests.
- `make test` for the root suite.

## Manual validation

- Agent behavior requires one 2b handoff check on a disposable copy under
  `/tmp` with the real index and transcripts. Give the agent a draft with
  one invalid retained range and have it run
  `python3 local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/scripts/apply_retakes_silence.py --draft "$fixture/draft.json" --index "$fixture/recording_index.json" --config local-workflows/recording-config.json --output "$fixture/final.json"`
  where `fixture` is the copy's directory. Confirm it reports the repair,
  retries without a user prompt and uses the resulting ranges. With a valid
  `needs_review` result containing an empty `blocked` group, confirm the
  agent reaches the existing missing-footage gate.
- PASS — a `/tmp/feat6-manual` másolaton a hibás tartomány exit 1-gyel és
  konkrét hibamezővel jelentkezett, kimenet nélkül; a javított draft sikeresen
  levágta a 5.01–11.0 mp-es szünetet, a `blocked` csoport üres maradt, és a
  terv `needs_review` állapottal elérné a missing-footage kaput.

## Rollout and rollback

The configured rule applies on the next authorized 2b run. Existing saved
plans are not migrated. Revert the checkpoint to restore the previous 2b
behavior. Keep original media, transcripts and index files.

## Checkpoints

### Checkpoint 1 — Mark talking-head pauses for review

Status: APPROVED (review PASS)

Run `w-implement-preflight`, `w-implement`, then `w-implement-review`.
No API bump.

Commit message:

```text
<BACKEND> <FEATURE-6> Mark talking-head pauses for review
```

#### Unreleased

Unreleased: none. This local workflow adds no VPS work.
