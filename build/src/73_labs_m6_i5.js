/* ==========================================================================
   Laboratory 6.5 (key I5) — Module 6  [Source: 73–76]
   Filtering and modulation of sequences in frequency. Two modes: (1) an input
   spectrum times the frequency response of a system, (2) a band-limited
   sequence times a cosine carrier, which is a periodic convolution with two
   impulses a period. Every spectrum panel spans three periods and marks one,
   because the copies that repeat every 2*pi are what this laboratory shows.
   Every displayed number is computed from the definitions at interaction time.
   Card language as in 72_labs_m5c.js: legends inside .plot-wrap, computed
   equations as tabbed .eq cards, notes as tabbed cards, no bare pixel sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l,dash)=>`<i class="lg-${c}${dash?' lg-dash':''}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* ---------- the frequency frame shared by every spectrum panel ---------- */
  const wrap = w => w - 2*PI*Math.round(w/(2*PI));
  const piTick = v => {
    const r = v/PI;
    if(Math.abs(r) < 1e-9) return '0';
    for(const den of [1,2,3,4,6,8,12]){
      const num = r*den;
      if(Math.abs(num-Math.round(num)) < 1e-7){
        const k = Math.round(num), sg = k<0?'-':'', m = Math.abs(k);
        const head = m===1 ? 'π' : m+'π';
        return den===1 ? sg+head : sg+head+'/'+den;
      }
    }
    return PLOT.fmt(v,2);
  };
  const wTicks = (lo,hi,step) => { const o=[];
    for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };
  const WLO = -3*PI, WHI = 3*PI;
  function frame(a, top){
    a.vline(-PI,{color:PLOT.COL.coral,opacity:.5}); a.vline(PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }
  /* k twelfths of pi as TeX: 0, \pi/12, \pi/6, ..., \pi */
  const tw = k => { if(k===0) return '0'; let n=k, d=12;
    for(const p of [2,2,3]) if(n%p===0 && d%p===0){ n/=p; d/=p; }
    const head = n===1 ? '\\pi' : (n===-1 ? '-\\pi' : n+'\\pi');
    return d===1 ? head : head+'/'+d; };
  /* Simpson's rule on [lo, hi] */
  const simpson = (f, lo, hi, n=600) => { const h=(hi-lo)/n; let s=0;
    for(let i=0;i<=n;i++){ const wgt=(i===0||i===n)?1:(i%2?4:2); s+=wgt*f(lo+i*h); }
    return s*h/3; };

  /* =======================================================================
     I5 · PRODUCTS AND PERIODIC CONVOLUTION           [Source: 73–76]
     ======================================================================= */
  const I5 = (() => {
    let mode = 'filter';
    /* filter mode: input a^n u[n] (a = 1/2) or a band of half-width pi/2;
       system b^n u[n] or an ideal low-pass with cutoff kc*pi/12 */
    const AIN = 0.5, WIN = PI/2;
    let inKind = 'exp', sysKind = 'first', b = 0.25, kc = 3;
    /* modulate mode: a band of half-width kW*pi/12 times cos(k0*pi*n/12) */
    let kW = 3, k0 = 4;

    /* first-order transform 1/(1 - r e^{-jw}) as [re, im] */
    const geo = (w,r)=>{ const d=1-2*r*Math.cos(w)+r*r; return [(1-r*Math.cos(w))/d, -r*Math.sin(w)/d]; };
    const band = (w,W)=> Math.abs(wrap(w)) <= W+1e-12 ? 1 : 0;
    const Xc = w => inKind==='exp' ? geo(w,AIN) : [band(w,WIN),0];
    const Hc = w => sysKind==='first' ? geo(w,b) : [band(w,kc*PI/12),0];
    const mul = (p,q)=>[p[0]*q[0]-p[1]*q[1], p[0]*q[1]+p[1]*q[0]];
    const mag = p => Math.hypot(p[0],p[1]);

    /* y[n]: closed forms where the section derives them, the synthesis
       integral otherwise. Y is conjugate-symmetric, so
       y[n] = (1/pi) * integral over [0, edge] of Re{Y e^{jwn}}. */
    function yOf(n){
      const wc = kc*PI/12;
      if(inKind==='exp' && sysKind==='first'){
        if(n<0) return 0;
        if(Math.abs(AIN-b)<1e-9) return (n+1)*Math.pow(AIN,n);
        return (Math.pow(AIN,n+1)-Math.pow(b,n+1))/(AIN-b);
      }
      if(inKind==='band' && sysKind==='ideal'){
        const Wm = Math.min(WIN, wc);
        return n===0 ? Wm/PI : Math.sin(Wm*n)/(PI*n);
      }
      const edge = inKind==='band' ? WIN : wc;
      return simpson(w=>{ const Y=mul(Xc(w),Hc(w)); return Y[0]*Math.cos(w*n)-Y[1]*Math.sin(w*n); }, 0, edge)/PI;
    }

    function drawFilter(root){
      /* panel 1 — |X|, |H|, |Y| over three periods */
      let top = 0;
      for(let i=0;i<=720;i++){ const w=-PI+2*PI*i/720;
        top = Math.max(top, mag(Xc(w)), mag(Hc(w)), mag(mul(Xc(w),Hc(w)))); }
      const A1 = PLOT.Axes({w:760,yticksLeft:true,h:300,xr:[WLO,WHI],yr:[-0.08*top,1.5*top],
        xlabel:'\\omega', pad:{l:62,r:24,t:30,b:34}, xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:piTick,
        ytarget:3, ytickfmt:v=>fmt(v,2)});
      frame(A1, 1.2*top);
      A1.curve(w=>mag(Xc(w)),{color:PLOT.COL.in,n:4000});
      A1.curve(w=>mag(Hc(w)),{color:PLOT.COL.h,n:4000,dash:'9 6'});
      A1.curve(w=>mag(mul(Xc(w),Hc(w))),{color:PLOT.COL.out,n:4000});

      /* panel 2 — the output sequence */
      const pts = []; for(let n=-10;n<=20;n++) pts.push([n, yOf(n)]);
      const ys = pts.map(p=>p[1]), ylo = Math.min(0,...ys), yhi = Math.max(0.05,...ys), sp = yhi-ylo;
      const A2 = PLOT.Axes({w:760,yticksLeft:true,h:220,xr:[-10.5,20.5],yr:[ylo-0.12*sp, yhi+0.25*sp],
        xlabel:'n', pad:{l:62,r:24,t:26,b:30}, xtarget:7, ytarget:3, ytickfmt:v=>fmt(v,2)});
      A2.stem(pts,{color:PLOT.COL.out});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','|X(e^{j\\omega})|')}${L('h','|H(e^{j\\omega})|',true)}${L('out','|Y(e^{j\\omega})|')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out','y[n]')}</div></div>`;

      const X0 = mag(Xc(0)), H0 = mag(Hc(0));
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$|X(e^{j0})|$</dt><dd>${N4(X0)}</dd></div>
        <div><dt>$|H(e^{j0})|$</dt><dd>${N4(H0)}</dd></div>
        <div><dt>$|Y(e^{j0})|$</dt><dd class="okv">${N4(X0*H0)}</dd></div>
        <div><dt>$y[0]$</dt><dd>${N4(yOf(0))}</dd></div>`);

      const inTex = inKind==='exp' ? 'X(e^{j\\omega})=\\dfrac{1}{1-0.5e^{-j\\omega}}' : 'X=1\\ \\text{on}\\ |\\omega|\\le\\pi/2';
      const sysTex = sysKind==='first' ? `H(e^{j\\omega})=\\dfrac{1}{1-${N4(b,2)}e^{-j\\omega}}` : `H=1\\ \\text{on}\\ |\\omega|\\le${tw(kc)}`;
      let note;
      if(sysKind==='ideal' && inKind==='band')
        note = `<div class="note ok"><span class="note-h">The narrower band is kept</span>
          $Y$ is $1$ on $|\\omega|\\le${tw(Math.min(6,kc))}$, so $y[n]=\\sin(${tw(Math.min(6,kc))}\\,n)/(\\pi n)$ and
          $y[0]$ is that band's width over $2\\pi$.</div>`;
      else if(sysKind==='ideal')
        note = `<div class="note warn"><span class="note-h">A two-sided output</span>
          The ideal filter cuts $X$ off sharply, so $y[n]$ is not zero for $n<0$ even though
          $x[n]$ is. An ideal low-pass system is not causal.</div>`;
      else
        note = `<div class="note ok"><span class="note-h">One product at each frequency</span>
          $|Y|=|X|\\,|H|$ at every $\\omega$, and $Y$ repeats every $2\\pi$ like both factors.</div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Product of spectra</span>${T('Y(e^{j\\omega})=X(e^{j\\omega})\\,H(e^{j\\omega})',true)}
           <div style="margin-top:4px">${T(inTex+',\\qquad '+sysTex,true)}</div></div>` + note);

      root.querySelectorAll('[data-seg="in"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===inKind)));
      root.querySelectorAll('[data-seg="sys"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===sysKind)));
      const slB = root.querySelector('[data-v=b]'); if(slB){ slB.value=b; root.querySelector('[data-out=b]').textContent=N4(b,2); }
      const slC = root.querySelector('[data-v=kc]'); if(slC){ slC.value=kc; root.querySelector('[data-out=kc]').innerHTML=T(tw(kc),false); }
    }

    function drawModulate(root){
      const W = kW*PI/12, w0 = k0*PI/12;
      const up = w=>0.5*band(w-w0,W), dn = w=>0.5*band(w+w0,W);
      /* panel 1 — X, the two copies and their sum, over three periods */
      const A1 = PLOT.Axes({w:760,yticksLeft:true,h:300,xr:[WLO,WHI],yr:[-0.1,1.62],
        xlabel:'\\omega', pad:{l:62,r:24,t:30,b:34}, xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:piTick,
        yticksOverride:[0,0.5,1], ytickfmt:v=>fmt(v,2)});
      frame(A1, 1.25);
      A1.curve(w=>band(w,W),{color:PLOT.COL.in,n:6000,dash:'9 6',opacity:.6});
      A1.curve(up,{color:PLOT.COL.mid,n:6000,dash:'4 5',width:1.6});
      A1.curve(dn,{color:PLOT.COL.mid,n:6000,dash:'4 5',width:1.6});
      A1.curve(w=>up(w)+dn(w),{color:PLOT.COL.out,n:6000});

      /* panel 2 — z[n] = x[n] cos(w0 n) with the envelope +-x[n] */
      const x = t => Math.abs(t)<1e-9 ? W/PI : Math.sin(W*t)/(PI*t);
      const pts = []; for(let n=-15;n<=15;n++) pts.push([n, x(n)*Math.cos(w0*n)]);
      const e = W/PI;
      const A2 = PLOT.Axes({w:760,yticksLeft:true,h:220,xr:[-15.5,15.5],yr:[-1.3*e,1.45*e],
        xlabel:'n', pad:{l:62,r:24,t:26,b:30}, xtarget:7, ytarget:3, ytickfmt:v=>fmt(v,3)});
      A2.curve(x,{color:PLOT.COL.in,dash:'6 5',n:1200,opacity:.75});
      A2.curve(t=>-x(t),{color:PLOT.COL.in,dash:'6 5',n:1200,opacity:.75});
      A2.stem(pts,{color:PLOT.COL.out});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','X(e^{j\\omega})',true)}${L('mid','\\text{one copy}',true)}${L('out','Z(e^{j\\omega})')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out','z[n]')}${L('in','\\pm x[n]',true)}</div></div>`;

      const at0 = k0 < kW, atPi = k0 + kW > 12;
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Upper copy</dt><dd>$${tw(k0-kW)}$ to $${tw(k0+kW)}$</dd></div>
        <div><dt>Overlap at $\\omega=0$</dt><dd class="${at0?'warnv':'okv'}">${at0?'yes':'no'}</dd></div>
        <div><dt>Overlap at $\\omega=\\pm\\pi$</dt><dd class="${atPi?'warnv':'okv'}">${atPi?'yes':'no'}</dd></div>
        <div><dt>$z[0]=x[0]$</dt><dd>${N4(W/PI)}</dd></div>`);

      let note;
      if(at0) note = `<div class="note err"><span class="note-h">The copies overlap at $\\omega=0$</span>
          $\\omega_0=${tw(k0)}<W=${tw(kW)}$, so the two copies cross the origin and add to $1$ there.
          Multiplying by the carrier again and low-pass filtering no longer gives back $x[n]$ alone.</div>`;
      else if(atPi) note = `<div class="note err"><span class="note-h">The copies overlap at $\\omega=\\pm\\pi$</span>
          $\\omega_0+W=${tw(k0+kW)}>\\pi$, so the upper copy meets the lower copy of the next period.
          The spectrum is periodic, so there is no room beyond $\\pi$.</div>`;
      else note = `<div class="note ok"><span class="note-h">The copies stay apart</span>
          Each copy has height $\\tfrac12$. They stay apart while $W\\le\\omega_0\\le\\pi-W$.</div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Periodic convolution with the carrier</span>${T('Z(e^{j\\omega})=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)',true)}</div>` + note);

      const slW = root.querySelector('[data-v=kW]'); if(slW){ slW.value=kW; root.querySelector('[data-out=kW]').innerHTML=T(tw(kW),false); }
      const sl0 = root.querySelector('[data-v=k0]'); if(sl0){ sl0.value=k0; root.querySelector('[data-out=k0]').innerHTML=T(tw(k0),false); }
    }

    function draw(root){
      root.querySelectorAll('[data-seg="imode"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===mode)));
      if(mode==='filter'){
        root.querySelector('.modectrls').innerHTML = M(`
          <div class="ctrl"><label>Input <span class="seg">
            <button data-seg="in" data-val="exp">$(\\tfrac12)^{n}u[n]$</button><button data-seg="in" data-val="band">band to $\\pi/2$</button></span></label></div>
          <div class="ctrl"><label>System <span class="seg">
            <button data-seg="sys" data-val="first">$b^{n}u[n]$</button><button data-seg="sys" data-val="ideal">ideal low-pass</button></span></label></div>
          ${sysKind==='first'
            ? `<div class="ctrl"><label><span>Ratio $b$</span> <span class="val" data-out="b">0.25</span></label>
                 <input type="range" data-v="b" min="0.05" max="0.9" step="0.05" value="${b}"></div>`
            : `<div class="ctrl"><label><span>Cutoff $\\omega_c$</span> <span class="val" data-out="kc"></span></label>
                 <input type="range" data-v="kc" min="1" max="12" step="1" value="${kc}"></div>`}`);
        drawFilter(root);
      } else {
        root.querySelector('.modectrls').innerHTML = M(`
          <div class="ctrl"><label><span>Band half-width $W$</span> <span class="val" data-out="kW"></span></label>
            <input type="range" data-v="kW" min="1" max="6" step="1" value="${kW}"></div>
          <div class="ctrl"><label><span>Carrier $\\omega_0$</span> <span class="val" data-out="k0"></span></label>
            <input type="range" data-v="k0" min="0" max="12" step="1" value="${k0}"></div>`);
        drawModulate(root);
      }
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:8px"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Mode <span class="seg">
                <button data-seg="imode" data-val="filter">filter</button><button data-seg="imode" data-val="modulate">modulate</button></span></label></div>
            </div>
            <div class="ctrls one modectrls"></div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='b') b=v; else if(k==='kc') kc=Math.round(v); else if(k==='kW') kW=Math.round(v); else if(k==='k0') k0=Math.round(v);
        if(mode==='filter') drawFilter(root); else drawModulate(root); });
      root.addEventListener('click', e=>{
        const md=e.target.closest('[data-seg="imode"]'); if(md){ mode=md.dataset.val; draw(root); RENDER.fit(); return; }
        const inb=e.target.closest('[data-seg="in"]'); if(inb){ inKind=inb.dataset.val; draw(root); RENDER.fit(); return; }
        const sb=e.target.closest('[data-seg="sys"]'); if(sb){ sysKind=sb.dataset.val; draw(root); RENDER.fit(); return; }
      });
      draw(root);
    }};
  })();

  return { I5 };
})());
