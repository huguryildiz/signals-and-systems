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
without the owner saying so. The slide language (the sections from *Rollout* to *A laboratory on a
slide*) is built in Module 1 and is locked with it; see *Module 1 is the reference* below.

### Module 1 is the reference — LOCKED 2026-09-23

The owner reviewed Module 1 as a whole on 2026-09-23 (fonts, cards, prediction cards, figures,
laboratories, code pages, practice questions) and locked it. Every other module is converted to
match it from this file and `.claude/rules/`, with no design decision of its own. Where a module
needs something Module 1 does not show, stop and ask; where this file and Module 1 disagree, Module 1
is the evidence and this file is corrected. The reference scene for each element is named where the
element is described.

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

- One slide, one figure, two to four tabbed cards. See "A slide" under Layout.
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

The lecture notes open on a full-bleed navy cover (block type `cover` in `notes/src/render.js`),
with the table of contents on page 2. The cover art is vector, drawn from the functions it shows:
a sinc pulse in teal, its samples as coral stems whose dots lie on the curve, and a damped cosine
in amber behind them. Chromium scales a page whose margins differ from the rest, so
`notes/topdf.js` prints the cover alone with no margins and no footer, prints the body from page 2
with its original page numbers, and joins the two with `pdfunite`.

### The public cover page

Redesigned on 2026-09-23. The cover no longer shares `site.css` with the sibling course
(`~/Documents/GitHub/digital-communications`); the two cover pages are now separate designs. It uses
the artifact's own tokens (the ivory and navy surfaces, the ink ramp, coral and slate above) so the
cover and the course read as one publication. The styles are inline in `web/index.html`, with no web
font and no stylesheet request.

The page is one stage and a footer. The stage holds the bar, a centred title with a 120 px coral rule
under it, the byline, the lead, one primary action (`Open the course`), and three download cards: the
lecture notes, the student workbook and the formula reference, all PDFs. The course itself is opened
on the site and is not offered as a download (since 2026-09-23). The instructor edition is never
linked. Each card carries a photograph of the
document, its title, one sentence, and a footer with the format, page count, file size and a
`Download` action. There is no eyebrow, no gradient text, no glass and no numbered sequence.

The photographs in `web/img/` were generated with Codex (`gpt-6-sol`, reasoning effort medium)
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
context, the linked program and the viewport instead, and checks that the three photographs load.

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
| card body | 21.5 px / 1.52 | slide cards (`.scene.slide .note`) |
| label / tab | 13.5 px mono, `.12em`, 600 | card and equation tabs |
| equation | 19 px, KaTeX at 1.30 em, in every scene, laboratory and display mode; no `lg` or `sm` size | scales with `--ts`; see Equation |
| explanation below a slide equation | 21.5 px / 1.52 | matches the information-card body; legacy equations retain 15 px |
| figure caption | 18 px / 1.45 on converted slides and converted-module laboratories | legacy scenes remain 14 px |

**Every size is written `calc(Npx * var(--ts))`.** `--ts` is 1 in normal display and 1.36 in lecture
mode (`body[data-display=projector]`). A size written as a bare pixel value does not grow in the
lecture room, which is the one place it has to. The mockup hard-coded its sizes; the build must not.

**Every scene title reads at one size.** The eyebrow and the scene title (`h1.display`, `h2.title`)
keep their table sizes on every scene, including a dense scene that `fitScene()` scales down. The fit
sets `--hk` = 1/k on the column, and the eyebrow, the titles and the title rule multiply their sizes
by `var(--hk,1)`, so the transform takes back exactly what `--hk` added. A new size on the eyebrow or
a title, including a lecture-mode override, carries the same factor. Nothing else in the column is
exempt from the fit.

