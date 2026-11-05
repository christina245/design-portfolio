/* Bounce text effect for any element with [data-bounce-text].
   See the "Bounce text effect" block in css/style.css for the animation itself.

   What this script does:
   1. splits the text into words/letters (the H1's own styling is untouched)
   2. measures the last line so the ball can start centred on it, land on the
      two letters under it, and finish just after the final letter
   3. when the animation ends, puts the original plain text back, so the
      finished heading is exactly what it was before (browsers drop kerning
      between separately-animated letters, and this removes that difference) */
(function () {
  var root = document.documentElement;
  var title = document.querySelector('[data-bounce-text]');

  function show() { root.classList.remove('bt-pending'); }

  if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    show();
    return;
  }

  var text = title.textContent.replace(/\s+/g, ' ').trim();
  var chars = [];
  var split = false;

  var WAVE_BACK = '<svg class="bt-dot-wave is-back" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 14 C12.5 6 25 6 37.5 14 S62.5 22 75 14 S100 6 100 14 V100 H0 Z"/></svg>';
  var WAVE_FRONT = '<svg class="bt-dot-wave" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 14 C12.5 22 25 22 37.5 14 S62.5 6 75 14 S100 22 100 14 V100 H0 Z"/></svg>';

  var dot = document.createElement('span');
  dot.className = 'bt-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span class="bt-dot-inner">' + WAVE_BACK + WAVE_FRONT + '</span>';

  function build() {
    var wrap = document.createElement('span');
    wrap.className = 'bt-chars';
    wrap.setAttribute('aria-hidden', 'true');
    var words = text.split(' ');
    words.forEach(function (word, wi) {
      var w = document.createElement('span');
      w.className = 'bt-word';
      Array.from(word).forEach(function (ch) {
        var c = document.createElement('span');
        c.className = 'bt-char';
        c.setAttribute('data-char', ch);
        c.textContent = ch;
        w.appendChild(c);
        chars.push(c);
      });
      wrap.appendChild(w);
      if (wi < words.length - 1) wrap.appendChild(document.createTextNode(' '));
    });
    title.setAttribute('aria-label', text);
    title.textContent = '';
    title.appendChild(wrap);
    title.appendChild(dot);
    chars[chars.length - 1].classList.add('is-last');
    split = true;
  }

  // One rect per visible letter, in reading order. Works split or not.
  function letterRects() {
    if (split) {
      return chars.map(function (c) { return c.getBoundingClientRect(); });
    }
    var node = title.firstChild;
    var range = document.createRange();
    var out = [];
    for (var i = 0; i < node.length; i++) {
      if (/\s/.test(node.data.charAt(i))) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      out.push(range.getBoundingClientRect());
    }
    return out;
  }

  // y of the last line's baseline (a 0x0 inline-block sits on the baseline)
  function baselineY() {
    var host = split ? title.querySelector('.bt-chars') : title;
    var probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0';
    host.appendChild(probe);
    var y = probe.getBoundingClientRect().bottom;
    host.removeChild(probe);
    return y;
  }

  function layout() {
    var tr = title.getBoundingClientRect();
    var fs = parseFloat(getComputedStyle(title).fontSize);
    var rects = letterRects();
    if (!rects.length) return;

    var lines = [];
    rects.forEach(function (r, i) {
      var line = lines[lines.length - 1];
      if (!line || Math.abs(r.top - line.top) > fs * 0.4) {
        line = { top: r.top, left: r.left, right: r.right, idx: [] };
        lines.push(line);
      }
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
      line.idx.push(i);
    });

    function midX(i) { return (rects[i].left + rects[i].right) / 2; }

    var last = lines[lines.length - 1];
    var cx = (last.left + last.right) / 2;
    var D = fs * 0.35;                       // ball diameter (.bt-dot is .35em)
    var restRight = rects[rects.length - 1].right + fs * 0.04 + D / 2;

    title.style.setProperty('--dot-x', (cx - tr.left) + 'px');
    // the ball's resting height is one diameter below its start, sitting on the baseline
    title.style.setProperty('--dot-y', (baselineY() - 1.5 * D - tr.top) + 'px');
    title.style.setProperty('--dot-travel', (restRight - cx) + 'px');

    if (!split) return;

    // each line unfolds outward from its own centre
    lines.forEach(function (line) {
      var mid = (line.left + line.right) / 2;
      var half = Math.max((line.right - line.left) / 2, 1);
      line.idx.forEach(function (i) {
        var off = midX(i) - mid;
        chars[i].style.setProperty('--char-offset', (off / (fs * 0.55)).toFixed(3));
        chars[i].style.setProperty('--distance-percent', (1 - Math.min(Math.abs(off) / half, 1)).toFixed(3));
      });
    });

    // the two letters nearest where the ball first lands get squished
    var nearest = last.idx.slice().sort(function (a, b) {
      return Math.abs(midX(a) - cx) - Math.abs(midX(b) - cx);
    });
    chars[nearest[0]].classList.add('is-squish');
    if (nearest.length > 1) chars[nearest[1]].classList.add('is-squish-soft');
  }

  function restore() {
    if (!split) return;
    var wrap = title.querySelector('.bt-chars');
    title.replaceChild(document.createTextNode(text), wrap);
    title.removeAttribute('aria-label');
    chars = [];
    split = false;
    layout(); // plain text has slightly different (kerned) widths: re-aim the ball
  }

  function start() {
    build();
    layout();
    title.classList.add('bt-playing');
    show();

    var seconds = parseFloat(getComputedStyle(title).getPropertyValue('--bt-duration')) || 6;
    title.addEventListener('animationend', function (e) {
      if (e.animationName === 'bt-dot-inner') restore();
    });
    setTimeout(restore, seconds * 1000 + 600);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (!split) layout(); }, 150);
  });

  var fontReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load("72px 'Archivo Black'", text), document.fonts.ready])
    : Promise.resolve();
  fontReady.then(start, start);
})();
