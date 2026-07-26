# EE311 Signals and Systems — Page-Level Content Audit, pages 72–88

Global notation note: the imaginary unit is handwritten as `J` throughout; it is recorded here as `j`.
Global glyph note: the handwritten lowercase `a` is drawn like `2`/`∂`; occurrences are transcribed as `a` where context (e.g. `a-b`, `a^n u[n]`) forces it, and flagged where genuinely ambiguous.

---

## p.72 — DTFT Properties, items (3) Time-Shift, (4) Frequency-Shift, (5) Conjugation, (6) Differentiation, (7) Time-Reversal, (8) Time Expansion; unlabeled `Example` block at bottom — no red week/lecture box on this page

**Concepts**
- Time-shift property of the DTFT (delay ⇒ linear phase).
- Frequency-shift (modulation) property.
- Conjugation property; consequence for real `x[n]`: conjugate symmetry `X(e^{jw}) = X*(e^{-jw})`; `Re{X}` even in w, `Im{X}` odd in w.
- "Differentiation" property — actually the first difference `x[n] − x[n−1]`.
- Time-reversal property.
- Time expansion: definition of the zero-inserted signal `x_(k)[n]`; expansion in time ⇔ compression in frequency (annotated with red arrows on the figure).
- Proof of the time-expansion property via index change `r = n/k`.
- Building a signal from an expanded/shifted version and using linearity + time-shift to write its DTFT.

**Equations** (all DT)
```
(3) x[n] --F--> X(e^{jw})  ,   x[n − n0] --F--> e^{−j w n0} X(e^{jw})          [boxed+highlighted]
(4) x[n] --F--> X(e^{jw})  ,   e^{j w0 n} x[n] --F--> X(e^{j(w − w0)})          [boxed+highlighted]
(5) x[n] --F--> X(e^{jw})  ,   x*[n] --F--> X*(e^{−jw})                          [boxed+highlighted]
    If x[n] is real,  x[n] = x*[n] --F--> X(e^{jw}) = X*(e^{−jw})
    Re{X(e^{jw})} is even function of w.      Im{X(e^{jw})} is odd function of w.
(6) x[n] − x[n−1] --F--> (1 − e^{−jw}) X(e^{jw})                                 [boxed+highlighted]
(7) x[−n] --F--> X(e^{−jw})                                                      [boxed+highlighted]
(8) x_(k)[n] = { x[n/k],  if n is a multiple of k
               { 0,       if n is not a multiple of k
    x_(k)[n] --F--> X(e^{j k w})                                                 [boxed+highlighted]
Proof:  Let r = n/k ,  x_(k)[rk] = x[r].
    X_(k)(e^{jw}) = SUM_{n=−inf}^{inf} x_(k)[n] e^{−jwn}
                  = SUM_{r=−inf}^{inf} x_(k)[rk] e^{−jw r k}
                  = SUM_{r=−inf}^{inf} x[r] e^{−j(kw) r}
                  = X(e^{j k w})            (since x_(k)[rk] = x[r])
Example, final red bullet:
    X(e^{jw}) = 2 e^{−jw} Y_(2)(e^{jw}) + Y_(2)(e^{jw}) = (1 + 2 e^{−jw}) Y_(2)(e^{jw})
```

**Examples**
1. Bottom `Example` block. Given: no prose statement; only MATLAB panels whose titles define `g[n]` (5-point unit rectangle, n = −2..2), `y[n] = g[n−2]`, `y_(2)[n]` (2× time-expanded `y[n]`), `2y_(2)[n−1]`, and `x[n] = 2y_(2)[n−1] + y_(2)[n]`. Asked: not written; implicitly "find `X(e^{jw})`". Method: time-expansion + time-shift + linearity, cross-checked against the magnitude/phase panels. Final answer exactly as written: `X(e^{jw}) = 2 e^{−jw} Y_(2)(e^{jw}) + Y_(2)(e^{jw}) = (1 + 2 e^{−jw}) Y_(2)(e^{jw})`.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated set beside property (8): 3 rows × 2 columns. Left column = stem plots, y-axis 0..1: `x[n]` (n = −8..8, unit samples at n = −2..2); `x_(2)[n]` (n = −8..8, unit samples at n = −4,−2,0,2,4); `x_(3)[n]` (n ticks −6,−3,0,3,6, unit samples at multiples of 3). Right column = continuous curves vs w over −4π..4π, y-axis 0..4+ (peaks ≈5): `X(e^{jw})` (peaks at multiples of 2π); `X_(2)(e^{jw}) = X(e^{j2w})` (peaks at multiples of π); `X_(3)(e^{jw}) = X(e^{j3w})`. Hand-drawn red vertical arrows annotate "expansion in time" (left) and "compression in frequency" (right).
- MATLAB-generated set for the Example: 5 rows × 3 columns.
  - Col 1 stems: `g[n]` (n = −4..4, y 0..1); `y[n] = g[n−2]` (n = 0..9, y 0..1); `y_(2)[n]` (n = 0..9, y 0..1); `2y_(2)[n−1]` (n = 0..9, y 0..2); `x[n] = 2y_(2)[n−1] + y_(2)[n]` (n = 0..9, y 0..2).
  - Col 2 magnitudes vs w over −4π..4π: `|G(e^{jw})| = |sin(5w/2)/sin(w)|` (0..5); `|Y(e^{jw})| = |e^{−j2w} sin(5w/2)/sin(w)|` (0..5); `|Y_(2)(e^{jw})| = |Y(e^{j2w})| = |e^{−j4w} sin(5w)/sin(w)|` (0..5); `|2e^{−jw}Y_(2)(e^{jw})| = |2e^{−j5w} sin(5w)/sin(w)|` (0..10); `|X(e^{jw})| = |e^{−j4w}(1 + 2e^{−jw}) sin(5w)/sin(w)|` (0..15).
  - Col 3 phases vs w over −4π..4π, y-range −π..π: `∠G(e^{jw})` (flat at 0); `∠Y(e^{jw})`; `∠Y_(2)(e^{jw})`; `∠2e^{−jw}Y_(2)(e^{jw})`; `∠X(e^{jw})` — all sawtooth/wrapped.
  - Yellow highlighter marks on `y[n] = g[n−2]`, on `e^{−j2w}` in the `|Y|` title, and on `|Y(e^{j2w})|` in the `|Y_(2)|` title.

**Ambiguities**
- **A72-01**: MATLAB titles rows 1–2 print the denominator as `sin(w)` (`|G| = |sin(5w/2)/sin(w)|`). As literally printed the DC value would be 2.5, but the plotted peak is 5; the expected denominator is `sin(w/2)`. At 160 dpi the "/2" cannot be resolved — printed text is at the edge of legibility. Not corrected here.
- **A72-02**: The bottom `Example` has no written problem statement, no definition of `g[n]` in the handwriting, and no stated question — only figure panels plus one concluding equation.
- **A72-03**: Property (6) is titled "Differentiation" although the operation is a first difference; the printed summary table on p.76 calls the same property "Differencing in Time". Naming inconsistency between pages.
- **A72-04**: The shift index in (3) is written `no` (letter-o styled) rather than `n0`/`n₀`, both in `x[n − no]` and in `e^{−jw no}`.

---

## p.73 — DTFT Properties, items (9) Differentiation in Frequency, (10) Parseval's Relation, (11) Convolution Property; `Example` (convolution of two one-sided exponentials) — no red week/lecture box

**Concepts**
- Differentiation in frequency.
- Parseval's relation for aperiodic DT signals; `|X(e^{jw})|²` identified (circled, purple) as the **energy-density spectrum**. Marked with a red "!" importance stamp.
- Convolution property: "Convolution in Time Domain ≡ Multiplication in Frequency Domain". Marked with a red "!" importance stamp.
- Partial-fraction expansion + residue method for inverting a DTFT.

**Equations** (all DT)
```
(9)  n x[n] --F--> j dX(e^{jw})/dw                                            [boxed+highlighted]
(10) SUM_{n=−inf}^{inf} |x[n]|^2 = (1/2π) INT_{2π} |X(e^{jw})|^2 dw           [boxed+highlighted]
(11) y[n] = x[n] * h[n] --F--> Y(e^{jw}) = X(e^{jw}) H(e^{jw})                [boxed+highlighted]
Example:
    X(e^{jw}) = 1/(1 − a e^{−jw})   and   H(e^{jw}) = 1/(1 − b e^{−jw})
    Y(e^{jw}) = [1/(1 − a e^{−jw})]·[1/(1 − b e^{−jw})]
              = 1/[(1 − a e^{−jw})(1 − b e^{−jw})]
              = A/(1 − a e^{−jw}) + B/(1 − b e^{−jw})        : PARTIAL FRACTIONS
    A = (1 − a e^{−jw}) · 1/[(1 − a e^{−jw})(1 − b e^{−jw})] |_{e^{−jw} = 1/a}
      = 1/(1 − b(1/a)) = a/(a−b)                                              [boxed]
    B = (1 − b e^{−jw}) · 1/[(1 − a e^{−jw})(1 − b e^{−jw})] |_{e^{−jw} = 1/b}
      = 1/(1 − a/b) = b/(b−a) = −b/(a−b)                                      [boxed]
    Y(e^{jw}) = [a/(a−b)]·1/(1 − a e^{−jw}) − [b/(a−b)]·1/(1 − b e^{−jw})
    y[n] = [a/(a−b)] a^n u[n] − [b/(a−b)] b^n u[n]
         = (1/(a−b)) [ a^{(n+1)} u[n] − b^{(n+1)} u[n] ]                       [boxed]
```

**Examples**
1. `Example`: Given `x[n] = a^n u[n]` with `|a| < 1` input to an LTI system with `h[n] = b^n u[n]`, `|b| < 1` (boxed block-diagram). Asked: `y[n] = ?`. Method: DTFT of each geometric sequence, convolution property, partial fractions with residues evaluated at `e^{−jw} = 1/a` and `e^{−jw} = 1/b`, then inverse DTFT using standard pairs. Final answer exactly as written: `y[n] = (1/(a−b))[ a^{(n+1)} u[n] − b^{(n+1)} u[n] ]`.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 3 × 3 set (bottom right). Row labels on left axis: `a = 1/2`, `b = 1/4`.
  - Col 1 stems (n = 0..10, y 0..1): `x[n] = (1/2)^n`; `h[n] = (1/4)^n`; `y[n] = x[n]*h[n]`.
  - Col 2 magnitudes vs w over −4π..4π: `|X(e^{jw})|` (y 0.6..2); `|H(e^{jw})|` (y 0.9..1.3); `|Y(e^{jw})| = |X(e^{jw})H(e^{jw})|` (y 1..2.5).
  - Col 3 phases vs w over −4π..4π: `∠X(e^{jw})` (y −π/4..π/4); `∠H(e^{jw})` (y −π/8..π/8); `∠Y(e^{jw}) = ∠X(e^{jw})H(e^{jw})` (y −π/4..π/4).
  All smooth continuous curves, one period-2π-periodic ripple pattern each.

