# EE 311 — project operating instructions

**Status: authoritative.** Read this before touching anything in `~/Desktop/EE311/`.
This file supersedes `PHASE2_HANDOFF.md` §1 (file table) and §2 (rebuild commands) — the folder was
reorganised and one of the archives is stale. Everything else in the handoff still stands.
The editorial rules R1–R8 live here, in §5.1; there is no separate rules file.
Set 2026-07-25. Artifact version at this point: **v0.9**.

---

## 0. Read order at session start

1. this file — including §5.1, the editorial rules R1–R8, binding on every deliverable
2. `instructor/PHASE2_HANDOFF.md` — work order, build architecture, scene / block / question schemas
3. `.claude/reports/EE311_Phase1_Report.md` — only when you need ledger A-01…A-08, QA history or the
   manifest; `.claude/reports/EE311_Phase2_Audit_p22_p41.md` continues that ledger from A-09

The design system, build pipeline and content schema are **locked**. Do not re-derive or redesign them.
If something looks wrong, say so and stop — do not silently change it.

---

## 1. Where the project stands

Phase 1 is complete: Modules 0–3 (58 scenes), laboratories A–E, question banks Q1–Q3 (36 questions),
50/50 computational checks, zero clipping, zero runtime errors, plus a lecture-notes HTML/PDF pipeline.

Phase 2 is **not started**: visually audit source pp. 22–88 page by page, author Modules 4–7
(~70–85 scenes), build laboratories F–J, question banks Q4–Q7, extend the verification suite, then
generate the five PDF editions. Full work order: `PHASE2_HANDOFF.md` §5.

---

## 2. Folder layout (current)

| Path | What it is |
|---|---|
| `source/EE311 - Lecture Notes.pdf` | primary source, 88 pp., handwritten scans — **not in git** |
| `source/Book.pdf` | Oppenheim/Willsky/Nawab — **secondary reference only, not in git** |
| `dist/EE311_Signals_and_Systems.html` | the interactive artifact (v0.9), student-facing |
| `dist/EE311_Lecture_Notes.pdf` | lecture notes, A4 portrait |
| `instructor/PHASE2_HANDOFF.md` | work order and architecture |
| `instructor/coverage_matrix.md` | 88-page source-coverage matrix |
| `release/EE311_Deliverables.zip` | **the rebuild archive — use this one** |
| `release/EE311_Lecture_Notes.html` | notes pipeline output |
| `archive/` | superseded material, do not build from it |
| `.claude/` | local working area — prompts, plans, session notes; **not in git** |

Keep this structure. New instructor-only records go in `instructor/`, new build archives in
`release/`, anything superseded moves to `archive/`. Do not leave scratch files in the root.

`.claude/` holds the working material that is not student-facing: `prompts/` (the original production
prompt `EE311_INTERACTIVE_ARTIFACT_PROMPT.md` and the paste-in project instructions), `reports/`
(`EE311_Phase1_Report.md`, `EE311_Phase2_Audit_p22_p41.md`), `plans/`, `notes/`. The whole folder is
gitignored, so it lives in the working copy only — a fresh clone will not contain it, exactly like the
two PDFs in `source/`. The ambiguity ledger therefore survives on this machine only; keep a copy
wherever the working copy is backed up.

Both PDFs in `source/` are listed in `.gitignore`: `Book.pdf` because third-party material must never
be redistributed, and the 41 MB handwritten scan because it is too large for git history. They are
present in a working copy that was set up by hand, but **a fresh clone will not contain them**. Copy
them in before rebuilding or reading source pages; nothing else in the repository depends on network
access.

---

## 3. Rebuilding the working tree

Rebuild from **`release/EE311_Deliverables.zip`**.

`archive/EE311_Phase1_sources.zip` is **stale and incomplete**. It predates the R1–R8 editorial sweep
(the scene, laboratory and question-bank sources in it differ from the current ones) and it is missing
`tools/rule_check.py`, the whole `notes/` pipeline, `audit/scenes.json` and `audit/page_titles.tsv`.
Building from it silently reintroduces 82 cleared rule violations and drops the notes pipeline.

```bash
REPO=$(git rev-parse --show-toplevel)      # run this line from inside the repository
mkdir -p /tmp/ee311 && cd /tmp/ee311
unzip -q "$REPO/release/EE311_Deliverables.zip" -d .

# source pages for the visual audit — 160 dpi is legible, do not go lower
mkdir -p pages && pdftoppm -r 160 -png -f 1 -l 88 \
  "$REPO/source/EE311 - Lecture Notes.pdf" pages/p

cd build && node build.js        # → ../dist/EE311_Signals_and_Systems.html
cd ../notes && node build.js     # → ../dist/EE311_Lecture_Notes.html
```

