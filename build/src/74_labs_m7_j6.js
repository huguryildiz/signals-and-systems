/* ==========================================================================
   Laboratory 7.6 (key J6) — Module 7
   Decimation and interpolation of a sequence. The input is either a
   triangle-spectrum sequence of band edge wM, x[n] = (wM/2pi) (sin(wM n/2) /
   (wM n/2))^2, whose transform is a triangle of peak 1 reaching zero at wM,
   or two tones cos(wM n/2) + cos(wM n). The factor N and the operation are
   chosen, and the filter at pi/N is switched on or off:
     decimate     y[n] = x_f[nN], x_f the input after the prefilter (gain 1,
                  cutoff pi/N) or the input itself; Y(e^{jw}) = (1/N) sum_k
                  X_f(e^{j(w - 2 pi k)/N}), aliasing when N wM > pi;
     interpolate  N - 1 zeros between the samples, then the low-pass of gain N
                  and cutoff pi/N; without it the N - 1 images stay.
   Every spectrum panel spans three periods and marks one. Every displayed
   number is computed from these definitions at interaction time.
   Styled like build/src/74_labs_m7_j4.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M;
  const L = (c,l,dash)=>`<i class="lg-${c}${dash?' lg-dash':''}">${T(l,false)}</i>`;
  const PI = Math.PI;

  /* ---------- the frequency frame of the spectrum panels ---------- */
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
  const WT = [-3,-2,-1,0,1,2,3].map(k=>k*PI);
  function frame(a, top){
    a.vline(-PI,{color:PLOT.COL.coral,opacity:.5}); a.vline(PI,{color:PLOT.COL.coral,opacity:.5});
    a.span(-PI,PI,top,'',{color:PLOT.COL.coral});
    a.note(-PI,top,'\\text{one period},\\;2\\pi',{tex:true,color:PLOT.COL.coral,fs:13,anchor:'end',dx:-8,dy:-3});
    return a;
  }
  /* a multiple of pi as TeX, at most two decimals: 0.3 pi -> 0.3\pi, pi -> \pi */
  const fp = w => { const r = +(w/PI).toFixed(2);
    if(Math.abs(r) < 1e-9) return '0';
    return Math.abs(r-1) < 1e-9 ? '\\pi' : r+'\\pi'; };
  const f2 = v => String(+v.toFixed(2));
  /* a signal colour as a translucent wash, taken from the palette in use */
  const wash = (c, al) => { const n = parseInt(c.slice(1), 16);
    return `rgba(${n>>16&255},${n>>8&255},${n&255},${al})`; };

  const J6 = (() => {
    /* the sequence, the band edge in multiples of pi, the factor, the
       operation and the filter */
    let sig = 'tri', W = 0.3, N = 3, op = 'dec', filt = 'off';
    const NT = 16;                                   /* n runs over [-16, 16] */
    const on = n => ((n%N)+N)%N === 0;
    const sinc2 = u => Math.abs(u) < 1e-12 ? 1 : Math.pow(Math.sin(u)/u, 2);
    /* the triangle sequence and its transform, peak 1, band edge Wr */
    const xt = (n,Wr) => Wr/(2*PI)*sinc2(Wr*n/2);
    const Xt = (w,Wr) => { const u = Math.abs(wrap(w)); return u < Wr ? 1-u/Wr : 0; };
    /* the same triangle cut at |w| < c by the prefilter, in closed form:
       (1/pi) int_0^c (1 - w/Wr) cos(w n) dw */
    const xtc = (n,Wr,c) => { if(c >= Wr-1e-12) return xt(n,Wr);
      if(n === 0) return (c - c*c/(2*Wr))/PI;
      return (Math.sin(c*n)/n - (c*Math.sin(c*n)/n + (Math.cos(c*n)-1)/(n*n))/Wr)/PI; };
    const tones = Wr => [Wr/2, Wr];

    const state = () => {
      const Wr = W*PI, c = PI/N, s = { Wr, c };
      if(op === 'dec'){
        s.over = N*Wr > PI + 1e-9;
        s.edge = Math.abs(N*Wr - PI) < 1e-9;
        s.alias = s.over && filt === 'off';
        s.cut = s.over && filt === 'on';
        /* the tones that reach the decimator */
        s.kept = sig === 'tones' ? tones(Wr).filter(w => filt === 'off' || w <= c + 1e-9) : null;
        s.gone = sig === 'tones' && s.kept.length === 0;
        s.edgeOut = s.gone ? null : (s.alias ? PI : N*Math.min(Wr, c));
      } else {
        s.images = filt === 'off';
        s.edgeOut = Wr/N;
      }
      s.bad = op === 'dec' ? s.alias : s.images;
      return s;
    };
    /* the input and the output sequences */
    const xOf = n => sig === 'tri' ? xt(n, W*PI) : tones(W*PI).reduce((a,w)=>a+Math.cos(w*n), 0);
    const yOf = (n, s) => {
      if(op === 'dec'){ const m = n*N;
        if(sig === 'tri') return filt === 'on' ? xtc(m, s.Wr, s.c) : xt(m, s.Wr);
        return s.kept.reduce((a,w)=>a+Math.cos(w*m), 0); }
      if(sig === 'tri') return filt === 'on' ? xt(n/N, s.Wr) : (on(n) ? xt(n/N, s.Wr) : 0);
      return (filt === 'on' || on(n)) ? tones(s.Wr).reduce((a,w)=>a+Math.cos(w*n/N), 0) : 0;
    };

    function draw(root){
      const C = PLOT.COL, s = state();
      const outCol = s.bad ? C.err : C.out;
      const tri = sig === 'tri';

      /* ---- 1, 2: the input and the output sequences, side by side ---- */
      const tAx = (vals, name) => {
        const mx = Math.max(1e-9, ...vals.map(Math.abs));
        const yr = tri ? [-0.18*mx, 1.5*mx] : [-1.25*mx, 1.6*mx];
        return PLOT.Axes({w:380,h:180,xr:[-NT-0.6,NT+0.6],yr,xlabel:'n',ylabel:name,
          pad:{l:58,r:14,t:20,b:30},yticksLeft:true,
          yticksOverride: tri ? [0, mx] : [-mx, 0, mx], ytickfmt:v=>f2(v), xticksOverride:[-16,-8,0,8,16]});
      };
      const xs = []; for(let n=-NT;n<=NT;n++) xs.push([n, xOf(n)]);
      const ys = []; for(let n=-NT;n<=NT;n++) ys.push([n, yOf(n, s)]);
      const A1 = tAx(xs.map(p=>p[1]), 'x[n]');
      A1.stem(xs, {color:C.in, r:3.2, width:1.6});
      const A2 = tAx(ys.map(p=>p[1]).concat([1e-6]), 'y[n]');
      A2.stem(ys, {color:outCol, r:3.2, width:1.6});

      /* ---- 3: the input spectrum, with the band pi/N ---- */
      const A3 = PLOT.Axes({w:760,h:200,xr:[-3*PI,3*PI],yr:[-0.14,1.72],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
        pad:{l:58,r:24,t:20,b:30},yticksLeft:true,yticksOverride:[0,1],ytickfmt:v=>f2(v),
        xticksOverride:WT,xtickfmt:piTick});
      const cutIn = op === 'dec' && filt === 'on';
      if(tri){
        A3.curve(w=>{ const v=Xt(w,s.Wr); return v>0 && (!cutIn || Math.abs(wrap(w))<s.c+1e-9) ? v : NaN; },{color:C.in,n:2400});
        if(cutIn) A3.curve(w=>{ const v=Xt(w,s.Wr); return v>0 && Math.abs(wrap(w))>s.c ? v : NaN; },{color:C.muted,n:2400,dash:'4 4',width:1.6});
      } else {
        for(const w0 of tones(s.Wr)) for(let m=-3;m<=3;m++) for(const sg of [1,-1]){
          const p = sg*w0 + 2*PI*m; if(Math.abs(p) > 3*PI+1e-9) continue;
          A3.impulse(p, 1, {color: cutIn && w0 > s.c+1e-9 ? C.muted : C.in, label:false});
        }
      }
      if(op === 'dec') for(let m=-1;m<=1;m++)
        A3.rect(Math.max(-3*PI,2*PI*m-s.c),0,Math.min(3*PI,2*PI*m+s.c),1.18,{stroke:C.h,dash:'6 4',width:1.6});
      frame(A3, 1.5);

      /* ---- 4: the output spectrum ---- */
      let pk, draw4;
      if(op === 'dec'){
        pk = tri ? 1/N : 1;
        draw4 = A => {
          if(tri){
            const Xf = th => { const v = Xt(th, s.Wr); return (filt === 'on' && Math.abs(wrap(th)) > s.c+1e-9) ? 0 : v; };
            const terms = w => { const o=[]; for(let k=0;k<N;k++) o.push(Xf((w-2*PI*k)/N)/N); return o; };
            const cnt = w => terms(w).filter(v=>v>1e-12).length, sum = w => terms(w).reduce((a,b)=>a+b,0);
            A.area(w=> cnt(w)>=2 ? sum(w) : 0, -3*PI, 3*PI, {color:wash(C.err,.22), n:1600});
            A.curve(w=> cnt(w)===1 ? sum(w) : NaN, {color:C.out, n:3000});
            A.curve(w=> cnt(w)>=2 ? sum(w) : NaN, {color:C.err, n:3000, width:2.6});
          } else {
            for(const w0 of s.kept){ const land = wrap(N*w0), bad = N*w0 > PI+1e-9;
              for(let m=-3;m<=3;m++) for(const sg of [1,-1]){
                const p = sg*land + 2*PI*m; if(Math.abs(p) > 3*PI+1e-9) continue;
                A.impulse(p, 1, {color: bad ? C.err : C.out, label:false}); } }
          }
        };
      } else {
        const g = filt === 'on' ? N : 1;
        pk = tri ? g : (filt === 'on' ? 1 : 1/N);
        draw4 = A => {
          if(tri){
            /* copies of X(e^{jNw}) centred at 2 pi k/N: k a multiple of N is the
               wanted one, the rest are images */
            for(let k=-3*N;k<=3*N;k++){ const c0 = 2*PI*k/N, img = ((k%N)+N)%N !== 0;
              if(img && filt === 'on') continue;
              A.curve(w=>{ const u = Math.abs(w-c0); return u < s.Wr/N ? g*(1-u*N/s.Wr) : NaN; },
                {color: img ? C.err : C.out, n:3000}); }
          } else {
            for(const w0 of tones(s.Wr)) for(let k=-3*N;k<=3*N;k++) for(const sg of [1,-1]){
              const p = (sg*w0 + 2*PI*k)/N, img = ((k%N)+N)%N !== 0;
              if(Math.abs(p) > 3*PI+1e-9 || (img && filt === 'on')) continue;
              A.impulse(p, pk, {color: img ? C.err : C.out, label:false}); }
          }
        };
      }
      const A4 = PLOT.Axes({w:760,h:200,xr:[-3*PI,3*PI],yr:[-0.14*pk,1.72*pk],xlabel:'\\omega',ylabel:'Y(e^{j\\omega})',
        pad:{l:58,r:24,t:20,b:30},yticksLeft:true,yticksOverride:[0,pk],ytickfmt:v=>f2(v),
        xticksOverride:WT,xtickfmt:piTick});
      draw4(A4);
      if(op === 'int') for(let m=-1;m<=1;m++)
        A4.rect(Math.max(-3*PI,2*PI*m-s.c),0,Math.min(3*PI,2*PI*m+s.c),1.18*pk,{stroke:C.h,dash:'6 4',width:1.6});
      frame(A4, 1.5*pk);

      const yName = op === 'dec' ? (filt === 'on' ? '\\text{filtered, }\\downarrow N' : '\\downarrow N')
                                 : (filt === 'on' ? '\\uparrow N\\text{, filtered}' : '\\uparrow N');
      const bandLbl = op === 'dec' ? (filt === 'on' ? 'H_d,\\ |\\omega|<\\pi/N' : '|\\omega|<\\pi/N')
                                   : (filt === 'on' ? 'H,\\ \\text{gain }N' : '|\\omega|<\\pi/N');
      root.querySelector('.plots').innerHTML =
        `<div class="j6-row"><div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L(s.bad?'err':'out',yName)}</div></div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('in','X(e^{j\\omega})')}${op==='dec'?L('h',bandLbl,true):''}</div></div>`
      + `<div class="plot-wrap">${A4.svg()}<div class="legend in-plot lg-at-tr">${L('out','\\text{kept}')}${s.bad?L('err', op==='dec'?'\\text{alias}':'\\text{image}'):''}${op==='int'?L('h',bandLbl,true):''}</div></div>`;

      /* ---- readouts ---- */
      const verdict = op === 'dec'
        ? (s.alias ? 'aliasing' : (s.cut ? 'band cut' : (s.edge ? 'on the edge' : 'clean')))
        : (s.images ? 'images' : 'clean');
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$\\pi/N$</dt><dd>$${fp(s.c)}$</dd></div>
        <div><dt>Band in</dt><dd>$${fp(s.Wr)}$</dd></div>
        <div><dt>Band out</dt><dd class="${s.bad?'':'okv'}">${s.edgeOut==null ? 'none' : '$'+fp(s.edgeOut)+'$'}</dd></div>
        <div><dt>Verdict</dt><dd class="${s.bad?'':'okv'}">${verdict}</dd></div>`);

      root.querySelector('.signame').innerHTML = T((tri
        ? `X(e^{j\\omega}):\\ \\text{a triangle to }\\omega_M=${fp(s.Wr)}`
        : `x[n]=\\cos(\\omega_Mn/2)+\\cos(\\omega_Mn),\\ \\omega_M=${fp(s.Wr)}`) + `,\\quad N=${N}`, false);

      const rel = s.over ? '>' : (s.edge ? '=' : '<');
      const eqTex = op === 'dec'
        ? `N\\omega_M=${N}\\cdot${fp(s.Wr)}=${fp(N*s.Wr)}\\;${rel}\\;\\pi`
        : `\\frac{\\omega_M}{N}=\\frac{${fp(s.Wr)}}{${N}}=${fp(s.Wr/N)},\\qquad\\text{copies every }\\frac{2\\pi}{${N}}`;
      const eqLbl = op === 'dec' ? 'The stretch by $N$' : 'The compression by $N$';
      const note = op === 'dec'
        ? (s.alias
          ? `<div class="note err"><span class="note-h">Aliasing</span>The band reaches past $\\pi/N=${fp(s.c)}$, so the stretched copies overlap. No filter after the decimator can undo the red part.</div>`
          : s.cut
          ? `<div class="note warn"><span class="note-h">Band cut, no aliasing</span>The prefilter removed everything above $\\pi/N=${fp(s.c)}$ before the decimator. What is left is clean, but it is not all of $x[n]$.</div>`
          : s.edge
          ? `<div class="note warn"><span class="note-h">On the edge</span>$N\\omega_M=\\pi$: the copies just touch. Any wider band would alias.</div>`
          : `<div class="note ok"><span class="note-h">No aliasing</span>$N\\omega_M<\\pi$: the stretched band stays inside one period, and the filter changes nothing.</div>`)
        : (s.images
          ? `<div class="note err"><span class="note-h">Images</span>Each period holds the wanted copy and $N-1=${N-1}$ images. The inserted zeros are still in $y[n]$.</div>`
          : `<div class="note ok"><span class="note-h">Images removed</span>The low-pass of gain $N$ keeps $|\\omega|<\\pi/N$. Every zero is filled, and $y[kN]=x[k]$.</div>`);
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">${eqLbl}</span>${T(eqTex,true)}</div>` + note);

      root.querySelector('[data-v=W]').value = W; root.querySelector('[data-out=W]').innerHTML = T(fp(W*PI), false);
      root.querySelector('[data-v=N]').value = N; root.querySelector('[data-out=N]').textContent = String(N);
      root.querySelectorAll('[data-seg]').forEach(b=>{
        const cur = {sig, op, filt}[b.dataset.seg];
        b.setAttribute('aria-pressed', String(b.dataset.val === cur)); });
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls">
              <div class="ctrl"><label><span>Sequence</span> <span class="seg">
                <button data-seg="sig" data-val="tri">triangle</button>
                <button data-seg="sig" data-val="tones">two tones</button></span></label></div>
              <div class="ctrl"><label><span>Operation</span> <span class="seg">
                <button data-seg="op" data-val="dec">decimate</button>
                <button data-seg="op" data-val="int">interpolate</button></span></label></div>
              <div class="ctrl"><label><span>Band edge $\\omega_M$</span> <span class="val" data-out="W"></span></label>
                <input type="range" data-v="W" min="0.1" max="0.9" step="0.05" value="0.3"></div>
              <div class="ctrl"><label><span>Factor $N$</span> <span class="val" data-out="N">3</span></label>
                <input type="range" data-v="N" min="2" max="5" step="1" value="3"></div>
              <div class="ctrl j6-filt"><label><span>Filter at $\\pi/N$</span> <span class="seg">
                <button data-seg="filt" data-val="off">off</button>
                <button data-seg="filt" data-val="on">on</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='W') W=Math.round(v*20)/20; else if(k==='N') N=Math.round(v);
        draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        const k=b.dataset.seg, v=b.dataset.val;
        if(k==='sig') sig=v; else if(k==='op') op=v; else if(k==='filt') filt=v;
        draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { J6 };
})());
