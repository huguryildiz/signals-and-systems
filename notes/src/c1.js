/* Course notes — front matter and Chapter 1 */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));

window.C1 = [

/* ---------------- title ---------------- */
{t:'title', kicker:'Signals and Systems', text:'Signals, Systems and<br>Linear Time-Invariant Systems',
 sub:'Lecture notes for the first part of the course: what a signal is, how systems are classified, and why linear time-invariant systems are described by a single function.',
 meta:[['Covers','Chapters 1 to 3'],['Level','Undergraduate, second year'],
       ['Assumed background','Calculus, complex numbers, basic circuits']]},

{t:'h3', text:'How to read these notes'},
{t:'p', text:'Each chapter builds on the one before it. Within a chapter, every idea is introduced in the same order: a picture, a definition, an equation, a short derivation, a worked example, and a warning about the mistake that is easiest to make. Worked examples always use five headings: Given, Find, Method, Solution, Check. Do the Check step yourself before reading it.'},
{t:'p', text:'Two conventions apply everywhere. First, energy and power are <b>normalised</b>: the resistance is taken as $1\\ \\Omega$, so instantaneous power is $|x|^{2}$. Second, the imaginary unit is written $j$.'},

{t:'toc', items:[
 ['1','Signals','Energy and power. Shifting, reversal and scaling. Periodicity. Impulses and steps. Complex exponentials.'],
 ['2','Systems and their properties','Memory, invertibility, causality, stability, time invariance, linearity.'],
 ['3','Linear time-invariant systems','Impulse response. Convolution sum and convolution integral. Properties of convolution.'],
 ['A','Summary of formulas','Everything from Chapters 1 to 3 on two pages.']
]},

{t:'page'},

/* ================= CHAPTER 1 ================= */
{t:'h1', num:'CHAPTER 1', text:'Signals'},
{t:'p', lead:true, text:'A signal is information written as a function. This chapter says what that means, how much energy or power a signal carries, how it changes when we shift or stretch the time axis, and when it repeats.'},

{t:'h2', num:'1.1', text:'What a signal is'},
{t:'p', text:'A signal is a physical quantity that varies and carries information. Mathematically, it is a function of one or more independent variables.'},
{t:'p', text:'In this course the independent variable is almost always time. It does not have to be. An image is a signal of two space variables, and the same algebra applies.'},
{t:'p', text:'There are two kinds of signal, and they are kept apart throughout the course.'},
{t:'eqbox', cap:'Continuous time', tex:'x(t),\\qquad t\\in\\mathbb{R}',
 after:'Round brackets. The signal has a value at every real instant.'},
{t:'eqbox', cap:'Discrete time', tex:'x[n],\\qquad n\\in\\mathbb{Z}',
 after:'Square brackets. The signal has a value only at integer indices. Here $n$ is an integer <b>index</b>, not a time in seconds.'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[0,20],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:4});
   a.curve(t=>Math.cos(t),{color:C.in}); return a.svg();},
  cap:'A continuous-time signal is drawn as an unbroken curve.'},
 {svg:()=>{const a=ax({xr:[0,20],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:4});
   a.stem(D(n=>Math.cos(n),0,20),{color:C.mid,r:3}); return a.svg();},
  cap:'A discrete-time signal is drawn with stems. The signal is the dots. There is nothing between them.'}
]},
{t:'box', kind:'err', html:'<span class="t">Notation</span>Writing $x[t]$ or $x(n)$ is not a small slip. It states the wrong domain, and every later statement about periodicity, convolution limits and transforms then breaks.'},

{t:'h2', num:'1.2', text:'Signal energy and power'},
{t:'p', text:'Start with a resistor. If $v(t)$ is the voltage across a resistance $R$, the instantaneous power is'},
{t:'eq', tex:'p(t)=v(t)\\,i(t)=v(t)\\left(\\frac{v(t)}{R}\\right)=\\frac{1}{R}\\,v^{2}(t).'},
{t:'p', text:'Energy is power multiplied by time. Because the power varies, we integrate:'},
{t:'eq', tex:'E=\\int_{t_1}^{t_2}p(t)\\,\\d t=\\int_{t_1}^{t_2}\\frac{1}{R}v^{2}(t)\\,\\d t.'},
{t:'p', text:'From here on we set $R=1\\ \\Omega$ and work with $|x(t)|^{2}$. This is the normalised convention. Put the factor $1/R$ back whenever a physical number in joules or watts is required.'},
{t:'p', text:'We use the modulus because a signal may be complex valued, and $|x(t)|^{2}=x(t)\\,x^{*}(t)$ is the quantity that is real and never negative. Writing $x^{2}(t)$ instead is correct only for real signals.'},

