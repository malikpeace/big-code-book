/* BIG CODE BOOK audiobook player. Plain JavaScript, like the rest of the book. */
(function () {
  'use strict';

  var config = window.BIG_CODE_BOOK_AUDIO;
  if (!config) return;
  var root = config.root;
  var pageChapter = config.chapter;
  var chapters = config.chapters;
  var audio = new Audio();
  audio.preload = 'metadata';
  var manifest = null;
  var track = null;
  var blocks = [];
  var activeBlock = null;
  var immersiveBlock = null;
  var lastSave = 0;
  var returnScrollY = 0;
  var state = readState();
  var bookmarks = readBookmarks();
  var ui = {};

  function readState() {
    try {
      var parsed = JSON.parse(localStorage.getItem('bcb_audio_state') || '{}');
      return {
        chapter: Number(parsed.chapter) || 1,
        time: Number(parsed.time) || 0,
        rate: Number(parsed.rate) || 1,
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
      return !nested && !node.closest('pre, script, style, svg, textarea, button, nav, .sb, .src, .audio-player, .audio-library, .audio-immersive');
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
    if (yes && !pageChapter) {
      state.immersive = true;
      saveState(true);
      navigate(state.chapter || 1, false, state.time || 0);
      return;
    }
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
  function navigate(number, autoplay, at) {
    if (number < 1 || number > chapters.length) return;
    state.chapter = number;
    state.time = Number(at) || 0;
    state.pendingPlay = !!autoplay;
    saveState(true);
    location.href = chapterHref(number);
  }
  function playPause() {
    if (!pageChapter) {
      navigate(state.chapter || 1, true, state.time || 0);
      return;
    }
    if (!track) return;
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
  function changeRate() {
    var rates = [0.75, 1, 1.25, 1.5, 1.75, 2];
    var index = rates.indexOf(state.rate);
    state.rate = rates[(index + 1) % rates.length];
    audio.playbackRate = state.rate;
    ui.rate.textContent = state.rate + '×';
    ui.immersiveRate.querySelector('strong').textContent = state.rate + '×';
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
  function paintHighlight(time) {
    if (!pageChapter || !track) return;
    var cue = track.cues[currentCueIndex(time)];
    var index = cue ? cue.block : 0;
    if (index === activeBlock) return;
    if (activeBlock !== null && blocks[activeBlock]) blocks[activeBlock].classList.remove('audio-reading');
    activeBlock = index;
    var node = blocks[index];
    if (!node) return;
    node.classList.add('audio-reading');
    if (!audio.paused && !state.immersive) {
      var rect = node.getBoundingClientRect();
      if (rect.top < 90 || rect.bottom > window.innerHeight - 150) {
        node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }
  function renderCurrentWords(text) {
    ui.transcriptCurrent.innerHTML = '';
    ui.transcriptCurrent.setAttribute('aria-label', text);
    var words = text.split(/\s+/).filter(Boolean);
    words.forEach(function (word, index) {
      var span = document.createElement('span');
      span.textContent = word + (index < words.length - 1 ? ' ' : '');
      span.setAttribute('aria-hidden', 'true');
      ui.transcriptCurrent.appendChild(span);
    });
    ui.currentWords = Array.prototype.slice.call(ui.transcriptCurrent.children);
  }
  function updateImmersiveTranscript(time, force) {
    if (!state.immersive || !pageChapter || !track || !blocks.length) return;
    var cueIndex = currentCueIndex(time);
    if (cueIndex < 0) return;
    var cue = track.cues[cueIndex];
    var blockIndex = cue.block;
    if (force || blockIndex !== immersiveBlock) {
      immersiveBlock = blockIndex;
      var current = blockText(blockIndex);
      ui.transcriptPrevious.textContent = blockText(blockIndex - 1);
      ui.transcriptNext.textContent = blockText(blockIndex + 1);
      renderCurrentWords(current);
      ui.transcript.classList.toggle('is-long', current.length > 180);
      ui.transcript.classList.toggle('is-very-long', current.length > 300);
    }
    var nextAt = track.cues[cueIndex + 1] ? track.cues[cueIndex + 1].at : track.duration;
    var span = Math.max(0.25, nextAt - cue.at);
    var ratio = Math.max(0, Math.min(0.999, (time - cue.at) / span));
    var activeWord = Math.floor(ratio * Math.max(1, ui.currentWords.length));
    ui.currentWords.forEach(function (word, index) {
      word.classList.toggle('heard', index < activeWord);
      word.classList.toggle('speaking', index === activeWord);
    });
  }
  function updateBookmarkButton() {
    if (!ui.bookmark) return;
    var number = pageChapter || state.chapter;
    var saved = bookmarks[String(number)];
    ui.bookmark.classList.toggle('active', !!saved);
    ui.bookmark.setAttribute('aria-pressed', String(!!saved));
    ui.bookmark.querySelector('.audio-bookmark-label').textContent = saved ? 'Bookmarked' : 'Bookmark';
    ui.bookmark.title = saved ? 'Remove bookmark saved at ' + formatTime(saved.time) : 'Bookmark this moment';
  }
  function toggleBookmark() {
    if (!pageChapter || !track) return;
    var key = String(pageChapter);
    if (bookmarks[key]) delete bookmarks[key];
    else bookmarks[key] = { time: audio.currentTime || 0, title: track.title, savedAt: Date.now() };
    saveBookmarks();
    updateBookmarkButton();
    renderLibrary();
  }
  function updateSegments() {
    if (!ui.segments) return;
    var number = pageChapter || state.chapter || 1;
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
    state.chapter = pageChapter || state.chapter;
    state.time = audio.currentTime || 0;
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
  function mediaSession() {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: 'BIG CODE BOOK · Marin',
        album: 'BIG CODE BOOK',
        artwork: [
          { src: new URL(root + 'img/icon-192.png', location.href).href, sizes: '192x192', type: 'image/png' },
          { src: new URL(root + 'img/icon-512.png', location.href).href, sizes: '512x512', type: 'image/png' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', function (detail) { skip(-(detail.seekOffset || 15)); });
      navigator.mediaSession.setActionHandler('seekforward', function (detail) { skip(detail.seekOffset || 15); });
      navigator.mediaSession.setActionHandler('seekto', function (detail) { seekTo(detail.seekTime || 0); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { navigate(pageChapter - 1, true, 0); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { navigate(pageChapter + 1, true, 0); });
    } catch (e) {}
  }
  function chapterButton(chapter) {
    var item = chapterEntry(chapter[0]);
    var saved = bookmarks[String(chapter[0])];
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-chapter' + (chapter[0] === pageChapter ? ' current' : '');
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
  function loadPageTrack() {
    var number = pageChapter || state.chapter || 1;
    track = chapterEntry(number);
    if (!track) {
      ui.status.textContent = 'Audio is still being prepared.';
      ui.play.disabled = true;
      return;
    }
    ui.play.disabled = false;
    ui.title.textContent = pad(number) + '. ' + track.title;
    ui.immersiveChapter.textContent = 'CHAPTER ' + pad(number);
    ui.immersiveTitle.textContent = track.title;
    ui.range.max = String(track.duration || 0);
    ui.immersiveRange.max = String(track.duration || 0);
    ui.remaining.textContent = '-' + formatTime(track.duration || 0);
    ui.immersiveRemaining.textContent = '-' + formatTime(track.duration || 0);
    updateSegments();
    updateBookmarkButton();
    if (!pageChapter) return;
    blocks = narratableBlocks();
    if (track.blocks && blocks.length !== track.blocks) {
      ui.status.textContent = 'Audio needs to be regenerated for this revision.';
      ui.play.disabled = true;
      return;
    }
    blocks.forEach(function (node, index) { node.setAttribute('data-audio-block', String(index)); });
    audio.src = root + track.src;
    audio.playbackRate = state.rate;
    ui.rate.textContent = state.rate + '×';
    ui.immersiveRate.querySelector('strong').textContent = state.rate + '×';
    audio.addEventListener('loadedmetadata', function () {
      if (state.chapter === pageChapter && state.time > 0 && state.time < (track.duration - 2)) audio.currentTime = state.time;
      paintHighlight(audio.currentTime || 0);
      updateImmersiveTranscript(audio.currentTime || 0, true);
      if (state.immersive) setImmersive(true);
      if (state.pendingPlay) {
        state.pendingPlay = false;
        saveState(true);
        var promise = audio.play();
        if (promise && promise.catch) promise.catch(showPlayError);
      }
    }, { once: true });
    mediaSession();
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
      '      <button class="audio-immersive-rate" type="button" aria-label="Change playback speed"><strong>1×</strong><span>Speed</span></button>',
      '      <button class="audio-bookmark" type="button" aria-pressed="false"><img alt="" aria-hidden="true"><span class="audio-bookmark-label">Bookmark</span></button>',
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
    ui.immersiveRate = immersive.querySelector('.audio-immersive-rate');
    ui.bookmark = immersive.querySelector('.audio-bookmark');
    ui.segments = immersive.querySelector('.audio-segments');
    ui.transcript = immersive.querySelector('.audio-transcript');
    ui.transcriptPrevious = immersive.querySelector('.audio-transcript-previous');
    ui.transcriptCurrent = immersive.querySelector('.audio-transcript-current');
    ui.transcriptNext = immersive.querySelector('.audio-transcript-next');
    ui.immersiveChapters = immersive.querySelector('.audio-immersive-chapters');
    ui.immersiveLibrary = immersive.querySelector('.audio-immersive-library');
    ui.immersiveList = immersive.querySelector('.audio-immersive-list');
    ui.currentWords = [];
    immersive.querySelector('.audio-immersive-close img').src = iconSrc('caret-down');
    immersive.querySelector('.audio-immersive-chapters img').src = iconSrc('list');
    ui.bookmark.querySelector('img').src = iconSrc('bookmark-simple');
    for (var i = 0; i < chapters.length; i += 1) ui.segments.appendChild(document.createElement('i'));
    immersive.querySelector('.audio-meta-number').textContent = pageChapter || state.chapter || 1;
    immersive.querySelector('.audio-immersive-close').addEventListener('click', function () { setImmersive(false); });
    ui.immersiveChapters.addEventListener('click', function () { setImmersiveLibrary(!immersive.classList.contains('library-open')); });
    immersive.querySelector('.audio-immersive-library-head button').addEventListener('click', function () { setImmersiveLibrary(false); });
    ui.immersiveRate.addEventListener('click', changeRate);
    ui.bookmark.addEventListener('click', toggleBookmark);
    ui.immersiveRange.addEventListener('input', function () {
      ui.immersiveElapsed.textContent = formatTime(Number(ui.immersiveRange.value));
      ui.immersiveRemaining.textContent = '-' + formatTime(Math.max(0, Number(ui.immersiveRange.max) - Number(ui.immersiveRange.value)));
    });
    ui.immersiveRange.addEventListener('change', function () { seekTo(Number(ui.immersiveRange.value)); });
    var controls = immersive.querySelector('.audio-immersive-controls');
    controls.appendChild(visualButton('Previous chapter', 'skip-back', function () { navigate((pageChapter || state.chapter) - 1, true, 0); }, 'immersive-chapter-control', '', 'Prev chapter'));
    controls.appendChild(visualButton('Go back 15 seconds', 'arrow-counter-clockwise', function () { skip(-15); }, 'immersive-time-control', '15'));
    ui.immersivePlay = visualButton('Play audiobook', 'play', playPause, 'immersive-play');
    controls.appendChild(ui.immersivePlay);
    controls.appendChild(visualButton('Go forward 15 seconds', 'arrow-clockwise', function () { skip(15); }, 'immersive-time-control', '15'));
    controls.appendChild(visualButton('Next chapter', 'skip-forward', function () { navigate((pageChapter || state.chapter) + 1, true, 0); }, 'immersive-chapter-control', '', 'Next chapter'));
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
    controls.appendChild(iconButton('Previous chapter', '‹', function () { navigate((pageChapter || state.chapter) - 1, true, 0); }, 'chapter-skip'));
    controls.appendChild(iconButton('Go back 15 seconds', '−15', function () { skip(-15); }, 'time-skip'));
    ui.play = iconButton('Play audiobook', '▶', playPause, 'audio-play');
    controls.appendChild(ui.play);
    controls.appendChild(iconButton('Go forward 15 seconds', '+15', function () { skip(15); }, 'time-skip'));
    controls.appendChild(iconButton('Next chapter', '›', function () { navigate((pageChapter || state.chapter) + 1, true, 0); }, 'chapter-skip'));
    ui.rate = iconButton('Change playback speed', state.rate + '×', changeRate, 'audio-rate');
    controls.appendChild(ui.rate);
    ui.expand.addEventListener('click', function () { setExpanded(!state.expanded); });
    shell.querySelector('.audio-cover').addEventListener('click', function () { setImmersive(true); });
    shell.querySelector('.audio-now').addEventListener('click', function () { setImmersive(true); });
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
      if (pageChapter < chapters.length) navigate(pageChapter + 1, true, 0);
      else { state.pendingPlay = false; saveState(true); updatePlayButton(); }
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

  buildUI();
  bindAudio();
  fetch(root + 'audio/manifest.json', { cache: 'no-cache' })
    .then(function (response) { if (!response.ok) throw new Error('manifest'); return response.json(); })
    .then(function (data) { manifest = data; renderLibrary(); loadPageTrack(); })
    .catch(showFailure);
})();
