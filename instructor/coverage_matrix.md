# Source-coverage matrix (all 88 pages)

Source: `Lecture Notes.pdf`. Artifact version v1.3.

`Destination scene` lists the artifact scene ids that carry the page content. Every entry names a scene
that exists in the build: the column is generated from the `src` field each scene declares, so it cannot
drift from the artifact without the artifact changing too. **No page is unmapped, and no page is mapped
to a scene that was never written.**

**There is no question column any more.** It held the ids of the retired question bank, whose questions
were written one per source page and carried a page in `src`. The exam drill that replaced it is not
written per page: a drill question is written against a skill, and its `src` names the examination paper
whose skill it is built on. There is no page a drill question maps to, so the column would have had
nothing truthful to put in it.

| PDF p. | Content | Module | Destination scene(s) | Status |
|---:|---|---|---|---|
| 1 | Cover | M0/M1 | title | included — Phase 1 |
| 2 | CH#1 Signals; Signal Energy and Power | M0/M1 | m0-signal, m0-ctdt, m0-map, m1-open, m1-def, m1-power, m1-energy-inf, m1-avgpower, m1-lab-b, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 3 | Energy/power classification; time shift; time reversal | M0/M1 | m0-map, m1-open, m1-classify, m1-classify-b, m1-ex-energy, m1-lab-b, m1-shift, m1-reverse-scale, m1-lab-a, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 4 | Time scaling; combination of operations | M0/M1 | m0-map, m1-open, m1-reverse-scale, m1-combined, m1-lab-a, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 5 | Periodicity; even & odd | M0/M1 | m0-map, m1-open, m1-periodic, m1-evenodd, m1-lab-c, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 6 | Even/odd decomposition; DT impulse and step | M0/M1 | m0-map, m1-open, m1-evenodd, m1-dt-impulse, m1-dt-sift, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 7 | DT sifting; CT impulse and step; CT complex exponentials | M0/M1 | m0-map, m1-open, m1-lab-b, m1-dt-sift, m1-ct-impulse, m1-ct-cexp, m1-ct-cexp-b, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 8 | Periodicity of CT complex exponentials; general complex exponentials | M0/M1 | m0-map, m1-open, m1-ct-cexp, m1-ct-cexp-b, m1-lab-c, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 9 | Damped/growing sinusoids; DT complex exponentials | M0/M1 | m0-map, m1-open, m1-ct-cexp, m1-ct-cexp-b, m1-dt-cexp, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 10 | DT exponential envelopes; DT periodicity condition | M0/M1 | m0-map, m1-open, m1-dt-cexp, m1-dt-period, m1-lab-c, m1-synth, m1-drill, end-synth, end-map | included — Phase 1 |
| 11 | Systems; memorylessness; invertibility | M2 | m0-system, m0-map, m2-open, m2-abstraction, m2-memory, m2-invertible, m2-workflow, m2-lab-d, m2-synth, m2-drill, end-synth, end-map | included — Phase 1 |
| 12 | Invertibility examples; causality; stability | M2 | m0-map, m2-open, m2-invertible, m2-causal, m2-stable, m2-workflow, m2-lab-d, m2-synth, m2-drill, end-synth, end-map | included — Phase 1 |
| 13 | Stability counterexample; time invariance | M2 | m0-map, m2-open, m2-stable, m2-ti, m2-ti-b, m2-workflow, m2-lab-d, m2-synth, m2-drill, end-synth, end-map | included — Phase 1 |
| 14 | Linearity; CH#2 LTI systems; impulse response | M3 | m0-map, m2-open, m2-linear, m2-workflow, m2-lab-d, m2-synth, m2-drill, m3-open, m3-impulse, m3-representation, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 15 | Representation property; convolution sum; first DT convolution example | M3 | m0-map, m3-open, m3-representation, m3-convsum, m3-steps, m3-ex-dt1, m3-ex-dt1-b, m3-lab-e, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 16 | Graphical superposition result; MATLAB homework; DT geometric-series example | M3 | m0-map, m1-lab-b, m3-open, m3-ex-dt1, m3-ex-dt1-b, m3-ex-dt2, m3-lab-e, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 17 | Geometric series result; CT convolution setup | M3 | m0-map, m1-lab-b, m3-open, m3-ex-dt2, m3-convint, m3-lab-e, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 18 | Convolution integral; CT convolution example 1 | M3 | m0-map, m1-lab-b, m3-open, m3-convint, m3-ex-ct1, m3-ex-ct1-b, m3-lab-e, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 19 | Summary/plots of example 1; CT convolution example 2 | M3 | m0-map, m3-open, m3-ex-ct1, m3-ex-ct1-b, m3-ex-ct2, m3-lab-e, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 20 | Example 2 remaining cases; LTI properties (1)–(3) | M3 | m0-map, m3-open, m3-ex-ct2, m3-lab-e, m3-props, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 21 | LTI properties (4)–(7) | M3 | m0-map, m2-lab-d, m3-open, m3-lti-props, m3-synth, m3-drill, end-synth, end-map | included — Phase 1 |
| 22 | CH#3 — FOURIER SERIES REPRESENTATION OF PERIODIC SIGNALS / "Eigenfunctions of  | M4 (Fourier series) | m0-map, m4-open, m4-eigen-ct, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 23 | (continuation of Eigenfunctions) / "Discrete-Time Case" / "Summary" | M4 (Fourier series) | m0-map, m4-open, m4-eigen-dt, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 24 | "Why is eigenfunction important?" + Example (time-delay LTI system) | M4 (Fourier series) | m0-map, m4-open, m4-eigen-why, m4-eigen-ex, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 25 | (Example part (b)) / FOURIER SERIES REPRESENTATION / "Existence of Fourier Ser | M4 (Fourier series) | m0-map, m4-open, m4-eigen-ex, m4-fs-exist, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 26 | Example ("PATHOLOGICAL SIGNALS") / FS synthesis equation / Example (x(t)=1+½co | M4 (Fourier series) | m0-map, m4-open, m4-fs-exist, m4-fs-synth, m4-period, m4-period-ex, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 27 | (continuation of the x(t)=1+½cos2πt+sin3πt example) + Homework (x(t)=3+5cos(10 | M4 (Fourier series) | m0-map, m4-open, m4-fs-synth, m4-period, m4-period-ex, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 28 | CT FOURIER SERIES COEFFICIENTS | M4 (Fourier series) | m0-map, m4-open, m4-fs-coef, m4-fs-proof, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 29 | "DC Term" + Example ("PERIODIC RECTANGULAR WAVE") | M4 (Fourier series) | m0-map, m4-open, m4-dc, m4-rect, m4-rect-sample, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 30 | "How many Fourier Series coefficients are sufficient?" (MSE, Gibbs) + Homework | M4 (Fourier series) | m0-map, m4-open, m4-howmany, m4-saw, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 31 | (sawtooth solution continued) + Example ("PERIODIC IMPULSE TRAIN") + DT FOURIE | M4 (Fourier series) | m0-map, m4-open, m4-saw, m4-saw-b, m4-imptrain, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 32 | DT FOURIER SERIES: Theorem + periodicity proof + Example (x | M4 (Fourier series) | m0-map, m4-open, m4-dtfs, m4-dtfs-ex, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 33 | Example ("DT periodic square wave") | M4 (Fourier series) | m0-map, m4-open, m4-dt-square, m4-dt-square-b, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 34 | (DT square wave, FS representation and MSE) + Homework (DT sawtooth, N = 11) | M4 (Fourier series) | m0-map, m4-open, m4-dt-square-b, m4-dt-saw, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 35 | (DT sawtooth reconstruction figure) + PROPERTIES OF FOURIER SERIES COEFFICIENT | M4 (Fourier series) | m0-map, m4-open, m4-dt-saw, m4-props-1, m4-lab-f, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 36 | PROPERTIES: (3) Time-Reversal, (4) Conjugation, (5) Multiplication | M4 (Fourier series) | m0-map, m4-open, m4-props-2, m4-props-mult, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 37 | (6) Parseval's Relation / "Summary of the Properties" (Tables 1 and 2) / FOURI | M4 (Fourier series) | m0-map, m4-open, m4-props-mult, m4-parseval, m4-lti, m4-lab-g, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 38 | (FS and LTI systems, continued) + Example ("CT LOW-PASS FILTERING") | M4 (Fourier series) | m0-map, m4-open, m4-lti, m4-pairing, m4-lpf, m4-lab-g, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 39 | (continuation of CT LOW-PASS FILTERING example, CH#3 Fourier Series / LTI filt | M4 (Fourier series) | m0-map, m4-open, m4-lpf, m4-hpf, m4-lab-g, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 40 | (Sol. of CT HIGH-PASS FILTERING homework) + Example: DT HIGH-PASS FILTERING | M4 (Fourier series) | m0-map, m4-open, m4-hpf, m4-dt-filt, m4-lab-g, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 41 | (DT HIGH-PASS FILTERING, cont.) + Homework: DT LOW-PASS FILTERING and its solu | M4 (Fourier series) | m0-map, m4-open, m4-dt-filt, m4-dt-filt-b, m4-lab-g, m4-drill, m4-synth, end-synth, end-map | included — Phase 2 |
| 42 | CH#4 — CONTINUOUS-TIME FOURIER TRANSFORM | M5 (CTFT) | m0-map, m5-open, m5-derive-1, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 43 | Derivation of the Fourier Transform (STEP 1 / STEP 2 / STEP 3) | M5 (CTFT) | m0-map, m5-open, m5-derive-1, m5-derive-2, m5-derive-3, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 44 | Graphical conversion of Σ to ∫; Analysis/Synthesis equations; Example: FT of a | M5 (CTFT) | m0-map, m5-open, m5-derive-3, m5-pair, m5-exist, m5-limit, m5-ex-delta, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 45 | Example: inverse FT of `2πδ(ω-ω_0)`; Example: FT of `e^{-at}u(t)`; Homework: F | M5 (CTFT) | m0-map, m5-open, m5-limit, m5-ex-expw, m5-ex-exp, m5-ex-exp-phase, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 46 | (Homework solution cont.: FT of `e^{-a/t/}`) + Example: FT of the rectangular  | M5 (CTFT) | m0-map, m5-open, m5-ex-twosided, m5-rect-sinc, m5-rect-zeros, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 47 | sinc(·) definitions; FT pair for the rectangular pulse; Example: inverse FT of | M5 (CTFT) | m0-map, m5-open, m5-rect-sinc, m5-rect-zeros, m5-sinc-rect, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 48 | FT pair for the sinc/ideal LPF; Inverse Relationship Between Time and Frequenc | M5 (CTFT) | m0-map, m5-open, m5-sinc-rect, m5-inverse-rel, m5-bandlimit, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 49 | THE FOURIER TRANSFORM FOR PERIODIC SIGNALS; Example: FT of the periodic square | M5 (CTFT) | m0-map, m5-open, m5-periodic, m5-ex-square, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 50 | Example: FT of a sinusoid sum; cos/sin FT pairs; Example: FT of the impulse tr | M5 (CTFT) | m0-map, m5-open, m5-ex-sinus, m5-ex-sinus-b, m5-ex-imptrain, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 51 | PROPERTIES OF THE CONTINUOUS-TIME FOURIER TRANSFORM: (1) Linearity, (2) Time-S | M5 (CTFT) | m0-map, m5-open, m5-props-1, m5-props-shift-ex, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 52 | Properties (3) Frequency-Shift, (4) Conjugation; Example: frequency-shifted si | M5 (CTFT) | m0-map, m5-open, m5-props-freq, m5-props-conj, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 53 | real-and-odd symmetry; (5) Differentiation Property; (6) Time Scaling; Example | M5 (CTFT) | m0-map, m5-open, m5-props-conj, m5-props-diff, m5-props-scale, m5-props-scale-ex, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 54 | Property (7) Duality; Example (rect ↔ sinc dual); Homework: dual of the sinc | M5 (CTFT) | m0-map, m5-open, m5-duality, m5-duality-ex, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 55 | Example: δ(t)/constant dual pair; (8) Parseval's Relation; Example: energy via | M5 (CTFT) | m0-map, m5-open, m5-duality-ex, m5-parseval, m5-parseval-ex, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 56 |  | M5 (CTFT) | m0-map, m5-open, m5-conv, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 57 | Example: LTI system with two one-sided exponentials | M5 (CTFT) | m0-map, m5-open, m5-conv-ex, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 58 | Example: ideal-LPF cascade of sincs + Homework (figure-only) + "(10) Multiplic | M5 (CTFT) | m0-map, m5-open, m5-conv-lpf, m5-mult, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 59 | Example: AMPLITUDE MODULATION / DOUBLE SIDEBAND SUPPRESSED CARRIER (DSB-SC) +  | M5 (CTFT) | m0-map, m5-open, m5-am, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 60 | Example: sinc × cosine modulation + Homework (solved): 2·sinc·cos modulated ag | M5 (CTFT) | m0-map, m5-open, m5-am-sinc, m5-am-overlap, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 61 | Homework ×2: multiplication of two sincs (equal and unequal bandwidths) + "CON | M5 (CTFT) | m0-map, m5-open, m5-sinc2, m5-lab-h, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 62 | "Summary of the Properties:" (printed Table 3 & Table 4) + "SYSTEM ANALYSIS US | M5 (CTFT) | m0-map, m5-open, m5-tables, m5-diffeq, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 63 | Example ×2: differential equation → H(jw), h(t); and repeated-pole partial fra | M5 (CTFT) | m0-map, m5-open, m5-diffeq-ex, m5-partial, m5-diffeq-b, m5-diffeq-b2, m5-drill, m5-synth, end-synth, end-map | included — Phase 2 |
| 64 | "CH#5 — DISCRETE-TIME FOURIER TRANSFORM" / "Derivation of the Discrete-Time Fo | M6 (DTFT) | m0-map, m6-open, m6-derive, m6-dtfs-link, m6-limit, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 65 | DTFT / inverse-DTFT pair; "Periodicity of DTFT:"; Example: DTFT of a shifted u | M6 (DTFT) | m0-map, m6-open, m6-limit, m6-pair, m6-periodic, m6-ex-shift, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 66 | Example: DTFT of `a^n u | M6 (DTFT) | m0-map, m6-open, m6-ex-anun, m6-ex-anun-b, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 67 |  | M6 (DTFT) | m0-map, m6-open, m6-ex-anun-b, m6-ex-absn, m6-ex-rect, m6-ex-rect-b, m6-real-phase, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 68 | Example: inverse DTFT of an ideal DT low-pass spectrum + "DTFT FOR PERIODIC SI | M6 (DTFT) | m0-map, m6-open, m6-ex-lpf, m6-cexp, m6-dt-periodic, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 69 |  | M6 (DTFT) | m0-map, m6-open, m6-dt-periodic, m6-sqwave, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 70 | Example: DTFT of the DT impulse train + Example: DTFT of `2cos((5π/3)n) + cos( | M6 (DTFT) | m0-map, m6-open, m6-ex-imptrain, m6-ex-cos, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 71 |  | M6 (DTFT) | m0-map, m6-open, m6-ex-cos, m6-ex-cos-b, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 72 | DTFT Properties, items (3) Time-Shift, (4) Frequency-Shift, (5) Conjugation, ( | M6 (DTFT) | m0-map, m6-open, m6-props-1, m6-props-2, m6-expansion, m6-expansion-b, m6-props-3, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 73 | DTFT Properties, items (9) Differentiation in Frequency, (10) Parseval's Relat | M6 (DTFT) | m0-map, m6-open, m6-props-2, m6-props-3, m6-parseval, m6-conv, m6-conv-ex, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 74 | `Example` (ideal-lowpass sinc convolution via DTFT) and `Homework` (sum of two | M6 (DTFT) | m0-map, m6-open, m6-conv-lpf, m6-conv-lpf-b, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 75 | DTFT Properties, item (12) Multiplication Property; `Example` (DTFT of the pro | M6 (DTFT) | m0-map, m6-open, m6-mult, m6-mult-b, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 76 | `Homework` (DTFT of products, two cases) and "Summary of the Properties" (prin | M6 (DTFT) | m0-map, m6-open, m6-mult, m6-mult-b, m6-mult-ex, m6-tables, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 77 | "DUALITY" (duality in the DFS; duality between DTFT and CTFS); printed TABLE 5 | M6 (DTFT) | m0-map, m6-open, m6-duality, m6-freqresp, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 78 | Frequency response from a difference equation; `Example` (causal 2nd-order dif | M6 (DTFT) | m0-map, m6-open, m6-freqresp, m6-ex-diff, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 79 | `Example` (output of the p.78 system for `x | M6 (DTFT) | m0-map, m6-open, m6-ex-pair, m6-ex-diff-b, m6-lab-i, m6-drill, m6-synth, end-synth, end-map | included — Phase 2 |
| 80 | **CH#7 — SAMPLING THEOREM**: Impulse-Train Sampling; Frequency Domain Analysis | M7 (Sampling) | m0-map, m7-open, m7-sampler, m7-freq, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 81 | Derivation of `X_p(jw)`; oversampling / Nyquist-rate / undersampling spectra;  | M7 (Sampling) | m0-map, m7-open, m7-rates, m7-freq, m7-replicas, m7-three, m7-aliasing, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 82 | "Sampling Theorem" statement; `Example` (MATLAB T1/T2/T3 sampling illustration | M7 (Sampling) | m0-map, m7-open, m7-theorem, m7-boundary, m7-ex-rates, m7-ex-73a, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 83 | Example 7.3 parts (b) and (c); new section "Reconstruction of a Signal From It | M7 (Sampling) | m0-map, m7-open, m7-ex-73b, m7-ex-73c, m7-recon, m7-zoh, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 84 | `Example` (ZERO-ORDER HOLD, MATLAB); new section "First-Order Hold (FOH)" — no | M7 (Sampling) | m0-map, m7-open, m7-zoh, m7-foh, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 85 | `Example` (FIRST-ORDER HOLD, MATLAB); "Perfect Reconstruction" / band-limited  | M7 (Sampling) | m0-map, m7-open, m7-interp, m7-perfect, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 86 | `Example` (BAND-LIMITED INTERPOLATION, MATLAB); "Aliasing:" with three samplin | M7 (Sampling) | m0-map, m7-open, m7-interp, m7-alias-cos, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 87 | `Example` (aliasing of `cos(2πt)` at three rates) and `Homework` (aliasing of  | M7 (Sampling) | m0-map, m7-open, m7-ex-alias, m7-hw-alias, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |
| 88 | "Anti-Aliasing Filter:", "Temporal Aliasing:", "Spatial Aliasing:" — red box:  | M7 (Sampling) | m0-map, m7-open, m7-antialias, m7-temporal, m7-spatial, m7-lab-j, m7-drill, m7-synth, end-synth, end-map | included — Phase 2 |

**Unmapped pages: none (88 / 88).**
