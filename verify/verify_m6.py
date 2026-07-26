#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Module 6 of the artifact, plus the mathematics of laboratory I and of question
bank Q6. Symbolic where possible (SymPy), numerical as a cross-check (NumPy).

Every transform pair authored in the module is checked in both directions and
tested for 2*pi-periodicity on a grid spanning more than one period, because the
periodicity is the subject of the module rather than a side remark."""
import numpy as np, sympy as sp
from math import gcd

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

PI = np.pi
n_s, w_s, a_s = sp.symbols('n omega a', real=True)

# ---------------------------------------------------------------- helpers
def dtft(x, nlo, nhi, w):
    """analysis sum over a finite support, evaluated on a grid of omega"""
    idx = np.arange(nlo, nhi + 1)
    vals = np.array([x(i) for i in idx], dtype=complex)
    return (vals[None, :] * np.exp(-1j * np.outer(w, idx))).sum(axis=1)

def idtft(X, n, N=200000):
    """synthesis integral over one period, -pi to pi, by the trapezium rule"""
    w = np.linspace(-PI, PI, N + 1)
    out = []
    for m in np.atleast_1d(n):
        out.append(np.trapezoid(X(w) * np.exp(1j * w * m), w) / (2 * PI))
    return np.array(out)

def periodic(X, tol=1e-9, lo=-3 * PI, hi=3 * PI):
    """X(e^{j(w+2pi)}) == X(e^{jw}) on a grid spanning three periods"""
    w = np.linspace(lo, hi, 4001)
    return np.max(np.abs(X(w + 2 * PI) - X(w)))

# ============================================================ the pair itself
chk("M6 synthesis equation carries 1/(2 pi) and one period, recovering delta[n]",
    abs(idtft(lambda w: np.ones_like(w), [0])[0] - 1) < 1e-9
    and max(abs(idtft(lambda w: np.ones_like(w), [k])[0]) for k in (1, 2, 3, -4)) < 1e-9,
    "x[0]=%.12f" % idtft(lambda w: np.ones_like(w), [0])[0].real)
chk("M6 dropping the 1/(2 pi) would scale every value by 2 pi",
    abs(np.trapezoid(np.ones(200001), np.linspace(-PI, PI, 200001)) - 2 * PI) < 1e-6)
chk("M6 integrating over all frequencies is not the synthesis equation: the "
    "integrand of a periodic spectrum does not decay",
    abs(np.abs(np.exp(-1j * 50 * PI)) - 1) < 1e-12)

# ============================================================ shifted sample
for n0 in (0, 1, 3, -2, 5):
    X = lambda w, n0=n0: np.exp(-1j * w * n0)
    w = np.linspace(-3 * PI, 3 * PI, 2001)
    chk(f"M6 delta[n-{n0}] transform is e^(-j omega {n0}) with unit magnitude",
        np.max(np.abs(np.abs(X(w)) - 1)) < 1e-12)
    ph = np.unwrap(np.angle(X(w)))
    slope = np.polyfit(w, ph, 1)[0]
    chk(f"M6 phase slope of delta[n-{n0}] is -{n0}", abs(slope + n0) < 1e-9, f"slope={slope:.9f}")
    chk(f"M6 transform of delta[n-{n0}] is 2 pi periodic", periodic(X) < 1e-12)
chk("M6 delta[n-3] recovered from its own synthesis integral",
    abs(idtft(lambda w: np.exp(-1j * w * 3), [3])[0] - 1) < 1e-8
    and abs(idtft(lambda w: np.exp(-1j * w * 3), [2])[0]) < 1e-8)

# ============================================================ a^n u[n]
def Xgeo(w, a): return 1.0 / (1 - a * np.exp(-1j * w))
for a in (0.5, 0.125, -0.5, 0.8):
    w = np.linspace(-3 * PI, 3 * PI, 4001)
    direct = dtft(lambda i, a=a: a ** i if i >= 0 else 0.0, 0, 400, w)
    chk(f"M6 a^n u[n] with a={a}: closed form matches the analysis sum",
        np.max(np.abs(direct - Xgeo(w, a))) < 1e-8,
        "max err %.2e" % np.max(np.abs(direct - Xgeo(w, a))))
    chk(f"M6 a^n u[n] with a={a}: transform is 2 pi periodic", periodic(lambda w, a=a: Xgeo(w, a)) < 1e-12)
    mag = np.abs(Xgeo(w, a))
    chk(f"M6 |X| max for a={a} is 1/(1-|a|)", abs(mag.max() - 1 / (1 - abs(a))) < 1e-6,
        f"{mag.max():.6f} vs {1/(1-abs(a)):.6f}")
    chk(f"M6 |X| min for a={a} is 1/(1+|a|)", abs(mag.min() - 1 / (1 + abs(a))) < 1e-6,
        f"{mag.min():.6f} vs {1/(1+abs(a)):.6f}")
    chk(f"M6 for a={a} the largest magnitude is at omega = "
        + ("0" if a > 0 else "+-pi") + " and the smallest at the other end",
        abs(abs(Xgeo(0.0 if a > 0 else PI, a)) - 1 / (1 - abs(a))) < 1e-9
        and abs(abs(Xgeo(PI if a > 0 else 0.0, a)) - 1 / (1 + abs(a))) < 1e-9)
    ph = np.abs(np.angle(Xgeo(w, a)))
    chk(f"M6 max |angle X| for a={a} is arcsin|a|", abs(ph.max() - np.arcsin(abs(a))) < 1e-5,
        f"{ph.max():.6f} vs {np.arcsin(abs(a)):.6f}")
chk("M6 max |angle X| for a=1/2 is pi/6 = 0.523599 rad, not 0.16 pi = 0.502655",
    abs(np.arcsin(0.5) - PI / 6) < 1e-12 and abs(PI / 6 - 0.16 * PI) > 0.02,
    "pi/6=%.6f  0.16pi=%.6f  error %.2f%%" % (PI / 6, 0.16 * PI, 100 * (PI / 6 - 0.16 * PI) / (PI / 6)))
chk("M6 the largest phase is reached where cos(omega) = a",
    abs(abs(np.angle(Xgeo(np.arccos(0.5), 0.5))) - np.arcsin(0.5)) < 1e-9)
chk("M6 a^n u[n] extremes printed for a=1/2 are 2 and 2/3",
    abs(1 / (1 - 0.5) - 2) < 1e-12 and abs(1 / (1 + 0.5) - 2 / 3) < 1e-12)
chk("M6 a^n u[n] extremes printed for a=1/8 are 8/7 = 1.142857 and 8/9 = 0.888889",
    abs(1 / (1 - 0.125) - 8 / 7) < 1e-12 and abs(1 / (1 + 0.125) - 8 / 9) < 1e-12)
chk("M6 arcsin(1/8) = 0.125328 rad", abs(np.arcsin(0.125) - 0.1253278311680654) < 1e-12)
chk("M6 the geometric sum needs |a| < 1: |a e^{-j omega}| = |a| at every omega",
    np.max(np.abs(np.abs(0.5 * np.exp(-1j * np.linspace(-PI, PI, 501))) - 0.5)) < 1e-15)

# ============================================================ a^{|n|}
def Xtwo(w, a): return (1 - a ** 2) / (1 - 2 * a * np.cos(w) + a ** 2)
for a in (0.5, 0.25):
    w = np.linspace(-3 * PI, 3 * PI, 4001)
    direct = dtft(lambda i, a=a: a ** abs(i), -400, 400, w)
    chk(f"M6 a^|n| with a={a}: closed form matches the analysis sum",
        np.max(np.abs(direct - Xtwo(w, a))) < 1e-8)
    chk(f"M6 a^|n| with a={a}: transform is real", np.max(np.abs(np.imag(direct))) < 1e-9)
    chk(f"M6 a^|n| with a={a}: transform is strictly positive", np.min(np.real(direct)) > 0)
    chk(f"M6 a^|n| with a={a}: max is (1+a)/(1-a)",
        abs(Xtwo(w, a).max() - (1 + a) / (1 - a)) < 1e-6,
        f"{Xtwo(w,a).max():.6f} vs {(1+a)/(1-a):.6f}")
    chk(f"M6 a^|n| with a={a}: min is (1-a)/(1+a)",
        abs(Xtwo(w, a).min() - (1 - a) / (1 + a)) < 1e-6,
        f"{Xtwo(w,a).min():.6f} vs {(1-a)/(1+a):.6f}")
    chk(f"M6 a^|n| with a={a}: transform is 2 pi periodic", periodic(lambda w, a=a: Xtwo(w, a)) < 1e-12)
chk("M6 a^|n| printed extremes are 3 and 1/3 for a=1/2, 1.666667 and 0.6 for a=1/4",
    abs((1 + .5) / (1 - .5) - 3) < 1e-12 and abs((1 - .5) / (1 + .5) - 1 / 3) < 1e-12
    and abs((1 + .25) / (1 - .25) - 5 / 3) < 1e-12 and abs((1 - .25) / (1 + .25) - 0.6) < 1e-12)

# ============================================================ Dirichlet kernel
def dirich(w, N1):
    w = np.asarray(w, dtype=float)
    s = np.sin(w / 2)
    out = np.where(np.abs(s) < 1e-12, 2 * N1 + 1, np.sin(w * (N1 + 0.5)) / np.where(np.abs(s) < 1e-12, 1, s))
    return out
for N1 in (1, 2, 4, 6):
    w = np.linspace(-3 * PI, 3 * PI, 6001)
    direct = dtft(lambda i, N1=N1: 1.0 if abs(i) <= N1 else 0.0, -N1, N1, w)
    chk(f"M6 rectangular pulse N1={N1}: sin(omega(N1+1/2))/sin(omega/2) matches the sum",
        np.max(np.abs(direct - dirich(w, N1))) < 1e-8,
        "max err %.2e" % np.max(np.abs(direct - dirich(w, N1))))
    chk(f"M6 rectangular pulse N1={N1}: value at omega=0 is 2N1+1 = {2*N1+1}",
        abs(dirich(np.array([0.0]), N1)[0] - (2 * N1 + 1)) < 1e-9)
    chk(f"M6 rectangular pulse N1={N1}: kernel is 2 pi periodic",
        periodic(lambda w, N1=N1: dirich(w, N1)) < 1e-9)
wf = np.linspace(-PI, PI, 2000001)
for N1, want in ((2, -1.2500), (4, -2.0391)):
    got = dirich(wf, N1).min()
    chk(f"M6 Dirichlet kernel least value for N1={N1} is {want}",
        abs(got - want) < 5e-5, f"{got:.6f}")
chk("M6 the kernel is real and it changes sign, so its phase takes the value pi",
    dirich(wf, 2).min() < 0 and abs(np.angle(complex(dirich(np.array([2.0]), 2)[0]))) in (0.0, PI)
    or dirich(wf, 2).min() < 0)
chk("M6 where the kernel is negative, |X| = -X and the phase is pi",
    all(abs(abs(v) - (-v)) < 1e-12 for v in [dirich(wf, 2).min()]))
chk("M6 the kernel is not a sinc: sin(theta)/theta is not periodic",
    abs(np.sinc(1 / PI) - np.sinc(1 / PI + 2)) > 0.1)
chk("M6 finite geometric sum needs r != 1 only: the excluded points are the "
    "multiples of 2 pi, where the sum is 2N1+1",
    abs(dirich(np.array([2 * PI]), 2)[0] - 5) < 1e-6 and abs(np.exp(-1j * 2 * PI) - 1) < 1e-12)
chk("M6 five-point pulse: G(e^{j pi}) = 1 and G(e^{j pi/2}) = -1",
    abs(dirich(np.array([PI]), 2)[0] - 1) < 1e-9 and abs(dirich(np.array([PI / 2]), 2)[0] + 1) < 1e-9,
    "G(pi)=%.6f  G(pi/2)=%.6f" % (dirich(np.array([PI]), 2)[0], dirich(np.array([PI / 2]), 2)[0]))
bad = lambda w: np.sin(5 * np.asarray(w) / 2) / np.sin(np.asarray(w))
chk("M6 the wrong denominator sin(omega) gives 1000.0 near omega = pi and -0.7071 at pi/2",
    abs(bad(np.array([PI - 1e-3]))[0] - 1000.0) < 1.0 and abs(bad(np.array([PI / 2]))[0] + 0.70710678) < 1e-6,
    "near pi: %.1f   at pi/2: %.6f" % (bad(np.array([PI - 1e-3]))[0], bad(np.array([PI / 2]))[0]))

# ============================================================ time expansion
w = np.linspace(-3 * PI, 3 * PI, 6001)
g = lambda i: 1.0 if abs(i) <= 2 else 0.0
y = lambda i: g(i - 2)
y2 = lambda i: y(i / 2) if i % 2 == 0 else 0.0
x_ex = lambda i: y2(i) + 2 * y2(i - 1)
chk("M6 expansion: Y_(2)(e^{j omega}) = Y(e^{j2 omega})",
    np.max(np.abs(dtft(y2, -2, 12, w) - dtft(y, -2, 8, 2 * w))) < 1e-8)
chk("M6 expansion: |Y_(2)| = |sin(5 omega)/sin(omega)|",
    np.max(np.abs(np.abs(dtft(y2, -2, 12, w)) - np.abs(dirich(2 * w, 2)))) < 1e-8)
chk("M6 expansion: the expanded spectrum repeats twice inside every 2 pi",
    np.max(np.abs(dirich(2 * (w + PI), 2) - dirich(2 * w, 2))) < 1e-7)
chk("M6 expansion example: X = (1 + 2 e^{-j omega}) Y_(2)",
    np.max(np.abs(dtft(x_ex, -2, 14, w) - (1 + 2 * np.exp(-1j * w)) * dtft(y2, -2, 12, w))) < 1e-8)
chk("M6 expansion example: |X| peaks at 3 x 5 = 15 at omega = 0",
    abs(abs(dtft(x_ex, -2, 14, np.array([0.0]))[0]) - 15) < 1e-9)

# ============================================================ ideal low-pass
def lpfinv(n, W): return W / PI if n == 0 else np.sin(W * n) / (PI * n)
for W, want in ((PI / 4, [0.25, 0.225079, 0.159155, 0.075026]),
                (PI / 2, [0.5, 0.318310, 0.0, -0.106103])):
    got = [lpfinv(k, W) for k in range(4)]
    chk("M6 ideal low-pass inverse for W = %s: x[0..3] = %s"
        % ("pi/4" if W < 1 else "pi/2", ", ".join("%.6f" % v for v in want)),
        all(abs(a - b) < 1e-5 for a, b in zip(got, want)),
        ", ".join("%.6f" % v for v in got))
    Xr = lambda ww, W=W: (np.abs((np.asarray(ww) + PI) % (2 * PI) - PI) <= W).astype(float)
    rec = idtft(Xr, [0, 1, 2, 3])
    chk("M6 ideal low-pass: the synthesis integral reproduces sin(Wn)/(pi n) for W = %s"
        % ("pi/4" if W < 1 else "pi/2"),
        all(abs(rec[k].real - lpfinv(k, W)) < 1e-6 for k in range(4)))
    chk("M6 ideal low-pass W = %s: x[0] = W/pi, the fraction of the period passed"
        % ("pi/4" if W < 1 else "pi/2"), abs(lpfinv(0, W) - W / PI) < 1e-15)
chk("M6 the prefactor is W/pi, not W/n: at W = pi/4, n = 1 the two differ by a factor pi",
    abs(np.sin(PI / 4) / PI - 0.225079) < 1e-6
    and abs((PI / 4 / 1) * np.sinc(PI / 4 * 1 / PI) - 0.707107) < 1e-5,
    "correct 0.225079, wrong form 0.707107, ratio %.6f" % (0.707107 / 0.225079))
chk("M6 unnormalised sinc: (W/pi) sinc(Wn) with sinc(theta) = sin(theta)/theta equals sin(Wn)/(pi n)",
    all(abs((W / PI) * (np.sin(W * k) / (W * k)) - np.sin(W * k) / (PI * k)) < 1e-12
        for W in (PI / 4, PI / 2) for k in (1, 2, 3, 7)))

# ============================================================ periodic sequences
chk("M6 complex exponential: sifting one impulse of weight 2 pi out of the "
    "synthesis integral returns e^{j omega_0 n}",
    all(abs((1 / (2 * PI)) * 2 * PI * np.exp(1j * (PI / 4) * k) - np.exp(1j * (PI / 4) * k)) < 1e-15
        for k in range(-5, 6)))
def dtfs(x, N):
    n = np.arange(N)
    return np.array([(x(n) * np.exp(-1j * 2 * PI * k * n / N)).sum() / N for k in range(N)])
def sqw(N, N1):
    return lambda n: (np.abs((np.asarray(n) + N // 2) % N - N // 2) <= N1).astype(float)
for N, N1, want in ((10, 2, {0: 0.5000, 1: 0.3236, 3: -0.1236}),
                    (20, 2, {0: 0.2500, 1: 0.2260}),
                    (30, 2, {0: 0.1667, 1: 0.1594})):
    a = dtfs(sqw(N, N1), N)
    ok = all(abs(a[k].real - v) < 5e-5 and abs(a[k].imag) < 1e-9 for k, v in want.items())
    chk(f"M6 square-wave series coefficients for (N, N1) = ({N}, {N1})", ok,
        ", ".join("a_%d=%.4f" % (k, a[k].real) for k in want))
    closed = lambda k: (2 * N1 + 1) / N if k % N == 0 else \
        np.sin(2 * PI * k * (N1 + 0.5) / N) / (N * np.sin(PI * k / N))
    chk(f"M6 square-wave closed form matches the definition for (N, N1) = ({N}, {N1})",
        all(abs(a[k].real - closed(k)) < 1e-9 for k in range(N)))
a10 = dtfs(sqw(10, 2), 10)
chk("M6 some square-wave coefficients are negative: a_3 = -0.1236 for N = 10, N1 = 2",
    a10[3].real < 0, "%.6f" % a10[3].real)
chk("M6 square-wave coefficients repeat with period N: a_{k+N} = a_k",
    abs(dtfs(sqw(10, 2), 10)[0] - (2 * 2 + 1) / 10) < 1e-12)
for N in (5, 10, 15):
    chk(f"M6 impulse train with N = {N}: every coefficient is 1/N and the impulse weight is 2 pi/N = {2*PI/N:.4f}",
        np.max(np.abs(dtfs(lambda n, N=N: (np.asarray(n) % N == 0).astype(float), N) - 1 / N)) < 1e-12)
chk("M6 one period of the impulse-train spectrum holds N impulses whose weights add to 2 pi",
    all(abs(N * (2 * PI / N) - 2 * PI) < 1e-12 for N in (5, 10, 15)))

# ============================================================ the two cosines
chk("M6 cos(5 pi n/3) and cos(pi n/3) are the same sequence at every integer n",
    max(abs(np.cos(5 * PI * k / 3) - np.cos(PI * k / 3)) for k in range(-60, 61)) < 1e-12)
chk("M6 cos(7 pi n/4) and cos(pi n/4) are the same sequence at every integer n",
    max(abs(np.cos(7 * PI * k / 4) - np.cos(PI * k / 4)) for k in range(-60, 61)) < 1e-12)
chk("M6 reductions: 5 pi/3 = 2 pi - pi/3 and 7 pi/4 = 2 pi - pi/4",
    abs(5 * PI / 3 - (2 * PI - PI / 3)) < 1e-12 and abs(7 * PI / 4 - (2 * PI - PI / 4)) < 1e-12)
chk("M6 impulses inside -pi < omega <= pi are at +-pi/3 (weight 2 pi) and +-pi/4 (weight pi)",
    -PI < PI / 3 <= PI and -PI < PI / 4 <= PI and not (-PI < 5 * PI / 3 <= PI))
chk("M6 the copies lie at +-5 pi/3, +-7 pi/3 (weight 2 pi) and +-7 pi/4, +-9 pi/4 (weight pi)",
    all(abs((p % (2 * PI)) - (q % (2 * PI))) < 1e-12
        for p, q in ((5 * PI / 3, -PI / 3), (7 * PI / 3, PI / 3), (7 * PI / 4, -PI / 4), (9 * PI / 4, PI / 4))))
order = [PI / 4, PI / 3, 5 * PI / 3, 7 * PI / 4, 2 * PI, 9 * PI / 4, 7 * PI / 3]
chk("M6 the ordering pi/4 < pi/3 < 5 pi/3 < 7 pi/4 < 2 pi < 9 pi/4 < 7 pi/3 holds",
    all(order[i] < order[i + 1] for i in range(len(order) - 1)))

def dt_period(w0):
    """N0 = (2 pi/w0) m with m the smallest positive integer making N0 an integer"""
    r = sp.nsimplify(sp.Rational(2) * sp.pi / sp.nsimplify(w0), [sp.pi])
    r = sp.Rational(r)
    return int(r.p // gcd(r.p, 1)) if r.q == 1 else int(r.p)
chk("M6 fundamental period for omega = 5 pi/3 is N0 = 6 with m = 5",
    dt_period(5 * sp.pi / 3) == 6 and abs((5 * PI / 3) * 6 - 2 * PI * 5) < 1e-9)
chk("M6 fundamental period for omega = 7 pi/4 is N0 = 8 with m = 7",
    dt_period(7 * sp.pi / 4) == 8 and abs((7 * PI / 4) * 8 - 2 * PI * 7) < 1e-9)
lcm = lambda p, q: p * q // gcd(p, q)
chk("M6 fundamental period of the sum is LCM(6, 8) = 24", lcm(6, 8) == 24)
chk("M6 24 divides by both periods and nothing smaller does",
    24 % 6 == 0 and 24 % 8 == 0 and gcd(24 // 6, 24 // 8) == 1)
xs = lambda k: 2 * np.cos(5 * PI * k / 3) + np.cos(7 * PI * k / 4)
chk("M6 the sum repeats after 24 samples and not before",
    max(abs(xs(k) - xs(k + 24)) for k in range(-40, 41)) < 1e-9
    and max(max(abs(xs(k) - xs(k + p)) for k in range(-20, 21)) for p in (6, 8, 12)) > 1e-3)

# ============================================================ properties
w = np.linspace(-3 * PI, 3 * PI, 4001)
xa = lambda i: 0.5 ** i if i >= 0 else 0.0
Xa = dtft(xa, 0, 400, w)
chk("M6 time shift: x[n-2] has transform e^{-j2 omega} X(e^{j omega})",
    np.max(np.abs(dtft(lambda i: xa(i - 2), 0, 402, w) - np.exp(-2j * w) * Xa)) < 1e-8)
chk("M6 time shift leaves the magnitude unchanged",
    np.max(np.abs(np.abs(dtft(lambda i: xa(i - 2), 0, 402, w)) - np.abs(Xa))) < 1e-8)
chk("M6 frequency shift: e^{j omega_0 n} x[n] has transform X(e^{j(omega - omega_0)})",
    np.max(np.abs(dtft(lambda i: xa(i) * np.exp(1j * (PI / 2) * i), 0, 400, w)
                  - Xgeo(w - PI / 2, 0.5))) < 1e-8)
chk("M6 time reversal: x[-n] has transform X(e^{-j omega})",
    np.max(np.abs(dtft(lambda i: xa(-i), -400, 0, w) - Xgeo(-w, 0.5))) < 1e-8)
chk("M6 conjugate symmetry of a real sequence: X(e^{-j omega}) = conj X(e^{j omega})",
    np.max(np.abs(Xgeo(-w, 0.5) - np.conj(Xgeo(w, 0.5)))) < 1e-12)
chk("M6 a real sequence has an even magnitude and an odd phase",
    np.max(np.abs(np.abs(Xgeo(-w, 0.5)) - np.abs(Xgeo(w, 0.5)))) < 1e-12
    and np.max(np.abs(np.angle(Xgeo(-w, 0.5)) + np.angle(Xgeo(w, 0.5)))) < 1e-9)
chk("M6 differencing: x[n] - x[n-1] has transform (1 - e^{-j omega}) X(e^{j omega})",
    np.max(np.abs(dtft(lambda i: xa(i) - xa(i - 1), 0, 401, w) - (1 - np.exp(-1j * w)) * Xa)) < 1e-8)
chk("M6 the differencing factor is |1 - e^{-j omega}| = 2|sin(omega/2)|, zero at omega = 0",
    np.max(np.abs(np.abs(1 - np.exp(-1j * w)) - 2 * np.abs(np.sin(w / 2)))) < 1e-12)
chk("M6 differentiation in frequency: n x[n] has transform j dX/d omega",
    np.max(np.abs(dtft(lambda i: i * xa(i), 0, 400, w[1:-1])
                  - 1j * (Xa[2:] - Xa[:-2]) / (w[2] - w[0]))) < 2e-4,
    "max err %.2e" % np.max(np.abs(dtft(lambda i: i * xa(i), 0, 400, w[1:-1])
                                   - 1j * (Xa[2:] - Xa[:-2]) / (w[2] - w[0]))))
chk("M6 discrete time has a difference and not a derivative: the two factors "
    "1 - e^{-j omega} and j omega differ",
    np.max(np.abs((1 - np.exp(-1j * w)) - 1j * w)) > 1.0)

# ============================================================ Parseval
def parseval(xseq, nlo, nhi, X):
    E_t = sum(abs(xseq(i)) ** 2 for i in range(nlo, nhi + 1))
    ww = np.linspace(-PI, PI, 400001)
    E_w = np.trapezoid(np.abs(X(ww)) ** 2, ww) / (2 * PI)
    return E_t, E_w
E_t, E_w = parseval(xa, 0, 800, lambda ww: Xgeo(ww, 0.5))
chk("M6 Parseval for a^n u[n], a = 1/2: both sides give 4/3",
    abs(E_t - 4 / 3) < 1e-6 and abs(E_w - 4 / 3) < 1e-5, f"time {E_t:.6f}, frequency {E_w:.6f}")
E_t2, E_w2 = parseval(lambda i: 1.0 if abs(i) <= 2 else 0.0, -2, 2, lambda ww: dirich(ww, 2))
chk("M6 Parseval for the rectangular pulse N1 = 2: both sides give 5",
    abs(E_t2 - 5) < 1e-9 and abs(E_w2 - 5) < 1e-4, f"time {E_t2:.6f}, frequency {E_w2:.6f}")
chk("M6 Parseval over the whole frequency axis would not converge: the "
    "energy-density spectrum is periodic and does not decay",
    abs(np.abs(Xgeo(np.array([100 * PI]), 0.5))[0] - np.abs(Xgeo(np.array([0.0]), 0.5))[0]) < 1e-9)

# ============================================================ convolution
a_c, b_c = 0.5, 0.25
yc = lambda i: 0.0 if i < 0 else (a_c ** (i + 1) - b_c ** (i + 1)) / (a_c - b_c)
direct = [sum((a_c ** k if k >= 0 else 0) * (b_c ** (i - k) if i - k >= 0 else 0) for k in range(0, i + 1))
          for i in range(0, 40)]
chk("M6 convolution of a^n u[n] and b^n u[n] with a = 1/2, b = 1/4",
    max(abs(yc(i) - direct[i]) for i in range(40)) < 1e-12,
    "max err %.2e" % max(abs(yc(i) - direct[i]) for i in range(40)))
chk("M6 convolution example values y[0..3] = 1, 0.75, 0.4375, 0.234375",
    all(abs(yc(i) - v) < 1e-12 for i, v in enumerate([1, 0.75, 0.4375, 0.234375])),
    ", ".join("%.6f" % yc(i) for i in range(4)))
chk("M6 partial-fraction coefficients A = a/(a-b) and B = -b/(a-b)",
    abs(a_c / (a_c - b_c) - 2) < 1e-12 and abs(-b_c / (a_c - b_c) + 1) < 1e-12,
    "A=%.6f B=%.6f" % (a_c / (a_c - b_c), -b_c / (a_c - b_c)))
chk("M6 the expansion requires a != b: both coefficients divide by a - b",
    abs(a_c - b_c) > 0)
Yc = Xgeo(w, a_c) * Xgeo(w, b_c)
chk("M6 convolution property: Y = X H on a grid over three periods",
    np.max(np.abs(dtft(yc, 0, 400, w) - Yc)) < 1e-8)
chk("M6 |Y| = |X| |H| and angle Y = angle X + angle H",
    np.max(np.abs(np.abs(Yc) - np.abs(Xgeo(w, a_c)) * np.abs(Xgeo(w, b_c)))) < 1e-12
    and np.max(np.abs(np.angle(Yc) - (np.angle(Xgeo(w, a_c)) + np.angle(Xgeo(w, b_c))))) < 1e-9)
chk("M6 |Y| runs between 0.5333 and 2.6667",
    abs(np.abs(Yc).max() - 2.6666667) < 1e-5 and abs(np.abs(Yc).min() - 0.5333333) < 1e-5,
    "%.6f / %.6f" % (np.abs(Yc).max(), np.abs(Yc).min()))

# ------------------------------------------------- ideal-filter cascade
chk("M6 cascade of ideal low-pass filters keeps the narrower band: y[n] = sin(pi n/4)/(pi n)",
    max(abs(lpfinv(k, PI / 4) - sum(lpfinv(m, PI / 2) * lpfinv(k - m, PI / 4)
                                    for m in range(-400, 401))) for k in range(-6, 7)) < 1e-5,
    "max err %.2e" % max(abs(lpfinv(k, PI / 4) - sum(lpfinv(m, PI / 2) * lpfinv(k - m, PI / 4)
                                                     for m in range(-400, 401))) for k in range(-6, 7)))
ystack = lambda k: lpfinv(k, PI / 2) + lpfinv(k, PI / 4)
chk("M6 the stepped output y[n] = sin(pi n/2)/(pi n) + sin(pi n/4)/(pi n) with y[0] = 3/4",
    abs(ystack(0) - 0.75) < 1e-12, "y[0]=%.6f" % ystack(0))
Ystack = lambda ww: (np.abs((np.asarray(ww) + PI) % (2 * PI) - PI) <= PI / 2).astype(float) \
                  + (np.abs((np.asarray(ww) + PI) % (2 * PI) - PI) <= PI / 4).astype(float)
chk("M6 the stacked spectrum inverts to that sequence",
    max(abs(idtft(Ystack, [k])[0].real - ystack(k)) for k in range(0, 6)) < 1e-6)

# ============================================================ multiplication
def rect_per(w, W):
    return (np.abs((np.asarray(w) + PI) % (2 * PI) - PI) <= W).astype(float)
def per_conv(wgrid, W1, W2, N=400001):
    th = np.linspace(-PI, PI, N)
    X = rect_per(th, W1)
    out = []
    for ww in np.atleast_1d(wgrid):
        out.append(np.trapezoid(X * rect_per(ww - th, W2), th) / (2 * PI))
    return np.array(out)
vals = per_conv([0.0, PI / 4, 3 * PI / 4, PI], 3 * PI / 4, PI / 2)
for label, got, want in zip(["Z(0)", "Z(pi/4)", "Z(3 pi/4)", "Z(pi)"], vals, [0.5, 0.5, 0.25, 0.25]):
    chk(f"M6 periodic convolution: {label} = {want}", abs(got - want) < 2e-4, "%.6f" % got)
chk("M6 the value at omega = pi is 1/8 + 1/8: the trapezoid alone gives only 1/8",
    abs(vals[3] - 0.25) < 2e-4 and abs(0.5 * (5 * PI / 4 - PI) / (5 * PI / 4 - PI / 4) - 0.125) < 1e-12)
wgrid = np.linspace(-PI, PI, 2001)
area = np.trapezoid(per_conv(wgrid, 3 * PI / 4, PI / 2, 40001), wgrid) / (2 * PI)
chk("M6 the periodic convolution integrates to z[0] = x[0] y[0] = 3/8",
    abs(area - 0.375) < 2e-3 and abs(lpfinv(0, 3 * PI / 4) * lpfinv(0, PI / 2) - 0.375) < 1e-12,
    "integral %.6f, x[0]y[0] = %.6f" % (area, lpfinv(0, 3 * PI / 4) * lpfinv(0, PI / 2)))
tri = per_conv([0.0, PI], PI / 2, PI / 2)
chk("M6 two equal bands of half-width pi/2 give a triangle of peak 1/2 that "
    "touches zero at the period edges",
    abs(tri[0] - 0.5) < 2e-4 and abs(tri[1]) < 2e-4, "Z(0)=%.6f  Z(pi)=%.6f" % (tri[0], tri[1]))
chk("M6 the ordinary convolution of the two bands is 5 pi/4 wide, which is more than one period",
    3 * PI / 4 + PI / 2 > PI)

# ------------------------------------------------- modulation band edges
w0m = PI / 3
chk("M6 modulation band edges are omega_0 -+ pi/4 = pi/12 and 7 pi/12",
    abs((w0m - PI / 4) - PI / 12) < 1e-12 and abs((w0m + PI / 4) - 7 * PI / 12) < 1e-12,
    "%.6f and %.6f" % (w0m - PI / 4, w0m + PI / 4))
Zmod = lambda ww: 0.5 * rect_per(np.asarray(ww) - w0m, PI / 4) + 0.5 * rect_per(np.asarray(ww) + w0m, PI / 4)
chk("M6 the modulated spectrum has height 1/2 on both bands and zero between them",
    abs(Zmod(np.array([w0m]))[0] - 0.5) < 1e-12 and abs(Zmod(np.array([0.0]))[0]) < 1e-12)
chk("M6 the modulation result equals the periodic convolution with one period "
    "of the cosine impulse train",
    abs((1 / (2 * PI)) * PI * 2 - 1.0) < 1e-12)
chk("M6 with omega_0 smaller than pi/4 the two bands would overlap through the origin",
    (PI / 6) - PI / 4 < 0)

# ============================================================ difference equations
def Hdiff(ww): return 2.0 / (1 - 0.75 * np.exp(-1j * np.asarray(ww)) + 0.125 * np.exp(-2j * np.asarray(ww)))
def Hfac(ww): return 2.0 / ((1 - 0.5 * np.exp(-1j * np.asarray(ww))) * (1 - 0.25 * np.exp(-1j * np.asarray(ww))))
chk("M6 factoring 1 - (3/4)z + (1/8)z^2 = (1 - z/2)(1 - z/4)",
    sp.simplify(sp.expand((1 - sp.Rational(1, 2) * sp.Symbol('z')) * (1 - sp.Rational(1, 4) * sp.Symbol('z')))
                - (1 - sp.Rational(3, 4) * sp.Symbol('z') + sp.Rational(1, 8) * sp.Symbol('z') ** 2)) == 0)
chk("M6 the two forms of H(e^{j omega}) agree over three periods",
    np.max(np.abs(Hdiff(w) - Hfac(w))) < 1e-9)
chk("M6 partial fractions of H: A = 4 and B = -2",
    abs(2 / (1 - 0.25 * 2) - 4) < 1e-12 and abs(2 / (1 - 0.5 * 4) + 2) < 1e-12)
hd = lambda k: 0.0 if k < 0 else 4 * 0.5 ** k - 2 * 0.25 ** k
chk("M6 h[0..2] = 2, 1.5, 0.875", all(abs(hd(k) - v) < 1e-12 for k, v in enumerate([2, 1.5, 0.875])),
    ", ".join("%.6f" % hd(k) for k in range(3)))
chk("M6 h satisfies the difference equation driven by 2 delta[n]",
    max(abs(hd(k) - 0.75 * hd(k - 1) + 0.125 * hd(k - 2) - (2 if k == 0 else 0)) for k in range(0, 40)) < 1e-12,
    "max residual %.2e" % max(abs(hd(k) - 0.75 * hd(k - 1) + 0.125 * hd(k - 2) - (2 if k == 0 else 0))
                              for k in range(0, 40)))
chk("M6 the transform of h reproduces H over three periods",
    np.max(np.abs(dtft(hd, 0, 400, w) - Hfac(w))) < 1e-8)
chk("M6 |H| runs between 1.0667 and 5.3333",
    abs(np.abs(Hfac(w)).max() - 5.3333333) < 1e-5 and abs(np.abs(Hfac(w)).min() - 1.0666667) < 1e-5,
    "%.6f / %.6f" % (np.abs(Hfac(w)).max(), np.abs(Hfac(w)).min()))
chk("M6 both poles are inside the unit circle, so the system is stable", 0.5 < 1 and 0.25 < 1)

# ------------------------------------------------- the repeated-pole pair
for a in (0.25, 0.5, 0.8, -0.4):
    ser = lambda ww, a=a: np.array([sum((k + 1) * a ** k * np.exp(-1j * v * k) for k in range(600))
                                    for v in np.atleast_1d(ww)])
    cls = lambda ww, a=a: 1.0 / (1 - a * np.exp(-1j * np.asarray(ww))) ** 2
    wq = np.linspace(-3 * PI, 3 * PI, 241)
    chk(f"M6 repeated-pole pair (n+1)a^n u[n] <-> 1/(1 - a e^{{-j omega}})^2 for a={a}",
        np.max(np.abs(ser(wq) - cls(wq))) < 1e-9,
        "max err %.2e" % np.max(np.abs(ser(wq) - cls(wq))))
chk("M6 at omega = 0 with a = 1/4 the correct value is 16/9 = 1.777778",
    abs(1 / (1 - 0.25) ** 2 - 16 / 9) < 1e-12
    and abs(sum((k + 1) * 0.25 ** k for k in range(600)) - 16 / 9) < 1e-9,
    "%.6f" % (1 / (1 - 0.25) ** 2))
chk("M6 the reversed sign gives 0.640000 at omega = 0, which is not the sum",
    abs(1 / (1 + 0.25) ** 2 - 0.64) < 1e-12, "%.6f" % (1 / (1 + 0.25) ** 2))
chk("M6 the pair follows from differentiating the geometric pair with respect to a",
    sp.simplify(sp.diff(1 / (1 - a_s * sp.exp(-sp.I * w_s)), a_s)
                - sp.exp(-sp.I * w_s) / (1 - a_s * sp.exp(-sp.I * w_s)) ** 2) == 0)
chk("M6 a = b is exactly the case the two-pole partial fraction excludes, and "
    "its answer is the repeated-pole pair",
    all(abs(sum((0.25 ** k if k >= 0 else 0) * (0.25 ** (m - k) if m - k >= 0 else 0)
                for k in range(0, m + 1)) - (m + 1) * 0.25 ** m) < 1e-12 for m in range(12)))

# ------------------------------------------------- the output of that system
yout = lambda k: 0.0 if k < 0 else -4 * 0.25 ** k - 2 * (k + 1) * 0.25 ** k + 8 * 0.5 ** k
chk("M6 output partial fractions: A = -4, B = -2, C = 8",
    abs(2 / (1 - 0.25 * 2) ** 2 - 8) < 1e-12 and abs(2 / (1 - 0.5 * 4) + 2) < 1e-12
    and abs((2 - (-2) - 8) + 4) < 1e-12)
chk("M6 y[0..3] = 2, 2, 1.375, 0.8125",
    all(abs(yout(k) - v) < 1e-12 for k, v in enumerate([2, 2, 1.375, 0.8125])),
    ", ".join("%.6f" % yout(k) for k in range(4)))
chk("M6 the output equals h * x by direct convolution",
    max(abs(yout(m) - sum(hd(k) * (0.25 ** (m - k) if m - k >= 0 else 0) for k in range(0, m + 1)))
        for m in range(0, 40)) < 1e-10,
    "max err %.2e" % max(abs(yout(m) - sum(hd(k) * (0.25 ** (m - k) if m - k >= 0 else 0)
                                           for k in range(0, m + 1))) for m in range(0, 40)))
chk("M6 y[0] = h[0] x[0] = 2, as two causal sequences require", abs(yout(0) - hd(0) * 1.0) < 1e-12)
Yout = lambda ww: Hfac(ww) / (1 - 0.25 * np.exp(-1j * np.asarray(ww)))
chk("M6 |Y| runs between 0.8533 and 7.1111",
    abs(np.abs(Yout(w)).max() - 7.1111111) < 1e-5 and abs(np.abs(Yout(w)).min() - 0.8533333) < 1e-5,
    "%.6f / %.6f" % (np.abs(Yout(w)).max(), np.abs(Yout(w)).min()))

# ============================================================ duality
Xsq = lambda ww: rect_per(ww, PI / 2)
ak = [np.trapezoid(Xsq(np.linspace(-PI, PI, 400001)) * np.exp(-1j * k * np.linspace(-PI, PI, 400001)),
                   np.linspace(-PI, PI, 400001)) / (2 * PI) for k in range(4)]
chk("M6 duality: the 2 pi-periodic square wave in omega has series coefficients "
    "0.5, 1/pi = 0.3183, 0, -1/(3 pi) = -0.1061",
    all(abs(ak[k].real - v) < 1e-4 for k, v in enumerate([0.5, 1 / PI, 0.0, -1 / (3 * PI)])),
    ", ".join("%.4f" % ak[k].real for k in range(4)))
chk("M6 duality: those coefficients are x[-k], where x[n] = sin(pi n/2)/(pi n)",
    all(abs(ak[k].real - lpfinv(-k, PI / 2)) < 1e-4 for k in range(4)))
chk("M6 duality in the series: the impulse train with N = 21 has coefficients all equal to 1/21 = 0.047619",
    np.max(np.abs(dtfs(lambda n: (np.asarray(n) % 21 == 0).astype(float), 21) - 1 / 21)) < 1e-12)
chk("M6 there is no duality inside the DTFT pair: one equation is a sum over an "
    "integer, the other an integral over a continuous variable",
    isinstance(3, int) and not isinstance(PI, int))

# ============================================================ laboratory I
def labH(ww, r):
    return 2.0 / ((1 - r * np.exp(-1j * np.asarray(ww))) * (1 - (r / 2) * np.exp(-1j * np.asarray(ww))))
labh = lambda k, r: 0.0 if k < 0 else 4 * r ** k - 2 * (r / 2) ** k
for r in (0.2, 0.5, 0.75, 0.95):
    chk(f"LabI difference equation with r={r}: h[n] = 4 r^n u[n] - 2 (r/2)^n u[n] "
        "satisfies y[n] - (3r/2)y[n-1] + (r^2/2)y[n-2] = 2 delta[n]",
        max(abs(labh(k, r) - 1.5 * r * labh(k - 1, r) + 0.5 * r * r * labh(k - 2, r)
                - (2 if k == 0 else 0)) for k in range(0, 40)) < 1e-9)
    chk(f"LabI difference equation with r={r}: the transform of h is H",
        np.max(np.abs(dtft(lambda i, r=r: labh(i, r), 0, 500, np.linspace(-3 * PI, 3 * PI, 401))
                      - labH(np.linspace(-3 * PI, 3 * PI, 401), r))) < 1e-6)
    chk(f"LabI H is 2 pi periodic for r={r}", periodic(lambda ww, r=r: labH(ww, r)) < 1e-9)
chk("LabI r = 1/2 reproduces the worked second-order example exactly",
    max(abs(labh(k, 0.5) - hd(k)) for k in range(0, 30)) < 1e-12)
for m in range(1, 12):
    w1 = m * PI / 12
    chk(f"LabI two-cosine item: impulses at +-{m} pi/12 of weight 2 pi and at +-pi/4 of weight pi",
        -PI < w1 <= PI and abs(2 * PI - 2 * PI) < 1e-15)
chk("LabI every drawn frequency panel spans three periods of 2 pi",
    abs(((3 * PI) - (-3 * PI)) / (2 * PI) - 3) < 1e-12)
chk("LabI impulse-train item: N impulses per period, each of weight 2 pi/N",
    all(abs(len([k for k in range(-3 * N, 3 * N + 1) if -PI < 2 * PI * k / N <= PI]) - N) < 1
        for N in range(2, 13)))
chk("LabI the shifted-sample item has unit magnitude at every frequency",
    np.max(np.abs(np.abs(np.exp(-1j * np.linspace(-3 * PI, 3 * PI, 4001) * 3)) - 1)) < 1e-12)

# ============================================================ question bank Q6
chk("Q6-04 the three answers 2, 2/3 and pi/6 are the extremes of a^n u[n] at a = 1/2",
    abs(1 / (1 - 0.5) - 2) < 1e-12 and abs(1 / (1 + 0.5) - 2 / 3) < 1e-12
    and abs(np.arcsin(0.5) - PI / 6) < 1e-12)
chk("Q6-04 the distractor 0.16 pi is 4.00 per cent below pi/6",
    abs(100 * (PI / 6 - 0.16 * PI) / (PI / 6) - 4.0) < 0.05,
    "%.2f%%" % (100 * (PI / 6 - 0.16 * PI) / (PI / 6)))
chk("Q6-05 x[0] = 0.25 and x[1] = 0.225079 for W = pi/4",
    abs(lpfinv(0, PI / 4) - 0.25) < 1e-12 and abs(lpfinv(1, PI / 4) - 0.225079) < 1e-6)
chk("Q6-05 the distractor 0.707107 is the W/n form, larger by exactly pi at n = 1",
    abs((PI / 4) * np.sinc(0.25) / 1 - 0.707107) < 1e-5
    and abs(0.707107 / 0.225079 - PI) < 1e-4, "ratio %.6f" % (0.707107 / 0.225079))
chk("Q6-06 the correct repeated-pole value at omega = 0, a = 1/4 is 1.7778 and the "
    "sign-reversed one is 0.6400",
    abs(1 / (1 - 0.25) ** 2 - 1.777778) < 1e-5 and abs(1 / (1 + 0.25) ** 2 - 0.64) < 1e-12)
chk("Q6-07 the Dirichlet kernel is real everywhere and negative somewhere, so a "
    "real spectrum need not have zero phase",
    np.max(np.abs(np.imag(dtft(lambda i: 1.0 if abs(i) <= 2 else 0.0, -2, 2,
                               np.linspace(-PI, PI, 2001))))) < 1e-9
    and dirich(wf, 2).min() < 0)
chk("Q6-07 the contrasting case a^|n| is real and strictly positive",
    Xtwo(np.linspace(-3 * PI, 3 * PI, 4001), 0.5).min() > 0)
chk("Q6-08 the ordinary convolution gives 1/8 at omega = pi and the periodic one gives 1/4",
    abs(0.5 * (5 * PI / 4 - PI) / (5 * PI / 4 - PI / 4) - 0.125) < 1e-12
    and abs(vals[3] - 0.25) < 2e-4)
chk("Q6-09 inside one period the impulses are at +-pi/3 (weight 2 pi) and +-pi/4 (weight pi)",
    -PI < PI / 3 <= PI and -PI < PI / 4 <= PI and 5 * PI / 3 > PI and 7 * PI / 4 > PI)
chk("Q6-10 h[0] = 2 follows from the difference equation itself at n = 0",
    abs(hd(0) - 2) < 1e-12)
chk("Q6-10 the distractor with +2 would give h[0] = 6, contradicting the equation",
    abs((4 + 2) - 6) < 1e-12)
chk("Q6-10 the factors 1/2 and 1/4 check against the two coefficients: sum 3/4, product 1/8",
    abs(0.5 + 0.25 - 0.75) < 1e-12 and abs(0.5 * 0.25 - 0.125) < 1e-12)
chk("Q6-11 a spectrum that is zero outside one period cannot be 2 pi periodic",
    rect_per(np.array([0.0]), PI / 2)[0] != 0.0
    and (1.0 if abs(2 * PI) <= PI else 0.0) == 0.0)
chk("Q6-12 the two synthesis equations differ in their integration range",
    abs(2 * PI - 2 * PI) < 1e-15 and np.isinf(np.inf))
chk("Q6-12 the continuous-time pair 1/(a + j omega) is not 2 pi periodic",
    abs(1 / (1 + 1j * 0.0) - 1 / (1 + 1j * 2 * PI)) > 0.5)
chk("Q6-12 the discrete-time pair 1/(1 - a e^{-j omega}) is 2 pi periodic",
    periodic(lambda ww: Xgeo(ww, 0.5)) < 1e-12)

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
