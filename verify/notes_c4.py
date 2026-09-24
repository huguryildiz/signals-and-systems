#!/usr/bin/env python3
"""Numerical checks for every number stated in lecture-notes Chapter 4
(notes/src/c4.js) that the Module 4 slides do not already carry, plus the
slide numbers the chapter repeats. Plain Python with NumPy and SymPy."""
import cmath, math
from fractions import Fraction
from math import gcd
import numpy as np
import sympy as sp

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))
def near(a, b, tol): return abs(a - b) <= tol
pi = math.pi
t, tau, w = sp.symbols('t tau omega', real=True)

# ---------------------------------------------------------------- 4.1
H = lambda om: 1 / (1 + 1j * om)            # h(t) = e^{-t} u(t)
chk("Ex 4.1 |H(j2)| = 0.447", near(abs(H(2)), 0.447, 5e-4), f"{abs(H(2)):.4f}")
chk("Ex 4.1 angle H(j2) = -1.107", near(cmath.phase(H(2)), -1.107, 5e-4), f"{cmath.phase(H(2)):.4f}")
chk("Ex 4.1 H(-j2) = conj H(j2)", abs(H(-2) - H(2).conjugate()) < 1e-15)
Hsym = sp.integrate(sp.exp(-(1 + sp.I * w) * tau), (tau, 0, sp.oo), conds='none')
chk("Ex 4.1 H(jw) = 1/(1+jw) symbolically", sp.simplify(Hsym - 1 / (1 + sp.I * w)) == 0)
y0 = sp.integrate(sp.exp(-tau) * sp.cos(2 * tau), (tau, 0, sp.oo))
chk("Ex 4.1 check y(0) = 1/5 by convolution", sp.simplify(y0 - sp.Rational(1, 5)) == 0, str(y0))
chk("Ex 4.1 check 0.447 cos(-1.107) = 0.2", near(abs(H(2)) * math.cos(cmath.phase(H(2))), 0.2, 1e-12))
tt = np.linspace(0, 8, 2001); dt = 1e-4; ta = np.arange(0, 40, dt)
yconv = np.array([np.sum(np.exp(-ta) * np.cos(2 * (x - ta))) * dt for x in tt[::200]])
chk("Ex 4.1 output 0.447 cos(2t-1.107) matches the convolution",
    np.max(np.abs(yconv - abs(H(2)) * np.cos(2 * tt[::200] + cmath.phase(H(2))))) < 1e-3)

H2 = lambda om: 0.5 + 0.5 * np.exp(-1j * om)   # two-point average
chk("Ex 4.2 H(e^{jw}) = e^{-jw/2} cos(w/2)",
    max(abs(H2(o) - np.exp(-1j * o / 2) * np.cos(o / 2)) for o in np.linspace(-3, 3, 13)) < 1e-14)
chk("Ex 4.2 H(e^{j2pi/3}) = 0.5 e^{-j pi/3}", abs(H2(2 * pi / 3) - 0.5 * cmath.exp(-1j * pi / 3)) < 1e-14)
n = np.arange(-5, 20)
x = np.cos(2 * pi * n / 3); y = 0.5 * x + 0.5 * np.cos(2 * pi * (n - 1) / 3)
chk("Ex 4.2 output 0.5 cos(2 pi n/3 - pi/3)", np.max(np.abs(y - 0.5 * np.cos(2 * pi * n / 3 - pi / 3))) < 1e-14)
chk("Ex 4.2 y[0] = 1/4", near(0.5 * math.cos(-pi / 3), 0.25, 1e-15))
chk("Ex 4.2 H(-1) = 0", abs(H2(pi)) < 1e-15)
chk("4.1 superposition example: 2(0.5) e^{jt} + 1(0) e^{j3t} = e^{jt}", 2 * 0.5 == 1.0)
chk("Ex 4.3 delay phase at w=2 is 6 rad", 2 * 3 == 6)

# ---------------------------------------------------------------- 4.2
chk("4.2 staircase area 2 + 1/2 + 1/8 + ... = 8/3",
    near(sum(2 * 0.25 ** i for i in range(60)), 8 / 3, 1e-12))
