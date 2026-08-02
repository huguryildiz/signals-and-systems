/* ==========================================================================
   Practice questions — Module 5.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;
const trio=(a,b,c)=>`<div class="dr-pair" style="grid-template-columns:repeat(3,1fr)"><div>${a}</div><div>${b}</div><div>${c}</div></div>`;

/* ======================================================================
   MODULE 5 — The Continuous-Time Fourier Transform
   ====================================================================== */

CONTENT.DRILLTYPES.M5 = [
  { k:'ft-basic', name:'Transform of a given signal',
    asks:'A signal is given in closed form — including a periodic one. Compute $X(j\\omega)$ from the analysis equation.',
    method:['Write the analysis integral and cut it down to the support of the signal.',
            'A one-sided exponential integrates directly; a rectangular pulse gives a sinc; a periodic signal gives a line spectrum built from its Fourier series coefficients.',
            'State the convergence condition wherever the integral needs one.',
            'Check $X(0)=\\int x(t)\\,\\d t$, the total area, as a free test.'],
    go:'m5-pair' },
  { k:'ft-inv', name:'Inverse transform from a rational $X(j\\omega)$',
    asks:'A rational $X(j\\omega)$ — or a frequency response read off a differential equation — is given. Recover $x(t)$.',
    method:['Treat $j\\omega$ as a single symbol and factor the denominator in it.',
            'Split into partial fractions; a repeated factor needs one term per power, found by differentiation, not by covering up.',
            'Invert each term with $\\dfrac{1}{a+j\\omega}\\leftrightarrow e^{-at}u(t)$ and $\\dfrac{1}{(a+j\\omega)^{2}}\\leftrightarrow t\\,e^{-at}u(t)$, valid for $a>0$.',
            'Check by evaluating $X(0)$ against $\\int x(t)\\,\\d t$.'],
    go:'m5-diffeq-ex' },
  { k:'ft-dual', name:'A property used as the shortcut',
    asks:'A signal is built from a known transform pair by duality, a shift, a scaling, or a derivative. Use the property instead of integrating again.',
    method:['Identify which known pair the signal is built from, and which property connects the two.',
            'Duality: if $x(t)\\leftrightarrow X(j\\omega)$, then $X(t)\\leftrightarrow2\\pi\\,x(-\\omega)$. A shift in one domain is an exponential factor in the other; a scale factor in time is the reciprocal scale in frequency.',
            'Apply the property once, carefully, and do not lose a sign or a factor of $2\\pi$ on the way.',
            'Check the result at $\\omega=0$ or at $t=0$ against the area of the given signal.'],
    go:'m5-duality' },
  { k:'ft-parseval', name:'Total energy in frequency',
    asks:'Compute the energy of a signal, in time or in frequency.',
    method:['Parseval: $\\int|x(t)|^{2}\\,\\d t=\\dfrac{1}{2\\pi}\\int|X(j\\omega)|^{2}\\,\\d\\omega$.',
            'Choose whichever side is the easier integral. That choice is the whole skill.',
            'Do not forget the $1/2\\pi$ on the frequency side.',
            'Both sides are real and non-negative. A complex or negative answer means an algebra error.'],
    go:'m5-parseval' },
  { k:'ft-mod', name:'Modulation and a communication chain',
    asks:'A signal is multiplied by a carrier, or carried through a modulator and a filter. Find the spectrum at each stage.',
    method:['Multiplication in time is convolution in frequency, with a factor $1/2\\pi$. For a cosine carrier the convolution is two shifted half-height copies.',
            'Draw the shifted copies and check whether they overlap. Overlap is where information is lost.',
            'An ideal filter multiplies the spectrum by $1$ inside its band and by $0$ outside it.',
            'A chain is done one stage at a time, never all at once, and the final spectrum is checked against the original at one frequency.'],
    go:'m5-am' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'Several transforms under one statement, or one signal carried through a whole chain.',
    method:['Name the standard pair each part is built on before transforming anything. Almost every part is a table entry plus one property.',
            'Where several transforms are asked for, do the simplest first and use it for the others: a duality, a shift or a modulation usually turns one answer into the next.',
            'In a chain, take one stage at a time and draw the spectrum after each. Overlap between shifted copies is where information is lost, and it is visible only in the drawing.',
            'Check at one frequency. $X(j0)$ is the area under $x(t)$, and Parseval turns an energy in time into an energy in frequency.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D5-01', module:'M5', type:'ft-basic', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=e^{-4t}u(t).$$',
  parts:['Compute $X(j\\omega)$, stating the condition under which the integral converges.',
         'Evaluate $|X(j3)|$ and $\\angle X(j3)$, and sketch $|X(j\\omega)|$.',
         'Check $X(0)$ against the area of $x(t)$.'],
  sol:'<b>Given.</b> A causal one-sided decaying exponential, rate $4$.<br>'
     +'<b>Find.</b> Its transform, one numerical value on it, and a free check.<br>'
     +'<b>Method.</b> The analysis integral runs from $0$ to $\\infty$ and is a single exponential.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{0}^{\\infty}e^{-4t}e^{-j\\omega t}\\,\\d t=\\frac{1}{4+j\\omega}.$$The integral converges because the real part of the exponent, $-4$, is negative.<br>'
     +'<b>Solution — part (b).</b> $|X(j3)|=\\dfrac{1}{\\sqrt{16+9}}=\\dfrac{1}{5}=0.2$, and $\\angle X(j3)=-\\arctan\\!\\left(\\dfrac34\\right)=-0.6435$ rad. The curve $|X(j\\omega)|=1/\\sqrt{16+\\omega^{2}}$ peaks at $\\omega=0$ and falls off as $1/|\\omega|$.<br>'
     +'<b>Check.</b> $X(0)=\\dfrac14=0.25$, and directly $\\displaystyle\\int_{0}^{\\infty}e^{-4t}\\,\\d t=\\dfrac14$. They agree.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-8.4,8.4],yr:[-0.02,0.28],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|X(j\\omega)|',
      pad:{l:58,r:28,t:34,b:40},xstep:2,ystep:0.05});
    a.curve(w=>1/Math.sqrt(16+w*w),{color:C.mid});
    a.point(3,0.2,{color:C.coral});
    a.note(3.4,0.235,'|X(j3)|=0.2',{color:C.coral,fs:13,tex:true});
    return a.svg();},
  err:'Reporting $\\angle X(j3)=+\\arctan(3/4)$, by forgetting that the imaginary part of $4-j3$ (the conjugate used to rationalise) carries the opposite sign to the $j\\omega$ in the denominator.',
  teach:'Ask for the convergence condition to be stated before the integral is written. A student who never checks the sign of the exponent will eventually apply this pair with $a<0$.' },

{ id:'D5-02', module:'M5', type:'ft-basic', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=t\\,e^{-3t}u(t).$$',
  parts:['Compute $X(j\\omega)$ directly from the analysis equation.',
         'Give $|X(j\\omega)|$, state where it peaks, and sketch it.',
         'Check $X(0)$ against the area of $x(t)$.'],
  sol:'<b>Given.</b> A causal signal that starts at zero, rises, and decays — a ramp times an exponential.<br>'
     +'<b>Find.</b> Its transform and the shape of its magnitude.<br>'
     +'<b>Method.</b> The analysis integral is $\\int_{0}^{\\infty}t\\,e^{-(3+j\\omega)t}\\,\\d t$, which is the standard form $\\int_{0}^{\\infty}t\\,e^{-st}\\,\\d t=1/s^{2}$ with $s=3+j\\omega$.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{0}^{\\infty}t\\,e^{-(3+j\\omega)t}\\,\\d t=\\frac{1}{(3+j\\omega)^{2}}.$$'
     +'<b>Solution — part (b).</b> Since $|z^{2}|=|z|^{2}$ for any complex $z$,$$|X(j\\omega)|=\\frac{1}{9+\\omega^{2}},$$which peaks at $\\omega=0$ with value $1/9$ and decreases monotonically on either side.<br>'
     +'<b>Check.</b> $X(0)=\\dfrac19$, and directly $\\displaystyle\\int_{0}^{\\infty}t\\,e^{-3t}\\,\\d t=\\dfrac{1}{3^{2}}=\\dfrac19$, using the same standard integral with $\\omega=0$. They agree.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-8.4,8.4],yr:[-0.01,0.13],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|X(j\\omega)|',
      pad:{l:58,r:28,t:34,b:40},xstep:2,ystep:0.02});
    a.curve(w=>1/(9+w*w),{color:C.mid});
    a.point(0,1/9,{color:C.coral});
    return a.svg();},
  err:'Reporting $X(j\\omega)=1/(3+j\\omega)$, the transform of $e^{-3t}u(t)$ alone, by forgetting the extra factor of $t$ changes both the power on the denominator and the numerator.',
  teach:'Point out that $|X(j\\omega)|$ here equals $|1/(3+j\\omega)|^{2}$ exactly, not $|1/(3+j\\omega)|$. Squaring the whole complex number before taking its modulus is the same as squaring the modulus, and this pair is the cleanest place to see why.' },

{ id:'D5-03', module:'M5', type:'ft-basic',
  stem:'A rectangular pulse of height $3$ is defined by $$x(t)=\\begin{cases}3,&|t|<2,\\\\0,&|t|>2.\\end{cases}$$',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.4,3.4],yr:[-0.5,3.9],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.4,0],[-2,0],[-2,3],[2,3],[2,0],[3.4,0]],{color:C.in}); return a.svg();},
  parts:['Compute $X(j\\omega)$ and write it using the unnormalised sinc.',
         'Give the locations of the zeros of $X(j\\omega)$.',
         'Sketch $X(j\\omega)$ and check $X(0)$ against the area of $x(t)$.'],
  sol:'<b>Given.</b> A rectangular pulse of height $3$ on $-2\\le t\\le2$.<br>'
     +'<b>Find.</b> Its transform, its zeros, and its value at the origin.<br>'
     +'<b>Method.</b> The analysis integral runs over the support only. The sinc convention used here is the <b>unnormalised</b> one, $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{-2}^{2}3e^{-j\\omega t}\\,\\d t=3\\cdot\\frac{2\\sin(2\\omega)}{\\omega}=\\frac{6\\sin(2\\omega)}{\\omega}=12\\operatorname{sinc}(2\\omega).$$'
     +'<b>Solution — part (b).</b> $X(j\\omega)=0$ when $\\sin(2\\omega)=0$ and $\\omega\\neq0$, that is at$$\\omega=\\pm\\frac{\\pi}{2},\\pm\\pi,\\pm\\frac{3\\pi}{2},\\dots$$'
     +'<b>Check.</b> Taking the limit, $X(0)=12$, and the area of the pulse is $3\\cdot4=12$. They agree. $X$ is real and even, as it must be for a real even signal, and the first zero at $\\omega=\\pi/2$ is $2\\pi$ divided by the pulse width $4$, the usual reciprocal spacing.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-12.6,12.6],yr:[-3.2,13.2],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:2,ystep:3});
    a.curve(w=>Math.abs(w)<1e-9?12:6*Math.sin(2*w)/w,{color:C.mid,n:1600});
    return a.svg();},
  err:'Reporting $X(j\\omega)=\\dfrac{3\\sin(2\\omega)}{\\omega}$, by integrating correctly but forgetting the factor $2$ that comes from $e^{j2\\omega}-e^{-j2\\omega}=2j\\sin(2\\omega)$.',
  teach:'State the sinc convention every time it is used. A student who quotes the normalised $\\sin(\\pi\\theta)/(\\pi\\theta)$ from elsewhere will place the zeros at the wrong multiples.' },

