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
  var lastSave = 0;
  var state = readState();
  var ui = {};

  function readState() {
    try {
      var parsed = JSON.parse(localStorage.getItem('bcb_audio_state') || '{}');
      return {
        chapter: Number(parsed.chapter) || 1,
        time: Number(parsed.time) || 0,
        rate: Number(parsed.rate) || 1,
        pendingPlay: !!parsed.pendingPlay,
        expanded: !!parsed.expanded
      };
    } catch (e) {
      return { chapter: 1, time: 0, rate: 1, pendingPlay: false, expanded: false };
    }
  }
  function saveState(force) {
    var now = Date.now();
    if (!force && now - lastSave < 1000) return;
    lastSave = now;
    try { localStorage.setItem('bcb_audio_state', JSON.stringify(state)); } catch (e) {}
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
  function narratableBlocks() {
    var selector = [
      'main h1', 'main h2', 'main h3', 'main p', 'main li', 'main summary',
      'main dt', 'main dd', 'main th', 'main td', 'main .box > .h',
      'main .lane > .h', 'main .ex > .h'
    ].join(',');
    return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(function (node) {
      return !node.closest('pre, figure, script, style, svg, textarea, button, nav, .sb, .src, .audio-player, .audio-library');
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
  function navigate(number, autoplay, at) {
    if (number < 1 || number > chapters.length) return;
    state.chapter = number;
    state.time = at || 0;
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
  function skip(seconds) {
    seekTo(audio.currentTime + seconds);
  }
  function changeRate() {
    var rates = [0.75, 1, 1.25, 1.5, 1.75, 2];
    var index = rates.indexOf(state.rate);
    state.rate = rates[(index + 1) % rates.length];
    audio.playbackRate = state.rate;
    ui.rate.textContent = state.rate + '×';
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
    if (!audio.paused) {
      var rect = node.getBoundingClientRect();
      if (rect.top < 90 || rect.bottom > window.innerHeight - 150) {
        node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }
  function updateTime(forceSave) {
    if (!track) return;
    var duration = track.duration || audio.duration || 0;
    ui.range.max = String(duration);
    if (!ui.range.matches(':active')) ui.range.value = String(audio.currentTime || 0);
    ui.elapsed.textContent = formatTime(audio.currentTime);
    ui.remaining.textContent = '-' + formatTime(Math.max(0, duration - audio.currentTime));
    state.chapter = pageChapter || state.chapter;
    state.time = audio.currentTime || 0;
    paintHighlight(state.time);
    saveState(!!forceSave);
  }
  function updatePlayButton() {
    var playing = !audio.paused;
    ui.play.textContent = playing ? 'Ⅱ' : '▶';
    ui.play.setAttribute('aria-label', playing ? 'Pause audiobook' : 'Play audiobook');
    ui.shell.classList.toggle('playing', playing);
    ui.status.textContent = playing ? 'Playing' : 'Paused';
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
  function renderLibrary() {
    ui.list.innerHTML = '';
    chapters.forEach(function (chapter) {
      var item = chapterEntry(chapter[0]);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'audio-chapter' + (chapter[0] === pageChapter ? ' current' : '');
      button.innerHTML = '<span class="audio-chapter-number">' + pad(chapter[0]) + '</span><span class="audio-chapter-title"></span><span class="audio-chapter-time">' + (item ? formatTime(item.duration) : '') + '</span>';
      button.querySelector('.audio-chapter-title').textContent = chapter[2];
      button.addEventListener('click', function () { navigate(chapter[0], true, 0); });
      ui.list.appendChild(button);
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
    ui.range.max = String(track.duration || 0);
    ui.remaining.textContent = '-' + formatTime(track.duration || 0);
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
    audio.addEventListener('loadedmetadata', function () {
      if (state.chapter === pageChapter && state.time > 0 && state.time < (track.duration - 2)) audio.currentTime = state.time;
      paintHighlight(audio.currentTime || 0);
      if (state.pendingPlay) {
        state.pendingPlay = false;
        saveState(true);
        var promise = audio.play();
        if (promise && promise.catch) promise.catch(showPlayError);
      }
    }, { once: true });
    mediaSession();
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
      '  <button class="audio-cover" type="button" aria-label="Open audiobook chapters"><span>BIG</span><span>CODE</span></button>',
      '  <div class="audio-now"><small class="audio-status">Ready</small><strong class="audio-title">BIG CODE BOOK</strong></div>',
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
    shell.querySelector('.audio-cover').addEventListener('click', function () { setExpanded(!state.expanded); });
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
