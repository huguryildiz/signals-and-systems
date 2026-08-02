/* Course notes — Chapter 6, the discrete-time Fourier transform */
(function(){
const P=PLOT, C=P.COL;
const PI=Math.PI;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};

/* A frequency axis is read in multiples of pi. A tick number is part of the
   scale of the frame, so it stays plain; every axis name and annotation around
   it is typeset. */
const piTick=v=>{ const r=v/PI;
  if(Math.abs(r)<1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12]){ const num=r*den;
    if(Math.abs(num-Math.round(num))<1e-7){
      const k=Math.round(num), sg=k<0?'-':'', m=Math.abs(k);
      const head = m===1?'π':m+'π';
      return den===1 ? sg+head : sg+head+'/'+den; } }
  return P.fmt(v,2); };
/* A frequency tick is crossed by the data wherever the quantity drawn changes
   sign, because the tick row sits on the zero line. Those figures label the two
   ends of the marked period only. */
const wPi=v=>Math.abs(Math.abs(v)-PI)<1e-9?piTick(v):'';
const wTicks=(lo,hi,step)=>{const o=[];
  for(let k=Math.ceil(lo/step-1e-9);k<=hi/step+1e-9;k++) o.push(k*step); return o;};

const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:56,r:24,t:28,b:36},xtarget:8,ytarget:3},o));
const wax=o=>P.Axes(Object.assign({w:700,h:210,pad:{l:62,r:26,t:30,b:38},
  xr:[-3*PI,3*PI],xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3},o));

/* Every spectrum in this chapter is drawn over three periods of 2*pi with one
   period marked, because the periodicity is the subject of the chapter. The
   bracket carries no label of its own: the name of the dependent variable is
   anchored on the zero line, which on a symmetric frequency axis is the middle
   of the figure, so the words go to the left of the bracket instead. */
const mark=(a,v)=>{
  a.vline(-PI,{color:C.coral,opacity:.5}); a.vline(PI,{color:C.coral,opacity:.5});
  a.span(-PI,PI,v,'',{color:C.coral});
  a.note(-PI,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:12,anchor:'end',dx:-8,dy:-3});
  return a; };

const wrap=w=>w-2*PI*Math.round(w/(2*PI));
const dirich=(w,N1)=>{const s=Math.sin(w/2);
  return Math.abs(s)<1e-9 ? 2*N1+1 : Math.sin(w*(N1+0.5))/s;};
const geoMag=(w,a)=>1/Math.sqrt(1-2*a*Math.cos(w)+a*a);
const geoPh=(w,a)=>-Math.atan2(a*Math.sin(w),1-a*Math.cos(w));
const lpf=(w,W)=>Math.abs(wrap(w))<=W?1:0;
const lpfInv=(n,W)=>n===0?W/PI:Math.sin(W*n)/(PI*n);
const dtRect=(k,N,N1)=>{const r=k/N;
  if(Math.abs(r-Math.round(r))<1e-12) return (2*N1+1)/N;
  return Math.sin(2*PI*k*(N1+0.5)/N)/(N*Math.sin(PI*k/N));};
const rectConv=(w,W1,W2)=>{const lo=Math.max(w-W1,-W2), hi=Math.min(w+W1,W2);
  return hi>lo?(hi-lo)/(2*PI):0;};
const perConv=(w,W1,W2)=>{let s=0; for(let k=-3;k<=3;k++) s+=rectConv(w-2*PI*k,W1,W2); return s;};

window.C6 = [
{t:'page'},

{t:'h1', num:'CHAPTER 6', text:'The discrete-time Fourier transform'},
{t:'p', lead:true, text:'The discrete-time Fourier transform describes the frequency content of a sequence that is not periodic. We derive it in three steps: replicate a finite sequence to make it periodic, apply the series from Chapter 4, and let the period grow without bound. The result is a continuous function of frequency that repeats every $2\\pi$. Every figure shows more than one period so that this defining property remains visible.'},

{t:'h2', num:'6.1', text:'From a periodic sequence to an aperiodic one'},
{t:'p', text:'Let $x[n]$ have finite support: $x[n]=0$ for $|n|>N_1$. The discrete-time Fourier series applies to periodic sequences only, so build a periodic sequence out of $x$ by laying the same finite sequence down again every $N$ samples.'},
{t:'eqbox', cap:'Periodic replication',
 tex:['\\tilde{x}[n]=\\sum_{r=-\\infty}^{\\infty}x[n-rN]'],
 after:'Periodic replication places a copy of the complete sequence every $N$ samples. It does not insert samples within a copy.'},
{t:'box', kind:'warn', hd:'The condition the construction needs',
 html:'The copies must not overlap, so the period must be longer than the support: $N>2N_1$. Only then is $\\tilde{x}[n]=x[n]$ for $-N_1\\le n\\le N_1$, a band of $2N_1+1$ samples centred on the origin. With $N\\le 2N_1$ the tails of neighbouring copies add and no period of $\\tilde{x}$ equals $x$ any more. Both ends of the interval point the same way; reversing the second relation would leave an interval with nothing in it.'},
{t:'figrow', n:3, items:[
 {svg:()=>{const a=ax({w:440,h:180,xr:[-16,16],yr:[-0.25,1.45],xlabel:'n',ylabel:'x[n]',ytarget:2});
   a.stem(D(n=>Math.abs(n)<=2?1:0,-16,16),{color:C.in,showZero:true}); return a.svg();},
  cap:'The finite-support sequence, $N_1=2$.'},
 {svg:()=>{const a=ax({w:440,h:180,xr:[-16,16],yr:[-0.25,1.45],xlabel:'n',ylabel:'\\tilde{x}[n]',ytarget:2});
   a.stem(D(n=>{const m=n-9*Math.round(n/9);return Math.abs(m)<=2?1:0;},-16,16),{color:C.mid,showZero:true});
   return a.svg();},
  cap:'Replication with $N=9>2N_1$: the copies stand clear.'},
 {svg:()=>{const a=ax({w:440,h:180,xr:[-16,16],yr:[-0.35,2.6],xlabel:'n',ylabel:'\\tilde{x}[n]',ytarget:3});
   a.stem(D(n=>{let s=0;for(let r=-6;r<=6;r++){const m=n-4*r;if(Math.abs(m)<=2)s+=1;}return s;},-16,16),
     {color:C.err,showZero:true}); return a.svg();},
  cap:'Replication with $N=4\\le 2N_1$: the copies add.'}
]},

{t:'h3', text:'The coefficients are samples of one function'},
{t:'eqbox', cap:'Discrete-time Fourier series',
 tex:['\\tilde{x}[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\omega_0 n},\\qquad \\omega_0=\\frac{2\\pi}{N}',
      'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\tilde{x}[n]\\,e^{-jk\\omega_0 n}'],
 after:'The analysis exponent is negative. Synthesis builds the sequence up out of exponentials and carries $e^{+jk\\omega_0n}$; analysis takes it apart and carries the conjugate. A plus sign in both places breaks the identity derived immediately below.'},
{t:'p', text:'Over one period, $\\tilde{x}[n]=x[n]$. Because $x$ is zero outside $-N_1\\le n\\le N_1$, extending the sum to all $n$ adds only zero terms:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}x[n]e^{-jk\\omega_0 n}=\\frac{1}{N}\\sum_{n=-\\infty}^{\\infty}x[n]e^{-jk\\omega_0 n}.'},
{t:'p', text:'The last sum has the same form for every $k$. Define it as a function of the continuous variable $\\omega$, and then evaluate it at $\\omega=k\\omega_0$.'},
{t:'eqbox', cap:'The envelope',
 tex:['X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}\\qquad\\Longrightarrow\\qquad a_k=\\frac{1}{N}X(e^{jk\\omega_0})'],
 after:'The series coefficients are samples of the envelope, spaced $\\omega_0=2\\pi/N$ apart and scaled by $1/N$. The identity holds only because the two exponents match, which is the check on the sign.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-2*PI,2*PI],yr:[-1.6,6.1],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    pad:{l:56,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
   a.curve(w=>dirich(w,2),{color:C.in,n:2400}); mark(a,5.2); return a.svg();},
  cap:'The envelope of the pulse with $N_1=2$, over two periods. Its value at $\\omega=0$ is $2N_1+1=5$.'},
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-2*PI,2*PI],yr:[-0.30,0.80],xlabel:'\\omega',ylabel:'a_k',
    pad:{l:58,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
   a.curve(w=>dirich(w,2)/9,{color:C.muted,n:2400,width:1.3,dash:'4 5'});
   const pts=[]; for(let k=-9;k<=9;k++) pts.push([k*2*PI/9,dtRect(k,9,2)]);
   a.stem(pts,{color:C.mid,showZero:true}); mark(a,0.63); return a.svg();},
  cap:'The coefficients for $N=9$: the dashed envelope divided by $N$, sampled at $\\omega=k\\omega_0$.'}
]},

