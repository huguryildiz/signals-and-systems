/* Course notes — front matter and Chapter 1 */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));
/* a figure in a row of two, and a figure in a row of three */
const two=o=>ax(Object.assign({w:340,h:150,pad:{l:40,r:16,t:14,b:28},xtarget:4,ytarget:2},o));
const tri3=o=>ax(Object.assign({w:230,h:130,pad:{l:32,r:12,t:12,b:24},xtarget:3,ytarget:2},o));
/* the catalogue of common signals (section 1.7): small 2 x 2 figures */
const cat=o=>ax(Object.assign({w:340,h:150,pad:{l:40,r:16,t:14,b:28},ytarget:2},o));
const rectP=t=>Math.abs(t)<0.5?1:0, triP=t=>Math.max(0,1-Math.abs(t)),
      sincP=t=>t===0?1:Math.sin(Math.PI*t)/(Math.PI*t), gaussP=t=>Math.exp(-Math.PI*t*t);
const fr=t=>t-Math.floor(t);
/* a fixed pseudo-random sequence in [-1,1], so every build draws the same noise */
const hiss=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453; return 2*(s-Math.floor(s))-1;};
/* the unit circle with the N terms e^{j k 2 pi n / N}, n = 0..N-1, for the harmonic sum */
const circleTerms=(k,N,cap)=>({svg:()=>{
  const a=two({w:340,h:180,xr:[-2.98,2.98],yr:[-1.45,1.45],xlabel:'\\operatorname{Re}',ylabel:'\\operatorname{Im}',xtarget:5,ytarget:3,
    xtickfmt:()=>'',ytickfmt:()=>''});
  const c=[]; for(let i=0;i<=120;i++){ const p=2*Math.PI*i/120; c.push([Math.cos(p),Math.sin(p)]); }
  a.poly(c,{color:C.muted,width:1.1,dash:'4 5'});
  for(let n=0;n<N;n++){ const p=2*Math.PI*k*n/N, X=Math.cos(p), Y=Math.sin(p);
    a.poly([[0,0],[X,Y]],{color:C.in,width:1.6}); a.point(X,Y,{color:C.in}); }
  a.point(0,0,{color:C.coral});
  return a.svg();}, cap});

