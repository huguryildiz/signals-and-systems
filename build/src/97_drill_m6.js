/* ==========================================================================
   Practice questions — Module 6.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const seq =(vals,n0)=>vals.map((v,i)=>[n0+i,v]);
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;
/* tick formatter for a frequency axis measured in multiples of pi; it
   recognises the halves, thirds, quarters, sixths, eighths and twelfths of
   pi that this module's step sizes use, and prints nothing for a tick that
   lands elsewhere. The minus sign is the frame's own tick glyph, not typeset
   mathematics, so this stays outside the reach of the R7 figure-math rule. */
const piFmt = v => { const r=v/Math.PI; if(Math.abs(r)<1e-9) return '0';
  for(const den of [1,2,3,4,6,8,12]){ const num=r*den;
    if(Math.abs(num-Math.round(num))<1e-7){ const k=Math.round(num), sg=k<0?'−':'', m=Math.abs(k);
      const head = m===1?'π':m+'π'; return den===1? sg+head : sg+head+'/'+den; } }
  return v.toFixed(2); };

/* ======================================================================
   MODULE 6 — Discrete-Time Fourier Transform
   ====================================================================== */

CONTENT.DRILLTYPES.M6 = [
  { k:'dtft-basic', name:'Transform of a standard sequence',
    asks:'A sequence is given in closed form. Compute $X(e^{j\\omega})$ from the analysis sum.',
    method:['Write the analysis sum and cut it down to the support of the sequence.',
            'A one-sided geometric sequence sums directly, provided $|a|<1$.',
            'A two-sided one splits at $n=0$, with the $n\\ge1$ half summed separately.',
            'Check $X(e^{j0})=\\sum_n x[n]$, the total sum, without doing a second transform.'],
    go:'m6-ex-anun' },
  { k:'dtft-sinu', name:'Sinusoids, impulses, and the $2\\pi$ periodicity',
    asks:'A sum of sinusoids is given. Plot $X(e^{j\\omega})$ as impulses on $-\\pi\\le\\omega\\le\\pi$.',
    method:['A discrete-time sinusoid transforms into a pair of impulses inside every $2\\pi$ interval.',
            'A cosine of amplitude $A$ gives impulses of weight $\\pi A$ at $\\pm\\omega_c$.',
            'Reduce every frequency into $-\\pi\\le\\omega\\le\\pi$ before plotting anything.',
            'The transform repeats with period $2\\pi$, so one interval is the whole answer.'],
    go:'m6-dt-periodic' },
  { k:'dtft-inv', name:'Inverse transform',
    asks:'$X(e^{j\\omega})$ is given over one period. Recover $x[n]$.',
    method:['The synthesis integral runs over any one $2\\pi$ interval, with the factor $1/2\\pi$.',
            'A rectangle in frequency integrates to a sinc-shaped sequence.',
            'A finite sum of terms $e^{-j\\omega n_0}$ is read off directly as impulses at $n_0$.',
            'Check $x[0]$ against $\\frac{1}{2\\pi}\\int X(e^{j\\omega})\\,\\d\\omega$, the mean of the spectrum.'],
    go:'m6-ex-lpf' },
  { k:'dtft-lti', name:'A sequence through an LTI system',
    asks:'An input and an impulse response are given. Find $Y(e^{j\\omega})$ and, where asked, $y[n]$.',
    method:['Convolution in time is multiplication in frequency: $Y=X\\cdot H$.',
            'For a sinusoidal input, evaluate $H$ at that one frequency and read off gain and phase.',
            'For a rational $Y$, split into first-order terms in $e^{-j\\omega}$ and invert each.',
            'Check the result at $\\omega=0$ against the sums of the sequences.'],
    go:'m6-conv' },
  { k:'dtft-prop', name:'Properties: symmetry, differencing, accumulation, Parseval',
    asks:'A property is applied to a given sequence or spectrum, or a general fact about the transform is proved directly from the analysis sum.',
    method:['Linearity and the time-shift property come from a change of index in the analysis sum; write the index change out.',
            'A real sequence has $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$: even magnitude, odd phase.',
            'Differencing multiplies by $1-e^{-j\\omega}$; accumulation divides by it, plus an impulse train unless $X(e^{j0})=0$.',
            'Parseval counts the same energy twice: once as $\\sum_n|x[n]|^{2}$, once as $\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\,\\d\\omega$.'],
    go:'m6-props-1' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'Several transforms under one statement, or one sequence carried through a filter.',
    method:['Reduce every frequency into $-\\pi\\le\\omega\\le\\pi$ before anything else. A frequency written as $\\tfrac{5\\pi}{2}$ is the frequency $\\tfrac{\\pi}{2}$, and drawing it where it was written is the commonest error in this module.',
            'Recognise the standard pairs: $\\dfrac{\\sin(Wn)}{\\pi n}$ is a rectangle of half-width $W$, $a^{n}u[n]$ is one pole, $a^{|n|}$ is a real even spectrum.',
            'A factor $(-1)^{n}$ is $e^{j\\pi n}$: it shifts the spectrum by $\\pi$ and turns a low-pass shape into a high-pass one.',
            'Check at $\\omega=0$, where $X$ is the sum of all the samples, and remember that every answer repeats with period $2\\pi$.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D6-01', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=\\left(\\tfrac12\\right)^{\\!n}u[n].$$',
  parts:['Compute $X(e^{j\\omega})$ in closed form, and state the condition it needs to converge.',
         'Evaluate $\\left|X(e^{j\\omega})\\right|$ at $\\omega=0$ and $\\omega=\\pi$.',
         'Plot $\\left|X(e^{j\\omega})\\right|$ over one period.'],
  sol:'<b>Given.</b> A causal decaying geometric sequence with ratio $\\tfrac12$.<br>'
     +'<b>Find.</b> Its transform, two magnitude values, and its plot over one period.<br>'
     +'<b>Method.</b> Use the analysis sum because the sequence is given in time. The step restricts the sum to $n\\ge0$, leaving a geometric series in $\\tfrac12e^{-j\\omega}$.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=\\sum_{n=0}^{\\infty}\\left(\\tfrac12e^{-j\\omega}\\right)^{n}=\\frac{1}{1-\\tfrac12e^{-j\\omega}},$$convergent because $\\left|\\tfrac12e^{-j\\omega}\\right|=\\tfrac12<1$ for every $\\omega$.<br>'
     +'<b>Solution — part (b).</b> At $\\omega=0$: $\\left|X\\right|=\\dfrac{1}{1-1/2}=2$. At $\\omega=\\pi$: $\\left|X\\right|=\\dfrac{1}{1+1/2}=\\dfrac23$.<br>'
     +'<b>Solution — part (c).</b> The magnitude runs smoothly from $2$ at $\\omega=0$ down to $\\tfrac23$ at $\\omega=\\pm\\pi$, shown below.<br>'
     +'<b>Check.</b> Directly, $\\displaystyle\\sum_n\\left(\\tfrac12\\right)^{n}=\\dfrac{1}{1-1/2}=2$, matching $X(e^{j0})$ without touching the closed form. At $\\omega=\\pi$ the exponential is $(-1)^{n}$, so $\\displaystyle\\sum_n\\left(-\\tfrac12\\right)^{n}=\\dfrac{1}{1+1/2}=\\dfrac23$, matching the second value.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-0.2,2.4],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|X(e^{j\\omega})|',
      pad:{l:62,r:28,t:34,b:40},xstep:Math.PI/2,ystep:0.5,xtickfmt:piFmt});
    a.curve(w=>1/Math.sqrt(1-Math.cos(w)+0.25),{color:C.out,n:1200});
    return a.svg();},
  err:'Treating the sequence as two-sided and using $(1-a^{2})/(1-2a\\cos\\omega+a^{2})$ instead of the one-sided form — the unit step is what removes the $n<0$ half of the sum.',
  teach:'Ask for the two magnitude values before the plot is attempted. They fix the top and bottom of the curve and catch a one-sided/two-sided confusion immediately.' },

{ id:'D6-02', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=3\\left(\\tfrac14\\right)^{\\!|n|}.$$',
  parts:['Split the sum at $n=0$ and derive $X(e^{j\\omega})$ in closed form.',
         'Evaluate $X(e^{j0})$ and $X(e^{j\\pi})$.',
         'State whether $X(e^{j\\omega})$ is real for every $\\omega$, and why.'],
  sol:'<b>Given.</b> A two-sided, scaled geometric sequence, even about $n=0$.<br>'
     +'<b>Find.</b> Its transform, two values, and its symmetry.<br>'
     +'<b>Method.</b> Split the analysis sum at $n=0$ because the absolute value gives different exponents on the two sides. Each half is a geometric series in $ae^{\\mp j\\omega}$, with $a=\\tfrac14$.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=3\\left[\\frac{1}{1-\\tfrac14e^{-j\\omega}}+\\frac{\\tfrac14e^{j\\omega}}{1-\\tfrac14e^{j\\omega}}\\right]=\\frac{3\\left(1-\\tfrac1{16}\\right)}{1-\\tfrac12\\cos\\omega+\\tfrac1{16}}=\\frac{45}{17-8\\cos\\omega}.$$'
     +'<b>Solution — part (b).</b> $X(e^{j0})=\\dfrac{45}{9}=5$ and $X(e^{j\\pi})=\\dfrac{45}{25}=\\dfrac95=1.8$.<br>'
     +'<b>Solution — part (c).</b> $x[n]$ is real and even, so $X(e^{j\\omega})$ must be real for every $\\omega$ — and $45/(17-8\\cos\\omega)$ has no imaginary part at any $\\omega$, consistent with that.<br>'
     +'<b>Check.</b> Directly, $\\displaystyle\\sum_n3\\left(\\tfrac14\\right)^{|n|}=3\\left[1+2\\sum_{n\\ge1}\\left(\\tfrac14\\right)^{n}\\right]=3\\left[1+\\tfrac23\\right]=5$, matching $X(e^{j0})$. At $\\omega=\\pi$, $\\displaystyle3\\left[1+2\\sum_{n\\ge1}\\left(-\\tfrac14\\right)^{n}\\right]=3\\left[1-\\tfrac25\\right]=3\\cdot\\tfrac35=1.8$, matching the second value.',
  err:'Double-counting the sample at $n=0$ by including it in both halves of the split, which adds an extra term and gives $X(e^{j0})=6$ instead of $5$.',
  teach:'Push for both direct-sum checks, at $\\omega=0$ and $\\omega=\\pi$, before the closed form is trusted. A double-counted sample only shows up at $\\omega=0$; a sign error in combining the two halves only shows up at $\\omega=\\pi$.' },

{ id:'D6-03', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'The sequence $x[n]$ shown below equals $1$ for $-3\\le n\\le3$ and is zero elsewhere.',
  parts:['State the support of $x[n]$ and give $X(e^{j\\omega})$ as a ratio of sines.',
         'Give $X(e^{j0})$ and locate the zeros of $X$ inside $-\\pi\\le\\omega\\le\\pi$.',
         'Plot $\\left|X(e^{j\\omega})\\right|$ over one period, marking the zeros.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-5.2,5.2],yr:[-0.4,1.6],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:1});
    a.stem(disc(n=>Math.abs(n)<=3?1:0,-5,5),{color:C.in,showZero:true}); return a.svg();},
  sol:'<b>Given.</b> A rectangular window of seven ones, centred on $n=0$.<br>'
     +'<b>Find.</b> Its transform, its zeros, and its plot.<br>'
     +'<b>Method.</b> Use a finite geometric series because the sequence has consecutive non-zero samples. The symmetric limits then give a real expression directly.<br>'
     +'<b>Solution — part (a).</b> The support is $-3\\le n\\le3$, seven samples, and$$X(e^{j\\omega})=\\sum_{n=-3}^{3}e^{-j\\omega n}=\\frac{\\sin(3.5\\,\\omega)}{\\sin(\\omega/2)}.$$'
     +'<b>Solution — part (b).</b> $X(e^{j0})=7$, the number of ones. The zeros occur where $\\sin(3.5\\,\\omega)=0$ but $\\sin(\\omega/2)\\neq0$, that is $3.5\\,\\omega=k\\pi$ with $k\\neq0$; inside $-\\pi\\le\\omega\\le\\pi$ this gives$$\\omega=\\pm\\frac{2\\pi}{7},\\;\\pm\\frac{4\\pi}{7},\\;\\pm\\frac{6\\pi}{7}.$$'
     +'<b>Solution — part (c).</b> The magnitude falls from $7$ at $\\omega=0$ through the six zeros above to $1$ at $\\omega=\\pm\\pi$, shown below.<br>'
     +'<b>Check.</b> Directly at $\\omega=\\pi$, $\\displaystyle\\sum_{n=-3}^{3}(-1)^{n}=-1+1-1+1-1+1-1=-1$, and the closed form gives $\\sin(3.5\\pi)/\\sin(\\pi/2)=-1/1=-1$, so $\\left|X(e^{j\\pi})\\right|=1$, matching the plot. Both routes count seven alternating terms, one starting from the sum and one from the ratio of sines.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-0.45,7.8],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|X(e^{j\\omega})|',
      pad:{l:62,r:28,t:34,b:60},xstep:Math.PI/2,ystep:2,xtickfmt:piFmt});
    a.curve(w=>Math.abs(Math.abs(Math.sin(w/2))<1e-7?7:Math.sin(3.5*w)/Math.sin(w/2)),{color:C.out,n:1600});
    [2*Math.PI/7,4*Math.PI/7,6*Math.PI/7,-2*Math.PI/7,-4*Math.PI/7,-6*Math.PI/7]
      .forEach(w=>a.vline(w,{color:C.muted,opacity:.45}));
    return a.svg();},
  err:'Taking the support as $-3\\le n\\le4$ or otherwise miscounting the seven samples, which shifts every zero location by a factor that does not match the plot.',
  teach:'Have $X(e^{j0})$ counted twice: once as the number of ones in the window, once as the value the ratio of sines gives in the limit $\\omega\\to0$. Both must be $7$.' },