**Laboratory type floor.** When a laboratory is authored or restyled, control and result labels are
at least 16 px, segmented choices at least 17 px, live and result values at least 20 px, and
explanatory prose at least 19 px at `--ts:1`. These are source sizes, all multiplied by `var(--ts)`;
inline pixel sizes do not qualify. Inspect populated, long-text states in both themes and display
modes at 1920×1080. In lecture mode the scene must keep a fit factor of at least 0.90 with no
clipping. Reflow controls or results, or split the laboratory, before reducing type. A common
font-size override is not a substitute for checking each laboratory's fit.

**A label frame does not rewrite the mathematics it carries (R8).** The label classes are uppercase
with wide tracking, and both are inherited: `text-transform` turns `a_k` into `A_K` and
`letter-spacing` pulls an expression apart. One global rule in `10_style.css`,
`.katex{text-transform:none; letter-spacing:normal}`, resets both for every label class at once.
Do not remove it, and do not set either property on a `.katex` subtree.

## Layout

### The stage — LOCKED

- **One file, opened from the site.** No analytics, and no network request of its own. The one
  exception, opened by the owner on 2026-09-23 when the course moved to site-only use: the Python
  runtime for a code drawer's **Run** button, loaded from the course site on the first press. The
  instructor keeps `dist/Signals_and_Systems.html` as an offline copy; there **Run** is not offered.
- **Fixed 1920×1080 stage**, scaled to fit the window and centred. A window that is not 16:9 shows
  bands in the page colour above and below. This is accepted: the lecture room is 16:9.
  The one exception is a practice-question page (below, *Practice questions*): there the stage
  keeps the window's width scale, grows downward to the window's foot and sits at the top.
- Scene padding `54px 104px 74px`; the content box under the padding is 952 px tall.
- `fitScene()` scales an oversized scene down to a floor of 0.82 (0.70 in lecture mode). It is a
  safety net, not a licence to overfill: a scene that needs below about 0.90 is split instead. On the
  floor, what is left is taken from the figures in proportion to their height, and a scene that gives
  up more than 3% of its figure height marks itself `data-capped`. `qa.js` names both under `dense`.
  Reaching that rescue is the signal to split the scene.
  Module 1 keeps three approved slides on the floor, `m1-power`, `m1-avgpower` and `m1-evenodd-b`
  (locked 2026-09-23). They are not a precedent: a converted slide in another module that reaches
  the floor is split.
- **Radial and orbital compositions** are reserved for course maps and synthesis scenes.

### Rollout: a scene opts in — DECIDED 2026-09-21

Everything in the slide language is scoped to scenes that carry `slide:true`. The renderer puts the
class `slide` on the scene host and every new rule is written under `.scene.slide`. An unconverted
scene keeps today's look and today's fit factor, so the gates stay green and the site stays
publishable after every commit. The card type is 21.5 px against 17.5 px; applied to all 234 scenes
at once it would push many of them under the 0.90 fit line before their text is cut. When the last
module is converted, one final change removes the flag and edits the base rules. Until then the new
rules out-specify the old ones and do not replace them.

### Filling the stage — built in Module 1

A sparse scene would sit at the top of the stage with a third of it empty, because a plain fit only
scales down. Two parts fix this:

1. Every teaching slide's `cols` block carries `fill:true`. Its columns stretch to the full height of
   the content box and distribute their children over it (`justify-content:space-between`), so the air
   is shared between the cards and not left under them.
2. The figure takes the slack. A `fig` with `grow:true` is grown by `growFigures()` (called from
   `fitScene()` in `90_app.js`) into the room that is left, up to a cap, only at k = 1 on a slide
   scene; `data-capped` marks the opposite case.

### A slide

Title, then a full-width hairline under it with a 150 px coral segment, 2 px, at its left end. Then two
columns in the ratio 5:7, written `{t:'cols', ratio:'c-5-7', fill:true, left:[…], right:[…]}`: the
figure (with `frame:true, grow:true`) and its caption on the left, the given data, the method, the steps
and the result on the right. Every Module 1 teaching slide uses this split. The gallery keeps `c-8-4` for its
2×2 grid, and the navy opening keeps `c-6-6`. Reveal steps stay; a slide builds in the order the instructor speaks.

