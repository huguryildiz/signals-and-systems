/* ==========================================================================
   Practice questions — Module 2.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

/* ======================================================================
   MODULE 2 — Systems and Their Properties
   ====================================================================== */

CONTENT.DRILLTYPES.M2 = [
  { k:'p-nonlin', name:'A nonlinearity applied to the input',
    asks:'The rule squares, multiplies, rectifies or exponentiates. Linearity is the property at risk.',
    method:['Test homogeneity first: is the response to $ax$ equal to $a$ times the response to $x$?',
            'One constant input and one scale factor is usually enough to break it.',
            'A nonlinearity does not by itself break time invariance, causality or stability.',
            'Bound the output from a bound on the input to settle stability in one line.'],
    go:'m2-linear' },
  { k:'p-accum', name:'Accumulation, integration or differencing',
    asks:'The rule sums or integrates the input, or takes a difference of neighbouring values. Memory and stability are the properties at risk.',
    method:['Write the output as an explicit sum or integral with its limits.',
            'The limits decide memory and causality: an upper limit above the present time is not causal.',
            'For stability, bound the output when $|x|\\le B$. A finite window gives a finite bound.',
            'An unbounded window needs a counterexample, and $x=u$ is almost always the one — unless the weights inside the window decay fast enough to sum to something finite on their own.'],
    go:'m2-stable' },
  { k:'p-gain', name:'An explicitly time-dependent gain',
    asks:'The rule multiplies the input by a known function of $t$ or $n$. Time invariance is the property at risk.',
    method:['Linearity survives: multiplication by a fixed function is linear in $x$.',
            'For time invariance, compute the response to $x(t-t_0)$ and compare it with $y(t-t_0)$.',
            'A gain that grows without bound also breaks stability. A bounded gain does not.',
            'Name a specific $x$ and a specific $t_0$ in the counterexample.'],
    go:'m2-ti-b' },
  { k:'p-argop', name:'An operation on the time argument',
    asks:'The rule shifts, scales or reverses the argument of the input. Causality and time invariance are the properties at risk.',
    method:['Find one instant where the output uses an input from later than that instant.',
            'For time invariance, remember that a scaled argument rescales any shift you apply.',
            'Linearity always survives an operation on the argument alone.',
            'Stability also survives: the output only ever reuses input values.'],
    go:'m2-causal' },
  { k:'p-connect', name:'Interconnection: series, parallel and feedback',
    asks:'The system is built by combining other systems — in series, in parallel, or with feedback — or by inverting one. Read the diagram or the composition rule before testing anything.',
    method:['In series, substitute the first relation into the second before testing any property on the result.',
            'In parallel, the outputs add. A property that survives addition survives the connection.',
            'In feedback, the relation is implicit. Iterate it, or solve it, before anything else — stability of a feedback loop usually comes down to a condition on the loop gain.',
            'For invertibility, find an inversion formula that works for every input, or find two distinct inputs that share one output.'],
    go:'m2-invertible' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D2-01', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=\\cos\\!\\big(x(t)\\big).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer. An unjustified answer receives no credit.'],
  sol:'<b>Given.</b> A memoryless cosine nonlinearity.<br>'
     +'<b>Find.</b> The five properties, each with a proof or a counterexample.<br>'
     +'<b>Method.</b> Test homogeneity first, since a bounded nonlinear function of the input is the likeliest place for linearity to fail; the zero-input value is the fastest check. The remaining four properties are read directly from the rule: no explicit $t$, no shifted or scaled argument, and a bound already built into the function.<br>'
     +'<b>Solution — memoryless.</b> The output at $t$ is a fixed function of $x(t)$ alone. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> $S\\{0\\}=\\cos(0)=1\\neq0$, so the zero input does not give the zero output. <b>Not linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $t$ appears in the rule. Feeding $x(t-t_0)$ gives $\\cos\\big(x(t-t_0)\\big)=y(t-t_0)$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> A memoryless system is automatically causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> For every real number $u$, $|\\cos u|\\le1$, so $|y(t)|\\le1$ for every input, bounded or not. <b>Stable.</b><br>'
     +'<b>Check.</b> A second, independent instance of the homogeneity failure: $x(t)=\\pi/2$ gives $y=\\cos(\\pi/2)=0$; scaling the input by $a=2$ gives $x=\\pi$ and $y=\\cos(\\pi)=-1$, while $a\\,y=2\\cdot0=0$. Since $-1\\neq0$, linearity fails a second way, independently of the zero-input test used above. The stability bound needs no assumption on $x$ at all, because $\\cos$ is bounded on the whole real line — a stronger statement than BIBO stability asks for, and a fast way to confirm it.',
  err:'Testing homogeneity only near $x=0$, where $\\cos$ is close to flat, and concluding the system is close to linear. Linearity is exact or it is absent; there is no partial credit for a function that looks flat near the origin.',
  teach:'Ask for the zero-input value before anything else is computed. A nonlinearity built from $\\cos$, $\\sin$ or $e^{(\\cdot)}$ almost always fails this one-line test.' },

