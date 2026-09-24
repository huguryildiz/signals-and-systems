/* Course notes — Chapter 7, Sampling and aliasing */
(function(){
const P=PLOT, C=P.COL, PI=Math.PI;
/* one figure across the column, two side by side, three side by side */
const ax =o=>P.Axes(Object.assign({w:700,h:200,pad:{l:58,r:24,t:26,b:34},xtarget:8,ytarget:3},o));
const ax2=o=>ax(Object.assign({w:520,h:200,xtarget:6},o));
const ax3=o=>ax(Object.assign({w:340,h:190,pad:{l:50,r:18,t:26,b:34},xtarget:5,ytarget:2},o));
/* stems over an integer range */
const D=(f,a,b)=>{ const o=[]; for(let n=Math.ceil(a);n<=b;n++) o.push([n,f(n)]); return o; };
/* the running signal x(t) = (sin(pi t)/(pi t))^2: a triangle spectrum of
   peak 1 that reaches zero at |w| = 2 pi rad/s */
const xB=t=>{ const u=PI*t; return Math.abs(u)<1e-9?1:Math.pow(Math.sin(u)/u,2); };
const WM=2*PI;
/* one triangular copy: undefined outside its band, so a copy drawn alone shows
   only the interval it occupies; tri0 is the same copy, zero outside */
const tri =(w,wm,pk)=>Math.abs(w)<=wm?pk*(1-Math.abs(w)/wm):NaN;
const tri0=(w,wm,pk)=>Math.abs(w)<=wm?pk*(1-Math.abs(w)/wm):0;
const rep =(w,wm,pk,ws,K)=>{ let s=0; for(let k=-K;k<=K;k++) s+=tri0(w-k*ws,wm,pk); return s; };
/* samples of a continuous signal over a window, as [t, x(t)] pairs */
const samp=(f,T,a,b)=>{ const o=[]; for(let n=Math.ceil(a/T-1e-9);n*T<=b+1e-9;n++) o.push([n*T,f(n*T)]); return o; };
/* the unnormalised sinc, sinc(theta) = sin(theta)/theta */
const sinc=u=>Math.abs(u)<1e-9?1:Math.sin(u)/u;
/* the magnitudes of the zero-order and the first-order hold */
const H0m=(w,T)=>Math.abs(w)<1e-9?T:Math.abs(2*Math.sin(w*T/2)/w);
const H1m=(w,T)=>Math.abs(w)<1e-9?T:Math.pow(Math.sin(w*T/2)/(w/2),2)/T;
/* the frequency a sampled tone comes back at, in [0, fs/2] */
const fold=(f0,fs)=>Math.abs(f0-fs*Math.floor(f0/fs+0.5));
/* a signal colour as a translucent wash */
const wash=(c,a)=>{ const n=parseInt(c.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
/* the baseband keeps the input colour, the copies are violet */
const KCOL=k=>k===0?C.in:C.mid;
/* the lines of a sum of cosines after sampling at ws, over |w| < span: kept
   inside |w| < ws/2 (cyan from the signal, red from a copy), grey outside */
const lines=(a,ws,comps,span)=>{ const wc=ws/2, K=Math.ceil((span+Math.max(...comps))/ws)+1;
  for(let k=-K;k<=K;k++) for(const w0 of comps) for(const s of [1,-1]){
    const pos=k*ws+s*w0; if(Math.abs(pos)>span-1e-9) continue;
    const keep=Math.abs(pos)<wc-1e-9;
    a.impulse(pos,1,{color:keep?(k===0?C.in:C.err):C.muted,label:false}); }
  a.rect(-wc,0,wc,1.25,{stroke:C.h,dash:'6 4',width:1.6}); };
/* Section 7.5: a triangle of peak 1 and half-width h at c, repeated every 2 pi */
const tri5=(x,c,h)=>Math.abs(x-c)<h?1-Math.abs(x-c)/h:0;
/* Section 7.6: the running sequence (sin(pi n/8)/(pi n/8))^2 and its periodic
   triangle spectrum, peak 8, band edge pi/4 */
const x6=n=>{ const u=PI*n/8; return Math.abs(u)<1e-12?1:Math.pow(Math.sin(u)/u,2); };
const W6=PI/4;
const wrap=w=>w-2*PI*Math.round(w/(2*PI));
const tri6=(w,c,W,pk)=>{ const u=Math.abs(wrap(w-c)); return u<W?pk*(1-u/W):NaN; };
const tri60=(w,c,W,pk)=>{ const v=tri6(w,c,W,pk); return isFinite(v)?v:0; };
/* the dashed marks of one period of a discrete-time spectrum */
const period=(a,v)=>{ a.vline(-PI,{color:C.coral,opacity:.5}); a.vline(PI,{color:C.coral,opacity:.5});
  a.span(-PI,PI,v,'',{color:C.coral});
  a.note(-PI,v,'\\text{one period},\\;2\\pi',{tex:true,color:C.coral,fs:12,anchor:'end',dx:-8,dy:-3}); return a; };

window.C7 = [
{t:'page'},

{t:'h1', num:'CHAPTER 7', text:'Sampling and aliasing'},
{t:'p', lead:true, text:'Sampling keeps the value of a signal every $T$ seconds and discards the values between those instants. This chapter gives the condition under which the samples still determine the signal, builds the filter that rebuilds it, and shows how the signal changes when the condition fails. It then processes the samples as numbers, and changes the rate of a sequence that is already sampled.'},
{t:'eqbox', cap:'The chapter in two lines',
 tex:['X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)',
      '\\omega_s>2\\omega_M\\;\\Longrightarrow\\;x(t)\\ \\text{can be recovered from}\\ x(nT)'],
 after:'The first line says that sampling <b>replicates</b> the spectrum, at every rate. The second says that the copies stay apart when the rate is high enough. Copies that reach each other <b>overlap</b>, and only that overlap is <b>aliasing</b>. Keeping the two words apart is most of this chapter.'},
{t:'p', text:'Section 7.1 models the sampler and derives the spectrum of its output. Section 7.2 defines aliasing and states the sampling theorem. Section 7.3 rebuilds the signal from its samples, first exactly and then with the holds a converter uses. Section 7.4 applies the alias rule to tones, to a chirp, to a camera and to an image. Section 7.5 processes the samples with a discrete-time system. Section 7.6 samples a sequence and changes its rate.'},

/* ================================================================ 7.1 */
{t:'h2', num:'7.1', text:'The sampler and the sampled spectrum'},
{t:'h3', text:'Impulse-train sampling'},
{t:'p', text:'Sampling is modelled as a multiplication. The sampling function is an impulse train of period $T$, and the sampled signal is the product of the signal with it. The model keeps the sampled signal a function of continuous time, so the Fourier transform of Chapter 5 applies to it.'},
{t:'eqbox', cap:'Impulse-train sampling',
 tex:['p(t)=\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT),\\qquad x_p(t)=x(t)\\,p(t)',
      '\\begin{aligned}x_p(t)&=x(t)\\sum_{n=-\\infty}^{\\infty}\\delta(t-nT)\\\\&=\\sum_{n=-\\infty}^{\\infty}x(t)\\,\\delta(t-nT)\\\\&=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(t-nT)\\end{aligned}'],
 after:'The first step substitutes $p(t)$ into the product. The second step moves $x(t)$ inside the sum, because multiplication distributes over addition. The third step uses the sifting property $x(t)\\delta(t-nT)=x(nT)\\delta(t-nT)$: an impulse is zero everywhere except at its own instant, so only the value of $x$ at $t=nT$ survives.'},
{t:'box', hd:'How an impulse is drawn', html:'An impulse is drawn as an arrow whose <b>height is its weight</b>. In a picture of $x_p(t)$ the arrow at $t=nT$ therefore reaches $x(nT)$, and the arrowheads trace the signal itself. The arrows are weights, not values of a function. A sample equal to zero gives no arrow at all.'},
{t:'p', text:'This chapter uses one running signal, $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$. Its transform is a triangle of peak 1 that reaches zero at $|\\omega|=2\\pi$ rad/s (Example 7.5 derives a spectrum of this shape). So the highest angular frequency it carries is $\\omega_M=2\\pi$ rad/s.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-2.2,2.2],yr:[-0.15,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;p(t)',yticksOverride:[0,0.5,1]});
   for(let n=-8;n<=8;n++) a.impulse(n*0.25,1,{color:C.h,label:false,width:1.4});
   a.curve(xB,{color:C.in,n:1600}); return a.svg(); },
  cap:'The running signal $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$ and the impulse train $p(t)$ with $T=0.25$ s, each impulse of weight 1.', short:'The running signal and the impulse train, $T=0.25$ s.'},
 {svg:()=>{ const a=ax2({xr:[-2.2,2.2],yr:[-0.15,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x_p(t)',yticksOverride:[0,0.5,1]});
   a.curve(xB,{color:C.in,width:1.2,dash:'4 5',n:1600});
   D(n=>xB(n*0.25),-8,8).forEach(([n,v])=>{ if(v>0.012) a.impulse(n*0.25,v,{color:C.mid,label:false}); });
   return a.svg(); },
  cap:'The product $x_p(t)=x(t)\\,p(t)$. Each impulse now has weight $x(nT)$, so the arrowheads trace $x(t)$, dashed.', short:'The sampled signal $x_p(t)$, $T=0.25$ s.'}
]},

{t:'h3', text:'Samples as a sequence'},
{t:'p', text:'The sampler keeps only the numbers $x(nT)$. Written as a sequence, they are'},
{t:'eq', tex:'x_p[n]=x(nT),\\qquad n=0,\\pm1,\\pm2,\\dots'},
{t:'p', text:'The rest of the chapter asks when these numbers are enough to rebuild $x(t)$. The period $T$ spreads the arrows in time, but the sequence keeps exactly one number for each arrow. For the running signal, $x(t)=0$ first at $t=1$ s, because $\\sin(\\pi\\cdot1)=0$. With $T=0.2$ s the instant $nT=1$ s is $n=1/0.2=5$, so $x_p[5]$ is the first zero sample after $n=0$.'},

{t:'h3', text:'The rate, in radians per second and in hertz'},
{t:'p', text:'A sampling rate can be stated as an angular frequency or in hertz. Both forms are defined here so that their units stay distinct.'},
{t:'eqbox', cap:'Sampling rate, both readings',
 tex:['\\omega_s=\\frac{2\\pi}{T}\\ \\left[\\frac{\\text{rad}}{\\text{s}}\\right],\\qquad f_s=\\frac{1}{T}\\ [\\text{Hz}],\\qquad \\omega_s=2\\pi f_s'],
 after:'$\\omega_s$ is the sampling <b>angular</b> frequency. It is the angle that $\\cos(\\omega_st)$ turns through per second, and it turns through $2\\pi$ rad in each period $T$. $f_s$ is the sampling frequency in hertz, the number of samples taken per second. Every spectrum in Sections 7.1 to 7.4 is drawn against $\\omega$ in rad/s, so $\\omega_s$ is the working symbol; the hertz reading appears where a physical rate is quoted.'},
{t:'box', kind:'err', hd:'The factor of $2\\pi$', html:'Calling $2\\pi/T$ the sampling frequency and then reading it in hertz is a costly slip. With $T=0.25$ ms $=2.5\\times10^{-4}$ s the two readings are $\\omega_s=2\\pi/(2.5\\times10^{-4})=8000\\pi$ rad/s and $f_s=1/(2.5\\times10^{-4})=4000$ Hz. They differ by $2\\pi$, and an answer that mixes them is wrong by that factor everywhere it is used. The same applies to the signal: a bandwidth of $\\omega_M$ rad/s is $f_M=\\omega_M/2\\pi$ hertz.'},
{t:'p', text:'One multiplication tests any pair of values: $\\omega_sT=2\\pi$ always, and $f_sT=1$ always. For example, a sensor that takes 200 samples per second has $f_s=200$ Hz, so $\\omega_s=2\\pi f_s=2\\pi\\times200=400\\pi$ rad/s; the check is $400\\pi\\times\\frac{1}{200}=2\\pi$.'},

{t:'h3', text:'The transform of the impulse train'},
{t:'p', text:'Multiplication in time is convolution in frequency. So the spectrum of $x_p(t)$ needs the transform of the impulse train $p(t)$. Four steps give the result. Step 1 writes the product as a convolution. Step 2 finds $P(j\\omega)$ from the Fourier series of $p(t)$. Steps 3 and 4 substitute $P$ and evaluate the convolution with the sifting property.'},
{t:'p', text:'Step 1 is the multiplication property of Chapter 5. A product in time is a convolution in frequency, divided by $2\\pi$; the $1/2\\pi$ is the same factor that appears in the inverse transform.'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{2\\pi}\\bigl[X(j\\omega)*P(j\\omega)\\bigr]=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,P\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta.'},
{t:'eqbox', cap:'Step 2a: the Fourier series of the impulse train',
 tex:['p(t)=\\sum_{k=-\\infty}^{\\infty}a_k\\,e^{jk\\omega_st},\\qquad \\omega_s=\\frac{2\\pi}{T}',
      '\\begin{aligned}a_k&=\\frac{1}{T}\\int_{-T/2}^{T/2}p(t)\\,e^{-jk\\omega_st}\\,\\d t\\\\&=\\frac{1}{T}\\int_{-T/2}^{T/2}\\delta(t)\\,e^{-jk\\omega_st}\\,\\d t\\\\&=\\frac{1}{T}\\,e^{-jk\\omega_s\\cdot0}=\\frac{1}{T}\\end{aligned}'],
 after:'$p(t)$ is periodic with period $T$, so it has a Fourier series with fundamental frequency $\\omega_s=2\\pi/T$. The coefficient integral runs over one period, $-T/2<t<T/2$. Only the impulse at $n=0$ lies inside that window, so $p(t)$ equals $\\delta(t)$ there. The sifting property then evaluates the exponential at $t=0$, where it equals 1. Every coefficient is the same number, $1/T$.'},
{t:'eqbox', cap:'Step 2b: the transform of the impulse train',
 tex:['e^{jk\\omega_st}\\;\\longleftrightarrow\\;2\\pi\\,\\delta(\\omega-k\\omega_s)',
      'P(j\\omega)=\\sum_{k=-\\infty}^{\\infty}\\frac{1}{T}\\cdot2\\pi\\,\\delta(\\omega-k\\omega_s)=\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s)'],
 after:'The first line is the transform pair of a complex exponential. The transform is linear, so each term of the series transforms separately and the constant $1/T$ passes through. An impulse train of spacing $T$ in time is therefore an impulse train of spacing $\\omega_s$ in frequency, with weight $2\\pi/T$ on every impulse. For example, $T=0.1$ s puts the impulses of $P(j\\omega)$ $\\omega_s=2\\pi/0.1=20\\pi$ rad/s apart.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-2.2,2.2],yr:[-0.15,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'p(t)',yticksOverride:[0,1]});
   for(let n=-5;n<=5;n++) a.impulse(n*0.4,1,{color:C.h,label:false}); return a.svg(); },
  cap:'The impulse train $p(t)$ with $T=0.4$ s: weight $1$ every $0.4$ s.', short:'The impulse train $p(t)$, $T=0.4$ s.'},
 {svg:()=>{ const ws=5*PI;
   const a=ax2({xr:[-16*PI,16*PI],yr:[-1,21],xpi:5*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'P(j\\omega)',yticksOverride:[0,5*PI],ytickfmt:P.piTick});
   for(let k=-3;k<=3;k++) a.impulse(k*ws,ws,{color:C.h,label:false});
   a.note(0.5*PI,18.6,'\\text{weight}\\;\\tfrac{2\\pi}{T}=5\\pi',{tex:true,anchor:'start',color:C.h,fs:13});
   return a.svg(); },
  cap:'Its transform $P(j\\omega)$: an impulse every $\\omega_s=5\\pi$ rad/s, each drawn with height equal to its weight $2\\pi/T=5\\pi$.', short:'The transform $P(j\\omega)$ of the impulse train, $T=0.4$ s.'}
]},

{t:'h3', text:'The spectrum of a sampled signal'},
{t:'p', text:'Step 3 substitutes $P$ from Step 2b into the convolution of Step 1. Step 4 evaluates the integral with the sifting property.'},
{t:'eq', tex:'\\begin{aligned}X_p(j\\omega)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,\\frac{2\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-\\theta-k\\omega_s)\\,\\d\\theta\\\\&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}\\int_{-\\infty}^{\\infty}X(j\\theta)\\,\\delta\\bigl(\\theta-(\\omega-k\\omega_s)\\bigr)\\,\\d\\theta\\\\&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr).\\end{aligned}'},
{t:'p', text:'In the second line the constants $1/2\\pi$ and $2\\pi/T$ multiply to $1/T$, and the sum is taken outside the integral. The impulse is even, so $\\delta(\\omega-\\theta-k\\omega_s)=\\delta\\bigl(\\theta-(\\omega-k\\omega_s)\\bigr)$; writing it this way shows where it sits on the $\\theta$ axis. In the third line the sifting property picks out $X$ at $\\theta=\\omega-k\\omega_s$.'},
{t:'eqbox', cap:'Key result: the spectrum of the sampled signal',
 tex:['X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)'],
 after:'Each term is one copy of $X(j\\omega)$, moved to $k\\omega_s$ and scaled by $1/T$, not by 1. The reconstruction filter of Section 7.3 carries gain $T$, the inverse, so the two belong together. For example, if $X(j0)=2$, $T=0.05$ s and the copies do not overlap, only the $k=0$ copy reaches $\\omega=0$, and $X_p(j0)=X(j0)/T=2/0.05=40$.'},
{t:'fig', svg:()=>{ const ws=5*PI, pk=2.5;
  const a=ax({xr:[-11*PI,11*PI],yr:[-0.25,3.4],xpi:5*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[0,1,2.5]});
  for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1400});
  a.note(0,pk+0.35,'k=0',{tex:true,anchor:'start',dx:9,color:C.in,fs:13});
  for(const k of [-2,-1,1,2]) a.note(k*ws,pk+0.25,'k='+k,{tex:true,anchor:'middle',color:C.mid,fs:13});
  return a.svg(); },
 cap:'The sampled spectrum of the running signal at $T=0.4$ s, so $\\omega_s=5\\pi$ rad/s. Every copy has height $1/T=2.5$, and one sits at each multiple of $\\omega_s$.', short:'The sampled spectrum at $T=0.4$ s.'},

{t:'h3', text:'Replication at every rate'},
{t:'p', text:'The sum for $X_p(j\\omega)$ runs over every integer $k$ for every value of $T$. There is no rate at which the copies fail to appear, and no rate at which they disappear.'},
{t:'box', hd:'Naming the pieces', html:'The term $k=0$ is $X(j\\omega)/T$, the spectrum of the signal itself, where it always sat. It is the <b>baseband</b>. The terms $k=\\pm1,\\pm2,\\dots$ are the <b>copies</b>, centred at $\\pm\\omega_s,\\pm2\\omega_s,\\dots$'},
{t:'box', kind:'err', hd:'The centre is not the first copy', html:'The baseband is $k=0$, not a copy. Calling it the first copy puts every later count off by one.'},
{t:'p', text:'Only two things change with the rate. The copies sit $\\omega_s=2\\pi/T$ apart, so a slower sampler (larger $T$) brings them closer. Each copy is scaled by $1/T$, so a slower sampler also makes every copy shorter. Halving $T$ therefore doubles both the spacing $2\\pi/T$ and the height $1/T$.'},

{t:'h3', text:'Sampling rate and guard band'},
{t:'p', text:'The baseband occupies $|\\omega|\\le\\omega_M$. The copy at $k=1$ is $X\\bigl(j(\\omega-\\omega_s)\\bigr)/T$, which is non-zero where $|\\omega-\\omega_s|\\le\\omega_M$, that is on $\\omega_s-\\omega_M\\le\\omega\\le\\omega_s+\\omega_M$. So it begins at $\\omega_s-\\omega_M$. The gap between the two decides everything.'},
{t:'eqbox', cap:'Guard band',
 tex:['\\underbrace{(\\omega_s-\\omega_M)}_{\\text{copy }k=1\\text{ starts}}-\\underbrace{\\omega_M}_{\\text{baseband ends}}=\\omega_s-2\\omega_M'],
 after:'The gap can be positive, zero or negative. For example, with $\\omega_M=3\\pi$ rad/s and $\\omega_s=8\\pi$ rad/s it is $8\\pi-2\\cdot3\\pi=2\\pi$ rad/s.'},
{t:'ul', items:[
 '$\\omega_s>2\\omega_M$, <b>oversampling</b>: the gap is positive and the copies stand apart.',
 '$\\omega_s=2\\omega_M$, <b>the Nyquist rate</b>: the gap is zero and the copies touch at $\\pm\\omega_M$.',
 '$\\omega_s<2\\omega_M$, <b>undersampling</b>: the gap is negative, and neighbouring copies overlap and add.'
]},
{t:'box', kind:'err', hd:'Touching is already too late', html:'At $\\omega_s=2\\omega_M$ a filter edge placed at $\\omega_M$ either drops a component that sits exactly there or takes in the edge of the next copy. So the rate must satisfy $\\omega_s>2\\omega_M$, strictly. Example 7.1 shows a signal that loses a whole component at the boundary.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const ws=5*PI, pk=2.5;
   const a=ax3({xr:[-8*PI,8*PI],yr:[-0.2,3.5],xpi:4*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)'});
   for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1200});
   a.span(WM,ws-WM,3.0,'\\pi',{color:C.out,fs:12,tex:true});
   return a.svg(); },
  cap:'Oversampling, $\\omega_s=5\\pi$ rad/s: a guard band of $\\pi$ rad/s.'},
 {svg:()=>{ const ws=4*PI, pk=2;
   const a=ax3({xr:[-8*PI,8*PI],yr:[-0.2,3.0],xpi:4*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)'});
   for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1200});
   a.vline(WM,{color:C.coral}); a.vline(-WM,{color:C.coral});
   return a.svg(); },
  cap:'The Nyquist rate, $\\omega_s=4\\pi=2\\omega_M$: the guard band is zero.'},
 {svg:()=>{ const ws=3*PI, pk=1.5;
   const a=ax3({xr:[-8*PI,8*PI],yr:[-0.2,3.0],xpi:4*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)'});
   for(let k=-3;k<=3;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),width:1.3,dash:'4 4',n:1200});
   a.curve(w=>rep(w,WM,pk,ws,4),{color:C.err,width:2.4,n:1600});
   return a.svg(); },
  cap:'Undersampling, $\\omega_s=3\\pi$ rad/s: the copies add. The solid red curve is their sum.'}
]},

/* ================================================================ 7.2 */
{t:'h2', num:'7.2', text:'Aliasing and the sampling theorem'},
{t:'h3', text:'Aliasing'},
{t:'p', text:'<b>Aliasing</b> is the overlap of neighbouring copies in $X_p(j\\omega)$. The baseband ends at $\\omega_M$ and the copy $k=1$ starts at $\\omega_s-\\omega_M$. They overlap exactly when the copy starts before the baseband ends:'},
{t:'eq', tex:'\\omega_s-\\omega_M<\\omega_M\\quad\\Longleftrightarrow\\quad\\omega_s<2\\omega_M.'},
{t:'p', text:'The overlap then runs from $\\omega_s-\\omega_M$ to $\\omega_M$, so its width is $\\omega_M-(\\omega_s-\\omega_M)=2\\omega_M-\\omega_s$. For the running signal, $\\omega_M=2\\pi$ rad/s, sampled at $\\omega_s=3.5\\pi$ rad/s, the overlap runs from $1.5\\pi$ to $2\\pi$ and is $0.5\\pi$ rad/s wide.'},
{t:'box', kind:'err', hd:'Replication is not aliasing', html:'It is sometimes said that below the Nyquist rate the spectrum is no longer replicated. That is false. The formula for $X_p(j\\omega)$ carries no condition, so the copies are there at every rate; below the Nyquist rate they <b>overlap</b>. Replication is what sampling does. Aliasing is the overlap of the copies that sampling made.'},

