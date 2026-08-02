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
            'To disprove homogeneity, give one input and one scale factor for which the two responses differ.',
            'A nonlinearity does not by itself break time invariance, causality or stability.',
            'Bound the output from a bound on the input to settle stability in one line.'],
    go:'m2-linear' },
  { k:'p-accum', name:'Accumulation, integration or differencing',
    asks:'The rule sums or integrates the input, or takes a difference of neighbouring values. Memory and stability are the properties at risk.',
    method:['Write the output as an explicit sum or integral with its limits.',
            'The limits decide memory and causality: an upper limit above the present time is not causal.',
            'For stability, bound the output when $|x|\\le B$. A finite window gives a finite bound.',
            'For an unbounded window, test a bounded step input. If the weights decay, sum their absolute values before deciding stability.'],
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
    asks:'The system combines other systems in series, in parallel or with feedback, or asks for an inverse. First write one relation between the input and output.',
    method:['In series, substitute the first relation into the second before testing any property on the result.',
            'In parallel, the outputs add. A property that survives addition survives the connection.',
            'In feedback, the relation is implicit. Iterate it or solve it before testing the properties. Use the resulting loop-gain condition to test stability.',
            'For invertibility, find an inversion formula that works for every input, or find two distinct inputs that share one output.'],
    go:'m2-invertible' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'One system, tested against all five properties in turn.',
    method:['Take the properties one at a time and in the order asked. Each has its own test, and none of them substitutes for another.',
            'To establish a property, prove it for every input. To deny one, give a single explicit counterexample.',
            'For time invariance, build the response to the shifted input and the shift of the response separately, then compare the two. Do not argue from the look of the equation.',
            'A coefficient that depends on the independent variable breaks time invariance. A coefficient that grows without bound, or a sum with a growing number of terms, usually breaks stability.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D2-01', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=\\cos\\!\\big(x(t)\\big).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer. An unjustified answer receives no credit.'],
  sol:'<b>Given.</b> A memoryless cosine nonlinearity.<br>'
     +'<b>Find.</b> The five properties, each with a proof or a counterexample.<br>'
     +'<b>Method.</b> Test linearity first with the zero input because every linear system must satisfy $S\\{0\\}=0$. Then inspect the input argument for memory and causality, apply a shift for time invariance, and use the range of the cosine for stability.<br>'
     +'<b>Solution — memoryless.</b> The output at $t$ is a fixed function of $x(t)$ alone. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> $S\\{0\\}=\\cos(0)=1\\neq0$, so the zero input does not give the zero output. <b>Not linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $t$ appears in the rule. Feeding $x(t-t_0)$ gives $\\cos\\big(x(t-t_0)\\big)=y(t-t_0)$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> A memoryless system is automatically causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> For every real number $u$, $|\\cos u|\\le1$, so $|y(t)|\\le1$ for every input, bounded or not. <b>Stable.</b><br>'
     +'<b>Check.</b> With $x(t)=\\pi/2$ and $a=2$, $S\\{2x\\}=\\cos(\\pi)=-1$ but $2S\\{x\\}=2\\cos(\\pi/2)=0$. This confirms the failure of homogeneity. Also, $|y(t)|\\le1$ for every input, so the stability bound is independent of time.',
  err:'Testing only inputs near $x=0$ does not establish linearity. The superposition condition must hold exactly for every allowed input.',
  teach:'Ask for the zero-input response first. A non-zero response disproves linearity without a longer calculation.' },

{ id:'D2-02', module:'M2', type:'p-nonlin', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[n]\\,x[n+1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A product of the present input with the next one.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Compare the indices $n$ and $n+1$ to test memory and causality. Scale a constant input to test homogeneity, shift the complete rule to test time invariance, and bound both factors to test stability.<br>'
     +'<b>Solution — memoryless.</b> The output at $n$ uses $x[n+1]$, a sample at a different instant. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Let $x[n]=1$ for every $n$, so $y[n]=1\\cdot1=1$. Scaling by $a=2$ gives $x[n]=2$ and $y[n]=2\\cdot2=4$, while $a\\,y[n]=2\\cdot1=2$. Since $4\\neq2$, homogeneity fails. <b>Not linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $n$ appears. Feeding $x[n-n_0]$ gives $x[n-n_0]\\,x[n-n_0+1]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y[0]=x[0]\\,x[1]$ uses $x[1]$, and $1>0$: the output at $n=0$ needs an input from the future. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x[n]|\\le B$ then $|y[n]|=|x[n]||x[n+1]|\\le B^{2}<\\infty$. <b>Stable.</b><br>'
     +'<b>Check.</b> The homogeneity failure holds for a second scale factor too: with $x[n]=1$ and $a=3$, $S\\{3x\\}[n]=3\\cdot3=9\\neq3\\cdot1=3$. The causality failure is not confined to $n=0$: at $n=-4$, $y[-4]=x[-4]\\,x[-3]$ uses $x[-3]$, and $-3>-4$, so the same failure recurs at every instant. For stability, the bound is tight: with $B=5$ and $x[n]=5$ for every $n$, $y[n]=25=B^{2}$ exactly.',
  err:'Reading $x[n+1]$ as an earlier sample because it sits to the right of $x[n]$ in the formula. The index $n+1$ names a later instant, whatever position it occupies on the page.',
  teach:'Compare this system with $y[n]=x[n]x[n-1]$. Replacing the future index $n+1$ by the past index $n-1$ changes only the causality result.' },

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
  err:'The linear term $-x(t)$ does not make the complete system linear. The cubic term makes homogeneity fail.',
  teach:'Require a stability bound in terms of $B$. A numerical input checks one case but does not prove stability for every bounded input.' },

{ id:'D2-04', module:'M2', type:'p-nonlin',
  stem:'Two memoryless systems: $$\\text{(i)}\\;\\;y(t)=x^{3}(t),\\qquad\\text{(ii)}\\;\\;z[n]=x[n]\\,x[n-2].$$',
  parts:['Determine whether system (i) is invertible. Give the inverse relation if it is.',
         'Determine whether system (ii) is invertible. Give an explicit counterexample if it is not.',
         'Explain why raising the input to an odd power preserves invertibility while forming a product of two different samples generally does not.'],
  sol:'<b>Given.</b> A cube, and a two-sample product.<br>'
     +'<b>Find.</b> Whether each map from input to output is one-to-one.<br>'
     +'<b>Method.</b> For the cube, use strict monotonicity to show that distinct values give distinct outputs. For the product, construct two distinct sequences whose sample products agree at every index.<br>'
     +'<b>Solution — part (a).</b> The cube is strictly increasing on the reals: if $x_1<x_2$ then $x_1^{3}<x_2^{3}$, so distinct inputs give distinct outputs at every $t$. <b>Invertible</b>, with inverse $x(t)=\\sqrt[3]{y(t)}$, the real cube root, defined for every real $y(t)$.<br>'
     +'<b>Solution — part (b).</b> Take $x_1[n]=1$ for every $n$, giving $z_1[n]=1\\cdot1=1$ for every $n$. Take $x_2[n]=(-1)^{n}$, giving $z_2[n]=(-1)^{n}(-1)^{n-2}=(-1)^{2n-2}=1$ for every $n$, since $2n-2$ is always even. So $z_1=z_2$ as sequences, yet $x_1[1]=1\\neq-1=x_2[1]$. <b>Not invertible.</b><br>'
     +'<b>Solution — part (c).</b> An odd power is a strictly monotonic function of one value and so never repeats; a product of two different samples can equal the same number for many different pairs of factors, because a sign or a scale on one factor can be undone by the other.<br>'
     +'<b>Check.</b> The identity behind part (b) holds at every index, confirmed away from $n=1$: at $n=-3$, $(-1)^{-3}(-1)^{-5}=(-1)\\cdot(-1)=1$, and at $n=4$, $1\\cdot1=1$. The two sequences are still distinct, because they disagree at every odd index, not only at $n=1$: at $n=3$, $x_1[3]=1$ while $x_2[3]=-1$. For part (a), injectivity of the cube is confirmed on a pair of numbers not used above: $(-2)^3=-8\\neq27=3^3$.',
  err:'Dividing $z[n]$ by $x[n-2]$ is not an inverse because $x[n-2]$ is also unknown. An inverse must use the output alone.',
  teach:'Ask for the counterexample in part (b) to be checked at more than one index before it is accepted. A single matching index is not enough to establish that two whole sequences coincide.' },

{ id:'D2-05', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=\\sum_{k=n-3}^{n}x[k].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A four-sample causal sliding sum.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Expand the four terms to test memory and causality. Apply superposition term by term, shift both limits to test time invariance, and bound the four terms to test stability.<br>'
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
     +'<b>Check.</b> The fixed lower limit changes the interval used by the system but not the linear dependence on $x$. This explains why linearity holds while memorylessness, time invariance, causality and stability fail in the examples above.',
  err:'Assuming the lower limit fixed at $0$ behaves like a lower limit fixed at $-\\infty$, and reporting the system as causal and stable on that analogy. A lower limit fixed at an absolute instant is itself an explicit dependence on time, and it costs both properties here.',
  teach:'Compare the fixed lower limit $0$ with the moving lower limit $t-1$. The moving window changes the time-invariance, causality and stability results.' },

{ id:'D2-07', module:'M2', type:'p-accum', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}x[k].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A causal accumulator whose memory decays geometrically into the past.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Substitute $j=n-k$ so the past-sample weights form a geometric series. Use the limits for memory and causality, superposition for linearity, a shifted index for time invariance, and the sum of the absolute weights for stability.<br>'
     +'<b>Solution — memoryless.</b> The sum reaches back to $k=-\\infty$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> A sum of weighted input values is linear in $x$, exactly as for any finite sum. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Feed $x[n-n_0]$ and substitute $m=k-n_0$:$$\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}x[k-n_0]=\\sum_{m=-\\infty}^{n-n_0}\\left(\\tfrac12\\right)^{\\!(n-n_0)-m}x[m]=y[n-n_0].$$<b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> The sum runs only over $k\\le n$. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x[k]|\\le B$ for every $k$, then, writing $j=n-k$,$$|y[n]|\\le B\\sum_{k=-\\infty}^{n}\\left(\\tfrac12\\right)^{\\!n-k}=B\\sum_{j=0}^{\\infty}\\left(\\tfrac12\\right)^{\\!j}=2B<\\infty.$$<b>Stable.</b><br>'
     +'<b>Check.</b> The plain accumulator, with every past sample weighted equally, is unstable — a bounded step input gives an output that grows like $n$. Here the weights themselves form a convergent geometric series, $\\sum_{j\\ge0}(1/2)^j=2$, and that single fact keeps the output finite however far the memory reaches back. A numerical instance: for $x[k]=B$ constant, $y[n]=B\\sum_{j=0}^\\infty(1/2)^j=2B$ exactly, matching the bound with no slack, and the partial sums over $j=0,\\dots,20$ already agree with $2B$ to five decimal places.',
  err:'An infinite window is not automatically unstable. Stability depends on whether the absolute weights have a finite sum, and these weights do.',
  teach:'Compare this weighted sum with the unweighted accumulator. Both have infinite memory, but only the geometric weights have a finite sum.' },

