# FEATURE-2 — Add an offline recording script PWA

**Status:** DONE

## Goal and measurable outcome

Use the current recording reader as an installable, standalone PWA on iPhone,
Android and desktop. After installation and successful offline preparation,
open the last imported MD and reading position with the Mac and tunnel stopped,
retain acknowledged local changes across restarts, and exchange recording
checkmarks through manually selected JSON files.

Success means the approved reader works from the device's Home Screen without
Scriptable controls, dynamically imports MD rather than embedding content,
and passes the persistence, additive import, offline restart and update checks
below. No startup speed improvement is claimed without device measurements.

## Current repository evidence

- `apps/script-viewer/viewer.html` is the current clickable-reader source.
  Its staged update at planning time keeps two permanent bottom-right ↑/↓
  buttons which independently toggle the top and bottom bars. This current
  working-tree version, including its CSS and control placement, is the visual
  baseline; do not restore the older hide/show-button layout.
- `apps/script-viewer/core.js` already parses tagged MD and provides filtering
  and navigation helpers. It validates topic identity, stable positive part IDs,
  spoken cues, clip types and nonempty location attributes. Reuse it.
- The sole content/design sample for this feature is
  `local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/3-script.md`.
  It contains 16 parts and A/B/C location metadata for exercising the existing
  selector. Preserve the original MD. Test variations may be derived in memory
  from this sample; do not introduce another project's MD as the PWA baseline.
- FEATURE-1's UI/behavior sections describe the existing one-part reader,
  global filters, narration-only search, cue, recorded checkbox, navigation
  and local library. Its Scriptable, Shortcuts, repository CLI and package
  plans are not requirements of FEATURE-2. Before Step 0, FEATURE-1 is IN
  PROGRESS and appears in the backlog. Step 0 deletes that superseded plan
  after preserving its relevant contract in this document; no unfinished
  FEATURE-1 checkpoint is a prerequisite.
- `ScriptViewer.js` contains native file-backed library handling.
  `tools/build.mjs` embeds the reader and core in a Scriptable host program.
  Neither supplies a browser IndexedDB adapter or PWA packaging.
- `viewer.html` exposes `viewerOpen`, `viewerShowLibrary` and
  `viewerHost.send`. Its no-op host fallback and immediate success wording
  cannot serve as production browser persistence.
- `tests/viewer.spec.cjs` already tests reading, resuming a fake-host library
  and collapsed bars. Its bar test still refers to the older button names.
  No real HTTP/IndexedDB, JSON exchange or service-worker flow exists.
- Before Step 0, `Makefile` aggregates viewer tests through `make test-scriptable-viewer`
  under root `make test`. The package has Node tests and
  `npm --prefix apps/script-viewer run test:e2e`; Playwright currently matches
  `viewer.spec.cjs` and writes results under `/tmp`.
- `docs/notes/app-script-megjelenites.md` provides the PWA background.
  Its place substitution and transition ideas are excluded by the current
  decisions. No manifest, service worker, PWA launcher or tunnel setup exists
  in the inspected application. `docs/deployment/RELEASE_NOTES.md` is absent.

## Agreed decisions

- Plain HTML/CSS/JavaScript; reuse the current reader and parser. Preserve the
  present appearance and behavior as closely as possible. Add only the
  browser bootstrap, real storage, necessary file actions and offline status.
- User-selected local files are the MD source. Keep an application-owned copy
  in IndexedDB. No MD, project list, example title or Drive URL is built into
  the PWA; the Claude sample is test input only.
- IndexedDB owns MDs, checkmarks, global filters/type visibility/search,
  last topic/per-topic part and both bar states. Save changes as they occur,
  and report success only after transaction completion.
- Manual JSON exchange exports the active topic's checkmarks, including false
  values, plus an export timestamp. Import is additive:
  `result[id] = local[id] || incoming[id]`. An import can set an unrecorded
  part recorded; it can never clear a recorded part. Export dates are
  informative, not conflict-resolution instructions.
- No migration from Scriptable, separate backup function, automatic device
  synchronization, account, backend or repository exchange CLI.
- Step 0 fully retires the repository's Scriptable implementation and
  FEATURE-1 plan. Retain only the platform-independent reader, parser and
  useful test/tooling assets listed below. This is the first activity of
  checkpoint 1, not an extra checkpoint or separate commit.
- Keep the existing selectors, including the MD-derived location selector.
  Dynamic place assignment/substitution and new transition handling are
  excluded. There is no transition-specific selector in the current HTML;
  do not invent a new one or reinterpret an existing selector.
- One fixed HTTPS origin is served from the Mac through a named Cloudflare
  Tunnel. `make pwa-start` starts the local server and tunnel; Ctrl+C stops
  both. Install/update while they run; use the prepared PWA offline afterward.
- Five implementation checkpoints, with no HTTP API contract or API version
  bump: Step 0 retirement plus browser reader/storage; dated additive JSON
  exchange; offline installation/update through the existing HTTP fixture;
  focused recording-cue/part-heading layout; then the production HTTP/tunnel
  launcher and physical-device gates.

## MVP in scope

- [ ] Step 0: remove all Scriptable-specific program/build/test/documentation assets and the superseded FEATURE-1 plan, preserving the web assets and standalone behavior contract. - TODO
- [ ] Reuse the current reader with manual local MD selection and a persistent multi-topic browser library. - TODO
- [ ] Persist checkmarks, global reading preferences and navigation/bar state with acknowledged saves. - TODO
- [ ] Export/import one topic's dated checkmark JSON with the additive-only merge rule. - TODO
- [ ] Install and restart offline on mobile and desktop, including after a program update without clearing user data. - TODO
- [ ] Start and stop the Mac server/tunnel together through `make pwa-start`, with concise setup and device-check instructions. - TODO
- [ ] Keep the selected part's spoken cue visible below the upper dashboard while scrolling, and render all part headings in a smaller, consistent size. - TODO

