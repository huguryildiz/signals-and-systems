/* ==========================================================================
   EE311 · Scientific plotting primitives (pure SVG, no dependencies)
   Every figure is generated from its mathematical definition, is resolution
   independent, keeps selectable text labels, and follows the signal colour
   semantics of the visual system.
   ========================================================================== */
const PLOT = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const LIGHT = {
    axis:'#8C8579', grid:'#E2DACA', ink:'#1B1A17', muted:'#6E6960',
    in:'#14707F', h:'#C08422', out:'#4A7A46', mid:'#6A5A92', err:'#A63B2A',
    coral:'#BE5539', slate:'#4A657F'
  };
  const DARK = {
    axis:'#8E8button', grid:'#2C2820', ink:'#F4EDDF', muted:'#A79D8B',
    in:'#4FBECE', h:'#E5B255', out:'#82C27B', mid:'#AC99DC', err:'#E8785F',
    coral:'#E08A6B', slate:'#8FA9C2'
  };
  DARK.axis = '#8E8578';
  const COL = Object.assign({}, LIGHT);
  let LBLS = 1;   /* label scale  */
  let STRW = 1;   /* stroke scale */
  function setTheme(o){
    o = o || {};
    Object.assign(COL, o.dark ? DARK : LIGHT);
    LBLS = o.scale || 1;
    STRW = 1 + (LBLS - 1) * 0.75;
  }
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ---------- axis names are typeset mathematics ----------
     xlabel and ylabel are TeX source, so an axis name reads with the same
     typography as the equations in the running text: variables italic, digits
     and brackets upright, Greek letters as \tau, \omega and so on. Words inside
     a name go in \text{...}. The name is laid out in a foreignObject anchored on
     the position the plain label used, so the geometry of the frame is unchanged.
       'n'                          → n
       't\\;(\\text{independent variable})'
       '\\operatorname{Re}\\{x[n]\\}'
     A label that fails to parse falls back to its source text and reports an
     error, so a broken name turns the layout sweep red instead of shipping. */
  const TEXOPT = { throwOnError:true, strict:false, output:'html' };
  function texName(src, opts){
    const { xRight, xLeft, baseline, size } = opts;
    const fs = size*LBLS, BW = 460, BH = 34*LBLS;
    let html;
    try { html = katex.renderToString(String(src), TEXOPT); }
    catch(e){
      console.error('PLOT: axis name is not valid TeX: ' + src + ' — ' + e.message);
      const x = xRight!=null ? xRight : xLeft;
      return `<text x="${x.toFixed(2)}" y="${baseline.toFixed(2)}" ${halo()} font-size="${fs}"
        font-style="italic" fill="${COL.ink}" text-anchor="${xRight!=null?'end':'start'}">${esc(src)}</text>`;
    }
    const x = xRight!=null ? xRight - BW : xLeft;
    /* the halo of an svg label is a stroke under the glyphs; the same effect for
       laid-out text is an opaque copy offset in eight directions, which every
       engine draws behind the glyphs and never over them */
    const c = 'var(--fig-halo,#FCF9F3)';
    const r = (2.2*LBLS).toFixed(2), d = (1.6*LBLS).toFixed(2);
    const ring = [[r,0],[-r,0],[0,r],[0,-r],[d,d],[d,-d],[-d,d],[-d,-d]]
      .map(([a,b]) => `${a}px ${b}px 0 ${c}`).join(',') + `,0 0 ${r}px ${c}`;
    return `<foreignObject x="${x.toFixed(2)}" y="${(baseline-BH).toFixed(2)}" width="${BW}" height="${BH}"
      overflow="visible" data-axisname="1" style="overflow:visible;pointer-events:none">
      <div xmlns="http://www.w3.org/1999/xhtml" style="height:${BH}px;display:flex;align-items:flex-end;
        justify-content:${xRight!=null?'flex-end':'flex-start'};font-size:${fs}px;color:${COL.ink};
        text-shadow:${ring}">${html}</div></foreignObject>`;
  }
  /* Every label in a figure is drawn over a halo in the surrounding page colour.
     A curve, stem or arrow passing behind a label is interrupted by the halo
     rather than running through the glyphs, so both stay readable. The colour
     comes from the page, so it follows the light, dark and navy palettes. */
  const halo = (w=3) => `paint-order="stroke" stroke="var(--fig-halo,#FCF9F3)"`
    + ` stroke-width="${(w*LBLS).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round"`;
  const fmt = (v,d=2) => {
    if (!isFinite(v)) return '∞';
    const r = Math.round(v*10**d)/10**d;
    if (Math.abs(r) < 0.5*Math.pow(10,-d)) return '0';
    return String(r);
  };

  /* ---------- axis tick selection: "nice" 1-2-5 steps ---------- */
  function niceStep(range, target){
    const raw = range/Math.max(1,target);
    const mag = 10**Math.floor(Math.log10(raw));
    const n = raw/mag;
    const m = n<1.5?1 : n<3?2 : n<7?5 : 10;
    return m*mag;
  }
  function ticks(lo,hi,target=6,step){
    const s = step || niceStep(hi-lo,target);
    const out=[]; const start=Math.ceil(lo/s - 1e-9)*s;
    for(let v=start; v<=hi+1e-9; v+=s) out.push(Math.abs(v)<1e-12?0:v);
    return out;
  }

  /* ======================================================================
     Axes — a plotting frame with mathematical coordinates.
     opt: {w,h,xr,yr,xlabel,ylabel,xticks,yticks,pad,grid,xstep,ystep,
           xtickfmt,ytickfmt,zeroAxes}
     xlabel and ylabel are TeX source — see texName above.
     ====================================================================== */
  function Axes(opt){
    const o = Object.assign({
      w:640, h:300, xr:[-1,1], yr:[-1,1], pad:{l:52,r:22,t:20,b:40},
      xlabel:'', ylabel:'', grid:true, zeroAxes:true,
      xtarget:7, ytarget:4, xstep:null, ystep:null,
      xtickfmt:v=>fmt(v,3), ytickfmt:v=>fmt(v,3),
      xticksOverride:null, yticksOverride:null, arrows:true
    }, opt);
    const [xa,xb]=o.xr, [ya,yb]=o.yr;
    /* Axis names sit outside the data area, so no curve can cross them. The
       margins below reserve the strip each name needs; the data area shrinks
       inside the same figure box, so nothing in the page layout moves. */
    const P = Object.assign({l:52,r:22,t:20,b:40}, o.pad||{}), W=o.w, H=o.h;
    const zeroInside = (ya<=0 && yb>=0);
    /* A typeset name is one line of mathematics tall: everything from the top of
       a tall bracket down to the tail of a parenthesis. NAMEBOX is that height at
       the size axis names use, so the strip reserved above the data area holds the
       whole name and nothing is cut off by the edge of the figure. */
    const NAMEBOX = 21*LBLS;
    if(o.ylabel) P.t = Math.max(P.t, NAMEBOX + 8);
    /* The name of the independent variable sits just under the lower edge of the
       data area, clear of the tick row wherever the zero line happens to fall.
       A tick number is set 20 below the axis it belongs to and reaches about 4
       further down; the name above its own baseline is one line tall. Leaving the
       name 45 below the axis keeps a clear gap between the two, so the last tick
       number and the name never touch even at the right-hand edge, where they
       share the same column. */
    const XNAME_DROP = 45;
    const xnameY = (Pb) => {
      const yy0 = H - Pb;
      if(!zeroInside) return yy0 + XNAME_DROP + 1;
      const zeroPx = (0-ya)/(yb-ya)*(H - P.t - Pb);
      return Math.max(yy0 + 16, yy0 - zeroPx + XNAME_DROP);
    };
    if(o.xlabel){
      P.b = Math.max(P.b, 24);
      for(let k=0;k<5;k++){
        /* room below the baseline for the tail of a parenthesis or a subscript */
        const want = xnameY(P.b) + 0.42*NAMEBOX - H;
        if(want > 0.5) P.b += want; else break;
      }
    }
    const x0=P.l, x1=W-P.r, y0=H-P.b, y1=P.t;
    const sx = v => x0 + (v-xa)/(xb-xa)*(x1-x0);
    const sy = v => y0 - (v-ya)/(yb-ya)*(y0-y1);
    const parts=[];
    const api={
      o, sx, sy, W, H, x0, x1, y0, y1,
      raw(s){ parts.push(s); return api; },
      /* ---- continuous curve from a function ---- */
      curve(f, opts={}){
        const n = opts.n||520, col=opts.color||COL.in, wdt=(opts.width||2.2)*STRW;
        const seg=[]; let cur=[];
        for(let i=0;i<=n;i++){
          const t = xa + (xb-xa)*i/n;
          let v; try{ v=f(t); }catch(e){ v=NaN; }
          if(v==null||!isFinite(v)){ if(cur.length) seg.push(cur); cur=[]; continue; }
          const yv=Math.max(ya-(yb-ya),Math.min(yb+(yb-ya),v));
          cur.push([sx(t),sy(yv)]);
        }
        if(cur.length) seg.push(cur);
        seg.forEach(s=>{
          if(s.length<2) return;
          const d='M'+s.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L');
          parts.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${wdt}"
            stroke-linejoin="round" stroke-linecap="round"${opts.dash?` stroke-dasharray="${opts.dash}"`:''}
            ${opts.opacity?` opacity="${opts.opacity}"`:''}/>`);
        });
        return api;
      },
      /* ---- polyline through explicit points ---- */
      poly(pts, opts={}){
        if(pts.length<2) return api;
        const col=opts.color||COL.in, wdt=(opts.width||2.2)*STRW;
        const d='M'+pts.map(p=>sx(p[0]).toFixed(2)+','+sy(p[1]).toFixed(2)).join('L');
        parts.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${wdt}"
          stroke-linejoin="round" stroke-linecap="round"${opts.dash?` stroke-dasharray="${opts.dash}"`:''}/>`);
        return api;
      },
      /* ---- filled area under a function (overlap highlighting) ---- */
      area(f, a, b, opts={}){
        const n=opts.n||260, col=opts.color||'rgba(20,112,127,.16)';
        const lo=Math.max(a,xa), hi=Math.min(b,xb);
        if(hi<=lo) return api;
        const pts=[];
        for(let i=0;i<=n;i++){ const t=lo+(hi-lo)*i/n; let v=f(t);
          if(!isFinite(v)) v=0; pts.push([sx(t),sy(v)]); }
        const d='M'+sx(lo).toFixed(2)+','+sy(0).toFixed(2)+'L'
          +pts.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L')
          +'L'+sx(hi).toFixed(2)+','+sy(0).toFixed(2)+'Z';
        parts.push(`<path d="${d}" fill="${col}" stroke="${opts.stroke||'none'}"/>`);
        return api;
      },
      rect(xA,yA,xB,yB,opts={}){
        parts.push(`<rect x="${Math.min(sx(xA),sx(xB)).toFixed(2)}" y="${Math.min(sy(yA),sy(yB)).toFixed(2)}"
          width="${Math.abs(sx(xB)-sx(xA)).toFixed(2)}" height="${Math.abs(sy(yB)-sy(yA)).toFixed(2)}"
          fill="${opts.fill||'none'}" stroke="${opts.stroke||'none'}" stroke-width="${opts.width||1.5}"
          ${opts.dash?`stroke-dasharray="${opts.dash}"`:''}/>`);
        return api;
      },
      /* ---- discrete-time stems ---- */
      stem(pairs, opts={}){
        const col=opts.color||COL.in, r=(opts.r||3.6)*STRW;
        pairs.forEach(([n,v])=>{
          if(n<xa-1e-9||n>xb+1e-9) return;
          const X=sx(n).toFixed(2);
          parts.push(`<line x1="${X}" y1="${sy(0).toFixed(2)}" x2="${X}" y2="${sy(v).toFixed(2)}"
            stroke="${col}" stroke-width="${(opts.width||1.8)*STRW}"/>`);
          if(Math.abs(v)>1e-12 || opts.showZero)
            parts.push(`<circle cx="${X}" cy="${sy(v).toFixed(2)}" r="${r}" fill="${col}"/>`);
          else
            parts.push(`<circle cx="${X}" cy="${sy(0).toFixed(2)}" r="${r*0.62}" fill="${col}" opacity=".55"/>`);
        });
        return api;
      },
      /* ---- impulse (Dirac) arrow with weight label ---- */
      impulse(t, weight, opts={}){
        const col=opts.color||COL.in;
        const top = opts.top!=null?opts.top:(weight>=0?Math.min(yb, Math.abs(weight)):Math.max(ya,-Math.abs(weight)));
        const X=sx(t), Y0=sy(0), Y1=sy(top);
        const dir = Y1<Y0 ? -1 : 1;
        parts.push(`<line x1="${X.toFixed(2)}" y1="${Y0.toFixed(2)}" x2="${X.toFixed(2)}" y2="${(Y1-dir*0).toFixed(2)}"
          stroke="${col}" stroke-width="${(opts.width||2.1)*STRW}"/>`);
        parts.push(`<path d="M${X.toFixed(2)},${Y1.toFixed(2)} l${(-5.2*STRW).toFixed(2)},${(dir*9*STRW).toFixed(2)} l${(10.4*STRW).toFixed(2)},0 Z" fill="${col}"/>`);
        if(opts.label!==false)
          parts.push(`<text x="${(X+8).toFixed(2)}" y="${(Y1+(dir<0?-4:14)).toFixed(2)}" ${halo()}
            font-family="var(--sans)" font-size="${(opts.fs||13)*LBLS}" fill="${col}">(${opts.labelText||fmt(weight,3)})</text>`);
        return api;
      },
      vline(t, opts={}){
        parts.push(`<line x1="${sx(t).toFixed(2)}" y1="${y1}" x2="${sx(t).toFixed(2)}" y2="${y0}"
          stroke="${opts.color||COL.muted}" stroke-width="${(opts.width||1)*STRW}"
          stroke-dasharray="${opts.dash||'3 4'}" opacity="${opts.opacity||.8}"/>`);
        return api;
      },
      hline(v, opts={}){
        parts.push(`<line x1="${x0}" y1="${sy(v).toFixed(2)}" x2="${x1}" y2="${sy(v).toFixed(2)}"
          stroke="${opts.color||COL.muted}" stroke-width="${(opts.width||1)*STRW}"
          stroke-dasharray="${opts.dash||'3 4'}" opacity="${opts.opacity||.8}"/>`);
        return api;
      },
      point(t,v,opts={}){
        parts.push(`<circle cx="${sx(t).toFixed(2)}" cy="${sy(v).toFixed(2)}" r="${(opts.r||4)*STRW}"
          fill="${opts.color||COL.coral}" stroke="${opts.ring||'#FCF9F3'}" stroke-width="${opts.ringw||1.4}"/>`);
        return api;
      },
      /* ---- text annotation in data coordinates ---- */
      note(t,v,txt,opts={}){
        parts.push(`<text x="${(sx(t)+(opts.dx||0)).toFixed(2)}" y="${(sy(v)+(opts.dy||0)).toFixed(2)}"
          ${halo(opts.haloW||3.4)} font-size="${(opts.fs||14)*LBLS}" fill="${opts.color||COL.muted}"
          text-anchor="${opts.anchor||'start'}" font-style="${opts.italic?'italic':'normal'}"
          font-weight="${opts.weight||400}">${esc(txt)}</text>`);
        return api;
      },
      /* ---- bracket/span annotation ---- */
      span(tA,tB,v,txt,opts={}){
        const col=opts.color||COL.coral, Y=sy(v);
        parts.push(`<path d="M${sx(tA).toFixed(2)},${(Y-5).toFixed(2)} v5 H${sx(tB).toFixed(2)} v-5"
          fill="none" stroke="${col}" stroke-width="${1.4*STRW}"/>`);
        if(txt) parts.push(`<text x="${((sx(tA)+sx(tB))/2).toFixed(2)}" y="${(Y-10).toFixed(2)}" ${halo()}
          font-size="${(opts.fs||13)*LBLS}" fill="${col}" text-anchor="middle">${esc(txt)}</text>`);
        return api;
      },
      svg(){
        const g=[];
        /* grid */
        const xt = o.xticksOverride || ticks(xa,xb,o.xtarget,o.xstep);
        const yt = o.yticksOverride || ticks(ya,yb,o.ytarget,o.ystep);
        if(o.grid){
          xt.forEach(v=>g.push(`<line x1="${sx(v).toFixed(2)}" y1="${y1}" x2="${sx(v).toFixed(2)}" y2="${y0}" stroke="${COL.grid}" stroke-width="1"/>`));
          yt.forEach(v=>g.push(`<line x1="${x0}" y1="${sy(v).toFixed(2)}" x2="${x1}" y2="${sy(v).toFixed(2)}" stroke="${COL.grid}" stroke-width="1"/>`));
        }
        /* zero axes */
        const yz = (ya<=0&&yb>=0)? sy(0) : null;
        const xz = (xa<=0&&xb>=0)? sx(0) : null;
        if(o.zeroAxes){
          if(yz!=null) g.push(`<line x1="${x0}" y1="${yz.toFixed(2)}" x2="${x1+(o.arrows?10:0)}" y2="${yz.toFixed(2)}" stroke="${COL.axis}" stroke-width="${1.5*STRW}"/>`);
          if(xz!=null) g.push(`<line x1="${xz.toFixed(2)}" y1="${y0}" x2="${xz.toFixed(2)}" y2="${y1-(o.arrows?8:0)}" stroke="${COL.axis}" stroke-width="${1.5*STRW}"/>`);
          if(o.arrows && yz!=null) g.push(`<path d="M${x1+10},${yz.toFixed(2)} l-8,-4 v8 Z" fill="${COL.axis}"/>`);
          if(o.arrows && xz!=null) g.push(`<path d="M${xz.toFixed(2)},${y1-8} l-4,8 h8 Z" fill="${COL.axis}"/>`);
        }
        /* frame when zero axes are outside the view */
        if(yz==null||xz==null)
          g.push(`<rect x="${x0}" y="${y1}" width="${x1-x0}" height="${y0-y1}" fill="none" stroke="${COL.axis}" stroke-width="1"/>`);
        /* tick labels */
        const yBase = yz!=null? yz : y0;
        xt.forEach(v=>{ const L=o.xtickfmt(v); if(L==='')return;
          if(Math.abs(v)<1e-12 && xz!=null && yz!=null) return;
          g.push(`<line x1="${sx(v).toFixed(2)}" y1="${yBase.toFixed(2)}" x2="${sx(v).toFixed(2)}" y2="${(yBase+5).toFixed(2)}" stroke="${COL.axis}" stroke-width="${1.2*STRW}"/>`);
          g.push(`<text x="${sx(v).toFixed(2)}" y="${(yBase+20*LBLS).toFixed(2)}" ${halo(3.4)} font-size="${13*LBLS}" fill="${COL.muted}" text-anchor="middle">${esc(L)}</text>`); });
        const xBase = xz!=null? xz : x0;
        yt.forEach(v=>{ const L=o.ytickfmt(v); if(L==='')return;
          if(Math.abs(v)<1e-12 && xz!=null && yz!=null) return;
          g.push(`<line x1="${xBase.toFixed(2)}" y1="${sy(v).toFixed(2)}" x2="${(xBase-5).toFixed(2)}" y2="${sy(v).toFixed(2)}" stroke="${COL.axis}" stroke-width="${1.2*STRW}"/>`);
          g.push(`<text x="${(xBase-10).toFixed(2)}" y="${(sy(v)+4.5).toFixed(2)}" ${halo(3.4)} font-size="${13*LBLS}" fill="${COL.muted}" text-anchor="end">${esc(L)}</text>`); });
        /* axis names — below the data area for the independent variable, above
           it for the dependent one. They are drawn after the data, so a signal
           that leaves the data area is interrupted by the name rather than
           drawn across it. */
        const names=[];
        if(o.xlabel) names.push(texName(o.xlabel, { xRight:x1+8, baseline:xnameY(P.b), size:15 }));
        if(o.ylabel) names.push(texName(o.ylabel, { xLeft:(xz!=null?xz+9:x0), baseline:y1-7, size:15 }));
        return `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" role="img" font-family="Inter,-apple-system,'Segoe UI',sans-serif">`
          + g.join('') + parts.join('') + names.join('') + `</svg>`;
      }
    };
    return api;
  }

  /* ======================================================================
     Block-diagram helper (system abstraction, cascades, parallels)
     ====================================================================== */
  function blocks(spec){
    const {w=640,h=140,items=[]} = spec;
    const g=[];
    items.forEach(it=>{
      if(it.t==='box'){
        g.push(`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="#FCF9F3"
          stroke="${it.color||COL.ink}" stroke-width="${1.6*STRW}" rx="2"/>`);
        (it.label||'').split('\n').forEach((L,i,arr)=>{
          g.push(`<text x="${it.x+it.w/2}" y="${it.y+it.h/2+5+(i-(arr.length-1)/2)*18}" ${halo()}
            font-size="${(it.fs||16)*LBLS}" fill="${COL.ink}" text-anchor="middle">${esc(L)}</text>`); });
      } else if(it.t==='arrow'){
        g.push(`<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2-8}" y2="${it.y2}" stroke="${it.color||COL.ink}" stroke-width="${1.5*STRW}"/>`);
        g.push(`<path d="M${it.x2},${it.y2} l-9,-4.5 v9 Z" fill="${it.color||COL.ink}"/>`);
        if(it.label) g.push(`<text x="${(it.x1+it.x2)/2}" y="${it.y1-10}" ${halo()} font-size="${15*LBLS}" fill="${it.color||COL.muted}" text-anchor="middle" font-style="italic">${esc(it.label)}</text>`);
      } else if(it.t==='text'){
        g.push(`<text x="${it.x}" y="${it.y}" ${halo()} font-size="${(it.fs||14)*LBLS}" fill="${it.color||COL.muted}"
          text-anchor="${it.anchor||'middle'}" font-style="${it.italic?'italic':'normal'}">${esc(it.label)}</text>`);
      } else if(it.t==='sum'){
        g.push(`<circle cx="${it.x}" cy="${it.y}" r="14" fill="#FCF9F3" stroke="${COL.ink}" stroke-width="1.6"/>`);
        g.push(`<text x="${it.x}" y="${it.y+6}" ${halo()} font-size="${18*LBLS}" fill="${COL.ink}" text-anchor="middle">+</text>`);
      } else if(it.t==='line'){
        g.push(`<path d="${it.d}" fill="none" stroke="${it.color||COL.ink}" stroke-width="${1.5*STRW}"/>`);
      }
    });
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="${NS}" role="img" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
  }

  return { Axes, blocks, COL, ticks, fmt, niceStep, setTheme };
})();
