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
/* the sine integral Si(x), the integral of sin(u)/u from 0 to x: Simpson's rule
   near the origin, the asymptotic series beyond x = 12 */
const Si=x=>{
  if(x<0) return -Si(-x);
  if(x>12){ const x2=x*x;
    return PI/2-Math.cos(x)/x*(1-2/x2+24/(x2*x2))-Math.sin(x)/x2*(1-6/x2+120/(x2*x2)); }
  const n=80, h=x/n; let s=1+sincU(x);
  for(let i=1;i<n;i++) s+=(i%2?4:2)*sincU(i*h);
  return s*h/3; };
/* A frequency axis is read in multiples of pi. A tick number is part of the
   scale of the frame, so it stays plain; every axis name around it is typeset. */
const piTick=v=>{ const r=v/PI;
  if(Math.abs(r)<1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12,16]){ const num=r*den;
    if(Math.abs(num-Math.round(num))<1e-7){
      const k=Math.round(num), sg=k<0?'-':'', m=Math.abs(k);
      const head = m===1?'π':m+'π';
      return den===1 ? sg+head : sg+head+'/'+den; } }
  return P.fmt(v,2); };
const wTicks=(lo,hi,step)=>{const o=[];
  for(let k=Math.ceil(lo/step-1e-9);k<=hi/step+1e-9;k++) o.push(k*step); return o;};
/* the options of a frequency axis: range lo..hi, ticks every step, in pi form */
const W_=(lo,hi,step)=>({xr:[lo,hi],xticksOverride:wTicks(lo,hi,step),xtickfmt:piTick});
const WL='\\omega\\;[\\text{rad/s}]';

window.C5 = [
{t:'page'},

{t:'h1', num:'CHAPTER 5', text:'The continuous-time Fourier transform'},
{t:'p', lead:true, text:'The continuous-time Fourier transform describes a signal that does not repeat by a continuous function of frequency. To derive it, repeat a finite-duration signal with a period and let the period grow without bound. The harmonics crowd together, and the Fourier-series coefficients close onto one curve: the transform.'},
{t:'p', text:'The transform is useful for the same reason as the Fourier series. Convolution in time becomes multiplication in frequency, for every signal that has a transform. The frequency response of an LTI system still says what the system does to each frequency. The chapter follows six steps: the transform itself (5.1), the standard pairs (5.2), periodic signals (5.3), the properties (5.4), convolution and multiplication (5.5), and systems described by a differential equation (5.6). Section 5.7 collects the results.'},

/* =================================================== 5.1 */
{t:'h2', num:'5.1', text:'From series to transform'},
{t:'h3', text:'The periodic extension of a pulse'},
{t:'p', text:'Let $x(t)$ be zero for $|t|>T_1$. The number $T_1$ is the half-width of the support and belongs to the signal alone. Build a periodic signal $\\tilde{x}$ by repeating the pulse every $T$ seconds, with $T>2T_1$ so that the copies do not touch:'},
{t:'eq', tex:'\\tilde{x}(t)=\\sum_{m=-\\infty}^{\\infty}x(t-mT),\\qquad \\tilde{x}(t)=\\tilde{x}(t+T),\\qquad T>2T_1.'},
{t:'p', text:'The extension is periodic, so the Fourier series of Chapter 4 applies to it. Inside one period $\\tilde{x}$ equals the original pulse. The signal fixes $T_1$; only the period $T$ is ours to choose. Increase $T$ while keeping the central pulse fixed. The neighbouring copies move to larger values of $|t|$, and $\\tilde{x}(t)\\to x(t)$ for every $t$ as $T\\to\\infty$.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:180,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t\\;[\\text{s}]',ylabel:'\\tilde{x}(t)',ytarget:2,yticksOverride:[0,1]});
  a.curve(t=>rectPer(t,5,1),{color:C.mid,n:3000});
  a.span(0,5,1.2,'T',{color:C.coral,tex:true,fs:13});
  return a.svg(); },
  cap:'The periodic extension of the pulse $x(t)=1$ on $|t|<1$, with $T=5T_1$. The condition $T>2T_1$ keeps the copies apart.'},

{t:'h3', text:'The coefficients are samples of one curve'},
{t:'p', text:'Apply the analysis equation of Chapter 4 to $\\tilde{x}$ over one period. Inside that period $\\tilde{x}=x$, and outside $|t|<T_1$ the integrand is zero, so the limits may be opened to all of time:'},
{t:'eq', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\tilde{x}(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\int_{-\\infty}^{\\infty}x(t)e^{-jk\\omega_0t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T}.'},
{t:'p', text:'The right-hand integral has the same form for every $k$; only the frequency $k\\omega_0$ changes. Replace that frequency by the continuous variable $\\omega$ and define the transform.'},
{t:'eqbox', cap:'Definition of the transform', tex:['X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t,\\qquad T\\,a_k=X(jk\\omega_0)'],
 after:'$X(j\\omega)$ is defined for every real $\\omega$, not only at the harmonics. Every coefficient of the periodic extension is one point of the curve $X$, scaled by $1/T$. The curve is built from the pulse alone, so a larger $T$ cannot move it. A larger $T$ only makes the spacing $\\omega_0=2\\pi/T$ smaller. For the pulse of half-width $T_1=1$ and the period $T=8$, for example, $8a_0=X(j0)=2T_1=2$, and the same value holds at every period.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.9,2.35],xlabel:'\\omega',ylabel:'T a_k',yticksOverride:[0,1,2],yticksLeft:true},W_(-3*PI,3*PI,PI)));
   a.curve(w=>rectFT(w,1),{color:C.coral,width:1.4,dash:'4 5',n:1200});
   const w0=2*PI/4, st=[]; for(let k=-6;k<=6;k++) st.push([k*w0,4*aSq(k,4,1)]);
   a.stem(st,{color:C.in,r:3.2,showZero:true}); return a.svg(); }, cap:'$T=4T_1$.'},
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.9,2.35],xlabel:'\\omega',ylabel:'T a_k',yticksOverride:[0,1,2],yticksLeft:true},W_(-3*PI,3*PI,PI)));
   a.curve(w=>rectFT(w,1),{color:C.coral,width:1.4,dash:'4 5',n:1200});
   const w0=2*PI/16, st=[]; for(let k=-24;k<=24;k++) st.push([k*w0,16*aSq(k,16,1)]);
   a.stem(st,{color:C.mid,r:2.2,showZero:true}); return a.svg(); }, cap:'$T=16T_1$: the same dashed curve, sampled four times as finely.'}
]},

{t:'h3', text:'The sum becomes an integral'},
{t:'p', text:'Put $a_k=\\frac{1}{T}X(jk\\omega_0)$ back into the synthesis equation of Chapter 4. Then replace $1/T$ by $\\omega_0/2\\pi$, which is the definition $\\omega_0=2\\pi/T$ solved for $1/T$. Nothing has been approximated yet:'},
{t:'eq', tex:'\\begin{aligned}\\tilde{x}(t)&=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\\\&=\\sum_{k=-\\infty}^{\\infty}\\frac{1}{T}X(jk\\omega_0)\\,e^{jk\\omega_0t}\\\\&=\\frac{1}{2\\pi}\\sum_{k=-\\infty}^{\\infty}X(jk\\omega_0)\\,e^{jk\\omega_0t}\\,\\omega_0.\\end{aligned}'},
{t:'p', text:'Every term now contains the width $\\omega_0$, so the expression is a Riemann sum: a sum of strips of height $X(jk\\omega_0)e^{jk\\omega_0t}$ and width $\\omega_0$. Let $T\\to\\infty$. Then $\\tilde{x}(t)\\to x(t)$, the width $\\omega_0$ becomes $\\d\\omega$, the sample frequencies cover the whole frequency axis, and the sum becomes an integral.'},
{t:'fig', svg:()=>{
  const a=ax(Object.assign({w:700,h:190,yr:[-0.85,2.5],xlabel:WL,ylabel:'X(j\\omega)',yticksOverride:[0,1,2],yticksLeft:true},W_(-3*PI,3*PI,PI)));
  const w0=2*PI/6;
  for(let k=-8;k<=8;k++){ const wv=k*w0, hv=rectFT(wv,1); a.rect(wv-w0/2,0,wv+w0/2,hv,{fill:C.in+'2E',stroke:C.in,width:1}); }
  a.curve(w=>rectFT(w,1),{color:C.mid,width:2.4,n:1400});
  return a.svg(); },
  cap:'The strips of the sum for $T=6T_1$, each of height $X(jk\\omega_0)$ and width $\\omega_0=\\pi/3$. As the width shrinks, the strips fill the area under the curve.'},
{t:'eqbox', cap:'The continuous-time Fourier transform pair',
 tex:['X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t\\qquad\\text{(analysis)}',
      'x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega\\qquad\\text{(synthesis)}'],
 after:'Analysis integrates over $t$ and leaves a function of $\\omega$: a signal goes in and a spectrum comes out. Synthesis integrates over $\\omega$ and leaves a function of $t$: a spectrum goes in and a signal comes out. The factor $1/2\\pi$ arrived as $\\omega_0/2\\pi$ when the spacing was substituted, and it stays on the synthesis side. Without it, every value of the rebuilt signal would be $2\\pi$ times too large. The pair is written $x(t)\\leftrightarrow X(j\\omega)$, with the argument $j\\omega$ and never $\\omega$ alone.'},
{t:'box', kind:'warn', hd:'Which equation is which', html:'The variable of integration settles it. Integrating time away produces a spectrum, and that is analysis. Integrating frequency away produces a signal, and that is synthesis. The analysis exponent carries the minus sign; the synthesis exponent is positive and carries the $1/2\\pi$. The line $x(t)=\\int X(j\\omega)e^{-j\\omega t}\\,\\d\\omega$ therefore contains two errors: the factor $1/2\\pi$ is missing, and the exponent must be $+j\\omega t$.'},
{t:'p', text:'The case of a letter carries meaning. The small letter names the signal and takes $t$. The capital letter names its spectrum and takes $j\\omega$. In this course $X$ is the spectrum of a signal, and $H$ is the frequency response of a system.'},

{t:'h3', text:'When the transform exists'},
{t:'p', text:'Two conditions each guarantee that $X(j\\omega)$ exists. They are alternatives, joined by "or", and neither implies the other.'},
{t:'ol', items:[
 '<b>Condition A, finite energy.</b> $\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t<\\infty$.',
 '<b>Condition B, the Dirichlet conditions.</b> $x$ is absolutely integrable, $\\int_{-\\infty}^{\\infty}|x(t)|\\,\\d t<\\infty$, and has finitely many maxima, minima and finite jumps in any finite interval.'
]},
{t:'p', text:'Many signals meet both. The signal $e^{-2t}u(t)$ has area $\\int_{0}^{\\infty}e^{-2t}\\,\\d t=\\bigl[e^{-2t}/(-2)\\bigr]_{0}^{\\infty}=0-(-\\tfrac12)=\\tfrac12$ and energy $\\int_{0}^{\\infty}e^{-4t}\\,\\d t=\\bigl[e^{-4t}/(-4)\\bigr]_{0}^{\\infty}=\\tfrac14$; both are finite. That the conditions are independent is shown by one example each way. The signal $\\sin(t)/t$ has finite energy, but its modulus decays only like $1/|t|$, so its area diverges. The signal $1/\\sqrt{t}$ on $0<t<1$ has area $\\bigl[2\\sqrt{t}\\bigr]_{0}^{1}=2$, but its square is $1/t$, whose integral $\\bigl[\\ln t\\bigr]_{0}^{1}$ diverges at the lower limit.'},

{t:'h3', text:'Convergence at a jump'},
{t:'p', text:'The rectangular pulse $x(t)=1$ for $|t|<1$, and $0$ elsewhere, meets the Dirichlet conditions. Its transform is $X(j\\omega)=2\\sin\\omega/\\omega$ (Example 5.5 with $T_1=1$). Put this transform into the synthesis equation, but keep only the band $|\\omega|<W$. The question is what the result $x_W(t)$ does as $W$ grows, above all at the two jumps $t=\\pm1$.'},
{t:'eq', tex:'x_W(t)=\\frac{1}{2\\pi}\\int_{-W}^{W}\\frac{2\\sin\\omega}{\\omega}\\,e^{j\\omega t}\\,\\d\\omega.'},
{t:'p', text:'Write $e^{j\\omega t}=\\cos(\\omega t)+j\\sin(\\omega t)$. The factor $2\\sin\\omega/\\omega$ is even in $\\omega$. Its product with the odd function $\\sin(\\omega t)$ is odd, so that part integrates to zero over the symmetric band. Its product with $\\cos(\\omega t)$ is even, so that integral is twice the integral over $0<\\omega<W$. Then the identity $\\sin\\alpha\\cos\\beta=\\tfrac12\\sin(\\alpha+\\beta)+\\tfrac12\\sin(\\alpha-\\beta)$, with $\\alpha=\\omega$ and $\\beta=\\omega t$, splits the integrand in two:'},
{t:'eq', tex:'\\begin{aligned}x_W(t)&=\\frac{1}{2\\pi}\\int_{-W}^{W}\\frac{2\\sin\\omega}{\\omega}\\cos(\\omega t)\\,\\d\\omega\\\\&=\\frac{2}{\\pi}\\int_{0}^{W}\\frac{\\sin\\omega\\,\\cos(\\omega t)}{\\omega}\\,\\d\\omega\\\\&=\\frac{1}{\\pi}\\int_{0}^{W}\\frac{\\sin\\bigl(\\omega(1+t)\\bigr)+\\sin\\bigl(\\omega(1-t)\\bigr)}{\\omega}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'Each term becomes the sine integral $\\operatorname{Si}(z)=\\int_{0}^{z}\\frac{\\sin u}{u}\\,\\d u$ after one substitution. In the first term put $u=\\omega(1+t)$, so $\\d u/u=\\d\\omega/\\omega$, and the limits $\\omega=0$ and $\\omega=W$ become $u=0$ and $u=W(1+t)$. The second term is the same with $1-t$ in place of $1+t$. The function $\\operatorname{Si}$ is odd, so $\\operatorname{Si}\\bigl(W(1-t)\\bigr)=-\\operatorname{Si}\\bigl(W(t-1)\\bigr)$:'},
{t:'eq', tex:'x_W(t)=\\frac{1}{\\pi}\\Bigl[\\operatorname{Si}\\bigl(W(t+1)\\bigr)-\\operatorname{Si}\\bigl(W(t-1)\\bigr)\\Bigr].'},
{t:'p', text:'$\\operatorname{Si}(z)$ rises from $0$, overshoots, and settles at $\\pi/2$ as $z\\to\\infty$. Its largest value is at $z=\\pi$, where $\\operatorname{Si}(\\pi)=1.851937$. Three facts follow.'},
{t:'ol', items:[
 '<b>Away from the jumps, $x_W\\to x$.</b> For $|t|<1$, $W(t+1)\\to+\\infty$ and $W(t-1)\\to-\\infty$, so $x_W\\to\\frac{1}{\\pi}\\bigl[\\frac{\\pi}{2}+\\frac{\\pi}{2}\\bigr]=1$. For $|t|>1$ both arguments have the same sign, and the two terms cancel in the limit: $x_W\\to0$.',
 '<b>At a jump, $x_W$ tends to the midpoint.</b> At $t=1$, $x_W(1)=\\frac{1}{\\pi}\\bigl[\\operatorname{Si}(2W)-\\operatorname{Si}(0)\\bigr]=\\frac{1}{\\pi}\\operatorname{Si}(2W)\\to\\frac{1}{\\pi}\\cdot\\frac{\\pi}{2}=\\frac12$.',
 '<b>The overshoot does not shrink.</b> Just inside the jump, at $t=1-\\pi/W$, the arguments are $W(t-1)=-\\pi$ and $W(t+1)=2W-\\pi$. For large $W$ the second is large, so $x_W\\approx\\frac{1}{\\pi}\\bigl[\\frac{\\pi}{2}+\\operatorname{Si}(\\pi)\\bigr]=\\frac12+\\frac{1.851937}{\\pi}=1.0895$. The peak moves towards the jump, a distance of about $\\pi/W$ away, but its height tends to $1.0895$, not to $1$.'
]},
{t:'p', text:'The energy of the error still goes to zero. By Parseval’s relation (Section 5.4) the error $x-x_W$ has energy $\\frac{1}{2\\pi}\\int_{|\\omega|>W}|X(j\\omega)|^{2}\\,\\d\\omega$, which is the tail of a finite integral and tends to $0$. So the overshoot keeps its height while the energy of the error vanishes. The partial sums of a Fourier series behave the same way at a jump (Chapter 4).'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:340,h:190,xr:[-2.5,2.5],yr:[-0.3,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'x_W(t)',yticksOverride:[0,0.5,1],yticksLeft:true,xtarget:5});
   a.hline(1.0895,{color:C.coral}); a.curve(t=>rectp(t,1),{color:C.in,dash:'7 5',width:1.6,n:2400});
   a.curve(t=>(Si(12*(t+1))-Si(12*(t-1)))/PI,{color:C.out,n:3000}); return a.svg(); },
  cap:'$W=12$ rad/s. The highest value is $1.096$.'},
 {svg:()=>{ const a=ax({w:340,h:190,xr:[-2.5,2.5],yr:[-0.3,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'x_W(t)',yticksOverride:[0,0.5,1],yticksLeft:true,xtarget:5});
   a.hline(1.0895,{color:C.coral}); a.curve(t=>rectp(t,1),{color:C.in,dash:'7 5',width:1.6,n:2400});
   a.curve(t=>(Si(48*(t+1))-Si(48*(t-1)))/PI,{color:C.out,n:4000}); return a.svg(); },
  cap:'$W=48$ rad/s. The ripples crowd to the jumps; the highest value is $1.089$.'}
]},
{t:'p', text:'In both panels the dashed pulse is $x(t)$ and the fine dashed line marks $1.0895$. At small $W$ the ripples from the two jumps overlap and push the highest value a little above $1.0895$.'},

{t:'h3', text:'Transforms in the limit'},
{t:'p', text:'Neither condition is necessary. A constant, a complex exponential and every periodic signal have infinite energy and infinite area, so they fail both conditions. They still have spectra, in the limiting sense: the transform is an impulse, defined by what it does inside an integral, exactly as $\\delta(t)$ is. Every property of this chapter still applies to such a transform.'},
{t:'p', text:'Take the pair $e^{-a|t|}\\leftrightarrow2a/(a^{2}+\\omega^{2})$ from Example 5.4 and let $a\\to0$. The signal tends to the constant $1$. The transform grows tall at $\\omega=0$, where it equals $2a/a^{2}=2/a$, and narrow, since it falls to half that height at $\\omega=\\pm a$. For $a=0.5$ the peak is already $4$. Its area does not depend on $a$ at all:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}\\frac{2a}{a^{2}+\\omega^{2}}\\,\\d\\omega&=\\Bigl[2\\tan^{-1}\\!\\frac{\\omega}{a}\\Bigr]_{-\\infty}^{\\infty}\\\\&=2\\Bigl(\\frac{\\pi}{2}\\Bigr)-2\\Bigl(-\\frac{\\pi}{2}\\Bigr)=2\\pi.\\end{aligned}'},
{t:'p', text:'A curve of fixed area $2\\pi$ that becomes tall and narrow tends to an impulse of weight $2\\pi$. So $1\\leftrightarrow2\\pi\\delta(\\omega)$.'},
{t:'fig', svg:()=>{
  const a=ax(Object.assign({w:700,h:190,yr:[-0.8,8.8],xlabel:WL,ylabel:'X(j\\omega)',yticksOverride:[0,2,4,8],yticksLeft:true},W_(-2*PI,2*PI,PI/2)));
  [[1,C.in],[0.5,C.mid],[0.25,C.out]].forEach(([av,col])=>{ a.curve(w=>2*av/(av*av+w*w),{color:col,n:3000}); a.point(0,2/av,{color:C.coral,r:3.6}); });
  return a.svg(); },
  cap:'The transform $2a/(a^{2}+\\omega^{2})$ for $a=1$, $0.5$ and $0.25$, with peaks $2$, $4$ and $8$. Every curve has area $2\\pi$.'},

