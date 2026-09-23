/* ==========================================================================
   Practice questions — Module 1.
   The module closes with a pager of thirty open-ended questions. The worked
   solution of every question is hidden until the reader asks for it, so a
   first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const seq =(vals,n0)=>vals.map((v,i)=>[n0+i,v]);
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;

/* ======================================================================
   MODULE 1 — Signal Foundations
   ====================================================================== */

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D1-01', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each sequence below is periodic. Where it is, give the fundamental period $N_0$.'
      +'$$\\text{(i)}\\;\\;x[n]=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}\\right)\\qquad\\text{(ii)}\\;\\;x[n]=e^{j3n}\\qquad\\text{(iii)}\\;\\;x[n]=\\sin\\!\\left(\\tfrac{\\pi}{6}n\\right)$$',
  parts:['Apply the periodicity test to each sequence.',
         'Give $N_0$ wherever it exists, and say why it does not exist otherwise.'],
  sol:'<b>Given.</b> Three discrete-time sinusoids.<br>'
     +'<b>Find.</b> Which repeat, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time sinusoid repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. For $\\cos(\\omega_0n+\\phi)$ this means $\\cos(\\omega_0n+\\omega_0N+\\phi)=\\cos(\\omega_0n+\\phi)$ for every $n$, which holds exactly when $\\omega_0N$ is a whole number of turns: $\\omega_0N=2\\pi k$ with $k$ an integer. Dividing by $2\\pi N$,$$\\frac{\\omega_0}{2\\pi}=\\frac{k}{N},$$so the ratio must be rational. When it is, $N=\\dfrac{2\\pi}{\\omega_0}k$, and $N_0$ is the value at the smallest positive $k$ that makes $N$ an integer. The phase $\\phi$ never enters the test.<br>'
     +'<b>Solution — (i).</b> Read off $\\omega_0=\\tfrac{5\\pi}{8}$. Form the ratio:$$\\frac{\\omega_0}{2\\pi}=\\frac{5\\pi/8}{2\\pi}=\\frac{5\\pi}{16\\pi}=\\frac{5}{16}.$$This is rational, so the sequence repeats. Then$$N=\\frac{2\\pi}{\\omega_0}k=\\frac{2\\pi\\cdot8}{5\\pi}k=\\frac{16}{5}k.$$$\\tfrac{16}{5}k$ is an integer only when $5$ divides $16k$. Since $\\gcd(16,5)=1$, that needs $5\\mid k$, and the smallest positive choice is $k=5$:$$N_0=\\frac{16\\cdot5}{5}=16.\\quad\\textbf{Periodic.}$$'
     +'<b>Solution — (ii).</b> Here $\\omega_0=3$, so$$\\frac{\\omega_0}{2\\pi}=\\frac{3}{2\\pi}.$$Suppose this equalled $\\tfrac{k}{N}$ for integers $k,N$. Then $\\pi=\\dfrac{3N}{2k}$ would be rational, and it is not. So the ratio is irrational, no integer $N$ works, and the sequence is <b>not periodic</b>.<br>'
     +'<b>Solution — (iii).</b> Here $\\omega_0=\\tfrac{\\pi}{6}$, so$$\\frac{\\omega_0}{2\\pi}=\\frac{\\pi/6}{2\\pi}=\\frac{\\pi}{12\\pi}=\\frac{1}{12},$$rational. Then$$N=\\frac{2\\pi}{\\omega_0}k=\\frac{2\\pi\\cdot6}{\\pi}k=12k,$$which is an integer already at $k=1$, so $N_0=12$. <b>Periodic.</b><br>'
     +'<b>Check.</b> For (i), substitute $n+16$:$$\\cos\\!\\left(\\tfrac{5\\pi}{8}(n+16)-\\tfrac{\\pi}{6}\\right)=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}+10\\pi\\right)=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}\\right),$$because $\\tfrac{5\\pi}{8}\\cdot16=10\\pi=5\\cdot2\\pi$ is a whole number of turns. No smaller positive integer works because $\\tfrac{16}{5}k$ is an integer only when $5\\mid k$. In (ii), sampling at integer values removes the repetition that the corresponding continuous-time signal has.',
  err:'Transferring the continuous-time rule and reporting a non-integer period such as $2\\pi/3$ for (ii). A period that is not an integer is not a period of a sequence.',
  teach:'Ask the student to write $\\omega_0/2\\pi$ for all three signals before deciding whether they are periodic. This ratio must be rational for a discrete-time sinusoid to repeat.' },

{ id:'D1-02', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Let $$x[n]=\\cos\\!\\left(\\tfrac{\\pi}{5}n\\right)+\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right).$$',
  parts:['Show that each term is periodic and give its period.',
         'Determine the fundamental period $N_0$ of $x[n]$ and the fundamental frequency.'],
  sol:'<b>Given.</b> A sum of two discrete-time sinusoids.<br>'
     +'<b>Find.</b> The fundamental period of the sum.<br>'
     +'<b>Method.</b> Test each term first because the sum can repeat only when both terms repeat. For each term, $\\omega/2\\pi$ must be rational, and the period is the smallest integer $N$ with $\\omega N=2\\pi k$. Then take the least common multiple of the two periods. It is the smallest integer that is a whole number of periods of both terms.<br>'
     +'<b>Solution — part (a).</b> First term, $\\omega_1=\\tfrac{\\pi}{5}$:$$\\frac{\\omega_1}{2\\pi}=\\frac{\\pi/5}{2\\pi}=\\frac{1}{10},\\qquad N_1=\\frac{2\\pi}{\\omega_1}k=10k,$$an integer at $k=1$, so $N_1=10$. Second term, $\\omega_2=\\tfrac{\\pi}{3}$:$$\\frac{\\omega_2}{2\\pi}=\\frac{\\pi/3}{2\\pi}=\\frac{1}{6},\\qquad N_2=\\frac{2\\pi}{\\omega_2}k=6k,$$an integer at $k=1$, so $N_2=6$. Both ratios are rational, so both terms repeat.<br>'
     +'<b>Solution — part (b).</b> Factor the two periods into primes: $10=2\\cdot5$ and $6=2\\cdot3$. The least common multiple takes each prime at its highest power:$$N_0=\\operatorname{lcm}(10,6)=2\\cdot3\\cdot5=30.$$The fundamental frequency is$$\\omega_0=\\frac{2\\pi}{N_0}=\\frac{2\\pi}{30}=\\frac{\\pi}{15}\\;\\text{rad/sample}.$$'
     +'<b>Check.</b> $30/10=3$ and $30/6=5$: the length $30$ contains $3$ whole periods of the first term and $5$ of the second, so both return to their starting values together. Nothing smaller does: $15$ holds $15/10=1.5$ periods of the first term, which is not a whole number. In terms of harmonics, $\\tfrac{\\pi}{5}=3\\cdot\\tfrac{\\pi}{15}$ and $\\tfrac{\\pi}{3}=5\\cdot\\tfrac{\\pi}{15}$, so the two terms are the $3$rd and the $5$th harmonic of $\\omega_0=\\pi/15$.',
  err:'Multiplying the two periods to get $60$. The product is a period, but it is fundamental only when the periods are coprime. Here $10$ and $6$ share the factor $2$.',
  teach:'Have the student verify $N_0$ by checking that $N_0/N_1$ and $N_0/N_2$ are both integers and that no smaller candidate has that property.' },

{ id:'D1-03', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each continuous-time signal is periodic. Where it is, give $T_0$ and $\\omega_0$.'
      +'$$\\text{(i)}\\;\\;x(t)=\\cos(3t)+\\sin(5t)\\qquad\\text{(ii)}\\;\\;y(t)=\\cos(t)+\\cos(\\sqrt2\\,t)$$',
  parts:['Give the period of each term separately.',
         'Decide whether the sum repeats, and give $T_0$ where it does.'],
  sol:'<b>Given.</b> Two sums of continuous-time sinusoids.<br>'
     +'<b>Find.</b> Whether each sum repeats, and its fundamental period.<br>'
     +'<b>Method.</b> Every continuous-time sinusoid $\\cos(\\omega t)$ is periodic, with $T=2\\pi/|\\omega|$, because $\\cos(\\omega(t+T))=\\cos(\\omega t+2\\pi)=\\cos(\\omega t)$. A sum of two terms repeats with period $T_0$ only if $T_0$ is a whole number of periods of each term: $T_0=mT_1=nT_2$ with $m,n$ positive integers. That needs $T_1/T_2=n/m$ rational, and $T_0$ is then found from the smallest such pair $(m,n)$.<br>'
     +'<b>Solution — (i).</b> The periods of the two terms are$$T_1=\\frac{2\\pi}{3},\\qquad T_2=\\frac{2\\pi}{5}.$$Their ratio is$$\\frac{T_1}{T_2}=\\frac{2\\pi}{3}\\cdot\\frac{5}{2\\pi}=\\frac{5}{3},$$rational, so the sum repeats. From $T_0=mT_1=nT_2$ we need $\\dfrac{n}{m}=\\dfrac{T_1}{T_2}=\\dfrac53$. The smallest positive integers are $m=3$, $n=5$, so$$T_0=3T_1=3\\cdot\\frac{2\\pi}{3}=2\\pi=5\\cdot\\frac{2\\pi}{5}=5T_2,\\qquad\\omega_0=\\frac{2\\pi}{T_0}=\\frac{2\\pi}{2\\pi}=1\\;\\text{rad/s}.$$'
     +'<b>Solution — (ii).</b> The periods are$$T_1=\\frac{2\\pi}{1}=2\\pi,\\qquad T_2=\\frac{2\\pi}{\\sqrt2}=\\sqrt2\\,\\pi,$$using $\\dfrac{2}{\\sqrt2}=\\sqrt2$. Their ratio is$$\\frac{T_1}{T_2}=\\frac{2\\pi}{\\sqrt2\\,\\pi}=\\frac{2}{\\sqrt2}=\\sqrt2,$$irrational. No integers $m,n$ give $mT_1=nT_2$, so no common length exists and the sum is <b>not periodic</b>. Each term alone still is.<br>'
     +'<b>Check.</b> In (i) the two terms are the $3$rd and $5$th harmonic of $\\omega_0=1$: $3=3\\cdot1$ and $5=5\\cdot1$. Since $\\gcd(3,5)=1$, no larger $\\omega_0$ divides both frequencies, so $T_0=2\\pi$ cannot be reduced. In (ii) no $\\omega_0$ makes both $1$ and $\\sqrt2$ integer multiples of it, which is the same statement as $\\sqrt2$ being irrational.<br>'
     +'<b>Contrast with discrete time.</b> In continuous time it is the <em>ratio</em> of two frequencies that must be rational. In discrete time each frequency has to satisfy its own rationality condition against $2\\pi$ first.',
  err:'Concluding from $T_1/T_2$ rational that $T_0=T_1T_2$. In (i) that would give $4\\pi^2/15$, which is not a period of either term.',
  teach:'Use case (ii) to show that two periodic signals can have a sum that is not periodic. Their periods must also have a rational ratio.' },

{ id:'D1-04', module:'M1', type:'period',
  stem:'Let $$x(t)=2e^{-0.3t}\\cos(4t),\\qquad t\\in\\mathbb{R},$$a sinusoid whose envelope is $\\pm2e^{-0.3t}$.',
  parts:['State the period $T_0$ of the pure oscillation $y(t)=2\\cos(4t)$, the case $r=0$.',
         'Prove that $x(t)$ itself is not periodic, by testing the necessary condition $x(0)=x(T)$ for a candidate period $T>0$.',
         'Explain why no signal whose envelope is strictly monotonic can be periodic.'],
  sol:'<b>Given.</b> A damped sinusoid, envelope $2e^{-0.3t}$, angular frequency $4$ rad/s.<br>'
     +'<b>Find.</b> Whether the damped signal repeats.<br>'
     +'<b>Method.</b> If $x(t)$ were periodic with period $T>0$, then $x(t)=x(t+T)$ would hold for <em>every</em> $t$, in particular at $t=0$. Testing that one instant is enough to rule periodicity out.<br>'
     +'<b>Solution — part (a).</b> $y(t)=2\\cos(4t)$ has $\\omega_0=4$ rad/s, so$$T_0=\\frac{2\\pi}{\\omega_0}=\\frac{2\\pi}{4}=\\frac{\\pi}{2}\\;\\text{s}.$$'
     +'<b>Solution — part (b).</b> Evaluate at $t=0$:$$x(0)=2e^{-0.3\\cdot0}\\cos(4\\cdot0)=2\\cdot1\\cdot1=2.$$A period $T>0$ would require $x(T)=x(0)$, that is$$2e^{-0.3T}\\cos(4T)=2.$$Divide both sides by $2e^{-0.3T}$, which is never zero:$$\\cos(4T)=\\frac{1}{e^{-0.3T}}=e^{0.3T}.$$Now compare the two sides. For every $T>0$ the exponent $0.3T$ is positive, so $e^{0.3T}>e^{0}=1$. But $\\cos(4T)\\le1$ for every $T$. The left side never exceeds $1$ and the right side always does, so no positive $T$ satisfies even this one necessary condition. <b>$x(t)$ is not periodic.</b><br>'
     +'<b>Solution — part (c).</b> A periodic signal must return to the same value after each period. A strictly monotonic envelope takes a different value at any two distinct times, so the full signal cannot repeat exactly.<br>'
     +'<b>Check.</b> The same argument holds without picking $t=0$. For a candidate period $T\\neq0$, the envelope at $t$ and at $t+T$ differs: $2e^{-0.3t}\\neq2e^{-0.3(t+T)}$, because $e^{-0.3(t+T)}=e^{-0.3t}e^{-0.3T}$ and $e^{-0.3T}\\neq1$ when $T\\neq0$. The envelope is strictly decreasing and therefore injective. Injectivity of the envelope alone is already enough to block periodicity, independently of the oscillation inside it.',
  err:'Reporting $T_0=\\pi/2$ for $x(t)$ itself, by testing periodicity of the cosine factor only and ignoring that the full signal must return to the same value, not just the same phase.',
  teach:'Ask why the argument in part (b) only needs one instant, $t=0$, rather than checking all $t$. It is because periodicity is a universal claim, and a universal claim is refuted by a single counterexample.' },