**Figure and card budget.** A teaching slide carries exactly one figure and two to four tabbed
cards. A tabbed card is every `note` (the prediction card included) and every `eq` with a `label`;
an unlabelled `eq` is free. The figure is required. A slide outside the budget states its reason in a
`budget:'...'` field on its scene; Module 1 has eight such slides, with two figures or five cards,
and each names why (`m1-power`, `m1-avgpower` and others). More than that means the slide holds more
than one idea and is split. Laboratories, galleries, code pages and navy scenes keep their own layout
and are outside this budget. `build/slidebudget.js` counts figures and tabbed cards on every
`slide:true` scene and lists the slides outside the budget; Module 1 has none. It is advisory until
every module complies, then runs with `--strict`.

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

### Information card — built in Module 1

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

**No two cards on a slide share a colour.** A slide holds at most four cards, and each takes its own
colour. A card keeps its kind's colour while that colour is still free on the slide; a repeat takes the
first free tone in the order slate, plum (`#8B3A62`, dark `#D98CB3`), graphite (`#5E5850`, dark
`#C4BDB2`), then amber and coral for a fifth card. Green and red are never handed out this way, because they mean a solution and an error. A
labelled equation has a tab like a card, so it counts as one: the first keeps coral, and a second
equation or a prediction card on the same slide takes a neutral tone. The kind,
its icon and its meaning do not change; only the colour does. `draw()` in `build/src/90_app.js` applies
this through `toneCards()`, which sets `data-tone` on the repeat, so scene data never names a colour.
A quick-check grid of six cards keeps its own form and is outside the rule.

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

Every equation block sets its mathematics at one size: 19 px with KaTeX at 1.30 em. A block does not
choose a larger or smaller size; `size:'lg'` and `size:'sm'` on a block have no effect. An equation
wider than its column is the one exception: `fitScene()` in `90_app.js` sets it smaller until it fits,
down to 0.75 em, so it never runs into the figure beside it. A formula that reaches that floor is too
long for its column and belongs split over two lines.

### Worked example

Given, Find, Method, Solution, Check (R7). On a slide these are cards, not the rows of a `wex` ladder:
`Given` and the `Find` line share one card with a hairline between them, each step is a labelled
equation, `Solution` is a green card, and `Check` or `Common error` closes the column. The `wex` block
stays for the property tables, where a row is one `\leftrightarrow` correspondence; its key column is
136 px, which holds `DIFFERENTIATION` in tracked mono without a mid-word break.

### Inside a card — one example each in Module 1

Seven forms that give a card or an equation a different shape for a different job. None is a block
of its own: each is a class inside a card's `html`, a TeX construct, or a flag on an `eq` block, so
the slide budget counts it as the card it sits in and `md()` still reads every text field. Styles are
at the end of `build/src/10_style.css`, scoped to `.scene.slide`.

| Form | Markup | Use it for | Module 1 example |
| --- | --- | --- | --- |
| Annotated equation | `\underbrace{…}_{\text{name}}` in the TeX | naming the parts of one formula; at most two braces a line. A derivation line that writes a symbol in its expanded form (such as $C$ as $|C|e^{j\theta}$) puts a brace under the expansion, labelled with that symbol, instead of stating the substitution in a separate card | `m1-ct-cexp-c`: envelope and rotation; `m1-dt-cexp-c`: $C$ and $\alpha$ |
| Comparison panel | `<div class="cmp"><div><span class="cmp-h">A</span>…</div><div>…</div></div>` | two cases read side by side, above all continuous against discrete time; one or two sentences a side | `m1-dt-period`: CT and DT periodicity |
| Property chips | `<span class="chips"><span class="chip yes">…</span><span class="chip no">…</span></span>` | a verdict on named properties, after the sentence that proves it; the check or cross carries the verdict, never colour alone | `m1-ex-energy`: energy signal, not power signal |
| Step strip | `<ol class="steps"><li>…</li></ol>` | a procedure of two to four moves, one line a move, in a `Method` card | `m1-combined-b`: map the corners of $x(3t-5)$ |
| Key result | `eq` with `result:true` and a label that begins `Key result ·` | the one result a module carries forward; at most one a slide, and only on the slide that states it | `m1-ct-impulse-c`: sifting |
| Margin note | `eq` with `side:true` and a `note` | the reason for a short equation, set beside it in serif italic; the equation must fit half the column | `m1-dt-impulse-b`: the first difference |
| Value chip | `<span class="val"><b>$…$</b><small>what it is</small></span>` | a single number the slide ends on, with its name | `m1-dt-period-b`: $N_0=10$ |