{ id:'D2-02', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[n]\\,x[n+1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A product of the present input with the next one.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> A product of two different samples is memoryless only if the two indices coincide, which they do not here; test homogeneity for linearity, and read causality directly from which index is larger.<br>'
     +'<b>Solution — memoryless.</b> The output at $n$ uses $x[n+1]$, a sample at a different instant. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Let $x[n]=1$ for every $n$, so $y[n]=1\\cdot1=1$. Scaling by $a=2$ gives $x[n]=2$ and $y[n]=2\\cdot2=4$, while $a\\,y[n]=2\\cdot1=2$. Since $4\\neq2$, homogeneity fails. <b>Not linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $n$ appears. Feeding $x[n-n_0]$ gives $x[n-n_0]\\,x[n-n_0+1]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y[0]=x[0]\\,x[1]$ uses $x[1]$, and $1>0$: the output at $n=0$ needs an input from the future. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x[n]|\\le B$ then $|y[n]|=|x[n]||x[n+1]|\\le B^{2}<\\infty$. <b>Stable.</b><br>'
     +'<b>Check.</b> The homogeneity failure holds for a second scale factor too: with $x[n]=1$ and $a=3$, $S\\{3x\\}[n]=3\\cdot3=9\\neq3\\cdot1=3$. The causality failure is not confined to $n=0$: at $n=-4$, $y[-4]=x[-4]\\,x[-3]$ uses $x[-3]$, and $-3>-4$, so the same failure recurs at every instant. For stability, the bound is tight: with $B=5$ and $x[n]=5$ for every $n$, $y[n]=25=B^{2}$ exactly.',
  err:'Reading $x[n+1]$ as an earlier sample because it sits to the right of $x[n]$ in the formula. The index $n+1$ names a later instant, whatever position it occupies on the page.',
  teach:'Contrast this with $y[n]=x[n]x[n-1]$, which is causal. The only difference between the two rules is the sign in the second index, and it is worth making a student compute both to see how little separates a causal system from a non-causal one.' },

{ id:'D2-03', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x^{3}(t)-x(t).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A cubic nonlinearity.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Test homogeneity with a constant input and a numerical scale factor; bound the output with the triangle inequality using a general bound $B$, not one number.<br>'
     +'<b>Solution — memoryless.</b> Only $x(t)$ appears. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> Let $x(t)=1$ for every $t$, so $y(t)=1-1=0$. Scaling by $a=2$ gives $x(t)=2$ and $y(t)=8-2=6$, while $a\\,y(t)=2\\cdot0=0$. Since $6\\neq0$, homogeneity fails. <b>Not linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $t$ appears. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> Memoryless implies causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x(t)|\\le B$, then by the triangle inequality $|y(t)|=|x^{3}(t)-x(t)|\\le|x(t)|^{3}+|x(t)|\\le B^{3}+B<\\infty$. <b>Stable.</b><br>'
     +'<b>Check.</b> A second homogeneity failure, with $a=3$: $x(t)=2$ gives $y=8-2=6$; scaling by $3$ gives $x=6$ and $y=216-6=210$, while $a\\,y=3\\cdot6=18$. Since $210\\neq18$, the failure is confirmed by an unrelated pair of numbers. The stability bound holds without exception, because $B^{3}+B\\ge0$ and $B^3+B\\ge |B^3-B|$ for every $B\\ge0$, which is exactly the triangle inequality used above, checked at the boundary value $x=B$ itself.',
  err:'Reporting the system as linear because $-x(t)$ alone is linear, and treating the cubic term as a small correction. Any nonzero coefficient on $x^{3}(t)$ breaks linearity outright; there is no notion of a system being mostly linear.',
  teach:'Ask for the stability bound to be produced symbolically, in terms of $B$, rather than checked at one numerical value of $x$. A proof of stability has to hold for every bounded input, and a general $B$ is what makes that visible.' },

{ id:'D2-04', module:'M2', type:'p-nonlin',
  stem:'Two memoryless systems: $$\\text{(i)}\\;\\;y(t)=x^{3}(t),\\qquad\\text{(ii)}\\;\\;z[n]=x[n]\\,x[n-2].$$',
  parts:['Determine whether system (i) is invertible. Give the inverse relation if it is.',
         'Determine whether system (ii) is invertible. Give an explicit counterexample if it is not.',
         'In one sentence, say why raising the input to an odd power preserves invertibility while forming a product of two different samples generally does not.'],
  sol:'<b>Given.</b> A cube, and a two-sample product.<br>'
     +'<b>Find.</b> Whether each map from input to output is one-to-one.<br>'
     +'<b>Method.</b> Invertibility asks whether distinct inputs can share an output. A strictly monotonic function of a single value never repeats an output, so it is invertible; a product of two different samples can repeat an output in many ways, because scale and sign can be traded between the two factors.<br>'
     +'<b>Solution — part (a).</b> The cube is strictly increasing on the reals: if $x_1<x_2$ then $x_1^{3}<x_2^{3}$, so distinct inputs give distinct outputs at every $t$. <b>Invertible</b>, with inverse $x(t)=\\sqrt[3]{y(t)}$, the real cube root, defined for every real $y(t)$.<br>'
     +'<b>Solution — part (b).</b> Take $x_1[n]=1$ for every $n$, giving $z_1[n]=1\\cdot1=1$ for every $n$. Take $x_2[n]=(-1)^{n}$, giving $z_2[n]=(-1)^{n}(-1)^{n-2}=(-1)^{2n-2}=1$ for every $n$, since $2n-2$ is always even. So $z_1=z_2$ as sequences, yet $x_1[1]=1\\neq-1=x_2[1]$. <b>Not invertible.</b><br>'
     +'<b>Solution — part (c).</b> An odd power is a strictly monotonic function of one value and so never repeats; a product of two different samples can equal the same number for many different pairs of factors, because a sign or a scale on one factor can be undone by the other.<br>'
     +'<b>Check.</b> The identity behind part (b) holds at every index, confirmed away from $n=1$: at $n=-3$, $(-1)^{-3}(-1)^{-5}=(-1)\\cdot(-1)=1$, and at $n=4$, $1\\cdot1=1$. The two sequences are still distinct, because they disagree at every odd index, not only at $n=1$: at $n=3$, $x_1[3]=1$ while $x_2[3]=-1$. For part (a), injectivity of the cube is confirmed on a pair of numbers not used above: $(-2)^3=-8\\neq27=3^3$.',
  err:'Concluding that system (ii) is invertible because $x[n]$ can, in principle, be recovered from $z[n]$ at most indices by dividing by $x[n-2]$ — which is circular, since $x[n-2]$ is itself unknown. An inversion formula has to produce the input from the output alone.',
  teach:'Ask for the counterexample in part (b) to be checked at more than one index before it is accepted. A single matching index is not enough to establish that two whole sequences coincide.' },

{ id:'D2-05', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=\\sum_{k=n-3}^{n}x[k].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A four-sample causal sliding sum.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Write the output as an explicit finite sum with its limits; the limits alone settle memory and causality, and a finite sum of input samples is always linear and always boundable.<br>'
     +'<b>Solution — memoryless.</b> The output at $n$ uses four samples, three of them at earlier instants. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> A finite sum of input values is linear: the response to $ax_1[n]+bx_2[n]$ is $\\sum_{k=n-3}^{n}\\big(ax_1[k]+bx_2[k]\\big)=a\\,y_1[n]+b\\,y_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Feed $x[n-n_0]$ and substitute $m=k-n_0$:$$\\sum_{k=n-3}^{n}x[k-n_0]=\\sum_{m=n-n_0-3}^{n-n_0}x[m]=y[n-n_0].$$<b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> The upper limit is $n$: no sample later than the present is used. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x[k]|\\le B$ for every $k$, then $|y[n]|\\le4B<\\infty$: four terms, each bounded. <b>Stable.</b><br>'
     +'<b>Check.</b> A numerical instance of the substitution: with $x[n]=n$ for $0\\le n\\le6$ and zero elsewhere, $y[5]=x[2]+x[3]+x[4]+x[5]=2+3+4+5=14$. Shifting the input by $n_0=2$, so $\\tilde x[n]=x[n-2]$, gives $\\tilde y[7]=\\tilde x[4]+\\tilde x[5]+\\tilde x[6]+\\tilde x[7]=x[2]+x[3]+x[4]+x[5]=14$ as well, matching $y[5]$ exactly, as the shift proof predicts. The bound is tight: with $x[k]=B$ for every $k$, $y[n]=4B$ exactly.',
  err:'Writing the limits as $k=n$ to $n+3$, reversing which end is fixed. The sum has to read backward from the present for the system to be causal at all.',
  teach:'Ask for the substitution $m=k-n_0$ to be written out fully. A student who only asserts the shift property has not shown that the limits transform correctly.' },

{ id:'D2-06', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=\\int_{0}^{t}x(\\tau)\\,d\\tau.$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> An integrator with a fixed lower limit at the origin, rather than at $-\\infty$ or at $t-1$.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> A fixed lower limit does not affect linearity, but it needs care everywhere else: work out which interval of $\\tau$ actually enters the integral for $t>0$, and separately for $t<0$, where the limits swap order.<br>'
     +'<b>Solution — memoryless.</b> The output at $t$ depends on $x(\\tau)$ over an interval, not on $x(t)$ alone. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> For fixed $t$, $y(t)=\\int_0^t x(\\tau)\\,d\\tau$ is linear in $x$: the response to $ax_1+bx_2$ is $a\\int_0^tx_1\\,d\\tau+b\\int_0^tx_2\\,d\\tau=ay_1(t)+by_2(t)$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Take $x_1(t)=u(t+1)$, so $y_1(t)=\\int_0^tu(\\tau+1)\\,d\\tau$ equals $t$ for $t\\ge-1$ and $-1$ for $t<-1$. Shift by $t_0=1$: since $x_1(t-1)=u(t)$, the shifted input is $x_2(t)=u(t)$, and $S\\{x_2\\}(t)=\\int_0^tu(\\tau)\\,d\\tau$ equals $t$ for $t\\ge0$ and $0$ for $t<0$. At $t=0$: $S\\{x_2\\}(0)=0$, while $y_1(0-1)=y_1(-1)=-1$. Since $0\\neq-1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> For $t<0$, $y(t)=\\int_0^tx(\\tau)\\,d\\tau=-\\int_t^0x(\\tau)\\,d\\tau$ depends on $x(\\tau)$ for $\\tau\\in[t,0]$, which includes instants later than $t$. At $t=-1$, $y(-1)$ depends on $x(-0.5)$, and $-0.5>-1$. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> Take $x(t)=1$ for every $t$, bounded by $B=1$. Then $y(t)=\\int_0^t1\\,d\\tau=t$, which grows without bound as $t\\to\\infty$. <b>Not stable.</b><br>'
     +'<b>Check.</b> Only linearity survives, and it is the one property the fixed lower limit never touches: fixing the lower limit at $0$ instead of at $-\\infty$ or at $t-1$ changes which interval of $\\tau$ is read, but never how $y(t)$ depends on $x$ over a fixed interval. The other four failures share one cause: a lower limit fixed at an absolute instant is itself an explicit use of time, and $t=0$ has no special status for a system that is meant to treat every instant alike.',
  err:'Assuming the lower limit fixed at $0$ behaves like a lower limit fixed at $-\\infty$, and reporting the system as causal and stable on that analogy. A lower limit fixed at an absolute instant is itself an explicit dependence on time, and it costs both properties here.',
  teach:'Ask what changes if the lower limit is moved to $t-1$ instead of $0$. The resulting sliding window is time invariant, causal and stable; the only thing that changed is which instant the lower limit is measured from, and that is the whole lesson.' },

{ id:'D2-07', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}x[k].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A causal accumulator whose memory decays geometrically into the past.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Write $j=n-k$ so the weight is $(1/2)^{j}$ for $j\\ge0$; summing the weights themselves, rather than assuming an infinite window is automatically unstable, is what settles stability here.<br>'
     +'<b>Solution — memoryless.</b> The sum reaches back to $k=-\\infty$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> A sum of weighted input values is linear in $x$, exactly as for any finite sum. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Feed $x[n-n_0]$ and substitute $m=k-n_0$:$$\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}x[k-n_0]=\\sum_{m=-\\infty}^{n-n_0}\\left(\\tfrac12\\right)^{\\!(n-n_0)-m}x[m]=y[n-n_0].$$<b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> The sum runs only over $k\\le n$. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x[k]|\\le B$ for every $k$, then, writing $j=n-k$,$$|y[n]|\\le B\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}=B\\sum_{j=0}^{\\infty}\\left(\\tfrac12\\right)^{\\!j}=2B<\\infty.$$<b>Stable.</b><br>'
     +'<b>Check.</b> The plain accumulator, with every past sample weighted equally, is unstable — a bounded step input gives an output that grows like $n$. Here the weights themselves form a convergent geometric series, $\\sum_{j\\ge0}(1/2)^j=2$, and that single fact keeps the output finite however far the memory reaches back. A numerical instance: for $x[k]=B$ constant, $y[n]=B\\sum_{j=0}^\\infty(1/2)^j=2B$ exactly, matching the bound with no slack, and the partial sums over $j=0,\\dots,20$ already agree with $2B$ to five decimal places.',
  err:'Declaring the system unstable on sight, because the sum reaches back to $k=-\\infty$. An infinite window is not automatically unstable; what matters is whether the weights themselves sum to something finite, and here they do.',
  teach:'Pair this system with the plain running sum taught earlier in the module. Both have infinite memory, and only one is stable — the geometric weight is the entire difference, and it is worth making that comparison explicit.' },