{ id:'D1-05', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'The signal $x(t)$ sketched below is zero outside $0\\le t\\le5$.',
  parts:['Calculate the total energy $E_\\infty$.',
         'Calculate the average power $P_\\infty$ and classify the signal.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,6.6],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[2,2],[3,2],[5,0],[6.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A trapezoidal pulse: $x(t)=t$ on $0\\le t\\le2$, $x(t)=2$ on $2\\le t\\le3$, $x(t)=5-t$ on $3\\le t\\le5$, zero elsewhere. Energy and power are normalised, $R=1\\,\\Omega$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Start from the definition $E_\\infty=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t$. Outside the support the integrand is zero, so only three pieces contribute. Square each piece, integrate it with its own limits, and add.<br>'
     +'<b>Solution — part (a).</b> Substitute the three pieces into the definition:$$E_\\infty=\\int_{0}^{2}t^{2}\\,\\d t+\\int_{2}^{3}2^{2}\\,\\d t+\\int_{3}^{5}(5-t)^{2}\\,\\d t.$$Evaluate each integral separately.$$\\begin{aligned}\\int_{0}^{2}t^{2}\\,\\d t&=\\left[\\frac{t^{3}}{3}\\right]_{0}^{2}=\\frac{8}{3}-0=\\frac83,\\\\[4pt]\\int_{2}^{3}4\\,\\d t&=\\bigl[4t\\bigr]_{2}^{3}=12-8=4,\\\\[4pt]\\int_{3}^{5}(5-t)^{2}\\,\\d t&=\\int_{2}^{0}s^{2}\\,(-\\d s)=\\int_{0}^{2}s^{2}\\,\\d s=\\left[\\frac{s^{3}}{3}\\right]_{0}^{2}=\\frac83,\\end{aligned}$$where the third line uses the substitution $s=5-t$, $\\d s=-\\d t$, with $t=3\\mapsto s=2$ and $t=5\\mapsto s=0$. Adding the three results,$$E_\\infty=\\frac83+4+\\frac83=\\frac{8+12+8}{3}=\\frac{28}{3}\\;\\text{J}\\approx9.333\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> Start from the definition$$P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t.$$For every $T>5$ the window $[-T,T]$ contains the whole support $[0,5]$, so the integral inside equals the full energy, $\\tfrac{28}{3}$, and no longer depends on $T$:$$P_\\infty=\\lim_{T\\to\\infty}\\frac{28/3}{2T}=\\lim_{T\\to\\infty}\\frac{14}{3T}=0\\;\\text{W}.$$The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two sloping parts are reflections of each other about $t=2.5$, so each must contribute the same energy, and both gave $\\tfrac83$. Also, the pulse never exceeds $2$ and lasts $5$ seconds, so $E_\\infty\\le2^{2}\\cdot5=20$. The result $\\tfrac{28}{3}\\approx9.33$ satisfies this bound. The classification uses both results: $E_\\infty<\\infty$ and $P_\\infty=0$.',
  err:'Reporting $P_\\infty=(28/3)/5$ by averaging over the support instead of over $[-T,T]$ with $T\\to\\infty$. The averaging window is the whole axis, not the part where the signal is non-zero.',
  teach:'Ask for both numbers every time. A student who writes only $E_\\infty$ has not distinguished the energy class from the power class.' },

{ id:'D1-06', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'Consider the two discrete-time signals $$x_1[n]=\\left(\\tfrac25\\right)^{\\!n}u[n],\\qquad x_2[n]=3\\,u[n].$$',
  parts:['Calculate $E_\\infty$ and $P_\\infty$ for $x_1[n]$.',
         'Calculate $E_\\infty$ and $P_\\infty$ for $x_2[n]$.',
         'Classify each signal.'],
  sol:'<b>Given.</b> A decaying geometric sequence and a scaled unit step.<br>'
     +'<b>Find.</b> Energy, power and class for each.<br>'
     +'<b>Method.</b> In discrete time,$$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2},\\qquad P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}.$$Square first. For a geometric series use $\\sum_{n=0}^{\\infty}r^{n}=\\dfrac{1}{1-r}$, valid when $|r|<1$. For a step, count the non-zero samples in the window.<br>'
     +'<b>Solution — part (a).</b> Square the sequence: $|x_1[n]|^{2}=\\left(\\tfrac25\\right)^{2n}u[n]=\\left(\\tfrac{4}{25}\\right)^{n}u[n]$. The step removes every term with $n<0$, so$$E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac{4}{25}\\right)^{n}.$$This is a geometric series with ratio $r=\\tfrac{4}{25}$, and $|r|<1$, so it converges:$$E_\\infty=\\frac{1}{1-\\tfrac{4}{25}}=\\frac{1}{\\tfrac{25-4}{25}}=\\frac{1}{\\tfrac{21}{25}}=\\frac{25}{21}.$$The energy is finite. For the power, every window sum is at most the full energy, so$$0\\le P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x_1[n]|^{2}\\le\\lim_{N\\to\\infty}\\frac{25/21}{2N+1}=0,$$hence $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> Square the sequence: $|x_2[n]|^{2}=9\\,u[n]$. The energy sum is $\\sum_{n=0}^{\\infty}9$, whose partial sums $9(N+1)$ grow without bound, so the energy sum diverges: $E_\\infty\\to\\infty$. For the power, the window $-N\\le n\\le N$ contains $N+1$ non-zero samples (those with $0\\le n\\le N$) out of $2N+1$, each contributing $9$:$$\\sum_{n=-N}^{N}9\\,u[n]=\\sum_{n=0}^{N}9=9(N+1).$$Divide by the window length and take the limit. Dividing numerator and denominator by $N$,$$P_\\infty=\\lim_{N\\to\\infty}\\frac{9(N+1)}{2N+1}=\\lim_{N\\to\\infty}\\frac{9\\left(1+\\tfrac1N\\right)}{2+\\tfrac1N}=\\frac{9\\cdot1}{2}=\\frac92=4.5.$$'
     +'<b>Solution — part (c).</b> $x_1$ is an <b>energy signal</b>; $x_2$ is a <b>power signal</b>.<br>'
     +'<b>Check.</b> The counting argument gives $P_\\infty=A^{2}/2$ for a constant sequence of amplitude $A$ that begins at $n=0$. With $A=3$, this gives $9/2$, as in part (b). In part (a), the first term is $1$ and all later terms are positive and smaller, so $25/21\\approx1.19$ is consistent with the sequence.',
  err:'Writing $P_\\infty=9$ for $x_2$ by evaluating the sum only over $n\\ge0$ and dividing by $N+1$ instead of $2N+1$. The window is symmetric about the origin, and the zeros on the negative side count in the denominator.',
  teach:'Require the counting ratio $(N+1)/(2N+1)$. It explains the factor $1/2$ and also applies to $3u[n-4]$, where the limit is still $9/2$.' },

{ id:'D1-07', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'With the normalised convention $R=1\\,\\Omega$, consider $$x_1(t)=e^{-5t}u(t)\\;\\text{V},\\qquad x_2(t)=4\\cos(3t)\\;\\text{V}.$$',
  parts:['Calculate $E_\\infty$ for $x_1(t)$ and state $P_\\infty$.',
         'Calculate $P_\\infty$ for $x_2(t)$ and state $E_\\infty$.',
         'Starting from $P_T=\\dfrac{1}{2T}\\displaystyle\\int_{-T}^{T}|x(t)|^{2}\\,\\d t$, show directly that a finite $E_\\infty$ forces $P_\\infty=0$.'],
  sol:'<b>Given.</b> A decaying exponential and a sinusoid, both in volts across $1\\,\\Omega$.<br>'
     +'<b>Find.</b> Energy, power, and a general proof that the two classes cannot overlap.<br>'
     +'<b>Method.</b> Square, then integrate over the axis for energy or average over a growing window for power. For a periodic signal the infinite average equals the average over one period, because every window of length $2T$ holds the same number of whole periods up to a remainder that vanishes in the limit.<br>'
     +'<b>Solution — part (a).</b> Square the signal: $|x_1(t)|^{2}=e^{-10t}u(t)$. The step removes $t<0$, so$$E_\\infty=\\int_{0}^{\\infty}e^{-10t}\\,\\d t=\\left[-\\tfrac{1}{10}e^{-10t}\\right]_{0}^{\\infty}=\\Bigl(\\lim_{t\\to\\infty}-\\tfrac{1}{10}e^{-10t}\\Bigr)-\\Bigl(-\\tfrac{1}{10}e^{0}\\Bigr)=0+\\tfrac{1}{10}=\\tfrac{1}{10}\\;\\text{J},$$using $e^{-10t}\\to0$ as $t\\to\\infty$. The energy is finite, so by part (c) $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> Square the signal: $|x_2(t)|^{2}=16\\cos^{2}(3t)$. The signal has period $T_0=\\dfrac{2\\pi}{3}$. Use the identity $\\cos^{2}\\theta=\\tfrac12\\bigl(1+\\cos2\\theta\\bigr)$ with $\\theta=3t$:$$\\begin{aligned}P_\\infty&=\\frac{1}{T_0}\\int_{0}^{T_0}16\\cos^{2}(3t)\\,\\d t=\\frac{16}{T_0}\\int_{0}^{T_0}\\tfrac12\\bigl(1+\\cos6t\\bigr)\\,\\d t\\\\[4pt]&=\\frac{8}{T_0}\\left[t+\\frac{\\sin6t}{6}\\right]_{0}^{T_0}=\\frac{8}{T_0}\\left(T_0+\\frac{\\sin4\\pi}{6}-0-0\\right)=\\frac{8}{T_0}\\cdot T_0=8\\;\\text{W},\\end{aligned}$$where $6T_0=6\\cdot\\tfrac{2\\pi}{3}=4\\pi$ and $\\sin4\\pi=0$. Since $P_\\infty\\neq0$, the energy is infinite: the window integral $\\int_{-T}^{T}|x_2|^{2}\\,\\d t=2T\\,P_T$ grows like $16T$ without bound.<br>'
     +'<b>Solution — part (c).</b> For any finite $T$,$$P_T=\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\le\\frac{1}{2T}\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{E_\\infty}{2T},$$because the integrand is non-negative and $[-T,T]$ is only part of the whole axis, so widening the limits cannot decrease the integral. If $E_\\infty<\\infty$, the right-hand side $\\to0$ as $T\\to\\infty$. Since also $P_T\\ge0$ for every $T$,$$0\\le P_T\\le\\frac{E_\\infty}{2T}\\to0,$$and $P_\\infty=\\lim_{T\\to\\infty}P_T=0$ by the squeeze.<br>'
     +'<b>Check.</b> Apply the bound in part (c) to $x_1$. Since $E_\\infty=1/10$, $P_T\\le\\dfrac{1/10}{2T}=\\dfrac{1}{20T}\\to0$, which confirms $P_\\infty=0$. For $x_2$, the sinusoidal power formula $P=A^{2}/2$ gives $16/2=8$, which confirms part (b).',
  err:'Reporting $P_\\infty=16$ for the sinusoid by forgetting the factor $\\tfrac12$ from the time average of $\\cos^{2}$.',
  teach:'Part (c) proves the result used in D1-05 and D1-06. Require the inequality $P_T\\le E_\\infty/2T$, because it explains why finite energy gives zero average power.' },

{ id:'D1-08', module:'M1', type:'energy',
  stem:'Let $$x[n]=\\begin{cases}2^{\\,n}, & n\\le-1,\\\\[2pt] 3, & n=0,\\\\[2pt] \\left(\\tfrac12\\right)^{\\!n}, & n\\ge1.\\end{cases}$$',
  parts:['List $x[n]$ for $-3\\le n\\le3$.',
         'Calculate $E_\\infty$.',
         'State $P_\\infty$ and classify the signal.'],
  sol:'<b>Given.</b> A two-sided sequence, defined by a different formula on each of three ranges of $n$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Start from $E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}$. Split the sum at the same three ranges the signal is defined on, and evaluate each geometric series separately with $\\sum_{m=1}^{\\infty}r^{m}=\\dfrac{r}{1-r}$ for $|r|<1$.<br>'
     +'<b>Solution — part (a).</b> From the three formulas: $x[-3]=2^{-3}=\\tfrac18$, $x[-2]=2^{-2}=\\tfrac14$, $x[-1]=2^{-1}=\\tfrac12$, $x[0]=3$, $x[1]=\\left(\\tfrac12\\right)^{1}=\\tfrac12$, $x[2]=\\left(\\tfrac12\\right)^{2}=\\tfrac14$, $x[3]=\\left(\\tfrac12\\right)^{3}=\\tfrac18$.<br>'
     +'<b>Solution — part (b).</b> Square each piece: for $n\\le-1$, $|2^{n}|^{2}=4^{n}$; at $n=0$, $3^{2}=9$; for $n\\ge1$, $\\left(\\tfrac12\\right)^{2n}=\\left(\\tfrac14\\right)^{n}=4^{-n}$. So$$E_\\infty=\\sum_{n=-\\infty}^{-1}4^{n}+9+\\sum_{n=1}^{\\infty}4^{-n}.$$In the first sum substitute $m=-n$. As $n$ runs from $-\\infty$ to $-1$, $m$ runs from $\\infty$ down to $1$, and $4^{n}=4^{-m}$:$$\\sum_{n=-\\infty}^{-1}4^{n}=\\sum_{m=1}^{\\infty}4^{-m}=\\sum_{m=1}^{\\infty}\\left(\\tfrac14\\right)^{m}.$$This is a geometric series with ratio $r=\\tfrac14$ and first term $\\tfrac14$; since $|r|<1$,$$\\sum_{m=1}^{\\infty}\\left(\\tfrac14\\right)^{m}=\\frac{\\tfrac14}{1-\\tfrac14}=\\frac{\\tfrac14}{\\tfrac34}=\\frac13.$$The third sum is the same series, also $\\tfrac13$. So$$E_\\infty=\\frac13+9+\\frac13=\\frac{1+27+1}{3}=\\frac{29}{3}\\;\\text{J}\\approx9.667\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> $E_\\infty$ is finite, so $P_\\infty\\le\\lim_{N\\to\\infty}\\dfrac{E_\\infty}{2N+1}=0$, and $P_\\infty=0$. The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two tails are reflections of each other about $n=0$, so their energy contributions must be equal. Both give $\\tfrac13$. Also, each tail contributes less than $1$, so $E_\\infty<9+2=11$. The result $\\tfrac{29}{3}\\approx9.67$ satisfies this bound.',
  err:'Treating the piecewise definition as three separate signals to classify, and reporting three different answers instead of one $E_\\infty$ for the single sequence $x[n]$ they together define.',
  teach:'Ask for the table in part (a) before the sum is attempted. A student who cannot list seven values correctly will not get the two geometric series right either.' },

{ id:'D1-09', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The signal $x(t)$ is sketched below: it rises linearly from $0$ at $t=-2$ to $2$ at $t=0$, stays at $2$ until $t=1$, and is zero elsewhere.',
  parts:['Plot $y(t)=x(2t+2)$.',
         'State the support of $y(t)$ and check its width against the width of $x(t)$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,2.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3,0],[-2,0],[0,2],[1,2],[1,0],[2.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x(t)=t+2$ on $-2\\le t\\le0$, $x(t)=2$ on $0\\le t\\le1$, zero elsewhere.<br>'
     +'<b>Find.</b> $y(t)=x(2t+2)$.<br>'
     +'<b>Method.</b> Write the argument in the standard form $x(at-b)$. Matching $at-b=2t+2$ gives $a=2$ and $b=-2$. Shift first, then scale, because reversing these operations produces a different argument. Then confirm the result by substituting $2t+2$ into each piece of $x$ directly.<br>'
     +'<b>Solution — step 1, shift.</b> $v(t)=x(t-b)=x(t+2)$. It is non-zero where the argument lies in the support of $x$:$$-2\\le t+2\\le1\\;\\Longrightarrow\\;-4\\le t\\le-1,$$so the support moves two seconds to the left, to $-4\\le t\\le-1$.<br>'
     +'<b>Solution — step 2, scale.</b> $y(t)=v(2t)$. It is non-zero where $2t$ lies in the support of $v$:$$-4\\le2t\\le-1\\;\\Longrightarrow\\;-2\\le t\\le-\\tfrac12.$$The support is compressed by $2$ to $-2\\le t\\le-0.5$.<br>'
     +'<b>Solution — the formula.</b> Substitute $2t+2$ into each piece. The first piece of $x$ applies where its argument lies in $[-2,0]$:$$-2\\le2t+2\\le0\\;\\Longrightarrow\\;-4\\le2t\\le-2\\;\\Longrightarrow\\;-2\\le t\\le-1,$$and there $y(t)=(2t+2)+2=2t+4$. The second piece applies where the argument lies in $[0,1]$:$$0\\le2t+2\\le1\\;\\Longrightarrow\\;-2\\le2t\\le-1\\;\\Longrightarrow\\;-1\\le t\\le-\\tfrac12,$$and there $y(t)=2$. Together,$$y(t)=\\begin{cases}2t+4,&-2\\le t\\le-1,\\\\[2pt] 2,&-1\\le t\\le-0.5,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Check.</b> The support of $x$ has width $1-(-2)=3$ seconds. Compression by $|a|=2$ must give width $3/2=1.5$ seconds, and $-0.5-(-2)=1.5$. Also, $y(-2)=x(2\\cdot(-2)+2)=x(-2)=0$ and $y(-0.5)=x(2\\cdot(-0.5)+2)=x(1)=2$, so the endpoint values agree with the plot.',
  figSol:()=>{const y=t=>(t>=-2&&t<=-1)?2*t+4:(t>-1&&t<=-0.5)?2:0;
    const a=P.Axes({w:1080,h:270,xr:[-3,0.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [-2,-1,-0.5].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Scaling first and then shifting by $-2$, which produces $x(2(t-2))=x(2t-4)$ and places the result on the wrong part of the axis.',
  teach:'Ask the student to draw the intermediate signal $v(t)$. It separates the shift from the scaling and makes an incorrect operation visible.' },

{ id:'D1-10', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The sequence $x[n]$ is plotted below.',
  parts:['Plot $y[n]=x[2-n]$.',
         'Plot $z[n]=x[n+1]$ and say which of the two operations changes the order of the samples.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-1,2],[0,-1],[1,3],[2,-2]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[-1]=2$, $x[0]=-1$, $x[1]=3$, $x[2]=-2$, and zero elsewhere.<br>'
     +'<b>Find.</b> A reflection with a shift, and a plain shift.<br>'
     +'<b>Method.</b> For $y[n]=x[2-n]$, the output at index $n$ copies the input at index $m=2-n$. Solving for $n$, the sample originally at index $m$ moves to $n=2-m$. Map the four non-zero indices one at a time. For $z[n]=x[n+1]$, the output at $n$ copies the input at $m=n+1$, so the sample at $m$ moves to $n=m-1$.<br>'
     +'<b>Solution — part (a).</b> Apply $n=2-m$ to each non-zero index and carry the value:$$\\begin{aligned}m=-1&\\to n=2-(-1)=3,&y[3]&=x[-1]=2,\\\\m=0&\\to n=2-0=2,&y[2]&=x[0]=-1,\\\\m=1&\\to n=2-1=1,&y[1]&=x[1]=3,\\\\m=2&\\to n=2-2=0,&y[0]&=x[2]=-2.\\end{aligned}$$So $y[0]=-2$, $y[1]=3$, $y[2]=-1$, $y[3]=2$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Apply $n=m-1$ to each non-zero index:$$\\begin{aligned}m=-1&\\to n=-2,&z[-2]&=x[-1]=2,\\\\m=0&\\to n=-1,&z[-1]&=x[0]=-1,\\\\m=1&\\to n=0,&z[0]&=x[1]=3,\\\\m=2&\\to n=1,&z[1]&=x[2]=-2.\\end{aligned}$$The advance moves the pattern one place to the left without disturbing it; only the reflection reverses the order of the samples.<br>'
     +'<b>Check.</b> Both operations preserve the four non-zero samples. For (a), $y[3]=x[2-3]=x[-1]=2$, as listed. In increasing index order, $x$ gives $2,-1,3,-2$ and $y$ gives $-2,3,-1,2$, so the reflection reverses the order. The shifted signal $z$ keeps the order $2,-1,3,-2$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[0,-2],[1,3],[2,-1],[3,2]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,2.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'z[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[-2,2],[-1,-1],[0,3],[1,-2]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x[2-n]$ as "reflect, then shift left by two", which gives $x(-(n+2))=x(-n-2)$ and puts the pattern in the wrong place.',
  teach:'Require the index-mapping table. It shows where every non-zero sample moves and makes the reflection explicit.' },

{ id:'D1-11', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The signal $x(t)$ sketched below is a symmetric triangular pulse of height $1$, zero outside $-1\\le t\\le1$.',
  parts:['Plot $y(t)=x\\!\\left(1-\\tfrac{t}{3}\\right)$.',
         'State the support of $y(t)$ and check its width against the width of $x(t)$.',
         'Verify the location of the peak of $y(t)$ by direct substitution.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-2,2],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-1.6,0],[-1,0],[0,1],[1,0],[1.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x(t)=t+1$ on $-1\\le t\\le0$, $x(t)=1-t$ on $0\\le t\\le1$, zero elsewhere, with a peak of $1$ at $t=0$.<br>'
     +'<b>Find.</b> $y(t)=x\\!\\left(1-\\tfrac{t}{3}\\right)$.<br>'
     +'<b>Method.</b> Matching $at-b=1-\\tfrac t3$ gives $a=-\\tfrac13$ and $b=-1$ in the form $x(at-b)$. The coefficient is negative and fractional, so the transformation reflects and expands as well as shifts. Map the support first by solving inequalities on the argument $s=1-t/3$, then substitute directly to get the two-piece formula.<br>'
     +'<b>Solution — the support.</b> $y(t)$ is non-zero where the argument $s=1-t/3$ lies in $[-1,1]$. Solve the double inequality one step at a time:$$-1\\le1-\\tfrac{t}{3}\\le1\\;\\Longrightarrow\\;-2\\le-\\tfrac{t}{3}\\le0\\;\\Longrightarrow\\;6\\ge t\\ge0,$$where the first step subtracts $1$ throughout and the second multiplies by $-3$, which reverses both inequalities. So the support of $y$ is $0\\le t\\le6$.<br>'
     +'<b>Solution — the formula.</b> The falling piece $x(s)=1-s$ applies where $0\\le s\\le1$:$$0\\le1-\\tfrac{t}{3}\\le1\\;\\Longrightarrow\\;-1\\le-\\tfrac{t}{3}\\le0\\;\\Longrightarrow\\;0\\le t\\le3,$$and there$$y(t)=1-\\left(1-\\tfrac{t}{3}\\right)=1-1+\\tfrac{t}{3}=\\frac{t}{3}.$$The rising piece $x(s)=s+1$ applies where $-1\\le s\\le0$:$$-1\\le1-\\tfrac{t}{3}\\le0\\;\\Longrightarrow\\;-2\\le-\\tfrac{t}{3}\\le-1\\;\\Longrightarrow\\;3\\le t\\le6,$$and there$$y(t)=\\left(1-\\tfrac{t}{3}\\right)+1=2-\\frac{t}{3}.$$'
     +'<b>Solution — part (c).</b> The peak of $x$ is at $s=0$. Setting $1-t/3=0$ gives $t/3=1$, so $t=3$. Both branches agree there: $y(3)=3/3=1$ from the first and $y(3)=2-3/3=1$ from the second, matching the peak height $1$.<br>'
     +'<b>Check.</b> Width: $x$ occupies $1-(-1)=2$ seconds, and expansion by $1/|a|=3$ must give $2\\cdot3=6$ seconds, which the support $[0,6]$ has. Endpoint check: $y(0)=x(1-0)=x(1)=0$ and $y(6)=x(1-2)=x(-1)=0$, both matching the zeros at the edges of the plot. The reflection is visible in the shape: the rising half of $x$ (for $t<0$) has become the falling half of $y$ (for $t>3$).',
  figSol:()=>{const y=t=>(t>=0&&t<=3)?t/3:(t>3&&t<=6)?2-t/3:0;
    const a=P.Axes({w:1080,h:270,xr:[-1,7],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [0,3,6].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Applying the expansion factor $3$ but forgetting the sign of $a$. This omits the reflection and gives the wrong order of the two halves.',
  teach:'Ask the student to state the sign of $a$ before drawing. A negative value of $a$ means that the transformation includes a reflection.' },

{ id:'D1-12', module:'M1', type:'transform',
  stem:'A signal $x(t)$ is known only to satisfy $x(t)=0$ outside $2\\le t\\le8$, with a single, unique maximum at $t=5$. No other property of $x(t)$ is given. Let $y(t)=x(-3t+6)$.',
  parts:['Find the support of $y(t)$ as an interval, using inequalities on the argument of $x$.',
         'Find the value of $t$ at which $y(t)$ reaches its maximum.',
         'A second transformation is applied, $z(t)=y(t-4)$. Find the support of $z(t)$ from the support of $y(t)$. Then find it again from the support of $x(t)$ and compare the results.'],
  sol:'<b>Given.</b> Only the support and the location of the maximum of $x(t)$; its shape is unknown.<br>'
     +'<b>Find.</b> The support and the peak location of two signals built from $x$ by transformations of the argument, without ever needing the formula for $x$.<br>'
     +'<b>Method.</b> $y(t)=x(-3t+6)$ is non-zero exactly where the argument $-3t+6$ lies in the support of $x$, and it peaks exactly where the argument equals $5$. So each question is an inequality or an equation in $t$. No value of $x$ itself is needed.<br>'
     +'<b>Solution — part (a).</b> $y(t)\\neq0$ exactly where $2\\le-3t+6\\le8$. Solve one step at a time. Subtract $6$ throughout:$$-4\\le-3t\\le2.$$Divide by $-3$; a negative divisor reverses both inequalities:$$\\frac{-4}{-3}\\ge t\\ge\\frac{2}{-3}\\;\\Longrightarrow\\;-\\tfrac23\\le t\\le\\tfrac43.$$So the support of $y$ is $\\left[-\\tfrac23,\\tfrac43\\right]$.<br>'
     +'<b>Solution — part (b).</b> $x$ peaks where its argument equals $5$. Set $-3t+6=5$, subtract $6$: $-3t=-1$, divide by $-3$: $t=\\tfrac13$. This lies inside $\\left[-\\tfrac23,\\tfrac43\\right]$, as it must.<br>'
     +'<b>Solution — part (c).</b> <em>From $y$.</em> $z(t)=y(t-4)$ is non-zero where $t-4$ lies in the support of $y$:$$-\\tfrac23\\le t-4\\le\\tfrac43\\;\\Longrightarrow\\;-\\tfrac23+4\\le t\\le\\tfrac43+4\\;\\Longrightarrow\\;\\tfrac{10}{3}\\le t\\le\\tfrac{16}{3},$$using $4=\\tfrac{12}{3}$. <em>From $x$.</em> Substitute $t-4$ into the argument of $y$:$$z(t)=x\\bigl(-3(t-4)+6\\bigr)=x(-3t+12+6)=x(-3t+18).$$This is non-zero where $2\\le-3t+18\\le8$. Subtract $18$: $-16\\le-3t\\le-10$. Divide by $-3$ and reverse: $\\tfrac{16}{3}\\ge t\\ge\\tfrac{10}{3}$. The two routes give the same interval $\\left[\\tfrac{10}{3},\\tfrac{16}{3}\\right]$.<br>'
     +'<b>Check.</b> The support of $x$ has width $8-2=6$. Compression by $|a|=3$ must give width $6/3=2$ for both $y$ and $z$. The intervals give $\\tfrac43-\\left(-\\tfrac23\\right)=\\tfrac63=2$ and $\\tfrac{16}{3}-\\tfrac{10}{3}=\\tfrac63=2$. The two calculations in part (c) also give the same support for $z$.',
  err:'Solving $-3t+6\\in[2,8]$ without reversing the inequalities after division by the negative coefficient. This gives the wrong interval $\\left[-\\tfrac43,\\tfrac23\\right]$.',
  teach:'This question cannot be answered by drawing a picture, because no picture of $x$ exists. It isolates whether a student understands the transformation as a mapping on the argument, independent of the signal\'s shape.' },

{ id:'D1-13', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'Let $x(t)=3e^{-4t}u(t)$.',
  parts:['Find $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$ and plot both.',
         'Calculate $E_\\infty$ for $x(t)$, for its even part, and for its odd part.',
         'Comment on the relation between the three energies.'],
  sol:'<b>Given.</b> A causal decaying exponential.<br>'
     +'<b>Find.</b> Its even and odd parts, and the three energies.<br>'
     +'<b>Method.</b> Build $x(-t)$ first by replacing $t$ with $-t$: $x(-t)=3e^{-4(-t)}u(-t)=3e^{4t}u(-t)$. Then$$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)],\\qquad\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)],$$evaluated separately for $t>0$ and $t<0$. For the energies, square and integrate.<br>'
     +'<b>Solution — part (a).</b> For $t>0$, $u(t)=1$ and $u(-t)=0$, so only $x(t)$ is present:$$\\Ev\\{x(t)\\}=\\tfrac12\\bigl(3e^{-4t}+0\\bigr)=\\tfrac32e^{-4t},\\qquad\\Od\\{x(t)\\}=\\tfrac12\\bigl(3e^{-4t}-0\\bigr)=\\tfrac32e^{-4t}.$$For $t<0$, $u(t)=0$ and $u(-t)=1$, so only $x(-t)$ is present:$$\\Ev\\{x(t)\\}=\\tfrac12\\bigl(0+3e^{4t}\\bigr)=\\tfrac32e^{4t},\\qquad\\Od\\{x(t)\\}=\\tfrac12\\bigl(0-3e^{4t}\\bigr)=-\\tfrac32e^{4t}.$$Since $|t|=t$ for $t>0$ and $|t|=-t$ for $t<0$, the two even-part formulas combine into one:$$\\Ev\\{x(t)\\}=\\tfrac32e^{-4|t|},\\qquad\\Od\\{x(t)\\}=\\tfrac32e^{-4t}u(t)-\\tfrac32e^{4t}u(-t).$$The even part is a two-sided decaying exponential of height $\\tfrac32$. The odd part is positive for $t>0$, negative for $t<0$, and jumps from $-\\tfrac32$ to $\\tfrac32$ at the origin.<br>'
     +'<b>Solution — part (b).</b> Square $x$: $|x(t)|^{2}=9e^{-8t}u(t)$. Then$$E_x=\\int_{0}^{\\infty}9e^{-8t}\\,\\d t=9\\left[-\\tfrac18e^{-8t}\\right]_{0}^{\\infty}=9\\left(0+\\tfrac18\\right)=\\tfrac98.$$Square the even part: $\\left(\\tfrac32e^{-4|t|}\\right)^{2}=\\tfrac94e^{-8|t|}$. The integrand is even, so the integral over the whole axis is twice the integral over $t>0$:$$E_{\\Ev}=\\int_{-\\infty}^{\\infty}\\tfrac94e^{-8|t|}\\,\\d t=2\\cdot\\tfrac94\\int_{0}^{\\infty}e^{-8t}\\,\\d t=\\tfrac92\\left[-\\tfrac18e^{-8t}\\right]_{0}^{\\infty}=\\tfrac92\\cdot\\tfrac18=\\tfrac{9}{16}.$$Square the odd part: the sign disappears, and $|\\Od\\{x(t)\\}|^{2}=\\tfrac94e^{-8|t|}$ is the same integrand, so by the same computation $E_{\\Od}=\\tfrac{9}{16}$.<br>'
     +'<b>Solution — part (c).</b> $E_{\\Ev}+E_{\\Od}=\\tfrac{9}{16}+\\tfrac{9}{16}=\\tfrac{18}{16}=\\tfrac98=E_x$. The energies add because the even and odd parts are orthogonal. Expanding $|x|^{2}=|\\Ev\\{x\\}+\\Od\\{x\\}|^{2}$ gives $|\\Ev\\{x\\}|^{2}+|\\Od\\{x\\}|^{2}+2\\,\\Ev\\{x\\}\\Od\\{x\\}$, and the cross term $\\int\\Ev\\{x\\}\\Od\\{x\\}\\,\\d t$ is the integral of an odd function (even times odd) over a symmetric interval, which is zero.<br>'
     +'<b>Check.</b> The two parts add back to $x$: for $t>0$ they give $\\tfrac32e^{-4t}+\\tfrac32e^{-4t}=3e^{-4t}$, and for $t<0$ they give $\\tfrac32e^{4t}-\\tfrac32e^{4t}=0$, both as required. Scaling the amplitude by a factor of $3$ instead of $1$ has scaled every energy by $3^{2}=9$ compared with a unit-amplitude version, which is the expected quadratic dependence for a squared quantity.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.2,1.2],yr:[-0.15,1.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:0.5,ystep:0.5});
      a.curve(t=>1.5*Math.exp(-4*Math.abs(t)),{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.2,1.2],yr:[-1.7,1.7],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:32,b:38},xstep:0.5,ystep:0.5});
      a.curve(t=>t>0?1.5*Math.exp(-4*t):null,{color:C.mid});
      a.curve(t=>t<0?-1.5*Math.exp(4*t):null,{color:C.mid});
      return a.svg();})()),
  err:'Writing $\\Od\\{x\\}=\\tfrac32e^{-4|t|}\\operatorname{sgn}(t)$ and then claiming it is continuous at the origin. It is not: the odd part of a signal with a jump at $t=0$ inherits that jump.',
  teach:'The orthogonality argument in part (c) is the transferable result. Ask why the cross term vanishes rather than accepting the arithmetic coincidence.' },

{ id:'D1-14', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'The sequence $x[n]$ equals $2$, $-1$, $4$, $1$ at $n=0,1,2,3$ and is zero elsewhere.',
  parts:['Plot $x[-n]$.',
         'Plot $\\Ev\\{x[n]\\}$ and $\\Od\\{x[n]\\}$.',
         'Verify that the two parts add back to $x[n]$ at $n=-1$, $n=0$ and $n=2$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.6,3.6],yr:[-2.6,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(seq([2,-1,4,1],0),{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[0]=2$, $x[1]=-1$, $x[2]=4$, $x[3]=1$, zero elsewhere.<br>'
     +'<b>Find.</b> The reflection and the even and odd parts.<br>'
     +'<b>Method.</b> $x[-n]$ places the value $x[m]$ at index $-m$. Then$$\\Ev\\{x[n]\\}=\\tfrac12\\bigl(x[n]+x[-n]\\bigr),\\qquad\\Od\\{x[n]\\}=\\tfrac12\\bigl(x[n]-x[-n]\\bigr),$$evaluated one index at a time over $-3\\le n\\le3$, the only range where either $x[n]$ or $x[-n]$ is non-zero.<br>'
     +'<b>Solution — part (a).</b> $x[-n]$ at $n=-3,-2,-1,0$ takes the values $x[3],x[2],x[1],x[0]$, that is $1,4,-1,2$, and is zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Tabulate $x[n]$ and $x[-n]$ side by side and apply the two formulas at each index:$$\\begin{aligned}n=-3:&\\quad\\Ev=\\tfrac12(0+1)=\\tfrac12,&\\Od&=\\tfrac12(0-1)=-\\tfrac12,\\\\n=-2:&\\quad\\Ev=\\tfrac12(0+4)=2,&\\Od&=\\tfrac12(0-4)=-2,\\\\n=-1:&\\quad\\Ev=\\tfrac12(0+(-1))=-\\tfrac12,&\\Od&=\\tfrac12(0-(-1))=\\tfrac12,\\\\n=0:&\\quad\\Ev=\\tfrac12(2+2)=2,&\\Od&=\\tfrac12(2-2)=0,\\\\n=1:&\\quad\\Ev=\\tfrac12(-1+0)=-\\tfrac12,&\\Od&=\\tfrac12(-1-0)=-\\tfrac12,\\\\n=2:&\\quad\\Ev=\\tfrac12(4+0)=2,&\\Od&=\\tfrac12(4-0)=2,\\\\n=3:&\\quad\\Ev=\\tfrac12(1+0)=\\tfrac12,&\\Od&=\\tfrac12(1-0)=\\tfrac12.\\end{aligned}$$So$$\\Ev\\{x\\}:\\;0.5,\\,2,\\,-0.5,\\,2,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$$$\\Od\\{x\\}:\\;-0.5,\\,-2,\\,0.5,\\,0,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$and both are zero elsewhere.<br>'
     +'<b>Solution — part (c).</b> At $n=-1$: $-0.5+0.5=0=x[-1]$. At $n=0$: $2+0=2=x[0]$. At $n=2$: $2+2=4=x[2]$. All three agree.<br>'
     +'<b>Check.</b> The even part is symmetric about $n=0$ and the odd part is antisymmetric, with $\\Od\\{x\\}[0]=0$ as it must be for every sequence. Only $x[0]$ survives untouched into the even part, and it does: $\\Ev\\{x\\}[0]=\\tfrac12(2+2)=2=x[0]$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-1,2.6],xlabel:'n',ylabel:'\\Ev\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-3,0.5],[-2,2],[-1,-0.5],[0,2],[1,-0.5],[2,2],[3,0.5]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,3.6],yr:[-2.6,2.6],xlabel:'n',ylabel:'\\Od\\{x[n]\\}',
      pad:{l:56,r:26,t:32,b:34},xstep:1,ystep:0.5});
      a.stem([[-3,-0.5],[-2,-2],[-1,0.5],[0,0],[1,-0.5],[2,2],[3,0.5]],{color:C.mid}); return a.svg();})()),
  err:'Reflecting the plot about the vertical axis but leaving the sample at $n=0$ in place while also copying it to $n=0$ again, which doubles $x[0]$ in the even part.',
  teach:'The value $\\Od\\{x\\}[0]=0$ is a free check on every answer. If a student reports a non-zero odd part at the origin, the reflection was built incorrectly.' },

{ id:'D1-15', module:'M1', type:'evenodd',
  stem:'Let $$x(t)=\\begin{cases}-1,&-2\\le t<0,\\\\[2pt] 2,&0\\le t\\le3,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$',
  parts:['Determine $x(-t)$ as a piecewise formula.',
         'Determine $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$, each as a piecewise formula.',
         'Calculate $E_x$, $E_{\\Ev}$ and $E_{\\Od}$, and verify that the two parts\' energies add to $E_x$.'],
  sol:'<b>Given.</b> An asymmetric two-level rectangular signal, $-1$ on one side of the origin and $2$ on the other.<br>'
     +'<b>Find.</b> $x(-t)$, the two parts, and the three energies.<br>'
     +'<b>Method.</b> Substitute $t\\to-t$ in each piece of the definition to get $x(-t)$, then apply $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$ region by region, and integrate the square of each result. The values at the single points where a region changes do not affect any energy.<br>'
     +'<b>Solution — part (a).</b> Replace $t$ by $-t$ in each condition and solve for $t$. The piece $-2\\le t<0$ becomes $-2\\le-t<0$; multiplying by $-1$ reverses the inequalities, $2\\ge t>0$, so $x(-t)=-1$ on $0<t\\le2$. The piece $0\\le t\\le3$ becomes $0\\le-t\\le3$, that is $0\\ge t\\ge-3$, so $x(-t)=2$ on $-3\\le t\\le0$. Together,$$x(-t)=\\begin{cases}2,&-3\\le t\\le0,\\\\[2pt] -1,&0<t\\le2,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Solution — part (b).</b> Either $x(t)$ or $x(-t)$ is non-zero on $[-3,3]$. Split that interval at every point where one of them changes, $t=-2,0,2$, and read both values on each region:$$\\begin{aligned}-3\\le t<-2:&\\quad x(t)=0,\\;x(-t)=2,&\\Ev&=\\tfrac12(0+2)=1,&\\Od&=\\tfrac12(0-2)=-1,\\\\-2\\le t<0:&\\quad x(t)=-1,\\;x(-t)=2,&\\Ev&=\\tfrac12(-1+2)=\\tfrac12,&\\Od&=\\tfrac12(-1-2)=-\\tfrac32,\\\\0<t<2:&\\quad x(t)=2,\\;x(-t)=-1,&\\Ev&=\\tfrac12(2-1)=\\tfrac12,&\\Od&=\\tfrac12(2+1)=\\tfrac32,\\\\2<t\\le3:&\\quad x(t)=2,\\;x(-t)=0,&\\Ev&=\\tfrac12(2+0)=1,&\\Od&=\\tfrac12(2-0)=1.\\end{aligned}$$So$$\\Ev\\{x(t)\\}=\\begin{cases}1,&-3\\le t<-2,\\\\ 0.5,&-2\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}\\qquad\\Od\\{x(t)\\}=\\begin{cases}-1,&-3\\le t<-2,\\\\ -1.5,&-2\\le t<0,\\\\ 1.5,&0\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}$$both zero outside $[-3,3]$.<br>'
     +'<b>Solution — part (c).</b> Square each level and integrate over its own region. For $x$:$$E_x=\\int_{-2}^{0}(-1)^{2}\\,\\d t+\\int_{0}^{3}2^{2}\\,\\d t=\\bigl[t\\bigr]_{-2}^{0}+\\bigl[4t\\bigr]_{0}^{3}=(0+2)+(12-0)=14.$$For the even part, $1^{2}=1$ and $(0.5)^{2}=0.25$:$$E_{\\Ev}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{2}0.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1\\cdot1+0.25\\cdot4+1\\cdot1=1+1+1=3.$$For the odd part, $(\\pm1)^{2}=1$ and $(\\pm1.5)^{2}=2.25$:$$E_{\\Od}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{0}2.25\\,\\d t+\\int_{0}^{2}2.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1+2.25\\cdot2+2.25\\cdot2+1=1+4.5+4.5+1=11.$$Then $E_{\\Ev}+E_{\\Od}=3+11=14=E_x$.<br>'
     +'<b>Check.</b> The two parts add back to $x$ on every region. On $(0,2)$, $0.5+1.5=2=x(t)$; on $[-3,-2)$, $1+(-1)=0=x(t)$. Also, orthogonality gives $E_x=E_{\\Ev}+E_{\\Od}$ with both terms non-negative, so $E_{\\Ev}\\le E_x$. Here $3<14$, as required.',
  err:'Computing $\\Ev\\{x\\}$ and $\\Od\\{x\\}$ only on the region where $x(t)$ itself is non-zero, $[-2,3]$, and missing that $x(-t)$ is non-zero on $[-3,2]$ — a different interval — so the even and odd parts extend over $[-3,3]$, wider than $x$ itself.',
  teach:'Ask for $x(-t)$ to be written out fully, as in part (a), before either part (b) is attempted. The commonest failure is reusing the support of $x(t)$ for $x(-t)$ instead of reflecting it.' },

{ id:'D1-16', module:'M1', type:'evenodd',
  stem:'Let $x[n]$ be an arbitrary real-valued sequence, not given by any formula.',
  parts:['Prove that $\\Od\\{x\\}[0]=0$, directly from the definition of the odd part.',
         'The sequence $w[n]$ has $w[-1]=-5$, $w[0]=0$, $w[1]=5$, zero elsewhere. A student claims $\\Od\\{w\\}[n]=w[n]$ for every $n$ and $\\Ev\\{w\\}[n]=0$ for every $n$. Determine whether the claim is correct.',
         'A second sequence has $y[0]=4$. Using part (a) only, and without computing $\\Od\\{y\\}$, explain why $y[n]$ cannot be an odd sequence.'],
  sol:'<b>Given.</b> The general definition $\\Od\\{x\\}[n]=\\tfrac12(x[n]-x[-n])$, applied first abstractly and then to one example.<br>'
     +'<b>Find.</b> A general identity at $n=0$, and its two consequences.<br>'
     +'<b>Method.</b> Substitute $n=0$ into the definition of the odd part; the two terms it produces are identical, for any sequence whatsoever.<br>'
     +'<b>Solution — part (a).</b> Put $n=0$ in the definition:$$\\Od\\{x\\}[0]=\\tfrac12\\bigl(x[0]-x[-0]\\bigr)=\\tfrac12\\bigl(x[0]-x[0]\\bigr)=\\tfrac12\\cdot0=0,$$because $-0=0$, so both terms are the same number $x[0]$. This holds for every real sequence $x[n]$, whatever its values are.<br>'
     +'<b>Solution — part (b).</b> First build $w[-n]$: at $n=-1$ it is $w[1]=5$, at $n=0$ it is $w[0]=0$, at $n=1$ it is $w[-1]=-5$. Now apply the two definitions index by index:$$\\begin{aligned}n=-1:&\\quad\\Ev\\{w\\}=\\tfrac12(-5+5)=0,&\\Od\\{w\\}&=\\tfrac12(-5-5)=-5=w[-1],\\\\n=0:&\\quad\\Ev\\{w\\}=\\tfrac12(0+0)=0,&\\Od\\{w\\}&=\\tfrac12(0-0)=0=w[0],\\\\n=1:&\\quad\\Ev\\{w\\}=\\tfrac12(5-(-5))=0,&\\Od\\{w\\}&=\\tfrac12(5-(-5))=5=w[1].\\end{aligned}$$At every other index both $w[n]$ and $w[-n]$ are zero, so both parts are zero there too. Thus $\\Ev\\{w\\}=0$ and $\\Od\\{w\\}=w$ at every index. <b>The claim is correct</b> because $w[-n]=-w[n]$ at every index.<br>'
     +'<b>Solution — part (c).</b> If $y[n]$ were odd, it would equal its own odd part: $y[n]=\\Od\\{y\\}[n]$ for every $n$, in particular at $n=0$. But part (a) shows $\\Od\\{y\\}[0]=0$ for <em>any</em> sequence, so an odd $y$ would need $y[0]=0$. Since $y[0]=4\\neq0$, $y[n]$ cannot be odd.<br>'
     +'<b>Check.</b> In part (b), $w[0]=0$, as every odd sequence requires. If only this value were changed to a non-zero number, the sequence would no longer be odd. This confirms the general result in part (c).',
  err:'Trying to verify the claim in part (b) by checking only $\\Od\\{w\\}[1]=w[1]$ and stopping there, without also checking $n=-1$ and confirming $\\Ev\\{w\\}$ is zero at every index, not only at the one checked.',
  teach:'Part (c) is the point of the question: a property proved once, in general, replaces a computation that would otherwise have to be redone for every new signal. Ask which other single-sample facts about $x[n]$ can be read off the definitions the same way.' },

{ id:'D1-17', module:'M1', type:'impulse', src:'MT1 Q1',
  stem:'Evaluate each of the following.'
      +'$$\\text{(i)}\\;\\int_{-\\infty}^{\\infty}\\!\\left(3t^{2}+1\\right)\\bigl[\\delta(t+2)+\\delta(t-4)\\bigr]\\d t\\qquad'
      +'\\text{(ii)}\\;\\int_{-\\infty}^{\\infty}\\!e^{-2t}\\sin(\\pi t)\\,\\delta(t-1.5)\\,\\d t\\qquad'
      +'\\text{(iii)}\\;\\int_{-\\infty}^{\\infty}\\!t^{2}\\,\\delta(4t-8)\\,\\d t$$',
  parts:['Evaluate the three integrals.',
         'State which property of the impulse each one uses, and say why the answer is a number rather than a signal.'],
  sol:'<b>Given.</b> Three integrals of an ordinary function against an impulse.<br>'
     +'<b>Find.</b> Their values, and the property behind each.<br>'
     +'<b>Method.</b> The <b>sifting</b> property, $\\int_{-\\infty}^{\\infty}x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$, evaluates the function at the location of the impulse. A scaled argument first needs$$\\delta(at-b)=\\frac{1}{|a|}\\,\\delta\\!\\left(t-\\frac{b}{a}\\right),$$because the impulse must keep unit area under the substitution $\\tau=at-b$, $\\d t=\\d\\tau/|a|$.<br>'
     +'<b>Solution — (i).</b> The integral is linear, so split it at the plus sign and sift each impulse at its own location, $t_0=-2$ and $t_0=4$:$$\\begin{aligned}\\int_{-\\infty}^{\\infty}\\!\\left(3t^{2}+1\\right)\\delta(t+2)\\,\\d t+\\int_{-\\infty}^{\\infty}\\!\\left(3t^{2}+1\\right)\\delta(t-4)\\,\\d t&=\\bigl(3(-2)^{2}+1\\bigr)+\\bigl(3\\cdot4^{2}+1\\bigr)\\\\&=(3\\cdot4+1)+(3\\cdot16+1)=13+49=62.\\end{aligned}$$'
     +'<b>Solution — (ii).</b> The impulse sits at $t_0=1.5$, so sift there:$$\\int_{-\\infty}^{\\infty}\\!e^{-2t}\\sin(\\pi t)\\,\\delta(t-1.5)\\,\\d t=e^{-2\\cdot1.5}\\sin(1.5\\pi)=e^{-3}\\sin\\!\\left(\\tfrac{3\\pi}{2}\\right)=e^{-3}\\cdot(-1)=-e^{-3}\\approx-0.0498.$$'
     +'<b>Solution — (iii).</b> Rewrite the impulse with $a=4$, $b=8$: $\\delta(4t-8)=\\tfrac14\\delta\\!\\left(t-\\tfrac84\\right)=\\tfrac14\\delta(t-2)$. Then sift at $t_0=2$:$$\\int_{-\\infty}^{\\infty}t^{2}\\,\\delta(4t-8)\\,\\d t=\\int_{-\\infty}^{\\infty}t^{2}\\cdot\\tfrac14\\delta(t-2)\\,\\d t=\\tfrac14\\cdot2^{2}=\\tfrac14\\cdot4=1.$$The same value comes from a direct substitution $\\tau=4t-8$, so $t=\\tfrac{\\tau+8}{4}$ and $\\d t=\\tfrac14\\d\\tau$:$$\\int_{-\\infty}^{\\infty}\\left(\\tfrac{\\tau+8}{4}\\right)^{2}\\delta(\\tau)\\,\\tfrac14\\d\\tau=\\tfrac14\\left(\\tfrac{0+8}{4}\\right)^{2}=\\tfrac14\\cdot4=1.$$'
     +'<b>Solution — part (b).</b> All three use sifting. The result is a number because the integral runs over $t$ and removes every $t$-dependence. The <b>sampling</b> property is the other statement, $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$, and it returns a signal: an impulse at $t_0$ carrying the weight $x(t_0)$.<br>'
     +'<b>Check.</b> If $x$ is in volts, $\\delta$ has units $\\mathrm{s}^{-1}$, so integration returns volts. In (iii), $\\delta(4t-8)$ has area $\\tfrac14$, which confirms the scale factor. In (ii), $\\sin(1.5\\pi)=-1$, which confirms the sign.',
  err:'Treating $\\delta(4t-8)$ as $\\delta(t-8)$, or as $\\delta(t-2)$ without the factor $\\tfrac14$. Compressing the argument compresses the impulse, and its area must be restored.',
  teach:'Part (b) separates the two properties. A student who writes $x(t)\\delta(t-t_0)=x(t_0)$ has silently turned a signal into a number and will make the same slip in Module 3.' },

{ id:'D1-18', module:'M1', type:'impulse',
  stem:'Let $$g(t)=3\\delta(t+1)-2\\delta(t-2),\\qquad v(t)=\\int_{-\\infty}^{t}g(\\tau)\\,\\d\\tau.$$',
  parts:['Using $u(t)=\\displaystyle\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau$, express $v(t)$ as a combination of unit step functions.',
         'Sketch $v(t)$ for $-3\\le t\\le4$.',
         'Read $v(0)$ and $v(3)$ from the sketch, and check them against the formula from part (a).'],
  sol:'<b>Given.</b> A signal built from two weighted, shifted impulses, and its running integral.<br>'
     +'<b>Find.</b> $v(t)$ as a staircase, and two of its values checked two ways.<br>'
     +'<b>Method.</b> Integration is linear, so the running integral of a sum of impulses is the same sum of running integrals of each impulse alone. For one shifted impulse, substitute $\\sigma=\\tau-t_0$, $\\d\\sigma=\\d\\tau$, so that the upper limit $\\tau=t$ becomes $\\sigma=t-t_0$:$$\\int_{-\\infty}^{t}\\delta(\\tau-t_0)\\,\\d\\tau=\\int_{-\\infty}^{t-t_0}\\delta(\\sigma)\\,\\d\\sigma=u(t-t_0),$$by the definition of the step given in part (a).<br>'
     +'<b>Solution — part (a).</b> Substitute $g$ into the running integral and split it by linearity:$$\\begin{aligned}v(t)&=\\int_{-\\infty}^{t}\\bigl[3\\delta(\\tau+1)-2\\delta(\\tau-2)\\bigr]\\,\\d\\tau\\\\&=3\\int_{-\\infty}^{t}\\delta(\\tau+1)\\,\\d\\tau-2\\int_{-\\infty}^{t}\\delta(\\tau-2)\\,\\d\\tau\\\\&=3u(t+1)-2u(t-2),\\end{aligned}$$using the Method result with $t_0=-1$ and $t_0=2$.<br>'
     +'<b>Solution — part (b).</b> Evaluate the two steps on each interval between the jump points $t=-1$ and $t=2$:$$\\begin{aligned}t<-1:&\\quad u(t+1)=0,\\;u(t-2)=0,&v(t)&=3\\cdot0-2\\cdot0=0,\\\\-1<t<2:&\\quad u(t+1)=1,\\;u(t-2)=0,&v(t)&=3\\cdot1-2\\cdot0=3,\\\\t>2:&\\quad u(t+1)=1,\\;u(t-2)=1,&v(t)&=3\\cdot1-2\\cdot1=1.\\end{aligned}$$So $v(t)$ is a staircase: $0$ for $t<-1$, rises to $3$ at $t=-1$ and holds until $t=2$, then drops by $2$ to $1$ and holds from $t=2$ onward.<br>'
     +'<b>Solution — part (c).</b> From the sketch, $v(0)=3$ (between the two steps) and $v(3)=1$ (after both). From the formula: $v(0)=3u(1)-2u(-2)=3\\cdot1-2\\cdot0=3$, and $v(3)=3u(4)-2u(1)=3\\cdot1-2\\cdot1=1$. Both agree.<br>'
     +'<b>Check.</b> The final level of the staircase, as $t\\to\\infty$, must equal the total area under $g(t)$, which is the sum of the two impulse weights: $3+(-2)=1$. The sketch settles at $1$ for large $t$, matching this weight-sum without reference to either step location.',
  figSol:()=>{const v=t=>t<-1?0:(t<2?3:1);
    const a=P.Axes({w:1080,h:270,xr:[-3,4],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'v(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.curve(v,{color:C.mid});
    [-1,2].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Writing $v(t)=3\\delta(t+1)-2\\delta(t-2)$, that is, leaving the answer as the original impulses instead of integrating them into steps. The running integral of an impulse is a step, not another impulse.',
  teach:'Ask for the final level of the staircase before the sketch is drawn, using only the sum of the weights. A student who cannot predict it has not understood that the step is the running integral of the impulse.' },

{ id:'D1-19', module:'M1', type:'impulse',
  stem:'Let $x[n]$ have $x[-1]=5$, $x[0]=-3$, $x[1]=2$, $x[2]=7$, zero elsewhere.',
  parts:['Write the sampling-property result $x[n]\\delta[n-1]$ explicitly as a sequence.',
         'Write the sifting-property result $\\displaystyle\\sum_{n=-\\infty}^{\\infty}x[n]\\delta[n-1]$ as a number, and confirm it equals $x[1]$.',
         'Using the representation property $x[n]=\\displaystyle\\sum_{k=-\\infty}^{\\infty}x[k]\\delta[n-k]$, write out its four non-zero terms for this $x[n]$, and confirm the sum reproduces $x[0]$.'],
  sol:'<b>Given.</b> A four-sample sequence and the index $n_0=1$.<br>'
     +'<b>Find.</b> The two impulse properties applied at $n_0=1$, and the representation property evaluated at $n=0$.<br>'
     +'<b>Method.</b> Sampling multiplies $x[n]$ by a shifted impulse and leaves one non-zero sample. Sifting sums that product and returns a number. The representation property rebuilds $x[n]$ by placing one weighted impulse at each non-zero sample. In every case the key fact is $\\delta[n-k]=1$ when $n=k$ and $0$ otherwise.<br>'
     +'<b>Solution — part (a).</b> $\\delta[n-1]$ is $1$ only at $n=1$, so the product $x[n]\\delta[n-1]$ is zero at every index except $n=1$, where it equals $x[1]\\cdot1=2$:$$x[n]\\delta[n-1]=x[1]\\delta[n-1]=2\\delta[n-1].$$This sequence equals $2$ at $n=1$ and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Sum the sequence from part (a). Every term with $n\\neq1$ is zero, so only the $n=1$ term survives:$$\\sum_{n=-\\infty}^{\\infty}x[n]\\delta[n-1]=x[1]\\delta[0]=x[1]\\cdot1=2,$$and $x[1]=2$ as given.<br>'
     +'<b>Solution — part (c).</b> The sum over $k$ has a non-zero term only where $x[k]\\neq0$, that is at $k=-1,0,1,2$:$$x[n]=x[-1]\\delta[n+1]+x[0]\\delta[n]+x[1]\\delta[n-1]+x[2]\\delta[n-2]=5\\delta[n+1]-3\\delta[n]+2\\delta[n-1]+7\\delta[n-2].$$At $n=0$ the four impulses take the values $\\delta[1]=0$, $\\delta[0]=1$, $\\delta[-1]=0$, $\\delta[-2]=0$:$$5\\cdot0-3\\cdot1+2\\cdot0+7\\cdot0=-3=x[0].$$'
     +'<b>Check.</b> At $n=-1$, the same representation gives $5\\delta[0]-3\\delta[-1]+2\\delta[-2]+7\\delta[-3]=5\\cdot1-3\\cdot0+2\\cdot0+7\\cdot0=5=x[-1]$. This confirms the formula at a second index.',
  err:'Writing the sampling result in part (a) as the number $2$ instead of the sequence $2\\delta[n-1]$. Sampling produces a signal that happens to have only one non-zero sample; it does not collapse to a number until it is summed.',
  teach:'Ask for the check at a second index, as in the Check step, before accepting part (c). A single matching index is a weak test; the representation property has to hold everywhere.' },

{ id:'D1-20', module:'M1', type:'impulse',
  stem:'Let $$x[n]=\\delta[n]+2\\delta[n-2]-\\delta[n-4],\\qquad y[n]=\\sum_{k=-\\infty}^{n}x[k].$$',
  parts:['Evaluate $y[n]$ for $-2\\le n\\le6$.',
         'Express $y[n]$ in closed form as a combination of unit step functions, and check it against part (a).',
         'A continuous-time signal $p(t)=\\delta(t)+2\\delta(t-2)-\\delta(t-4)$ carries the same weights at the same locations. State its running integral $q(t)=\\displaystyle\\int_{-\\infty}^{t}p(\\tau)\\,\\d\\tau$ directly by analogy with $y[n]$, without repeating the calculation.'],
  sol:'<b>Given.</b> A finite train of three weighted, shifted unit samples, and its running sum.<br>'
     +'<b>Find.</b> The running sum as a table, in closed form, and its continuous-time counterpart.<br>'
     +'<b>Method.</b> The running sum of one shifted impulse is a step: $\\sum_{k=-\\infty}^{n}\\delta[k-k_0]$ equals $1$ if the index $k_0$ lies inside the range $k\\le n$, that is if $n\\ge k_0$, and $0$ otherwise. That is exactly $u[n-k_0]$. Summation is linear, so it distributes over the three terms of $x[n]$ unchanged.<br>'
     +'<b>Solution — part (a).</b> $y[n]$ adds up every sample of $x$ at indices $\\le n$. The non-zero samples are $x[0]=1$, $x[2]=2$, $x[4]=-1$, so the running sum changes only as $n$ passes $0$, $2$ and $4$:$$\\begin{aligned}n=-2,-1:&\\quad\\text{no non-zero sample yet,}&y[n]&=0,\\\\n=0,1:&\\quad x[0]\\text{ included,}&y[n]&=1,\\\\n=2,3:&\\quad x[0]+x[2],&y[n]&=1+2=3,\\\\n=4,5,6:&\\quad x[0]+x[2]+x[4],&y[n]&=3-1=2.\\end{aligned}$$So$$y[n]=0,0,1,1,3,3,2,2,2\\quad\\text{for}\\quad n=-2,-1,0,1,2,3,4,5,6.$$'
     +'<b>Solution — part (b).</b> Substitute $x$ and split the sum by linearity:$$\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{n}\\bigl(\\delta[k]+2\\delta[k-2]-\\delta[k-4]\\bigr)\\\\&=\\sum_{k=-\\infty}^{n}\\delta[k]+2\\sum_{k=-\\infty}^{n}\\delta[k-2]-\\sum_{k=-\\infty}^{n}\\delta[k-4]\\\\&=u[n]+2u[n-2]-u[n-4].\\end{aligned}$$Checking against part (a) at $n=4$: $u[4]+2u[2]-u[0]=1+2\\cdot1-1=2$, matching the table. At $n=1$: $u[1]+2u[-1]-u[-3]=1+0-0=1$, also matching.<br>'
     +'<b>Solution — part (c).</b> The running sum replaced each $\\delta[n-k]$ by $u[n-k]$ with its weight unchanged; the running integral does the same with $\\delta(t-t_0)\\to u(t-t_0)$, so by the identical argument$$q(t)=u(t)+2u(t-2)-u(t-4),$$a staircase with the same three levels as $y[n]$, at $t=0,2,4$ instead of $n=0,2,4$.<br>'
     +'<b>Check.</b> After all impulses, the running sum must equal the sum of their weights, $1+2-1=2$. The table gives $y[n]=2$ for $n\\ge4$, and the continuous-time result gives $q(t)=2$ for $t\\ge4$.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-3,7],yr:[-0.5,3.8],xlabel:'n',ylabel:'y[n]',
      pad:{l:52,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-2,0],[-1,0],[0,1],[1,1],[2,3],[3,3],[4,2],[5,2],[6,2]],{color:C.mid});
    return a.svg();},
  err:'Reporting the running sum as another train of impulses, $u[n]+2u[n-2]-u[n-4]$ misread as a sum of samples rather than a sum of steps, so the plotted answer shows isolated dots instead of a staircase that holds its value between jumps.',
  teach:'Part (c) is the one to press on. A student who can only produce $q(t)$ by repeating the integration, rather than by relabelling $y[n]$, has not understood that the discrete and continuous constructions are the same argument in two notations.' },

/* ----------------------------------------------------------------------
   Full-length questions. Each carries one statement and several lettered
   parts, and every later part rests on the signal an earlier part built.
   ---------------------------------------------------------------------- */

{ id:'D1-21', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (b) to (e) all use the signal $x(t)$ plotted below.',
  parts:['Is $x[n]=\\cos\\!\\left(\\tfrac{4\\pi}{9}n-2\\right)$ periodic? If so, find its fundamental period.',
         'Calculate the energy $E_\\infty$ of $x(t)$.',
         'Plot $y(t)=x\\!\\left(3-\\tfrac{t}{2}\\right)$.',
         'Plot $z(t)=\\Ev\\{y(t)\\}$, the even part of the $y(t)$ signal of part (c).',
         'Evaluate $\\int_{-\\infty}^{\\infty}z(t)\\{\\delta(t+4)+\\delta(t-8)\\}\\,\\d t$, with $z(t)$ as defined in part (d).'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,4.6],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[1,2],[3,0],[4.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A discrete-time cosine, and a triangular pulse $x(t)=2t$ on $0\\le t\\le1$, $x(t)=3-t$ on $1\\le t\\le3$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a pair of impulses.<br>'
     +'<b>Method.</b> Test the discrete-time frequency ratio in part (a). Integrate the squared pieces in part (b). Map the argument of $x$ in part (c), form the even part of that result in part (d), and use sifting on the resulting $z(t)$ in part (e). This order is required because parts (d) and (e) use earlier results.<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{4\\pi}{9}$. Form the ratio:$$\\frac{\\omega_0}{2\\pi}=\\frac{4\\pi/9}{2\\pi}=\\frac{4}{18}=\\frac{2}{9},$$rational, so the sequence repeats. Then$$N=\\frac{2\\pi}{\\omega_0}k=\\frac{2\\pi\\cdot9}{4\\pi}k=\\frac{9}{2}k,$$which is an integer only when $k$ is even; the smallest choice $k=2$ gives $N_0=9$. The phase $-2$ plays no part in the test.<br>'
     +'<b>Solution — part (b).</b> Substitute the two pieces into $E_\\infty=\\int|x(t)|^{2}\\,\\d t$ and evaluate each integral:$$\\begin{aligned}\\int_{0}^{1}(2t)^{2}\\,\\d t&=\\int_{0}^{1}4t^{2}\\,\\d t=\\left[\\frac{4t^{3}}{3}\\right]_{0}^{1}=\\frac43-0=\\frac43,\\\\[4pt]\\int_{1}^{3}(3-t)^{2}\\,\\d t&=\\int_{2}^{0}s^{2}\\,(-\\d s)=\\int_{0}^{2}s^{2}\\,\\d s=\\left[\\frac{s^{3}}{3}\\right]_{0}^{2}=\\frac83,\\end{aligned}$$where the second line substitutes $s=3-t$, $\\d s=-\\d t$, with $t=1\\mapsto s=2$ and $t=3\\mapsto s=0$. Adding,$$E_\\infty=\\frac43+\\frac83=\\frac{12}{3}=4\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $s=3-\\tfrac t2$: the coefficient $-\\tfrac12$ means the signal is reflected and stretched by $2$. <em>Support.</em> $y(t)\\neq0$ where $0\\le s\\le3$:$$0\\le3-\\tfrac t2\\le3\\;\\Longrightarrow\\;-3\\le-\\tfrac t2\\le0\\;\\Longrightarrow\\;6\\ge t\\ge0,$$multiplying by $-2$ in the last step and reversing the inequalities. So the support is $0\\le t\\le6$, twice the original width. <em>Pieces.</em> The piece $x(s)=2s$ applies where $0\\le s\\le1$:$$0\\le3-\\tfrac t2\\le1\\;\\Longrightarrow\\;-3\\le-\\tfrac t2\\le-2\\;\\Longrightarrow\\;4\\le t\\le6,$$and there $y(t)=2\\left(3-\\tfrac t2\\right)=6-t$. The piece $x(s)=3-s$ applies where $1\\le s\\le3$:$$1\\le3-\\tfrac t2\\le3\\;\\Longrightarrow\\;-2\\le-\\tfrac t2\\le0\\;\\Longrightarrow\\;0\\le t\\le4,$$and there $y(t)=3-\\left(3-\\tfrac t2\\right)=\\tfrac t2$. <em>Peak.</em> $x$ peaks at $s=1$; setting $3-\\tfrac t2=1$ gives $\\tfrac t2=2$, so $t=4$, and $y(4)=\\tfrac42=2$ keeps the height $2$. The pulse is a triangle on $[0,6]$ peaking at $(4,2)$.<br>'
     +'<b>Solution — part (d).</b> $z(t)=\\tfrac12[y(t)+y(-t)]$. $y(-t)$ is non-zero where $0\\le-t\\le6$, that is $-6\\le t\\le0$. So $y$ lives on $[0,6]$ and $y(-t)$ on $[-6,0]$, and the two never overlap except at the single point $t=0$. For $t>0$ only $y(t)$ is present, $z(t)=\\tfrac12y(t)$; for $t<0$ only $y(-t)$ is present, $z(t)=\\tfrac12y(-t)$. Since $|t|=t$ for $t>0$ and $|t|=-t$ for $t<0$,$$z(t)=\\tfrac12 y(|t|),$$a pair of triangles on $[-6,6]$ peaking at $t=\\pm4$ with height $\\tfrac12\\cdot2=1$.<br>'
     +'<b>Solution — part (e).</b> Split by linearity and sift each impulse at its own location, $t_0=-4$ and $t_0=8$:$$\\int_{-\\infty}^{\\infty}z(t)\\{\\delta(t+4)+\\delta(t-8)\\}\\,\\d t=z(-4)+z(8).$$From part (d), $z(-4)=\\tfrac12y(|-4|)=\\tfrac12y(4)=\\tfrac12\\cdot2=1$, and $z(8)=\\tfrac12y(8)=0$ because $8$ lies outside the support $[0,6]$ of $y$. So the integral equals $1+0=1$. The second impulse sits outside the support of $z$, so it contributes nothing.<br>'
     +'<b>Check.</b> In (b) the triangle never exceeds $2$ and lasts $3$ seconds, so $E_\\infty\\le2^{2}\\cdot3=12$, and $4$ sits inside that. In (c) the width went from $3$ to $6$, which is the factor $1/|a|=2$ the scaling promises. In (d), $z(0)=\\tfrac12[y(0)+y(0)]=0$, and $z$ is even by construction. In (e) the answer is $z(-4)=\\tfrac12y(4)=\\tfrac12\\cdot2=1$, the peak of $y$ halved, as the even part of a one-sided signal must be.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:240,xr:[-1.2,7.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:48,r:26,t:28,b:36},xstep:2,ystep:1});
      a.poly([[-1.2,0],[0,0],[4,2],[6,0],[7.2,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:240,xr:[-7.2,7.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'z(t)',
      pad:{l:48,r:26,t:28,b:36},xstep:2,ystep:1});
      a.poly([[-7.2,0],[-6,0],[-4,1],[0,0],[4,1],[6,0],[7.2,0]],{color:C.mid}); return a.svg();})()),
  err:'Scaling before shifting in part (c) and reporting a support of $[-6,0]$ or a peak at $t=2$. Write the argument as $3-t/2$ and map the edges of the support one at a time; the width must come out twice the original.',
  teach:'Ask for the width of the support after part (c) before anything else is checked. A student whose answer is not $6$ units wide has an error that will travel into (d) and (e), and catching it here saves the rest of the question.' },

{ id:'D1-22', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (c) and (d) use the signal $y(t)$ plotted below.',
  parts:['Is the signal $x(t)=2je^{j5t}$ periodic? If so, what is its fundamental period?',
         'Determine the energy $E_\\infty$ of the signal $x[n]=3^{-n}u[n]$.',
         'Generate a plot of $y(-3t+2)$ using the given signal $y(t)$.',
         'Plot the even part of $y(t)$.',
         'Evaluate $\\int_{-\\infty}^{\\infty}e^{-t}\\delta(2t-4)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.2,3.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,-1],[2,3],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A continuous-time complex exponential, a decaying sequence, and a ramp $y(t)=t+1$ on $-2\\le t\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> Use the continuous-time exponential period formula in part (a) and a geometric series for the energy in part (b). In part (c), map the support through the new argument. In part (d), add the signal to its reflection. In part (e), scale the impulse before applying sifting.<br>'
     +'<b>Solution — part (a).</b> $x(t)=2je^{j5t}$ has $\\omega_0=5$ rad/s. Periodicity needs $x(t+T)=x(t)$, and$$x(t+T)=2je^{j5(t+T)}=2je^{j5t}e^{j5T}=x(t)\\,e^{j5T},$$so the condition is $e^{j5T}=1$, which holds first when $5T=2\\pi$. Every continuous-time complex exponential is periodic, with$$T_0=\\frac{2\\pi}{|\\omega_0|}=\\frac{2\\pi}{5}\\;\\text{s}\\approx1.257\\;\\text{s}.$$The constant $2j$ scales and rotates the phasor but does not change how often it returns.<br>'
     +'<b>Solution — part (b).</b> Square the sequence: $|x[n]|^{2}=\\left(3^{-n}\\right)^{2}=3^{-2n}=9^{-n}=\\left(\\tfrac19\\right)^{n}$, non-zero only for $n\\ge0$ because of the step. This is a geometric series with ratio $r=\\tfrac19$, and $|r|<1$, so it converges:$$E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac19\\right)^{n}=\\frac{1}{1-\\tfrac19}=\\frac{1}{\\tfrac89}=\\frac98=1.125\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> The argument is $s=-3t+2$. <em>Support.</em> $y(s)\\neq0$ where $-2\\le s\\le2$:$$-2\\le-3t+2\\le2\\;\\Longrightarrow\\;-4\\le-3t\\le0\\;\\Longrightarrow\\;\\tfrac43\\ge t\\ge0,$$subtracting $2$ and then dividing by $-3$, which reverses the inequalities. So the support is $0\\le t\\le\\tfrac43$, one third of the original width, and the negative coefficient reverses the order. <em>Formula.</em> On that interval $y(s)=s+1$, so$$y(-3t+2)=(-3t+2)+1=3-3t,$$running from $3-0=3$ at $t=0$ down to $3-3\\cdot\\tfrac43=3-4=-1$ at $t=\\tfrac43$.<br>'
     +'<b>Solution — part (d).</b> The reflection is $y(-t)=(-t)+1=1-t$ where $-2\\le-t\\le2$, that is $-2\\le t\\le2$: the same interval as $y$. So on $|t|<2$ both are present:$$\\Ev\\{y(t)\\}=\\tfrac12\\bigl[(t+1)+(1-t)\\bigr]=\\tfrac12\\cdot2=1,$$and outside $|t|>2$ both vanish. The even part is a rectangle of height $1$ on $-2<t<2$. The ramp part $t$ of $y$ is odd and cancels completely; only the constant $1$ survives.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse with $a=2$, $b=4$: $\\delta(2t-4)=\\tfrac12\\delta\\!\\left(t-\\tfrac42\\right)=\\tfrac12\\delta(t-2)$. Then sift at $t_0=2$:$$\\int_{-\\infty}^{\\infty}e^{-t}\\,\\delta(2t-4)\\,\\d t=\\int_{-\\infty}^{\\infty}e^{-t}\\cdot\\tfrac12\\delta(t-2)\\,\\d t=\\tfrac12e^{-2}\\approx\\tfrac12\\cdot0.1353\\approx0.0677.$$'
     +'<b>Check.</b> In (b) the first term alone is $1$ and the rest add $\\tfrac18$, so $\\tfrac98$ is the right size. In (c) the width went from $4$ to $\\tfrac43$, the factor $1/|a|=\\tfrac13$ the scaling promises, and one interior value confirms the sign: at $t=\\tfrac23$ the argument is $-3\\cdot\\tfrac23+2=0$ and $y(0)=1$, matching $3-3\\cdot\\tfrac23=1$. In (d) the even and odd parts must add back: $1+t=y(t)$ on $|t|<2$, as they do. In (e) forgetting the factor would give $e^{-2}$, twice the answer.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.8,2.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'y(-3t+2)',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-0.8,0],[0,0],[0,3],[4/3,-1],[4/3,0],[2.2,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.2,3.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{y(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-3.2,0],[-2,0],[-2,1],[2,1],[2,0],[3.2,0]],{color:C.mid}); return a.svg();})()),
  err:'Writing $\\delta(2t-4)=\\delta(t-2)$ in part (e) and losing the factor $\\tfrac12$. The scaling rule $\\delta(at-b)=\\tfrac{1}{|a|}\\delta\\!\\left(t-\\tfrac ba\\right)$ applies to the impulse exactly as it does to any other signal, and the weight is what changes.',
  teach:'In part (d), separate the ramp from the constant. The ramp is odd about $t=0$, and the constant is even, so only the constant remains in the even part.' },

{ id:'D1-23', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (b) and (c) use the sequence $x_1[n]$ of part (a); parts (d) and (e) use the signal $x_3(t)$ plotted below.',
  parts:['Sketch and label the signal $x_1[n]=\\sum_{k=-\\infty}^{\\infty}\\{\\delta[n-3k]-\\delta[n+1+4k]\\}$.',
         'Is the $x_1[n]$ of part (a) periodic? If so, what is its fundamental period?',
         'For the $x_1[n]$ of part (a), plot the odd part of $x_2[n]=\\begin{cases}x_1[n],&-3\\le n\\le3\\\\0,&\\text{otherwise.}\\end{cases}$',
         'Calculate the energy $E_\\infty$ of $x_3(t)$.',
         'For the $x_3(t)$ of part (d), evaluate $\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t+0.6)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,3.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,2],[0,0],[2,2],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A difference of two impulse trains, and a V-shaped pulse $x_3(t)=|t|$ on $|t|\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A sketch, a period, an odd part, an energy, and one sifting integral.<br>'
     +'<b>Method.</b> Locate the samples from each impulse train and add their weights at shared indices. Use the least common multiple of the train periods in part (b). Apply the odd-part definition to the windowed sequence in part (c), square and integrate the pulse in part (d), and use sifting in part (e).<br>'
     +'<b>Solution — part (a).</b> The first train, $\\sum_k\\delta[n-3k]$, places $+1$ wherever $n=3k$, that is at every $n\\equiv0\\pmod 3$: $\\dots,-3,0,3,6,9,\\dots$. The second train, $-\\sum_k\\delta[n+1+4k]$, places $-1$ wherever $n+1+4k=0$, that is $n=-1-4k$: $k=0,-1,-2,-3$ give $n=-1,3,7,11$, so every $n\\equiv3\\pmod 4$. Over one stretch $0\\le n\\le11$ that gives $+1$ at $n=0,3,6,9$ and $-1$ at $n=3,7,11$. The index $n=3$ receives both, and $(+1)+(-1)=0$:$$x_1[0]=1,\\;x_1[3]=0,\\;x_1[6]=1,\\;x_1[7]=-1,\\;x_1[9]=1,\\;x_1[11]=-1,$$and zero at every other index of the stretch.<br>'
     +'<b>Solution — part (b).</b> The first train repeats every $3$ samples and the second every $4$. Since $\\gcd(3,4)=1$, the least common multiple is the product:$$N_0=\\operatorname{lcm}(3,4)=3\\cdot4=12.$$Nothing shorter works: a shift of $3$ leaves the first train alone but moves the second, and a shift of $4$ does the reverse.<br>'
     +'<b>Solution — part (c).</b> Windowing to $-3\\le n\\le3$ keeps the samples of $x_1$ in that range. Multiples of $3$ there are $n=-3,0,3$, each carrying $+1$ from the first train. Indices $\\equiv3\\pmod4$ there are $n=-1$ (since $-1=3-4$) and $n=3$, each carrying $-1$ from the second. So $x_2[-3]=1$, $x_2[-1]=-1$, $x_2[0]=1$, $x_2[3]=1-1=0$, and zero elsewhere. Then apply $\\Od\\{x_2\\}[n]=\\tfrac12(x_2[n]-x_2[-n])$ at each index where either term is non-zero:$$\\begin{aligned}n=-3:&\\quad\\tfrac12(x_2[-3]-x_2[3])=\\tfrac12(1-0)=\\tfrac12,\\\\n=-1:&\\quad\\tfrac12(x_2[-1]-x_2[1])=\\tfrac12(-1-0)=-\\tfrac12,\\\\n=0:&\\quad\\tfrac12(x_2[0]-x_2[0])=0,\\\\n=1:&\\quad\\tfrac12(x_2[1]-x_2[-1])=\\tfrac12(0-(-1))=\\tfrac12,\\\\n=3:&\\quad\\tfrac12(x_2[3]-x_2[-3])=\\tfrac12(0-1)=-\\tfrac12,\\end{aligned}$$and zero everywhere else, including $n=\\pm2$.<br>'
     +'<b>Solution — part (d).</b> Square the pulse: $|x_3(t)|^{2}=|t|^{2}=t^{2}$ on $[-2,2]$. Then$$E_\\infty=\\int_{-2}^{2}t^{2}\\,\\d t=\\left[\\frac{t^{3}}{3}\\right]_{-2}^{2}=\\frac{8}{3}-\\left(-\\frac{8}{3}\\right)=\\frac{16}{3}\\;\\text{J}\\approx5.333\\;\\text{J}.$$'
     +'<b>Solution — part (e).</b> Sifting returns the value of the signal at the impulse location $t_0=-0.6$, which lies inside the support $[-2,2]$:$$\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t+0.6)\\,\\d t=x_3(-0.6)=|-0.6|=0.6.$$'
     +'<b>Check.</b> In (b), $12/3=4$ and $12/4=3$: the length $12$ holds four periods of the first train and three of the second, both whole numbers. In (c) the odd part must vanish at $n=0$, and it does, because $\\tfrac12(x_2[0]-x_2[0])=0$ whatever $x_2[0]$ is. In (d) the pulse never exceeds $2$ and lasts $4$ seconds, so $E_\\infty\\le2^{2}\\cdot4=16$; $\\tfrac{16}{3}$ sits inside. In (e) the value is read off the left arm of the V, where $x_3(t)=-t$, giving $-(-0.6)=0.6$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,12.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'x_1[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:3,ystep:1});
      a.stem([[0,1],[3,0],[6,1],[7,-1],[9,1],[11,-1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.6,4.6],yr:[-1.1,1.1],xlabel:'n',ylabel:'\\Od\\{x_2\\}[n]',
      pad:{l:56,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[-3,0.5],[-1,-0.5],[1,0.5],[3,-0.5]],{color:C.mid}); return a.svg();})()),
  err:'Missing the cancellation at $n=3$ in part (a) and reporting both a $+1$ and a $-1$ there. Where two trains land on the same index the values add, and here they add to zero.',
  teach:'Part (b) is the one students get wrong by multiplying: $3\\cdot4=12$ happens to be right here because $3$ and $4$ are coprime. Ask what the answer would be for trains of period $4$ and $6$ — the product $24$ is a period, but the fundamental one is $12$.' },