The key result's coral frame is 1 px all round, so it stays inside the stroke rule under **Shapes**.
Colours come from existing tokens: the chips take the `ok` and `err` card colours, the rest coral and
the rule tones. A **sticky note** (tilted, shadowed, paper yellow) was considered and rejected: it
breaks the flat surface, the single radius, and the no-shadow rule, and flattened it is the `warn`
card. The lecture notes do not render these scenes, so `notes/src/notes.css` owes the forms only when
the notes use them.

### Interaction on a slide — built in Module 1

Three additions to existing blocks. None is a block of its own, so the slide budget still counts one
figure and two or three cards. Each is rendered in `build/src/90_app.js` and styled at the end of
`build/src/10_style.css`; every text field goes through `md()`.

- **A prediction in a card (`note.ask`).** A card that already asks a question can carry
  `ask:{key, q?, choices, answer, why?}`. The choices are buttons under the card text. The first click
  marks the right choice green with a check and a wrong pick red with a cross and a strike, so colour
  is never the only signal. `why` is optional. When it is given, its line is laid out from the start
  and made visible on the answer, so nothing on the slide moves. On a worked example whose reveal
  steps give the solution, leave `why` out: it costs a line that the slide does not have in lecture
  mode. Answers last for the session and are not stored.
  Every teaching slide carries one such card with the head **Given** (exceptions in
  `.claude/rules/content-writing.md`): the given line, a
  `.nsep` rule, the question, then the choices. The content rule is in
  `.claude/rules/content-writing.md`. A prediction card has its own form (`.note.ask`): a coral
  edge and tab with a question-mark icon, a dashed frame, the question after the rule in the
  lede's serif italic (`.ask-prompt`), and each choice led by a mono letter in a ring (A, B, C, D).
  On the answer the letter gives way to the check or the cross in the same width; the other
  choices dim with their letters.
  **The ringed letter is the one form for a lettered choice anywhere in the artifact** (since
  2026-09-23): a `note.ask` choice, a laboratory's classification buttons (Laboratory 1.2's
  energy/power/neither), and any later quiz or drill option. The letter is mono, coral, in a circle
  with a 55 % coral ring, sized in `em` so it follows the button text; on hover the ring fills coral
  and the letter turns to paper. A square letter box or a slate letter is not used. A laboratory may
  keep its own answer colours (green or red on the letter and the frame) after the click.
- **Sliders under a figure (`fig.live`).** `live:{controls:[{k, label, min, max, step, v, show?}]}`.
  `svg` then takes the current values, `svg:v=>…`, and falls back to the default when `v` is absent.
  A slider redraws the figure at its current, possibly grown, height. The default value is the figure
  the slide showed before it had a slider, and it is the state the gates sweep. A slider is only for
  a continuous parameter the reader explores ($t_0$, $a$, $r$).