window.C1 = [

/* ---------------- cover and contents ---------------- */
{t:'cover', kicker:'Signals and Systems', text:'Signals, Systems and<br>Frequency-Domain Analysis',
 sub:'Lecture Notes', foot:'Chapters 1&ndash;7 &middot; Appendix A'},
{t:'page'},

{t:'h1', text:'Contents', rule:false},
{t:'toc', items:[
 ['1','Signals','Notation. Energy and power. Shifting, reversal and scaling. Periodicity, even and odd parts. Impulses and steps. Complex exponentials and geometric sums. A catalogue of common signals.','OW CH1.1&ndash;1.4'],
 ['2','Systems and their properties','The input&ndash;output abstraction and interconnections. Memory, invertibility, causality, stability, time invariance, linearity. Classification.','OW CH1.5&ndash;1.6'],
 ['3','Linear time-invariant systems','Impulse response. Convolution sum and convolution integral. Properties of convolution. Step response. Difference and differential equations.','OW CH2.1&ndash;2.5'],
 ['4','Fourier series','The eigenfunction property. Synthesis and analysis. Series worked out. The discrete-time series. Properties. A periodic input through an LTI system: ideal, shaping and recursive filters.','OW CH3.1&ndash;3.11'],
 ['5','The continuous-time Fourier transform','From series to transform. The standard pairs. Periodic signals. Properties, with proofs. Convolution and multiplication. Systems from a differential equation.','OW CH4.1&ndash;4.7'],
 ['6','The discrete-time Fourier transform','The transform built from the series. Why the spectrum repeats. The DFT and zero padding. Standard pairs and periodic sequences. Every property with its proof. Periodic convolution, windows and the spectrogram. Difference equations and echoes.','OW CH5.1&ndash;5.8'],
 ['7','Sampling and aliasing','The sampler and the sampled spectrum. Aliasing and the sampling theorem, with band-pass sampling. Reconstruction: interpolation and the two holds. Aliasing in practice. Discrete-time processing of continuous-time signals. Decimation and interpolation.','OW CH7.1&ndash;7.5'],
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
{t:'p', lead:true, text:'A signal represents information as a function. This chapter fixes the notation for continuous-time and discrete-time signals. It then shows how to calculate energy and power, change the time axis, test periodicity and symmetry, and use impulses and complex exponentials. It ends with a catalogue of common signals.'},

/* ---------- 1.1 ---------- */
{t:'h2', num:'1.1', text:'Definitions and notation'},
{t:'p', text:'A signal is a physical quantity that varies and carries information. Mathematically, it is a function of one or more independent variables.'},
{t:'p', text:'The independent variable in this course is usually time. An image instead uses two space variables. The same signal operations apply to those variables.'},
{t:'p', text:'Continuous-time and discrete-time signals use different domains. Keep their notation separate.'},
{t:'eqbox', cap:'Continuous time', tex:'x(t),\\qquad \\forall t\\in\\mathbb{R}',
 after:'Round brackets. The signal has a value at every real instant.'},
{t:'eqbox', cap:'Discrete time', tex:'x[n],\\qquad \\forall n\\in\\mathbb{Z}',
 after:'Square brackets. The signal has a value only at integer indices. Here $n$ is an integer <b>index</b>, not a time in seconds.'},
{t:'figrow', items:[
 {svg:()=>{const a=two({xr:[0,20],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>Math.cos(t),{color:C.in}); return a.svg();},
  cap:'The continuous-time signal $x(t)=\\cos(t)$ is drawn as an unbroken curve. It has a value at every real $t$.'},
 {svg:()=>{const a=two({xr:[0,20],yr:[-1.35,1.35],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>Math.cos(n),0,20),{color:C.mid,r:3}); return a.svg();},
  cap:'The discrete-time signal $x[n]=\\cos(n)$ is drawn with stems. The dots are the signal values. A curve drawn through the dots is a different signal, a continuous-time one. Chapter 7 gives the conditions under which the samples fix that curve uniquely.'}
]},
{t:'p', text:'Two short cases show what the brackets mean. For $x(t)=\\cos(\\pi t)$, the value at $t=0.5$ exists: $x(0.5)=\\cos(\\pi/2)=0$. For $x[n]=n^{2}$, there is no value at $n=1.5$, because $1.5$ is not an integer. The sequence has the value $x[1]=1$ at $n=1$ and the value $x[2]=4$ at $n=2$, and nothing between them.'},
{t:'box', kind:'err', html:'<span class="t">The brackets state the domain</span>Writing $x[t]$ or $x(n)$ states the wrong domain. The domain determines the periodicity test, the convolution limits and the transform properties.'},

/* ---------- 1.2 ---------- */
{t:'h2', num:'1.2', text:'Energy and power'},
{t:'h3', text:'From circuit power to signal power'},
{t:'p', text:'Signal energy and power come from circuit power. Let $v(t)$ be the voltage across a resistance $R$. The current is $i(t)=v(t)/R$ by Ohm\'s law, so the instantaneous power is'},
{t:'eq', tex:'\\begin{aligned}p(t)&=v(t)\\,i(t)\\\\&=v(t)\\left(\\frac{v(t)}{R}\\right)\\\\&=\\frac{1}{R}\\,v^{2}(t).\\end{aligned}'},
{t:'p', text:'Power is measured in watts. For example, a constant voltage $v(t)=2$ V across $R=4\\ \\Omega$ gives $p(t)=v^{2}/R=4/4=1$ W at every instant.'},
{t:'p', text:'Energy is power times time when the power is constant. The power of a signal varies, so integrate it over the time interval instead. The energy is the area under the power curve:'},
{t:'eq', tex:'E=\\int_{t_1}^{t_2}p(t)\\,\\d t=\\int_{t_1}^{t_2}\\frac{1}{R}v^{2}(t)\\,\\d t.'},
{t:'p', text:'From this point onward, set $R=1\\ \\Omega$ and use $|x(t)|^{2}$ as the power. This is the normalised convention. Restore the factor $1/R$ when a physical calculation uses a different resistance.'},
{t:'p', text:'We use the modulus because a signal may be complex valued. The product $|x(t)|^{2}=x(t)\\,x^{*}(t)$ is real and never negative. Writing $x^{2}(t)$ instead is correct only for real signals.'},

{t:'h3', text:'Total energy'},
{t:'eqbox', cap:'Total energy over all time',
 tex:['E_\\infty\\triangleq\\lim_{T\\to\\infty}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t',
      'E_\\infty\\triangleq\\lim_{N\\to\\infty}\\sum_{n=-N}^{N}|x[n]|^{2}=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}'],
 after:'The window is symmetric, $-T$ to $T$ or $-N$ to $N$, so a two-sided signal is counted on both sides. Average power uses the same window.'},
{t:'p', text:'For example, let $x[n]=1$ for $n=0,1,2$ and $x[n]=0$ elsewhere. Only three terms of the sum are non-zero, so $E_\\infty=|1|^{2}+|1|^{2}+|1|^{2}=3$.'},
{t:'figrow', items:[
 {svg:()=>{const a=ax({xr:[-6,6],yr:[-0.1,1.15],xlabel:'t',ylabel:'|x(t)|^{2}',w:340,h:150,pad:{l:44,r:16,t:14,b:28},xtarget:5,ytarget:2});
   a.area(t=>Math.exp(-Math.abs(t)),-4,4,{color:'rgba(20,112,127,.16)'});
   a.curve(t=>Math.exp(-Math.abs(t)),{color:C.in}); a.vline(-4,{color:C.err}); a.vline(4,{color:C.err}); return a.svg();},
  cap:'<b>Converging.</b> As the window $[-T,T]$ grows, the shaded area approaches a finite limit. The tails add less and less.'},
 {svg:()=>{const a=ax({xr:[-6,6],yr:[-1.35,1.35],xlabel:'t',ylabel:'x(t)',w:340,h:150,pad:{l:44,r:16,t:14,b:28},xtarget:5,ytarget:2});
   a.area(t=>Math.pow(Math.cos(2*t),2),-4,4,{color:'rgba(152,53,39,.14)'});
   a.curve(t=>Math.cos(2*t),{color:C.err}); a.vline(-4,{color:C.err}); a.vline(4,{color:C.err}); return a.svg();},
  cap:'<b>Diverging.</b> For $x(t)=\\cos(2t)$ every period adds the same area $\\cos^{2}(2t)$, so $E_\\infty\\to\\infty$.'}
]},

{t:'h3', text:'When total energy diverges'},
{t:'p', text:'The integral or the sum may not converge. Then the signal has no finite total energy. To see this, compute the energy $E_T$ in the finite window $[-T,T]$ first, and take the limit last.'},
{t:'p', text:'For $x(t)=\\cos(2t)$, use the identity $\\cos^{2}\\theta=\\tfrac12(1+\\cos2\\theta)$ with $\\theta=2t$. Then integrate each term and evaluate at the limits:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}\\cos^{2}(2t)\\,\\d t\\\\&=\\int_{-T}^{T}\\frac{1+\\cos(4t)}{2}\\,\\d t\\\\&=\\left[\\frac{t}{2}+\\frac{\\sin(4t)}{8}\\right]_{-T}^{T}\\\\&=\\left(\\frac{T}{2}+\\frac{\\sin(4T)}{8}\\right)-\\left(-\\frac{T}{2}-\\frac{\\sin(4T)}{8}\\right)\\\\&=T+\\frac{\\sin(4T)}{4}.\\end{aligned}'},
{t:'p', text:'The fourth line uses $\\sin(-4T)=-\\sin(4T)$. The sine term stays between $-1/4$ and $1/4$, while $T$ grows without limit. So $E_\\infty\\to\\infty$. A constant does the same: for $x(t)=2$, $E_T=\\int_{-T}^{T}2^{2}\\,\\d t=4\\cdot2T=8T$, which also grows without limit.'},
{t:'p', text:'Such a signal still carries a finite amount of energy per unit of time. Average power measures that amount.'},

{t:'h3', text:'Average power'},
{t:'p', text:'Average power is energy per unit time. Over a finite interval $[t_1,t_2]$, divide the energy by the length of the interval:'},
{t:'eq', tex:'P=\\frac{1}{t_2-t_1}\\int_{t_1}^{t_2}p(t)\\,\\d t.'},
{t:'p', text:'For the average over all time, use the symmetric window $[-T,T]$ of length $2T$, as for the energy. Then let the window grow.'},
{t:'eqbox', cap:'Average power over all time',
 tex:['P_\\infty\\triangleq\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t',
      'P_\\infty\\triangleq\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}'],
 after:'In discrete time the divisor is $2N+1$, because that is the number of samples from $-N$ to $N$ with both ends included. A divisor of $2N$ gives the same limit, but the wrong value at a finite $N$.'},
{t:'p', text:'For example, $x[n]=(-1)^{n}$ has $|x[n]|^{2}=1$ at every $n$. The window from $-N$ to $N$ then holds energy $2N+1$, so $P_\\infty=\\lim_{N\\to\\infty}(2N+1)/(2N+1)=1$.'},
{t:'p', text:'For $x(t)=\\cos(2t)$, divide the window energy found above by the window length $2T$:'},
{t:'eq', tex:'\\begin{aligned}P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}\\\\&=\\lim_{T\\to\\infty}\\frac{T+\\sin(4T)/4}{2T}\\\\&=\\lim_{T\\to\\infty}\\left(\\frac12+\\frac{\\sin(4T)}{8T}\\right)\\\\&=\\frac12.\\end{aligned}'},
{t:'p', text:'The last step uses $|\\sin(4T)/(8T)|\\le1/(8T)$, which tends to $0$.'},
{t:'box', kind:'warn', html:'<span class="t">Take the limit of the ratio</span>Calculate the energy-to-duration ratio for each finite window first. Then take the limit. The ratio may approach any non-negative value, including zero.'},
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
{t:'p', text:'The two limits in the figure follow from the definition. For the single pulse and every $T\\ge1/2$, the window holds the whole pulse, so $E_T=1$ and $P_T=1/(2T)\\to0$. For the square wave, take the windows with $T=2k+\\tfrac12$, where $k$ is a positive integer. Such a window holds the $2k+1$ whole pulses centred at $0,\\pm2,\\dots,\\pm2k$, each of energy $1$:'},
{t:'eq', tex:'P_T=\\frac{E_T}{2T}=\\frac{2k+1}{2\\bigl(2k+\\tfrac12\\bigr)}=\\frac{2k+1}{4k+1}\\;\\longrightarrow\\;\\frac12\\quad\\text{as }k\\to\\infty.'},

{t:'h3', text:'Energy signals, power signals, and neither'},
{t:'table', cap:'Energy signals, power signals, and signals that are neither.', head:['Type','Condition','Typical signals'], rows:[
 ['Energy signal','$E_\\infty<\\infty$, and then $P_\\infty=0$','Finite pulses and decaying responses'],
 ['Power signal','$0<P_\\infty<\\infty$, and then $E_\\infty\\to\\infty$','Constants, sinusoids and other continuing signals'],
 ['Neither','$E_\\infty\\to\\infty$ and $P_\\infty\\to\\infty$','Signals that grow without bound, such as $t\\,u(t)$']
]},
{t:'p', text:'The two energy-signal conditions are not independent. If $E_\\infty$ is finite, the energy in every finite window is at most $E_\\infty$. Dividing this bound by $2T$ makes $P_\\infty$ approach zero. The power condition follows from the energy condition:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\le E_\\infty\\\\0\\le P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}\\le\\lim_{T\\to\\infty}\\frac{E_\\infty}{2T}=0\\\\\\therefore\\quad P_\\infty&=0.\\end{aligned}'},
{t:'p', text:'In the same way, a finite non-zero $P_\\infty$ forces $E_T\\approx2T\\,P_\\infty$ for large $T$, so the energy of a power signal diverges.'},
{t:'p', text:'The constant $x(t)=1$ is the simplest power signal. The energy in the window grows with the window, but the window length cancels in the average:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{-T}^{T}1^{2}\\,\\d t=2T\\;\\to\\;\\infty,\\\\P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}=\\lim_{T\\to\\infty}\\frac{2T}{2T}=1.\\end{aligned}'},
{t:'p', text:'A constant of another amplitude works the same way. For $x(t)=3$, $|x(t)|^{2}=9$, so $E_T=18T$ and $P_\\infty=18T/(2T)=9$.'},
{t:'p', text:'The ramp $x(t)=t$ for $t\\ge0$, and $x(t)=0$ for $t<0$, is in neither class. The lower limit of the energy integral is $0$ because the ramp is zero for $t<0$:'},
{t:'eq', tex:'\\begin{aligned}E_T&=\\int_{0}^{T}t^{2}\\,\\d t=\\left[\\frac{t^{3}}{3}\\right]_{0}^{T}=\\frac{T^{3}}{3}\\;\\to\\;\\infty,\\\\P_\\infty&=\\lim_{T\\to\\infty}\\frac{E_T}{2T}=\\lim_{T\\to\\infty}\\frac{T^{3}/3}{2T}=\\lim_{T\\to\\infty}\\frac{T^{2}}{6}=\\infty.\\end{aligned}'},
{t:'p', text:'The exponential $x(t)=e^{t}$ is also in neither class. Here $|x(t)|^{2}=e^{2t}$, and'},
{t:'eq', tex:'E_T=\\int_{-T}^{T}e^{2t}\\,\\d t=\\left[\\frac{e^{2t}}{2}\\right]_{-T}^{T}=\\frac{e^{2T}-e^{-2T}}{2}\\;\\to\\;\\infty,\\qquad P_\\infty=\\lim_{T\\to\\infty}\\frac{e^{2T}-e^{-2T}}{4T}=\\infty.'},
{t:'p', text:'Both limits diverge. Compute both before you assign a class.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=tri3({xr:[-2,3],yr:[-0.3,1.4],xlabel:'t'});
   a.area(t=>(t>=0&&t<=1)?1:0,0,1,{color:'rgba(74,122,70,.18)'});
   a.curve(t=>(t>=0&&t<=1)?1:0,{color:C.out}); return a.svg();},
  cap:'Energy signal: $E_\\infty=1$, $P_\\infty=0$.'},
 {svg:()=>{const a=tri3({xr:[-3,3],yr:[-0.3,1.4],xlabel:'t'});
   a.curve(t=>1,{color:C.h}); return a.svg();},
  cap:'Power signal: $E_\\infty\\to\\infty$, $P_\\infty=1$.'},
 {svg:()=>{const a=tri3({xr:[-2,4],yr:[-0.4,4.4],xlabel:'t'});
   a.curve(t=>t>=0?t:0,{color:C.err}); return a.svg();},
  cap:'Neither: both limits diverge.'}
]},

{t:'ex', hd:'Example 1.1', rows:[
 ['Given','$x(t)=1$ for $0\\le t\\le1$, and $x(t)=0$ otherwise.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','Find $E_\\infty$ first because finite energy implies zero average power. This result then determines the class.'],
 ['Solution','Start with the definitions and then use the support of the signal: $$\\begin{aligned}E_\\infty&=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\,\\d t\\\\&=\\int_{0}^{1}1^{2}\\,\\d t\\\\&=\\left.t\\right|_{0}^{1}=1<\\infty.\\end{aligned}$$ For every $T\\ge1$, the window contains the whole pulse. Therefore $$\\begin{aligned}P_\\infty&=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\frac{1}{2T}\\int_{0}^{1}1\\,\\d t\\\\&=\\lim_{T\\to\\infty}\\frac{1}{2T}=0.\\end{aligned}$$ So $x(t)$ is an <b>energy signal</b>, with $E_\\infty=1$ J and $P_\\infty=0$ W. It is not a power signal.'],
 ['Check','Halving the amplitude must divide the energy by four. Direct calculation gives $\\int_0^1(1/2)^2\\,\\d t=\\left.t/4\\right|_{0}^{1}=1/4$, so the result has the required quadratic dependence on amplitude.']
]},

{t:'ex', hd:'Example 1.2', rows:[
 ['Given','$x[n]=4$ for every integer $n$.'],
 ['Find','Is this an energy signal or a power signal?'],
 ['Method','Each sample contributes the same positive energy, so $E_\\infty$ diverges. Infinite energy does not decide the class. Calculate $P_\\infty$ next and use the exact count $2N+1$.'],
 ['Solution','Each sample contributes $|4|^{2}=16$, so $$\\begin{aligned}E_\\infty&=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}|4|^{2}\\\\&=\\sum_{n=-\\infty}^{\\infty}16\\to\\infty.\\end{aligned}$$ The finite window from $-N$ to $N$ contains $2N+1$ samples. Hence $$\\begin{aligned}P_\\infty&=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}\\\\&=\\lim_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}16\\\\&=\\lim_{N\\to\\infty}\\frac{(2N+1)16}{2N+1}\\\\&=\\lim_{N\\to\\infty}16=16.\\end{aligned}$$ So $x[n]$ is a <b>power signal</b>, with $P_\\infty=16$.'],
 ['Check','A constant of amplitude $A$ must have $P_\\infty=A^{2}$, and here $4^{2}=16$. The factor $2N+1$ cancels exactly, which confirms the sample count was right.']
]},
{t:'box', kind:'err', html:'<span class="t">Do not infer power from energy alone</span>Infinite energy does not imply infinite average power. For the constant sequence, both the energy sum and the sample count grow at the same rate. Their ratio approaches 16.'},
{t:'p', text:'A capacitor that discharges from 5 V is an everyday energy signal: $v(t)=5e^{-t/\\tau}$ for $t\\ge0$ and $v(t)=0$ for $t<0$, with time constant $\\tau>0$. The signal is zero for $t<0$, so the energy integral starts at $0$:'},
{t:'eq', tex:'\\begin{aligned}E_\\infty&=\\int_{0}^{\\infty}\\bigl(5e^{-t/\\tau}\\bigr)^{2}\\,\\d t=\\int_{0}^{\\infty}25\\,e^{-2t/\\tau}\\,\\d t\\\\&=25\\left[-\\frac{\\tau}{2}e^{-2t/\\tau}\\right]_{0}^{\\infty}=25\\left(0+\\frac{\\tau}{2}\\right)=\\frac{25\\tau}{2}.\\end{aligned}'},
{t:'p', text:'The mains voltage, $325\\cos(2\\pi\\,50\\,t)$ V, never stops. Each period adds the same energy, so it is a power signal. A hand clap and the rainfall of one storm end, so they are energy signals.'},

/* ---------- 1.3 ---------- */
{t:'h2', num:'1.3', text:'Signal operations'},
{t:'p', text:'This section changes the time axis of a signal in three ways: a shift, a reversal and a scaling. Each one changes the argument of $x$. None of them changes the height of the signal.'},
{t:'h3', text:'Time shifting'},
{t:'eqbox', cap:'Time shift', tex:'x(t)\\;\\longrightarrow\\;x(t-t_0)',
 after:'If $t_0>0$ the signal is <b>delayed</b> and moves right. If $t_0<0$ it is <b>advanced</b> and moves left.'},
{t:'p', text:'Read the argument before moving the graph. At time $t$, the shifted signal uses the original value at $t-t_0$. For $t_0>0$, it reaches each original value $t_0$ seconds later. The graph therefore moves right. For example, $x(t+2)$ is $x(t-t_0)$ with $t_0=-2$, so its graph is the graph of $x(t)$ moved 2 to the left.'},
{t:'fig', svg:()=>{const tri=t=>Math.abs(t)<=1?1-Math.abs(t):0;
  const a=ax({xr:[-5,5],yr:[-0.35,1.55],xlabel:'t',ylabel:'x',w:700,h:190,xtarget:11,ytarget:2});
  a.curve(t=>tri(t+3),{color:C.out}); a.curve(tri,{color:C.ink}); a.curve(t=>tri(t-3),{color:C.in});
  a.note(-3,1.1,'x(t+3)',{anchor:'middle',color:C.out,fs:13,tex:true});
  a.note(0,1.1,'x(t)',{anchor:'middle',color:C.ink,fs:13,tex:true});
  a.note(3,1.1,'x(t-3)',{anchor:'middle',color:C.in,fs:13,tex:true});
  a.span(-3,0,1.42,'advance by 3 s',{color:C.out}); a.span(0,3,1.42,'delay by 3 s',{color:C.in});
  return a.svg();},
 cap:'A time shift changes the signal position but not its shape.'},
{t:'p', text:'For example, a radar sends a pulse $x(t)$ and the echo returns $0.2$ ms later. With $t$ in ms, the echo is $x(t-0.2)$. It arrives later, so it is a delay with $t_0=0.2>0$. Thunder is the same: from a strike 1 km away it arrives about 3 s after the flash, so the sound we hear is $x(t-3)$.'},
{t:'eqbox', cap:'Time shift in discrete time', tex:'x[n]\\;\\longrightarrow\\;x[n-n_0],\\qquad n_0\\in\\mathbb{Z}',
 after:'The sign rule is the same as in continuous time. If $n_0>0$ the stems move right. If $n_0<0$ they move left.'},
{t:'p', text:'Every sample moves by the same whole number of steps. The shift must be an integer because a sequence has values only at integer indices. The expression $x[n-\\tfrac12]$ is therefore not defined.'},
{t:'p', text:'Read a shifted sequence one sample at a time. Let $x[n]=1-n/4$ for $n=0,1,2,3$ and $x[n]=0$ elsewhere, and let $y[n]=x[n-2]$. Then $y[3]=x[3-2]=x[1]=1-\\tfrac14=0.75$.'},
{t:'figrow', items:[
 {svg:()=>{const x=n=>n>=0&&n<=3?1-n/4:0;
   const a=two({xr:[-2.5,6.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'x[n]',xtarget:9});
   a.stem(D(x,-2,6),{color:C.ink}); return a.svg();},
  cap:'$x[n]=1-n/4$ for $n=0,1,2,3$.'},
 {svg:()=>{const x=n=>n>=0&&n<=3?1-n/4:0;
   const a=two({xr:[-2.5,6.5],yr:[-0.2,1.3],xlabel:'n',ylabel:'y[n]',xtarget:9});
   a.stem(D(n=>x(n-2),-2,6),{color:C.mid}); return a.svg();},
  cap:'$y[n]=x[n-2]$: every stem moves two samples right. The sample $x[1]=0.75$ appears at $n=3$.'}
]},
{t:'p', text:'A one-sample delay, $x[n-1]$, is the basic memory element of every difference equation in Chapter 3.'},

{t:'h3', text:'Time reversal'},
{t:'eqbox', cap:'Time reversal', tex:'x(t)\\;\\longrightarrow\\;x(-t)\\qquad\\bigl(x[n]\\to x[-n]\\bigr)',
 after:'Reflect the signal about the vertical axis. The value at time $t$ moves to time $-t$.'},
{t:'p', text:'Find the new support from the argument. Let $x$ be non-zero only on $[\\alpha,\\beta]$. Then $x(-t)$ is non-zero only where $-t$ lies in $[\\alpha,\\beta]$. Multiply each inequality by $-1$. A negative multiplier reverses both inequalities:'},
{t:'eq', tex:'\\alpha\\le -t\\le\\beta\\;\\Longleftrightarrow\\;-\\beta\\le t\\le-\\alpha.'},
{t:'p', text:'So $x(-t)$ is non-zero on $[-\\beta,-\\alpha]$, and the width $\\beta-\\alpha$ does not change. A pulse on $[1,3]$ moves to $[-3,-1]$ and keeps width 2. A signal that is non-zero only on $[-1,4]$ becomes non-zero only on $[-4,1]$.'},
{t:'fig', svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;
  const a=ax({xr:[-4.5,4.5],yr:[-0.3,1.5],xlabel:'t',ylabel:'x',w:700,h:170,xtarget:10,ytarget:2});
  a.curve(t=>r(-t),{color:C.mid,n:1200}); a.curve(r,{color:C.ink,n:1200});
  a.note(2,1.22,'x(t)',{anchor:'middle',color:C.ink,fs:13,tex:true});
  a.note(-2,1.22,'x(-t)',{anchor:'middle',color:C.mid,fs:13,tex:true});
  return a.svg();},
 cap:'Reversal moves the pulse on $[1,3]$ to $[-3,-1]$. The shape is kept; only the order in time changes.'},
{t:'p', text:'This pulse has the same shape forwards and backwards, so reversal only moves it. A signal that is not symmetric in time changes more. A plucked guitar string at 220 Hz starts loud and dies away:'},
{t:'eq', tex:'x(t)=e^{-4t}\\Bigl[\\sin(2\\pi\\,220\\,t)+\\tfrac12\\sin(2\\pi\\,440\\,t)+\\tfrac14\\sin(2\\pi\\,660\\,t)\\Bigr],\\qquad t\\ge0,'},
{t:'p', text:'and $x(t)=0$ for $t<0$. Played backwards, $x(-t)$ is also loudest at $t=0$. It grows towards that instant and then stops at once. A steady tone does not change under reversal, because the cosine is even: $\\cos(-2\\pi\\,440\\,t)=\\cos(2\\pi\\,440\\,t)$.'},

{t:'h3', text:'Time scaling'},
{t:'eqbox', cap:'Time scaling', tex:'y(t)=x(at),\\qquad a>0',
 after:'If $a>1$ the signal is compressed and speeded up. If $0<a<1$ it is stretched and slowed down. The height does not change.'},
{t:'p', text:'Write the scaled signal as a new signal $y(t)$. Writing $x(t)=x(at)$ would force $a=1$.'},
{t:'p', text:'Find the new support by solving $at\\in[\\alpha,\\beta]$. Dividing by $a>0$ keeps the direction of both inequalities:'},
{t:'eq', tex:'\\begin{aligned}at&\\in[\\alpha,\\beta]\\\\\\alpha&\\le at\\le\\beta\\\\\\frac{\\alpha}{a}&\\le t\\le\\frac{\\beta}{a}.\\end{aligned}'},
{t:'p', text:'So $x(at)$ is non-zero only on $[\\alpha/a,\\beta/a]$, and the width is divided by $a$. For example, if $x(t)$ is non-zero only on $[2,6]$, then $y(t)=x(2t)$ needs $2\\le2t\\le6$, that is $1\\le t\\le3$. The width falls from 4 to 2.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=tri3({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',h:120});
   a.curve(r,{color:C.ink}); a.note(2,1.1,'x(t)',{anchor:'middle',color:C.ink,fs:11,tex:true}); return a.svg();},
  cap:'Original: support $[1,3]$.'},
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=tri3({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',h:120});
   a.curve(t=>r(2*t),{color:C.mid}); a.note(1,1.1,'x(2t)',{anchor:'middle',color:C.mid,fs:11,tex:true}); return a.svg();},
  cap:'Compressed: support $[0.5,1.5]$.'},
 {svg:()=>{const r=t=>(t>=1&&t<=3)?1:0;const a=tri3({xr:[-1,7],yr:[-0.2,1.3],xlabel:'t',h:120});
   a.curve(t=>r(0.5*t),{color:C.h}); a.note(4,1.1,'x(0.5t)',{anchor:'middle',color:C.h,fs:11,tex:true}); return a.svg();},
  cap:'Stretched: support $[2,6]$.'}
]},
{t:'p', text:'Time scaling also changes frequency. Substitute $at$ for $t$ in one tone:'},
{t:'eq', tex:'x(t)=\\sin(2\\pi f_0t)\\quad\\Longrightarrow\\quad x(at)=\\sin\\bigl(2\\pi f_0(at)\\bigr)=\\sin\\bigl(2\\pi\\,(af_0)\\,t\\bigr).'},
{t:'p', text:'Every frequency is multiplied by $a$. Take a melody of four plucked notes, where note $k$ starts at $t=0.4k$ s for $k=0,1,2,3$, so the melody lasts 2 s. In $x(at)$, note $k$ starts where $at=0.4k$, that is at $t=0.4k/a$ s. The melody then lasts $2/a$ s, and each pitch is multiplied by $a$. At $a=2$ each frequency doubles, which is one octave up. This is what a voice message sounds like at double speed. At $a=\\tfrac12$, a 440 Hz tone becomes $\\tfrac12\\cdot440=220$ Hz.'},
{t:'box', kind:'err', html:'<span class="t">Discrete-time scaling needs separate rules</span>$x[2n]$ keeps only the even-indexed samples $x[0],x[\\pm2],x[\\pm4],\\dots$ and discards the odd-indexed samples. This operation is decimation, and the lost samples cannot be recovered. A video played at double speed drops frames in the same way. The expression $x[n/2]$ is undefined at odd $n$ unless an interpolation rule supplies those values. Continuous-time scaling does not have this integer-index restriction.'},