{t:'h3', text:'Letting the period grow'},
{t:'p', text:'Put $a_k=\\frac{1}{N}X(e^{jk\\omega_0})$ back into the synthesis equation and write $\\frac1N$ as $\\frac{\\omega_0}{2\\pi}$:'},
{t:'eq', tex:'\\tilde{x}[n]=\\sum_{k=\\langle N\\rangle}\\frac{1}{N}X(e^{jk\\omega_0})e^{jk\\omega_0 n}=\\frac{1}{2\\pi}\\sum_{k=\\langle N\\rangle}X(e^{jk\\omega_0})e^{jk\\omega_0 n}\\,\\omega_0.'},
{t:'p', text:'Interpret the right-hand side as a sum of rectangles. Each rectangle has height $X(e^{j\\omega})e^{j\\omega n}$ at a sampled frequency and width $\\omega_0$. The $N$ rectangles cover an interval of length $N\\omega_0=2\\pi$. As $N$ grows without bound, the replicated copies separate and $\\tilde{x}[n]$ approaches $x[n]$. At the same time, $\\omega_0=2\\pi/N$ approaches zero, so the rectangle sum approaches an integral over an interval of length $2\\pi$.'},
{t:'eqbox', cap:'The discrete-time Fourier transform pair',
 tex:['X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}\\qquad\\text{(analysis)}',
      'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega\\qquad\\text{(synthesis)}'],
 after:'Analysis takes the sequence to its spectrum; synthesis rebuilds the sequence from it. The names go by what each equation does, never by which is written first. Three details separate this pair from the continuous-time one: the factor $\\frac{1}{2\\pi}$ sits on the synthesis side, the integral runs over one period rather than the whole line, and the left-hand side is written $X(e^{j\\omega})$ to record that it is a function of $e^{j\\omega}$ and therefore repeats.'},
{t:'box', kind:'ok', hd:'When the sum converges',
 html:'A sufficient condition is that $x$ is absolutely summable, $\\sum_{n}|x[n]|<\\infty$. Then the analysis sum converges at every $\\omega$ and $X(e^{j\\omega})$ is continuous. Finite-energy sequences also have a transform, in a mean-square sense.'},

{t:'h2', num:'6.2', text:'Why the spectrum repeats'},
{t:'eqbox', cap:'Periodicity in the frequency variable',
 tex:['X(e^{j(\\omega+2\\pi)})=\\sum_{n}x[n]e^{-j(\\omega+2\\pi)n}=\\sum_{n}x[n]e^{-j\\omega n}e^{-j2\\pi n}=X(e^{j\\omega})'],
 after:'The whole argument is that $n$ is an integer, so $e^{-j2\\pi n}=1$ in every term of the sum and the extra factor disappears term by term.'},
{t:'p', text:'The same step in continuous time gives $\\int x(t)e^{-j\\omega t}e^{-j2\\pi t}\\d t$, where $t$ runs over the reals. There $e^{-j2\\pi t}$ equals 1 only at integer $t$, so it cannot leave the integral, and nothing forces $X(j\\omega)$ to repeat.'},
{t:'box', hd:'What frequency means in discrete time',
 html:'A sequence $e^{j\\omega n}$ is unchanged when $\\omega$ moves by $2\\pi$, because it is only ever sampled at integers. High frequency therefore means $\\omega$ near $\\pm\\pi$, not $\\omega$ large. The fastest sequence a discrete-time signal can carry is $e^{j\\pi n}=(-1)^{n}$.'},
{t:'fig', svg:()=>{const a=ax({w:700,h:230,xr:[-14,14],yr:[-1.45,1.45],xlabel:'n',ylabel:'\\operatorname{Re}\\{e^{j\\omega n}\\}',pad:{l:64,r:26,t:30,b:36}});
  a.curve(t=>Math.cos(0.4*t),{color:C.in,width:1.1,dash:'3 5',opacity:.5});
  a.curve(t=>Math.cos((0.4+2*PI)*t),{color:C.err,width:1.1,dash:'3 5',opacity:.5});
  a.stem(D(n=>Math.cos(0.4*n),-14,14),{color:C.in});
  return a.svg();},
 cap:'Two continuous curves, $\\omega=0.4$ and $\\omega=0.4+2\\pi$, and the one stem sequence they share. At the integers they agree exactly, so no sequence can tell them apart.'},
{t:'box', kind:'err', hd:'The habit this chapter is built to prevent',
 html:'A spectrum drawn on $-\\pi\\le\\omega\\le\\pi$ alone is the same information as three periods of it, and it is also the picture a reader later mistakes for a spectrum that stops at $\\pm\\pi$. Every spectrum here is drawn over more than one period with the period marked.'},

{t:'h2', num:'6.3', text:'Four transforms worked out'},
{t:'ex', hd:'Example 6.1 — a shifted unit sample', rows:[
 ['Given','$x[n]=\\delta[n-n_0]$.'],
 ['Find','$X(e^{j\\omega})$, its magnitude and its phase.'],
 ['Method','Use the analysis sum because the sequence is given in time. The unit sample makes every term with $n\\neq n_0$ equal to zero, so only one term remains.'],
 ['Solution','$$X(e^{j\\omega})=\\sum_{n}\\delta[n-n_0]e^{-j\\omega n}=e^{-j\\omega n_0}.$$So $|X(e^{j\\omega})|=1$ at every frequency and $\\angle X(e^{j\\omega})=-n_0\\omega$, a straight line of slope $-n_0$.'],
 ['Check','At $n_0=0$ the sequence is $\\delta[n]$ and the transform is the constant 1, which is what the sum gives directly.'],
 ['Reading','A straight line is not periodic, and yet the transform is. What is drawn is the principal value of the phase, which jumps by $2\\pi$ whenever the line leaves $(-\\pi,\\pi]$. The sawtooth is that wrapping, and its period is $2\\pi/|n_0|$.']
]},
{t:'fig', svg:()=>{const a=wax({yr:[-4.9,6.0],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
   pad:{l:74,r:26,t:30,b:38},xtickfmt:wPi,yticksOverride:[-PI,-PI/2,0,PI/2,PI],ytickfmt:v=>v.toFixed(2)});
  a.curve(w=>-3*w,{color:C.muted,width:1.2,dash:'4 5'});
  a.curve(w=>{const v=-3*w; return v-2*PI*Math.round(v/(2*PI));},{color:C.mid,n:6000});
  mark(a,4.55); return a.svg();},
 cap:'The phase for $n_0=3$. The dashed line is the unwrapped $-n_0\\omega$; the sawtooth is its principal value. Both describe the same transform.'},

