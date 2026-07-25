# EE311 Source Inventory — Part 1 (PDF pp. 1–21)

Source: `EE311 - Lecture Notes.pdf`, 88 pages, handwritten + MATLAB figures.
Author/instructor: Huseyin Ugur Yildiz. Rendered at 160 dpi for visual audit.

Legend: **[V]** = verified visually at 160 dpi; **[A]** = ambiguity/issue logged; **[E]** = editorial enhancement opportunity.

---

## p.1 — Cover
"EE 311 — SIGNALS AND SYSTEMS / Lecture Notes / Huseyin Ugur Yildiz". No technical content.
→ Destination: title scene (S-000). Version/provenance block.

## p.2 — CH#1 Signals; Signal Energy and Power [Week1–Lec1]
- Signal = physical variation carrying information; function of one or more independent variables.
- Two types: continuous-time `x(t), ∀t ∈ ℝ`; discrete-time `x[n], ∀n ∈ ℤ` (integer time index; `stem(·)` in MATLAB).
- MATLAB figure: `x(t)=cos(t)` over t∈[0,20] (continuous curve) and `x[n]=cos(n)` over n∈[0,20] (stem).
- Energy = Power × Time.
- Instantaneous power: `p(t) = v(t) i(t) = v(t)·(v(t)/R) = (1/R) v²(t)`.
- Total energy over t₁≤t≤t₂: `E = ∫_{t₁}^{t₂} p(t) dt = ∫_{t₁}^{t₂} (1/R) v²(t) dt`. Annotation: "square of the voltage signal".
- Normalized (R=1) infinite-interval energy:
  `E∞ ≜ lim_{T→∞} ∫_{-T}^{T} |x(t)|² dt = ∫_{-∞}^{∞} |x(t)|² dt`  ⚠ "The integral may not converge".
