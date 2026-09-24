---
paths:
  - "notes/**/*"
  - "instructor/**/*"
  - "dist/*.pdf"
---

# Notes and PDF production

Read `content-writing.md` when authoring notes, examples, or solutions. In notes objects the block-type key is `t`; a worked-example heading uses `hd`, never a second `t`. Duplicate `t` keys silently remove a block (this once removed 18 worked examples).

Keep `build/` and `notes/` as sibling directories. The notes pipeline writes into `../dist`; do not edit generated output by hand. Use the commands and gates in `build-pipeline.md`. On this machine `.venv/` is an arm64 virtual environment; if it must be recreated, use `/opt/homebrew/bin/python3.12 -m venv .venv` and install numpy and sympy only for that purpose.

Before shipping any PDF, run `pdftotext -layout` over every page and fail on a `$...$` pair, a bare TeX macro, or a nearly empty page. Render every page to an image and inspect it. The automated gates do not read the PDFs.

## Print layout

These rules are shared with the other course repository (`signals-and-systems` and
`digital-communications`); a change to one is made in both.

- `notes/topdf.js` prints each document in one pass from the `@page` rules in `notes/src/notes.css`,
  with `preferCSSPageSize`, `outline` (PDF bookmarks) and `tagged`. The cover is the named page `cover`
  with no margin, so it has no footer. Do not print the cover separately and join the files: the join
  drops the title, the tags, the bookmarks and every internal link.
- Every page except the cover has the footer `© 2026 Hüseyin Uğur Yıldız · huguryildiz.com · Course
  content: CC BY-NC-SA 4.0` at the left and `<edition> · <page>` at the right, and the running head
  `<course> — <edition>` at the top right.
- Print at scale 1. If an equation overflows, fix the equation; do not shrink the document.
- A numbered `h1` (CHAPTER, APPENDIX, MODULE, PART) always starts a new page. Titles are navy, section
  titles slate, numbers coral, all from the `DESIGN.md` tokens.
- The contents lists every chapter and its numbered sections. Each row links to its heading, and
  `topdf.js` writes the page number in a second pass. It fails when a target is missing or when writing
  the numbers moves one.
- In the lecture notes every figure and every table has a caption (`cap`). They are numbered by chapter
  (Figure 3.4, Table A.2) and listed in the List of Figures and the List of Tables after the contents.
  A list entry is the caption's first sentence; give a `short` field when that sentence is too long to
  name the figure. The browser logs `NOTES: … has no caption` for each gap, and `topdf.js` prints the
  count. Ship with none.
- Callouts (`box`) and worked examples carry a small stroke icon chosen by `kind` from `ICONS` in
  `notes/src/render.js`. A new kind gets its icon there, in the same 24-unit stroke set.
