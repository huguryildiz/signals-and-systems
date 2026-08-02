/* ==========================================================================
   Practice questions — Module 7.
   The module opens with two scenes: a taxonomy of the question types that
   keep coming back, and a pager of twenty open-ended questions in that
   form. The worked solution of every question is hidden until the reader
   asks for it, so a first pass shows the target and not the answer.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL, PI = Math.PI;
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;
/* Frequency ticks read in whole multiples of pi, exactly as the module's own
   scenes read them. A tick number is part of the scale of the frame, not of
   the running mathematics, so it stays plain text — see CLAUDE.md §7. */
const piTick = v => { const k = Math.round(v/PI); return k===0 ? '0' : (k<0?'-':'')+Math.abs(k)+'π'; };
const wTicks = (lo,hi,step)=>{ const o=[]; for(let k=Math.ceil(lo/step-1e-9); k<=hi/step+1e-9; k++) o.push(k*step); return o; };
/* one triangular baseband or copy: peak `pk`, zero at a distance `wm` */
const tri = (w,wm,pk)=> Math.abs(w)<=wm ? pk*(1-Math.abs(w)/wm) : NaN;
/* the sinc convention used throughout this module: unnormalised */
const sinc = th => Math.abs(th)<1e-9 ? 1 : Math.sin(th)/th;

/* ======================================================================
   MODULE 7 — Sampling and Aliasing
   ====================================================================== */

CONTENT.DRILLTYPES.M7 = [
  { k:'nyq-sum', name:'Nyquist rate of a sum or a product of sinusoids',
    asks:'A signal is written as a sum or a product of sinusoids. Find the Nyquist rate.',
    method:['Reduce every product of sinusoids to a sum, using the product-to-sum identities.',
            'List every frequency present and take the largest, $\\omega_M$.',
            'The Nyquist rate is $\\omega_s=2\\omega_M$, and the largest usable sampling period is $T=\\pi/\\omega_M$.',
            'State the units. A rate in rad/s and a rate in hertz differ by $2\\pi$.'],
    go:'m7-ex-73a' },
  { k:'nyq-band', name:'Bandwidth of a sinc-type signal',
    asks:'A signal is given as a sinc, a sinc squared, or a sum of these. Find its bandwidth and Nyquist rate.',
    method:['A sinc in time is a rectangle in frequency. Read the cutoff off the argument.',
            'A squared sinc is a triangle of twice the width, because squaring in time convolves in frequency.',
            'For a sum, the bandwidth is the largest of the individual bandwidths, never their sum.',
            'Always give $\\omega_M$ before giving the rate, so the factor of two is visible.'],
    go:'m7-ex-73c' },
  { k:'nyq-op', name:'Bandwidth after a product, a convolution, or a carrier',
    asks:'Two band-limited signals are combined, or a guard band is required. Find the bandwidth of the result, and the rate that leaves room for the filter.',
    method:['A product in time convolves the spectra, so the bandwidths add.',
            'A convolution in time multiplies the spectra, so the bandwidth is the smaller of the two.',
            'Multiplication by a carrier shifts the band rather than widening it: the highest frequency is the carrier plus the half-width.',
            'A guard band $\\omega_g$ raises the requirement to $\\omega_s\\ge2\\omega_M+\\omega_g$, measured once, between one copy and the next.'],
    go:'m7-freq' },
  { k:'alias', name:'The sampled spectrum as copies, and aliasing',
    asks:'A band-limited signal is sampled. Describe how the copies of its spectrum sit, or find the apparent frequency once they overlap.',
    method:['Sampling replicates the spectrum every $\\omega_s$, at every rate, without exception.',
            'Aliasing is the overlap of two neighbouring copies. It happens exactly when $\\omega_s<2\\omega_M$.',
            'A component at $f_0$ sampled at $f_s$ appears at the distance from $f_0$ to the nearest multiple of $f_s$.',
            'Two distinct components can land on the same apparent frequency. Say so when they do, and say that neither can then be recovered.'],
    go:'m7-aliasing' },
  { k:'recon', name:'Reconstruction: the interpolation formula, the hold, and the filter\u2019s place',
    asks:'A sampled signal is to be turned back into a continuous one, ideally or by a practical hold, or a filter has to be placed in a sampling chain. Say what comes out, or where the filter goes.',
    method:['The ideal filter has gain $T$ and a cutoff strictly inside the guard band; its impulse response is an unnormalised sinc, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.',
            'Reconstruction is interpolation: $x_r(t)=\\sum_nx(nT)\\,h_{LP}(t-nT)$, one shifted kernel per sample, and the kernel is 1 at its own instant and 0 at every other sample instant.',
            'A practical hold approximates the ideal filter; it is not equal to it, and its gain sags away from $T$ as $\\omega$ grows.',
            'An anti-aliasing filter works only ahead of the sampler. Placed after, it cannot separate two numbers that have already been added together.'],
    go:'m7-recon' },
  { k:'full', name:'A full-length question that combines several of the types above',
    asks:'Several signals under one statement, each needing its highest frequency found before a rate can be quoted.',
    method:['Find the spectrum of each signal before quoting any rate. The highest frequency is a property of the spectrum, not of the expression it is written with.',
            'A product in time widens the band: two sincs multiplied give the sum of their bandwidths, and a squared signal doubles its own.',
            'A convolution in time narrows it: the spectra multiply, so the band is the narrower of the two, never the wider.',
            'Quote the rate against the definition asked for. The Nyquist rate is $2\\omega_M$; with a guard band it is $2\\omega_M+\\omega_g$; and a sampling frequency in hertz is the rate in rad/s divided by $2\\pi$.'] }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D7-01', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\cos(40\\pi t)+\\cos(90\\pi t).$$',
  parts:['List the frequencies present and give $\\omega_M$.',
         'Give the Nyquist rate in rad/s and in hertz, and the largest usable sampling period.'],
  sol:'<b>Given.</b> A sum of two cosines.<br>'
     +'<b>Find.</b> The Nyquist rate.<br>'
     +'<b>Method.</b> The spectrum is a set of impulses at $\\pm40\\pi$ and $\\pm90\\pi$. The signal is band-limited to the largest of these, and the sampling theorem requires $\\omega_s>2\\omega_M$.<br>'
     +'<b>Solution — part (a).</b> The frequencies present are $40\\pi$ and $90\\pi$ rad/s, so$$\\omega_M=90\\pi\\;\\text{rad/s}\\qquad(f_M=45\\;\\text{Hz}).$$'
     +'<b>Solution — part (b).</b>$$\\omega_s=2\\omega_M=180\\pi\\;\\text{rad/s},\\qquad f_s=90\\;\\text{Hz},\\qquad T_{\\max}=\\frac{1}{f_s}\\approx11.11\\;\\text{ms}.$$'
     +'<b>Check.</b> Converting the rate the other way: $180\\pi$ rad/s divided by $2\\pi$ is $90$ Hz, and $T_{\\max}=\\pi/\\omega_M=\\pi/(90\\pi)=1/90$ s, the same number read as a period. The lower component imposes no separate condition of its own; only the highest frequency present decides the rate.',
  err:'Adding the two frequencies and reporting $\\omega_M=130\\pi$. Frequencies present in a sum are not combined; the largest one is taken.',
  teach:'Ask for both frequencies to be listed, in a line by themselves, before $\\omega_M$ is named. A student who names $\\omega_M$ without first listing what is present has usually guessed.' },

{ id:'D7-02', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\cos(30\\pi t)\\cos(80\\pi t).$$',
  parts:['Rewrite $x(t)$ as a sum of cosines.',
         'Give $\\omega_M$ and the Nyquist rate, in rad/s and in hertz.'],
  sol:'<b>Given.</b> A product of two cosines.<br>'
     +'<b>Find.</b> The Nyquist rate.<br>'
     +'<b>Method.</b> A product of sinusoids is not itself a listed frequency. Convert it to a sum first, using$$\\cos A\\cos B=\\tfrac12\\left[\\cos(A+B)+\\cos(A-B)\\right].$$'
     +'<b>Solution — part (a).</b> With $A=30\\pi$ and $B=80\\pi$,$$x(t)=\\tfrac12\\cos(110\\pi t)+\\tfrac12\\cos(50\\pi t).$$'
     +'<b>Solution — part (b).</b> The frequencies present are $50\\pi$ and $110\\pi$ rad/s, so$$\\omega_M=110\\pi\\;\\text{rad/s}\\;(f_M=55\\;\\text{Hz}),\\qquad\\omega_s=220\\pi\\;\\text{rad/s},\\qquad f_s=110\\;\\text{Hz}.$$'
     +'<b>Check.</b> The same answer follows from the frequency domain, without the identity: multiplying by $\\cos(80\\pi t)$ shifts the spectrum of $\\cos(30\\pi t)$ by $\\pm80\\pi$, moving the lines at $\\pm30\\pi$ to $\\pm50\\pi$ and $\\pm110\\pi$. Neither original frequency survives in the product, which is why $\\omega_M=80\\pi$ would be wrong even though $80\\pi$ is the larger of the two factors.',
  err:'Taking $\\omega_M=80\\pi$ from the higher of the two factors. The product contains neither $30\\pi$ nor $80\\pi$; it contains their sum and their difference.',
  teach:'Ask for the frequency-shift argument alongside the identity. A student who sees the shifted copies stops treating the product-to-sum step as a trick to be memorised.' },

{ id:'D7-03', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\sin(50\\pi t)\\cos(30\\pi t).$$',
  parts:['Rewrite $x(t)$ as a sum of sines, using $\\sin A\\cos B=\\tfrac12[\\sin(A+B)+\\sin(A-B)]$.',
         'Give $\\omega_M$ and the Nyquist rate, in rad/s and in hertz.'],
  sol:'<b>Given.</b> A product of a sine and a cosine.<br>'
     +'<b>Find.</b> The Nyquist rate.<br>'
     +'<b>Method.</b> As with a product of two cosines, first reduce the product to a sum. Here the identity carries a sine on both sides, not a cosine.<br>'
     +'<b>Solution — part (a).</b> With $A=50\\pi$ and $B=30\\pi$,$$x(t)=\\tfrac12\\sin(80\\pi t)+\\tfrac12\\sin(20\\pi t).$$'
     +'<b>Solution — part (b).</b> The frequencies present are $20\\pi$ and $80\\pi$ rad/s, so$$\\omega_M=80\\pi\\;\\text{rad/s}\\;(f_M=40\\;\\text{Hz}),\\qquad\\omega_s=160\\pi\\;\\text{rad/s},\\qquad f_s=80\\;\\text{Hz}.$$'
     +'<b>Check.</b> In the frequency domain, $\\sin(50\\pi t)$ has transform lines at $\\pm50\\pi$; multiplying by $\\cos(30\\pi t)$ shifts each by $\\pm30\\pi$, landing at $50\\pi\\pm30\\pi=80\\pi,20\\pi$ and at $-50\\pi\\pm30\\pi=-20\\pi,-80\\pi$ — the same four locations the identity gives, with $\\omega_M=80\\pi$ as the outermost one.',
  err:'Applying the cosine-times-cosine identity to a sine-times-cosine product. The two identities differ in which term carries a minus sign inside the sine, and using the wrong one swaps which sideband survives.',
  teach:'Have the identity written out symbolically, with $A$ and $B$ left as letters, before any number is substituted. A student who substitutes first and reasons about signs afterward makes this error most often.' },

