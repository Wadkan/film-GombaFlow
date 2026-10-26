#!/usr/bin/env python3
"""Create and clean up a local source transcript for Gomba 1."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from urllib.parse import parse_qs, urlparse


WORKFLOW_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = WORKFLOW_DIR / "projects"
REGISTRY_PATH = PROJECTS_DIR / "registry.json"
TOPIC_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$")


class TaskError(Exception):
    def __init__(self, step: str, reason: str):
        super().__init__(f"{step}: {reason}")


def topic_paths(topic_id: str, project_name: str | None = None) -> tuple[Path, Path, Path]:
    if not TOPIC_RE.fullmatch(topic_id) or topic_id in {".", ".."}:
        raise TaskError("topic-id", "csak betű, szám, pont, kötőjel és aláhúzásjel használható")
    project_dir = PROJECTS_DIR / (project_name or topic_id)
    audio_dir = project_dir / "source-audio"
    return project_dir, audio_dir, audio_dir / "audio-path.json"


def youtube_video_id(url: str) -> str:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host in {"youtu.be", "www.youtu.be"}:
        video_id = parsed.path.strip("/").split("/")[0]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"}:
        video_id = parse_qs(parsed.query).get("v", [None])[0]
        if not video_id:
            match = re.match(r"^/(?:shorts|embed)/([^/?]+)", parsed.path)
            video_id = match.group(1) if match else None
    else:
        video_id = None
    if not video_id or not re.fullmatch(r"[A-Za-z0-9_-]{6,20}", video_id):
        raise TaskError("URL ellenőrzés", "érvényes YouTube videó URL szükséges")
    return video_id


def selected_idea(path_text: str, video_id: str) -> tuple[Path, list[str], int, str, str | None]:
    path = Path(path_text).expanduser().resolve()
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise TaskError("ötletfájl", str(exc)) from exc
    for index, line in enumerate(lines):
        match = re.match(r"^##\s+(?:\d+\.\s+)?\[(.+?)\]\((https?://.+)\)\s*$", line)
        if not match:
            continue
        heading_id = youtube_video_id(html.unescape(match.group(2).replace("\\&", "&")))
        if heading_id == video_id:
            end = next((i for i in range(index + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
            existing_id = None
            for entry_line in lines[index + 1:end]:
                id_match = re.match(r"^-\s+Gomba 1 ID:\s*([A-Za-z0-9._-]+)\s*$", entry_line)
                if id_match:
                    existing_id = id_match.group(1)
                    break
            return path, lines, index, html.unescape(match.group(1)), existing_id
    raise TaskError("ötletfájl", f"nem található benne a kiválasztott YouTube videó: {video_id}")


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        return {"version": 1, "next_id": 1, "videos": {}}
    try:
        registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
        if registry.get("version") != 1 or not isinstance(registry.get("videos"), dict):
            raise ValueError("ismeretlen registry formátum")
        if any(not isinstance(record, dict) for record in registry["videos"].values()):
            raise ValueError("érvénytelen videórekord")
        return registry
    except (OSError, json.JSONDecodeError, AttributeError, ValueError) as exc:
        raise TaskError("ID registry olvasása", str(exc)) from exc


def save_registry(registry: dict) -> None:
    try:
        REGISTRY_PATH.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except OSError as exc:
        raise TaskError("ID registry mentése", str(exc)) from exc


def title_slug(title: str) -> str:
    ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii").lower()
    words = re.findall(r"[a-z0-9]+", ascii_title)[:4]
    slug = "-".join(words) or "video"
    return slug[:60].rstrip("-")


def next_topic_id(registry: dict, title: str) -> str:
    next_id = max(1, int(registry.get("next_id", 1)))
    for directory in PROJECTS_DIR.iterdir():
        if directory.is_dir():
            match = re.match(r"^(\d+)-", directory.name)
            if match:
                next_id = max(next_id, int(match.group(1)) + 1)
    for record in registry["videos"].values():
        match = re.match(r"^(\d+)-", str(record.get("topic_id", "")))
        if match:
            next_id = max(next_id, int(match.group(1)) + 1)
    registry["next_id"] = next_id + 1
    return f"{next_id}-{title_slug(title)}"


def save_idea_id(path: Path, lines: list[str], heading_index: int, topic_id: str) -> None:
    end = next((i for i in range(heading_index + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
    id_lines = [i for i in range(heading_index + 1, end) if re.match(r"^-\s+Gomba 1 ID:", lines[i])]
    if id_lines:
        current = re.match(r"^-\s+Gomba 1 ID:\s*([A-Za-z0-9._-]+)\s*$", lines[id_lines[0]])
        if not current or current.group(1) != topic_id:
            raise TaskError("ötletfájl ID", f"az ötlethez már más Gomba 1 ID tartozik: {lines[id_lines[0]]}")
        return
    lines.insert(heading_index + 1, f"- Gomba 1 ID: {topic_id}")
    try:
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    except OSError as exc:
        raise TaskError("ötletfájl ID mentése", str(exc)) from exc


def existing_transcript(video_id: str) -> tuple[str, Path] | None:
    matches: list[tuple[str, Path]] = []
    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        transcript_path = project_dir / "source-transcript.md"
        if not transcript_path.is_file():
            continue
        try:
            content = transcript_path.read_text(encoding="utf-8")
        except OSError as exc:
            raise TaskError("korábbi transcript ellenőrzése", str(exc)) from exc
        for candidate_url in re.findall(r"https?://[^\s<>]+", content):
            candidate_url = candidate_url.rstrip("),.;]")
            try:
                if youtube_video_id(candidate_url) == video_id:
                    matches.append((project_dir.name, transcript_path))
                    break
            except TaskError:
                continue
    if len(matches) > 1:
        raise TaskError("korábbi transcript ellenőrzése", f"több transcript tartozik ehhez a YouTube videóhoz: {video_id}")
    return matches[0] if matches else None


def register_topic(url: str, idea_file: str) -> tuple[str, Path, bool, str]:
    video_id = youtube_video_id(url)
    idea_path, idea_lines, heading_index, title, idea_topic_id = selected_idea(idea_file, video_id)
    registry = load_registry()
    record = registry["videos"].get(video_id)

    if record:
        topic_id = record.get("topic_id")
        if not isinstance(topic_id, str) or not TOPIC_RE.fullmatch(topic_id):
            raise TaskError("ID registry", f"érvénytelen topic-id ehhez a YouTube videóhoz: {video_id}")
        project_name = record.get("project_dir", topic_id)
        if not isinstance(project_name, str) or not TOPIC_RE.fullmatch(project_name):
            raise TaskError("ID registry", f"érvénytelen projektmappa ehhez a YouTube videóhoz: {video_id}")
        if idea_topic_id and idea_topic_id != topic_id:
            raise TaskError("ötletfájl ID", f"az ötlet ID-ja ({idea_topic_id}) eltér a registry ID-jától ({topic_id})")
    else:
        if idea_topic_id:
            raise TaskError("ID registry", f"az ötletfájlban már szerepel a {idea_topic_id} ID, de a registryben nincs hozzá rekord")
        old_transcript = existing_transcript(video_id)
        if old_transcript:
            project_name, old_path = old_transcript
            topic_id = next_topic_id(registry, title)
            registry["videos"][video_id] = {
                "topic_id": topic_id,
                "project_dir": project_name,
                "transcript_ready": True,
                "transcript": str(old_path.relative_to(WORKFLOW_DIR)),
            }
        else:
            topic_id = next_topic_id(registry, title)
            project_name = topic_id
            registry["videos"][video_id] = {
                "topic_id": topic_id,
                "project_dir": project_name,
                "transcript_ready": False,
            }
        save_registry(registry)

    save_idea_id(idea_path, idea_lines, heading_index, topic_id)
    project_dir, _, _ = topic_paths(topic_id, project_name)
    transcript_path = project_dir / "source-transcript.md"
    if transcript_path.is_file():
        record = registry["videos"].setdefault(video_id, {"topic_id": topic_id})
        record["transcript_ready"] = True
        record["transcript"] = str(transcript_path.relative_to(WORKFLOW_DIR))
        save_registry(registry)
        return topic_id, transcript_path, True, project_name
    return topic_id, transcript_path, False, project_name


def run_create(url: str, idea_file: str) -> Path:
    topic_id, transcript_path, transcript_ready, project_name = register_topic(url, idea_file)
    print(f"Gomba 1 ID: {topic_id}", flush=True)
    if transcript_ready:
        print("A transcript már elkészült; nem töltök le újra.", flush=True)
        return transcript_path
    project_dir, audio_dir, audio_record = topic_paths(topic_id, project_name)
    downloader = shutil.which("yt-dlp")
    if not downloader:
        raise TaskError("letöltés", "a yt-dlp nem található a PATH-ban")
    python = Path(os.environ.get("GOMBA1_PYTHON", str(Path.home() / "video-ai/bin/python"))).expanduser()
    if not python.is_file():
        raise TaskError("átiratkészítés", f"a Faster-Whisper Pythonja nem található: {python} (GOMBA1_PYTHON felülírhatja)")
    if audio_record.is_file():
        try:
            record = json.loads(audio_record.read_text(encoding="utf-8"))
            audio_path = Path(record["audio"]).resolve()
        except (OSError, json.JSONDecodeError, KeyError, TypeError) as exc:
            raise TaskError("függőben lévő audió ellenőrzése", str(exc)) from exc
        if audio_path.parent != audio_dir.resolve() or not audio_path.is_file():
            raise TaskError("függőben lévő audió ellenőrzése", "a rögzített hangfájl útvonala érvénytelen vagy a fájl hiányzik")
    else:
        if audio_dir.exists() and any(audio_dir.iterdir()):
            raise TaskError("letöltés", f"a témamappában nem felismert fájl található: {audio_dir}")
        try:
            audio_dir.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise TaskError("audiómappa", str(exc)) from exc
        audio_template = audio_dir / "source.%(ext)s"
        try:
            print("Hang letöltése yt-dlp-vel:", flush=True)
            download = subprocess.run(
                [downloader, "--newline", "--progress", "--no-playlist", "-x", "--audio-format", "mp3", "-o", str(audio_template), "--print", "after_move:filepath", url],
                check=True, stdout=subprocess.PIPE, text=True,
            )
        except subprocess.CalledProcessError as exc:
            raise TaskError("letöltés", (exc.stderr or "yt-dlp sikertelen").strip()[-500:]) from exc
        except OSError as exc:
            raise TaskError("letöltés", str(exc)) from exc
        audio_path = Path(download.stdout.strip().splitlines()[-1]) if download.stdout.strip() else None
        if not audio_path or not audio_path.is_file() or audio_path.parent.resolve() != audio_dir.resolve():
            raise TaskError("letöltés", "a yt-dlp nem adott vissza ellenőrizhető hangfájlt")
        try:
            audio_record.write_text(json.dumps({"audio": str(audio_path)}, ensure_ascii=False), encoding="utf-8")
        except OSError as exc:
            raise TaskError("audió rögzítése", str(exc)) from exc

    transcribe_code = (
        "import json, sys\n"
        "from faster_whisper import WhisperModel\n"
        "model = WhisperModel('small', device='cpu', compute_type='int8')\n"
        "segments, info = model.transcribe(sys.argv[1], beam_size=5, log_progress=True)\n"
        "print(json.dumps({'language': info.language, 'segments': ["
        "{'start': s.start, 'end': s.end, 'text': s.text.strip()} for s in segments]}, ensure_ascii=False))\n"
    )
    try:
        print("Átirat készítése Faster-Whisperrel:", flush=True)
        result = subprocess.run(
            [str(python), "-c", transcribe_code, str(audio_path)],
            check=True, stdout=subprocess.PIPE, text=True,
        )
        transcript = json.loads(result.stdout)
    except subprocess.CalledProcessError as exc:
        reason = (exc.stderr or "Faster-Whisper sikertelen").strip()[-500:]
        raise TaskError("átiratkészítés", reason) from exc
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as exc:
        raise TaskError("átiratkészítés", str(exc)) from exc
    segments = transcript.get("segments", [])
    if not segments:
        raise TaskError("átiratkészítés", "a Faster-Whisper nem adott vissza beszédszakaszt")

    try:
        project_dir.mkdir(parents=True, exist_ok=True)
        lines = ["# Forrásvideó átirata", "", f"- Forrás: {url}", f"- Felismert nyelv: {transcript.get('language', 'ismeretlen')}", "", "## Átirat", ""]
        for segment in segments:
            start = max(0, int(float(segment["start"])))
            end = max(start, int(float(segment["end"])))
            stamp = lambda seconds: f"{seconds // 3600:02d}:{seconds % 3600 // 60:02d}:{seconds % 60:02d}"
            lines.append(f"[{stamp(start)}–{stamp(end)}] {segment['text']}")
        # Exclusive creation protects against an overwrite race.
        with transcript_path.open("x", encoding="utf-8") as output:
            output.write("\n".join(lines) + "\n")
    except FileExistsError as exc:
        raise TaskError("mentés", f"a transcript időközben létrejött, nem írom felül: {transcript_path}") from exc
    except (OSError, KeyError, TypeError, ValueError) as exc:
        raise TaskError("mentés", str(exc)) from exc
    registry = load_registry()
    record = registry["videos"][youtube_video_id(url)]
    record["transcript_ready"] = True
    record["transcript"] = str(transcript_path.relative_to(WORKFLOW_DIR))
    save_registry(registry)
    return transcript_path


def run_cleanup(topic_id: str) -> Path:
    project_name = topic_id
    if REGISTRY_PATH.is_file():
        registry = load_registry()
        for record in registry["videos"].values():
            if record.get("topic_id") == topic_id:
                project_name = record.get("project_dir", topic_id)
                break
    _, audio_dir, audio_record = topic_paths(topic_id, project_name)
    if not audio_record.is_file():
        raise TaskError("cleanup", f"ehhez a témához nem található script által rögzített audió: {audio_dir}")
    try:
        record = json.loads(audio_record.read_text(encoding="utf-8"))
        audio_path = Path(record["audio"]).resolve()
        if audio_path.parent != audio_dir.resolve() or not audio_path.is_file():
            raise TaskError("cleanup", "a rögzített audió útvonala érvénytelen vagy a fájl hiányzik")
        audio_path.unlink()
        audio_record.unlink()
        audio_dir.rmdir()
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as exc:
        raise TaskError("cleanup", str(exc)) from exc
    return audio_dir


def main() -> int:
    parser = argparse.ArgumentParser(description="Gomba 1 helyi transcript készítése és a jóváhagyásig tárolt audió törlése")
    actions = parser.add_subparsers(dest="action", required=True)
    create = actions.add_parser("create")
    create.add_argument("youtube_url")
    create.add_argument("selected_topic_path", help="a kiválasztott Gomba 0 eredményfájl útvonala")
    cleanup = actions.add_parser("cleanup")
    cleanup.add_argument("topic_id")
    args = parser.parse_args()
    try:
        if args.action == "create":
            print(run_create(args.youtube_url, args.selected_topic_path))
        else:
            print(f"Audió törölve: {run_cleanup(args.topic_id)}")
        return 0
    except TaskError as exc:
        print(f"HIBA — {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
