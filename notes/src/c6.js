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
const wTicks=(lo,hi,step)=>{const o=[];
  for(let k=Math.ceil(lo/step-1e-9);k<=hi/step+1e-9;k++) o.push(k*step); return o;};

const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:56,r:24,t:28,b:36},xtarget:8,ytarget:3},o));
const wax=o=>P.Axes(Object.assign({w:700,h:210,pad:{l:62,r:26,t:30,b:38},yticksLeft:true,
  xr:[-3.2*PI,3.2*PI],xticksOverride:wTicks(-3*PI,3*PI,PI),xtickfmt:piTick,ytarget:3},o));

/* Every spectrum in this chapter is drawn over more than one period of 2*pi
   with one period marked, because the periodicity is the subject of the
   chapter. The bracket carries no label of its own: the name of the dependent
   variable is anchored on the zero line, so the words go to the left of the
   bracket instead. */
const mark=(a,v,lo,hi)=>{ lo=lo==null?-PI:lo; hi=hi==null?PI:hi;
  a.vline(lo,{color:C.coral,opacity:.5}); a.vline(hi,{color:C.coral,opacity:.5});
  a.span(lo,hi,v,'',{color:C.coral});
  a.note(lo,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:12,anchor:'end',dx:-8,dy:-3});
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
/* |X(e^{jw})| of a finite record x[0..L-1] placed at n0, straight from the analysis sum */
const mag=(x,w,n0)=>{let re=0,im=0; n0=n0||0;
  for(let i=0;i<x.length;i++){const p=w*(n0+i); re+=x[i]*Math.cos(p); im-=x[i]*Math.sin(p);}
  return Math.hypot(re,im);};
const hann=(n,L)=>(n<0||n>L-1)?0:Math.pow(Math.sin(PI*n/L),2);
/* stems of a DFT at w_k = 2 pi k / N across the drawn range: k = 0..N-1 strong, repeats faint */
const dftStems=(a,N,f,lo,hi)=>{const s=[],t=[];
  for(let k=Math.ceil(lo*N/(2*PI)-1e-9);k<=Math.floor(hi*N/(2*PI)+1e-9);k++){
    const wk=2*PI*k/N, m=f(wk), p=[wk,m<1e-9?0:m]; (k>=0&&k<N?s:t).push(p);}
  a.stem(t,{color:C.muted}); a.stem(s,{color:C.in}); };
/* the sequence of the spectrogram: four notes of 48 samples, each a pair of tones */
const NOTES=[[0.15,0.55],[0.35,0.80],[0.15,0.80],[0.35,0.55]], SEG=48, NS=192, HOP=8, LS=32;
const tones=n=>{ if(n<0||n>=NS) return 0; const [p,q]=NOTES[Math.floor(n/SEG)];
  return Math.cos(p*PI*n)+Math.cos(q*PI*n); };

window.C6 = [
{t:'page'},

{t:'h1', num:'CHAPTER 6', text:'The discrete-time Fourier transform'},
{t:'p', lead:true, text:'The discrete-time Fourier transform describes the frequency content of a sequence that is not periodic. We derive it in three steps: replicate a finite sequence to make it periodic, apply the series from Chapter 4, and let the period grow without bound. The result is a continuous function of frequency that repeats every $2\\pi$. Every figure shows more than one period so that this property stays visible. The chapter then works out the standard pairs, the transforms of periodic sequences and every property with its proof. It ends with filters, windows and difference equations, and with the discrete Fourier transform that a computer evaluates.'},

/* ================================================================ 6.1 */
{t:'h2', num:'6.1', text:'Building the transform'},
{t:'p', text:'Let $x[n]$ have finite support: $x[n]=0$ for $|n|>N_1$. The discrete-time Fourier series applies to periodic sequences only, so build a periodic sequence out of $x$ by laying the same finite sequence down again every $N$ samples.'},
{t:'eqbox', cap:'Periodic replication',
 tex:['\\tilde{x}[n]=\\sum_{r=-\\infty}^{\\infty}x[n-rN],\\qquad \\tilde{x}[n+N]=\\tilde{x}[n]'],
 after:'Periodic replication places a copy of the complete sequence every $N$ samples. It does not insert samples within a copy.'},
{t:'box', kind:'warn', hd:'The condition the construction needs',
 html:'The copies must not overlap, so the period must be longer than the support: $N>2N_1$. Only then is $\\tilde{x}[n]=x[n]$ for $-N_1\\le n\\le N_1$, a band of $2N_1+1$ samples centred on the origin. With $N\\le 2N_1$ the tails of neighbouring copies add and no period of $\\tilde{x}$ equals $x$ any more. For a sequence that is zero outside $|n|\\le3$, the copies stay apart only for $N>6$: $N=9$ works, while $N=4$ and $N=6$ do not.'},
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
{t:'p', text:'Let $N$ grow while $x$ stays fixed. The copies move outward, and at every fixed $n$ the value $\\tilde{x}[n]$ becomes $x[n]$ once $N$ is large enough. So $\\tilde{x}[n]\\to x[n]$ at every $n$ as $N\\to\\infty$.'},

{t:'h3', text:'The coefficients are samples of one function'},
{t:'eqbox', cap:'Discrete-time Fourier series',
 tex:['\\tilde{x}[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\omega_0 n},\\qquad \\omega_0=\\frac{2\\pi}{N}',
      'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}\\tilde{x}[n]\\,e^{-jk\\omega_0 n}'],
 after:'The analysis exponent is negative. Synthesis builds the sequence up out of exponentials and carries $e^{+jk\\omega_0n}$; analysis takes it apart and carries the conjugate. A plus sign in both places breaks the identity derived below.'},
{t:'p', text:'Take the analysis sum over the period that holds $-N_1\\le n\\le N_1$. On that period $\\tilde{x}[n]=x[n]$. Because $x$ is zero outside $-N_1\\le n\\le N_1$, extending the sum to all $n$ adds only zero terms:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}x[n]e^{-jk\\omega_0 n}=\\frac{1}{N}\\sum_{n=-\\infty}^{\\infty}x[n]e^{-jk\\omega_0 n}.'},
{t:'p', text:'The last sum has the same form for every $k$. Define it as a function of the continuous variable $\\omega$, and then evaluate it at $\\omega=k\\omega_0$.'},
{t:'eqbox', cap:'The envelope',
 tex:['X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}\\qquad\\Longrightarrow\\qquad N\\,a_k=X(e^{jk\\omega_0})'],
 after:'$X(e^{j\\omega})$ is defined for every real $\\omega$ and does not depend on $N$. The scaled coefficients $Na_k$ are its samples, spaced $\\omega_0=2\\pi/N$ apart; a larger $N$ only makes the spacing smaller. The identity holds only because the two exponents match, which is the check on the sign. For the pulse with $N_1=2$ and $N=10$, $10\\,a_0=X(e^{j0})=\\sum_n x[n]=2N_1+1=5$, and the same $5$ comes out at every period $N$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-2.2*PI,2.2*PI],yr:[-1.6,6.1],yticksLeft:true,xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    pad:{l:56,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
   a.curve(w=>dirich(w,2),{color:C.in,n:2400}); mark(a,5.2); return a.svg();},
  cap:'The envelope of the pulse with $N_1=2$, over two periods. Its value at $\\omega=0$ is $2N_1+1=5$.'},
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-2.2*PI,2.2*PI],yr:[-1.6,6.1],yticksLeft:true,xlabel:'\\omega',ylabel:'Na_k',
    pad:{l:58,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,ytarget:3});
   a.curve(w=>dirich(w,2),{color:C.muted,n:2400,width:1.3,dash:'4 5'});
   const pts=[]; for(let k=-9;k<=9;k++) pts.push([k*2*PI/9,9*dtRect(k,9,2)]);
   a.stem(pts,{color:C.mid,showZero:true}); mark(a,5.2); return a.svg();},
  cap:'The scaled coefficients $Na_k$ for $N=9$: samples of the dashed envelope at $\\omega=k\\omega_0$.'}
]},

{t:'h3', text:'Letting the period grow'},
{t:'p', text:'Put $a_k=\\frac{1}{N}X(e^{jk\\omega_0})$ back into the synthesis equation and write $\\frac1N$ as $\\frac{\\omega_0}{2\\pi}$, which holds because $\\omega_0=2\\pi/N$:'},
{t:'eq', tex:'\\begin{aligned}\\tilde{x}[n]&=\\sum_{k=\\langle N\\rangle}\\frac{1}{N}X(e^{jk\\omega_0})e^{jk\\omega_0 n}\\\\&=\\frac{1}{2\\pi}\\sum_{k=\\langle N\\rangle}X(e^{jk\\omega_0})e^{jk\\omega_0 n}\\,\\omega_0.\\end{aligned}'},
{t:'p', text:'This is exact at every $N$. Read the right-hand side as a sum of rectangles. Each rectangle has height $X(e^{jk\\omega_0})e^{jk\\omega_0 n}$ and width $\\omega_0$. The $N$ rectangles cover an interval of length $N\\omega_0=2\\pi$. As $N$ grows without bound, $\\tilde{x}[n]$ approaches $x[n]$. At the same time the width $\\omega_0=2\\pi/N$ approaches zero and becomes $\\d\\omega$, so the rectangle sum approaches an integral over an interval of length $2\\pi$.'},
{t:'eqbox', cap:'The discrete-time Fourier transform pair',
 tex:['X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]\\,e^{-j\\omega n}\\qquad\\text{(analysis)}',
      'x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,e^{j\\omega n}\\,\\d\\omega\\qquad\\text{(synthesis)}'],
 after:'We write the pair $x[n]\\leftrightarrow X(e^{j\\omega})$. Analysis takes a sequence to its spectrum: the sum over all $n$ leaves a function of $\\omega$. Synthesis rebuilds the sequence: the integral over one period leaves a sequence in $n$. The names go by what each equation does, never by which is written first. Three details separate this pair from the continuous-time one: the factor $\\frac{1}{2\\pi}$ sits on the synthesis side, the integral runs over one period rather than the whole line, and the left-hand side is written $X(e^{j\\omega})$ to record that it is a function of $e^{j\\omega}$ and therefore repeats.'},
{t:'box', kind:'err', hd:'Two ways to write the synthesis equation wrongly',
 html:'The line $x[n]=\\int_{-\\infty}^{\\infty}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega$ has two errors: the factor $\\frac{1}{2\\pi}$ is missing, and the range must be one period of length $2\\pi$. An integral from $-2\\pi$ to $2\\pi$ covers two periods and returns $2x[n]$, because each period is counted once.'},

{t:'h3', text:'When the transform exists'},
{t:'p', text:'A sufficient condition is that $x$ is absolutely summable:'},
{t:'eq', tex:'\\sum_{n=-\\infty}^{\\infty}|x[n]|<\\infty.'},
{t:'p', text:'Then every term of the analysis sum has modulus $|x[n]e^{-j\\omega n}|=|x[n]|$, so the sum converges at every $\\omega$ and $X(e^{j\\omega})$ is continuous. For $x[n]=(0.8)^{n}u[n]$ the moduli form a geometric series with ratio $0.8$: $\\sum_{n\\ge0}(0.8)^{n}=1/(1-0.8)=5$. For $(0.5)^{n}u[n]$ the same formula gives $1/(1-0.5)=2$. Both transforms exist.'},
{t:'p', text:'A weaker condition is finite energy, $\\sum_n|x[n]|^{2}<\\infty$. Then the sum converges in mean square: the energy of the error between $X$ and a partial sum goes to zero, and the transform may have jumps. The sequence $x[n]=\\sin(\\pi n/2)/(\\pi n)$, with $x[0]=\\tfrac12$, is the example. For odd $n$, $|\\sin(\\pi n/2)|=1$, so $|x[n]|=1/(\\pi|n|)$. The moduli at odd $n$ therefore add like $\\tfrac{2}{\\pi}\\bigl(1+\\tfrac13+\\tfrac15+\\cdots\\bigr)$, and since $\\tfrac{1}{2m+1}\\ge\\tfrac12\\cdot\\tfrac{1}{m+1}$, this is at least half of a harmonic series and has no finite sum. The squares do add up: Example 6.6 shows that $x$ is the inverse transform of a band of height 1 on $|\\omega|\\le\\pi/2$, and Parseval\'s relation (Section 6.4) gives the energy $\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}1\\,\\d\\omega=\\tfrac12$. That transform jumps at $\\omega=\\pm\\pi/2$.'},
{t:'p', text:'Finite support is not needed either. It only kept the copies apart in the construction. The pair holds whenever the analysis sum converges.'},

{t:'h3', text:'Why the spectrum repeats'},
{t:'eqbox', cap:'Periodicity in the frequency variable',
 tex:['\\begin{aligned}X(e^{j(\\omega+2\\pi)})&=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j(\\omega+2\\pi)n}\\\\&=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}e^{-j2\\pi n}\\\\&=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}=X(e^{j\\omega})\\end{aligned}'],
 after:'The whole argument is that $n$ is an integer, so $e^{-j2\\pi n}=1$ in every term of the sum and the extra factor disappears term by term. Any interval of length $2\\pi$ therefore holds all of $X$. If $X(e^{j\\pi/4})=3$, then $X(e^{-j7\\pi/4})=3$ as well, because $-7\\pi/4=\\pi/4-2\\pi$.'},
{t:'p', text:'The same step in continuous time gives $\\int x(t)e^{-j\\omega t}e^{-j2\\pi t}\\d t$, where $t$ runs over the reals. There $e^{-j2\\pi t}$ equals 1 only at integer $t$, so it cannot leave the integral, and nothing forces $X(j\\omega)$ to repeat.'},
{t:'box', kind:'err', hd:'The habit this chapter is built to prevent',
 html:'A spectrum drawn on $-\\pi\\le\\omega\\le\\pi$ alone carries the same information as three periods of it, and it is also the picture a reader later mistakes for a spectrum that stops at $\\pm\\pi$. Every spectrum here is drawn over more than one period with the period marked.'},

{t:'h3', text:'Frequency in discrete time'},
{t:'p', text:'The frequency $\\omega$ of a sequence is measured in radians per sample. A sequence $e^{j\\omega n}$ is seen only at integer $n$, and moving the frequency by $2\\pi$ changes nothing there:'},
{t:'eq', tex:'e^{j(\\omega+2\\pi)n}=e^{j\\omega n}\\,e^{j2\\pi n}=e^{j\\omega n}.'},
{t:'p', text:'So $\\omega$ and $\\omega+2\\pi$ give the same sequence. Low frequencies lie near $\\omega=0$ and its copies at multiples of $2\\pi$. High frequencies lie near $\\omega=\\pm\\pi$, not at large $\\omega$. The fastest sequence is $e^{j\\pi n}=(-1)^{n}$. Of $\\cos(0.2\\pi n)$, $\\cos(1.9\\pi n)$ and $\\cos(0.9\\pi n)$, the last changes fastest from sample to sample: $1.9\\pi$ is $-0.1\\pi$ after a shift of $2\\pi$, so it is a slow sequence, and only $0.9\\pi$ lies near $\\pm\\pi$.'},
{t:'fig', svg:()=>{const a=ax({w:700,h:230,xr:[-8.6,8.6],yr:[-0.3,3.3],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,1,2],yticksLeft:true,xticksOverride:[-8,-6,-4,-2,2,4,6,8],pad:{l:56,r:26,t:30,b:36}});
  a.curve(t=>1+Math.cos(0.4*t),{color:C.in,width:1.3,dash:'7 5',n:1200});
  a.curve(t=>1+Math.cos((0.4+2*PI)*t),{color:C.err,width:1.1,dash:'4 4',n:3000,opacity:.7});
  a.stem(D(n=>1+Math.cos(0.4*n),-8,8),{color:C.in,showZero:true});
  return a.svg();},
 cap:'The stems are $x[n]=1+\\cos(0.4n)$. The curves $1+\\cos(0.4t)$ and $1+\\cos((0.4+2\\pi)t)$ both pass through every stem, so the sequence cannot tell the two frequencies apart.'},

{t:'h3', text:'Frequency on the unit circle'},
{t:'p', text:'The value $e^{j\\omega n}$ is a point on the unit circle at angle $\\omega n$. One step in $n$ multiplies it by $e^{j\\omega}$:'},
{t:'eq', tex:'e^{j\\omega(n+1)}=e^{j\\omega n}\\,e^{j\\omega}.'},
{t:'p', text:'Multiplying by $e^{j\\omega}$ turns a point by the angle $\\omega$. So the frequency is the turn per sample, and the real part of the point, dropped onto the real axis, is the sample $\\cos(\\omega n)$. Three facts can be read off the circle.'},
{t:'ul', items:[
 'A turn of $\\omega+2\\pi$ is one full turn more than $\\omega$ and lands on the same point, so it gives the same samples.',
 'At $\\omega=\\pi$ the point jumps between $1$ and $-1$, so the samples are $(-1)^{n}$. No sequence changes faster.',
 'A turn of $2\\pi-\\omega$ is a turn of $-\\omega$ plus a full turn. The point turns the other way, $e^{j(2\\pi-\\omega)n}=e^{-j\\omega n}$, which is the complex conjugate of $e^{j\\omega n}$. Its real part is the same: $\\cos((2\\pi-\\omega)n)=\\cos(2\\pi n-\\omega n)=\\cos(-\\omega n)=\\cos(\\omega n)$, because $2\\pi n$ is a whole number of turns and the cosine is even. For example, a turn of $3\\pi/2$ per step gives the same samples $\\cos(\\omega n)$ as a turn of $2\\pi-3\\pi/2=\\pi/2$.'
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const base={w:420,h:330,pad:{l:44,r:26,t:30,b:40},xlabel:'\\operatorname{Re}',ylabel:'\\operatorname{Im}',
     xticksOverride:[-1,1],yticksOverride:[-1,1],grid:false};
   const a0=P.Axes(Object.assign({xr:[-1.4,1.4],yr:[-1.4,1.4]},base));
   const dw=a0.x1-a0.x0, dh=a0.y0-a0.y1, s=Math.min(dw,dh)/2.9;
   const a=P.Axes(Object.assign({xr:[-dw/2/s,dw/2/s],yr:[-dh/2/s,dh/2/s]},base));
   const c=[]; for(let i=0;i<=240;i++){const t=2*PI*i/240; c.push([Math.cos(t),Math.sin(t)]);}
   a.poly(c,{color:C.muted,width:1.3});
   const w=PI/4, arc=[]; for(let i=0;i<=40;i++){const q=w*i/40; arc.push([0.32*Math.cos(q),0.32*Math.sin(q)]);}
   a.poly(arc,{color:C.coral,width:1.5});
   a.note(0.5*Math.cos(w/2),0.5*Math.sin(w/2),'\\omega',{tex:true,color:C.coral,fs:15,anchor:'middle',dy:5});
   a.poly([[0,0],[Math.cos(w),Math.sin(w)]],{color:C.in,width:1.8});
   a.poly([[Math.cos(w),Math.sin(w)],[Math.cos(w),0]],{color:C.coral,width:1.2,dash:'4 4'});
   for(let k=0;k<8;k++) a.point(Math.cos(w*k),Math.sin(w*k),{color:C.in,r:4.2});
   a.note(Math.cos(0)+0.08,0.1,'n=0',{tex:true,color:C.in,fs:13});
   a.note(Math.cos(w)+0.07,Math.sin(w)+0.08,'n=1',{tex:true,color:C.in,fs:13});
   a.note(0.08,1.12,'n=2',{tex:true,color:C.in,fs:13});
   return a.svg();},
  cap:'The points $e^{j\\omega n}$ for $\\omega=\\pi/4$: each step turns by $\\omega$, and after eight steps the point is back at $1$. The dashed drop gives the real part at $n=1$.'},
 {svg:()=>{const a=ax({w:420,h:330,xr:[-0.6,8.6],yr:[-1.3,1.4],xlabel:'n',ylabel:'\\cos(\\omega n)',
     xticksOverride:[0,2,4,6,8],yticksOverride:[-1,1],pad:{l:48,r:22,t:30,b:40}});
   a.stem(D(n=>Math.cos(PI*n/4),0,8),{color:C.in,showZero:true}); return a.svg();},
  cap:'The real parts, $\\cos(\\pi n/4)$ for $n=0,\\dots,8$. A turn of $7\\pi/4$ per step would give the same stems.'}
]},

