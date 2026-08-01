# The exam drills

Instructor record. Rewritten 2026-08-01, when the drills and the question banks were folded into one
section and taken to twenty questions a module. Artifact v1.3.

The design is recorded in full in `docs/superpowers/specs/2026-08-01-exam-drill-20-design.md`. This
file is the teaching-side summary: what the sections are for, how to use them in a course, and what
to keep in mind when one is edited. It does not repeat anything already fixed in `CLAUDE.md`.

---

## 1. What a student meets

Every module from 1 to 7 **opens** with a map of its question types and **closes** with the questions
themselves. The teaching scenes sit between them.

**The taxonomy, at the front.** Five recurring question shapes, each with the method it wants, and a
link to the scene where that method is taught. The reader is told plainly that they are not expected
to be able to answer anything yet. It is a map, read once, and returned to when a question will not
start.

**The questions, at the end.** Twenty of them. One question fills the screen; the reader moves with
**Previous** and **Next**, and the pager says `Question 7 of 20`. Each question has a statement, often
a figure, and two to five lettered parts. Nothing is multiple choice and there are no hints: the
question is worked on paper, and then `Show worked solution` opens a solution that ends by testing its
own answer a second way.

**Nothing student-facing calls them an examination.** The sections read *question types* and *practice
questions*; the word appears nowhere on the page. The papers are what they are modelled on, not what
they are, and a student who reads *exam* on the screen will take them for the paper itself.

Module 0 has none. It is the course opening and carries no method to practise.

There is no separate question bank. Until 2026-08-01 each module carried a drill of twelve and a bank
of twelve; both were open-ended, both rendered the same way, and the difference between them was
never visible to a reader. They are one section now.

---

## 2. Where the questions come from

The three examination papers in `source/exams` — Midterm I, Midterm II and the Final, each setting
the 2018, 2019 and 2021 papers side by side, four questions to a paper — are the model for the form
and the difficulty, and nothing else. **No question in the artifact is one of those questions, and
none is a renumbered variant of one.** What was taken is the skill a question measures; every setup,
signal, coefficient and figure is written fresh.

Roughly twelve of a module's twenty are built on skills those papers measure. The other eight reach
the parts of the module the papers have not examined, so a reader who works all twenty has met the
whole module and not only the part that has been examined before.

A question's `src` field names the paper question whose *skill* it is built on. It renders in the
instructor edition only, and it is the only place in the artifact where a paper is named at all.

---

## 3. Using them in a course

The taxonomy is worth ten minutes at the start of a module. Read the five shapes aloud, and say which
one the week's problem sheet will look like.

The set is not a problem sheet. It is what a student works alone, and its value is in the **Check**
step: every solution ends by reaching the same answer a second way — a bound, a limiting case, a
symmetry, a dimensional argument. Students who learn to write that step stop handing in answers they
have not tested.

Two fields render only in the instructor edition. `err` names the single error the question is built
to catch. `teach` is one instruction to whoever is teaching it, usually what to demand in writing
before an answer is accepted.

---

## 4. When one is edited

- The solution keeps R7's shape: Given, Find, Method, Solution, Check. The Check step is never a
  restatement of the Solution step.
- Every number a Check states is re-derived in `verify/drills_m<n>.py`, which shares the helpers in
  `verify/drill_common.py` and is run by `verify/verify_drills.py`. A changed number that is not
  changed there is a silent failure — the gate catches it, but only if the check was written to
  compute the answer rather than to assert it.
- Figure mathematics is TeX, marked `tex:true`, with backslashes doubled in the JavaScript string.
  A bare `;` inside a typeset label is a lost `\;`.
- The count is twenty. If a question is retired, another is written.

All nine gates in `CLAUDE.md` §5 must pass before an edit is delivered. Three of them reach into the
drills: `labtest.js` walks the pager through all twenty of every module, and `mathscan.js` and
`textclash.js` each page through the twenty and open every solution, because a question left unpaged
is a question no gate has ever rendered.
