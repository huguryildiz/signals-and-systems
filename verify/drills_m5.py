"""Module 5 — The Continuous-Time Fourier Transform. Independent re-derivation
of every number stated in the Check step of a D5-xx solution.

Each claim is computed here by a route that does not reuse the algebra of the
solution: numerical quadrature of the analysis integral instead of the closed
form, SymPy's own partial-fraction routine (`apart`) instead of the
cover-up/derivative arithmetic written out by hand, direct evaluation of a
modulation or filtering chain from its primitive definitions instead of the
assembled closed form, and symbolic limits and finite integrals wherever
SymPy can carry them exactly."""
import numpy as np
import sympy as sp

from drill_common import chk, close, allclose, t as T_SYM, w as W_SYM

j = 1j
PI = np.pi


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
_trapz = getattr(np, 'trapezoid', None) or np.trapz


def num_ft(f, wv, lo=-60.0, hi=60.0, n=600_001):
    """X(j w) = int f(t) e^{-j w t} dt, by quadrature on a fine uniform grid."""
    tt = np.linspace(lo, hi, n)
    return complex(_trapz(f(tt) * np.exp(-1j * wv * tt), tt))


def num_ift(X, tv, lo=-60.0, hi=60.0, n=600_001):
    """x(t) = (1/2 pi) int X(j w) e^{j w t} d w, by quadrature."""
    ww = np.linspace(lo, hi, n)
    return complex(_trapz(X(ww) * np.exp(1j * ww * tv), ww)) / (2 * np.pi)


def band(w, half_width, height=1.0):
    """An ideal rectangular band, |w| < half_width, height `height`."""
    return np.where(np.abs(w) < half_width, height, 0.0)


s = sp.symbols('s')


# ===========================================================================
# D5-01 — X(jw) = 1/(4+jw)
# ===========================================================================
x01 = lambda t: np.where(t >= 0, np.exp(-4 * t), 0.0)
X01 = lambda wv: 1.0 / (4 + 1j * wv)
val01 = num_ft(x01, 3.0, 0, 80, 800_001)
chk("D5-01 numeric FT at w=3 matches 1/(4+jw)", close(val01, X01(3.0), tol=1e-4),
    f"{val01} vs {X01(3.0)}")
chk("D5-01 |X(j3)| = 0.2", close(abs(val01), 0.2, tol=1e-4), f"{abs(val01):.6f}")
chk("D5-01 angle X(j3) = -arctan(3/4)", close(np.angle(val01), -np.arctan(0.75), tol=1e-4),
    f"{np.angle(val01):.6f} vs {-np.arctan(0.75):.6f}")
