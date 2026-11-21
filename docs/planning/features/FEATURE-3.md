# FEATURE-3 — Separate and format PWA viewer sources

**Status:** DONE

## Goal and measurable outcome

Make the recording viewer straightforward to edit by formatting `viewer.html` and giving its stylesheet and main UI script separate, readable source files. The existing PWA build and browser tests verify that the application behaves as before.

## Current repository evidence

- `apps/script-viewer/viewer.html` contains page markup, a stylesheet, an early diagnostic bootstrap, and the main reader UI script. The main script includes the `CORE_SOURCE` insertion point.
- `apps/script-viewer/tools/build-pwa.mjs` reads an explicit source list, injects `core.js` into the page, writes `index.html`, and hashes the inputs to version the service worker. The launcher and worker use fixed lists of runtime files.
- `tests/viewer.spec.cjs` has two direct HTML fixtures that inject the parser. Its served-PWA tests use `tests/helpers/pwa-server.cjs`, whose update path copies an explicit list of source files.

## Agreed decisions

- Keep one frontend checkpoint for source formatting and extraction. No API bump is required.
- Extract the stylesheet to `viewer.css` and the main UI script to `viewer.js`. Inline both during the existing build and preserve the early diagnostic bootstrap in place.

## MVP in scope

- [x] Format the page markup and the extracted CSS and JavaScript. Preserve whitespace where it affects rendering or text. - DONE
- [x] Extend the build input list, template substitutions, and directly affected test fixtures for the two source files. - DONE

## Explicitly out of scope

- UI redesign, application logic changes, framework adoption, parser changes, storage changes, and service worker or launcher changes.

## Acceptance criteria

- `viewer.html` has readable markup. CSS rules retain their cascade order, and the JavaScript runs in its original order relative to the diagnostic bootstrap, parser, and PWA modules. Selectors, visible text, and whitespace-sensitive template literals preserve their existing behavior.
- The build emits the same runtime file set and served URLs. The stylesheet and main script are inlined in `index.html`, and an edit to either extracted input changes both the relevant inline output and the service worker cache version.
- The existing PWA checks pass for Markdown import and rendering, navigation, filters, saved state and checkmark exchange, diagnostics, and offline install, reopen, and update.

## Architecture and state ownership

The selected tagged Markdown remains the source of script content. IndexedDB remains the owner of imported scripts and reading state. The current builder composes the page from source files and inserts `core.js` inside the main script, after its existing `module` shim. Keep the early diagnostic bootstrap in its current position and the existing runtime scripts in their current order.

## Security, privacy, failure, and operational handling

Preserve the current HTML escaping, local data handling, and browser requests. Treat both new files as required build inputs and include them in the existing cache hash. Build failure for a missing input uses the current required-source error path. The installed PWA uses the existing service worker lifecycle.

## Ordered TDD implementation tasks

1. [x] Extend `apps/script-viewer/tests/pwa-tools.test.cjs`, test `builds a program-only browser app with runtime imports`. In its temporary source fixture, change each extracted input independently and assert that the change appears in the correct inline block and changes the generated worker version. Keep the existing output-file and precache assertions. Run `node --test apps/script-viewer/tests/pwa-tools.test.cjs` and verify that the new coverage fails before extraction. - DONE
2. [x] Extract and format the two sources and the page. Update `tools/build-pwa.mjs` to read and inline the two files at the original locations, then apply the existing parser injection. Update the build fixture source lists and the existing direct HTML test setup for the two insertions. Keep the served-PWA flows and assertions. - DONE
3. [x] Re-run the build tests and review the diff for CSS cascade order, whitespace-sensitive markup and strings, script execution order, and unrelated edits. Run the PWA validation target. - DONE

## Automated validation

- `node --test apps/script-viewer/tests/pwa-tools.test.cjs` for the focused build regression.
- `make test-pwa` for the parser, checkmark exchange, build, launcher, and existing browser checks. The launcher tests use loopback port 8787, so run this target when the port is available.

## Rollout and rollback

Build and serve through `make pwa-start`. The source change gets a new cache version through the existing build hash. To roll back, rebuild and serve the preceding revision on the same origin. Open the PWA online so the browser can install that revision's service worker. After installation, close all tabs and windows running the PWA to let the worker activate, then reopen the app. Existing browser data stays in IndexedDB.

## Checkpoints

### Checkpoint 1 — Separate and format PWA viewer sources

Status: APPROVED (review PASS)

Run `w-implement-preflight` (recommended), `w-implement`, then `w-implement-review`. This is the only checkpoint.

Commit message:

```text
<FRONTEND> <FEATURE-3> Separate and format PWA viewer sources
```

#### Unreleased

Unreleased: none. This local PWA source reorganization requires no VPS action or manual release check.
