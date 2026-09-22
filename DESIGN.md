---
name: Signals and Systems
description: A lecture deck, lecture notes and practice questions for a one-semester course, in one design.
colors:
  canvas: "#FAF8F4"
  panel: "#FFFFFF"
  well: "#F2EFE8"
  ink: "#232B33"
  graphite: "#3B4650"
  muted: "#616B76"
  faint: "#939BA4"
  hairline: "#DCD7CC"
  hairline-strong: "#C2BCB0"
  coral: "#A0451C"
  slate: "#28567E"
  navy: "#12314E"
  signal-input: "#14707F"
  signal-system: "#C08422"
  signal-output: "#4A7A46"
  signal-intermediate: "#6A5A92"
  signal-error: "#A63B2A"
  tab-amber: "#8A5E12"
typography:
  display:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "74px"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "45px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.008em"
  body:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  card:
    fontFamily: "Inter, SF Pro Text, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "21.5px"
    fontWeight: 400
    lineHeight: 1.52
  label:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, IBM Plex Mono, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.12em"
rounded:
  sm: "3px"
spacing:
  s1: "8px"
  s2: "16px"
  s3: "24px"
  s4: "32px"
  s5: "48px"
  gutter: "44px"
  s7: "80px"
  page: "104px"
  flow: "18px"
components:
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.graphite}"
    typography: "{typography.card}"
    rounded: "{rounded.sm}"
    padding: "17px 22px 16px"
  card-tab:
    backgroundColor: "{colors.slate}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 12px 4px 10px"
  equation:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16px 22px 16px 24px"
  figure-frame:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
---

# Design System: Signals and Systems

This file holds every visual decision for the project. `CLAUDE.md` holds how to build and check;
`PRODUCT.md` holds who it is for. The source of truth for a value is the code: `:root` and
`body[data-theme=dark]` in `build/src/10_style.css`. Where this file and the code disagree, say so and
stop; do not pick one silently.

**Status of each part.** Sections marked **LOCKED** describe what is built and may not be changed
without the owner saying so. The section marked **DECIDED 2026-09-21, NOT YET BUILT** is the slide
language the owner approved from a mockup. It opens two earlier locks, and it names them.

## Overview

**Creative North Star: "The lecture deck of a careful department"**

A scene is a lecture slide: a title, a rule, two columns, a figure, the equations, and short
information cards. It is read from the back row of a 16:9 room while the instructor talks, so it
carries little prose and large type. The long explanation lives in the lecture notes.

The look is calm, rigorous and editorial: ivory paper or deep navy, a serif title, a plain sans body,
small uppercase mono labels, hairline rules, a 3 px radius. There is no gradient, no glass, no
decorative shadow, no emoji, no hero number. Colour is spent on meaning: the five signal colours say
what a curve *is*, and the card colours say what a card *does*.

**Key characteristics**

- One slide, one figure, two or three cards. See "A slide" under Layout.
- One idea a card, one or two short sentences a card.
- The stage is full: nothing top-heavy, nothing clipped.
- The same slide works in both themes and in lecture mode without a second design.

## Colors

### Signal colour semantics — LOCKED

Reused unchanged in every module, in every figure, in the artifact and in the notes:

cyan `#14707F` input / CT signal · amber `#C08422` impulse response / system · green `#4A7A46` output ·
violet `#6A5A92` intermediate transformation · red `#A63B2A` error / misconception / aliasing.

A figure never uses one of these for anything else. A card may borrow green for a solution and red for
a common error because those meanings agree; it never borrows cyan or violet.

### Surface and accent tokens — LOCKED

Re-cut on 2026-08-01 so the artifact reads as the same publication as `huguryildiz.github.io`. The
five signal colours did not move; only the page, the ink ramp, the hairlines and the two accents did.

| | light | dark |
| --- | --- | --- |
| canvas | `#FAF8F4` | `#0E1621` |
| raised panel | `#FFFFFF` | `#1A2634` |
| ink | `#232B33` | `#E6E2D9` |
| hairline | `#DCD7CC` | `#27333F` |
| coral, editorial emphasis | `#A0451C` | `#E09A6A` |
| slate, metadata | `#28567E` | `#8FB8DC` |
| navy, module-opening and synthesis scenes only | `#12314E` | `#080F18` |

The dark page is a deep navy, not a warm brown-black. In the dark theme the signal tokens are light
tints: cyan `#4FBECE`, amber `#E5B255`, green `#82C27B`, violet `#AC99DC`, red `#E8785F`.

