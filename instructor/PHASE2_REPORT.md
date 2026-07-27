# Signals and Systems artifact — Phase 2, the record of what was built

**Status: complete.** Phase 2 finished 2026-07-27. Artifact version **v1.0**.

This file was the Phase 2 work order. It is now the record of what that order produced. Sections 3, 4,
6, 9, 10 and 11 are unchanged: the build architecture, the design system, the conventions, the editorial
rule and the lecture-notes pipeline did not move during Phase 2, and they remain the operating reference
for anyone editing the artifact. Sections 0, 1, 2, 5 and 7 are rewritten to say what happened.

---

## 0. One-paragraph state

The artifact carries the whole course: **220 scenes across Modules 0–7**, ten interactive laboratories
A–J, seven 12-question banks with full solutions and distractor reasoning, and a lecture-notes
HTML/PDF pipeline beside it. All 88 source pages were read directly at 160 dpi before anything was
authored from them, and every page is mapped to the scenes and questions that carry it in
`coverage_matrix.md`. Seventy-seven confirmed issues in the source material are recorded as A-09 … A-104
in `.claude/reports/Phase2_Ledger.md`, and each one is stated in the artifact at the point where it
occurs, in the artifact's own voice. Nothing about the design system, the build pipeline or the content
schema was re-decided.

---

## 1. Where everything lives

Everything is in the repository at `~/Documents/GitHub/signals-and-systems`, tracked as ordinary files.
There is no zip, no staging tree and no archive.

| Path | What it is |
|---|---|
| `build/` | the artifact pipeline: `build.js`, `src/`, and the gate scripts |
| `notes/` | the lecture-notes pipeline: `build.js`, `topdf.js`, `src/`, `mathscan.js` |
| `verify/` | the numerical suites and the question-bank checks |
| `tools/rule_check.py` | the R1–R9 banned-phrase and figure-label scanner |
| `instructor/` | this file and `coverage_matrix.md` — instructor-grade, never distributed |
| `.claude/reports/` | `Phase1_Report.md`, the four Phase 2 audit reports, `Phase2_Ledger.md` |
| `dist/` | generated deliverables, never hand-edited |
| `source/` | the two PDFs, **not in git** — copy them in before rebuilding or reading source pages |

`source/Book.pdf` and the 41 MB handwritten scan are gitignored: the first because third-party material
is never redistributed, the second because it is too large for git history. A fresh clone will not
contain them.

---

## 2. Building and verifying

From the repository root. Both `build.js` files resolve their output as `__dirname/../dist`, and
`notes/build.js` reads `../build/src`, so `build/` and `notes/` must stay siblings.

```bash
cd build  && node build.js        # -> ../dist/Signals_and_Systems.html
cd ../notes && node build.js      # -> ../dist/Lecture_Notes.html
cd ../notes && node topdf.js      # -> ../dist/Lecture_Notes.pdf
```

The artifact build is byte-reproducible: building twice from unchanged sources leaves `git status`
clean. A diff you did not author means something else changed; find out what before committing.

The seven gates, and what each must print, are in `CLAUDE.md` §5. On this machine every Playwright gate
is run through `build/pw.js`, which redirects Node's module resolver to the local Playwright install and
then requires the gate unmodified — the gates themselves keep the container path and are not rewritten.

`.venv/` is a local arm64 virtualenv holding numpy and sympy; it is gitignored and a fresh clone rebuilds
it with `/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install numpy sympy`.

To re-render the source pages for a visual check:

```bash
mkdir -p pages && pdftoppm -r 160 -png -f 1 -l 88 "source/Lecture Notes.pdf" pages/p
```

KaTeX is vendored and font-inlined. **No npm install, no network fetch, ever** — the artifact must stay
one offline-capable file.

---

## 3. Build architecture (do not redesign this)

