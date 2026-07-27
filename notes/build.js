const fs=require('fs'), path=require('path');
const S=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
const B=path.join(__dirname,'..','build','src');
const g=s=>s.replace(/<\/script>/gi,'<\\/script>');
const html=`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Signals, Systems and Frequency-Domain Analysis</title>
<style>${fs.readFileSync(path.join(B,'20_katex.css'),'utf8')}</style>
<style>${S('src/notes.css')}</style></head><body><div id="doc"></div>
<script>${g(fs.readFileSync(path.join(B,'30_katex.js'),'utf8'))}</script>
<script>${g(fs.readFileSync(path.join(B,'60_plot.js'),'utf8'))}</script>
<script>${g(S('src/render.js'))}</script>
<script>${g(S('src/c1.js'))}</script>
<script>${g(S('src/c23.js'))}</script>
<script>${g(S('src/c4.js'))}</script>
<script>${g(S('src/c5.js'))}</script>
<script>${g(S('src/c6.js'))}</script>
<script>${g(S('src/c7.js'))}</script>
<script>${g(S('src/ca.js'))}</script>
<script>renderNotes(C1.concat(C23,C4,C5,C6,C7,CA), document.getElementById('doc')); document.title=document.title;</script>
</body></html>`;
fs.mkdirSync(path.join(__dirname,'..','dist'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'..','dist','Lecture_Notes.html'), html);
console.log('notes html', (html.length/1048576).toFixed(2)+' MB');
