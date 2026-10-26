import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest import mock

SCRIPT_PATH = (
    pathlib.Path(__file__).resolve().parents[1]
    / "local-workflows/youtube-meta-update/youtube_meta_update.py"
)
SPEC = importlib.util.spec_from_file_location("youtube_meta_update", SCRIPT_PATH)
youtube_meta_update = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(youtube_meta_update)


class WebhookConfigSecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.config_path = pathlib.Path(self.temp_dir.name) / "client-config.json"

    def write_config(self, url):
        self.config_path.write_text(
            json.dumps(
                {
                    "webhook_url": url,
                    "header_name": "X-Webhook-Token",
                    "header_value": "test-secret",
                }
            ),
            encoding="utf-8",
        )
        self.config_path.chmod(0o600)

    def test_load_config_rejects_remote_http_webhook(self):
        self.write_config("http://example.com/webhook/youtube-meta-update")

        with self.assertRaisesRegex(youtube_meta_update.ClientError, "HTTPS kell"):
            youtube_meta_update.load_config(self.config_path)

    def test_configure_rejects_remote_http_webhook(self):
        with (
            mock.patch("builtins.input", return_value="X-Webhook-Token"),
            mock.patch("getpass.getpass", return_value="test-secret"),
        ):
            with self.assertRaisesRegex(youtube_meta_update.ClientError, "HTTPS kell"):
                youtube_meta_update.configure(
                    self.config_path,
                    "http://example.com/webhook/youtube-meta-update",
                )

        self.assertFalse(self.config_path.exists())

    def test_http_loopback_webhooks_are_allowed_by_both_validation_paths(self):
        self.write_config("http://127.0.0.1:5678/webhook/youtube-meta-update")
        loaded = youtube_meta_update.load_config(self.config_path)
        self.assertEqual(loaded["webhook_url"], "http://127.0.0.1:5678/webhook/youtube-meta-update")

        configured_path = pathlib.Path(self.temp_dir.name) / "configured.json"
        with (
            mock.patch("builtins.input", return_value="X-Webhook-Token"),
            mock.patch("getpass.getpass", return_value="test-secret"),
        ):
            result = youtube_meta_update.configure(
                configured_path,
                "http://localhost:5678/webhook/youtube-meta-update",
            )

        self.assertEqual(result, 0)
        self.assertEqual(
            json.loads(configured_path.read_text(encoding="utf-8"))["webhook_url"],
            "http://localhost:5678/webhook/youtube-meta-update",
        )


if __name__ == "__main__":
    unittest.main()
