"""Module 4 — Fourier Series. Independent re-derivation of every number
stated in the Check step of a D4-xx solution.

Each claim is computed here by a route that does not reuse the algebra of the
solution: numerical evaluation of the analysis integral or sum (trapezoid
quadrature in continuous time, a direct finite sum in discrete time) instead
of the closed-form antiderivative, a second choice of integration window
instead of trusting periodicity by assertion, brute-force minimal-period
search instead of the rationality formula, and direct time-domain
convolution instead of the eigenfunction algebra."""
import math

import numpy as np
import sympy as sp

from drill_common import chk, close, allclose

j = 1j
_trapz = getattr(np, 'trapezoid', None) or np.trapz


def ct_analysis(x, T0, w0, k, n=400001):
    """Numerical Fourier-series analysis integral a_k = (1/T0) int x(t) e^{-jk w0 t} dt
    over one period centred at 0, by the trapezoid rule."""
    tt = np.linspace(-T0 / 2, T0 / 2, n)
    xt = x(tt)
    integrand = xt * np.exp(-1j * k * w0 * tt)
    return complex(_trapz(integrand, tt) / T0)


def dt_analysis(xvals, N, k):
    """Discrete-time analysis sum a_k = (1/N) sum_{n=0}^{N-1} x[n] e^{-jk(2pi/N)n}."""
    nn = np.arange(N)
    return complex(np.sum(np.asarray(xvals, dtype=complex) * np.exp(-1j * k * 2 * np.pi * nn / N)) / N)


def dt_min_period(f, Nmax=64, tol=1e-9, span=80):
    """Brute-force fundamental period of a discrete-time signal f(n)."""
    ns = np.arange(0, span)
    base = f(ns)
    for N in range(1, Nmax + 1):
        if np.allclose(f(ns + N), base, atol=tol):
            return N
    return None


# ===========================================================================
# D4-01 — sum of two CT sinusoids
# ===========================================================================
w0_01 = 2 * np.pi / 3
x01 = lambda t: 4 + 2 * np.cos(2 * np.pi * t) + 6 * np.sin(2 * np.pi / 3 * t)

a0_01 = ct_analysis(x01, 3, w0_01, 0)
a1_01 = ct_analysis(x01, 3, w0_01, 1)
a3_01 = ct_analysis(x01, 3, w0_01, 3)
am1_01 = ct_analysis(x01, 3, w0_01, -1)

chk("D4-01 a0 = 4 (numeric analysis integral)", close(a0_01, 4, tol=1e-4), f"{a0_01}")
chk("D4-01 a1 = -3j (numeric analysis integral)", close(a1_01, -3j, tol=1e-4), f"{a1_01}")
chk("D4-01 a3 = 1 (numeric analysis integral)", close(a3_01, 1, tol=1e-4), f"{a3_01}")
chk("D4-01 a(-1) = conj(a1)", close(am1_01, np.conj(a1_01), tol=1e-6), f"{am1_01} vs {np.conj(a1_01)}")


# ===========================================================================
# D4-02 — CT rectangular pulse, T0=6, T1=1, height=3
# ===========================================================================
T0_02, T1_02, h_02 = 6.0, 1.0, 3.0
w0_02 = 2 * np.pi / T0_02
x02 = lambda t: np.where(np.abs(((t + T0_02 / 2) % T0_02) - T0_02 / 2) < T1_02, h_02, 0.0)

a0_02 = ct_analysis(x02, T0_02, w0_02, 0)
a1_02 = ct_analysis(x02, T0_02, w0_02, 1)
a4_02 = ct_analysis(x02, T0_02, w0_02, 4)
a3_02 = ct_analysis(x02, T0_02, w0_02, 3)

chk("D4-02 a0 = 1 (numeric analysis integral)", close(a0_02, 1, tol=1e-3), f"{a0_02}")
chk("D4-02 a1 = 0.826993 (numeric analysis integral)", close(a1_02, 0.826993, tol=1e-3), f"{a1_02}")
chk("D4-02 a4 = -0.206748 (numeric analysis integral)", close(a4_02, -0.206748, tol=1e-3), f"{a4_02}")
chk("D4-02 a3 = 0 (third harmonic absent)", close(a3_02, 0, tol=1e-3), f"{a3_02}")


# ===========================================================================
# D4-03 — CT triangular wave, T0=2
# ===========================================================================
T0_03 = 2.0
w0_03 = np.pi
x03 = lambda t: 1 - np.abs(((t + 1) % 2) - 1)

