# Source Inventory — pp. 56–71

Source: `Lecture Notes.pdf` rendered at 160 dpi, `/tmp/signals-and-systems/pages/p-NN.png`.
Handwritten imaginary unit `J` is recorded as `j` throughout. Equations transcribed as written, not corrected.
Ambiguity IDs are page-scoped: `A<page>-<nn>`.

---

## p.56 — [Homework solution: Parseval energy] + "(9) The Convolution Property" + Example: Revisiting the time-shift property
*(no red week/lecture box on this page)*

**Concepts**
- Energy computed in time domain vs. frequency domain via Parseval's relation; closing remark: "In this example, computing the energy in time domain is easier than computing the energy in the frequency domain."
- Property (9): The Convolution Property (CT). Slogan in blue: "CONVOLUTION IN TIME DOMAIN ≡ MULTIPLICATION IN FREQUENCY DOMAIN".
- Proof technique: recognize the inner integral as the time-shift property applied to h(t−τ).
- Example concept: a pure delay is an LTI system with h(t)=δ(t−t0), H(jw)=e^{-jwt0}.

**Equations** (CT throughout)
- `E_x = ∫_{-∞}^{∞} |x(t)|^2 dt = ∫_{0}^{∞} e^{-2at} dt = -1/(2a) [e^{-2at}]_{0}^{∞} = (-1/(2a))[e^{-∞} - e^{-0}] = 1/(2a)`  (boxed, tagged ★; `e^{-∞}` annotated `=0`)
- annotation: `Since x(t) is real, |x(t)| = x(t)`
- `X(jw) = 1/(a+jw)` ; `|X(jw)| = 1/sqrt(a^2 + w^2)`, where `-∞ < w < ∞`
- `E_x = (1/2π) ∫_{-∞}^{∞} |X(jw)|^2 dw = (1/2π) ∫_{-∞}^{∞} 1/(a^2+w^2) dw`
- `∫_{-∞}^{∞} 1/(a^2+w^2) dw = ∫_{-∞}^{∞} (1/a^2)/((1/a^2)(a^2+w^2)) dw = (1/a^2) ∫_{-∞}^{∞} 1/(1+(w/a)^2) dw = (1/a^2) ∫_{-∞}^{∞} (1/(1+u^2)) a du`, with `u = w/a`, `du/dw = 1/a`, `dw = a du`
- HINT box (purple): `∫ 1/(1+x^2) dx = tan^{-1}(x)`
- `= (1/a) ∫_{-∞}^{∞} 1/(1+u^2) du = (1/a) tan^{-1}(u) = (1/a) tan^{-1}(w/a) |_{-∞}^{∞} = (1/a)[tan^{-1}(∞) - tan^{-1}(-∞)] = (1/a) π`  (annotated `π/2` and `-π/2`)
- `E_x = (1/2π) · (1/a) · π = 1/(2a)`  (boxed, tagged ★★); green box: "Both ★ and ★★ are equal to each other."
- Property (9), yellow-highlighted box: `y(t) = x(t) * h(t)  --F-->  Y(jw) = X(jw) H(jw)`
- Proof: `y(t) = ∫_{-∞}^{∞} x(τ) h(t-τ) dτ`
  `F{y(t)} = Y(jw) = ∫_{-∞}^{∞} [∫_{-∞}^{∞} x(τ) h(t-τ) dτ] e^{-jwt} dt = ∫_{-∞}^{∞} x(τ) [∫_{-∞}^{∞} h(t-τ) e^{-jwt} dt] dτ`
  inner underbrace: `H(jw) e^{-jwτ}` : Time-Shift Property
  `= ∫_{-∞}^{∞} x(τ) e^{-jwτ} H(jw) dτ = H(jw) ∫_{-∞}^{∞} x(τ) e^{-jwτ} dτ = X(jw) H(jw)` (boxed; underbrace `X(jw)`)
- Example block diagrams: `x(t) → [h(t)=δ(t-t0)] → y(t) = x(t-t0)` : Time-Domain
  `X(jw) → [H(jw)=e^{-jwt0}] → Y(jw) = X(jw) e^{-jwt0}` : TIME-SHIFT PROPERTY (underbrace `H(jw)`)

**Examples**
1. *Example — Revisiting the time-shift property.* Given: LTI system with impulse response `h(t)=δ(t-t0)`. Asked: illustrate the time-shift property as a convolution. Method: apply the convolution property to the delay system. Answer: `y(t)=x(t-t0)` in time domain; `Y(jw) = X(jw) e^{-jwt0}` in frequency domain.

**Homework**
- *Homework (green tag, fully solved on this page):* "Let `x(t) = e^{-at} u(t)` for `a > 0`. Determine `X(jw)` and calculate the energy of `x(t)` and `X(jw)` using Parseval's relation." Final answers: `X(jw)=1/(a+jw)`; `E_x = 1/(2a)` from both domains.

**Figures**
- No plots. Two block diagrams (time-domain and frequency-domain cascade for the delay system). Decorations: red star ★ / double star ★★ markers, purple HINT box, green "Both ★ and ★★ are equal to each other." box.

**Ambiguities**
- **A56-01**: Homework prompt says "calculate the energy of x(t) **and X(jw)**"; energy is a property of the signal — "energy of X(jw)" is loose phrasing for the frequency-domain evaluation.
- **A56-02**: Blue annotation "Since x(t) is real, |x(t)| = x(t)" is false in general (requires x(t) ≥ 0); it happens to hold for `e^{-at}u(t)`, but the stated justification (realness) is wrong.
- **A56-03**: The HINT integral is written as an indefinite integral without `+C` and is then applied as a definite integral over `(-∞, ∞)`.

---

## p.57 — Example: LTI system with two one-sided exponentials [Week10—Lec1]

**Concepts**
- Convolution property used to solve an LTI system in the frequency domain.
- Partial fractions / residue theorem (Heaviside cover-up method) for rational `Y(jw)`.
- MATLAB workflow: `fourier(·)`, multiply, `ifourier(·)`.

**Equations** (CT)
- `X(jw) = 1/(a+jw)` ; `H(jw) = 1/(b+jw)`
- `Y(jw) = X(jw) H(jw) = 1/((a+jw)(b+jw)) = A/(a+jw) + B/(b+jw)`
- Yellow-highlighted cover-up box: `F(x) = p(x) / ∏_{i=1}^{n} (x-λ_i) = Σ_{i=1}^{n} r_i/(x-λ_i)`, with `r_i = (x-λ_i) F(x)|_{x=λ_i}`, `∀ i = 1,...,n`  (`r_i` circled, labeled "residue")
- `A = (a+jw) · 1/((a+jw)(b+jw)) |_{jw=-a} = 1/(b-a)` (boxed)
- `B = (b+jw) · 1/((a+jw)(b+jw)) |_{jw=-b} = 1/(a-b)` (boxed)
- `Y(jw) = (1/(b-a))·(1/(a+jw)) + (1/(a-b))·(1/(b+jw)) = (1/(b-a)) [ 1/(a+jw) - 1/(b+jw) ]`
- `y(t) = F^{-1}{Y(jw)} = (1/(b-a)) [ e^{-at} u(t) - e^{-bt} u(t) ]` (boxed), since `F^{-1}{1/(a+jw)} = e^{-at} u(t)`

**Examples**
1. *Example.* Given: `x(t) = e^{-at} u(t)`, `a>0`; system `h(t) = e^{-bt} u(t)`, `b>0`, `where a ≠ b`. Asked: `y(t) = ?`. Method: FT both signals, multiply (convolution property), partial-fraction/residue expansion, inverse FT by inspection. Answer: `y(t) = (1/(b-a)) [ e^{-at}u(t) - e^{-bt}u(t) ]`.

**Homework** — none on this page.

**Figures**
- **MATLAB-generated**, 3×2 grid ("The plots of x(t), h(t), and y(t) as well as their magnitude spectra are given as:"), all continuous curves:
  - `x(t)=e^{-t}u(t)` (row y-label `a = 1`), t ∈ [−2,4], y ticks 0/0.5/1, jump to 1 at t=0 then decay. Right: `|X(jω)|`, ω ∈ [−6π,6π] (ticks −6π,−4π,−2π,0,2π,4π,6π), y 0/0.5/1, peak 1 at ω=0.
  - `h(t)=e^{-2t}u(t)` (y-label `b = 2`), t ∈ [−2,4], y 0/0.5/1. Right: `|H(jω)|`, ω ∈ [−6π,6π], y ticks 0/0.25/0.5, peak 0.5 at ω=0.
  - `y(t)=x(t)*h(t)`, t ∈ [−2,4], y ticks 0/0.05/0.15/0.25, rises from 0 at t=0 to ≈0.25 near t≈0.7 then decays. Right: `|Y(jω)| = |X(jω)H(jω)|`, ω ∈ [−6π,6π], y ticks 0/0.25/0.5, peak 0.5 at ω=0.
- Purple MATLAB recipe (not a plot): ① Use `fourier(·)` to obtain X(jw) and H(jw). ② Multiply X(jw) by H(jw). ③ Take the inverse Fourier Transform X(jw)H(jw) using `ifourier(·)`.

**Ambiguities**
- **A57-01**: Residues are evaluated with the substitution written as `jw = -a` and `jw = -b` (treating the whole symbol `jw` as the variable) rather than `w = ja` / a substitution in a named variable `s`. Consistent within the page but non-standard.
- **A57-02**: In the `y(t)` panel the y-axis tick labels are 0, 0.05, 0.15, 0.25 — non-uniform spacing between the first two ticks.
- **A57-03**: The cover-up box uses `n` both as the number of poles and (implicitly) as the polynomial degree; `p(x)` degree constraints for the expansion to be valid are not stated.

---

## p.58 — Example: ideal-LPF cascade of sincs + Homework (figure-only) + "(10) Multiplication (Modulation) Property"

**Concepts**
- Cascading band-limited signals: multiplication of two ideal rectangles in frequency → narrower rectangle.
- Property (10): Multiplication (Modulation) property. Slogan: "MULTIPLICATION IN TIME DOMAIN ≡ CONVOLUTION IN FREQUENCY DOMAIN". Duality table CONVOLUTION ↔ MULTIPLICATION.
- Ideal low-pass filter; "blocked spectral components".