{ id:'D7-04', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Let $$x(t)=\\cos(20\\pi t)+\\cos(70\\pi t),\\qquad y(t)=x(t)+x^{2}(t).$$',
  parts:['List every frequency present in $y(t)$.',
         'Give $\\omega_M$ and the Nyquist rate for $y(t)$, in rad/s and in hertz.'],
  sol:'<b>Given.</b> A band-limited signal plus its square.<br>'
     +'<b>Find.</b> The Nyquist rate of $y(t)$.<br>'
     +'<b>Method.</b> Squaring convolves the spectrum with itself, so the band can widen. Expand the square with $\\cos^{2}\\theta=\\tfrac12+\\tfrac12\\cos2\\theta$ and the product-to-sum identity, then list every frequency the whole sum contains.<br>'
     +'<b>Solution — part (a).</b> Write $A=20\\pi$ and $B=70\\pi$. Then$$x^{2}(t)=\\cos^{2}(At)+2\\cos(At)\\cos(Bt)+\\cos^{2}(Bt)=1+\\tfrac12\\cos(2At)+\\tfrac12\\cos(2Bt)+\\cos\\bigl((A{+}B)t\\bigr)+\\cos\\bigl((B{-}A)t\\bigr),$$so the frequencies present in $y=x+x^{2}$ are$$0,\\;20\\pi,\\;40\\pi,\\;50\\pi,\\;70\\pi,\\;90\\pi,\\;140\\pi\\;\\text{rad/s},$$where $2A=40\\pi$, $B-A=50\\pi$, $A+B=90\\pi$ and $2B=140\\pi$.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_M=140\\pi\\;\\text{rad/s}\\;(f_M=70\\;\\text{Hz}),\\qquad\\omega_s=280\\pi\\;\\text{rad/s},\\qquad f_s=140\\;\\text{Hz}.$$'
     +'<b>Check.</b> The general rule agrees without repeating the expansion: squaring in time convolves the spectrum with itself, so a signal band-limited to $70\\pi$ produces a square band-limited to $2\\times70\\pi=140\\pi$, and adding the linear term $x(t)$ back cannot widen a band that already reaches $140\\pi$. The constant term $1$ in $x^{2}$ is its mean, present because a squared real signal is never negative.',
  err:'Quoting $\\omega_M=70\\pi$ from $x$ alone and ignoring the square. A nonlinearity creates frequencies that were absent from its input, which is exactly why it is not an LTI operation.',
  teach:'This is the practical reason an anti-aliasing filter sits ahead of a nonlinear stage rather than after it: a filter placed after the squaring cannot remove content the squaring itself created below its own cutoff.' },

{ id:'D7-05', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\frac{\\sin(300\\pi t)}{\\pi t}.$$',
  parts:['Give $X(j\\omega)$.',
         'Give $\\omega_M$ and the Nyquist rate, in rad/s and in hertz.'],
  sol:'<b>Given.</b> A sinc-shaped signal, with the unnormalised convention $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$.<br>'
     +'<b>Find.</b> Its bandwidth and Nyquist rate.<br>'
     +'<b>Method.</b> Match against the standard pair$$\\frac{\\sin(Wt)}{\\pi t}\\;\\longleftrightarrow\\;\\begin{cases}1,&|\\omega|<W,\\\\0,&|\\omega|>W.\\end{cases}$$'
     +'<b>Solution — part (a).</b> Reading $W=300\\pi$ off the argument of the sine,$$X(j\\omega)=1\\ \\text{for}\\ |\\omega|<300\\pi,\\quad0\\ \\text{otherwise}.$$'
     +'<b>Solution — part (b).</b>$$\\omega_M=300\\pi\\;\\text{rad/s}\\;(f_M=150\\;\\text{Hz}),\\qquad\\omega_s=600\\pi\\;\\text{rad/s},\\qquad f_s=300\\;\\text{Hz}.$$'
     +'<b>Check.</b> $X(0)=1$, and directly $\\displaystyle\\int\\frac{\\sin(300\\pi t)}{\\pi t}\\,\\d t=1$, matching the height of the rectangle at the origin. The signal is genuinely band-limited — its spectrum is exactly zero above $300\\pi$ — which is the condition the sampling theorem asks for, and which no signal of finite duration can satisfy.',
  err:'Reading the bandwidth as $300$ rather than $300\\pi$ rad/s, by confusing the argument of the sine with a frequency in hertz. The pair matches $\\sin(Wt)$, so $W$ is already in rad/s.',
  teach:'Ask for the plot of $X(j\\omega)$ before the rate is stated. A student who draws the rectangle with its edges in the right place does not misplace the factor $\\pi$ afterward.' },

{ id:'D7-06', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\left[\\frac{\\sin(100\\pi t)}{\\pi t}\\right]^{2}.$$',
  parts:['Describe $X(j\\omega)$: its shape, its peak, and its edges.',
         'Give $\\omega_M$ and the Nyquist rate, in rad/s and in hertz.',
         'Sketch $X(j\\omega)$.'],
  sol:'<b>Given.</b> The square of a sinc.<br>'
     +'<b>Find.</b> Its bandwidth.<br>'
     +'<b>Method.</b> Squaring in time is convolving in frequency, with the factor $\\tfrac{1}{2\\pi}$ the transform pair carries. The spectrum of the sinc is a rectangle, and a rectangle convolved with itself is a triangle of twice the width.<br>'
     +'<b>Solution — part (a).</b> Let $R(j\\omega)$ be the rectangle of height $1$ on $|\\omega|<100\\pi$. Then$$X(j\\omega)=\\frac{1}{2\\pi}\\bigl[R*R\\bigr](j\\omega),$$a triangle spanning $|\\omega|<200\\pi$, with peak $X(0)=\\dfrac{200\\pi}{2\\pi}=100$ at $\\omega=0$, falling linearly to zero at $\\omega=\\pm200\\pi$.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_M=200\\pi\\;\\text{rad/s}\\;(f_M=100\\;\\text{Hz}),\\qquad\\omega_s=400\\pi\\;\\text{rad/s},\\qquad f_s=200\\;\\text{Hz}.$$'
     +'<b>Solution — part (c).</b> The sketch is the triangle just described.<br>'
     +'<b>Check.</b> Supports add under convolution: $100\\pi+100\\pi=200\\pi$, the outer edge of the triangle. By Parseval, $X(0)$ must equal $\\dfrac{1}{2\\pi}$ times the area under $x^{2}(t)$ integrated against itself in the time domain in the appropriate sense; more simply, doubling the sinc\u2019s own bandwidth doubles the squared signal\u2019s bandwidth, since squaring a signal is multiplying it by itself and the two factors carry the same band.',
  figSol:()=>{const W=100*PI;
    const a=P.Axes({w:1080,h:280,xr:[-1.3*W,1.3*W],yr:[-12,118],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
      pad:{l:62,r:28,t:32,b:40},xstep:100*PI,ystep:25,
      xticksOverride:wTicks(-1.2*W,1.2*W,100*PI),xtickfmt:piTick});
    a.curve(w=>tri(w,W,100),{color:C.mid,n:1400});
    a.point(0,100,{color:C.coral,r:4});
    return a.svg();},
  err:'Reporting the same bandwidth as the unsquared sinc, on the grounds that squaring does not move the zeros of the time signal. Bandwidth is a statement about the spectrum, and squaring doubles it.',
  teach:'Link this to the supports-add rule already used for convolution of time-domain signals. Making the parallel explicit saves teaching the same rule twice, once per domain.' },

