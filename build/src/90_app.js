/* ==========================================================================
   Renderer — turns declarative content blocks into the learning canvas.
   Content (what is taught) lives in CONTENT.*; this file owns only how it looks
   and behaves.
   ========================================================================== */
const RENDER = (() => {
  const S = APP.state;

  /* ---------- math ---------- */
  const texOpts = { throwOnError:false, strict:false, output:'html',
    macros:{ '\\d':'\\mathrm{d}', '\\Ev':'\\mathcal{E}\\mathrm{v}', '\\Od':'\\mathcal{O}\\mathrm{d}' } };
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
  function symLinks(html){
    return html.replace(/\{\{sym:([a-zA-Z0-9_]+)\|([^}]+)\}\}/g,
      (m,k,label)=>`<span class="sym" data-sym="${k}" title="${(CONTENT.GLOSS[k]||{}).d||''}">${label}</span>`);
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
    note:    b => `<div class="note ${b.kind||'def'}">${b.head?`<span class="note-h">${md(b.head)}</span>`:''}
        ${symLinks(md(b.html))}</div>`,
    legend:  b => `<div class="legend">${b.items.map(([c,l])=>`<i class="lg-${c}">${md(l)}</i>`).join('')}</div>`,
    wex:     b => `<div class="wex">${b.rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${md(k)}</div><div class="wex-v">${symLinks(md(v))}</div></div>`).join('')}</div>`,
    fig:     b => `<figure class="fig ${b.frame?'fig-frame':''}">
        ${typeof b.svg==='function'?b.svg():b.svg}
        ${b.caption?`<figcaption>${md(b.caption)}</figcaption>`:''}</figure>`,
    grid:    b => `<div style="display:grid;grid-template-columns:repeat(${b.cols||2},minmax(0,1fr));gap:${b.gap||'28px'};${b.style||''}">
        ${b.items.map(it=>`<div class="gcell">${blocks(it)}</div>`).join('')}</div>`,
    cols:    b => `<div class="cols ${b.ratio||'c-6-6'}" style="${b.style||''}">
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
    /* The taxonomy of a module's question types, read from CONTENT.DRILLTYPES. */
    drilltypes: b => { const ts=(CONTENT.DRILLTYPES[b.module]||[]);
        return `<div class="dr-types" style="${b.style||''}">${ts.map((ty,i)=>
          `<div class="dr-type">
             <div class="dr-type-h"><span class="dr-type-k">${String.fromCharCode(65+i)}</span>${md(ty.name)}</div>
             <div class="dr-type-asks">${symLinks(md(ty.asks))}</div>
             <ol class="dr-type-m">${ty.method.map(s=>`<li>${symLinks(md(s))}</li>`).join('')}</ol>
             ${ty.go?`<a class="dr-type-go" data-act="goto" data-id="${ty.go}">where this is taught →</a>`:''}
           </div>`).join('')}</div>`; },
    /* a raw block may carry a function instead of a string, exactly as fig does,
       so a figure built in JavaScript is generated per render and picks up the
       palette of the theme in force */
    raw:     b => typeof b.html === 'function' ? b.html() : b.html
  };

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
    const ty = (CONTENT.DRILLTYPES[q.module]||[]).find(t=>t.k===q.type);
    return `<div class="quiz drill" data-qid="${q.id}">
      <div class="qid">${q.id}${ty?' · '+md(ty.name):''}<span class="instr-inline" data-instr>${q.src?` · ref ${q.src}`:''}</span></div>
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

  /* ---------- scene drawing ---------- */
  function draw(){
    if(typeof PLOT!=='undefined' && PLOT.setTheme)
      PLOT.setTheme({ dark: S.theme==='dark', scale: S.display==='projector' ? 1.36 : 1 });
    const sc = APP.scenes()[S.i];
    const host = document.getElementById('scene-host');
    if(!sc||!host) return;
    host.className = 'scene is-active' + (sc.dark?' dark':'');
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
    if(host.querySelector('.dr-page')){   /* a question page scrolls, never scales */
      inner.style.transform=''; inner.style.width=''; inner.style.height='100%';
      delete host.dataset.fit; return; }
    inner.style.transform = ''; inner.style.width = ''; inner.style.height = '100%';
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

  function chrome(sc){
    const n = APP.scenes().length;
    document.getElementById('progress').style.width = ((S.i+1)/n*100)+'%';
    document.getElementById('crumb').textContent = (sc.sec||sc.module||'') + (sc.nav?' · '+sc.nav:'');
    document.getElementById('counter').textContent = (S.i+1)+' / '+n
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
    APP.buildMap();
    APP.buildSidebar();
  }

  return { draw, blocks, tex, md, drillHTML, symLinks };
})();
