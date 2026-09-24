/* ==========================================================================
   Laboratory 6.3 (key I3) — Module 6
   A periodic sequence and its transform: impulses of weight 2*pi*a_k at
   2*pi*k/N, drawn over three periods with one period marked. Every displayed
   number is computed from the definitions at interaction time: a_k by the
   analysis sum of the series over one period, the period N from the
   frequency, the reduced frequency by subtracting whole turns of 2*pi.
   Styled like build/src/72_labs_m5b.js: legends inside .plot-wrap, computed
   equations as tabbed .eq cards, notes as tabbed cards, no bare inline pixel
   font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F, gcd = LABS.KIT.gcd;
  const N4 = (v,d=4)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* =======================================================================
     I3 · PERIODIC SEQUENCES AND THEIR IMPULSE SPECTRA     [Source: 68–71]
     ======================================================================= */
  const I3 = (() => {
    /* p*pi/q in TeX, with the sign in front */
    const piTex = (p,q) => { if(p===0) return '0';
      const g=gcd(p,q); p/=g; q/=g; const sg=p<0?'-':'', a=Math.abs(p);
      const num = a===1 ? '\\pi' : a+'\\pi';
      return q===1 ? sg+num : sg+'\\tfrac{'+num+'}{'+q+'}'; };
    /* the same with a slash, for an exponent */
    const piSl = (p,q) => piTex(p,q).replace(/\\tfrac\{(.+?)\}\{(\d+)\}/,'$1/$2');
    /* a tick number at a multiple of pi (plain text: it is part of the scale) */
    const piTick = v => { const r=Math.round(v/PI); if(r===0) return '0';
      return (r<0?'-':'')+(Math.abs(r)===1?'':Math.abs(r))+'π'; };
    /* the one period -pi < w <= pi: subtract whole turns of 2*pi.
       A frequency p*pi/q becomes (p - 2*q*t)*pi/q for the integer t used. */
    const turns = (p,q) => { let t=Math.round(p/(2*q)); if(p-2*q*t <= -q) t-=1; return t; };

    const seqs = {
      cexp:{ par:'Frequency $\\omega_0$', freq:true,
        opts:[[1,4],[3,4],[7,4],[9,4]], def:3 },
      cos: { par:'Frequency $\\omega_0$', freq:true,
        opts:[[1,3],[2,3],[5,3],[7,3]], def:2 },
      sq:  { par:'Period $N$, with $N_1=2$', freq:false,
        opts:[8,10,20,30], def:1 },
      imp: { par:'Period $N$', freq:false,
        opts:[3,5,8,12], def:1 }
    };
    let key='cexp', idx=seqs.cexp.def;

    /* the sequence at integer n, as [re, im] */
    function xAt(n){
      const s=seqs[key], o=s.opts[idx];
      if(key==='cexp'){ const w=o[0]*PI/o[1]; return [Math.cos(w*n), Math.sin(w*n)]; }
      if(key==='cos'){ const w=o[0]*PI/o[1]; return [Math.cos(w*n), 0]; }
      if(key==='sq'){ const m=n-o*Math.round(n/o); return [Math.abs(m)<=2?1:0, 0]; }
      return [(((n%o)+o)%o)===0?1:0, 0];
    }
    /* the period: for a frequency p*pi/q it is 2q/gcd(p,2q) */
    function period(){
      const s=seqs[key], o=s.opts[idx];
      return s.freq ? 2*o[1]/gcd(o[0],2*o[1]) : o;
    }

    function draw(root){
      const s=seqs[key], o=s.opts[idx], N=period();
      /* a_k by the analysis sum of the series over 0 <= n <= N-1 */
      const w2=[];
      for(let k=0;k<N;k++){ let re=0, im=0;
        for(let n=0;n<N;n++){ const [xr,xi]=xAt(n), th=-2*PI*k*n/N;
          re += xr*Math.cos(th)-xi*Math.sin(th); im += xr*Math.sin(th)+xi*Math.cos(th); }
        w2.push(Math.abs(re) < 1e-9 ? 0 : 2*PI*re/N); }
      const nz = w2.filter(v=>Math.abs(v)>1e-9).length;
      const neg = w2.filter(v=>v<-1e-9).length;
      const sum = w2.reduce((a,b)=>a+b,0);

      /* panel 1 — the sequence (its real part for the exponential), period marked */
      const lo=-Math.max(6,Math.round(0.5*N)), hi=Math.max(18,Math.round(1.6*N));
      const yr1 = s.freq ? [-1.45,1.9] : [-0.35,1.7];
      const A1 = PLOT.Axes({w:760,h:250,xr:[lo-0.5,hi+0.5],yr:yr1,xlabel:'n',
        ylabel:key==='cexp'?'\\operatorname{Re}\\{x[n]\\}':'x[n]',
        pad:{l:60,r:24,t:22,b:32},yticksLeft:true,yticksOverride:s.freq?[-1,0,1]:[0,1],
        /* x[mN] = x[0] = 1 for every sequence here, so a tick at a multiple of N
           never sits under a negative stem */
        xticksOverride:Array.from({length:Math.floor(hi/N)-Math.ceil(lo/N)+1},(_,i)=>(Math.ceil(lo/N)+i)*N)});
      const st=[]; for(let n=lo;n<=hi;n++) st.push([n,xAt(n)[0]]);
      A1.stem(st,{color:PLOT.COL.in,r:N>20?2.6:3.6,width:N>20?1.4:1.8});
      A1.span(0,N,s.freq?1.45:1.35,'N='+N,{tex:true,color:PLOT.COL.coral});

      /* panel 2 — X(e^{jw}): weight 2*pi*a_k at 2*pi*k/N, over three periods */
      const top=Math.max.apply(null,w2), bot=Math.min(0,Math.min.apply(null,w2));
      const vMark=top*1.2+0.15;
      const A2 = PLOT.Axes({w:760,h:240,xr:[-3*PI,3*PI],yr:[bot*1.3-0.12*top,top*1.42+0.2],
        xlabel:'\\omega',ylabel:'X(e^{j\\omega})',pad:{l:60,r:24,t:22,b:30},yticksLeft:true,
        yticksOverride:bot<0?[bot,top]:[top],ytickfmt:v=>N4(v,2),
        xticksOverride:[-3,-2,-1,0,1,2,3].map(m=>m*PI),xtickfmt:piTick});
      const K=Math.floor(1.5*N);
      for(let k=-K;k<=K;k++){ const v=w2[((k%N)+N)%N], w=2*PI*k/N;
        if(Math.abs(v)>1e-9 && Math.abs(w)<3*PI-1e-6)
          A2.impulse(w,v,{color:PLOT.COL.in,label:false,width:N>20?1.5:2.1}); }
      A2.vline(-PI,{color:PLOT.COL.coral,opacity:.5}); A2.vline(PI,{color:PLOT.COL.coral,opacity:.5});
      A2.span(-PI,PI,vMark,'',{color:PLOT.COL.coral});
      A2.note(-PI,vMark,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});

      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in',key==='cexp'?'\\operatorname{Re}\\{x[n]\\}':'x[n]')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','2\\pi a_k')}</div></div>`;

      /* readouts */
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Period $N$</dt><dd class="okv">${N}</dd></div>
        <div><dt>Spacing</dt><dd>${N4(2*PI/N)}</dd></div>
        <div><dt>At $\\omega=0$</dt><dd>${N4(w2[0])}</dd></div>
        <div><dt>Nonzero</dt><dd>${nz} of ${N}</dd></div>`);

      /* cards */
      let cards='';
      if(s.freq){
        const t=turns(o[0],o[1]), pr=o[0]-2*o[1]*t, wT=piTex(o[0],o[1]), rT=piTex(pr,o[1]);
        cards += key==='cexp'
          ? `<div class="eq"><span class="eq-label">Impulse weights</span>${T('X(e^{j\\omega})=2\\pi\\textstyle\\sum_{k}\\delta\\!\\left(\\omega'+(pr<0?'+'+piTex(-pr,o[1]):'-'+rT)+'-2\\pi k\\right)',true)}</div>`
          : `<div class="eq"><span class="eq-label">Impulse weights</span>${T('X(e^{j\\omega})=\\pi\\textstyle\\sum_{k}\\Bigl[\\delta\\!\\left(\\omega-'+piTex(Math.abs(pr),o[1])+'-2\\pi k\\right)+\\delta\\!\\left(\\omega+'+piTex(Math.abs(pr),o[1])+'-2\\pi k\\right)\\Bigr]',true)}</div>`;
        cards += `<div class="eq"><span class="eq-label">Reduce into $(-\\pi,\\pi]$</span>${T(t===0
            ? '\\omega_0='+wT+'\\ \\text{ is already in range}'
            : '\\omega_0='+wT+'\\;\\to\\;'+wT+'-'+(t===1?'':t)+'2\\pi='+rT,true)}</div>`;
        cards += key==='cexp'
          ? `<div class="note warn"><span class="note-h">Same samples</span>${t===0
              ? 'Try the frequency $2\\pi$ higher. Its stems and its impulses are the same as these.'
              : `$e^{j(${piSl(o[0],o[1])})n}$ and $e^{j(${piSl(pr,o[1])})n}$ agree at every integer $n$, so they have one spectrum.`}</div>`
          : `<div class="note warn"><span class="note-h">Both signs of frequency</span>Each period holds an impulse at $+${piTex(Math.abs(pr),o[1])}$ and one at $-${piTex(Math.abs(pr),o[1])}$, each of weight $\\pi$.</div>`;
      } else {
        cards += key==='sq'
          ? `<div class="eq"><span class="eq-label">Impulse weights</span>${T('2\\pi a_k=\\frac{2\\pi}{'+N+'}\\,\\frac{\\sin(5\\pi k/'+N+')}{\\sin(\\pi k/'+N+')},\\qquad 2\\pi a_0=\\frac{2\\pi\\cdot5}{'+N+'}='+N4(w2[0]),true)}</div>`
          : `<div class="eq"><span class="eq-label">Impulse weights</span>${T('X(e^{j\\omega})=\\frac{2\\pi}{'+N+'}\\textstyle\\sum_{k}\\delta\\bigl(\\omega-2\\pi k/'+N+'\\bigr),\\qquad\\dfrac{2\\pi}{'+N+'}='+N4(2*PI/N),true)}</div>`;
        cards += `<div class="eq"><span class="eq-label">Weights in one period</span>${T('\\textstyle\\sum_{k=0}^{'+(N-1)+'}2\\pi a_k=2\\pi\\,x[0]='+N4(sum),true)}</div>`;
        cards += key==='sq'
          ? `<div class="note warn"><span class="note-h">Zeros and signs</span>In one period, ${N-nz} of the ${N} weights are zero and ${neg} are negative. An arrow of negative weight points down.</div>`
          : `<div class="note ok"><span class="note-h">All weights equal</span>Every $a_k=1/N$, so every impulse has the weight $2\\pi/N$ and one period holds $N$ of them.</div>`;
      }
      root.querySelector('.derive').innerHTML = M(cards);

      /* controls */
      root.querySelector('.parctrl').innerHTML = M(`<label><span>${s.par}</span> <span class="seg">${s.opts.map((v,i)=>
        `<button data-seg="par" data-val="${i}" aria-pressed="${i===idx}">${s.freq?'$'+(v[0]===1?'':v[0])+'\\pi/'+v[1]+'$':v}</button>`).join('')}</span></label>`);
      root.querySelectorAll('[data-seg="sig"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===key)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:8px"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label><span>Sequence</span> <span class="seg">
                <button data-seg="sig" data-val="cexp">exponential</button>
                <button data-seg="sig" data-val="cos">cosine</button>
                <button data-seg="sig" data-val="sq">square</button>
                <button data-seg="sig" data-val="imp">train</button></span></label></div>
              <div class="ctrl parctrl"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('click', e=>{
        const p=e.target.closest('[data-seg="par"]');
        if(p){ idx=parseInt(p.dataset.val,10); draw(root); RENDER.fit(); return; }
        const b=e.target.closest('[data-seg="sig"]');
        if(!b) return;
        key=b.dataset.val; idx=seqs[key].def;
        draw(root); RENDER.fit();
      });
      draw(root);
    }};
  })();

  return { I3 };
})());