/* =================================================== 5.2 */
{t:'page'},
{t:'h2', num:'5.2', text:'The standard pairs'},
{t:'p', text:'Most problems start from a few standard pairs. A property of Section 5.4 then turns a standard pair into the transform that is needed. This section derives the pairs.'},

{t:'ex', hd:'Example 5.1 — the impulse and the shifted impulse', rows:[
 ['Given','$x(t)=\\delta(t)$, and then $x(t)=\\delta(t-t_0)$ with $t_0$ a fixed time.'],
 ['Find','$X(j\\omega)$ in both cases, with magnitude and phase.'],
 ['Method','The signal is an impulse, so the sifting property evaluates the analysis integral directly. Substitute the impulse into the analysis equation.'],
 ['Solution','Substitute $x(t)=\\delta(t)$ into the analysis equation. The sifting property $\\int\\delta(t)g(t)\\,\\d t=g(0)$ evaluates the exponential at $t=0$: $$\\begin{aligned}\\mathcal{F}\\{\\delta(t)\\}&=\\int_{-\\infty}^{\\infty}\\delta(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=e^{-j\\omega\\cdot0}=1.\\end{aligned}$$ Every frequency is present, equally, with no phase. For the shifted impulse the sifting happens at $t=t_0$, because $\\delta(t-t_0)$ is zero everywhere except at that instant: $$\\begin{aligned}\\mathcal{F}\\{\\delta(t-t_0)\\}&=\\int_{-\\infty}^{\\infty}\\delta(t-t_0)\\,e^{-j\\omega t}\\,\\d t\\\\&=e^{-j\\omega t_0}.\\end{aligned}$$ Write this in polar form: $e^{-j\\omega t_0}$ has modulus 1 and angle $-\\omega t_0$, so $$|X(j\\omega)|=1,\\qquad\\angle X(j\\omega)=-\\omega t_0.$$'],
 ['Check','Push $e^{-j\\omega t_0}$ back through the synthesis equation. Combine the two exponentials first: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}e^{-j\\omega t_0}\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}e^{j\\omega(t-t_0)}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\cdot2\\pi\\,\\delta(t-t_0)=\\delta(t-t_0).\\end{aligned}$$ The last line uses $\\int e^{j\\omega\\tau}\\,\\d\\omega=2\\pi\\delta(\\tau)$, which is the pair $1\\leftrightarrow2\\pi\\delta(\\omega)$ of Section 5.1 with the roles of $t$ and $\\omega$ exchanged. Reading: moving a signal in time changes no magnitude; it turns each frequency component by an angle proportional to its frequency.']
]},

{t:'ex', hd:'Example 5.2 — one impulse in frequency', rows:[
 ['Given','$X(j\\omega)=2\\pi\\delta(\\omega-\\omega_0)$.'],
 ['Find','$x(t)$.'],
 ['Method','The spectrum is an impulse, so use the synthesis equation and apply sifting in the variable $\\omega$.'],
 ['Solution','Substitute the spectrum into the synthesis equation. The impulse sits at $\\omega=\\omega_0$, so sifting evaluates $e^{j\\omega t}$ there: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{2\\pi}{2\\pi}\\int_{-\\infty}^{\\infty}\\delta(\\omega-\\omega_0)\\,e^{j\\omega t}\\,\\d\\omega\\\\&=e^{j\\omega_0t}.\\end{aligned}$$ The $2\\pi$ of the impulse weight and the $1/2\\pi$ of the synthesis equation cancel exactly. That is why the weight is written as $2\\pi$ and not as 1.'],
 ['Check','$|x(t)|=1$ and $\\angle x(t)=\\omega_0t$. With an impulse of weight 1 the answer would be $\\frac{1}{2\\pi}e^{j\\omega_0t}$, which is not a unit-amplitude exponential. The factor sets the amplitude.']
]},
{t:'eqbox', cap:'Two consequences of the complex-exponential pair',
 tex:['e^{j\\omega_0t}\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0),\\qquad 1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)'],
 after:'The second is the first at $\\omega_0=0$, and it agrees with the limit taken in Section 5.1.'},

{t:'ex', hd:'Example 5.3 — the one-sided exponential', rows:[
 ['Given','$x(t)=e^{-at}u(t)$, with $a$ a real constant.'],
 ['Find','$X(j\\omega)$, the condition on $a$, and the magnitude and phase.'],
 ['Method','The unit step makes the signal zero for negative time. Apply the analysis equation from 0 to $\\infty$, and evaluate the antiderivative at both limits.'],
 ['Solution','Substitute the signal into the analysis equation. The step $u(t)$ is zero for $t<0$ and 1 for $t>0$, so the lower limit becomes 0 and the step disappears. Then combine the two exponentials into one: $$\\begin{aligned}X(j\\omega)&=\\int_{-\\infty}^{\\infty}e^{-at}u(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\,\\d t.\\end{aligned}$$ The integrand is an exponential in $t$ with constant coefficient $-(a+j\\omega)$, so its antiderivative is the same exponential divided by that coefficient: $$\\begin{aligned}X(j\\omega)&=\\left[\\frac{e^{-(a+j\\omega)t}}{-(a+j\\omega)}\\right]_{0}^{\\infty}\\\\&=\\frac{1}{-(a+j\\omega)}\\Bigl[\\lim_{t\\to\\infty}e^{-(a+j\\omega)t}-e^{0}\\Bigr]\\\\&=\\frac{1}{-(a+j\\omega)}\\bigl[0-1\\bigr]=\\frac{1}{a+j\\omega}.\\end{aligned}$$ The limit at the upper end is zero only when $a>0$: $|e^{-(a+j\\omega)t}|=e^{-at}|e^{-j\\omega t}|=e^{-at}$, because $|e^{-j\\omega t}|=1$, and $e^{-at}\\to0$ needs $a>0$. For $a\\le0$ the integral does not converge and the transform does not exist. So $$e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega},\\qquad a>0.$$ For the magnitude, the modulus of a quotient is the quotient of the moduli, and $|a+j\\omega|=\\sqrt{a^{2}+\\omega^{2}}$: $$|X(j\\omega)|=\\frac{|1|}{|a+j\\omega|}=\\frac{1}{\\sqrt{a^{2}+\\omega^{2}}}.$$ For the phase, the angle of a quotient is the angle of the numerator minus the angle of the denominator. The number $a+j\\omega$ has real part $a>0$ and imaginary part $\\omega$, so its angle is $\\tan^{-1}(\\omega/a)$: $$\\angle X(j\\omega)=\\angle1-\\angle(a+j\\omega)=0-\\tan^{-1}(\\omega/a)=-\\tan^{-1}(\\omega/a).$$'],
 ['Check','The magnitude is largest at $\\omega=0$, where $|X(j0)|=1/a$: $5$, $1$ and $0.2$ for $a=0.2$, $1$ and $5$. A small $a$ decays slowly in time and gives a tall, narrow spectrum; a large $a$ decays fast and gives a low, wide one. For $a=2$, $|X(j2)|=1/\\sqrt{4+4}=1/(2\\sqrt2)=0.353553$. At $a=1$ the phase is $-\\tan^{-1}1=-\\pi/4=-0.785398$ rad at $\\omega=1$, and $-\\tan^{-1}\\sqrt3=-\\pi/3=-1.047198$ rad at $\\omega=\\sqrt3$. Both are negative, and the phase curve falls from $+\\pi/2$ to $-\\pi/2$. A curve that rises belongs to $+\\tan^{-1}(\\omega/a)$, which is the angle of $a+j\\omega$, the reciprocal of the answer.']
]},
{t:'box', kind:'warn', hd:'Where that minus sign is lost', html:'The numerator is the real number 1, so its angle is zero, and it is tempting to skip that term and copy $\\tan^{-1}(\\omega/a)$ straight out of the denominator. What is then reported is $\\angle(a+j\\omega)$, the angle of the reciprocal of the answer. Write the subtraction out, including the term that is zero.'},
{t:'fig', svg:()=>{
  const a=ax(Object.assign({w:700,h:200,yr:[-1.85,1.85],xlabel:WL,ylabel:'\\angle X(j\\omega)\\;[\\text{rad}]',
    yticksOverride:[-1.5708,-0.7854,0,0.7854,1.5708],ytickfmt:v=>v.toFixed(2),yticksLeft:true},W_(-4*PI,4*PI,PI)));
  [[0.2,C.in],[1,C.mid],[5,C.out]].forEach(([av,col])=>a.curve(w=>-Math.atan(w/av),{color:col,n:2000}));
  a.point(1,-PI/4,{color:C.coral,r:4});
  return a.svg(); },
  cap:'The phase of $1/(a+j\\omega)$ for $a=0.2$ (steepest), $1$ and $5$ (flattest). The marked value is $-\\pi/4$ at $a=\\omega=1$.'},

{t:'ex', hd:'Example 5.4 — the two-sided exponential', rows:[
 ['Given','$x(t)=e^{-a|t|}$ with $a>0$.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','The absolute value gives different exponential formulas for negative and positive time. Split the analysis integral at $t=0$; on the negative-time interval $|t|=-t$ and the exponent is $+at$.'],
 ['Solution','For $t<0$ the signal is $e^{-a(-t)}=e^{at}$, and for $t>0$ it is $e^{-at}$. Split the analysis integral at $t=0$ and combine the exponentials in each part: $$\\begin{aligned}X(j\\omega)&=\\int_{-\\infty}^{0}e^{at}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{0}e^{(a-j\\omega)t}\\,\\d t+\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\,\\d t.\\end{aligned}$$ The second integral is Example 5.3 and equals $1/(a+j\\omega)$. Evaluate the first with its antiderivative. At the lower end, $|e^{(a-j\\omega)t}|=e^{at}\\to0$ as $t\\to-\\infty$ because $a>0$: $$\\begin{aligned}\\int_{-\\infty}^{0}e^{(a-j\\omega)t}\\,\\d t&=\\left[\\frac{e^{(a-j\\omega)t}}{a-j\\omega}\\right]_{-\\infty}^{0}\\\\&=\\frac{e^{0}-0}{a-j\\omega}=\\frac{1}{a-j\\omega}.\\end{aligned}$$ Add the two fractions over the common denominator $(a-j\\omega)(a+j\\omega)=a^{2}-(j\\omega)^{2}=a^{2}+\\omega^{2}$: $$\\begin{aligned}X(j\\omega)&=\\frac{1}{a-j\\omega}+\\frac{1}{a+j\\omega}\\\\&=\\frac{(a+j\\omega)+(a-j\\omega)}{(a-j\\omega)(a+j\\omega)}\\\\&=\\frac{2a}{a^{2}+\\omega^{2}},\\qquad a>0.\\end{aligned}$$ The imaginary parts $+j\\omega$ and $-j\\omega$ cancelled in the numerator, so the transform is real.'],
 ['Check','$X(j0)=2a/a^{2}=2/a$ gives 4, 2 and 0.4 for $a=0.5$, $1$ and $5$. The signal is real and even, and the transform came out real and even, which is the general rule proved in Section 5.4. The transform is never zero: at $a=1$ and $\\omega=10^{6}$ it is still $2/(1+10^{12})\\approx2\\times10^{-12}$.']
]},

{t:'ex', hd:'Example 5.5 — the rectangular pulse', rows:[
 ['Given','$x(t)=1$ for $|t|<T_1$ and 0 otherwise.'],
 ['Find','$X(j\\omega)$, its value at the origin, and its zeros.'],
 ['Method','The signal is non-zero only on $-T_1<t<T_1$, so restrict the analysis integral to that support and integrate $e^{-j\\omega t}$. Then use $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$.'],
 ['Solution','Substitute the pulse into the analysis equation. Outside $|t|<T_1$ the signal is zero, so those parts of the integral contribute nothing, and inside the signal equals 1: $$X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t=\\int_{-T_1}^{T_1}1\\cdot e^{-j\\omega t}\\,\\d t.$$ For $\\omega\\neq0$ the antiderivative of $e^{-j\\omega t}$ is $e^{-j\\omega t}/(-j\\omega)$. Evaluate at the two limits, then move the minus sign of the denominator into the numerator by swapping the two terms: $$\\begin{aligned}X(j\\omega)&=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}\\\\&=\\frac{e^{-j\\omega T_1}-e^{j\\omega T_1}}{-j\\omega}\\\\&=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}.\\end{aligned}$$ Euler gives $e^{j\\theta}-e^{-j\\theta}=(\\cos\\theta+j\\sin\\theta)-(\\cos\\theta-j\\sin\\theta)=2j\\sin\\theta$. With $\\theta=\\omega T_1$: $$X(j\\omega)=\\frac{2j\\sin(\\omega T_1)}{j\\omega}=\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1),$$ with the unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. The $j$ cancels, so the answer is real. At $\\omega=0$ the integrand is 1 and the integral is the width $2T_1$ directly.'],
 ['Check','At the origin the formula reads $0/0$. L’Hôpital, differentiating numerator and denominator with respect to $\\omega$, gives $\\lim_{\\omega\\to0}2T_1\\cos(\\omega T_1)/1=2T_1$. This agrees with the direct value and is the area under the pulse: 2, 10 and 20 for $T_1=1$, $5$ and $10$. The zeros are where $\\sin(\\omega T_1)=0$ with $\\omega\\neq0$, that is $\\omega T_1=\\pm k\\pi$, so $$\\omega=\\pm\\frac{k\\pi}{T_1},\\qquad k=1,2,3,\\dots$$ The origin is excluded, because there the limit is the peak, not a zero. Writing $k\\in\\mathbb{Z}$ would call the peak a zero.']
]},
{t:'box', hd:'The sinc convention used throughout', html:'This course writes $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$, the <b>unnormalised</b> sinc, with $\\operatorname{sinc}(0)=1$ and zeros at $\\theta=\\pm\\pi,\\pm2\\pi,\\dots$ In that convention the pulse pair reads $X(j\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)$. Signal-processing software and many texts use the <b>normalised</b> sinc, $\\sin(\\pi\\theta)/(\\pi\\theta)$, whose first positive zero is at $\\theta=1$ and whose zeros are the non-zero integers. There the same pair is written with the argument $\\omega T_1/\\pi$. The two expressions are equal, but the arguments differ by a factor of $\\pi$. An argument copied between the conventions agrees at the origin and is wrong everywhere else, so the convention is stated at every point of use. The peak $X(j0)=2T_1$ is the same in either convention.'},
{t:'p', text:'The part of the spectrum on $|\\omega|<\\pi/T_1$ is the <b>main lobe</b>; its width is $2\\pi/T_1$. Beyond it the <b>side lobes</b> alternate in sign and shrink like $1/|\\omega|$, because $|2\\sin(\\omega T_1)/\\omega|\\le2/|\\omega|$. For $T_1=1$ the first side lobe has its extreme where the derivative of $\\sin\\omega/\\omega$ is zero, that is where $\\tan\\omega=\\omega$, at $\\omega=4.493409$; there $X=2\\sin(4.493409)/4.493409=-0.434467$.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax(Object.assign({w:225,h:180,yr:[-0.75,2.35],xlabel:'\\omega',ylabel:'X',pad:{l:44,r:14,t:28,b:34},yticksOverride:[0,1,2],yticksLeft:true},W_(-4*PI,4*PI,2*PI)));
   a.curve(w=>rectFT(w,1),{color:C.in,n:1600});
   for(let k=1;k<=3;k++){ a.point(k*PI,0,{color:C.err,r:3}); a.point(-k*PI,0,{color:C.err,r:3}); }
   a.point(0,2,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=1$: peak 2, zeros at $\\pm\\pi,\\pm2\\pi,\\dots$'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:180,yr:[-3.7,11.6],xlabel:'\\omega',ylabel:'X',pad:{l:48,r:14,t:28,b:34},yticksOverride:[0,5,10],yticksLeft:true},W_(-PI,PI,PI/2)));
   a.curve(w=>rectFT(w,5),{color:C.mid,n:1600}); a.point(0,10,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=5$: peak 10.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:180,yr:[-7.4,23.2],xlabel:'\\omega',ylabel:'X',pad:{l:52,r:14,t:28,b:34},yticksOverride:[0,10,20],yticksLeft:true},W_(-PI/2,PI/2,PI/4)));
   a.curve(w=>rectFT(w,10),{color:C.out,n:1600}); a.point(0,20,{color:C.coral,r:3.4}); return a.svg(); }, cap:'$T_1=10$: peak 20.'}
]},

{t:'ex', hd:'Example 5.6 — the ideal low-pass band', rows:[
 ['Given','$X(j\\omega)=1$ for $|\\omega|<W$ and 0 otherwise: the <b>ideal low-pass band</b>, with band edge $W$ in rad/s.'],
 ['Find','$x(t)$, its peak, and its zeros.'],
 ['Method','The spectrum is given and is non-zero only on $-W<\\omega<W$, so apply the synthesis equation over those limits and keep the factor $1/2\\pi$.'],
 ['Solution','Substitute the spectrum into the synthesis equation. Outside $|\\omega|<W$ it is zero, and inside it equals 1: $$x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega t}\\,\\d\\omega.$$ Here $t$ is a fixed parameter and $\\omega$ is the variable, so for $t\\neq0$ the antiderivative of $e^{j\\omega t}$ is $e^{j\\omega t}/(jt)$: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}\\\\&=\\frac{e^{jWt}-e^{-jWt}}{2\\pi jt}\\\\&=\\frac{2j\\sin(Wt)}{2\\pi jt}\\\\&=\\frac{\\sin(Wt)}{\\pi t}.\\end{aligned}$$ The third line is Euler again, $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ with $\\theta=Wt$; the $2j$ then cancels against the $2\\pi j$. With the unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, multiply and divide by $W$: $$x(t)=\\frac{W}{\\pi}\\cdot\\frac{\\sin(Wt)}{Wt}=\\frac{W}{\\pi}\\operatorname{sinc}(Wt).$$'],
 ['Check','At $t=0$ the synthesis integral is $\\frac{1}{2\\pi}\\int_{-W}^{W}1\\,\\d\\omega=\\frac{2W}{2\\pi}=\\frac{W}{\\pi}$. L’Hôpital on $\\sin(Wt)/(\\pi t)$ gives $\\lim_{t\\to0}W\\cos(Wt)/\\pi=W/\\pi$ as well: 0.5, 1 and 2 for $W=0.5\\pi$, $\\pi$ and $2\\pi$. The zeros are where $\\sin(Wt)=0$ with $t\\neq0$: $t=\\pm k\\pi/W$, $k=1,2,\\dots$, again with the origin excluded. This signal is not a pulse: it rings on both sides of the origin for ever, alternating in sign.']
]},
{t:'p', text:'Examples 5.5 and 5.6 are one statement seen twice: a rectangle in either domain is a sinc in the other. Section 5.4 gives that symmetry a name, duality, and a proof.'},

{t:'h3', text:'Narrow in time, wide in frequency'},
{t:'p', text:'Name the measures first. Take the full duration $T=2T_1$ of the pulse and its <b>first-null bandwidth</b> $\\text{BW}=\\pi/T_1$ rad/s, the distance from the origin to the first zero. Halve $T_1$ and the first zero doubles. The product does not depend on the width:'},
{t:'eq', tex:'T\\times\\text{BW}=2T_1\\cdot\\frac{\\pi}{T_1}=2\\pi\\qquad\\text{at every width}.'},
{t:'p', text:'For $T_1=1$ the product is $2\\times\\pi$; for $T_1=1/4$ it is $0.5\\times4\\pi$. The pulse made four times narrower has a spectrum four times wider and four times lower.'},
{t:'box', kind:'warn', hd:'The value depends on the waveform', html:'The product is fixed for scaled versions of one waveform, because time scaling changes duration and frequency width by reciprocal factors (Section 5.4). It is not one constant for all shapes. A triangular pulse of the same total duration $2T_1$ has the transform $T_1\\operatorname{sinc}^{2}(\\omega T_1/2)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, because that triangle is the convolution of two rectangles of half-width $T_1/2$ and convolution multiplies transforms (Section 5.5). Its first null is where $\\omega T_1/2=\\pi$, that is at $\\omega=2\\pi/T_1$, so its product is $2T_1\\cdot2\\pi/T_1=4\\pi$. In general, narrowing a signal in time widens its spectrum; both widths cannot be made arbitrarily small.'},

