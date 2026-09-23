/* Course notes — Chapter 7, Sampling and aliasing */
(function(){
const P=PLOT, C=P.COL, PI=Math.PI;
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:58,r:24,t:26,b:34},xtarget:8,ytarget:3},o));
const piTick=v=>{ const r=v/PI;
  if(Math.abs(r)<1e-9) return '0';
  for(const den of [1,2,3,4,5,6]){ const num=r*den;
    if(Math.abs(num-Math.round(num))<1e-7){ const k=Math.round(num), sg=k<0?'-':'', m=Math.abs(k);
      const head=m===1?'π':m+'π'; return den===1?sg+head:sg+head+'/'+den; } }
  return P.fmt(v,2); };
const wTicks=(lo,hi,step)=>{ const o=[];
  for(let k=Math.ceil(lo/step-1e-9);k<=hi/step+1e-9;k++) o.push(k*step); return o; };
const xB=t=>{ const u=PI*t; return Math.abs(u)<1e-9?1:Math.pow(Math.sin(u)/u,2); };
const WM=2*PI;
const tri =(w,wm,pk)=>Math.abs(w)<=wm?pk*(1-Math.abs(w)/wm):NaN;
const tri0=(w,wm,pk)=>Math.abs(w)<=wm?pk*(1-Math.abs(w)/wm):0;
const rep =(w,wm,pk,ws,K)=>{ let s=0; for(let k=-K;k<=K;k++) s+=tri0(w-k*ws,wm,pk); return s; };
const samp=(f,T,a,b)=>{ const o=[]; for(let n=Math.ceil(a/T);n<=b/T;n++) o.push([n*T,f(n*T)]); return o; };
const hLP=(t,T)=>{ const u=PI*t/T; return Math.abs(u)<1e-9?1:Math.sin(u)/u; };
const KCOL=k=>k===0?C.in:(Math.abs(k)===1?C.mid:C.slate);

window.C7 = [
{t:'page'},

{t:'h1', num:'CHAPTER 7', text:'Sampling and aliasing'},
{t:'p', lead:true, text:'Sampling keeps the value of a signal every $T$ seconds and discards the values between those instants. This chapter gives the condition for exact recovery, derives the required reconstruction filter, and shows what changes when the condition fails. Sampling always <b>replicates</b> the spectrum. <b>Aliasing</b> occurs only when those copies overlap.'},

{t:'h2', num:'7.1', text:'Impulse-train sampling'},
{t:'p', text:'Sampling is modelled as a multiplication. The sampling function is an impulse train of period $T$, and the sampled signal is the product of the signal with it.'},
{t:'eqbox', cap:'Impulse-train sampling',
 tex:['p(t)=\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT),\\qquad x_p(t)=x(t)\\,p(t)',
      '\\begin{aligned}x_p(t)&=x(t)\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT)\\\\&=\\sum_{n=-\\infty}^{\\infty}x(t)\\,\\delta(t-nT)\\\\&=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(t-nT)\\end{aligned}'],
 after:'The first step substitutes $p(t)$ into the product. The second step moves $x(t)$ inside the sum, because multiplication distributes over addition. The third step uses the sifting property $x(t)\\delta(t-nT)=x(nT)\\delta(t-nT)$: an impulse is zero everywhere except at its own instant, so only the value of $x$ at $t=nT$ survives.'},
{t:'box', hd:'How an impulse is drawn', html:'An impulse is drawn as an arrow whose <b>height is its weight</b>. In a picture of $x_p(t)$ the arrow at $t=nT$ therefore reaches $x(nT)$, and the outline traced by the arrowheads is the signal itself. The arrows are weights, not values of a function.'},
{t:'p', text:'The sampler keeps only the numbers $x(nT)$. Written as a sequence, they are $x_p[n]=x(nT)$. These sample values form the discrete-time representation of the signal.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:520,h:190,xr:[-3.4,3.4],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t)',xtarget:6});
   a.curve(xB,{color:C.in,n:2000}); return a.svg(); },
  cap:'A band-limited signal, $x(t)=(\\sin\\pi t/\\pi t)^{2}$.'},
 {svg:()=>{ const a=ax({w:520,h:190,xr:[-3.4,3.4],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x_p(t)',xtarget:6});
   a.curve(xB,{color:C.in,width:1.1,dash:'3 5',opacity:.55,n:2000});
   samp(xB,0.5,-3.3,3.3).forEach(pr=>a.impulse(pr[0],pr[1],{color:C.mid,label:false}));
   return a.svg(); },
  cap:'The same signal sampled with $T=0.5$ s. Each arrow reaches $x(nT)$.'}
]},

{t:'h2', num:'7.2', text:'The rate, in radians per second and in hertz'},
{t:'p', text:'A sampling rate can be stated as an angular frequency or in hertz. Define both forms before using them so that their units remain distinct.'},
{t:'eqbox', cap:'Sampling rate, both readings',
 tex:['\\omega_s=\\frac{2\\pi}{T}\\ \\left[\\frac{\\text{rad}}{\\text{s}}\\right],\\qquad f_s=\\frac{1}{T}\\ [\\text{Hz}],\\qquad \\omega_s=2\\pi f_s'],
 after:'$\\omega_s$ is the sampling <b>angular</b> frequency. $f_s$ is the sampling frequency in hertz, the number of samples taken per second. Every spectrum in this chapter is drawn against $\\omega$ in rad/s, so $\\omega_s$ is the working symbol; the hertz reading appears only where a physical rate is quoted.'},
{t:'box', kind:'err', hd:'The factor of $2\\pi$ is not decoration', html:'Calling $2\\pi/T$ the sampling frequency and then reading it in hertz is the most expensive slip in this chapter. With $T=0.25$ ms $=2.5\\times10^{-4}$ s the two readings are $\\omega_s=2\\pi/(2.5\\times10^{-4})=8000\\pi$ rad/s and $f_s=1/(2.5\\times10^{-4})=4000$ Hz. They differ by $2\\pi$, and an answer that mixes them is wrong by that factor everywhere it is used. The same applies to the signal: a bandwidth of $\\omega_M$ rad/s is $f_M=\\omega_M/2\\pi$ hertz.'},
{t:'p', text:'One multiplication tests any pair of values: $\\omega_sT=2\\pi$ always, and $f_sT=1$ always. Every sampling period computed in this chapter is followed by that check.'},

