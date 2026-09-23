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
{t:'p', lead:true, text:'The continuous-time Fourier transform represents an aperiodic signal by a continuous function of frequency. To derive it, construct a periodic extension of a finite-duration signal and increase the repetition period without bound. The harmonic spacing then approaches zero, and the Fourier-series sum approaches an integral.'},

{t:'h2', num:'5.1', text:'From a series to a transform'},
{t:'p', text:'Let $x(t)$ be zero for $|t|>T_1$. The number $T_1$ is the half-width of the support and belongs to the signal alone. Build a periodic signal $\\tilde{x}$ by repeating the pulse every $T$ seconds, with $T>2T_1$ so that the copies do not touch:'},
{t:'eq', tex:'\\tilde{x}(t)=\\sum_{m=-\\infty}^{\\infty}x(t-mT),\\qquad \\tilde{x}(t)=\\tilde{x}(t+T),\\qquad T>2T_1.'},
{t:'p', text:'Inside one period, $\\tilde{x}$ equals the original pulse, so its Fourier series can be used. Increase $T$ while keeping the central pulse fixed. The neighbouring copies move to larger values of $|t|$, and $\\tilde{x}(t)\\to x(t)$ for every $t$.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:180,xr:[-8,8],yr:[-0.3,1.5],xlabel:'t',ylabel:'\\tilde{x}(t)',ytarget:2,yticksOverride:[0,1]});
  a.curve(t=>rectPer(t,5,1),{color:C.mid,n:3000});
  a.span(0,5,1.2,'T',{color:C.coral,tex:true,fs:13});
  return a.svg(); },
  cap:'The periodic extension with $T=5T_1$. The condition $T>2T_1$ is what keeps the copies apart.'},

{t:'h3', text:'The coefficients are samples of one curve'},
{t:'p', text:'Apply the analysis equation of Chapter 4 to $\\tilde{x}$ over one period. Inside that period $\\tilde{x}=x$, and outside $|t|<T_1$ the integrand is zero, so the limits may be opened to all of time:'},
{t:'eq', tex:'a_k=\\frac{1}{T}\\int_{-T/2}^{T/2}\\tilde{x}(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T}\\int_{-\\infty}^{\\infty}x(t)e^{-jk\\omega_0t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T}.'},
{t:'p', text:'The right-hand integral has the same form for every $k$; only the sampled frequency $k\\omega_0$ changes. Replace that frequency by the continuous variable $\\omega$ and define the transform.'},
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
{t:'p', text:'Every term now includes the spacing $\\omega_0$, so the expression is a Riemann sum. Let $T\\to\\infty$. Then $\\tilde{x}(t)\\to x(t)$, $\\omega_0\\to\\d\\omega$, the sample frequencies cover the frequency axis, and the sum approaches an integral.'},
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
{t:'p', text:'Neither condition is necessary. A constant, a complex exponential and every periodic signal fail both and still have spectra, in the limiting sense: the transform is an impulse, defined by what it does inside an integral, exactly as $\\delta(t)$ is. Take the pair $e^{-a|t|}\\leftrightarrow2a/(a^{2}+\\omega^{2})$ from Example 5.4 and let $a\\to0$. The signal tends to the constant 1. The transform grows tall at $\\omega=0$, where it equals $2/a$, and narrow, since it has fallen to half that height at $\\omega=\\pm a$. Its area does not depend on $a$ at all:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}\\frac{2a}{a^{2}+\\omega^{2}}\\,\\d\\omega&=\\Bigl[2\\tan^{-1}\\!\\frac{\\omega}{a}\\Bigr]_{-\\infty}^{\\infty}\\\\&=2\\Bigl(\\frac{\\pi}{2}\\Bigr)-2\\Bigl(-\\frac{\\pi}{2}\\Bigr)=2\\pi.\\end{aligned}'},
{t:'p', text:'A curve of fixed area $2\\pi$ that becomes tall and narrow is an impulse of weight $2\\pi$. So $1\\leftrightarrow2\\pi\\delta(\\omega)$.'},

{t:'h2', num:'5.3', text:'Basic transform pairs'},

{t:'ex', hd:'Example 5.1 — the impulse and the shifted impulse', rows:[
 ['Given','$x(t)=\\delta(t)$, and then $x(t)=\\delta(t-t_0)$.'],
 ['Find','$X(j\\omega)$ in both cases, with magnitude and phase.'],
 ['Method','The signal is an impulse, so the sifting property evaluates the analysis integral directly. Substitute the impulse into the analysis equation.'],
 ['Solution','Substitute $x(t)=\\delta(t)$ into the analysis equation. The sifting property $\\int\\delta(t)g(t)\\d t=g(0)$ evaluates the exponential at $t=0$: $$\\begin{aligned}\\mathcal{F}\\{\\delta(t)\\}&=\\int_{-\\infty}^{\\infty}\\delta(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=e^{-j\\omega\\cdot0}=1.\\end{aligned}$$ Every frequency is present, equally, with no phase. For the shifted impulse the sifting happens at $t=t_0$, because $\\delta(t-t_0)$ is zero everywhere except at that instant: $$\\begin{aligned}\\mathcal{F}\\{\\delta(t-t_0)\\}&=\\int_{-\\infty}^{\\infty}\\delta(t-t_0)\\,e^{-j\\omega t}\\,\\d t\\\\&=e^{-j\\omega t_0}.\\end{aligned}$$ Write this in polar form: $e^{-j\\omega t_0}$ has modulus 1 and angle $-\\omega t_0$, so $$|X(j\\omega)|=1,\\qquad\\angle X(j\\omega)=-\\omega t_0.$$'],
 ['Check','Push $e^{-j\\omega t_0}$ back through the synthesis equation. Combine the two exponentials first: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}e^{-j\\omega t_0}\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}e^{j\\omega(t-t_0)}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\cdot2\\pi\\,\\delta(t-t_0)=\\delta(t-t_0).\\end{aligned}$$ The last line uses $\\int e^{j\\omega\\tau}\\d\\omega=2\\pi\\delta(\\tau)$, which is the pair $1\\leftrightarrow2\\pi\\delta(\\omega)$ of Section 5.2 with the roles of $t$ and $\\omega$ exchanged. Reading: moving a signal in time never changes the size of any frequency component; it rotates each one by an amount proportional to its frequency.']
]},

{t:'ex', hd:'Example 5.2 — one impulse in frequency', rows:[
 ['Given','$X(j\\omega)=2\\pi\\delta(\\omega-\\omega_0)$.'],
 ['Find','$x(t)$.'],
 ['Method','The spectrum is an impulse, so use the synthesis equation and apply sifting in the variable $\\omega$.'],
 ['Solution','Substitute the spectrum into the synthesis equation. The impulse sits at $\\omega=\\omega_0$, so sifting evaluates $e^{j\\omega t}$ there: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{2\\pi}{2\\pi}\\int_{-\\infty}^{\\infty}\\delta(\\omega-\\omega_0)\\,e^{j\\omega t}\\,\\d\\omega\\\\&=e^{j\\omega_0t}.\\end{aligned}$$ The $2\\pi$ of the impulse weight and the $1/2\\pi$ of the synthesis equation cancel exactly, which is why the weight is written as $2\\pi$ and not as 1.'],
 ['Check','$|x(t)|=1$ and $\\angle x(t)=\\omega_0t$. With an impulse of weight 1 the answer would be $e^{j\\omega_0t}/2\\pi$, which is not a unit-amplitude exponential.']
]},
{t:'eqbox', cap:'Two consequences of the complex-exponential pair',
 tex:['e^{j\\omega_0t}\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega-\\omega_0)','1\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)'],
 after:'The second is the first at $\\omega_0=0$.'},

