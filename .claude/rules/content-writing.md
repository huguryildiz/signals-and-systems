---
paths:
  - "build/src/7*.js"
  - "build/src/8*.js"
  - "build/src/9*.js"
  - "notes/src/**/*.js"
  - "instructor/**/*"
---

# Student-facing content and fixed mathematics

These rules apply to the artifact, notes, PDFs, practice questions, and instructor solutions. Run the relevant gates in `build-pipeline.md` before delivery.

## Editorial rules R1–R6

**R1 — Teach the subject, not the production process.** Student-facing text is self-contained lecture material. It must not reveal conversion, auditing, redrawing, or verification work.

**R2 — Banned student-facing language.** Do not write "in the PDF", "on page X", "in this file", "in this document", "the document shows", "as shown in the attached", "in the source notes", "the source says", "the original notes", "the lecture notes state", "the uploaded document", "the provided material", "redrawn from", "reconstructed from", "based on the original figure", "verified against", "cross-checked", "the audit found", or "editorial enhancement". Do not mention research, transformation, ambiguity ledgers, versions, phases, or production. Rewrite such sentences so the mathematics carries the meaning. For example: "For 0 < t < 1 the shaded area gives y(t) = t²/2."

**R3 — Keep provenance hidden.** It belongs in the instructor edition, instructor solutions, and internal records, never in the student view.

**R4 — Write for a third-year EE undergraduate reading in a second language.** Use short sentences, one idea each, with subject and verb close together. Prefer everyday words: "use" over "utilise", "so" over "consequently", "shows" over "demonstrates". Avoid idioms, figures of speech, hype, praise, decorative rhetorical questions, em-dash chains, nested parentheses, and sentences with three clauses where two sentences work. Define technical terms on first use. Keep one idea per paragraph and put derivation steps in order.

Every derivation is explicit. Start from the governing definition, substitute the given signal or system, show changes of limits or indices, evaluate the integral or sum, and show each algebraic simplification before stating the result. Explain every non-obvious equality or inequality. Do not hide a step in prose or require the student to reconstruct it. A definition or directly stated identity needs no false derivation. On a slide, distribute a long derivation across reveal steps or additional slides; the lecture notes carry the uninterrupted chain.

Practice-question solutions (`sol:` in `build/src/9[2-8]_drill_m*.js`) show every step, with no exceptions. Write each antiderivative and evaluate it at its limits (`[t³/3]_0^2 = 8/3 − 0`). Name every substitution and give its new limits (`s = 5 − t, ds = −dt, t=3 ↦ s=2`). For a geometric series, state the ratio and the condition `|r|<1`. Get each lcm from the prime factorisations. Name each trigonometric identity where it is used. Solve support inequalities one at a time, and say where a negative divisor reverses the inequality. Tabulate index maps, even and odd parts, and running sums region by region. Put a chain of equalities in a `\begin{aligned}` block, with one equality per line. A Check step evaluates the integrals and sums it uses instead of quoting their values. The Module 1 solutions (D1-01 … D1-30) are the reference for this level of detail.

For a content review, use the manual checklist and coverage record in `.claude/reference/derivation-review.md`. This review is editorial; it is not a CI gate or an automated claim that every intermediate step is present.

Say what an idea is for before developing it. Name each move (for example, "take the transform of both sides"). Explain steps students commonly get wrong and the reason for a definition that otherwise looks arbitrary. Worked examples and solutions use **Given, Find, Method, Solution, Check**, including why the method fits. A slide card holds one or two sentences; the notes provide the full explanation.

**R5 — Simple language must preserve correctness.** Define every symbol on first use. Keep CT and DT distinct. Preserve signs, coefficients, limits, and scale factors. State required assumptions and convergence conditions. Distinguish necessary from sufficient, functions from distributions, rad/s or rad/sample from hertz, and impulse locations from weights. State the sinc convention at every use.

**R6 — Use the fixed conventions below without local variation.**

## Mathematical conventions

- Energy and power are normalized to R = 1 Ω; state this once where energy is introduced.
- The imaginary unit is `j`, even where the source handwriting uses `J`.
- CT Fourier transform: `X(jω) = ∫ x(t)e^{−jωt} dt`; inverse: `x(t) = (1/2π)∫ X(jω)e^{jωt} dω`.
- DT Fourier transform: `X(e^{jω}) = Σ x[n]e^{−jωn}`; inverse: `x[n] = (1/2π)∫_{2π} X(e^{jω})e^{jωn} dω`.
- Sinc is unnormalized: `sinc(θ) = sin θ / θ`; restate this at every use.
- The source calls the sampling chapter CH#7 and has no CH#6. Do not invent one.

## Standing content decisions

