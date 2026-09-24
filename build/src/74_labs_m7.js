/* ==========================================================================
   Laboratory 7.3 (key J) — Module 7  [Source: 83–86]
   Rebuilding a signal from its samples. The rate is chosen above, at or
   below the Nyquist rate (or set on a slider), and the samples are turned
   back into a continuous signal by the ideal filter, a zero-order hold or a
   first-order hold. The rebuilt signal is drawn against x(t), with the error
   under it and its root-mean-square value in the readout.
   Every displayed number is computed from the definitions at interaction
   time. Styled like build/src/73_labs_m6_i1.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const L = (c,l,dash)=>`<i class="lg-${c}${dash?' lg-dash':''}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* =======================================================================
     J · REBUILDING A SIGNAL FROM ITS SAMPLES          [Source: 83–86]

     The signal is  x(t) = 1 + cos(wM t / 2) + sin(wM t)  with fM = 3 Hz, so
     wM = 6 pi rad/s and its band edge carries a sine. At exactly wS = 2 wM
     every sample of that sine is zero, so the ideal filter loses it.
     The ideal filter has gain T and cutoff wS/2. For this line spectrum its
     output is exact: every copy is generated, the lines that land on the same
     frequency are added, and the lines strictly inside |w| < wS/2 are kept.
     ======================================================================= */
  const J = (() => {
    const FM = 3;                                  /* hertz */
    let st = { fS:12, mode:'ideal', preset:'over' };
    const presets = { over:{ name:'Oversampling', fS:12 },
                      crit:{ name:'Critical',     fS:6 },
                      under:{ name:'Undersampling', fS:4.5 } };
    const modes = { ideal:'ideal filter', zoh:'zero-order hold', foh:'first-order hold' };

    const xt = (t,wM)=> 1 + Math.cos(wM*t/2) + Math.sin(wM*t);

    /* the line spectrum of x: position and complex weight of each impulse.
       A constant gives 2 pi at 0, a cosine pi at each of +-w0, and a sine
       -j pi at +w0 and +j pi at -w0. */
    function lines(wM){
      const w1 = wM/2;
      return [ { w:0, re:2*PI, im:0 }, { w:w1, re:PI, im:0 }, { w:-w1, re:PI, im:0 },
               { w:wM, re:0, im:-PI }, { w:-wM, re:0, im:PI } ];
    }
    /* every copy of every line, lines at the same frequency added */
    function replicas(wM, wS){
      const span = Math.max(2.4*wS, 3.2*wM), K = Math.min(60, Math.ceil(span/wS)+1);
      const tol = wS*1e-9, map = new Map();
      for(let k=-K;k<=K;k++) for(const b of lines(wM)){
        const pos = b.w + k*wS; if(Math.abs(pos) > span) continue;
        const key = Math.round(pos/tol);
        let e = map.get(key); if(!e){ e = { pos, re:0, im:0 }; map.set(key,e); }
        e.re += b.re; e.im += b.im;
      }
      return Array.from(map.values());
    }
    /* ideal filter: gain T cancels the 1/T of the copies, cutoff wS/2 */
    function idealRec(wM, wS){
      const wC = wS/2, keep = replicas(wM,wS).filter(e => Math.abs(e.pos) < wC - 1e-9);
      return t => { let s=0; for(const e of keep) s += e.re*Math.cos(e.pos*t) - e.im*Math.sin(e.pos*t);
        return s/(2*PI); };
    }
    const zohRec = (Ts,wM)=> t => xt(Math.floor(t/Ts)*Ts, wM);
    const fohRec = (Ts,wM)=> t => { const n=Math.floor(t/Ts), u=t/Ts-n;
      return (1-u)*xt(n*Ts,wM) + u*xt((n+1)*Ts,wM); };
    /* root-mean-square of rec - x over two periods of the slowest term */
    function rms(rec, wM, win){
      let s=0; const N=1600;
      for(let i=0;i<N;i++){ const t=win*i/N, d=rec(t)-xt(t,wM); s+=d*d; }
      return Math.sqrt(s/N);
    }
    /* the frequency a component at w0 comes back at, in [0, wS/2] */
    const fold = (w0,wS)=> Math.abs(((w0 + wS/2) % wS + wS) % wS - wS/2);

    function draw(root){
      const wM = 2*PI*FM, wS = 2*PI*st.fS, Ts = 1/st.fS, wC = wS/2, guard = wS - 2*wM;
      const rate = guard > 1e-9 ? 'over' : (Math.abs(guard) <= 1e-9 ? 'crit' : 'under');
      const rec = st.mode==='zoh' ? zohRec(Ts,wM) : st.mode==='foh' ? fohRec(Ts,wM) : idealRec(wM,wS);
      const win = 4*PI/(wM/2);
      /* a round-off residue of the exact case is shown as 0 */
      const e0 = rms(rec, wM, win), err = e0 < 1e-9 ? 0 : e0;
      const exact = err < 1e-6;
      const name = st.mode==='zoh' ? 'x_0(t)' : st.mode==='foh' ? 'x_1(t)' : 'x_r(t)';

      /* ---- panel 1: the signal and its samples ---- */
      const A1 = PLOT.Axes({w:760,h:150,xr:[0,win],yr:[-1.6,3.9],yticksLeft:true,
        xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_p(t)',pad:{l:62,r:24,t:26,b:34},xtarget:6,yticksOverride:[-1,0,1,2,3]});
      A1.curve(t=>xt(t,wM),{color:PLOT.COL.in,width:1.8,n:1600});
      for(let n=0;n*Ts<=win+1e-9;n++) A1.impulse(n*Ts, xt(n*Ts,wM), {color:PLOT.COL.mid,label:false,width:1.7});

      /* ---- panel 2: the rebuilt signal against x(t) ---- */
      const A2 = PLOT.Axes({w:760,h:150,xr:[0,win],yr:[-1.6,3.9],yticksLeft:true,
        xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;'+name,pad:{l:62,r:24,t:26,b:34},xtarget:6,yticksOverride:[-1,0,1,2,3]});
      A2.curve(t=>xt(t,wM),{color:PLOT.COL.in,width:1.6,dash:'9 6',n:1600});
      A2.curve(rec,{color:PLOT.COL.out,width:2.6,n:1800});

      /* ---- panel 3: the error ---- */
      let emax = 0; for(let i=0;i<=800;i++){ const t=win*i/800; emax=Math.max(emax, Math.abs(rec(t)-xt(t,wM))); }
      const ey = Math.max(0.5, Math.ceil(emax*1.25*2)/2);
      const A3 = PLOT.Axes({w:760,h:120,xr:[0,win],yr:[-ey,ey*1.45],yticksLeft:true,
        xlabel:'t\\;[\\text{s}]',ylabel:name+'-x(t)',pad:{l:62,r:24,t:26,b:34},xtarget:6,yticksOverride:[-ey,0,ey],
        ytickfmt:v=>fmt(v,2)});
      A3.curve(t=>rec(t)-xt(t,wM),{color:PLOT.COL.err,width:2.2,n:1800});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}${L('mid','x_p(t)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)',true)}${L('out',name)}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('err','\\text{error}')}</div></div>`;

      /* ---- readouts ---- */
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Rate $f_s$</dt><dd>${fmt(st.fS,2)} Hz</dd></div>
        <div><dt>Rate $\\omega_s$</dt><dd>${fmt(wS,2)} rad/s</dd></div>
        <div><dt>Guard band $\\omega_s-2\\omega_M$</dt><dd class="${rate==='over'?'okv':'warnv'}">${fmt(guard,2)} rad/s</dd></div>
        <div><dt>RMS error</dt><dd class="${exact?'okv':'warnv'}">${fmt(err,4)}</dd></div>`);

      /* ---- the equation of the chosen method, and the verdict ---- */
      const eq = st.mode==='zoh'
        ? `<div class="eq"><span class="eq-label">Zero-order hold</span>${T('x_0(t)=x(nT),\\quad nT\\le t<(n+1)T',true)}</div>`
        : st.mode==='foh'
        ? `<div class="eq"><span class="eq-label">First-order hold</span>${T('x_1(t)=x(nT)+\\tfrac{t-nT}{T}\\bigl[x((n+1)T)-x(nT)\\bigr]',true)}</div>`
        : `<div class="eq"><span class="eq-label">Ideal filter, gain $T$, cutoff $\\omega_s/2$</span>${T('x_r(t)=\\sum_{n}x(nT)\\operatorname{sinc}\\!\\Bigl(\\frac{\\pi(t-nT)}{T}\\Bigr),\\quad\\operatorname{sinc}\\theta=\\frac{\\sin\\theta}{\\theta}',true)}</div>`;

      const hz = w => fmt(w/(2*PI),3);
      const moved = [], edge = [];
      for(const w0 of [wM/2, wM]){
        const a = fold(w0, wS);
        if(Math.abs(a - wC) < 1e-9) edge.push(w0);
        else if(Math.abs(a - w0) > 1e-9) moved.push([w0, a]);
      }
      let note;
      if(st.mode==='ideal'){
        if(rate==='over') note = `<div class="note ok"><span class="note-h">Exact</span>
            $\\omega_s>2\\omega_M=${fmt(2*wM,2)}$ rad/s, so the copies stay apart. The filter keeps only the baseband,
            and the error is ${fmt(err,4)}.</div>`;
        else if(rate==='crit') note = `<div class="note err"><span class="note-h">On the boundary</span>
            $\\omega_s=2\\omega_M$. Every sample of $\\sin(6\\pi t)$ is zero, so that term is lost and the error is ${fmt(err,4)}.</div>`;
        else note = `<div class="note err"><span class="note-h">Aliasing</span>
            ${moved.map(p=>`The ${hz(p[0])} Hz term returns at ${hz(p[1])} Hz.`).join(' ')}
            ${edge.map(w=>`The ${hz(w)} Hz term sits on the cutoff and is lost.`).join(' ')}
            No filter can undo this; the error is ${fmt(err,4)}.</div>`;
      } else {
        const hold = modes[st.mode];
        if(rate==='over') note = `<div class="note warn"><span class="note-h">A hold is not a reconstruction</span>
            The ${hold} leaves an error of ${fmt(err,4)} although $\\omega_s>2\\omega_M$. Raise $f_s$ to shrink it.</div>`;
        else note = `<div class="note err"><span class="note-h">Too few samples</span>
            $\\omega_s\\le2\\omega_M$, so the samples no longer fix $x(t)$. The ${hold} only joins them; the error is ${fmt(err,4)}.</div>`;
      }
      root.querySelector('.derive').innerHTML = M(eq + note);

      root.querySelector('.signame').innerHTML = M(`$x(t)=1+\\cos(3\\pi t)+\\sin(6\\pi t),\\;\\omega_M=6\\pi\\ \\text{rad/s}$`);
      root.querySelectorAll('[data-case]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.case===st.preset)));
      root.querySelectorAll('[data-seg="jmode"]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.val===st.mode)));
      const sl = root.querySelector('[data-v=fS]'); if(sl) sl.value = st.fS;
      const o = root.querySelector('[data-out=fS]'); if(o) o.textContent = fmt(st.fS,2)+' Hz';
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Rate <span class="seg">
                ${Object.keys(presets).map(k=>`<button data-case="${k}">${presets[k].name}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span>Sampling frequency $f_s$</span> <span class="val" data-out="fS">12 Hz</span></label>
                <input type="range" data-v="fS" min="2" max="30" step="0.5" value="12"></div>
              <div class="ctrl"><label>Method <span class="seg">
                ${Object.keys(modes).map(k=>`<button data-seg="jmode" data-val="${k}">${modes[k]}</button>`).join('')}</span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v!=='fS') return;
        st.fS = parseFloat(e.target.value);
        const p = Object.keys(presets).find(k=>presets[k].fS===st.fS);
        st.preset = p || '';
        draw(root);
      });
      root.addEventListener('click', e=>{
        const b = e.target.closest('[data-case]');
        if(b && presets[b.dataset.case]){ st.fS = presets[b.dataset.case].fS; st.preset = b.dataset.case; draw(root); RENDER.fit(); return; }
        const m = e.target.closest('[data-seg="jmode"]');
        if(m && modes[m.dataset.val]){ st.mode = m.dataset.val; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  return { J };
})());
