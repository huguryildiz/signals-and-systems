/* ==========================================================================
   Laboratory 7.4 (key J4) — Module 7  [Source: 86–88]
   The folding of a sampled tone. A cosine of frequency f0 is sampled at fs.
   The samples are those of the lowest-frequency cosine through them, at
   fa = |f0 - k fs| with the integer k that brings it into [0, fs/2]; that is
   what an ideal reconstruction returns. The folding diagram draws fa against
   f0, a zig-zag of period fs. An anti-aliasing filter at fs/2 can be switched
   on: a tone above fs/2 is then removed before the sampler, and nothing comes
   out rather than a false tone.
   Every displayed number is computed from these definitions at interaction
   time. The two sound buttons use the renderer's own sound mechanism: they
   are drawn by RENDER.blocks as a figure with `listen`, so the sound stops
   when the scene changes, as it does on a slide.
   Styled like build/src/73_labs_m6_i6.js: legends inside .plot-wrap,
   computed equations as tabbed .eq cards, notes as tabbed cards, no bare
   inline pixel font sizes.
   ========================================================================== */
Object.assign(LABS, (function(){
  const T = LABS.KIT.T, M = LABS.KIT.M;
  const L = (c,l,dash)=>`<i class="lg-${c}"${dash?' data-dash="1"':''}>${T(l,false)}</i>`;
  const PI = Math.PI;
  const n1 = v => String(+(+v).toFixed(1));

  const J4 = (() => {
    /* f0 and fs in kHz; the anti-aliasing filter off or on */
    let f0 = 5, fs = 8, aa = 'off';
    const TMAX = 2;          /* ms of signal drawn */
    const FMAX = 12;         /* kHz: the range of f0, and of the folding diagram */

    /* the nearest multiple of fs, and the distance to it; a tie rounds up */
    const kOf = (f,r) => Math.floor(f/r + 0.5);
    const fold = (f,r) => Math.abs(f - r*kOf(f,r));
    const state = () => {
      const k = kOf(f0,fs), fa = fold(f0,fs), above = f0 > fs/2 + 1e-9;
      const removed = aa==='on' && above;
      return { k, fa, above, removed };
    };

    function draw(root){
      const C = PLOT.COL, s = state();
      const xin = t => Math.cos(2*PI*f0*t);                 /* t in ms, f in kHz */
      const xs  = t => s.removed ? 0 : xin(t);               /* what reaches the sampler */
      const out = t => s.removed ? 0 : Math.cos(2*PI*s.fa*t);
      const outCol = s.above && !s.removed ? C.err : C.out;

      /* ---- 1: the tone, its samples, and the cosine through them ---- */
      const A1 = PLOT.Axes({w:760,h:170,xr:[-0.03,TMAX+0.03],yr:[-1.35,1.35],
        xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_r(t)',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,
        yticksOverride:[-1,0,1],xticksOverride:[0,0.5,1,1.5,2]});
      A1.curve(xin,{color:C.in,width:1.4,dash:'5 5',n:3200});
      A1.curve(out,{color:outCol,width:2.4,n:2000});
      const pts=[]; for(let n=0;n<=TMAX*fs+1e-9;n++) pts.push([n/fs, xs(n/fs)]);
      pts.forEach(p=>A1.point(p[0],p[1],{color:C.mid,r:4.2}));

      /* ---- 2: the lines after sampling, and the filter band ---- */
      const SP = 14;
      const A2 = PLOT.Axes({w:760,h:190,xr:[-SP,SP],yr:[-0.15,1.55],
        xlabel:'f\\;[\\text{kHz}]',ylabel:'\\text{lines of }x_p',pad:{l:56,r:24,t:20,b:30},
        yticksOverride:[],xticksOverride:[-12,-8,-4,0,4,8,12]});
      /* the copies first, so a signal line on the band edge is drawn on top */
      const K = Math.ceil((SP+f0)/fs)+1, ks=[];
      for(let k=-K;k<=K;k++) if(k!==0) ks.push(k);
      ks.push(0);
      for(const k of ks) for(const sg of [1,-1]){
        const pos = k*fs + sg*f0; if(Math.abs(pos) > SP-1e-9) continue;
        const keep = Math.abs(pos) < fs/2 - 1e-9 || (Math.abs(Math.abs(pos)-fs/2) < 1e-9 && k===0);
        let col = keep ? (k===0 ? C.in : C.err) : C.muted;
        if(s.removed) col = C.muted;
        A2.impulse(pos, s.removed ? 0.45 : 1, {color:col, label:false});
      }
      A2.rect(-fs/2,0,fs/2,1.2,{stroke:C.h,dash:'6 4',width:1.6});

      /* ---- 3: the folding diagram, fa against f0 ---- */
      const A3 = PLOT.Axes({w:760,h:200,xr:[0,FMAX],yr:[0,7.4],
        xlabel:'f_0\\;[\\text{kHz}]',ylabel:'f_a\\;[\\text{kHz}]',pad:{l:56,r:24,t:20,b:30},yticksLeft:true,
        xticksOverride:[0,2,4,6,8,10,12],yticksOverride:[0,3,6]});
      for(let m=1; m*fs/2 < FMAX; m++) A3.vline(m*fs/2,{color:C.muted,opacity:.5});
      A3.curve(f=>fold(f,fs),{color:C.mid,width:2.2,n:2400});
      A3.poly([[0,s.fa],[f0,s.fa]],{color:outCol,width:1.4,dash:'4 4'});
      A3.poly([[f0,0],[f0,s.fa]],{color:outCol,width:1.4,dash:'4 4'});
      if(s.removed) A3.raw(`<circle cx="${A3.sx(f0).toFixed(2)}" cy="${A3.sy(s.fa).toFixed(2)}" r="7" fill="none" stroke="${C.muted}" stroke-width="2.2"/>`);
      else A3.point(f0, s.fa, {color:outCol, r:6.5});

      const outLbl = s.removed ? 'x_r(t)=0' : 'x_r(t)';
      root.querySelector('.plots').innerHTML =
        `<div class="plot-wrap">${A1.svg()}<div class="legend in-plot lg-at-tr">${L('in','x(t)',true)}${L(s.above&&!s.removed?'err':'out',outLbl)}${L('mid','x(nT)')}</div></div>`
      + `<div class="plot-wrap">${A2.svg()}<div class="legend in-plot lg-at-tr">${L('in','\\text{kept, own}')}${L('err','\\text{kept, copy}')}${L('h','|f|<f_s/2',true)}</div></div>`
      + `<div class="plot-wrap">${A3.svg()}<div class="legend in-plot lg-at-tr">${L('mid','f_a\\ \\text{against}\\ f_0')}${L(s.above&&!s.removed?'err':'out','\\text{this tone}')}</div></div>`;

      /* ---- readouts ---- */
      root.querySelector('.ro').innerHTML = M(`
        <div><dt>$f_s/2$</dt><dd>${n1(fs/2)} kHz</dd></div>
        <div><dt>Multiple $k$</dt><dd>${s.k}</dd></div>
        <div><dt>Folded $f_a$</dt><dd class="${s.above?'':'okv'}">${n1(s.fa)} kHz</dd></div>
        <div><dt>Output</dt><dd class="${s.above&&!s.removed?'':'okv'}">${s.removed?'none':n1(s.fa)+' kHz'}</dd></div>`);

      root.querySelector('.signame').innerHTML =
        T(`x(t)=\\cos(2\\pi f_0t),\\quad f_0=${n1(f0)}\\ \\text{kHz},\\quad f_s=${n1(fs)}\\ \\text{kHz}`, false);

      const foldTex = s.k===0
        ? `f_a=|f_0-0\\cdot f_s|=${n1(f0)}\\ \\text{kHz}`
        : `f_a=|f_0-${s.k===1?'':s.k}f_s|=|${n1(f0)}-${s.k===1?'':s.k+'\\cdot'}${n1(fs)}|=${n1(s.fa)}\\ \\text{kHz}`;
      const note = !s.above
        ? `<div class="note ok"><span class="note-h">No aliasing</span>
             $f_0=${n1(f0)}\\le f_s/2=${n1(fs/2)}$ kHz. The tone returns at its own frequency.</div>`
        : s.removed
        ? `<div class="note ok"><span class="note-h">Removed before sampling</span>
             The anti-aliasing filter removed the tone at ${n1(f0)} kHz. Nothing comes out, and nothing false either.</div>`
        : `<div class="note err"><span class="note-h">Aliasing</span>
             The tone at ${n1(f0)} kHz returns at ${n1(s.fa)} kHz. Both tones give the same samples.</div>`;
      root.querySelector('.derive').innerHTML = M(
        `<div class="eq"><span class="eq-label">Folding into $[0,\\,f_s/2]$</span>${T(foldTex,true)}</div>` + note);

      root.querySelector('[data-v=f0]').value=f0; root.querySelector('[data-out=f0]').textContent=n1(f0)+' kHz';
      root.querySelector('[data-v=fs]').value=fs; root.querySelector('[data-out=fs]').textContent=n1(fs)+' kHz';
      root.querySelectorAll('[data-seg="aa"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.val===aa)));
    }

    /* the two sounds, drawn by the renderer as a figure that only plays */
    const play = () => RENDER.blocks([{t:'fig', svg:'', listen:{items:[
      {label:'Play the tone', sound:()=>({f:t=>Math.cos(2*PI*1000*f0*t), dur:1.2})},
      {label:'Play the output', sound:()=>{ const s=state();
        return {f:t=> s.removed ? 0 : Math.cos(2*PI*1000*s.fa*t), dur:1.2}; }}]}}]);

    return { mount(root){
      root.innerHTML = M(`
        <div class="cols c-7-5" style="gap:40px">
          <div class="col"><div class="plots" style="display:flex;flex-direction:column;gap:6px"></div></div>
          <div class="col stack">
            <p class="eyebrow"><span class="tick"></span><span class="signame"></span></p>
            <div class="ctrls">
              <div class="ctrl"><label><span>Tone $f_0$</span> <span class="val" data-out="f0">5 kHz</span></label>
                <input type="range" data-v="f0" min="0.2" max="12" step="0.1" value="5"></div>
              <div class="ctrl"><label><span>Rate $f_s$</span> <span class="val" data-out="fs">8 kHz</span></label>
                <input type="range" data-v="fs" min="2" max="12" step="0.5" value="8"></div>
              <div class="ctrl j4-aa"><label><span>Anti-aliasing filter</span> <span class="seg">
                <button data-seg="aa" data-val="off">off</button>
                <button data-seg="aa" data-val="on">on</button></span></label></div>
              <div class="ctrl j4-play">${play()}</div>
            </div>
            <dl class="readout ro"></dl>
            <div class="derive stack"></div>
          </div></div>`);
      root.addEventListener('input', e=>{ const k=e.target.dataset.v; if(!k) return;
        const v=parseFloat(e.target.value);
        if(k==='f0') f0=Math.round(v*10)/10; else if(k==='fs') fs=Math.round(v*2)/2;
        draw(root); });
      root.addEventListener('click', e=>{ const b=e.target.closest('[data-seg="aa"]'); if(!b) return;
        aa=b.dataset.val; draw(root); RENDER.fit(); });
      draw(root);
    }};
  })();

  return { J4 };
})());
