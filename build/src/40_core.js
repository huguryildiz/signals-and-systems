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
    pointer: 'laser',   // 'laser' | 'arrow'  — projector mode only
    trail:   'fade',    // 'fade' | 'hold' | 'off' — ink drawn while the button is held
    trailSec: 3,        // seconds a faded trail stays fully visible
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
      pointer: saved.pointer || 'laser',
      trail:   saved.trail==='on' ? 'fade' : (saved.trail || 'fade'),
      trailSec: saved.trailSec || 3,
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
                  theme:state.theme, display:state.display, pointer:state.pointer, trail:state.trail, trailSec:state.trailSec,
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
    document.body.dataset.pointer = state.pointer;
    document.body.dataset.trail = state.trail;
    laser.sync();
  }

  /* ---------- laser pointer, projector mode only ----------
     In front of a class the pointer is an instrument, not a control: the
     system arrow is too small to follow from the back of a room. In
     projector mode it becomes a red dot. Holding the mouse button down draws
     with it. Strokes accumulate and fade together after a pause, or remain
     until cleared, according to the header control. Everything is drawn on
     one fixed canvas above the page that takes no clicks, so nothing else
     changes. Under reduced motion the stroke is left out and only the dot is
     drawn. */
  const laser = (() => {
    const FADE = 900, KEEP = 6000;
    const hold = () => state.trailSec*1000;
    let cv=null, cx=null, on=false, raf=0, dpr=1, W=0, H=0;
    let head=null, drawing=false, released=0;
    const strokes = [];
    function count(){ let n=0; for(const s of strokes) n+=s.length; return n; }
    function drop(){
      while(count()>KEEP && strokes.length){
        strokes[0].shift();
        if(strokes[0].length<2) strokes.shift();
      }
    }
    function size(){
      dpr = Math.min(window.devicePixelRatio||1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
      cv.style.width = W+'px'; cv.style.height = H+'px';
      cx.setTransform(dpr,0,0,dpr,0,0);
    }
    function frame(){
      raf = 0;
      const keep = state.trail==='hold';
      const idle = (drawing||keep) ? 0 : performance.now() - released;
      let a = idle<=hold() ? 1 : 1 - (idle-hold())/FADE;
      if(a<=0){ a=0; strokes.length=0; }
      cx.clearRect(0,0,W,H);
      if(a>0 && strokes.length && state.trail!=='off' && state.motion==='full'){
        cx.lineCap='round'; cx.lineJoin='round'; cx.globalAlpha=a;
        cx.beginPath();
        for(const pts of strokes){
          if(pts.length<2) continue;
          cx.moveTo(pts[0].x, pts[0].y);
          for(let k=1;k<pts.length-1;k++) cx.quadraticCurveTo(pts[k].x,pts[k].y,(pts[k].x+pts[k+1].x)/2,(pts[k].y+pts[k+1].y)/2);
          const b=pts[pts.length-1]; cx.lineTo(b.x,b.y);
        }
        cx.strokeStyle='rgba(255,66,44,0.26)'; cx.lineWidth=21; cx.stroke();
        cx.strokeStyle='rgba(228,38,22,0.94)'; cx.lineWidth=11; cx.stroke();
        cx.strokeStyle='rgba(255,231,226,0.96)'; cx.lineWidth=4; cx.stroke();
        cx.globalAlpha=1;
      }
      if(head){
        const g=cx.createRadialGradient(head.x,head.y,0,head.x,head.y,19);
        g.addColorStop(0,'rgba(255,236,230,1)');
        g.addColorStop(.10,'rgba(255,64,40,1)');
        g.addColorStop(.32,'rgba(214,45,32,.92)');
        g.addColorStop(.55,'rgba(214,45,32,.32)');
        g.addColorStop(1,'rgba(214,45,32,0)');
        cx.fillStyle=g; cx.beginPath(); cx.arc(head.x,head.y,19,0,Math.PI*2); cx.fill();
      }
      if(!drawing && state.trail!=='hold' && a>0 && strokes.length) raf=requestAnimationFrame(frame);
    }
    function tick(){ if(!raf) raf=requestAnimationFrame(frame); }
    function mouse(e){ return !e.pointerType || e.pointerType==='mouse' || e.pointerType==='pen'; }
    function move(e){
      if(!mouse(e)) return;
      head={x:e.clientX,y:e.clientY};
      if(drawing){ strokes[strokes.length-1].push(head); drop(); }
      tick();
    }
    function down(e){
      if(!mouse(e)||e.button!==0) return;
      if(!drawing && state.trail!=='hold' && performance.now()-released>hold()) strokes.length=0;
      drawing=true; head={x:e.clientX,y:e.clientY}; strokes.push([head]); tick();
    }
    function up(){ if(!drawing) return; drawing=false; released=performance.now(); tick(); }
    function leave(){ if(drawing){ drawing=false; released=performance.now(); } head=null; tick(); }
    function start(){
      if(on || !window.matchMedia || !matchMedia('(pointer:fine)').matches) return;
      if(!cv){ cv=document.createElement('canvas'); cv.id='laser'; cv.setAttribute('aria-hidden','true'); document.body.appendChild(cv); cx=cv.getContext('2d'); }
      on=true; cv.style.display='block'; size();
      window.addEventListener('pointermove',move,{passive:true});
      window.addEventListener('pointerdown',down,{passive:true});
      window.addEventListener('pointerup',up,{passive:true});
      window.addEventListener('pointercancel',up,{passive:true});
      document.addEventListener('mouseleave',leave); window.addEventListener('blur',leave); window.addEventListener('resize',size);
    }
    function stop(){
      if(!on) return;
      on=false; window.removeEventListener('pointermove',move); window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up);
      document.removeEventListener('mouseleave',leave); window.removeEventListener('blur',leave); window.removeEventListener('resize',size);
      if(raf){ cancelAnimationFrame(raf); raf=0; } leave(); if(cv) cv.style.display='none';
    }
    return { sync(){ (state.display==='projector'&&state.pointer==='laser') ? start() : stop(); }, clear(){ if(on&&strokes.length){ strokes.length=0; drawing=false; tick(); } } };
  })();

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
    /* A practice-question page scrolls rather than scales, so on a window taller
       than 16:9 the stage grows downward to the window's foot instead of
       leaving a letterbox band under the question. */
    const tall = !!stage.querySelector('.dr-page');
    const H = tall ? Math.max(1080, h/k) : 1080;
    stage.style.height = tall ? H + 'px' : '';
    const dx = Math.round((w - 1920*k) / 2);
    const dy = Math.round((h - H*k) / 2);
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
    if(i!==state.i) laser.clear();
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
      /* a focused button on the slide (a prediction, a sound) takes its own Space */
      if(e.key===' ' && tag==='button' && e.target.closest('#scene-host')) return;
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
        case 't': case 'T': toggleTrail(); break;
        case 'c': case 'C': laser.clear(); break;
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
  function togglePointer(){ state.pointer=state.pointer==='laser'?'arrow':'laser'; applyBodyFlags(); persist(); onRender(); }
  function toggleTrail(){
    state.trail=state.trail==='fade'?'hold':state.trail==='hold'?'off':'fade';
    if(state.trail==='off') laser.clear();
    applyBodyFlags(); persist(); onRender();
  }
  function toggleSidebar(){ state.sidebar = state.sidebar==='on'?'off':'on'; applyBodyFlags(); persist();
    requestAnimationFrame(()=>{ fit(); onRender(); }); }

  function bindChrome(){
    document.addEventListener('input', e=>{
      if(e.target.id!=='trail-sec') return;
      state.trailSec = +e.target.value; e.target.nextElementSibling.textContent = state.trailSec+' s'; persist();
    });
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
      else if(a==='pointer') togglePointer();
      else if(a==='trail') toggleTrail();
      else if(a==='goto') goId(t.dataset.id, parseInt(t.dataset.step||'0',10));
      else if(a==='sec'){ const n=t.dataset.sec;
        state.secOpen[n] = !secIsOpen(n); buildSidebar(); }
      else if(a==='reset'){ store.clear(); state.visited={}; state.quiz={}; persist(); onRender(); buildMap(); buildSidebar(); }
    });
    document.querySelectorAll('.overlay').forEach(ov=>{
      ov.addEventListener('click', e=>{ if(e.target===ov) closeAll(); });
    });
    /* page box in the footer: type a number, Enter jumps, Escape restores */
    const pb = document.getElementById('pagebox');
    if(pb){
      pb.addEventListener('focus', ()=>pb.select());
      pb.addEventListener('keydown', e=>{
        if(e.key==='Enter'){
          const k = parseInt(pb.value,10);
          if(k>=1 && k<=SCENES.length) go(k-1);
          pb.blur();
        } else if(e.key==='Escape') pb.blur();
      });
      pb.addEventListener('blur', ()=>{ pb.value = state.i+1; });
    }
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

  /* A section is open unless the reader has closed it, so the whole contents
     are visible on arrival. */
  function secIsOpen(n){
    if(n in state.secOpen) return state.secOpen[n];
    return true;
  }
  /* The practice questions follow the teaching scenes. `row` is given the
     scene, not a position, so both surfaces place it the same way. */
  function chapterRows(ch, row, head, collapse){
    const out = [];
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
