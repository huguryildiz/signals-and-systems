/* Course notes — front matter and Chapter 1 */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));
/* the catalogue of common signals (section 1.14): small 2 x 2 figures */
const cat=o=>ax(Object.assign({w:340,h:150,pad:{l:40,r:16,t:14,b:28},ytarget:2},o));
const rectP=t=>Math.abs(t)<0.5?1:0, triP=t=>Math.max(0,1-Math.abs(t)),
      sincP=t=>t===0?1:Math.sin(Math.PI*t)/(Math.PI*t), gaussP=t=>Math.exp(-Math.PI*t*t);
const fr=t=>t-Math.floor(t);
/* a fixed pseudo-random sequence in [-1,1], so every build draws the same noise */
const hiss=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453; return 2*(s-Math.floor(s))-1;};

window.C1 = [

/* ---------------- cover and contents ---------------- */
{t:'cover', kicker:'Signals and Systems', text:'Signals, Systems and<br>Frequency-Domain Analysis',
 sub:'Lecture Notes', foot:'Chapters 1&ndash;7 &middot; Appendix A'},
{t:'page'},

{t:'h1', text:'Contents', rule:false},
{t:'toc', items:[
 ['1','Signals','Energy and power. Shifting, reversal and scaling. Periodicity. Even and odd parts. Impulses and steps. Complex exponentials. A catalogue of common signals.','OW CH1.1&ndash;1.4'],
 ['2','Systems and their properties','Memory, invertibility, causality, stability, time invariance, linearity.','OW CH1.5&ndash;1.6'],
 ['3','Linear time-invariant systems','Impulse response. Convolution sum and convolution integral. Properties of convolution.','OW CH2.1&ndash;2.3'],
 ['4','Fourier series','The eigenfunction property. Analysis and synthesis. Existence. Properties. A periodic input through an LTI system.','OW CH3.1&ndash;3.11'],
 ['5','The continuous-time Fourier transform','From series to transform. The standard pairs. Every property with its proof. Parseval. Modulation. Differential equations.','OW CH4.1&ndash;4.7'],
 ['6','The discrete-time Fourier transform','The same construction in discrete time. Why the spectrum repeats. Periodic convolution. Difference equations.','OW CH5.1&ndash;5.8'],
 ['7','Sampling and aliasing','Impulse-train sampling. Replication and the guard band. The sampling theorem. Reconstruction, holds, and aliasing.','OW CH7.1&ndash;7.3'],
 ['A','Summary of formulas','Everything from Chapters 1 to 7 on two pages.','']
]},

{t:'h3', text:'How to read these notes'},
{t:'p', text:'These notes teach the full course at undergraduate level. They assume calculus, complex numbers and basic circuits. They define signals, classify systems and show why one function describes a linear time-invariant system. They then represent signals with complex exponentials and explain how sampling changes a signal.'},
{t:'p', text:'Read the chapters in order because each chapter uses the one before it. First, a signal is defined as a function. Next, a system is defined as a map on functions. A linear time-invariant system is then described by one function. The frequency-domain chapters use this function to turn convolution into multiplication.'},
{t:'p', text:'Each topic follows the same teaching order. A picture introduces the purpose of the idea. A definition and an equation state it exactly. A short derivation names each step. A worked example applies the method and ends with a check. Each worked example uses five headings: Given, Find, Method, Solution, Check. Try the Check step before you read it.'},
{t:'p', text:'Two conventions apply throughout the notes. Energy and power are <b>normalised</b>: the resistance is $1\\ \\Omega$, so instantaneous power is $|x|^{2}$. The imaginary unit is $j$.'},

{t:'p', text:'The third contents column gives textbook references. For example, <b>OW CH1.1&ndash;1.4</b> points to the matching material in Oppenheim and Willsky, <i>Signals and Systems</i>, second edition. The <b>OW</b> mark separates a textbook address from a course address. The numbering systems differ: these notes introduce the continuous-time Fourier transform in chapter 5, while the textbook introduces it in chapter 4.'},

{t:'page'},

/* ================= CHAPTER 1 ================= */
{t:'h1', num:'CHAPTER 1', text:'Signals'},
{t:'p', lead:true, text:'A signal represents information as a function. This chapter defines continuous-time and discrete-time signals. It then shows how to calculate energy and power, change the time axis, test periodicity and symmetry, and use impulses and complex exponentials. It ends with a catalogue of common signals.'},

{t:'h2', num:'1.1', text:'What a signal is'},
{t:'p', text:'A signal is a physical quantity that varies and carries information. Mathematically, it is a function of one or more independent variables.'},
{t:'p', text:'The independent variable in this course is usually time. An image instead uses two space variables. The same signal operations apply to those variables.'},
{t:'p', text:'Continuous-time and discrete-time signals use different domains. Keep their notation separate.'},
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
  cap:'A discrete-time signal is drawn with stems. The dots are the signal values. No signal value exists between adjacent integer indices.'}
]},
{t:'box', kind:'err', html:'<span class="t">Notation</span>Writing $x[t]$ or $x(n)$ states the wrong domain. The domain determines the periodicity test, the convolution limits and the transform properties.'},

{t:'h2', num:'1.2', text:'Signal energy and power'},
{t:'p', text:'Signal energy and power come from circuit power. If $v(t)$ is the voltage across a resistance $R$, use Ohm\'s law to write the instantaneous power as'},
{t:'eq', tex:'p(t)=v(t)\\,i(t)=v(t)\\left(\\frac{v(t)}{R}\\right)=\\frac{1}{R}\\,v^{2}(t).'},
{t:'p', text:'To find the energy over a time interval, integrate the instantaneous power:'},
{t:'eq', tex:'E=\\int_{t_1}^{t_2}p(t)\\,\\d t=\\int_{t_1}^{t_2}\\frac{1}{R}v^{2}(t)\\,\\d t.'},
{t:'p', text:'From this point onward, set $R=1\\ \\Omega$ and use $|x(t)|^{2}$. This is the normalised convention. Restore the factor $1/R$ when a physical calculation uses a different resistance.'},
{t:'p', text:'We use the modulus because a signal may be complex valued, and $|x(t)|^{2}=x(t)\\,x^{*}(t)$ is the quantity that is real and never negative. Writing $x^{2}(t)$ instead is correct only for real signals.'},

{t:'h3', text:'Total energy'},
{t:'eqbox', cap:'Total energy over all time',
 tex:['E_\\infty=\\lim_{T\\to\\infty}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t',
      'E_\\infty=\\lim_{N\\to\\infty}\\sum_{n=-N}^{N}|x[n]|^{2}=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}'],
 after:'The integral or sum may not converge. Because $E_\\infty$ is a limit, non-convergence means that the signal has no finite total energy. Calculate average power next before classifying the signal.'},

{t:'h3', text:'Average power'},
{t:'p', text:'Average power measures energy per unit time. Over a finite interval $[t_1,t_2]$, divide the energy by the length of the interval:'},
{t:'eq', tex:'P=\\frac{1}{t_2-t_1}\\int_{t_1}^{t_2}p(t)\\,\\d t.'},
{t:'p', text:'For the average over all time, use the symmetric window $[-T,T]$, as for the energy. Then let the window grow.'},
{t:'eqbox', cap:'Average power over all time',
 tex:['P_\\infty=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t',
      'P_\\infty=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}'],
 after:'In discrete time the divisor is $2N+1$, because that is the number of samples between $-N$ and $+N$ inclusive. A divisor of $2N$ gives the same limit, but the wrong value at a finite $N$.'},
{t:'box', kind:'warn', html:'<span class="t">Take the limit of the ratio</span>Calculate the energy-to-duration ratio for each finite interval. The ratio may approach any non-negative value, including zero.'},
{t:'fig', svg:()=>{
  const a=P.Axes({w:700,h:210,xr:[0,20],yr:[-0.06,1.15],xlabel:'T',ylabel:'P_T',pad:{l:48,r:20,t:16,b:32},xtarget:5,ytarget:4});
  const pts=[],qts=[];
  for(let i=1;i<=1000;i++){ const T=i*0.02, k=Math.floor(T/2), r=T-2*k;
    pts.push([T,(k+Math.min(r,0.5)+Math.max(r-1.5,0))/T]);
    qts.push([T,T<=0.5?1:1/(2*T)]); }
  a.poly(qts,{color:C.out}); a.poly(pts,{color:C.in});
  a.hline(0.5,{color:C.in,dash:'2 5'});
  a.note(19.5,0.62,'\\text{square wave}:\\;P_\\infty=1/2',{anchor:'end',color:C.in,fs:13,tex:true});
  a.note(19.5,0.12,'\\text{single pulse}:\\;P_\\infty=0',{anchor:'end',color:C.out,fs:13,tex:true});
  return a.svg();},
 cap:'The running average $P_T=E_T/(2T)$ of two signals. The single pulse is $1$ for $|t|<1/2$ and has energy $1$. The square wave repeats that pulse every 2 s. The two averages agree until $T=3/2$. The square wave keeps adding energy, so its average approaches $1/2$. The pulse adds none, so its average $1/(2T)$ approaches $0$.'},

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
{t:'p', text:'Compute the finite-window energy of the diverging signal $x(t)=\\cos(2t)$ before taking any limit. Use the identity $\\cos^{2}\\theta=\\tfrac12(1+\\cos2\\theta)$ and integrate each term:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}\\cos^{2}(2t)\\,\\d t\\\\&=\\int_{-T}^{T}\\frac{1+\\cos(4t)}{2}\\,\\d t\\\\&=\\left[\\frac{t}{2}+\\frac{\\sin(4t)}{8}\\right]_{-T}^{T}\\\\&=T+\\frac{\\sin(4T)}{4}.\\end{aligned}'},
{t:'p', text:'The sine term stays between $-1/4$ and $1/4$, while $T$ grows without limit. So $E_\\infty\\to\\infty$. Dividing by the window length gives a finite average power:'},
{t:'eq', tex:'P_\\infty=\\lim_{T\\to\\infty}\\frac{E_T}{2T}=\\lim_{T\\to\\infty}\\left(\\frac12+\\frac{\\sin(4T)}{8T}\\right)=\\frac12.'},