{ id:'D5-04', module:'M5', type:'ft-basic',
  stem:'A periodic rectangular pulse train has period $T_0=4$ and equals $1$ on $|t|<1$ inside each period, $0$ elsewhere in the period.',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-6.4,6.4],yr:[-0.3,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:34},xstep:2,ystep:1});
    a.poly([[-6.4,0],[-5,0],[-5,1],[-3,1],[-3,0],[-1,0],[-1,1],[1,1],[1,0],[3,0],[3,1],[5,1],[5,0],[6.4,0]],{color:C.in});
    return a.svg();},
  parts:['Find the Fourier series coefficients $a_k$ of $x(t)$, using the analysis equation over one period.',
         'Give $X(j\\omega)$ as a sum of impulses, and state the weight at $k=0,\\pm1,\\pm2,\\pm3$.',
         'Sketch $X(j\\omega)$ for $-2\\pi\\le\\omega\\le2\\pi$, showing the negative frequencies, and say which of the four impulses vanish.'],
  sol:'<b>Given.</b> A periodic pulse train, period $4$, pulse width $2$, so $\\omega_0=2\\pi/4=\\pi/2$.<br>'
     +'<b>Find.</b> Its line spectrum.<br>'
     +'<b>Method.</b> A periodic signal has a line spectrum: find $a_k$ from the analysis equation of Module 4, then place an impulse of weight $2\\pi a_k$ at each harmonic, $X(j\\omega)=2\\pi\\sum_k a_k\\,\\delta(\\omega-k\\omega_0)$.<br>'
     +'<b>Solution — part (a).</b> Integrating over one period $-2\\le t\\le2$, only the pulse on $|t|<1$ contributes:$$a_k=\\frac{1}{4}\\int_{-1}^{1}e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{4}\\cdot\\frac{2\\sin(k\\omega_0)}{k\\omega_0}=\\frac{\\sin(k\\omega_0)}{2k\\omega_0}\\quad(k\\neq0),\\qquad a_0=\\frac{2}{4}=\\frac12.$$'
     +'<b>Solution — part (b).</b> The impulse weight is $2\\pi a_k$, which simplifies to $2\\sin(k\\pi/2)/k$ for $k\\neq0$ and $\\pi$ at $k=0$:$$X(j\\omega)=\\pi\\,\\delta(\\omega)+\\sum_{k\\neq0}\\frac{2\\sin(k\\pi/2)}{k}\\,\\delta\\!\\left(\\omega-\\frac{k\\pi}{2}\\right).$$Numerically: weight $\\pi=3.1416$ at $\\omega=0$; weight $2$ at $\\omega=\\pm\\pi/2$; weight $0$ at $\\omega=\\pm\\pi$; weight $-2/3=-0.6667$ at $\\omega=\\pm3\\pi/2$.<br>'
     +'<b>Solution — part (c).</b> The impulses at $k=\\pm2$ (that is, at $\\omega=\\pm\\pi$) vanish, because $\\sin(\\pi)=0$; the impulse at $k=\\pm3$ points downward, since $\\sin(3\\pi/2)=-1$. The spectrum is symmetric about $\\omega=0$, with the negative-frequency impulses carrying the same real weights as their positive-frequency partners.<br>'
     +'<b>Check.</b> $a_0$ must equal the average value of $x(t)$ over one period, which is $\\text{width}/\\text{period}=2/4=0.5$ — read directly off the picture, with no series involved. Independently, taking the limit of the general formula for $a_k$ as $k\\to0$ gives $\\sin(k\\omega_0)/(2k\\omega_0)\\to\\omega_0k/(2k\\omega_0)=1/2$ by l\u2019H\u00f4pital, the same number by a route that never used the average-value picture.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-7,7],yr:[-1.3,4],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:1,ystep:1});
    for(let k=-4;k<=4;k++){ const wt = k===0?Math.PI:2*Math.sin(k*Math.PI/2)/k; if(Math.abs(wt)<1e-9) continue;
      a.impulse(k*Math.PI/2, wt, {color:C.mid,labelText:wt.toFixed(2)}); }
    return a.svg();},
  err:'Reporting the transform as $\\sum_k a_k\\,\\delta(\\omega-k\\omega_0)$, without the factor $2\\pi$. $a_k$ is a dimensionless Fourier coefficient; $2\\pi a_k$ is the area the impulse must carry.',
  teach:'Have the average-value check done first, from the picture alone, before a single term of the series is computed. It fixes $a_0$ independently of the algebra and catches a lost factor of $2\\pi$ immediately.' },

{ id:'D5-05', module:'M5', type:'ft-inv', src:'MT2 Q3',
  stem:'Find $x(t)$ given $$X(j\\omega)=\\frac{1}{(j\\omega+2)(j\\omega+5)}.$$',
  parts:['Split $X$ into partial fractions.',
         'Give $x(t)$.',
         'Check your answer at $\\omega=0$.'],
  sol:'<b>Given.</b> A rational transform with two distinct real poles.<br>'
     +'<b>Find.</b> The signal it came from.<br>'
     +'<b>Method.</b> Treat $j\\omega$ as one symbol, split into simple fractions, and invert term by term with $\\dfrac{1}{a+j\\omega}\\leftrightarrow e^{-at}u(t)$, $a>0$.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\frac{A}{j\\omega+2}+\\frac{B}{j\\omega+5}.$$Clearing denominators, $A(j\\omega+5)+B(j\\omega+2)=1$, so $A+B=0$ and $5A+2B=1$. Solving, $A=\\dfrac13$, $B=-\\dfrac13$.<br>'
     +'<b>Solution — part (b).</b>$$x(t)=\\frac13\\left(e^{-2t}-e^{-5t}\\right)u(t).$$'
     +'<b>Check.</b> $X(0)=\\dfrac{1}{10}$, and directly $\\displaystyle\\int_{0}^{\\infty}\\frac13\\left(e^{-2t}-e^{-5t}\\right)\\d t=\\frac13\\left(\\frac12-\\frac15\\right)=\\frac13\\cdot\\frac{3}{10}=\\frac{1}{10}$. They agree.',
  err:'Solving the pair of linear equations with the sign of $B$ dropped, giving $x(t)=\\tfrac13(e^{-2t}+e^{-5t})u(t)$, which fails the area check: its area is $\\tfrac13(\\tfrac12+\\tfrac15)=\\tfrac{7}{30}\\neq\\tfrac{1}{10}$.',
  teach:'The area check at $\\omega=0$ is one line and catches a sign error in the coefficients immediately; insist on it before the algebra is called finished.' },

{ id:'D5-06', module:'M5', type:'ft-inv', src:'MT2 Q3',
  stem:'Find $x(t)$ given $$X(j\\omega)=\\frac{j\\omega+6}{(j\\omega+1)(j\\omega+4)}.$$',
  parts:['Split $X$ into partial fractions.',
         'Give $x(t)$.',
         'Check your answer at $\\omega=0$, and state $x(0^{+})$.'],
  sol:'<b>Given.</b> A rational transform with a first-order numerator and two distinct real poles.<br>'
     +'<b>Find.</b> The signal.<br>'
     +'<b>Method.</b> The numerator degree is below the denominator degree, so a direct split works, with no polynomial part.<br>'
     +'<b>Solution — part (a).</b> Writing $s=j\\omega$,$$\\frac{s+6}{(s+1)(s+4)}=\\frac{A}{s+1}+\\frac{B}{s+4}.$$Clearing, $A(s+4)+B(s+1)=s+6$, so $A+B=1$ and $4A+B=6$. Subtracting, $3A=5$, hence $A=\\tfrac53$, $B=-\\tfrac23$.<br>'
     +'<b>Solution — part (b).</b>$$x(t)=\\frac53e^{-t}u(t)-\\frac23e^{-4t}u(t).$$'
     +'<b>Check.</b> $X(0)=\\dfrac64=1.5$, and directly $\\displaystyle\\int_{0}^{\\infty}x(t)\\,\\d t=\\frac53-\\frac23\\cdot\\frac14=\\frac53-\\frac16=\\frac32=1.5$. They agree. Independently, the numerator degree is exactly one below the denominator\u2019s, so $x(0^{+})=\\lim_{j\\omega\\to\\infty}j\\omega X(j\\omega)=\\lim_{s\\to\\infty}\\dfrac{s^{2}+6s}{s^{2}+5s+4}=1$, and directly from the answer $x(0^{+})=\\tfrac53-\\tfrac23=1$ as well — a second, independent number that has to come out right.',
  err:'Swapping $A$ and $B$ in the assembly, reporting $x(t)=-\\tfrac23e^{-t}u(t)+\\tfrac53e^{-4t}u(t)$, which gives $X(0)=-\\tfrac23+\\tfrac{5}{12}=-\\tfrac14\\neq1.5$ and fails the check at once.',
  teach:'The high-frequency limit $x(0^{+})=\\lim j\\omega X(j\\omega)$ is worth teaching as a second, independent check whenever the numerator degree is one below the denominator\u2019s — it needs no integration at all.' },

{ id:'D5-07', module:'M5', type:'ft-inv', src:'MT2 Q3',
  stem:'Find $x(t)$ given $$X(j\\omega)=\\frac{j\\omega+3}{(j\\omega+1)^{2}(j\\omega+2)}.$$',
  parts:['Split $X$ into partial fractions, using the repeated-pole rule at $j\\omega=-1$.',
         'Give $x(t)$.',
         'Check your answer at $\\omega=0$ and at $t=0^{+}$.'],
  sol:'<b>Given.</b> A rational transform with a double pole at $j\\omega=-1$ and a simple pole at $j\\omega=-2$.<br>'
     +'<b>Find.</b> The signal.<br>'
     +'<b>Method.</b> Write $s=j\\omega$. The double pole needs two terms, the second found by differentiation, not by covering up.<br>'
     +'<b>Solution — part (a).</b>$$\\frac{s+3}{(s+1)^{2}(s+2)}=\\frac{A}{s+1}+\\frac{B}{(s+1)^{2}}+\\frac{C}{s+2}.$$Cover-up gives the two accessible coefficients directly:$$B=\\left.\\frac{s+3}{s+2}\\right|_{s=-1}=2,\\qquad C=\\left.\\frac{s+3}{(s+1)^{2}}\\right|_{s=-2}=1.$$For $A$, differentiate $(s+1)^{2}X(s)=\\dfrac{s+3}{s+2}$ once and evaluate at $s=-1$:$$\\frac{\\d}{\\d s}\\left[\\frac{s+3}{s+2}\\right]=\\frac{(s+2)-(s+3)}{(s+2)^{2}}=\\frac{-1}{(s+2)^{2}}\\quad\\Longrightarrow\\quad A=\\left.\\frac{-1}{(s+2)^{2}}\\right|_{s=-1}=-1.$$'
     +'<b>Solution — part (b).</b>$$x(t)=\\left[-e^{-t}+2t\\,e^{-t}+e^{-2t}\\right]u(t).$$'
     +'<b>Check.</b> $X(0)=\\dfrac{3}{1\\cdot2}=1.5$. Directly, $\\displaystyle\\int_{0}^{\\infty}\\left(-e^{-t}+2t\\,e^{-t}+e^{-2t}\\right)\\d t=-1+2+0.5=1.5$, using $\\int_0^\\infty t e^{-t}\\d t=1$. They agree. At $t=0^{+}$: from the answer, $-1+0+1=0$. Independently, the numerator degree is two below the denominator\u2019s, so $\\lim_{s\\to\\infty}sX(s)\\to0$, consistent with $x(0^{+})=0$ by a route that never used the three coefficients.',
  err:'Applying the cover-up rule to the double pole directly, reporting $A=\\left.\\dfrac{s+3}{(s+1)(s+2)}\\right|_{s=-1}$, which divides by zero. Cover-up finds only the coefficient of the <em>highest</em> power of a repeated factor; the rest need differentiation.',
  teach:'Ask which of the three coefficients could have been found by cover-up alone, and which needed the derivative. Only $B$ and $C$ come free; $A$ is the one that tests whether the repeated-pole rule was actually understood.' },

{ id:'D5-08', module:'M5', type:'ft-inv',
  stem:'A system is described by $$\\frac{\\d^{2}y}{\\d t^{2}}+6\\frac{\\d y}{\\d t}+8y=2x(t).$$',
  parts:['Find the frequency response $H(j\\omega)=Y(j\\omega)/X(j\\omega)$.',
         'Split $H$ into partial fractions and give the impulse response $h(t)$.',
         'Check $H(0)$ against the area of $h(t)$.'],
  sol:'<b>Given.</b> A linear differential equation with constant coefficients, relating $y$ to $x$.<br>'
     +'<b>Find.</b> $H(j\\omega)$ and $h(t)$.<br>'
     +'<b>Method.</b> Transform both sides. By the differentiation property each $\\d^{k}/\\d t^{k}$ becomes $(j\\omega)^{k}$, so the equation becomes algebra in $j\\omega$, and $H$ is read straight off the coefficients.<br>'
     +'<b>Solution — part (a).</b>$$\\left[(j\\omega)^{2}+6j\\omega+8\\right]Y(j\\omega)=2X(j\\omega)\\quad\\Longrightarrow\\quad H(j\\omega)=\\frac{2}{(j\\omega)^{2}+6j\\omega+8}=\\frac{2}{(j\\omega+2)(j\\omega+4)}.$$'
     +'<b>Solution — part (b).</b> Writing $s=j\\omega$, $\\dfrac{2}{(s+2)(s+4)}=\\dfrac{A}{s+2}+\\dfrac{B}{s+4}$. Cover-up gives $A=\\left.\\dfrac{2}{s+4}\\right|_{s=-2}=1$ and $B=\\left.\\dfrac{2}{s+2}\\right|_{s=-4}=-1$, so$$h(t)=\\left(e^{-2t}-e^{-4t}\\right)u(t).$$Both poles have negative real part, so the system is stable and $H$ exists.<br>'
     +'<b>Check.</b> $H(0)=\\dfrac{2}{8}=0.25$, and directly $\\displaystyle\\int_{0}^{\\infty}\\left(e^{-2t}-e^{-4t}\\right)\\d t=\\frac12-\\frac14=0.25$. They agree. As a second check, $h(0^{+})=1-1=0$, consistent with the numerator degree being two below the denominator\u2019s.',
  err:'Writing the algebraic equation as $\\left[(j\\omega)^{2}+6j\\omega+8\\right]=2X(j\\omega)/Y(j\\omega)$ and inverting the ratio, which swaps $H$ for $1/H$ and produces a frequency response with poles where the true one has none.',
  teach:'This question starts one step earlier than the others in this type: the rational function is not given, it has to be read off the differential equation first. Ask for that step to be shown explicitly before any partial fraction is attempted.' },