{t:'h3', text:'Why aliasing cannot be undone'},
{t:'p', text:'Where two copies meet, the sampler stores one number that is the sum of two contributions. Near the baseband, at $0<\\omega<\\omega_M$, the two are the baseband and the copy $k=1$:'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\Bigl[\\underbrace{X(j\\omega)}_{\\text{wanted}}+\\underbrace{X\\bigl(j(\\omega-\\omega_s)\\bigr)}_{\\text{intruder}}\\Bigr].'},
{t:'p', text:'A filter multiplies $X_p(j\\omega)$ frequency by frequency. It can keep or remove whole intervals of $\\omega$, but it cannot split one stored value into the two numbers that were added to make it. $X_p(j\\omega)$ still equals $X(j\\omega)/T$ alone only where no copy reaches, that is on $|\\omega|<\\omega_s-\\omega_M$. At $\\omega_s=3.4\\pi$ rad/s the running signal keeps this form only on $|\\omega|<3.4\\pi-2\\pi=1.4\\pi$.'},
{t:'fig', svg:()=>{ const ws=2.6*PI, pk=1.3, ov=w=>{ const r=w-Math.floor(w/ws)*ws; return r>=ws-WM-1e-9 && r<=WM+1e-9; };
  const a=ax({xr:[-2.4*PI,2.4*PI],yr:[-0.2,1.75],xpi:PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[0,1.3]});
  a.area(w=>rep(w,WM,pk,ws,2),ws-WM,WM,{color:wash(C.err,.22),n:120});
  a.area(w=>rep(w,WM,pk,ws,2),-WM,WM-ws,{color:wash(C.err,.22),n:120});
  for(let k=-1;k<=1;k++){ a.curve(w=>ov(w)?NaN:tri(w-k*ws,WM,pk),{color:KCOL(k),n:1600});
    a.curve(w=>ov(w)?tri(w-k*ws,WM,pk):NaN,{color:KCOL(k),n:1600,width:1.3,dash:'4 4'}); }
  a.curve(w=>ov(w)?rep(w,WM,pk,ws,2):NaN,{color:C.err,n:1600,width:2.6});
  return a.svg(); },
 cap:'The running signal sampled at $\\omega_s=2.6\\pi$ rad/s, near the baseband. Inside the red intervals the baseband, cyan, and a copy, violet, both contribute, and the sampler keeps only their sum, red.', short:'Aliasing near the baseband at $\\omega_s=2.6\\pi$ rad/s.'},
{t:'box', kind:'ok', hd:'The only repair is prevention', html:'Raise $\\omega_s$ above $2\\omega_M$, or remove the high frequencies of $x(t)$ <b>before</b> the sampler. The second is the anti-aliasing filter of Section 7.4.'},

{t:'h3', text:'The sampling theorem'},
{t:'eqbox', cap:'Key result: the sampling theorem',
 tex:['X(j\\omega)=0\\ \\text{ for }\\ |\\omega|>\\omega_M \\quad\\text{and}\\quad \\omega_s>2\\omega_M',
      '\\Longrightarrow\\quad x(t)\\ \\text{is determined uniquely by}\\ x(nT),\\ n=0,\\pm1,\\pm2,\\dots'],
 after:'The signal is recovered by passing $x_p(t)$ through an ideal low-pass filter of gain $T$ and cutoff $\\omega_c$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. The quantity $2\\omega_M$ is the <b>Nyquist rate</b> of the signal, and $\\omega_s$ must be strictly above it. The hypothesis matters: without a band limit there is no $\\omega_M$, and the theorem says nothing.'},
{t:'p', text:'The cutoff interval comes from the guard band. The filter must pass the whole baseband, so $\\omega_c>\\omega_M$. It must stop the lowest copy, which starts at $\\omega_s-\\omega_M$, so $\\omega_c<\\omega_s-\\omega_M$. For example, with $\\omega_M=2\\pi$ and $\\omega_s=7\\pi$ rad/s the interval is $2\\pi<\\omega_c<7\\pi-2\\pi=5\\pi$, so $\\omega_c=4\\pi$ works, while $1.5\\pi$ cuts into the baseband and $5.5\\pi$ lets a copy through.'},
{t:'fig', svg:()=>{ const ws=6*PI, pk=3, wc=3*PI;
  const a=ax({xr:[-9*PI,9*PI],yr:[-0.3,4.4],xpi:2*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[0,3]});
  a.area(w=>rep(w,WM,pk,ws,2),-wc,wc,{color:wash(C.out,.25),n:900});
  for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,pk),{color:KCOL(k),n:1600});
  a.rect(-wc,0,wc,3.45,{stroke:C.h,dash:'7 5',width:2});
  a.span(WM,ws-WM,3.9,'',{color:C.coral});
  a.note(ws-WM,3.75,'\\omega_M<\\omega_c<\\omega_s-\\omega_M',{anchor:'start',dx:8,color:C.coral,fs:13,tex:true});
  return a.svg(); },
 cap:'The running signal, $\\omega_M=2\\pi$ rad/s, sampled at $\\omega_s=6\\pi$ rad/s. The dashed amber box is a low-pass filter with $\\omega_c=3\\pi$, the green area is what it passes, and the coral bracket is the interval in which $\\omega_c$ may stand.', short:'The reconstruction filter and its admissible cutoff interval.'},

{t:'h3', text:'Why the inequality is strict'},
{t:'p', text:'Put $\\omega_s=2\\omega_M$ into the cutoff condition:'},
{t:'eq', tex:'\\omega_M<\\omega_c<\\underbrace{2\\omega_M-\\omega_M}_{\\omega_s-\\omega_M}=\\omega_M.'},
{t:'p', text:'No number $\\omega_c$ satisfies $\\omega_M<\\omega_c<\\omega_M$, so there is no admissible filter at the Nyquist rate itself. A statement with $\\omega_s\\ge2\\omega_M$ would promise a filter that its own cutoff condition rules out.'},
{t:'box', kind:'warn', hd:'A real filter needs a gap', html:'A real filter cannot jump from pass to stop; it needs room between the band edge and the first copy. So the rate is chosen with a guard band above $2\\omega_M$. If the filter needs a gap of at least $\\pi$ rad/s and $\\omega_M=2\\pi$ rad/s, then $\\omega_s-2\\omega_M\\ge\\pi$ gives $\\omega_s\\ge4\\pi+\\pi=5\\pi$ rad/s.'},

{t:'ex', hd:'Example 7.1 — the Nyquist-rate boundary', rows:[
 ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$, sampled at exactly $\\omega_s=2\\omega_M=8000\\pi$ rad/s.'],
 ['Find','What is left of the term $\\sin(4000\\pi t)$ after sampling, and what a cosine at the same frequency would give.'],
 ['Method','Use the sampled-spectrum sum, because a copy can land on a baseband line and cancel it. Locate every contribution to $X_p$ at $\\omega=+4000\\pi$, then confirm the result from the sample values in time.'],
 ['Solution','The highest frequency present is $4000\\pi$ rad/s, so $\\omega_M=4000\\pi$ rad/s and $$T=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}=0.25\\ \\text{ms},\\qquad\\frac{1}{T}=4000.$$ The sine transforms to $\\frac{\\pi}{j}\\bigl[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)\\bigr]$; Example 7.3 derives this pair. Write the sampled-spectrum sum for this term and keep the $k=0$ and $k=1$ terms: $$\\begin{aligned}k=0:&\\quad\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)\\bigr]\\\\k=1:&\\quad\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-8000\\pi-4000\\pi)-\\delta(\\omega-8000\\pi+4000\\pi)\\bigr]\\\\&=\\frac{1}{T}\\cdot\\frac{\\pi}{j}\\bigl[\\delta(\\omega-12000\\pi)-\\delta(\\omega-4000\\pi)\\bigr].\\end{aligned}$$ The $k=1$ term replaces $\\omega$ by $\\omega-\\omega_s$, which moves every impulse up by $8000\\pi$. The impulse that sat at $-4000\\pi$ now sits at $-4000\\pi+8000\\pi=+4000\\pi$, and it keeps its negative sign. At $\\omega=+4000\\pi$ the two weights add: $$\\frac{1}{T}\\cdot\\frac{\\pi}{j}-\\frac{1}{T}\\cdot\\frac{\\pi}{j}=\\frac{4000\\pi}{j}-\\frac{4000\\pi}{j}=0.$$ The same cancellation happens at $-4000\\pi$, where the $k=-1$ copy brings the impulse from $+4000\\pi$ down by $8000\\pi$. So the sine term is absent from the sampled signal. The cosine term $\\cos(2000\\pi t)$ is not affected: its line at $-2000\\pi$ moves to $-2000\\pi+8000\\pi=6000\\pi$, which is outside the baseband.'],
 ['Check','The sample values of the sine are $$\\sin(4000\\pi\\,nT)=\\sin\\Bigl(4000\\pi\\cdot\\frac{n}{4000}\\Bigr)=\\sin(\\pi n)=0\\quad\\text{for every integer }n.$$ Every sample falls on a zero crossing, so the sampler never sees the term. A cosine at the same frequency behaves differently: $\\cos(4000\\pi n/4000)=\\cos(\\pi n)=(-1)^{n}$, so its samples are $+1$ and $-1$ in turn. At the boundary rate the result depends on the phase of the component, so the boundary rate cannot be trusted.'],
 ['Repair','Add a guard band. With $\\omega_g=1000\\pi$ rad/s the rate becomes $\\omega_s=2\\omega_M+\\omega_g=8000\\pi+1000\\pi=9000\\pi$ rad/s, so $$T=\\frac{2\\pi}{9000\\pi}=\\frac{1}{4500}\\ \\text{s}\\approx222.2\\ \\mu\\text{s}.$$ The cutoff interval $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ becomes $4000\\pi<\\omega_c<9000\\pi-4000\\pi=5000\\pi$ rad/s, which is no longer empty.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const K=v=>v*PI, a=ax2({xr:[-K(10000),K(10000)],yr:[-1.75,1.75],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'j\\,X_p(j\\omega)',
     yticksOverride:[],xticksOverride:[-K(8000),K(8000)],xtickfmt:P.piTick});
   a.impulse(K(4000),1.15,{color:C.in,label:false}); a.impulse(-K(4000),-1.15,{color:C.in,label:false});
   a.impulse(K(4000)+K(250),-1.15,{color:C.mid,label:false}); a.impulse(-K(4000)-K(250),1.15,{color:C.mid,label:false});
   a.note(K(4000),-1.55,'4000\\pi',{anchor:'start',dx:14,color:C.muted,fs:12,tex:true});
   a.note(-K(4000),1.35,'-4000\\pi',{anchor:'end',dx:-14,color:C.muted,fs:12,tex:true});
   return a.svg(); },
  cap:'The sine term of $X_p(j\\omega)$, times $j$. At $\\pm4000\\pi$ the baseband line, cyan, meets a line of the opposite sign brought by the copy $k=\\pm1$, violet; they are drawn slightly apart and sum to zero.', short:'The sine term cancels at the Nyquist rate.'},
 {svg:()=>{ const a=ax2({xr:[0,1.6],yr:[-1.45,1.55],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t)',yticksOverride:[-1,0,1],xticksOverride:[0.25,0.5,0.75,1,1.25,1.5]});
   a.curve(t=>Math.sin(4*PI*t),{color:C.in,n:1600,dash:'8 5'});
   a.stem(D(n=>0,0,6).map(([n])=>[n*0.25,0]),{color:C.mid,r:4.4,showZero:true});
   return a.svg(); },
  cap:'The band-edge tone $\\sin(4000\\pi t)$ with $t$ in ms, and its samples at $T=0.25$ ms. Every sample sits on a zero crossing.', short:'Samples of the band-edge sine at the Nyquist rate.'}
]},

{t:'ex', hd:'Example 7.2 — one signal at three rates', rows:[
 ['Given','The running signal $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$, whose transform is a triangle of peak 1 with $\\omega_M=2\\pi$ rad/s. The periods are $T_1=0.40$ s, $T_2=0.50$ s and $T_3=2/3$ s.'],
 ['Find','For each period: the rate, the guard band and the height of each copy. Which period lets $x(t)$ be recovered?'],
 ['Method','Use the three definitions of Section 7.1, because the question asks for the rate, the separation and the scale of the copies: $\\omega_s=2\\pi/T$, guard band $\\omega_s-2\\omega_M$ with $2\\omega_M=4\\pi$, and copy height $1/T$ times the peak of 1.'],
 ['Solution','With $\\omega_s$ and the guard band in rad/s, $$\\begin{aligned}T_1=0.40\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{0.40}=5\\pi,&&\\text{guard}=5\\pi-4\\pi=+\\pi,&&\\frac{1}{T_1}=\\frac{1}{0.40}=2.5\\\\T_2=0.50\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{0.50}=4\\pi,&&\\text{guard}=4\\pi-4\\pi=0,&&\\frac{1}{T_2}=\\frac{1}{0.50}=2\\\\T_3=2/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{2/3}=3\\pi,&&\\text{guard}=3\\pi-4\\pi=-\\pi,&&\\frac{1}{T_3}=\\frac{3}{2}=1.5\\end{aligned}$$ Dividing by $2/3$ is multiplying by $3/2$, which gives the last row. Only $T_1$ is safe. $T_2$ sits on the boundary, and at $T_3$ the copies overlap by $\\pi$ rad/s on each side.'],
 ['Check','$\\omega_sT=2\\pi$ in each row: $5\\pi\\times0.4=2\\pi$, $4\\pi\\times0.5=2\\pi$, $3\\pi\\times\\frac23=2\\pi$. Also, from $T_1$ to $T_3$ the spacing falls from $5\\pi$ to $3\\pi$ and the height from $2.5$ to $1.5$: height and spacing move together, since both are proportional to $1/T$. A sketch with the same height at every rate hides half of what sampling does.']
]},
{t:'fig', svg:()=>{ const a=ax({xr:[0,0.9],yr:[0,10.5*PI],xlabel:'T\\;[\\text{s}]',ylabel:'\\omega_s\\;[\\text{rad/s}]',
    xticksOverride:[0.2,0.4,0.6,0.8],xtickfmt:v=>v.toFixed(1),yticksOverride:[2*PI,4*PI,6*PI,8*PI,10*PI],ytickfmt:P.piTick});
  a.rect(0,4*PI,0.9,10.5*PI,{fill:wash(C.out,.11)});
  a.hline(4*PI,{color:C.coral,width:1.6,dash:'6 4',opacity:1});
  a.note(0.88,4.4*PI,'2\\omega_M=4\\pi',{anchor:'end',color:C.coral,fs:13,tex:true});
  a.curve(T=>T<0.19?NaN:2*PI/T,{color:C.in,n:900});
  [[0.4,'T_1',C.out],[0.5,'T_2',C.coral],[2/3,'T_3',C.err]].forEach(([T,l,c])=>{
    a.point(T,2*PI/T,{color:c,r:5});
    if(T>0.6) a.note(T-0.02,2*PI/T-2.3*PI,l,{anchor:'end',color:c,fs:13,tex:true});
    else a.note(T+0.02,2*PI/T+0.5*PI,l,{anchor:'start',color:c,fs:13,tex:true}); });
  return a.svg(); },
 cap:'The rate $\\omega_s=2\\pi/T$ against the period $T$. A period is safe while its point lies above the coral line $2\\omega_M=4\\pi$ rad/s, in the green band.', short:'Sampling rate against sampling period for Example 7.2.'},

{t:'ex', hd:'Example 7.3 — a line spectrum and its Nyquist rate', rows:[
 ['Given','$x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$.'],
 ['Find','$X(j\\omega)$, the bandwidth $\\omega_M$, and the Nyquist rate in rad/s and in hertz.'],
 ['Method','Use linearity, because the signal is a sum of standard terms. Write each term as a sum of complex exponentials and transform term by term with $e^{j\\omega_0t}\\leftrightarrow2\\pi\\delta(\\omega-\\omega_0)$. The farthest line from the origin gives $\\omega_M$.'],
 ['Solution','The pair for one complex exponential holds because the inverse transform of the right side is $\\frac{1}{2\\pi}\\int2\\pi\\delta(\\omega-\\omega_0)e^{j\\omega t}\\,\\d\\omega=e^{j\\omega_0t}$ by sifting. Transform term by term: $$\\begin{aligned}1&=e^{j0t}\\;\\longleftrightarrow\\;2\\pi\\delta(\\omega)\\\\\\cos(2000\\pi t)&=\\tfrac12e^{j2000\\pi t}+\\tfrac12e^{-j2000\\pi t}\\\\&\\longleftrightarrow\\;\\pi\\delta(\\omega-2000\\pi)+\\pi\\delta(\\omega+2000\\pi)\\\\\\sin(4000\\pi t)&=\\tfrac{1}{2j}e^{j4000\\pi t}-\\tfrac{1}{2j}e^{-j4000\\pi t}\\\\&\\longleftrightarrow\\;\\frac{\\pi}{j}\\delta(\\omega-4000\\pi)-\\frac{\\pi}{j}\\delta(\\omega+4000\\pi)\\end{aligned}$$ Each impulse weight is $2\\pi$ times the coefficient of its exponential: $2\\pi\\cdot\\tfrac12=\\pi$ and $2\\pi\\cdot\\tfrac{1}{2j}=\\pi/j$. Adding the three lines gives $$\\begin{aligned}X(j\\omega)=2\\pi\\delta(\\omega)&+\\pi\\bigl[\\delta(\\omega-2000\\pi)+\\delta(\\omega+2000\\pi)\\bigr]\\\\&+\\frac{\\pi}{j}\\bigl[\\delta(\\omega-4000\\pi)-\\delta(\\omega+4000\\pi)\\bigr].\\end{aligned}$$ Five impulses, each written as a function of $\\omega$ so that its position can be read. The farthest sit at $\\pm4000\\pi$, so $$\\begin{aligned}\\omega_M&=4000\\pi\\ \\text{rad/s},&f_M&=\\frac{\\omega_M}{2\\pi}=2000\\ \\text{Hz},\\\\2\\omega_M&=8000\\pi\\ \\text{rad/s},&2f_M&=4000\\ \\text{Hz}.\\end{aligned}$$ Any working rate must be strictly above $8000\\pi$ rad/s.'],
 ['Check','Invert the impulses with $\\frac{1}{2\\pi}\\int X(j\\omega)e^{j\\omega t}\\,\\d\\omega$. The first gives $\\frac{2\\pi}{2\\pi}=1$. The cosine pair gives $\\frac{\\pi}{2\\pi}\\bigl(e^{j2000\\pi t}+e^{-j2000\\pi t}\\bigr)=\\frac12\\cdot2\\cos(2000\\pi t)=\\cos(2000\\pi t)$. The sine pair gives $\\frac{\\pi}{2\\pi j}\\bigl(e^{j4000\\pi t}-e^{-j4000\\pi t}\\bigr)=\\frac{1}{2j}\\cdot2j\\sin(4000\\pi t)=\\sin(4000\\pi t)$. The sum is $x(t)$. The signal repeats every 1 ms, and its fastest term runs at 2000 Hz.']
]},
{t:'fig', svg:()=>{ const K=v=>v*PI;
  const a=ax({xr:[-K(5200),K(5200)],yr:[-1.6,2.8],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
    yticksOverride:[],xticksOverride:[-K(2000),K(2000),K(4000)],xtickfmt:P.piTick});
  a.impulse(0,2,{color:C.in,label:false}); a.note(0,2,'2\\pi',{tex:true,anchor:'start',dx:8,dy:4,color:C.in,fs:13});
  for(const s of [1,-1]){ a.impulse(s*K(2000),1,{color:C.in,label:false}); a.note(s*K(2000),1,'\\pi',{tex:true,anchor:'start',dx:8,dy:4,color:C.in,fs:13}); }
  a.impulse(K(4000),1,{color:C.mid,label:false}); a.note(K(4000),1,'\\pi/j',{tex:true,anchor:'start',dx:8,dy:4,color:C.mid,fs:13});
  a.impulse(-K(4000),-1,{color:C.mid,label:false}); a.note(-K(4000),-1,'-\\pi/j',{tex:true,anchor:'start',dx:8,dy:10,color:C.mid,fs:13});
  a.note(-K(4000),0.3,'-4000\\pi',{anchor:'middle',color:C.muted,fs:12,tex:true});
  return a.svg(); },
 cap:'The line spectrum of Example 7.3. The cyan weights are real. The violet pair is imaginary, drawn up for $+\\pi/j$ and down for $-\\pi/j$.', short:'The line spectrum of Example 7.3.'},

{t:'ex', hd:'Example 7.4 — the sampling period at the Nyquist rate', rows:[
 ['Given','$x(t)=\\dfrac{\\sin(4000\\pi t)}{\\pi t}$.'],
 ['Find','Its transform, the sampling period $T$ at the Nyquist rate, and the height of each copy.'],
 ['Method','Invert a rectangle of height 1 to recognise the signal. The rectangle ends at $\\omega_M$, so $\\omega_s=2\\omega_M$, and then $T=2\\pi/\\omega_s$. Check the result three ways, because this is where a factor of 1000 is most easily lost.'],
 ['Solution','Write $W=4000\\pi$ and let $R(j\\omega)$ be 1 on $|\\omega|\\le W$ and 0 outside. Its inverse transform is $$\\begin{aligned}\\frac{1}{2\\pi}\\int_{-W}^{W}1\\cdot e^{j\\omega t}\\,\\d\\omega&=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-W}^{W}=\\frac{1}{2\\pi}\\cdot\\frac{e^{jWt}-e^{-jWt}}{jt}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin(Wt)}{jt}=\\frac{\\sin(Wt)}{\\pi t}.\\end{aligned}$$ The bracket is the antiderivative of $e^{j\\omega t}$ with respect to $\\omega$, and $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ removes the factor $j$ from the denominator. So $X(j\\omega)=R(j\\omega)$, and $\\omega_M=W=4000\\pi$ rad/s. The Nyquist rate is $\\omega_s=2\\omega_M=8000\\pi$ rad/s, and $$T=\\frac{2\\pi}{\\omega_s}=\\frac{2\\pi}{8000\\pi}=\\frac{1}{4000}\\ \\text{s}=2.5\\times10^{-4}\\ \\text{s}=0.25\\ \\text{ms}.$$ In hertz the rate is $f_s=1/T=4000$ Hz, and each copy of the rectangle is scaled to height $1/T=4000$. At this rate neighbouring copies touch at $\\pm4000\\pi$.'],
 ['Check','Three independent tests. First, $\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$; with $0.25$ s it would be $2000\\pi$ instead. Second, the copy scale is $1/T=4000$; with $0.25$ s it would be $4$. Third, doubling the rate must halve the period: at $16000\\pi$ rad/s, $T=2\\pi/(16000\\pi)=1/8000$ s $=125\\ \\mu$s, and $0.25$ ms divided by $125\\ \\mu$s is exactly 2.'],
 ['Warning','The answer is a quarter of a millisecond. Cancelling the $\\pi$ but not the thousand gives $0.25$ s, and every later number is then wrong by a factor of 1000. A quarter of a second between samples would be four samples a second for a signal that carries 2000 Hz: the next sample would come $0.25\\times2000=500$ cycles of the tone later.']
]},
{t:'ex', hd:'Example 7.5 — area and peak of a triangular spectrum', rows:[
 ['Given','$x(t)=\\bigl(\\sin(4000\\pi t)/\\pi t\\bigr)^{2}$, the square of the signal of Example 7.4, whose transform $R(j\\omega)$ is 1 on $|\\omega|\\le4000\\pi$.'],
 ['Find','The peak of $X(j\\omega)$, the bandwidth, the period at the Nyquist rate, and the height of one copy after sampling at that rate.'],
 ['Method','Use the multiplication property, because the signal is squared in time. The spectrum is then the rectangle convolved with itself, divided by $2\\pi$: a triangle. Keep its area and its peak apart.'],
 ['Solution','Write $W=4000\\pi$ and $g(t)=\\sin(Wt)/\\pi t$, so that $x(t)=g(t)^{2}$ and $G(j\\omega)=R(j\\omega)$ by Example 7.4. Squaring in time is convolution in frequency divided by $2\\pi$: $$X(j\\omega)=\\frac{1}{2\\pi}\\bigl[R*R\\bigr](\\omega)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}R(j\\theta)\\,R\\bigl(j(\\omega-\\theta)\\bigr)\\,\\d\\theta.$$ The integrand is 1 where both rectangles are 1, that is where $-W\\le\\theta\\le W$ and $\\omega-W\\le\\theta\\le\\omega+W$ at the same time, and 0 elsewhere. For $0\\le\\omega\\le2W$ the overlap runs from $\\omega-W$ to $W$ and gives $$\\bigl[R*R\\bigr](\\omega)=\\int_{\\omega-W}^{W}1\\,\\d\\theta=W-(\\omega-W)=2W-\\omega.$$ For negative $\\omega$ the same argument gives $2W+\\omega$, so $[R*R](\\omega)=2W-|\\omega|$ on $|\\omega|\\le2W$ and 0 outside: a triangle. Its value at the origin, $A$, is the area of the full rectangle, and the peak of $X$ is $A$ divided by $2\\pi$: $$\\begin{aligned}A&=\\bigl[R*R\\bigr](0)=\\int_{-W}^{W}(1)(1)\\,\\d\\theta=2W=8000\\pi,\\\\X_{\\max}&=X(j0)=\\frac{A}{2\\pi}=\\frac{8000\\pi}{2\\pi}=4000.\\end{aligned}$$ The triangle reaches zero at $2W$, twice the half-width of the rectangle, so $\\omega_M=8000\\pi$ rad/s. The Nyquist rate is $2\\omega_M=16000\\pi$ rad/s, and $$T=\\frac{2\\pi}{16000\\pi}=\\frac{1}{8000}\\ \\text{s}=1.25\\times10^{-4}\\ \\text{s}=125\\ \\mu\\text{s}.$$ The copy height is $X_{\\max}/T=4000\\times8000=3.2\\times10^{7}$.'],
 ['Check','This bandwidth is twice the one in Example 7.4, so the period must be half of it: $125\\ \\mu$s against $0.25$ ms. Also $\\omega_sT=16000\\pi\\times1.25\\times10^{-4}=2\\pi$.'],
 ['Warning','$A$ is an area and $X_{\\max}$ is the peak of a spectrum. They differ by $2\\pi$, so substituting one where the other belongs inflates every later height by that factor. Every later formula uses $X_{\\max}$, never $A$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const W=4000*PI, ws=8000*PI, K=v=>v*PI;
   const a=ax2({xr:[-K(13000),K(13000)],yr:[-0.15,1.45],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'T\\,X_p(j\\omega)',
     yticksOverride:[0,1],xticksOverride:[-K(8000),0,K(8000)],xtickfmt:P.piTick});
   const box=(c,col,dash)=>a.poly([[c-W,0],[c-W,1],[c+W,1],[c+W,0]],{color:col,dash});
   box(0,C.in); box(ws,C.mid,'8 5'); box(-ws,C.mid,'8 5');
   return a.svg(); },
  cap:'Example 7.4 at the Nyquist rate $8000\\pi$ rad/s, drawn times $T$. The rectangle and its copies touch at $\\pm4000\\pi$.', short:'The rectangle spectrum and its copies at the Nyquist rate.'},
 {svg:()=>{ const ws=16000*PI, pk=3.2, K=v=>v*PI;
   const a=ax2({xr:[-K(34000),K(34000)],yr:[-0.2,4.2],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)\\;[\\times10^{7}]',
     yticksOverride:[0,1,2,3.2],ytickfmt:v=>String(v),xticksOverride:[-K(32000),-K(16000),0,K(16000),K(32000)],xtickfmt:P.piTick});
   for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,K(8000),pk),{color:KCOL(k),n:1600});
   return a.svg(); },
  cap:'Example 7.5 at its Nyquist rate $16000\\pi$ rad/s. Each copy stands $3.2\\times10^{7}$ tall, and neighbours just touch.', short:'The triangular spectrum and its copies at the Nyquist rate.'}
]},