{t:'h3', text:'Combining a shift and a scale'},
{t:'p', text:'To construct $x(at-b)$ from $x(t)$, use an intermediate signal so that each operation is explicit.'},
{t:'eqbox', cap:'Shift, then scale', tex:'\\text{(1)}\\quad v(t)=x(t-b)\\qquad\\qquad\\text{(2)}\\quad y(t)=v(at)=x(at-b)',
 after:'Shift by $b$ first. Then scale the result by $a$.'},
{t:'p', text:'Step (2) replaces $t$ by $at$ in $v(t)=x(t-b)$, which gives $v(at)=x(at-b)$. For example, to get $x(2t-4)$, shift $x(t)$ right by 4 and then compress by 2. Shifting by 2 first would give $v(t)=x(t-2)$ and then $v(2t)=x(2t-2)$, which is a different signal.'},
{t:'box', kind:'err', html:'<span class="t">Why the order matters</span>Scaling first gives $w(t)=x(at)$. Shifting that by $b$ gives $w(t-b)=x\\bigl(a(t-b)\\bigr)=x(at-ab)$. Unless $a=1$ this is a different signal: it is shifted by $b$ instead of by $b/a$.'},
{t:'ex', hd:'Example 1.3', rows:[
 ['Given','$x(t)$ is zero for $t<-2$, equal to $1$ on $[-2,0]$, equal to $2$ on $[0,2]$, and falls linearly from $2$ to $0$ on $[2,4]$.'],
 ['Find','Plot $y(t)=x(3t-5)$.'],
 ['Method','Here $a=3$ and $b=5$. Shift right by 5, then compress by 3. Each corner $c$ of $x(t)$ moves to the time $t$ that satisfies $3t-5=c$, and keeps its height.'],
 ['Solution','For the shift, each original corner $c$ moves to $c+5$, so $-2,0,2,4$ become $3,5,7,9$. For the final signal, solve the argument equation for each original corner: $$\\begin{aligned}3t-5&=c\\\\3t&=c+5\\\\t&=\\frac{c+5}{3}.\\end{aligned}$$ Thus $$c=-2,0,2,4\\quad\\Longrightarrow\\quad t=\\frac{3}{3},\\frac{5}{3},\\frac{7}{3},\\frac{9}{3}=1,\\frac53,\\frac73,3.$$ So $y(t)$ is $1$ on $[1,\\tfrac53]$, $2$ on $[\\tfrac53,\\tfrac73]$, falls linearly from $2$ to $0$ on $[\\tfrac73,3]$, and is zero elsewhere.'],
 ['Check','The original support $[-2,4]$ has width 6. Compression by $a=3$ must give width $6/3=2$, and the result has support $[1,3]$. Also set $3t-5=0$. This gives $t=5/3$, where $y(5/3)=x(0)=2$.']
]},
{t:'figrow', n:3, items:[
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=tri3({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t'});
   a.curve(x,{color:C.ink}); return a.svg();}, cap:'$x(t)$'},
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=tri3({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t'});
   a.curve(t=>x(t-5),{color:C.mid}); [3,5,7,9].forEach(b=>a.vline(b,{color:C.mid,opacity:.45})); return a.svg();},
  cap:'$v(t)=x(t-5)$'},
 {svg:()=>{const x=t=> t<-2?0 : t<0?1 : t<2?2 : t<4?(4-t) : 0;
   const a=tri3({xr:[-3,10],yr:[-0.3,2.4],xlabel:'t'});
   a.curve(t=>x(3*t-5),{color:C.out}); [1,5/3,7/3,3].forEach(b=>a.vline(b,{color:C.out,opacity:.45})); return a.svg();},
  cap:'$y(t)=x(3t-5)$'}
]},

/* ---------- 1.4 ---------- */
{t:'h2', num:'1.4', text:'Periodicity, even and odd'},
{t:'h3', text:'Periodic signals'},
{t:'eqbox', cap:'Periodicity',
 tex:['x(t)=x(t+T)\\quad\\text{for all }t\\in\\mathbb{R},\\ \\text{for some }T>0',
      'x[n]=x[n+N]\\quad\\text{for all }n\\in\\mathbb{Z},\\ \\text{for some integer }N>0'],
 after:'A signal that is not periodic is <b>aperiodic</b>.'},
{t:'p', text:'The definition has two requirements. A positive period must exist, and the equality must hold for every $t$ or $n$. Holding for some values is not enough. In continuous time, $T$ may be any positive real number. In discrete time, $N$ must be a positive integer because the sequence exists only at integer indices. A value such as 3.5 samples cannot be a period.'},
{t:'p', text:'If $T$ is a period then so is $2T$, $3T$, and so on. The <b>fundamental period</b> $T_0$ is the smallest positive period. The same applies to $N_0$ in discrete time.'},
{t:'eqbox', cap:'Fundamental frequency', tex:'\\omega_0=\\frac{2\\pi}{T_0}\\qquad\\text{and}\\qquad \\omega_0=\\frac{2\\pi}{N_0}',
 after:'Without the word <em>smallest</em>, $\\omega_0$ would not be well defined.'},
{t:'p', text:'Two short cases show the definition at work. For $x(t)=\\cos(\\pi t/3)$, the angular frequency is $\\omega_0=\\pi/3$, so $T_0=2\\pi/(\\pi/3)=6$. For $x[n]=(-1)^{n}$, the test $N=1$ fails because $(-1)^{n+1}=-(-1)^{n}$. The test $N=2$ succeeds because $(-1)^{n+2}=(-1)^{n}(-1)^{2}=(-1)^{n}$ for every $n$. So $N_0=2$.'},
{t:'figrow', items:[
 {svg:()=>{const saw=t=>{const u=((t%4)+4)%4;return u/2-1;};
   const a=two({xr:[0,20],yr:[-1.3,1.45],xlabel:'t',ylabel:'x(t)',xtarget:5});
   a.curve(saw,{color:C.in,n:2000}); a.span(8,12,1.14,'T_0=4',{color:C.err,tex:true}); return a.svg();},
  cap:'Periods are $4,8,12,\\dots$ The fundamental period is $T_0=4$.'},
 {svg:()=>{const f=n=>{const u=((n%8)+8)%8;return [1,3,5,3,1,0,-1,0][u];};
   const a=two({xr:[-16,16],yr:[-1.8,6],xlabel:'n',ylabel:'y[n]',ytarget:3});
   a.stem(D(f,-16,16),{color:C.mid,r:2.6,width:1.4}); a.span(8,16,5.3,'N_0=8',{color:C.err,tex:true}); return a.svg();},
  cap:'Periods are $8,16,24,\\dots$ The fundamental period is $N_0=8$.'}
]},

{t:'h3', text:'A repeating shape that is not periodic'},
{t:'p', text:'Each piece of a signal may repeat while the whole signal fails the test. Take'},
{t:'eq', tex:'x(t)=\\begin{cases}\\sin(\\pi t),&t<0\\\\\\cos(\\pi t),&t\\ge0.\\end{cases}'},
{t:'p', text:'Both pieces have period 2. For $t\\ge0$, the test $x(t+T)=x(t)$ reads $\\cos(\\pi t+\\pi T)=\\cos(\\pi t)$, so a period must be a multiple of 2: $T=2m$ with $m=1,2,\\dots$ Test such a $T$ at $t=-0.5$. The shifted point $-0.5+2m$ is positive, so the cosine piece applies there:'},
{t:'eq', tex:'\\begin{aligned}x(-0.5+2m)&=\\cos\\bigl(\\pi(2m-0.5)\\bigr)=\\cos(2\\pi m-0.5\\pi)=\\cos(0.5\\pi)=0,\\\\x(-0.5)&=\\sin(-0.5\\pi)=-1.\\end{aligned}'},
{t:'p', text:'The two values differ for every $m$, so no $T$ works and $x(t)$ is aperiodic. A shifted copy would carry the jump at $t=0$ to $t=-T$, where $x(t)$ has no jump. The test must hold across the joint as well.'},
{t:'fig', svg:()=>{const x=t=>t<0?Math.sin(Math.PI*t):Math.cos(Math.PI*t);
  const a=ax({xr:[-4,4],yr:[-1.4,1.9],xlabel:'t',ylabel:'x',w:700,h:190,xtarget:9,ytarget:3});
  a.curve(x,{color:C.in,n:1600}); a.curve(t=>x(t+2),{color:C.out,dash:'7 5',n:1600});
  a.point(0,1,{color:C.coral});
  a.note(0.15,1.5,'\\text{jump of }x(t)\\text{ at }t=0',{anchor:'start',color:C.coral,fs:12,tex:true});
  a.note(-3.9,1.5,'x(t)\\;\\text{solid},\\;x(t+2)\\;\\text{dashed}',{anchor:'start',color:C.muted,fs:12,tex:true});
  return a.svg();},
 cap:'Both sides line up after a shift of 2, but the dashed copy $x(t+2)$ has its jump at $t=-2$, where $x(t)$ has none.'},
{t:'p', text:'The signal $y(t)=\\cos(\\pi t)\\,u(t)$ is aperiodic for the same reason. Suppose it had a period $T$. Then $y(t)=y(t-kT)$ for every positive integer $k$. Choose $k$ so large that $t-kT<0$; there $y$ is zero, so $y(t)=0$ for every $t$. But $y(0)=\\cos0=1$, so no period exists.'},

{t:'h3', text:'The period of a sum'},
{t:'p', text:'Let $x(t)=x_1(t)+x_2(t)$, where $x_1$ has period $T_1$ and $x_2$ has period $T_2$. The sum repeats when both parts repeat at the same time. So look for a $T$ that is a whole number of periods of each part, $T=kT_1=mT_2$ with integers $k,m\\ge1$. Then'},
{t:'eq', tex:'\\begin{aligned}x(t+T)&=x_1(t+kT_1)+x_2(t+mT_2)\\\\&=x_1(t)+x_2(t)=x(t).\\end{aligned}'},
{t:'eqbox', cap:'A common period', tex:'T=k\\,T_1=m\\,T_2\\quad\\Longrightarrow\\quad\\frac{T_1}{T_2}=\\frac{m}{k}',
 after:'A common period exists only if $T_1/T_2$ is rational. The smallest one is the least common multiple of $T_1$ and $T_2$. It is the fundamental period of the sum unless terms cancel, which does not happen for a sum of sinusoids at different frequencies.'},
{t:'ex', hd:'Example 1.4', rows:[
 ['Given','$x(t)=\\cos\\bigl(\\tfrac{2\\pi t}{3}\\bigr)+\\sin\\bigl(\\tfrac{\\pi t}{2}\\bigr)$.'],
 ['Find','The fundamental period $T_0$.'],
 ['Method','Find the period of each part from $T=2\\pi/\\omega$. Then take the least common multiple from the prime factorisations.'],
 ['Solution','The two periods are $$\\begin{aligned}T_1&=\\frac{2\\pi}{2\\pi/3}=3,\\\\T_2&=\\frac{2\\pi}{\\pi/2}=4.\\end{aligned}$$ Their ratio $3/4$ is rational. The factorisations are $3=3$ and $4=2^{2}$. They share no prime factor, so the least common multiple is their product: $$T_0=\\operatorname{lcm}(3,4)=3\\cdot4=12.$$'],
 ['Check','$12=4T_1=3T_2$. In one period of the sum the cosine makes four cycles and the sine makes three. No smaller common multiple exists: the multiples of 4 below 12 are 4 and 8, and neither is a multiple of 3.']
]},
{t:'fig', svg:()=>{const x=t=>Math.cos(2*Math.PI*t/3)+Math.sin(Math.PI*t/2);
  const a=ax({xr:[0,24],yr:[-2.3,2.9],xlabel:'t',ylabel:'x(t)',w:700,h:190,xtarget:9,ytarget:3});
  a.curve(x,{color:C.in,n:2400}); a.vline(12,{color:C.coral,dash:'4 4'}); a.vline(24,{color:C.coral,dash:'4 4'});
  a.span(0,12,2.35,'T_0=12',{color:C.coral,tex:true});
  return a.svg();},
 cap:'$x(t)=\\cos\\bigl(\\tfrac{2\\pi t}{3}\\bigr)+\\sin\\bigl(\\tfrac{\\pi t}{2}\\bigr)$ repeats every 12.'},
{t:'p', text:'A second case: $x(t)=\\cos(4t)+\\cos(6t)$ has $T_1=2\\pi/4=\\pi/2$ and $T_2=2\\pi/6=\\pi/3$. The condition $k\\,\\pi/2=m\\,\\pi/3$ gives $3k=2m$, and the smallest positive solution is $k=2$, $m=3$. So $T_0=2\\cdot\\pi/2=\\pi$.'},
{t:'box', kind:'warn', html:'<span class="t">When no period exists</span><b>Continuous time.</b> $\\cos t+\\cos(\\sqrt2\\,t)$ has $T_1=2\\pi$ and $T_2=2\\pi/\\sqrt2$. The ratio $T_1/T_2=\\sqrt2$ is irrational, so no common period exists and the sum is aperiodic.<br><b>Discrete time.</b> A sum of two periodic sequences is always periodic. The periods $N_1$ and $N_2$ are integers, so $N=N_1N_2$ is a whole number of periods of each part: $x_1[n+N_2N_1]=x_1[n]$ and $x_2[n+N_1N_2]=x_2[n]$.'},