{t:'h3', text:'The discrete Fourier transform'},
{t:'p', text:'A computer cannot store a function of a continuous $\\omega$. It stores a list of numbers. The discrete Fourier transform, or DFT, is the list of $N$ equally spaced samples of $X(e^{j\\omega})$ for a sequence that is zero outside $0\\le n\\le N-1$. The first example is the rectangular window of $L$ ones, $w[n]=1$ for $0\\le n\\le L-1$ and $0$ elsewhere. Its transform is a finite geometric sum with ratio $r=e^{-j\\omega}$, first index $p=0$ and last index $q=L-1$. The formula $\\sum_{n=p}^{q}r^{n}=(r^{p}-r^{q+1})/(1-r)$ needs only $r\\neq1$, that is $\\omega$ not a multiple of $2\\pi$. Then balance each difference about its middle exponent:'},
{t:'eq', tex:'\\begin{aligned}W(e^{j\\omega})&=\\sum_{n=0}^{L-1}e^{-j\\omega n}=\\frac{1-e^{-j\\omega L}}{1-e^{-j\\omega}}\\\\&=\\frac{e^{-j\\omega L/2}\\bigl(e^{j\\omega L/2}-e^{-j\\omega L/2}\\bigr)}{e^{-j\\omega/2}\\bigl(e^{j\\omega/2}-e^{-j\\omega/2}\\bigr)}\\\\&=\\frac{e^{-j\\omega L/2}\\cdot2j\\sin(\\omega L/2)}{e^{-j\\omega/2}\\cdot2j\\sin(\\omega/2)}\\\\&=e^{-j\\omega(L-1)/2}\\,\\frac{\\sin(\\omega L/2)}{\\sin(\\omega/2)}.\\end{aligned}'},
{t:'p', text:'The third line uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ twice. At $\\omega=0$ every term of the sum is 1, so $W(e^{j0})=L$. The magnitude $|\\sin(\\omega L/2)/\\sin(\\omega/2)|$ first reaches zero where $\\omega L/2=\\pm\\pi$, at $\\omega=\\pm2\\pi/L$. The main lobe between these two zeros is $4\\pi/L$ wide.'},
{t:'eqbox', cap:'The DFT: $N$ samples of the DTFT',
 tex:['X[k]=X(e^{j2\\pi k/N})=\\sum_{n=0}^{N-1}x[n]\\,e^{-j2\\pi kn/N},\\qquad k=0,1,\\dots,N-1'],
 after:'The second equality puts $\\omega=\\omega_k=2\\pi k/N$ into the analysis sum and drops the terms outside $0\\le n\\le N-1$, where $x[n]=0$. Only $N$ values are distinct: $\\omega_{k+N}=\\omega_k+2\\pi$, so $X[k+N]=X[k]$ by periodicity. The fast Fourier transform, the function fft in MATLAB and in NumPy, computes these $N$ numbers.'},
{t:'p', text:'The same numbers are the series coefficients of the periodic extension. Repeat $x[n]$ every $N$ samples to get $\\tilde{x}$. On $0\\le n\\le N-1$ there is only one copy, so $\\tilde{x}[n]=x[n]$ there, and the analysis sum of the series over that period gives'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=0}^{N-1}\\tilde{x}[n]\\,e^{-jk(2\\pi/N)n}=\\frac{1}{N}\\sum_{n=0}^{N-1}x[n]\\,e^{-j2\\pi kn/N}=\\frac{X[k]}{N}.'},
{t:'ex', hd:'Example 6.1 — the DFT of four ones', rows:[
 ['Given','$x[n]=1$ for $0\\le n\\le3$ and $0$ elsewhere.'],
 ['Find','$X(e^{j\\omega})$, and the DFT values $X[k]$ for $N=8$ and for $N=4$.'],
 ['Method','The sequence is the rectangular window with $L=4$, so its transform is the formula above. The DFT is that transform sampled at $\\omega_k=2\\pi k/N$.'],
 ['Solution','With $L=4$: $$X(e^{j\\omega})=e^{-j3\\omega/2}\\,\\frac{\\sin(2\\omega)}{\\sin(\\omega/2)},\\qquad X(e^{j0})=4.$$ The factor $e^{-j3\\omega/2}$ has modulus 1, so $|X(e^{j\\omega})|=|\\sin(2\\omega)/\\sin(\\omega/2)|$. For $N=8$ the samples are at $\\omega_k=\\pi k/4$, where $2\\omega_k=\\pi k/2$ and $\\omega_k/2=\\pi k/8$: $$|X[k]|=\\left|\\frac{\\sin(\\pi k/2)}{\\sin(\\pi k/8)}\\right|,\\qquad k=1,\\dots,7.$$ This gives $|X[1]|=1/\\sin(\\pi/8)=1/0.38268=2.6131$, $X[2]=0$ because $\\sin\\pi=0$, $|X[3]|=1/\\sin(3\\pi/8)=1/0.92388=1.0824$ and $X[4]=0$; the values for $k=5,6,7$ repeat these in reverse order, since $|\\sin(\\pi(8-k)/2)|=|\\sin(\\pi k/2)|$ and $\\sin(\\pi(8-k)/8)=\\sin(\\pi k/8)$. With $X[0]=4$ the list is $4,\\ 2.6131,\\ 0,\\ 1.0824,\\ 0,\\ 1.0824,\\ 0,\\ 2.6131$. For $N=4$ the samples are at $\\omega_k=\\pi k/2$, where $\\sin(2\\omega_k)=\\sin(\\pi k)=0$ for $k=1,2,3$. So $X[k]=4,\\,0,\\,0,\\,0$.'],
 ['Check','With $N=4$ the periodic extension of four ones is the constant 1. Its only nonzero series coefficient is $a_0=1$, and indeed $a_k=X[k]/4=1,0,0,0$.'],
 ['Reading','With $N=4$ every sample except the first lands on a zero of the curve. The four numbers are correct, but they hide the shape of $X(e^{j\\omega})$. In the same way, five ones with $N=5$ give $X[0]=5$ and $X[1]=\\dots=X[4]=0$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-1.25*PI,2.25*PI],yticksLeft:true,yr:[-0.5,6.2],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
    pad:{l:60,r:26,t:30,b:38},xticksOverride:wTicks(-PI,2*PI,PI/2),xtickfmt:piTick,yticksOverride:[0,2,4]});
   const f=w=>mag([1,1,1,1],w);
   a.curve(f,{color:C.mid,width:1.4,dash:'6 5',n:2400}); dftStems(a,8,f,-1.25*PI,2.25*PI); mark(a,5.4,0,2*PI); return a.svg();},
  cap:'$N=8$: the stems are $|X[k]|$ at $\\omega_k=2\\pi k/8$, strong for $k=0,\\dots,7$ and faint where they repeat. They lie on the dashed curve $|X(e^{j\\omega})|$.'},
 {svg:()=>{const a=P.Axes({w:640,h:210,xr:[-1.25*PI,2.25*PI],yticksLeft:true,yr:[-0.5,6.2],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
    pad:{l:60,r:26,t:30,b:38},xticksOverride:wTicks(-PI,2*PI,PI/2),xtickfmt:piTick,yticksOverride:[0,2,4]});
   const f=w=>mag([1,1,1,1],w);
   a.curve(f,{color:C.mid,width:1.4,dash:'6 5',n:2400}); dftStems(a,4,f,-1.25*PI,2.25*PI); mark(a,5.4,0,2*PI); return a.svg();},
  cap:'$N=4$: the stems read $4,0,0,0$. Three of them land on zeros of the curve.'}
]},

{t:'h3', text:'Zero padding and resolution'},
{t:'p', text:'Appending zeros to a record of $L$ samples raises $N$ but adds only zero terms to the analysis sum. So $X(e^{j\\omega})$ does not change. Zero padding gives more samples, closer together, of the same curve. It adds points, not detail.'},
{t:'p', text:'Detail comes from the record length $L$. A cosine kept for $L$ samples has a transform made of copies of $W(e^{j\\omega})$ centred on its frequencies, as Section 6.5 shows. Each copy has a main lobe $\\Delta\\omega=4\\pi/L$ wide, and only more signal makes it narrower. Take the record $x[n]=\\cos(0.3\\pi n)+\\cos(0.4\\pi n)$, $0\\le n\\le L-1$, whose two frequencies are $0.1\\pi$ apart. At $L=12$ each lobe is $4\\pi/12=\\pi/3$ wide, more than three times the spacing, and the two lobes merge into one peak. At $L=40$ each lobe is $4\\pi/40=0.1\\pi$ wide and the two peaks stand apart. No amount of padding separates the peaks of the $12$-sample record, because padding does not change its curve.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const L=12, N=48, x=D(n=>Math.cos(0.3*PI*n)+Math.cos(0.4*PI*n),0,L-1).map(p=>p[1]), f=w=>mag(x,w)/L;
   const a=P.Axes({w:640,h:210,xr:[-1.25*PI,2.25*PI],yticksLeft:true,yr:[-0.1,1.3],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|/L',
    pad:{l:60,r:26,t:30,b:38},xticksOverride:wTicks(-PI,2*PI,PI/2),xtickfmt:piTick,yticksOverride:[0,0.5,1]});
   a.curve(f,{color:C.mid,width:1.4,dash:'6 5',n:2400}); dftStems(a,N,f,-1.25*PI,2.25*PI); mark(a,1.12,0,2*PI); return a.svg();},
  cap:'$L=12$, padded to $N=48$: many stems, one merged peak near $0.35\\pi$ and its mirror.'},
 {svg:()=>{const L=40, N=48, x=D(n=>Math.cos(0.3*PI*n)+Math.cos(0.4*PI*n),0,L-1).map(p=>p[1]), f=w=>mag(x,w)/L;
   const a=P.Axes({w:640,h:210,xr:[-1.25*PI,2.25*PI],yticksLeft:true,yr:[-0.1,1.3],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|/L',
    pad:{l:60,r:26,t:30,b:38},xticksOverride:wTicks(-PI,2*PI,PI/2),xtickfmt:piTick,yticksOverride:[0,0.5,1]});
   a.curve(f,{color:C.mid,width:1.4,dash:'6 5',n:3000}); dftStems(a,N,f,-1.25*PI,2.25*PI); mark(a,1.12,0,2*PI); return a.svg();},
  cap:'$L=40$, padded to $N=48$: two separate peaks, at $0.3\\pi$ and $0.4\\pi$.'}
]},

/* ================================================================ 6.2 */
{t:'h2', num:'6.2', text:'The standard pairs'},
{t:'p', text:'Most problems start from one of a few standard sequences: a single sample, a one-sided or two-sided decay, a window, and the inverse of an ideal band. This section derives their transforms. A property from Section 6.4 then turns a standard pair into the transform that a problem needs.'},
{t:'ex', hd:'Example 6.2 — a shifted unit sample', rows:[
 ['Given','$x[n]=\\delta[n-n_0]$, a unit sample at the integer index $n_0$.'],
 ['Find','$X(e^{j\\omega})$, its magnitude and its phase.'],
 ['Method','Use the analysis sum because the sequence is given in time. The unit sample makes every term with $n\\neq n_0$ equal to zero, so only one term remains.'],
 ['Solution','Start from the analysis sum and substitute the sequence. The unit sample $\\delta[n-n_0]$ is 1 at $n=n_0$ and 0 at every other $n$, so the sum keeps one term: $$\\begin{aligned}X(e^{j\\omega})&=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}\\\\&=\\sum_{n=-\\infty}^{\\infty}\\delta[n-n_0]e^{-j\\omega n}\\\\&=e^{-j\\omega n_0}.\\end{aligned}$$ Write the result in polar form. A complex exponential $e^{j\\phi}$ with real $\\phi$ has modulus 1 and angle $\\phi$, so $$|X(e^{j\\omega})|=|e^{-j\\omega n_0}|=1,\\qquad \\angle X(e^{j\\omega})=-n_0\\omega.$$ The magnitude is 1 at every frequency and the phase is a straight line of slope $-n_0$.'],
 ['Check','At $n_0=0$ the sequence is $\\delta[n]$ and the transform is the constant 1, which is what the sum gives directly.'],
 ['Reading','A straight line is not periodic, and yet the transform is. A phase plot shows the principal value of the angle, in $(-\\pi,\\pi]$. The line $-n_0\\omega$ drops by $2\\pi$ every $2\\pi/|n_0|$ in $\\omega$, and each drop is folded back, so the plot is a sawtooth of period $2\\pi/|n_0|$.']
]},
{t:'fig', svg:()=>{const a=wax({yr:[-4.9,6.0],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
   pad:{l:74,r:26,t:30,b:38},yticksOverride:[-PI,-PI/2,0,PI/2,PI],ytickfmt:v=>v.toFixed(2)});
  a.curve(w=>-3*w,{color:C.muted,width:1.2,dash:'4 5'});
  a.curve(w=>{const v=-3*w; const r=v-2*PI*Math.round(v/(2*PI)); return Math.abs(Math.abs(r)-PI)<0.05?NaN:r;},{color:C.mid,n:6000});
  mark(a,4.55); return a.svg();},
 cap:'The phase of $e^{-j3\\omega}$, the transform of $\\delta[n-3]$. The dashed line is the unwrapped $-3\\omega$; the sawtooth is its principal value, of period $2\\pi/3$. Both describe the same transform.'},

{t:'ex', hd:'Example 6.3 — the one-sided exponential', rows:[
 ['Given','$x[n]=a^{n}u[n]$ with $a$ real and $|a|<1$.'],
 ['Find','$X(e^{j\\omega})$, and the extremes of its magnitude and phase.'],
 ['Method','Use the geometric-series formula because the one-sided sequence produces powers of the same ratio $ae^{-j\\omega}$. The stated condition makes the infinite sum converge.'],
 ['Solution','Start from the analysis sum and substitute the sequence. The factor $u[n]$ is 0 for $n<0$ and 1 for $n\\ge0$, so the lower limit moves to $n=0$. Then collect the two powers of $n$ into one power: $$\\begin{aligned}X(e^{j\\omega})&=\\sum_{n=-\\infty}^{\\infty}a^{n}u[n]\\,e^{-j\\omega n}\\\\&=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}\\\\&=\\sum_{n=0}^{\\infty}\\bigl(ae^{-j\\omega}\\bigr)^{n}.\\end{aligned}$$ This is an infinite geometric series with first term 1 and ratio $r=ae^{-j\\omega}$. The formula $\\sum_{n=0}^{\\infty}r^{n}=1/(1-r)$ holds when $|r|<1$. Here $|r|=|a|\\,|e^{-j\\omega}|=|a|\\cdot1=|a|<1$, so the series converges at every $\\omega$ and $$a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{1-ae^{-j\\omega}},\\qquad|a|<1.$$ For $|a|\\ge1$ the terms do not shrink and there is no transform. For the magnitude, write the denominator in rectangular form with $e^{-j\\omega}=\\cos\\omega-j\\sin\\omega$: $$1-ae^{-j\\omega}=(1-a\\cos\\omega)+j\\,a\\sin\\omega.$$ Its squared modulus is the sum of the squared real and imaginary parts: $$\\begin{aligned}|1-ae^{-j\\omega}|^{2}&=(1-a\\cos\\omega)^{2}+a^{2}\\sin^{2}\\omega\\\\&=1-2a\\cos\\omega+a^{2}\\cos^{2}\\omega+a^{2}\\sin^{2}\\omega\\\\&=1-2a\\cos\\omega+a^{2},\\end{aligned}$$ using $\\cos^{2}\\omega+\\sin^{2}\\omega=1$. The modulus of a quotient is the quotient of the moduli, and the angle of $1/D$ is minus the angle of $D$. For $|a|<1$ the real part $1-a\\cos\\omega$ is positive, so the arctangent gives the angle of $D$ directly: $$\\begin{gathered}|X(e^{j\\omega})|=\\frac{1}{\\sqrt{1-2a\\cos\\omega+a^{2}}},\\\\[3pt]\\angle X(e^{j\\omega})=-\\angle\\bigl(1-ae^{-j\\omega}\\bigr)=-\\arctan\\frac{a\\sin\\omega}{1-a\\cos\\omega}.\\end{gathered}$$'],
 ['Extremes','The magnitude is largest where $1-2a\\cos\\omega+a^{2}$ is smallest. For $a>0$ that is at $\\cos\\omega=1$, so $\\omega=0$, where the root is $|1-a|$ and $|X|_{\\max}=1/(1-a)$. It is smallest at $\\cos\\omega=-1$, so $\\omega=\\pm\\pi$, where the root is $|1+a|$ and $|X|_{\\min}=1/(1+a)$. For negative $a$ the two ends swap, so in general $|X|$ runs from $1/(1+|a|)$ to $1/(1-|a|)$. For the phase, find where the ratio $r(\\omega)=a\\sin\\omega/(1-a\\cos\\omega)$ is stationary. The quotient rule gives $$r\'(\\omega)=\\frac{a\\cos\\omega(1-a\\cos\\omega)-a\\sin\\omega\\cdot a\\sin\\omega}{(1-a\\cos\\omega)^{2}}=\\frac{a(\\cos\\omega-a)}{(1-a\\cos\\omega)^{2}},$$ again using $\\cos^{2}\\omega+\\sin^{2}\\omega=1$ in the numerator. So the extreme is at $\\cos\\omega=a$, where $\\sin\\omega=\\pm\\sqrt{1-a^{2}}$ and $$|r|=\\frac{|a|\\sqrt{1-a^{2}}}{1-a^{2}}=\\frac{|a|}{\\sqrt{1-a^{2}}}.$$ A right triangle with opposite side $|a|$ and adjacent side $\\sqrt{1-a^{2}}$ has hypotenuse 1, so $\\arctan|r|=\\arcsin|a|$ and $\\max|\\angle X|=\\arcsin|a|$. Geometrically, the denominator $1-ae^{-j\\omega}$ traces a circle of radius $|a|$ about the point 1, and the ray from the origin that touches this circle makes the largest angle. That ray and the radius to the touching point form the same right triangle.'],
 ['Numbers','$a=\\tfrac12$: magnitude between $\\tfrac23$ and 2, and $\\max|\\angle X|=\\arcsin\\tfrac12=\\pi/6=0.5236$ rad, at $\\omega=\\pm\\pi/3$ where $\\cos\\omega=\\tfrac12$. $a=\\tfrac18$: magnitude between $\\tfrac89=0.8889$ and $\\tfrac87=1.1429$, and $\\max|\\angle X|=\\arcsin\\tfrac18=0.1253$ rad.'],
 ['Check','At $\\omega=0$ the transform is $\\sum_n x[n]=\\sum_{n\\ge0}a^{n}=1/(1-a)$, the geometric series summed directly. It matches $|X|_{\\max}$ for $a>0$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:200,yr:[-0.30,2.62],xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|',
    yticksOverride:[2/3,2],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>geoMag(w,0.5),{color:C.in,n:3000});
   a.hline(2,{color:C.coral,opacity:.6}); a.hline(2/3,{color:C.coral,opacity:.6});
   mark(a,2.24); return a.svg();},
  cap:'Magnitude for $a=\\tfrac12$, touching $1/(1-a)=2$ and $1/(1+a)=2/3$ in every period.'},
 {svg:()=>{const a=wax({w:640,h:200,yr:[-0.95,1.02],xlabel:'\\omega',ylabel:'\\angle X(e^{j\\omega})\\;[\\text{rad}]',
    pad:{l:74,r:26,t:30,b:38},yticksOverride:[-0.5236,0,0.5236],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>geoPh(w,0.5),{color:C.mid,n:3000});
   a.hline(0.5236,{color:C.coral,opacity:.6}); a.hline(-0.5236,{color:C.coral,opacity:.6});
   mark(a,0.80); return a.svg();},
  cap:'Phase for $a=\\tfrac12$, touching $\\pm\\arcsin\\tfrac12=\\pm0.5236$ rad at $\\omega=\\mp\\pi/3$.'}
]},

{t:'ex', hd:'Example 6.4 — the two-sided exponential', rows:[
 ['Given','$x[n]=a^{|n|}$ with $|a|<1$.'],
 ['Find','$X(e^{j\\omega})$ and its extremes.'],
 ['Method','Split the analysis sum at $n=0$ because the absolute value changes formula there. Each remaining sum is geometric and converges under the stated condition.'],
 ['Solution','Start from the analysis sum and split it at $n=0$. For $n\\ge0$, $a^{|n|}=a^{n}$; for $n\\le-1$, $|n|=-n$ and $a^{|n|}=a^{-n}$: $$X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}a^{|n|}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}+\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}.$$ The first sum is the one-sided pair of Example 6.3, equal to $1/(1-ae^{-j\\omega})$ because $|ae^{-j\\omega}|=|a|<1$. In the second sum put $m=-n$. As $n$ runs from $-\\infty$ to $-1$, $m$ runs from $1$ to $\\infty$: $$\\sum_{n=-\\infty}^{-1}a^{-n}e^{-j\\omega n}=\\sum_{m=1}^{\\infty}a^{m}e^{j\\omega m}=\\sum_{m=1}^{\\infty}\\bigl(ae^{j\\omega}\\bigr)^{m}.$$ This is a geometric series with first term $ae^{j\\omega}$ and ratio $ae^{j\\omega}$, of modulus $|a|<1$, so it equals $ae^{j\\omega}/(1-ae^{j\\omega})$. Add the two parts over the common denominator $(1-ae^{-j\\omega})(1-ae^{j\\omega})$: $$\\begin{aligned}X(e^{j\\omega})&=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}\\\\&=\\frac{(1-ae^{j\\omega})+ae^{j\\omega}(1-ae^{-j\\omega})}{(1-ae^{-j\\omega})(1-ae^{j\\omega})}\\\\&=\\frac{1-ae^{j\\omega}+ae^{j\\omega}-a^{2}}{1-a(e^{j\\omega}+e^{-j\\omega})+a^{2}}\\\\&=\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}.\\end{aligned}$$ In the numerator the two terms $\\mp ae^{j\\omega}$ cancel and $ae^{j\\omega}\\cdot ae^{-j\\omega}=a^{2}$. In the denominator, $e^{j\\omega}+e^{-j\\omega}=2\\cos\\omega$.'],
 ['Extremes','For $0<a<1$, at $\\omega=0$ the value is $\\frac{1-a^{2}}{(1-a)^{2}}=\\frac{(1-a)(1+a)}{(1-a)^{2}}=\\frac{1+a}{1-a}$; at $\\omega=\\pm\\pi$ it is $\\frac{1-a^{2}}{(1+a)^{2}}=\\frac{1-a}{1+a}$. For $a=\\tfrac12$ these are 3 and $\\tfrac13$.'],
 ['Check','At $\\omega=0$ the transform must equal $\\sum_n a^{|n|}=1+2\\sum_{n\\ge1}a^{n}=1+\\frac{2a}{1-a}=\\frac{1+a}{1-a}$. That is 3 for $a=\\tfrac12$.'],
 ['Reading','The denominator is $|1-ae^{-j\\omega}|^{2}$, which is positive, and the numerator $1-a^{2}$ is positive for $|a|<1$. So this spectrum is real and strictly positive, and here $|X|=X$ with $\\angle X=0$ throughout. That is a property of this example, not of real spectra in general.']
]},