def lcm_frac(fr):
    fr = [Fraction(f) for f in fr]; num = fr[0].numerator; den = fr[0].denominator
    for f in fr[1:]:
        num = num * f.numerator // gcd(num, f.numerator); den = gcd(den, f.denominator)
    return Fraction(num, den)
cases = {'a': ([Fraction(1), Fraction(2, 3)], Fraction(2)),
         'b': ([Fraction(3, 5), Fraction(8, 5)], Fraction(24, 5)),
         'c': ([Fraction(2), Fraction(1), Fraction(2, 3)], Fraction(2)),
         'd': ([Fraction(2, 9), Fraction(8, 21)], Fraction(8, 3))}
for c, (per, want) in cases.items():
    T0 = lcm_frac(per); q = [T0 / p for p in per]
    g = 0
    for v in q: g = gcd(g, int(v))
    chk(f"Ex 4.4 ({c}) T0 = {want}", T0 == want and all(v.denominator == 1 for v in q) and g == 1,
        f"T0={T0}, quotients={[str(v) for v in q]}")
    # brute force: smallest common period among multiples of 1/lcm(denominators)
    den = 1
    for p in per: den = den * p.denominator // gcd(den, p.denominator)
    best = next(Fraction(m, den) for m in range(1, 10000)
                if all((Fraction(m, den) / p).denominator == 1 for p in per))
    chk(f"Ex 4.4 ({c}) no smaller common period (brute force)", best == want, str(best))
chk("Ex 4.4 (d) GCD(9,21) = 3", gcd(9, 21) == 3)
chk("4.2 wrong route 8/63 / (2/9) = 4/7", Fraction(8, 63) / Fraction(2, 9) == Fraction(4, 7))

# Example 4.5 coefficients by numerical analysis
T0 = 2.0; N = 4000; ts = np.arange(N) * T0 / N
xs = 1 + 0.5 * np.cos(2 * pi * ts) + np.sin(3 * pi * ts)
ak = lambda k: np.mean(xs * np.exp(-1j * k * pi * ts))
chk("Ex 4.5 a0 = 1, a(+-2) = 1/4, a3 = 1/(2j), a(-3) = -1/(2j)",
    abs(ak(0) - 1) < 1e-12 and abs(ak(2) - 0.25) < 1e-12 and abs(ak(-2) - 0.25) < 1e-12
    and abs(ak(3) - 1 / 2j) < 1e-12 and abs(ak(-3) + 1 / 2j) < 1e-12
    and max(abs(ak(k)) for k in (1, -1, 4, 5, -4)) < 1e-12)
chk("4.2 orthogonality: integral cos(2 pi t) cos(4 pi t) over one period = 0",
    sp.integrate(sp.cos(2 * sp.pi * t) * sp.cos(4 * sp.pi * t), (t, -sp.Rational(1, 2), sp.Rational(1, 2))) == 0)
chk("4.2 orthogonality: integral cos^2(2 pi t) over one period = 1/2",
    sp.integrate(sp.cos(2 * sp.pi * t) ** 2, (t, -sp.Rational(1, 2), sp.Rational(1, 2))) == sp.Rational(1, 2))
chk("4.2 integral_0^1 e^{j2pi t} e^{-j6pi t} dt = 0",
    sp.simplify(sp.integrate(sp.exp(sp.I * 2 * sp.pi * t) * sp.exp(-sp.I * 6 * sp.pi * t), (t, 0, 1))) == 0)
chk("4.2 a0 of 3 + cos 2t is 3", sp.integrate(3 + sp.cos(2 * t), (t, 0, sp.pi)) / sp.pi == 3)
a1 = 0.4 + 0.3j
chk("Ex 4.6 A1 = 0.5", near(abs(a1), 0.5, 1e-15))
chk("Ex 4.6 theta1 = 0.644 rad", near(cmath.phase(a1), 0.644, 5e-4), f"{cmath.phase(a1):.4f}")
tt = np.linspace(0, 4, 801)
chk("Ex 4.6 cos(pi t + 0.6435) = 0.8 cos pi t - 0.6 sin pi t",
    np.max(np.abs(np.cos(pi * tt + cmath.phase(a1)) - (0.8 * np.cos(pi * tt) - 0.6 * np.sin(pi * tt)))) < 1e-12)
