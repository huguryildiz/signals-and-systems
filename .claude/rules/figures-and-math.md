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

**R7 — Figures and examples.** Worked examples use Given, Find, Method, Solution, Check. Label every axis. Draw CT signals as curves, DT signals as stems, and impulses as arrows whose height is the weight. An impulse arrowhead points away from the zero line: up for a positive weight, down for a negative one. Draw every impulse through `Axes.impulse`, never with a hand-built path. Every piece of mathematics in a figure is TeX with `tex:true`, never a plain string, Unicode substitute (`∞ ² ₁ Σ ∫ − τ ω ⇒ → × · ≤ ≥`), or `italic:true`. Double TeX backslashes in JavaScript strings (`'\\;'`, `'\\text{...}'`); a bare `;` or stray tab in a label can indicate a lost backslash. No drawing may cross text; labels must not overlap. An axis name must not touch data, axes, arrowheads, or ticks: widen `pad` rather than moving the name inside. Captions explain meaning, not provenance. A legend is 19 px (21 px in projector mode), set only on `.legend` in `10_style.css`; never size a legend per scene or shrink it below the caption. A legend is a card inside the plot, in a corner the traces leave free, never below or beside it; in the dark theme its fill is a light step above the figure card, never darker (see `DESIGN.md`, Legend placement). See `DESIGN.md`, Components and Figures, for mechanics.

**Card colours.** No two cards on a slide share a colour; a labelled equation counts as a card. A teaching slide holds two to four tabbed cards; a fifth needs a `budget:` reason on the scene. Write each card's `kind` for its meaning and let `toneCards()` in `build/src/90_app.js` recolour a repeat; never set a card colour in scene data. See `DESIGN.md`, Information card.

**Practice questions sit on cards.** Every practice question, in every module, is drawn inside one card (`.dr-page .quiz.drill`, styled like `.card`), from its code pill down to the worked solution. Style it only through that rule in `10_style.css`; never per module or per question. See `DESIGN.md`, Practice questions.

**The practice pager takes a typed question number.** The number in `Question N of M` is an input field (`input.dr-n[data-drill-go]`) that jumps to the typed question on Enter or blur, clamped to the module's range. It comes from the shared `drill` block in `90_app.js`, so every module has it; keep it when editing the pager, and do not add a second navigation control per module.

**Sticky notes in figures.** A figure may carry a short rule as a sticky note drawn inside the SVG: a `#F3DC7A` rectangle about 56 px high, tilted 2–3 degrees, with an offset `rgba(0,0,0,.28)` shadow, dark `#232B33` TeX text at 15 px, and `--fig-halo:#F3DC7A` on the group. Every sticky note has a red pin at the centre of its top edge: a `#D13B3B` circle of radius 7 with a small white highlight and an elliptical shadow, drawn inside the rotated group. Place the note where it crosses no data or label, and widen the axis range to make room if necessary. The notes in `m1-power` and `m1-periodic-b` (`build/src/82_scenes_m1.js`) are the reference.

**Sequences on a figure.** A figure that builds or takes apart a result in steps uses `fig.frames` with Previous and Next buttons, and each press animates the change; it never uses a slider. Sliders (`fig.live`) are only for a continuous parameter. The Previous/Next bar and its `01 / 03` counter come from the renderer; a scene never draws or styles its own. See `DESIGN.md`, "A figure played in frames".

**R8 — Typeset mathematics in every student-facing field.** Route eyebrows, equation labels, callout titles, card tabs, worked-example keys, table heads, contents entries, and captions through `md()`. A new block type in `build/src/90_app.js` or `notes/src/render.js` must route every text field through `md()` in the same commit. Keep the `.katex` `text-transform` and `letter-spacing` resets in both stylesheets.

**R9 — Check these rules mechanically.** Run the relevant gates in `build-pipeline.md`. Inspect screenshots after visual changes; gates cannot see every flaw.

**Laboratory font-size rule.** Before delivering a new or restyled laboratory, check computed sizes
against the laboratory type floor in `DESIGN.md`. Remove bare inline pixel sizes from its controls
and results. Inspect normal and projector views in both themes with the longest populated control
state. Record the projector fit factor and confirm it is at least 0.90 without clipped text. If
larger type causes a poor fit, reflow the controls or readouts, or split the scene; do not shrink the
type back down or apply an unverified font override to every laboratory.

Keep the KaTeX macro lists in `60_plot.js`, `90_app.js`, and `notes/src/render.js` in step. The even and odd parts are written `\Ev\{x(t)\}` and `\Od\{x(t)\}`, which render as $\mathcal{E}\mathrm{v}$ and $\mathcal{O}\mathrm{dd}$. Never shorten the odd operator to "Od" in a macro, a plain-text label, or hand-written TeX. `PLOT` and `APP` are top-level `const`, not `window` properties; use their bare identifiers in Playwright `page.evaluate`.

Never run blanket search-and-replace over `build/src/*.js`. JavaScript statement terminators and TeX thin spaces use semicolons differently. Edit labels individually, then run `node --check build/src/8*.js build/src/9*.js`.
