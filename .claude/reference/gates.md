# Verification gates — what each one covers

Moved verbatim from `CLAUDE.md` §5 on 2026-09-21. The current commands and qualitative expectations
are in `.claude/rules/build-pipeline.md`; this file explains what each gate sees and cannot see.

---

Eleven gates. Nothing is "done" until all eleven pass. **Report the numbers a run actually printed**,
never a summary in place of a run.

```bash
node --check build/src/8*.js build/src/9*.js       # parses      → silent
cd build && node qa.js                             # layout      → 0 errors, 0 overflow
cd build && node labtest.js                        # interaction → "ERRORS: none"
cd build && node textclash.js                      # labels      → "TOTAL COLLISIONS: 0"
cd build && node mathscan.js                       # mathematics → "SCENES WITH MATH DAMAGE: 0 / 235"
cd build && node pw.js ../notes/mathscan.js        # notes maths → "LITERAL MATH IN NOTES: 0"
                                                   #               "KATEX ERRORS: 0"
cd build && node pw.js labwalk.js                  # laboratories → "STATES WALKED: 1038"
                                                   #                "PROBLEMS: none"
cd build && node pw.js seccheck.js                 # contents addressing → "ADDRESSED: 234"
                                                   #                      "ANCHORED: 208"
                                                   #                      "PROBLEMS: none"
cd verify && ../.venv/bin/python verify_m1_m3.py   # numbers     → "50 passed, 0 failed"
cd verify && ../.venv/bin/python verify_m4_m6.py   # Fourier numbers → "26 passed, 0 failed"
cd verify && ../.venv/bin/python verify_drills.py  # drill numbers → "913 passed, 0 failed"
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/9[2-8]_drill_m*.js" \
        "build/src/91_*.js" "build/src/70_labs.js" "notes/src/*.js"
                                       # wording + figure labels → "TOTAL VIOLATIONS: 0"
```

`node --check` is not a gate, it is the step before them: a scene file that does not parse takes the
whole artifact down, and it is the one failure the other gates report as something else entirely.

`.venv/` is a local arm64 virtualenv holding numpy and sympy. It is gitignored, so a fresh clone
rebuilds it with `/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install numpy sympy`.
Never run these under the x86_64 anaconda `python3`.

**What each gate covers.**

- `qa.js` renders every scene at its last step, captures console errors, and measures the scene box
  against the **content box** of the stage — the padded box is 1080 px tall, but the scene column lives
  inside the page margin, so measuring against the padded box hides a scene that has run into the strip
  reserved for the footer. Any overflow or any console error is a failure. The run also prints `dense`:
  every scene held together by a scale factor below 0.90, or one whose figures the fit had to cut, and
  by how much. `dense` is not a failure — nothing is clipped — it is the list of scenes that carry more
  than one page holds and are due to be split, which is the mechanical reading of §7.3.
- `labtest.js` drives every laboratory control and every mode toggle, and walks the pager of every
  exam drill from the first question to the last, opening each worked solution — 210 pages in all. It
  asserts `options=0`: every question is open-ended, and a change that reintroduces multiple-choice
  buttons fails here. A pager that stops short of the last question fails here too, which is the check
  the old scrolling panel never had.
- `textclash.js` walks every scene at every step, takes the glyph box of every label in every figure
  and tests it against the drawn geometry of the same figure. A word, an equation or a caption crossed
  by a signal fails; a label sitting on another label fails; a label reaching past the edge of the
  figure fails; a label drawn without a halo fails. A haloed label of one or two symbols — a tick
  number, a short annotation — crossed by a curve is accepted, because the halo interrupts the curve
  around the glyphs, and the run reports how many it accepted. **An axis name is outside that leniency
  however short it is:** it is marked `data-role="axisname"` by `texName`, and the sweep fails it on any
  hit at all — on the data, on the axis line, on the arrowhead at its end or on a tick mark. That is the
  R7 clearance, checked rather than trusted.
  Axis names are typeset mathematics, so their box comes from the laid-out formula, not from
  `getBBox`. A clipped trace is read through its clip rectangle, because `isPointInStroke` answers
  about the path rather than about what is painted. The expected result is `TOTAL COLLISIONS: 0`;
  anything else is a collision and a failure.
  **It pages through every drill and opens every solution.** A drill answer figure is drawn only once
  the solution is revealed, and only one question is on screen at a time, so the step loop alone would
  leave twenty-nine of every thirty questions unmeasured. The sweep is therefore a named function, run
  once per step and again after each `Show worked solution` click, with the pager advanced between
  questions and the handles re-queried per click because the panel redraws. Those states are recorded
  as step `sol0`, `sol1`, … in `textclash.json`.
