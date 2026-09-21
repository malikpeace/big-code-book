# CHAPTER GUIDE (for anyone writing a chapter of BIG CODE BOOK)

Read PLAN.md section 3 for your chapter's spec, then this file, then chapters/01 and 02 as the voice reference. Copy `chapters/00-template.html` and keep every section, in order.

## The reader
Malik. Founder. Runs Memento, a SaaS built by two AI agents. Knows the words ("commit", "API", "Supabase"), not the meaning. Smart, impatient, hates fluff. Learns from analogies, pictures, and small hands-on steps. Terminal scares him a little. One hour per chapter, on a phone or a Mac.

## Voice
- Casual, blunt, swearing allowed in small doses. Talks like a smart friend across a table. Short sentences. Say the thing.
- Hormozi-style: bold claim, then the plain reason, then the example. Never lecture.
- ELI5 first, then the real model. Every analogy sits in a box labelled ANALOGY (TEMPORARY), and the chapter ends with WHERE TODAY'S ANALOGY BREAKS.
- No em dashes or en dashes anywhere. Use commas, periods, or a new sentence.
- No "It's not X, it's Y." No eyebrow labels in prose. No "In this chapter we will". No "Let's dive in." No "delve". No bullet-point soup where a sentence works.
- No praise of the reader. No "great question". No exclamation marks except in quoted code output.
- Numbers get a table or their own line, not a sentence full of them.
- Jargon: every new term is wrapped `<dfn data-term="slug">word</dfn>` the FIRST time it appears in the chapter, and gets a row in WORDS YOU NOW OWN. Slugs must exist in glossary.json (add the term there if new, with `ch` = your chapter number).

## Structure (the template, non-negotiable)
0. Kicker: chapter number, tag (NEED / ENGINEER / RABBIT HOLE), time.
1. LAST TIME box: three sentences.
2. Quick check: three `<details class="check">` on EARLIER chapters (not this one).
3. The idea: universal concept. Analogy box. One inline SVG figure. The real model.
4. See it: one `.sb` sandbox with 10-20 lines of runnable JavaScript (use `console.log`). For page exercises add `data-dom` to the `.sb` and write HTML+script.
5. Now in Memento: `.lanes` with ANY APP lane and MEMENTO lane. The Memento lane quotes REAL lines verbatim with a `.src` line `path:lines (web pin ca8afc8 | native pin 93bfa796)`. Then the box THE ALTERNATIVE, AND WHY MEMENTO CHOSE THIS.
6. Do it: one `.ex`. If it needs Terminal or the Mac, add `data-device="mac"` and the MAC tag. The `.meta` line always states: Where, Expected, Reset, "This cannot touch Memento."
7. ASK THE AGENT WHY box: one paste-able question that asks for an explanation and ends "Do not change anything."
8. WORDS YOU NOW OWN: `<dl>` of the chapter's new or upgraded terms.
9. WHERE TODAY'S ANALOGY BREAKS box.
10. Optional `<details class="hole">` rabbit holes, collapsed.

Left lane = universal (works for any app). Right lane = Memento. Never mix them in one paragraph.

## Memento is read-only
Read files under ~/Downloads/MEMENTO with cat/sed/grep only. Never write, never run git commands that change anything, never npm install there. Quote lines exactly. Cite `path:start-end` and the pin. Web files are at the checked-out tree (matches web pin ca8afc8 for memento-app/); native files are on the current branch (native pin 93bfa796).

## Figures (inline SVG)
- `viewBox="0 0 640 260"` or similar, `role="img"`, an `aria-label` that describes it in words.
- Use ONLY the classes in book.css: `.bx` (box), `.bx.acc` (green outline), `.bx.cy` (cyan outline), `.ln` (line), `.ln.acc`, `.ln.cy`, `.dot`, `.st` (text), `.st.lo` (small grey), `.st.b` (bold), `.st.mono`. No inline colours, so it works in light and dark.
- Boxes: `rx="8"`. Text 13px. Keep it to one relationship per figure. Label in plain words.
- Wrap in `<figure class="fig-box">...<figcaption>` .

## Length
1,400 to 2,200 words of prose plus code. If you are over, cut the third example, not the model.

## Do not
- Do not invent Memento facts. If you cannot find the line, say "see file X" without a line number and note it in a `<!-- CODEX: verify -->` comment.
- Do not use libraries, frameworks, or external scripts in chapter pages.
- Do not add new CSS. If the template cannot express it, write it in prose.