{t:'ex', hd:'Example 6.5 — the rectangular pulse', rows:[
 ['Given','$x[n]=1$ for $-N_1\\le n\\le N_1$ and zero elsewhere.'],
 ['Find','$X(e^{j\\omega})$ in closed form, its value at $\\omega=0$ and its zeros.'],
 ['Method','Use the finite geometric-series formula because the pulse has consecutive nonzero samples. Then balance the endpoint exponents so that each difference becomes a sine.'],
 ['Solution','Start from the analysis sum. The sequence is 1 on $-N_1\\le n\\le N_1$ and 0 elsewhere, so the limits shrink to the support: $$X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}=\\sum_{n=-N_1}^{N_1}e^{-j\\omega n}=\\sum_{n=-N_1}^{N_1}\\bigl(e^{-j\\omega}\\bigr)^{n}.$$ This is a finite geometric series with ratio $r=e^{-j\\omega}$ and $2N_1+1$ terms. The finite formula $\\sum_{n=p}^{q}r^{n}=(r^{p}-r^{q+1})/(1-r)$ needs only $r\\neq1$. With $p=-N_1$ and $q=N_1$: $$X(e^{j\\omega})=\\frac{e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}}{1-e^{-j\\omega}}.$$ Now balance the exponents. Multiply numerator and denominator by $e^{j\\omega/2}$, which changes nothing because it is the same factor above and below: $$\\begin{aligned}X(e^{j\\omega})&=\\frac{e^{j\\omega/2}\\bigl(e^{j\\omega N_1}-e^{-j\\omega(N_1+1)}\\bigr)}{e^{j\\omega/2}\\bigl(1-e^{-j\\omega}\\bigr)}\\\\&=\\frac{e^{j\\omega(N_1+\\frac12)}-e^{-j\\omega(N_1+\\frac12)}}{e^{j\\omega/2}-e^{-j\\omega/2}}\\\\&=\\frac{2j\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)}{2j\\sin(\\omega/2)}\\\\&=\\frac{\\sin\\bigl(\\omega(N_1+\\tfrac12)\\bigr)}{\\sin(\\omega/2)}.\\end{aligned}$$ The third line uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ twice, once with $\\theta=\\omega(N_1+\\tfrac12)$ and once with $\\theta=\\omega/2$. The factors $2j$ cancel, so the transform is real. This ratio is the <b>Dirichlet kernel</b>. With $N=2N_1+1$ samples in the pulse, $N_1+\\tfrac12=N/2$, so the same result reads $\\sin(\\omega N/2)/\\sin(\\omega/2)$.'],
 ['Excluded points','$r=e^{-j\\omega}=1$ at $\\omega=0,\\pm2\\pi,\\dots$, which is exactly where the formula becomes $0/0$. Go back to the sum: every term is 1, so $X=2N_1+1$. That is five for $N_1=2$ and nine for $N_1=4$.'],
 ['Zeros','The numerator is zero where $\\omega(N_1+\\tfrac12)=\\pi k$ for an integer $k$, that is at $$\\omega=\\frac{2\\pi k}{2N_1+1}.$$ When $k$ is a multiple of $2N_1+1$, $\\omega$ is a multiple of $2\\pi$ and the value is the peak $2N_1+1$ instead. So the zeros are at $2\\pi k/(2N_1+1)$ with $k$ not a multiple of $2N_1+1$. The first zero above $\\omega=0$ is $2\\pi/5$ for $N_1=2$, $2\\pi/7$ for $N_1=3$ and $2\\pi/9$ for $N_1=4$.'],
 ['Check','This is not a sinc. The denominator is $\\sin(\\omega/2)$, not $\\omega/2$, and that is what makes the function periodic: a ratio of two sines repeats every $2\\pi$, while the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, decays and never repeats.']
]},
{t:'box', kind:'warn', hd:'What a finite geometric sum requires',
 html:'$\\sum_{n=p}^{q}r^{\\,n}=(r^{p}-r^{\\,q+1})/(1-r)$ needs $r\\neq1$ and nothing else. There are finitely many terms, so nothing has to converge; only the division can fail. Here $|r|=1$ exactly, so a condition $|r|<1$ would exclude every $\\omega$, while $|r|\\le1$ would admit the one value that breaks it. The condition $|a|<1$ of Example 6.3 belongs to the infinite sum, where it makes the tail vanish.'},
{t:'p', text:'Going from $N_1=2$ to $N_1=4$ the peak rises from $5$ to $9$, and the first zero moves in from $2\\pi/5$ to $2\\pi/9$. A wider pulse gives a narrower main lobe, but the lobe does not halve when the pulse length is nearly doubled: the ratio of the first zeros is $\\frac{2\\pi/9}{2\\pi/5}=\\frac59$, the inverse ratio of the pulse lengths $5$ and $9$. The period stays $2\\pi$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:210,yr:[-2.4,6.6],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    yticksOverride:[-1.25,0,2.5,5],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>dirich(wrap(w),2),{color:C.in,n:5000});
   a.point(2*PI/5,0,{color:C.err,r:4}); a.point(-2*PI/5,0,{color:C.err,r:4});
   mark(a,5.72); return a.svg();},
  cap:'$N_1=2$: peak 5, least value $-1.2500$, first zeros at $\\pm2\\pi/5$ (red).'},
 {svg:()=>{const a=wax({w:640,h:210,yr:[-3.9,11.7],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    yticksOverride:[-2.0391,0,4.5,9],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>dirich(wrap(w),4),{color:C.h,n:6000});
   a.point(2*PI/9,0,{color:C.err,r:4}); a.point(-2*PI/9,0,{color:C.err,r:4});
   mark(a,10.2); return a.svg();},
  cap:'$N_1=4$: peak 9, least value $-2.0391$, first zeros at $\\pm2\\pi/9$.'}
]},
{t:'box', kind:'err', hd:'Real is not the same as non-negative',
 html:'The kernel above is real at every $\\omega$ and negative on part of every period. Realness says that the imaginary part is zero. It says nothing about the sign, and the angle depends on the sign: $$X\\ \\text{real}:\\qquad \\angle X=\\begin{cases}0,&X>0\\\\ \\pi,&X<0\\end{cases}\\qquad |X|=\\begin{cases}X,&X\\ge0\\\\ -X,&X<0.\\end{cases}$$ For $N_1=2$ the kernel at $\\omega=0.6\\pi$ is $\\sin(1.5\\pi)/\\sin(0.3\\pi)=-1/0.8090=-1.236$, so there $\\angle X=\\pi$, not $0$. Example 6.4 is the contrasting case: there the spectrum is real <b>and</b> strictly positive, so the phase really is zero. Positivity gives zero phase; realness alone does not.'},

{t:'ex', hd:'Example 6.6 — the ideal low-pass sequence', rows:[
 ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le W$ and 0 for $W<|\\omega|\\le\\pi$, repeated with period $2\\pi$, with $0<W\\le\\pi$.'],
 ['Find','$x[n]$.'],
 ['Method','Use the synthesis integral because the spectrum is given and the sequence is required. Choose the period $-\\pi\\le\\omega\\le\\pi$ so that the band where the spectrum is 1 appears once in it.'],
 ['Solution','Start from the synthesis integral over the period $-\\pi\\le\\omega\\le\\pi$. The spectrum is 1 on $|\\omega|\\le W$ and 0 on the rest of the period, so the limits shrink to $-W\\le\\omega\\le W$: $$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega.$$ For $n\\neq0$ the antiderivative of $e^{j\\omega n}$ in $\\omega$ is $e^{j\\omega n}/(jn)$: $$\\begin{aligned}x[n]&=\\rule{0pt}{2.6em}\\frac{1}{2\\pi}\\biggl[\\frac{e^{j\\omega n}}{jn}\\biggr]_{-W}^{W}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWn}-e^{-jWn}}{jn}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(Wn)}{jn}\\\\&=\\frac{\\sin(Wn)}{\\pi n}.\\end{aligned}$$ The third line uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ with $\\theta=Wn$, and then the $j$ and the 2 cancel. At $n=0$ the antiderivative does not apply because it divides by $n$. There the integrand is $e^{0}=1$, so the integral is the length $2W$ of the band and $$x[0]=\\frac{1}{2\\pi}\\cdot2W=\\frac{W}{\\pi},$$ which is also the limit of $\\sin(Wn)/(\\pi n)$ as $n\\to0$.'],
 ['Numbers','$W=\\pi/4$: $0.25$, $0.225079$, $0.159155$, $0.075026$ at $n=0,1,2,3$. $W=\\pi/2$: $0.5$, $0.318310$, $0$, $-0.106103$; in particular $x[2]=\\sin(\\pi)/(2\\pi)=0$.'],
 ['Check','$x[0]$ must be the fraction $W/\\pi$ of the period that the band occupies. That single number catches both a lost $2\\pi$ and a wrong prefactor.'],
 ['Reading','A narrow band gives a slowly decaying sequence, and a wide band a short one. At $W=\\pi$ the band fills the whole period, $x[0]=1$, and $x[n]=\\sin(\\pi n)/(\\pi n)=0$ for every $n\\neq0$: the sequence is $\\delta[n]$, whose transform is the constant 1.']
]},
{t:'box', hd:'The sinc convention',
 html:'This course uses the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, with no $\\pi$ inside the argument. In that convention the same sequence reads $x[n]=\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$. The other common definition puts a $\\pi$ inside the argument and moves every zero crossing, so the convention is restated at every point of use. The prefactor is the constant $W/\\pi$. Writing $\\sin(Wn)/n$ drops the $\\pi$ and is $\\pi$ times too large at every index: it gives $0.707107$ at $n=1$ for $W=\\pi/4$, where the true value is $0.225079$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.30,1.72],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),ytarget:2});
   a.curve(w=>lpf(w,PI/4),{color:C.in,n:8000}); mark(a,1.30); return a.svg();},
  cap:'The spectrum for $W=\\pi/4$, over three periods. The band repeats; it does not stop at $\\pm\\pi$.'},
 {svg:()=>{const a=ax({w:640,h:190,xr:[-18,18],yr:[-0.10,0.34],xlabel:'n',ylabel:'x[n]',
    yticksOverride:[0,0.1,0.25],ytickfmt:v=>v.toFixed(4)});
   a.stem(D(n=>lpfInv(n,PI/4),-18,18),{color:C.out,showZero:true}); return a.svg();},
  cap:'Its inverse transform, with $x[0]=W/\\pi=0.25$.'}
]},

/* ================================================================ 6.3 */
{t:'h2', num:'6.3', text:'Periodic sequences'},
{t:'p', text:'A complex exponential is not absolutely summable: $\\sum_n|e^{j\\omega_0 n}|=\\sum_n1$ diverges. Its analysis sum does not converge in the ordinary sense. Its transform exists as a train of impulses, and the definition is that the synthesis equation returns the sequence.'},
{t:'eqbox', cap:'The complex exponential',
 tex:['e^{j\\omega_0 n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)'],
 after:'To confirm the pair, put the impulse train into the synthesis equation. Choose the integration period $\\omega_0-\\pi<\\omega\\le\\omega_0+\\pi$, so that it contains exactly one impulse of the train, the one at $\\omega=\\omega_0$ with $k=0$. Then the sifting property picks out the integrand at $\\omega=\\omega_0$: $$\\begin{aligned}x[n]&=\\frac{1}{2\\pi}\\int_{\\omega_0-\\pi}^{\\omega_0+\\pi}\\sum_{k}2\\pi\\,\\delta(\\omega-\\omega_0-2\\pi k)\\,e^{j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{\\omega_0-\\pi}^{\\omega_0+\\pi}2\\pi\\,\\delta(\\omega-\\omega_0)\\,e^{j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\cdot2\\pi\\,e^{j\\omega_0n}=e^{j\\omega_0n}.\\end{aligned}$$ The copies must be there: a single impulse is not $2\\pi$-periodic, and a sequence cannot tell $\\omega_0$ from $\\omega_0+2\\pi$. With $\\omega_0=0$ the pair gives the constant: $1\\leftrightarrow2\\pi\\sum_k\\delta(\\omega-2\\pi k)$. A factor in front scales every weight: $3e^{j(\\pi/2)n}$ has impulses of weight $3\\cdot2\\pi=6\\pi$.'},
{t:'box', hd:'Weight, not height',
 html:'An impulse has no value at a point; it has a weight, the number that comes out when it is integrated. Every figure here draws an impulse as an arrow whose height <b>is</b> its weight, so the two can be read off the same axis. Arrows drawn to a fixed height with the weight written beside them hide exactly the comparison these pictures are for.'},

{t:'h3', text:'The transform of a periodic sequence'},
{t:'p', text:'A sequence of period $N$ has a series $x[n]=\\sum_{k=0}^{N-1}a_k e^{jk(2\\pi/N)n}$. By linearity, transform it term by term, using the complex-exponential pair with $\\omega_0=2\\pi k/N$ for the $k$-th term. Write $l$ for the index of the copies so that it is not confused with $k$:'},
{t:'eq', tex:'\\begin{aligned}X(e^{j\\omega})&=\\sum_{k=0}^{N-1}a_k\\sum_{l=-\\infty}^{\\infty}2\\pi\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}-2\\pi l\\right)\\\\&=\\sum_{k=0}^{N-1}\\sum_{l=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi(k+lN)}{N}\\right).\\end{aligned}'},
{t:'p', text:'Now put $m=k+lN$. As $k$ runs over $0,\\dots,N-1$ and $l$ over all integers, $m$ runs over every integer exactly once. The coefficients repeat with period $N$, so $a_k=a_{k+lN}=a_m$. The double sum becomes one sum over $m$, which we rename $k$:'},
{t:'eqbox', cap:'A periodic sequence',
 tex:['x[n]=\\sum_{k=\\langle N\\rangle}a_k e^{jk\\frac{2\\pi}{N}n}\\;\\longleftrightarrow\\;X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi a_k\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)'],
 after:'The impulses are $2\\pi/N$ apart, so one period holds exactly $N$ of them, and their weights are $2\\pi a_k$. A sequence of period $N=6$ has impulses $2\\pi/6=\\pi/3$ apart.'},
{t:'ex', hd:'Example 6.7 — a sequence of period four', rows:[
 ['Given','$x[n]=1+\\cos(\\pi n/2)+\\tfrac14(-1)^{n}$.'],
 ['Find','The period, the series coefficients and $X(e^{j\\omega})$.'],
 ['Method','Write every term as an exponential $e^{jk(2\\pi/N)n}$ with $0\\le k\\le N-1$, read off $a_k$, and give each impulse the weight $2\\pi a_k$.'],
 ['Solution','The terms have periods 1, 4 and 2, so $N=4$ and $2\\pi/N=\\pi/2$. The constant is $1=e^{j0n}$, the term $k=0$. By Euler\'s relation $\\cos(\\pi n/2)=\\tfrac12e^{j\\pi n/2}+\\tfrac12e^{-j\\pi n/2}$. The first exponential is the term $k=1$. The second is moved into the range $0\\le k\\le3$ by a whole number of turns: $e^{-j\\pi n/2}=e^{-j\\pi n/2}e^{j2\\pi n}=e^{j3\\pi n/2}$, the term $k=3$. Finally $(-1)^{n}=e^{j\\pi n}$, the term $k=2$. So $$a_0=1,\\qquad a_1=\\tfrac12,\\qquad a_2=\\tfrac14,\\qquad a_3=\\tfrac12.$$ The impulses sit at $\\omega=k\\pi/2$ with weights $2\\pi a_k$: $2\\pi$ at $0$, $\\pi$ at $\\pi/2$, $\\pi/2$ at $\\pi$, $\\pi$ at $3\\pi/2$, and the pattern repeats every $2\\pi$.'],
 ['Check','The synthesis sum at $n=0$ is $\\sum_k a_k=1+\\tfrac12+\\tfrac14+\\tfrac12=2.25$, and the sequence gives $x[0]=1+1+\\tfrac14=2.25$.']
]},
{t:'fig', svg:()=>{const a=wax({h:220,yr:[-0.9,8.6],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
   xticksOverride:wTicks(-3*PI,3*PI,PI/2),yticksOverride:[0,PI/2,PI,2*PI],ytickfmt:piTick});
  const ak=[1,0.5,0.25,0.5];
  for(let k=-6;k<=6;k++) a.impulse(k*PI/2,2*PI*ak[((k%4)+4)%4],{color:C.in,label:false});
  mark(a,7.6); return a.svg();},
 cap:'The transform of $1+\\cos(\\pi n/2)+\\tfrac14(-1)^{n}$: four impulses in each period, $\\pi/2$ apart, of weights $2\\pi$, $\\pi$, $\\pi/2$, $\\pi$.'},

{t:'h3', text:'Cosine and sine'},
{t:'p', text:'Euler\'s relations write each as two exponentials, $\\cos\\omega_0n=\\tfrac12e^{j\\omega_0n}+\\tfrac12e^{-j\\omega_0n}$ and $\\sin\\omega_0n=\\tfrac{1}{2j}e^{j\\omega_0n}-\\tfrac{1}{2j}e^{-j\\omega_0n}$. Each exponential brings an impulse train of weight $2\\pi$, and $\\tfrac12\\cdot2\\pi=\\pi$ while $\\tfrac{1}{2j}\\cdot2\\pi=\\pi/j$:'},
{t:'eqbox', cap:'Cosine and sine',
 tex:['\\cos\\omega_0 n\\;\\longleftrightarrow\\;\\pi\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]',
      '\\sin\\omega_0 n\\;\\longleftrightarrow\\;\\frac{\\pi}{j}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)\\bigr]'],
 after:'The sine weight $\\pi/j=-j\\pi$ is imaginary: $-j\\pi$ at $+\\omega_0$ and $+j\\pi$ at $-\\omega_0$. A real sequence always produces the pair at $+\\omega_0$ and $-\\omega_0$; dropping the negative one rebuilds $\\tfrac12e^{j\\omega_0n}$, which is complex, instead of the cosine. An amplitude multiplies the weights: $3\\cos(\\pi n/3)$ has weight $3\\pi$ at $\\omega=\\pm\\pi/3$.'},