- `verify_m1_m3.py` recomputes every numerical result in Modules 0 to 3, one PASS/FAIL line each.
- `verify_m4_m6.py` does the same for the Fourier property scenes of Modules 4 to 6, added with the
  property tables. It is the only numerical gate that reaches those modules' teaching scenes:
  `verify_m1_m3.py` stops at Module 3, as its name says, and `verify_drills.py` reads only the
  practice questions. It re-derives what the scenes claim rather than restating it — that the
  rectangular wave convolves with itself into the triangular wave and that the result's
  coefficients are `T_0 a_k^2`, that the zero-stuffed sequence has period `mN` and coefficients
  `a_k/m`, that the mean-removed integral stays inside `±0.25` while the raw one adds the ramp
  `a_0 t`, that the zero-area pulse integrates back to zero, and that the even part of a one-sided
  exponential transforms to the real part of its spectrum in both continuous and discrete time.
- `verify_drills.py` does the same for the exam drills: every number stated in a `Check` step of a
  drill solution is re-derived independently, symbolically where SymPy can and numerically where it
  cannot. The checks live one file per module in `verify/drills_m1.py` … `drills_m7.py`, share the
  helpers in `verify/drill_common.py`, and are run together by `verify_drills.py`; a module can be
  written and checked on its own. It shares the same `.venv`. Where a drill answer is a proof or a counterexample rather than
  a number — all of Module 2 — what it checks is that the named counterexample does what the solution
  claims: that the two inputs really do share an output, that the bounded input really does produce an
  unbounded one.
- `rule_check.py` runs two passes. The first scans every student-facing string for the phrases banned
  by R2. The second is the mechanical half of R7: it collects every label that reaches a figure —
  the third argument of `note()`, the fourth of `span()`, an `xlabel` or `ylabel`, and the `label` of a
  `box`, an `arrow` or a `text` item in `blocks()` — and fails it on four counts.
  **A Unicode substitute for a symbol** — `∞`, `²`, `−`, `Σ`, a Greek letter — is a failure whether or
  not the label is typeset. **Mathematics without `tex:true`** is a failure: a label carrying a
  function or sequence argument, a relation, a TeX token, or standing alone as one symbol is
  mathematics, and `italic:true` slants a plain string instead of typesetting it. Prose punctuation is
  not mathematics, so `PATH 1 — combine, then process` and `equal?` stay plain. **A lost backslash** is
  a failure: a TeX macro survives a JavaScript string only doubled, `'\;'` is the string `;` and
  `'\text'` is a tab, so an odd run of backslashes is a macro that never reached KaTeX. **A bare `;`**
  in a typeset label is a failure for the same reason — it is a `\\;` thin space with its escape
  stripped. That last pair is the one class of damage no other gate sees: KaTeX typesets a semicolon
  without complaint, so `qa.js` stays green while the figure reads `p(t)=v^{2}(t);;(R=1)`.
  The pass is line-based and deliberately narrow. It says nothing about whether a label *should* be
  mathematics — turning `energy = shaded area` into `\text{energy}=\text{shaded area}` is an editorial
  call — and nothing about where a label sits, which is what `textclash.js` measures.

- `content_guard.py` applies the deterministic part of the plain-academic-English policy. It fails on
  unambiguous AI-slop and promotional patterns from the `no-ai-slop` editorial guide, scans both the
  authored student-facing sources and the generated lecture-note PDF/HTML, and prints context-dependent
  signals such as `simply`, `in terms of`, or an em dash as review warnings. Warnings do not fail the gate:
  technical prose can need those forms. The Stop hook runs the source scan in quiet mode and can block a
  normal stop on a hard failure; its matcher, timeout and user interruption limits still apply. Nuanced
  style decisions remain with an editor.

- `labwalk.js` is the gate for what `mathscan.js` structurally cannot see. `mathscan.js` only ever
  opens the item a laboratory shows first; `labwalk.js` opens **every** item of **every** laboratory, in
  **both themes**, sweeps each slider to the bottom, middle and top of its range, and reads the state
  back out — 1038 states at v1.0. A state fails on a KaTeX error node, on mathematics left as a literal
  `$...$` outside a `.katex` subtree, on a raw TeX macro in the running text, on a readout gone to
  `NaN`, `Infinity` or `undefined`, on a panel that drew no figure where one belongs, and on any console
  or page error logged while the state was open. Its first run found Laboratory B printing `$2N+1$` and
  `$t\to-\infty$` as source text in its later items — an R8 failure no other gate could reach.
  **Nothing about the laboratories is written down in it.** The list of laboratories comes from the
  scene list, and each one's controls — item selectors, segmented controls, item list, sliders, and
  whether it draws a figure at all — are read off its own rendered DOM. It prints what it discovered,
  one line per laboratory, so a laboratory that grows a control changes that line and you see it. The
  one thing to extend is `ATTRS`, the list of attributes that select an item, if the design system ever
  gains a new kind of control. A laboratory whose control product exceeds `MAX_COMBOS` is reported as a
  failure rather than walked in part.

