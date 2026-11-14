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
LOGIN_HELP = "A csatlakoztatott Chrome-ban jelentkezz be a megfelelő YouTube-csatornába."


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
    if not isinstance(meta.get("thumbnailPrompt"), str) or not meta["thumbnailPrompt"].strip():
        raise StudioError(
            "INVALID_INPUT",
            "Hiányzó vagy üres thumbnailPrompt; a jóváhagyott MD-ből szükséges átvenni.",
        )
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


def thumbnail_message(meta):
    return (
        "Készíts ehhez a kiválasztott videóhoz YouTube-thumbnailt az alábbi "
        "képgenerálási prompt alapján:\n\n" + meta["thumbnailPrompt"]
    )


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
        # Use the innermost matching control, not both a wrapper and its button.
        # Separate same-named controls deliberately remain a strict-mode error.
        pattern = re.compile(f"^{re.escape(name)}$") if isinstance(name, str) else name
        native = self.page.get_by_role("button", name=name, exact=isinstance(name, str))
        custom = self.page.locator("ytcp-button, tp-yt-paper-button").filter(has_text=pattern)
        return (
            scope.get_by_role("button", name=name, exact=isinstance(name, str))
            .filter(has_not=native)
            .or_(
                scope.locator("ytcp-button, tp-yt-paper-button")
                .filter(has_text=pattern)
                .filter(has_not=native)
                .filter(has_not=custom)
            )
        ).filter(visible=True)

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

    def open_details(self, check_playlist=True):
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
        if check_playlist:
            self.check_membership()

    def check_membership(self):
        self.button(self.page, re.compile(r"^(?:Select playlists|Playlists)$")).click()
        dialog = self.page.locator(
            "ytcp-playlist-dialog, ytcp-playlist-dialog tp-yt-paper-dialog"
        ).filter(visible=True)
        dialog.wait_for(state="visible")
        selected = dialog.locator(
            'ytcp-playlist-row:has([aria-checked="true"]), ytcp-playlist-row[selected], '
            'ytcp-checkbox-lit[test-id]:has([aria-checked="true"])'
        )
        from playwright.sync_api import expect

        expect(selected).not_to_have_count(0, timeout=self.timeout)
        ids = []
        for row in selected.all():
            ids.extend(row.evaluate(IDENTITY_JS, "playlist"))
            test_id = row.get_attribute("test-id")
            if test_id:
                ids.append(test_id)
        if self.meta["playlistId"] not in ids:
            raise StudioError(
                "PLAYLIST_MISMATCH",
                "A JSON playlistId nem igazolható a videó kijelölt playlistjei között.",
            )
        self.button(dialog, "Done").click()
        dialog.wait_for(state="hidden")

    # Scope identical Yes/No labels to their actual Studio components.
    DECLARATIONS = (
        ("madeForKids", "ytkc-made-for-kids-select", r"^No, it.s not made for kids$"),
        (
            "ageRestriction",
            "ytcp-age-restriction-select",
            r"^No, don.t restrict my video to viewers over 18 only$",
        ),
        (
            "paidPromotion",
            "ytcp-paid-product-placement-select",
            r"^No, my video doesn.t include paid promotion$",
        ),
        ("aiUse", "ytkp-altered-content-select", r"^No(?:, AI wasn.t used)?$"),
    )

    def declaration_control(self, key, component, label):
        control = self.page.locator(component).get_by_role("radio", name=re.compile(label))
        if not control.is_visible():
            if key == "ageRestriction":
                expand = self.button(self.page, re.compile(r"^Age restriction"))
            else:
                expand = self.button(self.page, "Show more")
            if expand.is_visible():
                expand.click()
        control.wait_for(state="visible")
        return control

    def set_declarations(self):
        from playwright.sync_api import expect

        changed = []
        # Selecting not-made-for-kids first makes the age restriction control available.
        for key, component, label in self.DECLARATIONS:
            self.result["steps"].setdefault(key, "pending")
            control = self.declaration_control(key, component, label)
            if not control.is_checked():
                control.click()
                expect(control).to_be_checked(timeout=self.timeout)
                changed.append(key)
        if changed:
            saved = self.page.get_by_text("Changes saved", exact=True)
            saved.wait_for(state="hidden", timeout=self.timeout)
            for key in changed:
                self.result["steps"][key] = "save-unverified"
            self.button(self.page, "Save").click()
            expect(self.button(self.page, "Save")).to_be_disabled(timeout=self.timeout)
            # Save is disabled while the request is still in flight. Wait for the
            # completion toast before navigation, otherwise the request can be cancelled.
            saved.wait_for(state="visible", timeout=self.timeout)

    def verify_declarations(self):
        from playwright.sync_api import expect

        for key, component, label in self.DECLARATIONS:
            control = self.declaration_control(key, component, label)
            expect(control).to_be_checked(timeout=self.timeout)
            self.result["steps"][key] = "verified"

    def language_control(self):
        control = (
            self.page.get_by_role("combobox", name="Video language", exact=True)
            .or_(self.page.locator("#video-language"))
            .or_(self.button(self.page, re.compile(r"^Video language(?:\s|$)")))
        )
        control = control.filter(has_not=control)
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
        # The closed control may also contain a label and help text. Inspect the
        # option's selection state instead of parsing those presentation strings.
        control.click()
        option = self.page.get_by_role("option", name=self.language_name(), exact=True)
        option.wait_for(state="visible")
        try:
            selected = option.get_attribute("aria-selected")
            if selected not in ("true", "false"):
                raise StudioError(
                    "LANGUAGE_SELECTION_UNVERIFIED",
                    "A nyelvválasztó kijelölt értéke nem igazolható.",
                )
            return selected == "true"
        finally:
            option.press("Escape")
            option.wait_for(state="hidden")

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
        self.editor = self.page.locator(
            "ytcp-endscreen-editor, ytve-endscreen-editor, ytve-modal-host tp-yt-paper-dialog"
        ).filter(visible=True)
        self.editor.wait_for(state="visible")

    def modern_endscreen(self):
        if not self.editor.locator("ytve-endscreen-editor-options-panel").count():
            return None
        markers = self.editor.locator("ytve-endscreen-marker[aria-label]")
        if not markers.count():
            return {"encryptedVideoId": self.meta["videoId"], "elements": []}
        playlist = self.editor.locator('ytve-endscreen-marker[aria-label^="Playlist:"]')
        if playlist.count() != 1:
            raise StudioError(
                "UNSUPPORTED_LAYOUT", "A meglévő elrendezés playlist-eleme nem egyértelmű."
            )
        playlist.click()
        self.editor.locator("ytve-endscreen-editor-playlist-element-options").wait_for(
            state="attached"
        )
        model = self.editor.locator("ytve-endscreen-editor-playlist-element-options").evaluate(
            """(e, id) => {
                const state = e.polymerController?.__store?.store?.getState?.();
                return state?.videoEditorState?.timelineHistory?.present?.editors?.ENDSCREEN?.endscreen
                    ?? state?.entityCache?.entitiesWithoutMask?.['#CreatorEndscreenData']?.[id]?.data;
            }""",
            self.meta["videoId"],
        )
        models = [model] if model else []
        if len(models) != 1 or models[0].get("encryptedVideoId") != self.meta["videoId"]:
            raise StudioError(
                "ENDSCREEN_MODEL_UNVERIFIED", "A videó záróképernyő-modellje nem igazolható."
            )
        return models[0]

    def close_endscreen(self):
        self.button(self.editor, re.compile(r"^(?:Cancel|Discard changes)$")).click()

    def set_modern_endscreen(self):
        from playwright.sync_api import expect

        if self.endscreen_matches():
            self.close_endscreen()
            return
        markers = self.editor.locator("ytve-endscreen-marker[aria-label]")
        for _ in range(4):
            if not markers.count():
                break
            before = markers.count()
            markers.first.click()
            self.button(self.editor, "Delete element").click()
            expect(markers).to_have_count(before - 1, timeout=self.timeout)
        if markers.count():
            raise StudioError("UNSUPPORTED_LAYOUT", "A záróképernyő nem üríthető biztonságosan.")
        self.editor.get_by_role(
            "gridcell", name="1 video, 1 playlist, 1 subscribe", exact=True
        ).click()
        expect(markers).to_have_count(3, timeout=self.timeout)
        self.editor.locator('ytve-endscreen-marker[aria-label^="Playlist:"]').click()
        self.editor.locator('#playlist-select div[role="button"]').click()
        chooser = self.page.locator("ytcp-playlist-pick-dialog")
        cards = chooser.locator("ytcp-entity-card")
        chooser.locator("#search-any").wait_for(state="visible")
        matches = [
            c
            for c in cards.all()
            if c.evaluate(IDENTITY_JS, "playlist") == [self.meta["playlistId"]]
        ]
        if len(matches) != 1:
            raise StudioError(
                "PLAYLIST_MISMATCH", "A playlist nem választható ki ID alapján egyértelműen."
            )
        matches[0].click()
        expect(
            self.editor.locator('ytve-endscreen-marker[aria-label="Playlist: ..."]')
        ).to_have_count(0, timeout=self.timeout)
        if not self.endscreen_matches():
            raise StudioError("ENDSCREEN_VALUES", "A három elem nem igazolható mentés előtt.")
        self.result["steps"]["endscreen"] = "save-unverified"
        self.button(self.editor, "Save").click()
        self.editor.wait_for(state="hidden")

    def elements(self):
        return self.editor.locator("ytcp-endscreen-element, ytve-endscreen-element")

    def element(self, name):
        return self.elements().filter(has=self.page.get_by_text(name, exact=True))

    def endscreen_matches(self):
        model = self.modern_endscreen()
        if model is not None:
            elements = model.get("elements", [])
            if len(elements) != 3:
                return False
            videos = [e["videoEndscreenElement"] for e in elements if "videoEndscreenElement" in e]
            playlists = [
                e["playlistEndscreenElement"] for e in elements if "playlistEndscreenElement" in e
            ]
            channels = [
                e["channelEndscreenElement"] for e in elements if "channelEndscreenElement" in e
            ]
            return (
                len(videos) == len(playlists) == len(channels) == 1
                and videos[0].get("videoType") == "VIDEO_TYPE_BEST_FOR_VIEWER"
                and playlists[0].get("playlistId") == self.meta["playlistId"]
                and channels[0].get("isSubscribe") is True
                and (channels[0].get("channelId") or self.meta["youtubeChannelId"])
                == self.meta["youtubeChannelId"]
            )
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
        if self.modern_endscreen() is not None:
            return self.set_modern_endscreen()
        if self.endscreen_matches():
            self.close_endscreen()
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
        self.result["step"] = "declarations"
        self.set_declarations()
        self.open_details(check_playlist=False)
        self.verify_declarations()
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
        self.close_endscreen()
        self.result["steps"]["endscreen"] = "verified"
        self.result.update(status="success", step="verification")

    def prepare_thumbnail(self):
        """Prepare a draft only; the user sends it and owns generation."""
        from playwright.sync_api import expect

        self.result.update(status="error", step="thumbnail")
        self.result["steps"]["thumbnail"] = "pending"
        self.check_session()
        heading = self.page.get_by_role("heading", name="Ask Studio", exact=True)
        if not heading.is_visible():
            self.button(self.page, "Ask Studio").click()
        heading.wait_for(state="visible")
        self.page.get_by_label("Ask something", exact=True).wait_for(state="visible")
        panel = heading.locator("xpath=..")
        for _ in range(8):
            if panel.get_by_label("Ask something", exact=True).count():
                break
            panel = panel.locator("xpath=..")
        prompt = panel.get_by_label("Ask something", exact=True)
        prompt.wait_for(state="visible")
        existing = (
            prompt.input_value()
            if prompt.evaluate("el => el.matches('input, textarea')")
            else prompt.inner_text()
        )
        message = thumbnail_message(self.meta)
        if existing.strip() and existing != message:
            raise StudioError(
                "ASK_STUDIO_DRAFT_EXISTS", "Az Ask Studio meglévő piszkozatát nem írtam felül."
            )
        self.attach_thumbnail_video(panel)
        prompt.fill(message)
        if prompt.evaluate("el => el.matches('input, textarea')"):
            expect(prompt).to_have_value(message, timeout=self.timeout)
        else:
            expect(prompt).to_have_text(message, use_inner_text=True, timeout=self.timeout)
        self.page.bring_to_front()
        self.result["steps"]["thumbnail"] = "prepared"
        self.result.update(status="success", step="handoff", generationStarted=False)

    def attach_thumbnail_video(self, panel):
        if panel.get_by_role("button", name="Remove", exact=True).count():
            # Existing context must have independent ID evidence; never replace it silently.
            images = panel.locator('img[src*="/vi/"], img[src*="/vi_webp/"]')
            expected = panel.locator(
                f'img[src*="/vi/{self.meta["videoId"]}/"], img[src*="/vi_webp/{self.meta["videoId"]}/"]'
            )
            if (
                images.count() == expected.count() == 1
                and panel.get_by_role("button", name="Remove", exact=True).count() == 1
            ):
                return
            self.require_identity(panel, "video", self.meta["videoId"])
            return
        self.button(panel, "Add files, reference videos, and more").click()
        self.page.get_by_role("menuitem", name="Select your video", exact=True).click()
        self.page.get_by_role("combobox", name="Search your video", exact=True).fill(
            self.meta["videoId"]
        )
        videos = self.page.get_by_role("listbox", name="Retrieved videos", exact=True)
        videos.wait_for(state="visible")
        # Thumbnail URLs identify videos even when a picker row has no video link.
        image = videos.locator(
            f'img[src*="/vi/{self.meta["videoId"]}/"], img[src*="/vi_webp/{self.meta["videoId"]}/"]'
        )
        image.wait_for(state="visible")
        label = image.get_attribute("alt") or ""
        title = label.removeprefix("Video thumbnail: ").strip()
        if not title:
            raise StudioError(
                "ASK_STUDIO_VIDEO_UNVERIFIED", "A kiválasztott videó címkéje nem igazolható."
            )
        option = image.locator('xpath=ancestor::*[@role="option" or self::button][1]')
        (option if option.count() else image).click()
        videos.wait_for(state="hidden")
        self.button(panel, title).wait_for(state="visible")
        self.button(panel, "Remove").wait_for(state="visible")


