/* ==========================================================================
   Practice questions — Module 4.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const seq =(vals,n0)=>vals.map((v,i)=>[n0+i,v]);
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
            'For a real signal, verify $a_{-k}=a_k^{*}$. Also calculate the mean from the signal definition and compare it with $a_0$.'],
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
            'Calculate each output coefficient from $b_k=a_k\\,H(jk\\omega_0)$. This operation is multiplication, not convolution.',
            'A harmonic where $H$ vanishes is absent from the output. Say so explicitly.'],
    go:'m4-lti' },
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
    go:'m4-props-1' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'One periodic signal, its coefficients, and what a system or a second signal does to them.',
    method:['Find the fundamental period first and fix $\\omega_0$ from it. Every index in the answer is counted against that one $\\omega_0$, and a wrong period misplaces all of them.',
            'Where a signal is a sum of sinusoids, expand each into complex exponentials and read the coefficients off; do not integrate what can be recognised.',
            'Where a system is present, the coefficients pass through it one harmonic at a time: $b_k=a_kH(jk\\omega_0)$ in continuous time and $b_k=a_kH(e^{jk\\omega_0})$ in discrete time.',
            'Check the power with Parseval. The average power is $\\sum_k|a_k|^{2}$, and it must agree with the value calculated from the time-domain amplitudes.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D4-01', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'Let $$x(t)=4+2\\cos(2\\pi t)+6\\sin\\!\\left(\\tfrac{2\\pi}{3}t\\right).$$',
  parts:['Find the fundamental period $T_0$ and $\\omega_0$, and state which harmonic each term is.',
         'Find $a_k$ for every $k$, and plot the magnitude spectrum.',
         'Plot the phase spectrum.'],
  sol:'<b>Given.</b> A constant plus two sinusoids at $2\\pi$ and $2\\pi/3$ rad/s.<br>'
     +'<b>Find.</b> $T_0$, every coefficient, and the two spectra.<br>'
     +'<b>Method.</b> Find the common period first, because every harmonic index is counted against its $\\omega_0$. The signal is already a sum of exponentials once Euler\'s formulas are applied, so no integration is needed.<br>'
     +'<b>Solution — part (a).</b> $T_1=1$ and $T_2=3$, so$$T_0=\\operatorname{lcm}(1,3)=3\\;\\text{s},\\qquad\\omega_0=\\frac{2\\pi}{3}\\;\\text{rad/s}.$$The cosine sits at $2\\pi=3\\omega_0$: the third harmonic. The sine sits at $2\\pi/3=\\omega_0$: the first harmonic.<br>'
     +'<b>Solution — part (b).</b> Using $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$,$$2\\cos(3\\omega_0t)=e^{j3\\omega_0t}+e^{-j3\\omega_0t},\\qquad 6\\sin(\\omega_0t)=-3j\\,e^{j\\omega_0t}+3j\\,e^{-j\\omega_0t}.$$Hence$$a_0=4,\\qquad a_{1}=-3j,\\qquad a_{-1}=3j,\\qquad a_{3}=a_{-3}=1,$$and every other coefficient is zero. Magnitudes: $|a_0|=4$, $|a_{\\pm1}|=3$, $|a_{\\pm3}|=1$.<br>'
     +'<b>Solution — part (c).</b> Phases: $\\angle a_0=0$, $\\angle a_1=-\\tfrac{\\pi}{2}$, $\\angle a_{-1}=\\tfrac{\\pi}{2}$, $\\angle a_3=\\angle a_{-3}=0$.<br>'
     +'<b>Check.</b> The signal is real, and $a_{-k}=a_k^{*}$ holds at every $k$: $\\overline{-3j}=3j$ and $1$ is its own conjugate. The sinusoidal terms have zero mean, so the mean over one period is the constant term $4$. This agrees with $a_0$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-0.5,5],xlabel:'k',ylabel:'|a_k|',
      pad:{l:50,r:26,t:32,b:34},xstep:1,ystep:1});
      a.stem([[-3,1],[-1,3],[0,4],[1,3],[3,1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-2.2,2.2],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',
      pad:{l:62,r:26,t:32,b:34},xstep:1,ystep:1});
      a.stem([[-3,0],[-1,Math.PI/2],[0,0],[1,-Math.PI/2],[3,0]],{color:C.mid,showZero:true}); return a.svg();})()),
  err:'Taking $T_0=1\\cdot3=3$ correctly but then indexing the sine term against $\\omega_0=2\\pi$ (the cosine\'s own frequency) instead of the true fundamental $2\\pi/3$, which reports the sine as the third harmonic and the cosine as the first — the two swapped.',
  teach:'Ask for the harmonic number of each term before any coefficient is written down. A student who cannot say "first harmonic, third harmonic" here will mis-index every longer sum later in the module.' },

{ id:'D4-02', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'A periodic signal has $T_0=6$ and equals $3$ for $|t|<1$ and $0$ for $1<|t|<3$ inside one period.',
  parts:['Find $a_0$ by inspection.',
         'Find $a_k$ for $k\\neq0$ using the analysis equation.',
         'Plot $|a_k|$ for $-6\\le k\\le6$ and say which harmonics are absent.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-7.4,7.4],yr:[-0.4,3.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    const pulse=t=>{let u=t-6*Math.round(t/6); return Math.abs(u)<1?3:0;};
    a.curve(pulse,{color:C.in,n:2600}); return a.svg();},
  sol:'<b>Given.</b> A rectangular pulse of height $3$, half-width $T_1=1$, period $T_0=6$, so $\\omega_0=\\tfrac{2\\pi}{6}=\\tfrac{\\pi}{3}$.<br>'
     +'<b>Find.</b> The coefficients and the missing harmonics.<br>'
     +'<b>Method.</b> $a_0$ is the mean over one period. For $k\\neq0$,$$a_k=\\frac{1}{T_0}\\int_{T_0}x(t)e^{-jk\\omega_0t}\\,\\d t,$$taking the period $-3\\le t\\le3$ so the integral runs over $-1\\le t\\le1$ only.<br>'
     +'<b>Solution — part (a).</b>$$a_0=\\frac{2T_1\\cdot3}{T_0}=\\frac{2\\cdot3}{6}=1.$$'
     +'<b>Solution — part (b).</b>$$a_k=\\frac{1}{6}\\int_{-1}^{1}3\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{3}{6}\\cdot\\frac{2\\sin(k\\omega_0)}{k\\omega_0}=\\frac{\\sin(k\\pi/3)}{k\\pi/3}\\cdot\\frac12=\\frac{3\\sin(k\\pi/3)}{k\\pi}.$$'
     +'<b>Solution — part (c).</b> $\\sin(k\\pi/3)=0$ whenever $k$ is a multiple of $3$, so <b>every third harmonic is absent</b>: $a_3=a_6=0$. The others give$$a_1\\approx0.8270,\\quad a_2\\approx0.4135,\\quad a_4\\approx-0.2067,\\quad a_5\\approx-0.1654,$$so $|a_k|$ decays roughly as $1/|k|$ between the zeros.<br>'
     +'<b>Check.</b> Every coefficient is real, as it must be: the signal is even, so $a_{-k}=a_k$. Letting $k\\to0$ in the formula, $\\dfrac{3\\sin(k\\pi/3)}{k\\pi}\\to\\dfrac{3\\cdot(\\pi/3)}{\\pi}=1$, matching $a_0$ from part (a) without a separate computation. The duty cycle is $2T_1/T_0=1/3$, and $a_0=$ height $\\times$ duty cycle $=3\\times\\tfrac13=1$, a second route to the same number.',
  figSol:()=>{const ak=k=>k===0?1:3*Math.sin(k*Math.PI/3)/(k*Math.PI);
    const a=P.Axes({w:1080,h:280,xr:[-6.8,6.8],yr:[-0.3,1.15],xlabel:'k',ylabel:'|a_k|',
      pad:{l:56,r:28,t:32,b:34},xstep:1,ystep:0.25});
    a.stem(disc(k=>Math.abs(ak(k)),-6,6),{color:C.in,showZero:true}); return a.svg();},
  err:'Writing $a_k=\\dfrac{3\\sin(k\\pi/3)}{k\\pi/3}$ by cancelling the factor of $\\tfrac13$ incorrectly, which triples every coefficient and sends the $k\\to0$ limit to $3$ instead of $1$.',
  teach:'The limit check at $k\\to0$ costs one line and catches every scale-factor slip in this derivation. Require it before the zero-harmonic pattern in part (c) is stated.' },

{ id:'D4-03', module:'M4', type:'fs-coef', src:'MT2 Q1',
  stem:'A periodic signal has $T_0=2$ and equals $x(t)=1-|t|$ for $-1\\le t\\le1$ inside one period: a triangular pulse of height $1$, with no jump anywhere, only a corner at $t=0$ and at $t=\\pm1$.',
  parts:['Find $a_0$ without integrating.',
         'Find $a_k$ for $k\\neq0$ using integration by parts.',
         'Plot $|a_k|$ for $-7\\le k\\le7$ and state how fast the envelope decays.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.4,3.4],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    const tri=t=>{let u=t-2*Math.round(t/2); return 1-Math.abs(u);};
    a.curve(tri,{color:C.in,n:2400}); return a.svg();},
  sol:'<b>Given.</b> A triangular pulse of unit height, period $T_0=2$, so $\\omega_0=\\pi$.<br>'
     +'<b>Find.</b> The coefficients and their decay rate.<br>'
     +'<b>Method.</b> The area under the triangle gives $a_0$ directly. For $k\\neq0$ the signal is even, so the analysis integral reduces to a cosine integral, solved by one integration by parts.<br>'
     +'<b>Solution — part (a).</b> One period is a triangle of base $2$ and height $1$, area $1$, so $a_0=1/T_0=1/2$.<br>'
     +'<b>Solution — part (b).</b> Because $x$ is even,$$a_k=\\frac{1}{2}\\int_{-1}^{1}(1-|t|)\\cos(k\\pi t)\\,\\d t=\\int_0^1(1-t)\\cos(k\\pi t)\\,\\d t.$$With $u=1-t$, $\\d v=\\cos(k\\pi t)\\,\\d t$, the boundary term vanishes at both ends, leaving$$a_k=\\frac{1}{k\\pi}\\int_0^1\\sin(k\\pi t)\\,\\d t=\\frac{1-\\cos(k\\pi)}{(k\\pi)^{2}}=\\frac{1-(-1)^{k}}{(k\\pi)^{2}}.$$'
     +'<b>Solution — part (c).</b> $a_k=0$ for every even $k$, and $a_k=\\dfrac{2}{(k\\pi)^{2}}$ for odd $k$:$$a_1=\\frac{2}{\\pi^{2}}\\approx0.2026,\\qquad a_3=\\frac{2}{9\\pi^{2}}\\approx0.0225,\\qquad a_5=\\frac{2}{25\\pi^{2}}\\approx0.0081.$$The envelope decays as $1/k^{2}$, because the signal has no jump — only a change of slope at each corner.<br>'
     +'<b>Check.</b> As $k\\to0$, $1-\\cos(k\\pi)\\approx(k\\pi)^{2}/2$, so $a_k\\to\\tfrac12$, matching $a_0$ from part (a) without repeating the integral. A rectangular pulse has a jump and coefficients that decay as $1/k$. This signal has no jump, and its coefficients decay as $1/k^{2}$.',
  figSol:()=>{const ak=k=>k===0?0.5:(k%2===0?0:2/((k*Math.PI)**2));
    const a=P.Axes({w:1080,h:280,xr:[-7.8,7.8],yr:[-0.05,0.62],xlabel:'k',ylabel:'|a_k|',
      pad:{l:56,r:28,t:32,b:34},xstep:1,ystep:0.2});
    a.stem(disc(k=>Math.abs(ak(k)),-7,7),{color:C.in,showZero:true}); return a.svg();},
  err:'Stopping after the first integration by parts and reporting $a_k=\\dfrac{1-\\cos(k\\pi)}{k\\pi}$, missing that the remaining integral $\\int_0^1\\sin(k\\pi t)\\,\\d t$ still needs to be evaluated, which brings in the second factor of $k\\pi$ and is what produces the $1/k^{2}$ envelope.',
  teach:'Ask what happens to the envelope if the triangle is replaced by a rectangle of the same width. The new jump changes the decay from $1/k^2$ to $1/k$. This comparison connects smoothness in time with coefficient decay.' },

{ id:'D4-04', module:'M4', type:'fs-coef',
  stem:'A real periodic signal $x(t)$ has fundamental angular frequency $\\omega_0=2$ rad/s. Its only non-zero Fourier series coefficients are $$a_0=-1,\\qquad a_2=3j,\\quad a_{-2}=-3j,\\qquad a_5=2e^{j\\pi/4},\\quad a_{-5}=2e^{-j\\pi/4}.$$',
  parts:['Using the conjugate-pair reassembly, write $x(t)$ as a sum of real cosines.',
         'Evaluate $x(0)$ from this real form.'],
  sol:'<b>Given.</b> Five coefficients of a real periodic signal, stated directly rather than derived from a time-domain formula.<br>'
     +'<b>Find.</b> The real closed form of $x(t)$, and its value at $t=0$.<br>'
     +'<b>Method.</b> This is the synthesis equation used in reverse: pair each $k$ with $-k$ and use $b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}=2|b_k|\\cos(k\\omega_0t+\\angle b_k)$, with $k=0$ standing alone.<br>'
     +'<b>Solution — part (a).</b> $|a_2|=3$, $\\angle a_2=\\pi/2$; $|a_5|=2$, $\\angle a_5=\\pi/4$. With $2\\omega_0=4$ and $5\\omega_0=10$,$$x(t)=-1+6\\cos\\!\\left(4t+\\frac{\\pi}{2}\\right)+4\\cos\\!\\left(10t+\\frac{\\pi}{4}\\right).$$'
     +'<b>Solution — part (b).</b>$$x(0)=-1+6\\cos\\!\\left(\\frac{\\pi}{2}\\right)+4\\cos\\!\\left(\\frac{\\pi}{4}\\right)=-1+0+4\\cdot\\frac{\\sqrt2}{2}=-1+2\\sqrt2\\approx1.8284.$$'
     +'<b>Check.</b> Evaluate $x(\\pi/8)$ two ways. Directly from the five coefficients, with $2\\omega_0(\\pi/8)=\\pi/2$ and $5\\omega_0(\\pi/8)=5\\pi/4$: $a_2e^{j\\pi/2}+a_{-2}e^{-j\\pi/2}=3j\\cdot j+(-3j)(-j)=-3-3=-6$, and $a_5e^{j5\\pi/4}+a_{-5}e^{-j5\\pi/4}=2e^{j3\\pi/2}+2e^{-j3\\pi/2}=-2j+2j=0$; total $-1-6+0=-7$. From the real form: $-1+6\\cos(\\pi)+4\\cos(3\\pi/2)=-1-6+0=-7$. The two routes agree exactly.',
  err:'Writing the amplitude of the $k=2$ term as $|a_2|=3$ but the phase as $\\angle a_{-2}=-\\pi/2$ instead of $\\angle a_2=+\\pi/2$, which reverses the sign of the cosine\'s phase and moves the whole term by half a period at the harmonic frequency.',
  teach:'Ask the student to calculate $x(0)$ directly by summing all five coefficients. Then compare that result with the value from the real form. Agreement checks the conjugate-pair conversion.' },

{ id:'D4-05', module:'M4', type:'fs-power', src:'MT2 Q1',
  stem:'Let $$x(t)=-3+4\\cos(5t)-2\\sin(15t).$$',
  parts:['Find the Fourier series coefficients $a_k$.',
         'Find the average power over one period using Parseval\'s relation.',
         'Confirm the same value using the direct amplitude rule for a sum of sinusoids.'],
  sol:'<b>Given.</b> A constant plus a first-harmonic cosine and a third-harmonic sine, with $\\omega_0=5$ rad/s.<br>'
     +'<b>Find.</b> The coefficients and the average power, by two routes.<br>'
     +'<b>Method.</b> Expand with Euler\'s formulas and read off $a_k$. Then apply $P=\\sum_k|a_k|^2$, and separately the rule that a DC term of height $A_0$ contributes $A_0^2$ while a sinusoid of amplitude $A$ contributes $A^2/2$.<br>'
     +'<b>Solution — part (a).</b> $4\\cos(5t)=4\\cos(\\omega_0t)$ gives $a_1=a_{-1}=2$. For the third harmonic, $-2\\sin(3\\omega_0t)=-\\dfrac{2}{2j}\\bigl(e^{j3\\omega_0t}-e^{-j3\\omega_0t}\\bigr)=j\\,e^{j3\\omega_0t}-j\\,e^{-j3\\omega_0t}$, so $a_3=j$, $a_{-3}=-j$. And $a_0=-3$. Every other coefficient is zero.<br>'
     +'<b>Solution — part (b).</b>$$P=\\sum_k|a_k|^2=(-3)^2+2(2)^2+2(1)^2=9+8+2=19\\;\\text{W}.$$'
     +'<b>Solution — part (c).</b> $A_0=-3$, $A_1=4$, $A_3=2$, so$$P=A_0^{2}+\\frac{A_1^{2}}{2}+\\frac{A_3^{2}}{2}=9+\\frac{16}{2}+\\frac{4}{2}=9+8+2=19\\;\\text{W}.$$'
     +'<b>Check.</b> The two routes agree at $19$ W. Conjugate symmetry holds: $\\overline{j}=-j$ and $2$ is real, matching $a_{-1}=a_1^{*}$ and $a_{-3}=a_3^{*}$. The DC term alone carries $9$ W of the $19$, which is more than the two harmonics combined — consistent with $|a_0|=3$ being the largest single coefficient.',
  err:'Applying $A^2/2$ to the DC term as well as to the two sinusoids, which gives $4.5+8+2=14.5$ instead of $19$. A constant has no oscillation to average over, and it keeps its full square.',
  teach:'Before evaluating either sum, ask which coefficient contributes the most power. Here $|a_0|^2=9$ is the largest contribution. This gives a scale check for the Parseval total.' },

{ id:'D4-06', module:'M4', type:'fs-power', src:'MT2 Q1',
  stem:'A periodic signal has $T_0=4$ and equals $x(t)=3$ for $0<t<1$ and $x(t)=-1$ for $1<t<4$ inside one period.',
  parts:['Find the average power directly, using the period $0\\le t<4$.',
         'Recompute the average power using the period $-2\\le t<2$, and confirm the two agree.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-4.6,8.6],yr:[-1.6,3.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    const pulse=t=>{let u=((t%4)+4)%4; return u<1?3:-1;};
    a.curve(pulse,{color:C.in,n:2600}); return a.svg();},
  sol:'<b>Given.</b> A two-level periodic pulse: $3$ for one quarter of the period, $-1$ for the other three quarters.<br>'
     +'<b>Find.</b> The average power, computed over two different choices of one period.<br>'
     +'<b>Method.</b> $P=\\dfrac{1}{T_0}\\displaystyle\\int_{T_0}|x(t)|^{2}\\,\\d t$ over any one full period; the integrand is periodic, so the choice of window cannot change the answer.<br>'
     +'<b>Solution — part (a).</b> Over $[0,4)$, $x^2$ equals $9$ on $(0,1)$ and $1$ on $(1,4)$:$$P=\\frac14\\left[\\int_0^19\\,\\d t+\\int_1^41\\,\\d t\\right]=\\frac14\\bigl[9+3\\bigr]=3\\;\\text{W}.$$'
     +'<b>Solution — part (b).</b> Over $[-2,2)$ the same signal reads: $x=-1$ on $(-2,0)$, $x=3$ on $(0,1)$, $x=-1$ on $(1,2)$. So $x^2$ is $1$ on an interval of length $2$ and $9$ on an interval of length $1$:$$P=\\frac14\\left[\\int_{-2}^{0}1\\,\\d t+\\int_0^19\\,\\d t+\\int_1^21\\,\\d t\\right]=\\frac14\\bigl[2+9+1\\bigr]=3\\;\\text{W}.$$'
     +'<b>Check.</b> Both windows give $P=3$ W. Each window covers every part of one period exactly once, although the parts occur in a different order. The result also lies between the two possible values of $|x|^2$, $1$ and $9$, as an average must.',
  err:'Reusing the window $[0,4)$ for part (b) instead of re-deriving where each level of $x(t)$ falls inside $[-2,2)$, which silently repeats part (a) rather than providing an independent check.',
  teach:'Insist that part (b) is worked from a fresh sketch of the signal on $[-2,2)$, not by relabelling the integral of part (a). The check is only worth something if the second computation could have disagreed.' },

{ id:'D4-07', module:'M4', type:'fs-power', src:'MT2 Q1',
  stem:'A periodic sequence has $N=4$ and one period given by $$x[0]=1,\\quad x[1]=2,\\quad x[2]=-1,\\quad x[3]=2.$$',
  parts:['Find $a_k$ for $k=0,1,2,3$ using the analysis sum.',
         'Find the average power directly in the time domain.',
         'Confirm the same value using Parseval\'s relation.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-8.6,8.6],yr:[-2.6,3.4],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:2,ystep:1});
    a.stem(disc(n=>{const m=((n%4)+4)%4; return [1,2,-1,2][m];},-8,8),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A period-$4$ sequence, symmetric about $n=0$: $x[1]=x[3]$.<br>'
     +'<b>Find.</b> All four coefficients, and the average power by two routes.<br>'
     +'<b>Method.</b> $a_k=\\dfrac1N\\displaystyle\\sum_{n=0}^{N-1}x[n]e^{-jk(2\\pi/N)n}$, with $N=4$ so the exponentials take only the values $1,-j,-1,j$.<br>'
     +'<b>Solution — part (a).</b>$$a_0=\\frac{1+2-1+2}{4}=1.$$$$a_1=\\frac14\\bigl[1+2(-j)+(-1)(-1)+2(j)\\bigr]=\\frac14\\bigl[1-2j+1+2j\\bigr]=\\frac12.$$$$a_2=\\frac14\\bigl[1+2(-1)+(-1)(1)+2(-1)\\bigr]=\\frac14\\bigl[1-2-1-2\\bigr]=-1.$$$$a_3=\\frac14\\bigl[1+2(j)+(-1)(-1)+2(-j)\\bigr]=\\frac14\\bigl[1+2j+1-2j\\bigr]=\\frac12.$$'
     +'<b>Solution — part (b).</b>$$P=\\frac14\\bigl[1^2+2^2+(-1)^2+2^2\\bigr]=\\frac{1+4+1+4}{4}=\\frac{10}{4}=2.5\\;\\text{W}.$$'
     +'<b>Solution — part (c).</b>$$\\sum_{k=0}^{3}|a_k|^2=1^2+0.5^2+(-1)^2+0.5^2=1+0.25+1+0.25=2.5\\;\\text{W}.$$'
     +'<b>Check.</b> The two routes agree. $a_1=a_3=a_{-1}$, exactly as expected: the sequence is real and symmetric about $n=0$ ($x[1]=x[3]$, i.e. $x[-1]=x[1]$), so its coefficients must be real and satisfy $a_{-k}=a_k$, and $a_3=a_{-1}=a_1$ checks that without repeating the sum.',
  err:'Computing $a_2$ as $\\tfrac14[1+2+(-1)+2]=1$ by using $e^{-jk\\pi n/2}$ with $k=2$ evaluated only at $n=0$ throughout, instead of alternating the sign correctly as $1,-1,1,-1$ for $n=0,1,2,3$.',
  teach:'Ask for the four powers of $-j$ — $1,-j,-1,j$ — to be written down once, on their own, before any coefficient is summed. Every sign error in this style of question traces back to reusing the wrong power.' },

{ id:'D4-08', module:'M4', type:'fs-power',
  stem:'A periodic signal has $T_0=2$ and equals $x(t)=1-|t|$ for $-1\\le t\\le1$ inside one period — the triangular pulse whose coefficients are $a_0=\\tfrac12$ and $a_k=\\dfrac{1-(-1)^k}{(k\\pi)^2}$ for $k\\neq0$.',
  parts:['Find the average power $P$ directly, by integrating $x^2$ over one period.',
         'Find $P$ again as an infinite sum over the coefficients, using $\\displaystyle\\sum_{k\\ \\text{odd},\\,k\\ge1}\\frac{1}{k^4}=\\frac{\\pi^4}{96}$.',
         'Find the fraction of $P$ already captured by the DC term and the first harmonic alone, and compare with a signal that has a jump.'],
  sol:'<b>Given.</b> The triangular pulse and its known coefficients.<br>'
     +'<b>Find.</b> $P$ by direct integration and by Parseval, and how quickly the sum converges to it.<br>'
     +'<b>Method.</b> Direct integration of $x^2$ over one period; then Parseval\'s relation, summing the squared magnitudes; then compare a partial sum against the total.<br>'
     +'<b>Solution — part (a).</b>$$P=\\frac12\\int_{-1}^{1}(1-|t|)^2\\,\\d t=\\int_0^1(1-t)^2\\,\\d t=\\left[-\\frac{(1-t)^3}{3}\\right]_0^1=\\frac13\\;\\text{W}.$$'
     +'<b>Solution — part (b).</b> Only odd $k$ contribute, with $a_k=2/(k\\pi)^2$:$$P=a_0^2+2\\sum_{k\\ \\text{odd},\\,k\\ge1}\\left(\\frac{2}{(k\\pi)^2}\\right)^2=\\frac14+2\\cdot\\frac{4}{\\pi^4}\\cdot\\frac{\\pi^4}{96}=\\frac14+\\frac{8}{96}=\\frac14+\\frac{1}{12}=\\frac13\\;\\text{W}.$$'
     +'<b>Solution — part (c).</b> Keeping only $k=0,\\pm1$: captured power $=a_0^2+2a_1^2=\\tfrac14+2\\left(\\tfrac{2}{\\pi^2}\\right)^2\\approx0.2500+0.0821=0.3321$ W, against a total of $\\tfrac13\\approx0.3333$ W — about $99.6\\%$ of the power in just two terms. A signal with a jump has coefficients decaying only as $1/k$, so its power sum converges far more slowly, and the same fraction there would need many more harmonics.<br>'
     +'<b>Check.</b> The two computations of $P$ in parts (a) and (b) agree exactly at $\\tfrac13$ W, one from the time domain and one from an infinite harmonic sum evaluated with a closed-form identity — genuinely independent routes. The discarded power after two terms, $\\tfrac13-0.3321\\approx0.0012$ W, is the tail $\\sum_{|k|\\ge3}|a_k|^2$; since each further term is smaller than $\\bigl(2/(3\\pi)^2\\bigr)^2\\approx0.0005$, a handful of harmonics already account for essentially all of it, exactly because the coefficients decay as $1/k^2$ rather than $1/k$.',
  err:'Reporting that the DC term and first harmonic capture "almost nothing" of the power by comparing $|a_1|^2\\approx0.041$ against $a_0=0.5$ directly instead of against $a_0^2=0.25$ — comparing an amplitude to a squared quantity.',
  teach:'This question is the reason the decay rate of $a_k$ matters practically, not just aesthetically: it is the number that decides how many harmonics a working approximation actually needs.' },

{ id:'D4-09', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'An LTI system has impulse response $h(t)=5e^{-5t}u(t)$.',
  parts:['Find the frequency response $H(j\\omega)$.',
         'Find $|H(j\\omega)|$ and $\\angle H(j\\omega)$ in closed form.',
         'Plot the magnitude spectrum, and evaluate it at $\\omega=5$ rad/s.'],
  sol:'<b>Given.</b> A first-order causal impulse response with a unit-area steady value, $\\int_0^\\infty h(t)\\,\\d t=1$.<br>'
     +'<b>Find.</b> $H(j\\omega)$, its magnitude and phase, and one numerical value.<br>'
     +'<b>Method.</b> $H(j\\omega)=\\displaystyle\\int_{-\\infty}^{\\infty}h(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau$, evaluated directly since $h$ is causal and exponential.<br>'
     +'<b>Solution — part (a).</b>$$H(j\\omega)=\\int_0^\\infty5e^{-5\\tau}e^{-j\\omega\\tau}\\,\\d\\tau=\\frac{5}{5+j\\omega}.$$'
     +'<b>Solution — part (b).</b>$$|H(j\\omega)|=\\frac{5}{\\sqrt{25+\\omega^2}},\\qquad\\angle H(j\\omega)=-\\arctan\\!\\left(\\frac{\\omega}{5}\\right).$$'
     +'<b>Solution — part (c).</b> At $\\omega=5$: $|H(j5)|=\\dfrac{5}{\\sqrt{50}}=\\dfrac{1}{\\sqrt2}\\approx0.7071$, and $\\angle H(j5)=-\\arctan(1)=-\\dfrac{\\pi}{4}$ rad. The magnitude falls from $1$ at $\\omega=0$ toward $0$ as $\\omega\\to\\infty$: a low-pass filter.<br>'
     +'<b>Check.</b> $H(j0)=\\int_0^\\infty h(\\tau)\\,\\d\\tau=5\\cdot\\tfrac15=1$, matching the formula\'s value at $\\omega=0$ and confirming the DC gain is exactly the area under $h$. At $\\omega=5$, equal to the decay rate, the magnitude drops to exactly $1/\\sqrt2$ — the frequency at which a first-order low-pass always halves its power, since $|H|^2=\\tfrac12$ there.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-1,25],yr:[-0.05,1.15],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',
      pad:{l:60,r:28,t:32,b:38},xstep:5,ystep:0.25});
    a.curve(w=>5/Math.sqrt(25+w*w),{color:C.h,n:1200});
    a.vline(5,{color:C.muted,opacity:.5});
    return a.svg();},
  err:'Writing $H(j\\omega)=\\dfrac{1}{5+j\\omega}$, dropping the factor of $5$ in the numerator that comes from the height of $h(t)$, which gives $H(j0)=1/5$ instead of the correct DC gain of $1$.',
  teach:'Ask for $H(j0)$ to be checked against $\\int h\\,\\d t$ before the magnitude is plotted. The two must agree for any system, and it is the fastest way to catch a missing scale factor.' },

{ id:'D4-10', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'The periodic signal $x(t)=2+3\\cos(4t)$ is the input to an LTI system with impulse response $h(t)=3e^{-3t}u(t)$.',
  parts:['Find the frequency response $H(j\\omega)$.',
         'Find the Fourier series coefficients of $x(t)$.',
         'Find the Fourier series coefficients of the output $y(t)$.',
         'Write $y(t)$ in real form.'],
  sol:'<b>Given.</b> A DC term plus one sinusoid at $4$ rad/s, into a first-order system.<br>'
     +'<b>Find.</b> $H$, the input and output coefficients, and $y(t)$.<br>'
     +'<b>Method.</b> Complex exponentials are eigenfunctions, so $b_k=a_kH(jk\\omega_0)$ — one product per harmonic, never a convolution.<br>'
     +'<b>Solution — part (a).</b>$$H(j\\omega)=\\int_0^\\infty3e^{-3\\tau}e^{-j\\omega\\tau}\\,\\d\\tau=\\frac{3}{3+j\\omega}.$$'
     +'<b>Solution — part (b).</b> Here $\\omega_0=4$, $a_0=2$, $a_{\\pm1}=1.5$.<br>'
     +'<b>Solution — part (c).</b> $H(0)=1$ and $H(j4)=\\dfrac{3}{3+4j}=\\dfrac{3(3-4j)}{25}=0.36-0.48j$, with $|H(j4)|=0.6$ and $\\angle H(j4)=-\\arctan(4/3)\\approx-0.9273$ rad. So$$b_0=2\\cdot1=2,\\qquad b_1=1.5\\,(0.36-0.48j)=0.54-0.72j,\\qquad|b_1|=0.9,\\quad\\angle b_1\\approx-0.9273.$$'
     +'<b>Solution — part (d).</b>$$y(t)=2+1.8\\cos(4t-0.9273).$$'
     +'<b>Check.</b> Convolving directly, $y(t)=\\displaystyle\\int_0^\\infty3e^{-3\\tau}x(t-\\tau)\\,\\d\\tau$, evaluated numerically at $t=0$ gives $3.08$ and at $t=1$ gives $0.2043$, matching $2+1.8\\cos(-0.9273)\\approx3.08$ and $2+1.8\\cos(4-0.9273)\\approx0.2043$ from the closed form above — a route through the time-domain convolution integral entirely independent of the eigenfunction argument.',
  err:'Convolving the coefficients with $H$ instead of multiplying, for instance writing $b_1=a_1*H(j4)$ as though the two had to be combined the way $x$ and $h$ are in the time domain. The eigenfunction property turns the frequency-domain operation into a plain product.',
  teach:'Ask for $H(0)$ and $|H(j4)|$ to be stated as two plain numbers before $b_0$ and $b_1$ are formed. A student who cannot separate "evaluate $H$" from "multiply by $a_k$" will conflate the two steps.' },

{ id:'D4-11', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'A discrete-time LTI system has impulse response $$h[n]=0.25\\,\\delta[n]+0.5\\,\\delta[n-1]+0.25\\,\\delta[n-2].$$',
  parts:['Find $H(e^{j\\omega})$.',
         'Show that $|H(e^{j\\omega})|=\\cos^2(\\omega/2)$, and plot the magnitude spectrum over one period.',
         'Evaluate $H$ at $\\omega=0$ and at $\\omega=\\pi$, and say what kind of filter this is.'],
  figure:()=>{const a=P.Axes({w:1080,h:230,xr:[-2.4,4.4],yr:[-0.15,0.75],xlabel:'n',ylabel:'h[n]',
      pad:{l:50,r:28,t:28,b:34},xstep:1,ystep:0.25});
    a.stem([[0,0.25],[1,0.5],[2,0.25]],{color:C.h}); return a.svg();},
  sol:'<b>Given.</b> A three-tap discrete-time filter with symmetric weights.<br>'
     +'<b>Find.</b> $H(e^{j\\omega})$ in closed form, and two of its values.<br>'
     +'<b>Method.</b> $H(e^{j\\omega})=\\displaystyle\\sum_nh[n]e^{-j\\omega n}$, a finite sum here since $h[n]$ has only three non-zero samples. Factor an exponential out to expose a real envelope.<br>'
     +'<b>Solution — part (a).</b>$$H(e^{j\\omega})=0.25+0.5e^{-j\\omega}+0.25e^{-j2\\omega}=e^{-j\\omega}\\bigl(0.25e^{j\\omega}+0.5+0.25e^{-j\\omega}\\bigr)=e^{-j\\omega}\\bigl(0.5+0.5\\cos\\omega\\bigr).$$'
     +'<b>Solution — part (b).</b> Using $1+\\cos\\omega=2\\cos^2(\\omega/2)$,$$H(e^{j\\omega})=e^{-j\\omega}\\cos^2(\\omega/2),$$and since $\\cos^2(\\omega/2)\\ge0$ for every $\\omega$, this <em>is</em> the magnitude: $|H(e^{j\\omega})|=\\cos^2(\\omega/2)$, with $\\angle H(e^{j\\omega})=-\\omega$.<br>'
     +'<b>Solution — part (c).</b> $H(e^{j0})=\\cos^2(0)=1$, and $H(e^{j\\pi})=\\cos^2(\\pi/2)=0$: the taps pass a constant unchanged and remove the fastest-alternating sequence entirely. This is a <b>low-pass</b> filter.<br>'
     +'<b>Check.</b> Summing the taps directly at $\\omega=\\pi$, where $e^{-j\\pi n}=(-1)^n$: $0.25(1)+0.5(-1)+0.25(1)=0.25-0.5+0.25=0$, matching part (c) without using the closed form at all. The three weights sum to $1$, which is exactly $H(e^{j0})$, the two facts being the same statement at the two ends of one period.',
  figSol:()=>{const a=P.Axes({w:1080,h:280,xr:[-Math.PI,Math.PI],yr:[-0.08,1.15],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',
      pad:{l:60,r:28,t:32,b:38},xstep:1,ystep:0.25});
    a.curve(w=>Math.cos(w/2)**2,{color:C.h,n:900});
    return a.svg();},
  err:'Reporting $|H(e^{j\\omega})|=|0.5+0.5\\cos\\omega|$ and leaving the absolute value in place, treating it as though it could go negative, then plotting a spurious fold in the curve near $\\omega=\\pi$ where $\\cos^2(\\omega/2)$ is in fact smooth and already non-negative.',
  teach:'Ask why factoring out $e^{-j\\omega}$ was the useful move here, rather than expanding everything in sines and cosines from the start. Isolating a real, non-negative envelope is what makes the magnitude and phase read off directly.' },

{ id:'D4-12', module:'M4', type:'fs-lti', src:'MT2 Q2',
  stem:'The periodic sequence $x[n]=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$ is the input to a discrete-time LTI system with impulse response $h[n]=0.6\\,\\delta[n]+0.4\\,\\delta[n-1]$.',
  parts:['Find the fundamental period $N$ and the coefficients $a_k$ of $x[n]$.',
         'Find $H(e^{j\\omega})$ and evaluate it at $\\omega=\\omega_0$.',
         'Find the output coefficients and write $y[n]$ in real form.',
         'Plot $y[n]$ as a stem for $-8\\le n\\le8$.'],
  figure:()=>{const a=P.Axes({w:1080,h:230,xr:[-8.6,8.6],yr:[-1.5,1.5],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:28,b:34},xstep:2,ystep:1});
    a.stem(disc(n=>Math.cos(Math.PI*n/2),-8,8),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A period-$4$ cosine sequence into a two-tap filter.<br>'
     +'<b>Find.</b> The input coefficients, $H$, the output coefficients, and $y[n]$.<br>'
     +'<b>Method.</b> Read $a_k$ off Euler\'s formula directly, then multiply by $H$ evaluated at the one harmonic present.<br>'
     +'<b>Solution — part (a).</b> $x[n]=\\cos(\\omega_0n)$ with $\\omega_0=\\pi/2$, so $N=4$, and $a_1=a_{-1}=0.5$, with $a_0=a_2=0$.<br>'
     +'<b>Solution — part (b).</b>$$H(e^{j\\omega})=0.6+0.4e^{-j\\omega},\\qquad H(e^{j\\pi/2})=0.6-0.4j.$$Here $|H(e^{j\\pi/2})|=\\sqrt{0.36+0.16}=\\sqrt{0.52}=\\dfrac{\\sqrt{13}}{5}\\approx0.7211$ and $\\angle H(e^{j\\pi/2})=-\\arctan(2/3)\\approx-0.5880$ rad.<br>'
     +'<b>Solution — part (c).</b>$$b_1=a_1H(e^{j\\pi/2})=0.5(0.6-0.4j)=0.3-0.2j,\\qquad|b_1|\\approx0.3606,\\quad\\angle b_1\\approx-0.5880.$$So$$y[n]=2|b_1|\\cos(\\omega_0n+\\angle b_1)\\approx0.7211\\cos\\!\\left(\\frac{\\pi}{2}n-0.5880\\right).$$'
     +'<b>Check.</b> Convolving directly, $y[n]=0.6x[n]+0.4x[n-1]$, using $x[n]=1,0,-1,0$ for $n=0,1,2,3$: $y[0]=0.6(1)+0.4(0)=0.6$, $y[1]=0.6(0)+0.4(1)=0.4$, $y[2]=0.6(-1)+0.4(0)=-0.6$, $y[3]=0.6(0)+0.4(-1)=-0.4$. The closed form gives $0.7211\\cos(-0.588)=0.600$, $0.7211\\cos(\\pi/2-0.588)=0.400$, $0.7211\\cos(\\pi-0.588)=-0.600$, $0.7211\\cos(3\\pi/2-0.588)=-0.400$ — matching at every sample.',
  figSol:()=>{const a=P.Axes({w:1080,h:250,xr:[-8.6,8.6],yr:[-0.85,0.85],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:2,ystep:0.25});
    a.stem(disc(n=>0.720625*Math.cos(Math.PI*n/2-0.588003),-8,8),{color:C.out}); return a.svg();},
  err:'Writing the amplitude as $|b_1|$ instead of $2|b_1|$ in the real form, halving $y[n]$ throughout — the same pairing mistake that a real output built from a conjugate pair always risks.',
  teach:'Have the direct convolution of the Check step done first, on paper, before the eigenfunction route is trusted. Four numbers computed by hand settle the question of whether the factor of two was applied correctly.' },

{ id:'D4-13', module:'M4', type:'fs-dt', src:'MT2 Q1',
  stem:'Let $$x[n]=3\\cos\\!\\left(\\tfrac{\\pi}{4}n\\right)-\\sin\\!\\left(\\tfrac{2\\pi}{3}n\\right).$$',
  parts:['Find the fundamental period $N_0$ and $\\omega_0$, and state which harmonic each term is.',
         'Find every non-zero coefficient.',
         'Plot $|a_k|$ over one period, $-12\\le k\\le11$.'],
  sol:'<b>Given.</b> A sum of two discrete-time sinusoids.<br>'
     +'<b>Find.</b> $N_0$ and the coefficients.<br>'
     +'<b>Method.</b> A discrete-time sinusoid of frequency $\\omega$ repeats when $N=(2\\pi/\\omega)k$ is a positive integer for some integer $k$; take the least common multiple of the two component periods, then expand with Euler\'s formulas.<br>'
     +'<b>Solution — part (a).</b> For $\\omega=\\pi/4$: $N=8k$, first integer at $k=1$, giving $N_1=8$. For $\\omega=2\\pi/3$: $N=3k$, first integer at $k=1$, giving $N_2=3$. So $N_0=\\operatorname{lcm}(8,3)=24$ and $\\omega_0=2\\pi/24=\\pi/12$. The first term sits at $\\pi/4=3\\omega_0$: the third harmonic. The second sits at $2\\pi/3=8\\omega_0$: the eighth harmonic.<br>'
     +'<b>Solution — part (b).</b> $3\\cos(3\\omega_0n)=1.5\\,e^{j3\\omega_0n}+1.5\\,e^{-j3\\omega_0n}$ gives $a_3=a_{-3}=1.5$. And $-\\sin(8\\omega_0n)=-\\dfrac{1}{2j}\\bigl(e^{j8\\omega_0n}-e^{-j8\\omega_0n}\\bigr)=\\dfrac{j}{2}e^{j8\\omega_0n}-\\dfrac{j}{2}e^{-j8\\omega_0n}$ gives $a_8=0.5j$, $a_{-8}=-0.5j$. Every other coefficient in one period is zero.<br>'
     +'<b>Check.</b> The signal is real, and $a_{-k}=a_k^{*}$ holds: $\\overline{1.5}=1.5$ and $\\overline{0.5j}=-0.5j$. As a further check, $a_{-8}$ can be read directly as $a_{16}$ by periodicity ($-8\\equiv16\\pmod{24}$), and $16=24-8$ is on the opposite side of the period from $8$, exactly where the negative-index partner of an eighth-harmonic term must sit.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-13,12],yr:[-0.3,2],xlabel:'k',ylabel:'|a_k|',
      pad:{l:50,r:26,t:32,b:34},xstep:4,ystep:0.5});
      a.stem([[-8,0.5],[-3,1.5],[3,1.5],[8,0.5]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-13,12],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',
      pad:{l:62,r:26,t:32,b:34},xstep:4,
      yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
      a.stem([[-8,Math.PI/2],[-3,0],[3,0],[8,-Math.PI/2]],{color:C.mid,showZero:true}); return a.svg();})()),
  err:'Taking $N_0=8\\times3=24$ correctly but then indexing both terms against $\\omega_0=2\\pi/8$ (the first term\'s own frequency), which mislabels the second term\'s harmonic number.',
  teach:'Insist that the harmonic number of each term — here third and eighth — is stated in words before any coefficient is written down. It is the step that most often goes silently wrong.' },

{ id:'D4-14', module:'M4', type:'fs-dt', src:'MT2 Q1',
  stem:'A periodic sequence has $N=6$ and equals $1,1,0,0,0,1$ for $n=0,1,2,3,4,5$ inside one period.',
  parts:['List $x[n]$ for one full period and identify which samples are non-zero.',
         'Find $a_k$ for $k=0,1,2,3$ using the analysis sum.',
         'Plot $|a_k|$ over one period and confirm $a_0$ equals the mean of the sequence.'],
  figure:()=>{const a=P.Axes({w:1080,h:230,xr:[-6.6,11.6],yr:[-0.3,1.4],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:28,b:34},xstep:2,ystep:0.5});
    a.stem(disc(n=>{const m=((n%6)+6)%6; return (m===0||m===1||m===5)?1:0;},-6,11),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A period-$6$ sequence, three ones and three zeros in an asymmetric pattern.<br>'
     +'<b>Find.</b> Four coefficients, and a check against the mean.<br>'
     +'<b>Method.</b> $\\omega_0=2\\pi/6=\\pi/3$. The analysis sum runs over the six samples $n=0,\\dots,5$, and only $n=0,1,5$ contribute.<br>'
     +'<b>Solution — part (a).</b> $x[0]=1$, $x[1]=1$, $x[2]=0$, $x[3]=0$, $x[4]=0$, $x[5]=1$: three non-zero samples, at $n=0,1,5$.<br>'
     +'<b>Solution — part (b).</b> $$a_k=\\frac16\\bigl[1+e^{-jk\\pi/3}+e^{-jk5\\pi/3}\\bigr]=\\frac16\\bigl[1+2\\cos(k\\pi/3)\\bigr],$$since $e^{-jk5\\pi/3}=e^{jk\\pi/3}$ (as $5\\pi/3\\equiv-\\pi/3\\pmod{2\\pi}$). Evaluating,$$a_0=\\frac{1+2}{6}=\\frac12,\\qquad a_1=\\frac{1+1}{6}=\\frac13,\\qquad a_2=\\frac{1-1}{6}=0,\\qquad a_3=\\frac{1-2}{6}=-\\frac16.$$'
     +'<b>Solution — part (c).</b> By periodicity, $a_4=a_{-2}=0$ and $a_5=a_{-1}=\\tfrac13$, so the six coefficients over one period are $\\tfrac12,\\tfrac13,0,-\\tfrac16,0,\\tfrac13$, all real.<br>'
     +'<b>Check.</b> The mean of the six samples is $\\tfrac{1+1+0+0+0+1}{6}=\\tfrac12$, matching $a_0$ exactly. A second check on $a_3$: summing directly with $e^{-jk\\pi n}$ at $k=3$, which alternates $1,-1,1,-1,1,-1$ over $n=0,\\dots,5$, gives $\\tfrac16\\bigl[1(1)+1(-1)+0+0+0+1(-1)\\bigr]=\\tfrac16(1-1-1)=-\\tfrac16$, matching part (b) by a route that never uses the cosine identity.',
  figSol:()=>{const ak=k=>k===0?0.5:(1+2*Math.cos(k*Math.PI/3))/6;
    const a=P.Axes({w:1080,h:280,xr:[-6.6,5.6],yr:[-0.05,0.62],xlabel:'k',ylabel:'|a_k|',
      pad:{l:56,r:28,t:32,b:34},xstep:1,ystep:0.2});
    a.stem(disc(k=>Math.abs(ak(k)),-6,5),{color:C.in,showZero:true}); return a.svg();},
  err:'Averaging over only the three non-zero samples and dividing by $3$ instead of $N=6$, which reports $a_0=1$ rather than $\\tfrac12$.',
  teach:'Ask for the mean of the full six-sample period, zeros included, before any coefficient is computed. It fixes $a_0$ immediately and is the cheapest check available for this whole family of questions.' },

{ id:'D4-15', module:'M4', type:'fs-dt',
  stem:'A real periodic sequence $x[n]$ has fundamental period $N=5$. Its only non-zero coefficients are $$a_0=2,\\qquad a_1=1+j,\\qquad a_4=1-j.$$',
  parts:['Using the conjugate-pair reassembly, write $x[n]$ as a single real cosine plus a constant.',
         'Evaluate $x[0]$ directly from the three given coefficients, and from the real form.'],
  sol:'<b>Given.</b> Three coefficients of a period-$5$ sequence; note $a_4=a_{-1}$ by periodicity, so $a_1$ and $a_4$ are in fact the conjugate pair at $k=\\pm1$.<br>'
     +'<b>Find.</b> The real closed form, and $x[0]$ by two routes.<br>'
     +'<b>Method.</b> With $\\omega_0=2\\pi/5$, pair $a_1$ with $a_{-1}=a_4$ and use $2|a_1|\\cos(\\omega_0n+\\angle a_1)$; $a_0$ stands alone.<br>'
     +'<b>Solution — part (a).</b> $|a_1|=\\sqrt2$, $\\angle a_1=\\pi/4$, so$$x[n]=2+2\\sqrt2\\cos\\!\\left(\\frac{2\\pi}{5}n+\\frac{\\pi}{4}\\right).$$'
     +'<b>Solution — part (b).</b> Directly: $x[0]=a_0+a_1+a_4=2+(1+j)+(1-j)=4$. From the real form: $x[0]=2+2\\sqrt2\\cos(\\pi/4)=2+2\\sqrt2\\cdot\\tfrac{\\sqrt2}{2}=2+2=4$. The two agree exactly.<br>'
     +'<b>Check.</b> Evaluate $x[1]$ as a further, independent test. Directly, with $\\omega_0=2\\pi/5\\approx1.2566$: $a_1e^{j\\omega_0}+a_4e^{-j\\omega_0}=(1+j)(0.3090+0.9511j)+(1-j)(0.3090-0.9511j)\\approx-0.6421+1.2601j-0.6421-1.2601j=-1.2842$, so $x[1]\\approx2-1.2842=0.7158$. From the real form: $2+2\\sqrt2\\cos(1.2566+\\pi/4)=2+2.8284\\cos(2.0396)\\approx2-1.2841=0.7159$. The two agree to four significant figures.',
  err:'Treating $a_1$ and $a_4$ as two unrelated non-zero coefficients rather than recognising $a_4=a_{-1}$ by periodicity, and then trying to pair $a_1$ with a non-existent $a_{-1}=0$, which drops the entire oscillating term from the reconstruction.',
  teach:'Ask which index is really $a_{-1}$ before any pairing is attempted. In a period-$N$ series, $a_{N-1}$ is always $a_{-1}$, and missing that identification is the single most common error in this style of question.' },

{ id:'D4-16', module:'M4', type:'fs-dt',
  stem:'The period-$6$ sequence $x[0]=1,x[1]=1,x[2]=0,x[3]=0,x[4]=0,x[5]=1$ has Fourier series coefficients $a_0=\\tfrac12$, $a_1=a_5=\\tfrac13$, $a_2=a_4=0$, $a_3=-\\tfrac16$.',
  parts:['Reconstruct $x[0]$ using the synthesis sum over all six coefficients, and confirm it equals the given value.',
         'Reconstruct $x[2]$ the same way, using all six coefficients.',
         'Set $a_3$ to zero, keep the other five coefficients unchanged, and recompute $x[2]$. State the size of the resulting error.'],
  sol:'<b>Given.</b> The full set of six coefficients of a period-$6$ sequence.<br>'
     +'<b>Find.</b> Two exact reconstructions, and the effect of dropping one coefficient.<br>'
     +'<b>Method.</b> The synthesis sum $x[n]=\\displaystyle\\sum_{k=0}^{5}a_ke^{jk\\omega_0n}$, with $\\omega_0=\\pi/3$, is a finite sum of exactly six terms — nothing is truncated unless a term is deliberately removed.<br>'
     +'<b>Solution — part (a).</b> At $n=0$ every exponential is $1$:$$x[0]=a_0+a_1+a_2+a_3+a_4+a_5=\\frac12+\\frac13+0-\\frac16+0+\\frac13=1,$$matching the given value exactly.<br>'
     +'<b>Solution — part (b).</b> At $n=2$, $k\\omega_0n=2k\\pi/3$. Using $a_2=a_4=0$, only $k=0,1,3,5$ contribute:$$x[2]=\\frac12+\\frac13e^{j4\\pi/3}+\\left(-\\frac16\\right)e^{j4\\pi}+\\frac13e^{j20\\pi/3}=\\frac12+\\frac13e^{j4\\pi/3}-\\frac16+\\frac13e^{j2\\pi/3}.$$Since $e^{j4\\pi/3}=-\\tfrac12-\\tfrac{\\sqrt3}{2}j$ and $e^{j2\\pi/3}=-\\tfrac12+\\tfrac{\\sqrt3}{2}j$, the imaginary parts cancel and$$x[2]=\\frac12-\\frac16-\\frac13\\cdot\\frac12-\\frac13\\cdot\\frac12=\\frac12-\\frac16-\\frac16-\\frac16=0,$$matching the given value.<br>'
     +'<b>Solution — part (c).</b> With $a_3$ set to $0$, the $-\\tfrac16$ term in part (b) disappears, leaving $x[2]\\approx\\tfrac16\\approx0.1667$ instead of $0$: an error of $\\tfrac16$, a sixth of the total, from dropping a single one of six terms.<br>'
     +'<b>Check.</b> A discrete-time Fourier series has no meaningful notion of "keeping only the first few harmonics" of the kind that shrinks smoothly in continuous time: there is no infinite tail to make negligible, only $N$ terms in total, and every one of them is needed for the identity to hold exactly. Reconstructing $x[0]$ in part (a) confirms this from the other end of the period: all six terms together give the exact value $1$, with no leftover error to report.',
  err:'Assuming that since $a_3=-\\tfrac16$ is the smallest-magnitude coefficient after $a_0$, dropping it should leave only a small error comparable to the size of $a_3$ itself — the same intuition that governs continuous-time truncation, which does not transfer here because the discrete series has no tail beyond $k=5$.',
  teach:'Contrast this directly with a continuous-time partial sum: there, dropping a high harmonic leaves an error bounded by the discarded tail and shrinking as more terms are kept. Here, every coefficient is load-bearing, and dropping any one of the six produces an error of comparable size regardless of which one is dropped.' },

{ id:'D4-17', module:'M4', type:'fs-op',
  stem:'A real periodic signal $x(t)$ has fundamental angular frequency $\\omega_0=\\pi$ rad/s and coefficients $a_1=2$, $a_2=1-j$ (with $a_{-1}=2$, $a_{-2}=1+j$ by conjugate symmetry). Let $y(t)=x(t-t_0)$ with $t_0=0.5$ s.',
  parts:['State the general time-shift property, with the correct sign in the exponent.',
         'Compute $b_1$ and $b_2$, and confirm $|b_k|=|a_k|$ for both.',
         'Compute $\\angle b_2-\\angle a_2$ and confirm it equals $-2\\omega_0t_0$, modulo $2\\pi$.'],
  sol:'<b>Given.</b> Two coefficients of a real signal, and a delay of half a second.<br>'
     +'<b>Find.</b> The shifted coefficients, and a check on their magnitude and phase.<br>'
     +'<b>Method.</b> $x(t-t_0)\\leftrightarrow a_ke^{-jk\\omega_0t_0}$; the modulus of the multiplying factor is always $1$, so only the phase can change.<br>'
     +'<b>Solution — part (a).</b>$$b_k=a_k\\,e^{-jk\\omega_0t_0}.$$'
     +'<b>Solution — part (b).</b> With $\\omega_0t_0=\\pi/2$: $b_1=2\\,e^{-j\\pi/2}=2(-j)=-2j$, so $|b_1|=2=|a_1|$. And $b_2=(1-j)\\,e^{-j\\pi}=(1-j)(-1)=-1+j$, so $|b_2|=\\sqrt2=|1-j|=|a_2|$. Both magnitudes are unchanged, as the property requires.<br>'
     +'<b>Solution — part (c).</b> $\\angle a_2=-\\pi/4$ and $\\angle b_2=\\angle(-1+j)=3\\pi/4$, so $\\angle b_2-\\angle a_2=3\\pi/4-(-\\pi/4)=\\pi$. And $-2\\omega_0t_0=-2\\pi\\cdot0.5=-\\pi\\equiv\\pi\\pmod{2\\pi}$. The two agree.<br>'
     +'<b>Check.</b> Build the partial signal from just these two harmonics: $x(t)=2\\cos(\\pi t)+2\\bigl[\\cos(2\\pi t)+\\sin(2\\pi t)\\bigr]$ using $a_2,a_{-2}$, giving $x(0)=2+2=4$... more directly, summing all four raw coefficients at $t=0$: $a_1+a_{-1}+a_2+a_{-2}=2+2+(1-j)+(1+j)=6$. Then $y(0)=x(-0.5)$, computed the same way with the shifted coefficients: $b_1+b_{-1}+b_2+b_{-2}=-2j+2j+(-1+j)+(-1-j)=-2$. Evaluating $x(-0.5)$ directly from the unshifted signal at $t=-0.5$ gives the same value, $-2$ — the shift property and a direct time-domain substitution agree.',
  err:'Writing $b_k=a_ke^{+jk\\omega_0t_0}$ with the wrong sign, which still preserves $|b_k|=|a_k|$ — so the check in part (b) alone would not catch it — but reverses the direction every phase tilts, giving a signal advanced rather than delayed.',
  teach:'Part (c) is the check that a sign error in part (a) cannot survive: computing $\\angle b_2-\\angle a_2$ two ways, from the coefficients and from $-2\\omega_0t_0$, only agrees when the exponent carries the correct sign.' },

{ id:'D4-18', module:'M4', type:'fs-op',
  stem:'A periodic signal $x(t)$ with fundamental angular frequency $\\omega_0=5$ rad/s is real and even: $x(t)=x(-t)$ for every $t$, and $x(t)$ is real-valued.',
  parts:['State what the time-reversal property alone gives for $a_{-3}$, in terms of $a_3$.',
         'State what conjugation (realness) alone gives for $a_{-3}$, in terms of $a_3$.',
         'Combine the two results to show that $a_3$ must be real, and decide whether $a_3=2-5j$ is a value $a_3$ could actually take.'],
  sol:'<b>Given.</b> A signal that is both real and even.<br>'
     +'<b>Find.</b> Whether a stated complex coefficient is consistent with those two properties together.<br>'
     +'<b>Method.</b> Apply the reversal property and the conjugation property separately, then compare what each one demands of the same coefficient.<br>'
     +'<b>Solution — part (a).</b> Time reversal gives $x(-t)\\leftrightarrow a_{-k}$. Since $x(-t)=x(t)$ as signals here, their coefficients must be identical term by term: $a_{-3}=a_3$.<br>'
     +'<b>Solution — part (b).</b> Conjugation gives $x^{*}(t)\\leftrightarrow a_{-k}^{*}$. Since $x$ is real, $x^{*}(t)=x(t)$, so $a_{-3}=a_3^{*}$.<br>'
     +'<b>Solution — part (c).</b> Combining, $a_3=a_{-3}=a_3^{*}$, so $a_3=a_3^{*}$, which forces $\\operatorname{Im}\\{a_3\\}=0$: $a_3$ must be real. The value $a_3=2-5j$ has $\\operatorname{Im}\\{a_3\\}=-5\\neq0$, so <b>it cannot be a coefficient of this signal</b>. A value such as $a_3=2$ is consistent; $a_3=2-5j$ is not, regardless of what the real part is.<br>'
     +'<b>Check.</b> Write $a_3=p+jq$ in Cartesian form directly. Evenness gives $a_{-3}=p+jq$ (the same number). Conjugation gives $a_{-3}=p-jq$. Equating the two expressions for $a_{-3}$, $p+jq=p-jq$, so $2jq=0$ and $q=0$ — the same conclusion, reached by comparing real and imaginary parts directly instead of composing the two abstract properties.',
  err:'Concluding that $a_3=2-5j$ is fine because it is consistent with realness alone ($a_{-3}=a_3^{*}=2+5j$ is a perfectly good complex number), without checking it against evenness as well — realness alone permits any $a_3$; it is the combination with evenness that is restrictive.',
  teach:'Ask which single property, reversal or conjugation, is being used at each step before the two are combined. Conflating them is the most common way this kind of consistency question is answered wrongly.' },

{ id:'D4-19', module:'M4', type:'fs-op',
  stem:'A periodic signal has $T_0=2$ and equals $x(t)=-1$ for $-1<t<0$ and $x(t)=1$ for $0<t<1$ inside one period: a real, odd, bipolar square wave.',
  parts:['State, without integrating, why $a_0=0$.',
         'Derive $a_k$ for $k\\neq0$ using the analysis equation, splitting the integral at $t=0$.',
         'Confirm every coefficient is purely imaginary, and plot the magnitude spectrum.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.4,3.4],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    const sq=t=>{let u=t-2*Math.round(t/2); return u<0?-1:1;};
    a.curve(sq,{color:C.in,n:2600}); return a.svg();},
  sol:'<b>Given.</b> A real, odd square wave with period $T_0=2$, so $\\omega_0=\\pi$.<br>'
     +'<b>Find.</b> Every coefficient, and their common symmetry.<br>'
     +'<b>Method.</b> An odd signal has zero mean, which settles $a_0$ immediately. For $k\\neq0$, split the analysis integral at the sign change and combine.<br>'
     +'<b>Solution — part (a).</b> The negative half of the period cancels the positive half exactly, so the average over one period is $0$: $a_0=0$.<br>'
     +'<b>Solution — part (b).</b>$$a_k=\\frac12\\left[\\int_{-1}^{0}(-1)e^{-jk\\pi t}\\,\\d t+\\int_0^1(1)e^{-jk\\pi t}\\,\\d t\\right]=\\frac{1}{2jk\\pi}\\Bigl[2-\\bigl(e^{jk\\pi}+e^{-jk\\pi}\\bigr)\\Bigr]=\\frac{1-\\cos(k\\pi)}{jk\\pi}=-j\\,\\frac{1-(-1)^k}{k\\pi}.$$'
     +'<b>Solution — part (c).</b> For odd $k$, $a_k=-\\dfrac{2j}{k\\pi}$; for even $k\\neq0$, $a_k=0$. Every non-zero coefficient is purely imaginary, because a real signal that is also odd forces $a_{-k}=a_k^{*}$ (realness) and $a_{-k}=-a_k$ (oddness) simultaneously, so $a_k^{*}=-a_k$ and $\\operatorname{Re}\\{a_k\\}=0$. Magnitudes: $|a_1|=2/\\pi\\approx0.6366$, $|a_3|=2/(3\\pi)\\approx0.2122$, decaying as $1/|k|$.<br>'
     +'<b>Check.</b> As $k\\to0$, $1-\\cos(k\\pi)\\approx(k\\pi)^2/2$, so $a_k\\approx-j(k\\pi)/2\\to0$, consistent with $a_0=0$ from part (a) by a limit rather than by symmetry. The general symmetry argument used in part (c) — real and odd forces purely imaginary — matches the concrete formula exactly: $-j(1-(-1)^k)/(k\\pi)$ has no real part at any $k$, by two independent routes to the same conclusion.',
  figSol:()=>{const ak=k=>k%2===0?0:2/(Math.abs(k)*Math.PI);
    const a=P.Axes({w:1080,h:280,xr:[-7.8,7.8],yr:[-0.08,0.85],xlabel:'k',ylabel:'|a_k|',
      pad:{l:56,r:28,t:32,b:34},xstep:1,ystep:0.2});
    a.stem(disc(ak,-7,7),{color:C.in,showZero:true}); return a.svg();},
  err:'Splitting the integral at $t=0$ but using the same sign for $x(t)$ on both halves, which produces $a_k=\\dfrac{\\sin(k\\pi)}{k\\pi}$ — a formula that is identically zero for every integer $k$, silently reporting a signal with no spectrum at all.',
  teach:'Ask for the symmetry argument of part (c) to be stated before the integral of part (b) is trusted. A student who derives "purely imaginary" abstractly first has something concrete to check the algebra against.' },

{ id:'D4-20', module:'M4', type:'fs-op',
  stem:'A real periodic signal $x(t)$ has fundamental angular frequency $\\omega_0=1$ rad/s. Its only non-zero coefficients are $$a_0=1,\\qquad a_3=2e^{j\\pi/3},\\qquad a_5=1-j.$$',
  parts:['Use conjugate symmetry to state $a_{-3}$ and $a_{-5}$.',
         'Write $x(t)$ in real closed form.',
         'Compute the average power two independent ways, and confirm they agree.'],
  sol:'<b>Given.</b> Three coefficients of a real signal.<br>'
     +'<b>Find.</b> The missing conjugate coefficients, the real form, and the power.<br>'
     +'<b>Method.</b> Realness alone gives $a_{-k}=a_k^{*}$; then reassemble each conjugate pair into a cosine, and check the power both from the coefficients and from the resulting amplitudes.<br>'
     +'<b>Solution — part (a).</b>$$a_{-3}=a_3^{*}=2e^{-j\\pi/3},\\qquad a_{-5}=a_5^{*}=1+j.$$'
     +'<b>Solution — part (b).</b> $|a_3|=2$, $\\angle a_3=\\pi/3$; $|a_5|=\\sqrt2$, $\\angle a_5=-\\pi/4$. So$$x(t)=1+4\\cos\\!\\left(3t+\\frac{\\pi}{3}\\right)+2\\sqrt2\\cos\\!\\left(5t-\\frac{\\pi}{4}\\right).$$'
     +'<b>Solution — part (c).</b> By Parseval,$$P=\\sum_k|a_k|^2=1^2+2(2)^2+2(\\sqrt2)^2=1+8+4=13\\;\\text{W}.$$Using the real-form amplitudes $A_0=1$, $A_3=4$, $A_5=2\\sqrt2$,$$P=A_0^2+\\frac{A_3^2}{2}+\\frac{A_5^2}{2}=1+\\frac{16}{2}+\\frac{8}{2}=1+8+4=13\\;\\text{W}.$$'
     +'<b>Check.</b> Evaluate $x(0)$ two ways. Directly from all five coefficients: $a_0+a_3+a_{-3}+a_5+a_{-5}=1+2e^{j\\pi/3}+2e^{-j\\pi/3}+(1-j)+(1+j)=1+4\\cos(\\pi/3)+2=1+2+2=5$. From the real form: $1+4\\cos(\\pi/3)+2\\sqrt2\\cos(-\\pi/4)=1+2+2\\sqrt2\\cdot\\tfrac{\\sqrt2}{2}=1+2+2=5$. The two agree, independently of the power computation in part (c).',
  err:'Using $A_3=|a_3|=2$ and $A_5=|a_5|=\\sqrt2$ directly in the amplitude power formula instead of the doubled values $A_3=2|a_3|=4$ and $A_5=2|a_5|=2\\sqrt2$ that the real cosine form actually carries, which understates $P$ by a factor of $4$ on each harmonic term.',
  teach:'This question only works if part (b) is trusted before part (c) is attempted: the amplitude rule in the Method needs the coefficients of the real cosines, not the magnitudes of the original complex $a_k$, and part (b) is where that distinction becomes concrete.' },

/* ----------------------------------------------------------------------
   Full-length questions. A periodic signal, its coefficients, and what a
   system or a second signal does to them.
   ---------------------------------------------------------------------- */

