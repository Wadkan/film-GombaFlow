# Local backlog orchestrator

Local implementation loop for the Grok orchestrator agent service in an
implementation repository.

Skill names and the checkpoint chain come from `.cursor/skills/skill-index.md`.
Where that index says `planning-reference.md` owns the loop, follow that file
for checkpoint rules. This document only says which of those steps the
orchestrator runs, and when it stops. The orchestrator uses
`tooling/git/git-action` for claim, commit, and push, and `git switch` for
local branch checkout. Skills call `message` only.

Explicit user instructions override the orchestration defaults in this
document.

## Who may stage and commit

Only the orchestrator stages and commits through `tooling/git/git-action`.
No other agent may stage or commit. No skill may stage or commit, including
`w-implement`, `w-implement-review`, `w-implement-preflight`, and the plan
skills.

Run the normal Git hooks on every commit. Never pass `--no-verify` or bypass
hooks by another route.

- Review PASS: the orchestrator calls `commit` with the final PASS `message`
  handoff from `w-implement-review`. The message is the plan's commit line. It
  does not start with `<DRAFT>`.
- Automatic human-needed stop (round 3 `CHANGES REQUESTED`, review `BLOCKED`,
  post-suite failure, or non-predecessor preflight `NOT READY` after claim):
  the orchestrator builds an `implementation-stop` preview, then calls `commit`
  with a message starting `<DRAFT>`. A failed user-requested extra review does
  not create a commit.
- If that stop left nothing to commit, `commit` may return `no_changes`; do not
  create an empty commit.

A fix round that goes back to `w-implement` is not a commit.

## Git action contract

Use `tooling/git/git-action` with explicit `--repo` and JSON `--request` files
or stdin. The executable contract is the `Script contract` docstring in
`tooling/git/git-action`. Skills never call `claim`, `claim-recover`, `commit`,
or `push`.

Before starting work on a backlog row:

1. In the main checkout, switch to `main`, fetch the configured remote, and
   ensure the clean local `main` HEAD matches the fetched default-branch SHA.
   Fast-forward if needed; stop on divergence or a dirty checkout.
2. Exclude every backlog work ID that already has a remote `work/<WORK-ID>`
   branch. A matching remote branch means the item is in progress, blocked, or
   orphaned until merge deletes it.
3. For the first eligible row, run `/w-implement-preflight` for checkpoint 1
   on `main`. Claim only after READY. A NOT READY result follows Review rounds
   without a claim or checkout.
4. Call `claim` with `work_id`. The tool
   derives `refs/heads/work/<WORK-ID>` from that field and rejects any other
   ref field. `expected_base_sha` is the fetched default-branch snapshot SHA.
   The local branch destination must be absent. With no `worktree` field, it
   creates the claimed local branch without checking it out.
5. If `claim` returns `already_claimed`, try the next eligible row. If it
   returns `created`, run `git switch work/<WORK-ID>` in the same local checkout,
   verify the branch and HEAD equal the claim result, then start implementation.
   Do not create a linked worktree. If checkout fails, leave the claim in place
   and request user recovery; do not start implementation or the next row.

`FEATURE-7` below is an illustrative fixture. Replace the SHA fields with the
values from the fetch or from the `message` handoff. Do not add fields.

Claim, after the fetch:

```bash
tooling/git/git-action claim --repo . --request -
```

```json
{
    "schema_version": 1,
    "caller": "orchestrator",
    "work_id": "FEATURE-7",
    "remote": "origin",
    "remote_base_ref": "refs/heads/main",
    "expected_base_sha": "0123456789abcdef0123456789abcdef01234567",
    "operation_id": "claim-FEATURE-7"
}
```

PASS commit. `message_request` is the final PASS handoff. `expected` repeats
that result's message, event, fingerprints, checkpoint, description, and
selected-file digest. `expected_head` is the HEAD recorded on the handoff.

```bash
tooling/git/git-action commit --repo . --request -
```