{t:'h2', num:'7.3', text:'The spectrum of a sampled signal'},
{t:'p', text:'Multiplication in time is convolution in frequency. So the spectrum of $x_p(t)$ needs the transform of the impulse train $p(t)$. Four steps give the result: write $p(t)$ as a Fourier series, transform that series, apply the multiplication property, and evaluate the convolution with the sifting property.'},
{t:'eqbox', cap:'Step 1: the Fourier series of the impulse train',
 tex:['p(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_st},\\qquad \\omega_s=\\frac{2\\pi}{T}',
      '\\begin{aligned}a_k&=\\frac{1}{T}\\int_{-T/2}^{T/2}p(t)\\,e^{-jk\\omega_st}\\,\\d t\\\\&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)\\,e^{-jk\\omega_st}\\,\\d t\\\\&=\\frac{1}{T}\\,e^{-jk\\omega_s\\cdot0}=\\frac{1}{T}\\end{aligned}'],
 after:'$p(t)$ is periodic with period $T$, so it has a Fourier series with fundamental frequency $\\omega_s=2\\pi/T$. The coefficient integral runs over one period, $-T/2<t<T/2$. Only the impulse at $n=0$ lies inside that window, so the whole sum $p(t)$ reduces to the single term $\\delta(t)$ there. The sifting property then evaluates the exponential at $t=0$, where it equals 1. Every coefficient is the same number, $1/T$.'},
{t:'eqbox', cap:'Step 2: the transform of the impulse train',
 tex:['e^{jk\\omega_st}\\;\\longleftrightarrow\\;2\\pi\\,\\delta(\\omega-k\\omega_s)',
      'P(j\\omega)=\\sum_{k=-\\infty}^{\\infty}\\frac{1}{T}\\cdot2\\pi\\,\\delta(\\omega-k\\omega_s)=\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s)'],
 after:'The first line is the transform pair of a complex exponential. The transform is linear, so each term of the series transforms separately and the constant $1/T$ passes through. An impulse train of spacing $T$ in time is therefore an impulse train of spacing $\\omega_s$ in frequency, with weight $2\\pi/T$ on every impulse.'},
{t:'p', text:'Step 3 is the multiplication property. A product in time is a convolution in frequency, divided by $2\\pi$; the $1/2\\pi$ is the same factor that appears in the inverse transform.'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{2\\pi}\\bigl[X(j\\omega)*P(j\\omega)\\bigr]=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,P\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta.'},
{t:'p', text:'Step 4 substitutes $P$ from Step 2 and evaluates the integral.'},
{t:'eq', tex:'\\begin{aligned}X_p(j\\omega)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-\\theta-k\\omega_s)\\,\\d\\theta\\\\&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,\\delta\\bigl(\\theta-(\\omega-k\\omega_s)\\bigr)\\,\\d\\theta\\\\&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr).\\end{aligned}'},
{t:'eqbox', cap:'Spectrum of the sampled signal',
 tex:['X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)'],
 after:'In the second line the constants $1/2\\pi$ and $2\\pi/T$ multiply to $1/T$, and the sum is taken outside the integral. The impulse is even, so $\\delta(\\omega-\\theta-k\\omega_s)=\\delta(\\theta-(\\omega-k\\omega_s))$; writing it this way shows where it sits on the $\\theta$ axis. In the third line the sifting property picks out $X$ at $\\theta=\\omega-k\\omega_s$. Each term is one copy of $X(j\\omega)$, moved to $k\\omega_s$ and scaled by $1/T$, not by 1. The reconstruction filter later carries gain $T$, exactly the inverse, so the two must be kept together.'},
{t:'p', text:'Spacing $T$ in time gives spacing $2\\pi/T$ in frequency: the closer the samples, the further apart the copies, and the taller each one is.'},
{t:'fig', svg:()=>{ const ws=5*PI, pk=2.5;
  const a=ax({w:700,h:210,xr:[-11*PI,11*PI],yr:[-0.25,3.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
    xticksOverride:wTicks(-10*PI,10*PI,5*PI),xtickfmt:piTick});
  for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
  return a.svg(); },
 cap:'The sampled spectrum of the signal above at $T=0.4$ s, so $\\omega_s=5\\pi$ rad/s. One copy per multiple of $\\omega_s$, each of height $1/T=2.5$.'},

{t:'h2', num:'7.4', text:'Replication and aliasing are not the same thing'},
{t:'p', text:'The sum for $X_p(j\\omega)$ runs over every integer $k$ for every value of $T$. There is no rate at which the copies fail to appear and no rate at which they disappear. Two things, and only two, change with the rate: the copies sit $\\omega_s$ apart, and each is scaled by $1/T$.'},
{t:'box', hd:'Naming the pieces', html:'The term $k=0$ is $X(j\\omega)/T$, the spectrum of the signal itself, sitting where it always sat. It is the <b>baseband</b> and it is not a copy of anything. The terms $k=\\pm1,\\pm2,\\dots$ are the <b>copies</b>, centred at $\\pm\\omega_s,\\pm2\\omega_s,\\dots$ Calling the centre group the first replica shifts every later index by one.'},
{t:'p', text:'The baseband occupies $|\\omega|\\le\\omega_M$, and the copy at $k=1$ occupies $|\\omega-\\omega_s|\\le\\omega_M$, so it begins at $\\omega_s-\\omega_M$. The gap between them is the quantity that decides everything.'},
{t:'eqbox', cap:'Guard band',
 tex:['(\\omega_s-\\omega_M)-\\omega_M=\\omega_s-2\\omega_M'],
 after:'Positive: the copies stand clear and a filter can cut the baseband out untouched. Zero: they touch. Negative: they have moved into one another and add.'},
{t:'box', kind:'err', hd:'Replication is unconditional', html:'It is sometimes said that below the Nyquist rate the spectrum is no longer replicated. That is false. The formula for $X_p(j\\omega)$ carries no condition, so the copies are there at every rate; what changes below the Nyquist rate is that they <b>overlap</b>. Replication is what sampling does. Aliasing is the overlap of what sampling made.'},
{t:'p', text:'The overlap cannot be repaired afterwards. Where two copies meet, the sampler stores one number that is the sum of two contributions,'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\Bigl[\\underbrace{X(j\\omega)}_{\\text{wanted}}+\\underbrace{X\\bigl(j(\\omega-\\omega_s)\\bigr)}_{\\text{intruder}}\\Bigr].'},
{t:'p', text:'A filter multiplies $X_p(j\\omega)$ frequency by frequency, including multiplying by zero. It cannot look at one value and report the two numbers that were added to make it. So the only cures are to raise the rate, or to remove the offending frequencies from $x(t)$ before the sampler.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const ws=5*PI, pk=2.5;
   const a=ax({w:340,h:180,xr:[-8*PI,8*PI],yr:[-0.2,3.5],xlabel:'\\omega',ylabel:'X_p(j\\omega)',
     pad:{l:52,r:20,t:26,b:34},xticksOverride:wTicks(-8*PI,8*PI,4*PI),xtickfmt:piTick,ytarget:2});
   for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1200});
   a.span(WM,ws-WM,3.0,'\\text{gap}',{color:C.out,fs:12,tex:true});
   return a.svg(); },
  cap:'$\\omega_s=5\\pi$: a gap of $\\pi$ rad/s.'},
 {svg:()=>{ const ws=4*PI, pk=2;
   const a=ax({w:340,h:180,xr:[-8*PI,8*PI],yr:[-0.2,3.0],xlabel:'\\omega',ylabel:'X_p(j\\omega)',
     pad:{l:52,r:20,t:26,b:34},xticksOverride:wTicks(-8*PI,8*PI,4*PI),xtickfmt:piTick,ytarget:2});
   for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1200});
   a.vline(WM,{color:C.coral}); a.vline(-WM,{color:C.coral});
   return a.svg(); },
  cap:'$\\omega_s=4\\pi=2\\omega_M$: the gap is zero.'},
 {svg:()=>{ const ws=3*PI, pk=1.5;
   const a=ax({w:340,h:180,xr:[-8*PI,8*PI],yr:[-0.2,3.0],xlabel:'\\omega',ylabel:'X_p(j\\omega)',
     pad:{l:52,r:20,t:26,b:34},xticksOverride:wTicks(-8*PI,8*PI,4*PI),xtickfmt:piTick,ytarget:2});
   for(let k=-3;k<=3;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),width:1.3,dash:'4 4',n:1200});
   a.curve(w=>rep(w,WM,pk,ws,4),{color:C.err,width:2.4,n:1600});
   return a.svg(); },
  cap:'$\\omega_s=3\\pi$: the copies add. The solid curve is the sum.'}
]},

