/* ==========================================================================
   Exam drills — Modules 4 and 5.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;

/* ======================================================================
   MODULE 4 — Fourier Series
   ====================================================================== */

CONTENT.DRILLTYPES.M4 = [
  { k:'fs-coef', name:'Coefficients of a given periodic signal',
    asks:'A periodic signal is given as a formula or a plot. Find $a_k$ and plot the magnitude, and where asked the phase.',
    method:['Find $T_0$ first, then $\\omega_0=2\\pi/T_0$. Every index is counted against that $\\omega_0$.',
            'If the signal is already a sum of sinusoids, read the coefficients off Euler\'s formulas. Do not integrate.',
            'Otherwise use the analysis equation over any one full period.',
            'Check $a_{-k}=a_k^{*}$ for a real signal, and check $a_0$ against the mean by eye.'],
    go:'m4-fs-coef' },
  { k:'fs-power', name:'Average power over one period',
    asks:'Compute the average power of a periodic signal, in the time domain or from its coefficients.',
    method:['In time: $P=\\frac{1}{T_0}\\int_{T_0}|x(t)|^{2}\\,\\d t$ over any one period.',
            'From the coefficients, Parseval gives $P=\\sum_{k}|a_k|^{2}$.',
            'For a sum of sinusoids, a DC term of height $A_0$ contributes $A_0^{2}$ and a sinusoid of amplitude $A$ contributes $A^{2}/2$.',
            'Compute it both ways when you can. Agreement is the check.'],
    go:'m4-parseval' },
  { k:'fs-lti', name:'A periodic signal through an LTI system',
    asks:'A periodic input meets a system with a known impulse response. Find the frequency response and the output coefficients.',
    method:['Complex exponentials are eigenfunctions: $e^{jk\\omega_0t}$ comes out as $H(jk\\omega_0)e^{jk\\omega_0t}$.',
            'Compute $H$ once as a function, then evaluate it at each harmonic that is present.',
            'The output coefficients are $b_k=a_k\\,H(jk\\omega_0)$ — a multiplication, never a convolution.',
            'A harmonic where $H$ vanishes is absent from the output. Say so explicitly.'],
    go:'m4-lti-fs' },
  { k:'fs-dt', name:'The discrete-time series',
    asks:'A periodic sequence is given. Find its $N$ coefficients.',
    method:['Find $N$ first, then $\\omega_0=2\\pi/N$. There are exactly $N$ distinct coefficients.',
            'The analysis sum runs over one period only, and it is a finite sum.',
            'The coefficients themselves are periodic in $k$ with the same $N$.',
            'Check $a_0$ against the mean of one period.'],
    go:'m4-dtfs' },
  { k:'fs-op', name:'What an operation does to the coefficients',
    asks:'A signal is shifted, differentiated, differenced or multiplied by a harmonic. Give the new coefficients.',
    method:['Apply the operation inside the synthesis sum and read off what multiplies $e^{jk\\omega_0t}$.',
            'A delay $t_0$ multiplies $a_k$ by $e^{-jk\\omega_0t_0}$: magnitudes are untouched, phases tilt linearly.',
            'Differentiation multiplies $a_k$ by $jk\\omega_0$.',
            'Multiplication by $e^{jM\\omega_0t}$ shifts the index: $b_k=a_{k-M}$.'],
    go:'m4-fs-props' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D4-01', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'Let $$x(t)=6\\cos\\!\\left(\\tfrac{2\\pi}{8}t\\right)-4\\sin\\!\\left(\\tfrac{2\\pi}{12}t\\right).$$',
  parts:['Find the fundamental period $T_0$ and the fundamental frequency $\\omega_0$.',
         'Find the Fourier series coefficients $a_k$ and plot the magnitude and the phase of each.',
         'Find the average power in one period.'],
  sol:'<b>Given.</b> A sum of two sinusoids at $2\\pi/8$ and $2\\pi/12$ rad/s.<br>'
     +'<b>Find.</b> $T_0$, the coefficients, and the average power.<br>'
     +'<b>Method.</b> Find the common period first, because every harmonic index is counted against its $\\omega_0$. Then expand each sinusoid with Euler\'s formulas and read the coefficients off. No integration is needed when the signal is already a sum of exponentials.<br>'
     +'<b>Solution — part (a).</b> $T_1=8$ and $T_2=12$, so$$T_0=\\operatorname{lcm}(8,12)=24\\;\\text{s},\\qquad\\omega_0=\\frac{2\\pi}{24}=\\frac{\\pi}{12}\\;\\text{rad/s}.$$The first term sits at $\\tfrac{2\\pi}{8}=3\\omega_0$ and the second at $\\tfrac{2\\pi}{12}=2\\omega_0$: the third and second harmonics.<br>'
     +'<b>Solution — part (b).</b> Using $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$,$$6\\cos(3\\omega_0t)=3e^{j3\\omega_0t}+3e^{-j3\\omega_0t},$$$$-4\\sin(2\\omega_0t)=2j\\,e^{j2\\omega_0t}-2j\\,e^{-j2\\omega_0t}.$$Hence$$a_{3}=a_{-3}=3,\\qquad a_{2}=2j,\\qquad a_{-2}=-2j,$$and every other coefficient is zero. Magnitudes: $|a_{\\pm2}|=2$ and $|a_{\\pm3}|=3$. Phases: $\\angle a_{2}=\\tfrac{\\pi}{2}$, $\\angle a_{-2}=-\\tfrac{\\pi}{2}$, $\\angle a_{\\pm3}=0$.<br>'
     +'<b>Solution — part (c).</b> By Parseval,$$P=\\sum_{k}|a_k|^{2}=2(2)^{2}+2(3)^{2}=8+18=26\\;\\text{W}.$$'
     +'<b>Check.</b> The signal is real, and indeed $a_{-k}=a_k^{*}$ for every $k$: $\\overline{2j}=-2j$ and $\\bar3=3$. The power computed directly from the amplitudes agrees: a sinusoid of amplitude $A$ carries $A^{2}/2$, so $\\tfrac{6^{2}}{2}+\\tfrac{4^{2}}{2}=18+8=26$. There is no DC term, and $a_0=0$ as expected from the mean of a sum of sinusoids.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-0.5,4],xlabel:'k',ylabel:'|a_k|',
      pad:{l:50,r:26,t:32,b:34},xstep:1,ystep:1});
      a.stem([[-3,3],[-2,2],[2,2],[3,3]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-2.2,2.2],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',
      pad:{l:62,r:26,t:32,b:34},xstep:1,ystep:1});
      a.stem([[-3,0],[-2,-Math.PI/2],[2,Math.PI/2],[3,0]],{color:C.mid,showZero:true}); return a.svg();})()),
  err:'Taking $T_0=8\\cdot12=96$ and indexing the harmonics against $\\omega_0=2\\pi/96$. The product is a period, but not the fundamental one, and every index then comes out four times too large.',
  teach:'Ask for the harmonic numbers before the coefficients. A student who cannot say "second and third harmonic" will index the spectrum incorrectly no matter how well the algebra goes.' },

{ id:'D4-02', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'A periodic signal has $T_0=4$ and equals $1$ for $|t|<1$ and $0$ for $1<|t|<2$ inside one period.',
  parts:['Find $a_0$ by inspection.',
         'Find $a_k$ for $k\\neq0$ using the analysis equation.',
         'Plot $|a_k|$ for $-6\\le k\\le6$ and say which harmonics are absent.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-5.4,5.4],yr:[-0.25,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    const sq=t=>{const u=((t+2)%4+4)%4-2; return Math.abs(u)<1?1:0;};
    a.curve(sq,{color:C.in,n:2000}); return a.svg();},
  sol:'<b>Given.</b> A rectangular wave with $T_0=4$ and half-width $T_1=1$, so $\\omega_0=\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$.<br>'
     +'<b>Find.</b> The coefficients and the missing harmonics.<br>'
     +'<b>Method.</b> $a_0$ is the mean over one period, which is the duty cycle here. For $k\\neq0$ use$$a_k=\\frac{1}{T_0}\\int_{T_0}x(t)e^{-jk\\omega_0t}\\,\\d t,$$taking the period $-2\\le t\\le2$ so the integral runs over $-1\\le t\\le1$ only.<br>'
     +'<b>Solution — part (a).</b>$$a_0=\\frac{2T_1}{T_0}=\\frac{2}{4}=\\frac12.$$'
     +'<b>Solution — part (b).</b>$$a_k=\\frac14\\int_{-1}^{1}e^{-jk\\omega_0t}\\,\\d t=\\frac14\\cdot\\frac{e^{jk\\omega_0}-e^{-jk\\omega_0}}{jk\\omega_0}=\\frac{2\\sin(k\\omega_0)}{4k\\omega_0}=\\frac{\\sin(k\\pi/2)}{k\\pi}.$$'
     +'<b>Solution — part (c).</b> $\\sin(k\\pi/2)$ vanishes for every even $k$, so <b>all even harmonics are absent</b>. The odd ones give$$a_{\\pm1}=\\frac{1}{\\pi},\\quad a_{\\pm3}=-\\frac{1}{3\\pi},\\quad a_{\\pm5}=\\frac{1}{5\\pi},$$so $|a_k|=\\dfrac{1}{|k|\\pi}$ on the odd indices.<br>'
     +'<b>Check.</b> Every coefficient is real, which is required: the signal is even, so its coefficients must be real and even in $k$, and $a_{-k}=a_k$ holds. Letting $k\\to0$ in the formula gives $\\dfrac{\\sin(k\\pi/2)}{k\\pi}\\to\\dfrac12$, matching $a_0$ from part (a) — the general expression and the mean agree in the limit, as they must. The envelope is the unnormalised sinc, $\\dfrac{\\sin\\theta}{\\theta}$ with $\\theta=k\\omega_0T_1$, sampled at the harmonics.',
  figSol:()=>{const ak=k=>k===0?0.5:Math.sin(k*Math.PI/2)/(k*Math.PI);
    const a=P.Axes({w:1080,h:280,xr:[-6.8,6.8],yr:[-0.15,0.62],xlabel:'k',ylabel:'|a_k|',
      pad:{l:56,r:28,t:32,b:34},xstep:1,ystep:0.2});
    a.stem(disc(k=>Math.abs(ak(k)),-6,6),{color:C.in}); return a.svg();},
  err:'Writing $a_k=\\dfrac{\\sin(k\\pi/2)}{k\\pi/2}$ by cancelling incorrectly, which gives $a_{\\pm1}=2/\\pi$ and a value at $k\\to0$ of $1$ rather than $\\tfrac12$.',
  teach:'The limit check at $k\\to0$ costs one line and catches every factor-of-two slip in this derivation. Require it.' },

