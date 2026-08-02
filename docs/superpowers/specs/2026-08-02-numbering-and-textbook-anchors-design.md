# A numbered contents, and a textbook anchor on every entry

Design settled 2026-08-02. This document is both the design record and the
authoring contract: every scene is tagged against it, so a number assigned by one
hand is indistinguishable from a number assigned by another.

---

## 1. What this adds

Two things, and they are independent of each other.

**A number.** The contents rail is a flat list of scene titles under a module
badge. It becomes a three-level hierarchy: chapter, section, scene. Every entry
carries its address, and the addresses run in order with no gaps and no
duplicates.

**A textbook anchor.** Every entry also carries a reference to the place in the
course textbook where the same material is developed. A student who wants the
long treatment of a topic reads the anchor and goes straight to it.

The two are separate fields and they are rendered differently, because they
answer different questions. The number says *where this sits in the course*. The
anchor says *where to read more*.

Nothing is reordered. No scene is split. No scene is rewritten.

## 2. What was rejected, and why

**Rebuilding the contents on the textbook's chapters.** Considered and dropped.
The textbook's organisation is its own editorial contribution, and presenting it
as this course's skeleton is the thing §7.4 of the operating instructions bars.
It also fails on its own terms: the course teaches the impulse before the complex
exponential, and the textbook does the reverse, so a contents rail built on the
textbook's numbers would have to either read out of order or force the teaching
sequence to change.

**Reordering the scenes to match the textbook.** Considered and dropped. Three
modules would move, and Module 4 would need scenes split, because a single scene
there develops the continuous-time and discrete-time property lists together
while the textbook separates them. That is a content project, not a navigation
change, and the teaching order is the lecture notes' own — it is not an error to
be corrected.

Citing the textbook by section is ordinary academic practice and is not
reproduction. That is what this design does.

## 3. The numbering

### 3.1 Chapters

The lecture notes already number their chapters 1 to 7, and those numbers map to
the modules exactly. The artifact adopts the same numbers, so the two
deliverables address the same material the same way.

| Chapter | Title | Module |
| --- | --- | --- |
| 0 | Why signals and systems? | M0 |
| 1 | Signals | M1 |
| 2 | Systems and their properties | M2 |
| 3 | Linear time-invariant systems | M3 |
| 4 | Fourier series | M4 |
| 5 | The continuous-time Fourier transform | M5 |
| 6 | The discrete-time Fourier transform | M6 |
| 7 | Sampling and aliasing | M7 |

`CONTENT.MODULES` gains a `ch` field carrying this number. The module id stays:
the breadcrumb, the search index, the drill filter and the progress record are
all keyed on it, and none of them change.

### 3.2 Sections

Each chapter is divided into named sections. A section is a run of consecutive
scenes that develop one idea. The opening scene of a module is section `.0`; the
closing synthesis scene, where one exists, is the last numbered section.

The skeleton below is the authoring contract. Section titles are written for this
course and are not taken from any other book.

**Chapter 0 — Why signals and systems?** Has no sections; §3.3 says how its
scenes are numbered.

**Chapter 1 — Signals**

| | Section | Scenes |
| --- | --- | --- |
| 1.0 | Opening | `m1-open` |
| 1.1 | Definitions and notation | `m1-def` |
| 1.2 | Energy and power | `m1-power` … `m1-ex-energy` |
| 1.3 | Transformations of the independent variable | `m1-shift`, `m1-reverse-scale`, `m1-combined` |
| 1.4 | Periodicity, even and odd | `m1-periodic`, `m1-evenodd` |
| 1.5 | The impulse and the step | `m1-dt-impulse`, `m1-dt-sift`, `m1-ct-impulse` |
| 1.6 | Complex exponentials | `m1-ct-cexp` … `m1-dt-period` |
| 1.7 | Summary | `m1-synth` |

**Chapter 2 — Systems and their properties**