{ id:'D2-08', module:'M2', type:'p-accum',
  stem:'The running sum $$y[n]=\\sum_{k=-\\infty}^{n}x[k]$$ is unstable in general. A particular input is $$x[n]=\\left(\\tfrac13\\right)^{\\!n}u[n].$$',
  parts:['Verify that $x[n]$ is bounded, and find a closed form for $y[n]$ valid for $n\\ge0$.',
         'Show that this particular response is itself a bounded sequence.',
         'Explain why part (b) does not establish that the system is BIBO stable, and produce a single bounded input whose response is unbounded.',
         'State, in one sentence, the general distinction between a property of a system and a property of one of its responses.'],
  sol:'<b>Given.</b> The running sum, and one specific decaying input.<br>'
     +'<b>Find.</b> Whether one well-behaved response can stand in for a proof of stability.<br>'
     +'<b>Method.</b> Compute the requested response and test whether it is bounded. Then compare this single example with the definition of BIBO stability, which requires a bound for every bounded input.<br>'
     +'<b>Solution — part (a).</b> $x[n]=(1/3)^n$ for $n\\ge0$ and $0$ for $n<0$, so $|x[n]|\\le1$ for every $n$: bounded, with $B=1$. For $n\\ge0$,$$y[n]=\\sum_{k=0}^{n}\\left(\\tfrac13\\right)^{\\!k}=\\frac{1-(1/3)^{n+1}}{1-1/3}=\\frac32\\left(1-\\left(\\tfrac13\\right)^{\\!n+1}\\right).$$'
     +'<b>Solution — part (b).</b> Since $0<(1/3)^{n+1}\\le1/3$ for $n\\ge0$, $y[n]$ increases from $y[0]=1$ toward $3/2$, and $0\\le y[n]<3/2$ for every $n\\ge0$, while $y[n]=0$ for $n<0$. This particular response is bounded.<br>'
     +'<b>Solution — part (c).</b> BIBO stability requires every bounded input to produce a bounded output; one well-behaved example, however cleanly it works out, cannot establish a claim that is quantified over all inputs. The standard counterexample still applies: $x[n]=u[n]$ is bounded by $1$, and $y[n]=\\sum_{k=0}^{n}1=n+1\\to\\infty$ as $n\\to\\infty$. The system is <b>not stable</b>.<br>'
     +'<b>Solution — part (d).</b> Stability is a property of the system, quantified over every input it could ever receive; whether one particular response happens to be bounded is a property of that response alone, and says nothing about the responses to every other input.<br>'
     +'<b>Check.</b> The closed form in part (a), checked at $n=2$: direct summation gives $1+\\tfrac13+\\tfrac19=\\tfrac{13}{9}$, and the formula gives $\\tfrac32\\big(1-(1/3)^3\\big)=\\tfrac32\\cdot\\tfrac{26}{27}=\\tfrac{13}{9}$, matching. As $n\\to\\infty$, $y[n]\\to3/2$, consistent with part (b). For part (c), the counterexample recomputed at $n=99$ gives $y[99]=100$, already a hundred times the bound on the input, with no ceiling in sight.',
  err:'The bounded response in part (b) is one example, not a proof of stability. BIBO stability must hold for every bounded input.',
  teach:'Require the bounded step counterexample in part (c). It distinguishes a bounded response from a stable system.' },

{ id:'D2-09', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=e^{-t}x(t).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A memoryless gain that decays with $t$.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Apply superposition to the fixed gain for linearity. Use a constant input and a shift to test time invariance. Then test whether the gain is bounded on the whole time axis.<br>'
     +'<b>Solution — memoryless.</b> Only $x(t)$ appears. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> The response to $ax_1(t)+bx_2(t)$ is $e^{-t}\\big(ax_1(t)+bx_2(t)\\big)=a\\,y_1(t)+b\\,y_2(t)$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=1$ for every $t$, so $y_1(t)=e^{-t}$. Shift by $t_0=1$: since $x_1$ is constant, the shifted signal is again $x_2(t)=1$, and $S\\{x_2\\}(t)=e^{-t}$. But $y_1(t-1)=e^{-(t-1)}=e^{1-t}$. Since $e^{-t}\\neq e^{1-t}$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> Memoryless implies causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> Take $x(t)=1$, bounded by $B=1$. Then $y(t)=e^{-t}\\to\\infty$ as $t\\to-\\infty$. <b>Not stable.</b><br>'
     +'<b>Check.</b> At $t=0$, $e^{-0}=1$ while $e^{1-0}=e\\approx2.718$: the two sides of the time-invariance test already disagree at a single convenient point. For stability, $e^{-t}$ at $t=-20$ is $e^{20}\\approx4.85\\times10^{8}$, confirming the blow-up numerically rather than only in the limit. The two failures share one cause: the gain $e^{-t}$ depends on absolute time and is unbounded on one side of the axis.',
  err:'Concluding the system is stable because $e^{-t}\\to0$ as $t\\to\\infty$. Boundedness has to hold on the whole axis, and the same gain diverges on the other side of it.',
  teach:'Use a constant input in the time-invariance test. It keeps the input unchanged under a shift and isolates the time-dependent gain.' },