{t:'ex', hd:'Example 6.2 — the one-sided exponential', rows:[
 ['Given','$x[n]=a^{n}u[n]$ with $|a|<1$.'],
 ['Find','$X(e^{j\\omega})$, and the extremes of its magnitude and phase.'],
 ['Method','Use the geometric-series formula because the one-sided sequence produces powers of the same ratio $ae^{-j\\omega}$. The stated condition makes the infinite sum converge.'],
 ['Solution','$$X(e^{j\\omega})=\\sum_{n=0}^{\\infty}(ae^{-j\\omega})^{n}=\\frac{1}{1-ae^{-j\\omega}},$$which converges because $|ae^{-j\\omega}|=|a|\\,|e^{-j\\omega}|=|a|<1$. Then $$|X(e^{j\\omega})|=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}},\\qquad \\angle X(e^{j\\omega})=-\\arctan\\frac{a\\sin\\omega}{1-a\\cos\\omega}.$$'],
 ['Extremes','Write the denominator as $1+ae^{j(\\pi-\\omega)}$: a circle of radius $|a|$ about the point 1. Its nearest point to the origin gives $|X|_{\\max}=1/(1-|a|)$, its furthest gives $|X|_{\\min}=1/(1+|a|)$, and the tangent from the origin gives $\\max|\\angle X|=\\arcsin|a|$, reached where $\\cos\\omega=a$. For positive $a$ the largest magnitude is at $\\omega=0$ and the smallest at $\\omega=\\pm\\pi$; for negative $a$ the two ends swap.'],
 ['Numbers','$a=\\tfrac12$: magnitude between $\\tfrac23$ and 2, and $\\max|\\angle X|=\\arcsin\\tfrac12=\\pi/6=0.5236$ rad exactly. $a=\\tfrac18$: magnitude between $\\tfrac89=0.8889$ and $\\tfrac87=1.1429$, and $\\max|\\angle X|=0.1253$ rad.'],
 ['Check','Every one of these is a closed form, so none has to be read off the frame of a plot. An extreme that lands exactly on an axis limit is the one place a printed number is likeliest to be the limit rather than the value.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:200,yr:[-0.30,2.62],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
    yticksOverride:[2/3,2],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
   a.hline(2,{color:C.coral,opacity:.6}); a.hline(2/3,{color:C.coral,opacity:.6});
   mark(a,2.24); return a.svg();},
  cap:'Magnitude for $a=\\tfrac12$, touching $1/(1-a)=2$ and $1/(1+a)=2/3$.'},
 {svg:()=>{const a=wax({w:640,h:200,yr:[-0.95,1.02],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
    pad:{l:74,r:26,t:30,b:38},xtickfmt:wPi,yticksOverride:[-0.5236,0,0.5236],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>geoPh(w,0.5),{color:C.mid,n:3000});
   a.hline(0.5236,{color:C.coral,opacity:.6}); a.hline(-0.5236,{color:C.coral,opacity:.6});
   mark(a,0.80); return a.svg();},
  cap:'Phase for $a=\\tfrac12$, touching $\\pm\\arcsin\\tfrac12=\\pm0.5236$ rad at $\\omega=\\mp\\pi/3$.'}
]},

{t:'ex', hd:'Example 6.3 — the two-sided exponential', rows:[
 ['Given','$x[n]=a^{|n|}$ with $|a|<1$.'],
 ['Find','$X(e^{j\\omega})$ and its extremes.'],
 ['Method','Split the analysis sum at $n=0$ because the absolute value gives different exponents on the two sides. Each remaining sum is geometric and converges under the stated condition.'],
 ['Solution','$$X(e^{j\\omega})=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}=\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}.$$'],
 ['Extremes','At $\\omega=0$ the value is $(1+a)/(1-a)$; at $\\omega=\\pm\\pi$ it is $(1-a)/(1+a)$. For $a=\\tfrac12$ these are 3 and $\\tfrac13$; for $a=\\tfrac14$ they are $1.6667$ and $0.6$.'],
 ['Reading','The denominator is $|1-ae^{-j\\omega}|^{2}$, which is positive, and the numerator is positive for $|a|<1$. So this spectrum is real and strictly positive, and here $|X|=X$ with $\\angle X=0$ throughout. That is a property of this example, not of real spectra in general.']
]},

{t:'ex', hd:'Example 6.4 — the rectangular pulse', rows:[
 ['Given','$x[n]=1$ for $-N_1\\le n\\le N_1$ and zero elsewhere.'],
 ['Find','$X(e^{j\\omega})$ in closed form and its value at $\\omega=0$.'],
 ['Method','Use the finite geometric-series formula because the pulse has consecutive non-zero samples. Then balance the endpoint exponents so each difference can be written as a sine.'],
 ['Solution','$$X(e^{j\\omega})=\\sum_{n=-N_1}^{N_1}e^{-j\\omega n}=\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}.$$Multiplying numerator and denominator by $e^{j\\omega/2}$ turns each into a difference of conjugate exponentials, $2j\\sin(\\omega(N_1+\\tfrac12))$ over $2j\\sin(\\omega/2)$: $$X(e^{j\\omega})=\\frac{\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)}{\\sin(\\omega/2)}.$$The minus in each bracket is what makes a sine; a plus would give a cosine and a different function.'],
 ['Excluded points','$r=e^{-j\\omega}=1$ at $\\omega=0,\\pm2\\pi,\\dots$, which is exactly where $\\sin(\\omega/2)$ vanishes. There every term of the sum is 1, so $X=2N_1+1$: five for $N_1=2$, nine for $N_1=4$.'],
 ['Check','This is not a sinc. The denominator is $\\sin(\\omega/2)$, not $\\omega/2$, and that is what makes the function periodic: a ratio of two sines repeats, while a sine over a straight line decays.']
]},
{t:'box', kind:'warn', hd:'What a finite geometric sum requires',
 html:'$\\sum_{n=p}^{q}r^{\\,n}=(r^{p}-r^{\\,q+1})/(1-r)$ needs $r\\neq1$ and nothing else. There are finitely many terms, so nothing has to converge; only the division can fail. Here $|r|=1$ exactly, so a condition $|r|<1$ would exclude the sum altogether, while $|r|\\le1$ would admit the one value that breaks it. The condition $|a|<1$ of Example 6.2 belongs to the infinite sum, where it makes the tail vanish.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:210,yr:[-2.4,6.6],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    xtickfmt:wPi,yticksOverride:[-1.25,0,2.5,5],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000}); mark(a,5.72); return a.svg();},
  cap:'$N_1=2$: peak 5, least value $-1.2500$.'},
 {svg:()=>{const a=wax({w:640,h:210,yr:[-3.9,11.7],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    xtickfmt:wPi,yticksOverride:[-2.0391,0,4.5,9],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>dirich(wrap(w),4),{color:C.h,n:6000}); mark(a,10.2); return a.svg();},
  cap:'$N_1=4$: peak 9, least value $-2.0391$, and a main lobe half as wide.'}
]},
{t:'box', kind:'err', hd:'Real is not the same as non-negative',
 html:'The kernel above is real at every $\\omega$ and negative on part of every period. Realness fixes the imaginary part and says nothing about the sign, so it gives $\\angle X=0$ where $X>0$ and $\\angle X=\\pi$ where $X<0$; and $|X|=X$ needs the extra hypothesis $X\\ge0$. A real spectrum has an even magnitude and a phase taking only the values 0 and $\\pi$. Example 6.3 is the contrasting case: there the spectrum is real <b>and</b> strictly positive, so the phase really is zero, because of positivity and not because of realness.'},