{ id:'D1-24', module:'M1', type:'full', src:'Final Q1',
  stem:'Consider the signal $$x(t)=\\left[t+3\\{u(t+2)-u(t-2)\\}\\right]\\times\\{u(t+3)-u(t-3)\\}.$$',
  parts:['Plot the even part of $x(t)$.',
         'Plot the odd part of $x(t)$.',
         'Calculate the energies of the even and odd parts of $x(t)$, and of $x(t)$ itself.'],
  sol:'<b>Given.</b> A ramp raised by $3$ over the inner window, the whole product cut off outside $|t|<3$.<br>'
     +'<b>Find.</b> The even and odd parts, and three energies.<br>'
     +'<b>Method.</b> Write $x$ piecewise first. The outer window $u(t+3)-u(t-3)$ equals $1$ on $|t|<3$ and $0$ elsewhere; the inner window $u(t+2)-u(t-2)$ equals $1$ on $|t|<2$ and adds $3$ only there. Then use $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$ on each piece, and integrate the squares.<br>'
     +'<b>Solution — piecewise form.</b> On $|t|<2$ both windows are on: $x(t)=(t+3\\cdot1)\\cdot1=t+3$. On $2<|t|<3$ only the outer window is on: $x(t)=(t+3\\cdot0)\\cdot1=t$. On $|t|>3$ the outer window is off: $x(t)=0$. So$$x(t)=\\begin{cases}t+3,&|t|<2\\\\t,&2<|t|<3\\\\0,&|t|>3.\\end{cases}$$Because every region is symmetric about $t=0$, $x(-t)$ on each region is the same formula with $t$ replaced by $-t$: $-t+3$ on $|t|<2$ and $-t$ on $2<|t|<3$.<br>'
     +'<b>Solution — part (a).</b> On $|t|<2$: $\\tfrac12[(t+3)+(-t+3)]=\\tfrac12\\cdot6=3$. On $2<|t|<3$: $\\tfrac12[t+(-t)]=0$. So$$\\Ev\\{x(t)\\}=\\begin{cases}3,&|t|<2\\\\0,&\\text{otherwise,}\\end{cases}$$a rectangle of height $3$ and width $4$.<br>'
     +'<b>Solution — part (b).</b> On $|t|<2$: $\\tfrac12[(t+3)-(-t+3)]=\\tfrac12\\cdot2t=t$. On $2<|t|<3$: $\\tfrac12[t-(-t)]=\\tfrac12\\cdot2t=t$. So$$\\Od\\{x(t)\\}=\\begin{cases}t,&|t|<3\\\\0,&\\text{otherwise,}\\end{cases}$$a single ramp across the whole window.<br>'
     +'<b>Solution — part (c).</b> Square and integrate each part over its support:$$E_{\\Ev}=\\int_{-2}^{2}3^{2}\\,\\d t=9\\bigl[t\\bigr]_{-2}^{2}=9\\bigl(2-(-2)\\bigr)=36\\;\\text{J},\\qquad E_{\\Od}=\\int_{-3}^{3}t^{2}\\,\\d t=\\left[\\frac{t^{3}}{3}\\right]_{-3}^{3}=\\frac{27}{3}-\\left(-\\frac{27}{3}\\right)=18\\;\\text{J}.$$Because the two parts are orthogonal, the energies add:$$E_x=E_{\\Ev}+E_{\\Od}=36+18=54\\;\\text{J}.$$'
     +'<b>Check.</b> The two parts must add back to $x$: on $|t|<2$, $3+t$ is $x$; on $2<|t|<3$, $0+t$ is $x$. Computing $E_x$ directly confirms the split. Expand $(t+3)^{2}=t^{2}+6t+9$ for the middle piece:$$\\begin{aligned}\\int_{-3}^{-2}t^{2}\\,\\d t&=\\left[\\frac{t^{3}}{3}\\right]_{-3}^{-2}=-\\frac83+\\frac{27}{3}=\\frac{19}{3},\\\\[4pt]\\int_{-2}^{2}(t+3)^{2}\\,\\d t&=\\left[\\frac{t^{3}}{3}+3t^{2}+9t\\right]_{-2}^{2}=\\left(\\frac83+12+18\\right)-\\left(-\\frac83+12-18\\right)=\\frac{16}{3}+36=\\frac{124}{3},\\\\[4pt]\\int_{2}^{3}t^{2}\\,\\d t&=\\left[\\frac{t^{3}}{3}\\right]_{2}^{3}=\\frac{27}{3}-\\frac83=\\frac{19}{3},\\end{aligned}$$and the total is $\\dfrac{19+124+19}{3}=\\dfrac{162}{3}=54\\;\\text{J}$, so the energies do add, which they would not if the parts overlapped in the wrong way.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.2,4.2],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-4.2,0],[-2,0],[-2,3],[2,3],[2,0],[4.2,0]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.2,4.2],yr:[-3.8,3.8],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-4.2,0],[-3,0],[-3,-3],[3,3],[3,0],[4.2,0]],{color:C.out}); return a.svg();})()),
  err:'Taking the even part to be $3$ on the whole window $|t|<3$. Outside $|t|=2$ the constant is no longer there, so only the ramp survives, and a ramp has no even part.',
  teach:'Use energy additivity as the check. Orthogonality requires $36+18=54$, and direct integration gives the same total.' },

