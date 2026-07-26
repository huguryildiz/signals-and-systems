# Signals and Systems artifact — Phase 2 handoff brief

**Read this first in the new session.** It contains everything needed to continue without re-deriving anything.
Written 2026-07-25 at the end of the Phase 1 session. Artifact version at handoff: **v0.9**.

---

## 0. One-paragraph state

An interactive learning artifact exists and works: 58 scenes covering Modules 0–3, five interactive
laboratories, three 12-question banks with full solutions, all built from a page-by-page visual audit of
PDF pp. 1–21. Everything is verified (50/50 computational checks, zero clipping, zero runtime errors).
**Phase 2 is: visually audit PDF pp. 22–88 page by page, then author Modules 4–7 into the same artifact,
then generate the five PDF editions.** Nothing about the design system, build pipeline or content schema
needs to be re-decided.

---

## 1. Files on the user's machine

All under `~/Desktop/signals-and-systems/`:

| File | What it is |
|---|---|
| `Lecture Notes.pdf` | the primary source, 88 pp., handwritten scans |
| `Book.pdf` | Oppenheim/Willsky/Nawab — **secondary reference only; never reproduce, quote or redistribute** |
| `INTERACTIVE_ARTIFACT_PROMPT.md` | the original production prompt |
| `Signals_and_Systems.html` | the built artifact (v0.9) |
| `Phase1_Report.md` | scope statement, ambiguity ledger, verification and QA results, version manifest |
| `coverage_matrix.md` | the 88-page source-coverage matrix |
| `Phase1_sources.zip` | **everything needed to rebuild** — see §2 |
| `PHASE2_HANDOFF.md` | this file |

The cloud container from the Phase 1 session is gone. Rebuild the working tree from the zip.

---

## 2. Rebuilding the working tree (first commands in the new session)

```bash
# stage the zip and the source PDF from the user's Desktop, then:
mkdir -p /tmp/signals-and-systems && cd /tmp/signals-and-systems
unzip -q /mnt/user-data/uploads/signals-and-systems/Phase1_sources.zip -d .
# re-render the source pages for the visual audit (160 dpi is legible; do not go lower)
mkdir -p pages && pdftoppm -r 160 -png -f 1 -l 88 "/mnt/user-data/uploads/signals-and-systems/Lecture Notes.pdf" pages/p
cd build && node build.js          # writes ../dist/Signals_and_Systems.html
node qa.js                          # layout sweep: expects 0 errors, 0 overflow
node labtest.js                     # interaction sweep: expects "ERRORS: none"
node domcheck.js                    # markup sweep: expects "MALFORMED SCENES: 0"
cd ../verify && python3 verify_m1_m3.py   # expects "50 passed, 0 failed"
# and from the tree root:
# python3 tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
#         "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"   # expects 0 violations
# numpy/sympy are needed by verify_m1_m3.py: pip install numpy sympy --break-system-packages
```

KaTeX is already vendored and font-inlined in `build/src/20_katex.css` + `30_katex.js` — **no npm install is
needed and no network fetch should be added**; the artifact must stay offline-capable.

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

## 5. Phase 2 work order

### Step 1 — visual audit of pp. 22–88 (do this before authoring anything)
Read `pages/p-NN.png` one page at a time at 160 dpi. The existing files
`audit/inventory_p22_p38.md`, `p39_p55.md`, `p56_p71.md`, `p72_p88.md` were produced by delegated readers
in Phase 1 and are **mapping-grade only**. Use them as a checklist to verify against, not as truth.

They flag candidate issues that must be confirmed or dismissed by direct reading. The most consequential:

| Candidate | p. | Claim to check |
|---|---|---|
| A44-01 | 44 | ANALYSIS / SYNTHESIS labels reportedly swapped on the two boxed CTFT definitions |
| A65-01 | 65 | same swap reported for the DTFT pair, propagating to p. 66 |
| A64-01 | 64 | DTFS analysis equation reportedly written with `e^{+jkω₀n}` in both boxes |
| A50-01 | 50 | `F{4cos(3πt)}` reportedly repeats `4πδ(ω−3π)` instead of `4πδ(ω+3π)` |
| A53-01 | 53 | differentiation proof reportedly treats ω as constant |
| A63-01 | 63 | sign flip: `C` computed as −1/4 but used as +1/4 |
| A68-01 | 68 | boxed result `(W/n)·sinc(Wn/π)` where the prefactor should be `W/π` |
| A79-01 | 79 | pair `(n+1)aⁿu[n] → 1/(1+ae^{−jω})ⁿ` — both sign and exponent suspect |
| A83-01 | 83 | `Ts = 2π/(8000π) = 0.25 s` — wrong by 1000×, contradicts p. 82 |
| A87-01 | 87 | Nyquist checks for `cos(2πt)` written against `2(3π)` |
| A27-01 | 27 | boxed `a₀ = 0` contradicts the k=0 term and the plotted `\|a₀\| = 1` |
| A31-01 | 31 | impulse-train integral with both limits written `−T/2` |
| A26/27/38 | 26–38 | LCM-of-denominators rule stated where GCD may be intended |

Record every confirmed issue in the same ledger format as A-01…A-08
(see `.claude/reports/Phase1_Report.md` §2) and
continue the numbering from **A-09**. Never correct silently.