{ id:'D4-21', module:'M4', type:'full', src:'MT2 Q1',
  stem:'Let $$x[n]=2+(-1)^{n}\\qquad\\text{and}\\qquad y[n]=\\sin\\!\\left(\\tfrac{4\\pi}{5}n+\\tfrac{\\pi}{2}\\right)$$be two periodic signals.',
  parts:['Determine the Fourier series coefficients and plot the magnitude of each coefficient for $x[n]$.',
         'Determine the Fourier series coefficients and plot the magnitude of each coefficient for $y[n]$.',
         'Let $z[n]=x[n]y[n]$ be a periodic signal with fundamental period $10$. Determine the Fourier series coefficients and plot the magnitude of each coefficient for $z[n]$.'],
  sol:'<b>Given.</b> A two-sample alternating signal and a discrete-time sinusoid, and their product.<br>'
     +'<b>Find.</b> Three sets of coefficients.<br>'
     +'<b>Method.</b> Recognise rather than integrate. Write each signal as a sum of complex exponentials and read the coefficients off. For the product, express both factors over the common period $10$ first.<br>'
     +'<b>Solution — part (a).</b> $(-1)^{n}=e^{j\\pi n}$, and with $N=2$ the fundamental frequency is $\\omega_0=\\tfrac{2\\pi}{2}=\\pi$. So$$x[n]=2e^{j0\\cdot\\pi n}+1\\cdot e^{j1\\cdot\\pi n},$$giving $a_0=2$ and $a_1=1$ over one period. The magnitudes are $|a_0|=2$ and $|a_1|=1$.<br>'
     +'<b>Solution — part (b).</b> First $\\sin\\!\\left(\\theta+\\tfrac{\\pi}{2}\\right)=\\cos\\theta$, so $y[n]=\\cos\\!\\left(\\tfrac{4\\pi}{5}n\\right)$. Since $\\tfrac{4\\pi/5}{2\\pi}=\\tfrac25$, the period is $N=5$ and $\\omega_0=\\tfrac{2\\pi}{5}$. Then$$y[n]=\\tfrac12e^{j2\\omega_0n}+\\tfrac12e^{-j2\\omega_0n},$$so $b_2=b_{-2}=b_3=\\tfrac12$ over one period of five, and every other coefficient is zero.<br>'
     +'<b>Solution — part (c).</b> Re-index both factors on $N=10$, where $\\Omega_0=\\tfrac{2\\pi}{10}=\\tfrac{\\pi}{5}$. Then $e^{j\\pi n}=e^{j5\\Omega_0n}$ and $e^{\\pm j4\\pi n/5}=e^{\\pm j4\\Omega_0n}$, so $A_0=2$, $A_5=1$ and $B_4=B_6=\\tfrac12$. Multiplying in time is periodic convolution of the coefficients, $C_k=\\sum_{m}A_mB_{k-m}$ with indices modulo $10$. Only $m=0$ and $m=5$ contribute:$$C_k=2B_k+B_{k-5}.$$That gives$$C_4=1,\\quad C_6=1,\\quad C_9=\\tfrac12,\\quad C_1=\\tfrac12,$$and zero at every other index.<br>'
     +'<b>Check.</b> Expand the product directly:$$z[n]=\\{2+(-1)^{n}\\}\\cos\\!\\left(\\tfrac{4\\pi}{5}n\\right)=2\\cos\\!\\left(\\tfrac{4\\pi}{5}n\\right)+e^{j\\pi n}\\cos\\!\\left(\\tfrac{4\\pi}{5}n\\right).$$The first term gives coefficients $1$ at $k=\\pm4$, that is at $k=4$ and $k=6$. The second is $\\tfrac12e^{j(\\pi+4\\pi/5)n}+\\tfrac12e^{j(\\pi-4\\pi/5)n}$, and $\\pi\\pm\\tfrac{4\\pi}{5}$ are $9\\Omega_0$ and $\\Omega_0$, giving $\\tfrac12$ at $k=9$ and $k=1$. The two routes agree. Conjugate symmetry holds as it must for a real signal: $C_1=C_{-1}^{*}=C_9^{*}$ and $C_4=C_6^{*}$, both pairs real and equal.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,9.6],yr:[-0.15,1.3],xlabel:'k',ylabel:'|C_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[1,0.5],[4,1],[6,1],[9,0.5]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,4.6],yr:[-0.15,0.7],xlabel:'k',ylabel:'|b_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.25});
      a.stem([[2,0.5],[3,0.5]],{color:C.in}); return a.svg();})()),
  err:'Computing $C_k$ as the ordinary product $A_kB_k$. Multiplication in time is convolution of the coefficient sequences, not multiplication of them; the ordinary product would leave every coefficient zero here, since $A$ and $B$ are non-zero at no common index.',
  teach:'Part (c) is the one worth doing twice, once by periodic convolution and once by expanding the product. The two routes agreeing is what convinces a student that the convolution rule is not an extra formula but the same algebra written differently.' },

