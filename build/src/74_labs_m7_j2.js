/* ==========================================================================
   Laboratory 7.2 (key J2) — Module 7  [Source: 81–82]
   The Nyquist test made visible. A band-limited spectrum with wM = 2 pi rad/s
   is replicated at a sampling rate the reader slides. The copies stand 1/T
   tall and sit every wS; where two of them overlap the region is painted in
   the aliasing colour, which is used for nothing else in this module. A
   number line under the spectrum sets wS against the Nyquist rate 2 wM.
   Every displayed number is computed from the definitions at interaction
   time. Styled like build/src/73_labs_m6_i1.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
  const PI = Math.PI;
  /* a signal colour as a translucent rgba wash, so a label resting on it reads
     as sitting on a plate rather than on a trace */
  const wash = (c,a) => { const n = parseInt(c.slice(1),16);
    return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };

  /* frequency ticks in multiples of pi; a tick number is part of the scale and
     stays plain text */
  const piTick = v => {
    const r = v/PI;
    if(Math.abs(r) < 1e-9) return '0';
    const k = Math.round(r);
    if(Math.abs(r-k) < 1e-7){ const m=Math.abs(k); return (k<0?'-':'')+(m===1?'π':m+'π'); }
    return PLOT.fmt(v,2);
  };
  const wTicks = (lo,hi,step) => { const o=[];
    for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };

  /* =======================================================================
     J2 · THE NYQUIST TEST                             [Source: 81–82]
     The rate moves in steps of pi/5 rad/s, so the Nyquist rate 4 pi is a
     step of the slider (k = 20) and the verdict "touching" is an exact
     integer comparison, never a floating-point accident.
     ======================================================================= */
  const J2 = (() => {
    const WM = 2*PI, U = PI/5, K_NYQ = 20;
    const presets = { t1:25, t2:20, t3:15 };        /* T = 0.40, 0.50, 2/3 s */
    let shape = 'tri', k = 25;

    /* a rate given in steps of pi/5, as TeX: 25 -> 5\pi, 22 -> 4.4\pi */
    const pis = n => { if(n === 0) return '0';
      const m = Math.abs(n), s = n < 0 ? '-' : '';
      if(m % 5 === 0){ const q = m/5; return s + (q === 1 ? '\\pi' : q+'\\pi'); }
      return s + (m/5).toFixed(1) + '\\pi'; };

    /* the triangle of half-width wM and peak pk, and the sum of its copies */
    const tri = (w,pk) => Math.abs(w) <= WM ? pk*(1-Math.abs(w)/WM) : NaN;
    const tri0 = (w,pk) => Math.abs(w) <= WM ? pk*(1-Math.abs(w)/WM) : 0;
    const rep = (w,pk,ws,K) => { let s=0; for(let j=-K;j<=K;j++) s += tri0(w-j*ws,pk); return s; };
    /* inside an overlap of two neighbouring copies (valid for ws >= wM) */
    const inOv = (w,ws) => { if(ws >= 2*WM - 1e-9) return false;
      const r = w - Math.floor(w/ws)*ws; return r >= ws-WM-1e-9 && r <= WM+1e-9; };

    /* x(t) = 1 + cos(pi t) + sin(2 pi t): a constant gives 2 pi at the origin,
       the cosine pi at +-pi, the sine pi/j = -j pi at +2 pi and +j pi at -2 pi.
       Each line is [position, real part, imaginary part]. */
    const LINES = [[0,2*PI,0],[PI,PI,0],[-PI,PI,0],[WM,0,-PI],[-WM,0,PI]];
    /* every copy of every line within the window, scaled by 1/T; lines that
       land on the same frequency are added, because the sampler stores one
       number there */
    function lineCopies(ws, span){
      const pk = ws/(2*PI), K = Math.ceil(span/ws) + 1, tol = 1e-9*ws, out = [];
      for(let j=-K;j<=K;j++) for(const [w0,re,im] of LINES){
        const pos = w0 + j*ws; if(Math.abs(pos) > span + tol) continue;
        let e = out.find(o => Math.abs(o.pos-pos) < tol);
        if(!e){ e = { pos, re:0, im:0, ks:[] }; out.push(e); }
        e.re += re*pk; e.im += im*pk; if(e.ks.indexOf(j) < 0) e.ks.push(j);
      }
      return out;
    }

    function draw(root){
      const ws = k*U, pk = ws/(2*PI), g = k - K_NYQ, span = 10*PI;
      const verdict = g > 0 ? 'apart' : (g === 0 ? 'touching' : 'over');
      const C = PLOT.COL;

      /* ---- panel 1: the sampled spectrum ---- */
      let A1, legend;
      if(shape === 'tri'){
        A1 = PLOT.Axes({w:760,h:300,xr:[-span,span],yr:[-0.12*pk,1.34*pk],xlabel:'\\omega',ylabel:'X_p(j\\omega)',
          pad:{l:64,r:24,t:30,b:36},xticksOverride:wTicks(-span,span,2*PI),xtickfmt:piTick,
          yticksOverride:[pk],ytickfmt:v=>fmt(v,3),yticksLeft:true});
        const K = Math.ceil(span/ws) + 1, ov = w => inOv(w,ws);
        if(verdict === 'over') for(let j=-K-1;j<=K;j++)
          A1.area(w=>rep(w,pk,ws,K+1),(j+1)*ws-WM,j*ws+WM,{color:wash(C.err,.22),n:120});
        for(let j=-K;j<=K;j++){
          const col = j ? C.mid : C.in;
          A1.curve(w=> ov(w) ? NaN : tri(w-j*ws,pk),{color:col,n:1800});
          A1.curve(w=> ov(w) ? tri(w-j*ws,pk) : NaN,{color:col,n:1800,width:1.4,dash:'4 4'});
        }
        A1.curve(w=> ov(w) ? rep(w,pk,ws,K+1) : NaN,{color:C.err,n:2600,width:2.6});
        legend = L('in','\\text{baseband}') + L('mid','\\text{copies}') + L('err','\\text{overlap}');
      } else {
        const lines = lineCopies(ws, span), top = 2*PI*pk;
        A1 = PLOT.Axes({w:760,h:300,xr:[-span,span],yr:[-0.1*top,1.34*top],xlabel:'\\omega',ylabel:'|X_p(j\\omega)|',
          pad:{l:64,r:24,t:30,b:36},xticksOverride:wTicks(-span,span,2*PI),xtickfmt:piTick,
          yticksOverride:[PI*pk,2*PI*pk],ytickfmt:v=>fmt(v,3),yticksLeft:true});
        if(verdict === 'over') for(let j=-Math.ceil(span/ws)-1;j<=Math.ceil(span/ws);j++)
          A1.rect((j+1)*ws-WM,0,j*ws+WM,1.12*top,{fill:wash(C.err,.16)});
        for(const e of lines){
          const mag = Math.hypot(e.re, e.im), intr = e.ks.some(j=>j!==0) && Math.abs(e.pos) <= WM + 1e-9;
          if(mag < 1e-9*top){ A1.point(e.pos,0,{color:C.err,r:6,ring:C.plate}); continue; }
          const col = intr ? C.err : (e.ks.length===1 && e.ks[0]===0 ? C.in : C.mid);
          A1.impulse(e.pos, mag, {color:col, label:false});
        }
        legend = L('in','\\text{baseband}') + L('mid','\\text{copies}') + L('err','\\text{in the band}');
      }

      /* ---- panel 2: the rate against the Nyquist rate ---- */
      const A2 = PLOT.Axes({w:760,h:150,xr:[0,8.6*PI],yr:[0,1],xlabel:'\\omega\\;[\\text{rad/s}]',grid:false,
        pad:{l:64,r:24,t:34,b:36},xticksOverride:wTicks(0,8.6*PI,2*PI),xtickfmt:piTick,yticksOverride:[]});
      /* the gap between 2 wM and wS: green while it is a guard band, red while
         it is the width by which the copies overlap */
      if(g !== 0){ const lo=Math.min(ws,4*PI), hi=Math.max(ws,4*PI);
        A2.rect(lo,0,hi,0.42,{fill:wash(g>0?C.out:C.err,.24)});
        if(hi-lo >= 1.7*PI) A2.note((lo+hi)/2,0.13,g>0?'\\text{guard band}':'\\text{overlap width}',
          {tex:true,anchor:'middle',color:g>0?C.out:C.err,fs:14}); }
      A2.poly([[WM,0],[WM,0.7]],{color:C.muted,width:1,dash:'3 4'});
      A2.poly([[4*PI,0],[4*PI,0.7]],{color:C.coral,width:1.8,dash:'5 4'});
      A2.impulse(ws,0.7,{color:C.mid,label:false});
      /* three names over three marks; a name moves aside when its mark is
         close to another one */
      const side = (x, others, right) => { const o = others.find(y => Math.abs(y-x) < 0.9*PI);
        return o == null ? ['middle',0] : (x > o + 1e-9 || (Math.abs(x-o) < 1e-9 && right) ? ['start',8] : ['end',-8]); };
      const put = (x, tex, col, others, right) => { const [an,dx] = side(x, others, right);
        A2.note(x,0.86,tex,{tex:true,anchor:an,dx,color:col,fs:14}); };
      put(WM,'\\omega_M',C.muted,[ws],true);
      put(4*PI,'2\\omega_M',C.coral,[ws],true);
      put(ws,'\\omega_s',C.mid,[WM,4*PI],false);

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${legend}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}</div>`;

      /* ---- readouts ---- */
      const gcls = g > 0 ? 'okv' : 'warnv';
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Nyquist rate $2\\omega_M$</dt><dd>$${pis(K_NYQ)}$ rad/s</dd></div>
        <div><dt>Guard band $\\omega_s-2\\omega_M$</dt><dd class="${gcls}">$${pis(g)}$ rad/s</dd></div>
        <div><dt>Overlap width</dt><dd class="${g<0?'warnv':''}">$${pis(Math.max(0,-g))}$ rad/s</dd></div>
        <div><dt>Copy height $1/T$</dt><dd>${fmt(pk,3)}</dd></div>`);

      root.querySelector('.signame').innerHTML = T(shape==='tri'
        ? 'x(t)=\\bigl(\\tfrac{\\sin\\pi t}{\\pi t}\\bigr)^{2},\\quad \\omega_M=2\\pi'
        : 'x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t),\\quad \\omega_M=2\\pi', false);

      /* ---- the test and its verdict ---- */
      const cmp = g > 0 ? '>' : (g === 0 ? '=' : '<');
      const chip = (ok,txt) => `<span class="chip ${ok?'yes':'no'}">${txt}</span>`;
      let note;
      if(verdict === 'apart') note = `<div class="note ok"><span class="note-h">Copies apart</span>
          The gap from $\\omega_M=2\\pi$ to $\\omega_s-\\omega_M=${pis(k-10)}$ holds the cutoff of an ideal
          low-pass filter.<span class="chips">${chip(true,'apart')}${chip(true,'recoverable')}</span></div>`;
      else if(verdict === 'touching') note = `<div class="note warn"><span class="note-h">Copies touching</span>
          ${shape==='tri' ? 'The copies meet at $\\omega=\\pm2\\pi$, and $2\\pi<\\omega_c<2\\pi$ holds no cutoff.'
                           : 'At $\\omega=\\pm2\\pi$ each sine line meets a copy line of the opposite sign, and they cancel.'}
          <span class="chips">${chip(false,'touching')}${chip(false,'no cutoff')}</span></div>`;
      else note = `<div class="note err"><span class="note-h">Copies overlap</span>
          From $\\omega_s-\\omega_M=${pis(k-10)}$ to $\\omega_M=2\\pi$ the sampler stores a sum, and no filter
          can undo it.<span class="chips">${chip(false,'overlapping')}${chip(false,'aliased')}</span></div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Nyquist test</span>${T(`\\omega_s=${pis(k)}\\ ${cmp}\\ 2\\omega_M=4\\pi`,true)}</div>` + note);

      const sl = root.querySelector('[data-v=ws]');
      sl.value = k;
      root.querySelector('[data-out=ws]').innerHTML = M(`$${pis(k)}$ rad/s`);
      root.querySelectorAll('[data-seg="shape"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===shape)));
      root.querySelectorAll('[data-seg="rate"]').forEach(b=>b.setAttribute('aria-pressed',String(presets[b.dataset.val]===k)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Spectrum <span class="seg">
                <button data-seg="shape" data-val="tri">triangle</button>
                <button data-seg="shape" data-val="lines">three lines</button></span></label></div>
              <div class="ctrl"><label>Worked example <span class="seg">
                <button data-seg="rate" data-val="t1">$T_1$</button>
                <button data-seg="rate" data-val="t2">$T_2$</button>
                <button data-seg="rate" data-val="t3">$T_3$</button></span></label></div>
              <div class="ctrl"><label><span>Rate $\\omega_s$</span> <span class="val" data-out="ws"></span></label>
                <input type="range" data-v="ws" min="11" max="40" step="1" value="25"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v!=='ws') return;
        const was=Math.sign(k-K_NYQ); k=parseInt(e.target.value,10); draw(root);
        if(Math.sign(k-K_NYQ)!==was) RENDER.fit(); });
      root.addEventListener('click', e=>{
        const s=e.target.closest('[data-seg="shape"]'); if(s){ shape=s.dataset.val; draw(root); RENDER.fit(); return; }
        const r=e.target.closest('[data-seg="rate"]'); if(r){ k=presets[r.dataset.val]; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  return { J2 };
})());
