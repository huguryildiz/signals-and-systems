# Property tables — the Fourier properties the course never stated

**Date:** 2026-08-02
**Status:** design, approved
**Artifact version at completion:** v1.6
**Supersedes nothing.** Extends Modules 4, 5 and 6, the lecture notes chapters 4, 5 and 6, and
Appendix A.

---

## 1 Why

The course teaches the Fourier properties it needs and stops there. That is defensible while a
student is reading, and wrong the moment the same student wants a table. Six properties of the
Fourier series never appear anywhere in the artifact, four properties of the continuous-time
transform are missing from its summary, three of the discrete-time transform are missing from
its own, and Module 4 — the module where the series is built — has no summary section at all,
while Modules 5 and 6 both have one.

The result is a course whose reference pages are shorter than the tables every examination
allows. A student who reaches for the summary before a paper finds a subset, and no marker of
which subset it is.

This design closes the gap: every property and every standard pair a second-year course needs
is stated somewhere in the teaching material, and is collected into a summary the student can
read on its own.

## 2 What is missing, exactly

Measured against the standard property tables for the continuous- and discrete-time Fourier
series and the continuous- and discrete-time Fourier transform.

**Module 4, the Fourier series.** Present: linearity, time shifting, conjugation, time
reversal, multiplication, Parseval, and the real / real-and-even / real-and-odd symmetry cases.
Absent: frequency shifting, time scaling, periodic convolution, differentiation, integration,
the discrete-time first difference, the discrete-time running sum, and the even-odd
decomposition. There is no summary section.

**Module 5, the continuous-time transform.** `m5-tables` carries twelve properties and twelve
pairs. Absent from the properties: integration, differentiation in frequency, the symmetry
statements for real-and-even and real-and-odd signals, and the even-odd decomposition. Absent
from the pairs: the unit step, `t e^{-at}u(t)`, `t^{n-1}e^{-at}u(t)/(n-1)!`, and the periodic
square wave.

**Module 6, the discrete-time transform.** `m6-tables` carries eleven properties and eleven
pairs. Absent from the properties: accumulation, the conjugate-symmetry statements for real and
even and for real and odd sequences, and the even-odd decomposition. Absent from the pairs: the
unit step, `\sin\omega_0 n`, and `\frac{(n+r-1)!}{n!(r-1)!}a^{n}u[n]`.

**Corrected while building.** Accumulation and the conjugate-symmetry set are *taught* in
Module 6 — accumulation with its impulse-train term in `m6-props-3`, the symmetry set in
`m6-props-2`. They are missing only from the summary. Module 6 therefore needs one new teaching
scene, not two: the even-odd decomposition and the two sharpened symmetry statements.

The Laplace transform and the z-transform are **out of scope**. The course runs from Module 0
to Module 7 and ends at sampling; neither transform is taught, and the region of convergence —
without which their tables are unreadable — is never introduced. A table for a concept the
course does not carry is not a reference, it is noise.

## 3 How the tables are written

They are written, not copied. Every row is stated in the conventions of §7.1 of `CLAUDE.md`:
the imaginary unit is `j`, the sinc is unnormalised, angular frequency is distinguished from
frequency in hertz, and every condition a result depends on sits on the same line as the result
(R5). Wording follows R4: short sentences, plain words, one idea each.

**In the artifact**, a row is a single correspondence written with `\leftrightarrow`, not a
three-column signal-and-coefficient split. That is the form `m5-tables` and `m6-tables` already
use, it reads more directly than three columns, and it needs no new block type: the existing
`wex` block is a key-and-statement pair. Adding a table block would mean putting every text
field of a new block through `md()` (R8) for no gain.

**In the lecture notes** the rows stay in the three-column form of the `table` block those
chapters already use, because a printed page has the width for it and the chapters are
consistent with themselves. The two forms state the same correspondences.

## 4 New scenes

Twelve scenes. The artifact goes from 223 scenes to 235. Eight of them teach; four are
summaries.

### 4.1 Module 4 — five teaching scenes and two summaries