{ id:'D4-22', module:'M4', type:'full', src:'MT2 Q1',
  stem:'Let $x[n]$ be a periodic signal with fundamental period $N=4$, sketched below.',
  parts:['Plot the Fourier series coefficients of $x[n]$.',
         'Compute the Fourier series coefficients and plot the magnitude of each coefficient for the signal $y[n]=x[n]-x[n-1]$.',
         'Calculate the average power of the $y[n]$ signal defined in part (b).'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-4.6,8.6],yr:[-1.8,3.8],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-4,3],[-3,1],[-2,-1],[-1,1],[0,3],[1,1],[2,-1],[3,1],[4,3],[5,1],[6,-1],[7,1],[8,3]],{color:C.in});
    return a.svg();},
  sol:'<b>Given.</b> A period-four sequence with samples $3,1,-1,1$ at $n=0,1,2,3$.<br>'
     +'<b>Find.</b> Its coefficients, the coefficients of its first difference, and the average power of that difference.<br>'
     +'<b>Method.</b> Use the analysis equation over one period, with $\\omega_0=\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$ so that $e^{-jk\\omega_0n}=(-j)^{kn}$. For the difference, use the shift property rather than a second analysis.<br>'
     +'<b>Solution — part (a).</b>$$a_k=\\frac14\\sum_{n=0}^{3}x[n](-j)^{kn}.$$Evaluating each:$$a_0=\\tfrac14(3+1-1+1)=1,$$$$a_1=\\tfrac14(3-j+1+j)=1,$$$$a_2=\\tfrac14(3-1-1-1)=0,$$$$a_3=\\tfrac14(3+j+1-j)=1.$$So the coefficients are $1,1,0,1$ at $k=0,1,2,3$.<br>'
     +'<b>Solution — part (b).</b> A delay of one sample multiplies $a_k$ by $e^{-jk\\omega_0}=(-j)^{k}$, so$$b_k=a_k\\left\\{1-(-j)^{k}\\right\\}.$$That gives$$b_0=1(1-1)=0,\\quad b_1=1(1+j),\\quad b_2=0,\\quad b_3=1(1-j),$$with magnitudes $|b_0|=0$, $|b_1|=|b_3|=\\sqrt2$, $|b_2|=0$.<br>'
     +'<b>Solution — part (c).</b> By Parseval for periodic sequences,$$P=\\sum_{k=\\langle4\\rangle}|b_k|^{2}=0+2+0+2=4\\;\\text{W}.$$'
     +'<b>Check.</b> Build $y[n]$ directly: $y[0]=3-1=2$, $y[1]=1-3=-2$, $y[2]=-1-1=-2$, $y[3]=1+1=2$. Then$$P=\\frac14\\sum_{n=0}^{3}|y[n]|^{2}=\\frac14(4+4+4+4)=4\\;\\text{W},$$matching part (c). The vanishing of $b_0$ is also expected: a difference removes the constant, and $y[n]$ does sum to zero over one period.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,3.6],yr:[-0.2,1.4],xlabel:'k',ylabel:'a_k',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,1],[1,1],[2,0],[3,1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,3.6],yr:[-0.2,1.8],xlabel:'k',ylabel:'|b_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,0],[1,Math.SQRT2],[2,0],[3,Math.SQRT2]],{color:C.out}); return a.svg();})()),
  err:'Taking $b_k=a_k-a_{k-1}$, differencing the coefficients instead of applying the shift property. A delay in time multiplies each coefficient by a phase factor; it does not difference the coefficient sequence.',
  teach:'The check in part (c) is the whole value of the question: computing the power twice, once from the coefficients and once from four samples, is Parseval made concrete in a case small enough to verify by hand.' },

