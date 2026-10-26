#!/usr/bin/env python3
"""Send an approved YouTube metadata JSON file to the n8n update webhook."""

from __future__ import annotations

import argparse
import contextlib
import datetime
import fcntl
import getpass
import hashlib
import ipaddress
import json
import os
import pathlib
import re
import stat
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request


REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = pathlib.Path(
    os.environ.get("XDG_CONFIG_HOME", pathlib.Path.home() / ".config")
) / "film-gombaflow" / "youtube-meta-update.json"
REQUIRED_META_FIELDS = {
    "status",
    "channelKey",
    "youtubeChannelId",
    "videoId",
    "title",
    "description",
    "tags",
    "categoryId",
    "playlistId",
    "privacyStatus",
    "youtube_scheduled_at",
}
FINAL_STATES = {"updated", "error", "unknown"}
MAX_TIMEOUT_SECONDS = 120


class ClientError(Exception):
    """A safe, user-facing client error."""


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate_webhook_url(url: str) -> None:
    try:
        parsed_url = urllib.parse.urlparse(url)
        hostname = parsed_url.hostname
    except (TypeError, ValueError) as exc:
        raise ClientError("webhook_url érvényes n8n production webhook URL legyen") from exc
    if (
        parsed_url.scheme not in {"http", "https"}
        or not parsed_url.netloc
        or parsed_url.username
        or parsed_url.password
        or "/webhook/" not in parsed_url.path
        or "/webhook-test/" in parsed_url.path
    ):
        raise ClientError("webhook_url érvényes n8n production webhook URL legyen")
    if parsed_url.scheme == "http":
        is_loopback = hostname == "localhost"
        if not is_loopback and hostname:
            try:
                is_loopback = ipaddress.ip_address(hostname).is_loopback
            except ValueError:
                is_loopback = False
        if not is_loopback:
            raise ClientError("HTTP webhook csak loopback címen engedélyezett; távoli címhez HTTPS kell")


def config_path(value: str | None) -> pathlib.Path:
    path = pathlib.Path(value).expanduser() if value else DEFAULT_CONFIG
    path = path.resolve()
    if path == REPO_ROOT or REPO_ROOT in path.parents:
        raise ClientError("a klienskonfiguráció nem kerülhet a repóba")
    return path


def load_config(path: pathlib.Path) -> dict:
    try:
        metadata = path.stat()
    except FileNotFoundError as exc:
        raise ClientError(
            f"hiányzik a klienskonfiguráció: {path}; futtasd a configure parancsot"
        ) from exc
    if os.name == "posix" and stat.S_IMODE(metadata.st_mode) & 0o077:
        raise ClientError(f"a klienskonfiguráció jogosultsága legyen 600: {path}")
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ClientError(f"nem olvasható klienskonfiguráció: {path}") from exc
    if not isinstance(config, dict):
        raise ClientError("a klienskonfigurációnak JSON objektumnak kell lennie")

    url = config.get("webhook_url")
    header_name = config.get("header_name")
    header_value = config.get("header_value")
    if not isinstance(url, str):
        raise ClientError("webhook_url érvényes n8n production webhook URL legyen")
    validate_webhook_url(url)
    if (
        not isinstance(header_name, str)
        or not re.fullmatch(r"[!#$%&'*+.^_`|~0-9A-Za-z-]+", header_name)
        or not isinstance(header_value, str)
        or not header_value
        or "\r" in header_value
        or "\n" in header_value
    ):
        raise ClientError("érvényes Header Auth fejlécnév és titok szükséges")
    return config


