# Exam-derived questions — design

**Date:** 2026-08-02
**Status:** design, approved
**Supersedes in part:** `2026-08-01-exam-drill-20-design.md` (question count per module)

---

## 1. What changes

Every module from 1 to 7 grows from twenty practice questions to **thirty**. The ten new
questions in each module are written in the form the examination papers use: a single
statement worth the whole question, three to five lettered parts, and one worked solution
covering all of them.

The papers in `source/exams` hold thirty-six questions — three papers, three years each
(2018, 2019, 2021), four questions a year. **All thirty-six enter the artifact**, with their
structure kept and their numbers and figures replaced. The remaining thirty-two questions
are further variants of the same paper questions, written to the same form and difficulty.

This changes the rule that stood until now. The earlier design took a paper question only
as a model for a skill and wrote every setup fresh. A question may now keep the shape of the
paper question it comes from: the same number of parts, asking the same things in the same
order. What it may not keep is the arithmetic — every coefficient, frequency, support
interval and figure is new.

---

## 2. The source inventory

Thirty-six questions, read at 400 dpi from the three analysis sheets.

### MT1 — Midterm Exam I

| Q | 2018 | 2019 | 2021 | Module |
| --- | --- | --- | --- | --- |
| 1 | periodicity of a DT cosine; energy from a triangular plot; plot `x(4-t/2)`; even part; sifting against two impulses | periodicity of `je^{j2t}`; energy of `2^{-n}u[n]`; plot `y(-2t+1)` from a ramp; even part; sifting | sketch an impulse-train difference; periodicity; odd part of a truncation; energy from an M-shaped plot; sifting | M1 |
| 2 | `y[n]=sum_{k=0}^{n+1} cos(pi k/8) x[k]` | `y(t)=t^2 x(t-1)` | `y(t)=Ev{x(t)}` | M2 |
| 3 | `y[n]=2x[n]+x[n-1]+2x[n-3]`; impulse response; convolve with an impulse comb | `x[n]`, `y[n]` given as stems; recover `h[n]`; convolve with a second stem signal | `y[n]=(1/4)y[n-1]+x[n]`; impulse response; step response | M3 |
| 4 | `x(t)=e^{-|t|}[u(t+1)-u(t-1)]`, `h(t)=u(t)` | `x(t)=e^{-2t}` on `[0,1]`, `h(t)=u(t)-u(t-2)` | rectangular `x(t)`, two-level `h(t)`, both from plots | M3 |

### MT2 — Midterm Exam II

| Q | 2018 | 2019 | 2021 | Module |
| --- | --- | --- | --- | --- |
| 1 | FS of `0.5+(-1)^n` and of a DT sine; FS of their product at `N=10` | FS of a periodic stem signal; FS of `x[n]-x[n-1]`; average power | fundamental period of `4cos^2(pi t/6)-8sin(2pi t/9)`; FS magnitude and phase; average power | M4 |
| 2 | impulse comb into `h[n]=(1/3)^n u[n]`; FS, frequency response, output FS | `x(t)=2+3cos(...)+sin(...)` into `h(t)=delta(t)-e^{-t}u(t)` | periodic stem into `h[n]=u[n+1]-u[n-2]` | M4 |
| 3 | FT of `cos(3t)u(t)`, of a rectangle, of `e^{-t(1+j20pi)}u(t)` | FT of `e^{-|t|}`, of `2/(1+t^2)` by duality, total energy | inverse FT of a rational spectrum; FT of a shifted damped cosine; FT of an impulse train with geometric weights | M5 |
| 4 | three-tone input into a product of two sincs | complex exponential-windowed sinc, multiplied by `cos(4pi t)`, then filtered | squared sinc times `(1+e^{j8t})` into a sinc filter | M5 |

### Final Exam

| Q | 2018 | 2019 | 2021 | Module |
| --- | --- | --- | --- | --- |
| 1 | `x[n]`, `y[n]` stems; impulse response; response to `(-1)^n` on `0..3` | periodicity of `e^{j3n/5}`; impulse response of `y[n]=x[n]+y[n-1]`; stability | even part, odd part and their energies for a windowed ramp | split |
| 2 | FT of an impulse train, of a triangle, of a trapezoid | FS coefficients given by parity; average power; modulation by `cos(2pi t)` | impulse comb into a squared-sinc filter; FS, frequency response, average power | split |
| 3 | DTFT of a reversed step difference; multiplication by an impulse comb and by `(-1)^n` | DTFT of `(1/2)^{|n|}`; of a sum of two cosines; of a sinc product | DTFT of a sum of two sincs into a modulated sinc filter | M6 |
| 4 | Nyquist rate for `x+x^2`, for a modulated sinc, for a sinc convolution | Nyquist frequency for a sinc plus a cosine, a cosine product, a sinc product | Nyquist frequency with a `100pi` guard band | M7 |