{ id:'D4-23', module:'M4', type:'full', src:'MT2 Q1',
  stem:'Let $x(t)$ be a periodic signal defined as$$x(t)=6\\cos^{2}\\!\\left(\\tfrac{\\pi}{4}t\\right)-4\\sin\\!\\left(\\tfrac{\\pi}{3}t\\right).$$',
  parts:['Calculate the fundamental period of $x(t)$.',
         'Plot the magnitude and phase of each set of Fourier series coefficients of $x(t)$.',
         'Calculate the average power in one period of the periodic signal $x(t)$.'],
  sol:'<b>Given.</b> A squared cosine and a sine at unrelated-looking frequencies.<br>'
     +'<b>Find.</b> The fundamental period, the coefficients, and the average power.<br>'
     +'<b>Method.</b> Linearise the square first with $\\cos^{2}\\theta=\\tfrac12(1+\\cos2\\theta)$. Only then are the frequencies present visible, and only then can the period be found.<br>'
     +'<b>Solution — part (a).</b>$$6\\cos^{2}\\!\\left(\\tfrac{\\pi}{4}t\\right)=3+3\\cos\\!\\left(\\tfrac{\\pi}{2}t\\right),$$so the signal is$$x(t)=3+3\\cos\\!\\left(\\tfrac{\\pi}{2}t\\right)-4\\sin\\!\\left(\\tfrac{\\pi}{3}t\\right).$$The two harmonic terms have periods $T_1=\\tfrac{2\\pi}{\\pi/2}=4$ and $T_2=\\tfrac{2\\pi}{\\pi/3}=6$, so$$T_0=\\operatorname{lcm}(4,6)=12\\;\\text{s},\\qquad\\omega_0=\\frac{2\\pi}{12}=\\frac{\\pi}{6}\\;\\text{rad/s}.$$Note that squaring doubled the first frequency: without linearising, $T_1$ would have been read as $8$ and the answer as $24$.<br>'
     +'<b>Solution — part (b).</b> Against $\\omega_0=\\tfrac{\\pi}{6}$, the term $\\cos\\!\\left(\\tfrac{\\pi}{2}t\\right)$ is the third harmonic and $\\sin\\!\\left(\\tfrac{\\pi}{3}t\\right)$ the second. Expanding,$$3\\cos(3\\omega_0t)=\\tfrac32e^{j3\\omega_0t}+\\tfrac32e^{-j3\\omega_0t},$$$$-4\\sin(2\\omega_0t)=2je^{j2\\omega_0t}-2je^{-j2\\omega_0t}.$$So$$a_0=3,\\quad a_{\\pm3}=\\tfrac32,\\quad a_2=2j,\\quad a_{-2}=-2j,$$and every other coefficient is zero. The magnitudes are $|a_0|=3$, $|a_{\\pm2}|=2$, $|a_{\\pm3}|=\\tfrac32$; the phases are $\\angle a_0=0$, $\\angle a_2=\\tfrac{\\pi}{2}$, $\\angle a_{-2}=-\\tfrac{\\pi}{2}$, $\\angle a_{\\pm3}=0$.<br>'
     +'<b>Solution — part (c).</b> By Parseval,$$P=\\sum_{k}|a_k|^{2}=3^{2}+2^{2}+2^{2}+\\left(\\tfrac32\\right)^{2}+\\left(\\tfrac32\\right)^{2}=9+8+4.5=21.5\\;\\text{W}.$$'
     +'<b>Check.</b> Compute the power from the amplitudes instead. A constant $A_0$ contributes $A_0^{2}$ and a sinusoid of amplitude $A$ contributes $\\tfrac{A^{2}}{2}$:$$P=3^{2}+\\frac{3^{2}}{2}+\\frac{4^{2}}{2}=9+4.5+8=21.5\\;\\text{W},$$the same number. The phase pattern is right too: $x$ is real, so $a_{-k}=a_k^{*}$, and the purely imaginary pair at $k=\\pm2$ is what a sine contributes, while the real pair at $k=\\pm3$ is what a cosine contributes.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-0.3,3.6],xlabel:'k',ylabel:'|a_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[-3,1.5],[-2,2],[0,3],[2,2],[3,1.5]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-2.2,2.2],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',
      pad:{l:62,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[-3,0],[-2,-Math.PI/2],[0,0],[2,Math.PI/2],[3,0]],{color:C.mid}); return a.svg();})()),
  err:'Reading the period of $\\cos^{2}\\!\\left(\\tfrac{\\pi}{4}t\\right)$ as $8$ seconds and concluding $T_0=24$. Squaring a cosine doubles its frequency and halves its period, so the term repeats every $4$ seconds, not every $8$.',
  teach:'Part (a) is the trap and the lesson. Ask for a sketch of $\\cos^{2}$ over one cycle of $\\cos$ before any algebra: the picture shows two humps where the cosine has one, and the doubling becomes something the student saw rather than a rule they were told.' },

