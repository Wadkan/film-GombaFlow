#!/usr/bin/env python3
"""Apply configured silence cuts to a 2b retake plan.

Reads a ``retake_plan.json`` draft, the ``recording_index.json`` and its
referenced word-timestamp transcripts, the shared recording config, and
writes the validated result atomically.

Only ``talking head`` recordings with a verified cue are processed. Inside
``[content_start, content_end)`` the uncovered intervals (gaps) are computed
from the union of the clipped word spans. A gap longer than the configured
``silence_min_seconds`` is removed from the retained ranges of the pending
groups. All other groups and clip types are preserved untouched.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import sys
import tempfile
from decimal import Decimal, InvalidOperation


def _dec(value) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _parse_float(value: str) -> Decimal:
    number = Decimal(value)
    if not number.is_finite():
        raise ValueError("non-finite number")
    return number


def _load_json(path: pathlib.Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle, parse_float=_parse_float)


def _finite(value) -> bool:
    if value is None:
        return False
    try:
        if _dec(value).is_finite():
            return True
    except (InvalidOperation, ValueError):
        return False
    return False


def _sha256_file(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _json_default(value):
    if isinstance(value, Decimal):
        return float(value)
    raise TypeError(f"not JSON serializable: {type(value).__name__}")


def subtract_pauses(start, end, words, retained, threshold):
    """Return the retained ranges after removing gaps longer than threshold.

    ``start`` and ``end`` bound the content window. ``words`` is an iterable
    of ``(start, end)`` word spans. ``retained`` is an iterable of
    ``(start, end)`` ranges. The result is the retained ranges minus every
    uncovered interval whose length is strictly greater than the threshold.
    """
    start = _dec(start)
    end = _dec(end)
    threshold = _dec(threshold)

    spans = []
    for a, b in words:
        a = _dec(a)
        b = _dec(b)
        low = max(start, a)
        high = min(end, b)
        if low < high:
            spans.append((low, high))
    if not spans:
        return [(left, right) for left, right in retained]

    spans.sort()
    merged = [spans[0]]
    for a, b in spans[1:]:
        last_a, last_b = merged[-1]
        if a <= last_b:
            merged[-1] = (last_a, max(last_b, b))
        else:
            merged.append((a, b))

    gaps = []
    cursor = start
    for a, b in merged:
        if a - cursor > threshold:
            gaps.append((cursor, a))
        cursor = b
    if end - cursor > threshold:
        gaps.append((cursor, end))

    result = []
    for left, right in retained:
        left = _dec(left)
        right = _dec(right)
        pieces = [(left, right)]
        for a, b in gaps:
            next_pieces = []
            for p, q in pieces:
                if q <= a or p >= b:
                    next_pieces.append((p, q))
                    continue
                if p < a:
                    next_pieces.append((p, min(q, a)))
                if q > b:
                    next_pieces.append((max(p, b), q))
            pieces = [(p, q) for p, q in next_pieces if p < q]
        result.extend(pieces)
    return result


def _collect_words(transcript, content_start, content_end):
    """Return the clipped word spans inside the content window, as Decimals."""
    spans = []
    for segment in transcript.get("segments", []):
        for word in segment.get("words", []):
            try:
                a = _dec(word["start"])
                b = _dec(word["end"])
            except (KeyError, TypeError, ValueError):
                continue
            low = max(_dec(content_start), a)
            high = min(_dec(content_end), b)
            if low < high:
                spans.append((low, high))
    return spans


def _add_error(errors, path, message):
    errors.append({"path": path, "message": message})


def _validate_range(errors, group_index, range_index, item, index_by_id):
    path = f"groups[{group_index}].retained_ranges[{range_index}]"
    for field in ("recording_id", "source_id"):
        if not isinstance(item.get(field), str):
            _add_error(errors, f"{path}.{field}", "must be a string")
            return
    rec = index_by_id.get(item["recording_id"])
    if rec is None:
        _add_error(errors, f"{path}.recording_id", "unknown recording_id")
        return
    if item["source_id"] != rec.get("source_id"):
        _add_error(errors, f"{path}.source_id", "does not match the recording index")
    if not _finite(item.get("source_start")) or not _finite(item.get("source_end")):
        _add_error(errors, path, "source_start/source_end must be finite numbers")
        return
    start = _dec(item["source_start"])
    end = _dec(item["source_end"])
    if start >= end:
        _add_error(errors, path, "source_start must be strictly before source_end")
        return
    rec_start = _dec(rec.get("source_start", 0))
    rec_end = _dec(rec.get("source_end", 0))
    if start < rec_start or end > rec_end:
        _add_error(errors, path, "range is outside the recording source bounds")
    word_refs = item.get("word_refs")
    if word_refs is not None:
        if not isinstance(word_refs, list):
            _add_error(errors, f"{path}.word_refs", "must be a list")
        else:
            for ref_index, ref in enumerate(word_refs):
                if not _finite(ref.get("start")) or not _finite(ref.get("end")):
                    _add_error(
                        errors, f"{path}.word_refs[{ref_index}]", "non-finite word reference"
                    )
                elif _dec(ref["start"]) < start or _dec(ref["end"]) > end:
                    _add_error(
                        errors, f"{path}.word_refs[{ref_index}]", "word reference outside the range"
                    )


def validate_plan(draft, index, config):
    errors = []
    if draft.get("schema_version") != "1.1":
        _add_error(errors, "schema_version", "must be '1.1'")
    if draft.get("script_sha256") != index.get("script_sha256"):
        _add_error(errors, "script_sha256", "does not match the recording index")
    if draft.get("recording_index_sha256") != index.get("_index_sha256"):
        _add_error(errors, "recording_index_sha256", "does not match the recording index file")

    groups = draft.get("groups")
    if not isinstance(groups, list) or not groups:
        _add_error(errors, "groups", "must be a non-empty list")
        return errors

    index_by_id = {rec.get("recording_id"): rec for rec in index.get("recordings", [])}
    approved_omissions = draft.get("approved_omissions")
    approved_ids = set()
    if isinstance(approved_omissions, list):
        approved_ids = {
            entry.get("script_id") for entry in approved_omissions if isinstance(entry, dict)
        }
    approved_ids.discard(None)

    seen_ids = set()
    for group_index, group in enumerate(groups):
        path = f"groups[{group_index}]"
        script_id = group.get("script_id")
        if script_id is None or script_id in seen_ids:
            _add_error(errors, f"{path}.script_id", "missing or duplicated script_id")
        seen_ids.add(script_id)
        if group.get("status") not in ("validated", "blocked"):
            _add_error(errors, f"{path}.status", "must be 'validated' or 'blocked'")
        if not isinstance(group.get("manual_review_required"), bool):
            _add_error(errors, f"{path}.manual_review_required", "must be a boolean")
        retained = group.get("retained_ranges")
        if not isinstance(retained, list):
            _add_error(errors, f"{path}.retained_ranges", "must be a list")
            continue
        if not retained and group.get("status") == "validated" and script_id not in approved_ids:
            _add_error(
                errors,
                f"{path}.retained_ranges",
                "a validated group needs retained ranges or an approved omission",
            )
        for range_index, item in enumerate(retained):
            _validate_range(errors, group_index, range_index, item, index_by_id)

    pending = draft.get("pending_pause_group_ids")
    if pending is not None:
        if not isinstance(pending, list):
            _add_error(errors, "pending_pause_group_ids", "must be a list")
        else:
            known = {group.get("script_id") for group in groups}
            for pending_id in pending:
                if pending_id not in known:
                    _add_error(errors, "pending_pause_group_ids", f"unknown script_id {pending_id}")

    threshold = config.get("silence_min_seconds")
    if threshold is None or not _finite(threshold) or _dec(threshold) <= 0:
        _add_error(errors, "config.silence_min_seconds", "must be a positive finite number")
    return errors


def apply_pauses(draft, index, config):
    pending = set(draft.get("pending_pause_group_ids") or [])
    clips = {part.get("script_id"): part for part in index.get("script_parts", [])}
    records = {rec.get("recording_id"): rec for rec in index.get("recordings", [])}
    threshold = _dec(config["silence_min_seconds"])

    new_groups = []
    for group in draft["groups"]:
        new_groups.append(_apply_group(group, pending, clips, records, threshold))
    result = {key: value for key, value in draft.items() if key != "pending_pause_group_ids"}
    result["groups"] = new_groups
    return result


def _apply_group(group, pending, clips, records, threshold):
    if group["script_id"] not in pending:
        return group
    part = clips.get(group["script_id"], {})
    if part.get("clip_type") != "talking head":
        return group

    new_ranges = []
    for item in group.get("retained_ranges", []):
        rec = records.get(item["recording_id"])
        if rec is None or rec.get("cue") is None or rec.get("clip_type") != "talking head":
            new_ranges.append(item)
            continue
        transcript_path = rec.get("transcript_path")
        if not transcript_path:
            new_ranges.append(item)
            continue
        transcript = _load_json(pathlib.Path(transcript_path))
        words = _collect_words(transcript, rec.get("content_start"), rec.get("content_end"))
        if not words:
            new_ranges.append(item)
            continue

        retained = [(item["source_start"], item["source_end"])]
        pieces = subtract_pauses(
            rec.get("content_start"),
            rec.get("content_end"),
            words,
            retained,
            threshold,
        )
        word_refs = item.get("word_refs")
        for left, right in pieces:
            out = {
                "recording_id": item["recording_id"],
                "source_id": item["source_id"],
                "source_start": left,
                "source_end": right,
            }
            if word_refs is not None:
                kept_refs = []
                for ref in word_refs:
                    if _dec(ref["start"]) >= left and _dec(ref["end"]) <= right:
                        kept_refs.append(ref)
                out["word_refs"] = kept_refs
            new_ranges.append(out)

    return {**group, "retained_ranges": new_ranges}


def _finish_errors(errors):
    detail = "; ".join(f"{e['path']}: {e['message']}" for e in errors)
    print(f"ERROR: {detail}", file=sys.stderr)
    return 1


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--draft", required=True, help="path to the retake_plan draft")
    parser.add_argument("--index", required=True, help="path to recording_index.json")
    parser.add_argument("--config", required=True, help="path to the shared recording config")
    parser.add_argument("--output", required=True, help="path to write the validated result")
    args = parser.parse_args(argv)

    for label, path in (("draft", args.draft), ("index", args.index), ("config", args.config)):
        if not pathlib.Path(path).is_file():
            print(f"ERROR: {label} file not found: {path}", file=sys.stderr)
            return 1

    index = _load_json(pathlib.Path(args.index))
    index["_index_sha256"] = _sha256_file(pathlib.Path(args.index))
    draft = _load_json(pathlib.Path(args.draft))
    config = _load_json(pathlib.Path(args.config))

    errors = validate_plan(draft, index, config)
    if errors:
        return _finish_errors(errors)

    result = apply_pauses(draft, index, config)
    errors = validate_plan(result, index, config)
    if errors:
        return _finish_errors(errors)

    output_path = pathlib.Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    handle, tmp_name = tempfile.mkstemp(prefix=output_path.name + ".", dir=str(output_path.parent))
    try:
        with os.fdopen(handle, "w", encoding="utf-8") as tmp:
            json.dump(result, tmp, ensure_ascii=False, indent=2, default=_json_default)
            tmp.write("\n")
        os.replace(tmp_name, output_path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
