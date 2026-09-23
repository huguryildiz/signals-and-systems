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
 ['Solution','Start from the analysis sum and substitute the sequence. The unit sample $\\delta[n-n_0]$ is 1 at $n=n_0$ and 0 at every other $n$, so the sum keeps one term: $$\\begin{aligned}X(e^{j\\omega})&=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}\\\\&=\\sum_{n=-\\infty}^{\\infty}\\delta[n-n_0]e^{-j\\omega n}\\\\&=e^{-j\\omega n_0}.\\end{aligned}$$ Write the result in polar form. A complex exponential $e^{j\\phi}$ with real $\\phi$ has modulus 1 and angle $\\phi$, so $$|X(e^{j\\omega})|=|e^{-j\\omega n_0}|=1,\\qquad \\angle X(e^{j\\omega})=-n_0\\omega.$$ The magnitude is 1 at every frequency and the phase is a straight line of slope $-n_0$.'],
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
 ['Solution','Start from the analysis sum and substitute the sequence. The factor $u[n]$ is 0 for $n<0$ and 1 for $n\\ge0$, so the lower limit moves to $n=0$. Then collect the two powers of $n$ into one power: $$\\begin{aligned}X(e^{j\\omega})&=\\sum_{n=-\\infty}^{\\infty}a^{n}u[n]\\,e^{-j\\omega n}\\\\&=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}\\\\&=\\sum_{n=0}^{\\infty}\\bigl(ae^{-j\\omega}\\bigr)^{n}.\\end{aligned}$$ This is an infinite geometric series with first term 1 and ratio $r=ae^{-j\\omega}$. The formula $\\sum_{n=0}^{\\infty}r^{n}=1/(1-r)$ holds when $|r|<1$. Here $|r|=|a|\\,|e^{-j\\omega}|=|a|\\cdot1=|a|<1$, so the series converges at every $\\omega$ and $$X(e^{j\\omega})=\\frac{1}{1-ae^{-j\\omega}}.$$ For the magnitude, write the denominator in rectangular form with $e^{-j\\omega}=\\cos\\omega-j\\sin\\omega$: $$1-ae^{-j\\omega}=(1-a\\cos\\omega)+j\\,a\\sin\\omega.$$ Its squared modulus is the sum of the squared real and imaginary parts: $$\\begin{aligned}|1-ae^{-j\\omega}|^{2}&=(1-a\\cos\\omega)^{2}+a^{2}\\sin^{2}\\omega\\\\&=1-2a\\cos\\omega+a^{2}\\cos^{2}\\omega+a^{2}\\sin^{2}\\omega\\\\&=1-2a\\cos\\omega+a^{2},\\end{aligned}$$ using $\\cos^{2}\\omega+\\sin^{2}\\omega=1$. The modulus of a quotient is the quotient of the moduli, and the angle of a quotient is the difference of the angles. The numerator 1 has modulus 1 and angle 0, so $$\\begin{gathered}|X(e^{j\\omega})|=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}},\\\\[3pt]\\angle X(e^{j\\omega})=0-\\arctan\\frac{a\\sin\\omega}{1-a\\cos\\omega}=-\\arctan\\frac{a\\sin\\omega}{1-a\\cos\\omega}.\\end{gathered}$$'],
 ['Extremes','The magnitude is largest where the denominator $1-2a\\cos\\omega+a^{2}$ is smallest. For $a>0$ that is at $\\cos\\omega=1$, so $\\omega=0$, where the denominator is $1-2a+a^{2}=(1-a)^{2}$ and $|X|_{\\max}=1/(1-a)$. It is smallest at $\\cos\\omega=-1$, so $\\omega=\\pm\\pi$, where the denominator is $(1+a)^{2}$ and $|X|_{\\min}=1/(1+a)$. For negative $a$ the two ends swap, so in general $|X|_{\\max}=1/(1-|a|)$ and $|X|_{\\min}=1/(1+|a|)$. For the phase, find where the ratio $r(\\omega)=a\\sin\\omega/(1-a\\cos\\omega)$ is stationary. The quotient rule gives $$r\'(\\omega)=\\frac{a\\cos\\omega(1-a\\cos\\omega)-a\\sin\\omega\\cdot a\\sin\\omega}{(1-a\\cos\\omega)^{2}}=\\frac{a(\\cos\\omega-a)}{(1-a\\cos\\omega)^{2}},$$ again using $\\cos^{2}\\omega+\\sin^{2}\\omega=1$ in the numerator. So the extreme is at $\\cos\\omega=a$, where $\\sin\\omega=\\pm\\sqrt{1-a^{2}}$ and $$|r|=\\frac{|a|\\sqrt{1-a^{2}}}{1-a^{2}}=\\frac{|a|}{\\sqrt{1-a^{2}}}.$$ A right triangle with opposite side $|a|$ and adjacent side $\\sqrt{1-a^{2}}$ has hypotenuse 1, so $\\arctan|r|=\\arcsin|a|$ and $\\max|\\angle X|=\\arcsin|a|$. Geometrically, the denominator $1-ae^{-j\\omega}$ traces a circle of radius $|a|$ about the point 1, and the tangent from the origin to that circle gives the same angle.'],
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
 ['Solution','Start from the analysis sum and split it at $n=0$. For $n\\ge0$, $a^{|n|}=a^{n}$; for $n\\le-1$, $a^{|n|}=a^{-n}$: $$X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}a^{|n|}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}+\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}.$$ The first sum is the one-sided pair of Example 6.2, equal to $1/(1-ae^{-j\\omega})$ because $|ae^{-j\\omega}|=|a|<1$. In the second sum put $m=-n$. As $n$ runs from $-\\infty$ to $-1$, $m$ runs from $1$ to $\\infty$: $$\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}=\\sum_{m=1}^{\\infty}a^{m}e^{j\\omega m}=\\sum_{m=1}^{\\infty}\\bigl(ae^{j\\omega}\\bigr)^{m}.$$ This is a geometric series with first term $ae^{j\\omega}$ and ratio $ae^{j\\omega}$, of modulus $|a|<1$, so it equals $ae^{j\\omega}/(1-ae^{j\\omega})$. Add the two parts over the common denominator $(1-ae^{-j\\omega})(1-ae^{j\\omega})$: $$\\begin{aligned}X(e^{j\\omega})&=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}\\\\&=\\frac{(1-ae^{j\\omega})+ae^{j\\omega}(1-ae^{-j\\omega})}{(1-ae^{-j\\omega})(1-ae^{j\\omega})}\\\\&=\\frac{1-ae^{j\\omega}+ae^{j\\omega}-a^{2}}{1-a(e^{j\\omega}+e^{-j\\omega})+a^{2}}\\\\&=\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}.\\end{aligned}$$ In the numerator the two terms $\\mp ae^{j\\omega}$ cancel and $ae^{j\\omega}\\cdot ae^{-j\\omega}=a^{2}$. In the denominator, $e^{j\\omega}+e^{-j\\omega}=2\\cos\\omega$.'],
 ['Extremes','At $\\omega=0$ the value is $(1+a)/(1-a)$; at $\\omega=\\pm\\pi$ it is $(1-a)/(1+a)$. For $a=\\tfrac12$ these are 3 and $\\tfrac13$; for $a=\\tfrac14$ they are $1.6667$ and $0.6$.'],
 ['Reading','The denominator is $|1-ae^{-j\\omega}|^{2}$, which is positive, and the numerator is positive for $|a|<1$. So this spectrum is real and strictly positive, and here $|X|=X$ with $\\angle X=0$ throughout. That is a property of this example, not of real spectra in general.']
]},