**Ambiguities**
- **A73-01**: The residue side-condition is written `e^{−Jw} = 1/2`; the "2" glyph is identical to the `a` glyph used in `a−b` and `1 − b(1/a)` on the same line, so it reads `e^{−jw} = 1/a`. Transcribed as `1/a`; the raw glyph is genuinely ambiguous between `a` and `2`.
- **A73-02**: The residues are evaluated by substituting `e^{−jw} = 1/a` and `e^{−jw} = 1/b`, i.e. treating `e^{−jw}` as a free algebraic variable outside the unit circle. This is z-transform-style bookkeeping applied inside a DTFT derivation; no caveat is written on the page.

---

## p.74 — `Example` (ideal-lowpass sinc convolution via DTFT) and `Homework` (sum of two sincs through an ideal lowpass) — no red week/lecture box

**Concepts**
- DTFT of the ideal-lowpass sinc sequence and its rectangular, 2π-periodic transform.
- Convolution property used to get the output of a cascade of two ideal lowpass filters (narrower band wins).
- Linearity/superposition of the DTFT for a sum of two sinc sequences; graphical multiplication of rectangular spectra.

**Equations** (all DT)
```
Example:
    x[n] = sin((π/2) n)/(π n)     h[n] = sin((π/4) n)/(π n)     y[n] = x[n] * h[n] = ?
    X(e^{jw}) = { 1,  |w| ≤ π/2
                { 0,  π/2 ≤ |w| ≤ π        where X(e^{jw}) is periodic by 2π.
    H(e^{jw}) = { 1,  |w| ≤ π/4
                { 0,  π/4 ≤ |w| ≤ π        where H(e^{jw}) is periodic by 2π.
    Y(e^{jw}) = X(e^{jw}) · H(e^{jw}) = { 1,  |w| ≤ π/4
                                        { 0,  π/4 ≤ |w| ≤ π  , which is periodic by 2π.
    Since  F{ sin(w0 n)/(π n) } = { 1,  |w| ≤ w0
                                  { 0,  w0 ≤ |w| ≤ π
    y[n] = sin((π/4) n)/(π n)                                                  [boxed]
Homework:
    x[n] = sin((π/4) n)/(π n) + sin((3π/4) n)/(π n)        [under-braced: = x1[n] , = x2[n]]
    h[n] = sin((π/2) n)/(π n)
    y[n] = x[n] * h[n] = ?
    Let x[n] = x1[n] + x2[n], hence X(e^{jw}) = X1(e^{jw}) + X2(e^{jw})
```

**Examples**
1. `Example`: Given `x[n] = sin((π/2)n)/(πn)` into an LTI system with `h[n] = sin((π/4)n)/(πn)` (boxed). Asked: `y[n] = x[n]*h[n] = ?`. Method: rectangular DTFTs, convolution property (product of two rectangles = narrower rectangle), inverse via the standard sinc↔rect pair. Final answer as written: `y[n] = sin((π/4)n)/(πn)`.

**Homework**
1. `Homework` (with a `Sol` worked graphically): Given `x[n] = sin((π/4)n)/(πn) + sin((3π/4)n)/(πn)` into `h[n] = sin((π/2)n)/(πn)`. Asked: `y[n] = x[n]*h[n] = ?`. Method: split `x` into `x1 + x2`, add their rectangular spectra to get a stepped spectrum, multiply by the rectangular `H`, sketch `Y(e^{jw})`. Answer given only as sketches (see Figures); no closed-form `y[n]` is written.

**Figures**
- Hand-drawn (Homework solution), all vs w with "…" indicating 2π-periodicity:
  - `X1(e^{jw})`: rectangle of height 1 on −π/4..π/4.
  - `X2(e^{jw})`: rectangle of height 1 on −3π/4..3π/4. Combined with a red ⊕.
  - `X(e^{jw})`: stepped even function — height 2 on −π/4..π/4, height 1 on −3π/4..−π/4 and π/4..3π/4; ticks marked −3π/4, −π/4, π/4, 3π/4.
  - `H(e^{jw})`: rectangle of height 1 on −π/2..π/2 (ticks −π/2, 0, π/2). Combined with a red ⊗.
  - `Y(e^{jw})`: stepped even function — height 2 on −π/4..π/4, height 1 on −π/2..−π/4 and π/4..π/2; ticks −π/2, −π/4, 0, π/4, π/2.
- MATLAB-generated 3 × 2 set for the Example (top right): stems `x[n] = sin((π/2)n)/(πn)` (n = −10..10, y 0..0.4+), `h[n] = sin((π/4)n)/(πn)` (y 0..0.2+), `y[n] = x[n]*h[n]` (y 0..0.2+); continuous plots `X(e^{jw})` (w −4π..4π, y 0..1, rectangular pulse train with ±π/2 marked), `H(e^{jw})` (±π/4 marked), `Y(e^{jw}) = X(e^{jw})H(e^{jw})` (±π/4 marked).
- MATLAB-generated 3 × 2 set for the Homework (lower right): stems `x[n] = sin((π/4)n)/(πn) + sin((3π/4)n)/(πn)` (n = −10..10, y 0..1), `h[n] = sin((π/2)n)/(πn)` (y 0..0.4+), `y[n] = x[n]*h[n]` (y 0..0.6); continuous plots `X(e^{jw})` (w −4π..4π, y 0..2, stepped, ±π/4 and ±3π/4 annotated), `H(e^{jw})` (y 0..1, ±π/2 annotated), `Y(e^{jw}) = X(e^{jw})H(e^{jw})` (y 0..2, ±π/4 and ±π/2 annotated).

**Ambiguities**
- **A74-01**: The Homework's solution stops at the spectral sketches; no closed-form `y[n]` (e.g. a sum of two sinc terms) is written anywhere on the page, so the homework answer is incomplete as recorded.
- **A74-02**: Every piecewise spectrum on this page uses overlapping endpoints, e.g. `{1, |w| ≤ π/2 ; 0, π/2 ≤ |w| ≤ π}` — the value at `|w| = π/2` (and at `π/4`, and at `|w| = w0` in the general sinc pair) is defined twice. Same pattern recurs on p.75.

---

## p.75 — DTFT Properties, item (12) Multiplication Property; `Example` (DTFT of the product of two sinc sequences) — no red week/lecture box

**Concepts**
- Multiplication property: "Multiplication in Time-Domain ≡ Convolution in Frequency Domain" (red "!" stamp), with the frequency convolution being a **periodic convolution** over one 2π interval (circled, red).
- Graphical periodic convolution of two rectangular spectra ⇒ trapezoid, then aliasing/overlap of the 2π-shifted replicas.
- Similar-triangles argument to compute the height of the overlap region.

**Equations** (all DT)
```
(12) x[n]·y[n] --F--> (1/2π) [ X(e^{jw}) * Y(e^{jw}) ]                          [boxed+highlighted]
     = (1/2π) INT_{2π} X(e^{jθ}) Y(e^{j(w−θ)}) dθ           ("2π" circled → periodic convolution)
Example:
    x[n] = sin((3π/4) n)/(π n) ,  y[n] = sin((π/2) n)/(π n) ,  z[n] = x[n] y[n]
    X(e^{jw}) = { 1,  |w| ≤ 3π/4
                { 0,  3π/4 ≤ |w| ≤ π      which is periodic by 2π.
    Y(e^{jw}) = { 1,  |w| ≤ π/2
                { 0,  π/2 ≤ |w| ≤ π       which is periodic by 2π.
    Z(e^{jw}) = (1/2π) [ X(e^{jw}) * Y(e^{jw}) ]
    Aperiodic-convolution trapezoid breakpoints:
        −3π/4 − π/2 = −5π/4 ,  −π/4 ,  0 ,  π/4 ,  3π/4 + π/2 = 5π/4   ; flat top height 1/2
        (both sloped transitions have width π, marked with green double arrows)
    Area check on the overlap rectangle:  (1/2π) INT_{−π/2}^{π/2} 1·1 dw' = 1/2
    Similar triangles for the overlap height:  x/(1/2) = (π/4)/π  →  x = 1/8   [boxed, red]
```

**Examples**
1. `Example`: Given `x[n] = sin((3π/4)n)/(πn)` and `y[n] = sin((π/2)n)/(πn)`. Asked: "Determine and plot the DTFT of `z[n] = x[n]y[n]`." Method: rectangular DTFTs, multiplication property, graphical (periodic) convolution — first the aperiodic trapezoid of width ±5π/4 and height 1/2, then explicit plotting of the three overlapping shifted replicas and their sum. Final answer: given graphically as `Z(e^{jw})` — trapezoidal-with-plateau waveform of maximum 0.5 and minimum 0.25, plus the boxed intermediate `x = 1/8`.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 3 × 2 set (upper right): stems `x1[n] = sin((3π/4)n)/(πn)` (n = −10..10, y 0..0.6+), `y[n] = sin((π/2)n)/(πn)` (y 0..0.4+), `z[n] = x[n]y[n]` (y 0..0.4); continuous `X(e^{jw})` (w −4π..4π, y 0..1, ±3π/4 annotated), `Y(e^{jw})` (±π/2 annotated), `Z(e^{jw}) = (1/2π)[X(e^{jw}) * Y(e^{jw})]` (y 0..0.5, ±π/4 and ±3π/4 annotated, trapezoidal).
- Hand-drawn convolution sketch: `(1/2π)[ rect of height 1 on ±π/2 ] * [ rect of height 1 on ±3π/4 ] = trapezoid` with breakpoints −5π/4, −π/4, 0, π/4, 5π/4 and flat-top height 1/2.
- Hand-drawn purple call-out (right): the same trapezoid's flat region redrawn with two unit rectangles (edges −3π/4, −π/2, π/2, 3π/4), yellow-shaded overlap, and the area integral `(1/2π)∫_{−π/2}^{π/2} 1·1 dw' = 1/2`.
- Second purple call-out: two sliding-rectangle diagrams over `w'` with ticks −3π/4 and 3π/4 showing the overlap shrinking by π.
- MATLAB-generated 5-row stack "The overlapping components are plotted as:" — all vs w from −2π to 2π, y 0..0.5, with ticks at −7π/4, −5π/4, −π, −3π/4, −π/4, 0, π/4, 3π/4, π, 5π/4, 7π/4, 2π:
  - Row 1: replica falling from 0.5 to 0 between −2π and −3π/4 (rest zero).
  - Row 2: centre trapezoid, 0.5 plateau on −π/4..π/4, zero outside ±5π/4.
  - Row 3: replica rising from 0 to 0.5 between 3π/4 and 2π.
  - Row 4: all three superimposed (blue/orange/yellow), with two red boxes annotated `1/8` around −5π/4..−3π/4 and 3π/4..5π/4, red "symmetry" braces, and a red note "Due to the symmetry this point is π"; y ticks 0, 0.25, 0.5.
  - Row 5: the sum `Z(e^{jw})` — 0.5 plateau near 0, dipping to 0.25 near ±π.
