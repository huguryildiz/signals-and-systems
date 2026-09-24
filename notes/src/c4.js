/* Course notes — Chapter 4, Fourier series */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:52,r:22,t:24,b:32},xtarget:8,ytarget:3,yticksLeft:true},o));
/* one figure of a two-figure row, and one of a three-figure row */
const ax2=o=>ax(Object.assign({w:340,h:180,pad:{l:46,r:16,t:18,b:30},xtarget:5,ytarget:3},o));
const ax3=o=>ax(Object.assign({w:225,h:160,pad:{l:42,r:12,t:16,b:28},xtarget:3,ytarget:3},o));
/* the periodic rectangular wave: 1 on |t| < T1, 0 out to T/2, period T */
const rectWave=(t,T,T1)=>{const u=t-T*Math.round(t/T);return Math.abs(u)<T1?1:0;};
const rectPS=(t,N,T,T1)=>{let s=2*T1/T;
  for(let k=1;k<=N;k++) s+=2*Math.sin(2*Math.PI*k*T1/T)/(Math.PI*k)*Math.cos(2*Math.PI*k*t/T);
  return s;};
/* the sawtooth x(t) = t on -T/2 < t < T/2, and its partial sum */
const sawWave=(t,T)=>t-T*Math.round(t/T);
const sawPS=(t,N,T)=>{let s=0;
  for(let k=1;k<=N;k++) s+=-(T/(k*Math.PI))*Math.cos(k*Math.PI)*Math.sin(2*Math.PI*k*t/T);
  return s;};
const dtRect=(k,N,N1)=>{const r=k/N;
  if(Math.abs(r-Math.round(r))<1e-12) return (2*N1+1)/N;
  return Math.sin(2*Math.PI*k*(N1+0.5)/N)/(N*Math.sin(Math.PI*k/N));};
/* rectangular-wave coefficients for T0 = 4 T1 */
const aq=k=>k===0?0.5:Math.sin(Math.PI*k/2)/(Math.PI*k);
/* discrete sawtooth x[n] = n on -5..5, N = 11: a_k = -j S(k) */
const sawS=k=>{let s=0;for(let m=1;m<=5;m++) s+=(2*m/11)*Math.sin(2*Math.PI*k*m/11);return s;};
const wrap=p=>{while(p>Math.PI+1e-9)p-=2*Math.PI;while(p<-Math.PI-1e-9)p+=2*Math.PI;return p;};
const PI2=[-Math.PI/2,0,Math.PI/2];
/* A frequency axis is read in multiples of pi: the ticks sit at rational
   multiples of pi and are labelled in that form. Tick numbers stay plain text. */
const PI=Math.PI;
const piTick=v=>{const r=v/PI;
  if(Math.abs(r)<1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12]){const num=r*den;
    if(Math.abs(num-Math.round(num))<1e-7){
      const k=Math.round(num), sg=k<0?'-':'', m=Math.abs(k), head=m===1?'π':m+'π';
      return den===1?sg+head:sg+head+'/'+den;}}
  return P.fmt(v,2);};
const wTicks=(lo,hi,step)=>{const o=[];
  for(let k=Math.ceil(lo/step-1e-9);k<=hi/step+1e-9;k++) o.push(k*step); return o;};
/* the mean-removed running integral of the T0 = 2, T1 = 0.5 rectangular wave */
const triI=t=>{const u=t-2*Math.round(t/2);return Math.abs(u)<0.5?0.5*u:(u>0?0.25-0.5*(u-0.5):-0.25-0.5*(u+0.5));};

window.C4 = [
{t:'page'},

{t:'h1', num:'CHAPTER 4', text:'Fourier series'},
{t:'p', lead:true, text:'Fourier series are used to find the response of a linear time-invariant (LTI) system to a periodic signal. An LTI system returns each complex exponential in the same form and multiplies it by one complex number. Once a periodic signal is written as a sum of these exponentials, convolution becomes one multiplication for each harmonic. The chapter has two central equations: the synthesis equation, which builds the signal from its coefficients, and the analysis equation, which finds the coefficients from the signal.'},
{t:'eqbox', cap:'The chapter in two lines',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0t}\\qquad\\text{(synthesis)}',
      'a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0t}\\,\\d t\\qquad\\text{(analysis)}'],
 after:'The frequency response of a system states how it changes each frequency. Multiply each input coefficient by the frequency response at its harmonic to obtain the output coefficient.'},

/* ================================================================ 4.1 */
{t:'h2', num:'4.1', text:'The eigenfunction property'},
{t:'p', text:'This section shows why complex exponentials are the building blocks of LTI analysis. The result is short, and the rest of the chapter depends on it.'},
{t:'box', hd:'Definition', html:'A signal is an <b>eigenfunction</b> of a system when the output is that same signal multiplied by a constant. The constant is the <b>eigenvalue</b>.'},
{t:'h3', text:'Continuous time'},
{t:'p', text:'Put $x(t)=e^{st}$, with $s$ any complex number, into the convolution integral, whose limits are $-\\infty$ and $\\infty$. Then split the exponential with $e^{s(t-\\tau)}=e^{st}e^{-s\\tau}$. The factor $e^{st}$ does not depend on $\\tau$, so it moves outside the integral.'},
{t:'eq', tex:'\\begin{aligned}y(t)&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{s(t-\\tau)}\\,\\d\\tau\\\\&=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{st}e^{-s\\tau}\\,\\d\\tau\\\\&=e^{st}\\underbrace{\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau}_{H(s)}.\\end{aligned}'},
{t:'p', text:'The integral that remains does not depend on $t$. It is one complex number for each value of $s$. We call it $H(s)$, the eigenvalue of the system for the eigenfunction $e^{st}$.'},
{t:'h3', text:'Discrete time'},
{t:'p', text:'The same steps apply in discrete time. Put $x[n]=z^{n}$, with $z$ any complex number, into the convolution sum and use $z^{n-k}=z^{n}z^{-k}$. The factor $z^{n}$ does not depend on $k$, so it moves outside the sum.'},
{t:'eq', tex:'\\begin{aligned}y[n]&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,x[n-k]\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{n-k}\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{n}z^{-k}\\\\&=z^{n}\\underbrace{\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}}_{H(z)}.\\end{aligned}'},
{t:'eqbox', cap:'Eigenfunction property',
 tex:['e^{st}\\;\\to\\;h(t)\\;\\to\\;H(s)\\,e^{st},\\qquad H(s)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,e^{-s\\tau}\\,\\d\\tau',
      'z^{n}\\;\\to\\;h[n]\\;\\to\\;H(z)\\,z^{n},\\qquad H(z)=\\sum_{k=-\\infty}^{\\infty}h[k]\\,z^{-k}'],
 after:'Keep the two statements apart. The discrete-time output is a sequence, $y[n]=H(z)\\,z^{n}$. A discrete-time line contains no $t$ and no $s$.'},
{t:'fig', svg:()=>P.blocks({w:700,h:170,items:[
  {t:'arrow',x1:60,y1:60,x2:250,y2:60},{t:'box',x:250,y:36,w:150,h:48,label:'h(t)',tex:true},
  {t:'arrow',x1:400,y1:60,x2:600,y2:60},
  {t:'text',x:150,y:48,label:'e^{st}',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:500,y:48,label:'H(s)e^{st}',tex:true,fs:15,color:'#4A7A46'},
  {t:'arrow',x1:60,y1:135,x2:250,y2:135},{t:'box',x:250,y:111,w:150,h:48,label:'h[n]',tex:true},
  {t:'arrow',x1:400,y1:135,x2:600,y2:135},
  {t:'text',x:150,y:123,label:'z^{n}',tex:true,fs:15,color:'#14707F'},
  {t:'text',x:500,y:123,label:'H(z)z^{n}',tex:true,fs:15,color:'#4A7A46'}
]}), cap:'The continuous-time and the discrete-time statements, side by side.'},
{t:'p', text:'Set $s=j\\omega$ and $z=e^{j\\omega}$ with $\\omega$ real. This gives the two <b>frequency responses</b>, $H(j\\omega)$ in rad/s and $H(e^{j\\omega})$ in rad/sample. Each one states what the system does to the complex exponential of frequency $\\omega$. The discrete-time frequency response repeats every $2\\pi$ in $\\omega$, because $k$ is an integer and so $e^{-j2\\pi k}=1$:'},
{t:'eq', tex:'\\begin{aligned}H\\bigl(e^{j(\\omega+2\\pi)}\\bigr)&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,e^{-j(\\omega+2\\pi)k}\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,e^{-j\\omega k}\\,e^{-j2\\pi k}\\\\&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,e^{-j\\omega k}=H(e^{j\\omega}).\\end{aligned}'},
{t:'p', text:'The continuous-time frequency response has no such rule, because $\\tau$ is not restricted to integers.'},

{t:'ex', hd:'Example 4.1 — a cosine through $h(t)=e^{-t}u(t)$', rows:[
 ['Given','An LTI system with $h(t)=e^{-t}u(t)$ and the input $x(t)=\\cos 2t$.'],
 ['Find','The output, and whether $\\cos 2t$ is an eigenfunction of this system.'],
 ['Method','A cosine is not itself a complex exponential. Write it as two exponentials with Euler’s relation, $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$. Each exponential is an eigenfunction, so multiply it by its own eigenvalue and add the two results.'],
 ['Solution','First the frequency response. Substitute $h$ into the definition. The step $u(\\tau)$ makes the lower limit zero, and the two exponentials combine into one: $$\\begin{aligned}H(j\\omega)&=\\int_{-\\infty}^{\\infty}e^{-\\tau}u(\\tau)\\,e^{-j\\omega\\tau}\\,\\d\\tau=\\int_{0}^{\\infty}e^{-(1+j\\omega)\\tau}\\,\\d\\tau\\\\&=\\left[\\frac{e^{-(1+j\\omega)\\tau}}{-(1+j\\omega)}\\right]_{0}^{\\infty}=\\frac{0-1}{-(1+j\\omega)}=\\frac{1}{1+j\\omega}.\\end{aligned}$$ The upper limit gives zero because $|e^{-(1+j\\omega)\\tau}|=e^{-\\tau}\\to0$. At $\\omega=2$ rad/s, $H(j2)=1/(1+j2)$. Its magnitude is $1/\\sqrt{1+2^{2}}=1/\\sqrt5=0.447$ and its phase is $-\\arctan2=-1.107$ rad. At $\\omega=-2$, $H(-j2)=1/(1-j2)$, which is the conjugate: $0.447\\,e^{+j1.107}$. Now send each half of the cosine through the system: $$\\begin{aligned}\\cos 2t&=\\tfrac12e^{j2t}+\\tfrac12e^{-j2t}\\\\&\\to\\tfrac12H(j2)\\,e^{j2t}+\\tfrac12H(-j2)\\,e^{-j2t}\\\\&=\\tfrac12(0.447)\\,e^{j(2t-1.107)}+\\tfrac12(0.447)\\,e^{-j(2t-1.107)}\\\\&=0.447\\cos(2t-1.107).\\end{aligned}$$ The last line uses $e^{j\\theta}+e^{-j\\theta}=2\\cos\\theta$. The output has the input frequency. Only the amplitude and the phase change. The output is not a constant times $\\cos 2t$, because of the phase $-1.107$ rad. So $\\cos 2t$ is not an eigenfunction of this system. The two exponentials $e^{j2t}$ and $e^{-j2t}$ are.'],
 ['Check','Evaluate the convolution directly at $t=0$: $y(0)=\\int_0^{\\infty}e^{-\\tau}\\cos(-2\\tau)\\,\\d\\tau=\\operatorname{Re}\\int_0^{\\infty}e^{-(1-j2)\\tau}\\,\\d\\tau=\\operatorname{Re}\\frac{1}{1-j2}=\\operatorname{Re}\\frac{1+j2}{5}=0.2$. The formula gives $0.447\\cos(-1.107)=0.447\\times0.447=0.2$, since $\\cos(\\arctan2)=1/\\sqrt5$.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[0,8],yr:[-1.3,1.6],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
  a.curve(t=>Math.cos(2*t),{color:C.in,dash:'9 6',n:900});
  a.curve(t=>Math.cos(2*t-Math.atan(2))/Math.sqrt(5),{color:C.out,n:900});
  return a.svg();},
 cap:'The input $\\cos 2t$ (dashed) and the output $0.447\\cos(2t-1.107)$ (solid) of Example 4.1. The frequency stays; the amplitude and the phase change.'},

{t:'ex', hd:'Example 4.2 — a cosine sequence through the two-point average', rows:[
 ['Given','The system $y[n]=\\tfrac12x[n]+\\tfrac12x[n-1]$, with the inputs $x[n]=\\cos(2\\pi n/3)$ and $x[n]=(-1)^{n}$.'],
 ['Find','Both outputs.'],
 ['Method','The impulse response is $h[n]=\\tfrac12\\delta[n]+\\tfrac12\\delta[n-1]$. Find $H(e^{j\\omega})$ from the definition. Write the cosine as two exponentials. Write $(-1)^{n}$ as $z^{n}$ with $z=-1$.'],
 ['Solution','Only $k=0$ and $k=1$ contribute to the sum. Factor out $e^{-j\\omega/2}$ and use $e^{j\\theta}+e^{-j\\theta}=2\\cos\\theta$: $$\\begin{aligned}H(e^{j\\omega})&=\\sum_{k=-\\infty}^{\\infty}h[k]\\,e^{-j\\omega k}=\\tfrac12+\\tfrac12e^{-j\\omega}\\\\&=\\tfrac12e^{-j\\omega/2}\\bigl(e^{j\\omega/2}+e^{-j\\omega/2}\\bigr)=e^{-j\\omega/2}\\cos(\\omega/2).\\end{aligned}$$ At $\\omega=2\\pi/3$ rad/sample, $\\cos(\\pi/3)=\\tfrac12$, so $H(e^{j2\\pi/3})=\\tfrac12e^{-j\\pi/3}$ and $H(e^{-j2\\pi/3})=\\tfrac12e^{+j\\pi/3}$. Then $$\\begin{aligned}\\cos\\!\\left(\\tfrac{2\\pi n}{3}\\right)&=\\tfrac12e^{j2\\pi n/3}+\\tfrac12e^{-j2\\pi n/3}\\\\&\\to\\tfrac12\\cdot\\tfrac12e^{-j\\pi/3}e^{j2\\pi n/3}+\\tfrac12\\cdot\\tfrac12e^{j\\pi/3}e^{-j2\\pi n/3}\\\\&=\\tfrac12\\cos\\!\\left(\\tfrac{2\\pi n}{3}-\\tfrac{\\pi}{3}\\right).\\end{aligned}$$ For the second input, $(-1)^{n}=z^{n}$ with $z=-1$. The eigenvalue is $H(-1)=\\tfrac12+\\tfrac12(-1)^{-1}=\\tfrac12-\\tfrac12=0$, so $y[n]=0$ for every $n$.'],
 ['Check','Apply the rule directly at $n=0$: $y[0]=\\tfrac12\\cos0+\\tfrac12\\cos(-2\\pi/3)=\\tfrac12-\\tfrac14=\\tfrac14$. The formula gives $\\tfrac12\\cos(-\\pi/3)=\\tfrac14$. For $(-1)^{n}$ the rule gives $\\tfrac12(-1)^{n}+\\tfrac12(-1)^{n-1}=0$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-1,13],yr:[-1.3,1.45],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>Math.cos(2*Math.PI*n/3),-1,13),{color:C.in,r:3}); return a.svg();},
  cap:'The input $x[n]=\\cos(2\\pi n/3)$.'},
 {svg:()=>{const a=ax2({xr:[-1,13],yr:[-1.3,1.45],xlabel:'n',ylabel:'y[n]'});
   a.stem(D(n=>0.5*Math.cos(2*Math.PI*n/3-Math.PI/3),-1,13),{color:C.out,r:3}); return a.svg();},
  cap:'The output $\\tfrac12\\cos(2\\pi n/3-\\pi/3)$: the same frequency.'}
]},

{t:'h3', text:'A sum of eigenfunctions'},
{t:'p', text:'Now let the input be a sum of complex exponentials, $x(t)=\\sum_k a_k e^{s_kt}$. The system is linear, so each term passes through on its own and the outputs add. The eigenfunction property multiplies term $k$ by $H(s_k)$:'},
{t:'eqbox', cap:'Superposition of eigenfunctions',
 tex:['x(t)=\\sum_{k}a_k\\,e^{s_kt}\\;\\longrightarrow\\;y(t)=\\sum_{k}a_k\\,H(s_k)\\,e^{s_kt}',
      'x[n]=\\sum_{k}a_k\\,z_k^{\\,n}\\;\\longrightarrow\\;y[n]=\\sum_{k}a_k\\,H(z_k)\\,z_k^{\\,n}'],
 after:'No convolution is needed. The output needs one multiplication for each term. For example, $x(t)=2e^{jt}+e^{j3t}$ with $H(j1)=0.5$ and $H(j3)=0$ gives $y(t)=2(0.5)\\,e^{jt}+1(0)\\,e^{j3t}=e^{jt}$.'},
{t:'fig', svg:()=>{const items=[];
  [1,2,3].forEach((i,j)=>{const y=34+j*56;
    items.push({t:'text',x:70,y:y+6,label:'a_'+i+'e^{s_'+i+'t}',anchor:'start',tex:true,fs:15,color:'#14707F'},
      {t:'arrow',x1:170,y1:y,x2:280,y2:y},{t:'box',x:280,y:y-20,w:110,h:40,label:'H(s)',tex:true},
      {t:'arrow',x1:390,y1:y,x2:470,y2:y},
      {t:'text',x:480,y:y+6,label:'a_'+i+'H(s_'+i+')e^{s_'+i+'t}',anchor:'start',tex:true,fs:15,color:'#4A7A46'});});
  return P.blocks({w:700,h:180,items});},
 cap:'Each exponential passes through the system on its own. Superposition then adds the three outputs.'},

{t:'ex', hd:'Example 4.3 — a pure delay', rows:[
 ['Given','An LTI system with $y(t)=x(t-3)$.'],
 ['Find','The output for $x(t)=e^{j2t}$, and for $x(t)=\\cos4t+\\cos7t$, using eigenfunctions only.'],
 ['Method','The inputs are complex exponentials or sums of them, so the eigenfunction method applies. Write $h(t)$ from the rule, find $H(s)$ from the definition, and multiply each exponential by its own eigenvalue.'],
 ['Solution','A delay by 3 s is convolution with $\\delta(t-3)$, because $x(t)*\\delta(t-3)=x(t-3)$. So $h(t)=\\delta(t-3)$. Put this into the definition of $H(s)$. The sifting property replaces $\\tau$ by $3$ in the exponential: $$H(s)=\\int_{-\\infty}^{\\infty}\\delta(\\tau-3)\\,e^{-s\\tau}\\,\\d\\tau=e^{-3s}.$$ For $x(t)=e^{j2t}$ the exponent gives $s=j2$, so $$y(t)=H(j2)\\,e^{j2t}=e^{-j6}e^{j2t}=e^{j2(t-3)}.$$ For the cosines, first write each one as two exponentials with Euler’s relation. Then multiply each exponential by its own eigenvalue. For $\\cos4t$ the two values of $s$ are $\\pm j4$, with $H(j4)=e^{-j12}$ and $H(-j4)=e^{+j12}$: $$\\begin{aligned}\\cos4t&=\\tfrac12e^{j4t}+\\tfrac12e^{-j4t}\\\\&\\to\\tfrac12e^{-j12}e^{j4t}+\\tfrac12e^{j12}e^{-j4t}\\\\&=\\tfrac12e^{j4(t-3)}+\\tfrac12e^{-j4(t-3)}\\\\&=\\cos\\bigl(4(t-3)\\bigr).\\end{aligned}$$ The same steps with $s=\\pm j7$ and $H(\\pm j7)=e^{\\mp j21}$ give $\\cos\\bigl(7(t-3)\\bigr)$. The system is linear, so the two outputs add: $$y(t)=\\cos\\bigl(4(t-3)\\bigr)+\\cos\\bigl(7(t-3)\\bigr).$$'],
 ['Check','Apply $y(t)=x(t-3)$ directly to both inputs. The answers agree. Note also that $|H(j\\omega)|=|e^{-j3\\omega}|=1$ and $\\angle H(j\\omega)=-3\\omega$. A delay changes no amplitude. It adds a phase proportional to frequency: at $\\omega=2$ rad/s the phase lag is $2\\times3=6$ rad.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-1,9],yr:[-1.3,1.6],xlabel:'t',ylabel:'\\text{amplitude}'});
   a.curve(t=>Math.cos(2*t),{color:C.in,dash:'9 6',n:900});
   a.curve(t=>Math.cos(2*(t-3)),{color:C.out,n:900}); return a.svg();},
  cap:'$\\cos 2t$ (dashed) and $\\cos\\bigl(2(t-3)\\bigr)$ (solid).'},
 {svg:()=>{const a=ax2({xr:[-1,8],yr:[-2.4,2.4],xlabel:'t',ylabel:'\\text{amplitude}'});
   a.curve(t=>Math.cos(4*t)+Math.cos(7*t),{color:C.in,dash:'6 5',n:1600,opacity:.6});
   a.curve(t=>Math.cos(4*(t-3))+Math.cos(7*(t-3)),{color:C.out,n:1600}); return a.svg();},
  cap:'$x(t)=\\cos4t+\\cos7t$ (dashed) and the delayed output (solid).'}
]},
{t:'p', text:'The next task is to write a signal as a sum of complex exponentials. For a periodic signal, the rest of this chapter does exactly that. A sinusoid is the one input whose form an LTI system keeps, so one complex number at each frequency describes the whole system.'},