a0_03 = ct_analysis(x03, T0_03, w0_03, 0)
a1_03 = ct_analysis(x03, T0_03, w0_03, 1)
a3_03 = ct_analysis(x03, T0_03, w0_03, 3)
a2_03 = ct_analysis(x03, T0_03, w0_03, 2)

chk("D4-03 a0 = 0.5 (numeric analysis integral)", close(a0_03, 0.5, tol=1e-4), f"{a0_03}")
chk("D4-03 a1 = 2/pi^2 (numeric analysis integral)", close(a1_03, 2 / np.pi ** 2, tol=1e-4), f"{a1_03}")
chk("D4-03 a3 = 2/(9 pi^2) (numeric analysis integral)", close(a3_03, 2 / (9 * np.pi ** 2), tol=1e-4), f"{a3_03}")
chk("D4-03 a2 = 0 (even harmonic absent)", close(a2_03, 0, tol=1e-4), f"{a2_03}")


# ===========================================================================
# D4-04 — synthesis in reverse, five given coefficients
# ===========================================================================
w0_04 = 2.0
a0_04, a2_04, am2_04, a5_04, am5_04 = -1, 3j, -3j, 2 * np.exp(1j * np.pi / 3 * 0 + 1j * np.pi / 4), 2 * np.exp(-1j * np.pi / 4)


def x04_direct(t):
    return (a0_04 + a2_04 * np.exp(1j * 2 * w0_04 * t) + am2_04 * np.exp(-1j * 2 * w0_04 * t)
            + a5_04 * np.exp(1j * 5 * w0_04 * t) + am5_04 * np.exp(-1j * 5 * w0_04 * t))


def x04_real(t):
    return -1 + 6 * np.cos(4 * t + np.pi / 2) + 4 * np.cos(10 * t + np.pi / 4)


for tv, expected in [(0.0, -1 + 2 * np.sqrt(2)), (np.pi / 8, -7.0), (0.3, None)]:
    d = complex(x04_direct(tv))
    r = x04_real(tv)
    ok = close(d, r, tol=1e-6) and (expected is None or close(d, expected, tol=1e-6))
    chk(f"D4-04 x({tv:.4f}) direct sum = real form", ok, f"direct={d}, real={r}")


# ===========================================================================
# D4-05 — CT sum of sinusoids, average power
# ===========================================================================
w0_05 = 5.0
x05 = lambda t: -3 + 4 * np.cos(5 * t) - 2 * np.sin(15 * t)
T0_05 = 2 * np.pi / 5

a1_05 = ct_analysis(x05, T0_05, w0_05, 1)
a3_05 = ct_analysis(x05, T0_05, w0_05, 3)
chk("D4-05 a1 = 2 (numeric analysis integral)", close(a1_05, 2, tol=1e-3), f"{a1_05}")
chk("D4-05 a3 = j (numeric analysis integral)", close(a3_05, 1j, tol=1e-3), f"{a3_05}")

tt05 = np.linspace(-T0_05 / 2, T0_05 / 2, 400001)
P_time_05 = float(_trapz(x05(tt05) ** 2, tt05) / T0_05)
chk("D4-05 P = 19 W (direct time-domain average)", close(P_time_05, 19, tol=1e-3), f"{P_time_05}")

a0_05 = -3.0
P_par_05 = a0_05 ** 2 + 2 * abs(a1_05) ** 2 + 2 * abs(a3_05) ** 2
chk("D4-05 Parseval sum (numeric a_k) = 19 W", close(P_par_05, 19, tol=1e-2), f"{P_par_05}")


# ===========================================================================
# D4-06 — CT piecewise pulse, average power over two windows
# ===========================================================================
T0_06 = 4.0
x06 = lambda t: np.where((t % T0_06) < 1.0, 3.0, -1.0)

tt_a = np.linspace(0.0, 4.0, 400001, endpoint=False)
P1_06 = float(_trapz(x06(tt_a) ** 2, tt_a) / T0_06)
tt_b = np.linspace(-2.0, 2.0, 400001, endpoint=False)
P2_06 = float(_trapz(x06(tt_b) ** 2, tt_b) / T0_06)
tt_c = np.linspace(0.0, 8.0, 800001, endpoint=False)
P3_06 = float(_trapz(x06(tt_c) ** 2, tt_c) / (2 * T0_06))

