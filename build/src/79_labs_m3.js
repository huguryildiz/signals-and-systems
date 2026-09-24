/* ==========================================================================
   Laboratories 3.1–3.5 (keys M, E, N, O, T) — Module 3
   Every displayed number is computed from the definitions at interaction time.
   Laboratory E (Laboratory 3.2, discrete convolution) moves here from
   70_labs.js, converted to discrete time only and to the slide card language.
   Laboratory N (Laboratory 3.3, continuous convolution) shares its engine
   with E through convFactory().
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const N3 = (v,d=3)=> fmt(v,d);
  const L = (c,l)=>`<i class="lg-${c}">${T(l,false)}</i>`;

  /* =======================================================================
     M · IMPULSE RESPONSE OF A BLACK BOX             [Source: 14–15]
     A hidden system rule produces h by feeding it δ[n]. Every other output is
     then predicted by superposition of shifted, weighted copies of h and
     compared with the rule's true output. Systems A–C are LTI, so the
     prediction is exact; D is a squarer, so it is not.
     ======================================================================= */
  const M3M = (() => {
    const systems = {
      A:{ name:'System A', rule:(x)=> n=> (x(n)||0) + 0.5*(x(n-1)||0) + 0.25*(x(n-2)||0) },
      /* recursive from rest: y[n] = 0.5 y[n-1] + x[n], y[k]=0 for k<-6 */
      B:{ name:'System B', rule:(x)=> n=>{ let y=0; for(let k=-6;k<=n;k++) y = 0.5*y + (x(k)||0); return y; } },
      C:{ name:'System C', rule:(x)=> n=> ((x(n)||0)+(x(n-1)||0)+(x(n-2)||0))/3 },
      D:{ name:'System D', rule:(x)=> n=> Math.pow(x(n)||0,2) }
    };
    const inputs = {
      d0:  { name:'\\delta[n]',              tex:'\\delta[n]',              x:n=> n===0?1:0 },
      d2:  { name:'\\delta[n-2]',            tex:'\\delta[n-2]',            x:n=> n===2?1:0 },
      d0x2:{ name:'2\\delta[n]',             tex:'2\\delta[n]',             x:n=> n===0?2:0 },
      pair:{ name:'\\delta[n]+\\delta[n-1]', tex:'\\delta[n]+\\delta[n-1]', x:n=> (n===0||n===1)?1:0 },
      quad:{ name:'x[n]=\\{1,2,1,2\\}',      tex:'x[n]=\\{1,2,1,2\\}',      x:n=> [1,2,1,2][n]!==undefined&&n>=0&&n<=3?[1,2,1,2][n]:0 }
    };
    let st = { sys:'A', inp:'quad' };
    const xr=[-2,9];
    const disc = (f,a=xr[0],b=xr[1]) => { const p=[]; for(let n=a;n<=b;n++) p.push([n,f(n)]); return p; };
    /* measure h by feeding delta[n] through the hidden rule */
    function measureH(sys){
      const d = n=> n===0?1:0;
      const y = systems[sys].rule(d);
      const h = {}; for(let n=-2;n<=9;n++) h[n]=y(n);
      return h;
    }
    function draw(root){
      const sys = systems[st.sys], inp = inputs[st.inp];
      const h = measureH(st.sys);
      const hv = n=> h[n]||0;
      const trueY = sys.rule(inp.x);
      /* prediction by superposition: sum over k of x[k] h[n-k], using the
         non-zero samples of x on -2..9 */
      const predY = n=>{ let s=0; for(let k=-2;k<=9;k++){ const xk=inp.x(k); if(xk) s+=xk*hv(n-k); } return s; };
      let gap=0; for(let n=xr[0];n<=xr[1];n++) gap=Math.max(gap, Math.abs(trueY(n)-predY(n)));
      const ax = o=> PLOT.Axes(Object.assign({w:660,h:180,xr,yr:[-1.2,5.2],xlabel:'n',ylabel:'\\text{amplitude}',
        pad:{l:44,r:40,t:16,b:34},xnameDrop:44,xnameRight:34,xtarget:9,ytarget:3},o));
      const A1 = ax({});
      A1.stem(disc(inp.x),{color:PLOT.COL.in});
      const A2 = ax({});
      A2.stem(disc(trueY),{color:PLOT.COL.out});
      A2.stem(disc(predY).map(([n,v])=>[n,v]),{color:PLOT.COL.err,r:2.6});
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x[n]')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out','y[n]\\ \\text{(true)}')}${L('err','\\text{prediction from } h')}</div></div>`;
      root.querySelector('.lab-eq').innerHTML = T(`x[n]=${inp.tex.split('=').pop()}`,true);
      root.querySelector('.ro').innerHTML = `
        <div><dt>h[0..3] measured</dt><dd>${[0,1,2,3].map(n=>N3(hv(n),3)).join(', ')}</dd></div>
        <div><dt>Largest gap, true output to prediction</dt><dd class="${gap<1e-6?'okv':''}">${N3(gap,4)}</dd></div>`;
      /* the prediction equation, written with the actual sample values, using
         only the non-zero samples of the chosen input */
      const nzk = []; for(let k=-2;k<=9;k++) if(inp.x(k)) nzk.push(k);
      const terms = nzk.map(k=>{
        const xk=inp.x(k), coef = xk===1?'':(xk<0?`(${N3(xk)})\\,`:`${N3(xk)}\\,`);
        return `${coef}h[n${k===0?'':(k>0?'-'+k:'+'+(-k))}]`;
      }).join('+');
      root.querySelector('.derive').innerHTML = M(`
        <div class="eq"><span class="eq-label">Prediction from h</span>${T(`y[n]\\approx ${terms}`,true)}</div>
        ${gap<1e-6
          ? `<div class="note ok"><span class="note-h">Prediction holds</span>The gap is $0$: the system is LTI, so $h$ predicts every output.</div>`
          : `<div class="note err"><span class="note-h">Prediction fails</span>The gap is ${N3(gap,4)}, not $0$: the squarer is not linear, so one impulse response does not describe it.</div>`}`);
      root.querySelectorAll('[data-seg]').forEach(bt=> bt.setAttribute('aria-pressed', String(
        bt.dataset.seg==='sys' ? bt.dataset.val===st.sys : bt.dataset.val===st.inp)));
    }
    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:44px">
          <div class="col stack"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div>
            <div class="note warn"><span class="note-h">Measure first</span>
              The input $\\delta[n]$ gives $h[n]$. Every other output is then a sum of shifted copies of $h$, if the system is LTI.</div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>System (black box)
                <span class="seg">${Object.entries(systems).map(([k])=>
                  `<button data-seg="sys" data-val="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Input
                <span class="seg">${Object.entries(inputs).map(([k,it])=>
                  `<button data-seg="inp" data-val="${k}">$${it.tex}$</button>`).join('')}</span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        if(b.dataset.seg==='sys') st.sys=b.dataset.val; else st.inp=b.dataset.val;
        draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  /* =======================================================================
     CONVOLUTION ENGINE shared by E (discrete sum) and N (continuous integral)
     ======================================================================= */
  function convFactory(cases, opts){
    const dt = opts.dt;
    let key = opts.defaultKey, pos = 0, stage = 3;
    function conv(c, at){
      if(dt){ let s=0; for(let k=c.kr[0]-6;k<=c.kr[1]+6;k++) s+=c.x(k)*c.h(at-k); return s; }
      const lo=Math.max(c.xs[0], at-c.hs[1]), hi=Math.min(c.xs[1], at-c.hs[0]);
      if(!(hi>lo)) return 0;
      const NN=800, d=(hi-lo)/NN; let s=0;
      for(let i=0;i<=NN;i++){
        const t=lo+i*d, w=(i===0||i===NN)?1:(i%2?4:2);
        s+=w*c.x(t+(i===0?1e-12:i===NN?-1e-12:0))*c.h(at-t-(i===0?1e-12:i===NN?-1e-12:0));
      }
      return s*d/3;
    }
    function draw(root){
      const c=cases[key]; const n = dt? Math.round(pos) : pos;
      const mk=o=>PLOT.Axes(Object.assign({w:700,h:128,xr:c.kr,yr:c.yr,xlabel:dt?'k':'\\tau',ylabel:'\\text{amplitude}',
        pad:{l:44,r:40,t:12,b:26},xnameDrop:44,xnameRight:34,xtarget:8,ytarget:2},o));
      const disc=f=>{const p=[];for(let k=Math.ceil(c.kr[0]);k<=c.kr[1];k++)p.push([k,f(k)]);return p;};
      const A1=mk({});
      if(dt){ A1.stem(disc(c.x),{color:PLOT.COL.in}); A1.stem(disc(k=>c.h(n-k)),{color:PLOT.COL.h,r:3}); }
      else { A1.curve(c.x,{color:PLOT.COL.in}); A1.curve(t=>c.h(n-t),{color:PLOT.COL.h}); }
      A1.vline(n,{color:PLOT.COL.coral,dash:'4 4'});
      const A2=mk({});
      if(dt){ A2.stem(disc(k=>c.x(k)*c.h(n-k)),{color:PLOT.COL.mid}); }
      else { A2.area(t=>c.x(t)*c.h(n-t), c.kr[0], c.kr[1], {color:'rgba(106,90,146,.22)'});
             A2.curve(t=>c.x(t)*c.h(n-t),{color:PLOT.COL.mid}); }
      const A3=PLOT.Axes({w:700,h:138,xr:c.nr,yr:c.yr,xlabel:dt?'n':'t',ylabel:dt?'y[n]':'y(t)',pad:{l:44,r:40,t:12,b:26},xnameDrop:44,xnameRight:34,xtarget:8,ytarget:2});
      if(dt){ const p=[]; for(let m=Math.ceil(c.nr[0]);m<=c.nr[1];m++) p.push([m, m<=n?conv(c,m):0]);
        A3.stem(p.filter(q=>q[0]<=n),{color:PLOT.COL.out}); }
      else { const pts=[]; for(let i=0;i<=260;i++){ const t=c.nr[0]+(Math.min(n,c.nr[1])-c.nr[0])*i/260;
          if(t>c.nr[1])break; pts.push([t,conv(c,t)]); } if(pts.length>1) A3.poly(pts,{color:PLOT.COL.out}); }
      const yv = conv(c,n);
      A3.vline(n,{color:PLOT.COL.coral,dash:'4 4'}); A3.point(n,yv,{color:PLOT.COL.coral});
      const panels=[A1,A2,A3].slice(0,stage);
      const legs = [
        `<div class="legend in-plot lg-at-tr">${L('in',dt?'x[k]':'x(\\tau)')}${L('h',dt?'h[n-k]':'h(t-\\tau)')}</div>`,
        `<div class="legend in-plot lg-at-tr">${L('mid',dt?'x[k]\\,h[n-k]':'x(\\tau)h(t-\\tau)')}</div>`,
        `<div class="legend in-plot lg-at-tr">${L('out',dt?'y[n]':'y(t)')}</div>`
      ];
      root.querySelector('.plots').innerHTML = panels.map((p,i)=>`<div class="plot-wrap">${p.svg()}${legs[i]}</div>`).join('');
      root.querySelector('.ro').innerHTML=`
        <div><dt>${dt?'n':'t'}</dt><dd>${dt?n:N3(n,2)}</dd></div>
        <div><dt>${dt?'y[n]':'y(t)'}</dt><dd class="okv">${N3(yv,4)}</dd></div>
        <div><dt>Overlap</dt><dd style="font-size:calc(16px * var(--ts))">${Math.abs(yv)>1e-9?'non-empty':'empty, output 0'}</dd></div>`;
      /* the convolution-sum/-integral equation, written with the non-zero terms */
      root.querySelector('.stepeq-label').textContent = (dt?'Convolution sum at n = ':'Convolution integral at t = ')+(dt?n:N3(n,2));
      if(dt){
        const terms=[]; for(let k=c.kr[0]-6;k<=c.kr[1]+6;k++){ const xk=c.x(k), hk=c.h(n-k);
          if(xk && hk) terms.push({k,xk,hk}); }
        const rhs = terms.map(t=>`x[${t.k}]h[${n}${t.k===0?'':(t.k>0?'-'+t.k:'+'+(-t.k))}]`).join('+');
        const val = terms.map(t=>`${N3(t.xk,3)}\\cdot${N3(t.hk,3)}`).join('+');
        root.querySelector('.stepeq').innerHTML = terms.length ? T(`y[${n}]=${rhs}=${val}=${N3(yv,4)}`,true)
          : T(`y[${n}]=0`,true);
      } else {
        root.querySelector('.stepeq').innerHTML = T(`y(${N3(n,2)})=\\int x(\\tau)h(${N3(n,2)}-\\tau)\\,\\mathrm{d}\\tau=${N3(yv,4)}`,true);
      }
      root.querySelector('.exact').innerHTML = T(c.exact,true);
      const sl=root.querySelector('[data-v=pos]');
      sl.min=c.nr[0]; sl.max=c.nr[1]; sl.step=dt?1:0.05; sl.value=pos;
      root.querySelector('[data-out=pos]').textContent=(dt?'n = ':'t = ')+(dt?n:N3(n,2));
      root.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===key)));
      root.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.stage===stage)));
    }
    return { mount(root){
      root.innerHTML=M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <div class="ctrls one">
              <div class="ctrl"><label>Case <span class="seg">
                ${Object.entries(cases).map(([k,c])=>`<button data-case="${k}">$${c.btn}$</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Shift <span class="val" data-out="pos"></span></label>
                <input type="range" data-v="pos"></div>
              <div class="ctrl"><label>Show up to <span class="seg">
                <button data-stage="1">flip &amp; shift</button>
                <button data-stage="2">+ multiply</button>
                <button data-stage="3">+ ${dt?'sum':'integrate'}</button></span></label></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack">
              <div class="eq"><span class="eq-label stepeq-label"></span><span class="stepeq"></span></div>
              <div class="eq"><span class="eq-label">Closed form</span><div class="exact"></div></div>
            </div>
            <div class="note warn"><span class="note-h">Flip before you shift</span>
              ${dt ? 'The amber trace is $h$ reversed and then shifted. An unreversed $h$ gives a correlation, not a convolution.'
                   : 'Read the integration limits from the edges of the shaded overlap, not from the fixed supports alone.'}</div>
          </div></div>`);
      root.addEventListener('input',e=>{ if(e.target.dataset.v==='pos'){ pos=parseFloat(e.target.value); draw(root);} });
      root.addEventListener('click',e=>{
        const c=e.target.closest('[data-case]');
        if(c){ key=c.dataset.case; pos=0; draw(root); RENDER.fit(); return; }
        const s=e.target.closest('[data-stage]'); if(s){ stage=+s.dataset.stage; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  }

  /* =======================================================================
     E · CONVOLUTION SUM, STEP BY STEP               [Source: 15–17]
     Discrete time only. dt3 is new: x={1,2,1,2}, h={1,0.6,0.3}.
     ======================================================================= */
  const E = convFactory({
    dt1:{ btn:'\\{1,2,1,2\\}*\\{1,1\\}', name:'x[n]=\\{1,2,1,2\\},\\ h[n]=\\{1,1\\}',
          x:n=>[1,2,1,2][n]!==undefined&&n>=0&&n<=3?[1,2,1,2][n]:0,
          h:n=>(n===0||n===1)?1:0, kr:[-4,9], nr:[-2,7], yr:[-0.4,3.6],
          exact:'y[n]=\\delta[n]+3\\delta[n-1]+3\\delta[n-2]+3\\delta[n-3]+2\\delta[n-4]' },
    dt2:{ btn:'(1/2)^{n}u[n]*u[n]', name:'x[n]=\\left(\\tfrac12\\right)^{n}u[n],\\ h[n]=u[n]',
          x:n=>n>=0?Math.pow(.5,n):0, h:n=>n>=0?1:0, kr:[-6,14], nr:[-3,12], yr:[-0.3,2.4],
          exact:'y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]' },
    dt3:{ btn:'\\{1,2,1,2\\}*\\{1,0.6,0.3\\}', name:'x[n]=\\{1,2,1,2\\},\\ h[n]=\\{1,0.6,0.3\\}',
          x:n=>[1,2,1,2][n]!==undefined&&n>=0&&n<=3?[1,2,1,2][n]:0,
          h:n=>[1,0.6,0.3][n]!==undefined&&n>=0&&n<=2?[1,0.6,0.3][n]:0, kr:[-4,10], nr:[-2,7], yr:[-0.4,3.6],
          exact:'y[n]=\\delta[n]+2.6\\delta[n-1]+2.5\\delta[n-2]+3.2\\delta[n-3]+1.5\\delta[n-4]+0.6\\delta[n-5]' }
  }, { dt:true, defaultKey:'dt1' });

  /* =======================================================================
     N · CONVOLUTION INTEGRAL, STEP BY STEP          [Source: 17–20]
     Continuous time. ct3 is new: x(t)=h(t)=1 on 0<t<1, a triangle.
     ======================================================================= */
  const NLab = convFactory({
    ct1:{ btn:'\\text{rect}(0,1)*\\text{ramp}(0,2)', name:'x(t)=1\\ \\text{on}\\ 0<t<1,\\ h(t)=t\\ \\text{on}\\ 0<t<2',
          xs:[0,1], hs:[0,2], x:t=>(t>0&&t<1)?1:0, h:t=>(t>0&&t<2)?t:0, kr:[-2,5], nr:[-1,4], yr:[-0.3,2.3],
          exact:'y(t)=\\begin{cases}0,&t<0\\\\ \\tfrac12t^{2},&0<t<1\\\\ t-\\tfrac12,&1<t<2\\\\ -\\tfrac12t^{2}+t+\\tfrac32,&2<t<3\\\\ 0,&t>3\\end{cases}' },
    ct2:{ btn:'e^{2t}u(-t)*u(t-3)', name:'x(t)=e^{2t}u(-t),\\ h(t)=u(t-3)',
          xs:[-20,0], hs:[3,60], x:t=>t<=0?Math.exp(2*t):0, h:t=>t>=3?1:0, kr:[-5,7], nr:[-2,7], yr:[-0.1,0.75],
          exact:'y(t)=\\begin{cases}\\tfrac12e^{2(t-3)},&t<3\\\\[2pt] \\tfrac12,&t>3\\end{cases}' },
    ct3:{ btn:'\\text{rect}(0,1)*\\text{rect}(0,1)', name:'x(t)=h(t)=1\\ \\text{on}\\ 0<t<1',
          xs:[0,1], hs:[0,1], x:t=>(t>0&&t<1)?1:0, h:t=>(t>0&&t<1)?1:0, kr:[-2,4], nr:[-1,3], yr:[-0.2,1.3],
          exact:'y(t)=\\begin{cases}0,&t<0\\\\ t,&0<t<1\\\\ 2-t,&1<t<2\\\\ 0,&t>2\\end{cases}' }
  }, { dt:false, defaultKey:'ct1' });

  /* =======================================================================
     O · SYSTEM PROPERTIES FROM h                    [Source: 21]
     Seven impulse responses, answered Memoryless / Causal / BIBO stable with
     ringed-letter yes/no buttons, as in Laboratory D.
     ======================================================================= */
  const O = (() => {
    const items = [
      { id:1, tex:'h[n]=0.7^{\\,n}u[n]', h:n=>n>=0?Math.pow(0.7,n):0, converges:true,
        p:{ mem:{v:false,arg:'$h[1]=0.7\\neq0$, so the output depends on more than the current input.'},
            cau:{v:true, arg:'$h[n]=0$ for $n<0$.'},
            sta:{v:true, arg:'$\\sum|h[k]|=\\sum_{k=0}^{\\infty}0.7^{\\,k}=\\dfrac{1}{1-0.7}=\\dfrac{10}{3}<\\infty$.'} } },
      { id:2, tex:'h[n]=u[n]', h:n=>n>=0?1:0, converges:false,
        p:{ mem:{v:false,arg:'$h[1]=1\\neq0$.'},
            cau:{v:true, arg:'$h[n]=0$ for $n<0$.'},
            sta:{v:false,arg:'The partial sums grow as $N+1$, so $\\sum|h[k]|\\to\\infty$.'} } },
      { id:3, tex:'h[n]=2\\delta[n]', h:n=>n===0?2:0, converges:true,
        p:{ mem:{v:true, arg:'$h[n]=a\\delta[n]$ with $a=2$.'},
            cau:{v:true, arg:'$h[n]=0$ for $n<0$.'},
            sta:{v:true, arg:'$\\sum|h[k]|=2<\\infty$.'} } },
      { id:4, tex:'h[n]=\\delta[n+1]+\\delta[n]', h:n=>(n===0||n===-1)?1:0, converges:true,
        p:{ mem:{v:false,arg:'$h[n]$ is non-zero at two points, so $h\\neq a\\delta[n]$.'},
            cau:{v:false,arg:'$h[-1]=1\\neq0$: the output at $n$ uses $x[n+1]$, a future input.'},
            sta:{v:true, arg:'$\\sum|h[k]|=1+1=2<\\infty$.'} } },
      { id:5, tex:'h[n]=(1.1)^{n}u[n]', h:n=>n>=0?Math.pow(1.1,n):0, converges:false,
        p:{ mem:{v:false,arg:'$h[1]=1.1\\neq0$.'},
            cau:{v:true, arg:'$h[n]=0$ for $n<0$.'},
            sta:{v:false,arg:'$|h[k]|=(1.1)^{k}\\to\\infty$, so the terms do not even shrink to zero and the sum diverges.'} } },
      { id:6, tex:'h[n]=0.5^{\\,|n|}', h:n=>Math.pow(0.5,Math.abs(n)), converges:true,
        p:{ mem:{v:false,arg:'$h[1]=0.5\\neq0$.'},
            cau:{v:false,arg:'$h[-1]=0.5\\neq0$: the response depends on a future input.'},
            sta:{v:true, arg:'$\\sum|h[k]|=1+2\\sum_{k=1}^{\\infty}0.5^{\\,k}=1+2=3<\\infty$.'} } },
      { id:7, tex:'h[n]=\\delta[n]-\\delta[n-1]', h:n=>n===0?1:(n===1?-1:0), converges:true,
        p:{ mem:{v:false,arg:'$h[n]$ is non-zero at two points, so $h\\neq a\\delta[n]$.'},
            cau:{v:true, arg:'$h[n]=0$ for $n<0$.'},
            sta:{v:true, arg:'$\\sum|h[k]|=1+1=2<\\infty$.'} } }
    ];
    const PROPS = [
      { k:'mem', name:'Memoryless', crit:'$h[n]=a\\,\\delta[n]$ for some constant $a$.' },
      { k:'cau', name:'Causal',     crit:'$h[n]=0$ for $n<0$.' },
      { k:'sta', name:'BIBO stable',crit:'$\\displaystyle\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|<\\infty$.' }
    ];
    let cur=0, pick={}, sel='mem', shown=false;
    function partialSums(it){
      const pts=[]; let s=0;
      for(let Nn=0; Nn<=12; Nn++){ s=0; for(let k=-Nn;k<=Nn;k++) s+=Math.abs(it.h(k)); pts.push([Nn,s]); }
      return pts;
    }
    function draw(root){
      const it = items[cur];
      const ax1 = PLOT.Axes({w:640,h:180,xr:[-4,12],yr:[-1.3,2.3],xlabel:'n',ylabel:'h[n]',pad:{l:46,r:40,t:16,b:34},xnameDrop:44,xnameRight:34,xtarget:8,ytarget:3});
      const hp=[]; for(let n=-4;n<=12;n++) hp.push([n,it.h(n)]);
      ax1.stem(hp,{color:PLOT.COL.h});
      const S = partialSums(it);
      const smax = Math.max(...S.map(p=>p[1]),1);
      const ax2 = PLOT.Axes({w:640,h:150,xr:[0,12],yr:[0,smax*1.15],xlabel:'N',ylabel:'S_N',pad:{l:46,r:40,t:16,b:30},xnameDrop:44,xnameRight:34,xtarget:6,ytarget:2});
      ax2.poly(S,{color: it.converges?PLOT.COL.out:PLOT.COL.err});
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${ax1.svg()}<div class="legend in-plot lg-at-tr">${L('h','h[n]')}</div></div>`
      + `<div class="plot-wrap">${ax2.svg()}<div class="legend in-plot lg-at-tr">${L(it.converges?'out':'err',`S_N=\\textstyle\\sum_{|k|\\le N}|h[k]|`)}</div></div>`;
      root.querySelector('.sig').innerHTML = T(it.tex,true);
      root.querySelector('.plist').innerHTML = PROPS.map(p=>{
        const r = it.p[p.k], a = pick[p.k], done = a!==undefined || shown;
        const opt=(v,k,lab)=>`<button class="opt${done ? (v===r.v?' correct':(a===v?' wrong':''))+' locked' : ''}"
          data-pick="${v?'yes':'no'}" data-k="${p.k}"${done?' disabled':''}><span class="k">${k}</span><span>${lab}</span></button>`;
        return `<div class="prow${p.k===sel?' on':''}">
          <button class="pname" data-prop="${p.k}">${p.name}</button>
          ${opt(true,'A','Yes')}${opt(false,'B','No')}</div>`;
      }).join('');
      const p = PROPS.find(q=>q.k===sel), r = it.p[sel], done = pick[sel]!==undefined || shown;
      root.querySelector('.detail').innerHTML = M(`
        <div class="note def"><span class="note-h">Criterion · ${p.name}</span>${p.crit}</div>
        ${done ? `<div class="note ${r.v?'ok':'err'}"><span class="note-h">${r.v?'Yes':'No'}</span>${r.arg}</div>`
               : `<div class="note warn"><span class="note-h">Predict first</span>Answer yes or no for ${p.name.toLowerCase()}. The reason opens after your answer.</div>`}`);
      const n = Object.keys(pick).length, ok = Object.keys(pick).filter(k=>pick[k]===it.p[k].v).length;
      root.querySelector('.ro').innerHTML = `
        <div><dt>Answered</dt><dd>${n} of 3</dd></div>
        <div><dt>Correct</dt><dd class="${n&&ok===n?'okv':''}">${ok} of ${n}</dd></div>`;
      root.querySelector('[data-reveal]').textContent = shown ? 'Hide the answers' : 'Show all answers';
      root.querySelector('.counter').textContent = (cur+1)+' / '+items.length;
    }
    return { mount(root){
      root.innerHTML=`
        <div class="cols c-6-6" style="gap:44px">
          <div class="col stack">
            <div class="sig eq key"></div>
            <div class="plots" style="display:flex;flex-direction:column;gap:6px"></div>
            <dl class="readout ro"></dl>
            <div class="dnav">
              <button class="btn" data-reveal>Show all answers</button>
              <button class="btn" data-nav="-1">Previous</button>
              <button class="btn primary" data-nav="1">Next h[n]</button>
              <span class="small counter"></span></div>
          </div>
          <div class="col stack">
            <div class="plist"></div>
            <div class="detail derive stack"></div>
          </div>
        </div>`;
      root.addEventListener('click',e=>{
        const b=e.target.closest('[data-pick]');
        if(b){ if(pick[b.dataset.k]===undefined && !shown){ pick[b.dataset.k] = b.dataset.pick==='yes'; sel=b.dataset.k; draw(root); RENDER.fit(); } return; }
        const p=e.target.closest('[data-prop]'); if(p){ sel=p.dataset.prop; draw(root); RENDER.fit(); return; }
        if(e.target.closest('[data-reveal]')){ shown=!shown; draw(root); RENDER.fit(); return; }
        const n=e.target.closest('[data-nav]');
        if(n){ cur=(cur+ +n.dataset.nav + items.length)%items.length; pick={}; sel='mem'; shown=false; draw(root); RENDER.fit(); }
      });
      draw(root);
    }};
  })();

  /* =======================================================================
     T · A DIFFERENCE EQUATION, STEP BY STEP          [OW 2.4.2]
     y[n] = a y[n-1] + x[n], at rest before n = 0. The output is computed by
     the recursion up to the chosen n and compared with x*h, h[n] = a^n u[n].
     The stability verdict comes from |a|.
     ======================================================================= */
  const RecLab = (() => {
    const inputs = {
      d:  { tex:'\\delta[n]',     x:n=> n===0?1:0 },
      u:  { tex:'u[n]',           x:n=> n>=0?1:0 },
      p3: { tex:'u[n]-u[n-3]',    x:n=> (n>=0&&n<=2)?1:0 }
    };
    const NMAX = 12, xr=[-2,NMAX+0.6];
    let st = { a:0.5, inp:'u', n:3 };
    const r1 = v=> Math.round(v*10)/10;
    /* the recursion from rest: y[-1] = 0 */
    function recur(a, x){ const y=[]; let prev=0; for(let n=0;n<=NMAX;n++){ prev=a*prev+x(n); y.push(prev); } return y; }
    function draw(root){
      const a=r1(st.a), inp=inputs[st.inp], x=inp.x, n=st.n;
      const y = recur(a, x);
      const h = k=> k>=0?Math.pow(a,k):0;
      const conv = m=>{ let s=0; for(let k=0;k<=m;k++) s+=x(k)*h(m-k); return s; };
      const gap = Math.abs(conv(n)-y[n]);
      const big = Math.max(1, ...y.map(Math.abs));
      const yr = [Math.min(-0.3*big/3, ...y.map(v=>v*1.15)), Math.max(1.3, ...y.map(v=>v*1.15))];
      const ax = o=> PLOT.Axes(Object.assign({w:660,h:170,xr,xlabel:'n',
        pad:{l:50,r:40,t:16,b:34},xnameDrop:44,xnameRight:34,xtarget:8,ytarget:3},o));
      const A1 = ax({yr:[-0.3,1.4],ylabel:'x[n]'});
      const pts=[]; for(let k=-2;k<=NMAX;k++) pts.push([k,x(k)]);
      A1.stem(pts,{color:PLOT.COL.in});
      const A2 = ax({yr,ylabel:'y[n]'});
      const done=[]; for(let k=-2;k<=n;k++) done.push([k,k<0?0:y[k]]);
      A2.stem(done,{color:PLOT.COL.out});
      A2.vline(n,{color:PLOT.COL.coral,dash:'4 4'});
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in',`x[n]=${inp.tex}`)}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('out','y[n]\\ \\text{up to the cursor}')}</div></div>`;
      root.querySelector('.lab-eq').innerHTML = T(`y[n]=${N3(a,1)}\\,y[n-1]+x[n]`,true);
      root.querySelector('[data-out=a]').textContent = N3(a,1);
      root.querySelector('[data-out=n]').textContent = String(n);
      const yPrev = n>0?y[n-1]:0;
      const stable = Math.abs(a)<1;
      root.querySelector('.ro').innerHTML = `
        <div><dt>y[${n}] by recursion</dt><dd>${N3(y[n],4)}</dd></div>
        <div><dt>(x*h)[${n}]</dt><dd class="${gap<1e-9?'okv':''}">${N3(conv(n),4)}</dd></div>`;
      root.querySelector('.derive').innerHTML = M(`
        <div class="eq"><span class="eq-label">Recursion at n = ${n}</span>${T(
          `y[${n}]=${N3(a,1)}\\cdot ${n>0?'y['+(n-1)+']':'y[-1]'}+x[${n}]=${N3(a,1)}\\cdot(${N3(yPrev,4)})+${N3(x(n),1)}=${N3(y[n],4)}`,true)}</div>
        ${stable
          ? `<div class="note ok"><span class="note-h">BIBO stable</span>$h[n]=(${N3(a,1)})^{n}u[n]$ and $\\sum_n|h[n]|=\\dfrac{1}{1-${N3(Math.abs(a),1)}}=${N3(1/(1-Math.abs(a)),3)}$.</div>`
          : `<div class="note err"><span class="note-h">Not BIBO stable</span>$|a|=${N3(Math.abs(a),1)}\\ge1$, so the samples of $h[n]=a^{n}u[n]$ do not shrink and $\\sum_n|h[n]|$ diverges.</div>`}`);
      root.querySelectorAll('[data-seg]').forEach(bt=> bt.setAttribute('aria-pressed', String(bt.dataset.val===st.inp)));
    }
    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:44px">
          <div class="col stack"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div>
            <div class="note warn"><span class="note-h">At rest</span>
              The recursion starts from $y[-1]=0$. Each new sample needs only the last output and the new input.</div></div>
          <div class="col stack">
            <div class="lab-eq eq key" style="padding:14px 20px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Feedback gain a <span class="val" data-out="a"></span></label>
                <input type="range" data-v="a" min="-1.2" max="1.2" step="0.1" value="${st.a}"></div>
              <div class="ctrl"><label>Input
                <span class="seg">${Object.entries(inputs).map(([k,it])=>
                  `<button data-seg="inp" data-val="${k}">$${it.tex}$</button>`).join('')}</span></label></div>
              <div class="ctrl"><label>Cursor n <span class="val" data-out="n"></span></label>
                <input type="range" data-v="n" min="0" max="${NMAX}" step="1" value="${st.n}"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        st[k] = k==='n' ? Math.round(+e.target.value) : +e.target.value; draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg]'); if(!b) return;
        st.inp=b.dataset.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { M:M3M, E, N:NLab, O, T:RecLab };
})());
