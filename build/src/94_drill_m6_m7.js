/* ==========================================================================
   Exam drills — Modules 6 and 7.
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const pair=(a,b)=>`<div class="dr-pair"><div>${a}</div><div>${b}</div></div>`;
/* tick formatter for an axis measured in multiples of pi */
const piFmt = v => { const k=Math.round(v/Math.PI); if(Math.abs(v)<1e-9) return '0';
  if(Math.abs(v-k*Math.PI)>1e-6) return '';
  return (k===1?'π':k===-1?'−π':String(k)+'π'); };

/* ======================================================================
   MODULE 6 — Discrete-Time Fourier Transform
   ====================================================================== */

CONTENT.DRILLTYPES.M6 = [
  { k:'dtft-basic', name:'Transform of a standard sequence',
    asks:'A sequence is given in closed form. Compute $X(e^{j\\omega})$ from the analysis sum.',
    method:['Write the analysis sum and cut it down to the support of the sequence.',
            'A one-sided geometric sequence sums directly, provided $|a|<1$.',
            'A two-sided one splits at $n=0$, with the $n\\ge1$ half summed separately.',
            'Check $X(e^{j0})=\\sum_n x[n]$, the total sum, as a free test.'],
    go:'m6-dtft-def' },
  { k:'dtft-sinu', name:'Sinusoids, impulses, and the $2\\pi$ periodicity',
    asks:'A sum of sinusoids is given. Plot $X(e^{j\\omega})$ as impulses on $-\\pi\\le\\omega\\le\\pi$.',
    method:['A discrete-time sinusoid transforms into a pair of impulses inside every $2\\pi$ interval.',
            'A cosine of amplitude $A$ gives impulses of weight $\\pi A$ at $\\pm\\omega_c$.',
            'Reduce every frequency into $-\\pi\\le\\omega\\le\\pi$ before plotting anything.',
            'The transform repeats with period $2\\pi$, so one interval is the whole answer.'],
    go:'m6-dtft-periodic' },
  { k:'dtft-inv', name:'Inverse transform',
    asks:'$X(e^{j\\omega})$ is given over one period. Recover $x[n]$.',
    method:['The synthesis integral runs over any one $2\\pi$ interval, with the factor $1/2\\pi$.',
            'A rectangle in frequency integrates to a sinc-shaped sequence.',
            'A finite sum of terms $e^{-j\\omega n_0}$ is read off directly as impulses at $n_0$.',
            'Check $x[0]$ against $\\frac{1}{2\\pi}\\int X(e^{j\\omega})\\,\\d\\omega$, the mean of the spectrum.'],
    go:'m6-dtft-inverse' },
  { k:'dtft-lti', name:'A sequence through an LTI system',
    asks:'An input and an impulse response are given. Find $Y(e^{j\\omega})$ and, where asked, $y[n]$.',
    method:['Convolution in time is multiplication in frequency: $Y=X\\cdot H$.',
            'For a sinusoidal input, evaluate $H$ at that one frequency and read off gain and phase.',
            'For a rational $Y$, split into first-order terms in $e^{-j\\omega}$ and invert each.',
            'Check the result at $\\omega=0$ against the sums of the sequences.'],
    go:'m6-dtft-lti' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D6-01', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=\\left(\\tfrac13\\right)^{\\!|n|}.$$',
  parts:['Compute $X(e^{j\\omega})$ in closed form.',
         'Evaluate it at $\\omega=0$ and $\\omega=\\pi$, and check both against direct summation.'],
  sol:'<b>Given.</b> A two-sided geometric sequence.<br>'
     +'<b>Find.</b> Its transform.<br>'
     +'<b>Method.</b> The absolute value means two different formulas, so split the sum at $n=0$ and count that sample once.<br>'
     +'<b>Solution — part (a).</b> With $a=\\tfrac13$,$$X(e^{j\\omega})=\\sum_{n=0}^{\\infty}\\left(ae^{-j\\omega}\\right)^{n}+\\sum_{n=1}^{\\infty}\\left(ae^{j\\omega}\\right)^{n}=\\frac{1}{1-ae^{-j\\omega}}+\\frac{ae^{j\\omega}}{1-ae^{j\\omega}}.$$Combining over a common denominator,$$X(e^{j\\omega})=\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}=\\frac{8/9}{10/9-\\tfrac23\\cos\\omega}=\\frac{4}{5-3\\cos\\omega}.$$Both series converge because $|a|=\\tfrac13<1$.<br>'
     +'<b>Solution — part (b).</b> $X(e^{j0})=\\dfrac{4}{2}=2$ and $X(e^{j\\pi})=\\dfrac{4}{8}=\\dfrac12$.<br>'
     +'<b>Check.</b> Directly, $\\displaystyle\\sum_n\\left(\\tfrac13\\right)^{|n|}=1+2\\sum_{n\\ge1}\\left(\\tfrac13\\right)^{n}=1+2\\cdot\\tfrac12=2$, matching $X(e^{j0})$. At $\\omega=\\pi$ the exponential is $(-1)^{n}$, so $\\displaystyle\\sum_n(-1)^{n}\\left(\\tfrac13\\right)^{|n|}=1+2\\sum_{n\\ge1}\\left(-\\tfrac13\\right)^{n}=1-\\tfrac12=\\tfrac12$, matching the second value. $X$ is real and even in $\\omega$, as it must be for a real even sequence, and it is periodic with period $2\\pi$ because $\\cos\\omega$ is.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-0.2,2.4],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:62,r:28,t:34,b:40},xstep:Math.PI/2,ystep:0.5,xtickfmt:v=>{
        const k=Math.round(v/(Math.PI/2)); if(k===0) return '0';
        return (k===2?'π':k===-2?'−π':k===1?'π/2':k===-1?'−π/2':'');}});
    a.curve(w=>4/(5-3*Math.cos(w)),{color:C.mid,n:1200});
    return a.svg();},
  err:'Counting the sample at $n=0$ in both halves of the split, which adds an extra $1$ and gives $X(e^{j0})=3$ instead of $2$.',
  teach:'The two-point check at $\\omega=0$ and $\\omega=\\pi$ costs two lines and catches both the double-counted sample and any sign error in the combination.' },

{ id:'D6-02', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of $$x[n]=\\left(\\tfrac13\\right)^{\\!n}u[n],$$and give $\\left|X(e^{j\\omega})\\right|$ at $\\omega=0$ and $\\omega=\\pi$.',
  parts:['Compute $X(e^{j\\omega})$ and state the convergence condition.',
         'Evaluate the magnitude at $\\omega=0$ and $\\omega=\\pi$, and say what kind of filter has this impulse response.'],
  sol:'<b>Given.</b> A causal decaying geometric sequence.<br>'
     +'<b>Find.</b> Its transform and two magnitude values.<br>'
     +'<b>Method.</b> The analysis sum starts at $n=0$ and is a single geometric series in $ae^{-j\\omega}$.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=\\sum_{n=0}^{\\infty}\\left(\\tfrac13\\right)^{n}e^{-j\\omega n}=\\sum_{n=0}^{\\infty}\\left(\\tfrac13e^{-j\\omega}\\right)^{n}=\\frac{1}{1-\\tfrac13e^{-j\\omega}}.$$The series converges because $\\left|\\tfrac13e^{-j\\omega}\\right|=\\tfrac13<1$ for every $\\omega$. The condition is $|a|<1$, which is also the condition for the sequence to be absolutely summable.<br>'
     +'<b>Solution — part (b).</b>$$\\left|X(e^{j0})\\right|=\\frac{1}{1-\\tfrac13}=\\frac32,\\qquad\\left|X(e^{j\\pi})\\right|=\\frac{1}{1+\\tfrac13}=\\frac34.$$The gain is largest at $\\omega=0$ and smallest at $\\omega=\\pi$, so a system with this impulse response is a <b>low-pass filter</b>.<br>'
     +'<b>Check.</b> $X(e^{j0})=\\sum_n x[n]=\\dfrac{1}{1-1/3}=\\dfrac32$, which is the total sum, as required. Since $x$ is real but not even, $X$ is complex and satisfies $X(e^{-j\\omega})=X^{*}(e^{j\\omega})$, so the magnitude is even in $\\omega$ even though $X$ is not real.',
  err:'Reporting the convergence condition as $\\left|e^{-j\\omega}\\right|<1$, which is never satisfied. The exponential has unit magnitude; it is $|a|$ that decides.',
  teach:'Ask for the two magnitude values before any plot is drawn. Two numbers are enough to name the filter type, and naming it is worth more than sketching it inaccurately.' },

