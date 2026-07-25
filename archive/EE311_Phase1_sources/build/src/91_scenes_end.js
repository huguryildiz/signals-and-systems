/* ==========================================================================
   EE311 · Closing synthesis and provenance
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
        ['A signal is a function','x(t), x[n]','p. 2'],
        ['It decomposes into impulses','x[n] = Σ x[k] δ[n−k]','pp. 6, 15'],
        ['A system is a map on signals','y = S{x}','p. 11'],
        ['Linear + time invariant','the only two that matter here','pp. 13–14'],
        ['⇒ one function describes it','h[n], h(t)','p. 14'],
        ['⇒ one operation computes it','y = x ∗ h','pp. 15, 18']
      ];
      steps.forEach((s,i)=>{
        const y=40+i*72;
        g.push(`<line x1="34" y1="${y-20}" x2="${W-20}" y2="${y-20}" stroke="#E2DACA"/>`);
        g.push(`<text x="0" y="${y+4}" font-size="12.5" font-family="ui-monospace,monospace" letter-spacing="1.6" fill="#4A657F">0${i+1}</text>`);
        g.push(`<text x="46" y="${y+5}" font-size="21" font-family="Georgia,serif" fill="#1B1A17">${s[0]}</text>`);
        g.push(`<text x="${W-20}" y="${y+5}" font-size="17" fill="#BE5539" text-anchor="end" font-style="italic">${s[1]}</text>`);
        g.push(`<text x="${W-20}" y="${y+26}" font-size="11.5" font-family="ui-monospace,monospace" letter-spacing="1.2" fill="#9A948A" text-anchor="end">PDF ${s[2]}</text>`);
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
      {t:'note', kind:'ok', head:'Still ahead', html:'Fourier series and the eigenfunction property (Module 4) · the continuous-time Fourier transform (Module 5) · the discrete-time Fourier transform and its $2\\pi$-periodicity (Module 6) · sampling, spectral replication and aliasing (Module 7). All four are source-mapped against PDF pp. 22–88 and are produced in the next phase.'}]}
  ]}
]},

{ id:'end-provenance', module:'M4+', nav:'Version and provenance', title:'Version, provenance and known issues', src:'—',
  objective:'Declare the version manifest, conventions and unresolved source ambiguities.',
  keywords:'version provenance manifest ambiguity ledger conventions changelog', steps:0, blocks:[
  {t:'eyebrow', text:'Provenance'},
  {t:'title', text:'Version manifest'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'wex', rows:[
      ['Course','EE 311 — Signals and Systems'],
      ['Source file','<code>EE311 - Lecture Notes.pdf</code> · 88 pages'],
      ['Version','v0.9 · Phase 1 (Modules 0–3, laboratories A–E, question banks Q1–Q3)'],
      ['Date','2026-07-25'],
      ['Language','Academic English'],
      ['Transform conventions','$X(j\\omega)=\\int x(t)e^{-j\\omega t}\\d t$ · $X(e^{j\\omega})=\\sum x[n]e^{-j\\omega n}$ — declared here for cross-deliverable consistency; used from Module 5 onwards.'],
      ['sinc convention','Unnormalised, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, restated explicitly at every point of use.'],
      ['Energy convention','Normalised, $R=1\\ \\Omega$.'],
      ['Citation policy','Every scene carries <code>[Source: EE311 Lecture Notes, PDF p. XX]</code>. Material not in the notes is labelled an editorial enhancement. Question banks are labelled editorially developed.'],
      ['Privacy','No network requests, no analytics. Optional progress is stored on this device only and can be cleared from the orientation scene.']
    ]}
  ], right:[
    {t:'sub', text:'Source ambiguities recorded in Modules 0–3'},
    {t:'small', html:`<p>Eight issues were found in PDF pp. 1–21 during the visual audit. None was silently corrected; each is stated where it occurs.</p>`},
    {t:'raw', html:`<div style="font-size:16px;line-height:1.5;color:var(--graphite)">
      <table style="width:100%;border-collapse:collapse">
        <tr style="font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;color:var(--slate);text-align:left">
          <th style="padding:6px 8px 6px 0">ID</th><th style="padding:6px 8px">p.</th><th style="padding:6px 8px">issue</th><th style="padding:6px 8px">resolution adopted</th></tr>
        ${[
          ['A-01','2','R = 1 normalisation applied silently','stated explicitly on the energy scene'],
          ['A-02','3','OCR text layer garbles a homework shift','visual reading x[n+4] is authoritative'],
          ['A-03','4','“x(t) = x(at)” abuse of notation','read as y(t) = x(at); notation note added'],
          ['A-04','7','δ(t) = ∞ at t = 0 taken literally','presented as a distribution defined by sifting'],
          ['A-05','10','“ω₀ a rational multiple of 2π”','kept, with the equivalent ω₀/2π ∈ ℚ'],
          ['A-06','12','cos(t+1) described as “constant”','known deterministic function of t'],
          ['A-07','17','finite geometric sum stated with |r| &lt; 1','finite sum needs only r ≠ 1'],
          ['A-08','21','BIBO ⟺ absolute summability','only sufficiency is proved in the source']
        ].map(r=>`<tr style="border-top:1px solid var(--rule)">
          <td style="padding:8px 8px 8px 0;font-family:var(--mono);font-size:13px;color:var(--coral)">${r[0]}</td>
          <td style="padding:8px;color:var(--muted)">${r[1]}</td>
          <td style="padding:8px">${r[2]}</td><td style="padding:8px;color:var(--muted)">${r[3]}</td></tr>`).join('')}
      </table></div>`},
    {t:'note', kind:'warn', head:'Open items for Phase 2', html:'The audit of PDF pp. 22–88 was produced at coverage-matrix level and lists a further set of candidate issues in the Fourier and sampling chapters — including apparent analysis/synthesis label swaps, a sign error in a modulation example, and a sampling-period arithmetic slip. Those pages are re-verified page by page before Modules 4–7 are authored; no result from them is used in this build.'}
  ]}
]}

];
window.SCENES_END = SC;
})();