{t:'h2', num:'1.3', text:'Energy signals, power signals, and neither'},
{t:'table', head:['Type','Condition','Typical signals'], rows:[
 ['Energy signal','$E_\\infty<\\infty$ and $P_\\infty=0$','Finite pulses and decaying responses'],
 ['Power signal','$E_\\infty\\to\\infty$ and $0<P_\\infty<\\infty$','Constants, sinusoids and other continuing signals'],
 ['Neither','$E_\\infty\\to\\infty$ and $P_\\infty\\to\\infty$','Signals that grow without bound, such as $t\\,u(t)$']
]},
{t:'p', text:'The two energy-signal conditions are not independent. If $E_\\infty$ is finite, the energy in every finite window is at most $E_\\infty$. Dividing this bound by $2T$ makes $P_\\infty$ approach zero. The power condition follows from the energy condition.'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\le E_\\infty\\\\0\\le P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}\\le\\lim_{T\\to\\infty}\\frac{E_\\infty}{2T}=0\\\\\\therefore\\quad P_\\infty&=0.\\end{aligned}'},
{t:'p', text:'The constant $x(t)=1$ is the simplest power signal. The energy in the window grows with the window, but the window length cancels in the average:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}1^{2}\\,\\d t=2T\\;\\to\\;\\infty,\\\\P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}=\\lim_{T\\to\\infty}\\frac{2T}{2T}=1.\\end{aligned}'},
{t:'p', text:'The ramp $x(t)=t$ for $t\\ge0$, and $x(t)=0$ for $t<0$, is in neither class. The lower limit of the energy integral is $0$ because the ramp is zero for $t<0$:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{0}^{T}t^{2}\\,\\d t=\\left[\\frac{t^{3}}{3}\\right]_{0}^{T}=\\frac{T^{3}}{3}\\;\\to\\;\\infty,\\\\P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}=\\lim_{T\\to\\infty}\\frac{T^{3}/3}{2T}=\\lim_{T\\to\\infty}\\frac{T^{2}}{6}=\\infty.\\end{aligned}'},
{t:'p', text:'Both limits diverge. Compute both before you assign a class.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({xr:[-2,3],yr:[-0.3,1.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.area(t=>(t>=0&&t<=1)?1:0,0,1,{color:'rgba(74,122,70,.18)'});
   a.curve(t=>(t>=0&&t<=1)?1:0,{color:C.out}); return a.svg();},
  cap:'Energy signal: $E_\\infty=1$, $P_\\infty=0$.'},
 {svg:()=>{const a=ax({xr:[-3,3],yr:[-0.3,1.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>1,{color:C.h}); return a.svg();},
  cap:'Power signal: $E_\\infty\\to\\infty$, $P_\\infty=1$.'},
 {svg:()=>{const a=ax({xr:[-2,4],yr:[-0.4,4.4],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>t>=0?t:0,{color:C.err}); return a.svg();},
  cap:'Neither: both limits diverge.'}
]},

{t:'ex', hd:'Example 1.1', rows:[
 ['Given','$x(t)=1$ for $0\\le t\\le1$, and $x(t)=0$ otherwise.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','Find $E_\\infty$ first because finite energy implies zero average power. This result then determines the class.'],
 ['Solution','Start with the definitions and then use the support of the signal: $$\\begin{aligned}E_\\infty&=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t\\\\&=\\int_{0}^{1}1^{2}\\,\\d t\\\\&=\\left.t\\right|_{0}^{1}=1<\\infty.\\end{aligned}$$ For every $T\\ge1$, the window contains the whole pulse. Therefore $$\\begin{aligned}P_\\infty&=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{0}^{1}1\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\frac{1}{2T}=0.\\end{aligned}$$ So $x(t)$ is an <b>energy signal</b>, with $E_\\infty=1$ J.'],
 ['Check','Halving the amplitude must divide the energy by four. Direct calculation gives $\\int_0^1(1/2)^2\\d t=1/4$, so the result has the required quadratic dependence on amplitude.']
]},

{t:'ex', hd:'Example 1.2', rows:[
 ['Given','$x[n]=4$ for every integer $n$.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','Each sample contributes the same positive energy, so $E_\\infty$ diverges. Calculate $P_\\infty$ next and use the exact count $2N+1$.'],
 ['Solution','Each sample contributes $|4|^{2}=16$, so $$\\begin{aligned}E_\\infty&=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}|4|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}16\\to\\infty.\\end{aligned}$$ The finite window from $-N$ to $N$ contains $2N+1$ samples. Hence $$\\begin{aligned}P_\\infty&=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}\\\\&=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}16\\\\&=\\lim_{N\\to\\infty}\\frac{(2N+1)16}{2N+1}\\\\&=\\lim_{N\\to\\infty}16=16.\\end{aligned}$$ So $x[n]$ is a <b>power signal</b>, with $P_\\infty=16$.'],
 ['Check','A constant of amplitude $A$ must have $P_\\infty=A^{2}$. The factor $2N+1$ cancels exactly, which confirms the sample count was right.']
]},
{t:'box', kind:'err', html:'<span class="t">Do not infer power from energy alone</span>Infinite energy does not imply infinite average power. For the constant sequence, both the energy sum and the sample count grow at the same rate. Their ratio approaches 16.'},



{t:'h2', num:'1.4', text:'Time shifting'},
{t:'eqbox', cap:'Time shift', tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)',
 after:'If $t_0>0$ the signal is <b>delayed</b> and moves right. If $t_0<0$ it is <b>advanced</b> and moves left.'},
{t:'p', text:'Read the argument before moving the graph. At time $t$, the shifted signal uses the original value at $t-t_0$. For $t_0>0$, it reaches each original value $t_0$ seconds later. The graph therefore moves right.'},
{t:'fig', svg:()=>{const tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
  const a=ax({xr:[-5,5],yr:[-0.35,1.55],xlabel:'t',w:700,h:190,xtarget:11,ytarget:2});
  a.curve(t=>tri(t+3),{color:C.out}); a.curve(tri,{color:C.ink}); a.curve(t=>tri(t-3),{color:C.in});
  a.note(-3,1.1,'x(t+3)',{anchor:'middle',color:C.out,fs:13,tex:true});
  a.note(0,1.1,'x(t)',{anchor:'middle',color:C.ink,fs:13,tex:true});
  a.note(3,1.1,'x(t-3)',{anchor:'middle',color:C.in,fs:13,tex:true});
  a.span(-3,0,1.42,'advance by 3 s',{color:C.out}); a.span(0,3,1.42,'delay by 3 s',{color:C.in});
  return a.svg();},
 cap:'A time shift changes the signal position but not its shape.'},
{t:'p', text:'For example, a radar sends a pulse $x(t)$ and the echo returns $0.2$ ms later. With $t$ in ms, the echo is $x(t-0.2)$. It arrives later, so it is a delay with $t_0=0.2>0$.'},
{t:'eqbox', cap:'Time shift in discrete time', tex:'x[n]\\;\\longrightarrow\\;x[n-n_0],\\qquad n_0\\in\\mathbb{Z}',
 after:'The sign rule is the same as in continuous time. If $n_0>0$ the stems move right. If $n_0<0$ they move left.'},
{t:'p', text:'Every sample moves by the same whole number of steps. The shift must be an integer because a sequence has values only at integer indices. The expression $x[n-\\tfrac12]$ is therefore not defined.'},
{t:'p', text:'Read a shifted sequence one sample at a time. Let $x[n]=1-n/4$ for $n=0,1,2,3$ and $x[n]=0$ elsewhere, and let $y[n]=x[n-2]$. Then $y[3]=x[3-2]=x[1]=1-\\tfrac14=0.75$.'},
{t:'figrow', items:[
 {svg:()=>{const x=n=>n>=0&&n<=3?1-n/4:0;
   const a=ax({xr:[-2.5,6.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'x[n]',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:9,ytarget:2});
   a.stem(D(x,-2,6),{color:C.ink}); return a.svg();},
  cap:'$x[n]=1-n/4$ for $n=0,1,2,3$.'},
 {svg:()=>{const x=n=>n>=0&&n<=3?1-n/4:0;
   const a=ax({xr:[-2.5,6.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'y[n]',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:9,ytarget:2});
   a.stem(D(n=>x(n-2),-2,6),{color:C.mid}); return a.svg();},
  cap:'$y[n]=x[n-2]$: every stem moves two samples right. The sample $x[1]=0.75$ appears at $n=3$.'}
]},
{t:'p', text:'A one-sample delay, $x[n-1]$, is the basic memory element of every difference equation in Chapter 3.'},

{t:'h2', num:'1.5', text:'Time reversal and time scaling'},
{t:'eqbox', cap:'Time reversal', tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)',
 after:'Reflect the signal about the vertical axis. The value at time $t$ moves to time $-t$.'},
{t:'p', text:'Find the new support in the same way as for any change of the argument. If $x$ is non-zero only on $[\\alpha,\\beta]$, then $x(-t)$ is non-zero where $\\alpha\\le -t\\le\\beta$, that is on $[-\\beta,-\\alpha]$. A pulse on $[1,3]$ moves to $[-3,-1]$, and its width stays 2.'},
{t:'p', text:'Reversal changes what you hear when the signal is not symmetric in time. A plucked string starts loud and dies away, for example $x(t)=e^{-4t}\\sin(2\\pi\\,220\\,t)$ for $t\\ge0$. Played backwards, $x(-t)$ swells and then stops at once. A steady tone does not change: $\\cos(-2\\pi\\,440\\,t)=\\cos(2\\pi\\,440\\,t)$.'},
{t:'eqbox', cap:'Time scaling', tex:'y(t)=x(at),\\qquad a>0',
 after:'If $a>1$ the signal is compressed and speeded up. If $0<a<1$ it is stretched and slowed down.'},
{t:'p', text:'Write the scaled signal as a new signal $y(t)$. Writing $x(t)=x(at)$ would force $a=1$.'},
{t:'p', text:'Find the new support by solving $at\\in[\\alpha,\\beta]$. If $x$ is non-zero only on $[\\alpha,\\beta]$, then $x(at)$ is non-zero only on $[\\alpha/a,\\beta/a]$. The width is divided by $a$.'},
{t:'eq', tex:'at\\in[\\alpha,\\beta]\\;\\Longleftrightarrow\\;\\alpha\\le at\\le\\beta\\;\\Longleftrightarrow\\;\\frac{\\alpha}{a}\\le t\\le\\frac{\\beta}{a},\\qquad a>0.'},
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
{t:'p', text:'Time scaling also changes frequency. Substitute $at$ for $t$ in one tone:'},
{t:'eq', tex:'x(t)=\\sin(2\\pi f_0t)\\quad\\Longrightarrow\\quad x(at)=\\sin\\bigl(2\\pi f_0(at)\\bigr)=\\sin\\bigl(2\\pi\\,(af_0)\\,t\\bigr).'},
{t:'p', text:'Every frequency is multiplied by $a$. A melody that lasts 2 s lasts $2/a$ s after scaling, and each pitch moves with it. At $a=2$ each frequency doubles, which is one octave up. This is what a voice message sounds like at double speed. At $a=\\tfrac12$, a 440 Hz tone becomes $\\tfrac12\\cdot440=220$ Hz.'},
{t:'box', kind:'warn', html:'<span class="t">Discrete-time scaling needs separate rules</span>$x[2n]$ keeps only the even-indexed samples and discards the odd-indexed samples. This operation is decimation and may lose information. The expression $x[n/2]$ is undefined at odd $n$ unless an interpolation rule supplies those values. Continuous-time scaling does not have this integer-index restriction.'},

{t:'h2', num:'1.6', text:'Combining a shift and a scale'},
{t:'p', text:'To construct $x(at-b)$ from $x(t)$, use an intermediate signal so that each operation is explicit.'},
{t:'eqbox', cap:'Shift, then scale', tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
 after:'Shift by $b$ first. Then scale the result by $a$.'},
{t:'box', kind:'err', html:'<span class="t">Why the order matters</span>Scaling first gives $w(t)=x(at)$. Shifting that by $b$ gives $w(t-b)=x\\bigl(a(t-b)\\bigr)=x(at-ab)$. Unless $a=1$ this is a different signal: it is shifted by $b$ instead of by $b/a$.'},
{t:'ex', hd:'Example 1.3', rows:[
 ['Given','$x(t)$ is zero for $t<-2$, equal to $1$ on $[-2,0]$, equal to $2$ on $[0,2]$, and falls linearly from $2$ to $0$ on $[2,4]$.'],
 ['Find','Plot $x(3t-5)$.'],
 ['Method','Here $a=3$ and $b=5$. Shift right by 5, then compress by 3.'],
 ['Solution','For the shift, each original corner $c$ moves to $c+5$, so $-2,0,2,4$ become $3,5,7,9$. For the final signal, solve the argument equation for each original corner: $$3t-5=c\\quad\\Longrightarrow\\quad t=\\frac{c+5}{3}.$$ Thus $$c=-2,0,2,4\\quad\\Longrightarrow\\quad t=1,\\frac53,\\frac73,3.$$ These are the four corners of $y(t)=x(3t-5)$.'],
 ['Check','The original support has width 6. Compression by $a=3$ must give width 2, and the result has support $[1,3]$. Also set $at-b=0$. This gives $t=b/a=5/3$, where $y(t)$ must equal $x(0)=2$.']
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
{t:'p', text:'The definition has two requirements. A positive period must exist, and the equality must hold for every $t$ or $n$. In continuous time, $T$ may be any positive real number. In discrete time, $N$ must be a positive integer because the sequence exists only at integer indices. A value such as 3.5 samples cannot be a period.'},
{t:'p', text:'If $T$ is a period then so is $2T$, $3T$, and so on. The <b>fundamental period</b> $T_0$ is the smallest positive period. The same applies to $N_0$ in discrete time.'},
{t:'eqbox', cap:'Fundamental frequency', tex:'\\omega_0=\\frac{2\\pi}{T_0}\\qquad\\text{and}\\qquad \\omega_0=\\frac{2\\pi}{N_0}',
 after:'Without the word <em>smallest</em>, $\\omega_0$ would not be well defined.'},
{t:'p', text:'Two short cases show the definition at work. For $x(t)=\\cos(\\pi t/3)$, the angular frequency is $\\omega_0=\\pi/3$, so $T_0=2\\pi/(\\pi/3)=6$. For $x[n]=(-1)^{n}$, the test $N=1$ fails because $(-1)^{n+1}=-(-1)^{n}$. The test $N=2$ succeeds because $(-1)^{n+2}=(-1)^{n}$ for every $n$. So $N_0=2$.'},
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
{t:'p', text:'To test an odd signal at the origin, set $t=0$ in the definition. This gives $x(0)=-x(0)$, so $x(0)=0$. Therefore any signal with $x(0)\\neq0$ is not odd.'},
{t:'p', text:'Every signal splits into an even part and an odd part, in exactly one way:'},
{t:'eqbox', cap:'Even and odd parts',
 tex:['\\Ev\\{x(t)\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr],\\qquad \\Od\\{x(t)\\}=\\tfrac12\\bigl[x(t)-x(-t)\\bigr]',
      'x(t)=\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}'],
 after:'Adding the two definitions returns $x$ exactly.'},
{t:'eq', tex:'\\begin{aligned}\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}&=\\tfrac12[x(t)+x(-t)]+\\tfrac12[x(t)-x(-t)]\\\\&=\\tfrac12[2x(t)]=x(t).\\end{aligned}'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-0.12,1.15],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>t*t,{color:C.in}); return a.svg();}, cap:'$t^{2}$ is even.'},
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>t*t*t,{color:C.mid}); return a.svg();}, cap:'$t^{3}$ is odd.'},
 {svg:()=>{const a=ax({xr:[-1,1],yr:[-0.2,3.1],xlabel:'t',w:230,h:120,pad:{l:32,r:12,t:12,b:24},xtarget:2,ytarget:2});
   a.curve(t=>Math.exp(-t),{color:C.h}); return a.svg();}, cap:'$e^{-t}$ is neither.'}
]},
{t:'p', text:'To classify a signal, compute $x(-t)$ and compare it with $x(t)$. Do not rely on the look of the graph alone.'},
{t:'ul', items:[
 '$x(t)=t\\sin t$ gives $x(-t)=(-t)\\sin(-t)=t\\sin t=x(t)$, so it is even.',
 '$x(t)=\\sin(\\pi t)$ gives $x(-t)=-\\sin(\\pi t)=-x(t)$, so it is odd.',
 '$x(t)=e^{-2t}u(t)$ has $x(-1)=0$ but $x(1)=e^{-2}$, so it is not even. It has $x(0)=1\\neq0$, so it is not odd. It is neither.',
 '$x[n]=n$ for $|n|\\le3$ and $0$ otherwise gives $x[-n]=-x[n]$ at every $n$, so it is odd.'
]},
{t:'ex', hd:'Example 1.4', rows:[
 ['Given','The unit pulse $x(t)=1$ for $0<t<1$, and $x(t)=0$ otherwise.'],
 ['Find','$\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$.'],
 ['Method','Write down the mirror image $x(-t)$ first. Then apply the two definitions interval by interval.'],
 ['Solution','The mirror image is $x(-t)=1$ for $-1<t<0$, and $0$ otherwise. The two pulses do not overlap, so on each interval only one of them is non-zero: $$\\Ev\\{x(t)\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr]=\\begin{cases}\\tfrac12,&-1<t<0\\\\\\tfrac12,&0<t<1\\\\0,&|t|>1\\end{cases}$$ $$\\Od\\{x(t)\\}=\\tfrac12\\bigl[x(t)-x(-t)\\bigr]=\\begin{cases}-\\tfrac12,&-1<t<0\\\\\\tfrac12,&0<t<1\\\\0,&|t|>1.\\end{cases}$$'],
 ['Check','Add the two parts. On $0<t<1$: $\\tfrac12+\\tfrac12=1=x(t)$. On $-1<t<0$: $\\tfrac12-\\tfrac12=0=x(t)$. Outside $[-1,1]$ both parts are $0$. The sum returns $x(t)$ everywhere.']
]},
{t:'figrow', n:3, items:[
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=ax({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>x(-t),{color:C.muted,dash:'4 4',n:1600}); a.curve(x,{color:C.h,n:1600}); return a.svg();},
  cap:'$x(t)$, with its mirror $x(-t)$ dashed.'},
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=ax({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>0.5*(x(t)+x(-t)),{color:C.in,n:1600}); return a.svg();},
  cap:'$\\Ev\\{x(t)\\}$: height $\\tfrac12$ on both sides.'},
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=ax({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.curve(t=>0.5*(x(t)-x(-t)),{color:C.mid,n:1600}); return a.svg();},
  cap:'$\\Od\\{x(t)\\}$: the left half flips below the axis.'}
]},