**Equations** (CT)
- `X(jw) = { 2 , |w| ≤ 4π ; 0 , 0, o.w. }`  *(transcribed literally, including the doubled 0)*
- `H(jw) = { 3 , |w| ≤ 2π ; 0 , o.w. }`
- `Y(jw) = X(jw) H(jw) = { 6 , |w| ≤ 2π ; 0 , o.w. }` (tagged ★)
- `y(t) = F^{-1}{Y(jw)} = 6 sin(2πt)/(πt)` (boxed, tagged ★)
- Property (10), yellow-highlighted box:
  `x(t)·y(t) --F--> (1/2π)[ X(jw) * Y(jw) ] = (1/2π) ∫_{-∞}^{∞} X(jθ) Y(j(w-θ)) dθ`
- Table (2 columns × 2 rows) with red "DUAL" crossed arrows: TIME DOMAIN / FREQUENCY DOMAIN — CONVOLUTION / MULTIPLICATION ; MULTIPLICATION / CONVOLUTION.

**Examples**
1. *Example.* Given: `x(t) = 2 sin(4πt)/(πt)` into system `h(t) = 3 sin(2πt)/(πt)`. Asked: `y(t) = ?`. Method: rectangle × rectangle in frequency (convolution property), then inverse FT by inspection. Answer: `y(t) = 6 sin(2πt)/(πt)`.

**Homework**
- *Homework (green tag)*: **no written problem statement** — the block consists only of two MATLAB figure groups (see Figures). Implied task: verify/interpret the filtering results shown.

**Figures**
- **MATLAB-generated**, Example, 3×2, continuous curves:
  - `x(t)=2sin(4πt)/(πt)`, t ∈ [−4,4], y ticks 0/4/8, peak 8 at t=0. Right: `X(jω)`, ω ∈ [−6π,6π], y 0/1/2, rectangle of amplitude 2 on [−4π,4π].
  - `h(t)=3sin(2πt)/(πt)`, t axis ticks −2,0,2,4, y 0/3/6, peak 6 at t=0. Right: `H(jω)`, ω ∈ [−6π,6π], y 0/1/2/3, rectangle of amplitude 3 on [−2π,2π].
  - `y(t)=x(t)*h(t)=6sin(2πt)/(πt)`, t ∈ [−4,4], y 0/4/8/12, peak 12 at t=0. Right: `Y(jω)=X(jω)H(jω)`, ω ∈ [−6π,6π], y 0/2/4/6, rectangle of amplitude 6 on [−2π,2π].
- **MATLAB-generated**, Homework left group, 3×2:
  - `x(t)=e^{-2t}u(t)`, t ∈ [−4,4], y 0/0.5/1. Right: `|X(jω)|`, ω ∈ [−4π,4π], y 0/0.25/0.5, peak 0.5 at ω=0.
  - `h(t)=sin(2πt)/(πt)`, t ∈ [−4,4], y 0/1/2, peak 2. Right: `|H(jω)|`, ω ∈ [−6π,6π], y 0/0.5/1, rectangle amplitude 1 on [−2π,2π].
  - `|y(t)|=|x(t)*h(t)|`, t ∈ [−4,4], y 0/0.3/0.6. Right: `|Y(jω)|=|X(jω)H(jω)|`, ω ∈ [−6π,6π], y 0/0.25/0.5, support limited to [−2π,2π]; two red rectangles drawn over the two out-of-band regions annotated in red "Blocked spectral components".
- **MATLAB-generated**, Homework right group, 3×2:
  - `x(t)=cos(πt)+cos(2πt)+cos(4πt)`, t ∈ [−4,4], y −1/0/1/2/3. Right: `X(jω)`, ω ∈ [−6π,6π], y-axis top labeled `π`, six impulse lines at ±π, ±2π, ±4π of height π.
  - `h(t)=sin(3πt)/(πt)`, t ∈ [−4,4], y 0/1/2/3, peak 3. Right: `H(jω)`, ω ticks −6π,−3π,0,3π,6π, y 0/0.5/1, rectangle amplitude 1 on [−3π,3π]; red annotation "Ideal Low-pass Filter".
  - `y(t)=x(t)*h(t)=cos(πt)+cos(2πt)`, t ∈ [−4,4], y −1/0/1/2. Right: `Y(jω)=X(jω)H(jω)`, ω ∈ [−6π,6π], y top `π`, impulses at ±π and ±2π only; red ✗ marks at ±4π with red note "cos(4πt) is blocked!".

**Ambiguities**
- **A58-01**: `X(jw)` piecewise definition is written `0 , 0, o.w.` — a stray extra `0` in the otherwise-branch (same pattern recurs on pp. 60, 61).
- **A58-02**: The Homework block has no written question text at all; only MATLAB panels. What the student is asked to do is not stated on the page.
- **A58-03**: In the Example figure, the `h(t)` panel's t-axis spans −2…4 while the `x(t)` and `y(t)` panels span −4…4 — inconsistent axis ranges across a comparison grid.

---

## p.59 — Example: AMPLITUDE MODULATION / DOUBLE SIDEBAND SUPPRESSED CARRIER (DSB-SC) + Remark + Alternative Way

**Concepts**
- Amplitude modulation as multiplication in time = convolution in frequency; DSB-SC.
- Sifting property of δ under convolution; convolution with a shifted impulse = frequency shift.
- Alternative derivation via the product-to-sum trigonometric identity.

**Equations** (CT)
- `F{x(t)} = X(jw) = π[ δ(w-π) + δ(w+π) ]`
- `F{y(t)} = Y(jw) = π[ δ(w-4π) + δ(w+4π) ]`
- `F{z(t)} = Z(jw) = (1/2π)[ X(jw) * Y(jw) ]`
- `Z(jw) = (π/2π)[ X(jw) * [δ(w-4π) + δ(w+4π)] ] = (1/2)[ X(jw)*δ(w-4π) + X(jw)*δ(w+4π) ]` (terms labeled (1) and (2))
- (1) `X(jw) * δ(w-4π) = ∫_{-∞}^{∞} X(jθ) δ((w-θ)-4π) dθ = ∫ X(jθ) δ((w-4π)-θ) dθ = X(j(w-4π))` (boxed) — ": Sifting Property"
- (2) `X(jw) * δ(w+4π) = ∫_{-∞}^{∞} X(jθ) δ((w-θ)+4π) dθ = ∫ X(jθ) δ((w+4π)-θ) dθ = X(j(w+4π))` (boxed) — ": Sifting Property"
- `Z(jw) = (1/2) X(j(w+4π)) + (1/2) X(j(w-4π))` (boxed)
- Remark (yellow-highlighted): `X(jw) * δ(w - w0) = X(j(w - w0))`
- Alternative Way: `z(t) = cos(πt)·cos(4πt) = (1/2)cos(4πt + πt) + (1/2)cos(4πt - πt) = (1/2)cos(5πt) + (1/2)cos(3πt)`
- `F{(1/2)cos(5πt)} = (π/2)δ(w-5π) + (π/2)δ(w+5π)` (tagged ✳)
- `F{(1/2)cos(3πt)} = (π/2)δ(w-3π) + (π/2)δ(w+3π)` (tagged ✳)
- `Z(jw) = (π/2)δ(w+5π) + (π/2)δ(w+3π) + (π/2)δ(w-3π) + (π/2)δ(w-5π)` (boxed)

**Examples**
1. *Example — Amplitude Modulation (DSB-SC).* Given: `x(t)=cos(πt)`, `y(t)=cos(4πt)`. Asked: determine **and plot** the Fourier Transform of `z(t)=x(t)·y(t)`. Method (main): multiplication property + sifting. Method (alternative): product-to-sum identity then table transform. Answers: `Z(jw) = (1/2)X(j(w+4π)) + (1/2)X(j(w-4π))` = `(π/2)δ(w+5π) + (π/2)δ(w+3π) + (π/2)δ(w-3π) + (π/2)δ(w-5π)`.

**Homework** — none on this page.

**Figures**
- **MATLAB-generated**, 3×2:
  - `x(t)=cos(πt)`, t ∈ [−4,4], y −1/0/1, continuous. Right: `X(jω)`, ω ∈ [−6π,6π], y top `π`, two impulses at ±π of height π.
  - `y(t)=cos(4πt)`, t ∈ [−4,4], y −1/0/1, continuous. Right: `Y(jω)`, ω ∈ [−6π,6π], y top `π`, two impulses at ±4π of height π.
  - `z(t)=x(t)y(t)`, t ∈ [−4,4], y −1/0/1, continuous (beat pattern). Right: `Z(jω) = (1/2π)[X(jω)*Y(jω)]`, ω ∈ [−6π,6π], y top `π/2`, four impulses; two red ellipses annotate the right pair as `(1/2)X(j(w-4π))` and the left pair as `(1/2)X(j(w+4π))`.
- **Hand-drawn** summary plot at bottom: `Z(jω)` vs ω, y-axis 0…`π/2`, ω ticks −6π,−5π,−4π,−3π,−2π,−π,0,π,2π,3π,4π,5π,6π; four stems of height π/2 at −5π, −3π, +3π, +5π; red arrows label them `(π/2)δ(w+5π)`, `(π/2)δ(w+3π)`, `(π/2)δ(w-3π)`, `(π/2)δ(w-5π)`.

**Ambiguities**
- **A59-01**: In both sifting steps the delta argument is silently rewritten from `δ((w-θ)-4π)` to `δ((w-4π)-θ)` (and likewise with `+4π`); this uses evenness of δ, which is never stated.
- **A59-02**: In the MATLAB `Z(jω)` panel the two red ellipses overlap the axes frame; the association of each circled impulse pair with its label `(1/2)X(j(w∓4π))` is readable but not unambiguous at 160 dpi.
- **A59-03**: The MATLAB `Z(jω)` panel's ω axis stops at ±6π so the ±5π impulses sit very close to the frame edge; impulse positions there cannot be read off precisely.

---

## p.60 — Example: sinc × cosine modulation + Homework (solved): 2·sinc·cos modulated again

**Concepts**
- Modulation of a band-limited (sinc) signal by a cosine carrier → two shifted, half-height copies of the spectrum.
- Repeated application of the multiplication property (double modulation) produces a baseband term plus two sidebands.
- MATLAB recipe: compute product in time domain then transform.

**Equations** (CT)
*Example:*
- `F{x(t)} = X(jw) = { 1 , |w| ≤ 2π ; 0 , 0, o.w. }`  *(doubled 0 transcribed as written)*
- `F{y(t)} = Y(jw) = π[ δ(w-4π) + δ(w+4π) ]`
- `F{z(t)} = Z(jw) = (1/2π)[ X(jw) * Y(jw) ]`
- `Z(jw) = (π/2π)[ X(jw) * [δ(w-4π)+δ(w+4π)] ] = (1/2)[ X(jw)*δ(w-4π) + X(jw)*δ(w+4π) ]`
  (blue under-annotations `= X(j(w-4π))` and `= X(j(w+4π))`)