Final Q1 and Q2 are the only questions whose parts belong to different modules. They are
split part by part: 2019 Q1(a) goes to M1 and Q1(b,c) stay together in M3; 2019 Q2(a,b) go
to M4 and Q2(c) to M5. The 2018 and 2021 variants of both already sit in one module and are
kept whole.

---

## 3. Distribution

| Module | From the papers | Further variants | New | Total |
| --- | --- | --- | --- | --- |
| M1 Signal Foundations | 5 | 5 | 10 | 30 |
| M2 Systems and Their Properties | 3 | 7 | 10 | 30 |
| M3 Linear Time-Invariant Systems | 8 | 2 | 10 | 30 |
| M4 Fourier Series | 8 | 2 | 10 | 30 |
| M5 The Continuous-Time Fourier Transform | 8 | 2 | 10 | 30 |
| M6 Discrete-Time Fourier Transform | 3 | 7 | 10 | 30 |
| M7 Sampling and Aliasing | 3 | 7 | 10 | 30 |
| | 38 | 32 | 70 | 210 |

The new questions are appended to each module's list, so `D1-21` through `D1-30` follow
`D1-01` through `D1-20`. A reader working the pager therefore meets the single-skill
questions first and the full-length ones after, which is the order the difficulty runs in.

---

## 4. How a number is changed

A replacement number must leave the character of the answer intact. `cos(3pi n/11)` is
periodic because `3/22` is rational; replacing `3pi/11` by `3/11` makes the sequence
aperiodic and silently turns the question into a different one. The rule is:

- **Keep what the part tests.** A periodic signal stays periodic, a convergent integral stays
  convergent, an unstable system stays unstable. Where a part exists to show a failure — an
  aperiodic sum, an unbounded response — the failure is kept.
- **Change everything the student writes down.** Coefficients, frequencies, phases, support
  intervals, decay rates, impulse locations and weights, and the shape of every figure.
- **Keep the part structure.** The same number of parts, in the same order, asking the same
  things.

A figure is replaced by a different figure of the same kind: a triangle may become a
trapezoid, a three-sample stem signal a four-sample one, but a stem plot does not become a
formula.

---

## 5. What the reader sees

The section headings do not change. **No student-facing string calls these examination
questions**, which is the rule set on 2026-08-01 and unchanged here. The section still reads
*practice questions*.

Each module's taxonomy gains one entry describing the new form:

> **A full-length question that combines several of the types above.** Several parts under one
> statement, each part usually resting on the part before it. Work the parts in order, and
> name the type of each before starting it.

The paper a question comes from is recorded in its `src` field and renders in the instructor
edition only, as it already does.

---

## 6. Schema and layout

No schema change. A question of this form uses the fields that already exist: `stem` for the
statement, `figure` for a given plot, `parts` for the lettered parts, `sol` for the worked
solution, `figSol` for an answer figure, `err`, `teach` and `src`.

Layout needs no change either. `.dr-page` scrolls vertically inside the stage and `fitScene()`
leaves a scene containing it unscaled, which is why the existing questions already carry a
statement, a figure, several parts and a full solution. The longest existing solution is
about 2900 characters; a five-part solution will run longer and is still held.

---

## 7. Verification

Every number stated in a `Check` step of a new solution is re-derived in
`verify/drills_m*.py`, in the PASS/FAIL-per-line format the existing checks use. The suite
grows from 559 checks to roughly 840. Module 2 answers are arguments rather than numbers, and
are checked the way the existing Module 2 checks are: the named counterexample is verified to
do what the solution claims.

All nine gates in `CLAUDE.md` §5 must pass. `labtest.js` walks every drill pager to its last
question, so its page count rises from 140 to 210; `mathscan.js` and `textclash.js` open every
worked solution, so their state counts rise with it.

---

## 8. Records to update when this lands

- `CLAUDE.md` §2 — the paragraph stating that no question reproduces a real examination
  question no longer holds and is rewritten to the rule in §4 above.
- `CLAUDE.md` §5 — the expected counts printed by `labtest.js` and `verify_drills.py`.
- `instructor/EXAM_DRILL_DESIGN.md` — the teaching-side summary.
- `instructor/PHASE2_REPORT.md` — the work record.
- `CONTENT.META.version` in `build/src/80_content_core.js` and `build/src/91_scenes_end.js`,
  moved together in one commit.
