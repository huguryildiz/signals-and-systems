/* ==========================================================================
   Module 4 — Fourier Series  [Source: 22–41]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

/* stems over an integer range */
const D = (f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const cl = u=>Math.max(0,Math.min(1,u));
const num = v=>String(Math.round(v*100)/100);
/* a group drawn at an opacity: the faint given signal on a sketch slide, or a
   state fading in or out while a figure plays between frames */
const fade=(a,o,f)=>{ if(o<=0) return; a.raw(`<g opacity="${o.toFixed(3)}">`); f(); a.raw('</g>'); };
/* the invisible data area a sketch is drawn in */
const skArea=a=>a.raw(`<rect class="sk-area" x="${a.x0}" y="${a.y1}" width="${a.x1-a.x0}" height="${a.y0-a.y1}" fill="none"/>`);
/* the standard slide axes: one figure in the left column of a 5:7 slide */
const AX = o => P.Axes(Object.assign({w:560,h:380,pad:{l:52,r:24,t:20,b:34},xtarget:7,ytarget:3}, o));

/* the periodic rectangular wave of this module: 1 on |t| < T1, zero to T/2 */
const rectWave = (t,T,T1)=>{ let u = t - T*Math.round(t/T); return Math.abs(u) < T1 ? 1 : 0; };
/* its partial sum, built from the coefficients this module derives */
const rectPS = (t,N,T,T1)=>{ let s = 2*T1/T;
  for(let k=1;k<=N;k++) s += 2*Math.sin(2*Math.PI*k*T1/T)/(Math.PI*k)*Math.cos(2*Math.PI*k*t/T);
  return s; };
/* the sawtooth of this module: x(t) = t on -T/2 < t < T/2, repeated */
const sawWave = (t,T)=>{ let u = t - T*Math.round(t/T); return u; };
const sawPS = (t,N,T)=>{ let s = 0;
  for(let k=1;k<=N;k++) s += -(T/(k*Math.PI))*Math.cos(k*Math.PI)*Math.sin(2*Math.PI*k*t/T);
  return s; };
/* discrete-time rectangular wave coefficients, both branches */
const dtRect = (k,N,N1)=>{ const r = k/N;
  if(Math.abs(r - Math.round(r)) < 1e-12) return (2*N1+1)/N;
  return Math.sin(2*Math.PI*k*(N1+0.5)/N)/(N*Math.sin(Math.PI*k/N)); };
/* coefficients of the rectangular wave with T0 = 4 T1 */
const aq = k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k);
/* coefficients of the discrete sawtooth x[n] = n on -5..5, N = 11: a_k = -j S(k) */
const sawS = k=>{ let s=0; for(let m=1;m<=5;m++) s+=(2*m/11)*Math.sin(2*Math.PI*k*m/11); return s; };

Object.assign(CONTENT.GLOSS, {
  ak:{ s:'a_k', d:'Fourier series coefficient of harmonic index $k$. It is a complex number: $|a_k|$ is the amplitude of the $k$-th harmonic and $\\angle a_k$ is its phase.', go:'m4-fs-synth' },
  bk:{ s:'b_k', d:'Fourier series coefficient of the output of a linear time-invariant system, $b_k=a_kH(jk\\omega_0)$.', go:'m4-lti' },
  Hs:{ s:'H(s)', d:'Eigenvalue of a continuous-time linear time-invariant system for the eigenfunction $e^{st}$.', go:'m4-eigen-ct' },
  Hz:{ s:'H(z)', d:'Eigenvalue of a discrete-time linear time-invariant system for the eigenfunction $z^{n}$.', go:'m4-eigen-dt' },
  Hjw:{ s:'H(j\\omega)', d:'Frequency response of a continuous-time system, $H(s)$ evaluated at $s=j\\omega$. It reports what the system does to the complex exponential of angular frequency $\\omega$ rad/s.', go:'m4-lti' },
  Hejw:{ s:'H(e^{j\\omega})', d:'Frequency response of a discrete-time system, $H(z)$ evaluated at $z=e^{j\\omega}$. It is periodic in $\\omega$ with period $2\\pi$.', go:'m4-dt-filt' },
  eigen:{ s:'\\text{eigenfunction}', d:'A signal that a system returns unchanged in shape, scaled by a constant. For every linear time-invariant system the complex exponentials are the eigenfunctions.', go:'m4-eigen-ct' },
  mse:{ s:'\\text{MSE}', d:'Mean-square error between a signal and a truncated Fourier series, averaged over one period.', go:'m4-howmany' }
});

/* ---- everyday signals, one gallery slide at the end of each teaching
       section. The traces are schematic; each keeps the feature its section
       is about. A figure with two traces carries its legend as a third entry. */
const EXO = o => Object.assign({w:520,h:250,pad:{l:60,r:26,t:24,b:40},ytarget:3}, o);
function realGallery(cfg){
  return { id:cfg.id, module:'M4', nav:cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    budget:cfg.budget||'A gallery of four everyday signals; each figure is one example.',
    slide:true, steps:cfg.notes.length-1, blocks:[
    {t:'eyebrow', text:cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'cols', ratio:'c-8-4', fill:true, left:[
      {t:'grid', cols:2, gap:'18px 22px', items:cfg.figs.map(([svg,cap,lg])=>
        [{t:'fig', frame:true, svg, caption:cap}].concat(lg?[{t:'legend', items:lg}]:[]))}
    ], right:cfg.notes.map((n,i)=>i ? {t:'reveal', at:i, items:[n]} : n)}
  ]};
}
/* a laboratory scene: the title, then the laboratory itself */
function labScene(cfg){
  return { id:cfg.id, module:'M4', nav:'Laboratory {lab} · '+cfg.nav, title:'Laboratory {lab} — '+cfg.title, src:cfg.src,
    objective:cfg.objective, slide:true, keywords:cfg.keywords, steps:0, blocks:[
    {t:'eyebrow', text:'Interactive laboratory', src:cfg.src},
    {t:'title', text:'Laboratory {lab} · '+cfg.nav},
    {t:'lab', id:cfg.lab}
  ]};
}
/* a code page: the programs of one section, paged one at a time */
function codeScene(cfg){
  return { id:cfg.id, module:'M4', nav:'Code · '+cfg.nav, title:cfg.title, src:cfg.src,
    objective:cfg.objective, keywords:cfg.keywords,
    slide:true, steps:0, budget:'a code page: the program draws its own figure', blocks:[
    {t:'eyebrow', text:'Module 4 · '+cfg.eyebrow, src:cfg.src},
    {t:'title', text:cfg.title},
    {t:'raw', html:()=>CODEBANK.page(cfg.id)}
  ]};
}

/* Small sketches for the summary and project cards. Both pages are navy, so
   they are drawn in the dark-page signal tints. */
const G = (()=>{
  const sv = b => `<svg viewBox="0 0 92 44">${b}</svg>`;
  const ln = (d,c,w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dot = (x,y,c) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`;
  const st = (x,y,c,base) => ln(`M${x} ${base||40} V${y}`,c,1.8)+dot(x,y,c);
  const tr = (f,c,w,x0,x1) => ln('M'+[...Array(Math.round((x1||90)-(x0||2))+1)].map((_,i)=>{ const x=(x0||2)+i; return x+','+f(x).toFixed(1); }).join('L'),c,w||1.8);
  const box = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.6"/>`;
  const AX='rgba(239,231,216,.30)', CY='#4FBECE', GR='#82C27B', RD='#E8785F', VI='#AC99DC', AM='#E5B255';
  const sq = x=>{ const u=((x-2)%28+28)%28; return u<14?10:34; };
  return {
    eigen:  sv(tr(x=>22-10*Math.sin(x/4),CY,1.6,2,24)+ln('M26 22 H32',AX,1.3)+box(33,13,24,18,AM)+ln('M58 22 H64',AX,1.3)
               +tr(x=>22-6*Math.sin(x/4-1),GR,1.6,66,90)),
    synth:  sv(tr(x=>24-6*Math.sin(x/7),CY,1.2)+tr(x=>24-3*Math.sin(3*x/7),VI,1.2)+tr(x=>24-6*Math.sin(x/7)-3*Math.sin(3*x/7),GR,2)),
    probe:  sv(ln('M1 24 H91',AX,1)+`<path d="M2 24 ${[...Array(89)].map((_,i)=>'L'+(2+i)+' '+(24-14*Math.pow(Math.sin((2+i)/7),2)).toFixed(1)).join(' ')} L90 24 Z" fill="${AM}" fill-opacity=".35"/>`
               +tr(x=>24-14*Math.pow(Math.sin(x/7),2),AM,1.6)),
    exist:  sv(ln('M1 40 H91',AX,1)+tr(x=>40-30/(1+Math.pow((x-46)/5,2)),RD,1.6)),
    rect:   sv(ln('M1 40 H91',AX,1)+[-4,-3,-2,-1,0,1,2,3,4].map(k=>st(46+k*10,40-(k===0?28:Math.abs(56*Math.sin(Math.PI*k/2)/(Math.PI*k))),k%2?CY:AX)).join('')),
    gibbs:  sv(ln('M1 34 H91',AX,1)+tr(sq,AX,1.2)+tr(x=>{ let s=22; for(let k=1;k<=15;k+=2) s-=12*4/Math.PI*Math.sin(2*Math.PI*k*(x-2)/28)/k*1; return Math.max(4,Math.min(42,s)); },GR,1.4)),
    dtfs:   sv(ln('M1 40 H91',AX,1)+[...Array(12)].map((_,i)=>st(6+i*7.5,40-[26,18,8,4,8,18][i%6],i<6?CY:VI)).join('')),
    sym:    sv(ln('M1 40 H91 M46 4 V42',AX,1)+[1,2,3,4].map(k=>st(46+k*9,40-28/k,CY)+st(46-k*9,40-28/k,CY)).join('')+st(46,6,AM)),
    power:  sv(ln('M1 40 H91',AX,1)+[[14,6],[26,16],[38,24],[50,29],[62,32],[74,34]].map(([x,y])=>`<rect x="${x-4}" y="${y}" width="8" height="${40-y}" fill="${AM}" fill-opacity=".55"/>`).join('')),
    lti:    sv(ln('M2 22 H22 M50 22 H70',AX,1.3)+box(22,12,28,20,AM)+st(76,8,GR,36)+st(84,20,GR,36)+st(10,8,CY,36)+st(16,12,CY,36)),
    pair:   sv(ln('M1 22 H91',AX,1)+tr(x=>22-7*Math.cos(x/6+0.5),RD,1.2)+tr(x=>22-14*Math.cos(x/6+0.5),GR,2)),
    tone:   sv(ln('M1 22 H91',AX,1)+tr(x=>{ let s=22; for(let k=1;k<=5;k+=2) s-=16/k*Math.sin(k*x/7); return s; },CY,1.6)),
    note:   sv(ln('M1 40 H91',AX,1)+[30,14,22,10,26,18,32,28].map((y,i)=>st(10+i*10,y,AM)).join('')),
    filt:   sv(tr(sq,AX,1.3)+tr(x=>{ const u=((x-2)%28+28)%28; return u<14 ? 34-24*(1-Math.exp(-u/4))+ (0) : 10+24*(1-Math.exp(-(u-14)/4)); },GR,1.8)),
    week:   sv(ln('M1 40 H91',AX,1)+[...Array(14)].map((_,i)=>st(5+i*6.4,40-(20+10*Math.cos(2*Math.PI*i/7)),i<7?CY:VI)).join(''))
  };
})();

const SC = [

{ id:'m4-open', module:'M4', nav:'Module 4 opening', title:'Fourier Series', src:'pp. 22–41',
  dark:true, keywords:'module 4 fourier series harmonics eigenfunction overview periodic', steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Fourier Series', src:'pp. 22–41'},
  {t:'title', level:1, text:'Fourier Series'},
  {t:'lede', text:'Fourier series are used to find the response of an LTI system to a periodic signal. An LTI system returns each complex exponential with the same form and multiplies it by one complex number. After a periodic signal is written as a sum of these exponentials, convolution becomes one multiplication for each harmonic.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0 t}', label:'Synthesis'},
    {t:'eq', tex:'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0 t}\\,\\d t', label:'Analysis'},
    {t:'note', kind:'ok', head:'Purpose of the representation', html:'<span style="color:var(--graphite)">The frequency response states how the system changes each frequency. Multiply each input coefficient by the value of the frequency response at its harmonic to obtain the output coefficient.</span>'}
  ], right:[
    /* A rectangular wave, then its partial sums with 1, 5 and 25 harmonics,
       drawn in one after another. The canvas is narrower than the column, so
       the traces read at back-row size on the navy page. */
    {t:'fig', svg:()=>{
      const a=P.Axes({w:520,h:330,xr:[-4,4],yr:[-0.35,4.1],grid:false,zeroAxes:false,arrows:false,
        pad:{l:14,r:14,t:14,b:14},xticksOverride:[],yticksOverride:[]});
      a.curve(t=>rectWave(t,4,1)+3,{color:'#7FC3CE',width:2.4,n:2400,anim:{delay:0,sweep:'#D9F3F7'}});
      a.curve(t=>rectPS(t,1,4,1)+2,{color:'#AC99DC',width:2.2,anim:{delay:.4}});
      a.curve(t=>rectPS(t,5,4,1)+1,{color:'#E5B255',width:2.2,anim:{delay:.8}});
      a.curve(t=>rectPS(t,25,4,1),{color:'#8FBF8A',width:2.2,n:2400,anim:{delay:1.2,sweep:'#E4F4E1'}});
      return a.svg(); }}
  ]}
]},

/* ======================================================= 4.1 the eigenfunction property */

{ id:'m4-eigen-ct', module:'M4', nav:'Eigenfunctions · continuous time', title:'Continuous-Time Eigenfunctions', src:'p. 22',
  objective:'Derive the eigenfunction property in continuous time and name the eigenvalue.',
  keywords:'eigenfunction eigenvalue complex exponential H(s) frequency response continuous', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The eigenfunction property', src:'p. 22'},
  {t:'title', text:'Continuous-Time Eigenfunctions'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,8],yr:[-1.3,2.2],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
      a.curve(t=>Math.cos(2*t),{color:C.in,dash:'9 6',n:900});
      a.curve(t=>Math.cos(2*t-Math.atan(2))/Math.sqrt(5),{color:C.out,n:900});
      return a.svg(); },
      caption:'The input $\\operatorname{Re}\\{e^{j2t}\\}$ and the output of $h(t)=e^{-t}u(t)$. The frequency stays. Only the amplitude and the phase change.'},
    {t:'legend', items:[['in','$\\cos 2t$',true],['out','$0.447\\cos(2t-1.107)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Eigenfunction', html:'A signal is an <b>{{sym:eigen|eigenfunction}}</b> of a system when the output is the same signal times a constant. The constant is the <b>eigenvalue</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{s(t-\\tau)}\\,\\d\\tau=e^{st}\\underbrace{\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau}_{H(s)}', label:'Put $x(t)=e^{st}$ into the convolution integral',
        note:'$e^{st}$ does not depend on $\\tau$, so it leaves the integral. What is left depends on $s$ only.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'e^{st}\\;\\longrightarrow\\;H(s)\\,e^{st},\\qquad H(s)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau', label:'Eigenfunction property',
        note:'For $s=j\\omega$ the eigenvalue $H(j\\omega)$ is the <b>frequency response</b> of the system.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'An LTI system with a real $h(t)$ and the input $\\cos 2t$.<div class="nsep"></div>Is $\\cos 2t$ an eigenfunction of every such system?',
        ask:{key:'m4-eigen-ct', choices:['Yes','No'], answer:1,
          why:'The output is $|H(j2)|\\cos\\bigl(2t+\\angle H(j2)\\bigr)$, which is a constant times $\\cos 2t$ only when $\\angle H(j2)$ is $0$ or $\\pi$.'}}]}
  ]}
]},

{ id:'m4-eigen-dt', module:'M4', nav:'Eigenfunctions · discrete time', title:'Discrete-Time Eigenfunctions', src:'p. 23',
  objective:'Derive the discrete-time eigenfunction property and keep it separate from the continuous-time one.',
  keywords:'discrete eigenfunction z^n eigenvalue H(z) frequency response sequence', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The eigenfunction property', src:'p. 23'},
  {t:'title', text:'Discrete-Time Eigenfunctions'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=\\cos(2\\pi n/3)$','$y[n]=\\tfrac12\\cos(2\\pi n/3-\\pi/3)$']},
      svg:v=>{
      /* frame 0 is the input; going to frame 1 fades it out and the output of
         the two-point average in, sample for sample */
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-1,13],yr:[-1.3,1.45],xlabel:'n',ylabel:'\\text{amplitude}',xtarget:8});
      if(f<1) fade(a,1-f,()=>a.stem(D(n=>Math.cos(2*Math.PI*n/3),-1,13),{color:C.in}));
      if(f>0) fade(a,f,()=>a.stem(D(n=>0.5*Math.cos(2*Math.PI*n/3-Math.PI/3),-1,13),{color:C.out}));
      return a.svg(); },
      caption:'A cosine sequence through $y[n]=\\tfrac12x[n]+\\tfrac12x[n-1]$. The output is a cosine sequence of the same frequency.'}
  ], right:[
    {t:'eq', tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{\\,n-k}=z^{n}\\underbrace{\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}}_{H(z)}', label:'Put $x[n]=z^{n}$ into the convolution sum',
      note:'$z^{n}$ does not depend on $k$, so it leaves the sum.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'z^{n}\\;\\longrightarrow\\;H(z)\\,z^{n},\\qquad H(z)=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}', label:'Eigenfunction property, discrete time',
        note:'For $z=e^{j\\omega}$ this is the frequency response $H(e^{j\\omega})$. It repeats every $2\\pi$ in $\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Keep the two statements apart', html:'The output is a sequence, $y[n]=H(z)\\,z^{n}$. A discrete-time line has no $t$ and no $s$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$h[n]=\\tfrac12\\delta[n]+\\tfrac12\\delta[n-1]$ and $x[n]=(-1)^{n}$.<div class="nsep"></div>What is $y[n]$?',
        ask:{key:'m4-eigen-dt', choices:['$0$','$(-1)^{n}$','$\\tfrac12(-1)^{n}$'], answer:0,
          why:'$(-1)^{n}=z^{n}$ with $z=-1$, and $H(-1)=\\tfrac12-\\tfrac12=0$.'}}]}
  ]}
]},

{ id:'m4-eigen-why', module:'M4', nav:'Eigenfunctions in LTI analysis', title:'Eigenfunctions in LTI Analysis', src:'p. 24',
  objective:'Show that a linear combination of eigenfunctions needs no convolution.',
  keywords:'linear combination superposition eigenvalue no convolution multiplication', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The eigenfunction property', src:'p. 24'},
  {t:'title', text:'Eigenfunctions in LTI Analysis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const items=[];
      [1,2,3].forEach((i,j)=>{ const y=74+j*116;
        items.push({t:'text',x:12,y:y+6,label:'a_'+i+'e^{s_'+i+'t}',anchor:'start',tex:true,fs:16,color:C.in},
          {t:'arrow',x1:112,y1:y,x2:196,y2:y},{t:'box',x:196,y:y-22,w:96,h:44,label:'H(s)',tex:true},
          {t:'arrow',x1:292,y1:y,x2:368,y2:y},
          {t:'text',x:378,y:y+6,label:'a_'+i+'H(s_'+i+')e^{s_'+i+'t}',anchor:'start',tex:true,fs:16,color:C.out}); });
      return P.blocks({w:560,h:380,items}); },
      caption:'Each exponential passes through the system on its own. Superposition then adds the three outputs.'}
  ], right:[
    {t:'eq', key:true, tex:'x(t)=\\sum_{k}a_k\\,e^{s_kt}\\;\\longrightarrow\\;y(t)=\\sum_{k}a_k\\,H(s_k)\\,e^{s_kt}', label:'Superposition of eigenfunctions',
      note:'Linearity sends each term through on its own. The eigenfunction property multiplies it by $H(s_k)$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'No convolution needed', html:'Once $x$ is a sum of exponentials, the output needs one multiplication for each term. The same holds in discrete time with $z_k^{\\,n}$ and $H(z_k)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The next task', html:'Write $x$ as a sum of complex exponentials. For a periodic signal, the rest of this module does exactly that.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=2e^{jt}+e^{j3t}$, with $H(j1)=0.5$ and $H(j3)=0$.<div class="nsep"></div>What is $y(t)$?',
        ask:{key:'m4-eigen-why', choices:['$e^{jt}$','$2e^{jt}$','$e^{jt}+e^{j3t}$'], answer:0,
          why:'$2\\cdot0.5\\,e^{jt}+1\\cdot0\\cdot e^{j3t}=e^{jt}$.'}}]}
  ]}
]},

