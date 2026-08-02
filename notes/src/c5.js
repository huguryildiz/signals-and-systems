/* Course notes — Chapter 5, the continuous-time Fourier transform */
(function(){
const P=PLOT, C=P.COL;
const PI=Math.PI;
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:56,r:22,t:28,b:34},xtarget:8,ytarget:3},o));
const sincU=x=>Math.abs(x)<1e-9?1:Math.sin(x)/x;
const rectp=(t,T1)=>Math.abs(t)<T1?1:0;
const rectPer=(t,T,T1)=>{const u=t-T*Math.round(t/T);return Math.abs(u)<T1?1:0;};
const rectFT=(w,T1)=>2*T1*sincU(w*T1);
const aSq=(k,T,T1)=>k===0?2*T1/T:Math.sin(2*PI*k*T1/T)/(PI*k);
const lpfTime=(t,W)=>(W/PI)*sincU(W*t);

window.C5 = [
{t:'page'},

{t:'h1', num:'CHAPTER 5', text:'The continuous-time Fourier transform'},
{t:'p', lead:true, text:'Chapter 4 needed the signal to repeat. A single pulse does not repeat, has no fundamental period, and therefore has no harmonics to carry coefficients. This chapter lets the period grow without bound and watches what the Fourier series becomes. The stems merge into a curve, the sum becomes an integral, and the result applies to almost every signal of finite energy.'},

{t:'h2', num:'5.1', text:'From a series to a transform'},
{t:'p', text:'Let $x(t)$ be zero for $|t|>T_1$. The number $T_1$ is the half-width of the support and belongs to the signal alone. Build a periodic signal $\\tilde{x}$ by repeating the pulse every $T$ seconds, with $T>2T_1$ so that the copies do not touch:'},
{t:'eq', tex:'\\tilde{x}(t)=\\sum_{m=-\\infty}^{\\infty}x(t-mT),\\qquad \\tilde{x}(t)=\\tilde{x}(t+T),\\qquad T>2T_1.'},
{t:'p', text:'Inside one period $\\tilde{x}$ is the original pulse, so Chapter 4 applies to it. As $T$ grows the pulse in the middle never changes and the copies beside it slide away, so $\\tilde{x}(t)\\to x(t)$ for every $t$.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:180,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\tilde{x}(t)',ytarget:2,yticksOverride:[0,1]});
  a.curve(t=>rectPer(t,5,1),{color:C.mid,n:3000});
  a.span(0,5,1.2,'T',{color:C.coral,tex:true,fs:13});
  return a.svg(); },
  cap:'The periodic extension with $T=5T_1$. The condition $T>2T_1$ is what keeps the copies apart.'},

{t:'h3', text:'The coefficients are samples of one curve'},
{t:'p', text:'Apply the analysis equation of Chapter 4 to $\\tilde{x}$ over one period. Inside that period $\\tilde{x}=x$, and outside $|t|<T_1$ the integrand is zero, so the limits may be opened to all of time:'},
{t:'eq', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\tilde{x}(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\int_{-\\infty}^{\\infty}x(t)e^{-jk\\omega_0t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T}.'},
{t:'p', text:'The right-hand integral is one expression evaluated at the number $k\\omega_0$. Give it a free variable and a name.'},
{t:'eqbox', cap:'Definition of the transform', tex:['X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t'],
 after:'Then $a_k=\\frac{1}{T}X(jk\\omega_0)$, so every coefficient of the periodic extension is one point of the curve $X$, scaled by $1/T$. The curve was built from the pulse alone, so lengthening $T$ cannot move it. What lengthening $T$ does is shrink the spacing $\\omega_0=2\\pi/T$ and shrink each coefficient by the same factor.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:340,h:180,xr:[-10,10],yr:[-0.9,2.35],xlabel:'\\omega',ylabel:'T a_k',xtarget:5,yticksOverride:[0,1,2]});
   a.curve(w=>rectFT(w,1),{color:C.coral,width:1.4,dash:'4 5',n:1200});
   const w0=2*PI/4, st=[]; for(let k=-Math.floor(10/w0);k<=Math.floor(10/w0);k++) st.push([k*w0,4*aSq(k,4,1)]);
   a.stem(st,{color:C.in,r:3.2,showZero:true}); return a.svg(); }, cap:'$T=4T_1$.'},
 {svg:()=>{ const a=ax({w:340,h:180,xr:[-10,10],yr:[-0.9,2.35],xlabel:'\\omega',ylabel:'T a_k',xtarget:5,yticksOverride:[0,1,2]});
   a.curve(w=>rectFT(w,1),{color:C.coral,width:1.4,dash:'4 5',n:1200});
   const w0=2*PI/16, st=[]; for(let k=-Math.floor(10/w0);k<=Math.floor(10/w0);k++) st.push([k*w0,16*aSq(k,16,1)]);
   a.stem(st,{color:C.mid,r:2.2,showZero:true}); return a.svg(); }, cap:'$T=16T_1$: the same curve, sampled four times as finely.'}
]},

{t:'h3', text:'The sum becomes an integral'},
{t:'p', text:'Put $a_k=\\frac{1}{T}X(jk\\omega_0)$ back into the synthesis equation and replace $1/T$ by $\\omega_0/2\\pi$. Nothing has been approximated yet.'},
{t:'eq', tex:'\\tilde{x}(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}=\\frac{1}{2\\pi}\\sum_{k=-\\infty}^{\\infty}X(jk\\omega_0)\\,e^{jk\\omega_0t}\\,\\omega_0.'},
{t:'p', text:'Every term now carries the spacing $\\omega_0$ as a factor, which is the shape of a Riemann sum. Let $T\\to\\infty$: the left side becomes $x(t)$, the spacing becomes the differential $\\d\\omega$, the sample points fill the axis, and the sum becomes an integral.'},
{t:'eqbox', cap:'The continuous-time Fourier transform pair',
 tex:['X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t\\qquad\\text{(analysis)}',
      'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega\\qquad\\text{(synthesis)}'],
 after:'Analysis integrates over $t$ and leaves a function of $\\omega$: it takes the signal apart. Synthesis integrates over $\\omega$ and leaves a function of $t$: it puts the signal back together. The factor $1/2\\pi$ arrived as $\\omega_0/2\\pi$ when the spacing was substituted, and it stays on the synthesis side throughout. The pair is written $x(t)\\leftrightarrow X(j\\omega)$, with the argument $j\\omega$ and never $\\omega$ alone.'},
{t:'box', kind:'warn', hd:'Which equation is which', html:'The variable of integration settles it, and nothing else needs to be remembered. Integrating time away produces a spectrum, and that is analysis. Integrating frequency away produces a signal, and that is synthesis. The two exponents differ by one minus sign, so the pair is as easy to write backwards as forwards, and the names are the only part that can be exchanged by mistake.'},

