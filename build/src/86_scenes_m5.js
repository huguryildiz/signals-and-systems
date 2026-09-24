/* ==========================================================================
   Module 5 — Continuous-Time Fourier Transform  [Source: 42–63]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const PI = Math.PI;

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
/* the convention of this module: sinc(theta) = sin(theta)/theta */
const sincU = x => Math.abs(x)<1e-9 ? 1 : Math.sin(x)/x;
/* the aperiodic rectangular pulse: 1 on |t| < T1 */
const rectp = (t,T1)=> Math.abs(t)<T1 ? 1 : 0;
/* its periodic extension of period T */
const rectPer = (t,T,T1)=>{ const u = t - T*Math.round(t/T); return Math.abs(u)<T1 ? 1 : 0; };
/* the transform of that pulse, and its value at the origin */
const rectFT = (w,T1)=> 2*T1*sincU(w*T1);
/* the coefficients of the periodic extension */
const aSq = (k,T,T1)=> k===0 ? 2*T1/T : Math.sin(2*PI*k*T1/T)/(PI*k);
/* the ideal low-pass pair, the other way round */
const lpfTime = (t,W)=> (W/PI)*sincU(W*t);
/* the sine integral Si(x), the integral of sin(u)/u from 0 to x: Simpson's
   rule near the origin, the asymptotic series beyond x = 12 */
const Si = x=>{
  if(x<0) return -Si(-x);
  if(x>12){ const x2=x*x;
    return PI/2-Math.cos(x)/x*(1-2/x2+24/(x2*x2))-Math.sin(x)/x2*(1-6/x2+120/(x2*x2)); }
  const n=80, h=x/n; let s=1+sincU(x);
  for(let i=1;i<n;i++) s+=(i%2?4:2)*sincU(i*h);
  return s*h/3; };

const cl = u=>Math.max(0,Math.min(1,u));
/* a group drawn at an opacity: the faint given signal on a sketch slide, or a
   state fading in or out while a figure plays between frames */
const fade=(a,o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
/* the invisible data area a sketch is drawn in */
const skArea=a=>a.raw(`<rect class="sk-area" x="${a.x0}" y="${a.y1}" width="${a.x1-a.x0}" height="${a.y0-a.y1}" fill="none"/>`);
/* the standard slide axes: one figure in the left column of a 5:7 slide */
/* Most figures here are spectra drawn about the origin, where the tick numbers
   would sit on the central peak, so the numbers stand at the left edge. */
const AX = o => P.Axes(Object.assign({w:560,h:380,pad:{l:52,r:24,t:20,b:34},xtarget:7,ytarget:3,yticksLeft:true}, o));

/* ---- everyday signals, one gallery slide at the end of each teaching
       section. The traces are schematic; each keeps the feature its section
       is about. A figure with two traces carries its legend as a third entry. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
function realGallery(cfg){
  return { id:cfg.id, module:'M5', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday signals; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,lg,at])=>
        [{t:'fig', frame:true, svg, caption:cap}].concat(lg?[Object.assign({t:'legend', items:lg}, at?{at}:{})]:[]))}
    ], right:cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n)}
  ]};
}
/* a laboratory scene: the title, then the laboratory itself */
function labScene(cfg){
  return { id:cfg.id, module:'M5', nav:'Laboratory {lab} · '+cfg.nav, title:'Laboratory {lab} — '+cfg.title, src:cfg.src,
    objective:cfg.objective, slide:true, keywords:cfg.keywords, steps:0, blocks:[
    {t:'eyebrow', text:'Interactive laboratory', src:cfg.src},
    {t:'title', text:'Laboratory {lab} · '+cfg.nav},
    {t:'lab', id:cfg.lab}
  ]};
}
/* a code page: the programs of one section, paged one at a time */
function codeScene(cfg){
  return { id:cfg.id, module:'M5', nav:'Code · '+cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
    {t:'eyebrow', text:'Module 5 · '+cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'raw', html:()=>CODEBANK.page(cfg.id)}
  ]};
}

Object.assign(CONTENT.GLOSS, {
  Xjw:{ s:'X(j\\omega)', d:'Continuous-time Fourier transform of $x(t)$. It is a complex function of the real angular frequency $\\omega$, in rad/s. The letter $X$ is reserved for a signal; $H$ is reserved for a system.', go:'m5-pair' },
  sincf:{ s:'\\operatorname{sinc}(\\theta)', d:'Unnormalised sinc: $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, with $\\operatorname{sinc}(0)=1$ and zeros at $\\theta=\\pm\\pi,\\;\\pm2\\pi,\\;\\ldots$ This course uses no other convention.', go:'m5-rect-sinc' },
  Wband:{ s:'W', d:'Band edge of an ideal low-pass band, in rad/s: the transform is $1$ for $|\\omega|<W$ and $0$ beyond it.', go:'m5-sinc-rect' },
  wc:{ s:'\\omega_c', d:'Carrier angular frequency of an amplitude-modulated signal, in rad/s.', go:'m5-am' }
});