- `x(t)` may be complex-valued; `|x(t)|² = x(t) x*(t)`.
- DT: `E∞ ≜ lim_{N→∞} Σ_{n=-N}^{N} |x[n]|² = Σ_{n=-∞}^{∞} |x[n]|²`  ⚠ "The summation may not converge".
- Average power over t₁≤t≤t₂: `P = 1/(t₂-t₁) ∫_{t₁}^{t₂} p(t) dt`.
- `P∞ ≜ lim_{T→∞} (1/2T) ∫_{-T}^{T} |x(t)|² dt`;  `P∞ ≜ lim_{N→∞} 1/(2N+1) Σ_{n=-N}^{N} |x[n]|²`
  (annotation: 2N+1 = # of elements between −N and +N).
- **[A-01]** The notes use the R=1 *normalized* convention silently when moving from `(1/R)v²` to `|x|²`. Must be stated explicitly in the artifact.

## p.3 — Energy/power classification; time shift; time reversal
- Energy signals: finite energy (E∞<∞) **and** zero average power (P∞=0).
- Power signals: finite power (P∞<∞) **and** infinite energy (E∞→∞).
- **Example 1 [V]**: `x(t)=1, 0≤t≤1; 0 o.w.` → `E∞=∫₀¹1 dt=1<∞`; `P∞=lim_{T→∞}(1/2T)∫₀¹1dt = lim 1/(2T)=0` ⇒ energy-type.
- **Example 2 [V]**: `x[n]=4, ∀n∈ℤ` → `E∞=Σ|4|²→∞`; `P∞=lim_{N→∞} (1/(2N+1))(2N+1)·16 = 16<∞` ⇒ power-type.
- BASIC OPERATIONS.
  (1) Time shift `x(t) → x(t−t₀)`; t₀>0 delay, t₀<0 advance. Figure: triangular pulse `x(t)` on [−1,1] peak 1 at t=0; `x(t+3)` on [−4,−2]; `x(t−3)` on [2,4].
  (2) Time reversal `x(t)→x(−t)`, `x[n]→x[−n]`: flip over the y-axis (the notes say "y-axis"; strictly the ordinate/vertical axis). Figure: `x(t)` triangle on [1,3] peak at 2 → `x(−t)` triangle on [−3,−1].
- **Homework H1.1**: given `x[n]` with x[−1]=1, x[0]=2, x[1]=1, find `x[n+4]`, `x[n−5]`.
- **[A-02]** p.2's OCR/handwriting for the DT homework reads `x[n+4]`; the extracted text layer renders it "x[n−14]". Visual reading at 160 dpi is authoritative: `x[n+4]`.

## p.4 — Time scaling; combination of operations
- **Homework H1.2**: triangular `x(t)` on [−1,1], plot `x(−t)`.
- (3) Time scaling `x(at), a>0`. Figure: rectangular `x(t)` on [1,3] → `x(2t)` on [0.5,1.5] (decimation / speed up); `x(0.5t)` on [2,6] (expansion / slowed down). Rule: `a>1` ⇒ decimation, `0<a<1` ⇒ expansion. [V]
- MATLAB figure: `x₁(t)=cos(t/2)`, `x₂(t)=cos(t)`, `x₃(t)=cos(2t)` on t∈[0,100] — expansion ← → decimation.
- Combination: for `x(at−b)` use **"shift, then scale"**:
  (1) `v(t) = x(t−b)` : shift; (2) `y(t) = v(at) = x(at−b)` : scale.
- **Example [V]**: `x(t)` piecewise: 0 for t<−2; 1 on [−2,0]; 2 on [0,2]; linear 2→0 on [2,4]; plot `x(3t−5)`.
  `v(t)=x(t−5)`: breakpoints 3,5,7,9. `y(t)=v(3t)=x(3t−5)`: breakpoints 1, 5/3, 7/3, 3. [V]
- **[A-03]** The heading writes "Time Scaling: x(t) = x(at)" — an abuse of notation (should be `y(t)=x(at)`). Correct silently-flagged in artifact as a notation note.

## p.5 — Periodicity; even & odd [Week1–Lec2]
- CT periodic: ∃ T>0 with `x(t)=x(t+T) ∀t∈ℝ`. DT periodic: ∃ integer N>0 with `x[n]=x[n+N] ∀n∈ℤ`. Otherwise aperiodic.
- **Example [V]**: MATLAB sawtooth `x(t)` with periods T=4,8,12,…, fundamental `T₀=4` (arrows annotate T=8 and T=16); DT signal `y[n]` with periods N=8,16,24,…, fundamental `N₀=8`.
- Definition: `T₀` smallest T>0 satisfying periodicity; `ω₀ = 2π/T₀` fundamental frequency.
- Definition: `N₀` smallest integer N>0; `ω₀ = 2π/N₀` fundamental frequency of `x[n]`.
- EVEN & ODD: even if `x(t)=x(−t)` (`x[n]=x[−n]`); odd if `x(t)=−x(−t)` (`x[n]=−x[−n]`). For odd signals `x(0)=−x(0) ⇒ x(0)=0`.
- MATLAB figure: `x₁(t)=t²` even, `x₂(t)=t³` odd, `x₃(t)=e^{−t}` neither.

## p.6 — Even/odd decomposition; DT impulse and step
- `Ev{x(t)} = ½x(t) + ½x(−t)`; `Odd{x(t)} = ½x(t) − ½x(−t)`; sum ⇒ `x(t)=Ev{x(t)}+Odd{x(t)}`. Same for `x[n]`.
- IMPULSE AND STEP SIGNALS.
- DT unit impulse `δ[n] = 1 (n=0), 0 o.w.`; DT unit step `u[n] = 1 (n≥0), 0 o.w.`
- First difference (derivative in DT): `δ[n] = u[n] − u[n−1]`, with a stem construction figure.
- Running sum: `u[n] = Σ_{k=0}^{∞} δ[n−k] = δ[n]+δ[n−1]+δ[n−2]+…`, with a stem construction figure.
- Representation property: `u[n] = Σ_{k=-∞}^{∞} u[k] δ[n−k] = … + u[−1]δ[n+1] + u[0]δ[n] + u[1]δ[n−1] + … = δ[n]+δ[n−1]+…`
- **Sampling property (DT)**: `x[n] δ[n−n₀] = x[n₀] δ[n−n₀]`.
  Check with n₀=2, `x[n]` = {x[0]=1, x[1]=2, x[2]=3}: `x[2]δ[n−2] = 3δ[n−2]`. [V]

## p.7 — DT sifting; CT impulse and step; CT complex exponentials [Week2–Lec1]
- **Sifting property (DT)**: `x[n₀] = Σ_{n=-∞}^{∞} x[n] δ[n−n₀]`. Check n₀=2 with the same x[n]: `3 = x[0]δ[−2]+x[1]δ[−1]+x[2]δ[0] = 3`. [V]
- CT unit impulse: `δ(t) = ∞ (t=0), 0 o.w.`, "Dirac Delta Function", area `∫_{-∞}^{∞} δ(t)dt = 1`, drawn as arrow of weight (1). Limiting rectangle of width ε and height 1/ε as ε→0.
  **[A-04]** The `δ(t)=∞ at t=0` formulation is the usual informal engineering definition; δ is a distribution, not a function. Artifact must state this distinction (prompt §7 requires distinguishing functions from distributions).
- `δ(t) = d u(t)/dt`;  `u(t) = ∫_{-∞}^{t} δ(τ)dτ`.
- CT unit step `u(t) = 1 (t≥0), 0 o.w.` Representation property `u(t) = ∫_{-∞}^{∞} u(τ) δ(t−τ) dτ`.
- **Sampling property (CT)**: `x(t) δ(t−t₀) = x(t₀) δ(t−t₀)`.
- **Sifting property (CT)**: `x(t₀) = ∫_{-∞}^{∞} x(t) δ(t−t₀) dt`. Figure: arrow at t₀ scaled to x(t₀) on the curve x(t).
- CONTINUOUS-TIME COMPLEX EXPONENTIALS: `x(t) = C e^{at}`, `C, a ∈ ℂ`.
- Real-valued case `C ∈ ℝ, a ∈ ℝ`. MATLAB figure: decays `e^{−0.5t}, e^{−t}, e^{−2t}` on [0,10]; growths `e^{0.5t}, e^{t}, e^{2t}` on [−10,0]. If a=0 ⇒ `x(t)=C` constant. a<0 decay, a>0 growth; larger |a| ⇒ faster.

## p.8 — Periodicity of CT complex exponentials; general complex exponentials
- `C = A e^{jθ}` (polar), `a = jω₀` purely imaginary, `A, θ, ω₀ ∈ ℝ`:
  `x(t) = C e^{at} = A e^{jθ} e^{jω₀t} = A e^{j(ω₀t+θ)}`.
- Euler: `e^{jx} = cos x + j sin x` ⇒ `x(t) = A cos(ω₀t+θ) + jA sin(ω₀t+θ)`, Re{·} and Im{·} labelled.
  `ω₀` angular frequency (rad/s), `θ` phase shift (rad), `A` amplitude (V).
- Periodicity derivation: `A e^{j(ω₀t+θ)} = A e^{j(ω₀(t+T)+θ)}` ⇒ `1 = e^{jω₀T}` ⇒ `(e^{j2π})^k = e^{jω₀T}` ⇒ `j2πk = jω₀T` ⇒ `T = (2π/ω₀) k, k ∈ ℤ`. Fundamental period `T₀ = 2π/ω₀` (k=1); `ω₀ = 2π/T₀`.
- **Example [V]**: `x(t) = e^{j0.5πt}` ⇒ `T₀ = 2π/0.5π = 4 s`. MATLAB: Re{x} and Im{x} over t∈[0,12], T₀=4 annotated.
- General complex exponentials: `C = Ae^{jθ}`, `a = r + jω₀`:
  `x(t) = A e^{rt} e^{j(ω₀t+θ)} = A e^{rt} cos(ω₀t+θ) + j A e^{rt} sin(ω₀t+θ)`.

## p.9 — Damped/growing sinusoids; DT complex exponentials
- MATLAB figure grid: `Re{2e^{−0.5t}e^{j2πt}}`, `Im{…}` (r=−0.5); `2e^{0.5t}e^{j2πt}` (r=0.5); `2e^{0t}e^{j2πt}` (r=0), t∈[0,5], with ±Ae^{rt} envelopes dashed.
- DISCRETE-TIME COMPLEX EXPONENTIALS: `x[n] = C e^{βn}`, `C, β ∈ ℂ`; let `α = e^{β}` ⇒ `x[n] = C α^n`.
- Real-valued case `C, α ∈ ℝ`. MATLAB: `x[n]=0.5^n` (0<α<1, monotonically decreasing), `y[n]=2^n` (α>1, monotonically increasing), n∈[0,10].
- Complex-valued case: `C = |C|e^{jθ}`, `α = |α|e^{jω₀}`:
  `x[n] = |C||α|^n e^{j(ω₀n+θ)} = |C||α|^n cos(ω₀n+θ) + j|C||α|^n sin(ω₀n+θ)`.

## p.10 — DT exponential envelopes; DT periodicity condition
- MATLAB figure: `|α|^n cos(0.14πn)` and `|α|^n sin(0.14πn)` with ω₀=0.14π, |C|=1, θ=0 for α=1 (sinusoidal), α=1.05 (growing), α=0.95 (decaying), n∈[−20,20].
- Periodicity of DT complex exponentials: `x[n] = C e^{jω₀n}`, `x[n]=x[n+N]` ⇒ `1 = e^{jω₀N}` ⇒ `j2πk = jω₀N` ⇒ `N = (2π/ω₀) k, k ∈ ℤ`.
  ⚠ "Since N should be an integer, ω₀ should be a rational multiple of 2π."
- **Example [V]**: `x[n] = e^{j(3π/5)n}` ⇒ `N = (2π/(3π/5))k = (10/3)k`; smallest k making N∈ℤ is k=3 ⇒ `N₀ = 10`. MATLAB Re/Im stems n∈[−20,20], N₀=10 annotated.
- **[A-05]** Strictly, the condition is `ω₀/2π ∈ ℚ`; the note's phrase "ω₀ should be a rational multiple of 2π" is correct and should be kept, but the artifact should show the equivalent `ω₀/2π = k/N` form.

## p.11 — Systems; memorylessness; invertibility
- A system is a quantitative description of a physical process transforming input signals into output signals; "black box" abstraction, deterministic. Block diagrams: `x(t) → CT System → y(t)`, `x[n] → DT System → y[n]`.
- SYSTEM PROPERTIES.
- (1) **Memoryless**: output at time t (or n) depends only on the input at time t (or n).
  (a) `y(t) = [2x(t) − x²(t)]²` : memoryless (no `x(t+1)` or `x(t−2)` terms). [V]
  (b) `y[n] = x[n]` : memoryless.
  (c) `y[n] = x[n−1]` : not memoryless.
  (d) `y[n] = x[n] + y[n−1]` : not memoryless. Proof by back-substitution ⇒ `y[n] = Σ_{k=0}^{∞} x[n−k]`. [V]
  - Circuit examples: resistor `v(t) = R i(t)` memoryless; capacitor `v(t) = (1/C)∫_{-∞}^{t} i(τ)dτ` not memoryless.
- (2) **Invertibility**: distinct inputs produce distinct outputs (one-to-one mapping). Two ways: (1) find an inversion formula, (2) find a counterexample.

## p.12 — Invertibility examples; causality; stability [Week2–Lec2]
- (a) `y(t) = [cos(t)+2] x(t)` : invertible; inversion `x(t) = y(t)/(cos t + 2)` (note `cos t + 2 ≥ 1 > 0`). [V]
- (b) `y(t) = x²(t)` : not invertible; counterexample `x₁(t)=1` and `x₂(t)=−1` both give `y=1`. [V]
- (3) **Causality**: output at t (or n) depends only on inputs at times ≤ t (present and past).
  (a) `y[n]=x[n−1]` causal. (b) `y[n]=x[n]+x[n+1]` not causal. (c) `y(t)=∫_{-∞}^{t} x(τ)dτ` causal.
  (d) `y[n]=x[−n]` not causal (`y[−1]=x[1]`). (e) `y(t)=x(t)cos(t+1)` causal (cos(t+1) is a known/deterministic gain). [V]
- (4) **Stability**: bounded signal ∃B<∞ with `|x(t)|<B ∀t`. System stable if bounded input ⇒ bounded output (BIBO).
  (a) `y(t) = 2x²(t−1) + x(3t)` stable: `|y| ≤ 2|x²(t−1)| + |x(3t)| ≤ 2B² + B < ∞`. [V]
- **[A-06]** In (e) the note's justification "cos(t+1) is constant" is loose; it is a *known deterministic function of t*, not a constant. Correct wording adopted in artifact, ambiguity recorded.

## p.13 — Stability counterexample; time invariance
- (b) `y[n] = Σ_{k=-∞}^{n} x[k]` (accumulator) : not stable. Proof: `x[n]=u[n]` bounded by 1 ⇒ `y[n]=Σ_{k=0}^{n}1 = n+1 → ∞`. [V]
- (5) **Time invariance**: a time shift of the input produces the same time shift of the output. If `x(t)→y(t)` then TI iff `x(t−t₀) → y(t−t₀) ∀t₀∈ℝ`.
  (a) `y(t) = sin(x(t))` : time-invariant. Proof: `x₂(t)=x₁(t−t₀) ⇒ y₂(t)=sin(x₁(t−t₀)) = y₁(t−t₀)`. [V]
  (b) `y[n] = n x[n]` : not time-invariant. Counterexample: `x₁[n]=δ[n] ⇒ y₁[n]=nδ[n]=0 ∀n`; `x₂[n]=δ[n−1] ⇒ y₂[n]=nδ[n−1]=δ[n−1]` (value 1 at n=1). `y₁[n−1]=0 ≠ y₂[n]`. [V]

## p.14 — Linearity; CH#2 LTI systems; impulse response [Week3–Lec1]
- (6) **Linearity**: additive and scalable — `a x₁(t) + b x₂(t) → a y₁(t) + b y₂(t)`, `a,b ∈ ℂ`.
  (a) `y(t) = 2π x(t)` : linear (full proof shown). [V]
  (b) `y[n] = (x[2n])²` : not linear (cross term `2ab x₁[2n]x₂[2n]`). [V]
- **CH#2 — LINEAR TIME-INVARIANT SYSTEMS**. LTI = linearity + time invariance.
- Impulse response: response of the system to a unit impulse. `x[n]=δ[n] → S → y[n]=h[n]`.
- Sampling property `x[n]δ[n−n₀] = x[n₀]δ[n−n₀]` applied for n₀ = …,−1,0,1,2,… and summed:
  `x[n] Σ_{k=-∞}^{∞} δ[n−k] = Σ_{k=-∞}^{∞} x[k] δ[n−k]`.

## p.15 — Representation property; convolution sum; first DT convolution example
- `Σ_{k=-∞}^{∞} δ[n−k] = 1 ∀n` ⇒ **Representation property**: `x[n] = Σ_{k=-∞}^{∞} x[k] δ[n−k]` — any `x[n]` is a sum of weighted, shifted impulses.
- Derivation chain: `δ[n−k] → S → h[n−k]` (time invariance); `x[k]δ[n−k] → S → x[k]h[n−k]` (linearity, x[k] constant);
  ⇒ **Convolution sum** `y[n] = Σ_{k=-∞}^{∞} x[k] h[n−k] = x[n] * h[n]`.
- Equivalent form: `Σ_k x[k]h[n−k] = Σ_m x[n−m]h[m] = Σ_k x[n−k]h[k]` (substitute m=n−k).
- ⚠ "Convolution can only be applied when the system is LTI."
- **Steps of convolution**: (1) Flip, (2) Shift, (3) Multiply and Add.
- **Example [V]**: `x[n] = {1,2,1,2}` at n=0..3; `h[n] = {1,1}` at n=0,1.
  `y[n] = x[0]h[n] + x[1]h[n−1] + x[2]h[n−2] + x[3]h[n−3] = h[n] + 2h[n−1] + h[n−2] + 2h[n−3]`.

## p.16 — Graphical superposition result; MATLAB homework; DT geometric-series example
- Stem construction of `h[n]`, `2h[n−1]`, `h[n−2]`, `2h[n−3]` summing to
  `y[n] = δ[n] + 3δ[n−1] + 3δ[n−2] + 3δ[n−3] + 2δ[n−4]`, i.e. y = {1,3,3,3,2} on n=0..4. **[V] verified numerically.**
- **Homework H3.1**: verify via `y[n] = Σ_k h[k] x[n−k]`.
- **Homework H3.2 (MATLAB)**: given `x[n]` (values 1,1,2,2,3,3,2 over n=−2..4) and `h[n]` (1 on n=0,1,2), compute `y[n]` (plot shown, peak 8 over n≈2..4, support n=−2..6).
- **Example [V]**: `x[n] = (1/2)^n u[n]`, `h[n] = u[n]`; compute `y[n]=x[n]*h[n]`.
  `h[n−k]` obtained by "shift, then scale" on `h[k]`; support k ≤ n.
  CASE-I: `n<0` ⇒ no overlap ⇒ `y[n]=0`.

## p.17 — Geometric series result; CT convolution setup [Week3–Lec2]
- CASE-II: `n≥0` ⇒ `y[n] = Σ_{k=0}^{n} (1/2)^k`.
- Geometric sum formula given as: `Σ_{k=m}^{n} a r^k = a(r^m − r^{n+1})/(1 − r)`, for `|r|<1`.
- `y[n] = ((1/2)^0 − (1/2)^{n+1})/(1 − 1/2) = 2(1 − (1/2)^n(1/2)) = 2 − (1/2)^n`.
- Result: `y[n] = 2 − (1/2)^n` for n≥0, 0 o.w., i.e. `y[n] = (2 − (1/2)^n) u[n]`; as n→∞, y[n]→2. **[V] verified numerically.**
- MATLAB triptych: `x[n]`, `h[n]`, `y[n]` over n∈[0,10].
- **[A-07]** The stated geometric-series formula carries the side condition `|r|<1`, but the *finite* sum `Σ_{k=m}^{n} a r^k = a(r^m − r^{n+1})/(1−r)` holds for every `r ≠ 1`; `|r|<1` is only needed for the infinite sum. Flag as a source imprecision, keep the finite-sum identity with the corrected condition and explain.
- CT convolution motivation: sifting `x(t₀)=∫x(t)δ(t−t₀)dt` rewritten as `x(t) = ∫ x(τ)δ(τ−t)dτ = ∫ x(τ)δ(t−τ)dτ` using `δ(t)=δ(−t)`.
- Worked "shift, then scale" mini-example: plot `δ(−t+5)` via `v(t)=δ(t+5)` then `y(t)=v(−t)=δ(−t+5)`, arrow at t=5.

## p.18 — Convolution integral; CT convolution example 1
- `y[n] = Σ_k x[k]h[n−k]`  ⟶  **Convolution integral** `y(t) = ∫ x(τ) h(t−τ) dτ = x(t) * h(t) = ∫ h(τ) x(t−τ) dτ`.
- **Example [V]**: `x(t) = e^{2t} u(−t)`, `h(t) = u(t−3)`.
  `h(t−τ)` built by shift then scale; `x(τ)` is a rising exponential ending at τ=0.
  CASE-I: `t−3<0` (t<3): `y(t) = ∫_{-∞}^{t−3} e^{2τ}dτ = ½ e^{2(t−3)}`.
  CASE-II: `t−3>0` (t>3): `y(t) = ∫_{-∞}^{0} e^{2τ}dτ = ½`.
  **[V] verified analytically and numerically.**

## p.19 — Summary/plots of example 1; CT convolution example 2 [Week4–Lec1]
- Summary: `y(t) = 0.5 e^{2(t−3)}` for t<3; `0.5` for t>3. MATLAB triptych x(t), h(t), y(t).
- **Example [V]**: `x(t) = 1 on 0<t<1, 0 o.w.`; `h(t) = t on 0<t<2, 0 o.w.` Determine and plot `y(t)=x(t)*h(t)`.
  Uses `y(t) = ∫ h(τ) x(t−τ) dτ`; `x(t−τ)` support `[t−1, t]`, built by shift then scale.
  CASE-I: `t<0` ⇒ `y(t)=0`.
  CASE-II: `0<t<1` ⇒ `y(t) = ∫₀^t τ dτ = ½t²`.
  CASE-III: `1<t<2` ⇒ `y(t) = ∫_{t−1}^{t} τ dτ = t − ½`.

## p.20 — Example 2 remaining cases; LTI properties (1)–(3)
- CASE-IV: `2<t<3` ⇒ `y(t) = ∫_{t−1}^{2} τ dτ = −½t² + t + 3/2`.
- CASE-V: `t>3` ⇒ `y(t)=0`.
- Full piecewise result:
  `y(t) = 0 (t<0); 0.5t² (0<t<1); t−0.5 (1<t<2); −0.5t²+t+1.5 (2<t<3); 0 (t>3)`.
  **[V] verified symbolically; continuity at t=1 (0.5), t=2 (1.5), t=3 (0) confirmed.** MATLAB triptych, peak 1.5 at t=2.
- **Homework H4.1**: `x(t)=1 on 0<t<3`; `h(t)=t on 0<t<2`; determine and plot `y(t)`.
- PROPERTIES OF LTI SYSTEMS:
  (1) Commutative: `x*h = h*x` (DT and CT).
  (2) Distributive: `x*(h₁+h₂) = x*h₁ + x*h₂`; parallel-interconnection block diagram equivalence.
  (3) Associative: `x*(h₁*h₂) = (x*h₁)*h₂`.

## p.21 — LTI properties (4)–(7) [Week4–Lec2]
- (4) **Memoryless** ⟺ `h(t) = a δ(t)` / `h[n] = a δ[n]`, `a ∈ ℂ`. Proof: `y[n] = a Σ_k x[k]δ[n−k] = a x[n]`.
- (5) **Invertible** ⟺ ∃ `g(t)` (or `g[n]`) with `h(t)*g(t) = δ(t)` / `h[n]*g[n] = δ[n]`; g is the impulse response of the inverse system. Cascade block diagram `x → h → y → g → x`.
- (6) **Causal** ⟺ `h(t)=0 for t<0` / `h[n]=0 for n<0`. Proof via `y[n]=Σ_{k=0}^{∞}h[k]x[n−k] = h[0]x[n]+h[1]x[n−1]+…`
- (7) **Stable** ⟺ `Σ_{k=-∞}^{∞}|h[k]| < ∞` (absolutely summable) / `∫_{-∞}^{∞}|h(t)|dt < ∞` (absolutely integrable).
  Proof: `|y[n]| = |Σ h[k]x[n−k]| ≤ Σ|h[k]||x[n−k]| ≤ B Σ|h[k]| < ∞`.
- **[A-08]** The notes prove sufficiency only ("if absolutely summable then BIBO"), while stating "if and only if". Necessity is standard (Oppenheim §2.3.7) and should be noted as *stated without proof in the source*; the artifact will mark the direction actually proved.

---

## Running ambiguity/issue ledger (Part 1)

| ID | p. | Issue | Class | Resolution adopted |
|----|----|-------|-------|--------------------|
| A-01 | 2 | R=1 normalization applied silently between `(1/R)v²` and `|x|²` | convention | State the normalized-energy convention explicitly on the energy scene |
| A-02 | 3 | Text layer garbles homework shift as `x[n−14]` | OCR artifact | Visual reading `x[n+4]` is authoritative |
| A-03 | 4 | `x(t) = x(at)` abuse of notation | notation | Use `y(t) = x(at)`; add a notation note |
| A-04 | 7 | `δ(t) = ∞ at t=0` informal | rigor | Present as generalized function/distribution with the defining sifting property; keep the engineering picture as intuition |
| A-05 | 10 | "ω₀ rational multiple of 2π" | phrasing | Keep, and add the equivalent `ω₀/2π = k/N ∈ ℚ` |
| A-06 | 12 | `cos(t+1)` called "constant" | wording | "known deterministic function of t"; causality argument unchanged |
| A-07 | 17 | Finite geometric sum stated with `\|r\|<1` | over-restrictive condition | Finite sum needs only `r ≠ 1`; `\|r\|<1` needed for the infinite sum |
| A-08 | 21 | BIBO ⟺ absolute summability stated, only sufficiency proved | proof completeness | Mark necessity as standard result stated without proof in the source |

## Notation register (Part 1)
`x(t)`, `x[n]`, `y(t)`, `y[n]`, `h(t)`, `h[n]`, `δ(t)`, `δ[n]`, `u(t)`, `u[n]`, `E∞`, `P∞`, `T₀`, `N₀`, `ω₀`, `C`, `a`, `α`, `β`, `r`, `θ`, `A`, `*` (convolution), `Ev{·}`, `Odd{·}`, `S` (system operator).
Source uses `J` for the imaginary unit in handwriting → rendered as `j` throughout the artifact (engineering convention). Source writes `2` for the integer set `ℤ` in the OCR layer; handwriting is `ℤ`.