{ id:'D2-10', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=2^{-|n|}x[n].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A memoryless gain that decays away from $n=0$ in both directions.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Use a shifted impulse to test the index-dependent gain for time invariance. Use $0<2^{-|n|}\\le1$ to obtain the stability bound. Memory, linearity and causality follow by applying their definitions to the value $x[n]$.<br>'
     +'<b>Solution — memoryless.</b> Only $x[n]$ appears. <b>Memoryless.</b><br>'
     +'<b>Solution — linear.</b> Multiplication by a fixed sequence is linear: $2^{-|n|}\\big(ax_1[n]+bx_2[n]\\big)=a\\,y_1[n]+b\\,y_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1[n]=\\delta[n]$, so $y_1[n]=2^{-|n|}\\delta[n]=\\delta[n]$, since the gain equals $1$ exactly where $\\delta[n]$ is nonzero. Shift by $n_0=1$: $x_2[n]=\\delta[n-1]$, and $S\\{x_2\\}[n]=2^{-|n|}\\delta[n-1]$, which is $2^{-1}=\\tfrac12$ at $n=1$ and $0$ elsewhere. But $y_1[n-1]=\\delta[n-1]$, which is $1$ at $n=1$. Since $\\tfrac12\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> Memoryless implies causal. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> Since $0<2^{-|n|}\\le1$ for every integer $n$, if $|x[n]|\\le B$ then $|y[n]|=2^{-|n|}|x[n]|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The gain values used above: $2^{-|0|}=1$, $2^{-|1|}=0.5$, $2^{-|-1|}=0.5$, $2^{-|5|}=1/32=0.03125$ — every one at most $1$, confirming the bound used for stability independently of the time-invariance argument. A gain that is unbounded in one direction, as in the previous system, breaks stability as well as time invariance; a gain that stays within $[0,1]$, as here, breaks only time invariance.',
  err:'Concluding the system is time invariant because the gain is bounded. Boundedness of a gain protects stability; it does nothing for time invariance, which fails whenever the gain depends explicitly on the index at all.',
  teach:'Separate the gain tests. Its dependence on $n$ breaks time invariance, while its bounded magnitude preserves stability.' },

{ id:'D2-11', module:'M2', type:'p-gain', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x(t)\\cos(\\pi t)+x(t-1).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A time-varying gain added to a fixed delay.<br>'
     +'<b>Find.</b> The five properties of the combination.<br>'
     +'<b>Method.</b> Test linearity term by term and add the results. Inspect the delayed term for memory and causality. Use a constant input to isolate the time-dependent gain in the time-invariance test, and bound both terms for stability.<br>'
     +'<b>Solution — memoryless.</b> The term $x(t-1)$ uses an instant other than $t$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Multiplication by $\\cos(\\pi t)$ and a pure delay are each linear in $x$, and a sum of two linear operations is linear. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=1$ for every $t$, so $y_1(t)=\\cos(\\pi t)+1$. Shift by $t_0=0.5$: since $x_1$ is constant, the shifted signal is again $x_2(t)=1$, and $S\\{x_2\\}(t)=\\cos(\\pi t)+1$. But $y_1(t-0.5)=\\cos\\big(\\pi(t-0.5)\\big)+1$. At $t=0$: $S\\{x_2\\}(0)=\\cos(0)+1=2$, while $y_1(-0.5)=\\cos(-\\pi/2)+1=0+1=1$. Since $2\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> The two instants used are $t$ and $t-1$, both no later than $t$. <b>Causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> If $|x(t)|\\le B$, then $|y(t)|\\le|x(t)||\\cos(\\pi t)|+|x(t-1)|\\le B\\cdot1+B=2B<\\infty$. <b>Stable.</b><br>'
     +'<b>Check.</b> For the constant input, the delay term contributes the same value to both paths. The gain term gives $\\cos(0)=1$ in one path and $\\cos(-\\pi/2)=0$ in the other, which accounts for the difference between $2$ and $1$.',
  err:'Testing time invariance on the delay term alone, finding it holds, and reporting the whole system as time invariant. Every term in a sum has to pass the test; one term failing is enough to fail the sum.',
  teach:'Test the gain term and delay term separately. The delay is time invariant; the time-dependent gain causes the failure.' },

{ id:'D2-12', module:'M2', type:'p-gain',
  stem:'Two systems built from a time-varying gain: $$\\text{(i)}\\;\\;y(t)=(t^{2}+1)\\,x(t),\\qquad\\text{(ii)}\\;\\;y(t)=t\\,x(t).$$',
  parts:['Determine whether system (i) is invertible. Give the inverse relation if it is.',
         'Determine whether system (ii) is invertible. Give an explicit counterexample if it is not.',
         'State the general condition on a gain $g(t)$, in the relation $y(t)=g(t)x(t)$, for the system to be invertible.'],
  sol:'<b>Given.</b> Two memoryless gains, one that never vanishes and one that vanishes once.<br>'
     +'<b>Find.</b> Whether each map from input to output is one-to-one.<br>'
     +'<b>Method.</b> Solve each gain relation for $x(t)$. If a gain is zero at any time, construct two inputs that differ only at that time and show that their outputs are identical.<br>'
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
     +'<b>Method.</b> Compare $n+2$ with $n$ to test memory and causality. Apply superposition to the relocated sample, shift the input index to test time invariance, and transfer the input bound directly to the output.<br>'
     +'<b>Solution — memoryless.</b> $n+2\\neq n$ for every $n$, so a different instant is always used. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> Reading the input at a relocated index is linear: the response to $ax_1[n]+bx_2[n]$ is $ax_1[n+2]+bx_2[n+2]=ay_1[n]+by_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> No explicit $n$ appears. Feeding $x[n-n_0]$ gives $x[(n-n_0)+2]=x[(n+2)-n_0]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y[0]=x[2]$, and $2>0$: the output at $n=0$ needs an input from the future. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y[n]|=|x[n+2]|\\le B$ whenever $|x[n]|\\le B$ for every $n$. <b>Stable.</b><br>'
     +'<b>Check.</b> The causality failure holds at every instant, not only at $n=0$: $y[-5]=x[-3]$, and $-3>-5$, so the output is always two steps ahead of what has arrived. The time-invariance identity is confirmed at a second shift, $n_0=3$: $x[(n-3)+2]=x[n-1]$, and $y[n-3]$, obtained by substituting $n-3$ for $n$ in $x[n+2]$, is also $x[n-1]$.',
  err:'Testing causality only at $n=0$ and concluding the failure is a special case tied to that instant. The advance $n+2$ exceeds $n$ for every integer $n$, so the failure is universal, not local.',
  teach:'Repeat the causality comparison at another index. This shows that $n+2$ is later than $n$ at every output time.' },

{ id:'D2-14', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y(t)=x(3-t).$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A reflection of the time axis combined with a shift.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Compare $3-t$ with $t$ to test memory and causality. Apply superposition for linearity, use a shifted step as the time-invariance counterexample, and transfer the input bound to the reflected output.<br>'
     +'<b>Solution — memoryless.</b> $3-t=t$ only at $t=1.5$; for every other $t$ a different instant is used. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> $ax_1(3-t)+bx_2(3-t)=ay_1(t)+by_2(t)$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1(t)=u(t)$, so $y_1(t)=u(3-t)$, equal to $1$ for $t\\le3$ and $0$ for $t>3$. Shift by $t_0=1$: $x_2(t)=x_1(t-1)=u(t-1)$, and $S\\{x_2\\}(t)=x_2(3-t)=u(3-t-1)=u(2-t)$. At $t=3$: $S\\{x_2\\}(3)=u(2-3)=u(-1)=0$. But $y_1(t-1)$ at $t=3$ is $y_1(2)=u(3-2)=u(1)=1$. Since $0\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> $y(0)=x(3)$, and $3>0$. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y(t)|=|x(3-t)|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The causality failure recurs at every instant with $t<3$: at $t=1$, $y(1)=x(2)$, and $2>1$. The time-invariance mismatch is confirmed at a second instant: at $t=4$, $S\\{x_2\\}(4)=u(2-4)=u(-2)=0$, while $y_1(4-1)=y_1(3)=u(3-3)=u(0)=1$; again $0\\neq1$, so the failure is not a coincidence at $t=3$ alone.',
  err:'Testing causality only for $t>3$, where $3-t<t$, and concluding the system is causal. The inequality reverses for $t<3$, and the definition has to hold for every $t$.',
  teach:'Solve the inequality comparing $3-t$ with $t$. A single counterexample disproves causality, while the inequality identifies every time at which future input is used.' },