def cdp_endpoint(value):
    if value == "auto":
        # Playwright 1.65 resolves Chrome's UI-enabled debugging endpoint natively.
        return "chrome"
    try:
        parsed = urlparse(value)
        valid = (
            parsed.scheme in {"http", "ws"}
            and parsed.hostname in {"localhost", "127.0.0.1", "::1"}
            and parsed.port is not None
            and not parsed.username
            and not parsed.password
            and not parsed.query
            and not parsed.fragment
        )
    except ValueError:
        valid = False
    if not valid:
        raise StudioError(
            "INVALID_CDP_ENDPOINT", "Porttal megadott helyi HTTP vagy WebSocket CDP-cím szükséges."
        )
    return value


def execute_connected(playwright, endpoint, meta, result):
    from playwright.sync_api import Error

    # Never launch, close, or copy the user's browser/profile. Playwright disconnects
    # when its driver exits; the new Studio tab remains available for manual work.
    print(
        "Kapcsolódás a futó Chrome-hoz; ha új engedélykérés jelenik meg, fogadd el.",
        file=sys.stderr,
        flush=True,
    )
    try:
        browser = playwright.chromium.connect_over_cdp(endpoint, timeout=120000, no_defaults=True)
    except Error as exc:
        raise StudioError(
            "CDP_CONNECTION_FAILED",
            "A Chrome CDP-kapcsolata vagy meglévő lapjainak inicializálása nem fejeződött be. "
            "Ez kapcsolati, engedélyezési vagy nem válaszoló lapból eredő hiba is lehet; "
            "a videó módosítása még nem indult el.",
        ) from exc
    print("Chrome csatlakoztatva; a Studio ellenőrzése indul.", file=sys.stderr, flush=True)
    if len(browser.contexts) != 1:
        raise StudioError(
            "BROWSER_CONTEXT_AMBIGUOUS", "Pontosan egy Chrome böngészőkörnyezet szükséges."
        )
    page = browser.contexts[0].new_page()
    page.bring_to_front()
    try:
        adapter = Studio(page, meta, result)
        adapter.run()
        adapter.prepare_thumbnail()
        page.bring_to_front()
        print(
            "Az Ask Studio promptja kitöltve, nincs elküldve. A Chrome-lap nyitva marad; innen te veszed át.",
            file=sys.stderr,
            flush=True,
        )
    except (Error, AssertionError) as exc:
        if urlparse(page.url).netloc != urlparse(ORIGIN).netloc:
            raise StudioError("LOGIN_REQUIRED", LOGIN_HELP) from exc
        raise StudioError(
            "UI_NOT_VERIFIABLE",
            "A Studio UI vagy mentése nem igazolható; ellenőrizd a nyitva hagyott Studio-lapot.",
        ) from exc