{t:'h2', num:'6.4', text:'Inverting an ideal low-pass spectrum'},
{t:'ex', hd:'Example 6.5 — the ideal low-pass sequence', rows:[
 ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le W$ and 0 for $W<|\\omega|\\le\\pi$, repeated with period $2\\pi$.'],
 ['Find','$x[n]$.'],
 ['Method','Use the synthesis integral because the spectrum is given and the sequence is required. Choose $-\\pi\\le\\omega\\le\\pi$ so the band where the spectrum is 1 appears once within the integration period.'],
 ['Solution','$$x[n]=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega=\\frac{\\sin(Wn)}{\\pi n},\\qquad x[0]=\\frac{W}{\\pi}.$$At $n=0$ the integrand is 1 and the integral is $2W$, which is also the limit of the ratio.'],
 ['Numbers','$W=\\pi/4$: $0.25$, $0.225079$, $0.159155$, $0.075026$ at $n=0,1,2,3$. $W=\\pi/2$: $0.5$, $0.318310$, $0$, $-0.106103$.'],
 ['Check','$x[0]$ must be the fraction $W/\\pi$ of the period that the band occupies. That single number catches both a lost $2\\pi$ and a wrong prefactor.']
]},
{t:'box', hd:'The sinc convention',
 html:'This course uses the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, with no $\\pi$ inside the argument. In that convention the same sequence reads $x[n]=\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$. The other common definition puts a $\\pi$ inside the argument and moves every zero crossing, so the convention is restated at every point of use. The prefactor is the constant $W/\\pi$: writing $W/n$ makes the expression depend on $n$ twice and is wrong by a factor $\\pi$ at every index, giving $0.707107$ at $n=1$ where the true value is $0.225079$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.30,1.72],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),ytarget:2});
   a.curve(w=>lpf(w,PI/4),{color:C.in,n:8000}); mark(a,1.30); return a.svg();},
  cap:'The spectrum for $W=\\pi/4$, over three periods. The band repeats; it does not stop at $\\pm\\pi$.'},
 {svg:()=>{const a=ax({w:640,h:190,xr:[-18,18],yr:[-0.10,0.34],xlabel:'n',ylabel:'x[n]',
    yticksOverride:[0,0.1,0.25],ytickfmt:v=>v.toFixed(4)});
   a.stem(D(n=>lpfInv(n,PI/4),-18,18),{color:C.out,showZero:true}); return a.svg();},
  cap:'Its inverse transform, with $x[0]=0.25$.'}
]},

{t:'h2', num:'6.5', text:'Periodic sequences and impulse spectra'},
{t:'p', text:'A complex exponential is not absolutely summable, so its analysis sum does not converge in the ordinary sense. Its transform exists as a train of impulses, and the definition is that the synthesis equation works.'},
{t:'eqbox', cap:'The complex exponential',
 tex:['e^{j\\omega_0 n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)'],
 after:'Substituting into the synthesis equation and integrating over the period containing $\\omega_0$ leaves exactly one impulse, and $\\frac{1}{2\\pi}\\cdot2\\pi\\,e^{j\\omega_0n}=e^{j\\omega_0n}$. The copies must be there: a single impulse is not $2\\pi$-periodic, and a sequence cannot distinguish $\\omega_0$ from $\\omega_0+2\\pi$.'},
{t:'box', hd:'Weight, not height',
 html:'An impulse has no value at a point; it has a weight, the number that comes out when it is integrated. Every figure here draws an impulse as an arrow whose height <b>is</b> its weight, so the two can be read off the same axis. Arrows drawn to a fixed height with the weight written beside them hide exactly the comparison these pictures are for.'},
{t:'eqbox', cap:'A periodic sequence',
 tex:['x[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\frac{2\\pi}{N}n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)',
      '\\cos\\omega_0 n\\;\\longleftrightarrow\\;\\pi\\sum_{k}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]',
      '\\sin\\omega_0 n\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\sum_{k}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]'],
 after:'The spacing is $2\\pi/N$, so one period holds exactly $N$ impulses. A real sequence always produces the pair at $+\\omega_0$ and $-\\omega_0$; dropping the negative one rebuilds $\\tfrac12e^{j\\omega_0n}$, which is complex, instead of the cosine.'},
{t:'p', text:'For the periodic square wave, 1 on $|n|\\le N_1$ inside each period of length $N$, the coefficients are the same kernel again, sampled and divided by $N$:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\,\\frac{\\sin\\bigl(\\frac{2\\pi k}{N}(N_1+\\frac12)\\bigr)}{\\sin(\\pi k/N)},\\qquad a_k=\\frac{2N_1+1}{N}\\ \\text{ when }k\\equiv0\\ (\\mathrm{mod}\\ N).'},
{t:'p', text:'With $N_1=2$: at $N=10$, $a_0=0.5000$ and $a_1=0.3236$; at $N=20$, $0.2500$ and $0.2260$; at $N=30$, $0.1667$ and $0.1594$. The coefficients shrink like $1/N$ while the shape they trace stays put. Some of them are negative — at $N=10$, $a_3=-0.1236$ — so the impulses of weight $2\\pi a_k$ are of unequal size and some point downwards. Sketching them all the same length hides both facts.'},
{t:'fig', svg:()=>{const a=wax({yr:[-1.55,4.35],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
   yticksOverride:[-2*PI*0.123607,0,2*PI*0.5],ytickfmt:v=>v.toFixed(3)});
  a.curve(w=>2*PI*dirich(wrap(w),2)/10,{color:C.muted,width:1.3,dash:'4 5',n:4000});
  for(let k=-15;k<=15;k++){const w=2*PI*k/10;
    if(w>=-3*PI&&w<=3*PI){const v=2*PI*dtRect(k,10,2);
      if(Math.abs(v)>1e-9) a.impulse(w,v,{color:v>=0?C.in:C.err,label:false});}}
  mark(a,3.62); return a.svg();},
 cap:'The square wave with $N=10$, $N_1=2$. The dashed line is the envelope; the red arrows are the harmonics whose weight is negative.'},
{t:'ex', hd:'Example 6.6 — the impulse train', rows:[
 ['Given','$x[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-kN]$: a unit sample every $N$ indices. Here $n$ is the sequence index and $k$ labels the copies, so the two roles use different letters.'],
 ['Find','The coefficients and the transform.'],
 ['Solution','One period holds a single sample, at $n=0$, so $a_k=\\frac1N$ for every $k$, and $$X(e^{j\\omega})=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right).$$'],
 ['Numbers','Weights $2\\pi/5=1.2566$, $2\\pi/10=0.6283$, $2\\pi/15=0.4189$ for $N=5,10,15$.'],
 ['Reading','One period always holds $N$ impulses of weight $2\\pi/N$, so their weights add to $2\\pi$ whatever $N$ is. A sparser train in time is a denser train in frequency.']
]},