{t:'h3', text:'Even and odd signals'},
{t:'p', text:'A signal is <b>even</b> if $x(t)=x(-t)$ for every $t$, and <b>odd</b> if $x(t)=-x(-t)$ for every $t$. The same definitions apply to $x[n]$ with $n$ in place of $t$. The graph of an even signal is its own mirror image about the axis $t=0$. A half-turn about the origin maps the graph of an odd signal onto itself.'},
{t:'p', text:'To test an odd signal at the origin, set $t=0$ in the definition. This gives $x(0)=-x(0)$, so $2x(0)=0$ and $x(0)=0$. Therefore any signal with $x(0)\\neq0$ is not odd.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=tri3({xr:[-1,1],yr:[-0.12,1.15],xlabel:'t',h:120,xtarget:2});
   a.curve(t=>t*t,{color:C.in}); return a.svg();}, cap:'$t^{2}$ is even.'},
 {svg:()=>{const a=tri3({xr:[-1,1],yr:[-1.15,1.15],xlabel:'t',h:120,xtarget:2});
   a.curve(t=>t*t*t,{color:C.mid}); return a.svg();}, cap:'$t^{3}$ is odd.'},
 {svg:()=>{const a=tri3({xr:[-1,1],yr:[-0.2,3.1],xlabel:'t',h:120,xtarget:2});
   a.curve(t=>Math.exp(-t),{color:C.h}); return a.svg();}, cap:'$e^{-t}$ is neither.'}
]},
{t:'p', text:'To classify a signal, compute $x(-t)$ and compare it with $x(t)$. Do not rely on the look of the graph alone.'},
{t:'ul', items:[
 '$x(t)=\\cos(\\pi t)$ gives $x(-t)=\\cos(-\\pi t)=\\cos(\\pi t)=x(t)$, so it is even.',
 '$x(t)=\\sin(\\pi t)$ gives $x(-t)=\\sin(-\\pi t)=-\\sin(\\pi t)=-x(t)$, so it is odd.',
 '$x(t)=t\\sin t$ gives $x(-t)=(-t)\\sin(-t)=(-t)(-\\sin t)=t\\sin t=x(t)$, so it is even.',
 '$x(t)=e^{-2t}u(t)$ has $x(-1)=0$ but $x(1)=e^{-2}$, so it is not even. It has $x(0)=1\\neq0$, so it is not odd. It is neither.',
 '$x[n]=n$ for $|n|\\le3$ and $0$ otherwise gives $x[-n]=-x[n]$ at every $n$, and $x[0]=0$. So it is odd.'
]},
{t:'p', text:'Every signal splits into an even part and an odd part:'},
{t:'eqbox', cap:'Even and odd parts',
 tex:['\\Ev\\{x(t)\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr],\\qquad \\Od\\{x(t)\\}=\\tfrac12\\bigl[x(t)-x(-t)\\bigr]',
      'x(t)=\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}'],
 after:'The same construction works for $x[n]$.'},
{t:'p', text:'Three short checks show that these definitions do what their names say. Replace $t$ by $-t$ in each part. The even part does not change and the odd part changes sign:'},
{t:'eq', tex:'\\begin{aligned}\\Ev\\{x(-t)\\}&=\\tfrac12\\bigl[x(-t)+x(t)\\bigr]=\\Ev\\{x(t)\\},\\\\\\Od\\{x(-t)\\}&=\\tfrac12\\bigl[x(-t)-x(t)\\bigr]=-\\Od\\{x(t)\\}.\\end{aligned}'},
{t:'p', text:'Adding the two parts returns $x$, because the $x(-t)$ terms cancel:'},
{t:'eq', tex:'\\begin{aligned}\\Ev\\{x(t)\\}+\\Od\\{x(t)\\}&=\\tfrac12[x(t)+x(-t)]+\\tfrac12[x(t)-x(-t)]\\\\&=\\tfrac12[2x(t)]\\\\&=x(t).\\end{aligned}'},
{t:'p', text:'The split is unique. Suppose $x(t)=e(t)+o(t)$ with $e$ even and $o$ odd. Replacing $t$ by $-t$ gives $x(-t)=e(t)-o(t)$. Adding and subtracting the two equations gives $e(t)=\\tfrac12[x(t)+x(-t)]$ and $o(t)=\\tfrac12[x(t)-x(-t)]$. These are the two formulas above.'},
{t:'p', text:'Two quick cases. For $x(t)=t+1$, $\\Od\\{x(t)\\}=\\tfrac12(t+1)-\\tfrac12(-t+1)=t$ and $\\Ev\\{x(t)\\}=1$. For the step and $t\\neq0$, exactly one of $u(t)$ and $u(-t)$ is 1, so $\\Ev\\{u(t)\\}=\\tfrac12[u(t)+u(-t)]=\\tfrac12$.'},
{t:'ex', hd:'Example 1.5', rows:[
 ['Given','The unit pulse $x(t)=1$ for $0<t<1$, and $x(t)=0$ otherwise.'],
 ['Find','$\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$.'],
 ['Method','Write down the mirror image $x(-t)$ first. Then apply the two definitions interval by interval.'],
 ['Solution','The mirror image is $x(-t)=1$ for $0<-t<1$, that is for $-1<t<0$, and $0$ otherwise. The two pulses do not overlap, so on each interval only one of them is non-zero: $$\\Ev\\{x(t)\\}=\\tfrac12\\bigl[x(t)+x(-t)\\bigr]=\\begin{cases}\\tfrac12(0+1)=\\tfrac12,&-1<t<0\\\\\\tfrac12(1+0)=\\tfrac12,&0<t<1\\\\0,&|t|>1\\end{cases}$$ $$\\Od\\{x(t)\\}=\\tfrac12\\bigl[x(t)-x(-t)\\bigr]=\\begin{cases}\\tfrac12(0-1)=-\\tfrac12,&-1<t<0\\\\\\tfrac12(1-0)=\\tfrac12,&0<t<1\\\\0,&|t|>1.\\end{cases}$$'],
 ['Check','Add the two parts. On $0<t<1$: $\\tfrac12+\\tfrac12=1=x(t)$. On $-1<t<0$: $\\tfrac12-\\tfrac12=0=x(t)$. Outside $[-1,1]$ both parts are $0$. The sum returns $x(t)$ everywhere.']
]},
{t:'figrow', n:3, items:[
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=tri3({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t'});
   a.curve(t=>x(-t),{color:C.muted,dash:'4 4',n:1600}); a.curve(x,{color:C.h,n:1600}); return a.svg();},
  cap:'$x(t)$, with its mirror $x(-t)$ dashed.'},
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=tri3({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t'});
   a.curve(t=>0.5*(x(t)+x(-t)),{color:C.in,n:1600}); return a.svg();},
  cap:'$\\Ev\\{x(t)\\}$: height $\\tfrac12$ on both sides.'},
 {svg:()=>{const x=t=>(t>0&&t<1)?1:0;const a=tri3({xr:[-2,2],yr:[-0.8,1.3],xlabel:'t'});
   a.curve(t=>0.5*(x(t)-x(-t)),{color:C.mid,n:1600}); return a.svg();},
  cap:'$\\Od\\{x(t)\\}$: the left half flips below the axis.'}
]},

{t:'h3', text:'Products of even and odd signals'},
{t:'p', text:'Many integrals of a product are zero by symmetry alone. Two short results give this. Let $x_e$ be even, let $x_o$ be odd, and let $y(t)=x_e(t)\\,x_o(t)$. Replace $t$ by $-t$ and use the two definitions:'},
{t:'eqbox', cap:'Even times odd is odd', tex:'y(-t)=x_e(-t)\\,x_o(-t)=x_e(t)\\bigl(-x_o(t)\\bigr)=-y(t).',
 after:'The same step shows that even times even is even, and odd times odd is even, because $(-1)(-1)=1$.'},
{t:'p', text:'Next, an odd signal integrates to zero over a symmetric interval $[-a,a]$. Split the integral at $0$. In the left half put $t=-s$, so $\\d t=-\\d s$; the limit $t=-a$ becomes $s=a$ and the limit $t=0$ becomes $s=0$. Then use $x_o(-s)=-x_o(s)$:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-a}^{0}x_o(t)\\,\\d t&=\\int_{a}^{0}x_o(-s)\\,(-\\d s)\\\\&=\\int_{a}^{0}x_o(s)\\,\\d s\\\\&=-\\int_{0}^{a}x_o(s)\\,\\d s,\\\\\\int_{-a}^{a}x_o(t)\\,\\d t&=\\int_{-a}^{0}x_o(t)\\,\\d t+\\int_{0}^{a}x_o(t)\\,\\d t\\\\&=-\\int_{0}^{a}x_o(s)\\,\\d s+\\int_{0}^{a}x_o(t)\\,\\d t=0.\\end{aligned}'},
{t:'p', text:'In discrete time, $\\sum_{n=-N}^{N}x_o[n]=0$ for the same reason: the terms at $n$ and $-n$ cancel, and $x_o[0]=0$. For example, $t^{3}$ is odd and $\\cos t$ is even. Their product $t^{3}\\cos t$ is odd, so $\\int_{-\\pi}^{\\pi}t^{3}\\cos t\\,\\d t=0$ with no calculation. Chapter 4 uses this to find the Fourier coefficients of even and odd signals.'},
{t:'fig', svg:()=>{const y=t=>t*Math.cos(Math.PI*t);
  const a=ax({xr:[-2.2,2.2],yr:[-2.4,2.4],xlabel:'t',ylabel:'x',w:700,h:210,xtarget:9,ytarget:5});
  a.area(y,-2,2,{color:'rgba(106,90,146,.18)',n:600});
  a.vline(-2,{color:C.coral,dash:'4 4'}); a.vline(2,{color:C.coral,dash:'4 4'});
  a.curve(t=>Math.cos(Math.PI*t),{color:C.in,dash:'6 5',n:1200});
  a.curve(t=>t,{color:C.h,dash:'6 5',n:400});
  a.curve(y,{color:C.mid,n:1600});
  a.note(-2.15,2.05,'t\\cos(\\pi t)\\;\\text{solid},\\;\\cos(\\pi t)\\;\\text{and}\\;t\\;\\text{dashed}',{anchor:'start',color:C.muted,fs:12,tex:true});
  return a.svg();},
 cap:'The even $\\cos(\\pi t)$ times the odd $t$ gives the odd $t\\cos(\\pi t)$. Each shaded lobe on $[0,2]$ has a lobe of opposite sign on $[-2,0]$, so the area on $[-2,2]$ is $0$.'},