/* ================================================================ 4.2 */
{t:'h2', num:'4.2', text:'Synthesis and analysis'},
{t:'h3', text:'Which periodic signals have a series'},
{t:'p', text:'Not every periodic signal can be written as a sum of complex exponentials. The following three conditions guarantee that it can. Let $x(t)=x(t+T_0)$ for every $t$.'},
{t:'ol', items:[
 'Over one period, $x$ is absolutely integrable: $\\int_{T_0}|x(t)|\\,\\d t<\\infty$.',
 'In any finite interval, $x$ has only a finite number of maxima and minima.',
 'In any finite interval, $x$ has only a finite number of jumps, and each jump is finite.'
]},
{t:'box', kind:'ok', hd:'Sufficient, not necessary', html:'These are the <b>Dirichlet conditions</b>. A signal that meets all three has a Fourier series. The series equals $x(t)$ wherever $x$ is continuous. At a jump it equals the midpoint of the jump. A signal that fails one condition may still have a series: the conditions guarantee, they do not exclude.'},
{t:'p', text:'The three conditions test different things. Each signal below has period 1 or 4, meets the earlier conditions and fails one. The signal $x(t)=1/t$ for $0<t\\le1$ fails the first, because $\\int_0^1 \\d t/t$ diverges. The signal $\\sin(2\\pi/t)$ for $0<t\\le1$ has $|x|\\le1$, so its area is finite, but it oscillates infinitely often near $t=0$: it fails only the second. A staircase whose steps halve in height and in width fails only the third. Its area over one period is $2+\\tfrac12+\\tfrac18+\\dots=2/(1-\\tfrac14)=8/3$, which is finite, but it has infinitely many jumps. Every signal in this chapter, including square waves, sawtooths, impulse trains and sums of sinusoids, meets all three conditions.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax3({xr:[0,3.2],yr:[-0.3,3.3],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>{const u=t-Math.floor(t);return u<1e-4?NaN:1/u;},{color:C.err,n:4000}); return a.svg();},
  cap:'$1/t$: condition 1 fails.'},
 {svg:()=>{const a=ax3({xr:[0,3.2],yr:[-1.4,1.6],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>{const u=t-Math.floor(t);return u<1e-4?0:Math.sin(2*Math.PI/u);},{color:C.err,n:6000}); return a.svg();},
  cap:'$\\sin(2\\pi/t)$: condition 2 fails.'},
 {svg:()=>{const a=ax3({xr:[0,8.4],yr:[-0.2,1.4],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>{let u=t-4*Math.floor(t/4),h=1,wd=2;for(let i=0;i<12;i++){if(u<wd)return h;h/=2;u-=wd;wd/=2;}return 0;},{color:C.err,n:6000}); return a.svg();},
  cap:'Halving steps: condition 3 fails.'}
]},

{t:'h3', text:'The synthesis equation'},
{t:'eqbox', cap:'Synthesis equation',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0t},\\qquad \\omega_0=\\frac{2\\pi}{T_0}'],
 after:'$T_0$ is the fundamental period in seconds and $\\omega_0$ is the fundamental frequency in rad/s. The term $e^{jk\\omega_0t}$ is the $k$-th <b>harmonic</b>. The complex numbers $a_k$ are the <b>Fourier series coefficients</b>: $|a_k|$ is the amplitude of the $k$-th harmonic and $\\angle a_k$ is its phase.'},
{t:'p', text:'Every harmonic repeats with the period $T_0$, so the sum does too. Replace $t$ by $t+T_0$ and use $\\omega_0T_0=2\\pi$:'},
{t:'eq', tex:'e^{jk\\omega_0(t+T_0)}=e^{jk\\omega_0t}\\,e^{jk\\omega_0T_0}=e^{jk\\omega_0t}\\,e^{jk2\\pi}=e^{jk\\omega_0t}.'},
{t:'p', text:'When a signal is already a sum of sinusoids, the coefficients can be read off. Find $T_0$, then $\\omega_0=2\\pi/T_0$. Write each sinusoid with Euler’s relations, $\\cos\\theta=\\tfrac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\tfrac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$. Match each exponent with $jk\\omega_0t$ and read off $k$. The first step needs the period of a sum.'},

{t:'h3', text:'Fundamental period of a sum'},
{t:'p', text:'A sum of periodic signals is periodic when each component period is a rational multiple of every other. Its period $T_0$ is the smallest positive time that is a whole number of each component period. Write each component period as a fraction $p_i/q_i$ in lowest terms. A constant term has no period and is left out.'},
{t:'eqbox', cap:'Period of a sum',
 tex:['T_0=\\operatorname{LCM}\\!\\left(\\frac{p_1}{q_1},\\frac{p_2}{q_2},\\dots\\right)=\\frac{\\operatorname{LCM}(p_1,p_2,\\dots)}{\\operatorname{GCD}(q_1,q_2,\\dots)}'],
 after:'The result is a least common multiple of fractions, so it need not be an integer.'},
{t:'p', text:'The rule follows in two steps. Write $L=\\operatorname{LCM}(p_1,p_2,\\dots)$ and $G=\\operatorname{GCD}(q_1,q_2,\\dots)$. First, $L/G$ is a common period. Divide it by the period $p_i/q_i$:'},
{t:'eq', tex:'\\frac{L/G}{p_i/q_i}=\\frac{L}{p_i}\\cdot\\frac{q_i}{G}.'},
{t:'p', text:'Both factors are whole numbers, because $p_i$ divides $L$ and $G$ divides $q_i$. Second, no common period is smaller. Let $T=r/s$, in lowest terms, be any common period. Then $T/(p_i/q_i)=rq_i/(sp_i)$ is a whole number for every $i$. The number $p_i$ shares no factor with $q_i$, so $p_i$ divides $r$. This holds for every $i$, so $L$ divides $r$ and $r\\ge L$. The number $s$ shares no factor with $r$, so $s$ divides $q_i$. This holds for every $i$, so $s$ divides $G$ and $s\\le G$. Therefore $T=r/s\\ge L/G$.'},
{t:'ex', hd:'Example 4.4 — four fundamental periods', rows:[
 ['Given','Sums of periodic components with these periods, in seconds: (a) $1$ and $\\tfrac23$; (b) $\\tfrac35$ and $\\tfrac85$; (c) $2$, $1$ and $\\tfrac23$; (d) $\\tfrac29$ and $\\tfrac{8}{21}$.'],
 ['Find','The fundamental period of each sum.'],
 ['Method','Write each period in lowest terms. Divide the least common multiple of the numerators by the greatest common divisor of the denominators. Then divide $T_0$ by each period.'],
 ['Solution','$$\\begin{aligned}\\text{(a)}\\quad&\\tfrac11,\\ \\tfrac23:&T_0&=\\frac{\\operatorname{LCM}(1,2)}{\\operatorname{GCD}(1,3)}=\\frac21=2\\ \\text{s},\\\\\\text{(b)}\\quad&\\tfrac35,\\ \\tfrac85:&T_0&=\\frac{\\operatorname{LCM}(3,8)}{\\operatorname{GCD}(5,5)}=\\frac{24}{5}\\ \\text{s},\\\\\\text{(c)}\\quad&\\tfrac21,\\ \\tfrac11,\\ \\tfrac23:&T_0&=\\frac{\\operatorname{LCM}(2,1,2)}{\\operatorname{GCD}(1,1,3)}=\\frac21=2\\ \\text{s},\\\\\\text{(d)}\\quad&\\tfrac29,\\ \\tfrac{8}{21}:&T_0&=\\frac{\\operatorname{LCM}(2,8)}{\\operatorname{GCD}(9,21)}=\\frac83\\ \\text{s}.\\end{aligned}$$ In (d), $\\operatorname{GCD}(9,21)=3$ because $9=3^{2}$ and $21=3\\cdot7$.'],
 ['Check','Divide $T_0$ by each period. (a) $2\\div1=2$ and $2\\div\\tfrac23=3$. (b) $\\tfrac{24}{5}\\div\\tfrac35=8$ and $\\tfrac{24}{5}\\div\\tfrac85=3$. (c) $1$, $2$ and $3$. (d) $\\tfrac83\\div\\tfrac29=12$ and $\\tfrac83\\div\\tfrac{8}{21}=7$. Every quotient is a whole number. In each case the quotients share no common factor, so $T_0$ divided by any whole number greater than 1 is no longer a common period.']
]},
{t:'box', kind:'err', hd:'Divide by the GCD', html:'For $\\tfrac29$ and $\\tfrac{8}{21}$, dividing by $\\operatorname{LCM}(9,21)=63$ instead of the GCD gives $\\tfrac{8}{63}$. It is not a multiple of either period: $\\tfrac{8}{63}\\div\\tfrac29=\\tfrac47$. Always divide the answer by each period and confirm that the results are whole numbers.'},
{t:'fig', svg:()=>{const a=ax({xr:[-0.1,3],yr:[-2.4,3.1],xlabel:'t',ylabel:'\\text{sum}',xtarget:7});
  a.curve(t=>Math.cos(2*Math.PI*t/(2/9))+Math.cos(2*Math.PI*t/(8/21)),{color:C.out,n:4000});
  a.vline(0,{color:C.coral}); a.vline(8/3,{color:C.coral});
  a.span(0,8/3,2.65,'T_0=8/3',{color:C.coral,fs:14,tex:true}); return a.svg();},
 cap:'Two cosines of periods $2/9$ s and $8/21$ s, added. The sum first repeats after $8/3$ s: twelve cycles of the first and seven of the second.'},

{t:'ex', hd:'Example 4.5 — reading off the coefficients', rows:[
 ['Given','$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$.'],
 ['Find','Every Fourier series coefficient, with its magnitude and phase.'],
 ['Method','Find $T_0$, hence $\\omega_0$. Expand with Euler’s relations and match each exponent with $jk\\omega_0t$.'],
 ['Solution','First the period. $\\cos(2\\pi t)$ repeats every $2\\pi/(2\\pi)=1$ s and $\\sin(3\\pi t)$ every $2\\pi/(3\\pi)=2/3$ s. This is case (a) of Example 4.4, so $T_0=2$ s and $\\omega_0=2\\pi/T_0=\\pi$ rad/s. Now expand each sinusoid with Euler’s relations: $$\\begin{aligned}\\tfrac12\\cos(2\\pi t)&=\\tfrac12\\cdot\\tfrac12\\bigl(e^{j2\\pi t}+e^{-j2\\pi t}\\bigr)=\\tfrac14e^{j2\\pi t}+\\tfrac14e^{-j2\\pi t},\\\\\\sin(3\\pi t)&=\\tfrac{1}{2j}\\bigl(e^{j3\\pi t}-e^{-j3\\pi t}\\bigr)=\\tfrac{1}{2j}e^{j3\\pi t}-\\tfrac{1}{2j}e^{-j3\\pi t}.\\end{aligned}$$ Match each exponent with $jk\\omega_0t=jk\\pi t$. Here $2\\pi t=2\\omega_0t$, so $k=\\pm2$, and $3\\pi t=3\\omega_0t$, so $k=\\pm3$. The constant is $1\\cdot e^{j0\\omega_0t}$, so $k=0$. Collecting the terms, $$\\begin{aligned}x(t)&=\\underbrace{1}_{k=0}+\\underbrace{\\tfrac14e^{j2\\omega_0t}+\\tfrac14e^{-j2\\omega_0t}}_{k=\\pm2}\\\\&\\quad+\\underbrace{\\tfrac{1}{2j}e^{j3\\omega_0t}-\\tfrac{1}{2j}e^{-j3\\omega_0t}}_{k=\\pm3},\\end{aligned}$$ so $a_0=1$, $a_{\\pm2}=\\tfrac14$, $a_3=\\tfrac{1}{2j}$, $a_{-3}=-\\tfrac{1}{2j}$, and every other coefficient is zero.'],
 ['Check','$a_0=1$ is also the average of the signal: both sinusoids complete whole cycles in one period and average to zero, which leaves the constant. Magnitudes: $|a_0|=1$, $|a_{\\pm2}|=\\tfrac14$, $|a_{\\pm3}|=\\tfrac12$. Phases: $\\tfrac{1}{2j}=-\\tfrac{j}{2}$, so $\\angle a_3=-\\pi/2$, and $a_{-3}=+\\tfrac{j}{2}$, so $\\angle a_{-3}=+\\pi/2$. The signal is real, so the magnitudes must be even in $k$ and the phases odd, and they are.']
]},
{t:'box', kind:'err', hd:'The constant is a harmonic', html:'The constant $1$ is the $k=0$ term, $1\\cdot e^{j0\\omega_0t}$. So $a_0=1$, not $0$. It is the average of $x$ over one period.'},
{t:'fig', svg:()=>{const a=ax({xr:[-4,4],yr:[-1.1,3.3],xlabel:'t',ylabel:'x(t)',xtarget:9});
  a.curve(t=>1+0.5*Math.cos(2*Math.PI*t)+Math.sin(3*Math.PI*t),{color:C.in,n:2000});
  a.span(1.5,3.5,2.8,'T_0=2',{color:C.coral,fs:14,tex:true}); return a.svg();},
 cap:'$x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$: a constant and two sinusoids, with period $T_0=2$ s.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-4.5,4.5],yr:[-0.15,1.25],xlabel:'k',ylabel:'|a_k|'});
   a.stem(D(k=>k===0?1:(Math.abs(k)===2?0.25:(Math.abs(k)===3?0.5:0)),-4,4),{color:C.in,showZero:true}); return a.svg();},
  cap:'Magnitudes, even in $k$.'},
 {svg:()=>{const a=ax2({xr:[-4.5,4.5],yr:[-2.0,2.0],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',yticksOverride:PI2,ytickfmt:v=>v.toFixed(2)});
   a.stem(D(k=>k===3?-Math.PI/2:(k===-3?Math.PI/2:0),-4,4),{color:C.mid,showZero:true}); return a.svg();},
  cap:'Phases, odd in $k$. A value of $\\pm1.57$ rad is $\\pm\\pi/2$.'}
]},

{t:'h3', text:'The analysis equation'},
{t:'p', text:'Reading coefficients off works only for a sum of sinusoids. Every other periodic signal needs a formula.'},
{t:'eqbox', cap:'Analysis equation',
 tex:['a_k=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-jk\\omega_0t}\\,\\d t,\\qquad \\omega_0=\\frac{2\\pi}{T_0}'],
 after:'$\\int_{T_0}$ means an integral over any one period. The integrand $x(t)e^{-jk\\omega_0t}$ is a product of two factors of period $T_0$, so it repeats with period $T_0$, and every interval of length $T_0$ gives the same value. Synthesis uses $e^{+jk\\omega_0t}$ and analysis uses $e^{-jk\\omega_0t}$, with the same $\\omega_0$. The sign of the exponent is the only thing that separates the pair.'},
{t:'p', text:'To prove the analysis equation, isolate one coefficient, $a_n$. Multiply both sides of the synthesis equation by $e^{-jn\\omega_0t}$ and integrate over one period. The sum and the integral can be exchanged, and $a_k$ does not depend on $t$, so it moves outside the integral. The two exponentials combine because $e^{jk\\omega_0t}e^{-jn\\omega_0t}=e^{j(k-n)\\omega_0t}$.'},
{t:'eq', tex:'\\begin{aligned}\\int_{T_0}x(t)\\,e^{-jn\\omega_0t}\\,\\d t&=\\int_{T_0}\\Bigl(\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\Bigr)e^{-jn\\omega_0t}\\,\\d t\\\\&=\\sum_{k=-\\infty}^{\\infty}a_k\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t.\\end{aligned}'},
{t:'p', text:'Now evaluate the inner integral from $-T_0/2$ to $T_0/2$. Put $m=k-n$, an integer, and take $m\\neq0$ first, so that the antiderivative may divide by $m$. At the limits $\\omega_0T_0/2=\\pi$. The difference of the two exponentials is $2j$ times a sine, by $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$.'},
{t:'eq', tex:'\\begin{aligned}\\int_{-T_0/2}^{T_0/2}e^{jm\\omega_0t}\\,\\d t&=\\left[\\frac{e^{jm\\omega_0t}}{jm\\omega_0}\\right]_{-T_0/2}^{T_0/2}\\\\&=\\frac{e^{jm\\pi}-e^{-jm\\pi}}{jm\\omega_0}\\\\&=\\frac{2j\\sin(m\\pi)}{jm\\omega_0}=\\frac{2\\sin(m\\pi)}{m\\omega_0}=0,\\qquad m\\neq0.\\end{aligned}'},
{t:'p', text:'The value is zero because the sine of a whole multiple of $\\pi$ is zero. For $m=0$ the integrand is the constant 1, and the integral is the length of the period: $\\int_{-T_0/2}^{T_0/2}1\\,\\d t=T_0$.'},
{t:'eqbox', cap:'Orthogonality of complex exponentials',
 tex:['\\int_{T_0}e^{j(k-n)\\omega_0t}\\,\\d t=\\begin{cases}T_0,&k=n\\\\0,&k\\neq n\\end{cases}'],
 after:'Only the term with $k=n$ survives in the sum, so $\\int_{T_0}x(t)\\,e^{-jn\\omega_0t}\\,\\d t=T_0\\,a_n$. Divide both sides by $T_0$ and rename $n$ as $k$. This is the analysis equation.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-0.75,0.75],yr:[-1.2,1.35],xlabel:'t',ylabel:'\\text{product}'});
   const g=t=>Math.cos(2*Math.PI*t)*Math.cos(4*Math.PI*t);
   a.area(g,-0.5,0.5,{color:'rgba(106,90,146,.20)'}); a.curve(g,{color:C.mid,n:1200});
   a.vline(-0.5,{color:C.coral,dash:'4 4'}); a.vline(0.5,{color:C.coral,dash:'4 4'}); return a.svg();},
  cap:'$\\cos(2\\pi t)\\cos(4\\pi t)$: two different harmonics of $T_0=1$. The lobes cancel and the area over one period is $0$.'},
 {svg:()=>{const a=ax2({xr:[-0.75,0.75],yr:[-1.2,1.35],xlabel:'t',ylabel:'\\text{product}'});
   const g=t=>Math.cos(2*Math.PI*t)**2;
   a.area(g,-0.5,0.5,{color:'rgba(74,122,70,.22)'}); a.curve(g,{color:C.out,n:1200});
   a.vline(-0.5,{color:C.coral,dash:'4 4'}); a.vline(0.5,{color:C.coral,dash:'4 4'}); return a.svg();},
  cap:'$\\cos^{2}(2\\pi t)$: a harmonic times itself never goes negative. The area over one period is $\\tfrac12$.'}
]},
{t:'p', text:'Two short consequences. If $x(t)=e^{j3\\omega_0t}$, the analysis integral is $T_0$ at $k=3$ and zero otherwise, so $a_3=1$ and every other coefficient is zero. And with $T_0=1$, so $\\omega_0=2\\pi$, the integral $\\int_0^1e^{j2\\pi t}e^{-j6\\pi t}\\,\\d t$ has $m=1-3=-2\\neq0$, so it is zero.'},

{t:'h3', text:'The DC coefficient'},
{t:'eqbox', cap:'DC coefficient',
 tex:['a_0=\\frac{1}{T_0}\\int_{T_0}x(t)\\,\\d t'],
 after:'Put $k=0$ in the analysis equation, so that $e^{0}=1$. The coefficient $a_0$ is the average value of $x$ over one period.'},
{t:'p', text:'Find the average from the graph before any other coefficient. A formula for $a_k$ must agree with it at $k=0$. A wave that is 1 for half of each period and 0 for the other half has $a_0=\\tfrac12$. A sawtooth that is odd about the middle of each period has $a_0=0$. For $x(t)=3+\\cos2t$ the period is $T_0=2\\pi/2=\\pi$ s, and'},
{t:'eq', tex:'a_0=\\frac{1}{\\pi}\\int_0^{\\pi}\\bigl(3+\\cos2t\\bigr)\\,\\d t=\\frac{1}{\\pi}\\Bigl[3t+\\tfrac12\\sin2t\\Bigr]_0^{\\pi}=\\frac{1}{\\pi}\\bigl(3\\pi+0-0\\bigr)=3.'},
{t:'box', kind:'warn', hd:'Zero frequency is a harmonic', html:'The $k=0$ term is the constant $a_0$. Dropping it shifts the whole reconstruction by the average value.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.9,1.5],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000});
   a.hline(0.5,{color:C.coral,dash:'4 5'}); a.note(2.1,1.25,'a_0=1/2',{anchor:'end',color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'On for half of each period: $a_0=\\tfrac12$.'},
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.9,1.5],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>sawWave(t,1),{color:C.in,n:3000});
   a.hline(0,{color:C.coral,dash:'4 5'}); a.note(2.1,1.25,'a_0=0',{anchor:'end',color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'A sawtooth, odd about the middle of each period: $a_0=0$.'}
]},