```
build/
  build.js              concatenates src/* into one self-contained HTML
  qa.js                 renders every scene at its densest reveal state, measures overflow, screenshots
  labtest.js            drives every laboratory control at nominal + boundary values
  src/
    00_head.html        document shell, overlays (map / search / glossary / help), chrome
    10_style.css        the design system — tokens, type scale, grid, scene skeleton
    20_katex.css        KaTeX CSS with all woff2 fonts base64-inlined (generated, do not edit)
    30_katex.js         KaTeX (vendored, do not edit)
    40_core.js          APP: state, local-only storage, routing, keyboard, overlays, search
    60_plot.js          PLOT: SVG axes/curve/stem/impulse/area/annotation primitives
    70_labs.js          LABS A–E
    80_content_core.js  CONTENT: META, MODULES, GLOSS, PROPS, SYSTEMS  (course data only)
    81_scenes_m0.js     SCENES_M0        ← content files are plain data + figure closures
    82_scenes_m1.js     SCENES_M1
    83_scenes_m2.js     SCENES_M2
    84_scenes_m3.js     SCENES_M3
    90_app.js           RENDER: block renderer, quiz engine, fit-to-scene
    91_scenes_end.js    SCENES_END (closing synthesis + provenance)
    95_qbank.js         CONTENT.QBANK — Q1/Q2/Q3
  99_tail.html          assembles the scene list and boots the app
```

`build.js` picks up `8[1-9]_*.js` and `9[1-9]_*.js` automatically and sorts them, so **new content files just
need the right filename**: `85_scenes_m4.js`, `86_scenes_m5.js`, `87_scenes_m6.js`, `88_scenes_m7.js`,
`96_qbank_m4_m7.js`. Register each in `99_tail.html`'s concat list (`window.SCENES_M4`, …).

### Scene schema
```js
{ id:'m4-eigen', module:'M4', nav:'Eigenfunctions', title:'…', src:'pp. 22–23',
  objective:'…', keywords:'… for search …', steps:3, dark:false,
  blocks:[ … ] }
```
`steps` = number of reveal states; a block `{t:'reveal', at:n, items:[…]}` appears once `APP.state.step >= n`.

### Block types available
`eyebrow · title · sub · lede · body · small · rule · eq · note(def|warn|err|ok) · legend · wex · fig ·
grid · cols · stack · instr · lab · check · qbank · raw`
Inline math is `$…$` inside any text field; display math is the `eq` block's `tex`.
`{{sym:key|label}}` links a symbol to the glossary entry `CONTENT.GLOSS.key`.

### Question schema (`95_qbank.js` pattern)
`{ id, module, kind, src, stem, opts[4], a, why, wrong{}, hints[], sol, err, teach }`

---

## 4. Design system — locked, do not drift

- Canvas warm ivory `#F7F2E8`; ink `#1B1A17`; coral `#BE5539` for editorial emphasis; slate `#4A657F` for
  eyebrows and metadata; navy `#16232F` for module-opening and synthesis scenes only.
- **Signal colour semantics are fixed and must be reused in Modules 4–7:**
  cyan `#14707F` = input / CT signal · amber `#C08422` = impulse response / system ·
  green `#4A7A46` = output · violet `#6A5A92` = intermediate transformation ·
  red `#A63B2A` = error / misconception / **aliasing**.
- Serif display (Iowan Old Style stack) for titles; Inter stack for body; mono for eyebrows.
- Fixed 1920×1080 stage, scaled to viewport. A `fitScene()` pass uniformly scales any scene that still
  exceeds the canvas (floor 0.82) — **it is a safety net, not a licence to overfill a scene.** If a scene
  needs a scale below ~0.90, split it instead.
- Radial/orbital compositions are reserved for course maps and synthesis scenes. Do not repeat them.

---

## 5. What was built

### 5.1 The audit came first

Pages 22–88 were read directly at 160 dpi, one page at a time, before any of Modules 4–7 was authored.
The delegated inventories in `audit/` were used as a checklist to verify against, never as truth, and
several of their flagged candidates did not survive a direct reading. Four audit reports record the
method, the confirmed issues and — as importantly — the candidates that were checked and dismissed:

| Report | Pages | Ledger block | Used |
|---|---|---|---|
| `.claude/reports/Phase2_Audit_p22_p41.md` | 22–41 | A-09 … A-21 | 13 |
| `.claude/reports/Phase2_Audit_p42_p55.md` | 42–55 | A-22 … A-49 | 20 |
| `.claude/reports/Phase2_Audit_p56_p71.md` | 56–71 | A-50 … A-79 | 19 |
| `.claude/reports/Phase2_Audit_p72_p88.md` | 72–88 | A-80 … A-109 | 25 |

The four ledgers are merged into one continuous record in `.claude/reports/Phase2_Ledger.md`:
**77 entries, A-09 through A-104, no id used twice**, with the unused numbers accounted for as block
tails. That file also carries the column the per-wave ledgers could not: where in the artifact each
issue is stated.

