# {{PROJECT_NAME}} Bug Plans

This file is the clean allocation registry and per-ID index only. It does not
store plan bodies, checkpoint state, or work heading **Status:**. Resolve each
ID through its link: a dedicated plan file, or a section in
`docs/planning/legacy/BUGS.md` for plans that were never split out.

ID source of truth is this file's `## BUG…` headings.

Format: `BUG{N}` with no leading zeros (`BUG1`, not `BUG01`). Related follow-up
of the same bug: `BUG{N}b`, `BUG{N}c`, … — those letters do not consume the next
integer. Never reuse an ID. Never take an ID from chat memory or a private notes
file.

Next unused integer: **BUG1**

Allocate an ID only from this clean registry: read **Next unused integer**,
confirm the destination plan path is free, add the `## BUG{N}` heading with a
direct link to the new plan, create
`docs/planning/bugs/BUG{N}.md` from
`docs/planning/templates/work-items/BUG_TEMPLATE.md` with heading **Status:**
`IN REVIEW`, then bump **Next unused integer**. Follow-up letters do not advance
the counter. If the local template link is missing or broken, stop and tell the
user to run `make init` — do not fall back to a W-flow absolute source path.

Lifecycle **Status:** and checkpoint markers live only in the owning plan file.
Copy that plan's checkpoint Unreleased bullets into
`docs/deployment/RELEASE_NOTES.md` `Unreleased` using that file's format. Do not
copy the whole plan into the release notes.

---

## Allocated Bug IDs