- `Z(jw) = (1/2) X(j(w-4π)) + (1/2) X(j(w+4π))` (boxed)

*Homework:*
- `x1(t) = sin(πt)/(πt)` → `X1(jw) = { 1 , |w| ≤ π ; 0 , 0, o.w. }`
- `x2(t) = cos(2πt)` → `X2(jw) = π δ(w+2π) + π δ(w-2π)`
- `X(jw) = (2/2π)[ X1(jw) * X2(jw) ] = (2π/2π){ X1(jw) * [δ(w-2π) + δ(w+2π)] } = X1(j(w+2π)) + X1(j(w-2π))` (boxed, tagged ★)
- `Z(jw) = (1/2π)[ X(jw) * Y(jw) ] = (π/2π){ X(jw) * [δ(w-2π) + δ(w+2π)] } = (1/2) X(j(w+2π)) + X(j(w-2π))`  *(second term written without a 1/2 — see A60-02; verified at 3× zoom)*
- `= (1/2) X1(j(w+2π+2π)) + (1/2) X1(j(w+2π-2π)) + (1/2) X1(j(w-2π+2π)) + (1/2) X1(j(w-2π-2π))`
- `= (1/2) X1(j(w+4π)) + X1(jw) + (1/2) X1(j(w-4π))` (boxed, tagged ★★)

**Examples**
1. *Example.* Given: `x(t) = sin(2πt)/(πt)`, `y(t) = cos(4πt)`. Asked: determine and plot the FT of `z(t)=x(t)·y(t)`. Method: multiplication property + sifting. Answer: `Z(jw) = (1/2)X(j(w-4π)) + (1/2)X(j(w+4π))` — two rectangles of amplitude 1/2 centered at ±4π.

**Homework**
- *Homework (green tag, solved on the page):* "Let `x(t) = 2 (sin(πt)/(πt)) cos(2πt)` [braces label `= x1(t)` and `= x2(t)`] and `y(t) = cos(2πt)`. Determine and plot the Fourier Transform of `z(t) = x(t)·y(t)`."
  Answers: `X(jw) = X1(j(w+2π)) + X1(j(w-2π))` (★); `Z(jw) = (1/2)X1(j(w+4π)) + X1(jw) + (1/2)X1(j(w-4π))` (★★).

**Figures**
- **MATLAB-generated**, Example, 3×2, continuous curves:
  - `x(t)=sin(2πt)/(πt)`, t ∈ [−4,4], y 0/1/2, peak 2 at t=0. Right: `X(jω)`, ω ∈ [−6π,6π], y 0/0.5/1, rectangle amplitude 1 on [−2π,2π].
  - `y(t)=cos(4πt)`, t ∈ [−4,4], y −1/0/1. Right: `Y(jω)`, ω ∈ [−6π,6π], y top `π`, impulses at ±4π.
  - `z(t)=x(t)y(t)`, t ∈ [−4,4], y −1/0/1/2. Right: `Z(jω)=(1/2π)[X(jω)*Y(jω)]`, ω ∈ [−8π,8π] (ticks −8π,−4π,0,4π,8π), y 0/0.25/0.5, two rectangles of amplitude 0.5 centered at ±4π; red labels `(1/2)X(j(w+4π))` (left) and `(1/2)X(j(w-4π))` (right).
- **MATLAB-generated**, Homework, 3×2:
  - `x(t)=2 (sin(πt)/(πt)) cos(2πt)`, t ∈ [−4,4], y −1/0/1/2. Right: `X(jω)`, ω ∈ [−6π,6π], y 0/0.5/1, two rectangles of amplitude 1 on [−3π,−π] and [π,3π]; red ★.
  - `y(t)=cos(2πt)`, t ∈ [−4,4], y −1/0/1. Right: `Y(jω)`, ω ∈ [−6π,6π], y top `π`, impulses at ±2π.
  - `z(t)=x(t)y(t)`, t ∈ [−4,4], y 0/1/2. Right: `Z(jω)=(1/2π)[X(jω)*Y(jω)]`, ω ∈ [−8π,8π], y 0/0.5/1; centre rectangle of amplitude 1 annotated red `X1(jω)`, plus two rectangles of amplitude 0.5 near ±4π annotated red `(1/2)X1(j(w+4π))` (left) and `(1/2)X1(j(w-4π))` (right); red ★★.
- Purple MATLAB recipe: ① Use `fourier(·)` to obtain X(jw) and H(jw). ② Multiply x(t) by y(t) in time domain (i.e., calculate z(t)=x(t)y(t)). ③ Use `fourier(·)` to obtain Z(jw).

**Ambiguities**
- **A60-01**: MATLAB recipe step ① reads "obtain `X(jw)` and **`H(jw)`**", but no `h(t)`/`H(jw)` exists in this example — apparently carried over from p.57; should read `Y(jw)`.
- **A60-02**: The Homework line `Z(jw) = ... = (1/2) X(j(w+2π)) + X(j(w-2π))` omits the `1/2` on the second term (confirmed at 3× magnification), yet the very next line distributes `1/2` over all four expanded terms. Internally inconsistent.
- **A60-03**: `X(jw)` and `X1(jw)` piecewise definitions again written `0 , 0, o.w.`.

---

## p.61 — Homework ×2: multiplication of two sincs (equal and unequal bandwidths) + "CONVOLUTION OF TWO RECTANGULAR PULSES" box

**Concepts**
- Multiplying two sincs in time = convolving two rectangles in frequency.
- Equal bandwidths → triangle; unequal bandwidths → trapezoid.
- Symbolic convolution integral in MATLAB.

**Equations** (CT)
*Homework 1:*
- `F{x(t)} = X(jw) = { 1 , |w| ≤ 2π ; 0 , 0, o.w. }`
- Since `x(t)=y(t)`, then `X(jw) = Y(jw)`.
- `Z(jw) = (1/2π)[ X(jw) * Y(jw) ]` — brace annotation: "Convolution of two rectangular pulses with equal bandwidths."
- Blue box "CONVOLUTION OF TWO RECTANGULAR PULSES": rect of amplitude `A` on `[-w0, w0]` ✳ rect of amplitude `A` on `[-w0, w0]` = triangle of peak `2A^2 w0` at 0, base from `-2w0` to `2w0` (all on the ω axis).
- MATLAB code box (verbatim): `ZFT(w)=(1/(2*pi))*int(XFT(theta)*YFT(w-theta),theta,-Inf,Inf);` annotated in purple "Symbolic convolution integral"
- `Z(jw) = (1/2π) ∫_{-∞}^{∞} X(jθ) · Y(j(w-θ)) · dθ`

*Homework 2:*
- `F{x(t)} = X(jw) = { 1 , |w| ≤ 2π ; 0 , 0, o.w }`
- `F{y(t)} = Y(jw) = { 1 , |w| ≤ 4π ; 0 , 0, o.w }`
- `Z(jw) = (1/2π)[ X(jw) * Y(jw) ]` — annotation: "Convolution of two rectangular pulses with unequal bandwidths (TRAPEZOID)"

**Examples** — none tagged "Example" on this page.

**Homework**
- *Homework A (solved):* "Let `x(t) = y(t) = sin(2πt)/(πt)`. Determine and plot the Fourier Transform of `z(t) = x(t)·y(t)`." Answer given graphically: triangular `Z(jω)`, peak 2 at ω=0, zero outside `[-4π, 4π]`. No closed form written.
- *Homework B (partially solved):* "Let `x(t) = sin(2πt)/(πt)` and `y(t) = sin(4πt)/(πt)`. Determine and plot the Fourier Transform of `z(t) = x(t)·y(t)`." Answer given graphically only: trapezoidal `Z(jω)`, flat top 2 over `[-2π, 2π]`, sloping to 0 at ±6π.

**Figures**
- **Hand-drawn** blue box: three ω-axis sketches — rect(A, ±w0) ✳ rect(A, ±w0) = triangle with apex labeled `2A^2 w0` (dashed centre line), base `-2w0 … 2w0`.
- **MATLAB-generated**, Homework A, 3×2:
  - `x(t)=sin(2πt)/(πt)`, t ∈ [−4,4], y 0/1/2, peak 2. Right: `X(jω)`, ω ∈ [−6π,6π], y 0/0.5/1, rect amplitude 1 on [−2π,2π].
  - `y(t)=sin(2πt)/(πt)`, same. Right: `Y(jω)`, same.
  - `z(t)=x(t)y(t)`, t ∈ [−2,2], y 0/2/4, peak 4 at t=0. Right: `Z(jω)=(1/2π)[X(jω)*Y(jω)]`, ω ∈ [−6π,6π], y 0/1/2, triangle, apex 2 at ω=0, zero at ±4π.
- **MATLAB-generated**, Homework B, 3×2:
  - `x(t)=sin(2πt)/(πt)`, t ∈ [−4,4], y 0/1/2. Right: `X(jω)`, rect amplitude 1 on [−2π,2π].
  - `y(t)=sin(4πt)/(πt)`, t ∈ [−4,4], y 0/2/4, peak 4. Right: `Y(jω)`, rect amplitude 1 on [−4π,4π].
  - `z(t)=x(t)y(t)`, t ∈ [−2,2], y 0/2/4/6/8, peak 8. Right: `Z(jω)`, ω ∈ [−6π,6π], y 0/1/2, trapezoid: flat at 2 over [−2π,2π], linear to 0 at ±6π.

**Ambiguities**
- **A61-01**: Neither homework's `Z(jw)` is written in closed form; both final answers exist only as plots.
- **A61-02**: The blue "CONVOLUTION OF TWO RECTANGULAR PULSES" box gives the raw convolution peak `2A^2 w0` but omits the `1/2π` factor that the multiplication property requires; the plotted apex (2) is `(1/2π)·2A^2 w0` with A=1, w0=2π. The box and the plots are on different scalings and the box does not say so.
- **A61-03**: Piecewise otherwise-branches again written `0 , 0, o.w.` (three occurrences on this page); one is written `o.w` without the final period.

---

## p.62 — "Summary of the Properties:" (printed Table 3 & Table 4) + "SYSTEM ANALYSIS USING FOURIER TRANSFORM" [Week10—Lec2]

**Concepts**
- Consolidated CTFT property table and CTFT pair table (printed/typeset, pasted into the notes).
- LTI systems described by linear constant-coefficient differential equations; frequency response as a rational function of `jw`.
- Requirement of stability so that `h(t)` can be recovered: `∫_{-∞}^{∞} |h(t)| dt < ∞`.
- Partial-fraction expansion of `H(jw)` → `h(t)` by inspection.