All thirteen candidates the original work order flagged as most consequential were resolved by direct
reading — each one either confirmed and given a ledger id, or dismissed and recorded as dismissed in
the relevant report's `## 3. Verified correct` section. Among those confirmed: the analysis/synthesis
label swaps, the boxed `a₀ = 0` that contradicts its own plot, the impulse-train integral with both
limits written `−T/2`, the sign flip on p. 63, the `W/n` against `W/π` prefactor on p. 68, and the
1000× sampling-period slip on p. 83.

### 5.2 The modules

| Module | Source pp. | Scenes | Laboratory | Bank | Numerical suite |
|---|---|---|---|---|---|
| M4 · Fourier Series | 22–41 | 37 | F, G | Q4 | `verify_m4.py` |
| M5 · Continuous-Time Fourier Transform | 42–63 | 50 | H | Q5 | `verify_m5.py` |
| M6 · Discrete-Time Fourier Transform | 64–79 | 42 | I | Q6 | `verify_m6.py` |
| M7 · Sampling and Aliasing | 80–88 | 27 | J | Q7 | `verify_m7.py` |

Every module came in above the scene target the work order set, and in every case for the same reason:
§7.3 of `CLAUDE.md` requires a scene needing a fit below about 0.90 to be split rather than compressed,
and the derivations would not compress without losing steps. Module 4 ran at 1.85 scenes per source
page, Module 5 at 2.3, against about 2.8 for Modules 0–3. **The scene targets in the original work order
were too low, and the density rule is what should be trusted.**

Laboratory J keeps spectral replication and aliasing visually and verbally distinct throughout, as the
work order required: the copies appear at every rate, and only their overlap is drawn in the aliasing
colour.

### 5.3 The Phase 1 density debt, closed

Five Modules 1–3 scenes were still being held together by a scale factor at the 0.82 floor and were
giving up figure height to fit — `m3-ex-ct1` by 20%, `m3-ex-dt1` by 16%, `m1-ct-cexp` by 12%, `m2-ti`
by 10% and `m1-classify` by 5%. All five were split, in the same way the Phase 2 modules were:
`m1-classify-b`, `m1-ct-cexp-b`, `m2-ti-b`, `m3-ex-dt1-b`, `m3-ex-ct1-b`. **No scene in the artifact now
gives up any figure height.** Two scenes remain merely scaled, `m1-open` and `m1-ct-impulse`, both at
0.875 and neither capped.

### 5.4 The gates were extended, not replaced

`verify/qbank_check.py` covered Q1–Q4 only for most of Phase 2 — a gap every module wave correctly
declined to close, because the file belongs to no module. It now covers **Q1 through Q7, 254 checks**.
Extending it caught one defect no other gate could see: a distractor in Q6-05 quoted `0.286479` for
`sin(W)/(πW)` at `W = π/4`, where the value is `0.286580`.

Nine sentences in `95_qbank.js` had been left broken by the Phase 1 R1 cleanup — an expression removed
from the middle of a clause, leaving a double space and, twice, a sentence that no longer parsed as
English. All nine are repaired, and a sweep of every scene, laboratory, bank and notes file found no
further instance.

### 5.5 The gates, and what they printed

The final run, over the whole tree:

```
node --check build/src/7*.js 8*.js 9*.js   silent — every file parses
build/build.js                             1.77 MB · 24 js modules
notes/build.js                             notes html 0.87 MB

qa.js              scenes 220 · errors 0 · overflow 0
                   dense: m1-open 0.875 scaled, m1-ct-impulse 0.875 scaled — neither capped
labtest.js         LABORATORIES SWEPT: B A C D E F G H I J · ERRORS: none
textclash.js       FIGURES CHECKED: 666 flagged, of which 663 are haloed tick
                   labels (accepted) · TOTAL COLLISIONS: 0
mathscan.js        SCENES WITH MATH DAMAGE: 0 / 220
notes/mathscan.js  PAGES: 9 · LITERAL MATH IN NOTES: 0 · KATEX ERRORS: 0
labwalk.js         STATES WALKED: 914 · PROBLEMS: none · CONSOLE/PAGE ERRORS: none

verify_m1_m3.py     50 passed, 0 failed
verify_m4.py       115 passed, 0 failed
verify_m5.py       192 passed, 0 failed
verify_m6.py       222 passed, 0 failed
verify_m7.py       148 passed, 0 failed
qbank_check.py     254 checks, 254 passed, 0 failed
qbank_struct.js    ALL STRUCTURAL CHECKS PASSED
rule_check.py      TOTAL VIOLATIONS: 0
```