- One question list per module; Module 0 has none. No second question bank and no answer options in the practice questions (`labtest.js` asserts `options=0`). The student view exposes no question-type taxonomy or internal type suffix.
- A slide may ask for a prediction with `note.ask` choices, and a module may close with one quick-check slide of short predictions (DESIGN.md, "Interaction on a slide"). A prediction needs no paper calculation, gives its reason in one sentence, and has a PASS line in `verify/` for every number it states. It never replaces a worked derivation.
- Every teaching slide carries one prediction card (Module 1, sections 1.2–1.4, are the reference). The card is `{t:'note', kind:'def', head:'Given', html:'<given><div class="nsep"></div><question>', ask:{key:<scene id>, choices, answer, why}}`: one given line, one question, two to four short choices, and a one-sentence `why`. It sits in the last reveal step, or opens a worked example as its Given card. It asks about a new case, not one the slide has already worked out, and it does not repeat a quick-check question. It counts toward the two-or-three-card budget: if the slide would exceed it, remove the card whose content the next slide covers. A worked example's solution slide, a gallery slide, and a laboratory need no card of their own.
- A module summary is a recall deck (`RECALL.deck`, DESIGN.md, "Interaction on a slide"): one card for each result the module carries forward, a short question on the front and a one- or two-sentence answer on the back. The answer states the result exactly, with its conditions, and reads correctly without its question. A deck restates results the module has already proved; it introduces no new result.
- A slide whose task is to plot a signal obtained from a given one (a transformed signal, the output of a system, a filtered signal) makes the reader draw it first with `fig.sketch` (DESIGN.md, "Interaction on a slide"; `m1-combined-b` is the reference). The given signal stays on the axes as a faint dashed trace with its label, the answer and its guide lines go in the `.sk-key` group, and the caption says what to map without stating the answer. Apply it when a module is converted; converted slides are not retrofitted in a separate pass.
- Seven forms inside a card are part of the slide language (DESIGN.md, "Inside a card"). Use the one that fits whenever a slide meets its case, and apply them as each module is converted. Each counts as the card it sits in.
  - **Annotated equation** (`\underbrace{…}_{\text{name}}`): name the parts of one formula, at most two braces a line. Reference: `m1-ct-cexp-c`, envelope and rotation.
  - **Comparison panel** (`.cmp`): two cases side by side in one card, above all continuous against discrete time; one or two sentences a side. Reference: `m1-dt-period`.
  - **Property chips** (`.chips`, `.chip.yes` / `.chip.no`): the verdict on named properties, after the sentence that proves it. Reference: `m1-ex-energy`, energy signal and not power signal.
  - **Step strip** (`ol.steps`): a procedure of two to four moves in a `Method` card, one line a move. Reference: `m1-combined-b`.
  - **Key result** (`eq` with `result:true`, label `Key result · …`): the one result a module carries forward; at most one a slide, on the slide that states it. Reference: `m1-ct-impulse-c`, sifting.
  - **Margin note** (`eq` with `side:true`): the reason for a short equation, beside it; the equation must fit half the column. Reference: `m1-dt-impulse-b`, the first difference.
  - **Value chip** (`.val`): the single number a solution ends on, with its name. Reference: `m1-dt-period-b`, $N_0=10$.
- A practice question may keep the source paper's shape, never its arithmetic: change every coefficient, frequency, phase, interval, decay rate, impulse location, and figure. Preserve the answer's character (periodic stays periodic, unstable stays unstable). `cos(3πn/11)` is periodic; `cos(3n/11)` is a different question. `src` names the paper question and renders only in the instructor edition.
- Every teaching section of a module ends with one "… Around Us" gallery slide, placed after the last teaching scene and before any laboratory (`m0-examples`, and `m1-real-energy` … `m1-real-cexp` built by `realGallery()` in `82_scenes_m1.js`, are the reference). It shows four everyday signals in a 2×2 grid of framed figures, mixing CT (curves) and DT (stems), with physical units on the axes. Two cards follow, the second behind one reveal. Each caption names the everyday source in one sentence and gives its formula in TeX, and the formula must match the plotted function. The traces are schematic, but they keep the feature the section is about (finite energy, delay, period, switch-on, decay). The slide carries `budget:` because it holds four figures. Register its id in `CONTENT.SECTIONS` and in `CONTENT.BOOK`. It introduces no new result.
- Every teaching section of a module has at least one laboratory, and the laboratory is the last scene of the section, after its "… Around Us" gallery (`m1-real-energy` then `m1-lab-b` in 1.2 is the reference order). Opening, summary and property-summary sections carry none. The laboratory exercises the section's own material, not a later section's. List its id inside that section in `CONTENT.SECTIONS`, where it takes a laboratory number (`.L1`, `.L2`, …) rather than an ordinal, and give it a `CONTENT.BOOK` anchor. It follows DESIGN.md, "A laboratory on a slide", and the laboratory type floor. Register it in `LABS` so that `labtest.js` and `labwalk.js` sweep it, and give each fixed number its cards state a PASS line in `verify/`.
- A slide that introduces the idea of a system shows it as a black box: several boxes, each with the same input $x$ and output $y$ but different realisations inside (for example an RC low-pass, a CR high-pass and a complicated circuit; see `m0-blackbox`). The cards say that the course studies the input–output rule, not the wiring.
- Keep Laplace and the z-transform out of this course. Do not introduce a region of convergence.
- A property-table row is one `\leftrightarrow` correspondence in a `wex` block. Do not add a table block type to the artifact renderer. Notes Appendix A supplies `Formula_Reference` Part 2.
- Never show a textbook anchor as a bare address. Use the book chip on screen and `OW CH1.1–1.4` in print. `rule_check.py` rejects `§` and `CH` without `OW`; `seccheck.js` checks the page. The sentence introducing the convention in `m0-howto` is exempt. Declare addresses only in `build/src/89_sections.js`, never in scene files.
- `Book.pdf` is a cross-check reference only. Do not reproduce, quote, or redistribute it.