{t:'h3', text:'Time limitation and band limitation'},
{t:'p', text:'A signal is <b>band-limited</b> when $X(j\\omega)=0$ for every $|\\omega|>W$, for some finite $W$. Small is not enough; the spectrum must be exactly zero. The signal $\\sin(3t)/(\\pi t)$ is band-limited: by Example 5.6 with $W=3$, its transform is 1 for $|\\omega|<3$ and 0 beyond.'},
{t:'eq', tex:'\\text{finite duration}\\;\\Longrightarrow\\;\\text{not band-limited}.'},
{t:'p', text:'This implication is a theorem. Read backwards, it says that a band-limited signal cannot have finite duration. The pulse of Example 5.5 illustrates it: its duration is finite, and its sinc transform is non-zero at arbitrarily high frequencies. The converse is false: infinite duration guarantees nothing. The signal $e^{-|t|}$ lasts for ever, and its transform $2/(1+\\omega^{2})$ is strictly positive at every finite frequency; at $\\omega=10^{6}$ it is about $2\\times10^{-12}$, small but not zero. Chapter 7 depends on this difference.'},

/* =================================================== 5.3 */
{t:'h2', num:'5.3', text:'Periodic signals'},
{t:'p', text:'A periodic signal has a Fourier series, and the series can be transformed term by term. Linearity moves the transform inside the sum and past each constant $a_k$. Each term is then a complex exponential at frequency $k\\omega_0$, and Example 5.2 gives its transform, $e^{jk\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-k\\omega_0)$:'},
{t:'eq', tex:'\\begin{aligned}X(j\\omega)&=\\mathcal{F}\\Bigl\\{\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\Bigr\\}\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\,\\mathcal{F}\\{e^{jk\\omega_0t}\\}\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\cdot2\\pi\\,\\delta(\\omega-k\\omega_0).\\end{aligned}'},
{t:'eqbox', cap:'Transform of a periodic signal',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longleftrightarrow\\;X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0),\\qquad\\omega_0=\\frac{2\\pi}{T_0}'],
 after:'The spectrum is a train of impulses at the harmonics $k\\omega_0$, and the impulse at $k\\omega_0$ carries weight $2\\pi a_k$. The coefficient and the weight are different objects: $a_k$ multiplies a unit exponential, while $2\\pi a_k$ is the area of an impulse in a spectrum. Reporting the coefficients as the transform loses a factor of $2\\pi$ at every harmonic. A constant $x(t)=3$, for example, has $a_0=3$ and an impulse of weight $2\\pi a_0=6\\pi$ at $\\omega=0$.'},

{t:'ex', hd:'Example 5.7 — the line spectrum of a square wave', rows:[
 ['Given','The rectangular wave of Chapter 4: value 1 on $|t|<T_1$ in each period $T$, with $T_1=1$, for $T=8T_1$, $16T_1$ and $32T_1$.'],
 ['Find','The impulse weights, the spacing, and the weight at $\\omega=0$ for each period.'],
 ['Method','Take the coefficients $a_k$ of the rectangular wave from Chapter 4. Multiply each by $2\\pi$ and place an impulse at $k\\omega_0$.'],
 ['Solution','The coefficients are $a_0=2T_1/T$ and $a_k=\\sin(k\\omega_0T_1)/(k\\pi)$ for $k\\neq0$. Multiply by $2\\pi$; the $\\pi$ in $a_k$ cancels against the $2\\pi$: $$\\begin{aligned}2\\pi a_k&=2\\pi\\cdot\\frac{\\sin(k\\omega_0T_1)}{k\\pi}=\\frac{2\\sin(k\\omega_0T_1)}{k},\\\\2\\pi a_0&=2\\pi\\cdot\\frac{2T_1}{T}=\\frac{4\\pi T_1}{T}.\\end{aligned}$$ With $T_1=1$, the spacing is $\\omega_0=2\\pi/T$ and the weight at the origin is $4\\pi/T$: $$\\begin{aligned}T=8T_1:&\\quad\\omega_0=\\pi/4=0.785398,\\quad2\\pi a_0=\\pi/2=1.5708,\\\\T=16T_1:&\\quad\\omega_0=\\pi/8=0.392699,\\quad2\\pi a_0=\\pi/4=0.7854,\\\\T=32T_1:&\\quad\\omega_0=\\pi/16=0.196350,\\quad2\\pi a_0=\\pi/8=0.3927.\\end{aligned}$$ Each doubling of the period halves the spacing and halves every weight.'],
 ['Check','For $T=8T_1$ the weights are $2\\sin(k\\pi/4)/k$. At $k=\\pm4$ and $\\pm8$ the sine is $\\sin(\\pm\\pi)=0$ or $\\sin(\\pm2\\pi)=0$, so those impulses vanish. The weights are even in $k$. For $k=5,6,7$ the angle $k\\pi/4$ lies between $\\pi$ and $2\\pi$, so the sine is negative, and the impulses at $k=\\pm5,\\pm6,\\pm7$ point down. A plot of $|a_k|$ would hide both facts. The weights sit on the envelope $\\omega_0\\cdot2\\sin(\\omega T_1)/\\omega$, whose shape does not change with $T$: this is the derivation of Section 5.1, carried out three times.']
]},
{t:'fig', svg:()=>{
  const a=ax(Object.assign({w:700,h:200,yr:[-0.65,1.85],xlabel:WL,ylabel:'X(j\\omega)',yticksOverride:[0,0.5,1,1.5],yticksLeft:true},W_(-5*PI/4,5*PI/4,PI/4)));
  const w0=2*PI/8;
  for(let k=-5;k<=5;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9) continue;
    a.impulse(k*w0,wt,{color:C.in,label:false}); }
  a.curve(w=>w0*rectFT(w,1),{color:C.coral,width:1.3,dash:'4 5',n:1200});
  return a.svg(); },
  cap:'The square wave with $T=8T_1$: impulses of weight $2\\pi a_k$ at $k\\pi/4$ sample the dashed envelope. The impulse at $\\pm\\pi$ is missing and those at $\\pm5\\pi/4$ point down.'},

{t:'ex', hd:'Example 5.8 — the line spectrum of a cosine', rows:[
 ['Given','$x(t)=4\\cos(3\\pi t)$.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','A cosine is a sum of two complex exponentials. Expand it with Euler’s relation and transform each exponential with $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$.'],
 ['Solution','Euler’s relation $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ with $\\theta=3\\pi t$ gives $$4\\cos(3\\pi t)=4\\cdot\\tfrac12\\bigl(e^{j3\\pi t}+e^{-j3\\pi t}\\bigr)=2e^{j3\\pi t}+2e^{-j3\\pi t}.$$ Transform each exponential and multiply by its coefficient: $$\\begin{aligned}\\mathcal{F}\\{4\\cos(3\\pi t)\\}&=2\\cdot2\\pi\\,\\delta(\\omega-3\\pi)+2\\cdot2\\pi\\,\\delta(\\omega+3\\pi)\\\\&=4\\pi\\,\\delta(\\omega-3\\pi)+4\\pi\\,\\delta(\\omega+3\\pi).\\end{aligned}$$'],
 ['Check','There are two impulses, one at $+3\\pi$ and one at $-3\\pi$, each of weight $4\\pi=12.5664$. In the language of the Fourier series, $a_{\\pm1}=2$ and each weight is $2\\pi a_{\\pm1}=4\\pi$. For a cosine of unit amplitude the same steps give $\\cos(\\omega_0t)\\leftrightarrow\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$.']
]},

{t:'page'},
{t:'ex', hd:'Example 5.9 — the line spectrum of a sine', rows:[
 ['Given','$x(t)=6\\sin(4\\pi t)$.'],
 ['Find','$X(j\\omega)$, and whether its weights are real or imaginary.'],
 ['Method','As in Example 5.8, with Euler’s relation for the sine, $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$.'],
 ['Solution','With $\\theta=4\\pi t$: $$6\\sin(4\\pi t)=\\frac{6}{2j}\\,e^{j4\\pi t}-\\frac{6}{2j}\\,e^{-j4\\pi t}=\\frac{3}{j}\\,e^{j4\\pi t}-\\frac{3}{j}\\,e^{-j4\\pi t}.$$ Transform each exponential and multiply by its coefficient: $$\\begin{aligned}\\mathcal{F}\\{6\\sin(4\\pi t)\\}&=\\frac{3}{j}\\cdot2\\pi\\,\\delta(\\omega-4\\pi)-\\frac{3}{j}\\cdot2\\pi\\,\\delta(\\omega+4\\pi)\\\\&=\\frac{6\\pi}{j}\\,\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\,\\delta(\\omega+4\\pi).\\end{aligned}$$ Since $1/j=-j$, the weights are $-j6\\pi$ at $+4\\pi$ and $+j6\\pi$ at $-4\\pi$: imaginary, of modulus $6\\pi=18.8496$, with opposite signs on the two sides.'],
 ['Check','The signal is real, so its transform must satisfy $X(-j\\omega)=X^{*}(j\\omega)$ (Section 5.4). The weight at $-4\\pi$ is $j6\\pi$, and the conjugate of the weight at $+4\\pi$ is $(-j6\\pi)^{*}=j6\\pi$. They agree. A spectrum with only the impulse at $+4\\pi$ would belong to a complex signal.']
]},

{t:'ex', hd:'Example 5.10 — a constant, a cosine and a sine', rows:[
 ['Given','$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$.'],
 ['Find','$X(j\\omega)$, drawn so that both size and phase can be read.'],
 ['Method','Linearity: transform the three terms separately and add. The constant is the case $\\omega_0=0$ of Example 5.2; the other two terms are Examples 5.8 and 5.9.'],
 ['Solution','The constant gives $5\\cdot2\\pi\\,\\delta(\\omega)=10\\pi\\,\\delta(\\omega)$. Add the results of Examples 5.8 and 5.9: $$\\begin{aligned}X(j\\omega)=10\\pi\\delta(\\omega)&+4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)\\\\&+\\frac{6\\pi}{j}\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\delta(\\omega+4\\pi).\\end{aligned}$$'],
 ['Check','The signal is real, so the magnitude must be even in $\\omega$ and the phase odd. Magnitudes: $10\\pi=31.4159$ at 0, $4\\pi=12.5664$ at $\\pm3\\pi$, and $6\\pi=18.8496$ at $\\pm4\\pi$. Phases: 0 except at $\\pm4\\pi$, where they are $\\mp\\pi/2$ because $1/j=-j$. Both conditions hold.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:340,h:190,xr:[-5*PI,5*PI],xticksOverride:[-4*PI,-3*PI,0,3*PI,4*PI],xtickfmt:piTick,yr:[-3,36],xlabel:'\\omega',ylabel:'|X(j\\omega)|',
     yticksOverride:[12.566,18.850,31.416],ytickfmt:v=>v.toFixed(2),yticksLeft:true,pad:{l:60,r:18,t:28,b:34}});
   a.impulse(0,10*PI,{color:C.in,label:false});
   [3*PI,-3*PI].forEach(w=>a.impulse(w,4*PI,{color:C.in,label:false}));
   [4*PI,-4*PI].forEach(w=>a.impulse(w,6*PI,{color:C.in,label:false})); return a.svg(); },
  cap:'The magnitude, even in $\\omega$. It cannot tell the cosine from the sine.'},
 {svg:()=>{ const a=ax({w:340,h:190,xr:[-5*PI,5*PI],xticksOverride:[-4*PI,-3*PI,0,3*PI,4*PI],xtickfmt:piTick,yr:[-2.1,2.1],xlabel:'\\omega',ylabel:'\\angle X(j\\omega)',
     yticksOverride:[-1.5708,1.5708],ytickfmt:v=>v.toFixed(2),yticksLeft:true,pad:{l:60,r:18,t:28,b:34}});
   a.stem([[-4*PI,PI/2],[-3*PI,0],[0,0],[3*PI,0],[4*PI,-PI/2]],{color:C.mid,r:3.6,showZero:true}); return a.svg(); },
  cap:'The phase in rad, odd in $\\omega$. It separates the sine from the cosine.'}
]},
{t:'box', kind:'warn', hd:'Drawing a complex spectrum', html:'Three weights are real and two are imaginary. One vertical axis cannot represent both signed real values and signed imaginary values. Plot magnitude and phase, or plot real part and imaginary part, and name the chosen pair in the caption.'},

{t:'ex', hd:'Example 5.11 — the impulse train', rows:[
 ['Given','$x(t)=\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)$, one unit impulse every $T$ seconds.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','The signal is periodic, so its transform is an impulse at each harmonic. Find its Fourier-series coefficients $a_k$ over a period that holds exactly one impulse, then give each impulse the weight $2\\pi a_k$.'],
 ['Solution','The signal repeats every $T$, so $\\omega_0=2\\pi/T$. Apply the analysis equation of the Fourier series over the period $-T/2<t<T/2$. That interval encloses exactly one impulse, the one at $t=0$, so inside it the signal is just $\\delta(t)$, and sifting evaluates the exponential at $t=0$: $$\\begin{aligned}a_k&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\sum_{m}\\delta(t-mT)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T}e^{0}=\\frac{1}{T}\\qquad\\text{for every }k.\\end{aligned}$$ Now use the transform of a periodic signal: each harmonic $k\\omega_0=2\\pi k/T$ carries an impulse of weight $2\\pi a_k=2\\pi/T$: $$\\begin{aligned}X(j\\omega)&=\\sum_{k}2\\pi a_k\\,\\delta(\\omega-k\\omega_0)\\\\&=\\sum_{k}\\frac{2\\pi}{T}\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right).\\end{aligned}$$ Hence $$\\sum_{k}\\delta(t-kT)\\;\\longleftrightarrow\\;\\frac{2\\pi}{T}\\sum_{k}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right).$$'],
 ['Check','Spacing and weight are the same number, $2\\pi/T$: $6.2832$ for $T=1$ and $3.1416$ for $T=2$. Spreading the impulses twice as far apart in time brings them twice as close in frequency and makes them half as tall. This one pair is the mechanism behind sampling, in Chapter 7. The limits must enclose exactly one impulse; writing both as $-T/2$ encloses none.']
]},

/* =================================================== 5.4 */
{t:'h2', num:'5.4', text:'Properties'},
{t:'p', text:'Each property below says what one operation on a signal does to its transform. Each one is proved from the analysis or the synthesis equation. With the properties, one standard pair serves a whole family of signals. Section 5.7 collects them in one table.'},

{t:'h3', text:'Linearity and time shift'},
{t:'p', text:'The analysis equation is an integral, and integration is linear, so $a\\,x_1(t)+b\\,x_2(t)\\leftrightarrow a\\,X_1(j\\omega)+b\\,X_2(j\\omega)$ for any constants $a$ and $b$.'},
{t:'p', text:'For the time shift, put $x(t-t_0)$ into the analysis equation and substitute $\\tau=t-t_0$, so $t=\\tau+t_0$ and $\\d t=\\d\\tau$. The limits are infinite and do not move, because $\\tau\\to\\pm\\infty$ exactly when $t\\to\\pm\\infty$. Then split the exponential and take the factor that does not depend on $\\tau$ outside:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(t-t_0)\\}&=\\int_{-\\infty}^{\\infty}x(t-t_0)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega(\\tau+t_0)}\\,\\d\\tau\\\\&=e^{-j\\omega t_0}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau\\\\&=e^{-j\\omega t_0}X(j\\omega).\\end{aligned}'},
{t:'p', text:'The last integral is the analysis equation with $\\tau$ as the dummy variable, so it is $X(j\\omega)$. Since $|e^{-j\\omega t_0}|=1$, no magnitude changes at any frequency. A delay of $t_0$ seconds adds the linear phase $-\\omega t_0$: a delay of 2 s changes the phase at $\\omega=1$ rad/s by $-2$ rad.'},

{t:'ex', hd:'Example 5.12 — a sum of shifted pulses', rows:[
 ['Given','$x_1(t)=1$ on $|t|<2$ and $x_2(t)=1$ on $|t|<1$, both zero elsewhere, and $x_3(t)=2x_1(t-4)+x_2(t-3)$.'],
 ['Find','$X_3(j\\omega)$ and $X_3(j0)$.'],
 ['Method','Transform each pulse with Example 5.5. Apply the time shift to each, then add with linearity.'],
 ['Solution','Example 5.5 with $T_1=2$ and $T_1=1$ gives $$X_1(j\\omega)=\\frac{2\\sin(2\\omega)}{\\omega},\\qquad X_2(j\\omega)=\\frac{2\\sin\\omega}{\\omega}.$$ The time shift gives $x_1(t-4)\\leftrightarrow e^{-j4\\omega}X_1(j\\omega)$ and $x_2(t-3)\\leftrightarrow e^{-j3\\omega}X_2(j\\omega)$. Linearity adds them with their coefficients: $$X_3(j\\omega)=2e^{-j4\\omega}\\,\\frac{2\\sin(2\\omega)}{\\omega}+e^{-j3\\omega}\\,\\frac{2\\sin\\omega}{\\omega}.$$'],
 ['Check','At $\\omega=0$ the analysis equation reads $X(j0)=\\int x(t)\\,\\d t$, the area. Here $e^{0}=1$, $X_1(j0)=2T_1=4$ and $X_2(j0)=2$, so $X_3(j0)=2\\cdot4+2=10$. In time, $x_1(t-4)$ is 1 on $2<t<6$ and $x_2(t-3)$ is 1 on $2<t<4$. So $x_3$ is $2+1=3$ on $2<t<4$ and $2$ on $4<t<6$, with area $3\\cdot2+2\\cdot2=10$. The two values agree.']
]},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:170,xr:[-1,8],yr:[-0.35,3.7],xlabel:'t\\;[\\text{s}]',ylabel:'x_3(t)',yticksOverride:[0,1,2,3],xtarget:9});
  a.area(t=>2*rectp(t-4,2)+rectp(t-3,1),-1,8,{color:C.in+'24',n:900});
  a.curve(t=>2*rectp(t-4,2)+rectp(t-3,1),{color:C.in,n:3000});
  return a.svg(); },
  cap:'$x_3(t)$ is $3$ on $2<t<4$ and $2$ on $4<t<6$. The shaded area is $10$.'},

{t:'h3', text:'Frequency shift'},
{t:'p', text:'Start from the expression the property states, $e^{+j\\omega_0t}x(t)$, where $\\omega_0$ is a fixed frequency. Combine the two exponentials before anything else. The exponent becomes $-j(\\omega-\\omega_0)t$, which is the analysis integral read at $\\omega-\\omega_0$, and no substitution is needed:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{e^{j\\omega_0t}x(t)\\}&=\\int_{-\\infty}^{\\infty}e^{j\\omega_0t}x(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\omega_0)t}\\,\\d t\\\\&=X\\bigl(j(\\omega-\\omega_0)\\bigr).\\end{aligned}'},
{t:'p', text:'The whole spectrum moves by $\\omega_0$. If $Y(j\\omega)=1$ on $|\\omega|<2\\pi$, then $e^{j\\pi t}y(t)$ has its band on $-\\pi<\\omega<3\\pi$. The operand is a complex exponential in <b>time</b> with a fixed frequency $\\omega_0$. The time-shift factor $e^{-j\\omega t_0}$ has a fixed <b>time</b> and multiplies the spectrum; opening this proof with it proves a different statement.'},

