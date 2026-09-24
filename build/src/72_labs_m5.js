/* ==========================================================================
   Laboratories 5.1 and 5.2 (keys U, H) — Module 5
   Every displayed number is computed from the definitions at interaction time.
   Restyled to the slide card language of Module 4 (build/src/71_labs_m4.js):
   legends inside .plot-wrap, computed equations as tabbed .eq cards, notes as
   tabbed cards, no bare inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
  const PI = Math.PI;
  const sinc = x => Math.abs(x) < 1e-9 ? 1 : Math.sin(x)/x;

  /* =======================================================================
     H · THE STANDARD PAIRS EXPLORER                  [Source: 45–48]
     One signal at a time, drawn from section 5.2's own worked examples:
     rectangular pulse, one-sided and two-sided exponential, ideal low-pass
     band, and the shifted impulse. Every panel is the module's own X(jω).
     ======================================================================= */
  const H = (() => {
    const cx = (re,im)=>({re:re,im:im});
    const cabs = a=>Math.hypot(a.re,a.im);
    const carg = a=>(cabs(a)<1e-12 ? 0 : Math.atan2(a.im,a.re));

    /* `X` returns the transform as a complex number so exp1 can show phase.
       `real` signals plot X itself (signed) so the negative sinc side lobes
       show; `real:false` (only exp1) plots |X| and ∠X in two panels. */
    const sigs = {
      rect:{ name:'Rectangular pulse', real:true,
        sl:{min:0.4,max:3,step:0.05,val:1,label:'Half-width $T_1$ (s)'},
        tex:'x(t)=1\\ \\text{on}\\ |t|<T_1,\\qquad X(j\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)',
        x:(t,p)=>Math.abs(t)<p?1:0, tr:[-4,4],
        X:(w,p)=>cx(2*p*sinc(w*p),0),
        widthName:'First null', width:p=>PI/p, duration:p=>p,
        tbp:true },
      exp1:{ name:'One-sided exponential', real:false,
        sl:{min:0.25,max:4,step:0.05,val:1,label:'Decay rate $a$ (1/s)'},
        tex:'x(t)=e^{-at}u(t),\\qquad X(j\\omega)=\\dfrac{1}{a+j\\omega},\\qquad a>0',
        x:(t,p)=>t<0?0:Math.exp(-p*t), tr:[-1,8],
        X:(w,p)=>{ const d=p*p+w*w; return cx(p/d, -w/d); },
        widthName:'Half-power width', width:p=>p, duration:p=>1/p,
        tbp:false },
      exp2:{ name:'Two-sided exponential', real:true,
        sl:{min:0.25,max:4,step:0.05,val:1,label:'Decay rate $a$ (1/s)'},
        tex:'x(t)=e^{-a|t|},\\qquad X(j\\omega)=\\dfrac{2a}{a^{2}+\\omega^{2}}',
        x:(t,p)=>Math.exp(-p*Math.abs(t)), tr:[-6,6],
        X:(w,p)=>cx(2*p/(p*p+w*w),0),
        widthName:'Half-power width', width:p=>p, duration:p=>1/p,
        tbp:false },
      band:{ name:'Ideal low-pass band', real:true,
        sl:{min:1,max:8,step:0.25,val:3,label:'Band edge $W$ (rad/s)'},
        tex:'x(t)=\\dfrac{\\sin(Wt)}{\\pi t},\\qquad X(j\\omega)=1\\ \\text{on}\\ |\\omega|<W',
        x:(t,p)=>(p/PI)*sinc(p*t), tr:[-6,6],
        X:(w,p)=>cx(Math.abs(w)<p?1:0,0),
        widthName:'Band edge', width:p=>p, duration:p=>PI/p,
        tbp:false },
      delta:{ name:'Shifted impulse', real:false, imp:true, wmax:6,
        sl:{min:-2,max:2,step:0.1,val:1,label:'Shift $t_0$ (s)'},
        tex:'x(t)=\\delta(t-t_0),\\qquad X(j\\omega)=e^{-j\\omega t_0}',
        x:null, tr:[-4,4],
        X:(w,p)=>cx(Math.cos(w*p),-Math.sin(w*p)),
        widthName:'Magnitude', width:()=>1, duration:()=>0,
        tbp:false }
    };
    let key='rect', par=sigs.rect.sl.val;

    function draw(root){
      const s = sigs[key];
      const wmax = s.wmax || 16;

      /* ---- panel 1: the signal in time ---- */
      const tr = s.tr;
      let ylo=-0.3, yhi=1.4;
      if(s.x){
        let mx=0; for(let i=0;i<=1200;i++){ const t=tr[0]+(tr[1]-tr[0])*i/1200;
          mx=Math.max(mx, Math.abs(s.x(t,par))); }
        yhi = mx*1.25+0.05; ylo = key==='exp1' ? -0.25*mx-0.05 : -yhi;
      }
      const A1 = PLOT.Axes({w:760,h:s.real?196:172,xr:tr,yr:[ylo,yhi],xlabel:'t',ylabel:'x(t)',
        pad:{l:58,r:24,t:26,b:34},xtarget:7,ytarget:3});
      if(s.imp){
        A1.impulse(par, 1, {color:PLOT.COL.in, labelText:'1'});
      } else {
        A1.curve(t=>s.x(t,par),{color:PLOT.COL.in,width:2.3,n:3000});
      }

      /* ---- panel(s) 2: the transform ---- */
      let topMag = 0;
      for(let i=0;i<=1600;i++){ const w=-wmax+2*wmax*i/1600;
        topMag = Math.max(topMag, s.real ? Math.abs(s.X(w,par).re) : cabs(s.X(w,par))); }
      topMag = Math.max(topMag, 1e-3);

      let panels;
      if(s.real){
        const A2 = PLOT.Axes({w:760,h:236,xr:[-wmax,wmax],yr:[-0.55*topMag,1.28*topMag],
          xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
          pad:{l:64,r:24,t:32,b:36},xtarget:7,ytarget:3});
        A2.curve(w=>s.X(w,par).re,{color:PLOT.COL.mid,width:2.3,n:2400});
        panels = [A1,A2];
        root.querySelector('.plots').innerHTML =
          `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}</div></div>`
        + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('mid','X(j\\omega)')}</div></div>`;
      } else {
        const A2 = PLOT.Axes({w:760,h:128,xr:[-wmax,wmax],yr:[-0.1*topMag,1.28*topMag],
          xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|X(j\\omega)|',
          pad:{l:64,r:24,t:28,b:32},xtarget:7,ytarget:3});
        A2.curve(w=>cabs(s.X(w,par)),{color:PLOT.COL.mid,width:2.3,n:2400});
        const A3 = PLOT.Axes({w:760,h:140,xr:[-wmax,wmax],yr:[-1.9,1.9],
          xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'\\angle X(j\\omega)\\;(\\text{rad})',
          pad:{l:70,r:24,t:26,b:34},xtarget:7,
          yticksOverride:[-1.5708,0,1.5708],ytickfmt:v=>v.toFixed(2)});
        A3.curve(w=>carg(s.X(w,par)),{color:PLOT.COL.mid,width:2,n:2400});
        panels = [A1,A2,A3];
        root.querySelector('.plots').innerHTML =
          `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}</div></div>`
        + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('mid','|X(j\\omega)|')}</div></div>`
        + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('mid','\\angle X(j\\omega)')}</div></div>`;
      }

      /* ---- the readouts, every one computed here ---- */
      const peak = s.real ? s.X(0,par).re : cabs(s.X(0,par));
      const width = s.width(par), dur = s.duration(par);
      const tbp = s.tbp ? width*2*dur : null;
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Peak $X(j0)$</dt><dd class="okv">${N4(peak,4)}</dd></div>
        <div><dt>${s.widthName}</dt><dd>${N4(width,4)}${s.imp?'':' rad/s'}</dd></div>
        <div><dt>Duration</dt><dd>${key==='delta'?'0 (a point)':N4(dur,4)+' s'}</dd></div>
        <div><dt>Width $\\times\\,2\\times$ duration</dt>
          <dd class="${s.tbp?'okv':''}">${s.tbp?N4(tbp,4)+' (near $2\\pi$)':'not fixed here'}</dd></div>`);

      root.querySelector('.signame').textContent = s.name;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Transform pair</span>${T(s.tex,true)}</div>`
        + (key==='rect'
          ? `<div class="note ok"><span class="note-h">Inverse width relation</span>
               Raise $T_1$ and the first null $\\pi/T_1$ moves in: width $\\times$ duration stays near
               $2\\pi$. Sinc here is unnormalised, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.</div>`
          : key==='band'
          ? `<div class="note def"><span class="note-h">Sinc convention</span>
               $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, unnormalised, $\\operatorname{sinc}(0)=1$.
               Raising $W$ widens the band and narrows the time-domain first null at $t=\\pi/W$: the same
               inverse relation, time and frequency exchanged.</div>`
          : key==='exp1'
          ? `<div class="note warn"><span class="note-h">The phase carries a minus sign</span>
               $\\angle X(j\\omega)=-\\arctan(\\omega/a)$. Raising $a$ decays the signal faster and spreads
               $|X|$ wider and lower: the peak $1/a$ falls as $a$ grows.</div>`
          : key==='exp2'
          ? `<div class="note warn"><span class="note-h">Inverse width relation</span>
               Raising $a$ decays the signal faster and spreads its transform wider and lower, as for the
               one-sided case.</div>`
          : `<div class="note def"><span class="note-h">Flat magnitude, linear phase</span>
               $|X(j\\omega)|=1$ at every $\\omega$; shifting in time only rotates the phase, by an amount
               proportional to frequency.</div>`));

      const sl = root.querySelector('[data-v=par]');
      sl.min=s.sl.min; sl.max=s.sl.max; sl.step=s.sl.step; sl.value=par;
      root.querySelector('.parlabel').innerHTML = M(s.sl.label);
      root.querySelector('[data-out=par]').textContent = fmt(par,2);
      root.querySelectorAll('[data-case]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.case===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal <span class="seg">
                ${Object.keys(sigs).map(k=>`<button data-case="${k}">${k==='band'?'ideal band':k==='delta'?'impulse':k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1</span></label>
                <input type="range" data-v="par" min="0.4" max="3" step="0.05" value="1"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v==='par'){ par=parseFloat(e.target.value); draw(root); } });
      root.addEventListener('click', e=>{
        const c=e.target.closest('[data-case]');
        if(c){ key=c.dataset.case; par=sigs[key].sl.val; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     U · FROM LINE SPECTRUM TO TRANSFORM              [Source: 42–44]
     A rectangular (or triangular) pulse of fixed half-width T1 = 1, repeated
     with period T. As T grows, the scaled coefficients T a_k crowd onto the
     envelope X(jω), and the Riemann sum of section 5.1 rebuilds x(0).
     ======================================================================= */
  const U = (() => {
    const T1 = 1;
    /* rectangular pulse: X(jw) = 2 sinc(w), a_k T = X(j k w0) */
    const Xrect = w => 2*T1*sinc(w*T1);
    const xrectPer = (t,Tp) => { const u = t - Tp*Math.round(t/Tp); return Math.abs(u)<T1 ? 1 : 0; };
    /* triangular pulse 1-|t| on |t|<1: X(jw) = (2/w^2)(1-cos w) = sinc^2(w/2) */
    const Xtri = w => Math.abs(w)<1e-6 ? 1 : (2/(w*w))*(1-Math.cos(w));
    const xtriPer = (t,Tp) => { const u = t - Tp*Math.round(t/Tp);
      return Math.abs(u)<1 ? 1-Math.abs(u) : 0; };

    const shapes = {
      rect:{ name:'Rectangular pulse', X:Xrect, per:xrectPer,
        tex:'x(t)=1\\ \\text{on}\\ |t|<1,\\qquad X(j\\omega)=2\\operatorname{sinc}(\\omega)' },
      tri:{ name:'Triangular pulse', X:Xtri, per:xtriPer,
        tex:'x(t)=1-|t|\\ \\text{on}\\ |t|<1,\\qquad X(j\\omega)=\\dfrac{2}{\\omega^{2}}(1-\\cos\\omega)=\\operatorname{sinc}^{2}(\\omega/2)' }
    };
    let key='rect', ratio=8; /* T/T1 */

    function draw(root){
      const sh = shapes[key];
      const Tp = ratio*T1, w0 = 2*PI/Tp;
      const wmax = 12;

      /* ---- panel 1: the periodic extension, central pulse highlighted ---- */
      const A1 = PLOT.Axes({w:760,h:176,xr:[-12,12],yr:key==='tri'?[-0.25,1.35]:[-0.3,1.4],
        xlabel:'t',ylabel:'\\tilde{x}(t)',pad:{l:56,r:24,t:26,b:34},xtarget:7,ytarget:3});
      A1.curve(t=>sh.per(t,Tp),{color:PLOT.COL.muted,width:1.6,n:4000});
      A1.curve(t=>Math.abs(t)<1.5 ? sh.per(t,Tp) : NaN,{color:PLOT.COL.in,width:2.6,n:1600});

      /* ---- panel 2: scaled coefficients T a_k as stems, envelope dashed ---- */
      const stems = [];
      const Kmax = Math.floor(wmax/w0);
      for(let k=-Kmax;k<=Kmax;k++) stems.push([k*w0, sh.X(k*w0)]);
      let topc = 0; for(let i=0;i<=1200;i++){ const w=-wmax+2*wmax*i/1200; topc=Math.max(topc,Math.abs(sh.X(w))); }
      topc = Math.max(topc, 0.2);
      const A2 = PLOT.Axes({w:760,h:212,xr:[-wmax,wmax],yr:[-0.55*topc,1.28*topc],
        xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'T\\,a_k\\ \\text{and}\\ X(j\\omega)',
        pad:{l:64,r:24,t:30,b:36},xtarget:7,ytarget:3});
      A2.curve(w=>sh.X(w),{color:PLOT.COL.coral,width:1.6,dash:'6 5',n:1600});
      A2.stem(stems,{color:PLOT.COL.in,r:3.2,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('muted','\\tilde{x}(t)')}${L('in','\\text{central pulse}')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','T\\,a_k')}${L('coral','X(j\\omega)',true)}</div></div>`;

      /* ---- readouts: w0, T a_0, stems inside the main lobe, Riemann rebuild ---- */
      const mainLobe = key==='rect' ? PI : 2*PI; /* first null of the envelope */
      const insideCount = stems.filter(([w])=>Math.abs(w)<mainLobe).length;
      /* Riemann-sum rebuild of x(0), truncated at |w| <= wmax: (1/2pi) sum X(jkw0) w0 */
      let rebuild = 0;
      stems.forEach(([w,Xv])=>{ rebuild += Xv*w0; });
      rebuild /= (2*PI);
      const trueX0 = sh.per(0,Tp);

      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Spacing $\\omega_0$</dt><dd class="okv">${N4(w0,4)} rad/s</dd></div>
        <div><dt>$T\\,a_0=X(j0)$</dt><dd>${N4(sh.X(0),4)}</dd></div>
        <div><dt>Stems, main lobe</dt><dd>${insideCount}</dd></div>
        <div><dt>Rebuild of $x(0)$</dt><dd class="${Math.abs(rebuild-trueX0)<0.05?'okv':''}">${N4(rebuild,4)}</dd></div>`);

      root.querySelector('.signame').innerHTML = T(`\\text{${sh.name}},\\ T/T_1=${fmt(ratio,2)}`, false);

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Samples of one curve</span>${T(`T\\,a_k=X(jk\\omega_0),\\quad \\omega_0=${N4(w0,4)}\\ \\text{rad/s},\\quad T\\,a_1=${N4(sh.X(w0),4)}`,true)}</div>`
        + `<div class="note ok"><span class="note-h">Stems crowd onto the curve</span>
             As $T/T_1$ rises, $\\omega_0$ shrinks and more stems pack onto $X(j\\omega)$: as $T\\to\\infty$
             the line spectrum becomes the transform. The Riemann rebuild ${N4(rebuild,4)} is already close
             to the true $x(0)=${N4(trueX0,4)}$.</div>`);

      const sl = root.querySelector('[data-v=ratio]');
      sl.min=2.5; sl.max=40; sl.step=0.5; sl.value=ratio;
      root.querySelector('[data-out=ratio]').textContent = fmt(ratio,1);
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
              <div class="ctrl"><label>Pulse shape <span class="seg">
                <button data-shape="rect">rectangular</button>
                <button data-shape="tri">triangular</button></span></label></div>
              <div class="ctrl"><label>Period ratio $T/T_1$ <span class="val" data-out="ratio">8</span></label>
                <input type="range" data-v="ratio" min="2.5" max="40" step="0.5" value="8"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v==='ratio'){ ratio=parseFloat(e.target.value); draw(root); } });
      root.addEventListener('click', e=>{
        const b=e.target.closest('[data-shape]');
        if(b){ key=b.dataset.shape; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  return { H, U };
})());