def read_ready_meta(path: pathlib.Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ClientError(f"nem olvasható meta JSON: {path}") from exc
    if not isinstance(value, dict):
        raise ClientError("a meta JSON gyökere objektum legyen")
    if value.get("status") != "ready":
        raise ClientError("csak ready státuszú meta JSON küldhető el")
    missing = sorted(REQUIRED_META_FIELDS - value.keys())
    if missing:
        raise ClientError("hiányzó kötelező metaadatmezők: " + ", ".join(missing))
    for name in REQUIRED_META_FIELDS - {"tags"}:
        if not isinstance(value[name], str) or not value[name].strip():
            raise ClientError(f"érvénytelen metaadatmező: {name}")
    if not isinstance(value["tags"], list) or any(not isinstance(tag, str) or not tag.strip() for tag in value["tags"]):
        raise ClientError("a tags szöveges címkék listája legyen")
    if len(value["title"]) > 100 or value["privacyStatus"] != "private":
        raise ClientError("legfeljebb 100 karakteres cím és private láthatóság szükséges")
    try:
        scheduled = datetime.datetime.fromisoformat(value["youtube_scheduled_at"].replace("Z", "+00:00"))
        if scheduled.tzinfo is None or scheduled <= datetime.datetime.now(datetime.timezone.utc):
            raise ValueError("not a future timezone-aware date")
    except ValueError as exc:
        raise ClientError("jövőbeli, időzónával megadott youtube_scheduled_at szükséges") from exc
    return value


def decode_result(body: bytes, http_status: int, operation: str = "update") -> dict:
    try:
        result = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        result = None
    states = FINAL_STATES | ({"validated"} if operation == "check" else set())
    if not isinstance(result, dict) or result.get("status") not in states:
        return {
            "status": "unknown",
            "httpStatus": http_status,
            "message": "a webhook nem adott vissza érvényes végállapotot JSON-ban",
        }
    if http_status < 200 or http_status >= 300:
        if result["status"] != "error":
            return {
                "status": "unknown",
                "httpStatus": http_status,
                "message": "a webhook hibás HTTP-státuszt adott vissza",
                "response": result,
            }
        result.setdefault("httpStatus", http_status)
    return result


def call_webhook(meta: dict, config: dict, timeout: float, operation: str = "update") -> dict:
    deadline = time.monotonic() + timeout
    encoded = json.dumps(meta, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        config["webhook_url"],
        data=encoded,
        headers={
            "Content-Type": "application/json",
            config["header_name"]: config["header_value"],
            "X-Youtube-Meta-Operation": operation,
        },
        method="POST",
    )
    result: dict[str, dict] = {}
    completed = threading.Event()

    def perform_request() -> None:
        try:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                return
            opener = urllib.request.build_opener(NoRedirectHandler)
            try:
                with opener.open(request, timeout=remaining) as response:
                    result["value"] = decode_result(response.read(), response.status, operation)
            except urllib.error.HTTPError as exc:
                result["value"] = decode_result(exc.read(), exc.code, operation)
            except (TimeoutError, urllib.error.URLError, OSError) as exc:
                reason = getattr(exc, "reason", exc)
                if isinstance(reason, TimeoutError) or "timed out" in str(reason).lower():
                    message = "a webhook válasza túllépte a teljes időkorlátot"
                else:
                    message = f"a webhook eredménye nem igazolható: {reason}"
                result["value"] = {"status": "unknown", "message": message}
        finally:
            completed.set()

    worker = threading.Thread(target=perform_request, name="youtube-meta-webhook", daemon=True)
    worker.start()
    remaining = max(0, deadline - time.monotonic())
    if not completed.wait(remaining):
        return {
            "status": "unknown",
            "message": f"a webhook teljes válasza túllépte az időkorlátot ({timeout:g} s); nem indult újrapróbálás",
        }
    if "value" not in result:
        return {"status": "unknown", "message": "a webhook nem adott vissza eredményt az időkorláton belül"}
    return result["value"]


@contextlib.contextmanager
def video_lock(meta: dict):
    """One host-wide lock per video, including callers using copied JSON files."""
    root = pathlib.Path("/tmp") / f"film-gombaflow-{os.getuid()}"
    root.mkdir(mode=0o700, exist_ok=True)
    if root.is_symlink() or root.stat().st_uid != os.getuid() or stat.S_IMODE(root.stat().st_mode) != 0o700:
        raise ClientError("a helyi zárolási könyvtár tulajdonosa vagy jogosultsága hibás")
    key = hashlib.sha256(f'{meta["youtubeChannelId"]}:{meta["videoId"]}'.encode()).hexdigest()
    descriptor = os.open(root / f"youtube-meta-{key}.lock", os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    try:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise ClientError("ehhez a videóhoz már fut helyi frissítés") from exc
        yield
    finally:
        os.close(descriptor)


def write_result(path: pathlib.Path, current: dict, result: dict) -> None:
    updated = dict(current)
    updated["status"] = result["status"]
    updated["updateResult"] = result
    original_mode = stat.S_IMODE(path.stat().st_mode)
    temporary_name = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", delete=False
        ) as temporary:
            temporary_name = temporary.name
            os.fchmod(temporary.fileno(), original_mode)
            json.dump(updated, temporary, ensure_ascii=False, indent=2)
            temporary.write("\n")
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_name, path)
    except OSError as exc:
        if temporary_name:
            try:
                os.unlink(temporary_name)
            except OSError:
                pass
        raise ClientError(f"nem sikerült a webhook eredményét visszaírni: {exc}") from exc


