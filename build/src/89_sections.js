/* ==========================================================================
   NUMBERING — the contents address of every scene, and its textbook anchor.

   Two independent things live here, and they answer different questions.

   The address (`sec`) says where a scene sits in this course: chapter, section,
   scene. The chapters are the ones the lecture notes already carry, so the
   artifact and the notes name the same material the same way.

   The anchor (`book`) says where the same material is developed at length in
   the course textbook. It is a reference and nothing more: no title, no
   sentence and no figure is taken from there.

   Both are declared once, here, and derived onto the scene objects at load
   time by `applyNumbering`. No scene file carries either field, so a
   renumbering is an edit to this file alone.

   The two numbering systems overlap and mean different things — this course's
   chapter 5 is the continuous-time transform, the textbook's chapter 5 is the
   discrete-time one — so an anchor is never rendered as a bare section mark.
   `BOOKMARK` below is what keeps them apart on the page, and it is not
   optional in any surface.
   ========================================================================== */
(function(){

/* The short form that prefixes every rendered anchor, and the full statement
   of what it points into. The full form is printed once, in the scene that
   introduces the convention, and nowhere else. */
CONTENT.BOOKMARK = 'OW';
CONTENT.BOOKREF  = 'Oppenheim and Willsky, <i>Signals and Systems</i>, 2nd edition';

/* On screen the marker is an open book rather than the letters. It is drawn
   here, once, as inline SVG in `currentColor`: the artifact is one offline file,
   so an icon cannot be fetched, and a glyph from a font cannot be relied on to
   exist. In the printed notes the letters stay, because a rule in a contents
   column at eight point is read, not looked at. */
CONTENT.BOOKICON =
  '<svg class="ebicon" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" focusable="false">'
+ '<path d="M8 4.4C7.2 3.5 6 3 4.6 3H2v9.1h2.6c1.4 0 2.6.5 3.4 1.4" '
+ 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'
+ '<path d="M8 4.4C8.8 3.5 10 3 11.4 3H14v9.1h-2.6c-1.4 0-2.6.5-3.4 1.4" '
+ 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>'
+ '<path d="M8 4.4v9.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
+ '</svg>';

/* ---- chapters ----------------------------------------------------------
   `flat:true` marks a chapter with no section level: its scenes are numbered
   two-part. Chapter 0 is the course opening and chapter A is the closing
   material; both are short enough that a section level would be an empty
   frame.

   Chapter A exists because `end-synth`, `end-map` and `end-conventions` carry
   `module:'Synthesis'`, which is not in `CONTENT.MODULES`. The contents rail
   filters on that list, so before this file those three scenes appeared
   nowhere in the contents at all. */
CONTENT.CHAPTERS = [
  { n:'0', module:'M0',        title:'Why signals and systems?',            flat:true },
  { n:'1', module:'M1',        title:'Signals' },
  { n:'2', module:'M2',        title:'Systems and their properties' },
  { n:'3', module:'M3',        title:'Linear time-invariant systems' },
  { n:'4', module:'M4',        title:'Fourier series' },
  { n:'5', module:'M5',        title:'The continuous-time Fourier transform' },
  { n:'6', module:'M6',        title:'The discrete-time Fourier transform' },
  { n:'7', module:'M7',        title:'Sampling and aliasing' },
  { n:'A', module:'Synthesis', title:'Closing synthesis',                   flat:true }
];

/* ---- sections ----------------------------------------------------------
   Per module, in scene order: the section number, its title, and the scene ids
   it holds. A laboratory is listed inside the section whose material it
   exercises but takes a laboratory number rather than an ordinal, so the
   ordinals of the teaching scenes around it stay unbroken.

   A flat chapter lists its scenes under a single entry with no title. The
   artifact title scene is the cover and is deliberately absent: it takes no
   address. */
CONTENT.SECTIONS = {

  M0: [
    { n:'0', ids:['m0-signal','m0-system','m0-ctdt','m0-map','m0-howto'] }
  ],

  M1: [
    { n:'1.0', title:'Opening',                                   ids:['m1-open'] },
    { n:'1.1', title:'Definitions and notation',                  ids:['m1-def'] },
    { n:'1.2', title:'Energy and power',                           ids:[
        'm1-power','m1-energy-inf','m1-avgpower','m1-classify','m1-classify-b',
        'm1-ex-energy','m1-lab-b'] },
    { n:'1.3', title:'Transformations of the independent variable', ids:[
        'm1-shift','m1-reverse-scale','m1-combined','m1-lab-a'] },
    { n:'1.4', title:'Periodicity, even and odd',                  ids:['m1-periodic','m1-evenodd'] },
    { n:'1.5', title:'The impulse and the step',                   ids:[
        'm1-dt-impulse','m1-dt-sift','m1-ct-impulse'] },
    { n:'1.6', title:'Complex exponentials',                       ids:[
        'm1-ct-cexp','m1-ct-cexp-b','m1-dt-cexp','m1-dt-period','m1-lab-c'] },
    { n:'1.7', title:'Summary',                                    ids:['m1-synth'] }
  ],

  M2: [
    { n:'2.0', title:'Opening',                        ids:['m2-open'] },
    { n:'2.1', title:'The input–output abstraction', ids:['m2-abstraction'] },
    { n:'2.2', title:'The six properties',             ids:[
        'm2-memory','m2-invertible','m2-causal','m2-stable','m2-ti','m2-ti-b','m2-linear'] },
    { n:'2.3', title:'Classification in practice',     ids:['m2-workflow','m2-lab-d'] },
    { n:'2.4', title:'Summary',                        ids:['m2-synth'] }
  ],

  M3: [
    { n:'3.0', title:'Opening',                                          ids:['m3-open'] },
    { n:'3.1', title:'Impulse response and the representation property', ids:[
        'm3-impulse','m3-representation'] },
    { n:'3.2', title:'The convolution sum',                              ids:[
        'm3-convsum','m3-steps','m3-ex-dt1','m3-ex-dt1-b','m3-ex-dt2'] },
    { n:'3.3', title:'The convolution integral',                         ids:[
        'm3-convint','m3-ex-ct1','m3-ex-ct1-b','m3-ex-ct2','m3-lab-e'] },
    { n:'3.4', title:'Properties of convolution',                        ids:[
        'm3-props','m3-lti-props'] },
    { n:'3.5', title:'Summary',                                          ids:['m3-synth'] }
  ],

  M4: [
    { n:'4.0', title:'Opening',                                  ids:['m4-open'] },
    { n:'4.1', title:'The eigenfunction property',               ids:[
        'm4-eigen-ct','m4-eigen-dt','m4-eigen-why','m4-eigen-ex'] },
    { n:'4.2', title:'Synthesis and analysis',                   ids:[
        'm4-fs-exist','m4-fs-synth','m4-period','m4-period-ex','m4-fs-coef',
        'm4-fs-proof','m4-dc'] },
    { n:'4.3', title:'Series worked out',                        ids:[
        'm4-rect','m4-rect-sample','m4-howmany','m4-saw','m4-saw-b','m4-imptrain'] },
    { n:'4.4', title:'The discrete-time series',                 ids:[
        'm4-dtfs','m4-dtfs-ex','m4-dt-square','m4-dt-square-b','m4-dt-saw'] },
    { n:'4.5', title:'Properties',                               ids:[
        'm4-props-1','m4-props-2','m4-props-mult','m4-parseval'] },
    { n:'4.6', title:'A periodic input through an LTI system',   ids:[
        'm4-lti','m4-pairing','m4-lpf','m4-hpf','m4-dt-filt','m4-dt-filt-b',
        'm4-lab-f','m4-lab-g'] }
  ],

  M5: [
    { n:'5.0', title:'Opening',                                  ids:['m5-open'] },
    { n:'5.1', title:'From series to transform',                 ids:[
        'm5-derive-1','m5-derive-2','m5-derive-3','m5-pair','m5-exist','m5-limit'] },
    { n:'5.2', title:'The standard pairs',                       ids:[
        'm5-ex-delta','m5-ex-expw','m5-ex-exp','m5-ex-exp-phase','m5-ex-twosided',
        'm5-rect-sinc','m5-rect-zeros','m5-sinc-rect','m5-inverse-rel','m5-bandlimit'] },
    { n:'5.3', title:'Periodic signals',                         ids:[
        'm5-periodic','m5-ex-square','m5-ex-sinus','m5-ex-sinus-b','m5-ex-imptrain'] },
    { n:'5.4', title:'Properties',                               ids:[
        'm5-props-1','m5-props-shift-ex','m5-props-freq','m5-props-conj','m5-props-diff',
        'm5-props-scale','m5-props-scale-ex','m5-duality','m5-duality-ex',
        'm5-parseval','m5-parseval-ex'] },
    { n:'5.5', title:'Convolution and multiplication',           ids:[
        'm5-conv','m5-conv-ex','m5-conv-lpf','m5-mult','m5-am','m5-am-sinc',
        'm5-am-overlap','m5-sinc2'] },
    { n:'5.6', title:'Property summary',                         ids:['m5-tables'] },
    { n:'5.7', title:'Systems from a differential equation',     ids:[
        'm5-diffeq','m5-diffeq-ex','m5-partial','m5-diffeq-b','m5-diffeq-b2','m5-lab-h'] }
  ],

  M6: [
    { n:'6.0', title:'Opening',                                  ids:['m6-open'] },
    { n:'6.1', title:'Building the transform',                   ids:[
        'm6-derive','m6-dtfs-link','m6-limit','m6-pair','m6-periodic'] },
    { n:'6.2', title:'The standard pairs',                       ids:[
        'm6-ex-shift','m6-ex-anun','m6-ex-anun-b','m6-ex-absn','m6-ex-rect',
        'm6-ex-rect-b','m6-real-phase','m6-ex-lpf'] },
    { n:'6.3', title:'Periodic sequences',                       ids:[
        'm6-cexp','m6-dt-periodic','m6-sqwave','m6-ex-imptrain','m6-ex-cos','m6-ex-cos-b'] },
    { n:'6.4', title:'Properties',                               ids:[
        'm6-props-1','m6-props-2','m6-expansion','m6-expansion-b','m6-props-3','m6-parseval'] },
    { n:'6.5', title:'Convolution and multiplication',           ids:[
        'm6-conv','m6-conv-ex','m6-conv-lpf','m6-conv-lpf-b','m6-mult','m6-mult-b','m6-mult-ex'] },
    { n:'6.6', title:'Property summary and duality',             ids:['m6-tables','m6-duality'] },
    { n:'6.7', title:'Difference equations',                     ids:[
        'm6-freqresp','m6-ex-diff','m6-ex-pair','m6-ex-diff-b','m6-lab-i'] }
  ],

  M7: [
    { n:'7.0', title:'Opening',                                  ids:['m7-open'] },
    { n:'7.1', title:'The sampler and the sampled spectrum',     ids:[
        'm7-sampler','m7-rates','m7-freq','m7-replicas','m7-three'] },
    { n:'7.2', title:'Aliasing and the sampling theorem',        ids:[
        'm7-aliasing','m7-theorem','m7-boundary','m7-ex-rates','m7-ex-73a',
        'm7-ex-73b','m7-ex-73c'] },
    { n:'7.3', title:'Reconstruction',                           ids:[
        'm7-recon','m7-interp','m7-zoh','m7-foh','m7-perfect'] },
    { n:'7.4', title:'Aliasing in practice',                     ids:[
        'm7-alias-cos','m7-ex-alias','m7-hw-alias','m7-antialias','m7-temporal',
        'm7-spatial','m7-lab-j'] }
  ],

  Synthesis: [
    { n:'A', ids:['end-synth','end-map','end-conventions'] }
  ]
};

/* ---- textbook anchors --------------------------------------------------
   Scene id to the textbook section that develops the same material. A scene
   resting on two places names both. A scene with no counterpart — the course
   opening, the concept map, the closing material — is simply absent from this
   table and renders no anchor. */
CONTENT.BOOK = {
  'm0-signal':'1.1', 'm0-system':'1.5', 'm0-ctdt':'1.1.1',

  'm1-def':'1.1.1',
  'm1-power':'1.1.2', 'm1-energy-inf':'1.1.2', 'm1-avgpower':'1.1.2',
  'm1-classify':'1.1.2', 'm1-classify-b':'1.1.2', 'm1-ex-energy':'1.1.2',
  'm1-lab-b':'1.1.2',
  'm1-shift':'1.2.1', 'm1-reverse-scale':'1.2.1', 'm1-combined':'1.2.1',
  'm1-lab-a':'1.2.1',
  'm1-periodic':'1.2.2', 'm1-evenodd':'1.2.3',
  'm1-dt-impulse':'1.4.1', 'm1-dt-sift':'1.4.1', 'm1-ct-impulse':'1.4.2',
  'm1-ct-cexp':'1.3.1', 'm1-ct-cexp-b':'1.3.1', 'm1-dt-cexp':'1.3.2',
  'm1-dt-period':'1.3.3', 'm1-lab-c':'1.3.3',
  'm1-synth':'1.7',

  'm2-abstraction':'1.5.1',
  'm2-memory':'1.6.1', 'm2-invertible':'1.6.2', 'm2-causal':'1.6.3',
  'm2-stable':'1.6.4', 'm2-ti':'1.6.5', 'm2-ti-b':'1.6.5', 'm2-linear':'1.6.6',
  'm2-workflow':'1.6', 'm2-lab-d':'1.6',
  'm2-synth':'1.7',

  'm3-impulse':'2.1.1', 'm3-representation':'2.1.1',
  'm3-convsum':'2.1.2', 'm3-steps':'2.1.2', 'm3-ex-dt1':'2.1.2',
  'm3-ex-dt1-b':'2.1.2', 'm3-ex-dt2':'2.1.2',
  'm3-convint':'2.2.2', 'm3-ex-ct1':'2.2.2', 'm3-ex-ct1-b':'2.2.2',
  'm3-ex-ct2':'2.2.2', 'm3-lab-e':'2.2',
  'm3-props':'2.3', 'm3-lti-props':'2.3',
  'm3-synth':'2.6',

  'm4-eigen-ct':'3.2', 'm4-eigen-dt':'3.2', 'm4-eigen-why':'3.2', 'm4-eigen-ex':'3.2',
  'm4-fs-exist':'3.4', 'm4-fs-synth':'3.3.1', 'm4-period':'3.3.1',
  'm4-period-ex':'3.3.1', 'm4-fs-coef':'3.3.2', 'm4-fs-proof':'3.3.2', 'm4-dc':'3.3.2',
  'm4-rect':'3.3.2', 'm4-rect-sample':'3.3.2', 'm4-howmany':'3.4',
  'm4-saw':'3.3.2', 'm4-saw-b':'3.3.2', 'm4-imptrain':'3.3.2',
  'm4-dtfs':'3.6.1', 'm4-dtfs-ex':'3.6.2', 'm4-dt-square':'3.6.2',
  'm4-dt-square-b':'3.6.2', 'm4-dt-saw':'3.6.2',
  'm4-props-1':'3.5, 3.7', 'm4-props-2':'3.5, 3.7',
  'm4-props-mult':'3.5.5, 3.7.1', 'm4-parseval':'3.5.7, 3.7.3',
  'm4-lti':'3.8', 'm4-pairing':'3.8', 'm4-lpf':'3.9.2', 'm4-hpf':'3.10.2',
  'm4-dt-filt':'3.11.1', 'm4-dt-filt-b':'3.11.1',
  'm4-lab-f':'3.4', 'm4-lab-g':'3.9',

  'm5-derive-1':'4.1.1', 'm5-derive-2':'4.1.1', 'm5-derive-3':'4.1.1',
  'm5-pair':'4.1.1', 'm5-exist':'4.1.2', 'm5-limit':'4.2',
  'm5-ex-delta':'4.1.3', 'm5-ex-expw':'4.2', 'm5-ex-exp':'4.1.3',
  'm5-ex-exp-phase':'4.1.3', 'm5-ex-twosided':'4.1.3', 'm5-rect-sinc':'4.1.3',
  'm5-rect-zeros':'4.1.3', 'm5-sinc-rect':'4.1.3', 'm5-inverse-rel':'4.3.5',
  'm5-bandlimit':'4.1.3',
  'm5-periodic':'4.2', 'm5-ex-square':'4.2', 'm5-ex-sinus':'4.2',
  'm5-ex-sinus-b':'4.2', 'm5-ex-imptrain':'4.2',
  'm5-props-1':'4.3.1, 4.3.2', 'm5-props-shift-ex':'4.3.2', 'm5-props-freq':'4.3.2',
  'm5-props-conj':'4.3.3', 'm5-props-diff':'4.3.4', 'm5-props-scale':'4.3.5',
  'm5-props-scale-ex':'4.3.5', 'm5-duality':'4.3.6', 'm5-duality-ex':'4.3.6',
  'm5-parseval':'4.3.7', 'm5-parseval-ex':'4.3.7',
  'm5-conv':'4.4', 'm5-conv-ex':'4.4.1', 'm5-conv-lpf':'4.4.1', 'm5-mult':'4.5',
  'm5-am':'4.5.1', 'm5-am-sinc':'4.5.1', 'm5-am-overlap':'4.5.1', 'm5-sinc2':'4.4.1',
  'm5-tables':'4.6',
  'm5-diffeq':'4.7', 'm5-diffeq-ex':'4.7', 'm5-partial':'4.7',
  'm5-diffeq-b':'4.7', 'm5-diffeq-b2':'4.7', 'm5-lab-h':'4.3.5',

  'm6-derive':'5.1.1', 'm6-dtfs-link':'5.1.1', 'm6-limit':'5.1.1',
  'm6-pair':'5.1.1', 'm6-periodic':'5.3.1',
  'm6-ex-shift':'5.1.2', 'm6-ex-anun':'5.1.2', 'm6-ex-anun-b':'5.1.2',
  'm6-ex-absn':'5.1.2', 'm6-ex-rect':'5.1.2', 'm6-ex-rect-b':'5.1.2',
  'm6-real-phase':'5.3.4', 'm6-ex-lpf':'5.1.3',
  'm6-cexp':'5.2', 'm6-dt-periodic':'5.2', 'm6-sqwave':'5.2',
  'm6-ex-imptrain':'5.2', 'm6-ex-cos':'5.2', 'm6-ex-cos-b':'5.2',
  'm6-props-1':'5.3.3', 'm6-props-2':'5.3.4', 'm6-expansion':'5.3.7',
  'm6-expansion-b':'5.3.7', 'm6-props-3':'5.3.5', 'm6-parseval':'5.3.9',
  'm6-conv':'5.4', 'm6-conv-ex':'5.4.1', 'm6-conv-lpf':'5.4.1',
  'm6-conv-lpf-b':'5.4.1', 'm6-mult':'5.5', 'm6-mult-b':'5.5', 'm6-mult-ex':'5.5',
  'm6-tables':'5.6', 'm6-duality':'5.7',
  'm6-freqresp':'5.8', 'm6-ex-diff':'5.8', 'm6-ex-pair':'5.8',
  'm6-ex-diff-b':'5.8', 'm6-lab-i':'5.3.1',

  'm7-sampler':'7.1.1', 'm7-rates':'7.1', 'm7-freq':'7.1.1',
  'm7-replicas':'7.1.1', 'm7-three':'7.1.1',
  'm7-aliasing':'7.3', 'm7-theorem':'7.1', 'm7-boundary':'7.1',
  'm7-ex-rates':'7.1', 'm7-ex-73a':'7.1', 'm7-ex-73b':'7.1', 'm7-ex-73c':'7.1',
  'm7-recon':'7.2', 'm7-interp':'7.2', 'm7-zoh':'7.1.2', 'm7-foh':'7.2',
  'm7-perfect':'7.2',
  'm7-alias-cos':'7.3', 'm7-ex-alias':'7.3', 'm7-hw-alias':'7.3',
  'm7-antialias':'7.3', 'm7-temporal':'7.3', 'm7-spatial':'7.3', 'm7-lab-j':'7.3'
};

/* ---- derivation --------------------------------------------------------
   Hangs `sec` and `book` on every scene object, and returns the chapter view
   the contents surfaces render from. Addresses are computed rather than
   written down twice, so a section that gains a scene renumbers by itself and
   cannot drift out of step with the declaration.

   Three id shapes take a space of their own rather than an ordinal, because
   they are not teaching scenes: a laboratory (`*-lab-*`) takes `L`, and the
   two question scenes of a module take `Q1` and `Q2`. Each counts from 1
   within its chapter. */
window.applyNumbering = function(scenes){
  const byId = {};
  scenes.forEach(s=>{ byId[s.id] = s; });

  return CONTENT.CHAPTERS.map(ch=>{
    const secs = CONTENT.SECTIONS[ch.module] || [];
    let labN = 0;
    const out = { n:ch.n, title:ch.title, module:ch.module, flat:!!ch.flat, sections:[] };

    /* The question scenes bracket the chapter: the taxonomy is read before the
       teaching scenes and the questions are worked after them. They are listed
       where they occur, so they are collected from the scene array rather than
       from the declaration. */
    const q = { map:byId[ch.module.toLowerCase()+'-drill-map'],
                drill:byId[ch.module.toLowerCase()+'-drill'] };
    if(q.map)   q.map.sec   = ch.n+'.Q1';
    if(q.drill) q.drill.sec = ch.n+'.Q2';

    secs.forEach(sec=>{
      const entries = [];
      let ord = 0;
      sec.ids.forEach(id=>{
        const s = byId[id];
        if(!s){ console.error('numbering: no scene with id '+id); return; }
        s.sec  = /-lab-/.test(id) ? ch.n+'.L'+(++labN)
               : ch.flat          ? ch.n+'.'+(++ord)
               :                    sec.n+'.'+(++ord);
        s.book = CONTENT.BOOK[id];
        entries.push(s);
      });
      out.sections.push({ n:sec.n, title:sec.title, scenes:entries });
    });

    out.q = q;
    return out;
  });
};

})();