{t:'h3', text:'Conjugation and the symmetry of a real signal'},
{t:'p', text:'Conjugation. The conjugate of an integral is the integral of the conjugate, and conjugating a product conjugates each factor. The conjugate of $e^{-j\\omega t}$ is $e^{+j\\omega t}$, which is the analysis kernel evaluated at $-\\omega$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x^{*}(t)\\}&=\\int_{-\\infty}^{\\infty}x^{*}(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{+j\\omega t}\\,\\d t\\Bigr]^{*}\\\\&=\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(-\\omega)t}\\,\\d t\\Bigr]^{*}=\\bigl[X(-j\\omega)\\bigr]^{*}=X^{*}(-j\\omega).\\end{aligned}'},
{t:'p', text:'Time reversal. Put $x(-t)$ into the analysis equation and substitute $\\tau=-t$, so $t=-\\tau$ and $\\d t=-\\d\\tau$. As $t$ runs from $-\\infty$ to $\\infty$, $\\tau$ runs from $\\infty$ to $-\\infty$, so the limits arrive reversed. Swapping them back absorbs the minus sign of $\\d t=-\\d\\tau$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(-t)\\}&=\\int_{-\\infty}^{\\infty}x(-t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{\\infty}^{-\\infty}x(\\tau)\\,e^{-j\\omega(-\\tau)}\\,(-\\d\\tau)\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(-\\omega)\\tau}\\,\\d\\tau=X(-j\\omega).\\end{aligned}'},
{t:'p', text:'A real signal. If $x$ is real then $x^{*}(t)=x(t)$, so the two sides of the conjugation property have the same transform: $X(j\\omega)=X^{*}(-j\\omega)$, or, conjugating both sides, $X(-j\\omega)=X^{*}(j\\omega)$. Everything follows from that one line. Write $X(j\\omega)=R(\\omega)+jI(\\omega)$ with $R$ and $I$ real. Then $X(-j\\omega)=R(-\\omega)+jI(-\\omega)$ and $X^{*}(j\\omega)=R(\\omega)-jI(\\omega)$. Equating real parts and imaginary parts gives $R(-\\omega)=R(\\omega)$ and $I(-\\omega)=-I(\\omega)$: the real part of $X$ is even and the imaginary part is odd. Taking modulus and angle of the same equation, $|X(-j\\omega)|=|X^{*}(j\\omega)|=|X(j\\omega)|$ and $\\angle X(-j\\omega)=\\angle X^{*}(j\\omega)=-\\angle X(j\\omega)$: the magnitude is even and the phase is odd. For example, if $x$ is real and $X(j2)=3-4j$, then $X(-j2)=3+4j$.'},
{t:'p', text:'A real and even signal. Evenness gives $x(-t)=x(t)$, so by time reversal $X(-j\\omega)=X(j\\omega)$. Realness gives $X(-j\\omega)=X^{*}(j\\omega)$. Together, $X(j\\omega)=X^{*}(j\\omega)$, so $X$ is real; and $X(-j\\omega)=X(j\\omega)$ says it is even. A real and odd signal has $x(-t)=-x(t)$, so $X(-j\\omega)=-X(j\\omega)$. With $X(-j\\omega)=X^{*}(j\\omega)$ this gives $X^{*}(j\\omega)=-X(j\\omega)$, so $X$ is purely imaginary, and odd.'},
{t:'box', kind:'warn', hd:'Real does not mean zero phase', html:'A real transform can be negative. Where $X(j\\omega)<0$ the magnitude is $-X$ and the phase is $\\pi$, not 0. Only a real and non-negative transform has zero phase everywhere. The sinc of the rectangular pulse is the standard counterexample: it is real, and its side lobes are negative in turn.'},

{t:'h3', text:'Even and odd parts'},
{t:'p', text:'For a real signal, transform the even part $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ by linearity. Time reversal gives $x(-t)\\leftrightarrow X(-j\\omega)$, and for a real signal $X(-j\\omega)=X^{*}(j\\omega)$. Adding a complex number to its conjugate leaves twice the real part:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{\\Ev\\{x\\}\\}&=\\tfrac12\\bigl[X(j\\omega)+X(-j\\omega)\\bigr]=\\tfrac12\\bigl[X(j\\omega)+X^{*}(j\\omega)\\bigr]=\\operatorname{Re}\\{X(j\\omega)\\},\\\\\\mathcal{F}\\{\\Od\\{x\\}\\}&=\\tfrac12\\bigl[X(j\\omega)-X(-j\\omega)\\bigr]=\\tfrac12\\bigl[X(j\\omega)-X^{*}(j\\omega)\\bigr]=j\\operatorname{Im}\\{X(j\\omega)\\}.\\end{aligned}'},
{t:'p', text:'The second line uses $X-X^{*}=2j\\operatorname{Im}\\{X\\}$. Splitting a real signal into even and odd parts splits its spectrum into real and imaginary parts. The two symmetry rules above are the cases in which one part is absent: a real, odd signal has no even part, so $X=j\\operatorname{Im}\\{X\\}$ is imaginary and odd. Check it on $x(t)=e^{-at}u(t)$. Its even part is $\\tfrac12[e^{-at}u(t)+e^{at}u(-t)]=\\tfrac12e^{-a|t|}$, and its odd part is $\\tfrac12[e^{-at}u(t)-e^{at}u(-t)]=\\tfrac12\\operatorname{sgn}(t)e^{-a|t|}$. Transform each part from the pairs already found. The second uses $e^{at}u(-t)\\leftrightarrow1/(a-j\\omega)$, which is Example 5.3 reversed in time. Then compare with the real and imaginary parts of $1/(a+j\\omega)$, obtained by multiplying numerator and denominator by $a-j\\omega$:'},
{t:'eq', tex:'\\begin{aligned}\\tfrac12e^{-a|t|}&\\;\\longleftrightarrow\\;\\tfrac12\\cdot\\frac{2a}{a^{2}+\\omega^{2}}=\\frac{a}{a^{2}+\\omega^{2}},\\\\\\tfrac12\\operatorname{sgn}(t)e^{-a|t|}&\\;\\longleftrightarrow\\;\\tfrac12\\Bigl[\\frac{1}{a+j\\omega}-\\frac{1}{a-j\\omega}\\Bigr]=\\tfrac12\\cdot\\frac{-2j\\omega}{a^{2}+\\omega^{2}}=\\frac{-j\\omega}{a^{2}+\\omega^{2}},\\\\\\frac{1}{a+j\\omega}&=\\frac{a-j\\omega}{(a+j\\omega)(a-j\\omega)}=\\frac{a}{a^{2}+\\omega^{2}}+j\\,\\frac{-\\omega}{a^{2}+\\omega^{2}}.\\end{aligned}'},
{t:'p', text:'The even part gives exactly $\\operatorname{Re}\\{1/(a+j\\omega)\\}$ and the odd part gives exactly $j\\operatorname{Im}\\{1/(a+j\\omega)\\}$, as the property says.'},

{t:'page'},
{t:'h3', text:'Differentiation in frequency'},
{t:'p', text:'Differentiate the analysis integral with respect to $\\omega$. Now $t$ is the variable of integration and is held fixed, and the derivative of $e^{-j\\omega t}$ with respect to $\\omega$ is $-jt\\,e^{-j\\omega t}$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d X(j\\omega)}{\\d\\omega}&=\\int_{-\\infty}^{\\infty}x(t)\\,\\frac{\\partial}{\\partial\\omega}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}\\bigl[-jt\\,x(t)\\bigr]e^{-j\\omega t}\\,\\d t=\\mathcal{F}\\{-jt\\,x(t)\\}.\\end{aligned}'},
{t:'p', text:'So $\\d X/\\d\\omega$ is the transform of $-jt\\,x(t)$. Multiply both sides by $j$ and use $j\\cdot(-j)=1$: $j\\,\\d X/\\d\\omega=\\mathcal{F}\\{t\\,x(t)\\}$, which is the property $t\\,x(t)\\leftrightarrow j\\,\\d X(j\\omega)/\\d\\omega$. It gives the pair for $te^{-at}u(t)$ from the pair for $e^{-at}u(t)$ without another transform integral. Write $1/(a+j\\omega)=(a+j\\omega)^{-1}$ and use the chain rule, with $\\d(a+j\\omega)/\\d\\omega=j$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{te^{-at}u(t)\\}&=j\\,\\frac{\\d}{\\d\\omega}\\Bigl[\\frac{1}{a+j\\omega}\\Bigr]=j\\cdot\\frac{-1\\cdot j}{(a+j\\omega)^{2}}\\\\&=\\frac{-j^{2}}{(a+j\\omega)^{2}}=\\frac{1}{(a+j\\omega)^{2}},\\qquad a>0.\\end{aligned}'},
{t:'p', text:'Check it at $\\omega=0$ with $a=1$. The pair gives $1/(1+j0)^{2}=1$. The area of $te^{-t}u(t)$, by parts with the antiderivative $-(t+1)e^{-t}$, is $\\bigl[-(t+1)e^{-t}\\bigr]_{0}^{\\infty}=0-(-1)=1$. The signal $te^{-t}u(t)$ starts at 0 and peaks at $t=1$, where it equals $e^{-1}\\approx0.37$.'},

{t:'h3', text:'Differentiation in time'},
{t:'p', text:'Differentiate the <b>synthesis equation</b>, not the signal. On the right, the only factor that depends on $t$ is $e^{j\\omega t}$, and $\\omega$ is the variable of integration, so it is held fixed. The derivative of $e^{j\\omega t}$ with respect to $t$ is $j\\omega e^{j\\omega t}$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d}{\\d t}x(t)&=\\frac{\\d}{\\d t}\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega\\Bigr]\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,\\frac{\\partial}{\\partial t}e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\bigl[j\\omega X(j\\omega)\\bigr]e^{j\\omega t}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'The last line is the synthesis equation applied to the function $j\\omega X(j\\omega)$. So $j\\omega X(j\\omega)$ is the transform of $\\d x/\\d t$. If $X(j2)=0.5$, for example, the transform of $\\d x/\\d t$ at $\\omega=2$ is $j2\\cdot0.5=j$. Differentiating again multiplies by another $j\\omega$, and after $n$ derivatives:'},
{t:'eq', tex:'\\frac{\\d^{n}x}{\\d t^{n}}\\;\\longleftrightarrow\\;(j\\omega)^{n}X(j\\omega).'},
{t:'p', text:'The factor $j\\omega$ removes low frequencies and lifts high ones. It also turns a differential equation into an algebraic equation in $j\\omega$, which Section 5.6 uses.'},
{t:'box', kind:'err', hd:'Do not mix the two domains', html:'The equation $\\d x/\\d t=j\\omega\\,x(t)$ is false. The frequency $\\omega$ is the variable of integration in the synthesis equation; it is not a constant of the time-domain signal. For $x(t)=e^{-t^{2}}$, $\\d x/\\d t=-2te^{-t^{2}}$ is $-2e^{-1}=-0.735759$ at $t=1$, while $j\\omega\\,x(t)$ at $t=1$, $\\omega=3$ is $3e^{-1}j=1.103638j$. The differentiation property is correct only in the form derived from the synthesis integral.'},

{t:'page'},
{t:'ex', hd:'Example 5.13 — the unit step', rows:[
 ['Given','$u(t)$, which is 1 for $t>0$ and 0 for $t<0$. It fails both existence conditions.'],
 ['Find','$U(j\\omega)$.'],
 ['Method','Split the step into its mean and an odd part: $u(t)=\\tfrac12+\\tfrac12\\operatorname{sgn}(t)$, where $\\operatorname{sgn}(t)$ is $+1$ for $t>0$ and $-1$ for $t<0$. The mean has a known transform. Obtain the transform of $\\operatorname{sgn}(t)$ as the limit of $e^{-a|t|}\\operatorname{sgn}(t)$ as $a\\to0$, a signal that has an ordinary transform.'],
 ['Solution','For $a>0$ the signal $e^{-a|t|}\\operatorname{sgn}(t)$ equals $e^{-at}u(t)$ for $t>0$ and $-e^{at}u(-t)$ for $t<0$. Example 5.3 gives $e^{-at}u(t)\\leftrightarrow1/(a+j\\omega)$. The signal $e^{at}u(-t)$ is that signal reversed in time, so by time reversal its transform is $1/(a-j\\omega)$. Linearity, then a common denominator: $$\\begin{aligned}\\mathcal{F}\\{e^{-a|t|}\\operatorname{sgn}(t)\\}&=\\frac{1}{a+j\\omega}-\\frac{1}{a-j\\omega}\\\\&=\\frac{(a-j\\omega)-(a+j\\omega)}{(a+j\\omega)(a-j\\omega)}\\\\&=\\frac{-2j\\omega}{a^{2}+\\omega^{2}}.\\end{aligned}$$ Let $a\\to0$ at a fixed $\\omega\\neq0$, and use $-j=1/j$: $$\\lim_{a\\to0}\\frac{-2j\\omega}{a^{2}+\\omega^{2}}=\\frac{-2j\\omega}{\\omega^{2}}=\\frac{-2j}{\\omega}=\\frac{2}{j\\omega}.$$ At $\\omega=0$ the transform is 0 for every $a$, and it is odd in $\\omega$, so no impulse forms at the origin in the limit. Hence $\\operatorname{sgn}(t)\\leftrightarrow2/(j\\omega)$. The mean gives $\\tfrac12\\leftrightarrow\\tfrac12\\cdot2\\pi\\delta(\\omega)=\\pi\\delta(\\omega)$. Add the two parts: $$u(t)\\;\\longleftrightarrow\\;\\pi\\delta(\\omega)+\\tfrac12\\cdot\\frac{2}{j\\omega}=\\frac{1}{j\\omega}+\\pi\\delta(\\omega).$$'],
 ['Check','$\\d u/\\d t=\\delta(t)$, whose transform is 1. The differentiation property multiplies $U$ by $j\\omega$: $$j\\omega\\Bigl[\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\Bigr]=1+j\\pi\\,\\omega\\delta(\\omega)=1,$$ because $\\omega\\delta(\\omega)=0\\cdot\\delta(\\omega)=0$. The same split gives the reversed step: $u(-t)=\\tfrac12-\\tfrac12\\operatorname{sgn}(t)\\leftrightarrow\\pi\\delta(\\omega)-1/(j\\omega)$. The mean is still $\\tfrac12$; only the odd part changes sign.']
]},

{t:'h3', text:'Integration, and the impulse it leaves behind'},
{t:'p', text:'The running integral is a convolution with the unit step. In the convolution integral, the factor $u(t-\\tau)$ equals 1 for $\\tau<t$ and 0 for $\\tau>t$, so it cuts the upper limit at $t$:'},
{t:'eq', tex:'x(t)*u(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,u(t-\\tau)\\,\\d\\tau=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau.'},
{t:'p', text:'The convolution property of Section 5.5 multiplies the transforms, and Example 5.13 gives the transform of the step. In the product, $X(j\\omega)\\delta(\\omega)=X(j0)\\delta(\\omega)$, because the impulse is zero away from $\\omega=0$ and only the value of $X$ at the origin survives. Writing $X(0)$ for $X(j0)$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\Bigl\\{\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\Bigr\\}&=X(j\\omega)\\Bigl[\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\Bigr]\\\\&=\\frac{1}{j\\omega}X(j\\omega)+\\pi X(0)\\,\\delta(\\omega).\\end{aligned}'},
{t:'box', kind:'err', hd:'Include the impulse term when the area is non-zero', html:'$X(0)=\\int x(t)\\,\\d t$ is the total area of the signal. If this area is non-zero, the running integral settles at a non-zero constant, and a constant has an impulse at $\\omega=0$. Writing only $X(j\\omega)/(j\\omega)$ omits that constant. For $x(t)=1$ on $0<t<2$ the area is $X(0)=2$, so the impulse term is $2\\pi\\,\\delta(\\omega)$. A pulse of area zero, such as $+1$ on $0<t<1$ followed by $-1$ on $1<t<2$, has a running integral that returns to 0, and no impulse term.'},

{t:'ex', hd:'Example 5.14 — a transform by differentiation', rows:[
 ['Given','$x(t)=1$ for $|t|\\le1$, $x(t)=2-|t|$ for $1<|t|<2$, and $0$ elsewhere: a trapezoid.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','The ramps make the analysis integral long. Differentiate instead: $g=\\d x/\\d t$ is two pulses, whose transforms are known. Since $x=0$ for $t<-2$, $x$ is the running integral of $g$, and the integration property returns $X$ from $G$.'],
 ['Solution','Differentiate piece by piece. On $-2<t<-1$, $x=2+t$, so $g=1$. On $|t|<1$, $x=1$, so $g=0$. On $1<t<2$, $x=2-t$, so $g=-1$. Elsewhere $g=0$. Let $p(t)$ be the pulse of unit width, 1 on $|t|<\\tfrac12$. Then $g(t)=p(t+1.5)-p(t-1.5)$. Example 5.5 with $T_1=\\tfrac12$ gives $p(t)\\leftrightarrow2\\sin(\\omega/2)/\\omega$. The time shift gives $p(t+1.5)\\leftrightarrow e^{j1.5\\omega}P(j\\omega)$ and $p(t-1.5)\\leftrightarrow e^{-j1.5\\omega}P(j\\omega)$. Linearity, then Euler’s $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ with $\\theta=1.5\\omega$: $$\\begin{aligned}G(j\\omega)&=\\bigl(e^{j1.5\\omega}-e^{-j1.5\\omega}\\bigr)\\frac{2\\sin(\\omega/2)}{\\omega}\\\\&=2j\\sin(1.5\\omega)\\cdot\\frac{2\\sin(\\omega/2)}{\\omega}=\\frac{4j\\sin(1.5\\omega)\\sin(\\omega/2)}{\\omega}.\\end{aligned}$$ The area of $g$ is $G(0)=1-1=0$: one pulse up, one down. So the integration property leaves no impulse term: $$\\begin{aligned}X(j\\omega)&=\\frac{G(j\\omega)}{j\\omega}+\\pi G(0)\\,\\delta(\\omega)\\\\&=\\frac{4j\\sin(1.5\\omega)\\sin(\\omega/2)}{j\\omega\\cdot\\omega}+0=\\frac{4\\sin(1.5\\omega)\\sin(\\omega/2)}{\\omega^{2}}.\\end{aligned}$$'],
 ['Check','For small $\\omega$, $\\sin(1.5\\omega)\\approx1.5\\omega$ and $\\sin(\\omega/2)\\approx\\omega/2$, so $X(j0)=4\\cdot1.5\\cdot0.5=3$. The trapezoid has parallel sides 2 and 4 and height 1, so its area is $\\tfrac12(2+4)\\cdot1=3$. $X$ is real and even, as $x$ is. A second route: the trapezoid is the convolution of the pulse of half-width 1.5 with the pulse of half-width 0.5, because their overlap has length 1 for $|t|\\le1$ and shrinks linearly to 0 at $|t|=2$. The convolution property (Section 5.5) multiplies their transforms: $\\frac{2\\sin(1.5\\omega)}{\\omega}\\cdot\\frac{2\\sin(0.5\\omega)}{\\omega}$, the same result. At $\\omega=\\pi$ it gives $4\\sin(1.5\\pi)\\sin(\\pi/2)/\\pi^{2}=-4/\\pi^{2}=-0.405285$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:340,h:170,xr:[-3,3],yr:[-1.5,1.6],xlabel:'t\\;[\\text{s}]',ylabel:'x(t)',yticksOverride:[-1,1],yticksLeft:true,xtarget:7});
   a.curve(t=>{ const u=Math.abs(t); return u<1?1:(u<2?2-u:0); },{color:C.in,n:2400}); return a.svg(); }, cap:'The trapezoid $x(t)$.'},
 {svg:()=>{ const a=ax({w:340,h:170,xr:[-3,3],yr:[-1.5,1.6],xlabel:'t\\;[\\text{s}]',ylabel:'g(t)',yticksOverride:[-1,1],yticksLeft:true,xtarget:7});
   a.curve(t=>{ const u=Math.abs(t); return u<1?1:(u<2?2-u:0); },{color:C.in,dash:'7 5',width:1.4,n:2400});
   a.curve(t=>[-2,-1,1,2].some(c=>Math.abs(t-c)<0.004)?NaN:((t>-2&&t<-1)?1:((t>1&&t<2)?-1:0)),{color:C.mid,n:3000}); return a.svg(); },
  cap:'$g=\\d x/\\d t$: pulses of height $\\pm1$ where $x$ ramps.'}
]},