{ id:'D7-07', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\frac{\\sin(180\\pi t)}{\\pi t}+\\frac{\\sin(500\\pi t)}{\\pi t}.$$',
  parts:['Describe $X(j\\omega)$ and sketch it.',
         'Give $\\omega_M$ and the Nyquist rate, and say which term determines it.'],
  sol:'<b>Given.</b> A sum of two ideal lowpass signals of different bandwidths.<br>'
     +'<b>Find.</b> The bandwidth of the sum.<br>'
     +'<b>Method.</b> The transform is linear, so the two spectra add. Two rectangles centred on the origin overlap rather than sit side by side.<br>'
     +'<b>Solution — part (a).</b> The first term contributes a rectangle of height $1$ on $|\\omega|<180\\pi$, the second a rectangle of height $1$ on $|\\omega|<500\\pi$. Adding them gives a staircase:$$X(j\\omega)=\\begin{cases}2,&|\\omega|<180\\pi,\\\\1,&180\\pi<|\\omega|<500\\pi,\\\\0,&|\\omega|>500\\pi.\\end{cases}$$'
     +'<b>Solution — part (b).</b>$$\\omega_M=500\\pi\\;\\text{rad/s}\\;(f_M=250\\;\\text{Hz}),\\qquad\\omega_s=1000\\pi\\;\\text{rad/s},\\qquad f_s=500\\;\\text{Hz}.$$The <b>wider</b> term determines the rate; the narrower one only adds height inside the shared band.<br>'
     +'<b>Check.</b> $X(0)=2$, and each sinc has unit area, so $\\int x=1+1=2$, matching the height at the origin. For a sum the bandwidth is always the larger of the individual bandwidths, never their sum — that rule belongs to a product, not a sum.',
  figSol:()=>{const W1=180*PI, W2=500*PI;
    const a=P.Axes({w:1080,h:280,xr:[-1.25*W2,1.25*W2],yr:[-0.3,2.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
      pad:{l:56,r:28,t:32,b:40},xstep:250*PI,ystep:1,
      xticksOverride:wTicks(-1.2*W2,1.2*W2,250*PI),xtickfmt:piTick});
    a.poly([[-1.25*W2,0],[-W2,0],[-W2,1],[-W1,1],[-W1,2],[W1,2],[W1,1],[W2,1],[W2,0],[1.25*W2,0]],{color:C.out});
    return a.svg();},
  err:'Adding the two bandwidths and reporting $\\omega_M=680\\pi$. Adding bandwidths is what a product in time does; a sum takes the larger.',
  teach:'Put this question directly beside a product question. The contrast between "sum takes the larger" and "product adds" is the single most useful sentence in this part of the module.' },

{ id:'D7-08', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\left[\\frac{\\sin(140\\pi t)}{\\pi t}\\right]^{2}+\\frac{\\sin(90\\pi t)}{\\pi t}.$$',
  parts:['Give the bandwidth of each of the two terms separately.',
         'Give $\\omega_M$ and the Nyquist rate for the sum, in rad/s and in hertz.'],
  sol:'<b>Given.</b> A sum of a squared sinc and a plain sinc.<br>'
     +'<b>Find.</b> The Nyquist rate of the sum.<br>'
     +'<b>Method.</b> Find the bandwidth of each term on its own — the squared sinc by the doubling rule, the plain sinc directly — then take the larger, because the two terms are added rather than multiplied.<br>'
     +'<b>Solution — part (a).</b> The squared sinc has half-width $140\\pi$ in the unsquared factor, so its triangular spectrum reaches zero at $2\\times140\\pi=280\\pi$ rad/s. The plain sinc has bandwidth $90\\pi$ rad/s directly.<br>'
     +'<b>Solution — part (b).</b> The sum takes the larger of the two:$$\\omega_M=280\\pi\\;\\text{rad/s}\\;(f_M=140\\;\\text{Hz}),\\qquad\\omega_s=560\\pi\\;\\text{rad/s},\\qquad f_s=280\\;\\text{Hz}.$$'
     +'<b>Check.</b> Setting the plain-sinc term to zero altogether leaves only the squared sinc, whose bandwidth is already $280\\pi$; adding a narrower term back cannot reduce that number, only possibly widen it if the added term were wider — which $90\\pi<280\\pi$ is not. The rate is unchanged whether or not the $90\\pi$ term is present.',
  err:'Adding the two bandwidths, $280\\pi+90\\pi=370\\pi$, instead of taking the larger. The mistake survives even when one of the two terms has been squared.',
  teach:'Ask which rule governs a sum, in one sentence, before any arithmetic starts. Naming the rule first prevents the reflex of adding two numbers that happen to be sitting next to each other.' },

{ id:'D7-09', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'Two signals are band-limited: $X_1(j\\omega)=0$ for $|\\omega|>70\\pi$ and $X_2(j\\omega)=0$ for $|\\omega|>190\\pi$. Define $$y(t)=x_1(t)*x_2(t).$$',
  parts:['Give the band-limit of $y(t)$.',
         'Give the Nyquist rate for $y(t)$, and justify the answer in one sentence.'],
  sol:'<b>Given.</b> Two band-limited signals, convolved.<br>'
     +'<b>Find.</b> The band-limit of the result.<br>'
     +'<b>Method.</b> Convolution in time is multiplication in frequency:$$Y(j\\omega)=X_1(j\\omega)X_2(j\\omega).$$A product is zero wherever <em>either</em> factor is zero.<br>'
     +'<b>Solution — part (a).</b> Above $70\\pi$ the first factor vanishes, so the product vanishes there too. Hence$$Y(j\\omega)=0\\ \\text{for}\\ |\\omega|>70\\pi,\\qquad\\omega_M=70\\pi\\;\\text{rad/s}\\;(f_M=35\\;\\text{Hz}).$$The bandwidth is the <b>smaller</b> of the two.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_s=140\\pi\\;\\text{rad/s},\\qquad f_s=70\\;\\text{Hz}.$$Convolving cannot create a frequency absent from both inputs, and it removes every frequency absent from either.<br>'
     +'<b>Check.</b> Taking $x_1$ as the impulse response of an ideal lowpass filter with cutoff $70\\pi$ makes the result obvious without invoking the multiplication property at all: the output of a lowpass filter is band-limited to its own cutoff, whatever passes through it.',
  err:'Applying the supports-add rule that belongs to a product in time. This operation is a convolution in time, so it is the spectra that multiply, and the narrower one wins.',
  teach:'Ask which of the two signals could be called the filter. Naming it converts an abstract rule into a fact the student already knows from earlier work with convolution.' },

{ id:'D7-10', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'With the same two signals — $X_1(j\\omega)=0$ for $|\\omega|>70\\pi$ and $X_2(j\\omega)=0$ for $|\\omega|>190\\pi$ — define $$z(t)=x_1(t)\\,x_2(t).$$',
  parts:['Give the band-limit of $z(t)$.',
         'Give the Nyquist rate for $z(t)$, and contrast the answer with the convolution case.'],
  sol:'<b>Given.</b> The same two signals, multiplied instead of convolved.<br>'
     +'<b>Find.</b> The band-limit of the product.<br>'
     +'<b>Method.</b> Multiplication in time is convolution in frequency,$$Z(j\\omega)=\\frac{1}{2\\pi}\\bigl[X_1*X_2\\bigr](j\\omega),$$and supports add under convolution.<br>'
     +'<b>Solution — part (a).</b>$$\\omega_M=70\\pi+190\\pi=260\\pi\\;\\text{rad/s}\\;(f_M=130\\;\\text{Hz}).$$'
     +'<b>Solution — part (b).</b>$$\\omega_s=520\\pi\\;\\text{rad/s},\\qquad f_s=260\\;\\text{Hz}.$$Convolving the two signals gave $70\\pi$, the smaller bandwidth; multiplying them gives $260\\pi$, the sum. The two operations move the band-limit in opposite directions, by different rules.<br>'
     +'<b>Check.</b> The rule matches the two special cases already met: squaring a signal is multiplying it by itself, and doubles the bandwidth, which is $W+W$; multiplying by a cosine carrier multiplies by a signal whose spectrum is two impulses, of zero width, so the band shifts rather than widens. Both are the general rule $W_1+W_2$ with one of the two widths taken to its limit.',
  err:'Using the smaller-bandwidth rule here too, from having just used it for the paired convolution question. Which rule applies depends on whether the operation is a product or a convolution, not on which question came first.',
  teach:'Keep this question and its convolution pair on the same page, and ask for the two rules stated side by side before either is answered. Separating them in time all but guarantees they will be confused.' },

{ id:'D7-11', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'Let $$z(t)=\\frac{\\sin(60\\pi t)}{\\pi t}\\cos(400\\pi t).$$',
  parts:['Describe $Z(j\\omega)$, giving the edges of every band it occupies.',
         'Give $\\omega_M$ and the Nyquist rate, in rad/s and in hertz.'],
  sol:'<b>Given.</b> An ideal lowpass signal modulated by a carrier at $400\\pi$ rad/s.<br>'
     +'<b>Find.</b> The occupied bands and the Nyquist rate.<br>'
     +'<b>Method.</b> Multiplying by a cosine convolves the spectrum with two impulses, producing two shifted half-height copies:$$Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-400\\pi)\\bigr)+\\tfrac12X\\bigl(j(\\omega+400\\pi)\\bigr).$$'
     +'<b>Solution — part (a).</b> Here $X(j\\omega)=1$ on $|\\omega|<60\\pi$. Each copy is $120\\pi$ wide, centred on $\\pm400\\pi$, so$$Z(j\\omega)=\\tfrac12\\ \\text{on}\\ 340\\pi<\\omega<460\\pi\\ \\text{and on}\\ -460\\pi<\\omega<-340\\pi,$$and zero elsewhere; there is no energy at or near the origin.<br>'
     +'<b>Solution — part (b).</b> The highest frequency present is the outer edge,$$\\omega_M=460\\pi\\;\\text{rad/s}\\;(f_M=230\\;\\text{Hz}),\\qquad\\omega_s=920\\pi\\;\\text{rad/s},\\qquad f_s=460\\;\\text{Hz}.$$'
     +'<b>Check.</b> The band-limit is $\\omega_c+W=400\\pi+60\\pi=460\\pi$, the general rule for modulation by a carrier. The signal occupies only $240\\pi$ rad/s in total, split into two bands of width $120\\pi$, yet the Nyquist rate counts the distance to the outermost edge rather than the width of the occupied bands — the gap in between is what a scheme built for a signal already known to sit near one carrier could in principle exploit, which the plain sampling theorem used here does not.',
  figSol:()=>{const wc=400*PI, W=60*PI;
    const a=P.Axes({w:1080,h:280,xr:[-1.25*(wc+W),1.25*(wc+W)],yr:[-0.1,0.7],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'Z(j\\omega)',
      pad:{l:56,r:28,t:32,b:40},xstep:100*PI,ystep:.25,
      xticksOverride:wTicks(-1.2*(wc+W),1.2*(wc+W),100*PI),xtickfmt:piTick});
    a.poly([[-1.25*(wc+W),0],[-(wc+W),0],[-(wc+W),0.5],[-(wc-W),0.5],[-(wc-W),0],
            [(wc-W),0],[(wc-W),0.5],[(wc+W),0.5],[(wc+W),0],[1.25*(wc+W),0]],{color:C.out});
    return a.svg();},
  err:'Taking $\\omega_M=400\\pi$ from the carrier alone. The carrier locates the centre of the band; the outer edge is the carrier plus the half-width of the modulating signal.',
  teach:'Ask for the width and the centre of each copy to be stated separately before either is combined into $\\omega_M$. Students who compute both never report the carrier frequency as the final answer.' },

{ id:'D7-12', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'Two signals are band-limited: $X_1(j\\omega)=0$ for $|\\omega|>50\\pi$ and $X_2(j\\omega)=0$ for $|\\omega|>130\\pi$. Their product $w(t)=x_1(t)x_2(t)$ is to be sampled and reconstructed with a filter whose transition band is $\\omega_g=20\\pi$ rad/s wide.',
  parts:['Give $\\omega_M$ for $w(t)$.',
         'Give the minimum sampling rate when an ideal reconstruction filter is assumed.',
         'Give the minimum sampling rate that leaves room for the stated guard band.'],
  sol:'<b>Given.</b> A product of two band-limited signals, and a practical reconstruction filter that cannot cut off instantly.<br>'
     +'<b>Find.</b> $\\omega_M$ for the product, then the sampling rate in both cases.<br>'
     +'<b>Method.</b> First find the bandwidth of $w(t)$ by the product rule; only then apply the guard-band arithmetic to that number.<br>'
     +'<b>Solution — part (a).</b> Multiplication in time convolves the spectra, so bandwidths add:$$\\omega_M=50\\pi+130\\pi=180\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> With an ideal filter no gap is needed, so$$\\omega_s\\ge2\\omega_M=360\\pi\\;\\text{rad/s}\\qquad(f_s\\ge180\\;\\text{Hz}).$$'
     +'<b>Solution — part (c).</b> The gap between neighbouring copies is $\\omega_s-2\\omega_M$. Requiring it to be at least $\\omega_g$ gives$$\\omega_s\\ge2\\omega_M+\\omega_g=360\\pi+20\\pi=380\\pi\\;\\text{rad/s}\\qquad(f_s\\ge190\\;\\text{Hz}).$$'
     +'<b>Check.</b> Setting $\\omega_g=0$ in part (c) recovers the ideal answer of part (b) exactly, so the two results are consistent. The extra $10$ Hz is the price of a buildable filter, once the bandwidth of the product itself — not of either factor alone — has been used as $\\omega_M$.',
  err:'Using $50\\pi$ or $130\\pi$ directly as $\\omega_M$, skipping the product rule entirely. The bandwidth of a product is neither factor\u2019s bandwidth; it is their sum.',
  teach:'Insist that the bandwidth of the product be found and written on its own line before any guard-band arithmetic starts. Folding the two steps into one is where the sum-versus-double error creeps in.' },

{ id:'D7-13', module:'M7', type:'alias',
  stem:'A signal has the triangular spectrum shown below, with $X(j\\omega)=0$ for $|\\omega|>50\\pi$ rad/s. It is sampled with period $T=1/300$ s.',
  parts:['Read $\\omega_M$ off the figure.',
         'Give $\\omega_s$ and the guard band $\\omega_s-2\\omega_M$.',
         'Sketch $X_p(j\\omega)$ for $k=-1,0,1$, labelling both positive and negative frequencies.'],
  figure:()=>{const WM=50*PI;
    const a=P.Axes({w:1080,h:250,xr:[-1.6*WM,1.6*WM],yr:[-0.15,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
      pad:{l:56,r:28,t:30,b:38},xstep:25*PI,
      xticksOverride:wTicks(-1.5*WM,1.5*WM,25*PI),xtickfmt:piTick});
    a.curve(w=>tri(w,WM,1),{color:C.in,n:1200});
    return a.svg();},
  sol:'<b>Given.</b> A triangular baseband reaching zero at $\\pm50\\pi$ rad/s, sampled every $T=1/300$ s.<br>'
     +'<b>Find.</b> The rate, the guard band, and the sampled spectrum as copies.<br>'
     +'<b>Method.</b> $\\omega_M$ is read directly off the edge of the given spectrum. The rate follows from $\\omega_s=2\\pi/T$, and the guard band from $\\omega_s-2\\omega_M$; every copy in $X_p(j\\omega)$ is the same shape as $X(j\\omega)$, centred at a multiple of $\\omega_s$.<br>'
     +'<b>Solution — part (a).</b>$$\\omega_M=50\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b>$$\\omega_s=\\frac{2\\pi}{T}=2\\pi\\times300=600\\pi\\;\\text{rad/s},\\qquad\\text{guard band}=600\\pi-100\\pi=500\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> The sketch places an unscaled copy of the given triangle at $\\omega=-600\\pi$, at $\\omega=0$, and at $\\omega=600\\pi$, each still reaching zero $50\\pi$ either side of its own centre; the three do not come close to touching.<br>'
     +'<b>Check.</b> $\\omega_sT=600\\pi\\times\\tfrac{1}{300}=2\\pi$, confirming the rate matches the given period. Since the guard band $500\\pi$ is ten times $\\omega_M$, this is heavy oversampling, and the copies in the sketch should sit far apart relative to their own width — a sketch that draws them nearly touching does not match the numbers.',
  figSol:()=>{const WM=50*PI, ws=600*PI;
    const a=P.Axes({w:1080,h:270,xr:[-1.3*ws,1.3*ws],yr:[-0.15,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
      pad:{l:56,r:28,t:32,b:38},xstep:200*PI,
      xticksOverride:wTicks(-1.2*ws,1.2*ws,200*PI),xtickfmt:piTick});
    for(let k=-1;k<=1;k++) a.curve(w=>tri(w-k*ws,WM,1),{color:k===0?C.in:C.mid,n:1200});
    return a.svg();},
  err:'Treating the width of the given triangle as the Nyquist rate itself, instead of as $\\omega_M$. The rate is $2\\omega_M$, not the width of the baseband.',
  teach:'Have the student mark $\\omega_M$ on the given figure with a pencil before any arithmetic is attempted. A wrong reading of the figure poisons every number that follows.' },

{ id:'D7-14', module:'M7', type:'alias',
  stem:'A signal has the triangular spectrum shown below, with $X(j\\omega)=0$ for $|\\omega|>90\\pi$ rad/s. It is sampled at $\\omega_s=140\\pi$ rad/s.',
  parts:['Confirm that this is undersampling.',
         'Sketch the baseband together with the neighbouring copies, shading the overlap.',
         'Give the width of the overlap on each side.'],
  figure:()=>{const WM=90*PI;
    const a=P.Axes({w:1080,h:250,xr:[-1.5*WM,1.5*WM],yr:[-0.15,1.35],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X(j\\omega)',
      pad:{l:56,r:28,t:30,b:38},xstep:45*PI,
      xticksOverride:wTicks(-1.4*WM,1.4*WM,45*PI),xtickfmt:piTick});
    a.curve(w=>tri(w,WM,1),{color:C.in,n:1200});
    return a.svg();},
  sol:'<b>Given.</b> A triangular baseband reaching zero at $\\pm90\\pi$ rad/s, sampled at $\\omega_s=140\\pi$ rad/s.<br>'
     +'<b>Find.</b> Whether the copies overlap, and by how much.<br>'
     +'<b>Method.</b> Compare $\\omega_s$ with the Nyquist rate $2\\omega_M$. If $\\omega_s<2\\omega_M$, the baseband and the copy at $k=1$ overlap on the interval from $\\omega_s-\\omega_M$ to $\\omega_M$.<br>'
     +'<b>Solution — part (a).</b> The Nyquist rate is $2\\omega_M=180\\pi$ rad/s, and $140\\pi<180\\pi$, so this is <b>undersampling</b>.<br>'
     +'<b>Solution — part (b).</b> The sketch places the baseband at the origin and a copy of the same triangle at $\\omega=140\\pi$ and at $\\omega=-140\\pi$; the baseband\u2019s upper edge, $90\\pi$, lies past the $k=1$ copy\u2019s lower edge, $140\\pi-90\\pi=50\\pi$, so the two triangles overlap on $[50\\pi,90\\pi]$, and by symmetry on $[-90\\pi,-50\\pi]$ against the $k=-1$ copy.<br>'
     +'<b>Solution — part (c).</b>$$\\text{overlap width}=2\\omega_M-\\omega_s=180\\pi-140\\pi=40\\pi\\;\\text{rad/s on each side}.$$'
     +'<b>Check.</b> The overlap interval found geometrically in part (b), $[50\\pi,90\\pi]$, has width $90\\pi-50\\pi=40\\pi$, matching part (c) exactly and by a different route: one used the formula $2\\omega_M-\\omega_s$, the other read the two edges directly off the sketch.',
  figSol:()=>{const WM=90*PI, ws=140*PI;
    const rep = w=>{let s=0; for(let k=-2;k<=2;k++){const v=tri(w-k*ws,WM,1); if(isFinite(v)) s+=v;} return s;};
    const a=P.Axes({w:1080,h:280,xr:[-2.2*ws,2.2*ws],yr:[-0.15,2.3],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'X_p(j\\omega)',
      pad:{l:56,r:28,t:32,b:38},xstep:70*PI,
      xticksOverride:wTicks(-2*ws,2*ws,70*PI),xtickfmt:piTick});
    a.area(rep,ws-WM,WM,{color:'rgba(166,59,42,.20)'});
    a.area(rep,-WM,WM-ws,{color:'rgba(166,59,42,.20)'});
    for(let k=-2;k<=2;k++) a.curve(w=>tri(w-k*ws,WM,1),{color:k===0?C.in:(Math.abs(k)===1?C.mid:C.slate),width:1.4,dash:'4 4',n:1200});
    a.curve(rep,{color:C.err,width:2.4,n:1600});
    return a.svg();},
  err:'Reporting the copies as unchanged and separate because "sampling always makes copies," missing that closeness is exactly what the question asks about. The copies are unchanged in shape; what changed is whether they touch.',
  teach:'Ask for the two edges — $\\omega_s-\\omega_M$ and $\\omega_M$ — to be marked on the same axis before their difference is taken. The overlap is the gap between two marked points, not a formula to be recalled.' },

{ id:'D7-15', module:'M7', type:'alias',
  stem:'The signal $x(t)=\\cos(2\\pi\\cdot450t)$ is sampled at $f_s=800$ Hz.',
  parts:['State whether the sampling theorem is satisfied.',
         'Give the apparent frequency of the sampled sequence.',
         'Sketch the spectral lines involved: the original frequency and the apparent one.'],
  sol:'<b>Given.</b> A $450$ Hz cosine sampled at $800$ Hz.<br>'
     +'<b>Find.</b> The apparent frequency after sampling.<br>'
     +'<b>Method.</b> Sampling replicates the spectrum every $f_s$. A component at $f_0$ appears at the distance from $f_0$ to the nearest multiple of $f_s$, folded into $[0,f_s/2]$.<br>'
     +'<b>Solution — part (a).</b> The Nyquist rate is $2\\times450=900$ Hz, and $800<900$. The theorem is <b>not</b> satisfied, so aliasing occurs.<br>'
     +'<b>Solution — part (b).</b> The nearest multiple of $800$ to $450$ is $800$ itself, so the apparent frequency is$$|450-800|=350\\;\\text{Hz}.$$'
     +'<b>Solution — part (c).</b> The sketch shows a line at $\\pm450$ Hz for $x(t)$ itself, outside the reconstruction band $[-400,400]$ Hz and therefore rejected, and a line at $\\mp350$ Hz, carried in by the neighbouring copy and kept.<br>'
     +'<b>Check.</b> The samples confirm the figure algebraically: $\\cos\\!\\left(2\\pi\\cdot450\\cdot\\tfrac{n}{800}\\right)=\\cos\\!\\left(2\\pi n-2\\pi\\cdot350\\cdot\\tfrac{n}{800}\\right)=\\cos\\!\\left(2\\pi\\cdot350\\cdot\\tfrac{n}{800}\\right)$ for every integer $n$, because $450+350=800=f_s$ removes a whole number of turns. The apparent frequency $350$ Hz lies below $f_s/2=400$ Hz, as any apparent frequency must.',
  figSol:()=>{const a=P.Axes({w:1080,h:250,xr:[-950,950],yr:[-0.35,1.5],xlabel:'f\\;[\\text{Hz}]',ylabel:'\\text{spectral lines}',
      pad:{l:56,r:28,t:30,b:38},xstep:200,yticksOverride:[]});
    a.impulse(450,1.15,{color:C.slate,label:false});
    a.impulse(-450,1.15,{color:C.slate,label:false});
    a.impulse(350,1.15,{color:C.in,label:false});
    a.impulse(-350,1.15,{color:C.in,label:false});
    a.rect(-400,0,400,1.35,{stroke:C.h,dash:'6 4',width:1.6});
    return a.svg();},
  err:'Folding about $f_s/2=400$ Hz directly and reporting $450-400=50$ Hz. The folding point is $f_s$ itself; $f_s/2$ only marks where the kept band ends.',
  teach:'Have the student compute the distance to the nearest multiple of $f_s$, not to $f_s/2$, and then check that the result lies inside $[0,f_s/2]$ as a test of the arithmetic.' },

{ id:'D7-16', module:'M7', type:'alias',
  stem:'The signal $$x(t)=\\cos(2\\pi\\cdot150t)+\\cos(2\\pi\\cdot350t)$$is sampled at $f_s=500$ Hz.',
  parts:['Give the apparent frequency of each component.',
         'Show that the two components alias onto the same apparent frequency, and simplify the sampled sequence.',
         'Besides $350$ Hz, name one further frequency above $500$ Hz whose samples at this rate coincide with those of the $150$ Hz component.'],
  sol:'<b>Given.</b> Two cosines, one below and one above $f_s/2$.<br>'
     +'<b>Find.</b> What each becomes after sampling, and a third frequency with the same samples.<br>'
     +'<b>Method.</b> Fold each frequency to its distance from the nearest multiple of $f_s$; two components with the same apparent frequency have identical samples and cannot be told apart afterward.<br>'
     +'<b>Solution — part (a).</b> The $150$ Hz component is below $f_s/2=250$ Hz, so it is unaffected and appears at $150$ Hz. The $350$ Hz component folds to $|350-500|=150$ Hz. Both land on the same apparent frequency.<br>'
     +'<b>Solution — part (b).</b> The samples are$$x[n]=\\cos\\!\\left(2\\pi\\cdot\\tfrac{150}{500}n\\right)+\\cos\\!\\left(2\\pi\\cdot\\tfrac{350}{500}n\\right)=2\\cos\\!\\left(2\\pi\\cdot\\tfrac{150}{500}n\\right),$$because $\\cos(2\\pi\\cdot\\tfrac{350}{500}n)=\\cos(2\\pi n-2\\pi\\cdot\\tfrac{150}{500}n)=\\cos(2\\pi\\cdot\\tfrac{150}{500}n)$ for every integer $n$, using $350+150=500=f_s$. The sequence is a single cosine of amplitude $2$ at an apparent $150$ Hz; the two original components cannot be separated from it.<br>'
     +'<b>Solution — part (c).</b> $650$ Hz also aliases to $150$ Hz, since $650-500=150$; its samples coincide with those of the $150$ Hz component too.<br>'
     +'<b>Check.</b> The Nyquist rate of the true signal is $2\\times350=700$ Hz, well above $500$, so aliasing was expected. Tabulating four samples confirms the coincidence directly: at $n=0,1,2,3$ the $150$ Hz component alone gives $1,\\,0.309,\\,-0.809,\\,-0.809$, and the $350$ Hz component alone gives the identical four numbers, so no amount of processing applied to the samples after the fact can tell which one produced them.',
  err:'Reporting the apparent frequencies as $150$ Hz and $350$ Hz because both are present in $x(t)$. After sampling, distinguishable content is confined to $[0,f_s/2]$, and two different continuous-time signals can produce identical samples.',
  teach:'Have the two component sequences written out numerically for several $n$ and compared term by term. Seeing four matching numbers is more convincing than the algebra that predicts them.' },

{ id:'D7-17', module:'M7', type:'recon',
  stem:'A signal is sampled with period $T=0.4$ ms and reconstructed with an ideal filter of cutoff $\\omega_c=\\pi/T$. The only non-zero samples are $x(0)=3$ and $x(T)=-2$.',
  parts:['Write $h_{LP}(t)$ in closed form, using the unnormalised sinc convention $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.',
         'Write $x_r(t)$ as a sum of two shifted kernels.',
         'Evaluate $x_r(T)$ directly from the formula, and confirm it matches the given sample.',
         'Evaluate $x_r(1.5T)$.'],
  sol:'<b>Given.</b> Two non-zero samples of a band-limited signal, and the cutoff choice $\\omega_c=\\pi/T$.<br>'
     +'<b>Find.</b> The interpolation kernel and the reconstructed signal at two instants.<br>'
     +'<b>Method.</b> With $\\omega_c=\\pi/T$, the kernel $h_{LP}(t)=\\dfrac{T\\sin(\\omega_ct)}{\\pi t}$ reduces to a single sinc, and $x_r(t)=\\sum_nx(nT)\\,h_{LP}(t-nT)$ has only two non-zero terms here.<br>'
     +'<b>Solution — part (a).</b> $\\omega_c=\\pi/T$ gives $\\dfrac{T\\sin(\\pi t/T)}{\\pi t}=\\dfrac{\\sin(\\pi t/T)}{\\pi t/T}$, so$$h_{LP}(t)=\\operatorname{sinc}\\!\\left(\\frac{\\pi t}{T}\\right).$$'
     +'<b>Solution — part (b).</b>$$x_r(t)=3\\,h_{LP}(t)-2\\,h_{LP}(t-T).$$'
     +'<b>Solution — part (c).</b> $h_{LP}(0)=\\operatorname{sinc}(0)=1$ and $h_{LP}(T)=\\operatorname{sinc}(\\pi)=\\dfrac{\\sin\\pi}{\\pi}=0$, so$$x_r(T)=3\\,h_{LP}(T)-2\\,h_{LP}(0)=3(0)-2(1)=-2=x(T).$$'
     +'<b>Solution — part (d).</b> $h_{LP}(1.5T)=\\operatorname{sinc}(1.5\\pi)=\\dfrac{-1}{1.5\\pi}=-\\dfrac{2}{3\\pi}$ and $h_{LP}(0.5T)=\\operatorname{sinc}(0.5\\pi)=\\dfrac{1}{0.5\\pi}=\\dfrac{2}{\\pi}$, so$$x_r(1.5T)=3\\left(-\\frac{2}{3\\pi}\\right)-2\\left(\\frac{2}{\\pi}\\right)=-\\frac{2}{\\pi}-\\frac{4}{\\pi}=-\\frac{6}{\\pi}\\approx-1.910.$$'
     +'<b>Check.</b> Part (c) is itself the general property of the kernel — $h_{LP}$ equals $1$ at its own sample instant and $0$ at every other integer multiple of $T$ — applied to a specific pair of samples rather than assumed; that the arithmetic actually returns the given value $-2$, and not some other number, is the independent test that the formula was built correctly.',
  figSol:()=>{
    const a=P.Axes({w:1080,h:270,xr:[-1.6,3.6],yr:[-1.3,3.4],xlabel:'t/T',ylabel:'x_r(t)',
      pad:{l:60,r:28,t:32,b:38},xtarget:8,ytarget:4});
    a.curve(u=>3*sinc(PI*u),{color:C.slate,width:1.2,opacity:.55,n:2000});
    a.curve(u=>-2*sinc(PI*(u-1)),{color:C.slate,width:1.2,opacity:.55,n:2000});
    a.curve(u=>3*sinc(PI*u)-2*sinc(PI*(u-1)),{color:C.out,width:2.4,n:2000});
    a.point(0,3,{color:C.coral,r:4});
    a.point(1,-2,{color:C.coral,r:4});
    return a.svg();},
  err:'Evaluating the kernel at the wrong integer, for instance mistaking $\\operatorname{sinc}(\\pi)$ for $\\operatorname{sinc}(0)$ and getting $1$ instead of $0$. The kernel is $1$ only at its own sample instant.',
  teach:'Ask for $h_{LP}(nT)$ to be tabulated at three or four integers before $x_r(t)$ is built from it. A student who cannot produce the table cannot be trusted with the sum.' },

{ id:'D7-18', module:'M7', type:'recon',
  stem:'A zero-order hold has sampling period $T=0.25$ ms.',
  parts:['Give $H_0(j\\omega)$ in closed form.',
         'Evaluate $H_0(0)$ and compare it with the ideal reconstruction filter\u2019s gain.',
         'Evaluate $|H_0(j\\pi/T)|$, and give it as a fraction of the ideal gain.'],
  sol:'<b>Given.</b> A zero-order hold, impulse response $h_0(t)=1$ for $0\\le t<T$ and zero elsewhere.<br>'
     +'<b>Find.</b> The frequency response and how it compares with an ideal filter of gain $T$.<br>'
     +'<b>Method.</b> Transform the rectangle directly, then take the limit at $\\omega=0$ and evaluate the magnitude at $\\omega=\\pi/T$.<br>'
     +'<b>Solution — part (a).</b>$$H_0(j\\omega)=\\int_0^Te^{-j\\omega t}\\,\\d t=\\frac{1-e^{-j\\omega T}}{j\\omega}=e^{-j\\omega T/2}\\,\\frac{2\\sin(\\omega T/2)}{\\omega}.$$'
     +'<b>Solution — part (b).</b> As $\\omega\\to0$, $\\sin(\\omega T/2)\\to\\omega T/2$, so$$H_0(0)=\\lim_{\\omega\\to0}\\frac{2\\sin(\\omega T/2)}{\\omega}=T,$$exactly the gain the ideal reconstruction filter needs.<br>'
     +'<b>Solution — part (c).</b> At $\\omega=\\pi/T$, $\\omega T/2=\\pi/2$ and $\\sin(\\pi/2)=1$, so$$\\bigl|H_0(j\\pi/T)\\bigr|=\\left|\\frac{2\\sin(\\pi/2)}{\\pi/T}\\right|=\\frac{2T}{\\pi}=\\frac{2(2.5\\times10^{-4})}{\\pi}\\approx1.592\\times10^{-4},$$which is $\\dfrac{2T/\\pi}{T}=\\dfrac{2}{\\pi}\\approx63.7\\%$ of the ideal gain $T$.<br>'
     +'<b>Check.</b> The ratio $2/\\pi$ at $\\omega=\\pi/T$ does not depend on $T$ at all — it is a property of the shape of $H_0$, not of the sampling rate — so repeating the calculation at any other period gives the same $63.7\\%$ figure. This is an independent confirmation that the sag is a feature of the hold itself, not an artefact of the particular $T$ chosen here.',
  figSol:()=>{const T=2.5e-4;
    const a=P.Axes({w:1080,h:270,xr:[-6000*PI,6000*PI],yr:[-0.00003,0.00032],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'|H_0(j\\omega)|',
      pad:{l:78,r:28,t:32,b:38},xstep:2000*PI,
      xticksOverride:wTicks(-6000*PI,6000*PI,2000*PI),xtickfmt:piTick});
    a.curve(w=>Math.abs(w)<1e-6?T:Math.abs(2*Math.sin(w*T/2)/w),{color:C.h,n:2400});
    a.hline(T,{color:C.slate});
    a.point(PI/T,2*T/PI,{color:C.coral,r:4});
    a.point(-PI/T,2*T/PI,{color:C.coral,r:4});
    return a.svg();},
  err:'Treating $H_0(0)$ as undefined because the closed form has $\\omega$ in the denominator, instead of taking the limit. The gain at the origin is exactly $T$, not a removable nuisance.',
  teach:'Have the small-angle approximation $\\sin x\\approx x$ written out at $\\omega=0$ before the limit is declared. The limit is then arithmetic, not a rule taken on faith.' },

{ id:'D7-19', module:'M7', type:'recon',
  stem:'The signal $x(t)=\\cos(50\\pi t)+\\cos(140\\pi t)$ is sampled at $f_s=100$ Hz and reconstructed with cutoff $\\omega_c=\\omega_s/2$.',
  parts:['Without any filter ahead of the sampler, give the reconstructed signal and the error $e(t)=x(t)-x_r(t)$.',
         'With a lowpass filter of cutoff $\\omega_s/2$ placed ahead of the sampler, give the reconstructed signal and the error.',
         'Compute the time-averaged mean-square error in both cases and compare them.'],
  figure:()=>P.blocks({w:900,h:180,items:[
    {t:'arrow',x1:20,y1:96,x2:120,y2:96},
    {t:'box',x:120,y:66,w:170,h:60,label:'H_{AA}(j\\omega)',tex:true,fs:16},
    {t:'arrow',x1:290,y1:96,x2:400,y2:96},
    {t:'box',x:400,y:66,w:140,h:60,label:'sampler',fs:15},
    {t:'arrow',x1:540,y1:96,x2:650,y2:96},
    {t:'box',x:650,y:66,w:140,h:60,label:'H_r(j\\omega)',tex:true,fs:16},
    {t:'arrow',x1:790,y1:96,x2:880,y2:96},
    {t:'text',x:68,y:78,label:'x(t)',tex:true,fs:15,color:C.in},
    {t:'text',x:345,y:78,label:'\\tilde{x}(t)',tex:true,fs:15,color:C.h},
    {t:'text',x:595,y:78,label:'x_p(t)',tex:true,fs:15,color:C.mid},
    {t:'text',x:838,y:78,label:'x_r(t)',tex:true,fs:15,color:C.out}
  ]}),
  sol:'<b>Given.</b> A signal with $\\omega_M=140\\pi$ rad/s, sampled at $\\omega_s=200\\pi$ rad/s — below its Nyquist rate of $280\\pi$ — and reconstructed with cutoff at $\\omega_s/2=100\\pi$.<br>'
     +'<b>Find.</b> The output and the error, with and without a filter ahead of the sampler.<br>'
     +'<b>Method.</b> A component below the cutoff survives unchanged. A component above it aliases to $|\\omega_s-\\omega_0|$ if no filter removes it first; if a filter removes it before the sampler, it never reaches the reconstruction at all.<br>'
     +'<b>Solution — part (a).</b> $50\\pi<100\\pi$ survives unchanged. $140\\pi>100\\pi$ aliases to $|200\\pi-140\\pi|=60\\pi$. So$$x_r(t)=\\cos(50\\pi t)+\\cos(60\\pi t),\\qquad e(t)=\\cos(140\\pi t)-\\cos(60\\pi t).$$'
     +'<b>Solution — part (b).</b> The filter removes the $140\\pi$ component before the sampler ever sees it, leaving $\\tilde{x}(t)=\\cos(50\\pi t)$, safely below its own Nyquist rate of $100\\pi$ at this sampling rate. So$$x_r(t)=\\cos(50\\pi t),\\qquad e(t)=\\cos(140\\pi t).$$'
     +'<b>Solution — part (c).</b> Each cosine has mean-square value $\\tfrac12$, and the cross term of two cosines at different, non-zero frequencies averages to zero over time, so$$\\overline{e^2}\\Big|_{\\text{no filter}}=\\tfrac12+\\tfrac12=1,\\qquad\\overline{e^2}\\Big|_{\\text{filtered}}=\\tfrac12.$$Filtering first halves the error power.<br>'
     +'<b>Check.</b> The two error signals can be compared directly at $t=0$: $e_{\\text{no filter}}(0)=1-1=0$ while $e_{\\text{filtered}}(0)=1$, so the two curves are not simply scaled copies of one another — the reduction in part (c) is a statement about their average size, not about them matching pointwise, which the mean-square computation, and only that computation, correctly captures.',
  figSol:()=>{
    const a=P.Axes({w:1080,h:260,xr:[-0.02,0.1],yr:[-2.3,2.3],xlabel:'t\\;[\\text{s}]',ylabel:'\\text{error}\\;e(t)',
      pad:{l:60,r:28,t:30,b:38},xtarget:6,ytarget:3});
    a.curve(t=>Math.cos(140*PI*t)-Math.cos(60*PI*t),{color:C.err,width:2.2,n:2400});
    a.curve(t=>Math.cos(140*PI*t),{color:C.out,width:2.0,n:2400});
    a.note(0.095,2.02,'\\text{no filter}',{anchor:'end',color:C.err,fs:12,tex:true});
    a.note(0.095,-2.1,'\\text{filtered first}',{anchor:'end',color:C.out,fs:12,tex:true});
    return a.svg();},
  err:'Placing the same filter after the sampler and expecting the same reduction. By then the two components have already added together at the alias frequency, and no filter can separate a sum back into its two addends.',
  teach:'Ask what the filter would have to do to "un-add" two numbers it receives already combined into one. The impossibility of that operation is the whole argument for placing it first.' },

{ id:'D7-20', module:'M7', type:'recon',
  stem:'Let $$x(t)=5+3\\cos(1200\\pi t)+6\\sin(3600\\pi t),$$sampled exactly at its own Nyquist rate.',
  parts:['Give $\\omega_M$ and confirm $\\omega_s=2\\omega_M=7200\\pi$ rad/s, so $T=1/3600$ s.',
         'Show directly from the samples that the $\\sin(3600\\pi t)$ term contributes nothing.',
         'Show the same result in the frequency domain, from the weights the baseband and the $k=1$ copy carry at $\\omega=3600\\pi$.',
         'A guard band of $\\omega_g=400\\pi$ rad/s is now required. Give the new minimum sampling rate.'],
  sol:'<b>Given.</b> A constant, a cosine, and a sine, sampled exactly at the Nyquist rate of the fastest term.<br>'
     +'<b>Find.</b> What happens to the fastest term at that rate, both from the samples and from the spectrum, and the rate a guard band then requires.<br>'
     +'<b>Method.</b> $\\omega_M$ is the largest frequency present. At the Nyquist rate the admissible cutoff interval $\\omega_M<\\omega_c<\\omega_s-\\omega_M$ is empty, so nothing here is a safety margin; the sine term is examined directly.<br>'
     +'<b>Solution — part (a).</b> The frequencies present are $0$, $1200\\pi$ and $3600\\pi$ rad/s, so $\\omega_M=3600\\pi$ rad/s, and $\\omega_s=2\\times3600\\pi=7200\\pi$ rad/s gives $T=2\\pi/7200\\pi=1/3600$ s.<br>'
     +'<b>Solution — part (b).</b> At the sample instants,$$\\sin(3600\\pi\\,nT)=\\sin\\!\\left(3600\\pi\\cdot\\frac{n}{3600}\\right)=\\sin(\\pi n)=0\\quad\\text{for every integer }n.$$Every sample of the sine term is taken at a zero crossing; the sampler never sees it.<br>'
     +'<b>Solution — part (c).</b> The transform of $6\\sin(3600\\pi t)$ is $\\dfrac{6\\pi}{j}\\bigl[\\delta(\\omega-3600\\pi)-\\delta(\\omega+3600\\pi)\\bigr]$. In $X_p(j\\omega)=\\tfrac1T\\sum_kX\\bigl(j(\\omega-k\\omega_s)\\bigr)$, at $\\omega=3600\\pi$ the $k=0$ term contributes $\\tfrac1T\\cdot\\tfrac{6\\pi}{j}$ and the $k=1$ term contributes $\\tfrac1T X\\bigl(j(3600\\pi-7200\\pi)\\bigr)=\\tfrac1T\\cdot\\left(-\\tfrac{6\\pi}{j}\\right)$, so$$\\frac{6\\pi}{jT}-\\frac{6\\pi}{jT}=0.$$'
     +'<b>Solution — part (d).</b>$$\\omega_s\\ge2\\omega_M+\\omega_g=7200\\pi+400\\pi=7600\\pi\\;\\text{rad/s}\\qquad(f_s\\ge3800\\;\\text{Hz}).$$'
     +'<b>Check.</b> Parts (b) and (c) reach the same conclusion — the sine term vanishes — by two routes that share no algebra: one works entirely in the time domain with a single sine evaluated at integers, the other works entirely in the frequency domain with impulse weights carried in from a neighbouring copy. That they agree is what confirms neither contains an isolated slip. Setting $\\omega_g=0$ in part (d) returns exactly the rate of part (a), as it must.',
  figSol:()=>{
    const a=P.Axes({w:1080,h:250,xr:[-4500*PI,4500*PI],yr:[-2.1,1.6],xlabel:'\\omega\\;[\\text{rad/s}]',ylabel:'\\text{sine term of }X_p(j\\omega)',
      pad:{l:78,r:28,t:30,b:38},yticksOverride:[],
      xticksOverride:[0],xtickfmt:v=>{const k=Math.round(v/PI); return k===0?'0':k+'π';}});
    a.impulse(3600*PI,1.1,{color:C.in,label:false});
    a.impulse(-3600*PI,-1.1,{color:C.in,label:false});
    a.impulse(3600*PI,-1.1,{color:C.mid,label:false});
    a.impulse(-3600*PI,1.1,{color:C.mid,label:false});
    a.note(3600*PI,-1.72,'3600\\pi',{anchor:'middle',color:C.muted,fs:12,tex:true});
    a.note(-3600*PI,-1.72,'-3600\\pi',{anchor:'middle',color:C.muted,fs:12,tex:true});
    return a.svg();},
  err:'Writing $\\omega_s\\ge2\\omega_M+\\omega_g$ but forgetting to re-identify $\\omega_M$ as the sine term\u2019s frequency, since $3600\\pi$ is the larger of the two non-zero frequencies present, not the cosine term\u2019s $1200\\pi$.',
  teach:'Have every frequency present in $x(t)$ listed and ordered before $\\omega_M$ is named, exactly as in the very first question of this drill. The habit that opens the module is the one that closes it.' },

/* ----------------------------------------------------------------------
   Full-length questions. Several signals under one statement, each
   needing its own spectrum before a rate can be quoted.
   ---------------------------------------------------------------------- */

{ id:'D7-21', module:'M7', type:'full', src:'Final Q4',
  stem:'Determine the Nyquist sampling rate for each of the following signals.',
  parts:['$y(t)=x(t)+x^{2}(t)$, where $x(t)=\\cos(80\\pi t)+\\cos(160\\pi t)$.',
         '$y(t)=\\dfrac{\\sin(80\\pi t)}{\\pi t}\\left[1+e^{j200\\pi t}\\right]$.',
         '$y(t)=\\dfrac{\\sin(80\\pi t)}{\\pi t}*\\dfrac{\\sin(240\\pi t)}{\\pi t}$, where $*$ is the convolution operator.'],
  sol:'<b>Given.</b> Three signals built from the same few ingredients by squaring, modulating and convolving.<br>'
     +'<b>Find.</b> The Nyquist rate $\\omega_s=2\\omega_M$ for each.<br>'
     +'<b>Method.</b> Find $\\omega_M$ from the spectrum, never from the expression. Squaring and multiplying widen the band; convolving narrows it.<br>'
     +'<b>Solution — part (a).</b> Expanding the square,$$x^{2}(t)=\\tfrac12\\left[1+\\cos(160\\pi t)\\right]+\\cos(240\\pi t)+\\cos(80\\pi t)+\\tfrac12\\left[1+\\cos(320\\pi t)\\right],$$so $y$ contains frequencies $0$, $80\\pi$, $160\\pi$, $240\\pi$ and $320\\pi$. Hence $\\omega_M=320\\pi$ and$$\\omega_s=2\\omega_M=640\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> The sinc gives a rectangle on $|\\omega|<80\\pi$. The factor $e^{j200\\pi t}$ adds a copy of that rectangle shifted to $120\\pi<\\omega<280\\pi$. The spectrum therefore runs from $-80\\pi$ to $280\\pi$, so $\\omega_M=280\\pi$ and$$\\omega_s=2\\omega_M=560\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> Convolution in time is multiplication in frequency, so the spectrum is the product of a rectangle on $|\\omega|<80\\pi$ and one on $|\\omega|<240\\pi$: the narrower one survives. Then $\\omega_M=80\\pi$ and$$\\omega_s=2\\omega_M=160\\pi\\;\\text{rad/s}.$$'
     +'<b>Check.</b> The three parts move in three different directions, which is the point of the question. Squaring doubled the highest frequency, $160\\pi\\to320\\pi$; modulating pushed the band up without widening it, so the rate rose because $\\omega_M$ is measured from the origin; convolving kept only the narrower band, so the required rate fell below what either factor alone would need. A student who reports $560\\pi$ for part (c) has multiplied the bandwidths instead of the spectra.',
  err:'Answering part (c) with the wider band, $240\\pi$, by treating convolution as though it added supports. Convolution in <em>time</em> multiplies the spectra, so the support of the result is the intersection of the two, not their sum; it is multiplication in time that adds supports.',
  teach:'Set parts (a) and (c) beside each other. Both combine two signals; one widens the band and one narrows it, and the difference is only whether the combining happens in time as a product or as a convolution. Getting that pair straight is most of this module.' },

{ id:'D7-22', module:'M7', type:'full', src:'Final Q4',
  stem:'Plot the Fourier transforms of each of the signals given below and determine the Nyquist sampling frequencies (in rad/s) for each of these signals.',
  parts:['$x(t)=\\dfrac{\\sin(30\\pi t)}{\\pi t}+\\cos(40\\pi t)$.',
         '$x(t)=\\cos(30\\pi t)\\cos(70\\pi t)$.',
         '$x(t)=\\dfrac{\\sin(30\\pi t)}{\\pi t}\\,\\dfrac{\\sin(60\\pi t)}{\\pi t}$.'],
  sol:'<b>Given.</b> A sinc plus a cosine, a product of two cosines, and a product of two sincs.<br>'
     +'<b>Find.</b> The spectra and the Nyquist frequencies.<br>'
     +'<b>Method.</b> Transform each, read $\\omega_M$ off the result, and double it.<br>'
     +'<b>Solution — part (a).</b> The sinc gives a rectangle of height $1$ on $|\\omega|<30\\pi$; the cosine gives impulses of weight $\\pi$ at $\\omega=\\pm40\\pi$. The impulses lie outside the rectangle, so$$\\omega_M=40\\pi,\\qquad\\omega_s=80\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> Use the product-to-sum identity:$$\\cos(30\\pi t)\\cos(70\\pi t)=\\tfrac12\\cos(100\\pi t)+\\tfrac12\\cos(40\\pi t),$$giving impulses at $\\pm40\\pi$ and $\\pm100\\pi$. So$$\\omega_M=100\\pi,\\qquad\\omega_s=200\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> A product in time is a convolution in frequency, so the two rectangles convolve into a trapezoid. Its support is the sum of the two half-widths:$$30\\pi+60\\pi=90\\pi,$$with a flat top on $|\\omega|<30\\pi$. Hence$$\\omega_M=90\\pi,\\qquad\\omega_s=180\\pi\\;\\text{rad/s}.$$'
     +'<b>Check.</b> In (b), the two output frequencies are the sum and difference of the two inputs, $70\\pi\\pm30\\pi$, and the larger of them is what sets the rate — not $70\\pi$, which is the largest frequency written down. In (c) the trapezoid height is $2\\min(30\\pi,60\\pi)/(2\\pi)$, but only its width matters here. Comparing (c) with part (c) of the previous question makes the rule concrete: a product of sincs widens, a convolution of sincs narrows.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-130,130],yr:[-0.5,4],xlabel:'\\omega/\\pi',ylabel:'X(j\\omega)\\;\\text{of (a)}',
      pad:{l:60,r:26,t:28,b:38},xstep:50,ystep:1});
      a.poly([[-130,0],[-30,0],[-30,1],[30,1],[30,0],[130,0]],{color:C.in});
      a.impulse(-40,3,{color:C.mid}); a.impulse(40,3,{color:C.mid});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-130,130],yr:[-0.15,1.35],xlabel:'\\omega/\\pi',ylabel:'X(j\\omega)\\;\\text{of (c)}',
      pad:{l:60,r:26,t:28,b:38},xstep:50,ystep:0.5});
      a.poly([[-130,0],[-90,0],[-30,1],[30,1],[90,0],[130,0]],{color:C.out});
      return a.svg();})()),
  err:'Quoting $\\omega_M=70\\pi$ in part (b) from the higher of the two written frequencies. Neither $30\\pi$ nor $70\\pi$ is present in the product: the identity replaces them by their sum and difference, and only the sum sets the rate.',
  teach:'Ask for part (b) drawn as a spectrum before the rate is quoted. Two impulse pairs at $40\\pi$ and $100\\pi$, and nothing at $30\\pi$ or $70\\pi$, is a picture students remember better than the identity itself.' },

