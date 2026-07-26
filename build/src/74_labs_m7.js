/* ==========================================================================
   Laboratory J — Module 7  [Source: 80–88]
   Every displayed number is computed from the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const PI = Math.PI;

  /* =======================================================================
     J · SAMPLING AND ALIASING STUDIO                [Source: 80–88]

     The copies of the spectrum are drawn at every setting. Lowering the rate
     slides them together; only the moment they reach each other is marked in
     the aliasing colour. Nothing about the copies appears or disappears at the
     boundary — the overlap does.

     The signal is  x(t) = 1 + cos(wM t / 2) + sin(wM t),  so its highest
     angular frequency is wM and its band edge carries a sine. That is what
     makes the critical preset instructive: at exactly wS = 2 wM the line the
     baseband puts at +wM and the line the k = 1 copy brings there are equal
     and opposite, so the sine is annihilated rather than merely damaged.
     ======================================================================= */
  const J = (() => {

    /* --- state ------------------------------------------------------- */
    /* fM is the highest frequency of the signal in hertz, fS the sampling
       frequency in hertz. Both angular readings are derived, never stored, so
       the two can never drift apart. */
    let st = { fM:3, fS:12, mode:'ideal', preset:'over' };

    const presets = {
      over:  { name:'Oversampling',        fM:3, fS:12,  mode:'ideal' },
      crit:  { name:'Critical',            fM:3, fS:6,   mode:'ideal' },
      under: { name:'Undersampling',       fM:3, fS:4.5, mode:'ideal' },
      zoh:   { name:'Zero-order hold',     fM:3, fS:12,  mode:'zoh'   },
      foh:   { name:'First-order hold',    fM:3, fS:12,  mode:'foh'   },
      ideal: { name:'Ideal reconstruction',fM:3, fS:12,  mode:'ideal' }
    };
    const modeName = { ideal:'ideal band-limited interpolation',
                       zoh:'zero-order hold', foh:'first-order hold' };

    /* --- the signal, as a line spectrum ------------------------------ */
    /* Each entry is one impulse of X(jw): its position and its complex weight.
       A constant contributes 2*pi at the origin, a cosine contributes pi at
       each of +-w0, and a sine contributes -j*pi at +w0 and +j*pi at -w0. */
    function lines(wM){
      const w1 = wM/2;
      return [
        { w:0,    re:2*PI, im:0 },
        { w: w1,  re:PI,   im:0 },
        { w:-w1,  re:PI,   im:0 },
        { w: wM,  re:0,    im:-PI },
        { w:-wM,  re:0,    im: PI }
      ];
    }
    const xt = (t,wM)=> 1 + Math.cos(wM*t/2) + Math.sin(wM*t);

    /* --- the sampled spectrum ---------------------------------------- */
    /* Every copy is generated, at every rate. Copies that land on the same
       abscissa are added there, because that is what the sampler stores: one
       number, not two. */
    function replicas(wM, wS, span){
      const base = lines(wM);
      const K = Math.min(60, Math.ceil(span/wS) + 1);
      const map = new Map();
      /* Two lines belong to the same abscissa when they agree to within a
         billionth of the sampling rate. The bucket does the matching; the
         position kept is the exact one, so no frequency is rounded before it
         reaches the reconstruction. */
      const tol = wS*1e-9;
      for(let k=-K;k<=K;k++) for(const b of base){
        const pos = b.w + k*wS;
        if(Math.abs(pos) > span) continue;
        const key = Math.round(pos/tol);
        let e = map.get(key);
        if(!e){ e = { pos:pos, re:0, im:0, ks:[], n:0 }; map.set(key,e); }
        e.re += b.re; e.im += b.im; e.n++;
        if(e.ks.indexOf(k) < 0) e.ks.push(k);
      }
      return Array.from(map.values()).sort((p,q)=>p.pos-q.pos);
    }

    /* --- reconstruction ---------------------------------------------- */
    /* Ideal: the filter has gain T and cutoff wC, and the copies carry 1/T, so
       what survives is each aggregated weight, unscaled, inside |w| < wC. */
    function idealRec(agg, wC){
      const keep = agg.filter(e => Math.abs(e.pos) < wC - 1e-9);
      return t => { let s=0;
        for(const e of keep) s += e.re*Math.cos(e.pos*t) - e.im*Math.sin(e.pos*t);
        return s/(2*PI); };
    }
    /* Zero-order hold: the value of the last sample, held. */
    function zohRec(Ts, wM){
      return t => xt(Math.floor(t/Ts)*Ts, wM);
    }
    /* First-order hold: consecutive samples joined by a straight line. */
    function fohRec(Ts, wM){
      return t => { const n=Math.floor(t/Ts), u=t/Ts-n;
        return (1-u)*xt(n*Ts,wM) + u*xt((n+1)*Ts,wM); };
    }

    /* root-mean-square difference between the reconstruction and the signal,
       over a whole number of periods of the lowest non-zero component */
    function rmsError(rec, wM, win){
      let s=0; const N=1600;
      for(let i=0;i<N;i++){ const t=win*i/N; const d=rec(t)-xt(t,wM); s+=d*d; }
      return Math.sqrt(s/N);
    }

    /* --- drawing ------------------------------------------------------ */
    function draw(root){
      const fM = st.fM, fS = st.fS;
      const wM = 2*PI*fM, wS = 2*PI*fS, Ts = 1/fS, wC = wS/2;
      const guard = wS - 2*wM;
      const nyq = guard > 1e-9 ? 'over' : (Math.abs(guard) <= 1e-9 ? 'crit' : 'under');
      const span = Math.max(2.4*wS, 3.2*wM);
      const agg = replicas(wM, wS, span);
      const rec = st.mode==='zoh' ? zohRec(Ts,wM)
                : st.mode==='foh' ? fohRec(Ts,wM)
                : idealRec(agg, wC);
      /* one window of the 1.5 s period of the lowest component, wM/2 */
      const win = 4*PI/(wM/2) > 8 ? 8 : 4*PI/(wM/2);
      const err = rmsError(rec, wM, win);

      /* ---- panel 1: the signal and its samples --------------------- */
      const A1 = PLOT.Axes({w:760,h:138,xr:[0,win],yr:[-1.6,3.4],
        xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_p(t)',
        pad:{l:66,r:24,t:26,b:34},xtarget:6,ytarget:3});
      A1.curve(t=>xt(t,wM),{color:PLOT.COL.in,width:1.4,dash:'3 5',opacity:.8,n:1600});
      for(let n=0;n*Ts<=win+1e-9;n++){ if(n>400) break;
        A1.impulse(n*Ts, xt(n*Ts,wM), {color:PLOT.COL.mid,label:false,width:1.6}); }

      /* ---- panel 2: the spectrum before sampling ------------------- */
      const A2 = PLOT.Axes({w:760,h:100,xr:[-span,span],yr:[-0.25,1.35],
        xlabel:'',ylabel:'|X(j\\omega)|\\,/\\,2\\pi',
        pad:{l:66,r:24,t:26,b:14},xtarget:7,ytarget:2,
        xtickfmt:v=>'' , ytickfmt:v=>Math.abs(v)<1e-9?'0':fmt(v,1)});
      for(const b of lines(wM)){
        const h = Math.hypot(b.re,b.im)/(2*PI);
        A2.impulse(b.w, h, {color:PLOT.COL.in,label:false});
      }
      A2.note(-span*0.98, 1.12, '\\text{baseband only}', {anchor:'start',color:PLOT.COL.muted,fs:12,tex:true});

      /* ---- panel 3: the replicated spectrum ------------------------ */
      const top = 1.35/Ts;
      const A3 = PLOT.Axes({w:760,h:170,xr:[-span,span],yr:[-0.25/Ts,top],
        xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X_p(j\\omega)|\\,/\\,2\\pi',
        pad:{l:66,r:24,t:28,b:36},xtarget:7,ytarget:3,
        ytickfmt:v=>Math.abs(v)<1e-9?'0':fmt(v,0)});
      let cancelled = 0;
      for(const e of agg){
        const h = Math.hypot(e.re,e.im)/(2*PI*Ts);
        const inBand = Math.abs(e.pos) < wC - 1e-9;
        const intruder = e.n > 1 || (inBand && e.ks.indexOf(0) < 0);
        if(h < 1e-9){ A3.point(e.pos, 0, {color:PLOT.COL.err,r:5}); cancelled++; continue; }
        const k0 = e.ks[0];
        const col = intruder ? PLOT.COL.err
                  : (k0===0 ? PLOT.COL.in : (Math.abs(k0)===1 ? PLOT.COL.mid : PLOT.COL.slate));
        A3.impulse(e.pos, h, {color:col,label:false});
      }
      /* the reconstruction filter */
      A3.rect(-wC, 0, wC, 1.18/Ts, {stroke:PLOT.COL.h,dash:'6 4',width:1.6});

      /* ---- panel 4: the reconstruction against the original -------- */
      const A4 = PLOT.Axes({w:760,h:146,xr:[0,win],yr:[-1.6,3.4],
        xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',
        pad:{l:66,r:24,t:26,b:34},xtarget:6,ytarget:3});
      A4.curve(t=>xt(t,wM),{color:PLOT.COL.in,width:1.3,dash:'3 5',opacity:.85,n:1600});
      A4.curve(rec,{color:err<1e-6?PLOT.COL.out:PLOT.COL.err,width:2.4,n:1800});

      root.querySelector('.plots').innerHTML = [A1,A2,A3,A4].map(p=>p.svg()).join('');

      /* ---- readouts ------------------------------------------------ */
      /* which component came back at a different frequency */
      const moved = [];
      for(const w0 of [wM/2, wM]){
        if(w0 < wC - 1e-9) continue;                    /* it is inside, nothing moved */
        const a = Math.abs(wS - w0);
        if(a < wC - 1e-9) moved.push([w0, a]);
      }
      const hz = w => fmt(w/(2*PI),3);

      root.querySelector('.ro').innerHTML = `
        <div><dt>Rate, both readings</dt><dd style="font-size:15px">${fmt(wS,2)} rad/s &nbsp;·&nbsp; ${fmt(fS,2)} Hz</dd></div>
        <div><dt>Bandwidth, both readings</dt><dd style="font-size:15px">${fmt(wM,2)} rad/s &nbsp;·&nbsp; ${fmt(fM,2)} Hz</dd></div>
        <div><dt>Nyquist rate and guard band</dt><dd class="${guard>1e-9?'okv':''}" style="font-size:15px">${fmt(2*wM,2)} rad/s &nbsp;·&nbsp; guard ${fmt(guard,2)} rad/s</dd></div>
        <div><dt>Period and copy height</dt><dd style="font-size:15px">${fmt(Ts,4)} s &nbsp;·&nbsp; 1/T = ${fmt(1/Ts,2)}</dd></div>
        <div><dt>Cutoff and filter</dt><dd style="font-size:14px">${fmt(wC,2)} rad/s &nbsp;·&nbsp; ${modeName[st.mode]}</dd></div>
        <div><dt>Alias frequencies</dt><dd style="font-size:14px">${
          moved.length ? moved.map(p=>`${hz(p[0])} Hz &rarr; ${hz(p[1])} Hz`).join('<br>')
                       : (cancelled ? 'band edge cancelled' : 'none') }</dd></div>
        <div><dt>Reconstruction error</dt><dd class="${err<1e-6?'okv':''}">${fmt(err,4)}</dd></div>`;

      root.querySelector('.verdict').innerHTML = M(
        nyq==='over'
          ? `<div class="note ok"><span class="note-h">Copies apart</span>
             $\\omega_s>2\\omega_M$, so a gap of ${fmt(guard,2)} rad/s separates every copy from its neighbour.
             Nothing is lost at the sampler.</div>`
        : nyq==='crit'
          ? `<div class="note err"><span class="note-h">On the boundary, and not safe</span>
             $\\omega_s=2\\omega_M$, so the interval $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ is empty. The copies
             touch at $\\pm\\omega_M$, where the baseband and its neighbour contribute equal and opposite weights:
             the sine at the band edge is annihilated and every one of its samples is zero.</div>`
          : `<div class="note err"><span class="note-h">Copies overlapping</span>
             $\\omega_s<2\\omega_M$. Every copy is still there — count them — but they now reach each other, and
             inside the overlap the sampler stores a sum. A red line inside the filter came from a copy, and no
             filter can send it back.</div>`);

      root.querySelector('.modenote').innerHTML = M(
        st.mode==='ideal'
          ? `<div class="note def"><span class="note-h">Ideal reconstruction</span>
             Gain $T$, cutoff $\\omega_c=\\omega_s/2$, kernel $\\operatorname{sinc}(\\pi t/T)$ with the unnormalised
             convention $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. Exact whenever the copies are apart.</div>`
        : st.mode==='zoh'
          ? `<div class="note warn"><span class="note-h">A hold is not a reconstruction</span>
             $H_0(j\\omega)=e^{-j\\omega T/2}\\,2\\sin(\\omega T/2)/\\omega$ sags across the band and leaks past it,
             so the output differs from $x(t)$ even far above the Nyquist rate. The error readout is that
             difference, and it does not go to zero.</div>`
          : `<div class="note warn"><span class="note-h">A hold is not a reconstruction</span>
             $H_1(j\\omega)=\\frac{1}{T}\\left[\\sin(\\omega T/2)/(\\omega/2)\\right]^{2}$ falls off as
             $1/\\omega^{2}$ instead of $1/\\omega$, so it is the better of the two — and its error readout is
             still not zero, because it is still an approximation.</div>`);

      root.querySelector('.presetname').textContent = presets[st.preset] ? presets[st.preset].name : 'Custom setting';
      root.querySelectorAll('[data-case]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.case===st.preset)));
      const sm = root.querySelector('[data-v=fM]'), ss = root.querySelector('[data-v=fS]');
      if(sm) sm.value = st.fM;
      if(ss) ss.value = st.fS;
      const om = root.querySelector('[data-out=fM]'), os = root.querySelector('[data-out=fS]');
      if(om) om.textContent = fmt(st.fM,2);
      if(os) os.textContent = fmt(st.fS,2);
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-6-6" style="gap:34px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="presetname"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Preset <span class="seg">
                ${Object.keys(presets).map(k=>`<button data-case="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Signal bandwidth $f_M$ [Hz] <span class="val" data-out="fM">3</span></label>
                <input type="range" data-v="fM" min="1" max="5" step="0.25" value="3"></div>
              <div class="ctrl"><label>Sampling frequency $f_s$ [Hz] <span class="val" data-out="fS">12</span></label>
                <input type="range" data-v="fS" min="2" max="30" step="0.5" value="12"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="verdict"></div>
            <div class="modenote"></div>
            <div class="small">Panels: the signal with its samples; the spectrum before sampling; every copy
              after sampling under the dashed filter; the reconstruction against the original. A line is cyan in
              the baseband, violet at $k=\\pm1$, slate beyond, and red once it has reached another copy or entered
              the filter from outside the baseband.</div>
          </div></div>`);
      root.addEventListener('input', e=>{
        const k = e.target.dataset.v; if(!k) return;
        if(k==='fM') st.fM = parseFloat(e.target.value);
        else st.fS = parseFloat(e.target.value);
        st.preset = '';
        draw(root);
      });
      root.addEventListener('click', e=>{
        const b = e.target.closest('[data-case]'); if(!b) return;
        const p = presets[b.dataset.case]; if(!p) return;
        st.fM = p.fM; st.fS = p.fS; st.mode = p.mode; st.preset = b.dataset.case;
        draw(root);
      });
      draw(root);
    }};
  })();

  return { J };
})());
