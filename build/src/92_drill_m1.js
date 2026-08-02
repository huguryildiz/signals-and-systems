/* ==========================================================================
   Practice questions — Module 1.
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
   MODULE 1 — Signal Foundations
   ====================================================================== */

CONTENT.DRILLTYPES.M1 = [
  { k:'period', name:'Periodicity and the fundamental period',
    asks:'A signal is given as a formula. Decide whether it repeats, and if it does, find the smallest period.',
    method:['In discrete time, test whether $\\omega_0/2\\pi$ is a ratio of two integers. If it is not, the sequence never repeats.',
            'If it is, write $N=(2\\pi/\\omega_0)k$ and take the smallest positive integer value.',
            'In continuous time every sinusoid repeats, with $T_0=2\\pi/|\\omega_0|$.',
            'For a sum, each term must repeat, and the period of the sum is the least common multiple of the individual periods.'],
    go:'m1-periodic' },
  { k:'energy', name:'Energy, power, and which class a signal belongs to',
    asks:'Compute $E_\\infty$ or $P_\\infty$ for a given signal and classify it.',
    method:['Use the normalised definitions, $R=1\\,\\Omega$ throughout.',
            'Square the magnitude first, then integrate or sum over the whole axis.',
            'A finite $E_\\infty$ forces $P_\\infty=0$. A finite non-zero $P_\\infty$ forces $E_\\infty=\\infty$.',
            'Report both numbers, then name the class. One number alone does not classify.'],
    go:'m1-energy-inf' },
  { k:'transform', name:'Transformation of the independent variable',
    asks:'A signal is given by a plot or a formula. Plot $x(at+b)$ or $x[an+b]$.',
    method:['Write the transformation in the form $x(a t - b)$ and read off $a$ and $b$.',
            'Shift first, then scale or reflect. Doing it in the other order changes the sign of the shift.',
            'Map the edges of the support one at a time and check the width of the result.',
            'Verify one interior sample by direct substitution.'],
    go:'m1-combined' },
  { k:'evenodd', name:'Even and odd parts',
    asks:'Split a signal into its even and odd parts, and use the split.',
    method:['$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$.',
            'Build $x(-t)$ first, as a plot or a formula, and keep it visible.',
            'The two parts must add back to $x$. Check one point where $x$ is zero.',
            'The energies add: $E_x=E_{\\Ev}+E_{\\Od}$, because the two parts are orthogonal.'],
    go:'m1-evenodd' },
  { k:'impulse', name:'The impulse: sifting, scaling, and impulse trains',
    asks:'Evaluate an integral against an impulse, or sketch a sequence or signal built from impulses and steps.',
    method:['Sifting returns a number: $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$.',
            'Sampling returns a signal: $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$.',
            'A scaled argument carries a factor: $\\delta(at-b)=\\frac{1}{|a|}\\delta\\!\\left(t-\\frac{b}{a}\\right)$.',
            'The impulse and the step are related by $\\delta=\\d u/\\d t$ in continuous time and $\\delta[n]=u[n]-u[n-1]$ in discrete time; running the relation the other way turns a train of impulses into a staircase.'],
    go:'m1-ct-impulse' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'Several parts under one statement, each part usually resting on the part before it.',
    method:['Read all the parts before starting. A later part almost always uses the signal a earlier part produced, so an error early on travels.',
            'Name the type of each part before working it, and use the method for that type unchanged.',
            'Carry exact values between parts. A rounded intermediate result is the usual reason a final number is close but wrong.',
            'Check each part against the one before: a transformation must preserve the width of the support up to the scale factor, and the even and odd parts must add back to the signal they came from.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D1-01', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each sequence below is periodic. Where it is, give the fundamental period $N_0$.'
      +'$$\\text{(i)}\\;\\;x[n]=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}\\right)\\qquad\\text{(ii)}\\;\\;x[n]=e^{j3n}\\qquad\\text{(iii)}\\;\\;x[n]=\\sin\\!\\left(\\tfrac{\\pi}{6}n\\right)$$',
  parts:['Apply the periodicity test to each sequence.',
         'Give $N_0$ wherever it exists, and say why it does not exist otherwise.'],
  sol:'<b>Given.</b> Three discrete-time sinusoids.<br>'
     +'<b>Find.</b> Which repeat, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time sinusoid repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. That needs $\\omega_0N=2\\pi k$ with $k$ an integer, so$$\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}$$must be rational. The phase never affects the test.<br>'
     +'<b>Solution — (i).</b> $\\omega_0=\\tfrac{5\\pi}{8}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{5}{16}$, rational. Then $N=\\dfrac{2\\pi}{\\omega_0}k=\\dfrac{16}{5}k$ is an integer first at $k=5$, giving $N_0=16$. <b>Periodic.</b><br>'
     +'<b>Solution — (ii).</b> $\\omega_0=3$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{3}{2\\pi}$, irrational because $\\pi$ is irrational. No integer $N$ works. <b>Not periodic.</b><br>'
     +'<b>Solution — (iii).</b> $\\omega_0=\\tfrac{\\pi}{6}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{1}{12}$, rational. $N=\\dfrac{2\\pi}{\\omega_0}k=12k$ is an integer already at $k=1$, so $N_0=12$. <b>Periodic.</b><br>'
     +'<b>Check.</b> For (i), $\\cos\\!\\left(\\tfrac{5\\pi}{8}(n+16)-\\tfrac{\\pi}{6}\\right)=\\cos\\!\\left(\\tfrac{5\\pi}{8}n-\\tfrac{\\pi}{6}+10\\pi\\right)$, and $10\\pi$ is a whole number of turns, so $N=16$ does return the sequence to itself; no smaller positive integer does, because $\\tfrac{16}{5}k$ is an integer only when $5\\mid k$. The continuous-time signals $\\cos(5t/8-\\pi/6)$ and $\\sin(t/6)$ are perfectly periodic — it is sampling on the integers that removes the repetition in (ii).',
  err:'Transferring the continuous-time rule and reporting a non-integer period such as $2\\pi/3$ for (ii). A period that is not an integer is not a period of a sequence.',
  teach:'Ask for the ratio $\\omega_0/2\\pi$ to be written down for all three before any of them is answered. A student who computes $2\\pi/\\omega_0$ instead has skipped the decisive step.' },

{ id:'D1-02', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Let $$x[n]=\\cos\\!\\left(\\tfrac{\\pi}{5}n\\right)+\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right).$$',
  parts:['Show that each term is periodic and give its period.',
         'Determine the fundamental period $N_0$ of $x[n]$ and the fundamental frequency.'],
  sol:'<b>Given.</b> A sum of two discrete-time sinusoids.<br>'
     +'<b>Find.</b> The fundamental period of the sum.<br>'
     +'<b>Method.</b> A sum repeats only when every term repeats. The period of the sum is then the least common multiple of the individual periods, which is the smallest length holding a whole number of each.<br>'
     +'<b>Solution — part (a).</b> For the first term $\\omega_1=\\tfrac{\\pi}{5}$, so $\\dfrac{\\omega_1}{2\\pi}=\\dfrac{1}{10}$ and $N_1=10$. For the second $\\omega_2=\\tfrac{\\pi}{3}$, so $\\dfrac{\\omega_2}{2\\pi}=\\dfrac16$ and $N_2=6$. Both are rational, so both terms repeat.<br>'
     +'<b>Solution — part (b).</b>$$N_0=\\operatorname{lcm}(10,6)=30,$$and the fundamental frequency is $\\omega_0=\\dfrac{2\\pi}{30}=\\dfrac{\\pi}{15}$ rad/sample.<br>'
     +'<b>Check.</b> $30$ contains $3$ whole periods of the first term and $5$ of the second, so both return to their starting values together. Nothing smaller does: $15$ holds one and a half periods of the first term, which is not a whole number. In terms of harmonics, the two terms are the $3$rd and the $5$th harmonic of $\\pi/15$, consistent with $\\tfrac{\\pi}{5}=3\\cdot\\tfrac{\\pi}{15}$ and $\\tfrac{\\pi}{3}=5\\cdot\\tfrac{\\pi}{15}$.',
  err:'Multiplying the two periods to get $60$. The product is always a period, but it is the fundamental one only when the two are coprime — here $10$ and $6$ share the factor $2$.',
  teach:'Have the student verify $N_0$ by checking that $N_0/N_1$ and $N_0/N_2$ are both integers and that no smaller candidate has that property.' },

{ id:'D1-03', module:'M1', type:'period', src:'MT1 Q1',
  stem:'Decide whether each continuous-time signal is periodic. Where it is, give $T_0$ and $\\omega_0$.'
      +'$$\\text{(i)}\\;\\;x(t)=\\cos(3t)+\\sin(5t)\\qquad\\text{(ii)}\\;\\;y(t)=\\cos(t)+\\cos(\\sqrt2\\,t)$$',
  parts:['Give the period of each term separately.',
         'Decide whether the sum repeats, and give $T_0$ where it does.'],
  sol:'<b>Given.</b> Two sums of continuous-time sinusoids.<br>'
     +'<b>Find.</b> Whether each sum repeats, and its fundamental period.<br>'
     +'<b>Method.</b> Every continuous-time sinusoid is periodic, with $T=2\\pi/|\\omega|$. A sum repeats exactly when the ratio of the two periods is rational, and $T_0$ is then the smallest length containing a whole number of each.<br>'
     +'<b>Solution — (i).</b> $T_1=\\dfrac{2\\pi}{3}$ and $T_2=\\dfrac{2\\pi}{5}$. The ratio $\\dfrac{T_1}{T_2}=\\dfrac53$ is rational, so the sum repeats. The smallest common length is$$T_0=2\\pi=3T_1=5T_2,\\qquad\\omega_0=\\frac{2\\pi}{2\\pi}=1\\;\\text{rad/s}.$$'
     +'<b>Solution — (ii).</b> $T_1=2\\pi$ and $T_2=\\dfrac{2\\pi}{\\sqrt2}=\\sqrt2\\,\\pi$. The ratio $\\dfrac{T_1}{T_2}=\\sqrt2$ is irrational, so no common length exists and the sum is <b>not periodic</b>. Each term alone still is.<br>'
     +'<b>Check.</b> In (i) the two terms are the $3$rd and $5$th harmonic of $\\omega_0=1$: $3=3\\cdot1$ and $5=5\\cdot1$, and $\\gcd(3,5)=1$ already fixes $\\omega_0$ at its largest possible value, so $T_0=2\\pi$ cannot be reduced. In (ii) no $\\omega_0$ makes both $1$ and $\\sqrt2$ integer multiples, which is the same statement as $\\sqrt2$ being irrational.<br>'
     +'<b>Contrast with discrete time.</b> In continuous time it is the <em>ratio</em> of two frequencies that must be rational. In discrete time each frequency has to satisfy its own rationality condition against $2\\pi$ first.',
  err:'Concluding from $T_1/T_2$ rational that $T_0=T_1T_2$. In (i) that would give $4\\pi^2/15$, which is not a period of either term.',
  teach:'Case (ii) is the useful one. It shows that a sum of two perfectly periodic signals need not be periodic, which students find surprising and rarely forget afterwards.' },

{ id:'D1-04', module:'M1', type:'period',
  stem:'Let $$x(t)=2e^{-0.3t}\\cos(4t),\\qquad t\\in\\mathbb{R},$$a sinusoid carried inside the growing/decaying envelope $\\pm2e^{-0.3t}$.',
  parts:['State the period $T_0$ of the pure oscillation $y(t)=2\\cos(4t)$, the case $r=0$.',
         'Prove that $x(t)$ itself is not periodic, by testing the necessary condition $x(0)=x(T)$ for a candidate period $T>0$.',
         'In one sentence, say why no signal whose envelope is strictly monotonic can be periodic.'],
  sol:'<b>Given.</b> A damped sinusoid, envelope $2e^{-0.3t}$, angular frequency $4$ rad/s.<br>'
     +'<b>Find.</b> Whether the damped signal repeats.<br>'
     +'<b>Method.</b> If $x(t)$ were periodic with period $T>0$, then $x(t)=x(t+T)$ would hold for <em>every</em> $t$, in particular at $t=0$. Testing that one instant is enough to rule periodicity out.<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=4$, so $T_0=\\dfrac{2\\pi}{4}=\\dfrac{\\pi}{2}$ s.<br>'
     +'<b>Solution — part (b).</b> $x(0)=2e^{0}\\cos(0)=2$. A period $T>0$ would require$$x(T)=2e^{-0.3T}\\cos(4T)=2\\;\\Longrightarrow\\;\\cos(4T)=e^{0.3T}.$$For every $T>0$, $e^{0.3T}>1$, while $\\cos(4T)\\le1$ always. The two sides can never meet, so no positive $T$ satisfies even this one necessary condition. <b>$x(t)$ is not periodic.</b><br>'
     +'<b>Solution — part (c).</b> A periodic signal must return to its starting value after every period, forever. A strictly monotonic envelope makes the peak amplitude smaller (or larger) at every later cycle, so the signal can never return exactly to where it started; the definition of periodicity fails at the very first candidate period.<br>'
     +'<b>Check.</b> The same argument holds without picking $t=0$: comparing the envelope at any two points a candidate period apart, $2e^{-0.3t}\\neq2e^{-0.3(t+T)}$ for $T\\neq0$, because $e^{-0.3t}$ is strictly decreasing and therefore injective. Injectivity of the envelope alone is already enough to block periodicity, independently of the oscillation inside it.',
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
     +'<b>Method.</b> Square first, then integrate over the whole axis. Outside the support the integrand is zero, so only three pieces contribute.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{2}t^{2}\\,\\d t+\\int_{2}^{3}4\\,\\d t+\\int_{3}^{5}(5-t)^{2}\\,\\d t=\\frac83+4+\\frac83=\\frac{28}{3}\\;\\text{J}\\approx9.333\\;\\text{J}.$$'
     +'<b>Solution — part (b).</b> The energy is finite, so$$P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\lim_{T\\to\\infty}\\frac{28/3}{2T}=0\\;\\text{W}.$$The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two sloping halves are mirror images of each other about $t=2.5$, so their contributions must be equal — and they are, $\\tfrac83$ each. A bound: the pulse never exceeds $2$ and lasts $5$ seconds, so $E_\\infty\\le4\\cdot5=20$, and $\\tfrac{28}{3}\\approx9.33$ sits well inside that. Classification needs both numbers: $E_\\infty<\\infty$ <em>and</em> $P_\\infty=0$.',
  err:'Reporting $P_\\infty=(28/3)/5$ by averaging over the support instead of over $[-T,T]$ with $T\\to\\infty$. The averaging window is the whole axis, not the part where the signal is non-zero.',
  teach:'Ask for both numbers every time. A student who writes only $E_\\infty$ has not distinguished the energy class from the power class.' },

{ id:'D1-06', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'Consider the two discrete-time signals $$x_1[n]=\\left(\\tfrac25\\right)^{\\!n}u[n],\\qquad x_2[n]=3\\,u[n].$$',
  parts:['Calculate $E_\\infty$ and $P_\\infty$ for $x_1[n]$.',
         'Calculate $E_\\infty$ and $P_\\infty$ for $x_2[n]$.',
         'Classify each signal.'],
  sol:'<b>Given.</b> A decaying geometric sequence and a scaled unit step.<br>'
     +'<b>Find.</b> Energy, power and class for each.<br>'
     +'<b>Method.</b> In discrete time,$$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2},\\qquad P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}.$$'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\sum_{n=0}^{\\infty}\\left(\\tfrac25\\right)^{\\!2n}=\\sum_{n=0}^{\\infty}\\left(\\tfrac{4}{25}\\right)^{\\!n}=\\frac{1}{1-\\tfrac{4}{25}}=\\frac{25}{21},$$which is finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> $|x_2[n]|^{2}=9\\,u[n]$, so the energy sum diverges: $E_\\infty=\\infty$. For the power, the window $-N\\le n\\le N$ contains $N+1$ non-zero samples out of $2N+1$, each contributing $9$, so$$P_\\infty=\\lim_{N\\to\\infty}\\frac{9(N+1)}{2N+1}=\\frac92=4.5.$$'
     +'<b>Solution — part (c).</b> $x_1$ is an <b>energy signal</b>; $x_2$ is a <b>power signal</b>.<br>'
     +'<b>Check.</b> A constant sequence of amplitude $A$ switched on at $n=0$ must have $P_\\infty=A^{2}/2$ by the same counting argument, and $A=3$ gives $9/2$ directly, matching part (b) without repeating the limit. For part (a), the geometric sum is bounded above by $1/(1-4/25)$ evaluated exactly, and $25/21\\approx1.19$, a sensible size for a sequence that starts at $1$ and shrinks.',
  err:'Writing $P_\\infty=9$ for $x_2$ by evaluating the sum only over $n\\ge0$ and dividing by $N+1$ instead of $2N+1$. The window is symmetric about the origin, and the zeros on the negative side count in the denominator.',
  teach:'The counting argument $(N+1)/(2N+1)$ is worth demanding in writing. Students who quote $1/2$ from memory usually cannot produce it for $3u[n-4]$, where the same limit still gives $9/2$.' },

{ id:'D1-07', module:'M1', type:'energy', src:'MT1 Q1',
  stem:'With the normalised convention $R=1\\,\\Omega$, consider $$x_1(t)=e^{-5t}u(t)\\;\\text{V},\\qquad x_2(t)=4\\cos(3t)\\;\\text{V}.$$',
  parts:['Calculate $E_\\infty$ for $x_1(t)$ and state $P_\\infty$.',
         'Calculate $P_\\infty$ for $x_2(t)$ and state $E_\\infty$.',
         'Starting from $P_T=\\dfrac{1}{2T}\\displaystyle\\int_{-T}^{T}|x(t)|^{2}\\,\\d t$, show directly that a finite $E_\\infty$ forces $P_\\infty=0$.'],
  sol:'<b>Given.</b> A decaying exponential and a sinusoid, both in volts across $1\\,\\Omega$.<br>'
     +'<b>Find.</b> Energy, power, and a general proof that the two classes cannot overlap.<br>'
     +'<b>Method.</b> Square, then integrate over the axis for energy or average over a growing window for power. For a periodic signal the infinite average equals the average over one period.<br>'
     +'<b>Solution — part (a).</b>$$E_\\infty=\\int_{0}^{\\infty}e^{-10t}\\,\\d t=\\left[-\\tfrac{1}{10}e^{-10t}\\right]_{0}^{\\infty}=\\tfrac{1}{10}\\;\\text{J},$$finite, so $P_\\infty=0$.<br>'
     +'<b>Solution — part (b).</b> The signal has period $T_0=\\dfrac{2\\pi}{3}$, so$$P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}16\\cos^{2}(3t)\\,\\d t=\\frac{16}{2}=8\\;\\text{W},$$using $\\overline{\\cos^{2}}=\\tfrac12$. Since $P_\\infty\\neq0$, the energy is infinite.<br>'
     +'<b>Solution — part (c).</b> For any finite $T$,$$P_T=\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\le\\frac{1}{2T}\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t=\\frac{E_\\infty}{2T},$$because the integrand is non-negative and $[-T,T]$ is only part of the whole axis. If $E_\\infty<\\infty$, the right-hand side $\\to0$ as $T\\to\\infty$, and since $P_T\\ge0$ throughout, $P_\\infty=\\lim_{T\\to\\infty}P_T=0$ by the squeeze.<br>'
     +'<b>Check.</b> Applying the bound of part (c) to $x_1$: $E_\\infty=1/10$, so $P_T\\le1/(20T)\\to0$, consistent with the direct answer $P_\\infty=0$. The familiar result $P=A^{2}/2$ for a sinusoid of amplitude $A$ gives $16/2=8$ for $x_2$ directly, matching part (b) by a route that never mentions $T_0$.',
  err:'Reporting $P_\\infty=16$ for the sinusoid by forgetting the factor $\\tfrac12$ from the time average of $\\cos^{2}$.',
  teach:'Part (c) is the general result behind D1-05 and D1-06. Insist on the inequality $P_T\\le E_\\infty/2T$ written out, not a slogan about the two classes being disjoint.' },

{ id:'D1-08', module:'M1', type:'energy',
  stem:'Let $$x[n]=\\begin{cases}2^{\\,n}, & n\\le-1,\\\\[2pt] 3, & n=0,\\\\[2pt] \\left(\\tfrac12\\right)^{\\!n}, & n\\ge1.\\end{cases}$$',
  parts:['List $x[n]$ for $-3\\le n\\le3$.',
         'Calculate $E_\\infty$.',
         'State $P_\\infty$ and classify the signal.'],
  sol:'<b>Given.</b> A two-sided sequence, defined by a different formula on each of three ranges of $n$.<br>'
     +'<b>Find.</b> $E_\\infty$, $P_\\infty$, and the class.<br>'
     +'<b>Method.</b> Split the energy sum at the same three ranges the signal is defined on, and evaluate each geometric series separately.<br>'
     +'<b>Solution — part (a).</b> $x[-3]=\\tfrac18$, $x[-2]=\\tfrac14$, $x[-1]=\\tfrac12$, $x[0]=3$, $x[1]=\\tfrac12$, $x[2]=\\tfrac14$, $x[3]=\\tfrac18$.<br>'
     +'<b>Solution — part (b).</b>$$E_\\infty=\\sum_{n=-\\infty}^{-1}4^{\\,n}+3^{2}+\\sum_{n=1}^{\\infty}4^{-n}.$$Substituting $m=-n$ in the first sum gives $\\sum_{m=1}^{\\infty}4^{-m}=\\tfrac13$, and the third sum is the same series, also $\\tfrac13$. So$$E_\\infty=\\tfrac13+9+\\tfrac13=\\frac{29}{3}\\;\\text{J}\\approx9.667\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> $E_\\infty$ is finite, so $P_\\infty=0$. The signal is an <b>energy signal</b>.<br>'
     +'<b>Check.</b> The two tails are mirror images in shape — $2^{\\,n}$ for $n\\le-1$ and $(1/2)^{\\,n}$ for $n\\ge1$ are reflections of each other about $n=0$ — so their energy contributions must match, and both come out to $\\tfrac13$. A bound: every sample has magnitude at most $3$, and the two tails are each dominated termwise by $4^{-|n|}$ for $|n|\\ge1$ summing to less than $1$, so $E_\\infty<9+2=11$, and $\\tfrac{29}{3}\\approx9.67$ sits inside that bound.',
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
     +'<b>Method.</b> Write the argument in the standard form $x(at-b)$: here $a=2$ and $b=-2$. Shift first, then scale. Doing the two in the other order changes the sign of the shift, and that is where the marks go.<br>'
     +'<b>Solution — step 1, shift.</b> $v(t)=x(t-b)=x(t+2)$ moves the support two seconds to the left, to $-4\\le t\\le-1$.<br>'
     +'<b>Solution — step 2, scale.</b> $y(t)=v(2t)$ compresses by $2$, so the support $-4\\le t\\le-1$ maps to $-2\\le t\\le-0.5$.<br>'
     +'<b>Solution — the formula.</b> Substituting directly,$$y(t)=\\begin{cases}2t+4,&-2\\le t\\le-1,\\\\[2pt] 2,&-1\\le t\\le-0.5,\\\\[2pt] 0,&\\text{otherwise,}\\end{cases}$$because $2t+2$ lies in $[-2,0]$ for $t\\in[-2,-1]$, where $x$ equals its argument plus $2$, and in $[0,1]$ for $t\\in[-1,-0.5]$, where $x$ is the constant $2$.<br>'
     +'<b>Check.</b> Width: $x$ occupies $3$ seconds ($-2$ to $1$), and compression by $|a|=2$ must give $1.5$ seconds — and $-0.5-(-2)=1.5$, which matches. Two sample points: $y(-2)=x(-2)=0$ and $y(-0.5)=x(1)=2$, both matching the endpoints of the plot.',
  figSol:()=>{const y=t=>(t>=-2&&t<=-1)?2*t+4:(t>-1&&t<=-0.5)?2:0;
    const a=P.Axes({w:1080,h:270,xr:[-3,0.4],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [-2,-1,-0.5].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Scaling first and then shifting by $-2$, which produces $x(2(t-2))=x(2t-4)$ and places the result on the wrong part of the axis.',
  teach:'Ask for the intermediate signal $v(t)$ to be drawn. A student who goes straight to the answer cannot be corrected, because there is nothing to inspect.' },

{ id:'D1-10', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'The sequence $x[n]$ is plotted below.',
  parts:['Plot $y[n]=x[2-n]$.',
         'Plot $z[n]=x[n+1]$ and say which of the two operations changes the order of the samples.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem([[-1,2],[0,-1],[1,3],[2,-2]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> $x[-1]=2$, $x[0]=-1$, $x[1]=3$, $x[2]=-2$, and zero elsewhere.<br>'
     +'<b>Find.</b> A reflection with a shift, and a plain shift.<br>'
     +'<b>Method.</b> For $y[n]=x[2-n]$, the sample originally at index $m$ moves to $n=2-m$. Map the four non-zero indices one at a time. For $z[n]=x[n+1]$, every sample moves one place to the left.<br>'
     +'<b>Solution — part (a).</b>$$m=-1\\to n=3,\\quad m=0\\to n=2,\\quad m=1\\to n=1,\\quad m=2\\to n=0,$$so $y[0]=-2$, $y[1]=3$, $y[2]=-1$, $y[3]=2$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> $z[-2]=2$, $z[-1]=-1$, $z[0]=3$, $z[1]=-2$. The advance moves the pattern without disturbing it; only the reflection reverses the order of the samples.<br>'
     +'<b>Check.</b> Both operations preserve the number of non-zero samples, four, and the shape of the pattern. For (a), one direct substitution: $y[3]=x[2-3]=x[-1]=2$, as listed. Reading the samples in order of increasing index, $x$ gives $2,-1,3,-2$ and $y$ gives $-2,3,-1,2$ — exactly the reverse — while $z$ gives $2,-1,3,-2$, the same order as $x$, just relocated.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1.6,4.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'y[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[0,-2],[1,3],[2,-1],[3,2]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.6,2.6],yr:[-3.6,4.6],xlabel:'n',ylabel:'z[n]',
      pad:{l:46,r:26,t:30,b:34},xstep:1,ystep:1});
      a.stem([[-2,2],[-1,-1],[0,3],[1,-2]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x[2-n]$ as "reflect, then shift left by two", which gives $x(-(n+2))=x(-n-2)$ and puts the pattern in the wrong place.',
  teach:'The index-mapping table is the reliable method and it takes four lines. Discourage the shortcut of redrawing by eye.' },

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
     +'<b>Method.</b> Here $a=-\\tfrac13$ and $b=-1$ in the form $x(at-b)$. The coefficient is negative and fractional, so the transformation reflects and expands as well as shifts. Map the support first, then substitute directly to get the two-piece formula.<br>'
     +'<b>Solution — the support.</b> The argument $s=1-t/3$ must lie in $[-1,1]$. At $s=1$, $t=0$; at $s=-1$, $t=6$. Because $s$ decreases as $t$ increases, the support of $y$ is $0\\le t\\le6$.<br>'
     +'<b>Solution — the formula.</b> For $t\\in[0,3]$, $s=1-t/3\\in[0,1]$, where $x(s)=1-s$, so$$y(t)=1-\\left(1-\\tfrac{t}{3}\\right)=\\frac{t}{3}.$$For $t\\in[3,6]$, $s\\in[-1,0]$, where $x(s)=s+1$, so$$y(t)=\\left(1-\\tfrac{t}{3}\\right)+1=2-\\frac{t}{3}.$$'
     +'<b>Solution — part (c).</b> The peak of $x$ is at $s=0$. Setting $1-t/3=0$ gives $t=3$, and indeed $y(3)=3/3=1=2-3/3$, matching the peak height from both branches.<br>'
     +'<b>Check.</b> Width: $x$ occupies $2$ seconds, and expansion by $1/|a|=3$ must give $6$ seconds, which the support $[0,6]$ has. Endpoint check: $y(0)=x(1)=0$ and $y(6)=x(-1)=0$, both matching the zeros at the edges of the plot. The reflection is visible in the shape: the rising half of $x$ (for $t<0$) has become the falling half of $y$ (for $t>3$).',
  figSol:()=>{const y=t=>(t>=0&&t<=3)?t/3:(t>3&&t<=6)?2-t/3:0;
    const a=P.Axes({w:1080,h:270,xr:[-1,7],yr:[-0.3,1.4],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:32,b:38},xstep:1,ystep:0.5});
    a.curve(y,{color:C.out});
    [0,3,6].forEach(t=>a.vline(t,{color:C.muted,opacity:.5}));
    return a.svg();},
  err:'Applying the expansion factor $3$ but forgetting the sign of $a$, which draws $y$ rising from $t=0$ to $t=3$ and falling after — the mirror image of the correct shape.',
  teach:'Ask the student to name the sign of $a$ out loud before drawing anything. A negative $a$ always means a reflection is part of the answer, whatever its magnitude.' },

{ id:'D1-12', module:'M1', type:'transform',
  stem:'A signal $x(t)$ is known only to satisfy $x(t)=0$ outside $2\\le t\\le8$, with a single, unique maximum at $t=5$. No other property of $x(t)$ is given. Let $y(t)=x(-3t+6)$.',
  parts:['Find the support of $y(t)$ as an interval, using inequalities on the argument of $x$.',
         'Find the value of $t$ at which $y(t)$ reaches its maximum.',
         'A second transformation is applied, $z(t)=y(t-4)$. Give the support of $z(t)$ directly in terms of the support of $y(t)$, and again directly in terms of the support of $x(t)$, and check the two routes agree.'],
  sol:'<b>Given.</b> Only the support and the location of the maximum of $x(t)$; its shape is unknown.<br>'
     +'<b>Find.</b> The support and the peak location of two signals built from $x$ by transformations of the argument, without ever needing the formula for $x$.<br>'
     +'<b>Method.</b> A transformation of the independent variable moves the support and the maximum together, by mapping the argument through the same rule that produced $y$ or $z$ from $x$. No value of $x$ itself is needed.<br>'
     +'<b>Solution — part (a).</b> $y(t)\\neq0$ exactly where $-3t+6\\in[2,8]$. Solving, $-3t\\in[-4,2]$, and dividing by $-3$ reverses the inequalities: $t\\in\\left[-\\tfrac23,\\tfrac43\\right]$.<br>'
     +'<b>Solution — part (b).</b> $x$ peaks where its argument equals $5$. Setting $-3t+6=5$ gives $t=\\tfrac13$, which lies inside $\\left[-\\tfrac23,\\tfrac43\\right]$ as it must.<br>'
     +'<b>Solution — part (c).</b> A shift by $4$ moves every point of the support of $y$ to the right by $4$, so directly from $y$: $$t\\in\\left[-\\tfrac23+4,\\;\\tfrac43+4\\right]=\\left[\\tfrac{10}{3},\\tfrac{16}{3}\\right].$$Directly from $x$: $z(t)=x(-3(t-4)+6)=x(-3t+18)$, so $-3t+18\\in[2,8]$ gives $-3t\\in[-16,-10]$, hence $t\\in\\left[\\tfrac{10}{3},\\tfrac{16}{3}\\right]$, the same interval.<br>'
     +'<b>Check.</b> The width of $x$\'s support is $8-2=6$. Compression by $|a|=3$ must give width $6/3=2$ for both $y$ and $z$, and indeed $\\tfrac43-\\left(-\\tfrac23\\right)=2$ and $\\tfrac{16}{3}-\\tfrac{10}{3}=2$. That the two routes to the support of $z$ in part (c) agree is itself an independent check on the whole chain of reasoning, since one route never used the formula for $y$ and the other never used $x$ directly.',
  err:'Solving $-3t+6\\in[2,8]$ without reversing the inequalities after dividing by the negative coefficient, which gives the interval $\\left[-\\tfrac43,\\tfrac23\\right]$ — the correct numbers, in the wrong order, silently reporting an empty or backwards interval when the arithmetic is written carelessly.',
  teach:'This question cannot be answered by drawing a picture, because no picture of $x$ exists. It isolates whether a student understands the transformation as a mapping on the argument, independent of the signal\'s shape.' },

{ id:'D1-13', module:'M1', type:'evenodd', src:'MT1 Q1',
  stem:'Let $x(t)=3e^{-4t}u(t)$.',
  parts:['Find $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$ and plot both.',
         'Calculate $E_\\infty$ for $x(t)$, for its even part, and for its odd part.',
         'Comment on the relation between the three energies.'],
  sol:'<b>Given.</b> A causal decaying exponential.<br>'
     +'<b>Find.</b> Its even and odd parts, and the three energies.<br>'
     +'<b>Method.</b> Build $x(-t)=3e^{4t}u(-t)$ first, then$$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)],\\qquad\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)].$$'
     +'<b>Solution — part (a).</b> The two pieces sit on opposite half-lines and never overlap, so$$\\Ev\\{x(t)\\}=\\tfrac32e^{-4|t|},\\qquad\\Od\\{x(t)\\}=\\tfrac32e^{-4t}u(t)-\\tfrac32e^{4t}u(-t).$$The even part is a two-sided decaying exponential of height $\\tfrac32$; the odd part has the same shape with its left half turned upside down, jumping from $-\\tfrac32$ to $\\tfrac32$ at the origin.<br>'
     +'<b>Solution — part (b).</b>$$E_x=\\int_{0}^{\\infty}9e^{-8t}\\,\\d t=\\tfrac98,$$$$E_{\\Ev}=\\int_{-\\infty}^{\\infty}\\tfrac94e^{-8|t|}\\,\\d t=\\tfrac94\\cdot2\\cdot\\tfrac18=\\tfrac{9}{16},$$and by the same computation $E_{\\Od}=\\tfrac{9}{16}$.<br>'
     +'<b>Solution — part (c).</b> $E_{\\Ev}+E_{\\Od}=\\tfrac{9}{16}+\\tfrac{9}{16}=\\tfrac98=E_x$. The energies add because the even and odd parts are orthogonal: the cross term $\\int\\Ev\\{x\\}\\Od\\{x\\}\\,\\d t$ is the integral of an odd function over a symmetric interval, and is therefore zero.<br>'
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
     +'<b>Method.</b> $x[-n]$ places the value $x[m]$ at index $-m$. Then$$\\Ev\\{x[n]\\}=\\tfrac12\\bigl(x[n]+x[-n]\\bigr),\\qquad\\Od\\{x[n]\\}=\\tfrac12\\bigl(x[n]-x[-n]\\bigr).$$'
     +'<b>Solution — part (a).</b> $x[-n]$ equals $1,4,-1,2$ at $n=-3,-2,-1,0$ and is zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> Sample by sample,$$\\Ev\\{x\\}:\\;0.5,\\,2,\\,-0.5,\\,2,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$$$\\Od\\{x\\}:\\;-0.5,\\,-2,\\,0.5,\\,0,\\,-0.5,\\,2,\\,0.5\\quad\\text{at}\\quad n=-3,\\dots,3,$$and both are zero elsewhere.<br>'
     +'<b>Solution — part (c).</b> At $n=-1$: $-0.5+0.5=0=x[-1]$. At $n=0$: $2+0=2=x[0]$. At $n=2$: $2+2=4=x[2]$. All three agree.<br>'
     +'<b>Check.</b> The even part is symmetric about $n=0$ and the odd part is antisymmetric, with $\\Od\\{x\\}[0]=0$ as it must be for every sequence. Only $x[0]$ survives untouched into the even part, and it does: $\\Ev\\{x\\}[0]=x[0]=2$.',
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
     +'<b>Method.</b> Substitute $t\\to-t$ in each piece of the definition to get $x(-t)$, then apply $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$ region by region, and integrate the square of each result.<br>'
     +'<b>Solution — part (a).</b> Replacing $t$ by $-t$: $-2\\le-t<0$ becomes $0<t\\le2$, where $x(-t)=-1$; and $0\\le-t\\le3$ becomes $-3\\le t\\le0$, where $x(-t)=2$. So$$x(-t)=\\begin{cases}2,&-3\\le t\\le0,\\\\[2pt] -1,&0<t\\le2,\\\\[2pt] 0,&\\text{otherwise.}\\end{cases}$$'
     +'<b>Solution — part (b).</b> Adding and subtracting $x(t)$ and $x(-t)$ on each of the four regions where either is non-zero,$$\\Ev\\{x(t)\\}=\\begin{cases}1,&-3\\le t<-2,\\\\ 0.5,&-2\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}\\qquad\\Od\\{x(t)\\}=\\begin{cases}-1,&-3\\le t<-2,\\\\ -1.5,&-2\\le t<0,\\\\ 1.5,&0\\le t<2,\\\\ 1,&2\\le t\\le3,\\end{cases}$$both zero outside $[-3,3]$.<br>'
     +'<b>Solution — part (c).</b>$$E_x=\\int_{-2}^{0}1\\,\\d t+\\int_{0}^{3}4\\,\\d t=2+12=14.$$$$E_{\\Ev}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{2}0.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1+1+1=3.$$$$E_{\\Od}=\\int_{-3}^{-2}1\\,\\d t+\\int_{-2}^{0}2.25\\,\\d t+\\int_{0}^{2}2.25\\,\\d t+\\int_{2}^{3}1\\,\\d t=1+4.5+4.5+1=11.$$Then $E_{\\Ev}+E_{\\Od}=3+11=14=E_x$.<br>'
     +'<b>Check.</b> The two parts must add back to $x$ on every region: on $(0,2]$, $0.5+1.5=2=x(t)$; on $[-3,-2)$, $1+(-1)=0=x(t)$, both correct. As an independent bound, $E_{\\Ev}\\le E_x$ always, because $\\Ev\\{x\\}$ is built by averaging $x(t)$ with a reflected copy of itself and the energy of an average of two signals of comparable size cannot exceed the larger contribution; here $3<14$, consistent with that bound.',
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
     +'<b>Solution — part (a).</b> $\\Od\\{x\\}[0]=\\tfrac12\\bigl(x[0]-x[-0]\\bigr)=\\tfrac12\\bigl(x[0]-x[0]\\bigr)=0$, because $-0=0$. This holds for every real sequence $x[n]$, whatever its values are.<br>'
     +'<b>Solution — part (b).</b> $w[-n]$ equals $5,0,-5$ at $n=-1,0,1$. Then $\\Ev\\{w\\}[n]=\\tfrac12(w[n]+w[-n])$: at $n=-1$, $\\tfrac12(-5+5)=0$; at $n=0$, $0$; at $n=1$, $\\tfrac12(5-5)=0$ — zero everywhere, as claimed. And $\\Od\\{w\\}[n]=\\tfrac12(w[n]-w[-n])$: at $n=-1$, $\\tfrac12(-5-5)=-5=w[-1]$; at $n=1$, $\\tfrac12(5-(-5))=5=w[1]$; at $n=0$, $0=w[0]$ — so $\\Od\\{w\\}=w$ at every listed index. <b>The claim is correct</b>, because $w[n]$ is already odd: $w[-n]=-w[n]$ holds at every index.<br>'
     +'<b>Solution — part (c).</b> If $y[n]$ were odd, it would equal its own odd part: $y[n]=\\Od\\{y\\}[n]$ for every $n$, in particular at $n=0$. But part (a) shows $\\Od\\{y\\}[0]=0$ for <em>any</em> sequence, so an odd $y$ would need $y[0]=0$. Since $y[0]=4\\neq0$, $y[n]$ cannot be odd.<br>'
     +'<b>Check.</b> Part (b) gives a worked instance of the general fact used in part (c): $w[0]=0$ is exactly what let $w$ be odd in the first place. Reversing the logic, changing only $w[0]$ from $0$ to any non-zero number would immediately break oddness by the same argument, without touching $w[1]$ or $w[-1]$ at all — a one-sample edit with a predictable consequence, which is a fast way to check the general claim on a second example.',
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
     +'<b>Method.</b> The <b>sifting</b> property, $\\int x(t)\\delta(t-t_0)\\,\\d t=x(t_0)$, evaluates the function at the location of the impulse. A scaled argument first needs$$\\delta(at-b)=\\frac{1}{|a|}\\,\\delta\\!\\left(t-\\frac{b}{a}\\right),$$because the impulse must keep unit area under the substitution.<br>'
     +'<b>Solution — (i).</b> Two impulses, so sift twice and add:$$\\bigl(3\\cdot4+1\\bigr)+\\bigl(3\\cdot16+1\\bigr)=13+49=62.$$'
     +'<b>Solution — (ii).</b> $e^{-3}\\sin(1.5\\pi)=e^{-3}\\cdot(-1)=-e^{-3}\\approx-0.0498$.<br>'
     +'<b>Solution — (iii).</b> Rewrite $\\delta(4t-8)=\\tfrac14\\delta(t-2)$, then sift:$$\\int t^{2}\\cdot\\tfrac14\\delta(t-2)\\,\\d t=\\tfrac14\\cdot4=1.$$'
     +'<b>Solution — part (b).</b> All three use sifting. The result is a number because the integral runs over $t$ and removes every $t$-dependence. The <b>sampling</b> property is the other statement, $x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$, and it returns a signal: an impulse at $t_0$ carrying the weight $x(t_0)$.<br>'
     +'<b>Check.</b> Units confirm the split: if $x$ is in volts then $\\delta$ carries $\\mathrm{s}^{-1}$, so the product is a signal in $\\mathrm{V\\,s^{-1}}$ and the integral is a number in volts. In (iii), dropping the factor $\\tfrac14$ would quadruple the answer, and the area of $\\delta(4t-8)$ measured directly is $\\tfrac14$, not $1$; and $\\sin(1.5\\pi)=-1$ exactly, since $1.5\\pi$ is three-quarters of a full turn past zero, which fixes the sign in (ii) independently of the exponential factor.',
  err:'Treating $\\delta(4t-8)$ as $\\delta(t-8)$, or as $\\delta(t-2)$ without the factor $\\tfrac14$. Compressing the argument compresses the impulse, and its area must be restored.',
  teach:'Part (b) separates the two properties. A student who writes $x(t)\\delta(t-t_0)=x(t_0)$ has silently turned a signal into a number and will make the same slip in Module 3.' },

{ id:'D1-18', module:'M1', type:'impulse',
  stem:'Let $$g(t)=3\\delta(t+1)-2\\delta(t-2),\\qquad v(t)=\\int_{-\\infty}^{t}g(\\tau)\\,\\d\\tau.$$',
  parts:['Using $u(t)=\\displaystyle\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau$, express $v(t)$ as a combination of unit step functions.',
         'Sketch $v(t)$ for $-3\\le t\\le4$.',
         'Read $v(0)$ and $v(3)$ from the sketch, and check them against the formula from part (a).'],
  sol:'<b>Given.</b> A signal built from two weighted, shifted impulses, and its running integral.<br>'
     +'<b>Find.</b> $v(t)$ as a staircase, and two of its values checked two ways.<br>'
     +'<b>Method.</b> Integration is linear, so the running integral of a sum of impulses is the same sum of running integrals of each impulse alone, and $\\int_{-\\infty}^{t}\\delta(\\tau-t_0)\\,\\d\\tau=u(t-t_0)$ by definition of the step.<br>'
     +'<b>Solution — part (a).</b>$$v(t)=3u(t+1)-2u(t-2).$$'
     +'<b>Solution — part (b).</b> $v(t)$ is a staircase: $0$ for $t<-1$, rises to $3$ at $t=-1$ and holds until $t=2$, then drops by $2$ to $1$ and holds from $t=2$ onward.<br>'
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
     +'<b>Method.</b> Sampling multiplies $x[n]$ by a shifted impulse and returns a sequence with one surviving sample. Sifting sums that sequence and returns a number. The representation property is sifting run in reverse: it rebuilds $x[n]$ from weighted, shifted impulses, one for every non-zero sample.<br>'
     +'<b>Solution — part (a).</b> $x[n]\\delta[n-1]=x[1]\\delta[n-1]=2\\delta[n-1]$ — the sequence equal to $2$ at $n=1$ and zero everywhere else.<br>'
     +'<b>Solution — part (b).</b> $\\displaystyle\\sum_{n}x[n]\\delta[n-1]=x[1]=2$, since only the $n=1$ term of the sum survives, and $x[1]=2$ as given.<br>'
     +'<b>Solution — part (c).</b>$$x[n]=5\\delta[n+1]-3\\delta[n]+2\\delta[n-1]+7\\delta[n-2].$$At $n=0$: $5\\delta[1]-3\\delta[0]+2\\delta[-1]+7\\delta[-2]=5\\cdot0-3\\cdot1+2\\cdot0+7\\cdot0=-3=x[0]$.<br>'
     +'<b>Check.</b> Evaluating the same sum at $n=-1$ instead: $5\\delta[0]-3\\delta[-1]+2\\delta[-2]+7\\delta[-3]=5\\cdot1-3\\cdot0+2\\cdot0+7\\cdot0=5=x[-1]$, a second, independent index where the representation reproduces the given sequence, confirming part (c) was not a coincidence at $n=0$ alone.',
  err:'Writing the sampling result in part (a) as the number $2$ instead of the sequence $2\\delta[n-1]$. Sampling produces a signal that happens to have only one non-zero sample; it does not collapse to a number until it is summed.',
  teach:'Ask for the check at a second index, as in the Check step, before accepting part (c). A single matching index is a weak test; the representation property has to hold everywhere.' },

{ id:'D1-20', module:'M1', type:'impulse',
  stem:'Let $$x[n]=\\delta[n]+2\\delta[n-2]-\\delta[n-4],\\qquad y[n]=\\sum_{k=-\\infty}^{n}x[k].$$',
  parts:['Evaluate $y[n]$ for $-2\\le n\\le6$.',
         'Express $y[n]$ in closed form as a combination of unit step functions, and check it against part (a).',
         'A continuous-time signal $p(t)=\\delta(t)+2\\delta(t-2)-\\delta(t-4)$ carries the same weights at the same locations. State its running integral $q(t)=\\displaystyle\\int_{-\\infty}^{t}p(\\tau)\\,\\d\\tau$ directly by analogy with $y[n]$, without repeating the calculation.'],
  sol:'<b>Given.</b> A finite train of three weighted, shifted unit samples, and its running sum.<br>'
     +'<b>Find.</b> The running sum as a table, in closed form, and its continuous-time counterpart.<br>'
     +'<b>Method.</b> The running sum of $\\delta[n-k]$ is $u[n-k]$, exactly as the running integral of $\\delta(t-t_0)$ is $u(t-t_0)$; summation is linear, so it distributes over the three terms of $x[n]$ unchanged.<br>'
     +'<b>Solution — part (a).</b> Accumulating one impulse at a time as $n$ increases past each location:$$y[n]=0,0,1,1,3,3,2,2,2\\quad\\text{for}\\quad n=-2,-1,0,1,2,3,4,5,6.$$'
     +'<b>Solution — part (b).</b>$$y[n]=u[n]+2u[n-2]-u[n-4].$$Checking against part (a) at $n=4$: $u[4]+2u[2]-u[0]=1+2-1=2$, matching the table.<br>'
     +'<b>Solution — part (c).</b> The running sum replaced each $\\delta[n-k]$ by $u[n-k]$ with its weight unchanged; the running integral does the same with $\\delta(t-t_0)\\to u(t-t_0)$, so by the identical argument$$q(t)=u(t)+2u(t-2)-u(t-4),$$a staircase with the same three levels as $y[n]$, at $t=0,2,4$ instead of $n=0,2,4$.<br>'
     +'<b>Check.</b> The final level of $y[n]$, once every impulse has been passed, must equal the sum of the weights, $1+2-1=2$, and the table settles at $2$ for $n\\ge4$. The same sum, $2$, is also the final level $q(t)$ settles at for $t\\ge4$, so the discrete and continuous constructions agree on the one number that does not depend on where the impulses sit, only on how much weight they carry in total.',
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
  stem:'Work the following parts in order. Parts (c) to (e) all use the signal $x(t)$ plotted below.',
  parts:['Is $x[n]=\\cos\\!\\left(\\tfrac{4\\pi}{9}n-2\\right)$ periodic? If so, find its fundamental period.',
         'Calculate the energy $E_\\infty$ of the $x(t)$ signal plotted below.',
         'Plot $y(t)=x\\!\\left(3-\\tfrac{t}{2}\\right)$.',
         'Plot $z(t)=\\Ev\\{y(t)\\}$, the even part of the $y(t)$ signal of part (c).',
         'Evaluate $\\int_{-\\infty}^{\\infty}z(t)\\{\\delta(t+4)+\\delta(t-8)\\}\\,\\d t$, with $z(t)$ as defined in part (d).'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,4.6],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[1,2],[3,0],[4.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A discrete-time cosine, and a triangular pulse $x(t)=2t$ on $0\\le t\\le1$, $x(t)=3-t$ on $1\\le t\\le3$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a pair of impulses.<br>'
     +'<b>Method.</b> Each part uses the method of its own type. The order matters: part (d) needs the $y(t)$ of part (c), and part (e) needs the $z(t)$ of part (d).<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{4\\pi}{9}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac{2}{9}$, which is rational and the sequence repeats. Then $N=\\dfrac{2\\pi}{\\omega_0}k=\\dfrac92k$ is an integer first at $k=2$, so $N_0=9$. The phase $-2$ plays no part in the test.<br>'
     +'<b>Solution — part (b).</b>$$E_\\infty=\\int_{0}^{1}(2t)^{2}\\,\\d t+\\int_{1}^{3}(3-t)^{2}\\,\\d t=\\frac43+\\frac83=4\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $3-\\tfrac t2$: the signal is reflected and stretched by $2$. The support $0\\le3-\\tfrac t2\\le3$ gives $0\\le t\\le6$, twice the original width. The peak sits where $3-\\tfrac t2=1$, at $t=4$, and keeps its height $2$. On $0\\le t\\le4$, $y(t)=3-(3-\\tfrac t2)=\\tfrac t2$; on $4\\le t\\le6$, $y(t)=2(3-\\tfrac t2)=6-t$. The pulse is a triangle on $[0,6]$ peaking at $(4,2)$.<br>'
     +'<b>Solution — part (d).</b> $z(t)=\\tfrac12[y(t)+y(-t)]$. Since $y$ lives on $[0,6]$ and $y(-t)$ on $[-6,0]$, the two never overlap, so$$z(t)=\\tfrac12 y(|t|),$$a pair of triangles on $[-6,6]$ peaking at $t=\\pm4$ with height $1$.<br>'
     +'<b>Solution — part (e).</b> Sifting picks out two values:$$\\int_{-\\infty}^{\\infty}z(t)\\{\\delta(t+4)+\\delta(t-8)\\}\\,\\d t=z(-4)+z(8)=1+0=1.$$The second impulse sits outside the support of $z$, so it contributes nothing.<br>'
     +'<b>Check.</b> In (b) the triangle never exceeds $2$ and lasts $3$ seconds, so $E_\\infty\\le4\\cdot3=12$, and $4$ sits inside that. In (c) the width went from $3$ to $6$, which is the factor $1/|a|=2$ the scaling promises. In (d), $z(0)=\\tfrac12[y(0)+y(0)]=0$, and $z$ is even by construction. In (e) the answer is $z(-4)=\\tfrac12y(4)=\\tfrac12\\cdot2=1$, the peak of $y$ halved, as the even part of a one-sided signal must be.',
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
         'Plot the even part of the $y(t)$ signal given below.',
         'Evaluate $\\int_{-\\infty}^{\\infty}e^{-t}\\delta(2t-4)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.2,3.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,-1],[2,3],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A continuous-time complex exponential, a decaying sequence, and a ramp $y(t)=t+1$ on $-2\\le t\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> Every continuous-time complex exponential repeats; only the discrete-time case needs a rationality test. The energy of a geometric sequence is a geometric series. A scaled impulse argument carries a factor $1/|a|$.<br>'
     +'<b>Solution — part (a).</b> $x(t)=2je^{j5t}$ has $\\omega_0=5$ rad/s. Every continuous-time complex exponential is periodic, with$$T_0=\\frac{2\\pi}{|\\omega_0|}=\\frac{2\\pi}{5}\\;\\text{s}\\approx1.257\\;\\text{s}.$$The constant $2j$ scales and rotates the phasor but does not change how often it returns.<br>'
     +'<b>Solution — part (b).</b> The sequence is non-zero only for $n\\ge0$, where $|x[n]|^{2}=9^{-n}$:$$E_\\infty=\\sum_{n=0}^{\\infty}9^{-n}=\\frac{1}{1-\\tfrac19}=\\frac98=1.125\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> The support $-2\\le-3t+2\\le2$ gives $0\\le t\\le\\tfrac43$, one third of the original width, and the reflection reverses the order. On that interval $y(-3t+2)=(-3t+2)+1=3-3t$, running from $3$ at $t=0$ down to $-1$ at $t=\\tfrac43$.<br>'
     +'<b>Solution — part (d).</b> On $|t|<2$ both $y(t)$ and $y(-t)$ are present, so$$\\Ev\\{y(t)\\}=\\tfrac12[(t+1)+(-t+1)]=1,$$and outside $|t|>2$ both vanish. The even part is a rectangle of height $1$ on $-2<t<2$. The ramp part of $y$ is odd and cancels completely.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse first: $\\delta(2t-4)=\\tfrac12\\delta(t-2)$. Then$$\\int_{-\\infty}^{\\infty}e^{-t}\\cdot\\tfrac12\\delta(t-2)\\,\\d t=\\tfrac12e^{-2}\\approx0.0677.$$'
     +'<b>Check.</b> In (b) the first term alone is $1$ and the rest add $\\tfrac18$, so $\\tfrac98$ is the right size. In (c) the width went from $4$ to $\\tfrac43$, the factor $1/|a|=\\tfrac13$ the scaling promises, and one interior value confirms the sign: at $t=\\tfrac23$ the argument is $0$ and $y(0)=1$, matching $3-3\\cdot\\tfrac23=1$. In (d) the even and odd parts must add back: $1+t=y(t)$ on $|t|<2$, as they do. In (e) forgetting the factor would give $e^{-2}$, twice the answer.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-0.8,2.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'y(-3t+2)',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-0.8,0],[0,0],[0,3],[4/3,-1],[4/3,0],[2.2,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.2,3.2],yr:[-1.6,3.6],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{y(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-3.2,0],[-2,0],[-2,1],[2,1],[2,0],[3.2,0]],{color:C.mid}); return a.svg();})()),
  err:'Writing $\\delta(2t-4)=\\delta(t-2)$ in part (e) and losing the factor $\\tfrac12$. The scaling rule $\\delta(at-b)=\\tfrac{1}{|a|}\\delta\\!\\left(t-\\tfrac ba\\right)$ applies to the impulse exactly as it does to any other signal, and the weight is what changes.',
  teach:'Part (d) is worth dwelling on. The ramp is odd about $t=0$ and the constant is even, so the even part is the constant alone. A student who sees that can write the answer without any algebra.' },

{ id:'D1-23', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (b) and (c) use the sequence $x_1[n]$ of part (a); parts (d) and (e) use the signal $x_3(t)$ plotted below.',
  parts:['Sketch and label the signal $x_1[n]=\\sum_{k=-\\infty}^{\\infty}\\{\\delta[n-3k]-\\delta[n+1+4k]\\}$.',
         'Is the $x_1[n]$ of part (a) periodic? If so, what is its fundamental period?',
         'For the $x_1[n]$ of part (a), plot the odd part of $x_2[n]=\\begin{cases}x_1[n],&-3\\le n\\le3\\\\0,&\\text{otherwise.}\\end{cases}$',
         'Calculate the energy $E_\\infty$ of the $x_3(t)$ signal plotted below.',
         'For the $x_3(t)$ of part (d), evaluate $\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t+0.6)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,3.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,2],[0,0],[2,2],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A difference of two impulse trains, and a V-shaped pulse $x_3(t)=|t|$ on $|t|\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A sketch, a period, an odd part, an energy, and one sifting integral.<br>'
     +'<b>Method.</b> Read each train separately, then add them sample by sample. Two trains of periods $N_1$ and $N_2$ produce a sequence of period $\\operatorname{lcm}(N_1,N_2)$.<br>'
     +'<b>Solution — part (a).</b> The first train places $+1$ wherever $n=3k$, that is at every $n\\equiv0\\pmod 3$. The second places $-1$ wherever $n=-1-4k$, that is at every $n\\equiv3\\pmod 4$. Over one stretch $0\\le n\\le11$ that gives $+1$ at $n=0,3,6,9$ and $-1$ at $n=3,7,11$. The index $n=3$ receives both, and the two cancel:$$x_1[0]=1,\\;x_1[3]=0,\\;x_1[6]=1,\\;x_1[7]=-1,\\;x_1[9]=1,\\;x_1[11]=-1,$$and zero at every other index of the stretch.<br>'
     +'<b>Solution — part (b).</b> The first train repeats every $3$ samples and the second every $4$, so the sum repeats every$$N_0=\\operatorname{lcm}(3,4)=12.$$Nothing shorter works: a shift of $3$ leaves the first train alone but moves the second.<br>'
     +'<b>Solution — part (c).</b> Windowing to $-3\\le n\\le3$ keeps $x_2[-3]=1$, $x_2[-1]=-1$, $x_2[0]=1$, $x_2[3]=0$, and zero elsewhere. Then $\\Od\\{x_2\\}[n]=\\tfrac12(x_2[n]-x_2[-n])$ gives$$\\Od\\{x_2\\}[-3]=\\tfrac12,\\quad\\Od\\{x_2\\}[-1]=-\\tfrac12,\\quad\\Od\\{x_2\\}[1]=\\tfrac12,\\quad\\Od\\{x_2\\}[3]=-\\tfrac12,$$and zero everywhere else, including $n=0$.<br>'
     +'<b>Solution — part (d).</b>$$E_\\infty=\\int_{-2}^{2}t^{2}\\,\\d t=2\\int_{0}^{2}t^{2}\\,\\d t=\\frac{16}{3}\\;\\text{J}\\approx5.333\\;\\text{J}.$$'
     +'<b>Solution — part (e).</b> Sifting returns the value of the signal at the impulse location, and $-0.6$ lies inside the support:$$\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t+0.6)\\,\\d t=x_3(-0.6)=|-0.6|=0.6.$$'
     +'<b>Check.</b> In (b), $12$ divides into the first train four times and into the second three times, both whole numbers. In (c) the odd part must vanish at $n=0$, and it does, because $\\tfrac12(x_2[0]-x_2[0])=0$ whatever $x_2[0]$ is. In (d) the pulse never exceeds $2$ and lasts $4$ seconds, so $E_\\infty\\le4\\cdot4=16$; $\\tfrac{16}{3}$ sits inside. In (e) the value is read off the left arm of the V, where $x_3(t)=-t$, giving $0.6$.',
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
     +'<b>Method.</b> Write $x$ piecewise first. The outer window keeps $|t|<3$; the inner one adds $3$ only on $|t|<2$. Then use $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$ on each piece.<br>'
     +'<b>Solution — piecewise form.</b>$$x(t)=\\begin{cases}t+3,&|t|<2\\\\t,&2<|t|<3\\\\0,&|t|>3.\\end{cases}$$'
     +'<b>Solution — part (a).</b> On $|t|<2$, $\\tfrac12[(t+3)+(-t+3)]=3$. On $2<|t|<3$, $\\tfrac12[t+(-t)]=0$. So$$\\Ev\\{x(t)\\}=\\begin{cases}3,&|t|<2\\\\0,&\\text{otherwise,}\\end{cases}$$a rectangle of height $3$ and width $4$.<br>'
     +'<b>Solution — part (b).</b> On $|t|<2$, $\\tfrac12[(t+3)-(-t+3)]=t$. On $2<|t|<3$, $\\tfrac12[t-(-t)]=t$. So$$\\Od\\{x(t)\\}=\\begin{cases}t,&|t|<3\\\\0,&\\text{otherwise,}\\end{cases}$$a single ramp across the whole window.<br>'
     +'<b>Solution — part (c).</b>$$E_{\\Ev}=\\int_{-2}^{2}9\\,\\d t=36\\;\\text{J},\\qquad E_{\\Od}=\\int_{-3}^{3}t^{2}\\,\\d t=18\\;\\text{J},$$and because the two parts are orthogonal,$$E_x=E_{\\Ev}+E_{\\Od}=54\\;\\text{J}.$$'
     +'<b>Check.</b> The two parts must add back to $x$: on $|t|<2$, $3+t$ is $x$; on $2<|t|<3$, $0+t$ is $x$. Computing $E_x$ directly confirms the split:$$\\int_{-3}^{-2}t^{2}\\,\\d t+\\int_{-2}^{2}(t+3)^{2}\\,\\d t+\\int_{2}^{3}t^{2}\\,\\d t=\\frac{19}{3}+\\frac{124}{3}+\\frac{19}{3}=54\\;\\text{J},$$so the energies do add, which they would not if the parts overlapped in the wrong way.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.2,4.2],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'\\Ev\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-4.2,0],[-2,0],[-2,3],[2,3],[2,0],[4.2,0]],{color:C.mid}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-4.2,4.2],yr:[-3.8,3.8],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{x(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-4.2,0],[-3,0],[-3,-3],[3,3],[3,0],[4.2,0]],{color:C.out}); return a.svg();})()),
  err:'Taking the even part to be $3$ on the whole window $|t|<3$. Outside $|t|=2$ the constant is no longer there, so only the ramp survives, and a ramp has no even part.',
  teach:'The additivity of the energies is the check worth insisting on. It holds because the even and odd parts are orthogonal, and a student who verifies $36+18=54$ against a direct integration has confirmed both parts at once.' },

