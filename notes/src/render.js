/* Lecture notes — block renderer */
(function(){
  /* Mathematics that does not parse is reported to the console before it falls
     back, so that a broken formula shows up in the build instead of on the page. */
  const OPT={strict:false,macros:{'\\d':'\\mathrm{d}','\\Ev':'\\mathcal{E}\\mathrm{v}','\\Od':'\\mathcal{O}\\mathrm{d}'}};
  const T=(s,d)=>{ try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:true},OPT)); }
      catch(e){ console.error('NOTES: mathematics is not valid TeX: '+s+' — '+e.message);
                try{ return katex.renderToString(s,Object.assign({displayMode:!!d,throwOnError:false},OPT)); }
                catch(e2){ return '<code>'+s+'</code>'; } } };
  const md = t => String(t==null?'':t)
      .replace(/\$\$([^$]+)\$\$/g,(m,a)=>T(a,true))
      .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false));

  const R = {
    page:   ()=>'</div><div class="page">',
    title:  b=>`<div class="title"><div class="mark"><svg class="eelogo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
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
</svg></div><p class="kicker">${md(b.kicker)}</p>
       <h1 class="doc">${md(b.text)}</h1>${b.sub?`<p class="lead">${md(b.sub)}</p>`:''}
       ${b.meta?`<div class="meta">${b.meta.map(([k,v])=>`<div><b>${md(k)}</b>${md(v)}</div>`).join('')}</div>`:''}</div>`,
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