{ id:'D4-03', module:'M4', type:'fs-power', src:'MT2 Q1',
  stem:'For the rectangular wave of the previous question — period $T_0=4$, height $1$ on $|t|<1$, zero on $1<|t|<2$ — the coefficients are $a_0=\\tfrac12$ and $a_k=\\dfrac{\\sin(k\\pi/2)}{k\\pi}$.',
  parts:['Compute the average power in one period directly in the time domain.',
         'Confirm the same value from the coefficients using Parseval\'s relation.'],
  sol:'<b>Given.</b> The rectangular wave and its coefficients.<br>'
     +'<b>Find.</b> The average power, computed twice.<br>'
     +'<b>Method.</b> The time-domain average over one period, and Parseval\'s relation $P=\\sum_k|a_k|^{2}$.<br>'
     +'<b>Solution — part (a).</b> Over the period $-2\\le t\\le2$ the signal is $1$ on an interval of length $2$ and $0$ elsewhere, so$$P=\\frac{1}{T_0}\\int_{-2}^{2}|x(t)|^{2}\\,\\d t=\\frac14\\int_{-1}^{1}1\\,\\d t=\\frac{2}{4}=\\frac12\\;\\text{W}.$$'
     +'<b>Solution — part (b).</b> The even coefficients vanish, so$$\\sum_{k}|a_k|^{2}=\\frac14+2\\sum_{k\\ \\text{odd},\\,k\\ge1}\\frac{1}{k^{2}\\pi^{2}}=\\frac14+\\frac{2}{\\pi^{2}}\\cdot\\frac{\\pi^{2}}{8}=\\frac14+\\frac14=\\frac12,$$using the standard sum $\\displaystyle\\sum_{k\\ \\text{odd}}\\frac{1}{k^{2}}=\\frac{\\pi^{2}}{8}$.<br>'
     +'<b>Check.</b> The two routes agree at $\\tfrac12$ W. The split is also informative: the DC term alone carries $\\tfrac14$, that is half the total power, and all the harmonics together carry the other half. A duty cycle of one half is exactly the case in which those two are equal.',
  err:'Averaging over the support of the pulse rather than over one full period, which gives $1$ instead of $\\tfrac12$.',
  teach:'Parseval is worth running even when the time integral is trivial, because it is the only check available when the signal is given by its coefficients rather than by a plot.' },

{ id:'D4-04', module:'M4', type:'fs-power', src:'MT2 Q1',
  stem:'Let $$x(t)=5+3\\cos(\\omega_0t)-2\\sin(4\\omega_0t).$$',
  parts:['Find the Fourier series coefficients $a_k$.',
         'Find the average power in one period, from the coefficients and again from the amplitudes.'],
  sol:'<b>Given.</b> A DC term and two sinusoids at the first and fourth harmonics.<br>'
     +'<b>Find.</b> The coefficients and the average power.<br>'
     +'<b>Method.</b> Expand with Euler and read off. Then apply Parseval, and check against the amplitude rule.<br>'
     +'<b>Solution — part (a).</b>$$3\\cos(\\omega_0t)=\\tfrac32e^{j\\omega_0t}+\\tfrac32e^{-j\\omega_0t},$$$$-2\\sin(4\\omega_0t)=j\\,e^{j4\\omega_0t}-j\\,e^{-j4\\omega_0t}.$$Hence$$a_0=5,\\qquad a_{\\pm1}=\\tfrac32,\\qquad a_{4}=j,\\qquad a_{-4}=-j,$$and all other coefficients are zero.<br>'
     +'<b>Solution — part (b).</b> By Parseval,$$P=\\sum_k|a_k|^{2}=5^{2}+2\\left(\\tfrac32\\right)^{2}+2(1)^{2}=25+4.5+2=31.5\\;\\text{W}.$$From the amplitudes directly: a DC value $A_0$ carries $A_0^{2}$ and a sinusoid of amplitude $A$ carries $A^{2}/2$, giving$$5^{2}+\\frac{3^{2}}{2}+\\frac{2^{2}}{2}=25+4.5+2=31.5\\;\\text{W}.$$'
     +'<b>Check.</b> Conjugate symmetry holds: $\\bar{j}=-j$. The two power routes agree. Note the asymmetry between DC and a sinusoid: the DC term contributes its square, not half its square, because it occupies a single coefficient rather than a conjugate pair.',
  err:'Applying $A^{2}/2$ to the DC term as well, which gives $12.5+4.5+2=19$. A constant has no oscillation to average over.',
  teach:'The DC exception is the most common power error in this module. Ask for the coefficient list before the power, so the single term at $k=0$ is visible.' },

{ id:'D4-05', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'The periodic signal $x(t)=2+3\\cos(2t)$ is the input to an LTI system with impulse response $h(t)=e^{-t}u(t)$.',
  parts:['Find the frequency response $H(j\\omega)$.',
         'Find the Fourier series coefficients of the output $y(t)$.',
         'Write $y(t)$ as a real signal in amplitude-and-phase form.'],
  sol:'<b>Given.</b> A DC term plus one sinusoid at $2$ rad/s, into a first-order system.<br>'
     +'<b>Find.</b> $H$, the output coefficients, and $y(t)$.<br>'
     +'<b>Method.</b> Complex exponentials pass through an LTI system unchanged apart from a complex gain, so the output coefficients are $b_k=a_kH(jk\\omega_0)$. Compute $H$ once, then evaluate it at the harmonics present.<br>'
     +'<b>Solution — part (a).</b>$$H(j\\omega)=\\int_{0}^{\\infty}e^{-\\tau}e^{-j\\omega\\tau}\\,\\d\\tau=\\frac{1}{1+j\\omega}.$$'
     +'<b>Solution — part (b).</b> Here $\\omega_0=2$ and $a_0=2$, $a_{\\pm1}=\\tfrac32$. Evaluating,$$H(0)=1,\\qquad H(j2)=\\frac{1}{1+2j}=\\frac{1-2j}{5},$$so$$b_0=2,\\qquad b_1=\\frac32\\cdot\\frac{1}{1+2j},\\qquad b_{-1}=\\frac32\\cdot\\frac{1}{1-2j}=b_1^{*}.$$'
     +'<b>Solution — part (c).</b> $|H(j2)|=\\dfrac{1}{\\sqrt5}$ and $\\angle H(j2)=-\\arctan2\\approx-1.1071$ rad, so$$y(t)=2+\\frac{3}{\\sqrt5}\\cos\\bigl(2t-\\arctan2\\bigr)\\approx2+1.342\\cos(2t-1.107).$$'
     +'<b>Check.</b> The DC gain is $H(0)=\\int h=1$, so the constant passes unchanged — and it does. The system is a low-pass, so the harmonic at $2$ rad/s must be attenuated, and $1/\\sqrt5\\approx0.447<1$ confirms it. The phase is negative, which is the delay a causal system imposes. Conjugate symmetry of the output coefficients is preserved, as it must be for a real $h$ and a real $x$.',
  err:'Convolving the coefficients with $H$. The eigenfunction property makes this a multiplication, harmonic by harmonic; convolution belongs to the time domain.',
  teach:'Ask for $H(0)$ and for $\\int h\\,\\d t$ separately, then compare them. Students who see that they are the same number stop treating $H$ as an unrelated formula.' },