{ id:'D1-25', module:'M1', type:'full', src:'Final Q1',
  stem:'Two discrete-time complex exponentials differ only in whether $\\pi$ appears in the frequency:$$x_1[n]=e^{j\\frac{4}{7}n},\\qquad x_2[n]=e^{j\\frac{4\\pi}{7}n}.$$',
  parts:['Determine whether $x_1[n]$ is periodic. If it is, find its fundamental period.',
         'Determine whether $x_2[n]$ is periodic. If it is, find its fundamental period, and say what makes the two cases differ.'],
  sol:'<b>Given.</b> Two discrete-time complex exponentials, $\\omega_1=\\tfrac47$ and $\\omega_2=\\tfrac{4\\pi}{7}$ rad/sample.<br>'
     +'<b>Find.</b> Whether each repeats, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time exponential repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. Since $e^{j\\omega_0(n+N)}=e^{j\\omega_0n}e^{j\\omega_0N}$, that needs $e^{j\\omega_0N}=1$, that is $\\omega_0N=2\\pi k$ with $k$ an integer, so $\\omega_0/2\\pi=k/N$ must be rational.<br>'
     +'<b>Solution — part (a).</b> Form the ratio:$$\\frac{\\omega_1}{2\\pi}=\\frac{4/7}{2\\pi}=\\frac{4}{14\\pi}=\\frac{2}{7\\pi}.$$If this equalled $\\tfrac{k}{N}$ for integers $k,N$, then $\\pi=\\dfrac{2N}{7k}$ would be rational. Since $\\pi$ is irrational, $\\tfrac{2}{7\\pi}$ is irrational, and no integer $N$ satisfies the condition. $x_1[n]$ is <b>not periodic</b>.<br>'
     +'<b>Solution — part (b).</b> Form the ratio:$$\\frac{\\omega_2}{2\\pi}=\\frac{4\\pi/7}{2\\pi}=\\frac{4\\pi}{14\\pi}=\\frac{2}{7},$$which is rational, so $x_2[n]$ <b>is periodic</b>. Then$$N=\\frac{2\\pi}{\\omega_2}k=\\frac{2\\pi\\cdot7}{4\\pi}k=\\frac{7}{2}k,$$which is an integer only when $k$ is even. The smallest choice $k=2$ gives $N_0=\\tfrac{7\\cdot2}{2}=7$. What separates the two is the factor $\\pi$ in the frequency: it is exactly what cancels against the $2\\pi$ in the test and leaves a ratio of two integers.<br>'
     +'<b>Check.</b> For $x_2$, substitute $n+7$:$$e^{j\\frac{4\\pi}{7}(n+7)}=e^{j\\frac{4\\pi}{7}n}e^{j4\\pi},\\qquad e^{j4\\pi}=\\cos4\\pi+j\\sin4\\pi=1+j\\cdot0=1,$$so $N=7$ does return the sequence to itself; no smaller positive integer does, because $\\tfrac72k$ is an integer only when $k$ is even. For $x_1$, the continuous-time signal $e^{j4t/7}$ is periodic with $T_0=\\dfrac{2\\pi}{4/7}=\\dfrac{7\\pi}{2}$. Sampling on the integers destroys the repetition, because $\\tfrac{7\\pi}{2}$ is not an integer and no integer multiple of it is either.',
  err:'Reporting $N_0=\\tfrac{7\\pi}{2}$ for $x_1[n]$ by transferring the continuous-time formula $T_0=2\\pi/\\omega_0$. A period of a sequence has to be an integer, and no non-integer answer can be one.',
  teach:'Compare the two frequencies directly. The factor $\\pi$ determines whether $\\omega_0/2\\pi$ is rational, so it determines periodicity in discrete time.' },

