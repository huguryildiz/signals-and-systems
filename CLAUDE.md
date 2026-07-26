# Signals and Systems — project operating instructions

**Status: authoritative.** Read this before changing anything in
`~/Documents/GitHub/signals-and-systems`. Rewritten 2026-07-26; the editorial rules in §6 were set
2026-07-25 and are unchanged. Artifact version at this point: **v0.9**
(`CONTENT.META.version` in `build/src/80_content_core.js`).

The design system, the build pipeline and the content schema are **locked**. Do not re-derive or
redesign them. If something looks wrong, say so and stop — never change a locked decision silently.

---

## 1. Read order at session start

1. this file, in full — §6 (R1–R8) is binding on every deliverable
2. `instructor/PHASE2_HANDOFF.md` — work order, build architecture, scene / block / question schemas
3. `.claude/reports/Phase1_Report.md` — only when you need the ambiguity ledger A-01…A-08, QA
   history or the manifest. `.claude/reports/Phase2_Audit_p22_p41.md` continues that ledger
   from A-09.

**Language.** Talk to the user in Turkish. Everything that ends up in a deliverable, and every
internal record in this repository, is written in plain academic English.

---

## 2. Where the project stands

**Phase 1 is complete.** Modules 0–3 in 58 scenes, laboratories A–E, question banks Q1–Q3 with 36
questions, 50 computational checks, zero clipping, zero runtime errors, and a lecture-notes HTML/PDF
pipeline beside the artifact.

**Phase 2 has not started.** It is: audit source pages 22–88 visually, page by page; author Modules
4–7 (~70–85 scenes); build laboratories F–J; write question banks Q4–Q7; extend `verify/`; then
generate the five PDF editions. The work order is `instructor/PHASE2_HANDOFF.md` §5.

Version **v1.0** is reached only when Modules 4–7 and all five PDFs are complete and consistent. The
bump touches `CONTENT.META` in `build/src/80_content_core.js` and `build/src/91_scenes_end.js`
together.

---

## 3. Repository layout

| Path | What it is |
| --- | --- |
| `build/build.js` | concatenates `build/src/*` into the artifact |
| `build/src/` | the artifact source: head, styles, KaTeX, core, plot, labs, scenes, question bank, tail |
| `build/qa.js` `labtest.js` `textclash.js` `mathscan.js` | four of the six gates (§5) |
| `build/domcheck.js` | an extra sweep, not a gate |
| `notes/build.js` `topdf.js` `src/` | the lecture-notes pipeline |
| `verify/` | `verify_m1_m3.py` (numerical), `qbank_check.py`, `qbank_struct.js` |
| `tools/rule_check.py` | the R1–R8 banned-phrase scanner |
| `audit/` | page-mapping inventories, `scenes.json`, `page_titles.tsv` — instructor-grade only |
| `instructor/` | `PHASE2_HANDOFF.md`, `coverage_matrix.md` |
| `dist/` | generated deliverables — never hand-edited |
| `source/` | the two PDFs, **not in git** |
| `.claude/` | local working area, **not in git** |

`build/` also holds one-off debug helpers — `darkshot.js`, `dbg.js`, `dbg2.js`, `dump.js`,
`modeshot.js`, `projover.js`, `projtest.js`, `shelltest.js`, `shot.js`. They are scratch tools for
looking at one thing, not part of any gate.

Everything in `dist/` is generated. `dist/Signals_and_Systems.html` and
`dist/Lecture_Notes.pdf` are tracked; `dist/Lecture_Notes.html` is the intermediate that
`notes/topdf.js` turns into the PDF, so it is gitignored, as are `shots/`, `textclash.json`, `.venv/`
and `.claude/`.

There is no `archive/` folder and no `release/` folder. The old `release/Deliverables.zip` held
the whole pipeline as a binary blob: git could not diff it, every rebuild wrote a fresh 2.7 MB object
into history, and its copies of `README.md` and `PHASE2_HANDOFF.md` had drifted behind the tracked
ones. The pipeline is tracked as ordinary files now. **Do not reintroduce a zip.** Superseded material
is deleted; git history is the only place it survives.