{ id:'D6-03', module:'M6', type:'dtft-basic', src:'Final Q3',
  stem:'Find the discrete-time Fourier transform of the rectangular window $$x[n]=u[n+2]-u[n-3].$$',
  parts:['State the support of $x[n]$ and compute $X(e^{j\\omega})$.',
         'Give $X(e^{j0})$ and the locations of the zeros of $X$ inside $-\\pi\\le\\omega\\le\\pi$.'],
  sol:'<b>Given.</b> A rectangular window of five ones, centred on the origin.<br>'
     +'<b>Find.</b> Its transform and its zeros.<br>'
     +'<b>Method.</b> The sum is finite, so evaluate it directly. Symmetric limits make the result real.<br>'
     +'<b>Solution — part (a).</b> The support is $-2\\le n\\le2$, five samples. Then$$X(e^{j\\omega})=\\sum_{n=-2}^{2}e^{-j\\omega n}=1+2\\cos\\omega+2\\cos2\\omega,$$and summing the finite geometric series instead gives the compact form$$X(e^{j\\omega})=\\frac{\\sin(5\\omega/2)}{\\sin(\\omega/2)}.$$'
     +'<b>Solution — part (b).</b> $X(e^{j0})=5$, the number of ones. The zeros occur where $\\sin(5\\omega/2)=0$ but $\\sin(\\omega/2)\\neq0$, that is$$\\omega=\\pm\\frac{2\\pi}{5},\\;\\pm\\frac{4\\pi}{5}.$$'
     +'<b>Check.</b> $X(e^{j0})=\\sum_n x[n]=5$, as it must be. The two forms agree numerically: at $\\omega=\\pi$ the first gives $1-2+2=1$, and the second gives $\\dfrac{\\sin(5\\pi/2)}{\\sin(\\pi/2)}=\\dfrac{1}{1}=1$. The result is real and even, which is required for a real sequence that is symmetric about $n=0$. The zero spacing $2\\pi/5$ is the reciprocal of the window length, the discrete-time counterpart of the rectangular pulse in Module 5.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-1.8,5.8],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:62,r:28,t:34,b:40},xstep:Math.PI,ystep:2,xtickfmt:v=>{
        const k=Math.round(v/Math.PI); if(k===0) return '0';
        return (k===1?'π':k===-1?'−π':'');}});
    a.curve(w=>Math.abs(Math.sin(w/2))<1e-7?5:Math.sin(2.5*w)/Math.sin(w/2),{color:C.mid,n:1600});
    [-4*Math.PI/5,-2*Math.PI/5,2*Math.PI/5,4*Math.PI/5].forEach(w=>a.vline(w,{color:C.muted,opacity:.45}));
    return a.svg();},
  err:'Taking the support as $-2\\le n\\le3$ and reporting six samples. The step $u[n-3]$ is subtracted from $n=3$ onwards, so $n=3$ is already outside.',
  teach:'Have both forms produced and compared at one frequency. The compact ratio is the useful one, and students trust it only after seeing it agree with the explicit sum.' },

{ id:'D6-04', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Plot the discrete-time Fourier transform of $$x[n]=2\\cos\\!\\left(\\tfrac{5\\pi}{6}n\\right)+3\\cos\\!\\left(\\tfrac{\\pi}{4}n\\right)$$on $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Give $X(e^{j\\omega})$ as a sum of impulses on one period.',
         'Mark the impulse weights and locations on a plot.'],
  sol:'<b>Given.</b> A sum of two discrete-time cosines.<br>'
     +'<b>Find.</b> The line spectrum on one period.<br>'
     +'<b>Method.</b> On any one $2\\pi$ interval,$$\\cos(\\omega_0n)\\;\\longleftrightarrow\\;\\pi\\left[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\right],$$and the transform is linear. Both frequencies given already lie inside $-\\pi\\le\\omega\\le\\pi$, so no reduction is needed.<br>'
     +'<b>Solution.</b>$$X(e^{j\\omega})=2\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{5\\pi}{6}\\right)+\\delta\\!\\left(\\omega+\\tfrac{5\\pi}{6}\\right)\\right]+3\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{4}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{4}\\right)\\right]$$for $-\\pi\\le\\omega\\le\\pi$, and the whole pattern repeats with period $2\\pi$.<br>'
     +'<b>Check.</b> Four impulses, symmetric about the origin, all with real positive weights — correct for a real even sequence. Each amplitude $A$ scales its weight to $\\pi A$, giving $2\\pi$ and $3\\pi$. The frequency $\\tfrac{5\\pi}{6}$ is close to $\\pi$, which in discrete time is the <em>highest</em> possible frequency: that term alternates in sign almost every sample.<br>'
     +'<b>A caution.</b> Neither term needs the sequence to be periodic for this spectrum to be correct. Here $\\tfrac{5\\pi}{6}/2\\pi=\\tfrac{5}{12}$ and $\\tfrac{\\pi}{4}/2\\pi=\\tfrac18$ are both rational, so $x[n]$ happens to be periodic with $N=\\operatorname{lcm}(12,8)=24$, but the impulse pairs would be the same either way.',
  figSol:()=>{const a=P.Axes({w:1080,h:300,xr:[-Math.PI*1.08,Math.PI*1.08],yr:[-1.6,11.5],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'X(e^{j\\omega})',
      pad:{l:56,r:28,t:34,b:40},xstep:Math.PI/2,ystep:3,xtickfmt:v=>{
        const k=Math.round(v/(Math.PI/2)); if(k===0) return '0';
        return (k===2?'π':k===-2?'−π':k===1?'π/2':k===-1?'−π/2':'');}});
    [[-5*Math.PI/6,2*Math.PI],[-Math.PI/4,3*Math.PI],[Math.PI/4,3*Math.PI],[5*Math.PI/6,2*Math.PI]]
      .forEach(([w,h])=>a.impulse(w,h,{color:C.mid,labelText:h>8?'3π':'2π'}));
    return a.svg();},
  err:'Placing the impulses at $\\tfrac{5\\pi}{6}$ and $\\tfrac{\\pi}{4}$ only, without their negative-frequency partners. A real signal always has both.',
  teach:'Ask which of the two components is the higher frequency. Students trained on continuous time answer by comparing the numbers and are right here, but the habit fails as soon as a frequency exceeds $\\pi$.' },

{ id:'D6-05', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Plot the discrete-time Fourier transform of $$x[n]=1+\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$$on $-\\pi\\le\\omega\\le\\pi$.',
  parts:['Give $X(e^{j\\omega})$ as a sum of impulses.',
         'State the weight of the impulse at $\\omega=0$ and explain where it comes from.'],
  sol:'<b>Given.</b> A constant plus a cosine at $\\tfrac{\\pi}{2}$ rad/sample.<br>'
     +'<b>Find.</b> The line spectrum.<br>'
     +'<b>Method.</b> Use the two standard pairs on one period,$$1\\longleftrightarrow2\\pi\\delta(\\omega),\\qquad\\cos(\\omega_0n)\\longleftrightarrow\\pi\\left[\\delta(\\omega-\\omega_0)+\\delta(\\omega+\\omega_0)\\right].$$'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=2\\pi\\delta(\\omega)+\\pi\\left[\\delta\\!\\left(\\omega-\\tfrac{\\pi}{2}\\right)+\\delta\\!\\left(\\omega+\\tfrac{\\pi}{2}\\right)\\right],\\qquad-\\pi\\le\\omega\\le\\pi.$$'
     +'<b>Solution — part (b).</b> The impulse at the origin has weight $2\\pi$. It comes from the constant term: a signal that never decays is not absolutely summable, so its transform is not an ordinary function but an impulse. The factor $2\\pi$ is what makes the synthesis integral return $1$:$$\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}2\\pi\\delta(\\omega)e^{j\\omega n}\\,\\d\\omega=1.$$'
     +'<b>Check.</b> Synthesising the other two impulses returns $\\tfrac{1}{2\\pi}\\cdot\\pi\\left(e^{j\\pi n/2}+e^{-j\\pi n/2}\\right)=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)$, so the three impulses rebuild the given sequence exactly. The same sequence appeared in Module 4 as a periodic signal with $N=4$ and coefficients $1,\\tfrac12,0,\\tfrac12$, and the impulse weights here are $2\\pi a_k$ — the two descriptions agree, as they must.',
  err:'Giving the constant a weight of $\\pi$ by treating it as a cosine at zero frequency. At $\\omega_0=0$ the two impulses of a cosine coincide, and their weights add.',
  teach:'The cross-reference to the Module 4 coefficients is worth showing. It makes the line spectrum of a periodic sequence one idea instead of two.' },