**Three places hold these values and must move together:** `:root` and `body[data-theme=dark]` in
`build/src/10_style.css`, `LIGHT` and `DARK` in `build/src/60_plot.js`, and the `GRID` / `AXIS` /
`LIGHTFILL` token lists in `build/textclash.js`. The collision sweep classifies a drawn element as
guide, axis or content by its colour, so a palette change that skips `textclash.js` makes the gate
report on colours the artifact no longer draws.

`notes/src/notes.css` still carries the earlier light-only palette. The lecture notes and the artifact
are therefore not the same colour. This is a known gap, not a decision.

### The public cover page

Redesigned on 2026-09-23. The cover no longer shares `site.css` with the sibling course
(`~/Documents/GitHub/digital-communications`); the two cover pages are now separate designs. It uses
the artifact's own tokens (the ivory and navy surfaces, the ink ramp, coral and slate above) so the
cover and the course read as one publication. The styles are inline in `web/index.html`, with no web
font and no stylesheet request.

The page is one stage and a footer. The stage holds the bar, a centred title with a 120 px coral rule
under it, the byline, the lead, one primary action (`Open the course`), and four download cards: the
lecture notes, the student workbook and the formula reference as PDFs, and the course itself as its
single HTML file. The instructor edition is never linked. Each card carries a photograph of the
document, its title, one sentence, and a footer with the format, page count, file size and a
`Download` action. There is no eyebrow, no gradient text, no glass and no numbered sequence.

The four photographs in `web/img/` were generated with Codex (`gpt-6-sol`, reasoning effort medium)
from the prompt kept in `web/img/PROMPT.md`, then reduced to 960×640 JPEG at quality 72, about 65 KB
each. The first is preloaded; the others load lazily. They show the design of the covers, not the
printed PDFs, and a regenerated image must keep the spelling of every title exact.