{ id:'D6-04', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=3\\left(\\tfrac13\\right)^{\\!n-1}u[n-1].$$',
  parts:['Compute $X(e^{j\\omega})$ directly from the analysis sum.',
         'Give $X(e^{j\\omega})$ a second way, using the time-shift property on $w[n]=3\\left(\\tfrac13\\right)^{n}u[n]$, and confirm the two routes agree.',
         'Evaluate $X(e^{j0})$ and check it against the sum of the sequence.'],
  sol:'<b>Given.</b> A causal decaying sequence, delayed by one sample.<br>'
     +'<b>Find.</b> Its transform, found two ways.<br>'
     +'<b>Method.</b> Use both direct analysis and the time-shift property so that each result checks the other. In the direct sum, substitute $m=n-1$ to obtain a standard one-sided geometric series.<br>'
     +'<b>Solution — part (a).</b> With $m=n-1$,$$X(e^{j\\omega})=\\sum_{m=0}^{\\infty}3\\left(\\tfrac13\\right)^{m}e^{-j\\omega(m+1)}=e^{-j\\omega}\\sum_{m=0}^{\\infty}3\\left(\\tfrac13e^{-j\\omega}\\right)^{m}=\\frac{3e^{-j\\omega}}{1-\\tfrac13e^{-j\\omega}}.$$'
     +'<b>Solution — part (b).</b> $W(e^{j\\omega})=\\dfrac{3}{1-\\tfrac13e^{-j\\omega}}$ for $w[n]=3\\left(\\tfrac13\\right)^{n}u[n]$, and $x[n]=w[n-1]$, so by the time-shift property$$X(e^{j\\omega})=e^{-j\\omega}W(e^{j\\omega})=\\frac{3e^{-j\\omega}}{1-\\tfrac13e^{-j\\omega}},$$exactly the formula of part (a).<br>'
     +'<b>Solution — part (c).</b>$$X(e^{j0})=\\frac{3}{1-1/3}=\\frac{9}{2}=4.5.$$'
     +'<b>Check.</b> Directly, $\\displaystyle\\sum_{n=1}^{\\infty}3\\left(\\tfrac13\\right)^{n-1}=3\\sum_{m=0}^{\\infty}\\left(\\tfrac13\\right)^{m}=3\\cdot\\tfrac32=4.5$, matching part (c). At $\\omega=\\pi$ instead, the closed form gives $X(e^{j\\pi})=\\dfrac{3(-1)}{1+1/3}=-\\dfrac94$, and directly $\\displaystyle\\sum_{n=1}^{\\infty}3\\left(\\tfrac13\\right)^{n-1}(-1)^{n}=-3\\sum_{m=0}^{\\infty}\\left(-\\tfrac13\\right)^{m}=-3\\cdot\\tfrac34=-\\dfrac94$, an independent match at a second frequency.',
  err:'Applying the time-shift property with the wrong sign, writing $X=e^{j\\omega}W(e^{j\\omega})$ instead of $e^{-j\\omega}W(e^{j\\omega})$, which reverses the direction of every phase the shift produces.',
  teach:'Require both routes in part (b). The direct sum verifies the sign in the shift property, so stating that the routes agree is not enough.' },

