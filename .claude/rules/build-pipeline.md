---
paths:
  - "build/**/*"
  - "notes/**/*"
  - "verify/**/*"
  - "tools/**/*"
  - "web/**/*"
  - "dist/**/*"
---

# Build and verification

`build/` and `notes/` must remain siblings at the repository root. `dist/` is generated; never hand-edit it. Only `dist/Signals_and_Systems.html`, `dist/Lecture_Notes.pdf`, and the published `dist/Student_Workbook.pdf` and `dist/Formula_Reference.pdf` are tracked. The artifact build is byte-reproducible; investigate a diff you did not author before delivering. `build/build.js` finds `8[1-9]_*.js` and `9[1-9]_*.js`, but `build/src/99_tail.html` assembles scene order. Add any new `SCENES_M*` or `DRILL_M*` array there. KaTeX is vendored and font-inlined: no `npm install` or network fetch. Version bumps change `CONTENT.META` in both `80_content_core.js` and `91_scenes_end.js` in one commit.

The site build strips the instructor edition from its published copy in memory; it must not modify `build/src` or overwrite `dist/`. Its transforms assert hit counts. Rebuild generated `dist/` files with their sources and include them in the same commit when committing source changes.

## Build commands

```bash
cd build && node build.js
cd notes && node build.js
cd notes && node topdf.js
cd notes && node editions.js && node ../build/pw.js topdf.js
```

Run `git status` before any generated write. The tree is shared; preserve unrelated changes and stage by explicit path. Verify a generated diff before committing. No scratch files in the root.

## Gates

The full gate chain is a release check, not a per-edit step. Routine edits (styling, wording, a single figure) need only a rebuild and a screenshot. Before a release, after a change to mathematics or laboratory logic, or when the owner asks, run all eleven gates, and the site check if the site was rebuilt. Report the numbers actually printed. Start with `node --check build/src/8*.js build/src/9*.js`; a parse error can make later gate failures misleading. Do not use old scene, state, or pass counts as current expectations; update recorded counts when they change.

```bash
cd build && node pw.js qa.js
cd build && node labtest.js
cd build && node pw.js textclash.js
cd build && node pw.js mathscan.js
cd build && node pw.js ../notes/mathscan.js
cd build && node pw.js labwalk.js
cd build && node pw.js seccheck.js
cd verify && ../.venv/bin/python verify_m1_m3.py
cd verify && ../.venv/bin/python verify_m4_m6.py
cd verify && ../.venv/bin/python verify_drills.py
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/9[2-8]_drill_m*.js" "build/src/91_*.js" "build/src/70_labs.js" "notes/src/*.js"
.venv/bin/python tools/content_guard.py --source --artifacts --hook
cd build && node pw.js slidebudget.js
cd build && node pw.js ../web/sitecheck.js
```

For the local edit loop, use `cd build && node pw.js labwalk.js --smoke`. It checks every laboratory in
both themes with a representative control state and avoids the full pager and endpoint sweep. Use
`cd build && node pw.js labwalk.js --labs=B,F` when a change is limited to selected laboratories. The
unqualified `labwalk.js` command remains the release gate.

Expected qualitative results: `qa.js` reports 0 errors and 0 overflow; inspect its `dense` list, which is not itself a failure. `labtest.js` reports no errors and `options=0`; `textclash.js` reports 0 collisions; both math scans report no damage; `labwalk.js`, `seccheck.js`, and `sitecheck.js` report no problems; numeric suites report 0 failed; `rule_check.py` reports 0 violations; and `content_guard.py` reports no hard failures. Content-guard review warnings are not automatic failures because technical prose can legitimately contain phrases such as `in terms of` or an em dash in a worked-example title. New modules extend the suites rather than replacing them. Every new numerical result needs a PASS/FAIL line in `verify/`.

Every Playwright script uses the existing container-path `require('/home/claude/.npm-global/lib/node_modules/playwright')`; do not rewrite that line. `build/pw.js` redirects resolution to the available local Playwright installation and retries with a cached Chromium headless shell when needed. It reports the browser used on stderr. `PW_PATH` and `PW_CHROME` override package and browser paths. Read `.claude/reference/gates.md` when a gate fails or a new gate is proposed. After a visual change, take and inspect screenshots.

On a local machine, run every browser gate through `pw.js`; `qa.js`, `textclash.js`, and `mathscan.js` fail when started with plain `node`. Run the browser gates one per command and redirect each output to a file, then read its summary line. Chaining several browser gates in one shell command can exceed the tool's memory or time limit and kill the whole command (exit 137), which discards all their results. macOS has no `timeout` command. For a single-scene figure edit, rebuild and inspect a screenshot of that scene first, then run the gates.
