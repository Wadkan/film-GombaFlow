"""Full CLI → active n8n webhook → local state tests; no YouTube API calls."""
import concurrent.futures
import json
import os
import pathlib
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]
CLI = ROOT / "local-workflows/youtube-meta-update/youtube_meta_update.py"
CONFIG = pathlib.Path(os.environ.get("YOUTUBE_META_TEST_CONFIG", pathlib.Path(
    os.environ.get("XDG_CONFIG_HOME", pathlib.Path.home() / ".config")
) / "film-gombaflow/youtube-meta-update.json"))


class YoutubeMetaConnectionFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not CONFIG.exists():
            raise RuntimeError("A valódi n8n flow-teszthez előbb futtasd: python3 n8n-workflows/scripts/install-youtube-meta-connection.py")
        cls.config = json.loads(CONFIG.read_text())
        if cls.config["webhook_url"] != "http://127.0.0.1:5678/webhook/youtube-meta-connection":
            raise RuntimeError("A flow-teszt kizárólag a helyi youtube-meta-connection webhookon futtatható.")

    def setUp(self):
        self.folder = tempfile.TemporaryDirectory(prefix="youtube-meta-flow-", dir="/tmp")
        self.addCleanup(self.folder.cleanup)
        self.meta_path = pathlib.Path(self.folder.name) / "meta.json"
        self.meta = {
            "status": "ready", "channelKey": "freezwithme",
            "youtubeChannelId": "UCTmNLnPDniFPocALLVSFoDg", "videoId": "connection-test-" + uuid.uuid4().hex,
            "title": "Kapcsolatpróba", "description": "Nincs YouTube-hívás.", "tags": ["test"],
            "categoryId": "19", "playlistId": "connection-test-playlist", "privacyStatus": "private",
            "youtube_scheduled_at": "2099-01-01T16:00:00+01:00",
        }
        self.meta_path.write_text(json.dumps(self.meta), encoding="utf-8")

    def invoke(self, command):
        return subprocess.run(["python3", str(CLI), command, str(self.meta_path), "--config", str(CONFIG)],
            text=True, capture_output=True, cwd=ROOT, timeout=10, check=False)

    def post(self, meta, operation="check", token=None):
        request = urllib.request.Request(self.config["webhook_url"], data=json.dumps(meta).encode(),
            headers={"Content-Type": "application/json", "X-Youtube-Meta-Operation": operation,
                self.config["header_name"]: token or self.config["header_value"]}, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            raw = error.read()
            try:
                body = json.loads(raw)
            except json.JSONDecodeError:
                body = {"message": raw.decode("utf-8", errors="replace")}
            return error.code, body

    def assert_failed_execution(self, execution_id):
        self.assertTrue(str(execution_id).isdigit())
        script = """
const sqlite3=require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db=new sqlite3.Database('/home/node/.n8n/database.sqlite',sqlite3.OPEN_READONLY);
db.get('SELECT status FROM execution_entity WHERE id=? AND workflowId=?',
 [process.argv[1],'youtubeMetaConnection'],(err,row)=>{if(err)throw err;console.log(JSON.stringify(row||{}));db.close();});
"""
        command = ["docker", "compose", "-f", str(ROOT / "n8n-docker/compose.yaml"),
            "exec", "-T", "n8n", "node", "-e", script, str(execution_id)]
        deadline = time.monotonic() + 5
        while True:
            result = subprocess.run(command, text=True, capture_output=True, check=True, timeout=3)
            status = json.loads(result.stdout).get("status")
            if status == "error" or time.monotonic() >= deadline:
                break
            time.sleep(0.1)
        self.assertEqual(status, "error", "A Respond to Webhook után az n8n futásnak hibásként kell lezárulnia.")

    def test_check_success_and_native_validation_failure(self):
        result = self.invoke("check")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertEqual(json.loads(result.stdout)["status"], "validated")
        self.assertEqual(json.loads(self.meta_path.read_text()), self.meta)
        invalid = dict(self.meta, title="")
        status, body = self.post(invalid)
        self.assertEqual(status, 400)
        self.assertEqual(body["status"], "error")
        self.assertEqual(body["step"], "input")
        self.assertFalse(body["partialSuccess"])
        self.assert_failed_execution(body["executionId"])
        date_status, date_body = self.post(dict(self.meta, youtube_scheduled_at="2099-02-31T16:00:00+01:00"))
        self.assertEqual(date_status, 400)
        self.assertEqual(date_body["code"], "INVALID_FIELDS")
        auth_status, _ = self.post(self.meta, token="intentionally-wrong-test-token")
        self.assertIn(auth_status, (401, 403))

    def test_update_rejects_non_allowlisted_video_and_local_reentry(self):
        result = self.invoke("update")
        self.assertEqual(result.returncode, 1, result.stderr + result.stdout)
        saved = json.loads(self.meta_path.read_text())
        self.assertEqual(saved["status"], "error")
        self.assertEqual(saved["updateResult"]["code"], "VIDEO_NOT_ALLOWED")
        self.assertFalse(saved["updateResult"]["youtubeModified"])
        self.assert_failed_execution(saved["updateResult"]["executionId"])
        repeated = self.invoke("update")
        self.assertEqual(repeated.returncode, 2)
        status, body = self.post(self.meta, "update")
        self.assertEqual(status, 403)
        self.assertEqual(body["code"], "VIDEO_NOT_ALLOWED")
        self.assert_failed_execution(body["executionId"])

    def test_concurrent_disallowed_webhooks_never_start_updates(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda _: self.post(self.meta, "update"), range(2)))
        self.assertEqual(sorted(status for status, _ in results), [403, 403])
        for _, body in results:
            self.assertFalse(body["youtubeModified"])
            self.assert_failed_execution(body["executionId"])

    def test_unexpected_native_command_failure_is_an_error_execution(self):
        # Exceeds Linux's single shell argument limit before the handler starts.
        # This exercises the native Execute Command error output, not only a domain error.
        status, body = self.post(dict(self.meta, description="x" * 150000))
        self.assertEqual(status, 500)
        self.assertEqual(body["status"], "error")
        self.assertEqual(body["code"], "NODE_FAILURE")
        self.assertFalse(body["partialSuccess"])
        self.assert_failed_execution(body["executionId"])


if __name__ == "__main__":
    unittest.main()