{t:'h3', text:'Band-pass sampling'},
{t:'p', text:'A <b>band-pass</b> signal has $X(j\\omega)=0$ outside $\\omega_L<|\\omega|<\\omega_H$. Its width is $B=\\omega_H-\\omega_L$. The theorem asks for $\\omega_s>2\\omega_H$, but that condition is sufficient, not necessary. The spectrum is empty below $\\omega_L$, and at a lower rate the copies can land in that empty space without meeting.'},
{t:'p', text:'The positive band occupies $\\omega_L<\\omega<\\omega_H$, and its copies occupy $\\omega_L+k\\omega_s<\\omega<\\omega_H+k\\omega_s$. The negative band occupies $-\\omega_H<\\omega<-\\omega_L$, and its copies occupy $-\\omega_H+m\\omega_s<\\omega<-\\omega_L+m\\omega_s$. Every copy is a shift of one of these two by a multiple of $\\omega_s$, so the picture near one gap repeats in every gap. It is therefore enough to fit one copy of the negative band into the gap between the positive-band copy $k=-1$, which ends at $\\omega_H-\\omega_s$, and the positive band itself, which starts at $\\omega_L$. For the copy $m$ this asks'},
{t:'eq', tex:'\\begin{aligned}\\omega_H-\\omega_s&\\le-\\omega_H+m\\omega_s&&\\Longleftrightarrow\\quad(m+1)\\,\\omega_s\\ge2\\omega_H,\\\\-\\omega_L+m\\omega_s&\\le\\omega_L&&\\Longleftrightarrow\\quad m\\,\\omega_s\\le2\\omega_L.\\end{aligned}'},
{t:'p', text:'Write $n=m+1$. The two conditions together give one window of rates for each positive integer $n$:'},
{t:'eqbox', cap:'The band-pass sampling windows',
 tex:['\\frac{2\\omega_H}{n}\\le\\omega_s\\le\\frac{2\\omega_L}{n-1},\\qquad n=1,2,\\dots,\\Bigl\\lfloor\\frac{\\omega_H}{B}\\Bigr\\rfloor'],
 after:'For $n=1$ the right side has $n-1=0$ in its denominator and gives no upper limit: this is $\\omega_s\\ge2\\omega_H$. A window is not empty only when $2\\omega_H/n\\le2\\omega_L/(n-1)$. Multiply by $n(n-1)/2$: $(n-1)\\omega_H\\le n\\omega_L$, so $n(\\omega_H-\\omega_L)\\le\\omega_H$, that is $n\\le\\omega_H/B$. At an end of a window the copies touch; as at the Nyquist rate, a component exactly at a band edge is then at risk. When the copies stay apart, a band-pass filter of gain $T$ on $\\omega_L<|\\omega|<\\omega_H$ returns $x(t)$.'},
{t:'ex', hd:'Example 7.6 — band-pass sampling', rows:[
 ['Given','A signal whose spectrum fills $8\\pi<|\\omega|<10\\pi$ rad/s.'],
 ['Find','Every rate at which the copies do not overlap. Does $7\\pi$ work? Does $9\\pi$?'],
 ['Method','Compute $B$ and $\\lfloor\\omega_H/B\\rfloor$, then list the windows $2\\omega_H/n\\le\\omega_s\\le2\\omega_L/(n-1)$. Check the lowest rate by moving each half of the band.'],
 ['Solution','$\\omega_L=8\\pi$, $\\omega_H=10\\pi$, so $B=2\\pi$ and $\\omega_H/B=5$. The lower edge is $4B$. The windows are $$\\begin{aligned}n=1:&\\quad\\omega_s\\ge20\\pi\\\\n=2:&\\quad10\\pi\\le\\omega_s\\le16\\pi\\\\n=3:&\\quad\\tfrac{20\\pi}{3}\\approx6.67\\pi\\le\\omega_s\\le8\\pi\\\\n=4:&\\quad5\\pi\\le\\omega_s\\le\\tfrac{16\\pi}{3}\\approx5.33\\pi\\\\n=5:&\\quad4\\pi\\le\\omega_s\\le4\\pi.\\end{aligned}$$ So $7\\pi$ works, because it lies in the window $n=3$. The rate $9\\pi$ does not, because it lies between $8\\pi$ and $10\\pi$, in no window. A faster rate is not always a safer one. The lowest rate is $\\omega_s=2B=4\\pi$ rad/s, five times lower than $2\\omega_H=20\\pi$.'],
 ['Check','At $\\omega_s=4\\pi$ move each half of the band by a multiple of $\\omega_s$ into $0\\le\\omega\\le4\\pi$: $$\\begin{aligned}8\\pi<\\omega<10\\pi\\;&\\xrightarrow{\\;-2\\omega_s\\;}\\;0<\\omega<2\\pi,\\\\-10\\pi<\\omega<-8\\pi\\;&\\xrightarrow{\\;+3\\omega_s\\;}\\;2\\pi<\\omega<4\\pi.\\end{aligned}$$ The two halves take turns and fill the axis without overlapping. If the band moves up to $12\\pi<|\\omega|<14\\pi$, then $\\omega_H/B=7$ and the window $n=7$ is $4\\pi\\le\\omega_s\\le4\\pi$: the lowest rate is again $2B=4\\pi$, because the lower edge is again a whole multiple of $B$.']
]},
{t:'fig', svg:()=>{ const ws=4*PI, span=12*PI, BL=8*PI, BB=2*PI;
  const lean=u=>u<=1e-9||u>=1-1e-9?NaN:(u<0.7?u/0.7:(1-u)/0.3);
  const cp=(w,k,s)=>{ const c=w-k*ws; return lean(((s>0?c:-c)-BL)/BB); };
  const a=ax({xr:[-span,span],yr:[-0.15,1.4],xpi:4*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'T\\,X_p(j\\omega)',yticksOverride:[0,1]});
  for(let k=-6;k<=6;k++) for(const s of [1,-1]) a.curve(w=>cp(w,k,s),{color:k?C.mid:C.in,n:2400,width:k?1.8:2.4});
  return a.svg(); },
 cap:'The band on $8\\pi<|\\omega|<10\\pi$ rad/s, cyan, and its copies at $\\omega_s=4\\pi$ rad/s, violet, drawn times $T$. The band leans, so a copy of the positive half and a copy of the negative half can be told apart; they take turns along the axis.', short:'Band-pass sampling at $\\omega_s=4\\pi$ rad/s.'},
{t:'fig', svg:()=>{ const a=ax({h:120,xr:[2*PI,23*PI],yr:[0,1],grid:false,xlabel:'\\omega_s\\;[\\text{rad/s}]',yticksOverride:[],xpi:4*PI,pad:{l:58,r:24,t:14,b:34}});
  a.rect(3*PI,0.25,22*PI,0.75,{fill:wash(C.err,.2)});
  [[4,4],[5,16/3],[20/3,8],[10,16],[20,22]].forEach(([p,q])=>{ const e=q-p<1e-9?0.08:0;
    a.rect((p-e)*PI,0.25,(q+e)*PI,0.75,{fill:wash(C.out,.62)}); });
  return a.svg(); },
 cap:'The rates from $3\\pi$ to $22\\pi$ rad/s for the band of Example 7.6: green where the copies fit, red where they overlap. The green windows are the point $4\\pi$, then $5\\pi$ to $5.33\\pi$, $6.67\\pi$ to $8\\pi$, $10\\pi$ to $16\\pi$, and everything from $20\\pi$ up.', short:'The band-pass sampling windows of Example 7.6.'},

