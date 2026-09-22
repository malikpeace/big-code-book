/* BIG CODE BOOK: the one script. No framework, no build step, on purpose.
   Read it top to bottom in chapter 14 if you want to see how the book itself works. */
(function () {
  'use strict';

  /* ---------- 1. The table of contents. One list, used everywhere. ---------- */
  var WEEKS = [
    'Week 1: The machine and the story',
    'Week 2: The tools, then the language begins',
    'Week 3: From language to app',
    'Week 4: The back half of the journey',
    'Week 5: Reading Memento\'s future',
    'Week 6: Architecture, supervision, graduation'
  ];
  var CHAPTERS = [
    [1, 'the-machine', 'The machine does exactly what you say'],
    [2, 'tap-a-button', 'What happens when you tap a button'],
    [3, 'seventy-years', 'Seventy years of coding in one hour'],
    [4, 'ai-ate-coding', 'How AI ate coding'],
    [5, 'files-and-paths', 'Files, folders, paths, and an editor'],
    [6, 'the-terminal', 'The terminal is a conversation'],
    [7, 'git-1', 'Git 1: snapshots and history'],
    [8, 'git-2', 'Git 2: branches, merges, conflicts'],
    [9, 'js-1-values', 'JavaScript 1: values and variables'],
    [10, 'js-2-functions', 'JavaScript 2: functions and the stack'],
    [11, 'js-3-flow', 'JavaScript 3: flow, loops, objects'],
    [12, 'js-4-async', 'JavaScript 4: async and the event loop'],
    [13, 'html-css-dom', 'HTML, CSS, and how a screen gets drawn'],
    [14, 'state-render-events', 'State, render, events'],
    [15, 'how-the-web-works', 'How the web works'],
    [16, 'backends', 'Backends: servers, routes, edge functions'],
    [17, 'databases', 'Databases, SQL, migrations, trust'],
    [18, 'auth', 'Auth: who you are, what you may do'],
    [19, 'packages-secrets', 'Packages, dependencies, secrets'],
    [20, 'deploy-operate', 'Deploy and operate'],
    [21, 'typescript', 'TypeScript: types as contracts'],
    [22, 'react-native', 'React and React Native'],
    [23, 'debugging', 'Errors, logs, stack traces, debugging'],
    [24, 'testing', 'Testing'],
    [25, 'security-performance', 'Security and performance'],
    [26, 'architecture-debt', 'Architecture and technical debt'],
    [27, 'ai-engineer-1', 'The AI-assisted engineer, part 1'],
    [28, 'ai-engineer-2', 'The AI-assisted engineer, part 2'],
    [29, 'run-native', 'Run Memento\'s native app yourself'],
    [30, 'graduation', 'Graduation']
  ];
  var PASSPHRASE = 'banana'; // A lock on a screen door. This is obscurity, not security. Chapter 18 explains why.

  /* ---------- 2. Tiny helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  // localStorage can be missing or throw (private mode). Every read and write is wrapped.
  function store(key, val) {
    try {
      if (val === undefined) { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  // The book's root as an absolute URL, taken from this script's own address. Pages are swapped in
  // place (see section 13), so every link and asset path is built from this, never from the page.
  var root = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (!s) { var tags = document.getElementsByTagName('script'); s = tags[tags.length - 1].src; }
    return s.replace(/js\/book\.js.*$/, '');
  })();
  var chapterNo = parseInt(document.body.getAttribute('data-chapter') || '0', 10);
  var topLabel = null;
  var isPhone = function () { return window.innerWidth < 900; };

  /* ---------- 3. Progress (local to this device) ---------- */
  function progress() { return store('bcb_progress') || { done: {}, skipped: {}, checks: {} }; }
  function saveProgress(p) { store('bcb_progress', p); }
  function markDone(n, yes) { var p = progress(); if (yes) p.done[n] = Date.now(); else delete p.done[n]; saveProgress(p); renderSide(); }

  /* ---------- 4. Passphrase gate ---------- */
  function gate(next) {
    if (store('bcb_gate') === PASSPHRASE) return next();
    var input = el('input', { type: 'password', placeholder: 'passphrase', autocomplete: 'off', autocapitalize: 'off' });
    var msg = el('p', {}, ['BIG CODE BOOK. Say the word.']);
    var form = el('form', { onsubmit: function (e) {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === PASSPHRASE) { store('bcb_gate', PASSPHRASE); g.remove(); next(); }
      else { msg.textContent = 'Nope. Try again.'; input.value = ''; input.focus(); }
    } }, [msg, input, el('button', { class: 'btn primary', type: 'submit' }, ['Open'])]);
    var g = el('div', { class: 'gate' }, [form]);
    document.body.appendChild(g);
    setTimeout(function () { input.focus(); }, 50);
  }

  /* ---------- 5. Theme ---------- */
  function applyTheme() {
    var t = store('bcb_theme');
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  }
  function toggleTheme() {
    var dark = matchMedia('(prefers-color-scheme: dark)').matches;
    var cur = store('bcb_theme') || (dark ? 'dark' : 'light');
    store('bcb_theme', cur === 'dark' ? 'light' : 'dark');
    applyTheme();
  }
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_FOCUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  /* ---------- 5a. Text size, Kindle style: five steps, remembered ---------- */
  var sizebar = null;
  function applySize() { var s = store('bcb_size') || 2; if (s === 2) document.documentElement.removeAttribute('data-size'); else document.documentElement.setAttribute('data-size', String(s)); if (sizebar) $('.lvl', sizebar).textContent = ['XS', 'S', 'M', 'L', 'XL', 'XXL'][s]; }
  function stepSize(d) { var s = Math.max(1, Math.min(5, (store('bcb_size') || 2) + d)); store('bcb_size', s); applySize(); }
  function toggleSizebar() {
    if (!sizebar) {
      sizebar = el('div', { class: 'sizebar', role: 'group', 'aria-label': 'Text size' }, [
        el('button', { class: 'btn', 'aria-label': 'Smaller text', onclick: function () { stepSize(-1); } }, ['A\u2212']),
        el('span', { class: 'lvl' }, ['M']),
        el('button', { class: 'btn', 'aria-label': 'Bigger text', onclick: function () { stepSize(1); } }, ['A+'])
      ]);
      document.body.appendChild(sizebar); applySize();
      document.addEventListener('click', function (e) { if (sizebar.classList.contains('open') && !sizebar.contains(e.target) && !e.target.closest('.aa')) sizebar.classList.remove('open'); });
    }
    sizebar.classList.toggle('open');
  }
  var ICON_AA = 'Aa';

  /* ---------- 5b. Focus mode: hide everything but the words ---------- */
  function applyFocus() { document.documentElement.classList.toggle('focus', !!store('bcb_focus')); }
  function toggleFocus() { store('bcb_focus', !store('bcb_focus')); applyFocus(); if (side) side.classList.remove('open'); document.body.classList.remove('drawer-open'); }

  /* ---------- 6. Sidebar + topbar ---------- */
  var side;
  function renderSide() {
    if (!side) return;
    var p = progress();
    var doneCount = Object.keys(p.done).length;
    side.innerHTML = '';
    side.appendChild(el('div', { class: 'brand' }, [
      el('a', { href: root + 'index.html' }, ['BIG CODE BOOK']),
      el('div', { class: 'btns' }, [
        el('button', { class: 'icon-btn aa', 'aria-label': 'Text size', title: 'Text size', onclick: toggleSizebar }, [ICON_AA]),
        el('button', { class: 'icon-btn', 'aria-label': 'Focus mode', title: 'Focus: only the words', html: ICON_FOCUS, onclick: toggleFocus }),
        el('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark', html: ICON_SUN, onclick: toggleTheme })
      ])
    ]));
    side.appendChild(el('div', { class: 'prog' }, [el('i', { style: 'width:' + Math.round(doneCount / CHAPTERS.length * 100) + '%' })]));
    side.appendChild(el('div', { class: 'prog-t' }, [doneCount + ' of ' + CHAPTERS.length + ' done']));
    CHAPTERS.forEach(function (c, i) {
      if (i % 5 === 0) side.appendChild(el('div', { class: 'week' }, [WEEKS[i / 5]]));
      var pad = c[0] < 10 ? '0' + c[0] : '' + c[0];
      var a = el('a', { class: 'ch' + (c[0] === chapterNo ? ' here' : '') + (p.done[c[0]] ? ' is-done' : ''), href: root + 'chapters/' + pad + '-' + c[1] + '.html' }, [
        el('span', { class: 'n' }, [String(c[0])]), el('span', {}, [c[2]]), el('span', { class: 'done' })
      ]);
      side.appendChild(a);
    });
    side.appendChild(el('div', { class: 'week' }, ['Reference']));
    side.appendChild(el('a', { class: 'ch', href: root + 'glossary.html' }, [el('span', { class: 'n' }, ['']), el('span', {}, ['Glossary'])]));
  }
  function mountChrome() {
    var wrap = el('div', { class: 'wrap' });
    side = el('nav', { class: 'side', 'aria-label': 'Contents' });
    var main = $('main') || el('main');
    var col = el('div', { style: 'min-width:0' });
    var top = el('div', { class: 'topbar' }, [
      el('button', { class: 'icon-btn', 'aria-label': 'Open contents', html: ICON_MENU, onclick: function () { side.classList.add('open'); document.body.classList.add('drawer-open'); } }),
      (topLabel = el('span', { class: 't' }, [chapterNo ? 'Chapter ' + chapterNo : 'BIG CODE BOOK'])),
      el('div', { class: 'btns' }, [
        el('button', { class: 'icon-btn aa', 'aria-label': 'Text size', title: 'Text size', onclick: toggleSizebar }, [ICON_AA]),
        el('button', { class: 'icon-btn', 'aria-label': 'Focus mode', title: 'Focus: only the words', html: ICON_FOCUS, onclick: toggleFocus }),
        el('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark', html: ICON_SUN, onclick: toggleTheme })
      ])
    ]);
    document.body.appendChild(el('button', { class: 'btn focus-exit', onclick: toggleFocus }, ['Exit focus']));
    document.body.insertBefore(wrap, document.body.firstChild);
    wrap.appendChild(side); wrap.appendChild(col); col.appendChild(top); col.appendChild(main);
    renderSide();
    document.addEventListener('click', function (e) {
      if (side.classList.contains('open') && !side.contains(e.target) && !top.contains(e.target)) { side.classList.remove('open'); document.body.classList.remove('drawer-open'); }
    });
    // Swipe in from the left edge opens the contents, like a native drawer.
    var sx = null, sy = null;
    document.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX < 24 ? t.clientX : null; sy = t.clientY; }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (sx === null) return; var t = e.touches[0];
      if (t.clientX - sx > 50 && Math.abs(t.clientY - sy) < 40) { side.classList.add('open'); document.body.classList.add('drawer-open'); sx = null; }
    }, { passive: true });
  }

  /* ---------- 7. Chapter furniture: prev/next, done button, tags ---------- */
  function chapterFurniture() {
    if (!chapterNo) return;
    var main = $('main');
    var i = chapterNo - 1;
    var pn = el('div', { class: 'pn' });
    function link(c, cls, label) {
      var pad = c[0] < 10 ? '0' + c[0] : '' + c[0];
      return el('a', { class: cls, href: root + 'chapters/' + pad + '-' + c[1] + '.html' }, [el('small', {}, [label]), c[0] + '. ' + c[2]]);
    }
    if (CHAPTERS[i - 1]) pn.appendChild(link(CHAPTERS[i - 1], 'prev', 'Previous')); else pn.appendChild(el('span'));
    if (CHAPTERS[i + 1]) pn.appendChild(link(CHAPTERS[i + 1], 'next', 'Next'));
    var doneBtn = el('button', { class: 'btn' });
    function paint() { doneBtn.textContent = progress().done[chapterNo] ? 'Done. Tap to undo' : 'Mark chapter done'; doneBtn.className = 'btn' + (progress().done[chapterNo] ? '' : ' primary'); }
    doneBtn.addEventListener('click', function () { markDone(chapterNo, !progress().done[chapterNo]); paint(); });
    paint();
    main.appendChild(el('div', { class: 'done-row' }, [doneBtn]));
    main.appendChild(pn);
  }

  /* ---------- 8. Device gating ---------- */
  function gateMacOnly() {
    $$('[data-device="mac"]').forEach(function (ex) {
      if (!isPhone()) return;
      var p = progress();
      var panel = el('div', { class: 'macgate' }, [
        el('div', {}, [el('strong', {}, ['Mac only.']), ' This part needs Terminal, and a phone does not have one. Skip it for now, or continue on your Mac.']),
        el('div', { class: 'btns' }, [
          el('button', { class: 'btn', onclick: function () { p.skipped[chapterNo] = true; saveProgress(p); panel.querySelector('.btns').textContent = 'Skipped. It is waiting for you on the Mac.'; } }, ['Skip for now']),
          el('button', { class: 'btn primary', onclick: function () { panel.replaceWith(ex); } }, ['Show it anyway'])
        ])
      ]);
      ex.replaceWith(panel);
    });
  }

  /* ---------- 9. Glossary chips ---------- */
  var glossary = null, pop = null;
  function loadGlossary(cb) {
    if (glossary) return cb(glossary);
    var x = new XMLHttpRequest();
    x.open('GET', root + 'glossary.json'); x.onload = function () { try { glossary = JSON.parse(x.responseText); } catch (e) { glossary = {}; } cb(glossary); };
    x.onerror = function () { glossary = {}; cb(glossary); };
    x.send();
  }
  function bestDef(entry, upTo) {
    // The definition a reader has "earned": the latest one whose chapter is not ahead of where they are.
    var best = entry.levels[0];
    entry.levels.forEach(function (l) { if (l.ch <= (upTo || 999) && l.ch >= best.ch) best = l; });
    return best;
  }
  var STOP = { code: 1, test: 1, log: 1, path: 1, program: 1, file: 1, files: 1, event: 1, network: 1 }; // too common to underline every time
  function markLaterMentions(g) {
    // Every glossary word after its first (bold) mention gets a quiet underline, so it is always tappable.
    var aliases = [];
    Object.keys(g).forEach(function (slug) {
      var t = g[slug].term.replace(/\s*\(.*\)\s*$/, '').trim();
      [t, slug.replace(/-/g, ' ')].forEach(function (a) { a = a.trim(); if (a.length > 2 && !STOP[a.toLowerCase()]) aliases.push([a.toLowerCase(), slug]); });
    });
    var map = {}; aliases.forEach(function (p) { if (!map[p[0]]) map[p[0]] = p[1]; });
    var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    if (!keys.length) return;
    var re = new RegExp('(^|[^A-Za-z0-9])(' + keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')(?=$|[^A-Za-z0-9])', 'i');
    var SKIP = 'DFN,CODE,PRE,A,SVG,BUTTON,H1,H2,H3,SUMMARY,TEXTAREA,STYLE,SCRIPT';
    $$('main p, main li, main dd, main td').forEach(function (block) {
      if (block.closest('.sb, .src, .meta, .kicker, .pop, figure, .words, .check')) return;
      var seen = {};
      var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
      var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        var p = node.parentNode;
        for (var a = p; a && a !== block; a = a.parentNode) if (SKIP.indexOf(a.tagName) >= 0 || (a.classList && a.classList.contains('term'))) return;
        var s = node.nodeValue, r2 = new RegExp(re.source, 'gi'), mm, pos = 0, frag = document.createDocumentFragment(), hit = false;
        while ((mm = r2.exec(s)) !== null) {
          var st = mm.index + mm[1].length, en = st + mm[2].length, sl = map[mm[2].toLowerCase()];
          if (seen[sl]) continue;
          seen[sl] = 1; hit = true;
          frag.appendChild(document.createTextNode(s.slice(pos, st)));
          frag.appendChild(el('span', { class: 'term', 'data-term': sl }, [s.slice(st, en)]));
          pos = en;
        }
        if (!hit) return;
        frag.appendChild(document.createTextNode(s.slice(pos)));
        p.replaceChild(frag, node);
      });
    });
  }
  function chips() {
    loadGlossary(function (g) {
      markLaterMentions(g);
      var dfns = $$('dfn[data-term], .term[data-term]');
      if (!dfns.length) return;
      dfns.forEach(function (d) {
        d.setAttribute('tabindex', '0');
        function show() {
          hide();
          var entry = g[d.getAttribute('data-term')];
          if (!entry) return;
          var lvl = bestDef(entry, chapterNo || 999);
          var first = entry.levels[0];
          var ahead = entry.levels.filter(function (l) { return l.ch > (chapterNo || 999); }).length;
          var kids = [el('div', { class: 't' }, [entry.term])];
          // Always show the simplest definition first, then the one the reader has earned, if different.
          kids.push(el('div', { class: 'eli' }, [el('span', { class: 'k' }, ['LIKE YOU ARE 5']), first.def]));
          if (lvl.ch !== first.ch) kids.push(el('div', { class: 'real' }, [el('span', { class: 'k' }, ['THE REAL THING, CHAPTER ' + lvl.ch]), lvl.def]));
          kids.push(el('div', { class: 'lvl' }, [ahead ? ahead + ' deeper definition' + (ahead > 1 ? 's' : '') + ' ahead.' : 'This is the deepest definition in the book.']));
          pop = el('div', { class: 'pop', role: 'tooltip' }, kids);
          document.body.appendChild(pop);
          var r = d.getBoundingClientRect(); var pw = pop.offsetWidth, ph = pop.offsetHeight;
          var left = Math.max(16, Math.min(r.left, window.innerWidth - pw - 16));
          var top = r.bottom + 8 + ph > window.innerHeight ? r.top - ph - 8 : r.bottom + 8;
          pop.style.left = left + 'px'; pop.style.top = top + 'px';
        }
        function hide() { if (pop) { pop.remove(); pop = null; } }
        d.addEventListener('click', function (e) { e.stopPropagation(); if (pop) hide(); else show(); });
        if (matchMedia('(hover: hover)').matches) { d.addEventListener('mouseenter', show); d.addEventListener('mouseleave', hide); }
        d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } if (e.key === 'Escape') hide(); });
      });
      if (!chips.bound) {
        chips.bound = true;
        document.addEventListener('click', function () { if (pop) { pop.remove(); pop = null; } });
        window.addEventListener('scroll', function () { if (pop) { pop.remove(); pop = null; } }, { passive: true });
      }
    });
  }

  /* ---------- 10. Glossary page ---------- */
  function glossaryPage() {
    var host = $('#glossary-list'); if (!host) return;
    loadGlossary(function (g) {
      var p = progress(); var reached = Math.max.apply(null, [0].concat(Object.keys(p.done).map(Number)));
      Object.keys(g).sort(function (a, b) { return g[a].term.localeCompare(g[b].term); }).forEach(function (k) {
        var e = g[k];
        var t = el('div', { class: 'term', id: k }, [el('h3', {}, [e.term])]);
        e.levels.forEach(function (l) {
          t.appendChild(el('div', { class: 'd' + (l.ch > reached ? ' ahead' : '') }, [el('span', { class: 'n' }, ['ch ' + l.ch]), l.def]));
        });
        host.appendChild(t);
      });
      var note = $('#glossary-note'); if (note) note.textContent = reached ? 'Definitions past chapter ' + reached + ' are dimmed. They are ahead of you, not hidden.' : 'Mark chapters done and the definitions light up as you reach them.';
    });
  }

  /* ---------- 11. Sandbox runner ---------- */
  // The worker streams every console line back as it happens, so logs from
  // timers and promises (chapters 2 and 12) arrive too. After the synchronous
  // part finishes it says so; the page then keeps listening for a short window.
  var WORKER_SRC = [
    'function __fmt(a){return Array.prototype.map.call(a,function(x){try{return typeof x==="string"?x:JSON.stringify(x,null,1)}catch(e){return String(x)}}).join(" ")}',
    'var console={log:function(){self.postMessage(["log",__fmt(arguments)])},error:function(){self.postMessage(["err",__fmt(arguments)])},warn:function(){self.postMessage(["log",__fmt(arguments)])},assert:function(c){if(!c)self.postMessage(["err","Assertion failed: "+__fmt(Array.prototype.slice.call(arguments,1))])}};',
    'self.onunhandledrejection=function(e){var r=e.reason;self.postMessage(["err","Unhandled promise rejection: "+(r&&r.message?r.message:String(r))])};',
    'self.onmessage=function(e){try{var r=(0,eval)(e.data);if(r!==undefined&&!(r&&typeof r.then==="function"))self.postMessage(["ret","→ "+__fmt([r])])}catch(x){self.postMessage(["err",(x&&x.name?x.name+": ":"")+(x&&x.message?x.message:String(x))])}self.postMessage(["sync-done"])};'
  ].join('\n');
  function sandbox(box) {
    var isDom = box.hasAttribute('data-dom');
    var ta = $('textarea', box), out = $('.out', box), frame = $('iframe', box);
    var run = $('.run', box), reset = $('.reset', box);
    var original = ta.value;
    var worker = null, timer = null;
    function print(lines) {
      out.innerHTML = '';
      if (!lines.length) { out.appendChild(el('span', { class: 'empty' }, ['(nothing printed. Add a console.log to see something.)'])); return; }
      lines.forEach(function (l) { out.appendChild(el('div', { class: l[0] === 'err' ? 'err' : '' }, [l[1]])); });
    }
    function kill() { if (worker) { worker.terminate(); worker = null; } if (timer) { clearTimeout(timer); timer = null; } }
    function runJs() {
      kill();
      out.innerHTML = '';
      var lines = [], syncDone = false;
      try {
        var blob = new Blob([WORKER_SRC], { type: 'text/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
      } catch (e) { print([['err', 'This browser blocked the sandbox. Try Safari or Chrome.']]); return; }
      function paint() { print(lines); }
      worker.onmessage = function (e) {
        var m = e.data;
        if (m[0] === 'sync-done') {
          syncDone = true;
          // Give timers and promises a window to finish, then close quietly.
          clearTimeout(timer);
          timer = setTimeout(function () { kill(); if (!lines.length) paint(); }, 3500);
          return;
        }
        lines.push(m); paint();
      };
      worker.onerror = function (e) { lines.push(['err', e.message || 'Error']); paint(); kill(); };
      timer = setTimeout(function () {
        kill();
        if (!syncDone) { lines.push(['err', 'Stopped after 3 seconds. Probably a loop that never ends. That is a real bug, and you just met it safely.']); paint(); }
      }, 3000);
      worker.postMessage(ta.value);
    }
    function runDom() {
      // For exercises that need a page: the code runs inside a throwaway iframe.
      var doc = '<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{font:15px -apple-system,Helvetica,sans-serif;padding:12px;margin:0;color:#111}</style></head><body>' +
        '<script>var __p=parent;function __s(t,a){__p.postMessage({sb:"' + box.id + '",t:t,a:Array.prototype.map.call(a,function(x){try{return typeof x==="string"?x:JSON.stringify(x)}catch(e){return String(x)}}).join(" ")},"*")}' +
        'console.log=function(){__s("log",arguments)};console.error=function(){__s("err",arguments)};window.onerror=function(m){__s("err",m)};<\/script>' +
        ta.value + '</body></html>';
      out.innerHTML = '';
      frame.srcdoc = doc;
    }
    if (isDom) {
      window.addEventListener('message', function (e) {
        if (!e.data || e.data.sb !== box.id) return;
        if (out.querySelector('.empty')) out.innerHTML = '';
        out.appendChild(el('div', { class: e.data.t === 'err' ? 'err' : '' }, [e.data.a]));
      });
    }
    run.addEventListener('click', isDom ? runDom : runJs);
    reset.addEventListener('click', function () { kill(); ta.value = original; out.innerHTML = '<span class="empty">reset.</span>'; if (frame) frame.srcdoc = ''; });
    ta.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); (isDom ? runDom : runJs)(); }
      if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 2; }
    });
    out.innerHTML = '<span class="empty">press Run (or ⌘/Ctrl + Enter)</span>';
  }
  function sandboxes() {
    $$('.sb').forEach(function (box, i) {
      if (!box.id) box.id = 'sb' + (i + 1);
      var isDom = box.hasAttribute('data-dom');
      if (isDom) box.classList.add('dom');
      var code = box.textContent.replace(/^\n/, '');
      box.innerHTML = '';
      box.appendChild(el('div', { class: 'bar' }, [
        el('span', {}, [isDom ? 'sandbox (page)' : 'sandbox']),
        el('div', { class: 'btns' }, [el('button', { class: 'btn reset' }, ['Reset']), el('button', { class: 'btn primary run' }, ['Run'])])
      ]));
      var ta = el('textarea', { spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }); ta.value = code; box.appendChild(ta);
      if (isDom) box.appendChild(el('iframe', { sandbox: 'allow-scripts', title: 'sandbox page' }));
      box.appendChild(el('div', { class: 'out' }));
      sandbox(box);
    });
  }

  /* ---------- 11b. Audiobook ---------- */

  /* ---------- 12. Per-page init (runs again after every soft navigation) ---------- */
  function initPage() {
    chapterFurniture();
    gateMacOnly();
    chips();
    glossaryPage();
    sandboxes();
    // Figures scroll sideways on a phone instead of shrinking to unreadable.
    $$('figure > svg').forEach(function (s) { var w = el('div', { class: 'figscroll' }); s.parentNode.insertBefore(w, s); w.appendChild(s); });
    var cov = $('#cover-weeks');
    if (cov && !cov.children.length) {
      var p = progress();
      WEEKS.forEach(function (w, wi) {
        var box = el('div', { class: 'w' }, [el('div', { class: 'h' }, [w])]);
        CHAPTERS.slice(wi * 5, wi * 5 + 5).forEach(function (c) {
          var pad = c[0] < 10 ? '0' + c[0] : '' + c[0];
          box.appendChild(el('a', { class: p.done[c[0]] ? 'is-done' : '', href: root + 'chapters/' + pad + '-' + c[1] + '.html' }, [el('span', { class: 'n' }, [String(c[0])]), c[2]]));
        });
        cov.appendChild(box);
      });
    }
    if (topLabel) topLabel.textContent = chapterNo ? 'Chapter ' + chapterNo : 'BIG CODE BOOK';
    renderSide();
    window.dispatchEvent(new CustomEvent('bcb:page', { detail: { chapter: chapterNo } }));
  }

  /* ---------- 13. Soft navigation: swap the page text in place, keep the audio alive ---------- */
  function isBookPage(url) {
    return url.origin === location.origin && url.href.indexOf(root) === 0 && /\.html$/.test(url.pathname) && !/\/(sandbox|interactives|audio|lab|git-lab)\//.test(url.pathname);
  }
  function go(href, push) {
    var url = new URL(href, location.href);
    return fetch(url.href).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var next = doc.querySelector('main');
      if (!next) throw new Error('no main');
      var cur = $('main');
      cur.replaceWith(document.adoptNode(next));
      document.title = doc.title;
      var n = parseInt(doc.body.getAttribute('data-chapter') || '0', 10);
      if (n) document.body.setAttribute('data-chapter', String(n)); else document.body.removeAttribute('data-chapter');
      chapterNo = n;
      if (push !== false) history.pushState({ bcb: url.href }, '', url.href);
      if (side) { side.classList.remove('open'); document.body.classList.remove('drawer-open'); }
      window.scrollTo(0, 0);
      initPage();
    }).catch(function () { location.href = url.href; });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    var url; try { url = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (!isBookPage(url) || url.hash && url.pathname === location.pathname) return;
    e.preventDefault();
    go(url.href, true);
  });
  window.addEventListener('popstate', function () { go(location.href, false); });
  window.BCB = { go: go, root: root, chapters: CHAPTERS, current: function () { return chapterNo; } };

  /* ---------- 14. Boot ---------- */
  applyTheme();
  applyFocus();
  applySize();
  function boot() {
    mountChrome();
    history.replaceState({ bcb: location.href }, '', location.href);
    initPage();
    audiobook();
  }
  function audiobook() {
    window.BIG_CODE_BOOK_AUDIO = { root: root, chapter: chapterNo, chapters: CHAPTERS };
    var style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = root + 'css/audiobook.css?v=20260922';
    document.head.appendChild(style);
    var script = document.createElement('script');
    script.src = root + 'js/audiobook.js?v=20260922';
    script.defer = true;
    document.body.appendChild(script);
  }
  document.addEventListener('DOMContentLoaded', function () { gate(boot); });
})();