**Equations**
*Printed Table 3 — Properties of the CTFT* (header equations `x(t) = (1/2π)∫_{-∞}^{∞} X(jω)e^{jωt}dω`, `X(jω) = ∫_{-∞}^{∞} x(t)e^{-jωt}dt`):
- Linearity `ax(t)+by(t) → aX(jω)+bY(jω)`; Time-shifting `x(t-t0) → e^{-jωt0}X(jω)`; Frequency-shifting `e^{jω0 t}x(t) → X(j(ω-ω0))`; Conjugation `x*(t) → X*(-jω)`; Time-Reversal `x(-t) → X(-jω)`; Time- and Frequency-Scaling `x(at) → (1/|a|)X(jω/a)`; Convolution `x(t)*y(t) → X(jω)Y(jω)`; Multiplication `x(t)y(t) → (1/2π)X(jω)*Y(jω)`; Differentiation in Time `(d/dt)x(t) → jωX(jω)`; Integration `∫_{-∞}^{t}x(t)dt → (1/jω)X(jω) + πX(0)δ(ω)`; Differentiation in Frequency `tx(t) → j(d/dω)X(jω)`; Conjugate symmetry for real signals `X(jω)=X*(-jω)`, `Re{X(jω)}=Re{X(-jω)}`, `Im{X(jω)}=-Im{X(-jω)}`, `|X(jω)|=|X(-jω)|`, `∡X(jω) = -∡X(-jω)`; real & even → `X(jω)` real and even; real & odd → `X(jω)` purely imaginary and odd; Even-Odd decomposition `x_e(t)=Ev{x(t)} → Re{X(jω)}`, `x_o(t)=Od{x(t)} → j Im{X(jω)}`; Parseval `∫_{-∞}^{+∞}|x(t)|^2 dt = (1/2π)∫_{-∞}^{+∞}|X(jω)|^2 dω`.
*Printed Table 4 — Basic CTFT pairs* (with Fourier-series-coefficient column):
- `Σ_k a_k e^{jkω0 t} → 2π Σ_k a_k δ(ω-kω0)`; `e^{jω0 t} → 2πδ(ω-ω0)`; `cos ω0 t → π[δ(ω-ω0)+δ(ω+ω0)]`; `sin ω0 t → (π/j)[δ(ω-ω0)-δ(ω+ω0)]`; `x(t)=1 → 2πδ(ω)`; periodic square wave `→ Σ_k (2 sin kω0T1 / k) δ(ω-kω0)`; impulse train `Σ_n δ(t-nT) → (2π/T) Σ_k δ(ω - 2πk/T)`; rectangular pulse (`1, |t|<T1`; `0, |t|>T1`) `→ 2 sin ωT1 / ω`; `sin Wt/(πt) → X(jω) = {1, |ω|<W ; 0, |ω|>W}`; `δ(t) → 1`; `u(t) → 1/(jω) + πδ(ω)`; `δ(t-t0) → e^{-jωt0}`; `e^{-at}u(t), Re{a}>0 → 1/(a+jω)`; `t e^{-at}u(t), Re{a}>0 → 1/(a+jω)^2`; `(t^{n-1}/(n-1)!) e^{-at}u(t), Re{a}>0 → 1/(a+jω)^n`.
*Handwritten system-analysis section:*
- `Σ_{k=0}^{N} a_k d^k y(t)/dt^k = Σ_{k=0}^{M} b_k d^k x(t)/dt^k` : "N-TH ORDER DIFFERENTIAL EQUATION"
- `F{ Σ_{k=0}^{N} a_k d^k y(t)/dt^k } = F{ Σ_{k=0}^{M} b_k d^k x(t)/dt^k }` --Linearity--> `Σ_{k=0}^{N} a_k F{ d^k y(t)/dt^k } = Σ_{k=0}^{M} b_k F{ d^k x(t)/dt^k }`
- Boxed: `Σ_{k=0}^{N} a_k (jw)^k Y(jw) = Σ_{k=0}^{M} b_k (jw)^k X(jw)`
- Boxed: `Y(jw) [ Σ_{k=0}^{N} a_k (jw)^k ] = X(jw) [ Σ_{k=0}^{M} b_k (jw)^k ]`
- Boxed: `H(jw) = Y(jw)/X(jw) = [ Σ_{k=0}^{M} b_k (jw)^k ] / [ Σ_{k=0}^{N} a_k (jw)^k ]`
- Boxed pair: `h(t) = e^{-at}u(t) --F--> H(jw) = 1/(a+jw)`
- Boxed pair: `t e^{-at} u(t) --F--> 1/(a+jw)^2`
- Purple cloud: "Note that h(t) should be stable so that we can find it. i.e., `∫_{-∞}^{∞} |h(t)| dt < ∞`"

**Examples** — none on this page.
**Homework** — none on this page.

**Figures**
- Two **printed (typeset, non-MATLAB) tables** pasted at the top: "Table 3: Properties of the Continuous-Time Fourier Transform" (left) and "Table 4: Basic Continuous-Time Fourier Transform Pairs" (right). No plots on this page.

**Ambiguities**
- **A62-01**: The differential equation is annotated "N-TH ORDER DIFFERENTIAL EQUATION"; the order is `N` only if `a_N ≠ 0` (and the notes do not state `N ≥ M` or any such condition).
- **A62-02**: The purple note says "**h(t)** should be stable"; stability is a property of the system, not of the impulse response signal. The condition given (`∫|h(t)|dt < ∞`) is BIBO stability.
- **A62-03**: Table 3 and Table 4 are pasted at small scale; at 160 dpi several entries are at the resolution limit — in particular the "Periodic square wave" row of Table 4 and the entire right-hand "Fourier series coefficients (if periodic)" column are only partially legible (e.g. the `a_k` expressions with `sinc(kω0T1/π)` and the bracketed remark "this is the Fourier series representation for any choice of T > 0"). Treat these as **ILLEGIBLE-at-this-resolution** rather than verified.

---

## p.63 — Example ×2: differential equation → H(jw), h(t); and repeated-pole partial fractions

**Concepts**
- Solving for the frequency response of an LTI system from its differential equation.
- Residue theorem for simple poles.
- Repeated (double) pole in a partial-fraction expansion; determining the remaining coefficient by substituting a convenient value (`jw = 0`).
- Transform pair `t e^{-at}u(t) ↔ 1/(a+jw)^2` used implicitly for the repeated term.

**Equations** (CT)
*Example 1:*
- Given: `d^2 y(t)/dt^2 + 4 dy(t)/dt + 3y(t) = dx(t)/dt + 2x(t)`
- `(jw)^2 Y(jw) + 4(jw)Y(jw) + 3Y(jw) = (jw)X(jw) + 2X(jw)`
- `H(jw) = Y(jw)/X(jw) = ((jw)+2)/((jw)^2 + 4(jw) + 3) = (jw+2)/((jw+1)(jw+3)) = A/(jw+1) + B/(jw+3)`
- `A = (jw+1)·(jw+2)/((jw+1)(jw+3)) |_{jw=-1} = (-1+2)/(-1+3) = 1/2` (boxed)
- `B = (jw+3)·(jw+2)/((jw+1)(jw+3)) |_{jw=-3} = (-3+2)/(-3+1) = 1/2` (boxed)
- `H(jw) = (1/2)·1/(jw+1) + (1/2)·1/(jw+3)`
- `h(t) = (1/2) e^{-t} u(t) + (1/2) e^{-3t} u(t)` (boxed)

*Example 2:*
- `X(jw) = 1/(jw+1)`, `H(jw) = (jw+2)/((jw+1)(jw+3))`
- `Y(jw) = X(jw)H(jw) = [1/(jw+1)]·[(jw+2)/((jw+1)(jw+3))] = (jw+2)/((jw+1)^2 (jw+3))`
- `Y(jw) = (jw+2)/((jw+1)^2 (jw+3)) = A/(jw+1) + B/(jw+1)^2 + C/(jw+3)`  (`(jw+1)^2` circled in red: "REPEATED TERM")
- `B = (jw+1)^2 · (jw+2)/((jw+1)^2 (jw+3)) |_{jw=-1} = (-1+2)/(-1+3) = 1/2` (boxed)
- `C = (jw+3) · (jw+2)/((jw+1)^2 (jw+3)) |_{jw=-3} = (-3+2)/((-3+1)^2) = -1/4` (boxed)
- `jw+2 = A(jw+1)(jw+3) + (1/2)(jw+3) - (1/4)(jw+1)^2`; "Assume that `jw=0`, then `2 = A(1)(3) + (1/2)3 - (1/4)1^2`" → `A = 1/4` (boxed)
- `Y(jw) = (1/4)·1/(jw+1) + (1/2)·1/(jw+1)^2 + (1/4)·1/(jw+3)`  *(sign of third term as written — see A63-01)*
- `y(t) = [ (1/4) e^{-t} + (1/2) t e^{-t} + (1/4) e^{-3t} ] u(t)` (boxed, tagged ✳)

**Examples**
1. *Example 1.* Given: stable LTI system with `y'' + 4y' + 3y = x' + 2x`. Asked: determine `H(jw)` and `h(t)`. Method: CTFT of both sides, rearrange, residue/cover-up partial fractions, inverse by inspection. Answers: `H(jw) = (jw+2)/((jw+1)(jw+3))`, `h(t) = (1/2)e^{-t}u(t) + (1/2)e^{-3t}u(t)`.
2. *Example 2.* Given: `x(t) = e^{-t}u(t)`, `h(t) = (1/2)e^{-t}u(t) + (1/2)e^{-3t}u(t)`. Asked: what is `y(t)`. Method: `Y=XH`, partial fractions with a repeated pole, residues for `B` and `C`, `A` by evaluating at `jw=0`, then inverse transform. Answer as written: `y(t) = [(1/4)e^{-t} + (1/2)t e^{-t} + (1/4)e^{-3t}] u(t)`.

**Homework** — none on this page.

**Figures** — none (no plots or diagrams; only boxed equations, blue/green boxes, red "REPEATED TERM" annotation).

**Ambiguities**
- **A63-01**: **Sign inconsistency.** `C` is computed and boxed as `-1/4`, but the following "Hence, Y(jw) = …" line writes `+ (1/4)·1/(jw+3)` and the boxed final answer writes `+ (1/4)e^{-3t}`. Verified at 2× magnification: no minus sign is present in either. Either `C` or the last two lines is wrong.
- **A63-02**: `A` is determined by "Assume that `jw = 0`" — i.e. evaluating the polynomial identity at `w = 0`; the wording "assume" suggests a restriction rather than a valid substitution into an identity.
- **A63-03**: The pair `t e^{-at}u(t) ↔ 1/(a+jw)^2` used for the `B/(jw+1)^2` term is never cited on this page (it appears on p.62).

