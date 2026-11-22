# {{PROJECT_NAME}} Backlog

This is a short, human-readable, fixed-order index of the remaining {{PROJECT_NAME}} work;
list order is the recommended implementation order and priority across features
and bugs (rows are not numbered). It is not a plan source, and
IDs are not allocated here: the linked plan file is the canonical source for
details, status, and acceptance criteria.

Only work that is not `DONE` may appear here. Only the `w-implement-review`
reviewer may remove an item, after accepting the last checkpoint as
`APPROVED (review PASS)` and when the canonical plan status is `DONE`. An
implementor or plan author may not remove rows from this file. On removal,
delete only that work ID's row; do not edit, reorder, or renumber other rows.

Only the `w-review-feature-plan` or `w-review-bug-plan` reviewer may add a
new row, after approving the canonical plan with an `APPROVED` result and
setting the work heading to `PLANNED`. Do not add a row while the heading is
`IN REVIEW`. An implementor, plan author, or implementation reviewer may not
add a new backlog item.

`Migration` means a database-schema migration. `API bump` means a separate
bump checkpoint for the versioned API contract.

## Ordered Backlog