{ id:'D6-05', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Plot the discrete-time Fourier transform of $$x[n]=4\\cos\\!\\left(\\tfrac{\\pi}{3}n\\right)$$on $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Give $X(e^{j\\omega})$ as a sum of impulses on one period.',
         'Mark the impulse weights and locations on a plot.',
         'Confirm the weights by synthesising $x[0]$ from the two impulses.'],
  sol:'<b>Given.</b> A single discrete-time cosine, amplitude $4$, frequency $\\tfrac{\\pi}{3}$ rad/sample.<br>'
     +'<b>Find.</b> Its line spectrum on one period.<br>'
     +'<b>Method.</b> Use the cosine transform pair because the signal is one scaled cosine. On any one $2\\pi$ interval, $\\cos(\\omega_0n)\\longleftrightarrow\\pi\\left[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\right]$, and amplitude scaling follows from linearity.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=4\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{3}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{3}\\right)\\right],\\qquad-\\pi\\le\\omega\\le\\pi.$$'
     +'<b>Solution — part (b).</b> Two impulses, each of weight $4\\pi$, at $\\omega=\\pm\\tfrac{\\pi}{3}$, shown below.<br>'
     +'<b>Check.</b> Synthesising at $n=0$: $x[0]=\\dfrac{1}{2\\pi}\\left[4\\pi+4\\pi\\right]=4$, and directly $x[0]=4\\cos(0)=4$, matching without repeating the transform.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-2.6,15.4],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:56,r:28,t:34,b:40},xstep:Math.PI/2,ystep:3,xtickfmt:piFmt});
    [-Math.PI/3,Math.PI/3].forEach(w=>{ a.impulse(w,4*Math.PI,{color:C.mid,label:false});
      a.note(w,4*Math.PI,'4\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.mid}); });
    return a.svg();},
  err:'Placing a single impulse at $\\omega=\\pi/3$ and leaving out its negative-frequency partner. A real cosine always contributes two impulses of equal weight.',
  teach:'Ask for the synthesis check at $n=0$ before plotting. It tests the impulse weight in one line.' },

{ id:'D6-06', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Plot the discrete-time Fourier transform of $$x[n]=2+3\\cos\\!\\left(\\tfrac{2\\pi}{5}n\\right)$$on $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Give $X(e^{j\\omega})$ as a sum of impulses on one period.',
         'State the weight of the impulse at $\\omega=0$, and say why it differs from the weight the cosine term contributes at either of its two frequencies.',
         'Plot the spectrum, marking every weight.'],
  sol:'<b>Given.</b> A constant plus a cosine at $\\tfrac{2\\pi}{5}$ rad/sample.<br>'
     +'<b>Find.</b> The line spectrum.<br>'
     +'<b>Method.</b> The sequence is a sum of a constant and a cosine, so use their transform pairs separately and add the spectra by linearity: $1\\longleftrightarrow2\\pi\\delta(\\omega)$ and $\\cos(\\omega_0n)\\longleftrightarrow\\pi\\left[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\right]$.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=4\\pi\\,\\delta(\\omega)+3\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{2\\pi}{5}\\right)+\\delta\\!\\left(\\omega+\\tfrac{2\\pi}{5}\\right)\\right],\\qquad-\\pi\\le\\omega\\le\\pi.$$'
     +'<b>Solution — part (b).</b> The impulse at $\\omega=0$ has weight $4\\pi$: a constant of amplitude $A$ carries weight $2\\pi A$ at the single point $\\omega=0$, while a cosine of the same amplitude splits its weight, $\\pi A$, between two points. Here $A=2$ for the constant gives $2\\pi\\cdot2=4\\pi$, and $A=3$ for the cosine gives $3\\pi$ at each of $\\omega=\\pm2\\pi/5$.<br>'
     +'<b>Solution — part (c).</b> Three impulses: $4\\pi$ at $\\omega=0$, and $3\\pi$ at each of $\\omega=\\pm2\\pi/5$, shown below.<br>'
     +'<b>Check.</b> Synthesising at $n=0$: $x[0]=\\dfrac{1}{2\\pi}\\left[4\\pi+3\\pi+3\\pi\\right]=5$, and directly $x[0]=2+3\\cos(0)=5$, matching.',
  figSol:()=>{const a=P.Axes({w:1080,h:300,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-2.6,15.4],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:56,r:28,t:34,b:40},xstep:Math.PI/2,ystep:3,xtickfmt:piFmt});
    a.impulse(0,4*Math.PI,{color:C.mid,label:false});
    a.note(0,4*Math.PI,'4\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.mid});
    [-2*Math.PI/5,2*Math.PI/5].forEach(w=>{ a.impulse(w,3*Math.PI,{color:C.mid,label:false});
      a.note(w,3*Math.PI,'3\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.mid}); });
    return a.svg();},
  err:'Giving the impulse at $\\omega=0$ a weight of $2\\pi$, as though the constant were a cosine term evaluated at zero frequency rather than a term of its own with weight $2\\pi A$.',
  teach:'Set the two weight formulas side by side: a constant gives $2\\pi A$ at one point, a cosine gives $\\pi A$ at each of two points. The factor of two is the single weight a one-sided description would need, split across the two impulses a real signal actually produces.' },

{ id:'D6-07', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=5\\sin\\!\\left(\\tfrac{3\\pi}{4}n\\right).$$',
  parts:['Derive the impulse pair for $\\sin(\\omega_0n)$ from the impulse pair for $e^{j\\omega_0n}$, using Euler\'s relation.',
         'Give $X(e^{j\\omega})$ for this $x[n]$.',
         'Check the result by synthesising $x[1]$.'],
  sol:'<b>Given.</b> A single discrete-time sine, amplitude $5$, frequency $\\tfrac{3\\pi}{4}$ rad/sample.<br>'
     +'<b>Find.</b> Its transform, and one synthesised sample checked.<br>'
     +'<b>Method.</b> Express the sine as exponentials because each exponential has a direct impulse transform pair. Write $\\sin(\\omega_0n)=\\dfrac{e^{j\\omega_0n}-e^{-j\\omega_0n}}{2j}$ and transform each term with $e^{j\\omega_0n}\\longleftrightarrow2\\pi\\delta(\\omega-\\omega_0)$.<br>'
     +'<b>Solution — part (a).</b>$$X_{\\sin}(e^{j\\omega})=\\frac{1}{2j}\\left[2\\pi\\delta(\\omega-\\omega_0)-2\\pi\\delta(\\omega+\\omega_0)\\right]=-j\\pi\\left[\\delta(\\omega-\\omega_0)-\\delta(\\omega+\\omega_0)\\right].$$'
     +'<b>Solution — part (b).</b> With $A=5$, $\\omega_0=\\tfrac{3\\pi}{4}$,$$X(e^{j\\omega})=-j5\\pi\\,\\delta\\!\\left(\\omega-\\tfrac{3\\pi}{4}\\right)+j5\\pi\\,\\delta\\!\\left(\\omega+\\tfrac{3\\pi}{4}\\right),$$two impulses of equal magnitude $5\\pi$ at $\\omega=\\pm\\tfrac{3\\pi}{4}$, purely imaginary and opposite in sign — consistent with a real, odd sequence.<br>'
     +'<b>Check.</b> Synthesising at $n=1$:$$x[1]=\\frac{1}{2\\pi}\\left[-j5\\pi\\,e^{j3\\pi/4}+j5\\pi\\,e^{-j3\\pi/4}\\right]=\\frac{5}{2}\\,j\\left[e^{-j3\\pi/4}-e^{j3\\pi/4}\\right]=5\\sin\\!\\left(\\tfrac{3\\pi}{4}\\right)=\\frac{5\\sqrt2}{2},$$matching $x[1]=5\\sin(3\\pi/4)$ directly, and not the trivial $n=0$ value that every odd sequence gives.',
  err:'Writing the sine pair with a plus sign, $j\\pi\\left[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\right]$, which is the cosine pair with the wrong prefactor rather than a genuinely different pattern of signs.',
  teach:'Do not use $n=0$ as the only check, because every odd sequence gives $x[0]=0$ even when the weights are wrong. Use $n=1$ or a later index.' },

{ id:'D6-08', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Plot the discrete-time Fourier transform of $$x[n]=2\\cos\\!\\left(\\tfrac{3\\pi}{2}n\\right)+\\cos\\!\\left(\\tfrac{9\\pi}{4}n\\right)$$on $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Reduce each frequency into $-\\pi\\le\\omega\\le\\pi$, and confirm the reduction leaves $x[n]$ unchanged at $n=2$.',
         'Give $X(e^{j\\omega})$ as a sum of impulses over one period.',
         'Plot the spectrum, and check the total weight against $x[0]$.'],
  sol:'<b>Given.</b> Two cosines whose stated frequencies lie outside $-\\pi\\le\\omega\\le\\pi$.<br>'
     +'<b>Find.</b> Their equivalent frequencies inside one period, and the resulting spectrum.<br>'
     +'<b>Method.</b> Reduce the frequencies before applying transform pairs. For integer $n$, $e^{-j2\\pi n}=1$, so a frequency and the same frequency shifted by $2\\pi$ produce identical sequences. Subtract $2\\pi$ until each frequency lies in $-\\pi\\le\\omega\\le\\pi$.<br>'
     +'<b>Solution — part (a).</b> $\\tfrac{3\\pi}{2}-2\\pi=-\\tfrac{\\pi}{2}$, and $\\cos$ is even, so $\\cos\\!\\left(\\tfrac{3\\pi}{2}n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$. Also $\\tfrac{9\\pi}{4}-2\\pi=\\tfrac{\\pi}{4}$, so $\\cos\\!\\left(\\tfrac{9\\pi}{4}n\\right)=\\cos\\!\\left(\\tfrac{\\pi}{4}n\\right)$. At $n=2$: $\\cos(3\\pi)=-1=\\cos(\\pi)$, and $\\cos\\!\\left(\\tfrac{9\\pi}{2}\\right)=\\cos\\!\\left(\\tfrac{\\pi}{2}\\right)=0$, both matching the reduced forms.<br>'
     +'<b>Solution — part (b).</b>$$X(e^{j\\omega})=2\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{2}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{2}\\right)\\right]+\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{4}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{4}\\right)\\right].$$'
     +'<b>Solution — part (c).</b> Four impulses: $2\\pi$ at $\\omega=\\pm\\tfrac{\\pi}{2}$ and $\\pi$ at $\\omega=\\pm\\tfrac{\\pi}{4}$, shown below.<br>'
     +'<b>Check.</b> Synthesising at $n=0$: $x[0]=\\dfrac{1}{2\\pi}\\left[2\\pi+2\\pi+\\pi+\\pi\\right]=3$, and directly $x[0]=2\\cos(0)+\\cos(0)=3$, matching.',
  figSol:()=>{const a=P.Axes({w:1080,h:300,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-1.2,7.2],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:56,r:28,t:34,b:40},xstep:Math.PI/4,ystep:2,xtickfmt:piFmt});
    [-Math.PI/2,Math.PI/2].forEach(w=>{ a.impulse(w,2*Math.PI,{color:C.mid,label:false});
      a.note(w,2*Math.PI,'2\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.mid}); });
    [-Math.PI/4,Math.PI/4].forEach(w=>{ a.impulse(w,Math.PI,{color:C.mid,label:false});
      a.note(w,Math.PI,'\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.mid}); });
    return a.svg();},
  err:'Plotting impulses at the stated frequencies $3\\pi/2$ and $9\\pi/4$ directly, outside the one period the spectrum is asked for, instead of reducing them first.',
  teach:'Check the frequency reduction at one integer before drawing the impulses. Agreement at one index does not prove equality for every $n$, but disagreement disproves it.' },

{ id:'D6-09', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A discrete-time LTI system has impulse response $h[n]=\\left(\\tfrac12\\right)^{\\!n}u[n]$ and input $x[n]=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$.',
  parts:['Give $H(e^{j\\omega})$.',
         'Evaluate $H$ at $\\omega=\\tfrac{\\pi}{2}$, and give $y[n]$ in amplitude-and-phase form.',
         'Check $\\left|H(e^{j\\pi/2})\\right|$ using $\\left|H(e^{j\\omega})\\right|^{2}=H(e^{j\\omega})H^{*}(e^{j\\omega})$.'],
  sol:'<b>Given.</b> A one-pole system driven by a cosine at $\\tfrac{\\pi}{2}$ rad/sample.<br>'
     +'<b>Find.</b> $y[n]$, through the frequency response evaluated at one frequency.<br>'
     +'<b>Method.</b> Use the sinusoidal eigenfunction property because an LTI system changes only the amplitude and phase of a sinusoid: $y[n]=\\left|H(e^{j\\omega_0})\\right|\\cos\\!\\left(\\omega_0n+\\angle H(e^{j\\omega_0})\\right)$.<br>'
     +'<b>Solution — part (a).</b>$$H(e^{j\\omega})=\\frac{1}{1-\\tfrac12e^{-j\\omega}}.$$'
     +'<b>Solution — part (b).</b> At $\\omega=\\tfrac{\\pi}{2}$, $e^{-j\\pi/2}=-j$, so$$H\\!\\left(e^{j\\pi/2}\\right)=\\frac{1}{1+\\tfrac{j}{2}}=\\frac{1-\\tfrac{j}{2}}{1+\\tfrac14}=\\frac45-\\frac{2}{5}j.$$Its magnitude is $\\dfrac{2}{\\sqrt5}\\approx0.8944$ and its phase is $-\\arctan\\!\\left(\\tfrac12\\right)\\approx-0.4636$ rad, so$$y[n]=\\frac{2}{\\sqrt5}\\cos\\!\\left(\\tfrac{\\pi}{2}n-\\arctan\\tfrac12\\right).$$'
     +'<b>Check.</b> $\\left|H(e^{j\\omega})\\right|^{2}=\\dfrac{1}{\\left|1-\\tfrac12e^{-j\\omega}\\right|^{2}}=\\dfrac{1}{1-\\cos\\omega+\\tfrac14}$. At $\\omega=\\tfrac{\\pi}{2}$, $\\cos\\omega=0$, so $\\left|H\\right|^{2}=\\dfrac{1}{1.25}=0.8$, and $\\sqrt{0.8}=\\dfrac{2}{\\sqrt5}$, matching part (b) by a route that never divides two complex numbers.',
  err:'Evaluating $H$ at $\\omega=0$ and reporting the DC gain, $2$, in place of the gain at the input frequency $\\omega=\\pi/2$. The frequency response is a function of frequency, not a single number.',
  teach:'Have the magnitude-squared check carried out before the amplitude-and-phase form is accepted. It is a genuinely different computation from the complex division in part (b), not a repetition of it.' },

{ id:'D6-10', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A discrete-time LTI system has impulse response $$h[n]=\\delta[n]-\\delta[n-1].$$',
  parts:['Give $H(e^{j\\omega})$, and show that $\\left|H(e^{j\\omega})\\right|=2\\left|\\sin(\\omega/2)\\right|$.',
         'Give $\\left|H\\right|$ at $\\omega=0$ and $\\omega=\\pi$, and say what kind of filter this is.',
         'Plot $\\left|H(e^{j\\omega})\\right|$ over one period.'],
  sol:'<b>Given.</b> A two-tap first-difference filter.<br>'
     +'<b>Find.</b> Its magnitude response and its type.<br>'
     +'<b>Method.</b> Compute $H(e^{j\\omega})H^{*}(e^{j\\omega})$ because this product is the squared magnitude and remains real. This avoids taking the square root of a complex expression.<br>'
     +'<b>Solution — part (a).</b> $H(e^{j\\omega})=1-e^{-j\\omega}$, and$$\\left|H(e^{j\\omega})\\right|^{2}=\\left(1-e^{-j\\omega}\\right)\\left(1-e^{j\\omega}\\right)=2-2\\cos\\omega=4\\sin^{2}\\!\\left(\\tfrac{\\omega}{2}\\right),$$so $\\left|H(e^{j\\omega})\\right|=2\\left|\\sin(\\omega/2)\\right|$.<br>'
     +'<b>Solution — part (b).</b> $\\left|H(e^{j0})\\right|=0$ and $\\left|H(e^{j\\pi})\\right|=2$. A system that blocks a constant completely and passes the fastest sequence with the largest gain is a <b>high-pass filter</b>.<br>'
     +'<b>Solution — part (c).</b> The magnitude rises from $0$ at $\\omega=0$ to $2$ at $\\omega=\\pm\\pi$, shown below.<br>'
     +'<b>Check.</b> $\\left|H(e^{j\\omega})\\right|=\\left|1-e^{-j\\omega}\\right|$ is the length of the chord from $e^{-j\\omega}$ to $1$ on the unit circle. That chord has length $2\\sin(\\theta/2)$ for two points separated by angle $\\theta$ on a circle of radius $1$; here $\\theta=\\omega$, matching $2\\left|\\sin(\\omega/2)\\right|$ by a geometric argument that never expands the product of two exponentials.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-0.25,2.6],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',
      pad:{l:62,r:28,t:34,b:40},xstep:Math.PI/2,ystep:0.5,xtickfmt:piFmt});
    a.curve(w=>2*Math.abs(Math.sin(w/2)),{color:C.h,n:1200});
    return a.svg();},
  err:'Computing $\\left|1-e^{-j\\omega}\\right|$ as $1-\\left|e^{-j\\omega}\\right|=1-1=0$ for every $\\omega$, treating the magnitude of a difference as the difference of two magnitudes.',
  teach:'This filter is the discrete-time counterpart of a differentiator: it removes a constant completely and leaves the fastest-changing part of a sequence largest, only scaled and phase-shifted.' },

{ id:'D6-11', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A discrete-time LTI system has impulse response $h[n]=\\left(\\tfrac14\\right)^{\\!n}u[n]$ and input $x[n]=\\left(\\tfrac12\\right)^{\\!n}u[n]$.',
  parts:['Give $X(e^{j\\omega})$, $H(e^{j\\omega})$ and $Y(e^{j\\omega})$.',
         'Recover $y[n]$ by partial fractions.',
         'Check $y[0]$ and $y[1]$ directly against the convolution sum.'],
  sol:'<b>Given.</b> Two causal geometric sequences, ratios $\\tfrac12$ and $\\tfrac14$.<br>'
     +'<b>Find.</b> The output, through the frequency domain.<br>'
     +'<b>Method.</b> Use the convolution property because the required sequence is a convolution. Multiply the transforms, split the rational product into first-order terms in $z=e^{-j\\omega}$, and invert each term with the standard pair.<br>'
     +'<b>Solution — part (a).</b>$$X=\\frac{1}{1-\\tfrac12e^{-j\\omega}},\\qquad H=\\frac{1}{1-\\tfrac14e^{-j\\omega}},\\qquad Y=\\frac{1}{\\left(1-\\tfrac12e^{-j\\omega}\\right)\\left(1-\\tfrac14e^{-j\\omega}\\right)}.$$'
     +'<b>Solution — part (b).</b> With $z=e^{-j\\omega}$, $a=\\tfrac12$, $b=\\tfrac14$,$$\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz},\\qquad A=\\frac{a}{a-b}=2,\\quad B=\\frac{b}{b-a}=-1,$$so$$y[n]=2\\left(\\tfrac12\\right)^{\\!n}u[n]-\\left(\\tfrac14\\right)^{\\!n}u[n].$$'
     +'<b>Check.</b> $y[0]=2-1=1$, and directly from the convolution sum $y[0]=x[0]h[0]=1\\cdot1=1$, matching. $y[1]=2\\left(\\tfrac12\\right)-\\tfrac14=\\tfrac34$, and directly $y[1]=x[0]h[1]+x[1]h[0]=\\tfrac14+\\tfrac12=\\tfrac34$, matching a second, independent sample.',
  err:'Solving for $A$ and $B$ by treating $z$ as a variable that may be set to $0$ or $1$; the reliable route is to clear denominators and match coefficients, or set $z=1/a$ and $z=1/b$ in turn in the cleared equation.',
  teach:'Set this beside the same convolution done sample by sample in Module 3. Watching one answer arrive by two routes is what convinces a student the transform is a shortcut, not a separate topic.' },

{ id:'D6-12', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A two-tap averaging filter has impulse response $$h[n]=\\tfrac12\\delta[n]+\\tfrac12\\delta[n-1],$$and its input is $x[n]=\\cos\\!\\left(\\tfrac{\\pi}{3}n\\right)$.',
  parts:['Write $H(e^{j\\omega})=e^{-j\\omega/2}\\cos(\\omega/2)$, and evaluate it at $\\omega=\\tfrac{\\pi}{3}$.',
         'Give $y[n]$ in amplitude-and-phase form.',
         'Give $Y(e^{j\\omega})$ as a pair of weighted impulses, and plot $\\left|Y(e^{j\\omega})\\right|$.'],
  sol:'<b>Given.</b> A symmetric two-sample average driven by a cosine at $\\tfrac{\\pi}{3}$ rad/sample.<br>'
     +'<b>Find.</b> $y[n]$ and the spectrum of the output.<br>'
     +'<b>Method.</b> Use the sinusoidal eigenfunction property because the input contains only one frequency. Factor out the midpoint exponential so the remaining factor is real, evaluate $H$ at that frequency, and multiply the value into both impulses of $X$.<br>'
     +'<b>Solution — part (a).</b>$$H(e^{j\\omega})=\\tfrac12\\left(1+e^{-j\\omega}\\right)=\\tfrac12e^{-j\\omega/2}\\left(e^{j\\omega/2}+e^{-j\\omega/2}\\right)=e^{-j\\omega/2}\\cos\\!\\left(\\tfrac{\\omega}{2}\\right).$$At $\\omega=\\tfrac{\\pi}{3}$: $H\\!\\left(e^{j\\pi/3}\\right)=e^{-j\\pi/6}\\cos\\!\\left(\\tfrac{\\pi}{6}\\right)=\\dfrac{\\sqrt3}{2}\\,e^{-j\\pi/6}$.<br>'
     +'<b>Solution — part (b).</b>$$y[n]=\\frac{\\sqrt3}{2}\\cos\\!\\left(\\tfrac{\\pi}{3}n-\\tfrac{\\pi}{6}\\right).$$'
     +'<b>Solution — part (c).</b> $X(e^{j\\omega})=\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{3}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{3}\\right)\\right]$, and multiplying each impulse by $H$ evaluated at its own location,$$Y(e^{j\\omega})=\\frac{\\sqrt3\\pi}{2}\\,e^{-j\\pi/6}\\,\\delta\\!\\left(\\omega-\\tfrac{\\pi}{3}\\right)+\\frac{\\sqrt3\\pi}{2}\\,e^{j\\pi/6}\\,\\delta\\!\\left(\\omega+\\tfrac{\\pi}{3}\\right),$$so $\\left|Y(e^{j\\omega})\\right|$ is two impulses of equal weight $\\tfrac{\\sqrt3\\pi}{2}$ at $\\omega=\\pm\\tfrac{\\pi}{3}$, shown below.<br>'
     +'<b>Check.</b> $y[0]=\\tfrac12x[0]+\\tfrac12x[-1]=\\tfrac12\\cos(0)+\\tfrac12\\cos\\!\\left(-\\tfrac{\\pi}{3}\\right)=\\tfrac12+\\tfrac14=\\tfrac34$, computed directly from the two-tap average. From part (b), $y[0]=\\dfrac{\\sqrt3}{2}\\cos\\!\\left(-\\tfrac{\\pi}{6}\\right)=\\dfrac{\\sqrt3}{2}\\cdot\\dfrac{\\sqrt3}{2}=\\dfrac34$, matching.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-0.7,3.6],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|Y(e^{j\\omega})|',
      pad:{l:60,r:28,t:34,b:40},xstep:Math.PI/2,ystep:1,xtickfmt:piFmt});
    const wgt = Math.sqrt(3)*Math.PI/2;
    [-Math.PI/3,Math.PI/3].forEach(w=>{ a.impulse(w,wgt,{color:C.out,label:false});
      a.note(w,wgt,'\\tfrac{\\sqrt{3}}{2}\\pi',{dx:9,dy:-7,tex:true,fs:12,color:C.out}); });
    return a.svg();},
  err:'Evaluating $H$ at $\\omega=0$, the tap average\'s DC gain of $1$, instead of at the input frequency $\\omega=\\pi/3$, and reporting $y[n]=x[n]$ unchanged.',
  teach:'This is the skill in one line: two impulses of the input, each multiplied by the frequency response evaluated at its own location, give the two impulses of the output.' },