## Explicitly out of scope

- Scriptable/Shortcuts launch work, old-state migration, reading native
  Scriptable storage, backup scheduling, full-library archive/restore or recovery
  history. Manual checkmark exchange remains in scope.
- Google Drive APIs/URLs, cloud state, login, automatic synchronization,
  timestamp-based overwrite decisions, per-part change histories and automatic
  reconciliation between devices.
- FEATURE-1's unfinished repository CLI/package workflows or source-template
  changes; video/media/Resolve operations and automatic repository writes.
- Script editing, alternate MD dialects, dynamic place names, GO/TRAVEL
  expansion and transition-processing logic.
- A frontend framework, third-party runtime CDN, hosted backend, VPS deployment,
  new Cloudflare hosting products or an always-running Mac service.
- Visual redesign beyond the compact part heading and persistent, non-overlapping
  spoken-cue placement in acceptance criterion 13, decorative animation and
  unrelated parser/test cleanup.

## Acceptance criteria

0. Before PWA implementation, complete Step 0's explicit keep/delete list.
   No native Scriptable program, bridge, installer/debug output, native tests,
   launch instructions or Make target remains. FEATURE-1's plan and exact
   backlog row are removed; its registry heading retains the allocated ID and
   points to FEATURE-2 as its replacement without a dangling old-plan link.
   The current reader UI, parser and retained browser/unit tests still work
   through `make test-pwa`, which is included in root `make test`.
1. A fresh PWA shows an empty library with an MD-open action. Selecting the
   Claude sample through the device file picker parses and stores its text,
   then shows its actual 16 parts. Selecting a valid in-memory variation with
   another topic proves the library is dynamic. The served program contains
   neither sample MD nor an embedded topic catalog.
2. Preserve Hungarian labels, current colors and reader content layout, readable
   text, mandatory cue and checkbox, bottom narration-only search, chapter/clip/location/
   recorded filters, type visibility, swipe and arrow/picker navigation.
   Top and bottom dashboard controls use one compact, consistent font treatment
   so the script content remains the visual focus. Keep the recording checkbox
   smaller and persistently visible at the lower right, above the permanent
   up/down bar-toggle arrows; it is no longer inside the bottom dashboard.
   The permanent ↑/↓ controls stay reachable in either bar state. Existing
   location selection continues using MD metadata without place substitution.
   Chapter/clip/location/status selections combine with AND; case-insensitive
   narration substring search further narrows them. Type checkboxes govern
   narration, screen actions and production notes, including chapter notes;
   they never hide the mandatory cue while the bottom bar is open. Navigation
   never wraps or turns vertical scroll/control interaction into a swipe.
   Keep at least 44 CSS-pixel touch targets and 20 CSS-pixel reading text.
3. Recording is persisted before success/advance. In the unrecorded filter,
   move to the next matching part in document order, or the first remaining
   match if none follows. Empty results preserve filters, disable irrelevant
   actions and retain the existing all-status action. Direct manual checkbox
   changes may check or uncheck; the no-clearing rule applies to JSON import.
4. Reload, close/reopen and offline restart restore MD copies, true/false
   checks, all global preferences/search, last topic/per-topic part and both
   collapsed bars. If a saved part is absent or excluded, show the first match
   without overwriting its remembered ID merely because of this fallback.
   Explicit navigation saves the chosen ID. Unavailable saved filter values
   remain explicit instead of silently resetting.
5. Reimporting MD for an existing topic preserves its progress and cursor;
   new part IDs start false. Keep absent IDs stored without assigning them
   to another part. Opening a stored topic restores its own cursor.
   Cancelled/invalid MD selection and failed persistence preserve confirmed
   data and the previous reader. Opening MD is available without restarting.
6. Library list/open/delete work locally. Confirm deletion of that topic's
   MD and checkmarks together. Cancellation changes nothing; deleting the
   active topic returns to the list/empty view, clears its last-topic pointer
   and preserves global settings and other topics.
7. JSON export contains `schema_version: 1`, `topic_id`, `exported_at` and
   `recorded`. Include explicit booleans for every part in the current MD.
   `exported_at` is a UTC ISO 8601 date-time produced at export, with `Z`;
   do not export MD, preferences or other topics. Download it as a JSON file
   with topic and date/time in the filename.
8. JSON import selects a local file, validates it against the active topic/MD,
   shows its export time in a confirmation, then atomically applies logical OR
   for supplied IDs. Test all four local/incoming boolean combinations.
   False and omitted values never clear local true values; repeat import is
   idempotent. Reject invalid schema, timestamp, identity, unknown part IDs
   or non-boolean values before writes. Cancellation preserves all state.
   Preferences, cursor, MD and other topics are unchanged by the merge.
9. The installed PWA launches independently of Scriptable on iPhone and
   Android; desktop use works by mouse/keyboard and at a wide viewport.
   Physical-device checks verify safe areas, long-content scroll, touch
   navigation, bar toggles and picker/search visibility with the keyboard.
10. Offline-ready status is shown only after the complete program asset cache
    is installed and the page is controlled by a service worker. With the Mac
    and tunnel stopped and the device offline, a cold launch restores the
    library and allows further saved checkmark changes and file exchange.