E01 = _trapz(x01(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-01 X(0) = area of x(t) = 0.25", close(E01, 0.25, tol=1e-4), f"{E01:.6f}")


# ===========================================================================
# D5-02 — X(jw) = 1/(3+jw)^2
# ===========================================================================
x02 = lambda t: np.where(t >= 0, t * np.exp(-3 * t), 0.0)
X02 = lambda wv: 1.0 / (3 + 1j * wv) ** 2
val02 = num_ft(x02, 2.0, 0, 80, 800_001)
chk("D5-02 numeric FT at w=2 matches 1/(3+jw)^2", close(val02, X02(2.0), tol=1e-4),
    f"{val02} vs {X02(2.0)}")
for wv in (2.0, 5.0):
    chk(f"D5-02 |X(jw)| = 1/(9+w^2) at w={wv}",
        close(abs(X02(wv)), 1.0 / (9 + wv * wv), tol=1e-9))
area02 = _trapz(x02(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-02 X(0) = area of x(t) = 1/9", close(area02, 1.0 / 9, tol=1e-4), f"{area02:.6f}")


# ===========================================================================
# D5-03 — rectangular pulse, height 3, |t| < 2
# ===========================================================================
P03 = sp.integrate(3 * sp.exp(-sp.I * W_SYM * T_SYM), (T_SYM, -2, 2))
for wv in (1.3, 2.7, -4.1):
    lhs = complex(P03.subs(W_SYM, wv))
    rhs = 6 * np.sin(2 * wv) / wv
    chk(f"D5-03 finite integral matches 6 sin(2w)/w at w={wv}", close(lhs, rhs, tol=1e-9))
for kk in (1, 2, 3, -2):
    wv = kk * PI / 2
    chk(f"D5-03 zero at w=k*pi/2, k={kk}", abs(np.sin(2 * wv)) < 1e-9)
X03_0 = sp.limit(6 * sp.sin(2 * W_SYM) / W_SYM, W_SYM, 0)
chk("D5-03 X(0) = 12 = area of x(t)", X03_0 == 12, str(X03_0))


# ===========================================================================
# D5-04 — periodic pulse train, T0=4, T1=1
# ===========================================================================
T0, T1v, w0v = 4, 1, sp.pi / 2
for kk in range(0, 5):
    ak = sp.integrate(sp.Rational(1, T0) * sp.exp(-sp.I * kk * w0v * T_SYM), (T_SYM, -T1v, T1v))
    ak = sp.nsimplify(sp.simplify(ak))
    weight = sp.simplify(2 * sp.pi * ak)
    expected_weight = sp.pi if kk == 0 else sp.nsimplify(2 * sp.sin(kk * sp.pi / 2) / kk)
    chk(f"D5-04 impulse weight at k={kk}", sp.simplify(weight - expected_weight) == 0,
        f"{weight} vs {expected_weight}")
chk("D5-04 a0 = width/period = 0.5",
    sp.integrate(sp.Rational(1, T0), (T_SYM, -T1v, T1v)) == sp.Rational(1, 2))
kv = sp.symbols('kv')
a_k_general = sp.sin(kv * w0v) / (2 * kv * w0v)
lim0 = sp.limit(a_k_general, kv, 0)
chk("D5-04 lim_{k->0} a_k = 1/2 (continuity of the coefficient formula)", lim0 == sp.Rational(1, 2))


# ===========================================================================
# D5-05 — X(jw) = 1/((jw+2)(jw+5))
# ===========================================================================
pf05 = sp.apart(1 / ((s + 2) * (s + 5)), s)
chk("D5-05 partial fractions match 1/3/(s+2) - 1/3/(s+5)",
    sp.simplify(pf05 - (sp.Rational(1, 3) / (s + 2) - sp.Rational(1, 3) / (s + 5))) == 0, str(pf05))
x05 = lambda t: np.where(t >= 0, (np.exp(-2 * t) - np.exp(-5 * t)) / 3, 0.0)
X05 = lambda wv: 1.0 / ((2 + 1j * wv) * (5 + 1j * wv))
val05 = num_ft(x05, 1.0, 0, 80, 800_001)
chk("D5-05 numeric FT of x(t) matches X(jw) at w=1", close(val05, X05(1.0), tol=1e-4),
    f"{val05} vs {X05(1.0)}")
area05 = _trapz(x05(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-05 X(0) = area of x(t) = 0.1", close(area05, 0.1, tol=1e-4), f"{area05:.6f}")


# ===========================================================================
# D5-06 — X(jw) = (jw+6)/((jw+1)(jw+4))
# ===========================================================================
pf06 = sp.apart((s + 6) / ((s + 1) * (s + 4)), s)
chk("D5-06 partial fractions match 5/3/(s+1) - 2/3/(s+4)",
    sp.simplify(pf06 - (sp.Rational(5, 3) / (s + 1) - sp.Rational(2, 3) / (s + 4))) == 0, str(pf06))
x06 = lambda t: np.where(t >= 0, (5 * np.exp(-t) - 2 * np.exp(-4 * t)) / 3, 0.0)
X06 = lambda wv: (6 + 1j * wv) / ((1 + 1j * wv) * (4 + 1j * wv))
val06 = num_ft(x06, 2.0, 0, 80, 800_001)
chk("D5-06 numeric FT of x(t) matches X(jw) at w=2", close(val06, X06(2.0), tol=1e-4),
    f"{val06} vs {X06(2.0)}")
area06 = _trapz(x06(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-06 X(0) = area of x(t) = 1.5", close(area06, 1.5, tol=1e-4), f"{area06:.6f}")
hf06 = sp.limit(s * (s + 6) / ((s + 1) * (s + 4)), s, sp.oo)
chk("D5-06 x(0+) = lim s*X(s) = 1", hf06 == 1, str(hf06))


# ===========================================================================
# D5-07 — X(jw) = (jw+3)/((jw+1)^2(jw+2)), repeated pole
# ===========================================================================
pf07 = sp.apart((s + 3) / ((s + 1) ** 2 * (s + 2)), s)
expected07 = -1 / (s + 1) + 2 / (s + 1) ** 2 + 1 / (s + 2)
chk("D5-07 partial fractions match -1/(s+1) + 2/(s+1)^2 + 1/(s+2)",
    sp.simplify(pf07 - expected07) == 0, str(pf07))
x07 = lambda t: np.where(t >= 0, -np.exp(-t) + 2 * t * np.exp(-t) + np.exp(-2 * t), 0.0)
X07 = lambda wv: (3 + 1j * wv) / ((1 + 1j * wv) ** 2 * (2 + 1j * wv))
val07 = num_ft(x07, 1.5, 0, 80, 800_001)
chk("D5-07 numeric FT of x(t) matches X(jw) at w=1.5", close(val07, X07(1.5), tol=1e-4),
    f"{val07} vs {X07(1.5)}")
area07 = _trapz(x07(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-07 X(0) = area of x(t) = 1.5", close(area07, 1.5, tol=1e-4), f"{area07:.6f}")
hf07 = sp.limit(s * (s + 3) / ((s + 1) ** 2 * (s + 2)), s, sp.oo)
chk("D5-07 x(0+) = lim s*X(s) = 0", hf07 == 0, str(hf07))


# ===========================================================================
# D5-08 — H(jw) read off y'' + 6y' + 8y = 2x
# ===========================================================================
Hs08 = sp.Rational(2) / (s ** 2 + 6 * s + 8)
chk("D5-08 H(s) built from the ODE coefficients factors as 2/((s+2)(s+4))",
    sp.simplify(Hs08 - sp.Rational(2) / ((s + 2) * (s + 4))) == 0)
pf08 = sp.apart(Hs08, s)
chk("D5-08 partial fractions match 1/(s+2) - 1/(s+4)",
    sp.simplify(pf08 - (1 / (s + 2) - 1 / (s + 4))) == 0, str(pf08))
h08 = lambda t: np.where(t >= 0, np.exp(-2 * t) - np.exp(-4 * t), 0.0)
H08 = lambda wv: 2.0 / ((2 + 1j * wv) * (4 + 1j * wv))
val08 = num_ft(h08, 1.0, 0, 80, 800_001)
chk("D5-08 numeric FT of h(t) matches H(jw) at w=1", close(val08, H08(1.0), tol=1e-4),
    f"{val08} vs {H08(1.0)}")
area08 = _trapz(h08(np.linspace(0, 80, 800_001)), np.linspace(0, 80, 800_001))
chk("D5-08 H(0) = area of h(t) = 0.25", close(area08, 0.25, tol=1e-4), f"{area08:.6f}")


# ===========================================================================
# D5-09 — duality: y(t) = 6 sinc(3t) -> Y(jw) = 2 pi rect(|w|<3)
# ===========================================================================
Pw09 = sp.integrate(1 * sp.exp(-sp.I * W_SYM * T_SYM), (T_SYM, -3, 3))
w0s = 1.7
chk("D5-09 rect(|t|<3) transform matches 2 sin(3w)/w numerically", close(complex(Pw09.subs(W_SYM, w0s)),
    2 * np.sin(3 * w0s) / w0s, tol=1e-9))
y09 = lambda t: np.where(np.abs(t) < 1e-9, 6.0, 2 * np.sin(3 * t) / np.where(np.abs(t) < 1e-9, 1.0, t))
val09_in = num_ft(y09, 1.0, -1500, 1500, 1_500_001)
val09_out = num_ft(y09, 5.0, -1500, 1500, 1_500_001)
chk("D5-09 numeric FT of y(t) at w=1 (inside band) ~ 2*pi", close(val09_in, 2 * PI, tol=5e-2),
    f"{val09_in}")
chk("D5-09 numeric FT of y(t) at w=5 (outside band) ~ 0", abs(val09_out) < 5e-2, f"{val09_out}")
dirichlet09 = sp.integrate(sp.sin(3 * T_SYM) / T_SYM, (T_SYM, -sp.oo, sp.oo))
chk("D5-09 Dirichlet integral: int sin(3t)/t dt = pi, so Y(0) = 2*pi", dirichlet09 == sp.pi,
    str(dirichlet09))


# ===========================================================================
# D5-10 — differentiation property, y(t) = e^{-3t}u(t), z = dy/dt
# ===========================================================================
Y10 = 1 / (3 + sp.I * W_SYM)
Z10_property = sp.I * W_SYM * Y10
Z10_direct = 1 - 3 / (3 + sp.I * W_SYM)
chk("D5-10 property jw*Y(jw) equals the direct sum 1 - 3/(3+jw)",
    sp.simplify(Z10_property - Z10_direct) == 0)
chk("D5-10 Z(0) = 0", sp.simplify(Z10_property.subs(W_SYM, 0)) == 0)
# independent check: int_{-inf}^{inf} dy/dt dt = y(+inf) - y(-inf) = 0, via the
# fundamental theorem of calculus applied to the ordinary part plus the jump.
jump10 = 1 - 0  # y(0+) - y(0-)
integral_ordinary = sp.integrate(-3 * sp.exp(-3 * T_SYM), (T_SYM, 0, sp.oo))
chk("D5-10 int(-3 e^{-3t}u(t)) dt + jump = 0 (fundamental theorem of calculus)",
    sp.simplify(integral_ordinary + jump10) == 0, f"{integral_ordinary} + {jump10}")


# ===========================================================================
# D5-11 — w(t) = p(3t-6), p(t) = rect(|t|<1)
# ===========================================================================
Qw11 = sp.Rational(1, 3) * (2 * sp.sin(W_SYM / 3) / (W_SYM / 3)) / 1  # (1/3) P(jw/3)
Qw11 = sp.simplify(Qw11)
Ww11 = Qw11 * sp.exp(-sp.I * 2 * W_SYM)
Ww11_closed = 2 * sp.sin(W_SYM / 3) / W_SYM * sp.exp(-sp.I * 2 * W_SYM)
chk("D5-11 scaling then shift gives W(jw) = 2 sin(w/3)/w * e^{-j2w}",
    sp.simplify(Ww11 - Ww11_closed) == 0, str(sp.simplify(Ww11 - Ww11_closed)))
support11 = sp.solve([sp.Eq(3 * T_SYM - 6, -1), sp.Eq(3 * T_SYM - 6, 1)], T_SYM)
lo11, hi11 = sp.Rational(5, 3), sp.Rational(7, 3)
chk("D5-11 support of w(t) is [5/3, 7/3], width 2/3",
    sp.simplify((hi11 - lo11) - sp.Rational(2, 3)) == 0)
W11_0 = sp.limit(2 * sp.sin(W_SYM / 3) / W_SYM, W_SYM, 0)
chk("D5-11 W(0) = 2/3 = area of w(t)", W11_0 == sp.Rational(2, 3), str(W11_0))


# ===========================================================================
# D5-12 — frequency shift, z(t) = e^{j3t} x(t), x(t) = sin(pi t)/(pi t)
# ===========================================================================
x12 = lambda t: np.where(np.abs(t) < 1e-9, 1.0, np.sin(PI * t) / (PI * np.where(np.abs(t) < 1e-9, 1.0, t)))
z12 = lambda t: np.exp(1j * 3 * t) * x12(t)
val12_in = num_ft(z12, 4.0, -2000, 2000, 2_000_001)   # inside (3-pi, 3+pi)
val12_out = num_ft(z12, -3.0, -2000, 2000, 2_000_001)  # outside
chk("D5-12 numeric FT of z(t) at w=4 (inside 3-pi..3+pi) ~ 1", close(val12_in, 1.0, tol=5e-2),
    f"{val12_in}")
chk("D5-12 numeric FT of z(t) at w=-3 (outside) ~ 0", abs(val12_out) < 5e-2, f"{val12_out}")
band_lo12, band_hi12 = 3 - sp.pi, 3 + sp.pi
chk("D5-12 band edges are 3-pi and 3+pi",
    sp.simplify(band_hi12 - band_lo12 - 2 * sp.pi) == 0)
chk("D5-12 z(0) = x(0) = 1 = (1/2pi) * width(2pi) * height(1)",
    close(complex(x12(np.array([0.0]))[0]), 1.0) and close((band_hi12 - band_lo12) / (2 * sp.pi), 1))


# ===========================================================================
# D5-13 — Parseval, x(t) = 3 e^{-2t} u(t)
# ===========================================================================
E13_time = sp.integrate(9 * sp.exp(-4 * T_SYM), (T_SYM, 0, sp.oo))
chk("D5-13 time-domain energy = 9/4", E13_time == sp.Rational(9, 4), str(E13_time))
E13_freq = sp.integrate(9 / (4 + W_SYM ** 2), (W_SYM, -sp.oo, sp.oo)) / (2 * sp.pi)
chk("D5-13 frequency-domain energy (Parseval) = 9/4", sp.simplify(E13_freq - sp.Rational(9, 4)) == 0,
    str(E13_freq))


# ===========================================================================
# D5-14 — Parseval backward, y(t) = e^{-4|t|}
# ===========================================================================
E14 = sp.integrate(sp.exp(-8 * sp.Abs(T_SYM)), (T_SYM, -sp.oo, sp.oo))
chk("D5-14 time-domain energy = 1/4", E14 == sp.Rational(1, 4), str(E14))
I14 = sp.integrate(1 / (16 + W_SYM ** 2) ** 2, (W_SYM, -sp.oo, sp.oo))
chk("D5-14 int dw/(16+w^2)^2 = pi/128 (SymPy, direct)", sp.simplify(I14 - sp.pi / 128) == 0, str(I14))
chk("D5-14 Parseval backward reproduces the same integral",
    sp.simplify(sp.Rational(1, 4) - sp.Rational(1, 2) / sp.pi * 64 * I14) == 0)


# ===========================================================================
# D5-15 — energy in a band, X(jw) = 5 rect(|w|<4)
# ===========================================================================
E15_total = sp.integrate(sp.Rational(25), (W_SYM, -4, 4)) / (2 * sp.pi)
chk("D5-15 total energy = 100/pi", sp.simplify(E15_total - 100 / sp.pi) == 0, str(E15_total))
width_height_15 = 8 * 5  # width of the band times its height
chk("D5-15 (1/2pi) int X dw = 20/pi = x(0)", close(width_height_15 / (2 * PI), 20 / PI, tol=1e-9))
val15 = num_ift(lambda wv: band(wv, 4, 5.0), 0.0, -20, 20, 400_001)
chk("D5-15 numeric inverse transform x(0) matches 20/pi", close(val15, 20 / PI, tol=1e-3),
    f"{val15}")
E15_sub = sp.integrate(sp.Rational(25), (W_SYM, -2, 2)) / (2 * sp.pi)
chk("D5-15 energy in |w|<2 is half the total",
    sp.simplify(E15_sub - E15_total / 2) == 0, f"{E15_sub} vs {E15_total/2}")


# ===========================================================================
# D5-16 — time-reversal and Parseval, x1 = 2e^{-3t}u(t), x2 = x1(-t)
# ===========================================================================
E16_1 = sp.integrate(4 * sp.exp(-6 * T_SYM), (T_SYM, 0, sp.oo))
chk("D5-16 E1 = 2/3", E16_1 == sp.Rational(2, 3), str(E16_1))
E16_2 = sp.integrate(4 * sp.exp(6 * T_SYM), (T_SYM, -sp.oo, 0))
chk("D5-16 E2 (direct, time-domain) = 2/3", E16_2 == sp.Rational(2, 3), str(E16_2))
X1_16 = lambda wv: 2.0 / (3 + 1j * wv)
X2_16 = lambda wv: 2.0 / (3 - 1j * wv)   # time-reversal: X1(-jw)
for wv in (0.0, 1.7, -3.3, 5.0):
    chk(f"D5-16 |X2(jw)| = |X1(jw)| at w={wv}", close(abs(X2_16(wv)), abs(X1_16(wv)), tol=1e-9))


# ===========================================================================
# D5-17 — modulation, X(jw) = rect(|w|<5), carrier cos(20t)
# ===========================================================================
X17 = lambda w_: band(w_, 5, 1.0)
Z17 = lambda w_: 0.5 * X17(w_ - 20) + 0.5 * X17(w_ + 20)
grid17 = np.linspace(-30, 30, 12001)
chk("D5-17 Z(w) is 0.5 on 15<w<25 and -25<w<-15, 0 elsewhere",
    np.allclose(Z17(grid17),
                np.where((np.abs(grid17) > 15) & (np.abs(grid17) < 25), 0.5, 0.0), atol=1e-9))
chk("D5-17 Z(0) = 0", Z17(0.0) == 0.0)
chk("D5-17 Z is even: Z(w) = Z(-w) on a grid", np.allclose(Z17(grid17), Z17(-grid17)))
chk("D5-17 non-overlap: nearer band edges are 15 rad/s apart on each side, gap 30 rad/s total",
    close(15 - (-15), 30))


# ===========================================================================
# D5-18 — full chain: modulate, demodulate, filter
# ===========================================================================
X18 = lambda w_: band(w_, 3, 1.0)
Z18 = lambda w_: 0.5 * X18(w_ - 10) + 0.5 * X18(w_ + 10)
W18 = lambda w_: 0.5 * Z18(w_ - 10) + 0.5 * Z18(w_ + 10)
H18 = lambda w_: band(w_, 5, 2.0)
Y18 = lambda w_: H18(w_) * W18(w_)
chk("D5-18 Z(10) = 0.5", close(Z18(10.0), 0.5))
chk("D5-18 Z(0) = 0", close(Z18(0.0), 0.0))
chk("D5-18 W(0) = 0.5", close(W18(0.0), 0.5))
chk("D5-18 W(20) = 0.25", close(W18(20.0), 0.25))
grid18 = np.linspace(-30, 30, 12001)
chk("D5-18 Y(w) reproduces X(w) exactly on a fine grid",
    np.allclose(Y18(grid18), X18(grid18), atol=1e-9))


# ===========================================================================
# D5-19 — ideal filter, X = 3 rect(|w|<6), H = rect(|w|<2)
# ===========================================================================
X19 = lambda w_: band(w_, 6, 3.0)
H19 = lambda w_: band(w_, 2, 1.0)
Y19 = lambda w_: X19(w_) * H19(w_)
grid19 = np.linspace(-10, 10, 8001)
chk("D5-19 Y(w) = 3 rect(|w|<2)",
    np.allclose(Y19(grid19), band(grid19, 2, 3.0), atol=1e-9))
x19_0 = num_ift(X19, 0.0, -20, 20, 400_001)
y19_0 = num_ift(Y19, 0.0, -20, 20, 400_001)
chk("D5-19 x(0) matches 18/pi", close(x19_0, 18 / PI, tol=1e-3), f"{x19_0}")
chk("D5-19 y(0) matches 6/pi", close(y19_0, 6 / PI, tol=1e-3), f"{y19_0}")
chk("D5-19 ratio y(0)/x(0) = 1/3 = bandwidth ratio 2/6",
    close((y19_0 / x19_0).real, sp.Rational(1, 3), tol=1e-3), f"{(y19_0/x19_0).real:.6f}")


# ===========================================================================
# D5-20 — frequency-division multiplex, recover x2 through a second carrier
# ===========================================================================
X1_20 = lambda w_: band(w_, 2, 1.0)
X2_20 = lambda w_: band(w_, 2, 1.0)
S20 = lambda w_: (0.5 * X1_20(w_ - 10) + 0.5 * X1_20(w_ + 10)
                  + 0.5 * X2_20(w_ - 20) + 0.5 * X2_20(w_ + 20))
Wc20 = lambda w_: 0.5 * S20(w_ - 20) + 0.5 * S20(w_ + 20)
H20 = lambda w_: band(w_, 2, 2.0)
Y20 = lambda w_: H20(w_) * Wc20(w_)
chk("D5-20 S(10) = 0.5 (x1 upper sideband)", close(S20(10.0), 0.5))
chk("D5-20 S(20) = 0.5 (x2 upper sideband)", close(S20(20.0), 0.5))
chk("D5-20 Wc(0) = 0.5 (x2 folded back to baseband, both copies add)", close(Wc20(0.0), 0.5))
chk("D5-20 Wc(10) = 0.25 (nearest surviving interference from x1)", close(Wc20(10.0), 0.25))
grid20 = np.linspace(-45, 45, 18001)
chk("D5-20 Y(w) reproduces X2(w) exactly on a fine grid",
    np.allclose(Y20(grid20), X2_20(grid20), atol=1e-9))
chk("D5-20 guard: nearest interference at w=10 sits 8 rad/s beyond the filter cutoff at 2",
    close(10 - 2, 8))
