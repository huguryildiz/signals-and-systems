/* ==========================================================================
   Laboratories 5.5 (key X) and 5.6 (key Y) — Module 5
   Every displayed number is computed from the definitions at interaction time.
   Styled to the slide card language of Module 4 (build/src/71_labs_m4.js):
   legends inside .plot-wrap, computed equations as tabbed .eq cards, notes as
   tabbed cards, no bare inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
  const PI = Math.PI;
  const sincU = x => Math.abs(x)<1e-9 ? 1 : Math.sin(x)/x;

  /* complex helpers */
  const cx  = (re,im)=>({re:re,im:im});
  const cmul= (a,b)=>cx(a.re*b.re-a.im*b.im, a.re*b.im+a.im*b.re);
  const cabs= a=>Math.hypot(a.re,a.im);

  /* =======================================================================
     X · FILTERING AND MODULATION IN FREQUENCY        [Source: 56–61]
     Two modes: (1) an input spectrum times a system's frequency response,
     (2) a band-limited signal times a cosine carrier.
     ======================================================================= */
  const X = (() => {
    let mode = 'filter';
    /* ---- filter mode ---- */
    let inKind = 'exp', sysKind = 'exp', b = 2, wc = 4;
    const WEXP = 4*PI;                 /* band edge of the band-limited input */
    const AEXP = 2, HEXP = 3;          /* heights: X = 2 on the band, H = 3 on its band */

    /* X(jw) for the two input choices */
    const Xin = w => inKind==='exp' ? cx(1,0) /* magnitude handled separately: 1/(1+jw) */
                                     : cx(Math.abs(w)<=WEXP?AEXP:0,0);
    const XinMag = w => inKind==='exp' ? 1/Math.hypot(1,w) : (Math.abs(w)<=WEXP?AEXP:0);
    /* H(jw) magnitude for the two system choices */
    const HsysMag = w => sysKind==='exp' ? 1/Math.hypot(b,w) : (Math.abs(w)<=wc?HEXP:0);

    function drawFilter(root){
      const wr = 4*PI;
      /* panel 1 — |X|, |H|, |Y| on one frequency plot */
      const topY = Math.max(0.3, inKind==='exp'?1:AEXP, sysKind==='exp'?1/b:HEXP, (inKind==='exp'?1:AEXP)*(sysKind==='exp'?1/b:HEXP));
      const A1 = PLOT.Axes({w:760,h:328,xr:[-wr,wr],yr:[-0.08*topY,1.35*topY],
        xlabel:'\\omega\\;(\\text{rad/s})',pad:{l:56,r:24,t:22,b:32},xtarget:7,ytarget:3});
      A1.curve(w=>XinMag(w),{color:PLOT.COL.in,n:1600});
      A1.curve(w=>HsysMag(w),{color:PLOT.COL.h,n:1600});
      A1.curve(w=>XinMag(w)*HsysMag(w),{color:PLOT.COL.out,n:1600,dash:'2 5'});

      /* panel 2 — y(t) in time */
      let yfun, yLabel, ttop;
      if(inKind==='exp' && sysKind==='exp'){
        if(Math.abs(b-1)<1e-6) yfun = t=> t>=0 ? t*Math.exp(-t) : 0;
        else yfun = t=> t>=0 ? (Math.exp(-t)-Math.exp(-b*t))/(b-1) : 0;
        yLabel = 'y(t)';
        ttop = 6;
      } else if(inKind==='exp' && sysKind!=='exp'){
        /* e^{-t}u(t) through an ideal low-pass: no closed form asked for; use
           numerical inverse transform of X(jw)H(jw) instead */
        const Yc = w => { const Hh = Math.abs(w)<=wc?HEXP:0; return { re: Hh/(1+w*w), im: -Hh*w/(1+w*w) }; };
        yfun = t=>{ const n=600, wmax=Math.min(wc,40)+2; let s=0;
          for(let i=0;i<=n;i++){ const w=-wmax+2*wmax*i/n; const Y=Yc(w);
            const wgt=(i===0||i===n)?1:(i%2?4:2);
            s += wgt*(Y.re*Math.cos(w*t)-Y.im*Math.sin(w*t)); }
          return s*(2*wmax/n)/3/(2*PI); };
        yLabel = 'y(t)';
        ttop = 6;
      } else if(inKind!=='exp' && sysKind==='exp'){
        const Yc = w => { const Xx=Math.abs(w)<=WEXP?AEXP:0; const den=cx(b,w);
          const num=cx(Xx,0); const d2=den.re*den.re+den.im*den.im;
          return cx((num.re*den.re+num.im*den.im)/d2, (num.im*den.re-num.re*den.im)/d2); };
        yfun = t=>{ if(t<0) return null; const n=700, wmax=WEXP+2; let s=0;
          for(let i=0;i<=n;i++){ const w=-wmax+2*wmax*i/n; const Y=Yc(w);
            const wgt=(i===0||i===n)?1:(i%2?4:2);
            s += wgt*(Y.re*Math.cos(w*t)-Y.im*Math.sin(w*t)); }
          return s*(2*wmax/n)/3/(2*PI); };
        yLabel = 'y(t)';
        ttop = 3;
      } else {
        /* both band-limited: ideal low-pass output is a sinc, closed form */
        const W = Math.min(WEXP, wc), Aprod = AEXP*HEXP;
        yfun = t => Math.abs(t)<1e-9 ? Aprod*W/PI : Aprod*Math.sin(W*t)/(PI*t);
        yLabel = 'y(t)';
        ttop = 2;
      }
      const yvals=[]; for(let i=0;i<=400;i++){ const t=-0.3*ttop+ttop*1.3*i/400; const v=yfun(t); if(v!=null&&isFinite(v)) yvals.push(v); }
      const ylo = Math.min(0,...yvals), yhi = Math.max(0.05,...yvals);
      const A2 = PLOT.Axes({w:760,h:240,xr:[-0.3*ttop,ttop],yr:[ylo-0.15*(yhi-ylo+.1), yhi+0.2*(yhi-ylo+.1)],
        xlabel:'t\\;(\\text{s})',pad:{l:56,r:24,t:20,b:30},xtarget:6,ytarget:3});
      A2.curve(t=> yfun(t)==null?NaN:yfun(t),{color:PLOT.COL.out,n:1200});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','|X(j\\omega)|')}${L('h','|H(j\\omega)|')}${L('out','|Y(j\\omega)|')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out',yLabel)}</div></div>`;

      const X0 = XinMag(0), H0 = HsysMag(0), Y0 = X0*H0;
      let peakInfo;
      if(inKind==='exp' && sysKind==='exp'){
        if(Math.abs(b-1)<1e-6) peakInfo = { v: 1/Math.E, t: 1 };
        else { const tp = Math.log(b)/(b-1); peakInfo = { v: yfun(tp), t: tp }; }
      } else {
        let best=-Infinity, bt=0;
        for(let i=0;i<=800;i++){ const t=-0.3*ttop+ttop*1.3*i/800; const v=yfun(t); if(v!=null&&isFinite(v)&&v>best){best=v;bt=t;} }
        peakInfo = { v: best, t: bt };
      }
      root.querySelector('.ro').innerHTML = `
        <div><dt>|X(j0)|</dt><dd>${N4(X0,4)}</dd></div>
        <div><dt>|H(j0)|</dt><dd>${N4(H0,4)}</dd></div>
        <div><dt>|Y(j0)|</dt><dd class="okv">${N4(Y0,4)}</dd></div>
        <div><dt>Peak of y(t)</dt><dd>${N4(peakInfo.v,4)} at t = ${N4(peakInfo.t,3)}</dd></div>`;

      const sysTex = sysKind==='exp' ? `H(j\\omega)=\\dfrac{1}{${b===1?'1':N4(b,2)}+j\\omega}`
                                      : `H=${HEXP}\\ \\text{on}\\ |\\omega|\\le${N4(wc,2)}`;
      const inTex = inKind==='exp' ? `X(j\\omega)=\\dfrac{1}{1+j\\omega}` : `X=${AEXP}\\ \\text{on}\\ |\\omega|\\le${N4(WEXP,2)}`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Multiplication in frequency</span>${T(`Y(j\\omega)=X(j\\omega)H(j\\omega)`,true)}
           <div style="margin-top:4px">${T(`${inTex},\\quad ${sysTex}`,true)}</div></div>`
        + `<div class="note ok"><span class="note-h">Same rule, every case</span>
             The output spectrum is the pointwise product of the input spectrum and the frequency
             response. Where either factor is zero, the output has no energy at that frequency.</div>`);

      root.querySelectorAll('[data-seg="xmode"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===mode)));
      root.querySelectorAll('[data-seg="in"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===inKind)));
      root.querySelectorAll('[data-seg="sys"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===sysKind)));
      const slB = root.querySelector('[data-v=b]'); if(slB){ slB.value=b; root.querySelector('[data-out=b]').textContent=N4(b,2); }
      const slWc = root.querySelector('[data-v=wc]'); if(slWc){ slWc.value=wc; root.querySelector('[data-out=wc]').textContent=N4(wc,2); }
    }

    /* ---- modulate mode ---- */
    let W = 2*PI, wcm = 4*PI;
    function drawModulate(root){
      const wr = wcm + W + 1;
      const A1 = PLOT.Axes({w:760,h:300,xr:[-wr,wr],yr:[-0.1,1.35],
        xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'\\text{amplitude}',pad:{l:56,r:24,t:22,b:32},xtarget:7,ytarget:3});
      A1.curve(w=>Math.abs(w)<=W?1:0,{color:PLOT.COL.in,n:1600});
      /* Z(jw) = 1/2 X(j(w-wc)) + 1/2 X(j(w+wc)); where the two copies overlap the
         sum is drawn, height 1 where both land, 0.5 where only one does */
      const overlap = wcm < W;
      A1.curve(w=>{
        const c1 = Math.abs(w-wcm)<=W ? 0.5 : 0;
        const c2 = Math.abs(w+wcm)<=W ? 0.5 : 0;
        return c1+c2;
      },{color:PLOT.COL.out,n:2400,dash:overlap?undefined:'2 5'});
      A1.vline(wcm,{color:PLOT.COL.coral}); A1.vline(-wcm,{color:PLOT.COL.coral});
      A1.note(wcm, 1.22, '\\omega_c', {tex:true,anchor:'middle',color:PLOT.COL.coral,fs:15});
      A1.note(-wcm, 1.22, '-\\omega_c', {tex:true,anchor:'middle',color:PLOT.COL.coral,fs:15});

      const ttop = 3;
      const A2 = PLOT.Axes({w:760,h:220,xr:[-ttop,ttop],yr:[-1.35,1.35],
        xlabel:'t\\;(\\text{s})',pad:{l:56,r:24,t:20,b:30},xtarget:6,ytarget:3});
      const env = t => W>0 ? sincU(W*t)*(W/PI) : 0;
      const envNorm = Math.max(1e-9, W/PI);
      A2.curve(t=>env(t)/envNorm,{color:PLOT.COL.in,dash:'6 5',n:1200,opacity:.75});
      A2.curve(t=>-env(t)/envNorm,{color:PLOT.COL.in,dash:'6 5',n:1200,opacity:.75});
      A2.curve(t=>(env(t)/envNorm)*Math.cos(wcm*t),{color:PLOT.COL.out,n:2400});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','X(j\\omega)')}${L('out','Z(j\\omega)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out','z(t)')}${L('in','\\pm x(t)\\ (\\text{envelope})')}</div></div>`;

      root.querySelector('.ro').innerHTML = `
        <div><dt>Copy edges</dt><dd>${N4(wcm-W,3)} to ${N4(wcm+W,3)}</dd></div>
        <div><dt>Copies overlap?</dt><dd class="${overlap?'warnv':'okv'}">${overlap?'yes':'no'}</dd></div>
        <div><dt>Separation needs</dt><dd>${T('\\omega_c\\ge W',false)}</dd></div>
        <div><dt>Height of each copy</dt><dd>0.5</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Multiplication by a carrier</span>${T(`Z(j\\omega)=\\tfrac12X(j(\\omega-\\omega_c))+\\tfrac12X(j(\\omega+\\omega_c))`,true)}</div>`
        + (overlap
          ? `<div class="note err"><span class="note-h">The copies overlap</span>
               ${T(`\\omega_c=${N4(wcm,2)}<W=${N4(W,2)}`,false)}, so the shifted copies of $X$ cross and add. The
               envelope $\\pm x(t)$ no longer bounds $z(t)$ exactly, and $x(t)$ cannot be recovered by
               a low-pass filter alone.</div>`
          : `<div class="note ok"><span class="note-h">The copies stay apart</span>
               ${T(`\\omega_c=${N4(wcm,2)}\\ge W=${N4(W,2)}`,false)}. The two shifted copies of $X$ do not
               overlap; they meet exactly when $\\omega_c=W$. A low-pass filter recovers $x(t)$.</div>`));

      root.querySelectorAll('[data-seg="xmode"]').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.val===mode)));
      const slW = root.querySelector('[data-v=W]'); if(slW){ slW.value=W; root.querySelector('[data-out=W]').textContent=N4(W,2); }
      const slWc2 = root.querySelector('[data-v=wcm]'); if(slWc2){ slWc2.value=wcm; root.querySelector('[data-out=wcm]').textContent=N4(wcm,2); }
    }

    function draw(root){
      root.querySelector('.modebar').innerHTML = M(`<div class="ctrl" style="grid-column:1/-1"><label>Mode <span class="seg">
        <button data-seg="xmode" data-val="filter">filter</button><button data-seg="xmode" data-val="modulate">modulate</button></span></label></div>`);
      if(mode==='filter'){
        root.querySelector('.modectrls').innerHTML = M(`
          <div class="ctrl"><label>Input <span class="seg">
            <button data-seg="in" data-val="exp">$e^{-t}u(t)$</button><button data-seg="in" data-val="band">band-limited</button></span></label></div>
          <div class="ctrl"><label>System <span class="seg">
            <button data-seg="sys" data-val="exp">first-order</button><button data-seg="sys" data-val="ideal">ideal low-pass</button></span></label></div>
          <div class="ctrl" data-if="exp-b"><label>Decay rate $b$ <span class="val" data-out="b">2</span></label>
            <input type="range" data-v="b" min="0.3" max="6" step="0.1" value="2"></div>
          <div class="ctrl" data-if="ideal-wc"><label>Cutoff $\\omega_c$ (rad/s) <span class="val" data-out="wc">4</span></label>
            <input type="range" data-v="wc" min="0.5" max="12" step="0.1" value="4"></div>`);
        root.querySelector('[data-if="exp-b"]').style.display = sysKind==='exp' ? '' : 'none';
        root.querySelector('[data-if="ideal-wc"]').style.display = sysKind==='ideal' ? '' : 'none';
        drawFilter(root);
      } else {
        root.querySelector('.modectrls').innerHTML = M(`
          <div class="ctrl"><label>Bandwidth $W$ (rad/s) <span class="val" data-out="W">6.28</span></label>
            <input type="range" data-v="W" min="3.14" max="12.56" step="0.1" value="6.28"></div>
          <div class="ctrl"><label>Carrier $\\omega_c$ (rad/s) <span class="val" data-out="wcm">12.56</span></label>
            <input type="range" data-v="wcm" min="1.57" max="25.13" step="0.1" value="12.56"></div>`);
        drawModulate(root);
      }
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:8px"></div></div>
          <div class="col stack">
            <div class="ctrls modebar" style="margin-bottom:0"></div>
            <div class="ctrls modectrls"></div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='b') b=v; else if(k==='wc') wc=v; else if(k==='W') W=v; else if(k==='wcm') wcm=v;
        draw(root); });
      root.addEventListener('click', e=>{
        const md=e.target.closest('[data-seg="xmode"]'); if(md){ mode=md.dataset.val; draw(root); RENDER.fit(); return; }
        const inb=e.target.closest('[data-seg="in"]'); if(inb){ inKind=inb.dataset.val; draw(root); return; }
        const sb=e.target.closest('[data-seg="sys"]'); if(sb){ sysKind=sb.dataset.val; draw(root); RENDER.fit(); return; }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     Y · A DIFFERENTIAL EQUATION AND ITS RESPONSE     [Source: 62–63]
     y'' + a1 y' + a0 y = b1 x' + b0 x.  H(jw) = (b1 jw + b0) / ((jw)^2 + a1 jw + a0).
     ======================================================================= */
  const Y = (() => {
    let a1=4, a0=3, b1=1, b0=2;

    function roots(){
      const disc = a1*a1 - 4*a0;
      if(disc > 1e-9){ const s=Math.sqrt(disc); return { kind:'real', r1:(-a1+s)/2, r2:(-a1-s)/2 }; }
      if(disc < -1e-9){ const re=-a1/2, im=Math.sqrt(-disc)/2; return { kind:'complex', re, im }; }
      return { kind:'repeat', r:-a1/2 };
    }
    function Hc(w){
      /* H(jw) = (b1 jw + b0) / (-w^2 + a1 jw + a0) */
      const num = cx(b0, b1*w);
      const den = cx(a0-w*w, a1*w);
      const d2 = den.re*den.re+den.im*den.im;
      return cx((num.re*den.re+num.im*den.im)/d2, (num.im*den.re-num.re*den.im)/d2);
    }
    function hOf(rt){
      if(rt.kind==='real'){
        /* cover-up rule: A/(s-r1) + B/(s-r2), from (b1 s + b0)/((s-r1)(s-r2)) */
        const A = (b1*rt.r1+b0)/(rt.r1-rt.r2), B = (b1*rt.r2+b0)/(rt.r2-rt.r1);
        return { A, B, f: t=> t<0?0:(A*Math.exp(rt.r1*t)+B*Math.exp(rt.r2*t)) };
      }
      if(rt.kind==='repeat'){
        /* (b1 s + b0)/(s-r)^2 = b1/(s-r) + (b0+b1 r)/(s-r)^2 -> b1 e^{rt} + (b0+b1 r) t e^{rt} */
        const C = b1, D = b0 + b1*rt.r;
        return { C, D, f: t=> t<0?0:(C*Math.exp(rt.r*t) + D*t*Math.exp(rt.r*t)) };
      }
      /* complex: h(t) = e^{re t} [ b1 cos(im t) + ((b0 - re b1)/im) sin(im t) ] */
      const re=rt.re, im=rt.im;
      const Bc = (b0 - re*b1)/im;
      return { Bc, f: t=> t<0?0:Math.exp(re*t)*(b1*Math.cos(im*t)+Bc*Math.sin(im*t)) };
    }

    function draw(root){
      const rt = roots(), hh = hOf(rt);
      const wmax = 4*Math.max(3,Math.sqrt(a0),a1);
      const hvals=[]; for(let i=0;i<=600;i++){ const w=-wmax+2*wmax*i/600; hvals.push(cabs(Hc(w))); }
      const hmax = Math.max(0.1,...hvals);
      const A1b = PLOT.Axes({w:760,h:192,xr:[-wmax,wmax],yr:[-0.05*hmax,1.3*hmax],
        xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',pad:{l:56,r:24,t:20,b:30},xtarget:7,ytarget:2});
      A1b.curve(w=>cabs(Hc(w)),{color:PLOT.COL.h,n:1600});

      const A2 = PLOT.Axes({w:760,h:150,xr:[-wmax,wmax],yr:[-3.4,3.4],
        xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'\\angle H(j\\omega)\\;(\\text{rad})',pad:{l:56,r:24,t:18,b:28},xtarget:7,ytarget:2});
      A2.curve(w=>Math.atan2(Hc(w).im,Hc(w).re),{color:PLOT.COL.h,n:1600});

      const A3 = PLOT.Axes({w:760,h:192,xr:[0,8],yr:(()=>{
          const vs=[]; for(let i=0;i<=400;i++) vs.push(hh.f(8*i/400));
          const lo=Math.min(0,...vs), hi=Math.max(0.05,...vs);
          return [lo-0.15*(hi-lo+.05), hi+0.2*(hi-lo+.05)];
        })(),
        xlabel:'t\\;(\\text{s})',ylabel:'h(t)',pad:{l:56,r:24,t:20,b:30},xtarget:6,ytarget:2});
      A3.curve(t=>hh.f(t),{color:PLOT.COL.h,n:1600});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1b.svg()}<div class="legend in-plot lg-at-tr">${L('h','|H(j\\omega)|')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('h','\\angle H(j\\omega)')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('h','h(t)')}</div></div>`;

      const H0 = Hc(0).re;
      const rootTxt = rt.kind==='real' ? T(`j\\omega=${N4(rt.r1,3)},\\ ${N4(rt.r2,3)}`,false)
                    : rt.kind==='repeat' ? T(`j\\omega=${N4(rt.r,3)}\\ (\\text{repeated})`,false)
                    : T(`j\\omega=${N4(rt.re,3)}\\pm j${N4(rt.im,3)}`,false);
      root.querySelector('.ro').innerHTML = `
        <div><dt>H(j0)</dt><dd class="okv">${N4(H0,4)}</dd></div>
        <div><dt>Denominator zero at</dt><dd>${rootTxt}</dd></div>
        <div><dt>h(0+)</dt><dd>${N4(b1,4)}</dd></div>
        <div><dt>Area of h(t)</dt><dd>${N4(H0,4)}</dd></div>`;

      const caseNote = rt.kind==='real'
        ? `<div class="note ok"><span class="note-h">Two distinct real roots</span>
             $h(t)$ is a sum of two decaying exponentials. $a_1>0$ and $a_0>0$ keep both roots negative:
             stable.</div>`
        : rt.kind==='repeat'
        ? `<div class="note warn"><span class="note-h">A repeated root</span>
             The two roots coincide, so $h(t)$ needs a term in $t\\,e^{-\\lambda t}$ besides the plain
             exponential. $a_1>0$ and $a_0>0$ still keep it stable.</div>`
        : `<div class="note ok"><span class="note-h">A complex-conjugate pair</span>
             $h(t)$ is a decaying cosine and sine at the pair's imaginary part. $a_1>0$ and $a_0>0$ keep
             the real part negative: stable.</div>`;

      const pf = rt.kind==='real'
        ? T(`H(j\\omega)=\\dfrac{A}{j\\omega-(${N4(rt.r1,3)})}+\\dfrac{B}{j\\omega-(${N4(rt.r2,3)})},\\quad A=${N4(hh.A,4)},\\ B=${N4(hh.B,4)}`,true)
        : rt.kind==='repeat'
        ? T(`H(j\\omega)=\\dfrac{C}{j\\omega-(${N4(rt.r,3)})}+\\dfrac{D}{(j\\omega-(${N4(rt.r,3)}))^2},\\quad C=${N4(hh.C,4)},\\ D=${N4(hh.D,4)}`,true)
        : T(`h(t)=e^{${N4(rt.re,3)}t}\\left(${N4(b1,4)}\\cos(${N4(rt.im,3)}t)+${N4(hh.Bc,4)}\\sin(${N4(rt.im,3)}t)\\right)u(t)`,true);
      const pfLabel = rt.kind==='real' ? 'Partial fractions' : rt.kind==='repeat' ? 'Repeated-root form' : 'Oscillating form';

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Frequency response</span>${T(`H(j\\omega)=\\dfrac{${N4(b1,2)}\\,j\\omega+${N4(b0,2)}}{(j\\omega)^2+${N4(a1,2)}\\,j\\omega+${N4(a0,2)}}`,true)}</div>`
        + `<div class="eq"><span class="eq-label">${pfLabel}</span>${pf}</div>`
        + caseNote);

      root.querySelector('[data-v=a1]').value=a1; root.querySelector('[data-out=a1]').textContent=N4(a1,2);
      root.querySelector('[data-v=a0]').value=a0; root.querySelector('[data-out=a0]').textContent=N4(a0,2);
      root.querySelector('[data-v=b0]').value=b0; root.querySelector('[data-out=b0]').textContent=N4(b0,2);
      root.querySelectorAll('[data-seg="b1"]').forEach(bt=>bt.setAttribute('aria-pressed',String(+bt.dataset.val===b1)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="ctrls">
              <div class="ctrl"><label>$a_1$ <span class="val" data-out="a1">4</span></label>
                <input type="range" data-v="a1" min="0.2" max="6" step="0.1" value="4"></div>
              <div class="ctrl"><label>$a_0$ <span class="val" data-out="a0">3</span></label>
                <input type="range" data-v="a0" min="0.25" max="9" step="0.05" value="3"></div>
              <div class="ctrl"><label>$b_0$ <span class="val" data-out="b0">2</span></label>
                <input type="range" data-v="b0" min="0" max="4" step="0.1" value="2"></div>
              <div class="ctrl"><label>$b_1$ <span class="seg">
                <button data-seg="b1" data-val="0">0</button><button data-seg="b1" data-val="1">1</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='a1') a1=v; else if(k==='a0') a0=v; else if(k==='b0') b0=v;
        draw(root); });
      root.addEventListener('click', e=>{ const bt=e.target.closest('[data-seg="b1"]'); if(!bt) return;
        b1=+bt.dataset.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { X, Y };
})());
