/* ==========================================================================
   Closing synthesis and conventions
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

const SC = [

{ id:'end-synth', module:'Synthesis', nav:'Closing synthesis', title:'One chain of reasoning', src:'pp. 2–88',
  objective:'Summarise how signals, LTI systems, transforms, and sampling connect.',
  keywords:'closing synthesis unified through-line convolution fourier transform sampling', steps:2, blocks:[
  {t:'eyebrow', text:'Synthesis · Modules 0–7', src:'pp. 2–88'},
  {t:'title', text:'How the main ideas connect'},
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
    {t:'body', html:`<p>Use the <b>time domain</b> when the input is short or piecewise, when one output value is required, or when the system is not LTI and convolution does not apply.</p>
      <p>Use the <b>frequency domain</b> when the input is periodic or long, when the question asks which frequency components remain, or when time-domain convolution would require more than about three cases. Use a Fourier series for a periodic signal and a Fourier transform for an aperiodic signal. Use square brackets when time is discrete.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Misconceptions to guard against', html:'Confusing energy with power · applying shift and scale in the wrong order · assuming every discrete-time sinusoid is periodic · classifying a system without a formal test · forgetting the flip in convolution · naming the forward transform “synthesis” · dropping the $2\\pi$ from an impulse weight · drawing a discrete-time spectrum over one period only · reading replication and aliasing as one event.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Central result', html:'One impulse response completely describes a linear time-invariant system. Compute its output by convolving with $h$ in time or by multiplying by $H$ in frequency. Fourier series and transforms provide the frequency representation, while the sampling theorem states when discrete samples preserve it.'}]}
  ]}
]},

{ id:'end-map', module:'Synthesis', nav:'What each module added', title:'What each module added', src:'pp. 2–88',
  objective:'Name the one thing each module contributes and the equation that carries it.',
  keywords:'course map modules summary equations laboratories practice questions', steps:1, blocks:[
  {t:'eyebrow', text:'Synthesis · Modules 0–7', src:'pp. 2–88'},
  {t:'title', text:'Eight modules, eight additions'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
        ['Module 0','The purpose, structure, and notation of the course.'],
      ['Module 1','A signal is a function. Energy against power, transformations of the independent variable, impulses, and the complex exponential family.'],
        ['Module 2','A system maps input signals to output signals. Each property is established by a proof or disproved by one counterexample.'],
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
    {t:'body', html:`<p>Laboratories A to J let one parameter vary while linked plots and numerical readouts show the result. They cover signal transformations, system properties, convolution, harmonic approximation, filtering, modulation, and sampling.</p>
      <p>Each module from 1 to 7 begins with its recurring question types and ends with thirty open-ended questions. The last ten are multi-part problems. Work each question on paper before opening its solution, then compare both the calculation and its independent check.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'How to practise', html:'Use a laboratory first to connect each control with its plotted effect. Then close the solution panels and answer the module questions. The laboratory shows the behaviour; the questions test whether you can predict it.'}]}
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
    {t:'instr', head:'INSTRUCTOR-ONLY · provenance', html:'Artifact v1.7 — Modules 0–7 in 235 scenes, laboratories A–J, and 210 open-ended practice questions, D1–D7, thirty to a module. The contents carries a chapter, section and scene address for every scene, and an anchor into the course textbook for the 208 scenes that have a counterpart there; both are declared once in 89_sections.js and checked by seccheck.js. Each module opens with a taxonomy of the question types that keep coming back and closes with the questions themselves, one to a screen. Every number a solution states in its Check step is re-derived independently: 913 checks over the drills, 50 over Modules 1 to 3 and 26 over the Fourier properties of Modules 4 to 6. Source pages 2–88 are mapped scene by scene in the coverage matrix. Confirmed issues in the source material are recorded as A-09 … A-104 in the continuous ledger, and each one is stated in the artifact at the point where it occurs, in the artifact\'s own voice. Coverage matrix, traceability and the ledger are held outside the student build.'}
  ]}
]}

];
window.SCENES_END = SC;
})();
