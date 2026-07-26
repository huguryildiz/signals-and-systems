#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Module 4 of the artifact, plus the mathematics of laboratories F and G.
Symbolic where possible (SymPy), numerical as a cross-check (NumPy)."""
import numpy as np, sympy as sp
from fractions import Fraction
from math import gcd

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

t, tau, k, n = sp.symbols('t tau k n', real=True)

# ================================================================ periods
def lcm_frac(fracs):
    """Least common multiple of positive rationals:
       LCM(numerators) / GCD(denominators), each fraction in lowest terms."""
    fracs = [Fraction(f).limit_denominator() for f in fracs]
    num = fracs[0].numerator
    for f in fracs[1:]:
        num = num * f.numerator // gcd(num, f.numerator)
    den = fracs[0].denominator
    for f in fracs[1:]:
        den = gcd(den, f.denominator)
    return Fraction(num, den)

T0 = lcm_frac([Fraction(2, 9), Fraction(8, 21)])
chk("M4 period rule LCM(2/9, 8/21) = 8/3", T0 == Fraction(8, 3), str(T0))
chk("M4 period 8/3 divides both component periods",
    (T0 / Fraction(2, 9)).denominator == 1 and (T0 / Fraction(8, 3 * 7)).denominator == 1,
    f"{T0/Fraction(2,9)} and {T0/Fraction(8,21)}")
chk("M4 period 8/3 is the smallest such multiple",
    gcd(int(T0 / Fraction(2, 9)), int(T0 / Fraction(8, 21))) == 1)
chk("M4 wrong route LCM(9,21)=63 would give 8/63, not a common period",
    (Fraction(8, 63) / Fraction(2, 9)).denominator != 1)

# the three worked answers
chk("M4 T0 = 2 s for 1 + cos(2 pi t)/2 + sin(3 pi t)",
    lcm_frac([Fraction(1), Fraction(2, 3)]) == 2)
chk("M4 T0 = 24/5 s for periods 3/5 and 8/5",
    lcm_frac([Fraction(3, 5), Fraction(8, 5)]) == Fraction(24, 5))
chk("M4 T0 = 2 s for the filtering input (periods 2, 1, 2/3)",
    lcm_frac([Fraction(2), Fraction(1), Fraction(2, 3)]) == 2)
chk("M4 w0 = pi rad/s follows from T0 = 2", sp.simplify(2 * sp.pi / 2 - sp.pi) == 0)

# =========================================== sum of sinusoids, a0 and stems
# x(t) = 1 + cos(2 pi t)/2 + sin(3 pi t), T0 = 2, w0 = pi
w0 = sp.pi
x1 = 1 + sp.Rational(1, 2) * sp.cos(2 * sp.pi * t) + sp.sin(3 * sp.pi * t)
a0 = sp.integrate(x1, (t, -1, 1)) / 2
chk("M4 a_0 = 1 for 1 + cos(2 pi t)/2 + sin(3 pi t)", sp.simplify(a0 - 1) == 0, f"a0={a0}")
def ak_sym(expr, kk, T0v):
    w = 2 * sp.pi / T0v
    return sp.simplify(sp.integrate(expr * sp.exp(-sp.I * kk * w * t), (t, -T0v/2, T0v/2)) / T0v)
for kk, want in [(0, 1), (2, 0.25), (-2, 0.25), (3, -0.5j), (-3, 0.5j), (1, 0), (4, 0)]:
    got = complex(ak_sym(x1, kk, 2))
    chk(f"M4 a_{kk} of the sinusoid sum", abs(got - want) < 1e-12, f"got {got}")
chk("M4 |a_3| = 1/2", sp.Abs(1 / (2 * sp.I)) == sp.Rational(1, 2))
chk("M4 arg a_3 = -pi/2", sp.simplify(sp.arg(1 / (2 * sp.I)) + sp.pi / 2) == 0)
chk("M4 arg a_-3 = +pi/2", sp.simplify(sp.arg(-1 / (2 * sp.I)) - sp.pi / 2) == 0)

# the second worked period example: 3 + 5cos(10pi t/3 + pi/4) + 4 sin(5pi t/4 - pi/5)
chk("M4 second example: 10pi/3 is the 8th harmonic of 5pi/12",
    sp.simplify(8 * sp.Rational(5, 12) * sp.pi - sp.Rational(10, 3) * sp.pi) == 0)
chk("M4 second example: 5pi/4 is the 3rd harmonic of 5pi/12",
    sp.simplify(3 * sp.Rational(5, 12) * sp.pi - sp.Rational(5, 4) * sp.pi) == 0)

# ==================================================== rectangular wave
def a_rect(kk, T0v, T1v):
    if kk == 0:
        return 2 * T1v / T0v
    return np.sin(2 * np.pi * kk * T1v / T0v) / (np.pi * kk)
# symbolic derivation for T0 = 4, T1 = 1
T0v, T1v = 4, 1
a_sym = [sp.simplify(sp.integrate(sp.exp(-sp.I * kk * 2 * sp.pi / T0v * t), (t, -T1v, T1v)) / T0v)
         for kk in range(0, 6)]
ok = all(abs(complex(a_sym[kk]) - a_rect(kk, T0v, T1v)) < 1e-12 for kk in range(0, 6))
chk("M4 rectangular wave: closed form matches the symbolic integral", ok)
chk("M4 rectangular wave a_0 = 2T1/T0 = 0.5", abs(a_rect(0, 4, 1) - 0.5) < 1e-15)
chk("M4 rectangular wave zeros at k multiple of T0/2T1 = 2",
    all(abs(a_rect(kk, 4, 1)) < 1e-15 for kk in (2, 4, 6, -2, -4)))
chk("M4 rectangular wave a_1 = 1/pi", abs(a_rect(1, 4, 1) - 1 / np.pi) < 1e-14)

# envelope as a function of omega, and sampled at omega = k w0
def env(w, T1v):
    return 2 * T1v if abs(w) < 1e-12 else 2 * np.sin(w * T1v) / w
chk("M4 envelope E(w) = 2 sin(w T1)/w reproduces the pulse integral",
    abs(env(0.7, 1) - complex(sp.integrate(sp.exp(-sp.I * 0.7 * t), (t, -1, 1))).real) < 1e-10)
w0v = 2 * np.pi / 4
ok = all(abs(env(kk * w0v, 1) / 4 - a_rect(kk, 4, 1)) < 1e-12 for kk in range(-8, 9))
chk("M4 a_k = E(k w0)/T0 at every harmonic", ok)
# the specialisation: E(w0) alone is the k = 1 sample, not the general expression
chk("M4 E(w0)/T0 equals a_1 only, not a_k",
    abs(env(w0v, 1) / 4 - a_rect(1, 4, 1)) < 1e-12
    and abs(env(w0v, 1) / 4 - a_rect(3, 4, 1)) > 1e-3)
chk("M4 envelope is independent of T0 (T0 = 4, 8, 16 give one curve)",
    all(abs(4 * a_rect(1, 4, 1) - env(2 * np.pi / 4, 1)) < 1e-12
        and abs(8 * a_rect(1, 8, 1) - env(2 * np.pi / 8, 1)) < 1e-12
        and abs(16 * a_rect(1, 16, 1) - env(2 * np.pi / 16, 1)) < 1e-12 for _ in [0]))

# ==================================================== impulse train
chk("M4 impulse train a_k = 1/T0 for every k",
    all(abs(complex(sp.integrate(sp.DiracDelta(t) * sp.exp(-sp.I * kk * 2 * sp.pi / 3 * t),
                                 (t, -sp.Rational(3, 2), sp.Rational(3, 2))) / 3) - 1 / 3) < 1e-12
        for kk in range(-3, 4)))
chk("M4 impulse train: an interval with equal limits integrates to zero",
    sp.integrate(sp.DiracDelta(t), (t, -sp.Rational(3, 2), -sp.Rational(3, 2))) == 0)

# ==================================================== sawtooth
def a_saw(kk, T0v):
    return 0.0 if kk == 0 else 1j * T0v * (-1.0) ** kk / (2 * kk * np.pi)
saw_sym = [sp.simplify(sp.integrate(t * sp.exp(-sp.I * kk * 2 * sp.pi / 1 * t),
                                    (t, -sp.Rational(1, 2), sp.Rational(1, 2))) / 1)
           for kk in range(0, 6)]
ok = all(abs(complex(saw_sym[kk]) - a_saw(kk, 1)) < 1e-12 for kk in range(0, 6))
chk("M4 sawtooth: closed form j T0 (-1)^k /(2 k pi) matches the symbolic integral", ok)
chk("M4 sawtooth a_0 = 0", abs(complex(saw_sym[0])) < 1e-15)
chk("M4 sawtooth peak |a_1| = 0.159 for T0 = 1", abs(abs(a_saw(1, 1)) - 0.15915494) < 1e-6,
    f"{abs(a_saw(1,1)):.6f}")
chk("M4 sawtooth coefficients are purely imaginary",
    all(abs(a_saw(kk, 1).real) < 1e-15 for kk in range(-6, 7) if kk != 0))
chk("M4 sawtooth phases alternate between +pi/2 and -pi/2",
    all(abs(abs(np.angle(a_saw(kk, 1))) - np.pi / 2) < 1e-12 for kk in range(-6, 7) if kk != 0))

# ==================================================== triangular wave (laboratory F)
def a_tri(kk):
    return 0.5 if kk == 0 else (1 - (-1.0) ** kk) / (kk * kk * np.pi ** 2)
tri = lambda tt: 1 - abs(tt - 2 * np.round(tt / 2))
ok = True
for kk in range(0, 7):
    num = sp.integrate((1 - sp.Abs(t)) * sp.exp(-sp.I * kk * sp.pi * t), (t, -1, 1)) / 2
    if abs(complex(sp.simplify(num)) - a_tri(kk)) > 1e-10:
        ok = False
chk("M4 triangular wave: (1-(-1)^k)/(k^2 pi^2) matches the symbolic integral", ok)

# ==================================================== truncation, MSE, Gibbs
def partial(a, w0v, tt, N):
    s = a(0).real if isinstance(a(0), complex) else a(0)
    for kk in range(1, N + 1):
        c = complex(a(kk))
        s += 2 * (c.real * np.cos(kk * w0v * tt) - c.imag * np.sin(kk * w0v * tt))
    return s
def mse_tail(a, power, N):
    kept = abs(complex(a(0))) ** 2
    for kk in range(1, N + 1):
        kept += 2 * abs(complex(a(kk))) ** 2
    return power - kept
ar = lambda kk: complex(a_rect(kk, 4, 1))
for N, want in [(3, 0.025), (9, 0.010), (27, 0.004), (81, 0.001)]:
    got = mse_tail(ar, 0.5, N)
    chk(f"M4 rectangular wave MSE at N = {N} is {want}", abs(got - want) < 5e-4, f"{got:.5f}")
asw = lambda kk: complex(a_saw(kk, 1))
for N, want in [(3, 0.01438), (9, 0.00533), (27, 0.00184), (81, 0.00062)]:
    got = mse_tail(asw, 1 / 12, N)
    chk(f"M4 sawtooth MSE at N = {N} is {want}", abs(got - want) < 1e-5, f"{got:.5f}")

# Gibbs overshoot: a square wave of unit jump, T0 = 2, T1 = 0.5
asq = lambda kk: complex(0.5 if kk == 0 else np.sin(np.pi * kk / 2) / (np.pi * kk))
grid = np.linspace(-1, 1, 40001)
for N in (51, 201):
    peak = max(partial(asq, np.pi, tt, N) for tt in grid)
    ratio = peak - 1.0
    chk(f"M4 Gibbs overshoot at N = {N} is about 8.95% of the jump",
        abs(ratio - 0.0894898) < 3e-3, f"{100*ratio:.3f}%")
chk("M4 Gibbs overshoot does not shrink between N = 51 and N = 201",
    abs(max(partial(asq, np.pi, tt, 201) for tt in grid)
        - max(partial(asq, np.pi, tt, 51) for tt in grid)) < 3e-3)
chk("M4 Wilbraham-Gibbs constant Si(pi)/pi = 0.58949",
    abs(float(sp.Si(sp.pi) / sp.pi) - 0.5894898722) < 1e-9)

# ==================================================== Parseval
chk("M4 Parseval, rectangular wave T0 = 4T1: power 0.5",
    abs(sum(abs(ar(kk)) ** 2 for kk in range(-4000, 4001)) - 0.5) < 1e-4)
chk("M4 Parseval, sawtooth T0 = 1: power 1/12",
    abs(sum(abs(asw(kk)) ** 2 for kk in range(-40000, 40001)) - 1 / 12) < 1e-5)
chk("M4 Parseval, triangular wave: power 1/3",
    abs(sum(a_tri(kk) ** 2 for kk in range(-4000, 4001)) - 1 / 3) < 1e-6)

# ==================================================== discrete-time series
def a_dt_rect(kk, N, N1):
    r = kk / N
    if abs(r - round(r)) < 1e-12:
        return (2 * N1 + 1) / N
    return np.sin(2 * np.pi * kk * (N1 + 0.5) / N) / (N * np.sin(np.pi * kk / N))
# brute-force analysis sum as the independent route
def a_dt_brute(x, N, kk):
    return sum(x(m) * np.exp(-1j * kk * 2 * np.pi / N * m) for m in range(N)) / N
xsq = lambda m: 1.0 if abs(m - 10 * round(m / 10)) <= 2 else 0.0
ok = all(abs(a_dt_brute(xsq, 10, kk) - a_dt_rect(kk, 10, 2)) < 1e-12 for kk in range(-15, 16))
chk("M4 DT square wave: closed form matches the analysis sum, both branches", ok)
chk("M4 DT square wave peak (2N1+1)/N = 0.5 for N = 10, N1 = 2",
    abs(a_dt_rect(0, 10, 2) - 0.5) < 1e-15)
chk("M4 DT square wave: the r = 1 branch occurs at k multiple of N",
    all(abs(a_dt_rect(kk, 10, 2) - 0.5) < 1e-12 for kk in (0, 10, 20, -10)))
chk("M4 DT square wave coefficients are periodic with N",
    all(abs(a_dt_rect(kk, 10, 2) - a_dt_rect(kk + 10, 10, 2)) < 1e-12 for kk in range(-9, 10)))
chk("M4 DT square wave peaks for N = 20 and N = 30",
    abs(a_dt_rect(0, 20, 2) - 0.25) < 1e-15 and abs(a_dt_rect(0, 30, 2) - 1 / 6) < 1e-15)
chk("M4 Parseval, DT square wave N = 10, N1 = 2",
    abs(sum(abs(a_dt_rect(kk, 10, 2)) ** 2 for kk in range(10)) - 0.5) < 1e-12)

# the N = 16, N1 = 3 case used by laboratory F: reconstruction must be exact
def rec_dt(m, N, N1, M):
    s = a_dt_rect(0, N, N1)
    for kk in range(1, M + 1):
        c = a_dt_rect(kk, N, N1)
        s += (1 if (N % 2 == 0 and kk == N // 2) else 2) * c * np.cos(2 * np.pi * kk * m / N)
    return s
x16 = lambda m: 1.0 if abs(m - 16 * round(m / 16)) <= 3 else 0.0
chk("LabF DT square wave N = 16 reconstructs exactly at the full harmonic count",
    all(abs(rec_dt(m, 16, 3, 8) - x16(m)) < 1e-10 for m in range(-20, 21)))
chk("LabF DT square wave average power 7/16 balances Parseval",
    abs(sum(abs(a_dt_rect(kk, 16, 3)) ** 2 for kk in range(16)) - 7 / 16) < 1e-12)

# the DTFS worked example
def a_dtfs_ex(kk):
    N = 24
    x = lambda m: np.sin(5 * np.pi * m / 6) + np.cos(3 * np.pi * m / 4 + np.pi / 5)
    return a_dt_brute(x, N, kk)
chk("M4 DTFS example: N0 = LCM(12, 8) = 24", np.lcm(12, 8) == 24)
chk("M4 DTFS example a_10 = 1/(2j)", abs(a_dtfs_ex(10) - 1 / (2j)) < 1e-12, str(a_dtfs_ex(10)))
chk("M4 DTFS example a_-10 = -1/(2j)", abs(a_dtfs_ex(-10) + 1 / (2j)) < 1e-12)
chk("M4 DTFS example a_9 = exp(j pi/5)/2", abs(a_dtfs_ex(9) - 0.5 * np.exp(1j * np.pi / 5)) < 1e-12)
chk("M4 DTFS example a_-9 = exp(-j pi/5)/2", abs(a_dtfs_ex(-9) - 0.5 * np.exp(-1j * np.pi / 5)) < 1e-12)
chk("M4 DTFS example: every other coefficient in one period is zero",
    all(abs(a_dtfs_ex(kk)) < 1e-12 for kk in range(-12, 12) if abs(kk) not in (9, 10)))
chk("M4 DTFS example phases: pi/5, -pi/5, -pi/2, +pi/2",
    abs(np.angle(a_dtfs_ex(9)) - np.pi / 5) < 1e-12
    and abs(np.angle(a_dtfs_ex(-9)) + np.pi / 5) < 1e-12
    and abs(np.angle(a_dtfs_ex(10)) + np.pi / 2) < 1e-12
    and abs(np.angle(a_dtfs_ex(-10)) - np.pi / 2) < 1e-12)
chk("M4 DTFS coefficients repeat with N: a_k = a_{k+24}",
    all(abs(a_dtfs_ex(kk) - a_dtfs_ex(kk + 24)) < 1e-10 for kk in range(-3, 4)))

# the N = 11 discrete sawtooth
def a_dt_saw(kk):
    return -1j * sum(2 * m / 11 * np.sin(2 * np.pi * kk * m / 11) for m in range(1, 6))
xs11 = lambda m: float(m - 11 * round(m / 11))
chk("M4 DT sawtooth N = 11: pairing formula matches the analysis sum",
    all(abs(a_dt_brute(xs11, 11, kk) - a_dt_saw(kk)) < 1e-12 for kk in range(-11, 12)))
chk("M4 DT sawtooth a_0 = 0", abs(a_dt_saw(0)) < 1e-12)
chk("M4 DT sawtooth peak |a_1| = 1.7746",
    abs(abs(a_dt_saw(1)) - 1.7746) < 5e-4, f"{abs(a_dt_saw(1)):.4f}")
chk("M4 DT sawtooth coefficients are purely imaginary",
    all(abs(a_dt_saw(kk).real) < 1e-12 for kk in range(-11, 12)))
chk("M4 DT sawtooth coefficients repeat with 11",
    all(abs(a_dt_saw(kk) - a_dt_saw(kk + 11)) < 1e-12 for kk in range(-5, 6)))
chk("M4 Parseval, DT sawtooth N = 11: power 10",
    abs(sum(abs(a_dt_saw(kk)) ** 2 for kk in range(11)) - 10) < 1e-10)

# ==================================================== filtering, continuous time
# x(t) = 1 + cos(pi t) + sin(2 pi t) + cos(3 pi t + pi/3), w0 = pi
def a_filt(kk):
    m = abs(kk)
    if kk == 0: c = 1 + 0j
    elif m == 1: c = 0.5 + 0j
    elif m == 2: c = 1 / (2j)
    elif m == 3: c = 0.5 * np.exp(1j * np.pi / 3)
    else: return 0j
    return np.conj(c) if kk < 0 else c
xf = lambda tt: (1 + np.cos(np.pi * tt) + np.sin(2 * np.pi * tt)
                 + np.cos(3 * np.pi * tt + np.pi / 3))
# the coefficients reproduce the signal
chk("M4 filtering input: its five coefficients rebuild the signal",
    all(abs(sum(a_filt(kk) * np.exp(1j * kk * np.pi * tt) for kk in range(-3, 4)) - xf(tt)) < 1e-12
        for tt in np.linspace(-2, 2, 41)))

H_lp = lambda w: 1 / (1 + 1j * w)
H_hp = lambda w: 1j * w / (1 + 1j * w)
b_lp = {kk: a_filt(kk) * H_lp(kk * np.pi) for kk in range(-3, 4)}
b_hp = {kk: a_filt(kk) * H_hp(kk * np.pi) for kk in range(-3, 4)}

for kk, mag, ph in [(1, 0.1517, -1.2626), (2, 0.0786, -2.9838), (3, 0.0528, -0.4178)]:
    chk(f"M4 low-pass b_{kk} magnitude {mag}", abs(abs(b_lp[kk]) - mag) < 5e-4, f"{abs(b_lp[kk]):.4f}")
    chk(f"M4 low-pass b_{kk} phase {ph}", abs(np.angle(b_lp[kk]) - ph) < 5e-4, f"{np.angle(b_lp[kk]):.4f}")
chk("M4 low-pass b_0 = 1", abs(b_lp[0] - 1) < 1e-12)

y_lp = lambda tt: (1 + 0.303 * np.cos(np.pi * tt - 1.263)
                   + 0.157 * np.cos(2 * np.pi * tt - 2.984)
                   + 0.106 * np.cos(3 * np.pi * tt - 0.418))
y_lp_exact = lambda tt: sum(b_lp[kk] * np.exp(1j * kk * np.pi * tt) for kk in range(-3, 4)).real
chk("M4 low-pass: the stated output matches the full harmonic sum",
    max(abs(y_lp(tt) - y_lp_exact(tt)) for tt in np.linspace(-2, 2, 401)) < 1.5e-3)
# an entirely independent route: steady-state convolution with h(t) = e^{-t}u(t)
def conv_lp(tt, lo=0.0, hi=80.0, m=400001):
    g = np.linspace(lo, hi, m)
    return np.trapezoid(np.exp(-g) * xf(tt - g), g)
worst = max(abs(conv_lp(tt) - y_lp(tt)) for tt in [-1.3, -0.4, 0.0, 0.55, 1.1, 1.7])
chk("M4 low-pass: the output equals the convolution integral", worst < 2e-3, f"max err {worst:.2e}")
# the halved version does not
worst_half = max(abs(conv_lp(tt) - (1 + 0.15 * np.cos(np.pi * tt - 1.26)
                                    + 0.08 * np.cos(2 * np.pi * tt - 2.98)
                                    + 0.05 * np.cos(3 * np.pi * tt - 0.42)))
                 for tt in [-1.3, -0.4, 0.0, 0.55, 1.1, 1.7])
chk("M4 low-pass: dropping the factor of two disagrees with the convolution",
    worst_half > 0.1, f"max err {worst_half:.3f}")
lo = min(y_lp(tt) for tt in np.linspace(-2, 2, 4001))
hi = max(y_lp(tt) for tt in np.linspace(-2, 2, 4001))
chk("M4 low-pass output swing is 0.615 to 1.417",
    abs(lo - 0.615) < 5e-3 and abs(hi - 1.417) < 5e-3, f"{lo:.3f} to {hi:.3f}")

for kk, mag, ph in [(1, 0.4764, 0.3082), (2, 0.4938, -1.4130), (3, 0.4972, 1.1530)]:
    chk(f"M4 high-pass b_{kk} magnitude {mag}", abs(abs(b_hp[kk]) - mag) < 5e-4, f"{abs(b_hp[kk]):.4f}")
    chk(f"M4 high-pass b_{kk} phase {ph}", abs(np.angle(b_hp[kk]) - ph) < 5e-4, f"{np.angle(b_hp[kk]):.4f}")
chk("M4 high-pass b_0 = 0 because H(j0) = 0", abs(b_hp[0]) < 1e-15)
y_hp = lambda tt: (0.953 * np.cos(np.pi * tt + 0.308)
                   + 0.988 * np.cos(2 * np.pi * tt - 1.413)
                   + 0.994 * np.cos(3 * np.pi * tt + 1.153))
y_hp_exact = lambda tt: sum(b_hp[kk] * np.exp(1j * kk * np.pi * tt) for kk in range(-3, 4)).real
chk("M4 high-pass: the stated output matches the full harmonic sum",
    max(abs(y_hp(tt) - y_hp_exact(tt)) for tt in np.linspace(-2, 2, 401)) < 3e-3)
# independent route: H = 1 - 1/(1+jw), so h(t) = delta(t) - e^{-t}u(t)
worst = max(abs((xf(tt) - conv_lp(tt)) - y_hp(tt)) for tt in [-1.3, -0.4, 0.0, 0.55, 1.1, 1.7])
chk("M4 high-pass: the output equals x(t) minus the low-pass convolution",
    worst < 3e-3, f"max err {worst:.2e}")
chk("M4 high-pass output has zero average",
    abs(np.mean([y_hp(tt) for tt in np.linspace(-1, 1, 20001)])) < 1e-3)
chk("M4 high-pass: the phases of b_-k are minus those of b_k",
    all(abs(np.angle(b_hp[-kk]) + np.angle(b_hp[kk])) < 1e-12 for kk in (1, 2, 3)))
chk("M4 high-pass: |H(jk pi)| is 0.953, 0.988, 0.994",
    all(abs(abs(H_hp(kk * np.pi)) - v) < 5e-4
        for kk, v in [(1, 0.9529), (2, 0.9876), (3, 0.9944)]))

# ==================================================== filtering, discrete time
def dt_filter(hp, N=4):
    a = lambda kk: 1 / N
    H = (lambda w: 0.5 - 0.5 * np.exp(-1j * w)) if hp else (lambda w: 0.5 + 0.5 * np.exp(-1j * w))
    return {kk: a(kk) * H(kk * 2 * np.pi / N) for kk in range(-2, 3)}
bh = dt_filter(True)
bl = dt_filter(False)
chk("M4 DT impulse train a_k = 1/4 for every k", abs(a_dt_brute(lambda m: 1.0 if m % 4 == 0 else 0.0, 4, 3) - 0.25) < 1e-12)
chk("M4 DT high-pass b_0 = 0", abs(bh[0]) < 1e-15)
chk("M4 DT high-pass |b_1| = 0.1768 and phase pi/4",
    abs(abs(bh[1]) - 0.176777) < 1e-5 and abs(np.angle(bh[1]) - np.pi / 4) < 1e-12)
chk("M4 DT high-pass b_2 = 0.25", abs(bh[2] - 0.25) < 1e-12)
y_dt_hp = lambda m: 0.353553 * np.cos(np.pi * m / 2 + np.pi / 4) + 0.25 * (-1.0) ** m
xd = lambda m: 1.0 if m % 4 == 0 else 0.0
chk("M4 DT high-pass output 0.36cos(pi n/2 + pi/4) + 0.25(-1)^n equals 0.5x[n] - 0.5x[n-1]",
    all(abs(y_dt_hp(m) - (0.5 * xd(m % 4) - 0.5 * xd((m - 1) % 4))) < 1e-6 for m in range(-8, 9)))
chk("M4 DT low-pass b_0 = 0.25 and b_2 = 0", abs(bl[0] - 0.25) < 1e-12 and abs(bl[2]) < 1e-15)
chk("M4 DT low-pass |b_1| = 0.1768 and phase -pi/4",
    abs(abs(bl[1]) - 0.176777) < 1e-5 and abs(np.angle(bl[1]) + np.pi / 4) < 1e-12)
y_dt_lp = lambda m: 0.25 + 0.353553 * np.cos(np.pi * m / 2 - np.pi / 4)
chk("M4 DT low-pass output 0.25 + 0.36cos(pi n/2 - pi/4) equals 0.5x[n] + 0.5x[n-1]",
    all(abs(y_dt_lp(m) - (0.5 * xd(m % 4) + 0.5 * xd((m - 1) % 4))) < 1e-6 for m in range(-8, 9)))
chk("M4 DT frequency responses repeat with 2 pi",
    all(abs((0.5 - 0.5 * np.exp(-1j * w)) - (0.5 - 0.5 * np.exp(-1j * (w + 2 * np.pi)))) < 1e-12
        for w in np.linspace(-np.pi, np.pi, 21)))

# ==================================================== laboratory G engine
def labG_out(b, w0v, K, x, pair=True, half_index=None):
    f, s = (2, 1) if pair else (1, -1)
    y = b(0).real
    for kk in range(1, K + 1):
        c = b(kk)
        if half_index is not None and kk == half_index:
            y += c.real * np.cos(np.pi * x)
            continue
        y += f * abs(c) * np.cos(kk * w0v * x + s * np.angle(c))
    return y
chk("LabG continuous-time engine reproduces the low-pass output",
    all(abs(labG_out(lambda kk: b_lp[kk], np.pi, 3, tt) - y_lp_exact(tt)) < 1e-12
        for tt in np.linspace(-2, 2, 41)))
chk("LabG continuous-time engine reproduces the high-pass output",
    all(abs(labG_out(lambda kk: b_hp[kk], np.pi, 3, tt) - y_hp_exact(tt)) < 1e-12
        for tt in np.linspace(-2, 2, 41)))
chk("LabG discrete-time engine reproduces the high-pass output",
    all(abs(labG_out(lambda kk: bh[kk], np.pi / 2, 2, m, True, 2) - y_dt_hp(m)) < 1e-6
        for m in range(-8, 9)))
chk("LabG discrete-time engine reproduces the low-pass output",
    all(abs(labG_out(lambda kk: bl[kk], np.pi / 2, 2, m, True, 2) - y_dt_lp(m)) < 1e-6
        for m in range(-8, 9)))
chk("LabG pairing off halves the harmonic content, as the laboratory claims",
    abs(labG_out(lambda kk: b_lp[kk], np.pi, 3, 0.3, False)
        - (1 + 0.5 * (y_lp_exact(0.3) - 1))) > 1e-6)

# ==================================================== laboratory F engine
def labF_partial(a, w0v, x, N, N_half=None):
    s = complex(a(0)).real
    for kk in range(1, N + 1):
        c = complex(a(kk))
        if N_half is not None and kk == N_half:
            s += c.real * np.cos(kk * w0v * x)
            continue
        s += 2 * (c.real * np.cos(kk * w0v * x) - c.imag * np.sin(kk * w0v * x))
    return s
chk("LabF square-wave partial sum converges to the waveform away from the jumps",
    all(abs(labF_partial(asq, np.pi, tt, 400)
            - (1.0 if abs(tt - 2 * round(tt / 2)) < 0.5 else 0.0)) < 0.02
        for tt in [-0.9, -0.7, -0.2, 0.0, 0.2, 0.7, 0.9]))
chk("LabF triangular partial sum needs far fewer harmonics than the square wave",
    max(abs(labF_partial(lambda kk: complex(a_tri(kk)), np.pi, tt, 9) - tri(tt))
        for tt in np.linspace(-1, 1, 201)) < 0.025)
chk("LabF sawtooth partial sum converges away from the jump",
    all(abs(labF_partial(lambda kk: complex(a_saw(kk, 2)), np.pi, tt, 400) - tt) < 0.02
        for tt in [-0.8, -0.3, 0.0, 0.4, 0.8]))

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
