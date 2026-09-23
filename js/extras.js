/* BIG CODE BOOK extras: the journey strip and the "Try it" section, added to each chapter at load.
   Nothing here edits the chapter files, and everything lives inside .bcb-extra, which the narrator
   skips, so the audiobook's paragraph timing is never disturbed. */
(function () {
  'use strict';
  var BCB = window.BCB;
  if (!BCB) return;
  var root = BCB.root;

  /* ---------- The journey map, as a strip. Same stops as the chapter 2 picture. ---------- */
  var STOPS = [
    ['tap', 'Tap', 'phone'], ['screen', 'Screen', 'phone'], ['js', 'JavaScript', 'phone'], ['state', 'State', 'phone'], ['saved', 'Saved on phone', 'phone'],
    ['network', 'Network', 'server'], ['edge', 'Edge function', 'server'], ['ai', 'The AI', 'server'], ['db', 'Database', 'server']
  ];
  var ALL = STOPS.map(function (s) { return s[0]; });
  var PHONE = ['tap', 'screen', 'js', 'state', 'saved'];
  // For each chapter: which stops it lights, and one line saying why. No stops lit = a workshop chapter.
  var MAP = {
    1: [['js', 'state', 'saved'], 'Every stop on the phone runs on the same three boxes: CPU, memory, disk.'],
    2: [ALL, 'The whole trip. Every chapter from here lights the stops it zooms into.'],
    3: [[], 'History: how every stop on this map came to exist.'],
    4: [[], 'The people, and now the AIs, who build the stops.'],
    5: [[], 'The workshop: the files every stop is made of.'],
    6: [[], 'The workshop: the terminal you build and inspect the stops from.'],
    7: [[], 'The workshop: git keeps the history of every file on the map.'],
    8: [[], 'The workshop: branches let two builders change the map at once.'],
    9: [['js', 'state'], 'Values and variables live inside JavaScript and state.'],
    10: [['js'], 'Functions are the moving parts inside JavaScript.'],
    11: [['js', 'state'], 'Loops, objects, and the references that point into state.'],
    12: [['js', 'network'], 'Waiting for the network without freezing the phone.'],
    13: [['screen'], 'How the screen gets drawn from HTML, CSS, and the DOM.'],
    14: [['screen', 'js', 'state', 'saved'], 'State changes, the screen follows, the phone saves.'],
    15: [['network', 'edge'], 'The request and the reply: what actually crosses the network.'],
    16: [['edge', 'ai'], 'The server side: the edge function and the AI it calls.'],
    17: [['db'], 'Where the data lives for good, and who may read which rows.'],
    18: [['network', 'edge', 'db'], 'Who is asking, checked at the server and at the database.'],
    19: [['edge'], 'Borrowed code builds every stop. Secrets live only at the server.'],
    20: [[], 'The workshop: how a new version of every stop reaches users.'],
    21: [['js'], 'TypeScript checks the JavaScript before it ever runs.'],
    22: [['screen', 'js', 'state'], 'The native rebuild: the same phone stops, drawn with React Native.'],
    23: [ALL, 'An error can start at any stop. The stack trace tells you which.'],
    24: [[], 'The workshop: tests check every stop automatically.'],
    25: [['network', 'edge', 'db'], 'The trust boundary: never trust the phone, check at the server.'],
    26: [[], 'The workshop: where each stop’s code lives, and what it may touch.'],
    27: [[], 'The workshop: supervising the agents who write every stop.'],
    28: [[], 'The workshop: catching the agents’ duplicates and recovering from mistakes.'],
    29: [PHONE, 'The whole phone side, running on your Mac.'],
    30: [ALL, 'The whole trip, from memory.']
  };

  /* ---------- What to try, per chapter. ---------- */
  var TRY = {
    2: [{ widget: 'journey-map', title: 'Explore the journey', blurb: 'Tap each stop to see what runs there and which Memento file owns it.' }],
    5: [{ lab: '05-path' }],
    6: [{ lab: '06-shell' }],
    7: [{ widget: 'git-graph', title: 'Play with a git graph', blurb: 'Make commits and watch the history grow.' }],
    8: [{ widget: 'git-graph', title: 'Branch and merge', blurb: 'Make a branch, commit on both lines, merge them back.' }],
    11: [{ lab: '11-alias' }],
    12: [{ widget: 'event-loop', title: 'Step through the event loop', blurb: 'Predict the print order first, then step.' }],
    14: [{ lab: '14-state-drift' }],
    15: [{ widget: 'request-inspector', title: 'Build a request', blurb: 'Change the verb, path, and body, and read the reply.' }],
    17: [{ widget: 'sql-playground', title: 'Ask a database questions', blurb: 'Real SQL on a tiny database. The row rules part is a simulator.' }],
    18: [{ lab: '18-auth' }],
    22: [{ frame: 'sandbox/v3/index.html', title: 'Memento Jr, the React Native version', blurb: 'This now exists, even though the chapter says it does not yet. A real React Native button, built for the web. Hold it for three seconds.' }],
    23: [{ widget: 'stack-trace-reader', title: 'Read a stack trace', blurb: 'Tap each line to see what it is telling you.' }, { lab: '23-syntax' }, { lab: '23-runtime' }, { lab: '23-logic' }],
    25: [{ lab: '25-validation' }],
    27: [{ widget: 'diff-trainer', title: 'Find what is wrong in a diff', blurb: 'An agent’s change with problems planted in it. Mark them, then reveal.' }]
  };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function get(path) { return fetch(root + path, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); }

  function strip(n) {
    var entry = MAP[n];
    if (!entry) return null;
    var lit = entry[0], wrap = el('div', 'bcb-extra jstrip');
    wrap.setAttribute('aria-label', 'Where this chapter sits on the journey. ' + (lit.length ? 'Lit: ' + STOPS.filter(function (s) { return lit.indexOf(s[0]) >= 0; }).map(function (s) { return s[1]; }).join(', ') + '.' : 'A workshop chapter.'));
    ['phone', 'server'].forEach(function (side) {
      var row = el('div', 'jrow');
      row.appendChild(el('span', 'jside', side === 'phone' ? 'Phone' : 'Server'));
      STOPS.filter(function (s) { return s[2] === side; }).forEach(function (s) {
        row.appendChild(el('span', 'jstop' + (lit.indexOf(s[0]) >= 0 ? ' lit' : ''), s[1]));
      });
      wrap.appendChild(row);
    });
    wrap.appendChild(el('div', 'jcap', (lit.length ? '' : 'Workshop. ') + entry[1]));
    return wrap;
  }

  function mdLines(text) {
    return text.split('\n').map(function (l) { return l.replace(/^#+\s*/, '').replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1'); });
  }

  function labCard(name) {
    var card = el('div', 'bcb-card lab');
    var head = el('div', 'bcb-card-h');
    head.appendChild(el('span', 'bcb-kind', 'Break-it lab'));
    head.appendChild(el('span', 'bcb-mac', 'Mac'));
    card.appendChild(head);
    var title = el('div', 'bcb-card-t', 'Loading…');
    card.appendChild(title);
    var body = el('div', 'bcb-card-b');
    card.appendChild(body);
    var cmd = el('pre', 'bcb-cmd', 'cd ~/Downloads/CODE-BOOK/sandbox/breaks/' + name);
    var hints = el('ol', 'bcb-hints');
    var btns = el('div', 'bcb-btns');
    var hintBtn = el('button', 'btn', 'Show a hint');
    var fixBtn = el('button', 'btn', 'Show the fix');
    var fix = el('div', 'bcb-fix');
    fix.hidden = true;
    btns.appendChild(hintBtn); btns.appendChild(fixBtn);
    get('sandbox/breaks/' + name + '/README.md').then(function (t) {
      var lines = mdLines(t).filter(Boolean);
      var tt = (lines[0] || name).replace(/^Chapter \d+ break:\s*/i, '');
      title.textContent = tt.charAt(0).toUpperCase() + tt.slice(1);
      var rest = lines.slice(1).join(' ');
      var exp = /Expected output:\s*(.*?)\.\s*Reset command:\s*(.*?)\.\s/.exec(rest + ' ');
      body.innerHTML = '';
      body.appendChild(el('p', null, 'One thing in this copy of Memento Jr is broken on purpose. ' + (exp ? 'What you will see: ' + exp[1] + '.' : '')));
      body.appendChild(cmd);
      if (exp) body.appendChild(el('p', 'bcb-dim', 'Start over any time: ' + exp[2] + '. This cannot touch Memento.'));
      body.appendChild(hints);
      body.appendChild(btns);
      body.appendChild(fix);
    }).catch(function () { title.textContent = name; });
    var hintList = null, shown = 0;
    hintBtn.addEventListener('click', function () {
      (hintList ? Promise.resolve(hintList) : get('sandbox/breaks/' + name + '/HINTS.md').then(function (t) {
        var lines = mdLines(t);
        var numbered = lines.filter(function (l) { return /^\d+\.\s/.test(l); });
        if (numbered.length) hintList = numbered.map(function (l) { return l.replace(/^\d+\.\s*/, ''); });
        else hintList = t.replace(/^#.*\n/, '').split(/\n\s*\n/).map(function (p) { return mdLines(p).join(' ').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
        hintList = hintList.filter(function (h) { return !/FIX\.md/.test(h); });
        return hintList;
      })).then(function (list) {
        if (shown < list.length) { hints.appendChild(el('li', null, list[shown])); shown += 1; }
        hintBtn.textContent = shown >= list.length ? 'No more hints' : 'Another hint';
        hintBtn.disabled = shown >= list.length;
      });
    });
    fixBtn.addEventListener('click', function () {
      if (!fix.hidden) { fix.hidden = true; fixBtn.textContent = 'Show the fix'; return; }
      get('sandbox/breaks/' + name + '/FIX.md').then(function (t) {
        fix.textContent = mdLines(t.replace(/^#\s*Fix\s*\n/i, '')).join('\n').trim();
        fix.hidden = false; fixBtn.textContent = 'Hide the fix';
      });
    });
    return card;
  }

  function widgetCard(item) {
    var card = el('div', 'bcb-card widget');
    var head = el('div', 'bcb-card-h');
    head.appendChild(el('span', 'bcb-kind', 'Interactive'));
    card.appendChild(head);
    card.appendChild(el('div', 'bcb-card-t', item.title));
    card.appendChild(el('p', 'bcb-dim', item.blurb));
    var host = el('div', 'bcb-widget');
    card.appendChild(host);
    get('interactives/' + item.widget + '.html').then(function (html) {
      var doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
      Array.prototype.slice.call(doc.body.children).forEach(function (node) {
        if (node.tagName === 'SCRIPT') {
          var s = document.createElement('script');
          s.textContent = node.textContent;
          host.appendChild(s); // runs now, after its div is already in the page
        } else host.appendChild(document.adoptNode(node));
      });
    }).catch(function () { host.textContent = 'This interactive could not load. Refresh and try again.'; });
    return card;
  }

  function frameCard(item) {
    var card = el('div', 'bcb-card widget');
    var head = el('div', 'bcb-card-h');
    head.appendChild(el('span', 'bcb-kind', 'Interactive'));
    card.appendChild(head);
    card.appendChild(el('div', 'bcb-card-t', item.title));
    card.appendChild(el('p', 'bcb-dim', item.blurb));
    var f = document.createElement('iframe');
    f.className = 'bcb-frame'; f.loading = 'lazy'; f.title = item.title; f.src = root + item.frame;
    card.appendChild(f);
    return card;
  }

  var cssLoaded = false;
  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = root + 'interactives/interactives.css';
    document.head.insertBefore(l, document.head.querySelector('link[href*="book.css"]')); // book.css wins on conflicts
  }

  function tryBlock(n) {
    var items = TRY[n];
    if (!items) return null;
    var wrap = el('section', 'bcb-extra bcb-try');
    wrap.appendChild(el('h2', null, 'Try it'));
    items.forEach(function (item) {
      if (item.lab) wrap.appendChild(labCard(item.lab));
      else if (item.widget) { ensureCss(); wrap.appendChild(widgetCard(item)); }
      else if (item.frame) wrap.appendChild(frameCard(item));
    });
    return wrap;
  }

  function apply(n) {
    var main = document.querySelector('main');
    if (!main || !n || main.querySelector('.bcb-extra')) return;
    var s = strip(n);
    var lede = main.querySelector('.lede');
    if (s && lede) lede.parentNode.insertBefore(s, lede.nextSibling);
    var t = tryBlock(n);
    if (t) {
      var anchor = main.querySelector('.box.why') || main.querySelector('.box.words') || main.querySelector('.done-row');
      if (anchor) anchor.parentNode.insertBefore(t, anchor); else main.appendChild(t);
    }
  }

  apply(BCB.current());
  window.addEventListener('bcb:page', function (e) { apply(e.detail.chapter); });
})();