{t:'h3', text:'Bringing a frequency into range'},
{t:'ex', hd:'Example 6.7 — two cosines', rows:[
 ['Given','$x[n]=2\\cos\\left(\\frac{5\\pi}{3}n\\right)+\\cos\\left(\\frac{7\\pi}{4}n\\right)$.'],
 ['Find','The spectrum, and the fundamental period of the sequence.'],
 ['Method','First reduce each frequency to $-\\pi<\\omega\\le\\pi$ because equivalent discrete-time frequencies describe the same sequence. Then transform each cosine separately and add the results by linearity.'],
 ['Reduction','$\\frac{5\\pi}{3}=2\\pi-\\frac{\\pi}{3}$, and $2\\pi n$ is a whole number of turns at every integer $n$, so $\\cos\\left(\\frac{5\\pi}{3}n\\right)=\\cos\\left(\\frac{\\pi}{3}n\\right)$. Likewise $\\cos\\left(\\frac{7\\pi}{4}n\\right)=\\cos\\left(\\frac{\\pi}{4}n\\right)$. These are not merely similar sequences; they take the same value at every $n$.'],
 ['Solution','Inside one period there are four impulses: weight $2\\pi$ at $\\pm\\pi/3$ and weight $\\pi$ at $\\pm\\pi/4$. The amplitude 2 doubles the first pair from $\\pi$ to $2\\pi$. Outside the period the same impulses reappear every $2\\pi$: weight $2\\pi$ at $\\pm5\\pi/3$ and $\\pm7\\pi/3$, weight $\\pi$ at $\\pm7\\pi/4$ and $\\pm9\\pi/4$.'],
 ['Order','On the positive axis $\\pi/4<\\pi/3<5\\pi/3<7\\pi/4<2\\pi<9\\pi/4<7\\pi/3$: the two trains interleave, and the order flips either side of $2\\pi$.'],
 ['Period','$N_0=(2\\pi/\\omega_0)m$, where $m$ is the smallest positive integer making $N_0$ an integer. For $\\omega_1=5\\pi/3$: $2\\pi/\\omega_1=6/5$, $m=5$, $N_0=6$. For $\\omega_2=7\\pi/4$: $8/7$, $m=7$, $N_0=8$. The sum repeats after $\\operatorname{LCM}(6,8)=24$, and $24/6=4$, $24/8=3$ with $\\gcd(4,3)=1$, so nothing smaller works.']
]},
{t:'fig', svg:()=>{const a=wax({h:250,yr:[-1.5,9.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
   yticksOverride:[0,PI,2*PI],ytickfmt:piTick});
  for(let k=-2;k<=2;k++) for(const s of [1,-1]){const w=s*PI/3+2*PI*k;
    if(w>=-3*PI&&w<=3*PI) a.impulse(w,2*PI,{color:C.in,label:false});}
  for(let k=-2;k<=2;k++) for(const s of [1,-1]){const w=s*PI/4+2*PI*k;
    if(w>=-3*PI&&w<=3*PI) a.impulse(w,PI,{color:C.h,label:false});}
  mark(a,7.9); return a.svg();},
 cap:'The spectrum over three periods. Tall arrows carry weight $2\\pi$, short ones $\\pi$, and each pattern repeats every $2\\pi$.'},

{t:'h2', num:'6.6', text:'Properties'},
{t:'table', head:['Property','Pair'],
 rows:[
  ['Linearity','$a\\,x_1[n]+b\\,x_2[n]\\leftrightarrow a\\,X_1+b\\,X_2$'],
  ['Time shift','$x[n-n_0]\\leftrightarrow e^{-j\\omega n_0}X(e^{j\\omega})$'],
  ['Frequency shift','$e^{j\\omega_0n}x[n]\\leftrightarrow X(e^{j(\\omega-\\omega_0)})$'],
  ['Conjugation','$x^{*}[n]\\leftrightarrow X^{*}(e^{-j\\omega})$'],
  ['Time reversal','$x[-n]\\leftrightarrow X(e^{-j\\omega})$'],
  ['Time expansion','$x_{(k)}[n]\\leftrightarrow X(e^{jk\\omega})$'],
  ['Differencing in time','$x[n]-x[n-1]\\leftrightarrow(1-e^{-j\\omega})X(e^{j\\omega})$'],
  ['Accumulation','$\\sum_{m=-\\infty}^{n}x[m]\\leftrightarrow\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_k\\delta(\\omega-2\\pi k)$'],
  ['Differentiation in frequency','$n\\,x[n]\\leftrightarrow j\\,\\d X(e^{j\\omega})/\\d\\omega$'],
  ['Convolution','$x[n]*h[n]\\leftrightarrow X(e^{j\\omega})H(e^{j\\omega})$'],
  ['Multiplication','$x[n]y[n]\\leftrightarrow\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y(e^{j(\\omega-\\theta)})\\d\\theta$'],
  ['Real and even','$X(e^{j\\omega})$ real and even'],
  ['Real and odd','$X(e^{j\\omega})$ purely imaginary and odd'],
  ['Even-odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
  ['Parseval','$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega$']
 ]},
{t:'box', kind:'err', hd:'Two names that must not be exchanged',
 html:'Discrete time has a <b>difference</b>, not a derivative: there is nothing between $n$ and $n+1$ over which to take a limit, and the factor is $1-e^{-j\\omega}$ rather than $j\\omega$. The <b>differentiation</b> in this chapter is in frequency, and it is a genuine derivative because $\\omega$ is continuous. Naming the first difference a derivative collapses the continuous and discrete cases on the one page where the distinction is being built.'},
{t:'p', text:'For a real sequence, conjugation gives $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$, so the real part and the magnitude are even in $\\omega$ and the imaginary part and the phase are odd. Half a period then determines the whole spectrum — for a real sequence only. A complex sequence needs the full period drawn.'},
{t:'p', text:'That one line also fixes the last three rows of the table. $\\Ev\\{x[n]\\}=\\tfrac12(x[n]+x[-n])$ transforms to $\\tfrac12[X(e^{j\\omega})+X(e^{-j\\omega})]=\\tfrac12[X+X^{*}]=\\operatorname{Re}\\{X\\}$, and the odd part gives $j\\operatorname{Im}\\{X\\}$; a real and even sequence has no odd part, so its transform is real and even, and a real and odd sequence has no even part, so its transform is purely imaginary and odd. Take $x[n]=a^{n}u[n]$ with $0<a<1$. Its even part is $\\tfrac12a^{|n|}+\\tfrac12\\delta[n]$ — the two halves overlap at $n=0$ — and transforming term by term gives $(1-a\\cos\\omega)/(1-2a\\cos\\omega+a^{2})$, which is $\\operatorname{Re}\\{1/(1-ae^{-j\\omega})\\}$ exactly.'},
{t:'p', text:'<b>Accumulation</b> undoes differencing, so their factors are reciprocals, and the impulse train is the part differencing destroys. A running sum is fixed only up to a constant offset, and the difference cannot see that offset; the weight $\\pi X(e^{j0})=\\pi\\sum_n x[n]$ is what puts it back. Where the sequence sums to zero the term vanishes on its own. It is the discrete-time counterpart of the $\\pi X(0)\\delta(\\omega)$ in the integration property of Chapter 5, and it fails in the same place for the same reason: $1-e^{-j\\omega}$ is zero at $\\omega=0$.'},

{t:'h3', text:'Time expansion'},
{t:'p', text:'For a positive integer $k$, $x_{(k)}[n]$ is $x[n/k]$ when $n$ is a multiple of $k$ and zero otherwise: a stretch with zeros inserted, since discrete time has no operation that stretches a sequence without leaving gaps. Only the indices $n=rk$ contribute to the analysis sum, so putting $n=rk$ turns it into $\\sum_r x[r]e^{-j\\omega kr}=X(e^{jk\\omega})$. Replacing $\\omega$ by $k\\omega$ compresses the frequency axis by $k$, so one period of length $2\\pi$ now holds $k$ copies of the old picture.'},
{t:'ex', hd:'Example 6.8 — expansion of a five-point pulse', rows:[
 ['Given','$g[n]=1$ on $|n|\\le2$, so $G(e^{j\\omega})=\\sin(5\\omega/2)/\\sin(\\omega/2)$.'],
 ['Build','$y[n]=g[n-2]$, so $Y(e^{j\\omega})=e^{-j2\\omega}G(e^{j\\omega})$. Expanding by two gives $Y_{(2)}(e^{j\\omega})=Y(e^{j2\\omega})=e^{-j4\\omega}\\sin(5\\omega)/\\sin(\\omega)$. Finally $x[n]=y_{(2)}[n]+2y_{(2)}[n-1]$, so $X(e^{j\\omega})=(1+2e^{-j\\omega})Y_{(2)}(e^{j\\omega})$, which peaks at $3\\times5=15$.'],
 ['Where the argument halved','$G$ carries $\\sin(5\\omega/2)/\\sin(\\omega/2)$ and $Y_{(2)}$ carries $\\sin(5\\omega)/\\sin(\\omega)$: the same expression with $\\omega$ replaced by $2\\omega$. A denominator $\\sin(\\omega)$ is right for the expanded sequence and wrong for the original, where it would put a pole at $\\omega=\\pi$ — $1000.0$ at $\\omega=\\pi-10^{-3}$, against the true $G(e^{j\\pi})=1$, and $-0.7071$ at $\\pi/2$ against the true $-1.0000$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|G(e^{j\\omega})|',
    yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
   a.curve(w=>Math.abs(dirich(wrap(w),2)),{color:C.in,n:6000}); mark(a,5.72); return a.svg();},
  cap:'$|G(e^{j\\omega})|$: peak 5, and the finite value 1 at $\\omega=\\pi$.'},
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|Y_{(2)}(e^{j\\omega})|',
    pad:{l:70,r:26,t:30,b:38},yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
   a.curve(w=>Math.abs(dirich(wrap(2*w),2)),{color:C.mid,n:8000}); mark(a,5.72); return a.svg();},
  cap:'$|Y_{(2)}(e^{j\\omega})|$: the same picture twice inside every $2\\pi$.'}
]},

