/* ==========================================================================
   Laboratories 5.3–5.4 (keys V, W) — Module 5
   Every displayed number is computed from the definitions at interaction time.
   Styled like build/src/71_labs_m4.js: legends inside .plot-wrap, computed
   equations as tabbed .eq cards, notes as tabbed cards, no bare inline pixel
   font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* =======================================================================
     V · A PERIODIC SIGNAL AND ITS IMPULSE TRAIN     [Source: 49–50]
     Segmented choice of periodic signal; panel 1 is x(t), panel 2 is
     X(jw) = sum 2*pi*a_k*delta(w - k*w0), drawn with Axes.impulse.
     ======================================================================= */
  const V = (() => {
    const sigs = {
      rect:{ name:'Rectangular wave', label:'rectangular wave', kind:'rect',
        Tsteps:[4,8,16,32], T1:1,
        f:(t,Tv)=>{ const u=t-Tv*Math.round(t/Tv); return Math.abs(u)<1?1:0; },
        ak:(k,Tv)=> k===0 ? 2/Tv : Math.sin(k*(2*PI/Tv)*1)/(PI*k) },
      cos:{ name:'Cosine wave', label:'cosine', kind:'cos',
        Asteps:[0.5,1,1.5,2],
        f:(t,A,w0)=>A*Math.cos(w0*t) },
      sin:{ name:'Sine wave', label:'sine', kind:'sin',
        Asteps:[0.5,1,1.5,2],
        f:(t,A,w0)=>A*Math.sin(w0*t) },
      imp:{ name:'Impulse train', label:'impulse train', kind:'imp',
        Tsteps:[2,3,4,6] }
    };
    /* one shared parameter, meaning depends on the signal:
       for rect/imp it is T (the period); for cos/sin it is the amplitude A,
       and w0 is fixed at pi rad/s for both. */
    let key='rect', par=8, w0fixed=PI;

    function draw(root){
      const s = sigs[key];
      let w0, xr, yr;
      let plotX, weights; /* weights: array of [k, value] where value = 2*pi*a_k, possibly complex-tagged */

      if(s.kind==='rect'){
        const Tv = par, T1=s.T1;
        w0 = 2*PI/Tv;
        xr=[-1.6*Tv, 1.6*Tv]; yr=[-0.35,1.55];
        plotX = t=>s.f(t,Tv);
        const kmax = 8;
        weights=[]; for(let k=-kmax;k<=kmax;k++) weights.push([k, 2*PI*s.ak(k,Tv)]);
      } else if(s.kind==='cos'){
        const A = par; w0=w0fixed;
        xr=[-2.4,2.4]; yr=[-2.2,2.2];
        plotX = t=>s.f(t,A,w0);
        weights=[[-1, A*PI],[1, A*PI]];
      } else if(s.kind==='sin'){
        const A = par; w0=w0fixed;
        xr=[-2.4,2.4]; yr=[-2.2,2.2];
        plotX = t=>s.f(t,A,w0);
        weights=[[-1, A*PI],[1, -A*PI]]; /* imaginary weights: stored value is Im{2*pi*a_k} */
      } else { /* imp */
        const Tv = par; w0=2*PI/Tv;
        xr=[-1.6*Tv, 1.6*Tv]; yr=[-0.35,1.55];
        plotX = null;
        const kmax=8; weights=[]; for(let k=-kmax;k<=kmax;k++) weights.push([k, w0]);
      }

      /* panel 1 — x(t) */
      const A1 = PLOT.Axes({w:760,h:330,xr,yr,xlabel:'t',pad:{l:50,r:24,t:22,b:32},xtarget:7,ytarget:3});
      if(s.kind==='imp'){
        const Tv=par;
        for(let m=-3;m<=3;m++){ const tt=m*Tv; if(tt>=xr[0]&&tt<=xr[1]) A1.impulse(tt,1,{color:PLOT.COL.in,labelText:'1'}); }
      } else {
        A1.curve(plotX,{color:PLOT.COL.in,n:2400});
      }

      /* panel 2 — X(jw) as impulses, or Im{X} for the sine */
      const wmax = s.kind==='rect' ? 4.4*w0 : (s.kind==='imp' ? 4.4*w0 : 3*w0fixed);
      const yl = s.kind==='sin' ? 'Im\\{X(j\\omega)\\}' : 'X(j\\omega)';
      const wtop = Math.max(0.6, Math.max.apply(null, weights.map(p=>Math.abs(p[1]))));
      const A2 = PLOT.Axes({w:760,h:280,xr:[-wmax,wmax],yr:[-1.25*wtop,1.25*wtop],
        xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:yl,pad:{l:60,r:24,t:22,b:30},xtarget:7,ytarget:3});
      if(s.kind==='rect'){
        /* dashed envelope the weights sit on: w0 * 2 sin(w T1) / w */
        A2.curve(w=> Math.abs(w)<1e-6 ? 2*w0 : w0*2*Math.sin(w*s.T1)/w,
          {color:PLOT.COL.mid,dash:'4 5',n:1600});
      }
      weights.forEach(([k,v])=>{ const wv=k*w0; if(Math.abs(wv)<=wmax) A2.impulse(wv,v,{color:PLOT.COL.h,label:false}); });

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('h','2\\pi a_k')}${s.kind==='rect'?L('mid','\\text{envelope}'):''}</div></div>`;

      /* readouts */
      const w1 = weights.find(p=>p[0]===1);
      const spacing = w0;
      const a0w = weights.find(p=>p[0]===0);
      root.querySelector('.ro').innerHTML = `
        <div><dt>ω0 (rad/s)</dt><dd class="okv">${N4(w0,4)}</dd></div>
        <div><dt>Weight at ω = 0</dt><dd>${a0w? N4(a0w[1],4) : '0'}</dd></div>
        <div><dt>Weight at k = 1</dt><dd>${w1? N4(w1[1],4) : '0'}</dd></div>
        <div><dt>Spacing between impulses</dt><dd>${N4(spacing,4)}</dd></div>`;

      /* cards */
      const eqTex = s.kind==='sin'
        ? `X(j\\omega)=\\pi A\\,\\delta(\\omega-\\omega_0)-j\\pi A\\,\\delta(\\omega+\\omega_0),\\ \\ A=${N4(par,3)},\\ \\omega_0=${N4(w0,4)}`
        : s.kind==='cos'
        ? `X(j\\omega)=\\pi A\\big[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\big],\\ \\ A=${N4(par,3)},\\ \\omega_0=${N4(w0,4)}`
        : s.kind==='imp'
        ? `X(j\\omega)=\\omega_0\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_0),\\ \\ \\omega_0=\\dfrac{2\\pi}{T}=${N4(w0,4)}`
        : `X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0),\\ \\ \\omega_0=${N4(w0,4)}`;

      let notes = `<div class="eq"><span class="eq-label">Impulse weights</span>${T(eqTex,true)}</div>`;
      notes += `<div class="note def"><span class="note-h">Read the height</span>
        Each arrow's height is $2\\pi a_k$, not $a_k$. The Fourier-series coefficient is $2\\pi$ times
        smaller than the weight drawn here.</div>`;
      if(s.kind==='sin'){
        notes += `<div class="note warn"><span class="note-h">These weights are imaginary</span>
          A sine has purely imaginary coefficients, so the panel plots $\\operatorname{Im}\\{X(j\\omega)\\}$
          only. Its real part is zero at every $\\omega$ and is not drawn.</div>`;
      }
      if(s.kind==='imp'){
        notes += `<div class="note ok"><span class="note-h">One number, two roles</span>
          For the impulse train the spacing $\\omega_0$ and the weight of every impulse are the same
          number, $2\\pi/T$.</div>`;
      }
      root.querySelector('.derive').innerHTML = M(notes);

      /* controls */
      root.querySelector('.signame').textContent = s.name;
      const parCtrl = root.querySelector('.parctrl');
      if(s.kind==='rect' || s.kind==='imp'){
        parCtrl.innerHTML = M(`<label>Period $T$ <span class="seg">
          ${s.Tsteps.map(v=>`<button data-par="${v}">${v}</button>`).join('')}</span></label>`);
        if(!s.Tsteps.includes(par)) par = s.Tsteps[1];
      } else {
        parCtrl.innerHTML = M(`<label>Amplitude $A$ <span class="seg">
          ${s.Asteps.map(v=>`<button data-par="${v}">${v}</button>`).join('')}</span></label>`);
        if(!s.Asteps.includes(par)) par = s.Asteps[1];
      }
      parCtrl.querySelectorAll('[data-par]').forEach(b=>
        b.setAttribute('aria-pressed', String(Math.abs(parseFloat(b.dataset.par)-par)<1e-9)));
      root.querySelectorAll('[data-sig]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sig===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:8px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal <span class="seg">
                <button data-sig="rect">rectangular</button>
                <button data-sig="cos">cosine</button>
                <button data-sig="sin">sine</button>
                <button data-sig="imp">impulse train</button></span></label></div>
              <div class="ctrl parctrl"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('click', e=>{
        const p=e.target.closest('[data-par]');
        if(p){ par=parseFloat(p.dataset.par); draw(root); RENDER.fit(); return; }
        const b=e.target.closest('[data-sig]');
        if(!b) return;
        key=b.dataset.sig;
        par = (key==='rect'||key==='imp') ? sigs[key].Tsteps[1] : sigs[key].Asteps[1];
        draw(root); RENDER.fit();
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     W · ONE OPERATION, ONE SPECTRAL RULE            [Source: 51–55]
     Base signal: rectangular pulse, half-width 1. X(jw) = 2 sin(w)/w.
     ======================================================================= */
  const W = (() => {
    const xbase = t=>Math.abs(t)<1?1:0;
    const Xbase = w=> Math.abs(w)<1e-9 ? 2 : 2*Math.sin(w)/w;

    const ops = {
      shift:{ name:'Time shift', label:'time shift',
        par:{min:-3,max:3,step:0.1,val:1.5,label:'Shift $t_0$'},
        xafter:(t,p)=>xbase(t-p),
        Xafter:(w,p)=>({re:Xbase(w)*Math.cos(w*p), im:-Xbase(w)*Math.sin(w*p)}),
        proptex:(p)=>`x(t-${N4(p,2)})\\ \\longleftrightarrow\\ e^{-j${N4(p,2)}\\omega}X(j\\omega)`,
        what:'phase only', note:'The magnitude $|X(j\\omega)|$ is unchanged; only the phase gains the linear term $-\\omega t_0$.' },
      scale:{ name:'Time scaling', label:'time scaling',
        par:{min:0.25,max:4,step:0.25,val:2,label:'Scale $a$'},
        xafter:(t,p)=>xbase(p*t),
        Xafter:(w,p)=>({re:Xbase(w/p)/Math.abs(p), im:0}),
        proptex:(p)=>`x(${N4(p,2)}t)\\ \\longleftrightarrow\\ \\dfrac{1}{|${N4(p,2)}|}X\\!\\left(\\dfrac{j\\omega}{${N4(p,2)}}\\right)`,
        what:'width and height (time compresses, frequency spreads)',
        note:'A larger $|a|$ squeezes the signal in time and stretches its spectrum by the same factor; the area $X(0)$ scales by $1/|a|$.' },
      rev:{ name:'Reverse', label:'reverse',
        par:{min:1,max:1,step:1,val:1,label:'Fixed: time reversal'},
        xafter:(t)=>xbase(-t),
        Xafter:(w)=>({re:Xbase(-w),im:0}),
        proptex:()=>`x(-t)\\ \\longleftrightarrow\\ X(-j\\omega)`,
        what:'nothing, for this even signal (a general signal would mirror its spectrum)',
        note:'This pulse is even, so reversing it in time leaves both the signal and its transform unchanged.' },
      deriv:{ name:'Differentiation', label:'differentiation',
        par:{min:1,max:1,step:1,val:1,label:'Fixed: no parameter'},
        xafter:null,
        Xafter:(w)=>({re:0, im:w*Xbase(w)}),
        proptex:()=>`\\dfrac{dx}{dt}\\ \\longleftrightarrow\\ j\\omega X(j\\omega)`,
        what:'magnitude (by $|\\omega|$) and phase (a $90^\\circ$ shift), since the transform is scaled by $j\\omega$',
        note:'The pulse\'s derivative is two impulses, $\\delta(t+1)-\\delta(t-1)$; its transform $2j\\sin\\omega$ has zero area at the origin.' },
      freq:{ name:'Frequency shift', label:'frequency shift',
        par:{min:-6,max:6,step:0.5,val:3,label:'Shift $\\omega_0$'},
        xafter:(t,p)=>xbase(t)*Math.cos(p*t), /* Re{e^{jw0 t} x(t)} shown in time */
        Xafter:(w,p)=>({re:Xbase(w-p), im:0}),
        proptex:(p)=>`e^{j${N4(p,2)}t}x(t)\\ \\longleftrightarrow\\ X(j(\\omega-${N4(p,2)}))`,
        what:'index: the spectrum slides to be centred at $\\omega_0$',
        note:'The product is complex, so the time panel shows $\\operatorname{Re}\\{e^{j\\omega_0t}x(t)\\}$ only.' }
    };
    let key='shift', par=ops.shift.par.val;

    /* Parseval: energy in time (Simpson, R = 1 ohm) vs energy in frequency (1/2pi) integral |X|^2 dw */
    function timeEnergy(f, lo, hi, n=4000){
      const h=(hi-lo)/n; let s=0;
      for(let i=0;i<=n;i++){ const t=lo+i*h, v=f(t); const wgt=(i===0||i===n)?1:(i%2?4:2); s+=wgt*v*v; }
      return s*h/3;
    }
    function freqEnergy(Xf, wmax, n=4000){
      const h=(2*wmax)/n; let s=0;
      for(let i=0;i<=n;i++){ const w=-wmax+i*h, X=Xf(w); const mag2=X.re*X.re+X.im*X.im;
        const wgt=(i===0||i===n)?1:(i%2?4:2); s+=wgt*mag2; }
      return (s*h/3)/(2*PI);
    }

    function draw(root){
      const o = ops[key];
      const xa = key==='deriv' ? null : t=>o.xafter(t,par);
      const Xa = w=>o.Xafter(w,par);

      /* panel 1 — x(t) before (faint/dashed) and after */
      const A1 = PLOT.Axes({w:760,h:164,xr:[-6,6],yr:key==='deriv'?[-1.3,1.3]:[-0.35,1.55],xlabel:'t',
        pad:{l:50,r:24,t:12,b:26},xtarget:7,ytarget:3});
      A1.curve(xbase,{color:PLOT.COL.in,n:2000,dash:'5 4',opacity:.55});
      if(key==='deriv'){
        A1.impulse(-1,1,{color:PLOT.COL.out,labelText:'1'});
        A1.impulse(1,-1,{color:PLOT.COL.out,labelText:'-1'});
      } else {
        A1.curve(xa,{color:PLOT.COL.out,n:2000});
      }

      /* panel 2 — |X| before and after */
      const wmax = 14;
      const magBefore = w=>Math.abs(Xbase(w));
      const magAfter = w=>{ const X=Xa(w); return Math.hypot(X.re,X.im); };
      let peakA=0; for(let i=0;i<=800;i++){ const w=-wmax+2*wmax*i/800; peakA=Math.max(peakA, magAfter(w)); }
      const A2 = PLOT.Axes({w:760,h:145,xr:[-wmax,wmax],yr:[-0.1*Math.max(2,peakA),1.25*Math.max(2,peakA)],
        xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',pad:{l:56,r:24,t:12,b:28},xtarget:7,ytarget:2});
      A2.curve(magBefore,{color:PLOT.COL.in,n:1600,dash:'5 4',opacity:.55});
      A2.curve(magAfter,{color:PLOT.COL.out,n:1600});

      /* panel 3 — phase after, wrapped to (-pi, pi] */
      const wrap = a=>{ let v=((a+PI)%(2*PI)+2*PI)%(2*PI)-PI; return v; };
      const phaseAfter = w=>{ const X=Xa(w); if(Math.hypot(X.re,X.im)<1e-9) return 0; return wrap(Math.atan2(X.im,X.re)); };
      const A3 = PLOT.Axes({w:760,h:145,xr:[-wmax,wmax],yr:[-3.6,3.6],
        xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',
        pad:{l:60,r:24,t:12,b:28},xtarget:7,yticksOverride:[-PI,0,PI],ytickfmt:v=>v.toFixed(2)});
      A3.curve(phaseAfter,{color:PLOT.COL.out,n:1600});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}${L('out',key==='deriv'?'dx/dt':'\\text{after}')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{before}')}${L('out','\\text{after}')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('out','\\angle X\\ \\text{after}')}</div></div>`;

      /* readouts: X(0) before/after, energy in both domains, peak |X| */
      const X0before = Xbase(0);
      const X0after = Xa(0);
      const Ebefore_t = timeEnergy(xbase,-6,6);
      const Eafter_t = key==='deriv' ? null /* two impulses: not finite in the ordinary sense */
                       : timeEnergy(xa,-6,6);
      const Ebefore_f = freqEnergy(w=>({re:Xbase(w),im:0}), 60);
      const Eafter_f = key==='deriv' ? null /* jw X(jw) does not decay: the integral does not converge */
                       : freqEnergy(Xa, 60);

      root.querySelector('.ro').innerHTML = `
        <div><dt>X(0) before</dt><dd>${N4(X0before,4)}</dd></div>
        <div><dt>X(0) after</dt><dd class="okv">${N4(X0after.re,4)}${X0after.im>=0?' + ':' \u2212 '}${N4(Math.abs(X0after.im),4)}j</dd></div>
        <div><dt>Energy, t</dt><dd>${Eafter_t==null?'not finite':N4(Ebefore_t,4)+' / '+N4(Eafter_t,4)}</dd></div>
        <div><dt>Energy, f</dt><dd>${Eafter_f==null?'not finite':N4(Ebefore_f,4)+' / '+N4(Eafter_f,4)}</dd></div>
        <div><dt>Peak |X|</dt><dd>${N4(peakA,4)}</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">${o.name}</span>${T(o.proptex(par),true)}</div>`
        + `<div class="note warn"><span class="note-h">What changed</span>This operation changes the ${o.what}.
             The base pulse has $X(j\\omega)=2\\sin\\omega/\\omega$ (unnormalised sinc, $2\\operatorname{sinc}(\\omega)$).</div>`
        + `<div class="note ok"><span class="note-h">Parseval, $R=1\\,\\Omega$</span>
             $\\int|x|^2dt=\\frac{1}{2\\pi}\\int|X|^2d\\omega$. ${key==='deriv'
               ? 'Two unit impulses carry infinite energy, and $j\\omega X(j\\omega)$ does not decay, so neither side is a finite number here.'
               : 'The two energy readouts above match, each computed independently.'}</div>`);

      const sl = root.querySelector('[data-v=par]');
      sl.min=o.par.min; sl.max=o.par.max; sl.step=o.par.step; sl.value=par; sl.disabled = o.par.min===o.par.max;
      root.querySelector('.parlabel').innerHTML = M(o.par.label);
      root.querySelector('[data-out=par]').textContent = N4(par,2);
      root.querySelectorAll('[data-op]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.op===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Operation <span class="seg">
                ${Object.entries(ops).map(([k,o])=>`<button data-op="${k}">${o.label}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1.5</span></label>
                <input type="range" data-v="par" min="-3" max="3" step="0.1" value="1.5"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v==='par'){ par=parseFloat(e.target.value); draw(root); } });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-op]'); if(!b) return;
        key=b.dataset.op; par=ops[key].par.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { V, W };
})());
