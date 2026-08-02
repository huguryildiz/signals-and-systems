/* ==========================================================================
   web/sampler.js — the instrument on the page.

   One cosine, the instants at which it is sampled, and the cosine a receiver
   rebuilds from those samples alone. The sampling rate drifts through the
   Nyquist rate of the signal and nothing else changes.

   The rebuilt frequency is not chosen for effect. Sampling `cos(2*pi*f0*t)` at
   rate `fs` gives the values `cos(2*pi*f0*n/fs)`, and for any integer k

       cos(2*pi*(f0 - k*fs)*n/fs) = cos(2*pi*f0*n/fs - 2*pi*k*n)

   is the same sequence. Taking k nearest to f0/fs folds the frequency into
   the band the receiver can represent, so the drawn green curve passes exactly
   through every sample by construction — which is the whole point: the samples
   are correct and still do not decide the signal.

   The readout is computed from the same numbers that draw the trace, so the
   picture and the reading cannot drift apart.
   ========================================================================== */
(function () {
  var canvas = document.getElementById('scope');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var elFs = document.getElementById('hud-fs');
  var elFr = document.getElementById('hud-fr');
  var elF0 = document.getElementById('hud-f0');
  var elOut = document.getElementById('hud-out');

  var COL = {
    grid:  'rgba(150,175,205,.09)',
    axis:  'rgba(150,175,205,.22)',
    in:    '#4FBECE',   /* the signal that was sampled */
    stem:  '#E0AE55',   /* the sampling instants       */
    out:   '#82C27B',   /* what the samples rebuild    */
    bad:   '#E2705C'    /* ... when that is a different signal */
  };

  var F0 = 1000;            /* Hz, fixed          */
  var WIN = 0.004;          /* 4 ms on the screen */
  var FS_LO = 1150, FS_HI = 5200;
  var STILL_FS = 2600;      /* the frame reduced motion is left on */

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, raf = 0, phase = 0;

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(reduced ? STILL_FS : currentFs());
  }

  /* The rate drifts slowly and smoothly, and spends time on both sides of the
     Nyquist rate rather than sweeping past it. */
  function currentFs() {
    var u = 0.5 - 0.5 * Math.cos(phase);          /* 0 … 1, slow at the ends */
    return FS_LO + (FS_HI - FS_LO) * u;
  }

  /* The frequency the samples rebuild: f0 folded into |f| <= fs/2. */
  function rebuilt(fs) {
    var k = Math.round(F0 / fs);
    return Math.abs(F0 - k * fs);
  }

  /* The bottom margin holds the time axis and, above it, the two readings the
     HUD pins to the same edge. */
  var PAD_L = 46, PAD_R = 22, PAD_T = 58, PAD_B = 62;

  function X(t) { return PAD_L + (t / WIN) * (W - PAD_L - PAD_R); }
  function Y(v) {
    var mid = PAD_T + (H - PAD_T - PAD_B) / 2;
    return mid - v * (H - PAD_T - PAD_B) * 0.40;
  }

  function cosine(f, colour, width, alpha) {
    ctx.beginPath();
    var n = Math.max(240, Math.round(W));
    for (var i = 0; i <= n; i++) {
      var t = WIN * i / n;
      var x = X(t), y = Y(Math.cos(2 * Math.PI * f * t));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = colour;
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function draw(fs) {
    var fr = rebuilt(fs);
    var aliased = Math.abs(fr - F0) > 1e-6;

    ctx.fillStyle = '#080D14';
    ctx.fillRect(0, 0, W, H);

    /* graticule */
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
    var c;
    for (c = 0; c <= 8; c++) {
      var gx = PAD_L + (W - PAD_L - PAD_R) * c / 8;
      ctx.beginPath(); ctx.moveTo(gx, PAD_T); ctx.lineTo(gx, H - PAD_B); ctx.stroke();
    }
    for (c = 0; c <= 4; c++) {
      var gy = PAD_T + (H - PAD_T - PAD_B) * c / 4;
      ctx.beginPath(); ctx.moveTo(PAD_L, gy); ctx.lineTo(W - PAD_R, gy); ctx.stroke();
    }
    ctx.strokeStyle = COL.axis;
    ctx.beginPath(); ctx.moveTo(PAD_L, Y(0)); ctx.lineTo(W - PAD_R, Y(0)); ctx.stroke();

    /* the sampling instants, and the sample values on the signal */
    var dt = 1 / fs, t;
    ctx.strokeStyle = COL.stem; ctx.lineWidth = 1.4;
    ctx.fillStyle = COL.stem;
    for (t = 0; t <= WIN + 1e-12; t += dt) {
      var v = Math.cos(2 * Math.PI * F0 * t);
      var x = X(t), y = Y(v);
      ctx.globalAlpha = 0.55;
      ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, 2.9, 0, Math.PI * 2); ctx.fill();
    }

    /* the signal, then what the samples rebuild — drawn second so that when
       the two agree the reader sees one curve and not an argument */
    /* The signal is drawn wide and the reconstruction narrow, so that when the
       two agree the cyan shows as a rim around the green rather than vanishing
       under it, and when they disagree there is no doubt which is which. */
    cosine(F0, COL.in, 3.0, 0.9);
    cosine(fr, aliased ? COL.bad : COL.out, 1.5, 1);

    /* the time axis, in milliseconds */
    ctx.fillStyle = 'rgba(150,175,205,.45)';
    ctx.font = '11px "SF Mono", ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    for (c = 0; c <= 4; c++) {
      var ms = c;
      ctx.fillText(ms + ' ms', X(ms / 1000), H - PAD_B + 44);
    }
    ctx.textAlign = 'left';

    if (elFs) elFs.textContent = (fs / 1000).toFixed(2) + ' kHz';
    if (elF0) elF0.textContent = (F0 / 1000).toFixed(2) + ' kHz';
    if (elFr) elFr.textContent = (fr / 1000).toFixed(2) + ' kHz';
    if (elOut) {
      elOut.classList.toggle('is-aliased', aliased);
      elOut.firstChild.nodeValue = aliased ? 'ALIASED ' : 'REBUILT ';
    }
  }

  function frame() {
    phase += 0.0042;                    /* one full sweep in about 25 s */
    draw(currentFs());
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduced) raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', function () {
    if (reduced) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) raf = requestAnimationFrame(frame);
  });
})();