{ id:'D5-09', module:'M5', type:'ft-dual', src:'MT2 Q3',
  stem:'Let $$y(t)=\\frac{6\\sin(3t)}{3t}=\\frac{2\\sin(3t)}{t}.$$',
  figure:()=>{const a=P.Axes({w:1080,h:280,xr:[-4.2,4.2],yr:[-2.4,7.5],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:2});
    a.curve(t=>Math.abs(t)<1e-9?6:2*Math.sin(3*t)/t,{color:C.in,n:1600}); return a.svg();},
  parts:['Identify the known transform pair $y(t)$ is built from, using the unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.',
         'Apply duality to obtain $Y(j\\omega)$, and sketch it.',
         'Check $Y(0)$ against the area of $y(t)$.'],
  sol:'<b>Given.</b> A sinc-shaped signal, $y(t)=6\\operatorname{sinc}(3t)$ in the unnormalised convention.<br>'
     +'<b>Find.</b> Its transform, without integrating.<br>'
     +'<b>Method.</b> Duality: if $x(t)\\leftrightarrow X(j\\omega)$, then $X(t)\\leftrightarrow2\\pi\\,x(-\\omega)$. Recognise $y(t)$ as a known transform read with $t$ in place of $\\omega$.<br>'
     +'<b>Solution — part (a).</b> Let $p(t)=1$ for $|t|<3$, $0$ elsewhere. Its transform is$$P(j\\omega)=\\int_{-3}^{3}e^{-j\\omega t}\\,\\d t=\\frac{2\\sin(3\\omega)}{\\omega}=6\\operatorname{sinc}(3\\omega).$$The given $y(t)$ has exactly the shape of $P$, with $t$ in place of $\\omega$: $y(t)=P(t)$.<br>'
     +'<b>Solution — part (b).</b> By duality, $P(t)\\leftrightarrow2\\pi\\,p(-\\omega)$. Since $p$ is even, $p(-\\omega)=p(\\omega)$, so$$Y(j\\omega)=2\\pi\\,p(\\omega)=\\begin{cases}2\\pi,&|\\omega|<3,\\\\0,&|\\omega|>3.\\end{cases}$$'
     +'<b>Check.</b> $Y(0)=2\\pi=6.2832$. Directly, $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{2\\sin(3t)}{t}\\,\\d t=2\\pi$, using the standard result $\\int_{-\\infty}^{\\infty}\\sin(at)/t\\,\\d t=\\pi$ for $a>0$. They agree, by a route that never used duality.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-6,6],yr:[-0.8,8],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:1,ystep:2});
    a.poly([[-6,0],[-3,0],[-3,2*Math.PI],[3,2*Math.PI],[3,0],[6,0]],{color:C.out}); return a.svg();},
  err:'Applying duality without the factor $2\\pi$, reporting $Y(j\\omega)=1$ on $|\\omega|<3$. The area check at $\\omega=0$ catches it immediately, since the area of $y(t)$ is $2\\pi$, not $1$.',
  teach:'Ask which known pair $y(t)$ is the frequency half of, before any formula is written. Duality questions are won or lost at that identification, not at the algebra.' },

{ id:'D5-10', module:'M5', type:'ft-dual',
  stem:'Let $$y(t)=e^{-3t}u(t),\\qquad z(t)=\\frac{\\d y}{\\d t}.$$',
  parts:['State the differentiation property and use it to find $Z(j\\omega)$ from $Y(j\\omega)$, without differentiating in time.',
         'Write $z(t)$ explicitly, using the product rule on $e^{-3t}u(t)$, and note the term that comes from the jump in $y$ at $t=0$.',
         'Check $Z(0)$ against the area of $z(t)$.'],
  sol:'<b>Given.</b> A causal exponential and its derivative.<br>'
     +'<b>Find.</b> $Z(j\\omega)$, by the property and by direct differentiation, and a check that does not reuse either route.<br>'
     +'<b>Method.</b> The differentiation property is $\\dfrac{\\d x}{\\d t}\\leftrightarrow j\\omega\\,X(j\\omega)$; it holds for a signal with a jump as well, provided the jump is carried by an impulse in the derivative.<br>'
     +'<b>Solution — part (a).</b> $Y(j\\omega)=\\dfrac{1}{3+j\\omega}$, so$$Z(j\\omega)=j\\omega\\,Y(j\\omega)=\\frac{j\\omega}{3+j\\omega}.$$'
     +'<b>Solution — part (b).</b> $y(t)$ jumps from $0$ to $1$ at $t=0$, so its derivative carries an impulse of weight $1$ there, in addition to the ordinary derivative of $e^{-3t}$ for $t>0$:$$z(t)=-3e^{-3t}u(t)+\\delta(t).$$'
     +'<b>Check.</b> Transforming part (b) term by term: $\\mathcal{F}\\{-3e^{-3t}u(t)\\}=-\\dfrac{3}{3+j\\omega}$ and $\\mathcal{F}\\{\\delta(t)\\}=1$, so$$Z(j\\omega)=1-\\frac{3}{3+j\\omega}=\\frac{3+j\\omega-3}{3+j\\omega}=\\frac{j\\omega}{3+j\\omega},$$the same expression as part (a), by a route that never invoked the differentiation property. Independently, $Z(0)=0$, and directly $\\int_{-\\infty}^{\\infty}z(t)\\,\\d t=y(\\infty)-y(-\\infty)=0-0=0$ by the fundamental theorem of calculus, agreeing with the formula without evaluating any transform at all.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-0.6,2.2],yr:[-3.4,1.6],xlabel:'t\\;(\\text{s})',ylabel:'z(t)',
      pad:{l:54,r:28,t:34,b:38},xstep:0.5,ystep:1});
    a.curve(t=>t>0?-3*Math.exp(-3*t):null,{color:C.mid,n:1200});
    a.impulse(0,1,{color:C.coral,labelText:'1'});
    return a.svg();},
  err:'Writing $Z(j\\omega)=j\\omega/(3+j\\omega)$ from the property but then transforming only $-3e^{-3t}u(t)$ as the check, omitting the impulse from the jump at $t=0$. That gives $-3/(3+j\\omega)\\neq Z(j\\omega)$, and the mismatch is exactly the missing $\\delta(t)$ term.',
  teach:'This question reconnects to Module 1: a signal with a jump differentiates to an impulse. Ask where else in this course that fact has already appeared before this question is marked complete.' },

{ id:'D5-11', module:'M5', type:'ft-dual',
  stem:'Let $p(t)=1$ for $|t|<1$, $0$ elsewhere, with $P(j\\omega)=2\\sin(\\omega)/\\omega$. Let $$w(t)=p(3t-6).$$',
  parts:['Write $w(t)$ in the form $p(at-b)$ and identify $a$ and $b$.',
         'Apply the scaling property, then the time-shift property, to find $W(j\\omega)$ without integrating.',
         'Check $W(0)$ against the area of $w(t)$.'],
  sol:'<b>Given.</b> A rectangular pulse and a combined scale-and-shift of it.<br>'
     +'<b>Find.</b> $W(j\\omega)$, by properties alone.<br>'
     +'<b>Method.</b> Write the argument as $p(a(t-t_0))$, scale first, then shift — the order in which the operations were applied to build $w$ from $p$.<br>'
     +'<b>Solution — part (a).</b> $w(t)=p(3t-6)=p\\bigl(3(t-2)\\bigr)$, so $a=3$ and $t_0=2$.<br>'
     +'<b>Solution — part (b).</b> Scaling first: $q(t)=p(3t)\\leftrightarrow\\dfrac{1}{3}P(j\\omega/3)=\\dfrac{1}{3}\\cdot\\dfrac{2\\sin(\\omega/3)}{\\omega/3}=\\dfrac{2\\sin(\\omega/3)}{\\omega}$. Then shifting by $t_0=2$: $w(t)=q(t-2)\\leftrightarrow e^{-j2\\omega}Q(j\\omega)$, so$$W(j\\omega)=\\frac{2\\sin(\\omega/3)}{\\omega}\\,e^{-j2\\omega}.$$'
     +'<b>Check.</b> $w(t)$ is non-zero where $|3t-6|<1$, that is $\\tfrac53<t<\\tfrac73$, a pulse of width $\\tfrac23$ and height $1$, so its area is $\\tfrac23$. From the formula, $W(0)=\\lim_{\\omega\\to0}\\dfrac{2\\sin(\\omega/3)}{\\omega}=\\dfrac{2}{3}$, using $\\sin(\\omega/3)\\to\\omega/3$. They agree, by a route that never used either property.',
  err:'Reversing the order, shifting $p(t)$ by $6$ before scaling by $3$, which gives $p(3t-6)$ read as $p(3(t-6))=p(3t-18)$ — the wrong signal, centred at $t=6$ instead of $t=2$.',
  teach:'Ask for the support of $w(t)$ to be found directly from $|3t-6|<1$, as an independent check on the interval before the properties are trusted. It is one line and needs no property at all.' },

{ id:'D5-12', module:'M5', type:'ft-dual', src:'MT2 Q3',
  stem:'Let $x(t)=\\dfrac{\\sin(\\pi t)}{\\pi t}$, whose transform is $X(j\\omega)=1$ on $|\\omega|<\\pi$, $0$ elsewhere. Let $$z(t)=e^{j3t}x(t).$$',
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-6,6],yr:[-0.3,1.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:28,t:32,b:36},xstep:1,ystep:1});
    a.poly([[-6,0],[-Math.PI,0],[-Math.PI,1],[Math.PI,1],[Math.PI,0],[6,0]],{color:C.in}); return a.svg();},
  parts:['State the frequency-shift property in the form used here, naming what is fixed and what is being multiplied.',
         'Apply it to find $Z(j\\omega)$ and sketch it, giving the band edges numerically.',
         'Check $z(0)$ against $x(0)$, and again against $\\dfrac{1}{2\\pi}\\displaystyle\\int Z(j\\omega)\\,\\d\\omega$.'],
  sol:'<b>Given.</b> An ideal low-pass signal, multiplied by a complex exponential in time.<br>'
     +'<b>Find.</b> $Z(j\\omega)$, without recomputing the integral.<br>'
     +'<b>Method.</b> The frequency shift property is $e^{j\\omega_0t}x(t)\\leftrightarrow X\\bigl(j(\\omega-\\omega_0)\\bigr)$; here $\\omega_0=3$ is a fixed frequency, and it is $x(t)$, not $X(j\\omega)$, that is being multiplied.<br>'
     +'<b>Solution — part (a) and (b).</b>$$Z(j\\omega)=X\\bigl(j(\\omega-3)\\bigr)=\\begin{cases}1,&|\\omega-3|<\\pi,\\\\0,&\\text{otherwise,}\\end{cases}$$a band of width $2\\pi$ running from $3-\\pi=-0.1416$ to $3+\\pi=6.2832$. Because the shift is by less than $\\pi$, the band now reaches slightly past $\\omega=0$ into negative frequencies.<br>'
     +'<b>Check.</b> $z(0)=e^{0}x(0)=x(0)$, and $x(0)=\\lim_{t\\to0}\\sin(\\pi t)/(\\pi t)=1$. Independently, $\\dfrac{1}{2\\pi}\\displaystyle\\int Z(j\\omega)\\,\\d\\omega=\\dfrac{1}{2\\pi}\\cdot2\\pi\\cdot1=1$, using only the width and height of the shifted band. Both give $1$, and neither used the other.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-3,9],yr:[-0.3,1.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Z(j\\omega)',
      pad:{l:56,r:28,t:32,b:36},xstep:1,ystep:1});
    a.poly([[-3,0],[3-Math.PI,0],[3-Math.PI,1],[3+Math.PI,1],[3+Math.PI,0],[9,0]],{color:C.out});
    a.vline(0,{color:C.muted}); return a.svg();},
  err:'Writing $Z(j\\omega)=X(j\\omega)-3$, shifting the frequency <em>axis label</em> instead of the argument of $X$, which is not a transform of anything and does not answer the question.',
  teach:'The band edges $3\\pm\\pi$ are worth computing explicitly rather than sketched by eye — the left edge lands just below zero here, and a student who does not compute it will draw the whole band on the positive axis.' },

{ id:'D5-13', module:'M5', type:'ft-parseval', src:'MT2 Q3',
  stem:'Let $x(t)=3e^{-2t}u(t)$.',
  parts:['Compute the total energy directly in the time domain.',
         'Compute it again from $X(j\\omega)$ using Parseval\u2019s relation.'],
  sol:'<b>Given.</b> A causal decaying exponential, amplitude $3$.<br>'
     +'<b>Find.</b> Its energy, computed twice.<br>'
     +'<b>Method.</b> Time domain: $E=\\int|x(t)|^{2}\\,\\d t$. Frequency domain: Parseval, $\\int|x(t)|^{2}\\,\\d t=\\dfrac{1}{2\\pi}\\int|X(j\\omega)|^{2}\\,\\d\\omega$.<br>'
     +'<b>Solution — part (a).</b>$$E=\\int_{0}^{\\infty}9e^{-4t}\\,\\d t=\\frac94=2.25\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> $X(j\\omega)=\\dfrac{3}{2+j\\omega}$, so $|X(j\\omega)|^{2}=\\dfrac{9}{4+\\omega^{2}}$, and$$E=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{9}{4+\\omega^{2}}\\,\\d\\omega=\\frac{9}{2\\pi}\\cdot\\frac{\\pi}{2}=\\frac94=2.25\\;\\text{J},$$using $\\int_{-\\infty}^{\\infty}\\d\\omega/(a^{2}+\\omega^{2})=\\pi/a$ with $a=2$.<br>'
     +'<b>Check.</b> The two routes agree at $2.25$ J. Both are positive and real, as an energy must be. Here the time integral was the shorter of the two; the value of Parseval is greatest when a signal is given by its spectrum and the time route is not available at all.',
  err:'Omitting the factor $1/2\\pi$ on the frequency side, giving $E=9\\pi/2\\approx14.14$ J, which disagrees with the time-domain answer by a factor of $2\\pi$.',
  teach:'Ask which side would be shorter before either is computed. The choice of route is the examinable skill; both integrals are routine once chosen.' },

