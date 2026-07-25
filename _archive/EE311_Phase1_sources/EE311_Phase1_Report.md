# EE 311 — Signals and Systems
## Interactive learning artifact · Phase 1 report and ledgers

**Version** v0.9 · Phase 1 (Modules 0–3) **·** **Date** 2026-07-25
**Source** `EE311 - Lecture Notes.pdf` (88 pp., handwritten, scanned)
**Deliverable** `EE311_Signals_and_Systems.html` — single self-contained file, 1.0 MB, no network dependencies

---

## 1. What was produced, and what was not

This is an honest scope statement, placed first on purpose.

**Delivered in this phase**

| Item | Status |
|---|---|
| Visual audit of PDF pp. 1–21 (page by page, 160 dpi) | complete — performed directly, not delegated |
| Content inventory of PDF pp. 22–88 | complete at coverage-matrix depth — produced by parallel readers, **not yet re-verified page by page** |
| 88-page source-coverage matrix | complete, no unmapped page |
| Notation, convention and ambiguity ledger (pp. 1–21) | complete — 8 issues recorded, none silently corrected |
| Interactive artifact, Modules 0–3 | complete — 58 scenes |
| Interactive laboratories A–E | complete and tested at nominal and boundary values |
| Question banks Q1, Q2, Q3 (12 each, with full solutions) | complete — 36 questions |
| Independent computational verification | complete — 50 checks, 50 pass |
| Laboratory interaction test | complete — 5 laboratories, no runtime errors |
| Layout / clipping / accessibility QA | complete — 58 scenes at their densest reveal state, zero clipping |

**Not delivered in this phase, and why**

| Item | Reason |
|---|---|
| Modules 4–7 scenes (Fourier series, CTFT, DTFT, sampling) | Depth-first strategy was chosen: the design system and pedagogical pattern are locked against Modules 0–3 first, so that Modules 4–7 are produced once, correctly, rather than twice. |
| The five PDF editions (lecture, workbook, solutions, reference, and the print pipeline) | The artifact is the primary deliverable and the PDFs are generated *from* it; generating them before the content is complete would produce documents that must be regenerated. The print stylesheet is already in place (§7). |
| Textbook (`Book.pdf`) cross-check ledger | Only two targeted checks were needed in Modules 0–3, both concerning the two flagged source issues (A-07, A-08). Both were resolved against standard results and computationally, not by citing the textbook. The ledger for Modules 4–7 — where transform conventions and scale factors genuinely need a second source — is a Phase 2 item. **The textbook was not reproduced, quoted or redistributed in any form.** |
| Full visual re-verification of pp. 22–88 | Deliberately deferred to immediately before Modules 4–7 are authored. No result from those pages is used in this build. |

---

## 2. Source ambiguity ledger — PDF pp. 1–21

Eight issues were found. None was corrected silently; each is stated in the artifact at the point where it occurs.

| ID | p. | Issue | Class | Resolution adopted |
|---|---|---|---|---|
| A-01 | 2 | The step from `(1/R)v²(t)` to `\|x(t)\|²` silently sets *R* = 1 Ω | convention | The normalised-energy convention is stated explicitly on the energy scene and in the version manifest. Question Q1-12 exists specifically to force the `1/R` factor back into a calculation. |
| A-02 | 3 | The PDF text layer renders a homework shift as `x[n−14]` | OCR artifact | The visual reading at 160 dpi, `x[n+4]`, is authoritative. |
| A-03 | 4 | Heading writes `x(t) = x(at)` | notation abuse | Read as the definition of a new signal, `y(t) = x(at)`; a notation note is shown on the scaling scene. |
| A-04 | 7 | `δ(t) = ∞ at t = 0` presented as a function | rigour | Presented as a generalized function (distribution) defined by its sifting action; the limiting-rectangle picture is kept as intuition and labelled as such. |
| A-05 | 10 | "ω₀ should be a rational multiple of 2π" | phrasing | Kept, with the equivalent statement `ω₀/2π = k/N ∈ ℚ` shown alongside. Laboratory C parametrises ω₀ as a rational multiple of π so the test is exact rather than floating-point. |
| A-06 | 12 | `cos(t+1)` described as "constant" when arguing causality | wording | Corrected to "a known deterministic function of *t*"; the causality conclusion is unchanged. |
| A-07 | 17 | Finite geometric sum stated with the side condition `\|r\| < 1` | over-restrictive | The finite sum requires only `r ≠ 1`; `\|r\| < 1` is needed for the *infinite* sum. Verified symbolically at `r = 3` (verification suite, line "finite geometric identity"). |
| A-08 | 21 | BIBO stability stated as ⟺ absolute summability, but only sufficiency is proved | proof completeness | The artifact marks which direction the source proves and states the standard necessity argument (`x[n] = sgn h[−n]` forces `y[0] = Σ\|h[k]\|`) as a result asserted without proof in the notes. |