- `seccheck.js` is the gate for the contents addressing. Every scene has exactly one
  address, no address repeats, and each chapter's section numbers, scene ordinals,
  laboratory numbers and question numbers run from their first value upward with no
  gap. A gap means a scene was dropped from the declaration in `89_sections.js` and is
  now unreachable from the contents; a repeat means two scenes answer to the same
  address. It also holds the rule that keeps the two numbering systems apart: it fails
  on a `§` that reaches the contents rail, the course map or a scene without the `OW`
  marker in front of it. The artifact title scene is the one scene with no address, by
  design, and the gate asserts that too.

- `mathscan.js` walks every scene and reports three things: a formula KaTeX could not parse,
  mathematics left as literal `$...$` in the rendered text, and any element whose tag name is not
  valid HTML or SVG. It is the gate for the failure the other five are blind to — mathematics that is
  *present but wrong*, which damages one label and leaves the layout, the interaction, the numbers and
  the wording all correct. Its tag list is a whitelist, so a new SVG element that the artifact
  legitimately draws has to be added to it deliberately.

  **It pages through every drill and opens every solution.** A worked solution sits behind a
  `Show worked solution` button and is the longest piece of authored mathematics in the artifact; left
  closed it is invisible to every gate, because `qa.js` renders a scene at its last reveal state and a
  collapsed panel has no reveal state. Only one question is on screen at a time, so the scan opens the
  solution, advances the pager and repeats for all twenty, re-querying the handles after each click
  because the panel redraws. Its first run over the drills found figure labels printing
  `\d` and `\Ev` as source text — `60_plot.js` had its own KaTeX macro list, which did not include the
  ones `90_app.js` defines for the running text. The two lists now agree; **keep them in step.**

  **Its reach into a laboratory is partial, and this is a known hole.** It clicks the options and
  expandables of whatever the laboratory shows first, re-querying the handles per click because a
  laboratory redraws itself and detaches them. It does not drive `[data-nav]`, so it never sees the
  second and later signals, systems or cases of a laboratory. Damage in those is invisible to it:
  a broken formula inside a property panel of the fifth system of laboratory D passes this gate.
  Reaching them needs a per-laboratory walk that does not exist yet. Until it does, mathematics
  authored into `CONTENT.SYSTEMS`, `CONTENT.PROPS` or a laboratory's own item list has to be checked
  by opening the laboratory and stepping through every item by hand.

- `notes/mathscan.js` is the same gate for the other half of the pipeline. It renders
  `dist/Lecture_Notes.html`, walks every text node outside a `.katex` subtree, and fails on a literal
  `$...$`, on a TeX macro or an HTML entity left in the running text, on a `.katex-error`, and on any
  console error the renderer logged. The lecture notes have no scenes and no steps, so one pass over
  the document sees everything it renders. Run it through `build/pw.js` like the other Playwright
  gates. Rebuild the notes first: it reads the built file, not the sources.

`build/domcheck.js` sits beside the gates without being one. It reports any element whose tag name is
not valid HTML. Its whitelist was missing `foreignobject`, which every typeset figure label uses, so it
reported 151 malformed scenes that were all correct; the whitelist was corrected on 2026-07-27 and it
now reports `MALFORMED SCENES: 0` over 220 scenes. It remains redundant — `mathscan.js` covers the same
ground and two further failure modes besides — so it is kept as a narrow second opinion, not promoted
to a gate.

**Playwright.** `qa.js`, `labtest.js`, `textclash.js`, `domcheck.js`, `mathscan.js`,
`notes/mathscan.js` and `notes/topdf.js` each `require` Playwright by the absolute path
`/home/claude/.npm-global/lib/node_modules/playwright`, which exists only in the container. On this
machine Playwright is installed at `~/Documents/GitHub/VERA/node_modules/playwright`, and the seven
scripts run unmodified if Node's module resolver is redirected there. `build/pw.js` is that redirect:
it patches `Module._resolveFilename` and then `require`s the script named on its command line, so
`cd build && node pw.js ../notes/mathscan.js` runs a gate with nothing in the gate itself touched.
`PW_PATH` overrides the local path on another machine.
**Do not rewrite the require line in place**, in a new script either: a new gate keeps the container
path and is run through `pw.js` like the rest.

New modules extend these suites; they never replace them. Every new numerical result gets a check in
`verify/` in the same PASS/FAIL-per-line format. Before shipping any PDF, render every page to an
image and look at it.

---
