/* Course notes — Chapter 4, Fourier series */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:52,r:22,t:24,b:32},xtarget:8,ytarget:3},o));
const rectWave=(t,T,T1)=>{const u=t-T*Math.round(t/T);return Math.abs(u)<T1?1:0;};
const rectPS=(t,N,T,T1)=>{let s=2*T1/T;
  for(let k=1;k<=N;k++) s+=2*Math.sin(2*Math.PI*k*T1/T)/(Math.PI*k)*Math.cos(2*Math.PI*k*t/T);
  return s;};
const dtRect=(k,N,N1)=>{const r=k/N;
  if(Math.abs(r-Math.round(r))<1e-12) return (2*N1+1)/N;
  return Math.sin(2*Math.PI*k*(N1+0.5)/N)/(N*Math.sin(Math.PI*k/N));};

window.C4 = [
{t:'page'},

{t:'h1', num:'CHAPTER 4', text:'Fourier series'},
{t:'p', lead:true, text:'Fourier series are used to calculate the response of a linear time-invariant system to a periodic signal. Complex exponentials are eigenfunctions of every LTI system, and periodic signals can be represented as sums of these exponentials. This representation replaces convolution by one multiplication at each harmonic frequency.'},

{t:'h2', num:'4.1', text:'Eigenfunctions of a linear time-invariant system'},
{t:'box', html:'<span class="t">Definition</span>A signal is an <b>eigenfunction</b> of a system when the output is that same signal multiplied by a constant. The constant is the <b>eigenvalue</b>.'},
{t:'p', text:'Put $x(t)=e^{st}$, with $s$ any complex number, into the convolution integral. Write both limits; they are $-\\infty$ and $\\infty$ throughout this chapter. Then split the exponential with $e^{s(t-\\tau)}=e^{st}e^{-s\\tau}$. The factor $e^{st}$ does not depend on $\\tau$, so it moves outside the integral.'},
{t:'eq', tex:'\\begin{aligned}y(t)&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{s(t-\\tau)}\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{st}e^{-s\\tau}\\,\\d\\tau\\\\&=e^{st}\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau.\\end{aligned}'},
{t:'p', text:'The second factor does not depend on $t$. It is a number attached to the value of $s$, and it is called the transfer function. The same steps apply in discrete time. Put $x[n]=z^{n}$ into the convolution sum and use $z^{n-k}=z^{n}z^{-k}$; the factor $z^{n}$ does not depend on $k$, so it moves outside the sum.'},
{t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,x[n-k]=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{n-k}\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{n}z^{-k}=z^{n}\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}.\\end{aligned}'},
{t:'eqbox', cap:'Eigenfunction property',
 tex:['e^{st}\\;\\to\\;h(t)\\;\\to\\;H(s)e^{st},\\qquad H(s)=\\int_{-\\infty}^{\\infty}h(\\tau)e^{-s\\tau}\\,\\d\\tau',
      'z^{n}\\;\\to\\;h[n]\\;\\to\\;H(z)z^{n},\\qquad H(z)=\\sum_{k=-\\infty}^{\\infty}h[k]z^{-k}'],
 after:'The discrete-time output is a sequence, $y[n]=H(z)z^{n}$. Nothing in that line is a function of a continuous variable, and writing the continuous-time result there is the commonest slip in this section.'},
{t:'p', text:'Setting $s=j\\omega$ and $z=e^{j\\omega}$ with $\\omega$ real gives the two <b>frequency responses</b>, $H(j\\omega)$ and $H(e^{j\\omega})$. The discrete-time one repeats every $2\\pi$ in $\\omega$, because $e^{j(\\omega+2\\pi)k}=e^{j\\omega k}$ for integer $k$. The continuous-time one does not repeat at all.'},
{t:'fig', svg:()=>P.blocks({w:700,h:170,items:[
  {t:'arrow',x1:60,y1:60,x2:250,y2:60},{t:'box',x:250,y:36,w:150,h:48,label:'h(t)',tex:true},
  {t:'arrow',x1:400,y1:60,x2:600,y2:60},
  {t:'text',x:150,y:48,label:'e^{st}',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:500,y:48,label:'H(s)e^{st}',tex:true,fs:15,color:'#4A7A46'},
  {t:'arrow',x1:60,y1:135,x2:250,y2:135},{t:'box',x:250,y:111,w:150,h:48,label:'h[n]',tex:true},
  {t:'arrow',x1:400,y1:135,x2:600,y2:135},
  {t:'text',x:150,y:123,label:'z^{n}',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:500,y:123,label:'H(z)z^{n}',tex:true,fs:15,color:'#4A7A46'}
]}), cap:'The two statements, side by side, so that neither can borrow the other’s variables.'},

{t:'ex', hd:'Example 4.1 — a pure delay', rows:[
 ['Given','An LTI system with $y(t)=x(t-3)$.'],
 ['Find','The output for $x(t)=e^{j2t}$, and for $x(t)=\\cos(4t)+\\cos(7t)$, using eigenfunctions only.'],
 ['Method','The inputs are complex exponentials, so the eigenfunction method applies. Write $h$ from the delay definition, integrate to obtain $H(s)$, and multiply each exponential by the corresponding value of $H$.'],
 ['Solution','A delay by 3 is convolution with $\\delta(t-3)$, because $x(t)*\\delta(t-3)=x(t-3)$. So $h(t)=\\delta(t-3)$. Put this into the definition of $H(s)$ and use the sifting property, which replaces $\\tau$ by $3$ in the exponential: $$H(s)=\\int_{-\\infty}^{\\infty}\\delta(\\tau-3)\\,e^{-s\\tau}\\,\\d\\tau=e^{-3s}.$$ For $x(t)=e^{j2t}$ the exponent gives $s=j2$, so $$y(t)=H(j2)\\,e^{j2t}=e^{-j6}e^{j2t}=e^{j2(t-3)}.$$ For the cosines, first write each one as two exponentials with Euler’s relation, then multiply each exponential by its own eigenvalue. For $\\cos(4t)$ the two values of $s$ are $\\pm j4$, with $H(j4)=e^{-j12}$ and $H(-j4)=e^{+j12}$: $$\\begin{aligned}\\cos(4t)&=\\tfrac12e^{j4t}+\\tfrac12e^{-j4t}\\\\&\\to\\tfrac12e^{-j12}e^{j4t}+\\tfrac12e^{j12}e^{-j4t}\\\\&=\\tfrac12e^{j4(t-3)}+\\tfrac12e^{-j4(t-3)}\\\\&=\\cos\\bigl(4(t-3)\\bigr).\\end{aligned}$$ The same steps with $s=\\pm j7$ and $H(\\pm j7)=e^{\\mp j21}$ give $\\cos\\bigl(7(t-3)\\bigr)$. The system is linear, so the two outputs add: $$y(t)=\\cos\\bigl(4(t-3)\\bigr)+\\cos\\bigl(7(t-3)\\bigr).$$'],
 ['Check','Apply $y(t)=x(t-3)$ directly to both inputs. The answers agree. Note also that $|H(j\\omega)|=1$ and $\\angle H(j\\omega)=-3\\omega$: a delay changes no amplitude and adds a phase proportional to frequency.']
]},
{t:'p', text:'This result gives the method used in the rest of the chapter. If $x=\\sum_k a_ke^{s_kt}$, multiply each term by its eigenvalue to obtain $y=\\sum_k a_kH(s_k)e^{s_kt}$. The next sections show how to write periodic signals in this form.'},

{t:'h2', num:'4.2', text:'Existence: the Dirichlet conditions'},
{t:'p', text:'Not every signal can be decomposed into complex exponentials. Periodic signals can, provided they satisfy three conditions. Let $x(t)=x(t+T)$ for every $t$.'},
{t:'ol', items:[
 'Over one period, $x$ is absolutely integrable: $\\int_{T}|x(t)|\\,\\d t<\\infty$.',
 'In any finite interval, $x$ has only a finite number of maxima and minima.',
 'In any finite interval, $x$ has only a finite number of discontinuities, and each is finite.'
]},
{t:'box', kind:'ok', html:'<span class="t">Sufficient, not necessary</span>A signal meeting all three has a Fourier series that converges to it wherever it is continuous, and to the midpoint of the jump at a discontinuity. A signal failing one of them may still have a series. The conditions guarantee; they do not exclude.'},
{t:'p', text:'The three are independent. The signal $1/t$ on each period fails the first while the other two hold. The signal $\\sin(2\\pi/t)$ has finite area but oscillates infinitely often, failing only the second. A staircase whose steps halve in height and width satisfies the first two and fails the third.'},

{t:'h2', num:'4.3', text:'The synthesis and analysis equations'},
{t:'eqbox', cap:'Continuous-time Fourier series',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0t},\\qquad \\omega_0=\\frac{2\\pi}{T_0}',
      'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0t}\\,\\d t'],
 after:'The first equation is synthesis, the second is analysis. One period symbol is used throughout: $T_0$, with $\\omega_0=2\\pi/T_0$ stated once here. The sign of the exponent is the only thing that separates the pair.'},
{t:'h3', text:'Proof of the analysis equation'},
{t:'p', text:'The goal is to isolate one coefficient, $a_n$. Multiply the synthesis equation by $e^{-jn\\omega_0t}$ and integrate over one period. The sum and the integral can be exchanged, and $a_k$ does not depend on $t$, so it moves outside the integral. The two exponentials combine because $e^{jk\\omega_0t}e^{-jn\\omega_0t}=e^{j(k-n)\\omega_0t}$.'},
{t:'eq', tex:'\\begin{aligned}\\int_{T_0}x(t)e^{-jn\\omega_0t}\\,\\d t&=\\int_{T_0}\\Bigl(\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\Bigr)e^{-jn\\omega_0t}\\,\\d t\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t.\\end{aligned}'},
{t:'p', text:'Now evaluate the inner integral from $-T_0/2$ to $T_0/2$. Take $k\\neq n$ first, so that the antiderivative may divide by $k-n$. At the limits $\\omega_0T_0/2=\\pi$, and the difference of the two exponentials is $2j$ times a sine, by $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$.'},
{t:'eq', tex:'\\begin{aligned}\\int_{-T_0/2}^{T_0/2}e^{j(k-n)\\omega_0t}\\,\\d t&=\\left.\\frac{e^{j(k-n)\\omega_0t}}{j(k-n)\\omega_0}\\right|_{-T_0/2}^{T_0/2}=\\frac{e^{j(k-n)\\pi}-e^{-j(k-n)\\pi}}{j(k-n)\\omega_0}\\\\&=\\frac{2j\\sin\\bigl((k-n)\\pi\\bigr)}{j(k-n)\\omega_0}=\\frac{2\\sin\\bigl((k-n)\\pi\\bigr)}{(k-n)\\omega_0}\\\\&=T_0\\,\\frac{\\sin\\bigl((k-n)\\pi\\bigr)}{(k-n)\\pi}=0,\\qquad k\\neq n.\\end{aligned}'},
{t:'p', text:'The last line uses $\\omega_0=2\\pi/T_0$, so $2/\\omega_0=T_0/\\pi$. The value is zero because $k-n$ is a non-zero integer, and the sine of an integer multiple of $\\pi$ is zero. For $k=n$ the exponent is zero, the integrand is the constant 1, and the integral is the length of the period: $\\int_{-T_0/2}^{T_0/2}1\\,\\d t=T_0$. The same value comes from the limit $(k-n)\\to0$ of the sine ratio, because $\\sin\\theta/\\theta\\to1$.'},
{t:'eqbox', cap:'Orthogonality of complex exponentials',
 tex:['\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t=\\begin{cases}T_0,&k=n\\\\0,&k\\neq n\\end{cases}'],
 after:'Only the term with $k=n$ survives in the sum, so $\\int_{T_0}x(t)e^{-jn\\omega_0t}\\d t=a_nT_0$. Dividing both sides by $T_0$ gives the analysis equation, $a_n=\\frac{1}{T_0}\\int_{T_0}x(t)e^{-jn\\omega_0t}\\,\\d t$.'},
{t:'box', html:'<span class="t">The DC term</span>Setting $k=0$ makes the exponential 1, so $$a_0=\\frac{1}{T_0}\\int_{T_0}x(t)\\,\\d t,$$ the average value of the signal over one period. Use this fact to check a coefficient calculation: calculate or estimate the mean directly from the signal and compare it with $a_0$.'},