a1b = 1 - 1j
xb = (a1b * np.exp(1j * pi * tt) + a1b.conjugate() * np.exp(-1j * pi * tt)).real
chk("Ex 4.6 a1 = 1-j gives 2 cos pi t + 2 sin pi t", np.max(np.abs(xb - (2 * np.cos(pi * tt) + 2 * np.sin(pi * tt)))) < 1e-12)

# ---------------------------------------------------------------- 4.3
aq = lambda k: 0.5 if k == 0 else math.sin(pi * k / 2) / (pi * k)
chk("4.3 T0=4T1: a1 = 1/pi = 0.318", near(aq(1), 0.318, 5e-4))
chk("4.3 T0=4T1: a3 = -1/(3 pi) = -0.106", near(aq(3), -0.106, 5e-4))
chk("4.3 T0=4T1: every even coefficient k != 0 vanishes", all(abs(aq(k)) < 1e-15 for k in range(2, 200, 2)))
chk("4.3 T0=4T1: odd coefficients do not vanish", all(abs(aq(k)) > 1e-3 for k in range(1, 200, 2)))
# rectangular-wave closed form against the integral
T1s, T0s, ks = sp.symbols('T1 T0 k', positive=True)
ksym = sp.Symbol('k', integer=True, nonzero=True)
aint = sp.integrate(sp.exp(-sp.I * ksym * 2 * sp.pi / T0s * t), (t, -T1s, T1s)) / T0s
chk("Ex 4.7 a_k = sin(2 pi k T1/T0)/(pi k)",
    all(abs(complex(aint.subs({T1s: 1, T0s: T, ksym: kk}).evalf()) - math.sin(2 * pi * kk / T) / (pi * kk)) < 1e-12
        for T in (3, 4, 7) for kk in (1, 2, 3, -2, 5)))
E = lambda om: 2.0 if om == 0 else 2 * math.sin(om) / om       # T1 = 1
chk("4.3 envelope: a_k = E(k w0)/T0 for T0 = 4 and 8",
    all(near(E(k * 2 * pi / T) / T, math.sin(2 * pi * k / T) / (pi * k), 1e-14) for T in (4, 8) for k in range(1, 12)))
def mse_tail(coef, N, K=400000):
    k = np.arange(N + 1, K + 1); return 2 * np.sum(np.abs(coef(k)) ** 2)
rect = lambda k: np.sin(pi * k / 2) / (pi * k)
saw = lambda k: 1 / (2 * pi * k)
for N_, r_, s_ in [(3, 0.025, 0.0144), (9, 0.010, 0.0053), (27, 0.004, 0.0018), (81, 0.001, 0.0006)]:
    mr = mse_tail(rect, N_); ms = mse_tail(saw, N_)
    chk(f"4.3 table N = {N_}: rectangle MSE {r_}, sawtooth MSE {s_}",
        near(mr, r_, 5e-4) and near(ms, s_, 5e-5), f"{mr:.5f}, {ms:.5f}")
# Gibbs peak
def rps(tv, N):
    s = 0.5 + 0 * tv
    for k in range(1, N + 1): s = s + 2 * aq(k) * np.cos(2 * pi * k * tv / 4)
    return s
for N_ in (9, 27, 81):
    tv = np.linspace(0.3, 1.0, 200001); pk = rps(tv, N_).max()
    chk(f"4.3 Gibbs: peak of x_{N_} near 1.09 (about 9% of the jump)", near(pk, 1.09, 0.006), f"{pk:.4f}")
Si = sp.Si(sp.pi).evalf()
chk("4.3 Gibbs limit (1/pi) Si(pi) - 1/2 = 0.0895, about 9%", near(float(Si / sp.pi - 0.5), 0.0895, 5e-5))
pk81 = 2 * rps(np.linspace(0.3, 1.0, 200001), 81).max()
chk("4.3 jump 0 to 2: 2 + 0.09 x 2 = 2.18, and the peak of x_81 is about 2.18",
    near(2 + 0.09 * 2, 2.18, 1e-12) and near(pk81, 2.18, 0.005), f"{pk81:.4f}")
