import hashlib
import importlib.util
import json
import pathlib
import subprocess
import tempfile
import unittest
from decimal import Decimal

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT_PATH = (
    ROOT
    / "local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/scripts/apply_retakes_silence.py"
)

SPEC = importlib.util.spec_from_file_location("apply_retakes_silence", SCRIPT_PATH)
apply_retakes_silence = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(apply_retakes_silence)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class RetakeSilenceTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(dir="/tmp")
        base = pathlib.Path(self.temp_dir.name)
        self.script_path = base / "3-script.md"
        self.script_path.write_text("cím\n<bemondás>\n", encoding="utf-8")
        self.script_sha256 = sha256_bytes(self.script_path.read_bytes())
        self.transcripts = {
            "R1": base / "transcript_r1.json",
            "R2": base / "transcript_r2.json",
            "R3": base / "transcript_r3.json",
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def write_transcript(self, key, words):
        transcript = {
            "schema_version": "1.0",
            "source_id": f"sha256:{key}",
            "source_path": f"/tmp/{key}.mov",
            "file_name": f"{key}.mov",
            "duration": 100.0,
            "time_base": "source_seconds",
            "status": "transcribed",
            "segments": [
                {
                    "start": words[0][0] if words else 0.0,
                    "end": words[-1][1] if words else 0.0,
                    "text": " ".join(w[2] for w in words),
                    "words": [{"start": s, "end": e, "text": t} for s, e, t in words],
                }
            ],
        }
        self.transcripts[key].write_text(
            json.dumps(transcript, ensure_ascii=False), encoding="utf-8"
        )

    def write_index(self, recordings, script_parts=None):
        if script_parts is None:
            script_parts = [
                {
                    "script_id": 1,
                    "chapter_id": "H",
                    "script_order": 1,
                    "timeline": "T",
                    "clip_type": "talking head",
                    "description": "d",
                }
            ]
        index = {
            "schema_version": "1.0",
            "topic_id": "t",
            "script_path": str(self.script_path),
            "script_sha256": self.script_sha256,
            "script_version": "1",
            "manifest_path": "/tmp/m.json",
            "assignments_path": None,
            "additional_manifests": [],
            "magic_word": "serpenyő",
            "script_parts": script_parts,
            "recordings": recordings,
        }
        self.index_path = pathlib.Path(self.temp_dir.name) / "recording_index.json"
        self.index_path.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
        self.index_sha256 = sha256_bytes(self.index_path.read_bytes())
        return self.index_path

    def write_draft(
        self, groups, pending=None, status="ready_for_execution", coverage_checked=True
    ):
        draft = {
            "schema_version": "1.1",
            "script_sha256": self.script_sha256,
            "recording_index_sha256": self.index_sha256,
            "coverage_checked": coverage_checked,
            "status": status,
            "groups": groups,
            "unresolved": [],
            "missing_items": [],
            "approved_omissions": [],
            "pending_index_update": None,
        }
        if pending is not None:
            draft["pending_pause_group_ids"] = pending
        self.draft_path = pathlib.Path(self.temp_dir.name) / "draft.json"
        self.draft_path.write_text(json.dumps(draft, ensure_ascii=False), encoding="utf-8")
        return self.draft_path

    def write_config(self, silence_min_seconds=2):
        config = {"magic_word": "serpenyő", "silence_min_seconds": silence_min_seconds}
        self.config_path = pathlib.Path(self.temp_dir.name) / "config.json"
        self.config_path.write_text(json.dumps(config, ensure_ascii=False), encoding="utf-8")
        return self.config_path

    def run_cli(self, draft, index, config, output):
        return subprocess.run(
            [
                "python3",
                str(SCRIPT_PATH),
                "--draft",
                str(draft),
                "--index",
                str(index),
                "--config",
                str(config),
                "--output",
                str(output),
            ],
            capture_output=True,
            text=True,
        )

    def recording(
        self,
        recording_id,
        clip_type,
        script_id,
        transcript_key,
        source_start,
        source_end,
        content_start,
        content_end,
        cue=True,
        manual=False,
    ):
        return {
            "recording_id": recording_id,
            "source_id": f"sha256:{transcript_key}",
            "source_path": f"/tmp/{transcript_key}.mov",
            "transcript_path": str(self.transcripts[transcript_key]),
            "source_start": source_start,
            "source_end": source_end,
            "cue": {
                "start": source_start,
                "end": content_start,
                "original_text": f"serpenyő {recording_id} serpenyő",
            }
            if cue
            else None,
            "content_start": content_start,
            "content_end": content_end,
            "retained_start": content_start,
            "retained_end": content_end,
            "script_id": script_id,
            "chapter_id": "H",
            "script_order": 1,
            "timeline": "T",
            "clip_type": clip_type,
            "description": "d",
            "cue_only": False,
            "audio_enabled": True,
            "assignment_origin": "spoken_cue",
            "identifier_correction": None,
            "user_description": None,
            "status": "identified",
            "issue": None,
        }

    def group(self, script_id, retained_ranges, status="validated", manual_review_required=False):
        return {
            "script_id": script_id,
            "timeline": "T",
            "status": status,
            "manual_review_required": manual_review_required,
            "recording_order": [r["recording_id"] for r in retained_ranges],
            "recording_order_evidence": {
                "basis": "single recording for this script ID",
                "source_path": "/tmp/x.mov",
                "source_time_range": [0.0, 20.0],
            },
            "deletions": [],
            "command_omissions": [],
            "retained_ranges": retained_ranges,
            "decisions": "d",
        }

    def retained(self, recording_id, source_id, source_start, source_end, word_refs=None):
        item = {
            "recording_id": recording_id,
            "source_id": f"sha256:{source_id}",
            "source_start": source_start,
            "source_end": source_end,
        }
        if word_refs is not None:
            item["word_refs"] = word_refs
        return item

    def load_json(self, path):
        return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))

    def test_pause_ranges_respect_cue_threshold_and_existing_cuts(self):
        sub = apply_retakes_silence.subtract_pauses
        # A 2.0-second leading gap equals the threshold: kept as a boundary pair.
        kept = sub(
            Decimal("2.4"),
            Decimal("6.8"),
            [(Decimal("4.4"), Decimal("5.0"))],
            [(Decimal("2.4"), Decimal("6.8"))],
            Decimal("2"),
        )
        self.assertEqual(kept, [(Decimal("2.4"), Decimal("6.8"))])
        # A 2.01-second leading gap passes the threshold and is removed.
        cut = sub(
            Decimal("2.4"),
            Decimal("6.81"),
            [(Decimal("4.41"), Decimal("5.0"))],
            [(Decimal("2.4"), Decimal("6.81"))],
            Decimal("2"),
        )
        self.assertEqual(cut, [(Decimal("4.41"), Decimal("6.81"))])
        # A configured alternate threshold is honored.
        alt = sub(
            Decimal("0"),
            Decimal("10"),
            [(Decimal("3"), Decimal("5"))],
            [(Decimal("0"), Decimal("10"))],
            Decimal("1"),
        )
        self.assertEqual(alt, [(Decimal("3"), Decimal("5"))])

    def test_protected_groups_and_other_clip_types_are_preserved(self):
        self.write_transcript("R1", [(11.0, 11.4, "a"), (11.4, 13.17, "b")])
        self.write_transcript("R2", [(11.0, 13.0, "a")])
        self.write_index(
            [
                self.recording("T001", "talking head", 1, "R1", 1.0, 13.17, 5.0, 13.17),
                self.recording("T002", "b-roll", 2, "R2", 1.0, 13.0, 5.0, 13.0),
            ],
            script_parts=[
                {
                    "script_id": 1,
                    "chapter_id": "H",
                    "script_order": 1,
                    "timeline": "T",
                    "clip_type": "talking head",
                    "description": "d",
                },
                {
                    "script_id": 2,
                    "chapter_id": "O",
                    "script_order": 2,
                    "timeline": "T",
                    "clip_type": "b-roll",
                    "description": "d",
                },
            ],
        )
        groups = [
            self.group(
                1,
                [
                    self.retained(
                        "T001",
                        "R1",
                        5.0,
                        13.17,
                        word_refs=[
                            {"start": 6.0, "end": 6.5, "text": "cut"},
                            {"start": 11.0, "end": 11.4, "text": "kept"},
                        ],
                    )
                ],
                status="validated",
                manual_review_required=False,
            ),
            self.group(
                2,
                [self.retained("T002", "R2", 5.0, 13.0)],
                status="validated",
                manual_review_required=False,
            ),
        ]
        draft = self.write_draft(groups, pending=[1])
        output = pathlib.Path(self.temp_dir.name) / "final.json"
        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertEqual(result.returncode, 0, result.stderr)
        final = self.load_json(output)
        by_id = {g["script_id"]: g for g in final["groups"]}
        # Talking head gap 5.0–11.0 is a 6s pause: retained range is trimmed,
        # and only the word reference inside the kept span survives.
        self.assertEqual(
            by_id[1]["retained_ranges"],
            [
                {
                    "recording_id": "T001",
                    "source_id": "sha256:R1",
                    "source_start": 11.0,
                    "source_end": 13.17,
                    "word_refs": [{"start": 11.0, "end": 11.4, "text": "kept"}],
                }
            ],
        )
        # B-roll is preserved untouched.
        self.assertEqual(
            by_id[2]["retained_ranges"],
            [
                {
                    "recording_id": "T002",
                    "source_id": "sha256:R2",
                    "source_start": 5.0,
                    "source_end": 13.0,
                }
            ],
        )

    def test_invalid_plan_reports_location_without_writing_output(self):
        self.write_transcript("R1", [(11.0, 11.4, "a")])
        self.write_index(
            [
                self.recording("T001", "talking head", 1, "R1", 1.0, 13.17, 5.0, 13.17),
            ]
        )
        groups = [
            self.group(1, [self.retained("T001", "R1", 5.0, 13.17)]),
        ]
        draft = self.write_draft(groups, pending=[1])
        raw = json.loads(self.draft_path.read_text(encoding="utf-8"))
        raw["recording_index_sha256"] = "0" * 64
        self.draft_path.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")

        output = pathlib.Path(self.temp_dir.name) / "final.json"
        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("recording_index_sha256", result.stderr)
        self.assertFalse(output.exists())

    def test_validated_empty_ranges_require_approved_omission(self):
        self.write_transcript("R1", [(11.0, 11.4, "a")])
        self.write_index(
            [
                self.recording("T001", "talking head", 1, "R1", 1.0, 13.17, 5.0, 13.17),
            ]
        )
        draft = self.write_draft(
            [self.group(1, [], status="validated", manual_review_required=False)],
            pending=[1],
        )
        output = pathlib.Path(self.temp_dir.name) / "final.json"
        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("groups[0].retained_ranges", result.stderr)
        self.assertFalse(output.exists())

    def test_valid_needs_review_plan_preserves_empty_blocked_group(self):
        self.write_transcript("R1", [(11.0, 11.4, "a")])
        self.write_index(
            [
                self.recording("T001", "talking head", 1, "R1", 1.0, 13.17, 5.0, 13.17),
            ]
        )
        groups = [
            self.group(1, [self.retained("T001", "R1", 5.0, 13.17)], status="validated"),
            self.group(2, [], status="blocked", manual_review_required=False),
        ]
        draft = self.write_draft(groups, pending=[1], status="needs_review")
        output = pathlib.Path(self.temp_dir.name) / "final.json"
        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertEqual(result.returncode, 0, result.stderr)
        final = self.load_json(output)
        self.assertEqual(final["status"], "needs_review")
        blocked = [g for g in final["groups"] if g["script_id"] == 2][0]
        self.assertEqual(blocked["status"], "blocked")
        self.assertEqual(blocked["retained_ranges"], [])

    def test_failed_continuation_pass_preserves_recovery_save(self):
        self.write_transcript("R1", [(11.0, 11.4, "a"), (11.4, 13.17, "b")])
        self.write_transcript("R2", [(8.0, 8.4, "a")])
        self.write_index(
            [
                self.recording("T001", "talking head", 1, "R1", 1.0, 13.17, 5.0, 13.17),
                self.recording("T002", "talking head", 2, "R2", 1.0, 13.17, 5.0, 13.17),
            ],
            script_parts=[
                {
                    "script_id": 1,
                    "chapter_id": "H",
                    "script_order": 1,
                    "timeline": "T",
                    "clip_type": "talking head",
                    "description": "d",
                },
                {
                    "script_id": 2,
                    "chapter_id": "O",
                    "script_order": 2,
                    "timeline": "T",
                    "clip_type": "talking head",
                    "description": "d",
                },
            ],
        )
        groups = [
            self.group(1, [self.retained("T001", "R1", 5.0, 13.17)], status="validated"),
            self.group(2, [self.retained("T002", "R2", 5.0, 13.17)], status="validated"),
        ]
        draft = self.write_draft(groups, pending=[2])

        recovery = pathlib.Path(self.temp_dir.name) / "recovery.json"
        recovery.write_bytes(self.draft_path.read_bytes())

        raw = json.loads(self.draft_path.read_text(encoding="utf-8"))
        raw["recording_index_sha256"] = "1" * 64
        self.draft_path.write_text(json.dumps(raw, ensure_ascii=False), encoding="utf-8")

        output = pathlib.Path(self.temp_dir.name) / "final.json"
        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(output.exists())
        # A failed pass must not touch the recovery save or its pending IDs.
        failed_draft = json.loads(self.draft_path.read_text(encoding="utf-8"))
        self.assertEqual(failed_draft.get("pending_pause_group_ids"), [2])
        self.assertIn("pending_pause_group_ids", failed_draft)

        fixed = json.loads(self.draft_path.read_text(encoding="utf-8"))
        fixed["recording_index_sha256"] = self.index_sha256
        self.draft_path.write_text(json.dumps(fixed, ensure_ascii=False), encoding="utf-8")

        result = self.run_cli(draft, self.index_path, self.write_config(), output)
        self.assertEqual(result.returncode, 0, result.stderr)
        final = self.load_json(output)
        self.assertNotIn("pending_pause_group_ids", final)
        by_id = {g["script_id"]: g for g in final["groups"]}
        self.assertEqual(
            by_id[1]["retained_ranges"],
            [
                {
                    "recording_id": "T001",
                    "source_id": "sha256:R1",
                    "source_start": 5.0,
                    "source_end": 13.17,
                }
            ],
        )
        self.assertEqual(
            by_id[2]["retained_ranges"],
            [
                {
                    "recording_id": "T002",
                    "source_id": "sha256:R2",
                    "source_start": 8.0,
                    "source_end": 8.4,
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