{t:'h3', text:'Parseval'},
{t:'p', text:'The quantity $|X(e^{j\\omega})|^{2}$ is the energy-density spectrum. Integrating it over one period and dividing by $2\\pi$ gives the total energy. Integrating over part of a period gives the energy in that frequency band. Both the single-period range and the factor $\\frac{1}{2\\pi}$ are required, although neither is visible from the plot shape. Check them numerically: for $a^{n}u[n]$ with $a=\\tfrac12$, the time side gives $\\sum_{n\\ge0}(\\tfrac14)^{n}=\\tfrac43$ and the frequency side gives $1/(1-a^{2})=\\tfrac43$; for the rectangular pulse with $N_1=2$, both sides give 5, the number of samples.'},

{t:'h2', num:'6.7', text:'Convolution and multiplication'},
{t:'eqbox', cap:'Convolution',
 tex:['y[n]=x[n]*h[n]\\;\\longleftrightarrow\\;Y(e^{j\\omega})=X(e^{j\\omega})H(e^{j\\omega})'],
 after:'Both pairs $x\\leftrightarrow X$ and $h\\leftrightarrow H$ are declared before the conclusion is written, and $y$ names the output and nothing else. A product of complex numbers gives two separate statements, $|Y|=|X|\\cdot|H|$ and $\\angle Y=\\angle X+\\angle H$. Putting modulus bars around a whole equation is not an operation on anything.'},
{t:'ex', hd:'Example 6.9 — convolving two exponentials', rows:[
 ['Given','$x[n]=a^{n}u[n]$ and $h[n]=b^{n}u[n]$, with $|a|<1$, $|b|<1$ and $a\\neq b$. Every one-sided exponential carries its $u[n]$: without it the sequence is defined for negative $n$ too, where it grows without bound.'],
 ['Method','Use the convolution property because the required output is a time convolution. Multiply the transforms, then use partial fractions so each term matches the known one-sided exponential pair. Write $z=e^{-j\\omega}$ as an algebraic variable; then $Y=1/((1-az)(1-bz))$ is a rational function of $z$, and substituting $z=1/a$ is algebra in $z$, not a claim that $e^{-j\\omega}$ takes that value.'],
 ['Solution','Cover-up gives $A=a/(a-b)$ and $B=-b/(a-b)$, so $$y[n]=\\frac{1}{a-b}\\left[a^{\\,n+1}-b^{\\,n+1}\\right]u[n].$$'],
 ['Condition','Both coefficients divide by $a-b$, so the route requires $a\\neq b$. At $a=b$ the two poles merge and the answer takes a different form, worked out in Section 6.8.'],
 ['Check','$a=\\tfrac12$, $b=\\tfrac14$: $y[0]=1$, $y[1]=0.75$, $y[2]=0.4375$, $y[3]=0.234375$. Direct convolution gives $y[0]=x[0]h[0]=1$ and $y[1]=\\tfrac14+\\tfrac12=0.75$; the first value must be $x[0]h[0]$ for any two causal sequences. The magnitude $|Y|$ runs between $0.5333$ and $2.6667$.']
]},
{t:'p', text:'The product of two ideal low-pass responses is the narrower of the two, so a cascade keeps only the band both filters pass. With cutoffs $\\pi/2$ and $\\pi/4$, the cascade has cutoff $\\pi/4$ and impulse response $\\sin(\\pi n/4)/(\\pi n)$. In writing such a spectrum, close one branch and leave the other open — 1 for $|\\omega|\\le\\pi/4$ and 0 for $\\pi/4<|\\omega|\\le\\pi$ — since for an ideal filter the band edge is precisely where a convention is needed rather than assumed.'},
{t:'ex', hd:'Example 6.10 — a stepped spectrum through a filter', rows:[
 ['Given','$X(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$ and 1 for $\\pi/4<|\\omega|\\le3\\pi/4$, zero to $\\pi$; $H$ is ideal low-pass with cutoff $\\pi/2$.'],
 ['Product','$Y(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$ and 1 for $\\pi/4<|\\omega|\\le\\pi/2$, zero on the rest of the period.'],
 ['Solution','Split $Y$ into two stacked ideal bands, one of height 1 out to $\\pi/2$ and one more out to $\\pi/4$: $$y[n]=\\frac{\\sin(\\pi n/2)}{\\pi n}+\\frac{\\sin(\\pi n/4)}{\\pi n},\\qquad y[0]=\\tfrac12+\\tfrac14=\\tfrac34.$$'],
 ['Check','$y[0]$ must be the area of one period of $Y$ divided by $2\\pi$. A sketch of a spectrum is not a solution; the closed form costs one line once the stack is seen.']
]},

