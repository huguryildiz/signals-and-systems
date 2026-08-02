/* ==========================================================================
   web/flow.js — the hero backdrop.

   Adapted from Radiant Shaders #01, "Flow Field with Particle Trails" by Paul
   Bakaus, MIT. Two things are changed. The palette is this course's own signal
   semantics — cyan for an input, amber for a system, green for an output,
   violet for an intermediate step — and a constant drift carries every
   particle left to right on top of the field, so the picture reads as signals
   advancing in time rather than as a vortex.

   It paints the hero section only, stops when the tab is hidden, and settles
   to a still frame under reduced motion.
   ========================================================================== */
(function () {
  var canvas = document.getElementById('flow');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- simplex noise, 3D only (Stefan Gustavson's construction) -------- */
  var F3 = 1 / 3, G3 = 1 / 6;
  var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],
               [-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  var perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
  (function (seed) {
    var p = new Uint8Array(256), i;
    for (i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      var j = seed % (i + 1), t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = perm[i] % 12; }
  })(311);

  function noise3D(xin, yin, zin) {
    var n0, n1, n2, n3;
    var s = (xin + yin + zin) * F3;
    var i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    var i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0)      { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
      else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
      else               { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
      if (y0 < z0)       { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
      else if (x0 < z0)  { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
      else               { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }
    var x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
    var x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
    var x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
    var ii=i&255, jj=j&255, kk=k&255, gi, t0, t1, t2, t3;
    t0 = 0.6-x0*x0-y0*y0-z0*z0;
    if (t0 < 0) n0 = 0; else { t0*=t0; gi=permMod12[ii+perm[jj+perm[kk]]];
      n0 = t0*t0*(grad3[gi][0]*x0+grad3[gi][1]*y0+grad3[gi][2]*z0); }
    t1 = 0.6-x1*x1-y1*y1-z1*z1;
    if (t1 < 0) n1 = 0; else { t1*=t1; gi=permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]];
      n1 = t1*t1*(grad3[gi][0]*x1+grad3[gi][1]*y1+grad3[gi][2]*z1); }
    t2 = 0.6-x2*x2-y2*y2-z2*z2;
    if (t2 < 0) n2 = 0; else { t2*=t2; gi=permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]];
      n2 = t2*t2*(grad3[gi][0]*x2+grad3[gi][1]*y2+grad3[gi][2]*z2); }
    t3 = 0.6-x3*x3-y3*y3-z3*z3;
    if (t3 < 0) n3 = 0; else { t3*=t3; gi=permMod12[ii+1+perm[jj+1+perm[kk+1]]];
      n3 = t3*t3*(grad3[gi][0]*x3+grad3[gi][1]*y3+grad3[gi][2]*z3); }
    return 32 * (n0 + n1 + n2 + n3);
  }

  /* ---- the field ------------------------------------------------------- */
  var BG = '8,13,20', FADE = 0.020;
  var PAL = [[79,190,206],[110,205,215],[224,174,85],[130,194,123],[154,138,192],[226,140,110]];
  var COUNT = 900, NOISE_SCALE = 0.0013, SPEED = 0.85, DRIFT = 0.9;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, time = 0, raf = 0, parts = [];

  function spawn(seedX) {
    return { x: seedX === undefined ? Math.random() * W : seedX,
             y: Math.random() * H,
             speed: 0.35 + Math.random() * 0.95,
             alpha: 0.16 + Math.random() * 0.34,
             size: 0.4 + Math.random() * 1.3,
             hue: Math.floor(Math.random() * PAL.length) };
  }

  function clear() { ctx.fillStyle = 'rgb(' + BG + ')'; ctx.fillRect(0, 0, W, H); }

  function step(dt) {
    ctx.fillStyle = 'rgba(' + BG + ',' + FADE + ')';
    ctx.fillRect(0, 0, W, H);
    time += dt;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var a = noise3D(p.x * NOISE_SCALE, p.y * NOISE_SCALE, time) * Math.PI * 1.7;
      var px = p.x, py = p.y;
      p.x += (Math.cos(a) * p.speed + DRIFT) * SPEED;
      p.y += Math.sin(a) * p.speed * SPEED;
      var c = PAL[p.hue];
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + p.alpha + ')';
      ctx.lineWidth = p.size;
      ctx.stroke();
      /* A particle that leaves re-enters from the left, so the drift keeps
         feeding the field instead of emptying it. */
      if (p.x > W + 20 || p.x < -40 || p.y < -40 || p.y > H + 40) {
        p.x = -20; p.y = Math.random() * H;
      }
    }
  }

  function still() { clear(); for (var k = 0; k < 260; k++) step(0.0006); }
  function frame() { step(0.0006); raf = requestAnimationFrame(frame); }

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clear();
    parts.length = 0;
    for (var i = 0; i < COUNT; i++) parts.push(spawn());
    if (reduced) still();
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduced) raf = requestAnimationFrame(frame);

  /* A hidden page should not burn a core. */
  document.addEventListener('visibilitychange', function () {
    if (reduced) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) raf = requestAnimationFrame(frame);
  });
})();