### Step 2 — author Modules 4–7
Target ~70–85 further scenes, following the Modules 0–3 pattern exactly. Module boundaries and source pages:

| Module | Source pp. | Laboratories to build |
|---|---|---|
| M4 · Fourier Series | 22–41 | **F** Fourier-Series Reconstruction Studio · **G** LTI Frequency-Response Demonstrator |
| M5 · Continuous-Time Fourier Transform | 42–63 | **H** CTFT Time–Frequency Explorer (incl. a modulation state) |
| M6 · Discrete-Time Fourier Transform | 64–79 | **I** DTFT Periodicity Explorer (show >1 period of 2π) |
| M7 · Sampling and Aliasing | 80–88 | **J** Sampling and Aliasing Studio (presets: oversampling, critical, undersampling, ZOH, FOH, ideal) |

Laboratory J must keep **spectral replication** and **aliasing** visually and verbally distinct: replicas
appear whenever sampling occurs; aliasing occurs only when they overlap.

### Step 3 — question banks Q4…Q7
12 questions per module, same type mix and schema. Misconceptions still to be diagnosed:
confusing Fourier-series coefficients with a Fourier transform · omitting negative-frequency components ·
forgetting DTFT 2π-periodicity · confusing replication with aliasing · treating the Nyquist boundary as
automatically safe · confusing a hold circuit with ideal reconstruction.

### Step 4 — extend the verification suite
Add to `verify/`: CTFS/DTFS coefficients, transform pairs and scale factors, Parseval relations,
modulation shifts, `H(jω)` and `H(e^{jω})` responses, differential/difference-equation examples,
replica positions, reconstructed signals and aliased frequencies. Keep the PASS/FAIL-per-line format.

### Step 5 — PDF editions
Only after the content is complete. Print CSS already exists in `10_style.css` (`@media print`: landscape,
one scene per page, all reveals expanded, chrome suppressed). Generate with headless Chromium via
Playwright (`/home/claude/.npm-global/lib/node_modules/playwright`, browsers at `/opt/pw-browsers`).
Five deliverables: lecture PDF · student workbook · instructor solutions · formula & notation reference ·
(the artifact itself remains primary). Shared question ids across all of them; render every page to an
image and inspect it before shipping.

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
  student-facing text. §9 governs; this bullet was reworded on 2026-07-25 to remove the contradiction
  with it. `tools/rule_check.py` enforces the ban.
- Visible language: academic English. Conversation with the user: Turkish.

---

## 7. Open items

1. ~~Scene `m3-ex-ct2` renders at 0.82 fit-scale.~~ **Closed 2026-07-25.** Split into `m3-ex-ct2`
   (case boundaries, 3 steps) and `m3-ex-ct2b` (result and checks, 2 steps). The 0.82 scale turned out to
   be a symptom, not a density problem — see item 6 below and `.claude/reports/Phase2_Audit_p22_p41.md` §7.
2. ~~Laboratory E panel 1 stem overlap.~~ **Closed 2026-07-25.** `PLOT.stem` gained an optional `dx`
   (pixel nudge, default 0, no effect anywhere else); Laboratory E draws the cyan input at `dx:-3.6` and
   the amber flipped `h` at `dx:+3.6`, so the pair straddles the index it belongs to.
3. `Book.pdf` cross-check ledger is empty. Modules 5–6 are where a second source is genuinely needed
   (transform conventions, convergence conditions, scale factors) — open the ledger there.
4. Version identifier must move to **v1.0** only when Modules 4–7 and all five PDFs are complete and
   consistent; bump the manifest in `80_content_core.js` `CONTENT.META` and in `91_scenes_end.js`.
5. **Source pp. 22–41 are audited** (`.claude/reports/Phase2_Audit_p22_p41.md`, ledger A-09 … A-21).
   Module 4 may now be authored from them. Pages 42–88 are **not** audited; the same page-by-page reading
   is required before Modules 5–7.
6. **A fifth verification gate now exists.** `build/domcheck.js` renders every scene at every reveal state
   and reports any element with an invalid tag name — the signature of an unescaped `<` in authored text,
   which silently destroys a scene's layout without raising a console error. It found exactly one such
   defect in v0.9 (`m3-ex-ct2`, now fixed). Run it with the other four before any delivery. Practical rule
   when authoring Modules 4–7: **never put `$…<…$` inside a `wex` row label or any other field that is not
   passed through the math renderer** — put the inequality in the value column.

---

## 8. Suggested opening message for the new session

> Signals and Systems artifact Faz 2. Masaüstümdeki `signals-and-systems/` klasöründe `CLAUDE.md` ve `PHASE2_HANDOFF.md` var — önce
> onları oku, sonra `.claude/reports/Phase2_Audit_p22_p41.md` denetim kaydını oku. Pipeline repoda:
> `build/` ve `notes/` içinde doğrudan çalış. Modül 4'ü (s. 22–41) yaz: sahneler, Lab F ve G,
> Q4 bankası, verify uzantısı. Kaynak s. 22–41 denetlendi; yeniden denetleme.

---

## 9. Editorial rule added after Phase 1 (binding)

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

## 10. Lecture-notes pipeline (new)

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

## 11. Maintenance record — 2026-07-25, inline-math pipeline repair (v0.9)

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