{t:'h3', text:'Real signals: cosine and sine forms'},
{t:'p', text:'A real signal can be written with real functions only. The first step is a symmetry of the coefficients. For real $x$, conjugate the analysis equation. The conjugate of $x(t)$ is $x(t)$, and the conjugate of $e^{-jk\\omega_0t}$ is $e^{+jk\\omega_0t}$:'},
{t:'eq', tex:'a_k^{*}=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{+jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\int_{T_0}x(t)\\,e^{-j(-k)\\omega_0t}\\,\\d t=a_{-k}.'},
{t:'p', text:'So $a_{-k}=a_k^{*}$. Now split the synthesis sum into $k=0$, $k>0$ and $k<0$, and pair each $k$ with $-k$. A number plus its conjugate is twice its real part, $z+z^{*}=2\\operatorname{Re}\\{z\\}$:'},
{t:'eq', tex:'\\begin{aligned}x(t)&=a_0+\\sum_{k=1}^{\\infty}\\bigl(a_ke^{jk\\omega_0t}+a_{-k}e^{-jk\\omega_0t}\\bigr)\\\\&=a_0+\\sum_{k=1}^{\\infty}\\Bigl(a_ke^{jk\\omega_0t}+\\bigl(a_ke^{jk\\omega_0t}\\bigr)^{*}\\Bigr)\\\\&=a_0+2\\sum_{k=1}^{\\infty}\\operatorname{Re}\\bigl\\{a_ke^{jk\\omega_0t}\\bigr\\}.\\end{aligned}'},
{t:'p', text:'Two real forms follow, one for each way of writing $a_k$. In polar form, $a_k=A_ke^{j\\theta_k}$, so $\\operatorname{Re}\\{A_ke^{j(k\\omega_0t+\\theta_k)}\\}=A_k\\cos(k\\omega_0t+\\theta_k)$. In rectangular form, $a_k=B_k+jC_k$. Put $\\phi=k\\omega_0t$ and multiply out:'},
{t:'eq', tex:'\\operatorname{Re}\\bigl\\{(B_k+jC_k)(\\cos\\phi+j\\sin\\phi)\\bigr\\}=\\operatorname{Re}\\bigl\\{B_k\\cos\\phi-C_k\\sin\\phi+j(B_k\\sin\\phi+C_k\\cos\\phi)\\bigr\\}=B_k\\cos\\phi-C_k\\sin\\phi.'},
{t:'eqbox', cap:'Real forms of the series of a real signal',
 tex:['a_k=A_ke^{j\\theta_k}:\\qquad x(t)=a_0+2\\sum_{k=1}^{\\infty}A_k\\cos\\bigl(k\\omega_0t+\\theta_k\\bigr)',
      'a_k=B_k+jC_k:\\qquad x(t)=a_0+2\\sum_{k=1}^{\\infty}\\bigl[B_k\\cos k\\omega_0t-C_k\\sin k\\omega_0t\\bigr]'],
 after:'The first is the amplitude–phase form: each harmonic is one cosine with its own phase. The second is the cosine–sine form. The two are linked by $A_k=\\sqrt{B_k^{2}+C_k^{2}}$ and $\\theta_k=\\angle a_k$. Note the factor $2$ and the minus sign before $C_k$.'},
{t:'ex', hd:'Example 4.6 — from coefficients to a real signal', rows:[
 ['Given','A real signal with $\\omega_0=\\pi$ rad/s, $a_1=0.4+j0.3$, $a_{-1}=a_1^{*}$ and every other $a_k=0$. A second real signal with $a_1=1-j$, $a_{-1}=1+j$ and every other $a_k=0$.'],
 ['Find','The first signal in both real forms, and the second in cosine–sine form.'],
 ['Method','Read $B_1$ and $C_1$ from the rectangular form of $a_1$. Compute $A_1$ and $\\theta_1$ from them. Substitute into the two real forms with $a_0=0$.'],
 ['Solution','For the first signal, $B_1=0.4$ and $C_1=0.3$. Then $A_1=\\sqrt{0.4^{2}+0.3^{2}}=\\sqrt{0.25}=0.5$. The point $(0.4,0.3)$ lies in the first quadrant, so $\\theta_1=\\arctan(0.3/0.4)=0.644$ rad. The two forms are $$\\begin{aligned}x(t)&=2A_1\\cos(\\pi t+\\theta_1)=\\cos(\\pi t+0.644),\\\\x(t)&=2\\bigl[B_1\\cos\\pi t-C_1\\sin\\pi t\\bigr]=0.8\\cos\\pi t-0.6\\sin\\pi t.\\end{aligned}$$ For the second signal, $B_1=1$ and $C_1=-1$, so $$x(t)=2\\bigl[1\\cdot\\cos\\pi t-(-1)\\sin\\pi t\\bigr]=2\\cos\\pi t+2\\sin\\pi t.$$'],
 ['Check','Expand the amplitude–phase form with $\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta$. Here $\\cos0.644=B_1/A_1=0.8$ and $\\sin0.644=C_1/A_1=0.6$, so $\\cos(\\pi t+0.644)=0.8\\cos\\pi t-0.6\\sin\\pi t$. The two forms agree.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[0,4],yr:[-1.4,1.7],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
  a.curve(t=>0.8*Math.cos(Math.PI*t),{color:C.in,dash:'8 5',n:1600});
  a.curve(t=>-0.6*Math.sin(Math.PI*t),{color:C.mid,dash:'3 5',n:1600});
  a.curve(t=>Math.cos(Math.PI*t+Math.atan2(0.3,0.4)),{color:C.out,n:1600}); return a.svg();},
 cap:'Example 4.6: $2B_1\\cos\\pi t=0.8\\cos\\pi t$ (long dashes) and $-2C_1\\sin\\pi t=-0.6\\sin\\pi t$ (short dashes) add to one cosine of amplitude $2A_1=1$ (solid).'},

/* ================================================================ 4.3 */
{t:'h2', num:'4.3', text:'Series worked out'},
{t:'p', text:'This section applies the analysis equation to three standard waveforms: the rectangular wave, the sawtooth and the impulse train. It also asks how many harmonics a good approximation needs.'},
{t:'ex', hd:'Example 4.7 — the periodic rectangular wave', rows:[
 ['Given','$x(t)=1$ for $|t|<T_1$ and $x(t)=0$ for $T_1<|t|<T_0/2$, repeated with period $T_0$.'],
 ['Find','Every coefficient.'],
 ['Method','Apply the analysis equation over $-T_0/2<t<T_0/2$. The signal is 1 only on $-T_1<t<T_1$, so those become the limits. Treat $k=0$ on its own, because the antiderivative divides by $k$.'],
 ['Solution','The signal is zero for $T_1<|t|<T_0/2$, so those parts of the integral drop out and the limits shrink to $\\pm T_1$: $$a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}x(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\cdot e^{-jk\\omega_0t}\\,\\d t.$$ For $k=0$ the integrand is 1, so $a_0=\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\,\\d t=\\frac{1}{T_0}\\bigl[t\\bigr]_{-T_1}^{T_1}=\\frac{2T_1}{T_0}$. This is the fraction of each period that the pulse fills. For $k\\neq0$, integrate the exponential, evaluate it at the two limits, and turn the difference of exponentials into a sine with $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$: $$\\begin{aligned}a_k&=\\frac{1}{T_0}\\left[\\frac{e^{-jk\\omega_0t}}{-jk\\omega_0}\\right]_{-T_1}^{T_1}=\\frac{1}{T_0}\\cdot\\frac{e^{-jk\\omega_0T_1}-e^{jk\\omega_0T_1}}{-jk\\omega_0}\\\\&=\\frac{1}{T_0}\\cdot\\frac{e^{jk\\omega_0T_1}-e^{-jk\\omega_0T_1}}{jk\\omega_0}=\\frac{1}{T_0}\\cdot\\frac{2j\\sin(k\\omega_0T_1)}{jk\\omega_0}\\\\&=\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0T_0}.\\end{aligned}$$ The second line changes the sign of both numerator and denominator, which leaves the fraction unchanged. Finally replace $\\omega_0$ by $2\\pi/T_0$. The denominator becomes $k\\omega_0T_0=2\\pi k$ and the argument becomes $k\\omega_0T_1=2\\pi kT_1/T_0$: $$a_k=\\begin{cases}\\dfrac{2T_1}{T_0},&k=0,\\\\[10pt]\\dfrac{\\sin(2\\pi kT_1/T_0)}{\\pi k},&k\\neq0.\\end{cases}$$'],
 ['Check','As $k\\to0$, $\\sin\\theta/\\theta\\to1$, so the second branch tends to $\\frac{2\\pi kT_1/T_0}{\\pi k}=2T_1/T_0$. It agrees with the branch for $k=0$. The signal is real and even, so the coefficients must be real and even in $k$. The formula has this property because $\\sin$ and $k$ are both odd.']
]},
{t:'box', kind:'warn', hd:'Half duty: no even harmonics', html:'For $T_0=4T_1$ the pulse fills half of each period, and $a_k=\\sin(\\pi k/2)/(\\pi k)$. At every even $k\\neq0$ the sine is the sine of a whole multiple of $\\pi$, so <b>every even coefficient vanishes</b>. The first values are $a_0=\\tfrac12$, $a_1=1/\\pi=0.318$, $a_2=0$ and $a_3=\\sin(3\\pi/2)/(3\\pi)=-1/(3\\pi)=-0.106$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-5,5],yr:[-0.3,1.6],xlabel:'t',ylabel:'x(t)',xtarget:6});
   a.curve(t=>rectWave(t,4,1),{color:C.in,n:3000});
   a.vline(3,{color:C.coral,dash:'4 4'}); a.vline(5,{color:C.coral,dash:'4 4'});
   a.span(3,5,1.3,'2T_1',{color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'The wave for $T_1=1$ and $T_0=4$.'},
 {svg:()=>{const a=ax2({xr:[-12.5,12.5],yr:[-0.2,0.62],xlabel:'k',ylabel:'a_k',xtarget:5,ytarget:4});
   a.stem(D(aq,-12,12),{color:C.in,r:2.6,showZero:true}); return a.svg();},
  cap:'Its coefficients. They are real, so a negative stem is a phase of $\\pi$.'}
]},
{t:'h3', text:'The envelope, and the samples taken from it'},
{t:'p', text:'These coefficients are values of one continuous function of $\\omega$, read at equally spaced points. Define the envelope by the integral of Example 4.7 with $k\\omega_0$ replaced by a free variable $\\omega$:'},
{t:'eqbox', cap:'Envelope of a single pulse',
 tex:['\\begin{aligned}E(\\omega)&=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}\\\\&=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}=\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)\\end{aligned}',
      'a_k=\\frac{1}{T_0}\\,E(k\\omega_0)=\\frac{1}{T_0}\\cdot\\frac{2\\sin(k\\omega_0T_1)}{k\\omega_0}=\\frac{\\sin(2\\pi kT_1/T_0)}{\\pi k}'],
 after:'Here $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, the unnormalised sinc. The second line puts $\\omega=k\\omega_0$ back and uses $\\omega_0=2\\pi/T_0$. $E$ depends on the shape of one pulse only, not on how often the pulse repeats.'},
{t:'box', kind:'err', hd:'Two objects, not one', html:'$E(\\omega)$ is a function of a continuous variable; $a_k$ is a sequence indexed by an integer. Evaluating the envelope at the single point $\\omega=\\omega_0$ gives $T_0a_1$, the first harmonic only. As a function of the harmonic index the coefficient is $T_0a_k=T_0\\sin(2\\pi kT_1/T_0)/(\\pi k)$, with $k$ in both places. Never join the tops of coefficient stems with a line: that claims the signal contains frequencies between the harmonics, which a periodic signal does not.'},
{t:'p', text:'Keep the pulse and increase $T_0$. The envelope stays the same. The samples come closer together, because their spacing is $\\omega_0=2\\pi/T_0$, and each one scales by $1/T_0$. For example, $a_0=2T_1/T_0$ halves when $T_0$ doubles. Chapter 5 takes the limit $T_0\\to\\infty$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-10,10],yr:[-0.16,0.62],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'a_k',ytarget:4,xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick});
   const E=w=>Math.abs(w)<1e-9?2:2*Math.sin(w)/w, T0=4, w0=2*Math.PI/T0;
   a.curve(w=>E(w)/T0,{color:C.mid,dash:'6 5',n:900});
   const pts=[];for(let k=-20;k<=20;k++){const w=k*w0;if(Math.abs(w)<=10)pts.push([w,E(w)/T0]);}
   a.stem(pts,{color:C.in,r:3,showZero:true}); return a.svg();},
  cap:'$T_0=4T_1$ with $T_1=1$: each $a_k$ sits at $\\omega=k\\omega_0$ on the dashed envelope $E(\\omega)/T_0$.'},
 {svg:()=>{const a=ax2({xr:[-10,10],yr:[-0.16,0.62],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'a_k',ytarget:4,xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick});
   const E=w=>Math.abs(w)<1e-9?2:2*Math.sin(w)/w, T0=8, w0=2*Math.PI/T0;
   a.curve(w=>E(w)/T0,{color:C.mid,dash:'6 5',n:900});
   const pts=[];for(let k=-20;k<=20;k++){const w=k*w0;if(Math.abs(w)<=10)pts.push([w,E(w)/T0]);}
   a.stem(pts,{color:C.in,r:3,showZero:true}); return a.svg();},
  cap:'$T_0=8T_1$: the samples are twice as dense and half as tall.'}
]},

{t:'h3', text:'How many harmonics are enough'},
{t:'p', text:'A computer can add only finitely many terms. Keep the $2N+1$ coefficients nearest zero frequency and drop the rest. The mean-square error measures how far the result is from $x$: square the error, then average it over one period.'},
{t:'eqbox', cap:'Truncated series and mean-square error',
 tex:['x_N(t)=\\sum_{k=-N}^{N}a_k\\,e^{jk\\omega_0t},\\qquad \\text{MSE}=\\frac{1}{T_0}\\int_{T_0}\\bigl|x(t)-x_N(t)\\bigr|^{2}\\,\\d t'],
 after:'Section 4.5 shows that the MSE equals the power in the dropped harmonics, $\\sum_{|k|>N}|a_k|^{2}$. The table uses that form.'},
{t:'table', head:['$N$','Rectangular wave, $T_0=4T_1$','Sawtooth, $T_0=1$'], rows:[
 ['3','$0.025$','$0.0144$'],
 ['9','$0.010$','$0.0053$'],
 ['27','$0.004$','$0.0018$'],
 ['81','$0.001$','$0.0006$']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',ytarget:2});
   a.curve(t=>rectWave(t,4,1),{color:C.in,dash:'9 6',n:2400}); a.curve(t=>rectPS(t,3,4,1),{color:C.out,n:1800}); return a.svg();},
  cap:'$N=3$: the partial sum (solid) and the wave (dashed).'},
 {svg:()=>{const a=ax2({xr:[-6,6],yr:[-0.35,1.45],xlabel:'t',ytarget:2});
   a.curve(t=>rectWave(t,4,1),{color:C.in,dash:'9 6',n:2400}); a.curve(t=>rectPS(t,27,4,1),{color:C.out,n:4000}); return a.svg();},
  cap:'$N=27$. The spike beside each jump is no shorter.'}
]},
{t:'p', text:'The rate at which the error falls is set by the smoothness of the signal. A jump makes the coefficients decay like $1/k$, so $|a_k|^{2}$ decays like $1/k^{2}$. A tail sum of this kind is close to the matching integral, $\\sum_{k>N}1/k^{2}\\approx\\int_{N}^{\\infty}\\d k/k^{2}=1/N$. So the tail behaves like $1/N$, and doubling $N$ roughly halves the error. A signal that is continuous but has a corner, such as a triangular wave, has coefficients decaying like $1/k^{2}$. Then $|a_k|^{2}$ decays like $1/k^{4}$, the tail like $\\int_{N}^{\\infty}\\d k/k^{4}=1/(3N^{3})$, and far fewer harmonics are needed.'},
{t:'box', kind:'err', hd:'The Gibbs phenomenon', html:'Near a jump the partial sum overshoots, and the overshoot does not shrink as $N$ grows. Its height settles at about <b>9% of the size of the jump</b>. For the rectangular wave, which jumps by 1, the peak of $x_N$ stays near $1.09$. What shrinks is the width of the ripple: it moves into a narrower band around the jump. That is how the mean-square error can go to zero while the largest error does not. For a square wave that jumps from $0$ to $2$, the peak of $x_{81}$ is about $2+0.09\\times2=2.18$.'},
{t:'box', kind:'ok', hd:'Convergence in the mean', html:'If $x(t)$ has finite energy in one period, $\\int_{T_0}|x(t)|^{2}\\,\\d t<\\infty$, then the series converges in the mean: $\\text{MSE}\\to0$ as $N\\to\\infty$. This does not promise a small error at every $t$.'},
{t:'figrow', n:3, items:[9,27,81].map(N=>({svg:()=>{const a=ax3({xr:[0.4,1.6],yr:[-0.25,1.4],xlabel:'t'});
   a.curve(t=>rectWave(t,4,1),{color:C.in,dash:'9 6',n:1600});
   a.curve(t=>rectPS(t,N,4,1),{color:C.out,n:3000});
   a.hline(1.0895,{color:C.coral,dash:'4 5'}); return a.svg();},
  cap:'$N='+N+'$ near the jump at $t=1$. The dashed line is at $1.09$.'}))},

