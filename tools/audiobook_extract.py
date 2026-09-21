#!/usr/bin/env python3
"""Extract narratable blocks from BIG CODE BOOK chapters.

The browser player uses the same tag/class rules in js/audiobook.js. Keep the
two lists in sync. Code boxes, diagrams, source labels, and interactive UI are
deliberately skipped.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHAPTERS_DIR = ROOT / "chapters"
SCRIPTS_DIR = ROOT / "audio" / "scripts"

TARGET_TAGS = {"h1", "h2", "h3", "p", "li", "summary", "dt", "dd", "th", "td"}
SKIP_TAGS = {"pre", "figure", "script", "style", "svg", "textarea", "button", "nav"}
SKIP_CLASSES = {"sb", "src", "audio-player", "audio-library"}
LABEL_PARENTS = {"box", "lane", "ex"}
MAX_CHARS = 2400


class Node:
    def __init__(self, tag: str, attrs: list[tuple[str, str | None]], parent: "Node | None"):
        self.tag = tag
        self.attrs = {key: value or "" for key, value in attrs}
        self.parent = parent
        self.children: list[Node | str] = []

    @property
    def classes(self) -> set[str]:
        return set(self.attrs.get("class", "").split())

    def text(self) -> str:
        pieces: list[str] = []

        def walk(node: Node | str) -> None:
            if isinstance(node, str):
                pieces.append(node)
                return
            if node.tag in {"script", "style", "svg", "textarea", "button"}:
                return
            for child in node.children:
                walk(child)

        walk(self)
        return re.sub(r"\s+", " ", html.unescape(" ".join(pieces))).strip()


class TreeParser(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("document", [], None)
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(data)


def has_skipped_ancestor(node: Node) -> bool:
    current: Node | None = node
    while current:
        if current.tag in SKIP_TAGS or current.classes.intersection(SKIP_CLASSES):
            return True
        current = current.parent
    return False


def is_target(node: Node) -> bool:
    if node.tag in TARGET_TAGS:
        return True
    if "h" in node.classes and node.parent and node.parent.classes.intersection(LABEL_PARENTS):
        return True
    return False


def split_long_text(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])", text)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if len(sentence) > max_chars:
            words = sentence.split()
            for word in words:
                proposed = f"{current} {word}".strip()
                if current and len(proposed) > max_chars:
                    chunks.append(current)
                    current = word
                else:
                    current = proposed
            continue
        proposed = f"{current} {sentence}".strip()
        if current and len(proposed) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = proposed
    if current:
        chunks.append(current)
    return chunks


def extract(path: Path) -> dict:
    parser = TreeParser()
    parser.feed(path.read_text(encoding="utf-8"))
    nodes: list[Node] = []

    def walk(node: Node) -> None:
        if node.tag == "main":
            collect(node)
            return
        for child in node.children:
            if isinstance(child, Node):
                walk(child)

    def collect(node: Node) -> None:
        for child in node.children:
            if not isinstance(child, Node):
                continue
            if is_target(child) and not has_skipped_ancestor(child):
                nodes.append(child)
            collect(child)

    walk(parser.root)
    blocks = []
    for node in nodes:
        text = node.text()
        if len(text) < 2:
            continue
        block_index = len(blocks)
        blocks.append({"index": block_index, "tag": node.tag, "text": text})
    # Feed the narrator in multi-paragraph passages. This sounds far more like
    # an audiobook than resetting the voice for every heading and sentence.
    # Exact paragraph timing is recovered from a word-timestamp pass after the
    # chapter audio is assembled.
    segments = []
    current_texts: list[str] = []
    current_blocks: list[int] = []
    current_chars = 0
    for block in blocks:
        for part in split_long_text(block["text"]):
            added = len(part) + (2 if current_texts else 0)
            if current_texts and current_chars + added > MAX_CHARS:
                segments.append({"blocks": current_blocks, "text": "\n\n".join(current_texts)})
                current_texts = []
                current_blocks = []
                current_chars = 0
            current_texts.append(part)
            current_blocks.append(block["index"])
            current_chars += len(part) + (2 if len(current_texts) > 1 else 0)
    if current_texts:
        segments.append({"blocks": current_blocks, "text": "\n\n".join(current_texts)})

    match = re.match(r"(\d{2})-(.+)\.html$", path.name)
    if not match:
        raise ValueError(f"Unexpected chapter filename: {path.name}")
    number = int(match.group(1))
    title = blocks[0]["text"] if blocks else path.stem
    return {
        "chapter": number,
        "slug": match.group(2),
        "title": title,
        "source": f"chapters/{path.name}",
        "blocks": blocks,
        "segments": segments,
        "wordCount": len(re.findall(r"\b[\w]+(?:['’-][\w]+)*\b", " ".join(x["text"] for x in blocks))),
    }


def main() -> None:
    argp = argparse.ArgumentParser()
    argp.add_argument("--chapter", type=int, action="append", help="Extract only this chapter; repeatable")
    args = argp.parse_args()
    wanted = set(args.chapter or range(1, 31))
    SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    total_words = 0
    total_segments = 0
    for path in sorted(CHAPTERS_DIR.glob("[0-9][0-9]-*.html")):
        number = int(path.name[:2])
        if number == 0 or number not in wanted:
            continue
        data = extract(path)
        output = SCRIPTS_DIR / f"chapter-{number:02d}.json"
        output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        total_words += data["wordCount"]
        total_segments += len(data["segments"])
        print(f"{number:02d}: {data['wordCount']:>5} words, {len(data['blocks']):>3} blocks, {len(data['segments']):>3} segments")
    print(f"total: {total_words} words, {total_segments} generation segments")


if __name__ == "__main__":
    main()