{ id:'D5-14', module:'M5', type:'ft-parseval', src:'MT2 Q3',
  stem:'Let $y(t)=e^{-4|t|}$, whose transform is $Y(j\\omega)=\\dfrac{8}{16+\\omega^{2}}$.',
  parts:['Compute the total energy of $y(t)$ in the time domain.',
         'Use Parseval\u2019s relation to evaluate $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{\\left(16+\\omega^{2}\\right)^{2}}$.'],
  sol:'<b>Given.</b> A two-sided exponential and its transform.<br>'
     +'<b>Find.</b> Its energy, then a definite integral that Parseval makes free.<br>'
     +'<b>Method.</b> Compute the energy where it is easy — in time — then read Parseval backwards to evaluate the frequency integral.<br>'
     +'<b>Solution — part (a).</b>$$E=\\int_{-\\infty}^{\\infty}e^{-8|t|}\\,\\d t=2\\int_{0}^{\\infty}e^{-8t}\\,\\d t=2\\cdot\\frac18=\\frac14\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> Parseval gives$$\\frac14=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{64}{\\left(16+\\omega^{2}\\right)^{2}}\\,\\d\\omega,$$so$$\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{\\left(16+\\omega^{2}\\right)^{2}}=\\frac{2\\pi}{4\\cdot64}=\\frac{\\pi}{128}.$$'
     +'<b>Check.</b> The general result $\\displaystyle\\int\\d\\omega/(a^{2}+\\omega^{2})^{2}=\\pi/(2a^{3})$ returns $\\pi/(2\\cdot64)=\\pi/128$ at $a=4$, matching without reference to the energy computed in part (a). The value is positive and, since $(16+\\omega^{2})^{2}\\ge(16+\\omega^{2})\\cdot16$ for $\\omega$ near $0$, it is smaller than $\\tfrac{1}{16}\\int\\d\\omega/(16+\\omega^{2})=\\pi/64$, and $\\pi/128<\\pi/64$, as it must be.',
  err:'Dividing by $16$ instead of $64=8^{2}$ when isolating the integral, giving $\\pi/32$ — the numerator of $Y$ must be squared before it is factored out of the integral.',
  teach:'Set this beside D5-13: there Parseval confirmed a number already known; here it evaluates an integral that would otherwise need a reduction formula. Both directions are worth practising side by side.' },

{ id:'D5-15', module:'M5', type:'ft-parseval',
  stem:'A signal has $X(j\\omega)=5$ for $|\\omega|<4$, $0$ elsewhere.',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-6.4,6.4],yr:[-1,6.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:54,r:28,t:32,b:36},xstep:1,ystep:2});
    a.poly([[-6.4,0],[-4,0],[-4,5],[4,5],[4,0],[6.4,0]],{color:C.in}); return a.svg();},
  parts:['Compute the total energy of $x(t)$ using Parseval.',
         'Find $x(t)$ from the ideal low-pass pair, and check $x(0)$ against $\\dfrac{1}{2\\pi}\\displaystyle\\int X(j\\omega)\\,\\d\\omega$.',
         'Find the fraction of the total energy that lies in $|\\omega|<2$.'],
  sol:'<b>Given.</b> An ideal low-pass spectrum, height $5$, cut-off $4$.<br>'
     +'<b>Find.</b> The total energy, the signal, and the fraction of energy in a narrower band.<br>'
     +'<b>Method.</b> Parseval for the total energy; the synthesis equation for $x(t)$; and, since $|X(j\\omega)|^{2}$ is constant across the band, the energy in any sub-band is proportional to its width alone.<br>'
     +'<b>Solution — part (a).</b>$$E=\\frac{1}{2\\pi}\\int_{-4}^{4}25\\,\\d\\omega=\\frac{25\\cdot8}{2\\pi}=\\frac{100}{\\pi}=31.831\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b>$$x(t)=\\frac{1}{2\\pi}\\int_{-4}^{4}5e^{j\\omega t}\\,\\d\\omega=\\frac{5\\sin(4t)}{\\pi t}.$$Taking the limit, $x(0)=\\dfrac{5\\cdot4}{\\pi}=\\dfrac{20}{\\pi}=6.366$, and directly $\\dfrac{1}{2\\pi}\\displaystyle\\int_{-4}^{4}5\\,\\d\\omega=\\dfrac{40}{2\\pi}=\\dfrac{20}{\\pi}$. They agree.<br>'
     +'<b>Solution — part (c).</b> $|X(j\\omega)|^{2}=25$ is the same constant across the whole band $|\\omega|<4$, so the energy density in frequency is uniform there, and the fraction of energy lying in $|\\omega|<2$ is simply the ratio of widths, $4/8=0.5$: exactly half.<br>'
     +'<b>Check.</b> Because the density is uniform, this fraction did not need a fresh integral — it is read off the widths alone. Multiplying it back out, half of $100/\\pi$ is $50/\\pi=15.915$ J, and $\\dfrac{1}{2\\pi}\\int_{-2}^{2}25\\,\\d\\omega=\\dfrac{100}{2\\pi}=\\dfrac{50}{\\pi}$, confirming the shortcut by the integral it replaced.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.4,2.4],yr:[-2,7],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:24,t:32,b:36},xstep:1,ystep:2});
      a.curve(t=>Math.abs(t)<1e-9?20/Math.PI:5*Math.sin(4*t)/(Math.PI*t),{color:C.in,n:1600});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-6.4,6.4],yr:[-1,6.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:54,r:24,t:32,b:36},xstep:1,ystep:2});
      a.area(w=>Math.abs(w)<2?5:0,-6.4,6.4,{color:'rgba(74,122,70,.16)'});
      a.poly([[-6.4,0],[-4,0],[-4,5],[4,5],[4,0],[6.4,0]],{color:C.in});
      a.span(-2,2,5.5,'',{color:C.coral});
      a.note(2.4,5.9,'\\text{half the energy}',{tex:true,fs:13,color:C.coral});
      return a.svg();})()),
  err:'Computing the fraction in part (c) as the ratio of the <em>heights</em> squared to the widths together, or attempting a fresh integral over $|\\omega|<2$ instead of noticing the density is flat and the ratio of widths already answers it.',
  teach:'Part (c) is the point of the question: recognising a uniform energy density turns an integral into a ratio. Ask for the general rule — a fraction $W_1/W$ of an ideal band\u2019s width carries that same fraction of its energy — stated once, in words.' },

{ id:'D5-16', module:'M5', type:'ft-parseval',
  stem:'Let $x_1(t)=2e^{-3t}u(t)$ and $x_2(t)=2e^{3t}u(-t)=x_1(-t)$.',
  parts:['Compute $E_1$, the energy of $x_1(t)$, in the time domain.',
         'Find $X_2(j\\omega)$ using the time-reversal property, and say what it implies about $|X_2(j\\omega)|$ compared with $|X_1(j\\omega)|$.',
         'State $E_2$ without a new frequency integral, then confirm it directly in the time domain.'],
  sol:'<b>Given.</b> A causal decaying exponential and its time reversal.<br>'
     +'<b>Find.</b> Both energies, using Parseval to show one needs no new work once the other is known.<br>'
     +'<b>Method.</b> Time-reversal: $x(-t)\\leftrightarrow X(-j\\omega)$. Parseval depends on $|X(j\\omega)|^{2}$ only, and $|X(-j\\omega)|=|X(j\\omega)|$ whenever $X(-j\\omega)$ is the reflection of $X(j\\omega)$ about $\\omega=0$.<br>'
     +'<b>Solution — part (a).</b>$$E_1=\\int_{0}^{\\infty}4e^{-6t}\\,\\d t=\\frac46=\\frac23\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> $X_1(j\\omega)=\\dfrac{2}{3+j\\omega}$, so by time reversal $X_2(j\\omega)=X_1(-j\\omega)=\\dfrac{2}{3-j\\omega}$. Then $|X_2(j\\omega)|=\\dfrac{2}{\\sqrt{9+\\omega^{2}}}=|X_1(j\\omega)|$ at every $\\omega$: reversing a signal in time reflects its spectrum but leaves the spectrum\u2019s magnitude unchanged.<br>'
     +'<b>Solution — part (c).</b> Since $|X_2|=|X_1|$ everywhere, Parseval gives the same integral for both:$$E_2=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X_2(j\\omega)|^{2}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X_1(j\\omega)|^{2}\\,\\d\\omega=E_1=\\frac23\\;\\text{J},$$with no new integral evaluated.<br>'
     +'<b>Check.</b> Directly, $\\displaystyle\\int_{-\\infty}^{0}4e^{6t}\\,\\d t=\\frac46=\\frac23$, the same number, by a route that used only the time-domain definition of $x_2$ and never mentioned $X_1$ or $X_2$ at all.',
  err:'Assuming time reversal leaves the energy unchanged as a general fact about all signals, rather than deriving it here from $|X(-j\\omega)|=|X(j\\omega)|$. The property that actually does the work is $\\int|x(-t)|^{2}\\,\\d t=\\int|x(\\tau)|^{2}\\,\\d\\tau$ after the substitution $\\tau=-t$, and it is worth naming, not just asserting.',
  teach:'The point worth making explicit: energy is invariant under time reversal for <em>every</em> signal, by a one-line change of variable in the time-domain integral, and this question shows the same fact appearing, less directly, through the frequency domain.' },

{ id:'D5-17', module:'M5', type:'ft-mod', src:'MT2 Q4',
  stem:'A signal has $X(j\\omega)=1$ for $|\\omega|<5$, $0$ elsewhere. It is modulated by a carrier: $$z(t)=x(t)\\cos(20t).$$',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-9,9],yr:[-0.3,1.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:54,r:28,t:32,b:36},xstep:2,ystep:1});
    a.poly([[-9,0],[-5,0],[-5,1],[5,1],[5,0],[9,0]],{color:C.in}); return a.svg();},
  parts:['Give $Z(j\\omega)$.',
         'Sketch $Z(j\\omega)$, showing the negative-frequency copy.',
         'State the general non-overlap condition on the carrier frequency, and verify it holds here.'],
  sol:'<b>Given.</b> An ideal low-pass signal, bandwidth $5$, modulated by $\\cos(20t)$.<br>'
     +'<b>Find.</b> The spectrum of the product.<br>'
     +'<b>Method.</b> Multiplying by a cosine carrier makes two half-height copies of $X$, one centred at $+\\omega_c$ and one at $-\\omega_c$.<br>'
     +'<b>Solution — part (a) and (b).</b>$$Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-20)\\bigr)+\\tfrac12X\\bigl(j(\\omega+20)\\bigr),$$two rectangles of height $\\tfrac12$, each $10$ rad/s wide: one on $15<\\omega<25$, one on $-25<\\omega<-15$.<br>'
     +'<b>Solution — part (c).</b> The copies stay apart while the carrier frequency exceeds the bandwidth of the signal, $\\omega_c>W$. Here $\\omega_c=20$ and $W=5$, and $20>5$ with room to spare: the nearer edges of the two bands sit at $\\omega=15$ and $\\omega=-15$, a full $30$ rad/s apart.<br>'
     +'<b>Check.</b> $Z(0)=0$, since neither copy reaches the origin — consistent with $z(t)$ being a pure oscillation with zero mean. The width of each copy, $10$ rad/s, equals the full width of $X$, as a pure shift must leave it.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-28,28],yr:[-0.15,0.85],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Z(j\\omega)',
      pad:{l:56,r:28,t:32,b:38},xstep:5,ystep:0.25});
    a.poly([[-28,0],[-25,0],[-25,0.5],[-15,0.5],[-15,0],[15,0],[15,0.5],[25,0.5],[25,0],[28,0]],{color:C.out});
    return a.svg();},
  err:'Placing the two copies at $\\pm20$ with height $1$ instead of $\\tfrac12$, and treating modulation as a shift of the whole spectrum rather than a duplication of it.',
  teach:'Ask for the gap between the two bands to be written as a formula, $2(\\omega_c-W)$, before it is computed as a number. A student who can only find it by reading the sketch has not connected the picture back to the non-overlap condition.' },