{t:'h3', text:'Time scaling'},
{t:'p', text:'Put $x(at)$ into the analysis equation and substitute $\\tau=at$, so $t=\\tau/a$ and $\\d t=\\d\\tau/a$. For $a>0$ the limits keep their order, since $\\tau\\to\\pm\\infty$ when $t\\to\\pm\\infty$, and the coefficient is $1/a=1/|a|$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(at)\\}&=\\int_{-\\infty}^{\\infty}x(at)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau/a}\\,\\frac{\\d\\tau}{a}\\\\&=\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{a}X\\!\\Bigl(j\\frac{\\omega}{a}\\Bigr),\\qquad a>0.\\end{aligned}'},
{t:'p', text:'For $a<0$ the substitution sends $t\\to-\\infty$ to $\\tau\\to+\\infty$ and $t\\to+\\infty$ to $\\tau\\to-\\infty$, so the limits arrive reversed. Swapping them back costs one minus sign, and $-1/a=1/|a|$ for negative $a$. That is the only sign in the calculation:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(at)\\}&=\\int_{+\\infty}^{-\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\frac{\\d\\tau}{a}\\\\&=-\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{|a|}X\\!\\Bigl(j\\frac{\\omega}{a}\\Bigr),\\qquad a<0.\\end{aligned}'},
{t:'p', text:'Both cases read $x(at)\\leftrightarrow\\frac{1}{|a|}X(j\\omega/a)$ for $a\\neq0$. The modulus sits on $a$ in the factor, not in the argument. Compress a signal in time ($a>1$) and its spectrum widens by $a$ and drops by $1/a$; stretch it and the spectrum narrows. This is the inverse relation of Section 5.2. At $\\omega=0$ the property reads $\\frac{1}{|a|}X(j0)$: if $X(j0)=6$, the transform of $x(3t)$ at $\\omega=0$ is 2, because the area of $x(3t)$ is a third of the area of $x$.'},
{t:'box', kind:'err', hd:'Counting the flip twice', html:'Writing the reversed limits <b>and</b> an explicit $-1$ in front applies the same correction twice and gives $-\\frac{1}{|a|}X(j\\omega/a)$, which contradicts the property. Do the flip once: reverse the limits, or write the minus, never both. The case $a=-1$ is time reversal, $x(-t)\\leftrightarrow X(-j\\omega)$, with coefficient 1. For $x(t)=e^{-t}u(t)\\leftrightarrow1/(1+j\\omega)$ it gives $x(-t)\\leftrightarrow1/(1-j\\omega)$.'},

{t:'ex', hd:'Example 5.15 — scaling a band', rows:[
 ['Given','$X(j\\omega)=1$ on $|\\omega|<2\\pi$ and 0 elsewhere.'],
 ['Find','The transforms of $x(0.5t)$ and $x(2t)$, with heights and band edges.'],
 ['Method','Apply $x(at)\\leftrightarrow\\frac{1}{|a|}X(j\\omega/a)$ once for $a=0.5$ and once for $a=2$. Then solve each band condition for $\\omega$.'],
 ['Solution','For $a=0.5$: $x(0.5t)\\leftrightarrow\\frac{1}{0.5}X(j\\omega/0.5)=2X(j2\\omega)$. It is non-zero where $|2\\omega|<2\\pi$, that is $|\\omega|<\\pi$, and there it equals $2\\cdot1=2$. For $a=2$: $x(2t)\\leftrightarrow\\tfrac12X(j\\omega/2)$. It is non-zero where $|\\omega/2|<2\\pi$, that is $|\\omega|<4\\pi$, and there it equals $0.5$. So $$\\begin{aligned}x(0.5t)&\\;\\longleftrightarrow\\;2\\ \\text{on}\\ |\\omega|<\\pi,\\\\x(2t)&\\;\\longleftrightarrow\\;0.5\\ \\text{on}\\ |\\omega|<4\\pi.\\end{aligned}$$'],
 ['Check','The areas of the three spectra are $2\\cdot2\\pi$, $1\\cdot4\\pi$ and $0.5\\cdot8\\pi$, all equal to $4\\pi$. At $t=0$ the synthesis equation reads $x(0)=\\frac{1}{2\\pi}\\int X\\,\\d\\omega$, so all three signals have the value $4\\pi/2\\pi=2$ at the origin. That is what a time scaling cannot change: $x(a\\cdot0)=x(0)$.']
]},

{t:'h3', text:'Duality'},
{t:'p', text:'The two equations of the pair differ only by a sign and a factor, so any pair can be read a second time with the domains exchanged.'},
{t:'eqbox', cap:'Duality', tex:['x(t)\\;\\longleftrightarrow\\;X(j\\omega)\\qquad\\Longrightarrow\\qquad X(t)\\;\\longleftrightarrow\\;2\\pi\\,x(-\\omega)'],
 after:'Here $X(t)$ means the formula for $X(j\\omega)$ with $\\omega$ replaced by $t$. The argument on the right is $-\\omega$, a real number, and not $-j\\omega$: the letter $x$ names a signal, and a signal takes a real argument. The $j$ belongs to the frequency-domain function only, and duality is where that distinction is most easily lost.'},
{t:'p', text:'Proof. Start from the synthesis equation and multiply by $2\\pi$:'},
{t:'eq', tex:'2\\pi\\,x(t)=\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega.'},
{t:'p', text:'The names of the variables carry no meaning, so rename them: call the variable of integration $t$ and the free variable $\\omega$. The equation becomes'},
{t:'eq', tex:'2\\pi\\,x(\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{j\\omega t}\\,\\d t.'},
{t:'p', text:'This holds for every real $\\omega$, so it holds with $\\omega$ replaced by $-\\omega$. The exponent $e^{j(-\\omega)t}=e^{-j\\omega t}$ is now the analysis kernel:'},
{t:'eq', tex:'2\\pi\\,x(-\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{-j\\omega t}\\,\\d t=\\mathcal{F}\\{X(t)\\}.'},
{t:'p', text:'The right side is the analysis equation applied to the time signal $X(t)$, so its transform is $2\\pi x(-\\omega)$. Every pair therefore gives a second pair at no cost. From $e^{-|t|}\\leftrightarrow2/(1+\\omega^{2})$ (Example 5.4 with $a=1$), duality gives $2/(1+t^{2})\\leftrightarrow2\\pi e^{-|-\\omega|}=2\\pi e^{-|\\omega|}$. Duality also carries properties across: the time-shift rule and the frequency-shift rule are one rule read twice, and so are differentiation in time and differentiation in frequency.'},
{t:'ex', hd:'Example 5.16 — duality on the rectangular pulse', rows:[
 ['Given','$x_1(t)=1$ on $|t|<W$ and 0 elsewhere, so $X_1(j\\omega)=2\\sin(W\\omega)/\\omega$ by Example 5.5.'],
 ['Find','The transform of $x_2(t)=2\\sin(Wt)/t$.'],
 ['Method','$x_2$ has the same formula as $X_1$ with the independent variable renamed, so duality applies. Use duality first, then confirm the result with the synthesis equation.'],
 ['Solution','The signal $x_2(t)=2\\sin(Wt)/t$ is $X_1(j\\omega)$ with $\\omega$ replaced by $t$, that is $x_2(t)=X_1(t)$ in the notation of the duality box. Duality then gives $X_2(j\\omega)=2\\pi x_1(-\\omega)$. The pulse $x_1$ is even, so $x_1(-\\omega)=x_1(\\omega)$, which is 1 on $|\\omega|<W$ and 0 beyond: $$X_2(j\\omega)=2\\pi\\,x_1(-\\omega)=2\\pi\\,x_1(\\omega)=\\begin{cases}2\\pi,&|\\omega|<W\\\\0,&|\\omega|>W.\\end{cases}$$'],
 ['Check','The second route works backwards. Put a band of height $2\\pi$ on $|\\omega|<W$ through the synthesis equation; for $t\\neq0$ the antiderivative of $e^{j\\omega t}$ in $\\omega$ is $e^{j\\omega t}/(jt)$: $$\\begin{aligned}\\frac{1}{2\\pi}\\int_{-W}^{W}2\\pi\\,e^{j\\omega t}\\,\\d\\omega&=\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}=\\frac{e^{jWt}-e^{-jWt}}{jt}\\\\&=\\frac{2j\\sin(Wt)}{jt}=\\frac{2\\sin(Wt)}{t},\\end{aligned}$$ which is $x_2$. The two routes use different equations, so their agreement is a real check. At the origin, $X_2(j0)=2\\pi=6.283185$ for any $W$. In time, $x_2(0)=\\lim_{t\\to0}2W\\cos(Wt)/1=2W$ by l’Hôpital; with the unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, $x_2(t)=2W\\operatorname{sinc}(Wt)$.']
]},

{t:'h3', text:'Parseval’s relation'},
{t:'p', text:'Energy and power in this course are normalised: every signal is a voltage across $R=1\\,\\Omega$, so the instantaneous power is $|x(t)|^{2}$ and the energy is its integral, in joules.'},
{t:'eqbox', cap:'Parseval’s relation',
 tex:['E_{\\infty}=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega'],
 after:'The quantity $|X(j\\omega)|^{2}$ is the <b>energy spectral density</b>: $\\frac{1}{2\\pi}|X(j\\omega)|^{2}\\,\\d\\omega$ is the energy in a narrow band. The $1/2\\pi$ sits on the frequency side, as in the synthesis equation.'},
{t:'p', text:'Proof. Write $|x(t)|^{2}=x(t)\\,x^{*}(t)$. Replace $x^{*}(t)$ by the conjugate of the synthesis equation; conjugating turns $X(j\\omega)$ into $X^{*}(j\\omega)$ and $e^{j\\omega t}$ into $e^{-j\\omega t}$. Then exchange the order of the two integrals, so that the $t$ integral is done first. The inner integral is the analysis equation and equals $X(j\\omega)$:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t&=\\int_{-\\infty}^{\\infty}x(t)\\,x^{*}(t)\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(t)\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\,e^{-j\\omega t}\\,\\d\\omega\\Bigr]\\d t\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t\\Bigr]\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\,X(j\\omega)\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'For a real signal, $|x(t)|^{2}=x^{2}(t)$, and that is the only simplification available. The claim $|x(t)|=x(t)$ is stronger and fails wherever a real signal is negative.'},
{t:'p', text:'The relation can be tried on $e^{-at}u(t)$, $a>0$, in both domains. In time, the step cuts the lower limit at 0 and $|e^{-at}|^{2}=e^{-2at}$:'},
{t:'eq', tex:'E_{\\infty}=\\int_{0}^{\\infty}e^{-2at}\\,\\d t=\\left[\\frac{e^{-2at}}{-2a}\\right]_{0}^{\\infty}=\\frac{0-1}{-2a}=\\frac{1}{2a}.'},
{t:'p', text:'In frequency, $|X(j\\omega)|^{2}=1/(a^{2}+\\omega^{2})$ from Example 5.3. Substitute $\\omega=au$, so $\\d\\omega=a\\,\\d u$ and the limits stay infinite; then use the antiderivative $\\tan^{-1}u$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{a^{2}+\\omega^{2}}&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{a\\,\\d u}{a^{2}(1+u^{2})}=\\frac{1}{2\\pi a}\\bigl[\\tan^{-1}u\\bigr]_{-\\infty}^{\\infty}\\\\&=\\frac{1}{2\\pi a}\\Bigl[\\frac{\\pi}{2}-\\Bigl(-\\frac{\\pi}{2}\\Bigr)\\Bigr]=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{a}=\\frac{1}{2a}.\\end{aligned}'},
{t:'p', text:'The two routes agree: $0.5$ J for $a=1$, and $0.25$ J for $a=2$. Without the $1/2\\pi$ the second route would report $2\\pi$ times too much.'},
{t:'ex', hd:'Example 5.17 — energy from a two-band spectrum', rows:[
 ['Given','$X_3(j\\omega)=2$ for $|\\omega|<2\\pi$, 1 for $2\\pi<|\\omega|<4\\pi$, and 0 beyond, with $R=1\\,\\Omega$.'],
 ['Find','The total energy of $x_3$.'],
 ['Method','The spectrum is piecewise constant, so the frequency-domain energy integral is simpler than the time-domain one. Apply Parseval, square each height, and multiply by the width of its piece.'],
 ['Solution','Split the frequency integral of Parseval’s relation at the points where the height changes. On each piece $|X_3|^{2}$ is a constant, so the integral is that constant times the width of the piece: $$\\begin{aligned}E_{\\infty}&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X_3(j\\omega)|^{2}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\Bigl[\\int_{-4\\pi}^{-2\\pi}1^{2}\\,\\d\\omega+\\int_{-2\\pi}^{2\\pi}2^{2}\\,\\d\\omega+\\int_{2\\pi}^{4\\pi}1^{2}\\,\\d\\omega\\Bigr]\\\\&=\\frac{1}{2\\pi}\\bigl[1\\cdot2\\pi+4\\cdot4\\pi+1\\cdot2\\pi\\bigr]\\\\&=\\frac{1}{2\\pi}\\bigl[2\\pi+16\\pi+2\\pi\\bigr]=\\frac{20\\pi}{2\\pi}=10\\ \\text{J}.\\end{aligned}$$ The inner band contributes $2^{2}\\cdot4\\pi=16\\pi$ and the two outer bands $1^{2}\\cdot2\\pi$ each.'],
 ['Check','Write $X_3$ as the sum of two ideal low-pass bands of height 1, one on $|\\omega|<4\\pi$ and one on $|\\omega|<2\\pi$; where they overlap the heights add to 2. Example 5.6 with $W=4\\pi$ and $W=2\\pi$ then gives, by linearity, $$x_3(t)=\\frac{\\sin(4\\pi t)}{\\pi t}+\\frac{\\sin(2\\pi t)}{\\pi t}=\\frac{\\sin(2\\pi t)+\\sin(4\\pi t)}{\\pi t}.$$ Its peak is $x_3(0)=4+2=6$. Using the heights unsquared gives $\\frac{1}{2\\pi}\\int X_3\\,\\d\\omega=\\frac{1}{2\\pi}[2\\pi+8\\pi+2\\pi]=6$: that is the peak $x_3(0)$, not the energy. Square the height before integrating.']
]},

/* =================================================== 5.5 */
{t:'h2', num:'5.5', text:'Convolution and multiplication'},
{t:'eqbox', cap:'The convolution property',
 tex:['y(t)=x(t)*h(t)\\;\\longleftrightarrow\\;Y(j\\omega)=X(j\\omega)\\,H(j\\omega)'],
 after:'The statement uses one set of symbols: $x\\leftrightarrow X$ is the input, $h\\leftrightarrow H$ the impulse response, and $y$ the output. $H(j\\omega)$ is the frequency response of the system. Using $y$ both for a free second signal and for the output would make the statement refer to itself.'},
{t:'p', text:'Proof. Write the convolution integral inside the analysis integral and exchange the order, so that the $t$ integral is done first. The inner bracket is the transform of $h(t-\\tau)$ with $\\tau$ fixed, which the time-shift property gives as $e^{-j\\omega\\tau}H(j\\omega)$. Then $H(j\\omega)$ does not depend on $\\tau$ and leaves the outer integral:'},
{t:'eq', tex:'\\begin{aligned}Y(j\\omega)&=\\int_{-\\infty}^{\\infty}\\Bigl[\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\Bigr]e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\Bigl[\\int_{-\\infty}^{\\infty}h(t-\\tau)\\,e^{-j\\omega t}\\,\\d t\\Bigr]\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}H(j\\omega)\\,\\d\\tau\\\\&=H(j\\omega)\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau=H(j\\omega)\\,X(j\\omega).\\end{aligned}'},
{t:'p', text:'Convolution in time carries no factor. At $\\omega=0$ the property reads $Y(j0)=X(j0)H(j0)$: with $X(j0)=4$ and $H(j0)=0.5$, $Y(j0)=2$. $H(j\\omega)$ exists as an ordinary function when $h$ is absolutely integrable, which for an LTI system is exactly bounded-input bounded-output stability.'},

{t:'h3', text:'Delay, differentiator, integrator'},
{t:'p', text:'Three simple systems are each one operation of Section 5.4. The property of that operation gives $Y=HX$ directly, and $H$ can be read off:'},
{t:'eq', tex:'\\begin{aligned}y(t)&=x(t-t_0)&&\\Longrightarrow\\quad Y=e^{-j\\omega t_0}X,&&H(j\\omega)=e^{-j\\omega t_0},\\\\y(t)&=\\frac{\\d x}{\\d t}&&\\Longrightarrow\\quad Y=j\\omega X,&&H(j\\omega)=j\\omega,\\\\y(t)&=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau&&\\Longrightarrow\\quad Y=\\Bigl[\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\Bigr]X,&&H(j\\omega)=\\frac{1}{j\\omega}+\\pi\\delta(\\omega).\\end{aligned}'},
{t:'p', text:'The third line uses $\\pi X(0)\\delta(\\omega)=\\pi\\delta(\\omega)X(j\\omega)$. The integrator has impulse response $u(t)$, and its frequency response is the transform of the step (Example 5.13). The step is not absolutely integrable, so the integrator is not stable, and its $H$ exists only in the limiting sense, with an impulse.'},
{t:'p', text:'Read the magnitudes. A delay has $|H|=1$: it changes only the phase, by $-\\omega t_0$. A differentiator has $|H|=|\\omega|$: it lifts high frequencies, so it also amplifies high-frequency noise. An integrator has $|H|=1/|\\omega|$ away from the origin: it does the opposite. For example, feed $x(t)=\\cos(2t)$ to the differentiator. Its transform is $\\pi\\delta(\\omega-2)+\\pi\\delta(\\omega+2)$. Multiply by $j\\omega$; each impulse keeps only the value of $j\\omega$ at its own position:'},
{t:'eq', tex:'\\begin{aligned}Y(j\\omega)&=j\\omega\\bigl[\\pi\\delta(\\omega-2)+\\pi\\delta(\\omega+2)\\bigr]\\\\&=j2\\pi\\,\\delta(\\omega-2)-j2\\pi\\,\\delta(\\omega+2)\\\\&=-2\\Bigl[\\frac{\\pi}{j}\\,\\delta(\\omega-2)-\\frac{\\pi}{j}\\,\\delta(\\omega+2)\\Bigr].\\end{aligned}'},
{t:'p', text:'The last line uses $\\pi/j=-j\\pi$. The bracket is the transform of $\\sin(2t)$ (Example 5.9 with unit amplitude), so $y(t)=-2\\sin(2t)$, of amplitude $|H(j2)|=2$. Differentiating $\\cos(2t)$ directly gives the same.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.2,3.8],xlabel:'\\omega',ylabel:'|H|',pad:{l:40,r:14,t:28,b:34},yticksOverride:[1,2,3],yticksLeft:true},W_(-1.3*PI,1.3*PI,PI)));
   a.curve(()=>1,{color:C.h,n:400}); return a.svg(); }, cap:'Delay: $|H|=1$.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.2,3.8],xlabel:'\\omega',ylabel:'|H|',pad:{l:40,r:14,t:28,b:34},yticksOverride:[1,2,3],yticksLeft:true},W_(-1.3*PI,1.3*PI,PI)));
   a.curve(w=>Math.abs(w),{color:C.h,n:1200}); return a.svg(); }, cap:'Differentiator: $|H|=|\\omega|$.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.2,3.8],xlabel:'\\omega',ylabel:'|H|',pad:{l:40,r:14,t:28,b:34},yticksOverride:[1,2,3],yticksLeft:true},W_(-1.3*PI,1.3*PI,PI)));
   a.curve(w=>Math.abs(w)<0.02?NaN:1/Math.abs(w),{color:C.h,n:4000}); a.impulse(0,PI,{color:C.h,label:false}); return a.svg(); }, cap:'Integrator: $1/|\\omega|$, and $\\pi\\delta(\\omega)$.'}
]},

