/* ==========================================================================
   web/fig.js — Figure 1 on the cover page, drawn from the scroll position.

   A square wave x(t) = sum over odd k of (4/(pi k)) sin(2 pi k t), period 1,
   built up harmonic by harmonic; then its steady-state output through the
   first-order low-pass system H(jw) = 1/(1 + jw tau); then both as line
   spectra, with |H| drawn over them. It is section 4.6 of the course, a
   periodic input through an LTI system, in three steps.

   The drawing is a pure function of how far the reader has scrolled through
   #track, so it never runs on its own and needs no reduced-motion branch.
   index.html styles the canvas with CSS custom properties (--cyan, --amber,
   --green, --violet, --fig-axis, --fig-text, --fig-grid) and data attributes
   (data-pad="L,R,T,B", data-glow, data-grid), and receives the state through
   window.onFig(state) to update the caption and the readout.
   ========================================================================== */
(function () {
  var cv = document.getElementById('plot'), ctx = cv.getContext('2d');
  var track = document.getElementById('track'), fig = document.getElementById('fig');
  var KMAX = 25;          // odd harmonics in the finished wave (k up to 49)
  var WT = 0.8;           // w0*tau at the end of stage b: cutoff at 1.25 f0
  var W = 0, H = 0, dpr = 1, C = {};
  var pad = (cv.dataset.pad || '44,18,20,36').split(',').map(Number);
  var L = pad[0], R = pad[1], T = pad[2], B = pad[3];
  var GLOW = cv.hasAttribute('data-glow'), GRID = cv.hasAttribute('data-grid');

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { return v * v * (3 - 2 * v); }
  function css(n) { return getComputedStyle(cv).getPropertyValue(n).trim(); }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    C = { cyan: css('--cyan'), amber: css('--amber'), green: css('--green'), violet: css('--violet'),
          axis: css('--fig-axis'), text: css('--fig-text'), grid: css('--fig-grid'),
          mono: GLOW };
  }
  function progress() {
    var r = track.getBoundingClientRect();
    var st = parseFloat(getComputedStyle(fig).top) || 0;
    var span = r.height - fig.offsetHeight;
    return span > 0 ? clamp((st - r.top) / span) : 0;
  }

  function fx(u) { return L + u * (W - L - R); }
  function fy(v, lo, hi) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); }

  function line(fn, lo, hi, color, width, alpha, dash, glow) {
    var n = Math.max(240, Math.round(W * 1.5));
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
    if (glow && GLOW) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
    ctx.beginPath();
    for (var i = 0; i <= n; i++) { var u = i / n, y = fy(fn(u), lo, hi); i ? ctx.lineTo(fx(u), y) : ctx.moveTo(fx(u), y); }
    ctx.stroke(); ctx.restore();
  }
  function label(txt, x, y, align, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color || C.text; ctx.textAlign = align || 'left';
    ctx.font = 'italic 15px "Iowan Old Style", Palatino, Georgia, serif'; ctx.fillText(txt, x, y); ctx.restore();
  }
  function grid() {
    if (!GRID) return;
    ctx.save(); ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 1; i < 10; i++) { var x = Math.round(W * i / 10) + .5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (var j = 1; j < 8; j++) { var y = Math.round(H * j / 8) + .5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke(); ctx.restore();
  }

  function tOf(u) { return -1 + 2 * u; }
  function partial(t, kf, wt) {
    var s = 0, n = Math.floor(kf), fr = kf - n;
    for (var i = 0; i <= n && i < KMAX; i++) {
      var w = i < n ? 1 : fr; if (!w) continue;
      var k = 2 * i + 1, a = 4 / (Math.PI * k);
      var g = 1 / Math.sqrt(1 + k * k * wt * wt), ph = Math.atan(k * wt);
      s += w * a * g * Math.sin(2 * Math.PI * k * t - ph);
    }
    return s;
  }
  function square(t) { var f = t - Math.floor(t); return f < .5 ? 1 : -1; }

  function drawTime(a, alpha) {
    var lo = -1.6, hi = 1.6, y0 = fy(0, lo, hi);
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, y0); ctx.lineTo(W - R, y0); ctx.moveTo(L, T); ctx.lineTo(L, H - B); ctx.stroke();
    ctx.restore();
    label('t', W - R, y0 + 20, 'right', C.text, alpha);
    if (a.stage === 0) {
      line(function (u) { return square(tOf(u)); }, lo, hi, C.text, 1, .35 * alpha, [4, 5]);
      var n = Math.floor(a.kf), fr = a.kf - n;
      if (n < KMAX) {
        var k = 2 * n + 1;
        line(function (u) { return 4 / (Math.PI * k) * Math.sin(2 * Math.PI * k * tOf(u)); }, lo, hi, C.violet, 1.2, (.25 + .5 * fr) * alpha);
      }
      line(function (u) { return partial(tOf(u), a.kf, 0); }, lo, hi, C.cyan, 2.2, alpha, null, true);
      label('x(t)', L + 8, T + 12, 'left', C.cyan, alpha);
    } else {
      line(function (u) { return partial(tOf(u), KMAX, 0); }, lo, hi, C.cyan, 1.4, .38 * alpha);
      line(function (u) { return partial(tOf(u), KMAX, a.wt); }, lo, hi, C.green, 2.4, alpha, null, true);
      label('y(t)', L + 8, T + 12, 'left', C.green, alpha);
    }
  }

  function drawFreq(sc, alpha) {
    var lo = 0, hi = 1.45, fmax = 16, y0 = fy(0, lo, hi);
    function ux(f) { return f / fmax; }
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = C.axis; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, y0); ctx.lineTo(W - R, y0); ctx.moveTo(L, T); ctx.lineTo(L, y0); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = '12px Inter, -apple-system, sans-serif'; ctx.textAlign = 'center';
    [1, 3, 5, 7, 9, 11, 13, 15].forEach(function (k) { ctx.fillText(k, fx(ux(k)), y0 + 16); });
    ctx.restore();
    label('f / f₀', W - R, y0 + 32, 'right', C.text, alpha);

    var draw = ease(clamp((sc - .25) / .45));
    if (draw > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(L, 0, (W - L - R) * draw + 1, H); ctx.clip();
      line(function (u) { var f = u * fmax; return 1 / Math.sqrt(1 + f * f * WT * WT); }, lo, hi, C.amber, 1.8, alpha, null, true);
      ctx.restore();
      label('|H(jω)|', fx(ux(4.2)), fy(1 / Math.sqrt(1 + 16.8 * WT * WT), lo, hi) - 14, 'left', C.amber, alpha * draw);
    }
    var g = ease(clamp((sc - .55) / .4));
    for (var k = 1; k <= 15; k += 2) {
      var X = 4 / (Math.PI * k), Hk = 1 / Math.sqrt(1 + k * k * WT * WT), x = fx(ux(k));
      ctx.save();
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.2; ctx.globalAlpha = alpha * (1 - .55 * g);
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, fy(X, lo, hi)); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, fy(X, lo, hi), 3.6, 0, 7); ctx.stroke();
      if (g > 0) {
        var Y = X * (1 - g + g * Hk);
        ctx.globalAlpha = alpha; ctx.strokeStyle = C.green; ctx.fillStyle = C.green; ctx.lineWidth = 2.4;
        if (GLOW) { ctx.shadowColor = C.green; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.moveTo(x + 5, y0); ctx.lineTo(x + 5, fy(Y, lo, hi)); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 5, fy(Y, lo, hi), 3.6, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    label('|X(jω)|', fx(ux(1)) + 10, fy(4 / Math.PI, lo, hi) + 4, 'left', C.cyan, alpha * (1 - .5 * g));
  }

  function render() {
    if (!W) size();
    var p = progress();
    var sa = clamp(p / .34), sb = clamp((p - .36) / .28), sc = clamp((p - .68) / .3);
    var s = p < .35 ? 0 : p < .67 ? 1 : 2;
    var kf = 1 + ease(sa) * (KMAX - 1), wt = ease(sb) * WT;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    grid();
    var tA = 1 - ease(clamp(sc / .3)), fA = ease(clamp((sc - .12) / .3));
    if (tA > 0) drawTime({ stage: s === 0 ? 0 : 1, kf: kf, wt: wt }, tA);
    if (fA > 0) drawFreq(sc, fA);
    if (window.onFig) window.onFig({
      p: p, s: s, sa: sa, sb: sb, sc: sc,
      harmonics: Math.round(kf), kmax: KMAX,
      fc: wt < .02 ? null : 1 / wt,                         // cutoff in units of f0
      h3: 1 / Math.sqrt(1 + 9 * WT * WT)                    // |H| at the third harmonic
    });
  }

  var queued = false;
  function queue() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; render(); }); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () { size(); queue(); });
  size(); render();
})();
