# One exam drill per module, twenty questions, one question per screen

Design settled 2026-08-01. This document is both the design record and the
authoring contract: every module file is written against it, so a question
written by one hand is indistinguishable from a question written by another.

---

## 1. What replaces what

Every module from 1 to 7 carries **one** examination section holding **twenty**
open-ended questions. There are 140 questions in total. Module 0 has none: it is
the course opening and carries no examinable method.

The separate question bank is removed — its scenes, its `CONTENT.QBANK` data, its
source files, its block renderer, its CSS, and its checks. A reader met two
lists that looked the same and behaved the same; now there is one.

All 140 questions are newly written. The 87 drill questions and 84 bank
questions that stood before this change are deleted, not migrated.

The taxonomy scene in front of each drill stays. It names the recurring question
shapes and is the map of the twenty questions that follow.

---

## 2. Where the questions come from

Three examination papers sit in `source/exams` — Midterm I, Midterm II and the
Final, each one a table setting the 2018, 2019 and 2021 papers side by side, four
questions to a paper. They are the model for the form and for the difficulty.

**No question from those papers is reproduced, in whole or in part, and no
question is a renumbered copy of one.** What is taken is the *skill* a question
measures. The setup, the signals, the coefficients and the figures are written
fresh.

Roughly twelve of a module's twenty questions are built on skills the papers
measure. The remaining eight cover the rest of what the module teaches, so a
reader who works all twenty has met the whole module and not only the part that
has been examined before.

The skill mapping:

| Module | Skills drawn from the papers |
| --- | --- |
| M1 Signal Foundations | periodicity and the fundamental period; energy and power with classification; transformation of the independent variable; even and odd parts; the impulse — sifting, scaling, trains |
| M2 Systems and Their Properties | the five properties tested one at a time with justification; counterexample construction |
| M3 LTI Systems | impulse response from a difference or differential equation; discrete-time convolution; continuous-time convolution; output sketched from a given figure |
| M4 Fourier Series | Fourier series coefficients in both domains; magnitude and phase spectra; average power over one period; a periodic input through an LTI system |
| M5 CTFT | the transform of a given signal; the inverse transform; properties used as shortcuts; modulation and a communication chain |
| M6 DTFT | the transform of a sequence; plotting over one period in $\omega$; the spectrum of an LTI output |
| M7 Sampling | the Nyquist rate for sums and products; aliasing and the apparent frequency; guard bands; reconstruction |

A question's `src` field records which paper question its skill came from. It is
instructor-only and never rendered to a student, in line with R3.

---

## 3. The anatomy of a question

A question is one object in `CONTENT.DRILL`:

```js
{ id:'D1-07', module:'M1', type:'transform', src:'MT1 Q1',
  stem:'…the statement, with display mathematics where the signal is defined…',
  figure:()=>{ … a function returning SVG, omitted when none is given … },
  parts:['…the first ask…','…the second ask…'],
  sol:'<b>Given.</b> … <b>Find.</b> … <b>Method.</b> … <b>Solution — part (a).</b> … <b>Check.</b> …',
  figSol:()=>{ … the answer figure, omitted when nothing was to be plotted … },
  err:'…the single most likely student error, and why it is wrong…',
  teach:'…one instruction to whoever is teaching this…' }
```

Rules that hold for every one of the 140:

- **Parts are lettered, never numbered**, and there are two to five of them.
  They are separate asks, not steps of one method.
- **No point weights.** The papers carry them; the drill does not.
- **About half the questions of a module give a figure** and ask for something to
  be plotted. `figure` is the given; `figSol` is the answer. Both are functions,
  never strings, so they are regenerated per render and pick up the current
  palette — a figure built once at load time keeps the palette it was born with.
- **The solution follows R7 exactly**: Given, Find, Method, Solution, Check. Where
  there are lettered parts, the solution is broken as `<b>Solution — part (a).</b>`
  and so on. The Check step is not optional and is not a restatement: it is an
  independent route to the same number, a bound, a limiting case, or a symmetry
  argument.
- **Every number stated in a Check is verified** — see §6.
- **No hints.** The reader has the statement and, when asked for, the solution.
- `err` and `teach` render in the instructor edition only.