chk("D4-06 P = 3 W over window [0,4)", close(P1_06, 3, tol=1e-3), f"{P1_06}")
chk("D4-06 P = 3 W over window [-2,2)", close(P2_06, 3, tol=1e-3), f"{P2_06}")
chk("D4-06 P = 3 W over window [0,8) (two periods)", close(P3_06, 3, tol=1e-3), f"{P3_06}")


# ===========================================================================
# D4-07 — DT sequence [1,2,-1,2], average power
# ===========================================================================
x07 = [1, 2, -1, 2]
N_07 = 4
ak_07 = [dt_analysis(x07, N_07, kk) for kk in range(N_07)]
expected_07 = [1.0, 0.5, -1.0, 0.5]
chk("D4-07 a_k = [1, 0.5, -1, 0.5] (direct DFT sum)",
    all(close(ak_07[i], expected_07[i], tol=1e-9) for i in range(4)), f"{ak_07}")

P_time_07 = float(np.mean(np.array(x07, dtype=float) ** 2))
P_par_07 = float(sum(abs(v) ** 2 for v in ak_07))
chk("D4-07 P = 2.5 W (direct time-domain mean)", close(P_time_07, 2.5), f"{P_time_07}")
chk("D4-07 P = 2.5 W (Parseval, numeric a_k)", close(P_par_07, 2.5, tol=1e-9), f"{P_par_07}")


# ===========================================================================
# D4-08 — convergence: triangular-wave power capture
# ===========================================================================
tt08 = np.linspace(-1.0, 1.0, 800001)
x08 = 1 - np.abs(tt08)
P_time_08 = float(_trapz(x08 ** 2, tt08) / 2.0)
chk("D4-08 P = 1/3 W (direct time-domain integral)", close(P_time_08, 1 / 3, tol=1e-4), f"{P_time_08}")

odd_k = np.arange(1, 40001, 2)
ak_sum = 2.0 / (odd_k * np.pi) ** 2
P_series_08 = 0.25 + 2 * float(np.sum(ak_sum ** 2))
chk("D4-08 P = 1/3 W (infinite harmonic sum, many terms)", close(P_series_08, 1 / 3, tol=1e-6), f"{P_series_08}")

captured_08 = 0.25 + 2 * (2 / np.pi ** 2) ** 2
fraction_08 = captured_08 / P_time_08
chk("D4-08 DC + first harmonic capture > 99% of the power", fraction_08 > 0.99, f"fraction={fraction_08}")


# ===========================================================================
# D4-09 — CT frequency response, H(jw) = 5/(5+jw)
# ===========================================================================
def H09(w):
    return 5 / (5 + 1j * w)


chk("D4-09 H(j0) = 1", close(H09(0), 1, tol=1e-9), f"{H09(0)}")
chk("D4-09 |H(j5)| = 1/sqrt(2)", close(abs(H09(5)), 1 / np.sqrt(2), tol=1e-9), f"{abs(H09(5))}")
chk("D4-09 angle H(j5) = -pi/4", close(np.angle(H09(5)), -np.pi / 4, tol=1e-9), f"{np.angle(H09(5))}")

tau09 = np.linspace(0, 40, 400001)
h09 = 5 * np.exp(-5 * tau09)
area09 = float(_trapz(h09, tau09))
chk("D4-09 H(j0) = area under h(t) (numeric integral of h)", close(area09, 1.0, tol=1e-3), f"{area09}")


# ===========================================================================
# D4-10 — CT output coefficients, low-pass system
# ===========================================================================
def H10(w):
    return 3 / (3 + 1j * w)


tau10 = np.linspace(0, 60, 600001)
h10 = 3 * np.exp(-3 * tau10)
Hj4_num = complex(_trapz(h10 * np.exp(-1j * 4 * tau10), tau10))
chk("D4-10 H(j4) = 0.36-0.48j (numeric integral of h)", close(Hj4_num, 0.36 - 0.48j, tol=1e-3), f"{Hj4_num}")

a0_10, a1_10 = 2.0, 1.5
b1_10 = a1_10 * H10(4)
chk("D4-10 b1 = a1*H(j4)", close(b1_10, 0.54 - 0.72j, tol=1e-9), f"{b1_10}")


def y10_real(t):
    return 2 + 2 * abs(b1_10) * np.cos(4 * t + np.angle(b1_10))


def x10(t):
    return 2 + 3 * np.cos(4 * t)


def conv10(t):
    tau = np.linspace(0, 25, 400001)
    return float(_trapz(3 * np.exp(-3 * tau) * x10(t - tau), tau))