- **A figure played in frames (`fig.frames`).** `frames:{labels:[…], ms?}`. A figure that builds or
  takes apart a result in a sequence of moves (impulses adding up to a step, pairs cancelling, a
  sample picked out) uses *Previous* and *Next*, never a slider. Each press plays the change as an
  animation: `svg:v=>…` receives `v.frame`, which runs continuously from the old index to the new
  one (about 0.9 s, eased), so the figure must be written for a fractional frame. Reduced motion
  jumps straight to the new frame. Frame 0 is the printed figure. `m1-dt-step` and
  `m1-dt-impulse-b` are the reference.
  The control bar is the same on every such figure and is drawn by the renderer; no scene styles
  its own. *Previous* and *Next* sit side by side, so they do not move as the label changes, and
  each is disabled at its end. A thin rule separates them from the counter. The counter is set in
  the mono of the eyebrow with tabular figures and two digits, `01 / 03`: the current frame in coral
  and semibold, the total muted. Beside it one short bar per frame, coral up to the current frame and
  rule-grey after it, then the frame's label in body type, which is TeX where it names a signal
  (`$x[n]\,\delta[n-2]$`). Labels name what the frame shows, never "step 2".
- **Sound under a figure (`fig.listen`).** `listen:{items:[{label, sound:v=>({f, dur})}]}`. `f` is
  the signal as a function of seconds, from the same formula the figure draws. The renderer samples
  it with Web Audio, sets one peak level, adds a 6 ms fade at each end and plays it once. A second
  press stops it; changing scene stops it. Nothing is fetched.

- **A sketch on a figure (`fig.sketch`) — built on `m1-combined-b`.**
  `sketch:{label?}`. The reader draws on the axes with the pointer, then presses *Show the answer*.
  The figure's `svg` marks its data area with an invisible `<rect class="sk-area">` and wraps the
  answer in `<g class="sk-key">`; the answer stays in the markup and is only made transparent, so
  the gates and print see the complete figure. The reader's ink is coral, drawn under the answer so
  the two can be compared, and kept for the session as fractions of the data area, so a grown or
  redrawn figure keeps it. *Clear* removes it. Print hides the ink and shows the answer.

Sliders, sound and sketch buttons share one row under the figure (`.fxbar`); the everyday link goes in the
caption, one sentence. Control labels are at least 17 px, values 20 px, all times `--ts`. A focused
button on the slide keeps its own Space key; the arrow keys still change the scene. Print and PDF
hide the controls and keep the default figure.

A **quick-check slide** closes a module before its summary: six `note.ask` cards in a 3×2 grid,
each answerable in a few seconds. It carries `budget:` because it has no figure. The module's
practice questions stay open-ended.

A **module summary is a recall deck** (built in Modules 1–3). Each result the
module carries forward is one card: the front is a short question in the lede's serif italic, the back
is the answer in card body type, one or two sentences. The student answers first, then clicks the card
to check. The scene calls it through a raw block, `{t:'raw', html:()=>RECALL.deck(id, cards, {cols})}`
with `cards = [{q, a, tag?, glyph?}]`, so the block schema does not change; `q`, `a` and `tag` go
through `md()`.

- Both faces share one grid cell, so a card is as tall as its longer face and opening it moves
  nothing. The open card takes a coral left edge and a coral number; the flip is a short `rotateX`
  that `data-motion=reduced` and `prefers-reduced-motion` turn off.
- A bar above the deck counts `Recalled k of N` and holds one `Show all / Hide all` button. Opened
  cards last for the session, so a reveal step does not close them; nothing is stored.
- The answer must stand without its question: when the front is only a name (a property, a step),
  the answer opens with that name in bold, `<b>Causal.</b> …`.
- `glyph` is an optional inline SVG sketch, about 92×44 in viewBox units, drawn in the dark-page
  signal tints because summary pages are navy. It is the picture to remember, not a figure: no axes,
  no labels, and the signal colour semantics still hold. Use it on every card of a deck or on none.
- `tag` is a short mono label that sorts the cards (for example `Limit` and `LTI`). `cols:2` suits
  short answers; long answers take one column.
- The deck replaces the summary's list of results in the left column. The reflection or the preview
  of the next module stays in the right column, and the method note stays a reveal step under the
  deck.