---

## 4. How a question reaches the page

One question fills the screen. Above it sits a pager: `Question 7 / 20` between
a **Previous** and a **Next** button, disabled at the two ends. The current
question of each module is held in `S.drillPage`, so a reader returns to where
they stopped.

`Show worked solution` opens the solution below the question and the state
persists per question, exactly as before.

The question body is a single column that scrolls vertically inside the stage.
There is no multi-column layout anywhere in it. The previous panel used
`column-count:2` inside a height-constrained box; CSS multicolumn overflows
sideways under that constraint and `overflow-x:hidden` clipped it, so questions
three and later existed in the DOM and could not be reached. That whole
mechanism is gone.

`fitScene()` leaves a scene containing `.dr-page` unscaled, for the same reason
it left the old panel unscaled: the content scrolls rather than shrinks.

In print, each question is a page.

---

## 5. Files

| File | Holds |
| --- | --- |
| `build/src/92_drill_m1.js` | taxonomy and 20 questions, Module 1 |
| `build/src/93_drill_m2.js` … `98_drill_m7.js` | the same, Modules 2 to 7 |

Each file defines `CONTENT.DRILLTYPES.M<n>`, appends its 20 questions to
`CONTENT.DRILL`, and sets `window.DRILL_M<n>` to its two scenes — the taxonomy
scene and the drill scene. `99_tail.html` already concatenates
`window.DRILL_M1 … DRILL_M7`, so the registration does not change.

Deleted: `95_qbank.js`, `96_qbank_m4.js`, `verify/qbank_check.py`,
`verify/qbank_struct.js`, the `qbank` renderer and the `{t:'qbank'}` scene block
in each of `82_scenes_m1.js` … `88_scenes_m7.js`.

`CONTENT.META.version` becomes **v1.3**, moved in `80_content_core.js` and
`91_scenes_end.js` in the same commit.

---

## 6. Verification

`verify/verify_drills.py` is rewritten against the new 140. Every number a Check
step states is re-derived there independently — symbolically where SymPy can and
numerically where it cannot — one PASS/FAIL line per claim. Where an answer is a
proof or a counterexample rather than a number, what is checked is that the named
counterexample does what the solution claims.

Each module contributes a clearly headed section to that file, so a module can be
written and checked on its own.

The gates change as follows:

- `labtest.js` — reveals every solution of every module and walks the pager from
  the first question to the last. The `options=0` assertion stays. The hint-ladder
  assertions go with the bank.
- `mathscan.js` and `textclash.js` — both already click every `[data-sol]`. Both
  now page through all twenty questions of a drill, opening the solution of each;
  without that, nineteen of twenty questions are never seen by either gate.
- `qa.js`, `rule_check.py`, `labwalk.js`, `notes/mathscan.js` — unchanged in kind.

All nine gates must pass before anything is called done, and the numbers a run
printed are what gets reported.

---

## 7. Editorial rules

R1–R9 of `CLAUDE.md` bind every word of every question. The three that are
easiest to break while authoring mathematics at this volume:

- **R7 / figures.** Every piece of mathematics inside a figure is TeX, marked
  `tex:true`, never a Unicode substitute. Axis names are TeX source and sit
  outside the data area. A backslash in a TeX string is doubled in JavaScript:
  `'\\;'`, `'\\text{...}'`. A bare `;` in a typeset label is a lost backslash.
- **R8.** Every student-facing text field goes through `md()`. The renderer
  already does this for `stem`, `parts`, `sol`, `err` and `teach`.
- **R2.** Nothing in a question may mention a paper, a page, a source, a version
  or the fact that anything was derived from anything. A question states its own
  mathematics and nothing else.

Never run a blanket search-and-replace over `build/src/*.js`: a backslash and a
semicolon mean one thing in the JavaScript and another inside a TeX string.
Run `node --check` on a module file after editing it and before the gates.

---

## 8. Order of work

The machinery and Module 1 are built first and taken through all nine gates.
Module 1 is then the worked example every other module is written against.
Modules 2 to 7 follow against this contract.