{ id:'m4-eigen-ex', module:'M4', nav:'Worked example · a pure delay', title:'Pure Delay as an Eigenfunction Example', src:'pp. 24–25',
  objective:'Find the eigenvalue of a pure delay and apply it to one complex exponential.',
  keywords:'worked example delay y(t)=x(t-3) sifting eigenvalue e^{-3s} complex exponential', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 24–25'},
  {t:'title', text:'Pure Delay as an Eigenfunction Example'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-1,9],yr:[-1.3,2.2],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:10});
      a.curve(t=>Math.cos(2*t),{color:C.in,dash:'9 6',n:900});
      a.curve(t=>Math.cos(2*(t-3)),{color:C.out,n:900});
      return a.svg(); },
      caption:'The real parts of $e^{j2t}$ and of the output. A delay of 3 s is a phase lag of $2\\times3=6$ rad at this frequency.'},
    {t:'legend', items:[['in','$\\cos 2t$',true],['out','$\\cos\\bigl(2(t-3)\\bigr)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'An LTI system delays its input by 3 s: $y(t)=x(t-3)$. The input is $x(t)=e^{j2t}$.<div class="nsep"></div>What is $|H(j2)|$?',
      ask:{key:'m4-eigen-ex', choices:['$1$','$2$','$3$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Write $h(t)$ from the rule.</li><li>Compute $H(s)$ from $h(t)$.</li><li>Multiply the input by $H(j2)$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'h(t)=\\delta(t-3),\\qquad H(s)=\\int_{-\\infty}^{\\infty}\\delta(\\tau-3)\\,e^{-s\\tau}\\,\\d\\tau=e^{-3s}', label:'Impulse response and eigenvalue',
        note:'The integral is the sifting property of Module 1.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'e^{j2t}\\;\\longrightarrow\\;H(j2)\\,e^{j2t}=e^{-j6}\\,e^{j2t}=e^{j2(t-3)}', label:'Solution'}]}
  ]}
]},

{ id:'m4-eigen-ex-b', module:'M4', nav:'Worked example · two cosines', title:'Two Cosines Through the Delay', src:'pp. 24–25',
  objective:'Expand two cosines into exponentials, apply the eigenvalue to each, and check against the rule.',
  keywords:'worked example delay cosine euler expansion eigenvalue each term check phase proportional to frequency', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 24–25'},
  {t:'title', text:'Two Cosines Through the Delay'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, svg:()=>{
      const a=AX({xr:[-1,8],yr:[-2.4,3.2],xlabel:'t',ylabel:'y(t)',xtarget:9});
      skArea(a);
      a.curve(t=>Math.cos(4*t)+Math.cos(7*t),{color:C.ink,opacity:.35,dash:'6 5',n:1600});
      a.note(-0.8,2.75,'x(t)',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=>Math.cos(4*(t-3))+Math.cos(7*(t-3)),{color:C.out,n:1600});
      a.note(7.8,2.75,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $x(t)=\\cos 4t+\\cos 7t$. Sketch the output of the 3 s delay, then show the answer.'}
  ], right:[
    {t:'eq', tex:'\\cos 4t=\\tfrac12e^{j4t}+\\tfrac12e^{-j4t},\\qquad \\cos 7t=\\tfrac12e^{j7t}+\\tfrac12e^{-j7t}', label:'Write each cosine as exponentials'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\begin{aligned}y(t)&=\\tfrac12e^{-j12}e^{j4t}+\\tfrac12e^{j12}e^{-j4t}+\\tfrac12e^{-j21}e^{j7t}+\\tfrac12e^{j21}e^{-j7t}\\\\&=\\cos\\bigl(4(t-3)\\bigr)+\\cos\\bigl(7(t-3)\\bigr)\\end{aligned}', label:'Multiply each term by $H(j\\omega)=e^{-j3\\omega}$'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'The rule $y(t)=x(t-3)$ applied directly gives the same output.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'What a delay does', html:'$|H(j\\omega)|=1$ at every $\\omega$ and $\\angle H(j\\omega)=-3\\omega$. A delay changes no amplitude. It adds a phase proportional to frequency.'}]}
  ]}
]},

realGallery({ id:'m4-real-eigen', nav:'Eigenfunctions around us',
  title:'Eigenfunctions Around Us', eyebrow:'Module 4 · The eigenfunction property', src:'pp. 22–25',
  objective:'See sinusoids keep their frequency through everyday LTI systems.',
  keywords:'examples sinusoid mains RC filter loudspeaker delay moving average first difference same frequency',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,40],yr:[-400,560],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:10}));
      a.curve(t=>325*Math.cos(2*Math.PI*0.05*t),{color:C.in,dash:'9 6',n:900});
      a.curve(t=>325/Math.SQRT2*Math.cos(2*Math.PI*0.05*t-Math.PI/4),{color:C.out,n:900});
      return a.svg(); }, 'Mains through an RC filter with $RC=3.18$ ms: $230\\cos(2\\pi\\,50\\,t-\\pi/4)$ V.',
      [['in','$v_s(t)$',true],['out','$v_C(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[0,30],yr:[-1.3,1.9],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)\\;(\\text{Pa})',xstep:10}));
      a.curve(t=>Math.sin(2*Math.PI*0.1*t),{color:C.in,dash:'9 6',n:900});
      a.curve(t=>Math.sin(2*Math.PI*0.1*(t-2.9)),{color:C.out,n:900});
      return a.svg(); }, 'A 100 Hz tone 1 m from the loudspeaker arrives $2.9$ ms late.',
      [['in','$\\text{at the cone}$',true],['out','$\\text{at 1 m}$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-1,48],yr:[0,24],xlabel:'n\\;(\\text{h})',ylabel:'y[n]\\;(^{\\circ}\\text{C})',xstep:12}));
      a.stem(D(n=>15+5*0.977283*Math.cos(2*Math.PI*(n-1)/24),0,48),{color:C.out,r:2.6});
      return a.svg(); }, 'Hourly temperature through a 3-hour average: amplitude $5\\to4.89$, one hour late.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,25],yr:[-1.1,1.1],xlabel:'n\\;(\\text{sample})',ylabel:'y[n]',xstep:8}));
      a.stem(D(n=>2*Math.sin(Math.PI/8)*Math.cos(Math.PI*n/4+3*Math.PI/8),0,24),{color:C.out,r:3});
      return a.svg(); }, '$\\cos(\\pi n/4)$ through $x[n]-x[n-1]$: $0.765\\cos(\\pi n/4+3\\pi/8)$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Same frequency out', html:'Each system returns a sinusoid at the input frequency. Only the amplitude and the phase change.'},
    {t:'note', kind:'warn', head:'Why this matters', html:'A sinusoid is the one input whose form an LTI system keeps. So one complex number at each frequency describes the whole system.'}
  ]}),

labScene({ id:'m4-lab-p', lab:'P', nav:'Eigenfunctions', title:'An Exponential Through an LTI System', src:'pp. 22–25',
  objective:'Send a complex exponential through four LTI systems and read the eigenvalue off the output.',
  keywords:'laboratory eigenfunction eigenvalue frequency response delay low pass average difference gain phase' }),

codeScene({ id:'m4-code-eigen', nav:'Eigenfunctions', title:'Eigenfunctions in Code', src:'pp. 22–25', eyebrow:'Eigenfunctions in code',
  objective:'Send complex exponentials through LTI systems in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python eigenfunction eigenvalue delay low pass frequency response run' }),


/* ======================================================= 4.2 synthesis and analysis */

{ id:'m4-fs-exist', module:'M4', nav:'Conditions for series representation', title:'Conditions for Fourier-Series Representation', src:'pp. 25–26',
  objective:'State the three Dirichlet conditions and show one signal failing each.',
  keywords:'dirichlet conditions absolutely integrable bounded variation discontinuities existence convergence', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'pp. 25–26'},
  {t:'title', text:'Conditions for Fourier-Series Representation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$1/t$: condition 1 fails','$\\sin(2\\pi/t)$: condition 2 fails','$\\text{halving steps}$: condition 3 fails']},
      svg:v=>{
      /* three signals of period 1, 1 and 4 on one set of axes; between two
         frames one fades out and the next fades in */
      const k=v?v.frame:0, lo=Math.floor(k), w=k-lo;
      const sig=[
        t=>{const u=t-Math.floor(t); return u<1e-4?NaN:1/u;},
        t=>{const u=t-Math.floor(t); return u<1e-4?0:Math.sin(2*Math.PI/u);},
        t=>{ let u=t-4*Math.floor(t/4), h=1, wd=2;
             for(let i=0;i<12;i++){ if(u<wd) return h; h/=2; u-=wd; wd/=2; } return 0; }];
      const a=AX({xr:[0,4.2],yr:[-1.4,3.3],xlabel:'t',ylabel:'x(t)',xtarget:5});
      const draw=i=>a.curve(sig[i],{color:C.err,n:6000});
      fade(a,1-w,()=>draw(lo));
      if(w>0&&lo<2) fade(a,w,()=>draw(lo+1));
      return a.svg(); },
      caption:'Step through three periodic signals. Each one meets the earlier conditions and fails one.'}
  ], right:[
    {t:'note', kind:'def', head:'Dirichlet conditions', html:'Let $x(t)=x(t+T_0)$ for every $t$.<br>1. $\\int_{T_0}|x(t)|\\,\\d t<\\infty$.<br>2. Finitely many maxima and minima in any finite interval.<br>3. Finitely many jumps in any finite interval, each of finite size.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Sufficient, not necessary', html:'A signal that meets all three has a Fourier series. The series equals $x(t)$ where $x$ is continuous, and the midpoint of the jump where it is not.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Every signal in this module passes', html:'Square waves, sawtooths, impulse trains and sums of sinusoids meet all three. The counterexamples show what each condition tests.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A square wave jumps twice in each period.<div class="nsep"></div>Does it meet the three conditions?',
        ask:{key:'m4-fs-exist', choices:['Yes','No'], answer:0,
          why:'Its area over a period is finite, it does not oscillate, and it has two finite jumps in each period.'}}]}
  ]}
]},

{ id:'m4-fs-synth', module:'M4', nav:'Synthesis equation', title:'Fourier-Series Synthesis', src:'pp. 26–27',
  objective:'State the synthesis equation and set up reading the coefficients off a sum of sinusoids.',
  keywords:'synthesis equation harmonic component a_k euler fundamental frequency worked example', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'pp. 26–27'},
  {t:'title', text:'Fourier-Series Synthesis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-4,4],yr:[-1.1,2.9],xlabel:'t',ylabel:'x(t)',xtarget:9});
      a.curve(t=>1+0.5*Math.cos(2*Math.PI*t)+Math.sin(3*Math.PI*t),{color:C.in,n:2000});
      a.span(0,2,2.6,'T_0=2',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$: a constant and two sinusoids.'}
  ], right:[
    {t:'eq', key:true, tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0 t},\\qquad \\omega_0=\\frac{2\\pi}{T_0}', label:'Synthesis equation',
      note:'$e^{jk\\omega_0t}$ is the $k$-th <b>harmonic</b>. The complex numbers {{sym:ak|$a_k$}} are the Fourier series coefficients.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$.<div class="nsep"></div>What is $\\omega_0$?',
        ask:{key:'m4-fs-synth', choices:['$\\pi$ rad/s','$2\\pi$ rad/s','$3\\pi$ rad/s'], answer:0}}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Find $T_0$, then $\\omega_0=2\\pi/T_0$.</li><li>Write each term with Euler’s relations.</li><li>Match each exponent with $jk\\omega_0t$ and read off $k$.</li></ol>'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\cos\\theta=\\tfrac12\\bigl(e^{j\\theta}+e^{-j\\theta}\\bigr),\\qquad \\sin\\theta=\\tfrac{1}{2j}\\bigl(e^{j\\theta}-e^{-j\\theta}\\bigr)', label:'Euler’s relations',
        note:'The periods $1$ s and $\\tfrac23$ s give $T_0=2$ s, so $\\omega_0=\\pi$ rad/s. The rule comes two slides later.'}]}
  ]}
]},

{ id:'m4-fs-synth-b', module:'M4', nav:'Synthesis · the coefficients', title:'Reading Off the Coefficients', src:'pp. 26–27',
  objective:'Match each exponential to its harmonic and read the magnitudes and phases.',
  keywords:'coefficients magnitude phase a_0 average euler match exponent real signal symmetry', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 26–27'},
  {t:'title', text:'Reading Off the Coefficients'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|a_k|$','$\\angle a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-4.5,4.5],yr:[-0.15,1.3],xlabel:'k',ylabel:'|a_k|',xtarget:9});
        a.stem(D(k=>k===0?1:(Math.abs(k)===2?0.25:(Math.abs(k)===3?0.5:0)),-4,4),{color:C.in,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-4.5,4.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',xtarget:9,
        yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
      a.stem(D(k=>k===3?-Math.PI/2:(k===-3?Math.PI/2:0),-4,4),{color:C.mid,showZero:true});
      return a.svg(); },
      caption:'Step to the phases. Only $k=\\pm3$ carries a phase, because only the sine needed the factor $\\tfrac{1}{2j}$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x(t)&=\\underbrace{1}_{k=0}+\\underbrace{\\tfrac14e^{j2\\omega_0t}+\\tfrac14e^{-j2\\omega_0t}}_{k=\\pm2}\\\\&\\quad+\\underbrace{\\tfrac{1}{2j}e^{j3\\omega_0t}-\\tfrac{1}{2j}e^{-j3\\omega_0t}}_{k=\\pm3}\\end{aligned}', label:'Match each exponent',
      note:'With $\\omega_0=\\pi$: $2\\pi t=2\\omega_0t$ and $3\\pi t=3\\omega_0t$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_0=1,\\quad a_{\\pm2}=\\tfrac14,\\quad a_3=\\tfrac{1}{2j},\\quad a_{-3}=-\\tfrac{1}{2j},\\quad a_k=0\\ \\text{otherwise}', label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The constant is a harmonic', html:'The constant $1$ is the $k=0$ term, $1\\cdot e^{j0\\omega_0t}$. So $a_0=1$, not $0$. It is the average of $x$ over one period.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\tfrac{1}{2j}=-\\tfrac{j}{2}$, so $|a_{\\pm3}|=\\tfrac12$ and $\\angle a_{\\pm3}=\\mp\\tfrac{\\pi}{2}$. The magnitudes are even in $k$ and the phases odd, as for any real $x$.'}]}
  ]}
]},

{ id:'m4-period', module:'M4', nav:'Fundamental period of a sum', title:'Fundamental Period of a Signal Sum', src:'pp. 26–27, 38',
  objective:'Give the rule for the fundamental period of a sum of periodic signals.',
  keywords:'fundamental period least common multiple LCM GCD rational periods sum of sinusoids', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'pp. 26–27, 38'},
  {t:'title', text:'Fundamental Period of a Signal Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.1,3],yr:[-1.3,2.4],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:7});
      a.curve(t=>Math.cos(2*Math.PI*t/(2/9)),{color:C.in,n:3000});
      a.curve(t=>Math.cos(2*Math.PI*t/(8/21)),{color:C.mid,n:3000});
      return a.svg(); },
      caption:'Two components, of periods $2/9$ s and $8/21$ s. They line up again only after a common period.'},
    {t:'legend', items:[['in','$T_1=2/9$'],['mid','$T_2=8/21$']]}
  ], right:[
    {t:'note', kind:'def', head:'When a sum is periodic', html:'A sum is periodic when each component period is a rational multiple of every other. Its period $T_0$ is the smallest positive time that is a whole number of each component period.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'T_0=\\operatorname{LCM}\\!\\left(\\frac{p_1}{q_1},\\frac{p_2}{q_2},\\dots\\right)=\\frac{\\operatorname{LCM}(p_1,p_2,\\dots)}{\\operatorname{GCD}(q_1,q_2,\\dots)}', label:'Period of a sum',
        note:'Write each period in lowest terms first. A constant term has no period and is left out.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not always an integer', html:'Periods $\\tfrac35$ s and $\\tfrac85$ s give $T_0=\\operatorname{LCM}(3,8)/\\operatorname{GCD}(5,5)=\\tfrac{24}{5}$ s.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two components have periods $\\tfrac12$ s and $\\tfrac13$ s.<div class="nsep"></div>What is $T_0$?',
        ask:{key:'m4-period', choices:['$1$ s','$\\tfrac16$ s','$\\tfrac56$ s'], answer:0,
          why:'$\\operatorname{LCM}(1,1)/\\operatorname{GCD}(2,3)=1/1=1$: two cycles of the first and three of the second.'}}]}
  ]}
]},

{ id:'m4-period-ex', module:'M4', nav:'Period of a sum · examples', title:'Fundamental-Period Examples', src:'pp. 26–27, 38',
  objective:'Apply the period rule to three sums and check the answer by division.',
  keywords:'period examples LCM GCD 24/5 8/3 check by division common period smallest', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'pp. 26–27, 38'},
  {t:'title', text:'Fundamental-Period Examples'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.1,3],yr:[-2.4,3.3],xlabel:'t',ylabel:'\\text{sum}',xtarget:7});
      a.curve(t=>Math.cos(2*Math.PI*t/(2/9))+Math.cos(2*Math.PI*t/(8/21)),{color:C.out,n:4000});
      a.vline(0,{color:C.coral}); a.vline(8/3,{color:C.coral});
      a.span(0,8/3,2.8,'T_0=8/3',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'The sum of the two components first repeats after $8/3$ s: twelve cycles of the first and seven of the second.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}1,\\ \\tfrac23&:\\ \\frac{\\operatorname{LCM}(1,2)}{\\operatorname{GCD}(1,3)}=2\\\\ \\tfrac35,\\ \\tfrac85&:\\ \\frac{\\operatorname{LCM}(3,8)}{\\operatorname{GCD}(5,5)}=\\tfrac{24}{5}\\\\ 2,\\ 1,\\ \\tfrac23&:\\ \\frac{\\operatorname{LCM}(2,1,2)}{\\operatorname{GCD}(1,1,3)}=2\\end{aligned}', label:'Three sums, periods in seconds'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Divide by the GCD', html:'For $\\tfrac29$ and $\\tfrac{8}{21}$ the rule gives $\\operatorname{LCM}(2,8)/\\operatorname{GCD}(9,21)=\\tfrac83$. Dividing by $\\operatorname{LCM}(9,21)=63$ gives $\\tfrac{8}{63}$, which is not a multiple of either period.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$\\tfrac83\\div\\tfrac29=12$ and $\\tfrac83\\div\\tfrac{8}{21}=7$. Both are whole numbers and $\\gcd(12,7)=1$, so $\\tfrac83$ s is the smallest common period.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'Two components have periods $\\tfrac43$ s and $\\tfrac25$ s.<div class="nsep"></div>What is $T_0$?',
        ask:{key:'m4-period-ex', choices:['$4$ s','$\\tfrac{4}{15}$ s','$2$ s'], answer:0,
          why:'$\\operatorname{LCM}(4,2)/\\operatorname{GCD}(3,5)=4/1=4$, and $4\\div\\tfrac43=3$, $4\\div\\tfrac25=10$.'}}]}
  ]}
]},

{ id:'m4-fs-coef', module:'M4', nav:'Analysis equation', title:'Fourier-Series Analysis', src:'p. 28',
  objective:'State the analysis equation and the sign that separates it from synthesis.',
  keywords:'analysis equation coefficients integral over one period sign of exponent pair', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'p. 28'},
  {t:'title', text:'Fourier-Series Analysis'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-1.2,1.2],yr:[-1.3,2.3],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:7});
      a.curve(t=>Math.cos(2*Math.PI*t),{color:C.in,n:1200});
      a.curve(t=>Math.cos(4*Math.PI*t),{color:C.mid,n:1200});
      a.vline(-0.5,{color:C.coral,dash:'4 4'}); a.vline(0.5,{color:C.coral,dash:'4 4'});
      return a.svg(); },
      caption:'Two harmonics of $T_0=1$: $k=1$ and $k=2$. The dashed lines mark one period.'},
    {t:'legend', items:[['in','$\\cos(2\\pi t)$'],['mid','$\\cos(4\\pi t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Why a formula', html:'Reading coefficients off works only for a sum of sinusoids. Every other periodic signal needs a formula.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0 t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T_0}', label:'Analysis equation',
        note:'$\\int_{T_0}$ means over any one period. The integrand repeats, so every period gives the same value.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Only the sign differs', html:'Synthesis uses $e^{+jk\\omega_0t}$ and analysis uses $e^{-jk\\omega_0t}$, with the same $\\omega_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=e^{j3\\omega_0t}$.<div class="nsep"></div>For which $k$ is $a_k\\neq0$?',
        ask:{key:'m4-fs-coef', choices:['$k=3$ only','$k=-3$ only','every $k$'], answer:0,
          why:'The signal is the single harmonic $k=3$, so $a_3=1$ and every other $a_k$ is $0$.'}}]}
  ]}
]},