# sawtooth
ksaw = lambda k, T0: 1j * T0 * (-1) ** k / (2 * k * pi)
num = [np.mean((ts := (np.arange(200000) + 0.5) / 200000 - 0.5) * np.exp(-1j * k * 2 * pi * ts)) for k in (1, 2, 3, -1)]
chk("Ex 4.8 a_k = j T0 (-1)^k/(2 k pi) for T0 = 1", all(abs(a - ksaw(k, 1)) < 1e-9 for a, k in zip(num, (1, 2, 3, -1))))
chk("Ex 4.8 |a_(+-1)| = 1/(2 pi) = 0.159", near(1 / (2 * pi), 0.159, 5e-4))
x_ = sp.Symbol('x'); aa = sp.Symbol('a', nonzero=True)
chk("Ex 4.8 by-parts antiderivative differentiates back to t e^{at}",
    sp.simplify(sp.diff((aa * x_ - 1) * sp.exp(aa * x_) / aa ** 2, x_) - x_ * sp.exp(aa * x_)) == 0)

# ---------------------------------------------------------------- 4.4
def dtfs(xn):
    Nn = len(xn); nn = np.arange(Nn)
    return np.array([np.mean(xn * np.exp(-1j * k * 2 * pi * nn / Nn)) for k in range(Nn)])
nn = np.arange(8); c8 = dtfs(np.cos(2 * pi * nn / 8) + 0.4 * np.sin(4 * pi * nn / 8))
chk("4.4 cos(2 pi n/8)+0.4 sin(4 pi n/8): a1 = a7 = 1/2, a2 = -0.2j, a6 = 0.2j",
    abs(c8[1] - 0.5) < 1e-14 and abs(c8[7] - 0.5) < 1e-14 and abs(c8[2] + 0.2j) < 1e-14 and abs(c8[6] - 0.2j) < 1e-14
    and max(abs(c8[k]) for k in (0, 3, 4, 5)) < 1e-14)
chk("4.4 discrete orthogonality: sum over one period is 0 for m not a multiple of N",
    all(abs(np.sum(np.exp(1j * m * 2 * pi * np.arange(12) / 12))) < 1e-12 for m in range(1, 12)))
nn = np.arange(24); c24 = dtfs(np.sin(5 * pi * nn / 6) + np.cos(3 * pi * nn / 4 + pi / 5))
chk("Ex 4.10 N0 = 24 and a10 = 1/(2j), a9 = 0.5 e^{j pi/5}",
    abs(c24[10] - 1 / 2j) < 1e-12 and abs(c24[9] - 0.5 * cmath.exp(1j * pi / 5)) < 1e-12
    and abs(c24[14] + 1 / 2j) < 1e-12 and abs(c24[15] - 0.5 * cmath.exp(-1j * pi / 5)) < 1e-12
    and sum(abs(c24) > 1e-9) == 4)
dtRect = lambda k, N, N1: (2 * N1 + 1) / N if k % N == 0 else math.sin(2 * pi * k * (N1 + 0.5) / N) / (N * math.sin(pi * k / N))
for N_ in (10, 20, 30, 12):
    N1 = 1 if N_ == 12 else 2
    xn = np.array([1.0 if min(n, N_ - n) <= N1 else 0.0 for n in range(N_)])
    cN = dtfs(xn)
    chk(f"Ex 4.11 closed form matches DTFS, N = {N_}, N1 = {N1}",
        max(abs(cN[k] - dtRect(k, N_, N1)) for k in range(N_)) < 1e-12)
chk("Ex 4.11 peaks 5/N: 0.5, 0.25, 0.167", near(5 / 10, 0.5, 0) and near(5 / 20, 0.25, 0) and near(5 / 30, 0.167, 5e-4))
chk("Ex 4.11 N = 12, N1 = 1: a0 = 1/4", dtRect(0, 12, 1) == 0.25)
xs11 = np.array([n if n <= 5 else n - 11 for n in range(11)], float); c11 = dtfs(xs11)
terms = [m * math.sin(2 * pi * m / 11) for m in range(1, 6)]
chk("Ex 4.12 five terms 0.5406 1.8193 2.9695 3.0230 1.4087, sum 9.7610",
    all(near(a, b, 5e-5) for a, b in zip(terms, [0.5406, 1.8193, 2.9695, 3.0230, 1.4087])) and near(sum(terms), 9.7610, 5e-5))