Both builds are byte-reproducible: building twice from unchanged sources gives the same SHA-256 both
times, for the artifact and for the lecture notes.

### 5.6 A new gate, and the two defects it found

`build/labwalk.js` closes the hole `mathscan.js` has always had. `mathscan.js` sees only whatever a
laboratory shows first, because it does not drive `[data-nav]`, `[data-case]`, `[data-wave]`,
`[data-fac]` or a segmented control. `labwalk.js` opens every item of every laboratory, in both themes,
moves every slider to the bottom, middle and top of its range, and reads each state back out — 914
states. It fails a state on a KaTeX error node, on mathematics left as a literal `$...$` outside a
`.katex` subtree, on a raw TeX macro in the running text, on a readout gone to `NaN`, `Infinity` or
`undefined`, on a panel that drew no figure where one belongs, and on any console or page error logged
while the state was open.

Its first run found real damage that had been invisible to every gate: **Laboratory B interpolated its
`why` field raw**, so the later items printed `$2N+1$`, `$t\to-\infty$` and `$1/2$` as source text
rather than as type. That is exactly the R8 failure — "a field the renderer interpolates raw prints the
dollar signs on the page" — in the one place nobody proofreads, because the first item of the
laboratory happens to contain no mathematics. The verdict block now goes through `M()`, and a sweep of
every other laboratory renderer found no second instance.

The second defect was found by generating the instructor edition: `Q3-06`'s distractor carried
`y\,'(0)` — a thin space in front of a prime, which KaTeX cannot parse. The artifact's own gates never
saw it because they do not open every question's solution.

### 5.7 The closing synthesis

`91_scenes_end.js` carried a synthesis written for Modules 0–3. It now carries the whole course: a
ten-step through-line from "a signal is a function" to spectral replication, a scene naming what each
module added, and the conventions page. Its through-line figure was rebuilt to typeset its mathematics
through `texName` rather than printing Unicode substitutes, which is what R7 requires and what the raw
SVG it replaced had never done.

### 5.8 The four printed editions

| Edition | Pages | Built from | Tracked |
|---|---:|---|---|
| Lecture notes | 72 | `notes/build.js` — Chapters 1–7 and Appendix A | yes |
| Student workbook | 34 | `notes/editions.js` — every question, no answers | no |
| Instructor solutions | 85 | `notes/editions.js` — every question fully worked, with provenance | no |
| Formula and notation reference | 6 | `notes/editions.js` — conventions, Appendix A, glossary | no |

The count was settled with the user: **four documents, with the artifact itself as the primary
edition beside them.** A 16:9 presentation print of the artifact was considered and not produced.

The three new editions are generated from the content the artifact already carries — `CONTENT.QBANK`,
`CONTENT.GLOSS`, `CONTENT.META` and the notes' own Appendix A — so a question id means the same thing
in every one of them and nothing is a second copy that would have to be kept in step by hand. They use
the lecture notes' renderer, stylesheet and KaTeX build, so the four documents are one typographic
family.

**Every page of every edition was rendered to an image and looked at: 197 pages.** Two layout faults
were found and fixed. The reference's title-page meta block collided with the `PART 1` heading, and
the workbook's contents list pushed its last row onto a second page. Neither would have been visible
from the HTML.

Only `dist/Lecture_Notes.pdf` is tracked, as it was before. The other three are regenerated by
`cd notes && node editions.js` and one `topdf` run; tracking them would write several megabytes of new
binary into history on every rebuild, which is the reason the old release zip was removed.

---

## 6. Conventions that must not drift