{ id:'D6-13', module:'M6', type:'dtft-inv',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=\\begin{cases}1,&|\\omega|\\le\\tfrac{\\pi}{3},\\\\[2pt]0,&\\tfrac{\\pi}{3}<|\\omega|\\le\\pi,\\end{cases}$$repeated with period $2\\pi$.',
  parts:['Compute $x[n]$ from the synthesis integral, for $n\\neq0$.',
         'Give $x[0]$ two ways: as the limit of your part (a) formula, and as the mean of the spectrum over one period.',
         'Plot $x[n]$ for $-8\\le n\\le8$.'],
  sol:'<b>Given.</b> An ideal low-pass spectrum with cut-off $\\tfrac{\\pi}{3}$.<br>'
     +'<b>Find.</b> The corresponding sequence.<br>'
     +'<b>Method.</b> Use the synthesis integral because the spectrum is given and the sequence is required. Integrate over one period; the integrand is non-zero only on the passband.<br>'
     +'<b>Solution — part (a).</b> For $n\\neq0$,$$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi/3}^{\\pi/3}e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{e^{j\\pi n/3}-e^{-j\\pi n/3}}{jn}=\\frac{\\sin(\\pi n/3)}{\\pi n}.$$'
     +'<b>Solution — part (b).</b> The integrand is $1$ throughout the passband at $n=0$, so $x[0]=\\dfrac{1}{2\\pi}\\cdot\\dfrac{2\\pi}{3}=\\dfrac13$, which is also $\\displaystyle\\lim_{n\\to0}\\frac{\\sin(\\pi n/3)}{\\pi n}=\\frac{\\pi/3}{\\pi}=\\frac13$. Independently, the mean of the spectrum over one period is the passband width divided by $2\\pi$: $\\dfrac{2\\pi/3}{2\\pi}=\\dfrac13$, matching without evaluating any limit.<br>'
     +'<b>Solution — part (c).</b> A two-sided, slowly decaying sinc-shaped sequence, plotted below.<br>'
     +'<b>Check.</b> The sequence is real and even, matching the real even spectrum, and it decays as $1/|n|$ rather than reaching zero — an ideal low-pass filter has an impulse response with infinite support, in discrete time exactly as it does in continuous time.',
  figSol:()=>{const x=n=>n===0?1/3:Math.sin(Math.PI*n/3)/(Math.PI*n);
    const a=P.Axes({w:1080,h:290,xr:[-8.6,8.6],yr:[-0.24,0.45],xlabel:'n',ylabel:'x[n]',
      pad:{l:54,r:28,t:32,b:34},xstep:2,ystep:0.1});
    a.stem(disc(x,-8,8),{color:C.out,showZero:true}); return a.svg();},
  err:'Forgetting the $1/2\\pi$ factor in the synthesis integral, and reporting $x[n]=\\sin(\\pi n/3)/n$ — every sample too large by a factor of $\\pi$.',
  teach:'Push for the mean-of-the-spectrum check on $x[0]$ before any other value is trusted. It takes one line and does not depend on evaluating a limit.' },

{ id:'D6-14', module:'M6', type:'dtft-inv',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=4-e^{-j\\omega}+2e^{-j3\\omega}.$$',
  parts:['Give $x[n]$.',
         'State the support of $x[n]$ and give $\\sum_n x[n]$.'],
  sol:'<b>Given.</b> A finite polynomial in $e^{-j\\omega}$.<br>'
     +'<b>Find.</b> The sequence.<br>'
     +'<b>Method.</b> Use the shifted-unit-sample pair because the spectrum is a finite sum of exponentials. Match each term $c\\,e^{-j\\omega n_0}$ to $c\\,\\delta[n-n_0]$ and keep its delay sign.<br>'
     +'<b>Solution — part (a).</b>$$x[n]=4\\delta[n]-\\delta[n-1]+2\\delta[n-3],$$that is $x[0]=4$, $x[1]=-1$, $x[2]=0$, $x[3]=2$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> The support is $0\\le n\\le3$, and $\\displaystyle\\sum_n x[n]=4-1+0+2=5$.<br>'
     +'<b>Check.</b> $X(e^{j0})=4-1+2=5$, matching the sum, as it must. At $\\omega=\\pi$, the closed form gives $X(e^{j\\pi})=4-(-1)+2(-1)=3$, and directly from the sequence, $\\displaystyle\\sum_n x[n](-1)^{n}=4+1+0-2=3$, an independent match at a second frequency.',
  err:'Placing the coefficient $2$ at $n=-3$ by reading the minus sign inside the exponent as a reflection of the index. The exponent already carries the sign of the delay: $e^{-j3\\omega}$ pairs with $\\delta[n-3]$.',
  teach:'A finite-length sequence and a polynomial in $e^{-j\\omega}$ are the same object written two ways. Establishing that with a two-term check, at $\\omega=0$ and $\\omega=\\pi$, makes the frequency response of every FIR filter in the module immediate.' },

{ id:'D6-15', module:'M6', type:'dtft-inv',
  stem:'The spectrum $X(e^{j\\omega})$ shown below is one period of a periodic function.',
  parts:['Read the height and the cut-off frequency of $X(e^{j\\omega})$ from the figure, and write it as a formula.',
         'Compute $x[n]$ for $n\\neq0$ from the synthesis integral.',
         'Give $x[0]$, and check it against the mean of the spectrum read directly from the figure.'],
  figure:()=>{const a=P.Axes({w:1080,h:280,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-0.3,2.7],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:56,r:28,t:32,b:40},xstep:Math.PI/2,ystep:1,xtickfmt:piFmt});
    a.poly([[-Math.PI,0],[-Math.PI/2,0],[-Math.PI/2,2],[Math.PI/2,2],[Math.PI/2,0],[Math.PI,0]],{color:C.mid});
    return a.svg();},
  sol:'<b>Given.</b> A rectangular spectrum, read from its plot rather than from a formula in the statement.<br>'
     +'<b>Find.</b> The sequence it belongs to.<br>'
     +'<b>Method.</b> The graph gives an ideal low-pass spectrum, so first read its height and cut-off from the axes. Then apply the synthesis integral for a rectangular spectrum.<br>'
     +'<b>Solution — part (a).</b> The figure shows a plateau of height $2$ on $|\\omega|\\le\\tfrac{\\pi}{2}$ and zero elsewhere, so$$X(e^{j\\omega})=\\begin{cases}2,&|\\omega|\\le\\tfrac{\\pi}{2},\\\\[2pt]0,&\\tfrac{\\pi}{2}<|\\omega|\\le\\pi.\\end{cases}$$'
     +'<b>Solution — part (b).</b> For $n\\neq0$,$$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi/2}^{\\pi/2}2\\,e^{j\\omega n}\\,\\d\\omega=\\frac{2\\sin(\\pi n/2)}{\\pi n}.$$'
     +'<b>Solution — part (c).</b> $x[0]=\\dfrac{1}{2\\pi}\\cdot2\\cdot\\pi=1$.<br>'
     +'<b>Check.</b> The area under the plateau, read from the figure, is height times width: $2\\times\\pi=2\\pi$. Dividing by $2\\pi$ gives the mean of the spectrum, $1$, matching $x[0]$ without evaluating the limit of part (b).',
  figSol:()=>{const x=n=>n===0?1:2*Math.sin(Math.PI*n/2)/(Math.PI*n);
    const a=P.Axes({w:1080,h:270,xr:[-8.6,8.6],yr:[-0.5,1.35],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:2,ystep:0.5});
    a.stem(disc(x,-8,8),{color:C.out,showZero:true}); return a.svg();},
  err:'Misreading the cut-off frequency as $\\pi/4$ instead of $\\pi/2$ by misjudging the tick spacing, which halves the argument in every later formula.',
  teach:'Have the height and the cut-off written down as two numbers, out loud, before the integral is set up. A figure read carelessly propagates one wrong number through the whole solution.' },

{ id:'D6-16', module:'M6', type:'dtft-inv',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=e^{-j\\omega}\\left(1+\\cos\\omega\\right).$$',
  parts:['Expand $X(e^{j\\omega})$ into a sum of terms $e^{-j\\omega n_0}$.',
         'Read off $x[n]$ from the expansion.',
         'Confirm the result at $\\omega=0$ and at $\\omega=\\pi$, against the original form.'],
  sol:'<b>Given.</b> A spectrum written as a product of a shift and a cosine bracket.<br>'
     +'<b>Find.</b> The sequence.<br>'
     +'<b>Method.</b> Rewrite the spectrum as powers of $e^{-j\\omega}$ because each power identifies a delayed unit sample. Expand $\\cos\\omega$ with Euler\'s relation, multiply by the leading $e^{-j\\omega}$, and collect like powers.<br>'
     +'<b>Solution — part (a).</b> $\\cos\\omega=\\tfrac12\\left(e^{j\\omega}+e^{-j\\omega}\\right)$, so$$X(e^{j\\omega})=e^{-j\\omega}+e^{-j\\omega}\\cos\\omega=e^{-j\\omega}+\\tfrac12\\left(1+e^{-2j\\omega}\\right)=\\tfrac12+e^{-j\\omega}+\\tfrac12e^{-2j\\omega}.$$'
     +'<b>Solution — part (b).</b>$$x[n]=\\tfrac12\\delta[n]+\\delta[n-1]+\\tfrac12\\delta[n-2].$$'
     +'<b>Check.</b> At $\\omega=0$: the original form gives $1\\cdot(1+1)=2$, and the expansion gives $\\tfrac12+1+\\tfrac12=2$. At $\\omega=\\pi$: the original form gives $(-1)(1-1)=0$, and the expansion gives $\\tfrac12+(-1)+\\tfrac12=0$. Both frequencies agree by two independent routes, which a check at $\\omega=0$ alone would not have caught — a shift error inside the bracket leaves $X(e^{j0})$ unchanged but moves $X(e^{j\\pi})$ away from zero.',
  figSol:()=>{const a=P.Axes({w:1080,h:260,xr:[-1.6,3.6],yr:[-0.25,1.35],xlabel:'n',ylabel:'x[n]',
      pad:{l:50,r:28,t:30,b:34},xstep:1,ystep:0.5});
    a.stem([[0,0.5],[1,1],[2,0.5]],{color:C.out,showZero:true}); return a.svg();},
  err:'Expanding $\\cos\\omega$ correctly but dropping the leading factor $e^{-j\\omega}$, and reporting $x[n]=\\tfrac12\\delta[n+1]+\\delta[n]+\\tfrac12\\delta[n-1]$ — the whole sequence one sample too early.',
  teach:'Two checks, at $\\omega=0$ and $\\omega=\\pi$, catch a shift error that a single check at $\\omega=0$ alone would miss entirely.' },

