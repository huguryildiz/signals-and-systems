# EE311 Source Inventory — Part 3 (PDF pp. 39–55)

Source: `EE311 - Lecture Notes.pdf`, 88 pages, handwritten + MATLAB figures. Rendered at 160 dpi.
Convention: the handwritten imaginary unit `J` is recorded as `j` throughout.
Ambiguity IDs are numbered `A<page>-<nn>`.

---

## p.39 — (continuation of CT LOW-PASS FILTERING example, CH#3 Fourier Series / LTI filtering); Homework: CT HIGH-PASS FILTERING
No week/lecture red box on this page (page continues the Week7–Lec1 material; red box appears on p.40).

**Concepts**
- Euler's relationship used to read Fourier Series coefficients `a_k` directly off a sum of sinusoids.
- Coefficient-by-coefficient labelling of `a_0, a_1, a_-1, a_2, a_-2, a_3, a_-3` (each circled in blue on the page).
- Output FS coefficients of an LTI system = input FS coefficients scaled by the frequency response evaluated at the k-th harmonic.
- Magnitude/phase spectra `|a_k|, |b_k|, ∠a_k, ∠b_k` as the diagnostic for what a filter does.
- Low-pass filtering interpretation: "High frequency signal components are suppressed."
- Reconstruction of the output as a real sum of cosines with per-harmonic gain and phase shift.

**Equations** (CT throughout)
- `x(t) = 1 + cos(πt) + sin(2πt) + cos(3πt + π/3)`
- Complex-exponential expansion (as written, with the `(2π/2)` form of ω₀ kept literally):
  `x(t) = 1 + (1/2) e^{j 1 (2π/2) t} + (1/2) e^{j(-1)(2π/2) t} + (1/(2j)) e^{j 2 (2π/2) t} - (1/(2j)) e^{j(-2)(2π/2) t} + (1/2) e^{j π/3} e^{j 3 (2π/2) t} + (1/2) e^{-j π/3} e^{j(-3)(2π/2) t}`
  with labels: `a_0 = 1`, `a_1 = 1/2`, `a_{-1} = 1/2`, `a_2 = 1/(2j)`, `a_{-2} = -1/(2j)`, `a_3 = (1/2) e^{j π/3}`, `a_{-3} = (1/2) e^{-j π/3}`
- BOXED (blue): `b_k = a_k H(j k ω_0)`  — the `ω_0` is annotated in green with an arrow onto the `k` argument.
- `b_{-3} = a_{-3} H(j(-3π)) = (1/2) e^{-j π/3} ( 1 / (1 + j(-3π)) ) = 0.0482 + j 0.0214 = 0.05 e^{j 0.42 rad}`
  (red under-braces label `0.05` as `|b_k|` and `0.42 rad` as `∠b_k`)
- `y(t) = Σ_{k=-3}^{3} |b_k| e^{j ∠b_k} e^{j k (2π/2)} +`   — written exactly like this; the exponent of the last factor has no `t`, and the trailing `+` dangles.
- `y(t) = 0.05 e^{j0.42} e^{-j3πt} + 0.05 e^{-j0.42} e^{j3πt} + 0.08 e^{j2.98} e^{-j2πt} + 0.08 e^{-j2.98} e^{j2πt} + 0.15 e^{j1.26} e^{-jπt} + 0.15 e^{-j1.26} e^{jπt} + 1`
- BOXED (blue): `y(t) = 1 + 0.15 cos(πt - 1.26) + 0.08 cos(2πt - 2.98) + 0.05 cos(3πt - 0.42)`

**Examples**
- Continuation of the CT low-pass example (`H(jω) = 1/(1+jω)` implied by the `1/(1+j(-3π))` substitution).
  - Given: `x(t)` above; LTI system whose frequency response yields `1/(1+jω)`.
  - Asked: FS coefficients of `y(t)`, spectra plots, and closed-form `y(t)`.
  - Method: expand `x(t)` via Euler → read `a_k` → `b_k = a_k H(jkω_0)` → magnitude/phase → recombine conjugate pairs into cosines.
  - Final answer (as written): `y(t) = 1 + 0.15 cos(πt - 1.26) + 0.08 cos(2πt - 2.98) + 0.05 cos(3πt - 0.42)`; sample coefficient `b_{-3} = 0.0482 + j0.0214 = 0.05 e^{j0.42 rad}`.

**Homework**
- Tagged "Homework", titled **CT HIGH-PASS FILTERING** (blue cloud): "Re-solve the previous example for the LTI system with the frequency response, `H(jω) = jω / (1 + jω)`."

**Figures** (all MATLAB-generated)
1. `|a_k|` vs `k`, stem, k ∈ [-3,3], y-axis 0 to 1, ticks 0/0.5/1. Values annotated: 0.5 at k=-3,-2,-1 and 0.5 at k=1,2,3; 1.0 at k=0.
2. `∠a_k` vs `k`, stem, k ∈ [-3,3], y-axis -π/2 to π/2. Annotated: -1.05 at k=-3; 1.57 at k=-2; 0.00 at k=-1, 0, 1; -1.57 at k=2 (label printed as "2^{1.57}" overlapping the tick); 1.05 at k=3.
3. `|b_k|` vs `k`, stem, k ∈ [-3,3], y-axis 0 to 1. Annotated: 0.05 at k=-3; 0.08 at k=-2; 0.15 at k=-1; 1.00 at k=0; 0.15 at k=1; 0.08 at k=2; 0.05 at k=3. Two red hand-drawn ellipses ring the k=-3..-1 and k=1..3 groups with red arrows to the caption "High frequency signal components are suppressed."
4. `∠b_k` vs `k`, stem, k ∈ [-3,3], y-axis -π to π. Annotated: 0.42 at k=-3; 2.98 at k=-2; 1.26 at k=-1; 0.00 at k=0; -1.26 at k=1; -2.98 at k=2; -0.42 at k=3.
5. `x(t)` vs `t`, continuous curve, t ∈ [-10,10], y ∈ [-2,4].
6. `y(t)` vs `t`, continuous curve, t ∈ [-10,10], y ∈ [0.8,1.3].

**Ambiguities**
- **A39-01**: In the `y(t) = Σ_{k=-3}^{3} |b_k| e^{j∠b_k} e^{j k (2π/2)} +` line the exponential `e^{j k (2π/2)}` is missing the `t`, and the line terminates in a dangling `+`. Transcribed as written; not corrected.
- **A39-02**: The exponent bases are written as `(2π/2)` rather than simplified `π`. Consistent with `T₀ = 2`, but never stated on this page — `ω_0` is only annotated in green above the boxed `b_k` formula.
- **A39-03**: Sign/ordering inconsistency in the expanded `y(t)`: the `k=-3` term carries `e^{+j0.42} e^{-j3πt}` while the boxed result gives phase `-0.42`. The pairing of `e^{±jθ}` with `e^{∓jkω₀t}` is internally consistent only if the `∠b_k` stem plot (0.42 at k=-3) is the reference; verify against the stem plot before reuse.
- **A39-04**: `b_{-3} = 0.0482 + j0.0214` has magnitude `sqrt(0.0482² + 0.0214²) ≈ 0.0527`, rounded on the page to `0.05`; the phase `atan2(0.0214, 0.0482) ≈ 0.418 rad` rounded to `0.42`. Rounding is aggressive but not wrong. Flagged because downstream `y(t)` uses the 2-significant-figure values.
- **A39-05**: The three MATLAB spectra in figs 3–4 imply `|b_0| = 1.00` and `∠b_0 = 0.00`, i.e. DC passes with unity gain — consistent with `H(j0)=1` but never written algebraically.

## p.40 — (Sol. of CT HIGH-PASS FILTERING homework) + Example: DT HIGH-PASS FILTERING [Week7—Lec2]
Red box: **Week7—Lec2** (appears next to the DT HIGH-PASS FILTERING example).

**Concepts**
- Magnitude/phase of a CT high-pass frequency response; the notch at ω=0.
- "Low-frequency components are suppressed" as the mirror statement of the LP case.
- DT frequency response as the DTFT of the impulse response: `H(e^{jω}) = Σ h[n] e^{-jωn}`.
- DT high-pass filtering via a first-difference impulse response.
- Periodic impulse train as a DT periodic signal; fundamental period `N₀`.
- DT Fourier Series analysis equation over one period; periodicity of the DT FS coefficients (`a_k = a_{k+4}`).

**Equations**
- (CT, top of page) `y(t) = 0.48 cos(πt - 0.31) + 0.49 cos(2πt - 1.41) + 0.5 cos(3πt - 1.15)`  — BOXED (blue).
- (DT) `H(e^{jω}) = Σ_{n=-∞}^{∞} h[n] e^{-jωn} = h[0] e^{-jω0} - h[1] e^{-jω1} = 0.5 (1 - e^{-jω})`  — final expression BOXED (blue); `h[0]` under-braced `0.5`, `h[1]` under-braced `0.5`.
- (DT) `x[n] = Σ_{k=-∞}^{∞} δ[n - 4k]`
- (DT) `h[n] = 0.5 δ[n] - 0.5 δ[n-1]`
- (DT) `a_k = (1/4) Σ_{n=<N>} x[n] e^{-jkω_0 n} = (1/4) Σ_{n=0}^{3} x[n] e^{-jkω_0 n} = (1/4) x[0] e^{-jk(2π/4)0} = 1/4`  — final `1/4` BOXED (green); `x[0]` under-braced `= 1`, `e^{-jk(2π/4)0}` under-braced `= 1`.
- (DT, blue note) `a_k = a_{k+4}`

**Examples**
1. **Solution to the CT HIGH-PASS FILTERING homework from p.39** (marked "Sol").
   - Given: `H(jω) = jω/(1+jω)`, same `x(t)` as p.39.
   - Asked: `|H(jω)|`, `∠H(jω)`, plots of `x(t)`, `y(t)`, FS coefficients of both.
   - Method: same `b_k = a_k H(jkω_0)` route.
   - Final answer (boxed): `y(t) = 0.48 cos(πt - 0.31) + 0.49 cos(2πt - 1.41) + 0.5 cos(3πt - 1.15)`.
2. **Example — DT HIGH-PASS FILTERING** (Week7—Lec2).
   - Given: `x[n] = Σ_{k=-∞}^{∞} δ[n-4k]` input to an LTI system with impulse response `h[n] = 0.5 δ[n] - 0.5 δ[n-1]`.
   - Asked: determine the output signal and plot its Fourier Series coefficients.
   - Method: compute `H(e^{jω})` by DTFT of `h[n]`; identify `N₀ = 4` (periodic impulse train); compute `a_k` from the DT FS analysis equation.
   - Partial answer on this page: `H(e^{jω}) = 0.5(1 - e^{-jω})`, `a_k = 1/4` for all `k`, `a_k = a_{k+4}`. (Continued on p.41.)

**Homework**
- None newly tagged on this page; the page contains the *solution* to the p.39 homework.

**Figures**
1. (MATLAB) `|H(jω)|` vs `ω`, continuous, ω ∈ [-6π, 6π] (ticks -6π, -3π, 0, 3π, 6π), y ∈ [0,1]. Deep notch to 0 at ω=0. Red handwritten annotation with arrow: "high pass filter".
2. (MATLAB) `∠H(jω)` vs `ω`, continuous, ω ∈ [-6π,6π], y ∈ [-π/2, π/2]. Odd-symmetric with a jump through ω=0.
3. (MATLAB) `x(t)` vs `t`, continuous, t ∈ [-10,10], y ∈ [-2,4].
4. (MATLAB) `y(t)` vs `t`, continuous, t ∈ [-10,10], y ∈ [-1, 1] (ticks -1, -0.5, 0, 0.5, 1).
5. (MATLAB) `|a_k|` stem, k ∈ [-3,3], y ∈ [0,1]: 0.5 at k=-3,-2,-1,1,2,3; 1.0 at k=0.
6. (MATLAB) `∠a_k` stem, k ∈ [-3,3], y ∈ [-π/2, π/2]: -1.05 at k=-3; 1.57 at k=-2; 0.00 at k=-1,0,1; -1.57 at k=2; 1.05 at k=3.
7. (MATLAB) `|b_k|` stem, k ∈ [-3,3], y ∈ [0, 0.6] (ticks 0, 0.2, 0.4, 0.6): 0.50 at k=-3; 0.49 at k=-2; 0.48 at k=-1; 0.00 at k=0 (circled in red); 0.48 at k=1; 0.49 at k=2; 0.50 at k=3. Red arrow to caption "Low-frequency components are suppressed."
8. (MATLAB) `∠b_k` stem, k ∈ [-3,3], y ∈ [-π/2, π/2]: -1.15 at k=-3; 1.41 at k=-2; -0.31 at k=-1; 0.00 at k=0; 0.31 at k=1; -1.41 at k=2; 1.15 at k=3.
9. (MATLAB) `|H(e^{jω})|` vs `ω`, continuous, ω ∈ [-π, π], y ∈ [0,1], V-shaped with zero at ω=0. Red annotation "High pass" with two red arrows.
10. (MATLAB) `∠H(e^{jω})` vs `ω`, continuous, ω ∈ [-π,π], y ∈ [-π/2, π/2]; piecewise-linear with a discontinuous jump at ω=0.
11. (Hand-drawn) DT impulse train `x[n]`: stems of height 1 at n = -4, 0, 4, with "..." on both sides, axis labelled `n`.

**Ambiguities**
- **A40-01**: In `H(e^{jω}) = ... = h[0]e^{-jω0} - h[1]e^{-jω1}` the minus sign is pulled outside while the under-brace labels *both* `h[0]` and `h[1]` as `0.5` (positive). Since `h[1] = -0.5`, writing `- h[1] e^{-jω}` with `h[1]=0.5` double-counts the sign. The final boxed `0.5(1 - e^{-jω})` is correct; the intermediate labelling is internally inconsistent.
- **A40-02**: The magnitude plot of `∠b_k` (fig 8) shows `∠b_k` values that do not obey odd symmetry in an obvious way (-1.15, 1.41, -0.31, 0.00, 0.31, -1.41, 1.15). This is the same k↔-k pairing oddity flagged in A39-03; not corrected.
- **A40-03**: `a_k = (1/4) Σ_{n=0}^{3} x[n] e^{-jkω_0 n}` — the summation upper limit is written as a superscript `3` but is rendered small and partially over-written; reading is `3`. Low confidence but consistent with `N₀=4`.
- **A40-04**: `ω_0` for the DT case is used as `2π/4` inside the exponent without an explicit prior definition on this page.
- **A40-05**: The boxed CT high-pass answer has no DC term, while the input has `a_0 = 1`. Correct for `H(j0)=0`, but the page never states that the DC term vanishes — the reader must infer it from the circled `0.00` in fig 7.

