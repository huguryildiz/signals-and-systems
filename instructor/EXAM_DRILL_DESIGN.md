# Exam drill sections — design

**Status: design, approved 2026-08-01.** Instructor-only record. Read `CLAUDE.md` first; every rule
in its §6 and §7 binds this work. This document says what the exam drill sections are, how they are
built, and how they are verified. It does not repeat anything already fixed in `CLAUDE.md`.

---

## 1. What this adds

Each of Modules 1–7 gains a short **Exam Drill** section that sits immediately before the module's
teaching scenes. The section has two scenes:

1. **a taxonomy scene** — the recurring question types for that module, what each one asks for, the
   method that answers it, and a link to the scene where that method is taught;
2. **a drill scene** — 10 to 15 open-ended questions in the exam's own form, each with a full worked
   solution that stays hidden until the reader asks for it.

Module 0 gains nothing. It is the course opening and carries no examinable method.

The existing multiple-choice question bank at the end of each module is unchanged. The drill section
is a second, complementary instrument: the bank tests whether a definition is understood, the drill
tests whether a full question can be worked from a blank page.

### Why the section sits before the module

A reader meeting a solved problem before the method exists learns nothing from the solution. Two
properties of the design remove that risk:

- The taxonomy scene is an advance organiser. Naming the three or four shapes a question can take,
  before any of them is worked, is exactly the kind of material that belongs in front of the content.
- Every solution is collapsed on arrival. A first pass through the section shows the question
  statements and nothing else, so the reader sees the target and not the answer. The solutions are
  there for the second pass, after the module has been read.

### What is not shown

The drill questions are new. The examination papers they are modelled on are never reproduced, never
quoted, and never labelled by year or by paper. The question type is what carries over, and the
question type is not anybody's property.

Each drill question records the paper it derives from in a `src` field. That field renders only in
the instructor edition, through the existing `data-instr` mechanism — the same treatment the page
references in the question bank already receive. This is R3.

---

## 2. Placement and file layout

Scene order is assembled in `build/src/99_tail.html` by concatenating the `window.SCENES_M*` arrays.
A drill section is a separate array concatenated in front of its module:

```js
const SCENES = [].concat(
  window.SCENES_M0||[],
  window.DRILL_M1||[], window.SCENES_M1||[],
  window.DRILL_M2||[], window.SCENES_M2||[],
  …
  window.DRILL_M7||[], window.SCENES_M7||[],
  window.SCENES_END||[]
);
```

Drill scenes carry `module:'M3'` like every other scene, so the contents rail and the module
progress indicator need no change, and `CONTENT.MODULES` is untouched. A module simply begins with
its drill.

`build.js` picks up `9[1-9]_*.js` automatically. Slots 92, 93 and 94 are free, and the 9x decade
already holds the closing and assessment material, so the three new files belong there:

| File | Contents |
| --- | --- |
| `build/src/92_drill_m1_m3.js` | `DRILL_M1`, `DRILL_M2`, `DRILL_M3` — scenes, taxonomies, questions |
| `build/src/93_drill_m4_m5.js` | `DRILL_M4`, `DRILL_M5` |
| `build/src/94_drill_m6_m7.js` | `DRILL_M6`, `DRILL_M7` |

No change to `build.js`. One line changes in `99_tail.html`.

---

## 3. The drill block

### 3.1 Renderer

One new block type in `build/src/90_app.js`, beside `qbank`:

```js
drill: b => { const qs=(CONTENT.DRILL||[]).filter(q=>q.module===b.module);
    return `<div class="dr-head small">…</div>
      <div class="qb-scroll">${qs.map(q=>`<div class="qb-item">${drillHTML(q)}</div>`).join('')}</div>`; }
```

It reuses `.qb-scroll`, which `10_style.css` already documents as the artifact's only scrolling
region. That is what makes a full worked solution possible: the 1920×1080 stage cannot hold a
statement, two figures and a five-part solution, and a solution trimmed to fit is not a solution.