{ id:'D6-17', module:'M6', type:'dtft-prop',
  stem:'Let $x[n]$ be a real sequence with transform $X(e^{j\\omega})=\\displaystyle\\sum_n x[n]e^{-j\\omega n}$.',
  parts:['Prove that $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$, directly from the analysis sum.',
         'For $x[n]=\\left(\\tfrac13\\right)^{\\!n}u[n]$, give $X(e^{j\\pi/3})$ in the form $p+jq$, and give $X(e^{-j\\pi/3})$ the same way by direct substitution.',
         'Confirm that the two values of part (b) are complex conjugates, and say why one half of a period is enough to describe the spectrum of a real sequence but not of a complex one.'],
  sol:'<b>Given.</b> The general definition of the transform, applied first abstractly and then to one causal sequence.<br>'
     +'<b>Find.</b> A general identity and its confirmation at one specific frequency.<br>'
     +'<b>Method.</b> Start from the analysis sum because the required symmetry follows directly from conjugation. Conjugate term by term; since $x[n]$ is real, $x^{*}[n]=x[n]$, so only the exponential changes.<br>'
     +'<b>Solution — part (a).</b>$$X^{*}(e^{j\\omega})=\\sum_n x^{*}[n]e^{j\\omega n}=\\sum_n x[n]e^{-j(-\\omega)n}=X(e^{-j\\omega}),$$using $x^{*}[n]=x[n]$ in the middle step and simply reading $e^{j\\omega n}$ as $e^{-j(-\\omega)n}$ in the last.<br>'
     +'<b>Solution — part (b).</b> $X(e^{j\\omega})=\\dfrac{1}{1-\\tfrac13e^{-j\\omega}}$. At $\\omega=\\tfrac{\\pi}{3}$, $e^{-j\\pi/3}=\\tfrac12-j\\tfrac{\\sqrt3}{2}$, so $1-\\tfrac13e^{-j\\pi/3}=\\tfrac56+j\\tfrac{\\sqrt3}{6}$, and$$X\\!\\left(e^{j\\pi/3}\\right)=\\frac{1}{\\tfrac56+j\\tfrac{\\sqrt3}{6}}=\\frac{6}{5+j\\sqrt3}=\\frac{6(5-j\\sqrt3)}{28}=\\frac{15-3\\sqrt3\\,j}{14}.$$By the same substitution at $\\omega=-\\tfrac{\\pi}{3}$, $e^{j\\pi/3}=\\tfrac12+j\\tfrac{\\sqrt3}{2}$, so $1-\\tfrac13e^{j\\pi/3}=\\tfrac56-j\\tfrac{\\sqrt3}{6}$, and$$X\\!\\left(e^{-j\\pi/3}\\right)=\\frac{6}{5-j\\sqrt3}=\\frac{6(5+j\\sqrt3)}{28}=\\frac{15+3\\sqrt3\\,j}{14}.$$'
     +'<b>Solution — part (c).</b> The two values are $\\dfrac{15\\mp3\\sqrt3\\,j}{14}$, exact conjugates of one another, matching part (a) at this one pair of frequencies. Because $-\\pi\\le\\omega<0$ is fixed by $0\\le\\omega\\le\\pi$ through conjugation, a real sequence needs only half a period stated; a complex sequence has no such relation between the two halves, so both must be given.<br>'
     +'<b>Check.</b> $\\left|X(e^{j\\omega})\\right|^{2}=X(e^{j\\omega})X^{*}(e^{j\\omega})=\\dfrac{1}{1-\\tfrac23\\cos\\omega+\\tfrac19}$ depends on $\\omega$ only through $\\cos\\omega$, which is even, so $\\left|X(e^{j\\omega})\\right|$ is even at <em>every</em> $\\omega$ — a stronger, general statement than the single numerical match of part (c).',
  err:'Verifying conjugate symmetry by comparing only the two magnitudes, $\\left|X(e^{j\\pi/3})\\right|=\\left|X(e^{-j\\pi/3})\\right|$, without also checking that the phases are equal and opposite — magnitude agreement alone does not establish that the two values are conjugates.',
  teach:'Have the general closed-form argument of the Check step produced, not just the one numerical pair. It is the difference between a property verified once and a property proved for every frequency at once.' },

{ id:'D6-18', module:'M6', type:'dtft-prop',
  stem:'Let $x[n]=\\delta[n+1]-\\delta[n-1]$.',
  parts:['Give $X(e^{j\\omega})$, and confirm $X(e^{j0})=0$.',
         'Apply the differencing property to find $W(e^{j\\omega})$ for $w[n]=x[n]-x[n-1]$, and confirm it against $w[n]$ written out directly.',
         'Apply the accumulation property to find $Y(e^{j\\omega})$ for $y[n]=\\displaystyle\\sum_{k=-\\infty}^{n}x[k]$, and confirm it against $y[n]$ written out directly.'],
  sol:'<b>Given.</b> A two-sample sequence with zero sum.<br>'
     +'<b>Find.</b> Its first difference and its running sum, each two ways.<br>'
     +'<b>Method.</b> Use the differencing and accumulation properties because the two requested sequences apply those operations to $x[n]$. For differencing, $X(e^{j\\omega})=\\left(1-e^{-j\\omega}\\right)X(e^{j\\omega})$. For accumulation, $Y(e^{j\\omega})=\\dfrac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\displaystyle\\sum_k\\delta(\\omega-2\\pi k)$. Compute $X(e^{j0})$ first to determine whether the impulse term is present.<br>'
     +'<b>Solution — part (a).</b> $X(e^{j\\omega})=e^{j\\omega}-e^{-j\\omega}=2j\\sin\\omega$, and $X(e^{j0})=2j\\sin(0)=0$.<br>'
     +'<b>Solution — part (b).</b> $W(e^{j\\omega})=\\left(1-e^{-j\\omega}\\right)\\left(e^{j\\omega}-e^{-j\\omega}\\right)=e^{j\\omega}-1-e^{-j\\omega}+e^{-2j\\omega}$. Directly, $w[n]=x[n]-x[n-1]$ gives $w[-1]=1$, $w[0]=-1$, $w[1]=-1$, $w[2]=1$, that is $w[n]=\\delta[n+1]-\\delta[n]-\\delta[n-1]+\\delta[n-2]$, whose transform is $e^{j\\omega}-1-e^{-j\\omega}+e^{-2j\\omega}$ — the same expression.<br>'
     +'<b>Solution — part (c).</b> Because $X(e^{j0})=0$, the impulse term vanishes and$$Y(e^{j\\omega})=\\frac{2j\\sin\\omega}{1-e^{-j\\omega}}.$$Multiplying numerator and denominator by $e^{j\\omega}$, $Y=\\dfrac{e^{2j\\omega}-1}{e^{j\\omega}-1}=e^{j\\omega}+1$. Directly, $y[n]=\\displaystyle\\sum_{k\\le n}x[k]$ equals $1$ for $n=-1,0$ and $0$ elsewhere, so $y[n]=\\delta[n+1]+\\delta[n]$, whose transform is $e^{j\\omega}+1$ — the same expression.<br>'
     +'<b>Check.</b> The property formula for accumulation carries an impulse train that would otherwise have appeared here; $X(e^{j0})=0$ is exactly the condition that removes it, and the algebraic simplification of $Y$ produces a plain finite sum with no leftover impulse, consistent with that.',
  err:'Applying the accumulation formula with the impulse term left in place, without first checking $X(e^{j0})=0$ — which is what licenses dropping it — and reporting a spectrum that carries an impulse train the direct computation of $y[n]$ does not have.',
  teach:'Make $X(e^{j0})=0$ a checked number, not an assumption. The impulse term in the accumulation property is not optional in general; it is optional here for a specific, checkable reason.' },

{ id:'D6-19', module:'M6', type:'dtft-prop',
  stem:'Let $x[n]=2\\left(\\tfrac12\\right)^{\\!n}u[n]$.',
  parts:['Compute the energy of $x[n]$ directly, in the time domain.',
         'Write Parseval\'s relation for $X(e^{j\\omega})$, and state what $\\left|X(e^{j\\omega})\\right|^{2}$ represents.',
         'Using $\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}\\dfrac{\\d\\omega}{b-\\cos\\omega}=\\dfrac{1}{\\sqrt{b^{2}-1}}$ for $b>1$, evaluate the frequency-side integral and confirm it matches part (a).'],
  sol:'<b>Given.</b> A scaled causal geometric sequence.<br>'
     +'<b>Find.</b> Its energy, counted in both domains.<br>'
     +'<b>Method.</b> Use Parseval because the question asks for the same energy in time and frequency. Sum $\\left|x[n]\\right|^{2}$ directly, then write $\\left|X(e^{j\\omega})\\right|^{2}$ as $c/(b-\\cos\\omega)$ and apply the stated integral.<br>'
     +'<b>Solution — part (a).</b>$$\\sum_n\\left|x[n]\\right|^{2}=4\\sum_{n=0}^{\\infty}\\left(\\tfrac14\\right)^{n}=4\\cdot\\frac{1}{1-1/4}=\\frac{16}{3}.$$'
     +'<b>Solution — part (b).</b>$$\\sum_n\\left|x[n]\\right|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}\\left|X(e^{j\\omega})\\right|^{2}\\,\\d\\omega,$$where $\\left|X(e^{j\\omega})\\right|^{2}$ is the energy-density spectrum: the energy $x[n]$ carries near each frequency $\\omega$.<br>'
     +'<b>Solution — part (c).</b> $X(e^{j\\omega})=\\dfrac{2}{1-\\tfrac12e^{-j\\omega}}$, so $\\left|X(e^{j\\omega})\\right|^{2}=\\dfrac{4}{1-\\cos\\omega+\\tfrac14}=\\dfrac{4}{\\tfrac54-\\cos\\omega}$. With $b=\\tfrac54$,$$\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\frac{4\\,\\d\\omega}{\\tfrac54-\\cos\\omega}=4\\cdot\\frac{1}{\\sqrt{\\left(\\tfrac54\\right)^{2}-1}}=4\\cdot\\frac{1}{\\sqrt{9/16}}=4\\cdot\\frac43=\\frac{16}{3},$$matching part (a).<br>'
     +'<b>Check.</b> Scaling a sequence by $2$ scales its energy by $2^{2}=4$: the energy of $\\left(\\tfrac12\\right)^{n}u[n]$ alone, unscaled, is $\\dfrac{1}{1-1/4}=\\dfrac43$, and $4\\times\\dfrac43=\\dfrac{16}{3}$ — the same number, reached through a property of energy under scaling rather than by repeating either sum or integral above.',
  err:'Dropping the $\\tfrac{1}{2\\pi}$ factor in part (b), which multiplies the frequency-side answer by $2\\pi$ and leaves it disagreeing with the time-domain energy by a large, easily unnoticed factor.',
  teach:'Require the scaling check. It does not use the integral identity from part (c), so it can reveal an error in that identity as well as an error in its use.' },

{ id:'D6-20', module:'M6', type:'dtft-prop',
  stem:'Let $x[n]$ be an arbitrary sequence with transform $X(e^{j\\omega})=\\displaystyle\\sum_n x[n]e^{-j\\omega n}$, convergent for every $\\omega$.',
  parts:['Prove that $X\\!\\left(e^{j(\\omega+2\\pi)}\\right)=X(e^{j\\omega})$, directly from the analysis sum.',
         'Two signal generators produce the sequences $\\cos(2.3\\,n)$ and $\\cos\\!\\left((2.3-2\\pi)n\\right)$. Determine whether the two generators produce the same sequence, and say what part (a) implies about telling them apart from their output alone.',
         'State the highest discrete-time frequency that exists, and explain in one sentence why continuous time has no such bound.'],
  sol:'<b>Given.</b> The transform of an arbitrary convergent sequence, and two signal generators at frequencies $2\\pi$ apart.<br>'
     +'<b>Find.</b> A general periodicity proof, and its consequence for the two generators.<br>'
     +'<b>Method.</b> Prove periodicity from the analysis definition because the integer time index is the source of the repetition. Substitute $\\omega+2\\pi$ into the sum and simplify the extra exponential factor.<br>'
     +'<b>Solution — part (a).</b>$$X\\!\\left(e^{j(\\omega+2\\pi)}\\right)=\\sum_n x[n]e^{-j(\\omega+2\\pi)n}=\\sum_n x[n]e^{-j\\omega n}\\underbrace{e^{-j2\\pi n}}_{=\\,1\\text{ for integer }n}=X(e^{j\\omega}).$$'
     +'<b>Solution — part (b).</b> For every integer $n$, $\\cos\\!\\left((2.3-2\\pi)n\\right)=\\cos(2.3n-2\\pi n)=\\cos(2.3n)\\cos(2\\pi n)+\\sin(2.3n)\\sin(2\\pi n)=\\cos(2.3n)$, since $\\cos(2\\pi n)=1$ and $\\sin(2\\pi n)=0$ at every integer $n$. The two generators produce <em>exactly</em> the same sequence, sample for sample. Since $X$ is determined entirely by the sequence, part (a) already guarantees this: two frequencies $2\\pi$ apart give the same spectrum, and therefore the same sequence by the synthesis equation, so no measurement made on the output alone can tell the two generators apart.<br>'
     +'<b>Solution — part (c).</b> The highest discrete-time frequency is $\\omega=\\pi$, where $e^{j\\pi n}=(-1)^{n}$ alternates every sample; frequencies beyond $\\pi$ are the same sequences as frequencies already inside $-\\pi\\le\\omega\\le\\pi$. Continuous time has no such bound because $e^{j\\Omega t}$ for real $t$ is a genuinely different function for every distinct $\\Omega$, with nothing analogous to $e^{-j2\\pi t}=1$ forcing a repeat.<br>'
     +'<b>Check.</b> At $n=3$: $\\cos(2.3\\times3)=\\cos(6.9)$ and $\\cos\\!\\left((2.3-2\\pi)\\times3\\right)=\\cos(-11.949\\ldots)$; reducing both arguments modulo $2\\pi$ gives $6.9-2\\pi\\approx0.6168$ and $-11.949\\ldots+2\\times2\\pi\\approx-0.6168$, and $\\cos(0.6168)=\\cos(-0.6168)\\approx0.8163$ by the evenness of cosine — the two generators agree at this sample by direct numerical evaluation, not only by the symbolic argument of part (b).',
  err:'Concluding from $2.3>2.3-2\\pi$ (which is negative) that the two generators are at genuinely different frequencies, and treating $\\omega=2.3$ as though it already lay outside any periodic pattern rather than reducing it into $-\\pi\\le\\omega\\le\\pi$ first.',
  teach:'Ask which representative in $-\\pi\\le\\omega\\le\\pi$ corresponds to $2.3$ rad/sample. It is below $\\pi\\approx3.1416$, so $2.3$ already lies in the interval. The value $2.3-2\\pi\\approx-3.983$ must instead be increased by one period. This check fixes the direction of the reduction.' },

