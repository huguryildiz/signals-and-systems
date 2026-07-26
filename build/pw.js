/* Run a gate that requires Playwright by the container's absolute path.
   Usage: node pw.js qa.js  ·  node pw.js ../notes/topdf.js
   The gates are written for a container in which Playwright sits at
   /home/claude/.npm-global/lib/node_modules/playwright. Rewriting that path in
   five scripts would put a machine-local detail into the pipeline, so the path
   is redirected in the module resolver instead and the scripts stay untouched. */
const path = require('path');
const Module = require('module');
const CONTAINER = '/home/claude/.npm-global/lib/node_modules/playwright';
const LOCAL = process.env.PW_PATH ||
  '/Users/huguryildiz/Documents/GitHub/VERA/node_modules/playwright';

const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === CONTAINER) request = LOCAL;
  return resolve.call(this, request, ...rest);
};

const target = process.argv[2];
if (!target) { console.error('usage: node pw.js <script.js> [args…]'); process.exit(2); }
process.argv.splice(1, 1);                       // the target sees itself as argv[1]
require(path.resolve(process.cwd(), target));