{ id:'D7-23', module:'M7', type:'full', src:'Final Q4',
  stem:'Plot the Fourier transforms of each of the signals given below, and determine the Nyquist sampling frequencies (in rad/s) for each of these signals while considering a guard band of $\\omega_g=80\\pi$ rad/s.',
  parts:['$x(t)=\\dfrac{\\sin(120\\pi t)}{\\pi t}+\\dfrac{\\sin(240\\pi t)}{\\pi t}$.',
         '$h(t)=x(t)\\cos(160\\pi t)$.',
         '$y(t)=x(t)*h(t)$, where $*$ is the convolution operator.'],
  sol:'<b>Given.</b> A sum of two sincs, its modulated version, and the convolution of the two.<br>'
     +'<b>Find.</b> The three spectra and the sampling frequency for each, with a guard band.<br>'
     +'<b>Method.</b> With a guard band the requirement is $\\omega_s\\ge2\\omega_M+\\omega_g$, so each part still turns on finding $\\omega_M$.<br>'
     +'<b>Solution — part (a).</b> The two sincs give rectangles of height $1$ on $|\\omega|<120\\pi$ and on $|\\omega|<240\\pi$. Adding, $X=2$ on $|\\omega|<120\\pi$ and $X=1$ on $120\\pi<|\\omega|<240\\pi$. So $\\omega_M=240\\pi$ and$$\\omega_s\\ge2(240\\pi)+80\\pi=560\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> Modulation makes two half-height copies of $X$ centred at $\\pm160\\pi$:$$H(j\\omega)=\\tfrac12X(j(\\omega-160\\pi))+\\tfrac12X(j(\\omega+160\\pi)).$$The upper copy reaches $160\\pi+240\\pi=400\\pi$, so $\\omega_M=400\\pi$ and$$\\omega_s\\ge2(400\\pi)+80\\pi=880\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> Convolution in time multiplies the spectra, $Y=XH$. The factor $X$ is zero beyond $240\\pi$, so whatever $H$ does above that is irrelevant and $\\omega_M=240\\pi$. Then$$\\omega_s\\ge2(240\\pi)+80\\pi=560\\pi\\;\\text{rad/s},$$the same as part (a).<br>'
     +'<b>Check.</b> Part (c) must not exceed part (a): multiplying two spectra can only shrink the support, never grow it, so the rate for $y$ can be no larger than the rate for $x$. It comes out equal here because $H$ is non-zero throughout $|\\omega|<240\\pi$ — the two copies overlap the whole of $X$. Had the carrier been higher, $H$ would have vanished near the origin and the answer to (c) would have been smaller.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-300,300],yr:[-0.3,2.6],xlabel:'\\omega/\\pi',ylabel:'X(j\\omega)',
      pad:{l:60,r:26,t:28,b:38},xstep:100,ystep:1});
      a.poly([[-300,0],[-240,0],[-240,1],[-120,1],[-120,2],[120,2],[120,1],[240,1],[240,0],[300,0]],{color:C.in});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-460,460],yr:[-0.2,1.6],xlabel:'\\omega/\\pi',ylabel:'H(j\\omega)',
      pad:{l:60,r:26,t:28,b:38},xstep:200,ystep:0.5});
      const seg=c=>[[c-240,0],[c-240,0.5],[c-120,0.5],[c-120,1],[c+120,1],[c+120,0.5],[c+240,0.5],[c+240,0]];
      a.poly([[-460,0]].concat(seg(-160)).concat(seg(160)).concat([[460,0]]),{color:C.mid});
      return a.svg();})()),
  err:'Adding the guard band once for the whole question instead of to each part separately, or adding $\\omega_g$ to $\\omega_M$ before doubling. The requirement is $2\\omega_M+\\omega_g$, not $2(\\omega_M+\\omega_g)$, and the difference here is $80\\pi$ against $160\\pi$.',
  teach:'Part (c) is worth asking about before it is computed: can convolving two signals ever require a higher rate than one of them alone? The answer is no, and seeing why saves the calculation.' },