{t:'h3', text:'The periodic square wave'},
{t:'p', text:'Take the square wave that is 1 on $|n|\\le N_1$ inside each period of length $N$. Take the analysis sum of the series over the period centred on the origin. The sequence is 1 on $-N_1\\le n\\le N_1$ and 0 on the rest of that period, so the limits shrink to the pulse:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=\\langle N\\rangle}x[n]e^{-jk\\frac{2\\pi}{N}n}=\\frac{1}{N}\\sum_{n=-N_1}^{N_1}e^{-j\\left(\\frac{2\\pi k}{N}\\right)n}.'},
{t:'p', text:'The remaining sum is the rectangular-pulse sum of Example 6.5 with $\\omega$ replaced by $2\\pi k/N$. So the coefficients are the Dirichlet kernel sampled at $\\omega=2\\pi k/N$ and divided by $N$:'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\,\\frac{\\sin\\bigl(2\\pi k(N_1+\\frac12)/N\\bigr)}{\\sin(\\pi k/N)},\\qquad a_k=\\frac{2N_1+1}{N}\\ \\text{ when }N\\text{ divides }k.'},
{t:'p', text:'The second form covers the excluded points of Example 6.5. When $k$ is a multiple of $N$, $\\sin(\\pi k/N)=0$ and the closed form fails, but every term of the sum is 1, so the sum is $2N_1+1$. The impulse weights are $2\\pi a_k$.'},
{t:'ex', hd:'Example 6.8 — the square wave with $N=10$, $N_1=2$', rows:[
 ['Given','The square wave that is 1 on $|n|\\le2$ in each period of $N=10$.'],
 ['Find','The impulse weights $2\\pi a_k$ for $k=0,\\dots,5$.'],
 ['Method','Put $N=10$ and $N_1=2$ into the coefficient formula. Here $2\\pi k(N_1+\\tfrac12)/N=\\pi k/2$ and $\\pi k/N=\\pi k/10$.'],
 ['Solution','$$\\begin{aligned}2\\pi a_0&=2\\pi\\cdot\\tfrac{5}{10}=\\pi=3.1416,\\\\2\\pi a_1&=\\frac{2\\pi}{10}\\cdot\\frac{\\sin(\\pi/2)}{\\sin(\\pi/10)}=\\frac{2\\pi}{10}\\cdot\\frac{1}{0.30902}=2.0333,\\\\2\\pi a_2&=\\frac{2\\pi}{10}\\cdot\\frac{\\sin\\pi}{\\sin(\\pi/5)}=0,\\\\2\\pi a_3&=\\frac{2\\pi}{10}\\cdot\\frac{\\sin(3\\pi/2)}{\\sin(3\\pi/10)}=\\frac{2\\pi}{10}\\cdot\\frac{-1}{0.80902}=-0.7766,\\\\2\\pi a_4&=\\frac{2\\pi}{10}\\cdot\\frac{\\sin2\\pi}{\\sin(2\\pi/5)}=0,\\\\2\\pi a_5&=\\frac{2\\pi}{10}\\cdot\\frac{\\sin(5\\pi/2)}{\\sin(\\pi/2)}=\\frac{2\\pi}{10}=0.6283.\\end{aligned}$$ The sequence is real and even, so $a_{-k}=a_k$ and the weights at negative $k$ repeat these.'],
 ['Check','The weights are unequal, two of them are zero, and the ones at $\\pm3\\pi/5$ are negative, so those arrows point down. Sketching all impulses the same length hides all three facts.']
]},
{t:'fig', svg:()=>{const a=wax({yr:[-1.55,4.35],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
   yticksOverride:[-2*PI*0.123607,0,2*PI*0.323607,PI],ytickfmt:v=>v.toFixed(4)});
  a.curve(w=>2*PI*dirich(wrap(w),2)/10,{color:C.muted,width:1.3,dash:'4 5',n:4000});
  for(let k=-15;k<=15;k++){const w=2*PI*k/10;
    if(w>=-3*PI&&w<=3*PI){const v=2*PI*dtRect(k,10,2);
      if(Math.abs(v)>1e-9) a.impulse(w,v,{color:v>=0?C.in:C.err,label:false});}}
  mark(a,3.62); return a.svg();},
 cap:'The square wave with $N=10$, $N_1=2$. The dashed line is the envelope $\\frac{2\\pi}{N}\\sin(\\omega(N_1+\\frac12))/\\sin(\\omega/2)$; the red arrows are the negative weights.'},
{t:'p', text:'The weights lie on one curve. Write $2\\pi a_k$ as $\\frac{2\\pi}{N}$ times the envelope at $\\omega=2\\pi k/N$, where the envelope is the Dirichlet kernel, the transform of one pulse. As $N$ grows, the spacing $2\\pi/N$ and every weight shrink like $1/N$, while the envelope keeps its shape. With $N_1=2$ and $N=50$ the weight at $\\omega=0$ is $2\\pi\\cdot5/50=\\pi/5$. With $N_1=3$ and $N=10$ it is $2\\pi\\cdot7/10=7\\pi/5$.'},

{t:'ex', hd:'Example 6.9 — the impulse train', rows:[
 ['Given','$x[n]=\\sum_{m=-\\infty}^{\\infty}\\delta[n-mN]$: a unit sample every $N$ indices. Here $n$ is the sequence index and $m$ labels the copies, so the two roles use different letters.'],
 ['Find','The coefficients and the transform.'],
 ['Method','The sequence is periodic with period $N$, so its transform is an impulse train. Find $a_k$ over $0\\le n\\le N-1$, where only $x[0]=1$ is nonzero, then give each impulse the weight $2\\pi a_k$.'],
 ['Solution','Inside $0\\le n\\le N-1$ the only nonzero sample is $x[0]=1$, so the analysis sum keeps one term: $$a_k=\\frac1N\\sum_{n=0}^{N-1}x[n]e^{-jk\\frac{2\\pi}{N}n}=\\frac1N\\,x[0]\\,e^{0}=\\frac1N\\qquad\\text{for every }k.$$ Put $a_k=1/N$ into the periodic-sequence pair. Every impulse gets the same weight $2\\pi a_k=2\\pi/N$: $$X(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\cdot\\frac1N\\,\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right)=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{N}\\right).$$'],
 ['Numbers','Weights $2\\pi/5=1.2566$, $2\\pi/10=0.6283$, $2\\pi/15=0.4189$ for $N=5,10,15$. If $N$ doubles, each weight halves.'],
 ['Check','One period holds $N$ impulses of weight $2\\pi/N$, so their weights add to $2\\pi$ for every $N$. The synthesis equation at $n=0$ needs exactly that: $x[0]=\\frac{1}{2\\pi}\\cdot2\\pi=1$.'],
 ['Reading','A sparser train in time gives a denser train in frequency, with smaller impulses. Writing the train as $\\sum_n\\delta[n-nN]$ is a common error: then $n$ has two jobs in one line, and the copies need their own index.']
]},

{t:'ex', hd:'Example 6.10 — two cosines', rows:[
 ['Given','$x[n]=2\\cos\\left(\\frac{5\\pi}{3}n\\right)+\\cos\\left(\\frac{7\\pi}{4}n\\right)$.'],
 ['Find','The spectrum, and the fundamental period of the sequence.'],
 ['Method','First reduce each frequency to $-\\pi<\\omega\\le\\pi$, because frequencies $2\\pi$ apart describe the same sequence. Then transform each cosine and add the results by linearity.'],
 ['Reduction','Write $\\frac{5\\pi}{3}=2\\pi-\\frac{\\pi}{3}$. The term $2\\pi n$ is a whole number of turns at every integer $n$, and the cosine is even: $$\\cos\\left(\\tfrac{5\\pi}{3}n\\right)=\\cos\\left(2\\pi n-\\tfrac{\\pi}{3}n\\right)=\\cos\\left(-\\tfrac{\\pi}{3}n\\right)=\\cos\\left(\\tfrac{\\pi}{3}n\\right).$$ The same two moves with $\\frac{7\\pi}{4}=2\\pi-\\frac{\\pi}{4}$ give $\\cos\\left(\\frac{7\\pi}{4}n\\right)=\\cos\\left(\\frac{\\pi}{4}n\\right)$. These are not merely similar sequences; they take the same value at every $n$.'],
 ['Solution','After the reduction, $x[n]=2\\cos(\\tfrac{\\pi}{3}n)+\\cos(\\tfrac{\\pi}{4}n)$. Apply the cosine pair to each term and add by linearity: $$\\begin{aligned}X(e^{j\\omega})=2\\pi\\sum_{k}\\Bigl[&\\delta\\bigl(\\omega-\\tfrac{\\pi}{3}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{3}-2\\pi k\\bigr)\\Bigr]\\\\{}+\\pi\\sum_{k}\\Bigl[&\\delta\\bigl(\\omega-\\tfrac{\\pi}{4}-2\\pi k\\bigr)+\\delta\\bigl(\\omega+\\tfrac{\\pi}{4}-2\\pi k\\bigr)\\Bigr].\\end{aligned}$$ The amplitude 2 multiplies the weight $\\pi$ of the first cosine pair to $2\\pi$; the second cosine has amplitude 1 and keeps the weight $\\pi$. Inside one period, $-\\pi<\\omega\\le\\pi$, there are four impulses: weight $2\\pi$ at $\\pm\\pi/3$ and weight $\\pi$ at $\\pm\\pi/4$. Every copy $2\\pi$ away also belongs to the answer: weight $2\\pi$ at $\\pm5\\pi/3$ and $\\pm7\\pi/3$, weight $\\pi$ at $\\pm7\\pi/4$ and $\\pm9\\pi/4$.'],
 ['Period','For a discrete-time frequency $\\omega_0$ the fundamental period is $N_0=(2\\pi/\\omega_0)m$, where $m$ is the smallest positive integer that makes $N_0$ an integer; no such $m$ exists when $\\omega_0/2\\pi$ is irrational. For $\\omega_1=5\\pi/3$: $2\\pi/\\omega_1=6/5$, $m=5$, $N_0=6$. For $\\omega_2=7\\pi/4$: $2\\pi/\\omega_2=8/7$, $m=7$, $N_0=8$. The sum repeats when both terms do, after $\\operatorname{lcm}(6,8)=24$ samples. With $6=2\\cdot3$ and $8=2^{3}$ the lcm is $2^{3}\\cdot3=24$; and $24/6=4$, $24/8=3$ share no factor, so nothing smaller works.'],
 ['Check','$x[n]$ is real and even, so $X(e^{j\\omega})$ must be real and even. Each impulse at $+\\omega$ has a twin of the same weight at $-\\omega$. Drawing impulses only at $\\pm5\\pi/3$ and $\\pm7\\pi/4$ is the common error: inside $-\\pi<\\omega\\le\\pi$ they sit at $\\pm\\pi/3$ and $\\pm\\pi/4$.']
]},
{t:'fig', svg:()=>{const a=wax({h:250,yr:[-1.5,9.4],xlabel:'\\omega',ylabel:'X(e^{j\\omega})',
   yticksOverride:[0,PI,2*PI],ytickfmt:piTick});
  for(let k=-2;k<=2;k++) for(const s of [1,-1]){const w=s*PI/3+2*PI*k;
    if(w>=-3*PI&&w<=3*PI) a.impulse(w,2*PI,{color:C.in,label:false});}
  for(let k=-2;k<=2;k++) for(const s of [1,-1]){const w=s*PI/4+2*PI*k;
    if(w>=-3*PI&&w<=3*PI) a.impulse(w,PI,{color:C.h,label:false});}
  mark(a,7.9); return a.svg();},
 cap:'The spectrum over three periods. Tall arrows carry weight $2\\pi$ at $\\pm\\pi/3$, short ones $\\pi$ at $\\pm\\pi/4$, and each pattern repeats every $2\\pi$.'},

/* ================================================================ 6.4 */
{t:'h2', num:'6.4', text:'Properties'},
{t:'p', text:'Each property is proved the same way: write the analysis sum for the new sequence, substitute, and rearrange until the analysis sum of $x$ appears. Throughout, $x[n]\\leftrightarrow X(e^{j\\omega})$. The full list is collected in the table of Section 6.7.'},

{t:'h3', text:'Linearity and time shift'},
{t:'p', text:'The analysis equation is a sum, and a sum is linear:'},
{t:'eq', tex:'\\sum_{n}\\bigl(a\\,x_1[n]+b\\,x_2[n]\\bigr)e^{-j\\omega n}=a\\sum_{n}x_1[n]e^{-j\\omega n}+b\\sum_{n}x_2[n]e^{-j\\omega n}=a\\,X_1(e^{j\\omega})+b\\,X_2(e^{j\\omega}).'},
{t:'p', text:'The time shift needs a change of index. Put $m=n-n_0$, so $n=m+n_0$; as $n$ runs over all integers, so does $m$, and the limits do not change:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n=-\\infty}^{\\infty}x[n-n_0]e^{-j\\omega n}&=\\sum_{m=-\\infty}^{\\infty}x[m]e^{-j\\omega(m+n_0)}\\\\&=e^{-j\\omega n_0}\\sum_{m=-\\infty}^{\\infty}x[m]e^{-j\\omega m}=e^{-j\\omega n_0}X(e^{j\\omega}).\\end{aligned}'},
{t:'p', text:'The factor $e^{-j\\omega n_0}$ does not depend on $m$, so it moves outside the sum. It has modulus 1, so a delay leaves $|X|$ unchanged and adds $-\\omega n_0$ to the phase. For $y[n]=x[n-2]$ at $\\omega=0.5$, $\\angle Y-\\angle X=-0.5\\cdot2=-1$ rad.'},

{t:'h3', text:'Frequency shift'},
{t:'p', text:'Multiplying by $e^{j\\omega_0n}$, a sequence of fixed frequency $\\omega_0$, needs no change of index; the two exponentials combine into the analysis sum at $\\omega-\\omega_0$:'},
{t:'eq', tex:'\\sum_{n}e^{j\\omega_0n}x[n]e^{-j\\omega n}=\\sum_{n}x[n]e^{-j(\\omega-\\omega_0)n}=X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr).'},
{t:'p', text:'Every copy of the spectrum moves by $\\omega_0$. A peak pushed past $\\omega=\\pi$ comes back in at $-\\pi$, because the spectrum repeats every $2\\pi.$ For example, $(-1)^{n}=e^{j\\pi n}$, so $y[n]=(-1)^{n}x[n]$ moves a peak at $\\omega=0$ to $\\omega=\\pi$.'},

{t:'h3', text:'Conjugation and spectral symmetry'},
{t:'p', text:'Conjugation uses $(ab)^{*}=a^{*}b^{*}$ and $(e^{-j\\omega n})^{*}=e^{j\\omega n}$, so conjugating the analysis sum changes the sign of $j$ in every exponent:'},
{t:'eq', tex:'\\sum_{n}x^{*}[n]e^{-j\\omega n}=\\Bigl(\\sum_{n}x[n]e^{j\\omega n}\\Bigr)^{*}=\\Bigl(\\sum_{n}x[n]e^{-j(-\\omega)n}\\Bigr)^{*}=X^{*}(e^{-j\\omega}).'},
{t:'p', text:'For a real sequence, $x^{*}[n]=x[n]$, so the two transforms are equal and $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$. Taking real parts, moduli, imaginary parts and angles of both sides: the real part and the magnitude are even in $\\omega$, and the imaginary part and the phase are odd. So for a real sequence the values on $0\\le\\omega\\le\\pi$ fix those on $-\\pi\\le\\omega<0$; a complex sequence needs the whole period. As an example, if $x$ is real and $X(e^{j0.4})=1.2-0.5j$, then periodicity and symmetry give $X\\bigl(e^{j(2\\pi-0.4)}\\bigr)=X(e^{-j0.4})=X^{*}(e^{j0.4})=1.2+0.5j.$'},

{t:'h3', text:'Time reversal'},
{t:'p', text:'Put $m=-n$. As $n$ runs over all integers, so does $m$, and the result is the analysis sum at $-\\omega$:'},
{t:'eq', tex:'\\sum_{n}x[-n]e^{-j\\omega n}=\\sum_{m}x[m]e^{-j\\omega(-m)}=\\sum_{m}x[m]e^{-j(-\\omega)m}=X(e^{-j\\omega}).'},
{t:'p', text:'For a real $x$, $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$: reversal keeps the magnitude and changes the sign of the phase. If $x$ is even, $x[-n]=x[n]$, reversal changes nothing, and $X(e^{-j\\omega})=X(e^{j\\omega})$: the transform is even in $\\omega$. Example: $x[n]=\\delta[n]+2\\delta[n-1]$ has $X(e^{j\\omega})=1+2e^{-j\\omega}$, and $x[-n]=\\delta[n]+2\\delta[n+1]$ has $1+2e^{j\\omega}=X(e^{-j\\omega})$.'},

{t:'h3', text:'Even and odd parts'},
{t:'p', text:'The even part is $\\Ev\\{x[n]\\}=\\tfrac12(x[n]+x[-n])$ and the odd part is $\\Od\\{x[n]\\}=\\tfrac12(x[n]-x[-n])$. By linearity and time reversal, the even part transforms to $\\tfrac12[X(e^{j\\omega})+X(e^{-j\\omega})]$. For a real sequence $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$, and $\\tfrac12(z+z^{*})=\\operatorname{Re}\\{z\\}$ for any complex $z$. The odd part follows the same way with $\\tfrac12(z-z^{*})=j\\operatorname{Im}\\{z\\}$:'},
{t:'eqbox', cap:'Even and odd parts of a real sequence',
 tex:['\\Ev\\{x[n]\\}\\;\\longleftrightarrow\\;\\tfrac12\\bigl[X+X^{*}\\bigr]=\\operatorname{Re}\\{X(e^{j\\omega})\\},\\qquad \\Od\\{x[n]\\}\\;\\longleftrightarrow\\;\\tfrac12\\bigl[X-X^{*}\\bigr]=j\\operatorname{Im}\\{X(e^{j\\omega})\\}'],
 after:'A real and even sequence has no odd part, so its transform is real, and it is even by the symmetry above. A real and odd sequence has no even part, so its transform is purely imaginary and odd. For example, $x[n]=\\delta[n+1]-\\delta[n-1]$ is real and odd, and $X(e^{j\\omega})=e^{j\\omega}-e^{-j\\omega}=2j\\sin\\omega$, which is $2j$ at $\\omega=\\pi/2$.'},
{t:'ex', hd:'Example 6.11 — the even part of a one-sided sequence', rows:[
 ['Given','$x[n]=a^{n}u[n]$ with $0<a<1$, so $X(e^{j\\omega})=1/(1-ae^{-j\\omega})$ by Example 6.3.'],
 ['Find','The transform of $\\Ev\\{x[n]\\}$, and its values at $\\omega=0$ and $\\omega=\\pi$ for $a=0.6$.'],
 ['Method','Write the even part in terms of known sequences, transform term by term, and compare with $\\operatorname{Re}\\{X\\}$.'],
 ['Solution','For $n>0$, $x[-n]=0$, so the even part is $\\tfrac12a^{n}$. For $n<0$ it is $\\tfrac12a^{-n}$. At $n=0$ both halves meet: $\\tfrac12(x[0]+x[0])=1$. In one formula, $$\\Ev\\{x[n]\\}=\\tfrac12\\bigl(a^{n}u[n]+a^{-n}u[-n]\\bigr)=\\tfrac12a^{|n|}+\\tfrac12\\delta[n],$$ where the $\\delta$ term supplies the missing $\\tfrac12$ at the origin. Transform term by term with Example 6.4 and $\\delta[n]\\leftrightarrow1$, then put the two terms over the common denominator: $$\\begin{aligned}\\tfrac12\\cdot\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}+\\tfrac12&=\\frac{(1-a^{2})+(1-2a\\cos\\omega+a^{2})}{2\\,(1-2a\\cos\\omega+a^{2})}\\\\&=\\frac{2-2a\\cos\\omega}{2\\,(1-2a\\cos\\omega+a^{2})}\\\\&=\\frac{1-a\\cos\\omega}{1-2a\\cos\\omega+a^{2}}.\\end{aligned}$$ For $a=0.6$: at $\\omega=0$, $\\frac{1-0.6}{1-1.2+0.36}=\\frac{0.4}{0.16}=2.5$; at $\\omega=\\pi$, $\\frac{1+0.6}{1+1.2+0.36}=\\frac{1.6}{2.56}=0.625$.'],
 ['Check','This is $\\operatorname{Re}\\{1/(1-ae^{-j\\omega})\\}$ exactly. In Example 6.3 the denominator is $(1-a\\cos\\omega)+ja\\sin\\omega$. Multiplying numerator and denominator by its conjugate gives the denominator $1-2a\\cos\\omega+a^{2}$ and the real part $(1-a\\cos\\omega)/(1-2a\\cos\\omega+a^{2})$. At $\\omega=0$ both sides are $1/(1-a)$, which is $2.5$ for $a=0.6$.']
]},

{t:'h3', text:'Time expansion'},
{t:'p', text:'For an integer $k\\ge1$, the expansion $x_{(k)}[n]$ is $x[n/k]$ when $n$ is a multiple of $k$ and zero otherwise: the same values, with $k-1$ zeros inserted between each pair. Discrete time has no operation that stretches a sequence without leaving gaps. For $x[n]=1$ on $0\\le n\\le2$, the last nonzero sample of $x_{(2)}$ is $x[2]$, moved to $n=2\\cdot2=4$. In the analysis sum only the indices $n=rk$ with integer $r$ contribute, because every other term is zero. Put $n=rk$; as $n$ runs over the multiples of $k$, $r$ runs over all integers:'},
{t:'eq', tex:'\\sum_{n=-\\infty}^{\\infty}x_{(k)}[n]e^{-j\\omega n}=\\sum_{r=-\\infty}^{\\infty}x_{(k)}[rk]\\,e^{-j\\omega rk}=\\sum_{r=-\\infty}^{\\infty}x[r]\\,e^{-j(k\\omega)r}=X(e^{jk\\omega}).'},
{t:'p', text:'The middle step uses $x_{(k)}[rk]=x[rk/k]=x[r]$. The last sum is the analysis sum of $x$ with $\\omega$ replaced by $k\\omega$. That transform repeats every $2\\pi/k$:'},
{t:'eq', tex:'X\\bigl(e^{jk(\\omega+2\\pi/k)}\\bigr)=X\\bigl(e^{jk\\omega+j2\\pi}\\bigr)=X\\bigl(e^{jk\\omega}\\bigr).'},
{t:'p', text:'So the frequency axis is compressed by $k$, and one period of length $2\\pi$ now holds $k$ copies of the old picture. The inserted zeros add no energy, so $x_{(k)}$ has the energy of $x$, and each copy keeps the height of the original peak. If $X$ has one peak in $-\\pi<\\omega\\le\\pi$, at $\\omega=0$, then the transform of $x_{(4)}$ has four there, at $-\\pi/2$, $0$, $\\pi/2$ and $\\pi$.'},
{t:'ex', hd:'Example 6.12 — expansion of a five-point pulse', rows:[
 ['Given','$g[n]=1$ on $|n|\\le2$, $y[n]=g[n-2]$, and $x[n]=y_{(2)}[n]+2y_{(2)}[n-1]$.'],
 ['Find','$X(e^{j\\omega})$ and its value at $\\omega=0$.'],
 ['Method','Build the sequence in three steps, a shift, an expansion and a weighted sum with a delayed copy, and apply the matching property at each step. Each step changes a known transform, so no new sum is needed.'],
 ['Solution','The pulse is Example 6.5 with $N_1=2$, so $G(e^{j\\omega})=\\sin(5\\omega/2)/\\sin(\\omega/2)$. The shift by $n_0=2$ gives $$Y(e^{j\\omega})=e^{-j2\\omega}G(e^{j\\omega})=e^{-j2\\omega}\\,\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}.$$ Expansion by $k=2$ replaces $\\omega$ by $2\\omega$ everywhere: $$Y_{(2)}(e^{j\\omega})=Y(e^{j2\\omega})=e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin\\omega}.$$ Finally, by linearity and the shift by 1, $$X(e^{j\\omega})=Y_{(2)}(e^{j\\omega})+2e^{-j\\omega}Y_{(2)}(e^{j\\omega})=\\bigl(1+2e^{-j\\omega}\\bigr)e^{-j4\\omega}\\,\\frac{\\sin(5\\omega)}{\\sin\\omega}.$$ At $\\omega=0$ the first factor is $1+2=3$, the exponential is 1 and the kernel takes its peak value 5, the number of ones in the pulse. So $X(e^{j0})=3\\times5=15$.'],
 ['Check','$X(e^{j0})=\\sum_n x[n]$. The expanded sequence has five ones at even indices, and the delayed copy has five twos at odd indices, so $\\sum_n x[n]=5+2\\cdot5=15$.'],
 ['Where the argument doubled','$G$ carries $\\sin(5\\omega/2)/\\sin(\\omega/2)$ and $Y_{(2)}$ carries $\\sin(5\\omega)/\\sin\\omega$: the same expression with $\\omega$ replaced by $2\\omega$. Writing $\\sin\\omega$ in the denominator of $G$, $\\sin(5\\omega/2)/\\sin\\omega$, is wrong for both sequences. It puts a pole at $\\omega=\\pi$, where the true value is $G(e^{j\\pi})=\\sin(5\\pi/2)/\\sin(\\pi/2)=1=\\sum_{n=-2}^{2}(-1)^{n}$; it gives $1000.0$ at $\\omega=\\pi-10^{-3}$. At $\\pi/2$ it gives $-0.7071$ against the true $\\sin(5\\pi/4)/\\sin(\\pi/4)=-1.0000$, and it does not even repeat every $2\\pi$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|G(e^{j\\omega})|',
    yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
   a.curve(w=>Math.abs(dirich(wrap(w),2)),{color:C.in,n:6000}); mark(a,5.72); return a.svg();},
  cap:'$|G(e^{j\\omega})|$: peak 5, and the finite value 1 at $\\omega=\\pm\\pi$.'},
 {svg:()=>{const a=wax({w:640,h:190,yr:[-0.75,6.5],xlabel:'\\omega',ylabel:'|Y_{(2)}(e^{j\\omega})|',
    pad:{l:70,r:26,t:30,b:38},yticksOverride:[0,1,2.5,5],ytickfmt:v=>v.toFixed(2)});
   a.curve(w=>Math.abs(dirich(wrap(2*w),2)),{color:C.mid,n:8000}); mark(a,5.72); return a.svg();},
  cap:'$|Y_{(2)}(e^{j\\omega})|$: the same picture twice inside every $2\\pi$, with the same peak 5.'}
]},