{ id:'m4-fs-proof', module:'M4', nav:'Orthogonality', title:'Orthogonality of Complex Exponentials', src:'p. 28',
  objective:'Prove the analysis equation from the orthogonality of complex exponentials.',
  keywords:'proof orthogonality complex exponentials integral over one period derivation analysis equation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'p. 28'},
  {t:'title', text:'Orthogonality of Complex Exponentials'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\cos(2\\pi t)\\cos(4\\pi t)$','$\\cos^{2}(2\\pi t)$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({xr:[-0.75,0.75],yr:[-1.2,1.35],xlabel:'t',ylabel:'\\text{product}',xtarget:7});
      const g0=t=>Math.cos(2*Math.PI*t)*Math.cos(4*Math.PI*t), g1=t=>Math.cos(2*Math.PI*t)**2;
      const draw=(g,c,fill)=>{ a.area(g,-0.5,0.5,{color:fill}); a.curve(g,{color:c,n:1600}); };
      fade(a,1-f,()=>draw(g0,C.mid,'rgba(106,90,146,.20)'));
      if(f>0) fade(a,f,()=>draw(g1,C.out,'rgba(74,122,70,.22)'));
      a.vline(-0.5,{color:C.coral,dash:'4 4'}); a.vline(0.5,{color:C.coral,dash:'4 4'});
      return a.svg(); },
      caption:'Two different harmonics multiplied: the lobes cancel and the area is zero. A harmonic times itself never goes negative.'}
  ], right:[
    {t:'eq', tex:'\\int_{T_0}x(t)\\,e^{-jn\\omega_0t}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}a_k\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t', label:'Multiply the synthesis equation and integrate',
      note:'Multiply both sides by $e^{-jn\\omega_0t}$ and integrate over one period.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\int_{-T_0/2}^{T_0/2}e^{jm\\omega_0t}\\,\\d t=\\begin{cases}T_0,&m=0\\\\[2pt] \\dfrac{e^{jm\\pi}-e^{-jm\\pi}}{jm\\omega_0}=\\dfrac{2\\sin(m\\pi)}{m\\omega_0}=0,&m\\neq0\\end{cases}', label:'Orthogonality',
        note:'Put $m=k-n$ and use $\\omega_0T_0/2=\\pi$. The sine of a whole multiple of $\\pi$ is zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\int_{T_0}x(t)\\,e^{-jn\\omega_0t}\\,\\d t=T_0\\,a_n\\;\\Longrightarrow\\;a_n=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jn\\omega_0t}\\,\\d t', label:'Only $k=n$ survives',
        note:'Every term with $k\\neq n$ integrates to zero. Rename $n$ as $k$ to get the analysis equation.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$T_0=1$, so $\\omega_0=2\\pi$.<div class="nsep"></div>What is $\\int_0^1 e^{j2\\pi t}\\,e^{-j6\\pi t}\\,\\d t$?',
        ask:{key:'m4-fs-proof', choices:['$0$','$1$','$\\tfrac12$'], answer:0,
          why:'The integrand is $e^{jm\\omega_0t}$ with $m=1-3=-2\\neq0$.'}}]}
  ]}
]},

{ id:'m4-dc', module:'M4', nav:'The DC term', title:'The DC Coefficient', src:'p. 29',
  objective:'Interpret a₀ as the average value over one period.',
  keywords:'DC term a_0 average value zero frequency mean over one period', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis and analysis', src:'p. 29'},
  {t:'title', text:'The DC Coefficient'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\text{half on, half off}$','$\\text{sawtooth}$']},
      svg:v=>{
      const f=cl(v?v.frame:0);
      const a=AX({yticksLeft:true,xr:[-2.2,2.2],yr:[-0.9,1.5],xlabel:'t',ylabel:'x(t)',xtarget:9});
      fade(a,1-f,()=>{ a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000});
        a.hline(0.5,{color:C.coral,dash:'4 5'}); a.note(2.1,0.62,'a_0=1/2',{anchor:'end',color:C.coral,fs:15,tex:true}); });
      if(f>0) fade(a,f,()=>{ a.curve(t=>sawWave(t,1),{color:C.in,n:3000});
        a.hline(0,{color:C.coral,dash:'4 5'}); a.note(2.1,0.62,'a_0=0',{anchor:'end',color:C.coral,fs:15,tex:true}); });
      return a.svg(); },
      caption:'A wave that is 1 for half of each period has average $\\tfrac12$. A sawtooth that is odd about the middle of each period has average $0$.'}
  ], right:[
    {t:'eq', key:true, tex:'a_0=\\frac{1}{T_0}\\int_{T_0}x(t)\\,\\d t', label:'DC coefficient',
      note:'Put $k=0$ in the analysis equation, so $e^{0}=1$. $a_0$ is the average of $x$ over one period.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Read the mean first', html:'Find the average from the graph before any other coefficient. A formula for $a_k$ must agree with it at $k=0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Zero frequency is a harmonic', html:'The $k=0$ term is the constant $a_0$. Dropping it shifts the whole reconstruction by the average value.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=3+\\cos 2t$.<div class="nsep"></div>What is $a_0$?',
        ask:{key:'m4-dc', choices:['$3$','$4$','$0$'], answer:0,
          why:'The cosine averages to zero over a period, so the average of $x$ is $3$.'}}]}
  ]}
]},

realGallery({ id:'m4-real-harmonics', nav:'Harmonics around us',
  title:'Harmonics Around Us', eyebrow:'Module 4 · Synthesis and analysis', src:'pp. 26–29',
  objective:'See periodic everyday signals as sums of harmonics of one fundamental.',
  keywords:'examples guitar string rectifier current monthly temperature electricity demand harmonics fundamental period',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,30],yr:[-2,2.3],xlabel:'t\\;(\\text{ms})',ylabel:'p(t)\\;(\\text{Pa})',xstep:10}));
      a.curve(t=>Math.sin(2*Math.PI*0.11*t)+0.5*Math.sin(2*Math.PI*0.22*t)+0.3*Math.sin(2*Math.PI*0.33*t),{color:C.in,n:1500});
      return a.svg(); }, 'A guitar string at 110 Hz: harmonics at 220 and 330 Hz of amplitude $0.5$ and $0.3$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,40],yr:[-1.3,1.3],xlabel:'t\\;(\\text{ms})',ylabel:'i(t)\\;(\\text{A})',xstep:10}));
      a.curve(t=>Math.sin(2*Math.PI*0.05*t)+0.3*Math.sin(2*Math.PI*0.15*t)+0.1*Math.sin(2*Math.PI*0.25*t),{color:C.in,n:1500});
      return a.svg(); }, 'Mains rectifier current: odd harmonics of 50 Hz, amplitudes $1$, $0.3$ and $0.1$ A.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,36],yr:[0,24],xlabel:'n\\;(\\text{month})',ylabel:'T[n]\\;(^{\\circ}\\text{C})',xstep:12}));
      a.stem(D(n=>12-8*Math.cos(2*Math.PI*n/12),0,36),{color:C.in,r:3});
      return a.svg(); }, 'Monthly mean temperature, $12-8\\cos(2\\pi n/12)$ °C: period 12 months.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,48],yr:[0,45],xlabel:'n\\;(\\text{h})',ylabel:'d[n]\\;(\\text{GW})',xstep:12}));
      a.stem(D(n=>30-6*Math.cos(2*Math.PI*n/24)-4*Math.cos(4*Math.PI*n/24),0,48),{color:C.in,r:2.6});
      return a.svg(); }, 'Hourly electricity demand: two harmonics of a 24-hour period, in GW.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One fundamental', html:'Each signal repeats with period $T_0$. Every component is a whole multiple of $\\omega_0=2\\pi/T_0$.'},
    {t:'note', kind:'warn', head:'The coefficients tell sources apart', html:'Two instruments playing the same note share $\\omega_0$ but have different $a_k$. That is why they sound different.'}
  ]}),

labScene({ id:'m4-lab-q', lab:'Q', nav:'Analysis Probe', title:'The Analysis Integral as a Probe', src:'pp. 26–29',
  objective:'Multiply a periodic signal by one harmonic and read its coefficient off the area over one period.',
  keywords:'laboratory analysis equation orthogonality probe harmonic coefficient area one period' }),

codeScene({ id:'m4-code-synth', nav:'Synthesis and analysis', title:'Synthesis and Analysis in Code', src:'pp. 26–29', eyebrow:'Synthesis and analysis in code',
  objective:'Build periodic signals from coefficients and recover the coefficients in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python synthesis analysis coefficients period orthogonality run' }),


/* ======================================================= 4.3 series worked out */

{ id:'m4-rect', module:'M4', nav:'Rectangular wave · the integral', title:'Rectangular-Wave Coefficients', src:'p. 29',
  objective:'Set up the analysis integral of the periodic rectangular wave and evaluate it for k ≠ 0.',
  keywords:'periodic rectangular wave pulse train coefficients analysis integral limits sine', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 29'},
  {t:'title', text:'Rectangular-Wave Coefficients'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-5,5],yr:[-0.3,1.9],xlabel:'t',ylabel:'x(t)',xtarget:11});
      a.curve(t=>rectWave(t,4,1),{color:C.in,n:3000});
      a.vline(-1,{color:C.coral,dash:'4 4'}); a.vline(1,{color:C.coral,dash:'4 4'});
      a.span(-1,1,1.5,'2T_1',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'The wave for $T_1=1$ and $T_0=4$. Inside the period $-T_0/2<t<T_0/2$ it is 1 only on $-T_1<t<T_1$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1$ for $|t|<T_1$ and $x(t)=0$ for $T_1<|t|<T_0/2$, repeated with period $T_0$.<div class="nsep"></div>What is $a_0$?',
      ask:{key:'m4-rect', choices:['$2T_1/T_0$','$T_1/T_0$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Integrate over $-T_0/2<t<T_0/2$.</li><li>$x=1$ only on $-T_1<t<T_1$, so these are the limits.</li><li>Treat $k=0$ on its own: the antiderivative divides by $k$.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}a_k&=\\frac{1}{T_0}\\int_{-T_1}^{T_1}e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\left[\\frac{e^{-jk\\omega_0t}}{-jk\\omega_0}\\right]_{-T_1}^{T_1}\\\\&=\\frac{1}{k\\omega_0T_0}\\cdot\\frac{e^{jk\\omega_0T_1}-e^{-jk\\omega_0T_1}}{j}\\end{aligned}', label:'Evaluate the integral, $k\\neq0$'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'a_k=\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0T_0}=\\frac{\\sin(2\\pi kT_1/T_0)}{\\pi k}', label:'Use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$',
        note:'Then $\\omega_0T_0=2\\pi$ in the denominator and $\\omega_0T_1=2\\pi T_1/T_0$ inside the sine.'}]}
  ]}
]},

{ id:'m4-rect-b', module:'M4', nav:'Rectangular wave · the result', title:'Rectangular-Wave Solution', src:'p. 29',
  objective:'State both branches of the rectangular-wave coefficients and check them.',
  keywords:'rectangular wave coefficients both branches k=0 duty cycle real even zeros even harmonics', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 29'},
  {t:'title', text:'Rectangular-Wave Solution'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-12.5,12.5],yr:[-0.2,0.62],xlabel:'k',ylabel:'a_k',xtarget:9,ytarget:4});
      a.stem(D(aq,-12,12),{color:C.in,showZero:true});
      return a.svg(); },
      caption:'The coefficients for $T_0=4T_1$. They are real, so no phase plot is needed: a negative stem is a phase of $\\pi$.'}
  ], right:[
    {t:'eq', tex:'a_k=\\begin{cases}\\dfrac{2T_1}{T_0},&k=0\\\\[10pt]\\dfrac{\\sin(2\\pi kT_1/T_0)}{\\pi k},&k\\neq0\\end{cases}', label:'Solution',
      note:'$a_0=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\,\\d t=\\frac{2T_1}{T_0}$: the fraction of each period the pulse fills.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Check', html:'As $k\\to0$, $\\sin\\theta/\\theta\\to1$, so the second branch tends to $2T_1/T_0$. And $x$ is real and even, so every $a_k$ is real and even in $k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Half duty, no even harmonics', html:'For $T_0=4T_1$, $a_k=\\sin(\\pi k/2)/(\\pi k)$. It is zero at every even $k\\neq0$, because $\\sin$ of a whole multiple of $\\pi$ is zero.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$T_0=4T_1$.<div class="nsep"></div>What is $a_1$?',
        ask:{key:'m4-rect-b', choices:['$1/\\pi$','$1/(2\\pi)$','$0$'], answer:0,
          why:'$a_1=\\sin(\\pi/2)/\\pi=1/\\pi\\approx0.318$.'}}]}
  ]}
]},

{ id:'m4-rect-sample', module:'M4', nav:'Rectangular wave · envelope', title:'Rectangular-Wave Spectral Envelope', src:'p. 29',
  objective:'Separate the continuous envelope from the samples of it that are the coefficients.',
  keywords:'envelope sinc sampling harmonic spacing 2 pi / T0 period longer duty cycle', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Series worked out', src:'p. 29'},
  {t:'title', text:'Rectangular-Wave Spectral Envelope'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$T_0=4T_1$','$T_0=8T_1$']},
      svg:v=>{
      /* a_k placed at w = k w0, with the envelope E(w)/T0 they sample; T1 = 1 */
      const f=cl(v?v.frame:0), E=w=>Math.abs(w)<1e-9?2:2*Math.sin(w)/w;
      const a=AX({yticksLeft:true,xr:[-10,10],yr:[-0.16,0.62],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'a_k',xtarget:9,ytarget:4});
      const one=T0=>{ const w0=2*Math.PI/T0;
        a.curve(w=>E(w)/T0,{color:C.mid,dash:'6 5',n:900});
        const pts=[]; for(let k=-20;k<=20;k++){ const w=k*w0; if(Math.abs(w)<=10) pts.push([w,E(w)/T0]); }
        a.stem(pts,{color:C.in,r:3.4,showZero:true}); };
      fade(a,1-f,()=>one(4));
      if(f>0) fade(a,f,()=>one(8));
      return a.svg(); },
      caption:'Each $a_k$ sits at $\\omega=k\\omega_0$ on the dashed envelope $E(\\omega)/T_0$. Step to a longer period and compare.'},
    {t:'legend', items:[['mid','$E(\\omega)/T_0$',true],['in','$a_k$']]}
  ], right:[
    {t:'eq', key:true, tex:'E(\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)', label:'Envelope',
      note:'Here $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, the unnormalised sinc. $E$ depends on one pulse only, not on $T_0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_k=\\frac{1}{T_0}\\,E(k\\omega_0)=\\frac{1}{T_0}\\cdot\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0}=\\frac{\\sin(2\\pi kT_1/T_0)}{\\pi k}', label:'Sample it at the harmonics'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'A longer period', html:'Keep the pulse and raise $T_0$. The envelope stays. The samples come closer, $\\omega_0=2\\pi/T_0$, and each one scales by $1/T_0$. Module 5 takes this limit.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The pulse stays and $T_0$ doubles.<div class="nsep"></div>What happens to $a_0$?',
        ask:{key:'m4-rect-sample', choices:['It halves','It doubles','It stays'], answer:0,
          why:'$a_0=2T_1/T_0$, and $T_0$ is in the denominator.'}}]}
  ]}
]},

{ id:'m4-howmany', module:'M4', nav:'Harmonic truncation', title:'Truncation Error and Harmonic Count', src:'p. 30',
  objective:'Define the truncated series and the mean-square error, and read how the error falls.',
  keywords:'truncation partial sum mean square error MSE convergence harmonics kept', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Series worked out', src:'p. 30'},
  {t:'title', text:'Truncation Error and Harmonic Count'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      live:{controls:[{k:'N', label:'$N$', min:1, max:41, step:2, v:3, show:v=>'$'+v+'$'}]},
      svg:v=>{
      const N=v?v.N:3;
      const a=AX({yticksLeft:true,xr:[-6,6],yr:[-0.4,1.9],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:13});
      a.curve(t=>rectWave(t,4,1),{color:C.in,dash:'9 6',n:3000});
      a.curve(t=>rectPS(t,N,4,1),{color:C.out,n:3000});
      return a.svg(); },
      caption:'Drag $N$. The partial sum $x_N$ of the wave with $T_0=4T_1$ closes on $x$, but the ripple beside each jump stays.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x_N(t)$']]}
  ], right:[
    {t:'eq', tex:'x_N(t)=\\sum_{k=-N}^{N}a_k\\,e^{jk\\omega_0t}', label:'Truncated series',
      note:'Keep the $2N+1$ coefficients nearest zero frequency and drop the rest.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\text{MSE}=\\frac{1}{T_0}\\int_{T_0}\\bigl|x(t)-x_N(t)\\bigr|^{2}\\,\\d t', label:'Mean-square error',
        note:'{{sym:mse|Mean-square error}}: square the error, then average it over one period.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The error for $T_0=4T_1$', html:'MSE $=0.025$ at $N=3$, $0.010$ at $N=9$, $0.004$ at $N=27$ and $0.001$ at $N=81$. It goes to zero as $N\\to\\infty$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'For this wave $|a_k|$ falls like $1/k$.<div class="nsep"></div>For large $N$, what does doubling $N$ do to the MSE?',
        ask:{key:'m4-howmany', choices:['It about halves','It about quarters','Nothing'], answer:0,
          why:'The MSE is the dropped power $\\sum_{|k|>N}|a_k|^{2}$. With $|a_k|^{2}\\sim1/k^{2}$ that tail falls like $1/N$.'}}]}
  ]}
]},

{ id:'m4-howmany-b', module:'M4', nav:'The Gibbs phenomenon', title:'The Gibbs Phenomenon', src:'p. 30',
  objective:'Describe the Gibbs overshoot beside a jump and separate it from the mean-square error.',
  keywords:'Gibbs phenomenon overshoot 9 percent jump ringing convergence in the mean width shrinks', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Series worked out', src:'p. 30'},
  {t:'title', text:'The Gibbs Phenomenon'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$N=9$','$N=27$','$N=81$']},
      svg:v=>{
      const k=v?v.frame:0, lo=Math.floor(k), w=k-lo, Ns=[9,27,81];
      const a=AX({xr:[0.4,1.6],yr:[-0.25,1.4],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:7});
      a.curve(t=>rectWave(t,4,1),{color:C.in,dash:'9 6',n:3000});
      fade(a,1-w,()=>a.curve(t=>rectPS(t,Ns[lo],4,1),{color:C.out,n:4000}));
      if(w>0&&lo<2) fade(a,w,()=>a.curve(t=>rectPS(t,Ns[lo+1],4,1),{color:C.out,n:4000}));
      a.hline(1.0895,{color:C.coral,dash:'4 5'});
      a.note(1.58,1.2,'\\text{about }9\\%\\text{ of the jump}',{anchor:'end',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'The jump at $t=1$, magnified. More harmonics squeeze the ripple towards the jump, but its peak stays near $1.09$.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x_N(t)$']], at:'tl'}
  ], right:[
    {t:'note', kind:'err', head:'The overshoot stays', html:'Near a jump the partial sum overshoots by about $9\\%$ of the jump. The overshoot does not shrink as $N$ grows.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'What shrinks is the width', html:'The ripple moves into a narrower band around the jump. So the mean-square error still goes to zero while the largest error does not.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Convergence in the mean', html:'For a signal that meets the Dirichlet conditions, the series converges in the mean: $\\text{MSE}\\to0$. It does not promise a small error at every $t$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A square wave jumps from $0$ to $2$.<div class="nsep"></div>About how high does $x_{81}$ reach beside the jump?',
        ask:{key:'m4-howmany-b', choices:['$2.18$','$2.02$','$2.00$'], answer:0,
          why:'The overshoot is about $9\\%$ of the jump $2$, that is about $0.18$.'}}]}
  ]}
]},

{ id:'m4-saw', module:'M4', nav:'Sawtooth wave', title:'Fourier Series of a Sawtooth Wave', src:'pp. 30–31',
  objective:'Set up the sawtooth coefficients with integration by parts.',
  keywords:'sawtooth wave coefficients integration by parts odd signal derivation', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 30–31'},
  {t:'title', text:'Fourier Series of a Sawtooth Wave'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-1.7,1.7],yr:[-0.8,1.15],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:7});
      a.curve(t=>sawWave(t,1),{color:C.in,dash:'9 6',n:4000});
      a.curve(t=>sawPS(t,9,1),{color:C.out,n:4000});
      return a.svg(); },
      caption:'The sawtooth for $T_0=1$ and its partial sum with $N=9$. The same overshoot appears beside each jump.'},
    {t:'legend', items:[['in','$x(t)$',true],['out','$x_9(t)$']]}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=t$ for $-T_0/2<t<T_0/2$, repeated with period $T_0$.<div class="nsep"></div>What is $a_0$?',
      ask:{key:'m4-saw', choices:['$0$','$T_0/2$','$T_0/4$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_0=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,\\d t=\\frac{1}{T_0}\\left[\\frac{t^{2}}{2}\\right]_{-T_0/2}^{T_0/2}=\\frac{1}{T_0}\\left(\\frac{T_0^{2}}{8}-\\frac{T_0^{2}}{8}\\right)=0', label:'The term $k=0$'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', side:true, tex:'\\int t\\,e^{at}\\,\\d t=\\frac{(at-1)\\,e^{at}}{a^{2}}', label:'Integration by parts',
        note:'Check it by differentiating the right side.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\,\\frac{1}{(-jk\\omega_0)^{2}}\\Bigl[(-jk\\omega_0t-1)\\,e^{-jk\\omega_0t}\\Bigr]_{-T_0/2}^{T_0/2}', label:'Apply it with $a=-jk\\omega_0$, $k\\neq0$'}]}
  ]}
]},

