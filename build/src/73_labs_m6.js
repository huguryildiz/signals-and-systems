/* ==========================================================================
   Laboratory 6.2 (key I) — Module 6  [Source: 65–68]
   The standard pairs explorer. One sequence of section 6.2 at a time: the
   unit sample, the shifted sample, the rectangular window, the one-sided and
   two-sided exponentials and the ideal low-pass band. Every spectrum panel
   shows three periods of 2*pi and marks one, because that is the property
   that separates this transform from the continuous-time one. Every displayed
   number is computed from the definitions at interaction time.
   Card language of Module 1 (as Laboratory 5.2, build/src/72_labs_m5.js):
   legends inside .plot-wrap, computed equations as tabbed .eq cards, notes as
   tabbed cards, no bare inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
  const PI = Math.PI;

  /* ---------- shared frame helpers ---------- */
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
  /* Two ticks at the same value print two labels on top of each other, which is
     a collision. A computed tick list is deduplicated before it is used. */
  const uniq = a => a.filter((v,i,arr)=>arr.findIndex(u=>Math.abs(u-v)<1e-6)===i);
  /* A frequency tick is crossed by the data whenever the quantity drawn changes
     sign, because the tick row sits on the zero line. Those panels label the
     two ends of the marked period only. */
  const wPi = v => Math.abs(Math.abs(v)-PI) < 1e-9 ? piTick(v) : '';
  const WLO = -3*PI, WHI = 3*PI;

  /* The period markers of every spectrum panel: the one period -pi..pi is
     shaded and bracketed, so the copies either side can be compared with it. */
  function frame(a, top){
    a.rect(-PI, a.o.yr[0], PI, a.o.yr[1], {fill:'rgba(190,85,57,.07)'});
    for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    /* the name of the dependent variable is anchored on the zero line, which is
       the middle of a symmetric frequency axis, so the words go to the left of
       the bracket rather than above its midpoint */
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }

  /* =======================================================================
     I · THE STANDARD PAIRS EXPLORER                  [Source: 65–68]
     ======================================================================= */
  const I = (() => {
    /* `X` returns the transform as [re, im]. A `real` transform is plotted
       signed, so the negative lobes of the Dirichlet kernel show; the others
       are plotted as magnitude and phase in two panels. */
    const sigs = {
      delta:{ name:'Unit sample', btn:'sample', real:true, xr:[-10,10],
        sl:{min:0.5,max:3,step:0.5,val:1,label:'Amplitude $A$'},
        x:(n,p)=> n===0?p:0,
        X:(w,p)=>[p,0],
        tex:p=>'x[n]='+fmt(p,2)+'\\,\\delta[n]\\;\\longleftrightarrow\\;X(e^{j\\omega})='+fmt(p,2) },
      shift:{ name:'Shifted sample', btn:'shifted', real:false, xr:[-10,10],
        sl:{min:-5,max:5,step:1,val:3,label:'Shift $n_0$'},
        x:(n,p)=> n===Math.round(p)?1:0,
        X:(w,p)=>[Math.cos(p*w), -Math.sin(p*w)],
        tex:p=>'\\delta[n-('+fmt(p,0)+')]\\;\\longleftrightarrow\\;e^{-j\\omega('+fmt(p,0)+')}' },
      rect:{ name:'Rectangular window', btn:'window', real:true, xr:[-10,10],
        sl:{min:1,max:6,step:1,val:2,label:'Half-width $N_1$'},
        x:(n,p)=> Math.abs(n)<=Math.round(p)?1:0,
        X:(w,p)=>{ const N=Math.round(p), s=Math.sin(w/2);
          return [Math.abs(s)<1e-9 ? 2*N+1 : Math.sin(w*(N+0.5))/s, 0]; },
        tex:p=>'x[n]=1,\\ |n|\\le'+fmt(p,0)+'\\;\\longleftrightarrow\\;\\frac{\\sin('+fmt(Math.round(p)+0.5,1)+'\\omega)}{\\sin(\\omega/2)}' },
      geo:{ name:'One-sided exponential', btn:'one-sided', real:false, xr:[-4,16],
        sl:{min:-0.9,max:0.9,step:0.05,val:0.5,label:'Ratio $a$'},
        x:(n,p)=> n>=0?Math.pow(p,n):0,
        X:(w,p)=>{ const d=1-2*p*Math.cos(w)+p*p; return [(1-p*Math.cos(w))/d, -p*Math.sin(w)/d]; },
        tex:p=>'('+fmt(p,2)+')^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{1-('+fmt(p,2)+')e^{-j\\omega}}' },
      two:{ name:'Two-sided exponential', btn:'two-sided', real:true, xr:[-10,10],
        sl:{min:0.05,max:0.9,step:0.05,val:0.5,label:'Ratio $a$'},
        x:(n,p)=> Math.pow(p,Math.abs(n)),
        X:(w,p)=>[(1-p*p)/(1-2*p*Math.cos(w)+p*p), 0],
        tex:p=>'('+fmt(p,2)+')^{|n|}\\;\\longleftrightarrow\\;\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}},\\ a='+fmt(p,2) },
      lpf:{ name:'Ideal low-pass band', btn:'low-pass', real:true, xr:[-16,16],
        sl:{min:0.1,max:1,step:0.05,val:0.25,label:'Band edge $W/\\pi$'},
        x:(n,p)=> n===0 ? p : Math.sin(p*PI*n)/(PI*n),
        X:(w,p)=>[Math.abs(wrap(w))<=p*PI+1e-12 ? 1 : 0, 0],
        tex:p=>'\\frac{\\sin(Wn)}{\\pi n}\\;\\longleftrightarrow\\;1\\ \\text{on}\\ |\\omega|\\le W,\\ W='+fmt(p,2)+'\\pi' }
    };
    let key='geo', par=sigs.geo.sl.val;

    const mag = c => Math.hypot(c[0],c[1]);
    const arg = c => mag(c)<1e-12 ? 0 : Math.atan2(c[1],c[0]);
    /* a principal-value phase jumps by 2*pi; the curve is broken there rather
       than joined by a vertical stroke. curve() samples in increasing omega, so
       the previous value is carried from one call to the next. */
    const broken = f => { let prev=null; return w => { const v=f(w);
      const jump = prev!==null && Math.abs(v-prev) > PI; prev=v; return jump ? NaN : v; }; };

    function draw(root){
      const s = sigs[key], p = par;

      /* ---- the numbers: one period, sampled with 0 and +-pi on the grid ---- */
      let mx=0, mn=Infinity, phmax=0, xmin=Infinity, xmax=-Infinity;
      for(let i=0;i<=4000;i++){ const w=-PI+2*PI*i/4000, c=s.X(w,p), m=mag(c);
        if(m>mx) mx=m; if(m<mn) mn=m; if(c[0]<xmin) xmin=c[0]; if(c[0]>xmax) xmax=c[0];
        const ph=Math.abs(arg(c)); if(ph>phmax) phmax=ph; }
      /* a zero of the Dirichlet kernel comes out as a rounding residue */
      if(mn < 1e-9) mn = 0;
      const X0 = s.X(0,p)[0];

      /* ---- panel 1: the sequence ---- */
      const pts = []; for(let n=s.xr[0]; n<=s.xr[1]; n++) pts.push([n, s.x(n,p)]);
      const vmax = Math.max(...pts.map(q=>q[1])), vmin = Math.min(0, ...pts.map(q=>q[1]));
      const A1 = PLOT.Axes({w:760,h:s.real?186:160,xr:s.xr,
        yr:[vmin<0 ? 1.25*vmin-0.05*vmax : -0.18*vmax, 1.32*vmax],
        xlabel:'n',ylabel:'x[n]',pad:{l:58,r:24,t:26,b:34},xtarget:8,ytarget:3,yticksLeft:true});
      A1.stem(pts,{color:PLOT.COL.in,showZero:true});

      const W = {xr:[WLO,WHI], xlabel:'\\omega', xticksOverride:wTicks(WLO,WHI,PI), yticksLeft:true};
      let html = `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}</div></div>`;
      if(s.real){
        /* signed transform, with its least and largest values on the axis */
        const top = Math.max(xmax, 1e-6), bot = Math.min(xmin, 0);
        const A2 = PLOT.Axes(Object.assign({w:760,h:236,
          yr:[bot<-1e-9 ? 1.3*bot-0.06*top : -0.14*top, 1.46*top],
          ylabel:'X(e^{j\\omega})',pad:{l:70,r:24,t:32,b:38},xtickfmt:xmin<-1e-9?wPi:piTick,
          yticksOverride:uniq([xmin<-1e-9?xmin:0, xmax].concat(xmin>1e-9?[xmin]:[])),ytickfmt:v=>fmt(v,4)}, W));
        frame(A2, 1.26*top);
        A2.curve(w=>s.X(w,p)[0],{color:PLOT.COL.mid,width:2.3,n:key==='lpf'?8000:4000});
        html += `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('mid','X(e^{j\\omega})')}</div></div>`;
      } else {
        const top = Math.max(mx, 1e-6);
        const A2 = PLOT.Axes(Object.assign({w:760,h:150,yr:[-0.16*top,1.46*top],
          ylabel:'|X(e^{j\\omega})|',pad:{l:70,r:24,t:28,b:36},xtickfmt:piTick,
          yticksOverride:uniq([mn,mx]),ytickfmt:v=>fmt(v,4)}, W));
        frame(A2, 1.26*top);
        A2.curve(w=>mag(s.X(w,p)),{color:PLOT.COL.mid,width:2.3,n:4000});
        /* a wrapping phase needs the whole range -pi..pi; a small one is drawn
           to its own size, with its extremes on the axis. The phase crosses its
           zero line at the period markers, where the tick numbers would sit, so
           this panel reads its frequency scale off the magnitude panel above
           and the dashed markers at odd multiples of pi. */
        const big = phmax > 2.5, ph = Math.max(phmax, 0.05);
        const A3 = PLOT.Axes(Object.assign({w:760,h:150,yr:big?[-4.3,5.6]:[-1.35*ph,1.95*ph],
          ylabel:'\\angle X(e^{j\\omega})\\;(\\text{rad})',pad:{l:70,r:24,t:28,b:36},xtickfmt:()=>'',
          yticksOverride:big?[-PI,PI]:uniq([-phmax,phmax]),ytickfmt:v=>fmt(v,big?2:4)}, W));
        frame(A3, big?4.3:1.6*ph);
        A3.curve(broken(w=>arg(s.X(w,p))),{color:PLOT.COL.mid,width:2,n:6000});
        html += `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('mid','|X(e^{j\\omega})|')}</div></div>`
              + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('mid','\\angle X(e^{j\\omega})')}</div></div>`;
      }
      root.querySelector('.plots').innerHTML = html;

      /* ---- the readouts, every one computed here ---- */
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$X(e^{j0})$</dt><dd class="okv">${fmt(X0,4)}</dd></div>
        <div><dt>Largest $|X|$</dt><dd>${fmt(mx,4)}</dd></div>
        <div><dt>Smallest $|X|$</dt><dd>${fmt(mn,4)}</dd></div>
        <div><dt>Largest $|\\angle X|$</dt><dd>${fmt(phmax,4)} rad</dd></div>`);

      root.querySelector('.signame').textContent = s.name;

      const n0 = Math.round(p), N1 = Math.round(p), m = Math.abs(p);
      const note =
        key==='delta'
        ? `<div class="note def"><span class="note-h">Flat spectrum</span>
             One sample at $n=0$ gives the constant $A$ at every $\\omega$. A constant already repeats
             every $2\\pi$.</div>`
        : key==='shift'
        ? `<div class="note warn"><span class="note-h">Principal value</span>
             $|X|=1$ and the phase is the line $-n_0\\omega$, folded into $(-\\pi,\\pi]$.
             ${n0===0 ? 'At $n_0=0$ the phase is $0$.'
               : `The sawtooth repeats every $2\\pi/|n_0|=${fmt(2*PI/Math.abs(n0),4)}$ rad.`}</div>`
        : key==='rect'
        ? `<div class="note warn"><span class="note-h">Real, not zero-phase</span>
             The peak is $2N_1+1=${2*N1+1}$ and the least value $${fmt(xmin,4)}$. Where $X<0$ the angle
             is $\\pi$, although $X$ is real.</div>`
        : key==='geo'
        ? `<div class="note ok"><span class="note-h">Closed forms</span>
             $1/(1-|a|)=${fmt(1/(1-m),4)}$, $1/(1+|a|)=${fmt(1/(1+m),4)}$ and
             $\\arcsin|a|=${fmt(Math.asin(m),4)}$ rad: the extremes the plots reach.</div>`
        : key==='two'
        ? `<div class="note ok"><span class="note-h">Real and positive</span>
             $(1+a)/(1-a)=${fmt((1+p)/(1-p),4)}$ at $\\omega=0$ and $(1-a)/(1+a)=${fmt((1-p)/(1+p),4)}$ at
             $\\omega=\\pm\\pi$. $X>0$ everywhere, so the phase is $0$.</div>`
        : `<div class="note def"><span class="note-h">Sinc convention</span>
             $x[n]=\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$ with $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$,
             unnormalised; $x[0]=W/\\pi=${fmt(p,4)}$. A wider band gives a shorter sequence.</div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Transform pair</span>${T(s.tex(p),true)}</div>` + note);

      const sl = root.querySelector('[data-v=par]');
      sl.min=s.sl.min; sl.max=s.sl.max; sl.step=s.sl.step; sl.value=p;
      root.querySelector('.parlabel').innerHTML = M(s.sl.label);
      root.querySelector('[data-out=par]').textContent = fmt(p,2);
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
              <div class="ctrl"><label>Sequence</label><span class="seg">
                ${Object.keys(sigs).map(k=>`<button data-case="${k}">${sigs[k].btn}</button>`).join('')}</span></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1</span></label>
                <input type="range" data-v="par" min="0" max="1" step="1" value="0"></div>
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

  return { I };
})());