{ id:'D2-08', module:'M2', type:'p-accum',
  stem:'The running sum $$y[n]=\\sum_{k=-\\infty}^{n}x[k]$$ is unstable in general. A particular input is $$x[n]=\\left(\\tfrac13\\right)^{\\!n}u[n].$$',
  parts:['Verify that $x[n]$ is bounded, and find a closed form for $y[n]$ valid for $n\\ge0$.',
         'Show that this particular response is itself a bounded sequence.',
         'Explain why part (b) does not establish that the system is BIBO stable, and produce a single bounded input whose response is unbounded.',
         'State, in one sentence, the general distinction between a property of a system and a property of one of its responses.'],
  sol:'<b>Given.</b> The running sum, and one specific decaying input.<br>'
     +'<b>Find.</b> Whether one well-behaved response can stand in for a proof of stability.<br>'
     +'<b>Method.</b> Compute the one response asked for, confirm it is bounded, and then recall what BIBO stability actually claims: a bound for every bounded input, not for a single favourable one.<br>'
     +'<b>Solution — part (a).</b> $x[n]=(1/3)^n$ for $n\\ge0$ and $0$ for $n<0$, so $|x[n]|\\le1$ for every $n$: bounded, with $B=1$. For $n\\ge0$,$$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac13\\right)^{\\!k}=\\frac{1-(1/3)^{n+1}}{1-1/3}=\\frac32\\left(1-\\left(\\tfrac13\\right)^{\\!n+1}\\right).$$'
     +'<b>Solution — part (b).</b> Since $0<(1/3)^{n+1}\\le1/3$ for $n\\ge0$, $y[n]$ increases from $y[0]=1$ toward $3/2$, and $0\\le y[n]<3/2$ for every $n\\ge0$, while $y[n]=0$ for $n<0$. This particular response is bounded.<br>'
     +'<b>Solution — part (c).</b> BIBO stability requires every bounded input to produce a bounded output; one well-behaved example, however cleanly it works out, cannot establish a claim that is quantified over all inputs. The standard counterexample still applies: $x[n]=u[n]$ is bounded by $1$, and $y[n]=\\sum_{k=0}^{n}1=n+1\\to\\infty$ as $n\\to\\infty$. The system is <b>not stable</b>.<br>'
     +'<b>Solution — part (d).</b> Stability is a property of the system, quantified over every input it could ever receive; whether one particular response happens to be bounded is a property of that response alone, and says nothing about the responses to every other input.<br>'
     +'<b>Check.</b> The closed form in part (a), checked at $n=2$: direct summation gives $1+\\tfrac13+\\tfrac19=\\tfrac{13}{9}$, and the formula gives $\\tfrac32\\big(1-(1/3)^3\\big)=\\tfrac32\\cdot\\tfrac{26}{27}=\\tfrac{13}{9}$, matching. As $n\\to\\infty$, $y[n]\\to3/2$, consistent with part (b). For part (c), the counterexample recomputed at $n=99$ gives $y[99]=100$, already a hundred times the bound on the input, with no ceiling in sight.',
  err:'Treating the bounded response found in part (b) as a proof that the system is stable, rather than as one example that happens to behave well. A single response, however clean, is never a substitute for the universal claim BIBO stability makes.',
  teach:'Ask for the counterexample in part (c) before accepting the conclusion of part (b). A student who cannot immediately produce $x[n]=u[n]$ has not internalised the earlier result and is at risk of reusing this flawed reasoning elsewhere.' },

{ id:'D2-09', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=e^{-t}x(t).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A memoryless gain that decays with $t$.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Multiplication by a fixed function of $t$ is always linear; the two properties actually at risk from an explicit $t$ are time invariance and, wherever the gain is unbounded, stability.<br>'
     +'<b>Solution — memoryless.</b> Only $x(t)$ appears. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> The response to $ax_1(t)+bx_2(t)$ is $e^{-t}\\big(ax_1(t)+bx_2(t)\\big)=a\\,y_1(t)+b\\,y_2(t)$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=1$ for every $t$, so $y_1(t)=e^{-t}$. Shift by $t_0=1$: since $x_1$ is constant, the shifted signal is again $x_2(t)=1$, and $S\\{x_2\\}(t)=e^{-t}$. But $y_1(t-1)=e^{-(t-1)}=e^{1-t}$. Since $e^{-t}\\neq e^{1-t}$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> Memoryless implies causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> Take $x(t)=1$, bounded by $B=1$. Then $y(t)=e^{-t}\\to\\infty$ as $t\\to-\\infty$. <b>Not stable.</b><br>'
     +'<b>Check.</b> At $t=0$, $e^{-0}=1$ while $e^{1-0}=e\\approx2.718$: the two sides of the time-invariance test already disagree at a single convenient point. For stability, $e^{-t}$ at $t=-20$ is $e^{20}\\approx4.85\\times10^{8}$, confirming the blow-up numerically rather than only in the limit. The two failures share one cause: the gain $e^{-t}$ depends on absolute time and is unbounded on one side of the axis.',
  err:'Concluding the system is stable because $e^{-t}\\to0$ as $t\\to\\infty$. Boundedness has to hold on the whole axis, and the same gain diverges on the other side of it.',
  teach:'Ask for the time-invariance counterexample to be built with a constant input before anything more elaborate is tried. A constant input isolates the gain from everything else in the rule and is usually the fastest route to a counterexample for this type.' },