A further, larger set of candidate issues was recorded for pp. 22–88 during the coverage-matrix pass — including apparent analysis/synthesis label swaps, a sign error in a modulation example, and a sampling-period arithmetic slip of three orders of magnitude. **Those are candidates, not findings**: they come from a delegated read and are re-verified visually before any of that material is authored. None of it is used in this build.

---

## 3. Independent computational verification

Script: `verify/verify_m1_m3.py` (SymPy + NumPy). **50 checks, 50 pass, 0 fail.**

Coverage:

- **Energy and power** — the two source examples (rect ⇒ *E*∞ = 1, *P*∞ = 0; `x[n] = 4` ⇒ *P*∞ = 16), plus all six Laboratory B signals including the "neither" case.
- **Signal operations** — breakpoint mapping for `x(3t−5)` (3,5,7,9 → 1, 5/3, 7/3, 3) and the width-shrinks-by-*a* invariant; Laboratory A support mapping across the whole slider range including negative *a*.
- **Periodicity** — CT `T₀ = 4 s` for `ω₀ = 0.5π`; DT `N₀ = 10, k = 3` for `ω₀ = 3π/5`, confirmed both by the formula and by direct sequence comparison, *and* by confirming no smaller period exists. Laboratory C's `N₀` formula was checked against a brute-force minimal-period search for **all 144** (p, q) control settings. The aperiodic counterexample `cos(n)` was confirmed to have no period up to 200.
- **System properties** — linearity of `2πx`, the surviving cross term in `(x[2n])²`, the accumulator's unbounded response to `u[n]`, the time-variance counterexample for `n·x[n]`, and `min(cos t + 2) = 1 > 0` (which is what makes that system invertible).
- **Convolution** — `{1,2,1,2} ∗ {1,1} = {1,3,3,3,2}` with the length rule and the sum rule; the geometric case `(½)ⁿu[n] ∗ u[n] = 2 − (½)ⁿ` with its limit; both continuous-time examples verified symbolically **and** by independent quadrature at seven interior points; continuity at every case boundary; the area rule `∫y = (∫x)(∫h) = 2`; the peak value 1.5 at *t* = 2.
- **Laboratory engines** — Laboratory E's numerical convolution engine reproduces both discrete closed forms exactly and both continuous ones to ~1e-12 after the integration was rewritten to use the exact support overlap (see §6).

Question banks were separately verified: 25 of the 36 questions have free-standing numerical answers and all 25 were checked computationally (`verify/qbank_check.py`, 43 assertions, all pass). The remaining 11 are definitional; the arithmetic quoted inside their distractors was checked as well.

---

## 4. Learning architecture

58 scenes, plus 5 laboratories and 3 question banks embedded as scenes.

