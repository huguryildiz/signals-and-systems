/* Structural check of the question banks.

   The bank is not one file: a module appends its own questions from
   9[1-9]_qbank*.js, exactly as build.js concatenates them. Naming the files, or
   the modules, by hand is how a bank lands unchecked — the run stays green
   because it never looked. Both are discovered here instead. */
const fs=require('fs');
const path=require('path');
const SRC=path.resolve(__dirname,'..','build','src');
/* 80_content_core.js declares `const CONTENT`, which a direct eval would keep to
   itself, so the file is run as a function body and its object taken back. */
const CONTENT=new Function(fs.readFileSync(path.join(SRC,'80_content_core.js'),'utf8')+';return CONTENT;')();
const files=fs.readdirSync(SRC).filter(f=>/^9[1-9]_qbank.*\.js$/.test(f)).sort();
for(const f of files) eval(fs.readFileSync(path.join(SRC,f),'utf8'));
const Q=CONTENT.QBANK;
const order=['concept','concept','concept','calc','calc','calc','misconception','misconception','exam','exam','graph','synthesis'];
let bad=0; const say=(ok,m)=>{ if(!ok){bad++;console.log('  FAIL '+m);} };
console.log('bank files:',files.join(' '));
console.log('total questions:',Q.length);
say(files.length>0,'no 9x_qbank*.js file found in build/src');
say(Q.length>0,'the bank files loaded no questions');

/* the modules the questions themselves declare, in order of first appearance */
const known=CONTENT.MODULES.map(m=>m.id);
const mods=[]; for(const q of Q) if(!mods.includes(q.module)) mods.push(q.module);
say(JSON.stringify(mods)===JSON.stringify(known.filter(m=>mods.includes(m))),
    'module order '+mods.join(',')+' does not follow CONTENT.MODULES');
/* Reading the module list off the questions cannot see a bank that is not there
   at all: delete a file and the module simply stops being mentioned. The scene
   list is the second opinion — a module that shows a question-bank scene has to
   have questions behind it. */
const scanned=fs.readdirSync(SRC).filter(f=>/^8[1-9]_scenes.*\.js$/.test(f));
const banked=new Set();
for(const f of scanned)
  for(const m of fs.readFileSync(path.join(SRC,f),'utf8').matchAll(/id:'m(\d)-qbank'/g)) banked.add('M'+m[1]);
console.log('modules showing a question-bank scene:',[...banked].sort().join(' ')||'none');
for(const m of [...banked].sort())
  say(mods.includes(m), m+' has a question-bank scene but no questions in any 9x_qbank file');
for(const mod of mods){
  const b=Q.filter(q=>q.module===mod);
  console.log(mod+': '+b.length+' questions | kinds: '+b.map(q=>q.kind).join(','));
  say(known.includes(mod), mod+' is not a module id in CONTENT.MODULES');
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