The backdrop, `web/backdrop.js` (Radiant Shaders #41, "Signal Decay", MIT), sits behind the whole
stage and fades out below the cards. Its traces use the dark-theme signal tints (cyan clean, amber
degrading, slate what is left). CSS blends it into the page: `screen` at opacity .34 in the dark
theme, and in the light theme `invert(1) hue-rotate(180deg)` with `multiply` at .30, so the same
traces read dark on ivory. It renders at 0.6 of CSS resolution and 30 frames a second, starts after
the page has loaded, pauses when the tab is hidden or the canvas is off screen, and draws one still
frame under reduced motion. It cannot be checked by reading pixels back; `sitecheck.js` asserts the
context, the linked program and the viewport instead, and checks that the four photographs load.

## Typography

Serif for the display and scene titles, sans for everything read as a sentence, mono uppercase with
wide tracking for labels: the eyebrow, a card tab, an equation label, the key of a worked-example row.
Mono is used for labels and addresses only, never for running text.

| role | size | notes |
| --- | --- | --- |
| display `h1` | 74 px serif 400 | module openings |
| scene title `h2` | 45 px serif 400 | topic-style heading, never a sentence |
| lede | 23.5 px serif italic | one sentence under a title, used sparingly |
| body | 19 px / 1.55 | max width 900 px |
| card body | 21.5 px / 1.52 | **new**; was 17.5 px |
| label / tab | 13.5 px mono, `.12em`, 600 | **new**; was 12.5 px |
| equation | 15.2 px legacy base; converted slides 19 px and converted-module laboratories 18 px, KaTeX at 1.30 em; slide `lg` 1.68 em | scales with `--ts` |
| explanation below a slide equation | 21.5 px / 1.52 | matches the information-card body; legacy equations retain 15 px |
| figure caption | 18 px / 1.45 on converted slides and converted-module laboratories | legacy scenes remain 14 px |

**Every size is written `calc(Npx * var(--ts))`.** `--ts` is 1 in normal display and 1.36 in lecture
mode (`body[data-display=projector]`). A size written as a bare pixel value does not grow in the
lecture room, which is the one place it has to. The mockup hard-coded its sizes; the build must not.

**Laboratory type floor.** When a laboratory is authored or restyled, control and result labels are
at least 16 px, segmented choices at least 17 px, live and result values at least 20 px, and
explanatory prose at least 19 px at `--ts:1`. These are source sizes, all multiplied by `var(--ts)`;
inline pixel sizes do not qualify. Inspect populated, long-text states in both themes and display
modes at 1920×1080. In lecture mode the scene must keep a fit factor of at least 0.90 with no
clipping. Reflow controls or results, or split the laboratory, before reducing type. A common
font-size override is not a substitute for checking each laboratory's fit.

**A label frame does not rewrite the mathematics it carries (R8).** The label classes are uppercase
with wide tracking, and both are inherited: `text-transform` turns `a_k` into `A_K` and
`letter-spacing` pulls an expression apart. Every label class resets both on `.katex`. A new label
class, a card tab included, carries the same reset in the same commit.

## Layout

### The stage — LOCKED

- **One file.** No network requests, no analytics.
- **Fixed 1920×1080 stage**, scaled to fit the window and centred. A window that is not 16:9 shows
  bands in the page colour above and below. This is accepted: the lecture room is 16:9.
- Scene padding `54px 104px 74px`; the content box under the padding is 952 px tall.
- `fitScene()` scales an oversized scene down to a floor of 0.82 (0.70 in lecture mode). It is a
  safety net, not a licence to overfill: a scene that needs below about 0.90 is split instead. On the
  floor, what is left is taken from the figures in proportion to their height, and a scene that gives
  up more than 3% of its figure height marks itself `data-capped`. `qa.js` names both under `dense`.
  Reaching that rescue is the signal to split the scene.
- **Radial and orbital compositions** are reserved for course maps and synthesis scenes.

### Rollout: a scene opts in — DECIDED 2026-09-21

Everything in the slide language is scoped to scenes that carry `slide:true`. The renderer puts the
class `slide` on the scene host and every new rule is written under `.scene.slide`. An unconverted
scene keeps today's look and today's fit factor, so the gates stay green and the site stays
publishable after every commit. The card type is 21.5 px against 17.5 px; applied to all 234 scenes
at once it would push many of them under the 0.90 fit line before their text is cut. When the last
module is converted, one final change removes the flag and edits the base rules. Until then the new
rules out-specify the old ones and do not replace them.

### Filling the stage — DECIDED 2026-09-21, NOT YET BUILT

A sparse scene used to sit at the top of the stage with a third of it empty, because `fitScene()` only
ever scales down. The slide language fixes this in two parts:

1. A `cols` block can be marked `fill`. Its columns then stretch to the full height of the content box
   and distribute their children over it (`justify-content:space-between`), so the air is shared
   between the cards and not left under them. In the mockup this rode on the `ratio` string
   (`'c-5-7 fill'`); the build gives `cols` its own `fill` key.
2. The figure is the child that takes the slack. The mockup tuned two viewBox heights by hand
   (700×519 and 700×581). That does not scale to 234 scenes. `fitScene()` needs a second half that
   grows `figure.fig > svg` into the room that is left, up to a cap, and marks the scene when it does,
   the way `data-capped` marks the opposite case.

Measured on the mockup: the scene needs 899 px of the 952 px content box (94%), with no `data-fit` and
no `data-capped`.

### A slide

Title, then a full-width hairline under it with a 150 px coral segment, 2 px, at its left end. Then two
equal columns by default: the given data and the figure on the left, the method, the steps and the
result on the right. A documented exception may keep a 5:7 split only when the figure itself needs a
narrower column to avoid growth-cap or fit failure. Reveal steps stay; a slide builds in the order the
instructor speaks.

**Figure and card budget — DECIDED 2026-09-23.** A teaching slide carries exactly one figure and two
or three information cards. The figure is required; a slide without one records the reason in a
comment beside its scene. More than three cards means the slide holds more than one idea and is
split. Laboratories keep their own layout and are outside this budget.

A laboratory uses the full remaining stage height. Its main columns stretch to the bottom of the
scene, and stacked controls, readouts and explanations distribute through that height. Do not leave a
laboratory compressed against the title with an unused lower half.

A dense scene is split, one example or one idea a slide. Splitting is a renumbering: it is an edit to
`build/src/89_sections.js` and nothing else carries an address.

Spacing is tight inside a card and generous between cards, with 30 px above every card so a tab never
touches the block above it.

## Elevation & Depth

Flat. Depth is tonal: canvas, raised panel, sunken well. There are no shadows on cards, figures or
equations. The paper grain on the stage is the only texture, and it never sits over an equation.

## Shapes

One radius, 3 px. Hairline borders, 1 px. The only thicker strokes are the 3 px left edge of a card or
an equation and the 2 px coral segment under a title. A block outline or a summing junction in a
figure has no fill at all; the label halo does the separating.

## Components

### Information card — DECIDED 2026-09-21, NOT YET BUILT

The card is a restyle of the existing `note` block, so the roughly 340 notes in the course take it with
no content change. The markup stays `<div class="note KIND"><span class="note-h">HEAD</span>…</div>`.

- Body: raised panel tinted 4% with the kind's colour, 1 px hairline border, 3 px left edge in the
  kind's colour, 3 px radius, padding `17px 22px 16px`, 21.5 px type.
- Tab: `.note-h` becomes a filled tab on the card's top-left edge, outside the reading column. Mono
  13.5 px uppercase, `.12em`, weight 600, padding `4px 12px 4px 10px`, top corners rounded.
- Icon: one drawn set, 15 px, 1.6 px stroke, as an inline SVG `mask-image` data URI on
  `.note-h::before` so it takes the tab's ink. No network, about 2 KB.
- A `note` with no head stays a plain card with no tab.

| kind | colour | icon | used for |
| --- | --- | --- | --- |
| `def` | slate | bookmark | Given, Method, Check, a definition |
| `ok` | green | check | Solution, a result |
| `warn` | amber; tab fill `#8A5E12` in the light theme | lightbulb | an interpretation, a thing to notice |
| `err` | red; tint 8% | warning triangle | Common error, a misconception |

Tab text is white in the light theme and the canvas colour in the dark theme, where every token is a
light tint. Computed contrast: white on slate 7.5:1, on green 5.0:1, on red 6.4:1, on `#8A5E12` 5.7:1,
on coral 6.3:1; dark theme 6.3–8.8:1. White on the amber token itself is about 3.2:1, which is why the
amber tab uses the darker fill.

**Two incumbent rules must be edited, not overridden.** `.note.ok .note-h{color:…}` out-specifies a
plain `.note > .note-h` and prints green text on the green tab. `.note.err` carries its own padding,
radius and background. The mockup restated both; the build changes the base rules.

**This opens a lock.** The `note` was a bare left rule with a small heading. The owner chose the
tabbed card from the mockup on 2026-09-21.

### Equation

Raised panel, hairline border, 3 px coral left edge. An equation with a `label` takes the same tab as a
card, in coral, no icon: `Step 1 · Energy`. `.eq.key` adds a faint coral tint. `.eq.plain` has no
frame.

### Worked example

Given, Find, Method, Solution, Check (R7). On a slide these are cards, not the rows of a `wex` ladder:
`Given` and the `Find` line share one card with a hairline between them, each step is a labelled
equation, `Solution` is a green card, and `Check` or `Common error` closes the column. The `wex` block
stays for the property tables, where a row is one `\leftrightarrow` correspondence; its key column is
136 px, which holds `DIFFERENTIATION` in tracked mono without a mid-word break.

### Eyebrow

The band above the title carries the module, the scene's address in coral, and for 196 scenes a
textbook anchor as a chip: an open book drawn as inline SVG (`CONTENT.BOOKICON`), then `CH1.1.2`. The
anchor never reaches a reader as a bare address; the book, or `OW` in print, tells the two numbering
systems apart. `#scene-host svg` makes every SVG a full-width figure, so
`#scene-host .eyebrow .ebicon` gives the icon back its 12.5 px. Do not remove that rule.

### Figures — LOCKED

- **Axis names live outside the data area**: the independent variable under it, the dependent variable
  above it. `Axes` widens the bottom or top margin by itself when the given `pad` is too small. Every
  label carries a halo in `--fig-halo`. Do not move labels back inside the data area.
- **`xlabel` and `ylabel` are TeX source**, typeset with KaTeX. Words go in `\text{...}`, Greek letters
  are `\tau`, `\omega`, and `\operatorname{Re}` is the house spelling. A name that fails to parse falls
  back to its source and logs a console error, which turns `qa.js` red. The name is laid out in a
  `foreignObject` and drawn after the data. The strip reserved for a name is one line of mathematics
  tall (`NAMEBOX` in `60_plot.js`), and the independent variable sits `XNAME_DROP` below its axis so it
  clears the tick row and the arrowhead. Do not shrink either. If a name still lands on a tick number
  or on the axis, raise `pad`, not the name.
- **`texName` typesets every other piece of mathematics in a figure.** It anchors a formula on
  `xLeft`, `xMid` or `xRight` at a baseline. In `blocks()` a label that is mathematics is marked
  `tex:true` on a `box`, a `text` or an `arrow`; plain words stay ordinary text. Each typeset label is
  a `foreignObject` marked `data-texlabel`, which is what `textclash.js` measures.
- **Every piece of figure mathematics is TeX (R7).** Never a plain string, never a Unicode substitute:
  no `x₁`, `Σ`, `∫`, `−`, `τ`, `ω`, `∞`, `²`, `⇒`, `→`, `×`, `·`, `≤`, `≥`. `italic:true` is not a
  substitute for `tex:true`. Mixed text and mathematics is one TeX string with the words in
  `\text{...}`. A TeX backslash is doubled in a JavaScript string: `'\\;'`, `'\\text{...}'`. A bare
  `;` or a stray tab in a label means a lost backslash. Tick numbers and the weight an `impulse()`
  carries are part of the scale and stay plain.
- **Nothing written in a figure is crossed by anything drawn in it**, and no label sits on another, at
  any step. Annotations go in free space. `textclash.js` fails on any contact, and an axis name fails
  on any hit at all. Where a name has no room, widen the margin.
- **A trace stays inside the data area.** `curve()` and `poly()` are clipped to it, widened by
  `CLIP_PAD`. Do not remove the clip to make an overshoot visible; choose a range that holds the
  signal, or say in the caption that it leaves.
- **A figure belongs to the palette it is drawn in.** No figure code carries a page, plate or ink
  colour of its own: `PLOT.COL` holds them and `setTheme` swaps them. A figure built in JavaScript is
  produced per render (`fig` takes a function; a `raw` block may take one too). A figure generated once
  at load time keeps the palette it was born with.
- Continuous-time signals are curves, discrete-time signals are stems, impulses are arrows whose
  height is the weight. Negative frequencies are shown when they exist. Every quantitative axis is
  labelled. A multi-trace plot also carries a legend; an in-plot annotation may supplement but does
  not replace it.
- Signal traces use the semantic palette, never arbitrary series colours: input cyan, system amber,
  output green, intermediate violet and error red. Projector readability comes from adequate stroke,
  stem and marker weight, not from changing those meanings from one figure to the next.
- A caption says what the figure means, never where it came from.

On converted slides and laboratories, tick numbers, axis names and traces carry the larger back-row
floor. Normal teaching scenes keep the established plot geometry until their own slide conversion.
Increasing a label also increases the reserved name strips in `Axes`; changing one without the other
clips the label at the SVG edge. A figure that grows to fill a column must be re-swept by
`textclash.js`.

### The title motif — LOCKED

`.mtf-*` in `10_style.css`, `motifSignalSystem()` in `81_scenes_m0.js`. The figure draws itself once,
then one 7 s cycle sends a highlight along the route the information takes: trace, input wire, system,
output wire, spectrum. Nothing is displaced and nothing disappears, so the resting state is the
complete figure, which is also what prints and what reduced motion shows.

It is the one figure that does not follow the palette, on purpose. Its two signals sit on cathode-ray
screens, and a screen is dark on either page, so `SCR` and `PH` hold screen and phosphor colours of
their own: cyan `#4FBECE` on the scope for the input, green `#82C27B` on the analyser for the output.
A single green phosphor is what a real tube would have and is wrong here, because green already means
output. The screen furniture — graticule `#1E2A2E`, shadow mask `#060B0D`, edge `#25343A`, face
`#0A0F12` — is registered in `textclash.js` as guide and plate tokens. Nothing else may take these
colours.

### Contents rail

Three levels: chapter, section, scene, numbered as the lecture notes number them. A section heading is
also a control that opens and closes its scenes; the open one draws a rule down their left edge. The
textbook anchor is **not** in the rail: it pushed half the titles onto a second line.

## Do's and Don'ts

**Do**

- Put a figure on every slide that has a signal or a system in it.
- Cut a paragraph to one card of one or two sentences, and move what is lost to the lecture notes.
- Split a scene that holds two examples.
- Multiply every type size by `var(--ts)`.
- Route every text field a renderer accepts through `md()` (R8), a tab and a caption included.
- Re-run all the gates after any style change: a restyle changes the fit factor of every scene.

**Don't**

- Don't add a block type where a restyle of existing markup will do. A new type means putting every
  text field through `md()` and teaching `notes/src/render.js` the same type.
- Don't use a signal colour for decoration, or cyan and violet for a card.
- Don't add shadows, gradients, glass, emoji, or a second radius.
- Don't set `text-transform` or `letter-spacing` on a `.katex` subtree.
- Don't hard-code a page or ink colour in figure code or in a card.
- Don't let the artifact and the lecture notes drift further: a card added to `10_style.css` is owed
  to `notes/src/notes.css`.
- Don't write a sentence to sound impressive. The copy rules are in `.claude/rules/content-writing.md` (R1–R5).

## Reference

The approved mockup is kept locally, outside git, in `.claude/reference/slide-mockup-2026-09-21/`:
`override.css` (the full restyle, 161 lines), `mock.js` (the Playwright script that rendered it inside
the real artifact) and four screenshots. It is a throwaway: no gate was run on it.