{t:'h2', num:'1.9', text:'The unit impulse and the unit step in discrete time'},
{t:'eqbox', cap:'Definitions',
 tex:['\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}',
      'u[n]=\\begin{cases}1,&n\\ge0\\\\0,&\\text{otherwise}\\end{cases}'],
 after:'Both are ordinary sequences. Nothing infinite happens here.'},
{t:'p', text:'A first difference converts the step into the impulse. A running sum converts the impulse back into the step. These operations are the discrete-time forms of differentiation and integration.'},
{t:'eqbox', cap:'First difference and running sum',
 tex:['\\delta[n]=u[n]-u[n-1]', 'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\delta[n]+\\delta[n-1]+\\delta[n-2]+\\cdots']},
{t:'p', text:'The first difference works because the delayed step $u[n-1]$ equals $u[n]$ at every $n\\ge1$, so the two cancel there. Both are zero for $n<0$. Only $n=0$ survives, where $u[0]-u[-1]=1-0=1$.'},
{t:'p', text:'Each term $\\delta[n-k]$ of the running sum places one unit sample at $n=k$. To write the sum as an accumulation up to $n$, substitute $m=n-k$. Then $k=0$ gives $m=n$, and $k\\to\\infty$ gives $m\\to-\\infty$:'},
{t:'eq', tex:'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\sum_{m=-\\infty}^{n}\\delta[m].'},
{t:'p', text:'The two operations undo each other. A first difference reverses a running sum, and a running sum reverses a first difference. For example, $u[n]-u[n-3]$ keeps the step only until the delayed step starts at $n=3$. So $u[n]-u[n-3]=\\delta[n]+\\delta[n-1]+\\delta[n-2]$, with three non-zero samples.'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:5,ytarget:2});
   a.stem(D(n=>n===0?1:0,-3,5),{color:C.in}); a.note(4.6,1.1,'\\delta[n]',{anchor:'end',color:C.in,fs:12,tex:true}); return a.svg();}},
 {svg:()=>{const a=ax({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',w:340,h:130,pad:{l:36,r:14,t:12,b:26},xtarget:5,ytarget:2});
   a.stem(D(n=>n>=0?1:0,-3,5),{color:C.h}); a.note(4.6,1.1,'u[n]',{anchor:'end',color:C.h,fs:12,tex:true}); return a.svg();}}
]},

