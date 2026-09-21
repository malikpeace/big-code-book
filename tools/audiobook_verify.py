#!/usr/bin/env python3
"""Verify narration scripts, final audio, timing maps, and repository safety."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

from audiobook_extract import CHAPTERS_DIR, ROOT, SCRIPTS_DIR, extract


AUDIO_DIR = ROOT / "audio"
MANIFEST_PATH = AUDIO_DIR / "manifest.json"


def fail(message: str) -> None:
    raise SystemExit(f"FAIL: {message}")


def audio_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def spoken_text(text: str) -> str:
    """Treat tag-boundary spaces around punctuation as speech-equivalent."""
    text = re.sub(r"\s+([,.;:!?%\)\]])", r"\1", text)
    text = re.sub(r"([\(\[])\s+", r"\1", text)
    text = re.sub(r'(["“‘])\s+', r"\1", text)
    return re.sub(r'\s+(["”’])', r"\1", text)


def scripts_match(saved: dict, current: dict) -> bool:
    stable_keys = {"chapter", "slug", "title", "source", "wordCount"}
    if any(saved.get(key) != current.get(key) for key in stable_keys):
        return False
    saved_blocks = [(block["index"], block["tag"], spoken_text(block["text"])) for block in saved.get("blocks", [])]
    current_blocks = [(block["index"], block["tag"], spoken_text(block["text"])) for block in current.get("blocks", [])]
    saved_segments = [(segment["block"], spoken_text(segment["text"])) for segment in saved.get("segments", [])]
    current_segments = [(segment["block"], spoken_text(segment["text"])) for segment in current.get("segments", [])]
    return saved_blocks == current_blocks and saved_segments == current_segments


def main() -> None:
    chapter_files = [path for path in sorted(CHAPTERS_DIR.glob("[0-9][0-9]-*.html")) if not path.name.startswith("00-")]
    if len(chapter_files) != 30:
        fail(f"expected 30 chapters, found {len(chapter_files)}")
    expected = {}
    for path in chapter_files:
        data = extract(path)
        expected[data["chapter"]] = data
        script_path = SCRIPTS_DIR / f"chapter-{data['chapter']:02d}.json"
        if not script_path.exists():
            fail(f"missing {script_path.relative_to(ROOT)}")
        saved = json.loads(script_path.read_text(encoding="utf-8"))
        if not scripts_match(saved, data):
            fail(f"stale narration script for chapter {data['chapter']:02d}")
        if any(len(segment["text"]) > 2800 for segment in saved["segments"]):
            fail(f"oversized speech segment in chapter {data['chapter']:02d}")
        covered = [segment["block"] for segment in saved["segments"]]
        if sorted(set(covered)) != list(range(len(saved["blocks"]))):
            fail(f"narration blocks are missing in chapter {data['chapter']:02d}")
    print("scripts: 30 current chapter scripts, code boxes and diagrams excluded")

    if not MANIFEST_PATH.exists():
        print("audio: not generated yet")
        return
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if manifest.get("voice") != "marin" or manifest.get("model") != "gpt-4o-mini-tts":
        fail("manifest does not identify the requested Marin OpenAI narration")
    entries = manifest.get("chapters", {})
    if set(entries) != {str(number) for number in range(1, 31)}:
        fail(f"manifest has {len(entries)} chapters instead of 30")
    total_seconds = 0.0
    total_bytes = 0
    for number in range(1, 31):
        entry = entries[str(number)]
        source = expected[number]
        path = ROOT / entry["src"]
        if not path.exists():
            fail(f"missing final audio for chapter {number:02d}")
        if path.stat().st_size >= 100_000_000:
            fail(f"chapter {number:02d} exceeds GitHub's single-file limit")
        actual = audio_duration(path)
        if abs(actual - float(entry["duration"])) > 1.0:
            fail(f"duration drift in chapter {number:02d}")
        cues = entry.get("cues", [])
        if len(cues) != len(source["blocks"]):
            fail(f"cue count mismatch in chapter {number:02d}")
        if any(cues[index]["at"] > cues[index + 1]["at"] for index in range(len(cues) - 1)):
            fail(f"non-monotonic cues in chapter {number:02d}")
        if cues and (cues[0]["at"] < 0 or cues[-1]["at"] >= actual):
            fail(f"cue outside audio bounds in chapter {number:02d}")
        total_seconds += actual
        total_bytes += path.stat().st_size
    print(f"audio: 30 chapters, {total_seconds / 3600:.2f} hours, {total_bytes / 1_000_000:.1f} MB")
    print("timing: every narratable block has a monotonic in-bounds cue")
    print("PASS")


if __name__ == "__main__":
    main()