for tv in [0.0, 0.5, 1.0]:
    c = conv10(tv)
    r = y10_real(tv)
    chk(f"D4-10 y({tv}) direct convolution = eigenfunction route", close(c, r, tol=1e-3), f"conv={c}, formula={r}")


# ===========================================================================
# D4-11 — DT frequency response, three-tap smoothing filter
# ===========================================================================
def H11(w):
    return 0.25 + 0.5 * np.exp(-1j * w) + 0.25 * np.exp(-2j * w)


ws11 = np.linspace(-np.pi, np.pi, 25)
closed11 = np.cos(ws11 / 2) ** 2 * np.exp(-1j * ws11)
chk("D4-11 H(e^{jw}) = cos^2(w/2) e^{-jw} for all w",
    allclose(H11(ws11), closed11, tol=1e-9), "max err "
    f"{np.max(np.abs(H11(ws11) - closed11))}")
chk("D4-11 H(e^{j0}) = 1", close(H11(0), 1, tol=1e-9), f"{H11(0)}")
chk("D4-11 H(e^{jpi}) = 0", close(H11(np.pi), 0, tol=1e-9), f"{H11(np.pi)}")


# ===========================================================================
# D4-12 — DT output coefficients, two-tap system
# ===========================================================================
x12 = [1, 0, -1, 0]
N_12 = 4
ak_12 = [dt_analysis(x12, N_12, kk) for kk in range(N_12)]
chk("D4-12 a1 = 0.5 (direct DFT sum)", close(ak_12[1], 0.5, tol=1e-9), f"{ak_12[1]}")


def H12(w):
    return 0.6 + 0.4 * np.exp(-1j * w)


w0_12 = np.pi / 2
Hval12 = H12(w0_12)
chk("D4-12 H(e^{j pi/2}) = 0.6-0.4j", close(Hval12, 0.6 - 0.4j, tol=1e-9), f"{Hval12}")

b1_12 = ak_12[1] * Hval12


def xext12(nn):
    return x12[nn % 4]


def y12_real(nn):
    return 2 * abs(b1_12) * np.cos(w0_12 * nn + np.angle(b1_12))


for nn in range(4):
    yconv = 0.6 * xext12(nn) + 0.4 * xext12(nn - 1)
    yform = y12_real(nn)
    chk(f"D4-12 y[{nn}] direct convolution = eigenfunction route", close(yconv, yform, tol=1e-6),
        f"conv={yconv}, formula={yform}")


# ===========================================================================
# D4-13 — DT sum of two sinusoids, N=24
# ===========================================================================
w1_13, w2_13 = np.pi / 4, 2 * np.pi / 3


def x13(n):
    return 3 * np.cos(w1_13 * n) - np.sin(w2_13 * n)


N0_13 = dt_min_period(x13, Nmax=48)
chk("D4-13 N0 = 24 (brute-force minimal period)", N0_13 == 24, f"{N0_13}")

w0_13 = 2 * np.pi / 24
chk("D4-13 first term is the 3rd harmonic", close(w1_13 / w0_13, 3, tol=1e-9), f"{w1_13 / w0_13}")
chk("D4-13 second term is the 8th harmonic", close(w2_13 / w0_13, 8, tol=1e-9), f"{w2_13 / w0_13}")

x13_samples = [x13(nn) for nn in range(24)]
a3_13 = dt_analysis(x13_samples, 24, 3)
a8_13 = dt_analysis(x13_samples, 24, 8)
am3_13 = dt_analysis(x13_samples, 24, -3)
chk("D4-13 a3 = 1.5 (direct 24-point analysis sum)", close(a3_13, 1.5, tol=1e-6), f"{a3_13}")
chk("D4-13 a8 = 0.5j (direct 24-point analysis sum)", close(a8_13, 0.5j, tol=1e-6), f"{a8_13}")
chk("D4-13 a(-3) = conj(a3)", close(am3_13, np.conj(a3_13), tol=1e-9), f"{am3_13} vs {np.conj(a3_13)}")


# ===========================================================================
# D4-14 — DT rectangular sequence, N=6
# ===========================================================================
x14 = [1, 1, 0, 0, 0, 1]
N_14 = 6
a0_14 = dt_analysis(x14, N_14, 0)
a1_14 = dt_analysis(x14, N_14, 1)
a3_14 = dt_analysis(x14, N_14, 3)
chk("D4-14 a0 = 1/2 (direct analysis sum)", close(a0_14, 0.5, tol=1e-9), f"{a0_14}")
chk("D4-14 a1 = 1/3 (direct analysis sum)", close(a1_14, 1 / 3, tol=1e-9), f"{a1_14}")
chk("D4-14 a3 = -1/6 (direct analysis sum)", close(a3_14, -1 / 6, tol=1e-9), f"{a3_14}")
chk("D4-14 a0 = mean of one period", close(a0_14, float(np.mean(x14)), tol=1e-12), f"{a0_14} vs {np.mean(x14)}")