{ id:'D6-06', module:'M6', type:'dtft-sinu', src:'Final Q3',
  stem:'Consider the two sequences $$x_1[n]=\\cos(0.6\\pi n),\\qquad x_2[n]=\\cos(1.4\\pi n).$$',
  parts:['Show that $x_1[n]=x_2[n]$ for every integer $n$.',
         'Explain why $X(e^{j\\omega})$ needs to be given on one $2\\pi$ interval only.',
         'State which discrete-time frequency is the highest, and why.'],
  sol:'<b>Given.</b> Two cosines whose frequencies differ by $2\\pi\\cdot0.4$.<br>'
     +'<b>Find.</b> Why they are the same sequence, and what that implies.<br>'
     +'<b>Method.</b> Compare the arguments modulo $2\\pi$, remembering that $n$ is an integer.<br>'
     +'<b>Solution — part (a).</b>$$\\cos(1.4\\pi n)=\\cos(1.4\\pi n-2\\pi n)=\\cos(-0.6\\pi n)=\\cos(0.6\\pi n),$$where the first step is legal because $2\\pi n$ is a whole number of turns for every integer $n$, and the last uses the evenness of the cosine. The two sequences are identical sample by sample.<br>'
     +'<b>Solution — part (b).</b> The same argument applies to the analysis sum:$$X\\!\\left(e^{j(\\omega+2\\pi)}\\right)=\\sum_n x[n]e^{-j(\\omega+2\\pi)n}=\\sum_n x[n]e^{-j\\omega n}e^{-j2\\pi n}=X(e^{j\\omega}),$$because $e^{-j2\\pi n}=1$ for every integer $n$. The transform is periodic in $\\omega$ with period $2\\pi$, so any one interval contains all the information.<br>'
     +'<b>Solution — part (c).</b> The highest discrete-time frequency is $\\omega=\\pi$, where $e^{j\\pi n}=(-1)^{n}$ alternates every sample. Increasing $\\omega$ beyond $\\pi$ produces sequences that oscillate <em>more slowly</em> again, because they are the same as sequences at $\\omega-2\\pi$.<br>'
     +'<b>Check.</b> Tabulating $n=0,1,2,3$: $x_1$ gives $1$, $-0.309$, $-0.809$, $0.809$; $x_2$ gives the same four numbers. This is not an approximation, it is an identity.<br>'
     +'<b>Consequence.</b> This periodicity has no counterpart in continuous time, where every frequency gives a different signal. It is also the reason Module 7 has anything to say: sampling maps the whole continuous frequency axis onto one $2\\pi$ interval, and distinct frequencies collide.',
  err:'Concluding that $x_2$ oscillates faster than $x_1$ because $1.4\\pi>0.6\\pi$. In discrete time the comparison must be made after reduction into $-\\pi\\le\\omega\\le\\pi$.',
  teach:'Have the four samples tabulated. An identity that a student has verified numerically survives; one that has only been derived symbolically usually does not.' },

{ id:'D6-07', module:'M6', type:'dtft-inv', src:'Final Q3',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=\\begin{cases}1,&|\\omega|\\le\\tfrac{\\pi}{4},\\\\[2pt]0,&\\tfrac{\\pi}{4}<|\\omega|\\le\\pi,\\end{cases}$$repeated with period $2\\pi$.',
  parts:['Compute $x[n]$ from the synthesis integral.',
         'Give $x[0]$ and check it independently.'],
  sol:'<b>Given.</b> An ideal low-pass frequency response with cut-off $\\tfrac{\\pi}{4}$.<br>'
     +'<b>Find.</b> The corresponding sequence.<br>'
     +'<b>Method.</b> The synthesis integral runs over one period, and the integrand is non-zero only on the passband:$$x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega=\\frac{1}{2\\pi}\\int_{-\\pi/4}^{\\pi/4}e^{j\\omega n}\\,\\d\\omega.$$'
     +'<b>Solution — part (a).</b> For $n\\neq0$,$$x[n]=\\frac{1}{2\\pi}\\cdot\\frac{e^{j\\pi n/4}-e^{-j\\pi n/4}}{jn}=\\frac{\\sin(\\pi n/4)}{\\pi n}.$$'
     +'<b>Solution — part (b).</b> At $n=0$ the integrand is $1$, so$$x[0]=\\frac{1}{2\\pi}\\cdot\\frac{\\pi}{2}=\\frac14,$$which is also the limit of $\\dfrac{\\sin(\\pi n/4)}{\\pi n}$ as $n\\to0$. Independently, $x[0]=\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}X\\,\\d\\omega$ is the mean of the spectrum over one period, which for a rectangle of height $1$ and width $\\pi/2$ is $\\dfrac{\\pi/2}{2\\pi}=\\dfrac14$.<br>'
     +'<b>Check.</b> The sequence is real and even, as required for a real even spectrum. It decays as $1/|n|$ and is not absolutely summable, so a system with this impulse response is not stable — and it is not causal either, since $x[n]\\neq0$ for $n<0$. Both facts together are why the ideal low-pass filter cannot be implemented, in discrete time as in continuous time.',
  err:'Integrating over $-\\pi$ to $\\pi$ with the value $1$ throughout, which returns $\\delta[n]$ rather than the sinc. Only the passband contributes.',
  teach:'The mean-of-the-spectrum check for $x[0]$ generalises to every inverse transform and takes one line. Require it in place of re-deriving the integral.' },

{ id:'D6-08', module:'M6', type:'dtft-inv', src:'Final Q3',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=\\cos\\omega.$$',
  parts:['Recover $x[n]$ without evaluating any integral.',
         'Confirm the result with the analysis sum.'],
  sol:'<b>Given.</b> A spectrum that is already a short sum of exponentials.<br>'
     +'<b>Find.</b> The sequence.<br>'
     +'<b>Method.</b> The pair $\\delta[n-n_0]\\leftrightarrow e^{-j\\omega n_0}$ lets any finite sum of exponentials be read off directly. Expand the cosine with Euler and match.<br>'
     +'<b>Solution — part (a).</b>$$X(e^{j\\omega})=\\cos\\omega=\\tfrac12e^{j\\omega}+\\tfrac12e^{-j\\omega}=\\tfrac12e^{-j\\omega(-1)}+\\tfrac12e^{-j\\omega(1)},$$so$$x[n]=\\tfrac12\\delta[n+1]+\\tfrac12\\delta[n-1].$$'
     +'<b>Solution — part (b).</b> The analysis sum of that sequence is$$\\sum_n x[n]e^{-j\\omega n}=\\tfrac12e^{j\\omega}+\\tfrac12e^{-j\\omega}=\\cos\\omega,$$as required.<br>'
     +'<b>Check.</b> $X(e^{j0})=1$, and $\\sum_n x[n]=\\tfrac12+\\tfrac12=1$. The sequence is real and even, matching a real even spectrum. A system with this impulse response averages the sample one step ahead with the sample one step behind — linear, time invariant, stable, and not causal.',
  err:'Reading the sign of the shift backwards and reporting $\\tfrac12\\delta[n-1]+\\tfrac12\\delta[n+1]$ as though the two were different answers, or worse placing both impulses on the same side. The exponent $-j\\omega n_0$ pairs with $\\delta[n-n_0]$, so $e^{+j\\omega}$ belongs to $n_0=-1$.',
  teach:'This question is thirty seconds of work for a student who knows the pair and several minutes of integration for one who does not. Use it to argue for learning the short table.' },

{ id:'D6-09', module:'M6', type:'dtft-inv', src:'Final Q3',
  stem:'Find $x[n]$ when $$X(e^{j\\omega})=2+3e^{-j\\omega}-e^{-j3\\omega}.$$',
  parts:['Give $x[n]$.',
         'State the support of $x[n]$ and give $\\sum_n x[n]$.'],
  sol:'<b>Given.</b> A finite polynomial in $e^{-j\\omega}$.<br>'
     +'<b>Find.</b> The sequence.<br>'
     +'<b>Method.</b> Each term $c\\,e^{-j\\omega n_0}$ is $c\\,\\delta[n-n_0]$. Read the coefficients off with their delays.<br>'
     +'<b>Solution — part (a).</b>$$x[n]=2\\delta[n]+3\\delta[n-1]-\\delta[n-3],$$that is $x[0]=2$, $x[1]=3$, $x[2]=0$, $x[3]=-1$, and zero elsewhere.<br>'
     +'<b>Solution — part (b).</b> The support is $0\\le n\\le3$, and$$\\sum_n x[n]=2+3+0-1=4.$$'
     +'<b>Check.</b> $X(e^{j0})=2+3-1=4$, which matches the sum, as it must. The sequence is finite and causal, so the corresponding system is a three-tap filter with a delay of at most three samples. $X$ is complex here because $x$ is not symmetric about any point.',
  err:'Placing the coefficient $-1$ at $n=-3$ by reading the minus sign in the exponent as a reflection. The exponent already carries the sign of the delay.',
  teach:'A finite-length sequence and a polynomial in $e^{-j\\omega}$ are the same object written two ways. Establishing that here makes the frequency response of every FIR filter in the module immediate.' },