- Hand-drawn right-corner triangle for the similar-triangles argument: legs labelled `3π/4` and `π/4`, height `1/2`, unknown `x`; result boxed `x = 1/8`.

**Ambiguities**
- **A75-01**: In the hand-drawn "Note that" convolution the first rectangle is drawn with edges ±π/2 and the second with ±3π/4, i.e. the drawing order is `Y * X` while the written expression is `(1/2π)[X * Y]`. Neither rectangle carries an `X`/`Y` label, so identification rests only on the edge values. (Result unaffected — convolution is commutative — but the labelling is absent.)
- **A75-02**: The similar-triangle sketch at bottom right places `3π/4` and `π/4` on the same baseline with no vertex marks, so which leg is the base of which triangle is not determinable from the drawing alone; only the written ratio `x/(1/2) = (π/4)/π` fixes it. Note also the ratio uses `π` in the denominator while the sketch labels `3π/4` — the correspondence is not explained.
- **A75-03**: Piecewise spectra again use overlapping endpoints (`1` for `|w| ≤ 3π/4` and `0` for `3π/4 ≤ |w| ≤ π`).

---

## p.76 — `Homework` (DTFT of products, two cases) and "Summary of the Properties" (printed Table 5 and Table 6) — no red week/lecture box

**Concepts**
- Applying the multiplication property to two different product signals: sinc × sinc (periodic convolution ⇒ triangle) and sinc × cosine (convolution with a pair of impulses ⇒ two shifted copies, i.e. modulation).
- Sifting/shift identity for convolution with an impulse in frequency.
- Summary tables of all DTFT properties and standard DTFT pairs.

**Equations** (all DT)
```
Left case:
    (1/2π)[ X(e^{jw}) * Y(e^{jw}) ] with X, Y both rectangles of height 1 on ±π/2
        ⇒ triangle of peak (1/2π)·π = 1/2 , support −π .. π
Right case:
    Z(e^{jw}) = (1/2π) [ X(e^{jw}) * { π δ(w + π/3) + π δ(w − π/3) } ]
    Since  X(e^{jw}) * δ(w − w0) = X(e^{j(w − w0)})                              [boxed, green]
    = (1/2) X(e^{j(w + π/3)}) + (1/2) X(e^{j(w − π/3)})
    Note that X(e^{jw}) is a rectangle of height 1 on −π/4 .. π/4.
Printed Table 5 (Properties of the DTFT), header formulas:
    x[n] = (1/2π) INT_{2π} X(e^{jw}) e^{jwn} dw
    X(e^{jw}) = SUM_{n=−inf}^{+inf} x[n] e^{−jwn}
    Rows: Linearity; Time-Shifting; Frequency-Shifting; Conjugation; Time Reversal;
    Time Expansion; Convolution; Multiplication; Differencing in Time; Accumulation;
    Differentiation in Frequency; Conjugate Symmetry for Real Signals; Symmetry for Real,
    Even Signals; Symmetry for Real, Odd Signals; Even-odd Decomposition of Real Signals.
    Accumulation row:  SUM_{k=−inf}^{n} x[k]  <-->  (1/(1 − e^{−jw})) X(e^{jw})
                                                     + π X(e^{j0}) SUM_{k=−inf}^{+inf} δ(w − 2πk)
    Parseval's Relation for Aperiodic Signals:
        SUM_{n=−inf}^{+inf} |x[n]|^2 = (1/2π) INT_{2π} |X(e^{jw})|^2 dw
Printed Table 6 (Basic DTFT Pairs) — includes, among others:
    a^n u[n], |a| < 1        <-->  1/(1 − a e^{−jw})
    x[n] = {1, |n| ≤ N1 ; 0, |n| > N1}  <-->  sin[w(N1 + 1/2)]/sin(w/2)
    sin(Wn)/(πn) = (W/π) sinc(Wn/π)     <-->  X(w) = {1, 0 ≤ |w| ≤ W ; 0, W < |w| ≤ π},
                                              X(w) periodic with period 2π      (0 < W < π)
    δ[n]  <-->  1
    u[n]  <-->  1/(1 − e^{−jw}) + SUM_{k=−inf}^{+inf} π δ(w − 2πk)
    δ[n − n0]  <-->  e^{−jwn0}
    (n + 1) a^n u[n], |a| < 1  <-->  1/(1 − a e^{−jw})^2
    [(n + r − 1)!/(n!(r − 1)!)] a^n u[n], |a| < 1  <-->  1/(1 − a e^{−jw})^r
```

**Examples**
- None tagged `Example` on this page.

**Homework**
1. `Homework` (with a `Sol`): "Determine and plot the DTFT of `z[n] = x[n]·y[n]` signals plotted below." Two cases given as MATLAB panels.
   - Case 1 (left): `x[n] = sin((π/2)n)/(πn)`, `y[n] = sin((π/2)n)/(πn)`. Method: multiplication property, periodic convolution of two identical rectangles of height 1 on ±π/2. Answer (graphical): `Z(e^{jw})` is a triangular wave of peak `(1/2π)·π = 1/2`, zero at ±π, 2π-periodic.
   - Case 2 (right): `x[n] = sin((π/4)n)/(πn)`, `y[n] = cos((π/3)n)`. Method: convolution with the impulse pair `πδ(w + π/3) + πδ(w − π/3)` and the shift identity. Answer as written: `Z(e^{jw}) = (1/2)X(e^{j(w + π/3)}) + (1/2)X(e^{j(w − π/3)})`, plotted as two rectangles of height 0.5, one on `−π/3 − π/4 = −7π/12 .. −π/3 + π/4 = −π/12`, the other on `π/3 − π/4 = π/12 .. π/3 + π/4 = 7π/12`, repeated with period 2π.

**Figures**
- MATLAB-generated 3 × 2 set (left case): stems `x[n] = sin((π/2)n)/(πn)` (n = −10..10, y 0..0.4+), `y[n] = sin((π/2)n)/(πn)`, `z[n] = x[n]y[n]` (y 0..0.2); continuous `X(e^{jw})` and `Y(e^{jw})` (w −4π..4π, y 0..1, ±π/2 annotated), `Z(e^{jw}) = (1/2π)[X(e^{jw}) * Y(e^{jw})]` (y 0..0.5, triangular wave).
- MATLAB-generated 3 × 2 set (right case): stems `x[n] = sin((π/4)n)/(πn)` (y 0..0.2+), `y[n] = cos((π/3)n)` (y −1..1), `z[n] = x[n]y[n]` (y 0..0.2); continuous `X(e^{jw})` (y 0..1, ±π/4 annotated), `Y(e^{jw})` (impulse train, y 0..π, ±π/3 annotated), `Z(e^{jw})` (y 0..0.5, narrow rectangles, annotated −7π/12, −π/12, π/12, 7π/12).
- Hand-drawn: rectangle-convolution sketch (two unit rectangles on ±π/2 giving a triangle of peak 1/2 on −π..π); the `X(e^{jw})` unit rectangle on ±π/4; the final `Z(e^{jw})` axis plot with two 0.5-height rectangles centred at ∓π/3 with the four breakpoint computations written under the axis.
- Printed textbook tables: TABLE 5 "Properties of the Discrete-Time Fourier Transform" and TABLE 6 "Basic Discrete-Time Fourier Transform Pairs" (with a Fourier-series-coefficient column).

**Ambiguities**
- **A76-01**: In `Z(e^{jw}) = (1/2π)[X(e^{jw}) * {πδ(w + π/3) + πδ(w − π/3)}]` and in the following line `(1/2)X(e^{j(w+π/3)}) + (1/2)X(e^{j(w−π/3)})`, several of the "3" glyphs in `π/3` read as `8`/`5`. The value `π/3` is confirmed only indirectly from `y[n] = cos((π/3)n)` and from the plotted breakpoints ±π/12, ±7π/12.
- **A76-02**: The boxed identity `X(e^{jw}) * δ(w − w0) = X(e^{j(w − w0)})` is stated without the `1/2π`/periodic-convolution qualifier used on p.75, and without noting the 2π-periodicity of the impulse train that `cos((π/3)n)` actually has.
- **A76-03**: Tables 5 and 6 are printed at a size where several entries (particularly the "Fourier series coefficients (if periodic)" column of Table 6 and the exponents in the last two pair rows) are at or below reliable legibility at 160 dpi; entries transcribed above are the legible ones only.

---

## p.77 — "DUALITY" (duality in the DFS; duality between DTFT and CTFS); printed TABLE 5.3; new section "SYSTEM ANALYSIS USING DTFT" — red box: **Week12—Lec2**

**Concepts**
- There is **no** duality between the DTFT analysis and synthesis equations.
- Duality within the discrete Fourier series (DFS).
- Duality between the DTFT and the continuous-time Fourier series (CTFS), for a CT signal periodic by 2π.
- Printed summary Table 5.3 relating CT/DT, time/frequency, periodic/aperiodic, with duality arrows; hand annotation "CH#4" circled in red beside the CT Fourier-transform duality arrow.
- General linear constant-coefficient difference equation for an LTI system; applying the DTFT to both sides using linearity + time shifting.

**Equations** (mixed CT/DT as marked)
```
No duality between (DT):
    X(e^{jw}) = SUM_{n=−inf}^{inf} x[n] e^{−jwn}      [boxed]
    x[n] = (1/2π) INT_{2π} X(e^{jw}) e^{jwn} dw       [boxed]
Duality in Discrete Fourier Series (DT):                                        [boxed]
    x[n] --FS--> a_k = a[k]
    a[n] --FS--> (1/N) x[−k]
Duality between DTFT and CTFS:                                                  [boxed]
    x(t) periodic by 2π :  x(t) --FS--> a_k = a[k]           (CT)
    a[n] --F--> x(−w)                                        (DT)
General difference equation (DT):                                               [boxed]
    SUM_{k=0}^{N} a_k y[n−k] = SUM_{k=0}^{M} b_k x[n−k]
After DTFT (DT):                                                                [boxed]
    SUM_{k=0}^{N} a_k e^{−jwk} Y(e^{jw}) = SUM_{k=0}^{M} b_k e^{−jwk} X(e^{jw})
    with (green box):  F{ y[n−k] } = e^{−jwk} Y(e^{jw})
```