| | Section | Scenes |
| --- | --- | --- |
| 2.0 | Opening | `m2-open` |
| 2.1 | The input–output abstraction | `m2-abstraction` |
| 2.2 | The six properties | `m2-memory` … `m2-linear` |
| 2.3 | Classification in practice | `m2-workflow` |
| 2.4 | Summary | `m2-synth` |

**Chapter 3 — Linear time-invariant systems**

| | Section | Scenes |
| --- | --- | --- |
| 3.0 | Opening | `m3-open` |
| 3.1 | Impulse response and the representation property | `m3-impulse`, `m3-representation` |
| 3.2 | The convolution sum | `m3-convsum` … `m3-ex-dt2` |
| 3.3 | The convolution integral | `m3-convint` … `m3-ex-ct2` |
| 3.4 | Properties of convolution | `m3-props`, `m3-lti-props` |
| 3.5 | Summary | `m3-synth` |

**Chapter 4 — Fourier series**

| | Section | Scenes |
| --- | --- | --- |
| 4.0 | Opening | `m4-open` |
| 4.1 | The eigenfunction property | `m4-eigen-ct` … `m4-eigen-ex` |
| 4.2 | Synthesis and analysis | `m4-fs-exist` … `m4-dc` |
| 4.3 | Series worked out | `m4-rect` … `m4-imptrain` |
| 4.4 | The discrete-time series | `m4-dtfs` … `m4-dt-saw` |
| 4.5 | Properties | `m4-props-1` … `m4-parseval` |
| 4.6 | A periodic input through an LTI system | `m4-lti` … `m4-dt-filt-b` |

**Chapter 5 — The continuous-time Fourier transform**

| | Section | Scenes |
| --- | --- | --- |
| 5.0 | Opening | `m5-open` |
| 5.1 | From series to transform | `m5-derive-1` … `m5-limit` |
| 5.2 | The standard pairs | `m5-ex-delta` … `m5-bandlimit` |
| 5.3 | Periodic signals | `m5-periodic` … `m5-ex-imptrain` |
| 5.4 | Properties | `m5-props-1` … `m5-parseval-ex` |
| 5.5 | Convolution and multiplication | `m5-conv` … `m5-sinc2` |
| 5.6 | Property summary | `m5-tables` |
| 5.7 | Systems from a differential equation | `m5-diffeq` … `m5-diffeq-b2` |

**Chapter 6 — The discrete-time Fourier transform**

| | Section | Scenes |
| --- | --- | --- |
| 6.0 | Opening | `m6-open` |
| 6.1 | Building the transform | `m6-derive` … `m6-periodic` |
| 6.2 | The standard pairs | `m6-ex-shift` … `m6-ex-lpf` |
| 6.3 | Periodic sequences | `m6-cexp` … `m6-ex-cos-b` |
| 6.4 | Properties | `m6-props-1` … `m6-parseval` |
| 6.5 | Convolution and multiplication | `m6-conv` … `m6-mult-ex` |
| 6.6 | Property summary and duality | `m6-tables`, `m6-duality` |
| 6.7 | Difference equations | `m6-freqresp` … `m6-ex-diff-b` |

**Chapter 7 — Sampling and aliasing**

| | Section | Scenes |
| --- | --- | --- |
| 7.0 | Opening | `m7-open` |
| 7.1 | The sampler and the sampled spectrum | `m7-sampler` … `m7-three` |
| 7.2 | Aliasing and the sampling theorem | `m7-aliasing` … `m7-ex-73c` |
| 7.3 | Reconstruction | `m7-recon` … `m7-perfect` |
| 7.4 | Aliasing in practice | `m7-alias-cos` … `m7-spatial` |

### 3.3 Scenes

Within a section, scenes are numbered in the order they already appear:
`1.2.1`, `1.2.2`, and so on. A section holding a single scene still numbers it,
so a module opening is `1.0.1` and a synthesis is `1.7.1`. Every teaching scene
in chapters 1 to 7 has a three-part address, with no exceptions.