{t:'h3', text:'Fundamental period of a sum'},
{t:'p', text:'A sum of periodic signals is periodic when the ratio of every pair of component periods is rational. The fundamental period of the sum is the smallest positive number that is a whole multiple of each component period. Write each period as a fraction in lowest terms:'},
{t:'eqbox', cap:'Period of a sum',
 tex:['T_0=\\operatorname{LCM}\\!\\left(\\frac{p_1}{q_1},\\frac{p_2}{q_2},\\dots\\right)=\\frac{\\operatorname{LCM}(p_1,p_2,\\dots)}{\\operatorname{GCD}(q_1,q_2,\\dots)}'],
 after:'The result is a least common multiple of fractions, so it need not be an integer. A constant term has no period and is left out.'},
{t:'box', kind:'err', html:'<span class="t">Where this goes wrong</span>Putting every period over one common denominator first, then taking the least common multiple of the numerators, is the same rule in disguise — because for equal denominators $\\operatorname{LCM}(d,d)=\\operatorname{GCD}(d,d)=d$. Applying $\\operatorname{LCM}$ to the denominators <em>without</em> that rewrite is wrong: for periods $2/9$ and $8/21$ it gives $8/63$, which is a multiple of neither. The correct answer is $\\operatorname{LCM}(2,8)/\\operatorname{GCD}(9,21)=8/3$. Always divide the answer by each period and confirm both results are whole numbers.'},

{t:'ex', hd:'Example 4.2 — coefficients of a sum of sinusoids', rows:[
 ['Given','$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$.'],
 ['Find','Every Fourier series coefficient, with magnitude and phase.'],
 ['Method','Find $T_0$, hence $\\omega_0$. Expand with Euler’s relations and match each exponent to $jk\\omega_0t$.'],
 ['Solution','First the period. $\\cos(2\\pi t)$ repeats every $2\\pi/(2\\pi)=1$ s and $\\sin(3\\pi t)$ every $2\\pi/(3\\pi)=2/3$ s. In lowest terms these are $1/1$ and $2/3$, so $T_0=\\operatorname{LCM}(1,2)/\\operatorname{GCD}(1,3)=2$ s and $\\omega_0=2\\pi/T_0=\\pi$ rad/s. Check by division: $2/1=2$ and $2/(2/3)=3$, both whole. Now expand each sinusoid with Euler’s relations, $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$: $$\\begin{aligned}\\tfrac12\\cos(2\\pi t)&=\\tfrac12\\cdot\\tfrac12\\bigl(e^{j2\\pi t}+e^{-j2\\pi t}\\bigr)=\\tfrac14e^{j2\\pi t}+\\tfrac14e^{-j2\\pi t},\\\\\\sin(3\\pi t)&=\\tfrac{1}{2j}\\bigl(e^{j3\\pi t}-e^{-j3\\pi t}\\bigr)=\\tfrac{1}{2j}e^{j3\\pi t}-\\tfrac{1}{2j}e^{-j3\\pi t}.\\end{aligned}$$ Each exponent must be matched to $jk\\omega_0t=jk\\pi t$. Here $2\\pi t=2\\omega_0t$, so $k=\\pm2$, and $3\\pi t=3\\omega_0t$, so $k=\\pm3$. The constant is $1\\cdot e^{j0\\omega_0t}$, so $k=0$. Collecting the terms, $$x(t)=1e^{j0\\omega_0t}+\\tfrac14e^{j2\\omega_0t}+\\tfrac14e^{-j2\\omega_0t}+\\tfrac{1}{2j}e^{j3\\omega_0t}-\\tfrac{1}{2j}e^{-j3\\omega_0t},$$ so $a_0=1$, $a_{\\pm2}=1/4$, $a_3=1/(2j)$, $a_{-3}=-1/(2j)$, and every other coefficient is zero.'],
 ['Check','$a_0=1$ is also the average of the signal: both sinusoids complete whole cycles in one period and average to zero, leaving the constant. Magnitudes: $|a_0|=1$, $|a_{\\pm2}|=1/4$, $|a_{\\pm3}|=1/2$. Phases: $1/(2j)=-j/2$, so $\\angle a_3=-\\pi/2$, and $a_{-3}=+j/2$, so $\\angle a_{-3}=+\\pi/2$. The signal is real, so magnitudes must be even in $k$ and phases odd, and they are.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax({w:340,h:190,xr:[-4,4],yr:[-0.15,1.25],xlabel:'k',ylabel:'|a_k|',xtarget:5,ytarget:3});
   a.stem(D(k=>k===0?1:(Math.abs(k)===2?0.25:(Math.abs(k)===3?0.5:0)),-4,4),{color:C.in}); return a.svg();},
  cap:'Magnitudes, even in $k$.'},
 {svg:()=>{const a=ax({w:340,h:190,xr:[-4,4],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;[\\text{rad}]',xtarget:5,
     yticksOverride:[-Math.PI/2,0,Math.PI/2],ytickfmt:v=>v.toFixed(2)});
   a.stem(D(k=>k===3?-Math.PI/2:(k===-3?Math.PI/2:0),-4,4),{color:C.mid,showZero:true}); return a.svg();},
  cap:'Phases, odd in $k$. A value of $\\pm1.57$ rad is $\\pm\\pi/2$.'}
]},