{t:'h3', text:'Multiplication is a periodic convolution'},
{t:'eqbox', cap:'Multiplication',
 tex:['z[n]=x[n]y[n]\\;\\longleftrightarrow\\;Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta'],
 after:'The integral runs over one period and both factors are $2\\pi$-periodic. That operation is a periodic convolution, and it differs from the ordinary convolution of two functions on the line whenever the result is wider than one period.'},
{t:'p', text:'Take $X=1$ on $|\\omega|\\le3\\pi/4$ and $Y=1$ on $|\\omega|\\le\\pi/2$, both repeated every $2\\pi$. First convolve the rectangles on the line. This gives a trapezoid of height $\\frac{1}{2\\pi}\\cdot2\\cdot\\frac{\\pi}{2}=\\frac12$, flat on $|\\omega|\\le\\pi/4$ and reaching zero at $|\\omega|=5\\pi/4$. Since $5\\pi/4>\\pi$, the result extends beyond one period. A periodic copy therefore overlaps it near $\\omega=\\pm\\pi$, and the two values add.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:220,yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),yticksOverride:[0,0.125,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
   for(let k=-2;k<=2;k++) a.curve(w=>rectConv(w-2*PI*k,3*PI/4,PI/2),{color:C.muted,n:4000,width:1.2,dash:'4 5'});
   a.curve(w=>perConv(w,3*PI/4,PI/2),{color:C.out,n:6000}); mark(a,0.665); return a.svg();},
  cap:'The dashed trapezoids are the copies; the solid curve is their sum. At $\\omega=\\pi$ the value doubles from $0.125$ to $0.25$.'},
 {svg:()=>{const a=wax({w:640,h:220,yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),yticksOverride:[0,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>perConv(w,PI/2,PI/2),{color:C.mid,n:6000}); mark(a,0.665); return a.svg();},
  cap:'Two equal bands of half-width $\\pi/2$: the triangle fills one period and reaches zero at both boundaries, so repeated copies do not overlap.'}
]},
{t:'p', text:'The values are $Z(e^{j0})=Z(e^{j\\pi/4})=0.5$ on the flat top, $Z(e^{j3\\pi/4})=0.25$ on the slope, and $Z(e^{j\\pi})=\\tfrac18+\\tfrac18=0.25$ at the edge. The check is the synthesis equation: $\\frac{1}{2\\pi}\\int_{2\\pi}Z\\,\\d\\omega$ must equal $z[0]=x[0]y[0]=\\tfrac34\\cdot\\tfrac12=0.375$, and it does.'},
{t:'ex', hd:'Example 6.11 — multiplying by a cosine', rows:[
 ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/4$, repeated every $2\\pi$, and $y[n]=\\cos(\\omega_0n)$ with $\\omega_0=\\pi/3$.'],
 ['Method','Write $Y$ as its impulse train, $\\pi\\sum_l[\\delta(\\omega-\\omega_0-2\\pi l)+\\delta(\\omega+\\omega_0-2\\pi l)]$. The periodic convolution integrates over a single period, so choosing $-\\pi<\\theta\\le\\pi$ leaves exactly two impulses, at $\\theta=\\pm\\pi/3$, and only those contribute. Taking the whole train into an ordinary convolution would count every copy and diverge.'],
 ['Solution','$$Z(e^{j\\omega})=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr),$$where the height $\\tfrac12$ comes from $\\frac{1}{2\\pi}\\cdot\\pi$.'],
 ['Band edges','The band moves to $\\omega_0\\mp\\pi/4$, so with $\\omega_0=\\pi/3$ the edges are $\\pi/12$ and $7\\pi/12$, and the mirror image occupies $-7\\pi/12\\le\\omega\\le-\\pi/12$. Both numbers are computed from $\\omega_0$ and the bandwidth, so they cannot drift apart from the drawn figure; with $\\omega_0$ below $\\pi/4$ the two bands would overlap through the origin instead.']
]},
{t:'box', kind:'warn', hd:'This overlap is not aliasing',
 html:'This overlap occurs between periodic copies during frequency-domain convolution. Chapter 7 studies a different overlap between replicas produced by sampling. Only the sampling overlap is called aliasing.'},

{t:'h2', num:'6.8', text:'Difference equations'},
{t:'p', text:'Transform both sides of a linear constant-coefficient difference equation. Linearity acts term by term and each shift brings out one factor $e^{-j\\omega k}$:'},
{t:'eqbox', cap:'Frequency response of a difference equation',
 tex:['\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]',
      'H(e^{j\\omega})=\\frac{Y(e^{j\\omega})}{X(e^{j\\omega})}=\\frac{\\sum_{k=0}^{M}b_k e^{-j\\omega k}}{\\sum_{k=0}^{N}a_k e^{-j\\omega k}}'],
 after:'The impulse response of the recursion is now available without running the recursion: factor the denominator, split into partial fractions, and invert each piece with the exponential pair. Every step is algebra.'},
{t:'ex', hd:'Example 6.12 — a second-order system', rows:[
 ['Given','$y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$.'],
 ['Find','The frequency response and the impulse response.'],
 ['Solution','$$H(e^{j\\omega})=\\frac{2}{1-\\tfrac34e^{-j\\omega}+\\tfrac18e^{-j2\\omega}}=\\frac{2}{\\bigl(1-\\tfrac12e^{-j\\omega}\\bigr)\\bigl(1-\\tfrac14e^{-j\\omega}\\bigr)},$$checked by expansion: $\\tfrac12+\\tfrac14=\\tfrac34$ and $\\tfrac12\\cdot\\tfrac14=\\tfrac18$. With $z=e^{-j\\omega}$, cover-up at $z=2$ gives $A=4$ and at $z=4$ gives $B=-2$, so $$h[n]=4\\left(\\tfrac12\\right)^{n}u[n]-2\\left(\\tfrac14\\right)^{n}u[n].$$'],
 ['Check','$h[0]=2$, $h[1]=1.5$, $h[2]=0.875$. Substituting into the equation: $h[1]-\\tfrac34h[0]=0$ and $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0$, as required for $n\\ge1$. Both poles have modulus below 1, so the system is stable, and $|H|$ runs between $1.0667$ and $5.3333$: this recursion is a low-pass filter.']
]},

{t:'h3', text:'The repeated-pole pair'},
{t:'p', text:'Example 6.9 excluded $a=b$ because its partial fractions divide by $a-b$. When $a=b$, the poles coincide and require a separate pair. Derive it from the geometric pair by differentiating both sides with respect to $a$ while holding $\\omega$ fixed:'},
{t:'eq', tex:'\\sum_{n=1}^{\\infty}n\\,a^{\\,n-1}e^{-j\\omega n}=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.'},
{t:'eqbox', cap:'Repeated pole',
 tex:['(n+1)a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\qquad |a|<1'],
 after:'Putting $m=n-1$ and cancelling one factor $e^{-j\\omega}$ gives the pair. The exponent 2 comes from the differentiation and the minus sign is inherited unchanged, so neither has to be remembered. One number settles any doubt: at $\\omega=0$ with $a=\\tfrac14$ the value is $(1-\\tfrac14)^{-2}=\\tfrac{16}{9}=1.7778$, while a plus sign would give $(\\tfrac54)^{-2}=0.6400$.'},
{t:'ex', hd:'Example 6.13 — the output of that system', rows:[
 ['Given','The system of Example 6.12 driven by $x[n]=\\left(\\tfrac14\\right)^{n}u[n]$.'],
 ['Method','Use partial fractions because the output transform is rational and each fraction can be inverted with a known pair. The input pole coincides with one system pole, so the expansion must include both a simple and a squared term for that pole: $$Y=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)^{2}}=\\frac{A}{1-\\tfrac14z}+\\frac{B}{\\bigl(1-\\tfrac14z\\bigr)^{2}}+\\frac{C}{1-\\tfrac12z}.$$'],
 ['Coefficients','Cover-up at $z=2$ gives $C=2/(1-\\tfrac12)^{2}=8$; at $z=4$ it gives $B=2/(1-2)=-2$; setting $z=0$ in the identity gives $2=A+B+C$, so $A=-4$.'],
 ['Solution','$$y[n]=-4\\left(\\tfrac14\\right)^{n}u[n]-2(n+1)\\left(\\tfrac14\\right)^{n}u[n]+8\\left(\\tfrac12\\right)^{n}u[n].$$'],
 ['Check','$y[0]=2$, $y[1]=2$, $y[2]=1.375$, $y[3]=0.8125$, and $y[0]$ must equal $h[0]x[0]=2$ for two causal sequences. Direct convolution of $h$ and $x$ reproduces the whole sequence. Without the repeated-pole pair the middle term could not be inverted at all.']
]},