/* ----------------------------------------------------------------------
   Full-length questions. Several transforms under one statement, or one
   sequence carried through a filter.
   ---------------------------------------------------------------------- */

{ id:'D6-21', module:'M6', type:'full', src:'Final Q3',
  stem:'Determine the discrete-time Fourier transforms of the following signals. In parts (b) and (c), $\\mathcal{F}\\{x[n]\\}$ is the triangular spectrum plotted below: it equals $1$ at $\\omega=0$ and falls linearly to zero at $\\omega=\\pm\\tfrac{\\pi}{2}$.',
  parts:['$z[n]=u[-n+4]-u[-n-1]$.',
         '$y[n]=x[n]p[n]$, where $p[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-4k]$.',
         '$y[n]=x[n]p[n]$, where $p[n]=(-1)^{n}$.'],
  figure:()=>{const a=P.Axes({w:1080,h:250,xr:[-3.4,3.4],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:60,r:28,t:30,b:38},xstep:1,ystep:0.5});
    a.poly([[-3.4,0],[-Math.PI/2,0],[0,1],[Math.PI/2,0],[3.4,0]],{color:C.in}); return a.svg();},
  sol:'<b>Given.</b> A reversed pair of steps, and a sequence with a known triangular spectrum multiplied by two different sampling patterns.<br>'
     +'<b>Find.</b> Three transforms.<br>'
     +'<b>Method.</b> Simplify (a) to a finite rectangular sequence because its transform is known. For (b) and (c), use periodic convolution because each new sequence is a time-domain product; the impulse factors then produce shifted copies of $X$.<br>'
     +'<b>Solution — part (a).</b> The step $u[-n+4]$ is $1$ for $n\\le4$ and $u[-n-1]$ is $1$ for $n\\le-1$, so the difference is $1$ for $0\\le n\\le4$ and zero elsewhere. Then$$Z(e^{j\\omega})=\\sum_{n=0}^{4}e^{-j\\omega n}=\\frac{1-e^{-j5\\omega}}{1-e^{-j\\omega}}=e^{-j2\\omega}\\,\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}.$$'
     +'<b>Solution — part (b).</b> An impulse train of period $4$ has transform$$P(e^{j\\omega})=\\frac{2\\pi}{4}\\sum_{k}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{4}\\right)=\\frac{\\pi}{2}\\sum_{k}\\delta\\!\\left(\\omega-\\frac{\\pi k}{2}\\right).$$Periodic convolution with $\\tfrac{1}{2\\pi}$ then gives four shifted copies of $X$, each scaled by $\\tfrac14$:$$Y(e^{j\\omega})=\\frac14\\sum_{k=0}^{3}X\\!\\left(e^{j(\\omega-\\pi k/2)}\\right).$$Since $X$ occupies $|\\omega|<\\tfrac{\\pi}{2}$ and the copies are spaced $\\tfrac{\\pi}{2}$ apart, adjacent copies just touch at their zeros and do not overlap.<br>'
     +'<b>Solution — part (c).</b> Here $p[n]=(-1)^{n}=e^{j\\pi n}$, a single exponential, so the spectrum is shifted rather than replicated:$$Y(e^{j\\omega})=X\\!\\left(e^{j(\\omega-\\pi)}\\right),$$the same triangle centred at $\\omega=\\pi$ instead of at $\\omega=0$. A low-pass shape has become a high-pass one.<br>'
     +'<b>Check.</b> In (a), $Z(e^{j0})=5$ must be the sum of the samples, and the limit of $\\dfrac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}$ as $\\omega\\to0$ is indeed $5$. In (b), $Y(e^{j0})=\\tfrac14\\sum_kX\\!\\left(e^{-j\\pi k/2}\\right)=\\tfrac14(1+0+0+0)=\\tfrac14$, which is also $y[0]$ summed: the sampling keeps every fourth sample of $x$, so the sum of $y$ is a quarter of what $x$ would give if $x$ were smooth on that scale. In (c) the total spectral area is unchanged, only relocated, as a pure shift must leave it.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.08,0.42],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'Y(e^{j\\omega})\\;\\text{of (b)}',
      pad:{l:64,r:26,t:28,b:38},xstep:1,ystep:0.25});
      const tri=w=>{const a1=Math.abs(w); return a1<Math.PI/2 ? 0.25*(1-a1/(Math.PI/2)) : 0;};
      a.curve(w=>{let s=0; for(let k=-4;k<=4;k++) s+=tri(w-k*Math.PI/2); return s;},{color:C.mid});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'Y(e^{j\\omega})\\;\\text{of (c)}',
      pad:{l:64,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.poly([[-3.4,1-(Math.PI-3.4>0?0:0)],[-Math.PI,1],[-Math.PI/2,0],[Math.PI/2,0],[Math.PI,1],[3.4,1]],{color:C.out});
      return a.svg();})()),
  err:'Reading $u[-n+4]$ as a signal that starts at $n=4$ and runs forwards. The argument is reversed, so the step is on for every $n$ up to and including $4$, and it is the second step that cuts the sequence off from below.',
  teach:'Compare parts (b) and (c) directly. A train of impulses replicates the spectrum, while a single exponential shifts it. Then ask about $p[n]=\\cos(\\pi n/2)$: it produces two shifted copies at half height, which distinguishes it from both cases.' },

{ id:'D6-22', module:'M6', type:'full', src:'Final Q3',
  stem:'Please solve the following problems, giving every answer in $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Determine the DTFT of $x[n]=\\left(\\tfrac13\\right)^{|n|}$.',
         'Plot the DTFT of $x[n]=\\cos\\!\\left(\\tfrac{5\\pi}{2}n\\right)+2\\cos\\!\\left(\\tfrac{4\\pi}{3}n\\right)$.',
         'Plot the DTFT of $x[n]=\\dfrac{\\cos(\\pi n)}{\\pi n}\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right)$.'],
  sol:'<b>Given.</b> A two-sided geometric sequence, a sum of two cosines at frequencies above $\\pi$, and a modulated sinc.<br>'
     +'<b>Find.</b> Three transforms, all reduced into one period.<br>'
     +'<b>Method.</b> For (a), split at the origin because the absolute value changes the exponential on the two sides. For (b) and (c), reduce every frequency into $-\\pi\\le\\omega\\le\\pi$ because the discrete-time spectrum is periodic.<br>'
     +'<b>Solution — part (a).</b> Split and sum two geometric series:$$X(e^{j\\omega})=\\sum_{n=0}^{\\infty}\\left(\\tfrac13\\right)^{n}e^{-j\\omega n}+\\sum_{n=1}^{\\infty}\\left(\\tfrac13\\right)^{n}e^{j\\omega n}=\\frac{1}{1-\\tfrac13e^{-j\\omega}}+\\frac{\\tfrac13e^{j\\omega}}{1-\\tfrac13e^{j\\omega}}.$$Combining over a common denominator,$$X(e^{j\\omega})=\\frac{1-\\tfrac19}{1-\\tfrac23\\cos\\omega+\\tfrac19}=\\frac{4}{5-3\\cos\\omega},$$real and even, as the transform of a real even sequence must be.<br>'
     +'<b>Solution — part (b).</b> Reduce each frequency modulo $2\\pi$:$$\\tfrac{5\\pi}{2}-2\\pi=\\tfrac{\\pi}{2},\\qquad\\tfrac{4\\pi}{3}-2\\pi=-\\tfrac{2\\pi}{3}.$$So the sequence is $\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)+2\\cos\\!\\left(\\tfrac{2\\pi}{3}n\\right)$, and over one period$$X(e^{j\\omega})=\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{2}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{2}\\right)\\right]+2\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{2\\pi}{3}\\right)+\\delta\\!\\left(\\omega+\\tfrac{2\\pi}{3}\\right)\\right].$$'
     +'<b>Solution — part (c).</b> Since $\\cos(\\pi n)=(-1)^{n}=e^{j\\pi n}$ for integer $n$,$$x[n]=e^{j\\pi n}\\,\\frac{\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right)}{\\pi n}.$$The sinc alone has transform $1$ on $|\\omega|<\\tfrac{\\pi}{3}$, and the exponential shifts that band to be centred at $\\pi$. Folding into $-\\pi\\le\\omega\\le\\pi$,$$X(e^{j\\omega})=\\begin{cases}1,&\\tfrac{2\\pi}{3}<|\\omega|\\le\\pi\\\\0,&|\\omega|<\\tfrac{2\\pi}{3},\\end{cases}$$an ideal high-pass filter with cut-off $\\tfrac{2\\pi}{3}$.<br>'
     +'<b>Check.</b> In (a), $X(e^{j0})=\\dfrac{4}{2}=2$, and summing directly, $1+2\\sum_{n\\ge1}\\left(\\tfrac13\\right)^{n}=1+2\\cdot\\tfrac12=2$. In (b) the frequency $\\tfrac{5\\pi}{2}$ is above $\\pi$ and cannot be drawn where written; reducing it is not optional, because $\\cos\\!\\left(\\tfrac{5\\pi}{2}n\\right)$ and $\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$ are the same sequence sample for sample. In (c) the shifted band keeps its total width $\\tfrac{2\\pi}{3}$, split into two halves at the edges of the period.',
  figSol:()=>
    (()=>{const a=P.Axes({w:1080,h:260,xr:[-3.4,3.4],yr:[-1.5,8],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})\\;\\text{of (b)}',
      pad:{l:64,r:28,t:30,b:38},xstep:1,ystep:2});
      [[-2*Math.PI/3,2*Math.PI],[-Math.PI/2,Math.PI],[Math.PI/2,Math.PI],[2*Math.PI/3,2*Math.PI]]
        .forEach(p=>a.impulse(p[0],p[1],{color:C.in}));
      return a.svg();})()
    +(()=>{const a=P.Axes({w:1080,h:260,xr:[-3.4,3.4],yr:[-0.15,1.3],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})\\;\\text{of (c)}',
      pad:{l:64,r:28,t:30,b:38},xstep:1,ystep:0.5});
      a.poly([[-3.4,1],[-2*Math.PI/3,1],[-2*Math.PI/3,0],[2*Math.PI/3,0],[2*Math.PI/3,1],[3.4,1]],{color:C.out});
      return a.svg();})(),
  err:'Plotting impulses at $\\tfrac{5\\pi}{2}$ and $\\tfrac{4\\pi}{3}$ in part (b) without reducing them. Discrete-time frequencies live on a circle of circumference $2\\pi$, so a frequency above $\\pi$ is the same as one below it, and drawing it outside the period says the sequence has content it does not have.',
  teach:'Part (c) rewards recognising $\\cos(\\pi n)$ as $(-1)^{n}$ rather than treating it as a cosine to be convolved. Ask for both routes: the convolution gives the same answer and takes five times as long, which is the argument for learning the shortcut.' },

{ id:'D6-23', module:'M6', type:'full', src:'Final Q3',
  stem:'Consider the discrete-time signal$$x[n]=\\frac{\\sin\\!\\left(\\tfrac{3\\pi}{5}n\\right)+2\\sin\\!\\left(\\tfrac{\\pi}{5}n\\right)}{\\pi n},$$which is input to an LTI system with the impulse response$$h[n]=2\\,\\frac{\\cos(\\pi n)}{\\pi n}\\sin\\!\\left(\\tfrac{4\\pi}{5}n\\right).$$At the output of the LTI system, the $y[n]$ signal is observed.',
  parts:['Plot the DTFT of $x[n]$ in $-\\pi\\le\\omega\\le\\pi$.',
         'Plot the DTFT of $h[n]$ in $-\\pi\\le\\omega\\le\\pi$.',
         'Plot the DTFT of $y[n]$ in $-\\pi\\le\\omega\\le\\pi$.'],
  sol:'<b>Given.</b> A sum of two sincs into a high-pass filter built from a modulated sinc.<br>'
     +'<b>Find.</b> The three spectra.<br>'
     +'<b>Method.</b> Use the ideal-band pair because every term has the form $\\dfrac{\\sin(Wn)}{\\pi n}$. Add the corresponding rectangles for $x$, use modulation to shift the spectrum of $h$ by $\\pi$, and use the convolution property to multiply them for $y$.<br>'
     +'<b>Solution — part (a).</b> The first term gives a rectangle of height $1$ on $|\\omega|<\\tfrac{3\\pi}{5}$ and the second a rectangle of height $2$ on $|\\omega|<\\tfrac{\\pi}{5}$. Adding,$$X(e^{j\\omega})=\\begin{cases}3,&|\\omega|<\\tfrac{\\pi}{5}\\\\1,&\\tfrac{\\pi}{5}<|\\omega|<\\tfrac{3\\pi}{5}\\\\0,&\\tfrac{3\\pi}{5}<|\\omega|\\le\\pi,\\end{cases}$$a stepped low-pass shape.<br>'
     +'<b>Solution — part (b).</b> Again $\\cos(\\pi n)=e^{j\\pi n}$, so$$h[n]=2e^{j\\pi n}\\,\\frac{\\sin\\!\\left(\\tfrac{4\\pi}{5}n\\right)}{\\pi n},$$a rectangle of height $2$ and half-width $\\tfrac{4\\pi}{5}$, shifted to be centred at $\\pi$. Folded into one period,$$H(e^{j\\omega})=\\begin{cases}2,&\\tfrac{\\pi}{5}<|\\omega|\\le\\pi\\\\0,&|\\omega|<\\tfrac{\\pi}{5},\\end{cases}$$an ideal high-pass filter of gain $2$ with cut-off $\\tfrac{\\pi}{5}$.<br>'
     +'<b>Solution — part (c).</b> Multiply band by band. On $|\\omega|<\\tfrac{\\pi}{5}$ the filter is zero, so the tall centre of $X$ is removed entirely. On $\\tfrac{\\pi}{5}<|\\omega|<\\tfrac{3\\pi}{5}$ we have $1\\cdot2=2$. Above $\\tfrac{3\\pi}{5}$ the input is zero. So$$Y(e^{j\\omega})=\\begin{cases}2,&\\tfrac{\\pi}{5}<|\\omega|<\\tfrac{3\\pi}{5}\\\\0,&\\text{otherwise in }-\\pi\\le\\omega\\le\\pi,\\end{cases}$$a band-pass result.<br>'
     +'<b>Check.</b> The output band is the intersection of the input band with the passband, $\\left(\\tfrac{\\pi}{5},\\tfrac{3\\pi}{5}\\right)$, and its height is the product of the two heights there, $1\\cdot2=2$. Both cut-offs of $Y$ come from somewhere: the lower from the filter and the upper from the input. A cascade of a low-pass input spectrum with a high-pass filter can produce nothing else.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.3,3.6],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:60,r:26,t:28,b:38},xstep:1,ystep:1});
      const p=Math.PI;
      a.poly([[-3.4,0],[-3*p/5,0],[-3*p/5,1],[-p/5,1],[-p/5,3],[p/5,3],[p/5,1],[3*p/5,1],[3*p/5,0],[3.4,0]],{color:C.in});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.3,3.6],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'Y(e^{j\\omega})',
      pad:{l:60,r:26,t:28,b:38},xstep:1,ystep:1});
      const p=Math.PI;
      a.poly([[-3.4,0],[-3*p/5,0],[-3*p/5,2],[-p/5,2],[-p/5,0],[p/5,0],[p/5,2],[3*p/5,2],[3*p/5,0],[3.4,0]],{color:C.out});
      return a.svg();})()),
  err:'Adding the two rectangles of part (a) as though they had the same width, giving a single rectangle of height $3$ on $|\\omega|<\\tfrac{3\\pi}{5}$. The narrower one contributes only where it is non-zero, so the result is stepped, and the step is exactly what the filter later removes.',
  teach:'Ask what the output would be if the filter cut-off were $\\tfrac{3\\pi}{5}$ instead of $\\tfrac{\\pi}{5}$. The output is zero, which shows that the stated result depends on the cut-off lying strictly inside the input band.' },