{t:'h2', num:'5.2', text:'When the transform exists'},
{t:'p', text:'Two conditions each guarantee that $X(j\\omega)$ exists. They are alternatives, joined by "or", and neither implies the other.'},
{t:'ol', items:[
 '<b>Finite energy.</b> $\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t<\\infty$.',
 '<b>The Dirichlet conditions.</b> $x$ is absolutely integrable, $\\int_{-\\infty}^{\\infty}|x(t)|\\,\\d t<\\infty$, and has finitely many maxima, minima and finite jumps in any finite interval.'
]},
{t:'p', text:'That they are independent is shown by one example each way. The signal $\\sin(t)/t$ has finite energy, and its modulus decays only like $1/|t|$, so its area diverges. The signal $1/\\sqrt{t}$ on $0<t<1$ has area 2, and its square is $1/t$, whose integral over the same interval diverges.'},
{t:'p', text:'Neither condition is necessary. A constant, a complex exponential and every periodic signal fail both and still have spectra, in the limiting sense: the transform is an impulse, defined by what it does inside an integral, exactly as $\\delta(t)$ is. Taking $e^{-a|t|}\\leftrightarrow2a/(a^{2}+\\omega^{2})$ and letting $a\\to0$ gives $1\\leftrightarrow2\\pi\\delta(\\omega)$, with the curve growing tall and narrow while its area stays $2\\pi$.'},

{t:'h2', num:'5.3', text:'Basic transform pairs'},

{t:'ex', hd:'Example 5.1 — the impulse and the shifted impulse', rows:[
 ['Given','$x(t)=\\delta(t)$, and then $x(t)=\\delta(t-t_0)$.'],
 ['Find','$X(j\\omega)$ in both cases, with magnitude and phase.'],
 ['Method','Substitute into the analysis equation and use the sifting property.'],
 ['Solution','$\\mathcal{F}\\{\\delta(t)\\}=\\int\\delta(t)e^{-j\\omega t}\\d t=1$: every frequency present, equally, with no phase. For the shifted impulse the sifting happens at $t=t_0$, giving $$\\mathcal{F}\\{\\delta(t-t_0)\\}=e^{-j\\omega t_0},\\qquad|X(j\\omega)|=1,\\qquad\\angle X(j\\omega)=-\\omega t_0.$$'],
 ['Check','Push $e^{-j\\omega t_0}$ back through the synthesis equation and the impulse returns. Reading: moving a signal in time never changes the size of any frequency component; it rotates each one by an amount proportional to its frequency.']
]},

{t:'ex', hd:'Example 5.2 — one impulse in frequency', rows:[
 ['Given','$X(j\\omega)=2\\pi\\delta(\\omega-\\omega_0)$.'],
 ['Find','$x(t)$.'],
 ['Method','Synthesis, sifting in the variable $\\omega$.'],
 ['Solution','$x(t)=\\frac{1}{2\\pi}\\int2\\pi\\delta(\\omega-\\omega_0)e^{j\\omega t}\\d\\omega=e^{j\\omega_0t}$. The $2\\pi$ of the impulse weight and the $1/2\\pi$ of the synthesis equation cancel exactly, which is why the weight is written as $2\\pi$ and not as 1.'],
 ['Check','$|x(t)|=1$ and $\\angle x(t)=\\omega_0t$. With an impulse of weight 1 the answer would be $e^{j\\omega_0t}/2\\pi$, which is not a unit-amplitude exponential.']
]},
{t:'eqbox', cap:'Two pairs that follow at once',
 tex:['e^{j\\omega_0t}\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0)','1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)'],
 after:'The second is the first at $\\omega_0=0$.'},

{t:'ex', hd:'Example 5.3 — the one-sided exponential', rows:[
 ['Given','$x(t)=e^{-at}u(t)$, with $a$ real.'],
 ['Find','$X(j\\omega)$, the condition on $a$, and the magnitude and phase.'],
 ['Method','Integrate from 0 to $\\infty$; $u(t)$ removes the rest.'],
 ['Solution','$X(j\\omega)=\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\d t$. The upper limit vanishes only when $a>0$, because $|e^{-j\\omega t}|=1$ and the decay is carried by $e^{-at}$ alone. So $$e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega},\\qquad a>0,$$ with $|X(j\\omega)|=1/\\sqrt{a^{2}+\\omega^{2}}$ and, writing the angle of a quotient as a subtraction, $$\\angle X(j\\omega)=\\angle1-\\angle(a+j\\omega)=0-\\tan^{-1}(\\omega/a)=-\\tan^{-1}(\\omega/a).$$'],
 ['Check','$|X(j0)|=1/a$ gives 10, 1 and 0.2 for $a=0.1,1,5$. At $a=1$, $\\omega=1$ the phase is $-0.785398$ rad; at $a=0.1$, $\\omega=3$ it is $-1.537475$; at $a=5$, $\\omega=2$ it is $-0.380506$. Every one is negative, and the phase curve falls from $+\\pi/2$ to $-\\pi/2$. A curve that rises belongs to $+\\tan^{-1}(\\omega/a)$, which is the angle of the reciprocal.']
]},
{t:'box', kind:'warn', hd:'Where that minus sign is lost', html:'The numerator is the real number 1, so its angle is zero and it is tempting to skip that term and copy $\\tan^{-1}(\\omega/a)$ straight out of the denominator. What is then reported is $\\angle(a+j\\omega)$, the angle of the reciprocal of the answer. Write the subtraction out, including the term that is zero.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-12,12],yr:[-1.85,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',xtarget:7,
    yticksOverride:[-1.5708,-0.7854,0,0.7854,1.5708],ytickfmt:v=>v.toFixed(2)});
  [[0.1,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(w=>-Math.atan(w/av),{color:col,n:2000}));
  a.point(1,-PI/4,{color:C.coral,r:4});
  return a.svg(); },
  cap:'The phase of $1/(a+j\\omega)$ for $a=0.1$, $1$ and $5$, with the marked value $-0.785398$ at $a=\\omega=1$.'},

