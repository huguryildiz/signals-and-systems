/* ==========================================================================
   Laboratory 7.1 (key J1) — Module 7  [Source: 80–81]
   The sampler seen in both domains. One sampling period T drives two plots:
   in time, the impulse train samples x(t) and each arrow carries x(nT); in
   frequency, a copy of X(jw), scaled by 1/T, stands at every multiple of
   w_s = 2 pi / T. Both signals are band-limited to w_M = 2 pi rad/s.
   The copies are drawn at every setting. When they overlap, their sum is
   drawn in the aliasing colour and the copies go dashed; what the overlap
   costs is the subject of the next section, so the verdict here stays short.
   Every displayed number is computed from T at interaction time.
   Styled like build/src/73_labs_m6_i1.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const L = (c,l,dash)=>`<i class="lg-${c}${dash?' lg-dash':''}">${T(l,false)}</i>`;
  const PI = Math.PI;

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
  /* a multiple of pi as TeX, with two places unless it is an integer */
  const piTex = r => { const k=Math.round(r);
    const s = Math.abs(r-k) < 1e-9 ? String(k) : r.toFixed(2);
    return s==='0' ? '0' : s==='1' ? '\\pi' : s==='-1' ? '-\\pi' : s+'\\pi'; };

  /* =======================================================================
     J1 · THE SAMPLER IN TWO DOMAINS                  [Source: 80–81]
     ======================================================================= */
  const J1 = (() => {
    const WM = 2*PI;                 /* both signals: X(jw) = 0 for |w| > 2 pi */
    const sinc2 = t => { const u=PI*t; return Math.abs(u)<1e-9 ? 1 : Math.pow(Math.sin(u)/u,2); };
    const shapes = {
      /* (sin(pi t)/(pi t))^2  <->  triangle of peak 1 on |w| <= 2 pi */
      tri:{ x:sinc2, X:w=> Math.abs(w)<=WM ? 1-Math.abs(w)/WM : 0,
        tex:'x(t)=\\Bigl(\\dfrac{\\sin(\\pi t)}{\\pi t}\\Bigr)^{2}', yr:[-0.2,1.3], yt:[0,0.5,1] },
      /* sin(2 pi t)/(pi t)  <->  rectangle of height 1 on |w| < 2 pi */
      rect:{ x:t=> Math.abs(t)<1e-9 ? 2 : Math.sin(WM*t)/(PI*t), X:w=> Math.abs(w)<WM ? 1 : 0,
        tex:'x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}', yr:[-0.65,2.45], yt:[0,1,2] }
    };
    let key='tri', Ts=0.25;

    function draw(root){
      const sh = shapes[key], ws = 2*PI/Ts, pk = 1/Ts, gap = ws - 2*WM;
      const touch = Math.abs(gap) < 1e-9, over = gap < -1e-9;
      const C = PLOT.COL;

      /* ---- panel 1: x(t) and the impulses x(nT) delta(t - nT) ---- */
      const A1 = PLOT.Axes({w:760,h:175,xr:[-2.2,2.2],yr:sh.yr,
        xlabel:'t\\;[\\text{s}]',ylabel:'x_p(t)',pad:{l:56,r:24,t:26,b:34},xtarget:9,ytarget:3,yticksOverride:sh.yt,yticksLeft:true});
      A1.curve(sh.x,{color:C.in,width:1.4,dash:'5 5',n:1800});
      const N = Math.floor(2.2/Ts+1e-9);
      for(let n=-N;n<=N;n++){ const v=sh.x(n*Ts);
        if(Math.abs(v) > 0.012) A1.impulse(n*Ts,v,{color:C.mid,label:false}); }

      /* ---- panel 2: X_p(jw), one copy at every k w_s, each 1/T tall ---- */
      const A2 = PLOT.Axes({w:760,h:215,xr:[-18*PI,18*PI],yr:[-0.4,10],
        xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
        pad:{l:56,r:24,t:30,b:36},xticksOverride:wTicks(-18*PI,18*PI,6*PI),xtickfmt:piTick,
        yticksOverride:[0,4,8],yticksLeft:true});
      const K = Math.ceil(20*PI/ws);
      /* one copy as its outline: a triangle, or a rectangle with its two
         vertical edges, standing on the axis at k w_s */
      const copy = k => { const c=k*ws;
        return key==='tri' ? [[c-WM,0],[c,pk],[c+WM,0]] : [[c-WM,0],[c-WM,pk],[c+WM,pk],[c+WM,0]]; };
      if(!over && gap > 1e-9){
        /* the guard band on each side, shaded between the copies */
        for(let k=-K;k<K;k++){ const lo=k*ws+WM, hi=(k+1)*ws-WM;
          if(hi>-18*PI && lo<18*PI) A2.rect(Math.max(lo,-18*PI),0,Math.min(hi,18*PI),9.6,{fill:'rgba(74,122,70,.13)'}); }
      }
      for(let k=-K;k<=K;k++)
        A2.poly(copy(k),{color:k===0?C.in:C.mid,width:over?1.4:null,dash:over?'4 4':null});
      if(over){
        const sum = w => { let s=0; for(let k=-K-1;k<=K+1;k++) s += sh.X(w-k*ws); return pk*s; };
        A2.curve(sum,{color:C.err,width:2.6,n:3000});
      }

      const lg2 = L('in','k=0') + L('mid','k\\neq0')
        + (over ? L('err','\\text{sum}') : (!touch ? L('out','\\text{guard band}') : ''));
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)',true)}${L('mid','x_p(t)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${lg2}</div></div>`;

      /* ---- readouts ---- */
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$\\omega_s$ [rad/s]</dt><dd>$${piTex(ws/PI)}$</dd></div>
        <div><dt>$f_s$ [Hz]</dt><dd>${fmt(1/Ts,3)}</dd></div>
        <div><dt>$1/T$</dt><dd>${fmt(pk,3)}</dd></div>
        <div><dt>$\\omega_s-2\\omega_M$</dt><dd class="${over?'warnv':(touch?'':'okv')}">$${piTex(gap/PI)}$</dd></div>`);

      root.querySelector('.signame').innerHTML = T(`${sh.tex},\\quad T=${Ts.toFixed(2)}\\ \\text{s}`, false);

      const verdict = over
        ? `<div class="note err"><span class="note-h">Copies overlap</span>
             The gap is $${piTex(gap/PI)}$ rad/s, below zero. Neighbouring copies add, and the red curve is their sum.</div>`
        : touch
        ? `<div class="note warn"><span class="note-h">Copies touch</span>
             The gap is zero: $\\omega_s=2\\omega_M=4\\pi$ rad/s, and the copies meet at $\\pm\\omega_M$.</div>`
        : `<div class="note warn"><span class="note-h">Guard band</span>
             A gap of $${piTex(gap/PI)}$ rad/s separates the baseband from the copy at $k=1$.</div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Sampled spectrum</span>${T(`X_p(j\\omega)=\\frac{1}{T}\\sum_{k}X\\bigl(j(\\omega-k\\omega_s)\\bigr),\\quad \\omega_s=\\frac{2\\pi}{T}=${piTex(ws/PI)}`,true)}</div>`
        + `<div class="note ok"><span class="note-h">Copies at every rate</span>
             The copies sit $${piTex(ws/PI)}$ rad/s apart, each $${fmt(pk,3)}$ tall. A shorter $T$ moves them apart and makes them taller.</div>`
        + verdict);

      root.querySelector('[data-v=T]').value = Ts;
      root.querySelector('[data-out=T]').textContent = Ts.toFixed(2)+' s';
      root.querySelectorAll('[data-seg=shape]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.val===key)));
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
                <button data-seg="shape" data-val="rect">rectangle</button></span></label></div>
              <div class="ctrl"><label>Sampling period $T$ <span class="val" data-out="T">0.25 s</span></label>
                <input type="range" data-v="T" min="0.12" max="0.8" step="0.01" value="0.25"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v==='T'){ Ts=parseFloat(e.target.value); draw(root); RENDER.fit(); } });
      root.addEventListener('click', e=>{
        const b=e.target.closest('[data-seg=shape]');
        if(b){ key=b.dataset.val; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  return { J1 };
})());