`.claude/` holds what is not student-facing: `prompts/` (the original production prompt
`INTERACTIVE_ARTIFACT_PROMPT.md` and the paste-in project instructions), `reports/`
(`Phase1_Report.md`, `Phase2_Audit_p22_p41.md`), `plans/`, `notes/`. Being gitignored, it
lives in this working copy only — the ambiguity ledger survives on this machine alone, so keep a copy
wherever the working copy is backed up.

Both files in `source/` are gitignored: `Book.pdf` because third-party material must never be
redistributed, and the 41 MB handwritten scan because it is too large for git history. **A fresh clone
will not contain them.** Copy them in before rebuilding or reading source pages. Nothing else in the
repository needs network access.

Keep this structure. New instructor-only records go in `instructor/`. Do not leave scratch files in
the root.

---

## 4. Building

The pipeline lives in the repository. Build in place, from the repository root:

```bash
cd build && node build.js        # → ../dist/Signals_and_Systems.html
cd ../notes && node build.js     # → ../dist/Lecture_Notes.html
cd ../notes && node topdf.js     # → ../dist/Lecture_Notes.pdf
```

Both `build.js` files resolve their output as `__dirname/../dist`, and `notes/build.js` reads
`../build/src`, so `build/` and `notes/` must stay siblings at the repository root. Moving them under
a wrapper directory means rewriting those paths first.

The artifact build is byte-reproducible: building twice from unchanged sources leaves `git status`
clean. If a rebuild produces a diff you did not author, find out why before committing.

`build.js` picks up `8[1-9]_*.js` and `9[1-9]_*.js` automatically, in sorted order. A new content file
needs only the right name (`85_scenes_m4.js` … `88_scenes_m7.js`, `96_qbank_m4_m7.js`) and its
registration in `99_tail.html`.

KaTeX is vendored and font-inlined in `build/src/20_katex.css` and `30_katex.js`. **No `npm install`,
no network fetch, ever** — the artifact must stay one offline-capable file.

For the visual audit, render the source pages at 160 dpi. Do not go lower:

```bash
mkdir -p pages && pdftoppm -r 160 -png -f 1 -l 88 \
  "source/Lecture Notes.pdf" pages/p
```

If an older build has to be recovered, take it from git history and treat it as stale until it has
been put through the gates below.

---

## 5. Verification gates

Six gates. Nothing is "done" until all six pass. **Report the numbers a run actually printed**,
never a summary in place of a run.

```bash
node --check build/src/8*.js build/src/9*.js       # parses      → silent
cd build && node qa.js                             # layout      → 0 errors, 0 overflow
cd build && node labtest.js                        # interaction → "ERRORS: none"
cd build && node textclash.js                      # labels      → "TOTAL COLLISIONS: 0"
cd build && node mathscan.js                       # mathematics → "SCENES WITH MATH DAMAGE: 0 / 58"
cd verify && ../.venv/bin/python verify_m1_m3.py   # numbers     → "50 passed, 0 failed"
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
        "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
                                       # wording + figure labels → "TOTAL VIOLATIONS: 0"
```

`node --check` is not a gate, it is the step before them: a scene file that does not parse takes the
whole artifact down, and it is the one failure the six gates report as something else entirely.

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
- `labtest.js` drives every laboratory control, every quiz path and every mode toggle.
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
- `verify_m1_m3.py` recomputes every numerical result in the content, one PASS/FAIL line each.
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

- `mathscan.js` walks every scene and reports three things: a formula KaTeX could not parse,
  mathematics left as literal `$...$` in the rendered text, and any element whose tag name is not
  valid HTML or SVG. It is the gate for the failure the other five are blind to — mathematics that is
  *present but wrong*, which damages one label and leaves the layout, the interaction, the numbers and
  the wording all correct. Its tag list is a whitelist, so a new SVG element that the artifact
  legitimately draws has to be added to it deliberately.

  **Its reach into a laboratory is partial, and this is a known hole.** It clicks the options and
  expandables of whatever the laboratory shows first, re-querying the handles per click because a
  laboratory redraws itself and detaches them. It does not drive `[data-nav]`, so it never sees the
  second and later signals, systems or cases of a laboratory. Damage in those is invisible to it:
  a broken formula inside a property panel of the fifth system of laboratory D passes this gate.
  Reaching them needs a per-laboratory walk that does not exist yet. Until it does, mathematics
  authored into `CONTENT.SYSTEMS`, `CONTENT.PROPS` or a laboratory's own item list has to be checked
  by opening the laboratory and stepping through every item by hand.

