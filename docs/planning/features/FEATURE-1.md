# FEATURE-1 — Add an offline Scriptable recording script viewer

**Status:** IN REVIEW

## Goal and measurable outcome

Read a GombaFlow recording script on an iPhone while filming, show one recordable
part at a time, filter and hide content globally, and retain recording progress
offline. Exchange scripts and checkmarks with this repository through explicit
files. A complete export/import/reimport round trip preserves true and false
states by topic and stable script ID, without modifying media or cut artifacts.

## Current repository evidence

Paths below are relative to the repository root. `FLOW` means
`local-workflows/script-and-cut-workflows/gombaFlow`; it is a documentation
abbreviation, not an existing environment variable.

- `FLOW/gomba-1-script-writer/templates/3-script-template.md` defines five tag
  types, unique positive integer `script-id` values, topic identity, spoken cues,
  chapter headings, and a separate handoff summary. No viewer exists yet.
- `FLOW/projects/2-unlimited-claude-code-for/3-script.md` contains 16 parts,
  chapter-level notes, nested Markdown code examples and XML-like fenced blocks.
  It already contains A/B/C `location` attributes. Use this exact file as the
  primary development sample for the parser, mobile reader and location filters,
  and for the corresponding automated and iPhone validation. Preserve its
  contents; do not generate a replacement script or hardcode this example.
- `FLOW/projects/registry.json` maps existing topics to project directories.
- `FLOW/gomba-2-cut/2-recording-index.md` derives the recording index from real
  media transcripts, script cues and assignments. `3c-resolve-review-timeline.md`
  consumes that index, the retake plan and media registry, and already supports
  appending new recordings. A viewer checkmark is not proof of available media.
- `Makefile` has a root `make test` aggregating Python workflow tests. Project
  rules require new tests in this aggregation. Node v24.15.0 is available in
  the inspected environment; no package.json or browser test setup exists.
- `docs/notes/app-script-megjelenites.md` is staged background. Its PWA,
  IndexedDB, dynamic place substitution and transition ideas are superseded or
  deferred by this chat's approved Scriptable MVP scope.
- The local feature template exists. `docs/deployment/RELEASE_NOTES.md` does
  not exist; this local-only feature requires no VPS release or notes creation.