**Examples**
- None tagged `Example` on this page.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 2 × 2 set (left, DFS duality), red hand annotation `N = 21`: stem `x[n]` (n ticks −28,−21,−14,−7,0,7,14,21,28; y 0..1; periodic rectangular bursts); stem `a_k = a[k]` (k −40..40, y −0.1..0.3); stem `a[n]` (n −40..40, y −0.1..0.3); stem `b_k = (1/N)x[−k]` (k ticks −28..28, y 0..0.05, arrow annotation `1/21`).
- MATLAB-generated 2 × 2 set (right, DTFT/CTFS duality): continuous `x(t)` (t −3π..3π, y 0..1, square wave, ±π/2 annotated); stem `a_k = a[k]` (k −10..10, y −0.2..0.6); stem `a[n]` (n −10..10, y −0.2..0.6); continuous `x(−w)` (w −3π..3π, y 0..1, square wave).
- Printed TABLE 5.3 "SUMMARY OF FOURIER SERIES AND TRANSFORM EXPRESSIONS" — 2 × 2 grid (Continuous time / Discrete time × Fourier Series / Fourier Transform) with time- and frequency-domain formulas and "duality" arrows; hand-circled red "CH#4".

**Ambiguities**
- **A77-01**: The DTFT/CTFS duality box writes `a[n] --F--> x(−w)`, reusing the symbol `x` for both the CT periodic signal `x(t)` and the resulting DT transform; the meaning ("the same functional form evaluated at −ω") is not stated.
- **A77-02**: The bottom-left MATLAB y-label reads `b_k = (1/N)x[−k]` at a size that is only marginally legible at 160 dpi; the `1/21` call-out arrow is legible but the axis label itself is near the resolution limit.
- **A77-03**: `a_k` in the difference equation uses the `a`-as-`2` glyph, so `a_k y[n−k]` could be misread as `2_k y[n−k]`; context (`b_k` on the right side) resolves it.

---

## p.78 — Frequency response from a difference equation; `Example` (causal 2nd-order difference equation ⇒ h[n]) — no red week/lecture box

**Concepts**
- Frequency response of an LTI system as the ratio of the DTFT polynomials in `e^{−jw}`.
- Solving for `h[n]` from a difference equation: DTFT both sides, factor, partial fractions, residue method, inverse via the geometric pair.

**Equations** (all DT)
```
H(e^{jw}) = Y(e^{jw})/X(e^{jw}) = [ SUM_{k=0}^{M} b_k e^{−jwk} ] / [ SUM_{k=0}^{N} a_k e^{−jwk} ]   [boxed]
Example:
    y[n] − (3/4) y[n−1] + (1/8) y[n−2] = 2 x[n]
    Y(e^{jw}) − (3/4) e^{−jw} Y(e^{jw}) + (1/8) e^{−j2w} Y(e^{jw}) = 2 X(e^{jw})
    Y(e^{jw}) [ 1 − (3/4) e^{−jw} + (1/8)(e^{−jw})^2 ] = 2 X(e^{jw})
    H(e^{jw}) = Y/X = 2/[1 − (3/4)e^{−jw} + (1/8)(e^{−jw})^2]
                    = 2/[ (1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw}) ]
    H(e^{jw}) = A/(1 − (1/2)e^{−jw}) + B/(1 − (1/4)e^{−jw})     : PARTIAL FRACTIONS
    A = (1 − (1/2)e^{−jw}) · 2/[(1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw})] |_{e^{−jw} = 2}
      = 2/(1 − (1/4)·2) = 4                                                    [boxed]
    B = (1 − (1/4)e^{−jw}) · 2/[(1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw})] |_{e^{−jw} = 4}
      = 2/(1 − (1/2)·4) = −2                                                   [boxed]
    H(e^{jw}) = 4 · 1/(1 − (1/2)e^{−jw}) − 2 · 1/(1 − (1/4)e^{−jw})            [boxed]
    Since F{ a^n u[n] } = 1/(1 − a e^{−jw}) :
    h[n] = 4 (1/2)^n u[n] − 2 (1/4)^n u[n]                                     [boxed, green]
```

**Examples**
1. `Example`: Given a causal LTI system with `y[n] − (3/4)y[n−1] + (1/8)y[n−2] = 2x[n]`. Asked (implicit): find `H(e^{jw})` and `h[n]`. Method: DTFT of both sides, factor the quadratic in `e^{−jw}`, partial fractions with residues at `e^{−jw} = 2` and `e^{−jw} = 4`, inverse using the geometric pair. Final answers as written: `A = 4`, `B = −2`, `H(e^{jw}) = 4/(1 − (1/2)e^{−jw}) − 2/(1 − (1/4)e^{−jw})`, `h[n] = 4(1/2)^n u[n] − 2(1/4)^n u[n]`.

**Homework**
- None on this page.

**Figures**
- None on this page.

**Ambiguities**
- **A78-01**: The residues are again obtained by substituting `e^{−jw} = 2` and `e^{−jw} = 4` — values with modulus ≠ 1, impossible for `e^{−jw}` with real `w`. This is formally a z-domain residue evaluation; no caveat is written.

---

## p.79 — `Example` (output of the p.78 system for `x[n] = (1/4)^n u[n]`; repeated-pole partial fractions) — no red week/lecture box

**Concepts**
- Convolution property + partial fractions with a **repeated** factor.
- Residue method for the repeated-root coefficients (highest power first), and finding the remaining coefficient by clearing denominators and evaluating at `e^{−jw} = 0`.
- Inverse DTFT with the `(n+1)a^n u[n]` pair.

**Equations** (all DT)
```
F{ x[n] = (1/4)^n u[n] } = X(e^{jw}) = 1/(1 − (1/4) e^{−jw})
H(e^{jw}) = 2/[ (1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw}) ]
Y(e^{jw}) = 2/[ (1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw})^2 ]
          = A/(1 − (1/4)e^{−jw}) + B/(1 − (1/4)e^{−jw})^2 + C/(1 − (1/2)e^{−jw})   : PARTIAL FRACTIONS
B = (1 − (1/4)e^{−jw})^2 · 2/[(1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw})^2] |_{e^{−jw} = 4}
  = 2/(1 − (1/2)·4) = −2                                                        [boxed]
C = (1 − (1/2)e^{−jw}) · 2/[(1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw})^2] |_{e^{−jw} = 2}
  = 2/(1 − (1/4)·2)^2 = 8                                                       [boxed]
Clearing denominators:
    2 = A (1 − (1/2)e^{−jw})(1 − (1/4)e^{−jw}) − 2 (1 − (1/2)e^{−jw}) + 8 (1 − (1/4)e^{−jw})^2
Assume that e^{−jw} = 0, then  2 = A − 2 + 8  →  A = −4                          [boxed]
Y(e^{jw}) = −4 · 1/(1 − (1/4)e^{−jw}) − 2 · 1/(1 − (1/4)e^{−jw})^2 + 8 · 1/(1 − (1/2)e^{−jw})   [boxed, green]
y[n] = −4 (1/4)^n u[n] − 2 (n+1) (1/4)^n u[n] + 8 (1/2)^n u[n]                   [boxed, green]
Note that,  (n+1) a^n u[n] --F--> 1/(1 + a e^{−jw})^n                            [purple call-out — see A79-01]
```

**Examples**
1. `Example`: Given `x[n] = (1/4)^n u[n]` and `h[n] = 4(1/2)^n u[n] − 2(1/4)^n u[n]` (i.e. the system of p.78). Asked: "what should be the output `y[n]`". Method: DTFT of `x` and `h`, convolution property, partial fractions with a double factor, residues for `B` and `C`, `A` by clearing denominators and setting `e^{−jw} = 0`, then inverse DTFT. Final answer as written: `y[n] = −4(1/4)^n u[n] − 2(n+1)(1/4)^n u[n] + 8(1/2)^n u[n]`.

**Homework**
- None on this page.

**Figures**
- None on this page.

**Ambiguities**
- **A79-01**: The purple call-out reads `(n+1) a^n u[n] --F--> 1/(1 + a e^{−jw})^n`. Both the sign (`+` instead of `−`) and the exponent (`n` instead of `2`) contradict the standard pair and the pair actually needed to produce the `−2(n+1)(1/4)^n u[n]` term (which requires `1/(1 − a e^{−jw})^2`, as printed correctly in Table 6 on p.76). Recorded verbatim; not corrected.
- **A79-02**: The first line of the problem statement runs off the right edge of the page: "...if the impulse response of the system i" — the truncated character(s) at the margin are unreadable; the sentence resumes as "is defined by" on the next line.
- **A79-03**: `A` is obtained by "Assume that `e^{−jw} = 0`" — an unattainable value for `e^{−jw}`; again a formal algebraic substitution presented without caveat (same class of issue as A73-02, A78-01).
- **A79-04**: The ordering of the partial-fraction terms places `A` over the single `(1 − (1/4)e^{−jw})` factor and `C` over `(1 − (1/2)e^{−jw})`, i.e. `A` and `C` are attached to different poles than the alphabetical order of the residue derivations (B and C are computed before A). Not an error, but the mapping must be read carefully.

---

## p.80 — **CH#7 — SAMPLING THEOREM**: Impulse-Train Sampling; Frequency Domain Analysis of A/D Conversion — red box: **Week13—Lec1**

**Concepts**
- Statement of purpose of the sampling theorem: minimum sampling rate to convert CT → DT.
- Under certain conditions a CT signal can be completely recovered from a sequence of its samples (representation of CT signals by DT signals).
- Impulse-train sampling; the **sampling property** of the impulse.
- A/D conversion block diagram: multiplication of `x(t)` by an impulse train `p(t)` of period `T`.
- `x_p(t)` is a set of impulses bounded by the envelope of `x(t)`; `x_p(t)` is still a CT signal, whereas `x_p[n] = x(nT)` is its DT version.
- Frequency-domain analysis via the CTFT multiplication property; CTFT of an impulse train.

**Equations** (CT unless noted)
```
p(t) = SUM_{n=−inf}^{inf} δ(t − nT)                     ("Impulse Train with period T")   [boxed]
x_p(t) = x(t) p(t) = x(t) SUM_{n=−inf}^{inf} δ(t − nT) = SUM_{n=−inf}^{inf} x(nT) δ(t − nT)
    since x(t) δ(t − nT) = x(nT) δ(t − nT)   : Sampling Property
x_p[n] = x(nT)     (DT version of the sampled signal)                                   [boxed]
X_p(jw) = (1/2π) [ X(jw) * P(jw) ]                                                      [boxed]
P(jw) = (2π/T) SUM_{k=−inf}^{inf} δ( w − (2π/T) k )                                     [boxed]
```

**Examples**
- None tagged `Example` on this page.

**Homework**
- None on this page.

