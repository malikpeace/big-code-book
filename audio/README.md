# BIG CODE BOOK audio

The audiobook uses OpenAI `gpt-4o-mini-tts` with the `marin` voice. Final chapter audio lives in `chapters/`; paragraph timing and metadata live in `manifest.json`.

Regenerate the narration scripts after chapter prose changes:

```sh
python3 tools/audiobook_extract.py
```

Preview scope and cost without calling OpenAI:

```sh
python3 tools/audiobook_generate.py --dry-run
```

Generate or resume after setting `OPENAI_API_KEY` locally:

```sh
python3 tools/audiobook_generate.py
```

Generated segment files are resumable build artifacts under `audio/.build/` and are intentionally ignored by git. The API key must never be committed or placed in the website.

Verify that all 30 chapter scripts still match the HTML and that every final MP3 has a complete, monotonic timing map:

```sh
python3 tools/audiobook_verify.py
```
