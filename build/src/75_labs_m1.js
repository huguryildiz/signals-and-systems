/* ==========================================================================
   Laboratories K and L — Module 1, sections 1.4 and 1.5  [Source: 5–7]
   Every displayed number is computed from the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;

  /* the argument of a shifted signal: t, t-1.5, t+2 */
  const sh = (v,s)=> s===0 ? v : s>0 ? `${v}-${fmt(s)}` : `${v}+${fmt(-s)}`;
  const N = (v,d=3)=> fmt(v,d);
  /* a negative term inside a bracket is parenthesised */
  const P = v=> v<0 ? `(${N(v)})` : N(v);
  /* LABS.KIT.T typesets without the page macros, so the even and odd
     operators are written out */
  const EV = '\\mathcal{E}\\mathrm{v}', OD = '\\mathcal{O}\\mathrm{dd}';

  /* =======================================================================
     K · EVEN AND ODD PARTS                          [Source: 5–6]
     x(t) = x0(t − s). The even and odd parts are built from x(t) and x(−t)
     by their definitions; the verdict is read from the parts on a grid.
     ======================================================================= */
  const K = (() => {
    const protos = {
      exp:  { name:'Decaying exponential', btn:'exponential', yr:[-0.75,1.25],
              f:t=> t>=0 ? Math.exp(-t/2) : 0,
              tex:(v,s,dt)=> { const a=sh(v,s), b=dt?['[',']']:['(',')'];
                return (s===0?`e^{-${v}/2}`:`e^{-(${a})/2}`)+`\\,u${b[0]}${a}${b[1]}`; } },
      pulse:{ name:'Pulse of length 2', btn:'pulse', yr:[-0.75,1.25],
              f:t=> (t>=0 && t<2) ? 1 : 0,
              tex:(v,s,dt)=> { const b=dt?['[',']']:['(',')'];
                return `u${b[0]}${sh(v,s)}${b[1]}-u${b[0]}${sh(v,s+2)}${b[1]}`; } },
      cos:  { name:'Cosine of period 8', btn:'cosine', yr:[-1.25,1.25],
              f:t=> Math.cos(Math.PI*t/4),
              tex:(v,s)=> s===0 ? `\\cos\\!\\left(\\tfrac{\\pi}{4}${v}\\right)`
                                : `\\cos\\!\\left(\\tfrac{\\pi}{4}(${sh(v,s)})\\right)` }
    };
    let st = { proto:'exp', s:0, dt:false };
    function draw(root){
      const Pr = protos[st.proto], dt = st.dt;
      if(dt) st.s = Math.round(st.s);
      const s = st.s, v = dt?'n':'t';
      const x  = t=> Pr.f(t-s);
      /* a rounding residue such as 5e-17 is reported as the zero it is */
      const z = w=> Math.abs(w)<1e-9 ? 0 : w;
      const ev = t=> z(0.5*(x(t)+x(-t))), od = t=> z(0.5*(x(t)-x(-t)));
      /* The grid is offset from the half-integers so that no sample lands on a
         jump, where the value of a step is a convention and not a property. */
      let mE=0, mO=0;
      if(dt){ for(let n=-40;n<=40;n++){ mE=Math.max(mE,Math.abs(ev(n))); mO=Math.max(mO,Math.abs(od(n))); } }
      else  { for(let t=-40.0037;t<=40;t+=0.01){ mE=Math.max(mE,Math.abs(ev(t))); mO=Math.max(mO,Math.abs(od(t))); } }
      const kind = mO<1e-9 ? 'even' : mE<1e-9 ? 'odd' : 'neither';
      const xr=[-6,6];
      const ax = o=> PLOT.Axes(Object.assign({w:640,h:160,xr,yr:Pr.yr,xlabel:v,ylabel:'\\text{amplitude}',
        pad:{l:46,r:24,t:16,b:34},xtarget:7,ytarget:3},o));
      const disc = f=>{ const p=[]; for(let n=xr[0];n<=xr[1];n++) p.push([n,f(n)]); return p; };
      const A1=ax({}), A2=ax({});
      if(dt){ A1.stem(disc(n=>x(-n)),{color:PLOT.COL.h,r:3}); A1.stem(disc(x),{color:PLOT.COL.in});
              A2.stem(disc(ev),{color:PLOT.COL.out}); A2.stem(disc(od),{color:PLOT.COL.mid,r:3}); }
      else  { /* 1201 points keep every sample off the jumps at multiples of 0.5 */
              A1.curve(t=>x(-t),{color:PLOT.COL.h,dash:'5 5',n:1201}); A1.curve(x,{color:PLOT.COL.in,n:1201});
              A2.curve(ev,{color:PLOT.COL.out,n:1201}); A2.curve(od,{color:PLOT.COL.mid,n:1201}); }
      A1.vline(0,{color:PLOT.COL.coral,dash:'4 4'}); A2.vline(0,{color:PLOT.COL.coral,dash:'4 4'});
      const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
      root.querySelector('.plots').innerHTML =
        A1.svg() + `<div class="legend">${L('in',dt?'x[n]':'x(t)')}${L('h',dt?'x[-n]':'x(-t)')}</div>`
      + A2.svg() + `<div class="legend">${L('out',`${EV}\\{x\\}`)}${L('mid',`${OD}\\{x\\}`)}</div>`;
      root.querySelector('.lab-eq').innerHTML =
        T(dt ? `x[n]=${Pr.tex('n',s,true)}` : `x(t)=${Pr.tex('t',s,false)}`, true);
      /* the check is made at one point away from every jump */
      const p = dt ? 1 : 1.25, a=x(p), b=x(-p), A=dt?`[${p}]`:`(${p})`, B=dt?`[-${p}]`:`(-${p})`;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Even peak</dt><dd>${fmt(mE,3)}</dd></div>
        <div><dt>Odd peak</dt><dd>${fmt(mO,3)}</dd></div>
        <div><dt>Symmetry</dt><dd class="${kind==='neither'?'':'okv'}">${kind}</dd></div>`;
      root.querySelector('.derive').innerHTML = M(`
        <div class="eq"><span class="eq-label">Even part at ${v} = ${p}</span>${
          T(`${EV}\\{x\\}${A}=\\tfrac12\\big[x${A}+x${B}\\big]=\\tfrac12\\big[${N(a)}+${P(b)}\\big]=${N(ev(p))}`,true)}</div>
        <div class="eq"><span class="eq-label">Odd part at ${v} = ${p}</span>${
          T(`${OD}\\{x\\}${A}=\\tfrac12\\big[x${A}-x${B}\\big]=\\tfrac12\\big[${N(a)}-${P(b)}\\big]=${N(od(p))}`,true)}</div>
        <div class="note ok"><span class="note-h">Verdict</span>${
          kind==='even' ? 'The odd part is zero at every $' + v + '$, so $x$ is even.'
          : kind==='odd' ? 'The even part is zero at every $' + v + '$, so $x$ is odd.'
          : 'Both parts are non-zero, so $x$ is neither even nor odd. Their sum still returns $x$.'}</div>`);
      const sl = root.querySelector('[data-v=s]'); sl.step = dt?1:0.5; sl.value = s;
      root.querySelector('[data-out=s]').textContent = fmt(s);
      root.querySelectorAll('[data-seg]').forEach(bt=> bt.setAttribute('aria-pressed', String(
        bt.dataset.seg==='dom' ? (bt.dataset.val==='dt')===dt : bt.dataset.val===st.proto)));
    }
    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:44px">
          <div class="col stack"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div>
            <div class="note warn"><span class="note-h">Symmetry is about the origin</span>
              A shift moves the signal but not the axis $t=0$, so it changes both parts.
              In continuous time, find the shift that makes the pulse even and the one that makes the cosine odd.</div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal
                <span class="seg">${Object.entries(protos).map(([k,p])=>
                  `<button data-seg="proto" data-val="${k}">${p.btn}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Domain
                <span class="seg"><button data-seg="dom" data-val="ct">continuous</button><button data-seg="dom" data-val="dt">discrete</button></span></label></div>
              <div class="ctrl"><label>Shift <span class="val" data-out="s">0</span></label>
                <input type="range" data-v="s" min="-4" max="4" step="0.5" value="0"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v!=='s') return;
        st.s=parseFloat(e.target.value); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        if(b.dataset.seg==='dom') st.dt = b.dataset.val==='dt'; else st.proto = b.dataset.val;
        draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     L · SIFTING WITH A NARROWING PULSE              [Source: 6–7]
     δε(t) has width ε and height 1/ε. Its integral against x(t − t0) is the
     average of x over the window, which tends to x(t0) as ε → 0. In discrete
     time the impulse is an ordinary sequence and the sum is exact.
     ======================================================================= */
  const L = (() => {
    const protos = {
      wave:{ tex:v=>`1+0.6\\cos(1.5${v})`, f:t=> 1+0.6*Math.cos(1.5*t), yr:[-0.2,1.9] },
      para:{ tex:v=>`\\tfrac14${v}^{2}`, f:t=> t*t/4, yr:[-0.4,4.4] }
    };
    let st = { proto:'wave', t0:0, eps:2, dt:false };
    /* Simpson's rule on the window; x is smooth there, so 400 panels are
       accurate far beyond the three decimals shown. */
    const avg = (f,t0,e)=>{ const n=400, a=t0-e/2, d=e/n; let s=0;
      for(let i=0;i<=n;i++) s += (i===0||i===n?1:(i%2?4:2))*f(a+i*d);
      return s*d/3/e; };
    function draw(root){
      const Pr = protos[st.proto], dt = st.dt, f = Pr.f;
      if(dt) st.t0 = Math.round(st.t0);
      const t0 = st.t0, e = st.eps, xr=[-4,4];
      const ax = o=> PLOT.Axes(Object.assign({w:640,h:160,xr,pad:{l:52,r:24,t:16,b:34},xtarget:9,ytarget:3},o));
      const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
      let html;
      if(dt){
        const disc = g=>{ const p=[]; for(let n=xr[0];n<=xr[1];n++) p.push([n,g(n)]); return p; };
        const A1 = ax({yr:Pr.yr,xlabel:'n',ylabel:'x[n]'});
        A1.stem(disc(f),{color:PLOT.COL.in}); A1.vline(t0,{color:PLOT.COL.coral,dash:'4 4'});
        const A2 = ax({yr:Pr.yr,xlabel:'n',ylabel:`x[n]\\delta[${sh('n',t0)}]`,ynameAtAxis:true});
        A2.stem(disc(n=> n===t0 ? f(n) : 0),{color:PLOT.COL.out});
        html = A1.svg() + `<div class="legend">${L('in','x[n]')}</div>`
             + A2.svg() + `<div class="legend">${L('out',`x[n]\\,\\delta[${sh('n',t0)}]`)}</div>`;
      } else {
        const I = avg(f,t0,e);
        const A1 = ax({yr:Pr.yr,xlabel:'t',ylabel:'x(t)'});
        A1.area(f, t0-e/2, t0+e/2, {color:'rgba(214,106,76,.22)'});
        A1.curve(f,{color:PLOT.COL.in});
        A1.poly([[t0-e/2,I],[t0+e/2,I]],{color:PLOT.COL.out,width:2.6});
        A1.point(t0,f(t0),{color:PLOT.COL.coral});
        /* the second panel is the sifting integral as a function of the width */
        const es=[]; for(let i=0;i<=120;i++) es.push(0.1+3.9*i/120);
        const Is = es.map(w=>avg(f,t0,w));
        let lo=Math.min(f(t0),...Is), hi=Math.max(f(t0),...Is), m=Math.max(0.12,(hi-lo)*0.2);
        const A2 = ax({xr:[0,4.1],yr:[lo-m,hi+m],xlabel:'\\varepsilon',ylabel:'\\text{integral}',xtarget:7,ytarget:3});
        A2.hline(f(t0),{color:PLOT.COL.coral,dash:'5 4',opacity:1});
        A2.poly(es.map((w,i)=>[w,Is[i]]),{color:PLOT.COL.out});
        A2.point(e,I,{color:PLOT.COL.out});
        html = A1.svg() + `<div class="legend">${L('in','x(t)')}${L('out','\\text{window average}')}</div>`
             + A2.svg() + `<div class="legend">${L('out','\\textstyle\\int x(t)\\,\\delta_\\varepsilon(t-t_0)\\,\\mathrm{d}t')}${L('err','x(t_0)')}</div>`;
      }
      root.querySelector('.plots').innerHTML = html;
      root.querySelector('.lab-eq').innerHTML = T(dt ? `x[n]=${Pr.tex('n')}` : `x(t)=${Pr.tex('t')}`, true);
      const x0 = f(t0);
      if(dt){
        root.querySelector('.ro').innerHTML = `
          <div><dt>Position</dt><dd>${t0}</dd></div>
          <div><dt>Sum</dt><dd>${fmt(x0,4)}</dd></div>
          <div><dt>Sample value</dt><dd>${fmt(x0,4)}</dd></div>
          <div><dt>Error</dt><dd class="okv">0 exactly</dd></div>`;
        root.querySelector('.derive').innerHTML = M(`
          <div class="eq"><span class="eq-label">Sifting</span>${
            T(`\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[${sh('n',t0)}]=x[${t0}]=${N(x0,4)}`,true)}</div>`);
        root.querySelector('.aper').innerHTML = M(`
          <div class="note ok"><span class="note-h">No limit is needed</span>
            $\\delta[n]$ is an ordinary sequence. The product keeps one sample and the sum returns it exactly.
            The width control has no role here.</div>`);
      } else {
        const I = avg(f,t0,e);
        root.querySelector('.ro').innerHTML = `
          <div><dt>Pulse height</dt><dd>${fmt(1/e,3)}</dd></div>
          <div><dt>Integral</dt><dd>${fmt(I,4)}</dd></div>
          <div><dt>Signal value</dt><dd>${fmt(x0,4)}</dd></div>
          <div><dt>Error</dt><dd class="${Math.abs(I-x0)<5e-3?'okv':''}">${fmt(I-x0,4)}</dd></div>`;
        root.querySelector('.derive').innerHTML = M(`
          <div class="eq"><span class="eq-label">Sifting with a unit-area pulse</span>${
            T(`\\int_{-\\infty}^{\\infty}x(t)\\,\\delta_\\varepsilon(t-t_0)\\,\\mathrm{d}t=\\frac{1}{${fmt(e)}}\\int_{${N(t0-e/2)}}^{${N(t0+e/2)}}x(t)\\,\\mathrm{d}t=${N(I,4)}`,true)}</div>`);
        root.querySelector('.aper').innerHTML = M(`
          <div class="note ok"><span class="note-h">The limit</span>
            The integral is the average of $x$ over the window. Because $x$ is continuous at $t_0$, it tends to
            $x(t_0)=${N(x0,4)}$ as $\\varepsilon\\to0$.</div>`);
      }
      root.querySelectorAll('[data-v]').forEach(sl=>{ const k=sl.dataset.v;
        if(k==='t0') sl.step = dt?1:0.25;
        if(k==='eps') sl.disabled = dt;
        sl.value = st[k];
        root.querySelector(`[data-out="${k}"]`).textContent = fmt(st[k]); });
      root.querySelector('[data-lbl=t0]').innerHTML = M(dt ? 'Position $n_0$' : 'Position $t_0$');
      root.querySelectorAll('[data-seg]').forEach(bt=> bt.setAttribute('aria-pressed', String(
        bt.dataset.seg==='dom' ? (bt.dataset.val==='dt')===dt : bt.dataset.val===st.proto)));
    }
    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:44px">
          <div class="col stack"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div>
            <div class="aper stack"></div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal
                <span class="seg"><button data-seg="proto" data-val="wave">cosine</button><button data-seg="proto" data-val="para">parabola</button></span></label></div>
              <div class="ctrl"><label>Domain
                <span class="seg"><button data-seg="dom" data-val="ct">continuous</button><button data-seg="dom" data-val="dt">discrete</button></span></label></div>
              <div class="ctrl"><label><span data-lbl="t0"></span> <span class="val" data-out="t0">0</span></label>
                <input type="range" data-v="t0" min="-3" max="3" step="0.25" value="0"></div>
              <div class="ctrl"><label><span>Pulse width $\\varepsilon$</span> <span class="val" data-out="eps">2</span></label>
                <input type="range" data-v="eps" min="0.1" max="4" step="0.1" value="2"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k]=parseFloat(e.target.value); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        if(b.dataset.seg==='dom') st.dt = b.dataset.val==='dt'; else st.proto = b.dataset.val;
        draw(root); });
      draw(root);
    }};
  })();

  return { K, L };
})());
