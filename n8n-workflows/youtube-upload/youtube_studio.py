#!/usr/bin/env python3
"""Apply only Studio settings; never write metadata or call the n8n webhook."""

import argparse
import contextlib
import fcntl
import hashlib
import json
import os
import pathlib
import re
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
PROFILE = pathlib.Path.home() / ".config/film-gombaflow/youtube-studio"
ORIGIN = "https://studio.youtube.com"
LOGIN_HELP = "Futtasd: make -C n8n-workflows/youtube-upload login; jelentkezz be kézzel."


class StudioError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def read_meta(path):
    try:
        meta = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise StudioError("INVALID_INPUT", "Nem olvasható metaadat-JSON.") from exc
    if not isinstance(meta, dict) or meta.get("status") != "updated":
        raise StudioError("INVALID_INPUT", "A Studio kizárólag updated státuszt fogad el.")
    patterns = {
        "videoId": r"[A-Za-z0-9_-]{11}",
        "youtubeChannelId": r"UC[A-Za-z0-9_-]{22}",
        "playlistId": r"[A-Za-z0-9_-]{10,100}",
        "defaultLanguage": r"[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*",
    }
    for key, pattern in patterns.items():
        if not isinstance(meta.get(key), str) or not re.fullmatch(pattern, meta[key]):
            raise StudioError("INVALID_INPUT", f"Hiányzó vagy érvénytelen {key}.")
    result = meta.get("updateResult")
    if (
        not isinstance(result, dict)
        or result.get("status") != "updated"
        or result.get("step") != "verification"
        or result.get("videoId") != meta["videoId"]
        or result.get("partialSuccess") is not False
        or not isinstance(result.get("youtubeModified"), bool)
    ):
        raise StudioError(
            "INVALID_UPDATE_RESULT", "Sikeres, egyező videoId-jú n8n verification szükséges."
        )
    return meta


def profile_path(value):
    path = pathlib.Path(value).expanduser().resolve()
    # Deliberately only support a dedicated profile, never an existing daily browser profile.
    if path == ROOT or ROOT in path.parents or path.name != "youtube-studio":
        raise StudioError(
            "INVALID_PROFILE", "Repón kívüli, youtube-studio nevű külön profil szükséges."
        )
    return path


