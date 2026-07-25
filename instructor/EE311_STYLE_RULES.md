# EE 311 — editorial rules (binding on every deliverable)

Status: **RULE**. Applies to the interactive artifact, all lecture notes, all PDFs, all question banks,
and anything produced in later phases. Set 2026-07-25.

---

## R1 — Write as lecture notes, not as a report about lecture notes

Every student-facing text is written **directly**, as self-contained teaching material. The reader must
never be able to tell that any conversion, audit, redrawing or verification took place.

## R2 — Banned in student-facing content

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

## R3 — Where provenance lives instead

Source pages, traceability, ambiguity records and version data are kept in **hidden records** and in
**instructor-only areas**:

- instructor edition of the artifact,
- instructor solutions document,
- separate internal records not distributed to students.

They are never rendered in the student view and never printed in student documents.

## R4 — Language and register

Simple, short, plain academic English.

- Short sentences. One idea per sentence.
- Prefer the plain word: "use" not "utilise", "so" not "consequently", "shows" not "demonstrates".
- No hype, no praise of the material, no rhetorical questions used as decoration.
- Address the reader directly where it helps: "First find the support of each signal."
- Do not use em-dash chains, nested parentheses, or three-clause sentences where two sentences work.

## R5 — Simple language must not cost correctness

Plain wording is required; mathematical looseness is not permitted.

- Every symbol is defined on first use.
- Continuous-time and discrete-time cases are kept visibly separate.
- Signs, coefficients, integration and summation limits, and scale factors are exact.
- Assumptions and convergence conditions are stated wherever a result depends on them.
- Necessary and sufficient conditions are distinguished.
- Functions and distributions are distinguished. Impulse locations and weights are exact.
- Angular frequency (rad/s or rad/sample) is distinguished from frequency in hertz.
- The sinc convention is stated wherever sinc is used.

## R6 — Fixed conventions

- Energy and power are normalised, R = 1 Ω. Say so once, where energy is introduced.
- The imaginary unit is j.
- X(jω) = ∫ x(t) e^(−jωt) dt and x(t) = (1/2π) ∫ X(jω) e^(jωt) dω.
- X(e^(jω)) = Σ x[n] e^(−jωn) and x[n] = (1/2π) ∫ over any 2π interval of X(e^(jω)) e^(jωn) dω.
- sinc is unnormalised: sinc(θ) = sin θ / θ.

## R7 — Examples and figures

- Worked examples use: Given, Find, Method, Solution, Check.
- Every figure axis is labelled. Continuous-time signals are curves. Discrete-time signals are stems.
  Impulses are arrows whose height is the weight. Negative frequencies are shown when they exist.
- A figure caption explains what the figure means. It never explains where the figure came from.

## R8 — Automated check

`tools/rule_check.py` scans every student-facing string for banned phrases and fails the build on a hit.
Run it before any delivery.