## p.41 — (DT HIGH-PASS FILTERING, cont.) + Homework: DT LOW-PASS FILTERING and its solution
No red week/lecture box on this page.

**Concepts**
- Output DT FS coefficients `b_k = a_k H(e^{jk(2π/N₀)})`, periodic in `k` with period 4.
- Synthesis of `y[n]` from `b_k` over one period `k = <N>`.
- Recognition of `e^{jπn} = (-1)^n`.
- DT low-pass filtering via a two-point averager (`h[n] = 0.5δ[n] + 0.5δ[n-1]`).
- Contrast: low-frequency suppressed (HP) vs high-frequency suppressed (LP), read from the `|b_k|` stem plots.

**Equations** (all DT)
- BOXED (blue): `b_k = a_k H(e^{jk(2π/4)})`  — "which is periodic by 4."
- `y[n] = Σ_{k=<N>} b_k e^{jkω_0 n} = b_{-1} e^{j(-1)(π/2)n} + b_0 e^{j(0)(π/2)n} + b_1 e^{j(1)(π/2)n} + b_2 e^{j(2)(π/2)n}`
- `= 0.18 e^{j(-0.79)} e^{-jπ/2 n} + 0  + 0.18 e^{j0.79} e^{+jπ/2 n} + 0.25 e^{j0} e^{jπn}`
  with hand labels `k=-1`, `k=0`, `k=1`, `k=2`, and `e^{jπn}` under-braced `(-1)^n`.
- BOXED (blue): `y[n] = 0.36 cos((π/2)n + (π/4)) + 0.25 (-1)^n`  — the `(π/4)` is circled and annotated in blue with `0.79`.
- BOXED (blue, marked with a green asterisk): `H(e^{jω}) = 0.5 + 0.5 e^{-jω}`  (low-pass homework)
- `h[n] = 0.5 δ[n] + 0.5 δ[n-1]`
- `y[n] = Σ_{k=-1}^{2} b_k e^{jk(2π/4)n} = 0.18 e^{j0.79} e^{-jπ/2 n} + 0.25 e^{j0} e^{j0·π/2 n} + 0.18 e^{-j0.79} e^{jπ/2 n} + 0 = 0.25 + 0.36 cos((π/2)n - (π/4))`
  — final expression BOXED (blue); labels `k=-1`, `k=0`, `k=1`, `k=2` above the terms; the middle `e^{j0} e^{j0·π/2n}` under-braced `1`; `(π/4)` annotated `0.79`.

**Examples**
- **Continuation of the DT HIGH-PASS example (p.40).**
  - Given/asked: as p.40.
  - Method: `b_k = a_k H(e^{jk(2π/4)})`; evaluate for `k = -1, 0, 1, 2`; synthesize.
  - Final answer (boxed): `y[n] = 0.36 cos((π/2)n + π/4) + 0.25 (-1)^n`.

**Homework**
- Tagged "Homework", titled **DT LOW-PASS FILTERING** (blue cloud): "Re-solve the previous example for the LTI system with the impulse response, `h[n] = 0.5 δ[n] + 0.5 δ[n-1]`."
  - **The solution is worked on this same page** (marked "Sol"): `H(e^{jω}) = 0.5 + 0.5 e^{-jω}`; final boxed answer `y[n] = 0.25 + 0.36 cos((π/2)n - (π/4))`.

**Figures**
1. (MATLAB) `|a_k|` stem, k ∈ [-1,2], y ∈ [0,0.25] (ticks 0, 0.1, 0.2, 0.25): 0.25 at every k = -1, 0, 1, 2.
2. (MATLAB) `∠a_k` stem, k ∈ [-1,2], y ∈ [-π/2, π/2]: 0 at every k.
3. (MATLAB) `|b_k|` stem, k ∈ [-1,2], y ∈ [0,0.25]: 0.18 at k=-1; 0.00 at k=0 (circled in red, with red arrow to caption "Low frequency components are suppressed."); 0.18 at k=1; 0.25 at k=2.
4. (MATLAB) `∠b_k` stem, k ∈ [-1,2], y ∈ [-π/4, π/4]: -0.79 at k=-1; 0.00 at k=0; 0.79 at k=1; 0.00 at k=2.
5. (MATLAB) `x[n]` stem, n ∈ [-12,12] (ticks -12,-8,-4,0,4,8,12), y ∈ [0,1]: impulses of height 1 every 4 samples.
6. (MATLAB) `y[n]` stem, n ∈ [-12,12], y ∈ [-0.5, 0.5]: alternating pattern.
7. (MATLAB, homework solution) `|H(e^{jω})|` vs ω, continuous, ω ∈ [-π,π], y ∈ [0,1] (ticks 0,0.2,0.4,0.6,0.8,1): raised-cosine hump peaking at 1 at ω=0, zero at ±π.
8. (MATLAB, homework solution) `∠H(e^{jω})` vs ω, continuous, ω ∈ [-π,π], y ∈ [-π/2, π/2]: straight descending line (linear phase).
9. (MATLAB, homework solution) `x[n]` stem, n ∈ [-12,12], y ∈ [0,1] (ticks 0,0.2,…,1): impulse train.
10. (MATLAB, homework solution) `y[n]` stem, n ∈ [-12,12], y ∈ [0,0.5]: pairs of samples at 0.5.
11. (MATLAB, homework solution) `|a_k|` stem, k ∈ [-1,2], y ∈ [0,0.25]: 0.25 at all k.
12. (MATLAB, homework solution) `∠a_k` stem, k ∈ [-1,2], y ∈ [-π/2, π/2]: 0 at all k.
13. (MATLAB, homework solution) `|b_k|` stem, k ∈ [-1,2], y ∈ [0,0.25]: 0.18 at k=-1; 0.25 at k=0; 0.18 at k=1; 0.00 at k=2 (circled in red, red arrow to caption "High frequency components are suppressed.").
14. (MATLAB, homework solution) `∠b_k` stem, k ∈ [-1,2], y ∈ [-π/2, π/2] (with a π/4 tick): 0.79 at k=-1; 0.00 at k=0; -0.79 at k=1; -1.57 at k=2.

**Ambiguities**
- **A41-01**: In the HP synthesis line the `k=-1` term is written `0.18 e^{j(-0.79)} e^{-jπ/2 n}` but the `∠b_k` stem plot (fig 4) reads `-0.79` at k=-1 and `+0.79` at k=+1, while the boxed answer is `0.36 cos((π/2)n + π/4)` — i.e. `+π/4`. Under the standard pairing this should give `cos((π/2)n + 0.79)` only if `∠b_1 = +0.79`. Internally consistent with fig 4 but the sign bookkeeping is displayed inconsistently between the two synthesis lines (HP uses `e^{j(-0.79)}` with `e^{-jπ/2n}`, LP uses `e^{j0.79}` with `e^{-jπ/2n}`). Not corrected.
- **A41-02**: `0.36 = 2 × 0.18` and `0.25` are used without stating the rounding; exact values would be `2·(√2/8) = 0.3536` and `0.25`.
- **A41-03**: The `k=0` term in the HP synthesis is written as `+ 0` with an arrow labelled `k=0`, but the preceding line lists `b_0 e^{j(0)(π/2)n}` — the transition from `b_0` to `0` relies on `H(e^{j0})=0`, which is not written.
- **A41-04**: In fig 14 the `∠b_k` at k=2 is `-1.57`, but `|b_k|` at k=2 is `0.00` (fig 13); the phase of a zero-magnitude coefficient is meaningless/arbitrary. Plot artifact, worth flagging.
- **A41-05**: The LP homework synthesis line writes the upper summation limit as `2` with a superscript that is over-drawn (it looks like `2` written over something); reading is `k = -1` to `2`.

## p.42 — CH#4 — CONTINUOUS-TIME FOURIER TRANSFORM [Week8—Lec1]
Red box: **Week8—Lec1**.

**Concepts**
- The two conditions Fourier Series analysis requires: periodicity, and square-integrability (or Dirichlet conditions).
- Motivation: extend the Fourier Series idea to **aperiodic signals** (highlighted in yellow).
- Periodic square wave and its FS coefficients as the running example.
- Substitution `ω = kω_0` turning the discrete coefficient sequence into samples of a continuous function.
- **Normalized Fourier Series coefficients** `T·a_k` (labelled in blue caps).
- **Envelope function** `X(jω)`, the same for all `T`.
- As `T` increases the spacing `ω_0` between consecutive `a_k` shrinks while the envelope shape is unchanged.

**Equations** (CT)
- Condition (2): `∫_T |x(t)|² dt < ∞`
- FS pair and coefficients of the periodic square wave:
  `x(t) ←FS→ a_k = sin(2πk T_1/T) / (πk) = [ sin( k (2π/T) T_1 ) · 2/T ] / [ πk · (2/T) ] = 2 sin(k ω_0 T_1) / [ k (2π/T) · T ]`
  final form BOXED (blue): `a_k = 2 sin(k ω_0 T_1) / (k ω_0 T)`   (with `ω_0` annotated in red over `2π/T`)
- `Substitute ω = kω_0, then: a_k = [ 2 sin(k ω_0 T_1) / (k ω_0 T) ] |_{ω = kω_0}` = BOXED (blue): `2 sin(ω T_1) / (ω T)`
- BOXED (blue): `T a_k = 2 sin(ω T_1) / ω`  : NORMALIZED FOURIER SERIES COEFFICIENTS
- Envelope function (written in red four times, once per subplot): `X(jω) = 2 sin(ω T_1)/ω`
- `ω_0 = 2π/16 = π/8` (red annotation on the first subplot, for `T = 16 T_1`)

**Examples**
- Running worked illustration (not tagged "Example"): periodic square wave, `x(t) = 1` on `|t| ≤ T_1`, `0` on `T_1 < |t| ≤ T/2`, period `T`.
  - Given: `T_1 = 1`; `T` taken successively as `16 T_1`, `32 T_1`, `64 T_1`, `200 T_1`.
  - Asked: behaviour of `T a_k` as `T → ∞`.
  - Method: compute `a_k`, substitute `ω = kω_0`, multiply by `T`, plot `T × a_k` against `ω` for increasing `T`.
  - Final observation (red exclamation callout): "When T increase, the spacing between consecutive `a_k` reduces. However, the shape of the envelope function `X(jω) = 2 sin(ω T_1)/ω` remains the same."

**Homework**
- None on this page.

**Figures**
1. (Hand-drawn, MATLAB-styled) periodic square wave `x(t)` vs `t`, y ∈ [0,1] (ticks 0, 0.5, 1), x-axis marked `-T`, `-T_1`, `0`, `T_1`, `T`. Amplitude 1 on the pulses.
2. (MATLAB) Four stacked subplots, all `T × a_k` vs `ω`, ω ∈ [-6, 6] (ticks -6,-4,-2,0,2,4,6), y ∈ [0,2] (ticks 0,1,2). Blue stems overlaid on a red continuous envelope curve. Titles: `T = 16T_1`, `T = 32T_1`, `T = 64T_1`, `T = 200T_1`. Handwritten annotations: `T_1 = 1` (red), envelope formula `X(jω)=2sin(ωT_1)/ω` (red, on each subplot), `ω_0 = 2π/16 = π/8`, `ω_0` double-arrow marking the stem spacing, purple labels `ω_0`, `2ω_0`, `3ω_0` on the first subplot, and "Spacing reduces as T ↑" (purple) on the second.

**Ambiguities**
- **A42-01**: The `a_k` chain writes `sin(2πk T_1/T)/(πk)` as the starting point, which is the standard square-wave result *for amplitude 1 and pulse half-width T_1*; the page never states the amplitude or that `x(t)=1` on the pulse — it is only readable from the figure.
- **A42-02**: In the step `= 2 sin(kω_0 T_1) / [ k (2π/T) · T ]` the denominator `k(2π/T)·T` simplifies to `2πk`, not `kω_0 T` unless `ω_0 = 2π/T` is substituted — which it is, but the boxed `k ω_0 T` and the preceding `k(2π/T)·T` are the same quantity written two ways with an under-brace `2π/T = ω_0` that is small and partly overwritten.
- **A42-03**: `X(jω)` is introduced as the *envelope* on this page but the notation `X(jω)` is not yet defined as the Fourier Transform (that comes on p.43). The page uses `X(ω)` in one place (p.43 line 1 refers back to "the envelope function X(ω)") and `X(jω)` here — inconsistent argument convention.
- **A42-04**: The condition (2) integral is written `∫_T |x(t)|² dt < ∞` with the subscript `T` denoting "over one period"; the notation is never expanded.

## p.43 — Derivation of the Fourier Transform (STEP 1 / STEP 2 / STEP 3)
No red week/lecture box on this page (continues Week8—Lec1).

**Concepts**
- Limiting argument: as `T → ∞` the normalized FS coefficients `T a_k` approach the envelope `X(ω)`.
- An aperiodic signal treated as a periodic signal with `T → ∞`; the envelope function is called the **"Fourier Transform"**.
- Three-step derivation (marked with a Moodle/orange icon).
- STEP 1: finite-duration aperiodic `x(t)`; construction of the periodic extension `x̃(t)`.
- STEP 2: FS representation of `x̃(t)`; extension of the integration limits to `±∞`.
- Definition of the analysis integral `X(jω)`; the identity `a_k = (1/T) X(jkω_0)`.
- STEP 3: `ω_0 = 2π/T → 0`, so the Riemann sum becomes an integral (synthesis equation).

**Equations** (CT)
- STEP 1: `x(t) = 0 for |t| > T/2`
- `x̃(t) = x(t) for -T/2 < t < T/2` and `x̃(t + T) = x̃(t)`
- STEP 2: `x̃(t) = Σ_{k=-∞}^{∞} a_k e^{jkω_0 t}`
- `a_k = (1/T) ∫_T x̃(t) e^{-jkω_0 t} dt = (1/T) ∫_{-T/2}^{T/2} x̃(t) e^{-jkω_0 t} dt = (1/T) ∫_{-T/2}^{T/2} x(t) e^{-jkω_0 t} dt = (1/T) ∫_{-∞}^{∞} x(t) e^{-jkω_0 t} dt`
  (blue annotations: "Since x̃(t) = x(t) when -T/2 < t < T/2"; "Since x(t) = 0, |t| > T/2")
