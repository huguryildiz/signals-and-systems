# EE 311 — Phase 2, Step 1: visual audit of source pp. 22–41

**Instructor-only record.** Written 2026-07-25. Artifact version at the time of this audit: **v0.9**.
This file continues the ambiguity ledger of `EE311_Phase1_Report.md` §2 from **A-09**.

---

## 1. Scope and method

Pages 22–41 of `00_source/EE311 - Lecture Notes.pdf` were rendered at 160 dpi and read one page at a
time. Regions carrying a candidate issue were re-cropped and enlarged before a verdict was recorded.
Every numerical claim below was checked independently — by re-deriving the result symbolically and, where
a plotted figure is involved, by evaluating both the correct and the printed expression numerically and
comparing the ranges against the printed axis limits.

The delegated inventories (`audit/inventory_p22_p38.md`, `audit/inventory_p39_p55.md`) were consulted
**after** each page was read, and only to check that nothing had been missed. They were not used as
evidence. Section 4 records how they performed.

Pages covered: 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41 — twenty of
twenty. This is the source range for Module 4 (Fourier Series).

---

## 2. Ledger — confirmed issues, pp. 22–41

| ID | p. | Issue | Class | Resolution to adopt |
|---|---|---|---|---|
| A-09 | 23 | The discrete-time bullet ends "…then the output signal is a scaled version, `y(t) = H(s)e^{st}`". The continuous-time expression is used in the discrete-time statement; the block diagram directly beneath it correctly shows `zⁿ → H(z)zⁿ`. | copy slip | State the discrete-time result as `y[n] = H(z)zⁿ`. The scene keeps continuous and discrete time visibly separate so the slip cannot be reproduced. |
| A-10 | 26, 27, 38 | The fundamental period is taken as the LCM of the component periods, written as `LCM(a/b, c/d) = LCM(a,c)/LCM(b,d)`. This is valid only because the periods are first put over a common denominator, where `LCM(d,d) = GCD(d,d) = d`. Applied without that step it is wrong: `LCM(2/9, 8/21)` would give `8/63` instead of `8/3`. The parenthetical gloss on p.26, "smallest positive integer that is a multiple of both", is also false in general — p.27 itself obtains `T₀ = 24/5`. | over-general statement | Teach the general rule `LCM(numerators)/GCD(denominators)`, show that the common-denominator route is the same rule in disguise, and drop "integer" from the definition. The three worked answers on pp. 26, 27 and 38 are correct as printed. |
| A-11 | 27 | The boxed result reads `a₀ = 0`. The line directly above expands the constant term as `1·e^{j0ω₀t}` with `k = 0`, and the plotted `\|a_k\|` shows a stem of height 1 at `k = 0`. | transcription error | `a₀ = 1`. The contradiction is stated where it occurs; the DC term is read off the constant of the signal. |
| A-12 | 29 | The note headed "Envelope Function" gives `2 sin(ωT₁)/ω` and then `= T sin(2π(T₁/T))/π`. The second form is the envelope evaluated at the single point `ω = ω₀ = 2π/T`, i.e. the `k = 1` sample, not a general expression. As a function of the harmonic index it is `T sin(2πk T₁/T)/(kπ)`. | mislabelled specialisation | Keep the envelope as a function of the continuous variable ω, and show the sampling `ω = kω₀` as a separate, explicit step. |
| A-13 | 31 | In the periodic impulse train the coefficient integral is written `(1/T)∫_{−T/2}^{−T/2} δ(t)e^{−jkω₀t} dt`; both limits read `−T/2`. | limit typo | Upper limit is `+T/2`. The result `a_k = 1/T` for all `k` is unaffected. |
| A-14 | 33 | In the geometric-sum evaluation of the discrete-time rectangular wave the first numerator term is written `e^{−jk(2π/N)N₁}`. The value of `r^n` at the lower limit `n = −N₁` is `e^{+jk(2π/N)N₁}`. | sign typo | The `+` sign. The next line, which factors out `e^{−jkπ/N}` to reach `2j sin(2πk(N₁+½)/N)`, already uses the correct sign, so the final coefficient is right. |
| A-15 | 36 | The multiplication property is given for discrete time with an infinite sum, `Σ_{l=−∞}^{∞} a_l b_{k−l}`, identical to the continuous-time case. For discrete-time Fourier series it is a **periodic** convolution, `Σ_{l=⟨N⟩} a_l b_{k−l}` — which is what the summary table on p.37 shows. The two pages contradict each other. | wrong summation range | The periodic convolution. This is one of the misconceptions already listed for the Q4–Q7 banks; it now has a source-anchored example. |
| A-16 | 39 | **Factor of two.** The boxed output is `y(t) = 1 + 0.15cos(πt − 1.26) + 0.08cos(2πt − 2.98) + 0.05cos(3πt − 0.42)`. Each conjugate pair `b_k e^{jkω₀t} + b_{−k}e^{−jkω₀t}` contributes `2\|b_k\|cos(kω₀t + ∠b_k)`, so the amplitudes must be doubled. Correct: `y(t) = 1 + 0.303cos(πt − 1.263) + 0.157cos(2πt − 2.984) + 0.106cos(3πt − 0.418)`. The printed `\|b_k\|` and `∠b_k` stem plots are correct; only the assembled result is wrong. The MATLAB plot of `y(t)` spans 0.81 to 1.21, which matches the halved expression — the correct signal spans 0.615 to 1.417 — so the error is in the figure as well. | factor error, propagated to figure | Give the pairing step explicitly (`b_k e^{jkω₀t} + c.c. = 2\|b_k\|cos(...)`) and state the correct amplitudes. Re-draw the figure. |
| A-17 | 40 | Same omission in the high-pass homework, with two phase errors on top. The boxed output is `y(t) = 0.48cos(πt − 0.31) + 0.49cos(2πt − 1.41) + 0.5cos(3πt − 1.15)`. Correct: `y(t) = 0.953cos(πt + 0.308) + 0.988cos(2πt − 1.413) + 0.994cos(3πt + 1.153)`. The first and third phases are those of `b_{−k}`, not `b_k`; the second is right. The absence of a DC term is correct (`H(j0) = 0`) but is never stated. The printed figure again matches the erroneous expression. | factor and sign error, propagated to figure | As A-16, and fix the phase convention: the pairing takes `∠b_k` for positive `k`. State that the DC term vanishes and why. |
| A-18 | 22, 23 | Every convolution integral, transfer-function integral and transform sum on the eigenfunction pages is written with a bare `∫` or `Σ_k` and no limits; the intended `(−∞, ∞)` is never printed. | notation | Limits are always written. The scenes carry them. |
| A-19 | 28 | The theorem states the continuous-time series with period `T`, while the proof beneath it works with `T₀`, and `ω₀ = 2π/T₀` is never restated. | notation drift | One period symbol throughout. `T₀` is used, with `ω₀ = 2π/T₀` stated once at the point of definition. |
| A-20 | 33 | The finite geometric sum is invoked with the side condition `\|r\| < 1`, and the page argues it is satisfied because `\|e^{−jk(2π/N)n}\| ≤ 1`. Here `\|r\| = 1` exactly. A finite geometric sum requires only `r ≠ 1`. | over-restrictive condition | Same ruling as A-07 (p.17): the finite sum needs `r ≠ 1`; `\|r\| < 1` belongs to the infinite sum. The case `r = 1`, i.e. `k = 0, ±N, ±2N, …`, is exactly the branch the page then handles separately, so the distinction is load-bearing here. |
| A-21 | 33 | In the `N = 10, N₁ = 2` subplot the peak coefficient is `(2N₁+1)/N = 0.5`, above the highest labelled tick (0.4); the peak value cannot be read off the axis. | figure readability | Axes are scaled to the data in every redrawn figure. |