| Id | Section | What it establishes |
| --- | --- | --- |
| `m4-props-freq` | 4.5 | Frequency shifting, `e^{jM\omega_0t}x(t)\leftrightarrow a_{k-M}`. Time scaling: `x(\alpha t)` for `\alpha>0` leaves every coefficient unchanged and divides the period by `\alpha`, so the spectrum is the same numbers at different frequencies. Discrete-time scaling is the zero-stuffed `x_{(m)}[n]`, whose coefficients are `a_k/m` and whose period is `mN`. |
| `m4-props-conv` | 4.5 | Periodic convolution. `\int_T x(\tau)y(t-\tau)\,d\tau\leftrightarrow T a_k b_k` and `\sum_{r=\langle N\rangle}x[r]y[n-r]\leftrightarrow N a_k b_k`. The factor `T` or `N` is the point of the scene: it is the half of the result that is dropped most often. |
| `m4-props-calc` | 4.5 | Differentiation, `dx/dt\leftrightarrow jk\omega_0 a_k`, and integration, `\int_{-\infty}^{t}x\,d\tau\leftrightarrow a_k/(jk\omega_0)`. The integral is finite-valued and periodic **only if `a_0=0`**, and the condition is what the scene is for. |
| `m4-props-dt-calc` | 4.5 | The discrete-time pair: first difference `x[n]-x[n-1]\leftrightarrow(1-e^{-jk(2\pi/N)})a_k`, running sum `\leftrightarrow a_k/(1-e^{-jk(2\pi/N)})` under the same `a_0=0` condition. |
| `m4-props-evenodd` | 4.5 | The even-odd decomposition, `\mathrm{Ev}\{x\}\leftrightarrow\operatorname{Re}\{a_k\}` and `\mathrm{Od}\{x\}\leftrightarrow j\operatorname{Im}\{a_k\}`, and the five-statement conjugate-symmetry set for a real signal. |
| `m4-tables` | **4.7, new** | The summary of the continuous-time series properties. |
| `m4-tables-dt` | **4.7, new** | The summary of the discrete-time series properties. |

Section 4.7 is added after 4.6. Nothing is renumbered.

The two summaries were written as one scene, side by side. `qa.js` reported it at a scale
factor of 0.87, below the 0.90 that §7.3 of `CLAUDE.md` sets as the point where a scene is split
rather than shrunk, so it was split along the obvious line. Each half now spreads its fifteen
rows over two columns and neither is reported as dense. This is §4.4 working as intended: the
gate decided, not an estimate.

### 4.2 Module 5 — two teaching scenes and a split summary

| Id | Section | What it establishes |
| --- | --- | --- |
| `m5-props-int` | 5.4 | Integration: `\int_{-\infty}^{t}x(\tau)\,d\tau\leftrightarrow\frac{1}{j\omega}X(j\omega)+\pi X(0)\delta(\omega)`. The impulse term carries the mean value of the signal, and dropping it is the standard error. |
| `m5-props-evenodd` | 5.4 | The symmetry statements for real-and-even and real-and-odd signals, the even-odd decomposition, and differentiation in frequency, `tx(t)\leftrightarrow j\,dX/d\omega`. |
| `m5-pairs` | 5.6 | The transform pairs, moved out of `m5-tables` into a scene of their own and completed. |

`m5-tables` keeps the properties and gains the four missing rows. `m5-pairs` carries the pairs
and gains the unit step, `t e^{-at}u(t)`, the general `t^{n-1}e^{-at}u(t)/(n-1)!` form and the
periodic square wave.

### 4.3 Module 6 — one teaching scene and a split summary

| Id | Section | What it establishes |
| --- | --- | --- |
| `m6-props-evenodd` | 6.4 | The real-and-even and real-and-odd statements and the even-odd decomposition, worked on `a^{n}u[n]`. Accumulation needed no new scene: `m6-props-3` already carries it with its impulse-train term. |
| `m6-pairs` | 6.6 | The transform pairs, split out of `m6-tables` and completed with the unit step, `\sin\omega_0 n` and `\frac{(n+r-1)!}{n!(r-1)!}a^{n}u[n]`. |

### 4.4 Density