{ id:'D5-18', module:'M5', type:'ft-mod', src:'MT2 Q4',
  stem:'A baseband signal has $X(j\\omega)=1$ for $|\\omega|<3$, $0$ elsewhere. It is sent through the chain $$x(t)\\;\\xrightarrow{\\ \\times\\cos(10t)\\ }\\;z(t)\\;\\xrightarrow{\\ \\times\\cos(10t)\\ }\\;w(t)\\;\\xrightarrow{\\ H(j\\omega)\\ }\\;y(t),$$where the last stage is an ideal low-pass filter, $H(j\\omega)=2$ for $|\\omega|<5$, $0$ elsewhere.',
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-6,6],yr:[-0.3,1.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:54,r:28,t:32,b:36},xstep:1,ystep:1});
    a.poly([[-6,0],[-3,0],[-3,1],[3,1],[3,0],[6,0]],{color:C.in}); return a.svg();},
  parts:['Give $Z(j\\omega)$, the spectrum after the first multiplication, and its two bands.',
         'Give $W(j\\omega)$, the spectrum after the second multiplication, before the filter.',
         'Give $Y(j\\omega)$ after the filter, and confirm it reproduces $X(j\\omega)$ exactly.'],
  sol:'<b>Given.</b> A baseband signal, a carrier at $10$ rad/s applied twice, and an ideal low-pass filter.<br>'
     +'<b>Find.</b> The spectrum at every stage of the chain.<br>'
     +'<b>Method.</b> Apply the modulation rule once per multiplication, tracking every band it produces, then apply the filter as a multiplication by $0$ or by its passband gain.<br>'
     +'<b>Solution — part (a).</b>$$Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-10)\\bigr)+\\tfrac12X\\bigl(j(\\omega+10)\\bigr),$$two bands of height $\\tfrac12$: $7<\\omega<13$ and $-13<\\omega<-7$.<br>'
     +'<b>Solution — part (b).</b> Multiplying $z(t)$ by $\\cos(10t)$ a second time shifts each of $Z$\u2019s two bands both left and right by $10$. The band $7<\\Omega<13$ produces $17<\\omega<23$ and $-3<\\omega<3$; the band $-13<\\Omega<-7$ produces $-3<\\omega<3$ and $-23<\\omega<-17$. Around the origin the two contributions land on the same interval and add:$$W(j\\omega)=\\begin{cases}0.5,&|\\omega|<3,\\\\0.25,&17<|\\omega|<23,\\\\0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Solution — part (c).</b> The filter passes $|\\omega|<5$ at gain $2$ and removes everything beyond it. The band $17<|\\omega|<23$ is entirely outside the passband and is removed; the band $|\\omega|<3$ lies entirely inside it and is scaled by $2$:$$Y(j\\omega)=2\\times0.5=1\\quad\\text{for }|\\omega|<3,\\qquad Y(j\\omega)=0\\text{ otherwise,}$$which is exactly $X(j\\omega)$.<br>'
     +'<b>Check.</b> Each multiplication by a unit-amplitude cosine contributes a factor $\\tfrac12$ to the band that lands back at the origin, so the two multiplications together contribute $\\tfrac12\\times\\tfrac12\\cdot(\\text{overlap of }2)=\\tfrac12$ overall — matching the $0.5$ found in part (b) directly — and the filter gain $2$ was chosen precisely to undo that factor. Recovering $X$ exactly is therefore not a coincidence of the numbers chosen; it is the gain $2$ cancelling the $\\tfrac12$ two multiplications must cost.',
  figSol:()=>trio(
    (()=>{const a=P.Axes({w:350,h:230,xr:[-26,26],yr:[-0.1,0.65],xlabel:'\\omega',ylabel:'Z(j\\omega)',
      pad:{l:46,r:16,t:28,b:32},xstep:10,ystep:0.25});
      a.poly([[-26,0],[-13,0],[-13,0.5],[-7,0.5],[-7,0],[7,0],[7,0.5],[13,0.5],[13,0],[26,0]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:350,h:230,xr:[-26,26],yr:[-0.1,0.65],xlabel:'\\omega',ylabel:'W(j\\omega)',
      pad:{l:46,r:16,t:28,b:32},xstep:10,ystep:0.25});
      a.poly([[-26,0],[-23,0],[-23,0.25],[-17,0.25],[-17,0],[-3,0],[-3,0.5],[3,0.5],[3,0],[17,0],[17,0.25],[23,0.25],[23,0],[26,0]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:350,h:230,xr:[-26,26],yr:[-0.1,1.25],xlabel:'\\omega',ylabel:'Y(j\\omega)',
      pad:{l:46,r:16,t:28,b:32},xstep:10,ystep:0.5});
      a.poly([[-26,0],[-3,0],[-3,1],[3,1],[3,0],[26,0]],{color:C.out}); return a.svg();})()),
  err:'Applying the filter to $Z(j\\omega)$ instead of $W(j\\omega)$, skipping the second multiplication entirely. The filter is the last stage of the chain, not a replacement for the receiver\u2019s second multiply.',
  teach:'Walk the three panels of the solution figure left to right and ask, at each one, which bands survive into the next stage and which do not. The chain is easiest to lose track of algebraically; it is not easy to lose track of on the picture.' },

{ id:'D5-19', module:'M5', type:'ft-mod',
  stem:'A signal has $X(j\\omega)=3$ for $|\\omega|<6$, $0$ elsewhere. It is passed through an ideal low-pass filter, $H(j\\omega)=1$ for $|\\omega|<2$, $0$ elsewhere.',
  figure:()=>pair(
    (()=>{const a=P.Axes({w:520,h:230,xr:[-8,8],yr:[-0.5,3.8],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:50,r:22,t:28,b:34},xstep:2,ystep:1});
      a.poly([[-8,0],[-6,0],[-6,3],[6,3],[6,0],[8,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:230,xr:[-8,8],yr:[-0.3,1.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'H(j\\omega)',
      pad:{l:50,r:22,t:28,b:34},xstep:2,ystep:1});
      a.poly([[-8,0],[-2,0],[-2,1],[2,1],[2,0],[8,0]],{color:C.h}); return a.svg();})()),
  parts:['Give $Y(j\\omega)=X(j\\omega)H(j\\omega)$ and sketch it beside $X(j\\omega)$.',
         'Find $x(t)$ and $y(t)$ in closed form.',
         'Compare $y(0)$ with $x(0)$, and relate the ratio to the two bandwidths.'],
  sol:'<b>Given.</b> An ideal band of height $3$, cut down by an ideal low-pass filter of narrower cut-off.<br>'
     +'<b>Find.</b> The output spectrum, both signals, and what the filter did to the peak value.<br>'
     +'<b>Method.</b> Multiply the two spectra frequency by frequency, then invert each with the ideal low-pass pair.<br>'
     +'<b>Solution — part (a).</b> Where $H=0$ the product is $0$ regardless of $X$; where $H=1$ the product equals $X$:$$Y(j\\omega)=\\begin{cases}3,&|\\omega|<2,\\\\0,&|\\omega|>2.\\end{cases}$$'
     +'<b>Solution — part (b).</b>$$x(t)=\\frac{1}{2\\pi}\\int_{-6}^{6}3e^{j\\omega t}\\,\\d\\omega=\\frac{3\\sin(6t)}{\\pi t},\\qquad y(t)=\\frac{1}{2\\pi}\\int_{-2}^{2}3e^{j\\omega t}\\,\\d\\omega=\\frac{3\\sin(2t)}{\\pi t}.$$'
     +'<b>Solution — part (c).</b> Taking limits, $x(0)=\\dfrac{18}{\\pi}=5.730$ and $y(0)=\\dfrac{6}{\\pi}=1.910$, a ratio of $y(0)/x(0)=1/3$. The two bandwidths are $6$ and $2$, in the same ratio $2/6=1/3$: the filter has shrunk the peak in exactly the proportion it shrank the bandwidth, because the height of the spectrum, $3$, never changed.<br>'
     +'<b>Check.</b> $y(0)=\\dfrac{1}{2\\pi}\\displaystyle\\int Y\\,\\d\\omega=\\dfrac{1}{2\\pi}\\cdot3\\cdot4=\\dfrac{6}{\\pi}$, matching the closed form directly and independently of $x(0)$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-8,8],yr:[-0.5,3.8],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:50,r:22,t:28,b:36},xstep:2,ystep:1});
      a.poly([[-8,0],[-2,0],[-2,3],[2,3],[2,0],[8,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.4,2.4],yr:[-2.6,7],xlabel:'t\\;(\\text{s})',ylabel:'x(t),\\;y(t)',
      pad:{l:52,r:22,t:28,b:36},xstep:1,ystep:2});
      a.curve(t=>Math.abs(t)<1e-9?18/Math.PI:3*Math.sin(6*t)/(Math.PI*t),{color:C.in,width:1.6,dash:'5 5',n:1600});
      a.curve(t=>Math.abs(t)<1e-9?6/Math.PI:3*Math.sin(2*t)/(Math.PI*t),{color:C.out,n:1600});
      return a.svg();})()),
  err:'Reporting $Y(j\\omega)=3$ for $|\\omega|<6$, forgetting that the filter removes everything past its own cut-off regardless of how wide the input band is. An ideal filter is a gate, not a pass-through.',
  teach:'Part (c) is the one worth dwelling on: the filter changed the bandwidth and the peak by the same factor, because it left the height alone. Ask what would change if $H$\u2019s passband gain were $2$ instead of $1$.' },

{ id:'D5-20', module:'M5', type:'ft-mod', src:'MT2 Q4',
  stem:'Two baseband signals, each with $X_1(j\\omega)=X_2(j\\omega)=1$ for $|\\omega|<2$, are sent on one channel by two carriers: $$s(t)=x_1(t)\\cos(10t)+x_2(t)\\cos(20t).$$A receiver recovers $x_2(t)$ by multiplying $s(t)$ by $\\cos(20t)$ and then applying an ideal low-pass filter, $H(j\\omega)=2$ for $|\\omega|<2$, $0$ elsewhere.',
  figure:()=>{const a=P.Axes({w:1080,h:270,xr:[-26,26],yr:[-0.1,0.65],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'S(j\\omega)',
      pad:{l:56,r:28,t:32,b:38},xstep:5,ystep:0.25});
    a.poly([[-26,0],[-22,0],[-22,0.5],[-18,0.5],[-18,0],[-12,0],[-12,0.5],[-8,0.5],[-8,0],
             [8,0],[8,0.5],[12,0.5],[12,0],[18,0],[18,0.5],[22,0.5],[22,0],[26,0]],{color:C.in});
    return a.svg();},
  parts:['Give $S(j\\omega)$, listing the centre and height of all four bands.',
         'After multiplying by $\\cos(20t)$ a second time, give the part of the resulting spectrum lying in $|\\omega|<2$, and say which baseband signal it came from.',
         'Apply the filter and confirm the output equals $X_2(j\\omega)$ exactly. State the nearest surviving band and how far it sits from the filter\u2019s cut-off.'],
  sol:'<b>Given.</b> Two channels sharing one wire by frequency-division: carriers at $10$ and $20$ rad/s, each baseband signal of half-width $2$.<br>'
     +'<b>Find.</b> The spectrum after transmission, after the receiver\u2019s second multiplication, and after its filter — and a margin that shows the separation is not marginal.<br>'
     +'<b>Method.</b> Apply the modulation rule to each carrier separately and add, since the transform is linear; then repeat the rule on the sum for the second multiplication; then apply the filter as a gate.<br>'
     +'<b>Solution — part (a).</b>$$S(j\\omega)=\\tfrac12X_1\\bigl(j(\\omega-10)\\bigr)+\\tfrac12X_1\\bigl(j(\\omega+10)\\bigr)+\\tfrac12X_2\\bigl(j(\\omega-20)\\bigr)+\\tfrac12X_2\\bigl(j(\\omega+20)\\bigr),$$four bands of height $\\tfrac12$ and half-width $2$: centred at $\\omega=10,-10,20,-20$.<br>'
     +'<b>Solution — part (b).</b> Multiplying $S$ by $\\cos(20t)$ shifts each of the four bands both left and right by $20$. Only the bands already centred at $\\pm20$ can land inside $|\\omega|<2$: the one at $+20$ shifted left by $20$, and the one at $-20$ shifted right by $20$, both landing on $|\\omega|<2$ and adding, each contributing height $\\tfrac12\\times\\tfrac12=\\tfrac14$:$$\\text{spectrum on }|\\omega|<2:\\quad\\tfrac14+\\tfrac14=\\tfrac12,$$the shape of $X_2(j\\omega)$ at half its original height. The bands originally at $\\pm10$ shift to $\\pm10\\pm20$, that is $\\pm30$ and $\\mp10$ — none of them lands near the origin, so $x_1$ contributes nothing there.<br>'
     +'<b>Solution — part (c).</b> The filter passes $|\\omega|<2$ at gain $2$: $2\\times\\tfrac12=1$, so the output is $1$ on $|\\omega|<2$, exactly $X_2(j\\omega)$. The nearest band the filter had to reject sits at $\\omega=\\pm(20-20+10)=\\pm10$ — from the shifted $x_1$ contribution — a full $10-2=8$ rad/s beyond the cut-off.<br>'
     +'<b>Check.</b> The margin found in part (c) does not depend on the exact filter shape assumed: even a filter whose passband edge is not perfectly sharp has $8$ rad/s of transition band available before it would admit any of $x_1$, which is what makes the carrier spacing of $10$ rad/s against a signal half-width of $2$ a safe design, not a marginal one.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-14,14],yr:[-0.3,1.4],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:56,r:28,t:32,b:38},xstep:2,ystep:0.5});
    a.poly([[-14,0],[-2,0],[-2,1],[2,1],[2,0],[14,0]],{color:C.out});
    return a.svg();},
  err:'Multiplying by $\\cos(20t)$ and reporting that the band at $+10$ also lands inside $|\\omega|<2$, by shifting it only once instead of tracking both the $+20$ and $-20$ shift of every one of the four bands in $S$.',
  teach:'This is the question that shows why the receiver multiplies by the <em>same</em> carrier the transmitter used for the wanted channel and not the other one. Ask what the output would be if the receiver used $\\cos(10t)$ instead, to see $x_1$ recovered and $x_2$ rejected by the identical argument.' },

/* ----------------------------------------------------------------------
   Full-length questions. Several transforms under one statement, or one
   signal carried through a whole chain.
   ---------------------------------------------------------------------- */

