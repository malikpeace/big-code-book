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
  var root = (function () {
    // Chapter pages live in chapters/, so links need a prefix to get back to the root.
    return /\/chapters\//.test(location.pathname) ? '../' : './';
  })();
  var chapterNo = parseInt(document.body.getAttribute('data-chapter') || '0', 10);
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
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  /* ---------- 6. Sidebar + topbar ---------- */
  var side;
  function renderSide() {
    if (!side) return;
    var p = progress();
    var doneCount = Object.keys(p.done).length;
    side.innerHTML = '';
    side.appendChild(el('div', { class: 'brand' }, [
      el('a', { href: root + 'index.html' }, ['BIG CODE BOOK']),
      el('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark', html: ICON_SUN, onclick: toggleTheme })
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
      el('button', { class: 'icon-btn', 'aria-label': 'Open contents', html: ICON_MENU, onclick: function () { side.classList.add('open'); } }),
      el('span', { class: 't' }, [chapterNo ? 'Chapter ' + chapterNo : 'BIG CODE BOOK']),
      el('button', { class: 'icon-btn', 'aria-label': 'Toggle light or dark', html: ICON_SUN, onclick: toggleTheme })
    ]);
    document.body.insertBefore(wrap, document.body.firstChild);
    wrap.appendChild(side); wrap.appendChild(col); col.appendChild(top); col.appendChild(main);
    renderSide();
    document.addEventListener('click', function (e) {
      if (side.classList.contains('open') && !side.contains(e.target) && !top.contains(e.target)) side.classList.remove('open');
    });
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
  function chips() {
    var dfns = $$('dfn[data-term]');
    if (!dfns.length) return;
    loadGlossary(function (g) {
      dfns.forEach(function (d) {
        d.setAttribute('tabindex', '0');
        function show() {
          hide();
          var entry = g[d.getAttribute('data-term')];
          if (!entry) return;
          var lvl = bestDef(entry, chapterNo || 999);
          var ahead = entry.levels.filter(function (l) { return l.ch > (chapterNo || 999); }).length;
          pop = el('div', { class: 'pop', role: 'tooltip' }, [
            el('div', { class: 't' }, [entry.term]), el('div', {}, [lvl.def]),
            el('div', { class: 'lvl' }, ['From chapter ' + lvl.ch + (ahead ? '. ' + ahead + ' deeper definition' + (ahead > 1 ? 's' : '') + ' ahead.' : '.')])
          ]);
          document.body.appendChild(pop);
          var r = d.getBoundingClientRect(); var pw = pop.offsetWidth, ph = pop.offsetHeight;
          var left = Math.max(16, Math.min(r.left, window.innerWidth - pw - 16));
          var top = r.bottom + 8 + ph > window.innerHeight ? r.top - ph - 8 : r.bottom + 8;
          pop.style.left = left + 'px'; pop.style.top = top + 'px';
        }
        function hide() { if (pop) { pop.remove(); pop = null; } }
        d.addEventListener('click', function (e) { e.stopPropagation(); if (pop) hide(); else show(); });
        d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } if (e.key === 'Escape') hide(); });
      });
      document.addEventListener('click', function () { if (pop) { pop.remove(); pop = null; } });
      window.addEventListener('scroll', function () { if (pop) { pop.remove(); pop = null; } }, { passive: true });
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
  var WORKER_SRC = [
    'var __logs=[];',
    'function __fmt(a){return Array.prototype.map.call(a,function(x){try{return typeof x==="string"?x:JSON.stringify(x,null,1)}catch(e){return String(x)}}).join(" ")}',
    'var console={log:function(){__logs.push(["log",__fmt(arguments)])},error:function(){__logs.push(["err",__fmt(arguments)])},warn:function(){__logs.push(["log",__fmt(arguments)])}};',
    'self.onmessage=function(e){__logs=[];try{var r=(0,eval)(e.data);if(r!==undefined)__logs.push(["ret","→ "+__fmt([r])])}catch(x){__logs.push(["err",(x&&x.name?x.name+": ":"")+(x&&x.message?x.message:String(x))])}self.postMessage(__logs)};'
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
      out.innerHTML = '<span class="empty">running…</span>';
      try {
        var blob = new Blob([WORKER_SRC], { type: 'text/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
      } catch (e) { print([['err', 'This browser blocked the sandbox. Try Safari or Chrome.']]); return; }
      worker.onmessage = function (e) { kill(); print(e.data); };
      worker.onerror = function (e) { kill(); print([['err', e.message || 'Error']]); };
      timer = setTimeout(function () { kill(); print([['err', 'Stopped after 3 seconds. Probably a loop that never ends. That is a real bug, and you just met it safely.']]); }, 3000);
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

  /* ---------- 12. Boot ---------- */
  applyTheme();
  function boot() {
    mountChrome();
    chapterFurniture();
    gateMacOnly();
    chips();
    glossaryPage();
    sandboxes();
    // Figures scroll sideways on a phone instead of shrinking to unreadable.
    $$('figure > svg').forEach(function (s) { var w = el('div', { class: 'figscroll' }); s.parentNode.insertBefore(w, s); w.appendChild(s); });
    var cov = $('#cover-weeks');
    if (cov) {
      var p = progress();
      WEEKS.forEach(function (w, wi) {
        var box = el('div', { class: 'w' }, [el('div', { class: 'h' }, [w])]);
        CHAPTERS.slice(wi * 5, wi * 5 + 5).forEach(function (c) {
          var pad = c[0] < 10 ? '0' + c[0] : '' + c[0];
          box.appendChild(el('a', { class: p.done[c[0]] ? 'is-done' : '', href: 'chapters/' + pad + '-' + c[1] + '.html' }, [el('span', { class: 'n' }, [String(c[0])]), c[2]]));
        });
        cov.appendChild(box);
      });
    }
  }
  document.addEventListener('DOMContentLoaded', function () { gate(boot); });
})();