**Figures**
- Hand-drawn "Sampling Property" sketch: a smooth `x(t)` curve with a vertical impulse arrow labelled `δ(t − t0)`, a red dot on the curve labelled `x(t0)`, and `t0` marked on the `t` axis.
- Hand-drawn A/D conversion block diagram (boxed): `x(t) → ⊗ → x_p(t)`, with `p(t) = SUM_{n=−inf}^{inf} δ(t − nT)` into the multiplier; `T` circled in green with the note "Impulse Train with period T".
- MATLAB-generated 3-row set (top right), all vs `t`: `x(t)` continuous, t from −4 to 4, y 0..2, oscillatory envelope; `p(t)` impulse train (triangular-headed stems, height 1) at t = −4T..4T; overlay of `x(t)` (blue curve) and `x_p(t)` (red triangular-headed stems) over −4T..4T, y 0.5..2, with individual samples annotated `x(−4T)`, `x(−3T)`, `x(−2T)`, `x(−T)`, `x(0)`, `x(T)`, `x(2T)`, `x(3T)`, `x(4T)`, plus a legend `x(t)` / `x_p(t)`.
- MATLAB-generated pair (middle): `x_p(t)` vs `t` (impulse stems at −4T..4T, y 0.5..2) and `x_p[n] = x(nT)` vs `n` (round-headed stems at n = −4..4, y 0.5..2) — same heights, different abscissa.

**Ambiguities**
- **A80-01**: In the "Sampling Property" sketch the impulse arrow is drawn coincident with the vertical axis while the abscissa label `t0` sits at that same position, so it is not visually distinguishable whether `t0 = 0` or the axis has simply been drawn at `t0`.
- **A80-02**: In the MATLAB `x_p(t)` panels the impulses are plotted with heights equal to `x(nT)`; for a true impulse train those numbers are areas, not heights. The distinction is never stated, and the same heights are reused for the DT plot `x_p[n]`.

---

## p.81 — Derivation of `X_p(jw)`; oversampling / Nyquist-rate / undersampling spectra; ideal-lowpass reconstruction — no red week/lecture box

**Concepts**
- Periodic replication of `X(jw)` produced by impulse-train sampling.
- `T`: sampling period; `2π/T`: sampling frequency.
- Effect of increasing `T`: fewer samples, replicas move closer, eventually overlap ⇒ **aliasing**.
- Guard band; ideal lowpass reconstruction filter of gain `T` with cutoff `wc`; exact recovery condition.
- Sampling + reconstruction block diagram.

**Equations** (CT)
```
X_p(jw) = (1/2π) INT_{−inf}^{inf} X(jθ) P(j(w − θ)) dθ
        = (1/2π) INT_{−inf}^{inf} X(jθ) [ (2π/T) SUM_{k=−inf}^{inf} δ( (w − θ) − (2π/T) k ) ] dθ
        = (1/T) SUM_{k=−inf}^{inf} INT_{−inf}^{inf} X(jθ) δ( (w − (2π/T)k) − θ ) dθ     : Sifting Property
        = (1/T) SUM_{k=−inf}^{inf} X( j(w − (2π/T) k) )       [boxed+highlighted; "Periodic replicates of X(jw)"]
    T : sampling period      and      2π/T : sampling frequency                 [highlighted]
Oversampling:      ws > 2wm ;  wm < ws − wm  →  ws > 2wm
Nyquist rate:      ws = 2wm                                          ("Perfect sampling")
Undersampling:     ws < 2wm ;  ws − wm < wm  →  ws < 2wm             (replicas overlap; ALIASING)
    In the undersampling case:  X_p(jw) H_LP(w) ≠ X(jw)  !
If ws ≥ 2wm, x(t) can be recovered exactly from x_p(t) using an ideal lowpass filter with
gain T and a cutoff frequency in  wm < wc < ws − wm :
    X_p(jw) · H_LP(jw) = X_r(jw) = X(jw)  --F^{-1}-->  x_r(t) = x(t)            [boxed]
```

**Examples**
- None tagged `Example` on this page.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 4-row spectral stack, all vs `ω`, triangular `X(jw)` of height `A` (rows 2–4 height `A/T_i`):
  - Row 1: `X(jω)` — single triangle, zero outside ±ω_m; hand purple note "Bandwidth of x(t)" pointing at `ω_m`.
  - Row 2 (hand-labelled `ws > 2wm`, "OVERSAMPLING"): replicas at ticks `−ω_s − ω_m`, `−ω_s = −2π/T_1`, `−ω_s + ω_m`, `0`, `ω_m`, `ω_s − ω_m`, `ω_s = 2π/T_1`, `ω_s + ω_m`; non-overlapping; red rectangle `H_LP(w)` of gain `T_1` with edges `−wc` and `wc` drawn on top; green ellipse + arrow labelled "Guard Band"; green note "Replicas of X(jw) do not overlap"; red note `wm < ws − wm → ws > 2wm` (highlighted blue).
  - Row 3 (`ws = 2wm`, "NYQUIST RATE SAMPLING"): replicas exactly touching; ticks `−ω_s = −2π/T_2`, `−ω_s + ω_m = −ω_m`, `0`, `ω_m = ω_s − ω_m`, `ω_s = 2π/T_2`; green note "Perfect sampling"; blue-highlighted `ws = 2wm`.
  - Row 4 (`ws < 2wm`, "UNDERSAMPLING"): overlapping replicas drawn in several colours with four red ellipses and yellow highlight marked "ALIASING"; ticks `−2ω_s`, `−ω_s = −2π/T_3`, `0`, `ω_s`, `2ω_s`; green note "Replicas of X(jw) overlap!"; red note `ws − wm < wm → ws < 2wm`.
  - Row 5: the same aliased spectrum with a red `H_LP(w)` rectangle (edges `−wc`, `wc`) and the red note "By using a lowpass filter `X_p(jw) H_LP(w) ≠ X(jw)` !".
- Printed block diagram (bottom): dashed "Sampling" box — `x(t) → ⊗ → x_p(t)` with `p(t) = SUM_{n=−inf}^{inf} δ(t − nT)`; dashed "Reconstruction" box — `H_LP(jω)` (rectangle of height `T` on `−ω_c..ω_c`) → `x_r(t)`.

**Ambiguities**
- **A81-01**: The undersampling annotation is written `ws − wm < wn` — the final subscript reads `n` rather than `m`; the intended relation is `ws − wm < wm` (as the following implication `→ ws < 2wm` requires).
- **A81-02**: The recovery condition is stated once as `ws ≥ 2wm` in the text but as `ws > 2wm` on the figure (row 2) and `ws = 2wm` is separately called "Perfect sampling" — whether equality is admissible is inconsistent between the two statements.

---

## p.82 — "Sampling Theorem" statement; `Example` (MATLAB T1/T2/T3 sampling illustration); `Example` 7.3 (Nyquist rates, part (a)); `Homework` (guard band) — no red week/lecture box

**Concepts**
- Formal statement of the sampling theorem for band-limited `x(t)`.
- Trade-off "as T increases, we take low number of samples" ⇔ "as T increases, `ws = 2π/T` decreases".
- Nyquist rate definition (textbook Problem 7.3): the frequency that must be exceeded by the sampling frequency.
- Computing `wM`, `ws` and `Ts` for elementary signals; drawing the replicated impulse spectrum.
- Guard band (homework extension).

**Equations** (CT)
```
Sampling Theorem: Let x(t) be a band-limited signal with X(jw) = 0 for |w| > wm. Then x(t) is
uniquely determined by its samples x(nT), n = 0, ±1, ±2, ..., if
    ws > 2wm    where    ws = 2π/T                                              [both boxed]
Given these samples, we can construct x(t) by generating a periodic impulse train in which
successive impulses have the amplitudes that are successive sample values. This impulse train
is then processed through an ideal lowpass filter with gain T and cutoff frequency
    wm < wc < ws − wm .   The resulting output signal will exactly equal to x(t).

Example (MATLAB illustration), x(t) = (sin(πt)/(πt))^2 :
    T1 = 0.40 :  Guard Band = π ,  ws = 5π > 2(2π)
    T2 = 0.50 :  −2π = −wc , wc = 2π (4π circled) ,  ws = 2wm   (NYQUIST SAMPLING RATE)
    T3 = 0.67 :  ws = 3π < 2(2π)   → ALIASING
    Xp(jw) sketch: replicas of height 1/T at −2wM, −wM, 0, wM, ws = 2wM ;
                   H_LP(w) rectangle of gain T ; recovered X(jw) of height 1 on −wM..wM

Example 7.3(a):  x(t) = 1 + cos(2,000πt) + sin(4,000πt)
    X(jw) impulses:  (−π/j) at −4000π ;  (π) at −2000π ;  (2π) at 0 ;  (π) at 2000π ;  (π/j) at 4000π
    wM = 4000π  (circled)
    Nyquist sampling rate:  ws = 2 wM = 2·(4000π) = 8000π                       [boxed]
    ws = 2π/Ts  →  8000π = 2π/Ts  →  Ts = 1/4000 s = 0.25 ms                    [boxed]
```

**Examples**
1. `Example` (top): Given `x(t) = (sin(πt)/(πt))^2` (MATLAB), sampled at `T1 = 0.40`, `T2 = 0.50`, `T3 = 0.67`. Asked (implicit): show the effect of increasing `T`. Method: compare `ws = 2π/T` with `2wm = 4π` and inspect replica overlap. Answers as written: `T1`: `ws = 5π > 2(2π)` (guard band = π, no aliasing); `T2`: `ws = 2wm` (Nyquist sampling rate); `T3`: `ws = 3π < 2(2π)` (ALIASING, highlighted yellow on the overlapping regions).
2. `Example` 7.3 (printed textbook problem): "Determine the Nyquist rate corresponding to each of the following signals: (a) `x(t) = 1 + cos(2,000πt) + sin(4,000πt)`; (b) `x(t) = sin(4,000πt)/(πt)`; (c) `x(t) = (sin(4,000πt)/(πt))^2`." Part (a) solved here. Method: sketch `X(jw)` as impulses, read `wM`, apply `ws = 2wM`, convert to `Ts`. Final answers as written: `ws = 8000π`, `Ts = 0.25 ms`. Parts (b) and (c) are solved on p.83.

**Homework**
1. `Homework` (red-boxed, tied to Example 7.3): "Apply a guard band of `wg = 1000π`." No solution given on this page.

