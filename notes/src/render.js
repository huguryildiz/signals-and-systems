/* Lecture notes — block renderer */
(function(){
  /* Mathematics that does not parse is reported to the console before it falls
     back, so that a broken formula shows up in the build instead of on the page. */
  const OPT={strict:false,macros:{'\\d':'\\mathrm{d}','\\Ev':'\\mathcal{E}\\mathrm{v}','\\Od':'\\mathcal{O}\\mathrm{dd}'}};
  const T=(s,d)=>{ try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:true},OPT)); }
      catch(e){ console.error('NOTES: mathematics is not valid TeX: '+s+' — '+e.message);
                try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:false},OPT)); }
                catch(e2){ return '<code>'+s+'</code>'; } } };
  const md = t => String(t==null?'':t)
      .replace(/\$\$([^$]+)\$\$/g,(m,a)=>T(a,true))
      .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false));

  /* One version history for every printed document, newest first. It is set as
     a table on the last page of each. Add a row here for each new release. */
  window.DOC_HISTORY = [
    ['v0', '23 September 2026', 'First edition.']
  ];

  const LOGO = `<svg class="eelogo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="eelogo-gf" gradientUnits="userSpaceOnUse" x1="10" y1="6" x2="56" y2="60"><stop offset="0"    stop-color="#6EE7A5"/><stop offset="0.36" stop-color="#6AA8F7"/><stop offset="0.68" stop-color="#A78BE8"/><stop offset="1"    stop-color="#F2A25C"/></linearGradient>
<linearGradient id="eelogo-gt" gradientUnits="userSpaceOnUse" x1="10" y1="25" x2="54" y2="41"><stop offset="0"    stop-color="#6EE7A5"/><stop offset="0.36" stop-color="#6AA8F7"/><stop offset="0.68" stop-color="#A78BE8"/><stop offset="1"    stop-color="#F2A25C"/></linearGradient>
<filter id="eelogo-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.7"/></filter>
</defs>
<rect x="4" y="4" width="56" height="56" rx="18" fill="#0A0D13"/>
<rect x="4" y="4" width="56" height="56" rx="18" fill="none" stroke="url(#eelogo-gf)" stroke-width="2.2"/>
<g class="eelogo-beat">
<path class="eelogo-halo" d="M10 41 C10.18 40.81 10.73 40.2 11.1 39.83 C11.47 39.47 11.83 39.08 12.2 38.81 C12.57 38.53 12.93 38.28 13.3 38.16 C13.67 38.05 14.03 38.01 14.4 38.1 C14.77 38.19 15.13 38.4 15.5 38.7 C15.87 39 16.23 39.44 16.6 39.92 C16.97 40.4 17.33 41.01 17.7 41.59 C18.07 42.17 18.43 42.83 18.8 43.39 C19.17 43.95 19.53 44.54 19.9 44.95 C20.27 45.37 20.63 45.73 21 45.88 C21.37 46.03 21.73 46.05 22.1 45.83 C22.47 45.62 22.83 45.21 23.2 44.59 C23.57 43.96 23.93 43.11 24.3 42.09 C24.67 41.07 25.03 39.82 25.4 38.49 C25.77 37.15 26.13 35.61 26.5 34.1 C26.87 32.58 27.23 30.92 27.6 29.4 C27.97 27.87 28.33 26.29 28.7 24.93 C29.07 23.57 29.43 22.27 29.8 21.26 C30.17 20.24 30.53 19.38 30.9 18.84 C31.27 18.3 31.63 18 32 18 C32.37 18 32.73 18.3 33.1 18.84 C33.47 19.38 33.83 20.24 34.2 21.26 C34.57 22.27 34.93 23.57 35.3 24.93 C35.67 26.29 36.03 27.87 36.4 29.4 C36.77 30.92 37.13 32.58 37.5 34.1 C37.87 35.61 38.23 37.15 38.6 38.49 C38.97 39.82 39.33 41.07 39.7 42.09 C40.07 43.11 40.43 43.96 40.8 44.59 C41.17 45.21 41.53 45.62 41.9 45.83 C42.27 46.05 42.63 46.03 43 45.88 C43.37 45.73 43.73 45.37 44.1 44.95 C44.47 44.54 44.83 43.95 45.2 43.39 C45.57 42.83 45.93 42.17 46.3 41.59 C46.67 41.01 47.03 40.4 47.4 39.92 C47.77 39.44 48.13 39 48.5 38.7 C48.87 38.4 49.23 38.19 49.6 38.1 C49.97 38.01 50.33 38.05 50.7 38.16 C51.07 38.28 51.43 38.53 51.8 38.81 C52.17 39.08 52.53 39.47 52.9 39.83 C53.27 40.2 53.82 40.81 54 41"/>
<path class="eelogo-trace" d="M10 41 C10.18 40.81 10.73 40.2 11.1 39.83 C11.47 39.47 11.83 39.08 12.2 38.81 C12.57 38.53 12.93 38.28 13.3 38.16 C13.67 38.05 14.03 38.01 14.4 38.1 C14.77 38.19 15.13 38.4 15.5 38.7 C15.87 39 16.23 39.44 16.6 39.92 C16.97 40.4 17.33 41.01 17.7 41.59 C18.07 42.17 18.43 42.83 18.8 43.39 C19.17 43.95 19.53 44.54 19.9 44.95 C20.27 45.37 20.63 45.73 21 45.88 C21.37 46.03 21.73 46.05 22.1 45.83 C22.47 45.62 22.83 45.21 23.2 44.59 C23.57 43.96 23.93 43.11 24.3 42.09 C24.67 41.07 25.03 39.82 25.4 38.49 C25.77 37.15 26.13 35.61 26.5 34.1 C26.87 32.58 27.23 30.92 27.6 29.4 C27.97 27.87 28.33 26.29 28.7 24.93 C29.07 23.57 29.43 22.27 29.8 21.26 C30.17 20.24 30.53 19.38 30.9 18.84 C31.27 18.3 31.63 18 32 18 C32.37 18 32.73 18.3 33.1 18.84 C33.47 19.38 33.83 20.24 34.2 21.26 C34.57 22.27 34.93 23.57 35.3 24.93 C35.67 26.29 36.03 27.87 36.4 29.4 C36.77 30.92 37.13 32.58 37.5 34.1 C37.87 35.61 38.23 37.15 38.6 38.49 C38.97 39.82 39.33 41.07 39.7 42.09 C40.07 43.11 40.43 43.96 40.8 44.59 C41.17 45.21 41.53 45.62 41.9 45.83 C42.27 46.05 42.63 46.03 43 45.88 C43.37 45.73 43.73 45.37 44.1 44.95 C44.47 44.54 44.83 43.95 45.2 43.39 C45.57 42.83 45.93 42.17 46.3 41.59 C46.67 41.01 47.03 40.4 47.4 39.92 C47.77 39.44 48.13 39 48.5 38.7 C48.87 38.4 49.23 38.19 49.6 38.1 C49.97 38.01 50.33 38.05 50.7 38.16 C51.07 38.28 51.43 38.53 51.8 38.81 C52.17 39.08 52.53 39.47 52.9 39.83 C53.27 40.2 53.82 40.81 54 41"/>
</g>
</svg>`;

  /* Cover artwork in page millimetres (210 x 297). Baseline at y0; the sinc has
     its main lobe at xc and zero crossings every T; the coral stems are its
     samples at spacing T/2, so every dot sits on the teal curve. */
  const COVER_ART = ()=>{
    const y0=222, xc=105, T=15, A=58, f=v=>v.toFixed(2), f3=v=>v.toFixed(3);
    const sinc=u=>u===0?1:Math.sin(Math.PI*u)/(Math.PI*u);
    const sy=x=>y0-A*sinc((x-xc)/T);
    const dy=x=>{const t=x+5; return y0-30*Math.exp(-t/85)*Math.cos(2*Math.PI*t/31);};
    /* Everything is plain vector with constant-opacity strokes, so PDF viewers
       draw the cover at once. Masks, blur filters and translucent gradients all
       make Chrome's print path emit bitmaps or soft masks that render slowly.
       So the fades are stepped opacities and the glow is a stack of wide strokes. */
    const lerp=(st,t)=>{ for(let i=1;i<st.length;i++) if(t<=st[i][0]){ const [t0,v0]=st[i-1],[t1,v1]=st[i];
      return v0+(v1-v0)*(t-t0)/(t1-t0); } return st[st.length-1][1]; };
    const hw=x=>lerp([[0,0],[29.4,1],[180.6,1],[210,0]],Math.min(210,Math.max(0,x)));  /* side fade */
    const vw=y=>lerp([[0,.25],[148.5,.6],[237.6,1],[297,.2]],y);                       /* grid fade */
    const bins=[]; for(let x=0;x<29.4-1e-6;x+=2.1) bins.push([x,x+2.1]);
    bins.push([29.4,180.6]); for(let x=180.6;x<210-1e-6;x+=2.1) bins.push([x,x+2.1]);
    /* one path per bin, each with the fade weight at its centre (mid bin weight 1) */
    /* the first and last edge of each piece is 0.01 mm long, so neighbouring
       butt ends meet at the same angle and wide strokes leave no wedge between them */
    const pieces=g=>bins.map(([a,z])=>{ const n=Math.max(2,Math.ceil((z-a)/0.5)); const xs=[a,a+.01];
      for(let i=1;i<n;i++) xs.push(a+(z-a)*i/n); xs.push(z-.01,z);
      return [xs.map((x,i)=>(i?'L':'M')+f3(x)+' '+f3(g(x))).join(''),hw((a+z)/2)]; });
    /* The glow is wider than the curve's bend at its peaks, so cutting it into
       pieces would fold neighbouring pieces over each other. Each fade bin draws
       it whole (padded past the bin) and clips it to the bin's strip instead. */
    const clips=bins.map(([a,z],i)=>`<clipPath id="cv-c${i}"><rect x="${a}" y="0" width="${f(z-a)}" height="297"/></clipPath>`).join('');
    const glowd=(g,a,z)=>{ let d=''; for(let x=a;x<=z+1e-6;x+=.5) d+=(d?'L':'M')+f(x)+' '+f(g(x)); return d; };
    const trace=(g,c,o,w,glow)=>{ let s='';
      if(glow) s+=bins.map(([a,z],i)=>{ const d=glowd(g,a-4,z+4), h=hw((a+z)/2);
        return `<g clip-path="url(#cv-c${i})">`+[[7,.06],[6,.07],[5,.08],[4.2,.09],[3.4,.1],[2.6,.11],[1.9,.12],[1.3,.13]]
          .map(([gw,k])=>`<path d="${d}" stroke="${c[1]}" stroke-opacity="${f3(glow*k*h)}" stroke-width="${gw}"/>`).join('')+'</g>'; }).join('');
      return s+pieces(g).map(([d,h])=>`<path d="${d}" stroke="${c[0]}" stroke-opacity="${f3(o*h)}" stroke-width="${w}"/>`).join(''); };
    let grid='', stems='';
    for(let x=0;x<=210;x+=7.5) for(let y=0;y<297;y+=15)
      grid+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${Math.min(297,y+15)}" stroke-opacity="${f3(.075*vw(y+7.5))}"/>`;
    for(let y=y0%7.5;y<=297;y+=7.5) grid+=`<line x1="0" y1="${f(y)}" x2="210" y2="${f(y)}" stroke-opacity="${f3(.075*vw(y))}"/>`;
    for(let x=xc-13*T/2;x<=xc+13*T/2+1e-6;x+=T/2){ const y=sy(x), h=hw(x);
      stems+=`<line x1="${f(x)}" y1="${y0}" x2="${f(x)}" y2="${f(y)}" stroke-opacity="${f3(.85*h)}"/><circle cx="${f(x)}" cy="${f(y)}" r="0.9" fill-opacity="${f3(h)}" stroke-opacity="${f3(.85*h)}"/>`; }
    return `<svg class="cv-art" viewBox="0 0 210 297" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs>
<radialGradient id="cv-bg" cx="50%" cy="68%" r="75%"><stop offset="0" stop-color="#173C5E"/><stop offset=".55" stop-color="#0F2640"/><stop offset="1" stop-color="#08121E"/></radialGradient>${clips}
</defs>
<rect width="210" height="297" fill="url(#cv-bg)"/>
<g stroke="#9FB6CC" stroke-width=".18">${grid}</g>
<g fill="none" stroke-linejoin="round">
${trace(()=>y0,['#C9D4DE'],.32,.25)}
${trace(dy,['#E0B070','#E0B070'],.78,.42,.35)}
<g stroke="#E09A6A" stroke-width=".38" fill="#F2B48A">${stems}</g>
${trace(sy,['#8AD6E0','#6FC3CF'],1,.55,.45)}
</g>
</svg>`;
  };

  const R = {
    page:   ()=>'</div><div class="page">',
    title:  b=>`<div class="title"><div class="mark">${LOGO}</div><p class="kicker">${md(b.kicker)}</p>
       <h1 class="doc">${md(b.text)}</h1>${b.sub?`<p class="lead">${md(b.sub)}</p>`:''}
       ${b.meta?`<div class="meta">${b.meta.map(([k,v])=>`<div><b>${md(k)}</b>${md(v)}</div>`).join('')}</div>`:''}
       <div class="title-credit">© 2026 <a href="https://huguryildiz.com/">Hüseyin Uğur Yıldız</a> · <a href="https://huguryildiz.com/">huguryildiz.com</a><br>
       Course content: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a></div></div>`,
    /* The front cover is a full-bleed page of its own (named page `cover`, no
       margins, so no running footer). Its artwork is drawn from the functions it
       shows: a sinc pulse, its samples, and a damped cosine behind them. */
    cover:  b=>`<div class="cover">${COVER_ART()}
       <div class="cv-top"><div class="mark">${LOGO}</div><p class="kicker">${md(b.kicker)}</p></div>
       <div class="cv-title"><h1 class="doc">${md(b.text)}</h1><div class="cv-rule"></div>
       ${b.sub?`<p class="cv-sub">${md(b.sub)}</p>`:''}</div>
       <div class="cv-foot">${b.foot?`<div class="cv-ed">${md(b.foot)}</div>`:''}
       <div class="cv-credit">© 2026 <a href="https://huguryildiz.com/">huguryildiz.com</a> · Course content: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a></div></div></div>`,
    /* Last-page colophon: document name, version, licence. */
    colophon: b=>`<div class="colophon"><div class="mark">${LOGO}</div>
       <p class="cl-doc">Signals and Systems &middot; ${md(b.doc)}</p>
       <table class="cl-hist"><tr><th>Version</th><th>Date</th><th>Changes</th></tr>${
         window.DOC_HISTORY.map(([v,d,c])=>`<tr><td>${md(v)}</td><td>${md(d)}</td><td>${md(c)}</td></tr>`).join('')}</table>
       <p>© 2026 <a href="https://huguryildiz.com/">huguryildiz.com</a> · Course content: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a></p></div>`,
    h1:     b=>`<h1>${b.num?`<span class="num">${b.num}</span>`:''}${md(b.text)}</h1>${b.rule!==false?'<hr class="thick">':''}`,
    h2:     b=>`<h2>${b.num?`<span class="num">${b.num}</span>`:''}${md(b.text)}</h2>`,
    h3:     b=>`<h3>${md(b.text)}</h3>`,
    p:      b=>`<p${b.lead?' class="lead"':''}>${md(b.text)}</p>`,
    ul:     b=>`<ul>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ul>`,
    ol:     b=>`<ol>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ol>`,
    eq:     b=>`<div class="eq ${b.big?'big':''}">${T(b.tex,true)}</div>`,
    eqbox:  b=>`<div class="eqbox">${b.cap?`<div class="cap">${md(b.cap)}</div>`:''}
       ${(Array.isArray(b.tex)?b.tex:[b.tex]).map(t=>`<div class="eq ${b.big?'big':''}">${T(t,true)}</div>`).join('')}
       ${b.after?`<div class="after">${md(b.after)}</div>`:''}</div>`,
    box:    b=>`<div class="box ${b.kind||''}">${b.hd?`<span class="t">${md(b.hd)}</span>`:''}${md(b.html)}</div>`,
    ex:     b=>`<div class="ex"><div class="h">${md(b.hd||'Example')}</div><dl>${
       b.rows.map(([k,v])=>`<dt>${md(k)}</dt><dd>${md(v)}</dd>`).join('')}</dl></div>`,
    fig:    b=>`<figure>${typeof b.svg==='function'?b.svg():b.svg}
       ${b.cap?`<figcaption>${md(b.cap)}</figcaption>`:''}</figure>`,
    figrow: b=>`<div class="figrow ${b.n===3?'three':'two'}">${b.items.map(it=>
       `<figure>${typeof it.svg==='function'?it.svg():it.svg}${it.cap?`<figcaption>${md(it.cap)}</figcaption>`:''}</figure>`).join('')}</div>`,
    table:  b=>`<table>${b.head?`<tr>${b.head.map(h=>`<th>${md(h)}</th>`).join('')}</tr>`:''}
       ${b.rows.map(r=>`<tr>${r.map(c=>`<td>${md(c)}</td>`).join('')}</tr>`).join('')}</table>`,
    /* A contents row is number, title, summary and — where the same material is
       developed at length in the course textbook — an anchor into it. The anchor
       always carries its `OW` marker: these chapter numbers and the textbook's do
       not agree, and a bare section mark would read as one of these.
       The anchor is written before the summary so that grid auto-placement puts
       it on the title line; the summary then spans the two columns beneath. */
    toc:    b=>`<div class="toc">${b.items.map(([n,t,s,a])=>
       `<div class="c"><div class="n">${md(n)}</div><div class="t">${md(t)}</div>${
         `<div class="a">${a?md(a):''}</div>`}<div class="s">${md(s)}</div></div>`).join('')}</div>`,
    hr:     ()=>'<hr>',
    q:      b=>`<div class="q"><span class="n">${b.n}</span> ${md(b.text)}${
       b.ans?`<div class="ans">Answer: ${md(b.ans)}</div>`:''}</div>`,
    raw:    b=>b.html
  };

  /* The three document editions build their own blocks from CONTENT, so they need
     the same inline renderer the block types use. One renderer, one behaviour. */
  window.renderInline = md;

  window.renderNotes = function(blocks, host){
    host.innerHTML = '<div class="page">' + blocks.map(b=>{
      const f=R[b.t]; return f?f(b):'';
    }).join('') + '</div>';
  };
})();
