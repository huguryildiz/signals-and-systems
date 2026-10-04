/* ==========================================================================
   COURSE CONTENT — verified against `lecture notes.pdf`.
   This file holds course data only (modules, notation glossary, the system
   catalogue used by Laboratory 2.3, and the property criteria).
   Every entry carries its source page.
   ========================================================================== */
const CONTENT = {

  META: {
    course:'Signals and Systems',
    source:'lecture notes.pdf (88 pp.)',
    version:'v1.8 · Modules 0–7 and their notes, laboratories, practice questions, and worked solutions rewritten in plain teaching English',
    date:'2026-08-03',
    language:'Academic English',
    conventions:{
      ctft:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,dt',
      dtft:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}',
      sinc:'Unnormalised: $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$. Stated explicitly wherever used.',
      energy:'Normalised ($R=1\\ \\Omega$) energy and power throughout.'
    }
  },

  MODULES: [
    { id:'M0', title:'Why Signals and Systems?' },
    { id:'M1', title:'Signal Foundations' },
    { id:'M2', title:'Systems and Their Properties' },
    { id:'M3', title:'Linear Time-Invariant Systems' },
    { id:'M4', title:'Fourier Series' },
    { id:'M5', title:'Continuous-Time Fourier Transform' },
    { id:'M6', title:'Discrete-Time Fourier Transform' },
    { id:'M7', title:'Sampling and Aliasing' }
  ],

  /* ---- notation glossary; every symbol defined once, linked from prose ---- */
  GLOSS: {
    xt:{ s:'x(t)', d:'Continuous-time signal or system input; $t\\in\\mathbb{R}$.', go:'m1-def' },
    xn:{ s:'x[n]', d:'Discrete-time signal or system input; $n\\in\\mathbb{Z}$ (integer time index).', go:'m1-def' },
    yt:{ s:'y(t),\\;y[n]', d:'System output in continuous and discrete time.', go:'m2-abstraction' },
    ht:{ s:'h(t),\\;h[n]', d:'Impulse response: the output of an LTI system when the input is a unit impulse.', go:'m3-impulse' },
    dt:{ s:'\\delta(t)', d:'Continuous-time unit impulse (Dirac delta). It is not an ordinary function. It is defined by its sifting action.', go:'m1-ct-impulse' },
    dn:{ s:'\\delta[n]', d:'Discrete-time unit impulse: $1$ at $n=0$, zero elsewhere. An ordinary sequence.', go:'m1-dt-impulse' },
    ut:{ s:'u(t)', d:'Continuous-time unit step: $1$ for $t\\ge 0$, $0$ otherwise.', go:'m1-ct-impulse' },
    un:{ s:'u[n]', d:'Discrete-time unit step: $1$ for $n\\ge 0$, $0$ otherwise.', go:'m1-dt-step' },
    Einf:{ s:'E_\\infty', d:'Total energy over an infinite interval ($R=1$ normalisation).', go:'m1-energy-inf' },
    Pinf:{ s:'P_\\infty', d:'Time-averaged power over an infinite interval.', go:'m1-power' },
    T0:{ s:'T_0', d:'Fundamental period of a continuous-time periodic signal: the smallest $T>0$ with $x(t)=x(t+T)$.', go:'m1-fundamental' },
    N0:{ s:'N_0', d:'Fundamental period of a discrete-time periodic signal: the smallest integer $N>0$ with $x[n]=x[n+N]$.', go:'m1-fundamental' },
    w0:{ s:'\\omega_0', d:'Fundamental angular frequency: $2\\pi/T_0$ (rad/s) or $2\\pi/N_0$ (rad/sample).', go:'m1-fundamental' },
    conv:{ s:'\\ast', d:'Convolution operator. Defined only for linear time-invariant systems.', go:'m3-convsum' },
    Cexp:{ s:'C,\\;a,\\;\\alpha,\\;\\beta', d:'Complex exponential parameters: $x(t)=Ce^{at}$, $x[n]=Ce^{\\beta n}=C\\alpha^{n}$ with $\\alpha=e^{\\beta}$.', go:'m1-ct-cexp' },
    Ev:{ s:'\\Ev\\{\\cdot\\},\\;\\Od\\{\\cdot\\}', d:'Even and odd parts: $\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$.', go:'m1-evenodd' },
    S:{ s:'S', d:'System operator mapping an input signal to an output signal.', go:'m2-abstraction' }
  },

  /* ---- property criteria used by Laboratory 2.3 ---- */
  PROPS: [
    { k:'mem',  name:'Memoryless',
      crit:'The output at time $t$ (or $n$) uses only the input at that same time. If it uses $x(t\\pm\\tau)$ with $\\tau\\neq0$, or a past output, the system has memory.' },
    { k:'inv',  name:'Invertible',
      crit:'Different inputs must give different outputs. To prove it, give a formula that recovers the input. To disprove it, give two inputs with the same output.' },
    { k:'caus', name:'Causal',
      crit:'The output at time $t$ (or $n$) uses only inputs at times $\\le t$, that is, the present and the past.' },
    { k:'stab', name:'BIBO stable',
      crit:'Every bounded input, $|x|\\le B\\lt\\infty$, must give a bounded output. One bounded input with an unbounded output disproves it.' },
    { k:'ti',   name:'Time invariant',
      crit:'If $x(t)\\to y(t)$, then $x(t-t_0)\\to y(t-t_0)$ for every $t_0$. Compare the response to the shifted input with the shifted output.' },
    { k:'lin',  name:'Linear',
      crit:'$a x_1 + b x_2 \\to a y_1 + b y_2$ for all $a,b\\in\\mathbb{C}$. This is additivity and homogeneity together.' }
  ],

  /* ---- system catalogue for Laboratory 2.3. The thirteen systems differ from the
     lecture examples, the quick check and the practice questions, so the laboratory
     tests transfer rather than recall. No two share the same six verdicts. ---- */
  SYSTEMS: [
    { tex:'y(t)=x(t)\\,u(t)', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:true, arg:'The output at $t$ uses only $x(t)$. The unit step $u(t)$ is a known function of $t$, not a stored input.'},
      inv:{v:false,arg:'Take $x_1(t)=0$, and $x_2(t)=1$ for $t\\lt-1$ and $0$ otherwise. Both give $y(t)=0$, because the step sets every value for $t\\lt0$ to zero.'},
      caus:{v:true, arg:'A memoryless system is causal: nothing later than $t$ is used.'},
      stab:{v:true, arg:'$|u(t)|\\le1$, so $|y(t)|\\le|x(t)|\\le B$.'},
      ti:{v:false, arg:'Take $x(t)=1$, so $y_1(t)=u(t)$. The shifted input $x(t-t_0)=1$ is the same constant and gives $u(t)$ again. The shifted output is $y_1(t-t_0)=u(t-t_0)$. They differ for every $t_0\\neq0$.'},
      lin:{v:true, arg:'$\\bigl(a x_1(t)+b x_2(t)\\bigr)u(t)=a\\,x_1(t)u(t)+b\\,x_2(t)u(t)=a y_1(t)+b y_2(t)$.'} } },

    { tex:'y[n]=x[n^{2}]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'At $n=2$ the output is $y[2]=x[4]$, an input at a different time.'},
      inv:{v:false,arg:'No integer $n$ has $n^{2}=2$, so $x[2]$ never reaches the output. The inputs $x_1[n]=0$ and $x_2[n]=\\delta[n-2]$ both give $y[n]=0$.'},
      caus:{v:false,arg:'At $n=2$ the output needs $x[4]$, a future sample.'},
      stab:{v:true, arg:'Every output sample is one input sample, so $|y[n]|\\le B$.'},
      ti:{v:false, arg:'$x_1[n]=\\delta[n]$ gives $y_1[n]=\\delta[n^{2}]=\\delta[n]$. The delayed input $\\delta[n-1]$ gives $\\delta[n^{2}-1]=\\delta[n-1]+\\delta[n+1]$, a pulse at $n=1$ and at $n=-1$. But $y_1[n-1]=\\delta[n-1]$ has one pulse.'},
      lin:{v:true, arg:'The system only reads the input at the index $n^{2}$: $a x_1[n^{2}]+b x_2[n^{2}]=a y_1[n]+b y_2[n]$.'} } },

    { tex:'y(t)=x(t)\\,\\bigl|x(t)\\bigr|', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:true, arg:'Only $x(t)$ appears.'},
      inv:{v:true, arg:'Let $g(v)=v|v|$. It equals $v^{2}$ for $v\\ge0$ and $-v^{2}$ for $v\\lt0$, so it is strictly increasing and the sign of $y$ is the sign of $x$. The inverse is $x(t)=\\operatorname{sgn}\\bigl(y(t)\\bigr)\\sqrt{|y(t)|}$.'},
      caus:{v:true, arg:'A memoryless system is causal.'},
      stab:{v:true, arg:'$|y(t)|=|x(t)|^{2}\\le B^{2}$.'},
      ti:{v:true,  arg:'The rule has no explicit $t$. The input $x(t-t_0)$ gives $x(t-t_0)\\,|x(t-t_0)|=y(t-t_0)$.'},
      lin:{v:false,arg:'Homogeneity fails. $x(t)=1$ gives $y=1$, but $2x(t)=2$ gives $2\\cdot|2|=4\\neq2\\cdot1$. A system can be invertible without being linear.'} } },

    { tex:'y[n]=2^{n}\\,x[n]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:true, arg:'The output at $n$ uses only $x[n]$. The factor $2^{n}$ is a known gain.'},
      inv:{v:true, arg:'$2^{n}\\gt0$ for every $n$, so $x[n]=2^{-n}\\,y[n]$.'},
      caus:{v:true, arg:'A memoryless system is causal.'},
      stab:{v:false,arg:'The input $x[n]=1$ is bounded by $B=1$, but $y[n]=2^{n}$ grows without bound as $n\\to\\infty$.'},
      ti:{v:false, arg:'$x_1[n]=\\delta[n]$ gives $y_1[n]=2^{0}\\delta[n]=\\delta[n]$. The delayed input $\\delta[n-1]$ gives $2^{1}\\delta[n-1]=2\\,\\delta[n-1]$. But $y_1[n-1]=\\delta[n-1]$.'},
      lin:{v:true, arg:'Multiplication by the fixed sequence $2^{n}$ is linear in $x$.'} } },

    { tex:'y(t)=\\int_{-\\infty}^{2t}x(\\tau)\\,d\\tau', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'At $t=1$ the output integrates $x(\\tau)$ over $\\tau\\le2$, not only at $\\tau=1$.'},
      inv:{v:true, arg:'Differentiate with the chain rule: $\\dfrac{dy}{dt}=2\\,x(2t)$. Put $s=2t$, so $x(s)=\\tfrac12\\,\\dfrac{dy}{dt}\\Big|_{t=s/2}$.'},
      caus:{v:false,arg:'At $t=1$ the upper limit is $2$, so the output uses $x(\\tau)$ for $1\\lt\\tau\\le2$, which are future values.'},
      stab:{v:false,arg:'$x(t)=u(t)$ is bounded by $1$. For $t\\gt0$, $y(t)=\\int_{0}^{2t}1\\,d\\tau=2t$, which grows without bound.'},
      ti:{v:false, arg:'Take $x(t)=u(t)$ and $t_0=1$. The input $u(t-1)$ gives $\\int_{1}^{2t}d\\tau=2t-1$ for $t\\ge\\tfrac12$, so the output at $t=1$ is $1$. The shifted output $y(t-1)=2(t-1)u(t-1)$ is $0$ at $t=1$.'},
      lin:{v:true, arg:'Integration is linear: $\\int_{-\\infty}^{2t}\\bigl(a x_1+b x_2\\bigr)d\\tau=a y_1(t)+b y_2(t)$.'} } },

    { tex:'y[n]=\\max\\bigl\\{x[n],\\,x[n-1]\\bigr\\}', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'The output at $n$ also uses $x[n-1]$.'},
      inv:{v:false,arg:'$x_1[n]=0$ gives $y_1[n]=0$. The input $x_2[n]=-\\delta[n]$ gives $\\max\\{-1,0\\}=0$ at $n=0$ and $\\max\\{0,-1\\}=0$ at $n=1$, so $y_2[n]=0$ too.'},
      caus:{v:true, arg:'Only $x[n]$ and $x[n-1]$ are used: the present and the past.'},
      stab:{v:true, arg:'The output is one of the two input samples, so $|y[n]|\\le B$.'},
      ti:{v:true,  arg:'The rule has no explicit $n$. The input $x[n-n_0]$ gives $\\max\\{x[n-n_0],x[n-n_0-1]\\}=y[n-n_0]$.'},
      lin:{v:false,arg:'Homogeneity fails for $a=-1$. $x[n]=\\delta[n]$ gives $y[n]=\\delta[n]+\\delta[n-1]$. The input $-\\delta[n]$ gives $y[n]=0$, not $-\\delta[n]-\\delta[n-1]$.'} } },

    { tex:'y(t)=x\\bigl(\\lfloor t\\rfloor\\bigr)', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'$\\lfloor t\\rfloor$ is the largest integer not above $t$. At $t=1.5$ the output is $x(1)$, an input at an earlier time.'},
      inv:{v:false,arg:'The system reads the input only at integer times. $x_1(t)=0$ and $x_2(t)=\\sin(\\pi t)$ agree at every integer, so both give $y(t)=0$.'},
      caus:{v:true, arg:'$\\lfloor t\\rfloor\\le t$ for every $t$, so only present and past inputs are used.'},
      stab:{v:true, arg:'Every output value is an input value, so $|y(t)|\\le B$.'},
      ti:{v:false, arg:'$x_1(t)=u(t)$ gives $y_1(t)=u(\\lfloor t\\rfloor)=u(t)$. The input $u(t-0.5)$ gives $u(\\lfloor t\\rfloor-0.5)$, which is $1$ only when $\\lfloor t\\rfloor\\ge1$, that is $u(t-1)$. But $y_1(t-0.5)=u(t-0.5)$. They differ for $0.5\\le t\\lt1$.'},
      lin:{v:true, arg:'$a x_1(\\lfloor t\\rfloor)+b x_2(\\lfloor t\\rfloor)=a y_1(t)+b y_2(t)$.'} } },

    { tex:'y[n]=y[n-1]+x^{2}[n]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'From rest, back-substitution gives $y[n]=\\sum_{k=-\\infty}^{n}x^{2}[k]$, so the output depends on the whole input history.'},
      inv:{v:false,arg:'$x[n]$ and $-x[n]$ have the same square, so they give the same output.'},
      caus:{v:true, arg:'The sum $\\sum_{k\\le n}x^{2}[k]$ uses only present and past samples.'},
      stab:{v:false,arg:'$x[n]=u[n]$ is bounded by $1$, but $y[n]=\\sum_{k=0}^{n}1=n+1$ grows without bound.'},
      ti:{v:true,  arg:'The input $x[n-n_0]$ gives $\\sum_{k\\le n}x^{2}[k-n_0]$. Put $m=k-n_0$: the sum becomes $\\sum_{m\\le n-n_0}x^{2}[m]=y[n-n_0]$.'},
      lin:{v:false,arg:'Homogeneity fails. $x[n]=\\delta[n]$ gives $y[n]=u[n]$, but $2\\delta[n]$ gives $4u[n]\\neq2u[n]$.'} } },

    { tex:'y(t)=\\tfrac12\\bigl[x(t+1)+x(t-1)\\bigr]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'The output at $t$ uses the input at $t+1$ and at $t-1$.'},
      inv:{v:false,arg:'Take $x(t)=\\cos(\\pi t/2)$. The sum-to-product identity gives $\\cos\\bigl(\\tfrac{\\pi(t+1)}{2}\\bigr)+\\cos\\bigl(\\tfrac{\\pi(t-1)}{2}\\bigr)=2\\cos\\bigl(\\tfrac{\\pi t}{2}\\bigr)\\cos\\bigl(\\tfrac{\\pi}{2}\\bigr)=0$. The zero input also gives $y(t)=0$.'},
      caus:{v:false,arg:'The term $x(t+1)$ is a future value.'},
      stab:{v:true, arg:'By the triangle inequality, $|y(t)|\\le\\tfrac12(B+B)=B$.'},
      ti:{v:true,  arg:'The rule has no explicit $t$. The input $x(t-t_0)$ gives $\\tfrac12[x(t-t_0+1)+x(t-t_0-1)]=y(t-t_0)$.'},
      lin:{v:true, arg:'Both terms are shifts of $x$, and an average of shifts is linear.'} } },

    { tex:'y(t)=\\int_{-\\infty}^{t}e^{-(t-\\tau)}x(\\tau)\\,d\\tau', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'The output weights the whole past of the input.'},
      inv:{v:true, arg:'Write $y(t)=e^{-t}\\int_{-\\infty}^{t}e^{\\tau}x(\\tau)\\,d\\tau$. The product rule gives $\\dfrac{dy}{dt}=-y(t)+x(t)$, so $x(t)=\\dfrac{dy}{dt}+y(t)$.'},
      caus:{v:true, arg:'The upper limit is $t$, so only $\\tau\\le t$ contributes.'},
      stab:{v:true, arg:'$|y(t)|\\le B\\int_{-\\infty}^{t}e^{-(t-\\tau)}\\,d\\tau$. Put $s=t-\\tau$: the integral is $\\int_{0}^{\\infty}e^{-s}\\,ds=1$, so $|y(t)|\\le B$.'},
      ti:{v:true,  arg:'The input $x(t-t_0)$ gives $\\int_{-\\infty}^{t}e^{-(t-\\tau)}x(\\tau-t_0)\\,d\\tau$. Put $\\sigma=\\tau-t_0$: this is $\\int_{-\\infty}^{t-t_0}e^{-(t-t_0-\\sigma)}x(\\sigma)\\,d\\sigma=y(t-t_0)$.'},
      lin:{v:true, arg:'Integration is linear, and the weight $e^{-(t-\\tau)}$ does not depend on $x$.'} } },

    { tex:'y[n]=(-1)^{n}\\,x[n]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:true, arg:'Only $x[n]$ appears. The sign $(-1)^{n}$ is a known gain.'},
      inv:{v:true, arg:'$\\bigl((-1)^{n}\\bigr)^{2}=1$, so applying the same system again returns the input: $x[n]=(-1)^{n}\\,y[n]$.'},
      caus:{v:true, arg:'A memoryless system is causal.'},
      stab:{v:true, arg:'$|y[n]|=|x[n]|\\le B$.'},
      ti:{v:false, arg:'Take $x[n]=1$, so $y_1[n]=(-1)^{n}$. The shifted input $x[n-1]=1$ gives $(-1)^{n}$ again. But $y_1[n-1]=(-1)^{n-1}=-(-1)^{n}$.'},
      lin:{v:true, arg:'Multiplication by the fixed sequence $(-1)^{n}$ is linear in $x$.'} } },

    { tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-2k]', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'The sum puts $x[k]$ at $n=2k$ and zero at every odd $n$. So $y[2]=x[1]$, an input at a different time.'},
      inv:{v:true, arg:'Every input sample appears in the output: $x[n]=y[2n]$.'},
      caus:{v:false,arg:'At $n=-2$ the output is $x[-1]$, and $-1\\gt-2$ is a future time.'},
      stab:{v:true, arg:'Every output sample is an input sample or zero, so $|y[n]|\\le B$.'},
      ti:{v:false, arg:'$x_1[n]=\\delta[n]$ gives $y_1[n]=\\delta[n]$. The delayed input $\\delta[n-1]$ puts its pulse at $n=2\\cdot1$, that is $\\delta[n-2]$. But $y_1[n-1]=\\delta[n-1]$.'},
      lin:{v:true, arg:'$\\sum_{k}\\bigl(a x_1[k]+b x_2[k]\\bigr)\\delta[n-2k]=a y_1[n]+b y_2[n]$.'} } },

    { tex:'y(t)=\\int_{t-2}^{t}x(\\tau)\\,d\\tau', src:'editorial (consistent with pp. 11–14)', p:{
      mem:{v:false,arg:'The output integrates the input over the last two seconds.'},
      inv:{v:false,arg:'Take $x(t)=\\sin(\\pi t)$, with period $2$. Then $y(t)=\\Bigl[-\\tfrac{\\cos(\\pi\\tau)}{\\pi}\\Bigr]_{t-2}^{t}=\\tfrac{\\cos(\\pi t-2\\pi)-\\cos(\\pi t)}{\\pi}=0$, the same output as the zero input.'},
      caus:{v:true, arg:'The window $t-2\\le\\tau\\le t$ contains only present and past times.'},
      stab:{v:true, arg:'$|y(t)|\\le\\int_{t-2}^{t}|x(\\tau)|\\,d\\tau\\le2B$.'},
      ti:{v:true,  arg:'The input $x(t-t_0)$ gives $\\int_{t-2}^{t}x(\\tau-t_0)\\,d\\tau$. Put $\\sigma=\\tau-t_0$: this is $\\int_{t-t_0-2}^{t-t_0}x(\\sigma)\\,d\\sigma=y(t-t_0)$.'},
      lin:{v:true, arg:'Integration over a fixed window is linear.'} } }
  ],


  /* ---- practice questions: open-ended, in the form they are asked in ---- */
  DRILL: []
};