{ id:'m4-saw-b', module:'M4', nav:'Sawtooth · result', title:'Sawtooth Coefficients and Symmetry', src:'p. 31',
  objective:'Evaluate the sawtooth coefficients and read the odd-signal symmetry off them.',
  keywords:'sawtooth result purely imaginary magnitude 0.159 phase alternating symmetry real odd', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 31'},
  {t:'title', text:'Sawtooth Coefficients and Symmetry'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|a_k|$','$\\angle a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-10.5,10.5],yr:[-0.02,0.2],xlabel:'k',ylabel:'|a_k|',xtarget:9,ytarget:4});
        a.stem(D(k=>k===0?0:1/(2*Math.abs(k)*Math.PI),-10,10),{color:C.in,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-10.5,10.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',xtarget:9,
        yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
      a.stem(D(k=>k===0?0:(Math.pow(-1,k)/k>0?Math.PI/2:-Math.PI/2),-10,10),{color:C.mid,showZero:true});
      return a.svg(); },
      caption:'$T_0=1$. The magnitudes fall like $1/|k|$ from $0.159$ at $k=\\pm1$. Every phase is $\\pm\\pi/2$.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}a_k&=\\frac{-1}{T_0k^{2}\\omega_0^{2}}\\Bigl[(-jk\\pi-1)(-1)^{k}-(jk\\pi-1)(-1)^{k}\\Bigr]\\\\&=\\frac{2jk\\pi(-1)^{k}}{T_0k^{2}\\omega_0^{2}}=\\frac{jT_0(-1)^{k}}{2k\\pi}\\end{aligned}', label:'Evaluate at $t=\\pm T_0/2$',
      note:'There $-jk\\omega_0t=\\mp jk\\pi$ and $e^{\\mp jk\\pi}=(-1)^{k}$. Then $\\omega_0^{2}=4\\pi^{2}/T_0^{2}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_k=\\begin{cases}0,&k=0\\\\[6pt]\\dfrac{jT_0(-1)^{k}}{2k\\pi},&k\\neq0\\end{cases}', label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Magnitude and phase', html:'$|a_k|=\\dfrac{T_0}{2\\pi|k|}$, so for $T_0=1$ the largest is $|a_{\\pm1}|=\\tfrac{1}{2\\pi}\\approx0.159$. Each $a_k$ is purely imaginary, so its phase is $+\\pi/2$ or $-\\pi/2$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Check the symmetry', html:'$x$ is real, so $a_{-k}=a_k^{*}$. $x$ is odd, so $a_{-k}=-a_k$. Together $a_k^{*}=-a_k$: no real part, as the formula shows.'}]}
  ]}
]},

{ id:'m4-imptrain', module:'M4', nav:'Impulse train', title:'Fourier Series of an Impulse Train', src:'p. 31',
  objective:'Compute the coefficients of the impulse train and read the flat spectrum.',
  keywords:'periodic impulse train delta comb sifting property flat spectrum a_k = 1/T0', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 31'},
  {t:'title', text:'Fourier Series of an Impulse Train'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$','$a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-3.5,3.5],yr:[-0.25,1.55],xlabel:'t',ylabel:'x(t)',xtarget:8,ytarget:2});
        [-3,-2,-1,0,1,2,3].forEach(m=>a.impulse(m,1,{color:C.in,labelText:'1'}));
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-9.5,9.5],yr:[-0.25,1.55],xlabel:'k',ylabel:'a_k',xtarget:9,ytarget:2});
      a.stem(D(()=>1,-9,9),{color:C.mid});
      return a.svg(); },
      caption:'$T_0=1$. Each arrow is an impulse of weight 1. Step to the coefficients.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)$.<div class="nsep"></div>What is $a_0$?',
      ask:{key:'m4-imptrain', choices:['$1/T_0$','$0$','$T_0$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Integrate over $-T_0/2<t<T_0/2$. Only the impulse at $t=0$ lies inside, so the sifting property of Module 1 finishes the integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\,e^{-jk\\omega_0\\cdot0}=\\frac{1}{T_0}\\quad\\text{for every }k', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'A flat spectrum', html:'Every harmonic has the same coefficient and zero phase. At $t=0$ they all add; elsewhere they cancel. Module 7 uses this pair for sampling.'}]}
  ]}
]},

realGallery({ id:'m4-real-series', nav:'Fourier series around us',
  title:'Fourier Series Around Us', eyebrow:'Module 4 · Series worked out', src:'pp. 29–31',
  objective:'Recognise pulse waves, ramps and impulse trains in everyday devices.',
  keywords:'examples LED dimming pulse width oscilloscope sweep sawtooth metronome clicks impulse train turn signal',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,4],yr:[-0.5,6.5],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>{ const u=t-Math.floor(t); return u<0.25?5:0; },{color:C.in,n:2400});
      a.hline(1.25,{color:C.coral,dash:'4 5'});
      return a.svg(); }, 'A 1 kHz PWM wave dims an LED: 5 V for a quarter period, so $a_0=1.25$ V.'],
    [()=>{ const a=P.Axes(EXO({xr:[-3,3],yr:[-6.5,6.5],xlabel:'t\\;(\\text{ms})',ylabel:'v(t)\\;(\\text{V})',xstep:1}));
      a.curve(t=>5*sawWave(t,2),{color:C.in,n:2400});
      return a.svg(); }, 'An oscilloscope sweep, $5t$ V on $-1<t<1$ ms: the sawtooth of this section.'],
    [()=>{ const a=P.Axes(EXO({xr:[-0.3,3.2],yr:[-0.2,1.5],xlabel:'t\\;(\\text{s})',ylabel:'c(t)',xstep:0.5}));
      [0,0.5,1,1.5,2,2.5,3].forEach(m=>a.impulse(m,1,{color:C.in}));
      return a.svg(); }, 'A metronome at 120 beats a minute: clicks every $0.5$ s, so $a_k=2$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,32],yr:[-0.1,1.4],xlabel:'n\\;(0.1\\,\\text{s})',ylabel:'\\ell[n]',xstep:8}));
      a.stem(D(n=>(((n%8)+8)%8)<4?1:0,0,31),{color:C.in,r:3,showZero:true});
      return a.svg(); }, 'A turn signal read every $0.1$ s, on for 4 of 8 samples: $a_0=\\tfrac12$.']
  ],
  notes:[
    {t:'note', kind:'def', head:'Duty cycle is the average', html:'A pulse wave that is on for a fraction $D$ of each period has $a_0=D$ times its height.'},
    {t:'note', kind:'warn', head:'Sharp edges need many harmonics', html:'A jump makes $|a_k|$ fall only like $1/k$. That is why a pulse wave has strong high harmonics.'}
  ]}),

labScene({ id:'m4-lab-f', lab:'F', nav:'Reconstruction', title:'Fourier-Series Reconstruction Studio', src:'pp. 29–31',
  objective:'Compare a partial sum with the waveform and measure the Gibbs overshoot.',
  keywords:'laboratory reconstruction partial sum harmonics MSE gibbs overshoot square sawtooth triangle impulse train' }),

codeScene({ id:'m4-code-series', nav:'Series worked out', title:'Fourier Series in Code', src:'pp. 29–31', eyebrow:'Series worked out in code',
  objective:'Compute the coefficients and partial sums of the rectangular wave, the sawtooth and the impulse train in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python rectangular wave sawtooth impulse train partial sum gibbs mean square error run' }),


/* ======================================================= 4.4 the discrete-time series */

{ id:'m4-dtfs', module:'M4', nav:'Discrete-time series', title:'Discrete-Time Fourier Series', src:'p. 32',
  objective:'State the discrete-time Fourier series pair and read why it is finite.',
  keywords:'DTFS discrete time fourier series synthesis analysis finite sum N coefficients', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The discrete-time series', src:'p. 32'},
  {t:'title', text:'Discrete-Time Fourier Series'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-9,17],yr:[-1.6,1.9],xlabel:'n',ylabel:'x[n]',xtarget:9});
      a.stem(D(n=>Math.cos(2*Math.PI*n/8)+0.4*Math.sin(4*Math.PI*n/8),-9,17),{color:C.in,r:3.2});
      a.vline(0,{color:C.coral,dash:'4 4'}); a.vline(8,{color:C.coral,dash:'4 4'});
      a.span(0,8,1.6,'N=8',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'$x[n]=\\cos(2\\pi n/8)+0.4\\sin(4\\pi n/8)$, with one period of $N=8$ marked.'}
  ], right:[
    {t:'eq', tex:'x[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk(2\\pi/N)n}', label:'Synthesis',
      note:'$x[n]=x[n+N]$ for every $n$, and $\\omega_0=2\\pi/N$ rad/sample.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}', label:'Analysis',
        note:'$\\langle N\\rangle$ means any $N$ consecutive values of the index. Both sums are finite.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Exact and finite', html:'$N$ numbers describe the sequence, and $N$ terms rebuild it. There is no limit and no question of convergence.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'A sequence has period $N=8$.<div class="nsep"></div>How many distinct coefficients can it have?',
        ask:{key:'m4-dtfs', choices:['$8$','$16$','infinitely many'], answer:0,
          why:'The synthesis sum runs over one period of $k$, so $8$ coefficients rebuild every sample.'}}]}
  ]}
]},

{ id:'m4-dtfs-b', module:'M4', nav:'Periodic coefficients', title:'The Coefficients Repeat', src:'p. 32',
  objective:'Prove that the discrete-time coefficients repeat with period N, and why continuous time has no such rule.',
  keywords:'periodic coefficients a_{k+N}=a_k proof integer index e^{-j2 pi n}=1 continuous time differs', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The discrete-time series', src:'p. 32'},
  {t:'title', text:'The Coefficients Repeat'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-9,17],yr:[-0.08,0.72],xlabel:'k',ylabel:'|a_k|',xtarget:9,ytarget:4});
      const mag=k=>{ const m=((k%8)+8)%8; return (m===1||m===7)?0.5:((m===2||m===6)?0.2:0); };
      a.stem(D(mag,-9,17),{color:C.mid,r:3.2,showZero:true});
      a.vline(-0.5,{color:C.coral,dash:'4 4'}); a.vline(7.5,{color:C.coral,dash:'4 4'});
      a.span(-0.5,7.5,0.62,'\\text{one period of }k',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'The magnitudes of the coefficients of the sequence on the previous slide. The pattern repeats every 8 steps in $k$.'}
  ], right:[
    {t:'eq', key:true, tex:'a_{k+N}=a_k', label:'The coefficients are periodic in $k$'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_{k+N}=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}\\underbrace{e^{-j2\\pi n}}_{=\\,1}=a_k', label:'Proof',
        note:'Replace $k$ by $k+N$ in the analysis sum. The extra factor is $1$ because $n$ is an integer.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Not in continuous time', html:'The same step in continuous time gives $e^{-j2\\pi t}$, which is not $1$ between integers. Continuous-time coefficients do not repeat.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=8$ and $a_3=0.2j$.<div class="nsep"></div>What is $a_{11}$?',
        ask:{key:'m4-dtfs-b', choices:['$0.2j$','$-0.2j$','$0$'], answer:0,
          why:'$11=3+8$, so $a_{11}=a_3$.'}}]}
  ]}
]},

{ id:'m4-dtfs-ex', module:'M4', nav:'Discrete-time example · the period', title:'A Sum of Two Sequences', src:'p. 32',
  objective:'Find the period of a sum of a sine and a cosine sequence and the harmonic of each.',
  keywords:'discrete example period LCM 24 harmonic number integer period sinusoid sequence', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 32'},
  {t:'title', text:'A Sum of Two Sequences'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const f=n=>Math.sin(5*Math.PI*n/6)+Math.cos(3*Math.PI*n/4+Math.PI/5);
      const a=AX({yticksLeft:true,xr:[-26,26],yr:[-2.3,2.9],xlabel:'n',ylabel:'x[n]',xtarget:9});
      a.stem(D(f,-26,26),{color:C.in,r:2.6});
      return a.svg(); },
      caption:'Two sinusoids added. Count the samples before the pattern returns.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\sin\\!\\left(\\tfrac{5\\pi}{6}n\\right)+\\cos\\!\\left(\\tfrac{3\\pi}{4}n+\\tfrac{\\pi}{5}\\right)$.<div class="nsep"></div>What is the fundamental period?',
      ask:{key:'m4-dtfs-ex', choices:['$24$','$12$','$8$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>A sinusoid of frequency $\\omega$ repeats after $N=(2\\pi/\\omega)\\,m$ samples, for the smallest $m$ that makes $N$ an integer.</li><li>Take the least common multiple of the two periods.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\begin{aligned}\\omega=\\tfrac{5\\pi}{6}&:\\ N=\\tfrac{12}{5}m,\\ m=5\\ \\Rightarrow\\ N=12\\\\ \\omega=\\tfrac{3\\pi}{4}&:\\ N=\\tfrac{8}{3}m,\\ m=3\\ \\Rightarrow\\ N=8\\\\ N_0&=\\operatorname{LCM}(12,8)=24\\end{aligned}', label:'Component periods'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'\\omega_0=\\frac{2\\pi}{24},\\qquad \\frac{5\\pi}{6}=10\\,\\omega_0,\\qquad \\frac{3\\pi}{4}=9\\,\\omega_0', label:'Harmonic numbers',
        note:'Each component frequency is a whole multiple of $\\omega_0$, so each is a harmonic of one series.'}]}
  ]}
]},

{ id:'m4-dtfs-ex-b', module:'M4', nav:'Discrete-time example · the coefficients', title:'The Coefficients of the Sum', src:'p. 32',
  objective:'Read the discrete-time coefficients off the Euler expansion and check the symmetry.',
  keywords:'discrete example coefficients euler a_9 a_10 magnitude phase conjugate symmetry', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 32'},
  {t:'title', text:'The Coefficients of the Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|a_k|$','$\\angle a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-12.5,12.5],yr:[-0.06,0.66],xlabel:'k',ylabel:'|a_k|',xtarget:9,ytarget:4});
        a.stem(D(k=>(Math.abs(k)===9||Math.abs(k)===10)?0.5:0,-12,12),{color:C.in,r:3,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-12.5,12.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',xtarget:9,
        yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
      a.stem(D(k=>k===9?Math.PI/5:(k===-9?-Math.PI/5:(k===10?-Math.PI/2:(k===-10?Math.PI/2:0))),-12,12),{color:C.mid,r:3,showZero:true});
      return a.svg(); },
      caption:'One period of the coefficients, $-12\\le k\\le11$, and $k=12\\equiv-12$. Outside it the same stems repeat every 24.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}x[n]&=\\tfrac{1}{2j}e^{j10\\omega_0n}-\\tfrac{1}{2j}e^{-j10\\omega_0n}\\\\&\\quad+\\tfrac12e^{j\\pi/5}e^{j9\\omega_0n}+\\tfrac12e^{-j\\pi/5}e^{-j9\\omega_0n}\\end{aligned}', label:'Expand with Euler’s relations'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_{10}=\\tfrac{1}{2j},\\quad a_{-10}=-\\tfrac{1}{2j},\\quad a_{9}=\\tfrac12e^{j\\pi/5},\\quad a_{-9}=\\tfrac12e^{-j\\pi/5}', label:'Solution',
        note:'Every other coefficient in one period is zero, and $a_k=a_{k+24}$ gives all the rest.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$x$ is real, so $a_{-k}=a_k^{*}$. All four magnitudes are $\\tfrac12$. The phases are $\\angle a_{\\pm9}=\\pm\\pi/5$ and $\\angle a_{\\pm10}=\\mp\\pi/2$: odd in $k$.'}]}
  ]}
]},

{ id:'m4-dt-square', module:'M4', nav:'DT square wave · the sum', title:'Discrete-Time Square-Wave Coefficients', src:'p. 33',
  objective:'Set up the discrete square-wave coefficients as a finite geometric sum and state its condition.',
  keywords:'discrete rectangular wave geometric sum finite r != 1 condition unit circle', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 33'},
  {t:'title', text:'Discrete-Time Square-Wave Coefficients'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$: $N=10$, $N_1=2$','$\\text{the ratio }r=e^{-jk2\\pi/10}$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-16,16],yr:[-0.25,1.8],xlabel:'n',ylabel:'x[n]',xtarget:9,ytarget:2});
        a.stem(D(n=>{const m=n-10*Math.round(n/10); return Math.abs(m)<=2?1:0;},-16,16),{color:C.in,r:3,showZero:true});
        a.span(8,12,1.35,'2N_1+1',{color:C.coral,fs:15,tex:true});
        return a.svg(); }
      /* the unit circle is drawn round: the horizontal range is set from the
         shape of the data area, which the column decides */
      const a0=AX({yticksLeft:true,xr:[-1.6,1.6],yr:[-1.4,1.4]}), r=(a0.x1-a0.x0)/(a0.y0-a0.y1);
      const a=AX({yticksLeft:true,h:a0.H,xr:[-1.4*r,1.4*r],yr:[-1.4,1.4],xlabel:'\\operatorname{Re}\\{r\\}',ylabel:'\\operatorname{Im}\\{r\\}',xtarget:5});
      a.curve(x=>Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:800});
      a.curve(x=>-Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:800});
      for(let k=0;k<10;k++){ const th=-2*Math.PI*k/10; a.point(Math.cos(th),Math.sin(th),{color:k===0?C.err:C.in,r:5}); }
      a.note(1.12,0.2,'r=1\\text{ at }k=0',{anchor:'start',color:C.err,fs:15,tex:true});
      return a.svg(); },
      caption:'Five ones and five zeros in every period. Step to the ten values of the ratio: all have $|r|=1$, and only $k=0$ gives $r=1$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=1$ for $|n|\\le N_1$ and $x[n]=0$ for $N_1<|n|\\le N/2$, with period $N$.<div class="nsep"></div>What is $a_0$?',
      ask:{key:'m4-dt-square', choices:['$(2N_1+1)/N$','$2N_1/N$','$N_1/N$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'Sum over one period. $x=1$ only for $-N_1\\le n\\le N_1$, so $a_k=\\frac1N\\sum_{n=-N_1}^{N_1}r^{\\,n}$, a finite geometric sum with $r=e^{-jk2\\pi/N}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', side:true, tex:'\\sum_{n=m}^{p}r^{\\,n}=\\frac{r^{m}-r^{\\,p+1}}{1-r}', label:'Finite geometric sum',
        note:'A finite sum needs only $r\\neq1$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Here $|r|=1$', html:'$r$ lies on the unit circle for every $k$, so the rule $|r|<1$ of an infinite sum does not apply. The finite sum fails only where $r=1$, at $k=0,\\pm N,\\dots$'}]}
  ]}
]},

{ id:'m4-dt-square-b', module:'M4', nav:'DT square wave · the result', title:'Discrete-Time Square-Wave Solution', src:'pp. 33–34',
  objective:'Evaluate the geometric sum, symmetrise it and state both branches.',
  keywords:'discrete square wave coefficients geometric sum symmetrise sine ratio both branches (2N1+1)/N', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 33–34'},
  {t:'title', text:'Discrete-Time Square-Wave Solution'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-15.5,15.5],yr:[-0.2,0.66],xlabel:'k',ylabel:'a_k',xtarget:9,ytarget:4});
      a.stem(D(k=>dtRect(k,10,2),-15,15),{color:C.in,r:3,showZero:true});
      return a.svg(); },
      caption:'The coefficients for $N=10$ and $N_1=2$. The peak $a_0=0.5$ returns at $k=\\pm10$.'}
  ], right:[
    {t:'eq', tex:'\\sum_{n=-N_1}^{N_1}r^{\\,n}=\\frac{r^{-N_1}-r^{\\,N_1+1}}{1-r}=\\frac{e^{+jk\\frac{2\\pi}{N}N_1}-e^{-jk\\frac{2\\pi}{N}(N_1+1)}}{1-e^{-jk\\frac{2\\pi}{N}}}', label:'Apply it with $m=-N_1$, $p=N_1$',
      note:'The lower limit is $-N_1$, so the first exponent is <b>positive</b>.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\frac{e^{-jk\\pi/N}\\cdot2j\\sin\\bigl(\\tfrac{2\\pi k}{N}(N_1+\\tfrac12)\\bigr)}{e^{-jk\\pi/N}\\cdot2j\\sin\\bigl(\\tfrac{\\pi k}{N}\\bigr)}', label:'Take $e^{-jk\\pi/N}$ out of the top and the bottom',
        note:'Each bracket left is $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. The common factors cancel.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_k=\\begin{cases}\\dfrac{2N_1+1}{N},&k=0,\\pm N,\\pm2N,\\dots\\\\[12pt]\\dfrac{\\sin\\bigl(\\tfrac{2\\pi k}{N}(N_1+\\tfrac12)\\bigr)}{N\\sin(\\pi k/N)},&\\text{otherwise}\\end{cases}', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Check', html:'At $r=1$ each of the $2N_1+1$ terms is $1$. That is the average, $a_0=(2\\cdot2+1)/10=0.5$ for $N=10$, $N_1=2$.'}]}
  ]}
]},

