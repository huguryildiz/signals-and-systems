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

Before delivery, run all eleven gates, and the site check if the site was rebuilt. Report the numbers actually printed. Start with `node --check build/src/8*.js build/src/9*.js`; a parse error can make later gate failures misleading. Do not use old scene, state, or pass counts as current expectations; update recorded counts when they change.

```bash
cd build && node qa.js
cd build && node labtest.js
cd build && node textclash.js
cd build && node mathscan.js
cd build && node pw.js ../notes/mathscan.js
cd build && node pw.js labwalk.js
cd build && node pw.js seccheck.js
cd verify && ../.venv/bin/python verify_m1_m3.py
cd verify && ../.venv/bin/python verify_m4_m6.py
cd verify && ../.venv/bin/python verify_drills.py
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/9[2-8]_drill_m*.js" "build/src/91_*.js" "build/src/70_labs.js" "notes/src/*.js"
.venv/bin/python tools/content_guard.py --source --artifacts --hook
cd build && node pw.js ../web/sitecheck.js
```

Expected qualitative results: `qa.js` reports 0 errors and 0 overflow; inspect its `dense` list, which is not itself a failure. `labtest.js` reports no errors and `options=0`; `textclash.js` reports 0 collisions; both math scans report no damage; `labwalk.js`, `seccheck.js`, and `sitecheck.js` report no problems; numeric suites report 0 failed; `rule_check.py` reports 0 violations; and `content_guard.py` reports no hard failures. Content-guard review warnings are not automatic failures because technical prose can legitimately contain phrases such as `in terms of` or an em dash in a worked-example title. New modules extend the suites rather than replacing them. Every new numerical result needs a PASS/FAIL line in `verify/`.

Every Playwright script uses the existing container-path `require('/home/claude/.npm-global/lib/node_modules/playwright')`; do not rewrite that line. `build/pw.js` redirects resolution to the available local Playwright installation and retries with a cached Chromium headless shell when needed. It reports the browser used on stderr. `PW_PATH` and `PW_CHROME` override package and browser paths. Read `.claude/reference/gates.md` when a gate fails or a new gate is proposed. After a visual change, take and inspect screenshots.