{t:'ex', hd:'Example 5.4 — the two-sided exponential', rows:[
 ['Given','$x(t)=e^{-a|t|}$ with $a>0$.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','$|t|$ means two formulas, so split at $t=0$. On the left half the exponent is $+at$.'],
 ['Solution','$X(j\\omega)=\\dfrac{1}{a-j\\omega}+\\dfrac{1}{a+j\\omega}=\\dfrac{2a}{a^{2}+\\omega^{2}}$. The imaginary parts cancelled when the fractions were added.'],
 ['Check','$X(j0)=2/a$ gives 4, 2 and 0.4 for $a=0.5,1,5$. The signal is real and even and the transform came out real and even, which is the general rule proved in Section 5.6. Note also that the transform is never zero: at $a=1$ and $\\omega=10^{6}$ it is still $2\\times10^{-12}$.']
]},

{t:'h2', num:'5.4', text:'The rectangular pulse, the sinc, and the inverse relation'},
{t:'ex', hd:'Example 5.5 — the rectangular pulse', rows:[
 ['Given','$x(t)=1$ for $|t|<T_1$ and 0 otherwise.'],
 ['Find','$X(j\\omega)$, its value at the origin, and its zeros.'],
 ['Method','The analysis integral runs from $-T_1$ to $T_1$ with the integrand $e^{-j\\omega t}$.'],
 ['Solution','$X(j\\omega)=\\left[\\dfrac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}=\\dfrac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}=\\dfrac{2\\sin(\\omega T_1)}{\\omega}$, using $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. The $j$ cancels, so the answer is real.'],
 ['Check','$X(j0)=2T_1$ by l’Hôpital, which is the area under the pulse: 2, 10 and 20 for $T_1=1,5,10$. The zeros are at $\\omega=\\pm k\\pi/T_1$ for $k=1,2,3,\\dots$ — the origin is excluded, because there the expression is $0/0$ and its limit is the peak.']
]},
{t:'box', hd:'The sinc convention used throughout', html:'This course writes $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$, the <b>unnormalised</b> sinc, with $\\operatorname{sinc}(0)=1$ and zeros at $\\pm\\pi,\\pm2\\pi,\\dots$ In that convention the result above reads $X(j\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)$. Signal-processing software and many communications texts use the <b>normalised</b> sinc, $\\operatorname{sinc}_{\\text{n}}(\\theta)=\\sin(\\pi\\theta)/(\\pi\\theta)$, whose zeros are at the integers; there the same result is $2T_1\\operatorname{sinc}_{\\text{n}}(\\omega T_1/\\pi)$. The two expressions are equal, and the argument is not: it differs by a factor of $\\pi$. An argument copied between the conventions agrees at the origin and is wrong everywhere else, so the convention is stated at every point of use.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax({w:225,h:180,xr:[-12,12],yr:[-0.75,2.35],xlabel:'\\omega',ylabel:'X',xtarget:3,pad:{l:44,r:14,t:28,b:34},yticksOverride:[0,1,2]});
   a.curve(w=>rectFT(w,1),{color:C.in,n:1600}); a.point(0,2,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=1$: peak 2.'},
 {svg:()=>{ const a=ax({w:225,h:180,xr:[-3,3],yr:[-3.7,11.6],xlabel:'\\omega',ylabel:'X',xtarget:3,pad:{l:48,r:14,t:28,b:34},yticksOverride:[0,5,10]});
   a.curve(w=>rectFT(w,5),{color:C.mid,n:1600}); a.point(0,10,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=5$: peak 10.'},
 {svg:()=>{ const a=ax({w:225,h:180,xr:[-1.6,1.6],yr:[-7.4,23.2],xlabel:'\\omega',ylabel:'X',xtarget:3,pad:{l:52,r:14,t:28,b:34},yticksOverride:[0,10,20]});
   a.curve(w=>rectFT(w,10),{color:C.out,n:1600}); a.point(0,20,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=10$: peak 20.'}
]},

{t:'ex', hd:'Example 5.6 — the ideal low-pass band', rows:[
 ['Given','$X(j\\omega)=1$ for $|\\omega|<W$ and 0 otherwise.'],
 ['Find','$x(t)$, its peak, and its zeros.'],
 ['Method','Synthesis from $-W$ to $W$, with the $1/2\\pi$ in front.'],
 ['Solution','$x(t)=\\dfrac{1}{2\\pi}\\displaystyle\\int_{-W}^{W}e^{j\\omega t}\\d\\omega=\\dfrac{e^{jWt}-e^{-jWt}}{2\\pi jt}=\\dfrac{\\sin(Wt)}{\\pi t}=\\dfrac{W}{\\pi}\\operatorname{sinc}(Wt)$.'],
 ['Check','$x(0)=W/\\pi$ by l’Hôpital: 0.5, 1 and 2 for $W=0.5\\pi,\\pi,2\\pi$. Zeros at $t=\\pm k\\pi/W$, $k=1,2,\\dots$, again with the origin excluded. This signal is not a pulse: it rings on both sides for ever, alternating in sign.']
]},
{t:'p', text:'The two examples are one statement seen twice: a rectangle in either domain is a sinc in the other. Section 5.7 gives that symmetry a name and a proof.'},

{t:'h3', text:'Narrow in time, wide in frequency'},
{t:'p', text:'The pulse of half-width $T_1$ has its first zero at $\\omega=\\pi/T_1$. Halve $T_1$ and that zero doubles. Taking the duration as the full width $T=2T_1$ and the bandwidth as the distance to the first null,'},
{t:'eq', tex:'T\\times\\text{BW}=2T_1\\cdot\\frac{\\pi}{T_1}=2\\pi\\qquad\\text{at every width}.'},
{t:'box', kind:'warn', hd:'Not a universal constant', html:'The product is invariant <b>within one shape</b>, because scaling in time divides the duration and multiplies every frequency by the same factor. Change the shape and the number changes: a triangular pulse of the same total duration has its first null at $2\\pi/T_1$, so its product is $4\\pi$. What is always true is the direction: narrowing a signal in time widens its spectrum, and the two cannot both be made small.'},
{t:'p', text:'One implication about band limitation is a theorem and its converse is not. A signal of finite duration cannot be band-limited: the pulse above has a sinc transform, which is non-zero on stretches reaching out to every frequency. But infinite duration guarantees nothing. The signal $e^{-a|t|}$ lasts for ever and its transform $2a/(a^{2}+\\omega^{2})$ is strictly positive at every finite frequency. Small is not zero, and Chapter 7 depends on the difference.'},

{t:'h2', num:'5.5', text:'Periodic signals, sinusoids and the impulse train'},
{t:'p', text:'A periodic signal has a Fourier series, and the series can be transformed term by term with $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$.'},
{t:'eqbox', cap:'Transform of a periodic signal',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longleftrightarrow\\;X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0)'],
 after:'The spectrum is a train of impulses at the harmonics, and the impulse at $k\\omega_0$ carries weight $2\\pi a_k$. The coefficient and the weight are different objects: $a_k$ multiplies a unit exponential, while $2\\pi a_k$ is an area under a spectrum. Reporting the coefficients as the transform loses a factor of $2\\pi$ at every harmonic.'},
{t:'p', text:'For the rectangular wave of Chapter 4 with $T_1=1$, the weights are $2\\pi a_k=2\\sin(k\\omega_0T_1)/k$ and the impulse at the origin carries $2\\pi a_0=4\\pi T_1/T$. Three periods make the sequence visible: $T=8T_1$ gives $\\omega_0=\\pi/4=0.392699$ and weight $1.5708$; $T=16T_1$ gives $\\omega_0=\\pi/8=0.196350$ and weight $0.7854$; $T=32T_1$ gives $\\omega_0=\\pi/16=0.098175$ and weight $0.3927$. Each doubling of the period halves the spacing and halves every weight, while the envelope does not move at all — which is the derivation of Section 5.1, carried out three steps at a time.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-4,4],yr:[-0.65,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',xtarget:7,yticksOverride:[0,0.5,1,1.5]});
  const w0=2*PI/8;
  for(let k=-11;k<=11;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9||Math.abs(k*w0)>4) continue;
    a.impulse(k*w0,wt,{color:C.in,label:false}); }
  a.curve(w=>w0*rectFT(w,1),{color:C.coral,width:1.3,dash:'4 5',n:1200});
  return a.svg(); },
  cap:'The square wave with $T=8T_1$: impulses of weight $2\\pi a_k$, sampling the dashed envelope. Some of the weights are negative, which a plot of $|a_k|$ would hide.'},

{t:'ex', hd:'Example 5.7 — a constant, a cosine and a sine', rows:[
 ['Given','$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$.'],
 ['Find','$X(j\\omega)$, drawn so that both size and phase can be read.'],
 ['Method','Expand each sinusoid with Euler’s relations and transform term by term.'],
 ['Solution','$4\\cos(3\\pi t)=2e^{j3\\pi t}+2e^{-j3\\pi t}$, so its transform is $4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)$: one impulse at each of $\\pm3\\pi$. Likewise $6\\sin(4\\pi t)=\\frac{6}{2j}\\left[e^{j4\\pi t}-e^{-j4\\pi t}\\right]$ gives $\\frac{6\\pi}{j}\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\delta(\\omega+4\\pi)$, with imaginary weights of modulus $6\\pi=18.849556$. The constant contributes $10\\pi\\delta(\\omega)$. Altogether $$X(j\\omega)=10\\pi\\delta(\\omega)+4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)+\\frac{6\\pi}{j}\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\delta(\\omega+4\\pi).$$'],
 ['Check','The signal is real, so the magnitude must be even in $\\omega$ and the phase odd. Magnitudes: $31.4159$ at 0, $12.5664$ at $\\pm3\\pi$, $18.8496$ at $\\pm4\\pi$. Phases: 0 except at $\\pm4\\pi$, where they are $\\mp\\pi/2$ because $1/j=-j$. A spectrum with only the positive-frequency impulse of a cosine fails this test at once, and describes a complex signal.']
]},
{t:'box', kind:'warn', hd:'Drawing a complex spectrum', html:'Three of these weights are real and two are imaginary. Drawing an imaginary weight as a downward arrow on the same axis as a real one uses the vertical direction for two meanings at once, and the figure stops being readable. Draw magnitude and phase, or real part and imaginary part, and say in the caption which pair is shown.'},

{t:'ex', hd:'Example 5.8 — the impulse train', rows:[
 ['Given','$x(t)=\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)$.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','The signal is periodic with $T_0=T$. Find $a_k$, then use the rule above.'],
 ['Solution','Over one period exactly one impulse is enclosed, and sifting evaluates the exponential at $t=0$, so $a_k=1/T$ for every $k$. Hence $$\\sum_{k}\\delta(t-kT)\\;\\longleftrightarrow\\;\\frac{2\\pi}{T}\\sum_{k}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right).$$'],
 ['Check','Spacing and weight are the same number, $2\\pi/T$: $6.2832$ for $T=1$ and $3.1416$ for $T=2$. Crowding the impulses in time spreads them in frequency. This one pair is the mechanism behind sampling, in Chapter 7. Note that the limits must enclose exactly one impulse; writing both as $-T/2$ encloses none.']
]},

{t:'h2', num:'5.6', text:'Properties'},
{t:'table', head:['Property','Statement'], rows:[
 ['Linearity','$a x_1+b x_2\\;\\leftrightarrow\\;a X_1+b X_2$'],
 ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)$'],
 ['Frequency shift','$e^{j\\omega_0t}x(t)\\;\\leftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)$'],
 ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;X^{*}(-j\\omega)$'],
 ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$'],
 ['Time scaling','$x(at)\\;\\leftrightarrow\\;\\frac{1}{|a|}X(j\\omega/a)$'],
 ['Differentiation','$\\d^{n}x/\\d t^{n}\\;\\leftrightarrow\\;(j\\omega)^{n}X(j\\omega)$'],
 ['Duality','$X(t)\\;\\leftrightarrow\\;2\\pi x(-\\omega)$'],
 ['Convolution','$x*h\\;\\leftrightarrow\\;X\\,H$'],
 ['Multiplication','$x\\,y\\;\\leftrightarrow\\;\\frac{1}{2\\pi}X*Y$'],
 ['Parseval','$\\int|x|^{2}\\d t=\\frac{1}{2\\pi}\\int|X|^{2}\\d\\omega$']
]},