{ id:'D4-06', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'The periodic sequence $$x[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-4k]$$is the input to a discrete-time LTI system with impulse response $h[n]=\\delta[n]-\\delta[n-2]$.',
  parts:['Find the Fourier series coefficients $a_k$ of $x[n]$.',
         'Find the frequency response $H(e^{j\\omega})$ and plot its magnitude spectrum.',
         'Find the Fourier series coefficients of the output $y[n]$.'],
  sol:'<b>Given.</b> An impulse train of period $N=4$ into a two-sample difference.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response, and the output coefficients.<br>'
     +'<b>Method.</b> Use the discrete-time analysis sum over one period, then the eigenfunction property $b_k=a_kH(e^{jk\\omega_0})$ with $\\omega_0=2\\pi/N$.<br>'
     +'<b>Solution — part (a).</b> Over one period $0\\le n\\le3$ only $x[0]=1$ is non-zero, so$$a_k=\\frac14\\sum_{n=0}^{3}x[n]e^{-jk(2\\pi/4)n}=\\frac14\\qquad\\text{for every }k.$$An impulse train has a flat spectrum.<br>'
     +'<b>Solution — part (b).</b> $h[0]=1$ and $h[2]=-1$, so$$H(e^{j\\omega})=1-e^{-j2\\omega},\\qquad|H(e^{j\\omega})|=2\\left|\\sin\\omega\\right|.$$At the four harmonics $\\omega=k\\pi/2$:$$H(1)=0,\\quad H(e^{j\\pi/2})=2,\\quad H(e^{j\\pi})=0,\\quad H(e^{j3\\pi/2})=2.$$'
     +'<b>Solution — part (c).</b>$$b_0=0,\\qquad b_1=\\tfrac12,\\qquad b_2=0,\\qquad b_3=\\tfrac12.$$The DC term and the second harmonic are both absent from the output, because $H$ vanishes at $\\omega=0$ and at $\\omega=\\pi$.<br>'
     +'<b>Check.</b> Compute $y[n]$ directly: $y[n]=x[n]-x[n-2]$ places $+1$ at $n=4k$ and $-1$ at $n=4k+2$, so one period is $\\{1,0,-1,0\\}$. Its analysis sum is $b_k=\\tfrac14\\left(1-e^{-jk\\pi}\\right)=\\tfrac14\\left(1-(-1)^{k}\\right)$, which returns $0$, $\\tfrac12$, $0$ and $\\tfrac12$ for $k=0,1,2,3$ — the same four numbers. That $b_0=0$ is forced: a difference removes the mean.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-3.4,3.4],yr:[-0.2,2.4],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',
      pad:{l:62,r:28,t:34,b:40},xstep:1,ystep:0.5});
    a.curve(w=>2*Math.abs(Math.sin(w)),{color:C.h});
    /* the guides mark the four harmonics; the zero at omega = pi is where the
       curve meets the axis, and the caption says so — an annotation there would
       have to sit on the curve */
    [-Math.PI,-Math.PI/2,0,Math.PI/2,Math.PI].forEach(w=>a.vline(w,{color:C.muted,opacity:.45}));
    return a.svg();},
  err:'Reporting four different values for $a_k$ by evaluating the analysis sum as though several samples in the period were non-zero. Only one sample of an impulse train falls in each period.',
  teach:'The vanishing harmonic in part (c) is the point of the question. Ask what inputs this system annihilates entirely — a constant, and the alternating sequence at $\\omega=\\pi$ — and the answer becomes concrete.' },

{ id:'D4-07', module:'M4', type:'fs-dt', src:'MT2 Q2',
  stem:'Let $$x[n]=1+\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right).$$',
  parts:['Find the fundamental period $N$.',
         'Find the four coefficients $a_0,a_1,a_2,a_3$ by inspection, and confirm one of them with the analysis sum.'],
  sol:'<b>Given.</b> A constant plus a discrete-time cosine.<br>'
     +'<b>Find.</b> The period and the four coefficients.<br>'
     +'<b>Method.</b> Test periodicity, then expand with Euler and match against $e^{jk\\omega_0n}$ with $\\omega_0=2\\pi/N$.<br>'
     +'<b>Solution — part (a).</b> $\\omega=\\tfrac{\\pi}{2}$ gives $\\dfrac{\\omega}{2\\pi}=\\dfrac14$, rational, so $N=4$ and $\\omega_0=\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$. The cosine is therefore the <em>first</em> harmonic.<br>'
     +'<b>Solution — part (b).</b>$$x[n]=1+\\tfrac12e^{j\\omega_0n}+\\tfrac12e^{-j\\omega_0n},$$and since $e^{-j\\omega_0n}=e^{j3\\omega_0n}$ for $N=4$,$$a_0=1,\\qquad a_1=\\tfrac12,\\qquad a_2=0,\\qquad a_3=\\tfrac12.$$Confirming $a_1$ with the analysis sum, using $x[0]=2$, $x[1]=1$, $x[2]=0$, $x[3]=1$:$$a_1=\\frac14\\sum_{n=0}^{3}x[n]e^{-j\\pi n/2}=\\frac14\\left(2-j+0+j\\right)=\\frac12.$$'
     +'<b>Check.</b> $a_0$ must equal the mean of one period: $\\tfrac14(2+1+0+1)=1$, which it does. There are exactly $N=4$ distinct coefficients, and they repeat with period $4$ in $k$ — which is why $a_{-1}$ and $a_3$ are the same number rather than two separate results.',
  err:'Reporting an infinite list of coefficients as in continuous time. A discrete-time series has exactly $N$ of them, and $a_{k+N}=a_k$.',
  teach:'The identification $a_{-1}=a_3$ is the structural point. Ask for it explicitly, because it is the property that makes the discrete series a finite object.' },

