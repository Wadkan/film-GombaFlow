# FEATURE-4 — Add a PWA reading fallback for local failures

**Status:** PLANNED

## Goal and measurable outcome

A recording operator can read, navigate, and search a valid script whenever the running PWA can access its Markdown, including when the device's local library or offline preparation fails. An actionable failure is shown in the existing status badge while the reader remains usable.

## Current repository evidence

- `apps/script-viewer/pwa.js` opens IndexedDB before initializing file selection and waits for `saveTopic` and a library read before displaying an imported script. File selection and persistence actions share `actionQueue`; a pending operation can therefore delay later imports. Focus refreshes read the same library again.
- `viewer.html` waits for cursor and preference saves in parts of the reading flow. Its error handler currently exposes a fixed diagnostic layer over the reader. The existing `part-status` badge displays save and service worker state. The recording handler currently waits for `send()` (which also performs a follow-up read) before updating the visible acknowledged checkbox.
- `core.js` exposes `ScriptFormatError` for invalid tagged Markdown. `storage.js` validates the persisted library and acknowledges writes on transaction completion. The service worker caches the program separately from the IndexedDB library.

## Agreed decisions

- Use the ordinary reader for valid Markdown in both persistent and session-only operation. Use the last acknowledged recording progress when available. Use neutral reading defaults when saved settings are unavailable.
- Reject invalid Markdown and show `Hibás formátum` in the existing status badge. Keep the previous readable script and its position when the new file is rejected.
- Use two frontend checkpoints: session reading despite library storage failures, then service-worker offline installation and update reporting. No API bump is required.

## MVP in scope

- [ ] Keep file selection, session rendering, paging, search, and filters responsive independently of pending IndexedDB startup, reads, and writes. - TODO
- [ ] Keep recording acknowledgement tied to the recording transaction result, independently of follow-up reads and cursor saves. - TODO
- [ ] Route session reading, import, preference, progress, and format failures through the existing status badge while keeping the reader usable. - TODO
- [ ] Preserve current service-worker offline installation and update reporting behavior. - TODO

## Explicitly out of scope

- Changes to the accepted Markdown format, raw rendering of invalid files, new persistence backends, saved-data recovery from unavailable browser storage, automatic replay of failed writes, and unrelated viewer refactoring.

## Acceptance criteria

- While IndexedDB opening, a library read, or any queued persistence operation is pending or fails, file selection, file parsing, session rendering, paging, search-result selection, and filter changes remain responsive. A valid selected MD becomes the active session script without waiting for or being serialized behind storage. Persist its library copy asynchronously through the action queue; a failed save shows `Mentési hiba` without hiding or reverting the session script. Missing saved state uses neutral defaults that expose all parts and content types.
- Failed cursor and preference saves do not block session navigation or filter effects. Recording acknowledgement follows the recording transaction outcome: a committed checkmark remains visible even if a subsequent library read or automatic cursor save fails; that later failure is separately visible in the badge. A failed recording transaction retains the last acknowledged checkbox value. No failed write is automatically replayed.
- In the active script, the operator selects invalid Markdown through the actual file picker. A `ScriptFormatError` displays exactly `Hibás formátum`; the rejected file is not rendered or saved, and the prior script and part remain visible and selected. Selecting a valid file afterwards clears that format error. Unavailable library reads show `Betöltési hiba`; all recoverable errors preserve access to the reader and its controls.
- Detected errors use the existing status badge. Concurrent failures remain visible, and a successful operation clears only its own error. Session-only mode disables persistence-dependent controls when their required stored data is unavailable.
- Under normal operation, script import, topic and position restoration, preferences, recording checkmarks, and checkmark exchange retain their existing behavior.
- Checkpoint 2 retains existing service-worker behavior. Failed initial offline preparation shows `Offline hiba`; if an update fails while an older offline version remains usable, show `Offline kész` alongside `Frissítési hiba`. Successful registration/update clears only its corresponding offline error. Existing installation, reload, offline restart, and update flows continue to work.

## Architecture and state ownership

The tagged Markdown is authoritative for content. Reuse the current active reader state and keep the validated Markdown for the current session independently of the library. IndexedDB is authoritative for acknowledged progress, saved positions, settings, and library membership. Initialize file selection and the viewer host independently of storage initialization. Parse and activate a valid picked file in session state immediately; enqueue only its persistence work. Keep storage operations serialized through the existing action queue without making reader interactions wait for that queue. Delayed startup/focus reads must not overwrite a newer user selection or session navigation. A recording checkbox reflects its transaction outcome before any follow-up state refresh; a later refresh or cursor-save failure must not undo that acknowledgement. Persistent actions apply only to their captured topic and valid stored data. Checkpoint 2 owns service-worker registration and offline install/update status in its existing status state.

## Security, privacy, failure, and operational handling

