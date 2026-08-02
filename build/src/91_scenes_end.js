/* ==========================================================================
   Closing synthesis and conventions
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

const SC = [

{ id:'end-synth', module:'Synthesis', nav:'Closing synthesis', title:'One chain of reasoning', src:'pp. 2–88',
  objective:'Carry the whole course as a single argument, from a signal to a sampled signal.',
  keywords:'closing synthesis unified through-line convolution fourier transform sampling', steps:2, blocks:[
  {t:'eyebrow', text:'Synthesis · Modules 0–7', src:'pp. 2–88'},
  {t:'title', text:'One chain of reasoning'},
  {t:'cols', ratio:'c-7-5', left:[
    {t:'fig', svg:()=>{
      const W=1080,H=545,g=[];
      const steps=[
        ['A signal is a function','x(t),\\;x[n]'],
        ['It decomposes into impulses','x[n]=\\sum_k x[k]\\,\\delta[n-k]'],
        ['A system is a map on signals','y=S\\{x\\}'],
        ['Linear and time invariant','\\text{the only two that matter}'],
        ['so one function describes it','h(t),\\;h[n]'],
        ['and one operation computes it','y=x*h'],
        ['An exponential passes through unchanged','e^{st}\\to H(s)\\,e^{st}'],
        ['so decompose into exponentials instead','\\text{series, then transform}'],
        ['and convolution becomes a product','Y=X\\cdot H'],
        ['Sampling replicates the spectrum','X_p=\\tfrac{1}{T}\\sum_k X\\bigl(j(\\omega-k\\omega_s)\\bigr)']
      ];
      steps.forEach((s,i)=>{
        const y=34+i*50;
        g.push(`<line x1="34" y1="${y-16}" x2="${W-20}" y2="${y-16}" stroke="${C.grid}"/>`);
        g.push(`<text x="0" y="${y+3}" font-size="12" font-family="ui-monospace,monospace" letter-spacing="1.6" fill="${C.slate}">${i<9?'0':''}${i+1}</text>`);
        g.push(`<text x="46" y="${y+4}" font-size="19" font-family="Georgia,serif" fill="${C.ink}">${s[0]}</text>`);
        g.push(P.texName(s[1],{xRight:W-20, baseline:y+4, size:15.5, color:C.coral, figW:W}));
        if(i<steps.length-1) g.push(`<line x1="12" y1="${y+12}" x2="12" y2="${y+32}" stroke="${C.ruleStrong}" stroke-width="1" stroke-dasharray="1 5"/>`);
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }}
  ], right:[
    {t:'sub', text:'Choosing a domain'},
    {t:'body', html:`<p>Work in the <b>time domain</b> when the input is short and piecewise, when you need the output at a particular instant, or when the system is not LTI and convolution is unavailable anyway.</p>
      <p>Work in the <b>frequency domain</b> when the input is periodic or long, when the question is which components survive, or when a convolution would need more than about three cases. The transform is chosen by the signal: a series for a periodic one, a transform for an aperiodic one, and square brackets throughout if time is discrete.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Misconceptions to guard against', html:'Confusing energy with power · applying shift and scale in the wrong order · assuming every discrete-time sinusoid is periodic · classifying a system without a formal test · forgetting the flip in convolution · naming the forward transform “synthesis” · dropping the $2\\pi$ from an impulse weight · drawing a discrete-time spectrum over one period only · reading replication and aliasing as one event.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'The one sentence to keep', html:'A linear time-invariant system is completely described by one function, and the whole of this course is two ways of using it: convolve with $h$ in time, or multiply by $H$ in frequency. Everything else — the series, the two transforms, the sampling theorem — is about which of the two is easier and what it costs to move between them.'}]}
  ]}
]},

{ id:'end-map', module:'Synthesis', nav:'What each module added', title:'What each module added', src:'pp. 2–88',
  objective:'Name the one thing each module contributes and the equation that carries it.',
  keywords:'course map modules summary equations laboratories practice questions', steps:1, blocks:[
  {t:'eyebrow', text:'Synthesis · Modules 0–7', src:'pp. 2–88'},
  {t:'title', text:'Eight modules, eight additions'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Module 0','What a course on signals and systems is for, and the map of it.'],
      ['Module 1','A signal is a function. Energy against power, transformations of the independent variable, impulses, and the complex exponential family.'],
      ['Module 2','A system is a map on signals. Six properties, each settled by a proof or by one counterexample.'],
      ['Module 3','Linear and time invariant together give $y=x*h$. One function describes the system; one operation computes the output.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Module 4','A periodic signal is a sum of harmonics, and an exponential passes through an LTI system unchanged: $a_k\\to a_kH(jk\\omega_0)$.'],
        ['Module 5','An aperiodic signal is an integral of exponentials: $X(j\\omega)=\\int x(t)e^{-j\\omega t}\\d t$, and convolution becomes a product.'],
        ['Module 6','The same construction in discrete time, where the spectrum is $2\\pi$-periodic because the time index is an integer.'],
        ['Module 7','Sampling replicates a spectrum. Whether the copies overlap is decided by $\\omega_s-2\\omega_M$, and that number decides whether the signal survives.']
      ]}]}
  ], right:[
    {t:'sub', text:'Where the practice sits'},
    {t:'body', html:`<p>Ten laboratories run beside the modules, A to J. Each one is a single question made adjustable: what a transformation does to a support, what a filter keeps, how many harmonics a waveform needs, where a spectrum lands after modulation, what a rate too low destroys.</p>
      <p>Every module from 1 to 7 opens with a map of the question types it will ask and closes with thirty questions of that kind, the last ten of them full-length questions with several parts under one statement. Nothing is multiple choice: a question is stated, worked on paper, and then checked against a full solution that ends by testing its own answer a second way.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'How to use what is left', html:'Work a laboratory until its readout stops surprising you, then work its module\'s questions with the solutions closed. The two are built to be used in that order: the laboratory makes a behaviour visible, and the questions ask whether you can predict it before you look.'}]}
  ]}
]},

{ id:'end-conventions', module:'Synthesis', nav:'Conventions and symbols', title:'Conventions used throughout', src:'—',
  objective:'Collect the conventions a reader needs in one place.',
  keywords:'conventions notation sinc transform normalised energy imaginary unit', steps:0, blocks:[
  {t:'eyebrow', text:'Reference'},
  {t:'title', text:'Conventions used throughout'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Energy and power','Normalised: the resistance is taken as $1\\ \\Omega$, so power is $|x|^{2}$ and energy is its integral or sum.'],
      ['Imaginary unit','$j$, with $j^{2}=-1$.'],
      ['Angular frequency','$\\omega$ in rad/s in continuous time, rad/sample in discrete time. Frequency in hertz is written out when it is used.'],
      ['Brackets','Round brackets for continuous time, $x(t)$. Square brackets for discrete time, $x[n]$, where $n$ is an integer.'],
      ['Convolution','$*$. It applies only to systems that are linear and time invariant.']
    ]}
  ], right:[
    {t:'sub', text:'Transforms (used from Module 4 onwards)'},
    {t:'eq', size:'sm', tex:'X(j\\omega)=\\int_{-\\infty}^{\\infty}x(t)e^{-j\\omega t}\\,\\d t,\\qquad x(t)=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}X(j\\omega)e^{j\\omega t}\\,\\d\\omega'},
    {t:'eq', size:'sm', tex:'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n},\\qquad x[n]=\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\omega})e^{j\\omega n}\\,\\d\\omega'},
    {t:'note', kind:'def', head:'sinc', html:'Unnormalised: $\\operatorname{sinc}(\\theta)=\\dfrac{\\sin\\theta}{\\theta}$. The convention is restated wherever sinc appears.'},
    {t:'note', kind:'def', head:'Sampling', html:'A rate is angular unless it is named in hertz: $\\omega_s=2\\pi/T$ rad/s and $f_s=1/T$ Hz. The sampling theorem is stated with a strict inequality, $\\omega_s>2\\omega_M$.'},
    {t:'instr', head:'INSTRUCTOR-ONLY · provenance', html:'Artifact v1.5 — Modules 0–7 in 223 scenes, laboratories A–J, and 210 open-ended practice questions, D1–D7, thirty to a module. The contents carries a chapter, section and scene address for every scene, and an anchor into the course textbook for the 196 scenes that have a counterpart there; both are declared once in 89_sections.js and checked by seccheck.js. Each module opens with a taxonomy of the question types that keep coming back and closes with the questions themselves, one to a screen. Every number a solution states in its Check step is re-derived independently: 913 checks over the drills and 50 over the module content. Source pages 2–88 are mapped scene by scene in the coverage matrix. Confirmed issues in the source material are recorded as A-09 … A-104 in the continuous ledger, and each one is stated in the artifact at the point where it occurs, in the artifact\'s own voice. Coverage matrix, traceability and the ledger are held outside the student build.'}
  ]}
]}

];
window.SCENES_END = SC;
})();