{ id:'D4-08', module:'M4', type:'fs-dt', src:'MT2 Q2',
  stem:'A periodic sequence has $N=6$ and equals $1,1,1,0,0,0$ over one period $0\\le n\\le5$.',
  parts:['Find $a_k$ for $k=0,1,2,3$.',
         'Find the average power in one period, in the time domain and again from the coefficients.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-6.6,8.6],yr:[-0.3,1.4],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:2,ystep:0.5});
    a.stem(disc(n=>(((n%6)+6)%6)<3?1:0,-6,8),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A discrete rectangular wave, three ones and three zeros, $N=6$, $\\omega_0=\\tfrac{2\\pi}{6}=\\tfrac{\\pi}{3}$.<br>'
     +'<b>Find.</b> Four coefficients and the average power, twice.<br>'
     +'<b>Method.</b> The analysis sum runs over one period, and only $n=0,1,2$ contribute.<br>'
     +'<b>Solution — part (a).</b>$$a_k=\\frac16\\sum_{n=0}^{2}e^{-jk\\pi n/3}.$$Evaluating term by term,$$a_0=\\tfrac36=\\tfrac12,$$$$a_1=\\tfrac16\\left(1+e^{-j\\pi/3}+e^{-j2\\pi/3}\\right)=\\tfrac16\\left(1-j\\sqrt3\\right),\\qquad|a_1|=\\tfrac13,$$$$a_2=\\tfrac16\\left(1+e^{-j2\\pi/3}+e^{-j4\\pi/3}\\right)=0,$$$$a_3=\\tfrac16\\left(1+e^{-j\\pi}+e^{-j2\\pi}\\right)=\\tfrac16.$$'
     +'<b>Solution — part (b).</b> In time,$$P=\\frac16\\sum_{n=0}^{5}|x[n]|^{2}=\\frac36=\\frac12.$$From the coefficients, using $|a_4|=|a_2|=0$ and $|a_5|=|a_1|=\\tfrac13$,$$\\sum_{k=0}^{5}|a_k|^{2}=\\frac14+\\frac19+0+\\frac1{36}+0+\\frac19=\\frac{9+4+1+4}{36}=\\frac{18}{36}=\\frac12.$$'
     +'<b>Check.</b> The two routes agree. $a_0=\\tfrac12$ is the mean of one period, and the duty cycle is indeed one half. The vanishing $a_2$ is the discrete counterpart of the missing harmonics in the continuous rectangular wave: the three phasors $1$, $e^{-j2\\pi/3}$, $e^{-j4\\pi/3}$ are the three cube roots of unity and sum to zero.',
  err:'Summing over all six samples including the zeros and dividing by three. The normalising factor is $1/N$ with $N=6$, whatever fraction of the period is non-zero.',
  teach:'The cube-roots-of-unity argument for $a_2=0$ generalises. Ask which coefficients of a length-$M$ run inside a period $N$ vanish, and the answer is the multiples of $N/M$ when that ratio is an integer.' },

{ id:'D4-09', module:'M4', type:'fs-op', src:'MT2 Q2',
  stem:'A real periodic signal $x(t)$ with fundamental frequency $\\omega_0$ has Fourier series coefficients $a_k$.',
  parts:['Give the coefficients of $z(t)=x(t-t_0)$ and say what happens to the magnitude spectrum.',
         'Give the coefficients of $w(t)=\\dfrac{\\d x(t)}{\\d t}$.',
         'Give the coefficients of $v(t)=x(t)e^{jM\\omega_0t}$ for an integer $M$.'],
  sol:'<b>Given.</b> A periodic signal through its synthesis equation$$x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}.$$'
     +'<b>Find.</b> The coefficients after a delay, a derivative, and a multiplication by a harmonic.<br>'
     +'<b>Method.</b> Apply each operation inside the sum and read off whatever multiplies $e^{jk\\omega_0t}$.<br>'
     +'<b>Solution — part (a).</b>$$z(t)=\\sum_k a_ke^{jk\\omega_0(t-t_0)}=\\sum_k\\left(a_ke^{-jk\\omega_0t_0}\\right)e^{jk\\omega_0t},$$so $b_k=a_ke^{-jk\\omega_0t_0}$. Since $\\left|e^{-jk\\omega_0t_0}\\right|=1$, the <b>magnitude spectrum is unchanged</b>; only the phase changes, by $-k\\omega_0t_0$, which is linear in $k$.<br>'
     +'<b>Solution — part (b).</b> Differentiating term by term,$$w(t)=\\sum_k a_k\\,jk\\omega_0\\,e^{jk\\omega_0t},$$so $b_k=jk\\omega_0a_k$. The DC term is annihilated, and high harmonics are amplified in proportion to $k$.<br>'
     +'<b>Solution — part (c).</b>$$v(t)=\\sum_k a_ke^{j(k+M)\\omega_0t}=\\sum_m a_{m-M}e^{jm\\omega_0t},$$so $b_k=a_{k-M}$: the whole spectrum slides $M$ places up.<br>'
     +'<b>Check.</b> Part (a) is consistent with energy: a delay cannot change the average power, and Parseval agrees because $\\sum|a_k|^{2}$ is untouched. In part (b), $b_0=0$ reflects the fact that a derivative has zero mean over a period. In part (c) the result is generally complex even for a real $x$, which is correct: multiplying by $e^{jM\\omega_0t}$ destroys the conjugate symmetry and the output is not a real signal.',
  err:'Reporting that a delay changes the magnitude spectrum. It does not, and this is the reason a magnitude plot alone cannot tell two delayed versions of a signal apart.',
  teach:'Part (c) is worth pressing on: ask whether $v(t)$ is real. The answer, no, is what distinguishes multiplication by a complex exponential from multiplication by a cosine.' },

{ id:'D4-10', module:'M4', type:'fs-op', src:'MT2 Q2',
  stem:'Let $x[n]$ be periodic with $N=4$ and coefficients $a_0=1$, $a_1=\\tfrac12$, $a_2=0$, $a_3=\\tfrac12$. Define $$y[n]=x[n]-x[n-1].$$',
  parts:['Give a general formula for the coefficients $b_k$ of $y[n]$.',
         'Evaluate $b_0,b_1,b_2,b_3$.',
         'Confirm $b_1$ by computing $y[n]$ directly and applying the analysis sum.'],
  sol:'<b>Given.</b> A first difference applied to a sequence of period $4$, so $\\omega_0=\\tfrac{\\pi}{2}$.<br>'
     +'<b>Find.</b> The new coefficients.<br>'
     +'<b>Method.</b> A delay of one sample multiplies $a_k$ by $e^{-jk\\omega_0}$, and the series is linear, so the difference multiplies $a_k$ by $\\left(1-e^{-jk\\omega_0}\\right)$.<br>'
     +'<b>Solution — part (a).</b>$$b_k=a_k\\left(1-e^{-jk\\omega_0}\\right)=a_k\\left(1-e^{-jk\\pi/2}\\right).$$'
     +'<b>Solution — part (b).</b>$$b_0=1(1-1)=0,\\qquad b_1=\\tfrac12(1+j),\\qquad b_2=0,\\qquad b_3=\\tfrac12(1-j),$$using $e^{-j\\pi/2}=-j$ and $e^{-j3\\pi/2}=j$.<br>'
     +'<b>Solution — part (c).</b> The given coefficients synthesise $x[n]=1+\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$, whose period is $2,1,0,1$. Then$$y[0]=2-1=1,\\quad y[1]=1-2=-1,\\quad y[2]=0-1=-1,\\quad y[3]=1-0=1,$$and$$b_1=\\frac14\\sum_{n=0}^{3}y[n]e^{-j\\pi n/2}=\\frac14\\bigl(1+j+1+j\\bigr)=\\frac{1+j}{2},$$which matches part (b).<br>'
     +'<b>Check.</b> $b_0=0$ is forced: a first difference removes the mean, and the mean of $y$ over one period is indeed $\\tfrac14(1-1-1+1)=0$. Conjugate symmetry survives, $b_3=b_1^{*}$, as it must for a real sequence.',
  err:'Using $b_k=a_k\\left(1-e^{-j\\omega}\\right)$ with $\\omega$ left as a free variable instead of evaluated at the harmonic $k\\omega_0$. The series lives on the harmonics only.',
  teach:'This is the discrete counterpart of differentiation. Ask which harmonic the first difference suppresses most — the DC one — and which it emphasises, and the high-pass character becomes visible without any plot.' },

{ id:'D4-11', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'A periodic signal has $T_0=2$ and equals $x(t)=t$ on $-1<t<1$ inside one period.',
  parts:['Find $a_0$ without integrating.',
         'Find $a_k$ for $k\\neq0$.',
         'State $|a_k|$ and explain why every coefficient is purely imaginary.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.4,3.4],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    const saw=t=>{let u=((t+1)%2+2)%2-1; return u;};
    a.curve(saw,{color:C.in,n:2400}); return a.svg();},
  sol:'<b>Given.</b> A sawtooth of period $2$, so $\\omega_0=\\pi$.<br>'
     +'<b>Find.</b> The coefficients.<br>'
     +'<b>Method.</b> Use the symmetry to settle $a_0$, then integrate by parts over one period.<br>'
     +'<b>Solution — part (a).</b> The signal is odd about the origin over a symmetric period, so its mean is zero: $a_0=0$.<br>'
     +'<b>Solution — part (b).</b>$$a_k=\\frac12\\int_{-1}^{1}t\\,e^{-jk\\pi t}\\,\\d t.$$Split the exponential: $t\\cos(k\\pi t)$ is odd and integrates to zero, while $t\\sin(k\\pi t)$ is even. Hence$$a_k=\\frac12\\left(-2j\\int_{0}^{1}t\\sin(k\\pi t)\\,\\d t\\right)=-j\\left[\\frac{\\sin(k\\pi)}{(k\\pi)^{2}}-\\frac{\\cos(k\\pi)}{k\\pi}\\right]=\\frac{j(-1)^{k}}{k\\pi}.$$'
     +'<b>Solution — part (c).</b> $|a_k|=\\dfrac{1}{|k|\\pi}$, so the spectrum decays as $1/|k|$. Every coefficient is purely imaginary because the signal is <b>odd</b>: for a real odd signal the analysis integral keeps only the $-j\\sin$ half of the exponential.<br>'
     +'<b>Check.</b> Conjugate symmetry: $a_{-k}=\\dfrac{j(-1)^{-k}}{-k\\pi}=-\\dfrac{j(-1)^{k}}{k\\pi}=a_k^{*}$, as required for a real signal. The $1/|k|$ decay is the signature of a jump discontinuity, and the sawtooth does jump by $2$ at every odd multiple of $1$. Compare with the rectangular wave, which also jumps and also decays as $1/|k|$.',
  err:'Integrating over $0<t<2$ while still using the formula $x(t)=t$, which is only valid on $-1<t<1$. Any period may be used, but the formula must be the one that holds on it.',
  teach:'The link between a jump and a $1/|k|$ envelope is worth stating once here. It predicts the decay rate of every remaining example in the module.' },

{ id:'D4-12', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'The rectangular wave with $T_0=4$, height $1$ on $|t|<1$ and zero on $1<|t|<2$, whose coefficients are $a_0=\\tfrac12$ and $a_k=\\dfrac{\\sin(k\\pi/2)}{k\\pi}$, is applied to an LTI system with $h(t)=e^{-t}u(t)$.',
  parts:['Give the output coefficients $b_k$.',
         'Evaluate $b_0$ and $|b_1|$ numerically.',
         'Say in one sentence what the system does to the shape of the wave, and why.'],
  sol:'<b>Given.</b> A rectangular wave with $\\omega_0=\\tfrac{\\pi}{2}$ into a first-order low-pass.<br>'
     +'<b>Find.</b> The output coefficients and the qualitative effect.<br>'
     +'<b>Method.</b> $H(j\\omega)=\\dfrac{1}{1+j\\omega}$, and the eigenfunction property gives $b_k=a_kH(jk\\omega_0)$.<br>'
     +'<b>Solution — part (a).</b>$$b_k=\\frac{\\sin(k\\pi/2)}{k\\pi}\\cdot\\frac{1}{1+jk\\pi/2},\\qquad k\\neq0,$$and $b_0=a_0H(0)=\\tfrac12$.<br>'
     +'<b>Solution — part (b).</b> $b_0=\\tfrac12$. For $k=1$,$$|b_1|=\\frac{1/\\pi}{\\sqrt{1+\\pi^{2}/4}}=\\frac{0.3183}{1.8621}\\approx0.1709,$$compared with $|a_1|=1/\\pi\\approx0.3183$: the fundamental is attenuated to about $54\\%$ of its input value.<br>'
     +'<b>Solution — part (c).</b> The system attenuates each harmonic by $\\left|1+jk\\omega_0\\right|^{-1}$, which falls as $1/|k|$ for large $k$, so the sharp edges of the wave — carried by its high harmonics — are rounded, while the DC level passes untouched.<br>'
     +'<b>Check.</b> $H(0)=1$, so the mean of the output equals the mean of the input, which is what a passive first-order low-pass must do at DC. The output magnitudes now decay as $1/k^{2}$ rather than $1/|k|$, and a $1/k^{2}$ envelope is the signature of a signal that is continuous with a jump only in its slope — exactly the rounded shape described in part (c).',
  err:'Applying $H$ to the time-domain signal instead of to the coefficients, for instance by writing $y(t)=x(t)/(1+j\\omega)$. The frequency response multiplies harmonics, not signals.',
  teach:'The decay-rate argument in the Check step is the payoff. It converts a plot-level observation, the corners are rounded, into a statement about the spectrum that can be verified without drawing anything.' },

]);

window.DRILL_M4 = [

{ id:'m4-drill-map', module:'M4', nav:'Module 4 exam drill · question types',
  title:'Module 4 — what a question looks like', src:'pp. 22–41',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'exam drill module 4 question types Fourier series coefficients power spectrum taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Exam drill', src:'pp. 22–41'},
  {t:'title', text:'Five shapes, and the method each one wants'},
  {t:'lede', text:'Questions on Fourier series come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M4'}
]},