### Code pages — built in Module 1, a rule for every section

Each teaching section closes with a code page, after its laboratory: gallery, laboratory, code. The
page is a scene with the id shape `*-code-*`, which takes the address `<section>.C` (1.3.C). It pages
through the section's programs one at a time, as the practice questions do: numbered program tabs
across the top, the code on the left, and on the right what the program does, a **Try it** card
(`warn`) with a change to predict before running, and the output. It carries `budget:` because the
program draws its own figure. The scene calls it through a raw block,
`{t:'raw', html:()=>CODEBANK.page('<scene id>')}`, so the block schema does not change.

- **Where the code lives.** `build/src/7?_code_m<N>.js`: `CODE_M<N>`, one entry a program keyed by a
  short name (`ops-shift`), and `CODE_BANKS_M<N>`, the list of programs on each code page. An entry is
  `{title, what, try, out, m, py}`; `title`, `what` and `try` go through `md()`, the code is plain text.
- **What a program is.** It draws a signal from the section and prints the number the section
  computes, with the same `fprintf` / `print` wording in both languages, so `out` is one text for
  both. 10 to 21 lines, the section's variable names, English comments. MATLAB uses no toolbox; Python
  uses NumPy and Matplotlib only, with mathtext axis labels. No MATLAB transpose (`'`), so the
  highlighter can read an apostrophe as a string.
- **Figures do not link to it.** A figure carries no Code button; the code page is reached as the
  last scene of its section, from the contents rail or the arrow keys.
- **Run (Python).** When the course is opened from its site, the Python tab is editable and has
  **Run** and **Reset**. Run loads Pyodide 0.29.3 (CPython compiled to WebAssembly, with NumPy and
  Matplotlib) from `pyodide/` on the site at the first press: about 18 MB and about 5 s on a fast
  connection, then about 0.1 s a run. The output box shows what the program prints, the traceback
  from the reader's own code, and each figure it draws; it keeps its height, so a run moves nothing.
  Edits and the last output last for the session. Opened as a file (`file://`) the page offers Copy
  and the expected output only, and makes no request. MATLAB has no Run: it does not run in a
  browser. `web/pyodide.js`, run by the site build, fetches the runtime (5 core files and the 12
  packages NumPy and Matplotlib need, 24 MB) from the Pyodide release on jsDelivr into
  `site/pyodide/v0.29.3/`, checks each file against a pinned SHA-256, and caches it in `web/.cache/`.
  The site serves it with a one-year immutable cache header, so a student downloads it once.
- **Look.** Highlighting uses the ink ramp, slate for keywords and terracotta for strings; the signal
  colours keep their figure meanings. Code type grows less than prose in projector mode
  (`--code-fs`), so a 21-line program fits the stage at k = 1. The chosen language is kept on the
  device.
- **Check.** `verify/code_check.py` runs every entry in MATLAB (`-batch`) and in Python and compares
  what each prints with `out`. It needs a Python with Matplotlib (here `/usr/bin/python3`).
- **Built in Module 1.** Five code pages, 17 programs: 1.2.C `m1-code-energy`, 1.3.C
  `m1-code-ops` (the reference), 1.4.C `m1-code-periodic`, 1.5.C `m1-code-impulse`, 1.6.C
  `m1-code-cexp`.

### Title icons

A scene that is not a teaching slide carries a drawn icon at the left of its title, so its kind reads
at a glance. The icon is a coral stroke (24-unit grid, 1.7 stroke) in a square of 1.04 em with a 1.5 px
coral border, the one 3 px radius and a 7 % coral tint. It is chosen from the scene id in
`TITLE_ICONS` (`build/src/90_app.js`): `-lab-` a flask, `-code-` the `</>` brackets, `-real-` and
`m0-examples` a globe, `-drill` a pencil, `-quick` a bolt. Teaching slides, openings and summaries
have none. The icon is `aria-hidden`; the title carries the meaning.