/* ---------- 1.5 ---------- */
{t:'h2', num:'1.5', text:'The impulse and the step'},
{t:'h3', text:'The discrete-time impulse and step'},
{t:'eqbox', cap:'Definitions',
 tex:['\\delta[n]=\\begin{cases}1,&n=0\\\\0,&\\text{otherwise}\\end{cases}',
      'u[n]=\\begin{cases}1,&n\\ge0\\\\0,&\\text{otherwise}\\end{cases}'],
 after:'Both are ordinary sequences. Nothing infinite happens here.'},
{t:'p', text:'A shifted impulse $\\delta[n-n_0]$ is $1$ only where $n-n_0=0$, that is at $n=n_0$. For example, $\\delta[n-3]$ is non-zero only at $n=3$. The step includes its first sample: $u[0]=1$. So $x[n]=u[n-2]$ has $x[2]=u[0]=1$.'},
{t:'figrow', items:[
 {svg:()=>{const a=two({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',ylabel:'\\delta[n]',h:130,xtarget:5});
   a.stem(D(n=>n===0?1:0,-3,5),{color:C.in}); return a.svg();},
  cap:'The unit sample $\\delta[n]$: $1$ at $n=0$ and $0$ elsewhere.'},
 {svg:()=>{const a=two({xr:[-3,5],yr:[-0.2,1.3],xlabel:'n',ylabel:'u[n]',h:130,xtarget:5});
   a.stem(D(n=>n>=0?1:0,-3,5),{color:C.h}); return a.svg();},
  cap:'The unit step $u[n]$: $1$ for $n\\ge0$, including $u[0]=1$.'}
]},

{t:'h3', text:'First difference and running sum'},
{t:'p', text:'A first difference converts the step into the impulse. A running sum converts the impulse back into the step. These operations are the discrete-time forms of differentiation and integration.'},
{t:'eqbox', cap:'First difference and running sum',
 tex:['\\delta[n]=u[n]-u[n-1]', 'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\delta[n]+\\delta[n-1]+\\delta[n-2]+\\cdots']},
{t:'p', text:'Check the first difference region by region. For $n<0$, both $u[n]$ and $u[n-1]$ are $0$. At $n=0$, $u[0]-u[-1]=1-0=1$. For $n\\ge1$, both are $1$, so they cancel. Only $n=0$ survives, which is $\\delta[n]$.'},
{t:'p', text:'Each term $\\delta[n-k]$ of the running sum places one unit sample at $n=k$. The terms $k=0,1,2,\\dots$ therefore fill every $n\\ge0$ with a $1$ and leave $n<0$ at $0$. To write the sum as an accumulation up to $n$, substitute $m=n-k$. Then $k=0$ gives $m=n$, and $k\\to\\infty$ gives $m\\to-\\infty$:'},
{t:'eq', tex:'u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]=\\sum_{m=-\\infty}^{n}\\delta[m].'},
{t:'p', text:'The two operations undo each other. A first difference reverses a running sum, and a running sum reverses a first difference. For example, take $x[n]=u[n]-u[n-3]$ region by region. For $n<0$ it is $0-0=0$. For $n=0,1,2$ it is $1-0=1$. For $n\\ge3$ it is $1-1=0$. So $u[n]-u[n-3]=\\delta[n]+\\delta[n-1]+\\delta[n-2]$, with three non-zero samples.'},

{t:'h3', text:'The step as a sum of weighted impulses'},
{t:'p', text:'The step can also be written with its own samples as weights:'},
{t:'eq', tex:'u[n]=\\sum_{k=-\\infty}^{\\infty}u[k]\\,\\delta[n-k].'},
{t:'p', text:'Each term is an impulse at $n=k$ scaled by the sample $u[k]$. The weight $u[k]$ is $0$ for $k<0$ and $1$ for $k\\ge0$, so it switches off every term with $k<0$:'},
{t:'eq', tex:'\\begin{aligned}u[n]&=\\sum_{k=-\\infty}^{-1}0\\cdot\\delta[n-k]+\\sum_{k=0}^{\\infty}1\\cdot\\delta[n-k]\\\\&=\\sum_{k=0}^{\\infty}\\delta[n-k].\\end{aligned}'},
{t:'p', text:'This is the running sum found above. A weighted sum of impulses is read one sample at a time. For $x[n]=2\\delta[n]+\\delta[n-1]$, only the term $\\delta[n-1]$ is non-zero at $n=1$, so $x[1]=1$.'},

{t:'h3', text:'Sampling and sifting'},
{t:'p', text:'Sampling and sifting both use a shifted impulse, but they return different types of result.'},
{t:'eqbox', cap:'Sampling property', tex:'x[n]\\,\\delta[n-n_0]=x[n_0]\\,\\delta[n-n_0]',
 after:'Both sides are <b>sequences</b>. Multiplying by a shifted impulse keeps one sample and deletes the rest.'},
{t:'p', text:'Check it at each $n$. At $n=n_0$ both sides equal $x[n_0]\\cdot1$. At every other $n$, $\\delta[n-n_0]=0$, so both sides are $0$.'},
{t:'eqbox', cap:'Sifting property', tex:'x[n_0]=\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]',
 after:'The right-hand side is a <b>number</b>. Sifting is sampling followed by a sum.'},
{t:'p', text:'To derive sifting, apply the sampling property inside the sum. Then take the constant $x[n_0]$ outside, and use the fact that $\\delta[n-n_0]$ has exactly one non-zero sample:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-n_0]&=\\sum_{n=-\\infty}^{\\infty}x[n_0]\\,\\delta[n-n_0]\\\\&=x[n_0]\\sum_{n=-\\infty}^{\\infty}\\delta[n-n_0]\\\\&=x[n_0]\\cdot1.\\end{aligned}'},
{t:'ex', hd:'Example 1.6', rows:[
 ['Given','$x[0]=1$, $x[1]=2$, $x[2]=3$, and $x[n]=0$ elsewhere. Take $n_0=2$.'],
 ['Find','The sampled sequence and the sifted value.'],
 ['Method','Multiply by $\\delta[n-2]$ to keep the sample at $n=2$. Then sum the sampled sequence to sift out its value.'],
 ['Solution','Sampling: $$x[n]\\,\\delta[n-2]=x[2]\\,\\delta[n-2]=3\\,\\delta[n-2],$$ a single stem of height 3 at $n=2$. Sifting: only $n=0,1,2$ can give non-zero terms, and $\\delta[n-2]$ is $0,0,1$ there: $$\\begin{aligned}\\sum_{n=-\\infty}^{\\infty}x[n]\\,\\delta[n-2]&=x[0](0)+x[1](0)+x[2](1)\\\\&=1\\cdot0+2\\cdot0+3\\cdot1\\\\&=3.\\end{aligned}$$'],
 ['Check','The sampled result is a sequence. The sifted result is the number 3, which equals $x[2]$ as the sifting property requires.']
]},
{t:'p', text:'The impulse may sit at a negative index. For $x[n]=n^{2}$, the impulse $\\delta[n+1]=\\delta[n-(-1)]$ sits at $n=-1$, so $\\sum_{n}n^{2}\\,\\delta[n+1]=x[-1]=(-1)^{2}=1$.'},
{t:'p', text:'Apply the sampling property at every integer shift $k$ and add the results. This produces the representation used to derive convolution in Chapter 3.'},
{t:'eqbox', cap:'Representation property', big:true, tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]',
 after:'Any sequence is a sum of weighted, shifted impulses. The weights are the sample values themselves. At a fixed $n$, only the term $k=n$ is non-zero, and it equals $x[n]$.'},

{t:'h3', text:'The continuous-time impulse'},
{t:'p', text:'The continuous-time step is $u(t)=1$ for $t>0$ and $u(t)=0$ for $t<0$. The continuous-time impulse is not an ordinary function.'},
{t:'box', kind:'err', html:'<span class="t">Define the impulse by its action</span>An ordinary function that is zero except at one point has integral 0, not 1. The impulse is therefore a <b>distribution</b>, also called a generalized function. A distribution is defined by how it acts inside an integral.'},
{t:'eqbox', cap:'Defining property (sifting)', tex:'x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t',
 after:'This holds for every $x$ that is continuous at $t_0$. It is the definition. Everything else about $\\delta$ follows from it.'},
{t:'p', text:'An informal picture is often written as $\\delta(t)=\\infty$ at $t=0$, $\\delta(t)=0$ elsewhere, with $\\int_{-\\infty}^{\\infty}\\delta(t)\\,\\d t=1$. Use it only as a picture. A figure draws $\\delta(t)$ as an arrow, and the number beside the arrow is its <b>weight</b>. The weight is an area, not a function value. So for $x(t)=3\\delta(t)$, $\\int_{-\\infty}^{\\infty}x(t)\\,\\d t=3$.'},
{t:'p', text:'To picture the impulse, use a rectangle $\\delta_\\varepsilon(t)$ of width $\\varepsilon$ and height $1/\\varepsilon$, centred at $0$. Its area is $\\varepsilon\\cdot(1/\\varepsilon)=1$. A rectangle of width $0.1$, for example, has height $1/0.1=10$. Now let $\\varepsilon\\to0$. The rectangles do not approach an ordinary function at each fixed $t$. Their integrals against a continuous function do approach the sifting result. Shift the rectangle to $t_0$; it is $1/\\varepsilon$ on $[t_0-\\varepsilon/2,\\,t_0+\\varepsilon/2]$ and $0$ elsewhere:'},
{t:'eq', tex:'\\int_{-\\infty}^{\\infty}x(t)\\,\\delta_\\varepsilon(t-t_0)\\,\\d t=\\frac{1}{\\varepsilon}\\int_{t_0-\\varepsilon/2}^{t_0+\\varepsilon/2}x(t)\\,\\d t\\;\\longrightarrow\\;x(t_0)\\quad\\text{as }\\varepsilon\\to0.'},
{t:'p', text:'The middle expression is the average of $x$ over a window of width $\\varepsilon$ around $t_0$. For $x$ continuous at $t_0$, that average tends to the value at the centre.'},
{t:'fig', svg:()=>{const a=ax({xr:[-1.2,1.2],yr:[-0.5,9.2],xlabel:'t',ylabel:'\\delta_\\varepsilon(t)',w:700,h:210,pad:{l:52,r:20,t:14,b:30},xtarget:5,ytarget:4,ytickfmt:()=>''});
  [1,0.5,0.25,0.125].forEach((e,i)=>{ const col=i===3?C.in:C.muted;
    a.poly([[-e/2,0],[-e/2,1/e],[e/2,1/e],[e/2,0]],{color:col,width:i===3?2:1.3});
    a.note(e/2+0.03,1/e,String(1/e),{anchor:'start',color:col,fs:12,tex:true}); });
  a.note(1.15,6.2,'\\text{width }\\varepsilon,\\;\\text{height }1/\\varepsilon,\\;\\text{area }1',{anchor:'end',color:C.muted,fs:12,tex:true});
  return a.svg();},
 cap:'Unit-area rectangles with $\\varepsilon=1,\\tfrac12,\\tfrac14,\\tfrac18$. The number beside each top is its height $1/\\varepsilon$. As $\\varepsilon\\to0$ the rectangle becomes the impulse $\\delta(t)$.'},

{t:'h3', text:'Step, impulse, sampling and sifting in continuous time'},
{t:'p', text:'The impulse and the step are related by differentiation and integration:'},
{t:'eq', tex:'\\delta(t)=\\frac{\\d}{\\d t}u(t),\\qquad\\qquad u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\,\\d\\tau.'},
{t:'p', text:'The running integral follows from the unit area of $\\delta$. For $t<0$, the interval $(-\\infty,t]$ does not contain the impulse at $\\tau=0$, so the integral is $0$. For $t>0$, the interval contains it, so the integral is its area, $1$. That is $u(t)$. The pair $\\delta[n]=u[n]-u[n-1]$ is the discrete-time analogue: the difference becomes a derivative and the sum becomes an integral.'},
{t:'eqbox', cap:'Sampling property, continuous time', tex:'x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)',
 after:'Both sides are signals. Inside any integral they act in the same way, because the impulse sees only the value of $x$ at $t_0$.'},
{t:'p', text:'Sifting follows from sampling. Replace the product by $x(t_0)\\,\\delta(t-t_0)$, take the number $x(t_0)$ outside, and use the unit area:'},
{t:'eq', tex:'\\begin{aligned}\\int_{-\\infty}^{\\infty}x(t)\\,\\delta(t-t_0)\\,\\d t&=\\int_{-\\infty}^{\\infty}x(t_0)\\,\\delta(t-t_0)\\,\\d t\\\\&=x(t_0)\\int_{-\\infty}^{\\infty}\\delta(t-t_0)\\,\\d t\\\\&=x(t_0)\\cdot1.\\end{aligned}'},
{t:'figrow', items:[
 {svg:()=>{const a=two({xr:[-2,3],yr:[-0.15,1.4],xlabel:'t',ylabel:'\\delta(t)',h:140,ytickfmt:()=>''});
   a.impulse(0,1,{color:C.in,label:false}); a.note(0.12,1.2,'1',{anchor:'start',color:C.in,fs:13,tex:true}); return a.svg();},
  cap:'The arrow height shows the <b>area</b>, never a value of a function.'},
 {svg:()=>{const a=two({xr:[-1,6],yr:[-1.5,1.5],xlabel:'t',ylabel:'x',h:140});
   const x=t=>0.75*Math.cos(1.2*t-0.5); a.curve(x,{color:C.muted,width:1.4});
   a.impulse(3,x(3),{color:C.err,label:false}); a.point(3,x(3),{color:C.err});
   a.note(3.2,-1.22,'x(t_0)\\,\\delta(t-t_0)',{anchor:'start',color:C.err,fs:12,tex:true});
   a.note(5.7,1.3,'x(t)',{anchor:'end',color:C.muted,fs:12,tex:true}); return a.svg();},
  cap:'Sampling: the impulse at $t_0$ is scaled by the value of $x$ there. Integrating returns that number.'}
]},
{t:'ex', hd:'Example 1.7', rows:[
 ['Given','$x(t)=\\cos t$ and $t_0=\\pi$.'],
 ['Find','$\\displaystyle\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(t-\\pi)\\,\\d t$.'],
 ['Method','Use the sampling property to replace $\\cos t$ by its value at the impulse. Then use the unit area of the impulse.'],
 ['Solution','The impulse sits at $t=\\pi$, so $$\\begin{aligned}\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(t-\\pi)\\,\\d t&=\\int_{-\\infty}^{\\infty}\\cos(\\pi)\\,\\delta(t-\\pi)\\,\\d t\\\\&=\\cos(\\pi)\\int_{-\\infty}^{\\infty}\\delta(t-\\pi)\\,\\d t\\\\&=(-1)(1)=-1.\\end{aligned}$$'],
 ['Check','The result is a number, not a signal. It equals $x(t_0)=\\cos\\pi=-1$, as the sifting property requires.']
]},

{t:'h3', text:'Scaling the impulse'},
{t:'p', text:'Compressing the time axis changes the weight of an impulse, not its position. Find the area of $\\delta(at)$ with the substitution $s=at$, so $\\d t=\\d s/a$. For $a>0$ the limits stay $-\\infty$ and $\\infty$:'},
{t:'eq', tex:'\\int_{-\\infty}^{\\infty}\\delta(at)\\,\\d t=\\int_{-\\infty}^{\\infty}\\delta(s)\\,\\frac{\\d s}{a}=\\frac{1}{a}\\int_{-\\infty}^{\\infty}\\delta(s)\\,\\d s=\\frac{1}{a}.'},
{t:'p', text:'For $a<0$ the substitution swaps the limits: $t=-\\infty$ gives $s=+\\infty$, and $t=+\\infty$ gives $s=-\\infty$. Swapping them back changes the sign:'},
{t:'eq', tex:'\\int_{-\\infty}^{\\infty}\\delta(at)\\,\\d t=\\int_{\\infty}^{-\\infty}\\delta(s)\\,\\frac{\\d s}{a}=-\\frac{1}{a}\\int_{-\\infty}^{\\infty}\\delta(s)\\,\\d s=-\\frac{1}{a}=\\frac{1}{|a|}.'},
{t:'p', text:'The same substitution inside a sifting integral gives $\\int x(t)\\,\\delta(at)\\,\\d t=x(0)/|a|$, because $x(s/a)$ equals $x(0)$ at $s=0$. So $\\delta(at)$ acts exactly like $\\delta(t)/|a|$:'},
{t:'eqbox', cap:'Scaling property', tex:'\\delta(at)=\\frac{1}{|a|}\\,\\delta(t),\\qquad a\\neq0',
 after:'The impulse stays at $t=0$. Only its weight changes. In the rectangle picture, $\\delta_\\varepsilon(at)$ keeps its height and has width $1/|a|$ times the original, so its area is $1/|a|$.'},
{t:'fig', svg:()=>{const a=ax({xr:[-1.2,1.2],yr:[-0.25,1.6],xlabel:'t',ylabel:'\\delta_\\varepsilon',w:700,h:180,xtarget:5,ytarget:3});
  a.poly([[-0.5,0],[-0.5,1],[0.5,1],[0.5,0]],{color:C.in,width:1.6,dash:'6 5'});
  a.area(t=>Math.abs(t)<0.25?1:0,-0.25,0.25,{color:'rgba(74,122,70,.2)',n:200});
  a.poly([[-0.25,0],[-0.25,1],[0.25,1],[0.25,0]],{color:C.out,width:2.2});
  a.note(0.55,1.2,'\\delta_\\varepsilon(t)\\;\\text{dashed, area }1',{anchor:'start',color:C.in,fs:12,tex:true});
  a.note(-0.55,1.2,'\\delta_\\varepsilon(2t)\\;\\text{solid, area }1/2',{anchor:'end',color:C.out,fs:12,tex:true});
  return a.svg();},
 cap:'A unit-area rectangle of width 1 and height 1, and the same rectangle with $t$ replaced by $2t$. The height stays 1 and the width halves, so the area halves.'},
{t:'ex', hd:'Example 1.8', rows:[
 ['Given','$x(t)=\\cos t$.'],
 ['Find','$\\displaystyle\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(2t)\\,\\d t$.'],
 ['Method','Use the scaling property to rewrite $\\delta(2t)$ as a weighted impulse at $t=0$. Then sift.'],
 ['Solution','With $a=2$, $\\delta(2t)=\\tfrac12\\delta(t)$. Then $$\\begin{aligned}\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(2t)\\,\\d t&=\\frac12\\int_{-\\infty}^{\\infty}\\cos t\\;\\delta(t)\\,\\d t\\\\&=\\frac12\\cos0=\\frac12.\\end{aligned}$$'],
 ['Check','Substitute $s=2t$ directly, with $\\d t=\\d s/2$ and unchanged limits: $\\int\\cos(s/2)\\,\\delta(s)\\,\\d s/2=\\tfrac12\\cos0=\\tfrac12$. The two routes agree.']
]},

{t:'h3', text:'Differentiating a signal with jumps'},
{t:'p', text:'A signal with jumps has a derivative in two parts. On each smooth piece, differentiate as usual. At a jump of size $k$ at $t_0$, the signal contains a step $k\\,u(t-t_0)$, and its derivative is $k\\,\\delta(t-t_0)$. So each jump adds an impulse whose weight is the jump.'},
{t:'ex', hd:'Example 1.9', rows:[
 ['Given','$x(t)=t$ on $[0,2]$, $x(t)=1$ on $(2,3)$, and $x(t)=0$ elsewhere.'],
 ['Find','$x^{\\prime}(t)$.'],
 ['Method','(1) Differentiate each piece: the ramp gives 1 and a constant gives 0. (2) At each jump of size $k$ at $t_0$, add $k\\,\\delta(t-t_0)$. (3) Check that the running integral of the result returns $x(t)$.'],
 ['Solution','The pieces give slope $0$ for $t<0$, slope $1$ for $0<t<2$, and slope $0$ for $2<t<3$ and for $t>3$. The slope $1$ on $(0,2)$ is $u(t)-u(t-2)$. Now read the jumps as the value just after minus the value just before: $$\\begin{aligned}t=0:&\\quad x(0^{+})-x(0^{-})=0-0=0,\\\\t=2:&\\quad x(2^{+})-x(2^{-})=1-2=-1,\\\\t=3:&\\quad x(3^{+})-x(3^{-})=0-1=-1.\\end{aligned}$$ The ramp starts at 0, so there is no impulse at $t=0$. Therefore $$x^{\\prime}(t)=u(t)-u(t-2)-\\delta(t-2)-\\delta(t-3).$$'],
 ['Check','Integrate $x^{\\prime}$ from $-\\infty$ to $t$. For $0<t<2$: $\\int_{0}^{t}1\\,\\d\\tau=t=x(t)$. For $2<t<3$: $\\int_{0}^{2}1\\,\\d\\tau-1=2-1=1=x(t)$. For $t>3$: $2-1-1=0=x(t)$.']
]},
{t:'figrow', items:[
 {svg:()=>{const x=t=> t<0?0 : t<=2?t : t<3?1 : 0;
   const a=two({xr:[-1,4.5],yr:[-1.6,2.5],xlabel:'t',ylabel:'x(t)',ytarget:4});
   a.curve(x,{color:C.ink,n:1200}); return a.svg();},
  cap:'$x(t)$: a ramp to 2, a drop to 1 at $t=2$, and a drop to 0 at $t=3$.'},
 {svg:()=>{const a=two({xr:[-1,4.5],yr:[-1.6,2.5],xlabel:'t',ylabel:'x^{\\prime}(t)',ytarget:4});
   a.poly([[-1,0],[0,0]],{color:C.out}); a.poly([[0,1],[2,1]],{color:C.out}); a.poly([[2,0],[4.5,0]],{color:C.out});
   a.impulse(2,-1,{color:C.out,label:false}); a.impulse(3,-1,{color:C.out,label:false});
   a.note(2.12,-0.6,'-1',{anchor:'start',color:C.out,fs:12,tex:true}); a.note(3.12,-0.6,'-1',{anchor:'start',color:C.out,fs:12,tex:true});
   return a.svg();},
  cap:'$x^{\\prime}(t)$: slope 1 on $(0,2)$ and two impulses of weight $-1$, drawn pointing down.'}
]},

/* ---------- 1.6 ---------- */
{t:'h2', num:'1.6', text:'Complex exponentials'},
{t:'h3', text:'Complex numbers in polar form'},
{t:'p', text:'A complex exponential is easiest to read when its complex constants are in polar form. A complex number has two forms, linked by Euler\'s relation $e^{j\\theta}=\\cos\\theta+j\\sin\\theta$:'},
{t:'eqbox', cap:'Two forms of one number', tex:['\\begin{aligned}z&=x+jy\\\\&=re^{j\\theta}\\\\&=r\\cos\\theta+jr\\sin\\theta\\end{aligned}',
  'r=|z|=\\sqrt{x^{2}+y^{2}},\\qquad\\theta=\\angle z'],
 after:'Read $\\theta$ from the quadrant of the point $(x,y)$. The value $\\arctan(y/x)$ alone cannot tell $1+j$ from $-1-j$: both have $y/x=1$, but $1+j=\\sqrt2\\,e^{j\\pi/4}$ and $-1-j=\\sqrt2\\,e^{-j3\\pi/4}$.'},
{t:'p', text:'Comparing the real parts and the imaginary parts of the two forms gives $x=r\\cos\\theta$ and $y=r\\sin\\theta$. For example, $z=2e^{j\\pi/3}$ has $x=2\\cos(\\pi/3)=1$ and $y=2\\sin(\\pi/3)=\\sqrt3$, so $z=1+j\\sqrt3\\approx1+j1.73$. In the other direction, $z=-2j$ has $x=0$ and $y=-2$. Then $r=\\sqrt{0^{2}+(-2)^{2}}=2$, and the point lies on the negative imaginary axis, so $\\theta=-\\pi/2$ and $-2j=2e^{-j\\pi/2}$.'},
{t:'p', text:'Products are simple in polar form. The law of exponents gives $r_1e^{j\\theta_1}\\,r_2e^{j\\theta_2}=r_1r_2\\,e^{j(\\theta_1+\\theta_2)}$: the moduli multiply and the angles add.'},
{t:'figrow', items:[
 {svg:()=>{const a=two({w:340,h:260,xr:[-3.13,3.13],yr:[-2.4,2.4],xlabel:'\\operatorname{Re}',ylabel:'\\operatorname{Im}',xtarget:7,ytarget:5});
   const X=1, Y=Math.sqrt(3), th=Math.PI/3;
   a.poly([[X,0],[X,Y]],{color:C.muted,width:1.2,dash:'5 5'}); a.poly([[0,Y],[X,Y]],{color:C.muted,width:1.2,dash:'5 5'});
   const arc=[]; for(let i=0;i<=48;i++){ const p=th*i/48; arc.push([0.5*Math.cos(p),0.5*Math.sin(p)]); }
   a.poly(arc,{color:C.coral,width:1.6});
   a.poly([[0,0],[X,Y]],{color:C.in,width:2.2}); a.point(X,Y,{color:C.in});
   a.note(X+0.14,Y+0.12,'z=1+j\\sqrt{3}',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(0.62,0.34,'\\pi/3',{anchor:'start',color:C.coral,fs:12,tex:true});
   a.poly([[0,0],[0,-2]],{color:C.mid,width:2.2}); a.point(0,-2,{color:C.mid});
   a.note(0.16,-2.0,'z=-2j',{anchor:'start',color:C.mid,fs:12,tex:true});
   return a.svg();},
  cap:'$z=2e^{j\\pi/3}=1+j\\sqrt3$ lies at distance $r=2$ and angle $\\pi/3$. $z=-2j=2e^{-j\\pi/2}$ lies on the negative imaginary axis.'},
 {svg:()=>{const a=two({w:340,h:260,xr:[-2.34,2.34],yr:[-1.8,1.8],xlabel:'\\operatorname{Re}',ylabel:'\\operatorname{Im}',xtarget:5,ytarget:4});
   const arcP=(t0,t1,r)=>{ const o=[]; for(let i=0;i<=48;i++){ const p=t0+(t1-t0)*i/48; o.push([r*Math.cos(p),r*Math.sin(p)]); } return o; };
   a.poly(arcP(0,Math.PI/4,0.42),{color:C.coral,width:1.6}); a.poly(arcP(0,-3*Math.PI/4,0.3),{color:C.coral,width:1.6});
   a.poly([[0,0],[1,1]],{color:C.in,width:2.2}); a.point(1,1,{color:C.in});
   a.poly([[0,0],[-1,-1]],{color:C.mid,width:2.2}); a.point(-1,-1,{color:C.mid});
   a.note(1.12,1.12,'z=1+j',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(-1.12,-1.3,'z=-1-j',{anchor:'end',color:C.mid,fs:12,tex:true});
   a.note(0.5,0.18,'\\pi/4',{anchor:'start',color:C.coral,fs:12,tex:true});
   a.note(0.38,-0.42,'-3\\pi/4',{anchor:'start',color:C.coral,fs:12,tex:true});
   return a.svg();},
  cap:'$1+j$ and $-1-j$ give the same $y/x=1$, but they lie in opposite quadrants. Their angles are $\\pi/4$ and $-3\\pi/4$.'}
]},

{t:'h3', text:'Continuous-time complex exponentials'},
{t:'eqbox', cap:'Definition', tex:'x(t)=C\\,e^{at},\\qquad C,a\\in\\mathbb{C}'},
{t:'p', text:'Complex exponentials describe growth, decay and oscillation in one form. The real and imaginary parts of $a$ determine which behaviour occurs.'},
{t:'h3', text:'Case 1: $C$ and $a$ real'},
{t:'p', text:'If $a<0$ the signal decays. If $a>0$ it grows. If $a=0$ it is the constant $C$. A larger $|a|$ makes the decay or growth faster.'},
{t:'p', text:'Each time $t$ advances by $1/|a|$, the exponent changes by $1$ in magnitude. So the signal is multiplied by $e\\approx2.72$ when it grows, or divided by $e$ when it decays. For example, $x(t)=e^{-2t}$ reaches $e^{-1}$ where $-2t=-1$, that is at $t=1/2$. A signal $e^{at}$ that doubles every second has $e^{a\\cdot1}=2$, so $a=\\ln2\\approx0.69$.'},
{t:'figrow', items:[
 {svg:()=>{const a=two({xr:[0,6],yr:[-0.1,1.15],xlabel:'t',ylabel:'x(t)',xtarget:6,ytarget:3});
   [[0.5,C.in,'9 6'],[1,C.h],[2,C.out]].forEach(([k,col,dash])=>a.curve(t=>Math.exp(-k*t),{color:col,dash}));
   a.note(1.6,1.03,'e^{-0.5t}\\;(\\text{dashed})',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(4.1,1.03,'e^{-t}',{anchor:'start',color:C.h,fs:12,tex:true});
   a.note(5.1,1.03,'e^{-2t}',{anchor:'start',color:C.out,fs:12,tex:true}); return a.svg();},
  cap:'$a<0$: decay. A larger $|a|$ decays faster.'},
 {svg:()=>{const a=two({xr:[0,1.5],yr:[-1,21],xlabel:'t',ylabel:'x(t)',ytarget:3});
   [[0.5,C.in,'9 6'],[1,C.h],[2,C.out]].forEach(([k,col,dash])=>a.curve(t=>Math.exp(k*t),{color:col,dash}));
   a.note(0.14,19,'e^{0.5t}\\;(\\text{dashed})',{anchor:'start',color:C.in,fs:12,tex:true});
   a.note(0.72,19,'e^{t}',{anchor:'start',color:C.h,fs:12,tex:true});
   a.note(0.9,19,'e^{2t}',{anchor:'start',color:C.out,fs:12,tex:true}); return a.svg();},
  cap:'$a>0$: growth. Every curve starts at $x(0)=C=1$.'}
]},
{t:'h3', text:'Case 2: $a=j\\omega_0$ purely imaginary'},
{t:'p', text:'Write $C=Ae^{j\\theta}$ in polar form and use Euler\'s relation:'},
{t:'eq', tex:'\\begin{aligned}x(t)&=Ce^{j\\omega_0t}\\\\&=\\underbrace{Ae^{j\\theta}}_{C}\\,e^{j\\omega_0t}\\\\&=Ae^{j(\\omega_0t+\\theta)}\\\\&=A\\cos(\\omega_0t+\\theta)+jA\\sin(\\omega_0t+\\theta).\\end{aligned}'},
{t:'p', text:'Here $A=|C|$ is the amplitude, $\\omega_0$ is the angular frequency in rad/s, and $\\theta=\\angle C$ is the phase in radians. The amplitude is never negative. For $x(t)=-3e^{j2t}$, write $-3=3e^{j\\pi}$, so $A=3$ and $\\theta=\\pi$.'},
{t:'p', text:'The modulus is constant: $|x(t)|=A\\,|e^{j(\\omega_0t+\\theta)}|=A$ for every $t$, because $|e^{j\\phi}|=\\sqrt{\\cos^{2}\\phi+\\sin^{2}\\phi}=1$. This signal neither grows nor decays. With $\\omega_0=2\\pi f_0$, where $f_0$ is in hertz, the real part $\\cos(2\\pi f_0t)$ is a pure tone of $f_0$ Hz. Doubling $f_0$ halves the period and raises the pitch by one octave.'},
{t:'p', text:'To test periodicity, impose the condition $x(t)=x(t+T)$ and solve for $T$. Divide both sides by $Ae^{j(\\omega_0t+\\theta)}$, which is never zero:'},
{t:'eq', tex:'\\begin{aligned}x(t+T)&=x(t)\\\\Ae^{j[\\omega_0(t+T)+\\theta]}&=Ae^{j(\\omega_0t+\\theta)}\\\\e^{j\\omega_0T}&=1\\\\\\omega_0T&=2\\pi k,\\qquad k\\in\\mathbb{Z}\\\\T&=\\frac{2\\pi k}{\\omega_0}.\\end{aligned}'},
{t:'p', text:'The fourth line holds because $e^{j\\phi}=\\cos\\phi+j\\sin\\phi$ equals $1$ only when $\\cos\\phi=1$ and $\\sin\\phi=0$, that is when $\\phi$ is a whole number of turns: $e^{j2\\pi k}=\\cos(2\\pi k)+j\\sin(2\\pi k)=1+j0=1$.'},
{t:'box', kind:'ok', html:'<span class="t">Result</span>The smallest positive period comes from $k=1$ when $\\omega_0>0$, so $T_0=2\\pi/|\\omega_0|$. Every continuous-time complex exponential with $\\omega_0\\neq0$ is periodic. There is no extra condition.'},
{t:'ex', hd:'Example 1.10', rows:[
 ['Given','$x(t)=e^{j0.5\\pi t}$.'],
 ['Find','The fundamental period.'],
 ['Method','Use $T_0=2\\pi/\\omega_0$ because the exponent is purely imaginary and $\\omega_0\\neq0$.'],
 ['Solution','Here $\\omega_0=0.5\\pi$ rad/s, so $$T_0=\\frac{2\\pi}{\\omega_0}=\\frac{2\\pi}{0.5\\pi}=\\frac{2}{0.5}=4\\ \\text{s}.$$'],
 ['Check','$0.5\\pi\\times4=2\\pi$, so the phase advances by one full turn over the calculated period.']
]},
{t:'h3', text:'Case 3: $a=r+j\\omega_0$'},
{t:'p', text:'Now let $a$ have a real part $r$ and an imaginary part $\\omega_0$. Split $e^{at}$ with the law of exponents:'},
{t:'eq', tex:'\\begin{aligned}x(t)&=Ae^{j\\theta}e^{(r+j\\omega_0)t}\\\\&=A\\,\\underbrace{e^{rt}}_{\\text{envelope}}\\,\\underbrace{e^{j(\\omega_0t+\\theta)}}_{\\text{rotation}}\\\\&=Ae^{rt}\\cos(\\omega_0t+\\theta)+jAe^{rt}\\sin(\\omega_0t+\\theta).\\end{aligned}'},
{t:'p', text:'The real part is $\\operatorname{Re}\\{x(t)\\}=Ae^{rt}\\cos(\\omega_0t+\\theta)$. The curves $\\pm Ae^{rt}$ bound the sinusoid. If $r<0$, the oscillation is damped. If $r>0$, it grows. If $r=0$, it is sustained.'},
{t:'p', text:'Read $r$ and $\\omega_0$ directly from the exponent. For $x(t)=e^{(-1+j4)t}$, $r=\\operatorname{Re}\\{a\\}=-1<0$, so the real part $e^{-t}\\cos4t$ decays. A plucked string and a car spring after a bump sound and move like a tone with $r<0$.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,5],yr:[-2.3,2.3],xlabel:'t',ylabel:'\\operatorname{Re}\\{x(t)\\}',w:700,h:170,pad:{l:56,r:20,t:16,b:30},xtarget:5,ytarget:3});
  a.curve(t=>2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>-2*Math.exp(-0.5*t),{color:C.err,dash:'5 5',width:1.2});
  a.curve(t=>2*Math.exp(-0.5*t)*Math.cos(2*Math.PI*t),{color:C.in,n:1400});
  return a.svg();},
 cap:'A damped sinusoid, $\\operatorname{Re}\\{2e^{-0.5t}e^{j2\\pi t}\\}$, with $A=2$, $r=-0.5$ and $\\omega_0=2\\pi$ rad/s. The envelope $\\pm2e^{-0.5t}$ is dashed.'},

{t:'h3', text:'A sum of two exponentials'},
{t:'p', text:'A sum of two complex exponentials with different frequencies can be written as one exponential times a cosine. Take out the exponential at the average frequency. What is left is two exponentials with opposite frequencies, and Euler\'s relation turns them into a cosine:'},
{t:'eq', tex:'\\begin{aligned}e^{j\\phi}+e^{-j\\phi}&=(\\cos\\phi+j\\sin\\phi)+(\\cos\\phi-j\\sin\\phi)\\\\&=2\\cos\\phi.\\end{aligned}'},
{t:'ex', hd:'Example 1.11', rows:[
 ['Given','$x(t)=e^{j3t}+e^{j5t}$.'],
 ['Find','$x(t)$ as one exponential times a real signal, and $|x(t)|$.'],
 ['Method','Factor out $e^{j4t}$, because $4=(3+5)/2$ is the average frequency. Then use $e^{j\\phi}+e^{-j\\phi}=2\\cos\\phi$ and $|e^{j4t}|=1$.'],
 ['Solution','$$\\begin{aligned}x(t)&=e^{j3t}+e^{j5t}\\\\&=e^{j4t}\\bigl(e^{-jt}+e^{jt}\\bigr)\\\\&=e^{j4t}\\,\\underbrace{2\\cos t}_{e^{-jt}+e^{jt}},\\\\|x(t)|&=\\underbrace{\\bigl|e^{j4t}\\bigr|}_{1}\\,|2\\cos t|=2|\\cos t|.\\end{aligned}$$'],
 ['Check','At $t=0$ both terms equal $1$, so $x(0)=2$, and the formula gives $2e^{0}\\cos0=2$. At $t=\\pi/2$, $x=e^{j3\\pi/2}+e^{j5\\pi/2}=-j+j=0$, and $2|\\cos(\\pi/2)|=0$.']
]},
{t:'p', text:'The same steps work for any two frequencies $\\omega-d$ and $\\omega+d$: $e^{j(\\omega-d)t}+e^{j(\\omega+d)t}=2e^{j\\omega t}\\cos(dt)$, with $|x(t)|=2|\\cos(dt)|$. The magnitude repeats every $\\pi/d$, so a smaller gap makes it change more slowly. For $x(t)=e^{j2t}+e^{j8t}$, the average is $\\omega=5$ and the half gap is $d=3$, so $x(t)=2e^{j5t}\\cos3t$ and $|x(t)|=2|\\cos3t|$.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,8],yr:[-2.4,2.6],xlabel:'t',ylabel:'x',w:700,h:180,xtarget:8,ytarget:4});
  a.curve(t=>2*Math.cos(t)*Math.cos(4*t),{color:C.in,width:1.5,opacity:.55,n:1600});
  a.curve(t=>2*Math.abs(Math.cos(t)),{color:C.out,n:1600});
  a.note(7.9,2.35,'|x(t)|=2|\\cos t|\\;\\text{bold},\\;\\operatorname{Re}\\{x(t)\\}\\;\\text{light}',{anchor:'end',color:C.muted,fs:12,tex:true});
  return a.svg();},
 cap:'$x(t)=e^{j3t}+e^{j5t}$. The magnitude $2|\\cos t|$ repeats every $\\pi$. The real part $2\\cos t\\cos4t$ oscillates inside it.'},

{t:'h3', text:'Discrete-time complex exponentials'},
{t:'eqbox', cap:'Definition and power form', tex:['x[n]=C\\,e^{\\beta n},\\qquad C,\\beta\\in\\mathbb{C}',
  '\\alpha=e^{\\beta}\\quad\\Longrightarrow\\quad x[n]=Ce^{\\beta n}=C\\bigl(e^{\\beta}\\bigr)^{n}=C\\alpha^{n}'],
 after:'Use the power form in discrete time, because the solutions of difference equations have this form.'},
{t:'p', text:'For real $C$ and $\\alpha$: if $0<\\alpha<1$ the sequence decreases, and if $\\alpha>1$ it increases. For example, $x[n]=\\alpha^{n}$ with $x[3]=8$ has $\\alpha^{3}=8$, so $\\alpha=2$ and the sequence $2^{n}$ grows. For complex $C=|C|e^{j\\theta}$ and $\\alpha=|\\alpha|e^{j\\omega_0}$, use the polar forms and the law of exponents:'},
{t:'eq', tex:'\\begin{aligned}x[n]&=C\\alpha^n\\\\&=\\underbrace{|C|e^{j\\theta}}_{C}\\bigl(\\underbrace{|\\alpha|e^{j\\omega_0}}_{\\alpha}\\bigr)^n\\\\&=|C||\\alpha|^ne^{j(\\omega_0n+\\theta)}\\\\&=|C||\\alpha|^n\\cos(\\omega_0n+\\theta)+j|C||\\alpha|^n\\sin(\\omega_0n+\\theta).\\end{aligned}'},
{t:'p', text:'Read the modulus $|\\alpha|$ as the envelope. If $|\\alpha|=1$ the oscillation is sustained. If $|\\alpha|>1$ it grows. If $|\\alpha|<1$ it decays. The angle $\\omega_0$ sets only the oscillation, in radians per sample. For example, $x[n]=\\bigl(1.1e^{j\\pi/3}\\bigr)^{n}$ grows because $|\\alpha|=1.1>1$.'},
{t:'p', text:'A negative real $\\alpha$ is a special case with $\\omega_0=\\pi$. For $x[n]=(-0.5)^{n}$, $n\\ge0$, the samples are $1,-0.5,0.25,-0.125,\\dots$ The sequence decays because $|\\alpha|=0.5<1$, and it changes sign at every step.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=tri3({xr:[0,10],yr:[-0.1,1.15],xlabel:'n'});
   a.stem(D(n=>Math.pow(0.5,n),0,10),{color:C.in,r:2.4}); return a.svg();},
  cap:'$0.5^{n}$ decreases.'},
 {svg:()=>{const a=tri3({xr:[0,10],yr:[-40,1100],xlabel:'n',pad:{l:40,r:12,t:12,b:24}});
   a.stem(D(n=>Math.pow(2,n),0,10),{color:C.h,r:2.4}); return a.svg();},
  cap:'$2^{n}$ increases.'},
 {svg:()=>{const a=tri3({xr:[-20,20],yr:[-2.6,2.6],xlabel:'n'});
   a.stem(D(n=>Math.pow(0.95,n)*Math.cos(0.14*Math.PI*n),-20,20),{color:C.mid,r:1.8,width:1.1}); return a.svg();},
  cap:'$0.95^{n}\\cos(0.14\\pi n)$: $|\\alpha|=0.95$ decays.'}
]},
{t:'box', kind:'warn', html:'<span class="t">The boundary moves</span>In continuous time the growth-decay boundary is $\\operatorname{Re}\\{a\\}=0$, the imaginary axis. In discrete time it is $|\\alpha|=1$, the unit circle. The map between them is $\\alpha=e^{\\beta}$.'},

