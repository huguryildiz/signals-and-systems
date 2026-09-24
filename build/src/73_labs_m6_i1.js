/* ==========================================================================
   Laboratory 6.1 (key I1) — Module 6  [Source: 64–65]
   From line spectrum to DTFT. A finite-support sequence is replicated with
   period N. As N grows, the scaled coefficients N a_k crowd onto the envelope
   X(e^{jw}), and the sum over one period of N strips rebuilds x[0].
   Every spectrum is drawn over more than one period of 2*pi, with the period
   marked. Every displayed number is computed from the definitions at
   interaction time.
   Styled like build/src/72_labs_m5b.js: legends inside .plot-wrap, computed
   equations as tabbed .eq cards, notes as tabbed cards, no bare inline pixel
   font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
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

  /* =======================================================================
     I1 · FROM LINE SPECTRUM TO DTFT                  [Source: 64–65]
     Two sequences of half-width N1 = 2, replicated with period N > 2 N1.
     Panel 1 is the replication, panel 2 the scaled coefficients N a_k on the
     envelope X(e^{jw}), over two periods of 2*pi.
     ======================================================================= */
  const I1 = (() => {
    const N1 = 2;
    const shapes = {
      rect:{ name:'Rectangular pulse', x:n=> Math.abs(n)<=N1 ? 1 : 0,
        tex:'x[n]=1,\\;|n|\\le 2' },
      tri:{ name:'Triangular pulse', x:n=> Math.abs(n)<=N1 ? 1-Math.abs(n)/3 : 0,
        tex:'x[n]=1-|n|/3,\\;|n|\\le 2' }
    };
    let key='rect', N=10;

    /* the analysis sum of the one pulse: X(e^{jw}) = sum_n x[n] e^{-jwn}.
       Both pulses are even, so X is real. */
    const Xw = (sh,w)=>{ let s=0; for(let n=-N1;n<=N1;n++) s += sh.x(n)*Math.cos(w*n); return s; };
    /* the replication with period N, and its series coefficient from the
       analysis equation over the period -N1 <= n <= N-N1-1 */
    const xrep = (sh,n,Nv)=>{ const m=((n+N1)%Nv+Nv)%Nv - N1; return sh.x(m); };
    const Nak = (sh,k,Nv)=>{ const w0=2*PI/Nv; let re=0;
      for(let n=-N1;n<=Nv-N1-1;n++) re += xrep(sh,n,Nv)*Math.cos(k*w0*n);
      return re; };               /* N a_k; the imaginary part is zero for an even pulse */

    function draw(root){
      const sh = shapes[key], w0 = 2*PI/N;

      /* ---- panel 1: the replication, central copy in the input colour ---- */
      const Lx = Math.max(16, Math.ceil(1.25*N));
      const ctr=[], cps=[];
      for(let n=-Lx;n<=Lx;n++){ const v=xrep(sh,n,N);
        (Math.abs(n)<=N1 ? ctr : cps).push([n,v]); }
      const A1 = PLOT.Axes({w:760,h:160,xr:[-Lx,Lx],yr:[-0.3,1.6],
        xlabel:'n',ylabel:'\\tilde{x}[n]',pad:{l:56,r:24,t:26,b:34},xtarget:8,ytarget:3,yticksOverride:[0,1],yticksLeft:true});
      A1.stem(cps,{color:PLOT.COL.mid,r:N>24?2.4:3});
      A1.stem(ctr,{color:PLOT.COL.in,r:N>24?2.8:3.4});
      if(N<=Lx) A1.span(0,N,1.3,'N='+N,{tex:true,color:PLOT.COL.coral,fs:14});

      /* ---- panel 2: N a_k on the envelope, over two periods ---- */
      const X0 = Xw(sh,0), K = Math.floor(2*N+1e-9);
      const stems=[]; for(let k=-K;k<=K;k++) stems.push([k*w0, Nak(sh,k,N)]);
      const top = 1.28*X0;
      const A2 = PLOT.Axes({w:760,h:200,xr:[-2.2*PI,2.2*PI],yr:[-0.36*X0,1.5*X0],
        xlabel:'\\omega',ylabel:'N\\,a_k\\ \\text{and}\\ X(e^{j\\omega})',
        pad:{l:64,r:24,t:30,b:36},xticksOverride:wTicks(-2.2*PI,2.2*PI,PI),xtickfmt:piTick,ytarget:3,yticksLeft:true});
      A2.vline(-PI,{color:PLOT.COL.coral,opacity:.5}); A2.vline(PI,{color:PLOT.COL.coral,opacity:.5});
      A2.span(-PI,PI,top,'',{color:PLOT.COL.coral});
      A2.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
      A2.curve(w=>Xw(sh,w),{color:PLOT.COL.mid,width:1.8,dash:'6 5',n:2400});
      A2.stem(stems,{color:PLOT.COL.in,r:N>20?2.4:3.2,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}${L('mid','\\text{copies}')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','N\\,a_k')}${L('mid','X(e^{j\\omega})',true)}</div></div>`;

      /* ---- readouts: spacing, N a_0, N a_1, the sum over one period ---- */
      /* x[0] rebuilt from N strips of one period: (1/2pi) sum_k X(e^{jkw0}) w0 */
      let rebuild = 0;
      for(let k=0;k<N;k++) rebuild += Xw(sh,k*w0)*w0;
      rebuild /= 2*PI;
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Spacing $\\omega_0$</dt><dd class="okv">${N4(w0,4)}</dd></div>
        <div><dt>$N\\,a_0=X(e^{j0})$</dt><dd>${N4(Nak(sh,0,N),4)}</dd></div>
        <div><dt>$N\\,a_1$</dt><dd>${N4(Nak(sh,1,N),4)}</dd></div>
        <div><dt>Rebuild</dt><dd class="${Math.abs(rebuild-sh.x(0))<1e-9?'okv':''}">$x[0]=${N4(rebuild,4)}$</dd></div>`);

      root.querySelector('.signame').innerHTML = T(`${sh.tex},\\quad N=${N}`, false);

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Samples of one curve</span>${T(`N\\,a_k=X(e^{jk\\omega_0}),\\quad \\omega_0=\\frac{2\\pi}{${N}}=${N4(w0,4)}`,true)}</div>`
        + `<div class="note ok"><span class="note-h">Stems crowd onto the curve</span>
             As $N$ grows, the stems crowd onto $X(e^{j\\omega})$. The curve does not change, and both
             repeat every $2\\pi$.</div>`
        + `<div class="note warn"><span class="note-h">Sum over one period</span>
             The $N$ strips of one period add to $x[0]=${N4(rebuild,4)}$ at every $N$.</div>`);

      const sl = root.querySelector('[data-v=N]');
      sl.value = N;
      root.querySelector('[data-out=N]').textContent = N;
      root.querySelectorAll('[data-shape]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.shape===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Pulse <span class="seg">
                <button data-shape="rect">rectangular</button>
                <button data-shape="tri">triangular</button></span></label></div>
              <div class="ctrl"><label>Period $N$ <span class="val" data-out="N">10</span></label>
                <input type="range" data-v="N" min="5" max="40" step="1" value="10"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v==='N'){ N=parseInt(e.target.value,10); draw(root); } });
      root.addEventListener('click', e=>{
        const b=e.target.closest('[data-shape]');
        if(b){ key=b.dataset.shape; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  return { I1 };
})());
