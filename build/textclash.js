/* Text/geometry collision sweep for every figure in the artifact.
   For each label in each figure <svg>, samples points inside the glyph box and
   asks the renderer whether that point lies on the stroke/fill of a drawn
   geometry element in the same figure. Reports content collisions (signal
   curves, stems, arrows, block outlines), axis-line collisions and text/text
   overlaps separately. Grid lines are ignored by design.
   A label is either an svg <text> or typeset mathematics — an axis name or any
   formula inside a figure — laid out in a foreignObject; the latter is measured
   through its laid-out box and mapped
   back into the coordinates of the figure, and the small svg pieces a formula
   draws for roots and stretched brackets are not figure geometry. */
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');

/* the last three are the graticule, the shadow mask and the edge of a screen:
   the furniture a cathode-ray tube is drawn with, guides in the same sense */
const GRID = ['#E2DACA', '#2C2820', '#D9D0BE', '#BFB39B', '#E4DCCA',
              '#1E2A2E', '#060B0D', '#25343A'];  /* grid + rule tokens: guides, not content */
const AXIS = ['#8C8579', '#8E8578'];

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'dist', 'Signals_and_Systems.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const scenes = await page.evaluate(() => APP.scenes().map(s => ({ id: s.id, steps: s.steps || 0 })));
  const all = [];
  for (const s of scenes) {
    for (let st = 0; st <= (s.steps || 0); st++) {
      await page.evaluate(([id, step]) => APP.goId(id, step), [s.id, st]);
      await page.waitForTimeout(120);
      const found = await page.evaluate(({ GRID, AXIS }) => {
        const out = [];
        const svgs = Array.from(document.querySelectorAll('#scene-host svg'));
        svgs.forEach((svg, si) => {
          if (svg.closest('.katex')) return;
          /* labels: plain svg text, plus the typeset mathematics */
          const labels = Array.from(svg.querySelectorAll('text'))
            .filter(t => !t.closest('foreignObject'))
            .map(t => ({ el: t, text: t.textContent, halo: t.getAttribute('paint-order') === 'stroke',
                         role: t.getAttribute('data-role') || '',
                         box: (() => { try { return t.getBBox(); } catch (e) { return null; } })() }));
          const ctm = svg.getScreenCTM();
          const inv = ctm && ctm.inverse();
          svg.querySelectorAll('foreignObject[data-texlabel] .katex').forEach(k => {
            if (!inv) return;
            /* .base carries the strut, so its box is the height-and-depth box of
               the formula — the same tight measure getBBox gives a <text> */
            const bs = Array.from(k.querySelectorAll('.base'));
            const rs = (bs.length ? bs : [k]).map(e => e.getBoundingClientRect()).filter(r => r.width);
            if (!rs.length) return;
            const r = { left: Math.min(...rs.map(v => v.left)), right: Math.max(...rs.map(v => v.right)),
                        top: Math.min(...rs.map(v => v.top)), bottom: Math.max(...rs.map(v => v.bottom)) };
            r.width = r.right - r.left;
            if (!r.width) return;
            const a = svg.createSVGPoint(), b = svg.createSVGPoint();
            a.x = r.left; a.y = r.top; b.x = r.right; b.y = r.bottom;
            const p = a.matrixTransform(inv), q = b.matrixTransform(inv);
            labels.push({ el: k, text: k.textContent, halo: true,
              role: (k.closest('foreignObject').getAttribute('data-role') || ''),
              box: { x: p.x, y: p.y, width: q.x - p.x, height: q.y - p.y } });
          });
          /* a clip path or any other definition shapes what is drawn; it is not
             itself drawn, so it is not geometry a label can collide with */
          const geos = Array.from(svg.querySelectorAll('path,line,circle,rect,polyline,polygon'))
            .filter(el => !el.closest('foreignObject') && !el.closest('clipPath,defs,mask,marker,pattern'));
          const cls = el => {
            const st = (el.getAttribute('stroke') || '').toUpperCase();
            const fl = (el.getAttribute('fill') || '').toUpperCase();
            if (GRID.includes(st)) return 'grid';
            if (AXIS.includes(st) || AXIS.includes(fl)) return 'axis';
            if (st === 'NONE' && (fl === 'NONE' || fl === '')) return 'grid';
            return 'content';
          };
          /* a light fill is a background plate (box interior, node disc): a label
             sitting on it is by design, not a collision */
          const LIGHTFILL = ['#FCF9F3', '#F7F2E8', '#FFFFFF', '#EFE8DA', '#F2EDE1', '#BFB39B',
                             '#D9D0BE', '#E2DACA', '#1F2A33', '#16232F', '#0A0F12', 'NONE', ''];
          /* isPointInStroke answers about the path, not about what is painted, so a
             clipped trace still reports a hit outside its clip. Read the clip
             rectangle and drop any hit that falls outside it. */
          const clipOf = el => {
            const ref = /url\(#([^)]+)\)/.exec(el.getAttribute('clip-path') || '');
            if (!ref) return null;
            const r = svg.querySelector('clipPath#' + ref[1] + ' > rect');
            if (!r) return null;
            return { x: +r.getAttribute('x'), y: +r.getAttribute('y'),
                     w: +r.getAttribute('width'), h: +r.getAttribute('height') };
          };
          const geo = geos.map(el => ({ el, k: cls(el) })).filter(g => g.k !== 'grid')
            .map(g => {
              const f = (g.el.getAttribute('fill') || 'none').toUpperCase();
              const m = /RGBA\([^)]*,\s*([\d.]+)\s*\)/.exec(f);
              const faint = m ? parseFloat(m[1]) < 0.35 : false;   // translucent wash = plate
              return Object.assign(g, { solid: !LIGHTFILL.includes(f) && !faint, clip: clipOf(g.el) });
            });
          const boxes = labels.map(l => l.box);
          labels.forEach((t, i) => {
            const b = boxes[i];
            if (!b || !b.width) return;
            const pad = 1.0;               // glyph boxes are tight; nudge outward a little
            const x0 = b.x - pad, x1 = b.x + b.width + pad;
            const y0 = b.y - pad, y1 = b.y + b.height + pad;
            const nx = Math.max(6, Math.min(40, Math.round((x1 - x0) / 2)));
            const ny = Math.max(3, Math.min(20, Math.round((y1 - y0) / 2)));
            let content = 0, axis = 0, total = 0;
            const hits = new Set();
            for (let a = 0; a <= nx; a++) for (let c = 0; c <= ny; c++) {
              const p = svg.createSVGPoint();
              p.x = x0 + (x1 - x0) * a / nx; p.y = y0 + (y1 - y0) * c / ny;
              total++;
              for (const g of geo) {
                let hit = false;
                if (g.clip && (p.x < g.clip.x || p.x > g.clip.x + g.clip.w ||
                               p.y < g.clip.y || p.y > g.clip.y + g.clip.h)) continue;
                try {
                  hit = (g.el.isPointInStroke && g.el.isPointInStroke(p)) ||
                        (g.solid && g.el.isPointInFill && g.el.isPointInFill(p));
                } catch (e) { hit = false; }
                if (hit) { if (g.k === 'content') { content++; hits.add(g.el.tagName + ':' + (g.el.getAttribute('stroke') || g.el.getAttribute('fill'))); } else axis++; break; }
              }
            }
            // text/text overlap
            let tt = null;
            for (let j = 0; j < labels.length; j++) {
              if (j === i) continue; const o = boxes[j]; if (!o || !o.width) continue;
              const ox = Math.min(b.x + b.width, o.x + o.width) - Math.max(b.x, o.x);
              const oy = Math.min(b.y + b.height, o.y + o.height) - Math.max(b.y, o.y);
              if (ox > 0.5 && oy > 0.5) { tt = labels[j].text.slice(0, 28); break; }
            }
            /* a label reaching past the edge of the figure is cut off by it */
            let cut = null;
            const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
            if (vb.length === 4) {
              const side = [];
              if (b.x < vb[0] - 0.5) side.push('left');
              if (b.y < vb[1] - 0.5) side.push('top');
              if (b.x + b.width > vb[0] + vb[2] + 0.5) side.push('right');
              if (b.y + b.height > vb[1] + vb[3] + 0.5) side.push('bottom');
              if (side.length) cut = side.join('+');
            }
            /* An axis name is held to the clearance R7 asks for, so any hit on the
               axis line, its arrowhead or a tick mark is recorded, not only a hit
               large enough to matter for an ordinary label. */
            const strict = t.role === 'axisname';
            if (content || tt || cut || axis > (strict ? 0 : total * 0.10)) {
              out.push({ svg: si, text: t.text.slice(0, 40),
                halo: t.halo, cut, role: t.role,
                cf: +(content / total).toFixed(3), af: +(axis / total).toFixed(3),
                over: Array.from(hits).slice(0, 3), tt });
            }
          });
        });
        return out;
      }, { GRID, AXIS });
      found.forEach(f => all.push({ scene: s.id, step: st, ...f }));
    }
  }
  await browser.close();

  // collapse duplicates across steps
  const seen = new Map();
  for (const r of all) {
    const k = r.scene + '|' + r.svg + '|' + r.text;
    const p = seen.get(k);
    const worse = !p || (!!r.cut && !p.cut) || (!!r.cut === !!p.cut
      && (r.cf > p.cf || (r.cf === p.cf && r.af > p.af)));
    if (worse) seen.set(k, r);
  }
  const rows = Array.from(seen.values()).sort((a, b) => b.cf - a.cf);
  /* A haloed tick number, or any haloed label of one or two symbols, crossed by a
     curve is acceptable: the halo cuts the curve around the glyphs and both stay
     readable. A word, an equation or a caption running under a signal is not, and
     neither is one label sitting on another, nor any label drawn without a halo,
     nor any label reaching past the edge of the figure, which cuts it off.
     An axis name is outside that leniency however short it is. It is drawn in the
     margin, so it has no reason to touch anything: a hit on the data, on the axis
     line, on the arrowhead at its end or on a tick mark is a collision. This is the
     clearance R7 asks for, checked rather than trusted. */
  const numeric = t => /^[-−]?[\d.,]+$/.test(t.trim());
  const isAxisName = r => r.role === 'axisname';
  const isSoft = r => r.halo && !r.tt && !r.cut && !isAxisName(r)
    && (numeric(r.text) || r.text.trim().length <= 2);
  const bad = r => r.cf > 0 || r.tt || r.cut || (isAxisName(r) && r.af > 0);
  const hard = rows.filter(r => bad(r) && !isSoft(r));
  const soft = rows.filter(r => bad(r) && isSoft(r));
  for (const r of hard) {
    console.log([r.scene, 'svg' + r.svg, JSON.stringify(r.text), 'content=' + r.cf,
      isAxisName(r) ? 'AXISNAME axis=' + r.af : '',
      r.cut ? 'CUT:' + r.cut : '',
      r.halo ? '' : 'NO-HALO', r.tt ? 'TT:' + JSON.stringify(r.tt) : '', r.over.join(' ')].join('  '));
  }
  console.log('FIGURES CHECKED: ' + rows.length + ' flagged, of which ' + soft.length
    + ' are haloed tick labels (accepted)');
  console.log('TOTAL COLLISIONS: ' + hard.length);
  fs.writeFileSync(path.resolve(__dirname, '..', 'textclash.json'), JSON.stringify(rows, null, 1));
})();