{t:'h3', text:'Shifts'},
{t:'p', text:'For the time shift, substitute $\\tau=t-t_0$; the limits are infinite and do not move, and $e^{-j\\omega t_0}$ comes out of the integral. Since its modulus is 1, no magnitude changes at any frequency: a delay of $t_0$ seconds is exactly a linear phase of slope $-t_0$.'},
{t:'p', text:'For the frequency shift, start from the expression the property states, $e^{+j\\omega_0t}x(t)$, and combine the two exponentials before anything else. The exponent becomes $-j(\\omega-\\omega_0)t$, which is the analysis integral read at $\\omega-\\omega_0$, and no substitution is needed. The operand is a complex exponential in <b>time</b> with $\\omega_0$ fixed; the time-shift kernel $e^{-j\\omega t_0}$ has a fixed <b>time</b> and the opposite sign, and opening this proof with it proves a different statement.'},

{t:'h3', text:'Conjugation and the symmetry of a real signal'},
{t:'p', text:'Conjugating the analysis integral flips the sign of $j$ everywhere, which gives $x^{*}(t)\\leftrightarrow X^{*}(-j\\omega)$. If $x$ is real then $x^{*}=x$, so the two sides have the same transform and $X(-j\\omega)=X^{*}(j\\omega)$. Everything follows from that one line: the real part of $X$ is even, the imaginary part is odd, the magnitude is even and the phase is odd. A real and even signal has a real and even transform, since its imaginary part is both odd and even; a real and odd signal has a purely imaginary and odd transform.'},
{t:'box', kind:'warn', hd:'Real does not mean zero phase', html:'A real transform can be negative. Where $X(j\\omega)<0$ the magnitude is $-X$ and the phase is $\\pi$, not 0. Only a real and non-negative transform has zero phase everywhere, and the sinc of the rectangular pulse is the standing counterexample: it is real, and its side lobes are negative.'},

