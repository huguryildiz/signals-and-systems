# EE 311 — Signals and Systems

Folders are organised by **who the files are for**. Superseded material is deleted rather than kept
alongside the current files; git history is where it survives.

| Folder | For whom | Contents |
|---|---|---|
| `source/` | you only | Course source material. Not distributed. |
| `dist/` | students | Everything that may be handed out, and nothing else. |
| `build/`, `notes/` | you only | The two pipelines that generate everything in `dist/`. |
| `verify/`, `tools/` | you only | Numerical, structural and editorial check suites. |
| `audit/` | you only | Page-mapping inventories and scene inventory. **Never distribute these.** |
| `instructor/` | you only | Internal records: the continuation brief and the coverage matrix. **Never distribute these.** |
| `.claude/` | you only | Working material — prompts, audit reports, plans, notes. Untracked; this machine only. |

Two files in `source/` are deliberately untracked (see `.gitignore`): `Book.pdf`, which is
third-party material and must not be redistributed, and `EE311 - Lecture Notes.pdf`, the 41 MB
handwritten scan. A fresh clone will not contain them — copy them in from an existing working copy
before rebuilding or auditing source pages.

## What to hand out

Give students the two files in `dist/`:

- **`EE311_Signals_and_Systems.html`** — the interactive artifact. Open in any browser. Works offline, makes no
  network requests, and stores optional progress on the reader's own device. Keyboard: `→` advance, `M` module
  map, `/` search, `G` notation, `?` help.
- **`EE311_Lecture_Notes.pdf`** — 25 pages, A4, printable and annotatable.

Both are written as self-contained teaching material. Neither mentions how it was produced, and neither shows
source pages. Those appear only in the artifact's instructor edition, which is reached with the `I` key.

## What not to hand out

`instructor/` holds the continuation brief and the coverage matrix; `.claude/reports/` holds the audit
trail and the issue ledger. They exist so that any claim in the student material can be traced and
checked later. They are working records, not teaching material.

## Rebuilding

Everything needed is tracked in the repository. From the repository root:

```bash
cd build  && node build.js && node qa.js && node labtest.js
cd ../notes && node build.js && node topdf.js
cd ../verify && ../.venv/bin/python verify_m1_m3.py
```

Expected: zero errors, zero overflow, 50 of 50 checks passing.

`.venv` is a local arm64 virtualenv with numpy and sympy, untracked; create it once with
`/opt/homebrew/bin/python3.12 -m venv .venv && .venv/bin/pip install numpy sympy`. The three Playwright
harnesses — `qa.js`, `labtest.js`, `topdf.js` — require Playwright at a fixed absolute path and run only
in the container the project was built in.

Before delivering anything to students, run the editorial rule check:

```bash
.venv/bin/python tools/rule_check.py "build/src/8[1-9]_scenes*.js" "build/src/91_*.js" \
        "build/src/95_qbank.js" "build/src/70_labs.js" "notes/src/*.js"
# expected: TOTAL VIOLATIONS: 0
```

## Current state

Chapters 1 to 3 are complete: signals, system properties, and linear time-invariant systems. Fourier series,
the continuous- and discrete-time Fourier transforms, and sampling are the next stage; `instructor/PHASE2_HANDOFF.md`
describes exactly how to continue.