/* ================================================================ 7.3 */
{t:'h2', num:'7.3', text:'Reconstruction'},
{t:'h3', text:'The ideal reconstruction filter'},
{t:'p', text:'If the copies stand clear, recovering $x(t)$ means keeping the one at the origin and discarding the rest. A low-pass filter does exactly that.'},
{t:'eqbox', cap:'Ideal reconstruction filter',
 tex:['H_r(j\\omega)=\\begin{cases}T,&|\\omega|<\\omega_c\\\\0,&|\\omega|>\\omega_c\\end{cases}\\qquad \\omega_M<\\omega_c<\\omega_s-\\omega_M',
      'X_r(j\\omega)=H_r(j\\omega)\\,X_p(j\\omega)=T\\cdot\\tfrac{1}{T}X(j\\omega)=X(j\\omega)\\;\\Longrightarrow\\;x_r(t)=x(t)'],
 after:'Filtering multiplies the spectra. Inside $|\\omega|<\\omega_c$ only the $k=0$ term of the sum for $X_p(j\\omega)$ is non-zero, and that term is $X(j\\omega)/T$; every other copy starts at $\\omega_s-\\omega_M$ or beyond, which is outside the passband. The gain is $T$ because the baseband is $X(j\\omega)/T$. The second line holds only when the copies do not overlap.'},
{t:'box', kind:'err', hd:'Common error: gain 1', html:'A filter of gain 1 returns $X(j\\omega)/T$, that is $x(t)/T$, not $x(t)$. Since $T$ changes with the rate, the error changes with it.'},
{t:'p', text:'For example, a signal with $\\omega_M=2\\pi$ rad/s sampled at $\\omega_s=10\\pi$ rad/s needs $2\\pi<\\omega_c<10\\pi-2\\pi=8\\pi$. So $\\omega_c=5\\pi$ recovers $x(t)$, while $\\omega_c=\\pi$ cuts the baseband and $\\omega_c=9\\pi$ lets the copies at $\\pm10\\pi$ through.'},
{t:'fig', svg:()=>{ const ws=6*PI;
  const a=ax({xr:[-9*PI,9*PI],yr:[-0.3,3.9],xpi:3*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega),\\;X_r(j\\omega)',yticksOverride:[0,1,3]});
  for(const k of [-1,1]) a.curve(w=>tri(w-k*ws,WM,3),{color:C.mid,n:1400});
  a.curve(w=>tri(w,WM,3),{color:C.in,n:1400});
  a.curve(w=>tri(w,WM,1),{color:C.out,width:2.8,n:1400});
  a.rect(-3*PI,0,3*PI,3.5,{stroke:C.h,dash:'7 5',width:2});
  return a.svg(); },
 cap:'The running signal with $T=1/3$ s, so $\\omega_s=6\\pi$ rad/s and each copy has height $1/T=3$. The dashed amber filter has gain $T$ on $|\\omega|<3\\pi$. It removes the copies at $\\pm6\\pi$, violet, and scales the baseband, cyan, down to the green $X_r(j\\omega)=X(j\\omega)$ of height 1.', short:'Ideal reconstruction with $T=1/3$ s.'},

{t:'h3', text:'The chain in time'},
{t:'p', text:'Two stages turn $x(t)$ into $x_r(t)$. The sampler turns $x(t)$ into $x_p(t)=\\sum_nx(nT)\\,\\delta(t-nT)$, an impulse train of period $T$ weighted by the samples. The filter $H_r(j\\omega)$ turns $x_p(t)$ into $x_r(t)$. Between two samples, at $t=nT+T/2$, the impulse train is zero; only the filter output has a value there.'},
{t:'box', kind:'err', hd:'Name the signals apart', html:'The sampler output is $x_p(t)$. The name $x_r(t)$ belongs to the output of the reconstruction filter and to nothing before it. A diagram that labels the sampler output $x_r(t)$ has skipped the filter.'},
{t:'fig', svg:()=>{ const T=0.25;
  const a=ax({xr:[-2,2],yr:[-0.3,1.45],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_p(t),\\;x_r(t)',yticksOverride:[0,0.5,1]});
  for(let n=-8;n<=8;n++){ const y=xB(n*T); if(y>0.02) a.impulse(n*T,y,{color:C.mid,label:false,width:1.5}); }
  a.curve(t=>{ let s=0; for(let n=-60;n<=60;n++) s+=xB(n*T)*sinc(PI*(t-n*T)/T); return s; },{color:C.out,width:2.6,n:800});
  a.curve(xB,{color:C.in,width:1.4,dash:'8 5',n:1000});
  return a.svg(); },
 cap:'The running signal, dashed, the sampler output $x_p(t)$ with $T=0.25$ s, violet, and the filter output $x_r(t)$ with $\\omega_c=\\pi/T=4\\pi$ rad/s, green. The green curve lies on $x(t)$.', short:'Sampling and reconstruction in time.'},

{t:'h3', text:'Band-limited interpolation'},
{t:'p', text:'Filtering is convolution with the impulse response $h_{LP}(t)$ of the filter, and $x_p$ is a train of impulses. So the output is a sum of shifted copies of $h_{LP}$: each sample is replaced by a curve of its own height, and the curves are added. The first chain below finds $h_{LP}$ as the inverse transform of $H_r$; the second forms the convolution.'},
{t:'eqbox', cap:'The kernel and the interpolation formula',
 tex:['\\begin{aligned}h_{LP}(t)&=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}H_r(j\\omega)\\,e^{j\\omega t}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\omega_c}^{\\omega_c}T\\,e^{j\\omega t}\\,\\d\\omega\\\\&=\\frac{T}{2\\pi}\\left[\\frac{e^{j\\omega t}}{jt}\\right]_{-\\omega_c}^{\\omega_c}=\\frac{T}{2\\pi}\\cdot\\frac{e^{j\\omega_ct}-e^{-j\\omega_ct}}{jt}\\\\&=\\frac{T}{2\\pi}\\cdot\\frac{2j\\sin(\\omega_ct)}{jt}=\\frac{T\\sin(\\omega_ct)}{\\pi t}\\end{aligned}',
      '\\begin{aligned}x_r(t)&=x_p(t)*h_{LP}(t)=\\int_{-\\infty}^{\\infty}\\Bigl[\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\delta(\\tau-nT)\\Bigr]h_{LP}(t-\\tau)\\,\\d\\tau\\\\&=\\sum_{n=-\\infty}^{\\infty}x(nT)\\int_{-\\infty}^{\\infty}\\delta(\\tau-nT)\\,h_{LP}(t-\\tau)\\,\\d\\tau=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,h_{LP}(t-nT)\\end{aligned}'],
 after:'In the first chain the limits shrink to $\\pm\\omega_c$ because $H_r$ is zero outside them, and $T$ comes out as a constant. The bracket is the antiderivative of $e^{j\\omega t}$ with respect to $\\omega$; then $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ removes the $j$, and $2/2\\pi=1/\\pi$. At $t=0$ the integral is $\\frac{1}{2\\pi}\\int_{-\\omega_c}^{\\omega_c}T\\,\\d\\omega=T\\omega_c/\\pi$, which is also the limit of $T\\sin(\\omega_ct)/(\\pi t)$. The second chain is the convolution integral with the impulse train substituted for $x_p$; the sum is taken outside the integral, and the sifting property evaluates $h_{LP}$ at $\\tau=nT$ for each $n$.'},
{t:'eqbox', cap:'Key result: band-limited interpolation',
 tex:['x_r(t)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,h_{LP}(t-nT)=\\sum_{n=-\\infty}^{\\infty}x(nT)\\,\\frac{T\\sin\\bigl(\\omega_c(t-nT)\\bigr)}{\\pi(t-nT)}'],
 after:'One kernel per sample, scaled by it. The sum is linear in the samples. If a fault doubles one sample, so that $x(0)$ becomes $2x(0)$, the output changes by $x(0)\\,h_{LP}(t)$, and that change spreads over all $t$, not only $t=0$.'},

{t:'h3', text:'The interpolation kernel'},
{t:'p', text:'The cutoff can be anywhere in $\\omega_M<\\omega_c<\\omega_s-\\omega_M$. The middle of that interval is $\\frac12\\bigl(\\omega_M+\\omega_s-\\omega_M\\bigr)=\\omega_s/2=\\pi/T$, and it is the usual choice. With $\\omega_c=\\pi/T$ the kernel becomes'},
{t:'eq', tex:'h_{LP}(t)=\\frac{T\\sin(\\pi t/T)}{\\pi t}=\\frac{\\sin(\\pi t/T)}{\\pi t/T}=\\operatorname{sinc}\\Bigl(\\frac{\\pi t}{T}\\Bigr),\\qquad \\operatorname{sinc}(\\theta)=\\frac{\\sin\\theta}{\\theta}.'},
{t:'p', text:'The second equality divides numerator and denominator by $T$. Throughout this course $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$ is <b>unnormalised</b>. At $t=0$ the kernel is $T\\omega_c/\\pi=T(\\pi/T)/\\pi=1$. At $t=mT$ with $m\\ne0$ it is $\\sin(\\pi m)/(\\pi m)=0$. So each sample sets the output at its own instant and adds nothing at the other sample instants: $x_r(mT)=x(mT)$. Another cutoff loses this property. With $\\omega_c=1.5\\pi/T$, for example, $h_{LP}(0)=T\\cdot1.5\\pi/(\\pi T)=1.5$.'},
{t:'box', kind:'err', hd:'Keep the $\\pi$ inside the sine', html:'The kernel is $\\operatorname{sinc}(\\pi t/T)=\\sin(\\pi t/T)/(\\pi t/T)$. A kernel written $\\sin(t/T)/(\\pi t/T)$ has lost a $\\pi$: its zeros move to $t=m\\pi T$, off the sample instants. With $T=1$ the correct kernel at $t=1$ is $\\sin(\\pi)/\\pi=0$, while the damaged one gives $\\sin(1)/\\pi=0.267849$, so that sample leaks into its neighbour. At $t=0$ the damaged kernel is not even 1: near $t=0$, $\\sin t\\approx t$, so $\\sin(t)/(\\pi t)\\to1/\\pi\\approx0.318$. Anything written $\\operatorname{sinc}(t/T)$ belongs to the other, normalised convention and is a different function.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const bad=u=>Math.abs(u)<1e-9?1/PI:Math.sin(u)/(PI*u);
   const a=ax2({xr:[-4.4,4.4],yr:[-0.42,1.3],xlabel:'t/T',ylabel:'\\text{kernel}',yticksOverride:[0,0.5,1]});
   a.curve(u=>sinc(PI*u),{color:C.h,n:1600});
   a.curve(bad,{color:C.err,width:2,n:1600,dash:'7 4'});
   for(let m=-4;m<=4;m++) a.point(m,m===0?1:0,{color:C.coral,r:4});
   return a.svg(); },
  cap:'The kernel $\\operatorname{sinc}(\\pi t/T)$, amber, is $1$ at its own instant and $0$ at every other one. With the $\\pi$ dropped, dashed red, it misses the instants.', short:'The interpolation kernel and the kernel with its $\\pi$ dropped.'},
 {svg:()=>{ const T=0.5, pts=samp(xB,T,-9,9);
   const a=ax2({xr:[-3.2,3.2],yr:[-0.45,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)'});
   pts.forEach(pr=>{ if(Math.abs(pr[0])>3.3||pr[1]<1e-6) return;
     a.curve(t=>pr[1]*sinc(PI*(t-pr[0])/T),{color:C.slate,width:1,opacity:.5,n:900}); });
   a.curve(t=>{ let s=0; for(const [tn,v] of pts) s+=v*sinc(PI*(t-tn)/T); return s; },{color:C.out,width:2.2,n:1600});
   a.curve(xB,{color:C.in,width:1.2,dash:'3 5',opacity:.8,n:1600});
   return a.svg(); },
  cap:'The running signal sampled with $T=0.5$ s: one kernel per sample, grey, and their sum, green. It lands on the dashed original.', short:'Band-limited interpolation as a sum of kernels.'}
]},

{t:'h3', text:'The zero-order hold'},
{t:'p', text:'The ideal filter cannot be built: its impulse response starts before $t=0$ and never ends. A converter holds each sample instead, until the next one arrives.'},
{t:'eqbox', cap:'Zero-order hold',
 tex:['h_0(t)=\\begin{cases}1,&0\\le t<T\\\\0,&\\text{otherwise}\\end{cases}\\qquad x_0(t)=x(nT),\\quad nT\\le t<(n+1)T'],
 after:'The hold replaces each impulse $x(nT)\\,\\delta(t-nT)$ by a rectangle of height $x(nT)$ and width $T$, so its output is a staircase.'},
{t:'p', text:'The staircase is not $x(t)$. Over one tread, from $nT$ to $(n+1)T$, a smooth signal moves away from the held value by about $|x\'(t)|\\,T$, because $x(nT+\\tau)\\approx x(nT)+x\'(nT)\\,\\tau$ and $\\tau$ reaches $T$. So the largest gap scales with $T$: halving $T$ from $0.2$ s to $0.1$ s about halves it, but it never reaches zero at any finite rate.'},
{t:'eqbox', cap:'The frequency response of the hold',
 tex:['\\begin{aligned}H_0(j\\omega)&=\\int_{-\\infty}^{\\infty}h_0(t)\\,e^{-j\\omega t}\\,\\d t=\\int_0^Te^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_0^T=\\frac{1-e^{-j\\omega T}}{j\\omega}\\\\&=\\frac{e^{-j\\omega T/2}\\bigl(e^{j\\omega T/2}-e^{-j\\omega T/2}\\bigr)}{j\\omega}=\\frac{e^{-j\\omega T/2}\\cdot2j\\sin(\\omega T/2)}{j\\omega}\\\\&=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}=T\\,e^{-j\\omega T/2}\\,\\frac{\\sin(\\omega T/2)}{\\omega T/2}\\end{aligned}'],
 after:'The limits shrink to $0$ and $T$ because $h_0$ is zero elsewhere. The bracket is the antiderivative of $e^{-j\\omega t}$; evaluating it at $T$ and at $0$ gives $(e^{-j\\omega T}-1)/(-j\\omega)$, which is the fraction shown. The second line factors $e^{-j\\omega T/2}$ out of $1-e^{-j\\omega T}$, which leaves $e^{j\\omega T/2}-e^{-j\\omega T/2}=2j\\sin(\\omega T/2)$; the $j$ then cancels. The last form multiplies and divides by $T/2$ to show the unnormalised sinc: $H_0(j\\omega)=T\\,e^{-j\\omega T/2}\\operatorname{sinc}(\\omega T/2)$ with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. The factor $e^{-j\\omega T/2}$ is a delay of half a sampling period.'},
{t:'p', text:'Three readings of $|H_0(j\\omega)|=|2\\sin(\\omega T/2)/\\omega|$ compare it with the ideal filter of gain $T$ and cutoff $\\omega_s/2=\\pi/T$.'},
{t:'ul', items:[
 'At $\\omega=0$, $\\sin\\theta/\\theta\\to1$, so $|H_0(j0)|=T$: the hold already has the gain the ideal filter needs.',
 'Inside the band it <b>sags</b>. At the edge $\\omega=\\pi/T$: $|H_0|=2\\sin(\\pi/2)/(\\pi/T)=2T/\\pi\\approx0.64\\,T$.',
 'Outside the band it <b>leaks</b>: it is small but not zero, so parts of the copies remain. Its first zero for $\\omega>0$ is where $\\omega T/2=\\pi$, that is $\\omega=2\\pi/T=\\omega_s$. With $T=0.1$ s that is $20\\pi$ rad/s.'
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const T=0.5, st=[]; for(let n=-6;n<=5;n++){ const y=xB(n*T); st.push([n*T,y],[(n+1)*T,y]); }
   const a=ax2({xr:[-2.5,2.5],yr:[-0.25,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_0(t)',yticksOverride:[0,0.5,1]});
   a.curve(xB,{color:C.in,width:1.4,dash:'8 5',n:1000});
   a.poly(st,{color:C.out,width:2.4});
   for(let n=-5;n<=5;n++) a.point(n*T,xB(n*T),{color:C.mid,r:3.8});
   return a.svg(); },
  cap:'The zero-order hold with $T=0.5$ s: each sample of the running signal is held for one period.', short:'The zero-order hold output, $T=0.5$ s.'},
 {svg:()=>{ const T=0.5, e=PI/T;
   const a=ax2({xr:[-10*PI,10*PI],yr:[-0.05,0.72],xpi:4*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H_0(j\\omega)|',yticksOverride:[0,0.25,0.5]});
   a.area(w=>H0m(w,T),e,10*PI,{color:wash(C.err,.25)}); a.area(w=>H0m(w,T),-10*PI,-e,{color:wash(C.err,.25)});
   a.rect(-e,0,e,T,{stroke:C.h,dash:'7 5',width:1.8});
   a.curve(w=>H0m(w,T),{color:C.h,n:2000});
   return a.svg(); },
  cap:'$|H_0(j\\omega)|$ with $T=0.5$ s against the ideal filter, dashed: flat at $T$ up to $\\omega_s/2=2\\pi$ rad/s. The hold sags inside the band and leaks outside it, red.', short:'The zero-order hold response against the ideal filter.'}
]},
{t:'ex', hd:'Example 7.7 — hearing the hold', rows:[
 ['Given','A tone $x(t)=\\cos(2\\pi f_0t)$ with $f_0=300$ Hz, sampled at $f_s$ samples per second and played through a zero-order hold.'],
 ['Find','The level of the first copy of the tone, relative to the tone, at $f_s=2000$ Hz and at $f_s=8000$ Hz.'],
 ['Method','Sampling puts copies of the tone near $f_s\\pm f_0$, $2f_s\\pm f_0$, and so on; the nearest is at $f_s-f_0$. The hold multiplies each line by $|H_0|$, so compare $|H_0|$ at $f_s-f_0$ with $|H_0|$ at $f_0$. Write the response in hertz with $\\omega=2\\pi f$ and $T=1/f_s$.'],
 ['Solution','Substitute $\\omega=2\\pi f$ and $T=1/f_s$ into $|H_0|=|2\\sin(\\omega T/2)/\\omega|$: $$|H_0(j2\\pi f)|=\\frac{2|\\sin(\\pi f/f_s)|}{2\\pi f}=\\frac{|\\sin(\\pi f/f_s)|}{\\pi f}.$$ At the copy, $f=f_s-f_0$, the sine is $\\sin\\bigl(\\pi-\\pi f_0/f_s\\bigr)=\\sin(\\pi f_0/f_s)$, by $\\sin(\\pi-\\theta)=\\sin\\theta$. So the sines cancel in the ratio: $$\\frac{|H_0(j2\\pi(f_s-f_0))|}{|H_0(j2\\pi f_0)|}=\\frac{\\sin(\\pi f_0/f_s)/\\bigl(\\pi(f_s-f_0)\\bigr)}{\\sin(\\pi f_0/f_s)/(\\pi f_0)}=\\frac{f_0}{f_s-f_0}.$$ At $f_s=2000$ Hz the copy is at $1700$ Hz with relative level $300/1700\\approx0.18$. At $f_s=8000$ Hz it is at $7700$ Hz with relative level $300/7700\\approx0.039$.'],
 ['Check','The ratio is below 1 whenever $f_0<f_s/2$, as it must be for a sampled tone. It falls as $f_s$ rises: a higher rate moves the copies up and makes them weaker. The copies sound as a buzz on top of the tone, and raising the rate makes the buzz rise in pitch and fade.']
]},
{t:'h3', text:'Compensating the hold'},
{t:'p', text:'The hold followed by a second filter $H_r$ would act as the ideal filter $H$ if $H_0(j\\omega)\\,H_r(j\\omega)=H(j\\omega)$. Divide by $H_0=e^{-j\\omega T/2}\\,2\\sin(\\omega T/2)/\\omega$:'},
{t:'eq', tex:'H_r(j\\omega)=\\frac{H(j\\omega)}{H_0(j\\omega)}=\\frac{e^{j\\omega T/2}\\,H(j\\omega)\\,\\omega}{2\\sin(\\omega T/2)}.'},
{t:'p', text:'Take the target $H$ with gain $T$ up to $\\pi/T$ and zero beyond. Inside the band the compensator needs $|H_r|=T\\omega/\\bigl(2\\sin(\\omega T/2)\\bigr)$. At $\\omega\\to0$ this is $1$, since $\\sin\\theta\\approx\\theta$. At the edge $\\omega=\\pi/T$ it is $(T\\cdot\\pi/T)/\\bigl(2\\sin(\\pi/2)\\bigr)=\\pi/2\\approx1.57$. So the boost stays between 1 and $\\pi/2$; it never grows without bound, because $\\sin(\\omega T/2)$ first vanishes at $\\omega=\\omega_s$, outside the band. A narrower target needs less boost: if $H$ stops at $\\omega_s/4=\\pi/(2T)$, the largest boost is $(\\pi/2)/\\bigl(2\\sin(\\pi/4)\\bigr)=\\pi/(2\\sqrt2)\\approx1.11$.'},
{t:'p', text:'The compensator is still hard to build. The factor $e^{j\\omega T/2}$ is a time advance, and $H$ is ideal. Converters approximate $H_r$, or use the hold output as it is.'},
{t:'fig', svg:()=>{ const T=0.5, e=PI/T, box=[[-4*PI,0],[-e,0],[-e,T],[e,T],[e,0],[4*PI,0]];
  const a=ax({xr:[-4*PI,4*PI],yr:[-0.08,1.95],xpi:PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{magnitude}',yticksOverride:[0,0.5,1,1.5]});
  a.poly(box,{color:C.out,width:2.8});
  a.curve(w=>H0m(w,T),{color:C.h,n:1600});
  a.curve(w=>Math.abs(w)<e?T/H0m(w,T):NaN,{color:C.mid,n:1600});
  a.hline(PI/2,{color:C.mid,opacity:.55});
  a.note(2.6*PI,PI/2,'\\pi/2',{tex:true,color:C.mid,anchor:'start',dy:-8,fs:13});
  return a.svg(); },
 cap:'With $T=0.5$ s: the hold $|H_0(j\\omega)|$, amber, the compensator $|H_r(j\\omega)|$, violet, which rises from $1$ to $\\pi/2$ at the band edge, and their product, green, the target of gain $T$ up to $\\omega_s/2=2\\pi$ rad/s.', short:'Compensating the zero-order hold.'},

{t:'h3', text:'The first-order hold'},
{t:'p', text:'The first-order hold joins consecutive samples by a straight line. It is also called linear interpolation.'},
{t:'eq', tex:'x_1(t)=x(nT)+\\frac{t-nT}{T}\\bigl[x((n+1)T)-x(nT)\\bigr],\\qquad nT\\le t<(n+1)T.'},
{t:'p', text:'At $t=nT$ the fraction is 0 and $x_1=x(nT)$; at $t=(n+1)T$ it is 1 and $x_1=x((n+1)T)$. Between $nT$ and $(n+1)T$ the line needs the next sample $x((n+1)T)$, so a real system waits for it and its output is $x_1(t)$ delayed by $T$.'},
{t:'p', text:'The error is smaller than that of the staircase. Take one interval with midpoint $m$ and expand $x$ about $m$: $x(m\\pm T/2)=x(m)\\pm x\'(m)\\frac{T}{2}+x\'\'(m)\\frac{T^{2}}{8}+\\cdots$. At the midpoint the line is the average of its two end values, $x(m)+x\'\'(m)\\,T^{2}/8+\\cdots$, because the first-order terms cancel. So the gap at the midpoint is about $|x\'\'|\\,T^{2}/8$ and scales with the square of the period: halving $T$ from $0.2$ s to $0.1$ s about quarters it.'},
{t:'eqbox', cap:'The impulse response of the first-order hold',
 tex:['h_1(t)=\\frac{1}{T}\\,(g*g)(t),\\qquad g(t)=\\begin{cases}1,&|t|\\le T/2\\\\0,&\\text{otherwise}\\end{cases}',
      '(g*g)(t)=\\int_{-\\infty}^{\\infty}g(\\tau)\\,g(t-\\tau)\\,\\d\\tau=\\int_{t-T/2}^{T/2}1\\,\\d\\tau=\\frac{T}{2}-\\Bigl(t-\\frac{T}{2}\\Bigr)=T-t,\\qquad0\\le t\\le T'],
 after:'$g$ is the hold rectangle, centred on $t=0$. The integrand is 1 where both $|\\tau|\\le T/2$ and $|t-\\tau|\\le T/2$. For $0\\le t\\le T$ the second condition is $t-T/2\\le\\tau\\le t+T/2$, so the overlap is $t-T/2\\le\\tau\\le T/2$, of length $T-t$. For $t>T$ there is no overlap. The convolution is even, so $(g*g)(t)=T-|t|$ on $|t|\\le T$: a triangle of peak $T$. Dividing by $T$ gives $h_1(t)=1-|t|/T$ on $|t|\\le T$, a triangle of peak 1. With $T=0.2$ s, $h_1(0.1)=1-0.1/0.2=0.5$.'},
{t:'p', text:'This triangle joins the samples. The output of the hold is $\\sum_kx(kT)\\,h_1(t-kT)$. On $nT\\le t\\le(n+1)T$ only the kernels of $n$ and $n+1$ are non-zero, and $|t-nT|=t-nT$, $|t-(n+1)T|=(n+1)T-t$:'},
{t:'eq', tex:'\\begin{aligned}&x(nT)\\Bigl(1-\\frac{t-nT}{T}\\Bigr)+x((n+1)T)\\Bigl(1-\\frac{(n+1)T-t}{T}\\Bigr)\\\\&=x(nT)-x(nT)\\,\\frac{t-nT}{T}+x((n+1)T)\\,\\frac{t-nT}{T}=x(nT)+\\frac{t-nT}{T}\\bigl[x((n+1)T)-x(nT)\\bigr],\\end{aligned}'},
{t:'p', text:'which is $x_1(t)$. The second bracket simplifies because $1-\\frac{(n+1)T-t}{T}=\\frac{T-(n+1)T+t}{T}=\\frac{t-nT}{T}$.'},
{t:'eqbox', cap:'The frequency response of the first-order hold',
 tex:['G(j\\omega)=\\int_{-T/2}^{T/2}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T/2}^{T/2}=\\frac{e^{j\\omega T/2}-e^{-j\\omega T/2}}{j\\omega}=\\frac{2\\sin(\\omega T/2)}{\\omega}',
      'H_1(j\\omega)=\\frac{1}{T}\\,G(j\\omega)\\,G(j\\omega)=\\frac{1}{T}\\left[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\right]^{2}'],
 after:'$G$ is the transform of the centred rectangle; the limits are $\\pm T/2$ because $g$ is zero outside them, and $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$ cancels the $j$. Since $g$ is centred on $t=0$, $G$ has no delay factor. Convolution in time is multiplication in frequency, so $g*g$ transforms to $G\\cdot G$, and the constant $1/T$ passes through by linearity. $H_1$ is real and $H_1\\ge0$ because it is a square. At $\\omega=0$, $\\sin(\\omega T/2)/(\\omega/2)\\to T$, so $H_1(j0)=T^{2}/T=T$.'},
{t:'p', text:'At the band edge $\\omega=\\pi/T$: $H_1=\\frac{1}{T}\\bigl[\\sin(\\pi/2)/(\\pi/(2T))\\bigr]^{2}=\\frac{1}{T}\\cdot\\frac{4T^{2}}{\\pi^{2}}=\\frac{4T}{\\pi^{2}}\\approx0.41\\,T$, a larger sag than the $0.64\\,T$ of the zero-order hold. Far above the band $H_1$ falls off as $1/\\omega^{2}$, against $1/\\omega$ for $|H_0|$, so it leaks much less. With $T=0.5$ s at $\\omega=6\\pi$ rad/s, where $\\omega T/2=1.5\\pi$ and $|\\sin(1.5\\pi)|=1$:'},
{t:'eq', tex:'|H_0(j6\\pi)|=\\frac{2\\cdot1}{6\\pi}=\\frac{1}{3\\pi}\\approx0.106,\\qquad H_1(j6\\pi)=\\frac{1}{0.5}\\Bigl[\\frac{1}{3\\pi}\\Bigr]^{2}=\\frac{2}{9\\pi^{2}}\\approx0.023.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const T=0.5, pts=[]; for(let n=-6;n<=6;n++) pts.push([n*T,xB(n*T)]);
   const a=ax2({xr:[-2.5,2.5],yr:[-0.25,1.35],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_1(t)',yticksOverride:[0,0.5,1]});
   a.curve(xB,{color:C.in,width:1.4,dash:'8 5',n:1000});
   a.poly(pts,{color:C.out,width:2.4});
   for(let n=-5;n<=5;n++) a.point(n*T,xB(n*T),{color:C.mid,r:3.8});
   return a.svg(); },
  cap:'The first-order hold with $T=0.5$ s: the samples of the running signal joined by straight lines.', short:'The first-order hold output, $T=0.5$ s.'},
 {svg:()=>{ const T=0.5;
   const a=ax2({xr:[-0.9,0.9],yr:[-0.2,1.3],xlabel:'t\\;[\\text{s}]',ylabel:'g(t),\\;h_1(t)',yticksOverride:[0,0.5,1],xticksOverride:[-0.5,-0.25,0,0.25,0.5]});
   a.poly([[-0.9,0],[-T/2,0],[-T/2,1],[T/2,1],[T/2,0],[0.9,0]],{color:C.mid,width:1.6,dash:'7 4'});
   a.curve(t=>Math.abs(t)<=T?1-Math.abs(t)/T:0,{color:C.h,width:2.6,n:600});
   return a.svg(); },
  cap:'The hold rectangle $g(t)$, dashed, and the triangle $h_1(t)=(g*g)(t)/T$ of peak $1$, with $T=0.5$ s. The axis is time.', short:'The impulse response of the first-order hold.'}
]},
{t:'fig', svg:()=>{ const T=0.5;
  const a=ax({xr:[-10*PI,10*PI],yr:[-0.04,0.62],xpi:2*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H_0(j\\omega)|,\\;H_1(j\\omega)',yticksOverride:[0,0.25,0.5]});
  a.vline(-PI/T,{color:C.muted,opacity:.6}); a.vline(PI/T,{color:C.muted,opacity:.6});
  a.curve(w=>H0m(w,T),{color:C.slate,width:1.7,dash:'6 4',n:1600});
  a.curve(w=>H1m(w,T),{color:C.h,width:2.4,n:1600});
  return a.svg(); },
 cap:'Both holds with $T=0.5$ s: the first-order hold, solid amber, and the zero-order hold, dashed. The band edge $\\omega_s/2=2\\pi$ rad/s is marked. Both start at $T$; the first-order hold falls away faster on both sides of the edge.', short:'The zero-order and the first-order hold compared.'},
{t:'box', kind:'err', hd:'A hold is not a reconstruction', html:'Both holds are filters with a real, non-flat, non-band-limited response. The staircase and the broken line are different signals from $x(t)$, and a faster rate makes the error smaller but never zero. The sampling theorem guarantees that the samples <em>determine</em> $x(t)$ and names the filter that recovers it. Feeding the same samples to a different filter gives a different output.'},

{t:'h3', text:'Conditions for exact reconstruction'},
{t:'p', text:'Exact reconstruction needs three things together.'},
{t:'ol', items:[
 '<b>Band-limited</b>: $X(j\\omega)=0$ for $|\\omega|>\\omega_M$.',
 '<b>Rate</b>: $\\omega_s>2\\omega_M$.',
 '<b>Filter</b>: gain $T$ and cutoff $\\omega_M<\\omega_c<\\omega_s-\\omega_M$.'
]},
{t:'p', text:'The first condition fails for every signal of finite duration. Take the rectangular pulse $x(t)=1$ on $|t|\\le T_1$ and 0 outside:'},
{t:'eq', tex:'X(j\\omega)=\\int_{-T_1}^{T_1}e^{-j\\omega t}\\,\\d t=\\left[\\frac{e^{-j\\omega t}}{-j\\omega}\\right]_{-T_1}^{T_1}=\\frac{e^{j\\omega T_1}-e^{-j\\omega T_1}}{j\\omega}=\\frac{2\\sin(\\omega T_1)}{\\omega}.'},
{t:'p', text:'This transform crosses zero again and again, but it is never zero on a whole interval. There is no $\\omega_M$ beyond which it vanishes, so no rate keeps the copies apart, and the tails of all the copies add everywhere. In practice a filter first removes what lies above a chosen $\\omega_M$. The filtered signal is then recovered exactly; the original is not. By contrast, $\\cos(10\\pi t)$ has $\\omega_M=10\\pi$ rad/s, so any $\\omega_s>20\\pi$ rad/s recovers it exactly.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const g=w=>Math.abs(w)<1e-9?1:2*Math.sin(w*0.5)/w;
   const a=ax2({xr:[-16*PI,16*PI],yr:[-0.05,1.3],xpi:8*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X(j\\omega)|',yticksOverride:[0,0.5,1]});
   a.curve(w=>Math.abs(g(w)),{color:C.in,n:3000}); return a.svg(); },
  cap:'A rectangular pulse of width $1$ s, $T_1=0.5$ s, has $|X(j\\omega)|=|2\\sin(\\omega/2)/\\omega|$, which never settles to zero.', short:'The spectrum of a rectangular pulse is not band-limited.'},
 {svg:()=>{ const g=w=>Math.abs(w)<1e-9?1:2*Math.sin(w*0.5)/w;
   const a=ax2({xr:[-16*PI,16*PI],yr:[-0.2,5.4],xpi:8*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|X_p(j\\omega)|',yticksOverride:[0,2,4]});
   a.curve(w=>{ let s=0; for(let k=-8;k<=8;k++) s+=4*g(w-k*8*PI); return Math.abs(s); },{color:C.err,width:2.2,n:3000});
   return a.svg(); },
  cap:'The same pulse sampled with $T=0.25$ s, $\\omega_s=8\\pi$ rad/s: the tails of all the copies add at every frequency.', short:'The sampled spectrum of a rectangular pulse.'}
]},

/* ================================================================ 7.4 */
{t:'h2', num:'7.4', text:'Aliasing in practice'},
{t:'h3', text:'Aliasing of a sampled cosine'},
{t:'p', text:'Take $x(t)=\\cos(\\omega_0t)$, so $\\omega_M=\\omega_0$, and reconstruct with the cutoff at $\\omega_c=\\omega_s/2$. The transform is $X(j\\omega)=\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$. Substitute it into the sampled-spectrum sum:'},
{t:'eq', tex:'X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\bigl(j(\\omega-k\\omega_s)\\bigr)=\\frac{\\pi}{T}\\sum_{k=-\\infty}^{\\infty}\\bigl[\\delta(\\omega-k\\omega_s-\\omega_0)+\\delta(\\omega-k\\omega_s+\\omega_0)\\bigr].'},
{t:'p', text:'So sampling puts a line at every $k\\omega_s\\pm\\omega_0$, each of weight $\\pi/T$. The filter multiplies by $T$ inside $|\\omega|<\\omega_c$ and by 0 outside, so each surviving line returns to weight $\\pi$. The method has three steps: list the lines $k\\omega_s\\pm\\omega_0$, keep those with $|\\omega|<\\omega_c$, and read the output from the kept lines. For $k=0$ and $k=1$ at three rates (the $k=-1$ lines are the mirror images at negative frequencies and give the same verdict):'},
{t:'eq', tex:'\\begin{aligned}\\omega_s=6\\omega_0,\\ \\omega_c=3\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{inside};\\quad k=1:\\ 6\\omega_0\\pm\\omega_0=5\\omega_0,\\,7\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=3\\omega_0,\\ \\omega_c=1.5\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{inside};\\quad k=1:\\ 3\\omega_0\\pm\\omega_0=2\\omega_0,\\,4\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(\\omega_0t)\\\\\\omega_s=1.5\\omega_0,\\ \\omega_c=0.75\\omega_0:&\\quad k=0:\\ \\pm\\omega_0\\ \\text{outside};\\quad k=1:\\ 0.5\\omega_0\\ \\text{inside},\\ 2.5\\omega_0\\ \\text{outside}\\\\&\\quad\\Rightarrow\\;x_r(t)=\\cos(0.5\\omega_0t)\\end{aligned}'},
{t:'p', text:'In the third case the original frequency is removed: the line at $\\omega_0$ lies outside the filter. The line at $1.5\\omega_0-\\omega_0=0.5\\omega_0$ comes from the $k=1$ copy, and it lies inside.'},
{t:'figrow', n:3, items:[
 {svg:()=>{ const a=ax3({xr:[-15*PI,15*PI],yr:[-0.2,1.55],xpi:6*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)',yticksOverride:[]});
   lines(a,12*PI,[2*PI],15*PI); return a.svg(); },
  cap:'$\\omega_s=6\\omega_0$: the line at $\\omega_0$ is kept.'},
 {svg:()=>{ const a=ax3({xr:[-15*PI,15*PI],yr:[-0.2,1.55],xpi:6*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)',yticksOverride:[]});
   lines(a,6*PI,[2*PI],15*PI); return a.svg(); },
  cap:'$\\omega_s=3\\omega_0$: the line at $\\omega_0$ is still kept.'},
 {svg:()=>{ const a=ax3({xr:[-15*PI,15*PI],yr:[-0.2,1.55],xpi:6*PI,xlabel:'\\omega',ylabel:'X_p(j\\omega)',yticksOverride:[]});
   lines(a,3*PI,[2*PI],15*PI); return a.svg(); },
  cap:'$\\omega_s=1.5\\omega_0$: a copy line at $0.5\\omega_0$ is kept, red; the others are grey.'}
]},

{t:'h3', text:'The alias frequency'},
{t:'eqbox', cap:'The undersampled cosine, $\\omega_s/2<\\omega_0<\\omega_s$',
 tex:['X_r(j\\omega)=\\pi\\delta\\bigl(\\omega-(\\omega_s-\\omega_0)\\bigr)+\\pi\\delta\\bigl(\\omega+(\\omega_s-\\omega_0)\\bigr)\\;\\xrightarrow{\\ \\mathcal{F}^{-1}\\ }\\;x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)'],
 after:'For $\\omega_s/2<\\omega_0<\\omega_s$ the baseband line at $\\omega_0$ lies outside $|\\omega|<\\omega_s/2$, while the line $\\omega_s-\\omega_0$ of the copy $k=1$ lies inside, and so does its mirror $-(\\omega_s-\\omega_0)$ from $k=-1$. Each impulse is written as a function of $\\omega$; an expression such as $\\pi\\delta(\\omega_s-\\omega_0)$ is a constant and locates nothing. The arrow is the inverse transform.'},
{t:'p', text:'The output is a clean cosine at the wrong frequency, and nothing in the samples marks it. The samples of $\\cos(\\omega_0t)$ and of $\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$ are the same numbers, because $(\\omega_s-\\omega_0)nT=2\\pi n-\\omega_0nT$ and the cosine is even with period $2\\pi$.'},
{t:'p', text:'For any $\\omega_0$ the rule reads as follows. The numbers $\\omega_0-k\\omega_s$, for all integers $k$, are spaced $\\omega_s$ apart, so exactly one of them lies in $-\\omega_s/2<\\omega<\\omega_s/2$ (when none sits on an end); it is the one with $k$ the integer nearest to $\\omega_0/\\omega_s$. Its mirror comes from the negative-frequency line. So the kept pair is $\\pm|\\omega_0-k\\omega_s|$. In hertz the tone returns at'},
{t:'eq', tex:'f_a=|f_0-kf_s|,\\qquad k=\\text{the integer nearest to }f_0/f_s,\\qquad 0\\le f_a\\le f_s/2.'},
{t:'p', text:'The simpler form $\\omega_s-\\omega_0$ is the case $k=1$, which holds for $\\omega_s/2<\\omega_0<3\\omega_s/2$ only. For example, at $f_s=6$ kHz a tone at $f_0=4$ kHz returns at $|4-6|=2$ kHz, so a 4 kHz whistle recorded this way plays back at 2 kHz. A tone at $5$ kHz returns at $|5-6|=1$ kHz, the only line inside $|f|<3$ kHz.'},
{t:'fig', svg:()=>{ const f0=4, fs=6, fa=fold(f0,fs);
  const a=ax({xr:[-0.05,2.05],yr:[-1.4,1.55],xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_r(t)',yticksOverride:[-1,0,1],xticksOverride:[0,0.5,1,1.5,2]});
  a.curve(t=>Math.cos(2*PI*f0*t),{color:C.in,width:1.4,dash:'5 5',n:3000});
  a.curve(t=>Math.cos(2*PI*fa*t),{color:C.err,width:2.4,n:1500});
  samp(t=>Math.cos(2*PI*f0*t),1/fs,-0.05,2.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:4.5}));
  return a.svg(); },
 cap:'A $4$ kHz tone, dashed, sampled at $f_s=6$ kHz, violet dots. The red $2$ kHz cosine passes through the same samples, and it is what the filter returns.', short:'A $4$ kHz tone sampled at $6$ kHz returns at $2$ kHz.'},

{t:'h3', text:'Hearing aliasing with a chirp'},
{t:'p', text:'A <b>chirp</b> is a tone whose frequency rises steadily. Take $x(t)=\\cos\\bigl(2\\pi\\cdot1000\\,t^{2}\\bigr)$. The frequency at a moment is the rate of change of the phase, divided by $2\\pi$:'},
{t:'eq', tex:'f(t)=\\frac{1}{2\\pi}\\,\\frac{\\d}{\\d t}\\bigl(2\\pi\\cdot1000\\,t^{2}\\bigr)=\\frac{1}{2\\pi}\\cdot2\\pi\\cdot2000\\,t=2000\\,t\\ \\text{Hz}.'},
{t:'p', text:'In 3 s it rises from 0 to 6 kHz. Sample it at $f_s=4$ kHz and apply the fold rule at each moment. For $0\\le t\\le1$ s, $f\\le2$ kHz $=f_s/2$ and $k=0$: the tone is heard as it is, rising to 2 kHz at $t=1$ s. For $1\\le t\\le2$ s, $2\\le f\\le4$ kHz and $k=1$: the heard pitch is $4000-2000t$ Hz, which falls to 0 at $t=2$ s, where $f=f_s$. For $2\\le t\\le3$ s, $4\\le f\\le6$ kHz and again $k=1$: the heard pitch is $2000t-4000$ Hz, which rises again to 2 kHz at $t=3$ s. The pitch that comes out folds at $f_s/2$ and runs back down.'},
{t:'fig', svg:()=>{ const fa=t=>fold(2*t,4);
  const a=ax({xr:[0,3.1],yr:[0,7.2],xlabel:'t\\;[\\text{s}]',ylabel:'f\\;[\\text{kHz}]',xticksOverride:[0,1,2,3],xtickfmt:v=>String(v),yticksOverride:[2,4,6],ytickfmt:v=>String(v)});
  a.rect(0,0,3.1,2,{fill:wash(C.out,.13)});
  a.hline(2,{color:C.coral,width:1.5,dash:'6 4',opacity:1}); a.hline(4,{color:C.muted,width:1.2,dash:'6 4',opacity:.9});
  a.note(0.08,2.35,'f_s/2',{anchor:'start',color:C.coral,fs:13,tex:true});
  a.note(0.08,4.35,'f_s',{anchor:'start',color:C.muted,fs:13,tex:true});
  a.curve(t=>t<=3+1e-9?2*t:NaN,{color:C.in,width:1.7,dash:'8 5',n:620});
  a.curve(t=>t<=3+1e-9?fa(t):NaN,{color:C.err,width:2.5,n:1240});
  return a.svg(); },
 cap:'The chirp frequency $f(t)=2000\\,t$ Hz, dashed, sampled at $f_s=4$ kHz, and the pitch that comes out, red. The green band is what the reconstruction filter keeps.', short:'The pitch of a sampled chirp folds at $f_s/2$.'},

{t:'ex', hd:'Example 7.8 — aliasing at three sampling periods', rows:[
 ['Given','$x(t)=\\cos(2\\pi t)$, so $\\omega_M=2\\pi$ rad/s and the Nyquist rate is $4\\pi$ rad/s. The periods are $T_1=1/4$ s, $T_2=1/3$ s and $T_3=2/3$ s, and $\\omega_c=\\omega_s/2$.'],
 ['Find','Which periods recover the signal, and what is recovered when one does not.'],
 ['Method','Use the line spectrum after sampling, because the filter selects individual lines. Compute $\\omega_s=2\\pi/T$, compare it with the Nyquist rate of <b>this</b> signal, $4\\pi$, and when it fails find the line inside $|\\omega|<\\omega_s/2$.'],
 ['Solution','$$\\begin{aligned}T_1=1/4\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{1/4}=8\\pi>4\\pi,\\quad\\omega_c=4\\pi\\\\T_2=1/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{1/3}=6\\pi>4\\pi,\\quad\\omega_c=3\\pi\\\\T_3=2/3\\ \\text{s}:&\\quad\\omega_s=\\frac{2\\pi}{2/3}=3\\pi<4\\pi,\\quad\\omega_c=1.5\\pi\\end{aligned}$$ In the first two rows the baseband lines $\\pm2\\pi$ are inside the cutoff, and the nearest copy lines, $8\\pi-2\\pi=6\\pi$ and $6\\pi-2\\pi=4\\pi$, are outside, so $x_r(t)=\\cos(2\\pi t)$. In the third row the baseband lines $\\pm2\\pi$ lie outside $|\\omega|<1.5\\pi$ and are removed. The $k=1$ copy puts lines at $3\\pi\\pm2\\pi$, that is at $5\\pi$ and at $\\pi$; the one at $\\pi$ is inside. The $k=-1$ copy gives the mirror line at $-\\pi$. So $$\\begin{aligned}\\omega_s-\\omega_0&=3\\pi-2\\pi=\\pi<\\omega_c=1.5\\pi,\\\\X_r(j\\omega)&=\\pi\\delta(\\omega-\\pi)+\\pi\\delta(\\omega+\\pi)\\;\\Longrightarrow\\;x_r(t)=\\cos(\\pi t).\\end{aligned}$$'],
 ['Check','The sample values of the two signals must agree at $T_3=2/3$ s: $$\\begin{aligned}\\cos(2\\pi nT_3)&=\\cos\\Bigl(\\frac{4\\pi n}{3}\\Bigr)=\\cos\\Bigl(2\\pi n-\\frac{2\\pi n}{3}\\Bigr)\\\\&=\\cos\\Bigl(\\frac{2\\pi n}{3}\\Bigr)=\\cos(\\pi nT_3).\\end{aligned}$$ Here $2\\pi n$ is a whole number of turns, and the cosine is even. The two sample sequences are identical, so no reconstruction could prefer one over the other; the filter returns the lower one. At $T=0.8$ s, similarly, $\\omega_s=2\\pi/0.8=2.5\\pi$ and $\\omega_c=1.25\\pi$: the line $2\\pi$ is outside, and the copy line $2.5\\pi-2\\pi=0.5\\pi$ is inside, so $x_r(t)=\\cos(0.5\\pi t)$.'],
 ['Warning','The verdict rests on the number the rate is compared with, and for this signal that number is $2\\omega_M=4\\pi$. Comparing against another signal&rsquo;s Nyquist rate of $6\\pi$ makes the middle row read $6\\pi\\ge6\\pi$, the boundary case the theorem excludes, although this signal has a comfortable margin there.']
]},
{t:'fig', svg:()=>{ const T=2/3;
  const a=ax({xr:[-0.05,3.05],yr:[-1.4,1.55],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',yticksOverride:[-1,0,1],xticksOverride:[0,1,2,3]});
  a.curve(t=>Math.cos(2*PI*t),{color:C.in,width:1.4,dash:'5 5',n:2400});
  a.curve(t=>Math.cos(PI*t),{color:C.err,width:2.4,n:2400});
  samp(t=>Math.cos(2*PI*t),T,-0.05,3.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:4.5}));
  return a.svg(); },
 cap:'Example 7.8 at $T_3=2/3$ s: $\\cos(2\\pi t)$, dashed, its samples, and the red $\\cos(\\pi t)$ that the filter returns through the same samples.', short:'The alias of $\\cos(2\\pi t)$ at $T_3=2/3$ s.'},

{t:'ex', hd:'Example 7.9 — partial aliasing of two cosines', rows:[
 ['Given','$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$, sampled with $T=2/5$ s; $\\omega_c=\\omega_s/2$.'],
 ['Find','$x_r(t)$, and which component moved.'],
 ['Method','Treat the components separately, because one can alias while the other passes unchanged. First test the rate against this signal&rsquo;s Nyquist rate, then track each baseband and copy line through the filter.'],
 ['Solution','$\\omega_M=3\\pi$ rad/s, so the Nyquist rate is $2\\omega_M=6\\pi$ rad/s, while $$\\omega_s=\\frac{2\\pi}{T}=\\frac{2\\pi}{2/5}=5\\pi\\ \\text{rad/s},\\qquad\\omega_c=\\frac{\\omega_s}{2}=2.5\\pi\\ \\text{rad/s}.$$ Since $5\\pi<6\\pi$, aliasing occurs. Each component transforms to a pair of impulses of weight $\\pi$, and sampling puts lines at $k\\omega_s\\pm\\omega_0$ for each of the two values of $\\omega_0$. Test each line against $|\\omega|<2.5\\pi$: $$\\begin{aligned}\\omega_0=\\pi,\\ k=0:&\\quad\\pm\\pi\\ \\text{inside}\\\\\\omega_0=\\pi,\\ k=1:&\\quad5\\pi-\\pi=4\\pi,\\ 5\\pi+\\pi=6\\pi\\ \\text{outside}\\\\\\omega_0=3\\pi,\\ k=0:&\\quad\\pm3\\pi\\ \\text{outside}\\\\\\omega_0=3\\pi,\\ k=1:&\\quad5\\pi-3\\pi=2\\pi\\ \\text{inside},\\ 5\\pi+3\\pi=8\\pi\\ \\text{outside}\\end{aligned}$$ Larger $|k|$ moves the lines further out, and $k=-1$ gives the mirror lines at $-2\\pi$ and $-4\\pi$. The filter multiplies the surviving lines by $T$, which cancels the $1/T$ of sampling and returns the weight $\\pi$ to each line. Hence $$\\begin{aligned}X_r(j\\omega)={}&\\pi\\bigl[\\delta(\\omega-\\pi)+\\delta(\\omega+\\pi)\\bigr]+\\pi\\bigl[\\delta(\\omega-2\\pi)+\\delta(\\omega+2\\pi)\\bigr]\\\\\\xrightarrow{\\ \\mathcal{F}^{-1}\\ }\\;x_r(t)={}&\\cos(\\pi t)+\\cos(2\\pi t),\\end{aligned}$$ since each pair $\\pi[\\delta(\\omega-a)+\\delta(\\omega+a)]$ returns $\\cos(at)$. The component $\\cos(\\pi t)$ keeps its frequency; $\\cos(3\\pi t)$ returns at $\\omega_s-3\\pi=2\\pi$, a frequency the signal never contained.'],
 ['Check','The aliased component and its replacement must give the same samples at $T=2/5$ s: $$\\begin{aligned}\\cos(3\\pi nT)&=\\cos\\Bigl(\\frac{6\\pi n}{5}\\Bigr)=\\cos\\Bigl(2\\pi n-\\frac{4\\pi n}{5}\\Bigr)\\\\&=\\cos\\Bigl(\\frac{4\\pi n}{5}\\Bigr)=\\cos(2\\pi nT).\\end{aligned}$$'],
 ['Variation','With $T=1/2$ s, $\\omega_s=4\\pi$ and $\\omega_c=2\\pi$. The line $\\pi$ is kept. The copy line of the second component lands at $4\\pi-3\\pi=\\pi$, on top of the kept line, so the two weights add: $X_r(j\\omega)=2\\pi\\bigl[\\delta(\\omega-\\pi)+\\delta(\\omega+\\pi)\\bigr]$ and $x_r(t)=2\\cos(\\pi t)$. Saying only &ldquo;aliasing occurred&rdquo; is not an answer; name what each component became.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-5.5*PI,5.5*PI],yr:[-0.2,1.55],xpi:PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',yticksOverride:[]});
   lines(a,5*PI,[PI,3*PI],5.5*PI); return a.svg(); },
  cap:'The lines of Example 7.9 after sampling at $\\omega_s=5\\pi$ rad/s, with the filter $|\\omega|<2.5\\pi$ dashed. The line at $\\pi$ is kept, cyan, the copy line at $2\\pi$ is kept, red, and the grey lines are removed.', short:'The lines of Example 7.9 and the filter.'},
 {svg:()=>{ const a=ax2({xr:[-0.05,4.05],yr:[-2.4,2.6],xlabel:'t\\;[\\text{s}]',ylabel:'x(t),\\;x_r(t)',yticksOverride:[-2,0,2],xticksOverride:[0,1,2,3,4]});
   a.curve(t=>Math.cos(PI*t)+Math.cos(3*PI*t),{color:C.in,width:1.3,dash:'5 5',n:2600});
   a.curve(t=>Math.cos(PI*t)+Math.cos(2*PI*t),{color:C.err,width:2.2,n:2600});
   samp(t=>Math.cos(PI*t)+Math.cos(3*PI*t),0.4,-0.05,4.05).forEach(p=>a.point(p[0],p[1],{color:C.mid,r:4}));
   return a.svg(); },
  cap:'$x(t)$, dashed, and the red $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$. Both pass through every sample.', short:'Example 7.9 in time.'}
]},

{t:'h3', text:'The anti-aliasing filter'},
{t:'p', text:'No real signal is strictly band-limited, and a sampler at a fixed rate cannot be helped after the fact. The repair is a low-pass filter $H_{AA}$ placed <b>before</b> the sampler, which removes everything above $\\omega_s/2$ while it can still be removed cleanly.'},
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
]}), cap:'The chain with an anti-aliasing filter. The filter comes first; the sampler output is $x_p(t)$, and $x_r(t)$ is the output of the reconstruction filter.', short:'The sampling chain with an anti-aliasing filter.'},
{t:'box', kind:'err', hd:'Place the filter before the sampler', html:'After sampling, a folded frequency sits on top of wanted content at the same frequency. No later filter can separate the two contributions. The anti-aliasing filter must remove the high frequencies before the sampler.'},
{t:'ex', hd:'Example 7.10 — what the anti-aliasing filter buys', rows:[
 ['Given','$X(j\\omega)=1-|\\omega|/(3\\pi)$ on $|\\omega|\\le3\\pi$ and 0 outside, a triangle that reaches past $\\omega_s/2$ for $\\omega_s=4\\pi$ rad/s. Before the sampler, an ideal low-pass $H_{AA}$ keeps $|\\omega|<\\omega_a$; the reconstruction filter has gain $T$ and cutoff $\\omega_s/2=2\\pi$.'],
 ['Find','The error energy $\\frac{1}{2\\pi}\\int|X(j\\omega)-X_r(j\\omega)|^{2}\\,\\d\\omega$ for $\\omega_a=3\\pi$ (no filter), $\\omega_a=2\\pi$ and $\\omega_a=\\pi$.'],
 ['Method','By Parseval this is the energy of $x(t)-x_r(t)$. Split the frequency axis into the part the reconstruction keeps, $|\\omega|<2\\pi$, and the part it removes, $2\\pi<|\\omega|<3\\pi$. Inside the band the error is whatever the copies add or the prefilter removed; outside it the error is $X$ itself. The triangle is even, so compute $\\omega>0$ and double.'],
 ['Solution','No filter, $\\omega_a=3\\pi$. For $0<\\omega<2\\pi$ the copy $k=1$ adds $X(j(\\omega-4\\pi))$, which is non-zero where $|\\omega-4\\pi|\\le3\\pi$, that is for $\\omega\\ge\\pi$; there it equals $1-(4\\pi-\\omega)/(3\\pi)=(\\omega-\\pi)/(3\\pi)$. So the error inside the band is $(\\omega-\\pi)/(3\\pi)$ on $\\pi<\\omega<2\\pi$, and outside it is $X=(3\\pi-\\omega)/(3\\pi)$ on $2\\pi<\\omega<3\\pi$. With $u=\\omega-\\pi$ in the first integral and $u=3\\pi-\\omega$ in the second, each runs over $0<u<\\pi$: $$\\begin{aligned}\\int_{\\pi}^{2\\pi}\\Bigl(\\frac{\\omega-\\pi}{3\\pi}\\Bigr)^{2}\\d\\omega&=\\int_{2\\pi}^{3\\pi}\\Bigl(\\frac{3\\pi-\\omega}{3\\pi}\\Bigr)^{2}\\d\\omega=\\frac{1}{9\\pi^{2}}\\Bigl[\\frac{u^{3}}{3}\\Bigr]_0^{\\pi}=\\frac{\\pi}{27}\\\\E_{3\\pi}&=\\frac{1}{2\\pi}\\cdot2\\Bigl(\\frac{\\pi}{27}+\\frac{\\pi}{27}\\Bigr)=\\frac{2}{27}\\approx0.074.\\end{aligned}$$ With $\\omega_a=2\\pi$ the prefilter removes $2\\pi<|\\omega|<3\\pi$ before the sampler, so no copy reaches the band and only the removed part is lost: $$E_{2\\pi}=\\frac{1}{2\\pi}\\cdot2\\cdot\\frac{\\pi}{27}=\\frac{1}{27}\\approx0.037.$$ With $\\omega_a=\\pi$ the whole of $\\pi<|\\omega|<3\\pi$ is lost; with $u=3\\pi-\\omega$ running over $0<u<2\\pi$: $$E_{\\pi}=\\frac{1}{2\\pi}\\cdot2\\int_{\\pi}^{3\\pi}\\Bigl(\\frac{3\\pi-\\omega}{3\\pi}\\Bigr)^{2}\\d\\omega=\\frac{1}{\\pi}\\cdot\\frac{1}{9\\pi^{2}}\\Bigl[\\frac{u^{3}}{3}\\Bigr]_0^{2\\pi}=\\frac{1}{\\pi}\\cdot\\frac{8\\pi^{3}}{27\\pi^{2}}=\\frac{8}{27}\\approx0.296.$$'],
 ['Check','Moving $\\omega_a$ from $3\\pi$ to $2\\pi$ removes the folded part and halves the error: $\\frac{1/27}{2/27}=\\frac12$. A cutoff below $\\omega_s/2$ removes wanted content too, with no folded part left to remove, so $E_\\pi=8/27$ is larger than both. The best cutoff is $\\omega_s/2$.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const B=3*PI, WS=4*PI, X=w=>tri0(w,B,1), Xr=w=>Math.abs(w)<WS/2?X(w)+X(w-WS)+X(w+WS):0;
   const a=ax2({xr:[-6.5*PI,6.5*PI],yr:[-0.1,1.45],xpi:2*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{spectra}',yticksOverride:[0,1]});
   const pts=[]; for(let i=0;i<=600;i++){ const w=-B+2*B*i/600; pts.push([w,X(w)]); } for(let i=600;i>=0;i--){ const w=-B+2*B*i/600; pts.push([w,Xr(w)]); }
   a.raw(`<path d="M${pts.map(p=>a.sx(p[0]).toFixed(2)+','+a.sy(p[1]).toFixed(2)).join('L')}Z" fill="${C.err}" fill-opacity=".28" stroke="none"/>`);
   for(const k of [-1,1]) a.curve(w=>{ const y=X(w-k*WS); return y>0?y:NaN; },{color:C.mid,width:1.5,n:1800});
   a.curve(X,{color:C.in,width:1.7,dash:'7 6',n:1800});
   a.curve(w=>Math.abs(w)<WS/2?Xr(w):NaN,{color:C.out,width:2.4,n:1800});
   return a.svg(); },
  cap:'No anti-aliasing filter: $X(j\\omega)$, dashed, the copies at $\\pm4\\pi$, violet, and the recovered $X_r(j\\omega)$, green. The red area is the error; its energy is $2/27$.', short:'Reconstruction error without an anti-aliasing filter.'},
 {svg:()=>{ const B=3*PI, WS=4*PI, X=w=>tri0(w,B,1), Y=w=>Math.abs(w)<2*PI?X(w):0;
   const a=ax2({xr:[-6.5*PI,6.5*PI],yr:[-0.1,1.45],xpi:2*PI,xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{spectra}',yticksOverride:[0,1]});
   a.area(X,2*PI,B,{color:wash(C.err,.28)}); a.area(X,-B,-2*PI,{color:wash(C.err,.28)});
   for(const k of [-1,1]) a.curve(w=>{ const y=Y(w-k*WS); return y>0?y:NaN; },{color:C.mid,width:1.5,n:1800});
   a.curve(X,{color:C.in,width:1.7,dash:'7 6',n:1800});
   a.curve(w=>Math.abs(w)<WS/2?Y(w):NaN,{color:C.out,width:2.4,n:1800});
   a.rect(-2*PI,0,2*PI,1.2,{stroke:C.h,dash:'6 4',width:1.6});
   return a.svg(); },
  cap:'With $H_{AA}$ cutting at $\\omega_a=2\\pi$, dashed amber: the copies no longer reach the band, and only the removed tails are lost. The error energy halves to $1/27$.', short:'Reconstruction error with an anti-aliasing filter.'}
]},
{t:'p', text:'The same comparison for the two cosines of Example 7.9, $x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$ at $T=2/5$ s. Without the filter, $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$ and the error is $e(t)=x(t)-x_r(t)=\\cos(3\\pi t)-\\cos(2\\pi t)$. With a low-pass at $2.5\\pi$ ahead of the sampler, the component at $3\\pi$ is removed first, $\\cos(\\pi t)$ alone is sampled and recovered exactly, and the error is $e(t)=\\cos(3\\pi t)$.'},
{t:'eqbox', cap:'Mean-square error, averaged over one period of 2 s',
 tex:['\\begin{aligned}e^{2}(t)&=\\bigl[\\cos(3\\pi t)-\\cos(2\\pi t)\\bigr]^{2}=\\cos^{2}(3\\pi t)-2\\cos(3\\pi t)\\cos(2\\pi t)+\\cos^{2}(2\\pi t)\\\\&=\\cos^{2}(3\\pi t)-\\cos(\\pi t)-\\cos(5\\pi t)+\\cos^{2}(2\\pi t)\\end{aligned}',
      '\\overline{e^{2}}\\Big|_{\\text{no filter}}=\\frac{1}{2}\\int_{0}^{2}e^{2}(t)\\,\\d t=\\tfrac12-0-0+\\tfrac12=1,\\qquad \\overline{e^{2}}\\Big|_{\\text{filtered}}=\\frac{1}{2}\\int_{0}^{2}\\cos^{2}(3\\pi t)\\,\\d t=\\tfrac12'],
 after:'The cross term uses $2\\cos A\\cos B=\\cos(A-B)+\\cos(A+B)$ with $A=3\\pi t$ and $B=2\\pi t$. The window of 2 s holds a whole number of periods of every term: $\\cos(\\pi t)$ has period 2 s, $\\cos(5\\pi t)$ has period 0.4 s, and $\\cos^{2}(3\\pi t)=\\tfrac12+\\tfrac12\\cos(6\\pi t)$ averages to $\\tfrac12$. A cosine averages to zero over a whole number of periods, so each cross term contributes 0 and each squared cosine contributes $\\tfrac12$. Filtering first halves the error power. It costs the $3\\pi$ component, which was lost either way. What it buys is the removal of a false component at $2\\pi$ that the signal never contained, and that nothing downstream could tell apart from the signal.'},

{t:'h3', text:'Why 44.1 kHz'},
{t:'p', text:'Hearing ends near 20 kHz, so the anti-aliasing filter of an audio converter passes 0 to 20 kHz. A real filter cannot drop at once: it needs a width $\\Delta$, its <b>transition band</b>, to fall to its stop level at $20+\\Delta$ kHz. After the filter the spectrum occupies $|f|\\le20+\\Delta$ kHz. Its copy at $f_s$ begins to rise at $f_s-(20+\\Delta)$, and it must not start before the filter has stopped:'},
{t:'eq', tex:'f_s-(20+\\Delta)\\ge20+\\Delta\\quad\\Longrightarrow\\quad f_s\\ge2(20+\\Delta)=40+2\\Delta\\ \\text{kHz}.'},
{t:'ex', hd:'Example 7.11 — the transition band of three rates', rows:[
 ['Given','An audio band of 0 to 20 kHz, and the rates 40 kHz, 44.1 kHz (the CD) and 48 kHz (film and video sound).'],
 ['Find','The transition width $\\Delta$ each rate leaves the anti-aliasing filter, and the lowest rate for a filter that needs $\\Delta=3$ kHz.'],
 ['Method','Solve $f_s=2(20+\\Delta)$ for $\\Delta$, which gives $\\Delta=f_s/2-20$.'],
 ['Solution','$$\\begin{aligned}f_s=40:&\\quad\\Delta=20-20=0\\\\f_s=44.1:&\\quad\\Delta=22.05-20=2.05\\ \\text{kHz}\\\\f_s=48:&\\quad\\Delta=24-20=4\\ \\text{kHz}\\end{aligned}$$ 40 kHz would need $\\Delta=0$, a filter no circuit can build. The CD rate leaves 2.05 kHz, from 20 to 22.05 kHz. A cheaper filter that needs $\\Delta=3$ kHz requires $f_s\\ge2(20+3)=46$ kHz; at 44.1 kHz its copies would overlap.'],
 ['Check','Put each $\\Delta$ back: $40+2\\times2.05=44.1$ and $40+2\\times4=48$. The same rule serves a telephone line, which keeps speech up to 3.4 kHz and samples at 8 kHz: $\\Delta=8/2-3.4=0.6$ kHz.']
]},
{t:'fig', svg:()=>{ const D=2.05, fs=44.1, lo=fs-20-D, hi=20+D;
  const AA=f=>{ const a=Math.abs(f); return a<=20?1:(a>=20+D?0:(20+D-a)/D); };
  const a=ax({xr:[-26,54],yr:[-0.12,1.45],xlabel:'f\\;[\\text{kHz}]',ylabel:'\\text{spectrum}',xticksOverride:[-20,0,20,44.1],xtickfmt:v=>String(v),yticksOverride:[0,1],ytickfmt:v=>String(v)});
  for(let k=-1;k<=1;k++) a.poly([[k*fs-20-D,0],[k*fs-20,1],[k*fs+20,1],[k*fs+20+D,0]],{color:k?C.mid:C.in});
  a.vline(fs/2,{color:C.coral,width:1.5,dash:'5 4',opacity:1});
  a.note(fs/2,1.2,'f_s/2',{anchor:'start',dx:8,color:C.coral,fs:13,tex:true});
  return a.svg(); },
 cap:'A flat input after the anti-aliasing filter, cyan, and its copies at the CD rate $f_s=44.1$ kHz, violet. With $\\Delta=2.05$ kHz the filter reaches its stop level exactly where the copy at $f_s$ begins, at $f_s/2=22.05$ kHz.', short:'The transition band at the CD rate.'},

{t:'h3', text:'Aliasing in time'},
{t:'p', text:'A camera is a sampler with $T=1/f_s$, where $f_s$ is the frame rate, and a strobe lamp is the same device built from light. What is seen follows the alias rule, applied to an angle.'},
{t:'ex', hd:'Example 7.12 — a wheel that turns backwards', rows:[
 ['Given','A marked spoke turns at 9 revolutions per second. A camera records 10 frames per second.'],
 ['Find','The rotation the recording shows, with its direction.'],
 ['Method','Model the tip of the spoke as $e^{j\\theta(t)}$ with $\\theta(t)=2\\pi\\cdot9\\,t$, a single complex exponential, so that the direction of rotation is the sign of its frequency. Sample it at $\\omega_s=2\\pi f_s$ and keep the line inside $|\\omega|<\\omega_s/2$.'],
 ['Solution','The tip $e^{j18\\pi t}$ has one line, at $\\omega_0=2\\pi\\cdot9=18\\pi$ rad/s. The camera samples at $f_s=10$ Hz, so $\\omega_s=20\\pi$ rad/s and the kept band is $|\\omega|<10\\pi$. Sampling puts copies of the line at $18\\pi+k\\cdot20\\pi$: $$\\ldots,\\;-22\\pi,\\;\\underbrace{-2\\pi}_{k=-1},\\;\\underbrace{18\\pi}_{k=0},\\;38\\pi,\\;\\ldots$$ Only $k=-1$ lies inside, so the kept line is $\\omega_0-\\omega_s=18\\pi-20\\pi=-2\\pi$ rad/s. That is $2\\pi/2\\pi=1$ revolution per second, and the minus sign means the other direction. Since $\\omega_s=20\\pi<2\\omega_0=36\\pi$, this is the undersampled case. Between frames the spoke turns $9/10$ of a turn, and the eye reads that as $1/10$ of a turn backwards, because it takes the shorter way round.'],
 ['Check','Frame $n$ is taken at $t=n/10$ s. The recorded angle is $$\\theta\\Bigl(\\frac{n}{10}\\Bigr)=18\\pi\\,\\frac{n}{10}=2\\pi n-\\frac{2\\pi n}{10},$$ and $e^{j(2\\pi n-2\\pi n/10)}=e^{-j2\\pi n/10}$ because $e^{j2\\pi n}=1$. These are exactly the frames of a rotation at $-1$ revolution per second. At 20 frames per second, $\\omega_s=40\\pi>36\\pi$, and the film shows 9 rev/s in the right direction. At 9 frames per second the kept line is $18\\pi-18\\pi=0$, and the spoke stands still. A fan at 25 rev/s filmed at 24 frames per second gives $50\\pi-48\\pi=+2\\pi$: 1 rev/s forward.']
]},
{t:'fig', svg:()=>{ const a=ax({xr:[-0.03,1.03],yr:[-1.4,1.55],xlabel:'t\\;[\\text{s}]',ylabel:'\\cos\\theta(t)',yticksOverride:[-1,0,1],xticksOverride:[0,0.25,0.5,0.75,1]});
  a.curve(t=>Math.cos(18*PI*t),{color:C.in,width:1.1,dash:'4 4',n:3000});
  a.curve(t=>Math.cos(2*PI*t),{color:C.err,width:2.3,n:1600});
  samp(t=>Math.cos(18*PI*t),0.1,-0.03,1.03).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:4.4}));
  return a.svg(); },
 cap:'The horizontal position of the spoke tip, $\\cos\\theta(t)$, at 9 revolutions per second, dashed, and the frames at 10 per second, dots. The frames describe one revolution per second, red.', short:'Frames of a spoke turning at 9 revolutions per second.'},

{t:'h3', text:'Aliasing in space'},
{t:'p', text:'Position takes the place of time without any change to the arithmetic. A stripe pattern of 9 cycles per millimetre recorded on a grid of 10 points per millimetre has $2\\times9=18>10$, so it is undersampled, and it is recorded at $|10-9|=1$ cycle per millimetre. A fine pattern is recorded as a coarse one. The coarse bands are in the samples, not in the object. They are smooth and regular, and nothing marks them as false. The cure is the one used in time: blur the detail slightly before it is recorded, not after.'},
{t:'p', text:'Two regular patterns laid over each other make the same effect with no sampler at all. Stripes of period 1.0 mm and 1.1 mm have spatial frequencies'},
{t:'eq', tex:'f_1=\\frac{1}{1.0}=1.000,\\qquad f_2=\\frac{1}{1.1}=0.909\\ \\text{cycles/mm},\\qquad P=\\frac{1}{f_1-f_2}=\\frac{1}{1-\\frac{1}{1.1}}=\\frac{1.1}{0.1}=11\\ \\text{mm}.'},
{t:'p', text:'Two close spatial frequencies beat at their difference, as two close tones do, and the overlay repeats every $P$. This pattern is called <b>moiré</b>. When an image is recorded, the pixel grid is one of the two patterns: that is the moiré on a photographed screen.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const b=x=>0.5+0.5*Math.cos(2*PI*9*x);
   const a=ax2({xr:[-0.05,2.05],yr:[-0.15,1.3],xlabel:'x\\;[\\text{mm}]',ylabel:'\\text{brightness}',pad:{l:74,r:22,t:26,b:34},yticksOverride:[0,0.5,1],xticksOverride:[0,0.5,1,1.5,2]});
   a.curve(b,{color:C.in,width:1.0,opacity:.7,n:3200});
   a.curve(x=>0.5+0.5*Math.cos(2*PI*x),{color:C.err,width:2.2,n:1600});
   samp(b,0.1,-0.05,2.05).forEach(pr=>a.point(pr[0],pr[1],{color:C.mid,r:3.8}));
   return a.svg(); },
  cap:'Stripes of 9 cycles per millimetre, cyan, recorded by a grid of 10 points per millimetre, dots. The grid records 1 cycle per millimetre, red.', short:'Spatial aliasing of a stripe pattern.'},
 {svg:()=>{ const a=ax2({xr:[0,24],yr:[0,4.4],xlabel:'x\\;[\\text{mm}]',grid:false,yticksOverride:[],xticksOverride:[0,4,8,12,16,20,24],pad:{l:74,r:22,t:26,b:34}});
   const bars=(q,ya,yb)=>{ for(let x=0;x<24-1e-9;x+=q) a.rect(x,ya,Math.min(x+q/2,24),yb,{fill:C.ink}); };
   bars(1.0,2.75,3.55); bars(1.1,2.75,3.55); bars(1.0,1.55,2.35); bars(1.1,0.35,1.15);
   a.span(0,11,3.95,'P=11\\;\\text{mm}',{tex:true,color:C.coral,fs:13});
   a.note(0,3.15,'\\text{both}',{tex:true,anchor:'end',dx:-8,dy:4,color:C.muted,fs:12});
   a.note(0,1.95,'1.0\\;\\text{mm}',{tex:true,anchor:'end',dx:-8,dy:4,color:C.muted,fs:12});
   a.note(0,0.75,'1.1\\;\\text{mm}',{tex:true,anchor:'end',dx:-8,dy:4,color:C.muted,fs:12});
   return a.svg(); },
  cap:'Bars of period 1.0 mm and 1.1 mm, alone and laid over each other. The overlay is dark where the bars disagree, and that repeats every $P=11$ mm.', short:'Moiré from two stripe patterns.'}
]},

/* ================================================================ 7.5 */
{t:'h2', num:'7.5', text:'Discrete-time processing of continuous-time signals'},
{t:'p', text:'Most signal processing today samples a continuous-time signal, computes with the numbers, and converts the result back. This section follows a band-limited signal through that chain and shows that, for such inputs, the whole chain acts as one continuous-time LTI system.'},
{t:'box', hd:'Two frequency variables', html:'Both kinds of frequency appear together here, so this section writes $\\omega$ for continuous-time frequency in rad/s, with $X_c(j\\omega)$, and $\\Omega$ for discrete-time frequency in rad/sample, with $X_d(e^{j\\Omega})=\\sum_nx_d[n]e^{-j\\Omega n}$. Chapter 6 wrote $\\omega$ for the discrete-time variable; Section 7.6 returns to that. The subscript $c$ marks a continuous-time signal and $d$ a sequence.'},

{t:'h3', text:'The processing chain'},
{t:'fig', svg:()=>P.blocks({w:760,h:130,items:[
  {t:'arrow',x1:8,y1:56,x2:104,y2:56,label:'x_c(t)',tex:true},
  {t:'box',x:104,y:32,w:92,h:48,label:'\\text{C/D}',tex:true,fs:16},
  {t:'arrow',x1:196,y1:56,x2:290,y2:56,label:'x_d[n]',tex:true},
  {t:'box',x:290,y:32,w:176,h:48,label:'H_d(e^{j\\Omega})',tex:true,fs:16},
  {t:'arrow',x1:466,y1:56,x2:560,y2:56,label:'y_d[n]',tex:true},
  {t:'box',x:560,y:32,w:92,h:48,label:'\\text{D/C}',tex:true,fs:16},
  {t:'arrow',x1:652,y1:56,x2:752,y2:56,label:'y_c(t)',tex:true},
  {t:'text',x:150,y:108,label:'T',tex:true,fs:15},
  {t:'text',x:606,y:108,label:'T',tex:true,fs:15}
]}), cap:'Discrete-time processing of a continuous-time signal: a C/D converter, a discrete-time system and a D/C converter, both converters working with the same period $T$.', short:'The discrete-time processing chain.'},
{t:'eq', tex:'x_d[n]=x_c(nT),\\qquad y_c(t)=\\sum_{n=-\\infty}^{\\infty}y_d[n]\\,\\operatorname{sinc}\\Bigl(\\frac{\\pi(t-nT)}{T}\\Bigr),\\qquad \\operatorname{sinc}(\\theta)=\\frac{\\sin\\theta}{\\theta}.'},
{t:'p', text:'The <b>C/D</b> (continuous-to-discrete) converter keeps the samples. The <b>D/C</b> converter rebuilds the band-limited signal through the output numbers, with the ideal filter of gain $T$ and cutoff $\\pi/T$ of Section 7.3, so that $y_c(nT)=y_d[n]$ at every sample. Only $H_d$ changes the spectrum; the converters sample and rebuild. If $y_d[n]=x_d[n]$ and the input is band-limited with $\\omega_s>2\\omega_M$, the chain returns $y_c(t)=x_c(t)$.'},

{t:'h3', text:'From radians per second to radians per sample'},
{t:'p', text:'Sample $n$ is taken at $t=nT$, so a continuous-time exponential $e^{j\\omega t}$ becomes $e^{j\\omega nT}=e^{j(\\omega T)n}$. Its discrete-time frequency is therefore'},
{t:'eqbox', cap:'Frequency map',
 tex:['\\underbrace{\\Omega}_{\\text{rad/sample}}=\\underbrace{\\omega}_{\\text{rad/s}}\\;\\underbrace{T}_{\\text{s/sample}}'],
 after:'$T$ is seconds per sample, so the units match. The sampling rate $\\omega_s=2\\pi/T$ lands on $\\Omega=\\omega_sT=2\\pi$, and $\\omega_s/2$ lands on $\\Omega=\\pi$. The band edge $\\omega_M$ lands on $\\Omega_M=\\omega_MT$. The copies stay apart while $\\Omega_M<\\pi$, that is $\\omega_MT<\\pi$, that is $\\omega_M<\\pi/T=\\omega_s/2$: the sampling theorem again.'},
{t:'p', text:'For the running signal, $\\omega_M=2\\pi$ rad/s, sampled with $T=0.2$ s, the band edge lands on $\\Omega_M=2\\pi\\times0.2=0.4\\pi$. With $T=0.25$ s it lands on $0.5\\pi$. With $T=0.6$ s it lands on $1.2\\pi>\\pi$, and the copies overlap.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const hM=WM*0.25;
   const a=ax2({xr:[-3*PI,3*PI],yr:[-0.2,1.8],xpi:PI,xlabel:'\\Omega\\;[\\text{rad/sample}]',ylabel:'T\\,X_d(e^{j\\Omega})',yticksOverride:[0,1]});
   for(let k=-2;k<=2;k++) a.curve(W=>{ const y=tri5(W,2*PI*k,hM); return y>0?y:NaN; },{color:KCOL(k),n:1800});
   period(a,1.35); return a.svg(); },
  cap:'The running signal sampled with $T=0.25$ s and drawn times $T$ against $\\Omega$: $\\Omega_M=0.5\\pi$, and a copy every $2\\pi$.', short:'The spectrum of the samples against $\\Omega$, $T=0.25$ s.'},
 {svg:()=>{ const hM=WM*0.6, ov=W=>{ let m=0; for(let k=-4;k<=4;k++) if(tri5(W,2*PI*k,hM)>1e-9) m++; return m>1; };
   const a=ax2({xr:[-3*PI,3*PI],yr:[-0.2,1.8],xpi:PI,xlabel:'\\Omega\\;[\\text{rad/sample}]',ylabel:'T\\,X_d(e^{j\\Omega})',yticksOverride:[0,1]});
   for(let k=-3;k<=3;k++) a.curve(W=>{ const y=tri5(W,2*PI*k,hM); return y>0&&!ov(W)?y:NaN; },{color:KCOL(k),n:1800});
   for(let k=-3;k<=3;k++) a.curve(W=>{ const y=tri5(W,2*PI*k,hM); return y>0&&ov(W)?y:NaN; },{color:KCOL(k),n:1800,width:1.2,dash:'4 4'});
   a.curve(W=>{ if(!ov(W)) return NaN; let s=0; for(let k=-4;k<=4;k++) s+=tri5(W,2*PI*k,hM); return s; },{color:C.err,n:2400,width:2.4});
   period(a,1.35); return a.svg(); },
  cap:'The same signal with $T=0.6$ s: $\\Omega_M=1.2\\pi>\\pi$, and neighbouring copies overlap, red.', short:'The spectrum of the samples against $\\Omega$, $T=0.6$ s.'}
]},

