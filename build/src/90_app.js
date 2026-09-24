/* ==========================================================================
   Renderer — turns declarative content blocks into the learning canvas.
   Content (what is taught) lives in CONTENT.*; this file owns only how it looks
   and behaves.
   ========================================================================== */
const RENDER = (() => {
  const S = APP.state;

  /* ---------- math ---------- */
  const texOpts = { throwOnError:false, strict:false, output:'html',
    macros:{ '\\d':'\\mathrm{d}', '\\Ev':'\\mathcal{E}\\mathrm{v}', '\\Od':'\\mathcal{O}\\mathrm{dd}' } };
  /* Mathematics that does not parse is reported to the console before it falls
     back, so that a broken formula fails qa.js instead of sitting in the page. */
  function tex(s, display){
    const o = Object.assign({displayMode:!!display}, texOpts);
    try{ return katex.renderToString(s, Object.assign({}, o, {throwOnError:true})); }
    catch(e){
      console.error('APP: mathematics is not valid TeX: ' + s + ' — ' + e.message);
      try{ return katex.renderToString(s, o); }
      catch(e2){ return '<code>'+s+'</code>'; }
    }
  }
  /* inline $...$ inside prose */
  function md(t){
    if(t==null) return '';
    return String(t).replace(/\$\$([^$]+)\$\$/g, (m,a)=>tex(a,true))
                    .replace(/\$([^$]+)\$/g, (m,a)=>tex(a,false));
  }

  /* ---------- glossary symbol linking ---------- */
  /* A title attribute carries no typesetting, so the hover text is the glossary
     description reduced to the characters KaTeX would have drawn. Without this
     the tooltip would show the TeX source it is now written in. */
  const SYMTITLE = {};
  function symTitle(k){
    if(SYMTITLE[k]==null){
      const d = document.createElement('div');
      d.innerHTML = md((CONTENT.GLOSS[k]||{}).d||'');
      SYMTITLE[k] = d.textContent.replace(/\s+/g,' ').trim().replace(/"/g,'&quot;');
    }
    return SYMTITLE[k];
  }
  function symLinks(html){
    return html.replace(/\{\{sym:([a-zA-Z0-9_]+)\|([^}]+)\}\}/g,
      (m,k,label)=>`<span class="sym" data-sym="${k}" title="${symTitle(k)}">${label}</span>`);
  }

  /* ---------- recall deck ----------
     A module summary as a set of prompts. Each card shows a question; the
     reader recalls the answer first and then opens the card to check it. The
     question and the answer share one grid cell, so the card keeps the height
     of the longer face and opening it never moves the slide. A scene uses it
     through a raw block, `{t:'raw', html:()=>RECALL.deck(id, cards)}`, so the
     block schema does not change. Opened cards are remembered for the session
     only, which lets a reveal step redraw the scene without closing them. */
  const RECALLED = new Set();
  function recallDeck(id, cards, opt={}){
    const n = cards.length;
    const open = cards.filter((c,i)=>RECALLED.has(id+':'+i)).length;
    return `<div class="recall" data-recall="${id}" data-n="${n}">
      <div class="recall-bar"><span class="recall-count">Recalled <b>${open}</b> of ${n}</span>
        <button class="recall-all" type="button" data-recall-all="${id}">${open===n?'Hide all':'Show all'}</button></div>
      <ol class="recall-list" style="--rc-cols:${opt.cols||1}">${cards.map((c,i)=>{
        const on = RECALLED.has(id+':'+i);
        return `<li><button class="recall-card${on?' is-open':''}" type="button"
            data-recall-card="${id}:${i}" aria-expanded="${on}">
          <span class="rc-num">${i+1}</span>
          <span class="rc-faces">
            <span class="rc-face rc-q">${c.tag?`<span class="rc-tag">${md(c.tag)}</span>`:''}${symLinks(md(c.q))}</span>
            <span class="rc-face rc-a">${symLinks(md(c.a))}</span>
          </span>
          ${c.glyph?`<span class="rc-glyph" aria-hidden="true">${c.glyph}</span>`:''}
        </button></li>`; }).join('')}</ol></div>`;
  }
  function recallSync(deck){
    const cards = deck.querySelectorAll('[data-recall-card]');
    const open = deck.querySelectorAll('.recall-card.is-open').length;
    deck.querySelector('.recall-count b').textContent = open;
    deck.querySelector('[data-recall-all]').textContent = open===cards.length?'Hide all':'Show all';
  }
  function recallSet(card, on){
    card.classList.toggle('is-open', on);
    card.setAttribute('aria-expanded', String(on));
    if(on) RECALLED.add(card.dataset.recallCard); else RECALLED.delete(card.dataset.recallCard);
  }
  window.RECALL = { deck: recallDeck };

  /* ---------- project deck ----------
     Optional projects at the end of a module: a list of cards on the left and,
     on the right, the brief of the chosen one. All briefs share one grid cell,
     so the panel keeps the height of the longest and a choice moves nothing.
     `{t:'raw', html:()=>PROJECTS.deck(id, items)}` with
     items = [{title, glyph?, aim, learn:[], steps:[], look}]. The choice lasts
     for the session only. */
  const PROJ_ON = {};
  function projectDeck(id, items){
    const on = PROJ_ON[id]||0;
    const list = items.map((p,i)=>`<li><button class="recall-card proj-card${i===on?' is-open':''}" type="button"
        data-proj="${id}:${i}" aria-pressed="${i===on}">
      <span class="rc-num">${i+1}</span><span class="rc-q">${md(p.title)}</span>
      ${p.glyph?`<span class="rc-glyph" aria-hidden="true">${p.glyph}</span>`:''}</button></li>`).join('');
    const briefs = items.map((p,i)=>`<div class="proj-brief${i===on?' is-on':''}" data-proj-brief="${i}">
      <section class="proj-sec proj-sec-aim"><p class="proj-h hi hi-aim">Aim</p><p class="proj-aim">${md(p.aim)}</p></section>
      <section class="proj-sec"><p class="proj-h hi hi-practise">You will practise</p><ul class="proj-learn">${p.learn.map(s=>`<li>${md(s)}</li>`).join('')}</ul></section>
      <section class="proj-sec"><p class="proj-h hi hi-steps">Steps</p><ol class="proj-steps">${p.steps.map(s=>`<li>${md(s)}</li>`).join('')}</ol></section>
      <section class="proj-sec"><p class="proj-h hi hi-look">What to look for</p><p class="proj-look">${md(p.look)}</p></section></div>`).join('');
    return `<div class="proj" data-proj-deck="${id}">
      <div class="proj-left"><div class="recall-bar"><span>${items.length} projects · MATLAB or Python</span><span>Nothing to hand in</span></div>
        <ol class="recall-list" style="--rc-cols:1">${list}</ol></div>
      <div class="proj-right">${briefs}</div></div>`;
  }
  function projectPick(card){
    const [id,i] = card.dataset.proj.split(':'), deck = card.closest('.proj');
    PROJ_ON[id] = +i;
    deck.querySelectorAll('[data-proj]').forEach((c,k)=>{
      c.classList.toggle('is-open', k===+i); c.setAttribute('aria-pressed', String(k===+i)); });
    deck.querySelectorAll('[data-proj-brief]').forEach((b,k)=>b.classList.toggle('is-on', k===+i));
  }
  window.PROJECTS = { deck: projectDeck };

  function mountCourseMap(host){
    const panel=host.querySelector('[data-course-map-panel]');
    const path=CONTENT.COURSE_PATH;
    if(!panel || !path) return;
    const byId=Object.fromEntries(path.map((n,i)=>[n.m,Object.assign({i},n)]));
    const pick=id=>{
      const n=byId[id]; if(!n) return;
      host.querySelectorAll('[data-course-node]').forEach(el=>{
        const on=el.dataset.courseNode===id;
        el.classList.toggle('is-active',on);
        el.setAttribute('aria-pressed',String(on));
      });
      panel.querySelector('.course-map-kicker').innerHTML=`THE LEARNING PATH <span>${String(n.i+1).padStart(2,'0')} / ${String(path.length).padStart(2,'0')}</span>`;
      panel.querySelector('h3').textContent=n.t;
      panel.querySelector('.course-map-topic').textContent=n.s;
      panel.querySelector('.course-map-copy').innerHTML=`<p><b>Uses.</b> ${n.dep}</p><p><b>Adds.</b> ${n.add}</p><p><b>Leads to.</b> ${n.next}</p>`;
    };
    host.querySelectorAll('[data-course-node]').forEach(el=>{
      el.addEventListener('click',()=>pick(el.dataset.courseNode));
      el.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(el.dataset.courseNode); }
      });
    });
  }

  /* ---------- title icons ----------
     A scene that is not a teaching slide carries a small drawn icon at the
     left of its title, so its kind reads at a glance: a laboratory, a code
     page, an "… Around Us" gallery, the practice questions, the quick check.
     The kind is read from the scene id, so a new scene of that shape takes
     its icon with no field of its own. One stroke set, 24-unit grid. */
  const TITLE_ICONS = [
    [/-lab-/,  'Laboratory', 'M9.5 3.5h5M10.5 3.5v5.2L5.2 17.6a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3l-5.3-8.9V3.5M7.6 14.5h8.8'],
    [/-code-/, 'Code', 'M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14'],
    [/-real-|^m0-examples$/, 'Around us', 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17zM3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5S9.6 5.9 12 3.5z'],
    [/-drill$/, 'Practice', 'M14.5 5.5l4 4L9 19H5v-4zM12.5 7.5l4 4'],
    [/-quick$/, 'Quick check', 'M13 3 5 13.5h6L10 21l8-10.5h-6z']
  ];
  let TITLE_ICON = '';
  function titleIcon(id){
    const hit = TITLE_ICONS.find(([re])=>re.test(id||''));
    return hit ? `<span class="t-icon" title="${hit[1]}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="${hit[2]}"/></svg></span>` : '';
  }

  /* ---------- block renderers ---------- */
  const B = {
    eyebrow: b => `<p class="eyebrow"><span class="tick"></span>${md(b.text)}
        ${b.src?`<span class="src instr-inline" data-instr>[ref ${b.src}]</span>`:''}</p>`,
    title:   b => `<h${b.level||2} class="${b.level===1?'display':'title'}">${b.level===1?'':TITLE_ICON}${md(b.text)}</h${b.level||2}>`,
    sub:     b => `<h3 class="sub">${md(b.text)}</h3>`,
    lede:    b => `<p class="lede">${md(b.text)}</p>`,
    body:    b => `<div class="body ${b.cls||''}">${symLinks(md(b.html))}</div>`,
    small:   b => `<div class="small">${symLinks(md(b.html))}</div>`,
    rule:    b => `<hr class="rule ${b.short?'short':''}">`,
    eq:      b => `<div class="eq ${b.plain?'plain':''} ${b.key?'key':''} ${b.result?'result':''} ${b.side?'side':''} ${b.size||''}">
        ${b.label?`<div class="eq-label">${md(b.label)}</div>`:''}
        ${tex(b.tex,true)}
        ${b.note?`<div class="eq-note">${symLinks(md(b.note))}</div>`:''}</div>`,
    note:    b => `<div class="note ${b.kind||'def'}${b.ask?' ask':''}">${b.head?`<span class="note-h">${md(b.head)}</span>`:''}
        ${b.ask?askBody(b.html):symLinks(md(b.html))}${b.ask?askHTML(b.ask):''}</div>`,
    /* A legend is drawn inside the plot it keys, as a small card in a corner
       (`at`: 'tr' by default, 'tl', or 'tl-axis' for a plot whose vertical
       axis is its left edge). A third item entry marks a dashed trace. blocks() hands the legend that follows a
       fig to that fig, so the scene data keeps writing it as its own block. */
    legend:  b => `<div class="legend in-plot lg-at-${b.at||'tr'}">${b.items.map(([c,l,dash])=>`<i class="lg-${c}${dash?' lg-dash':''}">${md(l)}</i>`).join('')}</div>`,
    wex:     b => `<div class="wex">${b.rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${md(k)}</div><div class="wex-v">${symLinks(md(v))}</div></div>`).join('')}</div>`,
    fig:     (b, lg) => `<figure class="fig ${b.frame?'fig-frame':''}${
          b.sketch?' sketch'+(b.sketch.shown?' sk-shown':''):''}"${
          b.grow && typeof b.svg==='function' ? ` data-grow="${GROW.push(b)-1}"` : ''}${
          b.live||b.listen||b.sketch||b.frames ? ` data-fx="${FX.push(b)-1}"` : ''}>
        ${figSvg(b)}${lg ? B.legend(lg) : ''}
        ${b.live||b.listen||b.sketch||b.frames?`<div class="fxbar">${b.frames?framesHTML(b):''}${b.live?liveHTML(b):''}${b.listen?listenHTML(b):''}${b.sketch?sketchHTML(b):''}</div>`:''}
        ${b.caption?`<figcaption>${md(b.caption)}</figcaption>`:''}</figure>`,
    /* The column count is written inline because it is content, not style. The
       class is what lets the phone layout collapse the block to one column:
       a stylesheet rule can only beat an inline declaration if it has something
       to select. */
    grid:    b => `<div class="gblk" style="display:grid;grid-template-columns:repeat(${b.cols||2},minmax(0,1fr));gap:${b.gap||'28px'};${b.style||''}">
        ${b.items.map(it=>`<div class="gcell">${blocks(it)}</div>`).join('')}</div>`,
    cols:    b => `<div class="cols ${b.ratio||'c-6-6'}${b.fill?' fill':''}" style="${b.style||''}">
        <div class="col ${b.vcenter?'center':''}">${blocks(b.left)}</div>
        <div class="col ${b.vcenter?'center':''}">${blocks(b.right)}</div></div>`,
    stack:   b => `<div class="stack" style="${b.style||''}">${blocks(b.items)}</div>`,
    card:    b => `<div class="card">${b.head?`<h3 class="card-h">${md(b.head)}</h3>`:''}
        ${blocks(b.items)}</div>`,
    instr:   b => `<div class="instr"><div class="instr-panel">
        <span class="note-h">${md(b.head||'Instructor note')}</span>${symLinks(md(b.html))}</div></div>`,
    lab:     b => `<div class="lab" data-lab="${b.id}"></div>`,
    /* A module's practice questions. One question fills the screen, because a
       question of this kind carries a statement, a figure, several lettered parts and
       a full worked solution, and that is already more than the fixed stage
       holds. The reader moves between questions with the pager; the question
       body scrolls vertically inside the stage, and fitScene() leaves a scene
       containing .dr-page unscaled for that reason. */
    drill:   b => { const qs=(CONTENT.DRILL||[]).filter(q=>q.module===b.module);
        if(!qs.length) return '';
        const i = Math.min(Math.max(S.drillPage[b.module]|0, 0), qs.length-1);
        const seen = qs.filter(q=>(S.quiz[q.id]||{}).revealed).length;
        return `<div class="dr-pager">
          <button class="btn" data-drill="${b.module}" data-step="-1"${i===0?' disabled':''}>&larr; Previous</button>
          <label class="dr-count">Question <input class="dr-n" type="number" inputmode="numeric"
            min="1" max="${qs.length}" value="${i+1}" data-drill-go="${b.module}"
            aria-label="Go to question number"> <span class="dr-of">of</span> ${qs.length}</label>
          <button class="btn" data-drill="${b.module}" data-step="1"${i===qs.length-1?' disabled':''}>Next &rarr;</button>
          <span class="dr-seen">${seen?`Solutions opened: ${seen} of ${qs.length} on this device.`
                                     :'No solution has been opened on this device yet.'}</span>
        </div>
        <div class="dr-page">${drillHTML(qs[i])}</div>`; },
    /* a raw block may carry a function instead of a string, exactly as fig does,
       so a figure built in JavaScript is generated per render and picks up the
       palette of the theme in force */
    raw:     b => typeof b.html === 'function' ? b.html() : b.html
  };

  /* Figures a slide may grow into its column's spare height. The renderer fills
     this as it draws; `fitScene` reads it back to call svg() again at a taller
     height. It is rebuilt on every render, so an index never outlives its DOM. */
  let GROW = [];

  /* ---------- interaction on a slide ----------
     Three additions to existing blocks, none of them a block of its own:
     a card may ask the reader to predict (`note.ask`), a figure may carry
     sliders that redraw it (`fig.live`), and a figure may play the signal it
     shows (`fig.listen`). Every text field goes through md(). */

  /* Figures with sliders or sounds, indexed like GROW and rebuilt per render. */
  let FX = [];

  /* A live figure's svg() takes the current slider values. The values live on
     the block itself, so they survive a redraw of the scene and a theme change. */
  function liveVals(b){
    if(!b.live) return undefined;
    if(!b.live.v){ b.live.v = {}; b.live.controls.forEach(c=>{ b.live.v[c.k] = c.v; }); }
    return b.live.v;
  }
  function figSvg(b){ const s = typeof b.svg==='function' ? b.svg(b.frames ? {frame:b.frames.t!=null ? b.frames.t : b.frames.i|0} : liveVals(b)) : b.svg;
    return b.sketch ? sketchInk(s, b.sketch) : s; }
  function liveVal(c, v){ return md(c.show ? c.show(v) : '$'+v+'$'); }
  function liveHTML(b){
    const v = liveVals(b);
    return b.live.controls.map(c=>`<label class="live-ctrl">
        <span class="live-k">${md(c.label)}</span>
        <input type="range" data-live="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${v[c.k]}">
        <span class="live-v" data-live-v="${c.k}">${liveVal(c, v[c.k])}</span></label>`).join('');
  }
  /* A figure played frame by frame (`fig.frames` {labels}). Previous and
     Next step through the frames; svg() takes {frame}. The frame lives on
     the block, so it survives a redraw of the scene. Between two frames the
     figure plays the change: svg() is called with a fractional frame that
     runs from the old index to the new one, so a figure written for a
     continuous frame animates and one that tests `frame>=k` simply switches.
     Reduced motion jumps straight to the new frame. */
  function frameTween(fig, b, from, to){
    const f = b.frames;
    if(f.raf) cancelAnimationFrame(f.raf);
    if(S.motion==='reduced' || from===to){ f.t = null; redrawLive(fig); return; }
    const ms = (f.ms || 900) * Math.min(Math.abs(to-from), 1.6), t0 = performance.now();
    const tick = now => {
      const u = Math.min((now-t0)/ms, 1), e = u<.5 ? 2*u*u : 1-Math.pow(-2*u+2,2)/2;
      f.t = u<1 ? from+(to-from)*e : null;
      if(!fig.isConnected){ f.t = null; f.raf = 0; return; }
      redrawLive(fig);
      f.raf = u<1 ? requestAnimationFrame(tick) : 0;
    };
    f.raf = requestAnimationFrame(tick);
  }
  function frameVal(b){ const f=b.frames, i=f.i|0;
    const n=f.labels.length, pad=k=>String(k).padStart(2,'0');
    return `<span class="frame-n"><b>${pad(i+1)}</b> / ${pad(n)}</span>
      <span class="frame-pips" aria-hidden="true">${f.labels.map((_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')}</span>
      <span class="frame-l">${md(f.labels[i])}</span>`; }
  function framesHTML(b){ const i=b.frames.i|0, n=b.frames.labels.length;
    return `<button type="button" class="listen-btn frame-btn" data-frame="-1"${i<=0?' disabled':''}>Previous</button>
      <button type="button" class="listen-btn frame-btn" data-frame="1"${i>=n-1?' disabled':''}>Next</button>
      <span class="frame-v" data-frame-v>${frameVal(b)}</span>`; }
  function listenHTML(b){
    return b.listen.items.map((it,i)=>
        `<button type="button" class="listen-btn" data-listen="${i}">${md(it.label)}</button>`).join('');
  }

  /* A sketch on a figure (`fig.sketch`). The reader draws the answer on the
     axes before seeing it. The figure marks its data area with a `.sk-area`
     rect and its answer with a `.sk-key` group, which stays in the markup and
     is only made visible, so the gates and print see the complete figure.
     Strokes are kept as fractions of the data area on the block, so they
     survive a grown or redrawn figure; they are not stored. */
  function skArea(el){
    const r = el.querySelector('.sk-area');
    return r && ['x','y','width','height'].map(k=>+r.getAttribute(k));
  }
  function skPath(st, [x,y,w,h]){
    return 'M'+st.map(p=>(x+p[0]*w).toFixed(1)+','+(y+p[1]*h).toFixed(1)).join('L');
  }
  function sketchInk(markup, sk){
    if(!sk.ink || !sk.ink.length || !markup) return markup;
    const m = markup.match(/class="sk-area" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
    if(!m) return markup;
    const area = m.slice(1).map(Number);
    /* under the answer, so a shown answer is read against the sketch */
    return markup.replace('<g class="sk-key">', sk.ink.map(st=>`<path class="sk-ink" d="${skPath(st, area)}"/>`).join('')+'<g class="sk-key">');
  }
  function sketchHTML(b){
    return `<span class="live-k sk-hint">${md(b.sketch.label||'Sketch the answer on the axes.')}</span>
      <button type="button" class="sk-btn" data-sk="show" aria-pressed="${!!b.sketch.shown}">${b.sketch.shown?'Hide the answer':'Show the answer'}</button>
      <button type="button" class="sk-btn" data-sk="clear">Clear</button>`;
  }

  /* ---------- code: programs in MATLAB and Python ----------
     The programs live in build/src/7?_code_m*.js, one entry a program. Each
     section closes with a code page (a scene `*-code-*`) that pages through
     its programs one at a time, as the practice questions do. `title`,
     `what` and `try` go through md(); the code is plain text. The chosen language is kept on the device; the program on show,
     the reader's edits and the last output last for the session. */
  /* the code files load after this one, so the library is gathered on first use */
  const CODE_LIB = {}, CODE_BANKS = {};
  function codeLoad(){
    if(codeLoad.done) return; codeLoad.done = true;
    if(typeof CODE_M1!=='undefined') Object.assign(CODE_LIB, CODE_M1);
    if(typeof CODE_BANKS_M1!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M1);
    if(typeof CODE_M2!=='undefined') Object.assign(CODE_LIB, CODE_M2);
    if(typeof CODE_BANKS_M2!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M2);
    if(typeof CODE_M3!=='undefined') Object.assign(CODE_LIB, CODE_M3);
    if(typeof CODE_BANKS_M3!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M3);
    if(typeof CODE_M4!=='undefined') Object.assign(CODE_LIB, CODE_M4);
    if(typeof CODE_BANKS_M4!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M4);
    if(typeof CODE_M5!=='undefined') Object.assign(CODE_LIB, CODE_M5);
    if(typeof CODE_BANKS_M5!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M5);
    if(typeof CODE_M6!=='undefined') Object.assign(CODE_LIB, CODE_M6);
    if(typeof CODE_BANKS_M6!=='undefined') Object.assign(CODE_BANKS, CODE_BANKS_M6);
  }
  const CODE_LANGS = [['m','MATLAB'],['py','Python']];
  let codeLang = (()=>{ try{ return localStorage.getItem('ss-code-lang')==='py'?'py':'m'; }catch(e){ return 'm'; } })();
  const CODE_AT = {}, DRAFT = {}, OUTPUT = {};
  const escH = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  /* A small highlighter: comments, strings, keywords and numbers. The code
     avoids the MATLAB transpose, so an apostrophe opens a string. */
  const CODE_RE = {
    m:  /(%.*$)|('(?:[^'\n]|'')*'|"[^"\n]*")|\b(for|end|if|elseif|else|while|break|continue|function|return|switch|case|otherwise|try|catch)\b|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)/gm,
    py: /(#.*$)|((?:\b[rf]{1,2})?'[^'\n]*'|(?:\b[rf]{1,2})?"[^"\n]*")|\b(import|as|from|def|return|for|in|if|elif|else|while|break|continue|lambda|and|or|not|None|True|False|with)\b|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)/gm
  };
  function codeHL(src, lang){
    let out = '', i = 0;
    src.replace(CODE_RE[lang], (m, c, s, k, n, at)=>{
      out += escH(src.slice(i, at)) + `<span class="tk-${c?'c':s?'s':k?'k':'n'}">${escH(m)}</span>`;
      i = at + m.length; return m; });
    return (out + escH(src.slice(i))).split('\n').map(l=>`<span class="cl">${l}</span>`).join('\n');
  }

  /* Python can be run on a code page when the course is opened from its site:
     the runtime (Pyodide, CPython compiled to WebAssembly) is loaded from the
     site on the first press of Run, never before. The file opened on its own
     (file://) makes no request and offers Copy only. On localhost a test may
     point the runtime elsewhere with ?pyodide=<url>. */
  const PY_RUN = /^https?:$/.test(location.protocol);
  const PY_BASE = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      && new URLSearchParams(location.search).get('pyodide')) || new URL('pyodide/v0.29.3/', location.href).href;   /* web/pyodide.js places it there */
  const PY_PRELUDE = `import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, io, base64
plt.show = lambda *a, **k: None
def _ss_figs():
    out = []
    for n in plt.get_fignums():
        b = io.BytesIO()
        plt.figure(n).savefig(b, format='png', dpi=96, bbox_inches='tight')
        out.append(base64.b64encode(b.getvalue()).decode())
    plt.close('all')
    return out`;
  let PY = null;
  function pyLoad(){
    if(!PY){
      PY = new Promise((ok, no)=>{
        const s = document.createElement('script');
        s.src = PY_BASE + 'pyodide.js'; s.onload = ok;
        s.onerror = ()=>no(new Error('Python could not be loaded. Check the connection and press Run again.'));
        document.head.appendChild(s);
      }).then(()=>loadPyodide({ indexURL: PY_BASE }))
        .then(async py=>{ await py.loadPackage(['numpy','matplotlib'], { messageCallback(){} });
          await py.runPythonAsync(PY_PRELUDE); return py; });
      PY.catch(()=>{ PY = null; });
    }
    return PY;
  }
  async function codeRun(btn){
    const page = btn.closest('.cpage'), key = page.dataset.key;
    const box = page.querySelector('.cp-out');
    const src = DRAFT[key] != null ? DRAFT[key] : CODE_LIB[key].py, t0 = performance.now();
    btn.disabled = true;
    const first = !PY;
    box.innerHTML = `<div class="run-status">${first ? 'Loading Python. The first run takes a few seconds.' : 'Running.'}</div>`;
    const lines = [];
    try{
      const py = await pyLoad();
      if(first) box.querySelector('.run-status').textContent = 'Running.';
      py.setStdout({ batched: t=>lines.push(t) });
      py.setStderr({ batched: t=>lines.push(t) });
      let err = '';
      try{ await py.runPythonAsync(src, { globals: py.globals.get('dict')() }); }
      catch(e){ /* keep the traceback from the reader's own code on */
        const L = String(e.message||e).trim().split('\n'), i = L.findIndex(l=>/File "<exec>"/.test(l));
        err = (i>=0 ? L.slice(i) : L.slice(-2)).join('\n'); }
      const figs = py.runPython('_ss_figs()').toJs();
      const secs = ((performance.now()-t0)/1000).toFixed(1);
      OUTPUT[key] = `<div class="run-status">Output<span>${secs} s</span></div>
        ${lines.length?`<pre class="run-text">${escH(lines.join('\n'))}</pre>`:''}
        ${err?`<pre class="run-text run-err">${escH(err)}</pre>`:''}
        ${figs.map(f=>`<img class="run-fig" alt="The figure the program draws" src="data:image/png;base64,${f}">`).join('')}`;
      box.innerHTML = OUTPUT[key];
    }catch(e){
      box.innerHTML = `<pre class="run-text run-err">${escH(e.message||String(e))}</pre>`;
    }
    btn.disabled = false;
  }

  /* The Python code is editable when it can be run. A transparent textarea
     lies over the highlighted text, with the same font, padding and line
     height, so the reader types into the highlighted code. */
  function codeEditor(src){
    return `<div class="code-edit"><pre class="code" aria-hidden="true"><code>${codeHL(src, 'py')}\n</code></pre>
      <textarea wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Python code, editable">${escH(src)}</textarea></div>`;
  }
  /* A code page: the section's programs as numbered tabs, the code on the
     left, and on the right what it does, a task, and the output. The output
     box keeps its height before and after a run, so running moves nothing. */
  function codePage(bank){
    codeLoad();
    const keys = CODE_BANKS[bank] || [];
    const i = Math.min(CODE_AT[bank]|0, keys.length-1), key = keys[i], c = CODE_LIB[key];
    if(!c) return '';
    const run = codeLang==='py' && PY_RUN;
    const src = run && DRAFT[key] != null ? DRAFT[key] : c[codeLang];
    const out = run ? (OUTPUT[key] || `<div class="run-status">Output</div>
          <p class="run-idle">Press Run. The first run loads Python, which takes a few seconds.</p>`)
      : `<div class="run-status">It prints</div><pre class="run-text">${escH(c.out||'')}</pre>
          <p class="run-idle">${codeLang==='m'
            ? 'Paste it into the MATLAB command window, or save it as a <code>.m</code> file and run it. No toolbox is needed.'
            : 'Save it as a <code>.py</code> file and run it, or paste it into a notebook cell. It needs NumPy and Matplotlib.'}</p>`;
    return `<div class="cpage" data-cpage="${bank}" data-key="${key}">
      <div class="cp-nav" role="tablist" aria-label="Programs">${keys.map((k,j)=>
        `<button type="button" role="tab" class="cp-ex" data-cp-go="${j}" aria-selected="${j===i}"><span class="cp-n">${j+1}</span>${md(CODE_LIB[k].title)}</button>`).join('')}</div>
      <div class="cp-body">
        <div class="cp-code">
          <div class="code-bar">
            <div class="code-tabs" role="tablist" aria-label="Language">${CODE_LANGS.map(([k,l])=>
              `<button type="button" role="tab" class="code-tab" data-code-lang="${k}" aria-selected="${k===codeLang}">${l}</button>`).join('')}</div>
            <div class="code-acts">${run?`<button type="button" class="btn code-reset" data-code="reset">Reset</button>
              <button type="button" class="btn primary code-runbtn" data-code="run">Run</button>`:''}
              <button type="button" class="btn code-copy" data-code="copy">Copy</button></div>
          </div>
          ${run ? codeEditor(src) : `<pre class="code" tabindex="0"><code>${codeHL(src, codeLang)}</code></pre>`}
        </div>
        <div class="cp-side">
          <p class="cp-what">${md(c.what||'')}</p>
          ${c.try?`<div class="note warn"><span class="note-h">Try it</span>${md(c.try)}</div>`:''}
          <div class="cp-out${run?' is-run':''}" aria-live="polite">${out}</div>
        </div>
      </div></div>`;
  }
  window.CODEBANK = { page: codePage };
  function codeCopy(btn){
    const key = btn.closest('.cpage').dataset.key;
    const text = codeLang==='py' && DRAFT[key] != null ? DRAFT[key] : CODE_LIB[key][codeLang];
    const done = ok=>{ btn.textContent = ok ? 'Copied' : 'Select and copy';
      setTimeout(()=>{ btn.textContent = 'Copy'; }, 1600); };
    const fallback = ()=>{ const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try{ ok = document.execCommand('copy'); }catch(e){}
      ta.remove(); done(ok); };
    if(navigator.clipboard && window.isSecureContext)
      navigator.clipboard.writeText(text).then(()=>done(true), fallback);
    else fallback();
  }
  /* typing redraws the highlighted layer under the textarea */
  document.addEventListener('input', e=>{
    const ta = e.target.closest('.code-edit > textarea'); if(!ta) return;
    DRAFT[ta.closest('.cpage').dataset.key] = ta.value;
    ta.previousElementSibling.firstChild.innerHTML = codeHL(ta.value, 'py') + '\n';
  });
  document.addEventListener('scroll', e=>{
    const ta = e.target.closest && e.target.closest('.code-edit > textarea'); if(!ta) return;
    ta.previousElementSibling.scrollTop = ta.scrollTop; ta.previousElementSibling.scrollLeft = ta.scrollLeft;
  }, true);
  document.addEventListener('keydown', e=>{
    const ta = e.target.closest && e.target.closest('.code-edit > textarea'); if(!ta) return;
    e.stopPropagation();                               /* the slide keys stay out of the editor */
    if(e.key==='Enter' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); const r = ta.closest('.cpage').querySelector('.code-runbtn'); if(r && !r.disabled) codeRun(r); }
    else if(e.key==='Tab' && !e.shiftKey){ e.preventDefault(); document.execCommand('insertText', false, '    '); }
    else if(e.key==='Escape'){ ta.blur(); }
  }, true);

  /* A prediction. The reason line is laid out from the start and only made
     visible, so answering never moves anything on the slide. Answers are kept
     for the session and are not persisted. */
  const ASKED = {};
  /* The given line and the question of a prediction card are split at the
     card's hairline, so the question can be set as a prompt of its own. */
  function askBody(html){
    const [given, ...rest] = html.split('<div class="nsep"></div>');
    return rest.length ? `<div class="ask-given">${symLinks(md(given))}</div>`
      + `<div class="ask-prompt">${symLinks(md(rest.join('')))}</div>` : symLinks(md(html));
  }
  function askHTML(a){
    const got = ASKED[a.key];
    const done = got != null;
    return `<div class="ask-q">${a.q?md(a.q):''}</div>
      <div class="ask-row" role="group" data-ask="${a.key}">${a.choices.map((c,i)=>{
        const cls = !done ? '' : i===a.answer ? ' is-right' : i===got ? ' is-wrong' : ' is-dim';
        return `<button type="button" class="ask-opt${cls}" data-k="${i}"${done?' aria-disabled="true"':''}><span class="ask-k" aria-hidden="true">${'ABCD'[i]}</span>${md(c)}</button>`;
      }).join('')}</div>
      ${a.why?`<div class="ask-why"${done?'':' aria-hidden="true"'}><b>${done && got===a.answer ? 'Correct.'
        : 'The answer is '+md(a.choices[a.answer])+'.'}</b> ${md(a.why)}</div>`:''}`;
  }
  function findAsk(list, key){
    for(const b of list||[]){
      if(!b) continue;
      if(Array.isArray(b)){ const r = findAsk(b, key); if(r) return r; continue; }
      if(b.ask && b.ask.key===key) return b.ask;
      for(const k of [b.items, b.left, b.right]){ const r = Array.isArray(k) && findAsk(k, key); if(r) return r; }
    }
    return null;
  }

  /* Sound. The samples are computed from the same formula the figure uses and
     played once; a second press on the playing button stops it. Moving a
     slider of the figure while it plays restarts the sound with the new
     values. Nothing is fetched. The peak is set to one level so that loudness says nothing. */
  const AUDIO = (() => {
    let ctx = null, src = null, btn = null;
    function stop(){
      if(src){ try{ src.onended = null; src.stop(); }catch(e){} src = null; }
      if(btn){ btn.classList.remove('is-playing'); btn.setAttribute('aria-pressed','false'); btn = null; }
    }
    function play(spec, el){
      const again = btn === el;
      stop();
      if(again) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      ctx = ctx || new AC();
      if(ctx.state === 'suspended') ctx.resume();
      const sr = ctx.sampleRate, n = Math.max(1, Math.round(spec.dur*sr));
      const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
      let peak = 0;
      for(let i=0;i<n;i++){ const y = spec.f(i/sr); d[i] = y; if(Math.abs(y) > peak) peak = Math.abs(y); }
      const g = peak > 0 ? 0.5/peak : 0, ramp = Math.min(n>>1, Math.round(0.006*sr));
      for(let i=0;i<n;i++){
        const w = i < ramp ? i/ramp : i > n-1-ramp ? (n-1-i)/ramp : 1;
        d[i] *= g*w;
      }
      const s = ctx.createBufferSource();
      s.buffer = buf; s.connect(ctx.destination);
      s.onended = () => { if(src === s){ src = null; stop(); } };
      s.start();
      src = s; btn = el;
      el.classList.add('is-playing'); el.setAttribute('aria-pressed','true');
    }
    return { play, stop, playing: () => btn };
  })();

  function redrawLive(fig){
    const b = FX[+fig.dataset.fx];
    const old = fig.querySelector(':scope > svg');
    if(!b || !old) return;
    const vb = (old.getAttribute('viewBox')||'').split(/[\s,]+/).map(Number);
    let markup;
    PLOT.hOverride = vb[3] || null;
    try { markup = figSvg(b); } finally { PLOT.hOverride = null; }
    const holder = document.createElement('div');
    holder.innerHTML = markup || '';
    const next = holder.querySelector('svg');
    if(next) old.replaceWith(next);
  }

  function blocks(list){
    if(!list) return '';
    return list.map((b,i)=>{
      if(!b) return '';
      /* a legend right after a figure is drawn inside it, by the fig renderer */
      if(b.t==='legend' && list[i-1] && list[i-1].t==='fig') return '';
      if(b.t==='fig') return B.fig(b, list[i+1] && list[i+1].t==='legend' ? list[i+1] : null);
      if(b.t==='reveal'){
        const on = S.step >= b.at;
        return `<div class="reveal ${on?'shown':''}" ${on?'':'aria-hidden="true"'}
                 style="${on?'':'pointer-events:none;'}">${blocks(b.items)}</div>`;
      }
      const f = B[b.t];
      return f ? f(b) : '';
    }).join('');
  }

  /* ---------- a practice question ----------
     An open-ended question in examination form: a statement, an optional
     figure, lettered parts, and a worked solution that is drawn only once the
     reader asks for it. The revealed flag is the same field the question bank
     uses, so persistence and the reset action need no new code. */
  /* The worked solution is written as one string of `<b>Head.</b>` sections
     (R7). It is drawn as cards: Given and Find share one, Method and Check are
     slate, each solved part is green, and the common error closes the column.
     The solution figure sits in the last green card. */
  function solCards(q){
    const parts = [];
    q.sol.split(/(?:<br>)?<b>(Given|Find|Method|Solution(?: — [^<]*)?|Check|Contrast with discrete time)\.<\/b>\s*/)
      .forEach((s,i,a)=>{ if(i%2) parts.push({head:s, html:a[i+1].replace(/(<br>\s*)+$/,'')}); });
    const card = (kind, head, html) =>
      `<div class="note ${kind}"><span class="note-h">${md(head)}</span>${symLinks(md(html))}</div>`;
    const fig = q.figSol ? `<figure class="fig">${typeof q.figSol==='function'?q.figSol():q.figSol}</figure>` : '';
    const lastOk = parts.map(p=>p.head.startsWith('Solution')).lastIndexOf(true);
    const given = parts.filter(p=>p.head==='Given'||p.head==='Find').map(p=>p.html).join('<div class="nsep"></div>');
    const out = [card('def','Given', given)];
    parts.forEach((p,i)=>{
      if(p.head==='Given'||p.head==='Find') return;
      const kind = p.head.startsWith('Solution') ? 'ok' : p.head==='Contrast with discrete time' ? 'warn' : 'def';
      out.push(card(kind, p.head, p.html).replace(/<\/div>$/, (i===lastOk?fig:'')+'</div>'));
    });
    if(q.err) out.push(card('err','Common error', q.err));
    return `<div class="dr-sol">${out.join('')}</div>`;
  }

  function drillHTML(q){
    const st = S.quiz[q.id] || {};
    return `<div class="quiz drill" data-qid="${q.id}">
      <div class="qid">${q.id}<span class="instr-inline" data-instr>${q.src?` · ref ${q.src}`:''}</span></div>
      <div class="qstem">${symLinks(md(q.stem))}</div>
      ${q.figure?`<figure class="fig">${typeof q.figure==='function'?q.figure():q.figure}</figure>`:''}
      <ol class="dr-parts">${(q.parts||[]).map(p=>`<li>${symLinks(md(p))}</li>`).join('')}</ol>
      <div><button class="btn" data-sol="${q.id}">${st.revealed?'Hide worked solution':'Show worked solution'}</button></div>
      ${st.revealed?solCards(q):''}
      ${q.teach?`<div class="instr"><div class="instr-panel"><span class="note-h">Teaching note</span>${md(q.teach)}</div></div>`:''}
    </div>`;
  }

  document.addEventListener('click', e=>{
    const rc = e.target.closest('[data-recall-card]');
    if(rc){ recallSet(rc, !rc.classList.contains('is-open')); recallSync(rc.closest('.recall')); return; }
    const pj = e.target.closest('[data-proj]');
    if(pj){ projectPick(pj); return; }
    const ra = e.target.closest('[data-recall-all]');
    if(ra){ const deck = ra.closest('.recall');
      const cards = [...deck.querySelectorAll('[data-recall-card]')];
      const on = cards.some(c=>!c.classList.contains('is-open'));
      cards.forEach(c=>recallSet(c, on)); recallSync(deck); return; }
    const ao = e.target.closest('.ask-opt');
    if(ao){ const row = ao.closest('[data-ask]'), key = row.dataset.ask;
      if(ASKED[key] != null) return;
      const a = findAsk(APP.scenes()[S.i].blocks, key); if(!a) return;
      ASKED[key] = +ao.dataset.k;
      const note = row.closest('.note'), holder = document.createElement('div');
      holder.innerHTML = askHTML(a);
      row.replaceWith(holder.querySelector('.ask-row'));
      const why = note.querySelector('.ask-why');
      if(why) why.replaceWith(holder.querySelector('.ask-why'));
      return; }
    const sb = e.target.closest('[data-sk]');
    if(sb){ const fig = sb.closest('figure[data-fx]'), b = fig && FX[+fig.dataset.fx];
      if(!b || !b.sketch) return;
      if(sb.dataset.sk==='show'){ b.sketch.shown = !b.sketch.shown;
        fig.classList.toggle('sk-shown', b.sketch.shown);
        sb.setAttribute('aria-pressed', b.sketch.shown);
        sb.textContent = b.sketch.shown ? 'Hide the answer' : 'Show the answer'; }
      else { b.sketch.ink = []; fig.querySelectorAll('.sk-ink').forEach(p=>p.remove()); }
      return; }
    const cg = e.target.closest('[data-cp-go]');
    if(cg){ CODE_AT[cg.closest('.cpage').dataset.cpage] = +cg.dataset.cpGo; draw(); return; }
    const cb = e.target.closest('[data-code]');
    if(cb){ const act = cb.dataset.code;
      if(act==='copy') codeCopy(cb);
      else if(act==='run') codeRun(cb);
      else if(act==='reset'){ const key = cb.closest('.cpage').dataset.key; delete DRAFT[key]; delete OUTPUT[key]; draw(); }
      return; }
    const cl = e.target.closest('[data-code-lang]');
    if(cl){ codeLang = cl.dataset.codeLang;
      try{ localStorage.setItem('ss-code-lang', codeLang); }catch(e){}
      draw(); return; }
    const fb = e.target.closest('[data-frame]');
    if(fb){ const fig = fb.closest('figure[data-fx]'), b = fig && FX[+fig.dataset.fx];
      if(b && b.frames){ const n=b.frames.labels.length, from=b.frames.t!=null ? b.frames.t : b.frames.i|0;
        b.frames.i = Math.min(Math.max((b.frames.i|0) + (+fb.dataset.frame), 0), n-1);
        fig.querySelector('[data-frame-v]').innerHTML = frameVal(b);
        fig.querySelectorAll('[data-frame]').forEach(x=>{ const d=+x.dataset.frame;
          x.disabled = d<0 ? b.frames.i<=0 : b.frames.i>=n-1; });
        frameTween(fig, b, from, b.frames.i); }
      return; }
    const lb = e.target.closest('[data-listen]');
    if(lb){ const fig = lb.closest('figure[data-fx]'), b = fig && FX[+fig.dataset.fx];
      if(b) AUDIO.play(b.listen.items[+lb.dataset.listen].sound(liveVals(b)), lb);
      return; }
    const d = e.target.closest('[data-drill]');
    if(d && !d.disabled){ const m=d.dataset.drill;
      const n=(CONTENT.DRILL||[]).filter(q=>q.module===m).length;
      S.drillPage[m] = Math.min(Math.max((S.drillPage[m]|0) + (+d.dataset.step), 0), n-1);
      APP.persist(); draw(); return; }
    const s = e.target.closest('[data-sol]');
    if(s){ const id=s.dataset.sol; const st=S.quiz[id]||(S.quiz[id]={});
      st.revealed=!st.revealed; APP.persist(); draw(); return; }
    const sym = e.target.closest('.sym[data-sym]');
    if(sym){ APP.open('ov-gloss');
      setTimeout(()=>{ const el=document.getElementById('g-'+sym.dataset.sym);
        if(el){ el.scrollIntoView({block:'center'}); el.style.background='rgba(190,85,57,.12)';
          setTimeout(()=>el.style.background='',1400);} },40); }
  });

  /* The pager's number is a field: a typed number jumps to that question on
     Enter or on leaving the field. A number out of range is clamped; anything
     else puts the current number back. */
  document.addEventListener('change', e=>{
    const g = e.target.closest('input[data-drill-go]'); if(!g) return;
    const m = g.dataset.drillGo, n = (CONTENT.DRILL||[]).filter(q=>q.module===m).length;
    const k = parseInt(g.value, 10);
    if(!Number.isFinite(k)){ g.value = (S.drillPage[m]|0) + 1; return; }
    S.drillPage[m] = Math.min(Math.max(k-1, 0), n-1);
    APP.persist(); draw();
  });

  /* A slider redraws its figure at the height it has now, grown or not. */
  document.addEventListener('input', e=>{
    const r = e.target.closest('input[data-live]');
    const fig = r && r.closest('figure[data-fx]');
    const b = fig && FX[+fig.dataset.fx];
    if(!b) return;
    const k = r.dataset.live, c = b.live.controls.find(c=>c.k===k);
    liveVals(b)[k] = +r.value;
    fig.querySelector(`[data-live-v="${k}"]`).innerHTML = liveVal(c, +r.value);
    redrawLive(fig);
    const pb = AUDIO.playing();
    if(pb && fig.contains(pb)){
      clearTimeout(fig._replay);
      fig._replay = setTimeout(()=>{
        if(AUDIO.playing() !== pb) return;
        AUDIO.stop();
        AUDIO.play(b.listen.items[+pb.dataset.listen].sound(liveVals(b)), pb);
      }, 150);
    }
  });

  /* Drawing on a sketch figure. The pointer is mapped into the svg's own
     units, so the stage scale and a grown figure need no correction. */
  let SK = null;
  document.addEventListener('pointerdown', e=>{
    const svg = e.target.closest('figure.sketch > svg');
    const fig = svg && svg.parentNode, b = fig && FX[+fig.dataset.fx];
    const area = svg && skArea(svg);
    if(!b || !b.sketch || !area || e.button) return;
    e.preventDefault();
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('class','sk-ink'); svg.insertBefore(path, svg.querySelector('.sk-key'));
    SK = { svg, b, area, path, st:[] };
    svg.setPointerCapture(e.pointerId);
    skMove(e);
  });
  function skMove(e){
    if(!SK) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(SK.svg.getScreenCTM().inverse());
    const [x,y,w,h] = SK.area, c = v=>Math.min(1, Math.max(0, v));
    SK.st.push([c((p.x-x)/w), c((p.y-y)/h)]);
    SK.path.setAttribute('d', skPath(SK.st, SK.area));
  }
  document.addEventListener('pointermove', skMove);
  const skEnd = ()=>{ if(!SK) return;
    if(SK.st.length > 1) (SK.b.sketch.ink = SK.b.sketch.ink || []).push(SK.st);
    else SK.path.remove();
    SK = null; };
  document.addEventListener('pointerup', skEnd);
  document.addEventListener('pointercancel', skEnd);

  /* ---------- scene drawing ---------- */
  function draw(){
    /* A figure is drawn on its own grid — 480 units wide for a typical one —
       and printed at whatever width the column gives it. A desktop column is
       about 700 px, so the drawing is enlarged and its labels come out larger
       than the size they were written at. A phone column is about 350 px, which
       halves them instead. The label scale projector mode already uses puts
       them back where they belong, and it is a scale the figures are known to
       survive, so the phone borrows it rather than inventing a second one. */
    const sc = APP.scenes()[S.i];
    if(typeof PLOT!=='undefined' && PLOT.setTheme)
      PLOT.setTheme({ dark: S.theme==='dark',
        scale: (S.display==='projector' || S.layout==='phone') ? 1.36 : 1,
        emphasis:!!(sc && (sc.slide || /-lab-/.test(sc.id))) });
    const host = document.getElementById('scene-host');
    if(!sc||!host) return;
    if(typeof PLOT!=='undefined') PLOT.labScale = 1;
    delete host.dataset.labgrown;
    host.className = 'scene is-active' + (sc.dark?' dark':'') + (sc.slide?' slide':'');
    TITLE_ICON = titleIcon(sc.id);
    GROW = []; FX = [];
    AUDIO.stop();
    host.innerHTML = '<div class="scene-inner">' + blocks(sc.blocks) + '</div>';
    host.setAttribute('aria-label', sc.title||sc.id);
    /* The address of the scene, and where the same material is developed at
       length in the textbook. Both belong to the scene rather than to any one
       block, so they are placed once the blocks are built and before the fit
       is measured. The anchor is student-facing and is deliberately not inside
       `instr-inline`: showing a reader where to read more is the point of it.
       It carries the book marker, because a bare `§` would read as this
       course's own address and the two numbering systems do not agree. */
    const eb = host.querySelector('.eyebrow');
    if(eb && sc.sec) eb.insertAdjacentHTML('beforeend',
      `<span class="ebnum">${sc.sec}</span>`
      + (sc.book?`<span class="ebbook" title="${CONTENT.BOOKREF.replace(/<[^>]+>/g,'')}"
           >${CONTENT.BOOKICON}CH${sc.book}</span>`:''));
    /* mount interactive laboratories */
    host.querySelectorAll('[data-lab]').forEach(el=>{
      const L = LABS[el.dataset.lab];
      if(L) L.mount(el);
      else el.innerHTML = '<div class="note warn">Laboratory not available in this build.</div>';
    });
    mountCourseMap(host);
    if(sc.slide) toneCards(host);
    fitScene();
    growLabs(host);
    chrome(sc);
  }

  /* No two cards on a slide share a colour (DESIGN.md, Information card). A
     labelled equation has a tab like a card, so it counts as one. Each keeps
     its own colour (coral for an equation or a prediction) while that colour
     is free on the slide; a repeat takes the first free neutral tone. A
     quick-check grid of more than four cards has its own form and is left
     alone. */
  function toneCards(host){
    const out = el => !el.closest('.instr, .instr-inline, [data-lab]');
    const notes = Array.from(host.querySelectorAll('.note')).filter(out);
    if(notes.length > 4) return;
    const cards = Array.from(host.querySelectorAll('.note, .eq:not(.plain)'))
      .filter(el => out(el) && (el.classList.contains('note')
        || (el.querySelector(':scope > .eq-label') && !el.closest('.note'))));
    const own = n => n.classList.contains('eq') || n.classList.contains('ask') ? 'coral'
      : n.classList.contains('ok') ? 'green' : n.classList.contains('err') ? 'red'
      : n.classList.contains('warn') ? 'amber' : 'slate';
    const used = new Set(), later = [];
    cards.forEach(n => { const t = own(n); if(used.has(t)) later.push(n); else used.add(t); });
    later.forEach(n => {
      const t = ['slate','plum','graphite','amber','coral'].find(x => !used.has(x));
      if(t){ used.add(t); n.dataset.tone = t; }
    });
  }

  /* ---- deterministic fit-to-scene: never clip, never reflow unpredictably.
     The 1920x1080 stage is already scaled to the viewport; a dense scene gets
     one extra uniform scale factor so every reveal state stays fully visible. */
  function fitScene(){
    const host = document.getElementById('scene-host');
    const inner = host && host.firstElementChild;
    if(!inner) return;
    const figs = Array.from(inner.querySelectorAll('figure.fig > svg'));
    figs.forEach(s => s.style.maxHeight = '');
    delete host.dataset.capped;
    delete host.dataset.grown;
    /* A phone has no fixed page to fit a scene into: the scene is as tall as it
       needs to be and the reader scrolls it. Nothing is scaled, so every inline
       size this function may have written on a wider screen is cleared, and the
       figures are given their own treatment instead. */
    if(S.layout==='phone'){
      inner.style.transform=''; inner.style.width=''; inner.style.height='';
      delete host.dataset.fit;
      phoneFigures(figs);
      phoneMath(inner);
      return;
    }
    APP.fit();                            /* the stage height depends on the scene */
    if(host.querySelector('.dr-page')){   /* a question page scrolls, never scales */
      inner.style.transform=''; inner.style.width=''; inner.style.height='100%';
      delete host.dataset.fit; return; }
    inner.style.transform = ''; inner.style.width = ''; inner.style.height = '100%';
    /* Every equation block sets its mathematics at one size. One too wide for its
       column is the exception: it is set smaller until it fits, rather than
       running into the figure beside it. */
    inner.querySelectorAll('.eq .katex-display > .katex').forEach(m => m.style.fontSize = '');
    inner.querySelectorAll('.eq').forEach(eq => {
      const ms = eq.querySelectorAll('.katex-display > .katex');
      for(let pass=0; pass<4 && ms.length && eq.scrollWidth > eq.clientWidth + 1; pass++){
        const em = parseFloat(ms[0].style.fontSize) || 1.30;
        const next = Math.max(0.75, em * eq.clientWidth / eq.scrollWidth * 0.96);
        ms.forEach(m => m.style.fontSize = next.toFixed(3) + 'em');
        if(next === 0.75) break;
      }
    });
    /* The scene box carries the page margin as padding, so clientHeight is the
       padded box while the inner column lives in the content box. Measuring
       against the padded box hides a scene that has run into the bottom margin:
       it is not scaled, and the figure at the foot of the column is drawn into
       the strip the page reserves for the footer. */
    const cs = getComputedStyle(host);
    const avail = host.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    /* The scaled column is laid out 1/k wider, so a figure that fills its column
       grows by the same factor and gives the scale factor nothing back. What one
       pass of avail/need predicts is therefore optimistic, and the height has to
       be measured again in the widened column. Four passes settle it; each pass
       can only make the factor smaller, and the floor stops it. */
    const FLOOR = S.display==='projector' ? 0.70 : 0.82;
    const TARGET = avail - 3;               /* a hair under, so rounding cannot clip */
    let k = 1;
    inner.style.height = 'auto';
    /* The eyebrow and the title are exempt from the scale: `--hk` = 1/k sizes
       them up by what the transform takes away, so every scene title reads at
       the same size whether its scene fits or not. */
    inner.style.removeProperty('--hk');
    for(let pass=0; pass<8; pass++){
      const need = inner.scrollHeight;      /* in the column as it stands now */
      if(need * k <= TARGET) break;
      const next = Math.max(FLOOR, TARGET / need);
      const settled = next >= k - 1e-3;
      k = next;
      inner.style.width = (100 / k) + '%';
      inner.style.setProperty('--hk', (1 / k).toFixed(4));
      if(settled) break;                    /* converged, or resting on the floor */
    }
    /* On the floor a scene can still be too tall, because the part of the column
       that a figure fills scales with the column and gives the factor nothing
       back. What is left is taken from the figures: each one is capped so the
       whole set gives up the surplus in proportion to its height. The drawing
       keeps its aspect ratio inside the cap, so a figure shrinks rather than
       being cut off at the foot of the page.
       This is a rescue, not a licence. A scene that leans on it is carrying more
       than one page holds and belongs split, so it marks itself: `data-capped`
       is what the layout sweep reads to name the scene. Taking a couple of pixels
       off a rounding edge is not leaning on it, so the mark needs the figures to
       have given up a real part of their height. */
    if(figs.length && inner.scrollHeight * k > TARGET){
      const room = TARGET / k;
      /* the stage is itself scaled into the viewport, so a measured rectangle is
         turned back into layout pixels before it is compared with scrollHeight */
      const px = (inner.getBoundingClientRect().height / (inner.scrollHeight || 1)) || 1;
      let kept = 1;
      for(let pass=0; pass<5 && inner.scrollHeight > room; pass++){
        const hs = figs.map(s => s.getBoundingClientRect().height / px);
        const tot = hs.reduce((a,b)=>a+b, 0);
        if(tot < 40) break;
        const keep = Math.max(0.45, 1 - (inner.scrollHeight - room) / tot);
        figs.forEach((s,i) => s.style.maxHeight = (hs[i] * keep).toFixed(1) + 'px');
        kept *= keep;
      }
      if(kept < 0.97) host.dataset.capped = (1 - kept).toFixed(3);
    }
    /* A slide's figure takes the height its column has left over. Only when the
       scene already fits as authored: growing must never cause a scale-down, and
       a capped scene has no spare height to give away. */
    if(k === 1 && !host.dataset.capped && host.classList.contains('slide'))
      growFigures(host, inner, TARGET);
    if(k < 1){
      inner.style.height = (100 / k) + '%';
      inner.style.width  = (100 / k) + '%';
      inner.style.transform = 'scale(' + k + ')';
      host.dataset.fit = k.toFixed(3);
    } else {
      inner.style.height = '100%';
      delete host.dataset.fit;
    }
  }

  /* ---- figures on a phone ----
     A drawing that fills its column is legible while the column is wide enough
     for the labels in it. The tick numbers of a figure are written at 13 units
     and drawn at the phone's label scale, so a figure w units wide printed
     p pixels wide shows them at 13 · 1.36 · p/w pixels. Below about 11 px they
     stop being readable at arm's length, which sets the narrowest the drawing
     may be printed: p = 13 · 1.36 · w / 11, a little under 0.62 w. Most figures
     are inside that already and simply fill the column. The wide ones — a long
     time axis, a two-panel comparison — are printed at that width instead and
     pan sideways inside their own frame, because a drawing too small to read is
     worth less than one the reader moves across. */
  function phoneFigures(figs){
    figs.forEach(svg=>{
      svg.style.minWidth = '';
      const vb = (svg.getAttribute('viewBox')||'').split(/[\s,]+/);
      const w = parseFloat(vb[2]);
      if(!isFinite(w) || w<=0) return;
      const room = svg.parentNode.clientWidth;
      const need = Math.round(0.62 * w);
      const fig  = svg.closest('figure.fig');
      if(fig) fig.classList.toggle('pans', need > room + 1);
      if(need > room + 1) svg.style.minWidth = need + 'px';
    });
  }

  /* ---- displayed mathematics on a phone ----
     A formula is one object: a reader who can see only two thirds of an
     equation cannot read it at all, however easy it is to push the rest into
     view. So a formula wider than the column is set smaller until it fits,
     down to about seven tenths of the reading size — below that the subscripts
     go, and a formula that is still too wide at the floor is left to pan with
     its right edge marked, which is the honest outcome for the two or three
     longest lines in the course. */
  function phoneMath(root){
    root.querySelectorAll('.eq').forEach(eq=>{
      const k = eq.querySelector('.katex-display');
      if(!k) return;
      k.style.fontSize = '';
      eq.classList.remove('pans');
      /* the box a formula has to fit in is the content box, and what a scroll
         container reports as its scrolled width carries the left padding with
         it; both are taken off, or the closing bracket lands on the border */
      const cs = getComputedStyle(eq);
      const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight);
      const room = () => eq.clientWidth - padL - padR;
      const need = () => eq.scrollWidth - padL;
      let f = 1;
      for(let pass=0; pass<4; pass++){
        if(need() <= room()) break;
        const next = Math.max(0.70, f * room() / need());
        const settled = next >= f - 0.005;
        f = next; k.style.fontSize = f.toFixed(3) + 'em';
        if(settled) break;
      }
      if(need() > room() + 1) eq.classList.add('pans');
    });
  }

  /* An svg in a column is width:100% and height:auto, so its height follows its
     viewBox; CSS cannot make it taller without distorting or letterboxing it.
     The figure is drawn again instead, at a height that takes up the space its
     column has left over. A hidden reveal keeps its space, so that space is the
     same at every step of the scene and the figure does not jump as cards
     appear. The column is measured against the real stage height, because with
     `height:auto` a column is exactly as tall as its contents and has no spare
     height by definition. */
  function growFigures(host, inner, TARGET){
    const MIN_FREE = 24, CAP = 1.8;
    const hWas = inner.style.height;
    inner.style.height = TARGET + 'px';
    inner.querySelectorAll('.cols.fill > .col').forEach(col => {
      const figure = col.querySelector('figure.fig[data-grow]');
      const blk = figure && GROW[+figure.dataset.grow];
      const svg = figure && figure.querySelector('svg');
      if(!blk || !svg) return;
      const vb = (svg.getAttribute('viewBox')||'').split(/[\s,]+/).map(Number);
      if(vb.length !== 4 || !vb[2] || !vb[3]) return;
      const w0 = vb[2], h0 = vb[3];
      const stack = () => Array.from(col.children).reduce((a,el) => {
        const m = getComputedStyle(el);
        return a + el.offsetHeight + parseFloat(m.marginTop||0) + parseFloat(m.marginBottom||0);
      }, 0);
      const free = col.clientHeight - stack();
      const wpx = svg.clientWidth || figure.clientWidth;
      if(free < MIN_FREE || !wpx) return;
      const h1 = Math.min(h0 * CAP, h0 + free * (w0 / wpx));
      if(h1 <= h0 + 1) return;
      let markup;
      PLOT.hOverride = h1;
      try { markup = figSvg(blk); } finally { PLOT.hOverride = null; }
      const holder = document.createElement('div');
      holder.innerHTML = markup || '';
      const next = holder.querySelector('svg');
      if(!next) return;
      svg.replaceWith(next);
      /* The guard measures the column, not `inner.scrollHeight`. A reveal that
         has not been shown yet is offset by `translateY(6px)`, which costs no
         layout height but does enlarge the scroll box, and growth can only
         overflow the one column it happened in. */
      if(stack() > col.clientHeight + 1){ next.replaceWith(svg); return; }
      host.dataset.grown = (h1 / h0).toFixed(3);
    });
    inner.style.height = hWas;
  }

  /* A laboratory's plot column is as tall as the laboratory, but its plots are
     drawn at the heights their author gave them, which leaves the lower part of
     the column empty on most screens. The laboratory is mounted again with every
     plot drawn taller by one factor, `PLOT.labScale`, chosen so the plots take
     the spare height of the first column. The factor stays set while the scene
     is shown, so each redraw the reader triggers keeps it. Growth never causes a
     scale-down: if the grown laboratory has to be scaled more than it was
     before, the factor goes back. A laboratory already scaled for its other
     column may still grow into the height that scaling left free.
     Mounting again is safe on a fresh scene, where the laboratory holds only its
     default state; the element is replaced so its listeners are not doubled. */
  function growLabs(host){
    if(S.layout==='phone' || typeof PLOT==='undefined') return;
    const labs = host.querySelectorAll('.lab[data-lab]');
    if(labs.length !== 1 || !LABS[labs[0].dataset.lab]) return;
    let el = labs[0];
    const CAP = 2.2, MARGIN = 6;
    const remount = () => {
      const fresh = el.cloneNode(false);
      el.replaceWith(fresh); el = fresh;
      LABS[el.dataset.lab].mount(el);
      fitScene();
    };
    const kOf = () => parseFloat(host.dataset.fit || '1');
    for(let pass=0; pass<3; pass++){
      if(host.dataset.capped) return;
      const k0 = kOf();
      const col = el.querySelector(':scope > .cols > .col');
      if(!col) return;
      const svgs = Array.from(col.querySelectorAll('svg[viewBox]'))
        .filter(s => s.getBoundingClientRect().height > 40 && !s.closest('.katex'));
      if(!svgs.length) return;
      const cr = col.getBoundingClientRect();
      /* the lowest drawn content, not a container stretched to the column */
      let bottom = cr.top;
      col.querySelectorAll('*').forEach(e => {
        if(e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return;
        if(e.children.length && getComputedStyle(e).flexGrow !== '0') return;
        const r = e.getBoundingClientRect();
        if(r.height) bottom = Math.max(bottom, r.bottom);
      });
      const px = cr.height / (col.offsetHeight || 1);   /* stage scale */
      const free = (cr.bottom - bottom) / px - MARGIN;
      const svgH = svgs.reduce((a,s) => a + s.getBoundingClientRect().height, 0) / px;
      if(free < 16) return;
      const was = PLOT.labScale;
      const next = Math.min(CAP, was * (svgH + free) / svgH);
      if(next < was * 1.02) return;
      PLOT.labScale = next;
      remount();
      if(host.dataset.capped || kOf() < k0 - 1e-3){ PLOT.labScale = was; remount(); return; }
      host.dataset.labgrown = next.toFixed(3);
    }
  }

  /* Toolbar icons: 24-unit strokes in the button's own colour. A toggle shows
     its current state; the label and the key stay in the tooltip. */
  const ICON = {
    monitor:  '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    projector:'<rect x="2" y="8" width="20" height="9" rx="2"/><circle cx="8" cy="12.5" r="2.5"/><path d="M14 11h4M14 14h2M5 17v2M19 17v2"/>',
    laser:    '<path d="M3 21l7-7" stroke-dasharray="2 2.5"/><circle cx="15" cy="9" r="2.2" fill="currentColor"/><circle cx="15" cy="9" r="6"/>',
    arrow:    '<path d="M5 3l14 7.5-6.2 1.7L10 18.5z"/>',
    trail:    '<path d="M3 19c3-1 4-5 7-5s3 3 6 2"/><path d="M14.5 9.5l5-5 2 2-5 5-2.5.5z"/>',
    trailfade:'<path d="M3 19c3-1 4-5 7-5s3 3 6 2" stroke-dasharray="2 3"/><path d="M14.5 9.5l5-5 2 2-5 5-2.5.5z"/>',
    trailoff: '<path d="M14.5 9.5l5-5 2 2-5 5-2.5.5z"/><path d="M3 3l18 18"/>',
    sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:     '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    lecture:  '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v3M8 21l4-2 4 2M7 12l3-3 2 2 5-5"/>',
    study:    '<path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5v13"/>',
    student:  '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v5"/>',
    teacher:  '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    motion:   '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0"/>',
    still:    '<path d="M2 12h20"/><path d="M9 8v8M15 8v8"/>',
  };
  const ico = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[n]+'</svg>';
  function tb(el, on, icon, label, word=label){
    el.setAttribute('aria-pressed', on);
    if(el.dataset.icon!==icon+word){ el.innerHTML = ico(icon)+'<span>'+word+'</span>'; el.dataset.icon = icon+word; }
    if(!el.dataset.tip) el.dataset.tip = el.title;
    el.setAttribute('aria-label', label);
    el.title = label+' — '+el.dataset.tip;
  }

  /* The settings menu opens under its button, right-aligned to it. */
  const setmenu = document.getElementById('setmenu');
  if(setmenu) setmenu.addEventListener('beforetoggle', e=>{
    if(e.newState!=='open') return;
    const r = document.getElementById('btn-settings').getBoundingClientRect();
    setmenu.style.top = (r.bottom+6)+'px';
    setmenu.style.right = (innerWidth-r.right)+'px';
  });

  function chrome(sc){
    const n = APP.scenes().length;
    document.getElementById('progress').style.width = ((S.i+1)/n*100)+'%';
    document.getElementById('crumb').textContent = (sc.sec||sc.module||'') + (sc.nav?' · '+sc.nav:'');
    const pb = document.getElementById('pagebox');
    if(document.activeElement!==pb) pb.value = S.i+1;
    pb.style.width = String(n).length+1.5+'ch';
    document.getElementById('pagetotal').textContent = ' / '+n
      + (sc.steps?('  ·  step '+S.step+'/'+sc.steps):'');
    document.getElementById('srcref').textContent =
      (S.edition==='instructor' && sc.src) ? ('ref '+sc.src) : '';
    const bm=document.getElementById('btn-mode'); if(bm) tb(bm, S.mode==='lecture',
      S.mode==='lecture'?'lecture':'study', S.mode==='lecture'?'Lecture mode':'Self-study', S.mode==='lecture'?'Lecture':'Self-study');
    const be=document.getElementById('btn-edition'); if(be) tb(be, S.edition==='instructor',
      S.edition==='instructor'?'teacher':'student', S.edition==='instructor'?'Instructor':'Student',
      S.edition==='instructor'?'Instructor edition':'Student edition');
    const br=document.getElementById('btn-motion'); if(br) tb(br, S.motion==='reduced',
      S.motion==='reduced'?'still':'motion', S.motion==='reduced'?'Motion: reduced':'Motion: full', S.motion==='reduced'?'Reduced motion':'Full motion');
    const bs=document.getElementById('sbtoggle'); if(bs) bs.setAttribute('aria-pressed', S.sidebar==='on');
    const bt=document.getElementById('btn-theme'); if(bt){ tb(bt, S.theme==='dark',
      S.theme==='dark'?'moon':'sun', S.theme==='dark'?'Dark':'Light'); bt.dataset.state = S.theme; }
    const bd=document.getElementById('btn-display'); if(bd) tb(bd, S.display==='projector',
      S.display==='projector'?'projector':'monitor', S.display==='projector'?'Projector':'Normal');
    const bp=document.getElementById('btn-pointer'); if(bp) tb(bp, S.pointer==='laser',
      S.pointer==='laser'?'laser':'arrow', S.pointer==='laser'?'Laser':'Arrow');
    const bi=document.getElementById('btn-trail'); if(bi){ tb(bi, S.trail!=='off',
      S.trail==='off'?'trailoff':S.trail==='fade'?'trailfade':'trail', 'Trail: '+S.trail, 'Trail');
      bi.disabled = S.pointer!=='laser'; }
    const tl=document.getElementById('trail-sec'); if(tl){ tl.value=S.trailSec;
      tl.disabled = S.pointer!=='laser' || S.trail!=='fade';
      tl.nextElementSibling.textContent = S.trailSec+' s'; }
    APP.buildMap();
    APP.buildSidebar();
  }

  return { draw, blocks, tex, md, drillHTML, symLinks, fit:fitScene };
})();
