const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname,'src');
const read = f => fs.readFileSync(path.join(SRC,f),'utf8');

const jsFiles = ['30_katex.js','60_plot.js','80_content_core.js','40_core.js','70_labs.js','90_app.js']
  .concat(fs.readdirSync(SRC).filter(f=>/^8[1-9]_|^9[1-9]_/.test(f) && f.endsWith('.js')).sort());

let head = read('00_head.html')
  .replace('/*__KATEX_CSS__*/', () => read('20_katex.css'))
  .replace('/*__APP_CSS__*/',  () => read('10_style.css'));

const guard = s => s.replace(/<\/script>/gi, '<\\/script>');
const scripts = jsFiles.map(f => `<script>\n/* ==== ${f} ==== */\n` + guard(read(f)) + `\n</script>`).join('\n');

const out = head + '\n' + scripts + '\n' + read('99_tail.html');
const dest = path.join(__dirname,'..','dist','EE311_Signals_and_Systems.html');
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest, out);
console.log('built', dest, (out.length/1024/1024).toFixed(2)+' MB', '·', jsFiles.length, 'js modules');
