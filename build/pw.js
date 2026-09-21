/* Run a gate that requires Playwright by the container's absolute path.
   Usage: node pw.js qa.js  ·  node pw.js ../notes/topdf.js
   The gates are written for a container in which Playwright sits at
   /home/claude/.npm-global/lib/node_modules/playwright. Rewriting that path in
   five scripts would put a machine-local detail into the pipeline, so the path
   is redirected in the module resolver instead and the scripts stay untouched.
   No local package matches the browser build in the cache, so a launch that
   fails for a missing executable is retried once with the cached headless
   shell. PW_PATH names the package, PW_CHROME the browser binary; the line
   naming the browser goes to stderr so a gate's own output stays clean. */
const path = require('path');
const fs = require('fs');
const os = require('os');
const Module = require('module');
const CONTAINER = '/home/claude/.npm-global/lib/node_modules/playwright';
const HOME = os.homedir();
const CANDIDATES = [
  path.join(HOME, '.hermes/hermes-agent/node_modules/playwright'),
  path.join(HOME, 'Documents/GitHub/DEIXIS/apps/web/node_modules/playwright'),
];

const target = process.argv[2];
if (!target) { console.error('usage: node pw.js <script.js> [args…]'); process.exit(2); }

const LOCAL = process.env.PW_PATH || CANDIDATES.find(p => fs.existsSync(p));
if (!LOCAL) {
  console.error('pw.js: no Playwright package found. Tried ' + CANDIDATES.join(' and ') +
                '. Set PW_PATH to one.');
  process.exit(2);
}

const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === CONTAINER) request = LOCAL;
  return resolve.call(this, request, ...rest);
};

/* The newest headless shell in the browser cache, whatever build it is. */
function cachedShell() {
  const cache = path.join(HOME, 'Library/Caches/ms-playwright');
  if (!fs.existsSync(cache)) return null;
  const dirs = fs.readdirSync(cache)
    .filter(d => d.startsWith('chromium_headless_shell-'))
    .sort((a, b) => parseInt(b.split('-').pop(), 10) - parseInt(a.split('-').pop(), 10));
  for (const d of dirs) {
    const host = path.join(cache, d);
    const inner = fs.readdirSync(host).find(x => x.startsWith('chrome-headless-shell-'));
    const exe = inner && path.join(host, inner, 'chrome-headless-shell');
    if (exe && fs.existsSync(exe)) return exe;
  }
  return null;
}

const pw = require(LOCAL);
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (opts = {}) => {
  if (process.env.PW_CHROME) {
    console.error('pw.js: browser ' + process.env.PW_CHROME);
    return launch({ executablePath: process.env.PW_CHROME, ...opts });
  }
  try {
    return await launch(opts);
  } catch (e) {
    const exe = /executable doesn't exist/i.test(e.message) && cachedShell();
    if (!exe) throw e;
    console.error('pw.js: browser ' + exe);
    return launch({ executablePath: exe, ...opts });
  }
};

process.argv.splice(1, 1);                       // the target sees itself as argv[1]
require(path.resolve(process.cwd(), target));
