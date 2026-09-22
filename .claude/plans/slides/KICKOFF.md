# Lecture-slide redesign — kickoff and handoff

Written 2026-09-21 for the engineer who will build the redesign. You were not in the conversation that
decided it. Everything you need is in this file and in the four files it names. Read this file to the
end before opening a plan.

## 1. What was decided, and why

The owner teaches from the artifact in a 16:9 lecture room. He found that a scene reads like a page of
a document, not like a lecture slide: long prose, too few figures, and content that sits at the top of
the stage with a third of it empty. He approved a mockup in which a scene is a slide: a title with a
rule under it, two columns, a figure on every slide, equations, and short **information cards** with a
coloured tab. The long explanation moves to the lecture notes, which already exist.

The decision is recorded in `DESIGN.md` at the repository root, in the parts marked
**DECIDED 2026-09-21, NOT YET BUILT**. That file is the specification. The mockup it came from is in
`.claude/reference/slide-mockup-2026-09-21/`: look at the four screenshots first, then read
`override.css`. The mockup is a throwaway: it hard-codes pixel sizes, it overrides rules instead of
editing them, it hand-tuned two figure heights, and no gate was run on it. Two of its figures have
faults that are listed in `DESIGN.md`. Build from the specification, not from the mockup.

## 2. Read order

1. `AGENTS.md` (a link to `CLAUDE.md`) — the core contract and routes to `.claude/rules/` for the gates, editorial rules R1–R9, and traps.
2. `DESIGN.md` — every visual decision, and which are locked.
3. `PRODUCT.md` — who the course is for.
4. This file, then the one plan you are about to run.
5. `.claude/reference/gates.md` only when a gate fails and you need to know what it measures.

## 3. The plans, in order

The statuses in the table below record the 2026-09-21 kickoff. Use the root `TODO.md` and the latest
`REPORT_*.md` for current completion and release state.

| Plan | File | What it changes | Status |
| --- | --- | --- | --- |
| S0 | `S0_baseline.md` | makes the gates runnable on this machine and gets them all green | written |
| SA | `SA_stage_fill.md` | a `slide` scene flag, a `fill` key on `cols`, a figure that grows into spare height | written |
| SB | `SB_cards.md` | the tabbed card, the labelled equation, the title rule, slide type sizes | written |
| SC-pilot | `SC_pilot.md` | Module 1 section 1.3 rebuilt as slides, with the text supplied in the plan | built 2026-09-22; account `REPORT_SC.md`; commit local, not pushed |
| SC-M1 | `SC_M1.md` | the rest of Module 1; section 1.3 left as the pilot built it | built 2026-09-22; account `REPORT_SC_M1.md`; commit local, not pushed |
| SC-M2 | `SC_M2.md` | Module 2 as lecture slides; the dark pages and Laboratory D stay | written 2026-09-22, not started; paste prompt `KICKOFF_SC_M2.md` |
| SC-M3 … SC-M7 | not written yet | one module each | after the owner accepts `REPORT_SC_M2.md` |

Run one plan at a time, in order. Do not start a plan that is marked "not written yet", and do not
begin content work early because it looks obvious. SC waits on purpose: the length of a card's text
cannot be set until the real card exists.

## 4. The rollout rule that keeps the course publishable

**Everything new is scoped to scenes that opt in.** A scene object gains `slide:true`; the renderer
puts the class `slide` on the scene host; every new style is written under `.scene.slide`. A scene
that has not been converted looks exactly as it does today, its fit factor does not move, and all gates
stay green after every commit. The published site can be rebuilt at any point in the work.

This matters because the new card type is 21.5 px where the old one is 17.5 px. Applied to all 234
scenes at once it would push dozens of them under the 0.90 fit line before their text has been cut.

When the last module is converted, a final plan removes the flag and deletes the old rules. Not before.

## 5. Rules that are broken most easily

`CLAUDE.md` and `DESIGN.md` hold all of them. These five are the ones a redesign breaks:

1. **No formula, number, result, question setup, address or textbook anchor changes.** A redesign moves
   and shortens text. It does not touch mathematics. If a formula looks wrong, stop and report it.
2. **No new block type.** Restyle the markup the renderer already emits. A new key on an existing block
   (`fill` on `cols`, `grow` on `fig`, `slide` on a scene) is allowed; a new `t:'…'` is not.
3. **Never run a search-and-replace across `build/src/*.js`.** Edit one label at a time, then
   `node --check build/src/8*.js build/src/9*.js`.
4. **Every type size is `calc(Npx * var(--ts))`.** A bare pixel size does not grow in lecture mode.
5. **Student-facing text is plain academic English** (R1–R5). No promotional tone, no slogan, no
   sentence written to sound impressive. In S0, SA and SB you write no student-facing text at all.

Also: do not rewrite the Playwright `require` line in any gate; do not `npm install`; do not edit
anything in `dist/` by hand; do not loosen a gate to make it pass.

## 6. How you work

- Branch: `main`. No feature branch, no pull request. One commit per plan task unless the plan says
  otherwise. Use the commit message the plan gives. **No AI attribution in a commit**: no
  `Co-Authored-By`, no "Generated with". The only author is `huguryildiz`.
- **Commit locally. Do not push.** A push to `main` deploys the public site. The reviewer pushes after
  reading your report.
- Rebuild before you run gates, and commit a rebuilt `dist/Signals_and_Systems.html` in the same commit
  as the sources that changed it.
- Run `git status` before you start. If the tree is not clean, stop and say so.
- Python is the arm64 virtualenv at `.venv/` (`.venv/bin/python`). Never the anaconda `python3`.

## 7. When to stop

Stop and report, without improvising, when:

- a gate that was green before your change is red after it and the cause is not your change;
- a plan step cannot be done the way it is written;
- a fix would need a locked decision in `DESIGN.md` to change;
- a scene needs a fit factor below 0.90 or marks itself `data-capped` after your change;
- you find an error in the mathematics or in the source.

A short report that says "stopped at task 2, here is why" is a good result. A finished plan with a
quietly loosened gate is not.

## 8. What you hand back after each plan

Write `.claude/plans/slides/REPORT_<plan>.md` with:

1. what you changed, file by file, in plain sentences;
2. **the numbers each gate printed**, copied from the run, not summarised; and for `qa.js` the `dense`
   list before and after;
3. where the screenshots are (put them in `.claude/plans/slides/shots/<plan>/`): every scene the plan
   names, in the light theme, the dark theme and lecture mode, at 1920×1080;
4. anything you did differently from the plan, and why;
5. anything you noticed and did not touch.

Then stop. The reviewer reads the report, looks at the screenshots, and releases the next plan.

## 9. State of the repository on 2026-09-21

- `main` is at `aea9b7a`, clean, pushed. Artifact **v1.8**, **234 scenes**.
- Ten gates and the site check pass. **`textclash.js` prints `TOTAL COLLISIONS: 40`.** Whether that is
  the browser build or the figures is not known. The log is beside this file:
  `textclash.2026-09-21.log`. S0 settles it.
- `build/pw.js` points at a Playwright install that no longer exists on this machine. The gates were
  run through a scratch wrapper, kept here as `pwx.reference.js`. S0 folds that into `pw.js`.
- `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `PRODUCT.md` and all of `.claude/` are gitignored. They exist
  on this machine only. Your reports and screenshots live there too and are never committed.