{t:'h2', num:'7.5', text:'The sampling theorem'},
{t:'eqbox', cap:'Sampling theorem',
 tex:['X(j\\omega)=0\\ \\text{ for }\\ |\\omega|>\\omega_M \\quad\\text{and}\\quad \\omega_s>2\\omega_M',
      '\\Longrightarrow\\quad x(t)\\ \\text{is determined uniquely by}\\ x(nT),\\ n=0,\\pm1,\\pm2,\\dots'],
 after:'The signal is recovered by passing $x_p(t)$ through an ideal lowpass filter of gain $T$ and cutoff $\\omega_c$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. The quantity $2\\omega_M$ is the <b>Nyquist rate</b> of the signal.'},
{t:'box', kind:'err', hd:'Why the inequality has to be strict', html:'Put $\\omega_s=2\\omega_M$ into the cutoff condition. It becomes $\\omega_M<\\omega_c<\\omega_M$, an interval with nothing in it. There is no admissible cutoff at the Nyquist rate, so the theorem cannot be satisfied at its own boundary. Writing $\\omega_s\\ge2\\omega_M$ promises a filter that the same sentence then rules out. In practice the rate is chosen well above $2\\omega_M$, so that the guard band is wide enough for a real filter, whose transition from pass to stop is not vertical.'},
{t:'ex', hd:'Example 7.1 — a signal the Nyquist rate throws away', rows:[
 ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$, sampled at exactly $\\omega_s=2\\omega_M=8000\\pi$ rad/s.'],
 ['Find','What happens to the term $\\sin(4000\\pi t)$.'],
 ['Method','Use the sampled-spectrum sum because cancellation can occur between the baseband and a copy. Locate every contribution to $X_p$ at $\\omega=+4000\\pi$, then verify the result from the sample values in time.'],
 ['Solution','The highest frequency present is $4000\\pi$ rad/s, so $\\omega_M=4000\\pi$ rad/s and $$T=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}=0.25\\ \\text{ms},\\qquad\\frac{1}{T}=4000.$$ The sine transforms to $\\frac{\\pi}{j}[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)]$; Example 7.3 derives this pair. Write the sampled-spectrum sum for this term and keep the $k=0$ and $k=1$ terms: $$\\begin{aligned}X_p(j\\omega)&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)\\\\k=0:&\\quad\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)\\bigr]\\\\k=1:&\\quad\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-8000\\pi-4000\\pi)-\\delta(\\omega-8000\\pi+4000\\pi)\\bigr]\\\\&=\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-12000\\pi)-\\delta(\\omega-4000\\pi)\\bigr].\\end{aligned}$$ The $k=1$ term replaces $\\omega$ by $\\omega-\\omega_s$, which moves every impulse up by $8000\\pi$. The impulse that sat at $-4000\\pi$ now sits at $-4000\\pi+8000\\pi=+4000\\pi$, and it keeps its negative sign. At $\\omega=+4000\\pi$ the two weights add: $$\\frac{1}{T}\\cdot\\frac{\\pi}{j}-\\frac{1}{T}\\cdot\\frac{\\pi}{j}=\\frac{4000\\pi}{j}-\\frac{4000\\pi}{j}=0.$$ The same cancellation happens at $-4000\\pi$, where the $k=-1$ copy brings the impulse from $+4000\\pi$ down by $8000\\pi$. In time the sample values confirm it: $$\\sin(4000\\pi\\,nT)=\\sin\\Bigl(4000\\pi\\cdot\\frac{n}{4000}\\Bigr)=\\sin(\\pi n)=0\\quad\\text{for every integer }n.$$'],
 ['Check','Every sample of the sine term is taken at a zero crossing, so the sampler never sees it. The component is absent, not merely marginal. The cosine term is not affected: its impulse at $-2000\\pi$ moves to $-2000\\pi+8000\\pi=6000\\pi$, which is outside the baseband.'],
 ['Repair','Add a guard band. With $\\omega_g=1000\\pi$ rad/s the rate becomes $\\omega_s=2\\omega_M+\\omega_g=8000\\pi+1000\\pi=9000\\pi$ rad/s, so $$T=\\frac{2\\pi}{9000\\pi}=\\frac{1}{4500}\\ \\text{s}\\approx222.2\\ \\mu\\text{s}.$$ The admissible cutoff interval $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ becomes $4000\\pi<\\omega_c<9000\\pi-4000\\pi=5000\\pi$ rad/s, which is no longer empty.']
]},
{t:'fig', svg:()=>{ const K=v=>v*PI;
  const a=ax({w:700,h:200,xr:[-K(6500),K(6500)],yr:[-2.25,1.75],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{sine term of }X_p(j\\omega)',
    pad:{l:80,r:24,t:26,b:34},yticksOverride:[],
    xticksOverride:[0],
    xtickfmt:v=>{const r=Math.round(v/PI);return r===0?'0':(r<0?'-':'')+Math.abs(r)+'π';}});
  a.impulse(K(4000),1.15,{color:C.in,label:false});
  a.impulse(-K(4000),-1.15,{color:C.in,label:false});
  a.impulse(K(4000),-1.15,{color:C.mid,label:false});
  a.impulse(-K(4000),1.15,{color:C.mid,label:false});
  a.note(K(4000),-1.82,'4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
  a.note(-K(4000),-1.82,'-4000\\pi',{anchor:'middle',color:C.muted,fs:13,tex:true});
  return a.svg(); },
 cap:'At $\\omega=\\pm4000\\pi$ the baseband arrow and the arrow the neighbouring copy brings there have the same length and point in opposite directions.'},

{t:'h2', num:'7.6', text:'Worked examples on the rate'},
{t:'ex', hd:'Example 7.2 — one signal at three rates', rows:[
 ['Given','$x(t)=(\\sin\\pi t/\\pi t)^{2}$, whose transform is a triangle of peak 1 reaching zero at $\\pm2\\pi$. So $\\omega_M=2\\pi$ rad/s and the Nyquist rate is $4\\pi$ rad/s.'],
 ['Find','For $T_1=0.40$ s, $T_2=0.50$ s and $T_3=2/3$ s: the rate, the guard band and the height of each copy.'],
 ['Method','Use the sampling definitions because the question asks for the rate, separation, and scale of the copies: $\\omega_s=2\\pi/T$, guard band $\\omega_s-2\\omega_M$, and copy height $1/T$ times the original peak.'],
 ['Solution','For each period compute the rate from $\\omega_s=2\\pi/T$, the guard band from $\\omega_s-2\\omega_M$ with $2\\omega_M=4\\pi$, and the copy height from $1/T$ times the peak of 1: $$\\begin{aligned}T_1=0.40\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{0.40}=5\\pi\\ \\text{rad/s},\\\\&\\quad 5\\pi>4\\pi,\\quad\\text{guard}=5\\pi-4\\pi=+\\pi,\\quad \\frac{1}{T_1}=\\frac{1}{0.40}=2.5\\\\T_2=0.50\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{0.50}=4\\pi\\ \\text{rad/s},\\\\&\\quad 4\\pi=4\\pi,\\quad\\text{guard}=4\\pi-4\\pi=0,\\quad \\frac{1}{T_2}=\\frac{1}{0.50}=2.0\\\\T_3=2/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{2/3}=3\\pi\\ \\text{rad/s},\\\\&\\quad 3\\pi<4\\pi,\\quad\\text{guard}=3\\pi-4\\pi=-\\pi,\\quad \\frac{1}{T_3}=\\frac{3}{2}=1.5\\end{aligned}$$ Dividing by $2/3$ is multiplying by $3/2$, which gives the last row.'],
 ['Check','$\\omega_sT=2\\pi$ in each row: $5\\pi\\times0.4=2\\pi$, $4\\pi\\times0.5=2\\pi$, $3\\pi\\times2/3=2\\pi$. Only the first row is safe; the second sits on the boundary and the third overlaps by $\\pi$ rad/s on each side.']
]},
{t:'ex', hd:'Example 7.3 — a line spectrum, and its sampling period', rows:[
 ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$.'],
 ['Find','$X(j\\omega)$, the bandwidth, and the sampling period at the Nyquist rate.'],
 ['Method','Use linearity because the signal is a sum of standard terms. Transform each term separately, identify the largest frequency, convert the resulting rate to a period, and check the units three ways.'],
 ['Solution','Start from the pair for one complex exponential, $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$. It holds because the inverse transform of the right side is $\\frac{1}{2\\pi}\\int2\\pi\\delta(\\omega-\\omega_0)e^{j\\omega t}\\,\\d\\omega=e^{j\\omega_0t}$ by sifting. Write each term of $x(t)$ as a sum of exponentials and transform term by term: $$\\begin{aligned}1&=e^{j0t}&&\\longleftrightarrow\\;2\\pi\\delta(\\omega)\\\\\\cos(2000\\pi t)&=\\tfrac12e^{j2000\\pi t}+\\tfrac12e^{-j2000\\pi t}&&\\longleftrightarrow\\;\\pi\\delta(\\omega-2000\\pi)+\\pi\\delta(\\omega+2000\\pi)\\\\\\sin(4000\\pi t)&=\\tfrac{1}{2j}e^{j4000\\pi t}-\\tfrac{1}{2j}e^{-j4000\\pi t}&&\\longleftrightarrow\\;\\frac{\\pi}{j}\\delta(\\omega-4000\\pi)-\\frac{\\pi}{j}\\delta(\\omega+4000\\pi)\\end{aligned}$$ Each impulse weight is $2\\pi$ times the coefficient of its exponential: $2\\pi\\cdot\\tfrac12=\\pi$ and $2\\pi\\cdot\\tfrac{1}{2j}=\\pi/j$. Adding the three lines gives $$\\begin{aligned}X(j\\omega)=2\\pi\\delta(\\omega)&+\\pi\\delta(\\omega-2000\\pi)+\\pi\\delta(\\omega+2000\\pi)\\\\&+\\frac{\\pi}{j}\\delta(\\omega-4000\\pi)-\\frac{\\pi}{j}\\delta(\\omega+4000\\pi).\\end{aligned}$$ Five impulses, each written as a function of $\\omega$ so that its position can be read. The furthest is at $4000\\pi$, so $\\omega_M=4000\\pi$ rad/s, that is $f_M=\\omega_M/2\\pi=2000$ Hz. The Nyquist rate is $2\\omega_M=8000\\pi$ rad/s, that is $2f_M=4000$ Hz. Then $$T=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}=2.5\\times10^{-4}\\ \\text{s}=0.25\\ \\text{ms}.$$'],
 ['Check','Three independent tests. $\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$. The copies are scaled by $1/T=4000$. And doubling the rate must halve the period: at $\\omega_s=16000\\pi$ the period is $125\\ \\mu$s, and $0.25$ ms divided by $125\\ \\mu$s is exactly 2.'],
 ['Warning','The answer is a quarter of a millisecond. Cancelling the $\\pi$ but not the thousand gives $0.25$ s, and every later number in the problem is then wrong by a factor of 1000. A quarter of a second between samples would be four samples per second for a signal carrying 2000 Hz.']
]},
{t:'ex', hd:'Example 7.4 — area, peak, and the height of a copy', rows:[
 ['Given','$x(t)=\\bigl(\\sin(4000\\pi t)/\\pi t\\bigr)^{2}$, the square of a signal whose transform is a rectangle of height 1 on $|\\omega|\\le4000\\pi$.'],
 ['Find','The peak of $X(j\\omega)$, the bandwidth, the Nyquist period, and the height of one copy after sampling.'],
 ['Method','Use the multiplication property because the signal is squared in time. The spectrum therefore convolves with itself and divides by $2\\pi$.'],
 ['Solution','Write $W=4000\\pi$ and $g(t)=\\sin(Wt)/\\pi t$, so that $x(t)=g(t)^{2}$. First confirm the transform of $g$ by inverting the rectangle $R(j\\omega)$ of height 1 on $|\\omega|\\le W$: $$\\begin{aligned}g(t)&=\\frac{1}{2\\pi}\\int_{-W}^{W}1\\cdot e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWt}-e^{-jWt}}{jt}=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(Wt)}{jt}=\\frac{\\sin(Wt)}{\\pi t}.\\end{aligned}$$ The bracket is the antiderivative of $e^{j\\omega t}$ with respect to $\\omega$, and $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ removes the $j$. Squaring in time is convolution in frequency divided by $2\\pi$: $$X(j\\omega)=\\frac{1}{2\\pi}\\bigl[R*R\\bigr](\\omega)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}R(j\\theta)\\,R\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta.$$ The integrand is 1 where both rectangles are 1, that is where $-W\\le\\theta\\le W$ and $\\omega-W\\le\\theta\\le\\omega+W$ at the same time, and 0 elsewhere. For $0\\le\\omega\\le2W$ the overlap runs from $\\omega-W$ to $W$: $$\\bigl[R*R\\bigr](\\omega)=\\int_{\\omega-W}^{W}1\\,\\d\\theta=W-(\\omega-W)=2W-\\omega.$$ For negative $\\omega$ the same argument gives $2W+\\omega$, so $[R*R](\\omega)=2W-|\\omega|$ on $|\\omega|\\le2W$ and 0 outside: a triangle. Its value at the origin, $A$, is the area of the full rectangle, and the peak of $X$ is $A$ divided by $2\\pi$: $$\\begin{gathered}A=\\bigl[R*R\\bigr](0)=\\int_{-W}^{W}(1)(1)\\,\\d\\theta=2W=8000\\pi,\\\\[3pt]X_{\\max}=X(0)=\\frac{A}{2\\pi}=\\frac{8000\\pi}{2\\pi}=4000.\\end{gathered}$$ The triangle reaches zero at $2W$, twice the rectangle half-width, so $\\omega_M=8000\\pi$ rad/s. The Nyquist rate is $2\\omega_M=16000\\pi$ rad/s, and $$T=\\frac{2\\pi}{16000\\pi}=\\frac{1}{8000}\\ \\text{s}=1.25\\times10^{-4}\\ \\text{s}=125\\ \\mu\\text{s}.$$ The copy height is $X_{\\max}/T=4000\\times8000=3.2\\times10^{7}$.'],
 ['Check','This bandwidth is twice the one in Example 7.3, so this period is half of it. And $\\omega_sT=16000\\pi\\times1.25\\times10^{-4}=2\\pi$.'],
 ['Warning','$A$ is an area and $X_{\\max}$ is the peak of a spectrum. They differ by $2\\pi$, so substituting one where the other belongs inflates every later height by that factor. Give the peak its own symbol.']
]},

{t:'h2', num:'7.7', text:'Reconstruction and band-limited interpolation'},
{t:'p', text:'If the copies stand clear, recovering $x(t)$ means keeping the one at the origin and discarding the rest.'},
{t:'eqbox', cap:'Ideal reconstruction filter',
 tex:['H_r(j\\omega)=\\begin{cases}T,&|\\omega|<\\omega_c\\\\0,&|\\omega|>\\omega_c\\end{cases}\\qquad \\omega_M<\\omega_c<\\omega_s-\\omega_M',
      'X_r(j\\omega)=H_r(j\\omega)\\,X_p(j\\omega)=T\\cdot\\tfrac{1}{T}X(j\\omega)=X(j\\omega)\\;\\Longrightarrow\\;x_r(t)=x(t)'],
 after:'Filtering multiplies the spectra. Inside $|\\omega|<\\omega_c$ only the $k=0$ term of the sum for $X_p(j\\omega)$ is non-zero, and that term is $X(j\\omega)/T$; every other copy starts at $\\omega_s-\\omega_M$ or beyond, which is outside the passband. The gain is $T$ because the baseband is $X(j\\omega)/T$. A filter of gain 1 returns a signal $T$ times too small, and since $T$ changes with the rate the error changes with it. The second line is true only when the copies do not overlap.'},
{t:'p', text:'Filtering is convolution, and $x_p$ is a train of impulses, so the output is a sum of shifted copies of the filter’s impulse response. Each sample is replaced by a curve of its own height, and the curves are added.'},
{t:'eqbox', cap:'Band-limited interpolation',
 tex:['\\begin{aligned}h_{LP}(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}H_r(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\omega_c}^{\\omega_c}T\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{T}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-\\omega_c}^{\\omega_c}=\\frac{T}{2\\pi}\\cdot\\frac{e^{j\\omega_ct}-e^{-j\\omega_ct}}{jt}\\\\&=\\frac{T}{2\\pi}\\cdot\\frac{2j\\sin(\\omega_ct)}{jt}=\\frac{T\\sin(\\omega_ct)}{\\pi t}\\end{aligned}',
      '\\begin{aligned}x_r(t)&=x_p(t)*h_{LP}(t)=\\int_{-\\infty}^{\\infty}\\Bigl[\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(\\tau-nT)\\Bigr]h_{LP}(t-\\tau)\\,\\d\\tau\\\\&=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,h_{LP}(t-nT)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\frac{T}{\\pi}\\cdot\\frac{\\sin\\bigl(\\omega_c(t-nT)\\bigr)}{t-nT}\\end{aligned}',
      '\\omega_c=\\frac{\\pi}{T}:\\qquad h_{LP}(t)=\\frac{T\\sin(\\pi t/T)}{\\pi t}=\\frac{\\sin(\\pi t/T)}{\\pi t/T}=\\operatorname{sinc}\\Bigl(\\frac{\\pi t}{T}\\Bigr)'],
 after:'The first chain is the inverse transform of $H_r$. The limits shrink to $\\pm\\omega_c$ because $H_r$ is zero outside them, and $T$ comes out as a constant. The bracket is the antiderivative of $e^{j\\omega t}$ with respect to $\\omega$; then $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ removes the $j$, and $2/2\\pi=1/\\pi$. The second chain is the convolution definition with the impulse train substituted for $x_p$; the sifting property evaluates $h_{LP}$ at $\\tau=nT$ for each $n$. Throughout this course $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, <b>unnormalised</b>. In the third line the second equality divides numerator and denominator by $T$. At $t=0$ the ratio $\\sin\\theta/\\theta$ tends to 1, and at $t=mT$ with $m\\ne0$ it is $\\sin(\\pi m)/(\\pi m)=0$. Anything written as $\\operatorname{sinc}(t/T)$ belongs to the other convention and is a different function.'},
{t:'box', kind:'err', hd:'Keep the factor of $\\pi$ inside the sine', html:'The kernel must equal 1 at $t=0$ and 0 at every other sample instant. Then each sample sets its own value without changing the others. Removing $\\pi$ breaks this condition: with $T=1$ the correct kernel at $t=1$ is $\\sin(\\pi)/\\pi=0$, while $\\sin(1)/\\pi=0.267849$. Also, $\\omega_c=\\pi/T$ equals $\\omega_s/2$, which is an endpoint of the admissible interval rather than an interior point. State this cutoff as a choice.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:520,h:190,xr:[-4.4,4.4],yr:[-0.42,1.28],xlabel:'t/T',ylabel:'h_{LP}(t)',xtarget:6});
   a.curve(u=>hLP(u,1),{color:C.h,n:2000});
   for(let m=-4;m<=4;m++) a.point(m,m===0?1:0,{color:C.coral,r:4});
   return a.svg(); },
  cap:'The kernel with $\\omega_c=\\pi/T$: one at its own instant, zero at every other.'},
 {svg:()=>{ const T=0.5, pts=samp(xB,T,-9,9);
   const a=ax({w:520,h:190,xr:[-3.2,3.2],yr:[-0.45,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',xtarget:6});
   pts.forEach(pr=>{ if(Math.abs(pr[0])>3.3) return;
     a.curve(t=>pr[1]*hLP(t-pr[0],T),{color:C.slate,width:1,opacity:.5,n:900}); });
   a.curve(t=>{ let s=0; for(let i=0;i<pts.length;i++) s+=pts[i][1]*hLP(t-pts[i][0],T); return s; },{color:C.out,width:2.2,n:1600});
   a.curve(xB,{color:C.in,width:1.2,dash:'3 5',opacity:.8,n:1600});
   return a.svg(); },
  cap:'One kernel per sample, in grey, and their sum. It lands on the dashed original.'}
]},

{t:'h2', num:'7.8', text:'The zero-order and first-order holds'},
{t:'p', text:'The ideal filter is not buildable: its impulse response starts before $t=0$ and never ends. What hardware does instead is hold.'},
{t:'eqbox', cap:'Zero-order hold',
 tex:['h_0(t)=\\begin{cases}1,&0\\le t<T\\\\0,&\\text{otherwise}\\end{cases}',
      '\\begin{aligned}H_0(j\\omega)&=\\int_{-\\infty}^{\\infty}h_0(t)\\,e^{-j\\omega t}\\,\\d t=\\int_0^Te^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_0^T=\\frac{1-e^{-j\\omega T}}{j\\omega}\\\\&=\\frac{e^{-j\\omega T/2}\\bigl(e^{j\\omega T/2}-e^{-j\\omega T/2}\\bigr)}{j\\omega}=\\frac{e^{-j\\omega T/2}\\cdot2j\\sin(\\omega T/2)}{j\\omega}\\\\&=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}=T\\,e^{-j\\omega T/2}\\,\\frac{\\sin(\\omega T/2)}{\\omega T/2}\\end{aligned}'],
 after:'The limits shrink to $0$ and $T$ because $h_0$ is zero elsewhere, and the integrand there is $1\\cdot e^{-j\\omega t}$. The bracket is the antiderivative of $e^{-j\\omega t}$; evaluating it at $T$ and at $0$ gives $(e^{-j\\omega T}-1)/(-j\\omega)$, which is the fraction shown. The second line factors $e^{-j\\omega T/2}$ out of $1-e^{-j\\omega T}$, which leaves $e^{j\\omega T/2}-e^{-j\\omega T/2}=2j\\sin(\\omega T/2)$; the $j$ then cancels. The last form multiplies and divides by $T/2$ to show the sinc, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$ unnormalised: $H_0(j\\omega)=T\\,e^{-j\\omega T/2}\\operatorname{sinc}(\\omega T/2)$. The magnitude is $|2\\sin(\\omega T/2)/\\omega|$, and where the sine is positive the phase is $-\\omega T/2$, a delay of half a sampling period. At the origin $\\sin\\theta/\\theta\\to1$, so $H_0(0)=T$: the hold already supplies the gain the ideal filter needed.'},
{t:'p', text:'The zero-order hold differs from the ideal filter in three ways. Its magnitude decreases below $T$ as $\\omega$ grows, so it changes the wanted spectrum. Its response is non-zero beyond the cutoff, so parts of neighbouring copies remain. Its phase also adds a delay. Correcting these effects would require the compensator'},
{t:'eq', tex:'H_r(j\\omega)=\\frac{H(j\\omega)}{H_0(j\\omega)}=e^{j\\omega T/2}H(j\\omega)\\,\\frac{\\omega}{2\\sin(\\omega T/2)},'},
{t:'p', text:'which has to advance in time and to grow without bound where $\\sin(\\omega T/2)$ vanishes. It is approximated in practice, not built.'},
{t:'eqbox', cap:'First-order hold',
 tex:['h_1(t)=\\frac{1}{T}\\bigl[g*g\\bigr](t),\\qquad g(t)=\\begin{cases}1,&|t|\\le T/2\\\\0,&\\text{otherwise}\\end{cases}',
      'G(j\\omega)=\\int_{-T/2}^{T/2}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T/2}^{T/2}=\\frac{e^{j\\omega T/2}-e^{-j\\omega T/2}}{j\\omega}=\\frac{2\\sin(\\omega T/2)}{\\omega}=\\frac{\\sin(\\omega T/2)}{\\omega/2}',
      'H_1(j\\omega)=\\frac{1}{T}G(j\\omega)\\,G(j\\omega)=\\frac{1}{T}\\left[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\right]^{2}'],
 after:'$G$ is the transform of the centred rectangle; the limits are $\\pm T/2$ because $g$ is zero outside them, and $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ cancels the $j$ as before. Convolution in time is multiplication in frequency, so $g*g$ transforms to $G\\cdot G$, and the constant $1/T$ passes through by linearity. The convolution of the rectangle with itself is $[g*g](t)=\\int_{|t|-T/2}^{T/2}1\\,\\d\\tau=T-|t|$ for $|t|\\le T$ and 0 outside: a triangle of peak $T$. So $h_1$ is a triangle of peak $1$ on the same interval and the output joins consecutive samples by straight lines. Every one of these is a function of $t$; the independent variable of all three sketches is time. $H_1$ is real and non-negative because it is a square. At $\\omega=0$, $\\sin(\\omega T/2)/(\\omega/2)\\to T$, so $H_1(0)=T^{2}/T=T$, and it falls off as $1/\\omega^{2}$ instead of $1/\\omega$.'},
{t:'box', kind:'err', hd:'A hold is not a reconstruction', html:'Both holds are filters with a real, non-flat, non-band-limited response. The staircase is a different signal from $x(t)$, and no argument about small steps makes them equal: raising the rate makes the error smaller but never zero at any finite rate. The sampling theorem guarantees that the samples <em>determine</em> $x(t)$ and names the filter that recovers it. Feeding the same samples to a different filter gives a different output.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const T=0.5, pts=samp(xB,T,-3.6,3.6);
   const a=ax({w:520,h:190,xr:[-3.2,3.2],yr:[-0.2,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;\\text{hold output}',
     pad:{l:74,r:22,t:26,b:34},xtarget:6});
   a.curve(xB,{color:C.in,width:1.3,dash:'3 5',opacity:.85,n:1600});
   const stair=[]; pts.forEach(pr=>{ stair.push([pr[0],pr[1]]); stair.push([pr[0]+T,pr[1]]); });
   a.poly(stair,{color:C.out,width:2.2});
   return a.svg(); },
  cap:'The zero-order hold: each sample held for one period.'},
 {svg:()=>{ const T=0.5;
   const a=ax({w:520,h:190,xr:[-6*PI,6*PI],yr:[-0.06,0.62],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H(j\\omega)|',
     pad:{l:62,r:22,t:26,b:34},xticksOverride:wTicks(-6*PI,6*PI,2*PI),xtickfmt:piTick});
   a.curve(w=>Math.abs(w)<1e-9?T:Math.abs(2*Math.sin(w*T/2)/w),{color:C.slate,width:1.6,dash:'4 4',n:1600});
   a.curve(w=>Math.abs(w)<1e-9?T:Math.pow(Math.sin(w*T/2)/(w/2),2)/T,{color:C.h,width:2.2,n:1600});
   return a.svg(); },
  cap:'With $T=0.5$ s: the first-order hold, solid, against the zero-order hold, dashed. Both start at $T$.'}
]},

