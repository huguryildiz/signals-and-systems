/* ==========================================================================
   Laboratories F and G — Module 4  [Source: 29–41]
   Every displayed number is computed from the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;

  /* complex helpers — the coefficients of this module are genuinely complex */
  const cx  = (re,im)=>({re:re,im:im});
  const cmul= (a,b)=>cx(a.re*b.re-a.im*b.im, a.re*b.im+a.im*b.re);
  const cdiv= (a,b)=>{ const d=b.re*b.re+b.im*b.im; return cx((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d); };
  const cabs= a=>Math.hypot(a.re,a.im);
  const carg= a=>Math.atan2(a.im,a.re);

  /* =======================================================================
     F · FOURIER-SERIES RECONSTRUCTION STUDIO        [Source: 29–35]
     Partial sums, coefficient stems, mean-square error and Gibbs overshoot.
     ======================================================================= */
  const F = (() => {
    /* Continuous-time waveforms all use T0 = 2, so w0 = pi.
       `a(k)` returns the coefficient as a complex number, from the closed form
       derived in the module. `jump` is the size of the discontinuity, used for
       the overshoot readout; a smooth waveform reports none.
       `pw` is the average power over one period, used for the mean-square
       error through Parseval's relation. */
    const waves = {
      square:{ name:'Square wave', dt:false, T0:2, yr:[-0.45,1.55], jump:1, top:1, pw:0.5,
        f:t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5?1:0; },
        a:k=>k===0?cx(0.5,0):cx(Math.sin(Math.PI*k/2)/(Math.PI*k),0) },
      saw:{ name:'Sawtooth wave', dt:false, T0:2, yr:[-1.55,1.55], jump:2, top:1, pw:1/3,
        f:t=>{ const u=t-2*Math.round(t/2); return u; },
        a:k=>k===0?cx(0,0):cx(0,Math.pow(-1,k)/(k*Math.PI)) },
      tri:{ name:'Triangular wave', dt:false, T0:2, yr:[-0.35,1.35], jump:0, top:1, pw:1/3,
        f:t=>{ const u=t-2*Math.round(t/2); return 1-Math.abs(u); },
        a:k=>k===0?cx(0.5,0):cx((1-Math.pow(-1,k))/(k*k*Math.PI*Math.PI),0) },
      imp:{ name:'Impulse train', dt:false, T0:2, yr:[-1.4,3.2], jump:0, top:0, pw:null,
        f:null,
        a:k=>cx(0.5,0) },
      dtsq:{ name:'Discrete square wave', dt:true, N:16, N1:3, yr:[-0.45,1.55], jump:0, top:1, pw:7/16,
        f:n=>{ const m=n-16*Math.round(n/16); return Math.abs(m)<=3?1:0; },
        a:k=>{ const r=k/16;
               if(Math.abs(r-Math.round(r))<1e-12) return cx((2*3+1)/16,0);
               return cx(Math.sin(2*Math.PI*k*3.5/16)/(16*Math.sin(Math.PI*k/16)),0); } }
    };
    let key='square', N=5;

    /* partial sum: a0 + sum 2(Re a_k cos - Im a_k sin), which is the conjugate
       pair reassembly of the module written out for a real signal */
    /* For an even period N the coefficient at k = N/2 is its own partner —
       a_{N/2} = a_{-N/2} is one coefficient, not two — so it enters once. */
    const half = (w,k) => w.dt && w.N%2===0 && k===w.N/2;
    function partial(w, x, n){
      const w0 = w.dt ? 2*Math.PI/w.N : 2*Math.PI/w.T0;
      let s = w.a(0).re;
      for(let k=1;k<=n;k++){ const c=w.a(k);
        if(half(w,k)){ s += c.re*Math.cos(k*w0*x); continue; }
        s += 2*(c.re*Math.cos(k*w0*x) - c.im*Math.sin(k*w0*x)); }
      return s;
    }
    /* mean-square error from Parseval: the power the truncation throws away */
    function mse(w, n){
      if(w.pw==null) return null;
      let kept = cabs(w.a(0))**2;
      for(let k=1;k<=n;k++) kept += (half(w,k)?1:2)*cabs(w.a(k))**2;
      return Math.max(0, w.pw - kept);
    }
    /* overshoot beside a jump, as a fraction of the size of the jump */
    function overshoot(w, n){
      if(!w.jump) return null;
      const T0=w.T0; let mx=-Infinity;
      for(let i=0;i<=4000;i++){ const t=-T0/2+T0*i/4000; const v=partial(w,t,n); if(v>mx) mx=v; }
      return (mx - w.top)/w.jump;
    }
    /* how many harmonics the case allows: a period-N sequence has N of them */
    const nmax = w => w.dt ? Math.floor(w.N/2) : 40;

    function draw(root){
      const w = waves[key];
      const n = Math.min(N, nmax(w));
      const kr = w.dt ? [-20,20] : [-14,14];

      /* panel 1 — the signal and its partial sum */
      const A1 = PLOT.Axes({w:760,h:210,xr:w.dt?[-20,20]:[-2.2,2.2],yr:w.yr,
        xlabel:w.dt?'n':'t',pad:{l:50,r:24,t:24,b:34},xtarget:7,ytarget:3});
      if(w.dt){
        const pts=[]; for(let i=-20;i<=20;i++) pts.push([i,w.f(i)]);
        A1.stem(pts,{color:PLOT.COL.in,r:3,showZero:true});
        const rec=[]; for(let i=-20;i<=20;i++) rec.push([i,partial(w,i,n)]);
        A1.stem(rec,{color:PLOT.COL.out,r:2,showZero:true});
      } else if(key==='imp'){
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
      const A2 = PLOT.Axes({w:760,h:180,xr:[kr[0]-1,kr[1]+1],yr:[-0.08*top2,1.25*top2],
        xlabel:'k',ylabel:'|a_k|',pad:{l:58,r:24,t:24,b:32},xtarget:7,ytarget:3});
      A2.stem(mag,{color:PLOT.COL.muted,r:2.4,showZero:true});
      A2.stem(magKept,{color:PLOT.COL.in,r:3,showZero:true});

      /* panel 3 — coefficient phases */
      const ph=[]; for(let k=kr[0];k<=kr[1];k++){ const c=w.a(k);
        ph.push([k, cabs(c)<1e-12?0:carg(c)]); }
      const A3 = PLOT.Axes({w:760,h:170,xr:[kr[0]-1,kr[1]+1],yr:[-3.9,3.9],
        xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',pad:{l:62,r:24,t:24,b:32},xtarget:7,
        yticksOverride:[-Math.PI,-Math.PI/2,0,Math.PI/2,Math.PI],ytickfmt:v=>v.toFixed(2)});
      A3.stem(ph,{color:PLOT.COL.mid,r:2.6,showZero:true});

      root.querySelector('.plots').innerHTML = [A1,A2,A3].map(p=>p.svg()).join('');

      const e = mse(w,n), ov = overshoot(w,n);
      root.querySelector('.ro').innerHTML = `
        <div><dt>Harmonics kept</dt><dd class="okv">${2*n+1}</dd></div>
        <div><dt>Highest index</dt><dd>${n}</dd></div>
        <div><dt>Mean-square error</dt><dd>${e==null?'not defined':fmt(e,5)}</dd></div>
        <div><dt>Peak beyond the true level</dt><dd style="font-size:17px">${
          ov==null?'no jump':(100*ov).toFixed(2)+' % of the jump'}</dd></div>`;

      root.querySelector('.remark').innerHTML = M(
        key==='imp' ? `<div class="note warn"><span class="note-h">Why there is no error figure here</span>
            The impulse train has infinite average power over a period, so the mean-square error is not a
            finite number and Parseval's relation has nothing to balance. The partial sum still converges to
            the impulse train, but only in the sense that its area over any interval settles.</div>`
        : w.dt ? `<div class="note ok"><span class="note-h">A finite, exact sum</span>
            A period-$N$ sequence has exactly $N$ coefficients. At the largest setting the reconstruction is
            not an approximation at all: every sample lands on the signal and the error is exactly zero.
            There is no Gibbs overshoot in discrete time, whatever the signal does.</div>`
        : w.jump ? `<div class="note err"><span class="note-h">The overshoot does not shrink</span>
            Raise the harmonic count and watch the two numbers part company. The mean-square error keeps
            falling; the peak beside the jump climbs towards <b>8.95 % of the jump</b> and then stays there,
            however many harmonics are added. What does shrink is its width. At very low harmonic counts the
            partial sum has not yet reached the true level at all, and the figure is negative.</div>`
        : `<div class="note ok"><span class="note-h">No jump, no overshoot</span>
            This waveform is continuous, so its coefficients decay like $1/k^{2}$ instead of $1/k$ and the
            partial sum closes on the signal from both sides. Very few harmonics are needed.</div>`);

      root.querySelector('.wavename').textContent = w.name;
      const sl = root.querySelector('[data-v=N]');
      sl.min = 1; sl.max = nmax(w); sl.step = 1; sl.value = n;
      root.querySelector('[data-out=N]').textContent = String(n);
      root.querySelectorAll('[data-wave]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wave===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="wavename"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Waveform <span class="seg">
                ${Object.keys(waves).map(k=>`<button data-wave="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Highest harmonic $N$ <span class="val" data-out="N">5</span></label>
                <input type="range" data-v="N" min="1" max="40" step="1" value="5"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="remark"></div>
            <div class="note def"><span class="note-h">What the panels show</span>
              Top: the signal in cyan and the partial sum $x_N$ in green. Middle: the coefficient magnitudes,
              with the ones being used drawn solid. Bottom: the coefficient phases, which are what a magnitude
              plot alone would hide.</div>
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
      'ct-lp':{ name:'Continuous time · low-pass', dt:false, hp:false,
        sl:{min:0.2,max:6,step:0.2,val:1,label:'Cutoff $\\omega_c$ (rad/s)'},
        tex:'H(j\\omega)=\\dfrac{1}{1+j\\omega/\\omega_c}' },
      'ct-hp':{ name:'Continuous time · high-pass', dt:false, hp:true,
        sl:{min:0.2,max:6,step:0.2,val:1,label:'Cutoff $\\omega_c$ (rad/s)'},
        tex:'H(j\\omega)=\\dfrac{j\\omega/\\omega_c}{1+j\\omega/\\omega_c}' },
      'dt-hp':{ name:'Discrete time · first difference', dt:true, hp:true,
        sl:{min:2,max:8,step:1,val:4,label:'Impulse-train period $N$'},
        tex:'H(e^{j\\omega})=0.5-0.5\\,e^{-j\\omega}' },
      'dt-lp':{ name:'Discrete time · two-point average', dt:true, hp:false,
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
      const A1 = PLOT.Axes({w:760,h:215,xr,yr,xlabel:c.dt?'n':'t',
        pad:{l:52,r:24,t:24,b:34},xtarget:7,ytarget:4});
      if(c.dt){
        const p=[],q=[]; for(let i=-12;i<=12;i++){
          p.push([i, (((i%m.N)+m.N)%m.N===0)?1:0]); q.push([i,out(m,i)]); }
        A1.stem(p,{color:PLOT.COL.in,r:3,showZero:true});
        A1.stem(q,{color:PLOT.COL.out,r:2.4,showZero:true});
      } else {
        A1.curve(xCT,{color:PLOT.COL.in,n:2400});
        A1.curve(t=>out(m,t),{color:PLOT.COL.out,n:2400});
      }
      A1.note(xr[1]-0.15,yr[1]-0.30,'x',{anchor:'end',color:PLOT.COL.in,fs:15,tex:true});
      A1.note(xr[1]-0.15,yr[0]+0.45,'y',{anchor:'end',color:PLOT.COL.out,fs:15,tex:true});

      /* panel 2 — the frequency response, sampled at the harmonics */
      const wmax = c.dt ? Math.PI : 4*Math.PI;
      const A2 = PLOT.Axes({w:760,h:185,xr:[-wmax,wmax],yr:[-0.12,1.25],
        xlabel:c.dt?'\\omega\\;[\\text{rad/sample}]':'\\omega\\;[\\text{rad/s}]',ylabel:'|H|',
        pad:{l:56,r:24,t:26,b:36},xtarget:5,ytarget:3});
      A2.curve(w=>cabs(c.dt?Hdt(w,c.hp):Hct(w,par,c.hp)),{color:PLOT.COL.h,n:1400});
      for(let k=-m.K;k<=m.K;k++){ const w=k*m.w0; if(Math.abs(w)>wmax) continue;
        A2.point(w, cabs(m.H(k)), {color:PLOT.COL.coral,r:4}); }

      /* panel 3 — input and output coefficient magnitudes */
      const KR = m.K+1;
      const ma=[], mb=[];
      for(let k=-KR;k<=KR;k++){ ma.push([k,cabs(m.a(k))]); mb.push([k,cabs(m.b(k))]); }
      const topc = Math.max(0.05, Math.max.apply(null, ma.concat(mb).map(p=>p[1])));
      const A3 = PLOT.Axes({w:760,h:185,xr:[-KR-0.6,KR+0.6],yr:[-0.08*topc,1.3*topc],
        xlabel:'k',pad:{l:56,r:24,t:26,b:32},xtarget:5,ytarget:3});
      A3.stem(ma,{color:PLOT.COL.in,r:3.4,showZero:true});
      A3.stem(mb,{color:PLOT.COL.out,r:2.4,showZero:true});
      A3.note(-KR-0.4,1.16*topc,'|a_k|',{anchor:'start',color:PLOT.COL.in,fs:14,tex:true});
      A3.note(KR+0.4,1.16*topc,'|b_k|',{anchor:'end',color:PLOT.COL.out,fs:14,tex:true});

      root.querySelector('.plots').innerHTML = [A1,A2,A3].map(p=>p.svg()).join('');

      /* the assembled output, term by term */
      const rows=[]; const last = m.N!=null && m.N%2===0 ? m.K : null;
      rows.push(['Harmonic 0', T(`b_0=${fmt(m.b(0).re,4)}`,false)]);
      for(let k=1;k<=m.K;k++){
        const bk=m.b(k);
        if(k===last){ rows.push([`Harmonic ${k}`, T(`b_{${k}}(-1)^{n}=${fmt(bk.re,4)}\\,(-1)^{n}`,false)]); continue; }
        rows.push([`Harmonic ${k}`, T(`${pair?2:1}\\,|b_{${k}}|=${fmt((pair?2:1)*cabs(bk),4)}`
          + `\\quad\\text{phase }${fmt((pair?1:-1)*carg(bk),4)}`,false)]);
      }
      root.querySelector('.terms').innerHTML = rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${k}</div><div class="wex-v">${v}</div></div>`).join('');

      root.querySelector('.hdef').innerHTML = T(c.tex,true);
      root.querySelector('.casename').textContent = c.name;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Harmonics carried</dt><dd>${2*m.K+1}</dd></div>
        <div><dt>${c.dt?'Fundamental period N':'Cutoff (rad/s)'}</dt><dd class="okv">${c.dt?m.N:fmt(par,2)}</dd></div>
        <div><dt>Output average</dt><dd>${fmt(m.b(0).re,4)}</dd></div>
        <div><dt>Output swing</dt><dd>${fmt(lo,3)} to ${fmt(hi,3)}</dd></div>`;

      root.querySelector('.pairnote').innerHTML = M(pair
        ? `<div class="note ok"><span class="note-h">Pairing on</span>
             Each conjugate pair is being combined as $b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}
             =2|b_k|\\cos(k\\omega_0t+\\angle b_k)$. The amplitudes above carry the factor of two and the
             phases are taken from positive $k$.</div>`
        : `<div class="note err"><span class="note-h">Pairing off</span>
             Only one member of each pair is being kept, and the phase is read from the negative index.
             Compare the output swing with the value the pairing gives: it is halved, and the shape is wrong
             as well, because every phase has changed sign.</div>`);

      const sl = root.querySelector('[data-v=par]');
      sl.min=c.sl.min; sl.max=c.sl.max; sl.step=c.sl.step; sl.value=par;
      root.querySelector('.parlabel').innerHTML = M(c.sl.label);
      root.querySelector('[data-out=par]').textContent = c.dt?String(Math.round(par)):fmt(par,2);
      root.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
      root.querySelectorAll('[data-fac]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.fac==='on')===pair)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="casename"></span></p>
            <div class="hdef eq key" style="padding:12px 18px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>System <span class="seg">
                ${Object.keys(cases).map(k=>`<button data-case="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1</span></label>
                <input type="range" data-v="par" min="0.2" max="6" step="0.2" value="1"></div>
              <div class="ctrl"><label>Conjugate-pair step <span class="seg">
                <button data-fac="on">with the factor 2</button>
                <button data-fac="off">without it</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div><p class="eyebrow" style="margin-bottom:8px"><span class="tick"></span>The assembled output, term by term</p>
              <div class="wex terms"></div></div>
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

  return { F, G };
})());
