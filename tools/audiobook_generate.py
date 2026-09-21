#!/usr/bin/env python3
"""Generate resumable OpenAI narration and chapter timing manifests.

Requires OPENAI_API_KEY. Generated segment files live in audio/.build and are
not committed. Final chapter MP3s and audio/manifest.json are the deliverables.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT / "audio"
SCRIPTS_DIR = AUDIO_DIR / "scripts"
BUILD_DIR = AUDIO_DIR / ".build"
CHAPTER_AUDIO_DIR = AUDIO_DIR / "chapters"
MANIFEST_PATH = AUDIO_DIR / "manifest.json"

MODEL = "gpt-4o-mini-tts"
VOICE = "marin"
WORDS_PER_MINUTE = 168
ESTIMATED_COST_PER_MINUTE = 0.015
PARALLEL_REQUESTS = 8
INSTRUCTIONS = (
    "Read this as an exceptional audiobook narrator. Sound warm, grounded, natural, "
    "intelligent, and conversational, never salesy or theatrical. Respect punctuation. "
    "Speak technical terms and code identifiers clearly without adding, removing, or "
    "rewriting any words. Keep a steady, comfortable audiobook pace."
)


def duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def request_speech(api_key: str, text: str, output: Path, retries: int = 6) -> None:
    payload = json.dumps({
        "model": MODEL,
        "voice": VOICE,
        "input": text,
        "instructions": INSTRUCTIONS,
        "response_format": "mp3",
        "speed": 1.05,
    }).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                output.write_bytes(response.read())
            return
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", "replace")
            if exc.code not in {408, 409, 429, 500, 502, 503, 504} or attempt == retries - 1:
                raise RuntimeError(f"OpenAI speech request failed ({exc.code}): {body[:500]}") from exc
            wait = min(30, 2 ** attempt)
            print(f"  temporary API response {exc.code}; retrying in {wait}s", flush=True)
            time.sleep(wait)
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(min(30, 2 ** attempt))


def concat_segments(paths: list[Path], output: Path) -> None:
    concat_file = output.with_suffix(".concat.txt")
    concat_file.write_text("".join(f"file '{path.resolve()}'\n" for path in paths), encoding="utf-8")
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file), "-ac", "1", "-b:a", "64k", str(output)],
        check=True,
    )
    concat_file.unlink(missing_ok=True)


def load_scripts(chapters: list[int]) -> list[dict]:
    items = []
    for number in chapters:
        path = SCRIPTS_DIR / f"chapter-{number:02d}.json"
        if not path.exists():
            raise SystemExit(f"Missing {path.relative_to(ROOT)}. Run tools/audiobook_extract.py first.")
        items.append(json.loads(path.read_text(encoding="utf-8")))
    return items


def write_manifest(chapter_entries: dict[str, dict]) -> None:
    previous = {}
    if MANIFEST_PATH.exists():
        try:
            previous = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")).get("chapters", {})
        except json.JSONDecodeError:
            previous = {}
    previous.update(chapter_entries)
    payload = {
        "version": 1,
        "model": MODEL,
        "voice": VOICE,
        "disclosure": "Narrated with an AI-generated OpenAI voice.",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "chapters": dict(sorted(previous.items(), key=lambda item: int(item[0]))),
    }
    MANIFEST_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main() -> None:
    argp = argparse.ArgumentParser()
    argp.add_argument("--chapter", type=int, action="append", help="Generate only this chapter; repeatable")
    argp.add_argument("--dry-run", action="store_true", help="Show scope and estimated cost without calling the API")
    argp.add_argument("--max-estimated-cost", type=float, default=10.0)
    args = argp.parse_args()
    chapters = sorted(set(args.chapter or range(1, 31)))
    scripts = load_scripts(chapters)
    words = sum(item["wordCount"] for item in scripts)
    minutes = words / WORDS_PER_MINUTE
    estimate = minutes * ESTIMATED_COST_PER_MINUTE
    print(f"scope: {len(chapters)} chapters, {words} words, about {minutes / 60:.1f} hours")
    print(f"planning estimate: ${estimate:.2f}; paragraph timing comes directly from generated segments")
    if estimate > args.max_estimated_cost:
        raise SystemExit(f"Estimated cost exceeds guardrail ${args.max_estimated_cost:.2f}")
    if args.dry_run:
        return
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("OPENAI_API_KEY is not configured")
    if not shutil_which("ffmpeg") or not shutil_which("ffprobe"):
        raise SystemExit("ffmpeg and ffprobe are required")

    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    CHAPTER_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest_updates: dict[str, dict] = {}
    for script in scripts:
        number = script["chapter"]
        chapter_dir = BUILD_DIR / f"{number:02d}"
        chapter_dir.mkdir(parents=True, exist_ok=True)
        print(f"chapter {number:02d}: {script['title']}", flush=True)

        def generate_one(item: tuple[int, dict]) -> Path:
            index, segment = item
            path = chapter_dir / f"{index:04d}.mp3"
            if not path.exists() or path.stat().st_size < 512:
                print(f"  generating {index + 1}/{len(script['segments'])}", flush=True)
                request_speech(api_key, segment["text"], path)
            return path

        with concurrent.futures.ThreadPoolExecutor(max_workers=PARALLEL_REQUESTS) as pool:
            segment_paths = list(pool.map(generate_one, enumerate(script["segments"])))
        cues = []
        seen_blocks = set()
        cursor = 0.0
        for segment, path in zip(script["segments"], segment_paths):
            block = segment["block"]
            if block not in seen_blocks:
                cues.append({"at": round(cursor, 3), "block": block})
                seen_blocks.add(block)
            cursor += duration(path)
        output = CHAPTER_AUDIO_DIR / f"{number:02d}.mp3"
        concat_segments(segment_paths, output)
        final_duration = duration(output)
        manifest_updates[str(number)] = {
            "title": script["title"],
            "slug": script["slug"],
            "src": f"audio/chapters/{number:02d}.mp3",
            "duration": round(final_duration, 3),
            "blocks": len(script["blocks"]),
            "cues": cues,
        }
        write_manifest(manifest_updates)
        print(f"  finished {final_duration / 60:.1f} minutes", flush=True)
    print(f"done: {MANIFEST_PATH.relative_to(ROOT)}", flush=True)


def shutil_which(command: str) -> str | None:
    for folder in os.environ.get("PATH", "").split(os.pathsep):
        candidate = Path(folder) / command
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nstopped safely; generated segments are kept for resume", file=sys.stderr)
        raise SystemExit(130)
