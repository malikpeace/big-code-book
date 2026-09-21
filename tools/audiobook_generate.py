#!/usr/bin/env python3
"""Generate resumable OpenAI narration and chapter timing manifests.

Requires OPENAI_API_KEY. Generated segment files live in audio/.build and are
not committed. Final chapter MP3s and audio/manifest.json are the deliverables.
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
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
TRANSCRIPTION_COST_PER_MINUTE = 0.006
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


def request_word_timestamps(api_key: str, audio_path: Path, retries: int = 5) -> dict:
    boundary = f"----bigcodebook{int(time.time() * 1000)}"
    fields = [
        ("model", "whisper-1"),
        ("response_format", "verbose_json"),
        ("timestamp_granularities[]", "word"),
        ("language", "en"),
    ]
    body = bytearray()
    for name, value in fields:
        body.extend(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    body.extend(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{audio_path.name}\"\r\n"
        "Content-Type: audio/mpeg\r\n\r\n".encode()
    )
    body.extend(audio_path.read_bytes())
    body.extend(f"\r\n--{boundary}--\r\n".encode())
    request = urllib.request.Request(
        "https://api.openai.com/v1/audio/transcriptions",
        data=bytes(body),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=300) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")
            if exc.code not in {408, 409, 429, 500, 502, 503, 504} or attempt == retries - 1:
                raise RuntimeError(f"OpenAI transcription failed ({exc.code}): {detail[:500]}") from exc
            time.sleep(min(30, 2 ** attempt))
    raise RuntimeError("OpenAI transcription failed")


def normalize_words(text: str) -> list[str]:
    return [re.sub(r"[^a-z0-9]", "", word.lower()) for word in re.findall(r"[\w'’-]+", text) if re.sub(r"[^a-z0-9]", "", word.lower())]


def align_block_cues(blocks: list[dict], transcript: dict, total_duration: float) -> list[dict]:
    spoken = transcript.get("words") or []
    spoken_tokens = [re.sub(r"[^a-z0-9]", "", str(word.get("word", "")).lower()) for word in spoken]
    source_tokens: list[str] = []
    starts: list[int] = []
    for block in blocks:
        starts.append(len(source_tokens))
        source_tokens.extend(normalize_words(block["text"]))
    matcher = difflib.SequenceMatcher(a=source_tokens, b=spoken_tokens, autojunk=False)
    source_to_spoken: dict[int, int] = {}
    for a, b, size in matcher.get_matching_blocks():
        for offset in range(size):
            source_to_spoken[a + offset] = b + offset
    cues = []
    source_count = max(1, len(source_tokens))
    for block_index, source_start in enumerate(starts):
        mapped = source_to_spoken.get(source_start)
        if mapped is None:
            # Search a few words into the block before falling back to its
            # proportional position. Technical identifiers are often spelled
            # differently by a transcription model.
            next_start = starts[block_index + 1] if block_index + 1 < len(starts) else len(source_tokens)
            for candidate in range(source_start, min(next_start, source_start + 12)):
                if candidate in source_to_spoken:
                    mapped = source_to_spoken[candidate]
                    break
        if mapped is not None and mapped < len(spoken):
            at = float(spoken[mapped].get("start", 0.0))
        else:
            at = total_duration * source_start / source_count
        cues.append({"at": round(at, 3), "block": block_index})
    # Timestamps should never move backward, even if fuzzy alignment found an
    # odd repeated phrase.
    last = 0.0
    for cue in cues:
        cue["at"] = max(last, cue["at"])
        last = cue["at"]
    return cues


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
    estimate = minutes * (ESTIMATED_COST_PER_MINUTE + TRANSCRIPTION_COST_PER_MINUTE)
    print(f"scope: {len(chapters)} chapters, {words} words, about {minutes / 60:.1f} hours")
    print(f"planning estimate: ${estimate:.2f} including narration and word-timestamp alignment")
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
        segment_paths: list[Path] = []
        print(f"chapter {number:02d}: {script['title']}", flush=True)
        for index, segment in enumerate(script["segments"]):
            path = chapter_dir / f"{index:04d}.mp3"
            if not path.exists() or path.stat().st_size < 512:
                print(f"  generating {index + 1}/{len(script['segments'])}", flush=True)
                request_speech(api_key, segment["text"], path)
            segment_paths.append(path)
        output = CHAPTER_AUDIO_DIR / f"{number:02d}.mp3"
        concat_segments(segment_paths, output)
        final_duration = duration(output)
        timing_path = chapter_dir / "word-timestamps.json"
        if timing_path.exists():
            transcript = json.loads(timing_path.read_text(encoding="utf-8"))
        else:
            print("  aligning words to the page", flush=True)
            transcript = request_word_timestamps(api_key, output)
            timing_path.write_text(json.dumps(transcript, ensure_ascii=False), encoding="utf-8")
        cues = align_block_cues(script["blocks"], transcript, final_duration)
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