{ id:'m4-dt-square-c', module:'M4', nav:'DT square wave · reading the result', title:'Reading the Discrete Spectrum', src:'pp. 33–34',
  objective:'Read how N and N₁ shape the coefficients and why the reconstruction is exact.',
  keywords:'discrete square wave spectrum period N width N1 exact reconstruction no Gibbs', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · The discrete-time series', src:'pp. 33–34'},
  {t:'title', text:'Reading the Discrete Spectrum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$N=10$','$N=20$','$N=30$']},
      svg:v=>{
      const k=v?v.frame:0, lo=Math.floor(k), w=k-lo, Ns=[10,20,30];
      const a=AX({yticksLeft:true,xr:[-46.5,46.5],yr:[-0.2,0.66],xlabel:'k',ylabel:'a_k',xtarget:9,ytarget:4});
      fade(a,1-w,()=>a.stem(D(q=>dtRect(q,Ns[lo],2),-45,45),{color:C.in,r:2.2,showZero:true}));
      if(w>0&&lo<2) fade(a,w,()=>a.stem(D(q=>dtRect(q,Ns[lo+1],2),-45,45),{color:C.in,r:2.2,showZero:true}));
      return a.svg(); },
      caption:'$N_1=2$ throughout. Each peak is $5/N$ and repeats every $N$ in $k$.'}
  ], right:[
    {t:'note', kind:'ok', head:'What each parameter does', html:'The $2N_1+1$ ones set the height and width of each lobe. The period $N$ sets how far apart the peaks repeat, and scales every coefficient by $1/N$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk(2\\pi/N)n}', label:'Rebuild from all $N$ coefficients',
        note:'With all $N$ terms every sample lands on $1$ or $0$ exactly.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'No Gibbs phenomenon', html:'The sum has $N$ terms and stops. Nothing is truncated, so there is no overshoot that refuses to shrink.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$N=12$ and $N_1=1$.<div class="nsep"></div>What is $a_0$?',
        ask:{key:'m4-dt-square-c', choices:['$\\tfrac14$','$\\tfrac{1}{12}$','$\\tfrac16$'], answer:0,
          why:'$a_0=(2\\cdot1+1)/12=\\tfrac{3}{12}=\\tfrac14$.'}}]}
  ]}
]},

{ id:'m4-dt-saw', module:'M4', nav:'DT sawtooth · pairing', title:'Discrete-Time Sawtooth Series', src:'pp. 34–35',
  objective:'Compute the coefficients of an odd period-11 sequence by pairing terms.',
  keywords:'discrete sawtooth N=11 odd sequence pairing sine sum purely imaginary', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 34–35'},
  {t:'title', text:'Discrete-Time Sawtooth Series'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-17.8,17.8],yr:[-6.4,7.4],xlabel:'n',ylabel:'x[n]',xtarget:9});
      a.stem(D(n=>n-11*Math.round(n/11),-17,17),{color:C.in,r:3,showZero:true});
      a.span(6,16,6.6,'N=11',{color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'A ramp from $-5$ to $5$, repeated every 11 samples.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=n$ for $-5\\le n\\le5$, repeated with period $N=11$.<div class="nsep"></div>What is $a_0$?',
      ask:{key:'m4-dt-saw', choices:['$0$','$5/11$','$1$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'The sequence is odd. Pair the term at $n$ with the term at $-n$ before expanding anything.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'n\\,e^{-jk\\omega_0n}+(-n)\\,e^{jk\\omega_0n}=-n\\bigl(e^{jk\\omega_0n}-e^{-jk\\omega_0n}\\bigr)=-2jn\\sin(k\\omega_0n)', label:'Pair the terms at $n$ and $-n$',
        note:'Here $\\omega_0=2\\pi/11$. The term $n=0$ adds nothing.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'a_k=\\frac{1}{11}\\sum_{m=1}^{5}\\bigl(-2jm\\sin(k\\omega_0m)\\bigr)=-\\frac{2j}{11}\\sum_{m=1}^{5}m\\sin\\!\\left(\\frac{2\\pi km}{11}\\right)', label:'Solution'}]}
  ]}
]},

{ id:'m4-dt-saw-b', module:'M4', nav:'DT sawtooth · reading the result', title:'Reading the Sawtooth Coefficients', src:'pp. 34–35',
  objective:'Read the structure, the largest value and the periodicity of the sawtooth coefficients.',
  keywords:'discrete sawtooth purely imaginary largest coefficient 1.7747 periodic k odd', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 34–35'},
  {t:'title', text:'Reading the Sawtooth Coefficients'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|a_k|$','$\\angle a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-17.5,17.5],yr:[-0.15,2.1],xlabel:'k',ylabel:'|a_k|',xtarget:9,ytarget:4});
        a.stem(D(k=>Math.abs(sawS(k)),-17,17),{color:C.in,r:2.8,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-17.5,17.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',xtarget:9,
        yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
      a.stem(D(k=>Math.abs(sawS(k))<1e-9?0:(sawS(k)>0?-Math.PI/2:Math.PI/2),-17,17),{color:C.mid,r:2.8,showZero:true});
      return a.svg(); },
      caption:'The largest magnitude sits at $k=\\pm1$ and returns every 11. Only two phases occur.'}
  ], right:[
    {t:'note', kind:'def', head:'Purely imaginary', html:'$x$ is real and odd, so every $a_k$ is purely imaginary. Each phase is $+\\pi/2$ or $-\\pi/2$, and only its sign has to be tracked.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Largest coefficient', html:'<span class="val"><b>$|a_{\\pm1}|=1.7747$</b><small>and again at $k=\\pm10,\\pm12,\\dots$</small></span>'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Eleven numbers', html:'$a_{k+11}=a_k$, so the eleven coefficients from $k=-5$ to $k=5$ are the whole answer.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$a_1=-1.7747j$.<div class="nsep"></div>What is $a_{-1}$?',
        ask:{key:'m4-dt-saw-b', choices:['$1.7747j$','$-1.7747j$','$0$'], answer:0,
          why:'$x$ is odd, so $a_{-k}=-a_k$.'}}]}
  ]}
]},

realGallery({ id:'m4-real-dtfs', nav:'Periodic sequences around us',
  title:'Periodic Sequences Around Us', eyebrow:'Module 4 · The discrete-time series', src:'pp. 32–35',
  objective:'Recognise everyday sequences that repeat after a whole number of samples.',
  keywords:'examples weekly visitors traffic light solar power hourly temperature samples periodic sequence N',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[-0.6,28],yr:[0,220],xlabel:'n\\;(\\text{day})',ylabel:'v[n]',xstep:7}));
      a.stem(D(n=>140+50*Math.cos(2*Math.PI*(n-5)/7),0,27),{color:C.in,r:3});
      return a.svg(); }, 'Daily café visitors, $140+50\\cos\\bigl(2\\pi(n-5)/7\\bigr)$: period $N=7$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,36],yr:[-0.1,1.4],xlabel:'n\\;(10\\,\\text{s})',ylabel:'g[n]',xstep:9}));
      a.stem(D(n=>(((n%9)+9)%9)<4?1:0,0,35),{color:C.in,r:3,showZero:true});
      return a.svg(); }, 'A traffic light read every 10 s, green for 4 of 9 samples: $a_0=\\tfrac49$.'],
    [()=>{ const a=P.Axes(EXO({xr:[-1,72],yr:[0,6],xlabel:'n\\;(\\text{h})',ylabel:'p[n]\\;(\\text{kW})',xstep:24}));
      a.stem(D(n=>Math.max(0,5*Math.sin(2*Math.PI*(n-6)/24)),0,71),{color:C.in,r:2.2});
      return a.svg(); }, 'Hourly solar power over three days, zero at night: period $N=24$.'],
    [()=>{ const a=P.Axes(EXO({xr:[0,48],yr:[0,38],ystep:10,xlabel:'t\\;(\\text{h})',ylabel:'T\\;(^{\\circ}\\text{C})',xstep:12}));
      const T=t=>15+5*Math.cos(2*Math.PI*(t-15)/24);
      a.curve(T,{color:C.in,dash:'9 6',n:900});
      a.stem(D(T,0,48),{color:C.mid,r:2.4});
      return a.svg(); }, 'Air temperature read every hour: a daily cycle gives $N=24$.',
      [['in','$T(t)$',true],['mid','$T[n]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'N numbers', html:'One period of $N$ samples fixes a periodic sequence, and $N$ coefficients describe it.'},
    {t:'note', kind:'warn', head:'A whole number of samples', html:'A sequence repeats only after a whole number of samples. A daily cycle read every hour has $N=24$.'}
  ]}),

labScene({ id:'m4-lab-r', lab:'R', nav:'Discrete-Time Series', title:'A Periodic Sequence and Its N Coefficients', src:'pp. 32–35',
  objective:'Change the period and the pulse width of a discrete square wave and rebuild it exactly from its coefficients.',
  keywords:'laboratory discrete time fourier series square wave periodic coefficients exact reconstruction' }),

codeScene({ id:'m4-code-dtfs', nav:'Discrete-time series', title:'Discrete-Time Series in Code', src:'pp. 32–35', eyebrow:'Discrete-time series in code',
  objective:'Compute discrete-time Fourier series coefficients in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python discrete time fourier series coefficients periodic square wave sawtooth run' }),


/* ======================================================= 4.5 properties of the series */

{ id:'m4-props-1', module:'M4', nav:'Properties · linearity, shift', title:'Linearity and Time Shift', src:'p. 35',
  objective:'State and prove linearity and the time-shift property of the Fourier series.',
  keywords:'linearity property time shift proof change of variable phase factor', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 35'},
  {t:'title', text:'Linearity and Time Shift'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$','$x(t-t_0)$']},
      svg:v=>{
      const k=v?v.frame:0;
      const a=AX({yticksLeft:true,xr:[-2.2,2.2],yr:[-0.35,1.6],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:2});
      fade(a,1-0.6*k,()=>a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000,dash:k>0?'6 5':null}));
      if(k>0) fade(a,k,()=>a.curve(t=>rectWave(t-0.4,2,0.5),{color:C.out,n:3000}));
      if(k>0.5) fade(a,2*k-1,()=>a.span(0,0.4,1.3,'t_0',{color:C.coral,fs:15,tex:true}));
      return a.svg(); },
      caption:'A rectangular wave with $T_0=2$, and the same wave delayed by $t_0=0.4$.'}
  ], right:[
    {t:'eq', tex:'A\\,x_1(t)+B\\,x_2(t)\\;\\longleftrightarrow\\;A\\,a_k+B\\,b_k', label:'Linearity',
      note:'$x\\leftrightarrow a_k$ pairs a periodic signal with its coefficients. The same rule holds for sequences.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t-t_0)\\;\\longleftrightarrow\\;a_k\\,e^{-jk\\omega_0t_0},\\qquad x[n-n_0]\\;\\longleftrightarrow\\;a_k\\,e^{-jk\\omega_0n_0}', label:'Time shift'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'\\frac{1}{T_0}\\int_{T_0}x(t-t_0)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\int_{T_0}x(\\tau)e^{-jk\\omega_0(\\tau+t_0)}\\,\\d\\tau=e^{-jk\\omega_0t_0}\\,a_k', label:'Proof',
        note:'Substitute $\\tau=t-t_0$. The factor $e^{-jk\\omega_0t_0}$ does not depend on $\\tau$ and leaves the integral.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ has period $T_0$ and is delayed by $t_0=T_0/2$.<div class="nsep"></div>What does $a_1$ become?',
        ask:{key:'m4-props-1', choices:['$-a_1$','$a_1$','$ja_1$'], answer:0,
          why:'$e^{-j\\omega_0T_0/2}=e^{-j\\pi}=-1$.'}}]}
  ]}
]},

{ id:'m4-props-1b', module:'M4', nav:'Properties · what a shift changes', title:'What a Shift Changes', src:'p. 35',
  objective:'Read that a delay leaves every magnitude and changes each phase in proportion to the harmonic index.',
  keywords:'time shift magnitude unchanged phase change linear in k delay phase plot', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 35'},
  {t:'title', text:'What a Shift Changes'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|a_k|=|b_k|$','$\\angle b_k-\\angle a_k$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-0.06,0.62],xlabel:'k',ylabel:'|a_k|',xtarget:9,ytarget:4});
        a.stem(D(k=>Math.abs(aq(k)),-8,8),{color:C.in,r:3.2,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-3.6,3.6],xlabel:'k',ylabel:'\\angle b_k-\\angle a_k\\;(\\text{rad})',xtarget:9,
        yticksOverride:[-Math.PI,0,Math.PI],ytickfmt:v=>v.toFixed(2)});
      a.stem(D(k=>{ let p=-0.4*Math.PI*k; while(p>Math.PI+1e-9)p-=2*Math.PI; while(p<-Math.PI-1e-9)p+=2*Math.PI; return Math.abs(aq(k))<1e-12?0:p; },-8,8),{color:C.mid,r:3.2,showZero:true});
      return a.svg(); },
      caption:'The wave of the previous slide, $T_0=2$ and $t_0=0.4$. Step to the phase change, drawn in $[-\\pi,\\pi]$. Where $a_k=0$ there is no phase to change.'}
  ], right:[
    {t:'note', kind:'ok', head:'Magnitudes stay', html:'$|e^{-jk\\omega_0t_0}|=1$, so $|b_k|=|a_k|$ for every $k$. Only the phase moves, by $-k\\omega_0t_0$: in proportion to $k$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'A magnitude plot hides the shift', html:'A signal and its delayed copy have the same magnitude plot. Everything that tells them apart is in the phase.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$T_0=2$ and $t_0=0.4$.<div class="nsep"></div>What is $\\angle b_1-\\angle a_1$?',
        ask:{key:'m4-props-1b', choices:['$-0.4\\pi$','$0.4\\pi$','$0$'], answer:0,
          why:'$\\omega_0=\\pi$, so $-k\\omega_0t_0=-1\\cdot\\pi\\cdot0.4=-0.4\\pi$.'}}]}
  ]}
]},

{ id:'m4-props-2', module:'M4', nav:'Properties · reversal, conjugation', title:'Time Reversal and Conjugation', src:'p. 36',
  objective:'State time reversal and conjugation, and read the symmetry of real, even and odd signals.',
  keywords:'time reversal conjugation real even odd purely imaginary symmetry coefficients', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'Time Reversal and Conjugation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$\\text{real, even }x:\\ a_k$','$\\text{real, odd }x:\\ \\operatorname{Im}\\{a_k\\}$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-0.25,0.62],xlabel:'k',ylabel:'a_k',xtarget:9,ytarget:4});
        a.stem(D(aq,-8,8),{color:C.in,r:3.2,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-0.2,0.2],xlabel:'k',ylabel:'\\operatorname{Im}\\{a_k\\}',xtarget:9,ytarget:4});
      a.stem(D(k=>k===0?0:Math.pow(-1,k)/(2*Math.PI*k),-8,8),{color:C.err,r:3.2,showZero:true});
      return a.svg(); },
      caption:'The rectangular wave with $T_0=4T_1$ has real, even coefficients. Step to the sawtooth with $T_0=1$: purely imaginary and odd.'}
  ], right:[
    {t:'eq', tex:'x(-t)\\;\\longleftrightarrow\\;a_{-k},\\qquad x^{*}(t)\\;\\longleftrightarrow\\;a_{-k}^{*}', label:'Reversal and conjugation',
      note:'The same two rules hold for $x[-n]$ and $x^{*}[n]$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Three cases', html:'<b>Real:</b> $a_{-k}=a_k^{*}$.<br><b>Real and even:</b> the $a_k$ are real and even.<br><b>Real and odd:</b> the $a_k$ are purely imaginary and odd.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'a_{-k}=a_k^{*}\\ \\text{and}\\ a_{-k}=-a_k\\;\\Rightarrow\\;a_k^{*}=-a_k\\;\\Rightarrow\\;\\operatorname{Re}\\{a_k\\}=0', label:'Proof of the odd case'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is real and even.<div class="nsep"></div>Can it have $a_2=0.1+0.2j$?',
        ask:{key:'m4-props-2', choices:['No','Yes','Only if $a_{-2}=a_2$'], answer:0,
          why:'A real, even signal has real coefficients. $0.1+0.2j$ is not real.'}}]}
  ]}
]},

{ id:'m4-props-evenodd', module:'M4', nav:'Properties · even and odd parts', title:'Even and Odd Parts of a Real Signal', src:'p. 36',
  objective:'Match the even and odd parts of a real signal to the real and imaginary parts of its coefficients.',
  keywords:'even part odd part real part imaginary part coefficients real signal decomposition Ev Od', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'Even and Odd Parts of a Real Signal'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$','$\\Ev\\{x(t)\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$','$\\Od\\{x(t)\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-2.2,2.2],yr:[-0.35,1.4],xlabel:'t',ylabel:'x(t)',ytarget:2});
        a.curve(t=>rectWave(t-0.4,2,0.5),{color:C.in,n:3000});
        return a.svg(); }
      if(f===1){ const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-0.35,0.62],xlabel:'k',ylabel:'\\operatorname{Re}\\{a_k\\}',xtarget:9,ytarget:4});
        a.stem(D(k=>aq(k)*Math.cos(0.4*Math.PI*k),-8,8),{color:C.mid,r:3.2,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-8.5,8.5],yr:[-0.35,0.35],xlabel:'k',ylabel:'\\operatorname{Im}\\{a_k\\}',xtarget:9,ytarget:4});
      a.stem(D(k=>-aq(k)*Math.sin(0.4*Math.PI*k),-8,8),{color:C.err,r:3.2,showZero:true});
      return a.svg(); },
      caption:'The rectangular wave delayed by $0.4$: real, but neither even nor odd. Its real parts are even in $k$, its imaginary parts odd.'}
  ], right:[
    {t:'eq', key:true, tex:'\\Ev\\{x\\}\\;\\longleftrightarrow\\;\\operatorname{Re}\\{a_k\\},\\qquad \\Od\\{x\\}\\;\\longleftrightarrow\\;j\\operatorname{Im}\\{a_k\\}', label:'For a real $x$'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\Ev\\{x\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr]\\;\\longleftrightarrow\\;\\tfrac12\\bigl(a_k+a_{-k}\\bigr)=\\tfrac12\\bigl(a_k+a_k^{*}\\bigr)=\\operatorname{Re}\\{a_k\\}', label:'Proof',
        note:'Linearity and time reversal give the middle step; $a_{-k}=a_k^{*}$ because $x$ is real. The odd part gives $\\tfrac12(a_k-a_k^{*})=j\\operatorname{Im}\\{a_k\\}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Half the work', html:'For a real signal the coefficients at negative $k$ carry nothing new. Compute $k\\ge0$ and conjugate.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ is real and $a_1=0.3-0.4j$.<div class="nsep"></div>What is the coefficient of $\\Od\\{x(t)\\}$ at $k=1$?',
        ask:{key:'m4-props-evenodd', choices:['$-0.4j$','$0.3$','$-0.4$'], answer:0,
          why:'The odd part takes $j\\operatorname{Im}\\{a_1\\}=j(-0.4)=-0.4j$.'}}]}
  ]}
]},