{t:'h3', text:'Sampling and sifting'},
{t:'p', text:'Sampling and sifting both use a shifted impulse, but they return different types of result.'},
{t:'eqbox', cap:'Sampling property', tex:'x[n]\\,\\delta[n-n_0]=x[n_0]\\,\\delta[n-n_0]',
 after:'Both sides are <b>sequences</b>. Multiplying by a shifted impulse keeps one sample and deletes the rest.'},
{t:'eqbox', cap:'Sifting property', tex:'x[n_0]=\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]',
 after:'The right-hand side is a <b>number</b>. Sifting is sampling followed by a sum.'},
{t:'ex', hd:'Example 1.5', rows:[
 ['Given','$x[0]=1$, $x[1]=2$, $x[2]=3$, and $x[n]=0$ elsewhere. Take $n_0=2$.'],
 ['Find','The sampled sequence and the sifted value.'],
 ['Method','Multiply by $\\delta[n-2]$ to keep the sample at $n=2$. Then sum the sampled sequence to sift out its value.'],
 ['Solution','Sampling: $x[n]\\delta[n-2]=x[2]\\delta[n-2]=3\\,\\delta[n-2]$, a single stem of height 3 at $n=2$.<br>Sifting: $\\sum_n x[n]\\delta[n-2]=x[0]\\cdot0+x[1]\\cdot0+x[2]\\cdot1=3$.'],
 ['Check','The sampled result is a sequence. The sifted result is the number 3.']
]},
{t:'p', text:'Apply the sampling property at every integer shift and add the results. This produces the representation used to derive convolution in Chapter 3.'},
{t:'eqbox', cap:'Representation property', big:true, tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]',
 after:'Any sequence is a sum of weighted, shifted impulses. The weights are the sample values themselves.'},
{t:'p', text:'Apply the representation to the step itself. The weight $u[k]$ is $0$ for $k<0$ and $1$ for $k\\ge0$, so it switches off every term with $k<0$:'},
{t:'eq', tex:'u[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,\\delta[n-k]=\\sum_{k=-\\infty}^{-1}0\\cdot\\delta[n-k]+\\sum_{k=0}^{\\infty}1\\cdot\\delta[n-k]=\\sum_{k=0}^{\\infty}\\delta[n-k].'},
{t:'p', text:'This is the running sum found above.'},