{t:'ex', hd:'Example 5.3 — the one-sided exponential', rows:[
 ['Given','$x(t)=e^{-at}u(t)$, with $a$ real.'],
 ['Find','$X(j\\omega)$, the condition on $a$, and the magnitude and phase.'],
 ['Method','The unit step makes the signal zero for negative time. Apply the analysis equation from 0 to $\\infty$.'],
 ['Solution','Substitute the signal into the analysis equation. The step $u(t)$ is zero for $t<0$ and 1 for $t>0$, so the lower limit becomes 0 and the step disappears. Then combine the two exponentials into one: $$\\begin{aligned}X(j\\omega)&=\\int_{-\\infty}^{\\infty}e^{-at}u(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\,\\d t.\\end{aligned}$$ The integrand is an exponential in $t$ with constant coefficient $-(a+j\\omega)$, so its antiderivative is the same exponential divided by that coefficient: $$\\begin{aligned}X(j\\omega)&=\\left[\\frac{e^{-(a+j\\omega)t}}{-(a+j\\omega)}\\right]_{0}^{\\infty}\\\\&=\\frac{1}{-(a+j\\omega)}\\Bigl[\\lim_{t\\to\\infty}e^{-(a+j\\omega)t}-e^{0}\\Bigr]\\\\&=\\frac{1}{-(a+j\\omega)}\\bigl[0-1\\bigr]=\\frac{1}{a+j\\omega}.\\end{aligned}$$ The limit at the upper end is zero only when $a>0$: $|e^{-(a+j\\omega)t}|=e^{-at}|e^{-j\\omega t}|=e^{-at}$, because $|e^{-j\\omega t}|=1$, and $e^{-at}\\to0$ needs $a>0$. For $a\\le0$ the integral does not converge and the transform does not exist. So $$e^{-at}u(t)\\;\\longleftrightarrow\\;\\frac{1}{a+j\\omega},\\qquad a>0.$$ For the magnitude, the modulus of a quotient is the quotient of the moduli, and $|a+j\\omega|=\\sqrt{a^{2}+\\omega^{2}}$: $$|X(j\\omega)|=\\frac{|1|}{|a+j\\omega|}=\\frac{1}{\\sqrt{a^{2}+\\omega^{2}}}.$$ For the phase, the angle of a quotient is the angle of the numerator minus the angle of the denominator. The number $a+j\\omega$ has real part $a>0$ and imaginary part $\\omega$, so its angle is $\\tan^{-1}(\\omega/a)$: $$\\angle X(j\\omega)=\\angle1-\\angle(a+j\\omega)=0-\\tan^{-1}(\\omega/a)=-\\tan^{-1}(\\omega/a).$$'],
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
 ['Method','The absolute value gives different exponential formulas for negative and positive time. Split the analysis integral at $t=0$; on the negative-time interval the exponent is $+at$.'],
 ['Solution','For $t<0$ the signal is $e^{-a(-t)}=e^{at}$, and for $t>0$ it is $e^{-at}$. Split the analysis integral at $t=0$ and combine the exponentials in each part: $$\\begin{aligned}X(j\\omega)&=\\int_{-\\infty}^{0}e^{at}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{0}e^{(a-j\\omega)t}\\,\\d t+\\int_{0}^{\\infty}e^{-(a+j\\omega)t}\\,\\d t.\\end{aligned}$$ The second integral is Example 5.3 and equals $1/(a+j\\omega)$. Evaluate the first with its antiderivative. At the lower end, $|e^{(a-j\\omega)t}|=e^{at}\\to0$ as $t\\to-\\infty$ because $a>0$: $$\\begin{aligned}\\int_{-\\infty}^{0}e^{(a-j\\omega)t}\\,\\d t&=\\left[\\frac{e^{(a-j\\omega)t}}{a-j\\omega}\\right]_{-\\infty}^{0}\\\\&=\\frac{e^{0}-0}{a-j\\omega}=\\frac{1}{a-j\\omega}.\\end{aligned}$$ Add the two fractions over the common denominator $(a-j\\omega)(a+j\\omega)=a^{2}-(j\\omega)^{2}=a^{2}+\\omega^{2}$: $$\\begin{aligned}X(j\\omega)&=\\frac{1}{a-j\\omega}+\\frac{1}{a+j\\omega}\\\\&=\\frac{(a+j\\omega)+(a-j\\omega)}{(a-j\\omega)(a+j\\omega)}\\\\&=\\frac{2a}{a^{2}+\\omega^{2}}.\\end{aligned}$$ The imaginary parts $+j\\omega$ and $-j\\omega$ cancelled in the numerator, so the transform is real.'],
 ['Check','$X(j0)=2/a$ gives 4, 2 and 0.4 for $a=0.5,1,5$. The signal is real and even and the transform came out real and even, which is the general rule proved in Section 5.6. Note also that the transform is never zero: at $a=1$ and $\\omega=10^{6}$ it is still $2\\times10^{-12}$.']
]},

{t:'h2', num:'5.4', text:'The rectangular pulse, the sinc, and the inverse relation'},
{t:'ex', hd:'Example 5.5 — the rectangular pulse', rows:[
 ['Given','$x(t)=1$ for $|t|<T_1$ and 0 otherwise.'],
 ['Find','$X(j\\omega)$, its value at the origin, and its zeros.'],
 ['Method','The signal is non-zero only on $-T_1<t<T_1$, so restrict the analysis integral to that support and integrate $e^{-j\\omega t}$.'],
 ['Solution','Substitute the pulse into the analysis equation. Outside $|t|<T_1$ the signal is zero, so those parts of the integral contribute nothing, and inside the signal equals 1: $$\\begin{aligned}X(j\\omega)&=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t=\\int_{-T_1}^{T_1}1\\cdot e^{-j\\omega t}\\,\\d t.\\end{aligned}$$ For $\\omega\\neq0$ the antiderivative of $e^{-j\\omega t}$ is $e^{-j\\omega t}/(-j\\omega)$. Evaluate at the two limits, then move the minus sign of the denominator into the numerator by swapping the two terms: $$\\begin{aligned}X(j\\omega)&=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}\\\\&=\\frac{e^{-j\\omega T_1}-e^{j\\omega T_1}}{-j\\omega}\\\\&=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}.\\end{aligned}$$ Euler gives $e^{j\\theta}-e^{-j\\theta}=(\\cos\\theta+j\\sin\\theta)-(\\cos\\theta-j\\sin\\theta)=2j\\sin\\theta$. With $\\theta=\\omega T_1$: $$X(j\\omega)=\\frac{2j\\sin(\\omega T_1)}{j\\omega}=\\frac{2\\sin(\\omega T_1)}{\\omega}.$$ The $j$ cancels, so the answer is real. At $\\omega=0$ the integrand is 1 and the integral is the width $2T_1$ directly.'],
 ['Check','At the origin the formula reads $0/0$. L’Hôpital, differentiating numerator and denominator with respect to $\\omega$, gives $\\lim_{\\omega\\to0}2T_1\\cos(\\omega T_1)/1=2T_1$, which agrees with the direct value and is the area under the pulse: 2, 10 and 20 for $T_1=1,5,10$. The zeros are where $\\sin(\\omega T_1)=0$ with $\\omega\\neq0$, that is $\\omega T_1=\\pm k\\pi$, so $\\omega=\\pm k\\pi/T_1$ for $k=1,2,3,\\dots$ The origin is excluded, because there the limit is the peak, not a zero.']
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
 ['Method','The spectrum is given and is non-zero only on $-W<\\omega<W$, so apply the synthesis equation over those limits and retain the factor $1/2\\pi$.'],
 ['Solution','Substitute the spectrum into the synthesis equation. Outside $|\\omega|<W$ it is zero, and inside it equals 1: $$x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega t}\\,\\d\\omega.$$ Here $t$ is a fixed parameter and $\\omega$ is the variable, so for $t\\neq0$ the antiderivative of $e^{j\\omega t}$ is $e^{j\\omega t}/(jt)$: $$\\begin{aligned}x(t)&=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}\\\\&=\\frac{e^{jWt}-e^{-jWt}}{2\\pi jt}\\\\&=\\frac{2j\\sin(Wt)}{2\\pi jt}\\\\&=\\frac{\\sin(Wt)}{\\pi t}.\\end{aligned}$$ The third line is Euler again, $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ with $\\theta=Wt$; the $2j$ then cancels against the $2\\pi j$. With the unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, multiply and divide by $W$: $$x(t)=\\frac{W}{\\pi}\\cdot\\frac{\\sin(Wt)}{Wt}=\\frac{W}{\\pi}\\operatorname{sinc}(Wt).$$'],
 ['Check','At $t=0$ the synthesis integral is $\\frac{1}{2\\pi}\\int_{-W}^{W}1\\,\\d\\omega=\\frac{2W}{2\\pi}=\\frac{W}{\\pi}$, and l’Hôpital on $\\sin(Wt)/(\\pi t)$ gives $\\lim_{t\\to0}W\\cos(Wt)/\\pi=W/\\pi$ as well: 0.5, 1 and 2 for $W=0.5\\pi,\\pi,2\\pi$. Zeros where $\\sin(Wt)=0$ with $t\\neq0$: $t=\\pm k\\pi/W$, $k=1,2,\\dots$, again with the origin excluded. This signal is not a pulse: it rings on both sides for ever, alternating in sign.']
]},
{t:'p', text:'The two examples are one statement seen twice: a rectangle in either domain is a sinc in the other. Section 5.7 gives that symmetry a name and a proof.'},

{t:'h3', text:'Narrow in time, wide in frequency'},
{t:'p', text:'The pulse of half-width $T_1$ has its first zero at $\\omega=\\pi/T_1$. Halve $T_1$ and that zero doubles. Taking the duration as the full width $T=2T_1$ and the bandwidth as the distance to the first null,'},
{t:'eq', tex:'T\\times\\text{BW}=2T_1\\cdot\\frac{\\pi}{T_1}=2\\pi\\qquad\\text{at every width}.'},
{t:'box', kind:'warn', hd:'The value depends on the waveform', html:'The product is invariant for scaled versions of one waveform because time scaling changes duration and frequency width by reciprocal factors. A triangular pulse of the same total duration $2T_1$ has the transform $T_1\\operatorname{sinc}^{2}(\\omega T_1/2)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, because that triangle is the convolution of two rectangles of half-width $T_1/2$ and convolution multiplies transforms (Section 5.9). Its first null is where $\\omega T_1/2=\\pi$, that is at $\\omega=2\\pi/T_1$, so its product is $2T_1\\cdot2\\pi/T_1=4\\pi$. In general, narrowing a signal in time widens its spectrum; both widths cannot be made arbitrarily small.'},
{t:'p', text:'One implication about band limitation is a theorem and its converse is not. A signal of finite duration cannot be band-limited: the pulse above has a sinc transform, which is non-zero on stretches reaching out to every frequency. But infinite duration guarantees nothing. The signal $e^{-a|t|}$ lasts for ever and its transform $2a/(a^{2}+\\omega^{2})$ is strictly positive at every finite frequency. Small is not zero, and Chapter 7 depends on the difference.'},