{t:'h3', text:'Total energy'},
{t:'eqbox', cap:'Total energy over all time',
 tex:['E_\\infty=\\lim_{T\\to\\infty}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t',
      'E_\\infty=\\lim_{N\\to\\infty}\\sum_{n=-N}^{N}|x[n]|^{2}=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}'],
 after:'The integral or the sum may not converge. $E_\\infty$ is defined as a limit, and a limit that fails to exist is not a large number. It is the absence of an answer, and that fact is useful.'},

{t:'h3', text:'Average power'},
{t:'p', text:'If the energy is infinite, ask instead how fast energy arrives. Divide by the length of the window and let the window grow.'},
{t:'eqbox', cap:'Average power over all time',
 tex:['P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t',
      'P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}'],
 after:'In discrete time the divisor is $2N+1$, because that is the number of samples between $-N$ and $+N$ inclusive.'},
{t:'box', kind:'warn', html:'<span class="t">Read the definition carefully</span>$P_\\infty$ is not energy divided by infinity. It is the limit of a ratio, and that ratio can settle on any value, including zero.'},

{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-6,6],yr:[-0.1,1.15],xlabel:'t',w:340,h:150,pad:{l:38,r:16,t:14,b:28},xtarget:5,ytarget:2});
   a.area(t=>Math.exp(-Math.abs(t)),-4,4,{color:'rgba(20,112,127,.16)'});
   a.curve(t=>Math.exp(-Math.abs(t)),{color:C.in}); a.vline(-4,{color:C.err}); a.vline(4,{color:C.err}); return a.svg();},
  cap:'<b>Converging.</b> As the window grows, the shaded area approaches a finite limit.'},
 {svg:()=>{const a=ax({xr:[-6,6],yr:[-1.35,1.35],xlabel:'t',w:340,h:150,pad:{l:38,r:16,t:14,b:28},xtarget:5,ytarget:2});
   a.area(t=>Math.pow(Math.cos(2*t),2),-4,4,{color:'rgba(152,53,39,.14)'});
   a.curve(t=>Math.cos(2*t),{color:C.err}); a.vline(-4,{color:C.err}); a.vline(4,{color:C.err}); return a.svg();},
  cap:'<b>Diverging.</b> Every period adds the same area, so $E_\\infty\\to\\infty$ and only the average power is meaningful.'}
]},

{t:'h2', num:'1.3', text:'Energy signals, power signals, and neither'},
{t:'table', head:['Type','Condition','Typical signals'], rows:[
 ['Energy signal','$E_\\infty<\\infty$ and $P_\\infty=0$','Pulses, decaying responses, anything that ends'],
 ['Power signal','$E_\\infty\\to\\infty$ and $0<P_\\infty<\\infty$','Constants, sinusoids, signals that run forever'],
 ['Neither','$E_\\infty\\to\\infty$ and $P_\\infty\\to\\infty$','Signals that grow without bound, such as $t\\,u(t)$']
]},
{t:'p', text:'The two conditions in each row are not independent. Finite energy forces $P_\\infty=0$, because a finite number divided by $2T\\to\\infty$ goes to zero. The second condition is a consequence, not a second test.'},

{t:'ex', hd:'Example 1.1', rows:[
 ['Given','$x(t)=1$ for $0\\le t\\le1$, and $x(t)=0$ otherwise.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','Find $E_\\infty$ first. If it is finite, the classification is settled.'],
 ['Solution','$$E_\\infty=\\int_{0}^{1}1^{2}\\,\\d t=1<\\infty$$ $$P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{0}^{1}1\\,\\d t=\\lim_{T\\to\\infty}\\frac{1}{2T}=0$$ So $x(t)$ is an <b>energy signal</b>, with $E_\\infty=1$ J.'],
 ['Check','Halve the amplitude. The energy must fall by a factor of four, and $\\int_0^1(1/2)^2\\d t=1/4$. The dependence is quadratic, as it must be for a squared quantity.']
]},