{t:'h3', text:'Differentiation'},
{t:'p', text:'Differentiate the <b>synthesis equation</b>, not the signal. On the right the only factor depending on $t$ is $e^{j\\omega t}$, and $\\omega$ is the variable of integration, so it is held fixed:'},
{t:'eq', tex:'\\frac{\\d}{\\d t}x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\bigl[j\\omega X(j\\omega)\\bigr]e^{j\\omega t}\\,\\d\\omega\\qquad\\Longrightarrow\\qquad \\frac{\\d^{n}x}{\\d t^{n}}\\;\\longleftrightarrow\\;(j\\omega)^{n}X(j\\omega).'},
{t:'box', kind:'err', hd:'The step to avoid', html:'Pulling $j\\omega$ out and writing $\\d x/\\d t=j\\omega\\,x(t)$ is false. $\\omega$ is the variable being integrated away, so it is not a constant and it is not available outside the integral, and $j\\omega x(t)$ is not a signal at all. One number settles it: for $x(t)=e^{-t^{2}}$, $\\d x/\\d t$ at $t=1$ is $-0.735759$, a real number, while $j\\omega x(t)$ at $t=1$, $\\omega=3$ is $1.103638j$. The boxed result is correct; only the route is wrong, and the same route reappears on integration and on differential equations, where it does change the answer.'},

{t:'h3', text:'Time scaling'},
{t:'p', text:'Substitute $\\tau=at$, so $t=\\tau/a$ and $\\d t=\\d\\tau/a$. For $a>0$ the limits keep their order and the coefficient is $1/a=1/|a|$. For $a<0$ the substitution sends $t\\to-\\infty$ to $\\tau\\to+\\infty$, so the limits arrive reversed; swapping them back costs one minus sign, and $-1/a=1/|a|$ for negative $a$. That is the only sign in the calculation.'},
{t:'box', kind:'err', hd:'Counting the flip twice', html:'Writing the reversed limits <b>and</b> an explicit $-1$ in front applies the same correction twice and gives $-\\frac{1}{|a|}X(j\\omega/a)$, contradicting the property. Do the flip once: reverse the limits, or write the minus, never both. The case $a=-1$ is time reversal, $x(-t)\\leftrightarrow X(-j\\omega)$, with coefficient 1.'},
{t:'p', text:'Worked instance. If $X(j\\omega)=1$ on $|\\omega|<2\\pi$, then $x(0.5t)\\leftrightarrow2X(j2\\omega)$, which is 2 on $|\\omega|<\\pi$, and $x(2t)\\leftrightarrow0.5X(j\\omega/2)$, which is 0.5 on $|\\omega|<4\\pi$. The three areas are $2\\cdot2\\pi$, $1\\cdot4\\pi$ and $0.5\\cdot8\\pi$, all $4\\pi$; since $\\int X\\d\\omega=2\\pi x(0)$, the value at $t=0$ is the same for all three, which is what a time scaling cannot change.'},