{t:'ex', hd:'Example 4.8 — the sawtooth wave', rows:[
 ['Given','$x(t)=t$ for $-T_0/2<t<T_0/2$, repeated with period $T_0$.'],
 ['Find','Every coefficient, with its magnitude and phase.'],
 ['Method','The DC term is a direct integral. For $k\\neq0$ the integrand is $t$ times an exponential, so use integration by parts with $u=t$ and $\\d v=e^{at}\\,\\d t$, which gives $\\d u=\\d t$ and $v=e^{at}/a$: $$\\int te^{at}\\,\\d t=\\frac{te^{at}}{a}-\\int\\frac{e^{at}}{a}\\,\\d t=\\frac{te^{at}}{a}-\\frac{e^{at}}{a^{2}}=\\frac{(at-1)e^{at}}{a^{2}}.$$ Differentiating the right side returns $te^{at}$, which checks the formula.'],
 ['Solution','The DC term: $$a_0=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,\\d t=\\frac{1}{T_0}\\left[\\frac{t^{2}}{2}\\right]_{-T_0/2}^{T_0/2}=\\frac{1}{T_0}\\left(\\frac{T_0^{2}}{8}-\\frac{T_0^{2}}{8}\\right)=0.$$ For $k\\neq0$, substitute the signal into the analysis equation and write $a=-jk\\omega_0$, so that the by-parts formula applies: $$a_k=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}t\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\cdot\\frac{1}{a^{2}}\\Bigl[(at-1)e^{at}\\Bigr]_{-T_0/2}^{T_0/2}.$$ At the limits, $aT_0/2=-jk\\omega_0T_0/2=-jk\\pi$, because $\\omega_0T_0/2=\\pi$. Also $e^{\\pm jk\\pi}=\\cos(k\\pi)\\pm j\\sin(k\\pi)=(-1)^{k}$, since $\\sin(k\\pi)=0$. Both exponentials equal $(-1)^{k}$, and this common factor comes out of the bracket: $$\\begin{aligned}\\Bigl[(at-1)e^{at}\\Bigr]_{-T_0/2}^{T_0/2}&=(-jk\\pi-1)e^{-jk\\pi}-(jk\\pi-1)e^{jk\\pi}\\\\&=(-1)^{k}\\bigl[(-jk\\pi-1)-(jk\\pi-1)\\bigr]\\\\&=(-1)^{k}(-2jk\\pi).\\end{aligned}$$ Next, $a^{2}=(-jk\\omega_0)^{2}=j^{2}k^{2}\\omega_0^{2}=-k^{2}\\omega_0^{2}$. Divide, then use $\\omega_0^{2}=4\\pi^{2}/T_0^{2}$: $$\\begin{aligned}a_k&=\\frac{1}{T_0}\\cdot\\frac{(-1)^{k}(-2jk\\pi)}{-k^{2}\\omega_0^{2}}=\\frac{2j\\pi(-1)^{k}}{T_0k\\omega_0^{2}}\\\\&=\\frac{2j\\pi(-1)^{k}\\,T_0^{2}}{T_0k\\cdot4\\pi^{2}}=\\frac{jT_0(-1)^{k}}{2k\\pi},\\qquad k\\neq0.\\end{aligned}$$ The magnitude is $|a_k|=T_0/(2\\pi|k|)$. Each $a_k$ is purely imaginary, so its phase is $+\\pi/2$ or $-\\pi/2$.'],
 ['Check','The signal is real and odd, so the coefficients must be purely imaginary, and they are. Real gives $a_{-k}=a_k^{*}$ and odd gives $a_{-k}=-a_k$; the formula satisfies both, since replacing $k$ by $-k$ changes only the sign. For $T_0=1$ the largest is $|a_{\\pm1}|=1/(2\\pi)=0.159$, and the magnitudes fall like $1/|k|$.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[-1.7,1.7],yr:[-0.8,0.95],xlabel:'t',ylabel:'\\text{amplitude}',xticksOverride:[-1,1]});
  a.curve(t=>sawWave(t,1),{color:C.in,dash:'9 6',n:4000});
  a.curve(t=>sawPS(t,9,1),{color:C.out,n:4000}); return a.svg();},
 cap:'The sawtooth for $T_0=1$ (dashed) and its partial sum with $N=9$ (solid). The same overshoot appears beside each jump.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-10.5,10.5],yr:[-0.02,0.2],xlabel:'k',ylabel:'|a_k|',ytarget:4});
   a.stem(D(k=>k===0?0:1/(2*Math.abs(k)*Math.PI),-10,10),{color:C.in,r:2.6,showZero:true}); return a.svg();},
  cap:'$|a_k|=1/(2\\pi|k|)$ for $T_0=1$.'},
 {svg:()=>{const a=ax2({xr:[-10.5,10.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',yticksOverride:PI2,ytickfmt:v=>v.toFixed(2)});
   a.stem(D(k=>k===0?0:(Math.pow(-1,k)/k>0?Math.PI/2:-Math.PI/2),-10,10),{color:C.mid,r:2.6,showZero:true}); return a.svg();},
  cap:'Every phase is $\\pm\\pi/2$, alternating in $k$.'}
]},

{t:'ex', hd:'Example 4.9 — the periodic impulse train', rows:[
 ['Given','$x(t)=\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)$.'],
 ['Find','Every coefficient.'],
 ['Method','Take the period from $-T_0/2$ to $+T_0/2$. Exactly one impulse lies inside it, so the sifting property finishes the integral.'],
 ['Solution','Substitute the impulse train into the analysis equation. Inside $-T_0/2<t<T_0/2$ only the term $m=0$, which is $\\delta(t)$, is non-zero. The impulses at $t=\\pm T_0,\\pm2T_0,\\dots$ lie outside the interval and contribute nothing. Then sift, which sets $t=0$ in the exponential: $$\\begin{aligned}a_k&=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}\\sum_{m=-\\infty}^{\\infty}\\delta(t-mT_0)\\,e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}\\delta(t)\\,e^{-jk\\omega_0t}\\,\\d t=\\frac{1}{T_0}\\,e^{-jk\\omega_0\\cdot0}=\\frac{1}{T_0}\\end{aligned}$$ for every $k$.'],
 ['Check','Both limits must be written and must differ. An interval with equal endpoints has zero length, so every integral over it is zero. The result is real, positive and the same at every harmonic: a flat spectrum with zero phase. At $t=0$ all the harmonics equal 1 and add. At other times their contributions cancel. Chapter 7 uses this pair for sampling.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-3.5,3.5],yr:[-0.25,1.55],xlabel:'t',ylabel:'x(t)',ytarget:2});
   [-3,-2,-1,0,1,2,3].forEach(m=>a.impulse(m,1,{color:C.in,labelText:'1'})); return a.svg();},
  cap:'The impulse train for $T_0=1$. Each arrow is an impulse of weight 1.'},
 {svg:()=>{const a=ax2({xr:[-9.5,9.5],yr:[-0.25,1.55],xlabel:'k',ylabel:'a_k',ytarget:2});
   a.stem(D(()=>1,-9,9),{color:C.mid,r:2.6}); return a.svg();},
  cap:'Its coefficients: $a_k=1/T_0=1$ for every $k$.'}
]},

/* ================================================================ 4.4 */
{t:'h2', num:'4.4', text:'The discrete-time series'},
{t:'p', text:'A sequence is periodic with period $N$ when $x[n]=x[n+N]$ for every $n$. Its fundamental frequency is $\\omega_0=2\\pi/N$ rad/sample. Its series has only $N$ terms.'},
{t:'eqbox', cap:'Discrete-time Fourier series',
 tex:['x[n]=\\sum_{k=\\langle N\\rangle}a_k\\,e^{jk(2\\pi/N)n}',
      'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}'],
 after:'$\\langle N\\rangle$ means any $N$ consecutive values of the index. Both sums are finite and there are exactly $N$ distinct coefficients.'},
{t:'p', text:'The analysis sum follows from a discrete orthogonality. Sum $e^{jm(2\\pi/N)n}$ over one period, $n=0,\\dots,N-1$, with $m$ an integer. If $m$ is a multiple of $N$, every term is $e^{j2\\pi(m/N)n}=1$ and the sum is $N$. Otherwise the terms form a geometric sum with ratio $r=e^{jm2\\pi/N}\\neq1$, and $r^{N}=e^{jm2\\pi}=1$:'},
{t:'eq', tex:'\\sum_{n=0}^{N-1}r^{n}=\\frac{1-r^{N}}{1-r}=\\frac{1-e^{jm2\\pi}}{1-r}=\\frac{1-1}{1-r}=0.'},
{t:'p', text:'Now multiply the synthesis sum by $e^{-j\\ell(2\\pi/N)n}$ and sum over one period of $n$. Exchange the two finite sums. Within one period of $k$, the difference $k-\\ell$ is a multiple of $N$ only for $k=\\ell$, so only that term survives:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-j\\ell(2\\pi/N)n}&=\\sum_{n=\\langle N\\rangle}\\sum_{k=\\langle N\\rangle}a_k\\,e^{j(k-\\ell)(2\\pi/N)n}\\\\&=\\sum_{k=\\langle N\\rangle}a_k\\sum_{n=\\langle N\\rangle}e^{j(k-\\ell)(2\\pi/N)n}=N\\,a_\\ell.\\end{aligned}'},
{t:'p', text:'Divide by $N$ and rename $\\ell$ as $k$. This is the analysis sum.'},
{t:'box', hd:'The coefficients repeat', html:'$a_{k+N}=a_k$. Replace $k$ by $k+N$ in the analysis sum and split the exponential: $$a_{k+N}=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]\\,e^{-jk(2\\pi/N)n}\\,e^{-j2\\pi n}=a_k,$$ because $e^{-j2\\pi n}=1$ for every integer $n$. For example, with $N=8$ and $a_3=0.2j$, $a_{11}=a_{3+8}=0.2j$.'},
{t:'box', kind:'err', hd:'Not in continuous time', html:'The same substitution in continuous time produces $e^{-j2\\pi t}$, which is not 1 between integers. Continuous-time coefficients do not repeat.'},
{t:'box', kind:'ok', hd:'Exact and finite', html:'A period-$N$ sequence is described by $N$ numbers, and $N$ terms rebuild it. There is no truncation, no limit, no question of convergence and no Gibbs phenomenon in discrete time.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-9,17],yr:[-1.6,1.9],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>Math.cos(2*Math.PI*n/8)+0.4*Math.sin(4*Math.PI*n/8),-9,17),{color:C.in,r:2.6});
   a.vline(8,{color:C.coral,dash:'4 4'}); a.vline(16,{color:C.coral,dash:'4 4'});
   a.span(8,16,1.55,'N=8',{color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'$x[n]=\\cos(2\\pi n/8)+0.4\\sin(4\\pi n/8)$, with one period of $N=8$ marked.'},
 {svg:()=>{const a=ax2({xr:[-9,17],yr:[-0.08,0.72],xlabel:'k',ylabel:'|a_k|',ytarget:4});
   const mag=k=>{const m=((k%8)+8)%8;return (m===1||m===7)?0.5:((m===2||m===6)?0.2:0);};
   a.stem(D(mag,-9,17),{color:C.mid,r:2.6,showZero:true}); return a.svg();},
  cap:'Its coefficient magnitudes, $\\tfrac12$ at $k=\\pm1$ and $0.2$ at $k=\\pm2$, repeat every 8 in $k$.'}
]},
{t:'p', text:'The magnitudes in the figure come from Euler’s relations. $\\cos(2\\pi n/8)$ gives $a_{\\pm1}=\\tfrac12$. $0.4\\sin(4\\pi n/8)=0.4\\sin(2\\cdot2\\pi n/8)$ gives $a_{2}=\\tfrac{0.4}{2j}=-0.2j$ and $a_{-2}=0.2j$, both of magnitude $0.2$.'},

{t:'ex', hd:'Example 4.10 — a sum of two sequences', rows:[
 ['Given','$x[n]=\\sin\\!\\left(\\frac{5\\pi}{6}n\\right)+\\cos\\!\\left(\\frac{3\\pi}{4}n+\\frac{\\pi}{5}\\right)$.'],
 ['Find','The fundamental period and every coefficient.'],
 ['Method','A sinusoid of frequency $\\omega$ repeats after $N=(2\\pi/\\omega)\\,m$ samples, for the smallest positive integer $m$ that makes $N$ an integer. Find each component period, take the least common multiple, then expand with Euler’s relations.'],
 ['Solution','A sinusoid $\\cos(\\omega n)$ or $\\sin(\\omega n)$ repeats with period $N$ when $\\omega N=2\\pi m$ for some integer $m$, that is, $N=2\\pi m/\\omega$. For $\\omega=5\\pi/6$: $N=\\frac{2\\pi m}{5\\pi/6}=\\frac{12m}{5}$, first an integer at $m=5$, giving $N=12$. For $\\omega=3\\pi/4$: $N=\\frac{2\\pi m}{3\\pi/4}=\\frac{8m}{3}$, first an integer at $m=3$, giving $N=8$. So $N_0=\\operatorname{LCM}(12,8)=24$ and $\\omega_0=2\\pi/24=\\pi/12$. Write each frequency as a multiple of $\\omega_0$: $$\\frac{5\\pi}{6}=\\frac{20\\pi}{24}=10\\,\\omega_0,\\qquad\\frac{3\\pi}{4}=\\frac{18\\pi}{24}=9\\,\\omega_0.$$ Now expand with Euler’s relations. The phase $\\pi/5$ stays with the coefficient, because $e^{j(9\\omega_0n+\\pi/5)}=e^{j\\pi/5}e^{j9\\omega_0n}$: $$\\begin{aligned}\\sin(10\\omega_0n)&=\\tfrac{1}{2j}e^{j10\\omega_0n}-\\tfrac{1}{2j}e^{-j10\\omega_0n},\\\\\\cos\\!\\left(9\\omega_0n+\\tfrac{\\pi}{5}\\right)&=\\tfrac12e^{j\\pi/5}e^{j9\\omega_0n}+\\tfrac12e^{-j\\pi/5}e^{-j9\\omega_0n}.\\end{aligned}$$ Read off the coefficient of each $e^{jk\\omega_0n}$: $$a_{10}=\\tfrac{1}{2j},\\quad a_{-10}=-\\tfrac{1}{2j},\\quad a_{9}=\\tfrac12e^{j\\pi/5},\\quad a_{-9}=\\tfrac12e^{-j\\pi/5}.$$ Every other coefficient in one period is zero, and $a_k=a_{k+24}$ gives all the rest.'],
 ['Check','$|a_{\\pm9}|=|a_{\\pm10}|=\\tfrac12$. The phases are $\\angle a_{\\pm9}=\\pm\\pi/5$ and $\\angle a_{\\pm10}=\\mp\\pi/2$, since $\\tfrac{1}{2j}=-\\tfrac{j}{2}$. The sequence is real, so the magnitudes are even in $k$ and the phases odd.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-12.5,12.5],yr:[-0.06,0.66],xlabel:'k',ylabel:'|a_k|',ytarget:4});
   a.stem(D(k=>(Math.abs(k)===9||Math.abs(k)===10)?0.5:0,-12,12),{color:C.in,r:2.6,showZero:true}); return a.svg();},
  cap:'Magnitudes over one period, $-12\\le k\\le11$, with $k=12$ equal to $k=-12$.'},
 {svg:()=>{const a=ax2({xr:[-12.5,12.5],yr:[-2.1,2.1],xlabel:'k',ylabel:'\\angle a_k\\;(\\text{rad})',yticksOverride:PI2,ytickfmt:v=>v.toFixed(2)});
   a.stem(D(k=>k===9?Math.PI/5:(k===-9?-Math.PI/5:(k===10?-Math.PI/2:(k===-10?Math.PI/2:0))),-12,12),{color:C.mid,r:2.6,showZero:true}); return a.svg();},
  cap:'Phases: $\\pm\\pi/5$ at $k=\\pm9$, $\\mp\\pi/2$ at $k=\\pm10$.'}
]},

{t:'ex', hd:'Example 4.11 — the discrete-time square wave', rows:[
 ['Given','$x[n]=1$ for $|n|\\le N_1$ and $x[n]=0$ for $N_1<|n|\\le N/2$, repeated with period $N$.'],
 ['Find','Every coefficient.'],
 ['Method','Sum over one period. The signal is 1 only for $-N_1\\le n\\le N_1$, so the sum reduces to a finite geometric sum with ratio $r=e^{-jk(2\\pi/N)}$. For $r\\neq1$ it has a closed form. Write $S=\\sum_{n=m}^{p}r^{n}$. Then $S-rS=r^{m}-r^{p+1}$, because every other term cancels, so $S=(r^{m}-r^{p+1})/(1-r)$. Treat $r=1$ separately.'],
 ['Solution','With $m=-N_1$ and $p=N_1$, $$a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}1\\cdot e^{-jk(2\\pi/N)n}=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}r^{n}=\\frac{1}{N}\\cdot\\frac{r^{-N_1}-r^{N_1+1}}{1-r}.$$ The lower limit is $n=-N_1$, so the first numerator term is $r^{-N_1}=e^{+jk(2\\pi/N)N_1}$, with a positive exponent. Written out, $$a_k=\\frac{1}{N}\\cdot\\frac{e^{jk(2\\pi/N)N_1}-e^{-jk(2\\pi/N)(N_1+1)}}{1-e^{-jk(2\\pi/N)}}.$$ Factor $e^{-jk\\pi/N}$ out of the numerator. The exponents that remain are $jk(2\\pi/N)N_1+jk\\pi/N=jk(2\\pi/N)(N_1+\\tfrac12)$ and $-jk(2\\pi/N)(N_1+1)+jk\\pi/N=-jk(2\\pi/N)(N_1+\\tfrac12)$, so the bracket is $2j$ times a sine: $$\\begin{aligned}&e^{jk(2\\pi/N)N_1}-e^{-jk(2\\pi/N)(N_1+1)}\\\\&\\quad=e^{-jk\\pi/N}\\Bigl[e^{jk(2\\pi/N)(N_1+\\frac12)}-e^{-jk(2\\pi/N)(N_1+\\frac12)}\\Bigr]\\\\&\\quad=e^{-jk\\pi/N}\\,2j\\sin\\!\\left(\\tfrac{2\\pi k}{N}\\bigl(N_1+\\tfrac12\\bigr)\\right).\\end{aligned}$$ Factor the same $e^{-jk\\pi/N}$ out of the denominator: $$1-e^{-jk(2\\pi/N)}=e^{-jk\\pi/N}\\bigl[e^{jk\\pi/N}-e^{-jk\\pi/N}\\bigr]=e^{-jk\\pi/N}\\,2j\\sin\\!\\left(\\tfrac{\\pi k}{N}\\right).$$ The factors $e^{-jk\\pi/N}$ and $2j$ cancel. When $k$ is a multiple of $N$, $r=e^{-j2\\pi(k/N)}=1$, every term of the sum is 1, and there are $2N_1+1$ terms. So $$a_k=\\begin{cases}\\dfrac{2N_1+1}{N},&k=0,\\pm N,\\pm2N,\\dots\\\\[12pt]\\dfrac{\\sin\\bigl(\\tfrac{2\\pi k}{N}(N_1+\\tfrac12)\\bigr)}{N\\sin(\\pi k/N)},&\\text{otherwise.}\\end{cases}$$'],
 ['Check','Here $|r|=1$ at every $k$: $r$ lies on the unit circle. So the rule $|r|<1$ of an infinite geometric sum does not apply, and it is not needed, because a finite sum needs only $r\\neq1$. For $N=10$ and $N_1=2$ the first branch gives $a_0=(2\\cdot2+1)/10=0.5$, the average of five ones in ten samples. As $k\\to0$ the second branch tends to $\\frac{(2\\pi k/N)(N_1+\\frac12)}{N\\pi k/N}=\\frac{2N_1+1}{N}$, the same value.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-16,16],yr:[-0.25,1.7],xlabel:'n',ylabel:'x[n]',ytarget:2});
   a.stem(D(n=>{const m=n-10*Math.round(n/10);return Math.abs(m)<=2?1:0;},-16,16),{color:C.in,r:2.6,showZero:true});
   a.span(8,12,1.3,'2N_1+1',{color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'$N=10$, $N_1=2$: five ones and five zeros in every period.'},
 {svg:()=>{const b=ax2({xr:[-1.6,1.6],yr:[-1.4,1.4]}), r=(b.x1-b.x0)/(b.y0-b.y1);
   const a=ax2({xr:[-1.4*r,1.4*r],yr:[-1.4,1.4],xlabel:'\\operatorname{Re}\\{r\\}',ylabel:'\\operatorname{Im}\\{r\\}'});
   a.curve(x=>Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:800});
   a.curve(x=>-Math.sqrt(Math.max(0,1-x*x)),{color:C.muted,width:1.2,dash:'4 4',n:800});
   for(let k=0;k<10;k++){const th=-2*Math.PI*k/10;a.point(Math.cos(th),Math.sin(th),{color:k===0?C.err:C.in,r:4.2});}
   a.note(1.1,0.22,'r=1\\text{ at }k=0',{anchor:'start',color:C.err,fs:12,tex:true}); return a.svg();},
  cap:'The ten values of $r=e^{-jk2\\pi/10}$. All have $|r|=1$; only $k=0$ gives $r=1$.'}
]},
{t:'p', text:'Each parameter has one job. The $2N_1+1$ ones set the height and the width of each lobe. The period $N$ sets how far apart the peaks repeat in $k$, and it scales every coefficient by $1/N$. With $N_1=2$ the peak is $5/N$: $0.5$ for $N=10$, $0.25$ for $N=20$ and $0.167$ for $N=30$. With $N=12$ and $N_1=1$, $a_0=(2\\cdot1+1)/12=\\tfrac{3}{12}=\\tfrac14$.'},
{t:'figrow', n:3, items:[10,20,30].map(N=>({svg:()=>{const a=ax3({xr:[-46.5,46.5],yr:[-0.2,0.62],xlabel:'k',ylabel:'a_k',ytarget:3,xticksOverride:[-30,30]});
   a.stem(D(q=>dtRect(q,N,2),-45,45),{color:C.in,r:1.6,showZero:true}); return a.svg();},
  cap:'$N='+N+'$, $N_1=2$.'}))},
{t:'p', text:'Rebuild $x[n]$ from all $N$ coefficients with the synthesis sum. Every sample lands on 1 or 0 exactly. The sum has $N$ terms and stops. Nothing is truncated, so there is no overshoot that refuses to shrink.'},

{t:'ex', hd:'Example 4.12 — a discrete sawtooth', rows:[
 ['Given','$x[n]=n$ for $-5\\le n\\le5$, repeated with period $N=11$.'],
 ['Find','Every coefficient.'],
 ['Method','Substitute into the analysis sum with $\\omega_0=2\\pi/11$. The sequence is odd, so pair the term at $n=m$ with the term at $n=-m$ before expanding. With $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$, $$m\\,e^{-jk\\omega_0m}+(-m)\\,e^{+jk\\omega_0m}=-m\\bigl(e^{jk\\omega_0m}-e^{-jk\\omega_0m}\\bigr)=-2jm\\sin(k\\omega_0m).$$'],
 ['Solution','The DC term is the average of the eleven values, and they cancel in pairs: $$a_0=\\frac{1}{11}\\sum_{n=-5}^{5}n=\\frac{1}{11}\\bigl[(-5)+(-4)+\\dots+4+5\\bigr]=0.$$ For general $k$, the $n=0$ term is zero, and the remaining ten terms form five pairs: $$\\begin{aligned}a_k&=\\frac{1}{11}\\sum_{n=-5}^{5}n\\,e^{-jk(2\\pi/11)n}\\\\&=\\frac{1}{11}\\sum_{m=1}^{5}\\Bigl[m\\,e^{-jk(2\\pi/11)m}+(-m)\\,e^{+jk(2\\pi/11)m}\\Bigr]\\\\&=\\frac{1}{11}\\sum_{m=1}^{5}\\bigl(-2jm\\bigr)\\sin\\!\\left(\\frac{2\\pi km}{11}\\right)\\\\&=-\\frac{2j}{11}\\sum_{m=1}^{5}m\\,\\sin\\!\\left(\\frac{2\\pi km}{11}\\right).\\end{aligned}$$ For $k=1$ the five terms are $1\\sin\\frac{2\\pi}{11}+2\\sin\\frac{4\\pi}{11}+3\\sin\\frac{6\\pi}{11}+4\\sin\\frac{8\\pi}{11}+5\\sin\\frac{10\\pi}{11}=0.5406+1.8193+2.9695+3.0230+1.4087=9.7610$, so $a_1=-j\\,\\tfrac{2}{11}(9.7610)=-j1.7747$.'],
 ['Check','Every coefficient is purely imaginary, as a real odd sequence requires, so each phase is $+\\pi/2$ or $-\\pi/2$. The sequence is odd, so $a_{-1}=-a_1=+j1.7747$. The largest magnitude is $|a_{\\pm1}|=1.7747$, and it returns at $k=\\pm10,\\pm12,\\dots$ because $a_{k+11}=a_k$. The eleven coefficients from $k=-5$ to $k=5$ are the whole answer.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-17.8,17.8],yr:[-6.4,7.4],xlabel:'n',ylabel:'x[n]'});
   a.stem(D(n=>n-11*Math.round(n/11),-17,17),{color:C.in,r:2.4,showZero:true});
   a.span(6,16,6.4,'N=11',{color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'A ramp from $-5$ to $5$, repeated every 11 samples.'},
 {svg:()=>{const a=ax2({xr:[-17.5,17.5],yr:[-0.15,2.1],xlabel:'k',ylabel:'|a_k|',ytarget:4});
   a.stem(D(k=>Math.abs(sawS(k)),-17,17),{color:C.in,r:2.4,showZero:true}); return a.svg();},
  cap:'$|a_k|$: largest at $k=\\pm1$, repeating every 11.'}
]},

/* ================================================================ 4.5 */
{t:'h2', num:'4.5', text:'Properties'},
{t:'p', text:'Each property states how an operation on a periodic signal changes its coefficients. The notation $x\\leftrightarrow a_k$ pairs a periodic signal with its coefficients. Throughout, $x$ and $y$ have the same period, $T_0$ or $N$, with coefficients $a_k$ and $b_k$. Section 4.7 collects every property in two tables.'},
{t:'h3', text:'Linearity and time shift'},
{t:'p', text:'The analysis equation is an integral, and an integral is linear, so $Ax(t)+By(t)\\leftrightarrow Aa_k+Bb_k$. The same holds for sequences. For a shift, substitute $\\tau=t-t_0$, so $t=\\tau+t_0$ and $\\d t=\\d\\tau$. When $t$ runs over the period $0<t<T_0$, $\\tau$ runs over $-t_0<\\tau<T_0-t_0$, which is again one full period. The factor $e^{-jk\\omega_0t_0}$ does not depend on $\\tau$ and leaves the integral:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{T_0}\\int_{0}^{T_0}x(t-t_0)\\,e^{-jk\\omega_0t}\\,\\d t&=\\frac{1}{T_0}\\int_{-t_0}^{T_0-t_0}x(\\tau)\\,e^{-jk\\omega_0(\\tau+t_0)}\\,\\d\\tau\\\\&=e^{-jk\\omega_0t_0}\\,\\frac{1}{T_0}\\int_{-t_0}^{T_0-t_0}x(\\tau)\\,e^{-jk\\omega_0\\tau}\\,\\d\\tau=e^{-jk\\omega_0t_0}\\,a_k.\\end{aligned}'},
{t:'eqbox', cap:'Time shift',
 tex:['x(t-t_0)\\;\\longleftrightarrow\\;a_k\\,e^{-jk\\omega_0t_0},\\qquad x[n-n_0]\\;\\longleftrightarrow\\;a_k\\,e^{-jk(2\\pi/N)n_0}'],
 after:'The discrete-time proof is the same, with a sum and the index change $r=n-n_0$.'},
{t:'p', text:'The factor has modulus 1, $|e^{-jk\\omega_0t_0}|=1$. So a shift never changes a magnitude, $|b_k|=|a_k|$ at every $k$. It changes each phase by $-k\\omega_0t_0$, in proportion to the harmonic index. Two signals that differ only by a delay have the same magnitude plot. Everything that tells them apart is in the phase. For a wave with $T_0=2$ ($\\omega_0=\\pi$ rad/s) delayed by $t_0=0.4$, the phase of $a_1$ changes by $-1\\cdot\\pi\\cdot0.4=-0.4\\pi$. A delay of half a period, $t_0=T_0/2$, multiplies $a_1$ by $e^{-j\\omega_0T_0/2}=e^{-j\\pi}=-1$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.35,1.6],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:2});
   a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000,dash:'6 5'});
   a.curve(t=>rectWave(t-0.4,2,0.5),{color:C.out,n:3000});
   a.span(1.5,1.9,1.3,'t_0',{color:C.coral,fs:13,tex:true}); return a.svg();},
  cap:'A rectangular wave with $T_0=2$ (dashed), delayed by $t_0=0.4$ (solid).'},
 {svg:()=>{const a=ax2({xr:[-8.5,8.5],yr:[-3.6,3.6],xlabel:'k',ylabel:'\\angle b_k-\\angle a_k\\;(\\text{rad})',yticksOverride:[-Math.PI,0,Math.PI],ytickfmt:v=>v.toFixed(2)});
   a.stem(D(k=>Math.abs(aq(k))<1e-12?0:wrap(-0.4*Math.PI*k),-8,8),{color:C.mid,r:2.6,showZero:true}); return a.svg();},
  cap:'The phase change $-0.4\\pi k$, drawn in $[-\\pi,\\pi]$. Where $a_k=0$ there is no phase to change.'}
]},