{ id:'D7-24', module:'M7', type:'full', src:'Final Q4',
  stem:'A signal $x(t)=3\\cos(200\\pi t)+2\\sin(500\\pi t)$ is sampled at $f_s=400$ Hz.',
  parts:['Determine the Nyquist rate of $x(t)$ in hertz.',
         'State which components alias at $f_s=400$ Hz, and give the apparent frequency of each.',
         'Write the continuous-time signal that the samples appear to have come from.'],
  sol:'<b>Given.</b> Two sinusoids at $100$ Hz and $250$ Hz, sampled at $400$ Hz.<br>'
     +'<b>Find.</b> The Nyquist rate, which components alias, and the signal the samples imitate.<br>'
     +'<b>Method.</b> Convert every frequency to hertz first. A component below $f_s/2$ survives; one above it folds to $|f-f_s|$.<br>'
     +'<b>Solution — part (a).</b> The frequencies are $\\dfrac{200\\pi}{2\\pi}=100$ Hz and $\\dfrac{500\\pi}{2\\pi}=250$ Hz, so $f_M=250$ Hz and the Nyquist rate is$$f_s>2f_M=500\\;\\text{Hz}.$$Sampling at $400$ Hz is below this, so aliasing is expected.<br>'
     +'<b>Solution — part (b).</b> The folding frequency is $f_s/2=200$ Hz. The $100$ Hz component is below it and is unaffected. The $250$ Hz component is above it and folds to$$|250-400|=150\\;\\text{Hz}.$$'
     +'<b>Solution — part (c).</b> The folding also reverses the sign of a sine, because $\\sin\\left(2\\pi(f-f_s)t\\right)$ evaluated at $t=n/f_s$ equals $-\\sin(2\\pi ft)$ at those instants when $f>f_s/2$ in this way. So the samples are indistinguishable from those of$$x_a(t)=3\\cos(200\\pi t)-2\\sin(300\\pi t).$$'
     +'<b>Check.</b> Test one sample. At $n=1$, $t=\\tfrac{1}{400}$: the original gives $3\\cos\\!\\left(\\tfrac{\\pi}{2}\\right)+2\\sin\\!\\left(\\tfrac{5\\pi}{4}\\right)=0-\\sqrt2$, and the alias gives $3\\cos\\!\\left(\\tfrac{\\pi}{2}\\right)-2\\sin\\!\\left(\\tfrac{3\\pi}{4}\\right)=0-\\sqrt2$. The two agree, as they must at every sampling instant, and disagree everywhere between them.',
  err:'Reporting the apparent frequency as $250-200=50$ Hz by folding about $f_s/2$ instead of about $f_s$. The image of $f$ is at $f-f_s$, so a component at $250$ Hz appears at $-150$ Hz, that is at $150$ Hz with a sign change, not at $50$ Hz.',
  teach:'The single-sample check in the answer is the exercise to set. Two different signals agreeing at every sampling instant is what aliasing <em>is</em>, and verifying it at one instant makes the statement concrete rather than a rule about inequalities.' },