{ id:'D5-21', module:'M5', type:'full', src:'MT2 Q3',
  stem:'Determine the Fourier transforms of the following signals and plot their corresponding magnitude spectra.',
  parts:['$x(t)=\\cos(2t)\\,u(t)$.',
         '$x(t)=u(t+3)-u(t-3)$.',
         '$x(t)=e^{-t(2+j10\\pi)}u(t)$.'],
  sol:'<b>Given.</b> Three one-sided or finite signals.<br>'
     +'<b>Find.</b> Their transforms and magnitude spectra.<br>'
     +'<b>Method.</b> Each is a table entry plus one property. Part (a) needs the transform of the step, part (b) is a plain rectangle, part (c) is a decaying exponential with a complex rate.<br>'
     +'<b>Solution — part (a).</b> Write the cosine as two exponentials and use $u(t)\\leftrightarrow\\pi\\delta(\\omega)+\\dfrac{1}{j\\omega}$ with the frequency-shift property:$$\\cos(2t)u(t)=\\tfrac12e^{j2t}u(t)+\\tfrac12e^{-j2t}u(t),$$$$X(j\\omega)=\\frac{\\pi}{2}\\left[\\delta(\\omega-2)+\\delta(\\omega+2)\\right]+\\frac12\\left[\\frac{1}{j(\\omega-2)}+\\frac{1}{j(\\omega+2)}\\right].$$Combining the two fractions,$$X(j\\omega)=\\frac{\\pi}{2}\\left[\\delta(\\omega-2)+\\delta(\\omega+2)\\right]+\\frac{j\\omega}{4-\\omega^{2}}.$$'
     +'<b>Solution — part (b).</b> A rectangle of height $1$ on $|t|<3$:$$X(j\\omega)=\\int_{-3}^{3}e^{-j\\omega t}\\,\\d t=\\frac{2\\sin(3\\omega)}{\\omega}=6\\,\\frac{\\sin(3\\omega)}{3\\omega},$$a sinc with its first zeros at $\\omega=\\pm\\tfrac{\\pi}{3}$ and a peak of $6$ at the origin.<br>'
     +'<b>Solution — part (c).</b> The exponent is $-2t-j10\\pi t$, so this is $e^{-2t}u(t)$ multiplied by $e^{-j10\\pi t}$:$$X(j\\omega)=\\frac{1}{2+j(\\omega+10\\pi)},\\qquad|X(j\\omega)|=\\frac{1}{\\sqrt{4+(\\omega+10\\pi)^{2}}},$$the usual one-pole magnitude, but centred at $\\omega=-10\\pi$ instead of at the origin.<br>'
     +'<b>Check.</b> In (b), $X(j0)=6$ must be the area under the rectangle, and it is: height $1$ times width $6$. In (c) the peak value is $\\tfrac12$ at $\\omega=-10\\pi$, which is what $\\left|X\\right|$ gives when the bracket vanishes, and it matches the area $\\int_0^{\\infty}e^{-2t}\\,\\d t=\\tfrac12$ of the unmodulated signal. In (a) the impulses carry the average of the one-sided cosine, and the rational part is odd in $\\omega$, as the transform of a real signal that is neither even nor odd must be in its imaginary part.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-6.5,6.5],yr:[-1,6.8],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:2});
      a.curve(w=>Math.abs(w)<1e-6?6:2*Math.sin(3*w)/w,{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-46,-16],yr:[-0.05,0.62],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|X(j\\omega)|',
      pad:{l:56,r:26,t:28,b:38},xstep:10,ystep:0.25});
      a.curve(w=>1/Math.sqrt(4+Math.pow(w+10*Math.PI,2)),{color:C.mid}); return a.svg();})()),
  err:'Dropping the impulses in part (a) and reporting only $\\dfrac{j\\omega}{4-\\omega^{2}}$. The step has a non-zero average, so its transform carries an impulse at the origin, and shifting that impulse to $\\pm2$ is what the two carriers do to it.',
  teach:'Part (c) is the one to slow down on. Ask students to read the exponent before they reach for a formula: separating $-2t$ from $-j10\\pi t$ turns an unfamiliar expression into a table entry and a shift, and no integration is needed at all.' },

{ id:'D5-22', module:'M5', type:'full', src:'MT2 Q3',
  stem:'Please solve the following problems. <em>Hint: if $x(t)\\xrightarrow{\\mathcal{F}}X(j\\omega)=X(\\omega)$, then $X(t)\\xrightarrow{\\mathcal{F}}2\\pi x(-\\omega)$.</em>',
  parts:['Determine the Fourier transform of $x(t)=e^{-3|t|}$.',
         'Determine the Fourier transform of $y(t)=\\dfrac{6}{9+t^{2}}$.',
         'Calculate the total energy in $y(t)$, which is defined in part (b).'],
  sol:'<b>Given.</b> A two-sided decaying exponential, and a rational signal that is its transform read as a function of time.<br>'
     +'<b>Find.</b> Two transforms and one energy.<br>'
     +'<b>Method.</b> Compute (a) directly, then use duality for (b) rather than integrating again. For (c), Parseval turns the energy into an integral of a decaying exponential.<br>'
     +'<b>Solution — part (a).</b> Split the integral at the origin:$$X(j\\omega)=\\int_{-\\infty}^{0}e^{3t}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-3t}e^{-j\\omega t}\\,\\d t=\\frac{1}{3-j\\omega}+\\frac{1}{3+j\\omega}=\\frac{6}{9+\\omega^{2}}.$$It is real and even, as the transform of a real even signal must be.<br>'
     +'<b>Solution — part (b).</b> Part (a) says $X(\\omega)=\\dfrac{6}{9+\\omega^{2}}$, and $y(t)$ is exactly that function with $t$ in place of $\\omega$. By duality,$$Y(j\\omega)=2\\pi x(-\\omega)=2\\pi e^{-3|-\\omega|}=2\\pi e^{-3|\\omega|}.$$'
     +'<b>Solution — part (c).</b> By Parseval,$$E=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|Y(j\\omega)|^{2}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}4\\pi^{2}e^{-6|\\omega|}\\,\\d\\omega=2\\pi\\cdot\\frac{2}{6}=\\frac{2\\pi}{3}\\approx2.094\\;\\text{J}.$$'
     +'<b>Check.</b> Compute the energy in the time domain instead:$$E=\\int_{-\\infty}^{\\infty}\\left(\\frac{6}{9+t^{2}}\\right)^{2}\\d t=36\\int_{-\\infty}^{\\infty}\\frac{\\d t}{(9+t^{2})^{2}}=36\\cdot\\frac{\\pi}{2\\cdot3^{3}}=\\frac{2\\pi}{3},$$using $\\int_{-\\infty}^{\\infty}\\dfrac{\\d t}{(a^{2}+t^{2})^{2}}=\\dfrac{\\pi}{2a^{3}}$. The two agree. A second check: $Y(j0)=2\\pi$ must be the area under $y(t)$, and $\\int\\dfrac{6\\,\\d t}{9+t^{2}}=6\\cdot\\dfrac{\\pi}{3}=2\\pi$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-8,8],yr:[-0.08,0.78],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:0.25});
      a.curve(w=>6/(9+w*w),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.6,2.6],yr:[-0.7,7.2],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:1,ystep:2});
      a.curve(w=>2*Math.PI*Math.exp(-3*Math.abs(w)),{color:C.out}); return a.svg();})()),
  err:'Answering (b) with $e^{-3|\\omega|}$ and losing the factor $2\\pi$. Duality is not a symmetry of the transform pair: going from $X(t)$ back to a signal costs a factor of $2\\pi$, and it shows up in the energy as a factor of $4\\pi^{2}$.',
  teach:'Ask why the reflection $x(-\\omega)$ in the duality statement does nothing here. Because $x$ is even, and it is worth saying so explicitly — a student who never meets an odd example will assume the reflection is decoration.' },

{ id:'D5-23', module:'M5', type:'full', src:'MT2 Q3',
  stem:'Please solve the following problems.',
  parts:['Determine the inverse Fourier transform of $X(j\\omega)=\\dfrac{j\\omega+7}{(j\\omega)^{2}+5j\\omega+6}$.',
         'Determine the Fourier transform of $x(t)=e^{-3(t+2)}\\cos(4t)\\,u(t+2)$.',
         'Determine the Fourier transform of $x(t)=\\sum_{k=0}^{\\infty}\\left(\\tfrac14\\right)^{k}\\delta(t-2k)$.'],
  sol:'<b>Given.</b> A rational spectrum, an advanced damped cosine, and a decaying impulse train.<br>'
     +'<b>Find.</b> One inverse transform and two forward ones.<br>'
     +'<b>Method.</b> Partial fractions for (a); recognise (b) as a standard pair plus a time shift; sum a geometric series for (c).<br>'
     +'<b>Solution — part (a).</b> Write $s=j\\omega$. The denominator factors as $(s+2)(s+3)$, so$$X=\\frac{s+7}{(s+2)(s+3)}=\\frac{A}{s+2}+\\frac{B}{s+3},$$with $A=\\dfrac{-2+7}{-2+3}=5$ and $B=\\dfrac{-3+7}{-3+2}=-4$. Each term inverts to a one-sided exponential:$$x(t)=5e^{-2t}u(t)-4e^{-3t}u(t).$$'
     +'<b>Solution — part (b).</b> Let $g(t)=e^{-3t}\\cos(4t)u(t)$, a standard pair:$$G(j\\omega)=\\frac{3+j\\omega}{(3+j\\omega)^{2}+16}.$$The given signal is $g(t+2)$, an advance of two seconds, so$$X(j\\omega)=e^{j2\\omega}\\,\\frac{3+j\\omega}{(3+j\\omega)^{2}+16}.$$'
     +'<b>Solution — part (c).</b> Transform term by term, using $\\delta(t-t_0)\\leftrightarrow e^{-j\\omega t_0}$:$$X(j\\omega)=\\sum_{k=0}^{\\infty}\\left(\\tfrac14\\right)^{k}e^{-j2k\\omega}=\\sum_{k=0}^{\\infty}\\left(\\tfrac14e^{-j2\\omega}\\right)^{k}=\\frac{1}{1-\\tfrac14e^{-j2\\omega}},$$which converges because $\\left|\\tfrac14e^{-j2\\omega}\\right|=\\tfrac14<1$.<br>'
     +'<b>Check.</b> In (a), $x(0^{+})=5-4=1$, which agrees with $X\\to\\dfrac{1}{s}$ as $s\\to\\infty$ — a spectrum falling off like $1/\\omega$ belongs to a signal with a unit jump at the origin. In (b) the magnitude is unchanged by the advance, $|X|=|G|$, since $\\left|e^{j2\\omega}\\right|=1$; only the phase tilts, by $2\\omega$. In (c), $X(j0)=\\dfrac{1}{1-\\tfrac14}=\\tfrac43$ must be the total weight of the impulses, and $\\sum_k\\left(\\tfrac14\\right)^{k}=\\tfrac43$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,3.4],yr:[-0.15,1.15],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.curve(t=>t<0?0:5*Math.exp(-2*t)-4*Math.exp(-3*t),{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,8.6],yr:[-0.15,1.15],xlabel:'t\\;(\\text{s})',ylabel:'x(t)\\;\\text{of part (c)}',
      pad:{l:66,r:26,t:28,b:38},xstep:2,ystep:0.5});
      a.impulse(0,1,{color:C.in}); a.impulse(2,0.25,{color:C.in});
      a.impulse(4,0.0625,{color:C.in}); a.impulse(6,0.015625,{color:C.in});
      return a.svg();})()),
  err:'Reading the shift in part (b) as a delay and writing $e^{-j2\\omega}$. The step is $u(t+2)$, so the signal starts at $t=-2$: it has been advanced, and the exponential factor carries a plus sign.',
  teach:'Part (a) is worth checking by re-combining the partial fractions. Students who never verify the algebra carry a sign error into a plausible-looking pair of exponentials, and the initial-value check $x(0^{+})=1$ catches it in one line.' },

{ id:'D5-24', module:'M5', type:'full', src:'MT2 Q4',
  stem:'Let $$x(t)=\\cos(t)+\\cos(3t)+2\\cos(5t)$$be an input to the LTI system which has the following impulse response,$$h(t)=\\pi\\,\\frac{\\sin(2t)}{\\pi t}\\,\\frac{\\sin(4t)}{\\pi t}.$$Let $y(t)=x(t)*h(t)$ be the output signal.',
  parts:['Plot the Fourier transform of $x(t)$.',
         'Plot the Fourier transform of $h(t)$.',
         'Plot the Fourier transform of $y(t)$, and give $y(t)$.'],
  sol:'<b>Given.</b> Three cosines driving a filter built as the product of two sincs.<br>'
     +'<b>Find.</b> The three spectra and the output signal.<br>'
     +'<b>Method.</b> A product in time is a convolution in frequency divided by $2\\pi$. Convolving two rectangles gives a trapezoid, and its shape is what the filter does.<br>'
     +'<b>Solution — part (a).</b> Each cosine gives a pair of impulses of weight $\\pi A$:$$X(j\\omega)=\\pi\\left[\\delta(\\omega-1)+\\delta(\\omega+1)\\right]+\\pi\\left[\\delta(\\omega-3)+\\delta(\\omega+3)\\right]+2\\pi\\left[\\delta(\\omega-5)+\\delta(\\omega+5)\\right].$$'
     +'<b>Solution — part (b).</b> Write $g_1(t)=\\dfrac{\\sin(2t)}{\\pi t}$ and $g_2(t)=\\dfrac{\\sin(4t)}{\\pi t}$, whose transforms are rectangles of height $1$ on $|\\omega|<2$ and $|\\omega|<4$. Then$$H(j\\omega)=\\pi\\cdot\\frac{1}{2\\pi}\\left(G_1*G_2\\right)(\\omega)=\\tfrac12\\left(G_1*G_2\\right)(\\omega).$$Convolving a rectangle of width $4$ with one of width $8$ gives a trapezoid: flat at height $2\\cdot2=4$ on $|\\omega|\\le2$, falling linearly to zero at $|\\omega|=6$. Halving it,$$H(j\\omega)=\\begin{cases}2,&|\\omega|\\le2\\\\\\tfrac{6-|\\omega|}{2},&2<|\\omega|<6\\\\0,&|\\omega|\\ge6.\\end{cases}$$'
     +'<b>Solution — part (c).</b> Each impulse is scaled by $H$ at its own frequency:$$H(j1)=2,\\qquad H(j3)=\\tfrac{6-3}{2}=1.5,\\qquad H(j5)=\\tfrac{6-5}{2}=0.5.$$So$$Y(j\\omega)=2\\pi\\left[\\delta(\\omega\\mp1)\\right]+1.5\\pi\\left[\\delta(\\omega\\mp3)\\right]+\\pi\\left[\\delta(\\omega\\mp5)\\right],$$writing $\\delta(\\omega\\mp\\omega_0)$ for the pair, and in the time domain$$y(t)=2\\cos(t)+1.5\\cos(3t)+\\cos(5t).$$'
     +'<b>Check.</b> Each output amplitude is the input amplitude times the gain at that frequency: $1\\cdot2=2$, $1\\cdot1.5=1.5$, and $2\\cdot0.5=1$. The trapezoid is right too: the flat top has the width of the narrower rectangle, $|\\omega|\\le2$, and the total width is the sum of the two half-widths, $2+4=6$. Its value at the origin, $2$, is $\\tfrac12$ times the area of the narrower rectangle, $4$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-8,8],yr:[-0.3,2.6],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'H(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:1});
      a.poly([[-8,0],[-6,0],[-2,2],[2,2],[6,0],[8,0]],{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-7,7],yr:[-1,7.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:2});
      [[-5,Math.PI],[-3,1.5*Math.PI],[-1,2*Math.PI],[1,2*Math.PI],[3,1.5*Math.PI],[5,Math.PI]]
        .forEach(p=>a.impulse(p[0],p[1],{color:C.out}));
      return a.svg();})()),
  err:'Taking $H$ to be the product of the two rectangles, giving a rectangle on $|\\omega|<2$. The signals are multiplied in time, so their transforms are convolved, and the result is wider than either rectangle, not narrower.',
  teach:'The width rule for a convolution of two rectangles is worth stating once and reusing: the flat top has the width of the narrower one and the total support is the sum. It saves the integral every time this shape appears.' },