{t:'h3', text:'Time reversal and conjugation'},
{t:'p', text:'For time reversal, take the period from $-T_0/2$ to $T_0/2$ and substitute $\\tau=-t$, so $\\d t=-\\d\\tau$. The limit $t=-T_0/2$ becomes $\\tau=T_0/2$, and $t=T_0/2$ becomes $\\tau=-T_0/2$. Swapping the limits removes the minus sign:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}x(-t)\\,e^{-jk\\omega_0t}\\,\\d t&=\\frac{1}{T_0}\\int_{T_0/2}^{-T_0/2}x(\\tau)\\,e^{jk\\omega_0\\tau}\\,(-\\d\\tau)\\\\&=\\frac{1}{T_0}\\int_{-T_0/2}^{T_0/2}x(\\tau)\\,e^{-j(-k)\\omega_0\\tau}\\,\\d\\tau=a_{-k}.\\end{aligned}'},
{t:'p', text:'For conjugation, conjugate the synthesis equation term by term, then rename the index $k$ as $-k$. The sum runs over all integers, so renaming does not change it:'},
{t:'eq', tex:'x^{*}(t)=\\sum_{k=-\\infty}^{\\infty}a_k^{*}\\,e^{-jk\\omega_0t}=\\sum_{k=-\\infty}^{\\infty}a_{-k}^{*}\\,e^{jk\\omega_0t}.'},
{t:'eqbox', cap:'Reversal and conjugation',
 tex:['x(-t)\\;\\longleftrightarrow\\;a_{-k},\\qquad x^{*}(t)\\;\\longleftrightarrow\\;a_{-k}^{*}'],
 after:'The same two rules hold for $x[-n]$ and $x^{*}[n]$.'},
{t:'p', text:'These two rules give the symmetry of the coefficients. The coefficients of a signal are unique, because the analysis equation gives one value for each $k$. So a signal equal to its own conjugate, or to its own reversal, must have matching coefficients.'},
{t:'ul', items:[
 '<b>Real:</b> $x=x^{*}$, so $a_k=a_{-k}^{*}$, that is, $a_{-k}=a_k^{*}$. Then $|a_k|$ is even in $k$ and $\\angle a_k$ is odd.',
 '<b>Real and even:</b> even gives $a_{-k}=a_k$. With $a_{-k}=a_k^{*}$ this is $a_k=a_k^{*}$, so every $a_k$ is real, and even in $k$.',
 '<b>Real and odd:</b> odd, $x(-t)=-x(t)$, gives $a_{-k}=-a_k$. With $a_{-k}=a_k^{*}$ this is $a_k^{*}=-a_k$, so $\\operatorname{Re}\\{a_k\\}=0$: every $a_k$ is purely imaginary, and odd in $k$.'
]},
{t:'p', text:'The rectangular wave of Example 4.7 is real and even, and its coefficients are real. The sawtooth of Example 4.8 is real and odd, and its coefficients are purely imaginary. A real, even signal cannot have $a_2=0.1+0.2j$, because that number is not real.'},
{t:'p', text:'A real signal that is neither even nor odd splits into an even part and an odd part. Write each part as a combination of $x(t)$ and $x(-t)$. Apply linearity and time reversal, and then use $a_{-k}=a_k^{*}$ for a real signal:'},
{t:'eq', tex:'\\begin{aligned}\\Ev\\{x(t)\\}=\\tfrac12x(t)+\\tfrac12x(-t)&\\;\\leftrightarrow\\;\\tfrac12a_k+\\tfrac12a_{-k}=\\tfrac12\\bigl(a_k+a_k^{*}\\bigr)=\\operatorname{Re}\\{a_k\\},\\\\\\Od\\{x(t)\\}=\\tfrac12x(t)-\\tfrac12x(-t)&\\;\\leftrightarrow\\;\\tfrac12a_k-\\tfrac12a_{-k}=\\tfrac12\\bigl(a_k-a_k^{*}\\bigr)=j\\operatorname{Im}\\{a_k\\}.\\end{aligned}'},
{t:'p', text:'The last equality on each line uses $a_k+a_k^{*}=2\\operatorname{Re}\\{a_k\\}$ and $a_k-a_k^{*}=2j\\operatorname{Im}\\{a_k\\}$. So the even part of a real signal carries the real parts of the coefficients, and the odd part carries the imaginary parts. For example, if $x$ is real and $a_1=0.3-0.4j$, the coefficient of $\\Ev\\{x\\}$ at $k=1$ is $0.3$ and the coefficient of $\\Od\\{x\\}$ is $j(-0.4)=-0.4j$. For a real signal the coefficients at negative $k$ carry nothing new: compute them for $k\\ge0$ and conjugate.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-8.5,8.5],yr:[-0.35,0.62],xlabel:'k',ylabel:'\\operatorname{Re}\\{a_k\\}',ytarget:4});
   a.stem(D(k=>aq(k)*Math.cos(0.4*Math.PI*k),-8,8),{color:C.mid,r:2.6,showZero:true}); return a.svg();},
  cap:'The delayed wave of the previous figure: $\\operatorname{Re}\\{a_k\\}$, even in $k$.'},
 {svg:()=>{const a=ax2({xr:[-8.5,8.5],yr:[-0.35,0.35],xlabel:'k',ylabel:'\\operatorname{Im}\\{a_k\\}',ytarget:4});
   a.stem(D(k=>-aq(k)*Math.sin(0.4*Math.PI*k),-8,8),{color:C.err,r:2.6,showZero:true}); return a.svg();},
  cap:'$\\operatorname{Im}\\{a_k\\}$, odd in $k$.'}
]},

{t:'h3', text:'Frequency shift and time scaling'},
{t:'p', text:'Multiply $x(t)$ by the harmonic $e^{jM\\omega_0t}$, with $M$ an integer, so the product keeps the period $T_0$. Rename the index as $k=\\ell+M$:'},
{t:'eq', tex:'e^{jM\\omega_0t}\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,e^{j\\ell\\omega_0t}=\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,e^{j(\\ell+M)\\omega_0t}=\\sum_{k=-\\infty}^{\\infty}a_{k-M}\\,e^{jk\\omega_0t}.'},
{t:'p', text:'So $e^{jM\\omega_0t}x(t)\\leftrightarrow a_{k-M}$: the whole coefficient sequence slides $M$ places. In discrete time, $e^{jM(2\\pi/N)n}x[n]\\leftrightarrow a_{k-M}$ by the same steps.'},
{t:'p', text:'Time scaling in continuous time, $x(\\alpha t)$ with $\\alpha>0$, changes the period to $T_0/\\alpha$ and the fundamental frequency to $\\alpha\\omega_0$. Substitute $\\alpha t$ into the synthesis equation:'},
{t:'eq', tex:'x(\\alpha t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_0(\\alpha t)}=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk(\\alpha\\omega_0)t}.'},
{t:'p', text:'This is a Fourier series with fundamental frequency $\\alpha\\omega_0$ and the same coefficients. The coefficients are unique, so they are the coefficients of $x(\\alpha t)$. Each $a_k$ keeps its value and moves to the frequency $k\\alpha\\omega_0$. For example, if $x(t)$ has $a_3=0.3$, then $x(2t)$ also has $0.3$ at $k=3$, now at the frequency $6\\omega_0$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.35,1.4],xlabel:'t',ylabel:'x(t)',ytarget:2});
   a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000}); return a.svg();},
  cap:'$x(t)$ with $T_0=2$.'},
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.35,1.4],xlabel:'t',ylabel:'x(2t)',ytarget:2});
   a.curve(t=>rectWave(2*t,2,0.5),{color:C.out,n:3000}); return a.svg();},
  cap:'$x(2t)$: the period halves to 1 and $\\omega_0$ doubles.'}
]},
{t:'p', text:'Discrete time has no $x(\\alpha n)$ for a fractional $\\alpha$. Its version of stretching inserts zeros. For a positive integer $m$, define'},
{t:'eq', tex:'x_{(m)}[n]=\\begin{cases}x[n/m],&n\\text{ a multiple of }m,\\\\0,&\\text{otherwise.}\\end{cases}'},
{t:'p', text:'Every sample of $x$ is kept and $m-1$ zeros follow each one, so the period becomes $mN$. In the analysis sum over one period of $mN$ samples, only $n=mr$ with $r=0,\\dots,N-1$ contributes, and there $x_{(m)}[mr]=x[r]$. The exponent simplifies because $\\frac{2\\pi}{mN}\\cdot mr=\\frac{2\\pi}{N}r$:'},
{t:'eq', tex:'\\begin{aligned}b_k&=\\frac{1}{mN}\\sum_{n=0}^{mN-1}x_{(m)}[n]\\,e^{-jk\\frac{2\\pi}{mN}n}=\\frac{1}{mN}\\sum_{r=0}^{N-1}x[r]\\,e^{-jk\\frac{2\\pi}{mN}mr}\\\\&=\\frac{1}{m}\\cdot\\frac{1}{N}\\sum_{r=0}^{N-1}x[r]\\,e^{-jk\\frac{2\\pi}{N}r}=\\frac{a_k}{m}.\\end{aligned}'},
{t:'box', kind:'warn', hd:'Not like continuous time', html:'$x(\\alpha t)$ keeps its coefficients. $x_{(m)}[n]$ divides them by $m$, because the same samples are averaged over $m$ times as many points. For example, $x[n]=1,0$ repeating has $N=2$ and $a_0=\\tfrac12$. Stretched with $m=3$ it becomes $1,0,0,0,0,0$ repeating, with $a_0=\\tfrac12\\cdot\\tfrac13=\\tfrac16$: one 1 in six samples.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const s=[1,0.5,0,0.5];const a=ax2({xr:[-1,25],yr:[-0.15,1.3],xlabel:'n',ylabel:'x[n]',ytarget:2});
   a.stem(D(n=>s[((n%4)+4)%4],0,24),{color:C.in,r:2.6,showZero:true}); return a.svg();},
  cap:'$x[n]$ with $N=4$.'},
 {svg:()=>{const s=[1,0.5,0,0.5];const a=ax2({xr:[-1,25],yr:[-0.15,1.3],xlabel:'n',ylabel:'x_{(3)}[n]',ytarget:2});
   a.stem(D(n=>n%3===0?s[(n/3)%4]:0,0,24),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'$x_{(3)}[n]$: two zeros after each sample, period $12$.'}
]},

{t:'h3', text:'Periodic convolution'},
{t:'p', text:'Two periodic signals cannot be convolved over all time: the integral would not converge. Integrate over one period instead. The result $z(t)=\\int_{T_0}x(\\tau)\\,y(t-\\tau)\\,\\d\\tau$ has period $T_0$. To find its coefficients, substitute $z$ into the analysis equation and exchange the two integrals. In the inner integral put $\\sigma=t-\\tau$ with $\\tau$ fixed; $t$ over one period gives $\\sigma$ over one period, and $e^{-jk\\omega_0t}=e^{-jk\\omega_0\\sigma}e^{-jk\\omega_0\\tau}$:'},
{t:'eq', tex:'\\begin{aligned}c_k&=\\frac{1}{T_0}\\int_{T_0}\\Bigl[\\int_{T_0}x(\\tau)\\,y(t-\\tau)\\,\\d\\tau\\Bigr]e^{-jk\\omega_0t}\\,\\d t\\\\&=\\frac{1}{T_0}\\int_{T_0}x(\\tau)\\Bigl[\\int_{T_0}y(t-\\tau)\\,e^{-jk\\omega_0t}\\,\\d t\\Bigr]\\d\\tau\\\\&=\\frac{1}{T_0}\\int_{T_0}x(\\tau)\\,e^{-jk\\omega_0\\tau}\\Bigl[\\int_{T_0}y(\\sigma)\\,e^{-jk\\omega_0\\sigma}\\,\\d\\sigma\\Bigr]\\d\\tau\\\\&=\\frac{1}{T_0}\\int_{T_0}x(\\tau)\\,e^{-jk\\omega_0\\tau}\\,\\bigl[T_0\\,b_k\\bigr]\\,\\d\\tau=T_0\\,b_k\\,a_k.\\end{aligned}'},
{t:'eqbox', cap:'Periodic convolution',
 tex:['\\int_{T_0}x(\\tau)\\,y(t-\\tau)\\,\\d\\tau\\;\\longleftrightarrow\\;T_0\\,a_k\\,b_k,\\qquad \\sum_{r=\\langle N\\rangle}x[r]\\,y[n-r]\\;\\longleftrightarrow\\;N\\,a_k\\,b_k'],
 after:'The discrete-time proof is the same with sums, and the factor is $N$. Keep the factor $T_0$ or $N$: without it the shape of the result is right and its size is wrong.'},
{t:'ex', hd:'Example 4.13 — a rectangular wave convolved with itself', rows:[
 ['Given','The rectangular wave with $T_0=2$ and $T_1=0.5$: $x(t)=1$ for $|t|<0.5$ and $0$ for $0.5<|t|<1$, repeated. Let $z(t)=\\int_{T_0}x(\\tau)\\,x(t-\\tau)\\,\\d\\tau$.'],
 ['Find','The coefficients of $z$, its mean, and its shape.'],
 ['Method','Here $T_0=4T_1$, so Example 4.7 gives $a_0=\\tfrac12$ and $a_k=\\sin(\\pi k/2)/(\\pi k)$. Apply the periodic-convolution property with $b_k=a_k$. For the shape, compute the overlap of the two pulses directly.'],
 ['Solution','The property gives $c_k=T_0a_k^{2}=2a_k^{2}$. So $c_0=2\\cdot\\tfrac14=\\tfrac12$. For odd $k$, $\\sin^{2}(\\pi k/2)=1$ and $c_k=2/(\\pi^{2}k^{2})$. For even $k\\neq0$, $c_k=0$. The mean of $z$ is $c_0=\\tfrac12$. For the shape, take $\\tau$ over the period $-1<\\tau<1$ and $0\\le t\\le1$. The first pulse is 1 on $-\\tfrac12<\\tau<\\tfrac12$. The second, $x(t-\\tau)$, is 1 on $t-\\tfrac12<\\tau<t+\\tfrac12$. They overlap on $t-\\tfrac12<\\tau<\\tfrac12$, of length $1-t$. By symmetry the overlap is $1+t$ for $-1\\le t\\le0$. So $z(t)=1-|t|$ on $|t|\\le1$, repeated every 2: a triangular wave with peak 1.'],
 ['Check','The mean of the triangle over one period is $\\frac12\\int_{-1}^{1}(1-|t|)\\,\\d t=\\frac12\\cdot2\\Bigl[t-\\frac{t^{2}}{2}\\Bigr]_0^1=\\frac12\\cdot2\\cdot\\frac12=\\frac12=c_0$. Also compute $c_1$ of the triangle directly. The triangle is even, so $c_1=\\frac12\\int_{-1}^{1}(1-|t|)\\cos(\\pi t)\\,\\d t=\\int_0^1(1-t)\\cos(\\pi t)\\,\\d t$. By parts with $u=1-t$ and $\\d v=\\cos(\\pi t)\\,\\d t$: $\\Bigl[(1-t)\\frac{\\sin\\pi t}{\\pi}\\Bigr]_0^1+\\int_0^1\\frac{\\sin\\pi t}{\\pi}\\,\\d t=0+\\frac{1}{\\pi}\\Bigl[-\\frac{\\cos\\pi t}{\\pi}\\Bigr]_0^1=\\frac{2}{\\pi^{2}}$. The property gives $2a_1^{2}=2/\\pi^{2}$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.3,1.4],xlabel:'t',ylabel:'x(t)',ytarget:2});
   a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000}); return a.svg();},
  cap:'The rectangular wave, $T_0=2$, $T_1=0.5$.'},
 {svg:()=>{const a=ax2({xr:[-2.2,2.2],yr:[-0.3,1.4],xlabel:'t',ylabel:'z(t)',ytarget:2});
   a.curve(t=>{const u=t-2*Math.round(t/2);return 1-Math.abs(u);},{color:C.out,n:3000}); return a.svg();},
  cap:'Its periodic convolution with itself: a triangular wave, peak 1, mean $\\tfrac12$.'}
]},