{ id:'D1-25', module:'M1', type:'full', src:'Final Q1',
  stem:'Two discrete-time complex exponentials differ only in whether $\\pi$ appears in the frequency:$$x_1[n]=e^{j\\frac{4}{7}n},\\qquad x_2[n]=e^{j\\frac{4\\pi}{7}n}.$$',
  parts:['Determine whether $x_1[n]$ is periodic. If it is, find its fundamental period.',
         'Determine whether $x_2[n]$ is periodic. If it is, find its fundamental period, and say what makes the two cases differ.'],
  sol:'<b>Given.</b> Two discrete-time complex exponentials, $\\omega_1=\\tfrac47$ and $\\omega_2=\\tfrac{4\\pi}{7}$ rad/sample.<br>'
     +'<b>Find.</b> Whether each repeats, and with what fundamental period.<br>'
     +'<b>Method.</b> A discrete-time exponential repeats only if $x[n]=x[n+N]$ for some positive <em>integer</em> $N$. That needs $\\omega_0N=2\\pi k$ with $k$ an integer, so $\\omega_0/2\\pi$ must be rational.<br>'
     +'<b>Solution — part (a).</b>$$\\frac{\\omega_1}{2\\pi}=\\frac{4/7}{2\\pi}=\\frac{2}{7\\pi}.$$Since $\\pi$ is irrational, $\\tfrac{2}{7\\pi}$ is irrational, and no integer $N$ satisfies the condition. $x_1[n]$ is <b>not periodic</b>.<br>'
     +'<b>Solution — part (b).</b>$$\\frac{\\omega_2}{2\\pi}=\\frac{4\\pi/7}{2\\pi}=\\frac{2}{7},$$which is rational, so $x_2[n]$ <b>is periodic</b>. Then $N=\\dfrac{2\\pi}{\\omega_2}k=\\dfrac72k$ is an integer first at $k=2$, giving $N_0=7$. What separates the two is the factor $\\pi$ in the frequency: it is exactly what cancels against the $2\\pi$ in the test and leaves a ratio of two integers.<br>'
     +'<b>Check.</b> For $x_2$, $e^{j\\frac{4\\pi}{7}(n+7)}=e^{j\\frac{4\\pi}{7}n}e^{j4\\pi}$, and $e^{j4\\pi}=1$, so $N=7$ does return the sequence to itself; no smaller positive integer does, because $\\tfrac72k$ is an integer only when $k$ is even. For $x_1$, the continuous-time signal $e^{j4t/7}$ is perfectly periodic with $T_0=\\tfrac{7\\pi}{2}$ — it is sampling on the integers that destroys the repetition, because $\\tfrac{7\\pi}{2}$ is not an integer.',
  err:'Reporting $N_0=\\tfrac{7\\pi}{2}$ for $x_1[n]$ by transferring the continuous-time formula $T_0=2\\pi/\\omega_0$. A period of a sequence has to be an integer, and no non-integer answer can be one.',
  teach:'These two are worth showing side by side. Students learn the rule as "check whether $\\omega_0/2\\pi$ is rational" and then apply it without noticing that a missing $\\pi$ decides the case. Ask which of the two a sampled continuous-time cosine would give.' },

