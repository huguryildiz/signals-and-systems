/* ==========================================================================
   EE311 · Closing synthesis and conventions
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;

const SC = [

{ id:'end-synth', module:'M4+', nav:'Closing synthesis', title:'Where Modules 0–3 leave you', src:'pp. 2–21',
  objective:'Unify the three modules and state the bridge to the frequency domain.',
  keywords:'closing synthesis unified map essential equations decision workflow', steps:2, blocks:[
  {t:'eyebrow', text:'Synthesis · Modules 0–3', src:'pp. 2–21'},
  {t:'title', text:'One chain of reasoning'},
  {t:'cols', ratio:'c-7-5', left:[
    {t:'fig', svg:()=>{
      const W=1080,H=460,g=[];
      const steps=[
        ['A signal is a function','x(t), x[n]',''],
        ['It decomposes into impulses','x[n] = Σ x[k] δ[n−k]',''],
        ['A system is a map on signals','y = S{x}',''],
        ['Linear + time invariant','the only two that matter here',''],
        ['⇒ one function describes it','h[n], h(t)',''],
        ['⇒ one operation computes it','y = x ∗ h','']
      ];
      steps.forEach((s,i)=>{
        const y=40+i*72;
        g.push(`<line x1="34" y1="${y-20}" x2="${W-20}" y2="${y-20}" stroke="#E2DACA"/>`);
        g.push(`<text x="0" y="${y+4}" font-size="12.5" font-family="ui-monospace,monospace" letter-spacing="1.6" fill="#4A657F">0${i+1}</text>`);
        g.push(`<text x="46" y="${y+5}" font-size="21" font-family="Georgia,serif" fill="#1B1A17">${s[0]}</text>`);
        g.push(`<text x="${W-20}" y="${y+5}" font-size="17" fill="#BE5539" text-anchor="end" font-style="italic">${s[1]}</text>`);
        g.push(`<text x="${W-20}" y="${y+26}" font-size="11.5" font-family="ui-monospace,monospace" letter-spacing="1.2" fill="#9A948A" text-anchor="end"></text>`);
        if(i<steps.length-1) g.push(`<line x1="12" y1="${y+16}" x2="12" y2="${y+52}" stroke="#BFB39B" stroke-width="1" stroke-dasharray="1 5"/>`);
      });
      return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter,-apple-system,sans-serif">${g.join('')}</svg>`;
    }}
  ], right:[
    {t:'sub', text:'Choosing a domain'},
    {t:'body', html:`<p>Work in the <b>time domain</b> when the input is short and piecewise, when you need the output at a particular instant, or when the system is not LTI and convolution is unavailable anyway.</p>
      <p>Work in the <b>frequency domain</b> — Modules 4 onwards — when the input is periodic or long, when the question is about which components survive, or when a convolution would require more than about three cases.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Misconceptions this artifact was built to prevent', html:'Confusing energy with power · applying shift and scale in the wrong order · assuming every discrete-time sinusoid is periodic · classifying a system without a formal test · forgetting the flip in convolution.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Still ahead', html:'Fourier series and the eigenfunction property (Module 4) · the continuous-time Fourier transform (Module 5) · the discrete-time Fourier transform and its $2\\pi$-periodicity (Module 6) · sampling, spectral replication and aliasing (Module 7). All four are source-mapped against 22–88 and are produced in the next phase.'}]}
  ]}
]},

{ id:'end-conventions', module:'M4+', nav:'Conventions and symbols', title:'Conventions used throughout', src:'—',
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
    {t:'instr', head:'INSTRUCTOR-ONLY', html:'Internal records: coverage matrix, traceability and the issue ledger are held outside the student build. Artifact v0.9.'}
  ]}
]}

];
window.SCENES_END = SC;
})();