- Definition: `X(jω) ≜ ∫_{-∞}^{∞} x(t) e^{-jωt} dt`, then BOXED (green): `a_k = (1/T) X(jkω_0)`
- `x̃(t) = Σ_{k=-∞}^{∞} a_k e^{jkω_0 t} = Σ_{k=-∞}^{∞} (1/T) X(jkω_0) e^{jkω_0 t} = Σ_{k=-∞}^{∞} (1/2π) X(jkω_0) e^{jkω_0 t} · ω_0`  ← marked with a red star ★
  (blue annotation: `Since ω_0 = 2π/T → 1/T = ω_0/2π`)
- STEP 3: `lim_{ω_0 → 0} Σ_{k=-∞}^{∞} (1/2π) X(jkω_0) e^{jkω_0 t} · ω_0 = ∫_{-∞}^{∞} (1/2π) X(jω) e^{jωt} dω`

**Examples**
- None (pure derivation).

**Homework**
- None on this page.

**Figures**
1. (Hand-drawn) `x(t)`: an arbitrary smooth bump supported on `[-T_1, T_1]`, axis labelled `t`, with `-T_1` and `T_1` marked. A green arrow points right to:
2. (Hand-drawn) `x̃(t)`: three copies of the same bump, axis labelled `t`, tick marks at `-T`, `-T_1`, `0`, `T_1`, `T` — the periodic extension.
No MATLAB figures on this page.

**Ambiguities**
- **A43-01**: The first bullet writes the envelope as `X(ω)` while everywhere else it is `X(jω)`. Inconsistent argument (ω vs jω) within four lines.
- **A43-02**: STEP 1 says `x(t) = 0 for |t| > T/2`, but the hand-drawn figure supports `x(t)` on `[-T_1, T_1]` and labels the periodic extension with both `T_1` and `T`. The relation `T_1 < T/2` is used implicitly and never stated.
- **A43-03**: In `x̃(t) = x(t) for -T/2 < t < T/2` the inequalities are strict on both ends; elsewhere (p.42 figure) the square-wave definition uses `≤`. Endpoint convention is inconsistent.
- **A43-04**: The `∫_T` in the first `a_k` expression uses the "over one period" subscript without stating which period window; it is then immediately replaced by `[-T/2, T/2]`.
- **A43-05**: The transition in STEP 3 writes `lim_{ω_0 → 0}` under the sum, but the limit that is physically taken is `T → ∞`; the two are equivalent via `ω_0 = 2π/T` but the page swaps between them without comment.

## p.44 — Graphical conversion of Σ to ∫; Analysis/Synthesis equations; Example: FT of a shifted impulse
No red week/lecture box on this page (continues Week8—Lec1).

**Concepts**
- Graphical Riemann-sum picture: rectangles of width `ω_0` under the envelope `X(jω)e^{jωt}`.
- The Fourier Transform pair (forward and inverse).
- Terminology (green asterisks): "Analysis: we are analyzing the time signal in the Fourier Domain." / "Synthesis: we are gathering the Fourier domain information and reconstruct the time signal."
- `X(jω)` called the **SPECTRUM OF x(t)** (green annotation).
- Convergence: square-integrability / Dirichlet conditions ⇒ `X(jω)` exists.
- Notation note: some textbooks use `X(ω)` instead of `X(jω)` — "Both of them are valid!"
- Hz vs rad/s convention for the communication-systems course.
- Sifting property of the impulse used to evaluate a FT integral.
- MAGNITUDE SPECTRUM `|X(jω)|` and PHASE SPECTRUM `∠X(jω)` (red labels).
- Time shift `t_0` affects only phase, not magnitude.

**Equations** (CT)
- BOXED (blue), labelled ": ANALYSIS EQ.":  `x(t) = ∫_{-∞}^{∞} (1/2π) X(jω) e^{jωt} dω`
- BOXED (blue), labelled ": SYNTHESIS EQ.":  `X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt`  (green arrow → "SPECTRUM OF x(t)")
- Summary, HIGHLIGHTED YELLOW + boxed blue, labelled **FOURIER TRANSFORM**: `X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt`
- Summary, HIGHLIGHTED YELLOW + boxed blue, labelled **INVERSE FOURIER TRANSFORM**: `x(t) = (1/2π) ∫_{-∞}^{∞} X(jω) e^{jωt} dω`
- Convergence condition: `∫ |x(t)|² dt < ∞`
- Purple side box (comm. systems convention): `X(f) = ∫ x(t) e^{-j2πft} dt` ; `x(t) = ∫ X(f) e^{j2πft} df` ; annotations `ω: angular freq.`, `ω: radians/s`, `f: Hz`
- `ω = 2πf`
- Example: `x(t) = δ(t - t_0)`
  `X(jω) = ∫ x(t) e^{-jωt} dt = ∫ δ(t - t_0) e^{-jωt} dt` — BOXED: `= e^{-jω t_0}`  (blue label "sifting property", with a green arrow mapping `t → t_0` in the exponent)
  `F{x(t)} = X(jω) = (1) e^{j(-ω t_0)}` — the `1` circled and labelled `|X(jω)|`, the exponent boxed and labelled `∠X(jω)`
- Red labels: `|X(jω)| :` MAGNITUDE SPECTRUM ; `∠X(jω) :` PHASE SPECTRUM

**Examples**
- **Example (tagged)**: "Let `x(t) = δ(t - t_0)`. Determine `X(jω)` and plot `|X(jω)|` and `∠X(jω)`."
  - Given: `x(t) = δ(t - t_0)`.
  - Asked: `X(jω)`, magnitude and phase spectra.
  - Method: substitute into the analysis integral and apply the sifting property.
  - Final answer: `X(jω) = e^{-jω t_0}`, with `|X(jω)| = 1` and `∠X(jω) = -ω t_0`. Purple note: "t_0 has no effects on the magnitude."

**Homework**
- None on this page.

**Figures**
1. (Hand-drawn, LaTeX-labelled) Riemann-sum diagram: a smooth concave curve vs `ω` with three shaded rectangles (grey, pink, orange) of width `ω_0`, centred at `(k-1)ω_0`, `kω_0`, `(k+1)ω_0` on the ω-axis. Curve/rectangle heights labelled `X(jω)e^{jωt}`, `X(jkω_0)e^{jkω_0 t}`, `X(j(k+1)ω_0)e^{j(k+1)ω_0 t}`.
2. (MATLAB) 2×2 grid for the impulse example:
   - `|X(jω)|` vs ω, ω ∈ [-π, π], y ∈ [0,2] (ticks 0,1,2), title `t_0 = 0`: flat line at 1.
   - `∠X(jω)` vs ω, ω ∈ [-π,π], y ∈ [-π/2, π/2], title `t_0 = 0`: flat line at 0.
   - `|X(jω)|` vs ω, ω ∈ [-π,π], y ∈ [0,2], title `t_0 = 1`: flat line at 1.
   - `∠X(jω)` vs ω, ω ∈ [-π,π], y ∈ [-π, π], title `t_0 = 1`: straight descending line, red handwritten annotation `= -ω`.