```json
{
    "schema_version": 1,
    "caller": "orchestrator",
    "operation_id": "commit-FEATURE-7-cp1-pass",
    "message_request": {
        "schema_version": 1,
        "caller": "w-implement-review",
        "event": "implementation-pass",
        "source": { "kind": "plan", "work_id": "FEATURE-7", "checkpoint": 1 },
        "review": { "verdict": "PASS", "round": 1 }
    },
    "expected": {
        "message": "<BACKEND> <FEATURE-7> add audit events",
        "event": "implementation-pass",
        "input_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "templates_sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "checkpoint": 1,
        "description": "add audit events",
        "selected_files_digest": "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    },
    "expected_branch": "work/FEATURE-7",
    "expected_head": "abcdef0123456789abcdef0123456789abcdef01",
    "files": ["src/example.txt"]
}
```

For a round 3 `CHANGES REQUESTED` `implementation-stop` commit, first build its
preview, then call the same `commit` command with the PASS request shape above.
Replace `operation_id` with `commit-FEATURE-7-cp1-stop`. In `message_request`, set
`caller` to `orchestrator`, `event` to `implementation-stop`, `review` to
`{"verdict":"CHANGES REQUESTED","round":3}`, and `stop_reason` to
`review-rounds-exhausted`; keep its schema version and source. Populate
`expected` from that preview: its message begins `<DRAFT> `, its event is
`implementation-stop`, and its fingerprints and selected-file digest come
from that preview. Keep the correct branch, current `expected_head`, and exact
selected `files`. Do not reuse the PASS preview's values.

For other automatic human-needed stops, use the same shape and that stop's
preview: review `BLOCKED` uses `stop_reason: review-blocked` and its actual
round (1–3); preflight `NOT READY` uses `stop_reason: preflight-not-ready` and
`review: {"verdict":"NOT READY"}` without a round. Do not use the round 3
values for those stops.

After every checkpoint has a PASS `commit` on the claimed branch, call `push`
for that exact branch and open a pull request.

```bash
tooling/git/git-action push --repo . --request -
```

```json
{
    "schema_version": 1,
    "caller": "orchestrator",
    "remote": "origin",
    "expected_branch": "work/FEATURE-7",
    "expected_commit": "abcdef0123456789abcdef0123456789abcdef01",
    "operation_id": "push-FEATURE-7"
}
```

Interrupted post-claim local setup leaves the remote claim in place. Only the
user may call `claim-recover`; the orchestrator never does. With no worktree,
`resume` restores only the local branch, and `release` requires that branch
not be checked out. Use the request below with `mode` set to `inspect`,
`resume`, or `release`. Use a distinct `operation_id` for each mode (for example,
`recover-FEATURE-7-inspect`, `recover-FEATURE-7-resume`, or
`recover-FEATURE-7-release`). `caller` is `user`; the tool derives the remote
ref from `work_id`.

```bash
tooling/git/git-action claim-recover --repo . --request -
```

```json
{
    "schema_version": 1,
    "caller": "user",
    "work_id": "FEATURE-7",
    "remote": "origin",
    "mode": "inspect",
    "expected_claim_sha": "0123456789abcdef0123456789abcdef01234567",
    "operation_id": "recover-FEATURE-7-inspect"
}
```

There is no shared `WFLOW-STATE-V1` schema, no revert support, and no
caller-authentication layer in this tool. A `caller` string is policy only.

## Plans stay human

Do not automate plan creation or plan review. Do not invoke `w-plan-feature`,
`w-plan-bug`, `w-clarify`, `w-review-feature-plan`, `w-review-bug-plan`,
`w-investigate-bug`, or the initiative skills (`w-initiative-review`,
`w-initiative-decomposer`, `w-initiative-candidate-handoff`, `w-initiative-link`).

Start from a backlog row that plan review has already approved.

## Where it runs

Run where the Grok service has shell access to the implementation repository
and can invoke `tooling/git/git-action`. The service is not code in this
repository; it is an agent that follows this document. If the runner cannot
call the tool, stop instead of claiming execution.