{ id:'D2-10', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=2^{-|n|}x[n].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A memoryless gain that decays away from $n=0$ in both directions.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> The same explicit-index gain that breaks time invariance here has a bounded range, $0<2^{-|n|}\\le1$, and a bounded gain cannot break stability.<br>'
     +'<b>Solution — memoryless.</b> Only $x[n]$ appears. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> Multiplication by a fixed sequence is linear: $2^{-|n|}\\big(ax_1[n]+bx_2[n]\\big)=a\\,y_1[n]+b\\,y_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1[n]=\\delta[n]$, so $y_1[n]=2^{-|n|}\\delta[n]=\\delta[n]$, since the gain equals $1$ exactly where $\\delta[n]$ is nonzero. Shift by $n_0=1$: $x_2[n]=\\delta[n-1]$, and $S\\{x_2\\}[n]=2^{-|n|}\\delta[n-1]$, which is $2^{-1}=\\tfrac12$ at $n=1$ and $0$ elsewhere. But $y_1[n-1]=\\delta[n-1]$, which is $1$ at $n=1$. Since $\\tfrac12\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> Memoryless implies causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> Since $0<2^{-|n|}\\le1$ for every integer $n$, if $|x[n]|\\le B$ then $|y[n]|=2^{-|n|}|x[n]|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The gain values used above: $2^{-|0|}=1$, $2^{-|1|}=0.5$, $2^{-|-1|}=0.5$, $2^{-|5|}=1/32=0.03125$ — every one at most $1$, confirming the bound used for stability independently of the time-invariance argument. A gain that is unbounded in one direction, as in the previous system, breaks stability as well as time invariance; a gain that stays within $[0,1]$, as here, breaks only time invariance.',
  err:'Concluding the system is time invariant because the gain is bounded. Boundedness of a gain protects stability; it does nothing for time invariance, which fails whenever the gain depends explicitly on the index at all.',
  teach:'Ask which property a bounded time-varying gain can and cannot save. It always costs time invariance and never costs stability, and conflating the two questions is the most common mistake with this type of rule.' },

{ id:'D2-11', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x(t)\\cos(\\pi t)+x(t-1).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A time-varying gain added to a fixed delay.<br>'
     +'<b>Find.</b> The five properties of the combination.<br>'
     +'<b>Method.</b> Each term is linear on its own, so the sum is linear; test time invariance directly on the sum, since a term that fails it can break the whole system even when added to a term that would pass alone.<br>'
     +'<b>Solution — memoryless.</b> The term $x(t-1)$ uses an instant other than $t$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Multiplication by $\\cos(\\pi t)$ and a pure delay are each linear in $x$, and a sum of two linear operations is linear. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=1$ for every $t$, so $y_1(t)=\\cos(\\pi t)+1$. Shift by $t_0=0.5$: since $x_1$ is constant, the shifted signal is again $x_2(t)=1$, and $S\\{x_2\\}(t)=\\cos(\\pi t)+1$. But $y_1(t-0.5)=\\cos\\big(\\pi(t-0.5)\\big)+1$. At $t=0$: $S\\{x_2\\}(0)=\\cos(0)+1=2$, while $y_1(-0.5)=\\cos(-\\pi/2)+1=0+1=1$. Since $2\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> The two instants used are $t$ and $t-1$, both no later than $t$. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x(t)|\\le B$, then $|y(t)|\\le|x(t)||\\cos(\\pi t)|+|x(t-1)|\\le B\\cdot1+B=2B<\\infty$. <b>Stable.</b><br>'
     +'<b>Check.</b> The delay term contributes the same value, $x(t-1)$, to both sides of the time-invariance comparison, since $x_1$ is constant, so the whole mismatch is carried by the gain term alone: $\\cos(0)=1$ against $\\cos(-\\pi/2)=0$, a difference of $1$, exactly the difference found between $2$ and $1$ above.',
  err:'Testing time invariance on the delay term alone, finding it holds, and reporting the whole system as time invariant. Every term in a sum has to pass the test; one term failing is enough to fail the sum.',
  teach:'Ask the student to test each term of the sum separately before testing the sum as a whole. Seeing that the delay term alone would pass makes clear that the failure is entirely local to the gain term.' },

{ id:'D2-12', module:'M2', type:'p-gain',
  stem:'Two systems built from a time-varying gain: $$\\text{(i)}\\;\\;y(t)=(t^{2}+1)\\,x(t),\\qquad\\text{(ii)}\\;\\;y(t)=t\\,x(t).$$',
  parts:['Determine whether system (i) is invertible. Give the inverse relation if it is.',
         'Determine whether system (ii) is invertible. Give an explicit counterexample if it is not.',
         'State the general condition on a gain $g(t)$, in the relation $y(t)=g(t)x(t)$, for the system to be invertible.'],
  sol:'<b>Given.</b> Two memoryless gains, one that never vanishes and one that vanishes once.<br>'
     +'<b>Find.</b> Whether each map from input to output is one-to-one.<br>'
     +'<b>Method.</b> A gain multiplication is invertible exactly where it never sends every input to the same output value $0$; a single instant where the gain is zero erases whatever the input was at that instant.<br>'
     +'<b>Solution — part (a).</b> $t^{2}+1\\ge1>0$ for every real $t$, so the gain never vanishes. <b>Invertible</b>, with inverse $x(t)=\\dfrac{y(t)}{t^{2}+1}$.<br>'
     +'<b>Solution — part (b).</b> At $t=0$ the gain is $0$, so $y(0)=0\\cdot x(0)=0$ regardless of $x(0)$. <b>Not invertible.</b> Counterexample: let $x_1(t)=1$ for every $t$, and let $x_2(t)$ equal $1$ for every $t\\neq0$ and $x_2(0)=5$. Then $y_1(t)=t$ for every $t$, and $y_2(t)=t\\,x_2(t)$ equals $t$ for $t\\neq0$ and $0\\cdot5=0$ for $t=0$ — the same signal, $y_1=y_2$, even though $x_1(0)=1\\neq5=x_2(0)$.<br>'
     +'<b>Solution — part (c).</b> The system $y(t)=g(t)x(t)$ is invertible if and only if $g(t)\\neq0$ for every $t$; the inverse is then $x(t)=y(t)/g(t)$.<br>'
     +'<b>Check.</b> The minimum of $t^{2}+1$ occurs at $t=0$ and equals $1$, confirming the gain in part (a) is bounded away from zero, not merely nonzero at isolated points. For part (b), $y_1$ and $y_2$ agree at $t=\\pm3$, both giving $3$ and $-3$, and agree at $t=0$ as well, both giving $0$ — the two output signals are identical everywhere despite the distinct inputs. The inverse in part (a) recovers the input directly: at $t=2$, $y(2)=5x(2)$, so $x(2)=y(2)/5$.',
  err:'Concluding that system (ii) is not invertible everywhere, and reporting the whole family of gains $g(t)=t+c$ as non-invertible. Only $c=0$ makes the gain vanish; any $c\\neq0$ gives an invertible system, since the gain is then never zero.',
  teach:'Ask for the general condition of part (c) to be checked against both examples before it is trusted. It correctly predicts invertibility for (i) and non-invertibility for (ii) from the single fact of whether $g$ has a zero.' },