{ id:'m4-props-freq', module:'M4', nav:'Properties · frequency shift, scaling', title:'Frequency Shift and Time Scaling', src:'p. 36',
  objective:'State the frequency-shift property and what continuous-time scaling does and does not change.',
  keywords:'frequency shift multiply by harmonic index shift time scaling period changes coefficients unchanged', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'Frequency Shift and Time Scaling'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$, $T_0=2$','$x(2t)$, $T_0=1$']},
      svg:v=>{
      const k=v?v.frame:0;
      const a=AX({yticksLeft:true,xr:[-2.2,2.2],yr:[-0.35,1.4],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:2});
      fade(a,1-k,()=>a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000}));
      if(k>0) fade(a,k,()=>a.curve(t=>rectWave(2*t,2,0.5),{color:C.out,n:3000}));
      return a.svg(); },
      caption:'Scaling by $\\alpha=2$ halves the period and doubles $\\omega_0$.'}
  ], right:[
    {t:'eq', key:true, tex:'e^{jM\\omega_0t}x(t)\\;\\longleftrightarrow\\;a_{k-M}', label:'Frequency shift',
      note:'$M$ is an integer, so the product keeps the period $T_0$. The whole coefficient sequence slides $M$ places.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'e^{jM\\omega_0t}\\sum_{\\ell}a_\\ell e^{j\\ell\\omega_0t}=\\sum_{\\ell}a_\\ell e^{j(\\ell+M)\\omega_0t}=\\sum_{k}a_{k-M}e^{jk\\omega_0t}', label:'Proof',
        note:'Rename $k=\\ell+M$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'x(\\alpha t),\\ \\alpha>0\\;\\longleftrightarrow\\;a_k,\\quad\\text{with }\\omega_0\\to\\alpha\\omega_0', label:'Time scaling',
        note:'Each $a_k$ keeps its value and moves to the frequency $k\\alpha\\omega_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)$ has $a_3=0.3$.<div class="nsep"></div>What is the coefficient at $k=3$ of $x(2t)$?',
        ask:{key:'m4-props-freq', choices:['$0.3$','$0.6$','$0.15$'], answer:0,
          why:'Scaling changes the frequency of each harmonic, not its coefficient.'}}]}
  ]}
]},

{ id:'m4-props-scale', module:'M4', nav:'Properties · discrete-time expansion', title:'Stretching a Sequence', src:'p. 36',
  objective:'Prove that inserting zeros into a periodic sequence divides its coefficients by m.',
  keywords:'discrete time scaling expansion zero insertion x_(m) period mN coefficients divided by m proof', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'Stretching a Sequence'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$, $N=4$','$x_{(3)}[n]$, $N=12$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0, seq=[1,0.5,0,0.5];
      const a=AX({xr:[-1,25],yr:[-0.15,1.3],xlabel:'n',ylabel:f?'x_{(3)}[n]':'x[n]',xtarget:9,ytarget:2});
      if(!f) a.stem(D(n=>seq[((n%4)+4)%4],0,24),{color:C.in,r:3.2,showZero:true});
      else a.stem(D(n=>n%3===0?seq[(n/3)%4]:0,0,24),{color:C.out,r:3.2,showZero:true});
      return a.svg(); },
      caption:'Every sample is kept and two zeros follow each one. The period grows from $4$ to $12$.'}
  ], right:[
    {t:'eq', key:true, tex:'x_{(m)}[n]=\\begin{cases}x[n/m],&n\\text{ a multiple of }m\\\\[2pt]0,&\\text{otherwise}\\end{cases}\\;\\longleftrightarrow\\;\\frac{1}{m}\\,a_k', label:'Time scaling, discrete time',
      note:'$m$ is a positive integer. The new sequence has period $mN$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'b_k=\\frac{1}{mN}\\sum_{n=\\langle mN\\rangle}x_{(m)}[n]\\,e^{-jk\\frac{2\\pi}{mN}n}\\;\\overset{n=mr}{=}\\;\\frac{1}{mN}\\sum_{r=\\langle N\\rangle}x[r]\\,e^{-jk\\frac{2\\pi}{N}r}=\\frac{a_k}{m}', label:'Proof',
        note:'Only $n=mr$ contributes, and there are $N$ such samples in one period of $mN$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Not like continuous time', html:'$x(\\alpha t)$ keeps its coefficients. $x_{(m)}[n]$ divides them by $m$, because the same samples are averaged over $m$ times as many points.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]=1,0$ repeating, so $N=2$, is stretched with $m=3$.<div class="nsep"></div>What is $a_0$ of the result?',
        ask:{key:'m4-props-scale', choices:['$\\tfrac16$','$\\tfrac12$','$\\tfrac13$'], answer:0,
          why:'$a_0=\\tfrac12$ before, and $\\tfrac12\\cdot\\tfrac13=\\tfrac16$. Check: one $1$ in six samples.'}}]}
  ]}
]},

{ id:'m4-props-conv', module:'M4', nav:'Properties · periodic convolution', title:'Periodic Convolution', src:'p. 36',
  objective:'State periodic convolution and the factor T₀ or N in front of the coefficient product.',
  keywords:'periodic convolution one period integral T a_k b_k N a_k b_k factor triangular wave mean check', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 36'},
  {t:'title', text:'Periodic Convolution'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$','$y(t)=\\int_{T_0}x(\\tau)x(t-\\tau)\\,\\d\\tau$']},
      svg:v=>{
      const k=v?v.frame:0;
      const a=AX({yticksLeft:true,xr:[-2.2,2.2],yr:[-0.3,1.4],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:2});
      fade(a,1-0.6*k,()=>a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000,dash:k>0?'6 5':null}));
      if(k>0) fade(a,k,()=>a.curve(t=>{ const u=t-2*Math.round(t/2); return 1-Math.abs(u); },{color:C.out,n:3000}));
      return a.svg(); },
      caption:'The rectangular wave with $T_0=2$ and $T_1=0.5$, convolved with itself over one period: a triangular wave with peak $1$.'}
  ], right:[
    {t:'eq', key:true, tex:'\\int_{T_0}x(\\tau)\\,y(t-\\tau)\\,\\d\\tau\\;\\longleftrightarrow\\;T_0\\,a_k\\,b_k', label:'Continuous time',
      note:'An integral over all time would not converge. One period is enough, and the result has period $T_0$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{r=\\langle N\\rangle}x[r]\\,y[n-r]\\;\\longleftrightarrow\\;N\\,a_k\\,b_k', label:'Discrete time'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Keep the factor', html:'The result is $T_0a_kb_k$, not $a_kb_k$. Without $T_0$ the shape is right and the size is wrong.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'The wave on the left has $T_0=2$ and $a_0=0.5$.<div class="nsep"></div>What is the mean of $y(t)$?',
        ask:{key:'m4-props-conv', choices:['$0.5$','$0.25$','$1$'], answer:0,
          why:'The mean is the $k=0$ coefficient: $T_0a_0^{2}=2\\cdot0.25=0.5$. The triangle in the figure has area $1$ over a period of $2$.'}}]}
  ]}
]},

{ id:'m4-props-mult', module:'M4', nav:'Properties · multiplication', title:'Multiplying Two Signals', src:'pp. 36–37',
  objective:'State the multiplication property and the one-period sum in discrete time.',
  keywords:'multiplication property convolution of coefficients periodic convolution summation range cos squared', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'pp. 36–37'},
  {t:'title', text:'Multiplying Two Signals'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$a_\\ell$ of $\\cos(\\omega_0t)$','$\\text{coefficients of }\\cos^{2}(\\omega_0t)$']},
      svg:v=>{
      const k=v?v.frame:0, lo=Math.floor(k), w=k-lo;
      const c1=q=>Math.abs(q)===1?0.5:0, c2=q=>q===0?0.5:(Math.abs(q)===2?0.25:0);
      const a=AX({yticksLeft:true,xr:[-4.5,4.5],yr:[-0.06,0.66],xlabel:'k',ylabel:'\\text{coefficient}',xtarget:9,ytarget:4});
      fade(a,1-w,()=>a.stem(D(lo?c2:c1,-4,4),{color:lo?C.out:C.in,r:3.4,showZero:true}));
      if(w>0&&!lo) fade(a,w,()=>a.stem(D(c2,-4,4),{color:C.out,r:3.4,showZero:true}));
      return a.svg(); },
      caption:'$\\cos(\\omega_0t)$ has $a_{\\pm1}=\\tfrac12$. Step to the product: the pair convolved with itself.'}
  ], right:[
    {t:'eq', key:true, tex:'x(t)\\,y(t)\\;\\longleftrightarrow\\;\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,b_{k-\\ell}', label:'Continuous time',
      note:'The indices $\\ell$ and $k-\\ell$ add to $k$: a convolution of the two coefficient sequences.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x[n]\\,y[n]\\;\\longleftrightarrow\\;\\sum_{\\ell=\\langle N\\rangle}a_\\ell\\,b_{k-\\ell}', label:'Discrete time'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'One period of $\\ell$', html:'Discrete-time coefficients repeat every $N$. A sum over all $\\ell$ would add the same $N$ products again and again and diverge.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\cos^{2}(\\omega_0t)$.<div class="nsep"></div>What is $a_0$?',
        ask:{key:'m4-props-mult', choices:['$\\tfrac12$','$1$','$0$'], answer:0,
          why:'$a_0=\\sum_\\ell a_\\ell a_{-\\ell}=\\tfrac12\\cdot\\tfrac12+\\tfrac12\\cdot\\tfrac12=\\tfrac12$. Check: $\\cos^{2}=\\tfrac12+\\tfrac12\\cos(2\\omega_0t)$.'}}]}
  ]}
]},

{ id:'m4-props-calc', module:'M4', nav:'Properties · differentiation, integration', title:'Differentiation and Integration', src:'p. 37',
  objective:'State the differentiation and integration properties and when the integral is periodic.',
  keywords:'differentiation jk omega0 integration divide by jk omega0 a0 zero mean condition ramp drift', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 37'},
  {t:'title', text:'Differentiation and Integration'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x(t)$ and $a_0$','$\\int_0^{t}x\\,\\d\\tau$','$\\int_0^{t}(x-a_0)\\,\\d\\tau$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      const tri=t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5 ? 0.5*u : (u>0 ? 0.25-0.5*(u-0.5) : -0.25-0.5*(u+0.5)); };
      const a=AX({xr:[-0.2,4.2],yr:[-0.5,2.4],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:4});
      if(f===0){ a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000});
        a.hline(0.5,{color:C.coral,dash:'4 5'}); a.note(4.1,0.68,'a_0=0.5',{anchor:'end',color:C.coral,fs:15,tex:true}); }
      if(f===1) a.curve(t=>tri(t)+0.5*t,{color:C.err,n:3000});
      if(f===2) a.curve(tri,{color:C.out,n:3000});
      return a.svg(); },
      caption:'The rectangular wave with $T_0=2$ has mean $0.5$. Its integral drifts upward. With the mean removed, the integral is a periodic triangle.'}
  ], right:[
    {t:'eq', key:true, tex:'\\frac{\\d x(t)}{\\d t}\\;\\longleftrightarrow\\;jk\\omega_0\\,a_k', label:'Differentiation',
      note:'Differentiate the synthesis equation term by term. The factor grows with $k$, so the high harmonics grow.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\longleftrightarrow\\;\\frac{a_k}{jk\\omega_0},\\qquad\\text{only if }a_0=0', label:'Integration'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'If $a_0\\neq0$', html:'The mean integrates to the ramp $a_0t$, which is not periodic. Remove the mean, integrate the rest, then add $a_0t$ back.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=\\sin(\\pi t)$.<div class="nsep"></div>What is the coefficient at $k=1$ of $\\d x/\\d t$?',
        ask:{key:'m4-props-calc', choices:['$\\pi/2$','$\\pi/(2j)$','$1/(2j)$'], answer:0,
          why:'$a_1=\\tfrac{1}{2j}$ and $\\omega_0=\\pi$, so $jk\\omega_0a_1=j\\pi\\cdot\\tfrac{1}{2j}=\\tfrac{\\pi}{2}$. Check: $\\d x/\\d t=\\pi\\cos(\\pi t)$.'}}]}
  ]}
]},

{ id:'m4-props-dt-calc', module:'M4', nav:'Properties · difference, running sum', title:'First Difference and Running Sum', src:'p. 37',
  objective:'State the first-difference and running-sum properties with the same zero-mean condition.',
  keywords:'first difference running sum accumulation discrete time a0 zero condition drift periodic', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 37'},
  {t:'title', text:'First Difference and Running Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]=1,1,-1,-1,\\dots$','$x[n]=1,1,1,-1,\\dots$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0, seq=f?[1,1,1,-1]:[1,1,-1,-1];
      const a=AX({xr:[-0.8,16.8],yr:[-0.6,9.5],xlabel:'n',ylabel:'s[n]',xtarget:9,ytarget:4});
      a.stem(D(n=>{ let s=0; for(let r=0;r<=n;r++) s+=seq[r%4]; return s; },0,16),{color:f?C.err:C.out,r:3.2,showZero:true});
      return a.svg(); },
      caption:'The running sum $s[n]=\\sum_{r=0}^{n}x[r]$. With mean zero it repeats every $4$. With mean $\\tfrac12$ it climbs by $Na_0=2$ each period.'}
  ], right:[
    {t:'eq', key:true, tex:'x[n]-x[n-1]\\;\\longleftrightarrow\\;\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)\\,a_k', label:'First difference',
      note:'Linearity and the time shift by one sample.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'\\sum_{r=-\\infty}^{n}x[r]\\;\\longleftrightarrow\\;\\frac{a_k}{1-e^{-jk(2\\pi/N)}},\\qquad\\text{only if }a_0=0', label:'Running sum'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Same condition, same reason', html:'If $a_0\\neq0$, every period adds $Na_0$ to the total, so the sum never repeats.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$x[n]$ is periodic.<div class="nsep"></div>What is the coefficient at $k=0$ of $x[n]-x[n-1]$?',
        ask:{key:'m4-props-dt-calc', choices:['$0$','$a_0$','$2a_0$'], answer:0,
          why:'At $k=0$ the factor is $1-e^{0}=0$. A difference of a periodic sequence has mean zero.'}}]}
  ]}
]},

{ id:'m4-parseval', module:'M4', nav:'Parseval', title:'Parseval’s Relation', src:'p. 37',
  objective:'State Parseval’s relation in both domains and read it as power per harmonic.',
  keywords:'parseval relation average power per harmonic energy accounting', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 37'},
  {t:'title', text:'Parseval’s Relation'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-12.5,12.5],yr:[-0.02,0.3],xlabel:'k',ylabel:'|a_k|^{2}',xtarget:9,ytarget:4});
      a.stem(D(k=>aq(k)*aq(k),-12,12),{color:C.in,r:3,showZero:true});
      return a.svg(); },
      caption:'Power per harmonic of the rectangular wave with $T_0=4T_1$. The stems add to $0.5$, the average power of the wave.'}
  ], right:[
    {t:'eq', key:true, tex:'\\frac{1}{T_0}\\int_{T_0}|x(t)|^{2}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}|a_k|^{2},\\qquad \\frac{1}{N}\\sum_{n=\\langle N\\rangle}|x[n]|^{2}=\\sum_{k=\\langle N\\rangle}|a_k|^{2}', label:'Parseval’s relation'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'How to read it', html:'The left side is the average power over one period, into $1\\,\\Omega$. $|a_k|^{2}$ is the power carried by harmonic $k$ alone, and the shares add up to the total.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'$x(t)=2\\cos(\\omega_0t)$.<div class="nsep"></div>What is its average power?',
        ask:{key:'m4-parseval', choices:['$2$','$4$','$1$'], answer:0,
          why:'$a_{\\pm1}=1$, so $|a_1|^{2}+|a_{-1}|^{2}=2$. Check: $\\tfrac{1}{T_0}\\int4\\cos^{2}=2$.'}}]}
  ]}
]},

{ id:'m4-parseval-b', module:'M4', nav:'Parseval · power kept', title:'Power Kept by the Partial Sum', src:'p. 37',
  objective:'Check Parseval’s relation on two waves and use it to measure truncation error.',
  keywords:'parseval check rectangular wave sawtooth power kept truncation mean square error tail', slide:true, steps:2, blocks:[
  {t:'eyebrow', text:'Module 4 · Properties', src:'p. 37'},
  {t:'title', text:'Power Kept by the Partial Sum'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[-0.8,20.8],yr:[0,0.66],xlabel:'N',ylabel:'\\text{power kept}',xtarget:6,ytarget:4});
      const kept=N=>{ let s=0.25; for(let k=1;k<=N;k++) s+=2*aq(k)*aq(k); return s; };
      a.hline(0.5,{color:C.coral,dash:'4 5'});
      a.stem(D(kept,0,20),{color:C.out,r:3});
      a.note(20.5,0.56,'\\text{total }0.5',{anchor:'end',color:C.coral,fs:15,tex:true});
      return a.svg(); },
      caption:'Power in the harmonics $|k|\\le N$ of the rectangular wave with $T_0=4T_1$. It reaches $0.5$ only in the limit.'}
  ], right:[
    {t:'eq', tex:'\\begin{aligned}\\text{rectangle, }T_0=4T_1&:\\ 0.25+2\\!\\!\\sum_{k\\ \\text{odd}>0}\\frac{1}{\\pi^{2}k^{2}}=0.25+0.25=0.5\\\\ \\text{sawtooth, }T_0=1&:\\ 2\\sum_{k\\ge1}\\frac{1}{4\\pi^{2}k^{2}}=\\frac{1}{2\\pi^{2}}\\cdot\\frac{\\pi^{2}}{6}=\\frac{1}{12}\\end{aligned}', label:'Two checks',
      note:'The powers in time are $2T_1/T_0=0.5$ and $\\int_{-1/2}^{1/2}t^{2}\\,\\d t=\\tfrac{1}{12}$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Truncation error', html:'Keeping $|k|\\le N$ drops $\\sum_{|k|>N}|a_k|^{2}$. That tail is exactly the mean-square error of the partial sum.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Given', html:'The rectangular wave with $T_0=4T_1$ has power $0.5$ and $a_0=0.5$.<div class="nsep"></div>What share of the power is in the constant term?',
        ask:{key:'m4-parseval-b', choices:['$\\tfrac12$','$\\tfrac14$','$1$'], answer:0,
          why:'$a_0^{2}=0.25$, and $0.25/0.5=\\tfrac12$.'}}]}
  ]}
]},

realGallery({ id:'m4-real-props', nav:'Properties around us',
  title:'Properties Around Us', eyebrow:'Module 4 · Properties', src:'pp. 35–37',
  objective:'Recognise the series properties in everyday signals.',
  keywords:'examples delay echo phase AM radio frequency shift mains power parseval capacitor charging integration mean',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,10],yr:[-2.2,3.4],xlabel:'t\\;(\\text{ms})',ylabel:'\\text{amplitude}',xstep:2}));
      const s=t=>Math.sin(2*Math.PI*0.2*t)+0.5*Math.sin(2*Math.PI*0.6*t);
      a.curve(s,{color:C.in,n:900}); a.curve(t=>s(t-1),{color:C.out,dash:'8 5',n:900});
      return a.svg(); }, 'A two-tone signal and its copy $1$ ms later: the same $|a_k|$, new phases.',
      [['in','$x(t)$'],['out','$x(t-t_0)$',true]]],
    [()=>{ const a=P.Axes(EXO({xr:[0,2],yr:[-1.8,3],xlabel:'t\\;(\\text{ms})',ylabel:'\\text{amplitude}',xstep:0.5}));
      const m=t=>1+0.5*Math.cos(2*Math.PI*t);
      a.curve(t=>m(t)*Math.cos(2*Math.PI*10*t),{color:C.in,n:1600}); a.curve(m,{color:C.out,dash:'8 5',n:400});
      return a.svg(); }, 'AM: the carrier $\\cos(10\\omega_0t)$ moves each envelope coefficient to $k\\pm10$.',
      [['in','$x(t)$'],['out','envelope',true]]],
    [()=>{ const a=P.Axes(EXO({xr:[0,40],yr:[-400,640],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xstep:10,ystep:200}));
      a.curve(t=>230*Math.SQRT2*Math.cos(2*Math.PI*0.05*t),{color:C.in,n:900}); a.hline(230,{color:C.out,dash:'8 5'});
      return a.svg(); }, 'Mains voltage: Parseval gives $2|a_1|^{2}=230^{2}$ V², so $230$ V rms.',
      [['in','$v(t)$'],['out','$230$ V rms',true]]],
    [()=>{ const a=P.Axes(EXO({xr:[0,8],yr:[-0.3,5],xlabel:'t\\;(\\text{ms})',ylabel:'v_C\\;(\\text{V})',xstep:2}));
      const tri=t=>{ const u=t-2*Math.round(t/2); return Math.abs(u)<0.5 ? 0.5*u : (u>0 ? 0.25-0.5*(u-0.5) : -0.25-0.5*(u+0.5)); };
      a.curve(t=>tri(t)+0.5*t,{color:C.in,n:1600});
      return a.svg(); }, 'A current with mean $0.5$ mA charges a capacitor: the mean integrates to a ramp.']
  ],
  notes:[
    {t:'note', kind:'def', head:'One rule per operation', html:'A delay turns into a phase, a product into a shift of the coefficients, power into $\\sum|a_k|^{2}$.'},
    {t:'note', kind:'warn', head:'Check the mean first', html:'Before integrating or summing a periodic signal, look at $a_0$. If it is not zero, part of the answer is a ramp.'}
  ]}),

labScene({ id:'m4-lab-s', lab:'S', nav:'Series Properties', title:'One Operation, One Coefficient Rule', src:'pp. 35–37',
  objective:'Apply a time shift, a reversal, a frequency shift or a scaling to a periodic wave and watch its coefficients change.',
  keywords:'laboratory fourier series properties time shift reversal frequency shift scaling magnitude phase' }),

