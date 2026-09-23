# Derivation review

This is a manual editorial review record for the explicit-derivation rule in
`.claude/rules/content-writing.md`. It does not run in CI and does not change the
exit status of any build or verification gate. Automated syntax, numerical, and
rendering checks cannot establish that a student can follow every equality.

The local `tools/derivation_advisor.py` hook lists mathematical lines added or
changed in authored source files. It runs after agent tool calls and at Stop in
both Claude Code and Codex. It is a reminder, not a review result. It reads the
current uncommitted diff and therefore cannot identify a change that was both
made and committed before the hook ran. A generated HTML or PDF change alone is
not treated as authored mathematics.

## Review one derivation

- Identify the equation or conclusion being derived and the governing definition.
- Check that the given signal or system is substituted visibly.
- Check each change of limits, indices, variables, or support conditions.
- Check the integral, sum, limit, or algebra one equality at a time. State the
  reason for any transition that is not immediate to a third-year EE student.
- Check assumptions, convergence conditions, signs, coefficients, units, and
  exceptional cases such as zero indices or zero denominators.
- Follow the complete slide reveal sequence and the corresponding lecture-notes
  passage. Long slide derivations may span scenes; the notes must contain the
  uninterrupted chain.
- For a changed PDF passage, inspect the rendered page and extracted text so a
  correct source equation is not lost or clipped in print.

Record the scene ID, notes section or page, result, and any remaining gap in the
relevant module report. A passing automated gate alone is not a review result.

## Coverage under the explicit-derivation rule

| Scope | Authored pass | Manual derivation review | Evidence |
| --- | --- | --- | --- |
| Modules 1–2, artifact and lecture notes | Reported complete locally | Pending owner review; do not mark accepted from gate results alone | `.claude/plans/slides/REPORT_M1_M2_DERIVATIONS.md` |
| Lecture notes Chapters 3–7 | Expanded 2026-09-23; every added intermediate equality checked with sympy (Ch 3: 31, Ch 4: all, Ch 5: 50, Ch 6: 69, Ch 7: 76 checks); no result errors, three rounding corrections in Chapter 4 | Pending owner review | Commit of 2026-09-23 on `notes/src/c23.js`, `c4.js`–`c7.js` |
| Artifact Modules 3–7 | Not assessed under this new rule | Pending | Record in each module report when reviewed |

The M1–M2 report records an 82-page PDF text and rendered-page inspection. That
print inspection is complete as reported there; the manual derivation review
above is a separate editorial decision.
