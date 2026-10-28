#!/usr/bin/env python3
"""Interactive local launcher for the existing Gomba 1 transcript commands."""

from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

WORKFLOW_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = WORKFLOW_DIR.parents[3]
PROJECTS_DIR = WORKFLOW_DIR / "projects"
RESULTS_DIR = (
    REPO_ROOT
    / "local-workflows/script-and-cut-workflows/gombaFlow/gomba-0-idea-collector/results"
)
TRANSCRIPT_CLI = WORKFLOW_DIR / "scripts" / "gomba1_transcript.py"


def youtube_id(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.hostname in {"youtu.be", "www.youtu.be"}:
        return parsed.path.strip("/").split("/")[0]
    if parsed.hostname in {"youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"}:
        video_id = parse_qs(parsed.query).get("v", [None])[0]
        if video_id:
            return video_id
        match = re.match(r"^/(?:shorts|embed)/([^/?]+)", parsed.path)
        return match.group(1) if match else None
    return None


def latest_ideas_file() -> Path:
    files = []
    for path in RESULTS_DIR.glob("*-ideas*.md"):
        match = re.fullmatch(r"(\d{8})-ideas(?:-(\d+))?\.md", path.name)
        if match:
            files.append(((match.group(1), int(match.group(2) or "1")), path))
    if not files:
        raise ValueError(f"Nem található Gomba 0 ötletfájl: {RESULTS_DIR}")
    return max(files, key=lambda entry: entry[0])[1]


def transcript_exists(video_id: str) -> bool:
    registry_path = PROJECTS_DIR / "registry.json"
    if not registry_path.is_file():
        return False
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
        record = registry.get("videos", {}).get(video_id, {})
        if record.get("transcript"):
            return (WORKFLOW_DIR / record["transcript"]).is_file()
        project_dir = PROJECTS_DIR / record.get("project_dir", record.get("topic_id", ""))
        return (project_dir / "source-transcript.md").is_file()
    except (OSError, json.JSONDecodeError, AttributeError, TypeError):
        return False


def used_video_ids() -> set[str]:
    registry_path = PROJECTS_DIR / "registry.json"
    if not registry_path.is_file():
        return set()
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
        videos = registry.get("videos", {})
        if not isinstance(videos, dict):
            raise ValueError("érvénytelen videólista a Gomba 1 registryben")
        return set(videos)
    except (OSError, json.JSONDecodeError, AttributeError, TypeError) as exc:
        raise ValueError(f"Nem olvasható a Gomba 1 registry: {exc}") from exc


def list_ideas(path: Path) -> list[dict[str, str]]:
    ideas = []
    used_ids = used_video_ids()
    heading = re.compile(r"^##\s+(\d+)\.\s+\[(.+?)\]\((https?://.+)\)\s*$")
    for line in path.read_text(encoding="utf-8").splitlines():
        match = heading.match(line)
        if not match:
            continue
        video_url = html.unescape(match.group(3).replace("\\&", "&"))
        video_id = youtube_id(video_url)
        if video_id and video_id not in used_ids:
            ideas.append(
                {
                    "number": match.group(1),
                    "title": html.unescape(match.group(2)),
                    "url": video_url,
                    "video_id": video_id,
                    "done": "igen" if transcript_exists(video_id) else "nem",
                }
            )
    return ideas


def run_cli(arguments: list[str]) -> tuple[int, list[str]]:
    process = subprocess.Popen(
        [sys.executable, str(TRANSCRIPT_CLI), *arguments],
        cwd=REPO_ROOT,
        stdout=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    output = []
    assert process.stdout is not None
    for line in process.stdout:
        output.append(line)
        print(line, end="", flush=True)
    return process.wait(), output


def run() -> int:
    try:
        ideas_path = latest_ideas_file()
        ideas = list_ideas(ideas_path)
        if not ideas:
            raise ValueError(f"Nem található fel nem használt választható videó: {ideas_path}")
    except (OSError, ValueError) as exc:
        print(f"HIBA — {exc}", file=sys.stderr)
        return 1

    print(f"Elérhető ötletek: {ideas_path.relative_to(REPO_ROOT)}")
    for selection_number, idea in enumerate(ideas, start=1):
        state = "transcript kész" if idea["done"] == "igen" else "új transcript"
        print(f"{selection_number}. {idea['title']} [{state}]")

    try:
        choice = input("Válassz sorszámot: ").strip()
    except EOFError:
        print("HIBA — nem érkezett választás.", file=sys.stderr)
        return 2
    if not choice.isdecimal() or not 1 <= int(choice) <= len(ideas):
        print("HIBA — ilyen sorszám nincs a listában.", file=sys.stderr)
        return 2
    selected = ideas[int(choice) - 1]

    print(f"Kiválasztva: {selected['title']}", flush=True)
    print("Indul a letöltés és a transcript készítése:", flush=True)
    create_code, create_lines = run_cli(["create", selected["url"], str(ideas_path)])
    if create_code:
        return create_code

    topic_id = next(
        (line.partition(":")[2].strip() for line in create_lines if line.startswith("Gomba 1 ID:")),
        None,
    )
    transcript_path = next(
        (line.strip() for line in create_lines if line.strip().endswith("source-transcript.md")),
        None,
    )
    if not topic_id or not transcript_path:
        print("HIBA — a transcript CLI nem adta vissza az ID-t és az útvonalat.", file=sys.stderr)
        return 1

    registry = json.loads((PROJECTS_DIR / "registry.json").read_text(encoding="utf-8"))
    record = registry["videos"][selected["video_id"]]
    project_dir = PROJECTS_DIR / record.get("project_dir", topic_id)
    audio_record = project_dir / "source-audio/audio-path.json"
    if audio_record.is_file():
        print("Transcript elkészült; indul az audió cleanup:", flush=True)
        cleanup_code, _ = run_cli(["cleanup", topic_id])
        if cleanup_code:
            return cleanup_code
    else:
        print("A hangfájl már nincs meg; a cleanup kész.")

    print(
        f"\033[32mKövetkező lépés: az agent dolgozza fel ezt a transcriptet: {transcript_path} (Gomba 1 ID: {topic_id})\033[0m"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