# ===========================================================================
# D4-15 — DT synthesis in reverse, N=5
# ===========================================================================
w0_15 = 2 * np.pi / 5
a0_15, a1_15, a4_15 = 2.0, 1 + 1j, 1 - 1j


def x15_direct(nn):
    return a0_15 + a1_15 * np.exp(1j * w0_15 * nn) + a4_15 * np.exp(1j * 4 * w0_15 * nn)


def x15_real(nn):
    return a0_15 + 2 * abs(a1_15) * np.cos(w0_15 * nn + np.angle(a1_15))


for nn, expected in [(0, 4.0), (1, None)]:
    d = complex(x15_direct(nn))
    r = x15_real(nn)
    ok = close(d, r, tol=1e-6) and (expected is None or close(d, expected, tol=1e-6))
    chk(f"D4-15 x[{nn}] direct sum = real form", ok, f"direct={d}, real={r}")

chk("D4-15 |a1| = sqrt(2)", close(abs(a1_15), np.sqrt(2), tol=1e-9), f"{abs(a1_15)}")
chk("D4-15 angle(a1) = pi/4", close(np.angle(a1_15), np.pi / 4, tol=1e-9), f"{np.angle(a1_15)}")


# ===========================================================================
# D4-16 — DT exactness: reconstruction and a dropped coefficient
# ===========================================================================
N_16 = 6
w0_16 = np.pi / 3
a16 = [0.5, 1 / 3, 0.0, -1 / 6, 0.0, 1 / 3]


def synth16(nn, coeffs):
    return sum(coeffs[kk] * np.exp(1j * w0_16 * kk * nn) for kk in range(N_16))


x0_full = synth16(0, a16)
x2_full = synth16(2, a16)
chk("D4-16 x[0] from all six coefficients = 1", close(x0_full, 1.0, tol=1e-9), f"{x0_full}")
chk("D4-16 x[2] from all six coefficients = 0", close(x2_full, 0.0, tol=1e-9), f"{x2_full}")

a16_drop = list(a16)
a16_drop[3] = 0.0
x2_drop = synth16(2, a16_drop)
chk("D4-16 x[2] with a3 dropped has error 1/6", close(x2_drop, 1 / 6, tol=1e-9), f"{x2_drop}")


# ===========================================================================
# D4-17 — time shift, general property + numeric check
# ===========================================================================
w0_17, t0_17 = np.pi, 0.5
a1_17, a2_17 = 2.0, 1 - 1j
am1_17, am2_17 = 2.0, 1 + 1j

b1_17 = a1_17 * np.exp(-1j * w0_17 * 1 * t0_17)
b2_17 = a2_17 * np.exp(-1j * w0_17 * 2 * t0_17)
chk("D4-17 |b1| = |a1|", close(abs(b1_17), abs(a1_17), tol=1e-9), f"{abs(b1_17)} vs {abs(a1_17)}")
chk("D4-17 |b2| = |a2|", close(abs(b2_17), abs(a2_17), tol=1e-9), f"{abs(b2_17)} vs {abs(a2_17)}")

phase_diff = np.angle(b2_17) - np.angle(a2_17)
phase_diff_wrapped = (phase_diff + np.pi) % (2 * np.pi) - np.pi
expected_wrapped = (-2 * w0_17 * t0_17 + np.pi) % (2 * np.pi) - np.pi
chk("D4-17 angle(b2)-angle(a2) = -2*w0*t0 (mod 2pi)",
    close(phase_diff_wrapped, expected_wrapped, tol=1e-6), f"{phase_diff_wrapped} vs {expected_wrapped}")


def xpartial17(t):
    return am1_17 * np.exp(-1j * w0_17 * t) + a1_17 * np.exp(1j * w0_17 * t) + \
           am2_17 * np.exp(-1j * 2 * w0_17 * t) + a2_17 * np.exp(1j * 2 * w0_17 * t)


bm1_17, bm2_17 = np.conj(b1_17), np.conj(b2_17)


def ypartial17(t):
    return bm1_17 * np.exp(-1j * w0_17 * t) + b1_17 * np.exp(1j * w0_17 * t) + \
           bm2_17 * np.exp(-1j * 2 * w0_17 * t) + b2_17 * np.exp(1j * 2 * w0_17 * t)