11. Re-serving a new program build at the same HTTPS origin installs a new
    complete cache without replacing a running session mid-edit. After all
    old app windows close and the new worker activates, reopening uses the
    update with MDs/state intact. A failed/incomplete update leaves the
    previous working version usable offline.
12. With the one-time tunnel/domain setup complete, `make pwa-start` builds
    program assets, starts the loopback HTTP server on port 8787, starts the
    configured named tunnel and prints the fixed mobile HTTPS address.
    Ctrl+C, child failure or startup failure cleans up this invocation's
    server/tunnel; occupied ports fail without killing unrelated processes.
    Requests cannot expose repository files, MD samples or tunnel credentials.
13. Render every `Felvehető rész — N` heading in one smaller, consistent
    treatment. Move the selected part's spoken recording cue (the per-part cue
    derived from the MD's `Felvételi varázsszó`) out of the lower dashboard to
    a sticky row directly below the upper dashboard and above the scrollable
    reader content. Keep the cue visible while the reader scrolls and while
    either dashboard is collapsed; it occupies its own layout space and never
    covers readable script text. Keep the lower dashboard's search and status
    controls usable.

## Architecture and state ownership

### Standalone parser contract retained from FEATURE-1

Read topic, magic word and default timeline from the tagged header and parse
only `Script nézői sorrendben`. Preserve heading/chapter associations and
document order. Associate chapter notes with descendant parts; do not turn
handoff/review metadata into recordable parts. Handle nested Markdown fences,
decode entities once and render content as text. Validate positive unique part
IDs, the single shared timeline, cue identity, supported paired structural tags,
clip types and nonempty location metadata. Reject malformed input before
replacing valid MD/state. Preserve `core.js` behavior rather than rewriting the
parser. These rules and the acceptance criteria above replace the relevant
FEATURE-1 sections; implementation must not need that deleted plan.

### Files and browser boundary

Keep the current app directory. Planned additions, relative to
`apps/script-viewer/`:

- `pwa.js`: browser startup and the small `viewerHost.send` adapter, local
  file inputs, library actions and JSON download/import UI.
- `storage.js`: native IndexedDB storage and atomic state mutations.
- `progress.js`: pure exchange validation, serialization and additive merge.
- `tools/build-pwa.mjs`: deterministic program-only output from an explicit
  asset allowlist. Replace the existing core placeholder in a generated
  `index.html` and load browser-only modules there. Do not include native
  host/build output or scan project scripts.
- `manifest.webmanifest`, local icons and `sw.js`: added in checkpoint 3.
- `tools/start-pwa.mjs`: checkpoint 5 server/child supervisor.
- `tests/storage.spec.cjs`, `tests/progress.test.cjs` and
  `tests/pwa-tools.test.cjs`: scoped persistence, exchange and program-build tests.
  Expand Playwright's match only as needed for the IndexedDB test file.
  Existing user flows stay in `tests/viewer.spec.cjs`.
- `tests/pwa-launcher.test.cjs`: checkpoint 5 subprocess, production HTTP
  security and launcher lifecycle tests; include in package `test` when added.
- `tests/helpers/pwa-server.cjs`: minimal real-HTTP browser-test fixture,
  introduced in checkpoint 1 and reused for offline/update tests.

Use native browser APIs and the existing test stack; no production framework,
database wrapper or new process manager. Reuse HTML/CSS/controller code rather
than maintaining a second reader copy. The directory becomes web-only after
Step 0; remove the native build and native-only tests rather than preserving
compatibility with them. Browser modules are loaded by the PWA build.

Step 0's exact retention/removal boundary, relative to `apps/script-viewer/`:

- Retain `viewer.html` with its latest CSS/markup/controller, `core.js`,
  `tests/core.test.cjs` and the fixtures required by those existing unit tests.
  Keep the generic browser tests in `tests/viewer.spec.cjs`,
  `playwright.config.cjs`, `package.json` and its lockfile. Existing parser
  regression fixtures do not become another PWA content/design baseline.
- Delete `ScriptViewer.js`, `tools/build.mjs`, `tools/build-selected.mjs`,
  `tests/host.test.cjs`, `tests/build.test.cjs` and the whole generated
  `output/` directory, including its copied MD. Preserve the original Claude
  project's `3-script.md` outside that output directory.
- Remove the entire native-only browser test named `generated Scriptable
program restores its offline library before presenting fullscreen` and
  its native mocks/imports from `tests/viewer.spec.cjs`. Keep generic reader,
  error-display, library and bar tests; update stale bar locators for the
  permanent toggle buttons before running the retained suite.
- Remove native test references from package `test`. Replace root
  `scriptable-viewer` and `test-scriptable-viewer` targets/phony entries with
  `test-pwa` for the retained tests; root `make test` must depend on `test-pwa`.
  Do not add a legacy alias or leave a command invoking deleted build files.
- Rewrite README as a web-reader/PWA document, initially explaining the
  retained assets and planned browser runtime, then extend it in later tasks.
  Remove native installation, Shortcuts, debugger and host-state instructions.
- Delete `docs/planning/features/FEATURE-1.md`. Remove only its exact backlog
  row; keep the FEATURE-1 registry heading as an allocation tombstone with a
  replacement link to `features/FEATURE-2.md`, and keep Next unused integer
  unchanged. Do not mark FEATURE-1 DONE or claim its unfinished work passed.
  This retirement and associated backlog/registry edit are explicitly
  user-authorized exceptions to the normal completed-item removal path, not
  a new general backlog/lifecycle rule. They execute in Step 0, not during
  this plan-only update.