{t:'ex', hd:'Example 1.2', rows:[
 ['Given','$x[n]=4$ for every integer $n$.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','The energy clearly diverges, so go straight to the average power and count the samples correctly.'],
 ['Solution','$$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|4|^{2}\\to\\infty$$ $$P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}16=\\lim_{N\\to\\infty}\\frac{(2N+1)\\cdot16}{2N+1}=16$$ So $x[n]$ is a <b>power signal</b>, with $P_\\infty=16$.'],
 ['Check','A constant of amplitude $A$ must have $P_\\infty=A^{2}$. The factor $2N+1$ cancels exactly, which confirms the sample count was right.']
]},
{t:'box', kind:'err', html:'<span class="t">Common mistake</span>Concluding that infinite energy means infinite power. The factor $1/(2N+1)$ does the work. A sum that diverges, divided by a count that also diverges, can converge.'},



{t:'h2', num:'1.4', text:'Time shifting'},
{t:'eqbox', cap:'Time shift', tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)',
 after:'If $t_0>0$ the signal is <b>delayed</b> and moves right. If $t_0<0$ it is <b>advanced</b> and moves left.'},
{t:'p', text:'The sign feels backwards until you read it as a question about when. The output at time $t$ shows what the input was doing at the earlier time $t-t_0$. The value has been held back by $t_0$ seconds.'},
{t:'fig', svg:()=>{const tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
  const a=ax({xr:[-5,5],yr:[-0.35,1.55],xlabel:'t',w:700,h:190,xtarget:11,ytarget:2});
  a.curve(t=>tri(t+3),{color:C.out}); a.curve(tri,{color:C.ink}); a.curve(t=>tri(t-3),{color:C.in});
  a.note(-3,1.1,'x(t+3)',{anchor:'middle',color:C.out,fs:13,tex:true});
  a.note(0,1.1,'x(t)',{anchor:'middle',color:C.ink,fs:13,tex:true});
  a.note(3,1.1,'x(t-3)',{anchor:'middle',color:C.in,fs:13,tex:true});
  a.span(-3,0,1.42,'advance by 3 s',{color:C.out}); a.span(0,3,1.42,'delay by 3 s',{color:C.in});
  return a.svg();},
 cap:'Shifting moves the signal along the time axis. The shape is untouched.'},
{t:'p', text:'Discrete time is identical: $x[n]\\to x[n-n_0]$ with $n_0$ an integer. A one-sample delay, $x[n-1]$, is the basic memory element of every difference equation in Chapter 3.'},

{t:'h2', num:'1.5', text:'Time reversal and time scaling'},
{t:'eqbox', cap:'Time reversal', tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)',
 after:'A flip about the vertical axis.'},
{t:'eqbox', cap:'Time scaling', tex:'y(t)=x(at),\\qquad a>0',
 after:'If $a>1$ the signal is compressed and speeded up. If $0<a<1$ it is stretched and slowed down.'},
{t:'p', text:'Write the scaled signal as a new signal $y(t)$. Writing $x(t)=x(at)$ would force $a=1$.'},
{t:'p', text:'Scaling changes the support in a predictable way. If $x$ is non-zero only on $[\\alpha,\\beta]$, then $x(at)$ is non-zero only on $[\\alpha/a,\\beta/a]$. The width is divided by $a$.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=ax({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(r,{color:C.ink}); a.note(2,1.1,'x(t)',{anchor:'middle',color:C.ink,fs:11,tex:true}); return a.svg();}},
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=ax({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>r(2*t),{color:C.mid}); a.note(1,1.1,'x(2t)',{anchor:'middle',color:C.mid,fs:11,tex:true}); return a.svg();},
  cap:'Compressed: support $[0.5,1.5]$.'},
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=ax({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>r(0.5*t),{color:C.h}); a.note(4,1.1,'x(0.5t)',{anchor:'middle',color:C.h,fs:11,tex:true}); return a.svg();},
  cap:'Stretched: support $[2,6]$.'}
]},
{t:'box', kind:'warn', html:'<span class="t">Discrete time is not symmetric</span>$x[2n]$ throws away the odd-indexed samples. It is real decimation and it destroys information. And $x[n/2]$ is not defined at odd $n$ without an extra rule for filling the gaps. Continuous-time scaling can be undone; discrete-time decimation cannot.'},