{t:'h2', num:'7.9', text:'What comes back, and where from'},
{t:'p', text:'Take $x(t)=\\cos(\\omega_0t)$, so $\\omega_M=\\omega_0$, and reconstruct with the cutoff at $\\omega_c=\\omega_s/2$. The transform is $X(j\\omega)=\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$. Substitute it into the sampled-spectrum sum:'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)=\\frac{\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-k\\omega_s-\\omega_0)+\\delta(\\omega-k\\omega_s+\\omega_0)\\bigr].'},
{t:'p', text:'So sampling puts a line at every $k\\omega_s\\pm\\omega_0$, each of weight $\\pi/T$. The filter multiplies by $T$ inside $|\\omega|<\\omega_c$ and by 0 outside, so each surviving line returns to weight $\\pi$. List the lines for $k=0$ and $k=1$ and test each against the cutoff; the $k=-1$ lines are the mirror images at negative frequencies and give the same verdict.'},
{t:'eq', tex:'\\begin{aligned}\\omega_s=6\\omega_0,\\ \\omega_c=3\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{inside};\\\\&\\quad k=1:\\ 6\\omega_0\\pm\\omega_0=5\\omega_0,\\,7\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=3\\omega_0,\\ \\omega_c=1.5\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{inside};\\\\&\\quad k=1:\\ 3\\omega_0\\pm\\omega_0=2\\omega_0,\\,4\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=1.5\\omega_0,\\ \\omega_c=0.75\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{outside};\\\\&\\quad k=1:\\ 1.5\\omega_0-\\omega_0=0.5\\omega_0\\ \\text{inside},\\ 1.5\\omega_0+\\omega_0=2.5\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(0.5\\omega_0t)\\end{aligned}'},
{t:'eqbox', cap:'The alias frequency',
 tex:['X_r(j\\omega)=\\pi\\delta\\bigl(\\omega-(\\omega_s-\\omega_0)\\bigr)+\\pi\\delta\\bigl(\\omega+(\\omega_s-\\omega_0)\\bigr)\\;\\xrightarrow{\\ \\mathcal{F}^{-1}\\ }\\;x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)'],
 after:'In the third case the line at $\\omega_0$ lies outside the filter and is discarded, while the line the $k=1$ copy contributes at $\\omega_s-\\omega_0$ lies inside and is kept. The signal takes the identity of a lower frequency, $|\\omega_s-\\omega_0|$. Each impulse is written as a function of $\\omega$; an expression such as $\\pi\\delta(\\omega_s-\\omega_0)$ is a constant and locates nothing. The arrow is the inverse transform, going from a spectrum back to a signal.'},
{t:'ex', hd:'Example 7.5 — three periods for one cosine', rows:[
 ['Given','$x(t)=\\cos(2\\pi t)$, so $\\omega_M=2\\pi$ rad/s and the Nyquist rate is $4\\pi$ rad/s. Take $\\omega_c=\\omega_s/2$.'],
 ['Find','Whether $T_1=1/4$ s, $T_2=1/3$ s and $T_3=2/3$ s recover the signal, and what is recovered when one does not.'],
 ['Method','Use the sampled line spectrum because the filter selects individual lines. Compute $\\omega_s=2\\pi/T$, compare it with $4\\pi$, list all line positions, and keep only those inside the cutoff.'],
 ['Solution','The lines sit at $k\\omega_s\\pm2\\pi$. First the rates: $$\\begin{aligned}T_1=1/4\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{1/4}=8\\pi>4\\pi,\\quad\\omega_c=4\\pi\\\\T_2=1/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{1/3}=6\\pi>4\\pi,\\quad\\omega_c=3\\pi\\\\T_3=2/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{2/3}=3\\pi<4\\pi,\\quad\\omega_c=1.5\\pi\\end{aligned}$$ In the first two rows the baseband lines $\\pm2\\pi$ are inside the cutoff, and the nearest copy lines, $8\\pi-2\\pi=6\\pi$ and $6\\pi-2\\pi=4\\pi$, are outside, so $x_r(t)=\\cos(2\\pi t)$. In the third row the baseband lines $\\pm2\\pi$ lie outside $|\\omega|<1.5\\pi$ and are discarded. The $k=1$ copy puts lines at $3\\pi\\pm2\\pi$, that is at $5\\pi$ and at $\\pi$; the one at $\\pi$ is inside. The $k=-1$ copy gives the mirror line at $-\\pi$. So $$X_r(j\\omega)=\\pi\\delta(\\omega-\\pi)+\\pi\\delta(\\omega+\\pi)\\quad\\Longrightarrow\\quad x_r(t)=\\cos(\\pi t).$$ The alias frequency is $|\\omega_s-\\omega_0|=|3\\pi-2\\pi|=\\pi$ rad/s, with the integer $k=1$ chosen.'],
 ['Check','The sample values of the two signals must agree. With $T_3=2/3$: $$\\cos(2\\pi nT_3)=\\cos\\Bigl(\\frac{4\\pi n}{3}\\Bigr),\\qquad\\cos(\\pi nT_3)=\\cos\\Bigl(\\frac{2\\pi n}{3}\\Bigr).$$ Since $4\\pi n/3=2\\pi n-2\\pi n/3$, the cosine has period $2\\pi$, and the cosine is even, $\\cos(4\\pi n/3)=\\cos(-2\\pi n/3)=\\cos(2\\pi n/3)$. The two sample sequences are identical, so no reconstruction could prefer one over the other.'],
 ['Warning','The whole verdict rests on the number the rate is compared with, and for this signal that number is $2\\omega_M=4\\pi$. Comparing against a neighbouring problem’s bandwidth of $6\\pi$ makes the middle row read $6\\pi\\ge6\\pi$, an equality, so a comfortable margin is turned into the boundary case the theorem excludes.']
]},
{t:'ex', hd:'Example 7.6 — two components, one rate', rows:[
 ['Given','$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$, sampled with $T=2/5$ s.'],
 ['Find','$x_r(t)$, with $\\omega_c=\\omega_s/2$.'],
 ['Method','Treat the components separately because one can alias while the other remains unchanged. First test the rate against this signal’s Nyquist rate, then track each baseband and copy line through the filter.'],
 ['Solution','$\\omega_M=3\\pi$ rad/s, so the Nyquist rate is $2\\omega_M=6\\pi$ rad/s, while $$\\omega_s=\\frac{2\\pi}{T}=\\frac{2\\pi}{2/5}=5\\pi\\ \\text{rad/s},\\qquad\\omega_c=\\frac{\\omega_s}{2}=2.5\\pi\\ \\text{rad/s}.$$ Since $5\\pi<6\\pi$, aliasing is expected. Each component transforms to a pair of impulses of weight $\\pi$, and sampling puts lines at $k\\omega_s\\pm\\omega_0$ for each of the two values of $\\omega_0$. Test each line against $|\\omega|<2.5\\pi$: $$\\begin{aligned}\\omega_0=\\pi:&\\quad k=0:\\ \\pm\\pi\\ \\text{inside};\\\\&\\quad k=1:\\ 5\\pi-\\pi=4\\pi,\\ 5\\pi+\\pi=6\\pi\\ \\text{outside}\\\\\\omega_0=3\\pi:&\\quad k=0:\\ \\pm3\\pi\\ \\text{outside};\\\\&\\quad k=1:\\ 5\\pi-3\\pi=2\\pi\\ \\text{inside},\\ 5\\pi+3\\pi=8\\pi\\ \\text{outside}\\end{aligned}$$ Larger $|k|$ moves the lines further out, and $k=-1$ gives the mirror lines at $-2\\pi$ and $-4\\pi$. The filter multiplies the surviving lines by $T$, which cancels the $1/T$ of sampling and returns the weight $\\pi$. Hence $$X_r(j\\omega)=\\pi\\bigl[\\delta(\\omega-\\pi)+\\delta(\\omega+\\pi)\\bigr]+\\pi\\bigl[\\delta(\\omega-2\\pi)+\\delta(\\omega+2\\pi)\\bigr]$$ and $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$. The alias frequency of the second component is $|\\omega_s-\\omega_0|=|5\\pi-3\\pi|=2\\pi$ rad/s, with the integer $k=1$ chosen.'],
 ['Check','The aliased component and its replacement must give the same samples. With $T=2/5$: $$\\cos(3\\pi nT)=\\cos\\Bigl(\\frac{6\\pi n}{5}\\Bigr),\\qquad\\cos(2\\pi nT)=\\cos\\Bigl(\\frac{4\\pi n}{5}\\Bigr).$$ Since $6\\pi n/5=2\\pi n-4\\pi n/5$ and the cosine is even with period $2\\pi$, $\\cos(6\\pi n/5)=\\cos(4\\pi n/5)$, so the two sequences agree.'],
 ['Interpretation','The component at $\\pi$ remains unchanged. The component at $3\\pi$ appears at $2\\pi$, a frequency that was not present in the original signal.']
]},
{t:'fig', svg:()=>{
  const a=ax({w:700,h:200,xr:[-0.3,4.3],yr:[-2.4,2.4],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',xtarget:6});
  a.curve(t=>Math.cos(PI*t)+Math.cos(3*PI*t),{color:C.in,width:1.3,dash:'3 5',opacity:.85,n:2000});
  a.curve(t=>Math.cos(PI*t)+Math.cos(2*PI*t),{color:C.err,width:2.2,n:2000});
  samp(t=>Math.cos(PI*t)+Math.cos(3*PI*t),0.4,-0.3,4.3).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4.4}));
  return a.svg(); },
 cap:'Both curves pass through every sample. The solid one is what the filter returns.'},