{t:'h3', text:'Low and high frequencies in discrete time'},
{t:'p', text:'In discrete time, frequencies that differ by $2\\pi$ give the same sequence. Split the exponent with the law of exponents:'},
{t:'eq', tex:'\\begin{aligned}e^{j(\\omega_0+2\\pi)n}&=e^{j\\omega_0n}\\,e^{j2\\pi n}\\\\&=e^{j\\omega_0n}\\cdot1\\\\&=e^{j\\omega_0n}.\\end{aligned}'},
{t:'p', text:'The second line holds because $e^{j2\\pi n}=\\cos(2\\pi n)+j\\sin(2\\pi n)=1$ for every integer $n$. So one interval of length $2\\pi$ holds every distinct sequence. Near $\\omega_0=0$ or $2\\pi$ the samples change slowly. Near $\\omega_0=\\pi$ they change fastest. At $\\omega_0=\\pi$,'},
{t:'eq', tex:'e^{j\\pi n}=\\cos(\\pi n)+j\\underbrace{\\sin(\\pi n)}_{0}=(-1)^{n}.'},
{t:'p', text:'This sequence changes sign at every sample. No discrete-time sinusoid changes faster. For example, $\\cos(11\\pi n/6)$ looks fast but is slow: $11\\pi/6=2\\pi-\\pi/6$, so $\\cos(11\\pi n/6)=\\cos(2\\pi n-\\pi n/6)=\\cos(-\\pi n/6)=\\cos(\\pi n/6)$. The last two steps use the $2\\pi$-periodicity of the cosine and the fact that it is even.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=tri3({xr:[-8,8],yr:[-1.3,1.3],xlabel:'n'});
   a.stem(D(n=>Math.cos(Math.PI*n/4),-8,8),{color:C.in,r:2.2,width:1.2}); return a.svg();},
  cap:'$\\omega_0=\\pi/4$: slow.'},
 {svg:()=>{const a=tri3({xr:[-8,8],yr:[-1.3,1.3],xlabel:'n'});
   a.stem(D(n=>Math.cos(Math.PI*n),-8,8),{color:C.err,r:2.2,width:1.2}); return a.svg();},
  cap:'$\\omega_0=\\pi$: $(-1)^{n}$, the fastest.'},
 {svg:()=>{const a=tri3({xr:[-8,8],yr:[-1.3,1.3],xlabel:'n'});
   a.stem(D(n=>Math.cos(7*Math.PI*n/4),-8,8),{color:C.in,r:2.2,width:1.2}); return a.svg();},
  cap:'$\\omega_0=7\\pi/4=2\\pi-\\pi/4$: the same samples as $\\pi/4$.'}
]},