/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints. */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`;
  const st = (x,y,c,base) => ln(`M${x} ${base||40} V${y}`,c,1.8)+dot(x,y,c);
  const tr = (f,c,w,x0,x1) => ln('M'+[...Array(Math.round((x1||90)-(x0||2))+1)].map((_,i)=>{ const x=(x0||2)+i; return x+','+f(x).toFixed(1); }).join('L'),c,w||1.8);
  const imp = (x,y,c) => ln(`M${x} 40 V${y}`,c,1.8)+`<path d="M${x} ${y-2} l-3,6 h6 Z" fill="${c}"/>`;
  const box = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  const sc = u => Math.abs(u)<1e-6 ? 1 : Math.sin(u)/u;
  return {
    limit:  sv(ln('M1 40 H91',AX,1)+tr(x=>40-30*sc((x-46)/5),VI,1.2)+[-6,-4,-2,0,2,4,6].map(k=>st(46+k*6,40-30*sc(k*6/5),CY)).join('')),
    pair:   sv(ln('M1 30 H40 M52 30 H91',AX,1)+ln('M6 30 H14 V10 H30 V30 H38',CY,1.8)+tr(x=>30-18*sc((x-71)/3),GR,1.8,52,90)),
    exist:  sv(ln('M1 40 H91',AX,1)+tr(x=>40-30*Math.exp(-Math.abs(x-46)/8),RD,1.8)),
    sinc:   sv(ln('M1 30 H91',AX,1)+tr(x=>30-24*sc((x-46)/4),AM,1.8)),
    inverse:sv(ln('M1 40 H40 M52 40 H91',AX,1)+ln('M6 40 H18 V6 H26 V40 H38',CY,1.8)+tr(x=>40-12*Math.abs(sc((x-71)/9)),GR,1.8,52,90)),
    lines:  sv(ln('M1 40 H91',AX,1)+[-4,-3,-2,-1,0,1,2,3,4].map(k=>imp(46+k*10,40-(k===0?30:Math.abs(40*Math.sin(Math.PI*k/2)/(Math.PI*k))+4),k===0?AM:CY)).join('')),
    shift:  sv(ln('M1 22 H91 M46 4 V42',AX,1)+ln('M8 6 L84 38',VI,1.8)),
    conv:   sv(ln('M2 22 H24 M54 22 H70',AX,1.3)+box(24,12,30,20,AM)+tr(x=>22-8*Math.sin(x/2),CY,1.2,2,22)+tr(x=>22-4*Math.sin(x/5),GR,1.6,72,90)),
    energy: sv(ln('M1 40 H91',AX,1)+`<path d="M2 40 ${[...Array(89)].map((_,i)=>'L'+(2+i)+' '+(40-30/(1+Math.pow((i-44)/8,2))).toFixed(1)).join(' ')} L90 40 Z" fill="${AM}" fill-opacity=".35"/>`
               +tr(x=>40-30/(1+Math.pow((x-46)/8,2)),AM,1.6)),
    ode:    sv(ln('M1 40 H91',AX,1)+tr(x=>{ const t=(x-6)/12; return x<6?40:40-80*t*Math.exp(-t)/2.1; },GR,1.8)),
    clap:   sv(ln('M1 22 H91',AX,1)+tr(x=>{ const t=x-10; return t<0?22:22-16*Math.exp(-t/8)*Math.sin(t*1.4); },CY,1.4)),
    radio:  sv(tr(x=>22-12*(1+0.5*Math.cos(x/10)),AX,1)+tr(x=>22-12*(1+0.5*Math.cos(x/10))*Math.cos(x*1.3)/1.5,GR,1.3)),
    echo:   sv(ln('M1 40 H91',AX,1)+imp(20,8,CY)+imp(60,24,VI)),
    rc:     sv(ln('M1 40 H91',AX,1)+ln('M4 40 H14 V8 H90',AX,1.2)+tr(x=>x<14?40:40-32*(1-Math.exp(-(x-14)/12)),GR,1.8))
  };
})();

const SC = [

{ id:'m5-open', module:'M5', nav:'Module 5 opening', title:'Continuous-Time Fourier Transform', src:'pp. 42–63',
  dark:true, keywords:'module 5 fourier transform aperiodic CTFT overview envelope spectrum', steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Continuous-Time Fourier Transform', src:'pp. 42–63'},
  {t:'title', level:1, text:'The Continuous-Time Fourier Transform'},
  {t:'lede', text:'The Fourier transform describes a signal that does not repeat by a continuous function of frequency. Repeat the signal with a period, and let the period grow. The harmonics crowd together, and the Fourier-series coefficients close onto one curve: the transform.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t', label:'Analysis'},
    {t:'eq', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega', label:'Synthesis'},
    {t:'note', kind:'ok', head:'Purpose of the transform', html:'<span style="color:var(--graphite)">Convolution in time becomes multiplication in frequency, for every signal with a transform. The frequency response still says what an LTI system does to each frequency.</span>'}
  ], right:[
    /* One envelope, sampled ever more finely as the period grows: T = 4, 8
       and 24. The canvas is narrower than the column, so the traces read at
       back-row size on the navy page. */
    {t:'fig', svg:()=>{
      const a=P.Axes({w:520,h:330,xr:[-9,9],yr:[-0.6,7.2],grid:false,zeroAxes:false,arrows:false,
        pad:{l:14,r:14,t:14,b:14},xticksOverride:[],yticksOverride:[]});
      a.curve(w=>rectFT(w,1)*0.55+5.4,{color:'#7FC3CE',width:2.4,n:1600,anim:{delay:0,sweep:'#D9F3F7'}});
      [[4,'#AC99DC',3.4,.5,.07],[8,'#E5B255',1.6,.9,.035]].forEach(([T,col,base,dl,sp])=>{
        const st=[]; const w0=2*PI/T;
        for(let k=-Math.floor(9/w0);k<=Math.floor(9/w0);k++) st.push([k*w0, 2*PI*aSq(k,T,1)*0.55]);
        a.curve(w=>rectFT(w,1)*0.55+base,{color:col,width:1.1,dash:'3 5',opacity:.5,n:1200});
        a.stem(st.map(([x,y])=>[x,y+base]),{color:col,r:3.2,width:1.7,showZero:true,anim:{delay:dl,step:sp,tip:true}});
      });
      const stf=[]; const w0f=2*PI/24;
      for(let k=-Math.floor(9/w0f);k<=Math.floor(9/w0f);k++) stf.push([k*w0f, 2*PI*aSq(k,24,1)*0.55]);
      a.stem(stf,{color:'#8FBF8A',r:1.8,width:1.1,showZero:true,anim:{delay:1.3,step:.015,tip:true}});
      a.curve(w=>rectFT(w,1)*0.55,{color:'#8FBF8A',width:2.2,n:1600,anim:{delay:1.8,sweep:'#E4F4E1'}});
      return a.svg(); }}
  ]}
]},

/* ======================================================= 5.1 from series to transform */

{ id:'m5-derive-1', module:'M5', nav:'Periodic extension', title:'Periodic Extension of a Pulse', src:'pp. 42–43',
  objective:'Build the periodic extension of a pulse and state the condition the construction needs.',
  keywords:'aperiodic periodic extension support T > 2T1 limit period grows derivation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'pp. 42–43'},
  {t:'title', text:'Periodic Extension of a Pulse'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: one pulse','$\\tilde{x}(t)$ with $T=5T_1$','$\\tilde{x}(t)$ with $T=14T_1$']},
      svg:v=>{
      /* frame 0 is the pulse; frame 1 brings in the copies at T = 5, frame 2
         moves them out to T = 14 */
      const f=v?v.frame:0;
      const a=AX({xr:[-16,16],yr:[-0.3,1.75],xlabel:'t',ylabel:'\\tilde{x}(t)',yticksOverride:[0,1],xtarget:9});
      a.curve(t=>rectp(t,1),{color:C.in,n:3000});
      const near=cl(f)*(1-cl(f-1)), far=cl(f-1);
      fade(a,near,()=>{ a.curve(t=>Math.abs(t)>2?rectPer(t,5,1):NaN,{color:C.mid,n:3000});
        a.span(0,5,1.42,'T=5T_1',{color:C.coral,tex:true,fs:15}); });
      fade(a,far,()=>{ a.curve(t=>Math.abs(t)>2?rectPer(t,14,1):NaN,{color:C.mid,n:3000});
        a.span(0,14,1.42,'T=14T_1',{color:C.coral,tex:true,fs:15}); });
      a.span(-1,1,1.12,'2T_1',{color:C.coral,tex:true,fs:15});
      return a.svg(); },
      caption:'The pulse is $1$ on $|t|<T_1$, with $T_1=1$. Its copies repeat it every $T$ seconds. Inside $|t|<T_1$ the two signals agree.'}
  ], right:[
    {t:'eq', tex:'\\tilde{x}(t)=\\sum_{m=-\\infty}^{\\infty}x(t-mT),\\qquad \\tilde{x}(t+T)=\\tilde{x}(t)', label:'Periodic extension',
      note:'The extension is periodic, so the Fourier series of Module 4 applies to it.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Required condition', html:'The copies must not overlap, so $T>2T_1$. The signal fixes $T_1$. Only the period $T$ is ours to choose.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The limit', html:'Let $T$ grow with the central pulse fixed. The copies move out, and $\\tilde{x}(t)\\to x(t)$ at every $t$ as $T\\to\\infty$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A pulse with $T_1=2$ s is repeated every $T$ seconds.<div class="nsep"></div>Which period keeps the copies apart?',
        ask:{key:'m5-derive-1', choices:['$T=2$ s','$T=3$ s','$T=6$ s'], answer:2,
          why:'The copies stay apart only for $T>2T_1=4$ s.'}}]}
  ]}
]},

{ id:'m5-derive-2', module:'M5', nav:'Coefficients as samples', title:'Coefficients as Samples of One Curve', src:'p. 43',
  objective:'Show that T·a_k is one function of ω, sampled at multiples of ω₀.',
  keywords:'envelope samples T a_k spacing omega_0 derivation coefficients curve', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'p. 43'},
  {t:'title', text:'Coefficients as Samples of One Curve'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T/T_1$', min:3, max:24, step:1, v:4, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const T=v?v.T:4, w0=2*PI/T, st=[];
      const a=AX({xr:[-10,10],yr:[-0.9,2.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'Ta_k',yticksOverride:[0,1,2]});
      a.curve(w=>rectFT(w,1),{color:C.mid,width:1.8,dash:'7 6',n:1400});
      for(let k=-Math.floor(10/w0);k<=Math.floor(10/w0);k++) st.push([k*w0, T*aSq(k,T,1)]);
      a.stem(st,{color:C.in,r:T>12?2.6:3.6,showZero:true});
      return a.svg(); },
      caption:'The stems are $Ta_k$ for the pulse train with $T_1=1$. Move $T$: the stems crowd together on one curve.'},
    {t:'legend', items:[['in','$Ta_k$'],['mid','$X(j\\omega)$',true]]}
  ], right:[
    {t:'eq', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\tilde{x}(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\int_{-\\infty}^{\\infty}x(t)\\,e^{-jk\\omega_0t}\\,\\d t',
      note:'Inside one period $\\tilde{x}=x$, and $x=0$ outside $|t|<T_1$. So the limits open to all of time.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t', label:'Replace $k\\omega_0$ by $\\omega$',
        note:'{{sym:Xjw|$X(j\\omega)$}} is defined for every real $\\omega$, not only at the harmonics.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'T\\,a_k=X(jk\\omega_0),\\qquad \\omega_0=\\frac{2\\pi}{T}', label:'The coefficients are samples',
        note:'The curve $X$ does not depend on $T$. A larger $T$ only makes the spacing $\\omega_0$ smaller.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The pulse train has $T_1=1$ and period $T=8$.<div class="nsep"></div>What is $8a_0$?',
        ask:{key:'m5-derive-2', choices:['$2$','$0.25$','$16$'], answer:0,
          why:'$8a_0=X(j0)=2T_1=2$, the same at every period.'}}]}
  ]}
]},

{ id:'m5-derive-3', module:'M5', nav:'The sum becomes an integral', title:'From a Sum to an Integral', src:'pp. 43–44',
  objective:'Carry the synthesis sum to the limit and produce the 1/2π explicitly.',
  keywords:'limit sum integral d omega 2 pi factor synthesis riemann derivation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'pp. 43–44'},
  {t:'title', text:'From a Sum to an Integral'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T', label:'$T/T_1$', min:3, max:24, step:1, v:6, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const T=v?v.T:6, w0=2*PI/T;
      const a=AX({xr:[-9,9],yr:[-0.85,2.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[0,1,2]});
      for(let k=-Math.floor(9/w0);k<=Math.floor(9/w0);k++){
        const wv=k*w0, hv=rectFT(wv,1);
        a.rect(wv-w0/2,0,wv+w0/2,hv,{fill:C.in+'2E',stroke:C.in,width:1});
      }
      a.curve(w=>rectFT(w,1),{color:C.mid,width:2.4,n:1400});
      return a.svg(); },
      caption:'Each strip has height $X(jk\\omega_0)$ and width $\\omega_0$. Move $T$: as the width shrinks, the strips fill the area under the curve.'},
    {t:'legend', items:[['in','$X(jk\\omega_0)\\,\\omega_0$'],['mid','$X(j\\omega)$']]}
  ], right:[
    {t:'eq', tex:'\\tilde{x}(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0t}=\\sum_{k=-\\infty}^{\\infty}\\frac{1}{T}\\,X(jk\\omega_0)\\,e^{jk\\omega_0t}',
      note:'Put $a_k=\\tfrac{1}{T}X(jk\\omega_0)$ into the synthesis equation of Module 4.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\tilde{x}(t)=\\frac{1}{2\\pi}\\sum_{k=-\\infty}^{\\infty}X(jk\\omega_0)\\,e^{jk\\omega_0t}\\,\\omega_0', label:'Write $1/T=\\omega_0/2\\pi$',
        note:'This is exact. Each term now carries the width $\\omega_0$, so the sum is a Riemann sum.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega', label:'Let $T\\to\\infty$: the synthesis equation',
        note:'$\\tilde{x}\\to x$, the width $\\omega_0$ becomes $\\d\\omega$, and the sum becomes an integral. The $1/2\\pi$ came from $1/T=\\omega_0/2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A student drops the $1/2\\pi$ from the synthesis equation.<div class="nsep"></div>The rebuilt signal comes out how large?',
        ask:{key:'m5-derive-3', choices:['$2\\pi$ times too large','$2\\pi$ times too small','correct'], answer:0,
          why:'Without the factor, every value of $x(t)$ is multiplied by $2\\pi$.'}}]}
  ]}
]},

{ id:'m5-pair', module:'M5', nav:'Analysis and synthesis', title:'The Fourier Transform Pair', src:'p. 44',
  objective:'Name both equations correctly and state what each one does.',
  keywords:'analysis synthesis equation pair forward inverse transform direction naming', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'p. 44'},
  {t:'title', text:'The Fourier Transform Pair'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'box',x:24,y:70,w:176,h:74,label:'x(t)',tex:true,fs:22,color:C.in},
      {t:'box',x:360,y:70,w:176,h:74,label:'X(j\\omega)',tex:true,fs:22,color:C.mid},
      {t:'arrow',x1:200,y1:92,x2:360,y2:92,label:'\\text{analysis}',tex:true,color:C.coral},
      {t:'line',d:'M360,124 L210,124',color:C.slate},
      {t:'line',d:'M200,124 l10,-5 v10 Z',color:C.slate},
      {t:'text',x:280,y:160,label:'\\text{synthesis}',tex:true,fs:17,color:C.slate},
      {t:'text',x:280,y:250,label:'\\text{integrate over }t\\;\\Rightarrow\\;\\text{a function of }\\omega',tex:true,fs:17,color:C.coral},
      {t:'text',x:280,y:310,label:'\\text{integrate over }\\omega\\;\\Rightarrow\\;\\text{a function of }t',tex:true,fs:17,color:C.slate}
    ]}), caption:'The pair is written $x(t)\\leftrightarrow X(j\\omega)$. Each equation removes the variable it integrates over.'}
  ], right:[
    {t:'eq', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t', label:'Analysis · the Fourier transform',
      note:'A signal goes in and a spectrum comes out. The exponent carries the minus sign.'},
    {t:'eq', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega', label:'Synthesis · the inverse transform',
      note:'A spectrum goes in and a signal comes out. The exponent is positive, and the $1/2\\pi$ sits here.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Case of the letters', html:'The small letter names the signal and takes $t$. The capital letter names its spectrum and takes $j\\omega$. $X$ is a signal spectrum; $H$ is a system response.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'A student writes $x(t)=\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{-j\\omega t}\\,\\d\\omega$.<div class="nsep"></div>How many errors does the line contain?',
        ask:{key:'m5-pair', choices:['none','one','two'], answer:2,
          why:'The factor $1/2\\pi$ is missing, and the exponent must be $+j\\omega t$.'}}]}
  ]}
]},

{ id:'m5-exist', module:'M5', nav:'Existence conditions', title:'Existence of the Transform', src:'p. 44',
  objective:'State the two existence conditions separately and show that neither implies the other.',
  keywords:'existence square integrable dirichlet absolutely integrable sufficient necessary conditions', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'p. 44'},
  {t:'title', text:'Existence of the Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\sin t/t$: finite energy, infinite area','$1/\\sqrt{t}$ on $0<t<1$: finite area, infinite energy']},
      svg:v=>{
      /* the two counterexamples, one on each frame, cross-faded */
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-22,22],yr:[-0.4,1.3],xlabel:'t',ylabel:'x(t)',xtarget:9});
        fade(a,1-2*f,()=>a.curve(t=>sincU(t),{color:C.in,n:3000}));
        return a.svg();
      }
      const a=AX({xr:[-0.3,1.5],yr:[-0.8,7.5],xlabel:'t',ylabel:'x(t)',xtarget:6,ytarget:4});
      fade(a,2*f-1,()=>{ a.area(t=>(t>0.018&&t<1)?1/Math.sqrt(t):0,0.018,1,{color:C.err+'24'});
        a.curve(t=>(t>0.018&&t<1)?1/Math.sqrt(t):(t<=0||t>=1?0:NaN),{color:C.err,n:3000}); });
      return a.svg(); },
      caption:'$\\sin t/t$ decays like $1/|t|$: its square is integrable and its modulus is not. $1/\\sqrt{t}$ has area $2$, but its square $1/t$ has no finite area.'}
  ], right:[
    {t:'note', kind:'def', head:'Condition A · finite energy', html:'If $\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t<\\infty$, then $X(j\\omega)$ exists.'},
    {t:'note', kind:'def', head:'Condition B · Dirichlet', html:'If $\\int_{-\\infty}^{\\infty}|x(t)|\\,\\d t<\\infty$, and $x$ has finitely many extrema and finite jumps in every finite interval, then $X(j\\omega)$ exists.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Joined by “or”', html:'Each condition is enough on its own, and neither implies the other. The figure shows one signal for each case.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-2t}u(t)$.<div class="nsep"></div>Which conditions does it meet?',
        ask:{key:'m5-exist', choices:['A only','B only','both'], answer:2,
          why:'Its area is $1/2$ and its energy is $1/4$. Both are finite.'}}]}
  ]}
]},

{ id:'m5-gibbs', module:'M5', nav:'Convergence at a jump', title:'Convergence at a Jump', src:'p. 44',
  objective:'Show what the synthesis integral gives at a jump when it is cut off at a band edge W.',
  keywords:'gibbs phenomenon convergence jump discontinuity midpoint overshoot 1.09 truncated synthesis integral ripples energy of the error', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'p. 44'},
  {t:'title', text:'Convergence at a Jump'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'W', label:'$W$', min:4, max:60, step:1, v:12, show:v=>'$'+v+'$ rad/s'}]},
      svg:v=>{
      const W=v?v.W:12;
      const a=AX({xr:[-2.5,2.5],yr:[-0.3,1.45],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.5,1],xtarget:6});
      a.hline(1.0895,{color:C.coral});
      a.note(-2.4,1.0895,'1.09',{tex:true,fs:15,color:C.coral,dy:-12});
      a.curve(t=>rectp(t,1),{color:C.in,dash:'9 6',n:2400});
      a.curve(t=>(Si(W*(t+1))-Si(W*(t-1)))/PI,{color:C.out,n:3000});
      return a.svg(); },
      caption:'Raise $W$: the ripples crowd toward the jumps at $t=\\pm1$, and the first peak settles near $1.09$.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x_W(t)$']]}
  ], right:[
    {t:'eq', tex:'x_W(t)=\\frac{1}{2\\pi}\\int_{-W}^{W}\\frac{2\\sin\\omega}{\\omega}\\,e^{j\\omega t}\\,\\d\\omega', label:'Cut the synthesis integral',
      note:'$x(t)=1$ for $|t|<1$ and $0$ elsewhere, so $X(j\\omega)=2\\sin\\omega/\\omega$. Only the band $|\\omega|<W$ is kept.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'What converges', html:'As $W\\to\\infty$, $x_W(t)\\to x(t)$ at every $t$ except $t=\\pm1$. At a jump it tends to $\\tfrac12$, the midpoint of the jump. The energy of the error $x-x_W$ tends to $0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The overshoot does not shrink', html:'Near each jump, the first peak tends to about $1.09$ as $W$ grows. A larger $W$ only moves the peak closer to the jump, about $\\pi/W$ away. Partial sums of a Fourier series behave the same way.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The band edge is raised from $W=20$ to $W=200$ rad/s.<div class="nsep"></div>What is the highest value of $x_W(t)$ now?',
        ask:{key:'m5-gibbs', choices:['about $1.09$','about $1.009$','exactly $1$'], answer:0,
          why:'For large $W$ the peak height tends to about $1.09$; only its distance from the jump shrinks.'}}]}
  ]}
]},

{ id:'m5-limit', module:'M5', nav:'Transforms that are impulses', title:'Transforms in the Limit', src:'pp. 44–45',
  objective:'Explain in what sense a constant or a periodic signal has a transform.',
  keywords:'limiting sense impulse spectrum constant periodic complex exponential generalised', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · From series to transform', src:'pp. 44–45'},
  {t:'title', text:'Transforms in the Limit'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.1, max:1.5, step:0.05, v:1, show:v=>'$'+(Math.round(v*100)/100)+'$'}]},
      svg:v=>{
      const av=v?v.a:1;
      const a=AX({xr:[-6,6],yr:[-1.5,21],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'X(j\\omega)',yticksOverride:[0,5,10,15,20]});
      a.area(w=>2*av/(av*av+w*w),-6,6,{color:C.in+'24',n:900});
      a.curve(w=>2*av/(av*av+w*w),{color:C.in,n:2400});
      return a.svg(); },
      caption:'The transform of $e^{-a|t|}$ is $2a/(a^{2}+\\omega^{2})$. Lower $a$: the curve grows tall and narrow, and its area stays $2\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Neither condition holds', html:'A constant, a complex exponential and a periodic signal have infinite energy and infinite area. Each one still has a spectrum.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'e^{-a|t|}\\;\\longleftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}}\\quad\\xrightarrow{\\;a\\to0\\;}\\quad 1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)', label:'Take a limit',
        note:'The signal flattens to the constant $1$. The curve keeps area $2\\pi$ while it narrows, so its limit is an impulse of weight $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Exists in the limiting sense', html:'This transform is an impulse. Like $\\delta(t)$, it is defined by what it does inside an integral. Every property of this module still applies to it.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=2a/(a^{2}+\\omega^{2})$ with $a=0.5$.<div class="nsep"></div>What is the peak $X(j0)$?',
        ask:{key:'m5-limit', choices:['$4$','$2$','$1$'], answer:0,
          why:'$X(j0)=2a/a^{2}=2/a=4$.'}}]}
  ]}
]},

realGallery({ id:'m5-real-transform', nav:'Single events around us',
  title:'Single Events Around Us', eyebrow:'Module 5 · From series to transform', src:'pp. 42–45',
  objective:'See everyday signals that happen once and never repeat.',
  keywords:'examples camera flash hand clap storm rainfall single event aperiodic finite energy continuous spectrum',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-2,2],yr:[-0.2,1.3],xlabel:'t\\;(\\text{ms})',ylabel:'I(t)\\;(\\text{kcd})',yticksOverride:[0,1],yticksLeft:true}));
      a.curve(t=>Math.abs(t)<0.5?1:0,{color:C.in,n:2400});
      return a.svg(); }, 'A camera flash, one light pulse: $I(t)=1$ kcd for $|t|<0.5$ ms.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,20],yr:[-1.1,1.1],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)\\;(\\text{Pa})',xstep:5}));
      a.curve(t=>t<0?0:Math.exp(-t/4)*Math.sin(2*PI*0.4*t),{color:C.in,n:2400});
      return a.svg(); }, 'A hand clap: $p(t)=e^{-t/4}\\sin(2\\pi\\,0.4\\,t)\\,u(t)$ Pa, $t$ in ms.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,12],yr:[0,34],xlabel:'n\\;(\\text{day})',ylabel:'r[n]\\;(\\text{mm})',xstep:2}));
      a.stem(D(n=>30*Math.pow(0.5,n),0,11),{color:C.in,r:3});
      return a.svg(); }, 'Rain from one storm: $r[n]=30(0.5)^{n}u[n]$ mm on day $n$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,25],yr:[0,1100],xlabel:'n\\;(\\text{h})',ylabel:'v[n]',xstep:6}));
      a.stem(D(n=>(n>=8&&n<=16)?1000-250*Math.abs(n-12):0,0,24),{color:C.in,r:3});
      return a.svg(); }, 'Visitors each hour at a one-day fair: $v[n]=1000-250|n-12|$ for $8\\le n\\le16$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'It happens once', html:'None of these signals repeats. Each has finite energy, and its spectrum is a continuous function of frequency, not a set of lines.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'A signal that happens once is the limit of a pulse train whose period grows. So the Fourier series of Module 4 still describes it, with the line spacing gone to zero.'}
  ]}),

labScene({ id:'m5-lab-u', lab:'U', nav:'Series to Transform', title:'From Line Spectrum to Transform', src:'pp. 42–44',
  objective:'Let the period of a pulse train grow and watch the scaled coefficients close onto the transform.',
  keywords:'laboratory period grows coefficients samples envelope transform limit riemann sum synthesis' }),

codeScene({ id:'m5-code-transform', nav:'Series to transform', title:'The Transform in Code', src:'pp. 42–45', eyebrow:'From series to transform in code',
  objective:'Build the transform as the limit of a series in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python fourier transform limit coefficients samples analysis integral numerical run' }),


/* ======================================================= 5.2 the standard pairs */

{ id:'m5-ex-delta', module:'M5', nav:'Worked example · the impulse', title:'Transform of an Impulse', src:'p. 44',
  objective:'Transform δ(t) and δ(t−t₀) and read the magnitude and phase.',
  keywords:'worked example impulse delta sifting flat spectrum linear phase shift', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 44'},
  {t:'title', text:'Transform of an Impulse'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\delta(t)$: phase $0$','$\\delta(t-t_0)$: phase $-\\omega t_0$']},
      svg:v=>{
      /* the phase line turns from slope 0 to slope -t0 = -1 */
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-3,3],yr:[-3.6,3.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/4,ylabel:'\\angle X(j\\omega)\\;(\\text{rad})',yticksOverride:[-3,-2,-1,1,2,3]});
      a.curve(w=>-f*w,{color:C.mid,n:600});
      return a.svg(); },
      caption:'The phase of the transform, with $t_0=1$ s. The magnitude is $1$ at every frequency in both cases.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\delta(t)$, and then $x(t)=\\delta(t-t_0)$ with $t_0$ a fixed time.<div class="nsep"></div>What is $|X(j\\omega)|$ for the shifted impulse?',
      ask:{key:'m5-ex-delta', choices:['$1$','$t_0$','$e^{-t_0}$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Put the signal into the analysis equation.</li><li>Use the sifting property of Module 1.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}\\mathcal{F}\\{\\delta(t)\\}&=\\int_{-\\infty}^{\\infty}\\delta(t)\\,e^{-j\\omega t}\\,\\d t=e^{-j\\omega\\cdot0}=1\\\\\\mathcal{F}\\{\\delta(t-t_0)\\}&=e^{-j\\omega t_0}\\end{aligned}', label:'Solution',
        note:'Sifting evaluates $e^{-j\\omega t}$ at the impulse. $|e^{-j\\omega t_0}|=1$, and the phase is $-\\omega t_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What a shift does', html:'Moving a signal in time changes no magnitude. It turns each frequency component by an angle proportional to its frequency.'}]}
  ]}
]},

{ id:'m5-ex-expw', module:'M5', nav:'Worked example · a single frequency', title:'Transform of a Complex Exponential', src:'p. 45',
  objective:'Invert 2πδ(ω−ω₀) and show why the 2π is part of the answer.',
  keywords:'worked example inverse transform impulse in frequency complex exponential 2 pi weight', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'Transform of a Complex Exponential'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-3,3],yr:[-0.5,8.2],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/4,ylabel:'X(j\\omega)',yticksOverride:[0,2,4,6]});
      a.impulse(1,2*PI,{color:C.in,labelText:'6.28'});
      return a.svg(); },
      caption:'One impulse at $\\omega_0=1$ rad/s, of weight $2\\pi$. The spectrum is zero at every other frequency.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=2\\pi\\,\\delta(\\omega-\\omega_0)$.<div class="nsep"></div>What is $|x(t)|$?',
      ask:{key:'m5-ex-expw', choices:['$1$','$2\\pi$','$1/2\\pi$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Put the spectrum into the synthesis equation.</li><li>Sift, this time in the variable $\\omega$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega t}\\,\\d\\omega=e^{j\\omega_0t}', label:'Solution',
        note:'The $2\\pi$ of the weight cancels the $1/2\\pi$ of synthesis. So $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$, and at $\\omega_0=0$, $1\\leftrightarrow2\\pi\\delta(\\omega)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'An impulse of weight 1', html:'$X(j\\omega)=\\delta(\\omega-\\omega_0)$ gives $\\tfrac{1}{2\\pi}e^{j\\omega_0t}$, not a unit exponential. The factor sets the amplitude.'}]}
  ]}
]},

{ id:'m5-ex-exp', module:'M5', nav:'Worked example · one-sided exponential', title:'One-Sided Exponential Transform', src:'p. 45',
  objective:'Transform the decaying exponential and state where a > 0 is needed.',
  keywords:'worked example one-sided exponential decay 1/(a+jw) convergence condition', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'One-Sided Exponential Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.2, max:5, step:0.1, v:1, show:v=>'$'+(Math.round(v*10)/10)+'$'}]},
      svg:v=>{
      const av=v?v.a:1;
      const a=AX({xr:[-1,8],yr:[-0.15,1.3],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',yticksOverride:[0,0.5,1]});
      a.curve(t=>t<0?0:Math.exp(-av*t),{color:C.in,n:2400});
      return a.svg(); },
      caption:'The signal $e^{-at}u(t)$. It starts at $1$ and decays faster for a larger $a$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-at}u(t)$, with $a$ a real constant.<div class="nsep"></div>For which $a$ does $X(j\\omega)$ exist?',
      ask:{key:'m5-ex-exp', choices:['$a>0$','$a\\ge0$','every $a$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>The step makes $x=0$ for $t<0$, so integrate from $0$ to $\\infty$.</li><li>Evaluate the antiderivative at both limits.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'X(j\\omega)=\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\,\\d t=\\left[\\frac{-e^{-(a+j\\omega)t}}{a+j\\omega}\\right]_{0}^{\\infty}=0-\\frac{-1}{a+j\\omega}', label:'The integral',
        note:'$|e^{-j\\omega t}|=1$, so the upper limit is decided by $e^{-at}$. It tends to $0$ only when $a>0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega},\\qquad a>0', label:'Solution',
        note:'For $a\\le0$ the integral does not converge. State $a>0$ with the result every time.'}]}
  ]}
]},

{ id:'m5-ex-exp-b', module:'M5', nav:'Exponential · the magnitude', title:'Magnitude of the Exponential Transform', src:'p. 45',
  objective:'Read the magnitude of 1/(a+jω) and check its peak.',
  keywords:'magnitude spectrum 1/sqrt(a^2+w^2) peak 1/a decay rate width', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'Magnitude of the Exponential Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.2, max:5, step:0.1, v:1, show:v=>'$'+(Math.round(v*10)/10)+'$'}]},
      svg:v=>{
      const av=v?v.a:1;
      const a=AX({xr:[-6,6],yr:[-0.25,5.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'|X(j\\omega)|',yticksOverride:[0,1,2,3,4,5]});
      a.curve(w=>1/Math.hypot(av,w),{color:C.in,n:1600});
      a.point(0,1/av,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'$|X(j\\omega)|$ for $e^{-at}u(t)$. The marked point is the peak $1/a$. Lower $a$ and the curve grows tall and narrow.'}
  ], right:[
    {t:'eq', tex:'|X(j\\omega)|=\\frac{1}{|a+j\\omega|}=\\frac{1}{\\sqrt{a^{2}+\\omega^{2}}}', label:'Magnitude',
      note:'The largest value is at $\\omega=0$, where $|X(j0)|=1/a$. The curve falls to zero as $|\\omega|$ grows.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'For $a=0.2$, $1$ and $5$ the peak $1/a$ is $5$, $1$ and $0.2$. Move the slider to each value and read it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading', html:'A small $a$ decays slowly in time and gives a tall, narrow spectrum. A large $a$ decays fast and gives a low, wide one.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-2t}u(t)$.<div class="nsep"></div>What is $|X(j2)|$?',
        ask:{key:'m5-ex-exp-b', choices:['$1/(2\\sqrt2)$','$1/4$','$1/2$'], answer:0,
          why:'$|X(j2)|=1/\\sqrt{4+4}=1/(2\\sqrt2)\\approx0.354$.'}}]}
  ]}
]},

{ id:'m5-ex-exp-phase', module:'M5', nav:'Exponential · the phase', title:'Phase of the Exponential Transform', src:'p. 45',
  objective:'Derive the phase with its minus sign and check it against the plot.',
  keywords:'phase arctan minus sign angle of a quotient subtraction error worked example', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'Phase of the Exponential Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.2, max:5, step:0.1, v:1, show:v=>'$'+(Math.round(v*10)/10)+'$'}]},
      svg:v=>{
      const av=v?v.a:1;
      const a=AX({xr:[-8,8],yr:[-1.9,1.9],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\angle X(j\\omega)\\;(\\text{rad})',
        yticksOverride:[-1.5708,-0.7854,0.7854,1.5708],ytickfmt:v=>v.toFixed(2)});
      a.curve(w=>-Math.atan(w/av),{color:C.in,n:1600});
      a.point(1,-Math.atan(1/av),{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'The phase of $1/(a+j\\omega)$ falls from $+\\pi/2$ to $-\\pi/2$. A rising curve would be $+\\tan^{-1}(\\omega/a)$, the phase of $a+j\\omega$. The point marks $\\omega=1$.'}
  ], right:[
    {t:'eq', tex:'\\angle X(j\\omega)=\\angle1-\\angle(a+j\\omega)=0-\\tan^{-1}\\!\\left(\\frac{\\omega}{a}\\right)', label:'Angle of a quotient',
      note:'The angle of a quotient is the numerator angle minus the denominator angle. Write both, even when one is zero.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\angle X(j\\omega)=-\\tan^{-1}\\!\\left(\\frac{\\omega}{a}\\right)', label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The lost minus sign', html:'$\\tan^{-1}(\\omega/a)$ alone is the phase of $a+j\\omega$, not of its reciprocal. At $a=1$, $\\omega=1$ the phase is $-\\pi/4$, not $+\\pi/4$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$a=1$ and $\\omega=\\sqrt3$ rad/s.<div class="nsep"></div>What is $\\angle X(j\\omega)$?',
        ask:{key:'m5-ex-exp-phase', choices:['$-\\pi/3$','$+\\pi/3$','$-\\pi/6$'], answer:0,
          why:'$\\tan^{-1}\\sqrt3=\\pi/3$, and the reciprocal takes the minus sign.'}}]}
  ]}
]},

{ id:'m5-ex-twosided', module:'M5', nav:'Worked example · two-sided exponential', title:'Two-Sided Exponential Transform', src:'p. 46',
  objective:'Transform the two-sided exponential and connect evenness to a real transform.',
  keywords:'worked example two-sided exponential even signal real transform 2a/(a^2+w^2)', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 46'},
  {t:'title', text:'Two-Sided Exponential Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-6,6],yr:[-0.3,4.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'X(j\\omega)',yticksOverride:[0,0.4,2,4]});
      [[0.5,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>{
        a.curve(w=>2*av/(av*av+w*w),{color:col,n:2400}); a.point(0,2/av,{color:C.coral,r:4}); });
      return a.svg(); },
      caption:'The transform for $a=0.5$, $1$ and $5$. The marked peaks are $X(j0)=2/a$: $4$, $2$ and $0.4$.'},
    {t:'legend', items:[['in','$a=0.5$'],['mid','$a=1$'],['out','$a=5$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-a|t|}$ with $a>0$.<div class="nsep"></div>Is $X(j\\omega)$ real?',
      ask:{key:'m5-ex-twosided', choices:['yes','no'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Split the integral at $t=0$, where $|t|$ changes formula.</li><li>Integrate each half, then add the two fractions.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'X(j\\omega)=\\int_{-\\infty}^{0}e^{at}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t=\\frac{1}{a-j\\omega}+\\frac{1}{a+j\\omega}', label:'Two halves',
        note:'On the left half $|t|=-t$, so the exponent is $+at$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'e^{-a|t|}\\;\\longleftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}},\\qquad a>0', label:'Solution',
        note:'The imaginary parts cancel. A real, even signal has a real, even transform.'}]}
  ]}
]},

{ id:'m5-rect-sinc', module:'M5', nav:'Rectangular pulse', title:'Rectangular Pulse Transform', src:'pp. 46–47',
  objective:'Transform the rectangular pulse and write the result with the sinc convention of the course.',
  keywords:'rectangular pulse sinc unnormalised convention 2 T1 sin(wT1)/w worked example', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 46–47'},
  {t:'title', text:'Rectangular Pulse Transform'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'T1', label:'$T_1$', min:0.25, max:3, step:0.25, v:1, show:v=>'$'+v+'$ s'}]},
      svg:v=>{
      const T1=v?v.T1:1;
      const a=AX({xr:[-12,12],yr:[-1.6,6.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[-1,0,2,4,6]});
      a.curve(w=>rectFT(w,T1),{color:C.in,n:2400});
      a.point(0,2*T1,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'$X(j\\omega)$ for the pulse of half-width $T_1$. The point marks the peak $2T_1$. The side lobes are negative in turn.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ for $|t|<T_1$ and $0$ otherwise.<div class="nsep"></div>What is $X(j0)$?',
      ask:{key:'m5-rect-sinc', choices:['$2T_1$','$T_1$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Integrate $e^{-j\\omega t}$ from $-T_1$ to $T_1$.</li><li>Use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'X(j\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}', label:'The integral'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'X(j\\omega)=\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)', label:'Solution',
        note:'The $j$ cancels, so the transform is real. Here $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, and $X(j0)=2T_1$ by l’Hôpital.'}]}
  ]}
]},

{ id:'m5-rect-sinc-b', module:'M5', nav:'The sinc convention', title:'The Sinc Convention', src:'pp. 46–47',
  objective:'Fix the unnormalised sinc used in the course and tell it apart from the normalised one.',
  keywords:'sinc convention unnormalised normalised zeros integers multiples of pi argument', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The standard pairs', src:'pp. 46–47'},
  {t:'title', text:'The Sinc Convention'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-10,10],yr:[-0.4,1.3],xlabel:'\\theta',xpi:PI,ylabel:'\\text{value}',yticksOverride:[0,0.5,1]});
      a.curve(th=>sincU(th),{color:C.in,n:2400});
      a.curve(th=>sincU(PI*th),{color:C.mid,dash:'9 6',n:2400});
      return a.svg(); },
      caption:'The two conventions on one axis. The course sinc is zero at $\\theta=\\pm\\pi,\\pm2\\pi,\\dots$; the normalised one is zero at the non-zero integers.'},
    {t:'legend', items:[['in','$\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$'],['mid','$\\sin(\\pi\\theta)/(\\pi\\theta)$',true]]}
  ], right:[
    {t:'note', kind:'def', head:'This course', html:'$\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, the <b>unnormalised</b> sinc, with $\\operatorname{sinc}(0)=1$. The pulse pair reads $2T_1\\operatorname{sinc}(\\omega T_1)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The other convention', html:'Software and many texts use $\\sin(\\pi\\theta)/(\\pi\\theta)$. The same pair there is written with the argument $\\omega T_1/\\pi$. Never copy an argument between the two.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$X(j0)=2T_1$. For $T_1=1$, $5$ and $10$ the peak is $2$, $10$ and $20$, in either convention.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The normalised sinc, $\\sin(\\pi\\theta)/(\\pi\\theta)$.<div class="nsep"></div>Where is its first positive zero?',
        ask:{key:'m5-rect-sinc-b', choices:['$\\theta=1$','$\\theta=\\pi$','$\\theta=1/\\pi$'], answer:0,
          why:'$\\sin(\\pi\\theta)$ first vanishes at $\\pi\\theta=\\pi$, that is $\\theta=1$.'}}]}
  ]}
]},

{ id:'m5-rect-zeros', module:'M5', nav:'Zeros of the sinc spectrum', title:'Zeros of the Sinc Spectrum', src:'pp. 46–47',
  objective:'State the zero set with the origin excluded and justify the exclusion.',
  keywords:'zero crossings k pi over T1 exclude origin lHopital main lobe side lobe', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The standard pairs', src:'pp. 46–47'},
  {t:'title', text:'Zeros of the Sinc Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-13,13],yr:[-0.75,2.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[0,1,2]});
      a.curve(w=>rectFT(w,1),{color:C.in,n:2400});
      for(let k=1;k<=4;k++){ a.point(k*PI,0,{color:C.err,r:4}); a.point(-k*PI,0,{color:C.err,r:4}); }
      a.point(0,2,{color:C.coral,r:4.6});
      a.point(4.493409,rectFT(4.493409,1),{color:C.mid,r:4.2});
      a.span(-PI,PI,2.28,'',{color:C.coral});
      a.note(PI+0.4,2.28,'\\text{main lobe}',{anchor:'start',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'$T_1=1$. Red marks the zeros at $\\pm\\pi,\\pm2\\pi,\\dots$ The origin is the peak $2$, not a zero. The violet point is the first side lobe, $-0.434$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\omega=\\pm\\frac{\\pi}{T_1}k,\\qquad k=1,2,3,\\dots', label:'Zero crossings',
      note:'Solve $\\sin(\\omega T_1)=0$ where the denominator $\\omega$ is not zero.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The origin is not a zero', html:'At $\\omega=0$ the formula is $0/0$. The limit is $2T_1$, the largest value. Writing $k\\in\\mathbb{Z}$ calls the peak a zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Main lobe and side lobes', html:'The main lobe $|\\omega|<\\pi/T_1$ has width $2\\pi/T_1$. The side lobes alternate in sign and shrink like $1/|\\omega|$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A pulse with $T_1=0.5$ s.<div class="nsep"></div>Where is the first zero of $X(j\\omega)$?',
        ask:{key:'m5-rect-zeros', choices:['$2\\pi$ rad/s','$\\pi/2$ rad/s','$\\pi$ rad/s'], answer:0,
          why:'The first zero is at $\\pi/T_1=2\\pi$ rad/s.'}}]}
  ]}
]},

{ id:'m5-sinc-rect', module:'M5', nav:'The ideal low-pass pair', title:'The Ideal Low-Pass Pair', src:'pp. 47–48',
  objective:'Invert an ideal low-pass band and read its time-domain peak.',
  keywords:'ideal low pass band W sin(Wt)/(pi t) peak W/pi inverse transform pair', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 47–48'},
  {t:'title', text:'The Ideal Low-Pass Pair'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'k', label:'$W/\\pi$', min:0.5, max:2, step:0.25, v:1, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const W=(v?v.k:1)*PI;
      const a=AX({xr:[-6,6],yr:[-0.55,2.3],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',yticksOverride:[0,0.5,1,1.5,2]});
      a.curve(t=>lpfTime(t,W),{color:C.in,n:2400});
      a.point(0,W/PI,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'$x(t)=\\sin(Wt)/(\\pi t)$. The point marks the peak $W/\\pi$. The signal rings on both sides of the origin for ever.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=1$ for $|\\omega|<W$ and $0$ otherwise: the <b>ideal low-pass band</b>, with band edge {{sym:Wband|$W$}} in rad/s.<div class="nsep"></div>What is $x(0)$?',
      ask:{key:'m5-sinc-rect', choices:['$W/\\pi$','$2W$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Use the synthesis equation, with $1/2\\pi$ in front.</li><li>Integrate $e^{j\\omega t}$ from $-W$ to $W$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(t)=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{\\sin(Wt)}{\\pi t}', label:'Solution',
        note:'With $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$ this is $\\tfrac{W}{\\pi}\\operatorname{sinc}(Wt)$. Its zeros are at $t=\\pm\\pi k/W$, $k=1,2,\\dots$'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'One statement, twice', html:'A rectangle in one domain is a sinc in the other, whichever domain it starts in. Section 5.4 names this duality.'}]}
  ]}
]},

{ id:'m5-inverse-rel', module:'M5', nav:'Narrow in time, wide in frequency', title:'Duration and Bandwidth', src:'p. 48',
  objective:'State the inverse relation as a scaling statement, with the bandwidth measure named.',
  keywords:'inverse relationship duration bandwidth product scaling family first null measure', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The standard pairs', src:'p. 48'},
  {t:'title', text:'Duration and Bandwidth'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T_1=1$: first null at $\\pi$','$T_1=1/4$: first null at $4\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-16,16],yr:[-0.6,2.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[0,0.5,1,2]});
      fade(a,1-f,()=>{ a.curve(w=>rectFT(w,1),{color:C.in,n:2400}); a.point(PI,0,{color:C.err,r:4.4}); });
      fade(a,f,()=>{ a.curve(w=>rectFT(w,0.25),{color:C.out,n:2400}); a.point(4*PI,0,{color:C.err,r:4.4}); });
      return a.svg(); },
      caption:'The pulse made four times narrower. Its spectrum is four times wider and four times lower. Red marks the first null.'}
  ], right:[
    {t:'note', kind:'def', head:'Name the measure', html:'Take the <b>first-null bandwidth</b>, $\\text{BW}=\\pi/T_1$ rad/s, and the full duration $T=2T_1$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'T\\times\\text{BW}=2T_1\\cdot\\frac{\\pi}{T_1}=2\\pi', label:'For this pulse, at every width',
        note:'$T_1=1$: $2\\times\\pi$. $T_1=1/4$: $0.5\\times4\\pi$. The product is the same.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not one constant for all shapes', html:'The product is fixed within one shape. A triangular pulse of the same duration has its first null at $2\\pi/T_1$, so its product is $4\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The half-width $T_1$ of the pulse is halved.<div class="nsep"></div>What happens to the first-null bandwidth?',
        ask:{key:'m5-inverse-rel', choices:['it doubles','it halves','no change'], answer:0,
          why:'$\\text{BW}=\\pi/T_1$, so halving $T_1$ doubles it.'}}]}
  ]}
]},

{ id:'m5-bandlimit', module:'M5', nav:'Duration and band limitation', title:'Time Limitation and Band Limitation', src:'p. 48',
  objective:'Separate the true statement about finite duration from the false converse.',
  keywords:'band limited finite duration implication counterexample false converse', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The standard pairs', src:'p. 48'},
  {t:'title', text:'Time Limitation and Band Limitation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\text{pulse}$: finite duration','$e^{-|t|}$: infinite duration']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-40,40],yr:[-0.8,2.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:4*PI,ylabel:'X(j\\omega)',yticksOverride:[0,1,2]});
      fade(a,1-f,()=>a.curve(w=>rectFT(w,1),{color:C.in,n:4000}));
      fade(a,f,()=>a.curve(w=>2/(1+w*w),{color:C.err,n:4000}));
      return a.svg(); },
      caption:'The pulse of duration $2$ s has a spectrum that is non-zero at arbitrarily high frequencies. $e^{-|t|}$ lasts for ever, and its spectrum is never zero either.'}
  ], right:[
    {t:'note', kind:'def', head:'Band-limited', html:'A signal is <b>band-limited</b> when $X(j\\omega)=0$ for every $|\\omega|>W$, for some finite $W$. Small is not enough; the spectrum must be exactly zero.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\text{finite duration}\\;\\Longrightarrow\\;\\text{not band-limited}', label:'The theorem',
        note:'In the other direction: a band-limited signal cannot have finite duration.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The converse is false', html:'Infinite duration does not give a finite band. $e^{-|t|}$ has $X(j\\omega)=2/(1+\\omega^{2})$, which is $2\\times10^{-12}$ at $\\omega=10^{6}$: small, not zero.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\sin(3t)/(\\pi t)$.<div class="nsep"></div>Is $x$ band-limited?',
        ask:{key:'m5-bandlimit', choices:['yes','no'], answer:0,
          why:'Its transform is $1$ for $|\\omega|<3$ and $0$ beyond.'}}]}
  ]}
]},

realGallery({ id:'m5-real-pairs', nav:'Standard pairs around us',
  title:'Standard Pairs Around Us', eyebrow:'Module 5 · The standard pairs', src:'pp. 44–48',
  objective:'Meet the standard transform shapes in everyday signals.',
  keywords:'examples capacitor discharge radar pulse moving average window temperature anomaly exponential pulse two-sided',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-1,10],yr:[-20,340],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:2}));
      a.curve(t=>t<0?0:300*Math.exp(-t/2),{color:C.in,n:2400});
      return a.svg(); }, 'A flash capacitor discharging: $v(t)=300e^{-t/2}u(t)$ V, $t$ in ms.'],
    [()=>{ const a=P.Axes(EXO({xr:[-3,3],yr:[-0.2,1.3],xlabel:'t\\;(\\mu\\text{s})',ylabel:'e(t)',yticksOverride:[0,1],yticksLeft:true}));
      a.curve(t=>Math.abs(t)<1?1:0,{color:C.in,n:2400});
      return a.svg(); }, 'The envelope of a radar pulse: $e(t)=1$ for $|t|<1$ µs.'],
    [()=>{ const a=P.Axes(EXO({xr:[-3,9],yr:[0,0.3],xlabel:'n\\;(\\text{day})',ylabel:'h[n]',xstep:2,yticksLeft:true}));
      a.stem(D(n=>(n>=0&&n<=4)?0.2:0,-2,8),{color:C.in,r:3});
      return a.svg(); }, 'A five-day moving-average window: $h[n]=0.2$ for $0\\le n\\le4$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-9,9],yr:[0,7],xlabel:'n\\;(\\text{day})',ylabel:'d[n]\\;(^{\\circ}\\text{C})',xstep:3,yticksLeft:true}));
      a.stem(D(n=>6*Math.pow(0.7,Math.abs(n)),-8,8),{color:C.in,r:3});
      return a.svg(); }, 'Temperature above normal around a heat peak: $d[n]=6(0.7)^{|n|}$ °C.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Four standard shapes', html:'A one-sided decay, a pulse and a two-sided decay appear everywhere. Their transforms are the pairs of this section.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'Most problems start from one of these pairs. A property then turns it into the transform that is needed.'}
  ]}),

labScene({ id:'m5-lab-h', lab:'H', nav:'Time and Frequency', title:'Time and Frequency Explorer', src:'pp. 45–48',
  objective:'Change the width or decay rate of a standard signal and observe its transform.',
  keywords:'laboratory CTFT explorer time frequency width bandwidth pulse exponential sinc pairs' }),

codeScene({ id:'m5-code-pairs', nav:'Standard pairs', title:'Standard Pairs in Code', src:'pp. 44–48', eyebrow:'Standard pairs in code',
  objective:'Compute standard transform pairs numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python transform pairs exponential rectangular pulse sinc zeros phase run' }),


/* ======================================================= 5.3 periodic signals */

{ id:'m5-periodic', module:'M5', nav:'Transform of a periodic signal', title:'Transform of a Periodic Signal', src:'p. 49',
  objective:'Derive the impulse train in frequency from the Fourier series.',
  keywords:'periodic signal transform impulse train 2 pi a_k harmonics series as transform', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Periodic signals', src:'p. 49'},
  {t:'title', text:'Transform of a Periodic Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: period $T_0=8$ s','$X(j\\omega)$: weights $2\\pi a_k$']},
      svg:v=>{
      /* the rectangular wave with T1 = 1, T0 = 8, then its line spectrum */
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-12,12],yr:[-0.3,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',yticksOverride:[0,1],xtarget:7});
        fade(a,1-2*f,()=>a.curve(t=>rectPer(t,8,1),{color:C.in,n:3000}));
        return a.svg();
      }
      const w0=2*PI/8;
      const a=AX({xr:[-6,6],yr:[-0.6,1.95],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'X(j\\omega)',yticksOverride:[0,0.5,1,1.5]});
      fade(a,2*f-1,()=>{
        a.curve(w=>w0*rectFT(w,1),{color:C.mid,width:1.6,dash:'7 6',n:1200});
        for(let k=-7;k<=7;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9) continue;
          a.impulse(k*w0,wt,{color:C.in,label:false}); } });
      return a.svg(); },
      caption:'The rectangular wave with $T_1=1$ and its transform: impulses at $k\\omega_0$, $\\omega_0=\\pi/4$. The dashed curve is the envelope the weights sit on.'}
  ], right:[
    {t:'eq', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0t}\\;\\longrightarrow\\;X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}a_k\\cdot2\\pi\\,\\delta(\\omega-k\\omega_0)', label:'Transform the series term by term',
      note:'Linearity, and the pair $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$ for each term.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0),\\qquad \\omega_0=\\frac{2\\pi}{T_0}', label:'Transform of a periodic signal',
        note:'Impulses at the harmonics $k\\omega_0$. The impulse at $k\\omega_0$ has weight $2\\pi a_k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The weight is $2\\pi a_k$', html:'$a_k$ is a Fourier-series coefficient. $2\\pi a_k$ is the area of the impulse at $k\\omega_0$. Reporting $a_k$ as the transform loses $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=3$, a constant.<div class="nsep"></div>What weight does its impulse at $\\omega=0$ carry?',
        ask:{key:'m5-periodic', choices:['$6\\pi$','$3$','$3/2\\pi$'], answer:0,
          why:'$a_0=3$, so the weight is $2\\pi a_0=6\\pi$.'}}]}
  ]}
]},

{ id:'m5-ex-square', module:'M5', nav:'Worked example · square wave', title:'Line Spectrum of a Square Wave', src:'p. 49',
  objective:'Compute the impulse weights for three periods and read the spacing correctly.',
  keywords:'worked example periodic square wave impulse weights spacing three periods envelope', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 49'},
  {t:'title', text:'Line Spectrum of a Square Wave'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T=8T_1$','$T=16T_1$','$T=32T_1$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-4,4],yr:[-0.65,1.85],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'X(j\\omega)',yticksOverride:[0,0.5,1,1.5]});
      [[8,1-cl(f)],[16,cl(f)*(1-cl(f-1))],[32,cl(f-1)]].forEach(([T,o])=>fade(a,o,()=>{
        const w0=2*PI/T;
        for(let k=-Math.floor(4/w0);k<=Math.floor(4/w0);k++){ const wt=2*PI*aSq(k,T,1); if(Math.abs(wt)<1e-9) continue;
          a.impulse(k*w0,wt,{color:C.in,label:false}); } }));
      return a.svg(); },
      caption:'$T_1=1$. For $T=8T_1$ the impulses at $k=\\pm5,\\pm6,\\pm7$ point down and those at $\\pm4,\\pm8$ vanish. A plot of $|a_k|$ would hide both.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The rectangular wave of Module 4, $1$ on $|t|<T_1$ in each period $T$, with $T_1=1$.<div class="nsep"></div>Doubling $T$ does what to the weight at $\\omega=0$?',
      ask:{key:'m5-ex-square', choices:['halves it','doubles it','no change'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Take $a_k$ of the rectangular wave from Module 4.</li><li>Multiply by $2\\pi$ and place an impulse at each $k\\omega_0$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_0=\\frac{2T_1}{T},\\quad a_k=\\frac{\\sin(k\\omega_0T_1)}{\\pi k}\\;\\;\\Longrightarrow\\;\\; 2\\pi a_k=\\frac{2\\sin(k\\omega_0T_1)}{k}', label:'Impulse weights',
        note:'The $\\pi$ in $a_k$ cancels against the $2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}T=8T_1:&\\;\\;\\omega_0=\\pi/4,\\;\\;2\\pi a_0=1.5708\\\\T=16T_1:&\\;\\;\\omega_0=\\pi/8,\\;\\;2\\pi a_0=0.7854\\\\T=32T_1:&\\;\\;\\omega_0=\\pi/16,\\;\\;2\\pi a_0=0.3927\\end{aligned}', label:'Solution',
        note:'Each doubling of $T$ halves the spacing and the weights. The envelope $2\\sin(\\omega T_1)/\\omega$, scaled by $\\omega_0$, keeps its shape.'}]}
  ]}
]},

{ id:'m5-ex-sinus', module:'M5', nav:'Worked example · a cosine', title:'Line Spectrum of a Cosine', src:'p. 50',
  objective:'Transform a cosine and keep both halves of the pair.',
  keywords:'worked example cosine impulses negative frequency pair euler real signal', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Line Spectrum of a Cosine'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-14,14],yr:[-1.4,15.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[0,4,8,12.566],ytickfmt:v=>v===12.566?'12.57':String(v)});
      a.impulse(3*PI,4*PI,{color:C.in,labelText:'12.57'});
      a.impulse(-3*PI,4*PI,{color:C.in,labelText:'12.57'});
      return a.svg(); },
      caption:'The transform of $4\\cos(3\\pi t)$: two impulses of weight $4\\pi\\approx12.57$, at $\\omega=\\pm3\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=4\\cos(3\\pi t)$.<div class="nsep"></div>How many impulses does $X(j\\omega)$ have?',
      ask:{key:'m5-ex-sinus', choices:['one','two','four'], answer:1}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Write the cosine with Euler’s relation.</li><li>Transform each exponential with $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'4\\cos(3\\pi t)=2e^{j3\\pi t}+2e^{-j3\\pi t}', label:'Euler’s relation'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\mathcal{F}\\{4\\cos(3\\pi t)\\}=4\\pi\\,\\delta(\\omega-3\\pi)+4\\pi\\,\\delta(\\omega+3\\pi)', label:'Solution',
        note:'Each exponential gives $2\\cdot2\\pi=4\\pi$. The two arguments differ in sign: one impulse at $+3\\pi$, one at $-3\\pi$.'}]}
  ]}
]},

{ id:'m5-ex-sinus-c', module:'M5', nav:'Worked example · a sine', title:'Line Spectrum of a Sine', src:'p. 50',
  objective:'Transform a sine and read its imaginary, odd weights.',
  keywords:'worked example sine imaginary weights odd negative frequency conjugate symmetry', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Line Spectrum of a Sine'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-18,18],yr:[-22,22],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,xtickfmt:v=>Math.abs(Math.abs(v)-4*PI)<1e-9?'':P.piTick(v),ylabel:'\\operatorname{Im}\\{X(j\\omega)\\}',yticksOverride:[-18.85,-10,10,18.85],ytickfmt:v=>Math.abs(v)>18?(v<0?'-18.85':'18.85'):String(v)});
      a.impulse(4*PI,-6*PI,{color:C.in,label:false});
      a.impulse(-4*PI,6*PI,{color:C.in,label:false});
      return a.svg(); },
      caption:'The imaginary part of the transform of $6\\sin(4\\pi t)$: $-6\\pi$ at $+4\\pi$ and $+6\\pi$ at $-4\\pi$. The real part is zero.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=6\\sin(4\\pi t)$.<div class="nsep"></div>Are the impulse weights real or imaginary?',
      ask:{key:'m5-ex-sinus-c', choices:['imaginary','real'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'6\\sin(4\\pi t)=\\frac{6}{2j}\\,e^{j4\\pi t}-\\frac{6}{2j}\\,e^{-j4\\pi t}', label:'Euler’s relation'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\mathcal{F}\\{6\\sin(4\\pi t)\\}=\\frac{6\\pi}{j}\\,\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\,\\delta(\\omega+4\\pi)', label:'Solution',
        note:'$6\\pi/j=-j6\\pi$: an imaginary weight of modulus $6\\pi\\approx18.85$, with opposite signs on the two sides.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Keep both frequency signs', html:'A real signal has $X(-j\\omega)=X^{*}(j\\omega)$. A spectrum with only the impulse at $+4\\pi$ belongs to a complex signal.'}]}
  ]}
]},

{ id:'m5-ex-sinus-b', module:'M5', nav:'Worked example · a mixed signal', title:'Line Spectrum of a Mixed Signal', src:'p. 50',
  objective:'Assemble one spectrum from three terms and show it as magnitude and phase.',
  keywords:'worked example three components constant cosine sine magnitude phase complex spectrum', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Line Spectrum of a Mixed Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|X(j\\omega)|$: even','$\\angle X(j\\omega)$: odd']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-16,16],yr:[-3,36],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'|X(j\\omega)|',yticksOverride:[12.566,18.850,31.416],ytickfmt:v=>v.toFixed(2)});
        fade(a,1-2*f,()=>{
          a.impulse(0,10*PI,{color:C.in,label:false});
          [3*PI,-3*PI].forEach(w=>a.impulse(w,4*PI,{color:C.in,label:false}));
          [4*PI,-4*PI].forEach(w=>a.impulse(w,6*PI,{color:C.in,label:false})); });
        return a.svg();
      }
      const a=AX({xr:[-16,16],yr:[-2.1,2.1],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,xtickfmt:v=>Math.abs(Math.abs(v)-4*PI)<1e-9?'':P.piTick(v),ylabel:'\\angle X(j\\omega)\\;(\\text{rad})',yticksOverride:[-1.5708,1.5708],ytickfmt:v=>v.toFixed(2)});
      fade(a,2*f-1,()=>a.stem([[-4*PI,PI/2],[-3*PI,0],[0,0],[3*PI,0],[4*PI,-PI/2]],{color:C.mid,r:4.4,showZero:true}));
      return a.svg(); },
      caption:'$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$. The magnitude cannot tell the cosine from the sine; the phase does.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$.<div class="nsep"></div>What weight sits at $\\omega=0$?',
      ask:{key:'m5-ex-sinus-b', choices:['$10\\pi$','$5$','$5\\pi$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}X(j\\omega)={}&10\\pi\\,\\delta(\\omega)+4\\pi\\,\\delta(\\omega-3\\pi)+4\\pi\\,\\delta(\\omega+3\\pi)\\\\&+\\frac{6\\pi}{j}\\,\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\,\\delta(\\omega+4\\pi)\\end{aligned}', label:'Solution · by linearity',
        note:'The constant gives $5\\cdot2\\pi\\,\\delta(\\omega)=10\\pi\\,\\delta(\\omega)$, of weight $31.42$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Two panels for a complex spectrum', html:'Three weights are real and two are imaginary. Draw magnitude and phase, or real and imaginary parts, and name the pair.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'The signal is real, so $|X|$ must be even and $\\angle X$ odd. The phase is $-\\pi/2$ at $+4\\pi$ and $+\\pi/2$ at $-4\\pi$, because $1/j=-j$.'}]}
  ]}
]},

{ id:'m5-ex-imptrain', module:'M5', nav:'Worked example · impulse train', title:'Transform of an Impulse Train', src:'p. 50',
  objective:'Transform the periodic impulse train and state the reciprocal spacing rule.',
  keywords:'impulse train transform 2 pi over T spacing weight reciprocal sampling preview', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Transform of an Impulse Train'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T=1$ s: spacing and weight $2\\pi$','$T=2$ s: spacing and weight $\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-16,16],yr:[-0.8,8.2],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'X(j\\omega)',yticksOverride:[0,3.1416,6.2832],ytickfmt:v=>v.toFixed(2)});
      fade(a,1-f,()=>{ for(let k=-2;k<=2;k++) a.impulse(k*2*PI,2*PI,{color:C.in,label:false}); });
      fade(a,f,()=>{ for(let k=-5;k<=5;k++) a.impulse(k*PI,PI,{color:C.out,label:false}); });
      return a.svg(); },
      caption:'Spread the impulses in time twice as far apart, and in frequency they come twice as close and half as tall.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\sum_{k}\\delta(t-kT)$, one unit impulse every $T$ seconds.<div class="nsep"></div>If $T$ doubles, the spacing in $X(j\\omega)$',
      ask:{key:'m5-ex-imptrain', choices:['halves','doubles','stays the same'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Find $a_k$ over a period that holds exactly one impulse.</li><li>Use $X(j\\omega)=\\sum_k2\\pi a_k\\,\\delta(\\omega-k\\omega_0)$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\quad\\text{for every }k', label:'Coefficients',
        note:'Only the impulse at $t=0$ lies in the interval, and sifting gives $e^{0}=1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)\\;\\longleftrightarrow\\;\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right)', label:'Solution',
        note:'The weight $2\\pi a_k$ and the spacing $\\omega_0$ are the same number, $2\\pi/T$: $6.28$ for $T=1$ and $3.14$ for $T=2$.'}]}
  ]}
]},

realGallery({ id:'m5-real-periodic', nav:'Line spectra around us',
  title:'Line Spectra Around Us', eyebrow:'Module 5 · Periodic signals', src:'pp. 49–50',
  objective:'See everyday signals that repeat, and whose spectra are lines.',
  keywords:'examples mains voltage clock signal daylight hours weekly pattern periodic line spectrum harmonics',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[-400,400],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:20}));
      a.curve(t=>325*Math.cos(2*PI*0.05*t),{color:C.in,n:1200});
      return a.svg(); }, 'Mains voltage: $v(t)=325\\cos(2\\pi\\,0.05\\,t)$ V, $t$ in ms, that is $50$ Hz.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,4],yr:[-0.4,4.2],xlabel:'t\\;(\\text{ms})',ylabel:'c(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>((t%1)+1)%1<0.5?3.3:0,{color:C.in,n:2400});
      return a.svg(); }, 'A clock line: $c(t)=3.3$ V in the first half of every $1$ ms period, $0$ in the second.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,25],yr:[0,17],xlabel:'n\\;(\\text{month})',ylabel:'d[n]\\;(\\text{h})',xstep:6}));
      a.stem(D(n=>12+3.5*Math.cos(2*PI*n/12),0,24),{color:C.in,r:3});
      return a.svg(); }, 'Hours of daylight, month $n$ counted from June: $d[n]=12+3.5\\cos(2\\pi n/12)$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-2,22],yr:[0,950],xlabel:'n\\;(\\text{day})',ylabel:'p[n]',xstep:7}));
      a.stem(D(n=>(n%7)<5?800:300,0,20),{color:C.in,r:3});
      return a.svg(); }, 'Bus passengers each day: $p[n]=800$ on weekdays and $300$ at weekends, period $7$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'It repeats', html:'Each signal repeats with a fixed period $T_0$. Its spectrum is a train of impulses at the multiples of $2\\pi/T_0$.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'Lines in a spectrum reveal a repetition in time. The spacing of the lines gives the period.'}
  ]}),

labScene({ id:'m5-lab-v', lab:'V', nav:'Line Spectra', title:'A Periodic Signal and Its Impulse Train', src:'pp. 49–50',
  objective:'Build the transform of a periodic signal from its Fourier coefficients and read each impulse weight.',
  keywords:'laboratory periodic signal line spectrum impulse weights 2 pi a_k harmonics cosine sine impulse train' }),

codeScene({ id:'m5-code-periodic', nav:'Periodic signals', title:'Line Spectra in Code', src:'pp. 49–50', eyebrow:'Periodic signals in code',
  objective:'Compute the impulse weights of periodic signals in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python periodic signal impulse weights line spectrum square wave cosine run' }),


/* ======================================================= 5.4 properties */

{ id:'m5-props-1', module:'M5', nav:'Properties · linearity, time shift', title:'Linearity and Time Shift', src:'p. 51',
  objective:'State and prove the two properties that need no new machinery.',
  keywords:'properties linearity time shift linear phase proof magnitude unchanged', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 51'},
  {t:'title', text:'Linearity and Time Shift'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'t0', label:'$t_0$', min:-3, max:3, step:0.5, v:3, show:v=>'$'+v+'$ s'}]},
      svg:v=>{
      const t0=v?v.t0:3;
      const a=AX({xr:[-3,3],yr:[-10.5,10.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/4,ylabel:'\\angle e^{-j\\omega t_0}\\;(\\text{rad})',yticksOverride:[-9,-6,-3,3,6,9]});
      a.curve(w=>-t0*w,{color:C.out,n:400});
      return a.svg(); },
      caption:'The phase that a delay of $t_0$ adds, $-\\omega t_0$: a line of slope $-t_0$. The magnitude of $e^{-j\\omega t_0}$ is $1$ at every frequency.'}
  ], right:[
    {t:'eq', tex:'a\\,x_1(t)+b\\,x_2(t)\\;\\longleftrightarrow\\;a\\,X_1(j\\omega)+b\\,X_2(j\\omega)', label:'Linearity',
      note:'The analysis equation is an integral, and integration is linear.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\int_{-\\infty}^{\\infty}x(t-t_0)\\,e^{-j\\omega t}\\,\\d t=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega(\\tau+t_0)}\\,\\d\\tau=e^{-j\\omega t_0}X(j\\omega)', label:'Put $\\tau=t-t_0$',
        note:'$\\d t=\\d\\tau$, and the infinite limits do not move.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(t-t_0)\\;\\longleftrightarrow\\;e^{-j\\omega t_0}\\,X(j\\omega)', label:'Time shift',
        note:'$|X|$ does not change. The phase gains $-\\omega t_0$: a delay is a linear phase.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)\\leftrightarrow X(j\\omega)$ and $y(t)=x(t-2)$.<div class="nsep"></div>What is $\\angle Y(j1)-\\angle X(j1)$?',
        ask:{key:'m5-props-1', choices:['$-2$ rad','$+2$ rad','$0$'], answer:0,
          why:'The delay adds $-\\omega t_0=-1\\cdot2=-2$ rad at $\\omega=1$.'}}]}
  ]}
]},

{ id:'m5-props-shift-ex', module:'M5', nav:'Worked example · a shifted sum', title:'Time Shift and Linearity Example', src:'p. 51',
  objective:'Apply linearity and the shift together and check the value at the origin.',
  keywords:'worked example shifted pulses sum linearity X(j0) area check staircase', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 51'},
  {t:'title', text:'Time Shift and Linearity Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-1,8],yr:[-0.35,3.7],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',yticksOverride:[0,1,2,3],xtarget:9});
      a.area(t=>2*rectp(t-4,2)+rectp(t-3,1),-1,8,{color:C.in+'24',n:900});
      a.curve(t=>2*rectp(t-4,2)+rectp(t-3,1),{color:C.in,n:3000});
      return a.svg(); },
      caption:'$x_3(t)$ is $3$ on $2<t<4$ and $2$ on $4<t<6$. The shaded area is $10$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x_1(t)=1$ on $|t|<2$ and $x_2(t)=1$ on $|t|<1$, both zero elsewhere. $x_3(t)=2x_1(t-4)+x_2(t-3)$.<div class="nsep"></div>What is $X_3(j0)$?',
      ask:{key:'m5-props-shift-ex', choices:['$10$','$6$','$3$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Transform each pulse with the pair $2\\sin(\\omega T_1)/\\omega$.</li><li>Shift each one, then add with linearity.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'X_3(j\\omega)=2e^{-j4\\omega}\\,\\frac{2\\sin(2\\omega)}{\\omega}+e^{-j3\\omega}\\,\\frac{2\\sin\\omega}{\\omega}', label:'Solution',
        note:'$X_1(j\\omega)=2\\sin(2\\omega)/\\omega$ and $X_2(j\\omega)=2\\sin\\omega/\\omega$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$X(j0)=\\int x(t)\\,\\d t$, the area. $X_3(j0)=2\\cdot4+2=10$. From the graph, $3\\cdot2+2\\cdot2=10$.'}]}
  ]}
]},

{ id:'m5-props-freq', module:'M5', nav:'Properties · frequency shift', title:'Frequency Shift', src:'p. 52',
  objective:'Prove the frequency-shift property from the expression the property states.',
  keywords:'frequency shift modulation e^{jw0t} band moves proof operand kernel', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 52'},
  {t:'title', text:'Frequency Shift'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'k', label:'$\\omega_0/\\pi$', min:-2, max:2, step:0.5, v:2, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const w0=(v?v.k:2)*PI;
      const a=AX({xr:[-16,16],yr:[-0.25,1.45],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,1]});
      a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,dash:'9 6',n:3000});
      a.curve(w=>Math.abs(w-w0)<2*PI?1:0,{color:C.out,n:3000});
      return a.svg(); },
      caption:'The band $Y(j\\omega)=1$ on $|\\omega|<2\\pi$, and the band after multiplying by $e^{j\\omega_0t}$. The whole band moves by $\\omega_0$.'},
    {t:'legend', items:[['in','$Y(j\\omega)$',true],['out','$Y\\bigl(j(\\omega-\\omega_0)\\bigr)$']]}
  ], right:[
    {t:'eq', key:true, tex:'e^{j\\omega_0t}\\,x(t)\\;\\longleftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)', label:'Frequency shift',
      note:'The operand is $e^{+j\\omega_0t}$, an exponential in time with a fixed frequency $\\omega_0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\int_{-\\infty}^{\\infty}e^{j\\omega_0t}x(t)\\,e^{-j\\omega t}\\,\\d t=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\omega_0)t}\\,\\d t=X\\bigl(j(\\omega-\\omega_0)\\bigr)', label:'Proof',
        note:'Combine the two exponentials. The result is the analysis integral at $\\omega-\\omega_0$; no substitution is needed.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not the time-shift kernel', html:'The time shift multiplies the spectrum by $e^{-j\\omega t_0}$, with a fixed time $t_0$. Starting this proof from that kernel proves a different statement.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$Y(j\\omega)=1$ on $|\\omega|<2\\pi$, and $z(t)=e^{j\\pi t}y(t)$.<div class="nsep"></div>Where is the band of $Z(j\\omega)$?',
        ask:{key:'m5-props-freq', choices:['$-\\pi<\\omega<3\\pi$','$-3\\pi<\\omega<\\pi$','$|\\omega|<2\\pi$'], answer:0,
          why:'$\\omega_0=\\pi$ moves the band right by $\\pi$.'}}]}
  ]}
]},

{ id:'m5-props-conj', module:'M5', nav:'Properties · conjugation and symmetry', title:'Conjugation and Spectral Symmetry', src:'pp. 52–53',
  objective:'Derive the conjugate symmetry of a real signal and its even and odd consequences.',
  keywords:'conjugation conjugate symmetry real signal even odd hermitian magnitude phase', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'pp. 52–53'},
  {t:'title', text:'Conjugation and Spectral Symmetry'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-13,13],yr:[-0.8,2.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,1,2]});
      a.curve(w=>Math.abs(rectFT(w,1)),{color:C.mid,dash:'9 6',n:2400});
      a.curve(w=>rectFT(w,1),{color:C.in,n:2400});
      return a.svg(); },
      caption:'The pulse transform is real, and it is negative on alternate side lobes. There $|X|=-X$ and the phase is $\\pi$, not $0$.'},
    {t:'legend', items:[['in','$X(j\\omega)$'],['mid','$|X(j\\omega)|$',true]]}
  ], right:[
    {t:'eq', tex:'x^{*}(t)\\;\\longleftrightarrow\\;X^{*}(-j\\omega)', label:'Conjugation',
      note:'Conjugating the analysis integral changes the sign of $j$ everywhere.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)\\ \\text{real}\\quad\\Longrightarrow\\quad X(-j\\omega)=X^{*}(j\\omega)', label:'Conjugate symmetry',
        note:'So $\\operatorname{Re}\\{X\\}$ and $|X|$ are even; $\\operatorname{Im}\\{X\\}$ and $\\angle X$ are odd. A real, even $x$ has a real, even $X$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Real is not zero phase', html:'Where a real transform is negative, its phase is $\\pi$. Only a real, non-negative transform has zero phase everywhere.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is real and $X(j2)=3-4j$.<div class="nsep"></div>What is $X(-j2)$?',
        ask:{key:'m5-props-conj', choices:['$3+4j$','$3-4j$','$-3+4j$'], answer:0,
          why:'A real signal has $X(-j\\omega)=X^{*}(j\\omega)$.'}}]}
  ]}
]},

{ id:'m5-props-evenodd', module:'M5', nav:'Properties · even and odd parts', title:'Even and Odd Parts', src:'p. 53',
  objective:'Relate the even and odd parts of a real signal to the real and imaginary parts of its transform.',
  keywords:'symmetry real even transform real odd purely imaginary even odd decomposition Ev Od real part imaginary part', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Even and Odd Parts'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-3.2,3.2],yr:[-0.65,1.3],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',ytarget:4});
      a.curve(t=>t>0?Math.exp(-t):0,{color:C.in,n:3000});
      a.curve(t=>0.5*Math.exp(-Math.abs(t)),{color:C.mid,n:3000,dash:'9 6'});
      a.curve(t=>0.5*Math.sign(t)*Math.exp(-Math.abs(t)),{color:C.out,n:3000});
      return a.svg(); },
      caption:'$x(t)=e^{-t}u(t)$ and the two parts it splits into: an even part and an odd part.'},
    {t:'legend', at:'tl', items:[['in','$x(t)$'],['mid','$\\Ev\\{x\\}$',true],['out','$\\Od\\{x\\}$']]}
  ], right:[
    {t:'eq', key:true, tex:'\\Ev\\{x(t)\\}\\;\\longleftrightarrow\\;\\operatorname{Re}\\{X(j\\omega)\\},\\qquad \\Od\\{x(t)\\}\\;\\longleftrightarrow\\;j\\operatorname{Im}\\{X(j\\omega)\\}', label:'For a real $x$'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\Ev\\{x\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr]\\;\\longleftrightarrow\\;\\tfrac12\\bigl[X+X^{*}\\bigr]=\\operatorname{Re}\\{X\\}', label:'Proof',
        note:'Linearity and time reversal give $\\tfrac12[X(j\\omega)+X(-j\\omega)]$, and for a real signal $X(-j\\omega)=X^{*}(j\\omega)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'A worked case', html:'For $e^{-at}u(t)$ the even part $\\tfrac12e^{-a|t|}$ transforms to $a/(a^{2}+\\omega^{2})=\\operatorname{Re}\\{1/(a+j\\omega)\\}$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is real and odd.<div class="nsep"></div>What kind of function is $X(j\\omega)$?',
        ask:{key:'m5-props-evenodd', choices:['imaginary and odd','real and even','real and odd'], answer:0,
          why:'Its even part is zero, so $X=j\\operatorname{Im}\\{X\\}$, and $\\operatorname{Im}\\{X\\}$ is odd.'}}]}
  ]}
]},

{ id:'m5-props-dfreq', module:'M5', nav:'Properties · differentiation in frequency', title:'Differentiation in Frequency', src:'p. 53',
  objective:'Prove the differentiation-in-frequency property and use it to transform t e^{-at}u(t).',
  keywords:'differentiation in frequency t x(t) j dX/dw repeated pole t e^{-at} u(t)', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Differentiation in Frequency'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.5,7],yr:[-0.1,1.2],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.37,0.5,1],ytickfmt:v=>String(v)});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'9 6',n:2000});
      a.curve(t=>t<0?0:t*Math.exp(-t),{color:C.out,n:2000});
      a.point(1,Math.exp(-1),{color:C.coral,r:4.2});
      return a.svg(); },
      caption:'Multiplying $e^{-t}u(t)$ by $t$ gives a signal that starts at $0$ and peaks at $t=1$, where it is $e^{-1}\\approx0.37$.'},
    {t:'legend', items:[['in','$e^{-t}u(t)$',true],['out','$t\\,e^{-t}u(t)$']]}
  ], right:[
    {t:'eq', tex:'\\frac{\\d X}{\\d\\omega}=\\int_{-\\infty}^{\\infty}(-jt)\\,x(t)\\,e^{-j\\omega t}\\,\\d t', label:'Differentiate the analysis integral',
      note:'Only $e^{-j\\omega t}$ depends on $\\omega$, and its derivative is $-jt\\,e^{-j\\omega t}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'t\\,x(t)\\;\\longleftrightarrow\\;j\\,\\frac{\\d}{\\d\\omega}X(j\\omega)', label:'Differentiation in frequency',
        note:'Multiply both sides by $j$, since $j\\cdot(-j)=1$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'t\\,e^{-at}u(t)\\;\\longleftrightarrow\\;j\\,\\frac{\\d}{\\d\\omega}\\,\\frac{1}{a+j\\omega}=j\\cdot\\frac{-j}{(a+j\\omega)^{2}}=\\frac{1}{(a+j\\omega)^{2}}', label:'Use it on $e^{-at}u(t)$'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=t\\,e^{-t}u(t)$.<div class="nsep"></div>What is $X(j0)$?',
        ask:{key:'m5-props-dfreq', choices:['$1$','$0$','$1/2$'], answer:0,
          why:'$1/(1+j0)^{2}=1$, and the area $\\int_0^\\infty t\\,e^{-t}\\,\\d t$ is $1$.'}}]}
  ]}
]},

{ id:'m5-props-diff', module:'M5', nav:'Properties · differentiation', title:'Differentiation in Time', src:'p. 53',
  objective:'Prove the differentiation property correctly and expose the step students reproduce.',
  keywords:'differentiation property jw X integration variable false step under the integral', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Differentiation in Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-6,6],yr:[-1.5,2.0],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'\\text{spectrum}',ytarget:4});
      a.curve(w=>Math.sqrt(PI)*Math.exp(-w*w/4),{color:C.in,n:1600});
      a.curve(w=>w*Math.sqrt(PI)*Math.exp(-w*w/4),{color:C.out,n:1600});
      return a.svg(); },
      caption:'For $x(t)=e^{-t^{2}}$: its spectrum, and the imaginary part of the spectrum of $\\d x/\\d t$. The factor $j\\omega$ removes low frequencies and lifts high ones.'},
    {t:'legend', at:'tl', items:[['in','$X(j\\omega)$'],['out','$\\operatorname{Im}\\{j\\omega X(j\\omega)\\}$']]}
  ], right:[
    {t:'eq', tex:'\\frac{\\d x}{\\d t}=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,\\frac{\\partial}{\\partial t}e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\bigl[j\\omega X(j\\omega)\\bigr]e^{j\\omega t}\\,\\d\\omega', label:'Differentiate the synthesis integral',
      note:'Only $e^{j\\omega t}$ depends on $t$. The right side is the synthesis integral of $j\\omega X(j\\omega)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\frac{\\d x}{\\d t}\\;\\longleftrightarrow\\;j\\omega\\,X(j\\omega),\\qquad \\frac{\\d^{n}x}{\\d t^{n}}\\;\\longleftrightarrow\\;(j\\omega)^{n}X(j\\omega)', label:'Differentiation',
        note:'A differential equation becomes an algebraic equation in $j\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Do not mix the domains', html:'$\\d x/\\d t=j\\omega\\,x(t)$ is false: $\\omega$ is the integration variable, not a constant of the signal. For $e^{-t^{2}}$ at $t=1$, $\\d x/\\d t=-0.7358$, while $j3\\,x(1)=1.1036j$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)\\leftrightarrow X(j\\omega)$ with $X(j2)=0.5$.<div class="nsep"></div>What is the transform of $\\d x/\\d t$ at $\\omega=2$?',
        ask:{key:'m5-props-diff', choices:['$j$','$1$','$0.25$'], answer:0,
          why:'$j\\omega X(j\\omega)=j2\\cdot0.5=j$.'}}]}
  ]}
]},

{ id:'m5-step', module:'M5', nav:'Worked example · the unit step', title:'Transform of the Unit Step', src:'p. 53',
  objective:'Derive the transform of the unit step from the sign function and its mean.',
  keywords:'unit step transform sign function sgn mean one half pi delta 1 over j omega limit e^{-a|t|} odd', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Transform of the Unit Step'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.05, max:2, step:0.05, v:0.5, show:v=>'$'+(Math.round(v*100)/100)+'$'}]},
      svg:v=>{
      const av=v?v.a:0.5;
      const a=AX({xr:[-6,6],yr:[-1.5,2.1],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[-1,1],xtarget:7});
      a.curve(t=>Math.sign(t),{color:C.mid,dash:'9 6',n:2400});
      a.curve(t=>Math.exp(-av*Math.abs(t))*Math.sign(t),{color:C.in,n:2400});
      return a.svg(); },
      caption:'Lower $a$: $e^{-a|t|}\\operatorname{sgn}(t)$ approaches $\\operatorname{sgn}(t)$, which is $1$ for $t>0$ and $-1$ for $t<0$.'},
    {t:'legend', at:'tl', items:[['in','$e^{-a|t|}\\operatorname{sgn}(t)$'],['mid','$\\operatorname{sgn}(t)$',true]]}
  ], right:[
    {t:'eq', tex:'e^{-a|t|}\\operatorname{sgn}(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega}-\\frac{1}{a-j\\omega}=\\frac{-2j\\omega}{a^{2}+\\omega^{2}}\\;\\xrightarrow{\\;a\\to0\\;}\\;\\frac{2}{j\\omega}', label:'Step 1 · The sign function',
      note:'Split the analysis integral at $t=0$ and use $e^{-at}u(t)\\leftrightarrow1/(a+j\\omega)$ on each side. At $\\omega=0$ the value is $0$ for every $a$, so no impulse appears.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'u(t)=\\underbrace{\\tfrac12}_{\\text{mean}}+\\underbrace{\\tfrac12\\operatorname{sgn}(t)}_{\\text{odd part}}\\;\\longleftrightarrow\\;\\pi\\delta(\\omega)+\\frac{1}{j\\omega}', label:'Step 2 · Add the mean',
        note:'The constant $\\tfrac12$ gives $\\tfrac12\\cdot2\\pi\\delta(\\omega)$. The odd part gives $\\tfrac12\\cdot2/(j\\omega)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\d u/\\d t=\\delta(t)$, whose transform is $1$. Differentiation multiplies by $j\\omega$: $j\\omega\\cdot\\dfrac{1}{j\\omega}=1$, and $\\omega\\,\\delta(\\omega)=0$ removes the impulse.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$u(-t)=\\tfrac12-\\tfrac12\\operatorname{sgn}(t)$.<div class="nsep"></div>What is its transform?',
        ask:{key:'m5-step', choices:['$\\pi\\delta(\\omega)-\\dfrac{1}{j\\omega}$','$-\\pi\\delta(\\omega)+\\dfrac{1}{j\\omega}$','$\\dfrac{1}{j\\omega}$'], answer:0,
          why:'The mean is still $\\tfrac12$; only the odd part changes sign.'}}]}
  ]}
]},

{ id:'m5-props-int', module:'M5', nav:'Properties · integration', title:'Integration in Time', src:'p. 53',
  objective:'State the integration property with its impulse term and show where the term comes from.',
  keywords:'integration property running integral impulse at origin pi X(0) delta omega dc term area zero mean', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Integration in Time'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\text{area }1$: it settles at $1$','$\\text{area }0$: it returns to $0$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-1,4],yr:[-1.35,1.5],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[-1,1],xtarget:6});
      fade(a,1-f,()=>{ a.curve(t=>(t>0&&t<1)?1:0,{color:C.in,dash:'9 6',n:2600});
        a.curve(t=>t<=0?0:(t<1?t:1),{color:C.out,n:2600}); });
      fade(a,f,()=>{ a.curve(t=>(t>0&&t<1)?1:((t>=1&&t<2)?-1:0),{color:C.in,dash:'9 6',n:2600});
        a.curve(t=>t<=0?0:(t<1?t:(t<2?2-t:0)),{color:C.out,n:2600}); });
      return a.svg(); },
      caption:'A pulse and its running integral. With area $1$ the integral settles at a constant, which needs an impulse at $\\omega=0$. With area $0$ it does not.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$']]}
  ], right:[
    {t:'eq', key:true, tex:'\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\longleftrightarrow\\;\\frac{X(j\\omega)}{j\\omega}+\\pi X(0)\\,\\delta(\\omega)', label:'Integration'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x(t)*u(t)\\;\\longleftrightarrow\\;X(j\\omega)\\left[\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\right]=\\frac{X(j\\omega)}{j\\omega}+\\pi X(0)\\,\\delta(\\omega)', label:'Proof',
        note:'The running integral is $x*u$, and $u(t)\\leftrightarrow\\tfrac{1}{j\\omega}+\\pi\\delta(\\omega)$. Transforms multiply (Section 5.5), and $\\delta(\\omega)$ keeps only $X(0)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Keep the impulse term', html:'$X(0)=\\int x(t)\\,\\d t$, the area. When it is not zero, the running integral settles at a constant, and a constant has an impulse at $\\omega=0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ on $0<t<2$ and $0$ elsewhere.<div class="nsep"></div>What weight does the impulse term carry?',
        ask:{key:'m5-props-int', choices:['$2\\pi$','$\\pi$','$0$'], answer:0,
          why:'$X(0)=2$, the area, so $\\pi X(0)=2\\pi$.'}}]}
  ]}
]},

{ id:'m5-props-deriv-ex', module:'M5', nav:'Worked example · transform by differentiation', title:'Transform by Differentiation', src:'p. 53',
  objective:'Find the transform of a trapezoid by differentiating it into two pulses.',
  keywords:'worked example trapezoid differentiate pulses integration property G(0) area 3 piecewise linear', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 53'},
  {t:'title', text:'Transform by Differentiation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$: a trapezoid','$g(t)=\\d x/\\d t$: two pulses']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-3,3],yr:[-1.5,2.1],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[-1,1],xtarget:7});
      const x=t=>{ const u=Math.abs(t); return u<1?1:(u<2?2-u:0); };
      const g=t=>[-2,-1,1,2].some(c=>Math.abs(t-c)<0.004)?NaN:((t>-2&&t<-1)?1:((t>1&&t<2)?-1:0));
      fade(a,1-f,()=>a.curve(x,{color:C.in,n:2400}));
      fade(a,f,()=>{ a.curve(x,{color:C.in,dash:'9 6',n:2400}); a.curve(g,{color:C.mid,n:3000}); });
      return a.svg(); },
      caption:'The ramps become pulses of height $\\pm1$; the flat parts become $0$. Pulses have a known transform.'},
    {t:'legend', items:[['in','$x(t)$'],['mid','$g(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ for $|t|\\le1$, $2-|t|$ for $1<|t|<2$, $0$ elsewhere. Find $X(j\\omega)$.<div class="nsep"></div>What is $G(j0)$, the area of $g$?',
      ask:{key:'m5-props-deriv-ex', choices:['$0$','$3$','$2$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Differentiate: $g=1$ on $(-2,-1)$ and $-1$ on $(1,2)$.</li><li>Transform $g$ with the unit-width pulse $\\leftrightarrow2\\sin(\\omega/2)/\\omega$ and the time shift.</li><li>Integrate back: $X=G/(j\\omega)+\\pi G(0)\\delta(\\omega)$, and $G(0)=0$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}G(j\\omega)&=\\bigl(e^{j1.5\\omega}-e^{-j1.5\\omega}\\bigr)\\frac{2\\sin(\\omega/2)}{\\omega}=\\frac{4j\\sin(1.5\\omega)\\sin(\\omega/2)}{\\omega}\\\\X(j\\omega)&=\\frac{G(j\\omega)}{j\\omega}=\\frac{4\\sin(1.5\\omega)\\sin(\\omega/2)}{\\omega^{2}}\\end{aligned}', label:'Solution',
        note:'The pulse centred at $-1.5$ carries $e^{j1.5\\omega}$, the one at $1.5$ carries $-e^{-j1.5\\omega}$, and $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'For small $\\omega$, $\\sin(1.5\\omega)\\approx1.5\\omega$ and $\\sin(\\omega/2)\\approx\\omega/2$, so $X(j0)=4\\cdot1.5\\cdot0.5=3$. The trapezoid has area $\\tfrac12(2+4)\\cdot1=3$. $X$ is real and even, as $x$ is.'}]}
  ]}
]},

{ id:'m5-props-scale', module:'M5', nav:'Properties · time scaling', title:'Time Scaling', src:'p. 53',
  objective:'Prove the scaling property for a positive factor and read what it does to a spectrum.',
  keywords:'time scaling 1/|a| substitution compress stretch spectrum width height', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Time Scaling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'a', label:'$a$', min:0.5, max:3, step:0.25, v:2, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const av=v?v.a:2;
      const a=AX({xr:[-13,13],yr:[-1.0,4.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,1,2,3,4]});
      a.curve(w=>rectFT(w,1),{color:C.in,dash:'9 6',n:2400});
      a.curve(w=>rectFT(w/av,1)/av,{color:C.out,n:2400});
      return a.svg(); },
      caption:'The pulse of half-width $1$, and the transform of $x(at)$. For $a>1$ the spectrum is wider by $a$ and lower by $1/a$.'},
    {t:'legend', items:[['in','$X(j\\omega)$',true],['out','$\\tfrac{1}{a}X(j\\omega/a)$']]}
  ], right:[
    {t:'eq', key:true, tex:'x(at)\\;\\longleftrightarrow\\;\\frac{1}{|a|}\\,X\\!\\left(j\\frac{\\omega}{a}\\right),\\qquad a\\neq0', label:'Time scaling',
      note:'The modulus is on $a$ in the factor, not in the argument.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\int_{-\\infty}^{\\infty}x(at)\\,e^{-j\\omega t}\\,\\d t=\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{a}\\,X\\!\\left(j\\frac{\\omega}{a}\\right)', label:'Proof for $a>0$',
        note:'Put $\\tau=at$, so $\\d t=\\d\\tau/a$. For $a>0$ the limits keep their order, and $1/a=1/|a|$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Reading', html:'Compress a signal in time and its spectrum widens. Stretch it and the spectrum narrows. This is the inverse relation of Section 5.2.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)\\leftrightarrow X(j\\omega)$ with $X(j0)=6$.<div class="nsep"></div>What is the transform of $x(3t)$ at $\\omega=0$?',
        ask:{key:'m5-props-scale', choices:['$2$','$18$','$6$'], answer:0,
          why:'$\\tfrac13X(j0)=2$: the area of $x(3t)$ is a third of the area of $x$.'}}]}
  ]}
]},

{ id:'m5-props-scale-b', module:'M5', nav:'Properties · a negative factor', title:'Scaling by a Negative Factor', src:'p. 53',
  objective:'Prove the scaling property for a negative factor without counting the reversal twice.',
  keywords:'time scaling negative a reversal limits substitution sign bookkeeping proof time reversal', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Scaling by a Negative Factor'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-5,5],yr:[-0.15,1.3],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.5,1]});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'9 6',n:2400});
      a.curve(t=>t>0?0:Math.exp(t),{color:C.out,n:2400});
      return a.svg(); },
      caption:'$x(t)=e^{-t}u(t)$ and its reversal $x(-t)$, the case $a=-1$.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x(-t)$']]}
  ], right:[
    {t:'eq', tex:'\\frac{1}{a}\\int_{+\\infty}^{-\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=-\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{|a|}\\,X\\!\\left(j\\frac{\\omega}{a}\\right)', label:'Proof for $a<0$',
      note:'With $\\tau=at$ and $a<0$, $t\\to-\\infty$ sends $\\tau\\to+\\infty$. Swapping the limits costs one minus sign, and $-1/a=1/|a|$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Counting the flip twice', html:'Reversing the limits <b>and</b> writing an extra $-1$ applies the correction twice. The result, $-\\tfrac{1}{|a|}X(j\\omega/a)$, is wrong. Do the flip once.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(-t)\\;\\longleftrightarrow\\;X(-j\\omega)', label:'Time reversal, $a=-1$'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-t}u(t)\\leftrightarrow1/(1+j\\omega)$.<div class="nsep"></div>What is the transform of $x(-t)$?',
        ask:{key:'m5-props-scale-b', choices:['$1/(1-j\\omega)$','$-1/(1+j\\omega)$','$1/(1+j\\omega)$'], answer:0,
          why:'$X(-j\\omega)=1/(1-j\\omega)$.'}}]}
  ]}
]},

{ id:'m5-props-scale-ex', module:'M5', nav:'Worked example · scaling a band', title:'Time-Scaling Example', src:'p. 53',
  objective:'Apply the scaling property in both directions and check heights and widths.',
  keywords:'worked example scaling band height width area invariant 2 and 0.5', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 53'},
  {t:'title', text:'Time-Scaling Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(0.5t)$: height $2$ on $|\\omega|<\\pi$','$x(t)$: height $1$ on $|\\omega|<2\\pi$','$x(2t)$: height $0.5$ on $|\\omega|<4\\pi$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-16,16],yr:[-0.3,2.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,0.5,1,2]});
      [[PI,2,C.in,1-cl(f)],[2*PI,1,C.mid,cl(f)*(1-cl(f-1))],[4*PI,0.5,C.out,cl(f-1)]].forEach(([W,H,col,o])=>fade(a,o,()=>{
        a.area(w=>Math.abs(w)<W?H:0,-16,16,{color:col+'29',n:900});
        a.curve(w=>Math.abs(w)<W?H:0,{color:col,n:3000}); }));
      return a.svg(); },
      caption:'The three spectra. Each shaded area is $4\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=1$ on $|\\omega|<2\\pi$ and $0$ elsewhere.<div class="nsep"></div>Where is the band edge of the transform of $x(2t)$?',
      ask:{key:'m5-props-scale-ex', choices:['$4\\pi$','$\\pi$','$2\\pi$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Apply $x(at)\\leftrightarrow\\tfrac{1}{|a|}X(j\\omega/a)$ once for $a=0.5$ and once for $a=2$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\begin{aligned}x(0.5t)&\\;\\longleftrightarrow\\;2X(j2\\omega)=2\\ \\text{on}\\ |\\omega|<\\pi\\\\x(2t)&\\;\\longleftrightarrow\\;0.5X(j\\omega/2)=0.5\\ \\text{on}\\ |\\omega|<4\\pi\\end{aligned}', label:'Solution',
        note:'$|2\\omega|<2\\pi$ is $|\\omega|<\\pi$, and $|\\omega/2|<2\\pi$ is $|\\omega|<4\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'The areas are $2\\cdot2\\pi$, $1\\cdot4\\pi$ and $0.5\\cdot8\\pi$, all $4\\pi$. Since $\\int X\\,\\d\\omega=2\\pi x(0)$, scaling time leaves $x(0)$ alone.'}]}
  ]}
]},

{ id:'m5-duality', module:'M5', nav:'Duality', title:'Duality', src:'p. 54',
  objective:'State and prove duality with the correct argument on the right-hand side.',
  keywords:'duality X(t) 2 pi x(-w) proof renaming variables symmetry of the pair', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 54'},
  {t:'title', text:'Duality'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'box',x:20,y:60,w:170,h:66,label:'x(t)',tex:true,fs:21,color:C.in},
      {t:'box',x:370,y:60,w:170,h:66,label:'X(j\\omega)',tex:true,fs:21,color:C.mid},
      {t:'arrow',x1:190,y1:93,x2:370,y2:93,label:'\\mathcal{F}',tex:true,color:C.coral},
      {t:'box',x:20,y:250,w:170,h:66,label:'X(t)',tex:true,fs:21,color:C.mid},
      {t:'box',x:370,y:250,w:170,h:66,label:'2\\pi x(-\\omega)',tex:true,fs:21,color:C.in},
      {t:'arrow',x1:190,y1:283,x2:370,y2:283,label:'\\mathcal{F}',tex:true,color:C.coral},
      {t:'line',d:'M105,126 L105,250',color:C.slate},
      {t:'line',d:'M455,126 L455,250',color:C.slate},
      {t:'text',x:118,y:194,anchor:'start',label:'\\text{read as a signal}',tex:true,fs:15,color:C.slate},
      {t:'text',x:442,y:194,anchor:'end',label:'\\text{reversed, times }2\\pi',tex:true,fs:15,color:C.slate}
    ]}), caption:'Read the first pair a second time, with the roles of the domains exchanged.'}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\;\\longleftrightarrow\\;X(j\\omega)\\quad\\Longrightarrow\\quad X(t)\\;\\longleftrightarrow\\;2\\pi\\,x(-\\omega)', label:'Duality',
      note:'The argument is $-\\omega$, a real number, not $-j\\omega$: $x$ names a signal.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'2\\pi\\,x(\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{j\\omega t}\\,\\d t\\;\\;\\Longrightarrow\\;\\;2\\pi\\,x(-\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{-j\\omega t}\\,\\d t', label:'Proof',
        note:'Swap the names $t$ and $\\omega$ in the synthesis equation, then replace $\\omega$ by $-\\omega$. The right side is the analysis integral of $X(t)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What duality is for', html:'Every pair gives a second pair at no cost. The time shift and the frequency shift are one rule read twice.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$e^{-|t|}\\leftrightarrow\\dfrac{2}{1+\\omega^{2}}$.<div class="nsep"></div>What is the transform of $\\dfrac{2}{1+t^{2}}$?',
        ask:{key:'m5-duality', choices:['$2\\pi e^{-|\\omega|}$','$e^{-|\\omega|}$','$2\\pi e^{-\\omega}$'], answer:0,
          why:'Duality gives $2\\pi x(-\\omega)=2\\pi e^{-|\\omega|}$.'}}]}
  ]}
]},

{ id:'m5-duality-ex', module:'M5', nav:'Worked example · duality', title:'Duality Example', src:'pp. 54–55',
  objective:'Use duality on the rectangular pulse and confirm the result independently.',
  keywords:'worked example duality rectangle sinc both ways 2 pi band check', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 54–55'},
  {t:'title', text:'Duality Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-6,6],yr:[-0.6,7.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'X_2(j\\omega)',yticksOverride:[0,3.1416,6.2832],ytickfmt:v=>v.toFixed(2)});
      a.area(w=>Math.abs(w)<PI?2*PI:0,-6,6,{color:C.out+'29',n:900});
      a.curve(w=>Math.abs(w)<PI?2*PI:0,{color:C.out,n:3000});
      return a.svg(); },
      caption:'The transform of $x_2(t)=2\\sin(Wt)/t$ for $W=\\pi$: a band of height $2\\pi$ on $|\\omega|<W$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x_1(t)=1$ on $|t|<W$, so $X_1(j\\omega)=2\\sin(W\\omega)/\\omega$.<div class="nsep"></div>What height does the transform of $x_2(t)=2\\sin(Wt)/t$ have?',
      ask:{key:'m5-duality-ex', choices:['$2\\pi$','$1$','$2W$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'X_2(j\\omega)=2\\pi\\,x_1(-\\omega)=\\begin{cases}2\\pi,&|\\omega|<W\\\\0,&|\\omega|>W\\end{cases}', label:'Route 1 · duality',
        note:'$x_2$ is $X_1$ read in time. $x_1$ is even, so the reversal changes nothing.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\frac{1}{2\\pi}\\int_{-W}^{W}2\\pi\\,e^{j\\omega t}\\,\\d\\omega=\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{2\\sin(Wt)}{t}', label:'Route 2 · synthesis',
        note:'The band returns $x_2$, so the pair holds without duality.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$X_2(j0)=2\\pi$ for every $W$. In time, $x_2(0)=2W$ by l’Hôpital. With $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, $x_2(t)=2W\\operatorname{sinc}(Wt)$.'}]}
  ]}
]},

{ id:'m5-parseval', module:'M5', nav:'Parseval', title:'Parseval’s Relation', src:'p. 55',
  objective:'Prove Parseval and fix the normalisation the energy is measured under.',
  keywords:'parseval energy spectral density R = 1 ohm normalised proof exchange of integrals', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 55'},
  {t:'title', text:'Parseval’s Relation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-8,8],yr:[-0.1,1.25],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'|X(j\\omega)|^{2}',yticksOverride:[0,0.5,1]});
      a.area(w=>1/(1+w*w),-8,8,{color:C.mid+'29',n:900});
      a.curve(w=>1/(1+w*w),{color:C.mid,n:2400});
      return a.svg(); },
      caption:'The energy spectral density of $e^{-t}u(t)$, $|X(j\\omega)|^{2}=1/(1+\\omega^{2})$. The energy is its area divided by $2\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Normalised energy', html:'Every signal is a voltage across $R=1\\,\\Omega$. Power is $|x(t)|^{2}$ and energy is its integral, in joules.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'E_{\\infty}=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega', label:'Parseval’s relation',
        note:'The $1/2\\pi$ sits on the frequency side, as in the synthesis equation.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\int|x|^{2}\\d t=\\int x(t)\\left[\\frac{1}{2\\pi}\\int X^{*}(j\\omega)e^{-j\\omega t}\\d\\omega\\right]\\d t=\\frac{1}{2\\pi}\\int X^{*}(j\\omega)\\,X(j\\omega)\\,\\d\\omega', label:'Proof',
        note:'Write $|x|^{2}=x\\,x^{*}$, put in the conjugate of synthesis, and exchange the two integrals.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-2t}u(t)$.<div class="nsep"></div>What is its energy?',
        ask:{key:'m5-parseval', choices:['$0.25$ J','$0.5$ J','$1$ J'], answer:0,
          why:'$\\int_0^\\infty e^{-4t}\\,\\d t=1/4$ J, in either domain.'}}]}
  ]}
]},

{ id:'m5-parseval-b', module:'M5', nav:'Parseval · both domains', title:'Energy in Both Domains', src:'p. 55',
  objective:'Compute the energy of the one-sided exponential in time and in frequency.',
  keywords:'parseval check one-sided exponential energy 1/(2a) arctan integral both domains', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 55'},
  {t:'title', text:'Energy in Both Domains'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-1,5],yr:[-0.1,1.25],xlabel:'t\\;(\\text{s})',ylabel:'|x(t)|^{2}',yticksOverride:[0,0.5,1]});
      a.area(t=>t<0?0:Math.exp(-2*t),0,5,{color:C.in+'29',n:900});
      a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.in,n:2400});
      return a.svg(); },
      caption:'$|x(t)|^{2}=e^{-2t}u(t)$ for $a=1$. Its area is $0.5$ J, the same as $\\tfrac{1}{2\\pi}$ times the area on the previous slide.'}
  ], right:[
    {t:'eq', tex:'E_{\\infty}=\\int_{0}^{\\infty}e^{-2at}\\,\\d t=\\left[\\frac{e^{-2at}}{-2a}\\right]_{0}^{\\infty}=\\frac{1}{2a}', label:'Time domain'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'E_{\\infty}=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{a^{2}+\\omega^{2}}=\\frac{1}{2\\pi}\\cdot\\frac{1}{a}\\int_{-\\infty}^{\\infty}\\frac{\\d u}{1+u^{2}}=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{a}=\\frac{1}{2a}', label:'Frequency domain',
        note:'Put $u=\\omega/a$, so $\\d\\omega=a\\,\\d u$. The last integral is $[\\tan^{-1}u]_{-\\infty}^{\\infty}=\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The step that is used', html:'The proof needs $|x|^{2}=x\\,x^{*}$, which is $x^{2}$ for a real signal. Without the $1/2\\pi$ the second route would give $2\\pi$ times too much.'}]}
  ]}
]},

{ id:'m5-parseval-ex', module:'M5', nav:'Worked example · Parseval', title:'Parseval’s Relation Example', src:'p. 55',
  objective:'Compute an energy in the frequency domain and confirm the peak in the time domain.',
  keywords:'worked example parseval two bands energy 10 joules peak 6 square the height', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 55'},
  {t:'title', text:'Parseval’s Relation Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X_3(j\\omega)$','$|X_3(j\\omega)|^{2}$: area $20\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-16,16],yr:[-0.4,4.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,1,2,4]});
      const X=w=>Math.abs(w)<2*PI?2:(Math.abs(w)<4*PI?1:0);
      fade(a,1-f,()=>{ a.area(X,-16,16,{color:C.mid+'29',n:1200}); a.curve(X,{color:C.mid,n:4000}); });
      fade(a,f,()=>{ a.area(w=>X(w)*X(w),-16,16,{color:C.out+'29',n:1200}); a.curve(w=>X(w)*X(w),{color:C.out,n:4000}); });
      return a.svg(); },
      caption:'The spectrum, then its square. The energy is the area under the square, divided by $2\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X_3(j\\omega)=2$ on $|\\omega|<2\\pi$, $1$ on $2\\pi<|\\omega|<4\\pi$, $0$ beyond, with $R=1\\,\\Omega$.<div class="nsep"></div>What is the energy of $x_3$?',
      ask:{key:'m5-parseval-ex', choices:['$10$ J','$6$ J','$20\\pi$ J'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'E_{\\infty}=\\frac{1}{2\\pi}\\Bigl[\\underbrace{1\\cdot2\\pi}_{-4\\pi<\\omega<-2\\pi}+\\underbrace{4\\cdot4\\pi}_{|\\omega|<2\\pi}+\\underbrace{1\\cdot2\\pi}_{2\\pi<\\omega<4\\pi}\\Bigr]', label:'Sum of rectangles'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'E_{\\infty}=\\frac{20\\pi}{2\\pi}=10\\ \\text{J}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Square the height', html:'Unsquared heights give $\\tfrac{1}{2\\pi}[2\\cdot4\\pi+1\\cdot4\\pi]=6$. That is not the energy; it is the peak $x_3(0)$.'}]}
  ]}
]},

realGallery({ id:'m5-real-props', nav:'Properties around us',
  title:'Properties Around Us', eyebrow:'Module 5 · Properties', src:'pp. 51–55',
  objective:'Recognise a delay, a change of speed and a difference in everyday signals.',
  keywords:'examples echo delay tape double speed scaling lagged series first difference properties',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-5,60],yr:[-1.1,1.4],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)\\;(\\text{Pa})',xstep:10}));
      a.curve(t=>t<0?0:Math.exp(-t/6)*Math.sin(2*PI*0.25*t),{color:C.in,n:3000});
      a.curve(t=>t<40?0:0.5*Math.exp(-(t-40)/6)*Math.sin(2*PI*0.25*(t-40)),{color:C.out,n:3000});
      return a.svg(); }, 'A click and its echo from a wall: $p(t)+0.5\\,p(t-40)$, with $t$ in ms.',
      [['in','$p(t)$'],['out','$0.5\\,p(t-40)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[0,20],yr:[-1.2,1.6],xlabel:'t\\;(\\text{ms})',ylabel:'s(t)',xstep:5}));
      a.curve(t=>Math.sin(2*PI*0.1*t),{color:C.in,dash:'9 6',n:1600});
      a.curve(t=>Math.sin(2*PI*0.2*t),{color:C.out,n:1600});
      return a.svg(); }, 'A recording played at double speed: $s(2t)$ with $s(t)=\\sin(2\\pi\\,0.1\\,t)$, $t$ in ms.',
      [['in','$s(t)$',true],['out','$s(2t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-1,30],yr:[0,560],xlabel:'n\\;(\\text{day})',ylabel:'\\text{count}',xstep:7}));
      a.stem(D(n=>500*Math.exp(-Math.pow((n-10)/4,2)),0,29),{color:C.in,r:2.6});
      a.stem(D(n=>n<7?0:100*Math.exp(-Math.pow((n-17)/4,2)),0,29),{color:C.out,r:2.6});
      return a.svg(); }, 'Hospital stays follow new cases one week later: $h[n]=0.2\\,c[n-7]$.',
      [['in','$c[n]$'],['out','$h[n]$']]],
    [()=>{ const d=[0,40,25,0,60,35,50,0,45,30,55,20,0,65,40], o=[]; d.reduce((s,v,i)=>(o[i]=s+v),0);
      const a=P.Axes(EXO({xr:[-0.5,15],yr:[0,560],xlabel:'n\\;(\\text{day})',ylabel:'\\text{km}',xstep:2}));
      a.stem(o.map((v,n)=>[n,v]),{color:C.in,r:2.6});
      a.stem(d.map((v,n)=>[n,v]),{color:C.out,r:2.6});
      return a.svg(); }, 'A car’s odometer reading $o[n]$ each evening, and the distance driven that day, $o[n]-o[n-1]$.',
      [['in','$o[n]$'],['out','$o[n]-o[n-1]$']], 'tl']
  ],
  notes:[
    {t:'note', kind:'def', head:'One operation, one rule', html:'A delay, a change of speed and a difference each act on the spectrum in a fixed way.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'With the rule known, one transform serves the whole family: every echo, every playback speed.'}
  ]}),

labScene({ id:'m5-lab-w', lab:'W', nav:'Transform Properties', title:'One Operation, One Spectral Rule', src:'pp. 51–55',
  objective:'Apply one operation to a pulse and read what it does to the magnitude and the phase of the transform.',
  keywords:'laboratory properties time shift frequency shift scaling differentiation magnitude phase parseval' }),

codeScene({ id:'m5-code-props', nav:'Properties', title:'Properties in Code', src:'pp. 51–55', eyebrow:'Properties in code',
  objective:'Check transform properties numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python properties shift scaling duality parseval energy run' }),


/* ======================================================= 5.5 convolution and multiplication */

{ id:'m5-conv', module:'M5', nav:'Convolution property', title:'Convolution Property', src:'p. 56',
  objective:'State and prove the convolution property with one consistent set of symbols.',
  keywords:'convolution property multiplication frequency response LTI proof premise symbols', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 56'},
  {t:'title', text:'Convolution Property'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'arrow',x1:20,y1:100,x2:200,y2:100},
      {t:'box',x:200,y:66,w:160,h:68,label:'h(t)',tex:true,fs:21,color:C.h},
      {t:'arrow',x1:360,y1:100,x2:540,y2:100},
      {t:'text',x:110,y:82,label:'x(t)',tex:true,fs:18,color:C.in},
      {t:'text',x:450,y:82,label:'x(t)*h(t)',tex:true,fs:18,color:C.out},
      {t:'arrow',x1:20,y1:270,x2:200,y2:270},
      {t:'box',x:200,y:236,w:160,h:68,label:'H(j\\omega)',tex:true,fs:21,color:C.h},
      {t:'arrow',x1:360,y1:270,x2:540,y2:270},
      {t:'text',x:110,y:252,label:'X(j\\omega)',tex:true,fs:18,color:C.in},
      {t:'text',x:450,y:252,label:'X(j\\omega)H(j\\omega)',tex:true,fs:18,color:C.out},
      {t:'text',x:280,y:190,label:'\\text{the same system, seen twice}',tex:true,fs:15,color:C.slate}
    ]}), caption:'One system in time and the same system in frequency. Only the operation between input and output changes.'}
  ], right:[
    {t:'eq', key:true, tex:'y(t)=x(t)*h(t)\\;\\longleftrightarrow\\;Y(j\\omega)=X(j\\omega)\\,H(j\\omega)', label:'Convolution property',
      note:'$x$ is the input, $h$ the impulse response, $y$ the output. {{sym:Hjw|$H(j\\omega)$}} is the frequency response of the system.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'Y(j\\omega)=\\int x(\\tau)\\left[\\int h(t-\\tau)e^{-j\\omega t}\\d t\\right]\\d\\tau=\\int x(\\tau)\\,e^{-j\\omega\\tau}H(j\\omega)\\,\\d\\tau=X(j\\omega)H(j\\omega)', label:'Proof',
        note:'Put the convolution inside the analysis integral and exchange the order. The inner bracket is the time shift applied to $h$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Keep the letters apart', html:'Three signals are in play: input $x$, impulse response $h$, output $y$. Using $y$ for a free second signal and for the output makes the statement refer to itself.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(j0)=4$ and $H(j0)=0.5$.<div class="nsep"></div>What is $Y(j0)$?',
        ask:{key:'m5-conv', choices:['$2$','$4.5$','$8$'], answer:0,
          why:'$Y(j0)=X(j0)H(j0)=4\\cdot0.5=2$.'}}]}
  ]}
]},

{ id:'m5-systems', module:'M5', nav:'Three simple systems', title:'Delay, Differentiator, Integrator', src:'p. 56',
  objective:'Read the frequency response of a delay, a differentiator and an integrator from the properties.',
  keywords:'frequency response delay differentiator integrator e^{-j omega t0} j omega 1 over j omega magnitude high frequencies noise', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Convolution and multiplication', src:'p. 56'},
  {t:'title', text:'Delay, Differentiator, Integrator'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['delay: $|H(j\\omega)|=1$','differentiator: $|H(j\\omega)|=|\\omega|$','integrator: $|H(j\\omega)|=1/|\\omega|$ and $\\pi\\delta(\\omega)$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-4,4],yr:[-0.2,4.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'|H(j\\omega)|',yticksOverride:[1,2,3,4]});
      const o=k=>1-cl(Math.abs(f-k));
      fade(a,o(0),()=>a.curve(()=>1,{color:C.h,n:400}));
      fade(a,o(1),()=>a.curve(w=>Math.abs(w),{color:C.h,n:1200}));
      fade(a,o(2),()=>{ a.curve(w=>Math.abs(w)<0.02?NaN:1/Math.abs(w),{color:C.h,n:4000});
        a.impulse(0,PI,{color:C.h,label:false}); });
      return a.svg(); },
      caption:'The delay passes every frequency at gain $1$. The differentiator lifts high frequencies; the integrator lifts low ones and has an impulse of weight $\\pi$ at $\\omega=0$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}y(t)&=x(t-t_0)&&\\longleftrightarrow\\quad H(j\\omega)=e^{-j\\omega t_0}\\\\ y(t)&=\\frac{\\d x}{\\d t}&&\\longleftrightarrow\\quad H(j\\omega)=j\\omega\\\\ y(t)&=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau&&\\longleftrightarrow\\quad H(j\\omega)=\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\end{aligned}', label:'Read H from a property',
      note:'Each system is one operation of this module: a shift, a derivative, a running integral. Its property gives $Y=HX$ directly.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'What the magnitude says', html:'A delay changes only the phase, by $-\\omega t_0$. A differentiator multiplies each frequency by $|\\omega|$, so it also amplifies high-frequency noise. An integrator does the opposite.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(2t)$ is the input of the differentiator.<div class="nsep"></div>What is the amplitude of the output?',
        ask:{key:'m5-systems', choices:['$2$','$1$','$0.5$'], answer:0,
          why:'$|H(j2)|=|j2|=2$; the output is $-2\\sin(2t)$.'}}]}
  ]}
]},

{ id:'m5-conv-ex', module:'M5', nav:'Worked example · two exponentials', title:'Convolution of Two Exponentials', src:'p. 57',
  objective:'Solve an LTI problem by transform and partial fractions, and check the peak.',
  keywords:'worked example LTI two exponentials partial fractions cover-up peak log 2 quarter', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 57'},
  {t:'title', text:'Convolution of Two Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$ and $h(t)$','$y(t)=x(t)*h(t)$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-0.9,6],yr:[-0.1,1.2],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.25,0.5,1],ytickfmt:v=>String(v)});
      fade(a,1-f,()=>{ a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,n:2000});
        a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.h,n:2000}); });
      fade(a,f,()=>{ a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'9 6',n:2000});
        a.curve(t=>t<0?0:Math.exp(-t)-Math.exp(-2*t),{color:C.out,n:2000});
        a.point(Math.log(2),0.25,{color:C.coral,r:4.2}); });
      return a.svg(); },
      caption:'For $a=1$, $b=2$. The output starts at $0$ and peaks at $0.25$ when $t=\\ln2\\approx0.693$ s.'},
    {t:'legend', items:[['in','$x(t)$'],['h','$h(t)$'],['out','$y(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{-at}u(t)$ and $h(t)=e^{-bt}u(t)$, with $a,b>0$ and $a\\neq b$.<div class="nsep"></div>What is $y(0)$?',
      ask:{key:'m5-conv-ex', choices:['$0$','$1$','$1/(a+b)$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Multiply: $Y=\\dfrac{1}{(a+j\\omega)(b+j\\omega)}=\\dfrac{A}{a+j\\omega}+\\dfrac{B}{b+j\\omega}$.</li><li>Cover-up: multiply by $(a+j\\omega)$ and put $j\\omega=-a$. So $A=\\dfrac{1}{b-a}$ and $B=-A$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'y(t)=\\frac{e^{-at}-e^{-bt}}{b-a}\\,u(t)', label:'Solution',
        note:'Each term inverts with $e^{-ct}u(t)\\leftrightarrow1/(c+j\\omega)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$y(0)=0$: two causal signals do not overlap at $t=0$. For $a=1$, $b=2$, $y\'(t)=0$ at $t=\\ln2$, where $y=\\tfrac12-\\tfrac14=0.25$.'}]}
  ]}
]},

{ id:'m5-conv-ex-b', module:'M5', nav:'Two exponentials · the spectra', title:'Spectra of the Two Exponentials', src:'p. 57',
  objective:'Read the convolution property as a product of magnitudes at each frequency.',
  keywords:'magnitude product |X| |H| |Y| DC value 0.5 frequency by frequency check', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 57'},
  {t:'title', text:'Spectra of the Two Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-6,6],yr:[-0.1,1.25],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI/2,ylabel:'\\text{magnitude}',yticksOverride:[0,0.5,1]});
      a.curve(w=>1/Math.hypot(1,w),{color:C.in,n:1600});
      a.curve(w=>1/Math.hypot(2,w),{color:C.h,n:1600});
      a.curve(w=>1/(Math.hypot(1,w)*Math.hypot(2,w)),{color:C.out,n:1600});
      return a.svg(); },
      caption:'At every $\\omega$ the output magnitude is the product of the other two. At $\\omega=0$: $1\\times0.5=0.5$.'},
    {t:'legend', items:[['in','$|X(j\\omega)|$'],['h','$|H(j\\omega)|$'],['out','$|Y(j\\omega)|$']]}
  ], right:[
    {t:'eq', tex:'|X(j\\omega)|=\\frac{1}{\\sqrt{1+\\omega^{2}}},\\qquad |H(j\\omega)|=\\frac{1}{\\sqrt{4+\\omega^{2}}}', label:'For $a=1$, $b=2$'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'|Y(j\\omega)|=|X(j\\omega)|\\,|H(j\\omega)|=\\frac{1}{\\sqrt{(1+\\omega^{2})(4+\\omega^{2})}}', label:'The product',
        note:'The phases add in the same way: $\\angle Y=\\angle X+\\angle H$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$a=1$ and $b=2$.<div class="nsep"></div>What is $|Y(j1)|$?',
        ask:{key:'m5-conv-ex-b', choices:['$1/\\sqrt{10}\\approx0.316$','$0.5$','$1/\\sqrt{2}\\approx0.707$'], answer:0,
          why:'$|X(j1)|=1/\\sqrt2$ and $|H(j1)|=1/\\sqrt5$, so the product is $1/\\sqrt{10}$.'}}]}
  ]}
]},

{ id:'m5-conv-lpf', module:'M5', nav:'Worked example · filters in cascade', title:'Cascade of Ideal Low-Pass Filters', src:'p. 58',
  objective:'Multiply two ideal bands and read the three time-domain peaks.',
  keywords:'worked example ideal low pass cascade narrower band wins peaks 8 6 12', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 58'},
  {t:'title', text:'Cascade of Ideal Low-Pass Filters'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$ and $H(j\\omega)$','$Y(j\\omega)=X(j\\omega)H(j\\omega)$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-16,16],yr:[-0.6,7.2],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,2,3,6]});
      fade(a,1-f,()=>{ a.curve(w=>Math.abs(w)<=4*PI?2:0,{color:C.in,n:3000});
        a.curve(w=>Math.abs(w)<=2*PI?3:0,{color:C.h,n:3000,dash:'9 6'}); });
      fade(a,f,()=>{ a.area(w=>Math.abs(w)<=2*PI?6:0,-16,16,{color:C.out+'29',n:900});
        a.curve(w=>Math.abs(w)<=2*PI?6:0,{color:C.out,n:3000}); });
      return a.svg(); },
      caption:'Outside $|\\omega|\\le2\\pi$ the system is zero, so the product is zero there. Inside it is $2\\times3=6$.'},
    {t:'legend', items:[['in','$X(j\\omega)$'],['h','$H(j\\omega)$',true],['out','$Y(j\\omega)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=2$ on $|\\omega|\\le4\\pi$ and $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$, both zero beyond.<div class="nsep"></div>What height does $Y(j\\omega)$ have?',
      ask:{key:'m5-conv-lpf', choices:['$6$','$5$','$3$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Multiply the spectra frequency by frequency, then invert with the pair $A$ on $|\\omega|<W$ $\\leftrightarrow A\\sin(Wt)/(\\pi t)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Y(j\\omega)=\\begin{cases}6,&|\\omega|\\le2\\pi\\\\0,&|\\omega|>2\\pi\\end{cases}\\qquad y(t)=\\frac{6\\sin(2\\pi t)}{\\pi t}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'Each peak is its band area over $2\\pi$: $x(0)=2\\cdot8\\pi/2\\pi=8$, $h(0)=6$, $y(0)=6\\cdot4\\pi/2\\pi=12$. The output is the tallest signal, because the peak counts area, not height.'}]}
  ]}
]},

{ id:'m5-mult', module:'M5', nav:'Multiplication property', title:'Multiplication Property', src:'p. 58',
  objective:'State the dual of the convolution property and place its 1/2π.',
  keywords:'multiplication property convolution in frequency 1/2 pi duality windowing bandwidth adds', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 58'},
  {t:'title', text:'Multiplication Property'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)=Y(j\\omega)$: a band of half-width $2\\pi$','$Z(j\\omega)=\\tfrac{1}{2\\pi}X*Y$: a triangle']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-16,16],yr:[-0.3,2.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\text{spectrum}',yticksOverride:[0,1,2]});
      const tri=w=>Math.abs(w)<4*PI ? 2*(1-Math.abs(w)/(4*PI)) : 0;
      fade(a,1-f,()=>{ a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,n:3000}); });
      fade(a,f,()=>{ a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,dash:'9 6',n:3000});
        a.area(tri,-16,16,{color:C.out+'29',n:900}); a.curve(tri,{color:C.out,n:2400}); });
      return a.svg(); },
      caption:'Two bands of half-width $2\\pi$ convolve to a triangle of half-width $4\\pi$ and apex $2$.'}
  ], right:[
    {t:'eq', key:true, tex:'z(t)=x(t)\\,y(t)\\;\\longleftrightarrow\\;Z(j\\omega)=\\frac{1}{2\\pi}\\,X(j\\omega)*Y(j\\omega)', label:'Multiplication property',
      note:'The convolution is over frequency: $X*Y=\\int X(j\\theta)\\,Y\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The $1/2\\pi$ belongs here', html:'Convolution in time has no factor; convolution in frequency has $1/2\\pi$. Without it the shape is right and the height is $2\\pi$ times too large.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What it models', html:'Switching, modulation by a carrier and windowing are all products in time. Widths add: bands of half-widths $B_1$ and $B_2$ give half-width $B_1+B_2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X$ has half-width $\\pi$ and $Y$ has half-width $3\\pi$.<div class="nsep"></div>What half-width does the spectrum of $x(t)y(t)$ have?',
        ask:{key:'m5-mult', choices:['$4\\pi$','$3\\pi$','$2\\pi$'], answer:0,
          why:'Convolution adds the half-widths: $\\pi+3\\pi=4\\pi$.'}}]}
  ]}
]},

{ id:'m5-am', module:'M5', nav:'Amplitude modulation', title:'Amplitude Modulation', src:'p. 59',
  objective:'Derive the DSB-SC spectrum and name the two copies.',
  keywords:'amplitude modulation DSB-SC carrier sidebands two copies half height cosine', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Application', src:'p. 59'},
  {t:'title', text:'Amplitude Modulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$','$Z(j\\omega)$: two copies at half height']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-20,20],yr:[-0.2,1.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'\\text{spectrum}',yticksOverride:[0,0.5,1]});
      const tri=(w,c)=>Math.max(0,1-Math.abs(w-c)/(2*PI));
      fade(a,1-f,()=>{ a.area(w=>tri(w,0),-20,20,{color:C.in+'29',n:900}); a.curve(w=>tri(w,0),{color:C.in,n:2400}); });
      fade(a,f,()=>{ const z=w=>0.5*tri(w,4*PI)+0.5*tri(w,-4*PI);
        a.area(z,-20,20,{color:C.out+'29',n:900}); a.curve(z,{color:C.out,n:2400});
        a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err}); });
      return a.svg(); },
      caption:'A triangular spectrum of half-width $2\\pi$, then after multiplication by $\\cos(4\\pi t)$. The dashed lines mark $\\pm\\omega_c$.'}
  ], right:[
    {t:'eq', tex:'\\cos(\\omega_ct)\\;\\longleftrightarrow\\;\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)', label:'The carrier',
      note:'{{sym:wc|$\\omega_c$}} is the carrier frequency. Two impulses mean two copies.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)\\cos(\\omega_ct)\\;\\longleftrightarrow\\;\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)', label:'Double-sideband suppressed carrier',
        note:'The $1/2\\pi$ of the property and the $\\pi$ of each impulse give the $\\tfrac12$ on each copy.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Two copies, not one moved spectrum', html:'The spectrum is duplicated, not moved: one copy at $+\\omega_c$ and one at $-\\omega_c$, each at half height. “The signal moves up to the carrier” loses the second copy and the factor $\\tfrac12$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$X(j0)=1$ and the carrier is $\\cos(10\\pi t)$.<div class="nsep"></div>What is $Z(j10\\pi)$?',
        ask:{key:'m5-am', choices:['$0.5$','$1$','$0.25$'], answer:0,
          why:'The copy centred at $10\\pi$ is $\\tfrac12X$, so its peak is $\\tfrac12X(j0)=0.5$.'}}]}
  ]}
]},

{ id:'m5-am-b', module:'M5', nav:'Worked example · a modulated cosine', title:'Modulating a Cosine', src:'p. 59',
  objective:'Modulate a cosine by two routes and locate the sidebands.',
  keywords:'worked example modulated cosine sidebands product to sum 3 pi 5 pi suppressed carrier impulses', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 59'},
  {t:'title', text:'Modulating a Cosine'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$: weight $\\pi$ at $\\pm\\pi$','$Z(j\\omega)$: weight $\\pi/2$ at $\\pm3\\pi$, $\\pm5\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-20,20],yr:[-0.35,4.0],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'\\text{spectrum}',yticksOverride:[1.5708,3.1416],ytickfmt:v=>v.toFixed(2)});
      fade(a,1-f,()=>{ [PI,-PI].forEach(w=>a.impulse(w,PI,{color:C.in,label:false})); });
      fade(a,f,()=>{ [3*PI,5*PI,-3*PI,-5*PI].forEach(w=>a.impulse(w,PI/2,{color:C.out,label:false}));
        a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err}); });
      return a.svg(); },
      caption:'Before and after modulation. Nothing sits at $\\pm\\omega_c=\\pm4\\pi$, the dashed lines.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos(\\pi t)$ and the carrier is $\\cos(4\\pi t)$.<div class="nsep"></div>Where are the impulses of $Z(j\\omega)$ for $\\omega>0$?',
      ask:{key:'m5-am-b', choices:['$3\\pi$ and $5\\pi$','$4\\pi$','$\\pi$ and $4\\pi$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\cos(\\pi t)\\cos(4\\pi t)=\\tfrac12\\cos(3\\pi t)+\\tfrac12\\cos(5\\pi t)', label:'Route 1 · product to sum',
        note:'Each $\\tfrac12\\cos$ gives impulses of weight $\\tfrac{\\pi}{2}$ at its $\\pm$ frequency.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=\\tfrac{\\pi}{2}\\bigl[\\delta(\\omega\\mp3\\pi)+\\delta(\\omega\\mp5\\pi)\\bigr]', label:'Route 2 · the property',
        note:'Halve the two impulses of $X$ and centre copies at $\\pm4\\pi$: positions $4\\pi\\pm\\pi$ and $-4\\pi\\pm\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'Both routes give four impulses of weight $\\pi/2\\approx1.5708$. The carrier frequency itself carries nothing: only the sidebands are sent.'}]}
  ]}
]},

{ id:'m5-am-sinc', module:'M5', nav:'Modulating a band', title:'Modulation of a Band-Limited Signal', src:'p. 60',
  objective:'Move a band to a carrier and read the band edges.',
  keywords:'modulation band limited sinc copies band edges 2 pi 6 pi half height demodulation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 60'},
  {t:'title', text:'Modulation of a Band-Limited Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$z(t)$ in time','$Z(j\\omega)$: two bands of height $0.5$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-1.6,1.6],yr:[-2.6,2.6],xlabel:'t\\;(\\text{s})',ylabel:'z(t)',yticksOverride:[-2,2]});
        fade(a,1-2*f,()=>{ a.curve(t=>lpfTime(t,2*PI),{color:C.in,dash:'9 6',n:2400});
          a.curve(t=>-lpfTime(t,2*PI),{color:C.in,dash:'9 6',n:2400});
          a.curve(t=>lpfTime(t,2*PI)*Math.cos(4*PI*t),{color:C.out,n:6000}); });
        return a.svg(); }
      const a=AX({xr:[-26,26],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'Z(j\\omega)',yticksOverride:[0.5,1]});
      fade(a,2*f-1,()=>{ const z=w=>((Math.abs(w-4*PI)<2*PI)?0.5:0)+((Math.abs(w+4*PI)<2*PI)?0.5:0);
        a.area(z,-26,26,{color:C.out+'29',n:900}); a.curve(z,{color:C.out,n:4000});
        a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err}); });
      return a.svg(); },
      caption:'The carrier fills an envelope $\\pm x(t)$. In frequency: two copies on $2\\pi\\le|\\omega|\\le6\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, so $X(j\\omega)=1$ on $|\\omega|<2\\pi$, and $z(t)=x(t)\\cos(4\\pi t)$.<div class="nsep"></div>Where is the upper band of $Z(j\\omega)$?',
      ask:{key:'m5-am-sinc', choices:['$2\\pi\\le\\omega\\le6\\pi$','$4\\pi\\le\\omega\\le6\\pi$','$|\\omega|\\le6\\pi$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Two half-height copies of $X$, centred at $+4\\pi$ and $-4\\pi$. The upper one runs from $4\\pi-2\\pi$ to $4\\pi+2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=0.5\\quad\\text{on}\\quad 2\\pi\\le|\\omega|\\le6\\pi,\\qquad 0\\ \\text{elsewhere}', label:'Solution',
        note:'Each copy is $4\\pi$ wide, as wide as $X$. Together they occupy $8\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'Multiply $z$ by the carrier again: one pair of copies returns to the origin and adds to $X/2$. A low-pass filter on $|\\omega|<2\\pi$ recovers $x$, up to the factor $\\tfrac12$.'}]}
  ]}
]},

{ id:'m5-am-overlap', module:'M5', nav:'Spectral overlap in modulation', title:'Spectral Overlap in Modulation', src:'p. 60',
  objective:'Work the case where the two copies meet, and separate replication from overlap.',
  keywords:'overlap copies collide carrier too low baseband adds 0.5 plus 0.5 sampling preview', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 60'},
  {t:'title', text:'Spectral Overlap in Modulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$','the two copies','their sum $Z(j\\omega)$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-20,20],yr:[-0.15,1.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'\\text{spectrum}',yticksOverride:[0.5,1]});
      const B=w=>(Math.abs(w)>=PI&&Math.abs(w)<=3*PI)?1:0;
      const up=w=>0.5*B(w-2*PI), dn=w=>0.5*B(w+2*PI);
      fade(a,1-cl(f),()=>{ a.area(B,-20,20,{color:C.in+'29',n:1200}); a.curve(B,{color:C.in,n:4000}); });
      fade(a,cl(f)*(1-cl(f-1)),()=>{ a.curve(up,{color:C.mid,n:4000}); a.curve(dn,{color:C.h,n:4000,dash:'9 6'}); });
      fade(a,cl(f-1),()=>{ const z=w=>up(w)+dn(w);
        a.area(z,-20,20,{color:C.out+'29',n:1200}); a.curve(z,{color:C.out,n:4000}); });
      return a.svg(); },
      caption:'Around the origin the two copies land on the same stretch and add: $0.5+0.5=1$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$X(j\\omega)=1$ on $\\pi\\le|\\omega|\\le3\\pi$, and $z(t)=x(t)\\cos(2\\pi t)$.<div class="nsep"></div>What is $Z(j0)$?',
      ask:{key:'m5-am-overlap', choices:['$1$','$0.5$','$0$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Shift $X$ up by $2\\pi$: material on $-\\pi\\le\\omega\\le\\pi$ and $3\\pi\\le\\omega\\le5\\pi$.</li><li>Shift it down by $2\\pi$: $-5\\pi\\le\\omega\\le-3\\pi$ and again $-\\pi\\le\\omega\\le\\pi$. Halve both.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=\\begin{cases}1,&|\\omega|\\le\\pi\\\\0.5,&3\\pi\\le|\\omega|\\le5\\pi\\\\0,&\\text{elsewhere}\\end{cases}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Copies and overlap are different events', html:'Copies appear at every carrier and do no harm. Overlap happens only when the carrier is low enough for the copies to meet; once added, they cannot be separated. Sampling raises the same question.'}]}
  ]}
]},

{ id:'m5-demod', module:'M5', nav:'Synchronous demodulation', title:'Synchronous Demodulation', src:'p. 60',
  objective:'Recover a modulated message by a second multiplication and a low-pass filter.',
  keywords:'demodulation synchronous receiver cos squared half message copies at 2 omega_c low-pass gain 2 cutoff carrier phase', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Convolution and multiplication', src:'p. 60'},
  {t:'title', text:'Synchronous Demodulation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$Z(j\\omega)$ at the receiver','$Y(j\\omega)$ after the second multiplication','the low-pass filter returns $X(j\\omega)$']},
      svg:v=>{
      const f=v?v.frame:0;
      const a=AX({xr:[-46,46],yr:[-0.15,2.4],xlabel:'\\omega\\;(\\text{rad/s})',xpi:6*PI,ylabel:'\\text{spectrum}',yticksOverride:[0.5,1,2]});
      const tri=(w,c,h)=>h*Math.max(0,1-Math.abs(w-c)/(2*PI));
      const Z=w=>tri(w,6*PI,0.5)+tri(w,-6*PI,0.5);
      const Y=w=>tri(w,0,0.5)+tri(w,12*PI,0.25)+tri(w,-12*PI,0.25);
      const o=k=>1-cl(Math.abs(f-k));
      fade(a,o(0),()=>{ a.area(Z,-46,46,{color:C.in+'29',n:1600}); a.curve(Z,{color:C.in,n:4000}); });
      fade(a,o(1),()=>{ a.area(Y,-46,46,{color:C.mid+'29',n:1600}); a.curve(Y,{color:C.mid,n:4000}); });
      fade(a,o(2),()=>{ a.curve(Y,{color:C.mid,dash:'9 6',n:4000});
        a.rect(-4*PI,0,4*PI,2,{stroke:C.h,dash:'7 5',width:2});
        a.area(w=>tri(w,0,1),-46,46,{color:C.out+'29',n:1600}); a.curve(w=>tri(w,0,1),{color:C.out,n:4000}); });
      return a.svg(); },
      caption:'Here $W=2\\pi$ and $\\omega_c=6\\pi$. The copies at $\\pm12\\pi$ lie far outside the filter, a dashed box of gain $2$ on $|\\omega|<4\\pi$.'}
  ], right:[
    {t:'eq', tex:'y(t)=z(t)\\cos(\\omega_c t)=x(t)\\cos^{2}(\\omega_c t)=\\tfrac12x(t)+\\tfrac12x(t)\\cos(2\\omega_c t)', label:'Multiply by the carrier again',
      note:'$z(t)=x(t)\\cos(\\omega_c t)$ arrives, with $X(j\\omega)=0$ for $|\\omega|>W$. Use $\\cos^{2}\\theta=\\tfrac12(1+\\cos2\\theta)$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'Y(j\\omega)=\\tfrac12X(j\\omega)+\\tfrac14X\\bigl(j(\\omega-2\\omega_c)\\bigr)+\\tfrac14X\\bigl(j(\\omega+2\\omega_c)\\bigr)', label:'In frequency',
        note:'A low-pass filter of gain $2$, with its cutoff between $W$ and $2\\omega_c-W$, keeps $\\tfrac12X$ and returns $x(t)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Why “synchronous”', html:'The receiver needs the carrier with the right phase. With $\\cos(\\omega_c t+\\phi)$ the filter returns $x(t)\\cos\\phi$, and at $\\phi=\\pi/2$ nothing is left.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$W=3\\pi$ and $\\omega_c=5\\pi$ rad/s.<div class="nsep"></div>What is the highest cutoff the low-pass filter may have?',
        ask:{key:'m5-demod', choices:['$7\\pi$','$5\\pi$','$3\\pi$'], answer:0,
          why:'The lower copy begins at $2\\omega_c-W=10\\pi-3\\pi=7\\pi$.'}}]}
  ]}
]},

{ id:'m5-tune', module:'M5', nav:'A tunable band-pass filter', title:'A Band-Pass Filter with a Tunable Centre', src:'p. 60',
  objective:'Build a band-pass filter whose centre moves with one oscillator frequency.',
  keywords:'tunable band-pass filter variable centre frequency complex exponential shift fixed low-pass oscillator dial', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Convolution and multiplication', src:'p. 60'},
  {t:'title', text:'A Band-Pass Filter with a Tunable Centre'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$X(j\\omega)$ and the band near $\\omega_c$','shifted down by $\\omega_c$: the fixed low-pass filter','shifted back: $Y(j\\omega)$']},
      svg:v=>{
      const f=v?v.frame:0;
      const wc=12, w0=3;
      const a=AX({xr:[-26,26],yr:[-0.15,1.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'\\text{spectrum}',yticksOverride:[0.5,1]});
      const X=w=>1/(1+Math.pow(w/10,2));
      const Wf=w=>X(w+wc);
      const Y=w=>Math.abs(w-wc)<w0?X(w):0;
      const o=k=>1-cl(Math.abs(f-k));
      fade(a,o(0),()=>{ a.area(X,wc-w0,wc+w0,{color:C.in+'29',n:600}); a.curve(X,{color:C.in,n:3000}); });
      fade(a,o(1),()=>{ a.area(Wf,-w0,w0,{color:C.mid+'29',n:600}); a.curve(Wf,{color:C.mid,n:3000});
        a.rect(-w0,0,w0,1.2,{stroke:C.h,dash:'7 5',width:2}); });
      fade(a,o(2),()=>{ a.curve(X,{color:C.in,dash:'9 6',n:3000});
        a.area(Y,-26,26,{color:C.out+'29',n:1600}); a.curve(Y,{color:C.out,n:4000}); });
      return a.svg(); },
      caption:'Here $\\omega_c=12$ and $\\omega_0=3$ rad/s. Only the part of $X$ on $9<\\omega<15$ reaches the output.'}
  ], right:[
    {t:'eq', tex:'x(t)\\;\\xrightarrow{\\;\\times\\,e^{-j\\omega_c t}\\;}\\;\\boxed{H_{\\text{lp}}}\\;\\xrightarrow{\\;\\times\\,e^{j\\omega_c t}\\;}\\;y(t)', label:'The system',
      note:'$H_{\\text{lp}}$ is a fixed ideal low-pass filter: gain $1$ for $|\\omega|<\\omega_0$. Only the oscillator frequency $\\omega_c$ is turned.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}&\\text{shift down:}&&X\\bigl(j(\\omega+\\omega_c)\\bigr)\\\\&\\text{filter:}&&H_{\\text{lp}}(j\\omega)\\,X\\bigl(j(\\omega+\\omega_c)\\bigr)\\\\&\\text{shift back:}&&Y(j\\omega)=H_{\\text{lp}}\\bigl(j(\\omega-\\omega_c)\\bigr)\\,X(j\\omega)\\end{aligned}', label:'Follow the spectrum',
        note:'Each multiplication by $e^{\\pm j\\omega_c t}$ is a frequency shift. Overall, $Y=X$ on $|\\omega-\\omega_c|<\\omega_0$ and $0$ elsewhere.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'One band only', html:'The band near $-\\omega_c$ is not passed. So $Y$ is not conjugate-symmetric, and $y(t)$ is complex even when $x(t)$ is real.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\omega_0=1$ rad/s, and the oscillator is set to $\\omega_c=8$ rad/s.<div class="nsep"></div>Which band passes?',
        ask:{key:'m5-tune', choices:['$7<\\omega<9$','$-1<\\omega<1$','$8<\\omega<9$'], answer:0,
          why:'The pass band is $|\\omega-\\omega_c|<\\omega_0$: centred at $8$, of width $2$.'}}]}
  ]}
]},

{ id:'m5-sinc2', module:'M5', nav:'Products of sincs', title:'Square of a Sinc', src:'p. 61',
  objective:'Convolve a band with itself and read the triangle and its peak.',
  keywords:'sinc squared triangle convolution of rectangles apex 2 peak 4 bandwidth doubles', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 61'},
  {t:'title', text:'Square of a Sinc'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$ and $x^{2}(t)$','$Z(j\\omega)$: apex $2$ on $|\\omega|\\le4\\pi$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-1.6,1.6],yr:[-0.8,4.6],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[2,4]});
        fade(a,1-2*f,()=>{ a.curve(t=>lpfTime(t,2*PI),{color:C.in,dash:'9 6',n:2400});
          a.curve(t=>Math.pow(lpfTime(t,2*PI),2),{color:C.out,n:2400}); });
        return a.svg(); }
      const a=AX({xr:[-16,16],yr:[-0.2,2.5],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'Z(j\\omega)',yticksOverride:[1,2]});
      fade(a,2*f-1,()=>{ const tri=w=>Math.abs(w)<4*PI?2*(1-Math.abs(w)/(4*PI)):0;
        a.area(tri,-16,16,{color:C.out+'29',n:900}); a.curve(tri,{color:C.out,n:2400}); });
      return a.svg(); },
      caption:'The signal peaks at $2$ and its square at $4$. The spectrum of the square is a triangle twice as wide as $X$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, so $X(j\\omega)=1$ on $|\\omega|<2\\pi$, and $z(t)=x^{2}(t)$.<div class="nsep"></div>What is $Z(j0)$?',
      ask:{key:'m5-sinc2', choices:['$2$','$4\\pi$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Multiplication in time is convolution in frequency, with $\\tfrac{1}{2\\pi}$. A band convolved with itself is a triangle of apex $2A^{2}\\omega_0=4\\pi$ on $|\\omega|\\le4\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=\\frac{1}{2\\pi}\\,(X*X)(j\\omega)=2\\left(1-\\frac{|\\omega|}{4\\pi}\\right),\\quad |\\omega|\\le4\\pi', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$z(0)=x(0)^{2}=4$. Through the transform, $\\tfrac{1}{2\\pi}\\int Z\\,\\d\\omega=\\tfrac{1}{2\\pi}\\cdot\\tfrac12\\cdot8\\pi\\cdot2=4$.'}]}
  ]}
]},

{ id:'m5-sinc2-b', module:'M5', nav:'Two bands of different width', title:'Product of Two Different Bands', src:'p. 61',
  objective:'Convolve two bands of different width and explain the flat top of the trapezoid.',
  keywords:'trapezoid unequal bandwidths flat top plateau convolution of rectangles peak 8', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 61'},
  {t:'title', text:'Product of Two Different Bands'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'w2', label:'$\\omega_2/\\pi$', min:2, max:5, step:0.5, v:4, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const w1=2*PI, w2=(v?v.w2:4)*PI, lo=Math.abs(w2-w1), hi=w1+w2;
      const trap=w=>{ const aw=Math.abs(w); if(aw<=lo) return 2; if(aw>=hi) return 0; return 2*(hi-aw)/(hi-lo); };
      const a=AX({xr:[-24,24],yr:[-0.2,2.6],xlabel:'\\omega\\;(\\text{rad/s})',xpi:2*PI,ylabel:'Z(j\\omega)',yticksOverride:[1,2]});
      a.area(trap,-24,24,{color:C.mid+'29',n:900}); a.curve(trap,{color:C.mid,n:3000});
      return a.svg(); },
      caption:'Bands of half-width $\\omega_1=2\\pi$ and $\\omega_2$. The top is flat on $|\\omega|\\le\\omega_2-\\omega_1$ and the edge is at $\\omega_1+\\omega_2$.'}
  ], right:[
    {t:'eq', key:true, tex:'Z(j\\omega)=\\frac{1}{2\\pi}(X_1*X_2)(j\\omega)=2\\ \\text{on}\\ |\\omega|\\le2\\pi,\\qquad 0\\ \\text{beyond}\\ 6\\pi', label:'Half-widths $2\\pi$ and $4\\pi$',
      note:'Both bands have height $1$. The flat height is $\\tfrac{1}{2\\pi}\\cdot4\\pi=2$, the full width of the narrower band over $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Why the top is flat', html:'While the narrow band slides wholly inside the wide one, the overlap area does not change. The flat part has half-width $\\omega_2-\\omega_1$ and becomes a point when the widths are equal: the triangle again.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x_1(0)=2$ and $x_2(0)=4$.<div class="nsep"></div>What is the peak of $x_1(t)x_2(t)$?',
        ask:{key:'m5-sinc2-b', choices:['$8$','$6$','$2$'], answer:0,
          why:'$x_1(0)x_2(0)=8$, which is also the area of the trapezoid over $2\\pi$.'}}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Reading the area', html:'The trapezoid has area $\\tfrac12(4\\pi+12\\pi)\\cdot2=16\\pi$, and $16\\pi/2\\pi=8$.'}]}
  ]}
]},

realGallery({ id:'m5-real-conv', nav:'Products and filters around us',
  title:'Products and Filters Around Us', eyebrow:'Module 5 · Convolution and multiplication', src:'pp. 56–61',
  objective:'Recognise convolution and multiplication in everyday signals.',
  keywords:'examples AM radio RC filter pulse window tone moving average temperature convolution multiplication',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,1.5],yr:[-1.8,2.2],xlabel:'t\\;(\\text{ms})',ylabel:'s(t)',xstep:0.5}));
      a.curve(t=>1+0.5*Math.cos(2*PI*t),{color:C.in,dash:'9 6',n:800});
      a.curve(t=>-(1+0.5*Math.cos(2*PI*t)),{color:C.in,dash:'9 6',n:800});
      a.curve(t=>(1+0.5*Math.cos(2*PI*t))*Math.cos(20*PI*t),{color:C.out,n:4000});
      return a.svg(); }, 'An AM broadcast: a $1$ kHz tone rides on a $10$ kHz carrier, $[1+0.5\\cos(2\\pi t)]\\cos(20\\pi t)$ with $t$ in ms.',
      [['in','envelope',true],['out','$s(t)$']]],
    [()=>{ const tau=0.3, k=1-Math.exp(-1/tau);
      const a=P.Axes(EXO({xr:[-0.3,3],yr:[-0.2,1.4],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:0.5}));
      a.curve(t=>(t>0&&t<1)?1:0,{color:C.in,dash:'9 6',n:2400});
      a.curve(t=>t<=0?0:(t<1?1-Math.exp(-t/tau):k*Math.exp(-(t-1)/tau)),{color:C.out,n:2400});
      return a.svg(); }, 'A $1$ ms pulse through an RC filter with $\\tau=0.3$ ms: the output is the pulse convolved with $h(t)$.',
      [['in','input',true],['out','output']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.02,0.14],yr:[-1.3,1.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.04}));
      a.curve(t=>(t>0&&t<0.1)?1:0,{color:C.in,dash:'9 6',n:2400});
      a.curve(t=>(t>0&&t<0.1)?Math.cos(2*PI*50*t):0,{color:C.out,n:4000});
      return a.svg(); }, 'A $50$ Hz tone recorded for $0.1$ s: the tone times a pulse. Its spectrum is a sinc at $\\pm50$ Hz.',
      [['in','window',true],['out','recording']]],
    [()=>{ const x=n=>15+5*Math.sin(2*PI*n/30)+2*Math.sin(2.7*n)+1.5*Math.cos(1.9*n);
      const y=n=>{ let s=0; for(let k=0;k<7;k++) s+=x(n-k); return s/7; };
      const a=P.Axes(EXO({xr:[-1,30],yr:[0,26],xlabel:'n\\;(\\text{day})',ylabel:'^{\\circ}\\text{C}',xstep:7}));
      a.stem(D(x,0,29),{color:C.in,r:2.4});
      a.curve(t=>y(Math.round(t)),{color:C.out,n:600});
      return a.svg(); }, 'Daily temperature and its $7$-day average, $y[n]=\\tfrac17\\sum_{k=0}^{6}x[n-k]$: a convolution with seven equal weights.',
      [['in','$x[n]$'],['out','$y[n]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'Two operations', html:'A filter convolves; a carrier or a window multiplies. Each becomes the other operation in frequency.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'A filter’s effect is a product of spectra, and a recording window smears every line into a sinc.'}
  ]}),

labScene({ id:'m5-lab-x', lab:'X', nav:'Products and Modulation', title:'Filtering and Modulation in Frequency', src:'pp. 56–61',
  objective:'Filter or modulate a signal and watch the product or the copies form in frequency.',
  keywords:'laboratory convolution multiplication filter modulation carrier copies overlap product' }),

codeScene({ id:'m5-code-conv', nav:'Convolution and multiplication', title:'Convolution and Modulation in Code', src:'pp. 56–61', eyebrow:'Convolution and modulation in code',
  objective:'Check the convolution and multiplication properties numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python convolution multiplication modulation sinc squared run' }),


/* ======================================================= 5.6 differential equations */

{ id:'m5-diffeq', module:'M5', nav:'Systems from a differential equation', title:'Frequency Response from a Differential Equation', src:'p. 62',
  objective:'Turn an LCCDE into H(jω) and state when H exists.',
  keywords:'differential equation LCCDE frequency response H(jw) rational stability absolutely integrable', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Systems', src:'p. 62'},
  {t:'title', text:'Frequency Response from a Differential Equation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>P.blocks({w:560,h:380,items:[
      {t:'box',x:20,y:50,w:210,h:70,label:'\\text{differential equation}',tex:true,fs:16},
      {t:'arrow',x1:230,y1:85,x2:330,y2:85,label:'\\mathcal{F}',tex:true,color:C.coral},
      {t:'box',x:330,y:50,w:210,h:70,label:'\\text{algebra in }j\\omega',tex:true,fs:16},
      {t:'box',x:330,y:250,w:210,h:70,label:'H(j\\omega)=\\tfrac{B(j\\omega)}{A(j\\omega)}',tex:true,fs:17,color:C.h},
      {t:'arrow',x1:435,y1:120,x2:435,y2:250,color:C.slate},
      {t:'box',x:20,y:250,w:210,h:70,label:'h(t)',tex:true,fs:19,color:C.h},
      {t:'arrow',x1:330,y1:285,x2:230,y2:285,color:C.slate},
      {t:'text',x:280,y:350,label:'\\text{partial fractions, then the table}',tex:true,fs:14,color:C.slate}
    ]}), caption:'The route of this section: transform the equation, read $H(j\\omega)$, and invert it term by term.'}
  ], right:[
    {t:'eq', tex:'\\sum_{k=0}^{N}a_k\\frac{\\d^{k}y(t)}{\\d t^{k}}=\\sum_{k=0}^{M}b_k\\frac{\\d^{k}x(t)}{\\d t^{k}}', label:'Linear, constant coefficients'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'H(j\\omega)=\\frac{Y(j\\omega)}{X(j\\omega)}=\\frac{\\sum_{k=0}^{M}b_k(j\\omega)^{k}}{\\sum_{k=0}^{N}a_k(j\\omega)^{k}}', label:'Frequency response',
        note:'Each $\\d^{k}/\\d t^{k}$ becomes $(j\\omega)^{k}$. The coefficients give two polynomials in $j\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'When $H(j\\omega)$ exists', html:'When $h$ is absolutely integrable, $\\int|h(t)|\\,\\d t<\\infty$. For an LTI system that is bounded-input bounded-output stability: an unstable system has no frequency response.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$.<div class="nsep"></div>What is $H(j0)$?',
        ask:{key:'m5-diffeq', choices:['$2/3$','$1/3$','$2$'], answer:0,
          why:'$H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega)^{2}+4j\\omega+3}$, so $H(j0)=2/3$.'}}]}
  ]}
]},

{ id:'m5-diffeq-ex', module:'M5', nav:'Worked example · simple poles', title:'Partial Fractions with Distinct Poles', src:'p. 63',
  objective:'Invert a rational H with distinct poles and check the result.',
  keywords:'worked example partial fractions simple poles cover-up impulse response half half', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Partial Fractions with Distinct Poles'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const h=t=>t<0?0:0.5*Math.exp(-t)+0.5*Math.exp(-3*t);
      const a=AX({xr:[-0.5,6],yr:[-0.1,1.2],xlabel:'t\\;(\\text{s})',ylabel:'h(t)',yticksOverride:[0,0.5,1]});
      a.area(h,0,6,{color:C.h+'29',n:900});
      a.curve(h,{color:C.h,n:2400});
      a.point(0,1,{color:C.coral,r:4.2});
      return a.svg(); },
      caption:'The impulse response. It starts at $1$ and its area is $2/3$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}$, from the equation on the previous slide.<div class="nsep"></div>What is $h(0^{+})$?',
      ask:{key:'m5-diffeq-ex', choices:['$1$','$2/3$','$0$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Write $s=j\\omega$ for the algebra: $\\dfrac{s+2}{(s+1)(s+3)}=\\dfrac{A}{s+1}+\\dfrac{B}{s+3}$.</li><li>Cover-up: $A=\\dfrac{s+2}{s+3}\\Big|_{s=-1}=\\dfrac12$ and $B=\\dfrac{s+2}{s+1}\\Big|_{s=-3}=\\dfrac12$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'h(t)=\\left[\\tfrac12e^{-t}+\\tfrac12e^{-3t}\\right]u(t)', label:'Solution',
        note:'Each fraction inverts with $e^{-ct}u(t)\\leftrightarrow1/(c+j\\omega)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$H(j0)=2/3$, and $\\int_0^\\infty h\\,\\d t=\\tfrac12+\\tfrac16=\\tfrac23$. $h(0^{+})=\\tfrac12+\\tfrac12=1$. $h$ is absolutely integrable, so the system is stable.'}]}
  ]}
]},

{ id:'m5-diffeq-ex-b', module:'M5', nav:'Simple poles · the frequency response', title:'Frequency Response of the Example', src:'p. 63',
  objective:'Plot the magnitude and phase of the example and read them at low and high frequency.',
  keywords:'magnitude phase frequency response 2/3 low pass high frequency 1/omega phase odd', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Frequency Response of the Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H(j\\omega)|$','$\\angle H(j\\omega)$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      if(f<0.5){
        const a=AX({xr:[-10,10],yr:[-0.08,0.8],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'|H(j\\omega)|',yticksOverride:[0.3333,0.6667],ytickfmt:v=>v.toFixed(2)});
        fade(a,1-2*f,()=>{ a.curve(w=>Math.hypot(2,w)/(Math.hypot(1,w)*Math.hypot(3,w)),{color:C.h,n:2000}); a.point(0,2/3,{color:C.coral,r:4.2}); });
        return a.svg(); }
      const a=AX({xr:[-10,10],yr:[-1.7,1.7],xlabel:'\\omega\\;(\\text{rad/s})',xpi:PI,ylabel:'\\angle H(j\\omega)\\;(\\text{rad})',yticksOverride:[-1.5708,-0.7854,0.7854,1.5708],ytickfmt:v=>v.toFixed(2)});
      fade(a,2*f-1,()=>{ a.curve(w=>Math.atan2(w,2)-Math.atan2(w,1)-Math.atan2(w,3),{color:C.mid,n:2000}); });
      return a.svg(); },
      caption:'The magnitude peaks at $0.667$ at $\\omega=0$. The phase is odd, as a real $h$ requires.'}
  ], right:[
    {t:'eq', tex:'|H(j\\omega)|=\\frac{\\sqrt{4+\\omega^{2}}}{\\sqrt{1+\\omega^{2}}\\,\\sqrt{9+\\omega^{2}}},\\qquad \\angle H=\\tan^{-1}\\tfrac{\\omega}{2}-\\tan^{-1}\\omega-\\tan^{-1}\\tfrac{\\omega}{3}', label:'Magnitude and phase'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Reading the ends', html:'At $\\omega=0$ the system passes $2/3$ of a constant. For large $\\omega$ the numerator has one factor and the denominator two, so $|H|$ falls like $1/\\omega$ and the phase goes to $-\\pi/2$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The same $H(j\\omega)$ at $\\omega=100$ rad/s.<div class="nsep"></div>About how large is $|H(j100)|$?',
        ask:{key:'m5-diffeq-ex-b', choices:['$0.01$','$0.67$','$0.0001$'], answer:0,
          why:'For large $\\omega$, $|H|\\approx\\omega/\\omega^{2}=1/\\omega=0.01$.'}}]}
  ]}
]},

{ id:'m5-partial', module:'M5', nav:'Repeated poles', title:'Partial Fractions with Repeated Poles', src:'p. 63',
  objective:'State the repeated-pole partial-fraction rule and show why the cover-up rule fails there.',
  keywords:'repeated pole multiplicity derivative partial fractions cover-up rule fails formula', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Technique', src:'p. 63'},
  {t:'title', text:'Partial Fractions with Repeated Poles'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-1,8],yr:[-0.1,1.2],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.37,1],ytickfmt:v=>String(v)});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'9 6',n:2000});
      a.curve(t=>t<0?0:t*Math.exp(-t),{color:C.out,n:2000});
      a.point(1,Math.exp(-1),{color:C.coral,r:4.2});
      return a.svg(); },
      caption:'A simple pole and a double pole at $a=1$. The double pole starts at $0$ and peaks at $t=1/a$.'},
    {t:'legend', items:[['in','$e^{-at}u(t)\\leftrightarrow\\frac{1}{s+a}$',true],['out','$t\\,e^{-at}u(t)\\leftrightarrow\\frac{1}{(s+a)^{2}}$']]}
  ], right:[
    {t:'eq', tex:'\\frac{N(s)}{(s-\\lambda)^{m}Q(s)}=\\frac{c_{m}}{(s-\\lambda)^{m}}+\\dots+\\frac{c_{1}}{s-\\lambda}+(\\text{terms from }Q)', label:'One term per power',
      note:'Here $s=j\\omega$ is only a name for the algebra.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Why covering up fails', html:'Multiply by $(s-\\lambda)$ and one factor survives below, so $s=\\lambda$ divides by zero. Multiply by $(s-\\lambda)^{m}$ and only the top coefficient $c_m$ falls out.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'c_{m-k}=\\frac{1}{k!}\\,\\frac{\\d^{k}}{\\d s^{k}}\\Bigl[(s-\\lambda)^{m}F(s)\\Bigr]_{s=\\lambda},\\qquad k=0,\\dots,m-1', label:'Repeated-pole rule',
        note:'$k=0$ is the cover-up rule. Each derivative gives one more coefficient.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$F(j\\omega)=\\dfrac{1}{(j\\omega+2)^{2}}$.<div class="nsep"></div>What is its inverse transform?',
        ask:{key:'m5-partial', choices:['$t\\,e^{-2t}u(t)$','$e^{-2t}u(t)$','$e^{-4t}u(t)$'], answer:0,
          why:'A double pole brings a factor $t$: $t\\,e^{-at}u(t)\\leftrightarrow1/(a+j\\omega)^{2}$.'}}]}
  ]}
]},

{ id:'m5-diffeq-b', module:'M5', nav:'Worked example · a repeated pole', title:'Repeated-Pole Example', src:'p. 63',
  objective:'Solve a full LTI problem with a double pole by the derivative rule.',
  keywords:'worked example repeated pole double pole coefficients quarter half minus quarter derivative rule', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Repeated-Pole Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.4,7],yr:[-0.1,1.2],xlabel:'t\\;(\\text{s})',ylabel:'\\text{amplitude}',yticksOverride:[0,0.5,1]});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'9 6',n:2000});
      a.curve(t=>t<0?0:t*Math.exp(-t),{color:C.mid,n:2000});
      a.curve(t=>t<0?0:Math.exp(-3*t),{color:C.h,n:2000});
      return a.svg(); },
      caption:'The three terms the coefficients multiply. Only $t\\,e^{-t}$ starts at zero, and it comes from the double pole.'},
    {t:'legend', items:[['in','$e^{-t}$',true],['mid','$t\\,e^{-t}$'],['h','$e^{-3t}$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}$ and $x(t)=e^{-t}u(t)$.<div class="nsep"></div>How many terms does $Y$ split into?',
      ask:{key:'m5-diffeq-b', choices:['$3$','$2$','$4$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'Y=\\frac{s+2}{(s+1)^{2}(s+3)}=\\frac{A}{s+1}+\\frac{B}{(s+1)^{2}}+\\frac{C}{s+3}', label:'Method · $Y=XH$ with $s=j\\omega$',
        note:'The input pole and one system pole coincide, so $s=-1$ is now a double pole.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'B=\\frac{s+2}{s+3}\\Big|_{-1}=\\frac12,\\quad A=\\frac{\\d}{\\d s}\\frac{s+2}{s+3}\\Big|_{-1}=\\frac{1}{(s+3)^{2}}\\Big|_{-1}=\\frac14,\\quad C=\\frac{s+2}{(s+1)^{2}}\\Big|_{-3}=-\\frac14', label:'Solution · the coefficients'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Carry the minus', html:'$C$ is negative. It is most easily lost on the line where the three fractions are written out together.'}]}
  ]}
]},

{ id:'m5-diffeq-b2', module:'M5', nav:'Worked example · the check', title:'Verification by Initial Value', src:'p. 63',
  objective:'Assemble the output and use y(0)=0 to catch a lost sign.',
  keywords:'worked example causal convolution starts at zero check sign lost candidates compare', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Verification by Initial Value'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$y(t)$ with $C=-\\tfrac14$','the wrong sign, $C=+\\tfrac14$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-0.4,5],yr:[-0.08,0.62],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',yticksOverride:[0,0.25,0.5]});
      a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)-0.25*Math.exp(-3*t),{color:C.out,n:2400});
      a.point(0,0,{color:C.coral,r:4.2});
      fade(a,f,()=>{ a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)+0.25*Math.exp(-3*t),{color:C.err,dash:'9 6',n:2400});
        a.point(0,0.5,{color:C.err,r:4.2}); });
      return a.svg(); },
      caption:'The two candidates differ by $0.5$ at $t=0$ and by about $0.001$ at $t=2$.'},
    {t:'legend', items:[['out','$C=-\\tfrac14$'],['err','$C=+\\tfrac14$',true]]}
  ], right:[
    {t:'eq', key:true, tex:'y(t)=\\left[\\tfrac14e^{-t}+\\tfrac12t\\,e^{-t}-\\tfrac14e^{-3t}\\right]u(t)', label:'Solution',
      note:'Inverted with $\\frac{1}{s+a}\\leftrightarrow e^{-at}u(t)$ and $\\frac{1}{(s+a)^{2}}\\leftrightarrow t\\,e^{-at}u(t)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'The check', html:'$y=x*h$ with $x$ and $h$ causal, so $y(0)=0$. The answer gives $\\tfrac14+0-\\tfrac14=0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Why this check', html:'At $t=2$ the candidates are $0.1685$ and $0.1698$; comparing curves there decides little. At $t=0$ they differ by $0.5$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The answer assembled with $C=+\\tfrac14$.<div class="nsep"></div>What does it give at $t=0$?',
        ask:{key:'m5-diffeq-b2', choices:['$0.5$','$0$','$0.25$'], answer:0,
          why:'$\\tfrac14+0+\\tfrac14=0.5$, which a convolution of two causal signals cannot give.'}}]}
  ]}
]},

realGallery({ id:'m5-real-diffeq', nav:'Differential equations around us',
  title:'Differential Equations Around Us', eyebrow:'Module 5 · Systems', src:'pp. 62–63',
  objective:'Recognise first- and second-order systems in everyday signals.',
  keywords:'examples RC circuit charging thermometer car suspension coffee cooling first order second order',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,5],yr:[-0.6,6],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>t<0?0:5*(1-Math.exp(-t)),{color:C.out,n:1600});
      return a.svg(); }, 'A capacitor charging to $5$ V through a resistor, $\\tau=RC=1$ ms: $v(t)=5(1-e^{-t})$, $t$ in ms.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[15,40],xlabel:'t\\;(\\text{s})',ylabel:'T(t)\\;(^{\\circ}\\text{C})',xstep:10}));
      a.curve(t=>20+17*(1-Math.exp(-t/10)),{color:C.out,n:1600});
      return a.svg(); }, 'A thermometer placed under the tongue: $T(t)=20+17(1-e^{-t/10})$, rising towards $37^{\\circ}$C.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.3,4],yr:[-4,5],xlabel:'t\\;(\\text{s})',ylabel:'y(t)\\;(\\text{cm})',xstep:1}));
      a.curve(t=>t<0?0:4*Math.exp(-1.5*t)*Math.cos(2*PI*t),{color:C.out,n:2400});
      return a.svg(); }, 'A car body after a bump, a second-order system: $y(t)=4e^{-1.5t}\\cos(2\\pi t)$ cm.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,30],yr:[0,90],xlabel:'n\\;(\\text{min})',ylabel:'T[n]\\;(^{\\circ}\\text{C})',xstep:5}));
      a.stem(D(n=>20+60*Math.pow(0.9,n),0,30),{color:C.in,r:2.4});
      return a.svg(); }, 'Coffee cooling, read once a minute: $T[n]=20+60(0.9)^{n}$, from $80^{\\circ}$C towards room temperature.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One equation, one response', html:'Each curve is the response of a low-order differential or difference equation. Its poles set how fast it settles and whether it rings.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'The equation gives $H(j\\omega)$ by algebra; partial fractions then give the response.'}
  ]}),

labScene({ id:'m5-lab-y', lab:'Y', nav:'Differential Equations', title:'A Differential Equation and Its Response', src:'pp. 62–63',
  objective:'Set the coefficients of a second-order system and read its frequency response and impulse response together.',
  keywords:'laboratory differential equation frequency response poles partial fractions impulse response damping' }),

codeScene({ id:'m5-code-diffeq', nav:'Differential equations', title:'Differential Equations in Code', src:'pp. 62–63', eyebrow:'Differential equations in code',
  objective:'Turn differential equations into frequency and impulse responses in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python differential equation frequency response partial fractions impulse response run' }),


/* ======================================================= 5.7 summary */

{ id:'m5-tables', module:'M5', nav:'Property summary', title:'CTFT Property Summary', src:'p. 62',
  objective:'Collect every property of the continuous-time Fourier transform for reference.',
  keywords:'summary table properties reference list linearity shift scaling convolution integration symmetry parseval duality',
  budget:'A reference table of properties in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 5 · Reference', src:'p. 62'},
  {t:'title', text:'CTFT Property Summary'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Operations on the signal'},
    {t:'wex', rows:[
      ['Linearity','$ax_1(t)+bx_2(t)\\;\\leftrightarrow\\;aX_1(j\\omega)+bX_2(j\\omega)$'],
      ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)$'],
      ['Frequency shift','$e^{j\\omega_0t}x(t)\\;\\leftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)$'],
      ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;X^{*}(-j\\omega)$'],
      ['Time reversal','$x(-t)\\;\\leftrightarrow\\;X(-j\\omega)$'],
      ['Scaling','$x(at)\\;\\leftrightarrow\\;\\frac{1}{|a|}X(j\\omega/a)$'],
      ['Convolution','$x(t)*h(t)\\;\\leftrightarrow\\;X(j\\omega)H(j\\omega)$'],
      ['Multiplication','$x(t)y(t)\\;\\leftrightarrow\\;\\frac{1}{2\\pi}X(j\\omega)*Y(j\\omega)$'],
      ['Duality','$X(t)\\;\\leftrightarrow\\;2\\pi x(-\\omega)$']
    ]}
  ], right:[
    {t:'sub', text:'Calculus, symmetry and energy'},
    {t:'wex', rows:[
      ['Differentiation','$\\d^{n}x/\\d t^{n}\\;\\leftrightarrow\\;(j\\omega)^{n}X(j\\omega)$'],
      ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;\\frac{X(j\\omega)}{j\\omega}+\\pi X(0)\\delta(\\omega)$'],
      ['Frequency derivative','$t\\,x(t)\\;\\leftrightarrow\\;j\\,\\d X(j\\omega)/\\d\\omega$'],
      ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$: $|X|$ even, $\\angle X$ odd'],
      ['Real and even','$X(j\\omega)$ real and even'],
      ['Real and odd','$X(j\\omega)$ purely imaginary and odd'],
      ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
      ['Parseval','$\\int|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int|X(j\\omega)|^{2}\\,\\d\\omega$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Two rows with a condition', html:'<b>Integration</b> keeps $\\pi X(0)\\delta(\\omega)$ whenever the signal has non-zero area. <b>Scaling</b> carries $1/|a|$, with the modulus, so a reversal counts once. Check every answer at $\\omega=0$ against the area.'}]}
]},

{ id:'m5-pairs', module:'M5', nav:'Transform pairs', title:'CTFT Pairs', src:'p. 62',
  objective:'Collect every standard continuous-time transform pair the course uses.',
  keywords:'transform pairs table reference impulse step exponential rectangular sinc impulse train periodic square wave sinc convention',
  budget:'A reference table of pairs in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 5 · Reference', src:'p. 62'},
  {t:'title', text:'CTFT Pairs'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Aperiodic signals'},
    {t:'wex', rows:[
      ['Impulse','$\\delta(t)\\;\\leftrightarrow\\;1$'],
      ['Shifted impulse','$\\delta(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}$'],
      ['Unit step','$u(t)\\;\\leftrightarrow\\;\\frac{1}{j\\omega}+\\pi\\delta(\\omega)$'],
      ['One-sided exponential','$e^{-at}u(t)\\;\\leftrightarrow\\;\\frac{1}{a+j\\omega}$, $a>0$'],
      ['Repeated pole','$\\frac{t^{n-1}}{(n-1)!}e^{-at}u(t)\\;\\leftrightarrow\\;\\frac{1}{(a+j\\omega)^{n}}$, $a>0$'],
      ['Two-sided exponential','$e^{-a|t|}\\;\\leftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}}$, $a>0$'],
      ['Rectangular pulse','$1$ on $|t|<T_1\\;\\leftrightarrow\\;\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)$'],
      ['Ideal low-pass band','$\\frac{\\sin(Wt)}{\\pi t}\\;\\leftrightarrow\\;1$ on $|\\omega|<W$']
    ]}
  ], right:[
    {t:'sub', text:'Periodic signals and impulse trains'},
    {t:'wex', rows:[
      ['Constant','$1\\;\\leftrightarrow\\;2\\pi\\delta(\\omega)$'],
      ['Complex exponential','$e^{j\\omega_0t}\\;\\leftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0)$'],
      ['Cosine','$\\cos(\\omega_0t)\\;\\leftrightarrow\\;\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$'],
      ['Sine','$\\sin(\\omega_0t)\\;\\leftrightarrow\\;\\frac{\\pi}{j}\\delta(\\omega-\\omega_0)-\\frac{\\pi}{j}\\delta(\\omega+\\omega_0)$'],
      ['Any periodic signal','$\\sum_k a_ke^{jk\\omega_0t}\\;\\leftrightarrow\\;\\sum_k 2\\pi a_k\\delta(\\omega-k\\omega_0)$'],
      ['Square wave','$\\sum_k\\frac{2\\sin(k\\omega_0T_1)}{k}\\delta(\\omega-k\\omega_0)$'],
      ['Impulse train','$\\sum_k\\delta(t-kT)\\;\\leftrightarrow\\;\\frac{2\\pi}{T}\\sum_k\\delta\\bigl(\\omega-\\frac{2\\pi k}{T}\\bigr)$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Carry with the table', html:'Every sinc here is unnormalised, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$; a table in the normalised convention divides the argument by $\\pi$. The exponential pairs hold only for $a>0$.'}]}
]},

{ id:'m5-quick', module:'M5', nav:'Quick check', title:'Quick check', src:'pp. 42–63',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict impulse area exponential sinc zero cosine shift scaling real signal parseval convolution modulation differential equation',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Quick check', src:'pp. 42–63'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Impulse', html:'The transform of $\\delta(t)$ is',
      ask:{key:'m5-qc0', choices:['$1$','$2\\pi\\delta(\\omega)$','$0$'], answer:0,
        why:'The sifting property gives $e^{-j\\omega\\cdot0}=1$ at every $\\omega$.'}}],
    [{t:'note', kind:'def', head:'Area', html:'$x(t)=1$ on $|t|<3$. Then $X(j0)$ is',
      ask:{key:'m5-qc1', choices:['$6$','$3$','$1$'], answer:0,
        why:'$X(j0)$ is the area of the signal.'}}],
    [{t:'note', kind:'def', head:'Exponential', html:'$x(t)=e^{-2t}u(t)$. Then $|X(j0)|$ is',
      ask:{key:'m5-qc2', choices:['$0.5$','$2$','$1$'], answer:0,
        why:'$X(j\\omega)=1/(2+j\\omega)$.'}}],
    [{t:'note', kind:'def', head:'First zero', html:'$2\\sin(\\omega T_1)/\\omega$ with $T_1=0.5$ first vanishes at',
      ask:{key:'m5-qc3', choices:['$2\\pi$','$\\pi$','$0.5$'], answer:0,
        why:'Zeros sit at $\\omega T_1=\\pi$, so $\\omega=\\pi/T_1$.'}}],
    [{t:'note', kind:'def', head:'Cosine', html:'$\\cos(3t)$ has impulses at $\\pm3$ of weight',
      ask:{key:'m5-qc4', choices:['$\\pi$','$\\tfrac12$','$2\\pi$'], answer:0,
        why:'$a_{\\pm1}=\\tfrac12$ and each weight is $2\\pi a_k$.'}}],
    [{t:'note', kind:'def', head:'Delay', html:'Delaying a signal changes $|X(j\\omega)|$?',
      ask:{key:'m5-qc5', choices:['no','yes'], answer:0,
        why:'The factor $e^{-j\\omega t_0}$ has magnitude $1$.'}}],
    [{t:'note', kind:'def', head:'Scaling', html:'$X$ is zero beyond $W$. The transform of $x(2t)$ is zero beyond',
      ask:{key:'m5-qc6', choices:['$2W$','$W/2$','$W$'], answer:0,
        why:'Compressing time widens the spectrum by the same factor.'}}],
    [{t:'note', kind:'def', head:'Real signal', html:'$x$ is real and $X(j1)=2+j$. Then $X(-j1)$ is',
      ask:{key:'m5-qc7', choices:['$2-j$','$2+j$','$-2-j$'], answer:0,
        why:'A real signal has $X(-j\\omega)=X^{*}(j\\omega)$.'}}],
    [{t:'note', kind:'def', head:'Energy', html:'$x(t)=e^{-t}u(t)$ has energy',
      ask:{key:'m5-qc8', choices:['$0.5$ J','$1$ J','$2\\pi$ J'], answer:0,
        why:'$\\int_0^\\infty e^{-2t}\\,\\d t=\\tfrac12$.'}}],
    [{t:'note', kind:'def', head:'Convolution', html:'$X(j0)=3$ and $H(j0)=2$. Then $Y(j0)$ is',
      ask:{key:'m5-qc9', choices:['$6$','$5$','$1.5$'], answer:0,
        why:'$Y=XH$ at every frequency.'}}],
    [{t:'note', kind:'def', head:'Modulation', html:'$X(j0)=2$. Times a carrier, each copy peaks at',
      ask:{key:'m5-qc10', choices:['$1$','$2$','$4$'], answer:0,
        why:'Each copy is $\\tfrac12X$.'}}],
    [{t:'note', kind:'def', head:'Equation', html:'$\\d y/\\d t+2y=x$. Then $H(j0)$ is',
      ask:{key:'m5-qc11', choices:['$0.5$','$2$','$1$'], answer:0,
        why:'$H(j\\omega)=1/(j\\omega+2)$.'}}]
  ]}
]},

{ id:'m5-synth', module:'M5', nav:'Module 5 synthesis', title:'Module 5 — what to carry forward', src:'pp. 42–63',
  dark:true, objective:'Consolidate the module and open the door to the discrete-time transform.',
  keywords:'synthesis summary module 5 fourier transform pairs properties convolution modulation parseval differential equation preview DTFT', steps:1, blocks:[
  {t:'eyebrow', text:'Module 5 · Synthesis', src:'pp. 42–63'},
  {t:'title', text:'Module 5 Summary'},
  /* Ten results as prompts, in the order of the module: the student answers
     each one, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m5', [
    {q:'Where does the transform come from?', glyph:G.limit,
     a:'Let the period of a pulse train grow. $T a_k$ samples one envelope, and in the limit the envelope is $X(j\\omega)$.'},
    {q:'What are the analysis and synthesis equations?', glyph:G.pair,
     a:'$X(j\\omega)=\\int x(t)e^{-j\\omega t}\\,\\d t$ and $x(t)=\\frac{1}{2\\pi}\\int X(j\\omega)e^{j\\omega t}\\,\\d\\omega$.'},
    {q:'Which signals have a transform?', glyph:G.exist,
     a:'Absolutely integrable ones, with finitely many extrema and jumps. Constants and sinusoids have one in the limit, as impulses.'},
    {q:'The rectangular pulse', glyph:G.sinc,
     a:'$1$ on $|t|<T_1$ gives $2\\sin(\\omega T_1)/\\omega=2T_1\\operatorname{sinc}(\\omega T_1)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},
    {q:'Duration and bandwidth', glyph:G.inverse,
     a:'Narrow in time is wide in frequency. Scaling by $a$ gives $\\frac{1}{|a|}X(j\\omega/a)$.'},
    {q:'A periodic signal', glyph:G.lines,
     a:'Impulses of weight $2\\pi a_k$ at $k\\omega_0$.'},
    {q:'A delay', glyph:G.shift,
     a:'$e^{-j\\omega t_0}$: the magnitude stays, the phase gains $-\\omega t_0$.'},
    {q:'Convolution and multiplication', glyph:G.conv,
     a:'$x*h\\leftrightarrow XH$. $xy\\leftrightarrow\\frac{1}{2\\pi}X*Y$. A carrier makes two half-height copies.'},
    {q:'Parseval’s relation', glyph:G.energy,
     a:'$\\int|x|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int|X|^{2}\\,\\d\\omega$, with $R=1\\,\\Omega$.'},
    {q:'A differential equation', glyph:G.ode,
     a:'$H(j\\omega)$ is a ratio of polynomials in $j\\omega$. Partial fractions and the table give $h(t)$.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'Where Module 6 begins', html:'<span style="color:var(--graphite)">The same idea for a sequence. The analysis sum over $n$ gives a spectrum $X(e^{j\\omega})$ that is continuous in $\\omega$ and repeats every $2\\pi$.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer beyond ones checked in verify/. */
{ id:'m5-projects', module:'M5', nav:'Projects to try', title:'Projects to Try', src:'pp. 42–63',
  dark:true, objective:'Offer four optional projects that use the Fourier transform on sound, radio and circuits.',
  keywords:'projects matlab python clap spectrum duration bandwidth AM radio modulation echo comb RC circuit frequency response',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Projects', src:'pp. 42–63'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m5', [
    {title:'Short sounds, wide spectra', glyph:G.clap,
     aim:'Measure how the length of a sound sets the width of its spectrum.',
     learn:['The analysis integral as a sum over samples.',
            'The inverse relation between duration and bandwidth.',
            'Why a short click sounds bright.'],
     steps:['Record a hand clap and a long whistle at $44.1$ kHz.',
            'Cut each one out and approximate $X(j\\omega)$ by the FFT times the sample spacing.',
            'Plot $|X|$ in dB against frequency in Hz for both.',
            'Estimate the duration and the bandwidth of each and compare the products.'],
     look:'The clap lasts milliseconds and spreads over kilohertz. The whistle lasts longer and sits in a narrow band.'},
    {title:'An AM radio in software', glyph:G.radio,
     aim:'Modulate a sound onto a carrier, look at the copies and get the sound back.',
     learn:['Multiplication by a cosine as two half-height copies.',
            'Demodulation by a second multiplication.',
            'What overlap does when the carrier is too low.'],
     steps:['Take a speech clip at $48$ kHz and low-pass it to $4$ kHz.',
            'Multiply by $\\cos(2\\pi\\cdot10\\,000\\,t)$ and plot the spectrum.',
            'Multiply by the carrier again and low-pass to $4$ kHz. Listen.',
            'Repeat with a $3$ kHz carrier.'],
     look:'Two copies at $\\pm10$ kHz, each at half height. The recovered speech has half the amplitude. At $3$ kHz the copies overlap and the speech is garbled.'},
    {title:'The spectrum of an echo', glyph:G.echo,
     aim:'Find the frequency response of a single echo and hear its comb.',
     learn:['The time shift as a phase factor.',
            'A system read directly from its impulse response.',
            'Magnitude ripple from two paths adding.'],
     steps:['Take $h(t)=\\delta(t)+0.5\\,\\delta(t-T)$ with $T=5$ ms.',
            'Write $H(j\\omega)=1+0.5e^{-j\\omega T}$ and plot $|H|$ from $0$ to $2$ kHz.',
            'Pass white noise through the echo and listen.',
            'Change $T$ and watch the spacing of the ripple.'],
     look:'$|H|$ swings between $0.5$ and $1.5$, with peaks every $1/T=200$ Hz. A longer delay packs the ripple closer.'},
    {title:'An RC circuit, three ways', glyph:G.rc,
     aim:'Get the response of an RC low-pass from its differential equation and check it.',
     learn:['$H(j\\omega)$ from a differential equation.',
            'The impulse response by the table.',
            'A step response simulated in time.'],
     steps:['Write $RC\\,\\d y/\\d t+y=x$ with $R=1$ k$\\Omega$ and $C=1\\,\\mu$F.',
            'Form $H(j\\omega)$ and plot $|H|$ and $\\angle H$.',
            'Invert to $h(t)$ and simulate the step response with a small time step.',
            'Measure $|H|$ at $\\omega=1/RC$.'],
     look:'$|H|=1/\\sqrt2\\approx0.707$ and $\\angle H=-\\pi/4$ at $\\omega=1/RC=1000$ rad/s. The step response reaches $63\\%$ at $t=RC=1$ ms.'}
  ])}
]}

];
window.SCENES_M5 = SC;
})();