**Figures**
- MATLAB-generated 4 × 2 set (top): left column vs `t`, right column vs `ω`.
  - Row 1: `x(t) = (sin(πt)/(πt))^2`, t = −3..3, y 0..1; `X(jω)`, ω = −6π..6π, y 0..1, single triangle, `2π` circled in red and labelled `wM`; red `F^{-1}` arrow between them.
  - Row 2: `T1 = 0.40` — samples (red dots) on `x(t)` at t = −2.8..2.8 step 0.4; `X_p(jω)`, y 0..2.5, non-overlapping triangles, red `H_LP(w)` rectangle, hand notes "Guard Band = π", `T1 = 0.4`, `wc`, `ws = 5π > 2(2π)`.
  - Row 3: `T2 = 0.50` — samples at t = −3..3 step 0.5; `X_p(jω)`, y 0..2, triangles just touching, red `H_LP(w)`, `T2 = 0.5`, `−2π = −wc`, `wc = 2π`, `4π` circled, `ws = 2wm (NYQUIST SAMPLING RATE)`.
  - Row 4: `T3 = 0.67` — samples at t = −2.6667..2.6667 step 0.6667; `X_p(jω)`, y 0..1.5, overlapping triangles with two yellow-highlighted boxes labelled "ALIASING", `ws = 3π < 2(2π)`.
  - Left red arrow "As T increases, we take low number of samples"; right red arrow "As T increases, `ws = 2π/T` decreases!".
- Hand-drawn `X_p(jw)` schematic: triangles of height `1/T` centred at `−2wM`, `0`, `ws = 2wM`, with a red `H_LP(w)` rectangle of gain `T` on `−wM..wM`, arrow to the recovered `X(jw)` triangle of height 1 on `−wM..wM`.
- Hand-drawn `X(jw)` impulse diagram for 7.3(a): arrows at `−4000π` (down, `(−π/j)`), `−2000π` (`(π)`), `0` (`(2π)`), `2000π` (`(π)`), `4000π` (`(π/j)`), with `4000π` circled in red and labelled `wM`.
- Hand-drawn `X_p(jw)` replica diagram for 7.3(a), colour-coded: blue "1st replica" (centred `−8000π`): `−12000π` down `(−4000 π/j)`, `−10000π` `(4000π)`, `−8000π` `(8000π)`, `−6000π` `(4000π)`, `−4000π` up `(4000 π/j)`; orange "2nd replica" (centred `0`): `−4000π` down `(−4000 π/j)`, `−2000π` `(4000π)`, `0` `(8000π)`, `2000π` `(4000π)`, `4000π` up `(4000 π/j)`; green "3rd replica" (centred `8000π`): `4000π` down `(−4000 π/j)`, `6000π` `(4000π)`, `8000π` `(8000π)` (`8000π` circled and labelled `ws`), `10000π` `(4000π)`, `12000π` up `(4000 π/j)`.

**Ambiguities**
- **A82-01**: At `w = −4000π` (and at `w = +4000π`) the replica diagram superposes two coincident arrows of equal magnitude and opposite direction — `(4000 π/j)` up from one replica and `(−4000 π/j)` down from the neighbouring one. As drawn they cancel exactly (sampling at precisely `ws = 2wM` annihilates the sine component). The notes draw both arrows but state no conclusion about the cancellation.
- **A82-02**: The three replica groups are labelled "1st replica", "2nd replica", "3rd replica", but the middle group is the baseband spectrum centred at `w = 0`, not a replica. The numbering does not match standard usage.
- **A82-03**: Row 3 of the top figure carries both `−2π = −wc` (with `−2π` struck through in the printed tick area) and `wc = 2π` with `4π` circled in red; the intended cutoff for the `T2 = 0.50` case is therefore ambiguous between `2π` and `4π`.
- **A82-04**: The `Example` 7.3 statement is printed textbook material; the handwritten `Sol` covers only part (a) here, and there is no marker on the page indicating that (b) and (c) continue on the next page.

---

## p.83 — Example 7.3 parts (b) and (c); new section "Reconstruction of a Signal From Its Samples: Zero-Order Hold (ZOH)" — no red week/lecture box

**Concepts**
- Nyquist rate and sampling period for a sinc and for a sinc-squared signal; height of the replicated spectrum `= (peak of X)/T`.
- Triangular spectrum of `(sin(Wt)/(πt))^2` obtained by convolving two rectangles.
- Zero-order hold: sample and hold until the next sampling instant; easier to implement than an impulse train.
- ZOH block diagram with a compensating reconstruction filter `H_r(jω)`; ideal `H_r` is hard to implement in practice.
- ZOH output is often an adequate approximation to the original signal.

**Equations** (CT)
```
(b)  X(jw) = 1 on −4000π .. 4000π  (rectangle of height 1) ,  wM = 4000π (circled)
     X_p(jw) : replicas of height 1/T = 4000 at spacing 8000π
        (ticks −12000π, −8000π, −4000π, 0, 4000π, 8000π [circled, = ws], 12000π)
     Nyquist rate:  ws = 2 wM = 2(4000π) = 8000π                                 [boxed]
     Ts = 2π/ws = 2π/(8000π) = 0.25 s                                            [boxed — see A83-01]
(c)  (1/2π) A = (1/2π) 8000π = 4000   (peak of X(jw))
     X(jw) : triangle, peak 4000, support −8000π .. 8000π
     A = INT_{−4000π}^{4000π} (1)(1) dτ = 8000π                                  [green box]
     X_p(jw) : replicas of peak A/T = 32·10^6 centred at −16000π, 0, 16000π
        (ticks −24000π, −16000π, −8000π, 0, 8000π, 16000π [circled, = ws], 24000π)
     A/T = 4000/(1/8000) = 32·10^6                                               [green box]
     Nyquist rate:  ws = 2 wM = 2(8000π) = 16000π                                [boxed]
     Ts = 2π/ws = 2π/(16000π) = 125·10^{−6} s                                    [boxed]
Zero-Order Hold:
     F{ h0(t) } = H0(jw) = e^{−jw T/2} · [ 2 sin(w T/2) / w ]        (Time-shift by T/2)
        obtained from  F{ rect of height 1 on −T/2..T/2 } = INT_{−T/2}^{T/2} 1·e^{−jwt} dt
                                                          = 2 sin(wT/2)/w
     In order to make sure that  x_p(t) * h0(t) * h_r(t) = x(t) ,  with  h0(t)*h_r(t) = h(t) :
     H0(jw) H_r(jw) = H(jw)  →  H_r(jw) = H(jw)/H0(jw)
                                        = e^{jw T/2} H(jw) · w / [ 2 sin(w T/2) ]    [boxed]
                                          ("HARD IMPLEMENTATION IN PRACTICE")
```

**Examples**
1. (Continuation of Example 7.3 from p.82 — not separately tagged.)
   - (b) Given `x(t) = sin(4,000πt)/(πt)`. Asked: Nyquist rate. Method: rectangular `X(jw)` with `wM = 4000π`, replicate at height `1/T = 4000`. Final answers as written: `ws = 8000π`, `Ts = 0.25 s`.
   - (c) Given `x(t) = (sin(4,000πt)/(πt))^2`. Asked: Nyquist rate. Method: `X(jw)` = triangle from convolving two rectangles, `A = 8000π`, peak `(1/2π)A = 4000`, `wM = 8000π`. Final answers as written: `ws = 16000π`, `Ts = 125·10^{−6} s`, replica peak `A/T = 32·10^6`.

**Homework**
- None on this page.

**Figures**
- Hand-drawn (b): `X(jw)` rectangle of height 1 on −4000π..4000π with `4000π` circled and labelled `wM`; `X_p(jw)` three coloured (blue/orange/green) rectangles of height `1/T = 4000` centred at −8000π, 0, 8000π, ticks −12000π, −8000π, −4000π, 0, 4000π, 8000π (circled, `ws`), 12000π. Marked with a red `*`.
- Hand-drawn (c): `X(jw)` triangle, peak `(1/2π)A = 4000`, base −8000π..8000π; `X_p(jw)` three coloured triangles of peak `A/T = 32·10^6` centred at −16000π, 0, 16000π, ticks −24000π, −16000π, −8000π, 0, 8000π, 16000π (circled, `ws`), 24000π. Marked with a red `*`. Green box (left) shows the two overlapping unit rectangles on ±4000π with hatched overlap and the area integral.
- Printed ZOH block diagram: dashed box `H(jω)` containing `x(t) → ⊗ (with p(t)) → x_p(t) → [h0(t): rectangle of height 1 on 0..T] → x0(t) → [h_r(t), H_r(jω)] → x(t)`.
- Hand-drawn rectangle of height 1 on −T/2..T/2 used for the ZOH transform derivation.

**Ambiguities**
- **A83-01**: `Ts = 2π/(8000π) = 0.25 s` is wrong by a factor of 1000 — `2π/(8000π) = 1/4000 s = 0.25 ms` — and it directly contradicts p.82(a), which gives `0.25 ms` for the identical `ws = 8000π`. Recorded verbatim; not corrected.
- **A83-02**: `A/T = 4000/(1/8000) = 32·10^6`: the `1/8000` is written so that the slash merges with the digits, reading as `118000`. Also the label uses `A/T` while the number substituted is `4000 = A/2π`, not `A = 8000π` — the label and the value do not match.
- **A83-03**: In (b) the replica height is annotated `1/T = 4000`, which requires `T = 0.25 ms`; this is inconsistent with the boxed `Ts = 0.25 s` on the same line of the page (see A83-01).
- **A83-04**: In (c) `wM` is not explicitly circled/labelled on the `X(jw)` sketch (unlike (b)); the value `8000π` used in `ws = 2(8000π)` must be inferred from the triangle's base.

---

## p.84 — `Example` (ZERO-ORDER HOLD, MATLAB); new section "First-Order Hold (FOH)" — no red week/lecture box

**Concepts**
- ZOH quality improves as `Ts` decreases ("As Ts decreases, ZOH can approximately reconstruct the x(t) signal").
- FOH = fitting a CT signal to a set of sample values; also known as **linear interpolation** (adjacent sample points connected by a straight line).
- Higher-order interpolation connects sample points with high-order polynomials.
- FOH impulse response as the self-convolution of a rectangle (triangle of width `2T`).

**Equations** (CT)
```
F{ h0(t) } = H0(jw) = (1/T) [ sin(w T/2) / (w/2) ]^2   --F^{-1}-->   h0(t) = (1/T) [ g(t) * g(t) ]
    with g(t) = rectangle of height 1 on −T/2 .. T/2
    and  g(t) * g(t) = triangle of peak T on −T .. T
```

**Examples**
1. `Example` labelled "ZERO-ORDER HOLD": Given the same oscillatory `x(t)` as p.80, sampled and held at `Ts = 0.5`, `0.1`, `0.05`, `0.01`. Asked: not stated in words. Method: MATLAB illustration only. Answer: the green hand note "As Ts decreases, ZOH can approximately reconstruct the x(t) signal."

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 4 × 2 set (ZOH): left column shows `x(t)` (blue curve), `x_p(t)` (red dots) and `x_o(t)` (black staircase) over t = −5..5, y 0..2, for `Ts = 0.5`, `0.1`, `0.05`, `0.01`; a purple hand annotation "Hold the sample" with an arrow to one staircase step; legend `x(t)` / `x_p(t)` / `x_o(t)`. Right column shows the ZOH output alone (blue staircase) over t = −5..5, y 0..2, progressively smoother.
- Printed FOH block diagram: dashed box `H(jω)` containing `x(t) → ⊗ (with p(t)) → x_p(t) → [h0(t): triangle of peak 1 on −T..T] → x0(t) → [h_r(t), H_r(jω)] → x(t)`.
- Hand-drawn: `g(t)` rectangle of height 1 on −T/2..T/2, convolved (`*`) with an identical `g(t)`, equals a triangle of peak `T` on −T..T.