{t:'h3', text:'Multiplication'},
{t:'p', text:'Multiply the two synthesis sums. Use a second index $m$ for the second sum, so that the two stay separate. Then collect the terms with the same total index $k=\\ell+m$, that is, $m=k-\\ell$:'},
{t:'eq', tex:'\\begin{aligned}x(t)\\,y(t)&=\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,e^{j\\ell\\omega_0t}\\sum_{m=-\\infty}^{\\infty}b_m\\,e^{jm\\omega_0t}=\\sum_{\\ell}\\sum_{m}a_\\ell\\,b_m\\,e^{j(\\ell+m)\\omega_0t}\\\\&=\\sum_{k=-\\infty}^{\\infty}\\Bigl(\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,b_{k-\\ell}\\Bigr)e^{jk\\omega_0t}.\\end{aligned}'},
{t:'p', text:'The indices $\\ell$ and $k-\\ell$ add to $k$, so the new coefficients are a convolution of the two coefficient sequences. In discrete time both synthesis sums run over one period. For fixed $\\ell$, as $m$ runs over one period so does $k=\\ell+m$, and $b$ repeats every $N$, so'},
{t:'eq', tex:'x[n]\\,y[n]=\\sum_{\\ell=\\langle N\\rangle}\\sum_{m=\\langle N\\rangle}a_\\ell\\,b_m\\,e^{j(\\ell+m)(2\\pi/N)n}=\\sum_{k=\\langle N\\rangle}\\Bigl(\\sum_{\\ell=\\langle N\\rangle}a_\\ell\\,b_{k-\\ell}\\Bigr)e^{jk(2\\pi/N)n}.'},
{t:'eqbox', cap:'Multiplication',
 tex:['x(t)\\,y(t)\\;\\longleftrightarrow\\;\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell\\,b_{k-\\ell},\\qquad x[n]\\,y[n]\\;\\longleftrightarrow\\;\\sum_{\\ell=\\langle N\\rangle}a_\\ell\\,b_{k-\\ell}']},
{t:'box', kind:'err', hd:'One period of $\\ell$', html:'The discrete-time product sums over one period of $\\ell$ only: it is a <b>periodic</b> convolution of the coefficients. Discrete-time coefficients repeat, so a sum over all $\\ell$ would add the same $N$ products again and again and diverge.'},
{t:'p', text:'For example, take $x(t)=y(t)=\\cos(\\omega_0t)$, with $a_{\\pm1}=\\tfrac12$ and every other $a_k=0$. The product $\\cos^{2}(\\omega_0t)$ has $c_0=a_1a_{-1}+a_{-1}a_1=\\tfrac14+\\tfrac14=\\tfrac12$ and $c_{\\pm2}=a_{\\pm1}a_{\\pm1}=\\tfrac14$. The terms for $c_{\\pm1}$ all contain $a_0=0$, so $c_{\\pm1}=0$. This agrees with $\\cos^{2}\\theta=\\tfrac12+\\tfrac12\\cos2\\theta=\\tfrac12+\\tfrac14e^{j2\\theta}+\\tfrac14e^{-j2\\theta}$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-4.5,4.5],yr:[-0.06,0.66],xlabel:'k',ylabel:'a_k',ytarget:4});
   a.stem(D(q=>Math.abs(q)===1?0.5:0,-4,4),{color:C.in,r:3,showZero:true}); return a.svg();},
  cap:'$\\cos(\\omega_0t)$: $a_{\\pm1}=\\tfrac12$.'},
 {svg:()=>{const a=ax2({xr:[-4.5,4.5],yr:[-0.06,0.66],xlabel:'k',ylabel:'c_k',ytarget:4});
   a.stem(D(q=>q===0?0.5:(Math.abs(q)===2?0.25:0),-4,4),{color:C.out,r:3,showZero:true}); return a.svg();},
  cap:'$\\cos^{2}(\\omega_0t)$: the pair convolved with itself.'}
]},

{t:'h3', text:'Differentiation and integration'},
{t:'p', text:'Differentiate the synthesis equation term by term. The derivative of $e^{jk\\omega_0t}$ is $jk\\omega_0\\,e^{jk\\omega_0t}$:'},
{t:'eq', tex:'\\frac{\\d x(t)}{\\d t}=\\sum_{k=-\\infty}^{\\infty}a_k\\,\\frac{\\d}{\\d t}e^{jk\\omega_0t}=\\sum_{k=-\\infty}^{\\infty}jk\\omega_0\\,a_k\\,e^{jk\\omega_0t}.'},
{t:'p', text:'So $\\d x/\\d t\\leftrightarrow jk\\omega_0a_k$. The factor grows with $k$, so differentiation raises the high harmonics. For example, $x(t)=\\sin(\\pi t)$ has $\\omega_0=\\pi$ and $a_1=\\tfrac{1}{2j}$. The derivative has $jk\\omega_0a_1=j\\pi\\cdot\\tfrac{1}{2j}=\\tfrac{\\pi}{2}$ at $k=1$. Directly, $\\d x/\\d t=\\pi\\cos(\\pi t)$, whose coefficient at $k=1$ is $\\tfrac{\\pi}{2}$.'},
{t:'p', text:'Integration runs the same rule backwards. Suppose the running integral $y(t)=\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau$ is periodic, with coefficients $c_k$. Then $\\d y/\\d t=x$, and the differentiation rule gives $jk\\omega_0c_k=a_k$ for every $k$. At $k=0$ this reads $0=a_0$. So a periodic integral needs $a_0=0$. For $k\\neq0$, $c_k=a_k/(jk\\omega_0)$. The rule does not fix $c_0$, the mean of $y$; it depends on the constant of integration.'},
{t:'eqbox', cap:'Differentiation and integration',
 tex:['\\frac{\\d x(t)}{\\d t}\\;\\longleftrightarrow\\;jk\\omega_0\\,a_k,\\qquad \\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\longleftrightarrow\\;\\frac{a_k}{jk\\omega_0}\\ \\ (k\\neq0),\\quad\\text{only if }a_0=0'],
 after:'If $a_0\\neq0$, the mean integrates to the ramp $a_0t$, which is not periodic. Remove the mean, integrate the rest, then add $a_0t$ back: $\\int_0^{t}x\\,\\d\\tau=a_0t+\\int_0^{t}(x-a_0)\\,\\d\\tau$.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax3({xr:[-0.2,4.2],yr:[-0.5,2.4],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>rectWave(t,2,0.5),{color:C.in,n:3000}); a.hline(0.5,{color:C.coral,dash:'4 5'}); return a.svg();},
  cap:'$x(t)$, $T_0=2$, mean $a_0=0.5$ (dashed).'},
 {svg:()=>{const a=ax3({xr:[-0.2,4.2],yr:[-0.5,2.4],xlabel:'t',ylabel:'\\text{integral}'});
   a.curve(t=>triI(t)+0.5*t,{color:C.err,n:3000}); return a.svg();},
  cap:'$\\int_0^{t}x\\,\\d\\tau$ drifts upward.'},
 {svg:()=>{const a=ax3({xr:[-0.2,4.2],yr:[-0.5,2.4],xlabel:'t',ylabel:'\\text{integral}'});
   a.curve(triI,{color:C.out,n:3000}); return a.svg();},
  cap:'$\\int_0^{t}(x-a_0)\\,\\d\\tau$ is a periodic triangle.'}
]},

{t:'h3', text:'First difference and running sum'},
{t:'p', text:'In discrete time the first difference takes the place of the derivative. By linearity and the time shift with $n_0=1$,'},
{t:'eq', tex:'x[n]-x[n-1]\\;\\longleftrightarrow\\;a_k-a_k\\,e^{-jk(2\\pi/N)}=\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)\\,a_k.'},
{t:'p', text:'At $k=0$ the factor is $1-e^{0}=0$: a difference of a periodic sequence always has mean zero. The running sum $s[n]=\\sum_{r=-\\infty}^{n}x[r]$ satisfies $s[n]-s[n-1]=x[n]$. If $s$ is periodic with coefficients $c_k$, the first-difference rule gives $\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)c_k=a_k$. At $k=0$ this reads $0=a_0$, the same condition as for the integral. Otherwise $c_k=a_k/\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)$.'},
{t:'eqbox', cap:'First difference and running sum',
 tex:['x[n]-x[n-1]\\;\\longleftrightarrow\\;\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)a_k,\\qquad \\sum_{r=-\\infty}^{n}x[r]\\;\\longleftrightarrow\\;\\frac{a_k}{1-e^{-jk(2\\pi/N)}},\\quad\\text{only if }a_0=0'],
 after:'If $a_0\\neq0$, each period adds $\\sum_{r=\\langle N\\rangle}x[r]=Na_0$ to the running total, so the sum never repeats.'},
{t:'p', text:'Take $x[n]=1,1,-1,-1$ repeating, with $N=4$ and $a_0=\\tfrac14(1+1-1-1)=0$. Its running sum repeats every 4. Now take $x[n]=1,1,1,-1$ repeating, with $a_0=\\tfrac14(1+1+1-1)=\\tfrac12$. Its running sum climbs by $Na_0=4\\cdot\\tfrac12=2$ every period.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const s=[1,1,-1,-1];const a=ax2({xr:[-0.8,16.8],yr:[-0.6,9.5],xlabel:'n',ylabel:'s[n]',ytarget:4});
   a.stem(D(n=>{let v=0;for(let r=0;r<=n;r++)v+=s[r%4];return v;},0,16),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'$x[n]=1,1,-1,-1,\\dots$: mean zero, and $s[n]=\\sum_{r=0}^{n}x[r]$ repeats.'},
 {svg:()=>{const s=[1,1,1,-1];const a=ax2({xr:[-0.8,16.8],yr:[-0.6,9.5],xlabel:'n',ylabel:'s[n]',ytarget:4});
   a.stem(D(n=>{let v=0;for(let r=0;r<=n;r++)v+=s[r%4];return v;},0,16),{color:C.err,r:2.6,showZero:true}); return a.svg();},
  cap:'$x[n]=1,1,1,-1,\\dots$: mean $\\tfrac12$, and $s[n]$ climbs by 2 each period.'}
]},

{t:'h3', text:'Parseval’s relation'},
{t:'eqbox', cap:'Parseval’s relation',
 tex:['\\frac{1}{T_0}\\int_{T_0}\\bigl|x(t)\\bigr|^{2}\\,\\d t=\\sum_{k=-\\infty}^{\\infty}\\bigl|a_k\\bigr|^{2}',
      '\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\bigl|x[n]\\bigr|^{2}=\\sum_{k=\\langle N\\rangle}\\bigl|a_k\\bigr|^{2}'],
 after:'The left side is the average power over one period, with the normalised convention $R=1\\,\\Omega$. The right side splits it among the harmonics: $|a_k|^{2}$ is the power carried by harmonic $k$ alone, and the shares add up to the total.'},
{t:'p', text:'To derive the continuous-time form, write $|x(t)|^{2}=x(t)\\,x^{*}(t)$. Substitute the series for $x$, and the conjugated series for $x^{*}$ with a second index $m$ so that the two sums stay separate. Then integrate over one period. The orthogonality integral of Section 4.2 is $T_0$ when $m=k$ and zero otherwise, so only the terms with $m=k$ survive:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{T_0}\\int_{T_0}x(t)\\,x^{*}(t)\\,\\d t&=\\frac{1}{T_0}\\int_{T_0}\\Bigl(\\sum_{k}a_ke^{jk\\omega_0t}\\Bigr)\\Bigl(\\sum_{m}a_m^{*}e^{-jm\\omega_0t}\\Bigr)\\d t\\\\&=\\sum_{k}\\sum_{m}a_k\\,a_m^{*}\\,\\frac{1}{T_0}\\int_{T_0}e^{j(k-m)\\omega_0t}\\,\\d t\\\\&=\\sum_{k}a_k\\,a_k^{*}=\\sum_{k}|a_k|^{2}.\\end{aligned}'},
{t:'p', text:'The discrete-time form follows by the same steps, with sums in place of the integral and the discrete orthogonality of Section 4.4. For example, $x(t)=2\\cos(\\omega_0t)$ has $a_{\\pm1}=1$, so its power is $|a_1|^{2}+|a_{-1}|^{2}=2$. Directly, $\\frac{1}{T_0}\\int_{T_0}4\\cos^{2}(\\omega_0t)\\,\\d t=4\\cdot\\tfrac12=2$.'},
{t:'ex', hd:'Example 4.14 — Parseval’s relation for two waves', rows:[
 ['Given','The rectangular wave with $T_0=4T_1$ and the sawtooth with $T_0=1$.'],
 ['Find','The average power of each, in time and from the coefficients, and the share of the rectangular wave’s power in its constant term.'],
 ['Method','In time, integrate $|x|^{2}$ over one period. From the coefficients, use Examples 4.7 and 4.8 and the known sum $\\sum_{k\\ge1}1/k^{2}=\\pi^{2}/6$. Its odd terms alone add to $\\pi^{2}/6-\\tfrac14\\cdot\\pi^{2}/6=\\pi^{2}/8$, because the even terms are $\\sum_{m\\ge1}1/(2m)^{2}=\\tfrac14\\sum_{m\\ge1}1/m^{2}$.'],
 ['Solution','Rectangular wave, in time: $|x|^{2}=1$ on $|t|<T_1$ and 0 elsewhere, so the power is $\\frac{1}{T_0}\\int_{-T_1}^{T_1}1\\,\\d t=\\frac{2T_1}{T_0}=\\tfrac12$. From the coefficients, $a_0=\\tfrac12$, $a_k^{2}=1/(\\pi^{2}k^{2})$ for odd $k$, and $a_k=0$ for even $k\\neq0$. The negative $k$ repeat the positive ones: $$a_0^{2}+2\\sum_{k\\ \\text{odd}\\ge1}\\frac{1}{\\pi^{2}k^{2}}=\\frac14+\\frac{2}{\\pi^{2}}\\cdot\\frac{\\pi^{2}}{8}=\\frac14+\\frac14=\\frac12.$$ Sawtooth, in time: $$\\int_{-1/2}^{1/2}t^{2}\\,\\d t=\\left[\\frac{t^{3}}{3}\\right]_{-1/2}^{1/2}=\\frac{1}{24}+\\frac{1}{24}=\\frac{1}{12}.$$ From the coefficients, $|a_k|^{2}=1/(4\\pi^{2}k^{2})$ and $a_0=0$: $$2\\sum_{k\\ge1}\\frac{1}{4\\pi^{2}k^{2}}=\\frac{1}{2\\pi^{2}}\\cdot\\frac{\\pi^{2}}{6}=\\frac{1}{12}.$$ The constant term of the rectangular wave carries $a_0^{2}=\\tfrac14$ of the total $\\tfrac12$, which is one half.'],
 ['Check','Both waves give the same power in time and from the coefficients.']
]},
{t:'p', text:'Parseval’s relation also measures truncation error. By linearity, $e_N=x-x_N$ has coefficients $a_k-a_k=0$ for $|k|\\le N$ and $a_k-0=a_k$ for $|k|>N$. Parseval’s relation applied to $e_N$ gives'},
{t:'eq', tex:'\\text{MSE}=\\frac{1}{T_0}\\int_{T_0}\\bigl|e_N(t)\\bigr|^{2}\\,\\d t=\\sum_{|k|>N}\\bigl|a_k\\bigr|^{2}.'},
{t:'p', text:'The mean-square error of a partial sum is exactly the power in the dropped harmonics. For the rectangular wave with $T_0=4T_1$ and $N=3$, the kept power is $\\tfrac14+2\\bigl(\\tfrac{1}{\\pi^{2}}+\\tfrac{1}{9\\pi^{2}}\\bigr)=\\tfrac14+\\tfrac{20}{9\\pi^{2}}=0.4752$, so the MSE is $0.5-0.4752=0.025$, the first entry of the table in Section 4.3.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-12.5,12.5],yr:[-0.02,0.3],xlabel:'k',ylabel:'|a_k|^{2}',ytarget:4});
   a.stem(D(k=>aq(k)*aq(k),-12,12),{color:C.in,r:2.4,showZero:true}); return a.svg();},
  cap:'Power per harmonic of the rectangular wave with $T_0=4T_1$. The stems add to $0.5$.'},
 {svg:()=>{const a=ax2({xr:[-0.8,20.8],yr:[0,0.66],xlabel:'N',ylabel:'\\text{power kept}',ytarget:4});
   const kept=N=>{let s=0.25;for(let k=1;k<=N;k++)s+=2*aq(k)*aq(k);return s;};
   a.hline(0.5,{color:C.coral,dash:'4 5'}); a.stem(D(kept,0,20),{color:C.out,r:2.4}); return a.svg();},
  cap:'Power in the harmonics $|k|\\le N$. It reaches the total $0.5$ (dashed) only in the limit.'}
]},

/* ================================================================ 4.6 */
{t:'h2', num:'4.6', text:'A periodic input through an LTI system'},
{t:'p', text:'Apply the eigenfunction property of Section 4.1 to each term of the synthesis equation. The term $a_ke^{jk\\omega_0t}$ is a complex exponential with $s=jk\\omega_0$, so the system multiplies it by $H(jk\\omega_0)$. The system is linear, so the outputs of all the terms add:'},
{t:'eqbox', cap:'One multiplication per harmonic',
 tex:['x(t)=\\sum_{k=-\\infty}^{\\infty}a_ke^{jk\\omega_0t}\\;\\longrightarrow\\;y(t)=\\sum_{k=-\\infty}^{\\infty}\\underbrace{a_kH(jk\\omega_0)}_{b_k}e^{jk\\omega_0t}',
      'x[n]=\\sum_{k=\\langle N\\rangle}a_ke^{jk\\omega_0n}\\;\\longrightarrow\\;y[n]=\\sum_{k=\\langle N\\rangle}a_kH(e^{jk\\omega_0})\\,e^{jk\\omega_0n}'],
 after:'The output has the period of the input. The frequency response describes the system. For a periodic input, calculate one product at each harmonic instead of a convolution.'},
{t:'p', text:'Each $b_k$ is a product of complex numbers, so magnitudes multiply and phases add: $|b_k|=|a_k|\\,|H(jk\\omega_0)|$ and $\\angle b_k=\\angle a_k+\\angle H(jk\\omega_0)$. For example, $a_1=1$ and $H(j\\omega_0)=e^{-j\\pi/4}$ give $b_1=e^{-j\\pi/4}$.'},
{t:'fig', svg:()=>{const items=[], R=[['a_{-1}e^{-j\\omega_0t}','b_{-1}e^{-j\\omega_0t}'],['a_0','a_0H(0)'],['a_1e^{j\\omega_0t}','b_1e^{j\\omega_0t}']];
  R.forEach(([u,w],j)=>{const y=34+j*56;
    items.push({t:'text',x:60,y:y+6,label:u,anchor:'start',tex:true,fs:15,color:'#14707F'},
      {t:'arrow',x1:190,y1:y,x2:280,y2:y},{t:'box',x:280,y:y-20,w:120,h:40,label:'H(j\\omega)',tex:true},
      {t:'arrow',x1:400,y1:y,x2:480,y2:y},
      {t:'text',x:490,y:y+6,label:w,anchor:'start',tex:true,fs:15,color:'#4A7A46'});});
  return P.blocks({w:700,h:180,items});},
 cap:'Each harmonic is an eigenfunction. It passes through on its own and comes out scaled by $H$ at its own frequency.'},

