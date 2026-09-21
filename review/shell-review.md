# Site shell review

## Verdict

The visual shell is strong: restrained, readable, consistent, and stable at the required phone and desktop widths in both themes. The Worker sandbox, its three-second stop, reset, the sandboxed DOM iframe, Mac-only replacement, theme switch, and passphrase gate all worked in the in-app browser.

It is not ready to call complete. Malik's requested notes and highlights feature is absent. Chapter checks are not counted into progress. The passphrase gate and mobile drawer also have serious screen-reader and keyboard gaps.

## Audit scope and evidence

- Product: BIG CODE BOOK local website.
- User goal: unlock the book, read a chapter on phone or Mac, use a sandbox, skip a Mac-only exercise, and track learning progress.
- Viewports exercised: `390x844` and browser layout viewport `1440x900`, dark and light. The browser capture pipeline downscaled the wide JPEGs to `1306x900`; `window.innerWidth` was separately verified as `1440` during capture.
- Browser: Codex in-app browser. This verified Chromium behavior. An actual iPhone running mobile Safari was not available, so iOS-specific conclusions below are source-based risks, not claimed device results.
- Contrast ratios were calculated from the CSS tokens using the WCAG relative-luminance formula.

Evidence:

1. [Mobile dark passphrase gate](shell-screens/01-mobile-dark-gate.jpg), healthy visually.
2. [Mobile dark cover](shell-screens/02-mobile-dark-cover.jpg), healthy visually.
3. [Mobile light cover](shell-screens/03-mobile-light-cover.jpg), healthy layout with contrast exceptions below.
4. [Desktop dark cover](shell-screens/04-desktop-dark-cover.jpg), healthy visually.
5. [Desktop light cover](shell-screens/05-desktop-light-cover.jpg), healthy layout with contrast exceptions below.
6. [Mobile Mac-only replacement](shell-screens/06-mobile-mac-gate.jpg), works with an announcement gap.
7. [Mobile Worker sandbox](shell-screens/07-mobile-worker-sandbox.jpg), runs and prints output.
8. [Mobile DOM sandbox](shell-screens/08-mobile-dom-sandbox.jpg), runs in a sandboxed iframe and responds to taps.
9. [Mobile contents drawer](shell-screens/09-mobile-contents-drawer.jpg), looks good but has modal behavior gaps.

## Strengths

- No horizontal layout break was visible at 390 pixels. Long code stays inside its own scrolling area, and wide figures get an explicit sideways-scroll cue.
- Dark and light themes preserve the same hierarchy. The layout does not become a different product in light mode.
- Main body text is comfortably sized and spaced. The 16-pixel mobile gutters work.
- The desktop sidebar makes 30 chapters feel navigable rather than overwhelming.
- Icon buttons have accessible names. Figures use text alternatives. Chapters use a sensible heading order.
- The Worker sandbox stopped an infinite loop after three seconds with the intended plain-language message, then Reset restored the original code.
- The DOM sandbox stayed inside `sandbox="allow-scripts"`; its example button updated `Streak: 0` to `Streak: 1`.
- localStorage calls are wrapped, so blocked storage does not crash the reading experience.
- Reduced-motion CSS removes transitions and animation.

## Numbered findings

1. **BLOCKER, MISSING: notes and highlights do not exist.** Malik explicitly requested the ability to make notes and highlights. There is no selection UI, highlight markup, note editor, persistence key, export, or recovery path in `js/book.js` or `css/book.css`. This is a missing requested feature, not polish. Add per-chapter highlights and margin notes saved locally, with an export/import escape hatch because cross-device sync is intentionally deferred.

2. **HIGH, WRONG: chapter checks are not counted into progress.** `progress()` creates a `checks` object, but nothing listens for a check opening or answering, and nothing writes `checks`. Opening a chapter check left progress unchanged. The brief specifically says checks count into progress. Either add an explicit answer control per check or define opening the answer as completion, then expose that state in the chapter and progress calculation.

3. **HIGH, ACCESSIBILITY: the closed mobile drawer remains in the accessibility tree.** At 390 pixels the sidebar is moved offscreen with `transform`, but every week and all 30 chapter links still appear before the page content in the accessibility snapshot. A screen-reader user must traverse a full hidden table of contents on every page. Apply `inert` and `aria-hidden="true"` while closed, remove those attributes when opened, then restore focus to the menu button when it closes.

