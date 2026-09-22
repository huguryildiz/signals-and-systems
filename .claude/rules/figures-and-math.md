---
paths:
  - "build/src/10_style.css"
  - "build/src/60_plot.js"
  - "build/src/7*.js"
  - "build/src/8*.js"
  - "build/src/9*.js"
  - "build/textclash.js"
  - "notes/src/**/*.js"
---

# Figures, typesetting, and visual changes

Read `DESIGN.md` before changing a scene, figure, or style. Respect its LOCKED decisions. The palette is defined across `build/src/10_style.css`, `build/src/60_plot.js`, and `build/textclash.js`; keep those files consistent when changing it. New lecture-slide styles remain under `.scene.slide` until the final conversion plan removes the opt-in flag.

**R7 — Figures and examples.** Worked examples use Given, Find, Method, Solution, Check. Label every axis. Draw CT signals as curves, DT signals as stems, and impulses as arrows whose height is the weight. Every piece of mathematics in a figure is TeX with `tex:true`, never a plain string, Unicode substitute (`∞ ² ₁ Σ ∫ − τ ω ⇒ → × · ≤ ≥`), or `italic:true`. Double TeX backslashes in JavaScript strings (`'\\;'`, `'\\text{...}'`); a bare `;` or stray tab in a label can indicate a lost backslash. No drawing may cross text; labels must not overlap. An axis name must not touch data, axes, arrowheads, or ticks: widen `pad` rather than moving the name inside. Captions explain meaning, not provenance. See `DESIGN.md`, Components and Figures, for mechanics.

**R8 — Typeset mathematics in every student-facing field.** Route eyebrows, equation labels, callout titles, card tabs, worked-example keys, table heads, contents entries, and captions through `md()`. A new block type in `build/src/90_app.js` or `notes/src/render.js` must route every text field through `md()` in the same commit. Keep the `.katex` `text-transform` and `letter-spacing` resets in both stylesheets.

**R9 — Check these rules mechanically.** Run the relevant gates in `build-pipeline.md`. Inspect screenshots after visual changes; gates cannot see every flaw.

Keep the KaTeX macro lists in `60_plot.js` and `90_app.js` in step. `PLOT` and `APP` are top-level `const`, not `window` properties; use their bare identifiers in Playwright `page.evaluate`.

Never run blanket search-and-replace over `build/src/*.js`. JavaScript statement terminators and TeX thin spaces use semicolons differently. Edit labels individually, then run `node --check build/src/8*.js build/src/9*.js`.