{t:'h2', num:'4.4', text:'Two standard waveforms'},
{t:'ex', hd:'Example 4.3 — the periodic rectangular wave', rows:[
 ['Given','$x(t)=1$ for $|t|<T_1$ and $0$ for $T_1<|t|<T_0/2$, repeated with period $T_0$.'],
 ['Find','Every coefficient.'],
 ['Method','Apply the analysis equation over $-T_0/2$ to $T_0/2$. The signal is 1 only on $[-T_1,T_1]$, so those become the limits. The case $k=0$ is separate, because the antiderivative divides by $k$.'],
 ['Solution','Start from the analysis equation with the period from $-T_0/2$ to $T_0/2$. The signal is zero for $T_1<|t|<T_0/2$, so those parts of the integral drop out and the limits shrink to $\\pm T_1$: $$a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}x(t)e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\cdot e^{-jk\\omega_0t}\\,\\d t.$$ For $k=0$ the integrand is 1, so $a_0=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\,\\d t=\\frac{2T_1}{T_0}$. For $k\\neq0$, integrate the exponential, evaluate the two limits, and turn the difference of exponentials into a sine with $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$: $$\\begin{aligned}a_k&=\\frac{1}{T_0}\\left.\\frac{e^{-jk\\omega_0t}}{-jk\\omega_0}\\right|_{-T_1}^{T_1}=\\frac{1}{T_0}\\cdot\\frac{e^{-jk\\omega_0T_1}-e^{jk\\omega_0T_1}}{-jk\\omega_0}\\\\&=\\frac{1}{T_0}\\cdot\\frac{e^{jk\\omega_0T_1}-e^{-jk\\omega_0T_1}}{jk\\omega_0}=\\frac{1}{T_0}\\cdot\\frac{2j\\sin(k\\omega_0T_1)}{jk\\omega_0}\\\\&=\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0T_0}.\\end{aligned}$$ The second line changes the sign of both numerator and denominator, which leaves the fraction unchanged. Finally replace $\\omega_0$ by $2\\pi/T_0$. The denominator becomes $k\\omega_0T_0=2\\pi k$, and the argument becomes $k\\omega_0T_1=2\\pi kT_1/T_0$, so $$a_k=\\frac{2\\sin(2\\pi kT_1/T_0)}{2\\pi k}=\\frac{\\sin\\!\\left(2\\pi kT_1/T_0\\right)}{\\pi k},\\qquad k\\neq0.$$'],
 ['Check','As $k\\to0$ the second branch tends to $2T_1/T_0$, because $\\sin\\theta/\\theta\\to1$. It therefore agrees with the branch for $k=0$. The signal is real and even, so the coefficients must be real and even. The formula has this property because $\\sin$ and $k$ are both odd. The zeros occur when $k$ is a non-zero multiple of $T_0/(2T_1)$.']
]},
{t:'h3', text:'The envelope, and the samples taken from it'},
{t:'p', text:'These coefficients are values of one continuous function of $\\omega$, read at equally spaced points. Write the function first:'},
{t:'eqbox', cap:'Envelope of a single pulse',
 tex:['E(\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\left.\\frac{e^{-j\\omega t}}{-j\\omega}\\right|_{-T_1}^{T_1}=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}=\\frac{2\\sin(\\omega T_1)}{\\omega}',
      'a_k=\\frac{1}{T_0}E(k\\omega_0)=\\frac{1}{T_0}\\cdot\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0}=\\frac{\\sin\\!\\left(2\\pi kT_1/T_0\\right)}{\\pi k}'],
 after:'The first line is the integral of Example 4.3 with $k\\omega_0$ replaced by a free variable $\\omega$. The second line puts $\\omega=k\\omega_0$ back and repeats the substitution $\\omega_0=2\\pi/T_0$. $E$ depends on the shape of one pulse and not on how often it repeats. In the unnormalised convention $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, it is $E(\\omega)=2T_1\\operatorname{sinc}(\\omega T_1)$.'},
{t:'box', kind:'err', html:'<span class="t">Two objects, not one</span>$E(\\omega)$ is a function of a continuous variable; $a_k$ is a sequence indexed by an integer. Evaluating the envelope at the single point $\\omega=\\omega_0$ gives $T_0a_1$, the first harmonic only. As a function of the harmonic index the coefficient is $T_0a_k=T_0\\sin(2\\pi kT_1/T_0)/(\\pi k)$, with $k$ present in both places. Never join the tops of coefficient stems with a line: it claims the signal contains frequencies between the harmonics, which a periodic signal does not.'},
{t:'p', text:'Increase $T_0$ while keeping the pulse fixed. The envelope remains the same. The spacing $\\omega_0=2\\pi/T_0$ decreases, and every coefficient decreases as $1/T_0$. The next chapter uses this limiting process to define the Fourier transform.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({w:225,h:150,xr:[-16,16],yr:[-0.16,0.58],xlabel:'k',ylabel:'a_k',xtarget:3,ytarget:3});
   a.stem(D(k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k),-16,16),{color:C.in,r:2.2,showZero:true}); return a.svg();}, cap:'$T_0=4T_1$.'},
 {svg:()=>{const a=ax({w:225,h:150,xr:[-16,16],yr:[-0.08,0.29],xlabel:'k',ylabel:'a_k',xtarget:3,ytarget:3});
   a.stem(D(k=>k===0?0.25:Math.sin(Math.PI*k/4)/(Math.PI*k),-16,16),{color:C.in,r:2.2,showZero:true}); return a.svg();}, cap:'$T_0=8T_1$.'},
 {svg:()=>{const a=ax({w:225,h:150,xr:[-16,16],yr:[-0.04,0.15],xlabel:'k',ylabel:'a_k',xtarget:3,ytarget:3});
   a.stem(D(k=>k===0?0.125:Math.sin(Math.PI*k/8)/(Math.PI*k),-16,16),{color:C.in,r:2.2,showZero:true}); return a.svg();}, cap:'$T_0=16T_1$.'}
]},

{t:'ex', hd:'Example 4.4 — the sawtooth wave', rows:[
 ['Given','$x(t)=t$ for $-T_0/2<t<T_0/2$, repeated with period $T_0$.'],
 ['Find','Every coefficient.'],
 ['Method','The signal is odd, so its DC term is zero; direct integration below confirms this. For $k\\neq0$, the integrand contains $t$ times an exponential, so use integration by parts with $u=t$ and $\\d v=e^{at}\\d t$: $$\\int te^{at}\\,\\d t=\\frac{te^{at}}{a}-\\int\\frac{e^{at}}{a}\\,\\d t=\\frac{te^{at}}{a}-\\frac{e^{at}}{a^{2}}=\\frac{(at-1)e^{at}}{a^{2}}.$$'],
 ['Solution','The DC term: $$a_0=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,\\d t=\\frac{1}{T_0}\\left.\\frac{t^{2}}{2}\\right|_{-T_0/2}^{T_0/2}=\\frac{1}{T_0}\\left(\\frac{T_0^{2}}{8}-\\frac{T_0^{2}}{8}\\right)=0.$$ For $k\\neq0$, substitute the signal into the analysis equation and write $a=-jk\\omega_0$, so that the by-parts formula applies: $$a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\cdot\\frac{1}{a^{2}}\\Bigl[(at-1)e^{at}\\Bigr]_{-T_0/2}^{T_0/2}.$$ At the limits, $aT_0/2=-jk\\omega_0T_0/2=-jk\\pi$, because $\\omega_0T_0/2=\\pi$. Also $e^{\\pm jk\\pi}=\\cos(k\\pi)\\pm j\\sin(k\\pi)=\\cos(k\\pi)=(-1)^{k}$, since $\\sin(k\\pi)=0$. Both exponentials therefore equal $(-1)^{k}$, and this common factor comes out of the bracket: $$\\begin{aligned}\\Bigl[(at-1)e^{at}\\Bigr]_{-T_0/2}^{T_0/2}&=(-jk\\pi-1)e^{-jk\\pi}-(jk\\pi-1)e^{jk\\pi}\\\\&=(-1)^{k}\\bigl[(-jk\\pi-1)-(jk\\pi-1)\\bigr]=(-1)^{k}(-2jk\\pi).\\end{aligned}$$ Next, $a^{2}=(-jk\\omega_0)^{2}=j^{2}k^{2}\\omega_0^{2}=-k^{2}\\omega_0^{2}$. Dividing, $$a_k=\\frac{1}{T_0}\\cdot\\frac{(-1)^{k}(-2jk\\pi)}{-k^{2}\\omega_0^{2}}=\\frac{1}{T_0}\\cdot\\frac{2j\\pi(-1)^{k}}{k\\omega_0^{2}}.$$ Finally $\\omega_0^{2}=4\\pi^{2}/T_0^{2}$, so $\\frac{1}{T_0}\\cdot\\frac{2j\\pi}{k\\omega_0^{2}}=\\frac{1}{T_0}\\cdot\\frac{2j\\pi T_0^{2}}{4\\pi^{2}k}=\\frac{jT_0}{2\\pi k}$, and $$a_k=\\frac{jT_0(-1)^{k}}{2k\\pi},\\qquad k\\neq0.$$'],
 ['Check','The signal is real and odd, so the coefficients must be purely imaginary, and they are. For $T_0=1$ the largest is $|a_{\\pm1}|=1/(2\\pi)\\approx0.159$. Every phase is $+\\pi/2$ or $-\\pi/2$, with the sign alternating in $k$ and flipping again with the sign of $k$.']
]},
{t:'ex', hd:'Example 4.5 — the periodic impulse train', rows:[
 ['Given','$x(t)=\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)$.'],
 ['Find','Every coefficient.'],
 ['Method','Take the period from $-T_0/2$ to $+T_0/2$. Exactly one impulse lies inside it, so sifting finishes the integral.'],
 ['Solution','Substitute the impulse train into the analysis equation. Inside $-T_0/2<t<T_0/2$ only the term $m=0$, which is $\\delta(t)$, is non-zero; the impulses at $t=\\pm T_0,\\pm2T_0,\\dots$ lie outside the interval and contribute nothing. Then sift, which sets $t=0$ in the exponential: $$\\begin{aligned}a_k&=\\frac{1}{T_0}\\int_{-T_0/2}^{+T_0/2}\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T_0}\\int_{-T_0/2}^{+T_0/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\,e^{-jk\\omega_0\\cdot0}=\\frac{1}{T_0}\\end{aligned}$$ for every $k$.'],
 ['Check','Both limits must be written and must differ. An interval with equal endpoints has zero length, so every integral over it is zero. The result is real, positive, and equal at every harmonic. At $t=0$, every harmonic has value 1 and their contributions add. At other times, the positive and negative contributions cancel.']
]},

