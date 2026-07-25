# EE311 Signals and Systems — Page-level content audit, pages 22–38

Source: `/tmp/ee311/pages/p-22.png` … `/tmp/ee311/pages/p-38.png` (160 dpi scans of handwritten notes).
Convention: the handwritten imaginary unit `J` is recorded as `j`. Equations are transcribed as written, not corrected.

---

## p.22 — CH#3 — FOURIER SERIES REPRESENTATION OF PERIODIC SIGNALS / "Eigenfunctions of an LTI System" / "Continuous-Time Case"  [red box: Week5—Lec1]

**Concepts**
- Objective of chapter: identify a family of signals {x_k(t)} such that (1) every member passes through any LTI system with only a scale change; (2) "any" signal can be represented as a linear combination of members of that family.
- Eigenfunction (highlighted): for an LTI system, if the output is a scaled version of its input, the input function is an eigenfunction of the system.
- Eigenvalue (highlighted): the scaling factor λ_k.
- Continuous-time complex exponential e^{st} is an eigenfunction of a CT LTI system; H(s) is the eigenvalue, "independent of t".
- H(s) named both "Laplace Transform of h(t)" and "Transfer Function of the continuous-time LTI system".

**Equations**
- `x_k(t) --S--> λ_k x_k(t)`   (λ_k = scale factor)  [boxed]
- `x(t) = Σ_{k=-∞}^{∞} a_k x_k(t)`  [boxed]
- `x(t) --S--> y(t) = Σ_{k=-∞}^{∞} a_k λ_k x_k(t)`  [boxed]
- `x(t) = e^{st}` for some `s ∈ C`  [boxed]
- `y(t) = h(t) * x(t) = ∫ h(τ) x(t-τ) dτ = ∫ h(τ) e^{s(t-τ)} dτ = [∫ h(τ) e^{-sτ} dτ] e^{st} = H(s) e^{st} = H(s) x(t)`   (CT; integrals written without limits; the bracket is underbraced "H(s)")
- `H(s) = ∫ h(τ) e^{-sτ} dτ`   (CT)
- `e^{st} --> [h(t)] --> H(s) e^{st}`, with e^{st} labelled EIGENFUNCTION OF THE LTI SYSTEM and H(s) labelled EIGENVALUE (Independent of "t") / "complex constant".

**Examples** — none.

**Homework** — none.

**Figures**
- Two hand-drawn block diagrams (not MATLAB): `x(t) → [h(t)] → y(t)`; and `e^{st} → [h(t)] → H(s)e^{st}` with green/blue arrow annotations "complex constant", "EIGENFUNCTION OF THE LTI SYSTEM", "EIGENVALUE (Independent of 't')".

**Ambiguities**
- **A22-01**: All integrals on this page (convolution and H(s)) are written as bare `∫` with no limits; the intended (-∞, ∞) is never written.
- **A22-02**: "for some s ∈ ¢" — the set symbol is a handwritten script capital (complex plane C) drawn like a cent sign; recorded as `s ∈ C`.

---

## p.23 — (continuation of Eigenfunctions) / "Discrete-Time Case" / "Summary"  [no week tag]

**Concepts**
- s = jω (ω ∈ R) turns e^{st} into a periodic complex exponential; H(jω) is the FREQUENCY RESPONSE = CONTINUOUS-TIME FOURIER TRANSFORM.
- DT case: z^n is an eigenfunction of a DT LTI system; H(z) is the eigenvalue, "independent of n".
- H(z) named both "z-transform of h[n]" and "Transfer Function of the discrete-time LTI system".
- z = e^{jω} gives H(e^{jω}) = FREQUENCY RESPONSE = DISCRETE-TIME FOURIER TRANSFORM.
- Summary table pairing CT (Laplace/CTFT) with DT (z-transform/DTFT).

**Equations**
- `H(s)|_{s=jω} = H(jω) = ∫_{-∞}^{∞} h(τ) e^{-jωτ} dτ`  (CT frequency response)
- `x[n] = z^n` where `z ∈ C`  (DT)
- `y[n] = h[n] * x[n] = Σ_{k=-∞}^{∞} h[k] x[n-k] = Σ_{k=-∞}^{∞} h[k] z^{n-k} = z^n Σ_{k=-∞}^{∞} h[k] z^{-k} = H(z) z^n`  (DT)
- `H(z) = Σ_{k=-∞}^{∞} h[k] z^{-k}`  (DT)
- `H(z)|_{z=e^{jω}} = H(e^{jω}) = Σ_k h[k] e^{-jωk}`  (DT frequency response)
- Summary (CT | DT):
  - `e^{st} → [h(t)] → H(s)e^{st}` with `s = jω`  |  `z^n → [h[n]] → H(z)z^n` with `z = e^{jω}`
  - TRANSFER FUNCTION: `H(s) = ∫ h(τ) e^{-sτ} dτ`  |  `H(z) = Σ_k h[k] z^{-k}`
  - FREQUENCY RESPONSE: `H(jω) = ∫ h(τ) e^{-jωτ} dτ`  |  `H(e^{jω}) = Σ_k h[k] e^{-jωk}`

**Examples** — none.

**Homework** — none.

**Figures**
- Hand-drawn block diagrams: `x[n] → [h[n]] → y[n]`; `z^n → [h[n]] → H(z) z^n` with annotations "complex constant", EIGENFUNCTION OF THE LTI SYSTEM, EIGENVALUE (Independent of "n").
- Hand-drawn two-column "Summary" cloud with the two block diagrams and the four transform definitions.

**Ambiguities**
- **A23-01**: Bullet "Hence, if the input is x[n] = z^n, then the output signal is a scaled version, **y(t) = H(s) e^{st}**" — a CT expression used in the DT bullet; the block diagram immediately below it shows `z^n → H(z)z^n`. Not corrected here.
- **A23-02**: The DTFT line and both DT entries of the summary table use a bare `Σ_k` with no limits, while the definition three lines above uses `Σ_{k=-∞}^{∞}`; likewise CT summary integrals carry no limits.

---

## p.24 — "Why is eigenfunction important?" + Example (time-delay LTI system)  [no week tag]

**Concepts**
- Superposition through an LTI system: each complex exponential is scaled by H at its own s_k.
- Key boxed remark (red "!" icon): as long as x(t) (or x[n]) is expressed as a linear combination of eigenfunctions, y(t) (or y[n]) can be found by looking at the transfer function (fixed for an LTI system).
- Red "?" icon: "How do we express x(t) as a linear combination of complex exponentials?" — motivates Fourier series.
- Sifting property of δ used to get H(s) of a pure delay.

**Equations**
- `x(t) = a₁ e^{s₁t} + a₂ e^{s₂t} + a₃ e^{s₃t}`  [boxed]
- `e^{s₁t} --h(t)--> H(s₁)e^{s₁t}`,  `e^{s₂t} --h(t)--> H(s₂)e^{s₂t}`,  `e^{s₃t} --h(t)--> H(s₃)e^{s₃t}`
- `y(t) = a₁H(s₁)e^{s₁t} + a₂H(s₂)e^{s₂t} + a₃H(s₃)e^{s₃t}`  [boxed]
- `y(t) = Σ_{k=-∞}^{∞} a_k H(s_k) e^{s_k t}`  [boxed]
- DT: `x[n] = Σ_{k=-∞}^{∞} a_k z_k^n  --h[n]-->  y[n] = Σ_{k=-∞}^{∞} a_k H(z_k) z_k^n`  [boxed]

**Examples**
- **Example (p24, part (a); continues on p25)**
  - Given: LTI system with `y(t) = x(t-3)`; input `x(t) = e^{j2t}`.
  - Asked: determine the output using the eigenfunction method.
  - Method: impulse response from x(t)=δ(t) ⇒ `y(t) = h(t) = δ(t-3)` [boxed]; transfer function `H(s) = ∫ h(τ)e^{-sτ}dτ = ∫ δ(τ-3) e^{-sτ} dτ = e^{-3s}` [boxed] (red "Sifting property" arrow; the 3 in δ(τ-3) circled).
  - Answer: `e^{j2t} --h(t)--> H(j2) e^{j2t} = e^{-3(j2)} e^{j2t} = e^{j2(t-3)}` [boxed, marked ★]  (green brace under `H(j2)` labels the argument "s").

**Homework** — none.

**Figures** — none (only inline arrow diagrams).