{ id:'D2-15', module:'M2', type:'p-argop', src:'MT1 Q2',
  stem:'Consider the system $$y[n]=x[3n-1].$$',
  parts:['Determine whether the system is memoryless, linear, time invariant, causal and BIBO stable.',
         'Justify each answer.'],
  sol:'<b>Given.</b> A compression by a factor of three combined with a shift.<br>'
     +'<b>Find.</b> The five properties.<br>'
     +'<b>Method.</b> Solve $3n-1=n$ for memory and $3n-1>n$ for causality. Apply superposition for linearity, use a shifted impulse for the time-invariance test, and transfer the input bound to the output for stability.<br>'
     +'<b>Solution — memoryless.</b> $3n-1=n$ only when $2n=1$, never for an integer $n$. <b>Not memoryless.</b><br>'
     +'<b>Solution — linear.</b> $ax_1[3n-1]+bx_2[3n-1]=ay_1[n]+by_2[n]$. <b>Linear.</b><br>'
     +'<b>Solution — time invariant.</b> Let $x_1[n]=\\delta[n-2]$, so $y_1[n]=\\delta[3n-1-2]=\\delta[3n-3]=\\delta\\big[3(n-1)\\big]$, which is $1$ only at $n=1$: $y_1[n]=\\delta[n-1]$. Shift by $n_0=1$: $x_2[n]=\\delta[n-3]$, and $S\\{x_2\\}[n]=\\delta[3n-1-3]=\\delta[3n-4]$, which is never $1$ for an integer $n$, since $3n=4$ has no integer solution. At $n=2$: $S\\{x_2\\}[2]=\\delta[2]=0$, while $y_1[2-1]=y_1[1]=\\delta[0]=1$. Since $0\\neq1$, <b>not time invariant.</b><br>'
     +'<b>Solution — causal.</b> The inequality $3n-1>n$ reduces to $n>\\tfrac12$, so it holds for every integer $n\\ge1$. At $n=1$: $y[1]=x[2]$, and $2>1$. <b>Not causal.</b><br>'
     +'<b>Solution — BIBO stable.</b> $|y[n]|=|x[3n-1]|\\le B$. <b>Stable.</b><br>'
     +'<b>Check.</b> The vanishing impulse is confirmed at more than one index: $S\\{x_2\\}[n]=\\delta[3n-4]$ is checked to be $0$ at $n=0,1,2,3$, since $3n-4$ equals $-4,-1,2,5$ at those points, none of them $0$. The causality failure is not confined to $n=1$: at $n=2$, $y[2]=x[5]$, and $5>2$, consistent with the inequality holding for every $n\\ge1$.',
  err:'The missing impulse is part of the counterexample. The equation $3n-4=0$ has no integer solution, so the discrete-time output is zero at every index.',
  teach:'Require the integer-index argument. The expression $3n-4$ never reaches zero for integer $n$, which explains why the shifted impulse is absent.' },

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
     +'<b>Method.</b> Write the output of each branch and add the two expressions. Apply the five definitions to the resulting relation. For invertibility, solve the relation recursively for the present input sample.<br>'
     +'<b>Solution — part (a).</b> The direct branch contributes $3x[n]$; the delayed branch contributes $-2x[n-1]$. Adding them,$$y[n]=3x[n]-2x[n-1].$$'
     +'<b>Solution — part (b), memoryless.</b> The $x[n-1]$ term uses a different instant. <b>Not memoryless.</b><br>'
     +'<b>Solution — part (b), linear.</b> A linear combination of two input samples is linear. <b>Linear.</b><br>'
     +'<b>Solution — part (b), time invariant.</b> No explicit $n$ appears; feeding $x[n-n_0]$ gives $3x[n-n_0]-2x[n-1-n_0]=y[n-n_0]$. <b>Time invariant.</b><br>'
     +'<b>Solution — part (b), causal.</b> Only $x[n]$ and $x[n-1]$ are used, both at or before the present. <b>Causal.</b><br>'
     +'<b>Solution — part (b), BIBO stable.</b> $|y[n]|\\le3|x[n]|+2|x[n-1]|\\le5B$ whenever $|x[n]|\\le B$. <b>Stable.</b><br>'
     +'<b>Solution — part (c).</b> Since the gain on $x[n]$ is $3\\neq0$, the relation can be solved for the present sample: $x[n]=\\dfrac{y[n]+2x[n-1]}{3}$. Given $y[n]$ for every $n$ and a starting value of $x$ far enough in the past — for instance $x[k]\\to0$ as $k\\to-\\infty$ — this recursion recovers $x[n]$ at every later instant. <b>Invertible</b>, since the direct-branch gain is nonzero.<br>'
     +'<b>Check.</b> For the input $x[n]=1,-1,2$ at $n=0,1,2$ and zero elsewhere, the relation gives $y[0]=3(1)-2(0)=3$, $y[1]=3(-1)-2(1)=-5$, $y[2]=3(2)-2(-1)=8$. Running the inversion of part (c) forward from $x[-1]=0$: $x[0]=(y[0]+2\\cdot0)/3=1$, $x[1]=(y[1]+2\\cdot1)/3=(-5+2)/3=-1$, $x[2]=(y[2]+2\\cdot(-1))/3=(8-2)/3=2$ — the original input is recovered exactly.',
  err:'Writing the inversion in part (c) as $x[n]=y[n]/3$, dropping the delayed term entirely. The direct branch alone does not determine $x[n]$; the delayed branch has to be subtracted off first.',
  teach:'Write one expression for each branch before adding them. This keeps the delay, sign and gain visible.' },

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
     +'<b>Method.</b> Substitute the output of $S_1$ into $S_2$ to obtain one input-output relation. Test that relation directly, then use the definitions to state which properties a series connection preserves.<br>'
     +'<b>Solution — part (a).</b> $y[n]=2w[n]=2\\big(x[n]-x[n-1]\\big)=2x[n]-2x[n-1]$.<br>'
     +'<b>Solution — part (b), linearity.</b> Write the overall system as $T\\{x\\}=S_2\\{S_1\\{x\\}\\}$. Since $S_1$ is linear, $S_1\\{ax_1+bx_2\\}=aS_1\\{x_1\\}+bS_1\\{x_2\\}$. Applying $S_2$, itself linear, to this sum gives $S_2\\big(aS_1\\{x_1\\}+bS_1\\{x_2\\}\\big)=aS_2\\{S_1\\{x_1\\}\\}+bS_2\\{S_1\\{x_2\\}\\}=aT\\{x_1\\}+bT\\{x_2\\}$. So $T$ is linear.<br>'
     +'<b>Solution — part (b), time invariance.</b> Since $S_1$ is time invariant, $S_1\\{x[n-n_0]\\}=w[n-n_0]$, where $w=S_1\\{x\\}$. Since $S_2$ is time invariant, $S_2\\{w[n-n_0]\\}=y[n-n_0]$, where $y=S_2\\{w\\}$. Chaining the two, $T\\{x[n-n_0]\\}=S_2\\{S_1\\{x[n-n_0]\\}\\}=S_2\\{w[n-n_0]\\}=y[n-n_0]=T\\{x\\}[n-n_0]$. So $T$ is time invariant.<br>'
     +'<b>Solution — part (c).</b> $T\\{x\\}[n]=2x[n]-2x[n-1]$ is manifestly a linear combination of two input samples. For time invariance, $T\\{x[n-n_0]\\}=2x[n-n_0]-2x[n-1-n_0]$, and $T\\{x\\}[n-n_0]$, obtained by substituting $n-n_0$ for $n$ in $2x[n]-2x[n-1]$, is $2x[n-n_0]-2x[n-n_0-1]$ — the same expression.<br>'
     +'<b>Check.</b> A numerical instance: with $x[n]=1,3,2$ at $n=0,1,2$ and zero elsewhere, $w[n]=x[n]-x[n-1]$ gives $w[0]=1$, $w[1]=2$, $w[2]=-1$, and $y[n]=2w[n]$ gives $y[0]=2$, $y[1]=4$, $y[2]=-2$; the direct formula gives the same three values, $2(1)-2(0)=2$, $2(3)-2(1)=4$, $2(2)-2(3)=-2$. The general argument in part (b) never used the specific form of $S_1$ or $S_2$, only that each was linear and each was time invariant, so it holds for any such pair, not only for a difference followed by a gain.',
  err:'Assuming the closure arguments in part (b) without stating which property of $S_1$ and which property of $S_2$ was used where. The proof needs the linearity of both systems, or the time invariance of both systems, named explicitly, once for each stage of the chain.',
  teach:'Check the assumptions of each closure result. Series linearity needs both stages to be linear, and series time invariance needs both stages to be time invariant.' },

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
     +'<b>Method.</b> Add the two branch outputs to form the parallel relation. Apply superposition for linearity, shift both branches for time invariance, inspect both input-time ranges for causality, and add their output bounds for stability.<br>'
     +'<b>Solution — part (a).</b> $y[n]=y_1[n]+y_2[n]=x[n]+x[n-1]$.<br>'
     +'<b>Solution — part (b), causality.</b> If $S_1$ is causal, $y_1[n]$ depends only on $x[k]$ for $k\\le n$; if $S_2$ is causal, $y_2[n]$ depends only on $x[k]$ for $k\\le n$ as well. The sum $y[n]=y_1[n]+y_2[n]$ therefore depends only on $x[k]$ for $k\\le n$, so it is causal too.<br>'
     +'<b>Solution — part (b), stability.</b> If $|x[n]|\\le B$ for every $n$, and $S_1$ is stable, there is a finite $M_1$ with $|y_1[n]|\\le M_1$ for every $n$; if $S_2$ is stable, there is a finite $M_2$ with $|y_2[n]|\\le M_2$. Then $|y[n]|\\le|y_1[n]|+|y_2[n]|\\le M_1+M_2<\\infty$ by the triangle inequality, so the sum is bounded too.<br>'
     +'<b>Solution — part (c).</b> $y[n]=x[n]+x[n-1]$ uses only the instants $n$ and $n-1$, both no later than $n$: causal. If $|x[n]|\\le B$, then $|y[n]|\\le|x[n]|+|x[n-1]|\\le2B<\\infty$: stable, with the bound $M_1+M_2=B+B=2B$ matching the general argument exactly.<br>'
     +'<b>Check.</b> A numerical instance: with $x[n]=2,-1,3$ at $n=0,1,2$ and zero elsewhere, $y[0]=x[0]+x[-1]=2+0=2$, $y[1]=x[1]+x[0]=-1+2=1$, $y[2]=x[2]+x[1]=3-1=2$; every value is well within $2B$ for $B=3$, since $2\\cdot3=6$. The general causality argument in part (b) used nothing about $S_1$ and $S_2$ beyond each being causal, so it applies equally to a parallel connection of any two causal systems, not only the identity and a delay.',
  err:'Bounding the parallel sum as $|y[n]|\\le2\\max(M_1,M_2)$ instead of $M_1+M_2$. The bound that follows from the triangle inequality is the sum of the two individual bounds, not twice the larger one, and using the wrong bound can understate how large the combined output gets.',
  teach:'State the causality argument before writing formulas: each branch depends only on present and past input values, so their sum does too.' },

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
     +'<b>Method.</b> Use the recursion to test memory, causality and linearity. Iterate the recursion to express the output as a weighted sum of past inputs, then sum the absolute weights to obtain the stability condition.<br>'
     +'<b>Solution — part (a).</b> The output at $n$ uses $y[n-1]$, which by the same relation depends on $x[n-1],x[n-2],\\dots$ — the whole past input. <b>Not memoryless.</b> Because $y[n]$ depends only on $x[n]$ and, through $y[n-1]$, on the past, never on a future sample, the system is <b>causal</b>. The recursion is a linear combination of $x[n]$ and $y[n-1]$ with no product or power of either, so by induction the map from $x$ to $y$ is <b>linear</b>.<br>'
     +'<b>Solution — part (b).</b> Iterating once, $y[n]=x[n]-a\\,y[n-1]=x[n]-a\\big(x[n-1]-a\\,y[n-2]\\big)=x[n]-a\\,x[n-1]+a^{2}y[n-2]$. Repeating $N$ times,$$y[n]=\\sum_{k=0}^{N-1}(-a)^{k}x[n-k]+(-a)^{N}y[n-N].$$As $N\\to\\infty$, $y[n-N]\\to0$ by assumption, so$$y[n]=\\sum_{k=0}^{\\infty}(-a)^{k}\\,x[n-k].$$'
     +'<b>Solution — part (c).</b> If $|x[n]|\\le B$ for every $n$, then $|y[n]|\\le B\\displaystyle\\sum_{k=0}^{\\infty}|a|^{k}$, a geometric series that converges exactly when $|a|<1$, giving $|y[n]|\\le\\dfrac{B}{1-|a|}<\\infty$. <b>BIBO stable if and only if $|a|<1$.</b> When $|a|\\ge1$ the terms $(-a)^k$ do not decay: with $a=-1$, the recursion becomes $y[n]=x[n]+y[n-1]$, the running sum, and $x[n]=u[n]$, bounded by $1$, gives $y[n]=n+1\\to\\infty$.<br>'
     +'<b>Check.</b> The geometric series is confirmed at $a=0.5$: $\\sum_{k=0}^{\\infty}(0.5)^k=2$, so the stability bound is $B/(1-0.5)=2B$. Running the recursion directly for $a=0.5$, $x[n]=u[n]$, from $y[-1]=0$: $y[0]=1-0.5(0)=1$, $y[1]=1-0.5(1)=0.5$, $y[2]=1-0.5(0.5)=0.75$, $y[3]=1-0.5(0.75)=0.625$ — every value stays well below $2$, consistent with the bound. For $a=-1$, the same recursion from $y[-1]=0$ gives $y[0]=1,y[1]=2,y[2]=3$, matching $n+1$ exactly.',
  err:'Reporting the system as unstable for every value of $a$, on the grounds that it has infinite memory. Infinite memory alone does not decide stability; whether the geometric series in part (c) converges does, and it converges for a whole open interval of $a$.',
  teach:'Evaluate the recursion for values of $a$ on both sides of the stability boundary. The numerical sequences should agree with the geometric-series condition.' },

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
     +'<b>Method.</b> Test $S_1$ and $S_2$ separately. Then substitute their rules to form the series connection and pass the same shifted-input counterexample through both stages.<br>'
     +'<b>Solution — part (a).</b> Let $x_1(t)=1$ for every $t$, so $w_1(t)=\\cos(t)$. Shift by $t_0=\\pi/2$: since $x_1$ is constant, the shifted input is again $x_2(t)=1$, and $S_1\\{x_2\\}(t)=\\cos(t)$. But $w_1(t-\\pi/2)=\\cos(t-\\pi/2)=\\sin(t)$. At $t=0$: $\\cos(0)=1\\neq0=\\sin(0)$. <b>$S_1$ alone is not time invariant.</b><br>'
     +'<b>Solution — part (b).</b> A pure delay only ever relocates its argument: $S_2\\{w(t-t_0)\\}=w(t-t_0-1)=w\\big((t-1)-t_0\\big)=y(t-t_0)$, for any signal $w$ and any $t_0$. <b>$S_2$ alone is time invariant.</b><br>'
     +'<b>Solution — part (c).</b> The series relation is $y(t)=w(t-1)=x(t-1)\\cos(t-1)$. Using $x_1(t)=1$ from part (a): $y_1(t)=\\cos(t-1)$. With the same shift $t_0=\\pi/2$ and $x_2(t)=x_1(t-\\pi/2)=1$: $T\\{x_2\\}(t)=x_2(t-1)\\cos(t-1)=\\cos(t-1)$, since $x_2$ is the same constant $1$. But $y_1(t-\\pi/2)=\\cos\\big((t-\\pi/2)-1\\big)=\\cos(t-1-\\pi/2)=\\sin(t-1)$. At $t=1$: $T\\{x_2\\}(1)=\\cos(0)=1$, while $y_1(1-\\pi/2)=\\sin(0)=0$. Since $1\\neq0$, <b>the series connection is not time invariant.</b><br>'
     +'<b>Solution — part (d).</b> $S_1$ is linear, since multiplying by the fixed function $\\cos(t)$ is linear in $x$; $S_2$ is linear, since a pure delay is linear. A series connection of two linear systems is linear. <b>The overall connection is linear.</b> This is confirmed directly: $T\\{x\\}(t)=x(t-1)\\cos(t-1)$ is a fixed function of $t$ multiplied by a relocated sample of $x$, with no product or power of $x$ itself.<br>'
     +'<b>Check.</b> $S_2$ only delays its input, so it delays the unequal responses produced by $S_1$ without making them equal. The values $\\cos(0)=1$ and $\\sin(0)=0$ remain unequal after the additional delay.',
  err:'Concluding that the series connection must be time invariant because $S_2$ is. A single time-invariant stage cannot restore a property that a different stage in the same chain has already lost.',
  teach:'Use this example to separate the closure results. Both stages are linear, so the series connection is linear. One stage is not time invariant, so the connection is not time invariant.' },