`build/domcheck.js` sits beside the gates without being one. It reports any element whose tag name is
not valid HTML, but its whitelist is missing `foreignobject`, which every typeset figure label uses,
so it currently reports 151 malformed scenes that are all correct. `mathscan.js` covers the same
ground with the right whitelist. Both scripts were lost when the old zip was last repacked and were
restored from git history.

**Playwright.** `qa.js`, `labtest.js`, `textclash.js`, `domcheck.js`, `mathscan.js` and
`notes/topdf.js` each `require` Playwright by the absolute path
`/home/claude/.npm-global/lib/node_modules/playwright`, which exists only in the container. On this
machine Playwright is installed at `~/Documents/GitHub/VERA/node_modules/playwright`, and the six
scripts run unmodified if Node's module resolver is redirected there — a short wrapper that patches
`Module._resolveFilename` and then `require`s the script does it, with nothing in `build/` touched.
**Do not rewrite the require line in place.** If the redirect should become part of the repository,
add the wrapper as its own deliberate commit.

New modules extend these suites; they never replace them. Every new numerical result gets a check in
`verify/` in the same PASS/FAIL-per-line format. Before shipping any PDF, render every page to an
image and look at it.

---

## 6. Editorial rules R1–R8

Status: **RULE**, set 2026-07-25. Binding on the interactive artifact, all lecture notes, all PDFs,
all question banks, and everything produced in later phases.

### R1 — Write as lecture notes, not as a report about lecture notes

Every student-facing text is written **directly**, as self-contained teaching material. The reader
must never be able to tell that any conversion, audit, redrawing or verification took place.

### R2 — Banned in student-facing content

Never write, in any form:

- "in the PDF", "on page X of the PDF", "PDF p. 12"
- "in this file", "in this document", "the document shows", "as shown in the attached"
- "in the source notes", "the source says", "the original notes", "the lecture notes state"
- "in the uploaded document", "the provided material"
- "redrawn from", "reconstructed from", "based on the original figure"
- "verified against", "cross-checked", "the audit found", "editorial enhancement"
- any mention of research, transformation, ambiguity ledgers, versions, phases or production process

If a sentence needs one of these to make sense, the sentence is wrong. Rewrite it so the mathematics
carries the meaning by itself.

**Correct:** "A discrete-time signal is written x[n], where n is an integer."
**Wrong:** "The source defines a discrete-time signal on p. 2 as x[n]."

**Correct:** "For 0 < t < 1 the shaded area gives y(t) = t²/2."
**Wrong:** "Redrawn from the original figure, the shaded area gives y(t) = t²/2."

### R3 — Where provenance lives instead

Source pages, traceability, ambiguity records and version data live in hidden records and
instructor-only areas: the instructor edition of the artifact, the instructor solutions document, and
internal records that are not distributed. They are never rendered in the student view and never
printed in a student document.

### R4 — Language and register

Simple, short, plain academic English, everywhere: the artifact, the lecture notes, the PDFs and the
question banks are held to one standard.

**Write for a second-year undergraduate EE student, and expect that student to understand it on the
first reading.** No sentence may need a second pass to parse. Where a word is hard because the idea is
hard, keep the word and explain it; where a word is hard only because it is fancy, replace it.

- Short sentences. One idea per sentence.
- Prefer the plain word: "use" not "utilise", "so" not "consequently", "shows" not "demonstrates".
- No hype, no praise of the material, no rhetorical questions used as decoration.
- Address the reader directly where it helps: "First find the support of each signal."
- No em-dash chains, no nested parentheses, no three-clause sentence where two sentences work.

### R5 — Simple language must not cost correctness

Plain wording is required; mathematical looseness is not permitted.

- Every symbol is defined on first use.
- Continuous-time and discrete-time cases are kept visibly separate.
- Signs, coefficients, integration and summation limits, and scale factors are exact.
- Assumptions and convergence conditions are stated wherever a result depends on them.
- Necessary and sufficient conditions are distinguished.
- Functions and distributions are distinguished. Impulse locations and weights are exact.
- Angular frequency (rad/s or rad/sample) is distinguished from frequency in hertz.
- The sinc convention is stated wherever sinc is used.

