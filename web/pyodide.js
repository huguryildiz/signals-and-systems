/* ==========================================================================
   web/pyodide.js — place the Python runtime for the code pages in the site.

   Usage: node web/pyodide.js <site/pyodide>

   A code page's Run button loads Pyodide (CPython compiled to WebAssembly)
   from `pyodide/v<VERSION>/` on the course site, on the first press only.
   This script fetches that runtime from the Pyodide release on jsDelivr, the
   core files and the packages NumPy and Matplotlib need, and checks every
   file against a pinned SHA-256 before it is published: the core files
   against the hashes below, the packages against the hashes in the pinned
   lock file. A file that does not match stops the build.

   Files are kept in web/.cache/ (gitignored), so a second build on the same
   machine fetches nothing. SKIP_PYODIDE=1 skips the step for an offline
   local build; the site then has no runtime and Run reports that Python
   could not be loaded.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VERSION = '0.29.3';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
const WANT = ['numpy', 'matplotlib'];            /* and everything they depend on */
const CORE = {
  'pyodide.js':        '718d40f1c015dd25ec724cc8fc4e2325d6a45a92ae225121ff6953f224a16f72',
  'pyodide.asm.js':    '1263f02b5b26099b96112378156f242dd98b39a8201ba7765e5fe3d455c5ce91',
  'pyodide.asm.wasm':  'e2f4ee75b325e35eb31bfb8c613d4dd5098f5502c156a97847686875b5025480',
  'python_stdlib.zip': '4298b6ee445cb724c3973437da47789752b9e6ff4e26619026b283ec801fc46b',
  'pyodide-lock.json': '3256ffc76388de0e37f4b34d42ab484268d1afc675179ff97b2a5bb14f84ccac'
};

const out = path.join(process.argv[2] || path.join(__dirname, '..', 'site', 'pyodide'), 'v' + VERSION);
const cache = path.join(__dirname, '.cache', 'pyodide-' + VERSION);
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

async function get(name, hash){
  const c = path.join(cache, name);
  if(fs.existsSync(c) && sha(fs.readFileSync(c)) === hash) return fs.readFileSync(c);
  const r = await fetch(CDN + name);
  if(!r.ok) throw new Error(`pyodide: ${name}: HTTP ${r.status}`);
  const b = Buffer.from(await r.arrayBuffer());
  if(sha(b) !== hash) throw new Error(`pyodide: ${name}: SHA-256 does not match the pinned value`);
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(c, b);
  return b;
}

(async () => {
  if(process.env.SKIP_PYODIDE){ console.log('  · pyodide skipped (SKIP_PYODIDE)'); return; }
  fs.mkdirSync(out, { recursive: true });
  let bytes = 0;
  const put = (name, b) => { fs.writeFileSync(path.join(out, name), b); bytes += b.length; };

  for(const [name, hash] of Object.entries(CORE)) put(name, await get(name, hash));

  const lock = JSON.parse(fs.readFileSync(path.join(out, 'pyodide-lock.json'), 'utf8')).packages;
  const need = new Set(), stack = [...WANT];
  while(stack.length){
    const n = stack.pop();
    if(need.has(n)) continue;
    if(!lock[n]) throw new Error('pyodide: no package ' + n + ' in the lock file');
    need.add(n); stack.push(...(lock[n].depends || []));
  }
  for(const n of [...need].sort()) put(lock[n].file_name, await get(lock[n].file_name, lock[n].sha256));

  console.log(`  · pyodide v${VERSION}: ${Object.keys(CORE).length} core files and ${need.size} packages, `
    + (bytes / 1048576).toFixed(1) + ' MB');
})().catch(e => { console.error(e.message); process.exit(1); });