codeScene({ id:'m4-code-props', nav:'Properties', title:'Properties in Code', src:'pp. 35–37', eyebrow:'Properties in code',
  objective:'Check the series properties numerically in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python fourier series properties time shift parseval convolution check run' }),


/* ======================================================= 4.6 periodic inputs to LTI systems */

{ id:'m4-lti', module:'M4', nav:'Series through an LTI system', title:'Periodic Inputs to LTI Systems', src:'pp. 37–38',
  objective:'Derive b_k = a_k H(jkω₀): one product per harmonic.',
  keywords:'frequency response b_k = a_k H(jk omega0) one product per harmonic periodic input LTI system', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Periodic inputs to LTI systems', src:'pp. 37–38'},
  {t:'title', text:'Periodic Inputs to LTI Systems'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const items=[], R=[['a_{-1}e^{-j\\omega_0t}','b_{-1}e^{-j\\omega_0t}'],['a_0','a_0H(0)'],['a_1e^{j\\omega_0t}','b_1e^{j\\omega_0t}']];
      R.forEach(([u,w],j)=>{ const y=74+j*116;
        items.push({t:'text',x:10,y:y+6,label:u,anchor:'start',tex:true,fs:16,color:C.in},
          {t:'arrow',x1:142,y1:y,x2:206,y2:y},{t:'box',x:206,y:y-22,w:110,h:44,label:'H(j\\omega)',tex:true},
          {t:'arrow',x1:316,y1:y,x2:372,y2:y},
          {t:'text',x:382,y:y+6,label:w,anchor:'start',tex:true,fs:16,color:C.out}); });
      return P.blocks({w:560,h:380,items}); },
      caption:'Each harmonic is an eigenfunction, so it passes through on its own and comes out scaled by $H$ at its own frequency.'}
  ], right:[
    {t:'eq', key:true, result:true, tex:'y(t)=\\sum_{k=-\\infty}^{\\infty}\\underbrace{a_k\\,H(jk\\omega_0)}_{b_k}\\,e^{jk\\omega_0t}', label:'Key result · Periodic input',
      note:'{{sym:bk|$b_k=a_kH(jk\\omega_0)$}}. The output has the period of the input.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y[n]=\\sum_{k=\\langle N\\rangle}a_k\\,H(e^{jk\\omega_0})\\,e^{jk\\omega_0n}', label:'Discrete time'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Complex product', html:'Magnitudes multiply and phases add: $|b_k|=|a_k|\\,|H(jk\\omega_0)|$ and $\\angle b_k=\\angle a_k+\\angle H(jk\\omega_0)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$a_1=1$ and $H(j\\omega_0)=e^{-j\\pi/4}$.<div class="nsep"></div>What is $b_1$?',
        ask:{key:'m4-lti', choices:['$e^{-j\\pi/4}$','$1$','$e^{j\\pi/4}$'], answer:0,
          why:'$b_1=a_1H(j\\omega_0)=1\\cdot e^{-j\\pi/4}$.'}}]}
  ]}
]},

{ id:'m4-pairing', module:'M4', nav:'Real-output synthesis', title:'Synthesis of a Real Output', src:'p. 38',
  objective:'Reassemble a real output from conjugate pairs, with the factor of two and the positive-index phase.',
  keywords:'conjugate pair reassembly factor of two phase convention real output positive index', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Periodic inputs to LTI systems', src:'p. 38'},
  {t:'title', text:'Synthesis of a Real Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,4],yr:[-1.6,2.3],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
      a.curve(t=>0.6*Math.cos(Math.PI*t+0.5),{color:C.err,dash:'8 5',n:1600});
      a.curve(t=>1.2*Math.cos(Math.PI*t+0.5),{color:C.out,n:1600});
      return a.svg(); },
      caption:'$b_1=0.6e^{j0.5}$ with $\\omega_0=\\pi$. The pair $k=\\pm1$ adds to a cosine of amplitude $1.2$. One term alone gives half.'},
    {t:'legend', items:[['out','$2|b_1|\\cos(\\pi t+0.5)$'],['err','$|b_1|\\cos(\\pi t+0.5)$',true]]}
  ], right:[
    {t:'eq', key:true, tex:'b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}=2|b_k|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)', label:'Conjugate-pair reassembly',
      note:'For real $x$ and real $h$, $b_{-k}=b_k^{*}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'y(t)=b_0+\\sum_{k=1}^{\\infty}2|b_k|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)', label:'Real form of the output',
        note:'$b_0$ has no partner and stands alone, without a factor of two.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Two slips', html:'Using $|b_k|$ halves every amplitude. Using $\\angle b_{-k}$ flips every phase. Take $2|b_k|$ and $\\angle b_k$ with $k>0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Given', html:'$b_1=0.2e^{j0.5}$ and $b_{-1}=0.2e^{-j0.5}$.<div class="nsep"></div>What is the amplitude of the cosine at $\\omega_0$ in $y(t)$?',
        ask:{key:'m4-pairing', choices:['$0.4$','$0.2$','$0.1$'], answer:0,
          why:'$2|b_1|=2\\cdot0.2=0.4$, with phase $+0.5$.'}}]}
  ]}
]},

{ id:'m4-lpf', module:'M4', nav:'Worked example · low-pass', title:'First-Order Low-Pass Filtering', src:'pp. 38–39',
  objective:'Set up the low-pass example: frequency response, period and input coefficients.',
  keywords:'low pass filtering example e^{-t}u(t) H = 1/(1+j omega) period coefficients harmonics', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 38–39'},
  {t:'title', text:'First-Order Low-Pass Filtering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,12],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',xtarget:7,ytarget:3,
        xticksOverride:[Math.PI,2*Math.PI,3*Math.PI],xtickfmt:v=>v.toFixed(2)});
      const Hm=w=>1/Math.sqrt(1+w*w);
      a.curve(Hm,{color:C.h,n:900});
      [0,1,2,3].forEach(k=>a.point(k*Math.PI,Hm(k*Math.PI),{color:C.coral,r:5}));
      return a.svg(); },
      caption:'$|H(j\\omega)|$ with the four input harmonics marked at $k\\omega_0$, $\\omega_0=\\pi$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos\\!\\left(3\\pi t+\\tfrac{\\pi}{3}\\right)$ into $h(t)=e^{-t}u(t)$. Find $y(t)$.<div class="nsep"></div>What is the average of $y(t)$?',
      ask:{key:'m4-lpf', choices:['$1$','$0$','$\\tfrac12$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Method', html:'<ol class="steps"><li>Find $H(j\\omega)$, $\\omega_0$ and the $a_k$.</li><li>Form $b_k=a_kH(jk\\omega_0)$.</li><li>Reassemble in conjugate pairs.</li></ol>'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'H(j\\omega)=\\int_0^{\\infty}e^{-t}e^{-j\\omega t}\\,\\d t=\\frac{1}{1+j\\omega}', label:'Frequency response',
        note:'$|H|$ falls from $1$ at $\\omega=0$ towards $0$: a low-pass system. $H(0)=1$, so the average $a_0=1$ passes unchanged.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'T_0=2,\\ \\omega_0=\\pi:\\quad a_0=1,\\ \\ a_{\\pm1}=\\tfrac12,\\ \\ a_{\\pm2}=\\pm\\tfrac{1}{2j},\\ \\ a_{\\pm3}=\\tfrac12e^{\\pm j\\pi/3}', label:'Input coefficients',
        note:'The component periods are $2$, $1$ and $\\tfrac23$ s, and all three divide $T_0=2$.'}]}
  ]}
]},

{ id:'m4-lpf-b', module:'M4', nav:'Low-pass · the output', title:'Low-Pass Output', src:'pp. 38–39',
  objective:'Form the output coefficients and assemble the real low-pass output.',
  keywords:'low pass output coefficients b_k amplitudes 0.303 0.157 0.106 phases pairing sketch', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 38–39'},
  {t:'title', text:'Low-Pass Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, svg:()=>{
      const a=AX({xr:[0,4],yr:[-1.5,4.2],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
      skArea(a);
      a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.ink,opacity:.35,dash:'6 5',n:1600});
      a.note(0.08,3.75,'x(t)',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=>1+0.303316*Math.cos(Math.PI*t-1.262627)+0.157177*Math.cos(2*Math.PI*t-2.983761)+0.105510*Math.cos(3*Math.PI*t-0.417840),{color:C.out,n:1600});
      a.note(3.92,3.75,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $x(t)$. Sketch the output: the average stays at $1$ and the fast wiggles shrink.'}
  ], right:[
    {t:'eq', tex:'b_0=1,\\quad b_1=0.1517e^{-j1.263},\\quad b_2=0.0786e^{-j2.984},\\quad b_3=0.0528e^{-j0.418}', label:'One product per harmonic',
      note:'$b_1=\\tfrac12\\cdot\\tfrac{1}{1+j\\pi}$, $b_2=\\tfrac{1}{2j}\\cdot\\tfrac{1}{1+j2\\pi}$, $b_3=\\tfrac12e^{j\\pi/3}\\cdot\\tfrac{1}{1+j3\\pi}$.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'y(t)=1+0.303\\cos(\\pi t-1.263)+0.157\\cos(2\\pi t-2.984)+0.106\\cos(3\\pi t-0.418)', label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'Each amplitude is $2|b_k|$: $2\\cdot0.1517=0.303$. The average is $b_0=1$, since $H(0)=1$. The third harmonic falls from $1$ to about a tenth.'}]}
  ]}
]},

{ id:'m4-hpf', module:'M4', nav:'Worked example · high-pass', title:'First-Order High-Pass Filtering', src:'pp. 39–40',
  objective:'Repeat the calculation with a high-pass response and see the average removed.',
  keywords:'high pass filtering j omega/(1+j omega) DC removed average zero coefficients', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 39–40'},
  {t:'title', text:'First-Order High-Pass Filtering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, svg:()=>{
      const a=AX({xr:[0,12],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',xtarget:7,ytarget:3,
        xticksOverride:[Math.PI,2*Math.PI,3*Math.PI],xtickfmt:v=>v.toFixed(2)});
      const Hm=w=>w/Math.sqrt(1+w*w);
      a.curve(Hm,{color:C.h,n:900});
      [0,1,2,3].forEach(k=>a.point(k*Math.PI,Hm(k*Math.PI),{color:C.coral,r:5}));
      return a.svg(); },
      caption:'$|H(j\\omega)|$ of the high-pass system, with the same four harmonics marked.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The same $x(t)$, now into $H(j\\omega)=\\dfrac{j\\omega}{1+j\\omega}$. Find $y(t)$.<div class="nsep"></div>What is the average of $y(t)$?',
      ask:{key:'m4-hpf', choices:['$0$','$1$','$\\tfrac12$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'|H(j\\omega)|=\\frac{|\\omega|}{\\sqrt{1+\\omega^{2}}},\\qquad \\angle H(j\\omega)=\\frac{\\pi}{2}\\operatorname{sgn}(\\omega)-\\arctan\\omega', label:'Frequency response'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The average is removed', html:'$H(0)=0$, so $b_0=a_0H(0)=0$ for every input. Removing the average is what a high-pass system does.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'b_0=0,\\quad b_1=0.4764e^{j0.308},\\quad b_2=0.4938e^{-j1.413},\\quad b_3=0.4972e^{j1.153}', label:'One product per harmonic',
        note:'Method as before: $b_k=a_kH(jk\\pi)$.'}]}
  ]}
]},

{ id:'m4-hpf-b', module:'M4', nav:'High-pass · the output', title:'High-Pass Output', src:'pp. 39–40',
  objective:'Assemble the real high-pass output and avoid the two pairing slips.',
  keywords:'high pass output amplitudes 0.953 0.988 0.994 phases positive index sketch', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 39–40'},
  {t:'title', text:'High-Pass Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y(t)$ on the axes, then check it.'}, svg:()=>{
      const a=AX({xr:[0,4],yr:[-2.8,4.2],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
      skArea(a);
      a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.ink,opacity:.35,dash:'6 5',n:1600});
      a.note(0.08,3.75,'x(t)',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.curve(t=>0.952891*Math.cos(Math.PI*t+0.308169)+0.987573*Math.cos(2*Math.PI*t-1.412965)+0.994418*Math.cos(3*Math.PI*t+1.152956),{color:C.out,n:1600});
      a.note(3.92,3.75,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The dashed trace is $x(t)$. Sketch the output: the harmonics pass almost unchanged and the average drops to $0$.'}
  ], right:[
    {t:'eq', key:true, tex:'y(t)=0.953\\cos(\\pi t+0.308)+0.988\\cos(2\\pi t-1.413)+0.994\\cos(3\\pi t+1.153)', label:'Solution',
      note:'No constant term, because $b_0=0$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Two slips together', html:'Amplitudes of $0.48$, $0.49$, $0.50$ mean the factor of two is missing. Phases of $-0.308$, $+1.413$, $-1.153$ were read off $b_{-k}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$|H(jk\\pi)|$ is close to $1$ for $k=1,2,3$. So $y$ should look like $x$ with its average of $1$ removed, and it does.'}]}
  ]}
]},

{ id:'m4-dt-filt', module:'M4', nav:'Worked example · discrete high-pass', title:'Discrete-Time High-Pass Filtering', src:'pp. 40–41',
  objective:'Filter a period-4 impulse train with a two-tap high-pass system.',
  keywords:'discrete filtering two tap first difference impulse train period 4 frequency response high pass', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 40–41'},
  {t:'title', text:'Discrete-Time High-Pass Filtering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$x[n]$','$|H_1(e^{j\\omega})|$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-13,13],yr:[-0.2,1.35],xlabel:'n',ylabel:'x[n]',xtarget:9,ytarget:2});
        a.stem(D(n=>(((n%4)+4)%4===0)?1:0,-12,12),{color:C.in,r:3.2,showZero:true});
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-Math.PI,Math.PI],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H_1(e^{j\\omega})|',xtarget:5,ytarget:3,
        xticksOverride:[-Math.PI,-Math.PI/2,Math.PI/2,Math.PI],xtickfmt:v=>v.toFixed(2)});
      const Hm=w=>Math.abs(Math.sin(w/2));
      a.curve(Hm,{color:C.h,n:900});
      [-1,0,1,2].forEach(k=>a.point(k*Math.PI/2,Hm(k*Math.PI/2),{color:C.coral,r:5}));
      return a.svg(); },
      caption:'One impulse every four samples. Step to the response, with the harmonics $k\\omega_0$, $\\omega_0=\\pi/2$, marked.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'$x[n]=\\sum_{m}\\delta[n-4m]$ into $h_1[n]=0.5\\delta[n]-0.5\\delta[n-1]$. Find $y[n]$.<div class="nsep"></div>What is the average of $y[n]$?',
      ask:{key:'m4-dt-filt', choices:['$0$','$\\tfrac14$','$\\tfrac12$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'a_k=\\frac14\\sum_{n=0}^{3}x[n]\\,e^{-jk(\\pi/2)n}=\\frac14\\quad\\text{for every }k', label:'Input coefficients',
        note:'Only $n=0$ carries a sample in one period. The spectrum is flat.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'H_1(e^{j\\omega})=0.5\\bigl(1-e^{-j\\omega}\\bigr)', label:'Frequency response',
        note:'$|H_1|=0$ at $\\omega=0$ and $1$ at $\\omega=\\pi$: a high-pass system.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', tex:'b_0=0,\\quad b_1=0.1768e^{j\\pi/4},\\quad b_2=0.25,\\quad b_{-1}=b_3=0.1768e^{-j\\pi/4}', label:'One product per harmonic'}]}
  ]}
]},

{ id:'m4-dt-filt-b', module:'M4', nav:'Discrete high-pass · the output', title:'Discrete-Time High-Pass Output', src:'pp. 40–41',
  objective:'Assemble the discrete-time output and check it sample by sample.',
  keywords:'discrete high pass output 0.354 cos pi n/2 + pi/4 0.25 (-1)^n N/2 term check sketch', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'pp. 40–41'},
  {t:'title', text:'Discrete-Time High-Pass Output'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true, sketch:{label:'Sketch $y[n]$ on the axes, then check it.'}, svg:()=>{
      const a=AX({yticksLeft:true,xr:[-13,13],yr:[-0.75,1.35],xlabel:'n',ylabel:'\\text{amplitude}',xtarget:9,ytarget:4});
      skArea(a);
      a.raw('<g opacity=".35">'); a.stem(D(n=>(((n%4)+4)%4===0)?1:0,-12,12),{color:C.ink,r:3}); a.raw('</g>');
      a.note(-12.6,1.18,'x[n]',{anchor:'start',color:C.ink,fs:15,tex:true});
      a.raw('<g class="sk-key">');
      a.stem(D(n=>0.353553*Math.cos(Math.PI*n/2+Math.PI/4)+0.25*Math.pow(-1,n),-12,12),{color:C.out,r:3.4,showZero:true});
      a.note(12.6,1.18,'y[n]',{anchor:'end',color:C.out,fs:15,tex:true});
      a.raw('</g>');
      return a.svg(); },
      caption:'The faint stems are $x[n]$. Sketch the output of $h_1$, then show the answer.'}
  ], right:[
    {t:'eq', key:true, tex:'y[n]=0.354\\cos\\!\\left(\\frac{\\pi}{2}n+\\frac{\\pi}{4}\\right)+0.25(-1)^{n}', label:'Solution',
      note:'The pair $k=\\pm1$ gives $2|b_1|=0.354$ at phase $+\\pi/4$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'The term at $k=N/2$', html:'With $N=4$, $k=2$ is its own partner: $e^{j\\pi n}=(-1)^{n}$. It enters once, as $b_2(-1)^{n}$, without a factor of two.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Check', html:'$y[n]=0.5x[n]-0.5x[n-1]$ turns each impulse into $0.5$, then $-0.5$. The formula gives $y[0]=0.25+0.25=0.5$, $y[1]=-0.25-0.25=-0.5$, $y[2]=y[3]=0$.'}]}
  ]}
]},

{ id:'m4-dt-filt-c', module:'M4', nav:'Worked example · discrete low-pass', title:'Discrete-Time Low-Pass Filtering', src:'p. 41',
  objective:'Repeat the discrete calculation with the two-point average and compare the two systems.',
  keywords:'discrete low pass two point average impulse train comparison DC kept term at pi removed', slide:true, steps:3, blocks:[
  {t:'eyebrow', text:'Module 4 · Worked example', src:'p. 41'},
  {t:'title', text:'Discrete-Time Low-Pass Filtering'},
  {t:'cols', ratio:'c-5-7', fill:true, left:[
    {t:'fig', frame:true, grow:true,
      frames:{labels:['$|H_2(e^{j\\omega})|$','$y[n]$']},
      svg:v=>{
      const f=v?Math.round(v.frame):0;
      if(!f){ const a=AX({yticksLeft:true,xr:[-Math.PI,Math.PI],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H_2(e^{j\\omega})|',xtarget:5,ytarget:3,
          xticksOverride:[-Math.PI,-Math.PI/2,Math.PI/2,Math.PI],xtickfmt:v=>v.toFixed(2)});
        const Hm=w=>Math.abs(Math.cos(w/2));
        a.curve(Hm,{color:C.h,n:900});
        [-1,0,1,2].forEach(k=>a.point(k*Math.PI/2,Hm(k*Math.PI/2),{color:C.coral,r:5}));
        return a.svg(); }
      const a=AX({yticksLeft:true,xr:[-13,13],yr:[-0.2,0.75],xlabel:'n',ylabel:'y[n]',xtarget:9,ytarget:4});
      a.stem(D(n=>0.25+0.353553*Math.cos(Math.PI*n/2-Math.PI/4),-12,12),{color:C.out,r:3.2,showZero:true});
      return a.svg(); },
      caption:'The low-pass response with the harmonics marked. Step to the output: each impulse spreads over two samples of $0.5$.'}
  ], right:[
    {t:'note', kind:'def', head:'Given', html:'The same impulse train into $h_2[n]=0.5\\delta[n]+0.5\\delta[n-1]$.<div class="nsep"></div>What is $b_2$?',
      ask:{key:'m4-dt-filt-c', choices:['$0$','$0.25$','$0.125$'], answer:0}},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'H_2(e^{j\\omega})=0.5\\bigl(1+e^{-j\\omega}\\bigr):\\quad b_0=0.25,\\ \\ b_1=0.1768e^{-j\\pi/4},\\ \\ b_2=\\tfrac14\\cdot0.5(1-1)=0', label:'One product per harmonic'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'y[n]=0.25+0.354\\cos\\!\\left(\\frac{\\pi}{2}n-\\frac{\\pi}{4}\\right)', label:'Solution'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Compare', html:'The high-pass system removes $b_0$ and keeps $b_2$. The low-pass system keeps $b_0$ and removes $b_2$. Both responses repeat every $2\\pi$ in $\\omega$.'}]}
  ]}
]},

