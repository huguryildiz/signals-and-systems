const fs=require('fs');
const CONTENT={QBANK:[]};
eval(fs.readFileSync('/tmp/ee311/build/src/95_qbank.js','utf8'));
const Q=CONTENT.QBANK;
const order=['concept','concept','concept','calc','calc','calc','misconception','misconception','exam','exam','graph','synthesis'];
let bad=0; const say=(ok,m)=>{ if(!ok){bad++;console.log('  FAIL '+m);} };
console.log('total questions:',Q.length);
for(const mod of ['M1','M2','M3']){
  const b=Q.filter(q=>q.module===mod);
  console.log(mod+': '+b.length+' questions | kinds: '+b.map(q=>q.kind).join(','));
  say(b.length===12, mod+' count');
  b.forEach((q,i)=>{
    say(q.kind===order[i], q.id+' kind order (expected '+order[i]+', got '+q.kind+')');
    say(q.id===mod.replace('M','Q')+'-'+String(i+1).padStart(2,'0'), q.id+' id sequence');
  });
}
const ids=new Set();
for(const q of Q){
  say(!ids.has(q.id), 'duplicate id '+q.id); ids.add(q.id);
  for(const f of ['stem','why','sol','err','teach']) say(typeof q[f]==='string'&&q[f].length>10, q.id+' field '+f);
  say(typeof q.src==='string'&&q.src.length>=4, q.id+' field src');
  say(Array.isArray(q.opts)&&q.opts.length===4, q.id+' opts count');
  say(Number.isInteger(q.a)&&q.a>=0&&q.a<4, q.id+' answer index');
  const wk=Object.keys(q.wrong||{}).map(Number).sort();
  const exp=[0,1,2,3].filter(k=>k!==q.a);
  say(JSON.stringify(wk)===JSON.stringify(exp), q.id+' wrong keys '+JSON.stringify(wk)+' vs '+JSON.stringify(exp));
  for(const k of exp) say(typeof (q.wrong||{})[k]==='string'&&q.wrong[k].length>20, q.id+' wrong['+k+'] text');
  say(Array.isArray(q.hints)&&q.hints.length===2, q.id+' hints count');
  // math delimiter sanity: even number of $, and no leftover $ after md-style replacement
  const fields=[q.stem,...q.opts,q.why,q.sol,q.err,q.teach,...q.hints,...exp.map(k=>q.wrong[k])];
  for(const s of fields){
    const dollars=(s.match(/\$/g)||[]).length;
    say(dollars%2===0, q.id+' odd $ count in: '+s.slice(0,60));
    const rest=s.replace(/\$\$([^$]+)\$\$/g,'[D]').replace(/\$([^$]+)\$/g,'[I]');
    say(!rest.includes('$'), q.id+' leftover $ after md pass: '+rest.slice(0,80));
    say(!s.includes('`'), q.id+' backtick present');
  }
  // src page citation present
  say(/p{1,2}\.\s*\d/.test(q.src), q.id+' src format: '+q.src);
}
console.log(bad? '\n'+bad+' STRUCTURAL FAILURES' : '\nALL STRUCTURAL CHECKS PASSED');