| Module | Scenes | Source | Laboratories | Questions |
|---|---:|---|---|---|
| M0 · Why Signals and Systems? | 6 | pp. 1–2, 11 | — | — |
| M1 · Signal Foundations | 19 | pp. 2–10 | A, B, C | Q1-01 … Q1-12 |
| M2 · Systems and Their Properties | 11 | pp. 11–14 | D | Q2-01 … Q2-12 |
| M3 · Linear Time-Invariant Systems | 14 | pp. 14–21 | E | Q3-01 … Q3-12 |
| Closing synthesis and provenance | 2 | pp. 2–21 | — | — |

Instructional pattern per concept: visual intuition → formal definition → central equation → stepwise derivation (as reveal states) → worked example in *Given / Find / Method / Solution / Interpretation / Sanity check* form → engineering interpretation → misconception or counterexample → module synthesis with a reflection question.

---

## 5. Interactive laboratories

Every control changes the mathematics; there are no decorative controls and no controls that do nothing.

- **A · Signal Transformation Laboratory** — `y = x(at − b)` built by the source's *shift, then scale* method, with the intermediate `v = x(t − b)` shown as its own panel. Live support interval, mapped critical points, decimation/expansion verdict, reversal for `a < 0`, CT/DT toggle, three prototype signals (one of them the source's own p. 4 example).
- **B · Energy and Power Classifier** — six source-grounded signals; the student commits to *energy / power / neither* before the integral or sum is revealed, then sees the limiting argument and the convergence conclusion.
- **C · Periodicity Explorer** — ω₀ is entered as a rational multiple of π (numerator and denominator sliders) so the rationality test is **exact**, not numerical. Shows `N = 2πk/ω₀`, the smallest admissible *k*, `N₀`, the reduced `ω₀/2π`, and the CT contrast where no condition applies.
- **D · System Property Checker** — 13 systems from the source, six properties each, every verdict backed by a criterion and either an argument or an explicit counterexample.
- **E · Graphical Convolution Explorer** — four cases, all of them worked examples from the source. Flip, shift, multiply, overlap shading and accumulation, with a slider over *n* or *t*, the current output value, and the closed form alongside.

---

## 6. Defects found and fixed during QA

| Defect | Where | Fix |
|---|---|---|
| Continuous-time convolution readout was ~1.8×10⁻³ off the exact value | Laboratory E | Integration rewritten to use the **exact overlap of the two supports** with Simpson's rule instead of a fixed grid spanning the whole axis; the error came from the trapezoid rule straddling the support discontinuities. Now exact to ~1e-12. |
| Non-zero outputs below 5×10⁻⁴ displayed as `0` | Laboratory E | Readout switches to scientific notation below the rounding threshold, so "overlap non-empty, output 0" can no longer appear. |
| `ω₀/2π` displayed unreduced (e.g. `12 / 24`) | Laboratory C | Fraction reduced by `gcd` before display. |
| "this is a energy signal" | Laboratory B | Article corrected. |
| 13 scenes overflowed the 1080 px stage at their densest reveal state | Modules 1–3 | Type and spacing scale tightened (~8 %), the densest examples restructured, and a deterministic **fit-to-scene** pass added: if a scene still exceeds the canvas, its content is uniformly scaled (floor 0.82) rather than clipped. Result: **zero clipping across all 58 scenes at every reveal state.** |
| Inline SVG figures rendered at the 300×150 default | all scenes | Global rule making every scene SVG fluid. |
| Question-bank scenes were being scaled instead of scrolled | Q1/Q2/Q3 | Fit pass now skips scenes containing a scroll region. |

---

## 7. Quality assurance performed