{t:'h3', text:'When is a discrete-time exponential periodic?'},
{t:'p', text:'A discrete-time period must be an integer. Apply $x[n]=x[n+N]$ to $x[n]=Ce^{j\\omega_0 n}$ and solve for that integer. As in continuous time, divide by $Ce^{j\\omega_0n}$ and use the condition for $e^{j\\phi}=1$:'},
{t:'eq', tex:'\\begin{aligned}x[n+N]&=x[n]\\\\Ce^{j\\omega_0(n+N)}&=Ce^{j\\omega_0n}\\\\e^{j\\omega_0N}&=1\\\\\\omega_0N&=2\\pi k,\\qquad k\\in\\mathbb{Z}\\\\N&=\\frac{2\\pi k}{\\omega_0}.\\end{aligned}'},
{t:'eqbox', cap:'Periodicity condition', big:true, tex:'\\frac{\\omega_0}{2\\pi}=\\frac{k}{N}\\in\\mathbb{Q}',
 after:'$N$ must be an integer, and so must $k$. This is possible only when $\\omega_0/2\\pi$ is rational. If the ratio is irrational, no integer $N$ satisfies the periodicity condition and the sequence is aperiodic.'},
{t:'p', text:'For example, $x[n]=e^{j2n}$ has $\\omega_0/2\\pi=2/2\\pi=1/\\pi$, which is irrational. No integer period exists, so the sequence is aperiodic. The values $N=\\pi$ and $N=2\\pi$ are not periods, because a period must be an integer. In the same way, $\\cos(n/4)$ has $\\omega_0/2\\pi=1/(8\\pi)$ and is aperiodic.'},
{t:'table', cap:'Continuous-time and discrete-time complex exponentials compared.', head:['','Continuous time, $e^{j\\omega_0t}$','Discrete time, $e^{j\\omega_0n}$'], rows:[
 ['Periodic?','For every $\\omega_0\\neq0$','Only if $\\omega_0/2\\pi$ is rational'],
 ['Distinct frequencies','Each $\\omega_0$ gives a different signal','$\\omega_0$ and $\\omega_0+2\\pi$ give the same sequence']
]},
{t:'ex', hd:'Example 1.12', rows:[
 ['Given','$x[n]=e^{j(3\\pi/5)n}$.'],
 ['Find','The fundamental period $N_0$.'],
 ['Method','Use $N=2\\pi k/\\omega_0$ and take the smallest positive integer $k$ that makes $N$ an integer.'],
 ['Solution','Substitute the frequency before choosing $k$: $$\\begin{aligned}N&=\\frac{2\\pi k}{\\omega_0}\\\\&=\\frac{2\\pi k}{3\\pi/5}\\\\&=\\frac{10}{3}k.\\end{aligned}$$ $k=1$ gives $10/3$ and $k=2$ gives $20/3$, neither an integer. The smallest positive integer $k$ giving an integer $N$ is $k=3$, so $N_0=10$.'],
 ['Check','$\\omega_0N_0=\\dfrac{3\\pi}{5}\\times10=6\\pi=2\\pi\\times3$. The phase therefore advances by three full turns in ten samples.']
]},
{t:'figrow', items:[
 {svg:()=>{const a=two({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',ylabel:'\\operatorname{Re}\\{x[n]\\}',h:140,pad:{l:52,r:16,t:14,b:28}});
   a.stem(D(n=>Math.cos(3*Math.PI*n/5),-20,20),{color:C.in,r:2.4,width:1.2});
   a.span(-20,-10,1.2,'N_0=10',{color:C.err,tex:true}); return a.svg();},
  cap:'$\\operatorname{Re}\\{e^{j3\\pi n/5}\\}$ repeats every 10 samples.'},
 {svg:()=>{const a=two({xr:[-20,20],yr:[-1.3,1.45],xlabel:'n',ylabel:'x[n]',h:140});
   a.stem(D(n=>Math.cos(n),-20,20),{color:C.err,r:2.4,width:1.2}); return a.svg();},
  cap:'$\\cos(n)$ has $\\omega_0=1$, so $\\omega_0/2\\pi=1/(2\\pi)$ is irrational. The samples never repeat exactly. It looks periodic, but it is not.'}
]},

{t:'h3', text:'A sampled sinusoid has its own period'},
{t:'p', text:'A sequence may take its values from a periodic curve and still have a different period from the curve.'},
{t:'ex', hd:'Example 1.13', rows:[
 ['Given','$x[n]=\\cos(6\\pi n/17)$, the values of the curve $\\cos(6\\pi t/17)$ at integer $t$.'],
 ['Find','The period $T_0$ of the curve, the fundamental period $N_0$ of the sequence, and the fundamental frequency of the sequence.'],
 ['Method','The curve has $T_0=2\\pi/\\omega_0$. The sequence needs the smallest integer $N=2\\pi k/\\omega_0$.'],
 ['Solution','With $\\omega_0=6\\pi/17$: $$\\begin{aligned}T_0&=\\frac{2\\pi}{6\\pi/17}=\\frac{17}{3}\\approx5.67,\\\\N&=\\frac{2\\pi k}{6\\pi/17}=\\frac{17}{3}k.\\end{aligned}$$ $k=1$ and $k=2$ give $17/3$ and $34/3$, which are not integers. $k=3$ gives $N_0=17=3T_0$. The fundamental frequency of the sequence is $$\\frac{2\\pi}{N_0}=\\frac{2\\pi}{17}=\\frac{\\omega_0}{3}.$$'],
 ['Check','One period of the sequence holds 3 cycles of the curve: $\\omega_0N_0=\\tfrac{6\\pi}{17}\\cdot17=6\\pi=3\\cdot2\\pi$. So the fundamental frequency is $\\omega_0/3$, not $\\omega_0$.']
]},
{t:'fig', svg:()=>{const w=6*Math.PI/17;
  const a=ax({xr:[-1,35],yr:[-1.4,1.9],xlabel:'n',ylabel:'x[n]',w:700,h:190,xtarget:8,ytarget:3});
  a.curve(t=>Math.cos(w*t),{color:C.muted,width:1.3,dash:'5 5',n:1400});
  a.stem(D(n=>Math.cos(w*n),0,35),{color:C.in,r:2.8,width:1.3});
  a.span(17,17+17/3,1.3,'T_0=17/3',{color:C.muted,tex:true});
  a.vline(17,{color:C.coral,opacity:.9,width:1.4,dash:'6 4'}); a.point(17,1,{color:C.coral});
  a.span(17,34,1.72,'N_0=17',{color:C.coral,tex:true});
  return a.svg();},
 cap:'The dashed curve $\\cos(6\\pi t/17)$ repeats every $17/3$, but no sample falls at the end of its first or second cycle. After three cycles, at $n=17$, a sample falls on the start of a cycle again. The brackets mark one cycle of the curve and one period of the sequence, both from $n=17$.'},
{t:'p', text:'A second case: $x[n]=\\cos(4\\pi n/9)$ has $N=2\\pi k/(4\\pi/9)=9k/2$. The smallest integer comes at $k=2$, so $N_0=9$.'},

{t:'h3', text:'Harmonically related exponentials'},
{t:'p', text:'Chapter 4 builds a periodic signal as a weighted sum of exponentials that share its period. This family has a name. In continuous time, with $\\omega_0=2\\pi/T_0$,'},
{t:'eqbox', cap:'Continuous-time harmonic family', tex:'\\phi_k(t)=e^{jk\\omega_0t},\\qquad\\omega_0=\\frac{2\\pi}{T_0},\\quad k=0,\\pm1,\\pm2,\\dots',
 after:'For $k\\neq0$, $\\phi_k$ has fundamental period $T_0/|k|$. It makes $|k|$ full cycles in $T_0$, so every member repeats after $T_0$. The frequencies $k\\omega_0$ all differ, so all the members are different.'},
{t:'p', text:'To check that $T_0$ is a period of every member, shift by $T_0$ and use $\\omega_0T_0=2\\pi$: $\\phi_k(t+T_0)=e^{jk\\omega_0t}\\,e^{jk\\omega_0T_0}=\\phi_k(t)\\,e^{j2\\pi k}=\\phi_k(t)$.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,2],yr:[-1.35,1.75],xlabel:'t',ylabel:'\\operatorname{Re}\\{\\phi_k(t)\\}',w:700,h:190,pad:{l:60,r:20,t:16,b:30},xtarget:5,ytarget:3});
  [[1,C.in,'9 6'],[2,C.h],[3,C.out]].forEach(([k,col,dash])=>a.curve(t=>Math.cos(2*Math.PI*k*t),{color:col,dash,n:1200}));
  a.vline(1,{color:C.coral,opacity:.7}); a.span(0,1,1.45,'T_0=1',{color:C.coral,tex:true});
  a.note(1.5,1.45,'k=1',{anchor:'end',color:C.in,fs:12,tex:true}); a.note(1.72,1.45,'k=2',{anchor:'end',color:C.h,fs:12,tex:true}); a.note(1.94,1.45,'k=3',{anchor:'end',color:C.out,fs:12,tex:true});
  return a.svg();},
 cap:'The harmonics $k=1$ (dashed), $k=2$ and $k=3$ with $T_0=1$. The $k$-th makes $k$ full cycles in $T_0$, so all of them start together again at $t=T_0$.'},
{t:'p', text:'In discrete time the family with period $N$ uses the frequencies $k\\,2\\pi/N$. Adding $N$ to the index adds $2\\pi$ to the frequency, which changes nothing:'},
{t:'eq', tex:'\\begin{aligned}\\phi_k[n]&=e^{jk(2\\pi/N)n},\\\\\\phi_{k+N}[n]&=e^{jk(2\\pi/N)n}\\,e^{jN(2\\pi/N)n}=\\phi_k[n]\\,\\underbrace{e^{j2\\pi n}}_{1}=\\phi_k[n].\\end{aligned}'},
{t:'p', text:'So only $N$ members are different, for example $k=0,1,\\dots,N-1$. With $N=6$, $\\phi_{-1}[n]=\\phi_{-1+6}[n]=\\phi_5[n]$.'},

{t:'page'},
{t:'h3', text:'Geometric sums'},
{t:'p', text:'Sums of discrete-time exponentials are geometric sums. Each term is the one before it times the ratio $\\alpha$. To sum $N$ terms, write the sum, multiply it by $\\alpha$, and subtract:'},
{t:'eq', tex:'\\begin{aligned}S_N&=1+\\alpha+\\alpha^{2}+\\dots+\\alpha^{N-1}\\\\\\alpha S_N&=\\alpha+\\alpha^{2}+\\dots+\\alpha^{N-1}+\\alpha^{N}\\\\S_N-\\alpha S_N&=1-\\alpha^{N}\\\\(1-\\alpha)S_N&=1-\\alpha^{N}\\\\S_N&=\\frac{1-\\alpha^{N}}{1-\\alpha},\\qquad\\alpha\\neq1.\\end{aligned}'},
{t:'p', text:'The subtraction cancels every middle term. The last step divides by $1-\\alpha$, which is allowed only for $\\alpha\\neq1$. For $\\alpha=1$, every term is 1, so $S_N=N$.'},
{t:'eqbox', cap:'Geometric sums', tex:['\\sum_{n=0}^{N-1}\\alpha^{n}=\\begin{cases}\\dfrac{1-\\alpha^{N}}{1-\\alpha},&\\alpha\\neq1\\\\[6pt]N,&\\alpha=1\\end{cases}',
  '\\sum_{n=0}^{\\infty}\\alpha^{n}=\\frac{1}{1-\\alpha},\\qquad|\\alpha|<1'],
 after:'For $|\\alpha|<1$, $|\\alpha^{N}|=|\\alpha|^{N}\\to0$, so the finite sum tends to $1/(1-\\alpha)$. For $|\\alpha|\\ge1$ the terms do not shrink to zero, and the infinite sum does not converge.'},
{t:'p', text:'For example, with $\\alpha=1/3$ the ratio satisfies $|1/3|<1$, so $\\sum_{n=0}^{\\infty}(1/3)^{n}=1/(1-1/3)=1/(2/3)=3/2$.'},
{t:'figrow', items:[
 {svg:()=>{const al=0.5, S=N=>(1-Math.pow(al,N))/(1-al);
   const a=two({xr:[-0.5,10.5],yr:[-0.1,2.5],xlabel:'N',ylabel:'S_N',xtarget:6,ytarget:3});
   a.hline(2,{color:C.coral,dash:'6 5',opacity:.9}); a.stem(D(S,0,10),{color:C.in,r:2.8,showZero:true});
   a.note(10.3,2.25,'1/(1-\\alpha)=2',{anchor:'end',color:C.coral,fs:12,tex:true}); return a.svg();},
  cap:'$\\alpha=0.5$: the partial sums rise towards $1/(1-0.5)=2$.'},
 {svg:()=>{const al=-0.5, S=N=>(1-Math.pow(al,N))/(1-al);
   const a=two({xr:[-0.5,10.5],yr:[-0.1,1.3],xlabel:'N',ylabel:'S_N',xtarget:6,ytarget:3});
   a.hline(2/3,{color:C.coral,dash:'6 5',opacity:.9}); a.stem(D(S,0,10),{color:C.in,r:2.8,showZero:true});
   a.note(10.3,1.12,'1/(1-\\alpha)=2/3',{anchor:'end',color:C.coral,fs:12,tex:true}); return a.svg();},
  cap:'$\\alpha=-0.5$: the partial sums swing above and below $1/(1+0.5)=2/3$.'}
]},

{t:'h3', text:'Summing one harmonic over a period'},
{t:'p', text:'The finite geometric sum gives a result that Chapter 4 uses to find Fourier series coefficients. Sum one discrete-time harmonic over one period. Its terms form a geometric sum with ratio $\\alpha=e^{jk2\\pi/N}$:'},
{t:'eq', tex:'\\sum_{n=0}^{N-1}e^{jk(2\\pi/N)n}=\\sum_{n=0}^{N-1}\\alpha^{n},\\qquad\\alpha=e^{jk2\\pi/N}.'},
{t:'p', text:'If $k$ is not a multiple of $N$, then $k2\\pi/N$ is not a whole number of turns, so $\\alpha\\neq1$. Use the finite sum, and note that $\\alpha^{N}=e^{jk2\\pi}=1$:'},
{t:'eq', tex:'\\sum_{n=0}^{N-1}\\alpha^{n}=\\frac{1-\\alpha^{N}}{1-\\alpha}=\\frac{1-e^{jk2\\pi}}{1-\\alpha}=\\frac{1-1}{1-\\alpha}=0.'},
{t:'p', text:'If $k$ is a multiple of $N$, then $\\alpha=1$ and all $N$ terms equal 1, so the sum is $N$.'},
{t:'eqbox', cap:'One harmonic over a period', big:true, tex:'\\sum_{n=0}^{N-1}e^{jk(2\\pi/N)n}=\\begin{cases}N,&k=0,\\pm N,\\pm2N,\\dots\\\\0,&\\text{otherwise}\\end{cases}'},
{t:'p', text:'For example, with $N=4$ and $k=1$ the terms $e^{j\\pi n/2}$ for $n=0,1,2,3$ are $1,\\,j,\\,-1,\\,-j$, and they add to $0$. On the unit circle, the terms of a harmonic with $k$ not a multiple of $N$ are spread evenly, so they balance about the origin.'},
{t:'figrow', items:[
 circleTerms(0,6,'$N=6$, $k=0$: all six terms sit at $1$, and the sum is $6$.'),
 circleTerms(1,6,'$N=6$, $k=1$: the six terms $e^{j\\pi n/3}$ are spread evenly over the circle, and the sum is $0$.')
]},

/* ---------- 1.7 ---------- */
{t:'h2', num:'1.7', text:'A catalogue of common signals'},
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
{t:'p', text:'Many signals are sums, shifts and products of these four shapes. A voltage $V$ switched on at $t_0$ is $V\\,u(t-t_0)$. The ramp is the running integral of the step, $r(t)=\\int_{-\\infty}^{t}u(\\tau)\\,\\d\\tau$. The step is the running integral of $\\delta(t)$. The sign function checks both formulas: for $t>0$, $2u(t)-1=2-1=1$, and for $t<0$, $2u(t)-1=0-1=-1$.'},
{t:'p', text:'The energy of the one-sided exponential follows from the definition of $E_\\infty$. The signal is zero for $t<0$, so the lower limit is $0$:'},
{t:'eq', tex:'\\begin{aligned}E_\\infty&=\\int_{0}^{\\infty}\\bigl(e^{-at}\\bigr)^{2}\\,\\d t=\\int_{0}^{\\infty}e^{-2at}\\,\\d t\\\\&=\\left[-\\frac{e^{-2at}}{2a}\\right]_{0}^{\\infty}=0-\\left(-\\frac{1}{2a}\\right)=\\frac{1}{2a},\\qquad a>0.\\end{aligned}'},

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
{t:'p', text:'The sinc is unnormalised here: $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, so $\\operatorname{sinc}(\\pi t)=\\sin(\\pi t)/(\\pi t)$. Its zeros are where $\\sin(\\pi t)=0$ with $t\\neq0$, that is at the non-zero integers. At $t=0$ the limit $\\sin\\theta/\\theta\\to1$ gives the peak $1$.'},
{t:'p', text:'The rectangle has energy $\\int_{-1/2}^{1/2}1^{2}\\,\\d t=1$. The triangle energy shows how to use symmetry in an energy integral. The integrand is even, so integrate over $[0,1]$ and double. Then substitute $s=1-t$, $\\d s=-\\d t$, which maps $t=0\\mapsto s=1$ and $t=1\\mapsto s=0$:'},
{t:'eq', tex:'\\begin{aligned}E_\\infty&=\\int_{-1}^{1}(1-|t|)^{2}\\,\\d t=2\\int_{0}^{1}(1-t)^{2}\\,\\d t\\\\&=2\\int_{1}^{0}s^{2}\\,(-\\d s)=2\\int_{0}^{1}s^{2}\\,\\d s=2\\left[\\frac{s^{3}}{3}\\right]_{0}^{1}=\\frac23.\\end{aligned}'},
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
{t:'p', text:'For a periodic signal, the average over all time equals the average over one period, $P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}|x(t)|^{2}\\,\\d t$, because every period adds the same energy. The square wave has $|x(t)|^{2}=A^{2}$ at every $t$, so $P_\\infty=A^{2}$. For the sine, use $\\sin^{2}\\theta=\\tfrac12(1-\\cos2\\theta)$; the cosine term integrates to zero over whole periods:'},
{t:'eq', tex:'P_\\infty=\\frac{1}{T_0}\\int_{0}^{T_0}A^{2}\\sin^{2}\\Bigl(\\frac{2\\pi t}{T_0}\\Bigr)\\d t=\\frac{A^{2}}{T_0}\\int_{0}^{T_0}\\frac{1-\\cos(4\\pi t/T_0)}{2}\\,\\d t=\\frac{A^{2}}{T_0}\\cdot\\frac{T_0}{2}=\\frac{A^{2}}{2}.'},
{t:'p', text:'For the sawtooth, substitute $s=2t/T_0-1$, $\\d t=\\tfrac{T_0}{2}\\d s$, which maps $t=0\\mapsto s=-1$ and $t=T_0\\mapsto s=1$:'},
{t:'eq', tex:'\\begin{aligned}P_\\infty&=\\frac{1}{T_0}\\int_{0}^{T_0}A^{2}\\Bigl(\\frac{2t}{T_0}-1\\Bigr)^{2}\\d t=\\frac{A^{2}}{T_0}\\cdot\\frac{T_0}{2}\\int_{-1}^{1}s^{2}\\,\\d s\\\\&=\\frac{A^{2}}{2}\\left[\\frac{s^{3}}{3}\\right]_{-1}^{1}=\\frac{A^{2}}{2}\\cdot\\frac{2}{3}=\\frac{A^{2}}{3}.\\end{aligned}'},
{t:'p', text:'For the triangle, average over the period $[-T_0/2,T_0/2]$. The integrand is even, so integrate over $[0,T_0/2]$ and double. Then substitute $s=1-4t/T_0$, $\\d t=-\\tfrac{T_0}{4}\\d s$, which maps $t=0\\mapsto s=1$ and $t=T_0/2\\mapsto s=-1$:'},
{t:'eq', tex:'\\begin{aligned}P_\\infty&=\\frac{2}{T_0}\\int_{0}^{T_0/2}A^{2}\\Bigl(1-\\frac{4t}{T_0}\\Bigr)^{2}\\d t=\\frac{2A^{2}}{T_0}\\int_{1}^{-1}s^{2}\\Bigl(-\\frac{T_0}{4}\\Bigr)\\d s\\\\&=\\frac{A^{2}}{2}\\int_{-1}^{1}s^{2}\\,\\d s=\\frac{A^{2}}{2}\\cdot\\frac23=\\frac{A^{2}}{3}.\\end{aligned}'},
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
  cap:'AM: $x(t)=\\bigl(1+m\\cos(2\\pi f_mt)\\bigr)\\cos(2\\pi f_ct)$ with $0<m\\le1$. The dashed envelope is $\\pm\\bigl(1+m\\cos(2\\pi f_mt)\\bigr)$. Drawn with $f_c=12$ Hz, $f_m=1$ Hz, $m=0.8$.'},
 {svg:()=>{const a=cat({xr:[0,2],yr:[-1.4,1.4],xlabel:'t\\;(\\text{s})',ylabel:'x(t)',xstep:0.5}); a.curve(t=>Math.cos(2*Math.PI*10*t+5*Math.sin(2*Math.PI*t)),{color:C.in,n:1600}); return a.svg();},
  cap:'FM: $x(t)=\\cos\\bigl(2\\pi f_ct+\\beta\\sin(2\\pi f_mt)\\bigr)$. Drawn with $f_c=10$ Hz, $f_m=1$ Hz, $\\beta=5$.'}
]},
{t:'p', text:'Beats come from the sum-to-product identity $\\cos\\theta_1+\\cos\\theta_2=2\\cos\\bigl(\\tfrac{\\theta_1-\\theta_2}{2}\\bigr)\\cos\\bigl(\\tfrac{\\theta_1+\\theta_2}{2}\\bigr)$. With $\\theta_i=2\\pi f_it$, the half-difference is $\\pi(f_1-f_2)t$ and the half-sum is $\\pi(f_1+f_2)t$:'},
{t:'eq', tex:'\\cos(2\\pi f_1t)+\\cos(2\\pi f_2t)=2\\cos\\bigl(\\pi(f_1-f_2)t\\bigr)\\cos\\bigl(\\pi(f_1+f_2)t\\bigr).'},
{t:'p', text:'The slow factor sets the loudness. The loudness follows $|2\\cos(\\pi(f_1-f_2)t)|$, which has period $1/|f_1-f_2|$, so it peaks $|f_1-f_2|$ times a second. Two strings a few hertz apart beat. A musician turns the peg until the beats slow down and stop, which means $f_1=f_2$.'},
{t:'p', text:'The frequency of a signal $\\cos\\phi(t)$ at time $t$, in hertz, is $\\frac{1}{2\\pi}\\frac{\\d\\phi}{\\d t}$. Differentiate the phase of the chirp and of FM:'},
{t:'eq', tex:'\\begin{aligned}\\text{chirp:}\\quad&\\frac{1}{2\\pi}\\frac{\\d}{\\d t}\\Bigl[2\\pi\\Bigl(f_0t+\\frac{k}{2}t^{2}\\Bigr)\\Bigr]=f_0+kt,\\\\\\text{FM:}\\quad&\\frac{1}{2\\pi}\\frac{\\d}{\\d t}\\bigl[2\\pi f_ct+\\beta\\sin(2\\pi f_mt)\\bigr]=f_c+\\beta f_m\\cos(2\\pi f_mt).\\end{aligned}'},
{t:'p', text:'In FM the amplitude stays fixed and the frequency swings about $f_c$. A chirp sweeps its frequency, as a bird call or a radar pulse does. Beats and AM keep the tone and move its loudness.'},

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