{t:'h3', text:'First difference'},
{t:'p', text:'Discrete time has a <b>first difference</b>, $x[n]-x[n-1]$, not a derivative: a sequence has no values between $n$ and $n+1$, so there is no limit to take. Linearity and the time shift with $n_0=1$ give its transform, $X(e^{j\\omega})-e^{-j\\omega}X(e^{j\\omega})$:'},
{t:'eq', tex:'x[n]-x[n-1]\\;\\longleftrightarrow\\;\\bigl(1-e^{-j\\omega}\\bigr)X(e^{j\\omega}).'},
{t:'p', text:'Balance the factor about its middle exponent to read its size: $1-e^{-j\\omega}=e^{-j\\omega/2}\\bigl(e^{j\\omega/2}-e^{-j\\omega/2}\\bigr)=2j\\,e^{-j\\omega/2}\\sin(\\omega/2)$, so $|1-e^{-j\\omega}|=2|\\sin(\\omega/2)|$. The factor is $0$ at $\\omega=0$ and $2$ at $\\omega=\\pm\\pi$. A first difference removes the average and lifts the fastest changes. If $X(e^{j\\pi})=0.5$, then $Y(e^{j\\pi})=(1-e^{-j\\pi})\\cdot0.5=2\\cdot0.5=1$.'},
{t:'box', kind:'err', hd:'Two names that must not be exchanged',
 html:'Discrete time has a <b>difference</b>, not a derivative, and its factor is $1-e^{-j\\omega}$ rather than $j\\omega$. The <b>differentiation</b> in this chapter is in frequency, and it is a genuine derivative because $\\omega$ is continuous. Calling the first difference a derivative merges the continuous and discrete cases at the point where they differ.'},

{t:'h3', text:'Accumulation'},
{t:'p', text:'The running sum $\\sum_{m=-\\infty}^{n}x[m]$ is the convolution of $x$ with the unit step, because $u[n-m]$ is 1 exactly for $m\\le n$: $\\sum_m x[m]u[n-m]=\\sum_{m\\le n}x[m]$. The unit step has the pair'},
{t:'eq', tex:'u[n]\\;\\longleftrightarrow\\;\\frac{1}{1-e^{-j\\omega}}+\\pi\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-2\\pi k).'},
{t:'p', text:'Its two parts have separate reasons. The first difference of $u[n]$ is $\\delta[n]$, so by the difference property $(1-e^{-j\\omega})U(e^{j\\omega})=1$, which fixes $U=1/(1-e^{-j\\omega})$ wherever $1-e^{-j\\omega}\\neq0$. The difference cannot see a constant, and the step has the average value $\\tfrac12$. The constant pair $1\\leftrightarrow2\\pi\\sum_k\\delta(\\omega-2\\pi k)$ gives that average the impulse train of weight $2\\pi\\cdot\\tfrac12=\\pi$. By the convolution property (Section 6.5) the transform of the running sum is $X(e^{j\\omega})U(e^{j\\omega})$. In the impulse part, each impulse at $2\\pi k$ keeps only the value $X(e^{j2\\pi k})=X(e^{j0})$, by periodicity:'},
{t:'eqbox', cap:'Accumulation',
 tex:['\\sum_{m=-\\infty}^{n}x[m]\\;\\longleftrightarrow\\;\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-2\\pi k)'],
 after:'Accumulation undoes differencing, so their factors are reciprocals, and the impulse train is the part that differencing destroys. The running sum settles at $X(e^{j0})=\\sum_n x[n]$, and a constant has an impulse at every multiple of $2\\pi$. Where the sequence sums to zero the term vanishes. It is the discrete-time counterpart of the $\\pi X(0)\\delta(\\omega)$ in the integration property of Chapter 5, and it is needed for the same reason: $1-e^{-j\\omega}$ is zero at $\\omega=0$.'},
{t:'p', text:'Example: for $x[n]=(0.5)^{n}u[n]$ the running sum at $n\\ge0$ is a finite geometric sum, $\\sum_{m=0}^{n}(0.5)^{m}=\\frac{1-(0.5)^{n+1}}{1-0.5}=2-(0.5)^{n}$. It settles at $2=1/(1-0.5)=X(e^{j0})$. For $x[n]=(0.75)^{n}u[n]$, $X(e^{j0})=1/(1-0.75)=4$, so each impulse in the transform of the running sum has weight $\\pi X(e^{j0})=4\\pi$.'},

{t:'h3', text:'Differentiation in frequency'},
{t:'p', text:'Differentiate the analysis sum term by term in $\\omega$. Only $e^{-j\\omega n}$ depends on $\\omega$, and $\\frac{\\d}{\\d\\omega}e^{-j\\omega n}=-jn\\,e^{-j\\omega n}$:'},
{t:'eq', tex:'\\frac{\\d X(e^{j\\omega})}{\\d\\omega}=\\sum_{n}x[n](-jn)e^{-j\\omega n}=-j\\sum_{n}n\\,x[n]e^{-j\\omega n}\\qquad\\Longrightarrow\\qquad \\sum_{n}n\\,x[n]e^{-j\\omega n}=j\\,\\frac{\\d X(e^{j\\omega})}{\\d\\omega}.'},
{t:'p', text:'The last step multiplies both sides by $j$ and uses $j\\cdot(-j)=1$. So $n\\,x[n]\\leftrightarrow j\\,\\d X(e^{j\\omega})/\\d\\omega$. Apply it to $a^{n}u[n]$. The chain rule on $(1-ae^{-j\\omega})^{-1}$ gives'},
{t:'eq', tex:'\\begin{aligned}\\frac{\\d}{\\d\\omega}\\bigl(1-ae^{-j\\omega}\\bigr)^{-1}&=-\\bigl(1-ae^{-j\\omega}\\bigr)^{-2}\\cdot\\bigl(jae^{-j\\omega}\\bigr)=\\frac{-jae^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\\\n\\,a^{n}u[n]\\;&\\longleftrightarrow\\;j\\cdot\\frac{-jae^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}=\\frac{ae^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\qquad|a|<1.\\end{aligned}'},
{t:'p', text:'Check at $\\omega=0$ with $a=0.5$: the pair gives $0.5/(1-0.5)^{2}=0.5/0.25=2$, and the sum of the samples is $\\sum_{n\\ge0}n(0.5)^{n}=2$ as well.'},

{t:'h3', text:'Parseval\'s relation'},
{t:'p', text:'Start from the energy sum, write $|x[n]|^{2}=x[n]x^{*}[n]$, and replace $x^{*}[n]$ by the conjugate of its synthesis integral. Conjugating the integral conjugates $X$ and turns $e^{j\\omega n}$ into $e^{-j\\omega n}$. Then swap the sum and the integral; the bracket that remains is the analysis sum, which is $X(e^{j\\omega})$:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{n}|x[n]|^{2}&=\\sum_{n}x[n]\\,x^{*}[n]=\\sum_{n}x[n]\\,\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})e^{-j\\omega n}\\,\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})\\Bigl[\\sum_{n}x[n]e^{-j\\omega n}\\Bigr]\\d\\omega\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X^{*}(e^{j\\omega})X(e^{j\\omega})\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega.\\end{aligned}'},
{t:'p', text:'Energy is normalised to $R=1\\ \\Omega$, as in Chapter 1. The quantity $|X(e^{j\\omega})|^{2}$ is the energy-density spectrum. Integrating it over one period and dividing by $2\\pi$ gives the total energy; integrating over part of a period gives the energy in that band. Both the one-period range and the factor $\\frac{1}{2\\pi}$ are needed: over all $\\omega$ the integral diverges, and without $\\frac{1}{2\\pi}$ it gives $2\\pi$ times the energy. For $x[n]=\\delta[n]+\\delta[n-1]$ the integral must equal $1^{2}+1^{2}=2$.'},
{t:'p', text:'Two checks in both domains. For $x[n]=a^{n}u[n]$ with $a=\\tfrac12$, the time side is a geometric series with first term 1 and ratio $a^{2}=\\tfrac14$: $\\sum_{n\\ge0}(\\tfrac14)^{n}=1/(1-\\tfrac14)=\\tfrac43$. On the frequency side, $|X|^{2}=1/(1-2a\\cos\\omega+a^{2})$ from Example 6.3. Example 6.4 shows that $(1-a^{2})/(1-2a\\cos\\omega+a^{2})$ is the transform of $a^{|n|}$, so $|X|^{2}$ is that transform divided by $1-a^{2}$, and its synthesis integral at $n=0$ returns $a^{|0|}=1$:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega&=\\frac{1}{1-a^{2}}\\cdot\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}\\,\\d\\omega\\\\&=\\frac{1}{1-a^{2}}\\cdot1=\\frac{1}{1-\\tfrac14}=\\tfrac43.\\end{aligned}'},
{t:'p', text:'For the rectangular pulse with $N_1=2$, the time side is five samples of $1^{2}$, so 5. On the frequency side, expand the squared modulus as a double sum and integrate term by term:'},
{t:'eq', tex:'\\begin{aligned}\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\Bigl|\\sum_{n=-2}^{2}e^{-j\\omega n}\\Bigr|^{2}\\d\\omega&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\sum_{n=-2}^{2}\\sum_{m=-2}^{2}e^{-j\\omega(n-m)}\\,\\d\\omega\\\\&=\\sum_{n=-2}^{2}\\sum_{m=-2}^{2}\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}e^{-j\\omega(n-m)}\\,\\d\\omega=5.\\end{aligned}'},
{t:'p', text:'For an integer $p\\neq0$, $\\int_{-\\pi}^{\\pi}e^{-j\\omega p}\\d\\omega=\\bigl[e^{-j\\omega p}/(-jp)\\bigr]_{-\\pi}^{\\pi}=\\frac{e^{-j\\pi p}-e^{j\\pi p}}{-jp}=\\frac{2\\sin(\\pi p)}{p}=0$; for $p=0$ the integral is $2\\pi$. So of the 25 terms only the 5 with $m=n$ survive, each contributing 1. Likewise $(0.8)^{n}u[n]$ has energy $\\sum_{n\\ge0}(0.64)^{n}=1/(1-0.64)=2.78.$'},

{t:'h3', text:'Duality'},
{t:'p', text:'There is no duality inside the discrete-time transform pair. The analysis equation is a sum over an integer and the synthesis equation an integral over a continuous variable, so no renaming turns one into the other. Two dualities do hold.'},
{t:'p', text:'<b>The discrete-time series.</b> Both of its domains are discrete and both objects have period $N$, so the coefficients can be read as a sequence $a[n]$. Its own coefficients are $b_k=\\frac1N\\sum_{n=\\langle N\\rangle}a[n]e^{-jk(2\\pi/N)n}$. Compare the synthesis equation of $x$ at the index $-k$: $x[-k]=\\sum_{n=\\langle N\\rangle}a[n]e^{jn(2\\pi/N)(-k)}=\\sum_{n=\\langle N\\rangle}a[n]e^{-jk(2\\pi/N)n}$. The two sums are the same, so $b_k=\\frac1N x[-k]$:'},
{t:'eq', tex:'x[n]\\;\\longleftrightarrow\\;a_k\\qquad\\Longrightarrow\\qquad a[n]\\;\\longleftrightarrow\\;\\frac{1}{N}\\,x[-k].'},
{t:'p', text:'The impulse train with $N=8$ is the example. By Example 6.9 its coefficients are all $a_k=1/8=0.125$. Read as a sequence, the constant $1/8$ has as its coefficients the train itself, scaled by $1/8$. Likewise, $x[n]=1$ with $N=4$ has $a_0=1$ and $a_1=a_2=a_3=0$; the sequence $a[n]$ is then a unit sample every four indices, whose coefficients are $\\frac14x[-k]=\\frac14$ for every $k$.'},
{t:'p', text:'<b>The transform as a Fourier series.</b> $X(e^{j\\omega})$ is a $2\\pi$-periodic function of the continuous variable $\\omega$. In the analysis sum put $k=-n$. As $n$ runs over all integers, so does $k$:'},
{t:'eq', tex:'X(e^{j\\omega})=\\sum_{n}x[n]\\,e^{-j\\omega n}=\\sum_{k}x[-k]\\,e^{jk\\omega}.'},
{t:'p', text:'This is a continuous-time Fourier series in the variable $\\omega$, with period $2\\pi$, fundamental frequency 1 and coefficients $a_k=x[-k]$: the spectrum of a sequence is a periodic signal whose series coefficients are the sequence itself, reversed. As a check, take the $2\\pi$-periodic square wave in $\\omega$ equal to 1 for $|\\omega|\\le\\pi/2$ and zero over the rest of the period. Its coefficients come from the analysis integral over one period. The function is zero outside $|\\omega|\\le\\pi/2$, so the limits shrink, and for $k\\neq0$ the antiderivative of $e^{-jk\\omega}$ is $e^{-jk\\omega}/(-jk)$:'},
{t:'eq', tex:'\\begin{aligned}a_k&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{-jk\\omega}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}e^{-jk\\omega}\\,\\d\\omega=\\frac{1}{2\\pi}\\biggl[\\frac{e^{-jk\\omega}}{-jk}\\biggr]_{-\\pi/2}^{\\pi/2}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{e^{jk\\pi/2}-e^{-jk\\pi/2}}{jk}=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(k\\pi/2)}{jk}=\\frac{\\sin(k\\pi/2)}{k\\pi}.\\end{aligned}'},
{t:'p', text:'The fourth equality reverses the order of the two limit terms to absorb the minus sign, and the fifth uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. At $k=0$ the integrand is 1, so $a_0=\\frac{1}{2\\pi}\\cdot\\pi=\\tfrac12$. The list is $0.5$, $1/\\pi=0.3183$, $0$, $-1/(3\\pi)=-0.1061$ for $k=0,1,2,3$. The inverse transform of the same band is Example 6.6 with $W=\\pi/2$: $x[n]=\\sin(\\pi n/2)/(\\pi n)$ with $x[0]=\\tfrac12$, the same list of numbers. So $a_k=x[-k]$, and since this $x$ is even, $a_k=x[k]$ as well. In the same way, $X(e^{j\\omega})=3e^{-j2\\omega}$ belongs to $x[n]=3\\delta[n-2]$, and its only nonzero series coefficient is $a_{-2}=x[2]=3$.'},

