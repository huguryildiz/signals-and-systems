/* ==========================================================================
   EE311 · Interactive laboratories.
   Every control changes the mathematics, not the decoration. All displayed
   values are computed from the definitions at interaction time.
   ========================================================================== */
const LABS = (() => {
  const T = (s,d)=>{ try{ return katex.renderToString(s,{displayMode:!!d,throwOnError:false,strict:false}); }
                     catch(e){ return s; } };
  const F = (v,d=3)=>{ if(!isFinite(v)) return '∞';
                       if(v!==0 && Math.abs(v)<0.5*Math.pow(10,-d)) return v.toExponential(2);
                       const r=Math.round(v*10**d)/10**d;
                       return Object.is(r,-0)?'0':String(r); };
  const el = (h)=>{ const d=document.createElement('div'); d.innerHTML=h.trim(); return d.firstElementChild; };
  const gcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; };

  /* =======================================================================
     A · SIGNAL TRANSFORMATION LABORATORY            [Source: 3–4]
     y(t) = x(a t − b) built by the definition's "shift, then scale" method.
     ======================================================================= */
  const A = (() => {
    /* prototype from 4: 0 (t<−2); 1 on [−2,0]; 2 on [0,2]; 2→0 linearly on [2,4] */
    const protos = {
      p4: { name:'Example', sup:[-2,4], yr:[-0.4,2.6],
            f:t=> t<-2?0 : t<0?1 : t<2?2 : t<4?2*(4-t)/2 : 0,
            crit:[-2,0,2,4] },
      tri:{ name:'Triangular pulse', sup:[-1,1], yr:[-0.3,1.3],
            f:t=> Math.abs(t)<=1 ? 1-Math.abs(t) : 0, crit:[-1,0,1] },
      rect:{name:'Rectangular pulse', sup:[1,3], yr:[-0.3,1.4],
            f:t=> (t>=1&&t<=3)?1:0, crit:[1,3] }
    };
    let st = { proto:'p4', a:1, b:0, dt:false, stage:2 };
    function draw(root){
      const P = protos[st.proto];
      const a = st.a===0 ? 1e-9 : st.a, b = st.b;
      /* support of x(at−b): at−b ∈ [s0,s1] → t ∈ sorted((s0+b)/a,(s1+b)/a) */
      const e1=(P.sup[0]+b)/a, e2=(P.sup[1]+b)/a;
      const lo=Math.min(e1,e2), hi=Math.max(e1,e2);
      const critY = P.crit.map(c=>(c+b)/a).sort((p,q)=>p-q);
      const xr=[-8,8];
      const ax = o => PLOT.Axes(Object.assign({w:760,h:210,xr,yr:P.yr,xlabel:st.dt?'n':'t',
        pad:{l:44,r:26,t:16,b:34}, xtarget:9, ytarget:3},o));
      const disc = f => { const out=[]; for(let n=Math.ceil(xr[0]);n<=xr[1];n++) out.push([n,f(n)]); return out; };
      const A1 = ax({}); const A2 = ax({}); const A3 = ax({});
      if(st.dt){ A1.stem(disc(P.f),{color:PLOT.COL.in}); } else { A1.curve(P.f,{color:PLOT.COL.in}); }
      A1.note(xr[1]-0.2,P.yr[1]*0.78, st.dt?'x[n]':'x(t)',{anchor:'end',color:PLOT.COL.in,fs:15,italic:true});
      const v = t => P.f(t-b);
      if(st.dt){ A2.stem(disc(v),{color:PLOT.COL.mid}); } else { A2.curve(v,{color:PLOT.COL.mid}); }
      A2.note(xr[1]-0.2,P.yr[1]*0.78, st.dt?'v[n] = x[n − b]':'v(t) = x(t − b)',{anchor:'end',color:PLOT.COL.mid,fs:15,italic:true});
      const y = t => P.f(a*t-b);
      if(st.dt){ A3.stem(disc(y),{color:PLOT.COL.out}); } else { A3.curve(y,{color:PLOT.COL.out}); }
      A3.note(xr[1]-0.2,P.yr[1]*0.78, st.dt?'y[n] = x[an − b]':'y(t) = x(at − b)',{anchor:'end',color:PLOT.COL.out,fs:15,italic:true});
      if(isFinite(lo)&&isFinite(hi)&&hi-lo<40){ A3.vline(lo,{color:PLOT.COL.out}); A3.vline(hi,{color:PLOT.COL.out}); }
      const stages = [A1,A2,A3].slice(0, st.stage+1);
      root.querySelector('.plots').innerHTML = stages.map(z=>z.svg()).join('');
      root.querySelector('.ro').innerHTML = `
        <div><dt>Operation order</dt><dd style="font-size:16px">shift by ${F(b)} → scale by ${F(a)}</dd></div>
        <div><dt>Support of y</dt><dd>${isFinite(lo)?`[${F(lo,3)}, ${F(hi,3)}]`:'—'}</dd></div>
        <div><dt>Mapped critical points</dt><dd style="font-size:16px">${critY.map(c=>F(c,3)).join(', ')}</dd></div>
        <div><dt>Effect</dt><dd class="${Math.abs(a)>1?'':'okv'}" style="font-size:16px">${
          Math.abs(a)>1?'decimation (compress)':Math.abs(a)<1?'expansion (stretch)':'no scaling'}${a<0?' + reversal':''}</dd></div>`;
      root.querySelector('.lab-eq').innerHTML =
        T(`y(${st.dt?'n':'t'})=x\\!\\left(${F(a)}\\,${st.dt?'n':'t'}${b>=0?'-':'+'}${F(Math.abs(b))}\\right)`,true);
      root.querySelectorAll('[data-v]').forEach(s=>{ const k=s.dataset.v;
        const o=root.querySelector(`[data-out="${k}"]`); if(o) o.textContent=F(st[k]); });
      root.querySelectorAll('[data-seg]').forEach(bt=>{
        bt.setAttribute('aria-pressed', String(
          bt.dataset.seg==='dom' ? (bt.dataset.val==='dt')===st.dt
          : bt.dataset.seg==='proto' ? bt.dataset.val===st.proto
          : +bt.dataset.val===st.stage));
      });
    }
    return { mount(root){
      root.innerHTML = `
        <div class="cols c-7-5" style="gap:44px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal
                <span class="seg">${Object.entries(protos).map(([k,p])=>
                  `<button data-seg="proto" data-val="${k}">${k}</button>`).join('')}</span></label>
                <div class="small" style="margin-top:2px">${Object.entries(protos).map(([k,p])=>`<b>${k}</b> — ${p.name}`).join(' · ')}</div></div>
              <div class="ctrl"><label>Scale factor a <span class="val" data-out="a">1</span></label>
                <input type="range" data-v="a" min="-3" max="3" step="0.25" value="1"></div>
              <div class="ctrl"><label>Shift b <span class="val" data-out="b">0</span></label>
                <input type="range" data-v="b" min="-6" max="6" step="0.5" value="0"></div>
              <div class="ctrl"><label>Domain
                <span class="seg"><button data-seg="dom" data-val="ct">continuous</button><button data-seg="dom" data-val="dt">discrete</button></span></label></div>
              <div class="ctrl"><label>Construction stage
                <span class="seg"><button data-seg="stage" data-val="0">x only</button><button data-seg="stage" data-val="1">+ shift</button><button data-seg="stage" data-val="2">+ scale</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="note warn"><span class="note-h">Order matters</span>
              Scaling first and shifting afterwards gives $x(at-ab)$, not $x(at-b)$. The middle panel is the
              intermediate $v=x(t-b)$ required by the shift-then-scale method.</div>
          </div></div>`;
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k]=parseFloat(e.target.value); draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        if(b.dataset.seg==='dom') st.dt = b.dataset.val==='dt';
        else if(b.dataset.seg==='proto') st.proto=b.dataset.val;
        else st.stage=+b.dataset.val;
        draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     B · ENERGY AND POWER CLASSIFIER                 [Source: 2–3]
     ======================================================================= */
  const B = (() => {
    const items = [
      { id:'b1', tex:'x(t)=\\begin{cases}1,&0\\le t\\le 1\\\\0,&\\text{o.w.}\\end{cases}', kind:'energy',
        E:'E_\\infty=\\int_0^1 1^2\\,dt = 1<\\infty', P:'P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_0^1 1\\,dt=\\lim_{T\\to\\infty}\\frac{1}{2T}=0',
        why:'Finite energy and zero average power — the defining pair for an energy signal.', src:'p. 3', dt:false,
        f:t=>(t>=0&&t<=1)?1:0, yr:[-0.3,1.4], xr:[-2,3] },
      { id:'b2', tex:'x[n]=4,\\quad \\forall n\\in\\mathbb{Z}', kind:'power',
        E:'E_\\infty=\\sum_{n=-\\infty}^{\\infty}|4|^2\\to\\infty', P:'P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}(2N+1)\\,|4|^2=16<\\infty',
        why:'Infinite energy but finite, non-zero average power — a power signal.', src:'p. 3', dt:true,
        f:n=>4, yr:[-0.6,5.2], xr:[-6,6] },
      { id:'b3', tex:'x[n]=\\left(\\tfrac12\\right)^{n}u[n]', kind:'energy',
        E:'E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac14\\right)^{n}=\\frac{1}{1-\\tfrac14}=\\tfrac43<\\infty',
        P:'P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=0}^{N}\\left(\\tfrac14\\right)^{n}=0',
        why:'A convergent geometric sum gives finite energy; dividing a bounded sum by $2N+1$ drives the power to zero.',
        src:'pp. 16–17', dt:true, f:n=>n>=0?Math.pow(0.5,n):0, yr:[-0.2,1.2], xr:[-3,10] },
      { id:'b4', tex:'x(t)=e^{2t}u(-t)', kind:'energy',
        E:'E_\\infty=\\int_{-\\infty}^{0}e^{4t}\\,dt=\\tfrac14<\\infty',
        P:'P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\cdot\\tfrac14=0',
        why:'The two-sided integral converges because the exponential decays as $t\\to-\\infty$.',
        src:'p. 18', dt:false, f:t=>t<=0?Math.exp(2*t):0, yr:[-0.2,1.3], xr:[-4,2] },
      { id:'b5', tex:'x(t)=u(t)', kind:'power',
        E:'E_\\infty=\\int_0^{\\infty}1\\,dt\\to\\infty',
        P:'P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_0^{T}1\\,dt=\\lim_{T\\to\\infty}\\frac{T}{2T}=\\tfrac12',
        why:'Half the averaging window carries unit amplitude, so the limit is $1/2$ — finite and non-zero.',
        src:'p. 7', dt:false, f:t=>t>=0?1:0, yr:[-0.3,1.4], xr:[-3,4] },
      { id:'b6', tex:'x(t)=t\\,u(t)', kind:'neither',
        E:'E_\\infty=\\int_0^{\\infty}t^2\\,dt\\to\\infty',
        P:'P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_0^{T}t^2\\,dt=\\lim_{T\\to\\infty}\\frac{T^2}{6}\\to\\infty',
        why:'Both quantities diverge, so the signal is neither an energy nor a power signal. Unbounded signals are the usual source of this third case.',
        src:'editorial (consistent with pp. 2–3)', dt:false, f:t=>t>=0?t:0, yr:[-0.4,4.4], xr:[-2,4] }
    ];
    let cur=0, picked=null, revealed=false;
    function draw(root){
      const it = items[cur];
      const ax = PLOT.Axes({w:640,h:250,xr:it.xr,yr:it.yr,xlabel:it.dt?'n':'t',pad:{l:46,r:24,t:18,b:36},xtarget:8,ytarget:4});
      if(it.dt){ const p=[]; for(let n=Math.ceil(it.xr[0]);n<=it.xr[1];n++) p.push([n,it.f(n)]); ax.stem(p,{color:PLOT.COL.in}); }
      else ax.curve(it.f,{color:PLOT.COL.in});
      root.querySelector('.plots').innerHTML = ax.svg();
      root.querySelector('.sig').innerHTML = T(it.tex,true);
      root.querySelector('.srcref').textContent = 'ref '+it.src+'';
      root.querySelectorAll('[data-cls]').forEach(b=>{
        b.className='opt'+(picked? (b.dataset.cls===it.kind?' correct':(b.dataset.cls===picked?' wrong':'')) +' locked':'');
        b.disabled = !!picked; });
      root.querySelector('.verdict').innerHTML = picked ?
        `<div class="fb ${picked===it.kind?'good':'bad'}">${picked===it.kind?'Correct — ':'Not correct. '}
          this is ${it.kind==='neither'?'<b>neither</b> an energy nor a power signal'
          :(it.kind==='energy'?'an <b>energy</b> signal':'a <b>power</b> signal')}. ${it.why}</div>` : '';
      root.querySelector('.work').innerHTML = revealed ? `
        <div class="eq sm">${T(it.E,true)}</div>
        <div class="eq sm">${T(it.P,true)}</div>
        <div class="note ok"><span class="note-h">Conclusion</span>${
          it.kind==='energy'?'$E_\\infty<\\infty$ and $P_\\infty=0$ ⇒ energy-type signal.'
          :it.kind==='power'?'$E_\\infty\\to\\infty$ and $0<P_\\infty<\\infty$ ⇒ power-type signal.'
          :'$E_\\infty\\to\\infty$ and $P_\\infty\\to\\infty$ ⇒ neither.'}</div>`.replace(/\$([^$]+)\$/g,(m,a)=>T(a,false)) : '';
      root.querySelector('[data-reveal]').textContent = revealed?'Hide the calculation':'Reveal the calculation';
      root.querySelector('.counter').textContent = (cur+1)+' / '+items.length;
    }
    return { mount(root){
      root.innerHTML = `
        <div class="cols c-6-6" style="gap:44px">
          <div class="col stack">
            <div class="sig eq key"></div>
            <div class="plots"></div>
            <div class="small srcref"></div>
          </div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span>Classify before you compute</p>
            <div class="opts">
              <button class="opt" data-cls="energy"><span class="k">A</span><span>Energy signal — $E_\\infty<\\infty$, $P_\\infty=0$</span></button>
              <button class="opt" data-cls="power"><span class="k">B</span><span>Power signal — $E_\\infty\\to\\infty$, $0<P_\\infty<\\infty$</span></button>
              <button class="opt" data-cls="neither"><span class="k">C</span><span>Neither</span></button>
            </div>
            <div class="verdict"></div>
            <div class="work stack"></div>
            <div style="display:flex;gap:10px;align-items:center">
              <button class="btn" data-reveal>Reveal the calculation</button>
              <button class="btn" data-nav="-1">Previous</button>
              <button class="btn primary" data-nav="1">Next signal</button>
              <span class="small counter"></span>
            </div>
          </div></div>`;
      root.querySelectorAll('.opt .k + span').forEach(s=>{ s.innerHTML = s.innerHTML
        .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false)); });
      root.addEventListener('click', e=>{
        const c=e.target.closest('[data-cls]'); if(c && !picked){ picked=c.dataset.cls; draw(root); return; }
        if(e.target.closest('[data-reveal]')){ revealed=!revealed; draw(root); return; }
        const n=e.target.closest('[data-nav]');
        if(n){ cur=(cur+ +n.dataset.nav + items.length)%items.length; picked=null; revealed=false; draw(root); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     C · PERIODICITY EXPLORER                        [Source: 5, 8, 10]
     ω₀ is entered as a rational multiple of π so the rationality test is exact.
     ======================================================================= */
  const C = (() => {
    let st = { p:1, q:2, th:0, dt:true };
    function draw(root){
      const w0 = Math.PI*st.p/st.q, th = st.th*Math.PI/4;
      /* DT: N = 2πk/ω0 = 2q k / p  → smallest integer N */
      const g = gcd(2*st.q, st.p);
      const N0 = (2*st.q)/g, kmin = st.p/g;
      const T0 = 2*Math.PI/w0;
      const xr = st.dt? [-2, 34] : [-1, 26];
      const ax = PLOT.Axes({w:820,h:250,xr,yr:[-1.35,1.35],xlabel:st.dt?'n':'t',
        pad:{l:46,r:26,t:20,b:36},xtarget:10,ytarget:3});
      if(st.dt){
        const pts=[]; for(let n=Math.ceil(xr[0]);n<=xr[1];n++) pts.push([n,Math.cos(w0*n+th)]);
        ax.stem(pts,{color:PLOT.COL.in});
        ax.curve(t=>Math.cos(w0*t+th),{color:PLOT.COL.in,width:1,dash:'3 5',opacity:.45});
        if(isFinite(N0)&&N0<=xr[1]-2){ ax.span(2,2+N0,1.22,`N₀ = ${N0}`,{color:PLOT.COL.coral});
          ax.vline(2,{color:PLOT.COL.coral}); ax.vline(2+N0,{color:PLOT.COL.coral}); }
      } else {
        ax.curve(t=>Math.cos(w0*t+th),{color:PLOT.COL.in});
        if(T0<=xr[1]-1){ ax.span(1,1+T0,1.22,`T₀ = ${F(T0,3)}`,{color:PLOT.COL.coral});
          ax.vline(1,{color:PLOT.COL.coral}); ax.vline(1+T0,{color:PLOT.COL.coral}); }
      }
      root.querySelector('.plots').innerHTML = ax.svg();
      root.querySelector('.lab-eq').innerHTML =
        T(st.dt? `x[n]=\\cos\\!\\left(\\tfrac{${st.p}\\pi}{${st.q}}n+\\tfrac{${st.th}\\pi}{4}\\right)`
               : `x(t)=\\cos\\!\\left(\\tfrac{${st.p}\\pi}{${st.q}}t+\\tfrac{${st.th}\\pi}{4}\\right)`, true);
      root.querySelector('.derive').innerHTML = st.dt ? `
        <div class="eq sm">${T(`N=\\frac{2\\pi}{\\omega_0}k=\\frac{2\\pi}{\\tfrac{${st.p}\\pi}{${st.q}}}k=\\frac{${2*st.q}}{${st.p}}k`,true)}</div>
        <div class="note ${'ok'}"><span class="note-h">Rationality test</span>
          ${T(`\\frac{\\omega_0}{2\\pi}=\\frac{${st.p}}{${2*st.q}}\\in\\mathbb{Q}`,false)} — always rational here, so a
          discrete-time <em>cosine of this form</em> is periodic. The smallest integer $N$ occurs at
          ${T(`k=${kmin}`,false)}, giving ${T(`N_0=${N0}`,false)}.</div>`
        : `<div class="eq sm">${T(`T_0=\\frac{2\\pi}{\\omega_0}=\\frac{2\\pi}{\\tfrac{${st.p}\\pi}{${st.q}}}=\\frac{${2*st.q}}{${st.p}}=${F(T0,4)}`,true)}</div>
           <div class="note ok"><span class="note-h">Continuous time is unconditional</span>
             Every continuous-time sinusoid with $\\omega_0\\neq0$ is periodic; no rationality condition applies.</div>`;
      root.querySelector('.ro').innerHTML = st.dt ? `
        <div><dt>ω₀ (rad/sample)</dt><dd>${F(w0,4)}</dd></div>
        <div><dt>ω₀ / 2π</dt><dd>${(()=>{const g2=gcd(st.p,2*st.q);return (st.p/g2)+' / '+((2*st.q)/g2);})()}</dd></div>
        <div><dt>Smallest k</dt><dd>${kmin}</dd></div>
        <div><dt>Fundamental period N₀</dt><dd class="okv">${N0}</dd></div>`
        : `<div><dt>ω₀ (rad/s)</dt><dd>${F(w0,4)}</dd></div>
           <div><dt>Fundamental period T₀</dt><dd class="okv">${F(T0,4)} s</dd></div>
           <div><dt>Fundamental frequency</dt><dd>${F(1/T0,4)} Hz</dd></div>
           <div><dt>Phase θ</dt><dd>${st.th}π/4</dd></div>`;
      root.querySelectorAll('[data-out]').forEach(o=>{ o.textContent = String(st[o.dataset.out]); });
      root.querySelectorAll('[data-seg=dom]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.val==='dt')===st.dt)));
      root.querySelector('.aper').innerHTML = st.dt ? `<div class="note warn">
        <span class="note-h">Counterexample worth seeing</span>
        With an <em>irrational</em> normalised frequency — for instance $\\omega_0=1$ rad/sample, so
        $\\omega_0/2\\pi=1/(2\\pi)\\notin\\mathbb{Q}$ — no integer $N$ satisfies $\\omega_0N=2\\pi k$, and the sequence
        never repeats. The rational control above cannot reach that case, which is precisely the point:
        periodicity in discrete time is a property of the <em>number</em> $\\omega_0/2\\pi$, not of the waveform's shape.</div>`:'';
      root.querySelectorAll('.note, .verdict').forEach(n=>{ n.innerHTML = n.innerHTML.replace(/\$([^$]+)\$/g,(m,a)=>T(a,false)); });
    }
    return { mount(root){
      root.innerHTML=`
        <div class="cols c-7-5" style="gap:44px">
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="plots"></div>
            <dl class="readout ro"></dl>
          </div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Domain <span class="seg">
                <button data-seg="dom" data-val="ct">continuous</button>
                <button data-seg="dom" data-val="dt">discrete</button></span></label></div>
              <div class="ctrl"><label>ω₀ numerator p <span class="val" data-out="p">1</span></label>
                <input type="range" data-v="p" min="1" max="12" step="1" value="1"></div>
              <div class="ctrl"><label>ω₀ denominator q <span class="val" data-out="q">2</span></label>
                <input type="range" data-v="q" min="1" max="12" step="1" value="2"></div>
              <div class="ctrl"><label>Phase θ (units of π/4) <span class="val" data-out="th">0</span></label>
                <input type="range" data-v="th" min="0" max="8" step="1" value="0"></div>
            </div>
            <div class="derive stack"></div>
            <div class="aper"></div>
          </div></div>`;
      root.addEventListener('input',e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k]=parseInt(e.target.value,10); draw(root); });
      root.addEventListener('click',e=>{ const b=e.target.closest('[data-seg=dom]'); if(!b) return;
        st.dt = b.dataset.val==='dt'; draw(root); });
      draw(root);
    }};
  })();

  /* =======================================================================
     D · SYSTEM PROPERTY CHECKER                     [Source: 11–14, 21]
     ======================================================================= */
  const D = (() => {
    let cur=0, open={};
    function draw(root){
      const s = CONTENT.SYSTEMS[cur];
      root.querySelector('.sys').innerHTML = T(s.tex,true);
      root.querySelector('.srcref').textContent = 'ref '+s.src+'';
      root.querySelector('.plist').innerHTML = CONTENT.PROPS.map(p=>{
        const r = s.p[p.k];
        const isOpen = open[p.k];
        return `<div class="note ${r.v?'ok':'err'}" style="cursor:pointer" data-prop="${p.k}">
          <span class="note-h">${p.name} <span style="float:right;font-weight:700">${r.v?'YES':'NO'}</span></span>
          ${isOpen? `<div style="margin-top:6px">
             <div class="small" style="margin-bottom:6px"><b>Criterion.</b> ${p.crit}</div>
             <div style="font-size:18px;line-height:1.55">${r.arg}</div></div>`
           : `<div class="small">Click to see the criterion and the ${r.v?'argument':'counterexample'}.</div>`}
        </div>`;
      }).join('');
      root.querySelector('.counter').textContent=(cur+1)+' / '+CONTENT.SYSTEMS.length;
      root.querySelectorAll('.plist .note, .plist .small').forEach(n=>{
        n.innerHTML=n.innerHTML.replace(/\$([^$]+)\$/g,(m,a)=>T(a,false)); });
    }
    return { mount(root){
      root.innerHTML=`
        <div class="cols c-5-7" style="gap:44px">
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span>System under test</p>
            <div class="sys eq key"></div>
            <div class="small srcref"></div>
            <div style="display:flex;gap:10px;align-items:center;margin-top:6px">
              <button class="btn" data-nav="-1">Previous</button>
              <button class="btn primary" data-nav="1">Next system</button>
              <span class="small counter"></span></div>
            <div class="note warn" style="margin-top:10px"><span class="note-h">Workflow</span>
              Never classify by inspection. Apply the formal test: assume, substitute, compare — or produce a single
              counterexample. One counterexample settles a property; no number of examples proves it.</div>
          </div>
          <div class="col"><div class="plist stack" style="gap:12px"></div></div>
        </div>`;
      root.addEventListener('click',e=>{
        const p=e.target.closest('[data-prop]'); if(p){ open[p.dataset.prop]=!open[p.dataset.prop]; draw(root); return; }
        const n=e.target.closest('[data-nav]');
        if(n){ cur=(cur+ +n.dataset.nav + CONTENT.SYSTEMS.length)%CONTENT.SYSTEMS.length; open={}; draw(root); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     E · GRAPHICAL CONVOLUTION EXPLORER              [Source: 15–20]
     ======================================================================= */
  const E = (() => {
    const cases = {
      dt1:{ dt:true, name:'x[n]={1,2,1,2}, h[n]={1,1}', src:'pp. 15–16',
            x:n=>[1,2,1,2][n]!==undefined&&n>=0&&n<=3?[1,2,1,2][n]:0,
            h:n=>(n===0||n===1)?1:0, kr:[-4,9], nr:[-2,7], yr:[-0.4,3.6],
            exact:'y[n]=\\delta[n]+3\\delta[n-1]+3\\delta[n-2]+3\\delta[n-3]+2\\delta[n-4]' },
      dt2:{ dt:true, name:'x[n]=(1/2)ⁿu[n], h[n]=u[n]', src:'pp. 16–17',
            x:n=>n>=0?Math.pow(.5,n):0, h:n=>n>=0?1:0, kr:[-6,14], nr:[-3,12], yr:[-0.3,2.4],
            exact:'y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]' },
      ct1:{ dt:false, name:'x(t)=rect on (0,1), h(t)=t on (0,2)', src:'pp. 19–20',
            xs:[0,1], hs:[0,2],
            x:t=>(t>0&&t<1)?1:0, h:t=>(t>0&&t<2)?t:0, kr:[-2,5], nr:[-1,4], yr:[-0.3,2.3],
            exact:'y(t)=\\begin{cases}0,&t<0\\\\ \\tfrac12t^{2},&0<t<1\\\\ t-\\tfrac12,&1<t<2\\\\ -\\tfrac12t^{2}+t+\\tfrac32,&2<t<3\\\\ 0,&t>3\\end{cases}' },
      ct2:{ dt:false, name:'x(t)=e^{2t}u(−t), h(t)=u(t−3)', src:'pp. 18–19',
            xs:[-20,0], hs:[3,60],
            x:t=>t<=0?Math.exp(2*t):0, h:t=>t>=3?1:0, kr:[-5,7], nr:[-2,7], yr:[-0.1,0.75],
            exact:'y(t)=\\begin{cases}\\tfrac12e^{2(t-3)},&t<3\\\\[2pt] \\tfrac12,&t>3\\end{cases}' }
    };
    let key='dt1', pos=0, stage=3;
    function conv(c, at){
      if(c.dt){ let s=0; for(let k=c.kr[0]-6;k<=c.kr[1]+6;k++) s+=c.x(k)*c.h(at-k); return s; }
      /* integrate only over the exact overlap of the two supports, with
         Simpson's rule — the integrand is smooth there, so this is accurate
         to ~1e-12 instead of being limited by the support discontinuities. */
      const lo=Math.max(c.xs[0], at-c.hs[1]), hi=Math.min(c.xs[1], at-c.hs[0]);
      if(!(hi>lo)) return 0;
      const N=800, d=(hi-lo)/N; let s=0;
      for(let i=0;i<=N;i++){
        const t=lo+i*d, w=(i===0||i===N)?1:(i%2?4:2);
        s+=w*c.x(t+ (i===0?1e-12:i===N?-1e-12:0))*c.h(at-t- (i===0?1e-12:i===N?-1e-12:0));
      }
      return s*d/3;
    }
    function draw(root){
      const c=cases[key]; const n = c.dt? Math.round(pos) : pos;
      const mk=o=>PLOT.Axes(Object.assign({w:760,h:172,xr:c.kr,yr:c.yr,xlabel:c.dt?'k':'\\tau',
        pad:{l:44,r:24,t:14,b:30},xtarget:9,ytarget:2},o));
      const disc=f=>{const p=[];for(let k=Math.ceil(c.kr[0]);k<=c.kr[1];k++)p.push([k,f(k)]);return p;};
      /* panel 1: x and the flipped-shifted h */
      const A1=mk({});
      if(c.dt){ A1.stem(disc(c.x),{color:PLOT.COL.in}); A1.stem(disc(k=>c.h(n-k)),{color:PLOT.COL.h,r:3}); }
      else { A1.curve(c.x,{color:PLOT.COL.in}); A1.curve(t=>c.h(n-t),{color:PLOT.COL.h}); }
      A1.vline(n,{color:PLOT.COL.coral,dash:'4 4'});
      A1.note(c.kr[0]+0.2,c.yr[1]*0.82,c.dt?'x[k]':'x(τ)',{color:PLOT.COL.in,fs:15,italic:true});
      A1.note(c.kr[1]-0.2,c.yr[1]*0.82,c.dt?'h[n−k]':'h(t−τ)',{color:PLOT.COL.h,fs:15,italic:true,anchor:'end'});
      /* panel 2: product with overlap shading */
      const A2=mk({});
      if(c.dt){ A2.stem(disc(k=>c.x(k)*c.h(n-k)),{color:PLOT.COL.mid}); }
      else { A2.area(t=>c.x(t)*c.h(n-t), c.kr[0], c.kr[1], {color:'rgba(106,90,146,.22)'});
             A2.curve(t=>c.x(t)*c.h(n-t),{color:PLOT.COL.mid}); }
      A2.note(c.kr[0]+0.2,c.yr[1]*0.82,c.dt?'x[k]·h[n−k]':'x(τ)h(t−τ)',{color:PLOT.COL.mid,fs:15,italic:true});
      /* panel 3: accumulated output */
      const A3=PLOT.Axes({w:760,h:196,xr:c.nr,yr:c.yr,xlabel:c.dt?'n':'t',pad:{l:44,r:24,t:16,b:32},xtarget:8,ytarget:3});
      if(c.dt){ const p=[]; for(let m=Math.ceil(c.nr[0]);m<=c.nr[1];m++) p.push([m, m<=n?conv(c,m):0]);
        A3.stem(p.filter(q=>q[0]<=n),{color:PLOT.COL.out}); }
      else { const pts=[]; for(let i=0;i<=260;i++){ const t=c.nr[0]+(Math.min(n,c.nr[1])-c.nr[0])*i/260;
          if(t>c.nr[1])break; pts.push([t,conv(c,t)]); } if(pts.length>1) A3.poly(pts,{color:PLOT.COL.out}); }
      const yv = conv(c,n);
      A3.vline(n,{color:PLOT.COL.coral,dash:'4 4'}); A3.point(n,yv,{color:PLOT.COL.coral});
      A3.note(c.nr[0]+0.2,c.yr[1]*0.84,c.dt?'y[n]':'y(t)',{color:PLOT.COL.out,fs:15,italic:true});
      const panels=[A1,A2,A3].slice(0,stage);
      root.querySelector('.plots').innerHTML = panels.map(p=>p.svg()).join('');
      root.querySelector('.ro').innerHTML=`
        <div><dt>${c.dt?'n':'t'}</dt><dd>${c.dt?n:F(n,2)}</dd></div>
        <div><dt>${c.dt?'y[n]':'y(t)'}</dt><dd class="okv">${F(yv,4)}</dd></div>
        <div><dt>Overlap</dt><dd style="font-size:16px">${Math.abs(yv)>1e-9?'non-empty':'empty → output 0'}</dd></div>`;
      root.querySelector('.exact').innerHTML = T(c.exact,true);
      root.querySelector('.casename').textContent = c.name;
      root.querySelector('.srcref').textContent='ref '+c.src+'';
      const sl=root.querySelector('[data-v=pos]');
      sl.min=c.nr[0]; sl.max=c.nr[1]; sl.step=c.dt?1:0.05; sl.value=pos;
      root.querySelector('[data-out=pos]').textContent=(c.dt?'n = ':'t = ')+(c.dt?n:F(n,2));
      root.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
      root.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.stage===stage)));
    }
    return { mount(root){
      root.innerHTML=`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="casename"></span></p>
            <div class="ctrls one">
              <div class="ctrl"><label>Case <span class="seg">
                ${Object.keys(cases).map(k=>`<button data-case="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Shift <span class="val" data-out="pos"></span></label>
                <input type="range" data-v="pos"></div>
              <div class="ctrl"><label>Show up to <span class="seg">
                <button data-stage="1">flip &amp; shift</button>
                <button data-stage="2">+ multiply</button>
                <button data-stage="3">+ sum / integrate</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div><p class="eyebrow" style="margin-bottom:8px"><span class="tick"></span>Closed form</p>
              <div class="exact eq sm"></div></div>
            <div class="small srcref"></div>
            <div class="note warn"><span class="note-h">Do not skip the flip</span>
              The amber trace is $h$ <em>reversed and then shifted</em>. Sliding an unflipped $h$ is the single most
              common convolution error; it silently computes a correlation instead.</div>
          </div></div>`;
      root.querySelector('.note.warn').innerHTML = root.querySelector('.note.warn').innerHTML
        .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false));
      root.addEventListener('input',e=>{ if(e.target.dataset.v==='pos'){ pos=parseFloat(e.target.value); draw(root);} });
      root.addEventListener('click',e=>{
        const c=e.target.closest('[data-case]');
        if(c){ key=c.dataset.case; pos=cases[key].dt?0:0; draw(root); return; }
        const s=e.target.closest('[data-stage]'); if(s){ stage=+s.dataset.stage; draw(root); }
      });
      draw(root);
    }};
  })();

  return { A, B, C, D, E };
})();