`drillHTML(q)` renders, in order: the question identifier and instructor reference, the statement,
an optional statement figure, the lettered parts, and a `Show solution` button. Pressing it appends
the worked solution, an optional answer figure, the likely student error, and — instructor edition
only — the teaching note. State lives in `S.quiz[q.id].revealed`, the field the question bank
already uses, so persistence and the reset action work with no new code.

### 3.2 Question schema

`CONTENT.DRILL` is a flat array, declared empty in the `CONTENT` literal of `80_content_core.js`
beside `QBANK: []` and extended by the three drill files with `concat`, exactly as `CONTENT.QBANK`
is. `CONTENT.DRILLTYPES` is declared `{}` in the same place.

```js
{ id:'D3-07', module:'M3', type:'ct-conv', src:'MT1 Q4',
  stem:'Let $x(t)=e^{-3t}$ for $0\\le t\\le 1$ and zero otherwise. …',
  figure: () => …,
  parts:[ 'Compute $y(t)=x(t)*h(t)$.',
          'Plot $y(t)$, marking every breakpoint.' ],
  sol:'…',
  figSol: () => …,
  err:'…',
  teach:'…' }
```

- `type` keys the question to an entry of `CONTENT.DRILLTYPES[module]`, which drives the taxonomy
  scene. Every question has a type and every type has at least two questions.
- `src` names the paper and question number. **Instructor edition only.**
- `parts` is an array of strings, rendered as `a)`, `b)`, `c)`. No point values: the drill teaches
  the method, not the mark scheme.
- `figure` and `figSol` are functions, never strings. A figure generated once at load time keeps the
  palette it was born with — this is the locked rule in `CLAUDE.md` §7.3 and the bug that made the
  title motif light-only.
- `sol` follows R7's worked-example order: Given, Find, Method, Solution, Check. The `Check` step is
  not decoration; it is where the numerical claim that `verify/` re-derives is stated.
- `err` and `teach` mirror the question bank's fields and carry the same meaning.

### 3.3 Taxonomy schema

```js
CONTENT.DRILLTYPES.M3 = [
  { k:'dt-h',    name:'Impulse response from a difference equation',
    asks:'…', method:['…','…','…'], go:'m3-impulse' },
  …
];
```

`asks` is one sentence on what the question demands. `method` is the ordered list of steps that
answers it. `go` is the scene id where the method is taught, rendered as a link with the existing
`data-act="goto"` handler.

### 3.4 Styles

`.dr-*` classes in `10_style.css`, following the `.qb-*` pattern. No new colour tokens: the palette
was re-cut on 2026-08-01 and the three places that hold it stay as they are.

The label-frame reset of R8 applies. `.dr-id` and any uppercase-mono label class must reset
`text-transform` and `letter-spacing` on `.katex`, or `a_k` renders as `A_K` pulled apart glyph by
glyph.

---

## 4. Question taxonomy

Derived from the examination papers; the mapping below is the categorisation the user asked for.
Modules 1–7, with the paper each type comes from recorded for the instructor edition only.

**M1 — Signal foundations.** Periodicity of a discrete-time sinusoid and its fundamental period, by
the rationality test on `\omega_0/2\pi`. Energy and power of a piecewise signal read off a sketch.
Transformation of the independent variable, `y(t)=x(at+b)`, drawn. Even and odd decomposition,
drawn, with the energies of the parts. Evaluation of an integral by the sifting property. Sketching
a sequence defined as a sum of shifted impulses.

**M2 — Systems and their properties.** One type only, in several dresses: given an input–output
relation, decide memorylessness, linearity, time invariance, causality and stability, and justify
each. The dresses are continuous and discrete time, running accumulation, an explicitly
time-dependent gain, time scaling or reversal of the argument, and a squaring nonlinearity.

**M3 — Linear time-invariant systems.** Impulse response from a difference equation. Convolution
sum, computed and drawn. Continuous-time convolution integral by flip-and-slide, region by region.
Recovering `h[n]` from a graphical input–output pair by writing the input as a sum of impulses.
Reading causality and stability off `h`.