### Heading icons

Every small mono heading that labels a block inside a panel carries a drawn icon at its left, in
place of the tick, so the reader finds each part of a brief at a glance. The icon is a coral stroke
(24-unit grid, 1.8 stroke) at 1.4 em, drawn as a CSS mask on `.hi::before` so it needs no markup of its
own. A heading takes it with two classes, `hi` and the role: `hi-aim` a target, `hi-practise` a
checklist, `hi-steps` a stair, `hi-look` an eye, `hi-reflect` a speech card, `hi-next` an arrow. A new
role adds one `.hi-*` rule to `build/src/10_style.css`; it does not reuse an icon that already means
something else. The scene eyebrow at the top of a slide keeps its tick and takes no icon.

### A laboratory on a slide — built for Laboratories 1.2–1.6

A laboratory scene carries `slide:true` like any other slide, and its text follows the card language
rather than the plain stack it had before. The rule applies to Module 1 now; the laboratories of Modules 2–7 keep
their current look until their module is converted.

- Every derivation, verdict and note that the laboratory draws is a card. A computed equation takes
  a coral tab that names what it computes (`Period condition`, `Fundamental period`, `Energy`,
  `Power`); a note keeps its kind's tab and icon (`ok` for a result, `warn` for a trap or a
  counterexample). The equation that restates the current signal at the top of a column stays
  untabbed: it is a readout, not a step.
- The laboratory builds these cards inside its own containers (`.derive`, `.aper`, `.work`), and the
  tab room applies there as it does in a column. The control panel has no tab, so a laboratory
  column starts at the top edge.
- Type is the Laboratory 1.3 scale: control labels, readout keys and tabs 16 px, control values 20 px,
  readout values 21 px, card text 19 px, the signal equation at the top 22 px, all times `--ts`.
  Plot text grows by narrowing the viewBox, not by a font override.
- The laboratory must fit at k = 1 in normal display. When the tabs push it over, shorten it before
  accepting a scale-down: pair two sliders in one row, drop the doubled flow gap inside a stack, move
  a verdict under the figure where the column has spare height, or lower a stacked plot's viewBox
  height. A laboratory that grows after an answer or a reveal calls `RENDER.fit()` so that state is
  refitted too.
- The lecture-mode floor of 0.90 is the target for every new laboratory. Module 1's laboratories
  were locked below it on 2026-09-23 (lecture mode, 1920×1080: A 0.85, C 0.80, K 0.70, L 0.84; B
  fits), and `m1-lab-c` also scales to 0.95 in normal display. That is recorded debt, not the
  pattern: a new laboratory is reflowed until it meets the floor.

### Practice questions

A module's practice questions show one question at a time under a pager. The page scrolls; it is
never scaled.

- **The page reaches the foot of the window.** On a window taller than 16:9, `APP.fit()` sets the
  stage height to the window height divided by the width scale and places the stage at the top, so
  no band is left under the question. The scene's bottom padding drops to 20 px, because the footer
  strip is outside the stage. `fitScene()` calls `APP.fit()` first, so leaving the page restores the
  1080 px, centred stage.
- **The counter is a pill.** `Question 13 of 30` sits in a rounded pill (`.dr-count`): mono 16 px,
  muted, on `--paper-2` with a `--rule-strong` border. The current number (`.dr-n`) is coral,
  semibold and 1.2 em. The note on opened solutions (`.dr-seen`) is 16 px. All sizes are times `--ts`.
- **The current number is a field.** `.dr-n` is a number input (`data-drill-go`), not static text:
  the reader types a question number and Enter, or leaving the field, jumps there. A number out of
  range is clamped to the first or last question; anything else restores the current number. The
  field keeps the coral numeral, sits on `--paper` with a `--rule-strong` border and 6 px corners,
  shows no spinner, and takes a coral border and ring on hover and focus. Slide keys stay out of it.
  Every module's pager gets it from the one `drill` block in `90_app.js`; never add a per-module one.