{ id:'D5-25', module:'M5', type:'full', src:'MT2 Q4',
  stem:'Let $$x(t)=\\frac{1-e^{-j8\\pi t}}{j2\\pi t}$$be an input to the following communication chain, where $\\times$ shows the multiplication operator and the LTI system has the impulse response $h(t)=e^{-j3\\pi t}\\dfrac{\\sin(2\\pi t)}{\\pi t}$. The input is multiplied by $\\cos(6\\pi t)$ to give $y(t)$, and $y(t)$ is filtered by $h(t)$ to give $z(t)$.',
  parts:['Plot the Fourier transform of $x(t)$. <em>Hint: can you write $x(t)$ as $e^{jW_1t}\\dfrac{\\sin(W_2t)}{\\pi t}$ for some $W_1,W_2$?</em>',
         'Plot the Fourier transform of $y(t)$.',
         'Plot the Fourier transform of $z(t)$.'],
  sol:'<b>Given.</b> A one-sided band, a cosine modulator, and a band-pass filter.<br>'
     +'<b>Find.</b> The spectrum after each stage.<br>'
     +'<b>Method.</b> Rewrite $x$ in the hinted form, which turns it into a shifted rectangle. Then take one stage at a time and draw each spectrum before moving on.<br>'
     +'<b>Solution — part (a).</b> Factor the numerator symmetrically:$$x(t)=\\frac{e^{-j4\\pi t}\\left(e^{j4\\pi t}-e^{-j4\\pi t}\\right)}{j2\\pi t}=e^{-j4\\pi t}\\,\\frac{2j\\sin(4\\pi t)}{j2\\pi t}=e^{-j4\\pi t}\\,\\frac{\\sin(4\\pi t)}{\\pi t}.$$The sinc has transform $1$ on $|\\omega|<4\\pi$, and the exponential shifts it by $-4\\pi$, so$$X(j\\omega)=\\begin{cases}1,&-8\\pi<\\omega<0\\\\0,&\\text{otherwise,}\\end{cases}$$a rectangle sitting entirely on the negative frequency axis.<br>'
     +'<b>Solution — part (b).</b> Multiplying by $\\cos(6\\pi t)$ makes two half-height copies, shifted by $\\pm6\\pi$:$$Y(j\\omega)=\\tfrac12X(j(\\omega-6\\pi))+\\tfrac12X(j(\\omega+6\\pi)).$$The first copy occupies $-2\\pi<\\omega<6\\pi$ and the second $-14\\pi<\\omega<-6\\pi$, both at height $\\tfrac12$. They do not overlap, so nothing is lost.<br>'
     +'<b>Solution — part (c).</b> The filter is a sinc of bandwidth $2\\pi$ shifted by $-3\\pi$:$$H(j\\omega)=\\begin{cases}1,&-5\\pi<\\omega<-\\pi\\\\0,&\\text{otherwise.}\\end{cases}$$Multiplying, $Z=YH$. The copy on $-14\\pi<\\omega<-6\\pi$ misses the passband entirely. The copy on $-2\\pi<\\omega<6\\pi$ meets it on $-2\\pi<\\omega<-\\pi$. So$$Z(j\\omega)=\\begin{cases}\\tfrac12,&-2\\pi<\\omega<-\\pi\\\\0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Check.</b> Widths account for themselves at every stage. $X$ is $8\\pi$ wide; $Y$ is two copies of that width at half height, so its total area is unchanged; $Z$ keeps only a slice of width $\\pi$, one eighth of one copy. The filter passband is $4\\pi$ wide but only $\\pi$ of it holds any signal, which is why the output band is narrower than the filter.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-16,10],yr:[-0.12,0.75],xlabel:'\\omega/\\pi',ylabel:'Y(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:4,ystep:0.25});
      a.poly([[-16,0],[-14,0],[-14,0.5],[-6,0.5],[-6,0],[-2,0],[-2,0.5],[6,0.5],[6,0],[10,0]],{color:C.mid});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-8,4],yr:[-0.12,0.75],xlabel:'\\omega/\\pi',ylabel:'Z(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:0.25});
      a.poly([[-8,0],[-2,0],[-2,0.5],[-1,0.5],[-1,0],[4,0]],{color:C.out}); return a.svg();})()),
  err:'Assuming the two copies in part (b) are symmetric about the origin because a cosine was used. They are symmetric about $\\pm6\\pi$, not about zero, and since $X$ was one-sided to begin with, the result is one-sided about each carrier too.',
  teach:'Part (a) is the whole question. A student who cannot factor $1-e^{-j8\\pi t}$ into a shifted sine is stuck; one who can sees a rectangle immediately. Practise that factoring on its own before the chain is attempted.' },

{ id:'D5-26', module:'M5', type:'full', src:'MT2 Q4',
  stem:'Consider the signal $$x(t)=\\left(\\frac{\\sin(3t)}{\\pi t}\\right)^{2}\\left(1+e^{j12t}\\right),$$which is input to an LTI system with the impulse response $h(t)=\\dfrac{\\sin(5t)}{\\pi t}e^{j5t}$. At the output of the LTI system, the $y(t)$ signal is observed.',
  parts:['Plot the Fourier transform of $x(t)$.',
         'Plot the Fourier transform of $h(t)$.',
         'Plot the Fourier transform of $y(t)$.'],
  sol:'<b>Given.</b> A squared sinc, duplicated by a complex exponential, into a one-sided band-pass filter.<br>'
     +'<b>Find.</b> The three spectra.<br>'
     +'<b>Method.</b> Square first: a squared sinc is a triangle in frequency. Then the factor $\\left(1+e^{j12t}\\right)$ adds a shifted copy, and the filter keeps a window of it.<br>'
     +'<b>Solution — part (a).</b> The sinc $g(t)=\\dfrac{\\sin(3t)}{\\pi t}$ has $G=1$ on $|\\omega|<3$. Squaring in time convolves in frequency with a factor $\\tfrac{1}{2\\pi}$:$$T(\\omega)=\\frac{1}{2\\pi}(G*G)(\\omega),$$a triangle on $|\\omega|<6$ with peak $\\dfrac{6}{2\\pi}=\\dfrac{3}{\\pi}$. The factor $\\left(1+e^{j12t}\\right)$ then gives$$X(j\\omega)=T(\\omega)+T(\\omega-12),$$two triangles, the first on $|\\omega|<6$ and the second on $6<\\omega<18$, meeting at $\\omega=6$ where both are zero.<br>'
     +'<b>Solution — part (b).</b> The sinc of bandwidth $5$ shifted by $+5$:$$H(j\\omega)=\\begin{cases}1,&0<\\omega<10\\\\0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Solution — part (c).</b> Multiplying keeps the part of $X$ inside $0<\\omega<10$:$$Y(j\\omega)=\\begin{cases}\\dfrac{3}{\\pi}\\left(1-\\dfrac{\\omega}{6}\\right),&0<\\omega<6\\\\[4pt]\\dfrac{3}{\\pi}\\left(1-\\dfrac{12-\\omega}{6}\\right),&6<\\omega<10\\\\[4pt]0,&\\text{otherwise,}\\end{cases}$$the falling half of the first triangle followed by the rising part of the second, cut off at $\\omega=10$ where it has reached $\\dfrac{2}{\\pi}$.<br>'
     +'<b>Check.</b> The two pieces meet continuously at $\\omega=6$, where both give zero. The peak of $T$ is right: a triangle of base $12$ and peak $\\tfrac{3}{\\pi}$ has area $\\tfrac12\\cdot12\\cdot\\tfrac{3}{\\pi}=\\tfrac{18}{\\pi}$, and that must equal $2\\pi g^{2}(0)$ by the inverse transform at $t=0$ — with $g(0)=\\tfrac{3}{\\pi}$ this is $2\\pi\\cdot\\tfrac{9}{\\pi^{2}}=\\tfrac{18}{\\pi}$, as required.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-9,21],yr:[-0.12,1.15],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:6,ystep:0.5});
      a.poly([[-9,0],[-6,0],[0,3/Math.PI],[6,0],[12,3/Math.PI],[18,0],[21,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3,13],yr:[-0.12,1.15],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:0.5});
      a.poly([[-3,0],[0,0],[0,3/Math.PI],[6,0],[10,2/Math.PI],[10,0],[13,0]],{color:C.out}); return a.svg();})()),
  err:'Treating $\\left(\\frac{\\sin(3t)}{\\pi t}\\right)^{2}$ as a rectangle of half the width, on the grounds that squaring narrows a function. Squaring in time widens the spectrum: the support goes from $|\\omega|<3$ to $|\\omega|<6$, because convolution adds supports.',
  teach:'Note that $X$ is not conjugate-symmetric, so $x(t)$ is complex, and the filter here is one-sided as a result. Ask what the answer would be with $\\cos(12t)$ in place of $e^{j12t}$: three triangles, symmetric, and a real signal.' },

{ id:'D5-27', module:'M5', type:'full', src:'Final Q2',
  stem:'Consider the three signals plotted below, where $x_1(t)$ is periodic and its plot shows the areas under its impulses, while $x_2(t)$ and $x_3(t)$ are aperiodic.',
  parts:['Determine the Fourier transform of $x_1(t)$.',
         'Determine the Fourier transform of $x_2(t)$.',
         'Determine the Fourier transform of $x_3(t)$. <em>Hint: consider building it from rectangles.</em>'],
  figure:()=>
    (()=>{const a=P.Axes({w:1080,h:210,xr:[-7.2,7.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_1(t)',
      pad:{l:52,r:28,t:26,b:36},xstep:3,ystep:1});
      for(let k=-2;k<=2;k++) a.impulse(3*k,2,{color:C.in});
      return a.svg();})()
    +(()=>{const a=P.Axes({w:1080,h:210,xr:[-3.4,3.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_2(t)',
      pad:{l:52,r:28,t:26,b:36},xstep:1,ystep:1});
      a.poly([[-3.4,0],[-2,0],[0,2],[2,0],[3.4,0]],{color:C.in}); return a.svg();})()
    +(()=>{const a=P.Axes({w:1080,h:210,xr:[-4.4,4.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',
      pad:{l:52,r:28,t:26,b:36},xstep:1,ystep:1});
      a.poly([[-4.4,0],[-3,0],[-1,2],[1,2],[3,0],[4.4,0]],{color:C.in}); return a.svg();})(),
  sol:'<b>Given.</b> An impulse train of period $3$ and weight $2$, a triangle, and a trapezoid.<br>'
     +'<b>Find.</b> Three transforms.<br>'
     +'<b>Method.</b> An impulse train transforms to an impulse train. A triangle is a rectangle convolved with itself; a trapezoid is a convolution of two rectangles of different widths.<br>'
     +'<b>Solution — part (a).</b> A train of unit impulses with period $T$ has transform $\\dfrac{2\\pi}{T}\\sum_k\\delta\\!\\left(\\omega-\\dfrac{2\\pi k}{T}\\right)$. Here $T=3$ and each impulse carries weight $2$, so$$X_1(j\\omega)=\\frac{4\\pi}{3}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{3}\\right).$$'
     +'<b>Solution — part (b).</b> A triangle of height $A$ on $|t|<T$ is a rectangle convolved with itself, and$$X_2(j\\omega)=A\\,T\\left(\\frac{\\sin(\\omega T/2)}{\\omega T/2}\\right)^{2}=4\\left(\\frac{\\sin\\omega}{\\omega}\\right)^{2},$$taking $A=2$ and $T=2$. It is non-negative everywhere, as the transform of a self-convolution must be.<br>'
     +'<b>Solution — part (c).</b> A trapezoid flat on $|t|\\le1$ and vanishing at $|t|=3$ is the convolution of a rectangle of half-width $2$ with one of half-width $1$: the total half-width is $2+1=3$ and the flat top has half-width $2-1=1$, both as required. Choosing unit heights makes the peak $2\\cdot\\min(2,1)=2$, which matches. So$$X_3(j\\omega)=\\frac{2\\sin(2\\omega)}{\\omega}\\cdot\\frac{2\\sin\\omega}{\\omega}=\\frac{4\\sin(2\\omega)\\sin\\omega}{\\omega^{2}}.$$'
     +'<b>Check.</b> Each transform at $\\omega=0$ must be the area of its signal. For $x_2$: $\\tfrac12\\cdot4\\cdot2=4$, and $4\\left(\\tfrac{\\sin\\omega}{\\omega}\\right)^{2}\\to4$. For $x_3$: the flat part contributes $2\\cdot2=4$ and the two sloping ends $2\\cdot\\tfrac12\\cdot2\\cdot2=4$, total $8$; and $\\dfrac{4\\sin(2\\omega)\\sin\\omega}{\\omega^{2}}\\to4\\cdot2\\cdot1=8$. Both match.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-7,7],yr:[-0.5,4.6],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X_2(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:1});
      a.curve(w=>Math.abs(w)<1e-6?4:4*Math.pow(Math.sin(w)/w,2),{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-7,7],yr:[-2.2,8.6],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X_3(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:2});
      a.curve(w=>Math.abs(w)<1e-6?8:4*Math.sin(2*w)*Math.sin(w)/(w*w),{color:C.out}); return a.svg();})()),
  err:'Building the trapezoid from rectangles of half-widths $3$ and $1$, reading the two numbers straight off the plot. The half-widths add to give the total and subtract to give the flat top, so they are $2$ and $1$, not $3$ and $1$.',
  teach:'The three parts are three different reasons a transform is easy: a train because of the train pair, a triangle because it is a self-convolution, a trapezoid because it is a convolution of two unequal rectangles. Ask which of the three could also be done by direct integration, and how much longer it would take.' },