### R6 — Fixed conventions

The conventions themselves are in §7.1. R6 is the rule that they are used everywhere, without local
variation, and stated where a reader first needs them.

### R7 — Examples and figures

- Worked examples use: Given, Find, Method, Solution, Check.
- Every figure axis is labelled. Continuous-time signals are curves, discrete-time signals are stems,
  impulses are arrows whose height is the weight. Negative frequencies are shown when they exist.
- **Every piece of mathematics inside a figure is written as LaTeX.** This covers axis names, signal
  names on a block diagram, operator names, and any formula used as an annotation: `x(t)`, `y[n]`,
  `h_1 * h_2`, `\delta[n-2]`, `X(j\omega)`, `v(t)=\tfrac{1}{C}\int i(\tau)\,d\tau`. Never a plain
  string, never a Unicode substitute for a symbol — no `x₁`, `Σ`, `∫`, `−`, `τ`, `⇒`. A label is
  typeset with KaTeX so it reads in the same type as the equations in the running text, with words
  inside it in `\text{...}`. Plain words that are not mathematics — `input`, `output`, `CT system` —
  stay plain sans-serif text, and so do the bare numbers the frame itself prints: a tick number and
  the weight an `impulse()` carries are part of the scale, not of the running mathematics. The
  mechanics are in §7.3.
- **An annotation is figure mathematics too.** `note()`, `span()` and every label in `blocks()` are
  held to the same standard as an axis name. A label carrying a symbol, a relation or an operator is
  written as TeX and marked `tex:true`; `italic:true` is not a substitute, because it slants a plain
  string instead of typesetting it. `p(t) = v²(t)  (R = 1)` is wrong; `p(t)=v^{2}(t)\;\;(R=1)` is
  right. `u(t): P∞ = 1/2` is wrong; `u(t):\;P_\infty=1/2` is right. The banned Unicode substitutes
  include `∞`, every superscript and subscript digit — `²`, `³`, `₁`, `₂` — and `Σ`, `∫`, `−`, `τ`,
  `ω`, `⇒`, `→`, `×`, `·`, `≤`, `≥`. Mixed text and mathematics goes in one TeX string with the words
  in `\text{...}`: `\text{rectangular pulse}:\;P_\infty=0`.
- **Spacing inside a label is TeX, and a TeX backslash is doubled in a JavaScript string.** Write
  `'\\;'`, `'\\text{...}'`, `'\\to'`. A single backslash is silently eaten — `'\;'` is the string
  `;`, and `'\text'` is a tab followed by `ext` — so a bare `;` or a stray tab inside a label means a
  lost backslash, never a spacing choice. A label is never separated by a raw `;` or by run-together
  spaces.
- A figure caption explains what the figure means. It never explains where the figure came from.
- Nothing written inside a figure may be crossed by anything drawn in it. A variable name sits outside
  the data area: the independent variable under the lower edge, the dependent variable above the upper
  edge. Annotations go in free space, not over a signal. Tick numbers stay on the axis and carry a halo
  in the page colour, so a curve or stem passing behind them is interrupted rather than run through the
  digits.
- **An axis name never crosses the figure.** `xlabel` and `ylabel` stay clear of everything else the
  figure draws: the data, the axis line, the arrowhead at its end, the tick marks and the tick numbers.
  `textclash.js` fails on any such contact, so this rule is enforced rather than remembered. Where a name
  has no room, widen the margin; never move it back inside the data area and never close the gap to make
  a figure fit.
- No label may sit on another label, at any step of a scene.

### R8 — The rules are checked mechanically

`tools/rule_check.py` fails on a banned phrase; `build/textclash.js` fails on a crossed or overlapping
label. Both run before any delivery, and §5 says what each must report.

---

## 7. Fixed decisions

### 7.1 Mathematical conventions