{t:'page'},
{t:'ex', hd:'Example 5.18 — two exponentials in cascade', rows:[
 ['Given','$x(t)=e^{-at}u(t)$ and $h(t)=e^{-bt}u(t)$, with $a,b>0$ and $a\\neq b$.'],
 ['Find','$y(t)=x*h$, and the magnitude $|Y(j\\omega)|$ for $a=1$, $b=2$.'],
 ['Method','The output is a convolution in time, so it becomes multiplication in frequency. Multiply the transforms, expand the product into simple fractions, and invert each term.'],
 ['Solution','Example 5.3 gives $X(j\\omega)=1/(a+j\\omega)$ and $H(j\\omega)=1/(b+j\\omega)$. Multiply them, then write the product as a sum of two simple fractions with unknown constants $A$ and $B$: $$Y(j\\omega)=\\frac{1}{(a+j\\omega)(b+j\\omega)}=\\frac{A}{a+j\\omega}+\\frac{B}{b+j\\omega}.$$ Multiply through by $(a+j\\omega)(b+j\\omega)$ to clear the denominators: $$1=A(b+j\\omega)+B(a+j\\omega).$$ This holds for every $\\omega$. Choose $j\\omega=-a$ to remove the $B$ term: $1=A(b-a)$, so $A=1/(b-a)$. Choose $j\\omega=-b$ to remove the $A$ term: $1=B(a-b)$, so $B=1/(a-b)=-A$. Hence $$Y(j\\omega)=\\frac{1}{b-a}\\Bigl[\\frac{1}{a+j\\omega}-\\frac{1}{b+j\\omega}\\Bigr].$$ Each fraction is the pair of Example 5.3, so by linearity $$y(t)=\\frac{1}{b-a}\\bigl[e^{-at}u(t)-e^{-bt}u(t)\\bigr]=\\frac{e^{-at}-e^{-bt}}{b-a}\\,u(t).$$ For the magnitude, the modulus of a product is the product of the moduli. With $a=1$ and $b=2$: $$|Y(j\\omega)|=|X(j\\omega)|\\,|H(j\\omega)|=\\frac{1}{\\sqrt{1+\\omega^{2}}}\\cdot\\frac{1}{\\sqrt{4+\\omega^{2}}}=\\frac{1}{\\sqrt{(1+\\omega^{2})(4+\\omega^{2})}}.$$ The phases add in the same way: $\\angle Y=\\angle X+\\angle H$.'],
 ['Check','$y(0)=(1-1)/(b-a)=0$, as a convolution of two causal signals must be: they do not overlap at $t=0$. For $a=1$, $b=2$, set $\\d y/\\d t=-e^{-t}+2e^{-2t}=0$, so $e^{t}=2$ and the peak is at $t=\\ln2=0.693147$, with value $e^{-\\ln2}-e^{-2\\ln2}=\\tfrac12-\\tfrac14=\\tfrac14$ exactly. At $\\omega=0$: $|X|=1$, $|H|=0.5$ and $|Y|=0.5$; at $\\omega=1$: $|X|=1/\\sqrt2$, $|H|=1/\\sqrt5$ and $|Y|=1/\\sqrt{10}=0.316228$. At each frequency the output magnitude is the product of the other two.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:340,h:180,xr:[-0.9,6],yr:[-0.1,1.2],xlabel:'t\\;[\\text{s}]',ylabel:'\\text{amplitude}',yticksOverride:[0,0.25,0.5,1],ytickfmt:v=>String(v),xtarget:6});
   a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,dash:'7 5',width:1.6,n:2000}); a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.h,dash:'3 4',width:1.6,n:2000});
   a.curve(t=>t<0?0:Math.exp(-t)-Math.exp(-2*t),{color:C.out,n:2000}); a.point(Math.log(2),0.25,{color:C.coral,r:3.6}); return a.svg(); },
  cap:'$x$ (dashed), $h$ (dotted) and $y$ (solid) for $a=1$, $b=2$. The peak is $0.25$ at $t=\\ln2$.'},
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.1,1.2],xlabel:'\\omega',ylabel:'\\text{magnitude}',yticksOverride:[0,0.5,1],yticksLeft:true},W_(-2*PI,2*PI,PI)));
   a.curve(w=>1/Math.hypot(1,w),{color:C.in,dash:'7 5',width:1.6,n:1600}); a.curve(w=>1/Math.hypot(2,w),{color:C.h,dash:'3 4',width:1.6,n:1600});
   a.curve(w=>1/(Math.hypot(1,w)*Math.hypot(2,w)),{color:C.out,n:1600}); return a.svg(); },
  cap:'$|X|$ (dashed), $|H|$ (dotted) and their product $|Y|$ (solid).'}
]},

{t:'ex', hd:'Example 5.19 — ideal filters in cascade', rows:[
 ['Given','$X(j\\omega)=2$ on $|\\omega|\\le4\\pi$ and an ideal low-pass system with $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$, both zero beyond.'],
 ['Find','$Y(j\\omega)$, $y(t)$ and the three time-domain peaks.'],
 ['Method','An LTI system gives $Y=XH$. Multiply the input spectrum and the frequency response at each frequency, then invert with the pair of Example 5.6.'],
 ['Solution','Multiply the two spectra frequency by frequency. On $|\\omega|\\le2\\pi$ both are non-zero: $Y=2\\cdot3=6$. On $2\\pi<|\\omega|\\le4\\pi$ the input is 2 but the system is 0: $Y=2\\cdot0=0$. Beyond $4\\pi$ both are zero. So $Y=6$ on $|\\omega|\\le2\\pi$ and zero elsewhere; the narrower band decides. Invert with the synthesis equation, which is Example 5.6 with $W=2\\pi$ and an extra factor 6: $$\\begin{aligned}y(t)&=\\frac{1}{2\\pi}\\int_{-2\\pi}^{2\\pi}6\\,e^{j\\omega t}\\,\\d\\omega=6\\cdot\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-2\\pi}^{2\\pi}\\\\&=6\\cdot\\frac{e^{j2\\pi t}-e^{-j2\\pi t}}{2\\pi jt}=6\\cdot\\frac{2j\\sin(2\\pi t)}{2\\pi jt}=\\frac{6\\sin(2\\pi t)}{\\pi t}.\\end{aligned}$$'],
 ['Check','At $t=0$ the synthesis integral is the area of the spectrum divided by $2\\pi$, since $e^{j\\omega\\cdot0}=1$. Each peak is therefore the area of its own band over $2\\pi$: $x(0)=2\\cdot8\\pi/2\\pi=8$, $h(0)=3\\cdot4\\pi/2\\pi=6$, $y(0)=6\\cdot4\\pi/2\\pi=12$. The output peak is the largest because a peak counts area, not height, and $6\\times4\\pi$ exceeds $2\\times8\\pi$.']
]},

{t:'h3', text:'The multiplication property'},
{t:'eqbox', cap:'Multiplication in time',
 tex:['z(t)=x(t)\\,y(t)\\;\\longleftrightarrow\\;Z(j\\omega)=\\frac{1}{2\\pi}\\,X(j\\omega)*Y(j\\omega),\\qquad X*Y=\\int_{-\\infty}^{\\infty}X(j\\theta)\\,Y\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta'],
 after:'The convolution is over frequency. Convolution in time carries no factor; convolution in frequency carries $1/2\\pi$. Without it the shape of $Z$ is right and its height is $2\\pi$ times too large.'},
{t:'p', text:'Proof. Replace $y(t)$ in the analysis integral of $z=xy$ by its synthesis equation, written with the dummy variable $\\theta$ so that it is not confused with the output frequency $\\omega$. Exchange the order of integration. The inner integral is the frequency-shift property, the analysis equation of $x$ read at $\\omega-\\theta$:'},
{t:'eq', tex:'\\begin{aligned}Z(j\\omega)&=\\int_{-\\infty}^{\\infty}x(t)\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\,e^{j\\theta t}\\,\\d\\theta\\Bigr]e^{-j\\omega t}\\,\\d t\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\theta)t}\\,\\d t\\Bigr]\\d\\theta\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\,X\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta=\\frac{1}{2\\pi}\\,X(j\\omega)*Y(j\\omega).\\end{aligned}'},
{t:'p', text:'The last integral is the convolution of $X$ and $Y$ in the variable $\\omega$, and the $1/2\\pi$ came in with the synthesis equation of $y$. Switching a signal on and off, modulating it by a carrier and cutting it to a window are all products in time. Under convolution the widths add: bands of half-widths $B_1$ and $B_2$ give a product whose spectrum has half-width $B_1+B_2$. Half-widths $\\pi$ and $3\\pi$, for example, give $4\\pi$.'},

{t:'h3', text:'Amplitude modulation'},
{t:'p', text:'A cosine of frequency $\\omega_c$ is called a <b>carrier</b>. Its transform follows from Euler and the complex-exponential pair: $\\cos(\\omega_ct)=\\tfrac12e^{j\\omega_ct}+\\tfrac12e^{-j\\omega_ct}\\leftrightarrow\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)$. Multiplying a signal by the carrier therefore convolves its spectrum with two impulses. Convolution with a shifted impulse shifts the function, $X(j\\omega)*\\delta(\\omega-\\omega_c)=X\\bigl(j(\\omega-\\omega_c)\\bigr)$, so:'},
{t:'eq', tex:'\\begin{aligned}Z(j\\omega)&=\\frac{1}{2\\pi}X(j\\omega)*\\bigl[\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)\\bigr]\\\\&=\\frac{\\pi}{2\\pi}X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\frac{\\pi}{2\\pi}X\\bigl(j(\\omega+\\omega_c)\\bigr)\\\\&=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr).\\end{aligned}'},
{t:'p', text:'The factor $1/2\\pi$ of the multiplication property and the weight $\\pi$ of each impulse give the factor $\\frac12$ on each copy. The frequency-shift property gives the same result term by term: $\\tfrac12e^{j\\omega_ct}x(t)\\leftrightarrow\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)$ and $\\tfrac12e^{-j\\omega_ct}x(t)\\leftrightarrow\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)$.'},
{t:'eqbox', cap:'Double-sideband suppressed-carrier modulation',
 tex:['z(t)=x(t)\\cos(\\omega_ct)\\;\\longleftrightarrow\\;Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)'],
 after:'The spectrum is not moved to $\\omega_c$; it is <b>duplicated</b>, one copy at $+\\omega_c$ and one at $-\\omega_c$, each at half height. If $X(j0)=1$ and the carrier is $\\cos(10\\pi t)$, the copy centred at $10\\pi$ peaks at $Z(j10\\pi)=\\tfrac12X(j0)=0.5$. A description that says "the signal moves up to the carrier" loses the negative-frequency copy and the factor of one half in the same sentence.'},

{t:'ex', hd:'Example 5.20 — modulating a cosine', rows:[
 ['Given','$x(t)=\\cos(\\pi t)$ and the carrier $\\cos(4\\pi t)$.'],
 ['Find','The impulses of $Z(j\\omega)$ for $z(t)=x(t)\\cos(4\\pi t)$, by two routes.'],
 ['Method','Route 1: turn the product into a sum with a trigonometric identity, then transform each cosine. Route 2: apply the modulation result to $X(j\\omega)$.'],
 ['Solution','Route 1. The product-to-sum identity $\\cos\\alpha\\cos\\beta=\\tfrac12\\cos(\\alpha-\\beta)+\\tfrac12\\cos(\\alpha+\\beta)$ with $\\alpha=4\\pi t$ and $\\beta=\\pi t$ gives $$z(t)=\\tfrac12\\cos(3\\pi t)+\\tfrac12\\cos(5\\pi t).$$ A cosine of unit amplitude transforms to two impulses of weight $\\pi$, so each $\\tfrac12\\cos$ gives two impulses of weight $\\tfrac{\\pi}{2}$: $$Z(j\\omega)=\\tfrac{\\pi}{2}\\bigl[\\delta(\\omega-3\\pi)+\\delta(\\omega+3\\pi)+\\delta(\\omega-5\\pi)+\\delta(\\omega+5\\pi)\\bigr].$$ Route 2. $X(j\\omega)=\\pi\\delta(\\omega-\\pi)+\\pi\\delta(\\omega+\\pi)$. The modulation result halves $X$ and centres one copy at $+4\\pi$ and one at $-4\\pi$. The copy at $+4\\pi$ has impulses of weight $\\pi/2$ at $4\\pi\\pm\\pi$, that is at $3\\pi$ and $5\\pi$; the copy at $-4\\pi$ has them at $-3\\pi$ and $-5\\pi$.'],
 ['Check','Both routes give four impulses of weight $\\pi/2=1.570796$, at $\\pm3\\pi$ and $\\pm5\\pi$. Nothing sits at $\\pm\\omega_c=\\pm4\\pi$ itself: only the sidebands are sent. That is what "suppressed carrier" records.']
]},

{t:'ex', hd:'Example 5.21 — modulating a band-limited signal', rows:[
 ['Given','$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, so $X(j\\omega)=1$ on $|\\omega|<2\\pi$ (Example 5.6), and $z(t)=x(t)\\cos(4\\pi t)$.'],
 ['Find','$Z(j\\omega)$ and its band edges.'],
 ['Method','Two half-height copies of $X$, centred at $+4\\pi$ and $-4\\pi$. Find the edges of each copy.'],
 ['Solution','The copy $\\tfrac12X\\bigl(j(\\omega-4\\pi)\\bigr)$ is $0.5$ where $|\\omega-4\\pi|<2\\pi$, that is on $2\\pi<\\omega<6\\pi$. The copy $\\tfrac12X\\bigl(j(\\omega+4\\pi)\\bigr)$ is $0.5$ on $-6\\pi<\\omega<-2\\pi$. The copies do not meet, so $$Z(j\\omega)=0.5\\quad\\text{on}\\quad2\\pi\\le|\\omega|\\le6\\pi,\\qquad0\\ \\text{elsewhere}.$$'],
 ['Check','Each copy is $4\\pi$ wide, as wide as $X$, at half its height; together they occupy $8\\pi$ of the axis. In time the carrier fills the envelope $\\pm x(t)$. Multiplying $z$ by the carrier again brings one pair of copies back to the origin, where they add to $\\tfrac12X$. A low-pass filter on $|\\omega|<2\\pi$ then recovers $x$ up to the factor $\\tfrac12$; this is the receiver described below.']
]},
{t:'fig', svg:()=>{
  const a=ax(Object.assign({w:700,h:190,yr:[-0.28,1.4],xlabel:WL,ylabel:'Z(j\\omega)',ytarget:2,yticksOverride:[0,0.5,1],yticksLeft:true},W_(-8*PI,8*PI,2*PI)));
  const f=w=>((Math.abs(w-4*PI)<2*PI)?0.5:0)+((Math.abs(w+4*PI)<2*PI)?0.5:0);
  a.area(f,-8*PI,8*PI,{color:'rgba(74,122,70,.13)'});
  a.curve(f,{color:C.out,n:4000});
  a.vline(4*PI,{color:C.err}); a.vline(-4*PI,{color:C.err});
  return a.svg(); },
  cap:'Two half-height copies on $2\\pi\\le|\\omega|\\le6\\pi$. The dashed lines mark $\\pm\\omega_c=\\pm4\\pi$.'},

{t:'ex', hd:'Example 5.22 — copies that overlap', rows:[
 ['Given','$X(j\\omega)=1$ on $\\pi\\le|\\omega|\\le3\\pi$ and 0 elsewhere, and $z(t)=x(t)\\cos(2\\pi t)$.'],
 ['Find','$Z(j\\omega)$, and $Z(j0)$ in particular.'],
 ['Method','Shift $X$ up by $2\\pi$ and down by $2\\pi$, halve both copies, and add them where they land on the same stretch.'],
 ['Solution','The band of $X$ has two parts, $\\pi\\le\\omega\\le3\\pi$ and $-3\\pi\\le\\omega\\le-\\pi$. Shifted up by $2\\pi$ they land on $3\\pi\\le\\omega\\le5\\pi$ and $-\\pi\\le\\omega\\le\\pi$. Shifted down by $2\\pi$ they land on $-\\pi\\le\\omega\\le\\pi$ and $-5\\pi\\le\\omega\\le-3\\pi$. Each copy has height $\\tfrac12$. On $|\\omega|\\le\\pi$ both copies land, and their heights add to $\\tfrac12+\\tfrac12=1$: $$Z(j\\omega)=\\begin{cases}1,&|\\omega|\\le\\pi\\\\0.5,&3\\pi\\le|\\omega|\\le5\\pi\\\\0,&\\text{elsewhere.}\\end{cases}$$ So $Z(j0)=1$.'],
 ['Check','The total area is kept: $X$ has area $2\\cdot2\\pi=4\\pi$, and $Z$ has area $1\\cdot2\\pi+0.5\\cdot2\\pi+0.5\\cdot2\\pi=4\\pi$, as a sum of two half-height copies of $X$ must have.']
]},
{t:'box', kind:'err', hd:'Two different events', html:'<b>Copies appear</b> whenever a signal is multiplied by a carrier. That happens at every carrier frequency, and it loses nothing. <b>Copies overlap</b> only when the carrier is low enough for the shifted bands to reach each other, as in Example 5.22. Overlap is what destroys information: once two copies have been added, there is no way to tell what each contributed. Chapter 7 asks the same question about the copies that sampling produces.'},

