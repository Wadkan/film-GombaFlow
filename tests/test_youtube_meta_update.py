import http.server
import json
import pathlib
import subprocess
import tempfile
import threading
import time
import unittest


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
CLI = REPO_ROOT / "local-workflows/youtube-meta-update/youtube_meta_update.py"
READY_META = {
    "status": "ready",
    "channelKey": "freezwithme",
    "youtubeChannelId": "UC-test-channel",
    "videoId": "video-123",
    "title": "Test title",
    "description": "Test description",
    "tags": ["test"],
    "categoryId": "19",
    "playlistId": "playlist-123",
    "privacyStatus": "private",
    "youtube_scheduled_at": "2099-01-01T16:00:00+01:00",
}


class WebhookHandler(http.server.BaseHTTPRequestHandler):
    response_status = 200
    response_body = {"status": "updated", "videoId": "video-123"}
    delay_seconds = 0
    drip_chunks = None
    drip_delay_seconds = 0
    received = []
    metadata_path = None
    local_status_on_receive = None

    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        type(self).received.append((self.path, self.headers.get("X-Webhook-Token"), body))
        if type(self).metadata_path:
            type(self).local_status_on_receive = json.loads(type(self).metadata_path.read_text())["status"]
        if type(self).delay_seconds:
            time.sleep(type(self).delay_seconds)
        data = json.dumps(type(self).response_body).encode()
        chunks = type(self).drip_chunks or [data]
        data = b"".join(chunks)
        self.send_response(type(self).response_status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        try:
            for index, chunk in enumerate(chunks):
                if index and type(self).drip_delay_seconds:
                    time.sleep(type(self).drip_delay_seconds)
                self.wfile.write(chunk)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def log_message(self, format, *args):
        pass


class YoutubeMetaUpdateIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), WebhookHandler)
        except PermissionError as exc:
            raise unittest.SkipTest(f"a sandbox nem enged helyi tesztwebhookot: {exc}") from exc
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=2)

    def setUp(self):
        WebhookHandler.response_status = 200
        WebhookHandler.response_body = {"status": "updated", "videoId": "video-123"}
        WebhookHandler.delay_seconds = 0
        WebhookHandler.drip_chunks = None
        WebhookHandler.drip_delay_seconds = 0
        WebhookHandler.received = []
        WebhookHandler.metadata_path = None
        WebhookHandler.local_status_on_receive = None
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.temp_dir = pathlib.Path(self.tmp.name)
        self.meta_path = self.temp_dir / "meta.json"
        self.meta_path.write_text(json.dumps(READY_META), encoding="utf-8")
        self.config_path = self.temp_dir / "client-config.json"
        self.config_path.write_text(
            json.dumps(
                {
                    "webhook_url": f"http://127.0.0.1:{self.server.server_port}/webhook/youtube-meta-update",
                    "header_name": "X-Webhook-Token",
                    "header_value": "secret-for-test",
                }
            ),
            encoding="utf-8",
        )
        self.config_path.chmod(0o600)

    def invoke(self, timeout="2"):
        return subprocess.run(
            [
                "python3",
                str(CLI),
                "update",
                str(self.meta_path),
                "--config",
                str(self.config_path),
                "--timeout",
                timeout,
            ],
            cwd=REPO_ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

    def read_meta(self):
        return json.loads(self.meta_path.read_text(encoding="utf-8"))

    def test_posts_ready_meta_and_persists_success_without_changing_metadata(self):
        WebhookHandler.metadata_path = self.meta_path
        result = self.invoke()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(WebhookHandler.received), 1)
        path, token, body = WebhookHandler.received[0]
        self.assertEqual(path, "/webhook/youtube-meta-update")
        self.assertEqual(token, "secret-for-test")
        self.assertEqual(json.loads(body), READY_META)
        self.assertEqual(WebhookHandler.local_status_on_receive, "updating")
        saved = self.read_meta()
        self.assertEqual(saved["status"], "updated")
        self.assertEqual(saved["updateResult"], {"status": "updated", "videoId": "video-123"})
        for key, value in READY_META.items():
            if key != "status":
                self.assertEqual(saved[key], value)

    def test_persists_error_returned_by_webhook(self):
        WebhookHandler.response_status = 400
        WebhookHandler.response_body = {"status": "error", "step": "video-update", "message": "invalid video"}

        result = self.invoke()

        self.assertNotEqual(result.returncode, 0)
        saved = self.read_meta()
        self.assertEqual(saved["status"], "error")
        self.assertEqual(
            saved["updateResult"],
            {**WebhookHandler.response_body, "httpStatus": 400},
        )

    def test_timeout_is_recorded_as_unknown_without_retry(self):
        WebhookHandler.delay_seconds = 0.3

        result = self.invoke(timeout="0.05")

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(WebhookHandler.received), 1)
        saved = self.read_meta()
        self.assertEqual(saved["status"], "unknown")
        self.assertEqual(saved["updateResult"]["status"], "unknown")
        self.assertIn("időkorlátot", saved["updateResult"]["message"].lower())

    def test_slow_drip_response_cannot_exceed_total_deadline(self):
        WebhookHandler.drip_chunks = [b'{"status":', b'"updated",', b'"videoId":', b'"video-123"}']
        WebhookHandler.drip_delay_seconds = 0.08

        result = self.invoke(timeout="0.15")

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(WebhookHandler.received), 1)
        saved = self.read_meta()
        self.assertEqual(saved["status"], "unknown")
        self.assertIn("teljes válasza túllépte az időkorlátot", saved["updateResult"]["message"])

    def test_parallel_and_repeated_updates_are_blocked(self):
        WebhookHandler.delay_seconds = 0.25
        command = ["python3", str(CLI), "update", str(self.meta_path), "--config", str(self.config_path)]
        first = subprocess.Popen(command, cwd=REPO_ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.addCleanup(lambda: first.poll() is None and first.kill())
        deadline = time.monotonic() + 2
        while not WebhookHandler.received and time.monotonic() < deadline:
            time.sleep(0.01)
        second = self.invoke()
        first.communicate(timeout=3)
        third = self.invoke()
        self.assertEqual(first.returncode, 0)
        self.assertNotEqual(second.returncode, 0)
        self.assertNotEqual(third.returncode, 0)
        self.assertEqual(len(WebhookHandler.received), 1)

    def test_check_does_not_change_meta_or_claim_youtube_update(self):
        WebhookHandler.response_body = {"status": "validated", "step": "connection", "youtubeModified": False}
        result = subprocess.run(
            ["python3", str(CLI), "check", str(self.meta_path), "--config", str(self.config_path)],
            cwd=REPO_ROOT, text=True, capture_output=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.read_meta(), READY_META)
        self.assertEqual(json.loads(result.stdout)["status"], "validated")


if __name__ == "__main__":
    unittest.main()