{ id:'m4-drill', module:'M4', nav:'Module 4 exam drill · questions',
  title:'Module 4 — exam drill', src:'pp. 22–41',
  objective:'Twelve open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 4 questions practice Fourier series coefficients Parseval frequency response',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Exam drill D4-01 … D4-12', src:'pp. 22–41'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Three cheap checks run through this module: $a_0$ must equal the mean of one period, a real signal must satisfy $a_{-k}=a_k^{*}$, and the average power computed from the coefficients must match the power computed in time.'},
  {t:'rule', short:true},
  {t:'drill', module:'M4'}
]}

];

/* ======================================================================
   MODULE 5 — Continuous-Time Fourier Transform
   ====================================================================== */

CONTENT.DRILLTYPES.M5 = [
  { k:'ft-basic', name:'Transform of a standard signal',
    asks:'A signal is given in closed form. Compute $X(j\\omega)$ from the analysis equation.',
    method:['Write the analysis integral and cut it down to the support of the signal.',
            'A one-sided exponential integrates directly. A rectangular pulse gives a sinc.',
            'State the convergence condition wherever the integral needs one.',
            'Check $X(0)=\\int x(t)\\,\\d t$, the total area, as a free test.'],
    go:'m5-ctft-def' },
  { k:'ft-dual', name:'Duality',
    asks:'A signal has the shape of a known transform. Use duality instead of integrating again.',
    method:['If $x(t)\\leftrightarrow X(j\\omega)$, then $X(t)\\leftrightarrow2\\pi\\,x(-\\omega)$.',
            'Identify which known pair your signal is the frequency half of.',
            'Swap the variables carefully, and do not lose the factor $2\\pi$.',
            'Check the result at $\\omega=0$ against the area of the given signal.'],
    go:'m5-duality' },
  { k:'ft-parseval', name:'Total energy',
    asks:'Compute the energy of a signal, in time or in frequency.',
    method:['Parseval: $\\int|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int|X(j\\omega)|^{2}\\,\\d\\omega$.',
            'Choose whichever side is the easier integral. That choice is the whole skill.',
            'Do not forget the $1/2\\pi$ on the frequency side.',
            'Both sides are real and non-negative. A complex answer means an algebra error.'],
    go:'m5-parseval' },
  { k:'ft-inv', name:'Inverse transform by partial fractions',
    asks:'A rational $X(j\\omega)$ is given. Recover $x(t)$.',
    method:['Treat $j\\omega$ as a single symbol and factor the denominator in it.',
            'Split into first-order terms with undetermined coefficients.',
            'Invert each term with the standard pair $\\frac{1}{a+j\\omega}\\leftrightarrow e^{-at}u(t)$, valid for $a>0$.',
            'Check by evaluating $X(0)$ against $\\int x(t)\\,\\d t$.'],
    go:'m5-inverse' },
  { k:'ft-mod', name:'Multiplication in time',
    asks:'Two signals are multiplied, or a signal is modulated by a carrier. Find the spectrum of the product.',
    method:['Multiplication in time is convolution in frequency, with a factor $1/2\\pi$.',
            'For a cosine carrier the convolution is just two shifted half-height copies.',
            'Draw the shifted copies and check whether they overlap. Overlap is where information is lost.',
            'A cascade is done one stage at a time, never all at once.'],
    go:'m5-modulation' },
  { k:'ft-per', name:'Transform of a periodic signal',
    asks:'A periodic signal or an impulse train is given. Find its transform.',
    method:['A periodic signal has a line spectrum: $X(j\\omega)=2\\pi\\sum_k a_k\\,\\delta(\\omega-k\\omega_0)$.',
            'Find the Fourier series coefficients first, then place an impulse of weight $2\\pi a_k$ at each harmonic.',
            'An impulse train of spacing $T$ transforms into an impulse train of spacing $2\\pi/T$.',
            'Check that a denser train in time gives a sparser one in frequency.'],
    go:'m5-periodic-ft' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D5-01', module:'M5', type:'ft-basic', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=e^{-a|t|},\\qquad a>0.$$',
  parts:['Compute $X(j\\omega)$.',
         'Evaluate it for $a=2$ and sketch the result.',
         'State why $X(j\\omega)$ is real and even.'],
  sol:'<b>Given.</b> A two-sided decaying exponential.<br>'
     +'<b>Find.</b> Its transform.<br>'
     +'<b>Method.</b> Split the analysis integral at the origin, because $|t|$ means two different formulas.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{-\\infty}^{0}e^{at}e^{-j\\omega t}\\,\\d t+\\int_{0}^{\\infty}e^{-at}e^{-j\\omega t}\\,\\d t=\\frac{1}{a-j\\omega}+\\frac{1}{a+j\\omega}=\\frac{2a}{a^{2}+\\omega^{2}}.$$Both integrals converge because $a>0$.<br>'
     +'<b>Solution — part (b).</b> With $a=2$, $X(j\\omega)=\\dfrac{4}{4+\\omega^{2}}$: a bell-shaped curve of height $1$ at $\\omega=0$, falling to $\\tfrac12$ at $\\omega=\\pm2$ and decaying as $4/\\omega^{2}$.<br>'
     +'<b>Solution — part (c).</b> The signal is real and even, and for such a signal the analysis integral keeps only the $\\cos$ half of the exponential, which is itself real and even in $\\omega$.<br>'
     +'<b>Check.</b> The area test: $X(0)=\\dfrac{2a}{a^{2}}=\\dfrac{2}{a}$, and directly $\\int e^{-a|t|}\\d t=\\dfrac{2}{a}$. The two agree. Widening the signal by decreasing $a$ narrows the transform, which is the reciprocal-spreading relation the module is built on.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-6.4,6.4],yr:[-0.15,1.35],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:2,ystep:0.5});
    a.curve(w=>4/(4+w*w),{color:C.mid});
    a.point(0,1,{color:C.coral});
    a.note(0.6,1.16,'X(0)=1=\\int x(t)\\,\\d t',{color:C.coral,fs:13,tex:true});
    return a.svg();},
  err:'Integrating $e^{-a|t|}$ as though it were $e^{-at}$ over the whole axis, which diverges at $t\\to-\\infty$ and produces a single first-order term instead of a sum of two.',
  teach:'The area check is free and catches most algebra slips in this module. Require $X(0)$ to be compared with $\\int x$ on every transform question.' },

{ id:'D5-02', module:'M5', type:'ft-basic', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=u(t+1)-u(t-1).$$',
  parts:['Compute $X(j\\omega)$ and write it using the unnormalised sinc.',
         'Give the locations of the zeros of $X(j\\omega)$.',
         'State $X(0)$ and check it against the area of $x(t)$.'],
  sol:'<b>Given.</b> A rectangular pulse of height $1$ on $-1\\le t\\le1$.<br>'
     +'<b>Find.</b> Its transform, its zeros, and its value at the origin.<br>'
     +'<b>Method.</b> The analysis integral runs over the support only. The sinc convention used here is the <b>unnormalised</b> one, $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{-1}^{1}e^{-j\\omega t}\\,\\d t=\\frac{e^{j\\omega}-e^{-j\\omega}}{j\\omega}=\\frac{2\\sin\\omega}{\\omega}=2\\operatorname{sinc}(\\omega).$$'
     +'<b>Solution — part (b).</b> $X(j\\omega)=0$ when $\\sin\\omega=0$ and $\\omega\\neq0$, that is at$$\\omega=\\pm\\pi,\\pm2\\pi,\\pm3\\pi,\\dots$$'
     +'<b>Solution — part (c).</b> Taking the limit, $X(0)=2$. The area of the pulse is $1\\cdot2=2$. They agree.<br>'
     +'<b>Check.</b> $X$ is real and even, as required for a real even signal. The first zero sits at $\\omega=\\pi$, which is $2\\pi$ divided by the total width $2$ — the width in time and the width to the first zero in frequency are reciprocal. Doubling the pulse width would halve that spacing.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-11,11],yr:[-0.8,2.4],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:Math.PI,ystep:0.5,
      xtickfmt:v=>Math.abs(v)<1e-9?'0':(Math.round(v/Math.PI)===1?'π':Math.round(v/Math.PI)===-1?'−π':String(Math.round(v/Math.PI))+'π')});
    a.curve(w=>Math.abs(w)<1e-9?2:2*Math.sin(w)/w,{color:C.mid,n:1400});
    return a.svg();},
  err:'Reporting $X(j\\omega)=\\dfrac{\\sin\\omega}{\\omega}$ without the factor $2$, usually by integrating from $0$ to $1$ and doubling the wrong quantity.',
  teach:'State the sinc convention every time it is used. Half the confusion in this module comes from students who met the normalised $\\sin(\\pi\\theta)/(\\pi\\theta)$ elsewhere.' },