{t:'h2', num:'5.7', text:'Duality'},
{t:'p', text:'The two equations of the pair differ only by a sign and a factor, so any pair can be read a second time with the domains exchanged.'},
{t:'eqbox', cap:'Duality', tex:['x(t)\\;\\longleftrightarrow\\;X(j\\omega)\\qquad\\Longrightarrow\\qquad X(t)\\;\\longleftrightarrow\\;2\\pi\\,x(-\\omega)'],
 after:'The argument on the right is $-\\omega$, a real number, and not $-j\\omega$: the letter $x$ names a signal and a signal takes a real argument. The $j$ belongs to the frequency-domain function only, and duality is the point in the chapter where that distinction is most easily lost.'},
{t:'p', text:'Proof. Rename the variables of the synthesis equation, swapping $t$ and $\\omega$, to get $2\\pi x(\\omega)=\\int X(jt)e^{j\\omega t}\\d t$. Now replace $\\omega$ by $-\\omega$; the exponent becomes the analysis exponent and the left side becomes $2\\pi x(-\\omega)$, so the right side is $\\mathcal{F}\\{X(t)\\}$.'},
{t:'ex', hd:'Example 5.9 — duality on the rectangular pulse', rows:[
 ['Given','$x_1(t)=1$ on $|t|<W$, so $X_1(j\\omega)=2\\sin(W\\omega)/\\omega$.'],
 ['Find','The transform of $x_2(t)=2\\sin(Wt)/t$.'],
 ['Method','Recognise $x_2$ as $X_1$ read in time and apply duality; then confirm by an independent route.'],
 ['Solution','Duality gives $X_2(j\\omega)=2\\pi x_1(-\\omega)$, and $x_1$ is even, so $$X_2(j\\omega)=2\\pi\\ \\text{on}\\ |\\omega|<W,\\qquad 0\\ \\text{beyond}.$$'],
 ['Check','The second route works backwards: putting a band of height $2\\pi$ on $|\\omega|<W$ through the synthesis equation gives $\\frac{1}{2\\pi}\\int_{-W}^{W}2\\pi e^{j\\omega t}\\d\\omega=2\\sin(Wt)/t$, which is $x_2$. The two routes use different equations, so their agreement is a real check. At the origin, $X_2(j0)=2\\pi=6.283185$ for any $W$, and $x_2(0)=2W$ by l’Hôpital.']
]},
{t:'p', text:'Duality also carries properties across: the time-shift rule becomes the frequency-shift rule, and differentiation in time becomes differentiation in frequency. Every pair already derived gives a second one for nothing.'},

{t:'h2', num:'5.8', text:'Parseval’s relation'},
{t:'p', text:'Energy and power in this course are normalised, with $R=1\\,\\Omega$, so the instantaneous power is $|x(t)|^{2}$ and the energy is its integral, in joules.'},
{t:'eqbox', cap:'Parseval’s relation',
 tex:['E_{\\infty}=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega'],
 after:'The proof writes $|x|^{2}=x\\,x^{*}$, replaces $x^{*}$ by the conjugate of the synthesis equation and exchanges the two integrals; the inner one is then $X(j\\omega)$. The step actually used is $|x(t)|^{2}=x^{2}(t)$ for a real signal, not $|x(t)|=x(t)$, which is a stronger claim and fails wherever a real signal is negative. The quantity $|X(j\\omega)|^{2}$ is the energy spectral density: $\\frac{1}{2\\pi}|X|^{2}\\d\\omega$ is the energy in a narrow band.'},
{t:'ex', hd:'Example 5.10 — energy from a two-band spectrum', rows:[
 ['Given','$X_3(j\\omega)=2$ for $|\\omega|<2\\pi$, 1 for $2\\pi<|\\omega|<4\\pi$, and 0 beyond.'],
 ['Find','The total energy.'],
 ['Method','Parseval. The spectrum is piecewise constant, so square each height and multiply by its width.'],
 ['Solution','$E_{\\infty}=\\dfrac{1}{2\\pi}\\left[2\\pi+16\\pi+2\\pi\\right]=\\dfrac{20\\pi}{2\\pi}=10$ J. The inner band contributes $2^{2}\\cdot4\\pi=16\\pi$ and the two outer bands $1^{2}\\cdot2\\pi$ each.'],
 ['Check','Synthesis gives $x_3(t)=\\left[\\sin(2\\pi t)+\\sin(4\\pi t)\\right]/(\\pi t)$, and integrating $x_3^{2}$ over all time returns 10 J as well. Note that $\\frac{1}{2\\pi}\\int X_3\\d\\omega=6$, which is the peak $x_3(0)$ and not the energy: using the heights unsquared computes the wrong quantity correctly.']
]},
{t:'p', text:'The same relation on $e^{-at}u(t)$ is worth doing both ways. In time, $E_{\\infty}=\\int_{0}^{\\infty}e^{-2at}\\d t=1/(2a)$. In frequency, $\\frac{1}{2\\pi}\\int\\d\\omega/(a^{2}+\\omega^{2})=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{a}=1/(2a)$, using $\\int\\d u/(1+u^{2})=\\pi$ after $u=\\omega/a$. Without the $1/2\\pi$ the second route reports $2\\pi$ times too much.'},

{t:'h2', num:'5.9', text:'Convolution and multiplication'},
{t:'eqbox', cap:'The two dual properties',
 tex:['y(t)=x(t)*h(t)\\;\\longleftrightarrow\\;Y(j\\omega)=X(j\\omega)H(j\\omega)',
      'z(t)=x(t)\\,y(t)\\;\\longleftrightarrow\\;Z(j\\omega)=\\frac{1}{2\\pi}X(j\\omega)*Y(j\\omega)'],
 after:'The premise is stated with one set of symbols: $x\\leftrightarrow X$ is the input, $h\\leftrightarrow H$ the impulse response, $y$ the output. Convolution in time carries no factor; convolution in frequency carries $1/2\\pi$. $H(j\\omega)$ exists when $h$ is absolutely integrable, which for an LTI system is exactly bounded-input bounded-output stability, so an unstable system has no frequency response to plot.'},
{t:'p', text:'The proof of the first writes the convolution inside the analysis integral and exchanges the order; the inner bracket is then the time-shift property applied to $h$, and $H(j\\omega)$, not depending on $\\tau$, leaves the outer integral.'},