/* ----------------------------------------------------------------------
   Full-length questions. One system, all five properties, each answer
   carrying its own proof or its own counterexample.
   ---------------------------------------------------------------------- */

{ id:'D2-21', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y[n]=\\sum_{k=0}^{n+2}\\sin\\!\\left(\\tfrac{\\pi}{6}k\\right)x[k].$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer; an unjustified answer earns nothing.'],
  sol:'<b>Given.</b> A running weighted sum whose lower limit is fixed at $k=0$ and whose upper limit runs to $n+2$.<br>'
     +'<b>Find.</b> All five properties, each with a proof or a counterexample.<br>'
     +'<b>Method.</b> Use the summation limits to test memory and causality. Apply superposition for linearity. Use shifted impulses to test time invariance, and choose an input that matches the signs of the weights to test stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> $y[n]$ collects every sample from $k=0$ to $k=n+2$, so it depends on values of $x$ at indices other than $n$. For instance $y[3]$ uses $x[0]$ through $x[5]$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> For $x[k]=\\alpha x_1[k]+\\beta x_2[k]$,$$y[n]=\\sum_{k=0}^{n+2}\\sin\\!\\left(\\tfrac{\\pi}{6}k\\right)\\{\\alpha x_1[k]+\\beta x_2[k]\\}=\\alpha y_1[n]+\\beta y_2[n],$$because a finite sum of scaled terms splits. The weights do not involve $x$, so nothing non-linear enters.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x[n]=\\delta[n]$. Only $k=0$ survives, and $\\sin(0)=0$, so $y[n]=0$ for every $n\\ge-2$. Now take $x_1[n]=\\delta[n-1]$, a delay by one. Only $k=1$ survives, giving$$y_1[n]=\\sin\\!\\left(\\tfrac{\\pi}{6}\\right)=\\tfrac12\\quad\\text{for }n\\ge-1.$$If the system were time-invariant, $y_1[n]$ would equal $y[n-1]=0$. It does not, so the system is not time-invariant. Both the $k$-dependent weight and the fixed lower limit are responsible.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> The upper limit $n+2$ reaches two samples into the future: $y[0]$ uses $x[1]$ and $x[2]$.<br>'
     +'<b>Solution — (v) stable.</b> <b>No.</b> Choose the bounded input $x[k]=\\operatorname{sgn}\\!\\left(\\sin\\!\\left(\\tfrac{\\pi}{6}k\\right)\\right)$, so $|x[k]|\\le1$. Every term of the sum is then $\\left|\\sin\\!\\left(\\tfrac{\\pi}{6}k\\right)\\right|\\ge0$, and over each period of $12$ samples the terms add to a fixed positive amount. The running sum therefore grows without bound as $n\\to\\infty$, and a bounded input has produced an unbounded output.<br>'
     +'<b>Check.</b> The inputs in part (iii) differ only by a delay, so their unequal responses prove that the variable weight breaks time invariance. For stability, the absolute weights do not decay and do not have a finite sum. Therefore the growing window can produce an unbounded output.',
  err:'Calling the system stable because $\\left|\\sin\\!\\left(\\tfrac{\\pi}{6}k\\right)\\right|\\le1$ bounds each term. Each term being bounded says nothing when the number of terms grows with $n$; stability needs the weights to be absolutely summable, and a bounded non-decaying weight never is.',
  teach:'For part (iii), require the shifted impulse pair. A weight that depends on $k$ suggests failure, but the two unequal responses prove it.' },