**Ambiguities**
- **A84-01**: The three bottom sketches (`g(t)`, `g(t)`, `g(t)*g(t)`) have their horizontal axes labelled `w` although the limits (`±T/2`, `±T`) and the functions are time-domain; the axis label should be `t`.
- **A84-02**: The `Example` block consists solely of MATLAB figures — no problem statement, no question, and no numerical answer, only the qualitative green note.

---

## p.85 — `Example` (FIRST-ORDER HOLD, MATLAB); "Perfect Reconstruction" / band-limited interpolation — red box: **Week13—Lec2**

**Concepts**
- FOH connects samples by lines and "performs better than ZOH".
- Perfect reconstruction as a sum of shifted, scaled ideal-lowpass impulse responses.
- `h_LP(t)` of an ideal lowpass filter of gain `T` and cutoff `wc`.
- Band-limited interpolation (sinc interpolation); visualization of the overlapping sinc pulses.

**Equations** (CT)
```
x_r(t) = x_p(t) * h_LP(t)
x_r(t) = { SUM_{n=−inf}^{inf} x(nT) δ(t − nT) } * h_LP(t)
x_r(t) = SUM_{n=−inf}^{inf} x(nT) [ h_LP(t) * δ(t − nT) ]       ( = h_LP(t − nT) )
x_r(t) = SUM_{n=−inf}^{inf} x(nT) h_LP(t − nT)                                   [boxed]
h_LP(t) = (1/2π) INT_{−wc}^{wc} T e^{jwt} dw
        = (T/2π)(1/(jt)) [ e^{jwt} ]_{−wc}^{wc}
        = (T/(πt)) · (1/(2j)) [ e^{jwc t} − e^{−jwc t} ]           ( = sin(wc t) )
        = T sin(wc t)/(π t)                                                       [boxed]
x_r(t) = SUM_{n=−inf}^{inf} x(nT) (T/π) [ sin( wc (t − nT) ) / (t − nT) ]         [boxed]
                                                                : BAND-LIMITED INTERPOLATION
Purple box:  sinc((1/T)*(t−n*T))  :  sin( (1/T)(t − nT) ) / [ (1/T)·π(t − nT) ]
                                   =  (T/π) sin( w(t − nT) ) / (t − nT)
Figure call-out:  x(2T) (T/π) sin( wc (t − 2T) ) / (t − 2T)
```

**Examples**
1. `Example` labelled "FIRST-ORDER HOLD": Given the same `x(t)` sampled at `Ts = 0.5`, `0.1`, `0.05`, `0.01`, reconstructed by connecting samples with straight lines. Asked: not stated. Method: MATLAB illustration. Answer: green hand note "FOH performs better than ZOH."

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 4 × 2 set (FOH): left column overlays `x(t)` (blue), `x_p(t)` (red dots) and `x_o(t)` (black piecewise-linear) over t = −5..5, y 0..2, for `Ts = 0.5`, `0.1`, `0.05`, `0.01`; purple hand annotation "Samples are connected by lines." Right column shows the FOH output alone (blue piecewise-linear) over t = −5..5, y 0..2.
- Printed block diagram: dashed "Sampling" box (`x(t) → ⊗ with p(t) → x_p(t)`) and dashed "Reconstruction" box (`H_LP(jω)`, rectangle of height `T` on `−ω_c..ω_c`, → `x_r(t)`).
- MATLAB-generated sinc-interpolation figure (bottom): t axis with ticks `−9T, −7T, −5T, −3T, −T, 0, T, 3T, 5T, 7T, 9T`, y from −1 to 2; blue continuous reconstructed signal, red dots at the sample instants, and black dashed individual sinc pulses (one per sample) overlapping; a green hand arrow labels the pulse at `t = 2T` as `x(2T)(T/π) sin(wc(t−2T))/(t−2T)`.

**Ambiguities**
- **A85-01**: The purple call-out writes the numerator as `sin((1/T)(t − nT))` while the denominator is `(1/T)·π(t − nT)`. With MATLAB's convention `sinc(x) = sin(πx)/(πx)` the numerator should carry the same `π`; as written the two sides are inconsistent.
- **A85-02**: The last member of the purple box uses an unsubscripted `w` — `(T/π) sin(w(t − nT))/(t − nT)` — where the boxed result uses `wc`. Equality of the two forms additionally requires `wc = π/T`, a condition that is used implicitly and never stated on the page.

---

## p.86 — `Example` (BAND-LIMITED INTERPOLATION, MATLAB); "Aliasing:" with three sampling-rate cases — red box: **Week14—Lec1**

**Concepts**
- Sinc (band-limited) interpolation quality vs `Ts`.
- Aliasing: when `ws < 2wm`, `X(jw)` is no longer replicated cleanly in `X_p(jw)` and `x(t)` is not recoverable by lowpass filtering.
- Worked demonstration on a pure sinusoid for `ws = 6w0`, `3w0`, `1.5w0`.
- Cutoff at half the sampling rate, `wc = ws/2 = π/T`.

**Equations** (CT)
```
Aliasing statement: When ws < 2wm, X(jw) is no longer replicated in X_p(jw).
                    x(t) is not recoverable by lowpass filtering.
Test signal:  x(t) = cos(w0 t)
Case ws = 6w0 :
    (π/T) = π/(2π/6w0) = (3 w0)                                        (ws under-braced)
    wc = −ws/2 (assumption) at −3w0 ;  wc = ws/2 at 3w0 ;  (ws − w0) = 5 w0
    NO ALIASING                                                        [green box]
    x_r(t) = cos(w0 t) = x(t)                                          [boxed]
Case ws = 3w0 :
    (π/T) = π/(2π/3w0) = (1.5 w0)
    −ws/2 = −3w0/2 ;  ws/2 = 3w0/2 ;  (ws − w0) = 2 w0
    x_r(t) = cos(w0 t) = x(t)                                          [boxed]
Case ws = 1.5 w0 :
    (π/T) = π/(2π/1.5w0) = 0.75 w0
    filter edges at −ws/2 and ws/2 ; surviving impulses at (−ws + w0) and (ws − w0)  → ALIAS
    X_r(jw) = π δ(−ws + w0) + π δ(ws − w0)   --F^{-1}-->
    x_r(t) = cos( (ws − w0) t ) ≠ cos(w0 t) = x(t)                     [boxed]
```

**Examples**
1. `Example` labelled "BAND-LIMITED INTERPOLATION": Given the same `x(t)` sampled at `Ts = 0.5`, `0.1`, `0.05`, `0.01` and reconstructed by sinc interpolation. Asked: not stated. Method: MATLAB illustration. Answer: qualitative — at `Ts = 0.5` the reconstruction `x_r(t)` (red) departs visibly from `x(t)` (blue); at smaller `Ts` they coincide.
2. (Aliasing demonstration on `x(t) = cos(w0 t)` — worked in three cases under the "Aliasing:" heading; not separately tagged `Example`.) Final answers as written: `ws = 6w0` → `x_r(t) = cos(w0 t) = x(t)`; `ws = 3w0` → `x_r(t) = cos(w0 t) = x(t)`; `ws = 1.5w0` → `x_r(t) = cos((ws − w0)t) ≠ cos(w0 t) = x(t)`.

**Homework**
- None on this page.

**Figures**
- MATLAB-generated 4 × 2 set: left column overlays `x(t)` (blue) and `x_r(t)` (red) over t = −5..5, y 0..2, for `Ts = 0.5`, `0.1`, `0.05`, `0.01` (visible mismatch only at `Ts = 0.5`); right column shows the reconstruction alone (blue) over the same range.
- Hand-drawn red-boxed `X(jw)` for `cos(w0 t)`: two impulse arrows at `−w0` and `w0` (areas not labelled), w axis.
- Hand-drawn `X_p(jw)` for `ws = 6w0`: impulse pairs at `±w0`, `±(ws ∓ w0)`, `±ws` etc.; ticks `−6w0`, `−ws`, `(−ws + w0)`, `−3w0`, `−w0`, `0`, `w0`, `3w0`, `ws`, `(ws − w0)`, `(ws + w0)`, `6w0`; red `H(jw)` rectangle of gain `T` with edges `−3w0` and `3w0`; annotations `wc = −ws/2 (assumption)`, `wc = ws/2`, `(ws − w0) = 5w0`.
- Hand-drawn `X_p(jw)` for `ws = 3w0`: same structure with `−ws = −3w0`, `ws = 3w0`, `±ws/2 = ±3w0/2`, `(ws − w0) = 2w0`; red `H(jw)` rectangle of gain `T` with edges at `∓1.5w0`.
- Hand-drawn `X_p(jw)` for `ws = 1.5w0`: ticks `(−ws − w0)`, `−ws`, `−w0`, `−ws/2`, `0`, `ws/2`, `w0`, `ws = 1.5w0`, `(ws + w0)`; red `H(jw)` rectangle with edges `∓0.75w0`; two blue ellipses with yellow highlight around the impulses at `(−ws + w0)` and `(ws − w0)`, marked "ALIAS".
- Green check marks / `*` markers beside each case's boxed conclusion.

**Ambiguities**
- **A86-01**: `X_r(jw) = π δ(−ws + w0) + π δ(ws − w0)` — the delta arguments are written as constants rather than as functions of `ω` (they should read `δ(w + ws − w0)` and `δ(w − ws + w0)`), so as written the expression has no frequency dependence.
- **A86-02**: The impulse areas of `X(jw)` for `cos(w0 t)` (π each) are never written on the sketch; the subsequent `π δ(...)` coefficients in the `ws = 1.5w0` case therefore appear without derivation.
- **A86-03**: In the `ws = 6w0` case the left cutoff is annotated "`wc = −ws/2` (assumption)" while the right is "`wc = ws/2`" — using the same symbol `wc` for both the negative and positive band edge.

---

## p.87 — `Example` (aliasing of `cos(2πt)` at three rates) and `Homework` (aliasing of `cos(πt) + cos(3πt)`) — no red week/lecture box

**Concepts**
- Concrete aliasing demonstration with numeric sampling periods.
- "Original signal takes the identity of a lower frequency, `(ws − w0)`."
- Nyquist check `ws ≥ 2wm` applied case by case with ✓/✗ verdicts.
- Aliasing of a two-tone signal: only the component above `ws/2` folds.