- Energy and power are **normalised**, R = 1 Ω. Stated explicitly wherever a physical number appears.
- Imaginary unit is `j` (the source handwriting uses capital *J*).
- `X(jω) = ∫ x(t)e^{−jωt} dt` · `x(t) = (1/2π)∫ X(jω)e^{jωt} dω`
- `X(e^{jω}) = Σ x[n]e^{−jωn}` · `x[n] = (1/2π)∫_{2π} X(e^{jω})e^{jωn} dω`
- sinc is **unnormalised**, `sinc(θ) = sin θ / θ`, restated at every point of use.
- The source labels the sampling chapter CH#7 and has no CH#6. **Do not invent a missing chapter.**
- Every scene carries its source pages in the `src` **data field**, and every question in its `src` field.
  This is metadata, not copy: it renders only in the instructor edition, and nothing derived from it —
  no `[Source: …]` tag, no "editorial enhancement", no "editorially developed" — ever appears in
  student-facing text. §8 governs; this bullet was reworded on 2026-07-25 to remove the contradiction
  with it. `tools/rule_check.py` enforces the ban.
- Visible language: academic English. Conversation with the user: Turkish.

---

## 7. Open items at v1.0

1. **`build/labwalk.js` carries a hand-written map of the laboratories.** It closes the hole
   `mathscan.js` has (see §5.6), but it does so from a `PLAN` table that names each laboratory's item
   selectors and slider keys explicitly. A laboratory that gains a control the table does not list will
   be walked without it, silently. The table has to be extended whenever a laboratory grows, and there
   is nothing that checks it against the built artifact. Making it derive the control set from the DOM
   instead would remove that failure mode.

2. **Frequency tick labels are written in multiples of π** — `0`, `π/2`, `-2π` — as plain text rather
   than as typeset mathematics. R7 exempts "the bare numbers the frame itself prints", and a tick
   reading `2π` is not strictly a bare number. Modules 6 and 7 arrived at this convention
   independently. It is recorded as a decision, not an oversight; if the rule is to be tightened, it
   must be tightened for both modules at once.

3. **The `Book.pdf` cross-check ledger was not opened.** Modules 5 and 6 are where a second source
   would genuinely help — transform conventions, convergence conditions, scale factors. Every such
   value in those modules is instead checked numerically in `verify_m5.py` and `verify_m6.py`, which is
   a different kind of assurance and not a substitute for a second reading.

4. **`build/domcheck.js` is not a gate and should not be run as one.** Its whitelist is missing
   `foreignobject`, which every typeset figure label uses, so it reports every scene that contains one
   as malformed. `build/mathscan.js` covers the same ground with the correct whitelist.

5. **`.claude/` and `CLAUDE.md` are gitignored.** The entire operating record — the ambiguity ledger,
   the audit reports, the wave plans and the project instructions — exists on this machine only. Back
   up the working copy, not just the repository.

---

## 8. Editorial rule added after Phase 1 (binding)

The editorial rules R1–R8, now carried in `CLAUDE.md` §5.1, are a **rule**, not a preference.
Student-facing text is written directly as teaching material. Banned everywhere a student can read: "in the PDF", "in this file", "in the source
notes", "in the uploaded document", "the document shows", "redrawn from", "verified against",
"editorially developed", and any mention of conversion, research, auditing, ledgers, versions or phases.
Source pages and provenance live only in hidden records and instructor-only areas. Language is simple,
short, plain academic English; mathematical correctness, conditions and notation are unchanged.

`tools/rule_check.py` enforces it. Run it on every student-facing source file before delivery:

```bash
python3 tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
        "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
# expects: TOTAL VIOLATIONS: 0
```

The artifact was swept for this rule after Phase 1 (82 violations found and cleared). Source references
now render only in the instructor edition. Modules 4-7 must be authored compliant from the first line.

## 9. Lecture-notes pipeline

```
notes/
  build.js        assembles dist/Lecture_Notes.html (reuses the artifact's KaTeX and PLOT modules)
  topdf.js        prints it to dist/Lecture_Notes.pdf via headless Chromium, A4 portrait
  src/notes.css   print stylesheet
  src/render.js   block renderer for the document
  src/c1.js       front matter and Chapter 1
  src/c23.js      Chapters 2 and 3, Appendix A
```

Block types: `title page h1 h2 h3 p ul ol eq eqbox box ex fig figrow table toc hr q raw`.
**Watch out:** the block-type key is `t`. A worked example's heading key is `hd`, never `t` — using `t`
twice in the same object literal silently drops the whole block. That bug removed all 18 worked examples
from the first build.

Chapters 4-7 of the notes follow the same pattern: add `src/c4.js` … and extend the concat in `build.js`.
The remaining document deliverables (student workbook, instructor solutions, formula card, 16:9
presentation print) reuse this pipeline.