{t:'h2', num:'6.9', text:'Duality'},
{t:'p', text:'There is no duality inside the discrete-time transform pair. The analysis equation is a sum over an integer and the synthesis equation an integral over a continuous variable, so no relabelling turns one into the other. Two dualities do hold.'},
{t:'ol', items:[
 'In the discrete-time Fourier series, where both domains are discrete and both objects are periodic with the same period $N$: if $x[n]\\leftrightarrow a_k$, then reading the coefficients as a sequence gives $a[n]\\leftrightarrow\\frac1N x[-k]$. The impulse train with $N=21$ is the example: its coefficients are all $1/21=0.0476$, and reading those constants back as a sequence returns an impulse train.',
 'Between the discrete-time transform and the continuous-time series. $X(e^{j\\omega})$ is a $2\\pi$-periodic function of a continuous variable, so it has a continuous-time Fourier series, and comparing the two synthesis equations identifies its coefficients as $x[-k]$: the spectrum of a sequence is a periodic signal whose series coefficients are the sequence itself, reversed.'
]},
{t:'p', text:'A worked check on the second. Take the $2\\pi$-periodic square wave in $\\omega$, equal to 1 for $|\\omega|\\le\\pi/2$ and zero over the rest of the period. Its series coefficients are $a_k=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{-jk\\omega}\\d\\omega=\\sin(k\\pi/2)/(k\\pi)$, that is $0.5$, $1/\\pi=0.3183$, $0$, $-1/(3\\pi)=-0.1061$. Its inverse transform is $x[n]=\\sin(\\pi n/2)/(\\pi n)$, which is the same list of numbers, so $a_k=x[-k]$ — and here $x$ is even, so $a_k=x[k]$ as well.'},

{t:'h2', num:'6.10', text:'What to carry into Chapter 7'},
{t:'ul', items:[
 'The pair, with analysis as the sum and synthesis as the integral over one period, carrying $\\frac{1}{2\\pi}$.',
 'The $2\\pi$-periodicity and its one-line proof, and that the same line fails in continuous time.',
 'Real means the phase is 0 or $\\pi$, not that the phase is zero.',
 'Multiplication in time is a <b>periodic</b> convolution over $2\\pi$, so anything reaching across a period boundary folds back and adds.',
 'The unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, restated at every point of use.',
 'Discrete time has a difference, not a derivative; the derivative in this chapter is in frequency.'
]},
{t:'p', text:'A sequence can be formed by reading a continuous-time signal at regular instants. The next chapter studies how this sampling operation changes the spectrum. Sampling produces repeated spectral copies separated by the sampling frequency, so the periodic-overlap ideas from this chapter will be used again.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'6.1', text:'Prove that $X(e^{j\\omega})$ is $2\\pi$-periodic, and say precisely where the same argument fails for $X(j\\omega)$.',
 ans:'Substituting $\\omega+2\\pi$ into the analysis sum produces a factor $e^{-j2\\pi n}$, which is 1 in every term because $n$ is an integer. In continuous time the corresponding factor is $e^{-j2\\pi t}$ with $t$ real, which equals 1 only at integer $t$ and cannot leave the integral.'},
{t:'q', n:'6.2', text:'For $x[n]=a^{n}u[n]$ with $a=\\tfrac18$, give $|X|_{\\max}$, $|X|_{\\min}$ and $\\max|\\angle X|$ in closed form and as numbers.',
 ans:'$1/(1-a)=8/7=1.1429$, $1/(1+a)=8/9=0.8889$, and $\\arcsin\\tfrac18=0.1253$ rad.'},
{t:'q', n:'6.3', text:'Explain why the finite geometric sum behind the Dirichlet kernel needs $r\\neq1$ rather than $|r|<1$, and give the value of the kernel at the excluded points.',
 ans:'A finite sum always has a value; only the closed form fails, where its denominator $1-r$ vanishes. Here $|r|=1$ at every $\\omega$, so $|r|<1$ would exclude the sum entirely. At $r=1$, that is $\\omega$ a multiple of $2\\pi$, every term is 1 and the sum is $2N_1+1$.'},
{t:'q', n:'6.4', text:'The Dirichlet kernel is real at every $\\omega$. Does it follow that $|X|=X$ and $\\angle X=0$?',
 ans:'No. Realness fixes the imaginary part and not the sign. The kernel is negative on part of every period — least value $-1.2500$ for $N_1=2$ — and there $|X|=-X$ and $\\angle X=\\pi$. The conclusion needs the extra hypothesis $X\\ge0$, which holds for $a^{|n|}$ but not here.'},
{t:'q', n:'6.5', text:'Invert the ideal low-pass spectrum with $W=\\pi/2$ and give $x[0]$ and $x[2]$. State the sinc convention you use.',
 ans:'$x[n]=\\sin(Wn)/(\\pi n)$ with $x[0]=W/\\pi=0.5$, and $x[2]=\\sin(\\pi)/(2\\pi)=0$. In the unnormalised convention $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, the same sequence is $\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$.'},
{t:'q', n:'6.6', text:'Where do the impulses of $2\\cos\\left(\\frac{5\\pi}{3}n\\right)+\\cos\\left(\\frac{7\\pi}{4}n\\right)$ lie inside $-\\pi<\\omega\\le\\pi$, and what is the fundamental period of the sequence?',
 ans:'Weight $2\\pi$ at $\\pm\\pi/3$ and weight $\\pi$ at $\\pm\\pi/4$, after reducing $5\\pi/3$ to $\\pi/3$ and $7\\pi/4$ to $\\pi/4$. The two components have periods 6 and 8, so the sum has period $\\operatorname{LCM}(6,8)=24$.'},
{t:'q', n:'6.7', text:'Two spectra, 1 on $|\\omega|\\le3\\pi/4$ and 1 on $|\\omega|\\le\\pi/2$, belong to sequences that are multiplied together. Why is $Z(e^{j\\pi})=\\tfrac14$ and not $\\tfrac18$?',
 ans:'The multiplication property gives a periodic convolution over one period. The ordinary convolution of the two rectangles is a trapezoid reaching to $|\\omega|=5\\pi/4$, which is wider than one period, so near $\\omega=\\pi$ a second copy arrives from the other side and the two contributions of $\\tfrac18$ add.'},
{t:'q', n:'6.8', text:'Derive the pair for $(n+1)a^{n}u[n]$ and say what fixes the exponent and the sign.',
 ans:'Differentiate $\\sum_{n\\ge0}a^{n}e^{-j\\omega n}=1/(1-ae^{-j\\omega})$ with respect to $a$, shift the index and cancel one factor $e^{-j\\omega}$, giving $1/(1-ae^{-j\\omega})^{2}$. One differentiation of a first power produces the exponent 2, and the minus sign is inherited from the pair being differentiated.'},
{t:'q', n:'6.9', text:'Find the impulse response of $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$ and check it against the equation.',
 ans:'$h[n]=4(\\tfrac12)^{n}u[n]-2(\\tfrac14)^{n}u[n]$, so $h[0]=2$, $h[1]=1.5$, $h[2]=0.875$. Substituting: $h[1]-\\tfrac34h[0]=0$ and $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0$.'},
{t:'q', n:'6.10', text:'Which properties of the continuous-time transform carry over unchanged, and which change form?',
 ans:'Linearity, the time shift, conjugate symmetry, Parseval and the convolution property carry over unchanged. The synthesis equation changes its range to one period; the multiplication property becomes a periodic convolution; the time-domain operator is a difference and not a derivative; and the transform pairs themselves differ, since the discrete-time ones are $2\\pi$-periodic and carry their own convergence conditions.'}
];
})();