{t:'h2', num:'7.10', text:'The anti-aliasing filter'},
{t:'p', text:'A real signal is not band-limited, and a sampler at a fixed rate cannot be helped after the fact. The repair is a lowpass filter placed <b>before</b> the sampler, which removes everything above $\\omega_s/2$ while it can still be removed cleanly.'},
{t:'fig', svg:()=>P.blocks({w:780,h:150,items:[
  {t:'arrow',x1:12,y1:80,x2:100,y2:80},
  {t:'box',x:100,y:54,w:150,h:52,label:'H_{AA}(j\\omega)',tex:true,fs:15},
  {t:'arrow',x1:250,y1:80,x2:345,y2:80},
  {t:'box',x:345,y:54,w:125,h:52,label:'sampler',fs:14},
  {t:'arrow',x1:470,y1:80,x2:560,y2:80},
  {t:'box',x:560,y:54,w:125,h:52,label:'H_r(j\\omega)',tex:true,fs:15},
  {t:'arrow',x1:685,y1:80,x2:770,y2:80},
  {t:'text',x:56,y:64,label:'x(t)',tex:true,fs:14,color:C.in},
  {t:'text',x:297,y:64,label:'\\tilde{x}(t)',tex:true,fs:14,color:C.h},
  {t:'text',x:515,y:64,label:'x_p(t)',tex:true,fs:14,color:C.mid},
  {t:'text',x:735,y:64,label:'x_r(t)',tex:true,fs:14,color:C.out}
]}), cap:'The chain in the only order that works. The sampler output is $x_p(t)$; the name $x_r(t)$ belongs to the output of the reconstruction filter and to nothing before it.'},
{t:'box', kind:'err', hd:'Place the filter before the sampler', html:'After sampling, aliased high-frequency content has already been added to wanted content at the same frequency. A later filter cannot separate those contributions. The anti-aliasing filter must remove the high frequencies before the sampler.'},
{t:'p', text:'The comparison is quantitative. Take $x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$ at $T=2/5$ s, as in Example 7.6. Without the filter, $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$ and the error is $e(t)=\\cos(3\\pi t)-\\cos(2\\pi t)$. With a lowpass at $\\omega_c=2.5\\pi$ ahead of the sampler, the component at $3\\pi$ is removed first, what is sampled is $\\cos(\\pi t)$ alone, it is recovered exactly, and the error is $e(t)=\\cos(3\\pi t)$.'},
{t:'eqbox', cap:'Mean-square error, averaged over one period of 2 s',
 tex:['\\begin{aligned}e^{2}(t)&=\\bigl[\\cos(3\\pi t)-\\cos(2\\pi t)\\bigr]^{2}=\\cos^{2}(3\\pi t)-2\\cos(3\\pi t)\\cos(2\\pi t)+\\cos^{2}(2\\pi t)\\\\&=\\cos^{2}(3\\pi t)-\\cos(\\pi t)-\\cos(5\\pi t)+\\cos^{2}(2\\pi t)\\end{aligned}',
      '\\overline{e^{2}}\\Big|_{\\text{no filter}}=\\frac{1}{2}\\int_{0}^{2}e^{2}(t)\\,\\d t=\\tfrac12-0-0+\\tfrac12=1,\\qquad \\overline{e^{2}}\\Big|_{\\text{filtered}}=\\frac{1}{2}\\int_{0}^{2}\\cos^{2}(3\\pi t)\\,\\d t=\\tfrac12'],
 after:'The cross term uses $2\\cos a\\cos b=\\cos(a-b)+\\cos(a+b)$ with $a=3\\pi t$ and $b=2\\pi t$. The window of 2 s holds a whole number of periods of every term: $\\cos(\\pi t)$ has period 2 s, $\\cos(5\\pi t)$ has period 0.4 s, and $\\cos^{2}(3\\pi t)=\\tfrac12+\\tfrac12\\cos(6\\pi t)$ has period $1/3$ s. A cosine averages to zero over a whole number of periods, so each cross term contributes 0 and each squared cosine contributes $\\tfrac12$. Filtering first halves the error power. It costs the component at $3\\pi$, which was lost either way; what it buys is the removal of an impostor at $2\\pi$, a frequency the signal never contained. Losing content is a known, bounded error. Adding content that was never there is not, because nothing downstream can tell it apart from the signal.'},
{t:'box', hd:'No finite-duration signal is band-limited', html:'A rectangular pulse of width $2T_1$ has transform $2\\sin(\\omega T_1)/\\omega$, which crosses zero again and again but is never zero on a whole interval. There is no $\\omega_M$ beyond which it vanishes, so no rate makes the copies disjoint and some aliasing is present at every rate. What is done in practice is to impose the band limit with a filter, and then to reconstruct the <em>filtered</em> signal exactly. The difference from the original is a design decision with a known size, not an accident.'},