{t:'ex', hd:'Example 5.11 — two exponentials in cascade', rows:[
 ['Given','$x(t)=e^{-at}u(t)$ and $h(t)=e^{-bt}u(t)$, with $a,b>0$ and $a\\neq b$.'],
 ['Find','$y(t)=x*h$.'],
 ['Method','Multiply the transforms, split into simple fractions, invert term by term.'],
 ['Solution','$Y=\\dfrac{1}{(a+j\\omega)(b+j\\omega)}=\\dfrac{A}{a+j\\omega}+\\dfrac{B}{b+j\\omega}$ with $A=\\dfrac{1}{b-a}$ and $B=-A$, so $$y(t)=\\frac{e^{-at}-e^{-bt}}{b-a}\\,u(t).$$'],
 ['Check','$y(0)=0$, as a convolution of two causal signals must be. For $a=1$, $b=2$ the peak is at $t=\\ln2=0.693147$ with value exactly $1/4$. At $\\omega=0$: $|X|=1$, $|H|=0.5$ and $|Y|=0.5$, and the product of the first two is the third — the property itself at one frequency.']
]},
{t:'ex', hd:'Example 5.12 — ideal filters in cascade', rows:[
 ['Given','$X(j\\omega)=2$ on $|\\omega|\\le4\\pi$; an ideal low-pass system with $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$.'],
 ['Find','$Y(j\\omega)$, $y(t)$ and the three time-domain peaks.'],
 ['Method','Multiply the spectra frequency by frequency, then invert.'],
 ['Solution','Beyond $2\\pi$ the system contributes zero, so $Y=6$ on $|\\omega|\\le2\\pi$ and zero elsewhere; the narrower band decides. Inverting, $y(t)=6\\sin(2\\pi t)/(\\pi t)$.'],
 ['Check','Each peak is the area of its own band divided by $2\\pi$: $x(0)=8$, $h(0)=6$, $y(0)=12$. The output peak is the largest because a peak counts area, and $6\\times4\\pi$ exceeds $2\\times8\\pi$.']
]},

{t:'h2', num:'5.10', text:'Amplitude modulation'},
{t:'p', text:'Multiplying by a cosine of frequency $\\omega_c$, the carrier, convolves the spectrum with two impulses at once. The $1/2\\pi$ of the multiplication property and the $\\pi$ of each impulse combine into a factor $\\frac12$ on each copy.'},
{t:'eqbox', cap:'Double-sideband suppressed-carrier modulation',
 tex:['z(t)=x(t)\\cos(\\omega_ct)\\;\\longleftrightarrow\\;Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)'],
 after:'The spectrum is not moved to $\\omega_c$; it is <b>duplicated</b>, one copy at $+\\omega_c$ and one at $-\\omega_c$, each at half height. A description that says "the signal moved up to the carrier" loses the negative-frequency copy and the factor of one half in the same sentence.'},
{t:'p', text:'With $x(t)=\\cos(\\pi t)$ and carrier $\\cos(4\\pi t)$, the product-to-sum identity gives $\\frac12\\cos(5\\pi t)+\\frac12\\cos(3\\pi t)$, whose transform has impulses of weight $\\pi/2=1.570796$ at $\\pm3\\pi$ and $\\pm5\\pi$. The property gives the same four positions, $\\pm(\\omega_c\\pm\\omega_1)$. Nothing sits at $\\omega_c=4\\pi$ itself, which is what "suppressed carrier" records.'},
{t:'p', text:'With a band-limited signal the picture is cleaner. If $X=1$ on $|\\omega|<2\\pi$ and the carrier is $\\cos(4\\pi t)$, the copies occupy $2\\pi\\le|\\omega|\\le6\\pi$ at height $0.5$: the same width as the original band, at half the height, and twice as much of the axis occupied because there are now two of them.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:190,xr:[-26,26],yr:[-0.28,1.4],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Z(j\\omega)',xtarget:7,ytarget:2,yticksOverride:[0,0.5,1]});
  const f=w=>((Math.abs(w-4*PI)<2*PI)?0.5:0)+((Math.abs(w+4*PI)<2*PI)?0.5:0);
  a.area(f,-26,26,{color:'rgba(74,122,70,.13)'});
  a.curve(f,{color:C.out,n:4000});
  a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err});
  return a.svg(); },
  cap:'Two half-height copies on $2\\pi\\le|\\omega|\\le6\\pi$. The dashed lines mark $\\pm\\omega_c$, where nothing sits.'},
{t:'box', kind:'err', hd:'Two different events', html:'<b>Copies appear</b> whenever a signal is multiplied by a carrier. That happens at every carrier frequency and it loses nothing. <b>Copies overlap</b> only when the carrier is low enough for the shifted bands to reach each other. Overlap is what destroys information, because once two copies have been added there is no way to tell what each contributed. If a band on $\\pi\\le|\\omega|\\le3\\pi$ is modulated by $\\cos(2\\pi t)$, the two half-height copies both land on $|\\omega|\\le\\pi$ and add to 1 there, while only one reaches $3\\pi\\le|\\omega|\\le5\\pi$, where the height stays $0.5$. Chapter 7 asks the same question about the copies that sampling produces.'},
{t:'p', text:'Products of two band-limited signals follow the same arithmetic. Two rectangles of height $A$ and half-width $\\omega_0$ convolve to a triangle of apex $2A^{2}\\omega_0$ on $|\\omega|\\le2\\omega_0$; with the $1/2\\pi$, the transform of $\\left[\\sin(2\\pi t)/(\\pi t)\\right]^{2}$ is a triangle of apex 2 on $|\\omega|\\le4\\pi$, and the time-domain peak is $2^{2}=4$. With unequal half-widths $2\\pi$ and $4\\pi$ the result is a trapezoid of height 2, flat on $|\\omega|\\le2\\pi$ and zero beyond $6\\pi$, with time-domain peak $2\\times4=8$. The flat top is as wide as the difference of the two half-widths, and it shrinks to a point when they are equal.'},

