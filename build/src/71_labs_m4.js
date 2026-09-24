/* ==========================================================================
   Laboratories 4.1–4.6 (keys F, G, P, Q, R, S) — Module 4
   Every displayed number is computed from the definitions at interaction time.
   Restyled to the slide card language of Module 3 (build/src/79_labs_m3.js):
   legends inside .plot-wrap, computed equations as tabbed .eq cards, notes as
   tabbed cards, no bare inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;

  /* complex helpers — the coefficients of this module are genuinely complex */
  const cx  = (re,im)=>({re:re,im:im});
  const cmul= (a,b)=>cx(a.re*b.re-a.im*b.im, a.re*b.im+a.im*b.re);
  const cdiv= (a,b)=>{ const d=b.re*b.re+b.im*b.im; return cx((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d); };
  const cabs= a=>Math.hypot(a.re,a.im);
  const carg= a=>Math.atan2(a.im,a.re);

  /* =======================================================================
     F · FOURIER-SERIES RECONSTRUCTION STUDIO        [Source: 29–35]
     Partial sums, coefficient stems, mean-square error and Gibbs overshoot.
     Continuous-time cases only: discrete time has its own laboratory, R.
     ======================================================================= */
  const F = (() => {
    /* Continuous-time waveforms all use T0 = 2, so w0 = pi.
       `a(k)` returns the coefficient as a complex number, from the closed form
       derived in the module. `jump` is the size of the discontinuity, used for
       the overshoot readout; a smooth waveform reports none.
       `pw` is the average power over one period, used for the mean-square
       error through Parseval's relation. */
    const waves = {
      square:{ name:'Square wave', label:'square', dt:false, T0:2, yr:[-0.45,1.55], jump:1, top:1, pw:0.5,
        f:t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5?1:0; },
        a:k=>k===0?cx(0.5,0):cx(Math.sin(Math.PI*k/2)/(Math.PI*k),0) },
      saw:{ name:'Sawtooth wave', label:'sawtooth', dt:false, T0:2, yr:[-1.55,1.55], jump:2, top:1, pw:1/3,
        f:t=>{ const u=t-2*Math.round(t/2); return u; },
        a:k=>k===0?cx(0,0):cx(0,Math.pow(-1,k)/(k*Math.PI)) },
      tri:{ name:'Triangular wave', label:'triangle', dt:false, T0:2, yr:[-0.35,1.35], jump:0, top:1, pw:1/3,
        f:t=>{ const u=t-2*Math.round(t/2); return 1-Math.abs(u); },
        a:k=>k===0?cx(0.5,0):cx((1-Math.pow(-1,k))/(k*k*Math.PI*Math.PI),0) },
      imp:{ name:'Impulse train', label:'impulse train', dt:false, T0:2, yr:[-1.4,3.2], jump:0, top:0, pw:null,
        f:null,
        a:k=>cx(0.5,0) }
    };
    let key='square', N=5;

    /* partial sum: a0 + sum 2(Re a_k cos - Im a_k sin), which is the conjugate
       pair reassembly of the module written out for a real signal */
    function partial(w, x, n){
      const w0 = 2*Math.PI/w.T0;
      let s = w.a(0).re;
      for(let k=1;k<=n;k++){ const c=w.a(k);
        s += 2*(c.re*Math.cos(k*w0*x) - c.im*Math.sin(k*w0*x)); }
      return s;
    }
    /* mean-square error from Parseval: the power the truncation throws away */
    function mse(w, n){
      if(w.pw==null) return null;
      let kept = cabs(w.a(0))**2;
      for(let k=1;k<=n;k++) kept += 2*cabs(w.a(k))**2;
      return Math.max(0, w.pw - kept);
    }
    /* overshoot beside a jump, as a fraction of the size of the jump */
    function overshoot(w, n){
      if(!w.jump) return null;
      const T0=w.T0; let mx=-Infinity;
      for(let i=0;i<=4000;i++){ const t=-T0/2+T0*i/4000; const v=partial(w,t,n); if(v>mx) mx=v; }
      return (mx - w.top)/w.jump;
    }
    const nmax = 40;

    function draw(root){
      const w = waves[key];
      const n = Math.min(N, nmax);
      const kr = [-14,14];

      /* panel 1 — the signal and its partial sum */
      const A1 = PLOT.Axes({w:760,h:340,xr:[-2.2,2.2],yr:w.yr,
        xlabel:'t',pad:{l:50,r:24,t:22,b:32},xtarget:7,ytarget:3});
      if(key==='imp'){
        for(let m=-2;m<=2;m++) A1.impulse(2*m,1,{color:PLOT.COL.in,labelText:'1'});
        A1.curve(t=>partial(w,t,n),{color:PLOT.COL.out,n:3000});
      } else {
        A1.curve(w.f,{color:PLOT.COL.in,n:3000});
        A1.curve(t=>partial(w,t,n),{color:PLOT.COL.out,n:3000});
      }

      /* panel 2 — coefficient magnitudes, with the kept ones highlighted */
      const mag=[], magKept=[];
      for(let k=kr[0];k<=kr[1];k++){ const v=cabs(w.a(k));
        if(Math.abs(k)<=n) magKept.push([k,v]); else mag.push([k,v]); }
      const top2 = Math.max(0.1, Math.max.apply(null, mag.concat(magKept).map(p=>p[1])));
      const A2 = PLOT.Axes({w:760,h:274,xr:[kr[0]-1,kr[1]+1],yr:[-0.08*top2,1.45*top2],
        xlabel:'k',ylabel:'|a_k|',pad:{l:58,r:24,t:22,b:30},xtarget:7,ytarget:2});
      A2.stem(mag,{color:PLOT.COL.muted,r:2.4,showZero:true});
      A2.stem(magKept,{color:PLOT.COL.in,r:3,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in',key==='imp'?'x(t)':'x(t)')}${L('out','x_N(t)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{kept}')}</div></div>`;

      const e = mse(w,n), ov = overshoot(w,n);
      root.querySelector('.ro').innerHTML = `
        <div><dt>Harmonics kept</dt><dd class="okv">${2*n+1}</dd></div>
        <div><dt>Highest index</dt><dd>${n}</dd></div>
        <div><dt>Mean-square error</dt><dd>${e==null?'not defined':N4(e,5)}</dd></div>
        <div><dt>Peak beyond the true level</dt><dd>${
          ov==null?'no jump':N4(100*ov,2)+' % of the jump'}</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        key==='imp' ? `<div class="note warn"><span class="note-h">Why there is no error figure here</span>
            The impulse train has infinite average power over a period, so the mean-square error is not a
            finite number and Parseval's relation has nothing to balance. The partial sum still converges to
            the impulse train, but only in the sense that its area over any interval settles.</div>`
        : w.jump ? `<div class="note err"><span class="note-h">The overshoot does not shrink</span>
            Raise the harmonic count and watch the two numbers part company. The mean-square error keeps
            falling; the peak beside the jump climbs towards $8.95\\%$ of the jump and then stays there,
            however many harmonics are added. What does shrink is its width. At very low harmonic counts the
            partial sum has not yet reached the true level at all, and the figure is negative.</div>`
        : `<div class="note ok"><span class="note-h">No jump, no overshoot</span>
            This waveform is continuous, so its coefficients decay like $1/k^{2}$ instead of $1/k$ and the
            partial sum closes on the signal from both sides. Very few harmonics are needed.</div>`);

      root.querySelector('.wavename').textContent = w.name;
      const sl = root.querySelector('[data-v=N]');
      sl.min = 1; sl.max = nmax; sl.step = 1; sl.value = n;
      root.querySelector('[data-out=N]').textContent = String(n);
      root.querySelectorAll('[data-wave]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wave===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="wavename"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Waveform <span class="seg">
                ${Object.entries(waves).map(([k,w])=>`<button data-wave="${k}">${w.label}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Highest harmonic $N$ <span class="val" data-out="N">5</span></label>
                <input type="range" data-v="N" min="1" max="40" step="1" value="5"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v==='N'){ N=parseInt(e.target.value,10); draw(root); } });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-wave]'); if(!b) return;
        key=b.dataset.wave; draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     G · LTI FREQUENCY-RESPONSE DEMONSTRATOR         [Source: 37–41]
     The chain a_k -> H -> b_k -> y, with the conjugate-pair step exposed.
     ======================================================================= */
  const G = (() => {
    /* continuous-time input of the worked examples, w0 = pi rad/s */
    const aCT = k => {
      const m = Math.abs(k);
      let c;
      if(k===0) c = cx(1,0);
      else if(m===1) c = cx(0.5,0);
      else if(m===2) c = cx(0,-0.5);                       /* 1/(2j) */
      else if(m===3) c = cx(0.5*Math.cos(Math.PI/3), 0.5*Math.sin(Math.PI/3));
      else return cx(0,0);
      return k<0 ? cx(c.re,-c.im) : c;
    };
    const xCT = t => 1 + Math.cos(Math.PI*t) + Math.sin(2*Math.PI*t)
                   + Math.cos(3*Math.PI*t + Math.PI/3);

    const cases = {
      'ct-lp':{ name:'Continuous time · low-pass', label:'CT low-pass', dt:false, hp:false,
        sl:{min:0.2,max:6,step:0.2,val:1,label:'Cutoff $\\omega_c$ (rad/s)'},
        tex:'H(j\\omega)=\\dfrac{1}{1+j\\omega/\\omega_c}' },
      'ct-hp':{ name:'Continuous time · high-pass', label:'CT high-pass', dt:false, hp:true,
        sl:{min:0.2,max:6,step:0.2,val:1,label:'Cutoff $\\omega_c$ (rad/s)'},
        tex:'H(j\\omega)=\\dfrac{j\\omega/\\omega_c}{1+j\\omega/\\omega_c}' },
      'dt-hp':{ name:'Discrete time · first difference', label:'DT difference', dt:true, hp:true,
        sl:{min:2,max:8,step:1,val:4,label:'Impulse-train period $N$'},
        tex:'H(e^{j\\omega})=0.5-0.5\\,e^{-j\\omega}' },
      'dt-lp':{ name:'Discrete time · two-point average', label:'DT average', dt:true, hp:false,
        sl:{min:2,max:8,step:1,val:4,label:'Impulse-train period $N$'},
        tex:'H(e^{j\\omega})=0.5+0.5\\,e^{-j\\omega}' }
    };
    let key='ct-lp', par=1, pair=true;

    const Hct = (w,wc,hp)=>{ const den=cx(1,w/wc);
      return hp ? cdiv(cx(0,w/wc),den) : cdiv(cx(1,0),den); };
    const Hdt = (w,hp)=>hp ? cx(0.5-0.5*Math.cos(w), 0.5*Math.sin(w))
                           : cx(0.5+0.5*Math.cos(w), -0.5*Math.sin(w));

    function model(){
      const c = cases[key];
      if(!c.dt){
        const w0 = Math.PI, K = 3;
        const a = k=>aCT(k), H = k=>Hct(k*w0, par, c.hp);
        const b = k=>cmul(a(k), H(k));
        return { c, w0, K, a, H, b, N:null };
      }
      const N = Math.round(par), w0 = 2*Math.PI/N;
      const a = k=>cx(1/N,0), H = k=>Hdt(k*w0, c.hp);
      const b = k=>cmul(a(k), H(k));
      return { c, w0, K:Math.floor(N/2), a, H, b, N };
    }

    /* the reassembly the module derives, and the version that drops the factor
       of two and takes the phase from the negative index instead */
    function out(m, x){
      const f = pair?2:1, s = pair?1:-1;
      let y = m.b(0).re;
      const last = m.N!=null && m.N%2===0 ? m.K : null;   /* the k = N/2 term has no partner */
      for(let k=1;k<=m.K;k++){
        const bk = m.b(k);
        if(k===last){ y += bk.re*Math.cos(Math.PI*x); continue; }
        y += f*cabs(bk)*Math.cos(k*m.w0*x + s*carg(bk));
      }
      return y;
    }

    function draw(root){
      const m = model(), c = m.c;
      const xr = c.dt ? [-12,12] : [-4,4];

      /* panel 1 — input and output */
      const vals=[]; if(c.dt){ for(let i=-12;i<=12;i++) vals.push(out(m,i)); }
      else { for(let i=0;i<=400;i++) vals.push(out(m,-4+8*i/400)); }
      const lo=Math.min.apply(null,vals), hi=Math.max.apply(null,vals);
      const inLo = c.dt?0:-1.8, inHi = c.dt?1.15:4.05;
      const yr=[Math.min(inLo,lo)-0.35, Math.max(inHi,hi)+0.35];
      const A1 = PLOT.Axes({w:760,h:230,xr,yr,xlabel:c.dt?'n':'t',
        pad:{l:52,r:24,t:18,b:28},xtarget:7,ytarget:4});
      if(c.dt){
        const p=[],q=[]; for(let i=-12;i<=12;i++){
          p.push([i, (((i%m.N)+m.N)%m.N===0)?1:0]); q.push([i,out(m,i)]); }
        A1.stem(p,{color:PLOT.COL.in,r:3,showZero:true});
        A1.stem(q,{color:PLOT.COL.out,r:2.4,showZero:true});
      } else {
        A1.curve(xCT,{color:PLOT.COL.in,n:2400});
        A1.curve(t=>out(m,t),{color:PLOT.COL.out,n:2400});
      }

      /* panel 2 — the frequency response, sampled at the harmonics */
      const wmax = c.dt ? Math.PI : 4*Math.PI;
      const A2 = PLOT.Axes({w:760,h:191,xr:[-wmax,wmax],yr:[-0.12,1.45],
        xlabel:c.dt?'\\omega\\;[\\text{rad/sample}]':'\\omega\\;[\\text{rad/s}]',ylabel:'|H|',
        pad:{l:56,r:24,t:20,b:30},xpi:c.dt?Math.PI/2:Math.PI,ytarget:2});
      A2.curve(w=>cabs(c.dt?Hdt(w,c.hp):Hct(w,par,c.hp)),{color:PLOT.COL.h,n:1400});
      for(let k=-m.K;k<=m.K;k++){ const w=k*m.w0; if(Math.abs(w)>wmax) continue;
        A2.point(w, cabs(m.H(k)), {color:PLOT.COL.coral,r:4}); }

      /* panel 3 — input and output coefficient magnitudes */
      const KR = m.K+1;
      const ma=[], mb=[];
      for(let k=-KR;k<=KR;k++){ ma.push([k,cabs(m.a(k))]); mb.push([k,cabs(m.b(k))]); }
      const topc = Math.max(0.05, Math.max.apply(null, ma.concat(mb).map(p=>p[1])));
      const A3 = PLOT.Axes({w:760,h:191,xr:[-KR-0.6,KR+0.6],yr:[-0.08*topc,1.45*topc],
        xlabel:'k',pad:{l:56,r:24,t:20,b:26},xtarget:5,ytarget:2});
      A3.stem(ma,{color:PLOT.COL.in,r:3.4,showZero:true});
      A3.stem(mb,{color:PLOT.COL.out,r:2.4,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x')}${L('out','y')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('h','|H(j\\omega)|')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','|a_k|')}${L('out','|b_k|')}</div></div>`;

      /* the assembled output, term by term. k = 0 is not repeated here: the
         readout already carries it as "Output average". */
      const rows=[]; const last = m.N!=null && m.N%2===0 ? m.K : null;
      for(let k=1;k<=m.K;k++){
        const bk=m.b(k);
        if(k===last){ rows.push([`k = ${k}`, T(`b_{${k}}(-1)^{n}=${N4(bk.re,4)}\\,(-1)^{n}`,false)]); continue; }
        rows.push([`k = ${k}`, T(`${pair?2:1}\\,|b_{${k}}|=${N4((pair?2:1)*cabs(bk),4)}`
          + `\\ \\ \\varphi=${N4((pair?1:-1)*carg(bk),4)}`,false)]);
      }
      root.querySelector('.terms').innerHTML = rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${k}</div><div class="wex-v">${v}</div></div>`).join('');

      root.querySelector('.hdef').innerHTML = M(
        `<div class="eq key"><span class="eq-label">Frequency response · ${c.name}</span>${T(c.tex,true)}</div>`);
      root.querySelector('.ro').innerHTML = `
        <div><dt>Harmonics carried</dt><dd>${2*m.K+1}</dd></div>
        <div><dt>${c.dt?'Fundamental period N':'Cutoff (rad/s)'}</dt><dd class="okv">${c.dt?m.N:N4(par,2)}</dd></div>
        <div><dt>Output average</dt><dd>${N4(m.b(0).re,4)}</dd></div>
        <div><dt>Output swing</dt><dd>${N4(lo,3)} to ${N4(hi,3)}</dd></div>`;

      root.querySelector('.pairnote').innerHTML = M(pair
        ? `<div class="note ok"><span class="note-h">Pairing on</span>
             $2|b_k|\\cos(k\\omega_0t+\\angle b_k)$ combines each conjugate pair with the factor of two above.</div>`
        : `<div class="note err"><span class="note-h">Pairing off</span>
             Only one pair member is kept, phase read from $-k$: the swing is halved, phases wrong.</div>`);

      const sl = root.querySelector('[data-v=par]');
      sl.min=c.sl.min; sl.max=c.sl.max; sl.step=c.sl.step; sl.value=par;
      root.querySelector('.parlabel').innerHTML = M(c.sl.label);
      root.querySelector('[data-out=par]').textContent = c.dt?String(Math.round(par)):N4(par,2);
      root.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
      root.querySelectorAll('[data-fac]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.fac==='on')===pair)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <div class="hdef"></div>
            <div class="ctrls">
              <div class="ctrl" style="grid-column:1/-1"><label>System <span class="seg">
                ${Object.entries(cases).map(([k,c])=>`<button data-case="${k}">${c.label}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1</span></label>
                <input type="range" data-v="par" min="0.2" max="6" step="0.2" value="1"></div>
              <div class="ctrl"><label>Pair step <span class="seg">
                <button data-fac="on">with factor 2</button>
                <button data-fac="off">without it</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="wex terms"></div>
            <div class="pairnote"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v==='par'){ par=parseFloat(e.target.value); draw(root); } });
      root.addEventListener('click', e=>{
        const c=e.target.closest('[data-case]');
        if(c){ key=c.dataset.case; par=cases[key].sl.val; draw(root); return; }
        const f=e.target.closest('[data-fac]');
        if(f){ pair = f.dataset.fac==='on'; draw(root); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     P · AN EXPONENTIAL THROUGH AN LTI SYSTEM         [Source: 22–25]
     The eigenfunction property: a complex exponential in, the same exponential
     scaled by H(jω) or H(e^{jω}) out.
     ======================================================================= */
  const P = (() => {
    const systems = {
      delay:{ name:'CT pure delay', label:'CT delay', dt:false,
        tex:'y(t)=x(t-1)', Htex:'H(j\\omega)=e^{-j\\omega}',
        H:w=>cx(Math.cos(w),-Math.sin(w)), out:(w,t)=>Math.cos(w*(t-1)) },
      rc:{ name:'CT RC low-pass', label:'CT RC low-pass', dt:false,
        tex:'h(t)=e^{-t}u(t)', Htex:'H(j\\omega)=\\dfrac{1}{1+j\\omega}',
        H:w=>cdiv(cx(1,0),cx(1,w)), out:null },
      avg:{ name:'DT two-point average', label:'DT average', dt:true,
        tex:'h[n]=0.5\\delta[n]+0.5\\delta[n-1]', Htex:'H(e^{j\\omega})=0.5+0.5\\,e^{-j\\omega}',
        H:w=>cx(0.5+0.5*Math.cos(w),-0.5*Math.sin(w)), out:null },
      diff:{ name:'DT first difference', label:'DT difference', dt:true,
        tex:'h[n]=0.5\\delta[n]-0.5\\delta[n-1]', Htex:'H(e^{j\\omega})=0.5-0.5\\,e^{-j\\omega}',
        H:w=>cx(0.5-0.5*Math.cos(w),0.5*Math.sin(w)), out:null }
    };
    let key='delay', w=1;

    function draw(root){
      const s = systems[key];
      const wmax = s.dt ? Math.PI : 6;
      w = Math.min(Math.max(w, s.dt?0:0.2), wmax);
      const Hw = s.H(w), mag = cabs(Hw), ang = carg(Hw);

      /* panel 1 — Re{input} and Re{output} */
      const xr = s.dt ? [-10,10] : [-4,4];
      const A1 = PLOT.Axes({w:760,h:349,xr,yr:[-1.35,1.35],xlabel:s.dt?'n':'t',
        pad:{l:50,r:24,t:20,b:30},xtarget:8,ytarget:3});
      if(s.dt){
        const p=[],q=[]; for(let n=-10;n<=10;n++){ p.push([n,Math.cos(w*n)]); q.push([n,mag*Math.cos(w*n+ang)]); }
        A1.stem(p,{color:PLOT.COL.in,r:3,showZero:true});
        A1.stem(q,{color:PLOT.COL.out,r:2.4,showZero:true});
      } else {
        A1.curve(t=>Math.cos(w*t),{color:PLOT.COL.in,n:2000});
        A1.curve(t=>mag*Math.cos(w*t+ang),{color:PLOT.COL.out,n:2000});
      }

      /* panel 2 — |H(w)| with the current point marked */
      const A2 = PLOT.Axes({w:760,h:267,xr:[s.dt?0:0,wmax],yr:[-0.08,1.35],
        xlabel:s.dt?'\\omega\\;[\\text{rad/sample}]':'\\omega\\;[\\text{rad/s}]',ylabel:'|H|',
        pad:{l:56,r:24,t:20,b:30},xpi:s.dt?Math.PI/4:Math.PI/2,ytarget:2});
      A2.curve(v=>cabs(s.H(v)),{color:PLOT.COL.h,n:1200});
      A2.point(w,mag,{color:PLOT.COL.coral,r:5});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\operatorname{Re}\\{x\\}')}${L('out','\\operatorname{Re}\\{y\\}')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('h','|H|')}</div></div>`;

      root.querySelector('.sysdef').innerHTML = M(
        `<div class="eq key"><span class="eq-label">System · ${s.name}</span>${T(s.tex,true)}</div>`);
      root.querySelector('.ro').innerHTML = `
        <div><dt>|H|</dt><dd class="okv">${N4(mag,4)}</dd></div>
        <div><dt>∠H (rad)</dt><dd>${N4(ang,4)}</dd></div>
        <div><dt>Output amplitude</dt><dd>${N4(mag,4)}</dd></div>
        <div><dt>${s.dt?'ω (rad/sample)':'ω (rad/s)'}</dt><dd>${N4(w,3)}</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Eigenvalue</span>${T(`${s.Htex}\\Big|_{\\omega=${N4(w,3)}}=${N4(Hw.re,4)}${Hw.im>=0?'+':'-'}${N4(Math.abs(Hw.im),4)}j=${N4(mag,4)}\\,e^{j(${N4(ang,4)})}`,true)}</div>
         <div class="note ok"><span class="note-h">Same frequency</span>
           The output is the input times one complex number, $H$ at $\\omega=${N4(w,3)}$: same frequency,
           only scaled and shifted.</div>`);

      const sl = root.querySelector('[data-v=w]');
      sl.min = s.dt?0:0.2; sl.max = wmax; sl.step = s.dt?0.02:0.1; sl.value = w;
      root.querySelector('[data-out=w]').textContent = N4(w,2);
      root.querySelectorAll('[data-sys]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sys===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="sysdef"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>System <span class="seg">
                ${Object.entries(systems).map(([k,s])=>`<button data-sys="${k}">${s.label}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Frequency $\\omega$ <span class="val" data-out="w">1</span></label>
                <input type="range" data-v="w" min="0.2" max="6" step="0.1" value="1"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v==='w'){ w=parseFloat(e.target.value); draw(root); } });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-sys]'); if(!b) return;
        key=b.dataset.sys; w = systems[key].dt ? Math.min(w,Math.PI) : w; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  /* =======================================================================
     Q · THE ANALYSIS INTEGRAL AS A PROBE             [Source: 26–29]
     Multiply x(t) by e^{-jkω0t} and integrate over one period; the area is
     the coefficient a_k. Simpson's rule evaluates the integral numerically.
     ======================================================================= */
  const Q = (() => {
    const sigs = {
      x1:{ name:'x_1(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)', label:'x_1', T0:2,
        f:t=>1+0.5*Math.cos(2*Math.PI*t)+Math.sin(3*Math.PI*t) },
      x2:{ name:'\\text{rectangular wave, } T_0=2', label:'\\text{rect}', T0:2,
        f:t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5?1:0; } },
      x3:{ name:'\\text{sawtooth, } T_0=2', label:'\\text{sawtooth}', T0:2,
        f:t=>{ const u=t-2*Math.round(t/2); return u; } }
    };
    let key='x1', k=0;

    /* Simpson's rule for the analysis integral a_k = (1/T0) ∫ x(t) e^{-jkω0t} dt */
    function ak(sig, kk){
      const T0=sig.T0, w0=2*Math.PI/T0, N=800, d=T0/N;
      let sre=0, sim=0;
      for(let i=0;i<=N;i++){
        const t=-T0/2+i*d, xv=sig.f(t), ph=-kk*w0*t;
        const wgt=(i===0||i===N)?1:(i%2?4:2);
        sre += wgt*xv*Math.cos(ph); sim += wgt*xv*Math.sin(ph);
      }
      return cx(sre*d/3/T0, sim*d/3/T0);
    }

    function draw(root){
      const sig = sigs[key], T0=sig.T0, w0=2*Math.PI/T0;
      const a = ak(sig,k);

      /* panel 1 — the probe over one period, shaded. |x e^{-jkw0t}| <= |x|, so
         the peak of |x| bounds both traces for every k; the room above it keeps
         the legend clear of them. */
      let pk=0; for(let i=0;i<=800;i++) pk=Math.max(pk,Math.abs(sig.f(-T0/2+T0*i/800)));
      const A1 = PLOT.Axes({w:760,h:338,xr:[-T0/2-0.15,T0/2+0.15],yr:[-1.12*pk,1.6*pk],
        xlabel:'t',pad:{l:50,r:24,t:20,b:30},xtarget:7,ytarget:3});
      const re = t=>sig.f(t)*Math.cos(-k*w0*t), im = t=>sig.f(t)*Math.sin(-k*w0*t);
      A1.area(re,-T0/2,T0/2,{color:'rgba(20,112,127,.18)'});
      A1.curve(re,{color:PLOT.COL.in,n:1200});
      A1.curve(im,{color:PLOT.COL.mid,n:1200,dash:'6 5'});

      /* panel 2 — |a_k| stems, probe highlighted */
      const mags=[], probed=[];
      for(let kk=-4;kk<=4;kk++){ const v=cabs(ak(sig,kk)); (kk===k?probed:mags).push([kk,v]); }
      const topc = Math.max(0.1, Math.max.apply(null, mags.concat(probed).map(p=>p[1])));
      const A2 = PLOT.Axes({w:760,h:277,xr:[-4.8,4.8],yr:[-0.08*topc,1.4*topc],
        xlabel:'k',ylabel:'|a_k|',pad:{l:56,r:24,t:20,b:28},xtarget:9,ytarget:2});
      A2.stem(mags,{color:PLOT.COL.muted,r:2.6,showZero:true});
      A2.stem(probed,{color:PLOT.COL.coral,r:3.6,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\operatorname{Re}\\{x(t)e^{-jk\\omega_0t}\\}')}${L('mid','\\operatorname{Im}\\{\\cdot\\}')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('coral','|a_k|\\text{ probed}')}</div></div>`;

      root.querySelector('.sigdef').innerHTML = M(
        `<div class="eq key"><span class="eq-label">Signal · ${T(sig.label,false)}</span>${T(sig.name,true)}</div>`);
      root.querySelector('.ro').innerHTML = `
        <div><dt>a_k (re + j im)</dt><dd class="okv">${N4(a.re,4)} ${a.im>=0?'+':'−'} ${N4(Math.abs(a.im),4)}j</dd></div>
        <div><dt>|a_k|</dt><dd>${N4(cabs(a),4)}</dd></div>
        <div><dt>∠a_k (rad)</dt><dd>${cabs(a)<1e-9?'no phase (a_k = 0)':N4(carg(a),4)}</dd></div>
        <div><dt>Probe index k</dt><dd>${k}</dd></div>`;

      const cancels = cabs(a) < 0.01;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Analysis integral</span>${T(`a_{${k}}=\\frac{1}{${T0}}\\int_{-${T0/2}}^{${T0/2}}x(t)\\,e^{-j${k}\\omega_0t}\\,dt=${N4(a.re,4)}${a.im>=0?'+':'-'}${N4(Math.abs(a.im),4)}j`,true)}</div>`
        + (cancels
          ? `<div class="note warn"><span class="note-h">Other harmonics cancel</span>
              No energy at $k=${k}$: the probe frequency does not match a harmonic, and orthogonality
              cancels every non-matching term, leaving area $0$.</div>`
          : `<div class="note ok"><span class="note-h">A matching harmonic</span>
              $k\\omega_0=${N4(k*w0,3)}$ rad/s picks out the part of $x(t)$ at that rate; every other
              harmonic averages to zero by orthogonality.</div>`));

      const sl = root.querySelector('[data-v=k]');
      sl.min=-4; sl.max=4; sl.step=1; sl.value=k;
      root.querySelector('[data-out=k]').textContent = String(k);
      root.querySelectorAll('[data-sig]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sig===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="sigdef"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal <span class="seg">
                ${Object.entries(sigs).map(([kk,s])=>`<button data-sig="${kk}">${T(s.label,false)}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Probe index $k$ <span class="val" data-out="k">0</span></label>
                <input type="range" data-v="k" min="-4" max="4" step="1" value="0"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ if(e.target.dataset.v==='k'){ k=parseInt(e.target.value,10); draw(root); RENDER.fit(); } });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-sig]'); if(!b) return;
        key=b.dataset.sig; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  /* =======================================================================
     R · A PERIODIC SEQUENCE AND ITS N COEFFICIENTS   [Source: 32–35]
     DT square wave x[n] period N, half-width N1; keep M coefficient pairs.
     For an even N the k = N/2 term is its own partner, so it enters once.
     ======================================================================= */
  const R = (() => {
    let N=11, N1=2, Mkeep=5, saw=false;

    /* closed form for the square wave: a_k = (2N1+1)/N at k a multiple of N,
       else sin(2π k (N1+1/2)/N) / (N sin(π k/N)) */
    function akSquare(k,NN,N1v){
      const r = k/NN;
      if(Math.abs(r-Math.round(r))<1e-12) return cx((2*N1v+1)/NN,0);
      return cx(Math.sin(2*Math.PI*k*(N1v+0.5)/NN)/(NN*Math.sin(Math.PI*k/NN)),0);
    }
    /* sawtooth x[n]=n on -5..5, N=11: purely imaginary coefficients */
    function akSaw(k){
      const NN=11;
      if(k%NN===0) return cx(0,0);
      /* a_k = (1/N) sum_{n=-5}^{5} n e^{-j2πkn/N} — computed directly */
      let sre=0, sim=0; const w0=2*Math.PI/NN;
      for(let n=-5;n<=5;n++){ sre += n*Math.cos(-k*w0*n); sim += n*Math.sin(-k*w0*n); }
      return cx(sre/NN, sim/NN);
    }
    function x(n,NN,N1v){ const m=((n%NN)+NN)%NN; const mm = m>NN/2 ? m-NN : m; return Math.abs(mm)<=N1v?1:0; }
    function xsaw(n){ const NN=11; const m=((n%NN)+NN)%NN; const mm = m>NN/2? m-NN : m; return mm; }

    function ak(k){ return saw ? akSaw(k) : akSquare(k,N,N1); }
    const period = saw ? 11 : N;

    /* reconstruction from the kept M coefficient pairs (M = 0..floor(N/2)) */
    function recon(n, Mk){
      const NN = saw?11:N, w0=2*Math.PI/NN;
      let s = ak(0).re;
      const half = NN%2===0 && Mk===NN/2;
      for(let k=1;k<=Mk;k++){ const c=ak(k);
        if(NN%2===0 && k===NN/2){ s += c.re*Math.cos(Math.PI*n); continue; }
        s += 2*(c.re*Math.cos(k*w0*n) - c.im*Math.sin(k*w0*n)); }
      return s;
    }

    function draw(root){
      const NN = saw?11:N, kmax = Math.floor(NN/2);
      const Mk = Math.min(Mkeep, kmax);
      const xf = saw ? xsaw : (n=>x(n,N,N1));

      /* panel 1 — x[n] and its reconstruction */
      const A1 = PLOT.Axes({w:760,h:366,xr:[-NN,NN],yr: saw?[-6.5,6.5]:[-0.45,1.55],
        xlabel:'n',pad:{l:50,r:24,t:20,b:30},xtarget:8,ytarget:3});
      const p=[],q=[]; for(let n=-NN;n<=NN;n++){ p.push([n,xf(n)]); q.push([n,recon(n,Mk)]); }
      A1.stem(p,{color:PLOT.COL.in,r:3,showZero:true});
      A1.stem(q,{color:PLOT.COL.out,r:2.3,showZero:true});

      /* panel 2 — a_k over one period, repeated to show a_{k+N}=a_k */
      const kr=[-NN,NN];
      const mags=[], kept=[];
      for(let k=kr[0];k<=kr[1];k++){ const v=cabs(ak(((k%NN)+NN)%NN<=NN/2?((k%NN)+NN)%NN:((k%NN)+NN)%NN-NN));
        (Math.abs(k)<=Mk?kept:mags).push([k,v]); }
      const topc = Math.max(0.05, Math.max.apply(null, mags.concat(kept).map(p=>p[1])));
      const A2 = PLOT.Axes({w:760,h:247,xr:[kr[0]-1,kr[1]+1],yr:[-0.08*topc,1.5*topc],
        xlabel:'k',ylabel:'|a_k|',pad:{l:58,r:24,t:18,b:26},xtarget:7,ytarget:2});
      A2.stem(mags,{color:PLOT.COL.muted,r:2.4,showZero:true});
      A2.stem(kept,{color:PLOT.COL.in,r:3,showZero:true});
      A2.vline(-NN/2,{color:PLOT.COL.coral,dash:'4 4'}); A2.vline(NN/2,{color:PLOT.COL.coral,dash:'4 4'});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}${L('out','\\hat{x}[n]')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{kept}')}</div></div>`;

      /* reconstruction error, largest coefficient */
      let err=0; for(let n=-NN;n<=NN;n++) err=Math.max(err,Math.abs(xf(n)-recon(n,Mk)));
      let bestk=0, bestv=-1; for(let k=1;k<=kmax;k++){ const v=cabs(ak(k)); if(v>bestv){bestv=v;bestk=k;} }
      const a0 = ak(0).re, a1v = ak(1);

      root.querySelector('.ro').innerHTML = `
        <div><dt>Period N</dt><dd>${NN}</dd></div>
        <div><dt>a_0</dt><dd class="okv">${N4(a0,4)}</dd></div>
        <div><dt>Largest |a_k| (k≠0)</dt><dd>k=${bestk}: ${N4(bestv,4)}</dd></div>
        <div><dt>Recon. error</dt><dd class="${Mk===kmax?'okv':''}">${N4(err,5)}</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        saw
        ? `<div class="eq"><span class="eq-label">Closed form</span>${T(`a_1=${N4(a1v.re,4)}${a1v.im>=0?'+':'-'}${N4(Math.abs(a1v.im),4)}j,\\quad|a_1|=${N4(cabs(a1v),4)}`,true)}</div>`
        : `<div class="eq"><span class="eq-label">Closed form at k=1</span>${T(`a_0=\\frac{2N_1+1}{N}=\\frac{${2*N1+1}}{${N}}=${N4(a0,4)},\\quad a_1=${N4(ak(1).re,4)}${ak(1).im>=0?'+':'-'}${N4(Math.abs(ak(1).im),4)}j`,true)}</div>`)
        + (Mk===kmax
          ? `<div class="note ok"><span class="note-h">Exact with N terms</span>
               A period-${T('N',false)} sequence has ${T('N',false)} distinct coefficients. All kept: every sample
               matches, error exactly ${T('0',false)}.</div>`
          : `<div class="note warn"><span class="note-h">Still an approximation</span>
               ${T(String(2*Mk+1),false)} of ${T(String(NN),false)} coefficients kept. Raise ${T('M',false)} to
               ${T(`\\lfloor N/2\\rfloor=${kmax}`,false)} for an exact match.</div>`);

      root.querySelector('.casename').textContent = saw ? 'Sawtooth, N = 11' : `Square wave, N = ${N}, N_1 = ${N1}`;
      const slN = root.querySelector('[data-v=N]'), slN1 = root.querySelector('[data-v=N1]'), slM = root.querySelector('[data-v=M]');
      slN.min=4; slN.max=20; slN.step=1; slN.value=N; slN.disabled = saw;
      slN1.min=0; slN1.max=Math.floor((N-1)/2); slN1.step=1; slN1.value=N1; slN1.disabled = saw;
      slM.min=0; slM.max=kmax; slM.step=1; slM.value=Mk;
      root.querySelector('[data-out=N]').textContent = String(N);
      root.querySelector('[data-out=N1]').textContent = String(N1);
      root.querySelector('[data-out=M]').textContent = String(Mk);
      root.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.case==='saw')===saw)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="casename"></span></p>
            <div class="ctrls">
              <div class="ctrl" style="grid-column:1/-1"><label>Case <span class="seg">
                <button data-case="square">square wave</button>
                <button data-case="saw">sawtooth</button></span></label></div>
              <div class="ctrl"><label>Period N <span class="val" data-out="N">11</span></label>
                <input type="range" data-v="N" min="4" max="20" step="1" value="11"></div>
              <div class="ctrl"><label>Half-width $N_1$ <span class="val" data-out="N1">2</span></label>
                <input type="range" data-v="N1" min="0" max="9" step="1" value="2"></div>
              <div class="ctrl" style="grid-column:1/-1"><label>Coefficient pairs kept M <span class="val" data-out="M">5</span></label>
                <input type="range" data-v="M" min="0" max="5" step="1" value="5"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        if(k==='N'){ N=parseInt(e.target.value,10); N1=Math.min(N1,Math.floor((N-1)/2)); Mkeep=Math.min(Mkeep,Math.floor(N/2)); }
        else if(k==='N1') N1=parseInt(e.target.value,10);
        else if(k==='M') Mkeep=parseInt(e.target.value,10);
        draw(root); RENDER.fit(); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-case]'); if(!b) return;
        saw = b.dataset.case==='saw'; if(saw) Mkeep=Math.min(Mkeep,5); draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  /* =======================================================================
     S · OPERATIONS AND THEIR COEFFICIENTS            [Source: 35–37]
     Base signal: rectangular wave, T0 = 2, w0 = pi. One operation at a time.
     ======================================================================= */
  const S = (() => {
    const T0=2, w0=Math.PI;
    const abase = k=>k===0?cx(0.5,0):cx(Math.sin(Math.PI*k/2)/(Math.PI*k),0);
    const xbase = t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5?1:0; };

    const ops = {
      shift:{ name:'Time shift', label:'time shift $x(t-t_0)$',
        par:{min:-1,max:1,step:0.05,val:0.3,label:'Shift $t_0$'},
        b:(k,p)=>cmul(abase(k), cx(Math.cos(k*w0*p),-Math.sin(k*w0*p))),
        f:(t,p)=>xbase(t-p),
        proptex:'b_k=a_k\\,e^{-jk\\omega_0t_0}', what:'phase only' },
      rev:{ name:'Time reversal (of the shifted wave)', label:'time reversal $x(-(t-t_0))$',
        par:{min:-1,max:1,step:0.05,val:0.3,label:'Shift $t_0$ before reversal'},
        b:(k,p)=>{ const s=cmul(abase(k), cx(Math.cos(k*w0*p),-Math.sin(k*w0*p))); return cx(s.re,-s.im); },
        f:(t,p)=>xbase(-(t-p)),
        proptex:'b_k=a_{-k}\\,e^{jk\\omega_0t_0}', what:'index (mirrors) and phase sign' },
      scale:{ name:'Time scaling', label:'time scaling $x(2t)$',
        par:{min:1,max:1,step:1,val:1,label:'Fixed: scale factor 2'},
        b:(k)=>abase(k), f:(t)=>xbase(2*t), w0scaled:2*w0,
        proptex:'b_k=a_k,\\ \\ \\omega_0\\to2\\omega_0', what:'frequency spacing only' },
      freq:{ name:'Frequency shift', label:'frequency shift $e^{jM\\omega_0t}x(t)$',
        par:{min:-3,max:3,step:1,val:1,label:'Harmonic shift $M$'},
        b:(k,p)=>abase(k-Math.round(p)),
        f:(t,p)=>xbase(t)*Math.cos(Math.round(p)*w0*t),
        proptex:'b_k=a_{k-M}', what:'index, by M' },
      deriv:{ name:'Differentiation', label:'differentiation $dx/dt$',
        par:{min:1,max:1,step:1,val:1,label:'Fixed: no parameter'},
        b:(k)=>cmul(cx(0,k*w0), abase(k)),
        f:null,
        proptex:'b_k=jk\\omega_0\\,a_k', what:'magnitude (by $|k|\\omega_0$) and phase (by $90^\\circ$)' }
    };
    let key='shift', par=ops.shift.par.val;

    function draw(root){
      const o = ops[key];
      const w0e = o.w0scaled || w0;

      /* panel 1 — before and after */
      const A1 = PLOT.Axes({w:760,h:241,xr:[-2.2,2.2],yr:[-0.45,1.55],xlabel:'t',
        pad:{l:50,r:24,t:18,b:28},xtarget:7,ytarget:3});
      if(key==='deriv'){
        A1.curve(xbase,{color:PLOT.COL.in,n:2000});
        A1.impulse(-0.5,-1,{color:PLOT.COL.mid,labelText:'-1'});
        A1.impulse(0.5,1,{color:PLOT.COL.mid,labelText:'1'});
      } else {
        A1.curve(xbase,{color:PLOT.COL.in,n:2000});
        A1.curve(t=>o.f(t,par),{color:PLOT.COL.out,n:2000});
      }

      /* panel 2 — |a_k| vs |b_k| */
      const kr=[-6,6];
      const ma=[], mb=[];
      for(let k=kr[0];k<=kr[1];k++){ ma.push([k,cabs(abase(k))]); mb.push([k,cabs(o.b(k,par))]); }
      const topm = Math.max(0.05, Math.max.apply(null, ma.concat(mb).map(p=>p[1])));
      const A2 = PLOT.Axes({w:760,h:185,xr:[kr[0]-1,kr[1]+1],yr:[-0.08*topm,1.4*topm],
        xlabel:'k',ylabel:'\\text{magnitude}',pad:{l:58,r:24,t:18,b:26},xtarget:7,ytarget:2});
      A2.stem(ma,{color:PLOT.COL.in,r:3,showZero:true});
      A2.stem(mb,{color:PLOT.COL.out,r:2.4,showZero:true});

      /* panel 3 — ∠a_k vs ∠b_k */
      const pa=[], pb=[];
      for(let k=kr[0];k<=kr[1];k++){
        const av=abase(k), bv=o.b(k,par);
        pa.push([k, cabs(av)<1e-9?0:carg(av)]); pb.push([k, cabs(bv)<1e-9?0:carg(bv)]); }
      const A3 = PLOT.Axes({w:760,h:185,xr:[kr[0]-1,kr[1]+1],yr:[-3.9,3.9],
        xlabel:'k',ylabel:'\\text{phase [rad]}',pad:{l:62,r:24,t:18,b:26},xtarget:7,
        yticksOverride:[-Math.PI,0,Math.PI],ytickfmt:v=>v.toFixed(2)});
      A3.stem(pa,{color:PLOT.COL.in,r:2.6,showZero:true});
      A3.stem(pb,{color:PLOT.COL.out,r:2.2,showZero:true});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)')}${L(key==='deriv'?'mid':'out',key==='deriv'?'dx/dt':'y(t)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','|a_k|')}${L('out','|b_k|')}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\angle a_k')}${L('out','\\angle b_k')}</div></div>`;

      /* largest magnitude change, b1 value */
      let dmax=0; for(let k=kr[0];k<=kr[1];k++) dmax=Math.max(dmax, Math.abs(cabs(o.b(k,par))-cabs(abase(k))));
      const b1 = o.b(1,par);

      root.querySelector('.ro').innerHTML = `
        <div><dt>Largest |b_k| − |a_k|</dt><dd>${N4(dmax,4)}</dd></div>
        <div><dt>b_1</dt><dd class="okv">${N4(b1.re,4)} ${b1.im>=0?'+':'−'} ${N4(Math.abs(b1.im),4)}j</dd></div>
        <div><dt>Parameter</dt><dd>${N4(par,2)}</dd></div>`;

      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Property · ${o.name}</span>${T(o.proptex,true)}</div>`
        + `<div class="note warn"><span class="note-h">What changed</span>This operation changes the ${o.what}.</div>`
        + `<div class="note def"><span class="note-h">Base signal</span>
             $x(t)=1$ on $|t|\\lt0.5$, $T_0=2$, $\\omega_0=\\pi$: $a_k=\\sin(\\pi k/2)/(\\pi k)$, $a_0=0.5$.</div>`);

      const sl = root.querySelector('[data-v=par]');
      sl.min=o.par.min; sl.max=o.par.max; sl.step=o.par.step; sl.value=par; sl.disabled = o.par.min===o.par.max;
      root.querySelector('.parlabel').innerHTML = M(o.par.label);
      root.querySelector('[data-out=par]').textContent = N4(par,2);
      root.querySelectorAll('[data-op]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.op===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Operation <span class="seg">
                ${Object.entries(ops).map(([k,o])=>`<button data-op="${k}">${o.label}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">0.3</span></label>
                <input type="range" data-v="par" min="-1" max="1" step="0.05" value="0.3"></div>
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

  return { F, G, P, Q, R, S };
})());
