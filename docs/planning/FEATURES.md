# {{PROJECT_NAME}} Feature Plans

Non-bug implementation plans. Bug work stays in `docs/planning/BUGS.md`.

This file is the clean allocation registry and per-ID index only. It does not
store plan bodies, checkpoint state, or work heading **Status:**. Resolve each
ID through its link: a dedicated plan file, or a section in
`docs/planning/legacy/FEATURES.md` for plans that were never split out.

ID source of truth is this file's `## FEATURE-…` headings.

Format: `FEATURE-{N}` with no leading zeros (`FEATURE-1`, not `FEATURE-01`).
Related follow-up of the same feature: `FEATURE-{N}b`, `FEATURE-{N}c`, … — those
letters do not consume the next integer. Never reuse an ID. Never take an ID
from chat memory or a private notes file.

Next unused integer: **FEATURE-1**

Allocate an ID only from this clean registry: read **Next unused integer**,
confirm the destination plan path is free, add the `## FEATURE-{N}` heading with
a direct link to the new plan, create
`docs/planning/features/FEATURE-{N}.md` from
`docs/planning/templates/work-items/FEATURE_TEMPLATE.md` with heading
**Status:** `IN REVIEW`, then bump **Next unused integer**. Follow-up letters do
not advance the counter. If the local template link is missing or broken, stop
and tell the user to run `make init` — do not fall back to a W-flow absolute
source path.

Lifecycle **Status:** and checkpoint markers live only in the owning plan file.
Copy that plan's checkpoint Unreleased bullets into
`docs/deployment/RELEASE_NOTES.md` `Unreleased` using that file's format. Do not
copy the whole plan into the release notes.

---

## Allocated Feature IDs