---

## 3. Verified correct — candidates dismissed, and results confirmed

The following were checked specifically and are **not** errors. They are recorded so that they are not
re-opened in a later session.

- **pp. 28, 32 — analysis/synthesis labels.** Both the continuous-time and the discrete-time theorem pages
  label the synthesis and analysis equations correctly. This matters for the next session: the reported
  swap at pp. 44 and 65 is therefore a candidate *local* error, not a systematic convention in the notes.
- **p. 27 — phase plot.** `∠a₃ = −π/2`, `∠a₋₃ = +π/2`, obtained as `∠1 − ∠2j` and `∠(−1) − ∠2j`; the stem
  plot agrees. Only `a₀` (A-11) is wrong on that page.
- **p. 31 — sawtooth coefficients.** `a_k = (jT/2kπ)cos(kπ)` re-derived independently; `a₀ = 0` is correct
  here. The `\|a_k\|` peak of 0.159 at `k = ±1` for `T = 1` matches the plot.
- **p. 32 — phase plot of the discrete-time example.** `∠a₋₁₀ = +π/2`, `∠a₋₉ = −π/5`, `∠a₉ = +π/5`,
  `∠a₁₀ = −π/2`; the plot agrees at every point, including the values at the axis edges.
- **p. 34 — homework coefficients.** `a_k = −(2j/11)Σ_{m=1}^{5} m sin(2πkm/11)` re-derived; the printed
  peak `\|a_k\| ≈ 1.77` was reproduced numerically (1.7746).
- **p. 36 — conjugation and the real-and-odd argument.** The purple derivation
  (`Re{a_k} = −Re{a_k} ⇒ Re{a_k} = 0`) is correct.