{ id:'D2-13', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[n+2].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A pure two-sample advance.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Reading the input at a relocated index never affects linearity or stability; compare the relocated index with the output instant directly to settle memory and causality.<br>'
     +'<b>Solution — memoryless.</b> $n+2\\neq n$ for every $n$, so a different instant is always used. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Reading the input at a relocated index is linear: the response to $ax_1[n]+bx_2[n]$ is $ax_1[n+2]+bx_2[n+2]=ay_1[n]+by_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $n$ appears. Feeding $x[n-n_0]$ gives $x[(n-n_0)+2]=x[(n+2)-n_0]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y[0]=x[2]$, and $2>0$: the output at $n=0$ needs an input from the future. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y[n]|=|x[n+2]|\\le B$ whenever $|x[n]|\\le B$ for every $n$. <b>Stable.</b><br>'
     +'<b>Check.</b> The causality failure holds at every instant, not only at $n=0$: $y[-5]=x[-3]$, and $-3>-5$, so the output is always two steps ahead of what has arrived. The time-invariance identity is confirmed at a second shift, $n_0=3$: $x[(n-3)+2]=x[n-1]$, and $y[n-3]$, obtained by substituting $n-3$ for $n$ in $x[n+2]$, is also $x[n-1]$.',
  err:'Testing causality only at $n=0$ and concluding the failure is a special case tied to that instant. The advance $n+2$ exceeds $n$ for every integer $n$, so the failure is universal, not local.',
  teach:'Ask for the causality counterexample to be restated at an instant other than $n=0$. A student who can only produce the failure at the instant used in the worked example has memorised the answer rather than the argument.' },

{ id:'D2-14', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x(3-t).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A reflection of the time axis combined with a shift.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Reading the input at a relocated instant is always linear; compare $3-t$ with $t$ directly for causality, and test a shift on a genuinely time-varying input for time invariance, since a reflection rescales every shift by $-1$.<br>'
     +'<b>Solution — memoryless.</b> $3-t=t$ only at $t=1.5$; for every other $t$ a different instant is used. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> $ax_1(3-t)+bx_2(3-t)=ay_1(t)+by_2(t)$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=u(t)$, so $y_1(t)=u(3-t)$, equal to $1$ for $t\\le3$ and $0$ for $t>3$. Shift by $t_0=1$: $x_2(t)=x_1(t-1)=u(t-1)$, and $S\\{x_2\\}(t)=x_2(3-t)=u(3-t-1)=u(2-t)$. At $t=3$: $S\\{x_2\\}(3)=u(2-3)=u(-1)=0$. But $y_1(t-1)$ at $t=3$ is $y_1(2)=u(3-2)=u(1)=1$. Since $0\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y(0)=x(3)$, and $3>0$. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y(t)|=|x(3-t)|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The causality failure recurs at every instant with $t<3$: at $t=1$, $y(1)=x(2)$, and $2>1$. The time-invariance mismatch is confirmed at a second instant: at $t=4$, $S\\{x_2\\}(4)=u(2-4)=u(-2)=0$, while $y_1(4-1)=y_1(3)=u(3-3)=u(0)=1$; again $0\\neq1$, so the failure is not a coincidence at $t=3$ alone.',
  err:'Testing causality only for $t>3$, where $3-t<t$, and concluding the system is causal. The inequality reverses for $t<3$, and the definition has to hold for every $t$.',
  teach:'Ask for the general comparison of $3-t$ with $t$, solved as an inequality in $t$, rather than checked at one point. The solution set is the answer, and it also shows the causal region is not the whole axis.' },