Audit remaining live references to removed paths so no executable dependency
or broken document link survives. Historical explanation of retirement and
the requirement to avoid Scriptable controls may still name Scriptable.

### Persistent data

Use a single IndexedDB database `gombaflow-viewer`, version 1, with one
`library` object store and one `state` record:

- `schema_version: 1`.
- `topics`: map of topic ID to `markdown`, `recorded` boolean map and
  `last_part_id` (canonical decimal string or null).
- `preferences`: existing chapter, clip, location, status, type-visibility,
  search, `topCollapsed` and `bottomCollapsed` fields.
- `last_topic_id`: selected topic ID or null.

This is a new PWA store, not a conversion of the native state file. The local
MD text and state live in the same atomic record. Fresh preferences are
`chapter: all`, `clip: all`, `location: all`, `status: not-recorded`, empty
search, all three type-visibility flags true and both collapsed flags false.
The initial topics map is empty and last topic is null; do not import defaults
or logic from the deleted native host.

Each mutation reads the latest record and applies the specific operation in a
readwrite transaction. Resolve only on transaction completion, not individual
request success. Keep external file reads/parsing outside the transaction.
Serialize reader actions while saving; never write a stale whole-session copy.
Reading fresh transaction state also prevents another same-origin window's
acknowledged checkmarks from being overwritten by unrelated preference writes.
Refresh the displayed snapshot when a window regains focus. No cross-device
transport is introduced.