{ id:'D4-24', module:'M4', type:'full', src:'MT2 Q2',
  stem:'Let $x[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-4k]$ be the input of a discrete-time LTI system with impulse response $h[n]=\\left(\\tfrac12\\right)^{n}u[n]$. Let $y[n]=x[n]*h[n]$ be the output signal.',
  parts:['Determine the Fourier series coefficients and plot the magnitude of each coefficient for $x[n]$.',
         'Determine the frequency response of $h[n]$ and plot its magnitude spectrum.',
         'Determine the Fourier series coefficients and plot the magnitude of each coefficient for $y[n]$.'],
  sol:'<b>Given.</b> An impulse train of period $4$ driving a one-pole filter.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response, and the output coefficients.<br>'
     +'<b>Method.</b> A periodic input passes through an LTI system one harmonic at a time: $b_k=a_kH\\!\\left(e^{jk\\omega_0}\\right)$. Nothing needs to be convolved.<br>'
     +'<b>Solution — part (a).</b> With $N=4$ and one impulse per period,$$a_k=\\frac14\\sum_{n=0}^{3}x[n]e^{-jk\\frac{2\\pi}{4}n}=\\frac14\\cdot1=\\frac14$$for every $k$. An impulse train has a flat coefficient spectrum.<br>'
     +'<b>Solution — part (b).</b>$$H\\!\\left(e^{j\\omega}\\right)=\\sum_{n=0}^{\\infty}\\left(\\tfrac12\\right)^{n}e^{-j\\omega n}=\\frac{1}{1-\\tfrac12e^{-j\\omega}},$$whose magnitude is$$\\left|H\\!\\left(e^{j\\omega}\\right)\\right|=\\frac{1}{\\sqrt{\\tfrac54-\\cos\\omega}},$$largest at $\\omega=0$, where it is $2$, and smallest at $\\omega=\\pi$, where it is $\\tfrac23$. This is a low-pass characteristic.<br>'
     +'<b>Solution — part (c).</b> With $\\omega_0=\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$,$$b_k=\\frac14\\cdot\\frac{1}{1-\\tfrac12e^{-jk\\pi/2}}.$$Evaluating the four distinct harmonics:$$b_0=\\frac{1/4}{1-\\tfrac12}=\\frac12,\\qquad b_2=\\frac{1/4}{1+\\tfrac12}=\\frac16,$$$$b_1=\\frac{1/4}{1+\\tfrac j2},\\qquad b_3=\\frac{1/4}{1-\\tfrac j2},$$so $|b_1|=|b_3|=\\dfrac{1/4}{\\sqrt{5}/2}=\\dfrac{1}{2\\sqrt5}\\approx0.2236$.<br>'
     +'<b>Check.</b> The magnitudes must follow the shape of $\\left|H\\right|$, and they do: largest at $k=0$ where $|H|=2$, smallest at $k=2$ where $|H|=\\tfrac23$, and equal at $k=1$ and $k=3$ because those two frequencies, $\\tfrac{\\pi}{2}$ and $\\tfrac{3\\pi}{2}\\equiv-\\tfrac{\\pi}{2}$, are a conjugate pair. Each is $\\tfrac14$ times the corresponding $|H|$: $\\tfrac14\\cdot2=\\tfrac12$ and $\\tfrac14\\cdot\\tfrac23=\\tfrac16$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.15,2.3],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',
      pad:{l:60,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.curve(w=>1/Math.sqrt(1.25-Math.cos(w)),{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,3.6],yr:[-0.06,0.62],xlabel:'k',ylabel:'|b_k|',
      pad:{l:56,r:26,t:28,b:34},xstep:1,ystep:0.25});
      a.stem([[0,0.5],[1,1/(2*Math.sqrt(5))],[2,1/6],[3,1/(2*Math.sqrt(5))]],{color:C.out}); return a.svg();})()),
  err:'Convolving $x$ and $h$ in the time domain and then analysing the result. It gives the same answer with far more work; the point of the Fourier series is that an LTI system acts on each coefficient separately.',
  teach:'Ask what happens as the pole moves from $\\tfrac12$ towards $1$. The coefficient at $k=0$ grows without bound while the others stay finite, which is the frequency-domain picture of an accumulator losing stability.' },