4. **HIGH, ACCESSIBILITY: the mobile drawer is visually modal but does not behave like one.** Escape did not close it. Focus is not trapped inside it. There is no close button, dialog state, or focus return. The drawer can only close by choosing a link or clicking outside. Add a visible close control, Escape handling, focus containment, and focus restoration. The drawer screenshot shows a good visual state, so the fix should preserve its current look.

5. **HIGH, ACCESSIBILITY: the passphrase overlay does not isolate or fully label the gate.** Before unlock, the underlying cover remained present in the accessibility snapshot. The password field has only a placeholder, not a persistent `<label>`. The wrong-passphrase message has no live region, so `Nope. Try again.` may not be announced. Make the underlying app inert while gated, add a real label, give the message `role="status"` or `aria-live="polite"`, and move focus into the unlocked page after success.

6. **HIGH, ACCESSIBILITY: important light-theme text misses normal-text contrast.** Light accent green `#1fa32d` on `#f6f6f8` is `3.07:1`; cyan `#0a97b0` is `3.21:1`. Both fail the `4.5:1` target when used for 11-pixel NEED and ENGINEER tag text. White text on the light-theme green primary button is `3.31:1`, also below `4.5:1` for normal-size button text. Dark theme ratios are strong. Darken the light-theme accent colors or use dark button text after checking both text and boundary contrast.

7. **MEDIUM, ACCESSIBILITY: changing sandbox output is not announced.** `.sb .out` has no `role="status"`, `aria-live`, or `aria-atomic`. Visual output works, including delayed Worker output and errors, but a screen-reader user gets no reliable signal when Run finishes. Use a polite live region for ordinary output and an alert treatment for errors, without announcing every animation frame or duplicate repaint.

8. **MEDIUM, ACCESSIBILITY: glossary terms act like buttons without exposing button state.** A `<dfn>` gets `tabindex="0"` and responds to Enter and Space, but it remains exposed only as a term. The tooltip is not connected with `aria-describedby`, and there is no `aria-expanded` state. Give the term an explicit interactive role and expanded state, connect it to a stable tooltip id, and return focus cleanly after Escape.

9. **MEDIUM, FUNCTIONAL: the phone gate breakpoint disagrees with the approved brief.** The brief says replace Mac-only blocks below 768 pixels. `isPhone()` uses `< 900`, so an 820-pixel tablet or a narrow Mac browser loses the real exercise. Choose intentionally between phone capability detection and a width rule. If the approved rule stays, use 768 consistently.

10. **MEDIUM, IOS RISK: light theme leaves browser chrome configured as dark.** `theme-color` and the manifest stay `#0b0b0d`, and `apple-mobile-web-app-status-bar-style` stays `black-translucent` after switching to light. On an installed iPhone home-screen app, the system bar can look disconnected from the light page. Update the theme-color when the theme changes and verify the standalone display on a real iPhone.

11. **LOW, IOS USABILITY: key tap targets are 40 by 40 pixels.** The menu, focus, and theme buttons pass WCAG 2.2's 24-pixel AA minimum, but they are below Apple's common 44 by 44 point target for iPhone controls. Increase the hit area to at least 44 pixels without enlarging the icon itself.

12. **LOW, FEEDBACK: Skip removes the focused controls without announcing the result.** The visual replacement text is clear, but the `.btns` contents are replaced directly, leaving no live announcement and no deliberate next focus. Put the result in a status region and move focus to it or to the next heading. Keep the current wording.

13. **LOW, IOS RISK: the Worker path passed here but still needs one real-device run.** Blob-created Workers, the three-second termination, iframe `srcdoc`, the software keyboard, and standalone-mode viewport behavior all worked in the in-app browser or passed source inspection. That is not evidence of mobile Safari behavior. Before shipping, run chapters 6 and 13 on an iPhone: execute a normal Worker example, stop an infinite loop, Reset it, run a DOM iframe, rotate once, background and restore Safari, and launch once from the home-screen icon.

## Recommended order

1. Build notes and highlights, including local persistence and export/import.
2. Fix the hidden drawer and passphrase accessibility barriers.
3. Wire chapter checks into progress.
4. Correct light-theme contrast and live-region behavior.
5. Run the short real-iPhone checklist before publishing.

## Evidence limits

This is a combined UX and accessibility review, not a claim of WCAG compliance. Screenshots support layout, hierarchy, and visible contrast findings. DOM snapshots, keyboard actions, source inspection, and interaction tests support the behavioral findings. VoiceOver, Safari on iOS, zoom at 200 and 400 percent, external keyboard behavior on iPad, and installed-PWA status bars still require device testing.
