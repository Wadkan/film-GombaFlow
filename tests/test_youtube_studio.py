"""Real Chromium + loopback HTML; no real authentication or YouTube requests."""

import copy
import http.server
import importlib.util
import json
import pathlib
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import MagicMock, patch

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "n8n-workflows/youtube-upload/youtube_studio.py"
spec = importlib.util.spec_from_file_location("youtube_studio", SCRIPT)
studio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(studio)
META = {
    "status": "updated",
    "videoId": "abcdefghijk",
    "youtubeChannelId": "UCabcdefghijklmnopqrstuv",
    "playlistId": "PLabcdefghijklmnopqrstuv",
    "defaultLanguage": "hu",
    "thumbnailPrompt": "Téli SUP-túra, kék háttér.\nFelirat: FAGYOS KALAND",
    "updateResult": {
        "status": "updated",
        "step": "verification",
        "videoId": "abcdefghijk",
        "partialSuccess": False,
        "youtubeModified": True,
    },
}


def result():
    return {
        "status": "error",
        "step": "input",
        "steps": {"identity": "pending", "language": "pending", "endscreen": "pending"},
    }


class InputTests(unittest.TestCase):
    def test_validation_and_file_immutability(self):
        with tempfile.TemporaryDirectory(dir="/tmp") as directory:
            path = pathlib.Path(directory) / "meta.json"
            original = json.dumps(META).encode()
            path.write_bytes(original)
            self.assertEqual(studio.read_meta(path), META)
            self.assertEqual(path.read_bytes(), original)
            path.write_text(json.dumps({k: v for k, v in META.items() if k != "thumbnailPrompt"}))
            with self.assertRaises(studio.StudioError):
                studio.read_meta(path)
            changes = [
                {"status": "ready"},
                {"status": "updating"},
                {"status": "unknown"},
                {"videoId": "../escape"},
                {"youtubeChannelId": "display name"},
                {"playlistId": "name"},
                {"defaultLanguage": ""},
                {"thumbnailPrompt": " "},
                {"thumbnailPrompt": None},
                {"updateResult": None},
            ]
            for change in changes:
                with self.subTest(change=change):
                    path.write_text(json.dumps(META | change))
                    with self.assertRaises(studio.StudioError):
                        studio.read_meta(path)
            for key, value in [
                ("status", "unknown"),
                ("videoId", "xxxxxxxxxxx"),
                ("step", "video-update"),
                ("partialSuccess", True),
                ("youtubeModified", None),
                ("youtubeModified", 0),
            ]:
                with self.subTest(key=key, value=value):
                    path.write_text(
                        json.dumps(META | {"updateResult": META["updateResult"] | {key: value}})
                    )
                    with self.assertRaises(studio.StudioError):
                        studio.read_meta(path)

    def test_json_stdout_and_nonzero_exit(self):
        process = subprocess.run(
            [sys.executable, str(SCRIPT), "studio", "/tmp/no-such-studio-meta.json"],
            capture_output=True,
            text=True,
        )
        self.assertEqual(process.returncode, 2)
        self.assertEqual(json.loads(process.stdout)["code"], "INVALID_INPUT")
        self.assertTrue(process.stderr)

    def test_profile_rejects_repository_and_daily_profile(self):
        for path in [
            ROOT / "youtube-studio",
            pathlib.Path.home() / "Library/Application Support/Google/Chrome",
        ]:
            with self.assertRaises(studio.StudioError):
                studio.profile_path(str(path))

    def test_profile_lock_rejects_concurrency(self):
        with tempfile.TemporaryDirectory(dir="/tmp") as directory:
            path = pathlib.Path(directory) / "youtube-studio"
            with (
                studio.profile_lock(path),
                self.assertRaises(studio.StudioError) as failure,
                studio.profile_lock(path),
            ):
                pass
            self.assertEqual(failure.exception.code, "PROFILE_BUSY")

    def test_partial_machine_result(self):
        def fail(args, output):
            output.update(step="endscreen")
            output["steps"].update(language="verified", endscreen="save-unverified")
            raise studio.StudioError("ENDSCREEN_NOT_SAVED", "not saved")

        import contextlib
        import io

        stdout = io.StringIO()
        with (
            patch.object(studio, "execute", fail),
            contextlib.redirect_stdout(stdout),
            contextlib.redirect_stderr(io.StringIO()),
        ):
            code = studio.main(["studio", "/tmp/meta.json"])
        output = json.loads(stdout.getvalue())
        self.assertEqual(code, 1)
        self.assertEqual(output["status"], "unknown")
        self.assertTrue(output["partialSuccess"])
        self.assertEqual(output["uncertainSteps"], ["endscreen"])
        self.assertEqual(output["step"], "endscreen")

    def test_manual_handoff_listens_before_announcing_and_waits_for_close(self):
        context = MagicMock()
        with patch("builtins.print") as announce:
            studio.manual_handoff(context)
        context.expect_event.assert_called_once_with("close", timeout=0)
        context.expect_event.return_value.__enter__.assert_called_once()
        context.expect_event.return_value.__exit__.assert_called_once()
        self.assertTrue(announce.call_args.kwargs["flush"])
        context.close.assert_not_called()


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = (ROOT / "tests/fixtures/youtube-studio.html").read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Missing Playwright/browser is an actionable failure, never a skipped green suite.
        from playwright.sync_api import sync_playwright

        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.addClassCleanup(cls.server.server_close)
        cls.addClassCleanup(cls.server.shutdown)
        cls.origin = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.addClassCleanup(cls.playwright.stop)
        cls.browser = cls.playwright.chromium.launch(headless=True)
        cls.addClassCleanup(cls.browser.close)

    def setUp(self):
        self.context = self.browser.new_context()
        self.addCleanup(self.context.close)
        self.external = []

        def route(request):
            if request.request.url.startswith(self.origin + "/"):
                request.continue_()
            else:
                self.external.append(request.request.url)
                request.abort()

        self.context.route("**/*", route)
        self.page = self.context.new_page()
        self.page.goto(self.origin)
        self.output = result()
        self.origin_patch = patch.object(studio, "ORIGIN", self.origin)
        self.origin_patch.start()
        self.addCleanup(self.origin_patch.stop)
        self.addCleanup(lambda: self.assertEqual(self.external, []))
        self.adapter = studio.Studio(self.page, copy.deepcopy(META), self.output, timeout=1500)

    def fault(self, value):
        self.page.evaluate("value => localStorage.setItem('fault', value)", value)

    def test_success_reload_and_idempotent_retry(self):
        self.adapter.run()
        self.assertEqual(self.output["status"], "success")
        self.assertEqual(self.output["steps"]["language"], "verified")
        before = self.page.evaluate("localStorage.getItem('elements')")
        self.adapter.run()
        self.assertEqual(self.page.evaluate("localStorage.getItem('elements')"), before)
        self.assertEqual(len(json.loads(before)), 3)
        self.assertEqual(self.page.locator("select").input_value(), "hu")

    def test_thumbnail_handoff_fills_without_sending(self):
        self.adapter.run()
        self.adapter.prepare_thumbnail()
        panel = self.page.locator("#ask-panel")
        self.assertEqual(panel.get_by_role("textbox").input_value(), studio.thumbnail_message(META))
        self.assertEqual(self.page.evaluate("window.sent || 0"), 0)
        self.assertEqual(self.output["steps"]["thumbnail"], "prepared")
        self.assertFalse(self.page.is_closed())

    def test_thumbnail_wrong_context_preserves_verified_settings(self):
        self.adapter.run()
        self.page.locator("#ask-attachment").evaluate("el => el.hidden=false")
        self.page.locator("#ask-video").evaluate("el => el.href='/video/xxxxxxxxxxx/edit'")
        with self.assertRaises(studio.StudioError):
            self.adapter.prepare_thumbnail()
        self.assertEqual(self.output["steps"]["language"], "verified")
        self.assertEqual(self.output["steps"]["endscreen"], "verified")
        self.assertEqual(self.page.locator("#ask-panel").get_by_role("textbox").input_value(), "")

    def test_thumbnail_does_not_overwrite_existing_draft(self):
        self.adapter.run()
        self.page.locator("#ask-prompt").evaluate("el => el.value='Kézi piszkozat'")
        with self.assertRaises(studio.StudioError):
            self.adapter.prepare_thumbnail()
        self.assertEqual(self.page.locator("#ask-prompt").input_value(), "Kézi piszkozat")

    def test_thumbnail_supports_contenteditable_prompt(self):
        self.adapter.run()
        self.page.locator("#ask-prompt").evaluate("""el => {
            const box = document.createElement('div');
            box.id = 'ask-prompt'; box.contentEditable = 'true';
            box.setAttribute('role', 'textbox');
            box.setAttribute('aria-label', 'Ask something');
            el.replaceWith(box);
        }""")
        self.adapter.prepare_thumbnail()
        # Chromium renders blank paragraphs in contenteditable with extra separators.
        # The complete original thumbnail prompt must still survive unchanged.
        self.assertTrue(
            self.page.locator("#ask-prompt").inner_text().endswith(META["thumbnailPrompt"])
        )
        self.assertEqual(self.page.evaluate("window.sent || 0"), 0)

    def test_thumbnail_missing_target_video_never_fills_or_sends(self):
        from playwright.sync_api import TimeoutError as PlaywrightTimeout

        self.adapter.run()
        self.page.locator("#ask-picker img").evaluate("el => el.src='/vi/xxxxxxxxxxx/default.jpg'")
        with self.assertRaises(PlaywrightTimeout):
            self.adapter.prepare_thumbnail()
        self.assertEqual(self.page.locator("#ask-prompt").input_value(), "")
        self.assertEqual(self.page.evaluate("window.sent || 0"), 0)

    def test_custom_studio_language_dropdown(self):
        self.fault("custom-language")
        self.adapter.run()
        self.assertEqual(self.output["status"], "success")
        self.assertEqual(self.page.locator("#video-language").inner_text(), "Hungarian")

    def test_nested_buttons_resolve_to_one_click_target(self):
        self.page.set_content("""
            <ytcp-button role="button" aria-label="End screen">
                <button onclick="window.clicked=(window.clicked||0)+1">End screen</button>
            </ytcp-button>""")
        target = self.adapter.button(self.page, "End screen")
        self.assertEqual(target.count(), 1)
        target.click()
        self.assertEqual(self.page.evaluate("window.clicked"), 1)

    def test_custom_button_without_native_role_remains_supported(self):
        self.page.set_content("""<ytcp-button onclick="window.clicked=true">Save</ytcp-button>""")
        self.adapter.button(self.page, "Save").click()
        self.assertTrue(self.page.evaluate("window.clicked"))

    def test_separate_same_named_buttons_remain_ambiguous(self):
        self.page.set_content("<button>Save</button><button>Save</button>")
        self.assertEqual(self.adapter.button(self.page, "Save").count(), 2)

    def test_composite_language_button_updates_and_verifies_selected_option(self):
        self.fault("composite-language")
        self.adapter.run()
        self.assertEqual(self.output["status"], "success")
        self.assertEqual(self.page.evaluate("localStorage.getItem('language')"), "hu")
        saves = self.page.evaluate("localStorage.getItem('saves')")
        self.adapter.run()
        self.assertEqual(self.page.evaluate("localStorage.getItem('saves')"), saves)

    def test_composite_language_does_not_treat_help_text_as_selected_value(self):
        self.fault("composite-language")
        self.adapter.open_details()
        self.page.get_by_role("button", name="Video language", exact=False).evaluate(
            "el => el.textContent='Video language Hungarian is available. English'"
        )
        self.assertFalse(self.adapter.language_matches())

    def test_language_id_wrapper_does_not_duplicate_inner_button(self):
        self.fault("composite-language")
        self.adapter.open_details()
        self.page.get_by_role("button", name="Video language", exact=False).evaluate("""el => {
            const wrapper = document.createElement('div');
            wrapper.id = 'video-language';
            el.replaceWith(wrapper); wrapper.append(el);
        }""")
        self.assertEqual(self.adapter.language_control().count(), 1)
        self.assertFalse(self.adapter.language_matches())

    def test_identity_can_be_read_from_scoped_component_data(self):
        self.page.locator("ytcp-video-metadata-editor").evaluate(
            "el => {el.querySelector('a').remove(); el.video={videoId:'abcdefghijk'};}"
        )
        self.adapter.require_identity(
            self.page.locator("ytcp-video-metadata-editor"), "video", META["videoId"]
        )
        self.page.locator("ytcp-video-metadata-editor").evaluate(
            "el => el.video={videoId:'xxxxxxxxxxx'}"
        )
        with self.assertRaises(studio.StudioError):
            self.adapter.require_identity(
                self.page.locator("ytcp-video-metadata-editor"), "video", META["videoId"]
            )

    def test_save_timeout_is_bounded_and_remains_unverified(self):
        from playwright.sync_api import TimeoutError as PlaywrightTimeout

        self.fault("language-timeout")
        with self.assertRaises((PlaywrightTimeout, AssertionError)):
            self.adapter.run()
        self.assertEqual(self.output["steps"]["language"], "save-unverified")
        self.assertEqual(self.output["steps"]["endscreen"], "pending")

    def test_mismatches_stop_before_writes(self):
        for fault, code in [
            ("channel", "CHANNEL_MISMATCH"),
            ("video", "VIDEO_MISMATCH"),
            ("membership", "PLAYLIST_MISMATCH"),
            ("login", "LOGIN_REQUIRED"),
        ]:
            with self.subTest(fault=fault):
                self.fault(fault)
                with self.assertRaises(studio.StudioError) as failure:
                    self.adapter.run()
                self.assertEqual(failure.exception.code, code)
                self.assertIsNone(self.page.evaluate("localStorage.getItem('language')"))
                self.assertIsNone(self.page.evaluate("localStorage.getItem('elements')"))

    def test_language_save_must_survive_reload(self):
        self.fault("language-save")
        with self.assertRaises(studio.StudioError) as failure:
            self.adapter.run()
        self.assertEqual(failure.exception.code, "LANGUAGE_NOT_SAVED")
        self.assertEqual(self.output["steps"]["language"], "save-unverified")
        self.assertEqual(self.output["steps"]["endscreen"], "pending")

    def test_end_save_must_survive_reopening(self):
        self.fault("end-save")
        with self.assertRaises(studio.StudioError) as failure:
            self.adapter.run()
        self.assertEqual(failure.exception.code, "ENDSCREEN_NOT_SAVED")
        self.assertEqual(self.output["steps"]["language"], "verified")
        self.assertEqual(self.output["steps"]["endscreen"], "save-unverified")

    def test_wrong_subscribe_identity_rejected(self):
        self.fault("subscribe")
        with self.assertRaises(studio.StudioError) as failure:
            self.adapter.run()
        self.assertEqual(failure.exception.code, "ENDSCREEN_VALUES")
        self.assertIsNone(self.page.evaluate("localStorage.getItem('elements')"))

    def test_existing_duplicates_replaced_and_same_name_playlist_resolved_by_id(self):
        self.page.evaluate(
            "localStorage.setItem('elements', JSON.stringify([{type:'Video'},{type:'Video'},{type:'Playlist',id:'wrong'},{type:'Subscribe',id:'wrong'}]))"
        )
        self.adapter.run()
        saved = json.loads(self.page.evaluate("localStorage.getItem('elements')"))
        self.assertEqual([el["type"] for el in saved], ["Video", "Playlist", "Subscribe"])
        self.assertEqual(saved[1]["id"], META["playlistId"])

    def test_persistent_profile_reopens_session(self):
        with tempfile.TemporaryDirectory(dir="/tmp") as folder:
            profile = str(pathlib.Path(folder) / "youtube-studio")
            for iteration in range(2):
                with self.playwright.chromium.launch_persistent_context(
                    profile, headless=True
                ) as context:
                    context.route(
                        "**/*",
                        lambda route: (
                            route.continue_()
                            if route.request.url.startswith(self.origin + "/")
                            else route.abort()
                        ),
                    )
                    page = context.pages[0]
                    page.goto(self.origin)
                    if iteration == 0:
                        page.evaluate("localStorage.setItem('session-marker', 'kept')")
                    else:
                        self.assertEqual(
                            page.evaluate("localStorage.getItem('session-marker')"), "kept"
                        )