{ id:'D6-10', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A discrete-time LTI system has impulse response $h[n]=\\left(\\tfrac13\\right)^{n}u[n]$ and input $x[n]=\\left(\\tfrac12\\right)^{n}u[n]$.',
  parts:['Give $X(e^{j\\omega})$, $H(e^{j\\omega})$ and $Y(e^{j\\omega})$.',
         'Recover $y[n]$ by partial fractions.',
         'Check the result at $\\omega=0$.'],
  sol:'<b>Given.</b> Two causal geometric sequences.<br>'
     +'<b>Find.</b> The output, through the frequency domain.<br>'
     +'<b>Method.</b> Convolution in time is multiplication in frequency. Split the product into first-order terms in $z=e^{-j\\omega}$ and invert each with the standard pair.<br>'
     +'<b>Solution — part (a).</b>$$X=\\frac{1}{1-\\tfrac12e^{-j\\omega}},\\qquad H=\\frac{1}{1-\\tfrac13e^{-j\\omega}},\\qquad Y=\\frac{1}{\\left(1-\\tfrac12e^{-j\\omega}\\right)\\left(1-\\tfrac13e^{-j\\omega}\\right)}.$$'
     +'<b>Solution — part (b).</b> Write $z=e^{-j\\omega}$, $a=\\tfrac12$, $b=\\tfrac13$, and split:$$\\frac{1}{(1-az)(1-bz)}=\\frac{A}{1-az}+\\frac{B}{1-bz},\\qquad A=\\frac{a}{a-b},\\;B=\\frac{b}{b-a}.$$With $a-b=\\tfrac16$ this gives $A=3$ and $B=-2$, so$$y[n]=3\\left(\\tfrac12\\right)^{\\!n}u[n]-2\\left(\\tfrac13\\right)^{\\!n}u[n].$$'
     +'<b>Solution — part (c).</b> $Y(e^{j0})=\\dfrac{1}{\\left(\\tfrac12\\right)\\left(\\tfrac23\\right)}=3$, and $\\sum_n y[n]=3\\cdot2-2\\cdot\\tfrac32=6-3=3$. They agree.<br>'
     +'<b>Check.</b> The first two samples by hand: $y[0]=3-2=1$, which equals $x[0]h[0]=1$; and $y[1]=\\tfrac32-\\tfrac23=\\tfrac56$, which equals $x[0]h[1]+x[1]h[0]=\\tfrac13+\\tfrac12$. This is the same answer the convolution sum produced in Module 3, arrived at without a single summation — which is the whole argument for the transform.',
  err:'Splitting into $\\dfrac{A}{1-az}+\\dfrac{B}{1-bz}$ and solving the linear equations with $z$ treated as a real variable that may be set to zero. Setting $z=1/a$ and $z=1/b$ in turn is the reliable route.',
  teach:'Set this question directly beside the Module 3 convolution of the same two sequences. Seeing one answer arrive twice is what convinces students that the transform is a shortcut rather than a separate subject.' },

{ id:'D6-11', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A discrete-time LTI system has impulse response $h[n]=\\delta[n]+\\delta[n-1]$. Its input is $$x[n]=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right).$$',
  parts:['Give $H(e^{j\\omega})$ and evaluate it at $\\omega=\\tfrac{\\pi}{2}$.',
         'Give $y[n]$ in amplitude-and-phase form.',
         'Confirm the result by computing $y[n]$ directly from the convolution sum.'],
  sol:'<b>Given.</b> A two-tap sum driven by a sinusoid at $\\tfrac{\\pi}{2}$ rad/sample.<br>'
     +'<b>Find.</b> The output.<br>'
     +'<b>Method.</b> A sinusoid meets an LTI system at a single frequency, so only one value of $H$ is needed. The output is the same sinusoid scaled by $\\left|H\\right|$ and shifted by $\\angle H$.<br>'
     +'<b>Solution — part (a).</b>$$H(e^{j\\omega})=1+e^{-j\\omega},\\qquad H\\!\\left(e^{j\\pi/2}\\right)=1-j=\\sqrt2\\,e^{-j\\pi/4}.$$So $\\left|H\\right|=\\sqrt2$ and $\\angle H=-\\tfrac{\\pi}{4}$.<br>'
     +'<b>Solution — part (b).</b>$$y[n]=\\sqrt2\\cos\\!\\left(\\tfrac{\\pi}{2}n-\\tfrac{\\pi}{4}\\right).$$'
     +'<b>Solution — part (c).</b> Directly, $y[n]=x[n]+x[n-1]=\\cos\\!\\left(\\tfrac{\\pi}{2}n\\right)+\\cos\\!\\left(\\tfrac{\\pi}{2}(n-1)\\right)$. Using $\\cos A+\\cos B=2\\cos\\dfrac{A+B}{2}\\cos\\dfrac{A-B}{2}$ with $A-B=\\tfrac{\\pi}{2}$,$$y[n]=2\\cos\\!\\left(\\tfrac{\\pi}{2}n-\\tfrac{\\pi}{4}\\right)\\cos\\!\\left(\\tfrac{\\pi}{4}\\right)=\\sqrt2\\cos\\!\\left(\\tfrac{\\pi}{2}n-\\tfrac{\\pi}{4}\\right),$$the same result.<br>'
     +'<b>Check.</b> Sample by sample: $x=1,0,-1,0,\\dots$, so $y=x[n]+x[n-1]$ gives $1,1,-1,-1,\\dots$ starting from $n=0$ with $x[-1]=0$ in steady state replaced by $x[-1]=\\cos(-\\pi/2)=0$. The closed form at $n=0$ gives $\\sqrt2\\cos(-\\pi/4)=1$, and at $n=1$ gives $\\sqrt2\\cos(\\pi/4)=1$. Both agree. The gain $\\sqrt2$ is less than the DC gain $H(e^{j0})=2$, as expected for a low-pass average evaluated at a middling frequency.',
  err:'Using $\\left|H\\right|=2$ from the DC gain rather than evaluating $H$ at the frequency of the input. The gain of an LTI system is a function of frequency, not a single number.',
  teach:'Part (c) is the point of the question: a trigonometric identity and a frequency response give the same answer, and the second route generalises to any input.' },

{ id:'D6-12', module:'M6', type:'dtft-lti', src:'Final Q3',
  stem:'A three-point moving average has impulse response $$h[n]=\\tfrac13\\bigl(\\delta[n]+\\delta[n-1]+\\delta[n-2]\\bigr).$$',
  parts:['Give $H(e^{j\\omega})$ and show that $\\left|H(e^{j\\omega})\\right|=\\dfrac{\\left|1+2\\cos\\omega\\right|}{3}$.',
         'Give $\\left|H\\right|$ at $\\omega=0$ and $\\omega=\\pi$, and locate the zeros in $-\\pi\\le\\omega\\le\\pi$.',
         'State which input sequence the system annihilates completely.'],
  sol:'<b>Given.</b> A three-tap averaging filter.<br>'
     +'<b>Find.</b> Its frequency response, its zeros, and the sequence it removes.<br>'
     +'<b>Method.</b> Sum the three terms, then factor out the middle exponential so the remainder is real.<br>'
     +'<b>Solution — part (a).</b>$$H(e^{j\\omega})=\\tfrac13\\left(1+e^{-j\\omega}+e^{-j2\\omega}\\right)=\\tfrac13e^{-j\\omega}\\left(e^{j\\omega}+1+e^{-j\\omega}\\right)=\\tfrac13e^{-j\\omega}\\left(1+2\\cos\\omega\\right).$$Since $\\left|e^{-j\\omega}\\right|=1$, the magnitude is $\\dfrac{\\left|1+2\\cos\\omega\\right|}{3}$.<br>'
     +'<b>Solution — part (b).</b> $\\left|H(e^{j0})\\right|=\\dfrac{3}{3}=1$ and $\\left|H(e^{j\\pi})\\right|=\\dfrac{\\left|1-2\\right|}{3}=\\dfrac13$. The zeros are where $\\cos\\omega=-\\tfrac12$, that is$$\\omega=\\pm\\frac{2\\pi}{3}.$$'
     +'<b>Solution — part (c).</b> Any sinusoid at $\\omega=\\tfrac{2\\pi}{3}$ is removed entirely — for instance $x[n]=\\cos\\!\\left(\\tfrac{2\\pi}{3}n\\right)$, whose period is exactly $3$ samples. Averaging three consecutive samples of a signal that repeats every three samples returns the mean of one whole period, which is zero here.<br>'
     +'<b>Check.</b> Unit gain at DC is required of an average, and $H(e^{j0})=1$ confirms it. The phase $-\\omega$ is exactly linear, so the filter delays every frequency by the same one sample — the reason a symmetric average is preferred to an asymmetric one. Direct test: with $x[n]=\\cos\\!\\left(\\tfrac{2\\pi}{3}n\\right)$ the samples repeat as $1,-\\tfrac12,-\\tfrac12$, and every three consecutive samples sum to $0$.',
  figSol:()=>{const a=P.Axes({w:1080,h:290,xr:[-Math.PI*1.05,Math.PI*1.05],yr:[-0.15,1.25],
      xlabel:'\\omega\\;(\\text{rad/sample})',ylabel:'|H(e^{j\\omega})|',
      pad:{l:62,r:28,t:34,b:40},xstep:Math.PI/2,ystep:0.25,xtickfmt:v=>{
        const k=Math.round(v/(Math.PI/2)); if(k===0) return '0';
        return (k===2?'π':k===-2?'−π':k===1?'π/2':k===-1?'−π/2':'');}});
    a.curve(w=>Math.abs(1+2*Math.cos(w))/3,{color:C.h,n:1400});
    [-2*Math.PI/3,2*Math.PI/3].forEach(w=>a.vline(w,{color:C.coral,opacity:.7}));
    return a.svg();},
  err:'Reporting $\\left|H\\right|=\\dfrac{1+2\\cos\\omega}{3}$ without the absolute value, which makes the magnitude negative between the zeros and $\\pm\\pi$.',
  teach:'Ask for the annihilated sequence before the zeros are located, as a prediction. Students who reason "three-sample average, three-sample period" get there without any algebra, and the algebra then confirms them.' },

]);