Validate before changing the active script or saving imported content. Keep the current renderer escaping and local data handling. Preserve the existing transaction rollback and diagnostic details for debugging, and surface concise failure text in the badge while the app shell is usable. Failed data changes get no success acknowledgement or automatic replay; committed recording changes remain acknowledged despite a later, separate refresh failure. If the app starts but no MD can be accessed because the library is unreadable, leave file selection available so the operator can supply the source file again. Opening offline requires a runnable app shell. Offline registration/update failure reporting is addressed separately in checkpoint 2.

## Ordered TDD implementation tasks

1. [ ] Update `apps/script-viewer/tests/viewer.spec.cjs` test `reads a valid MD when the local library is unavailable` to cover rejected IndexedDB opening, a pending queued storage operation, and a rejected import write. For the import-write case, select a valid MD through `#scriptFile`, reject its library write, and verify the selected script remains readable, `Mentési hiba` appears in the existing badge, and no library entry is created. In the pending-operation case, keep one storage operation unresolved while the operator selects and reads another valid MD through `#scriptFile`; verify immediate rendering, paging, search, filters, and the badge before releasing the operation, then verify the delayed storage result cannot replace the selected session script. Establish failing assertions before implementation. - TODO
2. [ ] In `apps/script-viewer/tests/viewer.spec.cjs`, extend `keeps the reader and last acknowledged state when an IndexedDB write fails`: verify a failed transaction preserves the prior checkbox and reader navigation; in a separate case commit a checkmark, fail the subsequent library read or automatic cursor save, and verify the checkmark remains visible while the later error appears in the badge. Include a failed preference-save assertion proving the selected filter still takes effect, plus an active-session focus-read failure that preserves the reader. Update `keeps separate topics, preserves progress on update, and rejects invalid MD` to submit invalid Markdown via the actual picker while on an active script/part, then verify `Hibás formátum`, the prior script and part, continued reader access, and a later valid-picker recovery; remove expectations for the blocking diagnostic overlay from these named failure flows. Verify concurrent errors are independently cleared. - TODO
3. [ ] Implement session-first selection and rendering in the PWA reader. Limit `actionQueue` to persistence operations so a held read/write cannot block another file selection or session navigation. Make search, paging, and preference effects update session state immediately; apply persisted state only when it still belongs to the active script/session. Update the visible recording acknowledgement from the recording transaction result before follow-up reads or cursor saves. Route format, load, save, preference, and recording errors to the existing badge. Preserve the healthy storage path and validate format before changing session state or writing. - TODO
4. [ ] Run the focused session flows, inspect pending queue, stale read, and post-commit failure handling, then run `make test-pwa`. - TODO

### Offline installation and update tasks

Status: TODO

1. [ ] Update existing `apps/script-viewer/tests/viewer.spec.cjs` tests `shows a failed first offline installation and recovers on reload` and `install, restart offline and update without losing local data` to assert offline install and update failures/recovery in the existing status badge, including preservation of a usable previous offline version and independent clearing of concurrent errors. Keep the browser flows complete and establish failing cases before implementation. - TODO
2. [ ] Implement service-worker install/update error reporting in the existing badge state without changing cache activation or the session-reading behavior from checkpoint 1. - TODO
3. [ ] Run the two focused offline flows and then `make test-pwa`. - TODO

## Automated validation

- Checkpoint 1 focused flows: `npm --prefix apps/script-viewer run test:e2e -- tests/viewer.spec.cjs --reporter=line --grep 'reads a valid MD|last acknowledged state|separate topics'`.
- Checkpoint 2 focused flows: `npm --prefix apps/script-viewer run test:e2e -- tests/viewer.spec.cjs --reporter=line --grep 'failed first offline installation|install, restart offline'`.
- Each checkpoint: `make test-pwa` for PWA build, launcher, storage, and browser coverage. Run it with loopback port 8787 available for launcher tests.

## Rollout and rollback

Build and serve with `make pwa-start`. For rollback, rebuild and serve the prior revision at the same origin. Open the PWA online so the prior service worker can install, then close all PWA windows and tabs to allow activation and reopen the app. Keep the browser's IndexedDB intact.

## Checkpoints

### Checkpoint 1 — Keep scripts readable during storage failures

Status: TODO

Run `w-implement-preflight` (recommended), `w-implement`, then `w-implement-review`.

Commit message:

```text
<FRONTEND> <FEATURE-4> Keep scripts readable during storage failures
```

#### Unreleased

Unreleased: none. The local PWA uses the existing build and update process.

### Checkpoint 2 — Report PWA offline installation and update status

Status: TODO

Run `w-implement-preflight` (recommended), `w-implement`, then `w-implement-review`.

Commit message:

```text
<FRONTEND> <FEATURE-4> Report PWA offline installation and update status
```

#### Unreleased

Unreleased: none. The local PWA uses the existing build and update process.