{ id:'D2-22', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input-output relationship of a system.$$y(t)=(t+2)\\,x(t-3)$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A delay of three seconds followed by multiplication by the ramp $t+2$.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Treat the delay and the time-dependent gain separately. The delay determines memory and causality. Apply superposition for linearity, use a constant input for time invariance, and use a bounded constant input to test the unbounded gain for stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> $y(t)$ is built from $x(t-3)$, a value three seconds in the past, not from $x(t)$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> For $x=\\alpha x_1+\\beta x_2$,$$y(t)=(t+2)\\{\\alpha x_1(t-3)+\\beta x_2(t-3)\\}=\\alpha y_1(t)+\\beta y_2(t).$$Multiplying by a fixed function of $t$ is a linear operation on $x$: the factor never involves $x$ itself.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x(t)=u(t)$, so $y(t)=(t+2)u(t-3)$. Now delay the input by one second, $x_1(t)=u(t-1)$, giving$$y_1(t)=(t+2)u(t-4).$$The delayed response is $y(t-1)=(t+1)u(t-4)$. The two agree on where they switch on but not on their amplitude — at $t=5$, $y_1(5)=7$ while $y(4)=6$ — so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>Yes.</b> $y(t)$ uses only $x(t-3)$, and $t-3<t$ for every $t$. No future value is ever read.<br>'
     +'<b>Solution — (v) stable.</b> <b>No.</b> The bounded input $x(t)=1$ for all $t$ gives $y(t)=t+2$, which grows without bound as $t\\to\\infty$. A bounded input has produced an unbounded output.<br>'
     +'<b>Check.</b> The two failures have one cause and the two successes another. The factor $t+2$ is a function of $t$, which is what breaks time invariance, and it is unbounded, which is what breaks stability; the delay by $3$ is what makes the system causal and not memoryless, and it is innocent of both failures. Replacing $t+2$ by the constant $2$ would leave a system that is time-invariant and stable, with (i) and (iv) unchanged.',
  err:'Calling the system non-linear because of the factor $t+2$. Linearity is tested in $x$, not in $t$: a coefficient that depends on time is still a coefficient, and multiplying by it preserves both additivity and scaling.',
  teach:'Compare the gains $t+2$ and $\\cos t$. Both depend on time, but only $t+2$ is unbounded. This separates time invariance from stability.' },

{ id:'D2-23', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y(t)=\\Od\\{x(t)\\}=\\tfrac12[x(t)-x(-t)].$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> The system that returns the odd part of its input.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Compare the reflected input time $-t$ with $t$ for memory and causality. Apply superposition for linearity, use a shifted step for time invariance, and bound both terms for stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> $y(t)$ needs $x(-t)$ as well as $x(t)$, and for $t\\ne0$ these are values at two different instants. For instance $y(2)=\\tfrac12[x(2)-x(-2)]$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> Reflection and subtraction are both linear:$$\\tfrac12[\\{\\alpha x_1(t)+\\beta x_2(t)\\}-\\{\\alpha x_1(-t)+\\beta x_2(-t)\\}]=\\alpha y_1(t)+\\beta y_2(t).$$'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x(t)=u(t)$, so $y(t)=\\tfrac12[u(t)-u(-t)]$, which is $+\\tfrac12$ for $t>0$ and $-\\tfrac12$ for $t<0$. Now delay by one, $x_1(t)=u(t-1)$, giving$$y_1(t)=\\tfrac12[u(t-1)-u(-t-1)],$$which is $+\\tfrac12$ for $t>1$, $-\\tfrac12$ for $t<-1$, and $0$ in between. The delayed response $y(t-1)$ is $+\\tfrac12$ for $t>1$ and $-\\tfrac12$ for $t<1$, with no flat stretch at all. At $t=0$ the two differ, $y_1(0)=0$ against $y(-1)=-\\tfrac12$, so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> For $t<0$ the reflection reads the future: $y(-2)=\\tfrac12[x(-2)-x(2)]$ needs $x(2)$, four seconds ahead.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> If $|x(t)|\\le B$ for every $t$, then$$|y(t)|\\le\\tfrac12\\{|x(t)|+|x(-t)|\\}\\le\\tfrac12(B+B)=B,$$so the output is bounded by the same bound as the input.<br>'
     +'<b>Check.</b> In part (iii), the shifted input gives a zero interval that the shifted output does not have. The reflection remains centred at the origin while the input shift moves the signal, so the two operations do not commute.',
  err:'Answering (v) with "no", on the argument that the system reads the future and so cannot be well behaved. Causality and stability are independent: this system is stable and non-causal at once, and the bound $|y|\\le B$ holds whatever the system does with the time axis.',
  teach:'Compare this result with the even-part system. Both have the same five properties and the same output bound.' },