y0_from_b = complex(ypartial17(0))
x_shifted_direct = complex(xpartial17(-t0_17))
chk("D4-17 y(0) from shifted coefficients = x(-t0) direct substitution",
    close(y0_from_b, x_shifted_direct, tol=1e-9), f"{y0_from_b} vs {x_shifted_direct}")


# ===========================================================================
# D4-18 — reversal + conjugation forces a_k real (symbolic)
# ===========================================================================
p, q = sp.symbols('p q', real=True)
a3_sym = p + sp.I * q
# evenness: a(-3) = a3 ; conjugation (realness): a(-3) = conjugate(a3) = p - I*q
sol18 = sp.solve(sp.Eq(a3_sym, sp.conjugate(a3_sym)), q)
chk("D4-18 real+even forces Im(a3) = 0 (symbolic solve)", sol18 == [0], f"{sol18}")

chk("D4-18 a3 = 2-5j is inconsistent with real+even (Im != 0)", (2 - 5j).imag != 0, f"Im = {(2 - 5j).imag}")
chk("D4-18 a3 = 2 is consistent with real+even (Im = 0)", (2 + 0j).imag == 0, "Im = 0")


# ===========================================================================
# D4-19 — real, odd, bipolar square wave
# ===========================================================================
T0_19 = 2.0
w0_19 = np.pi
x19 = lambda t: np.where((t % T0_19) < 1.0, 1.0, -1.0)

for kk in [1, 2, 3, 4]:
    ak = ct_analysis(x19, T0_19, w0_19, kk)
    expected = (-2j / (kk * np.pi)) if kk % 2 != 0 else 0.0
    chk(f"D4-19 a{kk} (numeric analysis integral)", close(ak, expected, tol=1e-3), f"{ak} vs {expected}")

a0_19 = ct_analysis(x19, T0_19, w0_19, 0)
chk("D4-19 a0 = 0 (numeric analysis integral)", close(a0_19, 0, tol=1e-3), f"{a0_19}")


# ===========================================================================
# D4-20 — capstone: conjugate symmetry, real form, power two ways
# ===========================================================================
w0_20 = 1.0
a0_20 = 1.0
a3_20 = 2 * np.exp(1j * np.pi / 3)
a5_20 = 1 - 1j
am3_20 = np.conj(a3_20)
am5_20 = np.conj(a5_20)

chk("D4-20 a(-3) = conj(a3)", close(am3_20, 2 * np.exp(-1j * np.pi / 3), tol=1e-9), f"{am3_20}")
chk("D4-20 a(-5) = conj(a5) = 1+j", close(am5_20, 1 + 1j, tol=1e-9), f"{am5_20}")


def x20_direct(t):
    return (a0_20 + a3_20 * np.exp(1j * 3 * w0_20 * t) + am3_20 * np.exp(-1j * 3 * w0_20 * t)
            + a5_20 * np.exp(1j * 5 * w0_20 * t) + am5_20 * np.exp(-1j * 5 * w0_20 * t))


def x20_real(t):
    return a0_20 + 4 * np.cos(3 * t + np.pi / 3) + 2 * np.sqrt(2) * np.cos(5 * t - np.pi / 4)


d20 = complex(x20_direct(0))
r20 = x20_real(0)
chk("D4-20 x(0) direct sum = real form = 5", close(d20, r20, tol=1e-9) and close(d20, 5, tol=1e-9),
    f"direct={d20}, real={r20}")

P_par_20 = a0_20 ** 2 + 2 * abs(a3_20) ** 2 + 2 * abs(a5_20) ** 2
A3_20, A5_20 = 2 * abs(a3_20), 2 * abs(a5_20)
P_amp_20 = a0_20 ** 2 + A3_20 ** 2 / 2 + A5_20 ** 2 / 2
chk("D4-20 Parseval power = 13 W", close(P_par_20, 13, tol=1e-9), f"{P_par_20}")
chk("D4-20 amplitude-rule power = 13 W", close(P_amp_20, 13, tol=1e-9), f"{P_amp_20}")

tt20 = np.linspace(0, 2 * np.pi, 400001)
xt20 = x20_real(tt20)
P_time_20 = float(_trapz(xt20 ** 2, tt20) / (2 * np.pi))
chk("D4-20 time-domain average power = 13 W (numeric integral)", close(P_time_20, 13, tol=1e-3), f"{P_time_20}")