{t:'h2', num:'5.11', text:'Systems described by a differential equation'},
{t:'p', text:'Transform both sides of a linear differential equation with constant coefficients. Linearity handles the sum and the differentiation property turns each $\\d^{k}/\\d t^{k}$ into $(j\\omega)^{k}$, so the equation becomes algebra.'},
{t:'eqbox', cap:'Frequency response from the coefficients',
 tex:['\\sum_{k=0}^{N}a_k\\frac{\\d^{k}y}{\\d t^{k}}=\\sum_{k=0}^{M}b_k\\frac{\\d^{k}x}{\\d t^{k}}\\quad\\Longrightarrow\\quad H(j\\omega)=\\frac{\\sum_{k=0}^{M}b_k(j\\omega)^{k}}{\\sum_{k=0}^{N}a_k(j\\omega)^{k}}'],
 after:'The frequency response is a ratio of two polynomials in $j\\omega$, read straight off the coefficients. The recipe is then: read $H$, multiply by $X$, split into simple fractions and invert with the table. It is worth writing $s=j\\omega$ while the algebra is done and changing back at the end; treating the two-character symbol $j\\omega$ as a single variable works but invites sign slips as soon as a derivative is needed.'},
{t:'ex', hd:'Example 5.13 — simple poles', rows:[
 ['Given','$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$, at rest.'],
 ['Find','$H(j\\omega)$ and $h(t)$.'],
 ['Method','Read the ratio off the coefficients, factor, split, invert.'],
 ['Solution','$H=\\dfrac{s+2}{s^{2}+4s+3}=\\dfrac{s+2}{(s+1)(s+3)}$ with $s=j\\omega$. Covering up $(s+1)$ and setting $s=-1$ gives $A=\\frac12$; covering up $(s+3)$ and setting $s=-3$ gives $B=\\frac12$. Hence $h(t)=\\left[\\frac12e^{-t}+\\frac12e^{-3t}\\right]u(t)$.'],
 ['Check','$H(j0)=2/3$, and $\\int_{0}^{\\infty}h\\,\\d t=\\frac12+\\frac16=\\frac23$. Also $h(0^{+})=1$. The poles are at $s=-1$ and $s=-3$, both with negative real part, so $h$ is absolutely integrable and $H$ was entitled to exist.']
]},
{t:'h3', text:'Repeated poles'},
{t:'p', text:'The cover-up rule assumes each factor of the denominator appears once. When a factor is repeated, one term is needed per power, and covering up reaches only the highest of them.'},
{t:'eqbox', cap:'Repeated-pole rule',
 tex:['F(s)=\\frac{N(s)}{(s-\\lambda)^{m}Q(s)},\\qquad c_{m-k}=\\frac{1}{k!}\\left.\\frac{\\d^{k}}{\\d s^{k}}\\Bigl[(s-\\lambda)^{m}F(s)\\Bigr]\\right|_{s=\\lambda}'],
 after:'$k=0$ is the cover-up rule and gives $c_m$; each further derivative peels off one more coefficient. The inverse transforms needed are $1/(s+a)\\leftrightarrow e^{-at}u(t)$ and $1/(s+a)^{2}\\leftrightarrow t\\,e^{-at}u(t)$: a repeated pole always brings a factor of $t$ into the time domain.'},
{t:'ex', hd:'Example 5.14 — a repeated pole, and the check that catches a sign', rows:[
 ['Given','The system of Example 5.13, with input $x(t)=e^{-t}u(t)$.'],
 ['Find','$y(t)$.'],
 ['Method','$Y=XH$, then partial fractions with $s=j\\omega$.'],
 ['Solution','$Y=\\dfrac{1}{s+1}\\cdot\\dfrac{s+2}{(s+1)(s+3)}=\\dfrac{s+2}{(s+1)^{2}(s+3)}$: the input pole coincides with a system pole, so $s=-1$ is now double. Then $B=\\left[(s+1)^{2}Y\\right]_{s=-1}=\\frac12$, $A=\\frac{\\d}{\\d s}\\left[(s+1)^{2}Y\\right]_{s=-1}=\\frac{1}{(s+3)^{2}}\\big|_{s=-1}=\\frac14$, and $C=\\left[(s+3)Y\\right]_{s=-3}=-\\frac14$. Hence $$y(t)=\\left[\\tfrac14e^{-t}+\\tfrac12t\\,e^{-t}-\\tfrac14e^{-3t}\\right]u(t).$$'],
 ['Check','$y(0)=\\frac14+0-\\frac14=0$, as a convolution of two causal signals must be. Assembling $C$ as $+\\frac14$ instead gives $y(0)=\\frac12$, which no causal convolution can. The two candidates agree to three decimals past $t=2$ — $0.168549$ against $0.169789$ — so only the value at the origin separates them. Convolving directly returns the same three terms with the same signs.']
]},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-0.4,4],yr:[-0.08,0.62],xlabel:'t',ylabel:'y(t)',xtarget:7,yticksOverride:[0,0.25,0.5]});
  a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)-0.25*Math.exp(-3*t),{color:C.out,width:2.4,n:2400});
  a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)+0.25*Math.exp(-3*t),{color:C.err,width:1.8,dash:'6 4',n:2400});
  a.point(0,0,{color:C.coral,r:4}); a.point(0,0.5,{color:C.err,r:4});
  return a.svg(); },
  cap:'The output with $C=-\\frac14$ and, dashed, the version with the sign lost. They are indistinguishable past $t=2$ and differ by $0.5$ at the origin.'},

{t:'h2', num:'5.12', text:'Summary'},
{t:'ul', items:[
 'Analysis integrates over $t$ and returns $X(j\\omega)$; synthesis integrates over $\\omega$, carries $1/2\\pi$, and returns $x(t)$.',
 'Finite energy <b>or</b> the Dirichlet conditions is enough; neither is necessary, and signals meeting neither have impulse spectra in the limiting sense.',
 'A periodic signal transforms to impulses of weight $2\\pi a_k$ at the harmonics — not to the coefficients themselves.',
 'The sinc convention here is $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, and it is stated at every point of use.',
 'A real signal has an even magnitude and an odd phase, and both halves of its spectrum are kept.',
 'Narrowing a signal in time widens its spectrum. Finite duration forbids band limitation; infinite duration guarantees nothing.',
 'Convolution in time is multiplication in frequency; multiplication in time is convolution in frequency, with $1/2\\pi$.',
 'A carrier makes two copies at half height. Copies always appear; overlap is a separate event and is what loses information.',
 'A differential equation gives $H(j\\omega)$ directly; a repeated pole needs the derivative rule, and a causal convolution must start at zero.'
]},
{t:'p', text:'Everything here was continuous time. A computer sees a sequence, not a signal, and the same question has to be asked again for $x[n]$. One thing changes and it changes everything: $e^{-j(\\omega+2\\pi)n}=e^{-j\\omega n}$ for every integer $n$, so a discrete-time spectrum repeats with period $2\\pi$. That is Chapter 6.'}
];
})();