- Energy and power are **normalised**, R = 1 Ω. Say so once, where energy is introduced.
- The imaginary unit is `j`. The source handwriting uses a capital *J*; we do not.
- `X(jω) = ∫ x(t)e^{−jωt} dt` · `x(t) = (1/2π)∫ X(jω)e^{jωt} dω`
- `X(e^{jω}) = Σ x[n]e^{−jωn}` · `x[n] = (1/2π)∫_{2π} X(e^{jω})e^{jωn} dω`
- sinc is **unnormalised**, `sinc(θ) = sin θ / θ`, restated at every point of use.
- The source labels the sampling chapter CH#7 and has no CH#6. **Do not invent a missing chapter.**

### 7.2 Signal colour semantics

Reused unchanged in every module:

cyan `#14707F` input / CT signal · amber `#C08422` impulse response / system · green `#4A7A46` output ·
violet `#6A5A92` intermediate transformation · red `#A63B2A` error / misconception / aliasing.

Canvas ivory `#F7F2E8` · ink `#1B1A17` · coral `#BE5539` editorial emphasis · slate `#4A657F` metadata ·
navy `#16232F` for module-opening and synthesis scenes only.

### 7.3 Architecture locks

- **One file.** No network requests, no analytics. Progress is stored on the local device only.
- **Fixed 1920×1080 stage.** `fitScene()` scales an oversized scene down to a floor of 0.82. It is a
  safety net, not a licence to overfill: a scene that needs below ~0.90 is split instead. The factor is
  found by iteration, because the scaled column is laid out 1/k wider and a figure that fills its column
  grows with it — one pass of `avail/need` is always too optimistic. On the floor a scene can still be
  too tall, and what is left is taken from the figures: each one is capped in proportion to its height
  and shrinks inside its aspect ratio rather than being cut off at the foot of the page. A scene that
  gives up more than 3% of its figure height marks itself `data-capped`, and `qa.js` names it under
  `dense`. Reaching that rescue is the signal to split the scene, not the permission to leave it.
- **Radial and orbital compositions** are reserved for course maps and synthesis scenes.
- **Axis names live outside the data area** — the independent variable under it, the dependent variable
  above it — and `Axes` widens the bottom or top margin by itself when the given `pad` is too small.
  Every label in a figure carries a halo in `--fig-halo`, the page colour of the current palette. Do not
  move labels back inside the data area.
- **`xlabel` and `ylabel` are TeX source**, typeset with KaTeX so an axis name reads like the equations
  in the running text. Words inside a name go in `\text{...}`, Greek letters are written `\tau`,
  `\omega` and so on, and `\operatorname{Re}` is the house spelling. A name that fails to parse falls
  back to its source text and logs a console error, which turns `qa.js` red. The name is laid out in a
  `foreignObject` and drawn after the data, so a signal leaving the data area is interrupted by the name
  instead of drawn across it. The strip reserved for a name is one line of mathematics tall — `NAMEBOX`
  in `60_plot.js` — and the independent variable sits `XNAME_DROP` below its axis so it clears the tick
  row even at the right-hand edge, where the two share a column. Do not shrink either. `XNAME_DROP` also
  carries the name past the arrowhead the axis ends in, so the two never touch; an axis drawn without
  arrows keeps the same drop. Both names are written with `role:'axisname'`, which puts them under the
  strict half of the collision sweep — see §5. If a name still lands on a tick number or on the axis, the
  margin is too tight: raise `pad`, not the name.
- **`texName` in `60_plot.js` typesets every other piece of mathematics in a figure too.** It anchors a
  formula on `xLeft`, `xMid` or `xRight` at a given baseline, so a TeX label drops into the position a
  plain string held. In `blocks()` a label that is mathematics is marked `tex:true` — on a `box`, a
  `text` or an `arrow` — and plain words are left as ordinary text. Every one of these labels is written
  into a `foreignObject` marked `data-texlabel`, which is what `textclash.js` measures, so typeset
  mathematics stays inside the collision sweep.
- **A trace stays inside the data area.** `curve()` and `poly()` are clipped to the data area, widened by
  `CLIP_PAD` so a trace touching the edge of the range keeps the full width of its stroke while a real
  excursion is cut. Without this a signal that runs far past the chosen range — `1/2T` as `T` goes to
  zero — is drawn across the axis names and out of the top of the figure. Do not remove the clip to make
  an overshoot visible; choose a range that holds the signal, or say in the caption that it leaves.