def execute(args, result):
    meta = read_meta(args.meta.expanduser().resolve()) if args.command == "studio" else None
    if meta:
        result["videoId"] = meta["videoId"]
    try:
        from playwright.sync_api import Error, sync_playwright
    except ImportError as exc:
        raise StudioError(
            "DEPENDENCY_MISSING", "Telepítsd a requirements.txt függőségeit a README szerint."
        ) from exc
    if args.command == "studio":
        endpoint = cdp_endpoint(args.cdp_endpoint)
        lock_key = pathlib.Path("/tmp") / (
            "youtube-cdp-" + hashlib.sha256(endpoint.encode()).hexdigest()
        )
        with profile_lock(lock_key), sync_playwright() as playwright:
            execute_connected(playwright, endpoint, meta, result)
        return
    profile = profile_path(args.profile)
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
        if command == "studio":
            child.add_argument("meta", type=pathlib.Path)
            child.add_argument(
                "--cdp-endpoint", default=os.environ.get("YOUTUBE_STUDIO_CDP_ENDPOINT", "auto")
            )
        else:
            child.add_argument("--profile", default=str(PROFILE))
    args = parser.parse_args(argv)
    result = {
        "status": "error",
        "step": "input",
        "steps": {
            "identity": "pending",
            "madeForKids": "pending",
            "ageRestriction": "pending",
            "paidPromotion": "pending",
            "aiUse": "pending",
            "language": "pending",
            "endscreen": "pending",
        },
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
            status="error",
            code=getattr(exc, "code", "LOCAL_ERROR" if known else "AUTOMATION_FAILED"),
            message=message,
        )
        result["partialSuccess"] = any(
            state == "verified" for key, state in result["steps"].items() if key != "identity"
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