{ id:'D2-24', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y[n]=x[n]\\,x[n-2].$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A system that multiplies each sample by the sample two places behind it.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Compare the two input indices for memory and causality. Use two inputs to test additivity, shift both indices together for time invariance, and bound the product for stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> $y[n]$ needs $x[n-2]$ as well as $x[n]$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>No.</b> Take $x_1[n]=\\delta[n]$ and $x_2[n]=\\delta[n-2]$. Each alone gives zero output, since the two factors are never non-zero at the same index: $y_1[n]=y_2[n]=0$. Their sum $x[n]=\\delta[n]+\\delta[n-2]$ gives$$y[n]=\\{\\delta[n]+\\delta[n-2]\\}\\{\\delta[n-2]+\\delta[n-4]\\}=\\delta[n-2],$$because the term $\\delta[n-2]\\delta[n-2]$ survives. Additivity would require $y[n]=y_1[n]+y_2[n]=0$, and it does not hold.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>Yes.</b> Let $x_1[n]=x[n-n_0]$. Then$$y_1[n]=x_1[n]x_1[n-2]=x[n-n_0]x[n-n_0-2]=y[n-n_0].$$No coefficient depends on $n$, so a shift of the input produces exactly the shift of the output.<br>'
     +'<b>Solution — (iv) causal.</b> <b>Yes.</b> The output at $n$ uses the indices $n$ and $n-2$ only, neither of them in the future.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> If $|x[n]|\\le B$ then $|y[n]|=|x[n]||x[n-2]|\\le B^{2}$, a finite bound.<br>'
     +'<b>Check.</b> The counterexample in (ii) is the one to trust, because the easy test fails here: scaling alone does not expose the system, since $x\\to2x$ gives $y\\to4y$, which looks like a failure of homogeneity and is, but the cleaner demonstration is the additivity pair above, where two inputs with zero output produce a non-zero output together. Note that (iii) and (v) hold in spite of (ii): a non-linear system can be perfectly time-invariant and perfectly stable.',
  err:'Concluding from (ii) that the system cannot be time-invariant. Linearity and time invariance are independent properties; this system fails the first and satisfies the second, which is exactly why the two are tested separately.',
  teach:'Use the two inputs in part (ii) to test additivity directly. Each gives zero output, but their sum gives a non-zero output.' },

{ id:'D2-25', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input-output relationship of a system.$$y(t)=\\int_{-\\infty}^{2t}x(\\tau)\\,\\d\\tau$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A running integral whose upper limit is $2t$ rather than $t$.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Apply superposition to the integral for linearity. Use its upper limit for memory and causality, a shifted impulse for time invariance, and a bounded step input for stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> The output accumulates the whole past of the input, so it depends on values of $x$ at every instant up to $2t$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> Integration is linear:$$\\int_{-\\infty}^{2t}\\{\\alpha x_1(\\tau)+\\beta x_2(\\tau)\\}\\,\\d\\tau=\\alpha y_1(t)+\\beta y_2(t).$$'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x(t)=\\delta(t)$, so $y(t)=u(2t)=u(t)$: the step switches on at $t=0$. Delay the input by one, $x_1(t)=\\delta(t-1)$, and$$y_1(t)=u(2t-1)=u\\!\\left(t-\\tfrac12\\right),$$which switches on at $t=\\tfrac12$. The delayed response $y(t-1)=u(t-1)$ switches on at $t=1$. A delay of one at the input produced a delay of one half at the output, so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> For $t>0$ the upper limit $2t$ exceeds $t$, so the output reads the future: $y(1)$ integrates $x$ up to $\\tau=2$.<br>'
     +'<b>Solution — (v) stable.</b> <b>No.</b> The bounded input $x(t)=1$ gives $y(t)=\\int_{-\\infty}^{2t}\\d\\tau$, which is infinite for every $t$. Even the bounded input $x(t)=u(t)$ gives $y(t)=2t$ for $t>0$, unbounded.<br>'
     +'<b>Check.</b> In part (iii), the upper limit $2t$ changes an input delay of one into an output delay of one half. Replacing the upper limit by $t-3$ would preserve input delays. This confirms that the factor $2$ causes the time-invariance and causality failures, while the unbounded integration interval causes instability.',
  err:'Answering (iv) with "yes" because an integral only ever looks backwards. The integral looks backwards from its upper limit, and here that limit is ahead of the present time for every $t>0$.',
  teach:'Compare this system with the integrator whose upper limit is $t$. The changed limit changes the time-invariance and causality results.' },

{ id:'D2-26', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y[n]=n\\,x[n+1].$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> An advance by one sample, followed by multiplication by the index $n$.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Use the advanced input index for memory and causality. Apply superposition for linearity, a shifted impulse for time invariance, and a bounded constant input for stability of the unbounded coefficient.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> $y[n]$ is built from $x[n+1]$, not from $x[n]$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> $n\\{\\alpha x_1[n+1]+\\beta x_2[n+1]\\}=\\alpha y_1[n]+\\beta y_2[n]$. The coefficient $n$ does not involve $x$.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x[n]=\\delta[n]$, so $y[n]=n\\,\\delta[n+1]=-\\delta[n+1]$, a single sample of value $-1$ at $n=-1$. Delay by one, $x_1[n]=\\delta[n-1]$, and$$y_1[n]=n\\,\\delta[n]=0,$$identically zero, because the surviving index is $n=0$ and the coefficient there is zero. The delayed response $y[n-1]=-\\delta[n]$ is not zero, so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> $y[n]$ needs $x[n+1]$, one sample ahead.<br>'
     +'<b>Solution — (v) stable.</b> <b>No.</b> The bounded input $x[n]=1$ for every $n$ gives $y[n]=n$, which is unbounded as $n\\to\\infty$.<br>'
     +'<b>Check.</b> In part (iii), one response is zero and the other is not, so they cannot be equal. Parts (ii) and (v) also confirm that linearity does not imply stability: the operation is linear in $x$, but its coefficient is unbounded.',
  err:'Calling the system non-linear because the output depends on $n$. The test for linearity holds $n$ fixed and varies $x$; a coefficient that changes with $n$ leaves both additivity and scaling intact.',
  teach:'Replace the coefficient $n$ by $(-1)^{n}$ and repeat the tests. The coefficient still depends on $n$, but it is bounded, so stability changes while time invariance does not.' },

{ id:'D2-27', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input-output relationship of a system.$$y(t)=e^{x(t)}$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A memoryless non-linearity: the output at each instant is the exponential of the input at that instant.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Apply the zero-input test for linearity. Use the unshifted input argument for memory and causality, shift the rule for time invariance, and bound the exponential over the bounded input range for stability.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>Yes.</b> $y(t)$ depends on $x$ at the instant $t$ and at no other.<br>'
     +'<b>Solution — (ii) linear.</b> <b>No.</b> Use the zero-input test: $x(t)=0$ gives $y(t)=e^{0}=1$, not $0$. A linear system must map the zero signal to the zero signal. Scaling also fails because $e^{2x}=(e^{x})^{2}\\ne2e^{x}$ in general.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>Yes.</b> If $x_1(t)=x(t-t_0)$ then $y_1(t)=e^{x(t-t_0)}=y(t-t_0)$. The rule applied at each instant is the same rule at every instant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>Yes.</b> Every memoryless system is causal: the output at $t$ uses only the input at $t$, which is not in the future.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> If $|x(t)|\\le B$ then $-B\\le x(t)\\le B$, so $e^{-B}\\le y(t)\\le e^{B}$ and $|y(t)|\\le e^{B}$, a finite bound for every finite $B$.<br>'
     +'<b>Check.</b> The zero-input result is sufficient to disprove linearity because $S\\{0\\}=0$ is necessary. The stability bound may depend on the input bound $B$, but it does not depend on time, as BIBO stability requires.',
  err:'Calling the system unstable because $e^{x}$ grows quickly. Stability asks only that every bounded input give a bounded output, and $e^{B}$ is finite for every finite $B$. How fast the bound grows with $B$ is not part of the definition.',
  teach:'Compare this system with $y=x^{2}$ and $y=|x|$. These memoryless nonlinearities have the same results for memory, time invariance, causality and stability.' },

