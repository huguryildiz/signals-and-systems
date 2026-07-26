/* ==========================================================================
   Laboratory H — Module 5  [Source: 45–61]
   CTFT Time–Frequency Explorer, with a modulation state.
   Every displayed number is computed from the definitions at interaction time.
   ========================================================================== */
Object.assign(LABS, (function(){
  /* The number formatter is called F inside 70_labs.js and F is also the id of
     a laboratory, so it is taken here under the name fmt. */
  const T = LABS.KIT.T, M = LABS.KIT.M, fmt = LABS.KIT.F;
  const PI = Math.PI;

  /* =======================================================================
     H · CTFT TIME–FREQUENCY EXPLORER                [Source: 45–61]
     One width or rate control, three linked panels, and a carrier that can be
     switched on and moved until the two spectral copies meet.
     ======================================================================= */
  const H = (() => {
    const sinc = x => Math.abs(x) < 1e-9 ? 1 : Math.sin(x)/x;
    const cx = (re,im)=>({re:re,im:im});
    const cadd = (a,b)=>cx(a.re+b.re, a.im+b.im);
    const cscale = (a,k)=>cx(a.re*k, a.im*k);
    const cabs = a=>Math.hypot(a.re,a.im);
    const carg = a=>(cabs(a)<1e-12 ? 0 : Math.atan2(a.im,a.re));

    /* Each signal carries its own transform in closed form, its own control and
       its own statement about band limitation. `kind` is 'curve' when the
       transform is an ordinary function and 'imp' when it is a train of
       impulses, because the two are drawn differently and must not be mixed.
       `edge` is the exact band edge in rad/s, or null when the signal is not
       band-limited at all. */
    const sigs = {
      rect:{ name:'Rectangular pulse', kind:'curve',
        sl:{min:0.25,max:3,step:0.05,val:1,label:'Half-width $T_1$ (s)'},
        tex:'x(t)=1\\ \\text{on}\\ |t|<T_1,\\qquad X(j\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)',
        x:(t,p)=>Math.abs(t)<p?1:0, tr:[-4,4],
        X:(w,p)=>cx(2*p*sinc(w*p),0),
        edge:null, bwName:'First null', bw:p=>PI/p, peak:p=>2*p },
      exp1:{ name:'One-sided exponential', kind:'curve',
        sl:{min:0.25,max:4,step:0.05,val:1,label:'Decay rate $a$ (1/s)'},
        tex:'x(t)=e^{-at}u(t),\\qquad X(j\\omega)=\\dfrac{1}{a+j\\omega},\\qquad a>0',
        x:(t,p)=>t<0?0:Math.exp(-p*t), tr:[-2,10],
        X:(w,p)=>{ const d=p*p+w*w; return cx(p/d, -w/d); },
        edge:null, bwName:'Half-power width', bw:p=>p, peak:p=>1/p },
      exp2:{ name:'Two-sided exponential', kind:'curve',
        sl:{min:0.25,max:4,step:0.05,val:1,label:'Decay rate $a$ (1/s)'},
        tex:'x(t)=e^{-a|t|},\\qquad X(j\\omega)=\\dfrac{2a}{a^{2}+\\omega^{2}}',
        x:(t,p)=>Math.exp(-p*Math.abs(t)), tr:[-6,6],
        X:(w,p)=>cx(2*p/(p*p+w*w),0),
        edge:null, bwName:'Half-power width', bw:p=>p, peak:p=>2/p },
      sinc:{ name:'Sinc signal', kind:'curve',
        sl:{min:1,max:8,step:0.25,val:3,label:'Band edge $W$ (rad/s)'},
        tex:'x(t)=\\dfrac{\\sin(Wt)}{\\pi t},\\qquad X(j\\omega)=1\\ \\text{on}\\ |\\omega|<W',
        x:(t,p)=>(p/PI)*sinc(p*t), tr:[-6,6],
        X:(w,p)=>cx(Math.abs(w)<p?1:0,0),
        edge:p=>p, bwName:'Band edge', bw:p=>p, peak:()=>1 },
      gauss:{ name:'Gaussian pulse', kind:'curve',
        sl:{min:0.2,max:2,step:0.05,val:0.7,label:'Width $\\sigma$ (s)'},
        tex:'x(t)=e^{-t^{2}/2\\sigma^{2}},\\qquad X(j\\omega)=\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^{2}\\omega^{2}/2}',
        x:(t,p)=>Math.exp(-t*t/(2*p*p)), tr:[-6,6],
        X:(w,p)=>cx(p*Math.sqrt(2*PI)*Math.exp(-p*p*w*w/2),0),
        edge:null, bwName:'Width in frequency', bw:p=>1/p, peak:p=>p*Math.sqrt(2*PI) },
      cosine:{ name:'Cosine', kind:'imp',
        sl:{min:1,max:8,step:0.25,val:3,label:'Signal frequency $\\omega_1$ (rad/s)'},
        tex:'x(t)=\\cos(\\omega_1t),\\qquad X(j\\omega)=\\pi\\delta(\\omega-\\omega_1)+\\pi\\delta(\\omega+\\omega_1)',
        x:(t,p)=>Math.cos(p*t), tr:[-6,6],
        lines:p=>[[-p,PI],[p,PI]],
        edge:p=>p, bwName:'Highest frequency', bw:p=>p, peak:()=>PI },
      train:{ name:'Impulse train', kind:'imp',
        sl:{min:0.4,max:3,step:0.1,val:1,label:'Impulse period $T$ (s)'},
        tex:'x(t)=\\sum_k\\delta(t-kT),\\qquad X(j\\omega)=\\dfrac{2\\pi}{T}\\sum_k\\delta\\!\\left(\\omega-\\dfrac{2\\pi k}{T}\\right)',
        x:null, tr:[-6,6],
        lines:p=>{ const o=[], w0=2*PI/p, K=Math.ceil(26/w0);
          for(let k=-K;k<=K;k++) o.push([k*w0, 2*PI/p]); return o; },
        edge:null, bwName:'Line spacing', bw:p=>2*PI/p, peak:p=>2*PI/p }
    };

    let key='rect', par=sigs.rect.sl.val, mod=false, wc=8;

    /* ---- the spectrum actually drawn, carrier included ---- */
    const spec = (w, s) => {
      const base = ww => s.X(ww, par);
      if(!mod) return base(w);
      return cadd(cscale(base(w-wc),0.5), cscale(base(w+wc),0.5));
    };
    /* ---- the same for a train of impulses: every line is halved and copied,
       and two lines that land on the same frequency are added, which is the
       overlap event made arithmetic rather than described ---- */
    const lines = (s) => {
      const raw = s.lines(par);
      if(!mod) return raw.slice();
      const out = [];
      raw.forEach(([w,A])=>{ out.push([w-wc,A/2]); out.push([w+wc,A/2]); });
      const merged = [];
      out.forEach(([w,A])=>{
        const hit = merged.find(m=>Math.abs(m[0]-w)<1e-9);
        if(hit) hit[1]+=A; else merged.push([w,A]);
      });
      return merged.sort((a,b)=>a[0]-b[0]);
    };

    function draw(root){
      const s = sigs[key];
      const wmax = 26;

      /* ---- panel 1: the signal in time, with the carrier filling in an
         envelope when the modulation state is on ---- */
      const tr = s.tr;
      let ylo=-1.3, yhi=1.3;
      if(s.x){
        let mx=0; for(let i=0;i<=1200;i++){ const t=tr[0]+(tr[1]-tr[0])*i/1200;
          mx=Math.max(mx, Math.abs(s.x(t,par))); }
        yhi = mx*1.25+0.05; ylo = key==='exp1'||key==='rect' ? -0.25*mx-0.05 : -yhi;
        if(mod) ylo = -yhi;
      } else { ylo=-0.35; yhi=1.5; }
      const A1 = PLOT.Axes({w:760,h:182,xr:tr,yr:[ylo,yhi],xlabel:'t',
        ylabel: mod ? 'x(t)\\cos(\\omega_ct)' : 'x(t)',
        pad:{l:58,r:24,t:30,b:34},xtarget:7,ytarget:3});
      if(key==='train'){
        const K=Math.floor(tr[1]/par);
        for(let k=-K;k<=K;k++){
          const t=k*par, h = mod ? Math.cos(wc*t) : 1;
          A1.impulse(t, h, {color: h>=0?PLOT.COL.in:PLOT.COL.err, labelText:fmt(h,2)});
        }
      } else if(mod){
        A1.curve(t=>s.x(t,par),{color:PLOT.COL.in,width:1.4,dash:'5 5',n:1200});
        A1.curve(t=>-s.x(t,par),{color:PLOT.COL.in,width:1.4,dash:'5 5',n:1200});
        A1.curve(t=>s.x(t,par)*Math.cos(wc*t),{color:PLOT.COL.out,width:2,n:6000});
      } else {
        A1.curve(t=>s.x(t,par),{color:PLOT.COL.in,width:2.3,n:3000});
      }

      /* ---- panels 2 and 3: magnitude and phase, negative frequencies always
         drawn, and the carrier marked when it is switched on ---- */
      let topMag, A2, A3;
      const L = s.kind==='imp' ? lines(s) : null;
      if(s.kind==='imp'){
        topMag = Math.max.apply(null, L.map(p=>Math.abs(p[1])).concat([0.1]));
        A2 = PLOT.Axes({w:760,h:172,xr:[-wmax,wmax],yr:[-0.14*topMag,1.32*topMag],
          xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',
          pad:{l:64,r:24,t:32,b:36},xtarget:7,ytarget:3});
        L.forEach(([w,Aw])=>{ if(Math.abs(w)<=wmax && Math.abs(Aw)>1e-9)
          A2.impulse(w, Aw, {color:PLOT.COL.mid, labelText:fmt(Aw,2)}); });
        A3 = PLOT.Axes({w:760,h:150,xr:[-wmax,wmax],yr:[-2.1,2.1],
          xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',
          pad:{l:70,r:24,t:32,b:34},xtarget:7,
          yticksOverride:[-1.5708,0,1.5708],ytickfmt:v=>v.toFixed(2)});
        A3.stem(L.filter(p=>Math.abs(p[0])<=wmax).map(p=>[p[0], p[1]>=0?0:PI]),
          {color:PLOT.COL.mid,r:3.4,showZero:true});
      } else {
        topMag = 0;
        for(let i=0;i<=1600;i++){ const w=-wmax+2*wmax*i/1600;
          topMag = Math.max(topMag, cabs(spec(w,s))); }
        topMag = Math.max(topMag, 1e-3);
        A2 = PLOT.Axes({w:760,h:172,xr:[-wmax,wmax],yr:[-0.12*topMag,1.28*topMag],
          xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',
          pad:{l:64,r:24,t:32,b:36},xtarget:7,ytarget:3});
        A2.curve(w=>cabs(spec(w,s)),{color:PLOT.COL.mid,width:2.3,n:2400});
        A3 = PLOT.Axes({w:760,h:150,xr:[-wmax,wmax],yr:[-3.9,3.9],
          xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',
          pad:{l:70,r:24,t:32,b:34},xtarget:7,
          yticksOverride:[-PI,-PI/2,0,PI/2,PI],ytickfmt:v=>v.toFixed(2)});
        A3.curve(w=>carg(spec(w,s)),{color:PLOT.COL.mid,width:2,n:2400});
      }
      if(mod){ A2.vline(wc,{color:PLOT.COL.err}); A2.vline(-wc,{color:PLOT.COL.err}); }

      root.querySelector('.plots').innerHTML = [A1,A2,A3].map(p=>p.svg()).join('');

      /* ---- the readouts, every one of them computed here ---- */
      const bw = s.bw(par), pk = s.peak(par);
      const zero = s.kind==='imp'
        ? (L.find(p=>Math.abs(p[0])<1e-9) || [0,0])[1]
        : cabs(spec(0,s));
      const bandLimited = !!s.edge;
      const apart = bandLimited ? wc > s.edge(par) : null;
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>Peak of $|X|$ before modulation</dt><dd class="okv">${fmt(pk,4)}</dd></div>
        <div><dt>${s.bwName}</dt><dd>${fmt(bw,4)} rad/s</dd></div>
        <div><dt>Band-limited</dt><dd style="font-size:17px">${bandLimited?('yes, to '+fmt(s.edge(par),3)+' rad/s'):'no'}</dd></div>
        <div><dt>${mod?'Value of the modulated spectrum at $\\omega=0$':'Value at $\\omega=0$'}</dt>
          <dd class="${mod&&zero>1e-6?'':'okv'}">${fmt(zero,4)}</dd></div>`);

      /* ---- the carrier readout and the two events kept apart ---- */
      root.querySelector('.modro').innerHTML = !mod ? '' : M(`
        <dl class="readout">
        <div><dt>Carrier $\\omega_c$</dt><dd class="okv">${fmt(wc,3)} rad/s</dd></div>
        <div><dt>Copies</dt><dd style="font-size:17px">two, each at half height</dd></div>
        <div><dt>Copy centres</dt><dd>$\\pm$${fmt(wc,3)} rad/s</dd></div>
        <div><dt>Upper copy occupies</dt><dd style="font-size:16px">${
          bandLimited ? fmt(wc-s.edge(par),3)+' to '+fmt(wc+s.edge(par),3)+' rad/s'
                      : 'the whole axis, weakly'}</dd></div>
        </dl>`);

      root.querySelector('.remark').innerHTML = M(!mod
        ? (bandLimited
          ? `<div class="note ok"><span class="note-h">This signal is band-limited</span>
               The transform is exactly zero beyond ${fmt(s.edge(par),3)} rad/s. Move the control and watch
               the two panels trade width: narrowing the signal in time widens the spectrum, and the
               product of the two barely moves.</div>`
          : `<div class="note def"><span class="note-h">Not band-limited</span>
               The transform approaches zero without ever reaching it, so there is no frequency beyond
               which the signal has nothing. Narrowing the signal in time still widens the spectrum:
               compare the peak and the ${s.bwName.toLowerCase()} as the control moves.</div>`)
        : (bandLimited
          ? (apart
            ? `<div class="note ok"><span class="note-h">Copies appear, and they are apart</span>
                 The carrier $\\omega_c=${fmt(wc,3)}$ exceeds the highest frequency in the signal,
                 ${fmt(s.edge(par),3)} rad/s, so the two half-height copies do not reach each other.
                 The spectrum at $\\omega=0$ is ${fmt(zero,4)}. Multiplying by the same carrier again and
                 low-pass filtering would return the signal.</div>`
            : `<div class="note err"><span class="note-h">The copies now overlap</span>
                 The carrier $\\omega_c=${fmt(wc,3)}$ is below the highest frequency in the signal,
                 ${fmt(s.edge(par),3)} rad/s, so the two copies have met and <b>added</b>. The spectrum at
                 $\\omega=0$ has risen to ${fmt(zero,4)}. Once two copies have been added there is no way to
                 tell what each contributed, and no filter recovers the signal.</div>`)
          : `<div class="note warn"><span class="note-h">Copies always appear; here they always touch</span>
               Two half-height copies are created at $\\pm${fmt(wc,3)}$ rad/s, exactly as for a band-limited
               signal. But this signal has no highest frequency, so the copies overlap at every carrier —
               the reading at $\\omega=0$ is ${fmt(zero,4)} and it falls as the carrier rises, without
               reaching zero. Replication and overlap are still two separate events: the first happened
               the moment the carrier was switched on.</div>`));

      root.querySelector('.signame').textContent = s.name;
      root.querySelector('.hdef').innerHTML = T(s.tex, true);
      const sl = root.querySelector('[data-v=par]');
      sl.min=s.sl.min; sl.max=s.sl.max; sl.step=s.sl.step; sl.value=par;
      root.querySelector('.parlabel').innerHTML = M(s.sl.label);
      root.querySelector('[data-out=par]').textContent = fmt(par,2);
      root.querySelector('[data-out=wc]').textContent = fmt(wc,2);
      root.querySelector('.wcctrl').style.display = mod ? '' : 'none';
      root.querySelectorAll('[data-case]').forEach(b=>
        b.setAttribute('aria-pressed', String(b.dataset.case===key)));
      root.querySelectorAll('[data-seg=mod]').forEach(b=>
        b.setAttribute('aria-pressed', String((b.dataset.val==='on')===mod)));
    }

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:4px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="hdef eq key" style="padding:12px 18px"></div>
            <div class="ctrls one">
              <div class="ctrl"><label>Signal <span class="seg">
                ${Object.keys(sigs).map(k=>`<button data-case="${k}">${k}</button>`).join('')}</span></label></div>
              <div class="ctrl"><label><span class="parlabel"></span> <span class="val" data-out="par">1</span></label>
                <input type="range" data-v="par" min="0.25" max="3" step="0.05" value="1"></div>
              <div class="ctrl"><label>Carrier $\\cos(\\omega_ct)$ <span class="seg">
                <button data-seg="mod" data-val="off">off</button>
                <button data-seg="mod" data-val="on">on</button></span></label></div>
              <div class="ctrl wcctrl"><label>Carrier $\\omega_c$ <span class="val" data-out="wc">8</span></label>
                <input type="range" data-v="wc" min="0.5" max="18" step="0.25" value="8"></div>
            </div>
            <dl class="readout ro"></dl>
            <div class="modro"></div>
            <div class="remark"></div>
            <div class="note def"><span class="note-h">What the panels show</span>
              Top: the signal in time. Middle: the magnitude of its transform. Bottom: the phase. Negative
              frequencies are drawn in every case.</div>
          </div></div>`);
      root.addEventListener('input', e=>{
        if(e.target.dataset.v==='par'){ par=parseFloat(e.target.value); draw(root); return; }
        if(e.target.dataset.v==='wc'){ wc=parseFloat(e.target.value); draw(root); }
      });
      root.addEventListener('click', e=>{
        const c=e.target.closest('[data-case]');
        if(c){ key=c.dataset.case; par=sigs[key].sl.val; draw(root); return; }
        const m=e.target.closest('[data-seg=mod]');
        if(m){ mod = m.dataset.val==='on'; draw(root); }
      });
      draw(root);
    }};
  })();

  return { H };
})());