{t:'h2', num:'1.10', text:'The unit impulse and the unit step in continuous time'},
{t:'p', text:'The continuous-time step is $u(t)=1$ for $t\\ge0$ and $0$ otherwise. The continuous-time impulse is not an ordinary function.'},
{t:'box', kind:'err', html:'<span class="t">Define the impulse by its action</span>An ordinary function that is zero except at one point has integral 0, not 1. The impulse is therefore a <b>distribution</b>, also called a generalized function. A distribution is defined by how it acts inside an integral.'},
{t:'eqbox', cap:'Defining property (sifting)', tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t',
 after:'This is the definition. Everything else about $\\delta$ follows from it.'},
{t:'p', text:'An informal picture is often written as $\\delta(t)=\\infty$ at $t=0$, $\\delta(t)=0$ elsewhere, with $\\int_{-\\infty}^{\\infty}\\delta(t)\\,\\d t=1$. Use it only as a picture. A figure draws $\\delta(t)$ as an arrow, and the number beside the arrow is its <b>weight</b>. The weight is an area, not a function value. So $\\int_{-\\infty}^{\\infty}3\\,\\delta(t)\\,\\d t=3$.'},
{t:'p', text:'To picture the impulse, use a rectangle of width $\\varepsilon$ and height $1/\\varepsilon$. Its area is 1. Then let $\\varepsilon\\to0$. The rectangles do not approach an ordinary function at each fixed $t$. Their integrals against a continuous test function do approach the sifting result.'},
{t:'fig', svg:()=>{const a=ax({xr:[-1.2,1.2],yr:[-0.5,9.2],xlabel:'t',ylabel:'\\delta_\\varepsilon(t)',w:700,h:210,pad:{l:52,r:20,t:14,b:30},xtarget:5,ytarget:4,ytickfmt:()=>''});
  [1,0.5,0.25,0.125].forEach((e,i)=>{ const col=i===3?C.in:C.muted;
    a.poly([[-e/2,0],[-e/2,1/e],[e/2,1/e],[e/2,0]],{color:col,width:i===3?2:1.3});
    a.note(e/2+0.03,1/e,String(1/e),{anchor:'start',color:col,fs:12}); });
  a.note(1.15,6.2,'\\text{width }\\varepsilon,\\;\\text{height }1/\\varepsilon,\\;\\text{area }1',{anchor:'end',color:C.muted,fs:12,tex:true});
  return a.svg();},
 cap:'Unit-area rectangles with $\\varepsilon=1,\\tfrac12,\\tfrac14,\\tfrac18$. The number beside each top is its height $1/\\varepsilon$. As $\\varepsilon\\to0$ the rectangle becomes the impulse $\\delta(t)$. A rectangle of width $0.1$ has height $10$.'},
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
{t:'p', text:'The step and impulse pair $\\delta[n]=u[n]-u[n-1]$ is the discrete-time analogue of $\\delta(t)=\\d u/\\d t$. The discrete-time sum becomes an integral.'},
{t:'ex', hd:'Example 1.6', rows:[
 ['Given','$x(t)=\\cos t$ and $t_0=\\pi$.'],
 ['Find','$\\displaystyle\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(t-\\pi)\\,\\d t$.'],
 ['Method','Use the sampling property to replace $\\cos t$ by its value at the impulse. Then use the unit area of the impulse.'],
 ['Solution','The impulse sits at $t=\\pi$, so $$\\begin{aligned}\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(t-\\pi)\\,\\d t&=\\int_{-\\infty}^{\\infty}\\cos(\\pi)\\,\\delta(t-\\pi)\\,\\d t\\\\&=\\cos(\\pi)\\int_{-\\infty}^{\\infty}\\delta(t-\\pi)\\,\\d t\\\\&=(-1)(1)=-1.\\end{aligned}$$'],
 ['Check','The result is a number, not a signal. It equals $x(t_0)=\\cos\\pi=-1$, as the sifting property requires.']
]},