{t:'h3', text:'Synchronous demodulation'},
{t:'p', text:'A modulated signal $z(t)=x(t)\\cos(\\omega_ct)$ arrives at a receiver. The message is band-limited, $X(j\\omega)=0$ for $|\\omega|>W$, with $W<\\omega_c$. The receiver multiplies by the same carrier again. The identity $\\cos^{2}\\theta=\\tfrac12(1+\\cos2\\theta)$ splits the product into the message and a new modulated signal:'},
{t:'eq', tex:'y(t)=z(t)\\cos(\\omega_ct)=x(t)\\cos^{2}(\\omega_ct)=\\tfrac12x(t)+\\tfrac12x(t)\\cos(2\\omega_ct).'},
{t:'p', text:'Transform term by term. The first term gives $\\tfrac12X(j\\omega)$. The second is the modulation result with carrier $2\\omega_c$, times $\\tfrac12$: two copies of height $\\tfrac14$ centred at $\\pm2\\omega_c$:'},
{t:'eq', tex:'Y(j\\omega)=\\tfrac12X(j\\omega)+\\tfrac14X\\bigl(j(\\omega-2\\omega_c)\\bigr)+\\tfrac14X\\bigl(j(\\omega+2\\omega_c)\\bigr).'},
{t:'p', text:'The copy at $+2\\omega_c$ occupies $2\\omega_c-W\\le\\omega\\le2\\omega_c+W$, so it begins at $2\\omega_c-W$. A low-pass filter of gain 2 whose cutoff lies between $W$ and $2\\omega_c-W$ keeps $\\tfrac12X$, doubles it, and removes both copies. Its output is $x(t)$. The interval for the cutoff is not empty because $W<2\\omega_c-W$ is the same as $W<\\omega_c$. With $W=3\\pi$ and $\\omega_c=5\\pi$ rad/s, for example, the cutoff may be as high as $2\\omega_c-W=10\\pi-3\\pi=7\\pi$.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,2.3],xlabel:'\\omega',ylabel:'Z',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1,2],yticksLeft:true},
     {xr:[-15*PI,15*PI],xticksOverride:[-12*PI,-6*PI,0,6*PI,12*PI],xtickfmt:piTick}));
   const tri=(w,c,h)=>h*Math.max(0,1-Math.abs(w-c)/(2*PI)); const Z=w=>tri(w,6*PI,0.5)+tri(w,-6*PI,0.5);
   a.area(Z,-15*PI,15*PI,{color:C.in+'29',n:1600}); a.curve(Z,{color:C.in,n:4000}); return a.svg(); }, cap:'$Z(j\\omega)$ at the receiver.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,2.3],xlabel:'\\omega',ylabel:'Y',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1,2],yticksLeft:true},
     {xr:[-15*PI,15*PI],xticksOverride:[-12*PI,-6*PI,0,6*PI,12*PI],xtickfmt:piTick}));
   const tri=(w,c,h)=>h*Math.max(0,1-Math.abs(w-c)/(2*PI)); const Y=w=>tri(w,0,0.5)+tri(w,12*PI,0.25)+tri(w,-12*PI,0.25);
   a.area(Y,-15*PI,15*PI,{color:C.mid+'29',n:1600}); a.curve(Y,{color:C.mid,n:4000});
   a.rect(-4*PI,0,4*PI,2,{stroke:C.h,dash:'6 4',width:1.6}); return a.svg(); }, cap:'$Y(j\\omega)$ and the filter (dashed box).'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,2.3],xlabel:'\\omega',ylabel:'X',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1,2],yticksLeft:true},
     {xr:[-15*PI,15*PI],xticksOverride:[-12*PI,-6*PI,0,6*PI,12*PI],xtickfmt:piTick}));
   const tri=w=>Math.max(0,1-Math.abs(w)/(2*PI));
   a.area(tri,-15*PI,15*PI,{color:C.out+'29',n:1600}); a.curve(tri,{color:C.out,n:4000}); return a.svg(); }, cap:'The filter output: $X(j\\omega)$.'}
]},
{t:'p', text:'In the figure $W=2\\pi$ and $\\omega_c=6\\pi$. The copies of $Y$ lie on $10\\pi\\le|\\omega|\\le14\\pi$, far outside a filter of gain 2 on $|\\omega|<4\\pi$.'},
{t:'p', text:'The receiver must use the carrier with the right phase, which is why the scheme is called <b>synchronous</b>. Suppose it multiplies by $\\cos(\\omega_ct+\\phi)$. The identity $\\cos\\alpha\\cos\\beta=\\tfrac12\\cos(\\alpha-\\beta)+\\tfrac12\\cos(\\alpha+\\beta)$ with $\\alpha=\\omega_ct+\\phi$ and $\\beta=\\omega_ct$ gives $\\cos(\\omega_ct)\\cos(\\omega_ct+\\phi)=\\tfrac12\\cos\\phi+\\tfrac12\\cos(2\\omega_ct+\\phi)$. The filter keeps and doubles the first term only, and returns $x(t)\\cos\\phi$. At $\\phi=\\pi/2$ nothing is left.'},

{t:'h3', text:'A band-pass filter with a tunable centre'},
{t:'p', text:'A fixed ideal low-pass filter $H_{\\text{lp}}$, with gain 1 for $|\\omega|<\\omega_0$ and 0 beyond, can pass a band around any chosen frequency $\\omega_c$. Multiply the input by $e^{-j\\omega_ct}$, filter, and multiply by $e^{j\\omega_ct}$. Only the oscillator frequency $\\omega_c$ is turned; the filter never changes:'},
{t:'eq', tex:'x(t)\\;\\xrightarrow{\\;\\times\\,e^{-j\\omega_c t}\\;}\\;v_1(t)\\;\\longrightarrow\\;\\boxed{H_{\\text{lp}}}\\;\\longrightarrow\\;v_2(t)\\;\\xrightarrow{\\;\\times\\,e^{j\\omega_c t}\\;}\\;y(t)'},
{t:'p', text:'Follow the spectrum through the three steps. Each multiplication by $e^{\\pm j\\omega_ct}$ is a frequency shift. The frequency-shift property with the shift $-\\omega_c$ replaces $\\omega$ by $\\omega+\\omega_c$. The filter multiplies. The last shift replaces $\\omega$ by $\\omega-\\omega_c$ in everything before it:'},
{t:'eq', tex:'\\begin{aligned}V_1(j\\omega)&=X\\bigl(j(\\omega+\\omega_c)\\bigr),\\\\V_2(j\\omega)&=H_{\\text{lp}}(j\\omega)\\,X\\bigl(j(\\omega+\\omega_c)\\bigr),\\\\Y(j\\omega)&=V_2\\bigl(j(\\omega-\\omega_c)\\bigr)=H_{\\text{lp}}\\bigl(j(\\omega-\\omega_c)\\bigr)\\,X(j\\omega).\\end{aligned}'},
{t:'p', text:'$H_{\\text{lp}}\\bigl(j(\\omega-\\omega_c)\\bigr)=1$ exactly when $|\\omega-\\omega_c|<\\omega_0$. So $Y=X$ on $\\omega_c-\\omega_0<\\omega<\\omega_c+\\omega_0$ and $Y=0$ elsewhere: a band-pass filter of width $2\\omega_0$ centred at $\\omega_c$. With $\\omega_c=12$ and $\\omega_0=3$ rad/s, only $9<\\omega<15$ reaches the output; with $\\omega_c=8$ and $\\omega_0=1$ rad/s, only $7<\\omega<9$.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,1.45],xlabel:'\\omega',ylabel:'X',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1],yticksLeft:true},W_(-8*PI,8*PI,4*PI)));
   const X=w=>1/(1+Math.pow(w/10,2)); a.area(X,9,15,{color:C.in+'29',n:600}); a.curve(X,{color:C.in,n:3000}); return a.svg(); }, cap:'$X(j\\omega)$; the band near $\\omega_c$ is shaded.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,1.45],xlabel:'\\omega',ylabel:'V_1',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1],yticksLeft:true},W_(-8*PI,8*PI,4*PI)));
   const V=w=>1/(1+Math.pow((w+12)/10,2)); a.area(V,-3,3,{color:C.mid+'29',n:600}); a.curve(V,{color:C.mid,n:3000});
   a.rect(-3,0,3,1.2,{stroke:C.h,dash:'6 4',width:1.6}); return a.svg(); }, cap:'Shifted down by $\\omega_c$; the dashed box is $H_{\\text{lp}}$.'},
 {svg:()=>{ const a=ax(Object.assign({w:225,h:170,yr:[-0.15,1.45],xlabel:'\\omega',ylabel:'Y',pad:{l:40,r:14,t:28,b:34},yticksOverride:[0.5,1],yticksLeft:true},W_(-8*PI,8*PI,4*PI)));
   const X=w=>1/(1+Math.pow(w/10,2)); const Y=w=>Math.abs(w-12)<3?X(w):0;
   a.curve(X,{color:C.in,dash:'6 4',width:1.3,n:3000}); a.area(Y,-26,26,{color:C.out+'29',n:1600}); a.curve(Y,{color:C.out,n:4000}); return a.svg(); }, cap:'Shifted back: $Y(j\\omega)$ on $9<\\omega<15$.'}
]},
{t:'p', text:'The band near $-\\omega_c$ is not passed. So $Y$ is not conjugate-symmetric, and $y(t)$ is complex even when $x(t)$ is real (Section 5.4).'},

{t:'ex', hd:'Example 5.23 — the square of a sinc', rows:[
 ['Given','$x(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$, so $X(j\\omega)=1$ on $|\\omega|<2\\pi$, and $z(t)=x^{2}(t)$.'],
 ['Find','$Z(j\\omega)$ and $Z(j0)$.'],
 ['Method','Multiplication in time is convolution in frequency, with $1/2\\pi$. Convolve the band with itself by sliding one copy across the other and measuring the overlap.'],
 ['Solution','Two rectangles of height $A$ and half-width $\\omega_0$ convolve to a triangle. At zero shift the overlap is the full $2\\omega_0$ wide, which gives the apex $A\\cdot A\\cdot2\\omega_0=2A^{2}\\omega_0$. The overlap shrinks linearly to nothing at shift $\\pm2\\omega_0$, so the triangle lives on $|\\omega|\\le2\\omega_0$. Here $A=1$ and $\\omega_0=2\\pi$, so $X*X$ is a triangle of apex $2\\cdot1\\cdot2\\pi=4\\pi$ on $|\\omega|\\le4\\pi$. The $1/2\\pi$ of the multiplication property scales the apex to $4\\pi/2\\pi=2$: $$Z(j\\omega)=\\frac{1}{2\\pi}(X*X)(j\\omega)=2\\Bigl(1-\\frac{|\\omega|}{4\\pi}\\Bigr),\\qquad|\\omega|\\le4\\pi,$$ and 0 beyond. So $Z(j0)=2$. The spectrum of the square is twice as wide as $X$.'],
 ['Check','In time, $x(0)=2\\pi/\\pi=2$ (Example 5.6 with $W=2\\pi$), so $z(0)=x(0)^{2}=4$. Through the transform, $z(0)=\\frac{1}{2\\pi}\\int Z\\,\\d\\omega$, and the triangle has area $\\tfrac12\\cdot8\\pi\\cdot2=8\\pi$, so $z(0)=8\\pi/2\\pi=4$. The two agree.']
]},
{t:'ex', hd:'Example 5.24 — the product of two different bands', rows:[
 ['Given','$x_1(t)=\\dfrac{\\sin(2\\pi t)}{\\pi t}$ and $x_2(t)=\\dfrac{\\sin(4\\pi t)}{\\pi t}$, so $X_1=1$ on $|\\omega|<2\\pi$ and $X_2=1$ on $|\\omega|<4\\pi$.'],
 ['Find','The transform $Z$ of $z(t)=x_1(t)x_2(t)$, and the peak $z(0)$.'],
 ['Method','As in Example 5.23: convolve the bands, then divide by $2\\pi$. Track the overlap as the narrow band slides across the wide one.'],
 ['Solution','For shifts $|\\omega|\\le4\\pi-2\\pi=2\\pi$, the narrow band lies wholly inside the wide one, so the overlap stays at its full width $4\\pi$. The convolution is flat there at $4\\pi$, and $Z=4\\pi/2\\pi=2$. Beyond that the overlap shrinks linearly and reaches zero when the bands just touch, at the sum of the half-widths, $|\\omega|=2\\pi+4\\pi=6\\pi$. So $Z$ is a trapezoid: $2$ on $|\\omega|\\le2\\pi$, falling linearly to 0 at $|\\omega|=6\\pi$. The flat top has half-width equal to the difference of the half-widths, and it shrinks to a point when they are equal, which gives the triangle of Example 5.23.'],
 ['Check','The peak in time is the product of the two peaks, $z(0)=x_1(0)x_2(0)=2\\times4=8$. The trapezoid has parallel sides $4\\pi$ and $12\\pi$ and height 2, so its area is $\\tfrac12(4\\pi+12\\pi)\\cdot2=16\\pi$, and $z(0)=16\\pi/2\\pi=8$. The two agree.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.2,2.5],xlabel:'\\omega',ylabel:'Z(j\\omega)',yticksOverride:[1,2],yticksLeft:true},W_(-6*PI,6*PI,2*PI)));
   const tri=w=>Math.abs(w)<4*PI?2*(1-Math.abs(w)/(4*PI)):0;
   a.curve(w=>Math.abs(w)<2*PI?1:0,{color:C.in,dash:'7 5',width:1.4,n:3000});
   a.area(tri,-6*PI,6*PI,{color:C.out+'29',n:900}); a.curve(tri,{color:C.out,n:2400}); return a.svg(); },
  cap:'Example 5.23: the triangle of apex 2 on $|\\omega|\\le4\\pi$; dashed, the band $X$.'},
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.2,2.5],xlabel:'\\omega',ylabel:'Z(j\\omega)',yticksOverride:[1,2],yticksLeft:true},W_(-6*PI,6*PI,2*PI)));
   const lo=2*PI, hi=6*PI, trap=w=>{ const aw=Math.abs(w); if(aw<=lo) return 2; if(aw>=hi) return 0; return 2*(hi-aw)/(hi-lo); };
   a.area(trap,-6*PI,6*PI,{color:C.mid+'29',n:900}); a.curve(trap,{color:C.mid,n:3000}); return a.svg(); },
  cap:'Example 5.24: the trapezoid, flat on $|\\omega|\\le2\\pi$ and zero beyond $6\\pi$.'}
]},

/* =================================================== 5.6 */
{t:'h2', num:'5.6', text:'Systems from a differential equation'},
{t:'p', text:'The Fourier transform converts a linear differential equation with constant coefficients into an algebraic equation. Start from'},
{t:'eq', tex:'\\sum_{k=0}^{N}a_k\\frac{\\d^{k}y(t)}{\\d t^{k}}=\\sum_{k=0}^{M}b_k\\frac{\\d^{k}x(t)}{\\d t^{k}}.'},
{t:'p', text:'Take the transform of both sides. Linearity moves the transform inside each sum and past each constant coefficient, and the differentiation property replaces each derivative $\\d^{k}/\\d t^{k}$ by the factor $(j\\omega)^{k}$:'},
{t:'eq', tex:'\\sum_{k=0}^{N}a_k(j\\omega)^{k}Y(j\\omega)=\\sum_{k=0}^{M}b_k(j\\omega)^{k}X(j\\omega).'},
{t:'p', text:'Both sides now contain a plain product. Factor $Y(j\\omega)$ out of the left sum and $X(j\\omega)$ out of the right sum, and divide. The ratio $Y/X$ is the frequency response, because for an LTI system $Y=XH$:'},
{t:'eqbox', cap:'Frequency response from the coefficients',
 tex:['H(j\\omega)=\\frac{Y(j\\omega)}{X(j\\omega)}=\\frac{\\sum_{k=0}^{M}b_k(j\\omega)^{k}}{\\sum_{k=0}^{N}a_k(j\\omega)^{k}}'],
 after:'The coefficients of the differential equation form two polynomials in $j\\omega$, and their ratio is the frequency response. $H(j\\omega)$ exists when $h$ is absolutely integrable, $\\int|h(t)|\\,\\d t<\\infty$. For an LTI system that is bounded-input bounded-output stability, so an unstable system has no frequency response to plot. The route of this section: transform the equation, read $H(j\\omega)$, expand it into simple fractions, and invert each term with the table of pairs.'},
{t:'p', text:'During the algebra it helps to write $s=j\\omega$. Here $s$ is only a name for $j\\omega$ that shortens the partial-fraction algebra; every expression is a function of the real frequency $\\omega$, and $j\\omega$ is put back at the end. The two inverse pairs needed are $1/(s+a)=1/(a+j\\omega)\\leftrightarrow e^{-at}u(t)$ from Example 5.3 and, below, its repeated form.'},

{t:'ex', hd:'Example 5.25 — simple poles', rows:[
 ['Given','$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$, at rest.'],
 ['Find','$H(j\\omega)$ and $h(t)$.'],
 ['Method','The differential equation has constant coefficients, so the differentiation property turns it into algebra. Form the frequency-response ratio, factor it, expand it into simple fractions, and invert each term.'],
 ['Solution','Take the transform of both sides. Each derivative becomes a power of $j\\omega$, and linearity keeps the coefficients: $$(j\\omega)^{2}Y(j\\omega)+4(j\\omega)Y(j\\omega)+3Y(j\\omega)=(j\\omega)X(j\\omega)+2X(j\\omega).$$ Write $s=j\\omega$, factor out $Y$ on the left and $X$ on the right, and divide: $$H=\\frac{Y}{X}=\\frac{s+2}{s^{2}+4s+3}.$$ Factor the denominator. Its roots are the values of $s$ where $s^{2}+4s+3=0$, that is $s=-1$ and $s=-3$, so $s^{2}+4s+3=(s+1)(s+3)$. The roots are called the <b>poles</b>. Expand into simple fractions: $$\\frac{s+2}{(s+1)(s+3)}=\\frac{A}{s+1}+\\frac{B}{s+3},\\qquad s+2=A(s+3)+B(s+1).$$ Set $s=-1$ so the $B$ term vanishes: $-1+2=A(-1+3)$, so $1=2A$ and $A=\\tfrac12$. Set $s=-3$ so the $A$ term vanishes: $-3+2=B(-3+1)$, so $-1=-2B$ and $B=\\tfrac12$. This is the <b>cover-up rule</b>: cover one factor, and evaluate the rest at the root of that factor, $A=\\frac{s+2}{s+3}\\big|_{s=-1}$ and $B=\\frac{s+2}{s+1}\\big|_{s=-3}$. Hence $$H(j\\omega)=\\frac{1/2}{1+j\\omega}+\\frac{1/2}{3+j\\omega},$$ and each fraction is the pair of Example 5.3, so $$h(t)=\\Bigl[\\tfrac12e^{-t}+\\tfrac12e^{-3t}\\Bigr]u(t).$$'],
 ['Check','At $\\omega=0$, $H(j0)=2/3$ from the ratio. The transform at $\\omega=0$ is the area, and $\\int_{0}^{\\infty}h\\,\\d t=\\tfrac12\\cdot1+\\tfrac12\\cdot\\tfrac13=\\tfrac12+\\tfrac16=\\tfrac23$, which agrees. Also $h(0^{+})=\\tfrac12+\\tfrac12=1$. The poles $s=-1$ and $s=-3$ are negative, so both exponentials decay, $h$ is absolutely integrable, the system is stable, and $H$ exists.']
]},
{t:'h3', text:'The frequency response of the example'},
{t:'p', text:'The modulus of a quotient of products is the quotient of the products of the moduli. The angle is the numerator angle minus the denominator angles, and each factor $c+j\\omega$ with $c>0$ has angle $\\tan^{-1}(\\omega/c)$:'},
{t:'eq', tex:'\\begin{aligned}|H(j\\omega)|&=\\frac{|2+j\\omega|}{|1+j\\omega|\\,|3+j\\omega|}=\\frac{\\sqrt{4+\\omega^{2}}}{\\sqrt{1+\\omega^{2}}\\,\\sqrt{9+\\omega^{2}}},\\\\\\angle H(j\\omega)&=\\tan^{-1}\\frac{\\omega}{2}-\\tan^{-1}\\omega-\\tan^{-1}\\frac{\\omega}{3}.\\end{aligned}'},
{t:'p', text:'At $\\omega=0$ the system passes $2/3=0.667$ of a constant. For large $\\omega$ the numerator has one factor and the denominator two, so $|H|\\approx\\omega/\\omega^{2}=1/\\omega$; at $\\omega=100$ rad/s, $|H|=0.009997\\approx0.01$. Each arctangent tends to $\\pi/2$, so the phase tends to $\\pi/2-\\pi/2-\\pi/2=-\\pi/2$. The magnitude is even and the phase is odd, as a real $h$ requires.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-0.08,0.8],xlabel:'\\omega',ylabel:'|H(j\\omega)|',yticksOverride:[0.3333,0.6667],ytickfmt:v=>v.toFixed(2),yticksLeft:true},W_(-3*PI,3*PI,PI)));
   a.curve(w=>Math.hypot(2,w)/(Math.hypot(1,w)*Math.hypot(3,w)),{color:C.h,n:2000}); a.point(0,2/3,{color:C.coral,r:3.6}); return a.svg(); }, cap:'The magnitude, $2/3$ at $\\omega=0$.'},
 {svg:()=>{ const a=ax(Object.assign({w:340,h:180,yr:[-1.7,1.7],xlabel:'\\omega',ylabel:'\\angle H(j\\omega)',yticksOverride:[-1.5708,-0.7854,0.7854,1.5708],ytickfmt:v=>v.toFixed(2),yticksLeft:true},W_(-3*PI,3*PI,PI)));
   a.curve(w=>Math.atan2(w,2)-Math.atan2(w,1)-Math.atan2(w,3),{color:C.mid,n:2000}); return a.svg(); }, cap:'The phase in rad, odd in $\\omega$.'}
]},