{ id:'D4-25', module:'M4', type:'full', src:'MT2 Q2',
  stem:'Let $$x(t)=1+2\\cos\\!\\left(\\tfrac{\\pi}{2}t+\\tfrac{\\pi}{4}\\right)+3\\sin(\\pi t)$$be a periodic signal that is applied to a linear time-invariant (LTI) system with the impulse response $h(t)=\\delta(t)-2e^{-2t}u(t)$. At the output of the LTI system, the $y(t)$ signal is obtained.',
  parts:['Determine the Fourier series coefficients and plot the magnitude of each coefficient for $x(t)$.',
         'Determine the frequency response of $h(t)$.',
         'Determine the Fourier series coefficients and plot the magnitude of each coefficient for $y(t)$.'],
  sol:'<b>Given.</b> A constant plus two sinusoids, driving a system whose impulse response is an impulse minus a decaying exponential.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response, and the output coefficients.<br>'
     +'<b>Method.</b> Fix $\\omega_0$ from the two periods, expand the sinusoids, then apply $b_k=a_kH(jk\\omega_0)$.<br>'
     +'<b>Solution — part (a).</b> The periods are $T_1=\\tfrac{2\\pi}{\\pi/2}=4$ and $T_2=\\tfrac{2\\pi}{\\pi}=2$, so $T_0=4$ and $\\omega_0=\\tfrac{\\pi}{2}$. The cosine is the first harmonic and the sine the second:$$2\\cos(\\omega_0t+\\tfrac{\\pi}{4})=e^{j\\pi/4}e^{j\\omega_0t}+e^{-j\\pi/4}e^{-j\\omega_0t},$$$$3\\sin(2\\omega_0t)=-\\tfrac{3j}{2}e^{j2\\omega_0t}+\\tfrac{3j}{2}e^{-j2\\omega_0t}.$$So$$a_0=1,\\quad a_{1}=e^{j\\pi/4},\\quad a_{-1}=e^{-j\\pi/4},\\quad a_{2}=-\\tfrac{3j}{2},\\quad a_{-2}=\\tfrac{3j}{2},$$with magnitudes $1$, $1$, $1$, $\\tfrac32$, $\\tfrac32$.<br>'
     +'<b>Solution — part (b).</b> Transforming term by term, $\\delta(t)\\to1$ and $2e^{-2t}u(t)\\to\\dfrac{2}{2+j\\omega}$, so$$H(j\\omega)=1-\\frac{2}{2+j\\omega}=\\frac{j\\omega}{2+j\\omega}.$$This is a high-pass characteristic: $H(0)=0$ and $|H|\\to1$ as $\\omega\\to\\infty$.<br>'
     +'<b>Solution — part (c).</b> With $\\omega_0=\\tfrac{\\pi}{2}$,$$b_0=a_0H(0)=0,$$so the constant is removed entirely. For the first harmonic, $\\left|H\\!\\left(j\\tfrac{\\pi}{2}\\right)\\right|=\\dfrac{\\pi/2}{\\sqrt{4+\\pi^{2}/4}}\\approx0.6177$, so $|b_{\\pm1}|\\approx0.6177$. For the second, $\\left|H(j\\pi)\\right|=\\dfrac{\\pi}{\\sqrt{4+\\pi^{2}}}\\approx0.8436$, so $|b_{\\pm2}|=\\tfrac32\\cdot0.8436\\approx1.2654$.<br>'
     +'<b>Check.</b> The shape of the answer is what a high-pass filter must produce: the DC term is gone, the first harmonic is attenuated to about $62\\%$, and the second, being at twice the frequency, passes at about $84\\%$. The ordering $|b_0|<|b_1|<|b_2|$ is the reverse of what the low-pass system in the previous question gave, on an input with the same shape.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.4,7],yr:[-0.08,1.15],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',
      pad:{l:58,r:26,t:28,b:38},xstep:2,ystep:0.5});
      a.curve(w=>Math.abs(w)/Math.sqrt(4+w*w),{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.6,2.6],yr:[-0.12,1.5],xlabel:'k',ylabel:'|b_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      const h1=(Math.PI/2)/Math.sqrt(4+Math.PI*Math.PI/4), h2=Math.PI/Math.sqrt(4+Math.PI*Math.PI);
      a.stem([[-2,1.5*h2],[-1,h1],[0,0],[1,h1],[2,1.5*h2]],{color:C.out}); return a.svg();})()),
  err:'Reporting $b_0=1$ because the impulse in $h(t)$ passes the input through unchanged. The exponential term also has a DC response, and the two cancel exactly: $H(0)=1-\\tfrac{2}{2}=0$.',
  teach:'This is the cleanest example of a system removing a DC offset. Ask what $h(t)=\\delta(t)-ae^{-at}u(t)$ does for other values of $a$: the zero at $\\omega=0$ stays wherever $a$ goes, because the area of the exponential is always $1$.' },