{ id:'D2-15', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[3n-1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A compression by a factor of three combined with a shift.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> A compression relocates an impulse to an index that may not be an integer, so it can make an impulse disappear altogether; use that to build the time-invariance counterexample, and solve the inequality $3n-1>n$ directly for causality.<br>'
     +'<b>Solution — memoryless.</b> $3n-1=n$ only when $2n=1$, never for an integer $n$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> $ax_1[3n-1]+bx_2[3n-1]=ay_1[n]+by_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1[n]=\\delta[n-2]$, so $y_1[n]=\\delta[3n-1-2]=\\delta[3n-3]=\\delta\\big[3(n-1)\\big]$, which is $1$ only at $n=1$: $y_1[n]=\\delta[n-1]$. Shift by $n_0=1$: $x_2[n]=\\delta[n-3]$, and $S\\{x_2\\}[n]=\\delta[3n-1-3]=\\delta[3n-4]$, which is never $1$ for an integer $n$, since $3n=4$ has no integer solution. At $n=2$: $S\\{x_2\\}[2]=\\delta[2]=0$, while $y_1[2-1]=y_1[1]=\\delta[0]=1$. Since $0\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> The inequality $3n-1>n$ reduces to $n>\\tfrac12$, so it holds for every integer $n\\ge1$. At $n=1$: $y[1]=x[2]$, and $2>1$. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y[n]|=|x[3n-1]|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The vanishing impulse is confirmed at more than one index: $S\\{x_2\\}[n]=\\delta[3n-4]$ is checked to be $0$ at $n=0,1,2,3$, since $3n-4$ equals $-4,-1,2,5$ at those points, none of them $0$. The causality failure is not confined to $n=1$: at $n=2$, $y[2]=x[5]$, and $5>2$, consistent with the inequality holding for every $n\\ge1$.',
  err:'Treating the disappearance of the impulse in the time-invariance test as an error in the computation and discarding the example. The impulse genuinely disappears, and that is exactly what a compression can do to a shifted input — it is the content of the counterexample, not a mistake in it.',
  teach:'Ask the student to explain, in words, why a compression can make an impulse vanish where a shift or a reflection never could. The relocated index $3n-4$ can skip over every integer where a shift or a reflection only ever relocates one.' },

{ id:'D2-16', module:'M2', type:'p-argop',
  stem:'The block diagram below shows a system built from a one-sample delay and two fixed gains. The direct branch multiplies the input by $3$; the delayed branch multiplies the once-delayed input by $-2$; the two branches are added.',
  figure:()=>P.blocks({w:900,h:280,items:[
    {t:'arrow',x1:60,y1:70,x2:220,y2:70},
    {t:'box',x:220,y:38,w:140,h:64,label:'\\times 3',tex:true},
    {t:'arrow',x1:360,y1:70,x2:520,y2:70},
    {t:'text',x:140,y:56,label:'x[n]',tex:true,fs:16},
    {t:'text',x:460,y:56,label:'3\\,x[n]',tex:true,fs:14,color:C.slate},
    {t:'arrow',x1:60,y1:200,x2:220,y2:200},
    {t:'box',x:220,y:168,w:120,h:64,label:'z^{-1}',tex:true},
    {t:'arrow',x1:340,y1:200,x2:470,y2:200},
    {t:'box',x:470,y:168,w:150,h:64,label:'\\times(-2)',tex:true},
    {t:'arrow',x1:620,y1:200,x2:780,y2:200},
    {t:'text',x:140,y:186,label:'x[n]',tex:true,fs:16},
    {t:'text',x:700,y:186,label:'-2\\,x[n-1]',tex:true,fs:14,color:C.slate}
  ]}),
  parts:['Read the diagram and write the input–output relation it implements.',
         'Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'State the condition for the system to be invertible, and give the inverse relation.'],
  sol:'<b>Given.</b> A block diagram: a direct branch with gain $3$, and a one-sample delay followed by a gain of $-2$, the two branches added.<br>'
     +'<b>Find.</b> The relation the diagram implements, its five properties, and its invertibility.<br>'
     +'<b>Method.</b> Read each branch of the diagram as an algebraic expression and add them; the resulting relation is then tested exactly like any other input–output relation.<br>'
     +'<b>Solution — part (a).</b> The direct branch contributes $3x[n]$; the delayed branch contributes $-2x[n-1]$. Adding them,$$y[n]=3x[n]-2x[n-1].$$'
     +'<b>Solution — part (b), memoryless.</b> The $x[n-1]$ term uses a different instant. <b>Not memoryless.</b><br>'
     +'<b>Solution — part (b), linear.</b> A linear combination of two input samples is linear. <b>Linear.</b><br>'
     +'<b>Solution — part (b), time invariant.</b> No explicit $n$ appears; feeding $x[n-n_0]$ gives $3x[n-n_0]-2x[n-1-n_0]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — part (b), causal.</b> Only $x[n]$ and $x[n-1]$ are used, both at or before the present. <b>Causal.</b><br>'
     +'<b>Solution — part (b), BIBO stable.</b> $|y[n]|\\le3|x[n]|+2|x[n-1]|\\le5B$ whenever $|x[n]|\\le B$. <b>Stable.</b><br>'
     +'<b>Solution — part (c).</b> Since the gain on $x[n]$ is $3\\neq0$, the relation can be solved for the present sample: $x[n]=\\dfrac{y[n]+2x[n-1]}{3}$. Given $y[n]$ for every $n$ and a starting value of $x$ far enough in the past — for instance $x[k]\\to0$ as $k\\to-\\infty$ — this recursion recovers $x[n]$ at every later instant. <b>Invertible</b>, since the direct-branch gain is nonzero.<br>'
     +'<b>Check.</b> For the input $x[n]=1,-1,2$ at $n=0,1,2$ and zero elsewhere, the relation gives $y[0]=3(1)-2(0)=3$, $y[1]=3(-1)-2(1)=-5$, $y[2]=3(2)-2(-1)=8$. Running the inversion of part (c) forward from $x[-1]=0$: $x[0]=(y[0]+2\\cdot0)/3=1$, $x[1]=(y[1]+2\\cdot1)/3=(-5+2)/3=-1$, $x[2]=(y[2]+2\\cdot(-1))/3=(8-2)/3=2$ — the original input is recovered exactly.',
  err:'Writing the inversion in part (c) as $x[n]=y[n]/3$, dropping the delayed term entirely. The direct branch alone does not determine $x[n]$; the delayed branch has to be subtracted off first.',
  teach:'Ask for the block diagram to be read into an equation before anything else is attempted. A student who guesses at the relation from the picture, rather than tracing each branch, usually drops a sign or a gain.' },

{ id:'D2-17', module:'M2', type:'p-connect',
  stem:'Two systems are connected in series, the output of $S_1$ feeding directly into $S_2$. $S_1$ is the first difference, $w[n]=x[n]-x[n-1]$; $S_2$ is a fixed gain, $y[n]=2w[n]$.',
  figure:()=>P.blocks({w:820,h:170,items:[
    {t:'arrow',x1:50,y1:85,x2:190,y2:85},
    {t:'box',x:190,y:53,w:140,h:64,label:'S_1',tex:true},
    {t:'arrow',x1:330,y1:85,x2:440,y2:85},
    {t:'box',x:440,y:53,w:140,h:64,label:'S_2',tex:true},
    {t:'arrow',x1:580,y1:85,x2:700,y2:85},
    {t:'text',x:130,y:71,label:'x[n]',tex:true,fs:16},
    {t:'text',x:385,y:71,label:'w[n]',tex:true,fs:15,color:C.mid},
    {t:'text',x:650,y:71,label:'y[n]',tex:true,fs:16}
  ]}),
  parts:['Write the overall input–output relation of the series connection, $y[n]$ in terms of $x[n]$ alone.',
         '$S_1$ and $S_2$ are each linear and each time invariant. Argue directly from the definitions that a series connection of two linear systems is linear, and that a series connection of two time-invariant systems is time invariant.',
         'Verify both conclusions directly from the relation found in part (a).'],
  sol:'<b>Given.</b> Two linear, time-invariant systems connected in series.<br>'
     +'<b>Find.</b> The overall relation, and whether the two closure properties hold in general and in this instance.<br>'
     +'<b>Method.</b> Substitute the first relation into the second to get the overall relation; the general closure arguments follow by applying each definition once per stage of the chain.<br>'
     +'<b>Solution — part (a).</b> $y[n]=2w[n]=2\\big(x[n]-x[n-1]\\big)=2x[n]-2x[n-1]$.<br>'
     +'<b>Solution — part (b), linearity.</b> Write the overall system as $T\\{x\\}=S_2\\{S_1\\{x\\}\\}$. Since $S_1$ is linear, $S_1\\{ax_1+bx_2\\}=aS_1\\{x_1\\}+bS_1\\{x_2\\}$. Applying $S_2$, itself linear, to this sum gives $S_2\\big(aS_1\\{x_1\\}+bS_1\\{x_2\\}\\big)=aS_2\\{S_1\\{x_1\\}\\}+bS_2\\{S_1\\{x_2\\}\\}=aT\\{x_1\\}+bT\\{x_2\\}$. So $T$ is linear.<br>'
     +'<b>Solution — part (b), time invariance.</b> Since $S_1$ is time invariant, $S_1\\{x[n-n_0]\\}=w[n-n_0]$, where $w=S_1\\{x\\}$. Since $S_2$ is time invariant, $S_2\\{w[n-n_0]\\}=y[n-n_0]$, where $y=S_2\\{w\\}$. Chaining the two, $T\\{x[n-n_0]\\}=S_2\\{S_1\\{x[n-n_0]\\}\\}=S_2\\{w[n-n_0]\\}=y[n-n_0]=T\\{x\\}[n-n_0]$. So $T$ is time invariant.<br>'
     +'<b>Solution — part (c).</b> $T\\{x\\}[n]=2x[n]-2x[n-1]$ is manifestly a linear combination of two input samples. For time invariance, $T\\{x[n-n_0]\\}=2x[n-n_0]-2x[n-1-n_0]$, and $T\\{x\\}[n-n_0]$, obtained by substituting $n-n_0$ for $n$ in $2x[n]-2x[n-1]$, is $2x[n-n_0]-2x[n-n_0-1]$ — the same expression.<br>'
     +'<b>Check.</b> A numerical instance: with $x[n]=1,3,2$ at $n=0,1,2$ and zero elsewhere, $w[n]=x[n]-x[n-1]$ gives $w[0]=1$, $w[1]=2$, $w[2]=-1$, and $y[n]=2w[n]$ gives $y[0]=2$, $y[1]=4$, $y[2]=-2$; the direct formula gives the same three values, $2(1)-2(0)=2$, $2(3)-2(1)=4$, $2(2)-2(3)=-2$. The general argument in part (b) never used the specific form of $S_1$ or $S_2$, only that each was linear and each was time invariant, so it holds for any such pair, not only for a difference followed by a gain.',
  err:'Assuming the closure arguments in part (b) without stating which property of $S_1$ and which property of $S_2$ was used where. The proof needs the linearity of both systems, or the time invariance of both systems, named explicitly, once for each stage of the chain.',
  teach:'Ask whether the same two arguments would still work if $S_1$ and $S_2$ were linear but only one of them were time invariant. They would not, and seeing why sharpens what the general statement actually depends on.' },

{ id:'D2-18', module:'M2', type:'p-connect',
  stem:'Two systems are connected in parallel, both acting on the same input and their outputs added: $S_1$ is the identity, $y_1[n]=x[n]$; $S_2$ is a unit delay, $y_2[n]=x[n-1]$.',
  figure:()=>P.blocks({w:820,h:230,items:[
    {t:'arrow',x1:50,y1:60,x2:190,y2:60},
    {t:'box',x:190,y:28,w:140,h:64,label:'S_1',tex:true},
    {t:'arrow',x1:330,y1:60,x2:440,y2:60},
    {t:'text',x:130,y:46,label:'x[n]',tex:true,fs:16},
    {t:'text',x:400,y:46,label:'y_1[n]',tex:true,fs:14,color:C.slate},
    {t:'arrow',x1:50,y1:190,x2:190,y2:190},
    {t:'box',x:190,y:158,w:140,h:64,label:'S_2',tex:true},
    {t:'arrow',x1:330,y1:190,x2:440,y2:190},
    {t:'text',x:130,y:176,label:'x[n]',tex:true,fs:16},
    {t:'text',x:400,y:176,label:'y_2[n]',tex:true,fs:14,color:C.slate}
  ]}),
  parts:['Write the overall input–output relation of the parallel connection.',
         '$S_1$ and $S_2$ are each causal and each BIBO stable. Argue directly from the definitions that a parallel connection of two causal systems is causal, and that a parallel connection of two BIBO-stable systems is BIBO stable.',
         'Confirm both conclusions directly for this particular combination.'],
  sol:'<b>Given.</b> Two causal, stable systems connected in parallel.<br>'
     +'<b>Find.</b> The overall relation, and whether the two closure properties hold in general and in this instance.<br>'
     +'<b>Method.</b> The parallel output is a sum of two separately computed outputs; each closure argument bounds or restricts that sum using what is already known about each branch.<br>'
     +'<b>Solution — part (a).</b> $y[n]=y_1[n]+y_2[n]=x[n]+x[n-1]$.<br>'
     +'<b>Solution — part (b), causality.</b> If $S_1$ is causal, $y_1[n]$ depends only on $x[k]$ for $k\\le n$; if $S_2$ is causal, $y_2[n]$ depends only on $x[k]$ for $k\\le n$ as well. The sum $y[n]=y_1[n]+y_2[n]$ therefore depends only on $x[k]$ for $k\\le n$, so it is causal too.<br>'
     +'<b>Solution — part (b), stability.</b> If $|x[n]|\\le B$ for every $n$, and $S_1$ is stable, there is a finite $M_1$ with $|y_1[n]|\\le M_1$ for every $n$; if $S_2$ is stable, there is a finite $M_2$ with $|y_2[n]|\\le M_2$. Then $|y[n]|\\le|y_1[n]|+|y_2[n]|\\le M_1+M_2<\\infty$ by the triangle inequality, so the sum is bounded too.<br>'
     +'<b>Solution — part (c).</b> $y[n]=x[n]+x[n-1]$ uses only the instants $n$ and $n-1$, both no later than $n$: causal. If $|x[n]|\\le B$, then $|y[n]|\\le|x[n]|+|x[n-1]|\\le2B<\\infty$: stable, with the bound $M_1+M_2=B+B=2B$ matching the general argument exactly.<br>'
     +'<b>Check.</b> A numerical instance: with $x[n]=2,-1,3$ at $n=0,1,2$ and zero elsewhere, $y[0]=x[0]+x[-1]=2+0=2$, $y[1]=x[1]+x[0]=-1+2=1$, $y[2]=x[2]+x[1]=3-1=2$; every value is well within $2B$ for $B=3$, since $2\\cdot3=6$. The general causality argument in part (b) used nothing about $S_1$ and $S_2$ beyond each being causal, so it applies equally to a parallel connection of any two causal systems, not only the identity and a delay.',
  err:'Bounding the parallel sum as $|y[n]|\\le2\\max(M_1,M_2)$ instead of $M_1+M_2$. The bound that follows from the triangle inequality is the sum of the two individual bounds, not twice the larger one, and using the wrong bound can understate how large the combined output gets.',
  teach:'Have the student restate the causality argument using only the words "depends on", without writing a single formula. If they cannot, the formula that follows will not mean anything to them either.' },

{ id:'D2-19', module:'M2', type:'p-connect',
  stem:'The system below is built with feedback: $$y[n]=x[n]-a\\,y[n-1],$$ where $a$ is a real constant, the output returning through a gain $a$ and a one-sample delay and entering with a negative sign.',
  figure:()=>P.blocks({w:820,h:260,items:[
    {t:'arrow',x1:50,y1:100,x2:190,y2:100},
    {t:'box',x:190,y:68,w:140,h:64,label:'S',tex:true},
    {t:'arrow',x1:330,y1:100,x2:470,y2:100},
    {t:'text',x:130,y:86,label:'x[n]',tex:true,fs:17},
    {t:'text',x:520,y:86,label:'y[n]',tex:true,fs:17},
    {t:'line',d:'M470,100 L620,100 L620,200'},
    {t:'arrow',x1:620,y1:200,x2:260,y2:200,label:'a\\,z^{-1}',tex:true,color:C.mid},
    {t:'arrow',x1:260,y1:200,x2:260,y2:132}
  ]}),
  parts:['Determine whether the system is memoryless, causal and linear, for any real value of $a$.',
         'Iterate the recursion to express $y[n]$ as a sum involving only $x[n],x[n-1],x[n-2],\\dots$, assuming $y[k]\\to0$ as $k\\to-\\infty$.',
         'Using the sum from part (b), state the condition on $a$ under which the system is BIBO stable, and justify it.'],
  sol:'<b>Given.</b> A first-order recursive system with feedback gain $a$.<br>'
     +'<b>Find.</b> Three of the five properties directly, and the stability condition from the expanded relation.<br>'
     +'<b>Method.</b> Memory, causality and linearity are read directly from the recursion; stability needs the recursion turned into an explicit sum over the input, because a feedback relation does not exhibit a bound on its own.<br>'
     +'<b>Solution — part (a).</b> The output at $n$ uses $y[n-1]$, which by the same relation depends on $x[n-1],x[n-2],\\dots$ — the whole past input. <b>Not memoryless.</b> Because $y[n]$ depends only on $x[n]$ and, through $y[n-1]$, on the past, never on a future sample, the system is <b>causal</b>. The recursion is a linear combination of $x[n]$ and $y[n-1]$ with no product or power of either, so by induction the map from $x$ to $y$ is <b>linear</b>.<br>'
     +'<b>Solution — part (b).</b> Iterating once, $y[n]=x[n]-a\\,y[n-1]=x[n]-a\\big(x[n-1]-a\\,y[n-2]\\big)=x[n]-a\\,x[n-1]+a^{2}y[n-2]$. Repeating $N$ times,$$y[n]=\\sum_{k=0}^{N-1}(-a)^{k}x[n-k]+(-a)^{N}y[n-N].$$As $N\\to\\infty$, $y[n-N]\\to0$ by assumption, so$$y[n]=\\sum_{k=0}^{\\infty}(-a)^{k}\\,x[n-k].$$'
     +'<b>Solution — part (c).</b> If $|x[n]|\\le B$ for every $n$, then $|y[n]|\\le B\\displaystyle\\sum_{k=0}^{\\infty}|a|^{k}$, a geometric series that converges exactly when $|a|<1$, giving $|y[n]|\\le\\dfrac{B}{1-|a|}<\\infty$. <b>BIBO stable if and only if $|a|<1$.</b> When $|a|\\ge1$ the terms $(-a)^k$ do not decay: with $a=-1$, the recursion becomes $y[n]=x[n]+y[n-1]$, the running sum, and $x[n]=u[n]$, bounded by $1$, gives $y[n]=n+1\\to\\infty$.<br>'
     +'<b>Check.</b> The geometric series is confirmed at $a=0.5$: $\\sum_{k=0}^{\\infty}(0.5)^k=2$, so the stability bound is $B/(1-0.5)=2B$. Running the recursion directly for $a=0.5$, $x[n]=u[n]$, from $y[-1]=0$: $y[0]=1-0.5(0)=1$, $y[1]=1-0.5(1)=0.5$, $y[2]=1-0.5(0.5)=0.75$, $y[3]=1-0.5(0.75)=0.625$ — every value stays well below $2$, consistent with the bound. For $a=-1$, the same recursion from $y[-1]=0$ gives $y[0]=1,y[1]=2,y[2]=3$, matching $n+1$ exactly.',
  err:'Reporting the system as unstable for every value of $a$, on the grounds that it has infinite memory. Infinite memory alone does not decide stability; whether the geometric series in part (c) converges does, and it converges for a whole open interval of $a$.',
  teach:'Ask for the recursion to be run by hand for a couple of values of $a$ on either side of $1$ in magnitude, with the same bounded input each time. Watching one sequence settle and the other grow is more persuasive than the inequality alone.' },

{ id:'D2-20', module:'M2', type:'p-connect',
  stem:'Two systems are connected in series: $S_1$ is a modulator, $w(t)=x(t)\\cos(t)$; $S_2$ is a fixed one-second delay, $y(t)=w(t-1)$.',
  figure:()=>P.blocks({w:820,h:170,items:[
    {t:'arrow',x1:50,y1:85,x2:190,y2:85},
    {t:'box',x:190,y:53,w:140,h:64,label:'\\times\\cos t',tex:true},
    {t:'arrow',x1:330,y1:85,x2:440,y2:85},
    {t:'box',x:440,y:53,w:140,h:64,label:'\\text{delay }1',tex:true},
    {t:'arrow',x1:580,y1:85,x2:700,y2:85},
    {t:'text',x:130,y:71,label:'x(t)',tex:true,fs:16},
    {t:'text',x:385,y:71,label:'w(t)',tex:true,fs:15,color:C.mid},
    {t:'text',x:650,y:71,label:'y(t)',tex:true,fs:16}
  ]}),
  parts:['Determine whether $S_1$, taken alone, is time invariant.',
         'Determine whether $S_2$, taken alone as a system with input $w$ and output $y$, is time invariant.',
         'Write the overall relation for the series connection, and determine whether it is time invariant. Justify with a counterexample if it fails.',
         'Determine whether the overall connection is linear, using the fact that a series connection of two linear systems is linear.'],
  sol:'<b>Given.</b> A time-varying gain in series with a pure delay.<br>'
     +'<b>Find.</b> Whether time invariance survives the connection, given that one of the two systems alone does not have it.<br>'
     +'<b>Method.</b> Settle each system alone first; a pure delay is always time invariant, so any failure in the connection has to come from $S_1$, and it is confirmed by carrying the same counterexample through both stages.<br>'
     +'<b>Solution — part (a).</b> Let $x_1(t)=1$ for every $t$, so $w_1(t)=\\cos(t)$. Shift by $t_0=\\pi/2$: since $x_1$ is constant, the shifted input is again $x_2(t)=1$, and $S_1\\{x_2\\}(t)=\\cos(t)$. But $w_1(t-\\pi/2)=\\cos(t-\\pi/2)=\\sin(t)$. At $t=0$: $\\cos(0)=1\\neq0=\\sin(0)$. <b>$S_1$ alone is not time invariant.</b><br>'
     +'<b>Solution — part (b).</b> A pure delay only ever relocates its argument: $S_2\\{w(t-t_0)\\}=w(t-t_0-1)=w\\big((t-1)-t_0\\big)=y(t-t_0)$, for any signal $w$ and any $t_0$. <b>$S_2$ alone is time invariant.</b><br>'
     +'<b>Solution — part (c).</b> The series relation is $y(t)=w(t-1)=x(t-1)\\cos(t-1)$. Using $x_1(t)=1$ from part (a): $y_1(t)=\\cos(t-1)$. With the same shift $t_0=\\pi/2$ and $x_2(t)=x_1(t-\\pi/2)=1$: $T\\{x_2\\}(t)=x_2(t-1)\\cos(t-1)=\\cos(t-1)$, since $x_2$ is the same constant $1$. But $y_1(t-\\pi/2)=\\cos\\big((t-\\pi/2)-1\\big)=\\cos(t-1-\\pi/2)=\\sin(t-1)$. At $t=1$: $T\\{x_2\\}(1)=\\cos(0)=1$, while $y_1(1-\\pi/2)=\\sin(0)=0$. Since $1\\neq0$, <b>the series connection is not time invariant.</b><br>'
     +'<b>Solution — part (d).</b> $S_1$ is linear, since multiplying by the fixed function $\\cos(t)$ is linear in $x$; $S_2$ is linear, since a pure delay is linear. A series connection of two linear systems is linear. <b>The overall connection is linear.</b> This is confirmed directly: $T\\{x\\}(t)=x(t-1)\\cos(t-1)$ is a fixed function of $t$ multiplied by a relocated sample of $x$, with no product or power of $x$ itself.<br>'
     +'<b>Check.</b> The time-invariant stage, $S_2$, never repairs the failure of $S_1$: because $S_2$ only relocates its argument, whatever mismatch $S_1$ produces between a shifted response and a response to a shifted input is carried, unchanged in kind, through the delay. Numerically, $\\cos(0)=1$ against $\\sin(0)=0$ is exactly the pair of values used in part (a), only evaluated one second later in $t$ — the failure of the connection is the failure of $S_1$, read off one instant later.',
  err:'Concluding that the series connection must be time invariant because $S_2$ is. A single time-invariant stage cannot restore a property that a different stage in the same chain has already lost.',
  teach:'This question is the place to make the general point precise: time invariance of a series connection needs every stage to have it, while linearity of a series connection needs only that every stage be linear. The two closure statements are not interchangeable, and this system is built to keep one and lose the other.' }

]);

