/* ==========================================================================
   Application core — state, storage, routing, navigation, overlays.
   Presentation logic only. Course content lives in the CONTENT modules.
   ========================================================================== */
const APP = (() => {

  /* ---------- privacy-preserving local store (device only, never network) --- */
  const STORE_KEY = 'sigsys.v1.progress';
  const mem = {};
  const store = {
    ok:(()=>{ try{ const k='__t'; localStorage.setItem(k,'1'); localStorage.removeItem(k); return true; }
              catch(e){ return false; } })(),
    read(){
      if(!store.ok) return mem.data || (mem.data={});
      try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); }catch(e){ return {}; }
    },
    write(d){
      if(!store.ok){ mem.data=d; return; }
      try{ localStorage.setItem(STORE_KEY, JSON.stringify(d)); }catch(e){ mem.data=d; }
    },
    clear(){ mem.data={}; if(store.ok){ try{ localStorage.removeItem(STORE_KEY); }catch(e){} } }
  };

  const state = {
    i: 0,               // scene index
    step: 0,            // reveal step inside the scene
    mode: 'study',      // 'lecture' | 'study'
    edition: 'student', // 'student' | 'instructor'
    motion: 'full',     // 'full' | 'reduced'
    visited: {},
    sidebar: 'on',      // contents rail
    theme: 'light',     // 'light' | 'dark'
    display: 'normal',  // 'normal' | 'projector'
    quiz: {},           // qid -> {picked, correct, attempts, revealed}
    drillPage: {},      // module id -> index of the drill question on screen
    secOpen: {}         // section number -> the reader's own open/closed choice
  };

  let SCENES = [], MODULES = [], CHAPTERS = [], onRender = ()=>{};

  /* ---------- initialisation ---------- */
  function init({scenes, modules, chapters, render}){
    SCENES = scenes; MODULES = modules; CHAPTERS = chapters || []; onRender = render;
    const saved = store.read();
    Object.assign(state, {
      mode: saved.mode || 'study',
      edition: saved.edition || 'student',
      motion: saved.motion || (matchMedia('(prefers-reduced-motion:reduce)').matches?'reduced':'full'),
      sidebar: saved.sidebar || 'on',
      theme: saved.theme || (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),
      display: saved.display || 'normal',
      visited: saved.visited || {},
      quiz: saved.quiz || {},
      drillPage: saved.drillPage || {}
    });
    applyBodyFlags();
    bindKeys();
    bindChrome();
    window.addEventListener('hashchange', fromHash);
    watchSize();
    fit();
    fromHash(true);
  }

  function persist(){
    store.write({ mode:state.mode, edition:state.edition, motion:state.motion, sidebar:state.sidebar,
                  theme:state.theme, display:state.display,
                  visited:state.visited, quiz:state.quiz, drillPage:state.drillPage,
                  at:SCENES[state.i]&&SCENES[state.i].id });
  }
  function applyBodyFlags(){
    document.body.dataset.mode = state.mode;
    document.body.dataset.edition = state.edition;
    document.body.dataset.motion = state.motion;
    document.body.dataset.sidebar = state.sidebar;
    document.body.dataset.theme = state.theme;
    document.body.dataset.display = state.display;
  }

  /* ---------- stage scaling: exact 1920×1080 basis, scaled to fit ---------- */
  let _ro = null;
  function fit(){
    const stage = document.getElementById('stage');
    const wrap  = document.getElementById('stagewrap');
    if(!stage||!wrap) return;
    /* measure the painted box, not the window: inside a panel, an iframe or a
       zoomed view, window.innerWidth does not describe the area we can use. */
    const r = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.min(r.width,  wrap.clientWidth  || r.width));
    const h = Math.max(1, Math.min(r.height, wrap.clientHeight || r.height));
    const k = Math.min(w/1920, h/1080);
    const dx = Math.round((w - 1920*k) / 2);
    const dy = Math.round((h - 1080*k) / 2);
    stage.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')';
    stage.dataset.k = k.toFixed(4);
  }
  function watchSize(){
    const wrap = document.getElementById('stagewrap');
    if(!wrap) return;
    if(window.ResizeObserver){
      _ro = new ResizeObserver(()=>fit());
      _ro.observe(wrap);
      _ro.observe(document.documentElement);
    }
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) fit(); });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(()=>{});
    [60,250,900].forEach(ms=>setTimeout(fit, ms));
  }

  /* ---------- routing ---------- */
  function idxOf(id){ return SCENES.findIndex(s=>s.id===id); }
  function fromHash(first){
    const h = decodeURIComponent(location.hash.replace(/^#/,''));
    if(!h){ if(first) go(0,{replace:true}); return; }
    const [sid, st] = h.split('/');
    const i = idxOf(sid);
    if(i>=0) go(i,{step: st?parseInt(st,10)||0:0, silent:true});
  }
  function syncHash(replace){
    const s = SCENES[state.i]; if(!s) return;
    const h = '#'+s.id+(state.step?('/'+state.step):'');
    if(location.hash===h) return;
    if(replace) history.replaceState(null,'',h); else history.pushState(null,'',h);
  }

  function go(i, opt={}){
    if(i<0||i>=SCENES.length) return;
    state.i = i;
    state.step = opt.step!=null ? opt.step : 0;
    state.visited[SCENES[i].id] = 1;
    if(!opt.silent) syncHash(opt.replace);
    persist();
    onRender();
  }
  const next = () => {
    const s = SCENES[state.i];
    const total = s.steps||0;
    if(state.step < total){ state.step++; syncHash(true); persist(); onRender(); }
    else go(state.i+1);
  };
  const prev = () => {
    if(state.step>0){ state.step--; syncHash(true); persist(); onRender(); }
    else if(state.i>0){
      const p = SCENES[state.i-1];
      go(state.i-1, {step: (state.mode==='lecture' ? (p.steps||0) : 0)});
    }
  };
  const goId = (id, step) => { const i=idxOf(id); if(i>=0) go(i,{step:step||0}); closeAll(); };

  /* ---------- overlays ---------- */
  function open(id){
    closeAll();
    const el=document.getElementById(id); if(!el) return;
    el.classList.add('open');
    const f = el.querySelector('input,button,a'); if(f) f.focus();
  }
  function closeAll(){
    document.querySelectorAll('.overlay.open').forEach(e=>e.classList.remove('open'));
  }
  const anyOpen = () => !!document.querySelector('.overlay.open');

  /* ---------- keyboard ---------- */
  function bindKeys(){
    document.addEventListener('keydown', e=>{
      const tag=(e.target.tagName||'').toLowerCase();
      const typing = tag==='input'||tag==='textarea';
      if(e.key==='Escape'){ closeAll(); return; }
      if(typing) return;
      switch(e.key){
        case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); next(); break;
        case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
        case 'ArrowDown': e.preventDefault(); go(state.i+1); break;
        case 'ArrowUp': e.preventDefault(); go(state.i-1); break;
        case 'Home': e.preventDefault(); go(0); break;
        case 'End': e.preventDefault(); go(SCENES.length-1); break;
        case 'm': case 'M': e.preventDefault(); anyOpen()?closeAll():open('ov-map'); break;
        case '/': case 'f': case 'F': e.preventDefault(); open('ov-search'); break;
        case 'g': case 'G': e.preventDefault(); anyOpen()?closeAll():open('ov-gloss'); break;
        case '?': e.preventDefault(); anyOpen()?closeAll():open('ov-help'); break;
        case 'l': case 'L': toggleMode(); break;
        case 'i': case 'I': toggleEdition(); break;
        case 'r': case 'R': toggleMotion(); break;
        case 's': case 'S': toggleSidebar(); break;
        case 'd': case 'D': toggleTheme(); break;
        case 'p': case 'P': toggleDisplay(); break;
      }
    });
  }

  function toggleMode(){ state.mode = state.mode==='lecture'?'study':'lecture'; applyBodyFlags(); persist(); onRender(); }
  function toggleEdition(){ state.edition = state.edition==='student'?'instructor':'student'; applyBodyFlags(); persist(); onRender(); }
  function toggleMotion(){ state.motion = state.motion==='full'?'reduced':'full'; applyBodyFlags(); persist(); onRender(); }
  function toggleTheme(){ state.theme = state.theme==='light'?'dark':'light'; applyBodyFlags(); persist(); onRender(); }
  function toggleDisplay(){
    state.display = state.display==='normal'?'projector':'normal';
    /* the rail costs ~19% of linear size; give the scene the full width when
       projecting, and give it back when returning to normal */
    state.sidebar = state.display==='projector' ? 'off' : 'on';
    applyBodyFlags(); persist();
    requestAnimationFrame(()=>{ fit(); onRender(); });
  }
  function toggleSidebar(){ state.sidebar = state.sidebar==='on'?'off':'on'; applyBodyFlags(); persist();
    requestAnimationFrame(()=>{ fit(); onRender(); }); }

  function bindChrome(){
    document.addEventListener('click', e=>{
      const t = e.target.closest('[data-act]');
      if(!t) return;
      const a = t.dataset.act;
      if(a==='next') next();
      else if(a==='prev') prev();
      else if(a==='home') go(0);
      else if(a==='map') open('ov-map');
      else if(a==='search') open('ov-search');
      else if(a==='gloss') open('ov-gloss');
      else if(a==='help') open('ov-help');
      else if(a==='close') closeAll();
      else if(a==='mode') toggleMode();
      else if(a==='edition') toggleEdition();
      else if(a==='motion') toggleMotion();
      else if(a==='sidebar') toggleSidebar();
      else if(a==='theme') toggleTheme();
      else if(a==='display') toggleDisplay();
      else if(a==='goto') goId(t.dataset.id, parseInt(t.dataset.step||'0',10));
      else if(a==='sec'){ const n=t.dataset.sec;
        state.secOpen[n] = !secIsOpen(n); buildSidebar(); }
      else if(a==='reset'){ store.clear(); state.visited={}; state.quiz={}; persist(); onRender(); buildMap(); buildSidebar(); }
    });
    document.querySelectorAll('.overlay').forEach(ov=>{
      ov.addEventListener('click', e=>{ if(e.target===ov) closeAll(); });
    });
  }

  /* ---------- contents, shared by the rail and the map ----------
     Both surfaces list the same thing in the same order, so they are built
     from one pair of helpers. A scene title is typeset rather than
     interpolated: several of them carry mathematics, and a raw field would
     print the dollar signs (R8).

     The textbook anchor is deliberately absent here. It belongs on the scene
     itself, in the eyebrow band, where a reader who wants the long treatment is
     actually working. In a contents rail it competed with the titles for a
     narrow column and pushed half of them onto a second line. */
  function label(s){
    return `<span class="cnum">${s.sec||''}</span>`
         + `<span class="ctitle">${RENDER.md(s.nav||s.title||s.id)}</span>`;
  }

  /* A section is open when the reader has said so, and otherwise when the scene
     on screen is inside it. That keeps the rail short enough to scan while never
     hiding where the reader currently stands. */
  function secIsOpen(n){
    if(n in state.secOpen) return state.secOpen[n];
    const cur = SCENES[state.i];
    return !!(cur && cur.sec && cur.sec.indexOf(n+'.') === 0);
  }
  /* The question scenes bracket a chapter: the taxonomy of question types is
     read before the teaching scenes, the questions themselves are worked after
     them. `row` is given the scene, not a position, so both surfaces place
     them the same way. */
  function chapterRows(ch, row, head, collapse){
    const out = [];
    if(ch.q.map) out.push(row(ch.q.map));
    ch.sections.forEach(sec=>{
      const titled = !ch.flat && sec.title;
      const open = !collapse || !titled || secIsOpen(sec.n);
      if(titled) out.push(head(sec, open));
      if(open) sec.scenes.forEach(s=>out.push(row(s, titled)));
    });
    if(ch.q.drill) out.push(row(ch.q.drill));
    return out.join('');
  }

  /* ---------- course map ---------- */
  function buildMap(){
    const host = document.getElementById('mapgrid'); if(!host) return;
    host.innerHTML = CHAPTERS.map(ch=>{
      const rows = chapterRows(ch,
        s => `<li><a data-act="goto" data-id="${s.id}"
                class="${state.visited[s.id]?'done':''}" tabindex="0">${label(s)}</a></li>`,
        sec => `<li class="csec"><span class="cnum">${sec.n}</span>${RENDER.md(sec.title)}</li>`,
        false);
      if(!rows) return '';
      return `<div class="mapmod">
        <h4>${ch.n}</h4><p class="mt">${RENDER.md(ch.title)}</p>
        <ol>${rows}</ol>
      </div>`;
    }).join('');
  }

  /* ---------- contents rail ---------- */
  function buildSidebar(){
    const host = document.getElementById('sidenav');
    if(!host || state.sidebar!=='on') return;
    const cur = SCENES[state.i] || {};
    host.innerHTML = CHAPTERS.map(ch=>{
      const rows = chapterRows(ch,
        /* A scene inside an open section is marked, so the rail can draw a
           rule down the left of the run and show where the section ends. */
        (s, inSec) => `<li class="${inSec?'insec':''}"><a data-act="goto" data-id="${s.id}" tabindex="0"
                class="${s.id===cur.id?'on':''}${state.visited[s.id]?' seen':''}"
                >${label(s)}</a></li>`,
        (sec, open) => `<li class="csec"><button type="button" data-act="sec" data-sec="${sec.n}"
                aria-expanded="${open}" class="${open?'open':''}"
                ><span class="cnum">${sec.n}</span><span class="ctitle">${RENDER.md(sec.title)}</span
                ><span class="ccaret" aria-hidden="true"></span></button></li>`,
        true);
      if(!rows) return '';
      return `<div class="sgroup">
        <div class="sgh"><span class="sid">${ch.n}</span>${RENDER.md(ch.title)}</div>
        <ol>${rows}</ol></div>`;
    }).join('');
    const on = host.querySelector('a.on');
    if(on) on.scrollIntoView({block:'nearest'});
  }

  /* ---------- full-text search ---------- */
  function buildSearchIndex(){
    return SCENES.map((s,i)=>({
      i, id:s.id, title:s.title||s.nav||s.id, module:s.module,
      hay:( (s.title||'')+' '+(s.nav||'')+' '+(s.objective||'')+' '+(s.keywords||'')+' '+
            (s.src||'')+' '+(s.searchText||'') ).toLowerCase()
    }));
  }
  function wireSearch(){
    const box=document.getElementById('searchbox'), out=document.getElementById('sresults');
    if(!box) return;
    const idx = buildSearchIndex();
    let sel = 0;
    const draw = q=>{
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = (terms.length? idx.filter(r=>terms.every(t=>r.hay.includes(t))) : idx).slice(0,60);
      sel = 0;
      out.innerHTML = hits.length? hits.map((r,k)=>`<div class="sres ${k===0?'on':''}" data-act="goto" data-id="${r.id}">
        <div class="t">${r.title}</div><div class="m">${r.module} · scene ${r.i+1}</div></div>`).join('')
        : `<div class="sres"><div class="t">No match.</div><div class="m">Try a symbol, a property name, or a question id such as D1-07.</div></div>`;
    };
    draw('');
    box.addEventListener('input', ()=>draw(box.value));
    box.addEventListener('keydown', e=>{
      const items=[...out.querySelectorAll('.sres')];
      if(e.key==='ArrowDown'){ e.preventDefault(); sel=Math.min(sel+1,items.length-1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); sel=Math.max(sel-1,0); }
      else if(e.key==='Enter'){ e.preventDefault(); items[sel]&&items[sel].click(); return; }
      else return;
      items.forEach((el,k)=>el.classList.toggle('on',k===sel));
      items[sel]&&items[sel].scrollIntoView({block:'nearest'});
    });
  }

  return { state, init, go, goId, next, prev, open, closeAll, buildMap, buildSidebar, wireSearch,
           persist, store, fit, idxOf,
           scenes:()=>SCENES, modules:()=>MODULES };
})();