{t:'h3', text:'Repeated poles'},
{t:'p', text:'The cover-up rule assumes each factor of the denominator appears once. When a factor $(s-\\lambda)$ appears $m$ times, one term is needed for each power:'},
{t:'eq', tex:'F(s)=\\frac{N(s)}{(s-\\lambda)^{m}Q(s)}=\\frac{c_{m}}{(s-\\lambda)^{m}}+\\dots+\\frac{c_{1}}{s-\\lambda}+(\\text{terms from }Q).'},
{t:'p', text:'Covering up fails here. Multiply by $(s-\\lambda)$ only, and $m-1$ factors survive below, so setting $s=\\lambda$ divides by zero. Multiply by the full $(s-\\lambda)^{m}$ instead: then $(s-\\lambda)^{m}F(s)=c_m+c_{m-1}(s-\\lambda)+\\dots+c_1(s-\\lambda)^{m-1}+(s-\\lambda)^{m}(\\text{terms from }Q)$. Setting $s=\\lambda$ removes every term except $c_m$. To reach the next coefficient, differentiate once before setting $s=\\lambda$: the constant $c_m$ disappears, the term $c_{m-1}(s-\\lambda)$ leaves $c_{m-1}$, and every other term still carries a factor $(s-\\lambda)$ and vanishes. Each further derivative peels off one more coefficient, with a factorial from differentiating the power.'},
{t:'eqbox', cap:'Repeated-pole rule',
 tex:['c_{m-k}=\\frac{1}{k!}\\left.\\frac{\\d^{k}}{\\d s^{k}}\\Bigl[(s-\\lambda)^{m}F(s)\\Bigr]\\right|_{s=\\lambda},\\qquad k=0,1,\\dots,m-1'],
 after:'The case $k=0$ is the cover-up rule and gives $c_m$.'},
{t:'p', text:'The inverse pairs follow from the differentiation-in-frequency property of Section 5.4. That property gave $te^{-at}u(t)\\leftrightarrow1/(a+j\\omega)^{2}$. Suppose $\\frac{t^{n-1}}{(n-1)!}e^{-at}u(t)\\leftrightarrow(a+j\\omega)^{-n}$ for some $n\\ge1$. Multiply the signal by $t/n$; the property multiplies the transform by $j/n$ and differentiates it:'},
{t:'eq', tex:'\\frac{t^{n}}{n!}e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{j}{n}\\,\\frac{\\d}{\\d\\omega}(a+j\\omega)^{-n}=\\frac{j}{n}\\cdot(-n)\\,j\\,(a+j\\omega)^{-n-1}=\\frac{1}{(a+j\\omega)^{n+1}}.'},
{t:'p', text:'So by induction $\\frac{t^{n-1}}{(n-1)!}e^{-at}u(t)\\leftrightarrow1/(a+j\\omega)^{n}$ for every $n\\ge1$, with $a>0$. A repeated pole always brings a power of $t$ into the time domain. The double pole gives $te^{-at}u(t)$, which starts at 0 and peaks at $t=1/a$; for example $1/(j\\omega+2)^{2}\\leftrightarrow te^{-2t}u(t)$.'},

{t:'ex', hd:'Example 5.26 — a repeated pole, and the check that catches a sign', rows:[
 ['Given','The system of Example 5.25, $H(j\\omega)=\\dfrac{j\\omega+2}{(j\\omega+1)(j\\omega+3)}$, with input $x(t)=e^{-t}u(t)$.'],
 ['Find','$y(t)$.'],
 ['Method','The input passes through an LTI system, so calculate $Y=XH$. Write $s=j\\omega$, expand $Y$ into partial fractions with the repeated-pole rule, and invert each term.'],
 ['Solution','Example 5.3 gives $X=1/(s+1)$. Multiply: $$Y=\\frac{1}{s+1}\\cdot\\frac{s+2}{(s+1)(s+3)}=\\frac{s+2}{(s+1)^{2}(s+3)}.$$ The input pole coincides with a system pole, so $s=-1$ is now a double pole. One term is needed for each power of $(s+1)$, so $Y$ splits into three terms: $$Y=\\frac{A}{s+1}+\\frac{B}{(s+1)^{2}}+\\frac{C}{s+3}.$$ For $B$, multiply by $(s+1)^{2}$ and set $s=-1$: $$B=\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\left.\\frac{s+2}{s+3}\\right|_{s=-1}=\\frac{-1+2}{-1+3}=\\frac12.$$ For $A$, differentiate the same product once before setting $s=-1$. By the quotient rule, $\\frac{\\d}{\\d s}\\frac{s+2}{s+3}=\\frac{(s+3)\\cdot1-(s+2)\\cdot1}{(s+3)^{2}}=\\frac{1}{(s+3)^{2}}$, so $$A=\\frac{\\d}{\\d s}\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\left.\\frac{1}{(s+3)^{2}}\\right|_{s=-1}=\\frac{1}{2^{2}}=\\frac14.$$ For $C$, the factor $(s+3)$ is simple, so cover it up and set $s=-3$: $$C=\\Bigl[(s+3)Y\\Bigr]_{s=-3}=\\left.\\frac{s+2}{(s+1)^{2}}\\right|_{s=-3}=\\frac{-3+2}{(-3+1)^{2}}=\\frac{-1}{4}=-\\frac14.$$ $C$ is negative, and the minus is most easily lost on the line where the three fractions are written out together. Invert term by term with $1/(s+a)\\leftrightarrow e^{-at}u(t)$ and $1/(s+a)^{2}\\leftrightarrow te^{-at}u(t)$: $$y(t)=\\left[\\tfrac14e^{-t}+\\tfrac12t\\,e^{-t}-\\tfrac14e^{-3t}\\right]u(t).$$'],
 ['Check','$y=x*h$ with $x$ and $h$ causal, so $y(0)=0$. The answer gives $y(0)=\\frac14+0-\\frac14=0$. Assembling $C$ as $+\\frac14$ instead gives $y(0)=\\frac14+0+\\frac14=\\frac12$, which no convolution of two causal signals can give. Comparing curves elsewhere decides little: at $t=2$ the two candidates are $0.1685$ and $0.1698$, which agree only to two decimals, while at $t=0$ they differ by $0.5$. Convolving $x$ with $h$ directly, $$y(t)=\\int_{0}^{t}e^{-(t-\\tau)}\\Bigl[\\tfrac12e^{-\\tau}+\\tfrac12e^{-3\\tau}\\Bigr]\\d\\tau=e^{-t}\\Bigl[\\tfrac12t+\\tfrac14\\bigl(1-e^{-2t}\\bigr)\\Bigr],$$ returns the same three terms with the same signs. The middle step uses $\\int_{0}^{t}\\tfrac12e^{-2\\tau}\\,\\d\\tau=\\tfrac14(1-e^{-2t})$.']
]},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-0.4,4],yr:[-0.08,0.62],xlabel:'t\\;[\\text{s}]',ylabel:'y(t)',xtarget:7,yticksOverride:[0,0.25,0.5],yticksLeft:true});
  a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)-0.25*Math.exp(-3*t),{color:C.out,width:2.4,n:2400});
  a.curve(t=>t<0?0:0.25*Math.exp(-t)+0.5*t*Math.exp(-t)+0.25*Math.exp(-3*t),{color:C.err,width:1.8,dash:'6 4',n:2400});
  a.point(0,0,{color:C.coral,r:4}); a.point(0,0.5,{color:C.err,r:4});
  return a.svg(); },
  cap:'The output with $C=-\\frac14$ (solid) and, dashed, the version with the sign lost. They differ by $0.5$ at the origin and by about $0.001$ at $t=2$.'},

/* =================================================== 5.7 */
{t:'h2', num:'5.7', text:'Summary'},
{t:'h3', text:'Properties'},
{t:'table', cap:'Properties of the continuous-time Fourier transform.', head:['Property','Statement'], rows:[
 ['Linearity','$a x_1(t)+b x_2(t)\\;\\leftrightarrow\\;a X_1(j\\omega)+b X_2(j\\omega)$'],
 ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)$'],
 ['Frequency shift','$e^{j\\omega_0t}x(t)\\;\\leftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)$'],
 ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;X^{*}(-j\\omega)$'],
 ['Time reversal','$x(-t)\\;\\leftrightarrow\\;X(-j\\omega)$'],
 ['Time scaling','$x(at)\\;\\leftrightarrow\\;\\frac{1}{|a|}X(j\\omega/a)$'],
 ['Convolution','$x(t)*h(t)\\;\\leftrightarrow\\;X(j\\omega)H(j\\omega)$'],
 ['Multiplication','$x(t)y(t)\\;\\leftrightarrow\\;\\frac{1}{2\\pi}X(j\\omega)*Y(j\\omega)$'],
 ['Duality','$X(t)\\;\\leftrightarrow\\;2\\pi x(-\\omega)$'],
 ['Differentiation in time','$\\d^{n}x/\\d t^{n}\\;\\leftrightarrow\\;(j\\omega)^{n}X(j\\omega)$'],
 ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;\\frac{1}{j\\omega}X(j\\omega)+\\pi X(0)\\delta(\\omega)$'],
 ['Differentiation in frequency','$t\\,x(t)\\;\\leftrightarrow\\;j\\,\\d X(j\\omega)/\\d\\omega$'],
 ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$: $|X|$ even, $\\angle X$ odd'],
 ['Real and even','$X(j\\omega)$ real and even'],
 ['Real and odd','$X(j\\omega)$ purely imaginary and odd'],
 ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
 ['Parseval','$\\int|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int|X(j\\omega)|^{2}\\,\\d\\omega$']
]},
{t:'p', text:'Two rows carry a condition. Integration keeps $\\pi X(0)\\delta(\\omega)$ whenever the signal has non-zero area. Scaling carries $1/|a|$, with the modulus, so a reversal is counted once. Check every answer at $\\omega=0$ against the area.'},
{t:'h3', text:'Transform pairs'},
{t:'table', cap:'Continuous-time Fourier transform pairs.', head:['Signal','Pair'], rows:[
 ['Impulse','$\\delta(t)\\;\\leftrightarrow\\;1$'],
 ['Shifted impulse','$\\delta(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}$'],
 ['Unit step','$u(t)\\;\\leftrightarrow\\;\\frac{1}{j\\omega}+\\pi\\delta(\\omega)$'],
 ['One-sided exponential','$e^{-at}u(t)\\;\\leftrightarrow\\;\\frac{1}{a+j\\omega}$, $a>0$'],
 ['Repeated pole','$\\frac{t^{n-1}}{(n-1)!}e^{-at}u(t)\\;\\leftrightarrow\\;\\frac{1}{(a+j\\omega)^{n}}$, $a>0$'],
 ['Two-sided exponential','$e^{-a|t|}\\;\\leftrightarrow\\;\\frac{2a}{a^{2}+\\omega^{2}}$, $a>0$'],
 ['Rectangular pulse','$1$ on $|t|<T_1\\;\\leftrightarrow\\;\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)$'],
 ['Ideal low-pass band','$\\frac{\\sin(Wt)}{\\pi t}\\;\\leftrightarrow\\;1$ on $|\\omega|<W$'],
 ['Constant','$1\\;\\leftrightarrow\\;2\\pi\\delta(\\omega)$'],
 ['Complex exponential','$e^{j\\omega_0t}\\;\\leftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0)$'],
 ['Cosine','$\\cos(\\omega_0t)\\;\\leftrightarrow\\;\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$'],
 ['Sine','$\\sin(\\omega_0t)\\;\\leftrightarrow\\;\\frac{\\pi}{j}\\delta(\\omega-\\omega_0)-\\frac{\\pi}{j}\\delta(\\omega+\\omega_0)$'],
 ['Periodic signal','$\\sum_k a_ke^{jk\\omega_0t}\\;\\leftrightarrow\\;\\sum_k 2\\pi a_k\\delta(\\omega-k\\omega_0)$'],
 ['Square wave','$1$ on $|t|<T_1$ in each period $T$ $\\;\\leftrightarrow\\;\\sum_{k\\neq0}\\frac{2\\sin(k\\omega_0T_1)}{k}\\delta(\\omega-k\\omega_0)+\\frac{4\\pi T_1}{T}\\delta(\\omega)$'],
 ['Impulse train','$\\sum_k\\delta(t-kT)\\;\\leftrightarrow\\;\\frac{2\\pi}{T}\\sum_k\\delta\\bigl(\\omega-\\frac{2\\pi k}{T}\\bigr)$']
]},
{t:'p', text:'Every sinc in the table is unnormalised, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$; a table in the normalised convention divides the argument by $\\pi$. The exponential pairs hold only for $a>0$.'},
{t:'h3', text:'What to carry forward'},
{t:'ul', items:[
 'Let the period of a pulse train grow: $T a_k$ samples one envelope, and in the limit the envelope is $X(j\\omega)$.',
 'Analysis integrates over $t$ and returns $X(j\\omega)$; synthesis integrates over $\\omega$, carries $1/2\\pi$, and returns $x(t)$.',
 'Finite energy <b>or</b> the Dirichlet conditions is enough; neither is necessary. At a jump the synthesis integral gives the midpoint, and a cut-off band leaves an overshoot of about $0.09$ that does not shrink.',
 'The sinc convention here is $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, and it is stated at every point of use.',
 'Narrowing a signal in time widens its spectrum. Finite duration forbids band limitation; infinite duration guarantees nothing.',
 'A periodic signal transforms to impulses of weight $2\\pi a_k$ at the harmonics, not to the coefficients themselves.',
 'A delay multiplies by $e^{-j\\omega t_0}$: the magnitude stays and the phase gains $-\\omega t_0$. A real signal has an even magnitude and an odd phase.',
 'Convolution in time is multiplication in frequency; multiplication in time is convolution in frequency, with $1/2\\pi$. A carrier makes two copies at half height. Copies always appear; overlap is a separate event and is what loses information.',
 'Parseval: $\\int|x|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int|X|^{2}\\,\\d\\omega$, with $R=1\\,\\Omega$.',
 'A differential equation gives $H(j\\omega)$ as a ratio of polynomials in $j\\omega$; partial fractions and the table give $h(t)$. A repeated pole needs the derivative rule, and a causal convolution must start at zero.'
]},
{t:'p', text:'Everything here was continuous time. A computer sees a sequence, not a signal, and the same question has to be asked again for $x[n]$. One thing changes, and it changes everything: $e^{-j(\\omega+2\\pi)n}=e^{-j\\omega n}$ for every integer $n$, so a discrete-time spectrum repeats with period $2\\pi$. That is Chapter 6.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'5.1', text:'A pulse train is 1 on $|t|<1$ in each period $T_0=6$ s. Write $T_0a_k$ as a sample of the pulse envelope and find $a_0$ and $a_1$.', ans:'The envelope is the transform of one pulse, $E(\\omega)=2\\sin\\omega/\\omega$, and $T_0a_k=E(k\\omega_0)$ with $\\omega_0=2\\pi/6=\\pi/3$ rad/s. At $k=0$ the envelope is its limit $2$, so $a_0=2/6=1/3$. At $k=1$, $a_1=\\frac{1}{6}\\cdot\\frac{2\\sin(\\pi/3)}{\\pi/3}=\\frac{1}{6}\\cdot\\frac{2(0.8660)(3)}{\\pi}=0.2757$.'},
{t:'q', n:'5.2', text:'Find the transform of $x(t)=e^{-3|t|}$ and give its values at $\\omega=0$ and $\\omega=3$ rad/s.', ans:'The two-sided pair with $a=3$ gives $X(j\\omega)=\\frac{6}{9+\\omega^{2}}$. So $X(j0)=6/9=2/3$ and $X(j3)=6/18=1/3$: at $\\omega=a$ the spectrum is half its peak.'},
{t:'q', n:'5.3', text:'A pulse is 1 on $|t|<2$. Write its transform with the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, and find $X(j0)$ and the first zero with $\\omega>0$.', ans:'With $T_1=2$, $X(j\\omega)=\\frac{2\\sin(2\\omega)}{\\omega}=4\\operatorname{sinc}(2\\omega)$. $X(j0)=2T_1=4$, the area of the pulse. The first zero is at $2\\omega=\\pi$, so $\\omega=\\pi/2$ rad/s.'},
{t:'q', n:'5.4', text:'Find the transform of $x(t)=2+\\cos(4t)-\\sin(4t)$. Give the weight of each impulse and check that the two weights at $\\pm4$ are conjugates.', ans:'Term by term: $2\\to4\\pi\\delta(\\omega)$, $\\cos(4t)\\to\\pi\\delta(\\omega-4)+\\pi\\delta(\\omega+4)$ and $-\\sin(4t)\\to-\\frac{\\pi}{j}\\delta(\\omega-4)+\\frac{\\pi}{j}\\delta(\\omega+4)$. With $1/j=-j$, the weight at $\\omega=4$ is $\\pi+j\\pi=\\pi(1+j)$ and at $\\omega=-4$ it is $\\pi-j\\pi=\\pi(1-j)$. They are conjugates, as a real signal requires. The weight at $\\omega=0$ is $4\\pi$.'},
{t:'q', n:'5.5', text:'Find $|X(j2)|$ and $\\angle X(j2)$ for $x(t)=e^{-2(t-3)}u(t-3)$.', ans:'The signal is $e^{-2t}u(t)$ delayed by $t_0=3$ s, so $X(j\\omega)=\\frac{e^{-j3\\omega}}{2+j\\omega}$. At $\\omega=2$: $|X(j2)|=1/|2+j2|=1/\\sqrt8=0.3536$, since the delay factor has magnitude 1. The phase is $-3(2)-\\arctan(2/2)=-6-\\pi/4=-6.785$ rad.'},
{t:'q', n:'5.6', text:'Use Parseval’s relation to find the energy of $x(t)=\\frac{\\sin(4t)}{\\pi t}$, with $R=1\\,\\Omega$.', ans:'The ideal low-pass pair with $W=4$ gives $X(j\\omega)=1$ on $|\\omega|<4$ and 0 outside. So $E=\\frac{1}{2\\pi}\\int_{-4}^{4}1^{2}\\,\\d\\omega=\\frac{8}{2\\pi}=\\frac{4}{\\pi}=1.273$ J.'},
{t:'q', n:'5.7', text:'$X(j\\omega)$ is zero for $|\\omega|>3$ rad/s and $X(j0)=4$. Describe the spectrum of $x(t)\\cos(10t)$, give the peak height of each copy, and find the smallest carrier frequency for which the copies do not overlap.', ans:'Multiplication by $\\cos(10t)$ gives $\\tfrac12X(j(\\omega-10))+\\tfrac12X(j(\\omega+10))$: two copies, on $7\\le\\omega\\le13$ and $-13\\le\\omega\\le-7$, each peaking at $\\tfrac12\\cdot4=2$. With carrier $\\omega_c$ the copies occupy $[\\omega_c-3,\\omega_c+3]$ and $[-\\omega_c-3,-\\omega_c+3]$. They stay apart when $\\omega_c-3\\ge-\\omega_c+3$, that is, $\\omega_c\\ge3$ rad/s.'},
{t:'q', n:'5.8', text:'A system obeys $\\frac{\\d y}{\\d t}+4y(t)=2x(t)$. Find $H(j\\omega)$ and $h(t)$, then the output for $x(t)=e^{-2t}u(t)$.', ans:'Take the transform of both sides: $(j\\omega+4)Y=2X$, so $H(j\\omega)=\\frac{2}{4+j\\omega}$ and $h(t)=2e^{-4t}u(t)$. With $X=\\frac{1}{2+j\\omega}$, $Y=\\frac{2}{(2+j\\omega)(4+j\\omega)}=\\frac{1}{2+j\\omega}-\\frac{1}{4+j\\omega}$, from partial fractions with $A=2/(4-2)=1$ and $B=2/(2-4)=-1$. So $y(t)=\\bigl(e^{-2t}-e^{-4t}\\bigr)u(t)$. Check: $y(0)=0$, as a causal convolution requires.'}
];
})();