{ id:'D1-26', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (b) to (e) all use the signal $x(t)$ plotted below.',
  parts:['Is $x[n]=\\sin\\!\\left(\\tfrac{6\\pi}{7}n+\\tfrac{\\pi}{4}\\right)$ periodic? If so, find its fundamental period.',
         'Calculate the energy $E_\\infty$ of $x(t)$.',
         'Plot $y(t)=x(2t+4)$.',
         'Plot $z(t)=\\Od\\{y(t)\\}$, the odd part of the $y(t)$ signal of part (c).',
         'Evaluate $\\int_{-\\infty}^{\\infty}z(t)\\delta(3t+3)\\,\\d t$, with $z(t)$ as defined in part (d).'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,5.6],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[1,3],[2,3],[4,0],[5.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A discrete-time sine, and a trapezoid $x(t)=3t$ on $0\\le t\\le1$, $x(t)=3$ on $1\\le t\\le2$, $x(t)=\\tfrac32(4-t)$ on $2\\le t\\le4$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> Test the discrete-time frequency ratio in part (a). Integrate the squared pieces in part (b). Map the argument of $x$ in part (c), form the odd part of that result in part (d), and scale the impulse before sifting in part (e). Parts (d) and (e) use the plot from part (c).<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{6\\pi}{7}$. Form the ratio:$$\\frac{\\omega_0}{2\\pi}=\\frac{6\\pi/7}{2\\pi}=\\frac{6}{14}=\\frac{3}{7},$$rational. Then$$N=\\frac{2\\pi}{\\omega_0}k=\\frac{2\\pi\\cdot7}{6\\pi}k=\\frac{7}{3}k,$$which is an integer only when $3\\mid k$; the smallest choice $k=3$ gives $N_0=7$. The phase $\\tfrac{\\pi}{4}$ plays no part in the test.<br>'
     +'<b>Solution — part (b).</b> Square each piece: $(3t)^{2}=9t^{2}$, $3^{2}=9$, and $\\left(\\tfrac32(4-t)\\right)^{2}=\\tfrac94(4-t)^{2}$. Substitute into $E_\\infty=\\int|x(t)|^{2}\\,\\d t$ and evaluate each integral:$$\\begin{aligned}\\int_{0}^{1}9t^{2}\\,\\d t&=\\bigl[3t^{3}\\bigr]_{0}^{1}=3-0=3,\\\\[4pt]\\int_{1}^{2}9\\,\\d t&=\\bigl[9t\\bigr]_{1}^{2}=18-9=9,\\\\[4pt]\\int_{2}^{4}\\tfrac94(4-t)^{2}\\,\\d t&=\\tfrac94\\int_{0}^{2}s^{2}\\,\\d s=\\tfrac94\\left[\\frac{s^{3}}{3}\\right]_{0}^{2}=\\tfrac94\\cdot\\frac83=\\frac{72}{12}=6,\\end{aligned}$$where the third line substitutes $s=4-t$, $\\d s=-\\d t$, with $t=2\\mapsto s=2$ and $t=4\\mapsto s=0$, and the sign of $\\d s$ swaps the limits back. Adding,$$E_\\infty=3+9+6=18\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $s=2t+4=2(t+2)$: the signal is advanced by $2$ and compressed by $2$. <em>Support.</em> $y(t)\\neq0$ where $0\\le s\\le4$:$$0\\le2t+4\\le4\\;\\Longrightarrow\\;-4\\le2t\\le0\\;\\Longrightarrow\\;-2\\le t\\le0,$$half the original width. <em>Pieces.</em> The rising piece, $0\\le s\\le1$: $0\\le2t+4\\le1$ gives $-4\\le2t\\le-3$, so $-2\\le t\\le-\\tfrac32$, and there $y(t)=3(2t+4)=6t+12$. The flat top, $1\\le s\\le2$: $1\\le2t+4\\le2$ gives $-3\\le2t\\le-2$, so $-\\tfrac32\\le t\\le-1$, and there $y(t)=3$. The falling piece, $2\\le s\\le4$: $2\\le2t+4\\le4$ gives $-2\\le2t\\le0$, so $-1\\le t\\le0$, and there $y(t)=\\tfrac32\\bigl(4-(2t+4)\\bigr)=\\tfrac32(-2t)=-3t$. The flat top sits on $-\\tfrac32\\le t\\le-1$ and keeps its height $3$.<br>'
     +'<b>Solution — part (d).</b> $z(t)=\\tfrac12[y(t)-y(-t)]$. $y(-t)$ is non-zero where $-2\\le-t\\le0$, that is $0\\le t\\le2$. So $y$ lives on $[-2,0]$ and $y(-t)$ on $[0,2]$, and the two never overlap except at $t=0$. For $t<0$ only $y(t)$ is present, so $z(t)=\\tfrac12y(t)$; for $t>0$ only $y(-t)$ is present, so $z(t)=\\tfrac12[0-y(-t)]=-\\tfrac12y(-t)$:$$z(t)=\\begin{cases}\\tfrac12y(t),&t<0\\\\-\\tfrac12y(-t),&t>0,\\end{cases}$$a copy of $y$ halved on the left and its negative mirror image on the right.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse with $a=3$, $b=-3$: $\\delta(3t+3)=\\tfrac13\\delta\\!\\left(t+\\tfrac33\\right)=\\tfrac13\\delta(t+1)$. Sifting will need $z(-1)$. Since $-1<0$, part (d) gives $z(-1)=\\tfrac12y(-1)$, and from part (c) $y(-1)=x(2\\cdot(-1)+4)=x(2)=3$, so $z(-1)=\\tfrac12\\cdot3=\\tfrac32$. Then$$\\int_{-\\infty}^{\\infty}z(t)\\delta(3t+3)\\,\\d t=\\int_{-\\infty}^{\\infty}z(t)\\cdot\\tfrac13\\delta(t+1)\\,\\d t=\\tfrac13z(-1)=\\tfrac13\\cdot\\tfrac32=\\tfrac12.$$'
     +'<b>Check.</b> In (b) the trapezoid never exceeds $3$ and lasts $4$ seconds, so $E_\\infty\\le3^{2}\\cdot4=36$; $18$ is half of that, which is right for a shape that is at full height for only part of its width. In (c) the width went from $4$ to $2$, the factor $1/|a|=\\tfrac12$ the scaling promises, and the pieces meet: $6\\cdot(-\\tfrac32)+12=3$ and $-3\\cdot(-1)=3$. In (d), $z$ must vanish at $t=0$, and it does, because $y(0)=x(4)=0$. In (e) dropping the factor $\\tfrac13$ would give $\\tfrac32$, three times the answer.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.8,1.4],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:48,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-2.8,0],[-2,0],[-1.5,3],[-1,3],[0,0],[1.4,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.8,2.8],yr:[-2.2,2.2],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{y(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-2.8,0],[-2,0],[-1.5,1.5],[-1,1.5],[0,0],[1,-1.5],[1.5,-1.5],[2,0],[2.8,0]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x(2t+4)$ as a delay of $4$ followed by a compression, and reporting a support of $[2,4]$ or $[4,8]$. Factor the argument as $2(t+2)$ first: the shift that acts is $2$, not $4$, and it moves the signal to the left.',
  teach:'Part (e) needs only $z(-1)$. Read this value from the plot of $y$ instead of deriving a full formula for $z$.' },

{ id:'D1-27', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (c) to (e) use the signal $y(t)$ plotted below.',
  parts:['Is the signal $x(t)=5e^{j\\frac{3\\pi}{4}t}$ periodic? If so, what is its fundamental period?',
         'Determine the energy $E_\\infty$ of the signal $x[n]=\\left(\\tfrac12\\right)^{n}u[n-2]$.',
         'Generate a plot of $y(2t-1)$ using the given signal $y(t)$.',
         'Plot the even part of $y(t)$.',
         'Evaluate $\\int_{-\\infty}^{\\infty}y(t)\\delta(2t-1)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.2,3.2],yr:[-1.6,1.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-3.2,0],[0,0],[0,1],[2,-1],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A continuous-time complex exponential, a delayed geometric sequence, and a falling ramp $y(t)=1-t$ on $0\\le t\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> Use the continuous-time exponential period formula in part (a) and a geometric series beginning at the first non-zero index in part (b). Map the argument in part (c), form the even part from the given plot in part (d), and scale the impulse before sifting in part (e).<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{3\\pi}{4}$ rad/s, and every continuous-time complex exponential is periodic, because $e^{j\\omega_0(t+T_0)}=e^{j\\omega_0t}$ as soon as $\\omega_0T_0=2\\pi$:$$T_0=\\frac{2\\pi}{|\\omega_0|}=\\frac{2\\pi}{3\\pi/4}=\\frac{2\\pi\\cdot4}{3\\pi}=\\frac83\\;\\text{s}\\approx2.667\\;\\text{s}.$$'
     +'<b>Solution — part (b).</b> Square the sequence: $|x[n]|^{2}=\\left(\\tfrac12\\right)^{2n}=\\left(\\tfrac14\\right)^{n}$, and the step $u[n-2]$ keeps only $n\\ge2$. Substitute $m=n-2$, so $n=m+2$ and $m$ runs from $0$:$$E_\\infty=\\sum_{n=2}^{\\infty}\\left(\\tfrac14\\right)^{n}=\\sum_{m=0}^{\\infty}\\left(\\tfrac14\\right)^{m+2}=\\left(\\tfrac14\\right)^{2}\\sum_{m=0}^{\\infty}\\left(\\tfrac14\\right)^{m}.$$The remaining series has ratio $r=\\tfrac14$, $|r|<1$, so it equals $\\dfrac{1}{1-\\tfrac14}=\\dfrac{1}{3/4}=\\dfrac43$. Hence$$E_\\infty=\\frac{1}{16}\\cdot\\frac43=\\frac{4}{48}=\\frac{1}{12}\\approx0.0833\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $s=2t-1=2\\!\\left(t-\\tfrac12\\right)$: the signal is delayed by $\\tfrac12$ and compressed by $2$. <em>Support.</em> $y(s)\\neq0$ where $0\\le s\\le2$:$$0\\le2t-1\\le2\\;\\Longrightarrow\\;1\\le2t\\le3\\;\\Longrightarrow\\;\\tfrac12\\le t\\le\\tfrac32,$$half the original width. <em>Formula.</em> On that interval $y(s)=1-s$, so$$y(2t-1)=1-(2t-1)=2-2t,$$running from $2-2\\cdot\\tfrac12=1$ at $t=\\tfrac12$ down to $2-2\\cdot\\tfrac32=-1$ at $t=\\tfrac32$.<br>'
     +'<b>Solution — part (d).</b> The reflection is $y(-t)=1-(-t)=1+t$ where $0\\le-t\\le2$, that is $-2\\le t\\le0$. So on $0<t<2$ only $y(t)$ is present, and on $-2<t<0$ only $y(-t)$:$$\\Ev\\{y(t)\\}=\\begin{cases}\\tfrac12\\bigl[(1-t)+0\\bigr]=\\tfrac12(1-t),&0<t<2,\\\\[2pt]\\tfrac12\\bigl[0+(1+t)\\bigr]=\\tfrac12(1+t),&-2<t<0.\\end{cases}$$Since $t=|t|$ on the first interval and $t=-|t|$ on the second, both lines read$$\\Ev\\{y(t)\\}=\\tfrac12(1-|t|)\\quad\\text{for }|t|<2,$$zero elsewhere. It runs from $\\tfrac12$ at $t=0$ down to $\\tfrac12(1-2)=-\\tfrac12$ at $t=\\pm2$.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse with $a=2$, $b=1$: $\\delta(2t-1)=\\tfrac12\\delta\\!\\left(t-\\tfrac12\\right)$. The sifting point $t_0=\\tfrac12$ lies inside the support of $y$, and $y\\!\\left(\\tfrac12\\right)=1-\\tfrac12=\\tfrac12$, so$$\\int_{-\\infty}^{\\infty}y(t)\\delta(2t-1)\\,\\d t=\\int_{-\\infty}^{\\infty}y(t)\\cdot\\tfrac12\\delta\\!\\left(t-\\tfrac12\\right)\\d t=\\tfrac12\\,y\\!\\left(\\tfrac12\\right)=\\tfrac12\\cdot\\tfrac12=\\tfrac14.$$'
     +'<b>Check.</b> In (b) the first term alone is $\\tfrac{1}{16}=0.0625$ and the rest add $\\tfrac{1}{12}-\\tfrac{1}{16}=\\tfrac{1}{48}\\approx0.021$, so $\\tfrac{1}{12}$ is the right size; starting the sum at $n=0$ instead would give $\\tfrac{1}{1-1/4}=\\tfrac43$, sixteen times too large. In (c) the width went from $2$ to $1$, the factor $1/|a|=\\tfrac12$ the scaling promises. In (d) the even and odd parts must add back to $y$: at $t=1$, $\\Ev=\\tfrac12(1-1)=0$ and $\\Od=\\tfrac12[y(1)-y(-1)]=\\tfrac12[0-0]=0$, matching $y(1)=0$.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.8,2.4],yr:[-1.6,1.6],xlabel:'t\\;(\\text{s})',ylabel:'y(2t-1)',
      pad:{l:52,r:26,t:28,b:36},xstep:0.5,ystep:0.5});
      a.poly([[-0.8,0],[0.5,0],[0.5,1],[1.5,-1],[1.5,0],[2.4,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.2,3.2],yr:[-1.1,1.1],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{y(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:0.5});
      a.poly([[-3.2,0],[-2,0],[-2,-0.5],[0,0.5],[2,-0.5],[2,0],[3.2,0]],{color:C.mid}); return a.svg();})()),
  err:'Starting the sum in part (b) at $n=0$. The step is $u[n-2]$, so the first non-zero sample is at $n=2$ and the series begins with $\\left(\\tfrac14\\right)^{2}$, not with $1$.',
  teach:'Part (d) catches students who assume the even part of a one-sided signal is that signal halved. That is true only where the reflection does not reach, and here the reflection covers $-2<t<0$, so the answer has support twice as wide as $y$.' },

