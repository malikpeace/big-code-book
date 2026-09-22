/* BIG CODE BOOK audiobook player. Plain JavaScript, like the rest of the book. */
(function () {
  'use strict';

  var config = window.BIG_CODE_BOOK_AUDIO;
  if (!config) return;
  var root = config.root;
  var pageChapter = config.chapter; // the chapter whose TEXT is on screen; audio may be elsewhere
  var chapters = config.chapters;
  var audio = document.createElement('audio');
  audio.preload = 'metadata';
  audio.setAttribute('playsinline', '');
  audio.style.display = 'none';
  document.body.appendChild(audio);
  var userScrolledAt = 0; // auto-scroll backs off while the reader is scrolling by hand
  ['touchmove', 'wheel'].forEach(function (evt) { window.addEventListener(evt, function () { userScrolledAt = Date.now(); }, { passive: true }); });
  var manifest = null;
  var track = null;
  var blocks = [];
  var activeBlock = null;
  var immersiveBlock = null;
  var lastSave = 0;
  var returnScrollY = 0;
  var playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  var state = readState();
  var bookmarks = readBookmarks();
  var ui = {};

  function readState() {
    try {
      var parsed = JSON.parse(localStorage.getItem('bcb_audio_state') || '{}');
      return {
        chapter: Number(parsed.chapter) || 1,
        time: Number(parsed.time) || 0,
        rate: normalizeRate(parsed.rate),
        pendingPlay: !!parsed.pendingPlay,
        expanded: !!parsed.expanded,
        immersive: !!parsed.immersive
      };
    } catch (e) {
      return { chapter: 1, time: 0, rate: 1, pendingPlay: false, expanded: false, immersive: false };
    }
  }
  function readBookmarks() {
    try { return JSON.parse(localStorage.getItem('bcb_audio_bookmarks') || '{}'); }
    catch (e) { return {}; }
  }
  function saveState(force) {
    var now = Date.now();
    if (!force && now - lastSave < 1000) return;
    lastSave = now;
    try { localStorage.setItem('bcb_audio_state', JSON.stringify(state)); } catch (e) {}
  }
  function saveBookmarks() {
    try { localStorage.setItem('bcb_audio_bookmarks', JSON.stringify(bookmarks)); } catch (e) {}
  }
  function normalizeRate(value) {
    var rate = Number(value);
    return playbackRates.indexOf(rate) === -1 ? 1 : rate;
  }
  function pad(number) { return number < 10 ? '0' + number : String(number); }
  function chapterHref(number) {
    var chapter = chapters[number - 1];
    return root + 'chapters/' + pad(number) + '-' + chapter[1] + '.html';
  }
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var value = Math.floor(seconds);
    var hours = Math.floor(value / 3600);
    var minutes = Math.floor((value % 3600) / 60);
    var secs = value % 60;
    return hours ? hours + ':' + pad(minutes) + ':' + pad(secs) : minutes + ':' + pad(secs);
  }
  function iconSrc(name) { return root + 'img/icons/' + name + '.svg'; }
  function rateSelect(className) {
    var select = document.createElement('select');
    select.className = className;
    select.setAttribute('aria-label', 'Playback speed');
    playbackRates.forEach(function (rate) {
      var option = document.createElement('option');
      option.value = String(rate);
      option.textContent = rate + '×';
      select.appendChild(option);
    });
    select.value = String(state.rate);
    select.addEventListener('change', function () { setRate(select.value); });
    return select;
  }
  function iconButton(label, text, action, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-button ' + (className || '');
    button.setAttribute('aria-label', label);
    button.title = label;
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  }
  function visualButton(label, icon, action, className, badge, caption) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-visual-button ' + (className || '');
    button.setAttribute('aria-label', label);
    button.title = label;
    var wrap = document.createElement('span');
    wrap.className = 'audio-visual-icon';
    var image = document.createElement('img');
    image.src = iconSrc(icon);
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    wrap.appendChild(image);
    if (badge) {
      var number = document.createElement('span');
      number.className = 'audio-visual-badge';
      number.textContent = badge;
      wrap.appendChild(number);
    }
    button.appendChild(wrap);
    if (caption) {
      var text = document.createElement('span');
      text.className = 'audio-visual-caption';
      text.textContent = caption;
      button.appendChild(text);
    }
    button.addEventListener('click', action);
    return button;
  }
  function setVisualIcon(button, name) {
    var image = button && button.querySelector('img');
    if (image) image.src = iconSrc(name);
  }
  function narratableBlocks() {
    var selector = [
      'main h1', 'main h2', 'main h3', 'main p', 'main li', 'main summary',
      'main dt', 'main dd', 'main th', 'main td', 'main figcaption',
      'main .box > .h', 'main .lane > .h', 'main .ex > .h', 'main .check > .a'
    ].join(',');
    var candidates = Array.prototype.slice.call(document.querySelectorAll(selector));
    return candidates.filter(function (node) {
      var nested = candidates.some(function (other) { return other !== node && other.contains(node); });
      var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      return text.length >= 2 && !nested && !node.closest('pre, script, style, svg, textarea, button, nav, .sb, .src, .audio-player, .audio-library, .audio-immersive');
    });
  }
  function chapterEntry(number) {
    return manifest && manifest.chapters ? manifest.chapters[String(number)] : null;
  }
  function setExpanded(yes) {
    state.expanded = !!yes;
    ui.shell.classList.toggle('expanded', state.expanded);
    ui.expand.setAttribute('aria-expanded', String(state.expanded));
    ui.expand.textContent = state.expanded ? 'Close' : 'Chapters';
    saveState(true);
  }
  function setImmersiveLibrary(yes) {
    ui.immersive.classList.toggle('library-open', !!yes);
    ui.immersiveChapters.setAttribute('aria-expanded', String(!!yes));
    ui.immersiveLibrary.setAttribute('aria-hidden', String(!yes));
  }
  function setImmersive(yes) {
    var wasImmersive = state.immersive;
    state.immersive = !!yes;
    if (state.immersive && !wasImmersive) returnScrollY = window.scrollY || 0;
    document.body.classList.toggle('audio-immersive-open', state.immersive);
    ui.immersive.classList.toggle('open', state.immersive);
    ui.immersive.setAttribute('aria-hidden', String(!state.immersive));
    ui.openImmersiveButtons.forEach(function (button) {
      button.setAttribute('aria-expanded', String(state.immersive));
    });
    if (!state.immersive) {
      setImmersiveLibrary(false);
      window.scrollTo(0, returnScrollY);
    } else {
      window.scrollTo(0, 0);
      updateImmersiveTranscript(audio.currentTime || state.time || 0, true);
    }
    saveState(true);
  }
  function navigate(number, autoplay, at, followPage) {
    if (number < 1 || number > chapters.length) return;
    var wasFollowing = (pageChapter === state.chapter);
    loadTrack(number, autoplay, at);
    // If the reader was following along in the text, bring the text with the audio.
    if ((followPage || wasFollowing) && pageChapter !== number && window.BCB) window.BCB.go(chapterHref(number), true);
  }
  function goToText() {
    // Take the reader to the exact paragraph the narrator is on. Different chapter: swap the page first.
    if (state.immersive) setImmersive(false);
    if (pageChapter !== state.chapter) {
      if (!window.BCB) return;
      window.addEventListener('bcb:page', function once() { window.removeEventListener('bcb:page', once); setTimeout(scrollToReading, 60); });
      window.BCB.go(chapterHref(state.chapter), true);
      return;
    }
    scrollToReading();
  }
  function scrollToReading() {
    var cue = track && track.cues[currentCueIndex(audio.currentTime || 0)];
    var node = cue && blocks[cue.block];
    if (!node) return;
    userScrolledAt = 0;
    node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    node.classList.remove('audio-jumped'); void node.offsetWidth; node.classList.add('audio-jumped');
  }
  function playPause() {
    if (!track) { loadTrack(state.chapter || 1, true, state.time || 0); return; }
    if (audio.paused) {
      var promise = audio.play();
      if (promise && promise.catch) promise.catch(showPlayError);
    } else {
      audio.pause();
    }
  }
  function showPlayError() {
    ui.status.textContent = 'Tap play again. Your browser paused the first attempt.';
  }
  function seekTo(seconds) {
    if (!track) return;
    audio.currentTime = Math.max(0, Math.min(track.duration || audio.duration || 0, seconds));
    updateTime(true);
  }
  function skip(seconds) { seekTo(audio.currentTime + seconds); }
  function setRate(value) {
    state.rate = normalizeRate(value);
    audio.playbackRate = state.rate;
    if (ui.rate) ui.rate.value = String(state.rate);
    if (ui.immersiveRate) ui.immersiveRate.value = String(state.rate);
    saveState(true);
  }
  function currentCueIndex(time) {
    if (!track || !track.cues || !track.cues.length) return -1;
    var low = 0, high = track.cues.length - 1, result = 0;
    while (low <= high) {
      var middle = Math.floor((low + high) / 2);
      if (track.cues[middle].at <= time) { result = middle; low = middle + 1; }
      else high = middle - 1;
    }
    return result;
  }
  function blockText(index) {
    var node = blocks[index];
    return node ? (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }
  function clearHighlight() {
    if (activeBlock !== null && blocks[activeBlock]) blocks[activeBlock].classList.remove('audio-reading');
    activeBlock = null;
  }
  function paintHighlight(time) {
    if (!pageChapter || !track || pageChapter !== state.chapter) return;
    var cue = track.cues[currentCueIndex(time)];
    var index = cue ? cue.block : 0;
    if (index === activeBlock) return;
    if (activeBlock !== null && blocks[activeBlock]) blocks[activeBlock].classList.remove('audio-reading');
    activeBlock = index;
    var node = blocks[index];
    if (!node) return;
    node.classList.add('audio-reading');
    if (!audio.paused && !state.immersive && Date.now() - userScrolledAt > 4000) {
      var rect = node.getBoundingClientRect();
      if (rect.top < 90 || rect.bottom > window.innerHeight - 150) {
        node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }
  function updateImmersiveTranscript(time, force) {
    if (!state.immersive || !track || !blocks.length || pageChapter !== state.chapter) return;
    var cueIndex = currentCueIndex(time);
    if (cueIndex < 0) return;
    var cue = track.cues[cueIndex];
    var blockIndex = cue.block;
    if (force || blockIndex !== immersiveBlock) {
      immersiveBlock = blockIndex;
      var current = blockText(blockIndex);
      ui.transcriptPrevious.textContent = blockText(blockIndex - 1);
      ui.transcriptNext.textContent = blockText(blockIndex + 1);
      ui.transcriptCurrent.textContent = current;
      ui.transcript.classList.toggle('is-long', current.length > 180);
      ui.transcript.classList.toggle('is-very-long', current.length > 300);
    }
  }
  /* Sleep timer: off, 15, 30, 45 min, or end of chapter. Pauses, does not stop the session. */
  var sleep = { mode: 0, until: 0, tick: null };
  var SLEEP_MODES = [null, 15, 30, 45, 'chapter'];
  function cycleSleep() { setSleep((sleep.mode + 1) % SLEEP_MODES.length); }
  function setSleep(mode) {
    sleep.mode = mode;
    clearInterval(sleep.tick); sleep.tick = null;
    var m = SLEEP_MODES[mode];
    sleep.until = typeof m === 'number' ? Date.now() + m * 60000 : 0;
    if (typeof m === 'number') sleep.tick = setInterval(function () {
      if (Date.now() >= sleep.until) { audio.pause(); setSleep(0); ui.status.textContent = 'Sleep timer paused the book.'; }
      else paintSleep();
    }, 1000);
    paintSleep();
  }
  function paintSleep() {
    if (!ui.sleep) return;
    var m = SLEEP_MODES[sleep.mode], label = 'Sleep';
    if (typeof m === 'number') { var left = Math.max(0, Math.ceil((sleep.until - Date.now()) / 60000)); label = left + ' min'; }
    else if (m === 'chapter') label = 'End of chapter';
    ui.sleep.querySelector('.audio-sleep-label').textContent = label;
    ui.sleep.classList.toggle('active', !!m);
    ui.sleep.setAttribute('aria-pressed', String(!!m));
  }
  function updateBookmarkButton() {
    if (!ui.bookmark) return;
    var number = state.chapter;
    var saved = bookmarks[String(number)];
    ui.bookmark.classList.toggle('active', !!saved);
    ui.bookmark.setAttribute('aria-pressed', String(!!saved));
    ui.bookmark.querySelector('.audio-bookmark-label').textContent = saved ? 'Bookmarked' : 'Bookmark';
    ui.bookmark.title = saved ? 'Remove bookmark saved at ' + formatTime(saved.time) : 'Bookmark this moment';
  }
  function toggleBookmark() {
    if (!track) return;
    var key = String(state.chapter);
    if (bookmarks[key]) delete bookmarks[key];
    else bookmarks[key] = { time: audio.currentTime || 0, title: track.title, savedAt: Date.now() };
    saveBookmarks();
    updateBookmarkButton();
    renderLibrary();
  }
  function updateSegments() {
    if (!ui.segments) return;
    var number = state.chapter || 1;
    Array.prototype.forEach.call(ui.segments.children, function (segment, index) {
      segment.classList.toggle('past', index + 1 < number);
      segment.classList.toggle('current', index + 1 === number);
    });
  }
  function updateTime(forceSave) {
    if (!track) return;
    var duration = track.duration || audio.duration || 0;
    ui.range.max = String(duration);
    ui.immersiveRange.max = String(duration);
    if (!ui.range.matches(':active')) ui.range.value = String(audio.currentTime || 0);
    if (!ui.immersiveRange.matches(':active')) ui.immersiveRange.value = String(audio.currentTime || 0);
    ui.elapsed.textContent = formatTime(audio.currentTime);
    ui.remaining.textContent = '-' + formatTime(Math.max(0, duration - audio.currentTime));
    ui.immersiveElapsed.textContent = formatTime(audio.currentTime);
    ui.immersiveRemaining.textContent = '-' + formatTime(Math.max(0, duration - audio.currentTime));
    state.time = audio.currentTime || 0;
    positionState();
    paintHighlight(state.time);
    updateImmersiveTranscript(state.time, false);
    saveState(!!forceSave);
  }
  function updatePlayButton() {
    var playing = !audio.paused;
    ui.play.textContent = playing ? 'Ⅱ' : '▶';
    ui.play.setAttribute('aria-label', playing ? 'Pause audiobook' : 'Play audiobook');
    ui.shell.classList.toggle('playing', playing);
    ui.status.textContent = playing ? 'Playing' : 'Paused';
    setVisualIcon(ui.immersivePlay, playing ? 'pause' : 'play');
    ui.immersivePlay.setAttribute('aria-label', playing ? 'Pause audiobook' : 'Play audiobook');
    ui.immersive.classList.toggle('playing', playing);
  }
  function positionState() {
    if (!('mediaSession' in navigator) || !track || !navigator.mediaSession.setPositionState) return;
    try {
      var d = track.duration || audio.duration || 0;
      if (d > 0) navigator.mediaSession.setPositionState({ duration: d, playbackRate: audio.playbackRate || 1, position: Math.min(d, audio.currentTime || 0) });
    } catch (e) {}
  }
  function mediaSession() {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'BIG CODE BOOK · Marin',
        album: 'BIG CODE BOOK',
        artwork: [
          { src: new URL(root + 'img/artwork-1024.png', location.href).href, sizes: '1024x1024', type: 'image/png' },
          { src: new URL(root + 'img/icon-512.png', location.href).href, sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', function (detail) { skip(-(detail.seekOffset || 15)); });
      navigator.mediaSession.setActionHandler('seekforward', function (detail) { skip(detail.seekOffset || 15); });
      navigator.mediaSession.setActionHandler('seekto', function (detail) { seekTo(detail.seekTime || 0); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { navigate(state.chapter - 1, true, 0); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { navigate(state.chapter + 1, true, 0); });
    } catch (e) {}
  }
  function chapterButton(chapter) {
    var item = chapterEntry(chapter[0]);
    var saved = bookmarks[String(chapter[0])];
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-chapter' + (chapter[0] === state.chapter ? ' current' : '');
    button.innerHTML = '<span class="audio-chapter-number">' + pad(chapter[0]) + '</span><span class="audio-chapter-copy"><span class="audio-chapter-title"></span><small class="audio-chapter-bookmark"></small></span><span class="audio-chapter-time">' + (item ? formatTime(item.duration) : '') + '</span>';
    button.querySelector('.audio-chapter-title').textContent = chapter[2];
    button.querySelector('.audio-chapter-bookmark').textContent = saved ? 'Bookmark · ' + formatTime(saved.time) : '';
    button.addEventListener('click', function () { navigate(chapter[0], true, saved ? saved.time : 0); });
    return button;
  }
  function renderLibrary() {
    [ui.list, ui.immersiveList].forEach(function (list) {
      if (!list) return;
      list.innerHTML = '';
      chapters.forEach(function (chapter) { list.appendChild(chapterButton(chapter)); });
    });
  }
  function syncBlocks() {
    // Match the narration's paragraph map against the text on screen (only when they are the same chapter).
    clearHighlight();
    blocks = [];
    if (!pageChapter || !track || pageChapter !== state.chapter) { updateGoToText(); return; }
    blocks = narratableBlocks();
    if (track.blocks && blocks.length !== track.blocks) {
      ui.status.textContent = 'Audio and text are out of step on this page.';
      blocks = [];
    }
    blocks.forEach(function (node, index) { node.setAttribute('data-audio-block', String(index)); });
    paintHighlight(audio.currentTime || 0);
    updateImmersiveTranscript(audio.currentTime || 0, true);
    updateGoToText();
  }
  function updateGoToText() {
    var away = !!track && pageChapter !== state.chapter;
    [ui.locate, ui.immersiveLocate].forEach(function (b) {
      if (!b) return;
      b.classList.toggle('away', away);
      b.title = away ? 'Go to chapter ' + pad(state.chapter) + ', where the narrator is' : 'Go to the paragraph being read';
      b.setAttribute('aria-label', b.title);
    });
  }
  function setPage(number) {
    pageChapter = number || 0;
    syncBlocks();
  }
  function loadTrack(number, autoplay, at) {
    var entry = chapterEntry(number);
    if (!entry) { ui.status.textContent = 'Audio is still being prepared.'; ui.play.disabled = true; return; }
    var same = track && state.chapter === number && audio.src;
    track = entry;
    state.chapter = number;
    state.time = Number(at) || 0;
    saveState(true);
    ui.play.disabled = false;
    ui.title.textContent = pad(number) + '. ' + track.title;
    ui.immersiveChapter.textContent = 'CHAPTER ' + pad(number);
    ui.immersiveTitle.textContent = track.title;
    ui.immersive.querySelector('.audio-meta-number').textContent = number;
    ui.range.max = String(track.duration || 0);
    ui.immersiveRange.max = String(track.duration || 0);
    ui.remaining.textContent = '-' + formatTime(track.duration || 0);
    ui.immersiveRemaining.textContent = '-' + formatTime(track.duration || 0);
    updateSegments();
    updateBookmarkButton();
    renderLibrary();
    mediaSession();
    var startAt = state.time;
    function afterMeta() {
      if (startAt > 0 && startAt < (track.duration - 2)) audio.currentTime = startAt;
      audio.playbackRate = state.rate;
      syncBlocks();
      updateTime(true);
      if (autoplay) { var p = audio.play(); if (p && p.catch) p.catch(showPlayError); }
    }
    if (same) { afterMeta(); return; }
    audio.src = root + track.src;
    audio.playbackRate = state.rate;
    ui.rate.value = String(state.rate);
    ui.immersiveRate.value = String(state.rate);
    audio.addEventListener('loadedmetadata', afterMeta, { once: true });
    audio.load();
  }
  function buildImmersive() {
    var immersive = document.createElement('section');
    immersive.className = 'audio-immersive';
    immersive.setAttribute('aria-label', 'Full-screen audiobook player');
    immersive.setAttribute('aria-hidden', 'true');
    immersive.innerHTML = [
      '<div class="audio-immersive-frame">',
      '  <header class="audio-immersive-head">',
      '    <button class="audio-immersive-close audio-icon-action" type="button" aria-label="Minimize audiobook"><img alt="" aria-hidden="true"></button>',
      '    <span class="audio-immersive-chapter">CHAPTER 01</span>',
      '    <button class="audio-immersive-chapters audio-icon-action" type="button" aria-expanded="false"><img alt="" aria-hidden="true"><span>Chapters</span></button>',
      '  </header>',
      '  <div class="audio-segments" aria-label="Chapter progress"></div>',
      '  <div class="audio-transcript" aria-label="Live chapter text">',
      '    <p class="audio-transcript-previous"></p>',
      '    <p class="audio-transcript-current" aria-live="polite"></p>',
      '    <p class="audio-transcript-next"></p>',
      '  </div>',
      '  <footer class="audio-immersive-footer">',
      '    <div class="audio-immersive-meta"><small>CHAPTER <span class="audio-meta-number">1</span></small><strong class="audio-immersive-title"></strong></div>',
      '    <div class="audio-immersive-progress"><input class="audio-immersive-range" type="range" min="0" max="1" step="0.1" value="0" aria-label="Audiobook position"><div><span class="audio-immersive-elapsed">0:00</span><span class="audio-immersive-remaining">-0:00</span></div></div>',
      '    <div class="audio-immersive-controls"></div>',
      '    <div class="audio-immersive-utilities">',
      '      <label class="audio-immersive-rate"><select aria-label="Playback speed"></select><span>Speed</span></label>',
      '      <button class="audio-bookmark" type="button" aria-pressed="false"><img alt="" aria-hidden="true"><span class="audio-bookmark-label">Bookmark</span></button>',
      '      <button class="audio-immersive-locate" type="button"><img alt="" aria-hidden="true"><span>Go to text</span></button>',
      '      <button class="audio-sleep" type="button" aria-pressed="false"><img alt="" aria-hidden="true"><span class="audio-sleep-label">Sleep</span></button>',
      '    </div>',
      '    <p class="audio-memory-note">Progress saved automatically on this device.</p>',
      '  </footer>',
      '</div>',
      '<aside class="audio-immersive-library" aria-hidden="true">',
      '  <div class="audio-immersive-library-head"><div><strong>Chapters</strong><small>Narrated by Marin · AI-generated voice</small></div><button type="button" aria-label="Close chapters">Done</button></div>',
      '  <div class="audio-immersive-list"></div>',
      '</aside>'
    ].join('');
    document.body.appendChild(immersive);
    ui.immersive = immersive;
    ui.immersiveChapter = immersive.querySelector('.audio-immersive-chapter');
    ui.immersiveTitle = immersive.querySelector('.audio-immersive-title');
    ui.immersiveElapsed = immersive.querySelector('.audio-immersive-elapsed');
    ui.immersiveRemaining = immersive.querySelector('.audio-immersive-remaining');
    ui.immersiveRange = immersive.querySelector('.audio-immersive-range');
    ui.immersiveRate = immersive.querySelector('.audio-immersive-rate select');
    ui.bookmark = immersive.querySelector('.audio-bookmark');
    ui.segments = immersive.querySelector('.audio-segments');
    ui.transcript = immersive.querySelector('.audio-transcript');
    ui.transcriptPrevious = immersive.querySelector('.audio-transcript-previous');
    ui.transcriptCurrent = immersive.querySelector('.audio-transcript-current');
    ui.transcriptNext = immersive.querySelector('.audio-transcript-next');
    ui.immersiveChapters = immersive.querySelector('.audio-immersive-chapters');
    ui.immersiveLibrary = immersive.querySelector('.audio-immersive-library');
    ui.immersiveList = immersive.querySelector('.audio-immersive-list');
    playbackRates.forEach(function (rate) {
      var option = document.createElement('option');
      option.value = String(rate);
      option.textContent = rate + '×';
      ui.immersiveRate.appendChild(option);
    });
    ui.immersiveRate.value = String(state.rate);
    immersive.querySelector('.audio-immersive-close img').src = iconSrc('caret-down');
    immersive.querySelector('.audio-immersive-chapters img').src = iconSrc('list');
    ui.bookmark.querySelector('img').src = iconSrc('bookmark-simple');
    ui.immersiveLocate = immersive.querySelector('.audio-immersive-locate');
    ui.immersiveLocate.querySelector('img').src = iconSrc('crosshair');
    ui.immersiveLocate.addEventListener('click', goToText);
    ui.sleep = immersive.querySelector('.audio-sleep');
    ui.sleep.querySelector('img').src = iconSrc('moon');
    ui.sleep.addEventListener('click', cycleSleep);
    for (var i = 0; i < chapters.length; i += 1) ui.segments.appendChild(document.createElement('i'));
    immersive.querySelector('.audio-meta-number').textContent = pageChapter || state.chapter || 1;
    immersive.querySelector('.audio-immersive-close').addEventListener('click', function () { setImmersive(false); });
    (function () {
      var sx = 0, sy = 0, t0 = 0, frame = immersive.querySelector('.audio-immersive-frame');
      frame.addEventListener('touchstart', function (e) { if (e.target.closest('input, select, .audio-immersive-library')) return; var t = e.touches[0]; sx = t.clientX; sy = t.clientY; t0 = Date.now(); }, { passive: true });
      frame.addEventListener('touchmove', function (e) {
        if (!t0) return; var t = e.touches[0], dy = t.clientY - sy, dx = t.clientX - sx;
        if (dy > 0 && Math.abs(dy) > Math.abs(dx)) { frame.style.transform = 'translateY(' + Math.min(dy, 160) * 0.6 + 'px)'; frame.style.transition = 'none'; }
      }, { passive: true });
      frame.addEventListener('touchend', function (e) {
        if (!t0) return; var t = e.changedTouches[0], dy = t.clientY - sy, dx = t.clientX - sx, dt = Date.now() - t0;
        frame.style.transition = 'transform 200ms ease-out'; frame.style.transform = '';
        if (dy > 90 && Math.abs(dy) > Math.abs(dx)) setImmersive(false);
        else if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) navigate(state.chapter + (dx < 0 ? 1 : -1), !audio.paused, 0);
        t0 = 0;
      }, { passive: true });
    })();
    ui.immersiveChapters.addEventListener('click', function () { setImmersiveLibrary(!immersive.classList.contains('library-open')); });
    immersive.querySelector('.audio-immersive-library-head button').addEventListener('click', function () { setImmersiveLibrary(false); });
    ui.immersiveRate.addEventListener('change', function () { setRate(ui.immersiveRate.value); });
    ui.bookmark.addEventListener('click', toggleBookmark);
    ui.immersiveRange.addEventListener('input', function () {
      ui.immersiveElapsed.textContent = formatTime(Number(ui.immersiveRange.value));
      ui.immersiveRemaining.textContent = '-' + formatTime(Math.max(0, Number(ui.immersiveRange.max) - Number(ui.immersiveRange.value)));
    });
    ui.immersiveRange.addEventListener('change', function () { seekTo(Number(ui.immersiveRange.value)); });
    var controls = immersive.querySelector('.audio-immersive-controls');
    controls.appendChild(visualButton('Previous chapter', 'skip-back', function () { navigate(state.chapter - 1, true, 0); }, 'immersive-chapter-control', '', 'Prev chapter'));
    controls.appendChild(visualButton('Go back 15 seconds', 'arrow-counter-clockwise', function () { skip(-15); }, 'immersive-time-control', '15'));
    ui.immersivePlay = visualButton('Play audiobook', 'play', playPause, 'immersive-play');
    controls.appendChild(ui.immersivePlay);
    controls.appendChild(visualButton('Go forward 15 seconds', 'arrow-clockwise', function () { skip(15); }, 'immersive-time-control', '15'));
    controls.appendChild(visualButton('Next chapter', 'skip-forward', function () { navigate(state.chapter + 1, true, 0); }, 'immersive-chapter-control', '', 'Next chapter'));
  }
  function buildUI() {
    var shell = document.createElement('section');
    shell.className = 'audio-player';
    shell.setAttribute('aria-label', 'Audiobook player');
    shell.innerHTML = [
      '<div class="audio-library" aria-label="Audiobook chapters">',
      '  <div class="audio-library-head"><div><strong>Audiobook</strong><small>Narrated by Marin · AI-generated voice</small></div></div>',
      '  <div class="audio-chapters"></div>',
      '</div>',
      '<div class="audio-progress-row"><span class="audio-elapsed">0:00</span><input class="audio-range" type="range" min="0" max="1" step="0.1" value="0" aria-label="Audiobook position"><span class="audio-remaining">-0:00</span></div>',
      '<div class="audio-main">',
      '  <button class="audio-cover" type="button" aria-label="Open full-screen audiobook player" aria-expanded="false"><span>BIG</span><span>CODE</span></button>',
      '  <button class="audio-now" type="button" aria-label="Open full-screen audiobook player"><small class="audio-status">Ready</small><strong class="audio-title">BIG CODE BOOK</strong></button>',
      '  <div class="audio-controls"></div>',
      '  <button class="audio-expand" type="button" aria-expanded="false">Chapters</button>',
      '</div>'
    ].join('');
    document.body.appendChild(shell);
    document.body.classList.add('has-audiobook');
    ui.shell = shell;
    ui.list = shell.querySelector('.audio-chapters');
    ui.elapsed = shell.querySelector('.audio-elapsed');
    ui.remaining = shell.querySelector('.audio-remaining');
    ui.range = shell.querySelector('.audio-range');
    ui.title = shell.querySelector('.audio-title');
    ui.status = shell.querySelector('.audio-status');
    ui.expand = shell.querySelector('.audio-expand');
    ui.openImmersiveButtons = Array.prototype.slice.call(shell.querySelectorAll('.audio-cover, .audio-now'));
    buildImmersive();
    var controls = shell.querySelector('.audio-controls');
    controls.appendChild(iconButton('Previous chapter', '‹', function () { navigate(state.chapter - 1, true, 0); }, 'chapter-skip'));
    controls.appendChild(iconButton('Go back 15 seconds', '−15', function () { skip(-15); }, 'time-skip'));
    ui.play = iconButton('Play audiobook', '▶', playPause, 'audio-play');
    controls.appendChild(ui.play);
    controls.appendChild(iconButton('Go forward 15 seconds', '+15', function () { skip(15); }, 'time-skip'));
    controls.appendChild(iconButton('Next chapter', '›', function () { navigate(state.chapter + 1, true, 0); }, 'chapter-skip'));
    ui.rate = rateSelect('audio-rate'); // kept for state sync; only shown in the full-screen player
    ui.rate.style.display = 'none';
    ui.locate = iconButton('Go to the paragraph being read', '', goToText, 'audio-locate');
    ui.locate.innerHTML = '<img alt="" aria-hidden="true" src="' + iconSrc('crosshair') + '">';
    controls.appendChild(ui.locate);
    ui.expand.addEventListener('click', function () { setExpanded(!state.expanded); });
    shell.querySelector('.audio-cover').addEventListener('click', function () { setImmersive(true); });
    shell.querySelector('.audio-now').addEventListener('click', function () { setImmersive(true); });
    (function () {
      var sy = 0;
      shell.addEventListener('touchstart', function (e) { if (e.target.closest('input')) { sy = 0; return; } sy = e.touches[0].clientY; }, { passive: true });
      shell.addEventListener('touchend', function (e) { if (sy && sy - e.changedTouches[0].clientY > 50) setImmersive(true); sy = 0; }, { passive: true });
    })();
    ui.range.addEventListener('input', function () {
      ui.elapsed.textContent = formatTime(Number(ui.range.value));
      ui.remaining.textContent = '-' + formatTime(Math.max(0, Number(ui.range.max) - Number(ui.range.value)));
    });
    ui.range.addEventListener('change', function () { seekTo(Number(ui.range.value)); });
    setExpanded(state.expanded);
  }
  function bindAudio() {
    audio.addEventListener('play', updatePlayButton);
    audio.addEventListener('pause', function () { updatePlayButton(); updateTime(true); });
    audio.addEventListener('timeupdate', function () { updateTime(false); });
    audio.addEventListener('ratechange', function () { audio.playbackRate = state.rate; });
    audio.addEventListener('ended', function () {
      state.time = 0;
      if (SLEEP_MODES[sleep.mode] === 'chapter') { setSleep(0); saveState(true); updatePlayButton(); ui.status.textContent = 'Stopped at the end of the chapter.'; return; }
      if (state.chapter < chapters.length) navigate(state.chapter + 1, true, 0);
      else { saveState(true); updatePlayButton(); }
    });
    audio.addEventListener('play', function () { if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {} });
    audio.addEventListener('pause', function () { if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = 'paused'; } catch (e) {} });
    audio.addEventListener('ratechange', positionState);
    window.addEventListener('bcb:page', function (e) { setPage(e.detail.chapter); });
    // Tap any narrated paragraph to play the audio from its start.
    document.addEventListener('click', function (event) {
      if (!pageChapter || !manifest) return;
      if (event.target.closest('a, button, dfn, .term, summary, input, select, textarea, code, pre, .sb, .pop, .audio-player, .audio-immersive, svg, label')) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return; // the reader is selecting text, not tapping
      var node = event.target.closest('main p, main li, main dd, main dt, main td, main th, main h1, main h2, main h3, main figcaption, main .h, main .check > .a');
      if (!node || !node.closest('main')) return;
      var entry = chapterEntry(pageChapter);
      if (!entry || !entry.cues) return;
      var list = (pageChapter === state.chapter && blocks.length) ? blocks : narratableBlocks();
      var index = list.indexOf(node);
      if (index < 0) { var outer = list.filter(function (b) { return b.contains(node); })[0]; index = outer ? list.indexOf(outer) : -1; }
      if (index < 0) return;
      var cue = null;
      for (var i = 0; i < entry.cues.length; i += 1) if (entry.cues[i].block === index) { cue = entry.cues[i]; break; }
      if (!cue) return;
      node.classList.remove('audio-jumped'); void node.offsetWidth; node.classList.add('audio-jumped');
      if (pageChapter !== state.chapter) { loadTrack(pageChapter, true, cue.at); return; }
      seekTo(cue.at);
      if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(showPlayError); }
    });
    window.addEventListener('pagehide', function () { updateTime(true); });
    document.addEventListener('keydown', function (event) {
      if (!state.immersive) return;
      if (event.key === 'Escape') {
        if (ui.immersive.classList.contains('library-open')) setImmersiveLibrary(false);
        else setImmersive(false);
      }
      if (/INPUT|BUTTON/.test(document.activeElement && document.activeElement.tagName)) return;
      if (event.key === ' ') { event.preventDefault(); playPause(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); skip(-15); }
      if (event.key === 'ArrowRight') { event.preventDefault(); skip(15); }
    });
  }
  function showFailure() {
    ui.status.textContent = 'Audiobook could not load. Refresh and try again.';
    ui.play.disabled = true;
  }

  window.BCB_AUDIO = {
    resume: function () { return { chapter: state.chapter, time: state.time, title: (chapters[state.chapter - 1] || [])[2] }; },
    play: function (chapter, at) { loadTrack(chapter, true, at); },
    goToText: goToText
  };
  buildUI();
  bindAudio();
  fetch(root + 'audio/manifest.json', { cache: 'no-cache' })
    .then(function (response) { if (!response.ok) throw new Error('manifest'); return response.json(); })
    .then(function (data) {
      manifest = data; renderLibrary();
      var start = pageChapter && (!state.chapter || state.chapter === pageChapter || !state.time) ? pageChapter : state.chapter;
      var at = (start === state.chapter) ? state.time : 0;
      loadTrack(start || 1, false, at);
      if (state.immersive) setImmersive(true);
    })
    .catch(showFailure);
})();