{t:'h2', num:'1.11', text:'Complex exponentials in continuous time'},
{t:'eqbox', cap:'Definition', tex:'x(t)=C\\,e^{at},\\qquad C,a\\in\\mathbb{C}'},
{t:'p', text:'Complex exponentials describe growth, decay and oscillation in one form. The real and imaginary parts of $a$ determine which behaviour occurs.'},
{t:'h3', text:'Case 1: $C$ and $a$ real'},
{t:'p', text:'If $a<0$ the signal decays. If $a>0$ it grows. If $a=0$ it is the constant $C$. A larger $|a|$ makes the decay or growth faster.'},
{t:'p', text:'Each time $t$ advances by $1/|a|$, the exponent changes by $1$ in magnitude. So the signal is multiplied by $e\\approx2.72$ when it grows, or divided by $e$ when it decays. For example, $x(t)=e^{-2t}$ reaches $e^{-1}$ at $t=1/2$. A signal $e^{at}$ that doubles every second has $e^{a\\cdot1}=2$, so $a=\\ln2\\approx0.69$.'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[0,6],yr:[-0.1,1.15],xlabel:'t',ylabel:'x(t)',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:6,ytarget:3});
   [[0.5,C.in,'9 6'],[1,C.h],[2,C.out]].forEach(([k,col,dash])=>a.curve(t=>Math.exp(-k*t),{color:col,dash}));
   a.note(1.6,1.03,'e^{-0.5t}\\;(\\text{dashed})',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(4.1,1.03,'e^{-t}',{anchor:'start',color:C.h,fs:12,tex:true});
   a.note(5.1,1.03,'e^{-2t}',{anchor:'start',color:C.out,fs:12,tex:true}); return a.svg();},
  cap:'$a<0$: decay. A larger $|a|$ decays faster.'},
 {svg:()=>{const a=ax({xr:[0,1.5],yr:[-1,21],xlabel:'t',ylabel:'x(t)',w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:3});
   [[0.5,C.in,'9 6'],[1,C.h],[2,C.out]].forEach(([k,col,dash])=>a.curve(t=>Math.exp(k*t),{color:col,dash}));
   a.note(0.14,19,'e^{0.5t}\\;(\\text{dashed})',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(0.72,19,'e^{t}',{anchor:'start',color:C.h,fs:12,tex:true});
   a.note(0.9,19,'e^{2t}',{anchor:'start',color:C.out,fs:12,tex:true}); return a.svg();},
  cap:'$a>0$: growth. Every curve starts at $x(0)=C=1$.'}
]},
{t:'h3', text:'Case 2: $a=j\\omega_0$ purely imaginary'},
{t:'p', text:'Write $C=Ae^{j\\theta}$ and use Euler\'s relation $e^{jx}=\\cos x+j\\sin x$:'},
{t:'eq', tex:'\\begin{aligned}x(t)&=Ce^{j\\omega_0t}\\\\&=Ae^{j\\theta}e^{j\\omega_0t}\\\\&=Ae^{j(\\omega_0t+\\theta)}\\\\&=A\\cos(\\omega_0t+\\theta)+jA\\sin(\\omega_0t+\\theta).\\end{aligned}'},
{t:'p', text:'Here $A=|C|$ is the amplitude, $\\omega_0$ is the angular frequency in rad/s, and $\\theta=\\angle C$ is the phase in radians. The amplitude is never negative. For $x(t)=-3e^{j2t}$, write $-3=3e^{j\\pi}$, so $A=3$ and $\\theta=\\pi$.'},
{t:'p', text:'The modulus is constant: $|x(t)|=A\\,|e^{j(\\omega_0t+\\theta)}|=A$ for every $t$. This signal neither grows nor decays. With $\\omega_0=2\\pi f_0$, the real part $\\cos(2\\pi f_0t)$ is a pure tone of $f_0$ hertz. Doubling $f_0$ halves the period and raises the pitch by one octave.'},
{t:'p', text:'To test periodicity, impose the condition $x(t)=x(t+T)$ and solve for $T$:'},
{t:'eq', tex:'\\begin{aligned}x(t+T)&=x(t)\\\\Ae^{j[\\omega_0(t+T)+\\theta]}&=Ae^{j(\\omega_0t+\\theta)}\\\\e^{j\\omega_0T}&=1\\\\\\omega_0T&=2\\pi k,\\qquad k\\in\\mathbb{Z}\\\\T&=\\frac{2\\pi k}{\\omega_0}.\\end{aligned}'},
{t:'box', kind:'ok', html:'<span class="t">Result</span>Taking $k=1$ gives the fundamental period $T_0=2\\pi/\\omega_0$. Every continuous-time complex exponential with $\\omega_0\\neq0$ is periodic. There is no extra condition.'},
{t:'ex', hd:'Example 1.7', rows:[
 ['Given','$x(t)=e^{j0.5\\pi t}$.'],
 ['Find','The fundamental period.'],
 ['Method','Use $T_0=2\\pi/\\omega_0$ because the exponent is purely imaginary and $\\omega_0\\neq0$.'],
 ['Solution','$T_0=\\dfrac{2\\pi}{\\omega_0}=\\dfrac{2\\pi}{0.5\\pi}=4$ seconds.'],
 ['Check','$0.5\\pi\\times4=2\\pi$, so the phase increases by one full turn over the calculated period.']
]},
{t:'h3', text:'Case 3: $a=r+j\\omega_0$'},
{t:'eq', tex:'\\begin{aligned}x(t)&=Ae^{j\\theta}e^{(r+j\\omega_0)t}\\\\&=Ae^{rt}e^{j(\\omega_0t+\\theta)}\\\\&=Ae^{rt}\\cos(\\omega_0t+\\theta)+jAe^{rt}\\sin(\\omega_0t+\\theta).\\end{aligned}'},
{t:'p', text:'The factor $e^{rt}$ is the <b>envelope</b> and the factor $e^{j(\\omega_0t+\\theta)}$ is the <b>rotation</b>. The real part is $\\operatorname{Re}\\{x(t)\\}=Ae^{rt}\\cos(\\omega_0t+\\theta)$. The curves $\\pm Ae^{rt}$ bound the sinusoid. If $r<0$, the oscillation is damped. If $r>0$, it grows. If $r=0$, it is sustained.'},
{t:'p', text:'Read $r$ and $\\omega_0$ directly from the exponent. For $x(t)=e^{(-1+j4)t}$, $r=\\operatorname{Re}\\{a\\}=-1<0$, so the real part $e^{-t}\\cos4t$ decays. A plucked string sounds like a tone with $r<0$.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,5],yr:[-2.3,2.3],xlabel:'t',w:700,h:170,xtarget:5,ytarget:3});
  a.curve(t=>2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>-2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>2*Math.exp(-0.5*t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
  return a.svg();},
 cap:'A damped sinusoid, $\\operatorname{Re}\\{2e^{-0.5t}e^{j2\\pi t}\\}$, with its envelope shown dashed.'},

{t:'h2', num:'1.12', text:'Complex exponentials in discrete time'},
{t:'eqbox', cap:'Definition', tex:'x[n]=C\\,e^{\\beta n}=C\\,\\alpha^{n},\\qquad \\alpha=e^{\\beta}',
 after:'Use the power form in discrete time because solutions of difference equations have this form.'},
{t:'p', text:'For real $C$ and $\\alpha$: if $0<\\alpha<1$ the sequence decreases; if $\\alpha>1$ it increases. For complex $C=|C|e^{j\\theta}$ and $\\alpha=|\\alpha|e^{j\\omega_0}$:'},
{t:'eq', tex:'\\begin{aligned}x[n]&=C\\alpha^n\\\\&=|C|e^{j\\theta}\\bigl(|\\alpha|e^{j\\omega_0}\\bigr)^n\\\\&=|C||\\alpha|^ne^{j(\\omega_0n+\\theta)}\\\\&=|C||\\alpha|^n\\cos(\\omega_0n+\\theta)+j|C||\\alpha|^n\\sin(\\omega_0n+\\theta).\\end{aligned}'},
{t:'p', text:'Read the modulus $|\\alpha|$ as the envelope. If $|\\alpha|=1$ the oscillation is sustained. If $|\\alpha|>1$ it grows. If $|\\alpha|<1$ it decays. The angle $\\omega_0$ sets only the oscillation, in radians per sample. For example, $x[n]=\\bigl(1.1e^{j\\pi/3}\\bigr)^{n}$ grows because $|\\alpha|=1.1>1$.'},
{t:'p', text:'A negative real $\\alpha$ is a special case with $\\omega_0=\\pi$. For $x[n]=(-0.5)^{n}$, $n\\ge0$, the samples are $1,-0.5,0.25,-0.125,\\dots$ The sequence decays because $|\\alpha|=0.5<1$, and it changes sign at every step.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({xr:[0,10],yr:[-0.1,1.15],xlabel:'n',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(n=>Math.pow(0.5,n),0,10),{color:C.in,r:2.4}); return a.svg();},
  cap:'$0.5^{n}$ decreases.'},
 {svg:()=>{const a=ax({xr:[0,10],yr:[-40,1100],xlabel:'n',w:230,h:130,pad:{l:40,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(n=>Math.pow(2,n),0,10),{color:C.h,r:2.4}); return a.svg();},
  cap:'$2^{n}$ increases.'},
 {svg:()=>{const a=ax({xr:[-20,20],yr:[-2.6,2.6],xlabel:'n',w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2});
   a.stem(D(n=>Math.pow(0.95,n)*Math.cos(0.14*Math.PI*n),-20,20),{color:C.mid,r:1.8,width:1.1}); return a.svg();},
  cap:'$0.95^{n}\\cos(0.14\\pi n)$: $|\\alpha|=0.95$ decays.'}
]},
{t:'box', kind:'warn', html:'<span class="t">The boundary moves</span>In continuous time the growth-decay boundary is $\\operatorname{Re}\\{a\\}=0$, the imaginary axis. In discrete time it is $|\\alpha|=1$, the unit circle. The map between them is $\\alpha=e^{\\beta}$.'},

{t:'h2', num:'1.13', text:'When is a discrete-time exponential periodic?'},
{t:'p', text:'A discrete-time period must be an integer. Apply $x[n]=x[n+N]$ to $x[n]=Ce^{j\\omega_0 n}$ and solve for that integer:'},
{t:'eq', tex:'\\begin{aligned}x[n+N]&=x[n]\\\\Ce^{j\\omega_0(n+N)}&=Ce^{j\\omega_0n}\\\\e^{j\\omega_0N}&=1\\\\\\omega_0N&=2\\pi k,\\qquad k\\in\\mathbb{Z}\\\\N&=\\frac{2\\pi k}{\\omega_0}.\\end{aligned}'},
{t:'eqbox', cap:'Periodicity condition', big:true, tex:'\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}\\in\\mathbb{Q}',
 after:'$N$ must be an integer. This is possible only when $\\omega_0/2\\pi$ is rational. If the ratio is irrational, no integer $N$ satisfies the periodicity condition and the sequence is aperiodic.'},
{t:'p', text:'For example, $x[n]=e^{j2n}$ has $\\omega_0/2\\pi=2/2\\pi=1/\\pi$, which is irrational. No integer period exists, so the sequence is aperiodic. The values $N=\\pi$ and $N=2\\pi$ are not periods, because a period must be an integer.'},
{t:'table', head:['','Continuous time, $e^{j\\omega_0t}$','Discrete time, $e^{j\\omega_0n}$'], rows:[
 ['Periodic?','For every $\\omega_0\\neq0$','Only if $\\omega_0/2\\pi$ is rational'],
 ['Distinct frequencies','Each $\\omega_0$ gives a different signal','$\\omega_0$ and $\\omega_0+2\\pi$ give the same sequence']
]},
{t:'ex', hd:'Example 1.8', rows:[
 ['Given','$x[n]=e^{j(3\\pi/5)n}$.'],
 ['Find','The fundamental period $N_0$.'],
 ['Method','Use $N=2\\pi k/\\omega_0$ and take the smallest $k$ that makes $N$ an integer.'],
 ['Solution','Substitute the frequency before choosing $k$: $$\\begin{aligned}N&=\\frac{2\\pi k}{\\omega_0}\\\\&=\\frac{2\\pi k}{3\\pi/5}\\\\&=\\frac{10}{3}k.\\end{aligned}$$ The smallest positive integer $k$ giving an integer $N$ is $k=3$, so $N_0=10$.'],
 ['Check','$\\omega_0N_0=\\dfrac{3\\pi}{5}\\times10=6\\pi=2\\pi\\times3$. The phase therefore changes by three full turns in ten samples.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',w:340,h:140,pad:{l:36,r:14,t:14,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:2.4,width:1.2});
   a.span(0,10,1.2,'N_0=10',{color:C.err,tex:true}); return a.svg();},
  cap:'$\\operatorname{Re}\\{e^{j3\\pi n/5}\\}$ repeats every 10 samples.'},
 {svg:()=>{const a=ax({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',w:340,h:140,pad:{l:36,r:14,t:14,b:26},xtarget:4,ytarget:2});
   a.stem(D(n=>Math.cos(n),-20,20),{color:C.err,r:2.4,width:1.2}); return a.svg();},
  cap:'$\\cos(n)$ has $\\omega_0=1$, so $\\omega_0/2\\pi$ is irrational. The samples never repeat exactly.'}
]},
{t:'box', kind:'warn', html:'<span class="t">Frequencies separated by $2\\pi$ give the same sequence</span>$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$ for every integer $n$. Therefore discrete-time frequencies that differ by $2\\pi$ produce identical samples. This identity makes the discrete-time Fourier transform $2\\pi$-periodic and leads to aliasing.'},

{t:'h2', num:'1.14', text:'A catalogue of common signals'},
{t:'p', text:'A small set of named signals appears again and again in later chapters. This section collects them with their formulas. It introduces no new result. Each one is built from the ideas of this chapter.'},

{t:'h3', text:'Building blocks: step, ramp, sign and exponential'},
{t:'figrow', items:[
 {svg:()=>{const a=cat({xr:[-2,3],yr:[-0.3,1.4],xlabel:'t',ylabel:'u(t)',xstep:1}); a.curve(t=>t<0?0:1,{color:C.in,n:1000}); return a.svg();},
  cap:'Unit step: $u(t)=1$ for $t>0$ and $u(t)=0$ for $t<0$.'},
 {svg:()=>{const a=cat({xr:[-2,3],yr:[-0.3,3.2],xlabel:'t',ylabel:'r(t)',xstep:1}); a.curve(t=>t<0?0:t,{color:C.in}); return a.svg();},
  cap:'Unit ramp: $r(t)=t\\,u(t)$. Its slope is $1$ for $t>0$, so $\\d r/\\d t=u(t)$.'},
 {svg:()=>{const a=cat({xr:[-2,3],yr:[-1.4,1.4],xlabel:'t',ylabel:'\\operatorname{sgn}(t)',xstep:1}); a.curve(t=>t<0?-1:1,{color:C.in,n:1000}); return a.svg();},
  cap:'Sign: $\\operatorname{sgn}(t)=1$ for $t>0$ and $-1$ for $t<0$, so $\\operatorname{sgn}(t)=2u(t)-1$ for $t\\neq0$.'},
 {svg:()=>{const a=cat({xr:[-1,4],yr:[-0.2,1.3],xlabel:'t',ylabel:'x(t)',xstep:1});
   a.curve(t=>t<0?0:Math.exp(-t),{color:C.in,n:1000}); a.curve(t=>t<0?0:Math.exp(-2*t),{color:C.mid,n:1000,dash:'6 4'});
   a.note(1.05,0.52,'e^{-t}u(t)',{tex:true,color:C.in,fs:12}); a.note(2.0,0.3,'e^{-2t}u(t)',{tex:true,color:C.mid,fs:12}); return a.svg();},
  cap:'One-sided exponential: $x(t)=e^{-at}u(t)$ with $a>0$. Its energy is $1/(2a)$. A larger $a$ decays faster.'}
]},
{t:'p', text:'Many signals are sums, shifts and products of these four shapes. A voltage $V$ switched on at $t_0$ is $V\\,u(t-t_0)$. The ramp is the running integral of the step, $r(t)=\\int_{-\\infty}^{t}u(\\tau)\\,\\d\\tau$. The step is the running integral of $\\delta(t)$.'},
{t:'p', text:'The energy of the one-sided exponential follows from the definition of $E_\\infty$. The signal is zero for $t<0$, so the lower limit is $0$:'},
{t:'eq', tex:'E_\\infty=\\int_{0}^{\\infty}\\bigl(e^{-at}\\bigr)^{2}\\,\\d t=\\int_{0}^{\\infty}e^{-2at}\\,\\d t=\\left[-\\frac{e^{-2at}}{2a}\\right]_{0}^{\\infty}=0-\\left(-\\frac{1}{2a}\\right)=\\frac{1}{2a},\\qquad a>0.'},

{t:'h3', text:'Pulses: rectangle, triangle, sinc and Gaussian'},
{t:'figrow', items:[
 {svg:()=>{const a=cat({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'\\operatorname{rect}(t)',xstep:1}); a.curve(rectP,{color:C.in,n:1000}); return a.svg();},
  cap:'Rectangle: $\\operatorname{rect}(t)=1$ for $|t|<\\tfrac12$ and $0$ for $|t|>\\tfrac12$. Energy $1$.'},
 {svg:()=>{const a=cat({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'\\operatorname{tri}(t)',xstep:1}); a.curve(triP,{color:C.in}); return a.svg();},
  cap:'Triangle: $\\operatorname{tri}(t)=1-|t|$ for $|t|\\le1$ and $0$ otherwise. Energy $2/3$.'},
 {svg:()=>{const a=cat({xr:[-5,5],yr:[-0.4,1.2],xlabel:'t',ylabel:'x(t)',xstep:1}); a.curve(sincP,{color:C.in,n:1000}); return a.svg();},
  cap:'$x(t)=\\operatorname{sinc}(\\pi t)$, with the unnormalised $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. Peak $1$ at $t=0$; zeros at $t=\\pm1,\\pm2,\\dots$'},
 {svg:()=>{const a=cat({xr:[-2,2],yr:[-0.3,1.3],xlabel:'t',ylabel:'x(t)',xstep:1}); a.curve(gaussP,{color:C.in}); return a.svg();},
  cap:'Gaussian: $x(t)=e^{-\\pi t^{2}}$. It is smooth everywhere and its area is $1$.'}
]},
{t:'p', text:'The triangle energy shows how to use symmetry in an energy integral. The integrand is even, so integrate over $[0,1]$ and double. Then substitute $s=1-t$, $\\d s=-\\d t$, which maps $t=0\\mapsto s=1$ and $t=1\\mapsto s=0$:'},
{t:'eq', tex:'E_\\infty=\\int_{-1}^{1}(1-|t|)^{2}\\,\\d t=2\\int_{0}^{1}(1-t)^{2}\\,\\d t=2\\int_{0}^{1}s^{2}\\,\\d s=2\\left[\\frac{s^{3}}{3}\\right]_{0}^{1}=\\frac23.'},
{t:'p', text:'A pulse can shape the loudness of a tone: $p(t-t_0)\\cos(2\\pi\\cdot440\\,t)$. The jumps of the rectangle are heard as clicks, while the Gaussian starts and ends softly. The pulses return later. The triangle is the rectangle convolved with itself (Chapter 3). The rectangle and the sinc are a transform pair (Chapter 5).'},

{t:'h3', text:'Periodic waveforms: sine, square, triangle and sawtooth'},
{t:'figrow', items:[
 {svg:()=>{const a=cat({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}); a.curve(t=>Math.sin(2*Math.PI*t),{color:C.in,n:900}); return a.svg();},
  cap:'Sine: $x(t)=A\\sin(2\\pi t/T_0)$. Average power $A^{2}/2$.'},
 {svg:()=>{const a=cat({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}); a.curve(t=>fr(t)<0.5?1:-1,{color:C.in,n:1800}); return a.svg();},
  cap:'Square: $x(t)=A$ for $0\\le t<T_0/2$ and $-A$ for $T_0/2\\le t<T_0$. Average power $A^{2}$.'},
 {svg:()=>{const a=cat({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}); a.curve(t=>1-4*Math.abs(fr(t+0.5)-0.5),{color:C.in,n:900}); return a.svg();},
  cap:'Triangle: $x(t)=A\\,(1-4|t|/T_0)$ for $|t|\\le T_0/2$. Average power $A^{2}/3$.'},
 {svg:()=>{const a=cat({xr:[0,3],yr:[-1.4,1.4],xlabel:'t/T_0',ylabel:'x(t)/A',xstep:1}); a.curve(t=>2*fr(t)-1,{color:C.in,n:1800}); return a.svg();},
  cap:'Sawtooth: $x(t)=A\\,(2t/T_0-1)$ for $0\\le t<T_0$. Average power $A^{2}/3$.'}
]},
{t:'p', text:'For a periodic signal, the average over all time equals the average over one period, $P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}|x(t)|^{2}\\,\\d t$. For the sawtooth, substitute $s=2t/T_0-1$, $\\d t=\\tfrac{T_0}{2}\\d s$, which maps $t=0\\mapsto s=-1$ and $t=T_0\\mapsto s=1$:'},
{t:'eq', tex:'P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}A^{2}\\Bigl(\\frac{2t}{T_0}-1\\Bigr)^{2}\\d t=\\frac{A^{2}}{T_0}\\cdot\\frac{T_0}{2}\\int_{-1}^{1}s^{2}\\,\\d s=\\frac{A^{2}}{2}\\left[\\frac{s^{3}}{3}\\right]_{-1}^{1}=\\frac{A^{2}}{3}.'},
{t:'p', text:'Played with the same period, $T_0=1/220$ s, all four have the same pitch. The shape changes only the colour of the sound, which Chapter 4 explains with harmonics. The triangle and the sawtooth have the same average power, $A^{2}/3$, and still sound different. Power does not fix the shape.'},

{t:'h3', text:'Signals for the ear: chirp, beats, AM and FM'},
{t:'figrow', items:[
 {svg:()=>{const a=cat({xr:[0,6],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1}); a.curve(t=>Math.cos(2*Math.PI*(0.3*t+0.25*t*t)),{color:C.in,n:1600}); return a.svg();},
  cap:'Chirp: $x(t)=\\cos\\bigl(2\\pi(f_0t+\\tfrac{k}{2}t^{2})\\bigr)$. Its frequency $f_0+kt$ rises with time. Drawn with $f_0=0.3$ Hz, $k=0.5$ Hz/s.'},
 {svg:()=>{const a=cat({xr:[0,2],yr:[-2.4,2.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5});
   a.curve(t=>2*Math.cos(Math.PI*t),{color:C.muted,dash:'4 4'}); a.curve(t=>-2*Math.cos(Math.PI*t),{color:C.muted,dash:'4 4'});
   a.curve(t=>Math.cos(2*Math.PI*10*t)+Math.cos(2*Math.PI*11*t),{color:C.in,n:1600}); return a.svg();},
  cap:'Beats: $\\cos(2\\pi f_1t)+\\cos(2\\pi f_2t)$, drawn with $f_1=10$ Hz, $f_2=11$ Hz. The dashed envelope is $\\pm2\\cos(\\pi(f_1-f_2)t)$.'},
 {svg:()=>{const a=cat({xr:[0,2],yr:[-2.1,2.1],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5});
   const env=t=>1+0.8*Math.cos(2*Math.PI*t);
   a.curve(env,{color:C.muted,dash:'4 4'}); a.curve(t=>-env(t),{color:C.muted,dash:'4 4'});
   a.curve(t=>env(t)*Math.cos(2*Math.PI*12*t),{color:C.in,n:1600}); return a.svg();},
  cap:'AM: $x(t)=\\bigl(1+m\\cos(2\\pi f_mt)\\bigr)\\cos(2\\pi f_ct)$ with $0<m\\le1$. The dashed envelope is $\\pm\\bigl(1+m\\cos(2\\pi f_mt)\\bigr)$.'},
 {svg:()=>{const a=cat({xr:[0,2],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5}); a.curve(t=>Math.cos(2*Math.PI*10*t+5*Math.sin(2*Math.PI*t)),{color:C.in,n:1600}); return a.svg();},
  cap:'FM: $x(t)=\\cos\\bigl(2\\pi f_ct+\\beta\\sin(2\\pi f_mt)\\bigr)$. Drawn with $f_c=10$ Hz, $f_m=1$ Hz, $\\beta=5$.'}
]},
{t:'p', text:'Beats come from the sum-to-product identity $\\cos\\theta_1+\\cos\\theta_2=2\\cos\\bigl(\\tfrac{\\theta_1-\\theta_2}{2}\\bigr)\\cos\\bigl(\\tfrac{\\theta_1+\\theta_2}{2}\\bigr)$. With $\\theta_i=2\\pi f_it$ it gives'},
{t:'eq', tex:'\\cos(2\\pi f_1t)+\\cos(2\\pi f_2t)=2\\cos\\bigl(\\pi(f_1-f_2)t\\bigr)\\cos\\bigl(\\pi(f_1+f_2)t\\bigr).'},
{t:'p', text:'The slow factor sets the loudness, which peaks $|f_1-f_2|$ times a second. Two strings a few hertz apart beat. A musician turns the peg until the beats slow down and stop, which means $f_1=f_2$.'},
{t:'p', text:'The frequency of a signal $\\cos\\phi(t)$ at time $t$ is $\\frac{1}{2\\pi}\\frac{\\d\\phi}{\\d t}$. For the chirp this is $f_0+kt$. For FM it is $f_c+\\beta f_m\\cos(2\\pi f_mt)$: the amplitude stays fixed and the frequency swings about $f_c$. A chirp sweeps its frequency, as a bird call or a radar pulse does. Beats and AM keep the tone and move its loudness.'},

{t:'h3', text:'Random signals: noise, a noisy tone, a random walk and a telegraph signal'},
{t:'figrow', items:[
 {svg:()=>{const a=cat({xr:[0,40],yr:[-1.2,1.2],xlabel:'n',ylabel:'w[n]',xstep:10}); a.stem(D(hiss,0,40),{color:C.mid,r:2.2,width:1.1}); return a.svg();},
  cap:'White noise $w[n]$: the samples are independent, with zero mean and the same variance. No sample predicts the next one.'},
 {svg:()=>{const a=cat({xr:[0,3],yr:[-1.8,1.8],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1});
   a.curve(t=>Math.cos(2*Math.PI*t),{color:C.muted,dash:'4 4'});
   a.curve(t=>Math.cos(2*Math.PI*t)+0.35*hiss(Math.floor(60*t)),{color:C.in,n:1800}); return a.svg();},
  cap:'Signal plus noise: $x(t)=\\cos(2\\pi f_0t)+\\sigma\\,w(t)$. The dashed curve is the tone alone.'},
 {svg:()=>{const w=[0]; for(let i=1;i<=60;i++) w.push(w[i-1]+hiss(i+5000));
   const a=cat({xr:[0,60],yr:[-6,6],xlabel:'n',ylabel:'x[n]',xstep:20}); a.stem(w.map((v,n)=>[n,v]),{color:C.mid,r:1.8,width:1.1}); return a.svg();},
  cap:'Random walk: $x[n]=x[n-1]+w[n]$ with $x[0]=0$. Each step is random, but the sum wanders far from zero.'},
 {svg:()=>{const T=[]; let t=0,i=0; while(t<4){ const u=(hiss(9000+i++)+1)/2; t+=-Math.log(Math.max(u,1e-9))/2.5; T.push(t); }
   const tel=t0=>{let c=0; while(c<T.length&&T[c]<=t0) c++; return c%2?-1:1;};
   const a=cat({xr:[0,4],yr:[-1.5,1.5],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:1}); a.curve(tel,{color:C.in,n:2000}); return a.svg();},
  cap:'Random telegraph: $x(t)$ is $+1$ or $-1$ and flips sign at random times. Only the times of the flips are random.'}
]},
{t:'p', text:'A random signal has a rule for how it is made, not a formula for each value. Run the rule again and the waveform changes, but its average behaviour does not. A measured signal almost always contains some noise. Heard as sound, white noise is a hiss, the random walk is a low rumble because it changes slowly, and the telegraph signal crackles.'},

{t:'h2', num:'1.15', text:'Chapter summary'},
{t:'ol', items:[
 '$E_\\infty$ and $P_\\infty$ are limits. Finite energy forces zero average power. Finite non-zero average power forces infinite energy. Unbounded growth gives neither.',
 'To build $x(at-b)$, shift by $b$ first, then scale by $a$. The other order gives $x(at-ab)$.',
 '$T_0$ and $N_0$ are the smallest positive periods, and $\\omega_0=2\\pi/T_0=2\\pi/N_0$.',
 '$\\delta[n]$ is an ordinary sequence. $\\delta(t)$ is a distribution defined by sifting.',
 'Every signal is a sum of weighted, shifted impulses: $x[n]=\\sum_k x[k]\\delta[n-k]$.',
 'Every signal splits in one way into an even and an odd part: $\\Ev\\{x(t)\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x(t)\\}=\\tfrac12[x(t)-x(-t)]$. The odd part is $0$ at $t=0$.',
 '$\\delta[n]=u[n]-u[n-1]$ and $u[n]=\\sum_{k=-\\infty}^{n}\\delta[k]$: a first difference and a running sum.',
 'Sifting, $\\int x(t)\\,\\delta(t-t_0)\\,\\d t=x(t_0)$, gives a <b>number</b>. Sampling, $x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)$, gives a <b>signal</b>.',
 'In $e^{(r+j\\omega_0)t}$, $r$ sets the envelope $e^{rt}$ and $\\omega_0$ sets the oscillation. In discrete time $|\\alpha|$ plays the role of the envelope, with the boundary at $|\\alpha|=1$.',
 'A discrete-time exponential is periodic only when $\\omega_0/2\\pi$ is rational. A continuous-time one always is.',
 '$e^{j\\omega_0 n}$ and $e^{j(\\omega_0+2\\pi)n}$ are the same sequence, so discrete-time frequencies repeat every $2\\pi$.'
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