---

## 10. Maintenance record — 2026-07-25, inline-math pipeline repair

Three defects were found in the way inline `$…$` reaches the canvas. All three are pipeline faults, not
content faults, so nothing was added to the source ledger (numbering still continues from **A-09**).

**D1 · innerHTML read-back.** Six sites in `70_labs.js` assigned an HTML fragment and then re-read
`element.innerHTML` to substitute `$…$`. The read-back re-serialises a mathematical `<` as `&lt;`, which
KaTeX cannot parse, and on assignment the parser reads `<P` as the start of a tag. Laboratory B rendered
`E_\infty&lt;\infty` as a red parse error and left a stray `< span="">` in option B. Fix: a single helper
`M(html)` substitutes inline math **on the string, before assignment**; every read-back was removed. Note
that this also repaired laboratory A's "Order matters" note and laboratory E's "Do not skip the flip"
note, whose inline math had never been typeset at all.

**D2 · headings bypassed `md()`.** In `90_app.js` the `note.head`, `eq.label`, `eyebrow.text`, `wex` key
and `instr.head` fields were interpolated raw, so `$…$` inside them stayed literal on seven scenes
(`m1-avgpower`, `m1-ct-cexp`, `m3-ex-ct1`, `m3-ex-dt2`, `m3-steps`, `m3-convint`, `m3-representation`).
All five now pass through `md()`. The same fields in `notes/src/render.js` (`box.hd`, `ex.hd`, `ex` row
keys, `eqbox.cap`, `title.meta`, `toc` entries) were hardened identically; the notes content in the tree
does not currently exercise them, so the notes PDF is byte-identical.

**D3 · two captions truncated by the R1–R8 sweep.** `82_scenes_m1.js:303` and `:591` had lost the head of
the sentence together with the banned provenance phrase, leaving `'5,1.5]\to[2,6]$.'` and `'5$): a
sinusoid…'` — an odd number of `$`, so the remainder rendered as raw TeX. Both captions were rewritten as
teaching text. A whole-tree scan found exactly these two.

**Two gates added, so the class cannot recur:**

- `tools/rule_check.py` now also reports **S1** (odd number of `$` in a string field — an inline-math span
  left open, the D3 signature) and **S2** (`innerHTML` read back and reassigned with `$` substitution —
  the D1 signature). Both were confirmed to fire on the original defects before the fix was applied.
- `build/qa.js` now records, per scene, any `.katex-error` element and any `$…$` that survived into
  rendered text, and reports them as `mathDamage`. `build/mathscan.js` is a deeper sweep of the same kind:
  it walks all 59 scenes and additionally clicks every laboratory option and disclosure, which is how D1
  was localised. Run it after any change to `70_labs.js` or `90_app.js`.

Gate results after the repair: `qa.js` 59 scenes, 0 errors, 0 overflow, `mathDamage: []` (one scene scaled
to 0.976, unchanged) · `labtest.js` `ERRORS: none` · `verify_m1_m3.py` 50 passed, 0 failed ·
`rule_check.py` TOTAL VIOLATIONS: 0 · `mathscan.js` 0 scenes with math damage.

### Open finding — the R1 gate is weaker than it looks

`rule_check.py`'s banned-phrase list is **case-sensitive and incomplete**, so "TOTAL VIOLATIONS: 0" does
not yet mean the editorial rule holds. Two gaps, both still present and deliberately left unfixed pending
a decision:

1. Case. Matching `re.I` surfaces five student-facing uses of "The source …" that the current gate misses
   (`82_scenes_m1.js:280`, `:515`, `:605`; `83_scenes_m2.js:155`, `:222`). Under R1 these must be rewritten
   so the mathematics carries the meaning. Making the list case-insensitive also produces seven false
   positives on the legitimate solution step "Cross-check:", so the `cross-check` pattern needs narrowing
   to its provenance sense at the same time.
2. Page references. The list contains no pattern for `p. 15` / `(pp. 6–7)`, and roughly ten of them are
   visible to students inside `95_qbank.js` worked solutions (e.g. `:53`, `:172`, `:327`, `:395`, `:412`,
   `:425`, `:601`). The `src:` fields and the file's section comments are legitimate and must stay exempt.

Fixing both means editing worked-solution prose, which is content, so it was not done unilaterally.