{ id:'D4-26', module:'M4', type:'full', src:'MT2 Q2',
  stem:'The periodic signal $x[n]$ sketched below is the input of a discrete-time LTI system with the impulse response $h[n]=u[n+1]-u[n-2]$. Let $y[n]=x[n]*h[n]$ be the output signal.',
  parts:['Plot the Fourier series coefficients of $x[n]$.',
         'Determine the frequency response of $h[n]$.',
         'Plot the Fourier series coefficients of $y[n]$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-4.6,8.6],yr:[-2.8,2.8],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-4,2],[-3,0],[-2,-2],[-1,0],[0,2],[1,0],[2,-2],[3,0],[4,2],[5,0],[6,-2],[7,0],[8,2]],{color:C.in});
    return a.svg();},
  sol:'<b>Given.</b> A period-four sequence with samples $2,0,-2,0$, driving a three-tap moving sum centred on $n$.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response, and the output coefficients.<br>'
     +'<b>Method.</b> The input is a single sinusoid, so its coefficients can be obtained without the analysis sum. Rewrite the step difference as its three non-zero samples, calculate $H$, and then apply $b_k=a_kH\\!\\left(e^{jk\\omega_0}\\right)$.<br>'
     +'<b>Solution — part (a).</b> The samples $2,0,-2,0$ are $x[n]=2\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$, so with $N=4$ and $\\omega_0=\\tfrac{\\pi}{2}$,$$x[n]=e^{j\\omega_0n}+e^{-j\\omega_0n},$$giving $a_1=a_{-1}=a_3=1$ and $a_0=a_2=0$.<br>'
     +'<b>Solution — part (b).</b> The step difference gives $h[n]=1$ for $-1\\le n\\le1$, so$$H\\!\\left(e^{j\\omega}\\right)=\\sum_{n=-1}^{1}e^{-j\\omega n}=e^{j\\omega}+1+e^{-j\\omega}=1+2\\cos\\omega,$$real and even, as a symmetric impulse response must be.<br>'
     +'<b>Solution — part (c).</b> Evaluate $H$ at the four harmonics of $\\omega_0=\\tfrac{\\pi}{2}$:$$H(e^{j0})=3,\\quad H\\!\\left(e^{j\\pi/2}\\right)=1,\\quad H\\!\\left(e^{j\\pi}\\right)=-1,\\quad H\\!\\left(e^{j3\\pi/2}\\right)=1.$$Then $b_k=a_kH$ gives$$b_0=0,\\quad b_1=1,\\quad b_2=0,\\quad b_3=1,$$identical to $a_k$. The filter leaves this input untouched, because $H=1$ at exactly the frequency the input occupies.<br>'
     +'<b>Check.</b> Convolve directly. With $y[n]=x[n+1]+x[n]+x[n-1]$ and $x=\\{2,0,-2,0\\}$,$$y[0]=0+2+0=2,\\;y[1]=-2+0+2=0,\\;y[2]=0-2+0=-2,\\;y[3]=2+0-2=0,$$so $y[n]=x[n]$ exactly, as the coefficients predicted. The gain of $3$ at $k=0$ never shows, because the input carries no constant term for it to act on.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-1.6,3.4],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'H(e^{j\\omega})',
      pad:{l:58,r:26,t:28,b:38},xstep:1,ystep:1});
      a.curve(w=>1+2*Math.cos(w),{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,3.6],yr:[-0.2,1.4],xlabel:'k',ylabel:'b_k',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[0,0],[1,1],[2,0],[3,1]],{color:C.out}); return a.svg();})()),
  err:'Reporting a gain of $3$ on the output because the filter has three taps of unit height. The gain of $3$ is the value of $H$ at $\\omega=0$ only; at the frequency this input actually occupies the gain is $1$.',
  teach:'Use this question to show that a filter leaves a harmonic unchanged when its gain at that frequency is one. Then ask which input has gain three and which input has gain negative one. The answers are a constant and the alternating sequence at $\\omega=\\pi$.' },

{ id:'D4-27', module:'M4', type:'full', src:'Final Q2',
  stem:'Let $$a_k=\\begin{cases}2,&k\\text{ even}\\\\1,&k\\text{ odd}\\\\0,&|k|\\ge3\\end{cases}$$be the Fourier series coefficients of a continuous-time signal $x(t)$ which is periodic with $6$ seconds.',
  parts:['Find the Fourier series representation of $x(t)$, and write it as a sum of real cosines.',
         'Calculate the average power of $x(t)$.'],
  sol:'<b>Given.</b> Five non-zero coefficients, specified by the parity of the index, on a period of six seconds.<br>'
     +'<b>Find.</b> The signal itself and its average power.<br>'
     +'<b>Method.</b> List the coefficients that survive, then pair $k$ with $-k$ to turn each pair of exponentials into a cosine.<br>'
     +'<b>Solution — part (a).</b> With $T_0=6$ the fundamental frequency is $\\omega_0=\\tfrac{2\\pi}{6}=\\tfrac{\\pi}{3}$. The condition $|k|\\ge3$ leaves only $k=0,\\pm1,\\pm2$, and the parity rule gives$$a_0=2,\\quad a_{\\pm1}=1,\\quad a_{\\pm2}=2.$$The synthesis equation is then$$x(t)=\\sum_{k=-2}^{2}a_ke^{jk\\omega_0t}=2+\\left(e^{j\\omega_0t}+e^{-j\\omega_0t}\\right)+2\\left(e^{j2\\omega_0t}+e^{-j2\\omega_0t}\\right),$$and pairing the exponentials,$$x(t)=2+2\\cos\\!\\left(\\tfrac{\\pi}{3}t\\right)+4\\cos\\!\\left(\\tfrac{2\\pi}{3}t\\right).$$'
     +'<b>Solution — part (b).</b> By Parseval,$$P=\\sum_{k=-2}^{2}|a_k|^{2}=2^{2}+1^{2}+1^{2}+2^{2}+2^{2}=14\\;\\text{W}.$$'
     +'<b>Check.</b> Compute the power from the real form instead. The constant contributes $2^{2}=4$, the first cosine $\\tfrac{2^{2}}{2}=2$, the second $\\tfrac{4^{2}}{2}=8$, and $4+2+8=14$. The factor of two between the two routes is accounted for exactly: each cosine of amplitude $A$ splits into two coefficients of magnitude $\\tfrac A2$, contributing $2\\cdot\\tfrac{A^{2}}{4}=\\tfrac{A^{2}}{2}$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-0.3,2.6],xlabel:'k',ylabel:'a_k',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[-2,2],[-1,1],[0,2],[1,1],[2,2]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-6.5,6.5],yr:[-4.5,8.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:26,t:28,b:38},xstep:2,ystep:4});
      a.curve(t=>2+2*Math.cos(Math.PI*t/3)+4*Math.cos(2*Math.PI*t/3),{color:C.out}); return a.svg();})()),
  err:'Applying the parity rule to $|k|\\ge3$ as well and keeping coefficients at $k=\\pm4$ because $4$ is even. The three cases are read in order, and the last one overrides the first two wherever $|k|\\ge3$.',
  teach:'Ask for $x(0)$ as a second check: from the real form it is $2+2+4=8$, and from the coefficients it is $\\sum_ka_k=2+1+1+2+2=8$. Evaluating the synthesis equation at one point is the cheapest test of a coefficient list there is.' },