{t:'ex', hd:'Example 6.4 — the rectangular pulse', rows:[
 ['Given','$x[n]=1$ for $-N_1\\le n\\le N_1$ and zero elsewhere.'],
 ['Find','$X(e^{j\\omega})$ in closed form and its value at $\\omega=0$.'],
 ['Method','Use the finite geometric-series formula because the pulse has consecutive non-zero samples. Then balance the endpoint exponents so each difference can be written as a sine.'],
 ['Solution','Start from the analysis sum. The sequence is 1 on $-N_1\\le n\\le N_1$ and 0 elsewhere, so the limits shrink to the support: $$X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}=\\sum_{n=-N_1}^{N_1}e^{-j\\omega n}=\\sum_{n=-N_1}^{N_1}\\bigl(e^{-j\\omega}\\bigr)^{n}.$$ This is a finite geometric series with ratio $r=e^{-j\\omega}$, first term $r^{-N_1}=e^{j\\omega N_1}$ and $2N_1+1$ terms. The finite formula $\\sum_{n=p}^{q}r^{n}=(r^{p}-r^{q+1})/(1-r)$ needs only $r\\neq1$. With $p=-N_1$ and $q=N_1$: $$X(e^{j\\omega})=\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}.$$ Now balance the exponents. Multiply numerator and denominator by $e^{j\\omega/2}$, which changes nothing because it is the same factor above and below: $$\\begin{aligned}X(e^{j\\omega})&=\\frac{e^{j\\omega/2}\\bigl(e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}\\bigr)}{e^{j\\omega/2}\\bigl(1-e^{-j\\omega}\\bigr)}\\\\&=\\frac{e^{j\\omega(N_1+\\frac12)}-e^{-j\\omega(N_1+\\frac12)}}{e^{j\\omega/2}-e^{-j\\omega/2}}\\\\&=\\frac{2j\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)}{2j\\sin(\\omega/2)}\\\\&=\\frac{\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)}{\\sin(\\omega/2)}.\\end{aligned}$$ The third line uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ twice, once with $\\theta=\\omega(N_1+\\tfrac12)$ and once with $\\theta=\\omega/2$. The minus in each bracket is what makes a sine; a plus would give a cosine and a different function. With $N=2N_1+1$ samples in the pulse, $N_1+\\tfrac12=N/2$, so the same result reads $\\sin(\\omega N/2)/\\sin(\\omega/2)$.'],
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
 ['Solution','Start from the synthesis integral over the period $-\\pi\\le\\omega\\le\\pi$. The spectrum is 1 on $|\\omega|\\le W$ and 0 on the rest of the period, so the limits shrink to $-W\\le\\omega\\le W$: $$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega.$$ For $n\\neq0$ the antiderivative of $e^{j\\omega n}$ in $\\omega$ is $e^{j\\omega n}/(jn)$: $$\\begin{aligned}x[n]&=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega n}}{jn}\\right]_{-W}^{W}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWn}-e^{-jWn}}{jn}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(Wn)}{jn}\\\\&=\\frac{\\sin(Wn)}{\\pi n}.\\end{aligned}$$ The third line uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$, and then the $j$ and the 2 cancel. At $n=0$ the antiderivative does not apply because it divides by $n$. There the integrand is $e^{0}=1$, so the integral is the length $2W$ of the band and $$x[0]=\\frac{1}{2\\pi}\\cdot2W=\\frac{W}{\\pi},$$ which is also the limit of $\\sin(Wn)/(\\pi n)$ as $n\\to0$.'],
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
 after:'To confirm the pair, put the impulse train into the synthesis equation. Choose the integration period $\\omega_0-\\pi<\\omega\\le\\omega_0+\\pi$, so that it contains exactly one impulse of the train, the one at $\\omega=\\omega_0$ with $k=0$. Then the sifting property picks out the integrand at $\\omega=\\omega_0$: $$\\begin{aligned}x[n]&=\\frac{1}{2\\pi}\\int_{\\omega_0-\\pi}^{\\omega_0+\\pi}\\sum_{k}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)\\,e^{j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{\\omega_0-\\pi}^{\\omega_0+\\pi}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\cdot2\\pi\\,e^{j\\omega_0n}=e^{j\\omega_0n}.\\end{aligned}$$ The copies must be there: a single impulse is not $2\\pi$-periodic, and a sequence cannot distinguish $\\omega_0$ from $\\omega_0+2\\pi$.'},
{t:'box', hd:'Weight, not height',
 html:'An impulse has no value at a point; it has a weight, the number that comes out when it is integrated. Every figure here draws an impulse as an arrow whose height <b>is</b> its weight, so the two can be read off the same axis. Arrows drawn to a fixed height with the weight written beside them hide exactly the comparison these pictures are for.'},
{t:'eqbox', cap:'A periodic sequence',
 tex:['x[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\frac{2\\pi}{N}n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)',
      '\\cos\\omega_0 n\\;\\longleftrightarrow\\;\\pi\\sum_{k}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]',
      '\\sin\\omega_0 n\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\sum_{k}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]'],
 after:'The first line is the complex-exponential pair applied term by term. The series writes $x[n]$ as a sum of $N$ exponentials with frequencies $k\\cdot2\\pi/N$ and weights $a_k$. By linearity each exponential contributes its own impulse train, $2\\pi a_k$ at $2\\pi k/N$ plus all the $2\\pi$ copies. Because $k$ runs over one period of $N$ values and each train repeats every $2\\pi$, the copies together fill in every integer $k$, which is why the right-hand sum runs over all $k$. The spacing is $2\\pi/N$, so one period holds exactly $N$ impulses. The cosine and sine lines come from Euler\'s relations, $\\cos\\omega_0n=\\tfrac12e^{j\\omega_0n}+\\tfrac12e^{-j\\omega_0n}$ and $\\sin\\omega_0n=\\tfrac{1}{2j}e^{j\\omega_0n}-\\tfrac{1}{2j}e^{-j\\omega_0n}$. Each exponential brings an impulse train of weight $2\\pi$, and $\\tfrac12\\cdot2\\pi=\\pi$ while $\\tfrac{1}{2j}\\cdot2\\pi=\\pi/j$. A real sequence always produces the pair at $+\\omega_0$ and $-\\omega_0$; dropping the negative one rebuilds $\\tfrac12e^{j\\omega_0n}$, which is complex, instead of the cosine.'},
{t:'p', text:'For the periodic square wave, 1 on $|n|\\le N_1$ inside each period of length $N$, take the analysis sum of the series over the period centred on the origin. The sequence is 1 on $-N_1\\le n\\le N_1$ and 0 on the rest of that period, so the limits shrink to the pulse:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]e^{-jk\\frac{2\\pi}{N}n}=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}e^{-j\\left(\\frac{2\\pi k}{N}\\right)n}.'},
{t:'p', text:'The remaining sum is the rectangular-pulse sum of Example 6.4 with $\\omega$ replaced by $2\\pi k/N$. So the coefficients are the same kernel again, sampled at $\\omega=2\\pi k/N$ and divided by $N$:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\,\\frac{\\sin\\bigl(\\frac{2\\pi k}{N}(N_1+\\frac12)\\bigr)}{\\sin(\\pi k/N)},\\qquad a_k=\\frac{2N_1+1}{N}\\ \\text{ when }k\\equiv0\\ (\\mathrm{mod}\\ N).'},
{t:'p', text:'The second form covers the excluded points of Example 6.4. When $k$ is a multiple of $N$, $\\sin(\\pi k/N)=0$ and the closed form fails, but every term of the sum is 1, so the sum is $2N_1+1$. With $N_1=2$ and $N=10$, $a_0=5/10=0.5000$ and $a_1=\\tfrac{1}{10}\\sin(\\pi/2)/\\sin(\\pi/10)=\\tfrac{1}{10}\\cdot1/0.3090=0.3236$. At $N=20$ the first two are $0.2500$ and $0.2260$; at $N=30$, $0.1667$ and $0.1594$. The coefficients shrink like $1/N$ while the shape they trace stays put. Some of them are negative. At $N=10$, $a_3=\\tfrac{1}{10}\\sin(3\\pi/2)/\\sin(3\\pi/10)=\\tfrac{1}{10}\\cdot(-1)/0.8090=-0.1236$, so the impulses of weight $2\\pi a_k$ are of unequal size and some point downwards. Sketching them all the same length hides both facts.'},
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
 ['Method','The sequence is periodic with period $N$, so its transform is an impulse train. Find the series coefficients $a_k$ from the analysis sum of the series, then give each impulse the weight $2\\pi a_k$ with the periodic-sequence pair.'],
 ['Solution','Take any run of $N$ consecutive indices that contains $n=0$. Inside it the only non-zero sample is $\\delta[n]$ at $n=0$, so the analysis sum keeps one term: $$a_k=\\frac1N\\sum_{n=\\langle N\\rangle}x[n]e^{-jk\\frac{2\\pi}{N}n}=\\frac1N\\,\\delta[0]\\,e^{-jk\\frac{2\\pi}{N}\\cdot0}=\\frac1N\\qquad\\text{for every }k.$$ Put $a_k=1/N$ into the periodic-sequence pair. Every impulse gets the same weight $2\\pi a_k=2\\pi/N$: $$X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\cdot\\frac1N\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right).$$'],
 ['Numbers','Weights $2\\pi/5=1.2566$, $2\\pi/10=0.6283$, $2\\pi/15=0.4189$ for $N=5,10,15$.'],
 ['Reading','One period always holds $N$ impulses of weight $2\\pi/N$, so their weights add to $2\\pi$ whatever $N$ is. A sparser train in time is a denser train in frequency.']
]},