def configure(path: pathlib.Path, url_arg: str | None) -> int:
    if path.exists():
        raise ClientError(f"a konfiguráció már létezik: {path}; kézzel szerkeszd vagy töröld")
    url = url_arg or input("n8n production webhook URL: ").strip()
    header_name = input("Header Auth fejléc neve [X-Webhook-Token]: ").strip() or "X-Webhook-Token"
    header_value = getpass.getpass("Header Auth titok (nem jelenik meg): ")
    config = {"webhook_url": url, "header_name": header_name, "header_value": header_value}
    try:
        validate_webhook_url(url)
        if (
            not re.fullmatch(r"[!#$%&'*+.^_`|~0-9A-Za-z-]+", header_name)
            or not header_value
            or "\r" in header_value
            or "\n" in header_value
        ):
            raise ClientError("érvényes Header Auth fejlécnév és titok szükséges")
        path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        file_descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(file_descriptor, "w", encoding="utf-8") as destination:
            json.dump(config, destination, ensure_ascii=False, indent=2)
            destination.write("\n")
    except OSError as exc:
        raise ClientError(f"nem sikerült a klienskonfiguráció mentése: {exc}") from exc
    print(f"Klienskonfiguráció elmentve: {path}")
    return 0


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Jóváhagyott YouTube meta JSON küldése n8n-nek")
    commands = parser.add_subparsers(dest="command", required=True)
    configure_parser = commands.add_parser("configure", help="helyi webhook- és Header Auth-beállítás")
    configure_parser.add_argument("--config", help=f"klienskonfiguráció (alapértelmezett: {DEFAULT_CONFIG})")
    configure_parser.add_argument("--webhook-url")
    update_parser = commands.add_parser("update", help="ready meta JSON frissítése a YouTube-on")
    update_parser.add_argument("--config", help=f"klienskonfiguráció (alapértelmezett: {DEFAULT_CONFIG})")
    update_parser.add_argument("meta_json", type=pathlib.Path)
    update_parser.add_argument("--timeout", type=float, default=120)
    check_parser = commands.add_parser("check", help="kapcsolat és bemenet ellenőrzése YouTube-módosítás nélkül")
    check_parser.add_argument("--config")
    check_parser.add_argument("meta_json", type=pathlib.Path)
    check_parser.add_argument("--timeout", type=float, default=120)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        path = config_path(args.config)
        if args.command == "configure":
            return configure(path, args.webhook_url)
        if not 0 < args.timeout <= MAX_TIMEOUT_SECONDS:
            raise ClientError(f"a timeout 0 és {MAX_TIMEOUT_SECONDS} másodperc közé essen")
        meta_path = args.meta_json.expanduser().resolve(strict=True)
        current = read_ready_meta(meta_path)
        config = load_config(path)
        if args.command == "check":
            result = call_webhook(current, config, args.timeout, "check")
            print(json.dumps(result, ensure_ascii=False))
            return 0 if result["status"] == "validated" else 1
        with video_lock(current):
            current = read_ready_meta(meta_path)
            write_result(meta_path, current, {"status": "updating", "step": "dispatch"})
            result = call_webhook(current, config, args.timeout)
            write_result(meta_path, current, result)
        print(json.dumps(result, ensure_ascii=False))
        return 0 if result["status"] == "updated" else 1
    except ClientError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"fájlműveleti hiba: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