- **A figure belongs to the palette it is drawn in.** No figure code carries a page, plate or ink
  colour of its own: `PLOT.COL` holds `plate`, `canvas`, `rule` and `ruleStrong` beside the signal
  colours, and `setTheme` swaps all of them, so a figure on the dark page is a dark figure and not a
  light one pasted onto it. A block outline or a summing junction has no fill at all — the label halo
  does the separating. A figure built in JavaScript must be produced per render: `fig` blocks already
  take a function, and a `raw` block may take one too. A figure generated once at load time keeps the
  palette it was born with, which is the bug that made the title motif light-only.
- **The title motif animates on a fixed contract** (`.mtf-*` in `10_style.css`,
  `motifSignalSystem()` in `81_scenes_m0.js`). The figure draws itself once, then one 7 s cycle sends a
  highlight along the route the information takes: trace, input wire, system, output wire, spectrum.
  Nothing is displaced and nothing disappears, so the resting state is the complete figure — which is
  also what prints and what `Motion: reduced` and `prefers-reduced-motion` show. Any change here keeps
  that property.
- **The title motif is the one figure that does not follow the palette**, and the exception is
  deliberate. Its two signals sit on cathode-ray screens — a scope on the input, an analyser on the
  output — and a screen is dark on the ivory page and on the dark page alike, so `SCR` and `PH` in
  `81_scenes_m0.js` hold screen and phosphor colours of their own instead of reading `PLOT.COL`.
  Everything outside the two screens — the system block, its label, `h(t)`, the wires — still follows
  the theme. The signal semantics of §7.2 survive the exception because the tube carries two phosphors:
  cyan `#4FBECE` on the scope for the input, green `#82C27B` on the analyser for the output. A single
  green phosphor is what a real tube would have and is wrong here, because green already means output.
  The screen furniture — graticule `#1E2A2E`, shadow mask `#060B0D`, edge `#25343A`, face `#0A0F12` —
  is registered in `textclash.js` as guide and plate tokens, the way the navy plates already are.
  Nothing else in the artifact may take these colours.

### 7.4 Sources

`Book.pdf` is a **cross-check reference only**. It is never reproduced, quoted or redistributed in any
form. Open the cross-check ledger for Modules 5–6, where transform conventions, convergence conditions
and scale factors genuinely need a second source.

---

## 8. Known traps

- **The `t` / `hd` key bug.** In the notes pipeline the block-type key is `t`, and a worked example's
  heading key is `hd` — never `t`. Two `t` keys in one object literal silently drop the whole block.
  This removed all 18 worked examples from the first build.
- **Never run a blanket search-and-replace over `build/src/*.js`.** A backslash or a semicolon means
  one thing in the JavaScript and another inside a TeX string, and no pattern separates the two. A
  sweep over `;` turns every statement terminator into `\;` and the file stops parsing; the reverse
  sweep repairs the code and strips `\;` out of every label, which parses but renders a semicolon
  where a thin space belongs. Both happened. Edit the labels one at a time, and after any change to
  authored mathematics run `node --check build/src/8*.js` before the gates.
- **`audit/inventory_p*.md` are mapping-grade only.** They came from delegated readers and are a
  checklist to verify against, **not truth**. Nothing from pp. 22–88 may be authored before the relevant
  pages have been read directly at 160 dpi. The 13 flagged candidates — analysis/synthesis label swaps,
  sign errors, a 1000× sampling-period slip — are listed in `PHASE2_HANDOFF.md` §5 Step 1.
- **Never correct the source silently.** Every confirmed issue is recorded in the ledger format of
  `.claude/reports/Phase1_Report.md` §2 and stated in the artifact at the point where it occurs.
  Numbering continues from **A-09**.

---

## 9. Working in a session

- Edit the pipeline in place. A change to `build/src/*`, a rebuild, the gates, and a commit are the
  whole loop; there is no staging tree and no archive to repack.
- Commit rebuilt `dist/` files in the same commit as the sources that produced them, so the tracked
  deliverables never lag behind the tracked pipeline.
- The working tree is shared. If more than one session is working in this repository, run `git status`
  before writing anything generated, and rebuild before delivering — an artifact built from a tree that
  has moved underneath you is not the artifact anyone else is looking at.
- When a task spans several hours or is interrupted, update `instructor/PHASE2_HANDOFF.md` before
  ending. It is what the next session reads.
