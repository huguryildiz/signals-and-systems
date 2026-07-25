# EE 311 — Signals and Systems

Folders are organised by **who the files are for**. Nothing here is deleted; older material sits in `_archive`.

| Folder | For whom | Contents |
|---|---|---|
| `00_source/` | you only | Course source material and the production brief. Not distributed. |
| `01_student/` | students | Everything that may be handed out, and nothing else. |
| `02_instructor/` | you only | Internal records: audit, verification, coverage, editorial rules, continuation brief. **Never distribute these.** |
| `03_production/` | you only | The full source package needed to rebuild every output, plus the notes source. |
| `_archive/` | nobody | Superseded material kept only so nothing is lost. Safe to delete. |

## What to hand out

Give students the two files in `01_student/`:

- **`EE311_Signals_and_Systems.html`** — the interactive artifact. Open in any browser. Works offline, makes no
  network requests, and stores optional progress on the reader's own device. Keyboard: `→` advance, `M` module
  map, `/` search, `G` notation, `?` help.
- **`EE311_Lecture_Notes.pdf`** — 25 pages, A4, printable and annotatable.

Both are written as self-contained teaching material. Neither mentions how it was produced, and neither shows
source pages. Those appear only in the artifact's instructor edition, which is reached with the `I` key.

## What not to hand out

`02_instructor/` contains the audit trail, the issue ledger and the coverage matrix. They exist so that any
claim in the student material can be traced and checked later. They are working records, not teaching material.

## Rebuilding

`03_production/EE311_Deliverables.zip` contains every source file, the build scripts and the test harnesses.
Unzip it anywhere and run:

```bash
cd build  && node build.js && node qa.js && node labtest.js
cd ../notes && node build.js && node topdf.js
cd ../verify && python3 verify_m1_m3.py
```

Expected: zero errors, zero overflow, 50 of 50 checks passing.

Before delivering anything to students, run the editorial rule check:

```bash
python3 tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
        "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
# expected: TOTAL VIOLATIONS: 0
```

## Current state

Chapters 1 to 3 are complete: signals, system properties, and linear time-invariant systems. Fourier series,
the continuous- and discrete-time Fourier transforms, and sampling are the next stage; `02_instructor/PHASE2_HANDOFF.md`
describes exactly how to continue.