{t:'h2', num:'1.6', text:'Combining a shift and a scale'},
{t:'p', text:'To find $x(at-b)$, do the two operations in this order.'},
{t:'eqbox', cap:'Shift, then scale', tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
 after:'Shift by $b$ first. Then scale the result by $a$.'},
{t:'box', kind:'err', html:'<span class="t">Why the order matters</span>Scaling first gives $w(t)=x(at)$. Shifting that by $b$ gives $w(t-b)=x\\bigl(a(t-b)\\bigr)=x(at-ab)$. Unless $a=1$ this is a different signal: it is shifted by $b$ instead of by $b/a$.'},
{t:'ex', hd:'Example 1.3', rows:[
 ['Given','$x(t)$ is zero for $t<-2$, equal to $1$ on $[-2,0]$, equal to $2$ on $[0,2]$, and falls linearly from $2$ to $0$ on $[2,4]$.'],
 ['Find','Plot $x(3t-5)$.'],
 ['Method','Here $a=3$ and $b=5$. Shift right by 5, then compress by 3.'],
 ['Solution','$v(t)=x(t-5)$ has corners at $t=3,5,7,9$. Then $y(t)=v(3t)$ has corners at $t=1,\\;5/3,\\;7/3,\\;3$.'],
 ['Check','The total duration must shrink by exactly $a=3$. The original spans $[-2,4]$, width 6. The result spans $[1,3]$, width 2. Also, $y$ reproduces $x(0)$ where $at-b=0$, that is at $t=b/a=5/3$, which is where the level 2 begins.']
]},
{t:'figrow', n:3, items:[
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=ax({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(x,{color:C.ink}); return a.svg();}, cap:'$x(t)$'},
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=ax({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>x(t-5),{color:C.mid}); [3,5,7,9].forEach(b=>a.vline(b,{color:C.mid,opacity:.45})); return a.svg();},
  cap:'$v(t)=x(t-5)$'},
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=ax({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>x(3*t-5),{color:C.out}); [1,5/3,7/3,3].forEach(b=>a.vline(b,{color:C.out,opacity:.45})); return a.svg();},
  cap:'$y(t)=x(3t-5)$'}
]},



{t:'h2', num:'1.7', text:'Periodic signals'},
{t:'eqbox', cap:'Periodicity',
 tex:['x(t)=x(t+T)\\quad\\text{for all }t\\in\\mathbb{R},\\ \\text{for some }T>0',
      'x[n]=x[n+N]\\quad\\text{for all }n\\in\\mathbb{Z},\\ \\text{for some integer }N>0'],
 after:'A signal that is not periodic is <b>aperiodic</b>.'},
{t:'p', text:'Note both quantifiers. There must <b>exist</b> a period, and it must work for <b>all</b> $t$ or $n$. In continuous time $T$ may be any positive real number. In discrete time $N$ must be an integer. There is no period of 3.5 samples. Almost every discrete-time surprise in this course comes from that one line.'},
{t:'p', text:'If $T$ is a period then so is $2T$, $3T$, and so on. The <b>fundamental period</b> $T_0$ is the smallest positive period. The same applies to $N_0$ in discrete time.'},
{t:'eqbox', cap:'Fundamental frequency', tex:'\\omega_0=\\frac{2\\pi}{T_0}\\qquad\\text{and}\\qquad \\omega_0=\\frac{2\\pi}{N_0}',
 after:'Without the word <em>smallest</em>, $\\omega_0$ would not be well defined.'},
{t:'figrow', items:[
 {svg:()=>{const saw=t=>{const u=((t%4)+4)%4;return u/2-1;};
   const a=ax({xr:[0,20],yr:[-1.3,1.45],xlabel:'t',ylabel:'x(t)',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:5,ytarget:2});
   a.curve(saw,{color:C.in,n:2000}); a.span(8,12,1.14,'T_0=4',{color:C.err,tex:true}); return a.svg();},
  cap:'Periods are $4,8,12,\\dots$ The fundamental period is $T_0=4$.'},
 {svg:()=>{const f=n=>{const u=((n%8)+8)%8;return [1,3,5,3,1,0,-1,0][u];};
   const a=ax({xr:[-16,16],yr:[-1.8,6],xlabel:'n',ylabel:'y[n]',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:3});
   a.stem(D(f,-16,16),{color:C.mid,r:2.6,width:1.4}); a.span(0,8,5.3,'N_0=8',{color:C.err,tex:true}); return a.svg();},
  cap:'Periods are $8,16,24,\\dots$ The fundamental period is $N_0=8$.'}
]},