window.DRILLMAP_M2 = [

{ id:'m2-drill-map', module:'M2', nav:'Module 2 · question types',
  title:'Module 2 — what a question looks like', src:'pp. 11–14',
  objective:'Name the five recurring question shapes before the module is read.',
  keywords:'practice questions module 2 question types system properties linearity time invariance causality stability invertibility interconnection series parallel feedback taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Question types', src:'pp. 11–14'},
  {t:'title', text:'Four disguises for one question, and a fifth question entirely'},
  {t:'lede', text:'Four shapes are the same question wearing different clothes: given a rule relating input to output, decide whether the system is memoryless, linear, time invariant, causal and stable, and justify every answer. The fifth shape asks something else — how a property survives when systems are combined, and whether the map from input to output can be undone.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M2'},
  {t:'note', kind:'warn', head:'A property is settled by a proof or by a counterexample, never by an impression', html:'To establish a property, argue for every input. To destroy it, name one input, or one pair of inputs and one shift, and show the rule fails. An interconnection inherits a property only when every one of its parts has that property, and only for a property that survives addition and composition — invertibility does not, in general.'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M2 = [

{ id:'m2-drill', module:'M2', nav:'Module 2 · practice questions',
  title:'Module 2 — practice questions', src:'pp. 11–14',
  objective:'Twenty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 2 practice memoryless linear time invariant causal stable counterexample invertibility interconnection series parallel feedback block diagram',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Practice D2-01 … D2-20', src:'pp. 11–14'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Where a system is given as a rule, answer all five properties and give a proof or a named counterexample for each. Two cheap checks: a linear system must map the zero input to the zero output, and a memoryless system is always causal. A third, for the last five questions: linearity and time invariance pass from the parts of a series or parallel connection to the whole, and stability of a feedback loop usually comes down to a condition on the loop gain.'},
  {t:'rule', short:true},
  {t:'drill', module:'M2'}
]}

];
})();