{ id:'D5-28', module:'M5', type:'full', src:'Final Q2',
  stem:'Let $x(t)=1+3\\cos(2\\pi t)$ be a periodic signal, and let $s(t)=x(t)c(t)$ where $c(t)=\\cos(10\\pi t)$.',
  parts:['Determine the Fourier transform of $x(t)$.',
         'Plot the Fourier transform of $s(t)$.',
         'State the smallest carrier frequency for which the shifted copies would not overlap, and say what happens below it.'],
  sol:'<b>Given.</b> A constant plus one cosine, multiplied by a higher-frequency carrier.<br>'
     +'<b>Find.</b> The spectrum before and after modulation, and the condition on the carrier.<br>'
     +'<b>Method.</b> A periodic signal transforms to impulses at its harmonics, of weight $2\\pi a_k$. Multiplying by a cosine makes two half-height copies at $\\pm\\omega_c$.<br>'
     +'<b>Solution — part (a).</b> The coefficients are $a_0=1$ and $a_{\\pm1}=\\tfrac32$ against $\\omega_0=2\\pi$, so$$X(j\\omega)=2\\pi\\delta(\\omega)+3\\pi\\left[\\delta(\\omega-2\\pi)+\\delta(\\omega+2\\pi)\\right].$$'
     +'<b>Solution — part (b).</b> With $\\omega_c=10\\pi$,$$S(j\\omega)=\\tfrac12X(j(\\omega-10\\pi))+\\tfrac12X(j(\\omega+10\\pi)),$$so$$S(j\\omega)=\\pi\\left[\\delta(\\omega-10\\pi)+\\delta(\\omega+10\\pi)\\right]+\\tfrac{3\\pi}{2}\\left[\\delta(\\omega-12\\pi)+\\delta(\\omega-8\\pi)+\\delta(\\omega+8\\pi)+\\delta(\\omega+12\\pi)\\right].$$Six impulses in all: a pair at the carrier and a pair of sidebands on each side of it.<br>'
     +'<b>Solution — part (c).</b> The spectrum of $x$ extends to $\\omega_M=2\\pi$, so a copy centred at $\\omega_c$ occupies $\\omega_c\\pm2\\pi$ and the copy centred at $-\\omega_c$ occupies $-\\omega_c\\pm2\\pi$. They stay apart as long as$$\\omega_c-2\\pi>-\\omega_c+2\\pi\\quad\\Longleftrightarrow\\quad\\omega_c>2\\pi.$$Below that the upper sideband of the negative copy crosses the lower sideband of the positive one, the two add, and the original cannot be recovered by filtering — the components that overlap can no longer be told apart.<br>'
     +'<b>Check.</b> The total weight is preserved in the right way. Each impulse of $X$ has been halved and duplicated, so the sum of all weights in $S$ is the same as in $X$: $2\\pi+3\\pi+3\\pi=8\\pi$ before, and $\\pi+\\pi+4\\cdot\\tfrac{3\\pi}{2}=8\\pi$ after. With $\\omega_c=10\\pi$ the copies run over $8\\pi$ to $12\\pi$ and $-12\\pi$ to $-8\\pi$, comfortably clear of each other, consistent with part (c).',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-14,14],yr:[-1,6.2],xlabel:'\\omega/\\pi',ylabel:'S(j\\omega)',
      pad:{l:52,r:28,t:30,b:38},xstep:2,ystep:2});
    [[-12,1.5*Math.PI],[-10,Math.PI],[-8,1.5*Math.PI],[8,1.5*Math.PI],[10,Math.PI],[12,1.5*Math.PI]]
      .forEach(p=>a.impulse(p[0],p[1],{color:C.out}));
    return a.svg();},
  err:'Halving the carrier impulses but leaving the sidebands at full weight. Every impulse of $X$ is halved, because the whole spectrum is convolved with $\\tfrac12\\left[\\delta(\\omega-\\omega_c)+\\delta(\\omega+\\omega_c)\\right]$, not just the one at the origin.',
  teach:'Part (c) is the same inequality that governs sampling, met one module early. Ask a student to write $\\omega_c>\\omega_M$ here and $\\omega_s>2\\omega_M$ in Module 7, and to say why one carries a factor of two and the other does not.' },

{ id:'D5-29', module:'M5', type:'full', src:'MT2 Q3',
  stem:'Determine the Fourier transforms of the following signals.',
  parts:['$x(t)=e^{-3t}u(t-2)$.',
         '$x(t)=t\\,e^{-3t}u(t)$.',
         '$x(t)=\\left[u(t+2)-u(t-2)\\right]*\\left[u(t+2)-u(t-2)\\right]$, where $*$ is the convolution operator.'],
  sol:'<b>Given.</b> A delayed exponential, an exponential with a linear factor, and a rectangle convolved with itself.<br>'
     +'<b>Find.</b> Three transforms.<br>'
     +'<b>Method.</b> Each is a standard pair plus one property: a time shift, a differentiation in frequency, and the convolution rule.<br>'
     +'<b>Solution — part (a).</b> Integrate from the point where the step switches on:$$X(j\\omega)=\\int_{2}^{\\infty}e^{-3t}e^{-j\\omega t}\\,\\d t=\\frac{e^{-2(3+j\\omega)}}{3+j\\omega}.$$Equivalently, write $x(t)=e^{-6}g(t-2)$ with $g(t)=e^{-3t}u(t)$, and the shift contributes $e^{-j2\\omega}$ while the amplitude carries $e^{-6}$.<br>'
     +'<b>Solution — part (b).</b> Multiplication by $t$ is differentiation in frequency: if $g(t)=e^{-3t}u(t)$ has $G=\\dfrac{1}{3+j\\omega}$, then$$X(j\\omega)=j\\frac{\\d G}{\\d\\omega}=j\\cdot\\frac{-j}{(3+j\\omega)^{2}}=\\frac{1}{(3+j\\omega)^{2}}.$$'
     +'<b>Solution — part (c).</b> Convolution in time is multiplication in frequency. The rectangle of height $1$ on $|t|<2$ has transform $\\dfrac{2\\sin(2\\omega)}{\\omega}$, so$$X(j\\omega)=\\left(\\frac{2\\sin(2\\omega)}{\\omega}\\right)^{2}=\\frac{4\\sin^{2}(2\\omega)}{\\omega^{2}}.$$In the time domain this is a triangle of height $4$ on $|t|<4$.<br>'
     +'<b>Check.</b> Part (a) at $\\omega=0$ gives $\\dfrac{e^{-6}}{3}$, which is $\\int_2^{\\infty}e^{-3t}\\,\\d t$ exactly. Part (b) at $\\omega=0$ gives $\\tfrac19$, and $\\int_0^{\\infty}te^{-3t}\\,\\d t=\\tfrac1{9}$. Part (c) at $\\omega=0$ gives $16$, the area of a triangle of height $4$ and base $8$, $\\tfrac12\\cdot8\\cdot4=16$; it is also the product of the two rectangle areas, $4\\cdot4$, as the convolution rule requires.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-5,5],yr:[-1.5,17.5],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)\\;\\text{of part (c)}',
      pad:{l:64,r:28,t:30,b:38},xstep:1,ystep:4});
    a.curve(w=>Math.abs(w)<1e-6?16:4*Math.pow(Math.sin(2*w)/w,2),{color:C.out}); return a.svg();},
  err:'Writing the answer to (a) as $\\dfrac{e^{-j2\\omega}}{3+j\\omega}$, keeping the shift and dropping the amplitude. Delaying $e^{-3t}u(t)$ by two gives $e^{-3(t-2)}u(t-2)$, which is $e^{6}$ times the signal asked for, so the factor $e^{-6}$ has to appear somewhere.',
  teach:'Parts (a) and (b) both look like the same table entry and use different properties. Ask which property each needs before either is computed; naming them first is what stops the two from being confused.' },

{ id:'D5-30', module:'M5', type:'full', src:'MT2 Q4',
  stem:'Let $x(t)=\\dfrac{\\sin(4t)}{\\pi t}$, and let $y(t)=x(t)\\cos(6t)$.',
  parts:['Plot the Fourier transform of $x(t)$ and calculate its total energy.',
         'Plot the Fourier transform of $y(t)$.',
         'Calculate the total energy of $y(t)$ and compare it with that of $x(t)$.'],
  sol:'<b>Given.</b> An ideal low-pass signal and its modulated version.<br>'
     +'<b>Find.</b> Two spectra and two energies.<br>'
     +'<b>Method.</b> The sinc pair gives a rectangle. Parseval turns each energy into the area of a squared spectrum, which for rectangles is a multiplication.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\begin{cases}1,&|\\omega|<4\\\\0,&\\text{otherwise.}\\end{cases}$$By Parseval,$$E_x=\\frac{1}{2\\pi}\\int_{-4}^{4}1^{2}\\,\\d\\omega=\\frac{8}{2\\pi}=\\frac{4}{\\pi}\\approx1.273\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> Multiplying by $\\cos(6t)$ gives two half-height copies:$$Y(j\\omega)=\\tfrac12X(j(\\omega-6))+\\tfrac12X(j(\\omega+6)),$$so $Y=\\tfrac12$ on $2<\\omega<10$ and on $-10<\\omega<-2$, and zero elsewhere. The two bands do not overlap, because the carrier $6$ exceeds the bandwidth $4$.<br>'
     +'<b>Solution — part (c).</b>$$E_y=\\frac{1}{2\\pi}\\left[\\int_{2}^{10}\\tfrac14\\,\\d\\omega+\\int_{-10}^{-2}\\tfrac14\\,\\d\\omega\\right]=\\frac{1}{2\\pi}\\cdot\\frac{16}{4}=\\frac{2}{\\pi}\\approx0.637\\;\\text{J},$$exactly half of $E_x$.<br>'
     +'<b>Check.</b> The halving is what modulation by a cosine always does when the copies do not overlap: the amplitude is halved, so the squared magnitude is quartered, but there are two copies, giving $\\tfrac24=\\tfrac12$. It can be read in the time domain too:$$y^{2}(t)=x^{2}(t)\\cos^{2}(6t)=\\tfrac12x^{2}(t)\\left[1+\\cos(12t)\\right],$$and the fast term integrates to almost nothing against the slowly varying $x^{2}$, leaving half the energy. Had the carrier been below $4$ the copies would have overlapped and this argument would fail.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-7,7],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:2,ystep:0.5});
      a.poly([[-7,0],[-4,0],[-4,1],[4,1],[4,0],[7,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-13,13],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:56,r:26,t:28,b:38},xstep:4,ystep:0.5});
      a.poly([[-13,0],[-10,0],[-10,0.5],[-2,0.5],[-2,0],[2,0],[2,0.5],[10,0.5],[10,0],[13,0]],{color:C.out});
      return a.svg();})()),
  err:'Reporting $E_y=E_x$ on the grounds that modulation only moves the spectrum. It also halves its height, and energy depends on the square of the height, so half the energy is lost to the doubling of the bands.',
  teach:'Ask what happens when the carrier is $3$ instead of $6$. The copies overlap on $|\\omega|<1$, the energy is no longer exactly half, and the original can no longer be recovered — the same failure as aliasing, in the modulation setting.' }

]);

window.DRILLMAP_M5 = [

{ id:'m5-drill-map', module:'M5', nav:'Module 5 · question types',
  title:'Module 5 — what a question looks like', src:'pp. 42–63',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 5 question types Fourier transform duality Parseval inverse modulation taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Question types', src:'pp. 42–63'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on the continuous-time Fourier transform come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M5'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M5 = [

{ id:'m5-drill', module:'M5', nav:'Module 5 · practice questions',
  title:'Module 5 — practice questions', src:'pp. 42–63',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 5 practice Fourier transform duality Parseval partial fractions modulation communication chain',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Practice D5-01 … D5-30', src:'pp. 42–63'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. The cheapest check in this module is the area test, $X(0)=\\int x(t)\\,\\d t$, and it catches most factor errors. The sinc convention used throughout is the unnormalised one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M5'}
]}

];
})();
