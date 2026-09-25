# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Third-year undergraduate electrical-engineering students, many reading English as a second language.
They meet the material twice: projected in a lecture, with the instructor talking over it, and alone,
before a paper. The instructor is the second user: he presents from the artifact in a 16:9 room and
needs each scene to work as a lecture slide.

## Product Purpose

A one-semester Signals and Systems course in four documents built from one set of sources: the
interactive artifact (531 scenes, 35 laboratories, 210 practice questions with worked solutions), the
lecture notes and their PDF, the student workbook, and the formula reference. It is published as a
static site behind a cover page.

The artifact is the lecture deck. The lecture notes carry the long explanation. A student who wants the
full argument reads the notes; a student in the room reads the slide and listens.

## Operating Context

- Lecture room, 16:9 projector, read from the back row. `Lecture mode` raises the type scale.
- Laptop, independent study, either theme, any window shape.
- Online, from the course site. Students open the course at its address and do not download it;
  only the PDF editions are offered as downloads (decided 2026-09-23).
- Print: four PDF editions made from the notes pipeline.

## Capabilities and Constraints

- One HTML file, served by the site. It makes no network request of its own; the one exception is
  the Python runtime, loaded from the course site when a reader presses **Run** in a code drawer.
  No analytics. Progress is stored on the device only.
- Fixed 1920×1080 stage, scaled to the window.
- Every number on a page is recomputed by a verification script; every label in every figure is swept
  for collisions. A design change that a gate cannot check is a change someone has to check by eye.
- The mathematics is fixed. A redesign never changes a formula, a number, a question setup, an address
  or a textbook anchor.
- Instructor material never reaches the published copy.

## Brand Commitments

The artifact is calm, rigorous and editorial. The interface makes a demanding technical course feel
navigable, and never competes with the mathematics. The artifact should read as the same publication
as `huguryildiz.github.io`.

The public cover page is the exception. It is dark and cinematic: one pinned frame in which Figure 1
builds as the reader scrolls, under a large serif title that changes with each step, and a row of
facts below it. It keeps its own inline styles and shares no stylesheet with the sibling course in
`~/Documents/GitHub/digital-communications`. `DESIGN.md`, "The public cover page", has the details.

The language is plain academic English. No promotional tone, no slogans, no sentence written to sound
impressive. `.claude/rules/content-writing.md` R1–R5 is the standard.

The course should also be fun to use. The look stays calm, but a slide should still invite the reader
to try something. A student who is tired of algebra should still find a reason to press a button. The
Engagement Rules below say how.

## Evidence on Hand

- The handwritten lecture notes and the course textbook in `source/` (not in git, never reproduced).
- Past examination papers in `source/exams` (never leave this machine; a question may keep a paper
  question's shape, never its numbers).
- No testimonials, usage figures or outcomes data exist. Do not invent any.

## Product Principles

1. A scene is a slide. It carries what the room needs to see while the instructor speaks: a figure, the
   equations, and short cards. The paragraph belongs in the lecture notes.
2. Show the whole learning path before explaining one point on it.
3. Use interaction to disclose relationships, not to hide required content.
4. Keep every figure sparse enough to read at lecture distance.
5. Difficulty belongs to the mathematics, never to the English or the layout carrying it.

## Engagement Rules

These seven rules apply to every module. Module 1 is the worked example; the mechanics are in
`DESIGN.md`, "Interaction on a slide".

1. **Intuition before algebra.** A student first sees, hears or guesses what a signal does. The
   calculation comes after that, not first.
2. **Predict first.** Where a card already asks a question, it offers two to four choices
   (`note.ask`). The student commits to an answer before the reveal step shows the working.
3. **Move it.** When a parameter changes what the figure shows (a shift, a scale factor, a decay
   rate), the figure gets a slider (`fig.live`). The default slider value draws the figure the slide
   had before.
4. **Hear it.** When the signal can be heard, the figure gets a play button (`fig.listen`). Good
   candidates are time scaling, reversal, frequency, envelopes, filtering and aliasing. The sound is
   computed from the same formula the figure draws.
5. **Connect it to everyday life.** One sentence ties the signal to something the student already
   knows: a voice message at double speed, a plucked string, a musical octave. The sentence goes in
   the caption.
6. **Close with a quick check.** Before its summary, each module has one slide of six short
   predictions. None needs a calculation on paper, and each shows a one-sentence reason after the
   answer.
7. **Keep the rigour.** Interaction never replaces a derivation. Every derivation is still shown in
   full, and the practice questions stay open-ended. A slide must keep a fit of at least 0.90 in
   lecture mode, or it loses the interaction.

## Accessibility & Inclusion

Keyboard access to every control. `Motion: reduced` and `prefers-reduced-motion` give a complete still
frame, never a missing one. Text contrast of at least 4.5:1 in both themes, tab labels included. Signal
colours are chosen as colour-blind-safe pairs and are never the only carrier of meaning: a curve is
also labelled.