{ id:'D7-25', module:'M7', type:'full', src:'Final Q4',
  stem:'A band-limited signal has $X(j\\omega)=0$ for $|\\omega|>1000\\pi$ and is sampled with an impulse train of period $T=\\tfrac{1}{1500}$ s.',
  parts:['Give the sampling frequency $\\omega_s$ and say whether the Nyquist condition is met.',
         'Describe the spectrum of the sampled signal $x_p(t)$ and the width of the gap between copies.',
         'Give an ideal reconstruction filter that recovers $x(t)$ exactly, with its gain and a valid cut-off.'],
  sol:'<b>Given.</b> A signal band-limited to $1000\\pi$ rad/s, sampled at $1500$ samples per second.<br>'
     +'<b>Find.</b> The sampling frequency, the spectrum after sampling, and a reconstruction filter.<br>'
     +'<b>Method.</b> Sampling replicates the spectrum at multiples of $\\omega_s$ and scales it by $1/T$. The Nyquist condition is what keeps the copies apart.<br>'
     +'<b>Solution — part (a).</b>$$\\omega_s=\\frac{2\\pi}{T}=2\\pi\\cdot1500=3000\\pi\\;\\text{rad/s}.$$The Nyquist condition needs $\\omega_s>2\\omega_M=2000\\pi$, and $3000\\pi>2000\\pi$, so it is met.<br>'
     +'<b>Solution — part (b).</b>$$X_p(j\\omega)=\\frac{1}{T}\\sum_{k=-\\infty}^{\\infty}X\\!\\left(j(\\omega-k\\omega_s)\\right)=1500\\sum_{k}X\\!\\left(j(\\omega-3000\\pi k)\\right),$$copies of $X$ spaced $3000\\pi$ apart, each scaled by $1500$. The copy at the origin ends at $1000\\pi$ and the next begins at $3000\\pi-1000\\pi=2000\\pi$, so the gap between them is$$2000\\pi-1000\\pi=1000\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> The filter must keep the copy at the origin and reject the others, so its cut-off $\\omega_c$ may be anywhere in $1000\\pi<\\omega_c<2000\\pi$. Its gain must undo the factor $\\tfrac1T$, so it is $T$:$$H(j\\omega)=\\begin{cases}T=\\tfrac{1}{1500},&|\\omega|<\\omega_c\\\\0,&\\text{otherwise,}\\end{cases}$$and the midpoint $\\omega_c=1500\\pi$ is the usual choice, since it leaves the largest margin on both sides.<br>'
     +'<b>Check.</b> The gap of $1000\\pi$ is exactly $\\omega_s-2\\omega_M=3000\\pi-2000\\pi$, as it must be, and it is positive precisely because the Nyquist condition holds. Sampling at $2000\\pi$ instead would close the gap to zero, leaving the copies touching and the choice of $\\omega_c$ forced to a single value.',
  err:'Giving the reconstruction gain as $1/T$. The sampling step multiplied the spectrum by $1/T$, so the filter has to multiply by $T$ to return it; using $1/T$ leaves the recovered signal too large by $T^{2}$.',
  teach:'The permitted range for $\\omega_c$ is worth stating as a range and not as a number. Students who memorise $\\omega_s/2$ are stuck when the guard band is asymmetric; students who know the copy edges can place the cut-off anywhere it belongs.' },