{t:'h2', num:'7.11', text:'Aliasing in time and in space'},
{t:'p', text:'A camera is a sampler with $T=1/f_s$, and a strobe lamp is the same device built from light. Nothing about the rule changes.'},
{t:'ex', hd:'Example 7.7 — a wheel that turns backwards', rows:[
 ['Given','A marked spoke turns at 9 revolutions per second. A camera records 10 frames per second.'],
 ['Find','The rotation the recording appears to show.'],
 ['Method','Model the spoke angle as a sinusoid because the camera records it at regular time instants. Convert both rates to rad/s, compare them, and locate the surviving line with the cutoff at $\\omega_c=\\omega_s/2$.'],
 ['Solution','The spoke turns at $f_0=9$ Hz, so $\\omega_0=2\\pi f_0=18\\pi$ rad/s. The camera samples at $f_s=10$ Hz, so $\\omega_s=2\\pi f_s=20\\pi$ rad/s and $\\omega_c=10\\pi$ rad/s. The Nyquist rate is $2\\omega_0=36\\pi$ rad/s and $\\omega_s=20\\pi<36\\pi$, so the rate is below it. The lines sit at $k\\omega_s\\pm\\omega_0$: $$\\begin{aligned}k=0:&\\quad\\pm18\\pi\\ \\text{outside }|\\omega|<10\\pi\\\\k=1:&\\quad20\\pi-18\\pi=2\\pi\\ \\text{inside},\\qquad20\\pi+18\\pi=38\\pi\\ \\text{outside}\\end{aligned}$$ The $k=-1$ copy gives the mirror line at $-2\\pi$. So the surviving line sits at $|\\omega_s-\\omega_0|=2\\pi$ rad/s, with $k=1$ chosen, that is $2\\pi/2\\pi=1$ revolution per second. In hertz the same subtraction reads $f_s-f_0=10-9=1$ Hz. The line at $+2\\pi$ comes from the impulse at $-18\\pi$, the negative-frequency component, moved up by $\\omega_s$. The positive and negative components have exchanged roles, so the apparent rotation is in the opposite direction.'],
 ['Check','Frame $n$ is taken at $t=n/10$ s. The recorded angle is $$\\cos\\Bigl(18\\pi\\cdot\\frac{n}{10}\\Bigr)=\\cos\\Bigl(2\\pi n-\\frac{2\\pi n}{10}\\Bigr)=\\cos\\Bigl(\\frac{2\\pi n}{10}\\Bigr),$$ using $18\\pi n/10=2\\pi n-2\\pi n/10$, the period $2\\pi$ of the cosine, and its evenness. These are exactly the frames a 1 Hz rotation would produce. Between frames the spoke advances $9/10$ of a turn, which the eye reads as $1/10$ of a turn backwards. At 20 frames per second, $\\omega_s=40\\pi>36\\pi$ and the recording is correct.']
]},
{t:'p', text:'Position takes the place of time without any change to the arithmetic. A striped pattern of 9 cycles per millimetre recorded on a grid of 10 sample points per millimetre satisfies $2\\times9>10$, so it is recorded as a pattern of $|10-9|=1$ cycle per millimetre. The broad bands the grid produces are smooth, regular and convincing, and nothing in the samples marks them as false. Two regular patterns laid over one another give the same effect without any sampler: stripes at $1.0$ mm and at $1.1$ mm have spatial frequencies $1.000$ and $0.909$ cycles per millimetre, so the pattern they make together repeats every $11$ mm.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax({w:520,h:190,xr:[-0.05,1.05],yr:[-1.45,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'\\cos\\theta(t)',xtarget:5});
   a.curve(t=>Math.cos(18*PI*t),{color:C.in,width:1.1,dash:'3 5',opacity:.8,n:2600});
   a.curve(t=>Math.cos(2*PI*t),{color:C.err,width:2.2,n:1600});
   samp(t=>Math.cos(18*PI*t),0.1,-0.05,1.05).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4.4}));
   return a.svg(); },
  cap:'Nine revolutions per second, dashed, ten frames per second as dots, and the one revolution per second the frames describe.'},
 {svg:()=>{ const a=ax({w:520,h:190,xr:[-0.05,2.05],yr:[-0.15,1.25],xlabel:'x\\;[\\text{mm}]',ylabel:'\\text{brightness}',
     pad:{l:74,r:22,t:26,b:34},xtarget:5});
   a.curve(x=>0.5+0.5*Math.cos(2*PI*9*x),{color:C.in,width:1.0,opacity:.7,n:3200});
   a.curve(x=>0.5+0.5*Math.cos(2*PI*x),{color:C.err,width:2.2,n:1600});
   samp(x=>0.5+0.5*Math.cos(2*PI*9*x),0.1,-0.05,2.05).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4}));
   return a.svg(); },
  cap:'The same arithmetic in space: nine cycles per millimetre recorded as one.'}
]},