{ id:'D1-28', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (b) and (c) use the sequence $x_1[n]$ of part (a); parts (d) and (e) use the signal $x_3(t)$ plotted below.',
  parts:['Sketch and label the signal $x_1[n]=\\sum_{k=-\\infty}^{\\infty}\\{\\delta[n-4k]-\\delta[n+1+6k]\\}$.',
         'Is the $x_1[n]$ of part (a) periodic? If so, what is its fundamental period?',
         'For the $x_1[n]$ of part (a), plot the odd part of $x_2[n]=\\begin{cases}x_1[n],&-4\\le n\\le4\\\\0,&\\text{otherwise.}\\end{cases}$',
         'Calculate the energy $E_\\infty$ of $x_3(t)$.',
         'For the $x_3(t)$ of part (d), evaluate $\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t-1.5)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,3.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,1],[-1,1],[-1,2],[1,2],[1,1],[2,1],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A difference of two impulse trains, and a stepped pulse $x_3(t)=2$ on $|t|\\le1$, $x_3(t)=1$ on $1<|t|\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A sketch, a period, an odd part, an energy, and one sifting integral.<br>'
     +'<b>Method.</b> Locate the samples from each impulse train and add their weights index by index. Use the least common multiple of the train periods in part (b). Apply the odd-part definition to the windowed sequence in part (c), integrate the squared levels in part (d), and use sifting in part (e).<br>'
     +'<b>Solution — part (a).</b> The first train, $\\sum_k\\delta[n-4k]$, places $+1$ at every $n=4k$, that is $n\\equiv0\\pmod 4$: $\\dots,-4,0,4,8,\\dots$. The second train, $-\\sum_k\\delta[n+1+6k]$, places $-1$ where $n+1+6k=0$, that is $n=-1-6k$: $k=0,-1,-2$ give $n=-1,5,11$, so every $n\\equiv5\\pmod 6$. Over one stretch $0\\le n\\le11$ that gives $+1$ at $n=0,4,8$ and $-1$ at $n=5,11$. No index receives both, so nothing cancels here.<br>'
     +'<b>Solution — part (b).</b> The trains repeat every $4$ and every $6$ samples. Factor into primes: $4=2^{2}$ and $6=2\\cdot3$. The least common multiple takes each prime at its highest power:$$N_0=\\operatorname{lcm}(4,6)=2^{2}\\cdot3=12,$$not $24$: the two periods share the factor $2$, so the product overshoots.<br>'
     +'<b>Solution — part (c).</b> Windowing to $-4\\le n\\le4$ keeps the samples of $x_1$ in that range. Multiples of $4$ there are $n=-4,0,4$, each carrying $+1$. Indices $\\equiv5\\pmod6$ there: $n=-1$ (since $-1=5-6$) carries $-1$; $n=5$ is outside the window. So $x_2[-4]=1$, $x_2[-1]=-1$, $x_2[0]=1$, $x_2[4]=1$, and zero elsewhere. Then apply $\\Od\\{x_2\\}[n]=\\tfrac12(x_2[n]-x_2[-n])$ at each index where either term is non-zero:$$\\begin{aligned}n=\\pm4:&\\quad\\tfrac12(x_2[4]-x_2[-4])=\\tfrac12(1-1)=0,\\\\n=-1:&\\quad\\tfrac12(x_2[-1]-x_2[1])=\\tfrac12(-1-0)=-\\tfrac12,\\\\n=0:&\\quad\\tfrac12(x_2[0]-x_2[0])=0,\\\\n=1:&\\quad\\tfrac12(x_2[1]-x_2[-1])=\\tfrac12(0-(-1))=\\tfrac12,\\end{aligned}$$and zero everywhere else. At $n=\\pm4$ the two samples are equal, so they contribute nothing to the odd part; at $n=0$ the odd part always vanishes.<br>'
     +'<b>Solution — part (d).</b> Square each level: $2^{2}=4$ on $|t|\\le1$ and $1^{2}=1$ on $1<|t|\\le2$. The outer band has two pieces of equal length, $[-2,-1]$ and $[1,2]$:$$E_\\infty=\\int_{-1}^{1}4\\,\\d t+\\int_{-2}^{-1}1\\,\\d t+\\int_{1}^{2}1\\,\\d t=4\\bigl[t\\bigr]_{-1}^{1}+\\bigl[t\\bigr]_{-2}^{-1}+\\bigl[t\\bigr]_{1}^{2}=4\\cdot2+1+1=10\\;\\text{J}.$$'
     +'<b>Solution — part (e).</b> The point $t=1.5$ satisfies $1<1.5\\le2$, so it lies on the lower step, where $x_3=1$:$$\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t-1.5)\\,\\d t=x_3(1.5)=1.$$'
     +'<b>Check.</b> In (b), $12/4=3$ and $12/6=2$: the length $12$ holds three periods of the first train and two of the second, both whole numbers, and no smaller positive integer does. In (c) the odd part is non-zero only where $x_2$ fails to be symmetric, which is the pair $n=\\pm1$ alone. In (d) the pulse never exceeds $2$ and lasts $4$ seconds, so $E_\\infty\\le2^{2}\\cdot4=16$; $10$ sits inside.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,12.6],yr:[-1.6,1.6],xlabel:'n',ylabel:'x_1[n]',
      pad:{l:48,r:26,t:28,b:34},xstep:2,ystep:1});
      a.stem([[0,1],[4,1],[5,-1],[8,1],[11,-1]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-5.6,5.6],yr:[-1.1,1.1],xlabel:'n',ylabel:'\\Od\\{x_2\\}[n]',
      pad:{l:56,r:26,t:28,b:34},xstep:1,ystep:0.5});
      a.stem([[-1,-0.5],[1,0.5]],{color:C.mid}); return a.svg();})()),
  err:'Reporting $N_0=24$ in part (b) by multiplying the two periods. The product is always a period; it is the fundamental one only when the two are coprime, and $4$ and $6$ share the factor $2$.',
  teach:'Part (c) is the useful contrast with the previous question of this kind. Here the window is symmetric and catches equal samples at $n=\\pm4$, so those drop out of the odd part entirely — a student who reports four non-zero samples has not applied the definition at $n=4$.' },