{ id:'D5-03', module:'M5', type:'ft-basic', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=e^{-(2+j3)t}u(t).$$',
  parts:['Compute $X(j\\omega)$ and state the condition under which the integral converges.',
         'Give $|X(j\\omega)|$ and say where it peaks.'],
  sol:'<b>Given.</b> A causal complex exponential with decay rate $2$ and an oscillation at $3$ rad/s.<br>'
     +'<b>Find.</b> Its transform and the location of the peak.<br>'
     +'<b>Method.</b> The analysis integral runs from $0$ to $\\infty$ and is a single exponential.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\int_{0}^{\\infty}e^{-(2+j3)t}e^{-j\\omega t}\\,\\d t=\\frac{1}{2+j3+j\\omega}=\\frac{1}{2+j(\\omega+3)}.$$The integral converges because the real part of the exponent, $-2$, is negative. Only the real part matters for convergence; the imaginary part $j3$ never affects it.<br>'
     +'<b>Solution — part (b).</b>$$|X(j\\omega)|=\\frac{1}{\\sqrt{4+(\\omega+3)^{2}}},$$which peaks where $\\omega+3=0$, that is at $\\omega=-3$, with the value $\\tfrac12$.<br>'
     +'<b>Check.</b> Setting the oscillation to zero recovers the familiar pair $e^{-2t}u(t)\\leftrightarrow\\dfrac{1}{2+j\\omega}$, peaking at $\\omega=0$. Multiplying a signal by $e^{-j3t}$ shifts its spectrum by $-3$, and that is exactly what has happened. The signal is complex, so $|X|$ is <em>not</em> even in $\\omega$ — which is correct, and is the visible signature of a complex signal.',
  err:'Concluding that the integral diverges because $\\left|e^{-j3t}\\right|=1$ contributes no decay. The condition is on the real part of the exponent, and it is satisfied.',
  teach:'The one-sided spectrum is the useful surprise. Ask what would have to be true of $x$ for $|X|$ to come out even, and the conjugate-symmetry condition falls out.' },

{ id:'D5-04', module:'M5', type:'ft-dual', src:'MT2 Q3',
  stem:'Using duality and the pair $e^{-2|t|}\\leftrightarrow\\dfrac{4}{4+\\omega^{2}}$, find the Fourier transform of $$y(t)=\\frac{4}{4+t^{2}}.$$',
  parts:['State the duality relation.',
         'Apply it to obtain $Y(j\\omega)$.',
         'Check the result at $\\omega=0$.'],
  sol:'<b>Given.</b> A signal whose shape is the transform of a known signal.<br>'
     +'<b>Find.</b> Its transform, without integrating.<br>'
     +'<b>Method.</b> The analysis and synthesis integrals differ only by a sign in the exponent and a factor $2\\pi$. That symmetry is duality:$$\\text{if}\\quad x(t)\\leftrightarrow X(j\\omega),\\qquad\\text{then}\\quad X(t)\\leftrightarrow2\\pi\\,x(-\\omega).$$'
     +'<b>Solution — parts (a) and (b).</b> Take $x(t)=e^{-2|t|}$, so $X(j\\omega)=\\dfrac{4}{4+\\omega^{2}}$. The given signal is $X$ with $t$ in place of $\\omega$, so duality gives$$y(t)=X(t)\\quad\\Longrightarrow\\quad Y(j\\omega)=2\\pi\\,x(-\\omega)=2\\pi e^{-2|-\\omega|}=2\\pi e^{-2|\\omega|}.$$'
     +'<b>Solution — part (c).</b> $Y(0)=2\\pi$. Independently, $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{4}{4+t^{2}}\\,\\d t=2\\left[\\arctan\\frac{t}{2}\\right]_{-\\infty}^{\\infty}=2\\pi$. They agree.<br>'
     +'<b>Check.</b> The reflection $x(-\\omega)$ made no difference here because $e^{-2|t|}$ is even, which is why duality is often quoted without it. It would matter for a one-sided signal. The direct route — integrating $\\dfrac{4e^{-j\\omega t}}{4+t^{2}}$ over the whole axis — needs contour integration, so duality has saved the whole calculation.',
  err:'Dropping the factor $2\\pi$ and reporting $Y(j\\omega)=e^{-2|\\omega|}$. The area check at $\\omega=0$ catches it immediately.',
  teach:'Ask which known pair the given signal is the frequency half of, before any formula is written. Duality questions are won or lost at that identification.' },

{ id:'D5-05', module:'M5', type:'ft-dual', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=\\frac{\\sin(2t)}{\\pi t}.$$',
  parts:['Identify the known pair this signal is the dual of.',
         'Give $X(j\\omega)$ and sketch it.',
         'State what kind of system has this signal as its impulse response.'],
  sol:'<b>Given.</b> A sinc-shaped signal, with the <b>unnormalised</b> convention $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$.<br>'
     +'<b>Find.</b> Its transform.<br>'
     +'<b>Method.</b> A rectangular pulse in <em>frequency</em> synthesises a sinc in time. Rather than transform the sinc, invert the rectangle and match.<br>'
     +'<b>Solution — parts (a) and (b).</b> Let $X(j\\omega)=1$ for $|\\omega|<W$ and $0$ otherwise. The synthesis equation gives$$x(t)=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{\\sin(Wt)}{\\pi t}.$$Comparing with the given signal, $W=2$, so$$X(j\\omega)=\\begin{cases}1,&|\\omega|<2,\\\\0,&|\\omega|>2.\\end{cases}$$'
     +'<b>Solution — part (c).</b> A system with this impulse response is the <b>ideal low-pass filter</b> with cut-off $2$ rad/s: it passes every frequency below the cut-off unchanged and removes everything above it.<br>'
     +'<b>Check.</b> The area test: $X(0)=1$, and $\\displaystyle\\int\\frac{\\sin2t}{\\pi t}\\,\\d t=1$, the standard result. The signal is not absolutely integrable but it is square integrable, so the transform exists in the energy sense. The system is not causal — $x(t)\\neq0$ for $t<0$ — which is why the ideal filter cannot be built.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-6.4,6.4],yr:[-0.3,0.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:56,r:26,t:32,b:38},xstep:2,ystep:0.25});
      a.curve(t=>Math.abs(t)<1e-9?2/Math.PI:Math.sin(2*t)/(Math.PI*t),{color:C.in,n:1600}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-6.4,6.4],yr:[-0.3,1.4],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:56,r:26,t:32,b:38},xstep:2,ystep:0.5});
      a.poly([[-6.4,0],[-2,0],[-2,1],[2,1],[2,0],[6.4,0]],{color:C.mid}); return a.svg();})()),
  err:'Reading the cut-off as $W=1$ from the $\\sin(2t)$ term by confusing the argument of the sine with the argument of a normalised sinc. Matching against $\\dfrac{\\sin(Wt)}{\\pi t}$ term by term avoids it.',
  teach:'Deriving the pair by inverting the rectangle, rather than quoting it, is worth the four lines. Students who quote it cannot adapt when the height of the rectangle is not one.' },

{ id:'D5-06', module:'M5', type:'ft-parseval', src:'MT2 Q3',
  stem:'Let $x(t)=e^{-2t}u(t)$.',
  parts:['Compute the total energy directly in the time domain.',
         'Compute it again from $X(j\\omega)$ using Parseval\'s relation.'],
  sol:'<b>Given.</b> A causal decaying exponential.<br>'
     +'<b>Find.</b> Its energy, computed twice.<br>'
     +'<b>Method.</b> Time domain: $E=\\int|x(t)|^{2}\\d t$. Frequency domain: Parseval,$$\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\,\\d\\omega.$$'
     +'<b>Solution — part (a).</b>$$E=\\int_{0}^{\\infty}e^{-4t}\\,\\d t=\\frac14\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> The transform is $X(j\\omega)=\\dfrac{1}{2+j\\omega}$, so $|X(j\\omega)|^{2}=\\dfrac{1}{4+\\omega^{2}}$ and$$E=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{4+\\omega^{2}}=\\frac{1}{2\\pi}\\cdot\\frac{1}{2}\\left[\\arctan\\frac{\\omega}{2}\\right]_{-\\infty}^{\\infty}=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{2}=\\frac14\\;\\text{J}.$$'
     +'<b>Check.</b> The two agree at $\\tfrac14$ J. The result is real and positive, as an energy must be. Here the time integral was the easier one; the value of Parseval is that when a signal is <em>given</em> by its spectrum the frequency integral is the only one available.',
  err:'Omitting the factor $1/2\\pi$ on the frequency side, which multiplies the answer by $2\\pi$ and makes the two routes disagree.',
  teach:'Ask which side would be easier before either is computed. The choice is the examinable skill; both integrals are routine once chosen.' },

