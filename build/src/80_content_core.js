/* ==========================================================================
   COURSE CONTENT — verified against `Lecture Notes.pdf`.
   This file holds course data only (modules, notation glossary, the system
   catalogue used by Laboratory D, and the property criteria).
   Every entry carries its source page.
   ========================================================================== */
const CONTENT = {

  META: {
    course:'Signals and Systems',
    source:'Lecture Notes.pdf (88 pp.)',
    version:'v1.3 · Modules 0–7, laboratories A–J, practice questions D1–D7, twenty a module',
    date:'2026-07-27',
    language:'Academic English',
    conventions:{
      ctft:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,dt',
      dtft:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}',
      sinc:'Unnormalised: \\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}. Stated explicitly wherever used.',
      energy:'Normalised (R = 1 Ω) energy and power throughout.'
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
    xt:{ s:'x(t)', d:'Continuous-time signal or system input; t ∈ ℝ.', go:'m1-def' },
    xn:{ s:'x[n]', d:'Discrete-time signal or system input; n ∈ ℤ (integer time index).', go:'m1-def' },
    yt:{ s:'y(t), y[n]', d:'System output in continuous and discrete time.', go:'m2-abstraction' },
    ht:{ s:'h(t), h[n]', d:'Impulse response: the output of an LTI system when the input is a unit impulse.', go:'m3-impulse' },
    dt:{ s:'δ(t)', d:'Continuous-time unit impulse (Dirac delta). It is not an ordinary function. It is defined by its sifting action.', go:'m1-ct-impulse' },
    dn:{ s:'δ[n]', d:'Discrete-time unit impulse: 1 at n = 0, zero elsewhere. An ordinary sequence.', go:'m1-dt-impulse' },
    ut:{ s:'u(t)', d:'Continuous-time unit step: 1 for t ≥ 0, 0 otherwise.', go:'m1-ct-impulse' },
    un:{ s:'u[n]', d:'Discrete-time unit step: 1 for n ≥ 0, 0 otherwise.', go:'m1-dt-impulse' },
    Einf:{ s:'E∞', d:'Total energy over an infinite interval (R = 1 normalisation).', go:'m1-energy-inf' },
    Pinf:{ s:'P∞', d:'Time-averaged power over an infinite interval.', go:'m1-power' },
    T0:{ s:'T₀', d:'Fundamental period of a continuous-time periodic signal: the smallest T > 0 with x(t) = x(t+T).', go:'m1-fundamental' },
    N0:{ s:'N₀', d:'Fundamental period of a discrete-time periodic signal: the smallest integer N > 0 with x[n] = x[n+N].', go:'m1-fundamental' },
    w0:{ s:'ω₀', d:'Fundamental angular frequency: 2π/T₀ (rad/s) or 2π/N₀ (rad/sample).', go:'m1-fundamental' },
    conv:{ s:'∗', d:'Convolution operator. Defined only for linear time-invariant systems.', go:'m3-convsum' },
    Cexp:{ s:'C, a, α, β', d:'Complex exponential parameters: x(t) = C e^{at}, x[n] = C e^{βn} = C αⁿ with α = e^{β}.', go:'m1-ct-cexp' },
    Ev:{ s:'Ev{·}, Od{·}', d:'Even and odd parts: Ev{x} = ½[x(t)+x(−t)], Od{x} = ½[x(t)−x(−t)].', go:'m1-evenodd' },
    S:{ s:'S', d:'System operator mapping an input signal to an output signal.', go:'m2-abstraction' }
  },

  /* ---- property criteria used by Laboratory D ---- */
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

  /* ---- system catalogue for Laboratory D; every entry  ---- */
  SYSTEMS: [
    { tex:'y(t)=\\bigl[\\,2x(t)-x^{2}(t)\\,\\bigr]^{2}', src:'p. 11', p:{
      mem:{v:true, arg:'Only $x(t)$ appears. There is no $x(t+1)$, no $x(t-2)$ and no integral. The output at $t$ is a fixed function of the input at $t$.'},
      inv:{v:false,arg:'Let $g(u)=(2u-u^{2})^{2}$. Then $g(1)=1$ and $g(1+\\sqrt2\\,)=\\bigl(2(1+\\sqrt2)-(1+\\sqrt2)^{2}\\bigr)^{2}=1$. Two constant inputs give the same output, so the map is not one-to-one.'},
      caus:{v:true, arg:'A memoryless system is automatically causal: nothing later than $t$ is used.'},
      stab:{v:true, arg:'If $|x(t)|\\le B$ then $|2x-x^{2}|\\le 2B+B^{2}$, so $|y|\\le(2B+B^{2})^{2}\\lt\\infty$.'},
      ti:{v:true,  arg:'The rule contains no explicit $t$. Feeding $x(t-t_0)$ returns $[2x(t-t_0)-x^{2}(t-t_0)]^{2}=y(t-t_0)$.'},
      lin:{v:false,arg:'Squaring is not additive: with $x_1=x_2=1$, $y_1=y_2=1$ but the response to $x_1+x_2=2$ is $[4-4]^{2}=0\\neq y_1+y_2=2$.'} } },

    { tex:'y[n]=x[n-1]', src:'pp. 11–12', p:{
      mem:{v:false,arg:'The output at $n$ uses the sample at $n-1$: a one-step memory.'},
      inv:{v:true, arg:'Inversion formula $x[n]=y[n+1]$; the unit delay is undone by a unit advance.'},
      caus:{v:true, arg:'Only the past sample $x[n-1]$ is used.'},
      stab:{v:true, arg:'$|y[n]|=|x[n-1]|\\le B$.'},
      ti:{v:true,  arg:'Shifting the input by $n_0$ shifts $x[n-1]$ by $n_0$, hence shifts the output by $n_0$.'},
      lin:{v:true, arg:'Delay is additive and homogeneous: $a x_1[n-1]+b x_2[n-1]$ is exactly $a y_1[n]+b y_2[n]$.'} } },

    { tex:'y[n]=x[n]+y[n-1]', src:'p. 11', p:{
      mem:{v:false,arg:'Back-substitution gives $y[n]=\\sum_{k=0}^{\\infty}x[n-k]$, so the output depends on the entire input history.'},
      inv:{v:true, arg:'The first difference recovers the input: $x[n]=y[n]-y[n-1]$.'},
      caus:{v:true, arg:'Only present and past inputs enter the accumulated sum.'},
      stab:{v:false,arg:'Take the bounded input $x[n]=u[n]$, $|x|\\le1$. Then $y[n]=n+1\\to\\infty$: bounded input, unbounded output.'},
      ti:{v:true,  arg:'The recursion has constant coefficients and no explicit $n$. Starting from rest, delaying the input delays the whole output by the same amount.'},
      lin:{v:true, arg:'The accumulation $\\sum_{k\\ge0}x[n-k]$ is a linear operation on $x$ (assuming initial rest).'} } },

    { tex:'y(t)=\\bigl[\\cos(t)+2\\bigr]\\,x(t)', src:'p. 12', p:{
      mem:{v:true, arg:'Only $x(t)$ appears; $\\cos(t)+2$ is a known deterministic gain.'},
      inv:{v:true, arg:'Since $\\cos(t)+2\\ge1\\gt0$ for every $t$, the gain never vanishes and $x(t)=\\dfrac{y(t)}{\\cos(t)+2}$.'},
      caus:{v:true, arg:'Memoryless ⇒ causal.'},
      stab:{v:true, arg:'$|y(t)|\\le 3|x(t)|\\le 3B$.'},
      ti:{v:false, arg:'The gain depends on $t$. Take $x(t)=1$, which gives $y_1(t)=\\cos t+2$. The shifted input $x(t-t_0)=1$ is the same constant, so it gives $\\cos t+2$ again. But $y_1(t-t_0)=\\cos(t-t_0)+2$. The two differ unless $t_0=2\\pi k$.'},
      lin:{v:true, arg:'Multiplication by a fixed function of $t$ is linear in $x$.'} } },

    { tex:'y(t)=x^{2}(t)', src:'p. 12', p:{
      mem:{v:true, arg:'The output at $t$ uses only $x(t)$.'},
      inv:{v:false,arg:'Counterexample: $x_1(t)=1$ and $x_2(t)=-1$ are distinct inputs, yet $y_1(t)=y_2(t)=1$.'},
      caus:{v:true, arg:'Memoryless ⇒ causal.'},
      stab:{v:true, arg:'$|y|\\le B^{2}\\lt\\infty$.'},
      ti:{v:true,  arg:'No explicit $t$ appears.'},
      lin:{v:false,arg:'$(x_1+x_2)^{2}=x_1^{2}+2x_1x_2+x_2^{2}$; the cross term is not $y_1+y_2$.'} } },

    { tex:'y[n]=x[-n]', src:'p. 12', p:{
      mem:{v:false,arg:'For $n\\neq0$ the output at $n$ uses the input at $-n$, a different instant.'},
      inv:{v:true, arg:'Time reversal is its own inverse: applying it twice returns $x[n]$.'},
      caus:{v:false,arg:'Counterexample: $y[-1]=x[1]$ — the output at $n=-1$ requires a future input.'},
      stab:{v:true, arg:'$|y[n]|=|x[-n]|\\le B$.'},
      ti:{v:false, arg:'With $x_1[n]=\\delta[n-1]$, $y_1[n]=\\delta[-n-1]=\\delta[n+1]$. Delaying the input by 1 gives $x_2[n]=\\delta[n-2]$ and $y_2[n]=\\delta[n+2]$, but $y_1[n-1]=\\delta[n]$. They differ.'},
      lin:{v:true, arg:'Reversal maps $a x_1[n]+b x_2[n]$ to $a x_1[-n]+b x_2[-n]$.'} } },

    { tex:'y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,d\\tau', src:'p. 12', p:{
      mem:{v:false,arg:'The entire past of the input is integrated.'},
      inv:{v:true, arg:'Differentiation inverts integration: $x(t)=\\dfrac{dy}{dt}$.'},
      caus:{v:true, arg:'The upper limit is $t$, so only $\\tau\\le t$ contributes.'},
      stab:{v:false,arg:'For the bounded input $x(t)=u(t)$ the output is $y(t)=t\\,u(t)$, which is unbounded.'},
      ti:{v:true,  arg:'A change of variable shows that delaying the input delays the integral by the same amount.'},
      lin:{v:true, arg:'Integration is linear.'} } },

    { tex:'y(t)=2x^{2}(t-1)+x(3t)', src:'p. 12', p:{
      mem:{v:false,arg:'Both $x(t-1)$ and $x(3t)$ are evaluated away from $t$.'},
      inv:{v:false,arg:'The squared term removes sign information, so two different inputs can give the same output.'},
      caus:{v:false,arg:'For $t\\gt0$ the term $x(3t)$ needs a future value. At $t=1$ the output uses $x(3)$.'},
      stab:{v:true, arg:'Proof: $|y|\\le 2|x^{2}(t-1)|+|x(3t)|\\le 2B^{2}+B\\lt\\infty$ by the triangle inequality.'},
      ti:{v:false, arg:'The time-scaled term breaks it: the response to $x(t-t_0)$ contains $x(3t-t_0)$, whereas $y(t-t_0)$ contains $x(3t-3t_0)$.'},
      lin:{v:false,arg:'The squared term is not additive.'} } },

    { tex:'y[n]=\\sum_{k=-\\infty}^{n}x[k]', src:'p. 13', p:{
      mem:{v:false,arg:'All past samples are accumulated.'},
      inv:{v:true, arg:'First difference: $x[n]=y[n]-y[n-1]$.'},
      caus:{v:true, arg:'The summation stops at $k=n$.'},
      stab:{v:false,arg:'Proof: $x[n]=u[n]$ gives $|x[n]|\\le1$ but $y[n]=\\sum_{k=0}^{n}1=n+1\\to\\infty$.'},
      ti:{v:true,  arg:'Shifting the input shifts the accumulated sum identically.'},
      lin:{v:true, arg:'Summation is linear.'} } },

    { tex:'y(t)=\\sin\\bigl(x(t)\\bigr)', src:'p. 13', p:{
      mem:{v:true, arg:'Only $x(t)$ enters.'},
      inv:{v:false,arg:'$\\sin$ is not one-to-one on ℝ: constant inputs $0$ and $\\pi$ both give $y=0$.'},
      caus:{v:true, arg:'Memoryless ⇒ causal.'},
      stab:{v:true, arg:'$|y|\\le1$ for every input, bounded or not.'},
      ti:{v:true,  arg:'Proof: $y_2(t)=\\sin(x_1(t-t_0))=y_1(t-t_0)$.'},
      lin:{v:false,arg:'$\\sin(a+b)\\neq\\sin a+\\sin b$ in general; e.g. $a=b=\\pi/2$ gives $0$ versus $2$.'} } },

    { tex:'y[n]=n\\,x[n]', src:'p. 13', p:{
      mem:{v:true, arg:'The output at $n$ uses only $x[n]$; the factor $n$ is a known coefficient, not a memory.'},
      inv:{v:false,arg:'At $n=0$ the output is 0 regardless of $x[0]$, so $x[0]$ cannot be recovered.'},
      caus:{v:true, arg:'Memoryless ⇒ causal.'},
      stab:{v:false,arg:'$x[n]=1$ is bounded but $y[n]=n$ grows without bound.'},
      ti:{v:false, arg:'Counterexample: $x_1[n]=\\delta[n]\\Rightarrow y_1[n]=n\\delta[n]=0$; $x_2[n]=\\delta[n-1]\\Rightarrow y_2[n]=n\\delta[n-1]=\\delta[n-1]$. But $y_1[n-1]=0\\neq y_2[n]$.'},
      lin:{v:true, arg:'Multiplication by the fixed sequence $n$ is linear in $x$.'} } },

    { tex:'y[n]=\\bigl(x[2n]\\bigr)^{2}', src:'p. 14', p:{
      mem:{v:false,arg:'For $n\\neq0$ the output at $n$ uses the sample at $2n$.'},
      inv:{v:false,arg:'Squaring loses the sign, and keeping only even indices discards the odd-indexed samples.'},
      caus:{v:false,arg:'At $n=1$ the output needs $x[2]$, a future sample.'},
      stab:{v:true, arg:'$|y[n]|\\le B^{2}$.'},
      ti:{v:false, arg:'Keeping only every second sample is not time invariant. Delaying the input by one sample does not delay $x[2n]$ by one sample.'},
      lin:{v:false,arg:'Proof: $(a x_1[2n]+b x_2[2n])^{2}$ contains the cross term $2ab\\,x_1[2n]x_2[2n]$, which is absent from $a y_1[n]+b y_2[n]$.'} } },

    { tex:'y(t)=2\\pi\\,x(t)', src:'p. 14', p:{
      mem:{v:true, arg:'Pure gain.'},
      inv:{v:true, arg:'$x(t)=y(t)/2\\pi$.'},
      caus:{v:true, arg:'Memoryless ⇒ causal.'},
      stab:{v:true, arg:'$|y|\\le 2\\pi B$.'},
      ti:{v:true,  arg:'No explicit $t$.'},
      lin:{v:true, arg:'Proof: $y_3=2\\pi(ax_1+bx_2)=a\\,2\\pi x_1+b\\,2\\pi x_2=ay_1+by_2$. This system is LTI.'} } }
  ],


  /* ---- practice questions: open-ended, in the form they are asked in ----
     DRILL holds the questions themselves, one flat array populated by the
     module drill files. DRILLTYPES holds, per module, the recurring question
     types those questions are drawn from: what each type asks for, the method
     that answers it, and the scene where that method is taught. */
  DRILL: [],
  DRILLTYPES: {}
};
