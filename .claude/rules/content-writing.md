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

- One question list per module; Module 0 has none. No second question bank and no answer options (`labtest.js` asserts `options=0`). The student view exposes no question-type taxonomy or internal type suffix.
- A practice question may keep the source paper's shape, never its arithmetic: change every coefficient, frequency, phase, interval, decay rate, impulse location, and figure. Preserve the answer's character (periodic stays periodic, unstable stays unstable). `cos(3πn/11)` is periodic; `cos(3n/11)` is a different question. `src` names the paper question and renders only in the instructor edition.
- Keep Laplace and the z-transform out of this course. Do not introduce a region of convergence.
- A property-table row is one `\leftrightarrow` correspondence in a `wex` block. Do not add a table block type to the artifact renderer. Notes Appendix A supplies `Formula_Reference` Part 2.
- Never show a textbook anchor as a bare address. Use the book chip on screen and `OW CH1.1–1.4` in print. `rule_check.py` rejects `§` and `CH` without `OW`; `seccheck.js` checks the page. The sentence introducing the convention in `m0-howto` is exempt. Declare addresses only in `build/src/89_sections.js`, never in scene files.
- `Book.pdf` is a cross-check reference only. Do not reproduce, quote, or redistribute it.