{ id:'D1-29', module:'M1', type:'full', src:'Final Q1',
  stem:'Consider the signal $$x(t)=\\left[2t+\\{u(t+1)-u(t-1)\\}\\right]\\times\\{u(t+2)-u(t-2)\\}.$$',
  parts:['Plot the even part of $x(t)$.',
         'Plot the odd part of $x(t)$.',
         'Calculate the energies of the even and odd parts of $x(t)$, and of $x(t)$ itself.'],
  sol:'<b>Given.</b> A ramp of slope $2$ raised by $1$ over the inner window, the whole product cut off outside $|t|<2$.<br>'
     +'<b>Find.</b> The even and odd parts, and three energies.<br>'
     +'<b>Method.</b> Write $x$ piecewise. The outer window $u(t+2)-u(t-2)$ equals $1$ on $|t|<2$; the inner window $u(t+1)-u(t-1)$ equals $1$ on $|t|<1$ and adds $1$ only there. Then split each piece with $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$, and integrate the squares.<br>'
     +'<b>Solution — piecewise form.</b> On $|t|<1$ both windows are on: $x(t)=(2t+1)\\cdot1=2t+1$. On $1<|t|<2$ only the outer window is on: $x(t)=(2t+0)\\cdot1=2t$. On $|t|>2$ everything is off. So$$x(t)=\\begin{cases}2t+1,&|t|<1\\\\2t,&1<|t|<2\\\\0,&|t|>2.\\end{cases}$$Each region is symmetric about $t=0$, so $x(-t)$ is the same formula with $t$ replaced by $-t$: $-2t+1$ on $|t|<1$ and $-2t$ on $1<|t|<2$.<br>'
     +'<b>Solution — part (a).</b> On $|t|<1$: $\\tfrac12[(2t+1)+(-2t+1)]=\\tfrac12\\cdot2=1$. On $1<|t|<2$: $\\tfrac12[2t+(-2t)]=0$. So$$\\Ev\\{x(t)\\}=\\begin{cases}1,&|t|<1\\\\0,&\\text{otherwise,}\\end{cases}$$a rectangle of height $1$ on $|t|<1$.<br>'
     +'<b>Solution — part (b).</b> On $|t|<1$: $\\tfrac12[(2t+1)-(-2t+1)]=\\tfrac12\\cdot4t=2t$. On $1<|t|<2$: $\\tfrac12[2t-(-2t)]=\\tfrac12\\cdot4t=2t$. So$$\\Od\\{x(t)\\}=\\begin{cases}2t,&|t|<2\\\\0,&\\text{otherwise,}\\end{cases}$$one ramp across the whole window.<br>'
     +'<b>Solution — part (c).</b> Square and integrate each part over its support. For the odd part, $(2t)^{2}=4t^{2}$:$$E_{\\Ev}=\\int_{-1}^{1}1^{2}\\,\\d t=\\bigl[t\\bigr]_{-1}^{1}=1-(-1)=2\\;\\text{J},\\qquad E_{\\Od}=\\int_{-2}^{2}4t^{2}\\,\\d t=\\left[\\frac{4t^{3}}{3}\\right]_{-2}^{2}=\\frac{32}{3}-\\left(-\\frac{32}{3}\\right)=\\frac{64}{3}\\;\\text{J}.$$By orthogonality the energies add:$$E_x=E_{\\Ev}+E_{\\Od}=2+\\frac{64}{3}=\\frac{6}{3}+\\frac{64}{3}=\\frac{70}{3}\\;\\text{J}\\approx23.33\\;\\text{J}.$$'
     +'<b>Check.</b> The parts add back: $1+2t=x$ on $|t|<1$, and $0+2t=x$ on $1<|t|<2$. Integrating $x^{2}$ directly, with $(2t+1)^{2}=4t^{2}+4t+1$ on the middle piece:$$\\begin{aligned}\\int_{-2}^{-1}4t^{2}\\,\\d t&=\\left[\\frac{4t^{3}}{3}\\right]_{-2}^{-1}=-\\frac43+\\frac{32}{3}=\\frac{28}{3},\\\\[4pt]\\int_{-1}^{1}(2t+1)^{2}\\,\\d t&=\\left[\\frac{4t^{3}}{3}+2t^{2}+t\\right]_{-1}^{1}=\\left(\\frac43+2+1\\right)-\\left(-\\frac43+2-1\\right)=\\frac{13}{3}+\\frac13=\\frac{14}{3},\\\\[4pt]\\int_{1}^{2}4t^{2}\\,\\d t&=\\left[\\frac{4t^{3}}{3}\\right]_{1}^{2}=\\frac{32}{3}-\\frac43=\\frac{28}{3},\\end{aligned}$$and the total is $\\dfrac{28+14+28}{3}=\\dfrac{70}{3}$, which matches, so the split is right.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.2,3.2],yr:[-0.5,1.8],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:0.5});
      a.poly([[-3.2,0],[-1,0],[-1,1],[1,1],[1,0],[3.2,0]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.2,3.2],yr:[-4.6,4.6],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:2});
      a.poly([[-3.2,0],[-2,0],[-2,-4],[2,4],[2,0],[3.2,0]],{color:C.out}); return a.svg();})()),
  err:'Reporting the odd part as $2t$ on $|t|<1$ only, on the grounds that the ramp outside is not part of the raised section. The window in the definition is the outer one, $|t|<2$, and the ramp runs across all of it.',
  teach:'Set this beside the question with the same shape and different numbers. The even part changes width with the inner window and the odd part with the outer one, and seeing the two questions together makes that separation obvious.' },