---

## p.64 — "CH#5 — DISCRETE-TIME FOURIER TRANSFORM" / "Derivation of the Discrete-Time Fourier Transform (DTFT):" [Week11—Lec1]

**Concepts**
- Three-step derivation of the DTFT from the discrete-time Fourier series (DTFS) of a periodically extended aperiodic signal.
- Periodic extension `x̃[n]` of an aperiodic `x[n]` with period `N`; `x̃[n] = x[n]` on `-N1 ≤ n ≤ N1`.
- Fundamental frequency `w0 = 2π/N`; relation `1/N = w0/2π`.

**Equations** (DT)
- STEP 2, boxed: `x̃[n] = Σ_{k=<N>} a_k e^{jk w0 n}`
- boxed: `a_k = (1/N) Σ_{n=<N>} x̃[n] e^{j k w0 n}`  *(positive exponent as written — see A64-01)*
- `w0 = 2π/N` is the fundamental frequency; on `-N1 ≤ n ≤ N1`, `x̃[n] = x[n]`
- boxed: `a_k = (1/N) Σ_{n=<N>} x̃[n] e^{j k w0 n} = (1/N) Σ_{n=-∞}^{∞} x[n] e^{j k w0 n}`
- definition cited: `X(e^{jw}) = Σ_{n=-∞}^{∞} x[n] e^{-jwn}`
- boxed: `a_k = (1/N) Σ_{n=-∞}^{∞} x[n] e^{j k w0 n} = (1/N) X(e^{j k w0})`
- STEP 3: `x̃[n] = Σ_{k=<N>} a_k e^{jk w0 n} = Σ_{k=<N>} (1/N) X(e^{jk w0}) e^{jk w0 n}`
- boxed: `x̃[n] = (1/2π) Σ_{k=<N>} X(e^{jk w0}) e^{jk w0 n} w0`, where `w0 = 2π/N`. Hence `1/N = w0/2π`.

**Examples** — none tagged "Example" on this page.
**Homework** — none on this page.

**Figures**
- **Hand-drawn** STEP-1 pair of stem plots:
  - left: `x[n]`, aperiodic — three stems (short, tall, short) clustered around the origin, unlabeled n axis, caption "aperiodic".
  - right: `x̃[n]`, periodic extension — the same 3-stem group repeated, n axis marked `-N`, `-N1` (green ✳), `0`, `N1` (green ✳), `N`, with `...` at both ends; caption "Periodic by N".
- No MATLAB figures on this page.

**Ambiguities**
- **A64-01**: **Exponent sign.** Both boxed DTFS analysis equations are written with a *positive* exponent: `a_k = (1/N) Σ x̃[n] e^{+jk w0 n}` (verified at 3× magnification, no minus stroke present). The standard DTFS analysis equation uses `e^{-jk w0 n}`, and the identity `a_k = (1/N) X(e^{jk w0})` claimed two lines later requires the negative exponent, since the page itself defines `X(e^{jw}) = Σ x[n] e^{-jwn}`. Internally inconsistent.
- **A64-02**: The sentence reads "**If** Chapter 3, we defined X(e^{jw}) = …"; "If" appears to be intended as "In".
- **A64-03**: The STEP-1 stem plots carry no numeric axis labels on the aperiodic panel, so the claimed correspondence with `-N1 … N1` on the periodic panel is only schematic.
- **A64-04**: The page never states the condition under which the padding/extension argument is valid (`N > 2N1`, i.e. no overlap of the replicas).

---

## p.65 — DTFT / inverse-DTFT pair; "Periodicity of DTFT:"; Example: DTFT of a shifted unit impulse

**Concepts**
- Limit `N → ∞`, `w0 → 0`: the DTFS sum becomes an integral over one period.
- DTFT pair; convergence condition `Σ_n |x[n]| < ∞`; no convergence issue for the inverse (single period of integration).
- DTFT is always periodic by `2π` (unlike the CTFT, which is aperiodic in general).
- Convention: "We generally plot the DTFT within `-π` and `π`."
- DTFT of `δ[n-n0]`; linear phase `-n0 w`.

**Equations** (DT unless noted)
- `x̃[n] = (1/2π) Σ_{k=<N>} X(e^{jk w0}) e^{jk w0 n} w0`
- boxed: `x[n] = (1/2π) ∫_{2π} X(e^{jw}) e^{jwn} dw`
- Yellow box (labeled "DISCRETE-TIME FOURIER TRANSFORM (SYNTHESIS EQN.)"): `X(e^{jw}) = Σ_{n=-∞}^{∞} x[n] e^{-jwn}`
- Yellow box (labeled "INVERSE DISCRETE-TIME FOURIER TRANSFORM (ANALYSIS EQN.)"): `x[n] = (1/2π) ∫_{2π} X(e^{jw}) e^{jwn} dw` (red note: "One period of integration.")
- Purple cloud: "If `Σ_n |x[n]| < ∞` then synthesis eqn. will converge."
- Purple cloud: "No convergence issues since we are performing a single period of integration (i.e., over 2π)."
- boxed check: `X(e^{jw}) = X(e^{j(w+2π)})`
- Proof: `X(e^{j(w+2π)}) = Σ_{n=-∞}^{∞} x[n] e^{-j(w+2π)n} = Σ_{n=-∞}^{∞} x[n] e^{-jwn} e^{-j2πn} = X(e^{jw})` (underbrace `=1`), with note `(e^{-j2π})^n = 1^n = 1, for n ∈ Z`
- CT counter-check: `X(jw) =?= X(j(w+2π))` → `∫ x(t)e^{-jwt}dt =?= ∫ x(t) e^{-j(w+2π)t} dt = ∫ x(t) e^{-jwt} e^{-j2πt} dt`, underbrace `≠ 1 since t ∈ R`. Hence `X(jw) ≠ X(j(w+2π))`.
- Example: `X(e^{jw}) = Σ_{n=-∞}^{∞} x[n] e^{-jwn}`; purple cloud `∡X(e^{jw}) = -n0 w`
- Yellow box: `X(e^{jw}) = e^{-jw n0}`  (since `x[n]=0 if n ≠ n0`)
- Yellow boxes: if `n0 = 0`, then `x[n] = δ[n]` and `X(e^{jw}) = 1`.

**Examples**
1. *Example.* Given: `x[n] = δ[n-n0]`. Asked: determine the DTFT. Method: apply the DTFT sum; only `n = n0` survives. Answers: `X(e^{jw}) = e^{-jw n0}`; `∡X(e^{jw}) = -n0 w`; for `n0=0`: `x[n]=δ[n]`, `X(e^{jw}) = 1`.

**Figures**
- **Typeset/illustrative** box (top right): plot of `X(e^{jω}) e^{jωn}` vs ω, smooth periodic curve, ω axis marked `-π`, `π`; one point marked `X(e^{jkω0})e^{jkω0 n}` with a narrow red rectangle of width `ω0` drawn at `kω0`. Caption: "As N→∞, w0→0 and the area becomes infinitesimal and sum becomes integration."
- **MATLAB-generated** (periodicity demo), 2×2:
  - `x1[n] = (sin((π/4)n)/(πn))^2`, stem, n ∈ [−10,10], y ticks 0/0.03/0.06, peak ≈0.0625 at n=0. Right: `X1(e^{jω})`, continuous, ω ∈ [−6π,6π], y ticks 0/0.15/0.25, periodic triangular-shaped waveform; red "Periodic by 2π" with two red circles and an arrow joining successive periods.
  - `x2[n] = (sin((π/2)n)/(πn))^2`, stem, n ∈ [−10,10], y 0/0.15/0.25, peak 0.25 at n=0. Right: `X2(e^{jω})`, continuous, ω ∈ [−6π,6π], y 0/0.25/0.5; a red rectangle marks the single period between `-π` and `π`; red note "We generally plot the DTFT within -π and π."
- **MATLAB-generated** (Example), 2×3:
  - `x1[n] = δ[n]`, stem, n ∈ [−4,4], y 0/0.5/1, single stem at n=0. `|X1(e^{jω})|`, ω ∈ [−π,π], y 0/1/2, flat at 1. `∡X1(e^{jω})`, ω ∈ [−π,π], y −1/0/1, flat at 0.
  - `x2[n] = δ[n-2]` (the `2` circled in red, annotated `n0`), stem at n=2, n ∈ [−4,4]. `|X2(e^{jω})|`, flat at 1, y 0/1/2. `∡X2(e^{jω})` annotated in red `= -2w`: wrapped (sawtooth) phase, ω ticks −π, −π/2, 0, π/2, π, y from −π to π.

**Ambiguities**
- **A65-01**: **Labels swapped.** `X(e^{jw}) = Σ x[n]e^{-jwn}` is labeled "(SYNTHESIS EQN.)" and `x[n] = (1/2π)∫_{2π}X(e^{jw})e^{jwn}dw` is labeled "(ANALYSIS EQN.)". Conventionally these are the *analysis* and *synthesis* equations respectively.
- **A65-02**: The convergence cloud inherits the same swap: "If `Σ|x[n]| < ∞` then **synthesis** eqn. will converge" — the absolute-summability condition governs the forward sum (conventionally the analysis equation).
- **A65-03**: The `∡X2(e^{jω})` panel shows a *wrapped* (sawtooth) phase, while the derived formula `∡X(e^{jw}) = -n0 w` is linear/unwrapped. The wrapping is never mentioned.
- **A65-04**: The `X1(e^{jω})` panel's y-ticks (0/0.15/0.25) and the `x1[n]` panel's y-ticks (0/0.03/0.06) are non-uniformly spaced and do not coincide with the analytic extrema (0.0625, etc.).

---

## p.66 — Example: DTFT of `a^n u[n]` + Homework: DTFT of `a^{|n|}`

**Concepts**
- Geometric-series evaluation of the DTFT of a one-sided exponential; convergence via `|a e^{-jw}| = |a| < 1`.
- Magnitude and phase spectra of a first-order DT system.
- Two-sided exponential split into two one-sided geometric sums with index substitution `m = -n`.

