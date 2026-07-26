/* ==========================================================================
   Laboratory I — Module 6  [Source: 65–79]
   DTFT Periodicity Explorer. Every panel that shows a spectrum shows more than
   one period of 2*pi and marks the period, because that is the property the
   laboratory exists to make visible. Every displayed number is computed from
   the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
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
  const uniq = a => a.filter((v,i,arr)=>arr.findIndex(u=>Math.abs(u-v)<1e-9)===i);
  /* A frequency tick is crossed by the data whenever the quantity drawn changes
     sign, because the tick row sits on the zero line. The phase panel therefore
     labels the two ends of the marked period only. */
  const wPi = v => Math.abs(Math.abs(v)-PI) < 1e-9 ? piTick(v) : '';
  const WLO = -3*PI, WHI = 3*PI;

  /* The period markers of every spectrum panel. `hl` shades the one period the
     user has chosen to highlight, so the copies either side of it can be
     compared against it directly. */
  function frame(a, top, hl){
    if(hl) a.rect(-PI, a.o.yr[0], PI, top, {fill:'rgba(190,85,57,.08)'});
    for(const m of [-3,-1,1,3]) a.vline(m*PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    /* the name of the dependent variable is anchored on the zero line, which is
       the middle of a symmetric frequency axis, so the words go to the left of
       the bracket rather than above its midpoint */
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }

  /* =======================================================================
     I · DTFT PERIODICITY EXPLORER                   [Source: 65–79]
     ======================================================================= */
  const I = (() => {
    /* Each sequence carries one parameter. `kind` says whether the transform is
       an ordinary function of omega or a train of impulses; the two are drawn
       differently because an impulse has a weight and not a value. */
    const seqs = [
      { id:'delta', name:'Unit sample', kind:'curve',
        tex:'x[n]=A\\,\\delta[n]', par:{key:'A', label:'Amplitude A', min:0.5, max:3, step:0.5, val:1, tex:'A'},
        xr:[-12,12], x:(n,p)=> n===0?p:0,
        X:(w,p)=>[p,0],
        Xtex:p=>'X(e^{j\\omega})='+fmt(p,3),
        say:'A single sample has a flat spectrum. Flat is already periodic, so nothing here can be mistaken for a spectrum that stops.' },

      { id:'shift', name:'Shifted sample', kind:'curve',
        tex:'x[n]=\\delta[n-n_0]', par:{key:'n0', label:'Shift n₀', min:-5, max:5, step:1, val:3, tex:'n_0'},
        xr:[-12,12], x:(n,p)=> n===Math.round(p)?1:0,
        X:(w,p)=>[Math.cos(p*w), -Math.sin(p*w)],
        Xtex:p=>'X(e^{j\\omega})=e^{-j\\omega\\,('+fmt(p,0)+')}',
        say:'The magnitude is 1 everywhere and the phase is the straight line −n₀ω, drawn as its principal value. The sawtooth is the wrapping, and its period is 2π/|n₀|.' },

      { id:'rect', name:'Rectangular window', kind:'curve',
        tex:'x[n]=1,\\;|n|\\le N_1', par:{key:'N1', label:'Half-width N₁', min:1, max:6, step:1, val:2, tex:'N_1'},
        xr:[-14,14], x:(n,p)=> Math.abs(n)<=Math.round(p)?1:0,
        X:(w,p)=>{ const s=Math.sin(w/2);
          return [Math.abs(s)<1e-9 ? 2*Math.round(p)+1 : Math.sin(w*(Math.round(p)+0.5))/s, 0]; },
        Xtex:p=>'X(e^{j\\omega})=\\dfrac{\\sin\\!\\bigl(\\omega('+fmt(p,0)+'+\\tfrac12)\\bigr)}{\\sin(\\omega/2)}',
        say:'This transform is real and it changes sign, so its phase is 0 on the positive lobes and π on the negative ones. Real does not mean zero-phase.' },

      { id:'geo', name:'One-sided exponential', kind:'curve',
        tex:'x[n]=a^{n}u[n]', par:{key:'a', label:'Ratio a', min:-0.9, max:0.9, step:0.05, val:0.5, tex:'a'},
        xr:[-6,18], x:(n,p)=> n>=0?Math.pow(p,n):0,
        X:(w,p)=>{ const d=1-2*p*Math.cos(w)+p*p;
          return [(1-p*Math.cos(w))/d, -p*Math.sin(w)/d]; },
        Xtex:p=>'X(e^{j\\omega})=\\dfrac{1}{1-'+fmt(p,3)+'e^{-j\\omega}}',
        say:'The magnitude runs between 1/(1+|a|) and 1/(1−|a|); the largest phase is arcsin|a|. All three are closed forms, so none has to be read off the frame of a plot.' },

      { id:'two', name:'Two-sided exponential', kind:'curve',
        tex:'x[n]=a^{|n|}', par:{key:'b', label:'Ratio a', min:0.05, max:0.9, step:0.05, val:0.5, tex:'a'},
        xr:[-14,14], x:(n,p)=> Math.pow(p,Math.abs(n)),
        X:(w,p)=>[(1-p*p)/(1-2*p*Math.cos(w)+p*p), 0],
        Xtex:p=>'X(e^{j\\omega})=\\dfrac{1-'+fmt(p*p,4)+'}{1-'+fmt(2*p,3)+'\\cos\\omega+'+fmt(p*p,4)+'}',
        say:'Even and real in time, so real and even in frequency — and here also strictly positive, which is why its phase really is zero everywhere.' },

      { id:'cos', name:'Sum of two cosines', kind:'imp',
        tex:'x[n]=2\\cos(\\omega_1 n)+\\cos(\\tfrac{\\pi}{4}n)',
        par:{key:'m', label:'ω₁ in units of π/12', min:1, max:11, step:1, val:4, tex:'\\omega_1'},
        xr:[-16,16],
        x:(n,p)=> 2*Math.cos(p*PI/12*n)+Math.cos(PI/4*n),
        lines:p=>[[p*PI/12, 2*PI],[-p*PI/12, 2*PI],[PI/4, PI],[-PI/4, PI]],
        Xtex:p=>'\\omega_1=\\dfrac{'+fmt(p,0)+'\\pi}{12},\\qquad \\omega_2=\\dfrac{\\pi}{4}',
        say:'Each cosine gives one pair of impulses inside a period, and the pair repeats every 2π. The tall arrows carry weight 2π, the short ones π; the height of an arrow is its weight.' },

      { id:'train', name:'Impulse train', kind:'imp',
        tex:'x[n]=\\displaystyle\\sum_{k}\\delta[n-kN]',
        par:{key:'N', label:'Period N', min:2, max:12, step:1, val:5, tex:'N'},
        xr:[-16,16],
        x:(n,p)=> (((n % Math.round(p)) + Math.round(p)) % Math.round(p))===0 ? 1 : 0,
        lines:p=>{ const N=Math.round(p), o=[];
          for(let k=-Math.ceil(3*N/2)-1;k<=Math.ceil(3*N/2)+1;k++){ const w=2*PI*k/N;
            /* the period is half open, -pi < omega <= pi, so an even N puts an
               impulse on +pi and none on -pi: the one at -pi belongs to the copy
               to the left. Including both would count N+1 impulses in a period. */
            if(w>-PI+1e-9 && w<=PI+1e-9) o.push([w, 2*PI/N]); }
          return o; },
        Xtex:p=>'X(e^{j\\omega})=\\dfrac{2\\pi}{'+fmt(p,0)+'}\\sum_{k}\\delta\\!\\left(\\omega-\\dfrac{2\\pi k}{'+fmt(p,0)+'}\\right)',
        say:'A train of N impulses per period, each of weight 2π/N. A sparser train in time is a denser train in frequency.' }
    ];

    /* the difference-equation item is a system rather than a sequence, so it
       carries its own state: y[n] − (3r/2)y[n−1] + (r²/2)y[n−2] = 2x[n], whose
       poles are r and r/2. */
    const sysH = (w,r)=>{
      const c1=[1-r*Math.cos(w), r*Math.sin(w)], c2=[1-(r/2)*Math.cos(w), (r/2)*Math.sin(w)];
      const dre=c1[0]*c2[0]-c1[1]*c2[1], dim=c1[0]*c2[1]+c1[1]*c2[0];
      const d=dre*dre+dim*dim;
      return [2*dre/d, -2*dim/d];
    };
    const sysH0 = (n,r)=> n<0?0 : 4*Math.pow(r,n) - 2*Math.pow(r/2,n);

    let st = { si:3, mode:'spec', hl:true, w0:0, r:0.5,
               pv:seqs.map(s=>s.par.val) };

    const mag = c => Math.hypot(c[0],c[1]);
    const arg = c => Math.atan2(c[1],c[0]);

    function draw(root){
      const S = seqs[st.si], p = st.pv[st.si];
      const sys = st.mode==='sys';
      const shift = st.mode==='shift';
      const w0 = shift ? st.w0 : 0;

      /* ---- panel 1: the sequence (or the impulse response of the system) ---- */
      const xr = sys ? [-4,18] : S.xr;
      const pts = [];
      for(let n=Math.ceil(xr[0]); n<=xr[1]; n++)
        pts.push([n, sys ? sysH0(n,st.r)
                   : shift ? S.x(n,p)*Math.cos(w0*n)
                   : S.x(n,p)]);
      const vmax = Math.max(0.6, ...pts.map(q=>Math.abs(q[1])));
      const A1 = PLOT.Axes({w:820,h:138,xr:xr,yr:[-1.30*vmax,1.42*vmax],
        xlabel:'n', ylabel: sys?'h[n]':(shift?'\\operatorname{Re}\\{x[n]e^{j\\omega_0 n}\\}':'x[n]'),
        pad:{l:64,r:28,t:30,b:34}, xtarget:8, ytarget:3});
      A1.stem(pts,{color:sys?PLOT.COL.h:PLOT.COL.in,showZero:true});

      /* ---- the spectrum, sampled over three periods ---- */
      const NW = 3600, W = [];
      for(let i=0;i<=NW;i++) W.push(WLO + (WHI-WLO)*i/NW);
      const val = w => sys ? sysH(w,st.r) : S.X(wrap(w-w0), p);

      let A2, A3, mx=0, mn=Infinity, phmax=0;
      if(S.kind==='imp' && !sys){
        /* impulse spectra: replicate the one-period lines every 2*pi */
        const base = S.lines(p), arr = [];
        for(let k=-2;k<=2;k++) for(const [w,wt] of base){
          const ww = w + 2*PI*k + w0;
          if(ww>=WLO-1e-9 && ww<=WHI+1e-9) arr.push([ww,wt]);
        }
        mx = Math.max(...base.map(b=>b[1])); mn = Math.min(...base.map(b=>b[1]));
        A2 = PLOT.Axes({w:820,h:180,xr:[WLO,WHI],yr:[-0.22*mx,1.52*mx],
          xlabel:'\\omega', ylabel:'X(e^{j\\omega})', pad:{l:66,r:28,t:30,b:38},
          xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:piTick,
          yticksOverride:uniq([0,mn,mx]), ytickfmt:v=>fmt(v,4)});
        frame(A2, 1.26*mx, st.hl);
        for(const [ww,wt] of arr) A2.impulse(ww, wt, {color:PLOT.COL.in, label:false});
        A3 = PLOT.Axes({w:820,h:160,xr:[WLO,WHI],yr:[-1.15,4.35],
          xlabel:'\\omega', ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]', pad:{l:76,r:28,t:30,b:38},
          xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:piTick,
          yticksOverride:[0,PI], ytickfmt:v=>fmt(v,4)});
        frame(A3, 3.66, st.hl);
        A3.hline(0,{color:PLOT.COL.mid,dash:'6 4',opacity:.9});
        for(const [ww] of arr) A3.point(ww, 0, {color:PLOT.COL.mid, r:3.4});
      } else {
        for(const w of W){ const m=mag(val(w));
          if(m>mx) mx=m; if(m<mn) mn=m;
          const ph=Math.abs(arg(val(w))); if(ph>phmax) phmax=ph; }
        const top = Math.max(mx, 1e-6);
        A2 = PLOT.Axes({w:820,h:180,xr:[WLO,WHI],yr:[-0.16*top,1.50*top],
          xlabel:'\\omega', ylabel:'|X(e^{j\\omega})|', pad:{l:70,r:28,t:30,b:38},
          xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:piTick,
          yticksOverride:uniq([0,mn,mx]), ytickfmt:v=>fmt(v,4)});
        frame(A2, 1.26*top, st.hl);
        A2.curve(w=>mag(val(w)),{color:sys?PLOT.COL.h:PLOT.COL.in,n:4000});
        A3 = PLOT.Axes({w:820,h:160,xr:[WLO,WHI],yr:[-4.9,6.0],
          xlabel:'\\omega', ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]', pad:{l:76,r:28,t:30,b:38},
          xticksOverride:wTicks(WLO,WHI,PI), xtickfmt:wPi,
          yticksOverride:[-PI,0,PI], ytickfmt:v=>fmt(v,3)});
        frame(A3, 4.55, st.hl);
        A3.curve(w=>arg(val(w)),{color:PLOT.COL.mid,n:6000});
      }
      root.querySelector('.plots').innerHTML = [A1,A2,A3].map(z=>z.svg()).join('');

      /* ---- the equation and the readout ---- */
      root.querySelector('.lab-eq').innerHTML = T(
        sys ? 'H(e^{j\\omega})=\\dfrac{2}{\\bigl(1-'+fmt(st.r,3)+'e^{-j\\omega}\\bigr)\\bigl(1-'+fmt(st.r/2,3)+'e^{-j\\omega}\\bigr)}'
            : shift ? S.Xtex(p)+'\\quad\\text{shifted by }\\omega_0='+fmt(st.w0,3)
            : S.Xtex(p), true);

      const periods = ((WHI-WLO)/(2*PI));
      let ro = `<div><dt>Periods drawn</dt><dd class="okv">${fmt(periods,0)}</dd></div>
        `;
      if(sys){
        ro += `<div><dt>Pole radii</dt><dd>${fmt(st.r,3)} and ${fmt(st.r/2,3)}</dd></div>
          <div><dt>Stable</dt><dd class="${st.r<1?'okv':''}">${st.r<1?'yes — both poles inside the unit circle':'no'}</dd></div>
          <div><dt>h[0], h[1], h[2]</dt><dd>${[0,1,2].map(n=>fmt(sysH0(n,st.r),4)).join(', ')}</dd></div>
          <div><dt>|H| largest / smallest</dt><dd>${fmt(mx,4)} / ${fmt(mn,4)}</dd></div>`;
      } else if(S.kind==='imp'){
        const base = S.lines(p);
        ro += `<div><dt>Impulses in one period</dt><dd>${base.length}</dd></div>
          <div><dt>Weights</dt><dd>${base.map(b=>fmt(b[1],4)).filter((v,i,arr)=>arr.indexOf(v)===i).join(', ')}</dd></div>
          <div><dt>Positions in one period</dt><dd>${base.map(b=>fmt(b[0]/PI,3)+'π').join(', ')}</dd></div>`;
      } else {
        ro += `<div><dt>|X| largest / smallest</dt><dd>${fmt(mx,4)} / ${fmt(mn,4)}</dd></div>
          <div><dt>Largest |∠X|</dt><dd>${fmt(phmax,4)} rad</dd></div>`;
        if(S.id==='geo') ro += `<div><dt>Closed forms</dt><dd>1/(1−|a|) = ${fmt(1/(1-Math.abs(p)),4)} · 1/(1+|a|) = ${fmt(1/(1+Math.abs(p)),4)} · arcsin|a| = ${fmt(Math.asin(Math.abs(p)),4)}</dd></div>`;
        if(S.id==='two') ro += `<div><dt>Closed forms</dt><dd>(1+a)/(1−a) = ${fmt((1+p)/(1-p),4)} · (1−a)/(1+a) = ${fmt((1-p)/(1+p),4)}</dd></div>`;
        if(S.id==='rect') ro += `<div><dt>Value at ω = 0</dt><dd>2N₁ + 1 = ${fmt(2*Math.round(p)+1,0)}</dd></div>`;
      }
      if(shift) ro += `<div><dt>Frequency shift</dt><dd>ω₀ = ${fmt(st.w0/PI,3)}π — what leaves one end of a period arrives at the other</dd></div>`;
      root.querySelector('.ro').innerHTML = ro;

      root.querySelector('.saybox').innerHTML = M(
        sys ? 'Two real poles at $'+fmt(st.r,3)+'$ and $'+fmt(st.r/2,3)+'$. The impulse response is $h[n]=4r^{n}u[n]-2(r/2)^{n}u[n]$, and the frequency response repeats every $2\\pi$ like every other spectrum here.'
            : S.say);

      /* ---- controls ---- */
      const sl = root.querySelector('[data-v="par"]');
      sl.min = S.par.min; sl.max = S.par.max; sl.step = S.par.step; sl.value = p;
      root.querySelector('.parlab').textContent = S.par.label;
      root.querySelector('[data-out="par"]').textContent = fmt(p,3);
      root.querySelector('[data-out="w0"]').textContent = fmt(st.w0,3);
      root.querySelector('[data-out="r"]').textContent = fmt(st.r,3);
      root.querySelector('.seqname').innerHTML = M('<b>'+S.name+'</b> — $'+S.tex+'$');
      root.querySelector('.seqidx').textContent = (st.si+1)+' / '+seqs.length;
      root.querySelectorAll('[data-case]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.case===st.mode)));
      root.querySelectorAll('[data-seg="hl"]').forEach(b=>
        b.setAttribute('aria-pressed', String((b.dataset.val==='on')===st.hl)));
      /* In the difference-equation state there is no sequence to choose, so the
         selector is taken out of the layout rather than left cycling through
         items that change nothing. */
      root.querySelector('.seqctrl').style.display = sys ? 'none' : '';
      /* A control that does not apply to the state on show is taken out of the
         layout rather than greyed, so the panel keeps the height it needs and no
         more. The input itself stays in the document, so nothing is detached. */
      root.querySelector('.ctrl-w0').style.display = shift ? '' : 'none';
      root.querySelector('.ctrl-r').style.display = sys ? '' : 'none';
    }

    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:44px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl seqctrl"><label>Sequence <span class="val seqidx">1 / 7</span></label>
                <div class="small seqname" style="margin:2px 0 6px"></div>
                <button class="btn" data-nav="-1">Previous</button>
                <button class="btn primary" data-nav="1">Next signal</button></div>
              <div class="ctrl"><label>What is shown
                <span class="seg">
                  <button data-case="spec">transform</button>
                  <button data-case="shift">frequency shift</button>
                  <button data-case="sys">difference equation</button>
                </span></label></div>
              <div class="ctrl"><label><span class="parlab">Parameter</span>
                <span class="val" data-out="par">0</span></label>
                <input type="range" data-v="par" min="0" max="1" step="1" value="0"></div>
              <div class="ctrl ctrl-w0"><label>Frequency shift ω₀ <span class="val" data-out="w0">0</span></label>
                <input type="range" data-v="w0" min="-3.15" max="3.15" step="0.05" value="0"></div>
              <div class="ctrl ctrl-r"><label>Pole radius r <span class="val" data-out="r">0.5</span></label>
                <input type="range" data-v="r" min="0.05" max="0.95" step="0.05" value="0.5"></div>
              <div class="ctrl"><label>Highlight one period
                <span class="seg"><button data-seg="hl" data-val="on">on</button><button data-seg="hl" data-val="off">off</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="note def"><span class="note-h">Three periods, always</span>
              Every spectrum panel spans −3π to 3π and marks one period.
              <span class="saybox"></span></div>
          </div></div>`;
      root.addEventListener('input', e=>{
        const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='par') st.pv[st.si]=v; else st[k]=v;
        draw(root);
      });
      root.addEventListener('click', e=>{
        const c=e.target.closest('[data-case]');
        if(c){ st.mode=c.dataset.case; draw(root); return; }
        const n=e.target.closest('[data-nav]');
        if(n){ st.si=(st.si+(+n.dataset.nav)+seqs.length)%seqs.length; draw(root); return; }
        const s=e.target.closest('[data-seg="hl"]');
        if(s){ st.hl = s.dataset.val==='on'; draw(root); }
      });
      draw(root);
    }};
  })();

  return { I };
})());