{ id:'D1-30', module:'M1', type:'full', src:'MT1 Q1',
  stem:'A signal is built from three step functions:$$x(t)=u(t+2)-2u(t)+u(t-2).$$',
  parts:['Sketch $x(t)$ and give its piecewise form.',
         'Determine $\\dfrac{\\d x}{\\d t}$ as a sum of impulses.',
         'Evaluate $\\int_{-\\infty}^{\\infty}x(t)\\delta(t-1)\\,\\d t$.',
         'Evaluate $\\int_{-\\infty}^{\\infty}\\dfrac{\\d x}{\\d t}\\,t^{2}\\,\\d t$.',
         'Calculate the energy $E_\\infty$ of $x(t)$.'],
  sol:'<b>Given.</b> A signal assembled from three steps with weights $+1$, $-2$ and $+1$.<br>'
     +'<b>Find.</b> A sketch, a derivative, two integrals, and an energy.<br>'
     +'<b>Method.</b> Add the steps interval by interval. Differentiating a step gives an impulse at the jump, $\\dfrac{\\d}{\\d t}u(t-t_0)=\\delta(t-t_0)$, and differentiation is linear, so each weighted step gives a weighted impulse. Sifting against an impulse returns a number.<br>'
     +'<b>Solution — part (a).</b> Evaluate the three steps on each interval between the jump points $t=-2,0,2$:$$\\begin{aligned}t<-2:&\\quad u(t+2)=0,\\;u(t)=0,\\;u(t-2)=0,&x(t)&=0-0+0=0,\\\\-2<t<0:&\\quad u(t+2)=1,\\;u(t)=0,\\;u(t-2)=0,&x(t)&=1-0+0=1,\\\\0<t<2:&\\quad u(t+2)=1,\\;u(t)=1,\\;u(t-2)=0,&x(t)&=1-2+0=-1,\\\\t>2:&\\quad u(t+2)=1,\\;u(t)=1,\\;u(t-2)=1,&x(t)&=1-2+1=0.\\end{aligned}$$So$$x(t)=\\begin{cases}1,&-2<t<0\\\\-1,&0<t<2\\\\0,&\\text{otherwise,}\\end{cases}$$a pair of rectangles of opposite sign.<br>'
     +'<b>Solution — part (b).</b> Differentiate term by term. Each step contributes an impulse at its own jump, carrying the weight of that jump:$$\\frac{\\d x}{\\d t}=\\frac{\\d}{\\d t}u(t+2)-2\\frac{\\d}{\\d t}u(t)+\\frac{\\d}{\\d t}u(t-2)=\\delta(t+2)-2\\delta(t)+\\delta(t-2).$$'
     +'<b>Solution — part (c).</b> The impulse sits at $t_0=1$, which lies in $0<t<2$, the negative rectangle:$$\\int_{-\\infty}^{\\infty}x(t)\\delta(t-1)\\,\\d t=x(1)=-1.$$'
     +'<b>Solution — part (d).</b> Substitute the derivative from part (b), split the integral by linearity, and sift $t^{2}$ against each impulse at its own location:$$\\begin{aligned}\\int_{-\\infty}^{\\infty}\\frac{\\d x}{\\d t}\\,t^{2}\\,\\d t&=\\int_{-\\infty}^{\\infty}t^{2}\\delta(t+2)\\,\\d t-2\\int_{-\\infty}^{\\infty}t^{2}\\delta(t)\\,\\d t+\\int_{-\\infty}^{\\infty}t^{2}\\delta(t-2)\\,\\d t\\\\&=(-2)^{2}-2\\cdot0^{2}+2^{2}=4-0+4=8.\\end{aligned}$$'
     +'<b>Solution — part (e).</b> Square each level: $1^{2}=1$ and $(-1)^{2}=1$, so the integrand is $1$ over a total length of $4$ seconds:$$E_\\infty=\\int_{-2}^{0}1^{2}\\,\\d t+\\int_{0}^{2}(-1)^{2}\\,\\d t=\\bigl[t\\bigr]_{-2}^{0}+\\bigl[t\\bigr]_{0}^{2}=2+2=4\\;\\text{J}.$$'
     +'<b>Check.</b> The impulse weights in (b) must sum to zero, because $x$ starts and ends at zero: $1-2+1=0$. Integrating the derivative back gives $x$ again, which confirms the signs. In (d) the middle impulse contributes nothing because $t^{2}$ vanishes at $t=0$ — a student who writes $-2$ there has sifted the weight instead of the function. In (e) squaring removes the sign, so both rectangles contribute equally.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-1.8,1.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:50,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-3.4,0],[-2,0],[-2,1],[0,1],[0,-1],[2,-1],[2,0],[3.4,0]],{color:C.in}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-2.6,1.8],xlabel:'t\\;(\\text{s})',ylabel:'\\d x/\\d t',
      pad:{l:50,r:26,t:28,b:36},xstep:1,ystep:1});
      a.impulse(-2,1,{color:C.mid}); a.impulse(0,-2,{color:C.mid}); a.impulse(2,1,{color:C.mid});
      return a.svg();})()),
  err:'Answering part (d) with $1-2+1=0$, the sum of the impulse weights, instead of weighting each by $t^{2}$ at its own location. Sifting evaluates the other factor at the impulse, and $t^{2}$ is $4$, $0$ and $4$ at the three locations.',
  teach:'Parts (c) and (d) look alike and are not. In (c) the impulse selects a value of $x$; in (d) the impulses are the signal and $t^{2}$ is what gets selected. Asking which factor is doing the sifting is the question that separates them.' }

]);

/* The questions sit at the end of the module, after the teaching scenes. */
window.DRILL_M1 = [

{ id:'m1-drill', module:'M1', nav:'Module 1 · practice questions',
  title:'Module 1 — practice questions', src:'pp. 2–10',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 1 practice periodicity energy power transformation even odd sifting impulse step',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Practice D1-01 … D1-30', src:'pp. 2–10'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. Check that a period contains a whole number of every term, a transformed support has the required width, even and odd parts add back to the signal, and a running sum or integral ends at the total impulse weight.'},
  {t:'rule', short:true},
  {t:'drill', module:'M1'}
]}

];
})();