**Equations** (DT)
- `X(e^{jw}) = Σ_{n=-∞}^{∞} x[n] e^{-jwn} = Σ_{n=0}^{∞} a^n e^{-jwn} = Σ_{n=0}^{∞} (a e^{-jw})^n = 1/(1 - a e^{-jw})` (boxed)
- Blue cloud: `Σ_{k=0}^{∞} a^k = 1/(1-a)`, `|a| < 1`
- Blue note: `|a e^{-jw}| = |a| |e^{-jw}| < 1` (underbrace `=1`)
- `|X(e^{jw})| = |1|/|1 - a e^{-jw}| = 1/|1 - a cos(w) + j a sin(w)| = 1/sqrt((1 - a cos(w))^2 + (a sin(w))^2) = 1/sqrt(1 - 2a cos(w) + a^2)` (boxed)
- `∡X(e^{jw}) = ∡1 - ∡(1 - a e^{-jw}) = 0 - ∡(1 - a cos(w) + j a sin(w)) = - tan^{-1}( a sin(w) / (1 - a cos(w)) )` (boxed)
*Homework:*
- `X(e^{jw}) = Σ_{n=-∞}^{∞} a^{|n|} e^{-jwn} = Σ_{n=-∞}^{-1} a^{-n} e^{-jwn} + Σ_{n=0}^{∞} a^{n} e^{-jwn}` (terms labeled (i) and (ii))
- (i) with `m = -n`: `Σ_{m=1}^{∞} (a e^{jw})^m = Σ_{m=0}^{∞} (a e^{jw})^m - 1 = 1/(1 - a e^{jw}) - 1 = (a e^{jw})/(1 - a e^{jw})` (boxed; blue note "Infinite Sum")
- (ii) `Σ_{n=0}^{∞} (a e^{-jw})^n = 1/(1 - a e^{-jw})` (boxed)

**Examples**
1. *Example.* Given: `x[n] = a^n u[n]`, `|a| < 1`. Asked: determine the DTFT and plot `|X(e^{jw})|` and `∡X(e^{jw})`. Method: geometric series; then magnitude/phase of a complex reciprocal. Answers: `X(e^{jw}) = 1/(1-a e^{-jw})`, `|X(e^{jw})| = 1/sqrt(1 - 2a cos w + a^2)`, `∡X(e^{jw}) = -tan^{-1}(a sin w/(1 - a cos w))`. Plotted for `a = 1/2` and `a = 1/8`.

**Homework**
- *Homework (green tag, solution started here and finished on p.67):* "Determine and plot the DTFT of `x[n] = a^{|n|}` (`|a| < 1`) for `a = 1/2` and `a = 1/4`."

**Figures**
- **MATLAB-generated**, 2×3 (Example):
  - `x1[n] = (1/2)^n`, stem, n ∈ [0,10], y 0/0.5/1, decaying from 1.
  - `|X1(e^{jω})|`, continuous, ω ∈ [−4π,4π] (ticks −4π,−2π,0,2π,4π), y ticks 0.6/1/1.5/2; periodic, maxima 2 at ω = 0, ±2π, ±4π, minima ≈0.667 at odd multiples of π.
  - `∡X1(e^{jω})`, continuous, ω ∈ [−4π,4π], y from `-0.16π` to `0.16π`, periodic.
  - `x2[n] = (1/8)^n`, stem, n ∈ [0,10], y 0/0.5/1.
  - `|X2(e^{jω})|`, ω ∈ [−4π,4π], y ticks 0.87/1/1.15.
  - `∡X2(e^{jω})`, ω ∈ [−4π,4π], y from `-0.04π` to `0.04π`.

**Ambiguities**
- **A66-01**: The forward transform is again called "the **synthesis** equation of the DTFT" (same swap as A65-01).
- **A66-02**: `|X2(e^{jω})|` y-ticks are 0.87 / 1 / 1.15 while the analytic extrema for `a = 1/8` are `1/(1+1/8) = 0.888…` and `1/(1-1/8) = 1.142…`; likewise `|X1|` ticks 0.6 / 2 vs analytic min `1/(1+1/2) = 0.667`. The tick labels appear to be rounded axis limits, not the extrema — easy to misread as computed values.
- **A66-03**: In the homework, the first sum's upper limit `-1` is written in red *above* the summation sign (where the upper limit normally sits) while `n = -∞` is below; readable but visually irregular.

---

## p.67 — [Homework `a^{|n|}` continued] + Example: DTFT of a rectangular DT pulse (Dirichlet kernel)

**Concepts**
- Two-sided exponential has a **real** DTFT.
- Finite geometric series formula for a DT rectangular pulse; result is a Dirichlet-type ratio of sines — explicitly "Not a sinc(·) function".
- Time expansion ↔ frequency compression for DT signals.

**Equations** (DT)
*Homework conclusion:*
- `X(e^{jw}) = 1/(1 - a e^{-jw}) + (a e^{jw})/(1 - a e^{jw}) = (1 - a^2)/(1 - 2a cos(w) + a^2)` (boxed) : "X(e^{jw}) IS REAL!"
*Example:*
- `X(e^{jw}) = Σ_{n=-∞}^{∞} x[n] e^{-jwn} = Σ_{n=-N1}^{N1} e^{-jwn}`
- Blue cloud: `Σ_{k=a}^{b} r^k = (r^a - r^{b+1})/(1-r)`, "when `|r| ≤ 1`"
- `X(e^{jw}) = [ (e^{-jw})^{-N1} - (e^{-jw})^{(N1+1)} ] / (1 - e^{-jw}) = [ e^{jwN1} - e^{-jw(N1+1)} ] / (1 - e^{-jw})` (numerator ★, denominator ★★)
- ★ NUMERATOR: `e^{jwN1} - e^{-jwN1} e^{-jw} = e^{-j w/2} ( e^{jw(N1+0.5)} + e^{-jw(N1+0.5)} )` with underbrace `2j sin(w(N1+0.5))`
  `= 2j e^{-j w/2} sin(w(N1+0.5))` (boxed)
- ★★ DENOMINATOR: `1 - e^{-jw} = e^{-j w/2} ( e^{j w/2} - e^{-j w/2} )` with underbrace `2j sin(w/2)`
  `= 2j e^{-j w/2} sin(w/2)` (boxed)
- Summary, boxed: `X(e^{jw}) = sin(w(N1+0.5)) / sin(w/2)`
  red notes: ": Not a sinc(·) function!" and ": X(e^{jw}) is real! (i.e., |X(e^{jw})| = X(e^{jw}), ∡X(e^{jw}) = 0)"

**Examples**
1. *Example.* Given: the sketched DT rectangular pulse `x[n] = 1 for -N1 ≤ n ≤ N1, 0 otherwise`. Asked: determine and plot the DTFT. Method: finite geometric sum, then symmetric factoring of numerator and denominator. Answer: `X(e^{jw}) = sin(w(N1+0.5))/sin(w/2)`.

**Homework** — continuation only (statement is on p.66); answer `X(e^{jw}) = (1-a^2)/(1-2a cos w + a^2)`, plotted for `a=1/2` and `a=1/4`.

**Figures**
- **MATLAB-generated** (homework), 2×2:
  - `x1[n] = (1/2)^{|n|}`, stem, n ∈ [−10,10], y 0/0.5/1, two-sided decay, peak 1 at n=0. Right: `X1(e^{jω})`, continuous, ω ∈ [−4π,4π], y ticks 0/1/2/3; periodic, max 3 at ω = 0, ±2π, ±4π, min 1/3.
  - `x2[n] = (1/4)^{|n|}`, stem, n ∈ [−10,10], y 0/0.5/1. Right: `X2(e^{jω})`, continuous, ω ∈ [−4π,4π], y ticks 0.8/1/1.2/1.4/1.6; max ≈1.667 at ω=0.
- **Hand-drawn** stem plot of the example signal: `x[n]` = 1 on `-N1 … N1` (5 stems shown), 0 elsewhere, y 0/0.5/1, n axis labeled `-N1` and `N1`.
- **MATLAB-generated** (example), 2×2:
  - `N1 = 2`: `x1[n]`, stem, n ∈ [−8,8], stems of height 1 for n = −2…2, y 0/0.5/1. Right: `X1(e^{jω})`, continuous, ω ∈ [−4π,4π], y ticks 0/2/4, main peak 5 at ω=0, oscillating with negative side lobes.
  - `N1 = 4`: `x2[n]`, stem, n ∈ [−8,8], stems of height 1 for n = −4…4. Right: `X2(e^{jω})`, ω ∈ [−4π,4π], y ticks 0/5/10, main peak 9 at ω=0, more oscillations.
  - Red arrows between rows: "expansion in time" (time column) and "compression in frequency" (spectrum column).

**Ambiguities**
- **A67-01**: **Sign error in the numerator factoring.** Written as `e^{-jw/2}( e^{jw(N1+0.5)} + e^{-jw(N1+0.5)} )` with a **plus** sign, while the underbrace and the very next line use `2j sin(w(N1+0.5))`, which requires a **minus**. (A plus would give `2 cos(w(N1+0.5))`.)
- **A67-02**: The red claim "`X(e^{jw})` is real! (i.e., `|X(e^{jw})| = X(e^{jw})`, `∡X(e^{jw}) = 0`)" is only valid where `X ≥ 0`. The plotted `X1(e^{jω})` clearly goes negative between lobes, so `|X| = X` and `∡X = 0` do not hold everywhere. Realness is true; the parenthetical consequences are not.
- **A67-03**: The geometric-series cloud states the closed form "when `|r| ≤ 1`". Here `r = e^{-jw}` has `|r| = 1` exactly, and the *finite*-sum formula actually holds for any `r ≠ 1`; at `w = 0` the written expression is 0/0.
- **A67-04**: The `X2(e^{jω})` panel (a = 1/4) has y-ticks starting at 0.8 while the analytic minimum is 0.6; the curve appears to touch the frame bottom, so the axis limits cannot be inferred reliably from the ticks.

---

## p.68 — Example: inverse DTFT of an ideal DT low-pass spectrum + "DTFT FOR PERIODIC SIGNALS"

**Concepts**
- Inverse DTFT computed over one period `[-π, π]`; the band-limited rectangle gives a DT sinc.
- DTFT of a complex exponential is a `2π`-periodic impulse train.
- Sifting property used in the inverse DTFT integral.

