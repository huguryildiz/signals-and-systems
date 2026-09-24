/* ==========================================================================
   Laboratory 6.6 (key I6) — Module 6  [Source: 77–79]
   A second-order difference equation set by its two factors,
       y[n] - (p1+p2) y[n-1] + p1 p2 y[n-2] = 2 x[n],
   so that H(e^{jw}) = 2 / ((1 - p1 e^{-jw})(1 - p2 e^{-jw})), driven by
   x[n] = c^n u[n] (c = 0 is the unit sample). Every displayed number is
   computed from the definitions at interaction time: the plotted sequences
   by running the recursion, the closed forms by partial fractions in
   z = e^{-jw}, which is only a name for the algebra.
   Styled like build/src/72_labs_m5c.js: legends inside .plot-wrap, computed
   equations as tabbed .eq cards, notes as tabbed cards, no bare inline pixel
   font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* a frequency axis is read in multiples of pi */
  const piTick = v => {
    const r = v/PI;
    if(Math.abs(r) < 1e-9) return '0';
    const k = Math.round(r);
    if(Math.abs(r-k) < 1e-7){ const m=Math.abs(k), sg=k<0?'-':''; return sg+(m===1?'π':m+'π'); }
    return PLOT.fmt(v,2);
  };
  const wTicks = (lo,hi,step) => { const o=[];
    for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };
  /* every spectrum is drawn over three periods, and one period is marked */
  function period(a, top){
    for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }

  /* =======================================================================
     I6 · A DIFFERENCE EQUATION AND ITS RESPONSE      [Source: 77–79]
     ======================================================================= */
  const I6 = (() => {
    const B0 = 2, NMAX = 20;
    const inputs = [
      { k:'d', c:0,    tex:'\\delta[n]' },
      { k:'q', c:0.25, tex:'(0.25)^{n}u[n]' },
      { k:'h', c:0.5,  tex:'(0.5)^{n}u[n]' },
      { k:'m', c:-0.5, tex:'(-0.5)^{n}u[n]' } ];
    /* the default is the worked example of the section: factors 1/2 and 1/4,
       input (1/4)^n u[n], which shares a factor with the system */
    let p1=0.5, p2=0.25, ik='q';
    const snap = v => Math.round(v*100)/100;
    const same = (u,v) => Math.abs(u-v) < 1e-9;

    /* the non-zero factors, grouped by value with their multiplicity */
    function groups(list){
      const g=[];
      list.forEach(p=>{ if(Math.abs(p)<1e-9) return;
        const e=g.find(q=>same(q.p,p)); if(e) e.m++; else g.push({p, m:1}); });
      return g;
    }
    /* polynomials in z, coefficients in ascending powers */
    const pmul = (a,b)=>{ const o=new Array(a.length+b.length-1).fill(0);
      a.forEach((x,i)=>b.forEach((y,j)=>{ o[i+j]+=x*y; })); return o; };
    const ppow = (a,m)=>{ let o=[1]; for(let i=0;i<m;i++) o=pmul(o,a); return o; };
    /* partial fractions of B0 / prod (1 - p z)^m: one coefficient for each
       1/(1 - p z)^k, found by matching the powers of z after multiplying
       through by the denominator */
    function partial(g){
      const Mt = g.reduce((s,q)=>s+q.m,0);
      if(!Mt) return [];
      const cols=[], terms=[];
      g.forEach((q,qi)=>{ for(let k=1;k<=q.m;k++){
        let poly = ppow([1,-q.p], q.m-k);
        g.forEach((r,ri)=>{ if(ri!==qi) poly=pmul(poly, ppow([1,-r.p], r.m)); });
        const col=new Array(Mt).fill(0); poly.forEach((c,i)=>{ if(i<Mt) col[i]=c; });
        cols.push(col); terms.push({p:q.p, k}); } });
      const A=[...Array(Mt)].map((_,i)=>cols.map(c=>c[i]).concat([i===0?B0:0]));
      for(let c=0;c<Mt;c++){
        let piv=c; for(let r=c+1;r<Mt;r++) if(Math.abs(A[r][c])>Math.abs(A[piv][c])) piv=r;
        [A[c],A[piv]]=[A[piv],A[c]];
        for(let r=0;r<Mt;r++){ if(r===c) continue; const f=A[r][c]/A[c][c];
          for(let j=c;j<=Mt;j++) A[r][j]-=f*A[c][j]; } }
      return terms.map((t,i)=>Object.assign(t,{A:A[i][Mt]/A[i][i]}));
    }
    /* the pair for 1/(1 - p z)^k is C(n+k-1, k-1) p^n u[n] */
    const facTex = k => k===1 ? '' : k===2 ? '(n+1)' : '\\tfrac{(n+1)(n+2)}{2}';
    function closed(terms, name){
      if(!terms.length) return `${name}=${B0}\\,\\delta[n]`;
      const parts = terms.map((t,i)=>{
        const s = t.A<0 ? '-' : (i ? '+' : '');
        return `${s}${N4(Math.abs(t.A),4)}${facTex(t.k)}(${N4(t.p,2)})^{n}`; });
      return `${name}=\\bigl[${parts.join('')}\\bigr]u[n]`;
    }
    /* the recursion itself, run forward from rest */
    function run(x){
      const y=[];
      for(let n=0;n<=NMAX;n++) y[n]=(p1+p2)*(n>0?y[n-1]:0) - p1*p2*(n>1?y[n-2]:0) + B0*x(n);
      return y;
    }
    const mag1 = (w,p)=>Math.sqrt(1-2*p*Math.cos(w)+p*p);
    const Hm = w => B0/(mag1(w,p1)*mag1(w,p2));
    const factorTex = p => Math.abs(p)<1e-9 ? '' :
      `\\bigl(1${p<0?'+':'-'}${N4(Math.abs(p),2)}e^{-j\\omega}\\bigr)`;
    const range = vs => { const lo=Math.min(0,...vs), hi=Math.max(0.05,...vs), d=hi-lo;
      return [lo-0.12*d, hi+0.22*d]; };

    function draw(root){
      const inp = inputs.find(o=>o.k===ik), c = inp.c;
      const xs = n => c===0 ? (n===0?1:0) : Math.pow(c,n);
      const h = run(n=>n===0?1:0), y = run(xs);

      /* |H(e^{jw})| over three periods */
      const hv=[]; for(let i=0;i<=900;i++) hv.push(Hm(-PI+2*PI*i/900));
      const hmax = Math.max(...hv);
      const A1 = PLOT.Axes({w:760,h:190,xr:[-3*PI,3*PI],yr:[-0.08*hmax,1.4*hmax],
        xlabel:'\\omega',ylabel:'|H(e^{j\\omega})|',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,
        xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:2});
      A1.curve(Hm,{color:PLOT.COL.h,n:2400});
      period(A1,1.2*hmax);

      const A2 = PLOT.Axes({w:760,h:170,xr:[-2,NMAX],yr:range(h),
        xlabel:'n',ylabel:'h[n]',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,xtarget:8,ytarget:2});
      A2.stem([[-2,0],[-1,0]].concat(h.map((v,n)=>[n,v])),{color:PLOT.COL.h,showZero:true});

      const xv = [...Array(NMAX+1)].map((_,n)=>xs(n));
      const A3 = PLOT.Axes({w:760,h:190,xr:[-2,NMAX],yr:range(xv.concat(y)),
        xlabel:'n',ylabel:'x[n],\\;y[n]',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,xtarget:8,ytarget:2});
      A3.stem(xv.map((v,n)=>[n-0.2,v]),{color:PLOT.COL.in,r:3});
      A3.stem(y.map((v,n)=>[n+0.2,v]),{color:PLOT.COL.out,r:3});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('h','|H(e^{j\\omega})|')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('h','h[n]')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}${L('out','y[n]')}</div></div>`;

      const H0 = Hm(0), Hpi = Hm(PI), Y0 = H0/(1-c);
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$H(e^{j0})$</dt><dd class="okv">${N4(H0,4)}</dd></div>
        <div><dt>$|H(e^{j\\pi})|$</dt><dd>${N4(Hpi,4)}</dd></div>
        <div><dt>Largest $|p|$</dt><dd>${N4(Math.max(Math.abs(p1),Math.abs(p2)),2)}</dd></div>
        <div><dt>$\\sum_n y[n]$</dt><dd>${N4(Y0,4)}</dd></div>`);

      const fac = factorTex(p1)+factorTex(p2);
      const Htex = `H(e^{j\\omega})=${fac ? `${B0}\\big/\\bigl[${fac}\\bigr]` : B0}`;
      const hT = partial(groups([p1,p2])), yT = partial(groups([p1,p2,c]));
      const rep = !same(p1,0) && same(p1,p2), hit = c!==0 && (same(c,p1)||same(c,p2));
      const note =
          rep && hit ? `<div class="note warn"><span class="note-h">A cubed factor</span>
              $p_1=p_2$ and the input shares that factor, so $Y$ has it cubed. Its term uses the
              pair for a factor of order $3$, with $\\tfrac{(n+1)(n+2)}{2}$.</div>`
        : rep ? `<div class="note warn"><span class="note-h">A repeated factor</span>
              $p_1=p_2$, so $H$ has a squared factor and $h[n]$ needs the pair $(n+1)a^{n}u[n]$.</div>`
        : hit ? `<div class="note warn"><span class="note-h">The input shares a factor</span>
              $X$ and $H$ share $${factorTex(c)}$. The output gains a term in <span class="nowrap">$(n+1)(${N4(c,2)})^{n}$</span>.</div>`
        : (same(p1,0)&&same(p2,0)) ? `<div class="note ok"><span class="note-h">No factor</span>
              Both factors are $1$, so the system only scales: $h[n]=${B0}\\,\\delta[n]$.</div>`
        : (same(p1,0)!==same(p2,0)) ? `<div class="note ok"><span class="note-h">First order</span>
              One factor is $1$, so the recursion is first order and $h[n]$ is one exponential.</div>`
        : `<div class="note ok"><span class="note-h">Distinct factors</span>
              Each factor gives one exponential. Every $|p|<1$, so each term decays: the system is stable.</div>`;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Frequency response</span>${T(Htex,true)}</div>`
        + `<div class="eq"><span class="eq-label">Impulse response · partial fractions</span>${T(closed(hT,'h[n]'),true)}</div>`
        + `<div class="eq"><span class="eq-label">Output · $Y=HX$</span>${T(closed(yT,'y[n]'),true)}</div>`
        + note);

      root.querySelector('[data-v=p1]').value=p1; root.querySelector('[data-out=p1]').textContent=N4(p1,2);
      root.querySelector('[data-v=p2]').value=p2; root.querySelector('[data-out=p2]').textContent=N4(p2,2);
      root.querySelectorAll('[data-seg="in"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===ik)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="ctrls">
              <div class="ctrl"><label><span>Factor $p_1$</span> <span class="val" data-out="p1">0.5</span></label>
                <input type="range" data-v="p1" min="-0.9" max="0.9" step="0.05" value="0.5"></div>
              <div class="ctrl"><label><span>Factor $p_2$</span> <span class="val" data-out="p2">0.25</span></label>
                <input type="range" data-v="p2" min="-0.9" max="0.9" step="0.05" value="0.25"></div>
              <div class="ctrl"><label><span>Input $x[n]$</span> <span class="seg">
                ${inputs.map(o=>`<button data-seg="in" data-val="${o.k}">$${o.tex}$</button>`).join('')}</span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=snap(parseFloat(e.target.value));
        if(k==='p1') p1=v; else if(k==='p2') p2=v;
        draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg="in"]'); if(!b) return;
        ik=b.dataset.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { I6 };
})());
