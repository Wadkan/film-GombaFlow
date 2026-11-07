#!/usr/bin/env python3
"""Transcribe local recordings without editing source media or interpreting cues."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

VIDEO_EXTENSIONS = {".mp4", ".mov", ".mkv", ".webm", ".m4v", ".avi", ".mts", ".m2ts"}


def probe_media(path: Path) -> dict:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    duration = float(data["format"]["duration"])
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError(f"Érvénytelen médiaidőtartam: {path}")
    audio = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    return {"duration": duration, "has_audio": audio is not None}


def write_json(path: Path, value: dict) -> None:
    with path.open("x", encoding="utf-8") as output:
        json.dump(value, output, ensure_ascii=False, indent=2, allow_nan=False)
        output.write("\n")


def run_batch(input_dir: Path, model_factory, language: str | None) -> Path:
    input_dir = input_dir.expanduser().resolve(strict=True)
    if not input_dir.is_dir():
        raise ValueError("Az input-dir egy felvételmappa legyen.")
    output_dir = input_dir / "transcripts"
    if output_dir.exists():
        raise FileExistsError(f"A kimeneti mappa már létezik; nem írom felül: {output_dir}")
    sources = sorted(
        (
            p
            for p in input_dir.rglob("*")
            if p.is_file() and not p.is_symlink() and p.suffix.lower() in VIDEO_EXTENSIONS
        ),
        key=lambda p: str(p.relative_to(input_dir)),
    )
    if not sources:
        raise ValueError("Nincs támogatott videófájl a megadott mappában.")
    output_dir.mkdir(parents=True, exist_ok=False)
    model = None
    manifest = {"schema_version": "1.0", "recordings": []}
    for index, source in enumerate(sources, start=1):
        print(f"Átírás: {source.name}", file=sys.stderr, flush=True)
        initial_stat = source.stat()
        with source.open("rb") as source_file:
            source_id = "sha256:" + hashlib.file_digest(source_file, "sha256").hexdigest()
        media = probe_media(source)
        record = {
            "schema_version": "1.0",
            "source_id": source_id,
            "source_path": str(source),
            "file_name": source.name,
            "duration": media["duration"],
            "time_base": "source_seconds",
            "language": None,
            "status": "no_audio",
            "segments": [],
        }
        if media["has_audio"]:
            if model is None:
                model = model_factory()
            segments, info = model.transcribe(
                str(source),
                language=language,
                task="transcribe",
                word_timestamps=True,
                vad_filter=True,
                beam_size=5,
            )
            record["language"] = info.language
            for segment in segments:
                if segment.text.strip() and not segment.words:
                    raise ValueError(f"Hiányzó szóidőbélyegek: {source}")
                words = []
                for word in segment.words or []:
                    if not (
                        math.isfinite(word.start)
                        and math.isfinite(word.end)
                        and 0 <= word.start <= word.end <= media["duration"] + 0.1
                    ):
                        raise ValueError(f"Érvénytelen szóidőbélyeg: {source}")
                    words.append({"start": word.start, "end": word.end, "text": word.word})
                record["segments"].append(
                    {
                        "start": segment.start,
                        "end": segment.end,
                        "text": segment.text,
                        "words": words,
                    }
                )
            record["status"] = (
                "transcribed"
                if any(s["words"] for s in record["segments"])
                else "no_detected_speech"
            )
        final_stat = source.stat()
        if (initial_stat.st_size, initial_stat.st_mtime_ns) != (
            final_stat.st_size,
            final_stat.st_mtime_ns,
        ):
            raise ValueError(f"A forrásfájl feldolgozás közben megváltozott: {source}")
        transcript_name = f"recording_{index:04d}.json"
        write_json(output_dir / transcript_name, record)
        manifest["recordings"].append(
            {
                "source_id": source_id,
                "source_path": str(source),
                "transcript_path": transcript_name,
                "status": record["status"],
            }
        )
    manifest_path = output_dir / "master_transcript.json"
    write_json(manifest_path, manifest)
    unidentified = [r for r in manifest["recordings"] if r["status"] != "transcribed"]
    if unidentified:
        print("Felhasználói azonosítás szükséges:", file=sys.stderr)
        for record in unidentified:
            print(f"- {record['source_path']} ({record['status']})", file=sys.stderr)
    return manifest_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Helyi videók szóidőbélyeges Faster-Whisper átirata"
    )
    parser.add_argument("--input-dir", type=Path)
    parser.add_argument("--language", default="hu", help="Nyelvkód; auto = automatikus felismerés")
    parser.add_argument("--model", default="small", help="Modellnév vagy letöltött modell útvonala")
    args = parser.parse_args()

    def model_factory():
        from faster_whisper import WhisperModel

        return WhisperModel(args.model, device="cpu", compute_type="int8")

    try:
        input_dir = args.input_dir
        if input_dir is None:
            answer = input("A videók gyökérmappájának útvonala: ").strip()
            if not answer:
                raise ValueError("A videók útvonala szükséges; nem indul feldolgozás.")
            input_dir = Path(answer)
        print(
            run_batch(
                input_dir,
                model_factory,
                None if args.language == "auto" else args.language,
            )
        )
        return 0
    except (
        OSError,
        ValueError,
        KeyError,
        ImportError,
        RuntimeError,
        EOFError,
        subprocess.CalledProcessError,
    ) as exc:
        print(f"HIBA — {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
