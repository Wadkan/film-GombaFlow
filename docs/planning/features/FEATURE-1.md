# FEATURE-1 — Add an offline Scriptable recording script viewer

**Status:** IN PROGRESS

## Goal and measurable outcome

Read a GombaFlow recording script on an iPhone while filming, show one recordable
part at a time, filter and hide content globally, and retain recording progress
offline. The immediate priority is one-tap launch from the iPhone Home Screen
into the last opened script at the last saved part, without selecting the MD
again and without hosting or a network connection. Exchange scripts and
checkmarks with this repository through explicit files in later checkpoints. A complete export/import/reimport round trip preserves true and false
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
- `FLOW/projects/1-postgresql-hybrid-search-course/3-script.md` is a legacy
  untagged script without agent-cue blocks, stable part IDs, magic word or
  timeline metadata. It is an explicit rejection sample, not supported input.
  Do not migrate or modify it as part of this feature.
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
- Home Screen launch and automatic resume are the checkpoint 3 priorities.
  Use an iOS Shortcut that opens the installed viewer through Scriptable's
  local run URL (`scriptable:///run/GombaFlowViewer`), added to the Home Screen.
  It must run the viewer in Scriptable, where fullscreen WebView is available.
  Document this single installation route; no custom launcher or widget.
  References: [Scriptable URL schemes](https://docs.scriptable.app/urlscheme/)
  and [Apple Home Screen shortcuts](https://support.apple.com/guide/shortcuts/add-a-shortcut-to-the-home-screen-apd735880972/ios).
  The current Home Screen failure is user-reported; its exact cause is unverified
  and the corrected route requires a real-device check.
- Support the current tagged GombaFlow MD format only, not the legacy untagged
  script or arbitrary Markdown/XML dialects.
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
- Remember a local copy of the last opened MD and open it by default on the
  next launch at its last saved part. While reading any MD, keep a visible
  `Másik MD megnyitása…` button available. It opens the file picker without
  restarting the viewer. A successfully validated and saved selection becomes
  the default MD for the next launch; cancellation or invalid input preserves
  the current MD and saved position.
- Require a nonempty `location` attribute on every recordable part, matching
  the current tagged sample. Discover arbitrary location values from input;
  missing or blank locations reject the script. No no-location category is
  needed.
- Repository state is a sibling `recording-state.json`. Reimport overwrites only
  supplied IDs, including false values, preserving omitted IDs. Repeated import
  is idempotent. Only checkmarks travel back, not videos.
- A phone import package contains MD plus saved checkmarks. Reimporting an
  existing topic offers keep-phone-progress (default) or restore-package-progress.
- Five focused implementation checkpoints after the step 0 dummy review:
  parser/build, functional reader, offline library, repository CLI, phone exchange.
  No HTTP API or API version bump.

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
- Migrating legacy untagged scripts or inferring their missing IDs/cues.
- Editing scripts on the phone, dynamic place-name substitution, GO/TRAVEL
  expansion, transition placement, arbitrary tag grammars and a Markdown editor.
- Automatic reconciliation of concurrent exports from multiple phones. Imports
  are explicitly user initiated; importing an older export can replace supplied
  states. No timestamp-based conflict resolver is introduced.

## Acceptance criteria

1. The current tagged `2-unlimited-claude-code-for/3-script.md` loads without
   hardcoded titles, counts or IDs and yields 16 unique parts and its actual
   locations. The legacy `1-postgresql-hybrid-search-course/3-script.md` is
   explicitly rejected with missing-format/metadata errors and no saved-data
   changes. A separate valid tagged second-topic fixture proves dynamic and
   multi-topic behavior. Handoff summaries and recording-order notes do not
   become duplicate parts. Neither original project script is modified.
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
8. Tapping the Home Screen shortcut launches the installed viewer in Scriptable
   and opens the last saved topic/part directly, including after force-close
   in airplane mode. Do not show a file picker on each launch: select an MD
   only on first use or through an explicit open action. Restoration means the
   same recordable part, not the exact scroll offset. The visible
   `Másik MD megnyitása…` button works while an MD is already open. Selecting
   another valid MD opens it and makes it the next launch's default; cancelling
   or selecting invalid input keeps the current MD and position intact.
   Relaunch offline restores
   locally saved scripts and checkmarks, global
   filters/type selections, bottom search query and last topic/part. If the
   remembered part is missing or excluded, display the first match without
   erasing the remembered part ID; if no matches, show the empty state. Global unavailable filter values stay explicit and
   yield no matches until changed; never silently reset them when switching topics.
9. Deleting one topic removes only its MD/progress, preserves global preferences
   and other topics, clears an invalid last-topic pointer and returns to the list, or displays
   `Nincs mentett script` if none remain. The next launch shows that same
   list/empty view until another MD is opened.
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
- `tests/core.test.cjs`, `tests/build.test.cjs`, `tests/host.test.cjs`,
  `tests/exchange.test.cjs`, and `tests/viewer.spec.cjs`; Playwright config runs
  Chromium with mobile-sized viewport, introduced only in checkpoint 2.
- `tests/fixtures/999-viewer-fixture.md`: a small valid tagged second topic with
  matching header/cues, distinct part IDs and distinct nonempty locations.
  Multi-topic tests use this fixture alongside the real tagged sample; they
  never pretend the legacy script is supported. Filesystem tests construct a
  disposable matching registry/project tree under `/tmp` without editing the
  production registry or project scripts.

Author sources in the repository. User-approved review decision (2026-11-16):
keep generated install scripts and transfer files in
`apps/script-viewer/output/` and version them in Git; do not ignore this directory.
Use `/tmp` for test output and scratch data. The persisted repository state file is intentional project data.
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
Require `location` as a nonempty scalar on every recordable part; accept
arbitrary location values. Reject missing or blank values.
Unknown/unbalanced structural tags fail rather than silently dropping content.
Update the central template and examples to require location; do not modify
either original project script.

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

### Save and restore the MD and reading progress locally

Scriptable keeps local MD files separate from one `viewer-state.json` in
`FileManager.local().documentsDirectory()`. The installed program supplies the
parser, reader and local file handling; MD content is not embedded in its code.
Keep one app-owned MD copy per topic under an internal generated filename;
never construct a path from imported topic text. The state file owns
`schema_version: 1`, a `topics` map (internal MD filename, recorded booleans by
stable part ID, and `last_part_id`), global filters/type preferences/search,
and `last_topic_id`. Store part IDs as canonical decimal strings and state
values as strict booleans; validate references and parse MD before displaying it.

On startup, read the latest saved state and open its last MD/part from the local
copy without selecting the original file again. If no last topic is selected,
show the stored-script list, or `Nincs mentett script` when it is empty. Keep
`Másik MD megnyitása…` available in both the reader and list/empty view.

Opening an updated MD for the same topic preserves all saved checkmarks and
its last part ID. New IDs start unchecked. Retain state for absent IDs without
attaching it to another part. If the remembered ID is absent or excluded by
filters, display the first match (or the empty result) without overwriting that
remembered ID merely because of the fallback. An explicit user selection or
navigation saves the newly displayed part. Opening a different stored topic
restores that topic's remembered part. Successful MD selection makes that topic
the default on next launch. Cancellation, invalid MD and failed saves leave the
previous confirmed reader and saved selection intact.

Use one serialized connection between the reader and Scriptable for opening,
saving and deleting files. `WebView.evaluateJavaScript` with callback completion
carries explicitly allowed commands and their acknowledgements while the view
is presented. Stop processing when dismissed. No generic command framework,
extra preference store or package format is needed. Disable duplicate changes
while saving; show success/advance only after acknowledgement. Save checkmarks,
filters and current part immediately rather than only when closing.

Validate before writing and report saved only after the write succeeds.
Use a short-lived sibling temporary file and replacement to avoid writing
partial JSON directly over the current state; do not retain backup files or
build a recovery/version-history system. On startup use the latest readable,
valid saved state. Reject an invalid incoming MD before replacing a valid local
copy. A save failure keeps the last confirmed state and shows a retryable error.
If the saved state itself is unreadable or malformed, report it without clearing
or overwriting it: without a separate backup, lost values cannot be reconstructed.
Document that an action terminated before acknowledgement may not persist.
Keep local data outside cache and iCloud-only paths.

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
- Do not retain additional phone backups; never erase corrupt saved state automatically.
  Keep delete confirmation explicit that unexported progress will be lost.
- Explicit repository import is the backup action. Sharing success is not proof
  the Mac imported it. Repository writes do not stage, commit or push anything.
- Report readable operation/topic/part errors; no cloud logging or telemetry.

## Ordered TDD implementation tasks

Paths in these tasks are relative to `apps/script-viewer/` unless stated
otherwise. Every functional checkpoint follows failing tests, implementation,
refactor with tests green, then validation. The explicitly requested step 0
prototype review comes first; its sample interactions are not production logic.

### Step 0 — Clickable mobile dummy (first activity in checkpoint 1)

- [ ] Before implementing the parser, storage or exchange, create a lightweight clickable HTML/CSS/JavaScript mobile dummy using representative content from `FLOW/projects/2-unlimited-claude-code-for/3-script.md`, including its location attributes. - DONE
- [ ] Demonstrate fixed top filters, type dropdown checkboxes, one-part view, swipe navigation, bottom narration-searchable part picker, spoken cue beside ID, large recorded checkbox, advance/empty state, script list and delete confirmation. Explicitly mark sample state as nonpersistent. - DONE
- [ ] Present the dummy for user review and incorporate feedback before functional implementation. Retain it within checkpoint 1 without a separate commit checkpoint. Reuse the agreed markup/layout for the reader in checkpoint 2; no production parser, host or persistence is needed for dummy review. - DONE

### Parser and build tasks (checkpoint 1)

- [x] Test first: add the valid tagged `tests/fixtures/999-viewer-fixture.md` as test setup, then failing Node behavior tests in `tests/core.test.cjs` using it and the real tagged sample. Cover nested code fences, chapter notes, required nonempty locations, cue/ID validation, explicit rejection of the untouched legacy script, filter intersections, narration-only search and navigation boundaries. Add failing `tests/build.test.cjs` for deterministic embedding, executable-text escaping and generated JavaScript syntax. Run `node --test apps/script-viewer/tests/core.test.cjs apps/script-viewer/tests/build.test.cjs` from the repo root and observe relevant failures before production implementation. - DONE
- [x] Implement pure `core.js` and `tools/build.mjs` against the prepared fixture. Embed the reviewed HTML and pure core into a standalone script artifact with only a minimal host shell; no functional native file picker, mobile controller or durable saves in this checkpoint. Update template instructions for required location, without changing either original script. - DONE
- [x] Add the Node-only package test script and root `make test-scriptable-viewer` target, included by existing root `make test`. Create only the tests needed now; do not add empty browser/host suites or skip placeholders for future checkpoints. - DONE
- [x] Require nonempty locations: add a valid fixture location for every part and a failing test for missing/blank attributes before changing the parser. Then validate with the focused parser/build tests and `make test-scriptable-viewer`; do not run the full root suite. - DONE
- [x] Enforce required nonempty locations in `core.js`, update the central template, and retain the arbitrary-value location filter. Refactor with focused tests green; run the targeted Node tests, `make test-scriptable-viewer`, and standalone build syntax check. Document the build command and artifact's prototype-only limitations. - DONE

### Functional mobile reader tasks (checkpoint 2)

- [x] Review finding 1: reset the visible part to the top on navigation, picker selection and recording auto-advance; extend the existing reader E2E flow with long-part scrolling checks. - DONE

- [x] Test first: introduce the scoped Playwright dev dependency/lockfile and `test:e2e` script. Add failing complete-flow test `filter and read a recording script` in `apps/script-viewer/tests/viewer.spec.cjs`: open the real tagged sample through a fake host, choose chapter/clip/location/status filters and type checkboxes, search only narration from the bottom, swipe/select matching parts, and verify pinned controls, safe inner-code rendering and the mandatory spoken cue. No existing browser spec covers this flow. Exact command: `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "filter and read a recording script"`. Observe behavioral failure before implementing the reader controller. - DONE
- [x] Test first: add failing `tests/host.test.cjs` coverage for the minimal host/file-open bridge, invalid legacy input, cancellation and host dismissal. Run `node --test apps/script-viewer/tests/host.test.cjs` from the repo root before implementing host integration. - DONE
- [x] Implement the functional mobile reader from the reviewed dummy using the checkpoint 1 core. Add native Scriptable MD selection and validation before reader presentation, with session-only checkmarks/preferences; the user-approved simplification removes the live command bridge. Recording toggles/advance work in session but must not claim durable save. Reuse the real parser in browser tests; fake only native host APIs. - DONE
- [x] Extend `make test-scriptable-viewer` to include the browser script and host tests. Refactor with tests green; run the scoped browser command and aggregate target, then physical-iPhone reader check below. Document that offline restart persistence arrives in checkpoint 3. - DONE

### Offline library tasks (checkpoint 3)

- [ ] Test first: extend `tests/host.test.cjs` with failing behavioral tests for acknowledged durable saves, queued actions, failed writes, readable/invalid saved state, deletion, global preferences and last cursor. Update existing build/host/browser tests that assume mandatory selection on every launch or prohibit reader-to-Scriptable communication: tests must follow the checkpoint 3 requirements while retaining first-use selection, cancellation and fullscreen coverage. Exact command: `node --test apps/script-viewer/tests/host.test.cjs`. - TODO
- [ ] Test first: extend `apps/script-viewer/tests/viewer.spec.cjs` with complete flow `record parts and resume the offline library`: import the real tagged sample and the valid second-topic fixture, mark/unmark, advance/empty state, switch/relaunch with the same persisted fake-host MD files and state file and restore the last topic/part without calling the picker, reopen an updated MD for the same topic without losing checkmarks/last part, cancel switching without losing the current MD, confirm/cancel delete through list/empty states, and simulate save failure. Exact command: `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "record parts and resume the offline library"`. Observe persistence/acknowledgement failures before implementing durable storage. - TODO
- [ ] Implement the single-writer local MD/state file storage and save acknowledgements; connect existing session reader actions to durable scripts/checkmarks/preferences/cursor. Apply default not-recorded only to a fresh library. Reuse the existing reader; add only the minimum host bridge needed for acknowledged local saves. At launch load the last saved topic/part before presenting the reader, with no repeated MD selection. Document one Home Screen shortcut using the local Scriptable run URL. Do not add exchange capabilities here. - TODO
- [ ] Refactor with tests green; run the scoped browser command and aggregate target, then blocking physical-iPhone Home Screen launch and airplane-mode/restart checks. Browser fake storage does not prove iOS file persistence; record actual device evidence. - TODO

### Repository exchange CLI tasks (checkpoint 4)

- [ ] Test first: add failing filesystem integration tests in `tests/exchange.test.cjs` using disposable tagged fixture projects/registry under `/tmp`. Cover MD+state packaging, true/false/partial merges, repeat import, unknown topic/ID, legacy-script rejection, duplicate keys, invalid versions, path containment, lock contention and failed replacement. Exact command: `node --test apps/script-viewer/tests/exchange.test.cjs`. No browser test is needed for this CLI-only checkpoint. - TODO
- [ ] Implement version 1 file validators/merge rules in the shared core and `tools/exchange.mjs` package/import-state commands. Keep repository transactions separate from phone UI. Add fixture-based round-trip integration: package, simulated progress export, import twice, repackage and compare; preserve omitted IDs and another topic. - TODO
- [ ] Wire exchange tests into the aggregate, refactor with tests green, then run the targeted Node command and `make test-scriptable-viewer`. Document CLI usage and contract; confirm no native phone exchange or cut-artifact writes are introduced. - TODO

### Phone exchange integration tasks (checkpoint 5)

- [ ] Test first: extend `tests/host.test.cjs` with failing native-adapter tests for package file selection, identity validation, keep/restore/default choice, cancellation, share/export and failed file operations. Exact command: `node --test apps/script-viewer/tests/host.test.cjs`. - TODO
- [ ] Test first: extend `apps/script-viewer/tests/viewer.spec.cjs` with complete flow `round trip progress through repository packages`: call the checkpoint 4 CLI on a disposable fixture project, import its package, change checkmarks, export through the fake native adapter, import twice with the real CLI, rebuild and restore. Assert replacement choices, another topic, false values and omitted-ID preservation. Exact command: `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "round trip progress through repository packages"`. Observe missing UI/adapter behavior before production integration. - TODO
- [ ] Implement package import and native export/sharing using the existing schemas/CLI, retaining direct MD opening. Reuse acknowledged storage and its failure handling. No new CLI transaction or media processing in this checkpoint. - TODO
- [ ] Refactor with tests green; run the scoped browser command and aggregate target. Finish README transfer/recovery guidance and execute the physical-iPhone package round trip below. - TODO

## Automated validation

Current existing aggregate is `make test`. No runtime tests run during plan
authoring. New targets/scripts below are implementation deliverables, not
claimed to exist today. Use Node 24+ for development and the exchange CLI.

- Checkpoint 1 introduces `make test-scriptable-viewer`, running only available
  Node core/build tests. Root `make test` includes it immediately, but checkpoint
  validation runs only the focused viewer target and its exact test command.
- Checkpoint 2 adds browser tooling: `npm ci --prefix apps/script-viewer`, then
  `npm --prefix apps/script-viewer exec -- playwright install chromium`.
  Add `test:e2e` to the scoped package; the aggregate now runs existing Node
  tests and scoped Playwright tests with line reporter. No browser dependency
  is required to validate checkpoint 1.
- Add host and exchange test files to the aggregate at their stated boundaries;
  every checkpoint leaves all introduced tests green. No pending future tests
  are committed as failures or marked skipped to make a checkpoint pass.
- Browser only from checkpoint 2:
  `npm --prefix apps/script-viewer run test:e2e -- --reporter=line`.
  Exact targeted commands and titles appear before implementation in each task.
- Before each successful implementation handoff, run the checkpoint's focused
  commands and `make test-scriptable-viewer`. Do not run the full root `make test`
  for this feature. Do not add nonexistent generic frontend/backend targets.
  Report environmental blockers truthfully instead of recording a false PASS.
- Build smoke coverage checks deterministic output, generated JavaScript syntax
  and safe embedding; it writes artifacts under `/tmp`. Production runtime has
  no fetched assets/dependencies. Fake-host tests cannot replace iPhone checks.

## Manual validation

Only prototype review and actual device behavior need manual validation. Record
PASS/FAIL and iPhone/iOS/Scriptable versions at the applicable checkpoint. Device
failures block a successful handoff; Node/browser tests cannot establish native
storage, keyboard or sharing behavior.

0. Step 0, before functional work: put the dummy in `apps/script-viewer/viewer.html`,
   run `python3 -m http.server 8765 --directory apps/script-viewer`, and open
   `http://localhost:8765/viewer.html` for user review. This is a disposable local
   preview, not hosting required for the installed app. Record feedback before
   proceeding with functional code. Native integration is not required here.
   PASS — The user accepted the clickable dummy.
1. Checkpoint 1: no physical-device gate for the parser/build result; automated
   Node behavioral and build checks apply after the mandatory step 0 review.
2. Checkpoint 2: run `make scriptable-viewer`.
   Transfer/install in Scriptable; start the program and select the current tagged sample in the native Files picker before the reader opens. Confirm fullscreen presentation.
   Check long-part scrolling, pinned bars, keyboard/search in the bottom picker,
   swipe versus vertical scroll, location/type filters, readable spoken cue and
   large controls. Open the legacy script to confirm a readable rejection and
   unchanged session content. No persistence claim at this checkpoint.
   PASS — The user reported completing the iPhone check and requested review closure; device/software versions were not provided.
3. Checkpoint 3: run `make scriptable-viewer` and update the installed
   `GombaFlowViewer` in Scriptable without deleting local data. Create an iOS
   Shortcut with URL `scriptable:///run/GombaFlowViewer` followed by Open URLs,
   and add it to the Home Screen. Tap that icon to launch the fullscreen reader.
   Open the tagged sample once, select a later part and wait for saved
   acknowledgement. Enable airplane mode, force-close Scriptable and relaunch
   from that icon: the same script/part must open without a file picker. Record
   PASS/FAIL and iPhone/iOS/Scriptable versions; this is the primary blocking check.
   Then open `apps/script-viewer/tests/fixtures/999-viewer-fixture.md`, change
   filters/checkmarks and repeat the restart to verify both topics, global
   preferences and last position. Exercise rapid toggle, empty state and
   delete confirmation. With an MD open, tap `Másik MD megnyitása…`, cancel
   once to verify the current MD/part stays open, then select the other MD.
   After saved acknowledgement, relaunch from the Home Screen and verify the
   newly selected MD is now the default. Browser tests cannot prove Home Screen integration.
4. Checkpoint 4: automated CLI filesystem/round-trip tests suffice; no phone
   package-transfer gate until its native integration exists in checkpoint 5.
5. Checkpoint 5: run
   `node apps/script-viewer/tools/exchange.mjs package --topic 2-unlimited-claude-code-for --output /tmp/gombaflow-script.json`.
   Import the package on phone; check/uncheck offline; export using Files/share
   sheet and transfer to `/tmp/gombaflow-progress.json` on Mac. Run
   `node apps/script-viewer/tools/exchange.mjs import-state --input /tmp/gombaflow-progress.json`
   twice. Inspect `recording-state.json`, repackage and verify both keep/restore
   choices. Confirm original scripts and cut artifacts remain untouched. Restore
   manual progress deliberately; never use Git staging/commit as test cleanup.

## Rollout and rollback

Install a generated viewer once through the user's local file transfer, then
import MD or a package. No server deploy. The repository and returned JSON are
long-term backup; offline phone storage is working state. Export/import before
phone deletion or replacing the app. Keep the previous generated viewer until
its successor passes the device gate. Local schema stays version 1 throughout
these checkpoints; unsupported state files fail without writes. Roll back viewer
code by reinstalling the prior compatible script, preserving local data. Use
the latest valid local MD/state files; repository-built package restoration is
available only after checkpoint 5. There is no local backup history or automatic
reconstruction of a corrupt state file. Repo import
rollback restores the previous state file from normal repository history; the
feature performs no Git writes.

## Checkpoints

No API bump: implementation checkpoints only. Five checkpoints replace the
previous three to separate independently verifiable results. Execute sequentially
1 → 2 → 3 → 4 → 5; step 0 dummy review is the first activity of checkpoint 1 and
precedes any functional work. Each boundary leaves the repository's introduced
tests green and is a separate review/commit. For each checkpoint invoke
`w-implement-preflight` (recommended), then `w-implement`, then
`w-implement-review`; the user commits after review PASS according to
`.cursor/skills/planning-reference.md`.

### Checkpoint 1 — Add the tagged script parser and standalone build

Status: APPROVED (review PASS)

Scope: Step 0 reviewed dummy first; then pure parser/filter/navigation rules, valid
second-topic fixture, explicit legacy rejection, deterministic build and Node
test wiring. Generated output is a prototype shell, not a functional native
reader. No browser harness, native integration, persistence or exchange.

Validation: Node core/build command, `make test-scriptable-viewer`, standalone
build syntax check;
mandatory step 0 user review. No device integration gate.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Add the tagged script parser and standalone build
```

### Unreleased

Unreleased: none — local app/tooling and device checks only; no VPS work or release-note file creation.

### Checkpoint 2 — Add the functional Scriptable mobile reader

Status: APPROVED (review PASS)

Scope: Functional reader/controller, pinned controls, search/swipe, minimal Scriptable
MD picker before reader presentation and browser harness. Uses checkpoint 1 parser/build; progress
remains session-only. No persistence or exchange.

User-approved simplification (current chat): keep the existing reader UI and
separate program/MD transfer. Pick, read and validate the MD natively before
loading the reader. Embed only the selected session's text into its in-memory
HTML; do not embed project content into the installable program. Present the
reader fullscreen with no live host command bridge or polling. Opening another
MD requires restarting the viewer. Durable saves remain checkpoint 3. The user
approved adding the minimum Scriptable–WebView command bridge in checkpoint 3
because the session-only checkpoint 2 reader has no bridge to reuse. That
checkpoint owns the bridge, persistent offline library, multiple-script
selection/deletion, and acknowledged durable updates; it does not add package
exchange or repository CLI behavior.

Validation: scoped reader E2E command and host tests listed above,
`make test-scriptable-viewer`, manual device step 2.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Add the functional Scriptable mobile reader
```

### Unreleased

Unreleased: none — local app/tooling and device checks only; no VPS work or release-note file creation.

### Checkpoint 3 — Persist offline scripts and recording progress

Status: TODO

Priority: Home Screen launch into the last saved script/part, offline and
without repeated file selection. Keep the installed Scriptable app and local MD
transfer. Repository CLI and phone packages remain later checkpoints.

Scope: Durable library/checkmarks, global preferences, cursor, acknowledged
local MD/state file saves and confirmed deletion on the existing reader. Add the minimum
Scriptable–WebView command bridge required for serialized host-owned persistence
and acknowledgements, plus offline library list/open/delete for multiple
scripts. No package import/export or repository CLI.

Validation: scoped offline-library E2E command and host tests listed above,
`make test-scriptable-viewer`, blocking manual device step 3.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Persist offline scripts and recording progress
```

### Unreleased

Unreleased: none — local app/tooling and device checks only; no VPS work or release-note file creation.

### Checkpoint 4 — Exchange recording state through repository files

Status: TODO

Scope: Local version 1 interchange contracts, package/import-state CLI and
filesystem transactions. Independently exercised using fixture projects;
no phone import/export UI or native sharing.

Validation: targeted Node exchange command listed above,
`make test-scriptable-viewer`. No new browser/device flow.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Exchange recording state through repository files
```

### Unreleased

Unreleased: none — local app/tooling and device checks only; no VPS work or release-note file creation.

### Checkpoint 5 — Integrate phone script packages and progress exports

Status: TODO

Scope: Phone package selection, keep/restore choices and checkmark export/sharing
using checkpoint 4 contracts/CLI and checkpoint 3 storage; end-to-end transfer
guidance. No additional repository transaction behavior.

Validation: scoped package-round-trip E2E command and host tests listed above,
`make test-scriptable-viewer`, manual device step 5.

Commit message:

```text
<LOCALWORKFLOWS> <FEATURE-1> Integrate phone script packages and progress exports
```

### Unreleased

Unreleased: none — local app/tooling and device checks only; no VPS work or release-note file creation.
