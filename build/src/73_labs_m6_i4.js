/* ==========================================================================
   Laboratory 6.4 (key I4) — Module 6  [Source: 72–73]
   One operation, one spectral rule, for sequences. One operation acts on the
   base sequence x[n] = (0.7)^n u[n]; the laboratory draws the sequence before
   and after, and the magnitude and phase of the transform before and after,
   each over three periods of 2*pi with the period marked. Every displayed
   number is computed from the definitions at interaction time.
   Styled like build/src/72_labs_m5b.js (Laboratory W): legends inside
   .plot-wrap, computed equations as tabbed .eq cards, notes as tabbed cards,
   no bare inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const PI = Math.PI;
  /* a readout value: a rounding residue is printed as 0, not as 1e-17 */
  const N4 = (v,d=4)=> fmt(Math.abs(v)<5e-9 ? 0 : v, d);
  const L = (c,l,dash)=>`<i class="lg-${c}${dash?' lg-dash':''}">${T(l,false)}</i>`;

  /* ---------- frequency axis in multiples of pi ---------- */
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
  /* the phase crosses the tick row, so the phase panel labels only +-pi */
  const wPi = v => Math.abs(Math.abs(v)-PI) < 1e-9 ? piTick(v) : '';
  const WLO = -3*PI, WHI = 3*PI;
  /* the period markers of every spectrum panel: dashed lines at the odd
     multiples of pi and a bracket over one period, named to its left */
  function period(a, top){
    for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }
  const wrapPh = v => v - 2*PI*Math.round(v/(2*PI));

  /* =======================================================================
     I4 · ONE OPERATION, ONE SPECTRAL RULE            [Source: 72–73]
     Base sequence x[n] = (0.7)^n u[n], X(e^{jw}) = 1/(1 - 0.7 e^{-jw}).
     ======================================================================= */
  const I4 = (() => {
    const A = 0.7;
    const C0 = {re:0, im:0};
    const mul = (p,q)=>({re:p.re*q.re-p.im*q.im, im:p.re*q.im+p.im*q.re});
    const ex = th=>({re:Math.cos(th), im:Math.sin(th)});                 /* e^{j th} */
    const xb = n=> n>=0 ? Math.pow(A,n) : 0;
    const Xb = w=>{ const d=1-2*A*Math.cos(w)+A*A; return {re:(1-A*Math.cos(w))/d, im:-A*Math.sin(w)/d}; };
    /* signed pieces of TeX: n - 2, n + 3, e^{-j2w}, e^{j3w} */
    const idx = p => p===0 ? 'n' : (p>0 ? 'n-'+p : 'n+'+(-p));
    const eexp = p => p===0 ? '' : 'e^{'+(p>0?'-':'')+'j'+(Math.abs(p)===1?'':Math.abs(p))+'\\omega}';
    const w0tex = p => { const m=Math.abs(p); return (m===1?'':N4(m,3))+'\\pi'; };

    const ops = {
      shift:{ name:'Time shift', label:'time shift',
        par:{min:-4,max:4,step:1,val:2,label:'Shift $n_0$'},
        x:(n,p)=>({re:xb(n-p), im:0}),
        X:(w,p)=>mul(Xb(w), ex(-w*p)),
        rule:p=>`x[${idx(p)}]\\ \\longleftrightarrow\\ ${eexp(p)}X(e^{j\\omega})`,
        what:()=>'The magnitude does not change. The phase gains the straight line $-\\omega n_0$, wrapped into $(-\\pi,\\pi]$.' },
      freq:{ name:'Frequency shift', label:'frequency shift',
        par:{min:-1,max:1,step:0.125,val:0.5,label:'Shift $\\omega_0/\\pi$'},
        x:(n,p)=>mul({re:xb(n),im:0}, ex(p*PI*n)),
        X:(w,p)=>Xb(w-p*PI),
        rule:p=> p===0 ? 'x[n]\\ \\longleftrightarrow\\ X(e^{j\\omega})'
          : `e^{${p<0?'-':''}j${w0tex(p)}\\,n}x[n]\\ \\longleftrightarrow\\ X\\bigl(e^{j(\\omega${p<0?'+':'-'}${w0tex(p)})}\\bigr)`,
        what:()=>'Every copy of the spectrum slides by $\\omega_0$. A peak pushed past $\\pi$ comes back in at $-\\pi$. The sequence is complex, so its real part is drawn.' },
      rev:{ name:'Time reversal', label:'reversal',
        par:{min:1,max:1,step:1,val:1,label:'No parameter'},
        x:(n)=>({re:xb(-n), im:0}),
        X:(w)=>Xb(-w),
        rule:()=>'x[-n]\\ \\longleftrightarrow\\ X(e^{-j\\omega})',
        what:()=>'For this real sequence $|X|$ is even, so the magnitude does not change. The phase changes sign.' },
      conj:{ name:'Conjugation', label:'conjugation',
        par:{min:1,max:1,step:1,val:1,label:'No parameter'},
        x:(n)=>({re:xb(n), im:0}),
        X:(w)=>{ const X=Xb(-w); return {re:X.re, im:-X.im}; },
        rule:()=>'x^{*}[n]\\ \\longleftrightarrow\\ X^{*}(e^{-j\\omega})',
        what:()=>'This sequence is real, so $x^{*}[n]=x[n]$ and nothing changes. $X^{*}(e^{-j\\omega})=X(e^{j\\omega})$ is conjugate symmetry.' },
      expand:{ name:'Time expansion', label:'expansion',
        par:{min:1,max:4,step:1,val:2,label:'Factor $k$'},
        x:(n,p)=> (n%p===0) ? {re:xb(n/p), im:0} : C0,
        X:(w,p)=>Xb(p*w),
        rule:p=> p===1 ? 'x[n]\\ \\longleftrightarrow\\ X(e^{j\\omega})' : `x_{(${p})}[n]\\ \\longleftrightarrow\\ X(e^{j${p}\\omega})`,
        what:p=> p===1 ? 'With $k=1$ nothing is inserted, so nothing changes.'
          : `The spectrum now repeats every $2\\pi/${p}$, so one period of $2\\pi$ holds ${p} copies. The height and the energy do not change.` },
      diff:{ name:'First difference', label:'difference',
        par:{min:1,max:1,step:1,val:1,label:'No parameter'},
        x:(n)=>({re:xb(n)-xb(n-1), im:0}),
        X:(w)=>mul({re:1-Math.cos(w), im:Math.sin(w)}, Xb(w)),
        rule:()=>'x[n]-x[n-1]\\ \\longleftrightarrow\\ \\bigl(1-e^{-j\\omega}\\bigr)X(e^{j\\omega})',
        what:()=>'$|1-e^{-j\\omega}|$ is $0$ at $\\omega=0$ and $2$ at $\\omega=\\pm\\pi$. The average is removed and the fast part lifted.' }
    };
    let key='shift', par=ops.shift.par.val;

    /* Parseval, one number from each domain: the sum of |x[n]|^2, and
       (1/2pi) times the integral of |X|^2 over one period (Simpson) */
    function timeEnergy(xf){ let s=0; for(let n=-400;n<=400;n++){ const v=xf(n); s+=v.re*v.re+v.im*v.im; } return s; }
    function freqEnergy(Xf, n=4000){
      const h=2*PI/n; let s=0;
      for(let i=0;i<=n;i++){ const X=Xf(-PI+i*h), m2=X.re*X.re+X.im*X.im;
        s+=((i===0||i===n)?1:(i%2?4:2))*m2; }
      return (s*h/3)/(2*PI);
    }

    function draw(root){
      const o = ops[key], p = par;
      const xa = n=>o.x(n,p), Xa = w=>o.X(w,p);
      const C = PLOT.COL;

      /* panel 1 - the sequence before (faint) and after */
      let lo=0, hi=1;
      for(let n=-10;n<=16;n++){ const v=xa(n).re; lo=Math.min(lo,v); hi=Math.max(hi,v); }
      const A1 = PLOT.Axes({w:760,h:150,xr:[-10.5,16.5],yr:[Math.min(-0.3,lo-0.2),hi+0.3],xlabel:'n',
        pad:{l:52,r:24,t:12,b:26},xtarget:9,ytarget:3,yticksLeft:true});
      const st = []; for(let n=-10;n<=16;n++) st.push([n, xb(n)]);
      const sa = []; for(let n=-10;n<=16;n++) sa.push([n, xa(n).re]);
      A1.raw('<g opacity=".45">'); A1.stem(st,{color:C.in}); A1.raw('</g>');
      A1.stem(sa,{color:C.out});

      /* panel 2 - |X| before (dashed) and after, over three periods */
      const mB = w=>{ const X=Xb(w); return Math.hypot(X.re,X.im); };
      const mA = w=>{ const X=Xa(w); return Math.hypot(X.re,X.im); };
      let peakA=0; for(let i=0;i<=2400;i++){ const w=-PI+2*PI*i/2400; peakA=Math.max(peakA, mA(w)); }
      const top = 1.5*Math.max(1/(1-A), peakA);
      const A2 = PLOT.Axes({w:760,h:150,xr:[WLO,WHI],yr:[-0.08*top,top],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
        pad:{l:56,r:24,t:12,b:28},xticksOverride:wTicks(WLO,WHI,PI),xtickfmt:piTick,ytarget:3,yticksLeft:true});
      A2.curve(mB,{color:C.in,n:3000,dash:'9 6',opacity:.75});
      A2.curve(mA,{color:C.out,n:6000});
      period(A2, 0.86*top);

      /* panel 3 - phase before (dashed) and after, wrapped to (-pi, pi] */
      const ph = f=>w=>{ const X=f(w); return Math.hypot(X.re,X.im)<1e-9 ? NaN : wrapPh(Math.atan2(X.im,X.re)); };
      const A3 = PLOT.Axes({w:760,h:150,xr:[WLO,WHI],yr:[-3.9,5.6],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;(\\text{rad})',
        pad:{l:60,r:24,t:12,b:28},xticksOverride:wTicks(WLO,WHI,PI),xtickfmt:wPi,yticksOverride:[-PI,0,PI],ytickfmt:piTick,yticksLeft:true});
      A3.curve(ph(Xb),{color:C.in,n:3000,dash:'9 6',opacity:.75});
      A3.curve(ph(Xa),{color:C.out,n:6000});
      period(A3, 4.5);

      const after = key==='freq' ? '\\operatorname{Re}\\{\\text{after}\\}' : '\\text{after}';
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]=(0.7)^{n}u[n]')}${L('out',after)}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{before}',true)}${L('out','\\text{after}')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{before}',true)}${L('out','\\text{after}')}</div></div>`;

      /* readouts: the value at omega = 0, the peak, and the energy counted
         once in each domain */
      const X0 = Xa(0);
      const Et = timeEnergy(xa), Ef = freqEnergy(Xa);
      const cplx = z => N4(z.re,4) + (Math.abs(z.im)<5e-9 ? '' : (z.im>=0?' + ':' \u2212 ')+N4(Math.abs(z.im),4)+'j');
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$X(e^{j0})$</dt><dd class="okv">${cplx(X0)}</dd></div>
        <div><dt>Peak $|X|$</dt><dd>${N4(peakA,4)}</dd></div>
        <div><dt>Energy, $n$</dt><dd>${N4(Et,4)}</dd></div>
        <div><dt>Energy, $\\omega$</dt><dd>${N4(Ef,4)}</dd></div>`);

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">${o.name}</span>${T(o.rule(p),true)}</div>`
        + `<div class="note warn"><span class="note-h">What changed</span>${o.what(p)}</div>`
        + `<div class="note ok"><span class="note-h">Parseval</span>$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}|X(e^{j\\omega})|^{2}\\,d\\omega$.
             The two energy readouts, one from each domain, agree.</div>`);

      const sl = root.querySelector('[data-v=par]');
      sl.min=o.par.min; sl.max=o.par.max; sl.step=o.par.step; sl.value=par; sl.disabled = o.par.min===o.par.max;
      root.querySelector('.parlabel').innerHTML = M(o.par.label);
      root.querySelector('[data-out=par]').textContent = o.par.min===o.par.max ? '\u2014' : N4(par,3);
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
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">2</span></label>
                <input type="range" data-v="par" min="-4" max="4" step="1" value="2"></div>
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

  return { I4 };
})());