**Equations** (CT)
```
Example, x(t) = cos(2πt) ,  wm = 2π (MATLAB label) :
    T1 = 1/4  :  ws = 2π/(1/4) = 8π   ;  wc = ws/2 = 4π  ;  ws ≥ 2wm ? 8π > 2(3π)  ✓  NO ALIASING
    T2 = 1/3  :  ws = 2π/(1/3) = 6π   ;  wc = ws/2 = 3π  ;  ws ≥ 2wm ? 6π ≥ 2(3π)  ✓  NO ALIASING
    T3 = 2/3  :  ws = 2π/(2/3) = 3π   ;  wc = ws/2 = 1.5π ; −wc = −ws/2 = −1.5π
                 ws ≥ 2wm ? 3π < 2(3π)  ✗  UNDERSAMPLING (ALIASING)
    Aliased Signal: x_r(t) = cos(πt)
Homework, x(t) = cos(πt) + cos(3πt) ,  wm = 3π (MATLAB label) :
    T1 = 1/4  :  ws = 2π/(1/4) = 8π   ;  wc = ws/2 = 4π  ;  8π ≥ 2(3π)  ✓  NO ALIASING
                 −wc = −ws/2 = −4π
    T2 = 2/5  :  ws = 2π/(2/5) = 5π   ;  wc = ws/2 = 5π/2 = 2.5π ; −wc = −ws/2 = −2.5π
                 5π < 2(3π)  ✗  UNDERSAMPLING (ALIASING)
    X_r(jw) = π δ(w + π) + π δ(w − π) + π δ(w + 2π) + π δ(w − 2π)
        --F-->  x_r(t) = cos(πt) + cos(2πt) ≠ x(t)
    Aliased Signal: x_r(t) = cos(πt) + cos(2πt)
```

**Examples**
1. `Example`: Given `x(t) = cos(2πt)` sampled with `T1 = 1/4`, `T2 = 1/3`, `T3 = 2/3`. Asked (implicit): identify which rates alias and find the aliased signal. Method: compute `ws = 2π/T`, compare with `2wm`, apply an ideal lowpass of gain `T` and cutoff `ws/2`, read the surviving impulses. Final answers as written: `T1`, `T2` → NO ALIASING; `T3` → UNDERSAMPLING (ALIASING), with `x_r(t) = cos(πt)`; blue note "Original signal takes the identity of a lower frequency, `(ws − w0)`."

**Homework**
1. `Homework`: Given `x(t) = cos(πt) + cos(3πt)` sampled with `T1 = 1/4` and `T2 = 2/5`. Asked (implicit): same analysis. Method: same as the Example, tracking both tones. Final answers as written: `T1 = 1/4` (`ws = 8π`) → NO ALIASING; `T2 = 2/5` (`ws = 5π`) → ALIASING with `X_r(jw) = πδ(w+π) + πδ(w−π) + πδ(w+2π) + πδ(w−2π)` and `x_r(t) = cos(πt) + cos(2πt) ≠ x(t)`.

**Figures**
- MATLAB-generated Example set (4 rows × 2 cols):
  - Row 1: `x(t) = cos(2πt)`, t = −5..5, y −1..1; `X(jω)` impulse plot, ω = −10π..10π, y-axis max labelled `π`, impulses at ±2π, annotated `ω_m = 2π`.
  - Row 2 (`T1 = 1/4`): `x(t)` with red sample dots; `X_p(jω)` impulses of height `π/T1` at multiples of 2π offsets, `ω_s = 8π`, red/yellow `H_LP(jω)` rectangle of gain `T1`, `−wc` and `wc = ws/2 = 4π` annotated.
  - Row 3 (`T2 = 1/3`): same layout, `ω_s = 6π`, gain `T2`, `wc = ws/2 = 3π`.
  - Row 4 (`T3 = 2/3`): `x(t)` (blue) with red dots and the red dashed reconstruction `x_r(t)`; caption "Aliased Signal: x_r(t)=cos(πt)"; `X_p(jω)` with colour-coded overlapping impulses (green, black, pink), `ω_s = 3π`, gain `T3`, `−wc = −ws/2 = −1.5π`, `wc = ws/2 = 1.5π`.
  - Hand blue braces label rows 2–3 "NO ALIASING" and row 4 "UNDERSAMPLING (ALIASING)"; purple checks at right.
- MATLAB-generated Homework set (3 rows × 2 cols):
  - Row 1: `x(t) = cos(πt) + cos(3πt)`, t = −1..1, y −2..2; `X(jω)` impulses at ±π and ±3π, ω = −11π..11π, `ω_m = 3π`.
  - Row 2 (`T1 = 1/4`): `x(t)` with red dots; `X_p(jω)`, `ω_s = 8π`, `H_LP(jω)` rectangle of gain `T1` (yellow-filled) with `−wc = −ws/2 = −4π`, `wc = ws/2 = 4π`.
  - Row 3 (`T2 = 2/5`): `x(t)` (blue) with red dots and red dashed `x_r(t)`; caption "Aliased Signal: x_r(t)=cos(πt) + cos(2πt)"; `X_p(jω)` with heavy colour-coded overlapping impulses (green, black, pink), several impulses crossed out with hand `✗` marks, `ω_s = 5π`, gain `T2`, `−wc = −ws/2 = −2.5π`, `wc = ws/2 = 5π/2 = 2.5π`, pink arrows to `2π` and `−2π`.
- Hand-drawn bottom impulse line (Homework): ω axis with ticks `−12π ... 12π` in unit-π steps; arrows in red, pink, black, purple and green; a red box around `−2π ... 2π` with blue ellipses and yellow highlight on the impulses at `−2π` and `2π`, labelled "ALIAS" with two arrows.

**Ambiguities**
- **A87-01**: For the `Example` the MATLAB label gives `ω_m = 2π` (signal `cos(2πt)`), but all three hand-written Nyquist checks are written against `2(3π)`: `8π > 2(3π)`, `6π ≥ 2(3π)`, `3π < 2(3π)`. With `wm = 2π` the comparisons should be against `4π`. The ✓/✓/✗ verdicts happen to be unchanged, but the middle case is written as an equality (`6π ≥ 6π`) that would be a strict inequality for `wm = 2π`. The `3π` value appears to be carried over from the Homework signal on the same page.
- **A87-02**: The inverse transform in the Homework line is labelled with a plain `F` arrow (`X_r(jw) ... --F--> x_r(t)`) where `F^{-1}` is meant.
- **A87-03**: The bottom hand-drawn impulse line uses five arrow colours with no legend, so which replica each arrow belongs to is not stated; the impulse areas are also not labelled.
- **A87-04**: In the Homework `X_p(jω)` panel several impulses are struck through with hand `✗` marks without any written explanation of what the strike-through denotes (removed by the filter? cancelled?).

---

## p.88 — "Anti-Aliasing Filter:", "Temporal Aliasing:", "Spatial Aliasing:" — red box: **Week14—Lec2: NO LECTURE**

**Concepts**
- Anti-aliasing (AA) filter: removes frequencies above `ws/2` **before** sampling.
- AA filter limits the signal to its "effective bandwidth".
- AA filtering yields a reconstructed spectrum matching the original below half the sampling rate, hence lower error energy.
- Temporal aliasing: wagon-wheel effect; stroboscopic effect.
- Spatial aliasing: high-resolution images viewed at lower resolution; computer graphics; anti-aliasing by over-sampling.

**Equations**
```
AA filter removes frequencies above  ws/2  before sampling.
Error-energy comparison (hand, red/blue):   E_{x−x̂}  >  E_{x−ŷ}      ("Lower error energy")
Printed figure relations:  Y(ω) = X(ω) G(ω)   (with ω_s < 2B on every panel)
```

**Examples**
- None tagged `Example` on this page.

**Homework**
- None on this page.

**Figures**
- Hand-drawn block diagram: `x(t) → [H_AA(w)] → [Impulse Train Sampling] → x_r(t)`, with `H_AA(w)` annotated "Anti-aliasing filter".
- Printed "Figure 1" (external, reference URL `https://cnx.org/contents/d2CEAGW5@15.4:fj-rLczQ@8/Anti-Aliasing-Filters` written by hand as `Ref:`), 4 rows × 2 columns, all vs `ω`, all panels annotated `ω_s < 2B`:
  - Row 1 left: `X(ω)` triangle of height 1 with base `−B..B`, plus the blue-drawn `G(ω)` rectangle on `−ω_s/2..ω_s/2` (hand-labelled "anti-aliasing filter"). Row 1 right: `Y(ω) = X(ω)G(ω)` — the triangle truncated to `±ω_s/2`.
  - Row 2 left: `X_s(ω)` — overlapping replicas of height `1/T_s`, ticks `−4π, −2π, 2π, 4π`, with four red circles and the hand label "aliasing". Row 2 right: `Y_s(ω)` — clean non-overlapping replicas of height `1/T_s`.
  - Row 3 left: `X̃(ω)` (reconstructed without AA) — flat-topped distorted spectrum of height 1, ticks `−B, −ω_s/2, ω_s/2, B`. Row 3 right: `Ỹ(ω)` — triangle truncated at `±ω_s/2`, height 1.
  - Row 4 left: `(X − X̃)(ω)` error spectrum, height 1, with yellow highlighter on the `−ω_s/2` and `ω_s/2` labels. Row 4 right: `(X − Ỹ)(ω)` error spectrum, visibly smaller. Blue hand ellipse "Lower error energy" and red `E_{x−x̂} > E_{x−ŷ}`.
  - Printed caption explaining that with an ideal lowpass AA filter the reconstructed spectrum matches the original for all frequencies below half the sampling rate, giving lower error energy.
- Photograph (Temporal Aliasing): a turboprop aircraft engine/propeller photographed from a window, blades appearing curved/stationary.
- Two rendered images (Spatial Aliasing): a receding black-and-white checkerboard captioned "aliasing effects" and the same scene captioned "anti-aliasing by over-sampling".

**Ambiguities**
- **A88-01**: The imported Figure 1 uses `B` for the signal bandwidth and `ω_s/2` for the folding frequency, whereas the handwritten notes on pp.80–87 use `ω_m` and `ω_c`; no mapping between the two notations is given on the page.
- **A88-02**: The red annotation `E_{x−x̂} > E_{x−ŷ}` uses hand-drawn accents on `x` and `y` that cannot be reliably distinguished as hats vs tildes, while the printed figure labels the same signals `X̃(ω)` and `Ỹ(ω)` (tildes).
- **A88-03**: The AA-filter block diagram shows the output of the impulse-train sampling stage as `x_r(t)`, i.e. the reconstruction symbol, without an explicit reconstruction filter block; on p.81/p.85 `x_r(t)` denotes the post-lowpass output.