realGallery({ id:'m4-real-lti', nav:'Filtered periodic signals around us',
  title:'Filtered Periodic Signals Around Us', eyebrow:'Module 4 · Periodic inputs to LTI systems', src:'pp. 37–41',
  objective:'See one product per harmonic at work in everyday filters.',
  keywords:'examples clock RC low pass coupling capacitor DC blocker two point average first difference weekly harmonic gain',
  figs:[
    [()=>{ const a=P.Axes(EXO({xr:[0,3],yr:[-0.3,1.9],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xstep:1}));
      const w0=2*Math.PI, y=t=>{ let s=0.5; for(let k=1;k<=199;k+=2){ const ak=Math.sin(Math.PI*k/2)/(Math.PI*k), w=k*w0, Hm=1/Math.sqrt(1+w*w/(w0*w0)); s+=2*ak*Hm*Math.cos(w*t-Math.atan(w/w0)); } return s; };
      a.curve(t=>rectWave(t,1,0.25),{color:C.in,dash:'8 5',n:1200}); a.curve(y,{color:C.out,n:900});
      return a.svg(); }, 'A 1 kHz clock through an RC low-pass cut at 1 kHz: gains $0.707$ and $0.316$.',
      [['in','$x(t)$',true],['out','$y(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[0,60],yr:[-1.6,4.2],xlabel:'t\\;(\\text{ms})',ylabel:'v\\;(\\text{V})',xstep:20}));
      a.curve(t=>2+Math.cos(2*Math.PI*0.05*t),{color:C.in,dash:'8 5',n:900});
      a.curve(t=>0.995*Math.cos(2*Math.PI*0.05*t+0.0997),{color:C.out,n:900});
      return a.svg(); }, 'A 5 Hz coupling capacitor removes the 2 V offset and keeps $0.995$ of 50 Hz.',
      [['in','$x(t)$',true],['out','$y(t)$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,16.5],yr:[-4,6.5],xlabel:'n\\;(6\\,\\text{h})',ylabel:'T-20\\;(^{\\circ}\\text{C})',xstep:4}));
      a.stem(D(n=>3*Math.cos(Math.PI*n/2),0,16),{color:C.in,r:3});
      a.stem(D(n=>2.1213*Math.cos(Math.PI*n/2-Math.PI/4),0,16),{color:C.out,r:3});
      return a.svg(); }, 'Temperature every 6 h, less 20 °C, and its two-point average: $3\\to2.12$.',
      [['in','$x[n]$'],['out','$y[n]$']]],
    [()=>{ const a=P.Axes(EXO({xr:[-0.5,20.5],yr:[-14,18],xlabel:'n\\;(\\text{day})',ylabel:'\\text{units}',xstep:7}));
      a.stem(D(n=>10*Math.cos(2*Math.PI*n/7),0,20),{color:C.in,r:3});
      a.stem(D(n=>8.678*Math.cos(2*Math.PI*n/7+5*Math.PI/14),0,20),{color:C.out,r:3});
      return a.svg(); }, 'Weekly sales pattern and its daily change: $10\\to8.68$, phase $+5\\pi/14$.',
      [['in','$x[n]$'],['out','$x[n]-x[n-1]$']]]
  ],
  notes:[
    {t:'note', kind:'def', head:'One product per harmonic', html:'Each filter here multiplies every $a_k$ by $H$ at $k\\omega_0$. The frequency stays; amplitude and phase change.'},
    {t:'note', kind:'warn', head:'Look at $H(0)$ first', html:'$H(0)$ decides the average of the output: $1$ keeps it, $0$ removes it.'}
  ]}),

labScene({ id:'m4-lab-g', lab:'G', nav:'Filtering', title:'A Periodic Signal Through a Filter', src:'pp. 37–41',
  objective:'Send a periodic signal through a low-pass or high-pass system and watch each harmonic scaled by the frequency response.',
  keywords:'laboratory filtering periodic input LTI system low pass high pass frequency response harmonics output' }),

codeScene({ id:'m4-code-lti', nav:'Periodic input, LTI system', title:'Filtering in Code', src:'pp. 37–41', eyebrow:'Filtering in code',
  objective:'Filter periodic signals harmonic by harmonic in MATLAB and in Python, and predict each result before running it.',
  keywords:'code matlab python filtering periodic input frequency response b_k = a_k H low pass high pass run' }),


/* ======================================================= 4.7 summary */

{ id:'m4-tables', module:'M4', nav:'Property summary · continuous time', title:'Continuous-Time Series Properties', src:'pp. 35–37',
  objective:'Collect the properties of the continuous-time Fourier series for reference.',
  keywords:'summary table properties reference continuous time series coefficients linearity shift scaling convolution integration parseval',
  budget:'A reference table of properties in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 4 · Reference', src:'pp. 35–37'},
  {t:'title', text:'Continuous-Time Series Properties'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Operations on the signal'},
    {t:'wex', rows:[
      ['Linearity','$Ax(t)+By(t)\\;\\leftrightarrow\\;Aa_k+Bb_k$'],
      ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;a_ke^{-jk\\omega_0t_0}$'],
      ['Frequency shift','$e^{jM\\omega_0t}x(t)\\;\\leftrightarrow\\;a_{k-M}$'],
      ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;a_{-k}^{*}$'],
      ['Time reversal','$x(-t)\\;\\leftrightarrow\\;a_{-k}$'],
      ['Time scaling','$x(\\alpha t)\\;\\leftrightarrow\\;a_k$, period $T_0/\\alpha$'],
      ['Periodic convolution','$\\int_{T_0}x(\\tau)y(t-\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;T_0a_kb_k$'],
      ['Multiplication','$x(t)y(t)\\;\\leftrightarrow\\;\\sum_{\\ell}a_\\ell b_{k-\\ell}$']
    ]}
  ], right:[
    {t:'sub', text:'Calculus, symmetry and power'},
    {t:'wex', rows:[
      ['Differentiation','$\\d x/\\d t\\;\\leftrightarrow\\;jk\\omega_0a_k$'],
      ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;a_k/(jk\\omega_0)$, only if $a_0=0$'],
      ['Real signal','$a_{-k}=a_k^{*}$: $|a_k|$ even, $\\angle a_k$ odd'],
      ['Real and even','$a_k$ real and even'],
      ['Real and odd','$a_k$ purely imaginary and odd'],
      ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$'],
      ['Parseval','$\\frac{1}{T_0}\\int_{T_0}|x(t)|^{2}\\,\\d t=\\sum_{k}|a_k|^{2}$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'How to use it', html:'Recognise the signal as a known one with an operation applied. Look up the known coefficients, apply the rows in order, and check $a_0$ against the mean of the signal.'}]}
]},

{ id:'m4-tables-dt', module:'M4', nav:'Property summary · discrete time', title:'Discrete-Time Series Properties', src:'pp. 35–37',
  objective:'Collect the properties of the discrete-time Fourier series and mark where they differ from continuous time.',
  keywords:'summary table properties reference discrete time series coefficients first difference running sum expansion periodic coefficients',
  budget:'A reference table of properties in two columns, with one closing note.',
  slide:true, steps:1, blocks:[
  {t:'eyebrow', text:'Module 4 · Reference', src:'pp. 35–37'},
  {t:'title', text:'Discrete-Time Series Properties'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Operations on the sequence'},
    {t:'wex', rows:[
      ['Linearity','$Ax[n]+By[n]\\;\\leftrightarrow\\;Aa_k+Bb_k$'],
      ['Time shift','$x[n-n_0]\\;\\leftrightarrow\\;a_ke^{-jk(2\\pi/N)n_0}$'],
      ['Frequency shift','$e^{jM(2\\pi/N)n}x[n]\\;\\leftrightarrow\\;a_{k-M}$'],
      ['Conjugation','$x^{*}[n]\\;\\leftrightarrow\\;a_{-k}^{*}$'],
      ['Time reversal','$x[-n]\\;\\leftrightarrow\\;a_{-k}$'],
      ['Time scaling','$x_{(m)}[n]\\;\\leftrightarrow\\;a_k/m$, period $mN$'],
      ['Periodic convolution','$\\sum_{r=\\langle N\\rangle}x[r]y[n-r]\\;\\leftrightarrow\\;Na_kb_k$'],
      ['Multiplication','$x[n]y[n]\\;\\leftrightarrow\\;\\sum_{\\ell=\\langle N\\rangle}a_\\ell b_{k-\\ell}$']
    ]}
  ], right:[
    {t:'sub', text:'Difference, sum, symmetry and power'},
    {t:'wex', rows:[
      ['First difference','$x[n]-x[n-1]\\;\\leftrightarrow\\;\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)a_k$'],
      ['Running sum','$\\sum_{r=-\\infty}^{n}x[r]\\;\\leftrightarrow\\;a_k/\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)$, only if $a_0=0$'],
      ['Real signal','$a_{-k}=a_k^{*}$: $|a_k|$ even, $\\angle a_k$ odd'],
      ['Real and even','$a_k$ real and even'],
      ['Real and odd','$a_k$ purely imaginary and odd'],
      ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$'],
      ['Parseval','$\\frac{1}{N}\\sum_{n=\\langle N\\rangle}|x[n]|^{2}=\\sum_{k=\\langle N\\rangle}|a_k|^{2}$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Where discrete time differs', html:'The coefficients repeat, $a_{k+N}=a_k$. So multiplication sums over one period, scaling carries $1/m$, and a first difference takes the place of the derivative.'}]}
]},

/* ================================================================ 4.7 summary */

{ id:'m4-quick', module:'M4', nav:'Quick check', title:'Quick check', src:'pp. 22–41',
  objective:'Check the module ideas with twelve short predictions.',
  keywords:'quick check predict eigenfunction period coefficients symmetry gibbs discrete series shift parseval filter',
  budget:'A set of twelve prediction cards; the questions carry no figure.',
  slide:true, steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Quick check', src:'pp. 22–41'},
  {t:'title', text:'Quick Check'},
  {t:'grid', cols:4, gap:'22px 20px', style:'flex:1;grid-auto-rows:1fr;padding-bottom:8px', items:[
    [{t:'note', kind:'def', head:'Eigenfunction', html:'Which input leaves every LTI system unchanged in form?',
      ask:{key:'m4-qc0', choices:['$e^{j5t}$','$\\cos 5t$','$u(t)$'], answer:0,
        why:'$e^{j5t}$ comes out as $H(j5)\\,e^{j5t}$. A cosine can change phase and still be a cosine, but only the exponential is an eigenfunction.'}}],
    [{t:'note', kind:'def', head:'Period', html:'$x(t)=\\cos(2\\pi t)+\\sin(4\\pi t)$ has fundamental period',
      ask:{key:'m4-qc1', choices:['$1$','$\\tfrac12$','$2$'], answer:0,
        why:'The periods are $1$ and $\\tfrac12$. Both fit in $1$.'}}],
    [{t:'note', kind:'def', head:'The mean', html:'$x(t)=1+\\cos(\\pi t)$ has $a_0$ equal to',
      ask:{key:'m4-qc2', choices:['$1$','$2$','$\\tfrac12$'], answer:0,
        why:'$a_0$ is the mean over one period.'}}],
    [{t:'note', kind:'def', head:'Real signal', html:'$x$ is real and $a_2=1+j$. Then $a_{-2}$ is',
      ask:{key:'m4-qc3', choices:['$1-j$','$1+j$','$-1-j$'], answer:0,
        why:'A real signal has $a_{-k}=a_k^{*}$.'}}],
    [{t:'note', kind:'def', head:'Symmetry', html:'A real and odd signal has coefficients that are',
      ask:{key:'m4-qc4', choices:['purely imaginary','real','zero'], answer:0,
        why:'Real gives $a_{-k}=a_k^{*}$; odd gives $a_{-k}=-a_k$.'}}],
    [{t:'note', kind:'def', head:'Decay', html:'A wave with a jump has $|a_k|$ falling like',
      ask:{key:'m4-qc5', choices:['$1/k$','$1/k^{2}$','$e^{-k}$'], answer:0,
        why:'The rectangular wave and the sawtooth both fall like $1/k$.'}}],
    [{t:'note', kind:'def', head:'Gibbs', html:'With more terms, the overshoot at a jump',
      ask:{key:'m4-qc6', choices:['stays near $9\\%$','goes to $0$','grows'], answer:0,
        why:'It gets narrower but stays about $9\\%$ of the jump.'}}],
    [{t:'note', kind:'def', head:'Discrete time', html:'A sequence with $N=6$ has how many distinct coefficients?',
      ask:{key:'m4-qc7', choices:['$6$','$12$','infinitely many'], answer:0,
        why:'$a_{k+6}=a_k$.'}}],
    [{t:'note', kind:'def', head:'Delay', html:'Delaying a periodic signal changes $|a_k|$?',
      ask:{key:'m4-qc8', choices:['no','yes'], answer:0,
        why:'The factor $e^{-jk\\omega_0t_0}$ has magnitude $1$.'}}],
    [{t:'note', kind:'def', head:'Power', html:'$x(t)=\\sqrt2\\cos(\\omega_0t)$ has average power',
      ask:{key:'m4-qc9', choices:['$1$','$2$','$\\sqrt2$'], answer:0,
        why:'$a_{\\pm1}=\\tfrac{\\sqrt2}{2}$, and $\\tfrac12+\\tfrac12=1$.'}}],
    [{t:'note', kind:'def', head:'Average out', html:'An LTI system has $H(0)=0$. The output average is',
      ask:{key:'m4-qc10', choices:['$0$','$a_0$','unknown'], answer:0,
        why:'$b_0=a_0H(0)=0$.'}}],
    [{t:'note', kind:'def', head:'One product', html:'$a_3=0.4$ and $H(j3\\omega_0)=0.5$. Then $b_3$ is',
      ask:{key:'m4-qc11', choices:['$0.2$','$0.9$','$0.8$'], answer:0,
        why:'$b_3=a_3H(j3\\omega_0)=0.4\\cdot0.5$.'}}]
  ]}
]},

{ id:'m4-synth', module:'M4', nav:'Module 4 synthesis', title:'Module 4 — what to carry forward', src:'pp. 22–41',
  dark:true, objective:'Consolidate the module and open the door to the Fourier transform.',
  keywords:'synthesis summary module 4 fourier series eigenfunction coefficients properties LTI preview transform', steps:1, blocks:[
  {t:'eyebrow', text:'Module 4 · Synthesis', src:'pp. 22–41'},
  {t:'title', text:'Module 4 Summary'},
  /* Ten results as prompts, in the order of the module: the student answers
     each one, then opens the card. The sketch on each card is the picture to
     remember. */
  {t:'raw', html:()=>RECALL.deck('m4', [
    {q:'What is an eigenfunction of an LTI system?', glyph:G.eigen,
     a:'$e^{st}$ and $z^{n}$. The output is the input times one number, $H(s)$ or $H(z)$.'},
    {q:'What is the synthesis equation?', glyph:G.synth,
     a:'$x(t)=\\sum_k a_k\\,e^{jk\\omega_0t}$ with $\\omega_0=2\\pi/T_0$: a sum of harmonics.'},
    {q:'What is the analysis equation?', glyph:G.probe,
     a:'$a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0t}\\,\\d t$. The $k=0$ term is the mean.'},
    {q:'Which signals have a series?', glyph:G.exist,
     a:'Absolutely integrable over a period, with finitely many extrema and jumps. At a jump the series gives the midpoint.'},
    {q:'Rectangular-wave coefficients', glyph:G.rect,
     a:'$a_0=2T_1/T_0$ and $a_k=\\sin(k\\omega_0T_1)/(\\pi k)$: samples of one envelope.'},
    {q:'The Gibbs phenomenon', glyph:G.gibbs,
     a:'Near a jump a partial sum overshoots by about $9\\%$ of the jump. More terms make it narrower, not smaller.'},
    {q:'The discrete-time series', glyph:G.dtfs,
     a:'$N$ coefficients, $a_{k+N}=a_k$. Both sums are finite and rebuild $x[n]$ exactly.'},
    {q:'Symmetry of the coefficients', glyph:G.sym,
     a:'<b>Real:</b> $a_{-k}=a_k^{*}$. <b>Real and even:</b> real. <b>Real and odd:</b> purely imaginary.'},
    {q:'Parseval’s relation', glyph:G.power,
     a:'Average power $=\\sum_k|a_k|^{2}$. Each harmonic carries $|a_k|^{2}$.'},
    {q:'A periodic input to an LTI system', glyph:G.lti,
     a:'$b_k=a_kH(jk\\omega_0)$. Reassemble as $b_0+\\sum_{k\\ge1}2|b_k|\\cos(k\\omega_0t+\\angle b_k)$.'}
  ], {cols:2})},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'ok', head:'Where Module 5 begins', html:'<span style="color:var(--graphite)">Keep one pulse and let $T_0$ grow. The harmonics $k\\omega_0$ crowd together and $T_0a_k$ traces the envelope $E(\\omega)$. In the limit a signal that does not repeat has a continuous spectrum: the Fourier transform.</span>'}]}
]},

/* Four optional projects for students who want to try the module on their own
   computer. They carry no grade and no code: each card gives an aim, what it
   practises, a few steps and what to look for. The briefs state no numerical
   answer beyond ones checked in verify/. */
{ id:'m4-projects', module:'M4', nav:'Projects to try', title:'Projects to Try', src:'pp. 22–41',
  dark:true, objective:'Offer four optional projects that use Fourier series on sound, data and filters.',
  keywords:'projects matlab python harmonics square wave sound instrument spectrum filter RC weekly pattern data',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Projects', src:'pp. 22–41'},
  {t:'title', text:'Projects to Try'},
  {t:'raw', html:()=>PROJECTS.deck('m4', [
    {title:'Hear a square wave being built', glyph:G.tone,
     aim:'Build a square wave from its harmonics and listen to it change.',
     learn:['The synthesis equation as code.',
            'How each odd harmonic changes the sound.',
            'The Gibbs overshoot in a partial sum.'],
     steps:['Take $f_0=220$ Hz and a sampling rate of $44.1$ kHz. Make two seconds of $\\sum_{k\\text{ odd}\\le K}\\frac{4}{\\pi k}\\sin(2\\pi kf_0t)$.',
            'Play it for $K=1$, $3$, $9$ and $31$.',
            'Plot one period of each and mark the largest value.',
            'Repeat with only the even harmonics kept.'],
     look:'The tone gets brighter with $K$. The peak settles near $1.18$ instead of $1$: the $9\\%$ overshoot of a jump of $2$.'},
    {title:'Measure the harmonics of a note', glyph:G.note,
     aim:'Find the Fourier coefficients of a recorded musical note.',
     learn:['The analysis equation on sampled data.',
            'Why a whole number of periods matters.',
            'How the harmonic pattern differs between instruments.'],
     steps:['Record one sustained note from an instrument, or from your voice.',
            'Find the period from the plot and cut exactly ten periods.',
            'Compute $a_k$ for $k=0,\\dots,15$ as the average of $x(t)\\,e^{-jk\\omega_0t}$ over the cut.',
            'Plot $|a_k|$ and compare two instruments on the same note.'],
     look:'The stems sit at whole multiples of $f_0$. The same note from two instruments has different $|a_k|$ patterns.'},
    {title:'Filter a clock', glyph:G.filt,
     aim:'Find the output of an RC low-pass for a square-wave input, harmonic by harmonic.',
     learn:['One product per harmonic, $b_k=a_kH(jk\\omega_0)$.',
            'The conjugate-pair reassembly.',
            'A check against a time-domain simulation.'],
     steps:['Take a $0$ to $1$ V square wave at $1$ kHz and $H(j\\omega)=1/(1+j\\omega RC)$.',
            'Compute $b_k$ for $|k|\\le 51$ and rebuild $y(t)$.',
            'Simulate the same circuit in time with a small step and compare.',
            'Repeat with the cut-off at $300$ Hz and at $3$ kHz.'],
     look:'The two methods agree. A low cut-off rounds the edges into slow exponentials; a high one keeps them sharp.'},
    {title:'Find the weekly pattern', glyph:G.week,
     aim:'Use a discrete-time series to separate a weekly pattern from daily data.',
     learn:['The discrete-time series with $N=7$.',
            'What $a_0$ and $|a_1|$ mean for real data.',
            'Removing one harmonic from a record.'],
     steps:['Take a year of daily data: steps, sales or visitors.',
            'Average all Mondays, all Tuesdays and so on to get one week, $x[n]$ for $n=0,\\dots,6$.',
            'Compute $a_0,\\dots,a_6$ and plot $|a_k|$.',
            'Subtract the weekly pattern from the year and plot what is left.'],
     look:'$a_0$ is the average day. A strong $|a_1|$ is a weekday-weekend cycle. What is left after subtraction shows the slower trends.'}
  ])}
]},


];
window.SCENES_M4 = SC;
})();