{t:'h3', text:'Bringing a frequency into range'},
{t:'ex', hd:'Example 6.7 — two cosines', rows:[
 ['Given','$x[n]=2\\cos\\left(\\frac{5\\pi}{3}n\\right)+\\cos\\left(\\frac{7\\pi}{4}n\\right)$.'],
 ['Find','The spectrum, and the fundamental period of the sequence.'],
 ['Method','First reduce each frequency to $-\\pi<\\omega\\le\\pi$ because equivalent discrete-time frequencies describe the same sequence. Then transform each cosine separately and add the results by linearity.'],
 ['Reduction','$\\frac{5\\pi}{3}=2\\pi-\\frac{\\pi}{3}$, and $2\\pi n$ is a whole number of turns at every integer $n$, so $\\cos\\left(\\frac{5\\pi}{3}n\\right)=\\cos\\left(\\frac{\\pi}{3}n\\right)$. Likewise $\\cos\\left(\\frac{7\\pi}{4}n\\right)=\\cos\\left(\\frac{\\pi}{4}n\\right)$. These are not merely similar sequences; they take the same value at every $n$.'],
 ['Solution','After the reduction, $x[n]=2\\cos(\\tfrac{\\pi}{3}n)+\\cos(\\tfrac{\\pi}{4}n)$. Apply the cosine pair to each term and add by linearity: $$\\begin{aligned}X(e^{j\\omega})=2\\pi\\sum_{k}\\Bigl[&\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi k\\bigr)\\Bigr]\\\\{}+\\pi\\sum_{k}\\Bigl[&\\delta\\bigl(\\omega-\\tfrac{\\pi}{4}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{4}-2\\pi k\\bigr)\\Bigr].\\end{aligned}$$ The amplitude 2 multiplies the weight $\\pi$ of the first cosine pair to $2\\cdot\\pi=2\\pi$; the second cosine has amplitude 1 and keeps the weight $\\pi$. So inside one period, $-\\pi<\\omega\\le\\pi$, there are four impulses: weight $2\\pi$ at $\\pm\\pi/3$ and weight $\\pi$ at $\\pm\\pi/4$. Outside the period the same impulses reappear every $2\\pi$ (the terms with $k=\\pm1$): weight $2\\pi$ at $\\pm5\\pi/3$ and $\\pm7\\pi/3$, weight $\\pi$ at $\\pm7\\pi/4$ and $\\pm9\\pi/4$.'],
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
{t:'h3', text:'Where the rows come from'},
{t:'p', text:'Each row is proved the same way: write the analysis sum for the new sequence, substitute, and rearrange until the sum for $x$ appears. The time shift needs a change of index. Put $m=n-n_0$, so $n=m+n_0$; as $n$ runs over all integers, so does $m$:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n=-\\infty}^{\\infty}x[n-n_0]e^{-j\\omega n}&=\\sum_{m=-\\infty}^{\\infty}x[m]e^{-j\\omega(m+n_0)}\\\\&=e^{-j\\omega n_0}\\sum_{m=-\\infty}^{\\infty}x[m]e^{-j\\omega m}=e^{-j\\omega n_0}X(e^{j\\omega}).\\end{aligned}'},
{t:'p', text:'The factor $e^{-j\\omega n_0}$ does not depend on $m$, so it moves outside the sum. The frequency shift needs no change of index; the two exponentials combine:'},
{t:'eq', tex:'\\sum_{n}e^{j\\omega_0n}x[n]e^{-j\\omega n}=\\sum_{n}x[n]e^{-j(\\omega-\\omega_0)n}=X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr).'},
{t:'p', text:'Conjugation uses $(ab)^{*}=a^{*}b^{*}$ and $(e^{-j\\omega n})^{*}=e^{j\\omega n}$. Time reversal puts $m=-n$, which again runs over all integers:'},
{t:'eq', tex:'\\sum_{n}x^{*}[n]e^{-j\\omega n}=\\Bigl(\\sum_{n}x[n]e^{j\\omega n}\\Bigr)^{*}=X^{*}(e^{-j\\omega}),\\qquad \\sum_{n}x[-n]e^{-j\\omega n}=\\sum_{m}x[m]e^{-j(-\\omega)m}=X(e^{-j\\omega}).'},
{t:'p', text:'Differencing is linearity plus the time shift with $n_0=1$: $x[n]-x[n-1]$ transforms to $X(e^{j\\omega})-e^{-j\\omega}X(e^{j\\omega})=(1-e^{-j\\omega})X(e^{j\\omega})$. Differentiation in frequency differentiates the analysis sum term by term. Each term gives $\\frac{\\d}{\\d\\omega}e^{-j\\omega n}=-jn\\,e^{-j\\omega n}$, so'},
{t:'eq', tex:'\\frac{\\d X(e^{j\\omega})}{\\d\\omega}=\\sum_{n}x[n](-jn)e^{-j\\omega n}=-j\\sum_{n}n\\,x[n]e^{-j\\omega n}\\qquad\\Longrightarrow\\qquad \\sum_{n}n\\,x[n]e^{-j\\omega n}=j\\,\\frac{\\d X(e^{j\\omega})}{\\d\\omega},'},
{t:'p', text:'where the last step multiplies both sides by $j$ and uses $j\\cdot(-j)=1$. The convolution and multiplication rows are proved in Section 6.7, Parseval at the end of this section, and time expansion just below. Accumulation is the convolution of $x$ with the unit step $u[n]$, so its row is the convolution row with the transform of $u[n]$ as the second factor; that transform is the stated pair $1/(1-e^{-j\\omega})+\\pi\\sum_k\\delta(\\omega-2\\pi k)$.'},
{t:'p', text:'For a real sequence, $x^{*}[n]=x[n]$, so the conjugation row gives $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$. Taking real parts, moduli, imaginary parts and angles of both sides: the real part and the magnitude are even in $\\omega$ and the imaginary part and the phase are odd. Half a period then determines the whole spectrum, for a real sequence only. A complex sequence needs the full period drawn.'},
{t:'p', text:'That one line also fixes the last three rows of the table. The even part is $\\Ev\\{x[n]\\}=\\tfrac12(x[n]+x[-n])$. By linearity and the time-reversal row it transforms to $\\tfrac12[X(e^{j\\omega})+X(e^{-j\\omega})]$, and for a real sequence $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$, so this is $\\tfrac12[X+X^{*}]=\\operatorname{Re}\\{X\\}$. The odd part $\\tfrac12(x[n]-x[-n])$ transforms in the same way to $\\tfrac12[X-X^{*}]=j\\operatorname{Im}\\{X\\}$. A real and even sequence has no odd part, so its transform is real, and it is even by the symmetry above. A real and odd sequence has no even part, so its transform is purely imaginary and odd.'},
{t:'p', text:'A worked check. Take $x[n]=a^{n}u[n]$ with $0<a<1$. For $n>0$, $x[-n]=0$, so the even part is $\\tfrac12a^{n}$; for $n<0$ it is $\\tfrac12a^{-n}$; at $n=0$ both $x[0]$ and $x[-0]$ equal 1, so the even part is 1. In one formula, $\\Ev\\{x[n]\\}=\\tfrac12a^{|n|}+\\tfrac12\\delta[n]$, where the $\\delta$ term supplies the missing $\\tfrac12$ at the origin. Transform term by term with Example 6.3 and the unit-sample pair, then put the two terms over the common denominator:'},
{t:'eq', tex:'\\begin{aligned}\\tfrac12\\cdot\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}+\\tfrac12&=\\frac{(1-a^{2})+(1-2a\\cos\\omega+a^{2})}{2\\,(1-2a\\cos\\omega+a^{2})}\\\\&=\\frac{2-2a\\cos\\omega}{2\\,(1-2a\\cos\\omega+a^{2})}=\\frac{1-a\\cos\\omega}{1-2a\\cos\\omega+a^{2}}.\\end{aligned}'},
{t:'p', text:'This is $\\operatorname{Re}\\{1/(1-ae^{-j\\omega})\\}$ exactly: in Example 6.2 the denominator is $(1-a\\cos\\omega)+ja\\sin\\omega$, and multiplying numerator and denominator by its conjugate gives a real part $(1-a\\cos\\omega)/(1-2a\\cos\\omega+a^{2})$.'},
{t:'p', text:'<b>Accumulation</b> undoes differencing, so their factors are reciprocals, and the impulse train is the part differencing destroys. A running sum is fixed only up to a constant offset, and the difference cannot see that offset; the weight $\\pi X(e^{j0})=\\pi\\sum_n x[n]$ is what puts it back. Where the sequence sums to zero the term vanishes on its own. It is the discrete-time counterpart of the $\\pi X(0)\\delta(\\omega)$ in the integration property of Chapter 5, and it fails in the same place for the same reason: $1-e^{-j\\omega}$ is zero at $\\omega=0$.'},

{t:'h3', text:'Time expansion'},
{t:'p', text:'For a positive integer $k$, $x_{(k)}[n]$ is $x[n/k]$ when $n$ is a multiple of $k$ and zero otherwise: a stretch with zeros inserted, since discrete time has no operation that stretches a sequence without leaving gaps. In the analysis sum, only the indices $n=rk$ with integer $r$ contribute, because every other term is zero. Put $n=rk$; as $n$ runs over the multiples of $k$, $r$ runs over all integers:'},
{t:'eq', tex:'\\sum_{n=-\\infty}^{\\infty}x_{(k)}[n]e^{-j\\omega n}=\\sum_{r=-\\infty}^{\\infty}x_{(k)}[rk]\\,e^{-j\\omega rk}=\\sum_{r=-\\infty}^{\\infty}x[r]\\,e^{-j(k\\omega)r}=X(e^{jk\\omega}).'},
{t:'p', text:'The middle step uses $x_{(k)}[rk]=x[rk/k]=x[r]$. The last sum is the analysis sum of $x$ with $\\omega$ replaced by $k\\omega$. Replacing $\\omega$ by $k\\omega$ compresses the frequency axis by $k$, so one period of length $2\\pi$ now holds $k$ copies of the old picture.'},
{t:'ex', hd:'Example 6.8 — expansion of a five-point pulse', rows:[
 ['Given','$g[n]=1$ on $|n|\\le2$, and $x[n]=y_{(2)}[n]+2y_{(2)}[n-1]$ where $y[n]=g[n-2]$.'],
 ['Find','$X(e^{j\\omega})$ and its peak value.'],
 ['Method','Build the sequence in three steps, shift, expansion and a shifted sum, and apply the matching property at each step. Each step multiplies or rescales a known transform, so no new sum is needed.'],
 ['Solution','The pulse is Example 6.4 with $N_1=2$, so $G(e^{j\\omega})=\\sin(5\\omega/2)/\\sin(\\omega/2)$. The shift by $n_0=2$ gives $$Y(e^{j\\omega})=e^{-j2\\omega}G(e^{j\\omega})=e^{-j2\\omega}\\,\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}.$$ Expansion by $k=2$ replaces $\\omega$ by $2\\omega$ everywhere: $$Y_{(2)}(e^{j\\omega})=Y(e^{j2\\omega})=e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin(\\omega)}.$$ Finally, by linearity and the shift by 1, $$X(e^{j\\omega})=Y_{(2)}(e^{j\\omega})+2e^{-j\\omega}Y_{(2)}(e^{j\\omega})=\\bigl(1+2e^{-j\\omega}\\bigr)e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin(\\omega)}.$$ At $\\omega=0$ the first factor is $1+2=3$ and the kernel is its peak value 5, the number of ones in the pulse, so the peak of $X$ is $3\\times5=15$.'],
 ['Check','$x[n]$ is $y_{(2)}[n]$ plus twice a copy shifted by one. The expanded sequence has five ones at even indices, the shifted copy has five twos at odd indices, so $\\sum_n x[n]=5+10=15=X(e^{j0})$.'],
 ['Where the argument halved','$G$ carries $\\sin(5\\omega/2)/\\sin(\\omega/2)$ and $Y_{(2)}$ carries $\\sin(5\\omega)/\\sin(\\omega)$: the same expression with $\\omega$ replaced by $2\\omega$. Halving only the numerator argument, $\\sin(5\\omega/2)/\\sin(\\omega)$, is wrong for both sequences, and it puts a pole at $\\omega=\\pi$ where the original has none: it gives $1000.0$ at $\\omega=\\pi-10^{-3}$, against the true $G(e^{j\\pi})=\\sin(5\\pi/2)/\\sin(\\pi/2)=1$, and $-0.7071$ at $\\pi/2$ against the true $G(e^{j\\pi/2})=\\sin(5\\pi/4)/\\sin(\\pi/4)=-1.0000$.']
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
{t:'p', text:'Start from the energy sum, write $|x[n]|^{2}=x[n]x^{*}[n]$, and replace $x^{*}[n]$ by the conjugate of its synthesis integral. Then swap the sum and the integral and collect the sum over $n$:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n}|x[n]|^{2}&=\\sum_{n}x[n]\\,x^{*}[n]=\\sum_{n}x[n]\\left[\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega\\right]^{*}\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})\\Bigl[\\sum_{n}x[n]e^{-j\\omega n}\\Bigr]\\d\\omega=\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})X(e^{j\\omega})\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'Conjugating the integral conjugates $X$ and turns $e^{j\\omega n}$ into $e^{-j\\omega n}$; the bracket in the second line is then the analysis sum, which is $X(e^{j\\omega})$. The quantity $|X(e^{j\\omega})|^{2}$ is the energy-density spectrum. Integrating it over one period and dividing by $2\\pi$ gives the total energy. Integrating over part of a period gives the energy in that frequency band. Both the single-period range and the factor $\\frac{1}{2\\pi}$ are required, although neither is visible from the plot shape.'},
{t:'p', text:'Two checks. For $a^{n}u[n]$ with $a=\\tfrac12$, the time side is a geometric series with first term 1 and ratio $\\tfrac14$: $\\sum_{n\\ge0}(\\tfrac14)^{n}=1/(1-\\tfrac14)=\\tfrac43$. On the frequency side, $|X|^{2}=1/(1-2a\\cos\\omega+a^{2})$ from Example 6.2, and Example 6.3 shows that $(1-a^{2})/(1-2a\\cos\\omega+a^{2})$ is the transform of $a^{|n|}$. So $|X|^{2}$ is that transform divided by $1-a^{2}$, and its synthesis integral at $n=0$ returns $a^{|0|}=1$: $$\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega=\\frac{1}{1-a^{2}}\\cdot\\frac{1}{2\\pi}\\int_{2\\pi}\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}\\,\\d\\omega=\\frac{1}{1-a^{2}}\\cdot1=\\frac{1}{1-\\tfrac14}=\\tfrac43.$$ For the rectangular pulse with $N_1=2$, the time side is five samples of $|1|^{2}$, so 5. The kernel $X$ is real, so $|X|^{2}=X\\cdot X$, which by the convolution property is the transform of $x[n]*x[n]$; its synthesis integral at $n=0$ is $(x*x)[0]=\\sum_m x[m]x[-m]=5$, the same number.'},

{t:'h2', num:'6.7', text:'Convolution and multiplication'},
{t:'eqbox', cap:'Convolution',
 tex:['y[n]=x[n]*h[n]\\;\\longleftrightarrow\\;Y(e^{j\\omega})=X(e^{j\\omega})H(e^{j\\omega})'],
 after:'Both pairs $x\\leftrightarrow X$ and $h\\leftrightarrow H$ are declared before the conclusion is written, and $y$ names the output and nothing else. A product of complex numbers gives two separate statements, $|Y|=|X|\\cdot|H|$ and $\\angle Y=\\angle X+\\angle H$. Putting modulus bars around a whole equation is not an operation on anything.'},
{t:'p', text:'To prove it, put the convolution sum $y[n]=\\sum_k x[k]h[n-k]$ into the analysis sum, swap the order of the two sums, and change the index of the inner sum with $m=n-k$. For fixed $k$, as $n$ runs over all integers so does $m$:'},
{t:'eq', tex:'\\begin{aligned}Y(e^{j\\omega})&=\\sum_{n}\\Bigl[\\sum_{k}x[k]h[n-k]\\Bigr]e^{-j\\omega n}=\\sum_{k}x[k]\\sum_{n}h[n-k]e^{-j\\omega n}\\\\&=\\sum_{k}x[k]\\sum_{m}h[m]e^{-j\\omega(m+k)}=\\Bigl[\\sum_{k}x[k]e^{-j\\omega k}\\Bigr]\\Bigl[\\sum_{m}h[m]e^{-j\\omega m}\\Bigr]=X(e^{j\\omega})H(e^{j\\omega}).\\end{aligned}'},
{t:'p', text:'In the second line $e^{-j\\omega(m+k)}=e^{-j\\omega k}e^{-j\\omega m}$, and the factor $e^{-j\\omega k}$ does not depend on $m$, so it joins the outer sum. Swapping the sums is allowed when both sequences are absolutely summable.'},
{t:'ex', hd:'Example 6.9 — convolving two exponentials', rows:[
 ['Given','$x[n]=a^{n}u[n]$ and $h[n]=b^{n}u[n]$, with $|a|<1$, $|b|<1$ and $a\\neq b$. Every one-sided exponential carries its $u[n]$: without it the sequence is defined for negative $n$ too, where it grows without bound.'],
 ['Method','Use the convolution property because the required output is a time convolution. Multiply the transforms, then use partial fractions so each term matches the known one-sided exponential pair. Write $z=e^{-j\\omega}$ as an algebraic variable; then $Y=1/((1-az)(1-bz))$ is a rational function of $z$, and substituting $z=1/a$ is algebra in $z$, not a claim that $e^{-j\\omega}$ takes that value.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Solution','By Example 6.2, $X=1/(1-az)$ and $H=1/(1-bz)$ with $z=e^{-j\\omega}$, so the convolution property gives $$Y=X\\,H=\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz}.$$ Cover-up: to find $A$, cover the factor $(1-az)$ and evaluate the rest at $z=1/a$, the value that makes that factor zero. To find $B$, cover $(1-bz)$ and evaluate at $z=1/b$: $$\\begin{gathered}A=\\frac{1}{1-bz}\\bigg|_{z=1/a}=\\frac{1}{1-b/a}=\\frac{a}{a-b},\\\\[3pt]B=\\frac{1}{1-az}\\bigg|_{z=1/b}=\\frac{1}{1-a/b}=\\frac{b}{b-a}=-\\frac{b}{a-b}.\\end{gathered}$$ Check by recombining: $A(1-bz)+B(1-az)=\\frac{a-abz-b+abz}{a-b}=1$, as required. Each fraction is the one-sided exponential pair, so inverting term by term: $$y[n]=A\\,a^{n}u[n]+B\\,b^{n}u[n]=\\frac{a\\cdot a^{n}-b\\cdot b^{n}}{a-b}\\,u[n]=\\frac{1}{a-b}\\left[a^{\\,n+1}-b^{\\,n+1}\\right]u[n].$$'],
 ['Condition','Both coefficients divide by $a-b$, so the route requires $a\\neq b$. At $a=b$ the two poles merge and the answer takes a different form, worked out in Section 6.8.'],
 ['Check','$a=\\tfrac12$, $b=\\tfrac14$: $a-b=\\tfrac14$, so $y[n]=4\\bigl[(\\tfrac12)^{n+1}-(\\tfrac14)^{n+1}\\bigr]u[n]$, giving $y[0]=4(\\tfrac12-\\tfrac14)=1$, $y[1]=4(\\tfrac14-\\tfrac1{16})=0.75$, $y[2]=4(\\tfrac18-\\tfrac1{64})=0.4375$, $y[3]=4(\\tfrac1{16}-\\tfrac1{256})=0.234375$. Direct convolution gives $y[0]=x[0]h[0]=1$ and $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac14+\\tfrac12=0.75$; the first value must be $x[0]h[0]$ for any two causal sequences. The magnitude $|Y|=|X|\\,|H|$ is largest at $\\omega=0$, $\\frac{1}{(1-\\frac12)(1-\\frac14)}=2.6667$, and smallest at $\\omega=\\pi$, $\\frac{1}{(1+\\frac12)(1+\\frac14)}=0.5333$.']
]},
{t:'p', text:'The product of two ideal low-pass responses is the narrower of the two, so a cascade keeps only the band both filters pass. With cutoffs $\\pi/2$ and $\\pi/4$, the cascade has cutoff $\\pi/4$ and impulse response $\\sin(\\pi n/4)/(\\pi n)$. In writing such a spectrum, close one branch and leave the other open — 1 for $|\\omega|\\le\\pi/4$ and 0 for $\\pi/4<|\\omega|\\le\\pi$ — since for an ideal filter the band edge is precisely where a convention is needed rather than assumed.'},
{t:'ex', hd:'Example 6.10 — a stepped spectrum through a filter', rows:[
 ['Given','$X(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$ and 1 for $\\pi/4<|\\omega|\\le3\\pi/4$, zero to $\\pi$; $H$ is ideal low-pass with cutoff $\\pi/2$.'],
 ['Find','$Y(e^{j\\omega})$ and $y[n]$.'],
 ['Method','An LTI system gives $Y=XH$. Multiply the two spectra frequency by frequency, then write the result as a sum of ideal low-pass bands so that Example 6.5 inverts each one.'],
 ['Solution','$H$ is 1 for $|\\omega|\\le\\pi/2$ and 0 for $\\pi/2<|\\omega|\\le\\pi$. Multiplying band by band: for $|\\omega|\\le\\pi/4$, $Y=2\\cdot1=2$; for $\\pi/4<|\\omega|\\le\\pi/2$, $Y=1\\cdot1=1$; for $\\pi/2<|\\omega|\\le\\pi$, $Y=X\\cdot0=0$. Now write $Y$ as two stacked ideal bands, $Y=Y_1+Y_2$, with $Y_1=1$ on $|\\omega|\\le\\pi/2$ and $Y_2=1$ on $|\\omega|\\le\\pi/4$; the two add to 2 on the inner band and to 1 on the outer band, as required. By linearity and Example 6.5 with $W=\\pi/2$ and $W=\\pi/4$: $$\\begin{gathered}\\begin{aligned}y[n]&=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}e^{j\\omega n}\\d\\omega+\\frac{1}{2\\pi}\\int_{-\\pi/4}^{\\pi/4}e^{j\\omega n}\\d\\omega\\\\&=\\frac{\\sin(\\pi n/2)}{\\pi n}+\\frac{\\sin(\\pi n/4)}{\\pi n},\\end{aligned}\\\\[3pt]y[0]=\\frac{\\pi/2}{\\pi}+\\frac{\\pi/4}{\\pi}=\\tfrac12+\\tfrac14=\\tfrac34.\\end{gathered}$$'],
 ['Check','$y[0]$ must be the area of one period of $Y$ divided by $2\\pi$. That area is $2\\cdot\\frac{\\pi}{2}+1\\cdot\\frac{\\pi}{2}=\\frac{3\\pi}{2}$ (height 2 over a band of width $\\pi/2$, height 1 over two bands of width $\\pi/4$), and $\\frac{3\\pi}{2}/2\\pi=\\frac34$. A sketch of a spectrum is not a solution; the closed form costs one line once the stack is seen.']
]},

{t:'h3', text:'Multiplication is a periodic convolution'},
{t:'eqbox', cap:'Multiplication',
 tex:['z[n]=x[n]y[n]\\;\\longleftrightarrow\\;Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta'],
 after:'The integral runs over one period and both factors are $2\\pi$-periodic. That operation is a periodic convolution, and it differs from the ordinary convolution of two functions on the line whenever the result is wider than one period.'},
{t:'p', text:'To prove it, put the product into the analysis sum and replace $x[n]$ by its synthesis integral, with $\\theta$ as the integration variable so that it is not confused with $\\omega$. Then swap the sum and the integral and combine the exponentials:'},
{t:'eq', tex:'\\begin{aligned}Z(e^{j\\omega})&=\\sum_{n}x[n]y[n]e^{-j\\omega n}=\\sum_{n}\\left[\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})e^{j\\theta n}\\,\\d\\theta\\right]y[n]e^{-j\\omega n}\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\Bigl[\\sum_{n}y[n]e^{-j(\\omega-\\theta)n}\\Bigr]\\d\\theta=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta.\\end{aligned}'},
{t:'p', text:'The bracket is the analysis sum of $y$ evaluated at frequency $\\omega-\\theta$, because $e^{j\\theta n}e^{-j\\omega n}=e^{-j(\\omega-\\theta)n}$.'},
{t:'p', text:'Take $X=1$ on $|\\omega|\\le3\\pi/4$ and $Y=1$ on $|\\omega|\\le\\pi/2$, both repeated every $2\\pi$. First convolve the two rectangles as functions on the line. The integrand $X(\\theta)Y(\\omega-\\theta)$ is 1 where both factors are 1 and 0 elsewhere, so the integral is the length of the overlap of the interval $|\\theta|\\le3\\pi/4$ with the interval $|\\omega-\\theta|\\le\\pi/2$, that is $\\omega-\\pi/2\\le\\theta\\le\\omega+\\pi/2$. For $|\\omega|\\le\\pi/4$ the second interval lies inside the first, so the overlap is its full width $\\pi$ and the value is $\\frac{1}{2\\pi}\\cdot\\pi=\\frac12$. For $\\pi/4\\le|\\omega|\\le5\\pi/4$ the overlap runs from $|\\omega|-\\pi/2$ to $3\\pi/4$, of length $5\\pi/4-|\\omega|$, so the value is $(5\\pi/4-|\\omega|)/(2\\pi)$, falling to zero at $|\\omega|=5\\pi/4$. The result is a trapezoid of height $\\frac12$, flat on $|\\omega|\\le\\pi/4$ and reaching zero at $|\\omega|=5\\pi/4$. Since $5\\pi/4>\\pi$, the result extends beyond one period. A periodic copy therefore overlaps it near $\\omega=\\pm\\pi$, and the two values add.'},
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
{t:'p', text:'The values are $Z(e^{j0})=Z(e^{j\\pi/4})=0.5$ on the flat top and $Z(e^{j3\\pi/4})=(5\\pi/4-3\\pi/4)/(2\\pi)=(\\pi/2)/(2\\pi)=0.25$ on the slope. At $\\omega=\\pi$ the trapezoid itself gives $(5\\pi/4-\\pi)/(2\\pi)=(\\pi/4)/(2\\pi)=\\tfrac18$, and the copy centred at $2\\pi$ is at the same distance from its own centre, so it also gives $\\tfrac18$: $Z(e^{j\\pi})=\\tfrac18+\\tfrac18=0.25$. The check is the synthesis equation at $n=0$: $\\frac{1}{2\\pi}\\int_{2\\pi}Z\\,\\d\\omega$ must equal $z[0]=x[0]y[0]$. By Example 6.5, $x[0]=\\frac{3\\pi/4}{\\pi}=\\tfrac34$ and $y[0]=\\frac{\\pi/2}{\\pi}=\\tfrac12$, so $z[0]=\\tfrac38=0.375$. On the frequency side, one period of $Z$ collects the whole area of one trapezoid, because the parts that spill past $\\pm\\pi$ are exactly the parts that the copies bring in. That area is the height $\\tfrac12$ times the mean of the top width $\\pi/2$ and the base width $5\\pi/2$: $\\tfrac12\\cdot\\tfrac{3\\pi}{2}=\\tfrac{3\\pi}{4}$, and $\\frac{3\\pi/4}{2\\pi}=\\tfrac38$, as required.'},
{t:'ex', hd:'Example 6.11 — multiplying by a cosine', rows:[
 ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/4$, repeated every $2\\pi$, and $y[n]=\\cos(\\omega_0n)$ with $\\omega_0=\\pi/3$.'],
 ['Method','Write $Y$ as its impulse train, $\\pi\\sum_l[\\delta(\\omega-\\omega_0-2\\pi l)+\\delta(\\omega+\\omega_0-2\\pi l)]$. The periodic convolution integrates over a single period, so choosing $-\\pi<\\theta\\le\\pi$ leaves exactly two impulses, at $\\theta=\\pm\\pi/3$, and only those contribute. Taking the whole train into an ordinary convolution would count every copy and diverge.'],
 ['Find','$Z(e^{j\\omega})$ for $z[n]=x[n]y[n]$, and the band edges.'],
 ['Solution','Periodic convolution is commutative, so put the impulse train in the second factor of the multiplication property and integrate over $-\\pi<\\theta\\le\\pi$, where only the $l=0$ impulses at $\\theta=\\pm\\omega_0$ lie. The sifting property evaluates $X$ at those two points: $$\\begin{aligned}Z(e^{j\\omega})&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}Y(e^{j\\theta})\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta\\\\&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\pi\\bigl[\\delta(\\theta-\\omega_0)+\\delta(\\theta+\\omega_0)\\bigr]X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta\\\\&=\\frac{\\pi}{2\\pi}\\Bigl[X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)\\Bigr]\\\\&=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr).\\end{aligned}$$ The height $\\tfrac12$ comes from $\\frac{1}{2\\pi}\\cdot\\pi$.'],
 ['Band edges','The band moves to $\\omega_0\\mp\\pi/4$, so with $\\omega_0=\\pi/3$ the edges are $\\pi/12$ and $7\\pi/12$, and the mirror image occupies $-7\\pi/12\\le\\omega\\le-\\pi/12$. Both numbers are computed from $\\omega_0$ and the bandwidth, so they cannot drift apart from the drawn figure; with $\\omega_0$ below $\\pi/4$ the two bands would overlap through the origin instead.']
]},
{t:'box', kind:'warn', hd:'This overlap is not aliasing',
 html:'This overlap occurs between periodic copies during frequency-domain convolution. Chapter 7 studies a different overlap between replicas produced by sampling. Only the sampling overlap is called aliasing.'},

{t:'h2', num:'6.8', text:'Difference equations'},
{t:'p', text:'Transform both sides of a linear constant-coefficient difference equation. Linearity acts term by term, and the time-shift property turns each $y[n-k]$ into $e^{-j\\omega k}Y(e^{j\\omega})$ and each $x[n-k]$ into $e^{-j\\omega k}X(e^{j\\omega})$. The transforms $Y$ and $X$ do not depend on $k$, so they come out of the sums:'},
{t:'eqbox', cap:'Frequency response of a difference equation',
 tex:['\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]',
      '\\sum_{k=0}^{N}a_k e^{-j\\omega k}\\,Y(e^{j\\omega})=\\sum_{k=0}^{M}b_k e^{-j\\omega k}\\,X(e^{j\\omega})\\quad\\Longrightarrow\\quad Y(e^{j\\omega})\\sum_{k=0}^{N}a_k e^{-j\\omega k}=X(e^{j\\omega})\\sum_{k=0}^{M}b_k e^{-j\\omega k}',
      'H(e^{j\\omega})=\\frac{Y(e^{j\\omega})}{X(e^{j\\omega})}=\\frac{\\sum_{k=0}^{M}b_k e^{-j\\omega k}}{\\sum_{k=0}^{N}a_k e^{-j\\omega k}}'],
 after:'The last line divides both sides by $X(e^{j\\omega})$ and by the denominator sum. The impulse response of the recursion is now available without running the recursion: factor the denominator, split into partial fractions, and invert each piece with the exponential pair. Every step is algebra.'},
{t:'ex', hd:'Example 6.12 — a second-order system', rows:[
 ['Given','$y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$.'],
 ['Find','The frequency response and the impulse response.'],
 ['Method','The equation has constant coefficients, so the time-shift property turns it into algebra. Read the coefficients into the frequency-response ratio, factor the denominator, expand into partial fractions, and invert each term with the one-sided exponential pair.'],
 ['Solution','Here $a_0=1$, $a_1=-\\tfrac34$, $a_2=\\tfrac18$ and $b_0=2$. Transforming term by term: $$Y-\\tfrac34e^{-j\\omega}Y+\\tfrac18e^{-j2\\omega}Y=2X\\quad\\Longrightarrow\\quad H(e^{j\\omega})=\\frac{Y}{X}=\\frac{2}{1-\\tfrac34e^{-j\\omega}+\\tfrac18e^{-j2\\omega}}.$$ Write $z=e^{-j\\omega}$ as an algebraic variable and factor the quadratic $1-\\tfrac34z+\\tfrac18z^{2}$. Two factors $(1-\\alpha z)(1-\\beta z)$ expand to $1-(\\alpha+\\beta)z+\\alpha\\beta z^{2}$, so we need $\\alpha+\\beta=\\tfrac34$ and $\\alpha\\beta=\\tfrac18$; $\\alpha=\\tfrac12$ and $\\beta=\\tfrac14$ satisfy both, since $\\tfrac12+\\tfrac14=\\tfrac34$ and $\\tfrac12\\cdot\\tfrac14=\\tfrac18$. Hence $$H=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}=\\frac{A}{1-\\tfrac12z}+\\frac{B}{1-\\tfrac14z}.$$ Cover-up: cover $(1-\\tfrac12z)$ and set $z=2$, then cover $(1-\\tfrac14z)$ and set $z=4$: $$A=\\frac{2}{1-\\tfrac14z}\\bigg|_{z=2}=\\frac{2}{1-\\tfrac12}=4,\\qquad B=\\frac{2}{1-\\tfrac12z}\\bigg|_{z=4}=\\frac{2}{1-2}=-2.$$ Recombining, $4(1-\\tfrac14z)-2(1-\\tfrac12z)=4-z-2+z=2$, which matches the numerator. Each fraction is the pair $a^{n}u[n]\\leftrightarrow1/(1-ae^{-j\\omega})$, so $$h[n]=4\\left(\\tfrac12\\right)^{n}u[n]-2\\left(\\tfrac14\\right)^{n}u[n].$$'],
 ['Check','$h[0]=4-2=2$, $h[1]=4\\cdot\\tfrac12-2\\cdot\\tfrac14=2-0.5=1.5$, $h[2]=4\\cdot\\tfrac14-2\\cdot\\tfrac1{16}=1-0.125=0.875$. Substituting into the equation with $x=\\delta$, which is zero for $n\\ge1$: $h[1]-\\tfrac34h[0]=1.5-1.5=0$ and $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0.875-1.125+0.25=0$, as required. Both poles have modulus below 1, so the system is stable. At $\\omega=0$, $z=1$ and $|H|=2/(1-\\tfrac34+\\tfrac18)=2/\\tfrac38=5.3333$; at $\\omega=\\pi$, $z=-1$ and $|H|=2/(1+\\tfrac34+\\tfrac18)=2/\\tfrac{15}{8}=1.0667$. This recursion is a low-pass filter.']
]},

{t:'h3', text:'The repeated-pole pair'},
{t:'p', text:'Example 6.9 excluded $a=b$ because its partial fractions divide by $a-b$. When $a=b$, the poles coincide and require a separate pair. Derive it from the geometric pair of Example 6.2, $\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=1/(1-ae^{-j\\omega})$, by differentiating both sides with respect to $a$ while holding $\\omega$ fixed. On the left, differentiate term by term: $\\frac{\\d}{\\d a}a^{n}=na^{n-1}$, and the $n=0$ term is the constant 1, whose derivative is 0, so the sum starts at $n=1$. On the right, use the chain rule on $(1-ae^{-j\\omega})^{-1}$:'},
{t:'eq', tex:'\\sum_{n=1}^{\\infty}n\\,a^{\\,n-1}e^{-j\\omega n}=\\frac{\\d}{\\d a}\\bigl(1-ae^{-j\\omega}\\bigr)^{-1}=-\\bigl(1-ae^{-j\\omega}\\bigr)^{-2}\\cdot(-e^{-j\\omega})=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.'},
{t:'p', text:'Now put $m=n-1$ on the left, so $n=m+1$ and $m$ runs from 0 to $\\infty$. The exponential splits as $e^{-j\\omega(m+1)}=e^{-j\\omega}e^{-j\\omega m}$, and the factor $e^{-j\\omega}$ leaves the sum and cancels the same factor on the right:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega(m+1)}&=e^{-j\\omega}\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega m}=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}\\\\\\Longrightarrow\\qquad\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega m}&=\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.\\end{aligned}'},
{t:'eqbox', cap:'Repeated pole',
 tex:['(n+1)a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\qquad |a|<1'],
 after:'The left-hand sum is the analysis sum of $(n+1)a^{n}u[n]$, with $m$ renamed $n$. Differentiating a convergent geometric series term by term is allowed for $|a|<1$, which is why the condition is kept. The exponent 2 comes from the differentiation and the minus sign is inherited unchanged, so neither has to be remembered. One number settles any doubt: at $\\omega=0$ with $a=\\tfrac14$ the value is $(1-\\tfrac14)^{-2}=\\tfrac{16}{9}=1.7778$, while a plus sign would give $(\\tfrac54)^{-2}=0.6400$.'},
{t:'ex', hd:'Example 6.13 — the output of that system', rows:[
 ['Given','The system of Example 6.12 driven by $x[n]=\\left(\\tfrac14\\right)^{n}u[n]$.'],
 ['Find','$y[n]$.'],
 ['Method','Use $Y=XH$ and partial fractions, because the output transform is rational and each fraction can be inverted with a known pair. The input pole coincides with one system pole, so the expansion must include both a simple and a squared term for that pole.'],
 ['Solution','With $z=e^{-j\\omega}$, the input transform is $X=1/(1-\\tfrac14z)$ by Example 6.2, and $H$ is the factored form of Example 6.12. Multiply: $$\\begin{aligned}Y=X\\,H&=\\frac{1}{1-\\tfrac14z}\\cdot\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)^{2}}\\\\&=\\frac{A}{1-\\tfrac14z}+\\frac{B}{\\bigl(1-\\tfrac14z\\bigr)^{2}}+\\frac{C}{1-\\tfrac12z}.\\end{aligned}$$ Coefficients. Cover-up reaches the simple pole and the highest power of the repeated pole. Cover $(1-\\tfrac12z)$ and set $z=2$: $$C=\\frac{2}{\\bigl(1-\\tfrac14z\\bigr)^{2}}\\bigg|_{z=2}=\\frac{2}{(1-\\tfrac12)^{2}}=\\frac{2}{\\tfrac14}=8.$$ Cover $(1-\\tfrac14z)^{2}$ and set $z=4$: $$B=\\frac{2}{1-\\tfrac12z}\\bigg|_{z=4}=\\frac{2}{1-2}=-2.$$ Cover-up cannot reach $A$, so use one more value of $z$. Multiply the identity through by the full denominator and set $z=0$; every factor becomes 1, so $2=A+B+C=A-2+8$ and $A=-4$. Recombine as a check: $-4(1-\\tfrac14z)(1-\\tfrac12z)-2(1-\\tfrac12z)+8(1-\\tfrac14z)^{2}$ expands to $(-4+3z-\\tfrac12z^{2})+(-2+z)+(8-4z+\\tfrac12z^{2})=2$, the numerator. Invert term by term. The first and third fractions are the one-sided exponential pair; the middle one is the repeated-pole pair with $a=\\tfrac14$: $$y[n]=-4\\left(\\tfrac14\\right)^{n}u[n]-2(n+1)\\left(\\tfrac14\\right)^{n}u[n]+8\\left(\\tfrac12\\right)^{n}u[n].$$'],
 ['Check','$y[0]=-4-2+8=2$, $y[1]=-4\\cdot\\tfrac14-2\\cdot2\\cdot\\tfrac14+8\\cdot\\tfrac12=-1-1+4=2$, $y[2]=-\\tfrac4{16}-\\tfrac{6}{16}+2=1.375$, $y[3]=-\\tfrac4{64}-\\tfrac8{64}+1=0.8125$. The first value must equal $h[0]x[0]=2\\cdot1=2$ for two causal sequences, and it does. Direct convolution, $y[1]=h[0]x[1]+h[1]x[0]=2\\cdot\\tfrac14+1.5\\cdot1=2$, reproduces the second value as well. Without the repeated-pole pair the middle term could not be inverted at all.']
]},

{t:'h2', num:'6.9', text:'Duality'},
{t:'p', text:'There is no duality inside the discrete-time transform pair. The analysis equation is a sum over an integer and the synthesis equation an integral over a continuous variable, so no relabelling turns one into the other. Two dualities do hold.'},
{t:'ol', items:[
 'In the discrete-time Fourier series, where both domains are discrete and both objects are periodic with the same period $N$: if $x[n]\\leftrightarrow a_k$, then reading the coefficients as a sequence gives $a[n]\\leftrightarrow\\frac1N x[-k]$. The impulse train with $N=21$ is the example: its coefficients are all $1/21=0.0476$, and reading those constants back as a sequence returns an impulse train.',
 'Between the discrete-time transform and the continuous-time series. $X(e^{j\\omega})$ is a $2\\pi$-periodic function of a continuous variable, so it has a continuous-time Fourier series, and comparing the two synthesis equations identifies its coefficients as $x[-k]$: the spectrum of a sequence is a periodic signal whose series coefficients are the sequence itself, reversed.'
]},
{t:'p', text:'A worked check on the second. Take the $2\\pi$-periodic square wave in $\\omega$, equal to 1 for $|\\omega|\\le\\pi/2$ and zero over the rest of the period. Treat $\\omega$ as the time variable of a continuous-time periodic signal with period $2\\pi$, so its fundamental frequency is 1 and its series coefficients are given by the analysis integral over one period. The function is zero outside $|\\omega|\\le\\pi/2$, so the limits shrink, and for $k\\neq0$ the antiderivative of $e^{-jk\\omega}$ is $e^{-jk\\omega}/(-jk)$:'},
{t:'eq', tex:'\\begin{aligned}a_k&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{-jk\\omega}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}e^{-jk\\omega}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\left[\\frac{e^{-jk\\omega}}{-jk}\\right]_{-\\pi/2}^{\\pi/2}=\\frac{1}{2\\pi}\\cdot\\frac{e^{jk\\pi/2}-e^{-jk\\pi/2}}{jk}=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(k\\pi/2)}{jk}=\\frac{\\sin(k\\pi/2)}{k\\pi}.\\end{aligned}'},
{t:'p', text:'The third equality reverses the order of the two limit terms to absorb the minus sign, and the fourth uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. At $k=0$ the integrand is 1, so $a_0=\\frac{1}{2\\pi}\\cdot\\pi=\\tfrac12$. The list is $0.5$, $1/\\pi=0.3183$, $0$, $-1/(3\\pi)=-0.1061$ for $k=0,1,2,3$. The inverse transform of the same square wave is Example 6.5 with $W=\\pi/2$: $x[n]=\\sin(\\pi n/2)/(\\pi n)$ with $x[0]=\\tfrac12$, which is the same list of numbers, so $a_k=x[-k]$. Here $x$ is even, so $a_k=x[k]$ as well.'},

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