The `build/`, `notes/`, `verify/` and `tools/` directories referred to below live inside the
extracted tree at `/tmp/ee311`, not in the repository. In a Cowork session the two files above must be
staged first; point `REPO` at the staging folder instead of using `git rev-parse`.

KaTeX is vendored and font-inlined in `build/src/20_katex.css` + `30_katex.js`. **No `npm install`, no
network fetch, ever** — the artifact must stay a single offline-capable file.

---

## 4. Verification gates

Nothing is "done" until all four pass. Report the actual numbers, never a summary in place of a run.

```bash
cd build && node qa.js                        # layout sweep      → 0 errors, 0 overflow
cd build && node labtest.js                   # interaction sweep → "ERRORS: none"
cd verify && python3 verify_m1_m3.py          # → "50 passed, 0 failed" (extend for M4–M7)
python3 tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
        "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
                                              # → "TOTAL VIOLATIONS: 0"
cd build && node textclash.js                 # figure labels     → "TOTAL COLLISIONS: 0"
```

`textclash.js` walks every scene at every step, takes the glyph box of every label in every figure and
tests it against the drawn geometry of that figure. A word, an equation or a caption crossed by a
signal, a label sitting on another label, and a label drawn without a halo all fail. Tick numbers
crossed by a curve are accepted, because the halo interrupts the curve around the digits; the run
reports how many of those it accepted.

New modules extend the suites; they do not replace them. Every new numerical result in the content gets
a check in `verify/`, in the same PASS/FAIL-per-line format. Before shipping any PDF, render every page
to an image and inspect it.

---

## 5. Non-negotiables

### 5.1 Editorial rules R1–R8

Status: **RULE**. Binding on the interactive artifact, all lecture notes, all PDFs, all question banks,
and anything produced in later phases. Set 2026-07-25.

#### R1 — Write as lecture notes, not as a report about lecture notes

Every student-facing text is written **directly**, as self-contained teaching material. The reader must
never be able to tell that any conversion, audit, redrawing or verification took place.

#### R2 — Banned in student-facing content

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

#### R3 — Where provenance lives instead

Source pages, traceability, ambiguity records and version data are kept in **hidden records** and in
**instructor-only areas**:

- instructor edition of the artifact,
- instructor solutions document,
- separate internal records not distributed to students.

They are never rendered in the student view and never printed in student documents.

#### R4 — Language and register

Simple, short, plain academic English.

- Short sentences. One idea per sentence.
- Prefer the plain word: "use" not "utilise", "so" not "consequently", "shows" not "demonstrates".
- No hype, no praise of the material, no rhetorical questions used as decoration.
- Address the reader directly where it helps: "First find the support of each signal."
- Do not use em-dash chains, nested parentheses, or three-clause sentences where two sentences work.

#### R5 — Simple language must not cost correctness

Plain wording is required; mathematical looseness is not permitted.

- Every symbol is defined on first use.
- Continuous-time and discrete-time cases are kept visibly separate.
- Signs, coefficients, integration and summation limits, and scale factors are exact.
- Assumptions and convergence conditions are stated wherever a result depends on them.
- Necessary and sufficient conditions are distinguished.
- Functions and distributions are distinguished. Impulse locations and weights are exact.
- Angular frequency (rad/s or rad/sample) is distinguished from frequency in hertz.
- The sinc convention is stated wherever sinc is used.

#### R6 — Fixed conventions

- Energy and power are normalised, R = 1 Ω. Say so once, where energy is introduced.
- The imaginary unit is j.
- X(jω) = ∫ x(t) e^(−jωt) dt and x(t) = (1/2π) ∫ X(jω) e^(jωt) dω.
- X(e^(jω)) = Σ x[n] e^(−jωn) and x[n] = (1/2π) ∫ over any 2π interval of X(e^(jω)) e^(jωn) dω.
- sinc is unnormalised: sinc(θ) = sin θ / θ.

#### R7 — Examples and figures

- Worked examples use: Given, Find, Method, Solution, Check.
- Every figure axis is labelled. Continuous-time signals are curves. Discrete-time signals are stems.
  Impulses are arrows whose height is the weight. Negative frequencies are shown when they exist.
- A figure caption explains what the figure means. It never explains where the figure came from.
- Nothing written inside a figure may be crossed by anything drawn in it. The name of a variable is
  placed outside the data area — the independent variable under the lower edge, the dependent variable
  above the upper edge. Annotations are placed in free space, not over a signal. Tick numbers stay on
  the axis and carry a halo in the page colour, so a curve or stem that passes behind them is
  interrupted rather than run through the digits.