**Ambiguities**
- **A44-01** (significant): The two boxed definitions are **labelled backwards**. The box containing `x(t) = ∫ (1/2π) X(jω) e^{jωt} dω` is labelled ": ANALYSIS EQ." and the box containing `X(jω) = ∫ x(t) e^{-jωt} dt` is labelled ": SYNTHESIS EQ." Standard convention (and the page's own green definitions immediately below, plus the yellow summary boxes) is the opposite: the forward transform is analysis, the inverse is synthesis. Contradiction is internal to this single page.
- **A44-02**: The text says "where we have already defined `X(jω)` as:" and then presents the forward transform *after* the inverse — the ordering makes the "already defined" reference point backwards to p.43.
- **A44-03**: `F{x(t)} = X(jω) = (1) e^{j(-ω t_0)}` writes the phase as `j(-ω t_0)` here but the boxed line two rows above writes `e^{-jω t_0}`. Same quantity, two notations on one page.
- **A44-04**: The purple comm-systems box annotates `ω` twice with different glosses ("angular freq." above the `2πf` in the exponent, and "ω: radians/s" below); the annotation above the exponent appears to point at `2πft`, not at `ω`. Placement is ambiguous.
- **A44-05**: The `∠X(jω)` plot for `t_0 = 1` is drawn as a single unwrapped straight line over `[-π, π]`, i.e. no phase wrapping — fine for `|ω t_0| ≤ π` but the plot's y-range exactly saturates at ±π at the endpoints without comment.

## p.45 — Example: inverse FT of `2πδ(ω-ω_0)`; Example: FT of `e^{-at}u(t)`; Homework: FT of `e^{-a|t|}`
No red week/lecture box on this page (continues Week8—Lec1).

**Concepts**
- Sifting property applied in the frequency domain to invert an impulse spectrum.
- A frequency-domain impulse ↔ a complex exponential in time.
- FT of a one-sided decaying exponential.
- Magnitude and phase spectrum of a first-order system; high-frequency roll-off.
- Compression in time ↔ expansion in frequency (red annotations under the plot grid).
- Two-sided exponential `e^{-a|t|}` split into two one-sided integrals.

**Equations** (CT)
- Example 1: `X(jω) = 2π δ(ω - ω_0)`
  `x(t) = (1/2π) ∫_{-∞}^{∞} X(jω) e^{jωt} dω = (1/2π) · 2π ∫_{-∞}^{∞} δ(ω - ω_0) e^{jωt} dω` — BOXED: `= e^{jω_0 t}`
  with blue results: `|x(t)| = 1` and `∠x(t) = ω_0 t`
- Example 2: `x(t) = e^{-at} u(t)`, `a > 0`
  `X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt = ∫_{0}^{∞} e^{-at} e^{-jωt} dt = ∫_{0}^{∞} e^{-(a+jω)t} dt = (-1/(a+jω)) [ e^{-(a+jω)t} ]_{0}^{∞}` — BOXED (blue): `= 1/(a+jω)`
  `|X(jω)| = | 1/(a+jω) | = |1| / |a+jω|` — BOXED (blue): `= 1/ sqrt(a² + ω²)`   (red note: "As ω → ∞, |H(jω)| → 0")
  `∠X(jω) = ∠1 - ∠(a+jω) = 0 - tan^{-1}(ω/a)` — BOXED (blue): `= -tan^{-1}(ω/a)`
- Homework (worked): `x(t) = e^{-a|t|}`, `a > 0`
  `X(jω) = ∫ x(t) e^{-jωt} dt = ∫_{-∞}^{∞} e^{-a|t|} e^{-jωt} dt = ∫_{-∞}^{0} e^{+at} e^{-jωt} dt + ∫_{0}^{∞} e^{-at} e^{-jωt} dt`
  the two integrals brace-labelled `(i)` and `(ii)` (evaluated on p.46).

**Examples**
1. **Example (tagged)**: "Let `X(jω) = 2π δ(ω - ω_0)`. Determine `x(t)` and plot `|x(t)|` and `∠x(t)`."
   - Method: inverse FT integral + sifting property.
   - Final answer: `x(t) = e^{jω_0 t}`; `|x(t)| = 1`; `∠x(t) = ω_0 t`.
2. **Example (tagged)**: "Let `x(t) = e^{-at} u(t)` for `a > 0`. Determine `X(jω)` and plot `|X(jω)|` and `∠X(jω)`."
   - Method: direct evaluation of the analysis integral over `[0, ∞)`.
   - Final answers: `X(jω) = 1/(a+jω)`; `|X(jω)| = 1/sqrt(a²+ω²)`; `∠X(jω) = -tan^{-1}(ω/a)`.
   - Illustrated for `a = 0.1`, `a = 1`, `a = 5`.

**Homework**
- Tagged "Homework": "Let `x(t) = e^{-a|t|}`, `a > 0`. Determine `X(jω)` and plot `|X(jω)|` and `∠X(jω)`. Choose `a = 0.5, 1, and 5`."
  - Solution begun on this page ("Sol"), completed on p.46.

**Figures**
1. (MATLAB) 2×2 grid for Example 1:
   - `|x(t)|` vs `t`, t ∈ [-1,1], y ∈ [0,2] (ticks 0,1,2), title `ω_0 = 0`: flat at 1.
   - `∠x(t)` vs `t`, t ∈ [-1,1], y ∈ [-π/2, π/2], title `ω_0 = 0`: flat at 0.
   - `|x(t)|` vs `t`, t ∈ [-1,1], y ∈ [0,2], title `ω_0 = 1`: flat at 1.
   - `∠x(t)` vs `t`, t ∈ [-1,1], y ∈ [-π/2, π/2] with π/4 ticks, title `ω_0 = 1`: straight ascending line. Red handwritten annotations on the y-axis: `π/2 = 1.57`, `π/4 = 0.79`, and red `-1` at the lower-left end, red `1` at the upper-right end.
2. (MATLAB) 3×3 grid for Example 2. Rows titled `a = 0.1`, `a = 1`, `a = 5`.
   - Column 1: `x(t)` vs `t`, t ∈ [0,5]. Row a=0.1: y ∈ [0.6, 1]; row a=1: y ∈ [0,1] (ticks 0,0.5,1); row a=5: y ∈ [0,1].
   - Column 2: `|X(jω)|` vs `ω`, ω ∈ [-6π, 6π] (ticks -6π,-3π,0,3π,6π). Row a=0.1: y ∈ [0,10] (ticks 0,5,10); row a=1: y ∈ [0,1] (ticks 0,0.5,1); row a=5: y ∈ [0.1,0.2] (ticks 0.1,0.15,0.2).
   - Column 3: `∠X(jω)` vs `ω`, ω ∈ [-2π, 2π] (ticks -2π,-π,0,π,2π), y ∈ [-π/2, π/2]. Sharpness of the transition decreases as `a` increases.
   - Red handwritten annotations under the grid: "↓ compression in time ↓" (under column 1) and "↓ expansion in frequency ↓" (under column 2).

**Ambiguities**
- **A45-01**: The red note next to the magnitude result reads "As ω → ∞, `|H(jω)| → 0`" using `H` where the rest of the example uses `X`. Symbol mismatch (system vs signal transform).
- **A45-02**: The evaluation `(-1/(a+jω))[e^{-(a+jω)t}]_0^∞ = 1/(a+jω)` silently requires `Re{a} > 0` for the upper limit to vanish; the condition `a > 0` is given but the convergence argument is not written.
- **A45-03**: In Example 1's derivation the constant is pulled out as `(1/2π)·2π` and then the surviving integral is written `∫ δ(ω-ω_0) e^{jωt} dω` with a green arrow substituting `ω → ω_0`; the `ω_0` in `δ(ω-ω_0)` is circled, so the arrow's target is visually ambiguous between the `ω` of the exponent and the `ω_0` of the impulse.
- **A45-04**: The `a = 0.1` panel in column 1 plots `x(t)` only over `t ∈ [0,5]` with y starting at 0.6 — the decay is barely visible; the vertical scale differs across rows, which makes the "compression in time" annotation misleading at a glance.
- **A45-05**: The phase-spectrum column uses ω ∈ [-2π, 2π] while the magnitude column uses ω ∈ [-6π, 6π]; the axis ranges are not matched across the same row.
- **A45-06**: The `∠x(t)` panel for `ω_0 = 1` carries handwritten red `-1` and `1` markers whose meaning (t-endpoints? phase values?) is not stated. Reading is ambiguous.

## p.46 — (Homework solution cont.: FT of `e^{-a|t|}`) + Example: FT of the rectangular pulse (sinc)
No red week/lecture box on this page (continues Week8—Lec1).

**Concepts**
- Splitting a two-sided exponential into two one-sided integrals and recombining.
- `X(jω)` REAL for a real and even signal (blue emphasis: "As a summary, `X(jω)` **is REAL**").
- FT of the rectangular (boxcar) pulse.
- Zero-crossings of the transform.
- L'Hôpital's rule to evaluate `X(j0)` from the `0/0` form.
- Sinc shape; finite duration ↔ infinite bandwidth.

**Equations** (CT)
- (i) `∫_{-∞}^{0} e^{+at} e^{-jωt} dt = ∫_{-∞}^{0} e^{t(a-jω)} dt = (1/(a-jω)) [ e^{(a-jω)t} ]_{-∞}^{0}` — BOXED (green): `= 1/(a-jω)`
- (ii) `∫_{0}^{∞} e^{-at} e^{-jωt} dt = ∫_{0}^{∞} e^{-t(a+jω)} dt = (-1/(a+jω)) [ e^{-(a+jω)t} ]_{0}^{∞}` — BOXED (green): `= 1/(a+jω)`
- `= 1/(a-jω) + 1/(a+jω)` — BOXED (blue): `= 2a / (a² + ω²)`
- Rectangular pulse example: `x(t) = { 1, |t| < T_1 ; 0, |t| > T_1 }`
  `X(jω) = ∫ x(t) e^{-jωt} dt = ∫_{-T_1}^{T_1} 1 · e^{-jωt} dt = (-1/(jω)) [ e^{-jωt} ]_{-T_1}^{T_1} = (-1/(jω)) [ e^{-jωT_1} - e^{+jωT_1} ] = (1/(jω)) [ e^{jωT_1} - e^{-jωT_1} ] = (1/(jω)) · 2j · sin(ωT_1)` — BOXED (blue): `= 2 sin(ωT_1) / ω`
- RED BOX (two starred results):
  `X(jω) = 0 when sin(ωT_1) = 0 ⇒` BOXED (green): `ω = ± (π/T_1) · k`, where `k ∈ Z`. (ZERO-CROSSINGS)
  `X(j0) = 0/0`. Use L'Hôpital rule ⇒ `X(jω)|_{ω=0} = [2 sin(ωT_1)]' / [ω]' |_{ω=0} = (2T_1 cos(ωT_1)) / 1` — BOXED (green): `= 2T_1`

**Examples**
1. **Homework solution (continued from p.45)**: `x(t) = e^{-a|t|}`.
   - Method: split at `t=0`, evaluate both one-sided integrals, add.
   - Final answer (boxed): `X(jω) = 2a/(a² + ω²)`. Noted to be REAL.
   - Illustrated for `a = 0.5, 1, 5`.
2. **Example (tagged)**: "Let `x(t) = { 1, |t| < T_1 ; 0, |t| > T_1 }`. Determine and plot `X(jω)`."
   - Method: direct integration over `[-T_1, T_1]`, Euler recombination, then L'Hôpital at ω=0.
   - Final answers: `X(jω) = 2 sin(ωT_1)/ω`; zero-crossings at `ω = ±(π/T_1)k, k ∈ Z`; `X(j0) = 2T_1`.
   - Illustrated for `T_1 = 1, 5, 10`.

**Homework**
- No new homework tagged; this page contains the solution to the p.45 homework.

**Figures**
1. (MATLAB) 3×2 grid for `e^{-a|t|}`. Rows titled `a = 0.5`, `a = 1`, `a = 5`.
   - Column 1: `x(t)` vs `t`, t ∈ [-5,5], y ∈ [0,1] (ticks 0, 0.5, 1). Two-sided decaying cusp peaking at 1.
   - Column 2: `X(jω)` vs `ω`, ω ∈ [-6π, 6π] (ticks -6π,-3π,0,3π,6π). Row a=0.5: y ∈ [0,4] (ticks 0,2,4); row a=1: y ∈ [0,2] (ticks 0,1,2); row a=5: y ∈ [0,0.4] (ticks 0,0.2,0.4).
   - Red handwritten annotations with down-arrows: "Compression in time" (on the a=1 row, column 1) and "Expansion in frequency" (on the a=1 row, column 2).
2. (Hand-drawn) rectangular pulse `x(t)`: amplitude 1 between `-T_1` and `T_1`, labelled `x(t)`, axis `t`.
3. (MATLAB) 3×2 grid for the rectangular pulse. Rows titled `T_1 = 1`, `T_1 = 5`, `T_1 = 10`.
   - Column 1: `x(t)` vs `t`, t ∈ [-15,15] (ticks -15,-10,-5,0,5,10,15), y ∈ [0,1] (ticks 0,0.5,1). Purple annotation on the `T_1 = 10` panel: double arrow "Finite Duration = 20 seconds".
   - Column 2: `X(jω)` vs `ω`. `T_1=1` panel: ω ∈ [-4π, 4π] (ticks -4π,-3π,-2π,-π,0,π,2π,3π,4π), y ∈ [0,2] (ticks 0,1,2), with red hand-drawn dots on the zero-crossings and red labels `-2π/T_1`, `-π/T_1`, `π/T_1`, `2π/T_1` plus a small red note near ω≈0 reading ILLEGIBLE (approximately "matlab take `k=-∞..∞`"/"π"; the ~3-word red scrawl above the `π` tick is not resolvable at 160 dpi). Purple arrow + label "SINC".
     `T_1=5` panel: ω ∈ [-2π, 2π], y ∈ [0,10] (ticks 0,5,10). `T_1=10` panel: ω ∈ [-2π,2π], y ∈ [0,20] (ticks 0,10,20), purple annotation "Infinite Bandwidth" with a right arrow.

**Ambiguities**
- **A46-01**: The rectangular pulse is defined only for `|t| < T_1` and `|t| > T_1`; the value at `|t| = T_1` is left undefined. (Same gap as p.42.)
- **A46-02**: The zero-crossing box gives `ω = ±(π/T_1)·k, k ∈ Z`, which includes `k = 0`, i.e. `ω = 0` — but `X(j0) = 2T_1 ≠ 0`. The stated zero-crossing set is wrong at `k=0`; the page does not exclude it. Mathematically suspect.
- **A46-03**: The `X(jω)` panels are labelled `X(jω)` (not `|X(jω)|`) and the `T_1=1` panel's y-axis starts at 0 while the curve visibly dips below 0 in the plot for `T_1 = 5, 10`. Axis-limit/label inconsistency: for `T_1=1` negative sidelobes are cut off.
- **A46-04**: In the red box, `X(jω)|_{ω=0}` is written on the left but the derivative expression on the right is evaluated `|_{ω=0}` a second time — the `|_{ω=0}` appears twice with different placement, and the intermediate `[2sin(ωT_1)]'/[ω]'` omits the `lim` operator.
- **A46-05**: The final line of the `e^{-a|t|}` solution places "As a summary, `X(jω)` is REAL" *above* the algebra that produces `2a/(a²+ω²)`, so the claim precedes its justification.
- **A46-06**: The red annotation cluster inside the `T_1 = 1` spectrum panel is ILLEGIBLE at 160 dpi (small red handwriting, roughly centred at ω ≈ 0 between the `0` and `π` ticks).

## p.47 — sinc(·) definitions; FT pair for the rectangular pulse; Example: inverse FT of an ideal LPF spectrum [Week8—Lec2]
Red box: **Week8—Lec2** (next to the Example on the lower half).

**Concepts**
- Two definitions of the sinc function: **unnormalized** (classical math) and **normalized** (signal processing).
- Re-expression of the rectangular-pulse transform in normalized-sinc form.
- Duality-flavoured mirror example: rectangular *spectrum* ⇒ sinc *signal*.
- Zero-crossings of `x(t)` and `x(0)` via L'Hôpital.

**Equations** (CT)
- BOXED (blue): `sinc(x) = sin(x)/x`   (unnormalized — classical math)
- BOXED (blue): `sinc(x) = sin(πx)/(πx)`   (normalized — signal processing)
- `sinc(ωT_1/π) = sin(π · ωT_1/π) / (π · ωT_1/π) = sin(ωT_1)/(ωT_1)`
- `2T_1 sinc(ωT_1/π) = 2 sin(ωT_1)/ω`
- HIGHLIGHTED YELLOW + boxed blue FT pair:
  `x(t) = { 1, |t| < T_1 ; 0, |t| > T_1 }  --F-->  X(jω) = 2T_1 sinc(ωT_1/π)`
- Example: `X(jω) = { 1, |ω| < W ; 0, |ω| > W }`
  `x(t) = (1/2π) ∫_{-∞}^{∞} X(jω) e^{jωt} dω = (1/2π) ∫_{-W}^{W} 1 · e^{jωt} dω = (1/2π)(1/(jt)) [ e^{jωt} ]_{-W}^{W} = (1/(πt))(1/(2j)) [ e^{jWt} - e^{-jWt} ]` — BOXED: `= sin(Wt)/(πt)`
- RED BOX (two starred results):
  `x(t) = 0 when sin(Wt) = 0 ⇒` BOXED (green): `t = ± (π/W) k`, where `k ∈ Z`. (ZERO-CROSSINGS)
  `x(0) = 0/0`. Use L'Hôpital rule. `x(t)|_{t=0} = [sin(Wt)]' / [πt]' |_{t=0} = (W cos(Wt))/π |_{t=0}` — BOXED: `= W/π`
- `sinc(Wt/π) = sin(π · Wt/π)/(π · Wt/π) = sin(Wt)/(Wt)`
- `(W/π) sinc(Wt/π) = (W/π) · sin(Wt)/(Wt) = sin(Wt)/(πt)`

**Examples**
- **Example (tagged, Week8—Lec2)**: "Let `X(jω) = { 1, |ω| < W ; 0, |ω| > W }`. Determine and plot `x(t)`."
  - Given: ideal rectangular (low-pass) spectrum of half-width `W`, height 1.
  - Asked: `x(t)`, plotted.
  - Method: inverse FT integral over `[-W, W]`, Euler recombination, L'Hôpital at `t = 0`, then normalized-sinc re-expression.
  - Final answers: `x(t) = sin(Wt)/(πt)`; zero-crossings `t = ±(π/W)k, k ∈ Z`; `x(0) = W/π`; equivalently `x(t) = (W/π) sinc(Wt/π)` (completed on p.48).

**Homework**
- None on this page.

**Figures**
1. (MATLAB) "Normalized Sinc": `sinc(·)` vs `x`, x ∈ [-5,5] (integer ticks -5…5), y ∈ [0,1] (ticks 0, 0.5, 1). Continuous curve, peak 1 at x=0, zeros at every nonzero integer.
2. (MATLAB) "Unnormalized Sinc": `sinc(·)` vs `x`, x ∈ [-4π, 4π] (ticks -4π,-3π,-2π,-π,0,π,2π,3π,4π), y ∈ [0,1]. Continuous curve, peak 1 at x=0, zeros at every nonzero multiple of π.
3. (Hand-drawn) rectangular spectrum `X(jω)`: amplitude 1 between `-W` and `W`. **The horizontal axis is labelled `t`** (see A47-02), the plot is labelled `X(jω)`.

**Ambiguities**
- **A47-01** (significant): The titles of the two MATLAB sinc panels are **swapped relative to the definitions**. The panel titled "Normalized Sinc" has zeros at integers (correct for `sin(πx)/(πx)`), and the panel titled "Unnormalized Sinc" has zeros at multiples of π (correct for `sin(x)/x`) — so the *titles* are right, but they appear in the reverse order of the two boxed definitions written to their left (unnormalized is defined first, normalized second, while the plots show normalized first). Layout mismatch, not a math error; flagged because it invites misreading.
- **A47-02**: In the hand-drawn rectangular *spectrum* figure the horizontal axis is labelled `t` although the plotted quantity is `X(jω)` with limits `-W` and `W` in ω. Axis label is wrong.
- **A47-03**: Both boxed sinc definitions use the identical left-hand side `sinc(x)`; the page relies on the surrounding text to disambiguate. No subscript or alternative symbol is introduced.
- **A47-04**: Same `k=0` issue as A46-02: `t = ±(π/W)k, k ∈ Z` includes `t = 0`, where `x(0) = W/π ≠ 0`.
- **A47-05**: In the derivation `(1/2π)(1/(jt))[e^{jωt}]_{-W}^{W}` the antiderivative constant is written `1/(jt)` but the next step shows `(1/(πt))(1/(2j))` — the regrouping is correct but the intermediate `1/(2π)·1/(jt)` → `1/(πt)·1/(2j)` step is compressed and easy to misread.
- **A47-06**: The example asks to "Determine and plot `x(t)`" but no plot of `x(t)` appears on p.47; the plots are on p.48.

## p.48 — FT pair for the sinc/ideal LPF; Inverse Relationship Between Time and Frequency; Time-Bandwidth Product
No red week/lecture box on this page (continues Week8—Lec2).

**Concepts**
- FT pair: sinc in time ↔ rectangle in frequency (**IDEAL LOW-PASS FILTER**, green cloud label).
- MAIN LOBE BANDWIDTH (red annotation).
- Infinite Duration in time ↔ Finite Bandwidth (purple braces).
- Ideal low-pass filters generated from a `sinc(·)` impulse response.
- Sinc pulse shaping in communication systems: minimum bandwidth, avoids Intersymbol Interference (ISI).
- **Inverse Relationship Between Time and Frequency** (red heading) with two green boxes of rules.
- **TIME-BANDWIDTH PRODUCT**: duration × bandwidth = constant.

**Equations** (CT)
- HIGHLIGHTED YELLOW + boxed blue FT pair:
  `x(t) = (W/π) · sinc(Wt/π)  --F-->  X(jω) = { 1, |ω| < W ; 0, |ω| > W }`
- Green box 1: `Compression in Time → Expansion in Frequency` ; `Expansion in Time → Compression in Frequency`
  Green caption: "A SIGNAL CANNOT BE EITHER COMPRESSED OR EXPANDED IN BOTH TIME AND FREQUENCY."
- Green box 2: `Infinite Duration in Time → Finite Bandwidth` ; `Finite Duration in Time → Infinite Bandwidth`
  Green caption: "A SIGNAL CANNOT BE LIMITED IN BOTH TIME AND FREQUENCY"
- `(duration) × (bandwidth) = constant`  (TIME-BANDWIDTH PRODUCT)
- `T × BW = 2π : constant`  (blue "constant")
- Handwritten annotations on the plots: `W/π = 1` (for `W = π`); `W/π = 2` (for `W = 2π`); `T = 2`; `BW = π`.

**Examples**
- No newly tagged example; the page completes the p.47 example by plotting it for `W = 0.5π, π, 2π`, and closes with a rectangular-pulse / sinc illustration of the time-bandwidth product.
  - Time-bandwidth illustration: rectangular `x(t)` of height 1 on `[-1, 1]` (`T = 2`) with spectrum whose first zero is at `ω = π` (`BW = π`), giving `T × BW = 2π`.

**Homework**
- None on this page.

**Figures**
1. (MATLAB) 3×2 grid for the sinc/rect pair. Rows titled `W = 0.5π`, `W = π`, `W = 2π`.
   - Column 1: `x(t)` vs `t`, t ∈ [-5,5] (integer ticks). Row `W=0.5π`: y ∈ [0,0.4] (ticks 0,0.2,0.4), with red hand-drawn dots on zero-crossings and red labels `-2π/W`, `-π/W`, `π/W`, `2π/W`. Row `W=π`: y ∈ [0,1] (ticks 0,0.5,1), red dots on zero-crossings, purple annotation `W/π = 1` with arrow to the peak. Row `W=2π`: y ∈ [0,2] (ticks 0,1,2), red dots on zero-crossings, purple annotation `W/π = 2`.
   - Column 2: `X(jω)` vs `ω`, ω ∈ [-3π, 3π] (ticks -3π,-2π,-π,0,π,2π,3π), y ∈ [0,1] (ticks 0,0.5,1). Rectangles of half-width `0.5π`, `π`, `2π` respectively. Purple double-arrows labelled `0.5π`, `π`, and `2π / Bandwidth`. Red annotation "MAIN LOBE BANDWIDTH" with a squiggly arrow to the `W = 0.5π` panel. Green cloud "IDEAL LOW-PASS FILTER" next to the `W = 2π` panel.
   - Red annotations spanning the grid: "Compression in time ↓" (left) and "expansion in frequency ↓" (right). Purple braces under column 1: "Infinite Duration"; under column 2: "Finite Bandwidth".
2. (MATLAB) Time-bandwidth pair:
   - `x(t)` vs `t`, t ∈ [-3,3] (integer ticks), y ∈ [0,1] (ticks 0,0.5,1): rectangle of height 1 on `[-1,1]`, red double-arrow annotated `T = 2`.
   - `X(jω)` vs `ω`, ω ∈ [-4π, 4π] (ticks -4π,-3π,-2π,-π,0,π,2π,3π,4π), y ∈ [-1,2] (ticks -1,0,1,2): sinc with peak 2 at ω=0, red dot at the first zero-crossing with red annotation `BW = π`.

**Ambiguities**
- **A48-01**: The text says "The plots of `x(t)` and `X(jω)` for `W = 1, 5, and 10` are given as:" but the three MATLAB panels are titled `W = 0.5π`, `W = π`, `W = 2π`. The stated values (1, 5, 10) do not match the plotted values. Direct internal contradiction.
- **A48-02**: The `T × BW = 2π` claim is derived from a rectangle of total duration `T = 2` (i.e. `T_1 = 1`) whose spectrum `2sin(ω)/ω` has its first zero at `ω = π`, so `BW = π` and `T·BW = 2π`. But "bandwidth" here means *first-null* bandwidth of a one-sided measure while `T` is a two-sided duration — the mixed convention is not stated, and the "constant" `2π` is convention-dependent.
- **A48-03**: In the yellow FT-pair box the time-domain factor is `(W/π)·sinc(Wt/π)` while p.47's boxed result was `sin(Wt)/(πt)`; equivalent, but the page never repeats the equivalence line here — it is on p.47's last two bullets.
- **A48-04**: The purple annotation `2π / Bandwidth` in the `W = 2π` spectrum panel reads as a fraction "2π over Bandwidth" but is actually a label `2π` above the word `Bandwidth`. Layout ambiguity.
- **A48-05**: The green claim "A SIGNAL CANNOT BE LIMITED IN BOTH TIME AND FREQUENCY" is stated without qualification; strictly it is a theorem about nonzero signals (the zero signal is trivially both). Minor, but stated as absolute.
- **A48-06**: The `X(jω)` column-2 panels in figure 1 have y-range starting at 0 and no negative values, correct for a rectangle; but figure 2's `X(jω)` panel uses y ∈ [-1,2] and is labelled `X(jω)` while showing a signed sinc. The same label is used for a nonnegative and a signed quantity across the page.

## p.49 — THE FOURIER TRANSFORM FOR PERIODIC SIGNALS; Example: FT of the periodic square wave
No red week/lecture box on this page (continues Week8—Lec2).

**Concepts**
- FT of a complex exponential is an impulse in frequency.
- FT of a periodic signal = a train of impulses at the harmonic frequencies, weighted by `2π a_k`.
- Spectral line picture of `X(jω)` for a periodic signal.
- Consistency check via the inverse FT of `2πδ(ω - kω_0)`.
- Comparison of `X(jω)` against `a_k` as `T` grows.

**Equations** (CT)
- `F{e^{jω_0 t}} = 2π δ(ω - ω_0)` (stated as already shown, "using the definition of inverse FT")
- HIGHLIGHTED YELLOW + boxed blue: `x(t) = Σ_{k=-∞}^{∞} a_k e^{jkω_0 t}`
- `X(jω) = F{x(t)} = ∫_{-∞}^{∞} x(t) e^{-jωt} dt = ∫_{-∞}^{∞} ( Σ_{k=-∞}^{∞} a_k e^{jkω_0 t} ) e^{-jωt} dt`
  `= Σ_{k=-∞}^{∞} a_k [ ∫_{-∞}^{∞} e^{jkω_0 t} e^{-jωt} dt ]` — under-brace (blue): `= 2π δ(ω - kω_0)` ★
  HIGHLIGHTED YELLOW: `= Σ_{k=-∞}^{∞} 2π a_k δ(ω - kω_0)`
- Blue cloud note: `F^{-1}{2π δ(ω - kω_0)} = (1/2π) ∫_{-∞}^{∞} 2π δ(ω - kω_0) e^{jωt} dω = e^{jkω_0 t}` ★
- Example: `a_k = sin(2πk T_1/T) / (πk)` — BOXED (blue)
- `X(jω) = Σ_{k=-∞}^{∞} 2π a_k δ(ω - kω_0)`
- BOXED (blue): `= Σ_{k=-∞}^{∞} 2π · [ sin(2πk T_1/T) / (πk) ] · δ(ω - kω_0)` — the `2π`'s `π` and the `πk`'s `π` are struck through (cancellation marks), leaving `2/k`.
- Red bullets:
  - "When `T = 8T_1` and `T_1 = 1`, `ω_0 = 2π/8 =` BOXED (green) `π/4`"
  - "When `T = 16T_1` and `T_1 = 1`, `ω_0 = 2π/16 =` BOXED (green) `π/8`"
  - "When `T = 16T_1` and `T_1 = 1`, `ω_0 = 2π/32 =` BOXED (green) `π/16`"  ← as written; see A49-02

**Examples**
- **Example (tagged)**: "Consider the periodic signal `x(t)` plotted as: ... Plot `X(jω)`."
  - Given: periodic square wave, amplitude 1, pulse half-width `T_1`, period `T` (marks `-T, -T_1, 0, T_1, T`).
  - Asked: plot `X(jω)`.
  - Method: reuse the FS coefficients from Ch.3, then apply `X(jω) = Σ 2π a_k δ(ω - kω_0)`.
  - Final answer (boxed): `X(jω) = Σ_{k=-∞}^{∞} (2/k) sin(2πk T_1/T) δ(ω - kω_0)` [after the struck-through π cancellation]; illustrated for `T = 8T_1, 16T_1, 32T_1`.

**Homework**
- None on this page.

**Figures**
1. (Hand-drawn, boxed blue) Spectral-line diagram of `X(jω)`: upward arrows on the `ω` axis at `-2ω_0, -ω_0, 0, ω_0, 2ω_0` with "…" on both sides, labelled `(2πa_{-2}) (2πa_{-1}) (2πa_0) (2πa_1) (2πa_2)`.
2. (MATLAB-styled hand plot) periodic square wave `x(t)` vs `t`, y ∈ [0,1] (ticks 0, 0.5, 1), axis marks `-T`, `-T_1`, `0`, `T_1`, `T`.
3. (MATLAB) 3×2 grid, `X(jω)` (left column) vs `a_k` (right column). Rows titled `T = 8T_1, T_1 = 1`; `T = 16T_1, T_1 = 1`; `T = 32T_1, T_1 = 1`.
   - `X(jω)` row 1: ω ∈ [-5π, 5π] (ticks -5π, -2.5π, 0, 2.5π, 5π), y ∈ [0,2] (ticks 0,1,2), stems with a sinc envelope.
   - `X(jω)` row 2: ω ∈ [-5π, 5π], y ∈ [0,1] (ticks 0, 0.5, 1).
   - `X(jω)` row 3: ω ∈ [-2.5π, 2.5π] (ticks -2.5π, -1.25π, 0, 1.25π, 2.5π), y ∈ [0,0.4] (ticks 0, 0.2, 0.4).
   - `a_k` row 1: k ∈ [-20, 20] (ticks -20,-10,0,10,20), y ∈ [0, 0.2] (ticks 0, 0.1, 0.2).
   - `a_k` row 2: k ∈ [-40, 40] (ticks -40,-20,0,20,40), y ∈ [0, 0.1] (ticks 0, 0.05, 0.1).
   - `a_k` row 3: k ∈ [-40, 40], y ∈ [0, 0.06] (ticks 0, 0.02, 0.04, 0.06).
   All stem plots with a visible sinc envelope.

**Ambiguities**
- **A49-01**: The header says "`X(jω)` vs `a_k` for `T = 8T_1, 16T_1, and 32T_1`", but the plotted `a_k` panels appear nonnegative (no negative sidelobes), whereas `sin(2πkT_1/T)/(πk)` is signed. The panels may plot `|a_k|` while being labelled `a_k`. Cannot be resolved at 160 dpi — flagged.
- **A49-02** (significant): The third red bullet reads "When `T = 16T_1` and `T_1 = 1`, `ω_0 = 2π/32 = π/16`". The value `2π/32` corresponds to `T = 32T_1`, not `16T_1`; and `T = 16T_1` already appears in the second bullet with `ω_0 = π/8`. The label is wrong; transcribed as written, not corrected.
- **A49-03**: In the boxed `X(jω)` expression the `π` of `2π` and the `π` of `πk` are struck through, but the result of the cancellation (`2/k`) is never written out — the reader must complete it.
- **A49-04**: The plotted `X(jω)` panels show stems of *finite height* even though `X(jω)` for a periodic signal is a train of Dirac impulses (infinite height, finite area). The plots represent impulse weights; this is never stated.
- **A49-05**: The `T_1` in the red bullets is written with what looks like an overbar in the second and third bullets (`T̄_1`); reading is `T_1`. Low-confidence glyph.
- **A49-06**: The blue cloud writes `F^{-1}{2πδ(ω-kω_0)} = ... = e^{jkω_0 t}` with a green arrow substituting `ω → kω_0` in the exponent; the arrow's origin circles `kω_0` inside the delta, which is visually ambiguous (same issue as A45-03).

## p.50 — Example: FT of a sinusoid sum; cos/sin FT pairs; Example: FT of the impulse train [Week9—Lec1]
Red box: **Week9—Lec1**.

**Concepts**
- Euler expansion + the exponential-to-impulse rule to get the FT of any sum of sinusoids.
- Standard FT pairs for `cos(ω_0 t)` and `sin(ω_0 t)`.
- MATLAB tooling note: `fft(·)`, `fourier(·)`, and `fplot`.
- FT of the CT impulse train; self-duality of the impulse train (impulse train in time ↔ impulse train in frequency).
- Expansion in time ↔ compression in frequency for the impulse train spacing.

**Equations** (CT)
- HIGHLIGHTED YELLOW + boxed: `e^{jkω_0 t} --F--> 2π δ(ω - kω_0)`  (red brace annotates `kω_0` as `ω_1` on both sides)
- `F{5} = F{5 e^{j0t}} = 5 · 2π δ(ω - 0) =` BOXED: `10π δ(ω)`
- `F{4 cos(3πt)} = F{2 e^{j3πt} + 2 e^{-j3πt}} = 2 F{e^{j3πt}} + 2 F{e^{-j3πt}} = 2·2π δ(ω - 3π) + 2·2π δ(ω + 3π) =` BOXED: `4π δ(ω - 3π) + 4π δ(ω - 3π)`  ← as written; see A50-01
- `F{6 sin(4πt)} = F{ (6/2j) e^{j4πt} - (6/2j) e^{-j4πt} } = (3/j) F{e^{j4πt}} - (3/j) F{e^{-j4πt}} = (3/j) 2π δ(ω - 4π) - (3/j) 2π δ(ω + 4π) =` BOXED: `(6π/j) δ(ω - 4π) - (6π/j) δ(ω + 4π)`
- HIGHLIGHTED YELLOW + boxed blue: `cos(ω_0 t) --F--> π δ(ω + ω_0) + π δ(ω - ω_0)`
- HIGHLIGHTED YELLOW + boxed blue: `sin(ω_0 t) --F--> (π/j) δ(ω - ω_0) - (π/j) δ(ω + ω_0)`
- Impulse train: `x(t) = Σ_{k=-∞}^{∞} δ(t - kT)`
- `a_k = (1/T) ∫_T x(t) e^{-jk(2π/T)t} dt = (1/T) ∫_{-T/2}^{T/2} δ(t) e^{-jk(2π/T)t} dt = (1/T) e^{-jk(2π/T)·0} =` BOXED: `1/T`, `∀k`  (red annotation "Sifting Property"; the exponent's `·0` written in red)
- HIGHLIGHTED YELLOW + boxed blue (labelled IMPULSE TRAIN): `X(jω) = Σ_{k=-∞}^{∞} 2π a_k δ(ω - (2π/T)k) = Σ_{k=-∞}^{∞} (2π/T) δ(ω - (2π/T)k)`
- Blue annotations on the plots: `Spacing: 2π/1 = 2π` (T=1); `Spacing: 2π/2 = π` (T=2)

**Examples**
1. **Example (tagged, Week9—Lec1)**: "Determine the Fourier transform of the signal, `x(t) = 5 + 4 cos(3πt) + 6 sin(4πt)`. Plot `|X(jω)|`."
   - Method: Euler expansion term-by-term + `e^{jω_1 t} --F--> 2πδ(ω-ω_1)`.
   - Final answers (boxed, term by term): `10π δ(ω)`; `4π δ(ω-3π) + 4π δ(ω-3π)` [as written]; `(6π/j) δ(ω-4π) - (6π/j) δ(ω+4π)`.
2. **Example (tagged)**: "Determine and plot the Fourier Transform of `x(t) = Σ_{k=-∞}^{∞} δ(t - kT)`."
   - Method: identify the fundamental period `T`, compute `a_k` by the FS analysis integral + sifting, then apply the periodic-signal FT rule.
   - Final answer: `a_k = 1/T ∀k`; `X(jω) = Σ_{k=-∞}^{∞} (2π/T) δ(ω - (2π/T)k)`.
   - Illustrated for `T = 1` and `T = 2`.

**Figures**
1. (Hand-drawn, boxed green) `X(jω)` spectral lines vs `ω`: axis marks (left to right) an unlabelled/partly-labelled tick reading `4π` immediately left of the origin region, then `-3π`, `0`, `3π`, `4π`. Upward arrows with weights `(4π)` at `-3π`, `(10π)` at `0`, `(4π)` at `3π`, `(6π/j)` at `4π`; one **downward** arrow at the far-left position with weight `(-6π/j)`. See A50-03 for the axis-label problem.
2. (MATLAB) `x(t)` vs `t`, continuous, t ∈ [-2,2] (integer ticks), y ∈ [0,10] region (ticks 0, 5, 10); oscillatory waveform reaching ~11 at t≈-2.
3. (MATLAB) `|X(jω)|` vs `ω`, stem, ω ∈ [-5π, 5π] (ticks at every π from -5π to 5π), y ticks `0, 2π, 4π, 6π, 8π, 10π`. Red handwritten weight labels: `(6π)` at ω=-4π, `(4π)` at ω=-3π, `(10π)` at ω=0, `(4π)` at ω=3π, `(6π)` at ω=4π. Purple boxed note underneath: "`fft(·)`, `fourier(·)`, and `fplot` in MATLAB."
4. (Hand-drawn, boxed blue) `X(jω)` impulse train: upward arrows at `-4π/T, -2π/T, 0, 2π/T, 4π/T` each labelled `(2π/T)`, with "…" on both sides, axis `ω`, plot labelled `X(jω)`.
5. (MATLAB) 2×2 grid for the impulse train:
   - `x(t)` vs `t`, t ∈ [-4,4] (ticks -4,-2,0,2,4), y ∈ [0,1], title `T = 1`: vertical lines spaced 1.
   - `x(t)` vs `t`, same axes, title `T = 2`: vertical lines spaced 2.
   - `|X(jω)|` vs `ω`, ω ∈ [-4π, 4π] (ticks -4π,-2π,0,2π,4π), y ∈ [0, 2π] (ticks 0, π, 2π), for `T = 1`: lines spaced `2π`, red fraction annotation `2π/1`.
   - `|X(jω)|` vs `ω`, same axes, for `T = 2`: lines spaced `π`, red fraction annotation `2π/2`.
   - Red arrows/labels across the top: "expansion in time"; across the bottom: "compression in frequency". Blue annotations "Spacing: 2π/1 = 2π" (circled `2π`) and "Spacing: 2π/2 = π" (circled `π`).

**Ambiguities**
- **A50-01** (significant): The boxed result for `F{4cos(3πt)}` is written `4π δ(ω - 3π) + 4π δ(ω - 3π)` — the second impulse repeats `ω - 3π` where the line immediately above has `2·2π δ(ω + 3π)`. The boxed answer should read `4π δ(ω+3π)`. Transcription is verbatim; not corrected.
- **A50-02**: The `sin` pair is written `(π/j)δ(ω-ω_0) - (π/j)δ(ω+ω_0)` while the worked example produced `(6π/j)δ(ω-4π) - (6π/j)δ(ω+4π)`; consistent, but many texts write these with `-jπ`. The `1/j` form is retained here — note that `π/j = -jπ`, so the impulse weights are imaginary and the "magnitude" plot (fig 3) shows `|6π/j| = 6π`, which is only consistent if the plot is `|X(jω)|`. The hand-drawn fig 1 shows signed weights `(6π/j)` and `(-6π/j)` on the *same* diagram labelled `X(jω)` — the two diagrams use different conventions.
- **A50-03**: In fig 1 the leftmost axis label reads `4π` (positive) but sits to the left of `-3π`, i.e. at the `-4π` position where the downward `(-6π/j)` arrow is drawn. The minus sign is either missing or illegible. Reading is `-4π`; flagged, not corrected.
- **A50-04**: `F{5} = F{5e^{j0t}} = 5·2πδ(ω-0)` uses the exponential rule at `ω_0 = 0`; this is the FT of a constant, whose existence requires the generalized-function framework. Never remarked on.
- **A50-05**: The `a_k` derivation replaces `x(t)` by `δ(t)` inside `∫_{-T/2}^{T/2}` without stating that only the `k=0` impulse of the train lies inside that window.
- **A50-06**: Figure 2's y-axis ticks are 0, 5, 10 but the waveform clearly exceeds 10 (peaks near 11) at the left edge; the axis is not labelled with the actual maximum. `x(t) = 5+4cos+6sin` has max `5+4+6 = 15`, so the plotted range is also inconsistent with the stated amplitude range.
- **A50-07**: In the `a_k` line the exponent `e^{-jk(2π/T)·0}` has the `·0` written in red as an overlay, making the base expression `e^{-jk(2π/T)t}` and its evaluation visually merged.

## p.51 — PROPERTIES OF THE CONTINUOUS-TIME FOURIER TRANSFORM: (1) Linearity, (2) Time-Shifting; Example
No red week/lecture box on this page (continues Week9—Lec1).

**Concepts**
- Property (1) Linearity.
- Property (2) Time-Shifting, with proof by substitution `τ = t - t_0`.
- Polar form of `X(jω)`; time shift ⇒ pure phase shift `-ω t_0`, magnitude unchanged.
- Decomposition of a staircase signal into shifted/scaled rectangles.
- L'Hôpital annotation on the magnitude peak.

**Equations** (CT)
- (1) Linearity: If `x_1(t) --F--> X_1(jω)` and `x_2(t) --F--> X_2(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `a x_1(t) + b x_2(t) --F--> a X_1(jω) + b X_2(jω)`
- (2) Time-Shifting: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `x(t - t_0) --F--> e^{-jω t_0} X(jω)`
- Proof: `F{x(t-t_0)} = ∫_{-∞}^{∞} x(t-t_0) e^{-jωt} dt = ∫ x(τ) e^{-jω(τ+t_0)} dτ = e^{-jω t_0} ∫_{-∞}^{∞} x(τ) e^{-jωτ} dτ`
  (annotations: `τ ≜ t - t_0`, `dτ/dt = 1`; final integral under-braced `X(jω)`) ∎
- Polar form: `X(jω) = |X(jω)| e^{j∠X(jω)}`
- `e^{-jω t_0} X(jω) = |X(jω)| e^{j[∠X(jω) - ω t_0]}`  (blue arrow: "Phase shift of `x(jω)`.")
- Example (a) BOXED: `x_3(t) = 2 x_1(t-4) + x_2(t-3)`
- Example (b): `X_1(jω) = 2 sin(2ω)/ω` and `X_2(jω) = 2 sin(ω)/ω`
- `X_3(jω) = 2 X_1(jω) e^{-jω4} + X_2(jω) e^{-jω3}`
- `X_3(jω) = 2 · (2 sin(2ω)/ω) e^{-jω4} + (2 sin(ω)/ω) e^{-jω3}`
- BOXED (blue): `X_3(jω) = (4 sin(2ω)/ω) e^{-jω4} + (2 sin(ω)/ω) e^{-jω3}`

**Examples**
- **Example (tagged)**: three plotted signals `x_1(t)`, `x_2(t)`, `x_3(t)`.
  - Given: `x_1(t)` = rectangle of height 1 on `t ∈ [-2, 2]`; `x_2(t)` = rectangle of height 1 on `t ∈ [-1, 1]`; `x_3(t)` = staircase, height 3 on `[2, 4]`, height 2 on `[4, 6]`, 0 elsewhere.
  - Asked: (a) write `x_3(t)` as a function of `x_1(t)` and `x_2(t)`; (b) determine the FT of `x_3(t)` and plot its magnitude and phase spectra.
  - Method: shift/scale decomposition + linearity + time-shifting property; the rectangle transforms are quoted from the earlier rectangular-pulse result.
  - Final answers: (a) `x_3(t) = 2x_1(t-4) + x_2(t-3)`; (b) `X_3(jω) = (4sin(2ω)/ω) e^{-jω4} + (2sin(ω)/ω) e^{-jω3}`.

**Homework**
- None on this page.

**Figures**
1. (MATLAB) `x_1(t)` vs `t`, t ∈ [-4,4] (ticks -4,-2,0,2,4), y ∈ [0,1] (ticks 0, 0.5, 1): rectangle of height 1 on `[-2,2]`.
2. (MATLAB) `x_2(t)` vs `t`, t ∈ [-2,2] (ticks -2,-1,0,1,2), y ∈ [0,1] (ticks 0, 0.5, 1): rectangle of height 1 on `[-1,1]`.
3. (MATLAB) `x_3(t)` vs `t`, t ∈ [0,8] (ticks 0,2,4,6,8), y ∈ [0,3] (ticks 0,1,2,3): staircase 3 on `[2,4]`, 2 on `[4,6]`.
4. (MATLAB) `|X_3(jω)|` vs `ω`, continuous, ω ∈ [-4π, 4π] (ticks at every π), y ∈ [0,10] (ticks 0, 5, 10). Main lobe peaks near 10 at ω=0, circled in red with green annotation "L'Hopital" and an arrow.
5. (MATLAB) `∠X_3(jω)` vs `ω`, continuous, ω ∈ [-4π, 4π], y ∈ [-π, π]: heavily wrapped sawtooth-like phase.

**Ambiguities**
- **A51-01**: The proof's change of variables is written `τ ≜ t - t_0`, `dτ/dt = 1`, and the integrand becomes `x(τ) e^{-jω(τ+t_0)}` — but the integral limits are dropped in that middle step (written as a bare `∫`) and restored as `∫_{-∞}^{∞}` only in the final step. Limits are elided mid-proof.
- **A51-02**: The blue arrow labels the result as "Phase shift of `x(jω)`" — lowercase `x` where the quantity is `X(jω)`. Symbol case error.
- **A51-03**: `X_1(jω) = 2sin(2ω)/ω` is quoted "Since `x_1(t)` and `x_2(t)` are rectangular waves" without re-deriving, and implicitly uses `T_1 = 2` for `x_1` and `T_1 = 1` for `x_2`. The `T_1` values are never stated on this page.
- **A51-04**: `|X_3(j0)| = 4·2 + 2·1 = 10` (via L'Hôpital) matches the plot peak, but the page never writes this value; the "L'Hopital" annotation points at the peak without giving the number.
- **A51-05**: In `X_3(jω) = 2 X_1(jω) e^{-jω4} + X_2(jω) e^{-jω3}` the exponents are written `e^{-jω4}` and `e^{-jω3}` (number after ω) rather than `e^{-j4ω}`; harmless but non-standard, and `-jω4` could be misread as `-jω^4`.

## p.52 — Properties (3) Frequency-Shift, (4) Conjugation; Example: frequency-shifted sinc; real/even symmetry
No red week/lecture box on this page (continues Week9—Lec1).

**Concepts**
- Property (3) Frequency-Shift (modulation).
- Property (4) Conjugation.
- Conjugate symmetry of the FT of a real signal: real part EVEN, imaginary part ODD.
- Time-reversal FT rule `x(-t) --F--> X(-jω)`, derived in a green box.
- If `x(t)` is real **and even**, then `X(jω)` is both REAL and EVEN.

**Equations** (CT)
- (3) Frequency-Shift: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `e^{+jω_0 t} x(t) --F--> X(j(ω - ω_0))`
  Proof: `F{x(t) e^{-jω_0 t}} = ∫ x(t) e^{jω_0 t} e^{-jωt} dt = ∫ x(t) e^{-j(ω - ω_0)t} dt =` BOXED (green): `X(j(ω-ω_0))`   (the `(ω-ω_0)` in the exponent highlighted green)
- Example: `y(t) = sin(2πt)/(πt)`. Then `Y(jω) = { 1, |ω| ≤ 2π ; 0, o.w. }`
- `x_1(t) = e^{j2πt} y(t)`, `X_1(jω) = Y(j(ω - 2π)) = { 1, 0 ≤ ω ≤ 4π ; 0, o.w. }`  (red label "FREQUENCY SHIFT")
- `x_2(t) = e^{-j2πt} y(t)`, `X_2(jω) = Y(j(ω + 2π)) = { 1, -4π ≤ ω ≤ 0 ; 0, o.w. }`
- (4) Conjugation: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue: `x*(t) --F--> X*(-jω)`
  Proof: `(X(jω))* = ( ∫ x(t) e^{-jωt} dt )* → X*(jω) = ∫ x*(t) e^{jωt} dt`
  BOXED (green): `X*(-jω) = ∫ x*(t) e^{-jωt} dt`  : Fourier transform of `x*(t)`. ∎ (blue: "Replace ω by -ω")
- If `x(t)` is real, `x(t) = x*(t) ⇒ X(jω) = X*(-jω)`
  `X(jω) = Re{X(jω)} + j Im{X(jω)}`
  `X*(jω) = Re{X(jω)} - j Im{X(jω)}`
  `X*(-jω) = Re{X(-jω)} - j Im{X(-jω)}`
  ⇒ `Re{X(jω)} = Re{X(-jω)}` — "Real parts of `X(jω)` should be **EVEN**"
  ⇒ `Im{X(jω)} = - Im{X(-jω)}` — "Imaginary parts of `X(jω)` should be **ODD**"
- If `x(t)` is real and even, then `x(t) = x*(t) = x(-t)`
- GREEN BOX ("How to find `F{x(-t)}`?"): `X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt → X(-jω) = ∫_{-∞}^{∞} x(t) e^{jωt} dt` (blue: "replace ω by -ω")
  `Define τ = -t, then dτ/dt = -1. So, X(-jω) = ∫_{∞}^{-∞} x(-τ) e^{-jωτ} dτ.`  Hence HIGHLIGHTED BLUE: `x(-t) --F--> X(-jω)`
  Left-margin limit bookkeeping: `-∞ < t < ∞` ; `-∞ < -τ < ∞` ; `∞ > τ > -∞`
- `Since x(t) = x*(t) = x(-t) → X(jω) = X*(-jω) = X(-jω)` : "`X(jω)` is both **REAL** and **EVEN**" (blue braces label the two equalities `real` and `even`)

**Examples**
- **Example (tagged)**: "Determine and plot the Fourier Transforms of `x_1(t) = e^{j2πt} sin(2πt)/(πt)` and `x_2(t) = e^{-j2πt} sin(2πt)/(πt)`."
  - Method: set `y(t) = sin(2πt)/(πt)` with known rectangular `Y(jω)`, then apply the frequency-shift property.
  - Final answers: `X_1(jω) = { 1, 0 ≤ ω ≤ 4π ; 0 o.w. }` ; `X_2(jω) = { 1, -4π ≤ ω ≤ 0 ; 0 o.w. }`.

**Homework**
- None on this page.

**Figures** (all MATLAB, one row of four)
1. `y(t) = sin(2πt)/(πt)` vs `t`, continuous, t ∈ [-5,5] (ticks -5, 0, 5), y ∈ [0,2] (ticks 0,1,2); sinc peaking at 2.
2. `Y(jω)` vs `ω`, ω ∈ [-6π, 6π] (ticks -6π,-4π,-2π,0,2π,4π,6π), y ∈ [0,1] (ticks 0, 0.5, 1); rectangle of height 1 spanning about `[-2π, 2π]`.
3. `X_1(jω)` vs `ω`, same axes; rectangle of height 1 spanning about `[0, 4π]`.
4. `X_2(jω)` vs `ω`, same axes; rectangle of height 1 spanning about `[-4π, 0]`.

**Ambiguities**
- **A52-01** (significant): The frequency-shift statement is `e^{+jω_0 t} x(t) --F--> X(j(ω-ω_0))`, but the proof line begins `F{x(t) e^{-jω_0 t}}` (minus sign) and then immediately writes `∫ x(t) e^{jω_0 t} e^{-jωt} dt` (plus sign). The left-hand side of the proof contradicts both the property statement and its own integrand.
- **A52-02**: Interval endpoints are inconsistent across the example: `Y(jω)` uses `|ω| ≤ 2π`, `X_1(jω)` uses `0 ≤ ω ≤ 4π`, `X_2(jω)` uses `-4π ≤ ω ≤ 0`. The shifted versions therefore each claim a closed interval of length `4π` while the original has length `4π` too — consistent, but the original was earlier (p.53) written with `<`. Endpoint convention drifts.
- **A52-03**: In the green box, `X(-jω) = ∫_{∞}^{-∞} x(-τ) e^{-jωτ} dτ` retains the reversed limits (`∞` to `-∞`) but drops the `-dτ` from `dτ/dt = -1`; the two sign flips cancel, but as written the equation is off by a factor of `-1`. Mathematically suspect as transcribed.
- **A52-04**: In the real-signal derivation, `X*(jω) = Re{X(jω)} - j Im{X(jω)}` is listed but never used; only `X(jω)` and `X*(-jω)` are compared. Dead line.
- **A52-05**: The conclusion `Re{X(jω)} = Re{X(-jω)}` is labelled "should be EVEN" and `Im{X(jω)} = -Im{X(-jω)}` "should be ODD" — correct, but stated as a requirement ("should be") rather than a consequence.
- **A52-06**: The plotted `x_1(t)` and `x_2(t)` are complex-valued, but only their (real, rectangular) transforms are shown; no plot of the signals themselves, though the problem says "Determine and plot the Fourier Transforms of `x_1(t)` and `x_2(t)`" — satisfied, but the first panel plots `y(t)`, which was not asked for.

## p.53 — real-and-odd symmetry; (5) Differentiation Property; (6) Time Scaling; Example
No red week/lecture box on this page (continues Week9—Lec1).

**Concepts**
- If `x(t)` is real **and odd**, then `X(jω)` is PURELY IMAGINARY and ODD.
- Property (5) Differentiation.
- Property (6) Time Scaling, with the `|a|` factor and the `a < 0` limit-flip argument.
- Time scaling illustrated on a sinc / rectangular-spectrum pair.

**Equations** (CT)
- If `x(t)` is real and odd: `x(t) = x*(t) = -x(-t) → X(jω) = X*(-jω) = -X(-jω)`
  `X(jω) = Re{X(jω)} + j Im{X(jω)}`
  `X*(-jω) = Re{X(-jω)} - j Im{X(-jω)}`
  `-X(-jω) = -Re{X(-jω)} - j Im{X(-jω)}`
  (top brace) `Re{X(-jω)} - j Im{X(-jω)} = -Re{X(-jω)} - j Im{X(-jω)}`
  ⇒ `Re{X(-jω)} = -Re{X(-jω)} = 0`
  "`X(jω)` should be **PURELY IMAGINARY** and **ODD**"
- (5) Differentiation: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `(d^n/dt^n) x(t) --F--> (jω)^n X(jω)`
  Proof: `x(t) = (1/2π) ∫ X(jω) e^{jωt} dω → (d/dt) x(t) = (jω) (1/2π) ∫ X(jω) e^{jωt} dω`  (the integral under-braced `= x(t)`)
  First Derivative: `F{ (d/dt) x(t) } = F{ (jω) x(t) } = jω F{x(t)} =` BOXED (green): `jω X(jω)`
  Second Derivative: `F{ (d²/dt²) x(t) } = F{ (jω)² x(t) } = (jω)² X(jω)` and so on. ∎
- (6) Time Scaling: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `x(at) --F--> (1/|a|) X(j(ω/a))`
  Proof: `F{x(at)} = ∫ x(at) e^{-jωt} dt`; `Let τ = at, dτ/dt = a. Then F{x(at)} = ∫ x(τ) e^{-jω(τ/a)} dτ/a`
  - If `a > 0`: `F{x(at)} = (1/a) ∫_{-∞}^{∞} x(τ) e^{-j(ω/a)τ} dτ`
  - If `a < 0`: `F{x(at)} = ((-1)/a) ∫_{∞}^{-∞} x(τ) e^{-j(ω/a)τ} dτ`   (the `(-1)` circled in blue)
  both under-braced `= X(j(ω/a))`, giving BOXED (green): `(1/|a|) X(j(ω/a))` ∎
- Example: `x(t) = sin(2πt)/(πt)`; `X(jω) = { 1, |ω| < 2π ; 0, o.w. }`
  `F{y(t)} = F{x(0.5t)} = (1/0.5) X(j(ω/0.5)) = 2 X(j2ω) =` BOXED (blue): `{ 2, |2ω| < 2π ; 0, o.w. }`  (red annotation over the condition: `|ω| < π`)
  `F{z(t)} = F{x(2t)} = (1/2) X(j(ω/2)) =` BOXED (blue): `{ 0.5, |0.5ω| < 2π ; 0, o.w. }`  (red annotation: `|ω| < 4π`)

**Examples**
- **Example (tagged)**: "Let `x(t) = sin(2πt)/(πt)`. Determine and plot the Fourier Transforms of `y(t) = x(0.5t)` and `z(t) = x(2t)`."
  - Method: quote `X(jω)` as the ideal rectangle; apply the time-scaling property with `a = 0.5` and `a = 2`.
  - Final answers: `Y(jω) = { 2, |2ω| < 2π ; 0 o.w. }` i.e. height 2 for `|ω| < π`; `Z(jω) = { 0.5, |0.5ω| < 2π ; 0 o.w. }` i.e. height 0.5 for `|ω| < 4π`.

**Homework**
- None on this page.

**Figures** (all MATLAB, 2×3 grid)
1. `y(t) = x(0.5t)` vs `t`, continuous, t ∈ [-4,4] (ticks -4,-2,0,2,4), y ∈ [0,2] (ticks 0,0.5,1,1.5,2): broad sinc peaking at 2.
2. `x(t) = sin(2πt)/(πt)` vs `t`, same axes, y ∈ [0,2]: sinc peaking at 2.
3. `z(t) = x(2t)` vs `t`, same axes, y ∈ [0,2]: narrow sinc peaking at 2.
4. `Y(jω)` vs `ω`, ω ∈ [-6π, 6π] (ticks -6π,-4π,-2π,0,2π,4π,6π), y ∈ [0,2] (ticks 0,0.5,1,1.5,2): rectangle of height 2, narrow (edges near ±π).
5. `X(jω)` vs `ω`, same ω axis, y ∈ [0,1] (ticks 0,0.2,0.4,0.6,0.8,1): rectangle of height 1 (edges near ±2π).
6. `Z(jω)` vs `ω`, same ω axis, y ∈ [0,0.5] (ticks 0,0.1,…,0.5): rectangle of height 0.5 (edges near ±4π).

**Ambiguities**
- **A53-01** (significant, mathematically suspect): The differentiation proof writes `(d/dt) x(t) = (jω) (1/2π) ∫ X(jω) e^{jωt} dω` and under-braces the integral as `= x(t)`, which yields `(d/dt)x(t) = jω x(t)` — false for general `x(t)` (`ω` is an integration variable, not a constant). The subsequent line `F{(d/dt)x(t)} = F{(jω)x(t)} = jω F{x(t)}` repeats the same error. The final result `jω X(jω)` is correct; the derivation as written is not.
- **A53-02**: In the real-and-odd derivation, the conclusion is written `Re{X(-jω)} = -Re{X(-jω)} = 0`; the middle equality is an equation, not a value, so the chained `= 0` is an abuse of notation.
- **A53-03**: The `a < 0` branch of the time-scaling proof shows `((-1)/a) ∫_{∞}^{-∞}` — the `(-1)` is circled in blue as if flagged by the author, and the reversed limits plus the `(-1)` together produce `(1/|a|)` only if one of them is absorbed. As written, `((-1)/a)∫_{∞}^{-∞} = (1/a)∫_{-∞}^{∞}`, i.e. `1/a` not `1/|a|` — the sign bookkeeping is incomplete for `a<0`.
- **A53-04**: The example's boxed answers state the support as `|2ω| < 2π` and `|0.5ω| < 2π` (un-simplified), with the simplified forms `|ω|<π` and `|ω|<4π` written only as small red overlays. The boxed content and the red annotation disagree in form (not in value).
- **A53-05**: The time-scaling property box writes `X(j ω/a)` where the `j` and the fraction are typeset as `X(j (ω/a))`; in the `a<0` branch it is written `X(j(w/a))` with a lowercase `w`. Symbol drift between `ω` and `w` on the same page.
- **A53-06**: The FT of the example is given as `{1, |ω| < 2π}` here, whereas p.52 gave the same signal's transform as `{1, |ω| ≤ 2π}`. Strict vs non-strict inequality differs between pages for the identical signal.

## p.54 — Property (7) Duality; Example (rect ↔ sinc dual); Homework: dual of the sinc [Week9—Lec2]
Red box: **Week9—Lec2**.

**Concepts**
- Property (7) Duality (marked with a red exclamation burst).
- Verification of duality by computing the same transform two ways (★ vs ★★).
- Even-function fact `|-ω| = |ω|` used to simplify the dual result (purple cloud with a `y = |x|` sketch).
- "They are similar, but not quite identical" — comparing a signal/transform pair with its dual.

**Equations** (CT)
- (7) Duality: If `x(t) --F--> X(jω)`, then HIGHLIGHTED (boxed): `X(t) --F--> 2π x(-jω)`  with a blue annotation under `x(-jω)`: `= x(-ω)`
- Proof: `x(t) = (1/2π) ∫ X(ω) e^{jωt} dω → x(-t) = (1/2π) ∫ X(ω) e^{jω(-t)} dω`  : "Replace t by -t"
  "Multiply both sides by 2π": `2π x(-t) = ∫ X(ω) e^{jω(-t)} dω → 2π x(-ω) = ∫ X(t) e^{-jωt} dt`  : "Replace t by ω and ω by t"
  BOXED (green): `Hence, F{X(t)} = 2π x(-ω)` ∎
- Example: `x_1(t) = { 1, |t| < T ; 0, o.w. }`; asked for `x_2(t) =` BOXED: `2 sin(tT)/t` ★
  BOXED (blue): `X_1(jω) = 2 sin(ωT)/ω`
  By duality: `F{x_2(t)} = 2π x_1(-ω) =` HIGHLIGHTED YELLOW + boxed blue: `{ 2π, |-ω| < T ; 0, o.w. }`  (the `|-ω|` annotated in blue as `|ω|`; purple cloud with sketch of `y = |x|` labelled "even")
  Verification via inverse FT: `x_2(t) = (1/2π) ∫_{-T}^{T} 2π e^{+jωt} dω = (1/(jt)) [ e^{jTt} - e^{-jTt} ] =` BOXED (blue): `2 sin(Tt)/t` ★★  (under-brace: `= 2j sin(Tt)`)
  Green cloud: "Both ★ and ★★ are equal to each other."
- Homework: `x_1(t) = sin(Wt)/(πt)`; asked for `x_2(t) = { 1, |t| ≤ W ; 0, o.w. }`
  `X_1(jω) = { 1, |ω| ≤ W ; 0, o.w. }`
  By duality: `F{x_2(t)} = 2π x_1(-ω) = 2π · sin(-Wω)/(-πω) =` HIGHLIGHTED YELLOW + boxed blue: `2 sin(Wω)/ω` ★  (blue annotation over the numerator: `-sin(Wω)`)
  By definition of FT: `F{x_2(t)} = ∫_{-W}^{W} 1 · e^{-jωt} dt = (-1/(jω)) [ e^{-jωW} - e^{+jωW} ] = (1/(jω)) [ e^{jωW} - e^{-jωW} ] =` BOXED (blue): `2 sin(Wω)/ω` ★★  (under-brace: `= 2j sin(ωW)`)

**Examples**
1. **Example (tagged, Week9—Lec2)**: "Let `x_1(t) = { 1, |t| < T ; 0, o.w. }`. Determine and plot the Fourier Transform of `x_2(t) = 2 sin(tT)/t`."
   - Method: quote `X_1(jω) = 2sin(ωT)/ω`, apply duality, then cross-check by direct inverse FT.
   - Final answer: `F{x_2(t)} = { 2π, |ω| < T ; 0, o.w. }`; verified by `x_2(t) = 2 sin(Tt)/t`.
   - Illustrated for `T = 1`.
2. **Homework solution (worked on the page, marked "Sol")** — see Homework below.

**Homework**
- Tagged "Homework": "Let `x_1(t) = sin(Wt)/(πt)`. Determine and plot the Fourier Transform of `x_2(t) = { 1, |t| ≤ W ; 0, o.w. }`."
  - Solved on this page two ways (duality ★ and direct FT ★★), both giving `2 sin(Wω)/ω`. Illustrated for `W = π`.

**Figures**
1. (Purple cloud, hand-drawn) small sketch of `y = |x|` on `x`–`y` axes, labelled "even", used to justify `|-ω| = |ω|`.
2. (MATLAB) 2×2 grid for the example, with a red "DUAL" X-shaped double arrow across the diagonal and a purple caption "They are similar, but not quite identical."
   - `x_1(t)` vs `t`, t ∈ [-2,2] (ticks -2,-1,0,1,2), y ∈ [0,1] (ticks 0,0.5,1), title `T = 1`: rectangle on `[-1,1]`.
   - `X_1(jω)` vs `ω`, ω ∈ [-3π, 3π] (ticks -3π,-2π,-π,0,π,2π,3π), y ∈ [0,2] (ticks 0,1,2), title `T = 1`: sinc peaking at 2.
   - `x_2(t)` vs `t`, t ∈ [-3π, 3π], y ∈ [0,2] (ticks 0,1,2): sinc peaking at 2.
   - `X_2(jω)` vs `ω`, ω ∈ [-2,2] (ticks -2,-1,0,1,2), y-axis ticks `0, π, 2π`: rectangle of height `2π` on `[-1,1]`.
3. (MATLAB) 2×2 grid for the homework, with a red "DUAL" X-shaped double arrow.
   - `x_1(t)` vs `t`, t ∈ [-4,4] (integer ticks), y ∈ [0,1] (ticks 0, 0.5, 1), title `W = π`: sinc peaking at 1.
   - `X_1(jω)` vs `ω`, ω ∈ [-3π, 3π], y ∈ [0,1] (ticks 0, 0.5, 1), title `W = π`: rectangle of height 1 on about `[-π, π]`.
   - `x_2(t)` vs `t`, t ∈ [-3π, 3π], y ∈ [0,1] (ticks 0, 0.5, 1): rectangle of height 1 on about `[-π, π]`.
   - `X_2(jω)` vs `ω`, ω ∈ [-4,4] (integer ticks), y-axis ticks `0, π, 2π`: sinc peaking at `2π`, with the peak circled in red and a red annotation "L'Hopital".

**Ambiguities**
- **A54-01**: The duality statement is written `X(t) --F--> 2π x(-jω)` with a blue correction underneath reading `= x(-ω)`. As printed the right-hand side has `x` evaluated at `-jω`, which is wrong (the argument of the time-domain function should be `-ω`). The blue annotation is the fix; the boxed statement is not corrected.
- **A54-02**: The proof's first line writes the inverse FT as `x(t) = (1/2π) ∫ X(ω) e^{jωt} dω` using `X(ω)` — the argument convention drops the `j` used everywhere else on the page (`X(jω)`).
- **A54-03**: The example's target signal is written `2 sin(tT)/t` in the problem statement and `2 sin(Tt)/t` in the verification. Same quantity, argument order swapped; the handwritten `t` is easily confused with `+` throughout this page (e.g. `2 sin(+T)/+`).
- **A54-04**: The boxed duality result `{ 2π, |-ω| < T ; 0, o.w. }` keeps the un-simplified `|-ω|`. The purple cloud justifies `|-ω| = |ω|` but the box is never rewritten.
- **A54-05**: In the verification integral `x_2(t) = (1/2π) ∫_{-T}^{T} 2π e^{+jωt} dω`, the lower limit is written `-7` (a `T` rendered as a digit 7 at 160 dpi). Reading is `-T`. Low-confidence glyph.
- **A54-06**: The homework uses `ω` and `w` interchangeably within the same boxed expression (`2 sin(Ww)/w` in one box, `2 sin(Wω)/ω` elsewhere).
- **A54-07**: The homework's `x_2(t)` uses `|t| ≤ W` (non-strict) while the example's `x_1(t)` uses `|t| < T` (strict). Endpoint convention differs between the two problems on the same page.
- **A54-08**: In the homework, the duality step gives `2π · sin(-Wω)/(-πω)`; the blue annotation writes `-sin(Wω)` over the numerator but the denominator `-πω` sign is not annotated. The two minus signs cancel, but the intermediate is displayed without the cancellation.

## p.55 — Example: δ(t)/constant dual pair; (8) Parseval's Relation; Example: energy via Parseval
No red week/lecture box on this page (continues Week9—Lec2).

**Concepts**
- Dual pair: `δ(t) ↔ 1` and `1 ↔ 2πδ(ω)`.
- Property (8) **Parseval's Relation** (marked with a red exclamation burst).
- TOTAL ENERGY IN `x(t)` (time side) vs ENERGY DENSITY SPECTRUM (frequency side).
- `|X(jω)|²/(2π)` = energy per unit frequency.
- Energy computation is easier in the frequency domain when the spectrum is piecewise-constant.

**Equations** (CT)
- `x_1(t) = δ(t) --F--> X_1(jω) = 1`
- `x_2(t) = 1 --F--> X_2(jω) = 2π δ(-ω) = 2π δ(ω)`
- (8) Parseval's Relation: If `x(t) --F--> X(jω)`, then HIGHLIGHTED YELLOW + boxed blue:
  `∫_{-∞}^{∞} |x(t)|² dt = (1/2π) ∫_{-∞}^{∞} |X(jω)|² dω`
  (blue braces: left = "TOTAL ENERGY IN `x(t)`"; right = "ENERGY DENSITY SPECTRUM")
  (blue side note: `|X(jω)|² / 2π` : energy per unit frequency)
- Proof: `∫_{-∞}^{∞} |x(t)|² dt = ∫_{-∞}^{∞} x(t) x*(t) dt = ∫_{-∞}^{∞} x(t) [ (1/2π) ∫_{-∞}^{∞} X*(-jω) e^{jωt} dω ] dt`
  (under-brace: `F^{-1}{X*(-jω)} = x*(t)`)
  `= (1/2π) ∫_{-∞}^{∞} x(t) [ ∫_{-∞}^{∞} X*(jω') e^{j(-ω')t} dω' ] dt`  : "Replace `-ω` by `ω'`"
  `= (1/2π) ∫_{-∞}^{∞} X*(jω') [ ∫_{-∞}^{∞} x(t) e^{-jω't} dt ] dω'`  (inner under-braced `= X(jω)`)
  `= (1/2π) ∫_{-∞}^{∞} X*(jω') X(jω') dω'`  (under-braced `|X(jω')|²`) `=` BOXED: `(1/2π) ∫ |X(jω)|² dω`  : "Replace `ω'` by `ω`." ∎
- Example: `x(t) = sin(2πt)/(πt) + sin(4πt)/(πt)`
  `E_x = ∫_{-∞}^{∞} |x(t)|² dt`  (annotated with a grimacing-face emoji: hard in time domain)
  `x_1(t) = sin(2πt)/(πt)`, where `X_1(jω) = { 1, |ω| < 2π ; 0, o.w. }`
  `x_2(t) = sin(4πt)/(πt)`, where `X_1(jω) = { 1, |ω| < 4π ; 0, o.w. }`  ← as written; see A55-02
  `x(t) = x_1(t) + x_2(t) --F--> X(jω) = X_1(jω) + X_2(jω)`
  `E_x = (1/2π) ∫_{-∞}^{∞} |X_3(jω)|² dω = (2/2π) [ ∫_{-4π}^{-2π} (1)² dω + ∫_{-2π}^{0} 2² dω ] = (1/π) [ 2π + 4·2π ] =` BOXED: `10`

**Examples**
1. **Example (tagged, "Sol")**: dual pair demonstration.
   - Given: `x_1(t) = δ(t)` and `x_2(t) = 1`.
   - Final answers: `X_1(jω) = 1`; `X_2(jω) = 2πδ(-ω) = 2πδ(ω)`.
2. **Example (tagged)**: "Calculate the energy of `x(t) = sin(2πt)/(πt) + sin(4πt)/(πt)` using Parseval's Relation."
   - Given data: the two sinc components and their rectangular spectra of half-widths `2π` and `4π`, both of height 1.
   - Asked: the energy `E_x`.
   - Method: form `X(jω) = X_1 + X_2` (a two-level staircase: height 2 on `|ω| < 2π`, height 1 on `2π < |ω| < 4π`), then apply Parseval, exploiting even symmetry (factor 2).
   - Final answer (boxed): `E_x = 10`.
   - Green cloud: "Energy calculation is easier in frequency domain than in the frequency domain." ← as written; see A55-04

**Homework**
- None on this page.

**Figures**
1. (MATLAB) 2×2 grid with a red "DUAL" X-shaped double arrow:
   - `x_1(t) = δ(t)` vs `t`, t ∈ [-2,2] (integer ticks), y ∈ [0,1]: single spike at t=0.
   - `X_1(jω) = 1` vs `ω`, ω ∈ [-2π, 2π] (ticks -2π,-π,0,π,2π), y ∈ [0,2] (ticks 0,1,2): flat line at 1.
   - `x_2(t) = 1` vs `t`, t ∈ [-2,2], y ∈ [0,2] (ticks 0,1,2): flat line at 1.
   - `X_2(jω) = 2πδ(ω)` vs `ω`, ω ∈ [-2π, 2π], y-axis tick `2π`: single spike at ω=0.
2. (MATLAB) 3×2 grid for the Parseval example, with red arrows linking the time-domain main-lobe peaks to the corresponding spectral band edges:
   - `x_1(t) = sin(2πt)/(πt)` vs `t`, t ∈ [-4,4] (ticks -4,-2,0,2,4), y ∈ [0,2] (ticks 0,1,2): sinc peaking at 2, peak circled red.
   - `X_1(jω)` vs `ω`, ω ∈ [-6π, 6π] (ticks -6π,-4π,-2π,0,2π,4π,6π), y ∈ [0,1] (ticks 0,0.5,1): rectangle of height 1 on `[-2π, 2π]`; the `-2π` edge circled red.
   - `x_2(t) = sin(4πt)/(πt)` vs `t`, same t axis, y ∈ [0,4] (ticks 0,2,4): sinc peaking at 4, peak circled red.
   - `X_2(jω)` vs `ω`, same ω axis, y ∈ [0,1] (ticks 0,0.5,1): rectangle of height 1 on `[-4π, 4π]`; the `-4π` edge circled red.
   - `x_3(t) = x_1(t) + x_2(t)` vs `t`, t ∈ [-4,4] (integer ticks), y ∈ [0,6] (ticks 0,2,4,6): sinc-sum peaking near 6.
   - `X_3(jω)` vs `ω`, same ω axis, y ∈ [0,2] (ticks 0,1,2): two-level staircase, height 2 on `[-2π, 2π]` and height 1 on `2π < |ω| < 4π`.

**Ambiguities**
- **A55-01**: In the proof, the substitution is announced as "Replace `-ω` by `ω'`" but the exponent is then written `e^{j(-ω')t}`, i.e. the primed variable already carries the minus. The direction of the substitution is ambiguous as displayed; the final result is standard.
- **A55-02** (significant): The second component's spectrum is labelled `X_1(jω) = { 1, |ω| < 4π ; 0 o.w. }` — the subscript should be `2`. As written, `X_1(jω)` is defined twice with different supports (`2π` and `4π`).
- **A55-03**: The energy integral is written `E_x = (1/2π) ∫ |X_3(jω)|² dω` using subscript `3`, whereas the preceding line defines the sum as `X(jω) = X_1(jω) + X_2(jω)` with no subscript. `X_3` appears only in the figure titles.
- **A55-04**: The green cloud reads "Energy calculation is easier in frequency domain than in the frequency domain." The second occurrence should evidently be "time domain". Transcribed verbatim.
- **A55-05**: The Parseval evaluation `(2/2π)[∫_{-4π}^{-2π}(1)² dω + ∫_{-2π}^{0} 2² dω]` uses the factor 2 for even symmetry and integrates only over the negative half-axis, but the second integral's upper limit `0` is written as a superscript `0` above the integral sign in a position that overlaps the `∫` glyph; reading is `0`. Also, the `(1)²` and `2²` are the *squared* staircase heights while the boxed statement of Parseval uses `|X(jω)|²` — consistent, but the factor-of-2 symmetry argument is never stated in words.
- **A55-06**: Arithmetic check: `(1/π)[2π + 4·2π] = (1/π)(10π) = 10`. Consistent with the boxed answer. However the intermediate `(2/2π)` is simplified to `(1/π)` in the same step where the integrals are evaluated, so the two simplifications are merged and hard to verify at a glance.
- **A55-07**: `X_2(jω) = 2πδ(-ω) = 2πδ(ω)` uses `δ(-ω) = δ(ω)` (even symmetry of the impulse) without stating it.