{ id:'D7-26', module:'M7', type:'full', src:'Final Q4',
  stem:'An audio channel is sampled at $f_s=8$ kHz with no anti-aliasing filter. Four pure tones are applied in turn: $3$ kHz, $5$ kHz, $9$ kHz and $12$ kHz.',
  parts:['Give the folding frequency and say which tones are sampled correctly.',
         'Give the apparent frequency of each tone after sampling.',
         'Two of the four tones become indistinguishable. Identify them and say what filter placed where would have prevented it.'],
  sol:'<b>Given.</b> A sampler at $8$ kHz and four input tones.<br>'
     +'<b>Find.</b> Which tones alias, where each lands, and how to prevent the collision.<br>'
     +'<b>Method.</b> Fold each frequency into $0\\le f\\le f_s/2$ by subtracting the nearest multiple of $f_s$ and taking the magnitude.<br>'
     +'<b>Solution — part (a).</b> The folding frequency is $f_s/2=4$ kHz. Only the $3$ kHz tone lies below it, so only that one is sampled correctly.<br>'
     +'<b>Solution — part (b).</b> Folding each in turn:$$3\\;\\text{kHz}\\to3\\;\\text{kHz},$$$$5\\;\\text{kHz}\\to|5-8|=3\\;\\text{kHz},$$$$9\\;\\text{kHz}\\to|9-8|=1\\;\\text{kHz},$$$$12\\;\\text{kHz}\\to|12-8|=4\\;\\text{kHz}.$$'
     +'<b>Solution — part (c).</b> The $3$ kHz and $5$ kHz tones both appear at $3$ kHz, and no processing after the sampler can separate them: their samples are identical sequences. The remedy is an anti-aliasing low-pass filter with cut-off at or below $4$ kHz, placed <em>before</em> the sampler, which removes the $5$ kHz tone while leaving the $3$ kHz one untouched.<br>'
     +'<b>Check.</b> Each folded value is at most $4$ kHz, as it must be. The pattern $3,3,1,4$ shows the characteristic reflection: frequencies above $4$ kHz map back down, and $12$ kHz, being $8$ kHz above $4$, lands exactly on the folding frequency. A tone at $8$ kHz would map to $0$ — a sinusoid sampled once per cycle looks like a constant.',
  err:'Placing the anti-aliasing filter after the sampler. Once two tones have produced the same sequence of numbers, no filter can tell them apart; the filter has to remove the offending component while it is still a continuous-time signal.',
  teach:'Ask what a tone at exactly $8$ kHz would look like. It samples to a constant, which is the most extreme alias there is, and it explains why the condition is a strict inequality rather than $\\ge$.' },