{t:'h2', num:'7.12', text:'Summary'},
{t:'ol', items:[
 'Find $\\omega_M$, the highest angular frequency the signal carries. If there is none, the signal is not band-limited and must be filtered before anything else.',
 'Choose $\\omega_s$ strictly above $2\\omega_M$, leaving a guard band $\\omega_s-2\\omega_M$ wide enough for a real filter.',
 'Compute $T=2\\pi/\\omega_s$ and check $\\omega_sT=2\\pi$. Quote $f_s=1/T$ in hertz only when hertz was asked for.',
 'Draw the copies at every multiple of $\\omega_s$, each $1/T$ times the original height, and mark the baseband $k=0$.',
 'Place the reconstruction filter: gain $T$, cutoff strictly inside $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.',
 'If the copies overlap, say which line came from which copy and give the alias frequency $|\\omega_s-\\omega_0|$ for each component that moved.'
]},
{t:'box', kind:'err', hd:'The four traps, in one place', html:'Saying the copies disappear below the Nyquist rate — they never do, they overlap. Treating $\\omega_s=2\\omega_M$ as safe — the admissible cutoff interval is empty there. Reading $2\\pi/T$ in hertz — that is rad/s, and the error is a factor of $2\\pi$. Calling a hold output the reconstructed signal — a hold is an approximation with a measurable error.'},
{t:'p', text:'When the signal is band-limited and the sampling rate satisfies the strict condition, its samples determine it uniquely. This result allows the earlier continuous-time operations to be represented and processed with discrete samples.'},

