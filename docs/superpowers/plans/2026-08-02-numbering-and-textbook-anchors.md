# Numbered contents and textbook anchors — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the contents a chapter / section / scene numbering of the course's
own, and put a textbook anchor beside every entry, without moving any scene.

**Architecture:** All numbering lives in one new source file, `build/src/89_sections.js`,
which declares the chapters, the sections and the scene ids each section holds. Every
address is *derived* from that declaration at load time and hung on the scene objects,
so no scene file is edited and no address is written twice. The renderers read the
derived fields.

**Tech Stack:** Plain ES5-flavoured browser JavaScript, no build step beyond
`build/build.js` concatenation. Node for the gates, Python 3.12 in `.venv` for the
verifiers.

## Global constraints

- The artifact is one offline file. No `npm install`, no network fetch, ever.
- `build.js` picks up `8[1-9]_*.js` automatically in sorted order; `89_sections.js`
  therefore loads after every scene file (`81`–`88`) and before `90_app.js`.
- No scene file under `build/src/8[1-8]_scenes_m*.js` or `9[2-8]_drill_m*.js` is
  edited by this plan. Not one line.
- The textbook anchor never renders as a bare `§`. It is always `OW §x.y.z`.
- Student-facing strings go through `md()` (R8) and carry no banned phrase (R2).
- All nine gates must still report the numbers in CLAUDE.md §5.
- Report the numbers a run actually printed. Never a summary in place of a run.

---

### Task 1: The numbering declaration and its derivation

**Files:**
- Create: `build/src/89_sections.js`
- Test: `verify/verify_sections.py`

**Interfaces:**
- Produces: `CONTENT.CHAPTERS` — ordered array of `{n, title, module}`.
- Produces: `CONTENT.SECTIONS` — map of module id to ordered array of
  `{n, title, ids}`.
- Produces: `CONTENT.BOOK` — map of scene id to textbook address string.
- Produces: `window.applyNumbering(scenes)` — walks the scene array, hangs
  `sec` (address string) and `book` (anchor string or undefined) on each scene
  object, and returns a `{sec, book}` lookup keyed by scene id.

- [ ] **Step 1: Write the declaration**

`CONTENT.CHAPTERS` carries the eight chapters plus the closing appendix. `A` is
new: `end-synth`, `end-map` and `end-conventions` carry `module:'Synthesis'`,
which is absent from `CONTENT.MODULES`, so today `buildSidebar` filters them out
and three scenes are missing from the contents. Numbering them fixes that.

`CONTENT.SECTIONS` lists, per module, each section's number, its title and the
scene ids it holds, in scene order. Chapter 0 and chapter A hold a single
implicit section each and are numbered two-part.

- [ ] **Step 2: Write the derivation**

`applyNumbering` walks each chapter in order. Within a chapter it keeps two
counters: an ordinal per section, and one `L` counter for the whole chapter.
A scene id matching `/-lab-/` takes `<ch>.L<k>`; `<m>-drill-map` takes `<ch>.Q1`
and `<m>-drill` takes `<ch>.Q2`; the artifact title scene takes no address.
Everything else takes `<section>.<ordinal>`.

- [ ] **Step 3: Write the verifier**

`verify/verify_sections.py` parses `89_sections.js` and the scene files and
asserts, one PASS/FAIL line each: every scene has an address; no address repeats;
section numbers run from `.0` with no gap; ordinals run from `.1` with no gap;
`L` and `Q` numbers run from 1 with no gap; every declared id exists as a scene;
every scene id is declared exactly once; every `book` value is well formed.

- [ ] **Step 4: Run it**

Run: `cd verify && ../.venv/bin/python verify_sections.py`
Expected: every line PASS, `0 failed`.

- [ ] **Step 5: Commit**

---

### Task 2: The contents rail and the course map

**Files:**
- Modify: `build/src/40_core.js` — `buildMap`, `buildSidebar`
- Modify: `build/src/10_style.css` — `#sidenav`, `.mapmod`

**Interfaces:**
- Consumes: `CONTENT.CHAPTERS`, `CONTENT.SECTIONS`, and the `sec` / `book`
  fields Task 1 hangs on each scene.

- [ ] **Step 1: Rewrite `buildSidebar`**

Group by chapter rather than by module. Inside a chapter emit a section heading
whenever the section part of `sec` changes. Each entry leads with its address and
ends with its anchor.

- [ ] **Step 2: Rewrite `buildMap` the same way**

- [ ] **Step 3: Style the two new elements**

A section heading and an anchor. The anchor is muted and small; it must not
compete with the title. Both light and dark palettes (§7.2).

- [ ] **Step 4: Rebuild and look at it**

Run: `cd build && node build.js`, then screenshot the rail in both themes.

- [ ] **Step 5: Commit**

---

### Task 3: The scene surface

**Files:**
- Modify: `build/src/90_app.js` — the `eyebrow` block renderer, `chrome()`
- Modify: `build/src/10_style.css` — `.eyebrow`

**Interfaces:**
- Consumes: `sec` and `book` on the current scene.

- [ ] **Step 1: Add the student-facing anchor to the eyebrow**

The eyebrow already renders an instructor-only `[ref …]` for the lecture-notes
page. The new marker sits beside it and is **not** wrapped in `instr-inline`.

- [ ] **Step 2: Put the address in the breadcrumb**

`chrome()` builds the crumb from `sc.module`. It uses `sc.sec` instead.

- [ ] **Step 3: Rebuild, check a scene in both editions and both themes**

- [ ] **Step 4: Commit**

---

### Task 4: Naming the textbook once

**Files:**
- Modify: `build/src/81_scenes_m0.js` — the `m0-howto` scene only
- Modify: `notes/src/c1.js` — `How to read these notes`

This is the one scene-file edit the plan allows, because the anchor convention
has to be stated somewhere a student meets it. It adds a block; it changes no
existing block.

- [ ] **Step 1: Add the convention to `m0-howto`**
- [ ] **Step 2: Add the same sentence to the notes**
- [ ] **Step 3: Rebuild both, read the two paragraphs**
- [ ] **Step 4: Commit**

---

### Task 5: The lecture notes contents

**Files:**
- Modify: `notes/src/c1.js` — the `toc` block
- Modify: `notes/src/render.js` — the `toc` renderer, if a fourth column is needed

- [ ] **Step 1: Add sections and anchors to the contents block**
- [ ] **Step 2: Rebuild the notes and the PDF**

Run: `cd notes && node build.js && node topdf.js`

- [ ] **Step 3: Render every page to an image and look at it**
- [ ] **Step 4: Commit**

---

### Task 6: The bare-§ rule, and the full gate run

**Files:**
- Modify: `tools/rule_check.py`

- [ ] **Step 1: Add the bare-`§` check**

A `§` in a student-facing string that is not preceded by the book marker is a
failure, for the same reason a lost backslash is: it renders without complaint
and reads as this course's own number.

- [ ] **Step 2: Run all nine gates plus the two verifiers**

Every command in CLAUDE.md §5, plus `verify_sections.py`. Report the numbers
each run printed.

- [ ] **Step 3: Commit sources and rebuilt `dist/` together**

---

## Deviation from the spec

Spec §6 says every scene gains `sec` and `book` fields. This plan derives both
from a single declaration instead of authoring them into 223 scene definitions.
The rendered result is identical and the scene objects carry the same two fields
at run time. The reason is CLAUDE.md §8: a sweep over the scene files is the one
edit the operating instructions single out as having broken this repository
twice. One declaration is also reviewable as a single table, and a renumbering
becomes a one-file edit.