@contextlib.contextmanager
def profile_lock(path):
    key = hashlib.sha256(str(path).encode()).hexdigest()
    lock = pathlib.Path("/tmp") / f"film-gombaflow-studio-{os.getuid()}-{key}.lock"
    fd = os.open(lock, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    try:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise StudioError(
                "PROFILE_BUSY", "A Studio-profil már használatban van; zárd be a másik futást."
            ) from exc
        yield
    finally:
        os.close(fd)


# Identity evidence comes from the scoped rendered component, never its display name.
# Studio's Polymer data is read-only; no undocumented HTTP endpoints are called.
IDENTITY_JS = """(root, kind) => {
    const out = new Set();
    const keys = {channel:['channelId','externalChannelId'],
                  video:['videoId'], playlist:['playlistId']}[kind];
    const scan = (obj, depth=0, seen=new Set()) => {
        if (!obj || typeof obj !== 'object' || depth > 5 || seen.has(obj)) return;
        seen.add(obj);
        for (const [k,v] of Object.entries(obj)) {
            if (keys.includes(k) && typeof v === 'string') out.add(v);
            if (typeof v === 'object') scan(v, depth+1, seen);
        }
    };
    for (const el of [root, ...root.querySelectorAll('a[href]')]) {
        const attr = el.getAttribute('data-' + kind + '-id');
        if (attr) out.add(attr);
        if (el.href) {
            const u = new URL(el.href, location.href);
            const match = u.pathname.match(new RegExp('/'+kind+'/([^/]+)'));
            if (match) out.add(match[1]);
            if (kind === 'playlist' && u.searchParams.get('list')) out.add(u.searchParams.get('list'));
            if (kind === 'video' && u.searchParams.get('v')) out.add(u.searchParams.get('v'));
            if (kind === 'video' && u.hostname === 'youtu.be') out.add(u.pathname.slice(1));
        }
    }
    for (const key of ['data','video','videoDetails','channel','playlist','element']) scan(root[key]);
    return [...out];
}"""


class Studio:
    """Small fail-closed UI adapter. English UI requested explicitly via hl=en."""

    def __init__(self, page, meta, result, timeout=20000):
        self.page, self.meta, self.result = page, meta, result
        self.timeout = timeout
        self.editor = None
        page.set_default_timeout(timeout)
        page.set_default_navigation_timeout(timeout)

    def button(self, scope, name):
        # Custom Studio buttons do not consistently expose role=button.
        return scope.get_by_role("button", name=name, exact=True).or_(
            scope.locator("ytcp-button, tp-yt-paper-button").filter(
                has_text=re.compile(f"^{re.escape(name)}$")
            )
        )

    def require_identity(self, scope, kind, expected):
        scope.wait_for(state="visible")
        found = scope.evaluate(IDENTITY_JS, kind)
        if found != [expected]:
            raise StudioError(
                f"{kind.upper()}_MISMATCH",
                f"A(z) {kind} azonosító nem igazolható vagy eltér a JSON-tól.",
            )

    def check_session(self):
        if urlparse(self.page.url).netloc != urlparse(ORIGIN).netloc:
            raise StudioError("LOGIN_REQUIRED", LOGIN_HELP)
        if self.page.get_by_role("link", name="Sign in", exact=True).is_visible():
            raise StudioError("LOGIN_REQUIRED", LOGIN_HELP)

    def open_details(self):
        self.page.goto(
            f"{ORIGIN}/video/{self.meta['videoId']}/edit?hl=en", wait_until="domcontentloaded"
        )
        self.check_session()
        self.page.locator("ytcp-video-metadata-editor").wait_for(state="visible")
        self.check_session()
        # The channel avatar/link is scoped to the active navigation, not recommendations.
        self.require_identity(
            self.page.locator("ytcp-navigation-drawer"), "channel", self.meta["youtubeChannelId"]
        )
        self.require_identity(
            self.page.locator("ytcp-video-metadata-editor"), "video", self.meta["videoId"]
        )
        self.check_membership()

    def check_membership(self):
        self.button(self.page, "Playlists").click()
        dialog = self.page.locator("ytcp-playlist-dialog")
        dialog.wait_for(state="visible")
        selected = dialog.locator(
            'ytcp-playlist-row:has([aria-checked="true"]), ytcp-playlist-row[selected]'
        )
        ids = []
        for row in selected.all():
            ids.extend(row.evaluate(IDENTITY_JS, "playlist"))
        if self.meta["playlistId"] not in ids:
            raise StudioError(
                "PLAYLIST_MISMATCH",
                "A JSON playlistId nem igazolható a videó kijelölt playlistjei között.",
            )
        self.button(dialog, "Done").click()
        dialog.wait_for(state="hidden")

    def language_control(self):
        control = self.page.get_by_role("combobox", name="Video language", exact=True).or_(
            self.page.locator("#video-language")
        )
        if not control.is_visible():
            self.button(self.page, "Show more").click()
        control.wait_for(state="visible")
        return control

    def language_name(self):
        # Intl covers language codes without a channel-specific or two-language mapping.
        return self.page.evaluate(
            "code => new Intl.DisplayNames(['en'], {type:'language'}).of(code)",
            self.meta["defaultLanguage"],
        )

    def language_matches(self):
        control = self.language_control()
        if control.evaluate("el => el.tagName === 'SELECT'"):
            return control.input_value() == self.meta["defaultLanguage"]
        return control.inner_text().strip() == self.language_name()

    def set_language(self):
        if self.language_matches():
            return
        control = self.language_control()
        if control.evaluate("el => el.tagName === 'SELECT'"):
            control.select_option(self.meta["defaultLanguage"])
        else:
            control.click()
            self.page.get_by_role("option", name=self.language_name(), exact=True).click()
        self.result["steps"]["language"] = "save-unverified"
        self.button(self.page, "Save").click()
        # A disabled Save proves completion of the UI request, not persistence.
        from playwright.sync_api import expect

        expect(self.button(self.page, "Save")).to_be_disabled(timeout=self.timeout)

    def open_endscreen(self):
        self.button(self.page, "End screen").click()
        self.editor = self.page.locator("ytcp-endscreen-editor, ytve-endscreen-editor")
        self.editor.wait_for(state="visible")

    def elements(self):
        return self.editor.locator("ytcp-endscreen-element, ytve-endscreen-element")

    def element(self, name):
        return self.elements().filter(has=self.page.get_by_text(name, exact=True))

    def endscreen_matches(self):
        if self.elements().count() != 3:
            return False
        if any(self.element(name).count() != 1 for name in ("Video", "Playlist", "Subscribe")):
            return False
        self.element("Video").click()
        if not self.editor.get_by_role("radio", name="Best for viewer", exact=True).is_checked():
            return False
        self.element("Playlist").click()
        playlist = self.editor.locator("#playlist")
        if playlist.evaluate(IDENTITY_JS, "playlist") != [self.meta["playlistId"]]:
            return False
        self.element("Subscribe").click()
        subscribe = self.editor.locator("#subscribe")
        return subscribe.evaluate(IDENTITY_JS, "channel") == [self.meta["youtubeChannelId"]]

    def set_endscreen(self):
        self.open_endscreen()
        if self.endscreen_matches():
            self.button(self.editor, "Cancel").click()
            return
        # Replace the full layout instead of appending; repeated runs cannot duplicate it.
        for _ in range(4):  # YouTube supports at most four elements.
            if self.elements().count() == 0:
                break
            before = self.elements().count()
            self.elements().first.click()
            self.editor.get_by_role("button", name="Delete element", exact=True).click()
            from playwright.sync_api import expect

            expect(self.elements()).to_have_count(before - 1, timeout=self.timeout)
        if self.elements().count():
            raise StudioError(
                "UNSUPPORTED_LAYOUT", "A meglévő záróképernyő nem üríthető biztonságosan."
            )
        self.button(self.editor, "1 video, 1 playlist, 1 subscribe").click()
        from playwright.sync_api import expect

        expect(self.elements()).to_have_count(3, timeout=self.timeout)
        self.element("Video").click()
        self.editor.get_by_role("radio", name="Best for viewer", exact=True).check()
        self.element("Playlist").click()
        self.button(self.editor, "Choose playlist").click()
        chooser = self.page.locator("ytcp-playlist-picker")
        chooser.wait_for(state="visible")
        chooser.get_by_role("textbox", name="Search", exact=True).fill(self.meta["playlistId"])
        # Resolve by ID; a same-name playlist must never qualify.
        rows = chooser.locator("ytcp-playlist-row")
        self.page.wait_for_function(
            """({selector, id, identity}) => [...document.querySelectorAll(selector)]
                .some(el => (eval(identity))(el, 'playlist').includes(id))""",
            arg={
                "selector": "ytcp-playlist-picker ytcp-playlist-row",
                "id": self.meta["playlistId"],
                "identity": IDENTITY_JS,
            },
            timeout=self.timeout,
        )
        matches = [
            row
            for row in rows.all()
            if row.evaluate(IDENTITY_JS, "playlist") == [self.meta["playlistId"]]
        ]
        if len(matches) != 1:
            raise StudioError(
                "PLAYLIST_MISMATCH",
                "A záróképernyő-playlist ID alapján nem választható ki egyértelműen.",
            )
        matches[0].click()
        chooser.wait_for(state="hidden")
        if not self.endscreen_matches():
            raise StudioError(
                "ENDSCREEN_VALUES", "A három záróképernyő-elem értéke nem igazolható mentés előtt."
            )
        self.result["steps"]["endscreen"] = "save-unverified"
        self.button(self.editor, "Save").click()
        self.editor.wait_for(state="hidden")

    def run(self):
        self.result["step"] = "identity"
        self.open_details()
        self.result["steps"]["identity"] = "verified"
        self.result["step"] = "language"
        self.set_language()
        self.open_details()  # Full navigation, not an optimistic in-memory value.
        if not self.language_matches():
            raise StudioError("LANGUAGE_NOT_SAVED", "Újratöltés után nem egyezik a Video language.")
        self.result["steps"]["language"] = "verified"
        self.result["step"] = "endscreen"
        self.set_endscreen()
        self.open_details()
        self.open_endscreen()
        if not self.endscreen_matches():
            raise StudioError(
                "ENDSCREEN_NOT_SAVED", "Újranyitás után nem igazolható mindhárom záróképernyő-elem."
            )
        self.button(self.editor, "Cancel").click()
        self.result["steps"]["endscreen"] = "verified"
        self.result.update(status="success", step="verification")


def execute(args, result):
    meta = read_meta(args.meta.expanduser().resolve()) if args.command == "studio" else None
    if meta:
        result["videoId"] = meta["videoId"]
    profile = profile_path(args.profile)
    try:
        from playwright.sync_api import Error, sync_playwright
    except ImportError as exc:
        raise StudioError(
            "DEPENDENCY_MISSING", "Telepítsd a requirements.txt függőségeit a README szerint."
        ) from exc
    with profile_lock(profile), sync_playwright() as playwright:
        if not profile.exists() and args.command == "studio":
            raise StudioError("LOGIN_REQUIRED", LOGIN_HELP)
        profile.mkdir(parents=True, mode=0o700, exist_ok=True)
        profile.chmod(0o700)
        try:
            context = playwright.chromium.launch_persistent_context(
                str(profile),
                headless=False,
                locale="en-US",
                timeout=30000,
                args=["--disable-dev-shm-usage"],
            )
        except Error as exc:
            raise StudioError(
                "BROWSER_START_FAILED",
                "A böngésző nem indult. Telepítsd a Chromiumot; zárd be a profilt használó böngészőt.",
            ) from exc
        try:
            page = context.pages[0] if context.pages else context.new_page()
            if args.command == "login":
                page.goto(f"{ORIGIN}/?hl=en", wait_until="domcontentloaded", timeout=30000)
                print(
                    "Jelentkezz be kézzel, majd zárd be a böngészőablakot (legfeljebb 10 perc).",
                    file=sys.stderr,
                )
                # No input(), password access, page dumps, or authentication screenshots.
                context.wait_for_event("close", timeout=600000)
                result.update(status="success", step="login-window-closed", sessionVerified=False)
            else:
                Studio(page, meta, result).run()
        except (Error, AssertionError) as exc:
            # A login redirect can occur while an expected Studio component is awaited.
            if args.command == "studio" and urlparse(page.url).netloc != urlparse(ORIGIN).netloc:
                raise StudioError("LOGIN_REQUIRED", LOGIN_HELP) from exc
            raise StudioError(
                "UI_NOT_VERIFIABLE",
                "A Studio UI vagy mentése nem igazolható a timeouton belül; ellenőrizd kézzel a jelzett lépést.",
            ) from exc
        finally:
            context.close()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for command in ("login", "studio"):
        child = sub.add_parser(command)
        child.add_argument("--profile", default=str(PROFILE))
        if command == "studio":
            child.add_argument("meta", type=pathlib.Path)
    args = parser.parse_args(argv)
    result = {
        "status": "error",
        "step": "input",
        "steps": {"identity": "pending", "language": "pending", "endscreen": "pending"},
    }
    try:
        execute(args, result)
        code = 0
    except Exception as exc:
        # Keep stdout a single safe JSON response even for browser closure/assertion failures.
        known = isinstance(exc, (StudioError, OSError))
        message = (
            str(exc) if known else "Váratlan böngészőhiba; ellenőrizd kézzel a jelzett lépést."
        )
        result.update(
            code=getattr(exc, "code", "LOCAL_ERROR" if known else "AUTOMATION_FAILED"),
            message=message,
        )
        result["partialSuccess"] = any(
            result["steps"][s] == "verified" for s in ("language", "endscreen")
        )
        result["uncertainSteps"] = [
            s for s, state in result["steps"].items() if state == "save-unverified"
        ]
        if result["uncertainSteps"]:
            result["status"] = "unknown"
        print(message, file=sys.stderr)
        code = 2 if result["step"] == "input" else 1
    print(json.dumps(result, ensure_ascii=False))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