{ id:'D5-07', module:'M5', type:'ft-parseval', src:'MT2 Q3',
  stem:'Let $y(t)=e^{-3|t|}$, whose transform is $Y(j\\omega)=\\dfrac{6}{9+\\omega^{2}}$.',
  parts:['Compute the total energy of $y(t)$ in the time domain.',
         'Use Parseval\'s relation to evaluate $\\displaystyle\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{\\left(9+\\omega^{2}\\right)^{2}}$.'],
  sol:'<b>Given.</b> A two-sided exponential and its transform.<br>'
     +'<b>Find.</b> Its energy, and then a definite integral that Parseval makes free.<br>'
     +'<b>Method.</b> Compute the energy where it is easy — in time — then read Parseval backwards to evaluate the frequency integral.<br>'
     +'<b>Solution — part (a).</b>$$E=\\int_{-\\infty}^{\\infty}e^{-6|t|}\\,\\d t=2\\int_{0}^{\\infty}e^{-6t}\\,\\d t=2\\cdot\\frac16=\\frac13\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> Parseval gives$$\\frac13=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}\\frac{36}{\\left(9+\\omega^{2}\\right)^{2}}\\,\\d\\omega,$$so$$\\int_{-\\infty}^{\\infty}\\frac{\\d\\omega}{\\left(9+\\omega^{2}\\right)^{2}}=\\frac{2\\pi}{3\\cdot36}=\\frac{\\pi}{54}.$$'
     +'<b>Check.</b> The general result $\\displaystyle\\int\\frac{\\d\\omega}{\\left(a^{2}+\\omega^{2}\\right)^{2}}=\\frac{\\pi}{2a^{3}}$ returns $\\pi/54$ at $a=3$, which agrees. The value is positive and smaller than $\\displaystyle\\int\\frac{\\d\\omega}{9+\\omega^{2}}=\\frac{\\pi}{3}$, as it must be. Evaluating this integral directly needs a trigonometric substitution or a contour, so Parseval has replaced the whole calculation with one line.<br>'
     +'<b>Interpretation.</b> Parseval is a two-way street. It is used as often to evaluate an awkward integral from a known energy as it is to compute an energy from a known spectrum.',
  err:'Solving for the integral without dividing by the numerator $36$, which gives $2\\pi/3$ instead of $\\pi/54$.',
  teach:'This backwards use of Parseval is the version that appears in examinations. Set it beside the forward use in the previous question so both directions are practised.' },

{ id:'D5-08', module:'M5', type:'ft-inv', src:'MT2 Q3',
  stem:'Find $x(t)$ given $$X(j\\omega)=\\frac{1}{(j\\omega)^{2}+3j\\omega+2}.$$',
  parts:['Factor the denominator and split $X$ into partial fractions.',
         'Invert each term and give $x(t)$.',
         'Check your answer at $\\omega=0$.'],
  sol:'<b>Given.</b> A second-order rational transform.<br>'
     +'<b>Find.</b> The signal it came from.<br>'
     +'<b>Method.</b> Treat $j\\omega$ as one symbol, factor, split, and invert term by term with the standard pair$$\\frac{1}{a+j\\omega}\\leftrightarrow e^{-at}u(t),\\qquad a>0.$$'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=\\frac{1}{(j\\omega+1)(j\\omega+2)}=\\frac{A}{j\\omega+1}+\\frac{B}{j\\omega+2}.$$Clearing denominators, $A(j\\omega+2)+B(j\\omega+1)=1$, so $A+B=0$ and $2A+B=1$, giving $A=1$ and $B=-1$.<br>'
     +'<b>Solution — part (b).</b>$$x(t)=\\left(e^{-t}-e^{-2t}\\right)u(t).$$'
     +'<b>Solution — part (c).</b> $X(0)=\\dfrac{1}{2}$, and $\\displaystyle\\int_{0}^{\\infty}\\left(e^{-t}-e^{-2t}\\right)\\d t=1-\\tfrac12=\\tfrac12$. They agree.<br>'
     +'<b>Check.</b> Both poles have positive real part in the sense that $a>0$ in each factor, so both terms are causal and decaying, and the transform exists. The signal starts at $x(0)=0$ and returns to zero, peaking at $t=\\ln2$ — the same signal that came out of convolving $e^{-t}u(t)$ with $e^{-2t}u(t)$ in Module 3, as it must, since multiplying the two transforms is what convolution does.',
  err:'Factoring the denominator in $\\omega$ rather than in $j\\omega$, which produces $-\\omega^{2}+3j\\omega+2$ handled incorrectly and complex partial-fraction constants that do not invert to real signals.',
  teach:'The cross-reference to the convolution in Module 3 is worth making explicit. It is the first time students see the same answer arrive by two independent routes.' },

{ id:'D5-09', module:'M5', type:'ft-inv', src:'MT2 Q3',
  stem:'Find $x(t)$ given $$X(j\\omega)=\\frac{j\\omega+4}{(j\\omega+1)(j\\omega+3)}.$$',
  parts:['Split $X$ into partial fractions.',
         'Give $x(t)$.',
         'Check your answer at $\\omega=0$ and state the value of $x(0^{+})$.'],
  sol:'<b>Given.</b> A rational transform with a first-order numerator.<br>'
     +'<b>Find.</b> The signal.<br>'
     +'<b>Method.</b> The numerator degree is below the denominator degree, so a direct partial-fraction split works with no polynomial part.<br>'
     +'<b>Solution — part (a).</b>$$\\frac{j\\omega+4}{(j\\omega+1)(j\\omega+3)}=\\frac{A}{j\\omega+1}+\\frac{B}{j\\omega+3}.$$Clearing, $A(j\\omega+3)+B(j\\omega+1)=j\\omega+4$, so $A+B=1$ and $3A+B=4$. Subtracting gives $2A=3$, hence$$A=\\tfrac32,\\qquad B=-\\tfrac12.$$'
     +'<b>Solution — part (b).</b>$$x(t)=\\tfrac32e^{-t}u(t)-\\tfrac12e^{-3t}u(t).$$'
     +'<b>Solution — part (c).</b> $X(0)=\\dfrac{4}{3}$, and $\\displaystyle\\int_{0}^{\\infty}x(t)\\,\\d t=\\tfrac32-\\tfrac12\\cdot\\tfrac13=\\tfrac32-\\tfrac16=\\tfrac43$. They agree. At $t=0^{+}$, $x=\\tfrac32-\\tfrac12=1$, which matches the ratio of leading coefficients, $\\dfrac{j\\omega}{(j\\omega)^{2}/j\\omega}\\to1$ as $\\omega\\to\\infty$.<br>'
     +'<b>Check.</b> Both terms decay, so the signal is an energy signal, and it is causal because both standard pairs are. The jump at the origin, $x(0^{+})=1$, is the signature of a numerator whose degree is exactly one below the denominator\'s.',
  err:'Solving the two linear equations with the roles of $A$ and $B$ swapped, which gives $x(t)=-\\tfrac12e^{-t}u(t)+\\tfrac32e^{-3t}u(t)$ and fails the area check at $\\omega=0$.',
  teach:'The area check at $\\omega=0$ distinguishes the correct assignment from the swapped one in one line. Insist on it rather than on rechecking the algebra.' },

{ id:'D5-10', module:'M5', type:'ft-mod', src:'MT2 Q4',
  stem:'The signal $x(t)=\\dfrac{\\sin(2t)}{\\pi t}$ is multiplied by a carrier to give $$y(t)=x(t)\\cos(10t).$$',
  parts:['Give $X(j\\omega)$.',
         'Give $Y(j\\omega)$ and sketch it.',
         'State the largest carrier frequency for which the two shifted copies do not overlap.'],
  sol:'<b>Given.</b> An ideal low-pass signal modulated by a cosine at $10$ rad/s.<br>'
     +'<b>Find.</b> The spectrum of the product.<br>'
     +'<b>Method.</b> Multiplication in time is convolution in frequency with a factor $\\tfrac{1}{2\\pi}$. Since$$\\cos(\\omega_ct)\\leftrightarrow\\pi\\left[\\delta(\\omega-\\omega_c)+\\delta(\\omega+\\omega_c)\\right],$$the convolution is just two shifted copies at half height.<br>'
     +'<b>Solution — part (a).</b> $X(j\\omega)=1$ for $|\\omega|<2$ and $0$ otherwise.<br>'
     +'<b>Solution — part (b).</b>$$Y(j\\omega)=\\tfrac12X\\bigl(j(\\omega-10)\\bigr)+\\tfrac12X\\bigl(j(\\omega+10)\\bigr),$$two rectangles of height $\\tfrac12$, each $4$ rad/s wide: one on $8<\\omega<12$ and one on $-12<\\omega<-8$.<br>'
     +'<b>Solution — part (c).</b> The copies are centred at $\\pm\\omega_c$ and each reaches $2$ rad/s either side of its centre. They stay apart as long as $\\omega_c-2>-\\omega_c+2$, that is $\\omega_c>2$. At $\\omega_c=2$ they touch at the origin, and below that they overlap and the original signal can no longer be recovered.<br>'
     +'<b>Check.</b> Total area is preserved in the right way: $Y(0)=0$ because neither copy reaches the origin, and indeed $y(t)$ has zero mean since it is an oscillation. The width of each copy, $4$ rad/s, equals the full width of $X$, as a pure shift must leave it.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-16,16],yr:[-0.2,0.9],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Y(j\\omega)',
      pad:{l:58,r:28,t:34,b:40},xstep:4,ystep:0.25});
    a.poly([[-16,0],[-12,0],[-12,0.5],[-8,0.5],[-8,0],[8,0],[8,0.5],[12,0.5],[12,0],[16,0]],{color:C.out});
    a.span(8,12,0.62,'\\text{width }4',{tex:true,fs:13,color:C.coral});
    return a.svg();},
  err:'Placing the copies at $\\pm10$ with height $1$ instead of $\\tfrac12$. The impulses of a cosine carry weight $\\pi$ each, and the $\\tfrac{1}{2\\pi}$ of the convolution turns that into a half.',
  teach:'Ask for the non-overlap condition in general form, $\\omega_c>W$, before the numbers are put in. It is the same condition that returns as the sampling theorem in Module 7.' },