/* ---------- 1.8 ---------- */
{t:'h2', num:'1.8', text:'Summary'},
{t:'ol', items:[
 '$E_\\infty$ and $P_\\infty$ are limits. Finite energy forces zero average power. Finite non-zero average power forces infinite energy. Unbounded growth gives neither.',
 'To build $x(at-b)$, shift by $b$ first, then scale by $a$. The other order gives $x(at-ab)$.',
 '$T_0$ and $N_0$ are the smallest positive periods, and $\\omega_0=2\\pi/T_0=2\\pi/N_0$. A sum of periodic signals has the least common multiple of their periods as a period; in continuous time it exists only if the ratio of the periods is rational.',
 'Every signal splits in one way into an even and an odd part: $\\Ev\\{x(t)\\}=\\tfrac12[x(t)+x(-t)]$ and $\\Od\\{x(t)\\}=\\tfrac12[x(t)-x(-t)]$. The odd part is $0$ at $t=0$, and an odd signal integrates to $0$ over $[-a,a]$.',
 '$\\delta[n]=u[n]-u[n-1]$ and $u[n]=\\sum_{k=-\\infty}^{n}\\delta[k]$: a first difference and a running sum.',
 '$\\delta[n]$ is an ordinary sequence. $\\delta(t)$ is a distribution, defined by sifting. It scales as $\\delta(at)=\\delta(t)/|a|$.',
 'Every sequence is a sum of weighted, shifted impulses: $x[n]=\\sum_k x[k]\\,\\delta[n-k]$.',
 'Sifting, $\\int x(t)\\,\\delta(t-t_0)\\,\\d t=x(t_0)$, gives a <b>number</b>. Sampling, $x(t)\\,\\delta(t-t_0)=x(t_0)\\,\\delta(t-t_0)$, gives a <b>signal</b>.',
 'In $e^{(r+j\\omega_0)t}$, $r$ sets the envelope $e^{rt}$: growth for $r>0$, decay for $r<0$. $\\omega_0$ sets the oscillation. In discrete time $|\\alpha|$ sets the envelope, with the boundary at $|\\alpha|=1$.',
 'A discrete-time exponential $e^{j\\omega_0n}$ is periodic if and only if $\\omega_0/2\\pi$ is rational. A continuous-time one with $\\omega_0\\neq0$ always is.',
 '$e^{j\\omega_0 n}$ and $e^{j(\\omega_0+2\\pi)n}$ are the same sequence, so discrete-time frequencies repeat every $2\\pi$. The fastest sequence is $e^{j\\pi n}=(-1)^{n}$.',
 '$\\sum_{n=0}^{N-1}\\alpha^{n}=(1-\\alpha^{N})/(1-\\alpha)$ for $\\alpha\\neq1$, and one harmonic summed over a period gives $N$ when $k$ is a multiple of $N$ and $0$ otherwise.'
]},

{t:'h3', text:'Exercises'},
{t:'q', n:'1.1', text:'Classify $x(t)=e^{-3t}u(t)$ as an energy signal, a power signal, or neither. Give the value of whichever quantity is finite.', ans:'Energy signal, $E_\\infty=1/6$.'},
{t:'q', n:'1.2', text:'For $x[n]$ non-zero only on $-1\\le n\\le1$ with values $1,2,1$, sketch $x[n+4]$ and $x[n-5]$ and give the support of each.', ans:'Supports $-5\\le n\\le-3$ and $4\\le n\\le6$.'},
{t:'q', n:'1.3', text:'A signal $x(t)$ is non-zero only on $[-1,5]$. On what interval is $x(2t+3)$ non-zero?', ans:'$[-2,1]$.'},
{t:'q', n:'1.4', text:'Find the fundamental period of $x[n]=\\cos(4\\pi n/7)$, or show that it is aperiodic.', ans:'$N_0=7$.'},
{t:'q', n:'1.5', text:'Use symmetry to evaluate $\\int_{-2}^{2}\\bigl(t^{3}+t\\cos t+1\\bigr)\\,\\d t$ without integrating the first two terms.', ans:'$4$. The first two terms are odd.'},
{t:'q', n:'1.6', text:'Evaluate $\\int_{-\\infty}^{\\infty}(t^{2}+1)\\,\\delta(t-2)\\,\\d t$ and $\\sum_{n=-\\infty}^{\\infty}2^{-n}\\,\\delta[n-3]$.', ans:'5 and $1/8$.'},
{t:'q', n:'1.7', text:'Find the fundamental period of $x(t)=\\cos(\\pi t/2)+\\sin(\\pi t/3)$.', ans:'$T_0=12$.'},
{t:'q', n:'1.8', text:'Write $x(t)=e^{jt}+e^{j7t}$ as one exponential times a cosine, and give $|x(t)|$.', ans:'$x(t)=2e^{j4t}\\cos3t$ and $|x(t)|=2|\\cos3t|$.'}
];
})();