- Platform references: [WebView](https://docs.scriptable.app/webview/),
  [FileManager](https://docs.scriptable.app/filemanager/),
  [DocumentPicker](https://docs.scriptable.app/documentpicker/), and
  [ShareSheet](https://docs.scriptable.app/sharesheet/). These support a local
  HTML view, host-side file access, file selection and user-controlled sharing.

## Agreed decisions

- Scriptable on iPhone; plain HTML/CSS/JavaScript, no framework, hosting,
  backend, PWA, database or runtime downloads. One generated installable script.
- Support the current GombaFlow MD format, not arbitrary Markdown/XML dialects.
  Invalid or duplicate IDs fail visibly before replacing valid stored data.
- Show one recordable part; swipe left/right selects the next/previous match
  in document order. Fixed top filters and fixed bottom controls stay reachable.
- Default status filter is not recorded. Marking a part recorded while in that
  filter immediately removes it after successful save and advances to the next
  matching part. No match preserves filters and shows an explicit empty state
  with a large action to select all recording statuses.
- Content-type dropdown contains visibility checkboxes. The full spoken cue is
  always visible next to the bottom ID because it must be read during filming;
  it is not a search field. No redundant raw agent attributes are read aloud.
- Bottom part dropdown includes narration-only search; no search in the top bar.
  Filters and type preferences persist globally across topics. Restore the
  last topic and part on restart.
- Store multiple scripts with their progress; list/open/delete locally. Confirm
  before deleting a topic's MD and checkmarks together. The repository is the
  long-term backup; local deletion does not delete repository files.
- Prepare location filtering now using optional `location="A"` on `agent-cue`;
  discover values from input. Missing/blank location is a selectable no-location
  category. Existing scripts without it remain supported.
- Repository state is a sibling `recording-state.json`. Reimport overwrites only
  supplied IDs, including false values, preserving omitted IDs. Repeated import
  is idempotent. Only checkmarks travel back, not videos.
- A phone import package contains MD plus saved checkmarks. Reimporting an
  existing topic offers keep-phone-progress (default) or restore-package-progress.
- Three ordered implementation checkpoints; no HTTP API or API version bump.

## MVP in scope

- [ ] Parse GombaFlow scripts dynamically and render the agreed mobile reader. - TODO
- [ ] Filter by chapter, clip type, location and recording status; hide content types globally. - TODO
- [ ] Provide a bottom searchable part picker and swipe navigation over matches. - TODO
- [ ] Save checkmarks, scripts, global preferences and last position locally offline. - TODO
- [ ] List, open and confirm deletion of stored topics. - TODO
- [ ] Build/import a combined script package and export/import checkmarks into the repository. - TODO
- [ ] Document installation, transfer, recovery and physical-iPhone acceptance steps. - TODO

## Explicitly out of scope

- Video transfer, transcription, Resolve operations, cut-flow schema changes,
  automatic retake decisions, or treating checkmarks as clip existence.
- Cloud synchronization, accounts, hosting, native App Store distribution,
  automatic Git writes, and direct phone-to-repository network access.
- Editing scripts on the phone, dynamic place-name substitution, GO/TRAVEL
  expansion, transition placement, arbitrary tag grammars and a Markdown editor.
- Automatic reconciliation of concurrent exports from multiple phones. Imports
  are explicitly user initiated; importing an older export can replace supplied
  states. No timestamp-based conflict resolver is introduced.

## Acceptance criteria

1. Both current project scripts load without hardcoded titles, counts or IDs.
   The staged example yields 16 unique recordable parts and its actual locations.
   Handoff summaries and recording-order notes do not become duplicate parts.
2. Positive unique IDs, topic, timeline, clip type and complete spoken cue are
   validated. Tag errors show the offending part. Inner code fences survive
   display; code and Markdown text cannot execute as HTML or host commands.
3. Chapter/clip/location/status selections combine with logical AND. Each
   dimension has an all option. Search is case-insensitive substring matching
   of decoded narration text only and further narrows the current matches.
4. Top controls remain visible while reading long content; bottom cue, ID,
   recorded checkbox and part picker remain reachable. Interactive targets are
   at least 44 CSS pixels high, body text at least 20 CSS pixels. Use Hungarian
   labels, plain high-contrast styling, no decorative animations. Honor iPhone
   safe areas, text zoom and keyboard without obscuring the picker results.
5. The type dropdown toggles all narration, screen-action and production-note
   blocks of that type. Initial visibility is all. Spoken cue remains mandatory
   bottom content. Chapter notes are associated with their descendant parts and
   governed by the same production-note checkbox; end-of-document handoff and
   review metadata are not mixed into recordable content.
6. Swipes navigate only matching parts, never wrap, and do not turn vertical
   scrolling or control interaction into accidental navigation. Bottom picker
   shows ID, chapter/title and narration preview; selecting a result changes
   the sole displayed part. Search remains at the bottom.
7. A confirmed recording change is saved before showing success/advancing.
   In not-recorded mode choose the next match in document order, falling back
   to the first remaining match when none follows. An empty result preserves
   filters, disables recording/navigation, and offers the agreed all-status action.
8. Relaunch offline restores locally saved scripts and checkmarks, global
   filters/type selections, bottom search query and last topic/part. If the
   remembered part is missing or excluded, choose the first match; if no matches,
   show the empty state. Global unavailable filter values stay explicit and
   yield no matches until changed; never silently reset them when switching topics.
9. Deleting one topic removes only its MD/progress, preserves global preferences
   and other topics, clears an invalid last-topic pointer and returns to the list.
   Cancelling import, replacement, sharing or deletion leaves saved data intact.
10. Phone package import validates identity and states before replacement.
    Keep-phone-progress retains states for shared IDs; package values initialize
    new IDs. Restore-package-progress uses package states (unspecified current
    IDs default false). Removed IDs are not attached to another part or reused.
11. Phone exports contain explicit boolean states for all current parts, including
    unchecked ones. Repository import rejects unknown topic/IDs, malformed data
    and unsupported versions without partial writes; supplied valid IDs update
    atomically and omitted IDs retain existing values. Original MD is untouched.
12. Package a topic with repository progress, check/uncheck offline, export,
    import twice, then build and restore a new package: the same states survive.
    No media, recording index, retake plan or Resolve artifact changes.

## Architecture and state ownership

### File layout and runtime

Create `apps/script-viewer/` at the repository root, separate from the workflow
skills. Scripts and their `recording-state.json` files remain under
`FLOW/projects/<project_dir>/`. The app shares the repository with the script
writer, cut flow and n8n tooling.

App files:

- `core.js`: shared pure parser, schema validation, filter/navigation and state
  merge rules, usable in Node and embedded browser JavaScript.
- `viewer.html`: markup, inline CSS and browser controller; no fetched assets.
- `ScriptViewer.js`: Scriptable host adapter, file picker, local storage and
  WebView message handling.
- `tools/build.mjs`: deterministic concatenation/embedding of those sources into
  one `GombaFlowViewer.js` at a caller-supplied output path. No transpiler.
- `tools/exchange.mjs`: Node package/import CLI using the same core validators.
- `README.md`: exact installation, commands, contracts and iPhone checklist.
- `package.json` plus lockfile: browser test dependency only (`@playwright/test`);
  runtime/build/CLI use Node built-ins and have no installed runtime dependencies.
- `tests/core.test.cjs`, `tests/host.test.cjs`, `tests/exchange.test.cjs`, and
  `tests/viewer.spec.cjs`; Playwright config runs Chromium with mobile-sized viewport.

Author sources in the repository; generated install scripts and transfer files
are not committed. Use `/tmp` for local generated examples, test output and
scratch data. The persisted repository state file is intentional project data.
Scriptable itself receives a user-installed generated file, not a runtime build.

### Parser and location metadata

Read topic and magic word from the header, then parse only the `Script nézői
sorrendben` section. Use heading hierarchy to associate chapter context and
recordable parts; split on actual agent-cue blocks, not code-fence length. Handle
existing three/four-backtick blocks and inner fenced examples. Extract the
supported paired tags and attributes using a bounded format parser rather than
requiring the entire MD to be valid XML. Decode XML entities once for display
and search. Preserve inner text/code; do not execute Markdown HTML.

Validate `script-id` against positive integers, unique within topic; verify cue
identity against the part, topic prefix and header magic word. Preserve document
order, never sort by ID. Require the script's single shared timeline. Read
`location` as optional scalar text; accept arbitrary nonempty location values.
Unknown/unbalanced structural tags fail rather than silently dropping content.
Update the central template's metadata instructions to allow optional location;
do not require changing old scripts or modifying the user's staged examples.

### Interchange contracts, version 1

Define these as new local file contracts, not changes to the cut API:

- Repository `FLOW/projects/<project_dir>/recording-state.json` and phone state
  export: `schema_version: 1`, `topic_id: string`, `recorded: object`. `recorded`
  maps canonical decimal script-ID strings to strict booleans, e.g. `{"1":true}`.
- Import package: `schema_version: 1`, `topic_id`, `script_md` (complete raw MD),
  `state` (the state object above). Topic fields and MD identity must agree.
- Missing repository state means all false. Package/export state lists every
  current part explicitly. State import may be partial. Reject duplicate JSON
  keys, unknown fields, noncanonical IDs and nonboolean values on both sides.
- Derive project location through existing registry topic/project_dir mapping;
  never trust paths supplied by imported JSON. Require an existing project and
  `3-script.md`, unique topic mapping and path containment under `FLOW/projects`.
- No content hash gate: progress follows agreed stable IDs across script edits.
  Reject incoming IDs absent from current MD; preserve omitted existing states.
  When packaging, reject stale repository IDs until the user resolves them;
  never guess how renamed/reused IDs map. Document stable-ID responsibility.

### Host bridge and local state

Scriptable owns durable storage in `FileManager.local().documentsDirectory()`;
WebView state is a projection, not the durable owner. Store one versioned library
snapshot containing topic-to-raw-MD/state records, global preferences and last
position. A single serialized host command queue handles import, save, selection,
filter updates and delete; never derive file paths from topic strings.

Use WebView.evaluateJavaScript with callback completion to drain a browser-side
command queue while the view is presented. Commands have unique request IDs;
allow only explicit actions. Host replies carry success/failure and committed
state. Cancel the loop on dismissal; do not rely on URL interception for saves.
Controls show pending state and avoid duplicate changes until acknowledgement.
Save changes immediately, including filters and cursor, not only at dismissal.

Validate next snapshot, write a sibling pending file, read/validate it, preserve
the previous good snapshot as backup, then replace and verify the active file.
Report saved only after success. Recover interrupted replacement from a valid
pending/backup snapshot deterministically; never silently reset corrupt progress.
A failed save keeps the old confirmed UI/state and gives a retryable visible
error. Document that abrupt termination before a save acknowledgement may lose
that pending action. Keep all active data local, outside cache/iCloud-only paths.

## Security, privacy, failure, and operational handling

- Render script content as text with safe DOM APIs; do not inject imported HTML,
  execute links, fetch embedded URLs or let script text invoke the host bridge.
  Safely encode embedded JSON and script-end sequences in the generated viewer.
- Validate file schemas and complete replacement before mutation. Reject corrupt
  imports; cancellation is normal. Opening an un-downloaded iCloud document may
  need a network connection once; imported local copies work offline afterward.
- One host command writer; one repository import process per project. Use an
  exclusive lock plus same-directory temporary file and rename for repository
  writes; on lock contention report busy rather than merge concurrently.
- Preserve backup on phone and never erase corrupt library data automatically.
  Keep delete confirmation explicit that unexported progress will be lost.
- Explicit repository import is the backup action. Sharing success is not proof
  the Mac imported it. Repository writes do not stage, commit or push anything.
- Report readable operation/topic/part errors; no cloud logging or telemetry.

## Ordered TDD implementation tasks

### Step 0 — Clickable mobile dummy (start of checkpoint 1)

- [ ] Before implementing the parser, storage or exchange, create a lightweight clickable HTML/CSS/JavaScript mobile dummy using representative content from `FLOW/projects/2-unlimited-claude-code-for/3-script.md`, including its location attributes. - TODO
- [ ] Demonstrate the fixed top filters, content-type dropdown with checkboxes, one-part view, swipe navigation, bottom narration-searchable part picker, spoken cue beside the ID, large recorded checkbox, automatic advance and empty state. Include the script list and delete confirmation. Use in-memory sample state only; make its nonpersistent nature explicit. - TODO
- [ ] Make the dummy available for user review and incorporate feedback before implementing the functional reader. Keep it within checkpoint 1, not a separate commit checkpoint. Reuse its agreed layout in the real viewer rather than maintaining a second UI. - TODO

### Reader tasks (checkpoint 1)

- [ ] Add failing Node behavior tests in `tests/core.test.cjs` for both real scripts, nested code fences, chapter notes, location/no-location, cue validation, duplicate IDs, filter intersections, narration-only search, hidden types and navigation boundaries. - TODO
- [ ] Implement the smallest shared core and mobile view; include a simple MD file-open action in the Scriptable host so this checkpoint is independently usable. Build to `/tmp/GombaFlowViewer.js`; checkmarks are session-only until checkpoint 2. - TODO
- [ ] Add Playwright complete-flow test `filter and read a recording script` in `tests/viewer.spec.cjs`: load a fixture through a fake host, choose filters and types, search from the bottom, swipe/select parts, and assert visible content and pinned controls. Include hostile text and inner-code rendering. No existing browser spec covers this flow. - TODO
- [ ] Add `make test-scriptable-viewer` and include it in root `make test`; add scoped npm scripts and lockfile for test tooling only. Update template for optional location and document install/session-only behavior. Refactor with tests green. - TODO

### Offline library tasks (checkpoint 2)

- [ ] Add failing `tests/host.test.cjs` tests with injected fake FileManager/WebView for immediate save acknowledgements, queued actions, save failure, interrupted replacement, recovery, library listing/delete, global preferences and cursor restore. - TODO
- [ ] Implement the host queue/local snapshot owner and connect recording changes, filters, search, cursor and topic management. Restore default not-recorded only for a fresh library; preserve later user choices. - TODO
- [ ] Extend browser flow `record parts and resume the offline library`: import two scripts, mark/unmark, auto-advance/empty state, switch/relaunch with same persisted host snapshot, confirm/cancel deletion and simulate failed save. Browser test proves UI integration with the fake host; it does not claim to prove iOS storage. - TODO
- [ ] Run targeted tests and physical-iPhone offline/save/restart checks below; document actual evidence. Refactor only with tests green. - TODO

### Exchange tasks (checkpoint 3)

- [ ] Add failing `tests/exchange.test.cjs` tests using disposable filesystem fixtures: MD+state package, true/false/partial merges, identical repeat import, unknown topic/ID, duplicate keys, invalid versions, path containment, lock contention and failed replacement. - TODO
- [ ] Implement package and import-state CLI using shared validators; add host package import, keep/restore choice and file sharing/export through native APIs. Keep direct MD import for first use. - TODO
- [ ] Add complete flow `round trip progress through repository packages`: build package from fixture project, import into viewer, change progress, export, run repository import twice, rebuild and restore; also assert another topic and omitted IDs survive. - TODO
- [ ] Finish README transfer/recovery guidance and real-device end-to-end checks. Validate all checkpoints through root test aggregation. - TODO

## Automated validation

Current existing aggregate is `make test`. No tests run during plan authoring.
New targets below are to be created in checkpoint 1, not claimed to exist today.
Use Node 24+ for development and the exchange CLI.

- Setup test tooling: `npm ci --prefix apps/script-viewer`.
- Install test browser: `npm --prefix apps/script-viewer exec -- playwright install chromium`.
- Each checkpoint: `make test-scriptable-viewer` (Node behavior/host/CLI tests then
  scoped Playwright tests, line reporter). Add later test files as their checkpoints land.
- Browser only: `npm --prefix apps/script-viewer run test:e2e -- --reporter=line`.
- Before each successful implementation handoff: `make test`. Do not add nonexistent
  generic frontend/backend targets. Existing root dependencies must be available;
  report environmental blockers truthfully rather than recording a false PASS.
- Build/CLI smoke coverage belongs in the test target, writes to `/tmp`, and checks
  generated JavaScript syntax, embedded input safety and absence of runtime fetches.
  Fake-host tests cannot replace physical Scriptable validation.

## Manual validation

Only device-specific behavior requires manual validation. Record iPhone/iOS and
Scriptable versions plus PASS/FAIL at the relevant checkpoint; do not assume all
SDK behavior from Node tests. Host/device failure blocks a successful handoff.

1. Checkpoint 1: run `node apps/script-viewer/tools/build.mjs --output /tmp/GombaFlowViewer.js`.
   Transfer/install that script in Scriptable; copy the current sample MD to
   Files, open it, and test long-part vertical scrolling, fixed bars, bottom
   picker keyboard/search, horizontal swipe and type dropdown on the iPhone.
   Confirm the spoken cue remains readable around the ID and controls are large.
2. Checkpoint 2: run the same build command and install the updated viewer without
   deleting its local library. Import two scripts, change filters/checkmarks,
   wait for saved acknowledgement, enable airplane mode, force-close/relaunch,
   and verify library/progress/last position and global preferences. Test delete
   confirmation, empty-state action, and a repeated rapid toggle. Ensure controls
   do not claim saved while a write is pending. This is a blocking device gate.
3. Checkpoint 3: run
   `node apps/script-viewer/tools/exchange.mjs package --topic 2-unlimited-claude-code-for --output /tmp/gombaflow-script.json`.
   Import it on phone, mark and unmark parts offline, export using Files or the
   share sheet, and transfer that JSON to `/tmp/gombaflow-progress.json` on Mac.
   Run `node apps/script-viewer/tools/exchange.mjs import-state --input /tmp/gombaflow-progress.json` twice.
   Inspect the topic's `recording-state.json`, rebuild the package with the same
   command, and verify both keep-phone and restore-package choices. Confirm the
   cut flow's files and script remain untouched. Restore any manual test progress
   intentionally; do not use Git staging/commit commands as test cleanup.

## Rollout and rollback

Install a generated viewer once through the user's local file transfer, then
import MD or a package. No server deploy. The repository and returned JSON are
long-term backup; offline phone storage is working state. Export/import before
phone deletion or replacing the app. Keep the previous generated viewer until
its successor passes the device gate. Local schema stays version 1 throughout
these checkpoints; unsupported snapshots fail without writes. Roll back viewer
code by reinstalling the prior compatible script, preserving local data. Recover
from the latest validated snapshot or a repository-built package. Repo import
rollback restores the previous state file from normal repository history; the
feature performs no Git writes.

## Checkpoints

No API bump: implementation checkpoints only. Dependencies: checkpoint 2 follows
checkpoint 1; checkpoint 3 follows checkpoint 2. Each is a separate review/commit
boundary. For each checkpoint invoke `w-implement-preflight` (recommended), then
`w-implement`, then `w-implement-review`; the user commits after review PASS,
following `.cursor/skills/planning-reference.md`.

### Checkpoint 1 — Add the Scriptable script reader and filters

Status: TODO

Scope: step 0 clickable mobile dummy and user review first, then reader/parser,
location metadata, pinned mobile controls and navigation,
MD opening, installable build, test harness and root test wiring. No durable
progress claim until checkpoint 2. Validation: new targeted aggregate, root
`make test`, and manual device step 1.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Add the Scriptable script reader and filters
```

### Unreleased

Unreleased: none — local Scriptable tooling; no VPS work or release-note file creation.

### Checkpoint 2 — Persist offline scripts and recording progress

Status: TODO

Scope: acknowledged durable saves, multi-topic library/delete, global preferences,
cursor restoration, recorded navigation and recovery. Validation: targeted
aggregate, root `make test`, and blocking manual device step 2.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Persist offline scripts and recording progress
```

### Unreleased

Unreleased: none — all state and device checks are local; no VPS work.

### Checkpoint 3 — Exchange recording state with the repository

Status: TODO

Scope: versioned exchange files, package CLI, repeatable state import CLI, phone
import/export and replacement choices, operator documentation. Validation:
targeted aggregate, root `make test`, and manual device step 3.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Exchange recording state with the repository
```

### Unreleased

Unreleased: none — explicit local file transfers only; no VPS work.