Chapter 0 is the one chapter with no section level: its scenes are `0.1` to
`0.5`, two parts rather than three, and the title scene that opens the artifact
carries no number at all. The chapter is five scenes long and a section level
there would be an empty frame.

### 3.4 Laboratories and question sections

A laboratory and a question section are not teaching scenes and do not take a
section number. They take a letter space of their own, numbered within their
chapter in the order they appear:

- laboratories are `1.L1`, `1.L2`, … — the laboratory's own letter stays in its
  title, so Laboratory B is `1.L1 · Laboratory B · Energy and power`;
- question sections are `n.Q1` for the question types and `n.Q2` for the twenty
  practice questions.

A laboratory keeps its position in the scene order. It is listed inside the
section whose material it exercises, carrying its `L` number rather than a
section number.

## 4. The textbook anchor

### 4.1 What it is

Every scene gains a `book` field naming the section of the course textbook that
develops the same material — `book:'1.1.2'`. A scene resting on two places takes
both: `book:'3.5, 3.7'`. A scene with no counterpart in the textbook — the course
opening, the concept map, the synthesis scenes — carries no `book` field and
renders no anchor.

### 4.2 The collision, and how the anchor avoids it

**The two numbering systems overlap and mean different things.** This course's
chapter 5 is the continuous-time Fourier transform; the textbook's chapter 5 is
the discrete-time Fourier transform. A bare `§4.3.1` printed beside a scene
numbered `5.4.1` would read as a contradiction, or worse, as a typing slip.

The anchor therefore **never renders as a bare section mark**. It always carries
the book's identity — the short form `OW §4.3.1`, expanded once where the
convention is introduced. `OW` is not decoration: it is what keeps the two
numbering systems apart on the page, and it is not optional in any surface.

### 4.3 Where the book is named

The anchor convention is stated once, in the `Using this artifact` scene of
chapter 0: which book, which edition, and that `OW §x.y.z` points into it. The
lecture notes state the same convention once, in `How to read these notes`.

Nothing else about the textbook is reproduced. No title of any of its sections is
copied, no text from it is quoted, and the anchor gives a section number and
nothing more.

## 5. Rendering

Four surfaces, one behaviour.

**The contents rail** (`buildSidebar` in `build/src/40_core.js`). The module badge
is replaced by a chapter heading carrying the chapter number and title. A section
is an intermediate heading and also a control: it opens and closes the scenes
under it, so a chapter is scanned at section level and drilled into one section
at a time. A section is open when the reader has said so, and otherwise when the
scene on screen is inside it — the rail is short without ever hiding where the
reader stands. An open section draws a rule down the left of the run it holds.
The rule is the entry's own left border, so it is continuous between rows and
turns coral on the scene the reader is standing in.

Each entry is two columns: address and title. **The textbook anchor is not in the
contents.** It was built there first and taken out: in a narrow rail it competed
with the titles for width and pushed half of them onto a second line, and the
reader scanning a list of titles is not the reader who wants it. It belongs on
the scene, where someone working through the material can act on it.

**The course map** (`buildMap`, same file). The same levels, every section open,
and no anchors: it is the whole-course view.

**The scene itself** (the `eyebrow` block in `build/src/90_app.js`). The eyebrow
already carries an instructor-only `[ref …]` for the lecture-notes page. The
student-facing anchor is a second, separate marker on the same line, and it is
**not** inside `instr-inline`: it is visible in the student edition, which is the
whole point. The scene number is printed with it.

**The lecture notes** (`notes/src/render.js`, `notes/src/c1.js`). The `toc` block
already takes `[number, title, summary]` triples, so the chapter numbers are
already there. Sections are added under each chapter, and the anchor is added to
each row.

### 5.1 What a reader sees

The rail, with section 1.2 open and 1.3 closed:

```
1  SIGNALS
   1.Q1   Module 1 · question types
   1.1  DEFINITIONS AND NOTATION                ▸
   1.2  ENERGY AND POWER                        ▾
      │ 1.2.1  Instantaneous power
      │ 1.2.2  Total energy            ← on screen
      │ 1.2.3  Average power
      │ 1.2.4  Energy, power, or neither
      │ 1.L1   Laboratory B · Energy and power
   1.3  TRANSFORMATIONS OF THE INDEPENDENT …    ▸
```

The scene, whose eyebrow carries the address and the anchor:

```
— MODULE 1 · ENERGY AND POWER · 1.2.2  OW §1.1.2
```

## 6. Data

Everything is declared in one new file, `build/src/89_sections.js`, and nothing is
removed. **No scene file carries an address or an anchor.** Writing either into
223 scene definitions would have meant a sweep over the scene files, which
CLAUDE.md §8 singles out as the edit that has broken this repository twice; one
declaration is also reviewable as a single table, and a renumbering becomes a
one-file edit.

- `CONTENT.CHAPTERS` — the nine chapters, each with its number, title and module.
  `flat:true` marks a chapter with no section level.
- `CONTENT.SECTIONS` — per module, the ordered sections with number, title and
  the scene ids each holds. It is the only place a section title is written, and
  the only place the order of a section's scenes is stated.
- `CONTENT.BOOK` — scene id to textbook address. A scene absent from it renders
  no anchor.
- `CONTENT.BOOKMARK` and `CONTENT.BOOKREF` — the short marker and the full
  statement of what it points into.
- `window.applyNumbering(scenes)` — walks the declaration, hangs `sec` and `book`
  on each scene object and returns the chapter view the contents render from. It
  is called once in `99_tail.html`, before anything reads either field.

Addresses are derived rather than written down twice, so a section that gains a
scene renumbers by itself and cannot drift out of step with the declaration.

## 7. Verification

The nine gates of the operating instructions all still apply and all must still
report their stated numbers. The scene set, the scene order and the drill pager
do not change, so none of them should move.

One new gate joins them: `build/seccheck.js`, run through `pw.js` like the other
Playwright gates. It reads the addresses off the built artifact rather than
parsing the declaration, so it checks what a reader actually meets:

- every scene has a `sec`;
- no two scenes share a `sec`;
- in chapters 1 to 7, section numbers run from `.0` upward with no gap, and scene
  numbers within a section run from `.1` upward with no gap; chapter 0 is checked
  as a flat run from `0.1` upward instead;
- every `sec` names a section that exists in `CONTENT.SECTIONS`, and every
  section in `CONTENT.SECTIONS` is used by at least one scene;
- `L` and `Q` numbers run from 1 upward within their chapter with no gap;
- every `book` value is a well-formed textbook address, and no `book` value
  reaches a rendered surface without its `OW` marker.

`tools/rule_check.py` is extended with the last of these: a bare `§` in a
student-facing string is a failure, for the same reason a lost backslash is.

## 8. Out of scope

- Reordering, splitting or rewriting any scene.
- Any change to the drill questions, their pager, or their instructor-only `src`.
- Any change to the five PDF editions beyond what the lecture-notes contents
  block requires.
- Reproducing any section title, figure, table, cover or sentence from the
  textbook. The cover was asked for on 2026-08-02 and declined: it is the
  publisher's artwork, and embedding it in a single-file artifact distributes it.
  The book is named in words instead, once, in `m0-howto` and once in the notes.

## 9. Record

This design puts a textbook reference in front of students, where §7.4 of the
operating instructions had kept the textbook out of the deliverable altogether.
The distinction it rests on: §7.4 bars reproducing the book, and a section number
cited by name is a reference, not a reproduction. The decision was taken
deliberately on 2026-08-02 and is recorded here rather than made silently.

It continues in the ambiguity ledger from **A-09**.
