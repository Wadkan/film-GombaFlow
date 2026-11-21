# FEATURE-5 — Add a manual PWA update button

**Status:** DONE

## Goal and measurable outcome

A recording operator can update the installed GombaFlow PWA in one tap and continue with their saved scripts, checkmarks, reading position, and filters.

## Current repository evidence

- `apps/script-viewer/pwa.js` registers `/sw.js`, reports offline readiness, and serializes writes through `actionQueue`.
- `apps/script-viewer/sw.js` caches the complete program, leaves passive updates waiting, and removes previous app caches on activation. `tools/build-pwa.mjs` derives the worker version from the build content.
- `apps/script-viewer/storage.js` stores the library separately in IndexedDB. The existing update flow in `tests/viewer.spec.cjs` triggers an update through Playwright and closes the page to activate it. `tests/pwa-tools.test.cjs` currently forbids any `skipWaiting` use.
- FEATURE-4 covers passive failure reporting. This checkpoint owns the button and feedback for its explicit update attempt.

## Agreed decisions

- One tap checks for, downloads, and applies a complete update. Reload after pending saves finish.
- Verify the first rollout on a previously installed mobile PWA. One frontend checkpoint covers the work. No API bump is required.

## MVP in scope

- [x] Add a **Frissítés** button with progress and outcome feedback, explicit worker activation, and one reload that preserves IndexedDB data. - DONE

## Explicitly out of scope

- Recovery of stuck installations, automatic forced activation, CDN configuration changes, and IndexedDB or API changes.

## Acceptance criteria

- From a controlled app, one tap checks for an update and applies either an already waiting worker or a newly downloaded worker. The initiating window reloads once under the new worker after its queued writes settle. Repeated taps during the attempt are ignored.
- With no update available, the current build stays open and shows that it is current. If the update check or bundle installation fails, show a retryable update error and keep the current build usable offline.
- The updated app restores the saved Markdown, checkmarks, position, and filters from the same IndexedDB library. Background updates still wait for normal activation unless explicitly requested.

## Architecture and state ownership

IndexedDB remains authoritative for the saved library. The service worker manages only program caches. The page calls `registration.update()` when a worker is not already waiting, observes installation, and asks the waiting worker to call `skipWaiting()` only through an explicit message. Reload the initiating window on the matching `controllerchange` and leave other windows alone.

## Security, privacy, failure, and operational handling

Keep the same HTTPS origin and `/sw.js` URL. Keep the current offline cache active until all assets install successfully. Drain the existing write queue before requesting activation and let writes queued before reload settle. Preserve the existing save error handling. Keep update feedback separate from offline readiness.

## Ordered TDD implementation tasks

1. [x] Update `apps/script-viewer/tests/viewer.spec.cjs`, **install, restart offline and update without losing local data**, to use the real button. Verify passive waiting, that a pending save completes before the single reload into a visibly distinct build, and that saved library state is restored. Check the current-version and failed-update outcomes. Run `npm --prefix apps/script-viewer run test:e2e -- tests/viewer.spec.cjs -g "install, restart offline and update without losing local data" --reporter=line` and confirm it fails before implementation. - DONE
2. [x] Add the button to `viewer.html`, the update flow to `pwa.js`, and the explicit activation message to `sw.js`. Replace the blanket `skipWaiting` assertion in `tests/pwa-tools.test.cjs` with the browser flow's passive-waiting check. Document the button and first rollout in the app README. - DONE
3. [x] Refactor only as needed while green. Rerun the focused browser test and `make test-pwa`. - DONE

## Automated validation

- Run the focused Playwright command above and `make test-pwa`. The root `make test` already includes `test-pwa`.

## Manual validation

- Run `make pwa-start` with the new checkout at the existing tunnel hostname. On the mobile device, open the previous install online from its home-screen icon, let the new worker install, then close and reopen the app. Using the same icon, verify **Frissítés** appears and a previously saved script and its progress are still present.

## Rollout and rollback

Serve the complete new build on the existing origin. The first rollout uses the current close-and-reopen activation path. Subsequent releases can use the button. To roll back, serve the previous complete build on that same origin and allow its worker to activate. Preserve the local library.

## Checkpoints

### Checkpoint 1 — Add a manual PWA update button

Status: APPROVED (review PASS)

Sequence: `w-implement-preflight` (recommended), `w-implement`, `w-implement-review`.

Commit message:

```text
<FRONTEND> <FEATURE-5> Add a manual PWA update button
```

### Unreleased

Unreleased: none. The existing Mac-hosted deployment needs no VPS action.