{ id:'D2-28', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y[n]=\\sum_{k=n-3}^{n+3}x[k].$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A moving sum over a window of seven samples centred on $n$.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Expand the finite window to test memory and causality. Apply superposition, shift both limits together for time invariance, and count the terms to obtain a stability bound.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> The window spans $x[n-3]$ to $x[n+3]$, seven samples in all.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> A finite sum of inputs splits term by term, and there are no coefficients to worry about.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>Yes.</b> With $x_1[n]=x[n-n_0]$, substituting $m=k-n_0$ gives$$y_1[n]=\\sum_{k=n-3}^{n+3}x[k-n_0]=\\sum_{m=n-n_0-3}^{n-n_0+3}x[m]=y[n-n_0].$$Both limits shift together, so the window travels with the signal.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> The window reaches to $n+3$, three samples ahead of the present.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> If $|x[n]|\\le B$ then $|y[n]|\\le7B$, since the sum has exactly seven terms whatever $n$ is.<br>'
     +'<b>Check.</b> The contrast with the running sum $\\sum_{k=0}^{n}x[k]$ is the whole point, and it comes down to the number of terms. Here that number is fixed at seven, so a bounded input gives a bounded output and the shift argument in (iii) goes through cleanly. There the number grows with $n$, and both properties are lost.',
  err:'Calling the system unstable by analogy with the accumulator. The accumulator is unstable because its window grows; a moving window of fixed length is a finite sum, and a finite sum of bounded terms is bounded.',
  teach:'Move the window to $k=n-6$ through $k=n$ and repeat the causality test. The delayed window uses no future samples and keeps the other properties.' },

{ id:'D2-29', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input-output relationship of a system.$$y(t)=x\\!\\left(\\tfrac{t}{3}\\right)$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A pure time scaling: the input is stretched by a factor of three.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Compare $t/3$ with $t$ on both sides of the origin for memory and causality. Apply superposition, use a shifted pulse for time invariance, and transfer the input bound to the output.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>No.</b> For $t\\ne0$ the instant $t/3$ is not $t$, so the output at $t$ is a value the input took at another time. For instance $y(6)=x(2)$.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> Relabelling the argument does not disturb sums or scalings: $\\{\\alpha x_1+\\beta x_2\\}\\!\\left(\\tfrac t3\\right)=\\alpha y_1(t)+\\beta y_2(t)$.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take the rectangular pulse $x(t)=u(t)-u(t-1)$, so $y(t)=u\\!\\left(\\tfrac t3\\right)-u\\!\\left(\\tfrac t3-1\\right)$, a pulse on $0<t<3$. Delay the input by one, $x_1(t)=x(t-1)$, and$$y_1(t)=x_1\\!\\left(\\tfrac t3\\right)=x\\!\\left(\\tfrac t3-1\\right),$$a pulse on $3<t<6$. The delayed response $y(t-1)$ is a pulse on $1<t<4$. A delay of one at the input produced a delay of three at the output, so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>No.</b> For $t<0$ the instant $t/3$ lies to the right of $t$: $y(-6)=x(-2)$, and $-2>-6$, so the output reads a value the input has not reached yet.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> The output takes only values the input takes, so $|x(t)|\\le B$ gives $|y(t)|\\le B$ directly.<br>'
     +'<b>Check.</b> Part (iv) is the answer students most often get wrong, and the sign of $t$ is the reason. For $t>0$ the reading point $t/3$ is in the past and nothing is wrong; the failure happens entirely on the negative axis. One instant is enough to show it, and $t=-6$ does.<br>'
     +'Part (iii) then confirms the general rule: a scaling by $a$ turns a delay of $t_0$ into a delay of $t_0/a$, and only $a=1$ leaves it unchanged.',
  err:'Answering (iv) with "yes" after checking only positive $t$. The definition of causality quantifies over every instant, and for a time scaling the negative axis is where it fails.',
  teach:'Plot the two pulses from part (iii) on the same axis. Their different locations show that the two time-shift operations do not agree.' },

{ id:'D2-30', module:'M2', type:'full', src:'MT1 Q2',
  stem:'Consider the following input and output relationship of a system$$y(t)=x(t)\\cos(3t).$$',
  parts:['Determine whether the system is memoryless.',
         'Determine whether the system is linear.',
         'Determine whether the system is time-invariant.',
         'Determine whether the system is causal.',
         'Determine whether the system is stable. Justify every answer.'],
  sol:'<b>Given.</b> A modulator: the input is multiplied by a fixed carrier.<br>'
     +'<b>Find.</b> All five properties.<br>'
     +'<b>Method.</b> Apply superposition to multiplication by the fixed carrier. Use a constant input and a specific shift for time invariance. Use the carrier bound for stability, and inspect the input argument for memory and causality.<br>'
     +'<b>Solution — (i) memoryless.</b> <b>Yes.</b> $y(t)$ uses $x$ at the instant $t$ only; the carrier is not an input.<br>'
     +'<b>Solution — (ii) linear.</b> <b>Yes.</b> $\\{\\alpha x_1(t)+\\beta x_2(t)\\}\\cos(3t)=\\alpha y_1(t)+\\beta y_2(t)$: multiplication by a fixed function of $t$ preserves both additivity and scaling.<br>'
     +'<b>Solution — (iii) time-invariant.</b> <b>No.</b> Take $x(t)=1$, so $y(t)=\\cos(3t)$. Delay the input by $t_0=\\tfrac{\\pi}{3}$; the delayed input is still $x_1(t)=1$, so $y_1(t)=\\cos(3t)$. The delayed response is$$y(t-t_0)=\\cos(3t-\\pi)=-\\cos(3t),$$the negative of $y_1(t)$. A delay left the input alone and changed the output, so the system is not time-invariant.<br>'
     +'<b>Solution — (iv) causal.</b> <b>Yes.</b> A memoryless system is always causal.<br>'
     +'<b>Solution — (v) stable.</b> <b>Yes.</b> $|y(t)|=|x(t)||\\cos(3t)|\\le B\\cdot1=B$.<br>'
     +'<b>Check.</b> The counterexample in (iii) is the strongest kind available: the input is invariant under the shift, so any change at all in the output proves the failure. Compare with the system $y(t)=(t+2)x(t-3)$, which fails (iii) for the same reason — a coefficient depending on $t$ — but fails (v) as well, because its coefficient is unbounded while $\\cos(3t)$ is not.',
  err:'Calling the system non-linear because two signals are multiplied. Linearity fails only when the input is multiplied by itself or by another input; here one factor is a fixed function of time, which is a coefficient and nothing more.',
  teach:'Module 5 uses the same rule as a modulator. Here the property test shows that multiplication by the carrier is linear, causal and stable, but not time invariant.' }

]);

window.DRILLMAP_M2 = [

{ id:'m2-drill-map', module:'M2', nav:'Module 2 · question types',
  title:'Module 2 — what a question looks like', src:'pp. 11–14',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 2 question types system properties linearity time invariance causality stability invertibility interconnection series parallel feedback taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Question types', src:'pp. 11–14'},
  {t:'title', text:'Four disguises for one question, a fifth entirely its own, and a sixth that asks them together'},
  {t:'lede', text:'Most questions give an input-output rule and ask for five properties. The remaining questions ask how system properties change under interconnection or whether the input can be recovered.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M2'},
  {t:'note', kind:'warn', head:'Use a proof or a counterexample', html:'To establish a property, prove it for every input. To disprove it, give one input, or one pair of inputs and one shift, for which the definition fails. For an interconnection, first state which properties are preserved by addition or composition.'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M2 = [

{ id:'m2-drill', module:'M2', nav:'Module 2 · practice questions',
  title:'Module 2 — practice questions', src:'pp. 11–14',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 2 practice memoryless linear time invariant causal stable counterexample invertibility interconnection series parallel feedback block diagram',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 2 · Practice D2-01 … D2-30', src:'pp. 11–14'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Give a proof or a named counterexample for every result. Use $S\\{0\\}=0$ as a necessary test for linearity, and use memoryless $\\Rightarrow$ causal as a check. For an interconnection, derive the complete input-output rule before testing its properties.'},
  {t:'rule', short:true},
  {t:'drill', module:'M2'}
]}

];
})();