Local and cloud runners may both use the same contract when they have
repository-capable shell access.

One work item at a time. Do not run implement or review for two items in
parallel, and do not run the steps of one item in parallel.

## Model selection

When calling CreateAgent, always pass a Cursor catalog model slug. Do not omit
it (UI Auto/default inheritance is not allowed). Do not use OpenRouter or the
OpenAI API.

A running worker's model cannot be changed. When the next step needs a
different slug, start a new agent. The same slug may continue on the same
agent.

- Preflight and other read-only or hygiene steps: `composer-2.5`
- First `w-implement` of a checkpoint: `grok-4.7-medium`
- `w-implement-review`: `grok-4.7-high`
- The implement round after `CHANGES REQUESTED`: `grok-4.7-high`

Do not use `xhigh` or Claude slugs.

The orchestrator must not use a Fast model variant or enable the FAST setting.
Do not select Fast model variants or enable FAST for delegated agents either.
Use tokens economically: give delegated agents only the context needed for
their step, and do not include full successful test logs or repeated background.

## Delegated agent output

For every delegated agent, explicitly state the expected reply format and
required fields. The agent must return the handoff required by its invoked
skill and nothing extra: no redundant modified-file list, test log, summary,
or other unsolicited output. Do not omit output required by the skill.

## What to pick

Read `docs/planning/BACKLOG.md`. List order is priority. Take the top row that
is not `DONE` and has no remote `work/<WORK-ID>` branch.

Before starting a backlog row, apply the predecessor start gate in
`.cursor/skills/planning-reference.md`. If a `Depends on` work ID in that
plan is not `DONE`, the row is not startable. Do not claim it, and do not
run preflight or implement. Skip that row, take the next backlog row, and
send one Slack bot line with the reason. Leave the skipped row on the
backlog. Do not pick it again in this run. This is not a human-needed stop.

One work item is one `work/<WORK-ID>` feature branch, claimed from `main`
before the first checkpoint of that item. Do not put a second
work item on that branch.

If this run already stopped an item because a human is needed, leave that row
on the backlog and do not pick it again in this run. Take the next not-`DONE`
row, still one at a time. When no such row remains, the run ends. Do not send
another Slack message for that.

## Checkpoint chain

For each checkpoint, the skill-index chain is:

1. `/w-implement-preflight`
2. `/w-implement`
3. `/w-implement-review`
4. Orchestrator `commit`. On review PASS, commit the PASS handoff message. On
   an automatic human-needed stop, commit a DRAFT stop message.

Run the first checkpoint's preflight on `main` before claim and checkout; do
not repeat it after checkout. Run later checkpoint preflights on the claimed
branch. Invoke preflight in this loop even though `planning-reference.md`
calls it recommended. Step 3 of the separate manual path in
`docs/deployment/RELEASE_FLOW.md` omits it.

`w-implement` and `w-implement-review` pick `feature.md` or `bug.md` from the
work ID. One invoke is one checkpoint; review the uncommitted tree. A fix round
stays on that tree, without a new checkpoint or commit.

Run this chain for every implementation checkpoint in plan order, then the
final API-bump checkpoint if present. Start the next checkpoint only after
the current checkpoint's PASS commit. Use a distinct commit `operation_id`
for each checkpoint and commit purpose, for example
`commit-FEATURE-7-cp2-pass` or `commit-FEATURE-7-cp2-post-suite-fix`.
Reuse an operation ID only when retrying that same commit operation.

Follow the invoked skill for its own plan and backlog edits. This loop does not
add any.

If the skill opens `w-walk`, wait for the user. That wait is not a review
round and not a Slack message.

## Findings handoff

