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

Object.assign(CONTENT.GLOSS, {
  Xjw:{ s:'X(j\\omega)', d:'Continuous-time Fourier transform of x(t). It is a complex function of the real angular frequency ω, in rad/s. The letter X is reserved for a signal; H is reserved for a system.', go:'m5-pair' },
  sincf:{ s:'\\operatorname{sinc}(\\theta)', d:'Unnormalised sinc: sinc(θ) = sin θ / θ, with sinc(0) = 1 and zeros at θ = ±π, ±2π, … This course uses no other convention.', go:'m5-rect-sinc' },
  Wband:{ s:'W', d:'Band edge of an ideal low-pass band, in rad/s: the transform is 1 for |ω| < W and 0 beyond it.', go:'m5-sinc-rect' },
  wc:{ s:'\\omega_c', d:'Carrier angular frequency of an amplitude-modulated signal, in rad/s.', go:'m5-am' }
});

const SC = [

{ id:'m5-open', module:'M5', nav:'Module 5 opening', title:'Continuous-Time Fourier Transform', src:'pp. 42–63',
  dark:true, keywords:'module 5 fourier transform aperiodic CTFT overview envelope spectrum', steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Continuous-Time Fourier Transform', src:'pp. 42–63'},
  {t:'title', level:1, text:'A signal that never repeats<br>still has a spectrum.'},
  {t:'lede', text:'Module 4 needed the signal to repeat, so that its frequencies could be counted one harmonic at a time. Stretch the period until the copies never come back, and the stems merge into a curve. That curve is the Fourier transform.'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'raw', html:`<div style="margin-top:16px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:#8FA8BF;margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t', label:'Analysis'},
    {t:'eq', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega', label:'Synthesis'},
    {t:'note', kind:'ok', head:'What this buys', html:'<span style="color:#DED5C6">Convolution becomes multiplication for every signal, not only for periodic ones. A system is still described by one function of frequency, and the input no longer has to repeat.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:800,h:430,xr:[-9,9],yr:[-0.6,7.2],grid:false,zeroAxes:false,arrows:false,
        pad:{l:20,r:20,t:20,b:20},xticksOverride:[],yticksOverride:[]});
      /* the same envelope, sampled ever more finely as the period grows */
      a.curve(w=>rectFT(w,1)*0.55+5.4,{color:'#7FC3CE',width:2.4,n:1600});
      [[4,'#AC99DC',3.4],[8,'#E5B255',1.6]].forEach(([T,col,base])=>{
        const st=[]; const w0=2*PI/T;
        for(let k=-Math.floor(9/w0);k<=Math.floor(9/w0);k++) st.push([k*w0, 2*PI*aSq(k,T,1)*0.55]);
        a.curve(w=>rectFT(w,1)*0.55+base,{color:col,width:1.1,dash:'3 5',opacity:.5,n:1200});
        a.stem(st.map(([x,y])=>[x,y+base]),{color:col,r:3.2,width:1.7,showZero:true});
      });
      const stf=[]; const w0f=2*PI/24;
      for(let k=-Math.floor(9/w0f);k<=Math.floor(9/w0f);k++) stf.push([k*w0f, 2*PI*aSq(k,24,1)*0.55]);
      a.stem(stf,{color:'#8FBF8A',r:1.8,width:1.1,showZero:true});
      a.curve(w=>rectFT(w,1)*0.55,{color:'#8FBF8A',width:2.2,n:1600});
      return a.svg(); },
      caption:'One envelope, sampled at $\\omega_0=2\\pi/T$. As the period grows the samples crowd together until only the envelope is left.'}
  ]}
]},

{ id:'m5-derive-1', module:'M5', nav:'From a series to a transform', title:'Making an aperiodic signal periodic on purpose', src:'pp. 42–43',
  objective:'Build the periodic extension of a pulse and state the condition the construction needs.',
  keywords:'aperiodic periodic extension support T > 2T1 limit period grows derivation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Derivation, step 1', src:'pp. 42–43'},
  {t:'title', text:'Borrow a period the signal does not have'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Take a signal that lives on a finite stretch of time and is zero outside it. Write $x(t)=0$ for $|t|>T_1$. The number $T_1$ is the <b>half-width of the support</b>: it belongs to the signal itself and to nothing else.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Now build a periodic signal $\\tilde{x}(t)$ by repeating that pulse every $T$ seconds. Inside one period $\\tilde{x}$ is the original signal, so Module 4 applies to it.'},
      {t:'eq', size:'sm', tex:'\\tilde{x}(t)=\\sum_{m=-\\infty}^{\\infty}x(t-mT),\\qquad \\tilde{x}(t)=\\tilde{x}(t+T)'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The condition the construction needs', html:'The copies must not touch, or $\\tilde{x}$ is no longer the pulse repeated. That needs $T>2T_1$. Two symbols are in play and they are not the same: $T_1$ is fixed by the signal, $T$ is chosen by us, and only $T$ is going to move.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The limit to come', html:'Let $T$ grow. The pulse in the middle never changes; the copies beside it slide away. In the limit $T\\to\\infty$ there is one pulse and no copies, and $\\tilde{x}(t)\\to x(t)$ for every $t$. Everything true of $\\tilde{x}$ can then be pushed to the limit.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:2,yticksOverride:[0,1]});
      a.curve(t=>rectp(t,1),{color:C.in,n:3000});
      a.span(-1,1,1.22,'2T_1',{color:C.coral,tex:true,fs:14});
      return a.svg(); },
      caption:'The signal itself: one pulse, zero for $|t|>T_1$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\tilde{x}(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectPer(t,5,1),{color:C.mid,n:3000});
        a.span(0,5,1.22,'T',{color:C.coral,tex:true,fs:14});
        return a.svg(); },
        caption:'The periodic extension with $T=5T_1$. Inside $|t|<T_1$ the two signals agree.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\tilde{x}(t)',pad:{l:52,r:26,t:26,b:34},xtarget:7,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectPer(t,14,1),{color:C.out,n:3000});
        return a.svg(); },
        caption:'The same construction with $T=14T_1$. The neighbours have left the picture; the pulse has not moved.'}]}
  ]}
]},

{ id:'m5-derive-2', module:'M5', nav:'Coefficients as samples', title:'The coefficients are samples of one curve', src:'p. 43',
  objective:'Show that T·a_k is one function of ω, sampled at multiples of ω₀.',
  keywords:'envelope samples T a_k spacing omega_0 derivation coefficients curve', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Derivation, step 2', src:'p. 43'},
  {t:'title', text:'One curve, read off at the harmonics'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Apply the analysis equation of Module 4 to $\\tilde{x}$. Integrate over the period $-T/2$ to $T/2$. Inside that range $\\tilde{x}(t)=x(t)$, and outside $|t|<T_1$ the integrand is zero anyway, so the limits may be opened to all of time:'},
    {t:'eq', size:'sm', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\tilde{x}(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\int_{-\\infty}^{\\infty}x(t)e^{-jk\\omega_0t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The right-hand integral is the same expression at every $k$; only the number $k\\omega_0$ changes. Give that expression a name and a free variable:'},
      {t:'eq', key:true, tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t',
        note:'{{sym:Xjw|$X(j\\omega)$}} is defined for every real $\\omega$, not only at the harmonics.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'a_k=\\frac{1}{T}\\,X(jk\\omega_0)\\qquad\\Longleftrightarrow\\qquad T\\,a_k=X(jk\\omega_0)',
        label:'The coefficients are samples',
        note:'Every coefficient of the periodic extension is one point of the curve $X$, scaled by $1/T$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What moves and what does not', html:'The curve $X$ was built from the pulse alone, so lengthening $T$ cannot move it. What lengthening $T$ does is shrink the spacing $\\omega_0=2\\pi/T$ between the samples, and shrink each coefficient by the same $1/T$.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:196,xr:[-10,10],yr:[-0.9,2.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'T a_k',pad:{l:62,r:26,t:28,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>rectFT(w,1),{color:C.coral,width:1.6,dash:'4 5',n:1400});
        const w0=2*PI/4, st=[];
        for(let k=-Math.floor(10/w0);k<=Math.floor(10/w0);k++) st.push([k*w0, 4*aSq(k,4,1)]);
        a.stem(st,{color:C.in,r:3.6,showZero:true});
        return a.svg(); },
        caption:'$T=4T_1$: the samples are $\\omega_0=\\pi/2$ apart.'}],
      [{t:'reveal', at:1, items:[{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:196,xr:[-10,10],yr:[-0.9,2.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'T a_k',pad:{l:62,r:26,t:28,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>rectFT(w,1),{color:C.coral,width:1.6,dash:'4 5',n:1400});
        const w0=2*PI/16, st=[];
        for(let k=-Math.floor(10/w0);k<=Math.floor(10/w0);k++) st.push([k*w0, 16*aSq(k,16,1)]);
        a.stem(st,{color:C.mid,r:2.4,showZero:true});
        return a.svg(); },
        caption:'$T=16T_1$: four times as many samples, on the same curve.'}]}]
    ]}
  ]}
]},

{ id:'m5-derive-3', module:'M5', nav:'The sum becomes an integral', title:'Where the factor 1/2π comes from', src:'pp. 43–44',
  objective:'Carry the synthesis sum to the limit and produce the 1/2π explicitly.',
  keywords:'limit sum integral d omega 2 pi factor synthesis riemann derivation', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Derivation, step 3', src:'pp. 43–44'},
  {t:'title', text:'A sum of stems, spaced $\\omega_0$ apart'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Put $a_k=\\tfrac{1}{T}X(jk\\omega_0)$ back into the synthesis equation of Module 4:'},
    {t:'eq', size:'sm', tex:'\\tilde{x}(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}=\\sum_{k=-\\infty}^{\\infty}\\frac{1}{T}X(jk\\omega_0)\\,e^{jk\\omega_0t}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Replace $1/T$ using $\\omega_0=2\\pi/T$, which gives $1/T=\\omega_0/2\\pi$. Nothing has been approximated yet; this is an exact rewriting.'},
      {t:'eq', size:'sm', tex:'\\tilde{x}(t)=\\frac{1}{2\\pi}\\sum_{k=-\\infty}^{\\infty}X(jk\\omega_0)\\,e^{jk\\omega_0t}\\,\\omega_0',
        note:'Each term now carries the spacing $\\omega_0$ as a factor. That is the shape of a Riemann sum for an integral in $\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Let $T\\to\\infty$. On the left $\\tilde{x}(t)\\to x(t)$. On the right the spacing $\\omega_0$ shrinks to the differential $\\d\\omega$, the sample points $k\\omega_0$ fill the whole $\\omega$ axis, and the sum becomes an integral:'},
      {t:'eq', key:true, size:'lg', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega',
        label:'Synthesis equation',
        note:'The $1/2\\pi$ is not a convention chosen for tidiness. It arrived as $\\omega_0/2\\pi$ when the spacing was substituted, and it stays on this side of the pair for the whole module.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The factor has one home', html:'Drop the $1/2\\pi$ and the reconstructed signal comes back $2\\pi$ times too large. Put it on the analysis side instead and every transform in the module changes by the same factor. Write it once, on the synthesis side, and check it there.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:230,xr:[-9,9],yr:[-0.85,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',pad:{l:56,r:26,t:28,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
      const w0=2*PI/6;
      for(let k=-Math.floor(9/w0);k<=Math.floor(9/w0);k++){
        const wv=k*w0, hv=rectFT(wv,1);
        a.rect(wv-w0/2,0,wv+w0/2,hv,{fill:'rgba(106,90,146,.20)',stroke:C.mid,width:1});
      }
      a.curve(w=>rectFT(w,1),{color:C.coral,width:2.2,n:1400});
      return a.svg(); },
      caption:'Each term of the sum is one rectangle of height $X(jk\\omega_0)$ and width $\\omega_0$. Shrinking the width turns the staircase into the area under the curve.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-9,9],yr:[-0.85,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:28,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.area(w=>rectFT(w,1),-9,9,{color:'rgba(190,85,57,.14)'});
        a.curve(w=>rectFT(w,1),{color:C.coral,width:2.4,n:1600});
        return a.svg(); },
        caption:'The limit. The stems are gone and the signal is rebuilt from an area, with $\\d\\omega$ in place of $\\omega_0$.'}]}
  ]}
]},

{ id:'m5-pair', module:'M5', nav:'Analysis and synthesis', title:'The transform pair, and which way each equation goes', src:'p. 44',
  objective:'Name both equations correctly and state what each one does.',
  keywords:'analysis synthesis equation pair forward inverse transform direction naming', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · The pair', src:'p. 44'},
  {t:'title', text:'Two equations, two directions, two names'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t',
      label:'Analysis equation · the Fourier transform',
      note:'A signal goes in and a spectrum comes out. <b>Analysis</b> takes the signal apart: it asks how much of each frequency the signal contains. The exponent carries the minus sign.'},
    {t:'eq', key:true, size:'lg', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega',
      label:'Synthesis equation · the inverse Fourier transform',
      note:'A spectrum goes in and a signal comes out. <b>Synthesis</b> puts the signal back together from its frequencies. The exponent is positive, and the $1/2\\pi$ sits here.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'A test that settles the direction every time', html:'Look at what the integration variable is. Integrating over $t$ removes time, so what is left is a function of $\\omega$: that is analysis. Integrating over $\\omega$ removes frequency, so what is left is a function of $t$: that is synthesis. The names cannot be swapped once this question is asked.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Notation', html:'The pair is written $x(t)\\;\\longleftrightarrow\\;X(j\\omega)$. The argument is $j\\omega$, never $\\omega$ alone, because the transform is the two-sided Laplace transform evaluated on the imaginary axis. The capital letter is the transform of the small letter, and the case is never decorative: $X$ is a signal spectrum, $H$ is a system response.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Only the sign separates them', html:'Apart from the $1/2\\pi$ and the variable of integration, the two equations differ by one minus sign in the exponent. That is why the pair is easy to write and easy to write backwards.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:830,h:270,items:[
      {t:'box',x:70,y:40,w:210,h:74,label:'x(t)',tex:true,fs:20,color:'#14707F'},
      {t:'box',x:550,y:40,w:210,h:74,label:'X(j\\omega)',tex:true,fs:20,color:'#6A5A92'},
      {t:'arrow',x1:280,y1:60,x2:550,y2:60,label:'\\text{analysis}',tex:true,color:'#BE5539'},
      {t:'line',d:'M550,96 L290,96',color:'#4A657F'},
      {t:'line',d:'M280,96 l9,-4.5 v9 Z',color:'#4A657F'},
      {t:'text',x:415,y:126,label:'\\text{synthesis}',tex:true,fs:15,color:'#4A657F'},
      {t:'text',x:175,y:150,label:'\\text{one function of time}',tex:true,fs:13},
      {t:'text',x:655,y:150,label:'\\text{one function of frequency}',tex:true,fs:13},
      {t:'text',x:415,y:205,label:'\\text{integrate over }t\\;\\Rightarrow\\;\\text{a function of }\\omega',tex:true,fs:14,color:'#BE5539'},
      {t:'text',x:415,y:240,label:'\\text{integrate over }\\omega\\;\\Rightarrow\\;\\text{a function of }t',tex:true,fs:14,color:'#4A657F'}
    ]}), caption:'The direction of each equation is fixed by the variable it integrates away.'},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Read the sign','Analysis carries $e^{-j\\omega t}$; synthesis carries $e^{+j\\omega t}$.'],
        ['Read the factor','Only synthesis carries $1/2\\pi$.'],
        ['Read the output','Analysis produces $X(j\\omega)$; synthesis produces $x(t)$.']
      ]}]}
  ]}
]},

{ id:'m5-exist', module:'M5', nav:'When the transform exists', title:'Two conditions, each sufficient, neither necessary', src:'p. 44',
  objective:'State the two existence conditions separately and show that neither implies the other.',
  keywords:'existence square integrable dirichlet absolutely integrable sufficient necessary conditions', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Existence', src:'p. 44'},
  {t:'title', text:'Two different guarantees, not one restated'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Condition A — finite energy', html:'If $\\displaystyle\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t<\\infty$, then $X(j\\omega)$ exists.'},
    {t:'note', kind:'def', head:'Condition B — the Dirichlet conditions', html:'If $x$ is absolutely integrable, $\\displaystyle\\int_{-\\infty}^{\\infty}|x(t)|\\,\\d t<\\infty$, and has finitely many maxima, minima and finite jumps in any finite interval, then $X(j\\omega)$ exists.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'They are alternatives, joined by "or"', html:'Each condition is enough on its own, and neither one implies the other. A signal satisfying either has a transform; a signal satisfying neither may still have one. Writing "in other words" between them claims an equivalence that does not hold.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Satisfies A, fails B','$x(t)=\\dfrac{\\sin t}{t}$. Its square is integrable, so its energy is finite. Its absolute value is not integrable: $|\\sin t/t|$ decays like $1/|t|$ and its area diverges.'],
        ['Satisfies B, fails A','$x(t)=1/\\sqrt{t}$ on $0<t<1$ and zero elsewhere. Its area is $2$, which is finite. Its square is $1/t$, whose integral over the same interval diverges.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Where this is heading', html:'Both conditions rule out constants, complex exponentials and periodic signals, all of which have a transform in this module. The next scene says in what sense.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-22,22],yr:[-0.35,1.25],xlabel:'t',ylabel:'\\sin t\\,/\\,t',pad:{l:60,r:26,t:32,b:36},xtarget:7,ytarget:3});
      a.curve(t=>sincU(t),{color:C.in,n:3000});
      return a.svg(); },
      caption:'Finite energy, infinite area: the tails fall like $1/|t|$, whose square is integrable and whose modulus is not.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-0.3,1.6],yr:[-0.8,7.5],xlabel:'t',ylabel:'1/\\sqrt{t}',pad:{l:56,r:26,t:32,b:36},xtarget:5,ytarget:4});
        a.curve(t=>(t>0.018&&t<1)?1/Math.sqrt(t):(t<=0||t>=1?0:NaN),{color:C.err,n:3000});
        a.area(t=>(t>0.018&&t<1)?1/Math.sqrt(t):0,0.018,1,{color:'rgba(166,59,42,.14)'});
        return a.svg(); },
        caption:'Finite area, infinite energy: the shaded area is $2$, while the area under $1/t$ over the same interval is not finite.'}]}
  ]}
]},

{ id:'m5-limit', module:'M5', nav:'Transforms that are impulses', title:'Signals that meet neither condition, and their spectra', src:'pp. 44–45',
  objective:'Explain in what sense a constant or a periodic signal has a transform.',
  keywords:'limiting sense impulse spectrum constant periodic complex exponential generalised', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Existence', src:'pp. 44–45'},
  {t:'title', text:'An impulse in frequency is still an answer'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A constant, a complex exponential and a periodic signal all fail both conditions: none has finite energy and none is absolutely integrable. Yet each one has a spectrum, and the rest of this module uses them constantly.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The way out is the same one Module 1 used for $\\delta(t)$. Take a signal that does satisfy a condition, transform it, and let a parameter run to a limit. What survives in the frequency domain is an <b>impulse</b>, which is not an ordinary function either.'},
      {t:'eq', size:'sm', tex:'e^{-a|t|}\\;\\longleftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}}\\qquad\\xrightarrow{\\;a\\to0\\;}\\qquad 1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)',
        note:'On the left the signal spreads out until it is the constant 1. On the right the curve grows tall and narrow, keeping its area $2\\pi$, until it is an impulse of weight $2\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'What "exists in the limiting sense" means', html:'The transform is not a function whose value at each $\\omega$ can be quoted. It is defined by what it does inside an integral, exactly as $\\delta(t)$ is. Every rule of this module still applies to it, because every rule of this module is a statement about integrals.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Why this matters for the whole module', html:'Impulses in the frequency domain are what make a single, sharp frequency representable at all. Without them a sinusoid would have no transform, a periodic signal would have no spectrum, and the Fourier series of Module 4 could not be read as a special case of the transform.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:215,xr:[-6,6],yr:[-0.2,1.35],xlabel:'t',ylabel:'e^{-a|t|}',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3});
      [[1.2,C.in],[0.5,C.mid],[0.15,C.out]].forEach(([av,col])=>a.curve(t=>Math.exp(-av*Math.abs(t)),{color:col,n:1600}));
      return a.svg(); },
      caption:'Cyan $a=1.2$, violet $a=0.5$, green $a=0.15$. As $a$ falls the signal flattens towards the constant 1.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:215,xr:[-6,6],yr:[-1.5,14.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:64,r:26,t:34,b:36},xtarget:7,ytarget:3});
        [[1.2,C.in],[0.5,C.mid],[0.15,C.out]].forEach(([av,col])=>a.curve(w=>2*av/(av*av+w*w),{color:col,n:2400}));
        return a.svg(); },
        caption:'The transform meanwhile grows tall and narrow. Its area stays $2\\pi$ at every $a$, which is the weight the impulse ends up carrying.'}]}
  ]}
]},

{ id:'m5-ex-delta', module:'M5', nav:'Worked example · the impulse', title:'Worked example — the impulse and the shifted impulse', src:'p. 44',
  objective:'Transform δ(t) and δ(t−t₀) and read the magnitude and phase.',
  keywords:'worked example impulse delta sifting flat spectrum linear phase shift', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 44'},
  {t:'title', text:'The signal with no favourite frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\delta(t)$, and then $x(t)=\\delta(t-t_0)$ with $t_0$ a fixed time.'],
      ['Find','$X(j\\omega)$ in both cases, with the magnitude and the phase.'],
      ['Method','Put the signal into the analysis equation and use the sifting property of Module 1.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'\\mathcal{F}\\{\\delta(t)\\}=\\int_{-\\infty}^{\\infty}\\delta(t)e^{-j\\omega t}\\,\\d t=e^{-j\\omega\\cdot0}=1',
        label:'Solution, first case',
        note:'Sifting evaluates the rest of the integrand at $t=0$. The transform is the constant 1: every frequency is present, with the same weight and no phase.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'\\mathcal{F}\\{\\delta(t-t_0)\\}=e^{-j\\omega t_0},\\qquad |X(j\\omega)|=1,\\qquad \\angle X(j\\omega)=-\\omega t_0',
        label:'Solution, second case',
        note:'Sifting now evaluates at $t=t_0$. The magnitude did not change; the phase became a straight line through the origin of slope $-t_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','Push the result back through the synthesis equation: $\\tfrac{1}{2\\pi}\\int e^{-j\\omega t_0}e^{j\\omega t}\\d\\omega=\\delta(t-t_0)$, which is the definition of the impulse read in the frequency variable.'],
        ['Reading','Moving a signal in time never changes the size of any frequency component. It only rotates each one, and by an amount proportional to its frequency.']
      ]}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\delta(t)',pad:{l:52,r:20,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.impulse(0,1,{color:C.in,labelText:'1'}); return a.svg(); },
        caption:'The impulse at the origin.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-6,6],yr:[-0.3,1.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',pad:{l:54,r:20,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(()=>1,{color:C.mid}); return a.svg(); },
        caption:'A flat magnitude at every frequency.'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\delta(t-t_0)',pad:{l:58,r:20,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
          a.impulse(1,1,{color:C.in,labelText:'1'}); return a.svg(); },
          caption:'The same impulse at $t_0=1$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-3.6,3.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',pad:{l:62,r:20,t:32,b:34},xtarget:5,yticksOverride:[-3,-1,1,3]});
          a.curve(w=>-w,{color:C.mid}); return a.svg(); },
          caption:'The phase is the line $-\\omega t_0$, of slope $-1$ here.'}]
      ]}]}
  ]}
]},

{ id:'m5-ex-expw', module:'M5', nav:'Worked example · a single frequency', title:'Worked example — where the 2π sits in front of an impulse', src:'p. 45',
  objective:'Invert 2πδ(ω−ω₀) and show why the 2π is part of the answer.',
  keywords:'worked example inverse transform impulse in frequency complex exponential 2 pi weight', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'One impulse in frequency is one exponential in time'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X(j\\omega)=2\\pi\\delta(\\omega-\\omega_0)$, a single impulse of weight $2\\pi$ at the frequency $\\omega_0$.'],
      ['Find','The signal $x(t)$, with its magnitude and phase.'],
      ['Method','Use the synthesis equation and sift, this time in the variable $\\omega$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}2\\pi\\delta(\\omega-\\omega_0)e^{j\\omega t}\\,\\d\\omega=e^{j\\omega_0t}',
        label:'Solution',
        note:'The $2\\pi$ of the impulse weight and the $1/2\\pi$ of the synthesis equation cancel exactly. That cancellation is the reason the weight is written as $2\\pi$ and not as 1.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'What an impulse of weight 1 would give', html:'Repeat the calculation with $X(j\\omega)=\\delta(\\omega-\\omega_0)$ and the answer is $\\tfrac{1}{2\\pi}e^{j\\omega_0t}$, which is not a unit-amplitude exponential. The factor is not decoration: it decides the amplitude of the signal that comes back.'},
      {t:'eq', key:true, tex:'e^{j\\omega_0t}\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0),\\qquad 1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)',
        label:'The pair to remember',
        note:'The second statement is the first at $\\omega_0=0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','$|x(t)|=|e^{j\\omega_0t}|=1$ for every $t$, and $\\angle x(t)=\\omega_0t$ is a straight line of slope $\\omega_0$. At $\\omega_0=1$ the phase reaches $\\pi/4\\approx0.79$ at $t=\\pi/4$ and $\\pi/2\\approx1.57$ at $t=\\pi/2$.'],
        ['Reading','A signal built from one frequency has all its spectrum at that one frequency. Nothing is spread anywhere else, which is exactly what an impulse says.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:200,xr:[-3,3],yr:[-0.4,8.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:5,ytarget:3});
      a.impulse(1,2*PI,{color:C.mid,labelText:'6.28'}); return a.svg(); },
      caption:'One impulse, at $\\omega_0=1$, carrying weight $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-6,6],yr:[-0.3,1.6],xlabel:'t',ylabel:'|x(t)|',pad:{l:52,r:20,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
          a.curve(()=>1,{color:C.in}); return a.svg(); },
          caption:'Constant magnitude 1.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-3.6,3.6],xlabel:'t',ylabel:'\\angle x(t)\\;[\\text{rad}]',pad:{l:60,r:20,t:32,b:34},xtarget:5,yticksOverride:[-3,-1.57,0,1.57,3],ytickfmt:v=>v.toFixed(2)});
          a.curve(t=>t,{color:C.out}); a.point(PI/2,PI/2,{color:C.coral,r:4}); return a.svg(); },
          caption:'Phase $\\omega_0t$, marked where it reaches $1.57$.'}]
      ]}]}
  ]}
]},

{ id:'m5-ex-exp', module:'M5', nav:'Worked example · one-sided exponential', title:'Worked example — $e^{-at}u(t)$, and the condition on $a$', src:'p. 45',
  objective:'Transform the decaying exponential and state where a > 0 is needed.',
  keywords:'worked example one-sided exponential decay 1/(a+jw) convergence condition magnitude', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'The transform exists only if the signal decays'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=e^{-at}u(t)$, with $a$ a real constant.'],
      ['Find','$X(j\\omega)$, the values of $a$ for which it exists, and the magnitude spectrum.'],
      ['Method','Integrate the analysis equation from $0$ to $\\infty$, because $u(t)$ kills the rest.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X(j\\omega)=\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t=\\left[\\frac{-1}{a+j\\omega}e^{-(a+j\\omega)t}\\right]_{0}^{\\infty}',
        note:'The bracket at the upper limit is $e^{-at}e^{-j\\omega t}$. The second factor has modulus 1 at every $t$, so the limit is decided by $e^{-at}$ alone.'},
      {t:'note', kind:'warn', head:'This is where the condition enters', html:'$e^{-at}\\to0$ as $t\\to\\infty$ only when $a>0$. For $a\\le0$ the integral does not converge and there is no transform to write down. State $a>0$ with the result, every time.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega},\\qquad a>0',
        label:'Solution',
        note:'$|X(j\\omega)|=\\dfrac{1}{\\sqrt{a^{2}+\\omega^{2}}}$, so the peak is $|X(j0)|=1/a$ and the curve falls to zero as $\\omega$ grows.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','At $a=0.1,\\,1,\\,5$ the peak $1/a$ is $10$, $1$ and $0.2$. Those are the three heights in the panels beside this text.'],
        ['Reading','A slow decay in time, small $a$, gives a tall narrow spectrum. A fast decay gives a low wide one. The same trade-off appears again for every signal in this module.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-1,14],yr:[-0.15,1.25],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:3});
      [[0.1,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(t=>t<0?0:Math.exp(-av*t),{color:col,n:2400}));
      a.note(13.6,0.98,'a=0.1',{anchor:'end',color:C.in,fs:13,tex:true});
      return a.svg(); },
      caption:'The signal, for $a=0.1$, $1$ and $5$. All three start at 1.'},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:3, gap:'12px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:190,xr:[-4,4],yr:[-1.2,11.5],xlabel:'\\omega',ylabel:'|X|',pad:{l:52,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,5,10]});
          a.curve(w=>1/Math.hypot(0.1,w),{color:C.in,n:1600}); return a.svg(); },
          caption:'$a=0.1$: peak $10$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:190,xr:[-4,4],yr:[-0.12,1.15],xlabel:'\\omega',ylabel:'|X|',pad:{l:52,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,0.5,1]});
          a.curve(w=>1/Math.hypot(1,w),{color:C.mid,n:1600}); return a.svg(); },
          caption:'$a=1$: peak $1$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:190,xr:[-4,4],yr:[-0.024,0.23],xlabel:'\\omega',ylabel:'|X|',pad:{l:58,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,0.1,0.2]});
          a.curve(w=>1/Math.hypot(5,w),{color:C.out,n:1600}); return a.svg(); },
          caption:'$a=5$: peak $0.2$.'}]
      ]}]}
  ]}
]},

{ id:'m5-ex-exp-phase', module:'M5', nav:'Worked example · its phase', title:'The phase of $1/(a+j\\omega)$, and the sign that is easy to lose', src:'p. 45',
  objective:'Derive the phase with its minus sign and check it against the plot.',
  keywords:'phase arctan minus sign angle of a quotient subtraction error worked example', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 45'},
  {t:'title', text:'The angle of a quotient is a subtraction'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The transform is a fraction, so its angle is the angle of the numerator minus the angle of the denominator. Write both, even when one of them is zero.'},
    {t:'eq', size:'sm', tex:'\\angle X(j\\omega)=\\angle 1-\\angle(a+j\\omega)=0-\\tan^{-1}\\!\\left(\\frac{\\omega}{a}\\right)'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'\\angle X(j\\omega)=-\\tan^{-1}\\!\\left(\\frac{\\omega}{a}\\right)',
        label:'Solution',
        note:'The minus sign is not optional and it is not a convention. It is what the subtraction left behind after $\\angle1=0$ was written down.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'How the sign gets lost', html:'The numerator has angle zero, so it is tempting to skip that term and copy $\\tan^{-1}(\\omega/a)$ straight out of the denominator. What is then reported is the angle of $a+j\\omega$, which is the angle of the reciprocal of the answer.'},
      {t:'wex', rows:[
        ['One number settles it','At $a=1$, $\\omega=1$: $1/(1+j)$ has angle $-0.785398$ rad, that is $-\\pi/4$. The positive value $+\\pi/4$ belongs to $1+j$ itself.'],
        ['Two more','$1/(0.1+3j)$ has angle $-1.537475$; $1/(5+2j)$ has angle $-0.380506$. Every one of them is negative.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The plot is the second opinion', html:'The phase curve falls from $+\\pi/2$ at large negative $\\omega$ to $-\\pi/2$ at large positive $\\omega$. A curve that rises left to right would be $+\\tan^{-1}(\\omega/a)$, and no phase plot of this signal does that. The sign of the answer and the slope of the curve are two views of the same fact.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:230,xr:[-12,12],yr:[-1.85,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',pad:{l:66,r:26,t:34,b:36},xtarget:7,
        yticksOverride:[-1.5708,-0.7854,0,0.7854,1.5708],ytickfmt:v=>v.toFixed(2)});
      [[0.1,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(w=>-Math.atan(w/av),{color:col,n:2000}));
      a.point(1,-PI/4,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'The phase for $a=0.1$, $1$ and $5$. The marked point is $-0.785398$ rad at $\\omega=1$, $a=1$. Every curve falls; none rises.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-12,12],yr:[-1.85,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{sign test}',pad:{l:66,r:26,t:34,b:36},xtarget:7,
          yticksOverride:[-1.5708,0,1.5708],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>-Math.atan(w),{color:C.out,n:1600});
        a.curve(w=>Math.atan(w),{color:C.err,n:1600,dash:'5 5'});
        return a.svg(); },
        caption:'The two candidates, drawn together. The falling green curve is $-\\tan^{-1}(\\omega/a)$; the rising dashed red one is $+\\tan^{-1}(\\omega/a)$. Only the falling one is the phase of $1/(a+j\\omega)$.'}]}
  ]}
]},

{ id:'m5-ex-twosided', module:'M5', nav:'Worked example · two-sided exponential', title:'Worked example — $e^{-a|t|}$, an even signal', src:'p. 46',
  objective:'Transform the two-sided exponential and connect evenness to a real transform.',
  keywords:'worked example two-sided exponential even signal real transform 2a/(a^2+w^2)', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 46'},
  {t:'title', text:'Split the integral where the signal changes formula'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=e^{-a|t|}$ with $a>0$.'],
      ['Find','$X(j\\omega)$, and say what its being real tells us about $x$.'],
      ['Method','$|t|$ means two formulas, so split at $t=0$ and integrate each half separately.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X(j\\omega)=\\int_{-\\infty}^{0}e^{at}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t=\\frac{1}{a-j\\omega}+\\frac{1}{a+j\\omega}',
        note:'On the left half $|t|=-t$, so the exponent is $+at$. Getting that sign wrong makes the first integral diverge, which is the signal that the split was done carelessly.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'e^{-a|t|}\\;\\longleftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}},\\qquad a>0',
        label:'Solution',
        note:'The two imaginary parts cancelled when the fractions were added. $X(j0)=2/a$, and for $a=0.5,\\,1,\\,5$ that is $4$, $2$ and $0.4$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Real, and even, and no accident', html:'$x$ is real and even, and $X$ came out real and even. That is a general rule, proved later in this module: for a real even signal the imaginary part of the transform is zero at every frequency, so the phase is $0$ or $\\pi$ and there is nothing for a phase plot to show.'},
      {t:'note', kind:'warn', head:'It never reaches zero', html:'$2a/(a^{2}+\\omega^{2})$ is positive at every finite $\\omega$. At $a=1$ and $\\omega=10^{6}$ it is still $2\\times10^{-12}$. Small is not zero, and this signal is used again later for exactly that reason.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-8,8],yr:[-0.15,1.25],xlabel:'t',ylabel:'e^{-a|t|}',pad:{l:56,r:26,t:32,b:34},xtarget:7,ytarget:3});
      [[0.5,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(t=>Math.exp(-av*Math.abs(t)),{color:col,n:2400}));
      return a.svg(); },
      caption:'The signal for $a=0.5$, $1$ and $5$. It is even, and it has a corner at the origin.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-6,6],yr:[-0.45,4.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,0.4,2,4]});
        [[0.5,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(w=>2*av/(av*av+w*w),{color:col,n:2400}));
        a.point(0,4,{color:C.coral,r:4}); a.point(0,2,{color:C.coral,r:4}); a.point(0,0.4,{color:C.coral,r:4});
        return a.svg(); },
        caption:'The transform, with a tick at each of the three peaks $2/a$: $4$, $2$ and $0.4$.'}]}
  ]}
]}
,

{ id:'m5-rect-sinc', module:'M5', nav:'Rectangular pulse', title:'The rectangular pulse, and the sinc convention', src:'pp. 46–47',
  objective:'Transform the rectangular pulse and fix the sinc convention used everywhere after this.',
  keywords:'rectangular pulse sinc unnormalised normalised convention 2 T1 sin(wT1)/w', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 46–47'},
  {t:'title', text:'A pulse in time is a sinc in frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1$ for $|t|<T_1$ and $0$ otherwise.'],
      ['Find','$X(j\\omega)$, its value at the origin, and its zero crossings.'],
      ['Method','The signal is 1 on a finite interval, so the analysis integral runs from $-T_1$ to $T_1$ with the integrand $e^{-j\\omega t}$ alone.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X(j\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}',
        note:'The last step uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$, so the $j$ cancels and the answer is real.'},
      {t:'eq', key:true, size:'lg', tex:'x(t)=\\begin{cases}1,&|t|<T_1\\\\0,&|t|>T_1\\end{cases}\\quad\\longleftrightarrow\\quad X(j\\omega)=\\frac{2\\sin(\\omega T_1)}{\\omega}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The sinc convention used in this course', html:'This course writes $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$, the <b>unnormalised</b> sinc, with $\\operatorname{sinc}(0)=1$ and zeros at $\\theta=\\pm\\pi,\\pm2\\pi,\\dots$ In that convention the result reads $X(j\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)$.'},
      {t:'note', kind:'warn', head:'The other convention, once', html:'Signal processing software and many communications texts use the <b>normalised</b> sinc, $\\operatorname{sinc}_{\\text{n}}(\\theta)=\\dfrac{\\sin(\\pi\\theta)}{\\pi\\theta}$, whose zeros are at the integers. The same result there is $2T_1\\operatorname{sinc}_{\\text{n}}(\\omega T_1/\\pi)$. The two agree only once the argument is divided by $\\pi$, so the argument inside $\\operatorname{sinc}(\\cdot)$ is never copied between them.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','$X(j0)=2T_1$ by l\u2019H\u00f4pital, since $\\sin(\\omega T_1)/\\omega\\to T_1$. For $T_1=1,\\,5,\\,10$ that is $2$, $10$ and $20$, which are the three peaks below.'],
        ['Reading','Widening the pulse raises the peak and pulls the first zero in. Narrowing it lowers the peak and pushes the first zero out.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:180,xr:[-3,3],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,1]});
      a.curve(t=>rectp(t,1),{color:C.in,n:3000});
      return a.svg(); },
      caption:'The pulse, drawn for $T_1=1$. Its full width is $2T_1$.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:3, gap:'12px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:200,xr:[-12,12],yr:[-0.75,2.35],xlabel:'\\omega',ylabel:'X',pad:{l:46,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,1,2]});
          a.curve(w=>rectFT(w,1),{color:C.in,n:1600}); a.point(0,2,{color:C.coral,r:3.6}); return a.svg(); },
          caption:'$T_1=1$: peak $2$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:200,xr:[-3,3],yr:[-3.7,11.6],xlabel:'\\omega',ylabel:'X',pad:{l:50,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,5,10]});
          a.curve(w=>rectFT(w,5),{color:C.mid,n:1600}); a.point(0,10,{color:C.coral,r:3.6}); return a.svg(); },
          caption:'$T_1=5$: peak $10$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:200,xr:[-1.6,1.6],yr:[-7.4,23.2],xlabel:'\\omega',ylabel:'X',pad:{l:54,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,10,20]});
          a.curve(w=>rectFT(w,10),{color:C.out,n:1600}); a.point(0,20,{color:C.coral,r:3.6}); return a.svg(); },
          caption:'$T_1=10$: peak $20$.'}]
      ]},
      {t:'small', html:'Each panel is scaled to its own data, with a tick placed at the peak $2T_1$ the text names. The negative side lobes belong to the answer and are drawn in every case.'}]}
  ]}
]},

{ id:'m5-rect-zeros', module:'M5', nav:'Where the sinc is zero', title:'The zero crossings, and the one point that is not one', src:'pp. 46–47',
  objective:'State the zero set with the origin excluded and justify the exclusion.',
  keywords:'zero crossings k pi over T1 exclude origin lHopital main lobe index set', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Reading the result', src:'pp. 46–47'},
  {t:'title', text:'Every multiple of $\\pi/T_1$ except the first'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'$X(j\\omega)=2\\sin(\\omega T_1)/\\omega$ is a quotient, so it vanishes where the numerator does and the denominator does not. Solve $\\sin(\\omega T_1)=0$:'},
    {t:'eq', key:true, tex:'\\omega=\\pm\\frac{\\pi}{T_1}k,\\qquad k=1,2,3,\\dots',
      label:'Zero crossings',
      note:'The index starts at $1$. The point $k=0$ is where the denominator vanishes too, and it has to be handled separately.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Why $k=0$ cannot be in the list', html:'At $\\omega=0$ the expression is $0/0$, which is not a value at all. One application of l\u2019H\u00f4pital gives $\\displaystyle\\lim_{\\omega\\to0}\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1$, and $2T_1$ is the largest value the transform takes. Writing $k\\in\\mathbb{Z}$ in the zero set claims the peak is a zero, and the very next line of any solution contradicts it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The main lobe', html:'The stretch between the first zero on each side, $-\\pi/T_1<\\omega<\\pi/T_1$, is the <b>main lobe</b>. Its width is $2\\pi/T_1$ and it carries most of the signal. Everything outside it is a <b>side lobe</b>, alternating in sign and shrinking like $1/|\\omega|$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['For $T_1=1$','The first zeros are at $\\omega=\\pm\\pi\\approx\\pm3.141593$, the second at $\\pm2\\pi$, and so on.'],
        ['First side lobe','It sits between $\\pi$ and $2\\pi$, reaching about $-0.4344$ near $\\omega=4.4934$. It is negative, so a magnitude plot and a plot of $X$ itself are not the same picture.'],
        ['Same rule everywhere','The pattern "zero at every multiple of $\\pi/T_1$ except the origin" repeats for every sinc in this module.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:250,xr:[-13,13],yr:[-0.75,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
      a.curve(w=>rectFT(w,1),{color:C.in,width:2.4,n:2400});
      for(let k=1;k<=4;k++){ a.point(k*PI,0,{color:C.err,r:4}); a.point(-k*PI,0,{color:C.err,r:4}); }
      a.point(0,2,{color:C.coral,r:4.6});
      return a.svg(); },
      caption:'Red marks the zeros at $\\pm\\pi$, $\\pm2\\pi$, $\\pm3\\pi$, $\\pm4\\pi$. The stretch between the first two, $|\\omega|<\\pi/T_1$, is the main lobe. The point at the origin is not a zero: it is the peak $2T_1=2$.'},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[2.6,10],yr:[-0.55,0.32],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:60,r:26,t:32,b:36},xtarget:6,ytarget:3});
        a.curve(w=>rectFT(w,1),{color:C.in,width:2.4,n:1600});
        a.point(4.493409,rectFT(4.493409,1),{color:C.err,r:4.4});
        return a.svg(); },
        caption:'The first side lobe alone, enlarged. Its lowest point is about $-0.4344$, well away from zero.'}]}
  ]}
]},

{ id:'m5-sinc-rect', module:'M5', nav:'The ideal low-pass pair', title:'The same pair, read in the other direction', src:'pp. 47–48',
  objective:'Invert an ideal low-pass band and read its time-domain peak.',
  keywords:'ideal low pass band W sin(Wt)/(pi t) peak W/pi inverse transform pair', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 47–48'},
  {t:'title', text:'A pulse in frequency is a sinc in time'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X(j\\omega)=1$ for $|\\omega|<W$ and $0$ otherwise. This is the <b>ideal low-pass band</b>, and {{sym:Wband|$W$}} is its band edge in rad/s.'],
      ['Find','$x(t)$, its value at $t=0$, and its zero crossings.'],
      ['Method','Synthesis, integrating from $-W$ to $W$ with the $1/2\\pi$ in front.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{\\sin(Wt)}{\\pi t}'},
      {t:'eq', key:true, size:'lg', tex:'\\frac{\\sin(Wt)}{\\pi t}\\;\\longleftrightarrow\\;X(j\\omega)=\\begin{cases}1,&|\\omega|<W\\\\0,&|\\omega|>W\\end{cases}',
        label:'Solution',
        note:'In the convention of this module, $\\dfrac{\\sin(Wt)}{\\pi t}=\\dfrac{W}{\\pi}\\operatorname{sinc}(Wt)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Peak','$x(0)=W/\\pi$, again by l\u2019H\u00f4pital. For $W=0.5\\pi,\\,\\pi,\\,2\\pi$ that is $0.5$, $1$ and $2$.'],
        ['Zeros','$t=\\pm\\pi k/W$ for $k=1,2,3,\\dots$ The origin is excluded for the same reason as before.'],
        ['Sign','This signal is not a pulse. It rings on both sides of the origin for ever, alternating in sign.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The two examples are one statement', html:'A rectangle in one domain is a sinc in the other, whichever domain the rectangle starts in. That symmetry is not a coincidence, and it is given a name and a proof later in this module.'}]}
  ], right:[
    {t:'grid', cols:3, gap:'12px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:196,xr:[-9,9],yr:[-0.2,0.62],xlabel:'t',ylabel:'x(t)',pad:{l:54,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,0.25,0.5]});
        a.curve(t=>lpfTime(t,0.5*PI),{color:C.in,n:2400}); a.point(0,0.5,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$W=0.5\\pi$: peak $0.5$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:196,xr:[-6,6],yr:[-0.4,1.24],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,0.5,1]});
        a.curve(t=>lpfTime(t,PI),{color:C.mid,n:2400}); a.point(0,1,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$W=\\pi$: peak $1$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:280,h:196,xr:[-3,3],yr:[-0.8,2.48],xlabel:'t',ylabel:'x(t)',pad:{l:50,r:16,t:30,b:34},xtarget:3,yticksOverride:[0,1,2]});
        a.curve(t=>lpfTime(t,2*PI),{color:C.out,n:2400}); a.point(0,2,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$W=2\\pi$: peak $2$.'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-9,9],yr:[-0.25,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:2,yticksOverride:[0,1]});
        a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.out,n:3000});
        return a.svg(); },
        caption:'The band itself, for $W=2\\pi$; its full width is $2W$. Each panel above is scaled to its own data, with a tick at the peak $W/\\pi$.'}]}
  ]}
]},

{ id:'m5-inverse-rel', module:'M5', nav:'Narrow in time, wide in frequency', title:'Compress in time and the spectrum spreads', src:'p. 48',
  objective:'State the inverse relation as a scaling statement, with the bandwidth measure named.',
  keywords:'inverse relationship duration bandwidth product scaling family first null measure', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Reading the result', src:'p. 48'},
  {t:'title', text:'One quantity goes up when the other goes down'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The rectangular pulse of half-width $T_1$ has its first zero at $\\omega=\\pi/T_1$. Halve $T_1$ and that zero doubles. The relation is exact, and it comes from the scaling property proved later in this module: replacing $t$ by $at$ divides the duration by $|a|$ and multiplies every frequency by $|a|$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Say which bandwidth is being measured', html:'"Bandwidth" is not one number until a measure is chosen. Here it is the <b>first-null bandwidth</b>: the distance from the origin to the first zero of the transform, $\\text{BW}=\\pi/T_1$ rad/s. The duration is the full width $T=2T_1$, measured on both sides.'},
      {t:'eq', key:true, tex:'T\\times\\text{BW}=2T_1\\cdot\\frac{\\pi}{T_1}=2\\pi',
        label:'For this pulse, at every width',
        note:'For $T_1=1$: $T=2$, $\\text{BW}=\\pi$, product $6.283185$. For $T_1=1/4$ the two factors become $0.5$ and $4\\pi$, and the product is unchanged.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The product is not a universal constant', html:'It is invariant <b>within one shape</b>, because scaling moves the two factors in opposite directions by the same amount. Change the shape and the number changes: a triangular pulse of the same total duration has its first null at $2\\pi/T_1$, so its product is $4\\pi$, not $2\\pi$. Written without the word "for this signal", the statement is false.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What is always true', html:'Whatever measure is chosen, narrowing a signal in time widens its spectrum and widening it narrows the spectrum. In general the product of the two has a lower bound and no upper one, so it cannot be made small in both domains at once. That is the useful half of the statement, and it holds for every signal.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(t,1),{color:C.in,n:3000}); a.span(-1,1,1.14,'T=2',{color:C.coral,tex:true,fs:13}); return a.svg(); },
        caption:'$T_1=1$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-16,16],yr:[-0.75,2.4],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>rectFT(w,1),{color:C.in,n:2400}); a.point(PI,0,{color:C.err,r:4}); return a.svg(); },
        caption:'First null at $\\pi$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-3,3],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(t,0.25),{color:C.out,n:3000}); a.span(-0.25,0.25,1.14,'T=0.5',{color:C.coral,tex:true,fs:13}); return a.svg(); },
        caption:'$T_1=1/4$: four times narrower.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-16,16],yr:[-0.19,0.6],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,0.25,0.5]});
        a.curve(w=>rectFT(w,0.25),{color:C.out,n:2400}); a.point(4*PI,0,{color:C.err,r:4}); return a.svg(); },
        caption:'First null at $4\\pi$: four times further out.'}]
    ]}
  ]}
]},

{ id:'m5-bandlimit', module:'M5', nav:'Duration and band limitation', title:'Only one of the two implications is a theorem', src:'p. 48',
  objective:'Separate the true statement about finite duration from the false converse.',
  keywords:'band limited finite duration implication counterexample contrapositive false converse', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · A statement to get right', src:'p. 48'},
  {t:'title', text:'A short signal is never band-limited'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'Band-limited', html:'A signal is <b>band-limited</b> when $X(j\\omega)=0$ for every $|\\omega|>W$, for some finite $W$. The spectrum is not merely small out there; it is exactly zero.'},
    {t:'eq', key:true, tex:'\\text{finite duration}\\;\\Longrightarrow\\;\\text{not band-limited}',
      label:'The theorem',
      note:'Equivalently, in the other direction: a band-limited signal cannot have finite duration. The rectangular pulse is the witness — its transform is a sinc, which is non-zero on stretches reaching out to every frequency.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The converse is false', html:'"Infinite duration $\\Rightarrow$ finite bandwidth" is not a theorem, and one signal already met in this module disproves it. $e^{-a|t|}$ lasts for ever, and its transform $2a/(a^{2}+\\omega^{2})$ is strictly positive at every finite frequency. At $a=1$ and $\\omega=10^{6}$ it is $2\\times10^{-12}$: small, and not zero.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['What lasting for ever buys','Nothing on its own. It is the price of being band-limited, not a guarantee of it.'],
        ['Where the two meet','$\\dfrac{\\sin(Wt)}{\\pi t}$ is band-limited and does have infinite duration, which is consistent with both statements. It is an example, not a proof of the converse.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Why this is worth the care', html:'Module 7 asks whether a signal can be sampled without loss, and the answer depends on band limitation alone. A rule that hands out band limitation for free would make every finite-length recording safe to sample, which it is not.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-40,40],yr:[-0.75,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
      a.curve(w=>rectFT(w,1),{color:C.in,width:2,n:4000});
      return a.svg(); },
      caption:'The pulse of duration $2$ seconds: its spectrum keeps returning at every frequency shown, and at every frequency beyond.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[0,40],yr:[-0.35,2.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:66,r:26,t:34,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>2/(1+w*w),{color:C.err,width:2.2,n:2400});
        return a.svg(); },
        caption:'The two-sided exponential: infinite duration, and a spectrum that approaches zero without ever reaching it.'}]}
  ]}
]},

{ id:'m5-periodic', module:'M5', nav:'A periodic signal', title:'The transform of a periodic signal', src:'p. 49',
  objective:'Derive the impulse train in frequency from the Fourier series.',
  keywords:'periodic signal transform impulse train 2 pi a_k harmonics series as transform', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Bridging the two modules', src:'p. 49'},
  {t:'title', text:'Every harmonic becomes one impulse'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'A periodic signal has a Fourier series. Take the transform of that series term by term, using linearity and the pair $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$ from earlier in this module.'},
    {t:'eq', size:'sm', tex:'x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longrightarrow\\;X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}a_k\\cdot2\\pi\\delta(\\omega-k\\omega_0)'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0),\\qquad \\omega_0=\\frac{2\\pi}{T_0}',
        label:'Transform of a periodic signal',
        note:'The spectrum is a train of impulses. They sit at the harmonic frequencies $k\\omega_0$, and the impulse at $k\\omega_0$ carries weight $2\\pi a_k$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The weight is $2\\pi a_k$, not $a_k$', html:'The Fourier series coefficient and the transform are different objects. $a_k$ is a dimensionless complex number attached to one harmonic; $2\\pi a_k$ is the <b>area</b> of the impulse the transform puts at that harmonic. Reporting the coefficients themselves as the transform loses a factor of $2\\pi$ on every line.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Both pictures now live in one place', html:'A periodic signal has a spectrum made of isolated impulses; an aperiodic finite-energy signal has a continuous one. Module 4 is the special case of this module in which the spectrum happens to be discrete.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-9,9],yr:[-0.3,1.45],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,1]});
      a.curve(t=>rectPer(t,8,1),{color:C.in,n:3000});
      return a.svg(); },
      caption:'A periodic signal: the rectangular wave with $T_0=8T_1$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:230,xr:[-6,6],yr:[-0.6,1.95],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1,1.5]});
        const w0=2*PI/8;
        for(let k=-7;k<=7;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9) continue;
          a.impulse(k*w0,wt,{color:C.mid,label:false}); }
        /* the weights are 2 pi a_k = w0 * (2 sin(w T1)/w) read at w = k w0 */
        a.curve(w=>w0*rectFT(w,1),{color:C.coral,width:1.4,dash:'4 5',n:1200,opacity:.9});
        a.point(0,2*PI*aSq(0,8,1),{color:C.coral,r:4});
        return a.svg(); },
        caption:'Its transform: impulses of weight $2\\pi a_k$ at $\\omega=k\\omega_0$, with $\\omega_0=\\pi/4$. The dashed curve is the envelope they are sampled from. The impulse at the origin carries $2\\pi a_0=1.5708$.'}]}
  ]}
]},

{ id:'m5-ex-square', module:'M5', nav:'Worked example · square wave', title:'Worked example — the periodic square wave as a transform', src:'p. 49',
  objective:'Compute the impulse weights for three periods and read the spacing correctly.',
  keywords:'worked example periodic square wave impulse weights spacing three periods envelope', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 49'},
  {t:'title', text:'Three periods, three spacings, one envelope'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The rectangular wave of Module 4: $1$ on $|t|<T_1$ inside each period, with $T_1=1$ and period $T$.'],
      ['Find','The transform for $T=8T_1$, $16T_1$ and $32T_1$, with the spacing and the weight at the origin in each case.'],
      ['Method','Take $a_k$ from Module 4, multiply by $2\\pi$, and place an impulse at each $k\\omega_0$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{\\sin(k\\omega_0T_1)}{\\pi k}\\;(k\\neq0),\\qquad a_0=\\frac{2T_1}{T}\\qquad\\Longrightarrow\\qquad 2\\pi a_k=\\frac{2\\sin(k\\omega_0T_1)}{k}',
        note:'The $\\pi$ in the denominator cancels against the $2\\pi$, which is why the impulse weights are simpler than the coefficients.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['$T=8T_1$','$\\omega_0=2\\pi/8=\\pi/4=0.392699$. $a_0=0.25$, so the impulse at the origin has weight $2\\pi a_0=1.5708$.'],
        ['$T=16T_1$','$\\omega_0=2\\pi/16=\\pi/8=0.196350$. $a_0=0.125$, weight $0.7854$.'],
        ['$T=32T_1$','$\\omega_0=2\\pi/32=\\pi/16=0.098175$. $a_0=0.0625$, weight $0.3927$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Read the sequence, not the individual case', html:'Each doubling of the period halves the spacing and halves every weight. The envelope $2\\sin(\\omega T_1)/\\omega$ does not move at all, because it was built from the pulse and the pulse never changed. Carried on for ever, this is the derivation the module opened with.'},
      {t:'note', kind:'warn', head:'The coefficients are signed', html:'For $T=8T_1$ the impulses at $k=\\pm5,\\pm6,\\pm7$ point downwards and those at $k=\\pm4,\\pm8$ vanish, because $\\sin(k\\pi/4)$ is negative and zero there. A plot of $|a_k|$ hides both facts.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:172,xr:[-4,4],yr:[-0.65,1.85],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1,1.5]});
        const w0=2*PI/8;
        for(let k=-11;k<=11;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9||Math.abs(k*w0)>4) continue;
          a.impulse(k*w0,wt,{color:C.in,label:false}); }
        return a.svg(); },
        caption:'$T=8T_1$: spacing $0.3927$, weight at the origin $1.5708$.'}],
      [{t:'reveal', at:2, items:[{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:172,xr:[-4,4],yr:[-0.34,0.95],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:60,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.4,0.8]});
        const w0=2*PI/16;
        for(let k=-21;k<=21;k++){ const wt=2*PI*aSq(k,16,1); if(Math.abs(wt)<1e-9||Math.abs(k*w0)>4) continue;
          a.impulse(k*w0,wt,{color:C.mid,label:false}); }
        return a.svg(); },
        caption:'$T=16T_1$: spacing $0.1963$, weight $0.7854$.'}]}],
      [{t:'reveal', at:3, items:[{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:172,xr:[-4,4],yr:[-0.17,0.48],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:62,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.2,0.4]});
        const w0=2*PI/32;
        for(let k=-41;k<=41;k++){ const wt=2*PI*aSq(k,32,1); if(Math.abs(wt)<1e-9||Math.abs(k*w0)>4) continue;
          a.impulse(k*w0,wt,{color:C.out,label:false}); }
        return a.svg(); },
        caption:'$T=32T_1$: spacing $0.0982$, weight $0.3927$. The envelope has not moved once.'}]}]
    ]}
  ]}
]}
,

{ id:'m5-ex-sinus', module:'M5', nav:'Worked example · cosine and sine', title:'Worked example — a cosine has two impulses, not one', src:'p. 50',
  objective:'Transform a cosine and a sine and keep both halves of each pair.',
  keywords:'worked example cosine sine impulses negative frequency pair euler real signal', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'The negative half of a real spectrum'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Expand the sinusoid with Euler’s relations and transform each exponential separately. Every term produces its own impulse, and there are always two.'},
    {t:'eq', size:'sm', tex:'4\\cos(3\\pi t)=2e^{j3\\pi t}+2e^{-j3\\pi t}\\;\\longrightarrow\\;2\\cdot2\\pi\\delta(\\omega-3\\pi)+2\\cdot2\\pi\\delta(\\omega+3\\pi)'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'\\mathcal{F}\\{4\\cos(3\\pi t)\\}=4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)',
        label:'Solution, cosine',
        note:'One impulse at $+3\\pi$ and one at $-3\\pi$. The two arguments differ in sign, and writing $\\delta(\\omega-3\\pi)$ twice puts both impulses at the same place and leaves the signal with half its energy.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', size:'sm', tex:'6\\sin(4\\pi t)=\\frac{6}{2j}e^{j4\\pi t}-\\frac{6}{2j}e^{-j4\\pi t}'},
      {t:'eq', key:true, tex:'\\mathcal{F}\\{6\\sin(4\\pi t)\\}=\\frac{6\\pi}{j}\\,\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\,\\delta(\\omega+4\\pi)',
        label:'Solution, sine',
        note:'$6\\pi/j=-6\\pi j$, an <b>imaginary</b> weight of modulus $6\\pi=18.849556$. The cosine gave real weights; the sine gives imaginary ones, and the sign flips between the two sides.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'The check that catches the missing half', html:'A real signal has $X(-j\\omega)=X^{*}(j\\omega)$. For the cosine that means equal real weights at $\\pm3\\pi$; for the sine it means opposite imaginary weights at $\\pm4\\pi$. A spectrum with only the positive-frequency impulse fails this test at once, and the signal it describes is complex, not real.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-2.2,2.2],yr:[-4.6,4.6],xlabel:'t',ylabel:'4\\cos(3\\pi t)',pad:{l:56,r:18,t:32,b:34},xtarget:5,ytarget:3});
        a.curve(t=>4*Math.cos(3*PI*t),{color:C.in,n:2400}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-14,14],yr:[-1.6,15.6],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:18,t:32,b:34},xtarget:5,ytarget:3,yticksOverride:[0,12.566],ytickfmt:v=>v.toFixed(2)});
        a.impulse(3*PI,4*PI,{color:C.mid,labelText:'12.57'});
        a.impulse(-3*PI,4*PI,{color:C.mid,labelText:'12.57'}); return a.svg(); }}]
    ]},
    {t:'small', html:'Left: the cosine. Right: its two impulses of weight $4\\pi=12.566371$, one at each of $\\pm3\\pi$.'},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-1.6,1.6],yr:[-6.9,6.9],xlabel:'t',ylabel:'6\\sin(4\\pi t)',pad:{l:56,r:18,t:32,b:34},xtarget:5,ytarget:3});
          a.curve(t=>6*Math.sin(4*PI*t),{color:C.in,n:2400}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-18,18],yr:[-22,22],xlabel:'\\omega',ylabel:'\\operatorname{Im}\\{X(j\\omega)\\}',pad:{l:62,r:18,t:32,b:34},xtarget:5,ytarget:3,yticksOverride:[-18.85,0,18.85],ytickfmt:v=>v.toFixed(2)});
          a.impulse(4*PI,-6*PI,{color:C.err,label:false});
          a.impulse(-4*PI,6*PI,{color:C.err,label:false}); return a.svg(); }}]
      ]},
      {t:'small', html:'The sine, and the imaginary part of its transform: $-6\\pi$ at $+4\\pi$ and $+6\\pi$ at $-4\\pi$. Drawing these two on the same axis as the cosine impulses would mix a real quantity with an imaginary one.'}]}
  ]}
]},

{ id:'m5-ex-sinus-b', module:'M5', nav:'Worked example · a mixed signal', title:'Worked example — a constant, a cosine and a sine together', src:'p. 50',
  objective:'Assemble one spectrum from three terms and show it as magnitude and phase.',
  keywords:'worked example three components constant cosine sine magnitude phase complex spectrum', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Five impulses, and how to draw a complex one'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$.'],
      ['Find','$X(j\\omega)$, drawn so that both the size and the phase of every impulse can be read.'],
      ['Method','Linearity: transform each term with the pairs just derived and add.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'sm', tex:'X(j\\omega)=10\\pi\\delta(\\omega)+4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)+\\frac{6\\pi}{j}\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\delta(\\omega+4\\pi)',
        label:'Solution',
        note:'The constant $5$ contributes $5\\cdot2\\pi\\delta(\\omega)=10\\pi\\delta(\\omega)$, of weight $31.415927$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'A complex spectrum needs two panels, not one', html:'Three of these weights are real and two are imaginary. Drawing an imaginary weight as a downward arrow on the same axis as a real one uses the vertical direction for two different meanings at once, and the picture can no longer be read. Draw <b>magnitude and phase</b>, or draw <b>real part and imaginary part</b>, and say in the caption which pair is shown.'},
      {t:'wex', rows:[
        ['Magnitudes','$10\\pi=31.4159$ at $\\omega=0$; $4\\pi=12.5664$ at $\\pm3\\pi$; $6\\pi=18.8496$ at $\\pm4\\pi$.'],
        ['Phases','$0$ at $\\omega=0$ and at $\\pm3\\pi$; $-\\pi/2$ at $+4\\pi$ and $+\\pi/2$ at $-4\\pi$, because $1/j=-j$.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','The signal is real, so the magnitude must be even in $\\omega$ and the phase odd. Both hold here.'],
        ['Reading','The magnitude plot alone cannot tell a cosine from a sine at the same frequency. The phase panel is what separates them.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:180,xr:[-2,2],yr:[-6.5,16.5],xlabel:'t',ylabel:'x(t)',pad:{l:54,r:26,t:30,b:34},xtarget:7,ytarget:4,yticksOverride:[-4.78,0,5,10,14.78],ytickfmt:v=>v.toFixed(2)});
      a.curve(t=>5+4*Math.cos(3*PI*t)+6*Math.sin(4*PI*t),{color:C.in,n:3000});
      return a.svg(); },
      caption:'The signal. Its extremes are $-4.7769$ and $14.7769$, and the axis carries a tick at each of them.'},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:1, gap:'10px', items:[
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:820,h:180,xr:[-16,16],yr:[-3.4,36],xlabel:'\\omega',ylabel:'|X(j\\omega)|',pad:{l:58,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,12.57,18.85,31.42],ytickfmt:v=>v.toFixed(2)});
          a.impulse(0,10*PI,{color:C.in,labelText:'31.42'});
          a.impulse(3*PI,4*PI,{color:C.in,labelText:'12.57'});
          a.impulse(-3*PI,4*PI,{color:C.in,labelText:'12.57'});
          a.impulse(4*PI,6*PI,{color:C.in,labelText:'18.85'});
          a.impulse(-4*PI,6*PI,{color:C.in,labelText:'18.85'});
          return a.svg(); },
          caption:'Magnitude: five impulses, even in $\\omega$.'}],
        [{t:'fig', frame:true, svg:()=>{
          const a=P.Axes({w:820,h:170,xr:[-16,16],yr:[-2.1,2.1],xlabel:'\\omega',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',pad:{l:64,r:26,t:32,b:34},xtarget:7,yticksOverride:[-1.5708,0,1.5708],ytickfmt:v=>v.toFixed(2)});
          a.stem([[-4*PI,PI/2],[-3*PI,0],[0,0],[3*PI,0],[4*PI,-PI/2]],{color:C.mid,r:4,showZero:true});
          return a.svg(); },
          caption:'Phase: zero except at $\\pm4\\pi$, and odd in $\\omega$.'}]
      ]}]}
  ]}
]},

{ id:'m5-ex-imptrain', module:'M5', nav:'Worked example · impulse train', title:'Worked example — the impulse train transforms into an impulse train', src:'p. 50',
  objective:'Transform the periodic impulse train and state the reciprocal spacing rule.',
  keywords:'impulse train transform 2 pi over T spacing weight reciprocal sampling preview', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 50'},
  {t:'title', text:'Dense in time, sparse in frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\displaystyle\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)$, one unit impulse every $T$ seconds.'],
      ['Find','$X(j\\omega)$.'],
      ['Method','The signal is periodic with $T_0=T$. Find its Fourier coefficients, then use the impulse-train rule for the transform of a periodic signal.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\quad\\text{for every }k',
        note:'Only the impulse at the origin lies inside the interval of integration, and sifting evaluates the exponential at $t=0$, where it is 1.'},
      {t:'note', kind:'warn', head:'One period, one impulse', html:'The limits must be chosen so that exactly one impulse is enclosed. Writing both limits as $-T/2$ encloses none, and writing $-T/2$ to $T$ encloses two.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)\\;\\longleftrightarrow\\;\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right)',
        label:'Solution',
        note:'Every weight is $2\\pi a_k=2\\pi/T$, and the spacing is $\\omega_0=2\\pi/T$ as well. The same number is both.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['$T=1$','Spacing and weight are both $2\\pi=6.2832$.'],
        ['$T=2$','Spacing and weight are both $\\pi=3.1416$: the impulses in time doubled their separation, so the impulses in frequency halved theirs.'],
        ['Reading','Crowding the impulses in time spreads them in frequency, and vice versa. This one pair is the whole mechanism behind sampling, which is Module 7.']
      ]}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-3.4,3.4],yr:[-0.3,1.5],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        for(let k=-3;k<=3;k++) a.impulse(k,1,{color:C.in,labelText:'1'}); return a.svg(); },
        caption:'$T=1$ in time.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-16,16],yr:[-0.9,8.2],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,3.14,6.28],ytickfmt:v=>v.toFixed(2)});
        for(let k=-2;k<=2;k++) a.impulse(k*2*PI,2*PI,{color:C.mid,label:false}); return a.svg(); },
        caption:'Spacing and weight both $6.2832$.'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-3.4,3.4],yr:[-0.3,1.5],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
          for(let k=-1;k<=1;k++) a.impulse(2*k,1,{color:C.in,labelText:'1'}); return a.svg(); },
          caption:'$T=2$ in time: twice as sparse.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-16,16],yr:[-0.45,4.1],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1.57,3.14],ytickfmt:v=>v.toFixed(2)});
          for(let k=-4;k<=4;k++) a.impulse(k*PI,PI,{color:C.mid,label:false}); return a.svg(); },
          caption:'Spacing and weight both $3.1416$: twice as dense.'}]
      ]}]}
  ]}
]},

{ id:'m5-props-1', module:'M5', nav:'Properties · linearity, time shift', title:'Linearity and the time shift', src:'p. 51',
  objective:'State and prove the two properties that need no new machinery.',
  keywords:'properties linearity time shift linear phase proof magnitude unchanged', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 51'},
  {t:'title', text:'Two rules that follow straight from the integral'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'a\\,x_1(t)+b\\,x_2(t)\\;\\longleftrightarrow\\;a\\,X_1(j\\omega)+b\\,X_2(j\\omega)',
      label:'Linearity',
      note:'The analysis equation is an integral, and integration is linear. Nothing else is needed.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'For the shift, substitute $\\tau=t-t_0$ so that $t=\\tau+t_0$ and $\\d t=\\d\\tau$. The limits do not move, because both are infinite:'},
      {t:'eq', size:'sm', tex:'\\int_{-\\infty}^{\\infty}x(t-t_0)e^{-j\\omega t}\\,\\d t=\\int_{-\\infty}^{\\infty}x(\\tau)e^{-j\\omega(\\tau+t_0)}\\,\\d\\tau=e^{-j\\omega t_0}\\int_{-\\infty}^{\\infty}x(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau'},
      {t:'eq', key:true, size:'lg', tex:'x(t-t_0)\\;\\longleftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)',
        label:'Time shift'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'What a shift does and does not do', html:'$|e^{-j\\omega t_0}|=1$, so $|X|$ is untouched at every frequency. What changes is the phase, by $-\\omega t_0$: a straight line through the origin whose slope is the delay. A delay of $t_0$ seconds is exactly a <b>linear phase</b> of slope $-t_0$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Read the case of the letters', html:'The phase that a shift adds belongs to $X(j\\omega)$, the transform of the signal. The small letter $x$ names the signal itself and never carries the argument $j\\omega$; the capital letter $X$ names the spectrum and always does. The same distinction separates $x$ from $X$ and, later, $X$ from $H$.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-4,7],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(t,1),{color:C.in,n:3000});
        a.curve(t=>rectp(t-3,1),{color:C.out,n:3000}); return a.svg(); },
        caption:'The pulse, and the same pulse delayed by $t_0=3$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-8,8],yr:[-0.35,2.4],xlabel:'\\omega',ylabel:'|X(j\\omega)|',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>Math.abs(rectFT(w,1)),{color:C.mid,n:2400}); return a.svg(); },
        caption:'One magnitude for both: the delay changed nothing here.'}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-3,3],yr:[-10.5,10.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',pad:{l:66,r:26,t:34,b:36},xtarget:7,ytarget:3});
        a.curve(w=>0,{color:C.in,width:2.4});
        a.curve(w=>-3*w,{color:C.out,width:2.4});
        return a.svg(); },
        caption:'The phase before the shift, in cyan, and after it, in green. The delay is read straight off the slope, which is $-t_0$.'}]}
  ]}
]},

{ id:'m5-props-shift-ex', module:'M5', nav:'Worked example · a shifted sum', title:'Worked example — building a signal out of shifted pulses', src:'p. 51',
  objective:'Apply linearity and the shift together and check the value at the origin.',
  keywords:'worked example shifted pulses sum linearity X(j0) area check staircase', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 51'},
  {t:'title', text:'Two rules, one signal'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x_1(t)=1$ on $|t|<2$, and $x_2(t)=1$ on $|t|<1$. Both are zero elsewhere.'],
      ['Find','The transform of $x_3(t)=2x_1(t-4)+x_2(t-3)$, and the value $|X_3(j0)|$.'],
      ['Method','Transform each prototype, apply the shift to each, then add with linearity.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'X_1(j\\omega)=\\frac{2\\sin(2\\omega)}{\\omega},\\qquad X_2(j\\omega)=\\frac{2\\sin\\omega}{\\omega}'},
      {t:'eq', key:true, tex:'X_3(j\\omega)=2e^{-j4\\omega}\\,\\frac{2\\sin(2\\omega)}{\\omega}+e^{-j3\\omega}\\,\\frac{2\\sin\\omega}{\\omega}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'The value at $\\omega=0$ is the area', html:'Setting $\\omega=0$ in the analysis equation gives $X(j0)=\\int x(t)\\,\\d t$: the transform at the origin is the total area under the signal. Both exponentials are 1 there, and both sincs reach their peaks by l’Hôpital.'},
      {t:'eq', key:true, tex:'X_3(j0)=2\\cdot4+1\\cdot2=10',
        label:'Check at the origin',
        note:'$X_1(j0)=4$ and $X_2(j0)=2$, so the answer is $2\\times4+2=10$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Second route','Read the area off the picture. $x_3$ is $3$ on $2<t<4$ and $2$ on $4<t<6$, so the area is $3\\times2+2\\times2=10$. The two routes agree.'],
        ['Why bother','This one number checks the whole calculation in a second, and it catches a dropped coefficient, a wrong pulse width and a lost factor of two alike.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-1,8],yr:[-0.35,3.6],xlabel:'t',ylabel:'x_3(t)',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:4,yticksOverride:[0,1,2,3]});
      a.area(t=>2*rectp(t-4,2)+rectp(t-3,1),-1,8,{color:'rgba(20,112,127,.13)'});
      a.curve(t=>2*rectp(t-4,2)+rectp(t-3,1),{color:C.in,n:3000});
      a.note(3,3.28,'3',{anchor:'middle',color:C.coral,fs:14});
      a.note(5,2.28,'2',{anchor:'middle',color:C.coral,fs:14});
      return a.svg(); },
      caption:'The assembled signal. The shaded area is $10$, which is $X_3(j0)$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-6,6],yr:[-1.8,11.5],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X_3(j\\omega)|',pad:{l:60,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,5,10]});
        a.curve(w=>{ if(Math.abs(w)<1e-6) return 10;
          const re=2*Math.cos(4*w)*2*Math.sin(2*w)/w + Math.cos(3*w)*2*Math.sin(w)/w;
          const im=-2*Math.sin(4*w)*2*Math.sin(2*w)/w - Math.sin(3*w)*2*Math.sin(w)/w;
          return Math.hypot(re,im); },{color:C.mid,n:2400});
        a.point(0,10,{color:C.coral,r:4.4});
        return a.svg(); },
        caption:'The magnitude of the answer, with the marked peak at $|X_3(j0)|=10$.'}]}
  ]}
]},

{ id:'m5-props-freq', module:'M5', nav:'Properties · frequency shift', title:'The frequency shift, and the operand it starts from', src:'p. 52',
  objective:'Prove the frequency-shift property from the expression the property states.',
  keywords:'frequency shift modulation e^{jw0t} band moves proof operand kernel', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 52'},
  {t:'title', text:'Multiply in time, move in frequency'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The property to prove is this one. Note what is being multiplied: the operand is $e^{+j\\omega_0t}$, a complex exponential in <b>time</b>, with the frequency $\\omega_0$ fixed.'},
    {t:'eq', key:true, size:'lg', tex:'e^{j\\omega_0t}\\,x(t)\\;\\longleftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)',
      label:'Frequency shift'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Start the proof from that same expression, and combine the two exponentials before doing anything else:'},
      {t:'eq', size:'sm', tex:'\\int_{-\\infty}^{\\infty}\\bigl[e^{j\\omega_0t}x(t)\\bigr]e^{-j\\omega t}\\,\\d t=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\omega_0)t}\\,\\d t=X\\bigl(j(\\omega-\\omega_0)\\bigr)',
        note:'The exponent went from $-j\\omega t$ to $-j(\\omega-\\omega_0)t$, which is the analysis integral read at the frequency $\\omega-\\omega_0$. No substitution was needed.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Do not open with the time-shift kernel', html:'The time-shift proof multiplies by $e^{-j\\omega t_0}$, in which $t_0$ is a fixed <b>time</b>. The frequency-shift proof multiplies by $e^{+j\\omega_0 t}$, in which $\\omega_0$ is a fixed <b>frequency</b>. The two differ in which symbol is fixed and in the sign of the exponent, and starting the second proof with the first kernel proves a different statement.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Given','$y(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, whose transform is $Y(j\\omega)=1$ on $|\\omega|<2\\pi$ and $y(0)=2$.'],
        ['Multiply by $e^{j2\\pi t}$','The band moves to $0\\le\\omega\\le4\\pi$.'],
        ['Multiply by $e^{-j2\\pi t}$','The band moves to $-4\\pi\\le\\omega\\le0$.'],
        ['Note','Neither product is a real signal, so neither spectrum is symmetric. Real signals are handled by the modulation scenes later in this module, which use a cosine and get two copies instead of one.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-16,16],yr:[-0.25,1.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Y(j\\omega)',pad:{l:56,r:26,t:30,b:36},xtarget:7,ytarget:2,yticksOverride:[0,1]});
      a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,n:3000});
      return a.svg(); },
      caption:'The band before the shift: $1$ on $|\\omega|<2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[-16,16],yr:[-0.25,1.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Y\\bigl(j(\\omega-\\omega_0)\\bigr)',pad:{l:70,r:26,t:32,b:36},xtarget:7,ytarget:2,yticksOverride:[0,1]});
        a.curve(w=>Math.abs(w-2*PI)<2*PI?1:0,{color:C.out,n:3000});
        a.span(0,4*PI,1.16,'0\\le\\omega\\le4\\pi',{color:C.coral,tex:true,fs:13});
        return a.svg(); },
        caption:'After multiplying by $e^{j2\\pi t}$: the whole band moved right by $\\omega_0=2\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[-16,16],yr:[-0.25,1.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Y\\bigl(j(\\omega+\\omega_0)\\bigr)',pad:{l:70,r:26,t:32,b:36},xtarget:7,ytarget:2,yticksOverride:[0,1]});
        a.curve(w=>Math.abs(w+2*PI)<2*PI?1:0,{color:C.mid,n:3000});
        a.span(-4*PI,0,1.16,'-4\\pi\\le\\omega\\le0',{color:C.coral,tex:true,fs:13});
        return a.svg(); },
        caption:'After multiplying by $e^{-j2\\pi t}$: the same band, moved the other way.'}]}
  ]}
]},

{ id:'m5-props-conj', module:'M5', nav:'Properties · conjugation and symmetry', title:'Conjugation, and what being real forces on a spectrum', src:'pp. 52–53',
  objective:'Derive the conjugate symmetry of a real signal and its even and odd consequences.',
  keywords:'conjugation conjugate symmetry real signal even odd hermitian magnitude phase', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'pp. 52–53'},
  {t:'title', text:'Half of a real spectrum is free'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, tex:'x^{*}(t)\\;\\longleftrightarrow\\;X^{*}(-j\\omega)',
      label:'Conjugation',
      note:'Conjugating the analysis integral flips the sign of $j$ everywhere, which is the same as conjugating the transform and reversing $\\omega$.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Now suppose $x$ is real. Then $x^{*}(t)=x(t)$, so the two sides above have the same transform:'},
      {t:'eq', key:true, size:'lg', tex:'x(t)\\ \\text{real}\\quad\\Longrightarrow\\quad X(-j\\omega)=X^{*}(j\\omega)',
        label:'Conjugate symmetry',
        note:'Everything below follows from this one line.'},
      {t:'wex', rows:[
        ['Real part','$\\operatorname{Re}\\{X\\}$ is even in $\\omega$.'],
        ['Imaginary part','$\\operatorname{Im}\\{X\\}$ is odd in $\\omega$.'],
        ['Magnitude','$|X|$ is even.'],
        ['Phase','$\\angle X$ is odd.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Two special cases worth naming', html:'If $x$ is real <b>and even</b>, then $X$ is real and even: the imaginary part is odd and even at once, so it is zero. If $x$ is real <b>and odd</b>, then $X$ is purely imaginary and odd, by the same argument applied to the real part.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'Real does not mean zero phase', html:'A real transform can be negative. Where $X(j\\omega)<0$ the magnitude is $|X|=-X$ and the phase is $\\pi$, not $0$. Only a real <b>and non-negative</b> transform has zero phase everywhere. The sinc of the rectangular pulse is the standing counterexample: it is real, and its side lobes are negative.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-5,5],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3});
        a.curve(t=>Math.exp(-Math.abs(t))*Math.sin(2*t),{color:C.in,n:2400}); return a.svg(); },
        caption:'A real, odd signal.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-6,6],yr:[-1.05,1.05],xlabel:'\\omega',ylabel:'\\operatorname{Im}\\{X(j\\omega)\\}',pad:{l:64,r:18,t:32,b:34},xtarget:5,ytarget:3});
        a.curve(w=>{ const A=1,B=2; return -(1/(1+(w-B)*(w-B)) - 1/(1+(w+B)*(w+B))); },{color:C.mid,n:2400}); return a.svg(); },
        caption:'Its transform is purely imaginary and odd.'}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-13,13],yr:[-0.9,2.4],xlabel:'\\omega\\;[\\text{rad/s}]',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>rectFT(w,1),{color:C.in,width:2.2,n:2400});
        a.curve(w=>Math.abs(rectFT(w,1)),{color:C.err,width:1.6,dash:'5 5',n:2400});
        a.note(12.4,2.14,'X(j\\omega)',{anchor:'end',color:C.in,fs:14,tex:true});
        a.note(12.4,-0.62,'|X(j\\omega)|',{anchor:'end',color:C.err,fs:14,tex:true});
        return a.svg(); },
        caption:'A real transform and its magnitude. They part company wherever $X$ is negative, and there the phase is $\\pi$.'}]}
  ]}
]}
,

{ id:'m5-props-diff', module:'M5', nav:'Properties · differentiation', title:'Differentiation, done under the integral sign', src:'p. 53',
  objective:'Prove the differentiation property correctly and expose the step students reproduce.',
  keywords:'differentiation property jw X integration variable false step under the integral', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'Differentiate the synthesis equation, not the signal'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Start from the synthesis equation and differentiate both sides with respect to $t$. On the right the only factor depending on $t$ is $e^{j\\omega t}$, and $\\omega$ is the variable of integration, so it is held fixed:'},
    {t:'eq', size:'sm', tex:'\\frac{\\d}{\\d t}x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,\\frac{\\partial}{\\partial t}e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\bigl[j\\omega X(j\\omega)\\bigr]e^{j\\omega t}\\,\\d\\omega'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'The right-hand side is now the synthesis equation of the function $j\\omega X(j\\omega)$. Reading it that way finishes the proof:'},
      {t:'eq', key:true, size:'lg', tex:'\\frac{\\d x}{\\d t}\\;\\longleftrightarrow\\;j\\omega\\,X(j\\omega),\\qquad \\frac{\\d^{n}x}{\\d t^{n}}\\;\\longleftrightarrow\\;(j\\omega)^{n}X(j\\omega)',
        label:'Differentiation',
        note:'The factor $j\\omega$ never leaves the integral. It multiplies the spectrum, which is a function of $\\omega$, and it is meaningless outside that integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'The step to avoid', html:'It is tempting to pull $j\\omega$ out and write $\\dfrac{\\d x}{\\d t}=j\\omega\\,x(t)$, then take transforms of both sides. That line is false. $\\omega$ is the variable being integrated away, so it is not a constant and it is not available outside the integral. The expression $j\\omega x(t)$ is not a signal at all: it depends on two variables, one of which no longer exists.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['One number kills it','Take $x(t)=e^{-t^{2}}$. Then $\\d x/\\d t$ at $t=1$ is $-0.735759$, a real number. The false expression $j\\omega x(t)$ at $t=1$, $\\omega=3$ is $1.103638j$, which is imaginary. They are not the same object, let alone the same value.'],
        ['Why the result is still right','The boxed answer $(j\\omega)^{n}X(j\\omega)$ is correct. Only the route matters here, and it matters because the wrong route is reused later on integration and on the differential-equation examples, where it does change the answer.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'What the property is worth', html:'Differentiation in time becomes multiplication by $j\\omega$. A linear differential equation with constant coefficients therefore turns into an algebraic equation in $\\omega$, which is how systems are solved at the end of this module.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-3,3],yr:[-1.05,1.25],xlabel:'t',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:3});
      a.curve(t=>Math.exp(-t*t),{color:C.in,n:2000});
      a.curve(t=>-2*t*Math.exp(-t*t),{color:C.out,n:2000});
      a.note(2.85,1.05,'x(t)',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(2.85,-0.86,'\\mathrm{d}x/\\mathrm{d}t',{anchor:'end',color:C.out,fs:14,tex:true});
      a.point(1,-2*Math.exp(-1),{color:C.coral,r:4.2});
      return a.svg(); },
      caption:'The signal and its derivative. The marked point is $-0.735759$ at $t=1$, and it is real.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-6,6],yr:[-1.45,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3});
        a.curve(w=>Math.sqrt(PI)*Math.exp(-w*w/4),{color:C.in,width:2.2,n:1600});
        a.curve(w=>w*Math.sqrt(PI)*Math.exp(-w*w/4),{color:C.out,width:2.2,n:1600});
        a.note(5.7,1.62,'X(j\\omega)',{anchor:'end',color:C.in,fs:14,tex:true});
        a.note(5.7,-1.18,'\\operatorname{Im}\\{j\\omega X(j\\omega)\\}',{anchor:'end',color:C.out,fs:14,tex:true});
        return a.svg(); },
        caption:'The spectrum, and the spectrum of the derivative. Multiplying by $j\\omega$ suppresses low frequencies and lifts high ones.'}]}
  ]}
]},

{ id:'m5-props-scale', module:'M5', nav:'Properties · time scaling', title:'Time scaling, with the flip counted once', src:'p. 53',
  objective:'Prove the scaling property for both signs of a without double-counting the reversal.',
  keywords:'time scaling 1/|a| reversal limits substitution sign bookkeeping proof', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 53'},
  {t:'title', text:'One substitution, and one careful look at the limits'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', key:true, size:'lg', tex:'x(at)\\;\\longleftrightarrow\\;\\frac{1}{|a|}X\\!\\left(j\\frac{\\omega}{a}\\right),\\qquad a\\neq0',
      label:'Time scaling',
      note:'The modulus is on $a$ in the coefficient and not in the argument. Both details matter, and both come out of the proof below.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Substitute $\\tau=at$, so $t=\\tau/a$ and $\\d t=\\d\\tau/a$. For $a>0$ the limits keep their order and the coefficient is $1/a$, which is $1/|a|$.'},
      {t:'eq', size:'sm', tex:'\\int_{-\\infty}^{\\infty}x(at)e^{-j\\omega t}\\,\\d t=\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{a}X\\!\\left(j\\frac{\\omega}{a}\\right)'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'For $a<0$ the same substitution sends $t\\to-\\infty$ to $\\tau\\to+\\infty$, so the limits arrive <b>reversed</b>. Swapping them back costs one minus sign, and that minus sign is the only one in the calculation:'},
      {t:'eq', size:'sm', tex:'\\frac{1}{a}\\int_{+\\infty}^{-\\infty}x(\\tau)e^{-j(\\omega/a)\\tau}\\,\\d\\tau=-\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{|a|}X\\!\\left(j\\frac{\\omega}{a}\\right)',
        note:'For $a<0$, $-1/a=1/|a|$, so the swap and the negative $a$ combine into the modulus. Nothing else is left over.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Counting the flip twice', html:'Writing the reversed limits <b>and</b> an explicit $-1$ in front applies the same correction two times. The result is $-\\dfrac{1}{|a|}X(j\\omega/a)$, which contradicts the boxed property and would make the transform of $x(-t)$ the negative of the right answer. Do the flip once: either reverse the limits, or write the minus, never both.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The reversal is the case $a=-1$', html:'Putting $a=-1$ gives $x(-t)\\leftrightarrow X(-j\\omega)$, with coefficient $1$. Combined with the conjugation rule, that is why the spectrum of a real signal is determined by its positive-frequency half.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-4,4],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(t,1),{color:C.in,n:3000}); return a.svg(); },
        caption:'$a=1$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-13,13],yr:[-0.75,2.4],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(w=>rectFT(w,1),{color:C.in,n:2400}); return a.svg(); },
        caption:'Peak $2$, first null $\\pi$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-4,4],yr:[-0.25,1.35],xlabel:'t',ylabel:'x(2t)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(2*t,1),{color:C.out,n:3000}); return a.svg(); },
        caption:'$a=2$: half as wide.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-13,13],yr:[-0.38,1.2],xlabel:'\\omega',ylabel:'0.5X(j\\omega/2)',pad:{l:58,r:18,t:32,b:34},xtarget:5,ytarget:3,yticksOverride:[0,0.5,1]});
        a.curve(w=>0.5*rectFT(w/2,1),{color:C.out,n:2400}); return a.svg(); },
        caption:'Half the height, twice the width.'}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'small', html:'The area under the transform is what stays fixed: halving the height while doubling the width leaves $\\int X\\,\\d\\omega$ alone, and by the synthesis equation that integral is $2\\pi x(0)$, which the scaling did not change.'}]}
  ]}
]},

{ id:'m5-props-scale-ex', module:'M5', nav:'Worked example · scaling a band', title:'Worked example — stretching and compressing one signal', src:'p. 53',
  objective:'Apply the scaling property in both directions and check heights and widths.',
  keywords:'worked example scaling band height width area invariant 2 and 0.5', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 53'},
  {t:'title', text:'Three spectra of the same signal'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','A signal $x(t)$ whose transform is $X(j\\omega)=1$ on $|\\omega|<2\\pi$ and $0$ elsewhere.'],
      ['Find','The transforms of $x(0.5t)$ and $x(2t)$.'],
      ['Method','Apply $x(at)\\leftrightarrow\\frac{1}{|a|}X(j\\omega/a)$ once for each value of $a$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'x(0.5t)\\;\\longleftrightarrow\\;2X(j2\\omega)=2\\ \\text{on}\\ |\\omega|<\\pi',
        label:'Stretched in time, $a=0.5$',
        note:'$1/|a|=2$ raises the height to 2. The argument $j\\omega/a=j2\\omega$ means the band edge moves in: $|2\\omega|<2\\pi$ is $|\\omega|<\\pi$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'x(2t)\\;\\longleftrightarrow\\;0.5\\,X(j\\omega/2)=0.5\\ \\text{on}\\ |\\omega|<4\\pi',
        label:'Compressed in time, $a=2$',
        note:'$1/|a|=0.5$ lowers the height. The band edge moves out to $4\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check','The three areas are $2\\times2\\pi$, $1\\times4\\pi$ and $0.5\\times8\\pi$, all equal to $4\\pi$. Since $\\int X\\,\\d\\omega=2\\pi x(0)$, the value of every one of the three signals at $t=0$ is the same, which is what stretching and compressing in time cannot change.'],
        ['Reading','Stretching in time gives a taller, narrower spectrum. Compressing gives a shorter, wider one. Neither operation invents or destroys area.'],
        ['A common slip','Applying the factor $1/|a|$ to the argument as well, or moving the band the wrong way. The area check catches both in one line.']
      ]}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-16,16],yr:[-0.55,2.55],xlabel:'\\omega',ylabel:'2X(j2\\omega)',pad:{l:58,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.area(w=>Math.abs(w)<PI?2:0,-16,16,{color:'rgba(20,112,127,.14)'});
        a.curve(w=>Math.abs(w)<PI?2:0,{color:C.in,n:3000}); return a.svg(); },
        caption:'$a=0.5$: height 2 on $|\\omega|<\\pi$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-16,16],yr:[-0.55,2.55],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        a.area(w=>Math.abs(w)<2*PI?1:0,-16,16,{color:'rgba(106,90,146,.14)'});
        a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.mid,n:3000}); return a.svg(); },
        caption:'$a=1$: height 1 on $|\\omega|<2\\pi$.'}],
      [{t:'reveal', at:2, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-16,16],yr:[-0.55,2.55],xlabel:'\\omega',ylabel:'0.5X(j\\omega/2)',pad:{l:62,r:26,t:32,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1,2]});
        a.area(w=>Math.abs(w)<4*PI?0.5:0,-16,16,{color:'rgba(74,122,70,.14)'});
        a.curve(w=>Math.abs(w)<4*PI?0.5:0,{color:C.out,n:3000}); return a.svg(); },
        caption:'$a=2$: height $0.5$ on $|\\omega|<4\\pi$. All three shaded areas are $4\\pi$.'}]}]
    ]}
  ]}
]},

{ id:'m5-duality', module:'M5', nav:'Duality', title:'Duality — the two domains have almost the same rules', src:'p. 54',
  objective:'State and prove duality with the correct argument on the right-hand side.',
  keywords:'duality X(t) 2 pi x(-w) proof renaming variables symmetry of the pair', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 54'},
  {t:'title', text:'Every pair comes with a second pair, free'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The two equations of the pair differ only by a sign and a factor. That near-symmetry means any transform pair can be read a second time with the roles of the domains exchanged.'},
    {t:'eq', key:true, size:'lg', tex:'\\text{if}\\quad x(t)\\;\\longleftrightarrow\\;X(j\\omega)\\qquad\\text{then}\\qquad X(t)\\;\\longleftrightarrow\\;2\\pi\\,x(-\\omega)',
      label:'Duality',
      note:'On the right the argument is $-\\omega$, a real number. It is not $-j\\omega$: the letter $x$ names a signal, and a signal takes a real argument. The $j$ belongs to the frequency-domain function only.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Proof. Write the synthesis equation and rename its variables. First swap the names $t$ and $\\omega$ throughout:'},
      {t:'eq', size:'sm', tex:'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)e^{j\\omega t}\\,\\d\\omega\\quad\\Longrightarrow\\quad 2\\pi\\,x(\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{j\\omega t}\\,\\d t'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Now replace $\\omega$ by $-\\omega$, which turns the exponent into the analysis exponent $e^{-j\\omega t}$:'},
      {t:'eq', size:'sm', tex:'2\\pi\\,x(-\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{-j\\omega t}\\,\\d t=\\mathcal{F}\\{X(t)\\}',
        note:'The right-hand side is the analysis equation applied to the function $X$, now read as a function of time. That is the statement.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What duality is for', html:'It halves the work. Every pair already derived gives a second one for nothing, and the two rectangle–sinc examples of this module are one pair seen twice. It also carries properties across: the time-shift rule becomes the frequency-shift rule under duality, and differentiation in time becomes differentiation in frequency.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:830,h:250,items:[
      {t:'box',x:60,y:34,w:200,h:62,label:'x(t)',tex:true,fs:19,color:'#14707F'},
      {t:'box',x:570,y:34,w:200,h:62,label:'X(j\\omega)',tex:true,fs:19,color:'#6A5A92'},
      {t:'arrow',x1:260,y1:60,x2:570,y2:60,label:'\\mathcal{F}',tex:true,color:'#BE5539'},
      {t:'box',x:60,y:152,w:200,h:62,label:'X(t)',tex:true,fs:19,color:'#6A5A92'},
      {t:'box',x:570,y:152,w:200,h:62,label:'2\\pi x(-\\omega)',tex:true,fs:19,color:'#14707F'},
      {t:'arrow',x1:260,y1:178,x2:570,y2:178,label:'\\mathcal{F}',tex:true,color:'#BE5539'},
      {t:'line',d:'M160,96 L160,152',color:'#4A657F'},
      {t:'line',d:'M670,96 L670,152',color:'#4A657F'},
      {t:'text',x:250,y:130,anchor:'start',label:'\\text{read as a signal}',tex:true,fs:12,color:'#4A657F'},
      {t:'text',x:580,y:130,anchor:'end',label:'\\text{reversed, times }2\\pi',tex:true,fs:12,color:'#4A657F'}
    ]}), caption:'The second row is free once the first has been computed.'},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Time shift','$x(t-t_0)\\leftrightarrow e^{-j\\omega t_0}X(j\\omega)$ becomes the frequency shift under duality.'],
        ['Even signals','If $x$ is even then $x(-\\omega)=x(\\omega)$ and the reversal disappears, which is why the rectangle and the sinc are such clean examples.']
      ]}]}
  ]}
]},

{ id:'m5-duality-ex', module:'M5', nav:'Worked example · duality', title:'Worked example — the same answer by two routes', src:'pp. 54–55',
  objective:'Use duality on the rectangular pulse and confirm the result independently.',
  keywords:'worked example duality rectangle sinc both ways 2 pi band check', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'pp. 54–55'},
  {t:'title', text:'Duality first, then the integral as a check'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x_1(t)=1$ on $|t|<W$, so that $X_1(j\\omega)=\\dfrac{2\\sin(W\\omega)}{\\omega}$.'],
      ['Find','The transform of $x_2(t)=\\dfrac{2\\sin(Wt)}{t}$.'],
      ['Method','Recognise $x_2$ as $X_1$ read in time, then apply duality. Confirm the answer by evaluating the analysis integral directly.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'X_2(j\\omega)=2\\pi\\,x_1(-\\omega)=\\begin{cases}2\\pi,&|\\omega|<W\\\\0,&|\\omega|>W\\end{cases}',
        label:'Route 1 — duality',
        note:'$x_1$ is even, so $x_1(-\\omega)=x_1(\\omega)$ and the reversal changes nothing here. The whole answer is one line.'}]},
    {t:'reveal', at:2, items:[
      {t:'body', html:'Route 2 works backwards from the answer. Take the band of height $2\\pi$ on $|\\omega|<W$ and put it through the synthesis equation:'},
      {t:'eq', size:'sm', tex:'\\frac{1}{2\\pi}\\int_{-W}^{W}2\\pi\\,e^{j\\omega t}\\,\\d\\omega=\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{2\\sin(Wt)}{t}',
        note:'The signal that comes back is $x_2$, so the pair is confirmed without using duality at all.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check at the origin','$X_2(j0)=2\\pi=6.283185$ for any $W$, and the same number is the height of the band. In time, $x_2(0)=2W$ by l’Hôpital, which for $W=\\pi$ is $2\\pi$ as well.'],
        ['Why two routes','They use different equations, so an error in one does not repeat in the other. Agreement between them is a real check; repeating the same calculation twice is not.'],
        ['The sinc convention','Written with the convention of this module, $x_2(t)=2W\\operatorname{sinc}(Wt)$ with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.']
      ]}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-6,6],yr:[-0.25,1.35],xlabel:'t',ylabel:'x_1(t)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(t=>rectp(t,PI),{color:C.in,n:3000}); return a.svg(); },
        caption:'$x_1$, with $W=\\pi$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-7,7],yr:[-2.5,7.6],xlabel:'\\omega',ylabel:'X_1(j\\omega)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,3.14,6.28],ytickfmt:v=>v.toFixed(2)});
        a.curve(w=>2*Math.sin(PI*w)/(Math.abs(w)<1e-9?1e-9:w),{color:C.in,n:2400}); a.point(0,2*PI,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$X_1$, peak $2\\pi$.'}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-7,7],yr:[-2.5,7.6],xlabel:'t',ylabel:'x_2(t)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,3.14,6.28],ytickfmt:v=>v.toFixed(2)});
          a.curve(t=>2*Math.sin(PI*t)/(Math.abs(t)<1e-9?1e-9:t),{color:C.mid,n:2400}); a.point(0,2*PI,{color:C.coral,r:3.6}); return a.svg(); },
          caption:'$x_2$: the same shape, now in time.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-6,6],yr:[-1.5,7.9],xlabel:'\\omega',ylabel:'X_2(j\\omega)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,3.14,6.28],ytickfmt:v=>v.toFixed(2)});
          a.area(w=>Math.abs(w)<PI?2*PI:0,-6,6,{color:'rgba(74,122,70,.14)'});
          a.curve(w=>Math.abs(w)<PI?2*PI:0,{color:C.out,n:3000}); return a.svg(); },
          caption:'Its transform: a band of height $6.2832$ on $|\\omega|<\\pi$.'}]
      ]}]}
  ]}
]},

{ id:'m5-parseval', module:'M5', nav:'Parseval', title:'Parseval — energy counted in either domain', src:'p. 55',
  objective:'Prove Parseval and fix the normalisation the energy is measured under.',
  keywords:'parseval energy spectral density R = 1 ohm normalised proof exchange of integrals', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 55'},
  {t:'title', text:'The same energy, added up two ways'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'The normalisation, stated once', html:'Energy and power in this course are <b>normalised</b>: every signal is treated as a voltage across a $1\\,\\Omega$ resistor, so the instantaneous power is $|x(t)|^{2}$ and the energy is its integral. Every number below is in joules under that convention.'},
    {t:'eq', key:true, size:'lg', tex:'E_{\\infty}=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega',
      label:'Parseval’s relation',
      note:'The $1/2\\pi$ is on the frequency side, exactly as it is in the synthesis equation.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Proof. Write $|x|^{2}=x\\,x^{*}$ and replace $x^{*}(t)$ by the conjugate of the synthesis equation, then exchange the order of the two integrals:'},
      {t:'eq', size:'sm', tex:'\\int|x(t)|^{2}\\d t=\\int x(t)\\left[\\frac{1}{2\\pi}\\int X^{*}(j\\omega)e^{-j\\omega t}\\d\\omega\\right]\\d t=\\frac{1}{2\\pi}\\int X^{*}(j\\omega)\\left[\\int x(t)e^{-j\\omega t}\\d t\\right]\\d\\omega',
        note:'The inner integral on the right is $X(j\\omega)$, so the whole expression is $\\frac{1}{2\\pi}\\int X^{*}X\\,\\d\\omega$, which is $\\frac{1}{2\\pi}\\int|X|^{2}\\d\\omega$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'The step that is actually used', html:'The proof needs $|x(t)|^{2}=x(t)x^{*}(t)$, and for a real signal that is $x^{2}(t)$. It does <b>not</b> need $|x(t)|=x(t)$, which is a stronger claim: it fails at every instant where a real signal is negative. Use the squared form and the question never arises.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Energy spectral density', html:'$|X(j\\omega)|^{2}$ says how the energy is distributed over frequency, and $\\frac{1}{2\\pi}|X(j\\omega)|^{2}\\d\\omega$ is the energy in a narrow band. That reading is what makes Parseval useful: it turns a question about a filter into an area under a curve.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-1,7],yr:[-0.2,1.25],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3});
        a.area(t=>t<0?0:Math.exp(-t),0,7,{color:'rgba(20,112,127,.13)'});
        a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,n:2400}); return a.svg(); },
        caption:'$x(t)=e^{-at}u(t)$ with $a=1$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:200,xr:[-8,8],yr:[-0.2,1.25],xlabel:'\\omega',ylabel:'|X(j\\omega)|^{2}',pad:{l:58,r:18,t:32,b:34},xtarget:5,ytarget:3});
        a.area(w=>1/(1+w*w),-8,8,{color:'rgba(106,90,146,.13)'});
        a.curve(w=>1/(1+w*w),{color:C.mid,n:2400}); return a.svg(); },
        caption:'Its energy spectral density.'}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Time domain','$E_{\\infty}=\\displaystyle\\int_{0}^{\\infty}e^{-2at}\\,\\d t=\\frac{1}{2a}$.'],
        ['Frequency domain','$E_{\\infty}=\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{a^{2}+\\omega^{2}}=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{a}=\\frac{1}{2a}$, using $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{\\d u}{1+u^{2}}=\\pi$ after $u=\\omega/a$.'],
        ['Agreement','Both give $1/(2a)$, which for $a=1$ is $0.5$ J. Without the $1/2\\pi$ the second route would report $2\\pi$ times too much.']
      ]}]}
  ]}
]},

{ id:'m5-parseval-ex', module:'M5', nav:'Worked example · Parseval', title:'Worked example — energy from a two-band spectrum', src:'p. 55',
  objective:'Compute an energy in the frequency domain and confirm it in the time domain.',
  keywords:'worked example parseval two bands energy 10 joules both routes peak 6', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 55'},
  {t:'title', text:'When the frequency domain is the easy one'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$X_3(j\\omega)=2$ for $|\\omega|<2\\pi$, $1$ for $2\\pi<|\\omega|<4\\pi$, and $0$ beyond $4\\pi$.'],
      ['Find','The total energy of $x_3$, under the $R=1\\,\\Omega$ normalisation.'],
      ['Method','Parseval. The spectrum is piecewise constant, so the integral is a sum of rectangles.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'E_{\\infty}=\\frac{1}{2\\pi}\\int_{-4\\pi}^{4\\pi}|X_3|^{2}\\,\\d\\omega=\\frac{1}{2\\pi}\\Bigl[\\underbrace{1\\cdot2\\pi}_{-4\\pi<\\omega<-2\\pi}+\\underbrace{4\\cdot4\\pi}_{|\\omega|<2\\pi}+\\underbrace{1\\cdot2\\pi}_{2\\pi<\\omega<4\\pi}\\Bigr]'},
      {t:'eq', key:true, size:'lg', tex:'E_{\\infty}=\\frac{1}{2\\pi}\\bigl[2\\pi+16\\pi+2\\pi\\bigr]=\\frac{20\\pi}{2\\pi}=10\\ \\text{J}',
        label:'Solution'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Square the height, not the width', html:'The inner band contributes $2^{2}=4$ over a width of $4\\pi$, giving $16\\pi$. The two outer bands contribute $1^{2}=1$ over $2\\pi$ each. Using the heights unsquared gives $\\frac{1}{2\\pi}[2\\cdot4\\pi+1\\cdot4\\pi]=6$, which is not the energy but the value $x_3(0)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Time-domain route','Synthesis gives $x_3(t)=\\dfrac{\\sin(2\\pi t)+\\sin(4\\pi t)}{\\pi t}$, and integrating $x_3^{2}(t)$ over all time returns $10$ J as well.'],
        ['Which route to take','The frequency route was three rectangles; the time route needed the inverse transform and an integral of a squared sinc sum. The point of Parseval is that either is allowed and one of them is usually much shorter.'],
        ['Peak check','$x_3(0)=\\frac{1}{2\\pi}\\int X_3\\,\\d\\omega=\\frac{1}{2\\pi}[8\\pi+4\\pi]=6$, which is the peak drawn below.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-16,16],yr:[-0.55,2.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_3(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
      const f=w=>Math.abs(w)<2*PI?2:(Math.abs(w)<4*PI?1:0);
      a.area(f,-16,16,{color:'rgba(106,90,146,.14)'});
      a.curve(f,{color:C.mid,n:4000});
      return a.svg(); },
      caption:'The spectrum. Energy is the area under the <b>square</b> of this, divided by $2\\pi$.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-16,16],yr:[-1.1,5.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X_3(j\\omega)|^{2}',pad:{l:60,r:26,t:34,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,4]});
        const g=w=>Math.abs(w)<2*PI?4:(Math.abs(w)<4*PI?1:0);
        a.area(g,-16,16,{color:'rgba(190,85,57,.14)'});
        a.curve(g,{color:C.coral,n:4000});
        return a.svg(); },
        caption:'The squared spectrum. Its area is $20\\pi$, and dividing by $2\\pi$ gives $10$ J.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:190,xr:[-2.4,2.4],yr:[-2.6,7.2],xlabel:'t',ylabel:'x_3(t)',pad:{l:54,r:26,t:32,b:34},xtarget:7,ytarget:3,yticksOverride:[-2,0,2,4,6]});
        a.curve(t=>{ const z=Math.abs(t)<1e-9?1e-9:t; return (Math.sin(2*PI*z)+Math.sin(4*PI*z))/(PI*z); },{color:C.in,n:3000});
        a.point(0,6,{color:C.coral,r:4.2});
        return a.svg(); },
        caption:'The signal itself, with its peak $x_3(0)=6$ marked and a tick placed at that value.'}]}
  ]}
]}
,

{ id:'m5-conv', module:'M5', nav:'Convolution property', title:'Convolution in time is multiplication in frequency', src:'p. 56',
  objective:'State and prove the convolution property with one consistent set of symbols.',
  keywords:'convolution property multiplication frequency response LTI proof premise symbols', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 56'},
  {t:'title', text:'The property the whole course was heading for'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'The premise, written out', html:'Let $x(t)\\leftrightarrow X(j\\omega)$ be the input and $h(t)\\leftrightarrow H(j\\omega)$ the impulse response of an LTI system. Both pairs are declared before the property is stated, and the output is given its own letter.'},
    {t:'eq', key:true, size:'lg', tex:'y(t)=x(t)*h(t)\\;\\longleftrightarrow\\;Y(j\\omega)=X(j\\omega)\\,H(j\\omega)',
      label:'Convolution property',
      note:'{{sym:Hjw|$H(j\\omega)$}} is the frequency response of the system, exactly the object Module 4 defined for periodic inputs. It now works for every input with a transform.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Proof. Write the convolution inside the analysis integral and exchange the order:'},
      {t:'eq', size:'sm', tex:'Y(j\\omega)=\\int\\!\\!\\left[\\int x(\\tau)h(t-\\tau)\\,\\d\\tau\\right]e^{-j\\omega t}\\d t=\\int x(\\tau)\\left[\\int h(t-\\tau)e^{-j\\omega t}\\d t\\right]\\d\\tau'},
      {t:'eq', size:'sm', tex:'=\\int x(\\tau)\\,e^{-j\\omega\\tau}H(j\\omega)\\,\\d\\tau=H(j\\omega)\\int x(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau=X(j\\omega)H(j\\omega)',
        note:'The inner bracket is the time-shift property applied to $h$. $H(j\\omega)$ does not depend on $\\tau$, so it leaves the outer integral.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Keep the letters apart', html:'Three signals are in play and each needs its own name: the input $x$, the impulse response $h$, the output $y$. Using $y$ both as a free second signal in the premise and as the output in the conclusion makes the statement say something about itself. One statement, one set of symbols.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'What this replaces', html:'Module 3 computed an output by flipping, sliding and integrating, one value of $t$ at a time. This does it with one product. The cost is two transforms and one inverse transform, and the gain is that the system is described by a single curve.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:830,h:250,items:[
      {t:'arrow',x1:70,y1:60,x2:300,y2:60},
      {t:'box',x:300,y:32,w:210,h:58,label:'h(t)',tex:true,fs:18,color:'#C08422'},
      {t:'arrow',x1:510,y1:60,x2:760,y2:60},
      {t:'text',x:185,y:44,label:'x(t)',tex:true,fs:16,color:'#14707F'},
      {t:'text',x:635,y:44,label:'y(t)=x(t)*h(t)',tex:true,fs:16,color:'#4A7A46'},
      {t:'arrow',x1:70,y1:180,x2:300,y2:180},
      {t:'box',x:300,y:152,w:210,h:58,label:'H(j\\omega)',tex:true,fs:18,color:'#C08422'},
      {t:'arrow',x1:510,y1:180,x2:760,y2:180},
      {t:'text',x:185,y:164,label:'X(j\\omega)',tex:true,fs:16,color:'#14707F'},
      {t:'text',x:635,y:164,label:'Y=XH',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:415,y:122,label:'\\text{the same system, seen twice}',tex:true,fs:13,color:'#4A657F'}
    ]}), caption:'One diagram in time, the same diagram in frequency. Only the operation between the boxes changed.'},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Where $H$ comes from','$H(j\\omega)=\\int h(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau$ — the transform of the impulse response, and nothing new.'],
        ['When it exists','When $h$ is absolutely integrable, which for an LTI system is exactly the condition for bounded-input bounded-output stability.']
      ]}]}
  ]}
]},

{ id:'m5-conv-ex', module:'M5', nav:'Worked example · two exponentials', title:'Worked example — an exponential input to an exponential system', src:'p. 57',
  objective:'Solve an LTI problem by transform and partial fractions, and check the peak.',
  keywords:'worked example LTI two exponentials partial fractions cover-up peak log 2 quarter', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 57'},
  {t:'title', text:'Multiply, split, and read the answer off a table'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=e^{-at}u(t)$ and $h(t)=e^{-bt}u(t)$, with $a>0$, $b>0$ and $a\\neq b$.'],
      ['Find','$y(t)=x(t)*h(t)$.'],
      ['Method','Transform both, multiply, split the product into simple fractions, and invert term by term.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Y(j\\omega)=\\frac{1}{a+j\\omega}\\cdot\\frac{1}{b+j\\omega}=\\frac{A}{a+j\\omega}+\\frac{B}{b+j\\omega}'},
      {t:'note', kind:'def', head:'The cover-up rule, for simple poles only', html:'Write $s=j\\omega$ for the moment. To find the coefficient over $(s+a)$, multiply the whole fraction by $(s+a)$, cancel, and evaluate at $s=-a$. Here that gives $A=\\dfrac{1}{b-a}$, and by the same step $B=\\dfrac{1}{a-b}=-A$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'y(t)=\\frac{e^{-at}-e^{-bt}}{b-a}\\,u(t)',
        label:'Solution',
        note:'Each term was inverted with the pair $e^{-ct}u(t)\\leftrightarrow1/(c+j\\omega)$ established earlier in this module.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check at the origin','$y(0)=0$. A convolution of two causal signals must start at zero, because there is no overlap yet at $t=0$.'],
        ['Check the peak','For $a=1$, $b=2$: $y(t)=e^{-t}-e^{-2t}$, whose derivative vanishes at $t=\\ln2=0.693147$, where $y=\\tfrac12-\\tfrac14=\\tfrac14$ exactly.'],
        ['Check the DC values','$|X(j0)|=1/a=1$, $|H(j0)|=1/b=0.5$, and $|Y(j0)|=1/(ab)=0.5$. The product of the first two is the third, which is the property itself at one frequency.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'The same answer by convolution', html:'Doing it in the time domain means $\\int_{0}^{t}e^{-a\\tau}e^{-b(t-\\tau)}\\d\\tau$, which returns the same expression. The transform route replaced that integral with one multiplication and one lookup.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-0.5,6],yr:[-0.2,1.25],xlabel:'t',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3});
        a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,n:2000});
        a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.h,n:2000});
        a.note(5.7,0.98,'x',{anchor:'end',color:C.in,fs:14,tex:true});
        a.note(5.7,0.52,'h',{anchor:'end',color:C.h,fs:14,tex:true});
        return a.svg(); },
        caption:'Input and impulse response, $a=1$, $b=2$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-0.5,6],yr:[-0.06,0.32],xlabel:'t',ylabel:'y(t)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,0.1,0.25]});
        a.curve(t=>t<0?0:Math.exp(-t)-Math.exp(-2*t),{color:C.out,n:2000});
        a.point(Math.log(2),0.25,{color:C.coral,r:4.2});
        return a.svg(); },
        caption:'The output, with the peak $0.25$ at $t=0.6931$.'}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:200,xr:[-6,6],yr:[-0.15,1.25],xlabel:'\\omega\\;[\\text{rad/s}]',pad:{l:54,r:26,t:32,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1]});
        a.curve(w=>1/Math.hypot(1,w),{color:C.in,n:1600});
        a.curve(w=>1/Math.hypot(2,w),{color:C.h,n:1600});
        a.curve(w=>1/(Math.hypot(1,w)*Math.hypot(2,w)),{color:C.out,n:1600});
        return a.svg(); },
        caption:'The three magnitudes: cyan $|X|$, amber $|H|$, green $|Y|$. At every frequency the third curve is the product of the first two, and at $\\omega=0$ that reads $1\\times0.5=0.5$.'}]}
  ]}
]},

{ id:'m5-conv-lpf', module:'M5', nav:'Worked example · filters in cascade', title:'Worked example — two ideal low-pass filters in cascade', src:'p. 58',
  objective:'Multiply two ideal bands and read the three time-domain peaks.',
  keywords:'worked example ideal low pass cascade narrower band wins peaks 8 6 12', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 58'},
  {t:'title', text:'The narrower band decides the output'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','An input with $X(j\\omega)=2$ on $|\\omega|\\le4\\pi$ and zero beyond, into an ideal low-pass system with $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$ and zero beyond.'],
      ['Find','$Y(j\\omega)$ and $y(t)$, and the peak of each of the three signals.'],
      ['Method','Multiply the two spectra frequency by frequency, then invert.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'Y(j\\omega)=X(j\\omega)H(j\\omega)=\\begin{cases}6,&|\\omega|\\le2\\pi\\\\0,&|\\omega|>2\\pi\\end{cases}',
        label:'Solution, frequency domain',
        note:'Outside $2\\pi$ the system contributes a zero, so the product is zero however large $X$ is there. Inside, the product is $2\\times3=6$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'y(t)=\\frac{6\\sin(2\\pi t)}{\\pi t}',
        label:'Solution, time domain',
        note:'Inverting a band of height $A$ on $|\\omega|<W$ gives $A\\sin(Wt)/(\\pi t)$, from the ideal low-pass pair derived earlier.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Peaks','$x(0)=2\\cdot\\dfrac{2\\cdot4\\pi}{2\\pi}=8$, $h(0)=6$ and $y(0)=12$. Each one is the area of its own band divided by $2\\pi$.'],
        ['Why the output peak is the largest','The output band is shorter than the input band but taller, and the peak counts area, not height. $6\\times4\\pi$ beats $2\\times8\\pi$.'],
        ['A question worth asking','What does this cascade do to a signal that was already inside $|\\omega|\\le2\\pi$? Nothing but a gain of 6. Ideal filters do not remove what is not there.']
      ]}]}
  ], right:[
    {t:'grid', cols:1, gap:'8px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:150,xr:[-18,18],yr:[-1.1,7.2],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,2,6]});
        a.curve(w=>Math.abs(w)<=4*PI?2:0,{color:C.in,n:3000}); return a.svg(); },
        caption:'Input: height 2 out to $4\\pi$.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:150,xr:[-18,18],yr:[-1.1,7.2],xlabel:'\\omega',ylabel:'H(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,3,6]});
        a.curve(w=>Math.abs(w)<=2*PI?3:0,{color:C.h,n:3000}); return a.svg(); },
        caption:'System: height 3 out to $2\\pi$.'}],
      [{t:'reveal', at:1, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:150,xr:[-18,18],yr:[-1.1,7.2],xlabel:'\\omega',ylabel:'Y(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,3,6]});
        a.curve(w=>Math.abs(w)<=2*PI?6:0,{color:C.out,n:3000}); return a.svg(); },
        caption:'Output: height 6, and only out to $2\\pi$.'}]}],
      [{t:'reveal', at:2, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-2.4,2.4],yr:[-4.6,14],xlabel:'t',pad:{l:54,r:26,t:30,b:34},xtarget:7,ytarget:4,yticksOverride:[0,8,12]});
        a.curve(t=>2*lpfTime(t,4*PI),{color:C.in,n:2400,width:1.6});
        a.curve(t=>6*lpfTime(t,2*PI),{color:C.out,n:2400,width:2.2});
        a.point(0,8,{color:C.coral,r:4}); a.point(0,12,{color:C.coral,r:4});
        return a.svg(); },
        caption:'The input and the output in time, with ticks at their peaks $8$ and $12$.'}]}]
    ]}
  ]}
]},

{ id:'m5-mult', module:'M5', nav:'Multiplication property', title:'Multiplication in time is convolution in frequency', src:'p. 58',
  objective:'State the dual of the convolution property and place its 1/2π.',
  keywords:'multiplication property convolution in frequency 1/2 pi duality windowing', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Properties', src:'p. 58'},
  {t:'title', text:'The same statement, read through duality'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Convolution in one domain is multiplication in the other. Duality says the reverse must also hold, and it fixes the factor that comes with it.'},
    {t:'eq', key:true, size:'lg', tex:'z(t)=x(t)\\,y(t)\\;\\longleftrightarrow\\;Z(j\\omega)=\\frac{1}{2\\pi}\\,X(j\\omega)*Y(j\\omega)',
      label:'Multiplication property',
      note:'The convolution on the right is over frequency: $\\displaystyle X*Y=\\int_{-\\infty}^{\\infty}X(j\\theta)Y\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'The $1/2\\pi$ belongs to this one and not to the other', html:'Convolution in time carries no factor; convolution in frequency carries $1/2\\pi$. Copying the convolution property without the factor makes every product of two signals come out $2\\pi$ times too large, and the error is invisible in the shape of the answer — only the height is wrong.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Why this property matters', html:'Every real measurement multiplies a signal by something: a switch that turns it on for a finite time, a carrier that moves it to a usable frequency, a window applied before analysis. Each of those is a multiplication in time, and this property says what each does to the spectrum.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['One consequence, immediately','Multiplying by an impulse in frequency shifts the spectrum, because convolving with $\\delta(\\omega-\\omega_0)$ moves whatever it meets to $\\omega_0$.'],
        ['The next three scenes','A cosine has two impulses, so multiplying by a cosine makes two copies. That is amplitude modulation, and it is where the property earns its place.'],
        ['Bandwidth','Convolving two spectra of widths $B_1$ and $B_2$ gives one of width $B_1+B_2$. A product in time is always at least as wide in frequency as either factor.']
      ]}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-10,10],yr:[-0.25,1.35],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,n:3000}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-10,10],yr:[-0.25,1.35],xlabel:'\\omega',ylabel:'Y(j\\omega)',pad:{l:56,r:18,t:30,b:34},xtarget:5,ytarget:2,yticksOverride:[0,1]});
        a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.h,n:3000}); return a.svg(); }}]
    ]},
    {t:'small', html:'Two spectra, each a band of half-width $2\\pi$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:210,xr:[-16,16],yr:[-0.55,2.55],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Z(j\\omega)',pad:{l:56,r:26,t:32,b:36},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        const tri=w=>Math.abs(w)<4*PI ? 2*(1-Math.abs(w)/(4*PI)) : 0;
        a.area(tri,-16,16,{color:'rgba(74,122,70,.14)'});
        a.curve(tri,{color:C.out,width:2.4,n:2400});
        a.point(0,2,{color:C.coral,r:4.2});
        return a.svg(); },
        caption:'Their convolution, divided by $2\\pi$: a triangle of apex 2 on $|\\omega|\\le4\\pi$. Two bands of half-width $2\\pi$ produced one of half-width $4\\pi$.'}]}
  ]}
]},

{ id:'m5-am', module:'M5', nav:'Amplitude modulation', title:'Amplitude modulation — two copies, at half height', src:'p. 59',
  objective:'Derive the DSB-SC spectrum and name the two copies.',
  keywords:'amplitude modulation DSB-SC carrier sidebands two copies half height cosine', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Application', src:'p. 59'},
  {t:'title', text:'Multiplying by a carrier makes a copy on each side'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Multiply a signal by a cosine of frequency {{sym:wc|$\\omega_c$}}, the <b>carrier</b>. The cosine has two impulses, so the multiplication property convolves the signal spectrum with two impulses at once.'},
    {t:'eq', size:'sm', tex:'\\cos(\\omega_ct)\\;\\longleftrightarrow\\;\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'z(t)=x(t)\\cos(\\omega_ct)\\;\\longleftrightarrow\\;Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)',
        label:'Double-sideband suppressed-carrier modulation',
        note:'The $1/2\\pi$ of the property and the $\\pi$ of each impulse combine into the $\\tfrac12$ in front of each copy. Both copies carry it.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Two copies at half height, not one shifted spectrum', html:'The spectrum is not moved to $\\omega_c$. It is <b>duplicated</b>: one copy centred at $+\\omega_c$ and one at $-\\omega_c$, each at half the original height. A description that says "the signal moved up to the carrier" loses the negative-frequency copy and the factor of one half at the same time.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Given','$x(t)=\\cos(\\pi t)$, carrier $\\cos(4\\pi t)$.'],
        ['Route 1, product to sum','$\\cos(\\pi t)\\cos(4\\pi t)=\\tfrac12\\cos(5\\pi t)+\\tfrac12\\cos(3\\pi t)$, whose transform is $\\tfrac{\\pi}{2}$ at each of $\\pm3\\pi$ and $\\pm5\\pi$.'],
        ['Route 2, the property','$X$ has impulses of weight $\\pi$ at $\\pm\\pi$; each copy is halved and centred at $\\pm4\\pi$, giving weight $\\pi/2$ at $4\\pi\\pm\\pi$ and at $-4\\pi\\pm\\pi$. The same four positions.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Suppressed carrier', html:'Nothing sits at $\\omega_c=4\\pi$ itself. The four impulses are at $3\\pi$ and $5\\pi$ and their negatives — the <b>sidebands</b>. The name of the scheme records exactly that: both sidebands are transmitted and the carrier is not.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:190,xr:[-2.2,2.2],yr:[-1.35,1.5],xlabel:'t',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:3});
      a.curve(t=>Math.cos(PI*t),{color:C.in,width:1.5,dash:'5 5',n:2400});
      a.curve(t=>-Math.cos(PI*t),{color:C.in,width:1.5,dash:'5 5',n:2400});
      a.curve(t=>Math.cos(PI*t)*Math.cos(4*PI*t),{color:C.out,width:2.2,n:4000});
      return a.svg(); },
      caption:'The modulated signal in time. The dashed lines are $\\pm x(t)$, the envelope the carrier is filling in.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-20,20],yr:[-0.45,4.1],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1.57,3.14],ytickfmt:v=>v.toFixed(2)});
          a.impulse(PI,PI,{color:C.in,label:false}); a.impulse(-PI,PI,{color:C.in,label:false}); return a.svg(); },
          caption:'Before: two impulses of weight $\\pi=3.1416$.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-20,20],yr:[-0.45,4.1],xlabel:'\\omega',ylabel:'Z(j\\omega)',pad:{l:54,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1.57,3.14],ytickfmt:v=>v.toFixed(2)});
          [3*PI,5*PI,-3*PI,-5*PI].forEach(wv=>a.impulse(wv,PI/2,{color:C.out,label:false}));
          a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err});
          return a.svg(); },
          caption:'After: four impulses of weight $\\pi/2=1.5708$. The dashed lines mark $\\pm\\omega_c$, where nothing sits.'}]
      ]}]}
  ]}
]},

{ id:'m5-am-sinc', module:'M5', nav:'Modulating a band', title:'Modulating a band-limited signal', src:'p. 60',
  objective:'Move a sinc-shaped band to a carrier and read the band edges.',
  keywords:'modulation band limited sinc copies band edges 2 pi 6 pi half height', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Application', src:'p. 60'},
  {t:'title', text:'The copies keep their shape and their width'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, whose transform is $X(j\\omega)=1$ on $|\\omega|<2\\pi$ and zero beyond. The carrier is $\\cos(4\\pi t)$.'],
      ['Find','$Z(j\\omega)$ for $z(t)=x(t)\\cos(4\\pi t)$, with the edges of every band.'],
      ['Method','Two half-height copies of $X$, one centred at $+4\\pi$ and one at $-4\\pi$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-4\\pi)\\bigr)+\\tfrac12X\\bigl(j(\\omega+4\\pi)\\bigr)=0.5\\quad\\text{on}\\quad 2\\pi\\le|\\omega|\\le6\\pi',
        label:'Solution',
        note:'The upper copy occupies $4\\pi-2\\pi\\le\\omega\\le4\\pi+2\\pi$, that is $2\\pi$ to $6\\pi$. The lower copy is its mirror image.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Height','$0.5$, exactly half of the original $1$, in both copies.'],
        ['Width','Each copy is $4\\pi$ wide, the same as the original band. Modulation does not stretch anything.'],
        ['Total occupancy','The modulated signal occupies $8\\pi$ of the frequency axis, twice what the signal alone occupied, because there are now two copies.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Getting the signal back', html:'Multiply $z$ by the same carrier a second time. That makes two copies of each of the two copies: one pair lands back at the origin and adds up to $X/2$, and the other pair goes out to $\\pm8\\pi$. A low-pass filter keeping only $|\\omega|<2\\pi$ then recovers the signal, up to the factor $\\tfrac12$.'},
      {t:'note', kind:'warn', head:'This works only while the copies stay apart', html:'The recipe above assumes the copy at $+8\\pi$ does not reach down into the band being kept. The next scene is the case where it does.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-26,26],yr:[-0.28,1.4],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
        a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,n:4000});
        a.span(-2*PI,2*PI,1.14,'4\\pi',{color:C.coral,tex:true,fs:13});
        return a.svg(); },
        caption:'The signal band: height 1, half-width $2\\pi$.'}],
      [{t:'reveal', at:1, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:190,xr:[-26,26],yr:[-0.28,1.4],xlabel:'\\omega',ylabel:'Z(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
        const f=w=>((Math.abs(w-4*PI)<2*PI)?0.5:0)+((Math.abs(w+4*PI)<2*PI)?0.5:0);
        a.area(f,-26,26,{color:'rgba(74,122,70,.13)'});
        a.curve(f,{color:C.out,n:4000});
        a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err});
        return a.svg(); },
        caption:'Two copies at half height, on $2\\pi\\le|\\omega|\\le6\\pi$. The dashed lines are the carrier frequencies.'}]}],
      [{t:'reveal', at:3, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-1.6,1.6],yr:[-2.6,2.6],xlabel:'t',pad:{l:52,r:26,t:30,b:34},xtarget:7,ytarget:3});
        a.curve(t=>lpfTime(t,2*PI),{color:C.in,width:1.4,dash:'5 5',n:2400});
        a.curve(t=>-lpfTime(t,2*PI),{color:C.in,width:1.4,dash:'5 5',n:2400});
        a.curve(t=>lpfTime(t,2*PI)*Math.cos(4*PI*t),{color:C.out,width:2,n:6000});
        return a.svg(); },
        caption:'The same modulation in time: the carrier fills in an envelope of the signal’s own shape.'}]}]
    ]}
  ]}
]},

{ id:'m5-am-overlap', module:'M5', nav:'When the copies overlap', title:'Copies always appear; overlap is a separate event', src:'p. 60',
  objective:'Work the case where the two copies meet, and separate replication from overlap.',
  keywords:'overlap copies collide carrier too low baseband adds 0.5 plus 0.5 sampling preview', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Application', src:'p. 60'},
  {t:'title', text:'Bring the carrier down and the copies meet'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','A signal whose transform is $X_1(j\\omega)=1$ on $|\\omega|\\le\\pi$, already modulated once so that $X(j\\omega)=1$ on $\\pi\\le|\\omega|\\le3\\pi$. The carrier now is $\\cos(2\\pi t)$.'],
      ['Find','$Z(j\\omega)$ for $z(t)=x(t)\\cos(2\\pi t)$.'],
      ['Method','The same rule: two half-height copies, at $+2\\pi$ and at $-2\\pi$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-2\\pi)\\bigr)+\\tfrac12X\\bigl(j(\\omega+2\\pi)\\bigr)',
        note:'The $\\tfrac12$ multiplies <b>both</b> terms. Writing it on only one of them halves one copy and leaves the other at full height, which no shift can do.'},
      {t:'wex', rows:[
        ['Upper copy','$X$ occupies $\\pi\\le|\\omega|\\le3\\pi$, so shifting it up by $2\\pi$ puts material on $3\\pi\\le\\omega\\le5\\pi$ and on $-\\pi\\le\\omega\\le\\pi$.'],
        ['Lower copy','Shifting down by $2\\pi$ gives $-5\\pi\\le\\omega\\le-3\\pi$ and, again, $-\\pi\\le\\omega\\le\\pi$.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, tex:'Z(j\\omega)=\\tfrac12X_1\\bigl(j(\\omega+4\\pi)\\bigr)+X_1(j\\omega)+\\tfrac12X_1\\bigl(j(\\omega-4\\pi)\\bigr)',
        label:'Solution',
        note:'Around the origin the two copies land on the same stretch and <b>add</b>: $0.5+0.5=1$. Out at $\\pm4\\pi$ only one copy reaches, so the height there is $0.5$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Two different events', html:'<b>Copies appear</b> whenever a signal is multiplied by a carrier. That happens every time, at every carrier frequency, and it is harmless. <b>Copies overlap</b> only when the carrier is low enough for the shifted bands to reach each other. Overlap is what destroys information, because once two copies have been added there is no way to tell what each contributed.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'The rule of thumb, and where it returns', html:'The copies stay apart while $\\omega_c$ exceeds the highest frequency in the signal. Below that they meet. Module 7 asks the same question about the copies that sampling produces, and gives the condition its usual name.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'10px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:160,xr:[-20,20],yr:[-0.28,1.4],xlabel:'\\omega',ylabel:'X(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
        a.curve(w=>(Math.abs(w)>=PI&&Math.abs(w)<=3*PI)?1:0,{color:C.in,n:4000}); return a.svg(); },
        caption:'Before: a band on $\\pi\\le|\\omega|\\le3\\pi$.'}],
      [{t:'reveal', at:1, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-20,20],yr:[-0.28,1.4],xlabel:'\\omega',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
        const up=w=>((Math.abs(w-2*PI)>=PI&&Math.abs(w-2*PI)<=3*PI)?0.5:0);
        const dn=w=>((Math.abs(w+2*PI)>=PI&&Math.abs(w+2*PI)<=3*PI)?0.5:0);
        a.curve(up,{color:C.mid,n:4000,width:2});
        a.curve(dn,{color:C.h,n:4000,width:2,dash:'6 4'});
        return a.svg(); },
        caption:'The two half-height copies, drawn separately. They share the stretch $|\\omega|\\le\\pi$.'}]}],
      [{t:'reveal', at:2, items:[{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-20,20],yr:[-0.28,1.4],xlabel:'\\omega',ylabel:'Z(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
        const f=w=>((Math.abs(w-2*PI)>=PI&&Math.abs(w-2*PI)<=3*PI)?0.5:0)+((Math.abs(w+2*PI)>=PI&&Math.abs(w+2*PI)<=3*PI)?0.5:0);
        a.area(f,-20,20,{color:'rgba(74,122,70,.13)'});
        a.curve(f,{color:C.out,n:4000,width:2.4});
        a.span(-PI,PI,1.12,'\\text{they add here}',{color:C.err,tex:true,fs:13});
        return a.svg(); },
        caption:'The sum. Height 1 on $|\\omega|\\le\\pi$, where both copies arrived, and $0.5$ on $3\\pi\\le|\\omega|\\le5\\pi$, where only one did.'}]}]
    ]}
  ]}
]}
,

{ id:'m5-sinc2', module:'M5', nav:'Products of sincs', title:'Multiplying two sincs, and the shapes that come out', src:'p. 61',
  objective:'Convolve two rectangular bands and read the triangle and the trapezoid.',
  keywords:'sinc squared triangle trapezoid convolution of rectangles apex 2 plateau bandwidths', steps:4, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 61'},
  {t:'title', text:'Two rectangles convolve into a triangle'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'note', kind:'def', head:'The shape rule', html:'Convolving two rectangles of height $A$ and half-width $\\omega_0$ gives a <b>triangle</b> of apex $2A^{2}\\omega_0$ on $|\\omega|\\le2\\omega_0$. If the half-widths differ, the result is a <b>trapezoid</b>: flat over $|\\omega|\\le|\\omega_1-\\omega_2|$ and zero beyond $\\omega_1+\\omega_2$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Given','$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, so $X(j\\omega)=1$ on $|\\omega|<2\\pi$. Take $z(t)=x^{2}(t)$.'],
        ['Find','$Z(j\\omega)$.'],
        ['Method','Multiplication in time is convolution in frequency, with the factor $\\tfrac{1}{2\\pi}$.']
      ]},
      {t:'eq', key:true, tex:'Z(j\\omega)=\\frac{1}{2\\pi}\\bigl[X*X\\bigr](j\\omega)=\\frac{1}{2\\pi}\\cdot4\\pi\\left(1-\\frac{|\\omega|}{4\\pi}\\right)=2\\left(1-\\frac{|\\omega|}{4\\pi}\\right)\\ \\text{on}\\ |\\omega|\\le4\\pi',
        label:'Solution',
        note:'Apex $2A^{2}\\omega_0=2\\cdot1\\cdot2\\pi=4\\pi$ before the $\\tfrac{1}{2\\pi}$, and $2$ after it.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Peak check in time','$x(0)=2$, so $z(0)=x^{2}(0)=4$. Reading the same number through the transform: $\\dfrac{1}{2\\pi}\\int Z\\,\\d\\omega=\\dfrac{1}{2\\pi}\\cdot\\tfrac12\\cdot8\\pi\\cdot2=4$.'],
        ['Band check','The band doubled, from $2\\pi$ to $4\\pi$. Squaring a signal in time always widens its spectrum, and by exactly the width of the spectrum being convolved in.']
      ]}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Unequal bandwidths','Take $x_1$ with a band of half-width $2\\pi$ and $x_2$ with half-width $4\\pi$, both of height 1. Then $Z$ is a trapezoid of height $\\dfrac{1}{2\\pi}\\cdot2\\cdot2\\pi=2$, flat on $|\\omega|\\le2\\pi$ and zero beyond $6\\pi$.'],
        ['Peak check','$x_1(0)=2$ and $x_2(0)=4$, so the product peaks at $8$. That is the area of the trapezoid divided by $2\\pi$.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'ok', head:'Why the flat top appears', html:'While the narrower band slides entirely inside the wider one, the overlap area does not change, so the convolution is constant. The flat top is exactly as wide as the difference of the two half-widths, and it shrinks to a point when the two are equal, which is the triangle again.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'16px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-1.6,1.6],yr:[-1,2.5],xlabel:'t',ylabel:'x(t)',pad:{l:52,r:18,t:30,b:34},xtarget:5,ytarget:3,yticksOverride:[0,1,2]});
        a.curve(t=>lpfTime(t,2*PI),{color:C.in,n:2400}); a.point(0,2,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$x$, peak 2.'}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-1.6,1.6],yr:[-0.5,4.9],xlabel:'t',ylabel:'x^{2}(t)',pad:{l:54,r:18,t:32,b:34},xtarget:5,ytarget:3,yticksOverride:[0,2,4]});
        a.curve(t=>Math.pow(lpfTime(t,2*PI),2),{color:C.out,n:2400}); a.point(0,4,{color:C.coral,r:3.6}); return a.svg(); },
        caption:'$x^{2}$, peak 4.'}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-18,18],yr:[-0.55,2.5],xlabel:'\\omega',ylabel:'Z(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        const tri=w=>Math.abs(w)<4*PI?2*(1-Math.abs(w)/(4*PI)):0;
        a.area(tri,-18,18,{color:'rgba(74,122,70,.13)'});
        a.curve(tri,{color:C.out,width:2.4,n:2400}); a.point(0,2,{color:C.coral,r:4});
        return a.svg(); },
        caption:'The triangle: apex 2, base $|\\omega|\\le4\\pi$.'}]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-24,24],yr:[-0.55,2.5],xlabel:'\\omega',ylabel:'Z(j\\omega)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,1,2]});
        const trap=w=>{ const aw=Math.abs(w);
          if(aw<=2*PI) return 2;
          if(aw>=6*PI) return 0;
          return 2*(6*PI-aw)/(4*PI); };
        a.area(trap,-24,24,{color:'rgba(106,90,146,.13)'});
        a.curve(trap,{color:C.mid,width:2.4,n:3000});
        return a.svg(); },
        caption:'Unequal bandwidths: height 2, flat on $|\\omega|\\le2\\pi$, zero beyond $6\\pi$.'}]}
  ]}
]},

{ id:'m5-tables', module:'M5', nav:'Property summary', title:'The properties, in one place', src:'p. 62',
  objective:'Collect the properties and pairs of this module for reference.',
  keywords:'summary table properties pairs reference list transform pairs sinc convention', steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Reference', src:'p. 62'},
  {t:'title', text:'Everything derived so far, on one page'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'sub', text:'Properties'},
    {t:'wex', rows:[
      ['Linearity','$a x_1+b x_2\\;\\leftrightarrow\\;a X_1+b X_2$'],
      ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)$'],
      ['Frequency shift','$e^{j\\omega_0t}x(t)\\;\\leftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)$'],
      ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;X^{*}(-j\\omega)$'],
      ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$'],
      ['Time reversal','$x(-t)\\;\\leftrightarrow\\;X(-j\\omega)$'],
      ['Time scaling','$x(at)\\;\\leftrightarrow\\;\\dfrac{1}{|a|}X\\bigl(j\\omega/a\\bigr)$'],
      ['Differentiation','$\\dfrac{\\d^{n}x}{\\d t^{n}}\\;\\leftrightarrow\\;(j\\omega)^{n}X(j\\omega)$'],
      ['Duality','$X(t)\\;\\leftrightarrow\\;2\\pi x(-\\omega)$'],
      ['Convolution','$x*h\\;\\leftrightarrow\\;X\\,H$'],
      ['Multiplication','$x\\,y\\;\\leftrightarrow\\;\\dfrac{1}{2\\pi}X*Y$'],
      ['Parseval','$\\displaystyle\\int|x|^{2}\\d t=\\frac{1}{2\\pi}\\int|X|^{2}\\d\\omega$']
    ]}
  ], right:[
    {t:'sub', text:'Transform pairs'},
    {t:'wex', rows:[
      ['Impulse','$\\delta(t)\\;\\leftrightarrow\\;1$'],
      ['Shifted impulse','$\\delta(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}$'],
      ['Constant','$1\\;\\leftrightarrow\\;2\\pi\\delta(\\omega)$'],
      ['Complex exponential','$e^{j\\omega_0t}\\;\\leftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0)$'],
      ['Cosine','$\\cos(\\omega_0t)\\;\\leftrightarrow\\;\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$'],
      ['Sine','$\\sin(\\omega_0t)\\;\\leftrightarrow\\;\\dfrac{\\pi}{j}\\delta(\\omega-\\omega_0)-\\dfrac{\\pi}{j}\\delta(\\omega+\\omega_0)$'],
      ['One-sided exponential','$e^{-at}u(t)\\;\\leftrightarrow\\;\\dfrac{1}{a+j\\omega}$, $a>0$'],
      ['Two-sided exponential','$e^{-a|t|}\\;\\leftrightarrow\\;\\dfrac{2a}{a^{2}+\\omega^{2}}$, $a>0$'],
      ['Rectangular pulse','$1$ on $|t|<T_1\\;\\leftrightarrow\\;\\dfrac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)$'],
      ['Ideal low-pass band','$\\dfrac{\\sin(Wt)}{\\pi t}=\\dfrac{W}{\\pi}\\operatorname{sinc}(Wt)\\;\\leftrightarrow\\;1$ on $|\\omega|<W$'],
      ['Impulse train','$\\displaystyle\\sum_k\\delta(t-kT)\\;\\leftrightarrow\\;\\frac{2\\pi}{T}\\sum_k\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right)$'],
      ['Periodic signal','$\\displaystyle\\sum_k a_ke^{jk\\omega_0t}\\;\\leftrightarrow\\;\\sum_k 2\\pi a_k\\delta(\\omega-k\\omega_0)$']
    ]}
  ]},
  {t:'reveal', at:1, items:[
    {t:'note', kind:'warn', head:'Two things to carry with the table', html:'Every sinc above is the <b>unnormalised</b> one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. A table written in the normalised convention divides the argument by $\\pi$, so the two look different while saying the same thing, and copying an argument between them is the commonest way to lose a factor of $\\pi$. The exponential pairs hold only for $a>0$, and the condition belongs on the same line as the result.'}]},
  {t:'reveal', at:2, items:[
    {t:'note', kind:'ok', head:'How to use a table like this', html:'Almost every problem in this module is one pair from the right-hand column plus one or two properties from the left. Recognise the shape, look up the pair, apply the properties in the order the signal was built, and check the answer at $\\omega=0$ against the area of the signal.'}]}
]},

{ id:'m5-diffeq', module:'M5', nav:'Systems from a differential equation', title:'From a differential equation to a frequency response', src:'p. 62',
  objective:'Turn an LCCDE into H(jω) and state when H exists.',
  keywords:'differential equation LCCDE frequency response H(jw) rational stability absolutely integrable', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Systems', src:'p. 62'},
  {t:'title', text:'Differentiation becomes multiplication, so the equation becomes algebra'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Many continuous-time systems are described by a linear differential equation with constant coefficients, relating the output to the input:'},
    {t:'eq', size:'sm', tex:'\\sum_{k=0}^{N}a_k\\frac{\\d^{k}y(t)}{\\d t^{k}}=\\sum_{k=0}^{M}b_k\\frac{\\d^{k}x(t)}{\\d t^{k}}'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'Transform both sides. By linearity every term transforms on its own, and by the differentiation property each $\\d^{k}/\\d t^{k}$ becomes a factor $(j\\omega)^{k}$:'},
      {t:'eq', size:'sm', tex:'\\left[\\sum_{k=0}^{N}a_k(j\\omega)^{k}\\right]Y(j\\omega)=\\left[\\sum_{k=0}^{M}b_k(j\\omega)^{k}\\right]X(j\\omega)'},
      {t:'eq', key:true, size:'lg', tex:'H(j\\omega)=\\frac{Y(j\\omega)}{X(j\\omega)}=\\frac{\\displaystyle\\sum_{k=0}^{M}b_k(j\\omega)^{k}}{\\displaystyle\\sum_{k=0}^{N}a_k(j\\omega)^{k}}',
        label:'Frequency response of the system',
        note:'The frequency response is a ratio of two polynomials in $j\\omega$, read straight off the coefficients of the differential equation. No integration is needed.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'When $H(j\\omega)$ exists', html:'The frequency response is the transform of $h$, so it exists when $h$ is absolutely integrable: $\\int|h(t)|\\,\\d t<\\infty$. For an LTI system that condition is <b>exactly</b> bounded-input bounded-output stability, proved in Module 3. So the statement is about the system, not about the signal $h$: an unstable system has no frequency response to plot.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'The three-step recipe', html:'<b>1.</b> Read $H(j\\omega)$ off the coefficients. <b>2.</b> Multiply by $X(j\\omega)$ to get $Y(j\\omega)$. <b>3.</b> Split the result into simple fractions and invert each one with the table. The whole of Module 3’s convolution has been replaced by algebra plus a lookup.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:830,h:230,items:[
      {t:'box',x:50,y:26,w:250,h:64,label:'\\text{differential equation}',tex:true,fs:15},
      {t:'arrow',x1:300,y1:58,x2:520,y2:58,label:'\\mathcal{F}',tex:true,color:'#BE5539'},
      {t:'box',x:520,y:26,w:250,h:64,label:'\\text{algebra in }j\\omega',tex:true,fs:15},
      {t:'box',x:520,y:140,w:250,h:64,label:'H(j\\omega)=B(j\\omega)/A(j\\omega)',tex:true,fs:16,color:'#C08422'},
      {t:'line',d:'M645,90 L645,140',color:'#4A657F'},
      {t:'line',d:'M645,140 l-4.5,-9 h9 Z',color:'#4A657F'},
      {t:'box',x:50,y:140,w:250,h:64,label:'h(t)',tex:true,fs:17,color:'#C08422'},
      {t:'line',d:'M520,172 L310,172',color:'#4A657F'},
      {t:'line',d:'M300,172 l9,-4.5 v9 Z',color:'#4A657F'},
      {t:'text',x:410,y:196,label:'\\text{partial fractions, then the table}',tex:true,fs:12,color:'#4A657F'}
    ]}), caption:'The route the next two scenes follow, in both directions.'},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Example equation','$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$'],
        ['Its response','$H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega)^{2}+4j\\omega+3}=\\dfrac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}$'],
        ['Its poles','At $j\\omega=-1$ and $j\\omega=-3$. Both have negative real part, so the system is stable and $H$ exists.']
      ]}]}
  ]}
]},

{ id:'m5-diffeq-ex', module:'M5', nav:'Worked example · simple poles', title:'Worked example — an impulse response from simple poles', src:'p. 63',
  objective:'Invert a rational H with distinct poles and check the result.',
  keywords:'worked example partial fractions simple poles cover-up impulse response half half', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Two distinct poles, two exponentials'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$, with the system initially at rest.'],
      ['Find','$H(j\\omega)$ and $h(t)$.'],
      ['Method','Read the ratio off the coefficients, factor the denominator, split into simple fractions and invert term by term.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'H(j\\omega)=\\frac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}=\\frac{A}{j\\omega+1}+\\frac{B}{j\\omega+3}'},
      {t:'note', kind:'def', head:'Use a named variable, not the symbol $j\\omega$', html:'Set $s=j\\omega$ while the algebra is done. Treating the two-character symbol $j\\omega$ as if it were a single variable works, but it invites sign slips as soon as a derivative or a substitution is needed. Change back at the end.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['$A$','Multiply by $(s+1)$, cancel, and set $s=-1$: $A=\\dfrac{s+2}{s+3}\\bigg|_{s=-1}=\\dfrac{1}{2}$.'],
        ['$B$','Multiply by $(s+3)$, cancel, and set $s=-3$: $B=\\dfrac{s+2}{s+1}\\bigg|_{s=-3}=\\dfrac{-1}{-2}=\\dfrac{1}{2}$.']
      ]},
      {t:'eq', key:true, size:'lg', tex:'h(t)=\\left[\\tfrac12e^{-t}+\\tfrac12e^{-3t}\\right]u(t)',
        label:'Solution',
        note:'Each fraction was inverted with $e^{-ct}u(t)\\leftrightarrow1/(c+j\\omega)$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Check at $\\omega=0$','$H(j0)=2/3$ from the formula, and $\\int_{0}^{\\infty}h(t)\\d t=\\tfrac12+\\tfrac16=\\tfrac23$ from the answer. They agree.'],
        ['Check the start','$h(0^{+})=\\tfrac12+\\tfrac12=1$, which matches the numerator degree being one less than the denominator degree.'],
        ['Check stability','$h$ is absolutely integrable, so the system is stable and $H(j\\omega)$ was entitled to exist.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:200,xr:[-0.5,6],yr:[-0.12,1.2],xlabel:'t',ylabel:'h(t)',pad:{l:54,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1]});
      a.area(t=>t<0?0:0.5*Math.exp(-t)+0.5*Math.exp(-3*t),0,6,{color:'rgba(192,132,34,.13)'});
      a.curve(t=>t<0?0:0.5*Math.exp(-t)+0.5*Math.exp(-3*t),{color:C.h,width:2.4,n:2400});
      a.point(0,1,{color:C.coral,r:4});
      return a.svg(); },
      caption:'The impulse response. It starts at 1 and its total area is $2/3$.'},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-8,8],yr:[-0.09,0.78],xlabel:'\\omega',ylabel:'|H(j\\omega)|',pad:{l:58,r:18,t:32,b:34},xtarget:5,ytarget:3,yticksOverride:[0,0.33,0.67],ytickfmt:v=>v.toFixed(2)});
          a.curve(w=>Math.hypot(2,w)/(Math.hypot(1,w)*Math.hypot(3,w)),{color:C.h,n:2000});
          a.point(0,2/3,{color:C.coral,r:3.8}); return a.svg(); },
          caption:'Magnitude, peak $0.667$ at the origin.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:196,xr:[-8,8],yr:[-1.55,1.55],xlabel:'\\omega',ylabel:'\\angle H(j\\omega)\\;[\\text{rad}]',pad:{l:64,r:18,t:32,b:34},xtarget:5,yticksOverride:[-1,-0.5,0,0.5,1]});
          a.curve(w=>Math.atan2(w,2)-Math.atan2(w,1)-Math.atan2(w,3),{color:C.mid,n:2000}); return a.svg(); },
          caption:'Phase: odd in $\\omega$, as a real $h$ requires.'}]
      ]}]}
  ]}
]},

{ id:'m5-partial', module:'M5', nav:'Repeated poles', title:'What to do when a pole repeats', src:'p. 63',
  objective:'State the repeated-pole partial-fraction rule and show why the cover-up rule fails there.',
  keywords:'repeated pole multiplicity derivative partial fractions cover-up rule fails formula', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Technique', src:'p. 63'},
  {t:'title', text:'The cover-up rule stops at a double pole'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The cover-up rule of the previous scene assumed every factor of the denominator appeared once. When a factor is repeated, the expansion needs one term per power, and only the highest of them can be found by covering up.'},
    {t:'eq', size:'sm', tex:'F(s)=\\frac{N(s)}{(s-\\lambda)^{m}\\,Q(s)}=\\frac{c_{m}}{(s-\\lambda)^{m}}+\\frac{c_{m-1}}{(s-\\lambda)^{m-1}}+\\dots+\\frac{c_{1}}{s-\\lambda}+\\ (\\text{terms from }Q)'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'err', head:'Why covering up fails', html:'Multiply by $(s-\\lambda)$ and one factor of $(s-\\lambda)$ still survives in the denominator, so setting $s=\\lambda$ divides by zero. Multiply by $(s-\\lambda)^{m}$ instead and the singularity is gone, but now only the <b>top</b> coefficient $c_m$ falls out; the rest are still hidden inside the remaining polynomial.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'c_{m-k}=\\frac{1}{k!}\\left.\\frac{\\d^{k}}{\\d s^{k}}\\Bigl[(s-\\lambda)^{m}F(s)\\Bigr]\\right|_{s=\\lambda},\\qquad k=0,1,\\dots,m-1',
        label:'Repeated-pole rule',
        note:'$k=0$ is the cover-up rule and gives $c_m$. Each further derivative peels off one more coefficient. Every one of them is obtained by differentiation, not by guessing or by substituting a convenient value.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'warn', head:'The shortcut worth avoiding', html:'A common shortcut is to find the last coefficient by putting some convenient number, often $s=0$, into the identity and solving. It works, but it is coefficient matching without saying so, and it gives no way to check the answer. The derivative formula gives the coefficient directly and can be verified by reassembling the fraction.'},
      {t:'wex', rows:[
        ['The inverse transforms needed','$\\dfrac{1}{s+a}\\leftrightarrow e^{-at}u(t)$ and $\\dfrac{1}{(s+a)^{2}}\\leftrightarrow t\\,e^{-at}u(t)$, with $s=j\\omega$.'],
        ['Where the $t$ comes from','A repeated pole always brings a factor of $t$ into the time domain. A double pole gives $t$, a triple pole gives $t^{2}/2$, and so on.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:220,xr:[-0.4,8],yr:[-0.06,0.45],xlabel:'t',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.2,0.4]});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,width:1.6,dash:'5 5',n:2000});
      a.curve(t=>t<0?0:t*Math.exp(-t),{color:C.out,width:2.4,n:2000});
      a.note(7.6,0.30,'e^{-at}u(t)',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(7.6,0.10,'t\\,e^{-at}u(t)',{anchor:'end',color:C.out,fs:14,tex:true});
      a.point(1,Math.exp(-1),{color:C.coral,r:4});
      return a.svg(); },
      caption:'A simple pole and a double pole at the same place. The double pole rises from zero, peaks at $t=1/a$, and decays more slowly.'},
    {t:'reveal', at:2, items:[
      {t:'small', html:'The two behaviours are worth telling apart at a glance: a simple pole gives a signal that is largest at $t=0$; a repeated pole gives one that starts at zero and grows before decaying. A worked answer that starts at the wrong height has usually lost a coefficient rather than a pole.'}]}
  ]}
]},

{ id:'m5-diffeq-b', module:'M5', nav:'Worked example · a repeated pole', title:'Worked example — the repeated pole, and the check that catches a sign', src:'p. 63',
  objective:'Solve a full LTI problem with a double pole and use y(0)=0 as the check.',
  keywords:'worked example repeated pole double pole coefficients quarter half minus quarter derivative rule', steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'Three coefficients, one of them negative'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','The system of the previous example, $H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}$, with input $x(t)=e^{-t}u(t)$.'],
      ['Find','$y(t)$.'],
      ['Method','$Y=XH$, then partial fractions. Write $s=j\\omega$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'Y(s)=\\frac{1}{s+1}\\cdot\\frac{s+2}{(s+1)(s+3)}=\\frac{s+2}{(s+1)^{2}(s+3)}=\\frac{A}{s+1}+\\frac{B}{(s+1)^{2}}+\\frac{C}{s+3}',
        note:'The input pole and one system pole coincide at $s=-1$, so that pole is now double. Nothing else changed.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['$B$','$B=\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\dfrac{s+2}{s+3}\\bigg|_{s=-1}=\\dfrac{1}{2}$.'],
        ['$A$','$A=\\dfrac{\\d}{\\d s}\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\dfrac{1}{(s+3)^{2}}\\bigg|_{s=-1}=\\dfrac{1}{4}$.'],
        ['$C$','$C=\\Bigl[(s+3)Y\\Bigr]_{s=-3}=\\dfrac{s+2}{(s+1)^{2}}\\bigg|_{s=-3}=\\dfrac{-1}{4}$.']
      ]},
      {t:'note', kind:'warn', head:'Carry the minus into the assembly', html:'$C$ is negative. It has to arrive in the answer as $-\\tfrac14$, and the place it is most easily dropped is the line where the three fractions are written out together, several steps after $C$ was computed.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:210,xr:[-0.4,7],yr:[-0.08,1.2],xlabel:'t',pad:{l:54,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.5,1]});
      a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,width:1.8,dash:'5 5',n:2000});
      a.curve(t=>t<0?0:t*Math.exp(-t),{color:C.mid,width:2.2,n:2000});
      a.curve(t=>t<0?0:Math.exp(-3*t),{color:C.h,width:1.8,n:2000});
      a.note(6.7,0.62,'e^{-t}',{anchor:'end',color:C.in,fs:14,tex:true});
      a.note(6.7,0.30,'t\\,e^{-t}',{anchor:'end',color:C.mid,fs:14,tex:true});
      a.note(2.2,0.78,'e^{-3t}',{anchor:'start',color:C.h,fs:14,tex:true});
      return a.svg(); },
      caption:'The three building blocks the three coefficients multiply. Only the middle one starts at zero, and only it comes from the repeated pole.'}
  ]}
]},

{ id:'m5-diffeq-b2', module:'M5', nav:'Worked example · the check', title:'The answer, and the one number that tests all three coefficients', src:'p. 63',
  objective:'Assemble the output and use y(0)=0 to catch a lost sign.',
  keywords:'worked example causal convolution starts at zero check sign lost candidates compare', steps:3, blocks:[
  {t:'eyebrow', text:'Module 5 · Worked example', src:'p. 63'},
  {t:'title', text:'A causal convolution starts at zero'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', size:'sm', tex:'Y(s)=\\frac{1/4}{s+1}+\\frac{1/2}{(s+1)^{2}}-\\frac{1/4}{s+3}',
      note:'The three coefficients of the previous scene, written out together. This is the line where a sign is lost.'},
    {t:'reveal', at:1, items:[
      {t:'eq', key:true, size:'lg', tex:'y(t)=\\left[\\tfrac14e^{-t}+\\tfrac12t\\,e^{-t}-\\tfrac14e^{-3t}\\right]u(t)',
        label:'Solution',
        note:'Inverted with $\\dfrac{1}{s+a}\\leftrightarrow e^{-at}u(t)$ and $\\dfrac{1}{(s+a)^{2}}\\leftrightarrow t\\,e^{-at}u(t)$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The check', html:'$y=x*h$ with both $x$ and $h$ causal, so at $t=0$ there is no overlap and $y(0)=0$. Putting $t=0$ into the answer gives $\\tfrac14+0-\\tfrac14=0$. Assembled with $+\\tfrac14$ instead, the same substitution gives $\\tfrac12$, and a convolution of two causal signals cannot start at $\\tfrac12$.'}]},
    {t:'reveal', at:3, items:[
      {t:'wex', rows:[
        ['Why this check and not another','The two candidates agree to three decimals past $t=2$ — $0.168549$ against $0.169789$ — so comparing curves out there decides nothing. At $t=0$ they differ by a factor of two.'],
        ['Second route','Convolving directly, $\\int_{0}^{t}e^{-\\tau}\\bigl[\\tfrac12e^{-(t-\\tau)}+\\tfrac12e^{-3(t-\\tau)}\\bigr]\\d\\tau$, returns the same three terms with the same signs.']
      ]}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:215,xr:[-0.4,7],yr:[-0.06,0.58],xlabel:'t',ylabel:'y(t)',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.25,0.5]});
      a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)-0.25*Math.exp(-3*t),{color:C.out,width:2.6,n:2400});
      a.point(0,0,{color:C.coral,r:4.4});
      return a.svg(); },
      caption:'The output. It starts at exactly zero, rises to a maximum and decays.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:215,xr:[-0.4,4],yr:[-0.08,0.82],xlabel:'t',pad:{l:56,r:26,t:30,b:34},xtarget:7,ytarget:3,yticksOverride:[0,0.25,0.5]});
        a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)-0.25*Math.exp(-3*t),{color:C.out,width:2.6,n:2400});
        a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)+0.25*Math.exp(-3*t),{color:C.err,width:2,dash:'6 4',n:2400});
        a.point(0,0,{color:C.coral,r:4.2}); a.point(0,0.5,{color:C.err,r:4.2});
        a.note(3.85,0.38,'C=-\\tfrac14',{anchor:'end',color:C.out,fs:13,tex:true});
        a.note(3.85,0.62,'C=+\\tfrac14',{anchor:'end',color:C.err,fs:13,tex:true});
        return a.svg(); },
        caption:'The two candidates. They are indistinguishable past $t=2$ and differ by $0.5$ at the origin, which is where the check is made.'}]}
  ]}
]},

{ id:'m5-lab-h', module:'M5', nav:'Laboratory H · Time and frequency', title:'Laboratory H — CTFT Time–Frequency Explorer', src:'pp. 45–61',
  objective:'Move one signal in time and watch its transform answer, with and without a carrier.',
  keywords:'laboratory H CTFT explorer time frequency width bandwidth modulation carrier sidebands overlap', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory H', src:'pp. 45–61'},
  {t:'title', text:'One control in time, two panels in frequency'},
  {t:'small', html:'Change a width or a rate and watch the transform answer. Then switch the carrier on: the spectrum becomes two half-height copies, and lowering the carrier brings them together until they meet.'},
  {t:'lab', id:'H'}
]},

{ id:'m5-qbank', module:'M5', nav:'Module 5 question bank', title:'Module 5 — question bank', src:'pp. 42–63',
  objective:'Twelve questions covering Module 5 outcomes.',
  keywords:'questions quiz Q5 bank module 5 exercises fourier transform', steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Question bank Q5-01 … Q5-12', src:'pp. 42–63'},
  {t:'title', text:'Question bank'},
  {t:'small', html:'Everything needed is in Modules 1–5. Several questions target the factor $2\\pi$ and where it lives, several test whether the negative-frequency half of a real spectrum is being kept, and several ask which sinc convention a written formula is in.'},
  {t:'qbank', module:'M5'}
]},

{ id:'m5-synth', module:'M5', nav:'Module 5 synthesis', title:'Module 5 — what to carry forward', src:'pp. 42–63',
  dark:true, objective:'Consolidate the module and open the question Module 6 answers.',
  keywords:'synthesis summary module 5 checklist discrete time preview DTFT periodic spectrum', steps:2, blocks:[
  {t:'eyebrow', text:'Module 5 · Synthesis', src:'pp. 42–63'},
  {t:'title', text:'A checklist, and the domain it does not reach'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:#DED5C6"><b>1.</b> Decide which direction is needed. Integrating over $t$ gives $X(j\\omega)$; integrating over $\\omega$, with $1/2\\pi$, gives $x(t)$.</p>
      <p style="color:#DED5C6"><b>2.</b> Look for a known pair before integrating anything. Most signals in this module are one pair plus one or two properties.</p>
      <p style="color:#DED5C6"><b>3.</b> State every condition the result depends on: $a>0$ for an exponential, and which sinc convention is in use.</p>
      <p style="color:#DED5C6"><b>4.</b> Keep both halves of a real spectrum. Magnitude even, phase odd, and one impulse at each of $\\pm\\omega_0$.</p>
      <p style="color:#DED5C6"><b>5.</b> Track the $2\\pi$: on the synthesis side, in front of $\\delta(\\omega-\\omega_0)$, dividing the convolution in frequency, and dividing the energy in Parseval.</p>
      <p style="color:#DED5C6"><b>6.</b> Through an LTI system, $Y=XH$. From a differential equation, read $H$ off the coefficients and split it into simple fractions.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Three checks catch most errors', html:'<span style="color:#DED5C6">$X(j0)$ is the area under the signal, and $x(0)$ is the area under the spectrum divided by $2\\pi$. A causal convolution starts at zero. A real signal has an even magnitude and an odd phase. Each of the three costs one line.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Where Module 6 begins</p>'},
    {t:'lede', text:'Everything here was continuous time. A computer never sees a continuous signal; it sees a sequence. So the same question has to be asked again for x[n], and one thing changes that changes everything.'},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:#DED5C6">In continuous time, $e^{-j\\omega t}$ is a different signal for every real $\\omega$. In discrete time it is not: $e^{-j(\\omega+2\\pi)n}=e^{-j\\omega n}$ for every integer $n$, because $e^{-j2\\pi n}=1$.</p>`},
      {t:'eq', plain:true, tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}=X\\bigl(e^{j(\\omega+2\\pi)}\\bigr)'},
      {t:'body', html:`<p style="color:#DED5C6">A discrete-time spectrum therefore <b>repeats</b>, with period $2\\pi$. Every result of this module has a counterpart there, and the periodicity is the one thing with no continuous-time analogue. That is Module 6.</p>`}]}
  ]}
]}

];
window.SCENES_M5 = SC;
})();