/* ================================================================ 6.5 */
{t:'h2', num:'6.5', text:'Convolution and multiplication'},
{t:'eqbox', cap:'Convolution',
 tex:['y[n]=x[n]*h[n]\\;\\longleftrightarrow\\;Y(e^{j\\omega})=X(e^{j\\omega})H(e^{j\\omega})'],
 after:'Here $h$ is the impulse response of an LTI system and $H(e^{j\\omega})$ its frequency response. One system seen in frequency: a convolution sum becomes one product at each frequency.'},
{t:'p', text:'To prove it, put the convolution sum $y[n]=\\sum_k x[k]h[n-k]$ into the analysis sum, swap the order of the two sums, and change the index of the inner sum with $m=n-k$. For fixed $k$, as $n$ runs over all integers so does $m$:'},
{t:'eq', tex:'\\begin{aligned}Y(e^{j\\omega})&=\\sum_{n}\\Bigl[\\sum_{k}x[k]h[n-k]\\Bigr]e^{-j\\omega n}=\\sum_{k}x[k]\\sum_{n}h[n-k]e^{-j\\omega n}\\\\&=\\sum_{k}x[k]\\sum_{m}h[m]e^{-j\\omega(m+k)}=\\Bigl[\\sum_{k}x[k]e^{-j\\omega k}\\Bigr]\\Bigl[\\sum_{m}h[m]e^{-j\\omega m}\\Bigr]=X(e^{j\\omega})H(e^{j\\omega}).\\end{aligned}'},
{t:'p', text:'In the second line $e^{-j\\omega(m+k)}=e^{-j\\omega k}e^{-j\\omega m}$, and the factor $e^{-j\\omega k}$ does not depend on $m$, so it joins the outer sum. Swapping the sums is allowed when both sequences are absolutely summable. $X$ and $H$ repeat every $2\\pi$, so $Y$ does too: if $X(e^{j\\pi/2})=2$ and $H(e^{j\\pi/2})=0.4$, then $Y(e^{j5\\pi/2})=Y(e^{j\\pi/2})=0.8$.'},
{t:'p', text:'A product of complex numbers multiplies the moduli and adds the angles, so the property gives two separate statements:'},
{t:'eq', tex:'|Y(e^{j\\omega})|=|X(e^{j\\omega})|\\,|H(e^{j\\omega})|,\\qquad \\angle Y(e^{j\\omega})=\\angle X(e^{j\\omega})+\\angle H(e^{j\\omega}).'},
{t:'box', kind:'err', hd:'No bars around an equation',
 html:'Writing $|Y=XH|$ puts modulus bars around an equation, which is not an operation on anything. Write the magnitude line and the phase line separately, and declare both pairs $x\\leftrightarrow X$ and $h\\leftrightarrow H$ before the conclusion.'},
{t:'ex', hd:'Example 6.13 — convolving two exponentials', rows:[
 ['Given','$x[n]=a^{n}u[n]$ and $h[n]=b^{n}u[n]$, with $|a|<1$, $|b|<1$ and $a\\neq b$.'],
 ['Find','$y[n]=x[n]*h[n]$.'],
 ['Method','Use the convolution property because the required output is a time convolution. Multiply the transforms, then use partial fractions so that each term matches the one-sided exponential pair. Write $z=e^{-j\\omega}$ as an algebraic variable. Then $Y=1/((1-az)(1-bz))$ is a rational function of $z$, and setting $z=1/a$ is algebra in $z$ only, not a claim that $e^{-j\\omega}$ takes that value.'],
 ['Solution','By Example 6.3, $X=1/(1-az)$ and $H=1/(1-bz)$ with $z=e^{-j\\omega}$, so the convolution property gives $$Y=X\\,H=\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz}.$$ Cover-up: to find $A$, cover the factor $(1-az)$ and evaluate the rest at $z=1/a$, the value that makes that factor zero. To find $B$, cover $(1-bz)$ and evaluate at $z=1/b$: $$\\begin{gathered}A=\\frac{1}{1-bz}\\bigg|_{z=1/a}=\\frac{1}{1-b/a}=\\frac{a}{a-b},\\\\[3pt]B=\\frac{1}{1-az}\\bigg|_{z=1/b}=\\frac{1}{1-a/b}=\\frac{b}{b-a}=-\\frac{b}{a-b}.\\end{gathered}$$ Check by recombining: $A(1-bz)+B(1-az)=\\frac{a-abz-b+abz}{a-b}=1$, as required. Each fraction is the one-sided exponential pair, so inverting term by term: $$y[n]=A\\,a^{n}u[n]+B\\,b^{n}u[n]=\\frac{a\\cdot a^{n}-b\\cdot b^{n}}{a-b}\\,u[n]=\\frac{1}{a-b}\\left[a^{\\,n+1}-b^{\\,n+1}\\right]u[n].$$'],
 ['Condition','Both coefficients divide by $a-b$, so the route requires $a\\neq b$. At $a=b$ the two factors are the same, and Section 6.6 derives the pair that replaces this expansion.'],
 ['Check','$a=\\tfrac12$, $b=\\tfrac14$: $a-b=\\tfrac14$, so $y[n]=4\\bigl[(\\tfrac12)^{n+1}-(\\tfrac14)^{n+1}\\bigr]u[n]$, giving $y[0]=4(\\tfrac12-\\tfrac14)=1$, $y[1]=4(\\tfrac14-\\tfrac1{16})=0.75$, $y[2]=4(\\tfrac18-\\tfrac1{64})=0.4375$, $y[3]=4(\\tfrac1{16}-\\tfrac1{256})=0.234375$. Direct convolution gives $y[0]=x[0]h[0]=1$ and $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac14+\\tfrac12=0.75$. The first value must be $x[0]h[0]=1$ for any two such sequences. The magnitude $|Y|=|X|\\,|H|$ is largest at $\\omega=0$, where $e^{-j\\omega}=1$: $\\frac{1}{1-\\frac12}\\cdot\\frac{1}{1-\\frac14}=2\\cdot\\frac43=\\frac83=2.6667$. It is smallest at $\\omega=\\pi$, where $e^{-j\\pi}=-1$: $\\frac{1}{1+\\frac12}\\cdot\\frac{1}{1+\\frac14}=\\frac23\\cdot\\frac45=\\frac{8}{15}=0.5333$.'],
 ['Reading','Every one-sided exponential carries its $u[n]$. Without the step, $(\\tfrac12)^{n}$ is defined for negative $n$ too, grows without bound as $n\\to-\\infty$, and has no transform.']
]},

{t:'ex', hd:'Example 6.14 — a cascade of ideal low-pass filters', rows:[
 ['Given','$H_1$ is ideal low-pass with cutoff $\\pi/2$ and $H_2$ is ideal low-pass with cutoff $\\pi/4$, in cascade, with input $x[n]=\\delta[n]$.'],
 ['Find','The overall frequency response $H$ and the output $y[n]$.'],
 ['Method','A cascade convolves the impulse responses, so the frequency responses multiply. Multiply the two bands, then invert the product with Example 6.6. Each band is 1 for $|\\omega|\\le W$ and 0 for $W<|\\omega|\\le\\pi$: the band edge belongs to one branch only.'],
 ['Solution','The product is 1 where both factors are 1, that is on $|\\omega|\\le\\pi/4$, and 0 elsewhere in the period: $$H(e^{j\\omega})=H_1H_2=\\begin{cases}1,&|\\omega|\\le\\pi/4\\\\0,&\\pi/4<|\\omega|\\le\\pi.\\end{cases}$$ The input $\\delta[n]$ has $X=1$, so $Y=H$ and Example 6.6 with $W=\\pi/4$ gives $$y[n]=\\frac{\\sin(\\pi n/4)}{\\pi n},\\qquad y[0]=\\frac{\\pi/4}{\\pi}=\\frac14.$$'],
 ['Check','$y[0]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}H\\,\\d\\omega=\\frac{\\pi/2}{2\\pi}=\\frac14$, the band width $\\pi/2$ over $2\\pi$. The product commutes, so the order of the filters does not matter; the cascade keeps only the band both filters pass.']
]},
{t:'ex', hd:'Example 6.15 — a stepped spectrum through a filter', rows:[
 ['Given','$X(e^{j\\omega})=2$ for $|\\omega|\\le\\pi/4$, 1 for $\\pi/4<|\\omega|\\le3\\pi/4$, and 0 for $3\\pi/4<|\\omega|\\le\\pi$; $H$ is ideal low-pass with cutoff $\\pi/2$.'],
 ['Find','$Y(e^{j\\omega})$ and $y[n]$.'],
 ['Method','An LTI system gives $Y=XH$. Multiply the two spectra frequency by frequency, then write the result as a sum of ideal low-pass bands so that Example 6.6 inverts each one.'],
 ['Solution','$H$ is 1 for $|\\omega|\\le\\pi/2$ and 0 for $\\pi/2<|\\omega|\\le\\pi$. Multiplying band by band: for $|\\omega|\\le\\pi/4$, $Y=2\\cdot1=2$; for $\\pi/4<|\\omega|\\le\\pi/2$, $Y=1\\cdot1=1$; for $\\pi/2<|\\omega|\\le\\pi$, $Y=X\\cdot0=0$. Now write $Y$ as two stacked ideal bands, $Y=Y_1+Y_2$, with $Y_1=1$ on $|\\omega|\\le\\pi/2$ and $Y_2=1$ on $|\\omega|\\le\\pi/4$. The two add to 2 on the inner band and to 1 on the outer band, as required. By linearity and Example 6.6 with $W=\\pi/2$ and $W=\\pi/4$: $$\\begin{aligned}y[n]&=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}e^{j\\omega n}\\d\\omega+\\frac{1}{2\\pi}\\int_{-\\pi/4}^{\\pi/4}e^{j\\omega n}\\d\\omega\\\\&=\\frac{\\sin(\\pi n/2)}{\\pi n}+\\frac{\\sin(\\pi n/4)}{\\pi n},\\end{aligned}$$ with $y[0]=\\frac{\\pi/2}{\\pi}+\\frac{\\pi/4}{\\pi}=\\tfrac12+\\tfrac14=\\tfrac34$.'],
 ['Check','$y[0]$ must be the area of one period of $Y$ divided by $2\\pi$. That area is $2\\cdot\\frac{\\pi}{2}+1\\cdot\\frac{\\pi}{2}=\\frac{3\\pi}{2}$ (height 2 over a band of width $\\pi/2$, height 1 over two bands of width $\\pi/4$), and $\\frac{3\\pi}{2}/2\\pi=\\frac34$.']
]},

{t:'h3', text:'Multiplication is a periodic convolution'},
{t:'eqbox', cap:'Multiplication',
 tex:['z[n]=x[n]y[n]\\;\\longleftrightarrow\\;Z(e^{j\\omega})=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta'],
 after:'The integral runs over one period and both factors are $2\\pi$-periodic. That operation is a <b>periodic convolution</b>. An integral over all $\\theta$ would count the same overlap once in every period and diverge.'},
{t:'p', text:'To prove it, put the product into the analysis sum and replace $x[n]$ by its synthesis integral, with $\\theta$ as the integration variable so that it is not confused with $\\omega$. Then swap the sum and the integral and combine the exponentials, $e^{j\\theta n}e^{-j\\omega n}=e^{-j(\\omega-\\theta)n}$:'},
{t:'eq', tex:'\\begin{aligned}Z(e^{j\\omega})&=\\sum_{n}x[n]y[n]e^{-j\\omega n}=\\sum_{n}\\left[\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})e^{j\\theta n}\\,\\d\\theta\\right]y[n]e^{-j\\omega n}\\\\&=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\Bigl[\\sum_{n}y[n]e^{-j(\\omega-\\theta)n}\\Bigr]\\d\\theta=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})\\,Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta.\\end{aligned}'},
{t:'p', text:'The bracket is the analysis sum of $y$ at frequency $\\omega-\\theta$. Read the formula one frequency at a time: for a chosen $\\omega$, slide $Y$ so that it is centred at $\\omega$, multiply it by $X$ over one period, and divide the area of the product by $2\\pi$. That is one value of $Z$. Moving $\\omega$ by $2\\pi$ moves $Y$ by one whole period, so the overlap does not change:'},
{t:'eq', tex:'Z\\bigl(e^{j(\\omega+2\\pi)}\\bigr)=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y\\bigl(e^{j(\\omega-\\theta+2\\pi)}\\bigr)\\d\\theta=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta=Z(e^{j\\omega}).'},
{t:'p', text:'At $\\omega=0$ the synthesis equation gives a quick check: $\\frac{1}{2\\pi}\\int_{2\\pi}Z(e^{j\\omega})\\,\\d\\omega=z[0]=x[0]\\,y[0]$. If $x[0]=2$ and $y[0]=0.5$, that integral is 1.'},
{t:'ex', hd:'Example 6.16 — spectral overlap at a band edge', rows:[
 ['Given','$x[n]=\\dfrac{\\sin(3\\pi n/4)}{\\pi n}$ and $y[n]=\\dfrac{\\sin(\\pi n/2)}{\\pi n}$. By Example 6.6 these are bands of height 1 with half-widths $3\\pi/4$ and $\\pi/2$, repeated every $2\\pi$.'],
 ['Find','$Z(e^{j\\omega})$ for $z[n]=x[n]y[n]$.'],
 ['Method','First convolve the two bands as functions on the line. Then add the copies centred at multiples of $2\\pi$ that reach into the period, because the periodic convolution counts them.'],
 ['Solution','The integrand $X(\\theta)Y(\\omega-\\theta)$ is 1 where both factors are 1 and 0 elsewhere, so the integral is the length of the overlap of $|\\theta|\\le3\\pi/4$ with $\\omega-\\pi/2\\le\\theta\\le\\omega+\\pi/2$. For $|\\omega|\\le\\pi/4$ the second interval lies inside the first, so the overlap is its full width $\\pi$ and the value is $\\frac{1}{2\\pi}\\cdot\\pi=\\frac12$. For $\\pi/4\\le|\\omega|\\le5\\pi/4$ the overlap runs from $|\\omega|-\\pi/2$ to $3\\pi/4$, of length $5\\pi/4-|\\omega|$, so the value is $(5\\pi/4-|\\omega|)/(2\\pi)$, falling to zero at $|\\omega|=5\\pi/4$. The result on the line is a trapezoid of height $\\frac12$, flat on $|\\omega|\\le\\pi/4$. Since $5\\pi/4>\\pi$, it reaches beyond one period, and near $\\omega=\\pm\\pi$ the copy centred at $\\pm2\\pi$ overlaps it. The values add: $$\\begin{gathered}Z(e^{j0})=\\tfrac12,\\qquad Z(e^{j3\\pi/4})=\\frac{5\\pi/4-3\\pi/4}{2\\pi}=\\tfrac14,\\\\[3pt] Z(e^{j\\pi})=\\underbrace{\\frac{5\\pi/4-\\pi}{2\\pi}}_{\\text{own copy}}+\\underbrace{\\frac{5\\pi/4-\\pi}{2\\pi}}_{\\text{next copy}}=\\tfrac18+\\tfrac18=\\tfrac14.\\end{gathered}$$ The copy centred at $2\\pi$ is at the same distance $\\pi$ from $\\omega=\\pi$ as the own copy, so it gives the same $\\tfrac18$. Between $3\\pi/4$ and $\\pi$ one copy falls as the other rises, so $Z$ falls in a straight line from $\\frac12$ at $\\pi/4$ to $\\frac14$ at $3\\pi/4$ and then stays at $\\frac14$ across $\\pm\\pi$.'],
 ['Check','By Example 6.6, $x[0]=\\frac{3\\pi/4}{\\pi}=\\tfrac34$ and $y[0]=\\frac{\\pi/2}{\\pi}=\\tfrac12$, so $z[0]=\\tfrac38=0.375$. On the frequency side, one period of $Z$ collects the whole area of one trapezoid, because the parts that spill past $\\pm\\pi$ are exactly the parts that the copies bring in. That area is the height $\\tfrac12$ times the mean of the top width $\\pi/2$ and the base width $5\\pi/2$: $\\tfrac12\\cdot\\tfrac{3\\pi}{2}=\\tfrac{3\\pi}{4}$, and $\\frac{3\\pi/4}{2\\pi}=\\tfrac38$, as required.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{const a=wax({w:640,h:220,yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),yticksOverride:[0,0.125,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
   for(let k=-2;k<=2;k++) a.curve(w=>rectConv(w-2*PI*k,3*PI/4,PI/2),{color:C.muted,n:4000,width:1.2,dash:'4 5'});
   a.curve(w=>perConv(w,3*PI/4,PI/2),{color:C.out,n:6000}); mark(a,0.665); return a.svg();},
  cap:'The dashed trapezoids are the copies; the solid curve is their sum. At $\\omega=\\pi$ the value doubles from $0.125$ to $0.25$.'},
 {svg:()=>{const a=wax({w:640,h:220,yr:[-0.16,0.78],xlabel:'\\omega',ylabel:'Z(e^{j\\omega})',
    xticksOverride:wTicks(-3*PI,3*PI,PI/2),yticksOverride:[0,0.25,0.5],ytickfmt:v=>v.toFixed(4)});
   a.curve(w=>perConv(w,PI/2,PI/2),{color:C.mid,n:6000}); mark(a,0.665); return a.svg();},
  cap:'Two equal bands of half-width $\\pi/2$: each copy is a triangle of peak $\\tfrac12$ that ends exactly at $\\pm\\pi$, so the copies do not overlap.'}
]},
{t:'p', text:'When do the copies overlap? On the line, the convolution of two bands of half-widths $W_X$ and $W_Y$ is nonzero for $|\\omega|<W_X+W_Y.$ The copies are centred $2\\pi$ apart, so two neighbours meet exactly when each reaches past the midpoint between them:'},
{t:'eq', tex:'\\text{copies overlap}\\iff W_X+W_Y>\\pi.'},
{t:'p', text:'If each copy ends inside its own period, periodic and ordinary convolution give the same values on that period. Bands of half-widths $\\pi/4$ and $\\pi/2$ reach only $3\\pi/4<\\pi$, so their copies stay apart; bands of $3\\pi/4$ and $\\pi/2$ reach $5\\pi/4>\\pi$ and overlap, as in Example 6.16. If $Y$ is narrowed to half-width $\\pi/4$ while $X$ keeps $3\\pi/4$, then at $\\omega=0$ the band of $Y$ lies inside $X$, the overlap is $\\pi/2$ wide and $Z(e^{j0})=\\frac{\\pi/2}{2\\pi}=\\tfrac14$.'},
{t:'box', kind:'warn', hd:'This overlap is not aliasing',
 html:'This overlap is between copies of a periodic spectrum, and it can happen for any product of sequences. Chapter 7 studies a different overlap, between replicas produced by sampling. Only the sampling overlap is called aliasing.'},

{t:'ex', hd:'Example 6.17 — multiplying by a cosine', rows:[
 ['Given','$X(e^{j\\omega})=1$ for $|\\omega|\\le\\pi/4$ and 0 for $\\pi/4<|\\omega|\\le\\pi$, repeated every $2\\pi$, and $y[n]=\\cos(\\omega_0n)$ with $\\omega_0=\\pi/3$.'],
 ['Find','$Z(e^{j\\omega})$ for $z[n]=x[n]y[n]$, the band edges, and the range of $\\omega_0$ for which the bands stay apart.'],
 ['Method','Write $Y$ as its impulse train, $\\pi\\sum_l[\\delta(\\omega-\\omega_0-2\\pi l)+\\delta(\\omega+\\omega_0-2\\pi l)]$. The periodic convolution integrates over one period, so choosing $-\\pi<\\theta\\le\\pi$ leaves only the two impulses with $l=0$, at $\\theta=\\pm\\pi/3$. Each impulse places a copy of $X$.'],
 ['Solution','Periodic convolution commutes, so put the impulse train first in the multiplication property and integrate over $-\\pi<\\theta\\le\\pi$. The sifting property evaluates $X$ at the two impulse positions: $$\\begin{aligned}Z(e^{j\\omega})&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}Y(e^{j\\theta})\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta\\\\&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\pi\\bigl[\\delta(\\theta-\\omega_0)+\\delta(\\theta+\\omega_0)\\bigr]X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\d\\theta\\\\&=\\frac{\\pi}{2\\pi}\\Bigl[X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)\\Bigr]\\\\&=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr).\\end{aligned}$$ The height $\\tfrac12$ of each copy comes from $\\frac{1}{2\\pi}\\cdot\\pi$. The upper band runs from $\\frac{\\pi}{3}-\\frac{\\pi}{4}=\\frac{\\pi}{12}$ to $\\frac{\\pi}{3}+\\frac{\\pi}{4}=\\frac{7\\pi}{12}$, and the mirror copy covers $-7\\pi/12\\le\\omega\\le-\\pi/12$.'],
 ['Range','The upper band is $[\\omega_0-\\pi/4,\\ \\omega_0+\\pi/4]$ and its mirror is $[-\\omega_0-\\pi/4,\\ -\\omega_0+\\pi/4]$. They stay apart at $\\omega=0$ when $\\omega_0-\\pi/4\\ge-\\omega_0+\\pi/4$, that is $\\omega_0\\ge\\pi/4$. The mirror copy of the next period is centred at $2\\pi-\\omega_0$, so it starts at $2\\pi-\\omega_0-\\pi/4$. It stays clear of the upper band when $2\\pi-\\omega_0-\\pi/4\\ge\\omega_0+\\pi/4$, that is $\\omega_0\\le3\\pi/4$. So the bands stay apart for $\\pi/4\\le\\omega_0\\le3\\pi/4$. A smaller $\\omega_0$ makes them overlap at $\\omega=0$, a larger one at $\\omega=\\pm\\pi$.'],
 ['Check','$z[0]=x[0]\\cos0=\\frac{\\pi/4}{\\pi}\\cdot1=\\tfrac14$. From $Z$: two bands of height $\\tfrac12$ and width $\\tfrac{\\pi}{2}$ have area $\\tfrac{\\pi}{2}$ per period, and $\\frac{\\pi/2}{2\\pi}=\\tfrac14$.']
]},