window.DRILL_M6 = [

{ id:'m6-drill-map', module:'M6', nav:'Module 6 exam drill · question types',
  title:'Module 6 — what a question looks like', src:'pp. 61–72',
  objective:'Name the four recurring question shapes before the module is read.',
  keywords:'exam drill module 6 question types DTFT periodicity inverse transform LTI taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Exam drill', src:'pp. 61–72'},
  {t:'title', text:'Four shapes, and the method each one wants'},
  {t:'lede', text:'Questions on the discrete-time Fourier transform come in four shapes. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M6'},
  {t:'note', kind:'warn', head:'One difference governs every question here', html:'The discrete-time transform is periodic in $\\omega$ with period $2\\pi$. Every answer is given on one interval, every frequency is reduced into that interval before it is used, and $\\omega=\\pi$ — not infinity — is the highest frequency there is.'}
]},

{ id:'m6-drill', module:'M6', nav:'Module 6 exam drill · questions',
  title:'Module 6 — exam drill', src:'pp. 61–72',
  objective:'Twelve open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 6 questions practice DTFT geometric sequence rectangular window inverse transform frequency response',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 6 · Exam drill D6-01 … D6-12', src:'pp. 61–72'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. The cheapest check in this module is $X(e^{j0})=\\sum_n x[n]$, the total sum of the sequence. The second cheapest is $x[0]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})\\,\\d\\omega$, the mean of the spectrum.'},
  {t:'rule', short:true},
  {t:'drill', module:'M6'}
]}

];

/* ======================================================================
   MODULE 7 — Sampling and Aliasing
   ====================================================================== */

CONTENT.DRILLTYPES.M7 = [
  { k:'nyq-sum', name:'Nyquist rate of a sum of sinusoids',
    asks:'A signal is written as a sum or product of sinusoids. Find the Nyquist rate.',
    method:['Reduce every product of sinusoids to a sum, using the product-to-sum identities.',
            'List every frequency present and take the largest, $\\omega_M$.',
            'The Nyquist rate is $\\omega_s=2\\omega_M$, and the largest usable sampling period is $T=\\pi/\\omega_M$.',
            'State the units. A rate in rad/s and a rate in hertz differ by $2\\pi$.'],
    go:'m7-nyquist' },
  { k:'nyq-band', name:'Bandwidth of a sinc-type signal',
    asks:'A signal is given as a sinc, a sinc squared, or a sum of them. Find its bandwidth and Nyquist rate.',
    method:['A sinc in time is a rectangle in frequency. Read the cut-off off the argument.',
            'A squared sinc is a triangle of twice the width, because squaring in time convolves in frequency.',
            'For a sum, the bandwidth is the largest of the individual bandwidths.',
            'Always give $\\omega_M$ before giving the rate, so the factor of two is visible.'],
    go:'m7-bandlimited' },
  { k:'nyq-op', name:'Bandwidth after a product or a convolution',
    asks:'Two band-limited signals are combined. Find the bandwidth of the result.',
    method:['A product in time convolves the spectra, so the bandwidths add.',
            'A convolution in time multiplies the spectra, so the bandwidth is the smaller of the two.',
            'Multiplication by a carrier shifts the band rather than widening it.',
            'Sketch the resulting band before quoting a number.'],
    go:'m7-bandwidth-ops' },
  { k:'alias', name:'Undersampling, aliasing, and guard bands',
    asks:'A signal is sampled too slowly, or a practical filter needs room. Find the apparent frequency, or the rate required.',
    method:['Sampling replicates the spectrum every $\\omega_s$. Aliasing is the overlap of two replicas.',
            'A component at $f_0$ sampled at $f_s$ appears at the distance from $f_0$ to the nearest multiple of $f_s$.',
            'Two distinct components can land on the same apparent frequency. Say so when they do.',
            'A guard band $\\omega_g$ raises the requirement to $\\omega_s\\ge2\\omega_M+\\omega_g$.'],
    go:'m7-aliasing' }
];