{t:'h2', num:'1.8', text:'Even and odd signals'},
{t:'p', text:'A signal is <b>even</b> if $x(t)=x(-t)$, and <b>odd</b> if $x(t)=-x(-t)$. The same definitions apply to $x[n]$ with $n$ in place of $t$.'},
{t:'p', text:'Setting $t=0$ in the odd condition gives $x(0)=-x(0)$, so $x(0)=0$. A signal with $x(0)\\neq0$ cannot be odd. That is a one-second test.'},
{t:'p', text:'Every signal splits into an even part and an odd part, in exactly one way:'},
{t:'eqbox', cap:'Even and odd parts',
 tex:['\\Ev\\{x(t)\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr],\\qquad \\Od\\{x(t)\\}=\\tfrac12\\bigl[x(t)-x(-t)\\bigr]',
      'x(t)=\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}'],
 after:'Adding the two definitions returns $x$ exactly.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-0.12,1.15],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>t*t,{color:C.in}); return a.svg();}, cap:'$t^{2}$ is even.'},
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>t*t*t,{color:C.mid}); return a.svg();}, cap:'$t^{3}$ is odd.'},
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-0.2,3.1],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>Math.exp(-t),{color:C.h}); return a.svg();}, cap:'$e^{-t}$ is neither.'}
]},

{t:'h2', num:'1.9', text:'The unit impulse and the unit step in discrete time'},
{t:'eqbox', cap:'Definitions',
 tex:['\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}',
      'u[n]=\\begin{cases}1,&n\\ge0\\\\0,&\\text{otherwise}\\end{cases}'],
 after:'Both are ordinary sequences. Nothing infinite happens here.'},
{t:'p', text:'They are related by a difference and by a running sum. These are the discrete versions of differentiation and integration.'},
{t:'eqbox', cap:'First difference and running sum',
 tex:['\\delta[n]=u[n]-u[n-1]', 'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\delta[n]+\\delta[n-1]+\\delta[n-2]+\\cdots']},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:5,ytarget:2});
   a.stem(D(n=>n===0?1:0,-3,5),{color:C.in}); a.note(4.6,1.1,'\\delta[n]',{anchor:'end',color:C.in,fs:12,tex:true}); return a.svg();}},
 {svg:()=>{const a=ax({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:5,ytarget:2});
   a.stem(D(n=>n>=0?1:0,-3,5),{color:C.h}); a.note(4.6,1.1,'u[n]',{anchor:'end',color:C.h,fs:12,tex:true}); return a.svg();}}
]},

{t:'h3', text:'Sampling and sifting'},
{t:'p', text:'Two properties do most of the work later. They say different things, and the difference matters.'},
{t:'eqbox', cap:'Sampling property', tex:'x[n]\\,\\delta[n-n_0]=x[n_0]\\,\\delta[n-n_0]',
 after:'Both sides are <b>sequences</b>. Multiplying by a shifted impulse keeps one sample and deletes the rest.'},
{t:'eqbox', cap:'Sifting property', tex:'x[n_0]=\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]',
 after:'The right-hand side is a <b>number</b>. Sifting is sampling followed by a sum.'},
{t:'ex', hd:'Example 1.4', rows:[
 ['Given','$x[0]=1$, $x[1]=2$, $x[2]=3$, and $x[n]=0$ elsewhere. Take $n_0=2$.'],
 ['Find','The sampled sequence and the sifted value.'],
 ['Solution','Sampling: $x[n]\\delta[n-2]=x[2]\\delta[n-2]=3\\,\\delta[n-2]$, a single stem of height 3 at $n=2$.<br>Sifting: $\\sum_n x[n]\\delta[n-2]=x[0]\\cdot0+x[1]\\cdot0+x[2]\\cdot1=3$.'],
 ['Check','The first answer is a signal. The second is a number. If your two answers have the same type, one of them is wrong.']
]},
{t:'p', text:'Applying the sampling property at every shift and adding the results gives the identity that Chapter 3 is built on.'},
{t:'eqbox', cap:'Representation property', big:true, tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]',
 after:'Any sequence is a sum of weighted, shifted impulses. The weights are the sample values themselves.'},