{t:'h3', text:'The spectrum of the samples'},
{t:'p', text:'The spectrum of the sequence $x_d[n]$ follows from the sampled spectrum of Section 7.1 by a change of variable. Step 1 writes both transforms as sums over the same samples. The impulse $\\delta(t-nT)$ has transform $\\int\\delta(t-nT)e^{-j\\omega t}\\,\\d t=e^{-j\\omega nT}$ by sifting, so the transform of $x_p(t)=\\sum_nx_c(nT)\\,\\delta(t-nT)$ is a sum of such terms. The second line is the definition of the transform of $x_d[n]=x_c(nT)$.'},
{t:'eq', tex:'\\begin{aligned}X_p(j\\omega)&=\\sum_{n=-\\infty}^{\\infty}x_c(nT)\\,e^{-j\\omega nT}\\\\X_d(e^{j\\Omega})&=\\sum_{n=-\\infty}^{\\infty}x_c(nT)\\,e^{-j\\Omega n}\\end{aligned}'},
{t:'p', text:'Step 2 compares them. The two sums are the same when $\\omega T=\\Omega$, that is $\\omega=\\Omega/T$. Then substitute the sampled spectrum and use $k\\omega_sT=2\\pi k$:'},
{t:'eqbox', cap:'The spectrum of the sequence of samples',
 tex:['\\begin{aligned}X_d(e^{j\\Omega})&=X_p\\Bigl(j\\frac{\\Omega}{T}\\Bigr)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X_c\\Bigl(j\\Bigl(\\frac{\\Omega}{T}-k\\omega_s\\Bigr)\\Bigr)\\\\&=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X_c\\Bigl(j\\,\\frac{\\Omega-2\\pi k}{T}\\Bigr)\\end{aligned}'],
 after:'The second line writes $\\frac{\\Omega}{T}-k\\omega_s=\\frac{\\Omega-k\\omega_sT}{T}=\\frac{\\Omega-2\\pi k}{T}$. The copy $k$ sits at $\\Omega=2\\pi k$ for every $T$; changing $T$ only stretches the drawing, because the time axis $t=nT$ has become the integer $n$. The result repeats every $2\\pi$ in $\\Omega$, as every discrete-time spectrum must.'},