**Ambiguities**
- **A24-01**: On the last line, `e^{j2t}` has the exponent factor `j2` circled in green with a small green tick/mark above the circle whose meaning is unclear (position: bottom-left of the page, immediately left of the "h(t)" arrow); the green brace under `H(j2)` labelling "s" is legible.

---

## p.25 — (Example part (b)) / FOURIER SERIES REPRESENTATION / "Existence of Fourier Series" (Dirichlet Conditions)  [no week tag]

**Concepts**
- Verification of eigenfunction results against the direct input–output relation ("Both ★ and ★★ are the 'same'").
- Not every x(t) can be decomposed into complex exponentials; periodic signals satisfying the Dirichlet conditions can.
- Dirichlet Condition 1: over any period, x(t) must be "absolutely integrable".
- Dirichlet Condition 2: in any finite interval, x(t) is of "bounded variation" — no more than a finite number of maxima and minima during any single period.
- Dirichlet Condition 3: in any finite interval there are only a finite number of discontinuities.

**Equations**
- Verification (a): `y(t) = x(t-3) = e^{j2(t-3)}` [boxed, ★★]
- (b) `x(t) = ½e^{j4t} + ½e^{-j4t} + ½e^{j7t} + ½e^{-j7t}` with the exponents circled and labelled s₁ = j4, s₂ = -j4, s₃ = j7, s₄ = -j7
- `y(t) = ½H(j4)e^{j4t} + ½H(-j4)e^{-j4t} + ½H(j7)e^{j7t} + ½H(-j7)e^{-j7t}`
- `= ½e^{-j12}e^{j4t} + ½e^{j12}e^{-j4t} + ½e^{-j21}e^{j7t} + ½e^{j21}e^{-j7t}`
- `= ½e^{j4(t-3)} + ½e^{-j4(t-3)} + ½e^{j7(t-3)} + ½e^{-j7(t-3)}` with braces `= cos(4(t-3))` and `= cos(7(t-3))`
- `= cos(4(t-3)) + cos(7(t-3))` [boxed, ★]
- Verification: `y(t) = x(t-3) = cos(4(t-3)) + cos(7(t-3))` [boxed, ★★]
- Periodicity: `x(t+T) = x(t)`
- Condition 1: `∫_T |x(t)| dt < ∞`

**Examples**
- **Example (continued from p24), part (b)**
  - Given: same system `y(t) = x(t-3)`; input `x(t) = cos(4t) + cos(7t)`.
  - Asked: determine the output using the eigenfunction method.
  - Method: Euler expansion into four complex exponentials, apply H(s) = e^{-3s} at each s_k, recombine into cosines; verify against y(t)=x(t-3).
  - Answer: `cos(4(t-3)) + cos(7(t-3))` (both routes agree).

**Homework** — none.

**Figures** — none.

**Ambiguities** — none identified on this page.

---

## p.26 — Example ("PATHOLOGICAL SIGNALS") / FS synthesis equation / Example (x(t)=1+½cos2πt+sin3πt) / Homework (LCM of fractions)  [red box next to the second example: Week5—Lec2]

**Concepts**
- Pathological signals violating each Dirichlet condition (vertical green label "PATHOLOGICAL SIGNALS").
- Any periodic x(t) can be written as a linear combination of complex exponentials; a_k are the "Fourier Series Coefficients"; ω₀ = 2π/T₀ is the fundamental frequency.
- φ_k(t) = e^{jkω₀t} is the k-th harmonic component.
- Fundamental period of a sum = LCM of the individual periods; a constant term's period (T₀ = 2π/0 → ∞) is excluded ("∞ is not included").

**Equations**
- `x(t) = Σ_{k=-∞}^{∞} a_k e^{jk ω₀ t}`  [boxed + highlighted; a_k and k circled in red, a_k → "Fourier Series Coefficients"]
- `ω₀ = 2π/T₀`  [boxed + highlighted]
- `φ_k(t) = e^{jkω₀t}`, k-th harmonic component
- Example signal: `x(t) = 1 + ½cos(2πt) + sin(3πt)`
- Periods: `1 → T₀ = 2π/0 → ∞` (crossed out); `cos(2πt) → T₀ = 2π/2π = 1`; `sin(3πt) → T₀ = 2π/3π = 2/3`
- `LCM(1, 2/3) = LCM(3/3, 2/3) = LCM(3,2)/LCM(3,3) = 6/3 = 2`  [result boxed]  (green note "Denominators are same")
- Homework: `LCM(2/9, 8/21) = LCM(14/63, 24/63) = LCM(14,24)/LCM(63,63) = 168/63 = 8/3`
- Homework check: `(8/3) : (2/9) = (8/3)(9/2) = 12`;  `(8/3) : (8/21) = (8/3)(21/8) = 7`

**Examples**
- **Example 1 (pathological signals)**: given three MATLAB-plotted signals; asked (implicitly) which Dirichlet condition each violates. Answers written in red on the figure: x₁ violates Condition 1; x₂ violates Condition 2 (but Cond. 1 satisfied); x₃ violates Condition 3 (Conditions 1 and 2 satisfied).
- **Example 2**: Given `x(t) = 1 + ½cos(2πt) + sin(3πt)`; asked: determine and plot the Fourier series coefficients. Method on this page: individual periods → LCM. Result on this page: `T₀ = 2` (continues on p27).

**Homework**
- "Find LCM(2/9, 8/21)." Solution given in the box: `8/3`, with the CHECK line dividing 8/3 by each fraction (12 and 7, both integers).

**Figures** (all three MATLAB-generated, stacked subplots, blue continuous curves, red hand annotations)
- Top: `x₁(t) = 1/t`, t-axis 0 to 4 (ticks 0, 0.5, 1, …, 4), y-axis 0 to 100 (ticks 0, 50, 100); repeats each unit interval; annotated "maxima", "minima", "∞" and "Condition 1 is violated!".
- Middle: `x₂(t) = sin(2π/t)`, t 0 to 4, y −1 to 1; dense oscillation clusters; annotated "infinite number of maxima", "Infinite number of minima", "Condition 2 is violated. (But cond. 1 is satisfied)".
- Bottom: `x₃(t)`, staircase of halving steps, t 0 to 32 (ticks 0, 8, 16, 24, 32), y 0 to 1 (ticks 0, 0.5, 1); annotated `∫_T |x(t)|dt < ∞`, "Infinite number of discontinuities", "Condition 3 is violated. Conditions 1 and 2 are satisfied."