{ id:'D4-28', module:'M4', type:'full', src:'Final Q2',
  stem:'A periodic signal $x[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-6k]$ is the input of a discrete-time LTI system with the impulse response$$h[n]=\\frac{\\sin\\!\\left(\\tfrac{\\pi}{2}n\\right)}{\\pi n}.$$Let $y[n]=x[n]*h[n]$ be the output signal.',
  parts:['Plot the Fourier series coefficients of $x[n]$.',
         'Plot the frequency response of $h[n]$.',
         'Calculate the average power in one period for the periodic signal $y[n]$.'],
  sol:'<b>Given.</b> An impulse train of period $6$ driving an ideal low-pass filter.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response, and the output power.<br>'
     +'<b>Method.</b> The filter keeps the harmonics inside its band and deletes the rest, so the output power is a sum over the surviving harmonics only.<br>'
     +'<b>Solution — part (a).</b> With $N=6$ and one impulse per period,$$a_k=\\frac16\\sum_{n=0}^{5}x[n]e^{-jk\\frac{2\\pi}{6}n}=\\frac16$$for every $k$: a flat spectrum, as every impulse train has.<br>'
     +'<b>Solution — part (b).</b> The sequence $\\dfrac{\\sin(\\omega_cn)}{\\pi n}$ with $\\omega_c=\\tfrac{\\pi}{2}$ is the ideal low-pass filter,$$H\\!\\left(e^{j\\omega}\\right)=\\begin{cases}1,&|\\omega|\\le\\tfrac{\\pi}{2}\\\\0,&\\tfrac{\\pi}{2}<|\\omega|\\le\\pi,\\end{cases}$$repeating with period $2\\pi$.<br>'
     +'<b>Solution — part (c).</b> The harmonics sit at $k\\omega_0=k\\tfrac{\\pi}{3}$. Taking $k$ over one period and folding to $|\\omega|\\le\\pi$: $k=0$ gives $0$, $k=1$ gives $\\tfrac{\\pi}{3}$, $k=5$ gives $-\\tfrac{\\pi}{3}$ — all inside the band; $k=2,3,4$ give $\\tfrac{2\\pi}{3}$, $\\pi$, $-\\tfrac{2\\pi}{3}$ — all outside. So$$b_0=b_1=b_5=\\tfrac16,\\qquad b_2=b_3=b_4=0,$$and by Parseval$$P_y=\\sum_{k=\\langle6\\rangle}|b_k|^{2}=3\\cdot\\frac{1}{36}=\\frac{1}{12}\\;\\text{W}\\approx0.0833\\;\\text{W}.$$'
     +'<b>Check.</b> Build $y[n]$ and average it directly. From the three surviving coefficients,$$y[n]=\\tfrac16\\left(1+2\\cos\\tfrac{\\pi n}{3}\\right),$$so over one period $y=\\tfrac12,\\tfrac13,0,-\\tfrac16,0,\\tfrac13$ at $n=0,\\dots,5$, and$$P_y=\\frac16\\left(\\tfrac14+\\tfrac19+0+\\tfrac1{36}+0+\\tfrac19\\right)=\\frac16\\cdot\\frac12=\\frac1{12}\\;\\text{W}.$$The two routes agree. The input power is $\\sum|a_k|^{2}=6\\cdot\\tfrac1{36}=\\tfrac16$, so the filter removed exactly half of it.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.15,1.4],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'H(e^{j\\omega})',
      pad:{l:58,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.poly([[-3.4,0],[-Math.PI/2,0],[-Math.PI/2,1],[Math.PI/2,1],[Math.PI/2,0],[3.4,0]],{color:C.h});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.6,5.6],yr:[-0.03,0.22],xlabel:'k',ylabel:'|b_k|',
      pad:{l:56,r:26,t:28,b:34},xstep:1,ystep:0.05});
      a.stem([[0,1/6],[1,1/6],[2,0],[3,0],[4,0],[5,1/6]],{color:C.out}); return a.svg();})()),
  err:'Keeping the harmonic at $k=4$ because $4\\omega_0=\\tfrac{4\\pi}{3}$ looks larger than $\\pi$ and so "outside the plotted range". Discrete-time frequencies are read modulo $2\\pi$, so $\\tfrac{4\\pi}{3}$ is the same frequency as $-\\tfrac{2\\pi}{3}$ — still outside the band, but for the right reason.',
  teach:'The folding step in part (c) is where the discrete case differs from the continuous one, and it is worth doing out loud for all six indices. A student who folds correctly sees why the surviving set is symmetric about $k=0$ and must contain $k=5$ whenever it contains $k=1$.' },

{ id:'D4-29', module:'M4', type:'full', src:'MT2 Q1',
  stem:'Let $x(t)$ be the periodic square wave of period $T_0=4$ seconds defined over one period by$$x(t)=\\begin{cases}1,&|t|<1\\\\0,&1<|t|<2.\\end{cases}$$',
  parts:['Give the fundamental frequency $\\omega_0$ and the Fourier series coefficients $a_k$.',
         'State which coefficients vanish and say why.',
         'Calculate the average power of $x(t)$, and verify it against Parseval.'],
  sol:'<b>Given.</b> A square wave that is on for half of each period, centred on the origin.<br>'
     +'<b>Find.</b> The coefficients, the pattern of the zeros, and the power.<br>'
     +'<b>Method.</b> Integrate over one period. The signal is even and real, so the coefficients are real and even in $k$.<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$, and$$a_k=\\frac14\\int_{-1}^{1}e^{-jk\\frac{\\pi}{2}t}\\,\\d t=\\frac14\\cdot\\frac{2\\sin\\!\\left(\\tfrac{k\\pi}{2}\\right)}{k\\pi/2}=\\frac{\\sin\\!\\left(\\tfrac{k\\pi}{2}\\right)}{k\\pi}$$for $k\\ne0$, and $a_0=\\tfrac14\\int_{-1}^{1}\\d t=\\tfrac12$. The first few are$$a_0=\\tfrac12,\\quad a_1=\\tfrac1\\pi,\\quad a_2=0,\\quad a_3=-\\tfrac1{3\\pi},\\quad a_4=0,\\quad a_5=\\tfrac1{5\\pi}.$$'
     +'<b>Solution — part (b).</b> Every even $k$ other than zero gives $\\sin\\!\\left(\\tfrac{k\\pi}{2}\\right)=0$, so $a_k=0$ there. That is the signature of a duty cycle of exactly one half: the harmonic at $2\\omega_0$ completes a whole number of cycles inside the on-interval and inside the off-interval alike, and its contributions cancel.<br>'
     +'<b>Solution — part (c).</b> Directly,$$P=\\frac14\\int_{-1}^{1}1^{2}\\,\\d t=\\frac12\\;\\text{W}.$$By Parseval,$$P=\\sum_k|a_k|^{2}=\\frac14+\\frac{2}{\\pi^{2}}\\left(1+\\frac19+\\frac1{25}+\\cdots\\right)=\\frac14+\\frac{2}{\\pi^{2}}\\cdot\\frac{\\pi^{2}}{8}=\\frac14+\\frac14=\\frac12\\;\\text{W}.$$'
     +'<b>Check.</b> The two routes agree at $\\tfrac12$, and the direct computation is the easy one: the signal is $1$ for half the period and $0$ for the other half, so its mean square is exactly one half. The sum of odd reciprocal squares used in the second route, $1+\\tfrac19+\\tfrac1{25}+\\cdots=\\tfrac{\\pi^{2}}{8}$, is what makes the series close on the same number — which is a check on the coefficient formula, not an assumption of it.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-6.6,6.6],yr:[-0.2,0.62],xlabel:'k',ylabel:'a_k',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:0.25});
    const pts=[]; for(let k=-6;k<=6;k++) pts.push([k, k===0?0.5:Math.sin(k*Math.PI/2)/(k*Math.PI)]);
    a.stem(pts,{color:C.in}); return a.svg();},
  err:'Reporting $a_0=\\tfrac{\\sin(0)}{0}$ as undefined, or as $1$. The formula for $a_k$ is derived by dividing by $k$ and is valid only for $k\\ne0$; the coefficient at $k=0$ is the average value, and it has to be integrated separately.',
  teach:'Connect the zero even harmonics to the duty cycle. Ask for the coefficient zeros when the on-interval has length $1$ in a period of $4$. The zeros then occur at every fourth index, so their spacing gives information about the duty cycle.' },

{ id:'D4-30', module:'M4', type:'full', src:'MT2 Q2',
  stem:'Let $$x(t)=3+2\\cos(2t)+\\cos(4t)$$be the input to an LTI system with impulse response $h(t)=e^{-t}u(t)$, and let $y(t)$ be the output.',
  parts:['Give the fundamental period of $x(t)$ and its Fourier series coefficients.',
         'Determine the frequency response $H(j\\omega)$ and evaluate it at each harmonic present.',
         'Determine the Fourier series coefficients of $y(t)$ and plot their magnitudes.'],
  sol:'<b>Given.</b> A constant and two cosines driving a one-pole low-pass filter.<br>'
     +'<b>Find.</b> The input coefficients, the frequency response at the harmonics, and the output coefficients.<br>'
     +'<b>Method.</b> Fix $\\omega_0$ from the lower of the two frequencies, check that the higher is a whole multiple of it, then apply $b_k=a_kH(jk\\omega_0)$.<br>'
     +'<b>Solution — part (a).</b> The periods are $\\tfrac{2\\pi}{2}=\\pi$ and $\\tfrac{2\\pi}{4}=\\tfrac{\\pi}{2}$, and the second divides the first, so $T_0=\\pi$ and $\\omega_0=2$ rad/s. The cosines are the first and second harmonics:$$a_0=3,\\quad a_{\\pm1}=1,\\quad a_{\\pm2}=\\tfrac12,$$every other coefficient zero.<br>'
     +'<b>Solution — part (b).</b>$$H(j\\omega)=\\int_{0}^{\\infty}e^{-t}e^{-j\\omega t}\\,\\d t=\\frac{1}{1+j\\omega}.$$At the harmonics,$$H(0)=1,\\qquad H(j2)=\\frac{1}{1+2j},\\qquad H(j4)=\\frac{1}{1+4j},$$with magnitudes $1$, $\\tfrac{1}{\\sqrt5}\\approx0.4472$ and $\\tfrac{1}{\\sqrt{17}}\\approx0.2425$.<br>'
     +'<b>Solution — part (c).</b>$$b_0=3,\\qquad b_{\\pm1}=\\frac{1}{1\\pm2j},\\qquad b_{\\pm2}=\\frac{1/2}{1\\pm4j},$$with magnitudes$$|b_0|=3,\\quad|b_{\\pm1}|=\\frac{1}{\\sqrt5}\\approx0.4472,\\quad|b_{\\pm2}|=\\frac{1}{2\\sqrt{17}}\\approx0.1213.$$'
     +'<b>Check.</b> The filter is low-pass, so the DC term must pass untouched and each harmonic must be attenuated more than the one below it. That is the pattern: gain $1$ at $\\omega=0$, then $0.447$, then $0.243$. Reading the same thing as power, the input power is $9+2\\cdot1+2\\cdot\\tfrac14=11.5$ W and the output power is $9+2\\cdot\\tfrac15+2\\cdot\\tfrac1{68}\\approx9.43$ W, so the filter has removed about $18\\%$ of it, almost all of it from the highest harmonic.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.4,8],yr:[-0.08,1.15],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',
      pad:{l:58,r:26,t:28,b:38},xstep:2,ystep:0.5});
      a.curve(w=>1/Math.sqrt(1+w*w),{color:C.h}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.6,2.6],yr:[-0.25,3.4],xlabel:'k',ylabel:'|b_k|',
      pad:{l:52,r:26,t:28,b:34},xstep:1,ystep:1});
      a.stem([[-2,1/(2*Math.sqrt(17))],[-1,1/Math.sqrt(5)],[0,3],[1,1/Math.sqrt(5)],[2,1/(2*Math.sqrt(17))]],{color:C.out});
      return a.svg();})()),
  err:'Taking $\\omega_0=4$ from the higher frequency and calling $\\cos(2t)$ a half-harmonic. The fundamental is the largest frequency that divides every frequency present, which is $2$ here, not the largest frequency present.',
  teach:'Compare this result with the high-pass question that uses the same input form. The two systems give opposite orderings of $|b_k|$. In each case, $|b_k|$ equals the input coefficient magnitude multiplied by the gain at that harmonic.' }

]);

window.DRILLMAP_M4 = [

{ id:'m4-drill-map', module:'M4', nav:'Module 4 · question types',
  title:'Module 4 — what a question looks like', src:'pp. 22–41',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 4 question types Fourier series coefficients power spectrum taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Question types', src:'pp. 22–41'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on Fourier series come in five shapes. This list states the purpose and method of each shape. Read it before the module so that you can identify the required method when a question appears.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M4'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M4 = [

{ id:'m4-drill', module:'M4', nav:'Module 4 · practice questions',
  title:'Module 4 — practice questions', src:'pp. 22–41',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 4 practice Fourier series coefficients Parseval frequency response symmetry convergence',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 4 · Practice D4-01 … D4-30', src:'pp. 22–41'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. Use three checks in this module: $a_0$ must equal the mean of one period; a real signal must satisfy $a_{-k}=a_k^{*}$; and average power computed from the coefficients must equal average power computed in time.'},
  {t:'rule', short:true},
  {t:'drill', module:'M4'}
]}

];
})();
