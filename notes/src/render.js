/* EE311 lecture notes — block renderer */
(function(){
  const T=(s,d)=>{ try{ return katex.renderToString(s,{displayMode:!!d,throwOnError:false,strict:false,
      macros:{'\\d':'\\mathrm{d}','\\Ev':'\\mathcal{E}\\mathrm{v}','\\Od':'\\mathcal{O}\\mathrm{d}'}}); }
      catch(e){ return '<code>'+s+'</code>'; } };
  const md = t => String(t==null?'':t)
      .replace(/\$\$([^$]+)\$\$/g,(m,a)=>T(a,true))
      .replace(/\$([^$]+)\$/g,(m,a)=>T(a,false));

  const R = {
    page:   ()=>'</div><div class="page">',
    title:  b=>`<div class="title"><p class="kicker">${b.kicker||''}</p>
       <h1 class="doc">${md(b.text)}</h1>${b.sub?`<p class="lead">${md(b.sub)}</p>`:''}
       ${b.meta?`<div class="meta">${b.meta.map(([k,v])=>`<div><b>${k}</b>${v}</div>`).join('')}</div>`:''}</div>`,
    h1:     b=>`<h1>${b.num?`<span class="num">${b.num}</span>`:''}${md(b.text)}</h1>${b.rule!==false?'<hr class="thick">':''}`,
    h2:     b=>`<h2>${b.num?`<span class="num">${b.num}</span>`:''}${md(b.text)}</h2>`,
    h3:     b=>`<h3>${md(b.text)}</h3>`,
    p:      b=>`<p${b.lead?' class="lead"':''}>${md(b.text)}</p>`,
    ul:     b=>`<ul>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ul>`,
    ol:     b=>`<ol>${b.items.map(i=>`<li>${md(i)}</li>`).join('')}</ol>`,
    eq:     b=>`<div class="eq ${b.big?'big':''}">${T(b.tex,true)}</div>`,
    eqbox:  b=>`<div class="eqbox">${b.cap?`<div class="cap">${b.cap}</div>`:''}
       ${(Array.isArray(b.tex)?b.tex:[b.tex]).map(t=>`<div class="eq ${b.big?'big':''}">${T(t,true)}</div>`).join('')}
       ${b.after?`<div class="after">${md(b.after)}</div>`:''}</div>`,
    box:    b=>`<div class="box ${b.kind||''}">${b.hd?`<span class="t">${b.hd}</span>`:''}${md(b.html)}</div>`,
    ex:     b=>`<div class="ex"><div class="h">${b.hd||'Example'}</div><dl>${
       b.rows.map(([k,v])=>`<dt>${k}</dt><dd>${md(v)}</dd>`).join('')}</dl></div>`,
    fig:    b=>`<figure>${typeof b.svg==='function'?b.svg():b.svg}
       ${b.cap?`<figcaption>${md(b.cap)}</figcaption>`:''}</figure>`,
    figrow: b=>`<div class="figrow ${b.n===3?'three':'two'}">${b.items.map(it=>
       `<figure>${typeof it.svg==='function'?it.svg():it.svg}${it.cap?`<figcaption>${md(it.cap)}</figcaption>`:''}</figure>`).join('')}</div>`,
    table:  b=>`<table>${b.head?`<tr>${b.head.map(h=>`<th>${md(h)}</th>`).join('')}</tr>`:''}
       ${b.rows.map(r=>`<tr>${r.map(c=>`<td>${md(c)}</td>`).join('')}</tr>`).join('')}</table>`,
    toc:    b=>`<div class="toc">${b.items.map(([n,t,s])=>
       `<div class="c"><div class="n">${n}</div><div class="t">${t}</div><div class="s">${s}</div></div>`).join('')}</div>`,
    hr:     ()=>'<hr>',
    q:      b=>`<div class="q"><span class="n">${b.n}</span> ${md(b.text)}${
       b.ans?`<div class="ans">Answer: ${md(b.ans)}</div>`:''}</div>`,
    raw:    b=>b.html
  };

  window.renderNotes = function(blocks, host){
    host.innerHTML = '<div class="page">' + blocks.map(b=>{
      const f=R[b.t]; return f?f(b):'';
    }).join('') + '</div>';
  };
})();