{ id:'D1-26', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (c) to (e) all use the signal $x(t)$ plotted below.',
  parts:['Is $x[n]=\\sin\\!\\left(\\tfrac{6\\pi}{7}n+\\tfrac{\\pi}{4}\\right)$ periodic? If so, find its fundamental period.',
         'Calculate the energy $E_\\infty$ of the $x(t)$ signal plotted below.',
         'Plot $y(t)=x(2t+4)$.',
         'Plot $z(t)=\\Od\\{y(t)\\}$, the odd part of the $y(t)$ signal of part (c).',
         'Evaluate $\\int_{-\\infty}^{\\infty}z(t)\\delta(3t+3)\\,\\d t$, with $z(t)$ as defined in part (d).'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-1.4,5.6],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-1.4,0],[0,0],[1,3],[2,3],[4,0],[5.6,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A discrete-time sine, and a trapezoid $x(t)=3t$ on $0\\le t\\le1$, $x(t)=3$ on $1\\le t\\le2$, $x(t)=\\tfrac32(4-t)$ on $2\\le t\\le4$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> As before, each part uses the method of its own type, and parts (d) and (e) rest on the plot built in (c).<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{6\\pi}{7}$, so $\\dfrac{\\omega_0}{2\\pi}=\\dfrac37$, rational. Then $N=\\dfrac{2\\pi}{\\omega_0}k=\\dfrac73k$ is an integer first at $k=3$, so $N_0=7$.<br>'
     +'<b>Solution — part (b).</b>$$E_\\infty=\\int_{0}^{1}9t^{2}\\,\\d t+\\int_{1}^{2}9\\,\\d t+\\int_{2}^{4}\\tfrac94(4-t)^{2}\\,\\d t=3+9+6=18\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $2(t+2)$: the signal is advanced by $2$ and compressed by $2$. The support $0\\le2t+4\\le4$ gives $-2\\le t\\le0$, half the original width. The flat top, at $1\\le2t+4\\le2$, sits on $-\\tfrac32\\le t\\le-1$ and keeps its height $3$.<br>'
     +'<b>Solution — part (d).</b> $z(t)=\\tfrac12[y(t)-y(-t)]$. Since $y$ lives on $[-2,0]$ and $y(-t)$ on $[0,2]$, the two never overlap, so$$z(t)=\\begin{cases}\\tfrac12y(t),&t<0\\\\-\\tfrac12y(-t),&t>0,\\end{cases}$$a copy of $y$ halved on the left and its negative mirror image on the right.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse: $\\delta(3t+3)=\\tfrac13\\delta(t+1)$. From (c), $y(-1)=x(2)=3$, so $z(-1)=\\tfrac12\\cdot3=\\tfrac32$, and$$\\int_{-\\infty}^{\\infty}z(t)\\delta(3t+3)\\,\\d t=\\tfrac13z(-1)=\\tfrac13\\cdot\\tfrac32=\\tfrac12.$$'
     +'<b>Check.</b> In (b) the trapezoid never exceeds $3$ and lasts $4$ seconds, so $E_\\infty\\le9\\cdot4=36$; $18$ is half of that, which is right for a shape that is at full height for only part of its width. In (c) the width went from $4$ to $2$, the factor $1/|a|=\\tfrac12$ the scaling promises. In (d), $z$ must vanish at $t=0$, and it does, because $y(0)=x(4)=0$. In (e) dropping the factor $\\tfrac13$ would give $\\tfrac32$, three times the answer.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.8,1.4],yr:[-0.5,3.8],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:48,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-2.8,0],[-2,0],[-1.5,3],[-1,3],[0,0],[1.4,0]],{color:C.out}); return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-2.8,2.8],yr:[-2.2,2.2],xlabel:'t\\;(\\text{s})',ylabel:'\\Od\\{y(t)\\}',
      pad:{l:56,r:26,t:28,b:36},xstep:1,ystep:1});
      a.poly([[-2.8,0],[-2,0],[-1.5,1.5],[-1,1.5],[0,0],[1,-1.5],[1.5,-1.5],[2,0],[2.8,0]],{color:C.mid}); return a.svg();})()),
  err:'Reading $x(2t+4)$ as a delay of $4$ followed by a compression, and reporting a support of $[2,4]$ or $[4,8]$. Factor the argument as $2(t+2)$ first: the shift that acts is $2$, not $4$, and it moves the signal to the left.',
  teach:'Part (e) rewards a student who notices that only one value of $z$ is ever needed. Reading $z(-1)$ off the plot of $y$ is faster than writing $z$ out as a formula, and it is the habit worth building.' },