{t:'h2', num:'4.5', text:'How many harmonics are enough'},
{t:'eqbox', cap:'Truncation and its error',
 tex:['x_N(t)=\\sum_{k=-N}^{N}a_ke^{jk\\omega_0t},\\qquad e_N(t)=x(t)-x_N(t)',
      '\\text{MSE}=\\frac{1}{T_0}\\int_{T_0}\\bigl|e_N(t)\\bigr|^{2}\\,\\d t=\\sum_{|k|>N}\\bigl|a_k\\bigr|^{2}'],
 after:'The second form follows from Parseval’s relation in Section 4.7. By linearity, $e_N=x-x_N$ has coefficients $a_k-a_k=0$ for $|k|\\le N$ and $a_k-0=a_k$ for $|k|>N$. Parseval’s relation then gives $\\frac{1}{T_0}\\int_{T_0}|e_N(t)|^{2}\\,\\d t=\\sum_{|k|>N}|a_k|^{2}$. It turns a question about a difference of signals into a question about a tail of a series.'},
{t:'box', kind:'err', html:'<span class="t">The Gibbs phenomenon</span>Near a jump the partial sum overshoots, and the overshoot does not shrink as $N$ grows: its height settles at about <b>8.95% of the size of the jump</b>. What does shrink is its width. That is how the mean-square error can go to zero while the largest error does not.'},
{t:'table', head:['$N$','Rectangular wave, $T_0=4T_1$','Sawtooth, $T_0=1$'], rows:[
 ['3','$0.025$','$0.0144$'],
 ['9','$0.010$','$0.0053$'],
 ['27','$0.004$','$0.0018$'],
 ['81','$0.001$','$0.0006$']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax({w:340,h:170,xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',xtarget:5,ytarget:2});
   a.curve(t=>rectWave(t,4,1),{color:C.in,n:2400}); a.curve(t=>rectPS(t,3,4,1),{color:C.mid,n:1800}); return a.svg();},
  cap:'$N=3$.'},
 {svg:()=>{const a=ax({w:340,h:170,xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',xtarget:5,ytarget:2});
   a.curve(t=>rectWave(t,4,1),{color:C.in,n:2400}); a.curve(t=>rectPS(t,27,4,1),{color:C.out,n:4000}); return a.svg();},
  cap:'$N=27$. The spike beside each jump is no shorter.'}
]},
{t:'p', text:'The rate at which the error falls is set by the smoothness of the signal. A jump forces the coefficients to decay like $1/k$, so $|a_k|^{2}$ decays like $1/k^{2}$. A tail sum of this kind is close to the matching integral, $\\sum_{k>N}1/k^{2}\\approx\\int_{N}^{\\infty}\\d k/k^{2}=1/N$, so the tail $\\sum_{|k|>N}|a_k|^{2}$ behaves like $1/N$ and doubling $N$ roughly halves the error. A signal that is continuous but has a corner, such as a triangular wave, has coefficients decaying like $1/k^{2}$. Then $|a_k|^{2}$ decays like $1/k^{4}$, the tail like $\\int_{N}^{\\infty}\\d k/k^{4}=1/(3N^{3})$, and far fewer harmonics are needed.'},

{t:'h2', num:'4.6', text:'The discrete-time Fourier series'},
{t:'eqbox', cap:'Discrete-time Fourier series',
 tex:['x[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk(2\\pi/N)n}',
      'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}'],
 after:'$\\langle N\\rangle$ means any $N$ consecutive values of the index. Both sums are finite and there are exactly $N$ distinct coefficients.'},
{t:'box', html:'<span class="t">The coefficients repeat</span>$a_{k+N}=a_k$. Replace $k$ by $k+N$ in the analysis sum and split the exponential: $$a_{k+N}=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-j(k+N)(2\\pi/N)n}=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}\\,e^{-j2\\pi n}=a_k,$$ because $e^{-j2\\pi n}=1$ for every integer $n$. The same substitution in continuous time produces $e^{-j2\\pi t}$, which is 1 only when $t$ is an integer, and it is not. Continuous-time coefficients therefore do not repeat.'},
{t:'box', kind:'ok', html:'<span class="t">A finite, exact identity</span>A period-$N$ sequence is described by $N$ numbers and its series has $N$ terms. There is no truncation, no limit, no convergence question, and no Gibbs phenomenon anywhere in discrete time.'},

{t:'ex', hd:'Example 4.6 — a sum of two sequences', rows:[
 ['Given','$x[n]=\\sin\\!\\left(\\frac{5\\pi}{6}n\\right)+\\cos\\!\\left(\\frac{3\\pi}{4}n+\\frac{\\pi}{5}\\right)$.'],
 ['Find','The fundamental period and every coefficient.'],
 ['Method','A discrete-time sinusoid repeats only if $N=(2\\pi/\\omega)k$ is a positive integer for some integer $k$. Get each component period, take the least common multiple, then expand.'],
 ['Solution','A sinusoid $\\cos(\\omega n)$ or $\\sin(\\omega n)$ repeats with period $N$ when $\\omega N=2\\pi k$ for some integer $k$, that is, $N=2\\pi k/\\omega$. For $\\omega=5\\pi/6$: $N=\\frac{2\\pi k}{5\\pi/6}=\\frac{12k}{5}$, first an integer at $k=5$, giving $N=12$. For $\\omega=3\\pi/4$: $N=\\frac{2\\pi k}{3\\pi/4}=\\frac{8k}{3}$, first an integer at $k=3$, giving $N=8$. So $N_0=\\operatorname{LCM}(12,8)=24$ and $\\omega_0=2\\pi/24=\\pi/12$. Write each frequency as a multiple of $\\omega_0$: $$\\frac{5\\pi}{6}=\\frac{20\\pi}{24}=10\\,\\omega_0,\\qquad\\frac{3\\pi}{4}=\\frac{18\\pi}{24}=9\\,\\omega_0.$$ Now expand with Euler’s relations. The phase $\\pi/5$ stays with the coefficient, because $e^{j(9\\omega_0n+\\pi/5)}=e^{j\\pi/5}e^{j9\\omega_0n}$: $$\\begin{aligned}\\sin(10\\omega_0n)&=\\frac{1}{2j}e^{j10\\omega_0n}-\\frac{1}{2j}e^{-j10\\omega_0n},\\\\\\cos\\!\\left(9\\omega_0n+\\frac{\\pi}{5}\\right)&=\\tfrac12e^{j\\pi/5}e^{j9\\omega_0n}+\\tfrac12e^{-j\\pi/5}e^{-j9\\omega_0n}.\\end{aligned}$$ Reading off the coefficient of each $e^{jk\\omega_0n}$, $$a_{10}=\\frac{1}{2j},\\quad a_{-10}=-\\frac{1}{2j},\\quad a_{9}=\\tfrac12e^{j\\pi/5},\\quad a_{-9}=\\tfrac12e^{-j\\pi/5},$$ with every other coefficient in one period equal to zero.'],
 ['Check','$|a_{\\pm9}|=|a_{\\pm10}|=1/2$; $\\angle a_9=\\pi/5$, $\\angle a_{-9}=-\\pi/5$, $\\angle a_{10}=-\\pi/2$, $\\angle a_{-10}=+\\pi/2$. The sequence is real, so magnitudes are even and phases odd. Also $a_k=a_{k+24}$, which extends the answer to every $k$.']
]},
{t:'ex', hd:'Example 4.7 — the discrete-time square wave', rows:[
 ['Given','$x[n]=1$ for $|n|\\le N_1$ and $0$ for $N_1<|n|\\le N/2$, repeated with period $N$.'],
 ['Find','Every coefficient.'],
 ['Method','Substitute the signal into the analysis sum over the period from $-N/2$ to $N/2$. The signal is 1 only for $-N_1\\le n\\le N_1$, so the sum reduces to a finite geometric sum with ratio $r=e^{-jk(2\\pi/N)}$. For $r\\neq1$ the sum has a closed form. Write $S=\\sum_{n=m}^{p}r^{n}$; then $S-rS=r^{m}-r^{p+1}$, because every other term cancels, so $S=(r^{m}-r^{p+1})/(1-r)$. The case $r=1$ is handled separately.'],
 ['Solution','With $m=-N_1$ and $p=N_1$, $$a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}1\\cdot e^{-jk(2\\pi/N)n}=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}r^{n}=\\frac{1}{N}\\cdot\\frac{r^{-N_1}-r^{N_1+1}}{1-r}.$$ The lower limit is $n=-N_1$, so the first numerator term is $r^{-N_1}=e^{+jk(2\\pi/N)N_1}$, with a positive exponent. Written out, $$a_k=\\frac{1}{N}\\cdot\\frac{e^{jk(2\\pi/N)N_1}-e^{-jk(2\\pi/N)(N_1+1)}}{1-e^{-jk(2\\pi/N)}}.$$ Factor $e^{-jk\\pi/N}$ out of the numerator. The exponents that remain are $jk(2\\pi/N)N_1+jk\\pi/N=jk(2\\pi/N)(N_1+\\tfrac12)$ and $-jk(2\\pi/N)(N_1+1)+jk\\pi/N=-jk(2\\pi/N)(N_1+\\tfrac12)$, so the bracket is $2j$ times a sine: $$\\begin{aligned}e^{jk(2\\pi/N)N_1}-e^{-jk(2\\pi/N)(N_1+1)}&=e^{-jk\\pi/N}\\Bigl[e^{jk(2\\pi/N)(N_1+\\frac12)}-e^{-jk(2\\pi/N)(N_1+\\frac12)}\\Bigr]\\\\&=e^{-jk\\pi/N}\\,2j\\sin\\!\\left(\\frac{2\\pi k}{N}\\Bigl(N_1+\\frac12\\Bigr)\\right).\\end{aligned}$$ Factor the same $e^{-jk\\pi/N}$ out of the denominator: $$1-e^{-jk(2\\pi/N)}=e^{-jk\\pi/N}\\bigl[e^{jk\\pi/N}-e^{-jk\\pi/N}\\bigr]=e^{-jk\\pi/N}\\,2j\\sin\\!\\left(\\frac{\\pi k}{N}\\right).$$ The factors $e^{-jk\\pi/N}$ and $2j$ cancel between numerator and denominator, leaving $$a_k=\\frac{1}{N}\\,\\frac{\\sin\\!\\left(\\frac{2\\pi k}{N}\\left(N_1+\\frac12\\right)\\right)}{\\sin\\!\\left(\\frac{\\pi k}{N}\\right)},\\qquad k\\neq0,\\pm N,\\pm2N,\\dots$$ When $k$ is a multiple of $N$, $r=e^{-j2\\pi(k/N)}=1$, every term of the sum is 1, and there are $2N_1+1$ terms, so $$a_k=\\frac{2N_1+1}{N}\\ \\text{when}\\ k=0,\\pm N,\\pm2N,\\dots$$'],
 ['Check','Here $|r|=1$ at every $k$, so a condition $|r|<1$ would rule the sum out altogether. What matters is $r\\neq1$, and $r=1$ happens exactly when $k$ is a multiple of $N$, which is the second branch. For $N=10$, $N_1=2$ the peak is $(2N_1+1)/N=0.5$, and any plot of these coefficients must be scaled so that $0.5$ falls inside the labelled range.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax({w:340,h:165,xr:[-25,25],yr:[-0.18,0.58],xlabel:'k',ylabel:'a_k',xtarget:4,ytarget:3});
   a.stem(D(k=>dtRect(k,10,2),-25,25),{color:C.in,r:2.2,showZero:true}); return a.svg();},
  cap:'$N=10$, $N_1=2$: peak $0.5$, repeating every 10.'},
 {svg:()=>{const a=ax({w:340,h:165,xr:[-45,45],yr:[-0.09,0.3],xlabel:'k',ylabel:'a_k',xtarget:4,ytarget:3});
   a.stem(D(k=>dtRect(k,20,2),-45,45),{color:C.in,r:1.8,showZero:true}); return a.svg();},
  cap:'$N=20$: peak $0.25$, repeating every 20.'}
]},
{t:'ex', hd:'Example 4.8 — a discrete sawtooth', rows:[
 ['Given','$x[n]=n$ for $-5\\le n\\le5$, repeated with period $N=11$.'],
 ['Find','Every coefficient.'],
 ['Method','Substitute into the analysis sum with $\\omega_0=2\\pi/11$. The sequence is odd, so pair the term at $n=m$ with the term at $n=-m$ before expanding. With $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$, $$me^{-jk\\omega_0m}+(-m)e^{+jk\\omega_0m}=-m\\bigl(e^{jk\\omega_0m}-e^{-jk\\omega_0m}\\bigr)=-2jm\\sin(k\\omega_0m).$$'],
 ['Solution','The DC term is the average of the eleven values, and they cancel in pairs: $$a_0=\\frac{1}{11}\\sum_{n=-5}^{5}n=\\frac{1}{11}\\bigl[(-5)+(-4)+\\dots+4+5\\bigr]=0.$$ For general $k$, the $n=0$ term is zero, and the remaining ten terms form five pairs: $$\\begin{aligned}a_k&=\\frac{1}{11}\\sum_{n=-5}^{5}n\\,e^{-jk(2\\pi/11)n}\\\\&=\\frac{1}{11}\\sum_{m=1}^{5}\\Bigl[m\\,e^{-jk(2\\pi/11)m}+(-m)\\,e^{+jk(2\\pi/11)m}\\Bigr]\\\\&=\\frac{1}{11}\\sum_{m=1}^{5}\\bigl(-2jm\\bigr)\\sin\\!\\left(\\frac{2\\pi km}{11}\\right)=-\\frac{2j}{11}\\sum_{m=1}^{5}m\\,\\sin\\!\\left(\\frac{2\\pi km}{11}\\right).\\end{aligned}$$ For $k=1$ the five terms are $1\\sin\\frac{2\\pi}{11}+2\\sin\\frac{4\\pi}{11}+3\\sin\\frac{6\\pi}{11}+4\\sin\\frac{8\\pi}{11}+5\\sin\\frac{10\\pi}{11}\\approx0.5406+1.8193+2.9695+3.0230+1.4087=9.7610$, so $a_1\\approx-j\\,\\tfrac{2}{11}(9.7610)=-j1.7747$.'],
 ['Check','Every coefficient is purely imaginary, as a real odd sequence requires. The largest is $|a_{\\pm1}|=1.7747$, and $a_k=a_{k+11}$, so the eleven coefficients from $k=-5$ to $k=5$ are the whole answer.']
]},

{t:'h2', num:'4.7', text:'Properties'},
{t:'table', head:['Property','Signal','Coefficients'], rows:[
 ['Linearity','$Ax_1+Bx_2$','$Aa_k+Bb_k$'],
 ['Time shift, continuous','$x(t-t_0)$','$a_ke^{-jk\\omega_0t_0}$'],
 ['Time shift, discrete','$x[n-n_0]$','$a_ke^{-jk\\omega_0n_0}$'],
 ['Time reversal','$x(-t)$ or $x[-n]$','$a_{-k}$'],
 ['Conjugation','$x^{*}(t)$ or $x^{*}[n]$','$a_{-k}^{*}$'],
 ['Frequency shift, continuous','$e^{jM\\omega_0t}x(t)$','$a_{k-M}$, $M$ an integer'],
 ['Frequency shift, discrete','$e^{jM(2\\pi/N)n}x[n]$','$a_{k-M}$, $M$ an integer'],
 ['Time scaling, continuous','$x(\\alpha t)$, $\\alpha>0$','$a_k$, with period $T_0/\\alpha$'],
 ['Time scaling, discrete','$x_{(m)}[n]$, $m$ a positive integer','$\\frac{1}{m}a_k$, with period $mN$'],
 ['Periodic convolution, continuous','$\\int_{T_0}x(\\tau)y(t-\\tau)\\d\\tau$','$T_0a_kb_k$'],
 ['Periodic convolution, discrete','$\\sum_{r=\\langle N\\rangle}x[r]y[n-r]$','$Na_kb_k$'],
 ['Multiplication, continuous','$x(t)y(t)$','$\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell b_{k-\\ell}$'],
 ['Multiplication, discrete','$x[n]y[n]$','$\\sum_{\\ell=\\langle N\\rangle}a_\\ell b_{k-\\ell}$'],
 ['Differentiation','$\\d x(t)/\\d t$','$jk\\omega_0a_k$'],
 ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\d\\tau$','$a_k/(jk\\omega_0)$, only if $a_0=0$'],
 ['First difference','$x[n]-x[n-1]$','$\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)a_k$'],
 ['Running sum','$\\sum_{r=-\\infty}^{n}x[r]$','$a_k/\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)$, only if $a_0=0$']
]},
{t:'p', text:'Three properties need further explanation. <b>Time scaling</b> in continuous time does not change the coefficient values, but it changes their frequencies. In discrete time, $x_{(m)}[n]$ places the original samples $m$ indices apart and inserts $m-1$ zeros after each sample. The factor $1/m$ appears because the average is taken over $m$ times as many samples. <b>Periodic convolution</b> includes the factor $T_0$ or $N$ before the coefficient product. The analysis equation divides by the period, and the convolution adds an operation over one period. Omitting this factor gives the wrong amplitude. <b>Integration</b> and the <b>running sum</b> divide by a factor that is zero at $k=0$. A signal with non-zero mean therefore produces a non-periodic term. Subtract the mean, apply the rule to the zero-mean part, and then add the term $a_0t$.'},
{t:'p', text:'The time-shift factor has modulus 1, so $|b_k|=|a_k|$ at every $k$: a shift never changes a magnitude, only a phase, and it changes that phase by $-k\\omega_0t_0$, proportionally to the harmonic index. Two signals differing only by a delay have identical magnitude plots, which is why a phase plot is not decoration.'},
{t:'box', kind:'err', html:'<span class="t">The discrete-time product</span>The multiplication property in discrete time is a <b>periodic</b> convolution: the sum runs over one period of $\\ell$. Discrete-time coefficients repeat, so an infinite sum would add each of the $N$ distinct products over and over and diverge. The product $x[n]y[n]$ is itself periodic with period $N$ and therefore has $N$ coefficients — a number only a sum over one period can deliver.'},
{t:'h3', text:'Symmetry'},
{t:'ul', items:[
 '$x$ real gives $a_{-k}=a_k^{*}$, so $|a_k|$ is even in $k$ and $\\angle a_k$ is odd.',
 '$x$ real and even gives $a_k$ real and even.',
 '$x$ real and odd gives $a_k$ purely imaginary and odd.',
 'For real $x$: $\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$ and $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$.'
]},
{t:'p', text:'The last line is the general statement and the two before it are its special cases. Write the even part as a combination of $x(t)$ and $x(-t)$, apply linearity and time reversal from the table, and then use $a_{-k}=a_k^{*}$ for a real signal:'},
{t:'eq', tex:'\\begin{aligned}\\Ev\\{x(t)\\}=\\tfrac12x(t)+\\tfrac12x(-t)&\\;\\leftrightarrow\\;\\tfrac12a_k+\\tfrac12a_{-k}=\\tfrac12\\bigl(a_k+a_k^{*}\\bigr)=\\operatorname{Re}\\{a_k\\},\\\\\\Od\\{x(t)\\}=\\tfrac12x(t)-\\tfrac12x(-t)&\\;\\leftrightarrow\\;\\tfrac12a_k-\\tfrac12a_{-k}=\\tfrac12\\bigl(a_k-a_k^{*}\\bigr)=j\\operatorname{Im}\\{a_k\\}.\\end{aligned}'},
{t:'p', text:'The last equality on each line uses $a_k+a_k^{*}=2\\operatorname{Re}\\{a_k\\}$ and $a_k-a_k^{*}=2j\\operatorname{Im}\\{a_k\\}$. Splitting a real signal into its even and odd parts splits its coefficients into their real and imaginary parts, and that tells you which half of the coefficients you have to compute.'},
{t:'p', text:'The third follows in one line. Real gives $a_{-k}=a_k^{*}$; odd gives $a_{-k}=-a_k$; together $a_k^{*}=-a_k$, so $\\operatorname{Re}\\{a_k\\}=0$. Both sawtooths of this chapter obey it.'},
{t:'eqbox', cap:'Parseval’s relation',
 tex:['\\frac{1}{T_0}\\int_{T_0}\\bigl|x(t)\\bigr|^{2}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}\\bigl|a_k\\bigr|^{2}',
      '\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\bigl|x[n]\\bigr|^{2}=\\sum_{k=\\langle N\\rangle}\\bigl|a_k\\bigr|^{2}'],
 after:'The left side is the average power over one period, with the normalised convention $R=1\\,\\Omega$. The right side splits it among the harmonics, and $|a_k|^{2}$ is the power carried by the $k$-th harmonic alone.'},
{t:'p', text:'To derive the continuous-time form, write $|x(t)|^{2}=x(t)x^{*}(t)$. Substitute the series for $x$, and the conjugated series for $x^{*}$ with a second index $m$ so that the two sums stay separate. Then integrate over one period. The orthogonality integral of Section 4.3 is $T_0$ when $m=k$ and zero otherwise, so only the terms with $m=k$ survive:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{T_0}\\int_{T_0}x(t)x^{*}(t)\\,\\d t&=\\frac{1}{T_0}\\int_{T_0}\\Bigl(\\sum_{k}a_ke^{jk\\omega_0t}\\Bigr)\\Bigl(\\sum_{m}a_m^{*}e^{-jm\\omega_0t}\\Bigr)\\d t\\\\&=\\sum_{k}\\sum_{m}a_ka_m^{*}\\,\\frac{1}{T_0}\\int_{T_0}e^{j(k-m)\\omega_0t}\\,\\d t=\\sum_{k}a_ka_k^{*}=\\sum_{k}|a_k|^{2}.\\end{aligned}'},
{t:'p', text:'The discrete-time form follows the same steps with sums in place of the integral. The orthogonality sum is $\\sum_{n=\\langle N\\rangle}e^{j(k-m)(2\\pi/N)n}$. For $k=m$ every term is 1 and the sum is $N$. For $k\\neq m$ within one period, it is a geometric sum with ratio $r=e^{j(k-m)2\\pi/N}\\neq1$, and $r^{N}=e^{j(k-m)2\\pi}=1$ makes the closed form $r^{n_0}(1-r^{N})/(1-r)$ equal to zero.'},

{t:'h2', num:'4.8', text:'A periodic signal through an LTI system'},
{t:'p', text:'Apply the eigenfunction property of Section 4.1 to each term of the synthesis equation. The term $a_ke^{jk\\omega_0t}$ is a complex exponential with $s=jk\\omega_0$, so the system multiplies it by $H(jk\\omega_0)$. The system is linear, so the outputs of all the terms add:'},
{t:'eqbox', cap:'One multiplication per harmonic',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longrightarrow\\;y(t)=\\sum_{k=-\\infty}^{\\infty}\\underbrace{a_kH(jk\\omega_0)}_{b_k}e^{jk\\omega_0t}',
      'x[n]=\\sum_{k=\\langle N\\rangle}a_ke^{jk\\omega_0n}\\;\\longrightarrow\\;y[n]=\\sum_{k=\\langle N\\rangle}a_kH(e^{jk\\omega_0})e^{jk\\omega_0n}'],
 after:'The frequency response $H$ describes the system. For a periodic input, calculate one product at each harmonic instead of evaluating a convolution.'},
{t:'h3', text:'Putting the output back together'},
{t:'p', text:'The result above is a sum of complex terms. For real $x$, $a_{-k}=a_k^{*}$. For real $h$, conjugating $H(j\\omega)=\\int h(\\tau)e^{-j\\omega\\tau}\\d\\tau$ conjugates only the exponential, so $H^{*}(j\\omega)=\\int h(\\tau)e^{+j\\omega\\tau}\\d\\tau=H(-j\\omega)$. Together, $b_{-k}=a_{-k}H(-jk\\omega_0)=a_k^{*}H^{*}(jk\\omega_0)=b_k^{*}$. Pair each $k$ with $-k$, write $b_k=|b_k|e^{j\\angle b_k}$, and use $e^{j\\theta}+e^{-j\\theta}=2\\cos\\theta$:'},
{t:'eq', tex:'\\begin{aligned}b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}&=|b_k|e^{j\\angle b_k}e^{jk\\omega_0t}+|b_k|e^{-j\\angle b_k}e^{-jk\\omega_0t}\\\\&=|b_k|\\Bigl[e^{j(k\\omega_0t+\\angle b_k)}+e^{-j(k\\omega_0t+\\angle b_k)}\\Bigr]=2|b_k|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr).\\end{aligned}'},
{t:'eqbox', cap:'Conjugate-pair reassembly',
 tex:['b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}=2\\bigl|b_k\\bigr|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)',
      'y(t)=b_0+\\sum_{k=1}^{\\infty}2\\bigl|b_k\\bigr|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)'],
 after:'$b_0$ has no partner, so it carries no factor of two.'},
{t:'box', kind:'err', html:'<span class="t">The factor of two, and whose phase</span>The amplitude of the $k$-th cosine is $2|b_k|$, because both members of the pair contribute. The phase is $\\angle b_k$, the one belonging to <b>positive</b> $k$; taking $\\angle b_{-k}$ flips the sign of that cosine’s phase. Test any reassembly by setting $H=1$: it must return the input exactly. A version missing the factor of two returns half the input plus its full average.'},