chk("Ex 4.12 a1 = -j1.7747", abs(c11[1] - (-1.7747j)) < 5e-5, f"{c11[1]:.5f}")
chk("Ex 4.12 largest |a_k| at k = +-1 (and +-10, +-12)", np.argmax(np.abs(c11)) in (1, 10) and abs(abs(c11[10]) - abs(c11[1])) < 1e-12)
chk("Ex 4.12 purely imaginary", np.max(np.abs(c11.real)) < 1e-12)

# ---------------------------------------------------------------- 4.5
chk("4.5 shift: T0 = 2, t0 = 0.4 gives -0.4 pi at k = 1", near(-1 * pi * 0.4, -0.4 * pi, 0))
chk("4.5 half-period delay multiplies a1 by -1", abs(cmath.exp(-1j * pi) + 1) < 1e-15)
b = [aq(k) * cmath.exp(-1j * k * pi * 0.4) for k in range(-8, 9)]
chk("4.5 delayed wave: Re even and Im odd in k",
    all(abs(b[8 + k].real - b[8 - k].real) < 1e-14 and abs(b[8 + k].imag + b[8 - k].imag) < 1e-14 for k in range(9)))
chk("4.5 x_(3) of 1,0 repeating: a0 = 1/6", np.mean([1, 0, 0, 0, 0, 0]) == 1 / 6)
xm = np.array([1, 0.5, 0, 0.5]); xe = np.zeros(12); xe[::3] = xm
chk("4.5 x_(m): b_k = a_k/m (N = 4, m = 3)", np.max(np.abs(dtfs(xe)[:4] - dtfs(xm) / 3)) < 1e-14)
# periodic convolution of the T0 = 2, T1 = 0.5 wave with itself
Nn = 4000; tg = (np.arange(Nn) - Nn // 2) * 2 / Nn
xr = (np.abs(tg) < 0.5).astype(float)
z = np.real(np.fft.ifft(np.fft.fft(xr) * np.fft.fft(np.fft.ifftshift(xr)))) * (2 / Nn)
chk("Ex 4.13 triangle: z(t) = 1 - |t| on |t| <= 1", np.max(np.abs(z - (1 - np.abs(tg)))) < 2e-3)
chk("Ex 4.13 c0 = T0 a0^2 = 1/2", 2 * aq(0) ** 2 == 0.5)
c1 = sp.integrate((1 - t) * sp.cos(sp.pi * t), (t, 0, 1))
chk("Ex 4.13 c1 of the triangle = 2/pi^2 = 2 a1^2", sp.simplify(c1 - 2 / sp.pi ** 2) == 0 and near(2 * aq(1) ** 2, 2 / pi ** 2, 1e-15))
chk("Ex 4.13 mean of triangle = 1/2", sp.integrate(1 - sp.Abs(t), (t, -1, 1)) / 2 == sp.Rational(1, 2))
chk("4.5 cos^2: c0 = 1/2, c(+-2) = 1/4", 0.5 * 0.5 + 0.5 * 0.5 == 0.5 and 0.5 * 0.5 == 0.25)
chk("4.5 d/dt sin(pi t): j pi (1/(2j)) = pi/2", abs(1j * pi * (1 / 2j) - pi / 2) < 1e-15)
chk("4.5 running sum of 1,1,1,-1 climbs N a0 = 2 per period", sum([1, 1, 1, -1]) == 2 and 4 * 0.5 == 2)
chk("4.5 running sum of 1,1,-1,-1 is periodic (mean zero)", sum([1, 1, -1, -1]) == 0)
chk("4.5 Parseval: 2 cos(w0 t) has power 2", near(np.mean((2 * np.cos(2 * pi * np.arange(1000) / 1000)) ** 2), 2, 1e-12))
k_ = sp.Symbol('k', integer=True, positive=True)
chk("Ex 4.14 sum over odd k of 1/k^2 = pi^2/8",
    sp.simplify(sp.summation(1 / (2 * k_ - 1) ** 2, (k_, 1, sp.oo)) - sp.pi ** 2 / 8) == 0)
chk("Ex 4.14 rectangle power 1/4 + 2(1/pi^2)(pi^2/8) = 1/2", near(0.25 + 2 / pi ** 2 * pi ** 2 / 8, 0.5, 1e-15))
chk("Ex 4.14 sawtooth power 1/12 in time",
    sp.integrate(t ** 2, (t, -sp.Rational(1, 2), sp.Rational(1, 2))) == sp.Rational(1, 12))
chk("Ex 4.14 sawtooth power 1/12 from coefficients",
    sp.simplify(2 * sp.summation(1 / (4 * sp.pi ** 2 * k_ ** 2), (k_, 1, sp.oo)) - sp.Rational(1, 12)) == 0)
kept3 = 0.25 + 2 * (1 / pi ** 2 + 1 / (9 * pi ** 2))
chk("4.5 N = 3: kept power 1/4 + 20/(9 pi^2) = 0.4752, MSE = 0.025",
    near(kept3, 0.25 + 20 / (9 * pi ** 2), 1e-15) and near(kept3, 0.4752, 5e-5) and near(0.5 - kept3, 0.025, 5e-4))

# ---------------------------------------------------------------- 4.6
a = {0: 1, 1: 0.5, 2: 1 / 2j, 3: 0.5 * cmath.exp(1j * pi / 3)}
lp = [(0.3033, -1.2626), (0.1572, -1.4130), (0.1055, -1.4651)]
for k, (m, p) in zip((1, 2, 3), lp):
    chk(f"Ex 4.15 |H(j{k}pi)| = {m}, angle {p}", near(abs(H(k * pi)), m, 5e-5) and near(cmath.phase(H(k * pi)), p, 5e-5))
bk = {k: a[k] * H(k * pi) for k in a}
want = {1: (0.1517, -1.263), 2: (0.0786, -2.984), 3: (0.0528, -0.418)}
for k, (m, p) in want.items():
    chk(f"Ex 4.15 b{k} = {m} e^(j{p})", near(abs(bk[k]), m, 5e-5) and near(cmath.phase(bk[k]), p, 5e-4))
chk("Ex 4.15 amplitudes 0.303 0.157 0.106",
    all(near(2 * abs(bk[k]), v, 5e-4) for k, v in ((1, 0.303), (2, 0.157), (3, 0.106))))
tt = np.linspace(0, 2, 200001)
yl = 1 + sum(2 * abs(bk[k]) * np.cos(k * pi * tt + cmath.phase(bk[k])) for k in (1, 2, 3))
yh = 1 + sum(abs(bk[k]) * np.cos(k * pi * tt + cmath.phase(bk[k])) for k in (1, 2, 3))
chk("Ex 4.15 output range 0.615 to 1.417", near(yl.min(), 0.615, 1e-3) and near(yl.max(), 1.417, 1e-3), f"{yl.min():.4f} {yl.max():.4f}")
chk("Ex 4.15 half amplitudes give 0.81 to 1.21", near(yh.min(), 0.81, 5e-3) and near(yh.max(), 1.21, 5e-3), f"{yh.min():.4f} {yh.max():.4f}")
Hh = lambda om: 1j * om / (1 + 1j * om)
hp = [(0.9529, 0.3082, 3.1416, 3.2969), (0.9876, 0.1578, 6.2832, 6.3623), (0.9944, 0.1057, 9.4248, 9.4777)]
for k, (m, p, nu, de) in zip((1, 2, 3), hp):
    chk(f"Ex 4.16 |H(j{k}pi)| = {nu}/{de} = {m}, angle {p}",
        near(abs(Hh(k * pi)), m, 5e-5) and near(cmath.phase(Hh(k * pi)), p, 5e-5)
        and near(k * pi, nu, 5e-5) and near(math.sqrt(1 + (k * pi) ** 2), de, 5e-5))
bh = {k: a[k] * Hh(k * pi) for k in (1, 2, 3)}
for k, (m, p) in {1: (0.4764, 0.308), 2: (0.4938, -1.413), 3: (0.4972, 1.153)}.items():
    chk(f"Ex 4.16 b{k} = {m} e^(j{p})", near(abs(bh[k]), m, 5e-5) and near(cmath.phase(bh[k]), p, 5e-4))
chk("Ex 4.16 angle H = (pi/2) sgn(w) - arctan w",
    all(near(cmath.phase(Hh(o)), pi / 2 * np.sign(o) - math.atan(o), 1e-12) for o in (-5, -1, -0.2, 0.3, 2, 7)))
chk("Ex 4.17 y(0) = 1/2 + 4/(3 pi) = 0.924", near(0.5 + 2 / pi - 2 / (3 * pi), 0.924, 5e-4) and near(0.5 + 4 / (3 * pi), 0.5 + 2 / pi - 2 / (3 * pi), 1e-15))
chk("Ex 4.17 cutoff 3.5 pi keeps |k| <= 3, 2.5 pi keeps |k| <= 2",
    max(k for k in range(10) if k * pi < 3.5 * pi) == 3 and max(k for k in range(10) if k * pi < 2.5 * pi) == 2)
chk("Ex 4.17 y(0.5) = 1/2", near(0.5 + 2 / pi * math.cos(pi / 2) - 2 / (3 * pi) * math.cos(3 * pi / 2), 0.5, 1e-15))
tt = np.linspace(0, 12, 2001)
yd = sum(2 * abs(c) * np.cos(k * tt + cmath.phase(c)) for k, c in ((1, 1j * 0.5), (3, 1j * 3 / 18)))
chk("Ex 4.18 y = -sin t - (1/3) sin 3t", np.max(np.abs(yd - (-np.sin(tt) - np.sin(3 * tt) / 3))) < 1e-12)
chk("Ex 4.18 b1 = 1/2 e^{j pi/2}, b3 = 1/6 e^{j pi/2}", near(abs(0.5j), 0.5, 0) and near(abs(3j / 18), 1 / 6, 1e-15))
H1 = lambda om: 0.5 * (1 - np.exp(-1j * om))
chk("Ex 4.19 H1 = j e^{-jw/2} sin(w/2)",
    max(abs(H1(o) - 1j * np.exp(-1j * o / 2) * np.sin(o / 2)) for o in np.linspace(-3, 3, 13)) < 1e-14)
chk("Ex 4.19 2|b1| = sqrt2/4 = 0.354 (not 0.36)", near(2 * abs(0.25 * H1(pi / 2)), math.sqrt(2) / 4, 1e-15) and near(math.sqrt(2) / 4, 0.354, 5e-4))
chk("Ex 4.19 b1 = 0.1768 e^{j pi/4}", near(abs(0.25 * H1(pi / 2)), 0.1768, 5e-5) and near(cmath.phase(H1(pi / 2)), pi / 4, 1e-14))
n = np.arange(0, 8); xi = (n % 4 == 0).astype(float); xim1 = ((n - 1) % 4 == 0).astype(float)
y1 = 0.5 * xi - 0.5 * xim1; y2 = 0.5 * xi + 0.5 * xim1
chk("Ex 4.19 y1 formula matches 0.5 x[n] - 0.5 x[n-1]",
    np.max(np.abs(y1 - (math.sqrt(2) / 4 * np.cos(pi * n / 2 + pi / 4) + 0.25 * (-1.0) ** n))) < 1e-14)
chk("Ex 4.19 y2 formula matches 0.5 x[n] + 0.5 x[n-1]",
    np.max(np.abs(y2 - (0.25 + math.sqrt(2) / 4 * np.cos(pi * n / 2 - pi / 4)))) < 1e-14)
Hr = lambda om, a_: 1 / (1 - a_ * np.exp(-1j * om))
chk("4.6 recursive |H|^2 = 1/(1 - 2a cos w + a^2)",
    all(near(abs(Hr(o, a_)) ** 2, 1 / (1 - 2 * a_ * math.cos(o) + a_ ** 2), 1e-12) for o in (0.1, 1, 2.5) for a_ in (0.6, -0.6, 0.3)))
chk("4.6 recursive a = 0.5: |H(e^{j pi})| = 2/3", near(abs(Hr(pi, 0.5)), 2 / 3, 1e-15))
chk("4.6 recursive a = +-0.6: peak gain 2.5", near(abs(Hr(0, 0.6)), 2.5, 1e-12) and near(abs(Hr(pi, -0.6)), 2.5, 1e-12))
chk("4.6 recursive H equals the geometric sum of a^n e^{-jwn}",
    abs(sum(0.5 ** k * cmath.exp(-1j * 1.1 * k) for k in range(200)) - Hr(1.1, 0.5)) < 1e-14)
chk("Ex 4.20 H(e^{j0}) = 2, H(e^{j pi/2}) = 1/(1+0.5j), H(e^{j pi}) = 2/3",
    near(abs(Hr(0, 0.5)), 2, 1e-15) and abs(Hr(pi / 2, 0.5) - 1 / (1 + 0.5j)) < 1e-15 and near(abs(Hr(pi, 0.5)), 2 / 3, 1e-15))
chk("Ex 4.20 |1+0.5j| = 1.118, angle 0.464, |H| = 0.894",
    near(abs(1 + 0.5j), 1.118, 5e-4) and near(math.atan(0.5), 0.464, 5e-4) and near(abs(Hr(pi / 2, 0.5)), 0.894, 5e-4))
b1 = 0.25 * Hr(pi / 2, 0.5)
chk("Ex 4.20 b1 = 0.2236 e^{-j0.464}, 2|b1| = 0.447",
    near(abs(b1), 0.2236, 5e-5) and near(cmath.phase(b1), -0.464, 5e-4) and near(2 * abs(b1), 0.447, 5e-4))
# direct simulation of the recursion to steady state
yv = 0.0; out = []
for nn_ in range(400):
    yv = (1.0 if nn_ % 4 == 0 else 0.0) + 0.5 * yv; out.append(yv)
ys = np.array(out[-8:]); nn = np.arange(392, 400)
yf = 0.5 + 2 * abs(b1) * np.cos(pi * nn / 2 + cmath.phase(b1)) + (-1.0) ** nn / 6
chk("Ex 4.20 formula matches the difference equation in steady state", np.max(np.abs(ys - yf)) < 1e-12)
chk("Ex 4.20 y[0] = 16/15 = 1.067", near(out[396], 16 / 15, 1e-12) and near(16 / 15, 1.067, 5e-4))
chk("Ex 4.20 0.447 cos(0.464) = 0.4 and 0.447 sin(0.464) = 0.2",
    near(math.sqrt(0.2) * math.cos(math.atan(0.5)), 0.4, 1e-15) and near(math.sqrt(0.2) * math.sin(math.atan(0.5)), 0.2, 1e-15))
chk("Ex 4.20 y[1] = 0.533 = y[0]/2", near(out[397], 8 / 15, 1e-12) and near(8 / 15, 0.533, 5e-4))

# ---------------------------------------------------------------- 4.8 exercises
chk("Exercise 4.3: T0 = 8T1 gives a0 = 1/4, a2 = 1/(2 pi) = 0.159",
    near(2 / 8, 0.25, 0) and near(math.sin(2 * pi * 2 / 8) / (2 * pi), 1 / (2 * pi), 1e-15) and near(1 / (2 * pi), 0.159, 5e-4))
a2 = -1 + 1j; tt = np.linspace(0, 3, 601)
x4 = (a2 * np.exp(1j * 4 * tt) + a2.conjugate() * np.exp(-1j * 4 * tt)).real
chk("Exercise 4.4: 2 sqrt2 cos(4t + 3pi/4) = -2 cos 4t - 2 sin 4t",
    near(cmath.phase(a2), 3 * pi / 4, 1e-15) and np.max(np.abs(x4 - 2 * math.sqrt(2) * np.cos(4 * tt + 3 * pi / 4))) < 1e-12
    and np.max(np.abs(x4 - (-2 * np.cos(4 * tt) - 2 * np.sin(4 * tt)))) < 1e-12)
chk("Exercise 4.8: a = -0.5 gives 2/3 at 0 and 2 at pi", near(abs(Hr(0, -0.5)), 2 / 3, 1e-15) and near(abs(Hr(pi, -0.5)), 2, 1e-15))

print(f"\n{len(P)} passed, {len(F)} failed")
raise SystemExit(1 if F else 0)