{t:'h3', text:'Putting a real output back together'},
{t:'p', text:'The result above is a sum of complex terms. For real $x$, $a_{-k}=a_k^{*}$. For real $h$, conjugating $H(j\\omega)=\\int h(\\tau)e^{-j\\omega\\tau}\\,\\d\\tau$ conjugates only the exponential, so $H^{*}(j\\omega)=\\int h(\\tau)e^{+j\\omega\\tau}\\,\\d\\tau=H(-j\\omega)$. Together, $b_{-k}=a_{-k}H(-jk\\omega_0)=a_k^{*}H^{*}(jk\\omega_0)=b_k^{*}$. Pair each $k$ with $-k$, write $b_k=|b_k|e^{j\\angle b_k}$, and use $e^{j\\theta}+e^{-j\\theta}=2\\cos\\theta$:'},
{t:'eq', tex:'\\begin{aligned}b_ke^{jk\\omega_0t}+b_{-k}e^{-jk\\omega_0t}&=|b_k|e^{j\\angle b_k}e^{jk\\omega_0t}+|b_k|e^{-j\\angle b_k}e^{-jk\\omega_0t}\\\\&=|b_k|\\Bigl[e^{j(k\\omega_0t+\\angle b_k)}+e^{-j(k\\omega_0t+\\angle b_k)}\\Bigr]\\\\&=2|b_k|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr).\\end{aligned}'},
{t:'eqbox', cap:'Conjugate-pair reassembly',
 tex:['y(t)=b_0+\\sum_{k=1}^{\\infty}2\\bigl|b_k\\bigr|\\cos\\bigl(k\\omega_0t+\\angle b_k\\bigr)'],
 after:'$b_0$ has no partner, so it carries no factor of two. This is the amplitude–phase form of Section 4.2 applied to the output.'},
{t:'box', kind:'err', hd:'Two slips', html:'The amplitude of the $k$-th cosine is $2|b_k|$, because both members of the pair contribute. Using $|b_k|$ halves every amplitude. The phase is $\\angle b_k$, the one for <b>positive</b> $k$; using $\\angle b_{-k}$ flips every phase. For example, $b_1=0.6e^{j0.5}$ with $\\omega_0=\\pi$ gives $1.2\\cos(\\pi t+0.5)$, not $0.6\\cos(\\pi t+0.5)$. Test any reassembly by setting $H=1$: it must return the input exactly.'},
{t:'fig', svg:()=>{const a=ax({xr:[0,4],yr:[-1.6,1.9],xlabel:'t',ylabel:'\\text{amplitude}',xtarget:8});
  a.curve(t=>0.6*Math.cos(Math.PI*t+0.5),{color:C.err,dash:'8 5',n:1600});
  a.curve(t=>1.2*Math.cos(Math.PI*t+0.5),{color:C.out,n:1600}); return a.svg();},
 cap:'$b_1=0.6e^{j0.5}$ with $\\omega_0=\\pi$. The pair $k=\\pm1$ adds to $2|b_1|\\cos(\\pi t+0.5)$, amplitude $1.2$ (solid). One term alone gives half (dashed).'},

{t:'ex', hd:'Example 4.15 — low-pass filtering', rows:[
 ['Given','$x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos\\!\\left(3\\pi t+\\frac{\\pi}{3}\\right)$ into the system with $h(t)=e^{-t}u(t)$.'],
 ['Find','The output signal.'],
 ['Method','The input is periodic and the system is LTI, so harmonic multiplication applies. Take $H(j\\omega)$ from Example 4.1. Find $T_0$ and $a_k$ from $x$. Form $b_k=a_kH(jk\\omega_0)$ and reassemble each conjugate pair.'],
 ['Solution','Example 4.1 gives $H(j\\omega)=1/(1+j\\omega)$, so $|H(j\\omega)|=1/\\sqrt{1+\\omega^{2}}$ and $\\angle H(j\\omega)=-\\arctan\\omega$. $|H|$ falls from 1 at $\\omega=0$ towards 0: a low-pass system. Next the input. The component periods are $2\\pi/\\pi=2$, $2\\pi/(2\\pi)=1$ and $2\\pi/(3\\pi)=2/3$ s. This is case (c) of Example 4.4, so $T_0=2$ s and $\\omega_0=\\pi$ rad/s. The three frequencies are $1\\omega_0$, $2\\omega_0$ and $3\\omega_0$. Euler’s relations give the coefficients for positive $k$: $$\\begin{gathered}\\cos(\\pi t)\\to a_1=\\tfrac12,\\\\[3pt]\\sin(2\\pi t)=\\tfrac{1}{2j}e^{j2\\pi t}-\\tfrac{1}{2j}e^{-j2\\pi t}\\to a_2=\\tfrac{1}{2j}=\\tfrac12e^{-j\\pi/2},\\\\[3pt]\\cos\\!\\left(3\\pi t+\\tfrac{\\pi}{3}\\right)\\to a_3=\\tfrac12e^{j\\pi/3},\\end{gathered}$$ with $a_0=1$ and $a_{-k}=a_k^{*}$. The values of $H$ at the three harmonics are $$\\begin{aligned}|H(j\\pi)|&=\\frac{1}{\\sqrt{1+\\pi^{2}}}=0.3033,&\\angle H(j\\pi)&=-\\arctan\\pi=-1.2626,\\\\|H(j2\\pi)|&=\\frac{1}{\\sqrt{1+4\\pi^{2}}}=0.1572,&\\angle H(j2\\pi)&=-\\arctan2\\pi=-1.4130,\\\\|H(j3\\pi)|&=\\frac{1}{\\sqrt{1+9\\pi^{2}}}=0.1055,&\\angle H(j3\\pi)&=-\\arctan3\\pi=-1.4651.\\end{aligned}$$ Now one product per harmonic, $b_k=a_kH(jk\\pi)$: magnitudes multiply and phases add. $$\\begin{aligned}b_0&=a_0H(j0)=1\\cdot1=1,\\\\b_1&=\\tfrac12(0.3033)\\,e^{-j1.2626}=0.1517e^{-j1.263},\\\\b_2&=\\tfrac12(0.1572)\\,e^{j(-\\pi/2-1.4130)}=0.0786e^{-j2.984},\\\\b_3&=\\tfrac12(0.1055)\\,e^{j(\\pi/3-1.4651)}=0.0528e^{-j0.418}.\\end{aligned}$$ Finally reassemble each pair into a cosine of amplitude $2|b_k|$ and phase $\\angle b_k$: $$\\begin{aligned}y(t)=1&+0.303\\cos(\\pi t-1.263)+0.157\\cos(2\\pi t-2.984)\\\\&+0.106\\cos(3\\pi t-0.418).\\end{aligned}$$'],
 ['Check','Each amplitude is $2|b_k|$: $2\\cdot0.1517=0.303$, $2\\cdot0.0786=0.157$, $2\\cdot0.0528=0.106$. The average is $b_0=1$, since $H(0)=1$. The third harmonic falls from amplitude 1 to $0.106$, about one tenth. The output ranges from about $0.615$ to $1.417$; half the amplitudes would give only $0.81$ to $1.21$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[0,12],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',xticksOverride:[Math.PI,2*Math.PI,3*Math.PI],xtickfmt:piTick});
   const Hm=w=>1/Math.sqrt(1+w*w); a.curve(Hm,{color:C.h,n:900});
   [0,1,2,3].forEach(k=>a.point(k*Math.PI,Hm(k*Math.PI),{color:C.coral,r:4})); return a.svg();},
  cap:'$|H(j\\omega)|$ with the four input harmonics marked at $k\\omega_0$, $\\omega_0=\\pi$.'},
 {svg:()=>{const a=ax2({xr:[0,4],yr:[-1.5,4.2],xlabel:'t',ylabel:'\\text{amplitude}'});
   a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.ink,opacity:.35,dash:'6 5',n:1600});
   a.curve(t=>1+0.303316*Math.cos(Math.PI*t-1.262627)+0.157177*Math.cos(2*Math.PI*t-2.983761)+0.105510*Math.cos(3*Math.PI*t-0.417840),{color:C.out,n:1600}); return a.svg();},
  cap:'$x(t)$ (dashed) and $y(t)$ (solid): the average stays at 1 and the fast wiggles shrink.'}
]},

{t:'ex', hd:'Example 4.16 — high-pass filtering', rows:[
 ['Given','The same $x(t)$, now into a system with $H(j\\omega)=\\dfrac{j\\omega}{1+j\\omega}$.'],
 ['Find','The output signal.'],
 ['Method','Use the same harmonic multiplication as in Example 4.15. Find the magnitude and phase of the new $H$, compute each $b_k$, and reassemble the pairs.'],
 ['Solution','The magnitude of a quotient is the quotient of the magnitudes, and its phase is the difference of the phases. The numerator $j\\omega$ has magnitude $|\\omega|$ and phase $+\\pi/2$ for $\\omega>0$, $-\\pi/2$ for $\\omega<0$. The denominator $1+j\\omega$ has magnitude $\\sqrt{1+\\omega^{2}}$ and phase $\\arctan\\omega$: $$|H(j\\omega)|=\\frac{|\\omega|}{\\sqrt{1+\\omega^{2}}},\\qquad\\angle H(j\\omega)=\\frac{\\pi}{2}\\operatorname{sgn}(\\omega)-\\arctan\\omega.$$ First, $H(j0)=0/(1+0)=0$, so $b_0=a_0H(j0)=0$ for every input: removing the average is what a high-pass system does. For $k\\ge1$, with the values of $\\sqrt{1+k^{2}\\pi^{2}}$ and $\\arctan(k\\pi)$ from Example 4.15, $$\\begin{aligned}|H(j\\pi)|&=\\frac{3.1416}{3.2969}=0.9529,&\\angle H(j\\pi)&=1.5708-1.2626=0.3082,\\\\|H(j2\\pi)|&=\\frac{6.2832}{6.3623}=0.9876,&\\angle H(j2\\pi)&=1.5708-1.4130=0.1578,\\\\|H(j3\\pi)|&=\\frac{9.4248}{9.4777}=0.9944,&\\angle H(j3\\pi)&=1.5708-1.4651=0.1057.\\end{aligned}$$ The input coefficients are as before: $a_1=\\tfrac12$, $a_2=\\tfrac12e^{-j\\pi/2}$, $a_3=\\tfrac12e^{j\\pi/3}$. Multiply the magnitudes and add the phases: $$\\begin{aligned}b_1&=\\tfrac12(0.9529)\\,e^{j0.3082}=0.4764e^{j0.308},\\\\b_2&=\\tfrac12(0.9876)\\,e^{j(-\\pi/2+0.1578)}=0.4938e^{-j1.413},\\\\b_3&=\\tfrac12(0.9944)\\,e^{j(\\pi/3+0.1057)}=0.4972e^{j1.153}.\\end{aligned}$$ Pair $k$ with $-k$ as before: $$y(t)=0.953\\cos(\\pi t+0.308)+0.988\\cos(2\\pi t-1.413)+0.994\\cos(3\\pi t+1.153).$$ There is no constant term, because $b_0=0$.'],
 ['Check','$|H(jk\\pi)|$ is close to 1 for $k=1,2,3$. So $y$ should look like $x$ with its average of 1 removed, and the output amplitudes must be close to 1. Amplitudes of $0.48$, $0.49$ and $0.50$ would show that the factor of two is missing. Phases of $-0.308$, $+1.413$ and $-1.153$ would show that they were read from $b_{-k}$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[0,12],yr:[0,1.25],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'|H(j\\omega)|',xticksOverride:[Math.PI,2*Math.PI,3*Math.PI],xtickfmt:piTick});
   const Hm=w=>w/Math.sqrt(1+w*w); a.curve(Hm,{color:C.h,n:900});
   [0,1,2,3].forEach(k=>a.point(k*Math.PI,Hm(k*Math.PI),{color:C.coral,r:4})); return a.svg();},
  cap:'$|H(j\\omega)|$ of the high-pass system, with the same four harmonics.'},
 {svg:()=>{const a=ax2({xr:[0,4],yr:[-2.8,4.2],xlabel:'t',ylabel:'\\text{amplitude}'});
   a.curve(t=>1+Math.cos(Math.PI*t)+Math.sin(2*Math.PI*t)+Math.cos(3*Math.PI*t+Math.PI/3),{color:C.ink,opacity:.35,dash:'6 5',n:1600});
   a.curve(t=>0.952891*Math.cos(Math.PI*t+0.308169)+0.987573*Math.cos(2*Math.PI*t-1.412965)+0.994418*Math.cos(3*Math.PI*t+1.152956),{color:C.out,n:1600}); return a.svg();},
  cap:'$x(t)$ (dashed) and $y(t)$ (solid): the harmonics pass almost unchanged and the average drops to 0.'}
]},

{t:'h3', text:'Ideal frequency-selective filters'},
{t:'p', text:'A frequency-selective filter passes some bands of frequency and stops others. The ideal low-pass filter passes every frequency below a cutoff unchanged and removes every frequency above it:'},
{t:'eqbox', cap:'Ideal low-pass filter',
 tex:['H(j\\omega)=\\begin{cases}1,&|\\omega|<\\omega_c\\\\0,&|\\omega|>\\omega_c\\end{cases}\\qquad\\Longrightarrow\\qquad b_k=a_kH(jk\\omega_0)=\\begin{cases}a_k,&|k|\\omega_0<\\omega_c\\\\0,&|k|\\omega_0>\\omega_c\\end{cases}'],
 after:'$|\\omega|<\\omega_c$ is the passband, the rest is the stopband, and $\\omega_c$ in rad/s is the cutoff frequency. A real filter can only approach this shape. For a periodic input, the output is a partial sum of the input series, so beside each jump it shows the Gibbs ripple.'},
{t:'ex', hd:'Example 4.17 — an ideal low-pass filter on a rectangular wave', rows:[
 ['Given','The rectangular wave with $T_0=2$ and $T_1=0.5$, so $\\omega_0=\\pi$ rad/s, into an ideal low-pass filter with $\\omega_c=3.5\\pi$ rad/s. Then the same wave with $\\omega_c=2.5\\pi$ rad/s.'],
 ['Find','Both outputs.'],
 ['Method','Here $T_0=4T_1$, so Example 4.7 gives $a_0=\\tfrac12$ and $a_k=\\sin(\\pi k/2)/(\\pi k)$. Keep the harmonics with $|k|\\pi<\\omega_c$. The coefficients are real, so each pair gives $2a_k\\cos(k\\pi t)$.'],
 ['Solution','With $\\omega_c=3.5\\pi$ the passband keeps $|k|\\le3$. The kept values are $a_0=\\tfrac12$, $a_{\\pm1}=1/\\pi$, $a_{\\pm2}=0$ and $a_{\\pm3}=-1/(3\\pi)$. So $$y(t)=\\frac12+\\frac{2}{\\pi}\\cos\\pi t-\\frac{2}{3\\pi}\\cos3\\pi t.$$ With $\\omega_c=2.5\\pi$ the passband keeps $|k|\\le2$, and $a_{\\pm2}=0$, so only one cosine remains besides the constant: $$y(t)=\\frac12+\\frac{2}{\\pi}\\cos\\pi t.$$'],
 ['Check','At the jump $t=0.5$, $\\cos(\\pi/2)=\\cos(3\\pi/2)=0$, so both outputs equal $\\tfrac12$, the midpoint of the jump from 1 to 0. At $t=0$ the first output is $\\tfrac12+\\tfrac{2}{\\pi}-\\tfrac{2}{3\\pi}=\\tfrac12+\\tfrac{4}{3\\pi}=0.924$, close to $x(0)=1$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-6.6*PI,6.6*PI],yr:[0,1.35],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'H(j\\omega),\\ |a_k|',ytarget:2,xticksOverride:wTicks(-6*PI,6*PI,3*PI),xtickfmt:piTick});
   const wc=3.5*PI, K=3, ab=k=>Math.abs(aq(k)), S=pts=>pts.map(([k,v])=>[k*PI,v]);
   a.poly([[-6.6*PI,0],[-wc,0],[-wc,1],[wc,1],[wc,0],[6.6*PI,0]],{color:C.h});
   a.stem(S(D(ab,-K,K)),{color:C.out,r:3}); a.stem(S(D(ab,-6,-K-1).concat(D(ab,K+1,6))),{color:C.err,r:3}); return a.svg();},
  cap:'$\\omega_c=3.5\\pi$: the harmonics inside the passband pass unchanged; the rest are removed.'},
 {svg:()=>{const a=ax2({xr:[-2,2],yr:[-0.35,1.4],xlabel:'t',ylabel:'\\text{amplitude}',ytarget:2});
   a.curve(t=>rectWave(t,2,0.5),{color:C.ink,opacity:.35,dash:'6 5',n:3000});
   a.curve(t=>rectPS(t,3,2,0.5),{color:C.out,n:1600}); return a.svg();},
  cap:'The output (solid) is the partial sum with $N=3$ of the wave (dashed).'}
]},

{t:'h3', text:'Frequency-shaping filters'},
{t:'p', text:'A frequency-shaping filter changes the relative size of the harmonics instead of passing or stopping whole bands. An audio equaliser is one: it raises or lowers the bass and the treble. The differentiator, $H(j\\omega)=j\\omega$, is a simple example. It gives $b_k=jk\\omega_0\\,a_k$, which is the differentiation property of Section 4.5. Its gain $|k|\\omega_0$ grows with $k$, so the high harmonics are raised.'},
{t:'ex', hd:'Example 4.18 — a differentiator raises the third harmonic', rows:[
 ['Given','$x(t)=\\cos t+\\tfrac19\\cos3t$, so $\\omega_0=1$ rad/s, into $H(j\\omega)=j\\omega$.'],
 ['Find','The output, and how the size of the third harmonic relative to the first changes.'],
 ['Method','Read the $a_k$ with Euler’s relation, form $b_k=jk\\omega_0a_k$, and reassemble the pairs.'],
 ['Solution','$a_{\\pm1}=\\tfrac12$ and $a_{\\pm3}=\\tfrac{1}{18}$. Then $b_1=j\\cdot1\\cdot\\tfrac12=\\tfrac12e^{j\\pi/2}$ and $b_3=j\\cdot3\\cdot\\tfrac{1}{18}=\\tfrac16e^{j\\pi/2}$. Reassemble with amplitude $2|b_k|$ and phase $\\angle b_k$, and use $\\cos(\\theta+\\pi/2)=-\\sin\\theta$: $$y(t)=2\\cdot\\tfrac12\\cos\\!\\left(t+\\tfrac{\\pi}{2}\\right)+2\\cdot\\tfrac16\\cos\\!\\left(3t+\\tfrac{\\pi}{2}\\right)=-\\sin t-\\tfrac13\\sin3t.$$ The third harmonic is $\\tfrac19$ of the first at the input and $\\tfrac13$ at the output. The ratio grew by a factor of 3, the ratio of the gains $|H(j3)|/|H(j1)|=3/1$.'],
 ['Check','Differentiate directly: $\\frac{\\d}{\\d t}\\bigl(\\cos t+\\tfrac19\\cos3t\\bigr)=-\\sin t-\\tfrac39\\sin3t=-\\sin t-\\tfrac13\\sin3t$. In the same way, for $x(t)=\\cos2\\pi t+\\cos4\\pi t$ the gains are $2\\pi$ and $4\\pi$, so the second harmonic comes out twice as large as the first.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[0,12.6],yr:[-1.6,1.9],xlabel:'t',ylabel:'x(t)'});
   a.curve(t=>Math.cos(3*t)/9,{color:C.mid,dash:'3 5',n:1600});
   a.curve(t=>Math.cos(t)+Math.cos(3*t)/9,{color:C.in,n:1600}); return a.svg();},
  cap:'The input. The dotted trace is its third harmonic, $\\tfrac19\\cos3t$.'},
 {svg:()=>{const a=ax2({xr:[0,12.6],yr:[-1.6,1.9],xlabel:'t',ylabel:'y(t)'});
   a.curve(t=>-Math.sin(3*t)/3,{color:C.mid,dash:'3 5',n:1600});
   a.curve(t=>-Math.sin(t)-Math.sin(3*t)/3,{color:C.out,n:1600}); return a.svg();},
  cap:'The output. Its third harmonic, $-\\tfrac13\\sin3t$, is relatively three times larger.'}
]},

