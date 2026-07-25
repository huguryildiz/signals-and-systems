# EE 311 — Cowork project instructions (paste-in)

Paste the block below into the Claude desktop app: project **EE311 → Instructions**.
It is a pointer, not a second source of truth. The full operating doc is `EE311/CLAUDE.md`.

---

This project produces EE 311 — Signals and Systems teaching material from an 88-page handwritten
source: an interactive single-file HTML artifact, lecture notes, and PDF editions.

**Before doing anything, read `CLAUDE.md` in the project root**, then `instructor/PHASE2_HANDOFF.md`
and `instructor/EE311_STYLE_RULES.md`. The design system, build pipeline and content schema are
locked — do not redesign them. If something looks wrong, say so and stop; do not silently change it.

State: v0.9. Modules 0–3 complete. Phase 2 (visual audit of pp. 22–88, Modules 4–7, labs F–J, banks
Q4–Q7, five PDFs) not started.

Rules that hold in every session:

- Rebuild only from `build/EE311_Deliverables.zip`. The zip in `archive/` is stale and
  incomplete — it predates the editorial sweep and is missing the notes pipeline and `rule_check.py`.
- Student-facing text is written directly as teaching material. Never "in the PDF", "the source notes",
  "redrawn from", "verified against", or any mention of audits, ledgers, versions or phases. Provenance
  lives only in instructor-only areas and hidden records.
- Register: simple, short, plain academic English. Plain wording never costs mathematical correctness —
  exact signs, limits and scale factors; stated convergence conditions; CT and DT visibly separate.
- Fixed conventions: R = 1 Ω normalised energy; imaginary unit `j`; `X(jω)=∫x(t)e^{−jωt}dt`;
  `X(e^{jω})=Σx[n]e^{−jωn}`; unnormalised `sinc(θ)=sinθ/θ`. The source has no CH#6 — do not invent one.
- Signal colours are fixed: cyan = input/CT signal, amber = impulse response/system, green = output,
  violet = intermediate, red = error/aliasing.
- Nothing is "done" until `qa.js` (0 overflow), `labtest.js` ("ERRORS: none"), the `verify/` suite
  (all pass) and `tools/rule_check.py` ("TOTAL VIOLATIONS: 0") have actually been run. Report the
  numbers, not a summary.
- The artifact stays a single offline file: no network fetch, no npm install, no analytics.
- `Book.pdf` is a cross-check reference only — never reproduced, quoted or redistributed.
- Source pages 22–88: the existing inventories are mapping-grade only. Read the pages directly at 160 dpi
  before authoring from them. Never correct the source silently; record confirmed issues from **A-09** on.
- Do the work in the container, deliver with `SendUserFile`, then write back into the numbered folders
  (`source` / `dist` / `instructor` / `build`, superseded material to `archive`).

Conversation with me is in Turkish. Everything visible in a deliverable is in academic English.
