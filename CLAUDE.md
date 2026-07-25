# EE 311 — project operating instructions

**Status: authoritative.** Read this before touching anything in `~/Desktop/EE311/`.
This file supersedes `PHASE2_HANDOFF.md` §1 (file table) and §2 (rebuild commands) — the folder was
reorganised and one of the archives is stale. Everything else in the handoff still stands.
Set 2026-07-25. Artifact version at this point: **v0.9**.

---

## 0. Read order at session start

1. this file
2. `02_instructor/PHASE2_HANDOFF.md` — work order, build architecture, scene / block / question schemas
3. `02_instructor/EE311_STYLE_RULES.md` — R1–R8, binding on every deliverable
4. `02_instructor/EE311_Phase1_Report.md` — only when you need ledger A-01…A-08, QA history or the manifest

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
| `00_source/EE311 - Lecture Notes.pdf` | primary source, 88 pp., handwritten scans |
| `00_source/Book.pdf` | Oppenheim/Willsky/Nawab — **secondary reference only** |
| `00_source/EE311_INTERACTIVE_ARTIFACT_PROMPT.md` | the original production prompt |
| `01_student/EE311_Signals_and_Systems.html` | the interactive artifact (v0.9), student-facing |
| `01_student/EE311_Lecture_Notes.pdf` | lecture notes, A4 portrait |
| `02_instructor/PHASE2_HANDOFF.md` | work order and architecture |
| `02_instructor/EE311_STYLE_RULES.md` | editorial rules R1–R8 |
| `02_instructor/EE311_Phase1_Report.md` | scope, ambiguity ledger, verification, QA, manifest |
| `02_instructor/coverage_matrix.md` | 88-page source-coverage matrix |
| `03_production/EE311_Deliverables.zip` | **the rebuild archive — use this one** |
| `03_production/EE311_Lecture_Notes.html` | notes pipeline output |
| `_archive/` | superseded material, do not build from it |

Keep this structure. New instructor-only records go in `02_instructor/`, new build archives in
`03_production/`, anything superseded moves to `_archive/`. Do not leave scratch files in the root.

---

## 3. Rebuilding the working tree

Rebuild from **`03_production/EE311_Deliverables.zip`**.

`_archive/EE311_Phase1_sources.zip` is **stale and incomplete**. It predates the R1–R8 editorial sweep
(the scene, laboratory and question-bank sources in it differ from the current ones) and it is missing
`tools/rule_check.py`, the whole `notes/` pipeline, `audit/scenes.json` and `audit/page_titles.tsv`.
Building from it silently reintroduces 82 cleared rule violations and drops the notes pipeline.

```bash
# stage 03_production/EE311_Deliverables.zip and 00_source/EE311 - Lecture Notes.pdf first
mkdir -p /tmp/ee311 && cd /tmp/ee311
unzip -q /mnt/user-data/uploads/EE311/03_production/EE311_Deliverables.zip -d .

# source pages for the visual audit — 160 dpi is legible, do not go lower
mkdir -p pages && pdftoppm -r 160 -png -f 1 -l 88 \
  "/mnt/user-data/uploads/EE311/00_source/EE311 - Lecture Notes.pdf" pages/p

cd build && node build.js        # → ../dist/EE311_Signals_and_Systems.html
cd ../notes && node build.js     # → ../dist/EE311_Lecture_Notes.html
```

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
```

New modules extend the suites; they do not replace them. Every new numerical result in the content gets
a check in `verify/`, in the same PASS/FAIL-per-line format. Before shipping any PDF, render every page
to an image and inspect it.

---

## 5. Non-negotiables

### 5.1 Editorial (full text: `EE311_STYLE_RULES.md`)

- Student-facing text is written **directly as teaching material**. The reader must never be able to tell
  that a conversion, audit or verification took place.
- Banned in anything a student can read: "in the PDF", "p. 12", "in this file", "the document shows",
  "the source notes", "redrawn from", "verified against", "editorial enhancement", "editorially
  developed", and any mention of research, auditing, ledgers, versions or phases. If a sentence needs one
  of these to make sense, the sentence is wrong — rewrite it so the mathematics carries the meaning.
- Provenance lives **only** in hidden records and instructor-only areas.
- Register: simple, short, plain academic English. One idea per sentence. Plain word over the ornate one.
  No hype. Plain wording never costs correctness: symbols defined on first use, CT and DT kept visibly
  separate, exact signs / limits / scale factors, stated convergence conditions, necessary vs. sufficient
  distinguished, rad/s distinguished from Hz.
- Worked examples: Given, Find, Method, Solution, Check. Every figure axis labelled; CT = curves,
  DT = stems, impulses = arrows whose height is the weight; negative frequencies shown when they exist.
  A caption says what the figure means, never where it came from.

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
  `EE311_Phase1_Report.md` §2 and stated in the artifact at the point where it occurs. Numbering
  continues from **A-09**.
- **Version bump.** v1.0 only when Modules 4–7 and all five PDFs are complete and consistent; bump
  `CONTENT.META` in `80_content_core.js` and `91_scenes_end.js` together.

---

## 7. How to work in a session

- Do the heavy work in the container (`/tmp/ee311`), not on the user's disk. Deliver finished files with
  `SendUserFile`, then write them back to the right numbered folder with `device_commit_files`.
- Re-zip `03_production/EE311_Deliverables.zip` whenever build sources change, so the rebuild archive
  never drifts from the delivered artifact. Move the previous archive to `_archive/` rather than
  overwriting it blind.
- When a task spans several hours or gets interrupted, update `PHASE2_HANDOFF.md` before ending — it is
  the only thing that survives the container.
- **Language:** conversation with the user in Turkish; everything visible in a deliverable, and every
  internal record in this folder, in academic English.