**M4 — Fourier series.** Coefficients of a given periodic signal, with the magnitude and, where
asked, the phase spectrum. Fundamental period and fundamental frequency of a sum of sinusoids.
Average power over one period by Parseval. A periodic input through an LTI system: frequency
response, then output coefficients. The discrete-time series with its finite set of coefficients.
The effect of a simple operation — a first difference, a product — on the coefficients.

**M5 — Continuous-time Fourier transform.** Transforms of the standard signals: two-sided decaying
exponential, rectangular pulse written with steps, complex-exponential-times-step. Duality. Total
energy by Parseval. Inverse transform by partial fractions. Multiplication in time as convolution in
frequency, in a modulation chain. The transform of an impulse train and of a periodic signal.

**M6 — Discrete-time Fourier transform.** Transform of a geometric sequence and of a rectangular
window. Transform of a sum of sinusoids, drawn as impulses on `-\pi\le\omega\le\pi`. Transform of a
sinc-type sequence by reading the rectangular-window pair backwards. A sequence through an LTI
system, with `Y(e^{j\omega})` drawn.

**M7 — Sampling and aliasing.** Nyquist rate of a sum of cosines. Bandwidth and Nyquist rate of
sinc and sinc-squared signals. Bandwidth after a product and after a convolution — the product adds
bandwidths, the convolution takes the smaller. Sampling rate with a stated guard band.

Every module gets 10 to 15 questions, at least two per type.

---

## 5. Verification

The eight gates of `CLAUDE.md` §5 all run, unchanged, plus three additions.

**`verify/verify_drills.py`** — a new numerical suite in the PASS/FAIL-per-line format of
`verify_m1_m3.py`. Every number that appears in a `Check` step gets a line. It shares the existing
`.venv`.

**`tools/rule_check.py`** — the invocation grows a glob:

```bash
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/9[2-4]_drill*.js" \
        "build/src/91_*.js" "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
```

**`build/mathscan.js`** — a known hole must not be reproduced. The scan currently opens what a scene
shows first; a drill solution behind a `Show solution` button is invisible to it, and mathematics
damaged inside a solution would pass every gate. The scan gains a pass that clicks every
`[data-sol]` in a drill panel, re-querying the handles after each click because the panel redraws.
This is the same treatment `labwalk.js` gives laboratory items, for the same reason.

The rest is unchanged. `textclash.js` sees the drill figures because every figure label is written
through `texName` into a `foreignObject` marked `data-texlabel`; `qa.js` measures the drill scene
like any other, and the scrolling panel means it cannot overflow.

**A known limit, stated rather than discovered later.** A scrolling region does not print. The drill
questions will not appear in the PDF editions, exactly as the question bank does not. If the PDFs
need them, they need a separate print path, and that is not in this design.

---

## 6. Order of work

The pilot is **M3**. It carries the most examination weight of any module and the heaviest figure
and solution load, so a format that survives it survives the rest.

1. `CONTENT.DRILL` and `CONTENT.DRILLTYPES` initialised in `80_content_core.js`; `drill` renderer and
   `drillHTML` in `90_app.js`; `.dr-*` styles in `10_style.css`; `99_tail.html` concatenation.
   → verify: `node --check`, build, `qa.js` clean with an empty drill array.
2. `92_drill_m1_m3.js` with `DRILL_M3` only: taxonomy scene, drill scene, 14 questions with figures
   and full solutions.
   → verify: all eight gates, plus `verify_drills.py` for the M3 numbers.
3. `mathscan.js` solution-opening pass; re-run.
   → verify: `SCENES WITH MATH DAMAGE: 0`.
4. Present M3 for review. **Stop here.**
5. On approval, M1 and M2 into the same file; then M4–M5; then M6–M7.
6. `CONTENT.META.version` and `91_scenes_end.js` bumped together, once, at the end.

Steps 5 and 6 are not started before step 4 is approved.