{ id:'D5-11', module:'M5', type:'ft-mod', src:'MT2 Q4',
  stem:'A signal $x(t)$ has $X(j\\omega)=1$ for $|\\omega|<1$ and $0$ otherwise. It is windowed by $p(t)=\\dfrac{\\sin(3t)}{\\pi t}$, giving $$w(t)=x(t)\\,p(t).$$',
  parts:['Give $P(j\\omega)$.',
         'Find $W(j\\omega)$ by convolving in frequency, and sketch it.',
         'Say what $w(t)$ equals, and why.'],
  sol:'<b>Given.</b> Two ideal low-pass signals of different bandwidths, multiplied.<br>'
     +'<b>Find.</b> The spectrum of the product.<br>'
     +'<b>Method.</b>$$W(j\\omega)=\\frac{1}{2\\pi}\\left[X*P\\right](j\\omega)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,P\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta.$$'
     +'<b>Solution — part (a).</b> By the same derivation as for $x$, $P(j\\omega)=1$ for $|\\omega|<3$ and $0$ otherwise.<br>'
     +'<b>Solution — part (b).</b> Both factors are rectangles, so the convolution is a trapezoid. The narrow one has width $2$ and the wide one width $6$, so the result runs over $|\\omega|<4$ with a flat top on $|\\omega|<2$. Including the $\\tfrac{1}{2\\pi}$, the flat height is$$\\frac{1}{2\\pi}\\cdot2=\\frac{1}{\\pi},$$falling linearly to zero between $|\\omega|=2$ and $|\\omega|=4$.<br>'
     +'<b>Solution — part (c).</b> Multiplying two sincs does <em>not</em> give a sinc, and the trapezoidal spectrum is the proof: $w(t)$ is the signal whose transform is that trapezoid, and it is not band-limited to $|\\omega|<1$. Windowing has <b>widened</b> the band from $1$ to $4$ rad/s.<br>'
     +'<b>Check.</b> Supports add under convolution: $1+3=4$, which is the outer edge. The flat top has half-width $3-1=2$, the difference of the two half-widths, matching the rectangle-times-rectangle rule from Module 3. The area is preserved by the transform pair: $W(0)=\\tfrac1\\pi$, and $w(0)=x(0)p(0)=\\tfrac{2}{2\\pi}\\cdot\\tfrac{6}{2\\pi}$ — consistent once the synthesis integral of the trapezoid is evaluated.',
  figSol:()=>{const W=w=>{const A=Math.abs(w); return A<=2?1/Math.PI:A<4?(4-A)/(2*Math.PI):0;};
    const a=P.Axes({w:1080,h:290,xr:[-6.4,6.4],yr:[-0.08,0.45],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'W(j\\omega)',
      pad:{l:62,r:28,t:34,b:40},xstep:1,ystep:0.1});
    a.curve(W,{color:C.out,n:1600});
    [-4,-2,2,4].forEach(w=>a.vline(w,{color:C.muted,opacity:.45}));
    return a.svg();},
  err:'Multiplying the two rectangles in frequency, which would give the narrower rectangle back. Multiplication in time is convolution in frequency, not multiplication in frequency.',
  teach:'The widening in part (c) is the practical lesson of the whole topic: every finite observation window spreads the spectrum of what it observes.' },

{ id:'D5-12', module:'M5', type:'ft-per', src:'MT2 Q3',
  stem:'Find the Fourier transform of the impulse train $$x(t)=\\sum_{k=-\\infty}^{\\infty}\\delta(t-2k).$$',
  parts:['Find the Fourier series coefficients of $x(t)$.',
         'Give $X(j\\omega)$ and sketch it.',
         'State what happens to $X(j\\omega)$ as the spacing in time is decreased.'],
  sol:'<b>Given.</b> An impulse train of period $T=2$, so $\\omega_0=\\dfrac{2\\pi}{2}=\\pi$.<br>'
     +'<b>Find.</b> Its transform.<br>'
     +'<b>Method.</b> A periodic signal has a line spectrum. Find $a_k$ from the analysis equation, then place an impulse of weight $2\\pi a_k$ at each harmonic:$$X(j\\omega)=2\\pi\\sum_{k}a_k\\,\\delta(\\omega-k\\omega_0).$$'
     +'<b>Solution — part (a).</b> Over the period $-1\\le t\\le1$ only the impulse at the origin lies inside, so by sifting$$a_k=\\frac{1}{2}\\int_{-1}^{1}\\delta(t)e^{-jk\\pi t}\\,\\d t=\\frac12\\qquad\\text{for every }k.$$'
     +'<b>Solution — part (b).</b>$$X(j\\omega)=2\\pi\\sum_{k}\\frac12\\,\\delta(\\omega-k\\pi)=\\pi\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\pi).$$An impulse train in time transforms into an impulse train in frequency, of spacing $\\pi$ and weight $\\pi$.<br>'
     +'<b>Solution — part (c).</b> The general result is $\\dfrac{2\\pi}{T}\\sum_k\\delta\\!\\left(\\omega-\\dfrac{2\\pi k}{T}\\right)$. Decreasing $T$ increases the spacing $2\\pi/T$ and the weight together, so a <b>denser</b> train in time gives a <b>sparser</b> one in frequency.<br>'
     +'<b>Check.</b> The reciprocal-spreading rule holds in its extreme form here. In the limit $T\\to\\infty$ a single impulse remains in time and the frequency train collapses to the constant $1$, which is the familiar pair $\\delta(t)\\leftrightarrow1$. In the limit $T\\to0$ the roles swap.',
  err:'Reporting $X(j\\omega)=\\sum_k\\delta(\\omega-k\\pi)$ without the weight $\\pi$. The factor is $2\\pi a_k$, and $a_k=1/T$.',
  teach:'This single pair carries the whole of Module 7. Make sure the relation between the two spacings, $T$ and $2\\pi/T$, is stated as a formula and not only as a picture.' },

{ id:'D5-13', module:'M5', type:'ft-per', src:'MT2 Q3',
  stem:'Find the Fourier transform of $$x(t)=1+2\\cos(3t)+\\sin(6t).$$',
  parts:['Give $X(j\\omega)$ as a sum of impulses.',
         'Sketch the magnitude of $X(j\\omega)$ and mark the impulse weights.'],
  sol:'<b>Given.</b> A constant plus two sinusoids.<br>'
     +'<b>Find.</b> The line spectrum.<br>'
     +'<b>Method.</b> Use the three standard pairs$$1\\leftrightarrow2\\pi\\delta(\\omega),\\qquad\\cos(\\omega_ct)\\leftrightarrow\\pi\\left[\\delta(\\omega-\\omega_c)+\\delta(\\omega+\\omega_c)\\right],$$$$\\sin(\\omega_ct)\\leftrightarrow\\frac{\\pi}{j}\\left[\\delta(\\omega-\\omega_c)-\\delta(\\omega+\\omega_c)\\right],$$and add, since the transform is linear.<br>'
     +'<b>Solution — part (a).</b>$$X(j\\omega)=2\\pi\\delta(\\omega)+2\\pi\\left[\\delta(\\omega-3)+\\delta(\\omega+3)\\right]-j\\pi\\left[\\delta(\\omega-6)-\\delta(\\omega+6)\\right],$$using $\\dfrac{1}{j}=-j$.<br>'
     +'<b>Solution — part (b).</b> The magnitudes are $2\\pi$ at $\\omega=0$, $2\\pi$ at $\\omega=\\pm3$, and $\\pi$ at $\\omega=\\pm6$. The impulses at $\\pm6$ carry a phase of $\\mp\\pi/2$, the ones at $0$ and $\\pm3$ a phase of zero.<br>'
     +'<b>Check.</b> Conjugate symmetry holds, as it must for a real signal: the weight at $\\omega=6$ is $-j\\pi$ and at $\\omega=-6$ is $+j\\pi$, which are conjugates. Cross-checking through the Fourier series with $\\omega_0=3$: $a_0=1$, $a_{\\pm1}=1$, $a_{2}=-\\tfrac{j}{2}$, $a_{-2}=\\tfrac{j}{2}$, and $2\\pi a_k$ reproduces every weight above.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-8.4,8.4],yr:[-1,7.6],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|X(j\\omega)|',
      pad:{l:56,r:28,t:34,b:40},xstep:2,ystep:2});
    [[-6,Math.PI],[-3,2*Math.PI],[0,2*Math.PI],[3,2*Math.PI],[6,Math.PI]].forEach(([w,h])=>
      a.impulse(w,h,{color:C.mid,labelText:h>4?'2π':'π'}));
    return a.svg();},
  err:'Giving the sine the same real weights as the cosine. The sine pair carries a factor $1/j$, and dropping it loses the phase that distinguishes the two.',
  teach:'Have the coefficients checked against the Fourier series route as in the Check step. Agreement between the two is the strongest evidence a student can produce on this kind of question.' },

]);

window.DRILL_M5 = [

{ id:'m5-drill-map', module:'M5', nav:'Module 5 exam drill · question types',
  title:'Module 5 — what a question looks like', src:'pp. 42–60',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'exam drill module 5 question types Fourier transform duality Parseval inverse modulation taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Exam drill', src:'pp. 42–60'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on the continuous-time Fourier transform come in six shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M5'}
]},

{ id:'m5-drill', module:'M5', nav:'Module 5 exam drill · questions',
  title:'Module 5 — exam drill', src:'pp. 42–60',
  objective:'Thirteen open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 5 questions practice Fourier transform duality Parseval partial fractions modulation impulse train',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 5 · Exam drill D5-01 … D5-13', src:'pp. 42–60'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. The cheapest check in this module is the area test, $X(0)=\\int x(t)\\,\\d t$, and it catches most factor errors. The sinc convention used throughout is the unnormalised one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M5'}
]}

];

})();