`w-implement-preflight` NOT READY and `w-implement-review` CHANGES REQUESTED
or BLOCKED emit a short `RÖVIDEN NEKED` text followed by the JSON defined in
`.cursor/skills/references/checkpoint-findings.md`. Parse the JSON as the
detailed findings; do not use the brief or old plain-text blocks as a machine
payload. Validate its schema version, required fields, work ID, checkpoint,
source, verdict, and nonempty findings before routing. An invalid or mismatched
payload requires human attention; do not guess missing findings.

Predecessor start-gate NOT READY is not a plan-author or plan-review handoff.
Do not give that JSON to a plan skill, and do not keep it for the
human-needed plan report. After that `Depends on` work ID is `DONE`, the
user invokes `w-implement-preflight` again. Every other preflight NOT READY
JSON goes to the user for the matching, human-initiated plan-author or
plan-review skill. Do not invoke a plan skill in this loop. During checkpoint
review rounds, forward valid review CHANGES REQUESTED JSON verbatim to
`w-implement` on the same checkpoint and working tree. Preserve
`schema_version`, `work_id`, `checkpoint`, `source`,
`verdict`, and every `findings[]` entry with `id`, `problem`, `evidence`,
`action`, and `acceptance`. Do not summarize, rewrite, or drop fields. Keep
review BLOCKED JSON for the human-needed report. When the implementor
finishes a fix, continue the same `w-implement-review` agent session for that
checkpoint. Give it the previous findings JSON and the implementor's reply,
even if the session retains them. Ask it to check each previous
finding against the current repository, close those actually fixed, and not
repeat resolved points. Add a new finding only for a concrete issue that
blocks this checkpoint, with evidence. If that reviewer session cannot be
resumed, give the same inputs to the replacement reviewer.
The orchestrator counts review rounds itself; the findings JSON does not carry
or control the round number. READY and PASS keep their existing routing and
Git-action handoffs.

If user speaks directly to the implementor, update the
orchestrator's notes only; do not treat that exchange as an orchestrator reply
or a request for an extra review.

## Review rounds

During checkpoint review rounds, `CHANGES REQUESTED` goes back to
`w-implement` on the same tree.

A round is one implement plus the review of that tree. Run at most 3 automatic
rounds for that checkpoint. The next checkpoint starts its own 3 automatic
rounds. The user may request an extra review after the automatic rounds stop.

- PASS on round 1, 2, or 3: the orchestrator commits once, without `<DRAFT>`.
  After the commit, reread the canonical plan's work heading **Status:** before
  push, pull request, Slack done, or switching to `main`. If it is `DONE`, the
  item has passed. Otherwise stay on `work/<WORK-ID>` and start the next
  checkpoint's preflight. The current checkpoint's `api_bump` value does not
  determine whether the whole item has passed. If no next checkpoint exists
  while the heading is not `DONE`, stop for human attention.
- `CHANGES REQUESTED` on round 3: the orchestrator commits with a message that
  starts with `<DRAFT>`, sends a human-needed Slack message, and stops that
  item. Do not open a pull request for it. Start the next eligible backlog row
  on its own new feature branch from `main`.
- `BLOCKED`: do not send the item back to `w-implement`. The orchestrator
  commits with a message that starts with `<DRAFT>`, Slack the user that a human
  is needed, and stop that item.
- Preflight `NOT READY` for the predecessor start gate: do not implement. Do
  not give the JSON to a plan skill. After that `Depends on` work ID is
  `DONE`, the user invokes `w-implement-preflight` again. Skip that row as in
  What to pick. This is not a human-needed stop.
- Every other preflight `NOT READY`: do not implement, and do not run a plan
  skill. Before claim, send human-needed Slack without a commit. After claim,
  if there is work to commit, use a `<DRAFT>` stop message. Stop that item.

## After the item passes