- **Layout** — all 58 scenes rendered at 1920×1080 at their **maximum** reveal step; overflow measured transform-aware. Zero horizontal or vertical overflow.
- **Runtime** — zero console errors and zero page errors across the full scene sweep and the full interaction sweep.
- **Interaction** — Laboratory A: 8 slider positions including both boundaries, all three segmented control groups. Laboratory B: all six items, classify + reveal + advance. Laboratory C: five (p, q) settings including both boundaries, plus the CT/DT switch. Laboratory D: all 13 systems × 6 properties opened. Laboratory E: all four cases × three slider positions each (both boundaries and the midpoint).
- **Quiz engine** — answer feedback, progressive hints, retry, and solution reveal all confirmed working.
- **Modes** — lecture ⇄ self-study, student ⇄ instructor, reduced motion, module map, full-text search (12 hits for "convolution"), deep link `#m3-ex-ct2/3` restoring both scene and reveal state.
- **Accessibility** — visible focus states throughout; `prefers-reduced-motion` honoured automatically and overridable; no colour used as the sole carrier of meaning (every signal colour is also labelled); body text ≥ 16 px equivalent on the 1920 px canvas.
- **Offline and privacy** — single file, no network requests, no analytics. Progress is stored on the local device only, through a wrapper that degrades silently to in-memory storage when browser storage is unavailable, and can be cleared from the orientation scene.
- **Print** — a landscape print stylesheet is in place (one scene per page, all reveals expanded, chrome suppressed). The full PDF editions are a Phase 2 deliverable.

**Known limitations, stated plainly**

1. Modules 4–7 are not authored. The artifact says so, in the orientation scene and in the provenance scene.
2. The pp. 22–88 inventory has not been visually re-verified by me. It is used for the coverage matrix only.
3. Scene `m3-ex-ct2` renders at 0.82 scale at its final reveal state. It is fully legible on a 1920 px display and in print, but it is the densest scene in the build and is a candidate for splitting in Phase 2.
4. In Laboratory E's first panel, the input stem and the flipped impulse-response stem coincide exactly when they share an index; the cyan stem is drawn first and can be hidden by the amber one. A small horizontal offset is a Phase 2 improvement.

---

## 8. Version manifest

| Field | Value |
|---|---|
| Course | EE 311 — Signals and Systems |
| Source filename | `EE311 - Lecture Notes.pdf` (88 pp.) |
| Artifact version | v0.9 · Phase 1 (Modules 0–3) |
| Production date | 2026-07-25 |
| Content language | Academic English |
| CTFT convention | `X(jω) = ∫ x(t) e^{−jωt} dt`, `x(t) = (1/2π) ∫ X(jω) e^{jωt} dω` |
| DTFT convention | `X(e^{jω}) = Σ x[n] e^{−jωn}`, `x[n] = (1/2π) ∫_{2π} X(e^{jω}) e^{jωn} dω` |
| sinc convention | Unnormalised, `sinc(θ) = sin θ / θ`, restated at every point of use |
| Energy convention | Normalised, *R* = 1 Ω |
| Imaginary unit | `j` (the source handwriting uses a capital *J*) |
| Chapter labelling | The source labels the sampling chapter CH#7 and contains no CH#6. No missing chapter is invented; the artifact uses pedagogical module numbers and retains original chapter labels only in source references. |
| Source-page citation policy | `[Source: EE311 Lecture Notes, PDF p. XX]` on every scene; non-source material labelled *editorial enhancement*; question banks labelled *editorially developed* |
| Change summary | First release. |

## 9. Files

| File | Contents |
|---|---|
| `EE311_Signals_and_Systems.html` | the interactive artifact (open in any modern browser; works offline) |
| `EE311_Phase1_Report.md` | this report — scope, ambiguity ledger, verification, QA, manifest |
| `coverage_matrix.md` | the 88-page source-coverage matrix |
| `audit/inventory_p01_p21.md` | the page-by-page visual audit of Modules 0–3's source |
| `audit/inventory_p22_p38.md` … `inventory_p72_p88.md` | coverage-level inventory of the remaining 67 pages |
| `verify/verify_m1_m3.py` | the computational verification suite (50 checks) |
| `verify/qbank_check.py` | question-bank numerical checks (43 assertions) |
| `build/` | all sources required to reproduce the artifact (`node build.js`) |
| `qa.js`, `labtest.js` | the automated layout and interaction test harnesses |