{ id:'D6-24', module:'M6', type:'full', src:'Final Q3',
  stem:'Determine the discrete-time Fourier transforms of the following signals.',
  parts:['$x[n]=\\left(\\tfrac12\\right)^{n}u[n-1]$.',
         '$x[n]=u[n+2]-u[n-3]$.',
         '$x[n]=\\left(\\tfrac12\\right)^{|n|}$.'],
  sol:'<b>Given.</b> A delayed one-sided geometric sequence, a finite rectangle, and a two-sided geometric sequence.<br>'
     +'<b>Find.</b> Three transforms.<br>'
     +'<b>Method.</b> Use geometric-series sums because all three sequences contain powers of the same base. Set the correct starting and ending index for each sequence before applying the formula.<br>'
     +'<b>Solution — part (a).</b> The step starts the sum at $n=1$:$$X(e^{j\\omega})=\\sum_{n=1}^{\\infty}\\left(\\tfrac12\\right)^{n}e^{-j\\omega n}=\\frac{\\tfrac12e^{-j\\omega}}{1-\\tfrac12e^{-j\\omega}}.$$'
     +'<b>Solution — part (b).</b> The two steps leave $x[n]=1$ for $-2\\le n\\le2$, five samples centred on the origin:$$X(e^{j\\omega})=\\sum_{n=-2}^{2}e^{-j\\omega n}=\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)},$$real and even, because the sequence is symmetric about $n=0$.<br>'
     +'<b>Solution — part (c).</b> Splitting at the origin as in the standard two-sided case,$$X(e^{j\\omega})=\\frac{1-\\tfrac14}{1-\\cos\\omega+\\tfrac14}=\\frac{3}{5-4\\cos\\omega}.$$'
     +'<b>Check.</b> Each at $\\omega=0$ must give the sum of the samples. In (a): $\\dfrac{1/2}{1/2}=1$, and $\\sum_{n\\ge1}\\left(\\tfrac12\\right)^{n}=1$. In (b): the limit of $\\dfrac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}$ is $5$, and there are five samples of height $1$. In (c): $\\dfrac{3}{1}=3$, and $1+2\\sum_{n\\ge1}\\left(\\tfrac12\\right)^{n}=1+2=3$. The evenness in (b) and (c) and the complex phase in (a) are also right, since only (a) is asymmetric about the origin.',
  err:'Starting the sum in part (a) at $n=0$ and reporting $\\dfrac{1}{1-\\tfrac12e^{-j\\omega}}$. The step is $u[n-1]$, so the first non-zero sample is at $n=1$, and the transform carries the extra factor $\\tfrac12e^{-j\\omega}$.',
  teach:'Compare the three transforms and ask which are real. The two symmetric sequences have real transforms. The delayed sequence does not, because of its shift rather than its decay. This comparison applies the symmetry property directly.' },

{ id:'D6-25', module:'M6', type:'full', src:'Final Q3',
  stem:'A sequence $x[n]$ has the discrete-time Fourier transform $X(e^{j\\omega})$. Express the DTFT of each of the following in terms of $X(e^{j\\omega})$.',
  parts:['$y[n]=x[n-3]$.',
         '$y[n]=(-1)^{n}x[n]$.',
         '$y[n]=x[n]-x[n-1]$, and state the value of $Y$ at $\\omega=0$.'],
  sol:'<b>Given.</b> One sequence and three operations on it.<br>'
     +'<b>Find.</b> The transform after each operation.<br>'
     +'<b>Method.</b> Start from the analysis sum because each requested relation changes the time index. Apply the stated shift, reversal, or modulation and then change the summation index to identify the new spectrum.<br>'
     +'<b>Solution — part (a).</b> Substituting $m=n-3$,$$Y(e^{j\\omega})=\\sum_{n}x[n-3]e^{-j\\omega n}=\\sum_{m}x[m]e^{-j\\omega(m+3)}=e^{-j3\\omega}X(e^{j\\omega}).$$The magnitude is unchanged and the phase tilts by $-3\\omega$.<br>'
     +'<b>Solution — part (b).</b> Since $(-1)^{n}=e^{j\\pi n}$, this is a modulation:$$Y(e^{j\\omega})=X\\!\\left(e^{j(\\omega-\\pi)}\\right),$$the whole spectrum shifted by $\\pi$. Low frequencies and high frequencies exchange places.<br>'
     +'<b>Solution — part (c).</b> By linearity and part (a) with a shift of one,$$Y(e^{j\\omega})=\\left(1-e^{-j\\omega}\\right)X(e^{j\\omega}),$$and at $\\omega=0$ the factor vanishes, so $Y(e^{j0})=0$ whatever $X$ is.<br>'
     +'<b>Check.</b> Part (c) can be read in the time domain: $\\sum_ny[n]$ telescopes to zero for any sequence that decays at both ends, and $Y(e^{j0})$ is exactly that sum. Part (b) is consistent with (c) as well: applying (b) twice returns the original, since a shift by $2\\pi$ is no shift at all, and $\\left[(-1)^{n}\\right]^{2}=1$.',
  err:'Writing the answer to (b) as $X\\!\\left(e^{j\\omega}\\right)e^{-j\\pi n}$, mixing a time variable into a frequency-domain expression. After the transform there is no $n$ left; the modulation acts on the argument of $X$, not as a factor in front of it.',
  teach:'In part (c), identify the operator as a discrete difference. Its zero at $\\omega=0$ means that it removes constants, which is the same condition as $\\sum h[n]=0$ from Module 3.' },

{ id:'D6-26', module:'M6', type:'full', src:'Final Q3',
  stem:'Determine the inverse discrete-time Fourier transform of each of the following spectra, each specified over $-\\pi\\le\\omega\\le\\pi$ and repeating with period $2\\pi$.',
  parts:['$X(e^{j\\omega})=1$ for $|\\omega|<\\tfrac{\\pi}{4}$ and zero otherwise.',
         '$X(e^{j\\omega})=\\cos(2\\omega)$.',
         '$X(e^{j\\omega})=\\dfrac{1}{\\left(1-\\tfrac13e^{-j\\omega}\\right)^{2}}$.'],
  sol:'<b>Given.</b> An ideal low-pass spectrum, a cosine in $\\omega$, and a double pole.<br>'
     +'<b>Find.</b> The three sequences.<br>'
     +'<b>Method.</b> Choose the inverse method that matches each spectrum. Use synthesis for the rectangular spectrum in (a), match the exponentials in (b) to shifted impulses, and apply the repeated-pole pair in (c).<br>'
     +'<b>Solution — part (a).</b>$$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi/4}^{\\pi/4}e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\cdot\\frac{2\\sin\\!\\left(\\tfrac{\\pi n}{4}\\right)}{n}=\\frac{\\sin\\!\\left(\\tfrac{\\pi}{4}n\\right)}{\\pi n},$$with $x[0]=\\tfrac14$ by taking the limit.<br>'
     +'<b>Solution — part (b).</b> Write $\\cos(2\\omega)=\\tfrac12e^{j2\\omega}+\\tfrac12e^{-j2\\omega}$. Comparing with the analysis sum $X=\\sum_nx[n]e^{-j\\omega n}$, the term $e^{-j\\omega n}$ appears with $n=2$ and $n=-2$, so$$x[n]=\\tfrac12\\delta[n-2]+\\tfrac12\\delta[n+2].$$'
     +'<b>Solution — part (c).</b> The pair $\\left(n+1\\right)a^{n}u[n]\\leftrightarrow\\dfrac{1}{\\left(1-ae^{-j\\omega}\\right)^{2}}$ with $a=\\tfrac13$ gives$$x[n]=(n+1)\\left(\\tfrac13\\right)^{n}u[n].$$'
     +'<b>Check.</b> In (a), $x[0]=\\tfrac14$ agrees with $\\tfrac{1}{2\\pi}\\int_{-\\pi/4}^{\\pi/4}\\d\\omega=\\tfrac{1}{2\\pi}\\cdot\\tfrac{\\pi}{2}$. In (b), $X(e^{j0})=\\cos0=1$ must be the sum of the samples, and $\\tfrac12+\\tfrac12=1$. In (c), $X(e^{j0})=\\dfrac{1}{(1-\\tfrac13)^{2}}=\\tfrac94$, and summing directly, $\\sum_{n\\ge0}(n+1)\\left(\\tfrac13\\right)^{n}=\\dfrac{1}{(1-\\tfrac13)^{2}}=\\tfrac94$.',
  err:'Reading part (b) as a continuous function to be integrated. It is a finite sum of exponentials in $\\omega$, so the sequence is read off by inspection; integrating gives the same answer after considerably more work, and usually a sign error.',
  teach:'Use part (b) to establish a general method: a finite trigonometric polynomial in $\\omega$ corresponds to a finite sequence that can be read term by term. Then apply the method to $1+2\\cos\\omega$.' },

{ id:'D6-27', module:'M6', type:'full', src:'Final Q3',
  stem:'Let $x[n]=\\dfrac{\\sin\\!\\left(\\tfrac{\\pi}{3}n\\right)}{\\pi n}$.',
  parts:['Give $X(e^{j\\omega})$ over $-\\pi\\le\\omega\\le\\pi$ and state $x[0]$.',
         'Calculate the total energy of $x[n]$ using Parseval.',
         'Let $y[n]=(-1)^{n}x[n]$. Give $Y(e^{j\\omega})$ and its energy.'],
  sol:'<b>Given.</b> An ideal low-pass sequence with cut-off $\\tfrac{\\pi}{3}$.<br>'
     +'<b>Find.</b> Its spectrum, its energy, and the effect of modulating it.<br>'
     +'<b>Method.</b> Use the sinc pair because it converts the sequence into a rectangular spectrum. Then use Parseval because the required energy becomes the area of the squared rectangle.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=\\begin{cases}1,&|\\omega|<\\tfrac{\\pi}{3}\\\\0,&\\tfrac{\\pi}{3}<|\\omega|\\le\\pi,\\end{cases}$$and $x[0]=\\dfrac{1}{2\\pi}\\int_{-\\pi/3}^{\\pi/3}\\d\\omega=\\dfrac13$, which is also the limit of $\\dfrac{\\sin(\\pi n/3)}{\\pi n}$ as $n\\to0$.<br>'
     +'<b>Solution — part (b).</b>$$E=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}\\left|X(e^{j\\omega})\\right|^{2}\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\pi/3}^{\\pi/3}1\\,\\d\\omega=\\frac{2\\pi/3}{2\\pi}=\\frac13\\;\\text{J}.$$'
     +'<b>Solution — part (c).</b> Modulating by $(-1)^{n}$ shifts the spectrum by $\\pi$, so$$Y(e^{j\\omega})=\\begin{cases}1,&\\tfrac{2\\pi}{3}<|\\omega|\\le\\pi\\\\0,&|\\omega|<\\tfrac{2\\pi}{3},\\end{cases}$$a high-pass band of the same total width $\\tfrac{2\\pi}{3}$. Its energy is therefore the same, $\\tfrac13$ J. Multiplying by $\\pm1$ cannot change $|y[n]|$, so the energy could not have changed.<br>'
     +'<b>Check.</b> The energy equals $x[0]$ here, both being $\\tfrac13$, and that is not a coincidence: for an ideal low-pass sequence $\\sum_n x^{2}[n]$ and $x[0]$ are both $\\dfrac{\\omega_c}{\\pi}$, because $x*x=x$ for an ideal filter — convolving an ideal filter with itself reproduces it. Part (c) confirms the general rule that modulation by $(-1)^{n}$ preserves energy exactly, in contrast with the continuous-time cosine, which halves it.',
  err:'Halving the energy in part (c) by analogy with modulation by $\\cos(\\omega_ct)$ in continuous time. Multiplying by $(-1)^{n}$ is multiplying by a single exponential, not by a cosine: there is one shifted copy, not two at half height, so no energy is lost.',
  teach:'Derive the identity $E=x[0]$ for an ideal filter from Parseval and $X^{2}=X$. It then provides a one-line check for any computed ideal-filter energy.' },