When every checkpoint has a PASS commit on the `work/<WORK-ID>` branch, run
`cd /Users/wadkan/Projects/CAP && make test-all` in that CAP checkout, with
the claimed `work/<WORK-ID>` branch checked out. If port 8000 or 3000 has a
listening process, terminate that process, wait until the port is free, and
run the target without notifying the user. If the suite fails for another
reason, send its concise failure evidence to a `grok-4.7-medium` implementor
to fix only that failure on the same branch. Run `w-implement-review` exactly
once on the resulting change against the approved checkpoint. A CHANGES
REQUESTED or BLOCKED result ends this item; do not send the fix back to the
implementor or run another review. On PASS, commit the fix separately through
`git-action` using that PASS handoff and a new operation ID, then rerun the
same target from the CAP root. If the rerun fails, do not start another fix or
review. If a port cannot be freed, a decision is needed, the implementor
cannot fix the failure, the reviewer does not return PASS, or the rerun fails,
stop this item. Commit any uncommitted fix through the existing `<DRAFT>` stop
path (`review-blocked` for BLOCKED; `post-suite-failed` with round 1 CHANGES
REQUESTED or no-round NOT READY otherwise), send a human-needed Slack message,
and continue with the next eligible backlog row on its own branch. Do not push
or open a pull request for the stopped item. Once the suite passes, call
`push` for that branch and open a pull request. Slack the user that it is done,
and include the pull request link. Only then start the next eligible backlog
row on its own new feature branch from `main`.

Do not merge unless user asks. Do not resolve merge conflicts unless the user
asks later. The user reviews pull requests in a batch and separately requests
merge and conflict resolution.

## No release

The orchestrator must not start a release. Do not run:

- `w-release-ready-check`
- sandbox or production release
- `w-walk-unreleased`

They stay on the manual release path in `docs/deployment/RELEASE_FLOW.md`.

## Slack

All Slack reads and writes use the `w-flow-bot` identity through the
`w-flow-slack` MCP tool. Never use user's Slack account or the hosted Cursor
`Slack` MCP (user OAuth). Ignore the bot's own messages; they must not wake a
new response or loop.

Allowed bot messages:

- Start: when a new backlog work item has been claimed, send its work ID and
  `work/<WORK-ID>` branch.
- Done: only after its pull request is open; include the pull request link.
- Human needed: round 3 is still `CHANGES REQUESTED`, an extra review requested
  by user fails again, review is `BLOCKED`, the post-suite step fails, or
  preflight is `NOT READY` for a reason other than the predecessor start gate.
- Skipped predecessor: one line naming the backlog work ID, the `Depends on`
  work ID that is not `DONE`, and that the row was skipped.
- Human message acknowledgment: reply once to each human Slack message with
  receipt and the concrete next step. This acknowledgment is separate from
  any start, done, or human-needed event the work subsequently causes.

Do not Slack for a checkpoint PASS, a fix round, an orchestrator commit, or a
`w-walk` pause. Channel ID comes from the repository's `.cursor/mcp.json` /
`.cursor/secrets/slack.env`. Do not hardcode invite or token setup.

## Decision tree for each wake

1. **Slack message?** Ignore the bot's own messages. For a human message, reply
   once with receipt and the next step; read the request and update notes. A
   direct user message to an implementor only updates orchestrator notes.
2. **User requested an extra review or merge?** For an extra review, resume the
   stopped item's branch. On PASS, commit the reviewed checkpoint, then finish
   any remaining checkpoints. Open the PR and send done only after every
   checkpoint has a PASS commit. On failure, do not commit the extra review;
   send human-needed again and stop that item. Run another extra review only
   on a new user request. Merge only on explicit request.
3. **Active item?** Follow Checkpoint chain, Findings handoff, and Review
   rounds. Commit through `git-action` on PASS or an automatic human-needed
   stop; send human-needed on a stop. Never run a fourth automatic review round.
4. **Every checkpoint passed?** Follow After the item passes: push, open the
   PR, send done with its link, then choose the next row.
5. **No active item?** Switch to clean `main`, then follow What to pick and the
   Git action claim contract: preflight, claim, local `git switch` to the claimed
   branch, then send start and enter step 3 without repeating preflight. End
   silently if no eligible row remains. Process one work item at a time.