{t:'h3', text:'Seeing a cosine through a window'},
{t:'p', text:'A measured record is always finite. Keep $L$ samples of a cosine: $x[n]=\\cos(\\omega_0n)\\,w[n]$, where $w[n]=1$ for $0\\le n\\le L-1$ is the rectangular window of Section 6.1, with transform $W(e^{j\\omega})$. By Euler\'s relation, $x[n]=\\tfrac12e^{j\\omega_0n}w[n]+\\tfrac12e^{-j\\omega_0n}w[n]$, and the frequency-shift property moves $W$ to $\\pm\\omega_0$:'},
{t:'eq', tex:'X(e^{j\\omega})=\\tfrac12\\,W\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12\\,W\\bigl(e^{j(\\omega+\\omega_0)}\\bigr),\\qquad |W(e^{j\\omega})|=\\left|\\frac{\\sin(\\omega L/2)}{\\sin(\\omega/2)}\\right|.'},
{t:'p', text:'The multiplication property gives the same result, because the cosine\'s impulses of weight $\\pi$ sift out two copies of $W$ of height $\\frac{1}{2\\pi}\\cdot\\pi=\\frac12$. The endless cosine has two lines at $\\pm\\omega_0$. The kept part has two copies of $W$ instead. Each line becomes a main lobe, whose first zeros are at $\\pm2\\pi/L$ from its centre, so it is $4\\pi/L$ wide. The side lobes of $W$ spread a little of the cosine into every other frequency. This spreading is called <b>leakage</b>. The main lobe is $\\pi/4$ wide for $L=16$ and half as wide, $\\pi/8$, for $L=32$. Near its centre each copy has height $\\frac12L$, so $\\frac{2}{L}|X|$ is close to 1 at $\\pm\\omega_0$ when the copies are well apart.'},
{t:'fig', svg:()=>{const L=16, w0=PI/4, x=D(n=>Math.cos(w0*n),0,L-1).map(p=>p[1]);
  const a=wax({h:220,yr:[-0.1,1.45],xlabel:'\\omega',ylabel:'\\tfrac{2}{L}\\,|X(e^{j\\omega})|',yticksOverride:[0,0.5,1],ytickfmt:v=>String(v),pad:{l:70,r:26,t:30,b:38}});
  for(let k=-1;k<=1;k++) for(const s of [1,-1]) a.poly([[s*w0+2*PI*k,0],[s*w0+2*PI*k,1.15]],{color:C.in,width:1,dash:'3 4'});
  a.curve(w=>2/L*mag(x,w),{color:C.out,n:4000}); mark(a,1.3); return a.svg();},
 cap:'$\\cos(\\pi n/4)$ kept for $L=16$ samples. The dashed lines mark $\\pm\\pi/4$ and their copies, where the endless cosine has its impulses. Each line has become a main lobe $\\pi/4$ wide with side lobes around it.'},
{t:'p', text:'A softer window trades width for leakage. The <b>Hann window</b> is $w[n]=\\sin^{2}(\\pi n/L)$ for $0\\le n\\le L-1$ and 0 elsewhere. By $\\sin^{2}\\theta=\\tfrac12(1-\\cos2\\theta)$ it equals $\\tfrac12-\\tfrac12\\cos(2\\pi n/L)$ on the window, which is the rectangular window times a constant plus a cosine. The same Euler and frequency-shift steps, with $\\omega_0=2\\pi/L$, give'},
{t:'eq', tex:'W_{\\text{H}}(e^{j\\omega})=\\tfrac12W(e^{j\\omega})-\\tfrac14W\\bigl(e^{j(\\omega-2\\pi/L)}\\bigr)-\\tfrac14W\\bigl(e^{j(\\omega+2\\pi/L)}\\bigr).'},
{t:'p', text:'$W$ is zero at every nonzero multiple of $2\\pi/L$ inside the period. At $\\omega=2\\pi/L$ the three terms are $\\tfrac12W$ at $2\\pi/L$, which is zero, $-\\tfrac14W$ at $0$, which is $-\\tfrac14L$, and $-\\tfrac14W$ at $4\\pi/L$, which is zero. So $|W_{\\text{H}}|=L/4$ there: the Hann window has no zero at $2\\pi/L$. At $\\omega=4\\pi/L$ the three arguments are $4\\pi/L$, $2\\pi/L$ and $6\\pi/L$, all zeros of $W$, so $W_{\\text{H}}=0$. The first zero moves out to $4\\pi/L$ and the main lobe doubles to $8\\pi/L$. In return the three shifted copies partly cancel away from the main lobe, and the highest side lobe drops from about $-13$ dB for the rectangular window to about $-31$ dB for the Hann window, measured against the peak.'},
{t:'figrow', n:2, items:[
 {svg:()=>{const L=32, xr=n=>Math.cos(PI*n/4)+0.01*Math.cos(21*PI*n/32);
   const x=D(n=>xr(n),0,L-1).map(p=>p[1]); let pk=0; for(let i=0;i<=400;i++) pk=Math.max(pk,mag(x,PI/4+(i-200)*PI/6400));
   const dB=w=>Math.max(20*Math.log10(Math.max(mag(x,w)/pk,1e-12)),-100)+100;
   const a=P.Axes({w:640,h:230,xr:[-2.2*PI,2.2*PI],yr:[-4,114],yticksLeft:true,xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|\\;(\\text{dB})',
     pad:{l:62,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,yticksOverride:[20,40,60,80,100],ytickfmt:v=>String(v-100)});
   mark(a,108); a.curve(dB,{color:C.out,n:5200,width:1.6});
   a.poly([[21*PI/32,0],[21*PI/32,87]],{color:C.muted,width:1,dash:'3 4'}); return a.svg();},
  cap:'Rectangular window, $L=32$. The weak cosine at the dashed line $21\\pi/32$ lies below the side lobes of the strong one.'},
 {svg:()=>{const L=32, xr=n=>Math.cos(PI*n/4)+0.01*Math.cos(21*PI*n/32);
   const x=D(n=>xr(n)*hann(n,L),0,L-1).map(p=>p[1]); let pk=0; for(let i=0;i<=400;i++) pk=Math.max(pk,mag(x,PI/4+(i-200)*PI/6400));
   const dB=w=>Math.max(20*Math.log10(Math.max(mag(x,w)/pk,1e-12)),-100)+100;
   const a=P.Axes({w:640,h:230,xr:[-2.2*PI,2.2*PI],yr:[-4,114],yticksLeft:true,xlabel:'\\omega',ylabel:'|X(e^{j\\omega})|\\;(\\text{dB})',
     pad:{l:62,r:26,t:30,b:38},xticksOverride:wTicks(-2*PI,2*PI,PI),xtickfmt:piTick,yticksOverride:[20,40,60,80,100],ytickfmt:v=>String(v-100)});
   mark(a,108); a.curve(dB,{color:C.out,n:5200,width:1.6});
   a.poly([[21*PI/32,0],[21*PI/32,87]],{color:C.muted,width:1,dash:'3 4'}); return a.svg();},
  cap:'Hann window, $L=32$. The main lobes are wider, the side lobes much lower, and the weak cosine shows as its own peak.'}
]},
{t:'p', text:'The figures use $x[n]=\\cos(\\pi n/4)+0.01\\cos(21\\pi n/32)$ kept for $L=32$ samples, in dB against the strong peak. The second cosine is $20\\log_{10}0.01=-40$ dB weaker than the first. Under the rectangular window the side lobes of the strong cosine near $\\omega_2=21\\pi/32$ are near $-21$ dB, far above $-40$ dB, and hide the weak peak. The Hann side lobes there are much lower, and the weak cosine appears. If the weak cosine is made ten times weaker still, $-60$ dB, the Hann side lobes near $\\omega_2$, at about $-54$ dB, hide it again.'},

{t:'h3', text:'Spectrum over time'},
{t:'p', text:'A long sequence whose content changes, such as music or speech, is better described by a sequence of spectra than by one. Slide a window of $L$ samples along the sequence and take the transform of each piece:'},
{t:'eq', tex:'X_m(e^{j\\omega})=\\sum_{n=m}^{m+L-1}x[n]\\,w[n-m]\\,e^{-j\\omega n}.'},
{t:'p', text:'This is the analysis sum of the windowed piece that starts at $n=m$. Drawing $|X_m(e^{j\\omega})|$ as a column of colours for each start $m$, side by side, gives a <b>spectrogram</b>: time runs to the right and frequency upward. For a real $x$, $|X_m|$ is even in $\\omega$ and repeats every $2\\pi$, so $0\\le\\omega\\le\\pi$ is enough; this is the one kind of figure in the chapter drawn over less than a period. The window sets a trade-off. A Hann window of $L=32$ has a main lobe $8\\pi/32=\\pi/4$ wide. With $L=64$ the main lobe is $\\pi/8$ and the bands are narrower, but each window spans a change of note in more columns, so the map blurs more in time.'},
{t:'fig', svg:()=>{const ROWS=48, ref=LS/4;
  const a=P.Axes({w:700,h:250,xr:[-4,NS+4],yr:[0,PI],xlabel:'n',ylabel:'\\omega',pad:{l:56,r:26,t:30,b:38},
    yticksOverride:[0,PI/4,PI/2,3*PI/4,PI],ytickfmt:piTick,xtarget:8,grid:false});
  const cells=[];
  for(let m=0;m<=NS-LS;m+=HOP){ const x=[]; for(let i=0;i<LS;i++) x.push(tones(m+i)*hann(i,LS));
    const c=m+LS/2, xa=a.sx(c-HOP/2), xb=a.sx(c+HOP/2);
    for(let r=0;r<ROWS;r++){ const d=20*Math.log10(Math.max(mag(x,(r+0.5)*PI/ROWS,m)/ref,1e-9));
      const op=Math.max(0,Math.min(1,1+d/30)); if(op<=0.02) continue;
      const ya=a.sy((r+1)*PI/ROWS), yb=a.sy(r*PI/ROWS);
      cells.push(`<rect x="${xa.toFixed(2)}" y="${ya.toFixed(2)}" width="${(xb-xa).toFixed(2)}" height="${(yb-ya).toFixed(2)}" fill="${C.in}" fill-opacity="${op.toFixed(3)}"/>`); } }
  a.under('<g shape-rendering="crispEdges">'+cells.join('')+'</g>');
  for(let k=1;k<4;k++) a.vline(k*SEG-0.5,{color:C.muted,opacity:.55});
  return a.svg();},
 cap:'Spectrogram of four notes of 48 samples, each a pair of tones: $0.15\\pi$ and $0.55\\pi$, then $0.35\\pi$ and $0.80\\pi$, then $0.15\\pi$ and $0.80\\pi$, then $0.35\\pi$ and $0.55\\pi$. Hann window, $L=32$, a new column every 8 samples; stronger colour is a larger magnitude, over a range of 30 dB. Each note shows as two bands, and the columns whose window spans two notes are blurred.'},

/* ================================================================ 6.6 */
{t:'h2', num:'6.6', text:'Difference equations'},
{t:'p', text:'Transform both sides of a linear constant-coefficient difference equation. Linearity acts term by term, and the time-shift property turns each $y[n-k]$ into $e^{-j\\omega k}Y(e^{j\\omega})$ and each $x[n-k]$ into $e^{-j\\omega k}X(e^{j\\omega})$. The transforms $Y$ and $X$ do not depend on $k$, so they come out of the sums:'},
{t:'eqbox', cap:'Frequency response of a difference equation',
 tex:['\\sum_{k=0}^{N}a_k\\,y[n-k]=\\sum_{k=0}^{M}b_k\\,x[n-k]',
      'Y(e^{j\\omega})\\sum_{k=0}^{N}a_k e^{-j\\omega k}=X(e^{j\\omega})\\sum_{k=0}^{M}b_k e^{-j\\omega k}',
      'H(e^{j\\omega})=\\frac{Y(e^{j\\omega})}{X(e^{j\\omega})}=\\frac{\\sum_{k=0}^{M}b_k e^{-j\\omega k}}{\\sum_{k=0}^{N}a_k e^{-j\\omega k}}'],
 after:'The last line divides both sides by $X(e^{j\\omega})$ and by the denominator sum. $H$ is a ratio of polynomials in $e^{-j\\omega}$. The impulse response of the recursion is now available without running it: factor the denominator, split into partial fractions, and invert each piece with the exponential pair. $H(e^{j\\omega})$ exists only for a stable system, $\\sum_n|h[n]|<\\infty$; in the examples below every factor has $|a|<1$. For instance, $y[n]-\\tfrac12y[n-1]=x[n]+x[n-1]$ has $H(e^{j\\omega})=(1+e^{-j\\omega})/(1-\\tfrac12e^{-j\\omega})$, and at $\\omega=\\pi$, $e^{-j\\pi}=-1$ makes the numerator zero, so $H(e^{j\\pi})=0$.'},
{t:'ex', hd:'Example 6.18 — a second-order system', rows:[
 ['Given','The causal system $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$.'],
 ['Find','The frequency response and the impulse response.'],
 ['Method','The equation has constant coefficients, so the time-shift property turns it into algebra. Read the coefficients into the frequency-response ratio, factor the denominator, expand into partial fractions, and invert each term with the one-sided exponential pair.'],
 ['Solution','Here $a_0=1$, $a_1=-\\tfrac34$, $a_2=\\tfrac18$ and $b_0=2$. Transforming term by term: $$Y-\\tfrac34e^{-j\\omega}Y+\\tfrac18e^{-j2\\omega}Y=2X\\quad\\Longrightarrow\\quad H(e^{j\\omega})=\\frac{Y}{X}=\\frac{2}{1-\\tfrac34e^{-j\\omega}+\\tfrac18e^{-j2\\omega}}.$$ Write $z=e^{-j\\omega}$ as an algebraic variable and factor the quadratic $1-\\tfrac34z+\\tfrac18z^{2}$. Two factors $(1-\\alpha z)(1-\\beta z)$ expand to $1-(\\alpha+\\beta)z+\\alpha\\beta z^{2}$, so we need $\\alpha+\\beta=\\tfrac34$ and $\\alpha\\beta=\\tfrac18$; $\\alpha=\\tfrac12$ and $\\beta=\\tfrac14$ satisfy both, since $\\tfrac12+\\tfrac14=\\tfrac34$ and $\\tfrac12\\cdot\\tfrac14=\\tfrac18$. Hence $$H=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}=\\frac{A}{1-\\tfrac12z}+\\frac{B}{1-\\tfrac14z}.$$ Cover-up: cover $(1-\\tfrac12z)$ and set $z=2$, then cover $(1-\\tfrac14z)$ and set $z=4$: $$A=\\frac{2}{1-\\tfrac14z}\\bigg|_{z=2}=\\frac{2}{1-\\tfrac12}=4,\\qquad B=\\frac{2}{1-\\tfrac12z}\\bigg|_{z=4}=\\frac{2}{1-2}=-2.$$ Recombining, $4(1-\\tfrac14z)-2(1-\\tfrac12z)=4-z-2+z=2$, which matches the numerator. Each fraction is the pair $a^{n}u[n]\\leftrightarrow1/(1-ae^{-j\\omega})$ with $|a|<1$, so $$h[n]=4\\left(\\tfrac12\\right)^{n}u[n]-2\\left(\\tfrac14\\right)^{n}u[n].$$'],
 ['Check','$h[0]=4-2=2$, $h[1]=4\\cdot\\tfrac12-2\\cdot\\tfrac14=2-0.5=1.5$, $h[2]=4\\cdot\\tfrac14-2\\cdot\\tfrac1{16}=1-0.125=0.875$. Substituting into the equation with $x=\\delta$, which is zero for $n\\ge1$: $h[1]-\\tfrac34h[0]=1.5-1.5=0$ and $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0.875-1.125+0.25=0$, as required.'],
 ['Reading','Both factors have $|a|<1$, so both terms decay and the system is stable. At $\\omega=0$, $z=1$ and $|H|=2/(1-\\tfrac34+\\tfrac18)=2/\\tfrac38=5.3333$; at $\\omega=\\pi$, $z=-1$ and $|H|=2/(1+\\tfrac34+\\tfrac18)=2/\\tfrac{15}{8}=1.0667$. This recursion is a low-pass filter. The same factoring for $y[n]-\\tfrac56y[n-1]+\\tfrac16y[n-2]=x[n]$ gives $\\tfrac12$ and $\\tfrac13$, since $\\tfrac12+\\tfrac13=\\tfrac56$ and $\\tfrac12\\cdot\\tfrac13=\\tfrac16$, so its $h[n]$ is made of $(\\tfrac12)^{n}$ and $(\\tfrac13)^{n}$.']
]},

{t:'h3', text:'The repeated-pole pair'},
{t:'p', text:'Example 6.13 excluded $a=b$ because its partial fractions divide by $a-b$. When $a=b$ the factors coincide and need a separate pair. Derive it from the geometric pair of Example 6.3, $\\sum_{n=0}^{\\infty}a^{n}e^{-j\\omega n}=1/(1-ae^{-j\\omega})$, by differentiating both sides with respect to $a$ while holding $\\omega$ fixed. On the left, differentiate term by term: $\\frac{\\d}{\\d a}a^{n}=na^{n-1}$, and the $n=0$ term is the constant 1, whose derivative is 0, so the sum starts at $n=1$. On the right, use the chain rule on $(1-ae^{-j\\omega})^{-1}$:'},
{t:'eq', tex:'\\sum_{n=1}^{\\infty}n\\,a^{\\,n-1}e^{-j\\omega n}=\\frac{\\d}{\\d a}\\bigl(1-ae^{-j\\omega}\\bigr)^{-1}=-\\bigl(1-ae^{-j\\omega}\\bigr)^{-2}\\cdot(-e^{-j\\omega})=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.'},
{t:'p', text:'Now put $m=n-1$ on the left, so $n=m+1$ and $m$ runs from 0 to $\\infty$. The exponential splits as $e^{-j\\omega(m+1)}=e^{-j\\omega}e^{-j\\omega m}$, and the factor $e^{-j\\omega}$ leaves the sum and cancels the same factor on the right:'},
{t:'eq', tex:'\\begin{aligned}\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega(m+1)}&=e^{-j\\omega}\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega m}=\\frac{e^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}\\\\\\Longrightarrow\\qquad\\sum_{m=0}^{\\infty}(m+1)\\,a^{m}e^{-j\\omega m}&=\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.\\end{aligned}'},
{t:'eqbox', cap:'Repeated pole',
 tex:['(n+1)a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}},\\qquad |a|<1'],
 after:'The left-hand sum is the analysis sum of $(n+1)a^{n}u[n]$, with $m$ renamed $n$. Differentiating a convergent geometric series term by term is allowed for $|a|<1$, which is why the condition is kept. The exponent 2 comes from one derivative of $(1-ae^{-j\\omega})^{-1}$, and the minus sign stays because differentiating in $a$ does not change it. One number settles any doubt: at $\\omega=0$ with $a=\\tfrac14$ the value is $(1-\\tfrac14)^{-2}=\\tfrac{16}{9}=1.7778=\\sum_{n\\ge0}(n+1)(\\tfrac14)^{n}$, while a plus sign would give $(\\tfrac54)^{-2}=0.6400$. With $a=\\tfrac12$ the value at $\\omega=0$ is $1/(1-\\tfrac12)^{2}=4$. With $a=-\\tfrac12$ the magnitude is largest at $\\omega=\\pi$, where $1+\\tfrac12e^{-j\\pi}=\\tfrac12$ is smallest and $|X|=4$.'},
{t:'p', text:'The pair also follows from differentiation in frequency. Split $(n+1)a^{n}u[n]=n\\,a^{n}u[n]+a^{n}u[n]$ and add the two known transforms over the common denominator:'},
{t:'eq', tex:'\\frac{ae^{-j\\omega}}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}+\\frac{1}{1-ae^{-j\\omega}}=\\frac{ae^{-j\\omega}+\\bigl(1-ae^{-j\\omega}\\bigr)}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}=\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{2}}.'},
{t:'p', text:'Differentiating $r-1$ times in $a$ instead of once gives the pole of order $r$. The left side becomes $\\sum_{n}n(n-1)\\cdots(n-r+2)\\,a^{n-r+1}e^{-j\\omega n}$ and the right side $(r-1)!\\,e^{-j\\omega(r-1)}/(1-ae^{-j\\omega})^{r}$. Shifting the index by $r-1$, cancelling $e^{-j\\omega(r-1)}$ and dividing by $(r-1)!$:'},
{t:'eq', tex:'\\frac{(n+r-1)!}{n!\\,(r-1)!}\\,a^{n}u[n]\\;\\longleftrightarrow\\;\\frac{1}{\\bigl(1-ae^{-j\\omega}\\bigr)^{r}},\\qquad|a|<1.'},
{t:'p', text:'For $r=2$ the coefficient is $(n+1)!/n!=n+1$, the repeated-pole pair. Two identical first-order stages $y[n]=a\\,y[n-1]+x[n]$ in cascade have this impulse response $(n+1)a^{n}u[n]$.'},
{t:'ex', hd:'Example 6.19 — the output of that system', rows:[
 ['Given','The system of Example 6.18 driven by $x[n]=\\left(\\tfrac14\\right)^{n}u[n]$.'],
 ['Find','$y[n]$.'],
 ['Method','Use $Y=XH$ and partial fractions, because the output transform is rational and each fraction can be inverted with a known pair. The input factor coincides with one factor of the system, so the expansion needs a simple and a squared term for it.'],
 ['Solution','With $z=e^{-j\\omega}$, the input transform is $X=1/(1-\\tfrac14z)$ by Example 6.3, and $H$ is the factored form of Example 6.18. Multiply: $$\\begin{aligned}Y=X\\,H&=\\frac{1}{1-\\tfrac14z}\\cdot\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)}=\\frac{2}{\\bigl(1-\\tfrac12z\\bigr)\\bigl(1-\\tfrac14z\\bigr)^{2}}\\\\&=\\frac{A}{1-\\tfrac14z}+\\frac{B}{\\bigl(1-\\tfrac14z\\bigr)^{2}}+\\frac{C}{1-\\tfrac12z}.\\end{aligned}$$ Cover-up reaches the simple factor and the highest power of the repeated factor. Cover $(1-\\tfrac12z)$ and set $z=2$: $$C=\\frac{2}{\\bigl(1-\\tfrac14z\\bigr)^{2}}\\bigg|_{z=2}=\\frac{2}{(1-\\tfrac12)^{2}}=\\frac{2}{\\tfrac14}=8.$$ Cover $(1-\\tfrac14z)^{2}$ and set $z=4$: $$B=\\frac{2}{1-\\tfrac12z}\\bigg|_{z=4}=\\frac{2}{1-2}=-2.$$ Cover-up cannot reach $A$, so use one more value of $z$. Multiply the identity through by the full denominator and set $z=0$; every factor becomes 1, so $2=A+B+C=A-2+8$ and $A=-4$. Recombine as a check: $-4(1-\\tfrac14z)(1-\\tfrac12z)-2(1-\\tfrac12z)+8(1-\\tfrac14z)^{2}$ expands to $(-4+3z-\\tfrac12z^{2})+(-2+z)+(8-4z+\\tfrac12z^{2})=2$, the numerator. Invert term by term. The first and third fractions are the one-sided exponential pair; the middle one is the repeated-pole pair with $a=\\tfrac14$: $$y[n]=-4\\left(\\tfrac14\\right)^{n}u[n]-2(n+1)\\left(\\tfrac14\\right)^{n}u[n]+8\\left(\\tfrac12\\right)^{n}u[n].$$'],
 ['Check','$y[0]=-4-2+8=2$, $y[1]=-4\\cdot\\tfrac14-2\\cdot2\\cdot\\tfrac14+8\\cdot\\tfrac12=-1-1+4=2$, $y[2]=-\\tfrac4{16}-\\tfrac{6}{16}+2=1.375$, $y[3]=-\\tfrac4{64}-\\tfrac8{64}+1=0.8125$. Direct convolution gives $y[0]=h[0]x[0]=2\\cdot1=2$ and $y[1]=h[0]x[1]+h[1]x[0]=2\\cdot\\tfrac14+1.5\\cdot1=2$, the same values.'],
 ['Reading','After a few samples only $8(\\tfrac12)^{n}$ is left: the slower factor $\\tfrac12$ sets the decay. $|Y|$ is largest at $\\omega=0$, $2/(\\tfrac12\\cdot(\\tfrac34)^{2})=7.1111$, and smallest at $\\omega=\\pi$, $2/(\\tfrac32\\cdot(\\tfrac54)^{2})=0.8533$. With the input $(\\tfrac13)^{n}u[n]$ instead, $\\tfrac13$ differs from both system factors, and $Y$ splits into three simple terms.']
]},

{t:'ex', hd:'Example 6.20 — an echo and its removal', rows:[
 ['Given','An echo $y[n]=x[n]+\\alpha\\,x[n-D]$: a copy scaled by $\\alpha$, with $0<\\alpha<1$, arrives $D$ samples later.'],
 ['Find','The frequency response and its extremes, a recursion that removes the echo, and the condition for that recursion to be stable.'],
 ['Method','Read $H$ off the equation with the time-shift property. For the inverse, write a recursion whose response is $1/H$ and expand $1/H$ as a geometric series to find its impulse response.'],
 ['Solution','By linearity and the time shift, $$H(e^{j\\omega})=1+\\alpha e^{-j\\omega D}.$$ Its squared modulus is the sum of the squared real and imaginary parts: $$\\begin{aligned}|H(e^{j\\omega})|^{2}&=(1+\\alpha\\cos\\omega D)^{2}+(\\alpha\\sin\\omega D)^{2}\\\\&=1+2\\alpha\\cos\\omega D+\\alpha^{2}.\\end{aligned}$$ It is largest where $\\cos\\omega D=1$, giving $(1+\\alpha)^{2}$, and smallest where $\\cos\\omega D=-1$, giving $(1-\\alpha)^{2}$. So $|H|$ swings between $1-\\alpha$ and $1+\\alpha$. The cosine $\\cos\\omega D$ repeats every $2\\pi/D$, so the swing happens $D$ times in each period: the response is a comb. To remove the echo, run $$w[n]=y[n]-\\alpha\\,w[n-D].$$ Its equation $w[n]+\\alpha w[n-D]=y[n]$ transforms to $(1+\\alpha e^{-j\\omega D})W=Y$, so its response is $1/(1+\\alpha e^{-j\\omega D})=1/H$. The cascade has response $H\\cdot\\frac1H=1$, so $W=X$ and $w[n]=x[n]$. For the impulse response of the inverse, use the geometric series with ratio $r=-\\alpha e^{-j\\omega D}$, of modulus $|\\alpha|$: $$\\frac{1}{1+\\alpha e^{-j\\omega D}}=\\frac{1}{1-r}=\\sum_{k=0}^{\\infty}r^{k}=\\sum_{k=0}^{\\infty}(-\\alpha)^{k}e^{-j\\omega kD},\\qquad|\\alpha|<1.$$ By the shift pair $\\delta[n-kD]\\leftrightarrow e^{-j\\omega kD}$, the impulse response is $(-\\alpha)^{k}$ at $n=kD$, $k\\ge0$, and zero elsewhere.'],
 ['Stability','$\\sum_n|h[n]|=\\sum_{k\\ge0}|\\alpha|^{k}=1/(1-|\\alpha|)$ is finite only for $|\\alpha|<1$. For $|\\alpha|\\ge1$ the terms $(-\\alpha)^{k}$ do not decay and the recursion is unstable.'],
 ['Numbers','$\\alpha=\\tfrac12$: $|H|$ between $0.5$ and $1.5$, and the inverse between $1/1.5=2/3$ and $1/0.5=2$. $\\alpha=0.8$: $|H|$ between $0.2$ and $1.8$, and the inverse between $1/1.8=0.5556$ and $1/0.2=5$.'],
 ['Check','At every $\\omega$ the two magnitudes multiply to 1. At $8000$ samples per second a delay of $D=2000$ samples is $0.25$ s, an echo that can be heard; the recursion takes it out again.']
]},
{t:'fig', svg:()=>{const al=0.5, E=w=>Math.sqrt(1+2*al*Math.cos(3*w)+al*al);
  const a=wax({h:220,yr:[-0.25,2.75],xlabel:'\\omega',ylabel:'|H(e^{j\\omega})|',yticksOverride:[0.5,1.5,2],ytickfmt:v=>String(v)});
  a.curve(E,{color:C.h,n:4000}); a.curve(w=>1/E(w),{color:C.out,n:4000,dash:'7 5'});
  mark(a,2.45); return a.svg();},
 cap:'For $\\alpha=\\tfrac12$ and $D=3$: the echo response $|1+\\alpha e^{-j\\omega D}|$ (solid) swings between $0.5$ and $1.5$ three times in each period; the response of the recursion that removes it (dashed) is its reciprocal, between $2/3$ and $2$.'},

/* ================================================================ 6.7 */
{t:'h2', num:'6.7', text:'Summary'},
{t:'p', text:'The two tables collect the properties and the pairs of this chapter. In every row, $x[n]\\leftrightarrow X(e^{j\\omega})$, each spectrum repeats every $2\\pi$, and each sum over $k$ runs over all integers.'},
{t:'table', cap:'Properties of the discrete-time Fourier transform.', head:['Property','Pair'],
 rows:[
  ['Linearity','$a\\,x_1[n]+b\\,x_2[n]\\leftrightarrow a\\,X_1(e^{j\\omega})+b\\,X_2(e^{j\\omega})$'],
  ['Time shift','$x[n-n_0]\\leftrightarrow e^{-j\\omega n_0}X(e^{j\\omega})$'],
  ['Frequency shift','$e^{j\\omega_0n}x[n]\\leftrightarrow X(e^{j(\\omega-\\omega_0)})$'],
  ['Conjugation','$x^{*}[n]\\leftrightarrow X^{*}(e^{-j\\omega})$'],
  ['Time reversal','$x[-n]\\leftrightarrow X(e^{-j\\omega})$'],
  ['Time expansion','$x_{(k)}[n]\\leftrightarrow X(e^{jk\\omega})$'],
  ['Convolution','$x[n]*h[n]\\leftrightarrow X(e^{j\\omega})H(e^{j\\omega})$'],
  ['Multiplication','$x[n]y[n]\\leftrightarrow\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y(e^{j(\\omega-\\theta)})\\d\\theta$'],
  ['Periodicity','$X(e^{j(\\omega+2\\pi)})=X(e^{j\\omega})$ for every sequence'],
  ['First difference','$x[n]-x[n-1]\\leftrightarrow(1-e^{-j\\omega})X(e^{j\\omega})$'],
  ['Accumulation','$\\sum_{m=-\\infty}^{n}x[m]\\leftrightarrow\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_k\\delta(\\omega-2\\pi k)$'],
  ['Differentiation in frequency','$n\\,x[n]\\leftrightarrow j\\,\\d X(e^{j\\omega})/\\d\\omega$'],
  ['Real sequence','$X(e^{-j\\omega})=X^{*}(e^{j\\omega})$: $|X|$ even, $\\angle X$ odd'],
  ['Real and even','$X(e^{j\\omega})$ real and even'],
  ['Real and odd','$X(e^{j\\omega})$ purely imaginary and odd'],
  ['Even and odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$, for real $x$'],
  ['Parseval','$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega$']
 ]},
{t:'table', cap:'Discrete-time Fourier transform pairs.', head:['Sequence','Transform'],
 rows:[
  ['$\\delta[n]$','$1$'],
  ['$\\delta[n-n_0]$','$e^{-j\\omega n_0}$'],
  ['$u[n]$','$\\frac{1}{1-e^{-j\\omega}}+\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
  ['$a^{n}u[n]$, $|a|<1$','$\\frac{1}{1-ae^{-j\\omega}}$'],
  ['$(n+1)a^{n}u[n]$, $|a|<1$','$\\frac{1}{(1-ae^{-j\\omega})^{2}}$'],
  ['$\\frac{(n+r-1)!}{n!\\,(r-1)!}a^{n}u[n]$, $|a|<1$','$\\frac{1}{(1-ae^{-j\\omega})^{r}}$'],
  ['$a^{|n|}$, $|a|<1$','$\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}$'],
  ['$1$ on $|n|\\le N_1$','$\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}$'],
  ['$\\frac{\\sin(Wn)}{\\pi n}$, $0<W<\\pi$','$1$ on $|\\omega|\\le W$, $0$ on $W<|\\omega|\\le\\pi$'],
  ['$1$','$2\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
  ['$e^{j\\omega_0n}$','$2\\pi\\sum_k\\delta(\\omega-\\omega_0-2\\pi k)$'],
  ['$\\cos(\\omega_0n)$','$\\pi\\sum_k[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)]$'],
  ['$\\sin(\\omega_0n)$','$\\frac{\\pi}{j}\\sum_k[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)]$'],
  ['$\\sum_{k=\\langle N\\rangle}a_ke^{jk(2\\pi/N)n}$','$2\\pi\\sum_k a_k\\delta(\\omega-\\frac{2\\pi k}{N})$'],
  ['$\\sum_k\\delta[n-kN]$','$\\frac{2\\pi}{N}\\sum_k\\delta(\\omega-\\frac{2\\pi k}{N})$']
 ]},
{t:'p', text:'Written with the unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, the low-pass sequence is $\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$.'},

{t:'h3', text:'What to carry into Chapter 7'},
{t:'ul', items:[
 'The pair, with analysis as the sum and synthesis as the integral over one period, carrying $\\frac{1}{2\\pi}$. It comes from the series: $Na_k$ samples $X(e^{j\\omega})$, and the samples fill in as $N$ grows.',
 'The $2\\pi$-periodicity and its one-line proof, and that the same line fails in continuous time. High frequency means $\\omega$ near $\\pm\\pi$.',
 'The DFT is $N$ samples of the transform. Zero padding adds samples of the same curve; only a longer record narrows a peak, whose main lobe is $4\\pi/L$ wide.',
 'Real means the phase is 0 or $\\pi$, not that the phase is zero.',
 'A periodic sequence has impulses of weight $2\\pi a_k$ at $\\omega=2\\pi k/N$ for every integer $k$.',
 'Multiplication in time is a <b>periodic</b> convolution over $2\\pi$, so anything reaching across a period boundary folds back and adds. A window turns each spectral line into a lobe; a softer window lowers the side lobes and widens the lobe.',
 'Parseval: $\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega$, with $R=1\\ \\Omega$.',
 'A difference equation has $H(e^{j\\omega})$ a ratio of polynomials in $e^{-j\\omega}$; partial fractions give $h[n]$, and a repeated factor needs $(n+1)a^{n}u[n]$.',
 'The unnormalised sinc, $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, restated at every point of use.',
 'Discrete time has a difference, not a derivative; the derivative in this chapter is in frequency.'
]},
{t:'p', text:'Many sequences are samples of a continuous-time signal, $x[n]=x(nT)$. The next chapter relates the two spectra and states when the samples are enough to rebuild $x(t)$. Sampling produces repeated spectral copies separated by the sampling frequency, so the periodic-overlap ideas of this chapter will be used again.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'6.1', text:'Prove that $X(e^{j\\omega})$ is $2\\pi$-periodic, and say precisely where the same argument fails for $X(j\\omega)$.',
 ans:'Substituting $\\omega+2\\pi$ into the analysis sum produces a factor $e^{-j2\\pi n}$, which is 1 in every term because $n$ is an integer. In continuous time the corresponding factor is $e^{-j2\\pi t}$ with $t$ real, which equals 1 only at integer $t$ and cannot leave the integral.'},
{t:'q', n:'6.2', text:'Five ones, $x[n]=1$ for $0\\le n\\le4$, and $N=5$. How many of the five DFT values $X[k]$ are zero?',
 ans:'Four. $X(e^{j\\omega})=e^{-j2\\omega}\\sin(5\\omega/2)/\\sin(\\omega/2)$, and at $\\omega_k=2\\pi k/5$ the numerator is $\\sin(\\pi k)=0$ for $k=1,\\dots,4$. Only $X[0]=5$ is not zero.'},
{t:'q', n:'6.3', text:'The record $\\cos(0.3\\pi n)+\\cos(0.4\\pi n)$ is kept for $L=10$ samples and padded to $N=128$ (record A), or kept for $L=30$ samples with no padding (record B). Whose curve $|X(e^{j\\omega})|$ has two separate peaks?',
 ans:'Only B. Padding adds samples of the same curve, and at $L=10$ the two lobes merge into one peak. At $L=30$ the lobes are narrower and the two peaks part.'},
{t:'q', n:'6.4', text:'For $x[n]=a^{n}u[n]$ with $a=\\tfrac18$, give $|X|_{\\max}$, $|X|_{\\min}$ and $\\max|\\angle X|$ in closed form and as numbers.',
 ans:'$1/(1-a)=8/7=1.1429$, $1/(1+a)=8/9=0.8889$, and $\\arcsin\\tfrac18=0.1253$ rad.'},
{t:'q', n:'6.5', text:'Explain why the finite geometric sum behind the Dirichlet kernel needs $r\\neq1$ rather than $|r|<1$, and give the value of the kernel at the excluded points.',
 ans:'A finite sum always has a value; only the closed form fails, where its denominator $1-r$ vanishes. Here $|r|=1$ at every $\\omega$, so $|r|<1$ would exclude the sum entirely. At $r=1$, that is $\\omega$ a multiple of $2\\pi$, every term is 1 and the sum is $2N_1+1$.'},
{t:'q', n:'6.6', text:'Where is the first zero with $\\omega>0$ of the transform of the rectangular pulse with $N_1=3$? Does going from $N_1=2$ to $N_1=4$ halve the main lobe?',
 ans:'At $2\\pi/7$, since the zeros are at $2\\pi k/(2N_1+1)$. No: the first zero moves from $2\\pi/5$ to $2\\pi/9$, a factor $5/9$, the inverse ratio of the pulse lengths.'},
{t:'q', n:'6.7', text:'The Dirichlet kernel is real at every $\\omega$. Does it follow that $|X|=X$ and $\\angle X=0$?',
 ans:'No. Realness fixes the imaginary part and not the sign. The kernel is negative on part of every period, with least value $-1.2500$ for $N_1=2$, and there $|X|=-X$ and $\\angle X=\\pi$. The conclusion needs the extra hypothesis $X\\ge0$, which holds for $a^{|n|}$ but not here.'},
{t:'q', n:'6.8', text:'Invert the ideal low-pass spectrum with $W=\\pi/2$ and give $x[0]$ and $x[2]$. State the sinc convention you use.',
 ans:'$x[n]=\\sin(Wn)/(\\pi n)$ with $x[0]=W/\\pi=0.5$, and $x[2]=\\sin(\\pi)/(2\\pi)=0$. In the unnormalised convention $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$, the same sequence is $\\frac{W}{\\pi}\\operatorname{sinc}(Wn)$.'},
{t:'q', n:'6.9', text:'Where do the impulses of $2\\cos\\left(\\frac{5\\pi}{3}n\\right)+\\cos\\left(\\frac{7\\pi}{4}n\\right)$ lie inside $-\\pi<\\omega\\le\\pi$, and what is the fundamental period of the sequence?',
 ans:'Weight $2\\pi$ at $\\pm\\pi/3$ and weight $\\pi$ at $\\pm\\pi/4$, after reducing $5\\pi/3$ to $\\pi/3$ and $7\\pi/4$ to $\\pi/4$. The two components have periods 6 and 8, so the sum has period $\\operatorname{lcm}(6,8)=24$.'},
{t:'q', n:'6.10', text:'A turn of $3\\pi/2$ per step on the unit circle gives the samples $\\cos(3\\pi n/2)$. Which turn between $0$ and $\\pi$ gives the same samples?',
 ans:'$\\pi/2$, since $2\\pi-3\\pi/2=\\pi/2$ and $\\cos((2\\pi-\\omega)n)=\\cos(\\omega n)$ at every integer $n$. The point turns the other way by $\\pi/2$, and its real part is the same.'},
{t:'q', n:'6.11', text:'Two spectra, 1 on $|\\omega|\\le3\\pi/4$ and 1 on $|\\omega|\\le\\pi/2$, belong to sequences that are multiplied together. Why is $Z(e^{j\\pi})=\\tfrac14$ and not $\\tfrac18$?',
 ans:'The multiplication property gives a periodic convolution over one period. The ordinary convolution of the two bands is a trapezoid reaching to $|\\omega|=5\\pi/4$, which is wider than one period, so near $\\omega=\\pi$ a second copy arrives from the other side and the two contributions of $\\tfrac18$ add.'},
{t:'q', n:'6.12', text:'A cosine is kept for $L=16$ samples. How wide is the main lobe of each line, and what happens to it for $L=32$? What does a Hann window of the same length do to it?',
 ans:'$4\\pi/L=\\pi/4$ at $L=16$ and $\\pi/8$ at $L=32$, half as wide. A Hann window doubles the main lobe to $8\\pi/L$ and lowers the highest side lobe from about $-13$ dB to about $-31$ dB.'},
{t:'q', n:'6.13', text:'Derive the pair for $(n+1)a^{n}u[n]$ and say what fixes the exponent and the sign.',
 ans:'Differentiate $\\sum_{n\\ge0}a^{n}e^{-j\\omega n}=1/(1-ae^{-j\\omega})$ with respect to $a$, shift the index and cancel one factor $e^{-j\\omega}$, giving $1/(1-ae^{-j\\omega})^{2}$. One differentiation of a first power produces the exponent 2, and the minus sign is inherited from the pair being differentiated.'},
{t:'q', n:'6.14', text:'Find the impulse response of $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$ and check it against the equation.',
 ans:'$h[n]=4(\\tfrac12)^{n}u[n]-2(\\tfrac14)^{n}u[n]$, so $h[0]=2$, $h[1]=1.5$, $h[2]=0.875$. Substituting: $h[1]-\\tfrac34h[0]=0$ and $h[2]-\\tfrac34h[1]+\\tfrac18h[0]=0$.'},
{t:'q', n:'6.15', text:'An echo has $\\alpha=0.8$. Give the largest and smallest values of $|1+\\alpha e^{-j\\omega D}|$, and say whether the recursion $w[n]=y[n]-\\alpha w[n-D]$ is stable.',
 ans:'$1.8$ where $e^{-j\\omega D}=1$ and $0.2$ where $e^{-j\\omega D}=-1$. The recursion is stable, because its impulse response $(-0.8)^{k}$ at $n=kD$ decays; its response lies between $1/1.8=0.5556$ and $1/0.2=5$.'},
{t:'q', n:'6.16', text:'Which properties of the continuous-time transform carry over unchanged, and which change form?',
 ans:'Linearity, the time shift, conjugate symmetry, Parseval and the convolution property carry over unchanged. The synthesis equation changes its range to one period; the multiplication property becomes a periodic convolution; the time-domain operator is a difference and not a derivative; and the transform pairs themselves differ, since the discrete-time ones are $2\\pi$-periodic and carry their own convergence conditions.'}
];
})();