{ id:'D6-28', module:'M6', type:'full', src:'Final Q3',
  stem:'An LTI system has the impulse response $h[n]=\\left(\\tfrac13\\right)^{n}u[n]$ and is driven by the input $x[n]=\\left(\\tfrac12\\right)^{n}u[n]$.',
  parts:['Give $X(e^{j\\omega})$ and $H(e^{j\\omega})$.',
         'Give $Y(e^{j\\omega})$ and find $y[n]$ by partial fractions.',
         'Verify $y[0]$ and $y[1]$ against the convolution sum.'],
  sol:'<b>Given.</b> Two one-pole sequences, one as input and one as impulse response.<br>'
     +'<b>Find.</b> The output, through the frequency domain.<br>'
     +'<b>Method.</b> Use the convolution property because the output is a time convolution. Multiply the transforms, split the result into one-pole terms, and invert each term with the exponential pair.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=\\frac{1}{1-\\tfrac12e^{-j\\omega}},\\qquad H(e^{j\\omega})=\\frac{1}{1-\\tfrac13e^{-j\\omega}}.$$'
     +'<b>Solution — part (b).</b>$$Y(e^{j\\omega})=\\frac{1}{\\left(1-\\tfrac12e^{-j\\omega}\\right)\\left(1-\\tfrac13e^{-j\\omega}\\right)}.$$Write $z=e^{-j\\omega}$ and expand:$$\\frac{1}{\\left(1-\\tfrac12z\\right)\\left(1-\\tfrac13z\\right)}=\\frac{A}{1-\\tfrac12z}+\\frac{B}{1-\\tfrac13z},$$with $A=\\dfrac{\\tfrac12}{\\tfrac12-\\tfrac13}=3$ and $B=\\dfrac{\\tfrac13}{\\tfrac13-\\tfrac12}=-2$. Inverting each term,$$y[n]=\\left[3\\left(\\tfrac12\\right)^{n}-2\\left(\\tfrac13\\right)^{n}\\right]u[n].$$'
     +'<b>Solution — part (c).</b> From the formula, $y[0]=3-2=1$ and $y[1]=\\tfrac32-\\tfrac23=\\tfrac56$. From the convolution sum,$$y[0]=x[0]h[0]=1,$$$$y[1]=x[0]h[1]+x[1]h[0]=1\\cdot\\tfrac13+\\tfrac12\\cdot1=\\tfrac56.$$Both agree.<br>'
     +'<b>Check.</b> A third test at $\\omega=0$: $Y(e^{j0})=\\dfrac{1}{\\tfrac12\\cdot\\tfrac23}=3$, and summing the closed form, $3\\cdot\\dfrac{1}{1-\\tfrac12}-2\\cdot\\dfrac{1}{1-\\tfrac13}=6-3=3$. It is also the product of the two sums, $2\\cdot\\tfrac32=3$, as multiplication of the transforms at $\\omega=0$ requires.',
  err:'Writing the partial fractions with denominators $\\left(e^{-j\\omega}-\\tfrac12\\right)$ instead of $\\left(1-\\tfrac12e^{-j\\omega}\\right)$. Only the second form inverts to $a^{n}u[n]$; the first belongs to a different pair and produces a left-sided sequence.',
  teach:'Ask for the same convolution done directly as a sum of products. It is a geometric series in disguise and comes out the same, but the frequency-domain route generalises to any number of poles while the direct sum does not.' },

{ id:'D6-29', module:'M6', type:'full', src:'Final Q3',
  stem:'Two filters are defined by$$h_1[n]=\\frac{\\sin\\!\\left(\\tfrac{\\pi}{2}n\\right)}{\\pi n},\\qquad h_2[n]=\\delta[n]-\\frac{\\sin\\!\\left(\\tfrac{\\pi}{2}n\\right)}{\\pi n}.$$',
  parts:['Plot $H_1(e^{j\\omega})$ and $H_2(e^{j\\omega})$ over $-\\pi\\le\\omega\\le\\pi$.',
         'Determine the impulse response of the parallel connection $h_1[n]+h_2[n]$ and its frequency response.',
         'Determine the frequency response of the series connection $h_1[n]*h_2[n]$, and say what the connection does.'],
  sol:'<b>Given.</b> An ideal low-pass filter with cut-off $\\tfrac{\\pi}{2}$ and its complement.<br>'
     +'<b>Find.</b> Both responses, and the effect of connecting them two ways.<br>'
     +'<b>Method.</b> Work in frequency because parallel and series connections become addition and multiplication. Transform each impulse response, add the responses for the parallel connection, and multiply them for the series connection.<br>'
     +'<b>Solution — part (a).</b>$$H_1(e^{j\\omega})=\\begin{cases}1,&|\\omega|<\\tfrac{\\pi}{2}\\\\0,&\\tfrac{\\pi}{2}<|\\omega|\\le\\pi,\\end{cases}$$and since $\\delta[n]\\leftrightarrow1$,$$H_2(e^{j\\omega})=1-H_1(e^{j\\omega})=\\begin{cases}0,&|\\omega|<\\tfrac{\\pi}{2}\\\\1,&\\tfrac{\\pi}{2}<|\\omega|\\le\\pi,\\end{cases}$$the complementary high-pass filter.<br>'
     +'<b>Solution — part (b).</b> Adding the impulse responses, the sinc terms cancel and $h_1[n]+h_2[n]=\\delta[n]$, so the parallel connection has frequency response$$H_1+H_2=1$$at every frequency: the two filters together pass everything, which is what complementary means.<br>'
     +'<b>Solution — part (c).</b> In series the responses multiply:$$H_1H_2=H_1\\left(1-H_1\\right)=H_1-H_1^{2}.$$Since $H_1$ is $0$ or $1$ everywhere, $H_1^{2}=H_1$ and the product is zero at every frequency. The cascade passes nothing at all — its impulse response is the zero sequence.<br>'
     +'<b>Check.</b> Part (c) makes sense band by band: below $\\tfrac{\\pi}{2}$ the second filter blocks whatever the first passed, and above it the first blocks whatever the second would pass. No frequency survives both. Part (b) is the same statement read the other way: every frequency survives exactly one of them.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.15,1.35],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'H_1(e^{j\\omega})',
      pad:{l:60,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.poly([[-3.4,0],[-Math.PI/2,0],[-Math.PI/2,1],[Math.PI/2,1],[Math.PI/2,0],[3.4,0]],{color:C.h});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-3.4,3.4],yr:[-0.15,1.35],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'H_2(e^{j\\omega})',
      pad:{l:60,r:26,t:28,b:38},xstep:1,ystep:0.5});
      a.poly([[-3.4,1],[-Math.PI/2,1],[-Math.PI/2,0],[Math.PI/2,0],[Math.PI/2,1],[3.4,1]],{color:C.mid});
      return a.svg();})()),
  err:'Concluding from part (b) that the series connection also gives $\\delta[n]$, on the grounds that the two filters are inverses of one another. Complementary is not inverse: complementary filters add to one, inverse filters multiply to one, and these two multiply to zero.',
  teach:'Use this pair to compare series and parallel connections. Then ask for a filter that inverts $h_1$. No inverse exists because $H_1$ is zero on half the band, so multiplication by another finite response cannot restore those frequencies.' },

{ id:'D6-30', module:'M6', type:'full', src:'Final Q3',
  stem:'Let $p[n]=\\sum_{k=-\\infty}^{\\infty}\\delta[n-5k]$ be a periodic impulse train, and let $x[n]$ be a sequence whose DTFT is $1$ for $|\\omega|<\\tfrac{\\pi}{5}$ and zero elsewhere in $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Determine the DTFT of $p[n]$.',
         'Determine and plot the DTFT of $y[n]=x[n]p[n]$.',
         'State whether $x[n]$ can be recovered from $y[n]$ by an ideal low-pass filter, and give the filter if it can.'],
  sol:'<b>Given.</b> An impulse train of period $5$ and a band-limited sequence.<br>'
     +'<b>Find.</b> The spectrum of the train, the spectrum of the product, and whether the product can be undone.<br>'
     +'<b>Method.</b> Use the impulse-train pair because $p[n]$ is periodic with period $N$. Then use periodic convolution because multiplying by $p[n]$ in time replicates the spectrum at spacing $\\tfrac{2\\pi}{N}$.<br>'
     +'<b>Solution — part (a).</b> The coefficients of $p[n]$ are $a_k=\\tfrac15$ for every $k$, so$$P(e^{j\\omega})=\\frac{2\\pi}{5}\\sum_{k=-\\infty}^{\\infty}\\delta\\!\\left(\\omega-\\frac{2\\pi k}{5}\\right).$$'
     +'<b>Solution — part (b).</b> Periodic convolution with the factor $\\tfrac{1}{2\\pi}$ gives$$Y(e^{j\\omega})=\\frac15\\sum_{k=0}^{4}X\\!\\left(e^{j(\\omega-2\\pi k/5)}\\right),$$five copies of the band, each of height $\\tfrac15$, centred at $\\omega=0,\\pm\\tfrac{2\\pi}{5},\\pm\\tfrac{4\\pi}{5}$. Each copy occupies a width of $\\tfrac{2\\pi}{5}$ and the spacing is $\\tfrac{2\\pi}{5}$, so the copies fill the axis edge to edge without overlapping.<br>'
     +'<b>Solution — part (c).</b> <b>Yes.</b> Because the copies do not overlap, the one centred at the origin is intact. An ideal low-pass filter with cut-off $\\tfrac{\\pi}{5}$ and gain $5$,$$H(e^{j\\omega})=\\begin{cases}5,&|\\omega|<\\tfrac{\\pi}{5}\\\\0,&\\text{otherwise,}\\end{cases}$$keeps that copy and restores its height, giving $X$ exactly.<br>'
     +'<b>Check.</b> Count the widths. Five copies of width $\\tfrac{2\\pi}{5}$ occupy $2\\pi$ in total, exactly one period, so they tile it with nothing left over and nothing doubled. Had the band been any wider than $\\tfrac{\\pi}{5}$ on each side, the copies would have overlapped and part (c) would have failed — which is the sampling condition in the discrete-time setting.',
  figSol:()=>{const a=P.Axes({w:1080,h:270,xr:[-3.4,3.4],yr:[-0.05,0.3],xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'Y(e^{j\\omega})',
      pad:{l:60,r:28,t:30,b:38},xstep:1,ystep:0.1});
    a.poly([[-3.4,0.2],[3.4,0.2]],{color:C.out}); return a.svg();},
  err:'Reporting five separated bands with gaps between them. The band half-width is $\\tfrac{\\pi}{5}$ and the spacing is $\\tfrac{2\\pi}{5}$, so each copy is exactly as wide as the gap it has to fill: the result is a constant $\\tfrac15$ across the whole period, with no gaps at all.',
  teach:'Explain why the spectrum in part (b) is flat: the replicated bands exactly cover the period without gaps or overlap. Then ask for $y[n]$ in time. It is $x[0]\\delta[n]$ repeated, whose transform is constant.' }

]);

window.DRILLMAP_M6 = [

{ id:'m6-drill-map', module:'M6', nav:'Module 6 · question types',
  title:'Module 6 — what a question looks like', src:'pp. 64–79',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 6 question types DTFT periodicity inverse transform LTI symmetry taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Question types', src:'pp. 64–79'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on the discrete-time Fourier transform come in five shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M6'},
  {t:'note', kind:'warn', head:'One difference governs every question here', html:'The discrete-time transform is periodic in $\\omega$ with period $2\\pi$. Every answer is given on one interval, every frequency is reduced into that interval before it is used, and $\\omega=\\pi$ — not infinity — is the highest frequency there is.'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M6 = [

{ id:'m6-drill', module:'M6', nav:'Module 6 · practice questions',
  title:'Module 6 — practice questions', src:'pp. 64–79',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 6 practice DTFT geometric sequence rectangular window inverse transform frequency response parseval symmetry',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Practice D6-01 … D6-30', src:'pp. 64–79'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. First check $X(e^{j0})=\\sum_n x[n]$, the total sum of the sequence. Next check $x[0]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,\\d\\omega$, the mean of the spectrum. For a real sequence, also check that $\\left|X(e^{j\\omega})\\right|$ is even and $\\angle X(e^{j\\omega})$ is odd.'},
  {t:'rule', short:true},
  {t:'drill', module:'M6'}
]}

];
})();
