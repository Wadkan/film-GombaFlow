import hashlib
import importlib.util
import io
import json
import pathlib
import tempfile
import unittest
from types import SimpleNamespace
from unittest import mock

SCRIPT_PATH = (
    pathlib.Path(__file__).resolve().parents[1]
    / "local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/scripts/transcribe_recordings.py"
)
SPEC = importlib.util.spec_from_file_location("recording_transcription", SCRIPT_PATH)
transcription = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(transcription)


class RecordingTranscriptionTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(dir="/tmp")
        self.addCleanup(self.temp_dir.cleanup)
        self.root = pathlib.Path(self.temp_dir.name)
        self.sources = self.root / "sources"
        self.sources.mkdir()
        self.output = self.sources / "transcripts"

    def test_word_times_sources_and_silent_recordings_are_preserved(self):
        speech = self.sources / "a.mov"
        speech.write_bytes(b"spoken source")
        silent = self.sources / "b.mp4"
        silent.write_bytes(b"silent source")
        word = SimpleNamespace(start=1.234, end=1.987, word=" serpenyő")
        segment = SimpleNamespace(start=1.234, end=1.987, text=" serpenyő", words=[word])
        model = mock.Mock()
        model.transcribe.return_value = (iter([segment]), SimpleNamespace(language="hu"))

        def probe(path):
            return {"duration": 3.25, "has_audio": path == speech.resolve()}

        with mock.patch.object(transcription, "probe_media", side_effect=probe):
            manifest_path = transcription.run_batch(self.sources, lambda: model, "hu")
        manifest = json.loads(manifest_path.read_text())
        self.assertEqual(len(manifest["recordings"]), 2)
        records = [
            json.loads((self.output / item["transcript_path"]).read_text())
            for item in manifest["recordings"]
        ]
        self.assertEqual(
            records[0]["segments"][0]["words"][0],
            {
                "start": 1.234,
                "end": 1.987,
                "text": " serpenyő",
            },
        )
        self.assertEqual(
            records[0]["source_id"], "sha256:" + hashlib.sha256(b"spoken source").hexdigest()
        )
        self.assertEqual(records[1]["status"], "no_audio")
        self.assertEqual(records[1]["segments"], [])
        self.assertEqual(speech.read_bytes(), b"spoken source")
        self.assertEqual(silent.read_bytes(), b"silent source")
        self.assertTrue(model.transcribe.call_args.kwargs["word_timestamps"])
        self.assertEqual(model.transcribe.call_count, 1)

    def test_existing_output_is_not_overwritten(self):
        (self.sources / "a.mov").write_bytes(b"source")
        self.output.mkdir()
        sentinel = self.output / "master_transcript.json"
        sentinel.write_text("existing result")
        factory = mock.Mock()
        with self.assertRaises(FileExistsError):
            transcription.run_batch(self.sources, factory, "hu")
        self.assertEqual(sentinel.read_text(), "existing result")
        factory.assert_not_called()

    def test_missing_word_times_prevent_a_success_manifest(self):
        (self.sources / "a.mov").write_bytes(b"source")
        segment = SimpleNamespace(start=0.0, end=1.0, text="speech", words=None)
        model = mock.Mock()
        model.transcribe.return_value = (iter([segment]), SimpleNamespace(language="hu"))
        with mock.patch.object(
            transcription, "probe_media", return_value={"duration": 2.0, "has_audio": True}
        ):
            with self.assertRaisesRegex(ValueError, "szóidőbélyegek"):
                transcription.run_batch(self.sources, lambda: model, "hu")
        self.assertFalse((self.output / "master_transcript.json").exists())

    def test_recursive_sources_and_both_identification_statuses_are_reported(self):
        nested = self.sources / "camera_b" / "day_1"
        nested.mkdir(parents=True)
        silent = nested / "clip.mp4"
        silent.write_bytes(b"silent")
        no_speech = self.sources / "clip.mp4"
        no_speech.write_bytes(b"audio without speech")
        model = mock.Mock()
        model.transcribe.return_value = (iter([]), SimpleNamespace(language="hu"))
        stderr = io.StringIO()
        with (
            mock.patch.object(
                transcription,
                "probe_media",
                side_effect=lambda p: {
                    "duration": 2.0,
                    "has_audio": p == no_speech.resolve(),
                },
            ),
            mock.patch("sys.stderr", stderr),
        ):
            manifest_path = transcription.run_batch(self.sources, lambda: model, "hu")
        manifest = json.loads(manifest_path.read_text())
        self.assertEqual(
            {r["status"] for r in manifest["recordings"]},
            {
                "no_audio",
                "no_detected_speech",
            },
        )
        self.assertEqual(len(manifest["recordings"]), 2)
        self.assertIn(str(silent.resolve()), stderr.getvalue())
        self.assertIn(str(no_speech.resolve()), stderr.getvalue())
        self.assertEqual(manifest_path.parent, self.output.resolve())

    def test_main_waits_for_input_path_and_does_not_ask_for_output(self):
        with (
            mock.patch("sys.argv", [str(SCRIPT_PATH)]),
            mock.patch("builtins.input", return_value=str(self.sources)) as ask,
            mock.patch.object(
                transcription, "run_batch", return_value=self.output / "master_transcript.json"
            ) as batch,
            mock.patch("sys.stdout", io.StringIO()),
        ):
            self.assertEqual(transcription.main(), 0)
        ask.assert_called_once()
        self.assertEqual(batch.call_args.args[0], self.sources)

    def test_empty_path_prevents_transcription(self):
        with (
            mock.patch("sys.argv", [str(SCRIPT_PATH)]),
            mock.patch("builtins.input", return_value=""),
            mock.patch.object(transcription, "run_batch") as batch,
            mock.patch("sys.stderr", io.StringIO()),
        ):
            self.assertEqual(transcription.main(), 1)
        batch.assert_not_called()


if __name__ == "__main__":
    unittest.main()