**Ambiguities**
- **A26-01**: The LCM-of-fractions rule is applied as LCM(numerators)/**LCM**(denominators). The standard rule is LCM(numerators)/**GCD**(denominators); it coincides here only because both fractions were first put over a common denominator. Written as a general rule, it is mathematically suspect.
- **A26-02**: The MATLAB plots of `x₁(t)=1/t` and `x₂(t)=sin(2π/t)` are drawn as periodic repetitions (period 1) over 0…4, but the titles give the non-periodic closed forms; the periodic extension is never stated.

---

## p.27 — (continuation of the x(t)=1+½cos2πt+sin3πt example) + Homework (x(t)=3+5cos(10π/3 t+π/4)+4sin(5π/4 t−π/5))  [no week tag]

**Concepts**
- Mapping each Euler term onto harmonic index k via kω₀; reading a_k off the expansion.
- Magnitude/phase of coefficients computed from a phasor picture (∠1 = 0, ∠2j = π/2).
- Reminder that phases are in radians (π → 180°).

**Equations**
- `ω₀ = 2π/T₀ = π rad/s`  [π boxed]
- `x(t) = 1 + ½[½e^{j2πt} + ½e^{-j2πt}] + (1/2j)[e^{j3πt} - e^{-j3πt}]`
- `= 1·e^{j0πt} + ¼e^{j2πt} + ¼e^{j(-2)πt} + (1/2j)e^{j3πt} - (1/2j)e^{j(-3)πt}` with red k-labels k=0, k=2, k=-2, k=3, k=-3 and braces marking ω₀
- `a₀ = 0` [boxed],  `a₂ = a₋₂ = 1/4` [boxed],  `a₃ = 1/(2j)` [boxed],  `a₋₃ = -1/(2j)` [boxed],  and `a_k = 0` otherwise
- `|a₃| = |a₋₃| = 1/2` [boxed]
- `∠a₃ = ∠1 − ∠2j = 0 − (π/2) = −π/2` [boxed]
- `∠a₋₃ = ∠−1 − ∠2j = π − (π/2) = π/2` [boxed]
- Homework: `x(t) = 3 + 5cos(10π/3 t + π/4) + 4sin(5π/4 t − π/5)`
- `T₀ of cos(10π/3 t + π/4) = 2π/(10π/3) = 3/5`;  `T₀ of sin(5π/4 t − π/5) = 2π/(5π/4) = 8/5`
- `T₀ = LCM(3/5, 8/5) = LCM(3,8)/LCM(5,5) = 24/5`;  `ω₀ = 2π/T₀ = 2π/(24/5) = 5π/12`
- `x(t) = 3 + 5cos(8·(5π/12)t + π/4) + 4sin(3·(5π/12)t − π/5)`
- `= 3e^{j0ω₀t} + (5/2)e^{jπ/4}e^{j8ω₀t} + (5/2)e^{-jπ/4}e^{-j8ω₀t} + (4/2j)e^{-jπ/5}e^{j3ω₀t} − (4/2j)e^{+jπ/5}e^{-j3ω₀t}`
  with green labels `= a₀`, `= a₈`, `= a₋₈`, `= a₃`, `= a₋₃` (circled coefficients)

**Examples**
- Continuation of p26 Example 2. Final answers: ω₀ = π rad/s; a₀ = 0 (as written); a₂ = a₋₂ = 1/4; a₃ = 1/(2j); a₋₃ = −1/(2j); a_k = 0 otherwise; |a₃| = |a₋₃| = 1/2; ∠a₃ = −π/2; ∠a₋₃ = +π/2.

**Homework**
- "Determine and plot the Fourier Series coefficients of the periodic signal x(t) = 3 + 5cos(10π/3 t + π/4) + 4sin(5π/4 t − π/5)." Full solution supplied: T₀ = 24/5, ω₀ = 5π/12, a₀ = 3, a₈ = (5/2)e^{jπ/4}, a₋₈ = (5/2)e^{-jπ/4}, a₃ = (4/2j)e^{-jπ/5}, a₋₃ = −(4/2j)e^{+jπ/5}, plus MATLAB plots.

**Figures**
- MATLAB set 1 (three stacked subplots, example):
  - `x(t)` continuous curve, t from −4 to 4, y ticks 0, 1, 2 (curve spans ≈ −0.5 to 2.3).
  - `|a_k|` stem plot, k = −3…3: 0.5 at k=−3, 0.25 at k=−2, 0 at k=−1, 1 at k=0, 0 at k=1, 0.25 at k=2, 0.5 at k=3; y ticks 0, 0.5, 1.
  - `∠a_k` stem plot, k = −3…3: +π/2 at k=−3, 0 for k=−2…2, −π/2 at k=3; y ticks −π/2, 0, π/2.
  - Red margin annotations: "3.14/2 = 1.57", "radians", "π → 180°".
- MATLAB set 2 (three side-by-side subplots, homework):
  - `x(t)`, t from −5 to 5, y from −10 to 15 (ticks −10, −5, 0, 5, 10, 15), continuous curve.
  - `|a_k|` stem, k = −8…8 shown on axis −8…8: 2.5 at k=−8, 2 at k=−3, 3 at k=0, 2 at k=3, 2.5 at k=8, 0 elsewhere; y 0…3.
  - `∠a_k` stem, k −8…8, y from −π to π (ticks −π, −π/2, 0, π/2, π): −π/4 at k=−8, ≈+0.7π (7π/10) at k=−3, 0 for the rest, ≈−0.7π at k=3, +π/4 at k=8.

**Ambiguities**
- **A27-01**: Boxed `a₀ = 0` contradicts (i) the expansion line directly above it, whose k=0 term is `1·e^{j0πt}`, and (ii) the MATLAB `|a_k|` plot, which shows |a₀| = 1. The glyph is unambiguously a zero (identical to the "0" in "a_k = 0 otherwise"). Not corrected here.
- **A27-02**: The homework's period is again computed with LCM(numerators)/LCM(denominators) (`LCM(3,8)/LCM(5,5)`) — same suspect general rule as A26-01.

---

## p.28 — CT FOURIER SERIES COEFFICIENTS  [red box: Week6—Lec1]

**Concepts**
- Theorem giving the analysis/synthesis pair for CT Fourier series; "synthesis" vs "analysis" equations; a_k = SPECTRAL COEFFICIENTS OF x(t).
- Proof by multiplying the synthesis equation by e^{-jnω₀t} and integrating over one period.
- ORTHOGONALITY OF COMPLEX EXPONENTIALS.
- L'Hôpital's rule used for the k−n → 0 case.
- Purple instructor note: "Put it on Moodle! No need to explain it in the lecture." (next to a Moodle icon).

**Equations**
- Synthesis: `x(t) = Σ_{k=-∞}^{∞} a_k e^{jk(2π/T)t}`  [boxed + highlighted; brace labels 2π/T as ω₀]
- Analysis: `a_k = (1/T) ∫_T x(t) e^{-jk(2π/T)t} dt`  [boxed + highlighted]
- `x(t)e^{-jnω₀t} = [Σ_{k=-∞}^{∞} a_k e^{jkω₀t}] e^{-jnω₀t} = Σ_{k=-∞}^{∞} a_k e^{j(k-n)ω₀t}`
- `∫_{T₀} x(t)e^{-jnω₀t}dt = ∫_{T₀}[Σ_{k=-∞}^{∞} a_k e^{j(k-n)ω₀t}]dt = Σ_{k=-∞}^{∞} a_k ∫_{T₀} e^{j(k-n)ω₀t} dt`  [marked ★]
- `∫_{T₀} e^{j(k-n)ω₀t}dt = (1/(j(k-n)ω₀))[e^{j(k-n)ω₀t}]_{-T₀/2}^{T₀/2} = (1/(j(k-n)ω₀))[e^{j(k-n)(2π/T₀)(T₀/2)} − e^{j(k-n)(2π/T₀)(−T₀/2)}]`
- `= (1/(j(k-n)ω₀))[e^{j(k-n)π} − e^{-j(k-n)π}] = (1/((k-n)ω₀))·(2/2j)[e^{j(k-n)π} − e^{-j(k-n)π}]`  (brace: `= sin((k-n)π)`)
- `= 2sin((k-n)π)/((k-n)ω₀) = 2sin((k-n)π)/((k-n)(2π/T₀)) = T₀ sin((k-n)π)/((k-n)π)`  [boxed]
- If k−n ≠ 0: `T₀ sin((k-n)π)/((k-n)π) = 0` since `sin(mπ) = 0 ∀m` (m written above k−n)
- If k−n = 0: `T₀ sin(0)/0` → L'Hôpital w.r.t. (k−n): `lim_{(k-n)→0} [T₀ sin((k-n)π)]' / [(k-n)π]' = T₀ π cos((k-n)π)/π = T₀`
- `∫_{T₀} e^{j(k-n)ω₀t} dt = { T₀ , if k = n ; 0 , if k ≠ n }`  [boxed] : ORTHOGONALITY OF COMPLEX EXPONENTIALS
- `∫_{T₀} x(t)e^{-jnω₀t}dt = T₀ a_n`  (blue note: "Since k = n, we can write a_n = a_k")
- `a_n = (1/T₀) ∫_{T₀} x(t) e^{-jnω₀t} dt`  [boxed, ∎]

**Examples** — none.

**Homework** — none.

**Figures** — none (Moodle icon graphic only).

**Ambiguities**
- **A28-01**: The theorem boxes use `T` (`1/T ∫_T`, `2π/T`) while the entire proof uses `T₀` (`1/T₀ ∫_{T₀}`, `2π/T₀`); the two symbols are used interchangeably without a statement that T = T₀.
- **A28-02**: "since sin(mπ) = 0 ∀m" is asserted for all m; it requires m = k−n ∈ Z (true here because k, n are harmonic indices), but integrality is never stated.

---

## p.29 — "DC Term" + Example ("PERIODIC RECTANGULAR WAVE")  [no week tag]

**Concepts**
- DC term a₀ = average value of x(t) over one period.
- FS coefficients of the periodic rectangular wave; the coefficients are samples of a sinc-type envelope; sample spacing 2π/T decreases as T increases.

**Equations**
- `a₀ = (1/T) ∫_T x(t) dt`  [boxed + highlighted]  ("Average value of x(t) over one period.")
- `a_k = (1/T)∫_{-T/2}^{T/2} x(t)e^{-jkω₀t}dt = (1/T)∫_{-T₁}^{T₁} e^{-jkω₀t}dt = (1/T)(−1/(jkω₀))[e^{-jkω₀t}]_{-T₁}^{T₁}`
- `= (−1/(jkω₀T))[e^{-jkω₀t}]_{-T₁}^{T₁} = (−1/(jkω₀T))[e^{-jkω₀T₁} − e^{jkω₀T₁}] = (1/(jkω₀T))[e^{jkω₀T₁} − e^{-jkω₀T₁}]`
- `= (2/(kω₀T))·(1/2j)[e^{jkω₀T₁} − e^{-jkω₀T₁}] = (2/(kω₀T)) sin(kω₀T₁) = sin(2πk T₁/T)/(πk)`  [boxed]  (blue notes: ω₀ = 2π/T)
- `k = 0: a₀ = (1/T)∫_{-T₁}^{T₁} 1·dt = 2T₁/T`  [boxed]
- Summary:  `a_k = { 2T₁/T , if k = 0 ;  sin(2πk T₁/T)/(πk) , if k ≠ 0 }`  [boxed]
- Red envelope note: `Envelope Function: 2 sin(ω₀T₁)/ω₀ = T sin(2π(T₁/T))/π`
- Red bottom note: "The coefficients are regularly spaced samples of the envelope (2 sin ωT₁)/ω, where the spacing between samples, 2π/T, decreases as T ↑."

**Examples**
- **Example (periodic rectangular wave)**
  - Given: periodic square pulse train, x(t) = 1 for |t| ≤ T₁ and 0 for T₁ < |t| ≤ T/2, period T.
  - Asked: determine and plot the Fourier series coefficients of x(t).
  - Method: direct evaluation of the analysis integral over (−T₁, T₁), Euler recombination into a sine.
  - Answer: `a₀ = 2T₁/T`; `a_k = sin(2πkT₁/T)/(πk)` for k ≠ 0.

**Figures**
- MATLAB: `x(t)` rectangular wave, y 0 to 1 (ticks 0, 0.5, 1); x-axis ticks −T, −T₁, 0, T₁, T with red hand-added ticks at −T/2 and T/2; pulses of unit height centred at 0, ±T.
- MATLAB: five stacked stem plots of `a_k` vs k, k from −30 to 30 in each, titled `T = 4T₁`, `T = 8T₁`, `T = 16T₁`, `T = 32T₁`, `T = 64T₁`; y ticks respectively (0, 0.2, 0.4), (0, 0.1, 0.2), (0, 0.05, 0.1), (0, 0.02, 0.04, 0.06), (0, 0.02). Red hand annotations mark the first envelope zero crossings: ∓4 on the T=8T₁ plot, ∓8 on T=16T₁, ∓16 on T=32T₁.

**Homework** — none.

**Ambiguities**
- **A29-01**: The red "Envelope Function" is written as `2 sin(ω₀T₁)/ω₀ = T sin(2π(T₁/T))/π` — i.e. evaluated at ω = ω₀ (k = 1) with no k anywhere, whereas the red note at the bottom of the page describes the envelope as `(2 sin ωT₁)/ω` sampled at ω = kω₀. The boxed identity is missing the harmonic index k in both the sine argument and the denominator.
- **A29-02**: In the `T = 4T₁` stem plot, the k = 0 stem reaches ≈0.5 (= 2T₁/T) while the highest labelled y-tick is 0.4; the peak value cannot be read from the axis labels.

---

## p.30 — "How many Fourier Series coefficients are sufficient?" (MSE, Gibbs) + Homework ("SAW TOOTH WAVE")  [no week tag]

**Concepts**
- Truncated Fourier series x_N(t) as an approximation of x(t); x_N(t) → x(t) as N → ∞.
- Approximation error e_N(t) and mean squared error (MSE).
- Gibbs phenomenon at the discontinuity (annotated on the N = 27 plot).
- Integration by parts formula used for the sawtooth coefficients.

**Equations**
- `x(t) = 2T₁/T + Σ_{k=-∞, k≠0}^{∞} [sin(2πk T₁/T)/(πk)] e^{jk(2π/T)t}`  [boxed]
- `x_N(t) = Σ_{k=-N}^{N} a_k e^{jkω₀t}`  [boxed]
- `e_N(t) = x(t) − x_N(t)`  [boxed]
- `MSE = (1/T) ∫_T |e_N(t)|² dt`  [boxed; blue annotations "average", "error", "square"]
- Homework (sawtooth): `a₀ = (1/T)∫_{-T/2}^{T/2} t·dt = (1/T)[t²/2]_{-T/2}^{T/2} = 0`
- `a_k = (1/T)∫_T x(t)e^{-jkω₀t}dt = (1/T)∫_{-T/2}^{T/2} t e^{-jk(2π/T)t} dt`  (k ≠ 0)
- Green box: `∫_b^c t e^{at} dt = (1/a²)[(at−1)e^{at}]_b^c` : integration by parts
- `∫ t e^{-jkω₀t}dt = (1/(−jkω₀)²)[(−jkω₀t − 1)e^{-jkω₀t}]_{-T/2}^{T/2}`
- `= (−1/(k²ω₀²))[(−jk(2π/T)(T/2) − 1)e^{-jk(2π/T)(T/2)} − (+jk(2π/T)(T/2) − 1)e^{+jk(2π/T)(T/2)}]`
- `= (−1/(k²ω₀²))[(−jkπ − 1)e^{-jkπ} − (jkπ − 1)e^{jkπ}] = (−1/(k²ω₀²))[−jkπe^{-jkπ} − e^{-jkπ} − (jkπe^{jkπ} − e^{jkπ})]`

**Examples**
- No new "Example"-tagged block; the MATLAB figure is the worked illustration of the p29 square wave (T₁ = 1, T = 4) reconstructed for N = 3, 9, 27, 81.

**Homework**
- "SAW TOOTH WAVE — Determine and plot the Fourier Series coefficients of x(t)." (solution begun here, continued on p31).

**Figures**
- MATLAB (five stacked subplots), square-wave reconstruction, t from −6 to 6, y 0 to 1 (ticks 0, 0.5, 1) in every subplot:
  - `x(t)`, title `T₁ = 1, T = 4` (unit pulses on |t| ≤ 1 mod 4).
  - `x₃(t)`, title `MSE=0.025`, red left label `N=3` — smooth ripple, no flat top.
  - `x₉(t)`, title `MSE=0.010`, red label `N=9`.
  - `x₂₇(t)`, title `MSE=0.004`, red label `N=27`; red ellipse + "Gibbs Phenomena" at the jump near t = 1.
  - `x₈₁(t)`, title `MSE=0.001`, red label `N=81`.
- MATLAB (homework): `x(t)` sawtooth, t from −1.5 to 1.5 (ticks every 0.5), y from −0.5 to 0.5; ramps rising with slope 1 and jumping down at t = ±0.5, ±1.5 (i.e. period 1).

**Ambiguities**
- **A30-01**: The sawtooth homework never states its period or its analytic form in words; that x(t) = t on (−T/2, T/2) and T = 1 must be inferred from the MATLAB plot, while the derivation keeps T symbolic.

---

## p.31 — (sawtooth solution continued) + Example ("PERIODIC IMPULSE TRAIN") + DT FOURIER SERIES COEFFICIENTS  [red box: Week6—Lec2]

**Concepts**
- Completion of the sawtooth coefficients; Gibbs phenomenon again on the sawtooth reconstruction.
- Fourier series of a periodic impulse train: all coefficients equal 1/T (flat spectrum).
- Introduction of DT Fourier series: x[n] = x[n+N]; "square summable" assumption / Dirichlet conditions for DT.

**Equations**
- `= (−1/(k²ω₀²))[−jkπe^{-jkπ} − e^{-jkπ} − jkπe^{jkπ} + e^{jkπ}] = (−1/(k²ω₀²))[−jkπ(e^{-jkπ} + e^{jkπ}) + (e^{jkπ} − e^{-jkπ})]`
- `= (−1/(k²ω₀²))[−2jkπ cos(kπ) + 2j sin(kπ)]`  (brace under the sine: `= 0`)
- `= (T²/(k²·4π²))·2jkπ cos(kπ) = jT²/(2kπ) cos(kπ)`  (the 4 is struck and replaced by a blue 2 to show the 2/4 cancellation)
- `a_k = (1/T)·(jT²/(2kπ))cos(kπ) = (jT/(2kπ)) cos(kπ)`  [boxed]
- FS coefficients: `a_k = { (jT/(2kπ))cos(kπ) , k ≠ 0 ;  0 , k = 0 }`  [boxed]
- `x(t) = Σ_{k=-∞, k≠0}^{∞} (jT/(2kπ)) cos(kπ) e^{jk(2π/T)·t}`  [boxed]
- Red side note: `x₈₁(t) = Σ_{k=-81}^{81} a_k e^{jkω₀t}`
- Impulse train: `x(t) = Σ_{k=-∞}^{∞} δ(t − kT)`
- `a_k = (1/T)∫ x(t)e^{-jkω₀t}dt = (1/T)∫_{-T/2}^{-T/2} δ(t) e^{-jkω₀t} dt` (limits as written) `= (1/T)e^{-jkω₀·0} = 1/T ∀k`  [boxed]  (red "Sifting Property" arrow; brace `= 1`)
- DT setup: `x[n] = x[n+N]`, N = period; `Σ_{n=-∞}^{∞} |x[n]|² < ∞` ("square summable", or x[n] satisfies the Dirichlet conditions)

**Examples**
- **Example (periodic impulse train)**
  - Given: `x(t) = Σ_{k=-∞}^{∞} δ(t − kT)`.
  - Asked: determine and plot the Fourier Series coefficients.
  - Method: analysis integral over one period containing only δ(t); sifting property.
  - Answer: `a_k = 1/T ∀k`.

**Homework** — none new (p30 homework solved here).

**Figures**
- MATLAB (two side-by-side stem plots, sawtooth coefficients), k from −10 to 10:
  - `|a_k|`: y ticks 0, 0.04, 0.08, 0.12, 0.16; values 0.16 at k = ±1, 0.08 at ±2, ≈0.053 at ±3, 0.04 at ±4, ≈0.032 at ±5, decaying to ≈0.016 at ±10; 0 at k = 0.
  - `∠a_k`: values only at ±π/2 with 0 at k = 0; **+π/2** at k = −9, −7, −5, −3, −1, 2, 4, 6, 8, 10 and **−π/2** at k = −10, −8, −6, −4, −2, 1, 3, 5, 7, 9.
- MATLAB (five stacked subplots, sawtooth reconstruction), t from −1.5 to 1.5, y −0.5 to 0.5:
  - `x(t)` (exact sawtooth); `x₃(t)` title `MSE=0.015`; `x₉(t)` `MSE=0.006`; `x₂₇(t)` `MSE=0.002`; `x₈₁(t)` `MSE=0.001` with a red circle + "Gibbs Phenomena" at the jump at t = 0.5.
- Hand-drawn impulse train: arrows of area (1) at t = −T, 0, T labelled δ(t+T), δ(t), δ(t−T), with "…" on both sides.

**Ambiguities**
- **A31-01**: In the impulse-train example the analysis integral is written with **both** limits equal to `−T/2` (`∫_{-T/2}^{-T/2}`); the upper limit is presumably +T/2. Not corrected here.
- **A31-02**: The coefficient plots are numeric (peak |a₁| = 0.16 ⇒ T = 1) while every formula on the page is symbolic in T; the value of T used for plotting is never stated.

---

## p.32 — DT FOURIER SERIES: Theorem + periodicity proof + Example (x[n] = sin(5π/6 n) + cos(3π/4 n + π/5))  [no week tag]

**Concepts**
- DT Fourier series synthesis/analysis pair, summed over any single period ⟨N⟩ ("Summing the signal within a period N").
- DTFS coefficients are periodic in k with period N: a_k = a_{k+N} (marked with a red "!" burst); contrast with CT, where no such periodicity holds.
- Fundamental period of a DT sinusoid via N₀ = 2πk/ω, choosing the smallest integer k that makes N₀ an integer; overall N₀ = LCM of component periods.

**Equations**
- Synthesis: `x[n] = Σ_{k=⟨N⟩} a_k e^{jk(2π/N)n}`  [boxed + highlighted]
- Analysis: `a_k = (1/N) Σ_{n=⟨N⟩} x[n] e^{-jk(2π/N)n}`  [boxed + highlighted]
- `a_k = a_{k+N}`  [boxed + highlighted]
- Proof: `a_{k+N} = (1/N)Σ_{n=⟨N⟩} x[n]e^{-j(k+N)ω₀n} = (1/N)Σ_{n=⟨N⟩} x[n]e^{-jkω₀n} e^{-jN(2π/N)n} = a_k`  (blue: `= (e^{-j2π})^n = (1)^n = 1 if n ∈ Z`)
- CT contrast: `e^{-j(k+T)ω₀t} = e^{-jkω₀t} e^{-j(2π/T)T·t} = e^{-jkω₀t} e^{-j2πt}`  (blue: "when t ∉ Z, e^{-j2πt} ≠ 1")
- Example: `x[n] = sin((5π/6)n) + cos((3π/4)n + π/5)`
- `N₀ of sin((5π/6)n): N₀ = 2πk/(5π/6) = (12/5)k → if k = 5, N₀ = 12`
- `N₀ of cos((3π/4)n + π/5): N₀ = 2πk/(3π/4) = (8/3)k → if k = 3, N₀ = 8`
- `N₀ = LCM(12, 8) = 24`  [boxed]
- `x[n] = (1/2j)e^{j(5π/6)n} − (1/2j)e^{-j(5π/6)n} + ½e^{jπ/5}e^{j(3π/4)n} + ½e^{-jπ/5}e^{-j(3π/4)n}`
- `= (1/2j)e^{j10(2π/24)n} − (1/2j)e^{j(-10)(2π/24)n} + ½e^{jπ/5}e^{j9(2π/24)n} + ½e^{-jπ/5}e^{j(-9)(2π/24)n}`
  with circled coefficients labelled `= a₁₀`, `= a₋₁₀`, `= a₉`, `= a₋₉`
- Red note under the plots: `a_k = a_{k+24}`

**Examples**
- **Example**: Given `x[n] = sin(5π/6 n) + cos(3π/4 n + π/5)`; asked to determine and plot the FS coefficients. Method: individual DT periods → LCM → ω₀ = 2π/24 → Euler expansion, identify harmonic indices ±9, ±10. Answers: N₀ = 24; a₁₀ = 1/(2j), a₋₁₀ = −1/(2j), a₉ = ½e^{jπ/5}, a₋₉ = ½e^{-jπ/5} (all other a_k in one period = 0).

**Homework** — none.

**Figures** (MATLAB, three side-by-side)
- `x[n]` stem plot, n from −24 to 24 (ticks −24, −16, −8, 0, 8, 16, 24), y −2 to 2; red arrow annotation "N₀ = 24" spanning one period.
- `|a_k|` stem, k −10…10, y 0 to 0.5: 0.5 at k = −10, −9, 9, 10; 0 elsewhere.
- `∠a_k` stem, k −10…10, y ticks −π/2, −π/4, 0, π/4, π/2: +π/2 at k = −10; ≈−π/5 at k = −9; 0 for −8 ≤ k ≤ 8; ≈+π/5 at k = 9; −π/2 at k = 10.

**Ambiguities**
- **A32-01**: The CT "counter-example" line writes `e^{-j(k+T)ω₀t}` — adding a **time period T** to a **harmonic index k**. Dimensionally inconsistent as written; the intended statement is that CT coefficients are not periodic in k.
- **A32-02**: The caption reads "The plots of **x(t)**, |a_k| and ∠a_k" while the plotted signal is the discrete-time x[n] (the plot's own y-label is x[n]).

---

## p.33 — Example ("DT periodic square wave")  [no week tag]

**Concepts**
- DTFS of a periodic DT rectangular wave (x[n] = 1 for |n| ≤ N₁ within each period N).
- Finite geometric sum formula used for the analysis sum.
- Separate treatment of k = 0, ±N, ±2N, … (the "DC-like" indices).
- Periodicity of a_k in k with period N, illustrated for N = 10, 20, 30.

**Equations**
- `a_k = (1/N) Σ_{n=⟨N⟩} x[n] e^{-jk(2π/N)n} = (1/N) Σ_{n=-N₁}^{N₁} (1)·e^{-jk(2π/N)n}`  (the "1" circled, red label x[n])
- Geometric sum box: `Σ_{k=m}^{n} a r^k = a(r^m − r^{n+1})/(1−r)`, where `|r| < 1`
- `Σ_{n=-N₁}^{N₁} e^{-jk(2π/N)n} = [e^{-jk(2π/N)N₁} − e^{-jk(2π/N)(N₁+1)}] / [1 − e^{-jk(2π/N)}] = [e^{-jk(2π/N)N₁} − e^{-jk(2π/N)N₁}e^{-jk(2π/N)}] / [1 − e^{-jk(2π/N)}]`
- ★ numerator: `e^{-jk(2π/2N)}[e^{+jk(2π/N)(N₁+½)} − e^{-jk(2π/N)(N₁+½)}] = e^{-jk(2π/2N)}·2j sin((2πk/N)(N₁+½))`  [boxed]  (brace: `= 2j sin(2πk(N₁+0.5)/N)`)
- ★★ denominator: `e^{-jk(2π/2N)}[e^{jk(2π/2N)} − e^{-jk(2π/2N)}] = e^{-jk(2π/2N)}·2j sin(πk/N)`  [boxed]
- `a_k = (1/N) · [e^{-jk(2π/2N)}·2j sin((2πk/N)(N₁+½))] / [e^{-jk(2π/2N)}·2j sin(πk/N)] = (1/N)·sin((2πk/N)(N₁+½))/sin(πk/N)`  [boxed]  (common factors struck out)
- For `k = 0, ±N, ±2N, …`: `a_k = (1/N)Σ_{n=⟨N⟩} x[n] = (1/N)Σ_{n=-N₁}^{N₁} 1 = (2N₁+1)/N`  [boxed]

**Examples**
- **Example (DT periodic square wave)**
  - Given: DT square wave, x[n] = 1 for |n| ≤ N₁ and 0 otherwise within each period N (figure with axis marks −N, −N₁, N₁, N).
  - Asked: determine and plot the Fourier series coefficients of x[n].
  - Method: geometric sum of the analysis sum, symmetric-exponent factoring into sines; separate DC-index case.
  - Answers: `a_k = (1/N)·sin((2πk/N)(N₁+½))/sin(πk/N)` for k ≠ 0, ±N, ±2N, …; `a_k = (2N₁+1)/N` for k = 0, ±N, ±2N, ….

**Homework** — none.

**Figures**
- MATLAB stem plot of `x[n]`, y 0 to 1 (ticks 0, 0.5, 1), x-axis labelled with −N, −N₁, N₁, N; unit samples for |n| ≤ N₁ repeating with period N.
- MATLAB: three stacked stem plots of `a_k` vs k, k from −40 to 40, titled `N = 10, N₁ = 2` (y ticks 0, 0.2, 0.4), `N = 20, N₁ = 2` (0, 0.1, 0.2), `N = 30, N₁ = 2` (0, 0.1, 0.2); a_k takes negative values between lobes. Red annotations "Periodic by 10", "Periodic by 20", "Periodic by 30" with red circles on the k = 0 and k = N peaks.

**Ambiguities**
- **A33-01**: "Since |e^{-jk(2π/N)n}| ≤ 1, we can use geometric sum formula" together with the boxed condition "where |r| < 1". Here |r| = 1 exactly, so the stated condition is not met; the *finite* geometric sum only requires r ≠ 1. As written the justification is mathematically suspect.
- **A33-02**: In the `N = 10, N₁ = 2` subplot the k = 0 / k = ±10 stems reach ≈0.5 = (2N₁+1)/N, above the top labelled tick 0.4; peak values are not readable from the axis.

---

## p.34 — (DT square wave, FS representation and MSE) + Homework (DT sawtooth, N = 11)  [no week tag]

**Concepts**
- Full DTFS representation of the DT square wave.
- No convergence issues / no Gibbs phenomenon in DT, because a periodic x[n] is completely specified by a finite number N of parameters (one single period).
- DT analysis of a sawtooth-type sequence; purely imaginary coefficients; a_k periodic with period 11.

**Equations**
- `x[n] = (2N₁+1)/N + Σ_{k=⟨N⟩, k≠0} (1/N)·[sin((2πk/N)(N₁+½))/sin(πk/N)] e^{jk(2π/N)n}`  [boxed]
- Homework: `k = 0, ±11, ±22, …:  a₀ = (1/N)Σ_{n=⟨N⟩} x[n] = (1/11)(−5 + −4 + … + 4 + 5) = 0`  [boxed]
- `k ≠ 0, ±11, ±22, …:  a_k = (1/11) Σ_{n=-5}^{5} x[n] e^{-jk(2π/11)n}`
- `a_k = (1/11)[ −5e^{-jk(2π/11)(-5)} − 4e^{-jk(2π/11)(-4)} − 3e^{-jk(2π/11)(-3)} − 2e^{-jk(2π/11)(-2)} − e^{jk(2π/11)(-1)} + 5e^{-jk(2π/11)5} + 4e^{-jk(2π/11)(4)} + 3e^{-jk(2π/11)3} + 2e^{-jk(2π/11)(2)} + e^{-jk(2π/11)(1)} ]`  (see A34-01 for the n = −1 term)
- `a_k = (1/11)[ −5·2j sin(10πk/11) − 4·2j sin(8πk/11) − 3·2j sin(6πk/11) − 2·2j sin(4πk/11) − 2j sin(2πk/11) ]`
- `a_k = −j(10/11)sin((10π/11)k) − j(8/11)sin((8π/11)k) − j(6/11)sin((6π/11)k) − j(4/11)sin((4π/11)k) − j(2/11)sin((2π/11)k)`  [boxed]
- Red note: `a_k = a_{k+11}`

**Examples**
- No new "Example"-tagged block (continuation of the p33 example, illustrated by the MATLAB reconstruction figure).

**Homework**
- "Determine and plot the Fourier Series coefficients of x[n]" for the plotted DT sawtooth (values −5…5, period 11). Full solution given, including the boxed a_k above and the MATLAB coefficient plots.

**Figures**
- MATLAB (five stacked stem subplots, DT square wave), n from −12 to 12, y 0 to 1 (ticks 0, 0.5, 1):
  - `x₁[n]` titled "Original Signal": unit samples for |n| ≤ 2 within each period of 9; red annotations "2 ↘ N₁" (pointing at n = 2) and "↓ N = 9".
  - `x₁[n] / x₂[n] / x₃[n] / x₄[n]` reconstructions titled `MSE=0.045`, `MSE=0.037`, `MSE=0.011`, `MSE=0.000`; red ellipse + "No Gibbs phenomena" on the last one.
- MATLAB (homework signal): `x[n]` stem, n from −16 to 16, y from −5 to 5; rising ramp −5…5 repeating with period 11.
- MATLAB (homework coefficients), k from −20 to 20:
  - `|a_k|`: y 0 to 2 (ticks 0, 0.5, 1, 1.5, 2); zeros at k = 0, ±11; ≈1.8 at k = ±1 (and ±10, ±12, ±21 by periodicity); ≈0.93, ≈0.67, ≈0.55, ≈0.52, ≈0.5 for the successive indices toward mid-period.
  - `∠a_k`: only ±π/2 and 0. Zero at k = 0, ±11. `−π/2` at k = −19, −17, −15, −13, −10, −8, −6, −4, −2, 1, 3, 5, 7, 9, 12, 14, 16, 18, 20; `+π/2` at k = −20, −18, −16, −14, −12, −9, −7, −5, −3, −1, 2, 4, 6, 8, 10, 13, 15, 17, 19.

**Ambiguities**
- **A34-01**: In the a_k expansion (first bracket line, last term) the n = −1 term is written `− e^{jk(2π/11)(-1)}` — unlike the other four terms in that line, the minus sign in the exponent is either missing or drawn as a detached bar over the `e`; cannot be resolved at this resolution. Position: end of the first bracket row, right-hand side.
- **A34-02**: The homework never states in words that x[n] = n on −5 ≤ n ≤ 5 or that N = 11; both must be inferred from the plot and from the "1/11" and "Σ_{n=-5}^{5}" used in the solution.

---

## p.35 — (DT sawtooth reconstruction figure) + PROPERTIES OF FOURIER SERIES COEFFICIENTS: (1) Linearity, (2) Time-Shift  [red box: Week7—Lec1]

**Concepts**
- DTFS reconstruction of the DT sawtooth with increasing numbers of harmonics; exact at 5 harmonics (N = 11).
- Property (1) Linearity, CT and DT.
- Property (2) Time-Shift, CT and DT; a time shift changes only the phase: |b_k| = |a_k|.

**Equations**
- Red note on figure: `x₂[n] = Σ_{k=-2}^{2} a_k e^{jkω₀n}`; red note `N = 11`
- Linearity (CT): `A x₁(t) + B x₂(t) ←FS→ A a_k + B b_k`  [boxed + highlighted]
- Linearity (DT): `A x₁[n] + B x₂[n] ←FS→ A a_k + B b_k`  [boxed + highlighted]
- Time-shift (CT): `x(t ± t₀) ←FS→ a_k e^{±jkω₀t₀}`, where `ω₀ = 2π/T`  [boxed + highlighted]
- Time-shift (DT): `x[n ± n₀] ←FS→ a_k e^{±jkω₀n₀}`, where `ω₀ = 2π/N`  [boxed + highlighted]
- Proof: `y(t) = x(t − t₀) ←FS→ b_k = (1/T)∫_T y(t)e^{-jkω₀t}dt = (1/T)∫_T x(t−t₀)e^{-jkω₀t}dt`
- `τ = t − t₀`, `dτ/dt = 1 → dτ = dt`; `b_k = (1/T)∫_T x(τ)e^{-jkω₀(τ+t₀)}dτ = e^{-jkω₀t₀}·(1/T)∫_T x(τ)e^{-jkω₀τ}dτ`  (brace: `a_k`)
- `|b_k| = |a_k|`;  `b_k = a_k e^{-jkω₀t₀}`  [boxed, ∎]

**Examples** — none.

**Homework** — none.

**Figures**
- MATLAB (five stacked stem subplots), n from −16 to 16 (ticks −16, −12, −8, −4, 0, 4, 8, 12, 16), y −5 to 5 in each:
  - top: `x[n]` (exact DT sawtooth, period 11);
  - `x₂[n]` title `MSE=1.990`; `x₃[n]` title `MSE=1.115`; `x₄[n]` title `MSE=0.510`; `x₅[n]` title `MSE=0.000` with a red ellipse and "No Gibbs Phenomena".

**Ambiguities**
- **A35-01**: Only `x₂[n] = Σ_{k=-2}^{2} a_k e^{jkω₀n}` is defined (red margin note); the truncation ranges implied by the labels x₃[n], x₄[n], x₅[n] are never written, and the top subplot's y-label (`x[n]` vs `x₁[n]`) is not clearly readable at this resolution.

---

## p.36 — PROPERTIES: (3) Time-Reversal, (4) Conjugation, (5) Multiplication  [no week tag]

**Concepts**
- Time reversal maps a_k → a_{−k}; consequences for even and odd signals.
- Conjugation property; conjugate symmetry for real signals; real&even ⇒ real and even coefficients; real&odd ⇒ purely imaginary and odd coefficients.
- Multiplication in time ⇔ convolution in frequency (labelled "DISCRETE-TIME CONVOLUTION" for both boxes).

**Equations**
- `x(−t) ←FS→ a_{−k}` and `x[−n] ←FS→ a_{−k}`  [boxed + highlighted]
- Proof: `x(t) = Σ_k a_k e^{jkω₀t}`; replace t by −t: `x(−t) = Σ_{k=-∞}^{∞} a_k e^{-jkω₀t}`; let `k = −m`: `x(−t) = Σ_{m=-∞}^{∞} a_{−m} e^{jmω₀t}` ⇒ `x(−t) ←FS→ a_{−k}`  [boxed, ∎]
- If x(t) even, `x(t) = x(−t)` ⇒ `a_k = a_{−k}`  [highlighted]
- If x(t) odd, `x(t) = −x(−t)` ⇒ `a_k = −a_{−k}`  [highlighted]
- `x*(t) ←FS→ (a_{−k})*` and `x*[n] ←FS→ (a_{−k})*`  [boxed + highlighted]
- Proof: `a_k = (1/T)∫_T x(t)e^{-jkω₀t}dt` ⇒ `(a_k)* = (1/T)∫_T x*(t)e^{jkω₀t}dt`; replace k by −k: `(a_{−k})* = (1/T)∫_T x*(t)e^{-jkω₀t}dt`  [∎]
- If x(t) real: `x(t) = x*(t)` ⇒ `a_k = (a_{−k})*` or `(a_k)* = a_{−k}`  [boxed]  (also `|a_k| = |a_{−k}|`)
- Real & even: `x(t) = x*(t) = x(−t)` ⇒ `a_k = (a_{−k})* = a_{−k}` ⇒ FS coefficients are "real" and "even"
- Real & odd: `x(t) = x*(t) = −x(−t)` ⇒ `a_k = (a_{−k})* = −a_{−k}` ⇒ FS coefficients are "purely imaginary" and "odd"
- Purple derivation: `a_k = Re{a_k} + j Im{a_k}` ⇒ `a_{−k} = −a_k = −Re{a_k} − j Im{a_k}`; `(a_{−k})* = −Re{a_k} + j Im{a_k}`; thus `Re{a_k} + j Im{a_k} = −Re{a_k} + j Im{a_k}` (imaginary parts struck out) ⇒ `Re{a_k} = −Re{a_k} = 0`, hence `a_k = j Im{a_k}` : purely imaginary
- Multiplication (CT): `x(t)y(t) ←FS→ Σ_{l=-∞}^{∞} a_l b_{k−l}`  [boxed + highlighted]
- Multiplication (DT): `x[n]y[n] ←FS→ Σ_{l=-∞}^{∞} a_l b_{k−l}`  [boxed + highlighted]  (blue arrows: "multiplication in time-domain" / "Convolution in frequency domain" / "DISCRETE-TIME CONVOLUTION")

**Examples** — none.

**Homework** — none.

**Figures** — none.

**Ambiguities**
- **A36-01**: The DT multiplication property is written with an infinite convolution sum `Σ_{l=-∞}^{∞} a_l b_{k−l}`. For DT Fourier series it should be a periodic convolution over one period (`Σ_{l=⟨N⟩}`), which is what the printed Table 2 on p37 shows — the two pages disagree.
- **A36-02**: In the boxed conjugation results the asterisk is drawn above the `a` with `−k` as subscript (`a*_{−k}`); recorded here as `(a_{−k})*` on the strength of the proof line, but the glyph itself is ambiguous between `(a_{−k})*` and `(a*)_{−k}`.

---

## p.37 — (6) Parseval's Relation / "Summary of the Properties" (Tables 1 and 2) / FOURIER SERIES AND LTI SYSTEMS  [no week tag]

**Concepts**
- Parseval's relation: average power in one period equals the sum of |a_k|² over harmonics; |a_k|² = average power in the k-th harmonic.
- Printed summary tables of CT and DT Fourier series properties (textbook-style inserts).
- Fourier series and LTI systems: since complex exponentials are eigenfunctions, the output of a periodic input is again a linear combination of complex exponentials.
- Transfer function vs frequency response, CT and DT.

**Equations**
- CT Parseval: `(1/T) ∫_T |x(t)|² dt = Σ_{k=-∞}^{∞} |a_k|²`  [boxed + highlighted]
- DT Parseval: `(1/N) Σ_{n=⟨N⟩} |x[n]|² = Σ_{k=⟨N⟩} |a_k|²`  [boxed + highlighted]
- Blue labels: left side "AVG. POWER IN ONE PERIOD"; `|a_k|²` : "AVG. POWER IN THE k-TH HARMONIC" (both CT and DT).
- `H(s) = ∫_{-∞}^{∞} h(t) e^{-st} dt`  [boxed] : Transfer Function (CT)
- `H(z) = Σ_{n=-∞}^{∞} h[n] z^{-n}`  [boxed] : Transfer Function (DT)
- `H(jω) = ∫_{-∞}^{∞} h(t) e^{-jωt} dt`  [boxed; red `s = jω`] : Frequency Response (CT)
- `H(e^{jω}) = Σ_{n=-∞}^{∞} h[n] e^{-jωn}`  [boxed; red `z = e^{jω}`] : Frequency Response (DT)
- `e^{st} → [h(t)] → H(s)e^{st}` (CONTINUOUS-TIME);  `z^n → [h[n]] → H(z)z^n` (DISCRETE-TIME)

**Examples** — none.

**Homework** — none.

**Figures**
- Two typeset (printed, not MATLAB, textbook-style) tables pasted side by side:
  - **Table 1: Properties of the Continuous-Time Fourier Series** — header equations for x(t) and a_k; rows: Linearity, Time-Shifting, Frequency-Shifting, Conjugation, Time Reversal, Time Scaling, Periodic Convolution, Multiplication, Differentiation, Integration, Conjugate Symmetry for Real Signals, Real and Even Signals, Real and Odd Signals, Even-Odd Decomposition of Real Signals, and Parseval's Relation for Periodic Signals.
  - **Table 2: Properties of the Discrete-Time Fourier Series** — header equations for x[n] and a_k; rows: Linearity, Time shift, Frequency Shift, Conjugation, Time Reversal, Time Scaling, Periodic Convolution, Multiplication, First Difference, Running Sum, Conjugate Symmetry for Real Signals, Real and Even Signals, Real and Odd Signals, Even-Odd Decomposition of Real Signals, and Parseval's Relation for Periodic Signals.
- Hand-drawn block diagrams for CT and DT eigenfunction relations (bottom of page).

**Ambiguities**
- **A37-01**: Both tables are inserted at very small type; individual cell entries (notably Table 1 "Integration" and Table 2 "Time Scaling"/"Running Sum" rows) are at/below the legibility limit at 160 dpi — the row labels and main header formulas are readable, the fine print in those cells is **ILLEGIBLE** and has not been transcribed.

---

## p.38 — (FS and LTI systems, continued) + Example ("CT LOW-PASS FILTERING")  [no week tag]

**Concepts**
- Harmonic-by-harmonic filtering picture: each FS component a_k e^{jkω₀t} is scaled by H(jkω₀).
- Output FS coefficients b_k = a_k H(jkω₀) (CT) and b_k = a_k H(e^{jkω₀}) (DT).
- Frequency response of the causal one-pole system h(t) = e^{-t}u(t); low-pass behaviour, |H(jω)| → 0 as ω → ∞.
- Magnitude/phase from the complex-plane triangle: tan(θ) = ω, tan⁻¹(ω) = θ.

**Equations**
- Single-input relations (red-annotated boxes): `a_k e^{jkω₀t} --h(t)--> a_k H(jkω₀) e^{jkω₀t}` (red "s" over jkω₀t / jkω₀); `a_k e^{jkω₀n} --h[n]--> a_k H(e^{jkω₀}) e^{jkω₀n}` (red "z" over e^{jkω₀})
- CT: `x(t) = Σ_{k=-∞}^{∞} a_k e^{jkω₀t} --H(jkω₀)--> y(t) = Σ_{k=-∞}^{∞} a_k H(jkω₀) e^{jkω₀t}`  [boxed + highlighted; brace over a_kH(jkω₀): `= b_k`]
- DT: `x[n] = Σ_{k=⟨N⟩} a_k e^{jkω₀n} --H(e^{jkω₀})--> y[n] = Σ_{k=⟨N⟩} a_k H(e^{jkω₀}) e^{jkω₀n}`  [boxed + highlighted; brace: `= b_k`]
- `H(jω) = ∫ h(t)e^{-jωt}dt = ∫_0^∞ e^{-t}·e^{-jωt}·dt = −(1/(1+jω))[e^{-t(1+jω)}]_0^∞ = 1/(1+jω)`  [boxed]
- `|H(jω)| = |1| / |1+jω| = 1/√(1+ω²)`  [boxed]
- `∠H(jω) = ∠1 − ∠(1+jω) = 0 − tan⁻¹(ω)`  [boxed]
- Green margin note: `As ω → ∞, |H(jω)| → 0`
- Purple inset: `tan(θ) = ω`, `tan⁻¹(ω) = θ`
- `T₀ of cos(πt): T₀ = 2π/π = 2 s`  [boxed]; `T₀ of sin(2πt): T₀ = 2π/2π = 1 s`  [boxed]; `T₀ of cos(3πt): T₀ = 2π/3π = 2/3 s`  [boxed]
- `T₀ of x(t) is LCM((1,2), 2/3)`. Since `LCM(1,2) = 2`: `T₀ = LCM(2, 2/3) = LCM(6/3, 2/3) = LCM(6,2)/LCM(3,3) = 6/3 = 2 s`
- `T₀ = 2 s`  [boxed]  and  `ω₀ = 2π/T₀ = π`  [boxed]

**Examples**
- **Example (CT LOW-PASS FILTERING)** — begins on this page, not finished on it.
  - Given: `x(t) = 1 + cos(πt) + sin(2πt) + cos(3πt + π/3)` input to an LTI system with impulse response `h(t) = e^{-t}u(t)`.
  - Asked: determine the output signal and plot its Fourier series coefficients.
  - Method so far: compute H(jω) by direct integration; magnitude and phase; identify component periods and take the LCM to get T₀ and ω₀.
  - Results on this page: `H(jω) = 1/(1+jω)`; `|H(jω)| = 1/√(1+ω²)`; `∠H(jω) = −tan⁻¹(ω)`; `T₀ = 2 s`; `ω₀ = π`. (Output signal not yet computed on p38.)

**Homework** — none.

**Figures**
- Hand-drawn block diagram (top left): x(t) fanned into parallel branches `a_{−k}e^{-jkω₀t}`, `a₀`, `a_k e^{jkω₀t}`, each through a `H(jω)` block, producing `a_{−k}H(−jkω₀)e^{-jkω₀t}`, `a₀H(0)`, `a_k H(jkω₀)e^{jkω₀t}`, summed at a "+" node into y(t); vertical dots indicate further branches. (Typeset-looking boxed diagram, not MATLAB.)
- MATLAB (two side-by-side continuous-curve plots):
  - `|H(jω)|` vs ω, ω-axis ticks −6π, −3π, 0, 3π, 6π, y 0 to 1 (ticks 0, 0.5, 1); sharp peak of 1 at ω = 0 decaying both ways; red annotation + arrow "Low-pass filter".
  - `∠H(jω)` vs ω, same ω ticks, y ticks −π/2, 0, π/2; monotonically decreasing from ≈+π/2 to ≈−π/2 through 0 at ω = 0.
- Hand-drawn complex-plane inset (purple) showing the vector 1 + jω with angle θ, axes Re/Im, marking 1 on Re and ω on Im.

**Ambiguities**
- **A38-01**: `T₀ of x(t) is LCM((1,2), 2/3)` — the nested/paired notation LCM((1,2), 2/3) is non-standard and unexplained; the follow-up again uses LCM(numerators)/**LCM**(denominators) (`LCM(6,2)/LCM(3,3)`) rather than GCD of denominators (cf. A26-01).
- **A38-02**: The evaluation `−(1/(1+jω))[e^{-t(1+jω)}]_0^∞ = 1/(1+jω)` requires Re{1+jω} > 0 for the upper limit to vanish; the convergence condition is never stated. Also the first `∫` in that chain carries no limits while the second is written `∫_0^∞`.
- **A38-03**: The example is incomplete on this page — the requested output signal and the plot of its Fourier series coefficients do not appear on p38 (presumably continued on p39, outside the audited range).

---

### Counts for pages 22–38
- "Example"-tagged worked examples: **8** (p24→p25 delay system; p26 pathological signals; p26→p27 x(t)=1+½cos2πt+sin3πt; p29 periodic rectangular wave; p31 periodic impulse train; p32 DT sin+cos; p33 DT periodic square wave; p38 CT low-pass filtering).
- "Homework"-tagged items: **4** (p26 LCM(2/9, 8/21); p27 x(t)=3+5cos+4sin; p30→p31 CT saw-tooth wave; p34 DT saw-tooth, N = 11).
- Ambiguity items: **28** (A22-01, A22-02, A23-01, A23-02, A24-01, A26-01, A26-02, A27-01, A27-02, A28-01, A28-02, A29-01, A29-02, A30-01, A31-01, A31-02, A32-01, A32-02, A33-01, A33-02, A34-01, A34-02, A35-01, A36-01, A36-02, A37-01, A38-01, A38-02, A38-03). No ambiguity found on p25.