{t:'h2', num:'5.5', text:'Periodic signals, sinusoids and the impulse train'},
{t:'p', text:'A periodic signal has a Fourier series, and the series can be transformed term by term. Linearity moves the transform inside the sum and past each constant $a_k$. Each term is then a complex exponential at frequency $k\\omega_0$, and Example 5.2 gives its transform, $e^{jk\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-k\\omega_0)$:'},
{t:'eq', tex:'\\begin{aligned}X(j\\omega)&=\\mathcal{F}\\Bigl\\{\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\Bigr\\}\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\,\\mathcal{F}\\{e^{jk\\omega_0t}\\}\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\cdot2\\pi\\,\\delta(\\omega-k\\omega_0).\\end{aligned}'},
{t:'eqbox', cap:'Transform of a periodic signal',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longleftrightarrow\\;X(j\\omega)=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta(\\omega-k\\omega_0)'],
 after:'The spectrum is a train of impulses at the harmonics, and the impulse at $k\\omega_0$ carries weight $2\\pi a_k$. The coefficient and the weight are different objects: $a_k$ multiplies a unit exponential, while $2\\pi a_k$ is an area under a spectrum. Reporting the coefficients as the transform loses a factor of $2\\pi$ at every harmonic.'},
{t:'p', text:'For the rectangular wave of Chapter 4, with value 1 on $|t|<T_1$ in each period $T$, the coefficients are $a_k=\\sin(k\\omega_0T_1)/(k\\pi)$ for $k\\neq0$ and $a_0=2T_1/T$. Multiply by $2\\pi$ to get the impulse weights:'},
{t:'eq', tex:'2\\pi a_k=2\\pi\\cdot\\frac{\\sin(k\\omega_0T_1)}{k\\pi}=\\frac{2\\sin(k\\omega_0T_1)}{k},\\qquad 2\\pi a_0=2\\pi\\cdot\\frac{2T_1}{T}=\\frac{4\\pi T_1}{T}.'},
{t:'p', text:'Take $T_1=1$. Three periods make the sequence visible. $T=8T_1$ gives $\\omega_0=2\\pi/8=\\pi/4=0.392699$ and origin weight $4\\pi/8=\\pi/2=1.5708$. $T=16T_1$ gives $\\omega_0=\\pi/8=0.196350$ and weight $4\\pi/16=0.7854$. $T=32T_1$ gives $\\omega_0=\\pi/16=0.098175$ and weight $4\\pi/32=0.3927$. Each doubling of the period halves the spacing and halves every weight, while the envelope $2\\sin(\\omega T_1)/\\omega$ does not move at all. This is the derivation of Section 5.1, carried out three steps at a time.'},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-4,4],yr:[-0.65,1.85],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',xtarget:7,yticksOverride:[0,0.5,1,1.5]});
  const w0=2*PI/8;
  for(let k=-11;k<=11;k++){ const wt=2*PI*aSq(k,8,1); if(Math.abs(wt)<1e-9||Math.abs(k*w0)>4) continue;
    a.impulse(k*w0,wt,{color:C.in,label:false}); }
  a.curve(w=>w0*rectFT(w,1),{color:C.coral,width:1.3,dash:'4 5',n:1200});
  return a.svg(); },
  cap:'The square wave with $T=8T_1$: impulses of weight $2\\pi a_k$ sample the dashed envelope. A magnitude plot would not show which weights are negative.'},

{t:'ex', hd:'Example 5.7 — a constant, a cosine and a sine', rows:[
 ['Given','$x(t)=5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$.'],
 ['Find','$X(j\\omega)$, drawn so that both size and phase can be read.'],
 ['Method','Each sinusoid is a sum of complex exponentials, whose transform pair is known. Expand with Euler’s relations and apply linearity term by term.'],
 ['Solution','Write each term as complex exponentials with Euler’s relations, $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$: $$\\begin{aligned}4\\cos(3\\pi t)&=4\\cdot\\tfrac12\\bigl(e^{j3\\pi t}+e^{-j3\\pi t}\\bigr)=2e^{j3\\pi t}+2e^{-j3\\pi t},\\\\6\\sin(4\\pi t)&=6\\cdot\\tfrac{1}{2j}\\bigl(e^{j4\\pi t}-e^{-j4\\pi t}\\bigr)=\\tfrac{3}{j}e^{j4\\pi t}-\\tfrac{3}{j}e^{-j4\\pi t}.\\end{aligned}$$ Now apply $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$ to each exponential and multiply by its coefficient. The constant is the case $\\omega_0=0$: $$\\begin{aligned}5&\\;\\longleftrightarrow\\;5\\cdot2\\pi\\,\\delta(\\omega)=10\\pi\\,\\delta(\\omega),\\\\2e^{j3\\pi t}+2e^{-j3\\pi t}&\\;\\longleftrightarrow\\;2\\cdot2\\pi\\,\\delta(\\omega-3\\pi)+2\\cdot2\\pi\\,\\delta(\\omega+3\\pi)\\\\&\\qquad=4\\pi\\,\\delta(\\omega-3\\pi)+4\\pi\\,\\delta(\\omega+3\\pi),\\\\\\tfrac{3}{j}e^{j4\\pi t}-\\tfrac{3}{j}e^{-j4\\pi t}&\\;\\longleftrightarrow\\;\\tfrac{3}{j}\\cdot2\\pi\\,\\delta(\\omega-4\\pi)-\\tfrac{3}{j}\\cdot2\\pi\\,\\delta(\\omega+4\\pi)\\\\&\\qquad=\\tfrac{6\\pi}{j}\\,\\delta(\\omega-4\\pi)-\\tfrac{6\\pi}{j}\\,\\delta(\\omega+4\\pi).\\end{aligned}$$ The sine gives imaginary weights, since $1/j=-j$, of modulus $6\\pi=18.849556$. Linearity adds the three transforms: $$\\begin{aligned}X(j\\omega)=10\\pi\\delta(\\omega)&+4\\pi\\delta(\\omega-3\\pi)+4\\pi\\delta(\\omega+3\\pi)\\\\&+\\frac{6\\pi}{j}\\delta(\\omega-4\\pi)-\\frac{6\\pi}{j}\\delta(\\omega+4\\pi).\\end{aligned}$$'],
 ['Check','The signal is real, so the magnitude must be even in $\\omega$ and the phase odd. Magnitudes: $31.4159$ at 0, $12.5664$ at $\\pm3\\pi$, $18.8496$ at $\\pm4\\pi$. Phases: 0 except at $\\pm4\\pi$, where they are $\\mp\\pi/2$ because $1/j=-j$. A spectrum with only the positive-frequency impulse violates conjugate symmetry and describes a complex signal.']
]},
{t:'box', kind:'warn', hd:'Drawing a complex spectrum', html:'Three weights are real and two are imaginary. One vertical axis cannot represent both signed real values and signed imaginary values. Plot magnitude and phase, or plot real part and imaginary part, and identify the chosen pair in the caption.'},

{t:'ex', hd:'Example 5.8 — the impulse train', rows:[
 ['Given','$x(t)=\\sum_{k=-\\infty}^{\\infty}\\delta(t-kT)$.'],
 ['Find','$X(j\\omega)$.'],
 ['Method','The signal is periodic, so its transform is an impulse at each harmonic. Find its Fourier-series coefficients $a_k$, then give each impulse the weight $2\\pi a_k$.'],
 ['Solution','The signal repeats every $T$, so $\\omega_0=2\\pi/T$. Apply the analysis equation of the Fourier series over the period $-T/2<t<T/2$. That interval encloses exactly one impulse, the one at $t=0$, so inside it the signal is just $\\delta(t)$ and sifting evaluates the exponential at $t=0$: $$\\begin{aligned}a_k&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\sum_{m}\\delta(t-mT)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T}e^{0}=\\frac{1}{T}\\qquad\\text{for every }k.\\end{aligned}$$ Now use the transform of a periodic signal: each harmonic $k\\omega_0=2\\pi k/T$ carries an impulse of weight $2\\pi a_k=2\\pi/T$: $$\\begin{aligned}X(j\\omega)&=\\sum_{k}2\\pi a_k\\,\\delta(\\omega-k\\omega_0)\\\\&=\\sum_{k}\\frac{2\\pi}{T}\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right).\\end{aligned}$$ Hence $$\\sum_{k}\\delta(t-kT)\\;\\longleftrightarrow\\;\\frac{2\\pi}{T}\\sum_{k}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{T}\\right).$$'],
 ['Check','Spacing and weight are the same number, $2\\pi/T$: $6.2832$ for $T=1$ and $3.1416$ for $T=2$. Crowding the impulses in time spreads them in frequency. This one pair is the mechanism behind sampling, in Chapter 7. Note that the limits must enclose exactly one impulse; writing both as $-T/2$ encloses none.']
]},

