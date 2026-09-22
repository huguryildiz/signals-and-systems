# Derivation review

This is a manual editorial review record for the explicit-derivation rule in
`.claude/rules/content-writing.md`. It does not run in CI and does not change the
exit status of any build or verification gate. Automated syntax, numerical, and
rendering checks cannot establish that a student can follow every equality.

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
| Modules 3–7 | Not assessed under this new rule | Pending | Record in each module report when reviewed |

The M1–M2 report records an 82-page PDF text and rendered-page inspection. That
print inspection is complete as reported there; the manual derivation review
above is a separate editorial decision.