{ id:'D1-27', module:'M1', type:'full', src:'MT1 Q1',
  stem:'Work the following parts in order. Parts (c) to (e) use the signal $y(t)$ plotted below.',
  parts:['Is the signal $x(t)=5e^{j\\frac{3\\pi}{4}t}$ periodic? If so, what is its fundamental period?',
         'Determine the energy $E_\\infty$ of the signal $x[n]=\\left(\\tfrac12\\right)^{n}u[n-2]$.',
         'Generate a plot of $y(2t-1)$ using the given signal $y(t)$.',
         'Plot the even part of the $y(t)$ signal given below.',
         'Evaluate $\\int_{-\\infty}^{\\infty}y(t)\\delta(2t-1)\\,\\d t$, with $y(t)$ as given below.'],
  figure:()=>{const a=P.Axes({w:1080,h:260,xr:[-3.2,3.2],yr:[-1.6,1.6],xlabel:'t\\;(\\text{s})',ylabel:'y(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-3.2,0],[0,0],[0,1],[2,-1],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A continuous-time complex exponential, a delayed geometric sequence, and a falling ramp $y(t)=1-t$ on $0\\le t\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A period, an energy, two plots, and one integral against a scaled impulse.<br>'
     +'<b>Method.</b> Take the parts in order; (c) and (d) both work from the given plot, and (e) needs only one value of it.<br>'
     +'<b>Solution — part (a).</b> $\\omega_0=\\tfrac{3\\pi}{4}$ rad/s, and every continuous-time complex exponential is periodic:$$T_0=\\frac{2\\pi}{|\\omega_0|}=\\frac{2\\pi}{3\\pi/4}=\\frac83\\;\\text{s}\\approx2.667\\;\\text{s}.$$'
     +'<b>Solution — part (b).</b> The step $u[n-2]$ starts the sum at $n=2$, where $|x[n]|^{2}=\\left(\\tfrac14\\right)^{n}$:$$E_\\infty=\\sum_{n=2}^{\\infty}\\left(\\tfrac14\\right)^{n}=\\frac{(1/4)^{2}}{1-\\tfrac14}=\\frac{1/16}{3/4}=\\frac{1}{12}\\approx0.0833\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Write the argument as $2\\!\\left(t-\\tfrac12\\right)$: the signal is delayed by $\\tfrac12$ and compressed by $2$. The support $0\\le2t-1\\le2$ gives $\\tfrac12\\le t\\le\\tfrac32$, half the original width, and on it $y(2t-1)=1-(2t-1)=2-2t$, running from $1$ down to $-1$.<br>'
     +'<b>Solution — part (d).</b> On $0<t<2$ only $y(t)$ is present and on $-2<t<0$ only $y(-t)$, so$$\\Ev\\{y(t)\\}=\\tfrac12(1-|t|)\\quad\\text{for }|t|<2,$$zero elsewhere. It runs from $\\tfrac12$ at $t=0$ down to $-\\tfrac12$ at $t=\\pm2$.<br>'
     +'<b>Solution — part (e).</b> Rescale the impulse: $\\delta(2t-1)=\\tfrac12\\delta\\!\\left(t-\\tfrac12\\right)$, and $y\\!\\left(\\tfrac12\\right)=1-\\tfrac12=\\tfrac12$, so$$\\int_{-\\infty}^{\\infty}y(t)\\delta(2t-1)\\,\\d t=\\tfrac12\\cdot\\tfrac12=\\tfrac14.$$'
     +'<b>Check.</b> In (b) the first term alone is $\\tfrac{1}{16}=0.0625$ and the rest add about $0.021$, so $\\tfrac{1}{12}$ is the right size; starting the sum at $n=0$ instead would give $\\tfrac43$, sixteen times too large. In (c) the width went from $2$ to $1$, the factor $1/|a|=\\tfrac12$ the scaling promises. In (d) the even and odd parts must add back to $y$: at $t=1$, $\\Ev=0$ and $\\Od=0$, matching $y(1)=0$.',
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
         'Calculate the energy $E_\\infty$ of the $x_3(t)$ signal plotted below.',
         'For the $x_3(t)$ of part (d), evaluate $\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t-1.5)\\,\\d t$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.2,3.2],yr:[-0.4,2.6],xlabel:'t\\;(\\text{s})',ylabel:'x_3(t)',
      pad:{l:52,r:28,t:30,b:38},xstep:1,ystep:1});
    a.poly([[-3.2,0],[-2,0],[-2,1],[-1,1],[-1,2],[1,2],[1,1],[2,1],[2,0],[3.2,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A difference of two impulse trains, and a stepped pulse $x_3(t)=2$ on $|t|\\le1$, $x_3(t)=1$ on $1<|t|\\le2$, zero elsewhere.<br>'
     +'<b>Find.</b> A sketch, a period, an odd part, an energy, and one sifting integral.<br>'
     +'<b>Method.</b> Read each train separately, then add them index by index.<br>'
     +'<b>Solution — part (a).</b> The first train places $+1$ at every $n\\equiv0\\pmod 4$, the second $-1$ at every $n=-1-6k$, that is at every $n\\equiv5\\pmod 6$. Over one stretch $0\\le n\\le11$ that gives $+1$ at $n=0,4,8$ and $-1$ at $n=5,11$. No index receives both, so nothing cancels here.<br>'
     +'<b>Solution — part (b).</b> The trains repeat every $4$ and every $6$ samples, so$$N_0=\\operatorname{lcm}(4,6)=12,$$not $24$: the two periods share the factor $2$, so the product overshoots.<br>'
     +'<b>Solution — part (c).</b> Windowing to $-4\\le n\\le4$ keeps $x_2[-4]=1$, $x_2[-1]=-1$, $x_2[0]=1$, $x_2[4]=1$, and zero elsewhere. Then $\\Od\\{x_2\\}[n]=\\tfrac12(x_2[n]-x_2[-n])$ gives$$\\Od\\{x_2\\}[-1]=-\\tfrac12,\\qquad\\Od\\{x_2\\}[1]=\\tfrac12,$$and zero everywhere else. At $n=\\pm4$ the two samples are equal, so they contribute nothing to the odd part; at $n=0$ the odd part always vanishes.<br>'
     +'<b>Solution — part (d).</b>$$E_\\infty=\\int_{-1}^{1}2^{2}\\,\\d t+2\\int_{1}^{2}1^{2}\\,\\d t=8+2=10\\;\\text{J}.$$'
     +'<b>Solution — part (e).</b> The point $t=1.5$ lies on the lower step, where $x_3=1$:$$\\int_{-\\infty}^{\\infty}x_3(t)\\delta(t-1.5)\\,\\d t=x_3(1.5)=1.$$'
     +'<b>Check.</b> In (b), $12$ divides into the first train three times and into the second twice, both whole numbers, and no smaller positive integer does. In (c) the odd part is non-zero only where $x_2$ fails to be symmetric, which is the pair $n=\\pm1$ alone. In (d) the pulse never exceeds $2$ and lasts $4$ seconds, so $E_\\infty\\le4\\cdot4=16$; $10$ sits inside.',
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
     +'<b>Method.</b> Write $x$ piecewise, then split each piece with $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$.<br>'
     +'<b>Solution — piecewise form.</b>$$x(t)=\\begin{cases}2t+1,&|t|<1\\\\2t,&1<|t|<2\\\\0,&|t|>2.\\end{cases}$$'
     +'<b>Solution — part (a).</b> On $|t|<1$, $\\tfrac12[(2t+1)+(-2t+1)]=1$. On $1<|t|<2$, $\\tfrac12[2t+(-2t)]=0$. So the even part is a rectangle of height $1$ on $|t|<1$.<br>'
     +'<b>Solution — part (b).</b> On $|t|<1$, $\\tfrac12[(2t+1)-(-2t+1)]=2t$; on $1<|t|<2$, $\\tfrac12[2t-(-2t)]=2t$. So$$\\Od\\{x(t)\\}=\\begin{cases}2t,&|t|<2\\\\0,&\\text{otherwise,}\\end{cases}$$one ramp across the whole window.<br>'
     +'<b>Solution — part (c).</b>$$E_{\\Ev}=\\int_{-1}^{1}1\\,\\d t=2\\;\\text{J},\\qquad E_{\\Od}=\\int_{-2}^{2}4t^{2}\\,\\d t=\\frac{64}{3}\\;\\text{J},$$and by orthogonality$$E_x=2+\\frac{64}{3}=\\frac{70}{3}\\;\\text{J}\\approx23.33\\;\\text{J}.$$'
     +'<b>Check.</b> The parts add back: $1+2t=x$ on $|t|<1$, and $0+2t=x$ on $1<|t|<2$. Integrating $x^{2}$ directly,$$\\int_{-2}^{-1}4t^{2}\\,\\d t+\\int_{-1}^{1}(2t+1)^{2}\\,\\d t+\\int_{1}^{2}4t^{2}\\,\\d t=\\frac{28}{3}+\\frac{14}{3}+\\frac{28}{3}=\\frac{70}{3},$$which matches, so the split is right.',
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
     +'<b>Method.</b> Add the steps interval by interval. Differentiating a step gives an impulse at the jump, with the weight of the jump. Sifting against an impulse returns a number.<br>'
     +'<b>Solution — part (a).</b> Below $t=-2$ every step is off. On $-2<t<0$ only the first is on, giving $1$. On $0<t<2$ the second has switched on, giving $1-2=-1$. Above $t=2$ all three are on, giving $1-2+1=0$. So$$x(t)=\\begin{cases}1,&-2<t<0\\\\-1,&0<t<2\\\\0,&\\text{otherwise,}\\end{cases}$$a pair of rectangles of opposite sign.<br>'
     +'<b>Solution — part (b).</b> Each step contributes an impulse at its own jump, carrying the weight of that jump:$$\\frac{\\d x}{\\d t}=\\delta(t+2)-2\\delta(t)+\\delta(t-2).$$'
     +'<b>Solution — part (c).</b> The point $t=1$ lies in the negative rectangle:$$\\int_{-\\infty}^{\\infty}x(t)\\delta(t-1)\\,\\d t=x(1)=-1.$$'
     +'<b>Solution — part (d).</b> Sift $t^{2}$ against each impulse in turn:$$\\int_{-\\infty}^{\\infty}\\frac{\\d x}{\\d t}\\,t^{2}\\,\\d t=(-2)^{2}-2\\cdot0^{2}+2^{2}=4-0+4=8.$$'
     +'<b>Solution — part (e).</b> The signal has magnitude $1$ over a total length of $4$ seconds:$$E_\\infty=\\int_{-2}^{0}1\\,\\d t+\\int_{0}^{2}1\\,\\d t=4\\;\\text{J}.$$'
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

window.DRILLMAP_M1 = [

{ id:'m1-drill-map', module:'M1', nav:'Module 1 · question types',
  title:'Module 1 — what a question looks like', src:'pp. 2–10',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 1 question types periodicity energy power transformation even odd impulse taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Question types', src:'pp. 2–10'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on signal foundations come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M1'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M1 = [

{ id:'m1-drill', module:'M1', nav:'Module 1 · practice questions',
  title:'Module 1 — practice questions', src:'pp. 2–10',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 1 practice periodicity energy power transformation even odd sifting impulse step',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 1 · Practice D1-01 … D1-30', src:'pp. 2–10'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Every solution ends with a <b>Check</b> step. In this module the cheap checks are: a period must divide into every term a whole number of times, a transformation must preserve the width of the support up to the scale factor, the even and odd parts must add back to the signal, and a running sum or integral must settle at the total weight of the impulses that built it.'},
  {t:'rule', short:true},
  {t:'drill', module:'M1'}
]}

];
})();