**Equations** (DT)
- Given: `X(e^{jw}) = { 1 , 0 ≤ |w| ≤ W ; 0 , W < |w| ≤ π }`, `X(e^{jw})` periodic by `2π`.
- `x[n] = (1/2π) ∫_{2π} X(e^{jw}) e^{jwn} dw = (1/2π) ∫_{-π}^{π} X(e^{jw}) e^{jwn} dw = (1/2π) ∫_{-W}^{W} X(e^{jw}) e^{jwn} dw` (underbrace `=1`)
- `= (1/2π)(1/(jn)) [ e^{jwn} ]_{-W}^{W} = (1/2π)(1/(jn)) [ e^{jWn} - e^{-jWn} ]` (underbrace `= 2j sin(Wn)`)
- boxed: `sin(Wn)/(πn)` ; boxed: `= (W/n) sinc(Wn/π)`  *(denominator `n` as written — see A68-01)*
- `In CTFT, F^{-1}{ X(jw) = 2π δ(w - w0) } = e^{jw0 t}`
- `x[n] = e^{jw0 n} --F--> X(e^{jw}) = 2π δ(w - w0)`, periodic by `2π`
- Yellow box: `X(e^{jw}) = Σ_{k=-∞}^{∞} 2π δ(w - w0 - 2πk)`
- Proof: `x[n] = (1/2π) ∫_{2π} X(e^{jw}) e^{jwn} dw = (1/2π) ∫_{-π}^{π} 2π δ(w - w0) e^{jwn} dw = e^{j w0 n}` (boxed; "Sifting property")
- Red annotations under the figure: `X1(e^{jw}) = Σ_{k=-∞}^{∞} 2π δ(w - π/4 - 2πk)` ; `X2(e^{jw}) = Σ_{k=-∞}^{∞} 2π δ(w - π/2 - 2πk)`

**Examples**
1. *Example.* Given: `X(e^{jw}) = 1` for `0 ≤ |w| ≤ W`, `0` for `W < |w| ≤ π`, periodic by `2π`. Asked: determine and plot `x[n]`. Method: inverse DTFT over one period, integral reduces to `[-W, W]`, Euler. Answer: `x[n] = sin(Wn)/(πn) = (W/n) sinc(Wn/π)` *(as written)*.

**Homework** — none on this page.

**Figures**
- **MATLAB-generated** (Example), 2×2:
  - `x1[n] = sin((π/4)n)/(πn)` (row y-label `W = π/4`), stem, n ∈ [−10,10], y ticks −0.1/0/0.1/0.2/0.3, peak 0.25 at n=0. Right: `X1(e^{jω})`, ω ∈ [−3π,3π], ticks −3π,−2π,−π,−π/4,π/4,2π,3π, y 0/0.5/1; rectangles of amplitude 1 of half-width π/4 centered at 0 and ±2π (2π-periodic).
  - `x2[n] = sin((π/2)n)/(πn)` (y-label `W = π/2`), stem, n ∈ [−10,10], y −0.2/0/0.2/0.4/0.6, peak 0.5 at n=0. Right: `X2(e^{jω})`, ω ∈ [−3π,3π], ticks include −π/2, π/2, y 0/0.5/1; rectangles of half-width π/2, 2π-periodic.
- **MATLAB-generated** (DTFT for periodic signals), 2×3:
  - `|x1[n]| = |e^{jω0 n}|` (row label `ω0 = π/4`), stem, n ∈ [−8,8] (ticks −8,−6,−4,−2,0,2,4,6,8), all stems height 1, y 0/0.5/1.
  - `∡x1[n] = ∡e^{jω0 n}`, stem, n ∈ [−8,8], y from −π to π, staircase/sawtooth phase.
  - `X1(e^{jω})`, ω ticks −1.75π, 0.25π, 2.25π, y 0/π/2π; three tall narrow spikes (numerically rendered impulses) at those ω.
  - `|x2[n]|` (row label `ω0 = π/2`), stems of height 1, n ∈ [−8,8].
  - `∡x2[n]`, stem, n ticks −7,−5,−3,−1,1,3,5,7, y −π…π.
  - `X2(e^{jω})`, ω ticks −1.5π, 0.5π, 2.5π, y 0/π/2π; three spikes.

**Ambiguities**
- **A68-01**: The second boxed form is written `(W/n) sinc(Wn/π)` — the denominator is unmistakably `n`, not `π` (verified at 3× magnification; compare the clearly-formed `π` in `πn` and in `Wn/π` on the same line). For `sin(Wn)/(πn)` the prefactor must be `W/π`; the plotted peaks (0.25 for `W=π/4`, 0.5 for `W=π/2`) confirm `W/π`. As written the expression is `n`-dependent twice over.
- **A68-02**: In the `X1(e^{jω})` panel the ω tick labels `−π/4` and `π/4` are printed overlapping (rendered as `-π/4π/4`) and are only marginally legible at 160 dpi.
- **A68-03**: The `X1/X2(e^{jω})` panels in the periodic-signal figure plot impulses as finite-height narrow spikes on a linear axis labeled up to `2π`; whether the spikes represent weight `2π` or height `2π` is not stated.
- **A68-04**: The boundary case `|w| = W` is covered by the first branch (`≤ W`) while the second branch starts at `W <`; consistent, but the definition is only given on `|w| ≤ π` and relies on the stated 2π-periodicity for all other ω.

---

## p.69 — [DTFT for periodic signals, continued] + Example: DTFT of a periodic DT square wave

**Concepts**
- DTFT of a periodic DT signal = impulse train weighted by `2π a_k`, spaced by `w0 = 2π/N`.
- DTFT of `cos(w0 n)` and `sin(w0 n)` as `2π`-periodic impulse pairs.
- FS coefficients of the periodic DT square wave (from Chapter 3) reused to write its DTFT.

**Equations** (DT)
- `x[n] = Σ_{k=<N>} a_k e^{jk(2π/N)n}` (red annotation `= w0` under `2π/N`)
- Yellow box: `X(e^{jw}) = Σ_{k=-∞}^{∞} 2π a_k δ( w - k (2π/N) )` (red `= w0` over `2π/N`)
- `F{cos(w0 n)} = F{ (1/2)e^{jw0 n} + (1/2)e^{-jw0 n} } = (1/2) F{e^{jw0 n}} + (1/2) F{e^{-jw0 n}}`
  `= (1/2) Σ_{k=-∞}^{∞} 2π δ(w - w0 - 2πk) + (1/2) Σ_{k=-∞}^{∞} 2π δ(w + w0 - 2πk)`
  `= π Σ_{k=-∞}^{∞} { δ(w - w0 - 2πk) + δ(w + w0 - 2πk) }` (highlighted)
- `F{sin(w0 n)} = (π/j) Σ_{k=-∞}^{∞} { δ(w - w0 - 2πk) - δ(w + w0 - 2πk) }` (highlighted)
- Green box (FS coefficients from Chapter 3):
  `a_k = { (1/N) · sin( (2πk/N)(N1 + 1/2) ) / sin( πk/N )  ,  k ≠ 0, ±N, ±2N, ...`
  `      { (2N1 + 1)/N                                     ,  k = 0, ±N, ±2N, ... }`
- boxed: `X(e^{jw}) = 2π Σ_{k=-∞}^{∞} a_k δ( w - (2π/N) k )`, where `a_k` is as in the green box.

**Examples**
1. *Example.* Given: the sketched periodic DT square wave (value 1 for `|n| ≤ N1` within each period `N`, 0 otherwise). Asked: determine and plot the DTFT of `x[n]`. Method: reuse the Chapter-3 FS coefficients, then apply the periodic-signal DTFT formula. Answer: `X(e^{jw}) = 2π Σ_k a_k δ(w - (2π/N)k)` with the boxed `a_k`; plotted for `(N,N1) = (10,2), (20,2), (30,2)`.

**Homework** — none on this page.

**Figures**
- **Hand-drawn** ω-axis schematic of `X(e^{jw})`: five up-arrows at `-2w0, -w0, 0, w0, 2w0`, labeled `(2πa_{-2})`, `(2πa_{-1})`, `(2πa_0)`, `(2πa_1)`, `(2πa_2)`, with `...` on both sides.
- **Hand-drawn** stem plot of the example signal `x[n]`: unit stems for `-N1 ≤ n ≤ N1` repeated with period `N`, zeros between; n axis marked `-N, -N1, N1, N`; y 0/0.5/1.
- **MATLAB-generated**, 3×3:
  - Row 1 (`N = 10, N1 = 2`): `x1[n]` stem, n ∈ [−10,10], y 0/0.5/1 — bursts of 5 unit samples every 10. `a_k` stem, k ∈ [−20,20], y ticks −0.2/0/0.2/0.4/0.6, peak 0.5 at k = 0, ±10 (= (2N1+1)/N). `X1(e^{jω})` stem/arrow plot, ω ∈ [−4π,4π], y from `-π/4` to `π`; red annotation "10 impulses in [0,2π]" and a small red brace labeled `2π/10` marking the impulse spacing near ω=0.
  - Row 2 (`N = 20, N1 = 2`): `x2[n]` stem, n ∈ [−30,30]. `a_k` stem, k ∈ [−30,30], y −0.1/0/0.1/0.2/0.3, peak 0.25 at k = 0, ±20. `X2(e^{jω})`, ω ∈ [−4π,4π], y `-π/4` … `π/2`; red "20 impulses in [0,2π]" plus a small red `2π/20` spacing brace.
  - Row 3 (`N = 30, N1 = 2`): `x3[n]` stem, n ∈ [−40,40]. `a_k` stem, k ∈ [−40,40], y 0/0.05/0.1/0.15/0.2, peak ≈0.167 at k = 0, ±30. `X3(e^{jω})`, ω ∈ [−4π,4π], y `-π/4` … `π/2`; red "30 impulses in [0,2π]".

**Ambiguities**
- **A69-01**: The hand-drawn `X(e^{jw})` schematic draws all five impulses with equal arrow length although their weights `2πa_{-2} … 2πa_2` are in general different; the drawing is schematic only and is not marked as such.
- **A69-02**: The small red spacing annotations under the `X1` and `X2` panels are at the resolution limit: the `X1` one reads `2π/10` (confirmed at 4× zoom), the `X2` one is only partially legible (`2π/20` by inference) and no analogous annotation appears on the `X3` panel.
- **A69-03**: The `X_i(e^{jω})` panels show y-axis ranges extending to `-π/4` (negative), i.e. some impulse weights are negative, but the accompanying text never mentions that `a_k` (and hence the impulse weights) change sign.

---

## p.70 — Example: DTFT of the DT impulse train + Example: DTFT of `2cos((5π/3)n) + cos((7π/4)n)` [Week11—Lec2]

**Concepts**
- DT impulse train ↔ impulse train in frequency, spacing `2π/N`, weight `2π/N`.
- FS coefficients of the impulse train are constant `1/N`; `a_k = a_{k+N}`.
- DT frequencies are only unique modulo `2π`: `cos((5π/3)n) = cos((π/3)n)`, `cos((7π/4)n) = cos((π/4)n)`.
- DTFT of a DT cosine as a `2π`-periodic pair of impulse trains.