CONTENT.DRILL = CONTENT.DRILL.concat([

{ id:'D7-01', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\cos(60\\pi t)+\\cos(160\\pi t).$$',
  parts:['List the frequencies present and give $\\omega_M$.',
         'Give the Nyquist rate in rad/s and in hertz, and the largest usable sampling period.'],
  sol:'<b>Given.</b> A sum of two cosines.<br>'
     +'<b>Find.</b> The Nyquist rate.<br>'
     +'<b>Method.</b> The spectrum is a set of impulses at $\\pm60\\pi$ and $\\pm160\\pi$. The signal is band-limited to the largest of these, and the sampling theorem requires $\\omega_s>2\\omega_M$.<br>'
     +'<b>Solution — part (a).</b> The frequencies present are $60\\pi$ and $160\\pi$ rad/s, so$$\\omega_M=160\\pi\\;\\text{rad/s}\\qquad(f_M=80\\;\\text{Hz}).$$'
     +'<b>Solution — part (b).</b>$$\\omega_s=2\\omega_M=320\\pi\\;\\text{rad/s},\\qquad f_s=160\\;\\text{Hz},\\qquad T_{\\max}=\\frac{1}{f_s}=6.25\\;\\text{ms}.$$'
     +'<b>Check.</b> Converting between the two units: $320\\pi$ rad/s divided by $2\\pi$ is $160$ Hz, and $T=\\pi/\\omega_M=\\pi/(160\\pi)=6.25$ ms. All three statements are the same requirement. The lower component imposes no extra condition — only the highest frequency matters.',
  err:'Adding the two frequencies and reporting $\\omega_M=220\\pi$. Frequencies present in a sum are not combined; the largest one is taken.',
  teach:'Insist on units in every answer. A student who writes "the Nyquist rate is 160" has not said whether that is hertz or rad/s, and the two differ by a factor of $2\\pi$.' },

{ id:'D7-02', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\cos(30\\pi t)\\cos(80\\pi t).$$',
  parts:['Rewrite $x(t)$ as a sum of cosines.',
         'Give $\\omega_M$ and the Nyquist rate.'],
  sol:'<b>Given.</b> A product of two cosines.<br>'
     +'<b>Find.</b> The Nyquist rate.<br>'
     +'<b>Method.</b> A product of sinusoids is not itself a listed frequency. Convert it to a sum first, using$$\\cos A\\cos B=\\tfrac12\\left[\\cos(A+B)+\\cos(A-B)\\right].$$'
     +'<b>Solution — part (a).</b>$$x(t)=\\tfrac12\\cos(110\\pi t)+\\tfrac12\\cos(50\\pi t).$$'
     +'<b>Solution — part (b).</b> The frequencies present are $50\\pi$ and $110\\pi$ rad/s, so$$\\omega_M=110\\pi\\;\\text{rad/s},\\qquad\\omega_s=220\\pi\\;\\text{rad/s},\\qquad f_s=110\\;\\text{Hz}.$$'
     +'<b>Check.</b> The same answer follows from the frequency domain: multiplying by $\\cos(80\\pi t)$ shifts the spectrum of $\\cos(30\\pi t)$ by $\\pm80\\pi$, moving the lines at $\\pm30\\pi$ to $\\pm50\\pi$ and $\\pm110\\pi$. Neither of the original frequencies survives in the product, which is why the naive answer $\\omega_M=80\\pi$ is wrong in both directions.',
  err:'Taking $\\omega_M=80\\pi$ from the higher of the two factors. The product contains neither $30\\pi$ nor $80\\pi$; it contains their sum and their difference.',
  teach:'Ask for the frequency-domain argument as well as the identity. Students who see the shifted copies stop treating the product-to-sum step as a trick.' },

{ id:'D7-03', module:'M7', type:'nyq-sum', src:'Final Q4',
  stem:'Let $x(t)=\\cos(60\\pi t)+\\cos(140\\pi t)$ and define $$y(t)=x(t)+x^{2}(t).$$',
  parts:['List every frequency present in $y(t)$.',
         'Give $\\omega_M$ and the Nyquist rate for $y(t)$.'],
  sol:'<b>Given.</b> A band-limited signal plus its square.<br>'
     +'<b>Find.</b> The Nyquist rate of the sum.<br>'
     +'<b>Method.</b> Squaring convolves the spectrum with itself, so the band doubles. Expand the square and reduce every product to a sum.<br>'
     +'<b>Solution — part (a).</b> Write $A=60\\pi$ and $B=140\\pi$. Then$$x^{2}(t)=\\cos^{2}(At)+2\\cos(At)\\cos(Bt)+\\cos^{2}(Bt),$$and using $\\cos^{2}\\theta=\\tfrac12+\\tfrac12\\cos2\\theta$ together with the product-to-sum identity,$$x^{2}(t)=1+\\tfrac12\\cos(2At)+\\tfrac12\\cos(2Bt)+\\cos\\bigl((A+B)t\\bigr)+\\cos\\bigl((B-A)t\\bigr).$$The frequencies present in $y$ are therefore$$0,\\;60\\pi,\\;80\\pi,\\;120\\pi,\\;140\\pi,\\;200\\pi,\\;280\\pi\\;\\text{rad/s},$$where $B-A=80\\pi$, $2A=120\\pi$, $A+B=200\\pi$ and $2B=280\\pi$.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_M=280\\pi\\;\\text{rad/s},\\qquad\\omega_s=560\\pi\\;\\text{rad/s},\\qquad f_s=280\\;\\text{Hz}.$$'
     +'<b>Check.</b> The general rule agrees: squaring in time convolves the spectrum with itself, so the band-limit doubles from $140\\pi$ to $280\\pi$, and adding $x$ back cannot widen it further. Note the DC term at $\\omega=0$: a squared signal has a non-zero mean, which the term $1$ records.',
  err:'Quoting $\\omega_M=140\\pi$ from $x$ alone and ignoring the square. A nonlinearity creates frequencies that were not in its input, which is exactly why it is not an LTI operation.',
  teach:'This question is the practical reason anti-aliasing filters sit after, not before, any nonlinear stage. State that connection once and it is remembered.' },

{ id:'D7-04', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\frac{\\sin(250\\pi t)}{\\pi t}.$$',
  parts:['Give $X(j\\omega)$.',
         'Give $\\omega_M$ and the Nyquist rate.'],
  sol:'<b>Given.</b> A sinc-shaped signal, with the unnormalised convention $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$.<br>'
     +'<b>Find.</b> Its bandwidth and Nyquist rate.<br>'
     +'<b>Method.</b> Match against the standard pair$$\\frac{\\sin(Wt)}{\\pi t}\\;\\longleftrightarrow\\;\\begin{cases}1,&|\\omega|<W,\\\\0,&|\\omega|>W.\\end{cases}$$'
     +'<b>Solution — part (a).</b> Reading $W=250\\pi$ off the argument of the sine,$$X(j\\omega)=1\\ \\text{for}\\ |\\omega|<250\\pi,\\quad0\\ \\text{otherwise}.$$'
     +'<b>Solution — part (b).</b>$$\\omega_M=250\\pi\\;\\text{rad/s},\\qquad\\omega_s=500\\pi\\;\\text{rad/s},\\qquad f_s=250\\;\\text{Hz}.$$'
     +'<b>Check.</b> Area test: $X(0)=1$ and $\\displaystyle\\int\\frac{\\sin(250\\pi t)}{\\pi t}\\,\\d t=1$. The signal is genuinely band-limited — its spectrum is exactly zero above $250\\pi$ — which is the condition the sampling theorem asks for, and which no signal of finite duration can satisfy.',
  err:'Reading the bandwidth as $250$ rather than $250\\pi$ rad/s by confusing the argument of the sine with a frequency in hertz. The pair matches $\\sin(Wt)$, so $W$ is in rad/s.',
  teach:'Ask for the plot of $X$ before the rate. A student who draws the rectangle with the right edges will not misplace the factor $\\pi$.' },

{ id:'D7-05', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\left[\\frac{\\sin(120\\pi t)}{\\pi t}\\right]^{2}.$$',
  parts:['Describe $X(j\\omega)$, including its shape and its edges.',
         'Give $\\omega_M$ and the Nyquist rate.'],
  sol:'<b>Given.</b> The square of a sinc.<br>'
     +'<b>Find.</b> Its bandwidth.<br>'
     +'<b>Method.</b> Squaring in time is convolving in frequency, with a factor $\\tfrac{1}{2\\pi}$. The spectrum of the sinc is a rectangle, and a rectangle convolved with itself is a triangle of twice the width.<br>'
     +'<b>Solution — part (a).</b> Let $R(j\\omega)$ be the rectangle of height $1$ on $|\\omega|<120\\pi$. Then$$X(j\\omega)=\\frac{1}{2\\pi}\\left[R*R\\right](j\\omega),$$a triangle spanning $|\\omega|<240\\pi$, with its peak at $\\omega=0$ of height $\\dfrac{240\\pi}{2\\pi}=120$, falling linearly to zero at $\\omega=\\pm240\\pi$.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_M=240\\pi\\;\\text{rad/s},\\qquad\\omega_s=480\\pi\\;\\text{rad/s},\\qquad f_s=240\\;\\text{Hz}.$$'
     +'<b>Check.</b> Supports add under convolution: $120\\pi+120\\pi=240\\pi$, which is the outer edge of the triangle. Area test: $X(0)=120$, and directly $\\displaystyle\\int\\left[\\frac{\\sin(120\\pi t)}{\\pi t}\\right]^{2}\\d t=\\frac{120\\pi}{\\pi}=120$ by Parseval. The two agree.',
  figSol:()=>{const W=120*Math.PI;
    const a=P.Axes({w:1080,h:290,xr:[-2.6*W,2.6*W],yr:[-14,148],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'X(j\\omega)',
      pad:{l:62,r:28,t:34,b:40},xstep:W,ystep:30,
      xtickfmt:v=>{const k=Math.round(v/W); return k===0?'0':(k===1?'120π':k===-1?'−120π':k===2?'240π':k===-2?'−240π':'');}});
    a.curve(w=>Math.abs(w)<2*W?120*(1-Math.abs(w)/(2*W)):0,{color:C.mid,n:1200});
    return a.svg();},
  err:'Reporting the same bandwidth as the unsquared sinc, on the grounds that squaring does not change where the zeros of the time signal are. Bandwidth is a statement about the spectrum, and squaring doubles it.',
  teach:'The supports-add rule is the same one used for convolution in Module 3, now applied on the other axis. Making that link explicit saves teaching the result twice.' },

{ id:'D7-06', module:'M7', type:'nyq-band', src:'Final Q4',
  stem:'Find the Nyquist rate for $$x(t)=\\frac{\\sin(150\\pi t)}{\\pi t}+\\frac{\\sin(400\\pi t)}{\\pi t}.$$',
  parts:['Describe $X(j\\omega)$.',
         'Give $\\omega_M$ and the Nyquist rate, and say which term determines it.'],
  sol:'<b>Given.</b> A sum of two ideal low-pass signals of different bandwidths.<br>'
     +'<b>Find.</b> The bandwidth of the sum.<br>'
     +'<b>Method.</b> The transform is linear, so the spectra add. Two rectangles centred on the origin overlap rather than sit side by side.<br>'
     +'<b>Solution — part (a).</b> The first term contributes a rectangle of height $1$ on $|\\omega|<150\\pi$ and the second a rectangle of height $1$ on $|\\omega|<400\\pi$. Adding them gives a staircase:$$X(j\\omega)=\\begin{cases}2,&|\\omega|<150\\pi,\\\\1,&150\\pi<|\\omega|<400\\pi,\\\\0,&|\\omega|>400\\pi.\\end{cases}$$'
     +'<b>Solution — part (b).</b>$$\\omega_M=400\\pi\\;\\text{rad/s},\\qquad\\omega_s=800\\pi\\;\\text{rad/s},\\qquad f_s=400\\;\\text{Hz}.$$The <b>wider</b> term determines the rate. The narrower one adds height inside the band but no width.<br>'
     +'<b>Check.</b> Area test: $X(0)=2$, and each sinc has unit area, so $\\int x=1+1=2$. For a sum the bandwidth is the maximum of the individual bandwidths, never the sum of them — that rule belongs to a product.',
  err:'Adding the bandwidths and reporting $\\omega_M=550\\pi$. Adding bandwidths is what a product in time does; a sum takes the larger.',
  teach:'Put this question directly beside the product question. The contrast between "sum takes the maximum" and "product adds" is the single most useful sentence in the module.' },

{ id:'D7-07', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'Two signals are band-limited: $X_1(j\\omega)=0$ for $|\\omega|>120\\pi$ and $X_2(j\\omega)=0$ for $|\\omega|>250\\pi$. Define $$y(t)=x_1(t)*x_2(t).$$',
  parts:['Give the band-limit of $y(t)$.',
         'Give the Nyquist rate for $y(t)$, and justify the answer in one sentence.'],
  sol:'<b>Given.</b> Two band-limited signals, convolved.<br>'
     +'<b>Find.</b> The band-limit of the result.<br>'
     +'<b>Method.</b> Convolution in time is multiplication in frequency:$$Y(j\\omega)=X_1(j\\omega)X_2(j\\omega).$$A product is zero wherever <em>either</em> factor is zero.<br>'
     +'<b>Solution — part (a).</b> Above $120\\pi$ the first factor vanishes, so the product vanishes there too. Hence$$Y(j\\omega)=0\\ \\text{for}\\ |\\omega|>120\\pi,\\qquad\\omega_M=120\\pi\\;\\text{rad/s}.$$The bandwidth is the <b>smaller</b> of the two.<br>'
     +'<b>Solution — part (b).</b>$$\\omega_s=240\\pi\\;\\text{rad/s},\\qquad f_s=120\\;\\text{Hz}.$$Convolving cannot create frequencies that were absent from both inputs, and it removes every frequency absent from either.<br>'
     +'<b>Check.</b> The narrower signal acts as a filter on the wider one, which is exactly what an LTI system does. Taking $x_1$ as the impulse response of an ideal low-pass with cut-off $120\\pi$ makes the statement obvious: the output of a low-pass filter is band-limited to its cut-off, whatever went in.',
  err:'Applying the supports-add rule from the time domain and reporting $370\\pi$. Supports add under convolution, but this convolution is in <em>time</em>, so it is the spectra that multiply.',
  teach:'Ask which of the two signals could be called the filter. Naming it converts an abstract rule into a fact the student already knows from Module 3.' },

{ id:'D7-08', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'With the same two signals — $X_1(j\\omega)=0$ for $|\\omega|>120\\pi$ and $X_2(j\\omega)=0$ for $|\\omega|>250\\pi$ — define $$z(t)=x_1(t)\\,x_2(t).$$',
  parts:['Give the band-limit of $z(t)$.',
         'Give the Nyquist rate for $z(t)$, and contrast the answer with the convolution case.'],
  sol:'<b>Given.</b> The same two signals, multiplied instead of convolved.<br>'
     +'<b>Find.</b> The band-limit of the product.<br>'
     +'<b>Method.</b> Multiplication in time is convolution in frequency,$$Z(j\\omega)=\\frac{1}{2\\pi}\\left[X_1*X_2\\right](j\\omega),$$and supports add under convolution.<br>'
     +'<b>Solution — part (a).</b>$$\\omega_M=120\\pi+250\\pi=370\\pi\\;\\text{rad/s}.$$'
     +'<b>Solution — part (b).</b>$$\\omega_s=740\\pi\\;\\text{rad/s},\\qquad f_s=370\\;\\text{Hz}.$$Convolving the two signals gave $120\\pi$, the smaller bandwidth; multiplying them gives $370\\pi$, the sum. The two operations move the band-limit in opposite directions, and by different rules.<br>'
     +'<b>Check.</b> The rule is consistent with the special cases already met: squaring a signal is multiplying it by itself, and it doubles the bandwidth — which is $W+W$. Multiplying by a cosine is multiplying by a signal whose spectrum is two impulses at $\\pm\\omega_c$, and impulses have zero width, so the band is shifted rather than widened.',
  err:'Using the same rule for both operations. Which rule applies is decided by which domain the operation is performed in, not by which is easier to remember.',
  teach:'Have both this question and the previous one answered on the same page, with the two rules written side by side. Separating them in time guarantees they will be confused.' },

{ id:'D7-09', module:'M7', type:'nyq-op', src:'Final Q4',
  stem:'Let $$z(t)=\\frac{\\sin(150\\pi t)}{\\pi t}\\cos(500\\pi t).$$',
  parts:['Describe $Z(j\\omega)$, giving the edges of every band it occupies.',
         'Give $\\omega_M$ and the Nyquist rate.'],
  sol:'<b>Given.</b> An ideal low-pass signal modulated by a carrier at $500\\pi$ rad/s.<br>'
     +'<b>Find.</b> The occupied bands and the Nyquist rate.<br>'
     +'<b>Method.</b> Multiplying by a cosine convolves the spectrum with two impulses, producing two shifted half-height copies:$$Z(j\\omega)=\\tfrac12X\\bigl(j(\\omega-500\\pi)\\bigr)+\\tfrac12X\\bigl(j(\\omega+500\\pi)\\bigr).$$'
     +'<b>Solution — part (a).</b> Here $X(j\\omega)=1$ on $|\\omega|<150\\pi$. Each copy is $300\\pi$ wide and centred on $\\pm500\\pi$, so$$Z(j\\omega)=\\tfrac12\\ \\text{on}\\ 350\\pi<\\omega<650\\pi\\ \\text{and on}\\ -650\\pi<\\omega<-350\\pi,$$and zero elsewhere. There is no energy at or near the origin.<br>'
     +'<b>Solution — part (b).</b> The highest frequency present is the outer edge,$$\\omega_M=650\\pi\\;\\text{rad/s},\\qquad\\omega_s=1300\\pi\\;\\text{rad/s},\\qquad f_s=650\\;\\text{Hz}.$$'
     +'<b>Check.</b> The band-limit is $\\omega_c+W=500\\pi+150\\pi=650\\pi$, which is the general rule for modulation. Note that the signal occupies only $600\\pi$ rad/s in total, in two bands of width $300\\pi$, yet the Nyquist rate counts the distance to the outermost edge rather than the width of the occupied bands. That gap is what bandpass sampling exploits, and it is outside the scope of the plain sampling theorem used here.',
  figSol:()=>{const W=50*Math.PI;
    const a=P.Axes({w:1080,h:290,xr:[-16*W,16*W],yr:[-0.14,0.75],xlabel:'\\omega\\;(\\text{rad/s})',ylabel:'Z(j\\omega)',
      pad:{l:62,r:28,t:34,b:40},xstep:5*W,ystep:0.25,
      xtickfmt:v=>{const k=Math.round(v/W); return k===0?'0':(Math.abs(k)%5===0&&Math.abs(k)<=15?(k<0?'−':'')+String(Math.abs(k)*50)+'π':'');}});
    a.poly([[-16*W,0],[-13*W,0],[-13*W,0.5],[-7*W,0.5],[-7*W,0],[7*W,0],[7*W,0.5],[13*W,0.5],[13*W,0],[16*W,0]],{color:C.out});
    return a.svg();},
  err:'Taking $\\omega_M=500\\pi$ from the carrier alone. The carrier is the centre of the band, and the highest frequency is the centre plus the half-width of the signal.',
  teach:'Ask for the width of each copy and the location of its centre separately. Students who compute both never report the carrier frequency as the answer.' },

{ id:'D7-10', module:'M7', type:'alias', src:'Final Q4',
  stem:'The signal $x(t)=\\cos(2\\pi\\cdot800t)$ is sampled at $f_s=1000$ Hz.',
  parts:['State whether the sampling theorem is satisfied.',
         'Give the apparent frequency of the sampled sequence.',
         'Name one other continuous-time cosine that produces exactly the same samples.'],
  sol:'<b>Given.</b> An $800$ Hz cosine sampled at $1000$ Hz.<br>'
     +'<b>Find.</b> The apparent frequency after sampling.<br>'
     +'<b>Method.</b> Sampling replicates the spectrum every $f_s$. A component at $f_0$ appears at the distance from $f_0$ to the nearest multiple of $f_s$, folded into $\\left[0,f_s/2\\right]$.<br>'
     +'<b>Solution — part (a).</b> The Nyquist rate is $2\\times800=1600$ Hz, and $1000<1600$. The theorem is <b>not</b> satisfied, so aliasing occurs.<br>'
     +'<b>Solution — part (b).</b> The nearest multiple of $1000$ to $800$ is $1000$ itself, so the apparent frequency is$$\\left|800-1000\\right|=200\\;\\text{Hz}.$$In samples, $\\cos\\!\\left(2\\pi\\cdot800\\cdot\\tfrac{n}{1000}\\right)=\\cos(1.6\\pi n)=\\cos(1.6\\pi n-2\\pi n)=\\cos(0.4\\pi n)$, which is $200$ Hz sampled at $1000$ Hz.<br>'
     +'<b>Solution — part (c).</b> $\\cos(2\\pi\\cdot200t)$ gives exactly the same samples. So does $\\cos(2\\pi\\cdot1200t)$, and every $\\cos\\!\\left(2\\pi(200+1000k)t\\right)$.<br>'
     +'<b>Check.</b> The apparent frequency $200$ Hz lies below $f_s/2=500$ Hz, as it must: everything folds into the band $\\left[0,f_s/2\\right]$. Sampling four consecutive values confirms it — both $800$ Hz and $200$ Hz give $1$, $0.309$, $-0.809$, $-0.809$ at $n=0,1,2,3$.',
  err:'Reporting the apparent frequency as $800-500=300$ Hz by folding about $f_s/2$ rather than about the nearest multiple of $f_s$. The folding point is $f_s$, and $f_s/2$ is only where the resulting band ends.',
  teach:'Have the samples tabulated for both frequencies. Aliasing stops being a formula and becomes an observation the moment two different signals produce the same four numbers.' },

{ id:'D7-11', module:'M7', type:'alias', src:'Final Q4',
  stem:'The signal $$x(t)=\\cos(2\\pi\\cdot300t)+\\cos(2\\pi\\cdot700t)$$is sampled at $f_s=1000$ Hz.',
  parts:['Give the apparent frequency of each component.',
         'State what the sampled sequence looks like, and say whether the original signal can be recovered.'],
  sol:'<b>Given.</b> Two cosines, one below and one above $f_s/2$.<br>'
     +'<b>Find.</b> What each becomes after sampling.<br>'
     +'<b>Method.</b> Fold each frequency to its distance from the nearest multiple of $f_s$.<br>'
     +'<b>Solution — part (a).</b> The $300$ Hz component is below $f_s/2=500$ Hz, so it is unaffected and appears at $300$ Hz. The $700$ Hz component folds to$$\\left|700-1000\\right|=300\\;\\text{Hz}.$$Both land on the same apparent frequency.<br>'
     +'<b>Solution — part (b).</b> The samples are$$x[n]=\\cos(0.6\\pi n)+\\cos(1.4\\pi n)=2\\cos(0.6\\pi n),$$because $\\cos(1.4\\pi n)=\\cos(0.6\\pi n)$ for every integer $n$. The sampled sequence is a single cosine of amplitude $2$ at an apparent $300$ Hz. The original signal <b>cannot</b> be recovered: the same samples would come from $2\\cos(2\\pi\\cdot300t)$, from the given signal, and from infinitely many others.<br>'
     +'<b>Check.</b> The Nyquist rate is $2\\times700=1400$ Hz, well above $1000$, so failure was expected. The two components did not merely overlap, they coincided exactly, which is the worst case: no amount of filtering after sampling can separate them, because they occupy the same frequency.<br>'
     +'<b>What would have worked.</b> Sampling at any rate above $1400$ Hz, or filtering the input to remove everything above $500$ Hz before sampling. The second option loses the $700$ Hz component but keeps the $300$ Hz one recoverable, which is what an anti-aliasing filter is for.',
  err:'Reporting the apparent frequencies as $300$ and $700$ Hz because both are "present in the signal". After sampling, only frequencies in $\\left[0,f_s/2\\right]$ can be distinguished.',
  teach:'The final paragraph is the one students need. Aliasing is not repaired downstream; it is prevented upstream, and that is a design decision rather than a calculation.' },

{ id:'D7-12', module:'M7', type:'alias', src:'Final Q4',
  stem:'A signal is band-limited to $\\omega_M=200\\pi$ rad/s. It is to be sampled and then reconstructed with a practical low-pass filter whose transition band is $\\omega_g=50\\pi$ rad/s wide.',
  parts:['Give the minimum sampling rate when an ideal reconstruction filter is assumed.',
         'Give the minimum sampling rate that leaves room for the stated guard band.',
         'Explain in one sentence why the guard band is needed.'],
  sol:'<b>Given.</b> A signal band-limited to $200\\pi$ rad/s, and a reconstruction filter that cannot cut off instantly.<br>'
     +'<b>Find.</b> The sampling rate in both cases.<br>'
     +'<b>Method.</b> Sampling at $\\omega_s$ places copies of the spectrum centred at every multiple of $\\omega_s$. The copy at the origin ends at $\\omega_M$; the next copy begins at $\\omega_s-\\omega_M$. The gap between them is the room the reconstruction filter has to work in.<br>'
     +'<b>Solution — part (a).</b> With an ideal filter no gap is needed, so$$\\omega_s\\ge2\\omega_M=400\\pi\\;\\text{rad/s}\\qquad(f_s\\ge200\\;\\text{Hz}).$$'
     +'<b>Solution — part (b).</b> The gap between the two copies is $\\left(\\omega_s-\\omega_M\\right)-\\omega_M=\\omega_s-2\\omega_M$. Requiring it to be at least $\\omega_g$ gives$$\\omega_s\\ge2\\omega_M+\\omega_g=400\\pi+50\\pi=450\\pi\\;\\text{rad/s}\\qquad(f_s\\ge225\\;\\text{Hz}).$$'
     +'<b>Solution — part (c).</b> A real filter cannot fall from full transmission to full rejection at a single frequency, so the copies must be separated by at least the width of its transition band, or part of the neighbouring copy is passed into the output.<br>'
     +'<b>Check.</b> Setting $\\omega_g=0$ recovers the ideal answer $400\\pi$, so the two results are consistent. The extra $25$ Hz is the price of a buildable filter, and it is why practical audio systems sample at $44.1$ kHz for a $20$ kHz band rather than at exactly $40$ kHz.',
  err:'Writing $\\omega_s\\ge2\\left(\\omega_M+\\omega_g\\right)$, which doubles the guard band. The gap between copies is measured once, between the end of one and the start of the next.',
  teach:'Ask for the sketch of two adjacent copies with the gap marked before any inequality is written. The formula is then read off the picture rather than recalled.' },

]);