- **The question's code is a coral pill.** `D1-13` above the statement (`.drill .qid`) is mono
  15 px semibold, coral, on a 12 % coral fill with a 45 % coral border, as wide as its text.
- **Every question sits on a card.** The question (`.dr-page .quiz.drill`) is one raised panel,
  the same as `.card`: `--paper-2` fill, `--rule` border, `--radius` corners, 24/28/26 px padding,
  full width of the pager. Statement, figure, parts, button and worked solution all stay inside it.
  A practice question is never laid out as bare text on the page background.
- **The worked solution is a column of information cards.** `solCards()` in `90_app.js` splits
  `sol` at its `<b>Given.</b>`, `Find`, `Method`, `Solution — …`, `Check` heads and draws each as
  the slide card (`.dr-sol`, same rules as `.scene.slide .note`): Given with Find under a hairline
  (slate), Method (slate), one green card per `Solution` head with `figSol` in the last, Check
  (slate), and `err` as a red `Common error` card. Question data is unchanged. The one-colour-a-slide
  rule does not apply here.

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
- **Legend type.** A legend is set at 19 px (21 px in projector mode), a step above the 18 px slide
  caption, so the TeX in each entry reads at the size of the caption beside it. The swatch is 26 px.
  Size is set once on `.legend` in `10_style.css`; no scene sets its own legend size. On the light
  page the swatch carries the signal colour and the label is set in graphite. Where a cyan and a green
  curve of the same family run close together and differ only in colour, the cyan one is dashed (`dash:'9 6'`) and its legend item takes a third entry,
  `true`, which draws a dashed swatch.
- **Legend placement.** A legend sits inside the plot it keys, as a small card (paper fill, rule
  border) in a corner of the data area that the traces and annotations leave free. A scene writes it
  as a `legend` block right after its `fig`; the renderer draws it inside that figure. `at` picks the
  corner: `'tr'` (default), `'tl'`, or `'tl-axis'` for a plot whose vertical axis is its left edge
  (`m1-ct-cexp-grow`). A laboratory panel wraps each plot and its legend in
  `.plot-wrap`, where the card lies in one row in the strip above the data area. No legend sits
  below or beside a plot, and no card may cover a trace, tick label or annotation in either display
  mode; move the card or widen the axis range instead. In the dark theme the card fill is a light
  step above the figure card (`--paper-2` mixed with 10% white) with a `--rule-strong` border, so the
  card reads as raised; it is never darker than the plot behind it. Both theme fills are set once on
  `.legend.in-plot` in `10_style.css`; no scene colours its own legend card.
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

### Module openings are animated

Every module opening scene (`mN-open`) animates its signals. A continuous-time trace draws itself in
(`.mtf-trace`) and a highlight then sweeps it on the 7 s cycle (`.mtf-sparkwrap`, `.mtf-beam`,
`.mtf-beam-tail`). Discrete-time stems rise in turn (`.mtf-stem`, `--i` = index) and a pop runs along
their tips (`.mtf-stem-dot`). Reuse these classes; do not add a second motion system. The usual way
in is `opts.anim` on `curve()` (`{delay, sweep}`, where `sweep` is the highlight colour) and on
`stem()` (`{delay, step, tip}`); it draws with `pathLength="1"`, `.mtf-sweep` and `.mtf-tip`. A
dashed curve is not animated, because the draw-in replaces its dash pattern. `m1-open` builds its
trace with `a.raw()` instead; either is allowed. An opening with no signal figure (`m2-open`) fades
its items in turn with `.mtf-fade`.

The rules of the title motif hold here too: nothing is displaced and nothing disappears, so the
resting state is the complete figure, which is what prints and what reduced motion shows. The print
and reduced-motion overrides for `.mtf-*` already cover it. An opening figure is drawn on a narrower
canvas than its column (`w:520`) so its labels read at back-row size on the navy page.

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