{t:'h2', num:'7.13', text:'Exercises'},
{t:'q', n:'7.1', text:'A signal is sampled at $\\omega_s=8000\\pi$ rad/s. Give $T$ and $f_s$, and verify the period with a unit check.', ans:'$T=2\\pi/\\omega_s=1/4000$ s $=0.25$ ms and $f_s=1/T=4000$ Hz. Check: $\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$. Note that $0.25$ s fails the same check by a factor of 1000.'},
{t:'q', n:'7.2', text:'State in one sentence each what sampling does at every rate, and what happens only below the Nyquist rate.', ans:'At every rate sampling puts a copy of $X(j\\omega)$ at every multiple of $\\omega_s$, scaled by $1/T$. Below the Nyquist rate those copies overlap and add, and that overlap is aliasing.'},
{t:'q', n:'7.3', text:'Show that the sampling theorem cannot be satisfied at $\\omega_s=2\\omega_M$, and give a signal that demonstrates it.', ans:'The cutoff condition $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ becomes $\\omega_M<\\omega_c<\\omega_M$, which is empty. For $x(t)=\\sin(\\omega_Mt)$ sampled at $\\omega_s=2\\omega_M$ every sample is $\\sin(\\pi n)=0$: the baseband and the $k=1$ copy contribute equal and opposite weights at $\\pm\\omega_M$.'},
{t:'q', n:'7.4', text:'A triangular spectrum has peak $X_{\\max}=4000$ and is sampled with $T=125\\ \\mu$s. Find the height of one copy, and say why the area $A=8000\\pi$ is not the number to use.', ans:'$X_{\\max}/T=4000\\times8000=3.2\\times10^{7}$. The area of the convolution and the peak of the spectrum differ by $2\\pi$, since squaring in time convolves in frequency and divides by $2\\pi$; using $A$ inflates every height by that factor.'},
{t:'q', n:'7.5', text:'$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$ is sampled with $T=2/5$ s and reconstructed with $\\omega_c=\\omega_s/2$. Find $x_r(t)$ and name the component that moved.', ans:'$\\omega_s=5\\pi<6\\pi$, so aliasing occurs. Surviving lines: $\\pi$ from the baseband and $5\\pi-3\\pi=2\\pi$ from the $k=1$ copy, giving $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$. The component at $3\\pi$ moved to $2\\pi$; the one at $\\pi$ passed untouched.'},
{t:'q', n:'7.6', text:'Explain why the anti-aliasing filter must precede the sampler, and state what the output of the whole chain is equal to.', ans:'After the sampler the intruding content has been added to the wanted content at the same frequency, and a filter cannot recover two numbers from their sum. Placed first, the filter removes that content while it is still at its own frequency. The output then equals the filtered signal exactly, not the original, and the difference is set by the chosen cutoff.'}
];
})();