{t:'ex', hd:'Example 4.9 — low-pass filtering', rows:[
 ['Given','$x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos\\!\\left(3\\pi t+\\frac{\\pi}{3}\\right)$ into a system with $h(t)=e^{-t}u(t)$.'],
 ['Find','The output signal.'],
 ['Method','The input is periodic and the system is LTI, so harmonic multiplication applies. Calculate $H(j\\omega)$ from $h$, find $T_0$ and $a_k$ from $x$, form $b_k=a_kH(jk\\omega_0)$, and combine each conjugate pair.'],
 ['Solution','First the frequency response. Substitute $h$ into the definition; $u(\\tau)$ makes the lower limit zero, and the two exponentials combine into one: $$\\begin{aligned}H(j\\omega)&=\\int_{-\\infty}^{\\infty}e^{-\\tau}u(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau=\\int_{0}^{\\infty}e^{-(1+j\\omega)\\tau}\\,\\d\\tau\\\\&=\\left.\\frac{e^{-(1+j\\omega)\\tau}}{-(1+j\\omega)}\\right|_{0}^{\\infty}=\\frac{0-1}{-(1+j\\omega)}=\\frac{1}{1+j\\omega}.\\end{aligned}$$ The upper limit gives zero because $|e^{-(1+j\\omega)\\tau}|=e^{-\\tau}\\to0$. So $|H(j\\omega)|=1/\\sqrt{1+\\omega^{2}}$ and $\\angle H(j\\omega)=-\\arctan\\omega$. Next the input. The component periods are $2\\pi/\\pi=2$, $2\\pi/(2\\pi)=1$ and $2\\pi/(3\\pi)=2/3$ s, so $T_0=\\operatorname{LCM}(2,1,2)/\\operatorname{GCD}(1,1,3)=2$ s and $\\omega_0=\\pi$. The three frequencies are $1\\omega_0$, $2\\omega_0$ and $3\\omega_0$. Euler’s relations give the coefficients for positive $k$: $$\\begin{gathered}\\cos(\\pi t)\\to a_1=\\tfrac12,\\\\[3pt]\\sin(2\\pi t)=\\tfrac{1}{2j}e^{j2\\pi t}-\\tfrac{1}{2j}e^{-j2\\pi t}\\to a_2=\\tfrac{1}{2j}=\\tfrac12e^{-j\\pi/2},\\\\[3pt]\\cos\\!\\left(3\\pi t+\\tfrac{\\pi}{3}\\right)\\to a_3=\\tfrac12e^{j\\pi/3}\\end{gathered}$$ with $a_0=1$ and $a_{-k}=a_k^{*}$. Now one product per harmonic, $b_k=a_kH(jk\\pi)$: magnitudes multiply and phases add. The values of $H$ at the three harmonics are $$\\begin{aligned}|H(j\\pi)|&=\\frac{1}{\\sqrt{1+\\pi^{2}}}=0.3033,&\\angle H(j\\pi)&=-\\arctan\\pi=-1.2626,\\\\|H(j2\\pi)|&=\\frac{1}{\\sqrt{1+4\\pi^{2}}}=0.1572,&\\angle H(j2\\pi)&=-\\arctan2\\pi=-1.4130,\\\\|H(j3\\pi)|&=\\frac{1}{\\sqrt{1+9\\pi^{2}}}=0.1055,&\\angle H(j3\\pi)&=-\\arctan3\\pi=-1.4651.\\end{aligned}$$ Then $$\\begin{aligned}b_0&=a_0H(j0)=1\\cdot1=1,\\\\b_1&=\\tfrac12(0.3033)\\,e^{-j1.2626}=0.1517e^{-j1.2626},\\\\b_2&=\\tfrac12(0.1572)\\,e^{j(-\\pi/2-1.4130)}=0.0786e^{-j2.9838},\\\\b_3&=\\tfrac12(0.1055)\\,e^{j(\\pi/3-1.4651)}=0.0528e^{-j0.4179}.\\end{aligned}$$ Finally combine each conjugate pair into a cosine of amplitude $2|b_k|$ and phase $\\angle b_k$: $$\\begin{aligned}y(t)=1&+0.303\\cos(\\pi t-1.263)+0.157\\cos(2\\pi t-2.984)\\\\&+0.106\\cos(3\\pi t-0.418).\\end{aligned}$$'],
 ['Check','Each amplitude is $2|b_k|$: $0.303$, $0.157$, $0.106$. The output ranges from about $0.615$ to $1.417$; using half the required amplitudes would give only $0.81$ to $1.21$. The average is unchanged because $|H(0)|=1$, and the third-harmonic amplitude is reduced to about one tenth of its input value.']
]},
{t:'ex', hd:'Example 4.10 — high-pass filtering', rows:[
 ['Given','The same $x(t)$, now into a system with $H(j\\omega)=\\dfrac{j\\omega}{1+j\\omega}$.'],
 ['Find','The output signal.'],
 ['Method','The input is periodic and the system is LTI, so use the same harmonic-multiplication method as in Example 4.9. Replace the low-pass response by the given $H$, calculate each $b_k$, and combine the conjugate pairs.'],
 ['Solution','$H(j0)=0/(1+0)=0$, so $b_0=a_0H(j0)=0$ and the output has zero average. For $k\\ge1$, the magnitude of a quotient is the quotient of the magnitudes, and the phase is the difference of the phases. The numerator $jk\\pi$ has magnitude $k\\pi$ and phase $\\pi/2$; the denominator $1+jk\\pi$ has magnitude $\\sqrt{1+k^{2}\\pi^{2}}$ and phase $\\arctan(k\\pi)$: $$|H(jk\\pi)|=\\frac{k\\pi}{\\sqrt{1+k^{2}\\pi^{2}}},\\qquad\\angle H(jk\\pi)=\\frac{\\pi}{2}-\\arctan(k\\pi).$$ With the values of $\\sqrt{1+k^{2}\\pi^{2}}$ and $\\arctan(k\\pi)$ from Example 4.9, $$\\begin{aligned}|H(j\\pi)|&=\\frac{3.1416}{3.2969}=0.9529,&\\angle H(j\\pi)&=1.5708-1.2626=+0.3082,\\\\|H(j2\\pi)|&=\\frac{6.2832}{6.3623}=0.9876,&\\angle H(j2\\pi)&=1.5708-1.4130=+0.1578,\\\\|H(j3\\pi)|&=\\frac{9.4248}{9.4777}=0.9944,&\\angle H(j3\\pi)&=1.5708-1.4651=+0.1057.\\end{aligned}$$ The input coefficients are the same as before: $a_1=\\tfrac12$, $a_2=\\tfrac12e^{-j\\pi/2}$, $a_3=\\tfrac12e^{j\\pi/3}$. Multiply the magnitudes and add the phases: $$\\begin{aligned}b_1&=\\tfrac12(0.9529)\\,e^{j0.3082}=0.4764e^{+j0.3082},\\\\b_2&=\\tfrac12(0.9876)\\,e^{j(-\\pi/2+0.1578)}=0.4938e^{-j1.4130},\\\\b_3&=\\tfrac12(0.9944)\\,e^{j(\\pi/3+0.1057)}=0.4972e^{+j1.1529}.\\end{aligned}$$ Pairing $k$ with $-k$ as before, $$y(t)=0.953\\cos(\\pi t+0.308)+0.988\\cos(2\\pi t-1.413)+0.994\\cos(3\\pi t+1.153).$$'],
 ['Check','$|H(jk\\pi)|$ is $0.953$, $0.988$, $0.994$ for $k=1,2,3$. These values are close to one, so unit-amplitude input harmonics must produce output amplitudes close to one. Values close to $0.5$ would show that the factor of two is missing. Use the phases for positive $k$: $+0.308$, $-1.413$, $+1.153$. Using $b_{-k}$ instead changes the signs of the first and third phases.']
]},
{t:'ex', hd:'Example 4.11 — filtering a discrete impulse train', rows:[
 ['Given','$x[n]=\\sum_{m=-\\infty}^{\\infty}\\delta[n-4m]$, and the systems $h_1[n]=0.5\\delta[n]-0.5\\delta[n-1]$ and $h_2[n]=0.5\\delta[n]+0.5\\delta[n-1]$.'],
 ['Find','Both output signals.'],
 ['Method','The input is periodic and both systems are LTI, so discrete-time harmonic multiplication applies. Find $a_k$ for the impulse train, calculate $b_k=a_kH(e^{jk\\omega_0})$ with $\\omega_0=\\pi/2$, and then combine the conjugate pairs.'],
 ['Solution','First the input coefficients. One period is $n=0,1,2,3$ and contains one impulse, at $n=0$, so $$a_k=\\frac14\\sum_{n=0}^{3}x[n]\\,e^{-jk(\\pi/2)n}=\\frac14\\cdot1\\cdot e^{-jk(\\pi/2)\\cdot0}=\\frac14\\quad\\text{for every }k.$$ One period of coefficients is $k=-1,0,1,2$. Next the frequency responses, from $H(e^{j\\omega})=\\sum_n h[n]e^{-j\\omega n}$: $$H_1(e^{j\\omega})=0.5-0.5e^{-j\\omega}=0.5\\bigl(1-e^{-j\\omega}\\bigr),\\qquad H_2(e^{j\\omega})=0.5\\bigl(1+e^{-j\\omega}\\bigr).$$ Evaluate $H_1$ at the three harmonics $\\omega=0,\\pi/2,\\pi$, using $e^{-j\\pi/2}=-j$ and $e^{-j\\pi}=-1$: $$\\begin{gathered}H_1(e^{j0})=0.5(1-1)=0,\\\\[3pt]H_1(e^{j\\pi/2})=0.5(1+j)=0.5\\sqrt2\\,e^{j\\pi/4}=0.7071e^{j\\pi/4},\\\\[3pt]H_1(e^{j\\pi})=0.5(1+1)=1.\\end{gathered}$$ Multiply by $a_k=1/4$: $b_0=0$, $b_1=0.25(0.7071)e^{j\\pi/4}=0.1768e^{j\\pi/4}$ and $b_2=0.25$. The pair $k=\\pm1$ gives a cosine of amplitude $2|b_1|=0.3536$ and phase $\\pi/4$. The term $k=2$ has $e^{j2(\\pi/2)n}=e^{j\\pi n}=(-1)^{n}$ and no partner, so $$y[n]=0.354\\cos\\!\\left(\\frac{\\pi}{2}n+\\frac{\\pi}{4}\\right)+0.25(-1)^{n}.$$ For $h_2$ the same three evaluations give $$\\begin{gathered}H_2(e^{j0})=0.5(1+1)=1,\\\\[3pt]H_2(e^{j\\pi/2})=0.5(1-j)=0.7071e^{-j\\pi/4},\\\\[3pt]H_2(e^{j\\pi})=0.5(1-1)=0\\end{gathered}$$ so $b_0=0.25$, $b_1=0.1768e^{-j\\pi/4}$ and $b_2=0$, and $$y[n]=0.25+0.354\\cos\\!\\left(\\frac{\\pi}{2}n-\\frac{\\pi}{4}\\right).$$'],
 ['Check','Apply the two systems directly. For $h_1$, $y[n]=0.5x[n]-0.5x[n-1]$ is $0.5$ at $n=0$, $-0.5$ at $n=1$ and $0$ at $n=2,3$. The series gives the same values: at $n=0$, $0.354\\cos(\\pi/4)+0.25=0.25+0.25=0.5$; at $n=1$, $0.354\\cos(3\\pi/4)-0.25=-0.25-0.25=-0.5$; at $n=2$, $0.354\\cos(5\\pi/4)+0.25=0$; at $n=3$, $0.354\\cos(7\\pi/4)-0.25=0$. The check for $h_2$ works the same way. Within one coefficient period, the $k=2$ term has no separate conjugate partner. It therefore appears alone as $b_2(-1)^{n}$ and has no factor of two. The high-pass system removes the average and retains $b_2$; the low-pass system retains the average and gives $b_2=0$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax({w:340,h:170,xr:[-13,13],yr:[-0.75,0.75],xlabel:'n',ylabel:'y[n]',xtarget:4,ytarget:3});
   a.stem(D(n=>0.353553*Math.cos(Math.PI*n/2+Math.PI/4)+0.25*Math.pow(-1,n),-13,13),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'First difference: zero average.'},
 {svg:()=>{const a=ax({w:340,h:170,xr:[-13,13],yr:[-0.2,0.75],xlabel:'n',ylabel:'y[n]',xtarget:4,ytarget:3});
   a.stem(D(n=>0.25+0.353553*Math.cos(Math.PI*n/2-Math.PI/4),-13,13),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'Two-point average: the average remains.'}
]},

{t:'h2', num:'4.9', text:'Checklist, and what comes next'},
{t:'ol', items:[
 'Confirm the signal is periodic and find $T_0$ or $N$ before anything else.',
 'Set $\\omega_0=2\\pi/T_0$ or $2\\pi/N$ and write every component frequency as a multiple of it. That multiple is $k$.',
 'If the signal is already a sum of sinusoids, read the coefficients off with Euler’s relations. Otherwise integrate or sum, treating $k=0$ separately.',
 'Compare $a_0$ with the average calculated from the signal, and check the symmetry: a real signal gives $a_{-k}=a_k^{*}$.',
 'Through an LTI system, $b_k=a_kH(jk\\omega_0)$ — one product per harmonic.',
 'To return to a real signal, pair $k$ with $-k$: amplitude $2|b_k|$, phase $\\angle b_k$. The term $b_0$ stands alone.'
]},
{t:'p', text:'Everything in this chapter needed the signal to repeat. A single pulse does not repeat, has no fundamental period, and has no harmonics to carry coefficients. The rectangular wave already showed the way out: its coefficients were samples of one envelope, taken every $\\omega_0=2\\pi/T_0$. Lengthen the period and the envelope stays put while the samples crowd together and shrink as $1/T_0$.'},
{t:'eqbox', cap:'Where Chapter 5 begins',
 tex:['T_0a_k=E(k\\omega_0)\\quad\\xrightarrow{\\;T_0\\to\\infty\\;}\\quad X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,\\d t'],
 after:'In the limit the stems merge into the curve they were always sampling. That curve is the Fourier transform.'},

{t:'h2', num:'4.10', text:'Exercises'},
{t:'q', n:'4.1', text:'Two periodic signals have fundamental periods $2/9$ s and $8/21$ s. Find the fundamental period of their sum, and verify it by division.', ans:'$T_0=\\operatorname{LCM}(2,8)/\\operatorname{GCD}(9,21)=8/3$ s. Check: $(8/3)/(2/9)=12$ and $(8/3)/(8/21)=7$, both whole, and $\\gcd(12,7)=1$.'},
{t:'q', n:'4.2', text:'For $x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$, state $a_0$ and explain in one sentence why it is not zero.', ans:'$a_0=1$: the constant term is the $k=0$ harmonic, and it is also the average of the signal, since both sinusoids complete whole cycles in one period.'},
{t:'q', n:'4.3', text:'A rectangular wave has $T_0=8T_1$. Find $a_0$ and $a_2$.', ans:'$a_0=2T_1/T_0=1/4$ and $a_2=\\sin(\\pi/2)/(2\\pi)=1/(2\\pi)\\approx0.159$.'},
{t:'q', n:'4.4', text:'Explain why the finite geometric sum used for the discrete-time square wave requires $r\\neq1$ and not $|r|<1$, and say what happens at the excluded value.', ans:'A finite sum always has a value; only the closed form fails, where its denominator $1-r$ vanishes. Here $|r|=1$ at every $k$, so $|r|<1$ would exclude the sum entirely. At $r=1$, that is $k$ a multiple of $N$, every term is 1 and the sum is $2N_1+1$.'},
{t:'q', n:'4.5', text:'A filtered signal has $b_1=0.1517e^{-j1.263}$ and $\\omega_0=\\pi$. Write the contribution of the pair $k=\\pm1$ to the real output.', ans:'$2|b_1|\\cos(\\pi t+\\angle b_1)=0.303\\cos(\\pi t-1.263)$.'},
{t:'q', n:'4.6', text:'A square wave and a triangular wave are truncated to the same number of harmonics. Which is approximated better, and which shows a Gibbs overshoot?', ans:'The triangular wave: its coefficients decay like $1/k^{2}$ against $1/k$, so its discarded power falls like $1/N^{3}$ rather than $1/N$. Only the square wave has a jump, so only it shows a Gibbs overshoot.'}
];
})();