{t:'h3', text:'The equivalent continuous-time system'},
{t:'p', text:'Follow a band-limited input with $X_c(j\\omega)=0$ for $|\\omega|\\ge\\omega_s/2$ through the chain. The D/C converter forms $\\sum_ny_d[n]\\,\\delta(t-nT)$, whose transform is $\\sum_ny_d[n]e^{-j\\omega nT}=Y_d(e^{j\\omega T})$ by Step 1, and multiplies by the filter of gain $T$ on $|\\omega|<\\omega_s/2$. Inside that band:'},
{t:'eq', tex:'\\begin{aligned}Y_c(j\\omega)&=T\\,Y_d(e^{j\\omega T})=T\\,H_d(e^{j\\omega T})\\,X_d(e^{j\\omega T})\\\\&=T\\,H_d(e^{j\\omega T})\\cdot\\frac{1}{T}\\,X_c(j\\omega)=H_d(e^{j\\omega T})\\,X_c(j\\omega).\\end{aligned}'},
{t:'p', text:'The second equality is the convolution property of the discrete-time system, $Y_d=H_dX_d$. The third uses the spectrum of the samples at $\\Omega=\\omega T$: for $|\\omega|<\\omega_s/2$ only the copy $k=0$ lies there, and it is $X_c(j\\omega)/T$. Outside the band the D/C filter gives zero.'},
{t:'eqbox', cap:'Key result: the equivalent system',
 tex:['H_{\\text{eff}}(j\\omega)=\\begin{cases}H_d\\bigl(e^{j\\omega T}\\bigr),&|\\omega|<\\omega_s/2\\\\0,&|\\omega|>\\omega_s/2\\end{cases}'],
 after:'This holds for every input with $X_c(j\\omega)=0$ at $|\\omega|\\ge\\omega_s/2$. For other inputs the chain is not even time-invariant: a short pulse may fall between two samples and vanish, while the same pulse shifted onto a sample instant does not. To design $H_d$ for a wanted $H_{\\text{eff}}$, read the key result backwards: $H_d(e^{j\\Omega})=H_{\\text{eff}}(j\\Omega/T)$ for $|\\Omega|<\\pi$, repeated every $2\\pi$.'},
{t:'p', text:'An example: the three-point average $y_d[n]=\\frac14x_d[n+1]+\\frac12x_d[n]+\\frac14x_d[n-1]$. A shift by one sample multiplies the transform by $e^{\\pm j\\Omega}$, so'},
{t:'eq', tex:'H_d(e^{j\\Omega})=\\frac14e^{j\\Omega}+\\frac12+\\frac14e^{-j\\Omega}=\\frac12+\\frac14\\bigl(e^{j\\Omega}+e^{-j\\Omega}\\bigr)=\\frac12+\\frac12\\cos\\Omega=\\frac12(1+\\cos\\Omega),'},
{t:'p', text:'using $e^{j\\Omega}+e^{-j\\Omega}=2\\cos\\Omega$. With $T=0.25$ s, $\\omega_s/2=\\pi/T=4\\pi$ rad/s and $H_{\\text{eff}}(j\\omega)=\\frac12\\bigl(1+\\cos(0.25\\,\\omega)\\bigr)$ for $|\\omega|<4\\pi$. At $\\omega=2\\pi$ it is $\\frac12(1+\\cos(\\pi/2))=\\frac12$. At $\\omega=6\\pi>4\\pi$ it is 0: the D/C converter removes it, although $H_d$ itself repeats there.'},
{t:'fig', svg:()=>{ const T=0.25, Hd=W=>0.5*(1+Math.cos(W));
  const a=ax({xr:[-3*PI,3*PI],yr:[-0.2,1.45],xticksOverride:[-3*PI,-2*PI,-PI,0,PI,2*PI,3*PI],xtickfmt:v=>P.piTick(v/T),
    xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H_{\\text{eff}}(j\\omega)|',yticksOverride:[0,0.5,1]});
  a.curve(W=>Math.abs(W)>=PI?Hd(W):NaN,{color:C.muted,n:1800,width:1.2,dash:'4 4'});
  a.curve(W=>Math.abs(W)<=PI?Hd(W):NaN,{color:C.h,n:900});
  a.poly([[-3*PI,0],[-PI,0]],{color:C.h}); a.poly([[PI,0],[3*PI,0]],{color:C.h});
  a.vline(-PI,{color:C.coral,opacity:.6}); a.vline(PI,{color:C.coral,opacity:.6});
  a.note(PI,1.2,'\\omega_s/2=4\\pi',{tex:true,anchor:'start',dx:6,color:C.coral,fs:12});
  return a.svg(); },
 cap:'The three-point average with $T=0.25$ s as a continuous-time system: $H_{\\text{eff}}(j\\omega)=\\frac12\\bigl(1+\\cos(\\omega T)\\bigr)$ for $|\\omega|<\\omega_s/2=4\\pi$ rad/s, amber, and zero beyond. The grey dashed curve is the periodic $H_d(e^{j\\omega T})$ that the D/C converter cuts off.', short:'The equivalent system of a three-point average.'},
{t:'ex', hd:'Example 7.13 — a digital cutoff in hertz', rows:[
 ['Given','A digital low-pass that keeps $|\\Omega|<\\Omega_c=\\pi/4$, run at $f_s=8$ kHz and then at $f_s=44.1$ kHz.'],
 ['Find','Its cutoff in rad/s and in hertz at each rate.'],
 ['Method','Read the key result backwards: the filter keeps $|\\omega T|<\\Omega_c$, so $\\omega_c=\\Omega_c/T=\\Omega_cf_s$ and $f_c=\\omega_c/2\\pi=\\Omega_cf_s/2\\pi$.'],
 ['Solution','At $f_s=8$ kHz: $$\\omega_c=\\frac{\\pi}{4}\\cdot8000=2000\\pi\\ \\text{rad/s},\\qquad f_c=\\frac{2000\\pi}{2\\pi}=1000\\ \\text{Hz}=1\\ \\text{kHz}.$$ At $f_s=44.1$ kHz: $f_c=\\frac{\\pi/4}{2\\pi}\\cdot44.1=\\frac{44.1}{8}=5.5125$ kHz. For $\\Omega_c=\\pi/4$ in general, $f_c=f_s/8$.'],
 ['Check','The cutoff must lie below $f_s/2$, because $\\Omega_c<\\pi$: $1<4$ kHz and $5.5125<22.05$ kHz. The filter stores only $\\Omega_c$; the sampling rate decides where it acts. A sound card that changes its rate moves every cutoff with it, so a digital filter is designed for the rate it runs at. For a filter that keeps $|\\Omega|<\\pi/2$ at $16$ kHz, $f_c=\\frac{\\pi/2}{2\\pi}\\cdot16=4$ kHz.']
]},

{t:'h3', text:'A digital differentiator'},
{t:'p', text:'The derivative $\\d x_c/\\d t$ has transform $j\\omega X_c(j\\omega)$. So a band-limited differentiator is'},
{t:'eq', tex:'H_{\\text{eff}}(j\\omega)=\\begin{cases}j\\omega,&|\\omega|<\\omega_s/2\\\\0,&|\\omega|>\\omega_s/2\\end{cases}\\qquad\\Longrightarrow\\qquad H_d(e^{j\\Omega})=H_{\\text{eff}}\\Bigl(j\\frac{\\Omega}{T}\\Bigr)=j\\,\\frac{\\Omega}{T},\\quad|\\Omega|<\\pi.'},
{t:'p', text:'Outside $|\\Omega|<\\pi$ the response repeats every $2\\pi$. Its magnitude is the ramp $|\\Omega|/T$, which reaches $\\pi/T$ at the band edge; with $T=0.25$ s that is $4\\pi$, and at $\\Omega=\\pi/2$ it is $(\\pi/2)/0.25=2\\pi$. Its phase is $+\\pi/2$ for $\\Omega>0$ and $-\\pi/2$ for $\\Omega<0$, and at $\\Omega=\\pi$ the response jumps from $j\\pi/T$ to $-j\\pi/T$.'},
{t:'ex', hd:'Example 7.14 — the differentiator on a tone', rows:[
 ['Given','The digital differentiator with $f_s=1$ kHz, and the input tone $x_c(t)=\\cos(2\\pi f_0t)$.'],
 ['Find','$y_c(t)$ for $f_0=100$ Hz, and its peak for $f_0=700$ Hz.'],
 ['Method','Write the sampled tone as two complex exponentials, multiply each by $H_d$ at its own frequency, and convert back with $\\Omega_0=\\omega_0T$.'],
 ['Solution','The samples are $x_d[n]=\\cos(\\Omega_0n)=\\frac12e^{j\\Omega_0n}+\\frac12e^{-j\\Omega_0n}$ with $\\Omega_0=\\omega_0T$. For $0<\\Omega_0<\\pi$, $H_d(e^{j\\Omega_0})=j\\Omega_0/T$ and $H_d(e^{-j\\Omega_0})=-j\\Omega_0/T$, so $$\\begin{aligned}y_d[n]&=\\frac12\\cdot\\frac{j\\Omega_0}{T}e^{j\\Omega_0n}-\\frac12\\cdot\\frac{j\\Omega_0}{T}e^{-j\\Omega_0n}=\\frac{\\Omega_0}{T}\\cdot j\\cdot\\frac{e^{j\\Omega_0n}-e^{-j\\Omega_0n}}{2}\\\\&=\\frac{\\Omega_0}{T}\\cdot j\\cdot j\\sin(\\Omega_0n)=-\\frac{\\Omega_0}{T}\\sin(\\Omega_0n)=-\\omega_0\\sin(\\omega_0nT).\\end{aligned}$$ The gain is $\\Omega_0/T=\\omega_0$ and the phase shift is $\\pi/2$, since $-\\sin\\theta=\\cos(\\theta+\\pi/2)$. The D/C converter returns $y_c(t)=-\\omega_0\\sin(\\omega_0t)=\\d x_c/\\d t$. At $f_0=100$ Hz, $\\Omega_0=2\\pi\\cdot100\\cdot0.001=0.2\\pi<\\pi$, and the output peaks at $\\omega_0=200\\pi\\approx628.3$ per second, that is $0.628$ per ms. At $f_0=700$ Hz, $\\Omega_0=1.4\\pi>\\pi$: the tone lies above $f_s/2=500$ Hz, so it folds first, to $f_s-f_0=300$ Hz, because $\\cos(1.4\\pi n)=\\cos(2\\pi n-0.6\\pi n)=\\cos(0.6\\pi n)$. The filter then differentiates the 300 Hz alias, and the output peaks at $2\\pi\\cdot300=600\\pi\\approx1885$ per second.'],
 ['Check','For $f_0=100$ Hz the output is the true derivative of the input. For $f_0=700$ Hz it is not: the true derivative would peak at $2\\pi\\cdot700$ per second at 700 Hz, while the chain gives a 300 Hz tone with a smaller peak. The equivalent system holds only for band-limited inputs.']
]},
{t:'figrow', n:2, items:[
 {svg:()=>{ const T=0.25, top=PI/T;
   const a=ax2({xr:[-3*PI,3*PI],yr:[-0.1*top,1.35*top],xpi:PI,xlabel:'\\Omega\\;[\\text{rad/sample}]',ylabel:'|H_d(e^{j\\Omega})|',yticksOverride:[0,2*PI,4*PI],ytickfmt:P.piTick});
   a.curve(W=>Math.abs(wrap(W))/T,{color:C.h,n:1800});
   period(a,1.2*top); return a.svg(); },
  cap:'The magnitude of the digital differentiator for $T=0.25$ s: a ramp to $\\pi/T=4\\pi$ at $\\Omega=\\pm\\pi$, repeated every $2\\pi$.', short:'The digital differentiator, $T=0.25$ s.'},
 {svg:()=>{ const w0=0.2*PI;
   const a=ax2({xr:[-0.2,10.2],yr:[-1.3,1.6],xlabel:'t\\;[\\text{ms}]',ylabel:'x_c(t),\\;y_c(t)',yticksOverride:[-1,0,1],xticksOverride:[0,2,4,6,8,10]});
   a.curve(t=>Math.cos(w0*t),{color:C.in,width:1.4,dash:'5 5',n:2000});
   a.curve(t=>-w0*Math.sin(w0*t),{color:C.out,width:2.4,n:2000});
   for(let n=0;n<=10;n++) a.point(n,-w0*Math.sin(w0*n),{color:C.out,r:4});
   return a.svg(); },
  cap:'A $100$ Hz tone, dashed, and the differentiator output at $f_s=1$ kHz, in units of per millisecond: $-0.2\\pi\\sin(0.2\\pi t)$ with $t$ in ms, peak $0.628$.', short:'The differentiator on a $100$ Hz tone.'}
]},

{t:'h3', text:'A half-sample delay'},
{t:'p', text:'A delay by $\\Delta$ multiplies the transform by $e^{-j\\omega\\Delta}$. A band-limited delay by half a sampling period, $\\Delta=T/2$, is therefore'},
{t:'eq', tex:'H_{\\text{eff}}(j\\omega)=e^{-j\\omega T/2},\\ |\\omega|<\\omega_s/2\\quad\\Longrightarrow\\quad H_d(e^{j\\Omega})=e^{-j\\frac{\\Omega}{T}\\cdot\\frac{T}{2}}=e^{-j\\Omega/2},\\ |\\Omega|<\\pi.'},
{t:'p', text:'Its gain is $|H_d|=1$, and its phase $-\\Omega/2$ is a straight line: every frequency is delayed by half a sample. The output is $y_d[n]=y_c(nT)=x_c(nT-T/2)$, the curve through the samples read half a step earlier. There is no formula $x_d[n-\\frac12]$: a sequence has no value at $n-\\frac12$. For example, with $T=1$ ms and $x_c(t)=\\cos(2\\pi\\cdot250\\,t)$, $t$ in seconds, $y_d[0]=x_c(-0.0005)=\\cos(-2\\pi\\cdot250\\cdot0.0005)=\\cos(-\\pi/4)\\approx0.707$.'},
{t:'p', text:'The impulse response is the inverse transform of $H_d$ over one period:'},
{t:'eqbox', cap:'The impulse response of the half-sample delay',
 tex:['\\begin{aligned}h[n]&=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}e^{-j\\Omega/2}\\,e^{j\\Omega n}\\,\\d\\Omega=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}e^{j\\Omega(n-\\frac12)}\\,\\d\\Omega=\\frac{1}{2\\pi}\\left[\\frac{e^{j\\Omega(n-\\frac12)}}{j(n-\\frac12)}\\right]_{-\\pi}^{\\pi}\\\\&=\\frac{1}{2\\pi}\\cdot\\frac{2j\\sin\\bigl(\\pi(n-\\frac12)\\bigr)}{j(n-\\frac12)}=\\frac{\\sin\\bigl(\\pi(n-\\frac12)\\bigr)}{\\pi(n-\\frac12)}=\\operatorname{sinc}\\Bigl(\\pi\\bigl(n-\\tfrac12\\bigr)\\Bigr)\\end{aligned}'],
 after:'The exponents combine as $-\\Omega/2+\\Omega n=\\Omega(n-\\frac12)$, and $n-\\frac12$ is never zero, so the antiderivative has no zero denominator. Evaluating at $\\pm\\pi$ uses $e^{j\\theta}-e^{-j\\theta}=2j\\sin\\theta$. Here $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, unnormalised. Since $\\sin\\bigl(\\pi(n-\\frac12)\\bigr)=(-1)^{n+1}$, $h[n]=(-1)^{n+1}/\\bigl(\\pi(n-\\frac12)\\bigr)$: it is never zero, and it decays only like $1/n$, so every input sample contributes to every output sample. The two central values are equal: $h[0]=\\frac{-1}{-\\pi/2}=\\frac{2}{\\pi}$ and $h[1]=\\frac{1}{\\pi/2}=\\frac{2}{\\pi}$.'},
{t:'p', text:'A second route gives the same $h[n]$. Feed the chain $x_c(t)=\\sin(\\pi t/T)/(\\pi t)$, whose transform is 1 on $|\\omega|<\\pi/T$ (Example 7.4 with $W=\\pi/T$). Its samples are $x_d[n]=\\sin(\\pi n)/(\\pi nT)=0$ for $n\\ne0$ and $x_d[0]=1/T$, so $x_d[n]=\\frac1T\\delta[n]$ and the output is $\\frac1Th[n]$. The output is also $x_c(nT-T/2)$, so $h[n]=T\\,x_c(nT-\\frac T2)=\\frac{\\sin(\\pi(n-\\frac12))}{\\pi(n-\\frac12)}$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const xh=t=>Math.sin(2*PI*0.15*t)+0.5*Math.cos(2*PI*0.32*t);
   const a=ax2({xr:[-0.6,8.6],yr:[-1.7,1.85],xlabel:'t\\;[\\text{ms}]',ylabel:'x_c(t),\\;y_c(t)',yticksOverride:[-1,0,1],xticksOverride:[0,2,4,6,8]});
   a.curve(xh,{color:C.in,width:1.4,dash:'5 5',n:1600});
   a.curve(t=>xh(t-0.5),{color:C.out,width:2,n:1600});
   a.stem(D(n=>xh(n),0,8),{color:C.mid,r:4});
   a.stem(D(n=>xh(n-0.5),0,8),{color:C.out,r:4});
   return a.svg(); },
  cap:'$x_c(t)=\\sin(2\\pi\\,0.15t)+0.5\\cos(2\\pi\\,0.32t)$ with $t$ in ms, sampled at $T=1$ ms, violet. The half-sample delay gives $y_d[n]=x_c(nT-T/2)$, green, the samples of the delayed curve.', short:'The half-sample delay in time.'},
 {svg:()=>{ const a=ax2({xr:[-5.6,6.6],yr:[-0.45,0.95],xlabel:'n',ylabel:'h[n]',yticksOverride:[-0.25,0,0.25,0.5],xticksOverride:[-4,-2,0,2,4,6]});
   a.curve(t=>sinc(PI*(t-0.5)),{color:C.mid,width:1.3,dash:'6 5',n:1600});
   a.stem(D(n=>sinc(PI*(n-0.5)),-5,6),{color:C.h,r:4.4});
   return a.svg(); },
  cap:'The impulse response $h[n]=\\operatorname{sinc}\\bigl(\\pi(n-\\frac12)\\bigr)$, with $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$: the kernel shifted by half a sample, dashed, read at the integers. Every $n$ carries a value.', short:'The impulse response of the half-sample delay.'}
]},