{ id:'D7-27', module:'M7', type:'full', src:'Final Q4',
  stem:'Determine the Nyquist sampling rate for each of the following signals.',
  parts:['$y(t)=\\cos^{2}(300\\pi t)$.',
         '$y(t)=\\dfrac{\\sin(100\\pi t)}{\\pi t}\\cos(400\\pi t)$.',
         '$y(t)=\\left[\\dfrac{\\sin(150\\pi t)}{\\pi t}\\right]^{2}$.'],
  sol:'<b>Given.</b> A squared cosine, a modulated sinc, and a squared sinc.<br>'
     +'<b>Find.</b> The Nyquist rate for each.<br>'
     +'<b>Method.</b> Squaring in time doubles the band; modulating shifts it without widening it, but moves $\\omega_M$ up.<br>'
     +'<b>Solution — part (a).</b>$$\\cos^{2}(300\\pi t)=\\tfrac12+\\tfrac12\\cos(600\\pi t),$$so the frequencies present are $0$ and $600\\pi$. Then $\\omega_M=600\\pi$ and$$\\omega_s=1200\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> The sinc gives a rectangle on $|\\omega|<100\\pi$; multiplying by $\\cos(400\\pi t)$ makes two half-height copies centred at $\\pm400\\pi$, so the spectrum occupies $300\\pi<|\\omega|<500\\pi$. Then $\\omega_M=500\\pi$ and$$\\omega_s=1000\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> Squaring in time convolves the spectrum with itself, so the rectangle on $|\\omega|<150\\pi$ becomes a triangle on $|\\omega|<300\\pi$. Then $\\omega_M=300\\pi$ and$$\\omega_s=600\\pi\\;\\text{rad/s}.$$'
     +'<b>Check.</b> Each part doubles or shifts in a way that can be stated in one line. In (a) the square of a single cosine has twice its frequency and a constant, so the rate doubles. In (c) the square of a sinc has twice its bandwidth, so the rate doubles again. In (b) nothing was squared and the band did not widen — it moved, and the rate rose because $\\omega_M$ is measured from the origin and not across the band. That last distinction is why a band-pass signal can sometimes be sampled far below its Nyquist rate, a case this course does not pursue.',
  err:'Answering part (a) with $600\\pi$, treating $300\\pi$ as the highest frequency and doubling it. The squaring has already doubled the frequency to $600\\pi$; the Nyquist rate doubles that again.',
  teach:'Parts (a) and (c) are the same operation on two different signals, and both double the band. Ask students to state the rule once — squaring in time doubles the bandwidth — and then apply it to both without recomputing.' },

{ id:'D7-28', module:'M7', type:'full', src:'Final Q4',
  stem:'A signal $x(t)$ is band-limited to $|\\omega|<600\\pi$ and is sampled at $\\omega_s=2000\\pi$ rad/s to give the sequence $x[n]=x(nT)$. Every second sample is then discarded, giving $v[n]=x[2n]$.',
  parts:['Give the effective sampling rate after the samples are discarded.',
         'State whether $x(t)$ can still be recovered from $v[n]$, with reasons.',
         'Give the largest bandwidth a signal could have and still survive the same treatment.'],
  sol:'<b>Given.</b> A signal sampled comfortably above its Nyquist rate, then decimated by two.<br>'
     +'<b>Find.</b> The new rate, whether recovery survives it, and the limiting bandwidth.<br>'
     +'<b>Method.</b> Discarding every second sample halves the sampling rate. The Nyquist condition is then re-tested against the same signal bandwidth.<br>'
     +'<b>Solution — part (a).</b> Keeping one sample in two doubles the spacing, so$$\\omega_s^{\\prime}=\\frac{\\omega_s}{2}=1000\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> <b>No.</b> The condition to test is $\\omega_s^{\\prime}>2\\omega_M$, that is $1000\\pi>1200\\pi$, and it fails. After decimation the rate is below the Nyquist rate of $1200\\pi$, so the spectral copies overlap and $x(t)$ cannot be recovered from $v[n]$. The original sampling was adequate; the decimation destroyed that.<br>'
     +'<b>Solution — part (c).</b> Recovery after decimation needs $1000\\pi>2\\omega_M$, so$$\\omega_M<500\\pi\\;\\text{rad/s}.$$A signal band-limited to anything below $500\\pi$ survives; this one, at $600\\pi$, does not.<br>'
     +'<b>Check.</b> The numbers are consistent from both directions. The original rate $2000\\pi$ exceeds $2\\omega_M=1200\\pi$ with $800\\pi$ to spare, which is why the first sampling was safe. Halving leaves $1000\\pi$, short of $1200\\pi$ by $200\\pi$, which is exactly how much aliasing the copies now suffer. To make it safe, either keep the original rate or filter $x(t)$ to $500\\pi$ before discarding samples.',
  err:'Concluding that decimation is harmless because the original sampling satisfied the Nyquist condition. The condition has to be re-tested against the new rate: throwing away samples is itself a sampling operation, and it can alias a sequence that was previously clean.',
  teach:'The reflex to catch here is "it was fine before, so it is fine now". Ask for the inequality to be written down and evaluated before any answer is given; the arithmetic settles it in one line, and no amount of reasoning about the original sampling does.' },

{ id:'D7-29', module:'M7', type:'full', src:'Final Q4',
  stem:'Determine the Nyquist sampling rate for each of the following signals, where $\\omega_g=0$ (no guard band is required).',
  parts:['$y(t)=x_1(t)x_2(t)$, where $x_1$ is band-limited to $200\\pi$ and $x_2$ to $500\\pi$.',
         '$y(t)=x_1(t)+x_2(t)$, with the same two signals.',
         '$y(t)=x_1(t)*x_2(t)$, with the same two signals.'],
  sol:'<b>Given.</b> Two band-limited signals combined in three ways.<br>'
     +'<b>Find.</b> The Nyquist rate for each combination.<br>'
     +'<b>Method.</b> A product in time convolves the spectra and adds the bandwidths; a sum takes the larger; a convolution in time multiplies the spectra and takes the smaller.<br>'
     +'<b>Solution — part (a).</b> Convolving the two spectra gives a support running to $200\\pi+500\\pi=700\\pi$, so$$\\omega_M=700\\pi,\\qquad\\omega_s=1400\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b> Adding leaves whichever spectrum reaches further, so $\\omega_M=500\\pi$ and$$\\omega_s=1000\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (c).</b> Convolution in time multiplies the spectra, and the product is zero wherever either factor is. So $\\omega_M=200\\pi$ and$$\\omega_s=400\\pi\\;\\text{rad/s}.$$'
     +'<b>Check.</b> The three answers order themselves as they must: the product needs the highest rate, the sum an intermediate one, the convolution the lowest. In each case $\\omega_M$ can be written down without knowing anything about the two signals beyond their bandwidths — sum, maximum and minimum respectively — which is what makes this a rule and not a calculation.',
  err:'Using the same rule for the product and the convolution because both are written with two signals and one operator. They are opposite operations: one adds bandwidths, the other intersects them, and mixing them up changes the answer here by a factor of three and a half.',
  teach:'This question is the summary of the module in three lines. Ask students to write the three rules from memory before attempting it, then to check them against the answers; whatever they got wrong is what to revise.' },

{ id:'D7-30', module:'M7', type:'full', src:'Final Q4',
  stem:'A signal $x(t)=\\dfrac{\\sin(400\\pi t)}{\\pi t}$ is sampled at $\\omega_s=1000\\pi$ rad/s, and the samples are passed through an ideal reconstruction filter of gain $T$ and cut-off $\\omega_c=500\\pi$.',
  parts:['Give $X(j\\omega)$ and the Nyquist rate of $x(t)$.',
         'Describe the spectrum after sampling and say whether the copies overlap.',
         'Give the output of the reconstruction filter, and repeat the three parts for $\\omega_s=600\\pi$.'],
  sol:'<b>Given.</b> An ideal low-pass signal, sampled first above and then below its Nyquist rate.<br>'
     +'<b>Find.</b> The spectrum at each stage, and what the filter returns in the two cases.<br>'
     +'<b>Method.</b> Sampling replicates the spectrum at multiples of $\\omega_s$. Whether the copies overlap decides whether the filter output is $x$ or something else.<br>'
     +'<b>Solution — part (a).</b> The sinc gives$$X(j\\omega)=\\begin{cases}1,&|\\omega|<400\\pi\\\\0,&\\text{otherwise,}\\end{cases}$$so $\\omega_M=400\\pi$ and the Nyquist rate is $800\\pi$ rad/s.<br>'
     +'<b>Solution — part (b).</b> At $\\omega_s=1000\\pi>800\\pi$ the condition holds. The copies sit at $0,\\pm1000\\pi,\\dots$, each of width $800\\pi$, and the gap between neighbours is $1000\\pi-800\\pi=200\\pi$. They do not overlap.<br>'
     +'<b>Solution — part (c).</b> With $\\omega_c=500\\pi$, the filter keeps exactly the copy at the origin — the cut-off lies inside the gap, since $400\\pi<500\\pi<600\\pi$ — and its gain $T$ undoes the factor $\\tfrac1T$. The output is $x(t)$ exactly.<br>'
     +'At $\\omega_s=600\\pi$, however, $600\\pi<800\\pi$ and the condition fails. Neighbouring copies, centred $600\\pi$ apart and $800\\pi$ wide, overlap on $200\\pi<|\\omega|<400\\pi$, where the spectrum sums to $2$ instead of $1$. The filter cannot separate the overlapped part, and its output is a signal whose spectrum is $1$ on $|\\omega|<200\\pi$ and $2$ on $200\\pi<|\\omega|<400\\pi$ — not $x(t)$, and no choice of $\\omega_c$ repairs it.<br>'
     +'<b>Check.</b> The overlap width in the second case is $2\\omega_M-\\omega_s=800\\pi-600\\pi=200\\pi$, which matches the interval found. In the first case the same expression is negative, $800\\pi-1000\\pi=-200\\pi$, and its magnitude is the gap — one formula covering both, with the sign saying which situation applies.',
  figSol:()=>pair(
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1400,1400],yr:[-0.2,1.5],xlabel:'\\omega/\\pi',ylabel:'X_p(j\\omega)\\;\\text{at}\\;1000\\pi',
      pad:{l:70,r:26,t:28,b:38},xstep:500,ystep:0.5});
      const box=c=>[[c-400,0],[c-400,1],[c+400,1],[c+400,0]];
      a.poly([[-1400,0]].concat(box(-1000)).concat(box(0)).concat(box(1000)).concat([[1400,0]]),{color:C.in});
      return a.svg();})(),
    (()=>{const a=P.Axes({w:520,h:250,xr:[-1000,1000],yr:[-0.3,2.6],xlabel:'\\omega/\\pi',ylabel:'X_p(j\\omega)\\;\\text{at}\\;600\\pi',
      pad:{l:70,r:26,t:28,b:38},xstep:400,ystep:1});
      a.curve(w=>{let s=0; for(let k=-3;k<=3;k++) if(Math.abs(w-600*k)<400) s+=1; return s;},{color:C.err});
      return a.svg();})()),
  err:'Choosing $\\omega_c$ to fix the second case. Once the copies have overlapped, the sum in the overlapped band is a single function with no record of which copy contributed what; a filter selects bands, and there is no band here that holds only the original.',
  teach:'The signed quantity $2\\omega_M-\\omega_s$ is worth naming. Negative means a gap and a free choice of cut-off; positive means an overlap of that width and no cut-off that works. One number answers both halves of this question.' }

]);

window.DRILLMAP_M7 = [

{ id:'m7-drill-map', module:'M7', nav:'Module 7 · question types',
  title:'Module 7 — what a question looks like', src:'pp. 80–88',
  objective:'Name the six recurring question shapes before the module is read.',
  keywords:'practice questions module 7 question types Nyquist rate bandwidth aliasing guard band reconstruction taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Question types', src:'pp. 80–88'},
  {t:'title', text:'Six shapes, and the method each one wants'},
  {t:'lede', text:'Questions on sampling come in five shapes, and three of them reduce to the same task: find the highest frequency present. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M7'},
  {t:'note', kind:'def', head:'The two rules that decide most of these questions', html:'A <b>product</b> in time convolves the spectra, so the bandwidths <b>add</b>. A <b>convolution</b> in time multiplies the spectra, so the bandwidth is the <b>smaller</b> of the two. A <b>sum</b> takes the larger. Getting these three straight answers most of the module.'}
]}

];

/* The questions themselves sit at the end of the module, after the teaching
   scenes. The taxonomy above sits in front of it: one is a map read before the
   work, the other is the work. */
window.DRILL_M7 = [

{ id:'m7-drill', module:'M7', nav:'Module 7 · practice questions',
  title:'Module 7 — practice questions', src:'pp. 80–88',
  objective:'Thirty open-ended questions with worked solutions, in the form they are asked in.',
  keywords:'practice questions module 7 practice Nyquist rate sampling aliasing bandwidth guard band reconstruction zero order hold',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Practice D7-01 … D7-30', src:'pp. 80–88'},
  {t:'title', text:'Practice questions'},
  {t:'small', html:'Work each question on paper before opening its solution. Give $\\omega_M$ before the rate every time, so the factor of two is visible, and state the units — a rate in rad/s and a rate in hertz differ by $2\\pi$. The sinc convention used throughout is the unnormalised one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M7'}
]}

];
})();