A summary of fifteen or more rows may not hold at a scale factor of 0.90, which §7.3 sets as
the point where a scene is split rather than shrunk. Density is decided by the gate, not by
estimate: `qa.js` reports every scene held together below 0.90 under `dense`, and any scene it
names is split along the obvious line — properties from pairs, continuous time from discrete
time. One scene was named and one scene was split; see §4.1.

## 5 Figures

The design assumed the property scenes would be equation-led, with one new figure. That was
wrong about the artifact: every teaching scene in it is a two-column scene with figures on the
right, and a scene with an empty right column reads as broken rather than as spare. The eight
teaching scenes therefore carry figures, and each one earns its place by showing something the
equation does not:

- `m4-props-freq` — the zero-stuffed sequence `x_{(m)}[n]` beside the original, because
  zero-stuffing is a shape; and `x(t)` against `x(2t)`, because scaling is one.
- `m4-props-conv` — the rectangular wave, the triangular wave it convolves into, and the two
  coefficient sets with `2a_k^{2}` drawn against `a_k`.
- `m4-props-calc` — the running integral with the mean left in, drifting upward for ever,
  against the same integral with the mean removed. The condition is the picture.
- `m4-props-dt-calc` — the two running sums, one repeating and one climbing by `Na_0`.
- `m4-props-evenodd`, `m5-props-evenodd`, `m6-props-evenodd` — a signal that is neither even
  nor odd, its two parts, and the real and imaginary parts of its spectrum.
- `m5-props-int` — a pulse of area one and a pulse of area zero, with their running integrals.

Every label is TeX with `tex:true` (R7), axis names sit outside the data area, and all eight
are inside the `textclash.js` sweep. The four summary scenes carry no figure, which matches
`m5-tables` and `m6-tables` as they already were.

## 6 The lecture notes and the five editions

The tables go everywhere, not only into the artifact.

- `notes/src/c4.js` §4.7, `c5.js` §5.6 and `c6.js` §6.6 already carry a `table` block of
  properties. Each is extended to the full set, in the same three-column form those tables
  already use.
- `notes/src/ca.js`, Appendix A, gains three sections: **A.7** Fourier series properties,
  **A.8** continuous-time Fourier transform properties and pairs, **A.9** discrete-time Fourier
  transform properties and pairs. The existing A.6 Symbols becomes **A.10**.

Appendix A is the source of Part 2 of `Formula_Reference` — `notes/editions.js` slices it
directly — so writing the tables into `ca.js` puts them into the lecture notes and the formula
reference from one source. The student workbook and the instructor solutions are rebuilt for
consistency of pagination.

All five editions are rebuilt with `cd notes && node editions.js` followed by
`node ../build/pw.js topdf.js`, and swept with `pdftotext -layout` before delivery, per §2 of
`CLAUDE.md`.

## 7 Numbering and textbook anchors

Every new scene is declared once in `build/src/89_sections.js`: an id in the right section of
`CONTENT.SECTIONS`, and a textbook anchor in `CONTENT.BOOK`. No scene file carries either
field.

Anchors are set to the sub-section granularity the file already uses — the neighbouring series
scenes carry `3.5.5` and `3.7.1`, the transform scenes `4.3.2`, the discrete-time scenes
`5.3.7`. Each new anchor is read off the textbook before it is written, not inferred from the
property name; where a property appears only in the textbook's own property table and has no
sub-section of its own, the anchor is the enclosing section. A scene with no counterpart gets
no anchor rather than a guessed one.

`seccheck.js` fails on a section sign that reaches the page without the `OW` marker in front of
it, and on a gap or a repeat in the addressing, so both are checked rather than trusted.

## 8 Verification

The gates of §5 of `CLAUDE.md` all ran. What they printed:

| Gate | Result |
| --- | --- |
| `node --check` over every scene and drill file | silent |
| `qa.js` | 235 scenes, 0 errors, 0 overflow; no new scene under `dense` |
| `labtest.js` | `ERRORS: none`; 210 drill pages, 210 solutions, `options=0` |
| `textclash.js` | `TOTAL COLLISIONS: 0` |
| `mathscan.js` | `SCENES WITH MATH DAMAGE: 0 / 235` |
| `notes/mathscan.js` | `LITERAL MATH IN NOTES: 0`, `KATEX ERRORS: 0` |
| `labwalk.js` | `STATES WALKED: 1038`, `PROBLEMS: none` |
| `seccheck.js` | `SCENES: 235`, `ADDRESSED: 234`, `ANCHORED: 208`, `PROBLEMS: none` |
| `verify_m1_m3.py` | 50 passed, 0 failed |
| `verify_drills.py` | 913 passed, 0 failed |
| `verify_m4_m6.py` | 26 passed, 0 failed |
| `rule_check.py` | `TOTAL VIOLATIONS: 0` |

**Three things the gates sent back.** `textclash.js` failed on its first run with five collisions, all of them in new figures: two
labels drawn over the curves they named in `m4-props-evenodd`, two drawn over the stems in
`m4-props-dt-calc`, and one landing on a tick number in `m5-props-evenodd`. The first and third
were moved into empty space; the second pair was the wrong figure — two running sums in one
frame needed in-figure labels to tell them apart, and two frames named by their captions need
none. That is R7 being enforced rather than remembered.

`qa.js` named the Module 4 summary at 0.87 and it was split in two, as §4.1 records. It then
named `m5-props-int` at 0.894 once the key column of the summary tables was widened. That scene
was carrying integration *and* differentiation in frequency, which are two properties and not
one; differentiation in frequency moved to `m5-props-evenodd`, which the gate reported as
unscaled and which is where the design had put it in the first place. Both scenes are unscaled
now and the `dense` list is back to the eleven scenes it held before this work.

Looking at a screenshot caught the third, which no gate measures: the key column of a `wex` row
was 120 px, and `DIFFERENTIATION` and `MULTIPLICATION` are wider than that in uppercase mono
with wide tracking, so they broke mid-word — `DIFFERENTIATI / ON`. The column is 136 px now and
the break is allowed only at a space. This was not introduced by the property tables; the
`m5-tables` that shipped in v1.5 had it. It is fixed because the tables are what a reader now
looks at.

**An eleventh gate.** `verify_m1_m3.py` covers Modules 1 to 3 and no more, so a number stated
in a Module 4 to 6 teaching scene was checked by nothing. The new scenes do state numbers, so
`verify/verify_m4_m6.py` exists and is the eleventh gate: 26 checks in the same
one-line-per-assertion PASS/FAIL format, sharing the `.venv`. It re-derives every claim the new
scenes make — that the rectangular wave convolves with itself into the triangular wave and that
the result's coefficients are `T_0a_k^{2}`, that the zero-stuffed sequence has period `mN` and
coefficients `a_k/m`, that the mean-removed integral is bounded by `\pm0.25` while the raw one
adds the ramp `a_0t`, that the two running sums repeat and climb as stated, that the zero-area
pulse integrates back to zero, and that the even part of a one-sided exponential transforms to
the real part of its spectrum in both continuous and discrete time.

**The editions.** All five were rebuilt: Lecture_Notes 78 pages (was 73), Student_Workbook 83,
Instructor_Solutions 272, Formula_Reference 11 (was 6), each with `katex errors 0` and
`page errors none`. Every page of all four PDFs was swept with `pdftotext -layout` for a
`$...$` pair, a bare TeX macro and a page with almost no text: none found. Looking at the pages
caught what the sweep could not — the `A.7` heading and its opening sentence were left at the
foot of a page with their table overleaf, because `break-after: avoid` on a heading does not
survive an intervening paragraph. A page break before `A.7` fixes it, and the page counts did
not move.

## 9 Version

`CONTENT.META.version` moves from v1.5 to **v1.6**, in `build/src/80_content_core.js` and
`build/src/91_scenes_end.js`, in one commit.

## 10 What this design does not do

- It does not reorder, split or rewrite any existing teaching scene. `m5-tables` and
  `m6-tables` are divided in two, and that is the only structural change to existing content.
- It does not introduce a Laplace or z-transform chapter.
- It does not add a table block type to the artifact renderer.
- It does not touch the laboratories, the practice questions or the examination material.