{t:'h2', num:'1.10', text:'The unit impulse and the unit step in continuous time'},
{t:'p', text:'The continuous-time step is straightforward: $u(t)=1$ for $t\\ge0$ and $0$ otherwise. The impulse needs more care.'},
{t:'box', kind:'err', html:'<span class="t">The impulse is not a function</span>It is often written as $\\delta(t)=\\infty$ at $t=0$ and $0$ elsewhere, with total area 1. No ordinary function behaves like that: a function that is zero except at one point has integral zero. $\\delta$ is a <b>generalized function</b>, or distribution. It is defined by what it does inside an integral, not by its values.'},
{t:'eqbox', cap:'Defining property (sifting)', tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t',
 after:'This is the definition. Everything else about $\\delta$ follows from it.'},
{t:'p', text:'A useful picture: take a rectangle of width $\\varepsilon$ and height $1/\\varepsilon$, so its area is 1 for every $\\varepsilon$, and let $\\varepsilon\\to0$. The limit does not exist point by point. It exists only under an integral sign, which is exactly the statement above.'},
{t:'p', text:'The impulse and the step are related by differentiation and integration:'},
{t:'eq', tex:'\\delta(t)=\\frac{\\d}{\\d t}u(t),\\qquad\\qquad u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau.'},
{t:'eqbox', cap:'Sampling property, continuous time', tex:'x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-2,3],yr:[-0.15,1.4],xlabel:'t',w:340,h:140,pad:{l:36,r:14,t:16,b:26},xtarget:4,ytarget:2});
   a.impulse(0,1,{color:C.in,labelText:'1'}); a.note(1.9,1.15,'\\delta(t)',{anchor:'end',color:C.in,fs:13,tex:true}); return a.svg();},
  cap:'The arrow height shows the <b>area</b>, never a value of a function.'},
 {svg:()=>{const a=ax({xr:[-1,6],yr:[-1.05,1.5],xlabel:'t',w:340,h:140,pad:{l:36,r:14,t:16,b:26},xtarget:4,ytarget:2});
   const x=t=>0.75*Math.cos(1.2*t-0.5); a.curve(x,{color:C.muted,width:1.4});
   a.impulse(3,x(3),{color:C.err,labelText:'x(t₀)'}); a.point(3,x(3),{color:C.err});
   a.note(5.7,1.3,'x(t)',{anchor:'end',color:C.muted,fs:12,tex:true}); return a.svg();},
  cap:'Sifting: the impulse at $t_0$ is scaled by the value of $x$ there, and integrating returns that number.'}
]},