**Equations** (DT)
*Example 1:*
- Given (as written): `x[n] = Σ_{n=-∞}^{∞} δ[n - kN]`  *(index as written — see A70-01)*
- `a_k = (1/N) Σ_{n=<N>} x[n] e^{-jk(2π/N)n} = (1/N) Σ_{n=0}^{N-1} δ[n] e^{-jk(2π/N)n} = (1/N) δ[0] e^{-jk(2π/N)0} = 1/N` (boxed), where `a_k = a_{k+N}`
- `X(e^{jw}) = Σ_{k=-∞}^{∞} 2π a_k δ( w - (2π/N) k ) = (2π/N) Σ_{k=-∞}^{∞} δ( w - (2π/N) k )` (boxed)
*Example 2:*
- Blue cloud identity: `cos(a-b) = cos(a)cos(b) + sin(a)sin(b)`
- `cos((5π/3)n) = cos( (2π - π/3) n ) = cos(2πn - (π/3)n) = cos(2πn)cos((π/3)n) + sin(2πn)sin((π/3)n) = cos((π/3)n)` (boxed; underbraces `=1` and `=0`)
- `cos((7π/4)n) = cos( (2π - π/4) n ) = cos((π/4)n)` (boxed)
- Hence `x[n] = 2cos((π/3)n) + cos((π/4)n)` (braces: `= x1[n]`, `= x2[n]`)
- `F{x1[n]} = F{2cos((π/3)n)} = 2π Σ_{k=-∞}^{∞} { δ(w + π/3 - 2πk) + δ(w - π/3 - 2πk) }`
  `= ... + 2πδ(w + 7π/3) + 2πδ(w + 5π/3) + [2πδ(w + π/3) + 2πδ(w - π/3)] + 2πδ(w - 5π/3) + 2πδ(w - 7π/3) + ...`  (bracketed pair yellow-highlighted)
- `F{x2[n]} = F{cos((π/4)n)} = π Σ_{k=-∞}^{∞} { δ(w + π/4 - 2πk) + δ(w - π/4 - 2πk) }`
  `= ... + πδ(w + 9π/4) + πδ(w + 7π/4) + [πδ(w + π/4) + πδ(w - π/4)] + πδ(w - 7π/4) + πδ(w - 9π/4) + ...`  (bracketed pair yellow-highlighted)

**Examples**
1. *Example 1.* Given: the DT impulse train `Σ δ[n-kN]`. Asked: determine the DTFT. Method: FS coefficients over one period (only `n=0` survives), then the periodic-signal DTFT formula. Answer: `X(e^{jw}) = (2π/N) Σ_{k=-∞}^{∞} δ(w - (2π/N)k)`; `a_k = 1/N`. Plotted for `N = 5, 10, 15`.
2. *Example 2.* Given: `x[n] = 2cos((5π/3)n) + cos((7π/4)n)`. Asked: determine the DTFT. Method: reduce frequencies modulo `2π`, then transform each cosine. Answers (this page): `x[n] = 2cos((π/3)n) + cos((π/4)n)`; `F{x1[n]}` and `F{x2[n]}` as above (combined result and plots continue on p.71).

**Homework** — none on this page.

**Figures**
- **Hand-drawn** stem plot of the impulse train `x[n]`: unit stems at `-N, 0, N` (each labeled `1`), `...` on both sides.
- **MATLAB-generated**, 3×2 (Example 1):
  - `N = 5`: `x1[n]` stem, n ∈ [−30,30], unit stems every 5. `X1(e^{jω})` stem/impulse plot, ω ∈ [−4π,4π], y 0 … `2π/5`; small red annotation near ω=0 (spacing `2π/5`, barely legible).
  - `N = 10`: `x2[n]` stem, n ∈ [−30,30]. `X2(e^{jω})`, ω ∈ [−4π,4π], y 0 … `2π/10`, denser impulses.
  - `N = 15`: `x3[n]` stem, n ∈ [−30,30]. `X3(e^{jω})`, ω ∈ [−4π,4π], y 0 … `2π/15`, denser still.
- **Hand-drawn** ω-axis schematic of `X1(e^{jw})`: six up-arrows each labeled `(2π)` at `-7π/3, -5π/3, -π/3, π/3, 5π/3, 7π/3`, with `-2π` and `2π` marked as reference ticks and `...` on both sides.

**Ambiguities**
- **A70-01**: The Example-1 statement reads `x[n] = Σ_{n=-∞}^{∞} δ[n - kN]` — the summation index is `n`, but the running index in the summand is `k` (verified at 3× magnification). Should be `Σ_{k=-∞}^{∞}`.
- **A70-02**: The `a_k` derivation writes `(1/N) δ[0] e^{-jk(2π/N)0} = 1/N`, silently substituting `δ[0] = 1` and also silently restricting `Σ_{n=<N>}` to `Σ_{n=0}^{N-1}`.
- **A70-03**: The red spacing annotation on the `X1(e^{jω})` panel (N=5) is a tiny red `2π/5` over a brace and is essentially **ILLEGIBLE** at 160 dpi; the corresponding annotations are absent on the `X2` and `X3` panels, so the spacing convention is only shown once.
- **A70-04**: Example 1's figure column shows `X(e^{jω})` amplitudes labeled `2π/5`, `2π/10`, `2π/15` on the y-axis, i.e. impulse *weights* drawn as finite heights; no note distinguishes weight from height.

---

## p.71 — [Example continued: combined spectrum] + "PROPERTIES OF THE DTFT" [Week12—Lec1]

**Concepts**
- Superposition of two DT cosine spectra; overall spectrum is `2π`-periodic.
- Fundamental period of a DT sinusoid `N0 = 2π/ω · m` (smallest integer); period of a sum = `lcm` of the individual periods.
- DTFT properties list begins: (1) Periodicity, (2) Linearity.

**Equations** (DT)
- `F{ x[n] = x1[n] + x2[n] } = F{ x[n] = 2cos((π/3)n) + cos((π/4)n) }`
  boxed: `= Σ_{k=-∞}^{∞} { 2π δ(w + π/3 - 2πk) + 2π δ(w - π/3 - 2πk) + π δ(w + π/4 - 2πk) + π δ(w - π/4 - 2πk) }`
- Red figure annotations: `N0 = 2π/ω1 = 2π/(5π/3) = (6/5) m → N0 = 6` (boxed); `N0 = 2π/ω2 = 2π/(7π/4) = (8/7) m → N0 = 8` (boxed); `N0 = lcm(6,8) = 24`
- (1) Periodicity, yellow box: `X(e^{jw}) = X(e^{j(w+2π)})`
- (2) Linearity: `x1[n] --F--> X1(e^{jw})` and `x2[n] --F--> X2(e^{jw})`
  yellow box: `a x1[n] + b x2[n]  --F-->  a X1(e^{jw}) + b X2(e^{jw})`

**Examples** — continuation of p.70 Example 2 (no new "Example" tag on this page). Final answer is the boxed combined `X(e^{jw})` above, plus the plots below.

**Homework** — none on this page.

**Figures**
- **Hand-drawn** ω-axis schematic of `X2(e^{jw})`: six up-arrows each labeled `(π)` at `-9π/4, -7π/4, -π/4, π/4, 7π/4, 9π/4`; `-2π` and `2π` marked as reference ticks; `...` on both ends.
- **Hand-drawn** ω-axis schematic of the combined `X(e^{jw})` (blue note "periodic by 2π"): tall arrows labeled `(2π)` at `-7π/3, -5π/3, -π/3, π/3, 5π/3, 7π/3` and shorter arrows labeled `(π)` at `-9π/4, -7π/4, -π/4, π/4, 7π/4, 9π/4`; axis labels in order `-7π/3, -9π/4, -2π, -7π/4, -5π/3 … -π/3, -π/4, 0, π/4, π/3 … 5π/3, 7π/4, 2π, 9π/4, 7π/3`; `...` on both ends.
- **MATLAB-generated**, 3×3 ("The FS coefficients and the DTFT of x[n] are plotted below:"):
  - Row 1: `x1[n] = 2cos(ω1 n)` (row y-label `ω1 = 5π/3`), stem, n ticks −30,−24,−18,−12,−6,0,6,12,18,24,30, y −2…2. Middle: `a_k` stem, k ticks −30…30, y 0…1, with red `N0=6` span arrow and a green circle at `k = 6`. Right: `X1(e^{jω})` impulse/stem plot, ω ∈ [−3π,3π] with ticks −3π,−2π,−π,−π/3,π/3,π,2π,3π, y 0…`2π`, red span arrow labeled `2π`.
  - Row 2: `x2[n] = cos(ω2 n)` (y-label `ω2 = 7π/4`), stem, n ticks −24,−16,−8,0,8,16,24, y −1…1. Middle: `a_k` stem, k ∈ [−24,24], y 0…0.5, red `N0=8` span arrow, green circle at `k = 8`. Right: `X2(e^{jω})`, ω ∈ [−3π,3π] with ticks −π/4, π/4, y 0…`π`.
  - Row 3: `x3[n] = x1[n] + x2[n]`, stem, n ticks −72,−48,−24,0,24,48,72, y −4…4. Middle: `a_k` stem, k ∈ [−30,30], y 0…1, red annotation `N0 = lcm(6,8) = 24` with span arrow, green circle at `k = 24`. Right: `X3(e^{jω})`, ω ∈ [−3π,3π], y 0…`2π`, mixed-height impulses (`2π` and `π`) drawn with dotted vertical guide lines throughout.

**Ambiguities**
- **A71-01**: The red period annotations `N0 = 2π/ω1 = (6/5) m → N0 = 6` and `= (8/7) m → N0 = 8` introduce an integer `m` that is never defined on the page (it is the smallest integer making `N0` an integer).
- **A71-02**: The `X3(e^{jω})` panel is drawn with dotted vertical guide lines at (apparently) every impulse position; at 160 dpi the `2π`-weight impulses cannot be reliably distinguished from the `π`-weight ones, and the impulse locations cannot be read off.
- **A71-03**: In the hand-drawn combined `X(e^{jw})` sketch, the axis labels `-7π/3, -9π/4, -2π, -7π/4, -5π/3` (and their mirror images) are crowded together and overlap the axis; the ordering is arithmetically correct but the association of each label with its arrow is hard to verify at this resolution.
- **A71-04**: Row 1 uses `ω1 = 5π/3` for the period computation while p.70 reduced the same signal to `cos((π/3)n)`; both give `N0 = 6`, but the page never notes that the reduced and unreduced frequencies must give the same period.