{t:'h3', text:'Quantization'},
{t:'p', text:'A real C/D converter with $B$ bits also rounds each sample to one of $2^{B}$ levels, so that the result $x_q[n]$ is a number the computer can store. Over the range $-1$ to $1$ the levels are a step $\\Delta$ apart:'},
{t:'eq', tex:'\\Delta=\\frac{2}{2^{B}},\\qquad e[n]=x_q[n]-x[n],\\qquad |e[n]|\\le\\frac{\\Delta}{2}.'},
{t:'p', text:'Each value goes to the level of its own step, and the level sits in the middle of the step, so no value is more than half a step from its level. One more bit halves $\\Delta$, and with it the largest error. With $B=4$, $\\Delta=2/16=1/8$ and $|e|\\le1/16$. Rounding is a second loss, besides aliasing: it cannot be undone, and no sampling rate removes it. Only more bits make it smaller.'},
{t:'p', text:'The size of the error is measured by its power. Take the error as spread evenly over $-\\Delta/2<e<\\Delta/2$, with density $1/\\Delta$. Its mean square is'},
{t:'eq', tex:'\\overline{e^{2}}=\\frac{1}{\\Delta}\\int_{-\\Delta/2}^{\\Delta/2}e^{2}\\,\\d e=\\frac{1}{\\Delta}\\Bigl[\\frac{e^{3}}{3}\\Bigr]_{-\\Delta/2}^{\\Delta/2}=\\frac{1}{\\Delta}\\cdot\\frac{1}{3}\\Bigl(\\frac{\\Delta^{3}}{8}+\\frac{\\Delta^{3}}{8}\\Bigr)=\\frac{\\Delta^{2}}{12}.'},
{t:'p', text:'A full-scale sine $\\sin(\\omega_0t)$ has power $\\frac12$, the mean of $\\sin^{2}$. With $\\Delta^{2}=4/2^{2B}$ the signal-to-noise ratio in decibels is'},
{t:'eqbox', cap:'About six decibels per bit',
 tex:['\\begin{aligned}\\text{SNR}&=10\\log_{10}\\frac{1/2}{\\Delta^{2}/12}=10\\log_{10}\\frac{6}{\\Delta^{2}}=10\\log_{10}\\frac{6\\cdot2^{2B}}{4}=10\\log_{10}\\bigl(1.5\\cdot2^{2B}\\bigr)\\\\&=10\\log_{10}1.5+2B\\cdot10\\log_{10}2\\approx1.76+6.02\\,B\\ \\text{dB}\\end{aligned}'],
 after:'The last line uses $\\log(ab)=\\log a+\\log b$ and $\\log(2^{2B})=2B\\log2$, with $10\\log_{10}1.5\\approx1.76$ and $20\\log_{10}2\\approx6.02$. Each extra bit adds about 6 dB, so going from 12 to 14 bits adds about $2\\times6.02\\approx12$ dB. The rule gives $19.8$ dB at 3 bits, $49.9$ dB at 8 and $98.1$ dB at 16, the CD format; the ratio measured on a sampled full-scale sine lies within 1 dB of the rule from 3 bits up.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const B=3, L=8, Dl=2/L, Q=x=>Math.max(-1+Dl/2,Math.min(1-Dl/2,Dl*(Math.floor(x/Dl)+0.5))), x=t=>Math.sin(2*PI*t);
   const a=ax2({xr:[-0.02,1.02],yr:[-1.25,1.45],pad:{l:74,r:22,t:26,b:34},xlabel:'t\\;[\\text{ms}]',ylabel:'x(t),\\;x_q[n]',yticksOverride:[-1,0,1],xticksOverride:[0,0.25,0.5,0.75,1]});
   for(let i=0;i<L;i++) a.hline(-1+Dl*(i+0.5),{color:C.muted,opacity:.4});
   a.curve(x,{color:C.in,width:1.4,dash:'5 5',n:1600});
   a.curve(t=>Q(x(t)),{color:C.out,width:2,n:3200});
   for(let n=0;n<=16;n++) a.point(n/16,Q(x(n/16)),{color:C.mid,r:4});
   return a.svg(); },
  cap:'A full-scale $1$ kHz sine, $t$ in ms, sampled 16 times a cycle and rounded with $B=3$ bits: $8$ levels, $\\Delta=0.25$, dotted lines.', short:'Quantization of a sine with $3$ bits.'},
 {svg:()=>{ const a=ax2({xr:[0,17],yr:[0,112],xlabel:'B\\;[\\text{bits}]',ylabel:'\\text{SNR}\\;[\\text{dB}]',yticksOverride:[0,20,40,60,80,100],xticksOverride:[1,4,8,12,16]});
   a.curve(B=>6.02*B+1.76,{color:C.mid,width:2,n:200});
   for(const B of [3,8,16]) a.point(B,6.02*B+1.76,{color:C.out,r:5});
   return a.svg(); },
  cap:'The rule $\\text{SNR}\\approx6.02B+1.76$ dB, with the three cases $B=3$, $8$ and $16$ marked.', short:'Signal-to-noise ratio against the number of bits.'}
]},

/* ================================================================ 7.6 */
{t:'h2', num:'7.6', text:'Decimation and interpolation'},
{t:'p', text:'A sequence can be sampled too: keep every $N$-th value and set the others to zero. This section derives what that does to the spectrum, and then uses it to lower the rate of a sequence (<b>decimation</b>) and to raise it (<b>interpolation</b>). Every spectrum here is a discrete-time transform, so the frequency variable is $\\omega$ in rad/sample, as in Chapter 6, and every spectrum repeats every $2\\pi$.'},
{t:'p', text:'The running sequence of this section is $x[n]=\\bigl(\\sin(\\pi n/8)/(\\pi n/8)\\bigr)^{2}$, with $x[0]=1$. Write it as $x[n]=64\\,g[n]^{2}$ with $g[n]=\\sin(Wn)/(\\pi n)$ and $W=\\pi/8$, because $\\sin(\\pi n/8)/(\\pi n/8)=8\\sin(Wn)/(\\pi n)$. The transform of $g$ is 1 on $|\\omega|\\le W$ and 0 on $W<|\\omega|\\le\\pi$ (Chapter 6). Squaring in time is a periodic convolution divided by $2\\pi$, and the convolution of that rectangle with itself is the triangle $2W-|\\omega|$ on $|\\omega|\\le2W$, as in Example 7.5. So'},
{t:'eq', tex:'X(e^{j\\omega})=64\\cdot\\frac{1}{2\\pi}\\bigl(2W-|\\omega|\\bigr)=\\frac{32}{\\pi}\\Bigl(\\frac{\\pi}{4}-|\\omega|\\Bigr),\\qquad|\\omega|\\le\\frac{\\pi}{4},'},
{t:'p', text:'a triangle of peak $\\frac{32}{\\pi}\\cdot\\frac{\\pi}{4}=8$ that reaches zero at $\\omega_M=\\pi/4$, repeated every $2\\pi$.'},

{t:'h3', text:'Sampling a sequence'},
{t:'eqbox', cap:'Sampling a sequence',
 tex:['p[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-kN],\\qquad x_p[n]=x[n]\\,p[n]',
      'x_p[n]=\\sum_{k=-\\infty}^{\\infty}x[n]\\,\\delta[n-kN]=\\sum_{k=-\\infty}^{\\infty}x[kN]\\,\\delta[n-kN]=\\begin{cases}x[n],&n=kN\\\\0,&\\text{otherwise}\\end{cases}'],
 after:'The sampler multiplies $x[n]$ by a unit sample every $N$ samples; the integer $N$ is the sampling period. The second step uses $x[n]\\,\\delta[n-kN]=x[kN]\\,\\delta[n-kN]$, because $\\delta[n-kN]$ is zero except at $n=kN$. For example, with $x[n]=(0.5)^{|n|}$ and $N=3$, $x_p[4]=0$, because 4 is not a multiple of 3.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-12.6,12.6],yr:[-0.15,1.3],xlabel:'n',ylabel:'x[n]',yticksOverride:[0,0.5,1],xticksOverride:[-12,-6,0,6,12]});
   a.stem(D(x6,-12,12),{color:C.in,r:3.6}); return a.svg(); },
  cap:'The running sequence $x[n]=\\bigl(\\sin(\\pi n/8)/(\\pi n/8)\\bigr)^{2}$.', short:'The running sequence of Section 7.6.'},
 {svg:()=>{ const a=ax2({xr:[-12.6,12.6],yr:[-0.15,1.3],xlabel:'n',ylabel:'x_p[n]',yticksOverride:[0,0.5,1],xticksOverride:[-12,-6,0,6,12]});
   a.stem(D(n=>(((n%3)+3)%3===0)?x6(n):0,-12,12),{color:C.mid,r:3.6}); return a.svg(); },
  cap:'The sampled sequence $x_p[n]$ with $N=3$: every third value is kept and the others are zero.', short:'The sampled sequence, $N=3$.'}
]},

{t:'h3', text:'The spectrum of a sampled sequence'},
{t:'p', text:'The derivation follows the continuous-time one of Section 7.1. Step 1 finds the transform of $p[n]$. It is periodic with period $N$, so it has a discrete-time Fourier series with coefficients'},
{t:'eq', tex:'a_k=\\frac{1}{N}\\sum_{n=0}^{N-1}p[n]\\,e^{-jk(2\\pi/N)n}=\\frac{1}{N}\\,\\bigl(1\\cdot e^{0}\\bigr)=\\frac{1}{N},'},
{t:'p', text:'since in one period $0\\le n\\le N-1$ only $p[0]=1$ is non-zero. A periodic sequence has impulses of weight $2\\pi a_k$ at $\\omega=2\\pi k/N$ (Chapter 6), so'},
{t:'eqbox', cap:'Step 1: the sampling sequence',
 tex:['P(e^{j\\omega})=\\sum_{k=-\\infty}^{\\infty}2\\pi\\cdot\\frac{1}{N}\\,\\delta\\Bigl(\\omega-\\frac{2\\pi k}{N}\\Bigr)=\\frac{2\\pi}{N}\\sum_{k=-\\infty}^{\\infty}\\delta(\\omega-k\\omega_s),\\qquad\\omega_s=\\frac{2\\pi}{N}'],
 after:'One period of $2\\pi$ holds the $N$ impulses $k=0,1,\\dots,N-1$, each of weight $2\\pi/N$; with $N=4$ that is four impulses of weight $\\pi/2$. Here $\\omega_s=2\\pi/N$ is the sampling frequency of the sequence, in rad/sample.'},
{t:'p', text:'Step 2 is the multiplication property of Chapter 6: a product in time is a periodic convolution over one period, divided by $2\\pi$. Step 3 substitutes $P$ and sifts. Over $0\\le\\theta<2\\pi$ the impulses of $P$ are those with $k=0,\\dots,N-1$:'},
{t:'eq', tex:'\\begin{aligned}X_p(e^{j\\omega})&=\\frac{1}{2\\pi}\\int_{0}^{2\\pi}P(e^{j\\theta})\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta=\\frac{1}{2\\pi}\\cdot\\frac{2\\pi}{N}\\sum_{k=0}^{N-1}\\int_{0}^{2\\pi}\\delta(\\theta-k\\omega_s)\\,X\\bigl(e^{j(\\omega-\\theta)}\\bigr)\\,\\d\\theta\\\\&=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-k\\omega_s)}\\bigr).\\end{aligned}'},
{t:'eqbox', cap:'Key result: the spectrum of a sampled sequence',
 tex:['X_p(e^{j\\omega})=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-2\\pi k/N)}\\bigr)'],
 after:'$N$ copies of $X(e^{j\\omega})$ in each period, spaced $2\\pi/N$ apart and scaled by $1/N$. Each copy reaches $\\omega_M$ on either side of its centre, so neighbours stay apart when $2\\pi/N>2\\omega_M$, that is'},
{t:'eq', tex:'\\omega_s>2\\omega_M\\quad\\Longleftrightarrow\\quad\\frac{2\\pi}{N}>2\\omega_M\\quad\\Longleftrightarrow\\quad\\omega_M<\\frac{\\pi}{N}.'},
{t:'p', text:'For the running sequence, $\\omega_M=\\pi/4$: with $N=3$, $\\pi/4<\\pi/3$ and the copies stand apart; with $N=4$, $\\pi/4=\\pi/4$ and they just touch; from $N=5$ on they overlap. A sequence with $X(e^{j\\omega})=0$ for $2\\pi/7\\le|\\omega|\\le\\pi$ needs $2\\pi/7<\\pi/N$, that is $N<3.5$, so the largest $N$ with no aliasing is 3.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const N=3, h=8/N;
   const a=ax2({xr:[-3.2*PI,3.2*PI],yr:[-0.3,4.4],xpi:PI,xlabel:'\\omega',ylabel:'X_p(e^{j\\omega})',yticksOverride:[0,8/3],ytickfmt:v=>v<1e-9?'0':'8/3'});
   for(let k=0;k<N;k++) a.curve(w=>tri6(w,2*PI*k/N,W6,h),{color:k?C.mid:C.in,n:2400});
   period(a,3.6); return a.svg(); },
  cap:'The sampled spectrum of the running sequence with $N=3$: copies of height $8/3$, spaced $2\\pi/3$ apart, that stand clear.', short:'The spectrum of the sampled sequence, $N=3$.'},
 {svg:()=>{ const N=5, h=8/N, n0=w=>{ let c=0; for(let k=0;k<N;k++) if(tri60(w,2*PI*k/N,W6,h)>1e-12) c++; return c; },
     sum=w=>{ let v=0; for(let k=0;k<N;k++) v+=tri60(w,2*PI*k/N,W6,h); return v; };
   const a=ax2({xr:[-3.2*PI,3.2*PI],yr:[-0.3,4.4],xpi:PI,xlabel:'\\omega',ylabel:'X_p(e^{j\\omega})',yticksOverride:[0,8/5],ytickfmt:v=>v<1e-9?'0':'8/5'});
   a.area(w=>n0(w)>=2?sum(w):0,-3.2*PI,3.2*PI,{color:wash(C.err,.22),n:1600});
   for(let k=0;k<N;k++) a.curve(w=>tri6(w,2*PI*k/N,W6,h),{color:k?C.mid:C.in,n:2400,width:1.5});
   a.curve(w=>n0(w)>=2?sum(w):NaN,{color:C.err,n:2400,width:2.4});
   period(a,3.6); return a.svg(); },
  cap:'The same with $N=5$: the copies, $2\\pi/5$ apart, overlap because $\\pi/4>\\pi/5$. Their sum is red.', short:'The spectrum of the sampled sequence, $N=5$.'}
]},

{t:'h3', text:'Recovering the sequence'},
{t:'p', text:'Without aliasing, an ideal discrete-time low-pass filter recovers $x[n]$ from $x_p[n]$. It keeps the copy at $\\omega=0$ and removes the others, and its gain $N$ undoes the factor $1/N$:'},
{t:'eq', tex:'H(e^{j\\omega})=\\begin{cases}N,&|\\omega|<\\omega_c\\\\0,&\\omega_c<|\\omega|\\le\\pi\\end{cases},\\qquad\\omega_M<\\omega_c<\\omega_s-\\omega_M,\\qquad X_r(e^{j\\omega})=N\\cdot\\frac1N\\,X(e^{j\\omega})=X(e^{j\\omega}).'},
{t:'p', text:'Like every discrete-time frequency response, $H$ repeats every $2\\pi$. With no aliasing, $\\omega_c=\\pi/N=\\omega_s/2$ always lies in the range. For the running sequence with $N=2$ the range is $\\pi/4<\\omega_c<\\pi-\\pi/4=3\\pi/4$, so $\\omega_c=\\pi/2$ recovers it.'},

{t:'h3', text:'Decimation'},
{t:'p', text:'The zeros of $x_p[n]$ carry nothing, so storing them wastes memory. <b>Decimation</b> by $N$ keeps every $N$-th value and closes the gaps:'},
{t:'eq', tex:'x_b[n]=x_p[nN]=x[nN].'},
{t:'p', text:'For example, $x[n]=n$ for $0\\le n\\le11$ and $N=4$ give $x_b[2]=x[2\\cdot4]=x[8]=8$. If $x[n]$ holds samples of $x(t)$ taken every $T$, then $x_b[n]$ holds samples taken every $NT$: the sampling rate falls by the factor $N$, which is why decimation is also called <b>downsampling</b>. Its spectrum follows from the definition and one change of index.'},
{t:'eq', tex:'\\begin{aligned}X_b(e^{j\\omega})&=\\sum_{k=-\\infty}^{\\infty}x_b[k]\\,e^{-j\\omega k}=\\sum_{k=-\\infty}^{\\infty}x_p[kN]\\,e^{-j(\\omega/N)kN}\\\\&=\\sum_{n=-\\infty}^{\\infty}x_p[n]\\,e^{-j(\\omega/N)n}=X_p\\bigl(e^{j\\omega/N}\\bigr).\\end{aligned}'},
{t:'p', text:'The first line puts $x_b[k]=x_p[kN]$ into the definition and writes $\\omega k=(\\omega/N)(kN)$. The second line sets $n=kN$; the terms of $x_p[n]$ with $n$ not a multiple of $N$ are zero, so adding them changes nothing, and the sum is over all $n$.'},
{t:'eqbox', cap:'Decimation stretches the spectrum',
 tex:['X_b(e^{j\\omega})=X_p\\bigl(e^{j\\omega/N}\\bigr)=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-2\\pi k)/N}\\bigr)'],
 after:'The frequency axis of $X_p$ is stretched by $N$. A band edge $\\omega_M$ moves to $N\\omega_M$, and the copies at $2\\pi k/N$ move out to $2\\pi k$, so the period stays $2\\pi$. For the running sequence with $N=3$ the band widens from $\\pi/4$ to $3\\pi/4$; with $N=2$ it widens to $\\pi/2$.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-4.6,4.6],yr:[-0.15,1.3],xlabel:'n',ylabel:'x_b[n]',yticksOverride:[0,0.5,1],xticksOverride:[-4,-2,0,2,4]});
   a.stem(D(n=>x6(3*n),-4,4),{color:C.out,r:4}); return a.svg(); },
  cap:'The running sequence decimated by $N=3$: $x_b[n]=x[3n]$.', short:'The decimated sequence, $N=3$.'},
 {svg:()=>{ const N=3, h=8/N;
   const a=ax2({xr:[-3.2*PI,3.2*PI],yr:[-0.3,4.4],xpi:PI,xlabel:'\\omega',ylabel:'X_b(e^{j\\omega})',yticksOverride:[0,8/3],ytickfmt:v=>v<1e-9?'0':'8/3'});
   a.curve(w=>tri6(w/N,0,W6,h),{color:C.out,n:2400});
   for(const m of [-1,1]) a.curve(w=>{ const u=w-2*PI*m; return Math.abs(u)<3*W6?h*(1-Math.abs(u)/(3*W6)):NaN; },{color:C.mid,n:2400});
   period(a,3.6); return a.svg(); },
  cap:'Its spectrum: the triangle of the running sequence stretched by 3, now reaching $3\\pi/4$, with its copies at every multiple of $2\\pi$.', short:'The spectrum of the decimated sequence, $N=3$.'}
]},

{t:'h3', text:'Filter before you decimate'},
{t:'p', text:'Decimation stretches the band edge to $N\\omega_M$. If $N\\omega_M>\\pi$, the stretched copies overlap, and that is aliasing. So a sequence is low-pass filtered to $|\\omega|<\\pi/N$ before it is decimated:'},
{t:'eq', tex:'x[n]\\to\\boxed{H_d(e^{j\\omega})}\\to\\boxed{\\downarrow N}\\to x_b[n],\\qquad H_d(e^{j\\omega})=\\begin{cases}1,&|\\omega|<\\pi/N\\\\0,&\\pi/N<|\\omega|\\le\\pi.\\end{cases}'},
{t:'p', text:'After the filter the band edge is at most $\\pi/N$, so the stretch by $N$ keeps it inside $|\\omega|\\le\\pi$. The filter comes first; after the decimator no filter can separate a folded tone from wanted content.'},
{t:'ex', hd:'Example 7.15 — decimating two tones', rows:[
 ['Given','Tones of 500 Hz and 3 kHz sampled at 8 kHz: $x[n]=\\cos(\\pi n/8)+\\cos(3\\pi n/4)$.'],
 ['Find','What decimation by $N=2$ gives with and without the prefilter, and which tone keeps its pitch when $N=4$ with no filter.'],
 ['Method','Map each tone to rad/sample with $\\omega=2\\pi f/f_s$, multiply by $N$, and bring the result into $-\\pi<\\omega\\le\\pi$ by adding a multiple of $2\\pi$. Convert back to hertz at the new rate $f_s/N$.'],
 ['Solution','The tones sit at $\\omega_1=2\\pi\\cdot500/8000=\\pi/8$ and $\\omega_2=2\\pi\\cdot3000/8000=3\\pi/4$. With $N=2$ and no filter they move to $2\\cdot\\pi/8=\\pi/4$ and $2\\cdot3\\pi/4=3\\pi/2$. The second is outside $|\\omega|\\le\\pi$; subtract $2\\pi$: $3\\pi/2-2\\pi=-\\pi/2$. At the new rate $8/2=4$ kHz, $\\pi/4$ is $\\frac{\\pi/4}{2\\pi}\\cdot4000=500$ Hz and $\\pm\\pi/2$ is $\\frac{\\pi/2}{2\\pi}\\cdot4000=1000$ Hz. So the 3 kHz tone is heard at 1 kHz. With the prefilter, $|\\omega|<\\pi/2$ keeps $\\pi/8$ and removes $3\\pi/4>\\pi/2$, and only the 500 Hz tone remains. With $N=4$ and no filter the new rate is 2 kHz: $4\\cdot\\pi/8=\\pi/2<\\pi$, so 500 Hz keeps its pitch, while $4\\cdot3\\pi/4=3\\pi$, which is $3\\pi-2\\pi=\\pi$, that is 1 kHz.'],
 ['Check','In hertz, the fold rule of Section 7.4 at the new rate gives the same answers: at 4 kHz, $|3-4|=1$ kHz; at 2 kHz, $|3-2|=1$ kHz, while $500<1000$ Hz $=f_s/2$ stays where it is.']
]},