window.DRILL_M7 = [

{ id:'m7-drill-map', module:'M7', nav:'Module 7 exam drill · question types',
  title:'Module 7 — what a question looks like', src:'pp. 73–88',
  objective:'Name the four recurring question shapes before the module is read.',
  keywords:'exam drill module 7 question types Nyquist rate bandwidth aliasing guard band taxonomy practice',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Exam drill', src:'pp. 73–88'},
  {t:'title', text:'Four shapes, and the method each one wants'},
  {t:'lede', text:'Questions on sampling come in four shapes, and three of them reduce to the same task: find the highest frequency present. Read them now, before the module. You are not expected to be able to answer them yet — you are expected to recognise them when they arrive.'},
  {t:'raw', html:'<div style="height:10px"></div>'},
  {t:'drilltypes', module:'M7'},
  {t:'note', kind:'def', head:'The two rules that decide most of these questions', html:'A <b>product</b> in time convolves the spectra, so the bandwidths <b>add</b>. A <b>convolution</b> in time multiplies the spectra, so the bandwidth is the <b>smaller</b> of the two. A <b>sum</b> takes the larger. Getting these three straight answers most of the module.'}
]},

{ id:'m7-drill', module:'M7', nav:'Module 7 exam drill · questions',
  title:'Module 7 — exam drill', src:'pp. 73–88',
  objective:'Twelve open-ended questions in examination form, with worked solutions.',
  keywords:'exam drill module 7 questions practice Nyquist rate sampling aliasing bandwidth guard band',
  steps:0, blocks:[
  {t:'eyebrow', text:'Module 7 · Exam drill D7-01 … D7-12', src:'pp. 73–88'},
  {t:'title', text:'Exam drill'},
  {t:'small', html:'Work each question on paper before opening its solution. Give $\\omega_M$ before the rate every time, so the factor of two is visible, and state the units — a rate in rad/s and a rate in hertz differ by $2\\pi$. The sinc convention used throughout is the unnormalised one, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$.'},
  {t:'rule', short:true},
  {t:'drill', module:'M7'}
]}

];

})();
