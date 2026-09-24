/* ==========================================================================
   Laboratory 7.5 (key J5) — Module 7
   Discrete-time processing of a continuous-time signal, end to end. The
   input is two cosines, x_c(t) = cos(2 pi f1 t) + cos(2 pi f2 t). A C/D
   converter samples it at fs; a discrete-time filter acts on the sequence;
   a D/C converter rebuilds a band-limited signal from the result.
   In this section omega is continuous-time frequency in rad/s and Omega
   discrete-time frequency in rad/sample, Omega = omega T.
   A tone at f reaches the filter at Omega = 2 pi fa / fs, where fa is f
   folded into [0, fs/2]; that is the tone itself when f < fs/2 and its alias
   otherwise. The three filters, on |Omega| < pi and repeated every 2 pi:
     low-pass       H_d = 1 for |Omega| < Omega_c, 0 otherwise
     differentiator H_d = j Omega / T
     half delay     H_d = e^{-j Omega/2}
   For a band-limited input the chain is the continuous-time system
   H_eff(j omega) = H_d(e^{j omega T}) on |omega| < omega_s/2, so the
   low-pass cuts at omega_c = Omega_c / T rad/s, f_c = Omega_c fs / 2 pi Hz.
   A tone exactly at fs/2 sits on the band edge, where the chain is not
   defined; it is reported and left out of the output.
   Every displayed number is computed from these definitions at interaction
   time. Styled like build/src/74_labs_m7_j4.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M;
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
  const PI = Math.PI;
  const n1 = v => String(+(+v).toFixed(1));
  const n2 = v => String(+(+v).toFixed(2));
  const n3 = v => String(+(+v).toFixed(3));
  /* a multiple of pi as TeX: 1 -> \pi, 0.5 -> 0.5\pi */
  const pX = r => Math.abs(r-1) < 1e-9 ? '\\pi' : n2(r)+'\\pi';
  /* tick numbers of an axis in rad/sample, in multiples of pi */
  const piTick = v => { const r = Math.round(v/PI);
    return r===0 ? '0' : (r<0?'-':'') + (Math.abs(r)===1 ? 'π' : Math.abs(r)+'π'); };

  const J5 = (() => {
    /* tones and rate in kHz; the filter; the low-pass cutoff in multiples of pi */
    let f1 = 1, f2 = 3, fs = 8, kind = 'lp', wc = 0.5;
    const TMAX = 2;          /* ms of signal drawn */
    const FMAX = 12;         /* kHz: the input spectrum is drawn over |f| < FMAX */
    const NAMES = { lp:'low-pass', diff:'differentiator', dly:'half-sample delay' };

    const fold = (f,r) => Math.abs(f - r*Math.floor(f/r + 0.5));
    /* one tone through the chain */
    const tone = f => {
      const fa = fold(f,fs), Om = 2*PI*fa/fs;
      const edge = Math.abs(fa - fs/2) < 1e-9;
      const out = f > fs/2 + 1e-9;
      const pass = edge ? 0 : kind==='lp' ? (Om < wc*PI - 1e-9 ? 1 : 0) : 1;
      return { f, fa, Om, edge, out, pass };
    };
    /* the output of one tone, t in ms, f in kHz: a derivative is per ms */
    const yOf = (s,t) => {
      if(!s.pass) return 0;
      const w = 2*PI*s.fa;
      return kind==='diff' ? -w*Math.sin(w*t) : kind==='dly' ? Math.cos(w*(t - 0.5/fs)) : Math.cos(w*t);
    };
    /* |H_d(e^{jOmega})| on one period, drawn at peak 1.25 */
    const Hmag = W => { const r = Math.abs(W - 2*PI*Math.round(W/(2*PI)));
      return kind==='lp' ? (r < wc*PI ? 1.25 : 0) : kind==='diff' ? 1.25*r/PI : 1.25; };

    function draw(root){
      const C = PLOT.COL, S = [tone(f1), tone(f2)];
      const bad = S.filter(s => s.out || s.edge);
      const xin = t => Math.cos(2*PI*f1*t) + Math.cos(2*PI*f2*t);
      const yc  = t => yOf(S[0],t) + yOf(S[1],t);
      const outCol = S.some(s => s.out && s.pass) ? C.err : C.out;

      /* ---- 1: the input lines, in kHz, and the band |f| < fs/2 ---- */
      const A1 = PLOT.Axes({w:760,h:150,xr:[-FMAX,FMAX],yr:[-0.15,1.55],
        xlabel:'f\\;[\\text{kHz}]',ylabel:'\\text{lines of }x_c',pad:{l:56,r:24,t:20,b:30},
        yticksOverride:[],xticksOverride:[-12,-8,-4,0,4,8,12]});
      A1.rect(-fs/2,0,fs/2,1.25,{stroke:C.muted,dash:'6 4',width:1.4});
      for(const s of S) for(const sg of [1,-1])
        if(s.f < FMAX) A1.impulse(sg*s.f, 1, {color: s.out||s.edge ? C.err : C.in, label:false});

      /* ---- 2: the sequence's lines against Omega, with the filter ---- */
      const SP = 3*PI;
      const A2 = PLOT.Axes({w:760,h:180,xr:[-SP,SP],yr:[-0.15,1.95],
        xlabel:'\\Omega\\;[\\text{rad/sample}]',ylabel:'\\text{lines of }x_d,\\;|H_d|',pad:{l:56,r:24,t:20,b:30},
        yticksOverride:[],xticksOverride:[-3*PI,-2*PI,-PI,0,PI,2*PI,3*PI],xtickfmt:piTick});
      A2.vline(-PI,{color:C.coral,opacity:.5}); A2.vline(PI,{color:C.coral,opacity:.5});
      A2.span(-PI,PI,1.62,'',{color:C.coral});
      A2.note(-PI,1.62,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:13,anchor:'end',dx:-8,dy:-3});
      A2.curve(Hmag,{color:C.h,width:2,dash:'6 4',n:2400});
      for(const s of S) for(let k=-2;k<=2;k++) for(const sg of [1,-1]){
        const pos = 2*PI*k + sg*s.Om; if(Math.abs(pos) > SP+1e-9) continue;
        const col = !s.pass ? C.muted : (s.out ? C.err : C.in);
        A2.impulse(pos, 1, {color:col, label:false});
      }

      /* ---- 3: the input and the output in time ---- */
      const amp = S.reduce((m,s)=> m + (s.pass ? (kind==='diff' ? 2*PI*s.fa : 1) : 0), 0);
      const Y = 1.2*Math.max(2, amp);
      const A3 = PLOT.Axes({w:760,h:170,xr:[-0.02,TMAX+0.02],yr:[-Y,Y],
        xlabel:'t\\;[\\text{ms}]',ylabel:'x_c(t),\\;y_c(t)',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,
        ytarget:3,xticksOverride:[0,0.5,1,1.5,2]});
      A3.curve(xin,{color:C.in,width:1.4,dash:'5 5',n:3200});
      A3.curve(yc,{color:outCol,width:2.4,n:3200});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','|f|<f_s/2')}${L('err','|f|\\ge f_s/2')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{own}')}${L('err','\\text{alias}')}${L('h','|H_d|',true)}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','x_c(t)',true)}${L(outCol===C.err?'err':'out','y_c(t)')}</div></div>`;

      /* ---- readouts ---- */
      const wN = n3(wc*fs*1000), eN = n3(fs*1000);
      const r2 = kind==='lp' ? `<div><dt>Cutoff $\\Omega_c$</dt><dd>$${pX(wc)}$</dd></div>`
        : `<div><dt>Filter</dt><dd>${kind==='diff' ? '$j\\Omega/T$' : '$e^{-j\\Omega/2}$'}</dd></div>`;
      const r3 = kind==='lp' ? `<div><dt>Equivalent $\\omega_c$</dt><dd>$${wN}\\pi$ rad/s</dd></div>`
        : `<div><dt>Band edge $\\omega_s/2$</dt><dd>$${eN}\\pi$ rad/s</dd></div>`;
      const r4 = kind==='lp' ? `<div><dt>Equivalent $f_c$</dt><dd>${n1(wc*fs*500)} Hz</dd></div>`
        : kind==='diff' ? `<div><dt>Gain at $f_1$</dt><dd>$${n3(2*f1*1000)}\\pi\\ \\text{s}^{-1}$</dd></div>`
        : `<div><dt>Delay $T/2$</dt><dd>${n2(500/fs)} μs</dd></div>`;
      root.querySelector('.ro').innerHTML = M(`<div><dt>$f_s/2$</dt><dd>${n2(fs/2)} kHz</dd></div>` + r2 + r3 + r4);

      root.querySelector('.signame').innerHTML =
        T(`x_c(t)=\\cos(2\\pi f_1t)+\\cos(2\\pi f_2t),\\quad f_s=${n1(fs)}\\ \\text{kHz}`, false);

      /* ---- the equivalent system, and the verdict ---- */
      const eqTex = kind==='lp'
        ? `H_{\\text{eff}}(j\\omega)=1\\ \\text{for}\\ |\\omega|<\\frac{\\Omega_c}{T}=${wN}\\pi\\ \\text{rad/s},\\ \\text{else}\\ 0`
        : kind==='diff'
        ? `H_{\\text{eff}}(j\\omega)=j\\omega\\ \\text{for}\\ |\\omega|<\\frac{\\pi}{T}=${eN}\\pi\\ \\text{rad/s}`
        : `H_{\\text{eff}}(j\\omega)=e^{-j\\omega T/2},\\ \\ \\frac{T}{2}=${n2(500/fs)}\\ \\mu\\text{s}`;
      const kHz = s => n1(s.f)+' kHz';
      let note;
      if(bad.length){
        const s = bad[0];
        note = s.edge && !s.out
          ? `<div class="note err"><span class="note-h">On the band edge</span>
               The tone at ${kHz(s)} sits exactly at $f_s/2$. The chain is not defined there, so it is left out of $y_c(t)$.</div>`
          : `<div class="note err"><span class="note-h">Not band-limited to $\\omega_s/2$</span>
               The tone at ${kHz(s)} is above $f_s/2=${n2(fs/2)}$ kHz. It reaches the filter as ${n2(s.fa)} kHz, so the chain no longer acts as $H_{\\text{eff}}$.</div>`;
      } else {
        const txt = kind==='lp'
          ? S.map(s=>`${kHz(s)} ${s.pass?'passes':'is removed'}`).join('; ')+`. The cutoff is $f_c=${n1(wc*fs*500)}$ Hz.`
          : kind==='diff'
          ? `Each tone comes out as its derivative: $y_c(t)=dx_c/dt$, in units of 1/ms.`
          : `Each tone comes out $T/2=${n2(500/fs)}$ μs later, with its size unchanged.`;
        note = `<div class="note ok"><span class="note-h">Band-limited: $f_1,f_2<f_s/2$</span>${txt}</div>`;
      }
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Equivalent system · ${NAMES[kind]}</span>${T(eqTex,true)}</div>` + note);

      for(const [k,v,txt] of [['f1',f1,n1(f1)+' kHz'],['f2',f2,n1(f2)+' kHz'],['fs',fs,n1(fs)+' kHz']]){
        root.querySelector(`[data-v=${k}]`).value=v; root.querySelector(`[data-out=${k}]`).textContent=txt; }
      root.querySelector('[data-v=wc]').value=wc;
      root.querySelector('[data-out=wc]').innerHTML=T(pX(wc),false);
      root.querySelectorAll('[data-seg="kind"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===kind)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls">
              <div class="ctrl"><label><span>Tone $f_1$</span> <span class="val" data-out="f1">1 kHz</span></label>
                <input type="range" data-v="f1" min="0.2" max="10" step="0.1" value="1"></div>
              <div class="ctrl"><label><span>Tone $f_2$</span> <span class="val" data-out="f2">3 kHz</span></label>
                <input type="range" data-v="f2" min="0.2" max="10" step="0.1" value="3"></div>
              <div class="ctrl"><label><span>Rate $f_s$</span> <span class="val" data-out="fs">8 kHz</span></label>
                <input type="range" data-v="fs" min="2" max="16" step="0.5" value="8"></div>
              <div class="ctrl"><label><span>Low-pass $\\Omega_c$</span> <span class="val" data-out="wc"></span></label>
                <input type="range" data-v="wc" min="0.05" max="1" step="0.05" value="0.5"></div>
              <div class="ctrl j5-kind"><label><span>Filter</span> <span class="seg">
                <button data-seg="kind" data-val="lp">low-pass</button>
                <button data-seg="kind" data-val="diff">differentiator</button>
                <button data-seg="kind" data-val="dly">half delay</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='f1') f1=Math.round(v*10)/10; else if(k==='f2') f2=Math.round(v*10)/10;
        else if(k==='fs') fs=Math.round(v*2)/2; else if(k==='wc') wc=Math.round(v*20)/20;
        draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg="kind"]'); if(!b) return;
        kind=b.dataset.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { J5 };
})());
