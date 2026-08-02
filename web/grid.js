/* ==========================================================================
   Hero background — a spring-coupled grid that carries impulses across itself.

   Adapted from "Kinetic Grid" by Paul Bakaus (Radiant Shaders, MIT licence,
   https://github.com/pbakaus/radiant). Three things changed for this page:

     · it draws into whatever box it is given instead of the whole window, so
       the hero can be a band rather than a screen;
     · the tension ramp carries the colours of the mark — slate at rest, blue
       under load, green where the wave is passing — instead of the original
       amber, so the hero, the instrument below it and the course artifact all
       read as one object;
     · the injection point flashes amber, which is the colour this course gives
       a channel, so the place energy enters is told apart from the place it
       arrives.

   The physics is the original's and is not a model of anything in the course.
   It is a background: a disturbance enters at an edge and spreads. That is the
   only thing it is asked to say.
   ========================================================================== */
(function () {
  var canvas = document.getElementById('grid');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- tunables, all from the original ---- */
  var IMPULSE_RATE = 0.7;
  var SPRING_K = 0.12;
  var DAMPING = 0.978;
  var RETURN_FORCE = 0.003;

  var COLS = 0, ROWS = 0, nodeCount = 0;
  var posX, posY, velX, velY, restX, restY;
  var springs = [];
  var flashes = [];
  var screenFlash = 0;

  var W = 0, H = 0, dpr = 1;
  var spacingX = 0, spacingY = 0, marginX = 0, marginY = 0;
  var lastTime = 0, sinceImpulse = 0;
  var visible = false, looping = false;

  function idx(c, r) { return r * COLS + c; }

  /* The cells are kept close to square whatever shape the hero ends up, so a
     wide short band does not stretch the mesh into ribbons. */
  function buildGrid() {
    COLS = Math.max(12, Math.min(48, Math.round(W / 42)));
    ROWS = Math.max(7, Math.min(30, Math.round(H / 42)));
    nodeCount = COLS * ROWS;

    posX = new Float32Array(nodeCount); posY = new Float32Array(nodeCount);
    velX = new Float32Array(nodeCount); velY = new Float32Array(nodeCount);
    restX = new Float32Array(nodeCount); restY = new Float32Array(nodeCount);

    marginX = W * 0.04;
    marginY = H * 0.06;
    spacingX = (W - marginX * 2) / (COLS - 1);
    spacingY = (H - marginY * 2) / (ROWS - 1);

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var i = idx(c, r);
        restX[i] = posX[i] = marginX + c * spacingX;
        restY[i] = posY[i] = marginY + r * spacingY;
      }
    }

    springs = [];
    for (var r2 = 0; r2 < ROWS; r2++) {
      for (var c2 = 0; c2 < COLS; c2++) {
        var a = idx(c2, r2);
        if (c2 < COLS - 1) springs.push(a, idx(c2 + 1, r2), spacingX);
        if (r2 < ROWS - 1) springs.push(a, idx(c2, r2 + 1), spacingY);
      }
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
    ctx.fillStyle = '#04050f';
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- injection ---------------------------------------------------------
     One impulse at a time, from one edge, left to cross the mesh before the
     next one is sent. Two overlapping impulses read as noise rather than as a
     wave, which is the opposite of what this background is for. */
  function injectImpulse(edge, strength) {
    /* a broad front rather than a narrow one: a narrow impulse crosses the
       mesh as a bright vertical line and reads as a rendering fault, not as a
       wave */
    var span = 7 + Math.floor(Math.random() * 8);
    var fx, fy, k, i, falloff;

    if (edge === 0 || edge === 2) {
      var c0 = Math.floor(Math.random() * Math.max(1, COLS - span));
      var row = edge === 0 ? 0 : ROWS - 1;
      var sign = edge === 0 ? 1 : -1;
      fx = marginX + (c0 + span * 0.5) * spacingX;
      fy = marginY + row * spacingY;
      for (k = c0; k < c0 + span && k < COLS; k++) {
        i = idx(k, row);
        falloff = 1 - Math.abs(k - c0 - span * 0.5) / (span * 0.5);
        velY[i] += sign * strength * falloff * falloff;
      }
    } else {
      var r0 = Math.floor(Math.random() * Math.max(1, ROWS - span));
      var col = edge === 3 ? 0 : COLS - 1;
      var sgn = edge === 3 ? 1 : -1;
      fx = marginX + col * spacingX;
      fy = marginY + (r0 + span * 0.5) * spacingY;
      for (k = r0; k < r0 + span && k < ROWS; k++) {
        i = idx(col, k);
        falloff = 1 - Math.abs(k - r0 - span * 0.5) / (span * 0.5);
        velX[i] += sgn * strength * falloff * falloff;
      }
    }

    flashes.push({ x: fx, y: fy, life: 1.0, ring: 1.0 });
    screenFlash = 0.035;
  }

  function injectFromCursor(mx, my) {
    var strength = 18;
    var reach = 4 * Math.max(spacingX, spacingY);
    for (var i = 0; i < nodeCount; i++) {
      var dx = restX[i] - mx, dy = restY[i] - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < reach && d > 0.1) {
        var f = 1 - d / reach; f *= f;
        velX[i] += (dx / d) * strength * f;
        velY[i] += (dy / d) * strength * f;
      }
    }
    flashes.push({ x: mx, y: my, life: 1.0, ring: 1.0 });
    screenFlash = 0.03;
  }

  /* ---- physics ---- */
  function simulate() {
    var s3, a, b, restLen, dx, dy, dist, force, fx, fy;
    for (var s = 0; s < springs.length; s += 3) {
      s3 = s; a = springs[s3]; b = springs[s3 + 1]; restLen = springs[s3 + 2];
      dx = posX[b] - posX[a];
      dy = posY[b] - posY[a];
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.001) continue;
      force = SPRING_K * (dist - restLen) / dist;
      fx = dx * force; fy = dy * force;
      velX[a] += fx; velY[a] += fy;
      velX[b] -= fx; velY[b] -= fy;
    }
    for (var i = 0; i < nodeCount; i++) {
      velX[i] += (restX[i] - posX[i]) * RETURN_FORCE;
      velY[i] += (restY[i] - posY[i]) * RETURN_FORCE;
      velX[i] *= DAMPING; velY[i] *= DAMPING;
      posX[i] += velX[i]; posY[i] += velY[i];
    }
  }

  /* ---- colour ------------------------------------------------------------
     Slate at rest, through the blue of the mark, to its green where the wave
     is passing, and to white only at the crest. The ramp is the one place the
     original's palette was replaced. */
  function tensionColor(t) {
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var f, r, g, b, a;
    if (t < 0.1) {
      f = t / 0.1;
      r = 26 + f * 20; g = 38 + f * 30; b = 64 + f * 60; a = 0.22 + f * 0.10;
    } else if (t < 0.3) {
      f = (t - 0.1) / 0.2;
      r = 46 + f * 45; g = 68 + f * 72; b = 124 + f * 131; a = 0.32 + f * 0.20;
    } else if (t < 0.55) {
      f = (t - 0.3) / 0.25;
      r = 91 - f * 34; g = 140 + f * 115; b = 255 - f * 122; a = 0.52 + f * 0.20;
    } else if (t < 0.8) {
      f = (t - 0.55) / 0.25;
      r = 57 + f * 140; g = 255; b = 133 + f * 80; a = 0.72 + f * 0.15;
    } else {
      f = (t - 0.8) / 0.2;
      r = 197 + f * 58; g = 255; b = 213 + f * 42; a = 0.87 + f * 0.13;
    }
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: a };
  }

  /* ---- render ---- */
  function frame(now) {
    if (!looping) return;

    var time = now * 0.001;
    var dt = lastTime === 0 ? 0.016 : time - lastTime;
    if (dt > 0.1) dt = 0.016;
    lastTime = time;

    sinceImpulse += dt;
    var interval = 1.8 / IMPULSE_RATE;
    if (sinceImpulse >= interval) {
      injectImpulse(Math.floor(Math.random() * 4), 22 + Math.random() * 14);
      sinceImpulse -= interval + Math.random() * interval * 0.3;
    }

    simulate();
    paint(time, dt);
    requestAnimationFrame(frame);
  }

  function paint(time, dt) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(4, 5, 15, 0.35)';
    ctx.fillRect(0, 0, W, H);

    if (screenFlash > 0.001) {
      ctx.fillStyle = 'rgba(91, 140, 255, ' + screenFlash.toFixed(4) + ')';
      ctx.fillRect(0, 0, W, H);
      screenFlash *= 0.88;
    }

    var tensionScale = 1 / ((spacingX + spacingY) * 0.5 * 0.35);
    var breathe = 0.85 + 0.15 * Math.sin(time * 0.8);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    /* two passes over the same springs: a wide soft one that makes the mesh a
       glowing tube, and a thin sharp one that gives it an edge */
    var pass, s, a, b, restLen, ax, ay, bx, by, dx, dy, dist, tension, col, alpha;
    for (pass = 0; pass < 2; pass++) {
      for (s = 0; s < springs.length; s += 3) {
        a = springs[s]; b = springs[s + 1]; restLen = springs[s + 2];
        ax = posX[a]; ay = posY[a]; bx = posX[b]; by = posY[b];
        dx = bx - ax; dy = by - ay;
        dist = Math.sqrt(dx * dx + dy * dy);
        tension = Math.abs(dist - restLen) * tensionScale;
        col = tensionColor(tension);

        if (pass === 0) {
          alpha = (0.04 + tension * 0.18) * breathe;
          if (alpha <= 0.005) continue;
          ctx.lineWidth = 3.5 + tension * 8;
        } else {
          alpha = Math.min(1, (0.12 + tension * 0.6) * breathe);
          ctx.lineWidth = 0.6 + tension * 1.6;
        }
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + alpha.toFixed(4) + ')';
        ctx.stroke();
      }
    }

    /* the nodes light with their own speed, so the wavefront is visible as a
       line of bright points crossing the mesh */
    for (var i = 0; i < nodeCount; i++) {
      var speed = Math.sqrt(velX[i] * velX[i] + velY[i] * velY[i]);
      var brightness = Math.min(1, speed * 0.2);
      if (brightness < 0.02) continue;

      var nr, ng, nb, nf;
      if (brightness < 0.25) {
        nf = brightness / 0.25;
        nr = 30 + nf * 61; ng = 46 + nf * 94; nb = 90 + nf * 165;
      } else if (brightness < 0.6) {
        nf = (brightness - 0.25) / 0.35;
        nr = 91 - nf * 34; ng = 140 + nf * 115; nb = 255 - nf * 122;
      } else {
        nf = (brightness - 0.6) / 0.4;
        nr = 57 + nf * 198; ng = 255; nb = 133 + nf * 122;
      }

      if (speed > 3.0) {
        var bloom = Math.min(1, (speed - 3.0) / 15);
        ctx.beginPath();
        ctx.arc(posX[i], posY[i], 4 + bloom * 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(57, 255, 133, ' + (bloom * 0.28).toFixed(3) + ')';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(posX[i], posY[i], 2 + bloom * 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230, 255, 240, ' + (bloom * 0.6).toFixed(3) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(posX[i], posY[i], 0.8 + brightness * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + Math.round(nr) + ',' + Math.round(ng) + ',' + Math.round(nb) + ',' +
        (0.12 + brightness * 0.75).toFixed(3) + ')';
      ctx.fill();
    }

    /* the injection point, in the colour this course gives a channel */
    for (var fi = flashes.length - 1; fi >= 0; fi--) {
      var fl = flashes[fi];
      fl.life -= dt * 2.0;
      fl.ring -= dt * 1.8;
      if (fl.life <= 0) { flashes.splice(fi, 1); continue; }

      var radius = (1 - fl.life) * 100 + 20;
      var fa = fl.life * fl.life * 0.8;
      var grad = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, radius);
      grad.addColorStop(0, 'rgba(255, 214, 170, ' + fa.toFixed(3) + ')');
      grad.addColorStop(0.2, 'rgba(255, 159, 69, ' + (fa * 0.6).toFixed(3) + ')');
      grad.addColorStop(0.5, 'rgba(180, 96, 24, ' + (fa * 0.25).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(120, 60, 10, 0)');
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (fl.ring > 0) {
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, 15 + (1 - fl.ring) * 120, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 159, 69, ' + (fl.ring * fl.ring * 0.5).toFixed(3) + ')';
        ctx.lineWidth = 2 * fl.ring;
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'source-over';

    var cx = W * 0.5, cy = H * 0.5, maxDim = Math.max(W, H);
    var vig = ctx.createRadialGradient(cx, cy, maxDim * 0.25, cx, cy, maxDim * 0.75);
    vig.addColorStop(0, 'rgba(4, 5, 15, 0)');
    vig.addColorStop(1, 'rgba(4, 5, 15, 0.62)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---- lifecycle ---------------------------------------------------------
     The loop runs only while the hero is on screen and the tab is in front. A
     background that keeps a core busy behind a hidden tab is a background that
     gets switched off by the reader. */
  function start() {
    if (looping || reduced || document.hidden || !visible) return;
    looping = true;
    lastTime = 0;
    requestAnimationFrame(frame);
  }
  function stop() { looping = false; }

  resize();
  injectImpulse(Math.floor(Math.random() * 4), 28);
  simulate();
  paint(0, 0.016);

  if (reduced) {
    /* one settled frame and nothing more */
    for (var k = 0; k < 60; k++) simulate();
    paint(0, 0.016);
  }

  new ResizeObserver(function () { resize(); paint(0, 0.016); }).observe(canvas);

  new IntersectionObserver(function (entries) {
    visible = entries[0] && entries[0].isIntersecting;
    if (visible) start(); else stop();
  }, { threshold: 0.01 }).observe(canvas);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  canvas.addEventListener('pointerdown', function (e) {
    var r = canvas.getBoundingClientRect();
    injectFromCursor(e.clientX - r.left, e.clientY - r.top);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (e.buttons !== 1) return;
    var r = canvas.getBoundingClientRect();
    injectFromCursor(e.clientX - r.left, e.clientY - r.top);
  });
})();
