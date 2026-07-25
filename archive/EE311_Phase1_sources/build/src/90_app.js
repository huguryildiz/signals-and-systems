/* ==========================================================================
   EE311 · Renderer — turns declarative content blocks into the learning canvas.
   Content (what is taught) lives in CONTENT.*; this file owns only how it looks
   and behaves.
   ========================================================================== */
const RENDER = (() => {
  const S = APP.state;

  /* ---------- math ---------- */
  const texOpts = { throwOnError:false, strict:false, output:'html',
    macros:{ '\\d':'\\mathrm{d}', '\\Ev':'\\mathcal{E}\\mathrm{v}', '\\Od':'\\mathcal{O}\\mathrm{d}' } };
  function tex(s, display){
    try{ return katex.renderToString(s, Object.assign({displayMode:!!display}, texOpts)); }
    catch(e){ return '<code>'+s+'</code>'; }
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
    eyebrow: b => `<p class="eyebrow"><span class="tick"></span>${b.text}
        ${b.src?`<span class="src">[Source: EE311 Lecture Notes, PDF ${b.src}]</span>`:''}</p>`,
    title:   b => `<h${b.level||2} class="${b.level===1?'display':'title'}">${md(b.text)}</h${b.level||2}>`,
    sub:     b => `<h3 class="sub">${md(b.text)}</h3>`,
    lede:    b => `<p class="lede">${md(b.text)}</p>`,
    body:    b => `<div class="body ${b.cls||''}">${symLinks(md(b.html))}</div>`,
    small:   b => `<div class="small">${symLinks(md(b.html))}</div>`,
    rule:    b => `<hr class="rule ${b.short?'short':''}">`,
    eq:      b => `<div class="eq ${b.plain?'plain':''} ${b.key?'key':''} ${b.size||''}">
        ${b.label?`<div class="eq-label">${b.label}</div>`:''}
        ${tex(b.tex,true)}
        ${b.note?`<div class="eq-note">${symLinks(md(b.note))}</div>`:''}</div>`,
    note:    b => `<div class="note ${b.kind||'def'}">${b.head?`<span class="note-h">${b.head}</span>`:''}
        ${symLinks(md(b.html))}</div>`,
    legend:  b => `<div class="legend">${b.items.map(([c,l])=>`<i class="lg-${c}">${md(l)}</i>`).join('')}</div>`,
    wex:     b => `<div class="wex">${b.rows.map(([k,v])=>
        `<div class="wex-row"><div class="wex-k">${k}</div><div class="wex-v">${symLinks(md(v))}</div></div>`).join('')}</div>`,
    fig:     b => `<figure class="fig ${b.frame?'fig-frame':''}">
        ${typeof b.svg==='function'?b.svg():b.svg}
        ${b.caption?`<figcaption>${md(b.caption)}</figcaption>`:''}</figure>`,
    grid:    b => `<div style="display:grid;grid-template-columns:repeat(${b.cols||2},minmax(0,1fr));gap:${b.gap||'28px'};${b.style||''}">
        ${b.items.map(it=>`<div>${blocks(it)}</div>`).join('')}</div>`,
    cols:    b => `<div class="cols ${b.ratio||'c-6-6'}" style="${b.style||''}">
        <div class="col ${b.vcenter?'center':''}">${blocks(b.left)}</div>
        <div class="col ${b.vcenter?'center':''}">${blocks(b.right)}</div></div>`,
    stack:   b => `<div class="stack" style="${b.style||''}">${blocks(b.items)}</div>`,
    instr:   b => `<div class="instr"><div class="instr-panel">
        <span class="note-h">${b.head||'Instructor note'}</span>${symLinks(md(b.html))}</div></div>`,
    lab:     b => `<div class="lab" data-lab="${b.id}"></div>`,
    check:   b => quizHTML(b.q, true),
    quizset: b => `<div class="stack">${b.qs.map(q=>quizHTML(q,false)).join('')}</div>`,
    qbank:   b => { const qs=(CONTENT.QBANK||[]).filter(q=>q.module===b.module);
        const done=qs.filter(q=>(S.quiz[q.id]||{}).correct).length;
        return `<div class="qb-head small">Progress on this bank: <b>${done} / ${qs.length}</b> answered correctly on this device.
          ${done===qs.length&&qs.length?'<span style="color:var(--sig-out)"> — bank complete.</span>':''}</div>
        <div class="qb-scroll">${qs.map((q,i)=>
          `<div class="qb-item">${quizHTML(q,false)}</div>`).join('')}</div>`; },
    raw:     b => b.html
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

  /* ---------- quiz ---------- */
  function quizHTML(q, compact){
    const st = S.quiz[q.id] || {attempts:0};
    const locked = st.correct;
    const opts = (q.opts||[]).map((o,k)=>{
      const key = String.fromCharCode(65+k);
      let cls = '';
      if(st.picked!=null){
        if(k===q.a) cls = st.picked===k || st.revealed ? 'correct' : '';
        else if(st.picked===k) cls='wrong';
      }
      if(locked||st.revealed) cls+=' locked';
      return `<button class="opt ${cls}" data-q="${q.id}" data-k="${k}" ${locked||st.revealed?'disabled':''}>
        <span class="k">${key}</span><span>${md(o)}</span></button>`;
    }).join('');
    const showFb = st.picked!=null;
    const fbTxt = showFb ? (st.picked===q.a ? (q.why||'Correct.') : (q.wrong&&q.wrong[st.picked]) || 'Not correct — check the governing definition.') : '';
    return `<div class="quiz" data-qid="${q.id}">
      <div class="qid">${q.id} · ${q.kind||'concept'} ${q.src?`· [Source: EE311 Lecture Notes, PDF ${q.src}]`:''} · editorially developed</div>
      <div class="qstem">${symLinks(md(q.stem))}</div>
      ${q.figure?`<figure class="fig">${typeof q.figure==='function'?q.figure():q.figure}</figure>`:''}
      <div class="opts">${opts}</div>
      ${st.hint?`<div class="hintbox"><span class="note-h">Hint ${st.hint}</span>${md(q.hints[st.hint-1])}</div>`:''}
      ${showFb?`<div class="fb ${st.picked===q.a?'good':'bad'}">${md(fbTxt)}</div>`:''}
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${q.hints&&q.hints.length?`<button class="btn" data-hint="${q.id}" ${st.hint>=q.hints.length?'disabled':''}>Hint ${Math.min((st.hint||0)+1,q.hints.length)} of ${q.hints.length}</button>`:''}
        ${st.picked!=null&&!st.correct?`<button class="btn" data-retry="${q.id}">Try again</button>`:''}
        <button class="btn" data-sol="${q.id}">${st.revealed?'Hide solution':'Show full solution'}</button>
      </div>
      ${st.revealed?`<div class="note ok" style="margin-top:6px">
          <span class="note-h">Worked solution</span>${symLinks(md(q.sol))}
          ${q.err?`<div style="margin-top:12px" class="note err"><span class="note-h">Most likely student error</span>${md(q.err)}</div>`:''}
        </div>`:''}
      ${q.teach?`<div class="instr"><div class="instr-panel"><span class="note-h">Teaching note</span>${md(q.teach)}</div></div>`:''}
    </div>`;
  }

  function findQ(id){
    for(const b of (CONTENT.QBANK||[])) if(b.id===id) return b;
    return null;
  }
  document.addEventListener('click', e=>{
    const o = e.target.closest('.opt[data-q]');
    if(o){
      const id=o.dataset.q, k=+o.dataset.k, q=findQ(id); if(!q) return;
      const st = S.quiz[id] || (S.quiz[id]={attempts:0});
      st.picked=k; st.attempts++; st.correct = (k===q.a);
      APP.persist(); draw(); return;
    }
    const h = e.target.closest('[data-hint]');
    if(h){ const id=h.dataset.hint, q=findQ(id); const st=S.quiz[id]||(S.quiz[id]={attempts:0});
      st.hint = Math.min((st.hint||0)+1, q.hints.length); APP.persist(); draw(); return; }
    const r = e.target.closest('[data-retry]');
    if(r){ const st=S.quiz[r.dataset.retry]; if(st){ st.picked=null; } APP.persist(); draw(); return; }
    const s = e.target.closest('[data-sol]');
    if(s){ const id=s.dataset.sol; const st=S.quiz[id]||(S.quiz[id]={attempts:0});
      st.revealed=!st.revealed; APP.persist(); draw(); return; }
    const sym = e.target.closest('.sym[data-sym]');
    if(sym){ APP.open('ov-gloss');
      setTimeout(()=>{ const el=document.getElementById('g-'+sym.dataset.sym);
        if(el){ el.scrollIntoView({block:'center'}); el.style.background='rgba(190,85,57,.12)';
          setTimeout(()=>el.style.background='',1400);} },40); }
  });

  /* ---------- scene drawing ---------- */
  function draw(){
    const sc = APP.scenes()[S.i];
    const host = document.getElementById('scene-host');
    if(!sc||!host) return;
    host.className = 'scene is-active' + (sc.dark?' dark':'');
    host.innerHTML = '<div class="scene-inner">' + blocks(sc.blocks) + '</div>';
    host.setAttribute('aria-label', sc.title||sc.id);
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
    if(host.querySelector('.qb-scroll')){   /* question banks scroll, never scale */
      inner.style.transform=''; inner.style.width=''; inner.style.height='100%';
      delete host.dataset.fit; return; }
    inner.style.transform = ''; inner.style.width = ''; inner.style.height = '100%';
    const avail = host.clientHeight;
    inner.style.height = 'auto';
    const need = inner.scrollHeight;
    if(need > avail + 1){
      const k = Math.max(0.82, avail / need);
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
    document.getElementById('crumb').textContent = (sc.module||'') + (sc.nav?' · '+sc.nav:'');
    document.getElementById('counter').textContent = (S.i+1)+' / '+n
      + (sc.steps?('  ·  step '+S.step+'/'+sc.steps):'');
    document.getElementById('srcref').textContent = sc.src? ('PDF '+sc.src) : '';
    const bm=document.getElementById('btn-mode'); if(bm){ bm.setAttribute('aria-pressed', S.mode==='lecture');
      bm.textContent = S.mode==='lecture'?'Lecture mode':'Self-study'; }
    const be=document.getElementById('btn-edition'); if(be){ be.setAttribute('aria-pressed', S.edition==='instructor');
      be.textContent = S.edition==='instructor'?'Instructor':'Student'; }
    const br=document.getElementById('btn-motion'); if(br){ br.setAttribute('aria-pressed', S.motion==='reduced');
      br.textContent = S.motion==='reduced'?'Motion: reduced':'Motion: full'; }
    APP.buildMap();
  }

  return { draw, blocks, tex, md, quizHTML, symLinks };
})();