- **pp. 40–41 — both discrete-time filtering examples.** `y[n] = 0.36cos(πn/2 + π/4) + 0.25(−1)ⁿ` and
  `y[n] = 0.25 + 0.36cos(πn/2 − π/4)` are both correct, factor of two included. This is what identifies
  A-16 and A-17 as slips rather than a house convention.

---

## 4. How the delegated inventories performed

This is the evidence for the standing instruction that they are mapping-grade only.

- **Confirmed by direct reading:** A23-01 (→ A-09), A31-01 (→ A-13), A36-01 (→ A-15), A33-02 (→ A-21).
- **Reclassified:** the "LCM where GCD may be intended" flag on pp. 26/27/38 is not an arithmetic error in
  any of the three worked cases; the defect is that the rule as written does not generalise (→ A-10).
- **Missed entirely:** the factor-of-two errors on pp. 39 and 40 (A-16, A-17) — the most consequential
  finding in this range, and one that has propagated into two MATLAB figures. The inventories flagged
  neighbouring oddities on both pages (A39-03, A40-02, phrased as a "k ↔ −k pairing oddity") without
  identifying the actual defect. Also missed: the sign typo on p.33 (A-14) and the envelope
  specialisation on p.29 (A-12).
- **Overstated:** A40-02 describes the `∠b_k` plot as not obeying odd symmetry. It does; the listed values
  `(−1.15, 1.41, −0.31, 0.00, 0.31, −1.41, 1.15)` are odd-symmetric.

Net: the inventories are usable as a page-level map of what is on each page. They are not usable as a
statement of what is correct on it.

---

## 5. Production constraints noted during the audit

- **p. 37** carries two typeset property tables (continuous- and discrete-time Fourier series) that are
  reproduced from the textbook. They must not be reproduced in any deliverable. The properties are
  restated in the artifact's own layout and wording, derived from the pages that prove them (pp. 35–36).
- **pp. 39, 40** need their `y(t)` figures re-drawn rather than re-used, because the printed figures
  encode A-16 and A-17.
- The lecture pages label this chapter CH#3 and the week tags run Week5–Lec1 through Week7–Lec2 across
  pp. 22–41. Module 4 therefore covers three lecture weeks; splitting it at the p.35 properties boundary
  is the natural seam.

---

## 6. Verification state at the end of this session

Run against the working tree rebuilt from `03_production/EE311_Deliverables.zip`, after the two carried
Phase 1 open items were closed:

```
build/qa.js          59 scenes · 0 errors · 0 overflow · lowest fit-scale 0.976 (m3-ex-ct1)
build/labtest.js     ERRORS: none
build/domcheck.js    59 scenes · MALFORMED SCENES: 0        (new gate — see §7)
verify/verify_m1_m3.py   50 passed, 0 failed
tools/rule_check.py      TOTAL VIOLATIONS: 0
```

---

## 7. Artifact defect found and fixed during the baseline pass

Splitting `m3-ex-ct2` (Phase 1 open item 1) exposed the cause of its 0.82 fit-scale, which was not a
density problem at all. Four of its worked-example row labels were written as `'II · $0<t<1$'`. The row
label is inserted into the DOM without escaping, so `<t<1$'` was parsed as the start of an HTML tag and
swallowed the markup that followed it. The two-column layout collapsed into one, the case table rendered
as a broken grid, and the scene then overflowed and was scaled down to the 0.82 floor. No console error
was raised, and `qa.js` reported only the scale.

Two changes followed:

1. The labels are now plain text (`'Case II'`), with the interval carried in the value column where the
   mathematics is rendered.
2. `build/domcheck.js` was added: it renders every scene at every reveal state and reports any element
   whose tag name is not valid HTML. Run against the v0.9 artifact it finds exactly the five states of
   `m3-ex-ct2`; against the current build it reports zero. **This is now a fifth verification gate and
   should be run before every delivery**, because the whole class of defect is invisible to the other four.

---

## 8. What Module 4 authoring must carry forward

- Every issue A-09 … A-21 is stated in the artifact at the point where it occurs, in the artifact's own
  teaching voice, without reference to pages, sources, audits or versions.
- A-16 and A-17 give Module 4 its central worked example: assembling `y(t)` from `b_k = a_k H(jkω₀)`. The
  conjugate-pair step is where students lose the factor of two, and the source demonstrates the error
  twice. The correct amplitudes and phases are in §2 and were verified numerically.
- A-15 gives the periodic-convolution misconception a concrete anchor for the Q4 bank.
- New numerical results to add to `verify/`: the three continuous-time filtering amplitudes and phases on
  pp. 39 and 40, the rectangular-wave coefficients and their envelope, the sawtooth coefficients, the
  discrete-time rectangular-wave coefficients, and both discrete-time filtering outputs.