{t:'h2', num:'5.6', text:'Properties'},
{t:'table', head:['Property','Statement'], rows:[
 ['Linearity','$a x_1+b x_2\\;\\leftrightarrow\\;a X_1+b X_2$'],
 ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;e^{-j\\omega t_0}X(j\\omega)$'],
 ['Frequency shift','$e^{j\\omega_0t}x(t)\\;\\leftrightarrow\\;X\\bigl(j(\\omega-\\omega_0)\\bigr)$'],
 ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;X^{*}(-j\\omega)$'],
 ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$'],
 ['Time reversal','$x(-t)\\;\\leftrightarrow\\;X(-j\\omega)$'],
 ['Time scaling','$x(at)\\;\\leftrightarrow\\;\\frac{1}{|a|}X(j\\omega/a)$'],
 ['Differentiation in time','$\\d^{n}x/\\d t^{n}\\;\\leftrightarrow\\;(j\\omega)^{n}X(j\\omega)$'],
 ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\d\\tau\\;\\leftrightarrow\\;\\frac{1}{j\\omega}X(j\\omega)+\\pi X(0)\\delta(\\omega)$'],
 ['Differentiation in frequency','$t\\,x(t)\\;\\leftrightarrow\\;j\\,\\d X(j\\omega)/\\d\\omega$'],
 ['Duality','$X(t)\\;\\leftrightarrow\\;2\\pi x(-\\omega)$'],
 ['Convolution','$x*h\\;\\leftrightarrow\\;X\\,H$'],
 ['Multiplication','$x\\,y\\;\\leftrightarrow\\;\\frac{1}{2\\pi}X*Y$'],
 ['Real and even','$X(j\\omega)$ real and even'],
 ['Real and odd','$X(j\\omega)$ purely imaginary and odd'],
 ['Even-odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
 ['Parseval','$\\int|x|^{2}\\d t=\\frac{1}{2\\pi}\\int|X|^{2}\\d\\omega$']
]},

{t:'h3', text:'Shifts'},
{t:'p', text:'For the time shift, put $x(t-t_0)$ into the analysis equation and substitute $\\tau=t-t_0$, so $t=\\tau+t_0$ and $\\d t=\\d\\tau$. The limits are infinite and do not move, because $\\tau\\to\\pm\\infty$ exactly when $t\\to\\pm\\infty$. Then split the exponential and take the factor that does not depend on $\\tau$ outside:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(t-t_0)\\}&=\\int_{-\\infty}^{\\infty}x(t-t_0)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega(\\tau+t_0)}\\,\\d\\tau\\\\&=e^{-j\\omega t_0}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau\\\\&=e^{-j\\omega t_0}X(j\\omega).\\end{aligned}'},
{t:'p', text:'The last integral is the analysis equation with $\\tau$ as the dummy variable, so it is $X(j\\omega)$. Since $|e^{-j\\omega t_0}|=1$, no magnitude changes at any frequency: a delay of $t_0$ seconds is exactly a linear phase of slope $-t_0$.'},
{t:'p', text:'For the frequency shift, start from the expression the property states, $e^{+j\\omega_0t}x(t)$, and combine the two exponentials before anything else. The exponent becomes $-j(\\omega-\\omega_0)t$, which is the analysis integral read at $\\omega-\\omega_0$, and no substitution is needed:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{e^{j\\omega_0t}x(t)\\}&=\\int_{-\\infty}^{\\infty}e^{j\\omega_0t}x(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\omega_0)t}\\,\\d t\\\\&=X\\bigl(j(\\omega-\\omega_0)\\bigr).\\end{aligned}'},
{t:'p', text:'The operand is a complex exponential in <b>time</b> with $\\omega_0$ fixed; the time-shift kernel $e^{-j\\omega t_0}$ has a fixed <b>time</b> and the opposite sign, and opening this proof with it proves a different statement.'},

{t:'h3', text:'Conjugation and the symmetry of a real signal'},
{t:'p', text:'Conjugation. The conjugate of an integral is the integral of the conjugate, and conjugating a product conjugates each factor. The conjugate of $e^{-j\\omega t}$ is $e^{+j\\omega t}$, which is the analysis kernel evaluated at $-\\omega$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x^{*}(t)\\}&=\\int_{-\\infty}^{\\infty}x^{*}(t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{+j\\omega t}\\,\\d t\\Bigr]^{*}\\\\&=\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(-\\omega)t}\\,\\d t\\Bigr]^{*}=\\bigl[X(-j\\omega)\\bigr]^{*}=X^{*}(-j\\omega).\\end{aligned}'},
{t:'p', text:'Time reversal. Put $x(-t)$ into the analysis equation and substitute $\\tau=-t$, so $t=-\\tau$ and $\\d t=-\\d\\tau$. As $t$ runs from $-\\infty$ to $\\infty$, $\\tau$ runs from $\\infty$ to $-\\infty$, so the limits arrive reversed. Swapping them back absorbs the minus sign of $\\d t=-\\d\\tau$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(-t)\\}&=\\int_{-\\infty}^{\\infty}x(-t)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{\\infty}^{-\\infty}x(\\tau)\\,e^{-j\\omega(-\\tau)}\\,(-\\d\\tau)\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(-\\omega)\\tau}\\,\\d\\tau=X(-j\\omega).\\end{aligned}'},
{t:'p', text:'A real signal. If $x$ is real then $x^{*}(t)=x(t)$, so the two sides of the conjugation property have the same transform: $X(j\\omega)=X^{*}(-j\\omega)$, or, conjugating both sides, $X(-j\\omega)=X^{*}(j\\omega)$. Everything follows from that one line. Write $X(j\\omega)=R(\\omega)+jI(\\omega)$ with $R$ and $I$ real. Then $X(-j\\omega)=R(-\\omega)+jI(-\\omega)$ and $X^{*}(j\\omega)=R(\\omega)-jI(\\omega)$. Equating real parts and imaginary parts gives $R(-\\omega)=R(\\omega)$ and $I(-\\omega)=-I(\\omega)$: the real part of $X$ is even and the imaginary part is odd. Taking modulus and angle of the same equation, $|X(-j\\omega)|=|X^{*}(j\\omega)|=|X(j\\omega)|$ and $\\angle X(-j\\omega)=\\angle X^{*}(j\\omega)=-\\angle X(j\\omega)$: the magnitude is even and the phase is odd.'},
{t:'p', text:'A real and even signal. Evenness gives $x(-t)=x(t)$, so by time reversal $X(-j\\omega)=X(j\\omega)$. Realness gives $X(-j\\omega)=X^{*}(j\\omega)$. Together, $X(j\\omega)=X^{*}(j\\omega)$, so $X$ is real; and $X(-j\\omega)=X(j\\omega)$ says it is even. A real and odd signal has $x(-t)=-x(t)$, so $X(-j\\omega)=-X(j\\omega)$; with $X(-j\\omega)=X^{*}(j\\omega)$ this gives $X^{*}(j\\omega)=-X(j\\omega)$, so $X$ is purely imaginary, and odd.'},
{t:'box', kind:'warn', hd:'Real does not mean zero phase', html:'A real transform can be negative. Where $X(j\\omega)<0$ the magnitude is $-X$ and the phase is $\\pi$, not 0. Only a real and non-negative transform has zero phase everywhere, and the sinc of the rectangular pulse is the standing counterexample: it is real, and its side lobes are negative.'},

{t:'h3', text:'Differentiation'},
{t:'p', text:'Differentiate the <b>synthesis equation</b>, not the signal. On the right the only factor depending on $t$ is $e^{j\\omega t}$, and $\\omega$ is the variable of integration, so it is held fixed. The derivative of $e^{j\\omega t}$ with respect to $t$ is $j\\omega e^{j\\omega t}$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d}{\\d t}x(t)&=\\frac{\\d}{\\d t}\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega\\Bigr]\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)\\,\\frac{\\partial}{\\partial t}e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\bigl[j\\omega X(j\\omega)\\bigr]e^{j\\omega t}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'The last line is the synthesis equation applied to the function $j\\omega X(j\\omega)$. So $j\\omega X(j\\omega)$ is the transform of $\\d x/\\d t$. Differentiating again multiplies by another $j\\omega$, and after $n$ derivatives:'},
{t:'eq', tex:'\\frac{\\d^{n}x}{\\d t^{n}}\\;\\longleftrightarrow\\;(j\\omega)^{n}X(j\\omega).'},
{t:'box', kind:'err', hd:'Do not mix the two domains', html:'The equation $\\d x/\\d t=j\\omega\\,x(t)$ is false. The frequency $\\omega$ labels the transform output; it is not a constant in the time-domain signal. For $x(t)=e^{-t^{2}}$, $\\d x/\\d t$ at $t=1$ is $-0.735759$, while $j\\omega x(t)$ at $t=1$, $\\omega=3$ is $1.103638j$. The differentiation property is correct only when derived from the transform integral.'},

{t:'h3', text:'Integration, and the impulse it leaves behind'},
{t:'p', text:'The running integral is a convolution with the unit step. In the convolution integral, the factor $u(t-\\tau)$ equals 1 for $\\tau<t$ and 0 for $\\tau>t$, so it cuts the upper limit at $t$:'},
{t:'eq', tex:'x(t)*u(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,u(t-\\tau)\\,\\d\\tau=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau.'},
{t:'p', text:'The transform of the step is needed next. The step fails both existence conditions, so obtain it as a limit. Write $u(t)=\\tfrac12+\\tfrac12\\operatorname{sgn}(t)$, where $\\operatorname{sgn}(t)$ is $+1$ for $t>0$ and $-1$ for $t<0$. The constant $\\tfrac12$ transforms to $\\tfrac12\\cdot2\\pi\\delta(\\omega)=\\pi\\delta(\\omega)$. For the sign function, use $\\operatorname{sgn}(t)=\\lim_{a\\to0}\\bigl[e^{-at}u(t)-e^{at}u(-t)\\bigr]$ with $a>0$; the first term is Example 5.3, and the second is its time reversal, so its transform is $1/(a-j\\omega)$. Add the fractions and let $a\\to0$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{\\operatorname{sgn}(t)\\}&=\\lim_{a\\to0}\\Bigl[\\frac{1}{a+j\\omega}-\\frac{1}{a-j\\omega}\\Bigr]\\\\&=\\lim_{a\\to0}\\frac{(a-j\\omega)-(a+j\\omega)}{a^{2}+\\omega^{2}}=\\lim_{a\\to0}\\frac{-2j\\omega}{a^{2}+\\omega^{2}}\\\\&=\\frac{-2j\\omega}{\\omega^{2}}=\\frac{-2j}{\\omega}=\\frac{2}{j\\omega},\\end{aligned}'},
{t:'p', text:'using $-j=1/j$ in the last step. So $u(t)\\leftrightarrow\\pi\\delta(\\omega)+\\tfrac12\\cdot\\frac{2}{j\\omega}=\\frac{1}{j\\omega}+\\pi\\delta(\\omega)$. Now the convolution property of Section 5.9 multiplies the transforms. In the product, $X(j\\omega)\\delta(\\omega)=X(j0)\\delta(\\omega)$, because the impulse is zero away from $\\omega=0$ and only the value of $X$ at the origin survives. Writing $X(0)$ for $X(j0)$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\Bigl\\{\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\Bigr\\}&=X(j\\omega)\\Bigl[\\frac{1}{j\\omega}+\\pi\\delta(\\omega)\\Bigr]\\\\&=\\frac{1}{j\\omega}X(j\\omega)+\\pi X(0)\\,\\delta(\\omega).\\end{aligned}'},
{t:'box', kind:'err', hd:'Include the impulse term when the area is non-zero', html:'$X(0)=\\int x(t)\\d t$ is the total signal area. If this area is non-zero, the running integral approaches a non-zero constant, whose transform includes an impulse at $\\omega=0$. Writing only $X(j\\omega)/(j\\omega)$ omits that constant component. Calculate the area before applying the integration property.'},
{t:'h3', text:'Differentiation in frequency'},
{t:'p', text:'Differentiate the analysis integral with respect to $\\omega$. Now $t$ is the variable of integration and is held fixed, and the derivative of $e^{-j\\omega t}$ with respect to $\\omega$ is $-jt\\,e^{-j\\omega t}$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d X(j\\omega)}{\\d\\omega}&=\\int_{-\\infty}^{\\infty}x(t)\\,\\frac{\\partial}{\\partial\\omega}e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}\\bigl[-jt\\,x(t)\\bigr]e^{-j\\omega t}\\,\\d t=\\mathcal{F}\\{-jt\\,x(t)\\}.\\end{aligned}'},
{t:'p', text:'So $\\d X/\\d\\omega$ is the transform of $-jt\\,x(t)$. Multiply both sides by $j$ and use $j\\cdot(-j)=1$: $j\\,\\d X/\\d\\omega=\\mathcal{F}\\{t\\,x(t)\\}$, which is the property. It obtains the pair for $te^{-at}u(t)$ from the pair for $e^{-at}u(t)$ without another transform integral. Write $1/(a+j\\omega)=(a+j\\omega)^{-1}$ and use the chain rule, with $\\d(a+j\\omega)/\\d\\omega=j$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{te^{-at}u(t)\\}&=j\\,\\frac{\\d}{\\d\\omega}\\Bigl[\\frac{1}{a+j\\omega}\\Bigr]=j\\cdot\\frac{-1\\cdot j}{(a+j\\omega)^{2}}\\\\&=\\frac{-j^{2}}{(a+j\\omega)^{2}}=\\frac{1}{(a+j\\omega)^{2}},\\qquad a>0.\\end{aligned}'},
{t:'h3', text:'Even and odd parts'},
{t:'p', text:'For a real signal, transform the even part $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ by linearity. Time reversal gives $x(-t)\\leftrightarrow X(-j\\omega)$, and for a real signal $X(-j\\omega)=X^{*}(j\\omega)$. Adding a complex number to its conjugate leaves twice the real part:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{\\Ev\\{x\\}\\}&=\\tfrac12\\bigl[X(j\\omega)+X(-j\\omega)\\bigr]=\\tfrac12\\bigl[X(j\\omega)+X^{*}(j\\omega)\\bigr]=\\operatorname{Re}\\{X(j\\omega)\\},\\\\\\mathcal{F}\\{\\Od\\{x\\}\\}&=\\tfrac12\\bigl[X(j\\omega)-X(-j\\omega)\\bigr]=\\tfrac12\\bigl[X(j\\omega)-X^{*}(j\\omega)\\bigr]=j\\operatorname{Im}\\{X(j\\omega)\\}.\\end{aligned}'},
{t:'p', text:'The second line uses $X-X^{*}=2j\\operatorname{Im}\\{X\\}$. Splitting a real signal into even and odd parts splits its spectrum into real and imaginary parts, and the two symmetry rules above are the cases in which one part is absent. Check it on $x(t)=e^{-at}u(t)$. Its even part is $\\tfrac12[e^{-at}u(t)+e^{at}u(-t)]=\\tfrac12e^{-a|t|}$, and its odd part is $\\tfrac12[e^{-at}u(t)-e^{at}u(-t)]=\\tfrac12\\operatorname{sgn}(t)e^{-a|t|}$. Transform each part from the pairs already found, then compare with the real and imaginary parts of $1/(a+j\\omega)$, obtained by multiplying numerator and denominator by $a-j\\omega$:'},
{t:'eq', tex:'\\begin{aligned}\\tfrac12e^{-a|t|}&\\;\\longleftrightarrow\\;\\tfrac12\\cdot\\frac{2a}{a^{2}+\\omega^{2}}=\\frac{a}{a^{2}+\\omega^{2}},\\\\\\tfrac12\\operatorname{sgn}(t)e^{-a|t|}&\\;\\longleftrightarrow\\;\\tfrac12\\Bigl[\\frac{1}{a+j\\omega}-\\frac{1}{a-j\\omega}\\Bigr]=\\tfrac12\\cdot\\frac{-2j\\omega}{a^{2}+\\omega^{2}}=\\frac{-j\\omega}{a^{2}+\\omega^{2}},\\\\\\frac{1}{a+j\\omega}&=\\frac{a-j\\omega}{(a+j\\omega)(a-j\\omega)}=\\frac{a}{a^{2}+\\omega^{2}}+j\\,\\frac{-\\omega}{a^{2}+\\omega^{2}}.\\end{aligned}'},
{t:'p', text:'The even part gives exactly $\\operatorname{Re}\\{1/(a+j\\omega)\\}$ and the odd part gives exactly $j\\operatorname{Im}\\{1/(a+j\\omega)\\}$, as the property says.'},

{t:'h3', text:'Time scaling'},
{t:'p', text:'Put $x(at)$ into the analysis equation and substitute $\\tau=at$, so $t=\\tau/a$ and $\\d t=\\d\\tau/a$. For $a>0$ the limits keep their order, since $\\tau\\to\\pm\\infty$ when $t\\to\\pm\\infty$, and the coefficient is $1/a=1/|a|$:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(at)\\}&=\\int_{-\\infty}^{\\infty}x(at)\\,e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau/a}\\,\\frac{\\d\\tau}{a}\\\\&=\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{a}X\\!\\Bigl(j\\frac{\\omega}{a}\\Bigr),\\qquad a>0.\\end{aligned}'},
{t:'p', text:'For $a<0$ the substitution sends $t\\to-\\infty$ to $\\tau\\to+\\infty$ and $t\\to+\\infty$ to $\\tau\\to-\\infty$, so the limits arrive reversed. Swapping them back costs one minus sign, and $-1/a=1/|a|$ for negative $a$. That is the only sign in the calculation:'},
{t:'eq', tex:'\\begin{aligned}\\mathcal{F}\\{x(at)\\}&=\\int_{+\\infty}^{-\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\frac{\\d\\tau}{a}\\\\&=-\\frac{1}{a}\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j(\\omega/a)\\tau}\\,\\d\\tau=\\frac{1}{|a|}X\\!\\Bigl(j\\frac{\\omega}{a}\\Bigr),\\qquad a<0.\\end{aligned}'},
{t:'p', text:'Both cases read $x(at)\\leftrightarrow\\frac{1}{|a|}X(j\\omega/a)$.'},
{t:'box', kind:'err', hd:'Counting the flip twice', html:'Writing the reversed limits <b>and</b> an explicit $-1$ in front applies the same correction twice and gives $-\\frac{1}{|a|}X(j\\omega/a)$, contradicting the property. Do the flip once: reverse the limits, or write the minus, never both. The case $a=-1$ is time reversal, $x(-t)\\leftrightarrow X(-j\\omega)$, with coefficient 1.'},
{t:'p', text:'Worked instance. If $X(j\\omega)=1$ on $|\\omega|<2\\pi$, then $x(0.5t)\\leftrightarrow2X(j2\\omega)$, which is 2 on $|\\omega|<\\pi$, and $x(2t)\\leftrightarrow0.5X(j\\omega/2)$, which is 0.5 on $|\\omega|<4\\pi$. The three areas are $2\\cdot2\\pi$, $1\\cdot4\\pi$ and $0.5\\cdot8\\pi$, all $4\\pi$; since $\\int X\\d\\omega=2\\pi x(0)$, the value at $t=0$ is the same for all three, which is what a time scaling cannot change.'},

{t:'h2', num:'5.7', text:'Duality'},
{t:'p', text:'The two equations of the pair differ only by a sign and a factor, so any pair can be read a second time with the domains exchanged.'},
{t:'eqbox', cap:'Duality', tex:['x(t)\\;\\longleftrightarrow\\;X(j\\omega)\\qquad\\Longrightarrow\\qquad X(t)\\;\\longleftrightarrow\\;2\\pi\\,x(-\\omega)'],
 after:'The argument on the right is $-\\omega$, a real number, and not $-j\\omega$: the letter $x$ names a signal and a signal takes a real argument. The $j$ belongs to the frequency-domain function only, and duality is the point in the chapter where that distinction is most easily lost.'},
{t:'p', text:'Here $X(t)$ means the formula for $X(j\\omega)$ with $\\omega$ replaced by $t$. Proof. Start from the synthesis equation and multiply by $2\\pi$:'},
{t:'eq', tex:'2\\pi\\,x(t)=\\int_{-\\infty}^{\\infty}X(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega.'},
{t:'p', text:'The names of the variables carry no meaning, so rename them: call the variable of integration $t$ and the free variable $\\omega$. The equation becomes'},
{t:'eq', tex:'2\\pi\\,x(\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{j\\omega t}\\,\\d t.'},
{t:'p', text:'This holds for every real $\\omega$, so it holds with $\\omega$ replaced by $-\\omega$. The exponent $e^{j(-\\omega)t}=e^{-j\\omega t}$ is now the analysis kernel:'},
{t:'eq', tex:'2\\pi\\,x(-\\omega)=\\int_{-\\infty}^{\\infty}X(jt)\\,e^{-j\\omega t}\\,\\d t=\\mathcal{F}\\{X(t)\\}.'},
{t:'p', text:'The right side is the analysis equation applied to the time signal $X(t)$, so its transform is $2\\pi x(-\\omega)$.'},
{t:'ex', hd:'Example 5.9 — duality on the rectangular pulse', rows:[
 ['Given','$x_1(t)=1$ on $|t|<W$, so $X_1(j\\omega)=2\\sin(W\\omega)/\\omega$.'],
 ['Find','The transform of $x_2(t)=2\\sin(Wt)/t$.'],
 ['Method','$x_2$ has the same formula as $X_1$ with the independent variable changed, so duality applies. Use duality first, then verify the result with synthesis.'],
 ['Solution','The signal $x_2(t)=2\\sin(Wt)/t$ is $X_1(j\\omega)$ with $\\omega$ replaced by $t$, that is $x_2(t)=X_1(t)$ in the notation of the duality box. Duality then gives $X_2(j\\omega)=2\\pi x_1(-\\omega)$. The pulse $x_1$ is even, so $x_1(-\\omega)=x_1(\\omega)$, which is 1 on $|\\omega|<W$ and 0 beyond: $$X_2(j\\omega)=2\\pi\\,x_1(-\\omega)=2\\pi\\,x_1(\\omega)=\\begin{cases}2\\pi,&|\\omega|<W\\\\0,&|\\omega|>W.\\end{cases}$$'],
 ['Check','The second route works backwards. Put a band of height $2\\pi$ on $|\\omega|<W$ through the synthesis equation; for $t\\neq0$ the antiderivative of $e^{j\\omega t}$ in $\\omega$ is $e^{j\\omega t}/(jt)$: $$\\begin{aligned}\\frac{1}{2\\pi}\\int_{-W}^{W}2\\pi\\,e^{j\\omega t}\\,\\d\\omega&=\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}=\\frac{e^{jWt}-e^{-jWt}}{jt}\\\\&=\\frac{2j\\sin(Wt)}{jt}=\\frac{2\\sin(Wt)}{t},\\end{aligned}$$ which is $x_2$. The two routes use different equations, so their agreement is a real check. At the origin, $X_2(j0)=2\\pi=6.283185$ for any $W$, and $x_2(0)=\\lim_{t\\to0}2W\\cos(Wt)/1=2W$ by l’Hôpital.']
]},
{t:'p', text:'Duality also carries properties across: the time-shift rule becomes the frequency-shift rule, and differentiation in time becomes differentiation in frequency. Every pair already derived gives a second one for nothing.'},

{t:'h2', num:'5.8', text:'Parseval’s relation'},
{t:'p', text:'Energy and power in this course are normalised, with $R=1\\,\\Omega$, so the instantaneous power is $|x(t)|^{2}$ and the energy is its integral, in joules.'},
{t:'eqbox', cap:'Parseval’s relation',
 tex:['E_{\\infty}=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega'],
 after:'The quantity $|X(j\\omega)|^{2}$ is the energy spectral density: $\\frac{1}{2\\pi}|X|^{2}\\d\\omega$ is the energy in a narrow band.'},
{t:'p', text:'Proof. Write $|x(t)|^{2}=x(t)\\,x^{*}(t)$. Replace $x^{*}(t)$ by the conjugate of the synthesis equation; conjugating turns $X(j\\omega)$ into $X^{*}(j\\omega)$ and $e^{j\\omega t}$ into $e^{-j\\omega t}$. Then exchange the order of the two integrals, so that the $t$ integral is done first. The inner integral is the analysis equation and equals $X(j\\omega)$:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t&=\\int_{-\\infty}^{\\infty}x(t)\\,x^{*}(t)\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(t)\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\,e^{-j\\omega t}\\,\\d\\omega\\Bigr]\\d t\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t\\Bigr]\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X^{*}(j\\omega)\\,X(j\\omega)\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'For a real signal, $|x(t)|^{2}=x^{2}(t)$, and that is the only simplification available. The claim $|x(t)|=x(t)$ is stronger and fails wherever a real signal is negative.'},
{t:'ex', hd:'Example 5.10 — energy from a two-band spectrum', rows:[
 ['Given','$X_3(j\\omega)=2$ for $|\\omega|<2\\pi$, 1 for $2\\pi<|\\omega|<4\\pi$, and 0 beyond.'],
 ['Find','The total energy.'],
 ['Method','The spectrum is piecewise constant, so the frequency-domain energy integral is simpler than the time-domain integral. Apply Parseval, square each height, and multiply by the corresponding width.'],
 ['Solution','Split the frequency integral of Parseval’s relation at the points where the height changes. On each piece $|X_3|^{2}$ is a constant, so the integral is that constant times the width of the piece: $$\\begin{aligned}E_{\\infty}&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X_3(j\\omega)|^{2}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\Bigl[\\int_{-4\\pi}^{-2\\pi}1^{2}\\,\\d\\omega+\\int_{-2\\pi}^{2\\pi}2^{2}\\,\\d\\omega+\\int_{2\\pi}^{4\\pi}1^{2}\\,\\d\\omega\\Bigr]\\\\&=\\frac{1}{2\\pi}\\bigl[1\\cdot2\\pi+4\\cdot4\\pi+1\\cdot2\\pi\\bigr]\\\\&=\\frac{1}{2\\pi}\\bigl[2\\pi+16\\pi+2\\pi\\bigr]=\\frac{20\\pi}{2\\pi}=10\\ \\text{J}.\\end{aligned}$$ The inner band contributes $2^{2}\\cdot4\\pi=16\\pi$ and the two outer bands $1^{2}\\cdot2\\pi$ each.'],
 ['Check','Write $X_3$ as the sum of two ideal low-pass bands of height 1, one on $|\\omega|<4\\pi$ and one on $|\\omega|<2\\pi$; where they overlap the heights add to 2. Example 5.6 with $W=4\\pi$ and $W=2\\pi$ then gives, by linearity, $$x_3(t)=\\frac{\\sin(4\\pi t)}{\\pi t}+\\frac{\\sin(2\\pi t)}{\\pi t}=\\frac{\\sin(2\\pi t)+\\sin(4\\pi t)}{\\pi t}.$$ Integrating $x_3^{2}$ over all time returns 10 J as well. Note that $\\frac{1}{2\\pi}\\int X_3\\d\\omega=\\frac{1}{2\\pi}[2\\pi+8\\pi+2\\pi]=6$, which is the peak $x_3(0)=4+2$ and not the energy: using the heights unsquared computes the wrong quantity correctly.']
]},
{t:'p', text:'The same relation on $e^{-at}u(t)$, $a>0$, is worth doing both ways. In time, the step cuts the lower limit at 0 and $|e^{-at}|^{2}=e^{-2at}$:'},
{t:'eq', tex:'E_{\\infty}=\\int_{0}^{\\infty}e^{-2at}\\,\\d t=\\left[\\frac{e^{-2at}}{-2a}\\right]_{0}^{\\infty}=\\frac{0-1}{-2a}=\\frac{1}{2a}.'},
{t:'p', text:'In frequency, $|X(j\\omega)|^{2}=1/(a^{2}+\\omega^{2})$ from Example 5.3. Substitute $\\omega=au$, so $\\d\\omega=a\\,\\d u$ and the limits stay infinite; then use the antiderivative $\\tan^{-1}u$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{a^{2}+\\omega^{2}}&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{a\\,\\d u}{a^{2}(1+u^{2})}=\\frac{1}{2\\pi a}\\bigl[\\tan^{-1}u\\bigr]_{-\\infty}^{\\infty}\\\\&=\\frac{1}{2\\pi a}\\Bigl[\\frac{\\pi}{2}-\\Bigl(-\\frac{\\pi}{2}\\Bigr)\\Bigr]=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{a}=\\frac{1}{2a}.\\end{aligned}'},
{t:'p', text:'The two routes agree. Without the $1/2\\pi$ the second route reports $2\\pi$ times too much.'},

{t:'h2', num:'5.9', text:'Convolution and multiplication'},
{t:'eqbox', cap:'The two dual properties',
 tex:['y(t)=x(t)*h(t)\\;\\longleftrightarrow\\;Y(j\\omega)=X(j\\omega)H(j\\omega)',
      'z(t)=x(t)\\,y(t)\\;\\longleftrightarrow\\;Z(j\\omega)=\\frac{1}{2\\pi}X(j\\omega)*Y(j\\omega)'],
 after:'The premise is stated with one set of symbols: $x\\leftrightarrow X$ is the input, $h\\leftrightarrow H$ the impulse response, $y$ the output. Convolution in time carries no factor; convolution in frequency carries $1/2\\pi$. $H(j\\omega)$ exists when $h$ is absolutely integrable, which for an LTI system is exactly bounded-input bounded-output stability, so an unstable system has no frequency response to plot.'},
{t:'p', text:'Proof of the convolution property. Write the convolution integral inside the analysis integral and exchange the order, so that the $t$ integral is done first. The inner bracket is the transform of $h(t-\\tau)$ with $\\tau$ fixed, which the time-shift property gives as $e^{-j\\omega\\tau}H(j\\omega)$. Then $H(j\\omega)$ does not depend on $\\tau$ and leaves the outer integral:'},
{t:'eq', tex:'\\begin{aligned}Y(j\\omega)&=\\int_{-\\infty}^{\\infty}\\Bigl[\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\Bigr]e^{-j\\omega t}\\,\\d t\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\Bigl[\\int_{-\\infty}^{\\infty}h(t-\\tau)\\,e^{-j\\omega t}\\,\\d t\\Bigr]\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}H(j\\omega)\\,\\d\\tau\\\\&=H(j\\omega)\\int_{-\\infty}^{\\infty}x(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau=H(j\\omega)\\,X(j\\omega).\\end{aligned}'},
{t:'p', text:'Proof of the multiplication property. Replace $y(t)$ in the analysis integral of $z=xy$ by its synthesis equation, written with the dummy variable $\\theta$ so that it is not confused with the output frequency $\\omega$. Exchange the order of integration. The inner integral is the frequency-shift property, the analysis equation of $x$ read at $\\omega-\\theta$:'},
{t:'eq', tex:'\\begin{aligned}Z(j\\omega)&=\\int_{-\\infty}^{\\infty}x(t)\\Bigl[\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\,e^{j\\theta t}\\,\\d\\theta\\Bigr]e^{-j\\omega t}\\,\\d t\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\Bigl[\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j(\\omega-\\theta)t}\\,\\d t\\Bigr]\\d\\theta\\\\&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}Y(j\\theta)\\,X\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta=\\frac{1}{2\\pi}\\,X(j\\omega)*Y(j\\omega).\\end{aligned}'},
{t:'p', text:'The last integral is the convolution of $X$ and $Y$ in the variable $\\omega$, and the $1/2\\pi$ came in with the synthesis equation of $y$.'},

{t:'ex', hd:'Example 5.11 — two exponentials in cascade', rows:[
 ['Given','$x(t)=e^{-at}u(t)$ and $h(t)=e^{-bt}u(t)$, with $a,b>0$ and $a\\neq b$.'],
 ['Find','$y(t)=x*h$.'],
 ['Method','The output is a convolution in time, so it becomes multiplication in frequency. Multiply the transforms, expand the product into simple fractions, and invert each term.'],
 ['Solution','Example 5.3 gives $X(j\\omega)=1/(a+j\\omega)$ and $H(j\\omega)=1/(b+j\\omega)$. Multiply them, then write the product as a sum of two simple fractions with unknown constants $A$ and $B$: $$Y(j\\omega)=\\frac{1}{(a+j\\omega)(b+j\\omega)}=\\frac{A}{a+j\\omega}+\\frac{B}{b+j\\omega}.$$ Multiply through by $(a+j\\omega)(b+j\\omega)$ to clear the denominators: $$1=A(b+j\\omega)+B(a+j\\omega).$$ This holds for every $\\omega$. Choose $j\\omega=-a$ to remove the $B$ term: $1=A(b-a)$, so $A=1/(b-a)$. Choose $j\\omega=-b$ to remove the $A$ term: $1=B(a-b)$, so $B=1/(a-b)=-A$. Hence $$Y(j\\omega)=\\frac{1}{b-a}\\Bigl[\\frac{1}{a+j\\omega}-\\frac{1}{b+j\\omega}\\Bigr].$$ Each fraction is the pair of Example 5.3, so by linearity $$y(t)=\\frac{1}{b-a}\\bigl[e^{-at}u(t)-e^{-bt}u(t)\\bigr]=\\frac{e^{-at}-e^{-bt}}{b-a}\\,u(t).$$'],
 ['Check','$y(0)=(1-1)/(b-a)=0$, as a convolution of two causal signals must be. For $a=1$, $b=2$, set $\\d y/\\d t=-e^{-t}+2e^{-2t}=0$, so $e^{t}=2$ and the peak is at $t=\\ln2=0.693147$, with value $e^{-\\ln2}-e^{-2\\ln2}=\\tfrac12-\\tfrac14=\\tfrac14$ exactly. At $\\omega=0$: $|X|=1/a=1$, $|H|=1/b=0.5$ and $|Y|=1/(ab)=0.5$, and the product of the first two is the third. That is the property itself at one frequency.']
]},
{t:'ex', hd:'Example 5.12 — ideal filters in cascade', rows:[
 ['Given','$X(j\\omega)=2$ on $|\\omega|\\le4\\pi$; an ideal low-pass system with $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$.'],
 ['Find','$Y(j\\omega)$, $y(t)$ and the three time-domain peaks.'],
 ['Method','An LTI system gives $Y=XH$. Multiply the input spectrum and frequency response at each frequency, then apply the inverse transform.'],
 ['Solution','Multiply the two spectra frequency by frequency. On $|\\omega|\\le2\\pi$ both are non-zero: $Y=2\\cdot3=6$. On $2\\pi<|\\omega|\\le4\\pi$ the input is 2 but the system is 0: $Y=2\\cdot0=0$. Beyond $4\\pi$ both are zero. So $Y=6$ on $|\\omega|\\le2\\pi$ and zero elsewhere; the narrower band decides. Invert with the synthesis equation, which is Example 5.6 with $W=2\\pi$ and an extra factor 6: $$\\begin{aligned}y(t)&=\\frac{1}{2\\pi}\\int_{-2\\pi}^{2\\pi}6\\,e^{j\\omega t}\\,\\d\\omega=6\\cdot\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-2\\pi}^{2\\pi}\\\\&=6\\cdot\\frac{e^{j2\\pi t}-e^{-j2\\pi t}}{2\\pi jt}=6\\cdot\\frac{2j\\sin(2\\pi t)}{2\\pi jt}=\\frac{6\\sin(2\\pi t)}{\\pi t}.\\end{aligned}$$'],
 ['Check','At $t=0$ the synthesis integral is the area of the spectrum divided by $2\\pi$, since $e^{j\\omega\\cdot0}=1$. Each peak is therefore the area of its own band over $2\\pi$: $x(0)=2\\cdot8\\pi/2\\pi=8$, $h(0)=3\\cdot4\\pi/2\\pi=6$, $y(0)=6\\cdot4\\pi/2\\pi=12$. The output peak is the largest because a peak counts area, and $6\\times4\\pi$ exceeds $2\\times8\\pi$.']
]},

{t:'h2', num:'5.10', text:'Amplitude modulation'},
{t:'p', text:'A cosine of frequency $\\omega_c$ is called a carrier. Its transform follows from Euler and the complex-exponential pair: $\\cos(\\omega_ct)=\\tfrac12e^{j\\omega_ct}+\\tfrac12e^{-j\\omega_ct}\\leftrightarrow\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)$. Multiplying by the carrier therefore convolves the signal spectrum with two impulses. Convolution with a shifted impulse shifts the function, $X(j\\omega)*\\delta(\\omega-\\omega_c)=X(j(\\omega-\\omega_c))$, so:'},
{t:'eq', tex:'\\begin{aligned}Z(j\\omega)&=\\frac{1}{2\\pi}X(j\\omega)*\\bigl[\\pi\\delta(\\omega-\\omega_c)+\\pi\\delta(\\omega+\\omega_c)\\bigr]\\\\&=\\frac{\\pi}{2\\pi}X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\frac{\\pi}{2\\pi}X\\bigl(j(\\omega+\\omega_c)\\bigr)\\\\&=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr).\\end{aligned}'},
{t:'p', text:'The factor $1/2\\pi$ in the multiplication property and the weight $\\pi$ of each impulse give a factor $\\frac12$ for each shifted copy. The frequency-shift property gives the same result term by term: $\\tfrac12e^{j\\omega_ct}x(t)\\leftrightarrow\\tfrac12X(j(\\omega-\\omega_c))$ and $\\tfrac12e^{-j\\omega_ct}x(t)\\leftrightarrow\\tfrac12X(j(\\omega+\\omega_c))$.'},
{t:'eqbox', cap:'Double-sideband suppressed-carrier modulation',
 tex:['z(t)=x(t)\\cos(\\omega_ct)\\;\\longleftrightarrow\\;Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-\\omega_c)\\bigr)+\\tfrac12X\\bigl(j(\\omega+\\omega_c)\\bigr)'],
 after:'The spectrum is not moved to $\\omega_c$; it is <b>duplicated</b>, one copy at $+\\omega_c$ and one at $-\\omega_c$, each at half height. A description that says "the signal moved up to the carrier" loses the negative-frequency copy and the factor of one half in the same sentence.'},
{t:'p', text:'With $x(t)=\\cos(\\pi t)$ and carrier $\\cos(4\\pi t)$, the product-to-sum identity $\\cos\\alpha\\cos\\beta=\\tfrac12\\cos(\\alpha+\\beta)+\\tfrac12\\cos(\\alpha-\\beta)$ gives $z(t)=\\frac12\\cos(5\\pi t)+\\frac12\\cos(3\\pi t)$. Each cosine of unit amplitude transforms to two impulses of weight $\\pi$, so $\\tfrac12\\cos(3\\pi t)$ gives impulses of weight $\\tfrac12\\cdot\\pi=\\pi/2=1.570796$ at $\\pm3\\pi$, and $\\tfrac12\\cos(5\\pi t)$ gives the same weight at $\\pm5\\pi$. The property gives the same four positions: $X(j\\omega)=\\pi\\delta(\\omega-\\pi)+\\pi\\delta(\\omega+\\pi)$, and the two half-height copies shifted to $\\pm4\\pi$ put weight $\\pi/2$ at $\\pm(4\\pi\\pm\\pi)$, that is at $\\pm3\\pi$ and $\\pm5\\pi$. Nothing sits at $\\omega_c=4\\pi$ itself, which is what "suppressed carrier" records.'},
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
{t:'p', text:'Products of two band-limited signals follow the same arithmetic. Two rectangles of height $A$ and half-width $\\omega_0$ convolve to a triangle: the overlap of the two rectangles is a full $2\\omega_0$ wide at zero shift, giving the apex $A\\cdot A\\cdot2\\omega_0=2A^{2}\\omega_0$, and it shrinks linearly to nothing at shift $\\pm2\\omega_0$, so the triangle lives on $|\\omega|\\le2\\omega_0$. For $x(t)=\\sin(2\\pi t)/(\\pi t)$, Example 5.6 gives $A=1$ and $\\omega_0=2\\pi$, so $X*X$ is a triangle of apex $2\\cdot1\\cdot2\\pi=4\\pi$ on $|\\omega|\\le4\\pi$; with the $1/2\\pi$ of the multiplication property, the transform of $x^{2}(t)$ is a triangle of apex $4\\pi/2\\pi=2$ on $|\\omega|\\le4\\pi$. The time-domain peak is $x^{2}(0)=(2\\pi/\\pi)^{2}=2^{2}=4$, and the area of that triangle over $2\\pi$ agrees: $\\tfrac12\\cdot8\\pi\\cdot2/2\\pi=4$. With unequal half-widths $2\\pi$ and $4\\pi$, the narrow rectangle fits wholly inside the wide one for shifts up to $2\\pi$, so the overlap stays at its full width $4\\pi$ there: the result is a trapezoid of height $4\\pi/2\\pi=2$, flat on $|\\omega|\\le2\\pi$, falling linearly to zero at $|\\omega|=6\\pi$, the sum of the half-widths. Its time-domain peak is the product of the two peaks, $2\\times4=8$. The flat top is as wide as the difference of the two half-widths, and it shrinks to a point when they are equal.'},

{t:'h2', num:'5.11', text:'Systems described by a differential equation'},
{t:'p', text:'The Fourier transform converts a linear differential equation with constant coefficients into an algebraic equation. Take the transform of both sides. Linearity moves the transform inside each sum and past each constant coefficient, and the differentiation property replaces each derivative $\\d^{k}/\\d t^{k}$ by the factor $(j\\omega)^{k}$:'},
{t:'eq', tex:'\\sum_{k=0}^{N}a_k(j\\omega)^{k}Y(j\\omega)=\\sum_{k=0}^{M}b_k(j\\omega)^{k}X(j\\omega).'},
{t:'p', text:'Both sides now contain a plain product. Factor $Y(j\\omega)$ out of the left sum and $X(j\\omega)$ out of the right sum, and divide. The ratio $Y/X$ is the frequency response, because for an LTI system $Y=XH$:'},
{t:'eqbox', cap:'Frequency response from the coefficients',
 tex:['\\sum_{k=0}^{N}a_k\\frac{\\d^{k}y}{\\d t^{k}}=\\sum_{k=0}^{M}b_k\\frac{\\d^{k}x}{\\d t^{k}}\\quad\\Longrightarrow\\quad H(j\\omega)=\\frac{\\sum_{k=0}^{M}b_k(j\\omega)^{k}}{\\sum_{k=0}^{N}a_k(j\\omega)^{k}}'],
 after:'The differential-equation coefficients form two polynomials in $j\\omega$, and their ratio is the frequency response. Next calculate $Y=XH$, expand it into simple fractions, and invert each term with the transform table. During the algebra, define $s=j\\omega$ and substitute back at the end.'},
{t:'ex', hd:'Example 5.13 — simple poles', rows:[
 ['Given','$\\dfrac{\\d^{2}y}{\\d t^{2}}+4\\dfrac{\\d y}{\\d t}+3y=\\dfrac{\\d x}{\\d t}+2x$, at rest.'],
 ['Find','$H(j\\omega)$ and $h(t)$.'],
 ['Method','The differential equation has constant coefficients, so the differentiation property turns it into algebra. Form the frequency-response ratio, factor it, expand it into simple fractions, and invert each term.'],
 ['Solution','Take the transform of both sides. Each derivative becomes a power of $j\\omega$, and linearity keeps the coefficients: $$(j\\omega)^{2}Y(j\\omega)+4(j\\omega)Y(j\\omega)+3Y(j\\omega)=(j\\omega)X(j\\omega)+2X(j\\omega).$$ Write $s=j\\omega$ as a shorthand, factor out $Y$ on the left and $X$ on the right, and divide: $$H=\\frac{Y}{X}=\\frac{s+2}{s^{2}+4s+3}.$$ Factor the denominator. Its roots are the values of $s$ where $s^{2}+4s+3=0$, that is $s=-1$ and $s=-3$, so $s^{2}+4s+3=(s+1)(s+3)$. Expand into simple fractions: $$\\frac{s+2}{(s+1)(s+3)}=\\frac{A}{s+1}+\\frac{B}{s+3},\\qquad s+2=A(s+3)+B(s+1).$$ Set $s=-1$ so the $B$ term vanishes: $-1+2=A(-1+3)$, so $1=2A$ and $A=\\tfrac12$. Set $s=-3$ so the $A$ term vanishes: $-3+2=B(-3+1)$, so $-1=-2B$ and $B=\\tfrac12$. This is the cover-up rule: cover one factor, and evaluate the rest at the root of that factor. Hence $$H(j\\omega)=\\frac{1/2}{1+j\\omega}+\\frac{1/2}{3+j\\omega},$$ and each fraction is the pair of Example 5.3, so $$h(t)=\\Bigl[\\tfrac12e^{-t}+\\tfrac12e^{-3t}\\Bigr]u(t).$$'],
 ['Check','At $\\omega=0$, $H(j0)=2/3$ from the ratio. The transform at $\\omega=0$ is the area, and $\\int_{0}^{\\infty}h\\,\\d t=\\tfrac12\\cdot1+\\tfrac12\\cdot\\tfrac13=\\tfrac12+\\tfrac16=\\tfrac23$, which agrees. Also $h(0^{+})=\\tfrac12+\\tfrac12=1$. The roots $s=-1$ and $s=-3$ both have negative real part, so both exponentials decay, $h$ is absolutely integrable and $H$ was entitled to exist.']
]},
{t:'h3', text:'Repeated poles'},
{t:'p', text:'The cover-up rule assumes each factor of the denominator appears once. When a factor is repeated, one term is needed per power, and covering up reaches only the highest of them. The reason is visible after clearing denominators: with $(s-\\lambda)^{m}$ in the denominator, multiplying by $(s-\\lambda)^{m}$ and setting $s=\\lambda$ removes every term except the one with the highest power, which gives $c_m$. To reach the next coefficient, differentiate once before setting $s=\\lambda$; the term $c_m$ is a constant and disappears, the term $c_{m-1}(s-\\lambda)$ leaves $c_{m-1}$, and every other term still carries a factor $(s-\\lambda)$ and vanishes. Each further derivative peels off one more coefficient, with a factorial from differentiating the power.'},
{t:'eqbox', cap:'Repeated-pole rule',
 tex:['F(s)=\\frac{N(s)}{(s-\\lambda)^{m}Q(s)},\\qquad c_{m-k}=\\frac{1}{k!}\\left.\\frac{\\d^{k}}{\\d s^{k}}\\Bigl[(s-\\lambda)^{m}F(s)\\Bigr]\\right|_{s=\\lambda}'],
 after:'Here $c_1,\\dots,c_m$ are the coefficients of $1/(s-\\lambda),\\dots,1/(s-\\lambda)^{m}$ in the expansion of $F$, and $k=0$ is the cover-up rule and gives $c_m$. The inverse transforms needed are $1/(s+a)\\leftrightarrow e^{-at}u(t)$ from Example 5.3 and $1/(s+a)^{2}\\leftrightarrow t\\,e^{-at}u(t)$ from the differentiation-in-frequency property of Section 5.6: a repeated pole always brings a factor of $t$ into the time domain.'},
{t:'ex', hd:'Example 5.14 — a repeated pole, and the check that catches a sign', rows:[
 ['Given','The system of Example 5.13, with input $x(t)=e^{-t}u(t)$.'],
 ['Find','$y(t)$.'],
 ['Method','The input passes through an LTI system, so calculate $Y=XH$. Define $s=j\\omega$, expand $Y$ into partial fractions, and invert each term.'],
 ['Solution','Example 5.3 gives $X=1/(s+1)$ with $s=j\\omega$, and Example 5.13 gives $H$. Multiply: $$Y=\\frac{1}{s+1}\\cdot\\frac{s+2}{(s+1)(s+3)}=\\frac{s+2}{(s+1)^{2}(s+3)}.$$ The input pole coincides with a system pole, so $s=-1$ is now double. One term is needed per power of $(s+1)$: $$Y=\\frac{A}{s+1}+\\frac{B}{(s+1)^{2}}+\\frac{C}{s+3}.$$ For $B$, multiply by $(s+1)^{2}$ and set $s=-1$: $$B=\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\left.\\frac{s+2}{s+3}\\right|_{s=-1}=\\frac{-1+2}{-1+3}=\\frac12.$$ For $A$, differentiate the same product once before setting $s=-1$. By the quotient rule, $\\frac{\\d}{\\d s}\\frac{s+2}{s+3}=\\frac{(s+3)\\cdot1-(s+2)\\cdot1}{(s+3)^{2}}=\\frac{1}{(s+3)^{2}}$, so $$A=\\frac{\\d}{\\d s}\\Bigl[(s+1)^{2}Y\\Bigr]_{s=-1}=\\left.\\frac{1}{(s+3)^{2}}\\right|_{s=-1}=\\frac{1}{2^{2}}=\\frac14.$$ For $C$, the factor $(s+3)$ is simple, so cover it up and set $s=-3$: $$C=\\Bigl[(s+3)Y\\Bigr]_{s=-3}=\\left.\\frac{s+2}{(s+1)^{2}}\\right|_{s=-3}=\\frac{-3+2}{(-3+1)^{2}}=\\frac{-1}{4}=-\\frac14.$$ Invert term by term with $1/(s+a)\\leftrightarrow e^{-at}u(t)$ and $1/(s+a)^{2}\\leftrightarrow te^{-at}u(t)$: $$y(t)=\\left[\\tfrac14e^{-t}+\\tfrac12t\\,e^{-t}-\\tfrac14e^{-3t}\\right]u(t).$$'],
 ['Check','$y(0)=\\frac14+0-\\frac14=0$, as a convolution of two causal signals must be. Assembling $C$ as $+\\frac14$ instead gives $y(0)=\\frac12$, which no causal convolution can. The two candidates agree to three decimals past $t=2$, where they are $0.168549$ and $0.169789$, so only the value at the origin separates them. Convolving $x$ with $h$ directly, $y(t)=\\int_{0}^{t}e^{-(t-\\tau)}\\bigl[\\tfrac12e^{-\\tau}+\\tfrac12e^{-3\\tau}\\bigr]\\d\\tau$, returns the same three terms with the same signs.']
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