IndexedDB is the authoritative state; parsed parts and current DOM are derived.
Validate stored data on startup; report unreadable/unsupported state without
resetting it. Request `navigator.storage.persist()` when supported after the
first successful user import; denial does not break the application or claim a
guarantee. Browser storage can still be removed by user action. See
[IndexedDB transactions](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
and [persistent storage](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).

### Exchange boundary

Use the four fields in acceptance criterion 7. IDs must be canonical positive
decimal strings and values strict booleans. A valid incoming timestamp is
metadata only; do not compare device clocks to select a winner. Unknown IDs
reject the whole file; omitted known IDs remain unchanged. Export only current
MD IDs, even if historical IDs remain stored.

Add the JSON import/export actions to the existing Scriptek/library controls
for the selected topic; keep MD selection separate and retain the reader layout.
Disable exchange when no topic is selected. After additive import, rerender
using saved filters and ordinary fallback rules without changing the saved
cursor. Only successful storage commits produce a success message. Use a
downloadable JSON Blob/object URL and revoke it after the browser has started
the download. A download request is not proof the user retained the file.

### Program cache and lifecycle

Manifest uses stable root `id`, `start_url` and `scope`, `display: standalone`,
a Hungarian name, matching colors, local 192/512 icons and an Apple touch icon.
Preserve viewport/safe-area behavior; no runtime remote dependencies.

The build assigns a deterministic asset-content version to the service worker's
cache name. Precache the complete allowlisted program; fail installation on a
missing/bad asset. Serve navigation and same-origin program assets from the
active version cache with a navigation fallback to its index. Imported content
stays in IndexedDB, outside the cache.

Use normal waiting-worker activation; do not force `skipWaiting` or reload an
open reader during a save. Check for updates on startup while the local server
and tunnel serve the desired build. Returning online does not require a separate
update check: the operator makes new builds available during local runs.
This user-approved decision withdraws implementation-review finding 2 for
checkpoint 3; findings 1 (installation icons) and 3 (active-cache navigation
fallback) remain required fixes. Once all
old clients close, activation removes only this app's older program caches;
never delete IndexedDB or unrelated caches. Document closing all PWA windows
and reopening after an update. See the
[service-worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Security, privacy, failure, and operational handling

- Render imported text safely using existing escaping/text APIs. Do not
  evaluate MD/JSON or turn imported topic strings into paths. Validate key
  ownership; arbitrary imported object keys must not mutate prototypes.
- No uploads or server-side user state. The public tunnel serves only generated
  application assets. No analytics, account tokens or project source files in
  the build. Browser storage belongs to the installation/origin.
- Native file input cancellation is normal. Selected files must be locally
  available for fully offline import; selection does not grant ongoing access
  to an external file or synchronize its later edits.
- On quota/permission/transaction failures, retain confirmed state, roll back
  optimistic UI, stop success/advance and show a concise retryable error.
  Gate startup controls until storage/bootstrap is ready; do not use the
  existing no-op host as a production save path.
- Flush queued search/preference saves through the normal save queue.
  Do not rely on unload handlers. A terminated, unacknowledged action may not
  persist; tests wait for acknowledgement before close/reopen.
- Handle blocked/version-change database connections by closing stale
  connections and displaying a reload instruction, not deleting data.
- Build/runtime/test scratch directories and logs belong under `/tmp`.
  The launcher uses an isolated temporary build directory and serves only its
  allowlisted files with correct content types. Reject traversal and unknown
  paths, and bind the HTTP origin to `127.0.0.1:8787`.
- Use a locally managed named `cloudflared` tunnel, default name
  `gombaflow-pwa`. Configuration/credentials remain outside Git, with a default
  config path `~/.cloudflared/gombaflow-pwa.yml`. Allow
  `PWA_TUNNEL` and `PWA_TUNNEL_CONFIG` overrides. Require
  `PWA_HOSTNAME` for the fixed public hostname; configure it once in the
  operator's shell. Do not hardcode it into program content.
- One-time operator setup: install cloudflared, authenticate, create/reuse the
  named tunnel, configure its ingress hostname to
  `http://127.0.0.1:8787` with a final HTTP 404 rule, and create the DNS route.
  A domain managed in Cloudflare is a prerequisite. Never overwrite an existing
  tunnel configuration or provision live account resources as part of tests.
  The documented runtime child command is
  `cloudflared tunnel --config <config-path> run <tunnel-name>`.
  See [Cloudflare's local tunnel setup](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/create-local-tunnel/).
- `make pwa-start` calls the Node supervisor, which checks configuration/tools,
  builds the app, listens, then spawns cloudflared with an argument array.
  Print the configured HTTPS URL and local-ready status; do not claim the
  public connection is healthy without a successful HTTPS check.
  On SIGINT/SIGTERM or failure, stop its child and close its listener; bounded
  cleanup escalates only for its own unresponsive child. No background daemon,
  PID-file service or separate stop target.
- The fixed scheme/host/port must remain the same for installed data continuity.
  Do not use changing Quick Tunnel URLs. Keep the Mac awake during initial
  installation/update; after offline readiness it may be stopped.
  No server-side API or separate API-bump checkpoint.

## Ordered TDD implementation tasks

All commands below run from the repository root. Paths in this section are
relative to `apps/script-viewer/` unless explicitly qualified. Each checkpoint
executes Test → minimum Implementation → Refactor while green → Validation.
Never implement later checkpoints early.

### Step 0 — Retire Scriptable and FEATURE-1 (first activity in checkpoint 1)

- [x] Retention check: identify and retain the current web UI/controller, parser, generic browser tests, parser fixtures and package/Playwright setup using the exact boundary above. The reader/navigation/parser contract is now captured in FEATURE-2; remove any remaining requirement to read FEATURE-1 during implementation. Run `node --test apps/script-viewer/tests/core.test.cjs` as the parser baseline. - DONE
- [x] Remove the listed native source/build/output/test assets, the native-only browser test and obsolete README instructions. Adjust package test wiring and bar locators; introduce root `test-pwa`, remove both Scriptable Make targets and wire `test-pwa` into root `make test`. Delete FEATURE-1's plan and its exact backlog row; preserve its allocated registry heading with a FEATURE-2 replacement link. Do not delete or revert the current shared reader or original Claude MD. - DONE
- [x] Validation: run `node --test apps/script-viewer/tests/core.test.cjs`, `npm --prefix apps/script-viewer run test:e2e -- --reporter=line` and `make test-pwa`. Inspect `make -n test` to confirm retained/new viewer tests remain in the root aggregate. Audit the deleted-path references. This is removal and test rewiring, not new runtime behavior: keep the useful existing tests green rather than inventing tests asserting documentation text. Proceed to checkpoint 1's new behavior only after this step is complete. - DONE

### Browser reader and persistent library (checkpoint 1)

- [x] Test: add `tests/storage.spec.cjs` using real browser IndexedDB. Cover atomic MD/state save, true/false toggles, preferences without an active topic, save acknowledgement/abort, same-topic reimport, deletion, invalid stored state and interleaved writes from two pages. Derive topic variations and invalid MD from the sole Claude sample. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line storage.spec.cjs`; first observe missing-storage failures. - DONE
- [x] Test: extend existing `record parts and resume the offline library` in `tests/viewer.spec.cjs` to use a real HTTP-served PWA, file input and IndexedDB, replacing its fake-host persistence. Include two derived topics, switching/reload, update of the same MD, cancellation/invalid import, failed save, deletion/empty library and restored global settings/cursor. Update existing `restores collapsed bars and saves reopening them` for permanent toggle buttons and real persistence. Extend `filter and read a recording script` only where needed for the current layout, mouse/keyboard and 390/1280-pixel viewports. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "filter and read a recording script|record parts and resume the offline library|restores collapsed bars and saves reopening them"` and observe relevant failures. - DONE
- [x] Test: add build/runtime tests in `tests/pwa-tools.test.cjs` proving dynamic imports, program-only allowlisting and missing input handling. Run `node --test apps/script-viewer/tests/pwa-tools.test.cjs` and observe missing browser-build behavior before implementing it. - DONE
- [x] Implementation: add `storage.js`, `pwa.js`, a program-only `tools/build-pwa.mjs` and the real-HTTP test fixture. Bind browser actions to the retained reader; preserve current markup/CSS and serialized acknowledgements. Implement picker/local copies, topic list/open/confirmed deletion, restore and error handling. Do not restore the retired native build. No exchange, service worker or tunnel yet. - DONE
- [x] Refactor and validation: keep only small browser/storage modules, include new tests in package `test`, and confirm root `make test` still reaches them through `test-pwa`. Run `node --test apps/script-viewer/tests/pwa-tools.test.cjs` and `make test-pwa`. Update README with the browser-library boundary and temporary HTTP test workflow. - DONE

### Dated additive checkmark exchange (checkpoint 2)

- [x] Test: add `tests/progress.test.cjs` for all four OR combinations, false/omitted preservation, repeated import, strict boolean/ID validation, unknown IDs/topic, schema/timestamp validation and export of every current ID including false values. Inject the clock for deterministic exported_at tests. Run `node --test apps/script-viewer/tests/progress.test.cjs` and observe missing exchange behavior. - DONE
- [x] Test: add complete flow `exchange recording checkmarks through JSON files` in `tests/viewer.spec.cjs`; no existing implemented flow covers JSON files. Import the Claude MD, export actual JSON via a browser download, inspect timestamp/schema/booleans, manually change local checks, reimport a mixed true/false file, cancel and confirm with visible export time, reload and prove a preexisting true cannot clear. Include repeated and invalid imports and preservation of another derived topic/settings. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "exchange recording checkmarks through JSON files"` and observe failures before integration. - DONE
      PASS — a felhasználó kézzel ellenőrizte a JSON export/import működését a böngészőben.
- [x] Implementation: add pure `progress.js` and minimal per-topic JSON actions in the existing library controls. Validate before the confirmation and apply OR in one latest-state IndexedDB transaction. Export one topic as a downloadable dated JSON file. Do not add repository CLI, migration, full-library archive or timestamp-winner logic. - DONE
- [x] Test: extend `restores collapsed bars and saves reopening them` in `tests/viewer.spec.cjs` to assert the compact shared typography, smaller recording checkbox and its persistent lower-right placement above the bar toggles with both bars open and collapsed. Also assert the content-type sheet uses compact text and its full `Bezárás` button is not covered by floating controls. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "restores collapsed bars and saves reopening them"` and observe failures before the UI change. - DONE
      PASS — a felhasználó kézzel ellenőrizte az új dashboardot, a pipát és a tartalomtípus-ablakot.
- [x] Implementation: make top/bottom dashboard text and controls use one substantially smaller, consistent font treatment so the reader content remains the visual focus; move the smaller recording checkbox to a fixed lower-right control above the always-visible up/down bar toggles. Make the content-type sheet text smaller and layer it over floating controls so `Bezárás` remains unobscured. Preserve checkbox accessibility, save acknowledgement and navigation behavior. - DONE
- [x] Refactor and validation: register progress tests in package `test`, document import/export and the no-clearing rule in README, then run the targeted commands above and `make test-pwa`. - DONE

### Offline installation and program updates (checkpoint 3)

- [x] Test: extend `tests/pwa-tools.test.cjs` with deterministic program/cache-version generation, complete manifest/icon/worker asset inclusion and version changes when program content changes. Use `node --test apps/script-viewer/tests/pwa-tools.test.cjs` and observe failures before adding offline packaging. No production listener, child process or cloudflared behavior belongs in this checkpoint. - DONE
- [x] Test: add complete flow `install, restart offline and update without losing local data` in `tests/viewer.spec.cjs`. No current flow covers real service workers. Serve real build A over localhost, verify manifest/icon responses and service-worker control/readiness, import MD and save state, close/reopen with network disabled and prove further edits/export. Restore network with build B, retain the open session until it closes, then verify B activates with data intact. Also fail one asset during update and prove A survives offline. Reuse the checkpoint 1 HTTP fixture and actual IndexedDB; do not fake the worker/cache. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "install, restart offline and update without losing local data"` and observe failures. - DONE
- [x] Implementation: add local manifest/icons/service worker, deterministic complete-asset cache and normal waiting update lifecycle. Add only the offline-readiness indication needed to distinguish program readiness from a saved checkbox. Exercise all browser behavior through the existing checkpoint 1 HTTP fixture; do not add `tools/start-pwa.mjs`, the Make startup target or tunnel integration yet. - DONE
- [x] Refactor and validation: run `node --test apps/script-viewer/tests/pwa-tools.test.cjs`, the targeted offline/update E2E command above and `make test-pwa`; tests remain included in root `make test`. Document offline readiness, waiting-worker activation, failed-update recovery and code rollback in README using the fixture-based validation command. Physical-device/HTTPS gates are deferred to checkpoint 5 and do not block this independently testable browser result. - DONE

### Recording cue and part-heading layout (checkpoint 4)

- [x] Test: extend the existing `restores collapsed bars and saves reopening them` flow in `tests/viewer.spec.cjs` to check the smaller, consistent part-heading treatment, the recording cue's sticky position below the upper dashboard, continued visibility after long-content scrolling and no overlap with reader text. Cover both dashboard states at the existing mobile and desktop viewports. Run `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "restores collapsed bars and saves reopening them"` and observe the missing behavior before implementation. - DONE
- [x] Implementation: render every part heading in the same smaller type treatment and move the selected part's spoken cue from the fixed lower dashboard into its own sticky row below the upper dashboard and above the scrollable reader. Keep the cue visible during scrolling and when either dashboard is collapsed, without covering text. Keep the lower dashboard's search/status controls, cue identity, navigation and saved preferences working. - DONE
- [x] Refactor and validation: run the targeted E2E command above and `make test-pwa`. Keep the cue derived from the active MD/part; add no persisted preference or new reader behavior beyond this layout. - DONE

### Local HTTP/tunnel launcher and physical-device gates (checkpoint 5)

Status: APPROVED (review PASS)

- [x] Review finding 1: bound HTTP shutdown with incomplete requests for SIGINT and SIGTERM; add regression tests. - DONE
- [x] Review finding 2: isolate the occupied-port test from installed cloudflared. - DONE

- [x] Test: add `tests/pwa-launcher.test.cjs` with real subprocess/listener checks using fake cloudflared fixtures under `/tmp`. Prove Make delegation, configured tunnel arguments, program-only HTTP content/types, path traversal and unknown-path rejection, missing config/tool, occupied port, child failure and SIGINT/SIGTERM cleanup without leftover child/listener or killing unrelated processes. Use `node --test apps/script-viewer/tests/pwa-launcher.test.cjs` and observe missing launcher/security behavior before implementation. No live Cloudflare account operations belong in automated tests. - DONE
- [x] Implementation: add `tools/start-pwa.mjs` and root `.PHONY: pwa-start` / `pwa-start` target to start the existing program build, production loopback server and named tunnel as one foreground invocation. Implement only the supervisor/configuration/HTTP boundary described above; reuse checkpoint 3's PWA/cache assets without redesigning the service-worker lifecycle. - DONE
- [x] Refactor and automated validation: add the launcher tests to package `test` so root `make test` reaches them via `test-pwa`; run `node --test apps/script-viewer/tests/pwa-launcher.test.cjs` and `make test-pwa`. Document tunnel prerequisites, exact one-time setup, shell configuration, printed HTTPS address and one-command start/stop in README. - DONE
- [x] Physical-device validation: complete the user-required iPhone, desktop, offline exchange, update, mobile-data and Ctrl+C checks. Android-specific validation is explicitly omitted at the user’s request and is not an acceptance requirement for this checkpoint. - DONE

## Automated validation

Validation runners and aggregate wiring:

- `make test-pwa` — scoped Node/browser regression aggregate introduced in
  Step 0 to replace the existing `test-scriptable-viewer` target.
- `make test` — root aggregate including the above and existing Python suites;
  no new automated suite may live outside it.
- `npm --prefix apps/script-viewer run test:e2e -- --reporter=line` —
  existing Playwright package command.

The specific file/grep invocations use the existing Node/package runners.
The new Make target must exist before Step 0 validation; later checkpoints use
it and do not invoke deleted native tests or build scripts.
Their new test files/titles are planned additions, not claims that the tests
already exist. Extend package `test` with each new Node test file when added;
extend Playwright `testMatch` for `storage.spec.cjs` in checkpoint 1.
Use Chromium for deterministic automated service-worker/IndexedDB coverage.
Browser emulation does not replace mobile installation checks.

Checkpoint 3 validates build/cache generation in `tests/pwa-tools.test.cjs`
and the real service-worker flow through the existing HTTP fixture. Checkpoint 4
validates the reader cue/heading layout in the existing browser flow. Checkpoint 5
adds `tests/pwa-launcher.test.cjs` for production HTTP/subprocess/security
behavior; it reuses the completed browser implementation. All four physical-device
gates belong exclusively to checkpoint 5.

Checkpoint handoff uses its targeted commands plus the scoped aggregate above.
Do not add unrelated all-suite commands, documentation-prose assertions or live
Cloudflare operations to tests. This planning run does not execute implementation
tests or claim PASS.

## Manual validation

These are local/device gates, not VPS release notes. CLI names introduced here
are checkpoint 5 deliverables; all four gates are checkpoint 5 requirements.
Record PASS/FAIL with one concrete sentence on
each gate when actually executed; do not prefill outcomes.

- [x] iPhone standalone/offline gate: after the documented one-time tunnel setup and shell `PWA_HOSTNAME` configuration, run `make pwa-start` on the Mac. Open the printed HTTPS address in Safari, add it to the Home Screen, launch that installation, import the Claude MD from local Files and wait for offline readiness. Change/save checks, filters, narration search, part and both bar states. Ctrl+C the Mac command, enable airplane mode, force-close/relaunch from the icon and verify restoration plus another saved checkbox after a second restart. Check no Scriptable Close/share strip, safe areas, long scroll, swipes and search keyboard. - PASS — A felhasználó megerősítette az iPhone-os offline működést, valamint a pipa és olvasási pozíció újraindítás utáni megőrzését.
- [x] Android and desktop gate: run `make pwa-start`, install in Android Chrome and open the same origin in desktop Chrome. Import MD separately on each device, exercise navigation and bar controls, then stop with Ctrl+C and verify offline relaunch/save. Test desktop mouse/keyboard and wide layout. Device states must remain independent. - PASS — Az asztali Chrome működik; a felhasználó kifejezetten kérte az Android ellenőrzés kihagyását, ezért az Android-rész nem része a lezárási feltételnek.
- [x] File exchange gate: run `make pwa-start` for initial preparation, then perform export/import while offline on iPhone and Android using actual local file selection/download. Check the export date and false booleans in the JSON, import with conflicting false values and verify no true becomes false. Cancel an import and verify no change. - PASS — A felhasználó megerősítette az iPhone-os offline pipamegőrzést és JSON export/import működését; az Android részt kihagyta.
- [x] Update gate: run `make pwa-start` using a newer program build at the same configured hostname, reopen online and allow the update to cache, then close all old app windows. Stop the launcher, relaunch offline and verify the new program with the same MD/checkmarks/preferences/cursor. During initial preparation verify mobile access also works over mobile data, and after Ctrl+C the Mac listener/tunnel child from this invocation are stopped. - PASS — A felhasználó megerősítette, hogy frissítés után megmaradtak az appadatok, mobiladaton elérhető volt az app, és a leállítás sikerült.

## Rollout and rollback

Implement only after plan-review approval, one checkpoint at a time. Start with
Step 0's user-authorized retirement of the Scriptable source/build/artifacts,
native tests and FEATURE-1 plan/backlog entry. Keep the reusable web source
in the existing directory and preserve the original sample MD. FEATURE-2 is
the complete behavior source; no live FEATURE-1 plan dependency remains.
The old native implementation remains available only in Git history; this
feature does not maintain or reinstall it as a fallback.

The PWA starts with an empty browser store. Install first, then manually import
MD into that installation. No Scriptable state or backup archive is requested.
Document separate installation storage and no automatic cross-device sharing.
See [PWA installation behavior](https://web.dev/learn/pwa/installation).

The Mac serves a temporary program-only directory via the named tunnel during
installation/update. The hostname remains unchanged between runs. Stop both
services with Ctrl+C once offline readiness is confirmed. Actual domain/tunnel
creation is a one-time operator setup, not an automated deployment in this plan.

For code rollback, rebuild known-good source and serve it at the same origin
using the same launcher. The rebuilt service worker must be byte-distinct from
the currently active bad worker and must install its own complete asset cache;
use a cache-version change if otherwise identical. Close old clients and reopen
after activation. Do not clear site data, change origin or delete the database.
No persistent-schema evolution is part of this feature. A failed cache update
naturally retains the prior active version.

## Checkpoints

Sequence: checkpoint 1 (Step 0 retirement first, then browser implementation)
→ 2 → 3 (offline browser lifecycle) → 4 (recording cue/heading layout)
→ 5 (HTTP/tunnel lifecycle and device gates).
No API bump. Step 0 is not a checkpoint numbered zero and has no
separate commit.

For every checkpoint use `w-implement-preflight` (recommended), then
`w-implement`, then `w-implement-review`, followed by one user commit after
review PASS. Runtime status and retry rules are owned by
`.cursor/skills/planning-reference.md`; do not combine checkpoints.

### Checkpoint 1 — Replace Scriptable with a persistent browser recording reader

Status: APPROVED (review PASS)

Scope: Step 0's complete Scriptable/FEATURE-1 retirement and keep/delete list,
then checkpoint 1 TDD tasks, real browser file/storage adapter, retained reader
integration, minimal HTTP build/test support and matching regression updates.
Independent result: a usable persistent browser reader; offline program loading
is not yet claimed.

Validation: Step 0 checks, checkpoint 1 targeted commands and `make test-pwa`.

Commit message:

```text
<FRONTEND> <FEATURE-2> Replace Scriptable with a persistent browser recording reader
```

Forrás: `docs/planning/features/FEATURE-2.md`, Checkpoint 1 Commit message.

#### Unreleased

Unreleased: none — local browser application only; no VPS action or release-notes
file creation.

### Checkpoint 2 — Add dated checkmark exchange with additive imports

Status: APPROVED (review PASS)

Scope: checkpoint 2 TDD tasks, one-topic JSON serialization/validation,
export timestamp and monotonic checkmark imports. Independent result: manual
cross-device file exchange without clearing local recorded values.

Validation: checkpoint 2 targeted commands and `make test-pwa`.

Commit message:

```text
<FRONTEND> <FEATURE-2> Add dated checkmark exchange with additive imports
```

Forrás: `docs/planning/features/FEATURE-2.md`, Checkpoint 2 Commit message.

#### Unreleased

Unreleased: none — manual local file exchange; no VPS operator action.

### Checkpoint 3 — Add offline installation and safe program updates

Status: APPROVED (review PASS)

Scope: checkpoint 3 TDD tasks, manifest/icons, deterministic offline packaging,
service-worker installation, waiting activation, cache/update recovery and
offline-readiness documentation. Independent result: offline restart and safe
program updates proven through the existing HTTP fixture with real IndexedDB,
service workers and caches. Excludes production HTTP supervision, cloudflared,
Make startup integration and physical-device gates.

Validation: `node --test apps/script-viewer/tests/pwa-tools.test.cjs`,
`npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "install, restart offline and update without losing local data"`
and `make test-pwa`. No manual gate is required in this checkpoint.

Commit message:

```text
<FRONTEND> <FEATURE-2> Add offline installation and safe program updates
```

Forrás: `docs/planning/features/FEATURE-2.md`, Checkpoint 3 Commit message.

#### Unreleased

Unreleased: none — local/browser program-cache behavior validated through the
existing HTTP fixture; no VPS or tunnel operator action in this checkpoint.

### Checkpoint 4 — Keep the recording cue visible while reading

Status: APPROVED (review PASS)

Scope: checkpoint 4 TDD tasks, compact consistent part headings and a sticky
spoken-cue row below the upper dashboard, above the scrollable reader. The cue
remains visible while scrolling and when dashboards are collapsed without
covering script text. Independent result: readable, non-obscuring access to
the active recording cue throughout the reader.

Validation: `npm --prefix apps/script-viewer run test:e2e -- --reporter=line --grep "restores collapsed bars and saves reopening them"` and `make test-pwa`.

Commit message:

```text
<FRONTEND> <FEATURE-2> Keep the recording cue visible while reading
```

Forrás: `docs/planning/features/FEATURE-2.md`, Checkpoint 4 Commit message.

#### Unreleased

Unreleased: none — local reader layout only; no VPS action or release-notes
file creation.

### Checkpoint 5 — Add the local PWA server and tunnel launcher

Status: APPROVED (review PASS)

Scope: checkpoint 5 TDD tasks, production loopback HTTP/asset allowlist,
foreground tunnel process supervision, Make startup integration, operator
setup documentation and all four physical-device gates. Independent result:
one-command HTTPS access from mobile, clean shutdown and validated installed
use of the already completed offline PWA. Excludes service-worker lifecycle
redesign and new browser product behavior.

Validation: `node --test apps/script-viewer/tests/pwa-launcher.test.cjs`,
`make test-pwa` and all four Manual validation gates using `make pwa-start`.

Commit message:

```text
<DEPLOY> <FEATURE-2> Add the local PWA server and tunnel launcher
```

Forrás: `docs/planning/features/FEATURE-2.md`, Checkpoint 5 Commit message.

#### Unreleased

Unreleased: none — the operator starts local Mac services and a Cloudflare
Tunnel; no VPS deployment. Setup and all device checks remain in README/Manual
validation for this checkpoint.