{t:'h3', text:'Discrete-time filtering'},
{t:'ex', hd:'Example 4.19 — two two-tap filters on an impulse train', rows:[
 ['Given','$x[n]=\\sum_{m=-\\infty}^{\\infty}\\delta[n-4m]$, and the systems $h_1[n]=0.5\\delta[n]-0.5\\delta[n-1]$ and $h_2[n]=0.5\\delta[n]+0.5\\delta[n-1]$.'],
 ['Find','Both output signals.'],
 ['Method','The input is periodic and both systems are LTI, so discrete-time harmonic multiplication applies. Find $a_k$ for the impulse train, compute $b_k=a_kH(e^{jk\\omega_0})$ with $\\omega_0=2\\pi/4=\\pi/2$, and reassemble the pairs.'],
 ['Solution','First the input coefficients. One period is $n=0,1,2,3$ and contains one impulse, at $n=0$, so $$a_k=\\frac14\\sum_{n=0}^{3}x[n]\\,e^{-jk(\\pi/2)n}=\\frac14\\cdot1\\cdot e^{-jk(\\pi/2)\\cdot0}=\\frac14\\quad\\text{for every }k.$$ The spectrum is flat. One period of coefficients is $k=-1,0,1,2$. Next the frequency responses, from $H(e^{j\\omega})=\\sum_nh[n]e^{-j\\omega n}$. Factor out $e^{-j\\omega/2}$ as in Example 4.2: $$\\begin{aligned}H_1(e^{j\\omega})&=0.5\\bigl(1-e^{-j\\omega}\\bigr)=0.5e^{-j\\omega/2}\\bigl(e^{j\\omega/2}-e^{-j\\omega/2}\\bigr)=je^{-j\\omega/2}\\sin(\\omega/2),\\\\H_2(e^{j\\omega})&=0.5\\bigl(1+e^{-j\\omega}\\bigr)=e^{-j\\omega/2}\\cos(\\omega/2).\\end{aligned}$$ So $|H_1|=|\\sin(\\omega/2)|$ is 0 at $\\omega=0$ and 1 at $\\omega=\\pi$: a high-pass system. $|H_2|=|\\cos(\\omega/2)|$ is the reverse: a low-pass system. Evaluate $H_1$ at the harmonics $\\omega=0,\\pi/2,\\pi$, using $e^{-j\\pi/2}=-j$ and $e^{-j\\pi}=-1$: $$\\begin{gathered}H_1(e^{j0})=0.5(1-1)=0,\\\\[3pt]H_1(e^{j\\pi/2})=0.5(1+j)=0.5\\sqrt2\\,e^{j\\pi/4}=0.7071e^{j\\pi/4},\\\\[3pt]H_1(e^{j\\pi})=0.5(1+1)=1.\\end{gathered}$$ Multiply by $a_k=\\tfrac14$: $b_0=0$, $b_1=0.25(0.7071)e^{j\\pi/4}=0.1768e^{j\\pi/4}$ and $b_2=0.25$. Also $b_{-1}=b_3=b_1^{*}=0.1768e^{-j\\pi/4}$. The pair $k=\\pm1$ gives a cosine of amplitude $2|b_1|=2\\cdot\\tfrac{\\sqrt2}{8}=\\tfrac{\\sqrt2}{4}=0.354$ and phase $\\pi/4$. The term $k=2$ has $e^{j2(\\pi/2)n}=e^{j\\pi n}=(-1)^{n}$. So $$y_1[n]=0.354\\cos\\!\\left(\\frac{\\pi}{2}n+\\frac{\\pi}{4}\\right)+0.25(-1)^{n}.$$ For $h_2$ the same three evaluations give $$\\begin{gathered}H_2(e^{j0})=0.5(1+1)=1,\\\\[3pt]H_2(e^{j\\pi/2})=0.5(1-j)=0.7071e^{-j\\pi/4},\\\\[3pt]H_2(e^{j\\pi})=0.5(1-1)=0,\\end{gathered}$$ so $b_0=0.25$, $b_1=0.1768e^{-j\\pi/4}$ and $b_2=0$, and $$y_2[n]=0.25+0.354\\cos\\!\\left(\\frac{\\pi}{2}n-\\frac{\\pi}{4}\\right).$$'],
 ['Check','Apply $h_1$ directly. $y_1[n]=0.5x[n]-0.5x[n-1]$ turns each impulse into $0.5$ followed by $-0.5$, so one period is $0.5,-0.5,0,0$. The formula gives the same: at $n=0$, $0.354\\cos(\\pi/4)+0.25=0.25+0.25=0.5$; at $n=1$, $0.354\\cos(3\\pi/4)-0.25=-0.25-0.25=-0.5$; at $n=2$, $0.354\\cos(5\\pi/4)+0.25=0$; at $n=3$, $0.354\\cos(7\\pi/4)-0.25=0$. For $h_2$ each impulse spreads into two samples of $0.5$: at $n=0$, $0.25+0.354\\cos(-\\pi/4)=0.5$, and at $n=2$, $0.25+0.354\\cos(3\\pi/4)=0$.']
]},
{t:'box', kind:'warn', hd:'The term at $k=N/2$', html:'With $N=4$, the term $k=2$ is its own partner: $e^{j\\pi n}=(-1)^{n}$ is real, and $k=-2$ lies in the same period as $k=2$. It enters once, as $b_2(-1)^{n}$, without a factor of two. The high-pass system removes $b_0$ and keeps $b_2$. The low-pass system keeps $b_0$ and removes $b_2$. Both frequency responses repeat every $2\\pi$ in $\\omega$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-13,13],yr:[-0.75,0.75],xlabel:'n',ylabel:'y_1[n]',ytarget:3});
   a.stem(D(n=>0.353553*Math.cos(Math.PI*n/2+Math.PI/4)+0.25*Math.pow(-1,n),-13,13),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'High-pass $h_1$: zero average.'},
 {svg:()=>{const a=ax2({xr:[-13,13],yr:[-0.2,0.75],xlabel:'n',ylabel:'y_2[n]',ytarget:3});
   a.stem(D(n=>0.25+0.353553*Math.cos(Math.PI*n/2-Math.PI/4),-13,13),{color:C.out,r:2.6,showZero:true}); return a.svg();},
  cap:'Low-pass $h_2$: the average remains.'}
]},

{t:'h3', text:'A first-order recursive filter'},
{t:'p', text:'The two-tap filters use inputs only: they are <b>nonrecursive</b>. A <b>recursive</b> filter also uses its own previous output. The simplest one is'},
{t:'eq', tex:'y[n]-a\\,y[n-1]=x[n],\\qquad |a|<1.'},
{t:'p', text:'Its frequency response follows from the eigenfunction property. Put in $x[n]=e^{j\\omega n}$ and $y[n]=H(e^{j\\omega})\\,e^{j\\omega n}$, then divide by $e^{j\\omega n}$:'},
{t:'eq', tex:'\\begin{aligned}He^{j\\omega n}-a\\,He^{j\\omega(n-1)}&=e^{j\\omega n}\\\\H\\bigl(1-ae^{-j\\omega}\\bigr)&=1\\\\H(e^{j\\omega})&=\\frac{1}{1-ae^{-j\\omega}}.\\end{aligned}'},
{t:'p', text:'The condition $|a|<1$ makes the system stable. From initial rest, the impulse response satisfies $h[0]=1$ and $h[n]=a\\,h[n-1]$ for $n\\ge1$, so $h[n]=a^{n}u[n]$. Its absolute sum is a geometric series with ratio $|a|<1$: $\\sum_{n=0}^{\\infty}|a|^{n}=1/(1-|a|)$, which is finite. The same $h$ gives the frequency response again, as a geometric series with ratio $ae^{-j\\omega}$, where $|ae^{-j\\omega}|=|a|<1$:'},
{t:'eq', tex:'H(e^{j\\omega})=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}\\bigl(ae^{-j\\omega}\\bigr)^{n}=\\frac{1}{1-ae^{-j\\omega}}.'},
{t:'p', text:'The gain at the two ends of the band shows what the filter does. At $\\omega=0$, $e^{-j0}=1$, and at $\\omega=\\pi$, $e^{-j\\pi}=-1$, so'},
{t:'eq', tex:'H(e^{j0})=\\frac{1}{1-a},\\qquad H(e^{j\\pi})=\\frac{1}{1+a},\\qquad |H(e^{j\\omega})|=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}}.'},
{t:'p', text:'The last form uses $|1-ae^{-j\\omega}|^{2}=(1-a\\cos\\omega)^{2}+(a\\sin\\omega)^{2}=1-2a\\cos\\omega+a^{2}$. With $a>0$ the gain is largest at $\\omega=0$: the filter is low-pass. With $a<0$ it is largest at $\\omega=\\pi$: the filter is high-pass. At $a=0$ every gain is 1. For $a=0.5$, $|H(e^{j\\pi})|=1/(1+0.5)=\\tfrac23$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=ax2({xr:[-Math.PI,Math.PI],yr:[0,2.9],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',xticksOverride:[-Math.PI,-Math.PI/2,Math.PI/2,Math.PI],xtickfmt:piTick});
   const Hm=w=>1/Math.sqrt(1-2*0.6*Math.cos(w)+0.36); a.hline(1,{color:C.muted,dash:'4 5'}); a.curve(Hm,{color:C.out,n:900}); return a.svg();},
  cap:'$a=0.6$: gain $2.5$ at $\\omega=0$, low-pass.'},
 {svg:()=>{const a=ax2({xr:[-Math.PI,Math.PI],yr:[0,2.9],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',xticksOverride:[-Math.PI,-Math.PI/2,Math.PI/2,Math.PI],xtickfmt:piTick});
   const Hm=w=>1/Math.sqrt(1+2*0.6*Math.cos(w)+0.36); a.hline(1,{color:C.muted,dash:'4 5'}); a.curve(Hm,{color:C.err,n:900}); return a.svg();},
  cap:'$a=-0.6$: gain $2.5$ at $\\omega=\\pm\\pi$, high-pass.'}
]},
{t:'ex', hd:'Example 4.20 — a recursive filter on an impulse train', rows:[
 ['Given','$x[n]=\\sum_{m=-\\infty}^{\\infty}\\delta[n-4m]$ into $y[n]-0.5\\,y[n-1]=x[n]$.'],
 ['Find','The output $y[n]$.'],
 ['Method','Take $a_k=\\tfrac14$ and $\\omega_0=\\pi/2$ from Example 4.19. Evaluate $H(e^{jk\\pi/2})$ for $k=0,1,2$, form $b_k=a_kH(e^{jk\\pi/2})$, and reassemble.'],
 ['Solution','With $a=0.5$, $H(e^{j\\omega})=1/(1-0.5e^{-j\\omega})$. At the harmonics, using $e^{-j\\pi/2}=-j$ and $e^{-j\\pi}=-1$: $$H(e^{j0})=\\frac{1}{1-0.5}=2,\\qquad H(e^{j\\pi/2})=\\frac{1}{1+0.5j},\\qquad H(e^{j\\pi})=\\frac{1}{1+0.5}=\\frac23.$$ For the middle value, $|1+0.5j|=\\sqrt{1.25}=1.118$ and $\\angle(1+0.5j)=\\arctan0.5=0.464$ rad, so $H(e^{j\\pi/2})=0.894e^{-j0.464}$. Then $$b_0=\\tfrac14\\cdot2=\\tfrac12,\\qquad b_1=\\frac{1/4}{1+0.5j}=\\frac{0.25}{1.118}e^{-j0.464}=0.2236e^{-j0.464},\\qquad b_2=\\tfrac14\\cdot\\tfrac23=\\tfrac16.$$ Also $b_{-1}=b_3=b_1^{*}$, because $x$ and the filter are real. The pair $k=\\pm1$ gives amplitude $2|b_1|=0.447$. The term at $k=N/2=2$ enters once, as $b_2(-1)^{n}$: $$y[n]=\\tfrac12+0.447\\cos\\!\\left(\\frac{\\pi}{2}n-0.464\\right)+\\tfrac16(-1)^{n}.$$'],
 ['Check','Run the difference equation over one period. For $n=1,2,3$ the input is zero, so $y[1]=0.5y[0]$, $y[2]=0.25y[0]$ and $y[3]=0.125y[0]$. At $n=4$ the next impulse arrives and $y[4]=y[0]$ by periodicity: $y[0]=1+0.5y[3]=1+0.0625y[0]$, which gives $y[0]=1/0.9375=16/15=1.067$. The formula gives $0.5+0.447\\cos(-0.464)+0.167=0.5+0.4+0.167=1.067$, since $0.447\\cos(0.464)=\\sqrt{0.2}\\cdot2/\\sqrt5=0.4$. At $n=1$ it gives $0.5+0.447\\sin(0.464)-0.167=0.5+0.2-0.167=0.533=y[0]/2$.']
]},
{t:'fig', svg:()=>{const a=ax({xr:[-13,13],yr:[-0.2,1.3],xlabel:'n',ylabel:'y[n]',xtarget:9,ytarget:3});
  a.stem(D(n=>0.5+Math.sqrt(0.2)*Math.cos(Math.PI*n/2-Math.atan(0.5))+Math.pow(-1,n)/6,-12,12),{color:C.out,r:3,showZero:true}); return a.svg();},
 cap:'The output of Example 4.20. Each impulse leaves a tail $0.5^{n}$ that reaches into the next period, because the output feeds back. Each two-tap response of Example 4.19 ended after two samples.'},

/* ================================================================ 4.7 */
{t:'h2', num:'4.7', text:'Summary'},
{t:'p', text:'The two tables collect the properties of Section 4.5. To use them, recognise the signal as a known one with an operation applied. Look up the known coefficients, apply the rows in order, and check $a_0$ against the mean of the signal.'},
{t:'table', head:['Property','Continuous time, period $T_0$, $\\omega_0=2\\pi/T_0$'], rows:[
 ['Linearity','$Ax(t)+By(t)\\;\\leftrightarrow\\;Aa_k+Bb_k$'],
 ['Time shift','$x(t-t_0)\\;\\leftrightarrow\\;a_ke^{-jk\\omega_0t_0}$'],
 ['Frequency shift','$e^{jM\\omega_0t}x(t)\\;\\leftrightarrow\\;a_{k-M}$, $M$ an integer'],
 ['Conjugation','$x^{*}(t)\\;\\leftrightarrow\\;a_{-k}^{*}$'],
 ['Time reversal','$x(-t)\\;\\leftrightarrow\\;a_{-k}$'],
 ['Time scaling','$x(\\alpha t)\\;\\leftrightarrow\\;a_k$, $\\alpha>0$, period $T_0/\\alpha$'],
 ['Periodic convolution','$\\int_{T_0}x(\\tau)y(t-\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;T_0a_kb_k$'],
 ['Multiplication','$x(t)y(t)\\;\\leftrightarrow\\;\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell b_{k-\\ell}$'],
 ['Differentiation','$\\d x/\\d t\\;\\leftrightarrow\\;jk\\omega_0a_k$'],
 ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\,\\d\\tau\\;\\leftrightarrow\\;a_k/(jk\\omega_0)$, only if $a_0=0$'],
 ['Real signal','$a_{-k}=a_k^{*}$: $|a_k|$ even, $\\angle a_k$ odd'],
 ['Real and even','$a_k$ real and even'],
 ['Real and odd','$a_k$ purely imaginary and odd'],
 ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$, for real $x$'],
 ['Parseval','$\\frac{1}{T_0}\\int_{T_0}|x(t)|^{2}\\,\\d t=\\sum_{k}|a_k|^{2}$']
]},
{t:'table', head:['Property','Discrete time, period $N$, $\\omega_0=2\\pi/N$'], rows:[
 ['Linearity','$Ax[n]+By[n]\\;\\leftrightarrow\\;Aa_k+Bb_k$'],
 ['Time shift','$x[n-n_0]\\;\\leftrightarrow\\;a_ke^{-jk(2\\pi/N)n_0}$'],
 ['Frequency shift','$e^{jM(2\\pi/N)n}x[n]\\;\\leftrightarrow\\;a_{k-M}$, $M$ an integer'],
 ['Conjugation','$x^{*}[n]\\;\\leftrightarrow\\;a_{-k}^{*}$'],
 ['Time reversal','$x[-n]\\;\\leftrightarrow\\;a_{-k}$'],
 ['Time scaling','$x_{(m)}[n]\\;\\leftrightarrow\\;a_k/m$, period $mN$'],
 ['Periodic convolution','$\\sum_{r=\\langle N\\rangle}x[r]y[n-r]\\;\\leftrightarrow\\;Na_kb_k$'],
 ['Multiplication','$x[n]y[n]\\;\\leftrightarrow\\;\\sum_{\\ell=\\langle N\\rangle}a_\\ell b_{k-\\ell}$'],
 ['First difference','$x[n]-x[n-1]\\;\\leftrightarrow\\;\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)a_k$'],
 ['Running sum','$\\sum_{r=-\\infty}^{n}x[r]\\;\\leftrightarrow\\;a_k/\\bigl(1-e^{-jk(2\\pi/N)}\\bigr)$, only if $a_0=0$'],
 ['Real signal','$a_{-k}=a_k^{*}$: $|a_k|$ even, $\\angle a_k$ odd'],
 ['Real and even','$a_k$ real and even'],
 ['Real and odd','$a_k$ purely imaginary and odd'],
 ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$, for real $x$'],
 ['Parseval','$\\frac{1}{N}\\sum_{n=\\langle N\\rangle}|x[n]|^{2}=\\sum_{k=\\langle N\\rangle}|a_k|^{2}$']
]},
{t:'box', kind:'warn', hd:'Where discrete time differs', html:'The coefficients repeat, $a_{k+N}=a_k$. So multiplication sums over one period, time scaling carries $1/m$, and a first difference takes the place of the derivative.'},
{t:'h3', text:'Checklist'},
{t:'ol', items:[
 'Confirm that the signal is periodic and find $T_0$ or $N$ before anything else.',
 'Set $\\omega_0=2\\pi/T_0$ or $2\\pi/N$ and write every component frequency as a multiple of it. That multiple is $k$.',
 'If the signal is already a sum of sinusoids, read the coefficients off with Euler’s relations. Otherwise integrate or sum, treating $k=0$ separately.',
 'Compare $a_0$ with the average of the signal, and check the symmetry: a real signal gives $a_{-k}=a_k^{*}$.',
 'Through an LTI system, $b_k=a_kH(jk\\omega_0)$: one product per harmonic.',
 'To return to a real signal, pair $k$ with $-k$: amplitude $2|b_k|$, phase $\\angle b_k$. The term $b_0$ stands alone, and in discrete time so does the term at $k=N/2$.'
]},
{t:'h3', text:'Where Chapter 5 begins'},
{t:'p', text:'Everything in this chapter needed the signal to repeat. A single pulse does not repeat. It has no fundamental period and no harmonics to carry coefficients. The rectangular wave already showed the way out: its coefficients were samples of one envelope, taken every $\\omega_0=2\\pi/T_0$. Keep one pulse and let $T_0$ grow. The envelope stays the same while the samples crowd together and shrink as $1/T_0$.'},
{t:'eqbox', cap:'Where Chapter 5 begins',
 tex:['T_0a_k=E(k\\omega_0)\\quad\\xrightarrow{\\;T_0\\to\\infty\\;}\\quad X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)\\,e^{-j\\omega t}\\,\\d t'],
 after:'In the limit the stems merge into the curve they were always sampling. That curve is the Fourier transform, a continuous spectrum for a signal that does not repeat.'},

{t:'h2', num:'4.8', text:'Exercises'},
{t:'q', n:'4.1', text:'Two periodic signals have fundamental periods $2/9$ s and $8/21$ s. Find the fundamental period of their sum, and check it by division.', ans:'$T_0=\\operatorname{LCM}(2,8)/\\operatorname{GCD}(9,21)=8/3$ s. Check: $(8/3)/(2/9)=12$ and $(8/3)/(8/21)=7$, both whole, and $\\gcd(12,7)=1$.'},
{t:'q', n:'4.2', text:'For $x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$, state $a_0$ and explain in one sentence why it is not zero.', ans:'$a_0=1$: the constant term is the $k=0$ harmonic, and it is also the average of the signal, since both sinusoids complete whole cycles in one period.'},
{t:'q', n:'4.3', text:'A rectangular wave has $T_0=8T_1$. Find $a_0$ and $a_2$.', ans:'$a_0=2T_1/T_0=1/4$ and $a_2=\\sin(\\pi/2)/(2\\pi)=1/(2\\pi)=0.159$.'},
{t:'q', n:'4.4', text:'A real signal has $\\omega_0=2$ rad/s, $a_2=-1+j$, $a_{-2}=a_2^{*}$, and every other coefficient zero. Write it in amplitude–phase form and in cosine–sine form.', ans:'$A_2=\\sqrt2$ and $\\theta_2=3\\pi/4$, since $-1+j$ lies in the second quadrant. So $x(t)=2\\sqrt2\\cos(4t+3\\pi/4)$. With $B_2=-1$ and $C_2=1$, $x(t)=2[-\\cos4t-\\sin4t]=-2\\cos4t-2\\sin4t$.'},
{t:'q', n:'4.5', text:'Explain why the finite geometric sum used for the discrete-time square wave requires $r\\neq1$ and not $|r|<1$, and say what happens at the excluded value.', ans:'A finite sum always has a value; only the closed form fails, where its denominator $1-r$ vanishes. Here $|r|=1$ at every $k$, so $|r|<1$ would exclude the sum entirely. At $r=1$, that is, $k$ a multiple of $N$, every term is 1 and the sum is $2N_1+1$.'},
{t:'q', n:'4.6', text:'A filtered signal has $b_1=0.1517e^{-j1.263}$ and $\\omega_0=\\pi$ rad/s. Write the contribution of the pair $k=\\pm1$ to the real output.', ans:'$2|b_1|\\cos(\\pi t+\\angle b_1)=0.303\\cos(\\pi t-1.263)$.'},
{t:'q', n:'4.7', text:'A square wave and a triangular wave are truncated to the same number of harmonics. Which is approximated better, and which shows a Gibbs overshoot?', ans:'The triangular wave: its coefficients decay like $1/k^{2}$ against $1/k$, so its dropped power falls like $1/N^{3}$ rather than $1/N$. Only the square wave has a jump, so only it shows a Gibbs overshoot.'},
{t:'q', n:'4.8', text:'Find the gains at $\\omega=0$ and $\\omega=\\pi$ of the recursive filter $y[n]+0.5\\,y[n-1]=x[n]$. Is it low-pass or high-pass?', ans:'Here $a=-0.5$. $H(e^{j0})=1/(1-a)=1/1.5=\\tfrac23$ and $H(e^{j\\pi})=1/(1+a)=1/0.5=2$. The gain is largest at $\\omega=\\pi$, so the filter is high-pass.'}
];
})();