{t:'h2', num:'1.11', text:'Complex exponentials in continuous time'},
{t:'eqbox', cap:'Definition', tex:'x(t)=C\\,e^{at},\\qquad C,a\\in\\mathbb{C}'},
{t:'p', text:'The behaviour depends only on where $a$ sits in the complex plane. There are three cases.'},
{t:'h3', text:'Case 1: $C$ and $a$ real'},
{t:'p', text:'If $a<0$ the signal decays. If $a>0$ it grows. If $a=0$ it is the constant $C$. A larger $|a|$ makes the decay or growth faster.'},
{t:'h3', text:'Case 2: $a=j\\omega_0$ purely imaginary'},
{t:'p', text:'Write $C=Ae^{j\\theta}$ and use Euler\'s relation $e^{jx}=\\cos x+j\\sin x$:'},
{t:'eq', tex:'x(t)=A e^{j(\\omega_0 t+\\theta)}=A\\cos(\\omega_0 t+\\theta)+jA\\sin(\\omega_0 t+\\theta).'},
{t:'p', text:'Here $A$ is the amplitude, $\\omega_0$ is the angular frequency in rad/s, and $\\theta$ is the phase in radians.'},
{t:'p', text:'Is this signal periodic? Require $x(t)=x(t+T)$:'},
{t:'eq', tex:'Ae^{j(\\omega_0 t+\\theta)}=Ae^{j(\\omega_0(t+T)+\\theta)}\\;\\Longrightarrow\\;1=e^{j\\omega_0 T}\\;\\Longrightarrow\\;j2\\pi k=j\\omega_0 T\\;\\Longrightarrow\\;T=\\frac{2\\pi}{\\omega_0}k.'},
{t:'box', kind:'ok', html:'<span class="t">Result</span>Taking $k=1$ gives the fundamental period $T_0=2\\pi/\\omega_0$. Every continuous-time complex exponential with $\\omega_0\\neq0$ is periodic. There is no extra condition.'},
{t:'ex', hd:'Example 1.5', rows:[
 ['Given','$x(t)=e^{j0.5\\pi t}$.'],
 ['Find','The fundamental period.'],
 ['Solution','$T_0=\\dfrac{2\\pi}{\\omega_0}=\\dfrac{2\\pi}{0.5\\pi}=4$ seconds.'],
 ['Check','$0.5\\pi\\times4=2\\pi$, which is exactly one full turn of the phasor.']
]},
{t:'h3', text:'Case 3: $a=r+j\\omega_0$'},
{t:'eq', tex:'x(t)=Ae^{rt}\\cos(\\omega_0 t+\\theta)+jAe^{rt}\\sin(\\omega_0 t+\\theta).'},
{t:'p', text:'This is a sinusoid inside an envelope $\\pm Ae^{rt}$. If $r<0$ the oscillation is damped, if $r>0$ it grows, and if $r=0$ it is sustained. This is the natural response of every second-order circuit.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,5],yr:[-2.3,2.3],xlabel:'t',w:700,h:170,xtarget:5,ytarget:3});
  a.curve(t=>2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>-2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>2*Math.exp(-0.5*t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
  return a.svg();},
 cap:'A damped sinusoid, $\\operatorname{Re}\\{2e^{-0.5t}e^{j2\\pi t}\\}$, with its envelope shown dashed.'},

{t:'h2', num:'1.12', text:'Complex exponentials in discrete time'},
{t:'eqbox', cap:'Definition', tex:'x[n]=C\\,e^{\\beta n}=C\\,\\alpha^{n},\\qquad \\alpha=e^{\\beta}',
 after:'The power form is the natural one in discrete time. It is what a difference equation produces.'},
{t:'p', text:'For real $C$ and $\\alpha$: if $0<\\alpha<1$ the sequence decreases; if $\\alpha>1$ it increases. For complex $C=|C|e^{j\\theta}$ and $\\alpha=|\\alpha|e^{j\\omega_0}$:'},
{t:'eq', tex:'x[n]=|C|\\,|\\alpha|^{n}\\cos(\\omega_0 n+\\theta)+j\\,|C|\\,|\\alpha|^{n}\\sin(\\omega_0 n+\\theta).'},
{t:'box', kind:'warn', html:'<span class="t">The boundary moves</span>In continuous time the growth-decay boundary is $\\operatorname{Re}\\{a\\}=0$, the imaginary axis. In discrete time it is $|\\alpha|=1$, the unit circle. The map between them is $\\alpha=e^{\\beta}$.'},

{t:'h2', num:'1.13', text:'When is a discrete-time exponential periodic?'},
{t:'p', text:'This is the result that has no continuous-time counterpart. Require $x[n]=x[n+N]$ for $x[n]=Ce^{j\\omega_0 n}$:'},
{t:'eq', tex:'Ce^{j\\omega_0 n}=Ce^{j\\omega_0(n+N)}\\;\\Longrightarrow\\;1=e^{j\\omega_0 N}\\;\\Longrightarrow\\;j2\\pi k=j\\omega_0 N\\;\\Longrightarrow\\;N=\\frac{2\\pi}{\\omega_0}k.'},
{t:'eqbox', cap:'Periodicity condition', big:true, tex:'\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}\\in\\mathbb{Q}',
 after:'$N$ must be an <b>integer</b>. That is possible only when $\\omega_0/2\\pi$ is a rational number. If it is irrational, no integer $N$ works and the sequence is aperiodic, no matter how sinusoidal it looks when plotted.'},
{t:'ex', hd:'Example 1.6', rows:[
 ['Given','$x[n]=e^{j(3\\pi/5)n}$.'],
 ['Find','The fundamental period $N_0$.'],
 ['Method','Use $N=2\\pi k/\\omega_0$ and take the smallest $k$ that makes $N$ an integer.'],
 ['Solution','$N=\\dfrac{2\\pi}{3\\pi/5}k=\\dfrac{10}{3}k$. The smallest positive integer $k$ giving an integer $N$ is $k=3$, so $N_0=10$.'],
 ['Check','$\\omega_0N_0=\\dfrac{3\\pi}{5}\\times10=6\\pi=2\\pi\\times3$. The phasor makes exactly three full turns in ten samples, and $k$ counts those turns.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',w:340,h:140,pad:{l:36,r:14,t:14,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:2.4,width:1.2});
   a.span(0,10,1.2,'N_0=10',{color:C.err,tex:true}); return a.svg();},
  cap:'$\\operatorname{Re}\\{e^{j3\\pi n/5}\\}$ repeats every 10 samples.'},
 {svg:()=>{const a=ax({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',w:340,h:140,pad:{l:36,r:14,t:14,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>Math.cos(n),-20,20),{color:C.err,r:2.4,width:1.2}); return a.svg();},
  cap:'$\\cos(n)$ has $\\omega_0=1$, so $\\omega_0/2\\pi$ is irrational. It never repeats. It only looks as if it should.'}
]},
{t:'box', kind:'warn', html:'<span class="t">A second discrete-time fact, needed later</span>$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$ for every integer $n$. Discrete-time frequencies that differ by $2\\pi$ cannot be told apart. The same fact makes the discrete-time Fourier transform $2\\pi$-periodic and makes aliasing unavoidable.'},

{t:'h2', num:'1.14', text:'Chapter summary'},
{t:'ol', items:[
 '$E_\\infty$ and $P_\\infty$ are limits. Finite energy forces zero average power. Finite non-zero average power forces infinite energy. Unbounded growth gives neither.',
 'To build $x(at-b)$, shift by $b$ first, then scale by $a$. The other order gives $x(at-ab)$.',
 '$T_0$ and $N_0$ are the smallest positive periods, and $\\omega_0=2\\pi/T_0=2\\pi/N_0$.',
 '$\\delta[n]$ is an ordinary sequence. $\\delta(t)$ is a distribution defined by sifting.',
 'Every signal is a sum of weighted, shifted impulses: $x[n]=\\sum_k x[k]\\delta[n-k]$.',
 'A discrete-time exponential is periodic only when $\\omega_0/2\\pi$ is rational. A continuous-time one always is.'
]},

{t:'h3', text:'Exercises'},
{t:'q', n:'1.1', text:'Classify $x(t)=e^{-3t}u(t)$ as an energy signal, a power signal, or neither. Give the value of whichever quantity is finite.', ans:'Energy signal, $E_\\infty=1/6$.'},
{t:'q', n:'1.2', text:'For $x[n]$ non-zero only on $-1\\le n\\le1$ with values $1,2,1$, sketch $x[n+4]$ and $x[n-5]$ and give the support of each.', ans:'Supports $-5\\le n\\le-3$ and $4\\le n\\le6$.'},
{t:'q', n:'1.3', text:'A signal $x(t)$ is non-zero only on $[-1,5]$. On what interval is $x(2t+3)$ non-zero?', ans:'$[-2,1]$.'},
{t:'q', n:'1.4', text:'Find the fundamental period of $x[n]=\\cos(4\\pi n/7)$, or show that it is aperiodic.', ans:'$N_0=7$.'},
{t:'q', n:'1.5', text:'Show that if $x(t)$ is odd then $\\int_{-a}^{a}x(t)\\,\\d t=0$ for every $a>0$.'},
{t:'q', n:'1.6', text:'Evaluate $\\int_{-\\infty}^{\\infty}(t^{2}+1)\\,\\delta(t-2)\\,\\d t$ and $\\sum_{n=-\\infty}^{\\infty}2^{-n}\\,\\delta[n-3]$.', ans:'5 and $1/8$.'}
];
})();