- No label may sit on another label, at any step of a scene.

#### R8 — Automated check

`tools/rule_check.py` scans every student-facing string for banned phrases and fails the build on a hit.
`build/textclash.js` renders every figure in every scene at every step and measures, glyph box against
drawn geometry, whether any label is crossed by a signal or by another label. Both run before any
delivery; both must report zero.

### 5.2 Mathematical conventions

- Energy and power **normalised**, R = 1 Ω, stated once where energy is introduced.
- Imaginary unit is `j` (the source handwriting uses capital *J*).
- `X(jω) = ∫ x(t)e^{−jωt} dt` · `x(t) = (1/2π)∫ X(jω)e^{jωt} dω`
- `X(e^{jω}) = Σ x[n]e^{−jωn}` · `x[n] = (1/2π)∫_{2π} X(e^{jω})e^{jωn} dω`
- sinc is **unnormalised**, `sinc(θ) = sin θ / θ`, restated at every point of use.
- The source labels the sampling chapter CH#7 and has no CH#6. **Do not invent a missing chapter.**

### 5.3 Signal colour semantics (fixed, reused in every module)

cyan `#14707F` input / CT signal · amber `#C08422` impulse response / system · green `#4A7A46` output ·
violet `#6A5A92` intermediate transformation · red `#A63B2A` error / misconception / aliasing.
Canvas ivory `#F7F2E8` · ink `#1B1A17` · coral `#BE5539` editorial emphasis · slate `#4A657F` metadata ·
navy `#16232F` module-opening and synthesis scenes only.

### 5.4 Architecture locks

- `build.js` auto-picks `8[1-9]_*.js` and `9[1-9]_*.js` in sorted order. New content files just need the
  right filename (`85_scenes_m4.js` … `88_scenes_m7.js`, `96_qbank_m4_m7.js`) and registration in
  `99_tail.html`.
- Fixed 1920×1080 stage. `fitScene()` scales an oversized scene down to a floor of 0.82 — it is a **safety
  net, not a licence to overfill**. A scene needing below ~0.90 must be split instead.
- Radial / orbital compositions are reserved for course maps and synthesis scenes.
- `Axes` places the name of the independent variable under the data area and the name of the dependent
  variable above it, widening the bottom or top margin by itself when the given `pad` is too small.
  Every label in a figure is drawn with a halo in `--fig-halo`, the page colour of the current palette.
  Do not restore labels to the inside of the data area.
- Single file, no network requests, no analytics. Progress stored on the local device only.

### 5.5 Sources

`Book.pdf` is a **cross-check reference only** — never reproduced, quoted or redistributed in any form.
Open the cross-check ledger for Modules 5–6, where transform conventions, convergence conditions and
scale factors genuinely need a second source.

---

## 6. Known traps

- **The `t` / `hd` key bug.** In the notes pipeline the block-type key is `t`; a worked example's heading
  key is `hd`, never `t`. Using `t` twice in one object literal silently drops the whole block — this
  removed all 18 worked examples from the first build.
- **`audit/inventory_p22_p38.md` … `p72_p88.md` are mapping-grade only.** They came from delegated readers
  and are a checklist to verify against, **not truth**. Nothing from pp. 22–88 may be authored before the
  relevant pages are read directly at 160 dpi. The 13 flagged candidates (analysis/synthesis label swaps,
  sign errors, a 1000× sampling-period slip) are listed in `PHASE2_HANDOFF.md` §5 Step 1.
- **Never correct the source silently.** Every confirmed issue is recorded in the ledger format of
  `.claude/reports/EE311_Phase1_Report.md` §2 and stated in the artifact at the point where it occurs.
  Numbering
  continues from **A-09**.
- **Version bump.** v1.0 only when Modules 4–7 and all five PDFs are complete and consistent; bump
  `CONTENT.META` in `80_content_core.js` and `91_scenes_end.js` together.

---

## 7. How to work in a session

- Do the heavy work in the container (`/tmp/ee311`), not on the user's disk. Deliver finished files with
  `SendUserFile`, then write them back to the right project folder with `device_commit_files`.
- Re-zip `release/EE311_Deliverables.zip` whenever build sources change, so the rebuild archive
  never drifts from the delivered artifact. Move the previous archive to `archive/` rather than
  overwriting it blind.
- When a task spans several hours or gets interrupted, update `PHASE2_HANDOFF.md` before ending — it is
  the only thing that survives the container.
- **Language:** conversation with the user in Turkish; everything visible in a deliverable, and every
  internal record in this folder, in academic English.
