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

  /* ---------- block renderers ---------- */
  const B = {
    eyebrow: b => `<p class="eyebrow"><span class="tick"></span>${md(b.text)}
        ${b.src?`<span class="src instr-inline" data-instr>[ref ${b.src}]</span>`:''}</p>`,
    title:   b => `<h${b.level||2} class="${b.level===1?'display':'title'}">${md(b.text)}</h${b.level||2}>`,
    sub:     b => `<h3 class="sub">${md(b.text)}</h3>`,
    lede:    b => `<p class="lede">${md(b.text)}</p>`,
    body:    b => `<div class="body ${b.cls||''}">${symLinks(md(b.html))}</div>`,
    small:   b => `<div class="small">${symLinks(md(b.html))}</div>`,
    rule:    b => `<hr class="rule ${b.short?'short':''}">`,
    eq:      b => `<div class="eq ${b.plain?'plain':''} ${b.key?'key':''} ${b.size||''}">
        ${b.label?`<div class="eq-label">${md(b.label)}</div>`:''}
        ${tex(b.tex,true)}
        ${b.note?`<div class="eq-note">${symLinks(md(b.note))}</div>`:''}</div>`,
    note:    b => `<div class="note ${b.kind||'def'}${b.ask?' ask':''}">${b.head?`<span class="note-h">${md(b.head)}</span>`:''}
        ${b.ask?askBody(b.html):symLinks(md(b.html))}${b.ask?askHTML(b.ask):''}</div>`,
    legend:  b => `<div class="legend">${b.items.map(([c,l])=>`<i class="lg-${c}">${md(l)}</i>`).join('')}</div>`,
    wex:     b => `<div class="wex">${b.rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${md(k)}</div><div class="wex-v">${symLinks(md(v))}</div></div>`).join('')}</div>`,
    fig:     b => `<figure class="fig ${b.frame?'fig-frame':''}"${
          b.grow && typeof b.svg==='function' ? ` data-grow="${GROW.push(b)-1}"` : ''}${
          b.live||b.listen ? ` data-fx="${FX.push(b)-1}"` : ''}>
        ${figSvg(b)}
        ${b.live||b.listen?`<div class="fxbar">${b.live?liveHTML(b):''}${b.listen?listenHTML(b):''}</div>`:''}
        ${b.caption?`<figcaption>${md(b.caption)}</figcaption>`:''}</figure>`,
    grid:    b => `<div style="display:grid;grid-template-columns:repeat(${b.cols||2},minmax(0,1fr));gap:${b.gap||'28px'};${b.style||''}">
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
          <span class="dr-count">Question ${i+1} <span class="dr-of">of</span> ${qs.length}</span>
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
  function figSvg(b){ return typeof b.svg==='function' ? b.svg(liveVals(b)) : b.svg; }
  function liveVal(c, v){ return md(c.show ? c.show(v) : '$'+v+'$'); }
  function liveHTML(b){
    const v = liveVals(b);
    return b.live.controls.map(c=>`<label class="live-ctrl">
        <span class="live-k">${md(c.label)}</span>
        <input type="range" data-live="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${v[c.k]}">
        <span class="live-v" data-live-v="${c.k}">${liveVal(c, v[c.k])}</span></label>`).join('');
  }
  function listenHTML(b){
    return b.listen.items.map((it,i)=>
        `<button type="button" class="listen-btn" data-listen="${i}">${md(it.label)}</button>`).join('');
  }

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
     played once; a second press on the playing button stops it. Nothing is
     fetched. The peak is set to one level so that loudness says nothing. */
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
    return { play, stop };
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
    return list.map(b=>{
      if(!b) return '';
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
  function drillHTML(q){
    const st = S.quiz[q.id] || {};
    return `<div class="quiz drill" data-qid="${q.id}">
      <div class="qid">${q.id}<span class="instr-inline" data-instr>${q.src?` · ref ${q.src}`:''}</span></div>
      <div class="qstem">${symLinks(md(q.stem))}</div>
      ${q.figure?`<figure class="fig">${typeof q.figure==='function'?q.figure():q.figure}</figure>`:''}
      <ol class="dr-parts">${(q.parts||[]).map(p=>`<li>${symLinks(md(p))}</li>`).join('')}</ol>
      <div><button class="btn" data-sol="${q.id}">${st.revealed?'Hide worked solution':'Show worked solution'}</button></div>
      ${st.revealed?`<div class="note ok" style="margin-top:6px">
          <span class="note-h">Worked solution</span>${symLinks(md(q.sol))}
          ${q.figSol?`<figure class="fig">${typeof q.figSol==='function'?q.figSol():q.figSol}</figure>`:''}
          ${q.err?`<div style="margin-top:12px" class="note err"><span class="note-h">Most likely student error</span>${md(q.err)}</div>`:''}
        </div>`:''}
      ${q.teach?`<div class="instr"><div class="instr-panel"><span class="note-h">Teaching note</span>${md(q.teach)}</div></div>`:''}
    </div>`;
  }

  document.addEventListener('click', e=>{
    const rc = e.target.closest('[data-recall-card]');
    if(rc){ recallSet(rc, !rc.classList.contains('is-open')); recallSync(rc.closest('.recall')); return; }
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
  });

  /* ---------- scene drawing ---------- */
  function draw(){
    const sc = APP.scenes()[S.i];
    if(typeof PLOT!=='undefined' && PLOT.setTheme)
      PLOT.setTheme({ dark: S.theme==='dark', scale: S.display==='projector' ? 1.36 : 1,
        emphasis:!!(sc && (sc.slide || /-lab-/.test(sc.id))) });
    const host = document.getElementById('scene-host');
    if(!sc||!host) return;
    host.className = 'scene is-active' + (sc.dark?' dark':'') + (sc.slide?' slide':'');
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
    fitScene();
    chrome(sc);
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
    for(let pass=0; pass<8; pass++){
      const need = inner.scrollHeight;      /* in the column as it stands now */
      if(need * k <= TARGET) break;
      const next = Math.max(FLOOR, TARGET / need);
      const settled = next >= k - 1e-3;
      k = next;
      inner.style.width = (100 / k) + '%';
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

  function chrome(sc){
    const n = APP.scenes().length;
    document.getElementById('progress').style.width = ((S.i+1)/n*100)+'%';
    document.getElementById('crumb').textContent = (sc.sec||sc.module||'') + (sc.nav?' · '+sc.nav:'');
    const pb = document.getElementById('pagebox');
    if(document.activeElement!==pb) pb.value = S.i+1;
    pb.style.width = String(n).length+1+'ch';
    document.getElementById('pagetotal').textContent = ' / '+n
      + (sc.steps?('  ·  step '+S.step+'/'+sc.steps):'');
    document.getElementById('srcref').textContent =
      (S.edition==='instructor' && sc.src) ? ('ref '+sc.src) : '';
    const bm=document.getElementById('btn-mode'); if(bm){ bm.setAttribute('aria-pressed', S.mode==='lecture');
      bm.textContent = S.mode==='lecture'?'Lecture mode':'Self-study'; }
    const be=document.getElementById('btn-edition'); if(be){ be.setAttribute('aria-pressed', S.edition==='instructor');
      be.textContent = S.edition==='instructor'?'Instructor':'Student'; }
    const br=document.getElementById('btn-motion'); if(br){ br.setAttribute('aria-pressed', S.motion==='reduced');
      br.textContent = S.motion==='reduced'?'Motion: reduced':'Motion: full'; }
    const bs=document.getElementById('sbtoggle'); if(bs) bs.setAttribute('aria-pressed', S.sidebar==='on');
    const bt=document.getElementById('btn-theme'); if(bt){ bt.setAttribute('aria-pressed', S.theme==='dark');
      bt.textContent = S.theme==='dark'?'Dark':'Light'; }
    const bd=document.getElementById('btn-display'); if(bd){ bd.setAttribute('aria-pressed', S.display==='projector');
      bd.textContent = S.display==='projector'?'Projector':'Normal'; }
    const bp=document.getElementById('btn-pointer'); if(bp){ bp.setAttribute('aria-pressed', S.pointer==='laser');
      bp.textContent = S.pointer==='laser'?'Laser':'Arrow'; }
    const bi=document.getElementById('btn-trail'); if(bi){ bi.setAttribute('aria-pressed', S.trail!=='off');
      bi.textContent = 'Trail: '+S.trail; bi.disabled = S.pointer!=='laser'; }
    APP.buildMap();
    APP.buildSidebar();
  }

  return { draw, blocks, tex, md, drillHTML, symLinks, fit:fitScene };
})();