{t:'h3', text:'Interpolation'},
{t:'p', text:'<b>Interpolation</b> by $N$ raises the rate. Step 1 inserts $N-1$ zeros between neighbouring samples; with $N=4$ that is three zeros in each gap:'},
{t:'eq', tex:'x_{(N)}[n]=\\begin{cases}x_b[n/N],&n=0,\\pm N,\\pm2N,\\dots\\\\0,&\\text{otherwise.}\\end{cases}'},
{t:'p', text:'This is the time expansion of Chapter 6. Only the terms $n=kN$ are non-zero, so its transform is'},
{t:'eq', tex:'X_{(N)}(e^{j\\omega})=\\sum_{n}x_{(N)}[n]\\,e^{-j\\omega n}=\\sum_{k}x_b[k]\\,e^{-j\\omega kN}=\\sum_{k}x_b[k]\\,e^{-j(N\\omega)k}=X_b\\bigl(e^{jN\\omega}\\bigr).'},
{t:'p', text:'The axis is compressed by $N$, so the spectrum repeats every $2\\pi/N$. One period of $2\\pi$ now holds $N$ copies: the wanted one at $\\omega=0$ and $N-1$ <b>images</b> centred at $2\\pi k/N$, $k=1,\\dots,N-1$. Step 2 removes the images with a low-pass filter:'},
{t:'eq', tex:'y[n]=\\bigl(x_{(N)}*h\\bigr)[n],\\qquad H(e^{j\\omega})=\\begin{cases}N,&|\\omega|<\\pi/N\\\\0,&\\pi/N<|\\omega|\\le\\pi.\\end{cases}'},
{t:'p', text:'The gain $N$ keeps the old samples at their values. The impulse response of the filter is'},
{t:'eq', tex:'\\begin{aligned}h[n]&=\\frac{1}{2\\pi}\\int_{-\\pi/N}^{\\pi/N}N\\,e^{j\\omega n}\\,\\d\\omega=\\frac{N}{2\\pi}\\left[\\frac{e^{j\\omega n}}{jn}\\right]_{-\\pi/N}^{\\pi/N}=\\frac{N}{2\\pi}\\cdot\\frac{2j\\sin(\\pi n/N)}{jn}\\\\&=\\frac{\\sin(\\pi n/N)}{\\pi n/N}=\\operatorname{sinc}\\Bigl(\\frac{\\pi n}{N}\\Bigr),\\qquad\\operatorname{sinc}(\\theta)=\\frac{\\sin\\theta}{\\theta},\\end{aligned}'},
{t:'p', text:'with $h[0]=\\frac{1}{2\\pi}\\cdot N\\cdot\\frac{2\\pi}{N}=1$ from the integral directly. At the other multiples of $N$, $h[mN]=\\sin(\\pi m)/(\\pi m)=0$. So at $n=kN$ only the term $i=k$ of the convolution survives: $y[kN]=\\sum_ix_b[i]\\,h[(k-i)N]=x_b[k]$. The kept samples do not move; the filter only fills the zeros.'},
{t:'figrow', n:2, items:[
 {svg:()=>{ const a=ax2({xr:[-18.6,18.6],yr:[-0.15,1.3],xlabel:'n',ylabel:'x_{(3)}[n],\\;y[n]',yticksOverride:[0,0.5,1],xticksOverride:[-18,-12,-6,0,6,12,18]});
   a.stem(D(n=>(((n%3)+3)%3===0)?NaN:x6(n/3),-18,18).filter(p=>isFinite(p[1])),{color:C.out,r:3});
   a.stem(D(n=>x6(n),-6,6).map(([n,v])=>[3*n,v]),{color:C.mid,r:4.2});
   return a.svg(); },
  cap:'Interpolation by $N=3$ of the running sequence: the kept samples, violet, at $n=3k$, and the values the low-pass puts into the zeros, green.', short:'Interpolation by $N=3$ in time.'},
 {svg:()=>{ const a=ax2({xr:[-3.2*PI,3.2*PI],yr:[-0.2,1.35],xpi:PI,xlabel:'\\omega',ylabel:'X_{(2)}(e^{j\\omega})',yticksOverride:[]});
   for(let m=-5;m<=5;m++) for(const sg of [1,-1]){ const p=(sg*PI/4+2*PI*m)/2; if(Math.abs(p)>3.2*PI) continue;
     a.impulse(p,0.9,{color:Math.abs(m)%2===1?C.err:C.in,label:false}); }
   for(let m=-1;m<=1;m++) a.rect(Math.max(-3.2*PI,2*PI*m-PI/2),0,Math.min(3.2*PI,2*PI*m+PI/2),1.1,{stroke:C.h,dash:'6 4',width:1.5});
   return a.svg(); },
  cap:'$x_b[n]=\\cos(\\pi n/4)$ with one zero inserted after every sample, $N=2$: the wanted lines at $\\pm\\pi/8$, cyan, and the images at $\\pm7\\pi/8$, red, in every period. The low-pass, dashed, keeps $|\\omega|<\\pi/2$.', short:'Images of a tone after inserting zeros.'}
]},
{t:'ex', hd:'Example 7.16 — the images of a tone', rows:[
 ['Given','A 500 Hz tone sampled at 4 kHz, $x_b[n]=\\cos(\\pi n/4)$, interpolated by $N=2$ to 8 kHz.'],
 ['Find','Where the images lie, what they sound like without the filter, and how many copies a period holds when $N=4$.'],
 ['Method','Use $X_{(N)}(e^{j\\omega})=X_b(e^{jN\\omega})$: a line of $X_b$ at $\\omega_0+2\\pi m$ moves to $(\\omega_0+2\\pi m)/N$.'],
 ['Solution','$X_b$ has lines at $\\pm\\pi/4+2\\pi m$. With $N=2$ they move to $(\\pm\\pi/4+2\\pi m)/2=\\pm\\pi/8+\\pi m$. For even $m$ these are $\\pm\\pi/8$ plus multiples of $2\\pi$, the wanted tone: at 8 kHz, $\\frac{\\pi/8}{2\\pi}\\cdot8000=500$ Hz. For odd $m$ they are the images; in $-\\pi<\\omega\\le\\pi$, $m=1$ gives $-\\pi/8+\\pi=7\\pi/8$ and $m=-1$ gives $\\pi/8-\\pi=-7\\pi/8$. At 8 kHz, $\\frac{7\\pi/8}{2\\pi}\\cdot8000=3500$ Hz, so without the filter the images sound as a 3.5 kHz whistle. The low-pass of gain 2 and cutoff $\\pi/2$ removes them. With $N=4$ the spectrum repeats every $2\\pi/4$, so one period of $2\\pi$ holds the wanted copy and 3 images: 4 copies in all.'],
 ['Check','$7\\pi/8+\\pi/8=\\pi$: each image is the mirror of the tone about $\\pi/2$, the new $f_s/4$. In hertz, $3500+500=4000$ Hz, the old sampling rate, as for the copies of a sampled tone at $f_s\\pm f_0$.']
]},

{t:'h3', text:'A rate change by $L/M$'},
{t:'p', text:'To change the rate by a rational factor $L/M$, go up by $L$, filter once, and go down by $M$:'},
{t:'eq', tex:'x[n]\\to\\boxed{\\uparrow L}\\to\\boxed{H,\\ \\text{gain }L,\\ \\omega_c=\\min\\bigl(\\tfrac{\\pi}{L},\\tfrac{\\pi}{M}\\bigr)}\\to\\boxed{\\downarrow M}\\to y[m].'},
{t:'p', text:'One filter does both jobs. The interpolator needs a cutoff of $\\pi/L$ to remove the images of $\\uparrow L$, and the decimator needs a cutoff of $\\pi/M$ to prevent the aliasing of $\\downarrow M$. Both run at the same high rate, so one low-pass with the smaller of the two cutoffs meets both conditions.'},
{t:'ex', hd:'Example 7.17 — from 48 kHz to 44.1 kHz', rows:[
 ['Given','A recording at 48 kHz that must be converted to 44.1 kHz.'],
 ['Find','$L$, $M$, the rate at which the filter runs, and its cutoff.'],
 ['Method','Write the ratio of the rates in lowest terms, with the greatest common divisor from the prime factorisations.'],
 ['Solution','$44100=2^{2}\\cdot3^{2}\\cdot5^{2}\\cdot7^{2}$ and $48000=2^{7}\\cdot3\\cdot5^{3}$. The common factors are $2^{2}\\cdot3\\cdot5^{2}=300$, so $$\\frac{44100}{48000}=\\frac{44100/300}{48000/300}=\\frac{147}{160}\\quad\\Longrightarrow\\quad L=147,\\ M=160.$$ The filter runs at $48\\cdot147=7056$ kHz, with gain $147$ and cutoff $\\min(\\pi/147,\\pi/160)=\\pi/160$.'],
 ['Check','$48\\cdot\\frac{147}{160}=\\frac{7056}{160}=44.1$ kHz. The reverse conversion, from 44.1 kHz to 48 kHz, raises the rate by $48000/44100=160/147$: up by 160, down by 147.']
]},
{t:'fig', svg:()=>{ const a=ax({xr:[-0.4,10.4],yr:[-1.3,1.55],xlabel:'t/T',ylabel:'x[n],\\;y[m]',yticksOverride:[-1,0,1],xticksOverride:[0,2,4,6,8,10]});
  a.curve(t=>Math.cos(PI*t/5),{color:C.in,width:1.2,dash:'5 5',n:800});
  for(let i=0;i<=30;i++){ if(i%3===0) continue; a.stem([[i/3,Math.cos(PI*i/15)]],{color:i%2===0?C.out:C.muted,r:3}); }
  for(let i=0;i<=30;i+=3) a.stem([[i/3,Math.cos(PI*i/15)]],{color:i%2===0?C.out:C.mid,r:4.2});
  return a.svg(); },
 cap:'A rate change by $L/M=3/2$ for $x[n]=\\cos(\\pi n/5)$, time in units of the old spacing $T$. Violet: the old samples. Up by 3 and the filter put values between them; down by 2 keeps every second one. The output $y[m]$, green, has 3 samples in every 2 units of time.', short:'A rate change by $L/M=3/2$.'},

/* ================================================================ 7.7 */
{t:'h2', num:'7.7', text:'Summary'},
{t:'p', text:'The three tables collect the results of the chapter. The first two are in continuous time, with $\\omega$ in rad/s; the third mixes the two, with $\\Omega$ or $\\omega$ in rad/sample for sequences as in Sections 7.5 and 7.6.'},
{t:'table', cap:'Sampling and the sampling theorem.', head:['Result','Statement'],
 rows:[
  ['Sampler','$x_p(t)=x(t)\\sum_n\\delta(t-nT)=\\sum_nx(nT)\\,\\delta(t-nT)$'],
  ['Rates','$\\omega_s=2\\pi/T$ in rad/s, $f_s=1/T$ in Hz, $\\omega_s=2\\pi f_s$'],
  ['Sampled spectrum','$X_p(j\\omega)=\\frac{1}{T}\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$, at every rate'],
  ['Guard band','$\\omega_s-2\\omega_M$: positive, zero at the Nyquist rate, negative when the copies overlap'],
  ['Sampling theorem','$X(j\\omega)=0$ for $|\\omega|>\\omega_M$ and $\\omega_s>2\\omega_M$: the samples $x(nT)$ determine $x(t)$'],
  ['Nyquist rate','$2\\omega_M$ rad/s; the rate must be strictly above it'],
  ['Band-pass sampling','$2\\omega_H/n\\le\\omega_s\\le2\\omega_L/(n-1)$, $n\\le\\omega_H/B$']
 ]},
{t:'table', cap:'Reconstruction and aliasing.', head:['Result','Statement'],
 rows:[
  ['Ideal filter','$H_r(j\\omega)=T$ for $|\\omega|<\\omega_c$, $0$ for $|\\omega|>\\omega_c$, with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$'],
  ['Interpolation','$x_r(t)=\\sum_nx(nT)\\,\\frac{T\\sin(\\omega_c(t-nT))}{\\pi(t-nT)}$; with $\\omega_c=\\pi/T$ the kernel is $\\operatorname{sinc}(\\pi t/T)$'],
  ['Zero-order hold','$H_0(j\\omega)=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}$, with $H_0(j0)=T$'],
  ['First-order hold','$H_1(j\\omega)=\\frac{1}{T}\\bigl[\\frac{\\sin(\\omega T/2)}{\\omega/2}\\bigr]^{2}$, with $H_1(j0)=T$'],
  ['Alias of a cosine','$\\frac{\\omega_s}{2}<\\omega_0<\\omega_s$, $\\omega_c=\\frac{\\omega_s}{2}$: $x_r(t)=\\cos\\bigl((\\omega_s-\\omega_0)t\\bigr)$; in general $f_a=|f_0-kf_s|\\le f_s/2$'],
  ['Anti-aliasing','A low-pass with cutoff $\\omega_s/2$, placed before the sampler; with a transition band $\\Delta$, $f_s\\ge2(f_M+\\Delta)$']
 ]},
{t:'table', cap:'Discrete-time processing and rate change.', head:['Result','Statement'],
 rows:[
  ['Frequency map','$\\Omega=\\omega T$; $\\omega_s\\mapsto2\\pi$, $\\omega_s/2\\mapsto\\pi$'],
  ['Samples','$X_d(e^{j\\Omega})=\\frac{1}{T}\\sum_kX_c\\bigl(j(\\Omega-2\\pi k)/T\\bigr)$'],
  ['Equivalent system','$H_{\\text{eff}}(j\\omega)=H_d(e^{j\\omega T})$ for $|\\omega|<\\omega_s/2$, $0$ beyond, for band-limited inputs'],
  ['Quantization','$\\Delta=2/2^{B}$, $|e|\\le\\Delta/2$, noise power $\\Delta^{2}/12$, $\\text{SNR}\\approx6.02B+1.76$ dB'],
  ['Sampled sequence','$X_p(e^{j\\omega})=\\frac{1}{N}\\sum_{k=0}^{N-1}X\\bigl(e^{j(\\omega-2\\pi k/N)}\\bigr)$; no aliasing when $\\omega_M<\\pi/N$'],
  ['Decimation','$x_b[n]=x[nN]$, $X_b(e^{j\\omega})=X_p(e^{j\\omega/N})$; low-pass to $\\pi/N$ first'],
  ['Interpolation','$x_{(N)}[n]\\leftrightarrow X_b(e^{jN\\omega})$; low-pass of gain $N$, cutoff $\\pi/N$'],
  ['Rate change $L/M$','Up by $L$, one low-pass of gain $L$ and cutoff $\\min(\\pi/L,\\pi/M)$, down by $M$']
 ]},
{t:'box', kind:'warn', hd:'Rows with a condition', html:'The sampling theorem needs a band-limited $x(t)$, and a signal of finite duration never is. The equivalent system holds only for band-limited inputs. Every sinc in these tables is the unnormalised $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},

{t:'h3', text:'What to carry forward'},
{t:'ul', items:[
 'An ideal sampler produces $x_p(t)=\\sum_nx(nT)\\,\\delta(t-nT)$: an impulse at every $nT$ whose weight is the sample $x(nT)$.',
 'One rate has two numbers: $\\omega_s=2\\pi/T$ in rad/s and $f_s=1/T$ in Hz. Check every period with $\\omega_sT=2\\pi$.',
 'The sampled spectrum has a copy at every multiple of $\\omega_s$, scaled by $1/T$, at every rate.',
 'The guard band $\\omega_s-2\\omega_M$ between the baseband and the first copy is positive, zero at the Nyquist rate, or negative.',
 'Aliasing is the overlap of neighbouring copies, which happens only when $\\omega_s<2\\omega_M$. No filter after the sampler can undo it; a low-pass before it prevents it.',
 'The sampling theorem needs a band limit and $\\omega_s>2\\omega_M$, strictly. A signal of finite duration is never band-limited.',
 'Ideal reconstruction is a low-pass of gain $T$ with $\\omega_M<\\omega_c<\\omega_s-\\omega_M$; in time it adds one kernel per sample.',
 'The zero-order hold equals $T$ at $\\omega=0$, sags in the band and leaks outside it. The first-order hold falls off like $1/\\omega^{2}$, and its output is delayed by $T$.',
 'A cosine above $\\omega_s/2$ comes back at the alias frequency. A wheel on film and stripes on a pixel grid follow the same rule.',
 'For band-limited inputs, sample, process and rebuild acts as $H_{\\text{eff}}(j\\omega)=H_d(e^{j\\omega T})$ on $|\\omega|<\\omega_s/2$. Quantization adds a loss that only more bits reduce, about 6 dB per bit.',
 'Decimation stretches the spectrum by $N$ and needs a low-pass first; interpolation compresses it by $N$ and needs a low-pass after.'
]},
{t:'box', kind:'err', hd:'The four traps, in one place', html:'Saying the copies disappear below the Nyquist rate: they never do, they overlap. Treating $\\omega_s=2\\omega_M$ as safe: the admissible cutoff interval is empty there. Reading $2\\pi/T$ in hertz: that is rad/s, and the error is a factor of $2\\pi$. Calling a hold output the reconstructed signal: a hold is an approximation with a measurable error.'},
{t:'p', text:'When a signal is band-limited and the sampling rate satisfies the strict condition, its samples determine it uniquely. This is the bridge from continuous to discrete time: the continuous-time operations of the earlier chapters can be carried out on the samples, and the result converted back.'},

{t:'h3', text:'Exercises'},
{t:'q', n:'7.1', text:'A signal is sampled at $\\omega_s=8000\\pi$ rad/s. Give $T$ and $f_s$, and verify the period with a unit check.', ans:'$T=2\\pi/\\omega_s=1/4000$ s $=0.25$ ms and $f_s=1/T=4000$ Hz. Check: $\\omega_sT=8000\\pi\\times2.5\\times10^{-4}=2\\pi$. A period of $0.25$ s fails the same check by a factor of 1000.'},
{t:'q', n:'7.2', text:'$X(j\\omega)$ peaks at 1 and $T=0.2$ s. How tall is each copy in $X_p(j\\omega)$, and where is the copy $k=2$ centred when $T=0.125$ s?', ans:'Each copy is scaled by $1/T=1/0.2=5$. With $T=0.125$ s, $\\omega_s=2\\pi/0.125=16\\pi$ rad/s, so the copy $k=2$ is centred at $2\\omega_s=32\\pi$ rad/s.'},
{t:'q', n:'7.3', text:'State in one sentence each what sampling does at every rate, and what happens only below the Nyquist rate.', ans:'At every rate sampling puts a copy of $X(j\\omega)$ at every multiple of $\\omega_s$, scaled by $1/T$. Below the Nyquist rate those copies overlap and add, and that overlap is aliasing.'},
{t:'q', n:'7.4', text:'Show that the sampling theorem cannot be satisfied at $\\omega_s=2\\omega_M$, and give a signal that demonstrates it.', ans:'The cutoff condition $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ becomes $\\omega_M<\\omega_c<\\omega_M$, which is empty. For $x(t)=\\sin(\\omega_Mt)$ sampled at $\\omega_s=2\\omega_M$ every sample is $\\sin(\\pi n)=0$. For $\\sin(50\\pi t)$ at $100\\pi$ rad/s, for example, every sample is 0.'},
{t:'q', n:'7.5', text:'What is the Nyquist rate of $\\cos(300\\pi t)+\\cos(700\\pi t)$, and what is $\\omega_M$ for $x(t)=\\bigl(\\sin(50t)/(\\pi t)\\bigr)^{2}$?', ans:'The highest line is $700\\pi$ rad/s, so the Nyquist rate is $1400\\pi$ rad/s. Squaring convolves the rectangle on $|\\omega|\\le50$ with itself, so the band doubles: $\\omega_M=100$ rad/s.'},
{t:'q', n:'7.6', text:'A triangular spectrum has peak $X_{\\max}=4000$ and is sampled at $\\omega_s=32000\\pi$ rad/s. Find the height of one copy, and say why the area $A=8000\\pi$ is not the number to use.', ans:'$T=2\\pi/32000\\pi=1/16000$ s, so the copy height is $X_{\\max}/T=4000\\times16000=6.4\\times10^{7}$. The area of the convolution and the peak of the spectrum differ by $2\\pi$, since squaring in time convolves in frequency and divides by $2\\pi$; using $A$ inflates every height by that factor.'},
{t:'q', n:'7.7', text:'$\\omega_M=3\\pi$ and $\\omega_s=10\\pi$ rad/s. Which of $2\\pi$, $5\\pi$ and $8\\pi$ is a working cutoff $\\omega_c$?', ans:'The cutoff needs $3\\pi<\\omega_c<10\\pi-3\\pi=7\\pi$, so only $5\\pi$ works.'},
{t:'q', n:'7.8', text:'A zero-order hold has $T=1$ ms. Where does $|H_0(j\\omega)|$ first reach zero, and what is $|H_0|$ there relative to $T$ at the band edge $\\omega_s/2$?', ans:'The first zero is at $\\omega=\\omega_s=2\\pi/T=2000\\pi$ rad/s. At $\\omega_s/2$, $|H_0|=2T/\\pi\\approx0.64\\,T$.'},
{t:'q', n:'7.9', text:'$\\cos(10\\pi t)$ is sampled at $\\omega_s=16\\pi$ rad/s and reconstructed with $\\omega_c=8\\pi$. What comes out?', ans:'$10\\pi>8\\pi$, so the baseband line is removed. The copy line $16\\pi-10\\pi=6\\pi<8\\pi$ is kept, so $x_r(t)=\\cos(6\\pi t)$.'},
{t:'q', n:'7.10', text:'$x(t)=\\cos(\\pi t)+\\cos(3\\pi t)$ is sampled with $T=2/5$ s and reconstructed with $\\omega_c=\\omega_s/2$. Find $x_r(t)$ and name the component that moved.', ans:'$\\omega_s=5\\pi<6\\pi$, so aliasing occurs. Surviving lines: $\\pi$ from the baseband and $5\\pi-3\\pi=2\\pi$ from the $k=1$ copy, giving $x_r(t)=\\cos(\\pi t)+\\cos(2\\pi t)$. The component at $3\\pi$ moved to $2\\pi$; the one at $\\pi$ passed untouched.'},
{t:'q', n:'7.11', text:'The chirp $\\cos(2\\pi\\cdot1000\\,t^{2})$ is sampled at $f_s=3$ kHz. What pitch is heard at $t=2$ s?', ans:'At $t=2$ s the tone is at $2000\\times2=4000$ Hz, and $|4-3|=1$ kHz lies inside $0$ to $1.5$ kHz. The pitch heard is 1 kHz.'},
{t:'q', n:'7.12', text:'A wheel turns at 23 rev/s and is filmed at 24 frames/s. Stripes of period 1.0 mm lie over stripes of period 1.25 mm. What does the film show, and how far apart are the dark bands of the overlay?', ans:'$23-24=-1$: the wheel seems to turn backwards at 1 rev/s. The spatial frequencies are $1$ and $1/1.25=0.8$ cycle/mm, so $P=1/(1-0.8)=5$ mm.'},
{t:'q', n:'7.13', text:'A telephone line keeps speech up to 3.4 kHz and samples at 8 kHz. How wide may the transition band of its anti-aliasing filter be?', ans:'$\\Delta=f_s/2-3.4=4-3.4=0.6$ kHz.'},
{t:'q', n:'7.14', text:'The digital differentiator runs with $T=0.25$ s. What is $|H_d(e^{j\\Omega})|$ at $\\Omega=\\pi/2$, and what peak does the output reach for a 700 Hz tone when $f_s=1$ kHz?', ans:'$|\\Omega|/T=(\\pi/2)/0.25=2\\pi$. The 700 Hz tone folds to $1000-700=300$ Hz first, so the output is the derivative of the alias, with peak $2\\pi\\cdot300\\ \\text{s}^{-1}$.'},
{t:'q', n:'7.15', text:'A converter is changed from 4 bits to 12 bits over the range $-1$ to $1$. Give the largest rounding error before, and the change in SNR.', ans:'With 4 bits, $\\Delta=2/2^{4}=1/8$ and $|e|\\le1/16$. Eight more bits add about $8\\times6.02\\approx48$ dB.'},
{t:'q', n:'7.16', text:'The running sequence of Section 7.6, $\\omega_M=\\pi/4$, is decimated by $N=2$. Where is the new band edge, and does it alias? A 44.1 kHz recording is converted to 48 kHz: which ratio $L/M$ does it use?', ans:'The band edge moves to $N\\omega_M=\\pi/2<\\pi$, so there is no aliasing. The rate rises by $48000/44100=160/147$: up by $L=160$, down by $M=147$.'}
];
})();
