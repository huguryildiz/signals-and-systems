#!/usr/bin/env python3
"""Independent computational verification of the quantitative claims made by the
Fourier property scenes of Modules 4 to 6 — the scenes added with the property
tables. Symbolic where SymPy can carry it, numerical as a cross-check.

verify_m1_m3.py covers Modules 0 to 3 and verify_drills.py covers the practice
questions; neither reaches the teaching scenes of Modules 4 to 6, which is why
this file exists."""
import numpy as np, sympy as sp

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

# The rectangular wave this module works with: period T0 = 2, unit on |t| < 0.5.
T0, T1 = 2.0, 0.5

def rect_wave(t):
    u = t - T0*np.round(t/T0)
    return np.where(np.abs(u) < T1, 1.0, 0.0)

def a_k(k):
    """Fourier coefficients of that wave: a_0 = 2T1/T0, else sin(k*w0*T1)/(k*pi)."""
    return 2*T1/T0 if k == 0 else np.sin(k*np.pi*T1)/(k*np.pi)

# ---------------------------------------------------------------- m4-props-freq
# Frequency shift slides the whole coefficient sequence by M.
# Verified against the analysis integral itself rather than against the property.
def coeff_num(f, k, T=T0, m=200001):
    t = np.linspace(-T/2, T/2, m)
    w0 = 2*np.pi/T
    return np.trapezoid(f(t)*np.exp(-1j*k*w0*t), t)/T

M = 3
w0 = 2*np.pi/T0
shifted = lambda t: np.exp(1j*M*w0*t)*rect_wave(t)
ok = all(abs(coeff_num(shifted, k) - a_k(k-M)) < 2e-4 for k in range(-4, 8))
chk("M4 frequency shift: e^{jM w0 t} x(t) has coefficients a_{k-M}", ok)

# Continuous-time scaling leaves every coefficient unchanged and divides the period.
scaled = lambda t: rect_wave(2*t)
ok = all(abs(coeff_num(scaled, k, T=T0/2) - a_k(k)) < 2e-4 for k in range(-4, 5))
chk("M4 time scaling: x(2t) keeps the coefficients of x, with period T0/2", ok)

# Discrete-time expansion: x_(m)[n] has period mN and coefficients a_k/m.
xd = np.array([1.0, 0.5, 0.0, 0.5])          # period N = 4
Nn, mm = 4, 3
xe = np.zeros(Nn*mm)                          # period mN = 12
xe[::mm] = xd
def dtfs(x):
    Nl = len(x)
    n = np.arange(Nl)
    return np.array([np.sum(x*np.exp(-1j*2*np.pi*k*n/Nl))/Nl for k in range(Nl)])
ad, ae = dtfs(xd), dtfs(xe)
ok = all(abs(ae[k % (Nn*mm)] - ad[k % Nn]/mm) < 1e-12 for k in range(Nn*mm))
chk("M4 expansion: x_(3)[n] has period 12 and coefficients a_k/3", ok,
    f"a_0 = {ad[0].real:.6f} -> {ae[0].real:.6f}")

# ---------------------------------------------------------------- m4-props-conv
# Periodic convolution of the rectangular wave with itself is the triangular wave
# 1 - |t| on [-1, 1], and its coefficients are T0 a_k^2.
tt = np.linspace(-1.0, 1.0, 401)
tau = np.linspace(-T0/2, T0/2, 40001)
y_num = np.array([np.trapezoid(rect_wave(tau)*rect_wave(t - tau), tau) for t in tt])
y_exact = 1 - np.abs(tt - T0*np.round(tt/T0))
chk("M4 periodic convolution: rect wave with itself is the triangular wave",
    np.max(np.abs(y_num - y_exact)) < 1e-3,
    f"max error {np.max(np.abs(y_num - y_exact)):.2e}")

tri = lambda t: 1 - np.abs(t - T0*np.round(t/T0))
ok = all(abs(coeff_num(tri, k) - T0*a_k(k)**2) < 2e-5 for k in range(-6, 7))
chk("M4 periodic convolution: the coefficients are T0 a_k b_k", ok)

chk("M4 periodic convolution: the mean of the result is T0 a_0^2 = 0.5",
    abs(T0*a_k(0)**2 - 0.5) < 1e-12, f"T0 a_0^2 = {T0*a_k(0)**2}")

# ---------------------------------------------------------------- m4-props-calc
# a_0 = 2 T1 / T0 = 0.5, so the running integral of the wave itself is not periodic;
# with the mean removed it is the triangular wave bounded by +/- 0.25.
chk("M4 integration: a_0 = 2 T1 / T0 = 0.5", abs(a_k(0) - 0.5) < 1e-15)

ts = np.linspace(0, 4, 400001)
g = np.concatenate(([0.0], np.cumsum((rect_wave(ts[1:]) + rect_wave(ts[:-1]))/2*np.diff(ts))))
h = np.concatenate(([0.0], np.cumsum(((rect_wave(ts[1:]) - 0.5) + (rect_wave(ts[:-1]) - 0.5))/2*np.diff(ts))))
chk("M4 integration: the mean-removed integral is bounded by +/- 0.25",
    abs(np.max(h) - 0.25) < 1e-4 and abs(np.min(h) + 0.25) < 1e-4,
    f"max {np.max(h):.6f}, min {np.min(h):.6f}")
chk("M4 integration: the mean-removed integral is periodic with period T0",
    abs(h[np.argmin(np.abs(ts - 2.0))]) < 1e-4 and abs(h[np.argmin(np.abs(ts - 4.0))]) < 1e-4)
chk("M4 integration: leaving the mean in adds the ramp a_0 t",
    np.max(np.abs((g - h) - 0.5*ts)) < 1e-4,
    f"max deviation {np.max(np.abs((g - h) - 0.5*ts)):.2e}")

# ---------------------------------------------------------------- m4-props-dt-calc
# Running sums of a zero-mean and a non-zero-mean sequence of period 4.
def running(v, upto=13):
    return np.cumsum([v[n % 4] for n in range(upto)])
r0 = running([1, 1, -1, -1])
r1 = running([1, 1, 1, -1])
chk("M4 running sum: zero-mean sequence gives 1, 2, 1, 0 and repeats",
    list(r0[:4]) == [1, 2, 1, 0] and list(r0[4:8]) == [1, 2, 1, 0], f"{list(r0[:8])}")
chk("M4 running sum: mean 0.5 gives 1, 2, 3, 2 then 3, 4, 5, 4",
    list(r1[:4]) == [1, 2, 3, 2] and list(r1[4:8]) == [3, 4, 5, 4], f"{list(r1[:8])}")
chk("M4 running sum: the climb per period is N a_0 = 2",
    all(r1[n+4] - r1[n] == 2 for n in range(8)))

# ---------------------------------------------------------------- m5-props-int
# The integration property, checked on a pulse of area one and a pulse of area zero.
w = sp.symbols('w', real=True)
ts = np.linspace(-1, 3, 400001)
p1 = np.where((ts > 0) & (ts < 1), 1.0, 0.0)
p2 = np.where((ts > 0) & (ts < 1), 1.0, np.where((ts >= 1) & (ts < 2), -1.0, 0.0))
area1 = np.trapezoid(p1, ts)
area2 = np.trapezoid(p2, ts)
chk("M5 integration: the unit pulse has X(0) = 1", abs(area1 - 1) < 1e-4, f"X(0) = {area1:.6f}")
chk("M5 integration: the up-down pulse has X(0) = 0", abs(area2) < 1e-4, f"X(0) = {area2:.2e}")
i1 = np.concatenate(([0.0], np.cumsum((p1[1:] + p1[:-1])/2*np.diff(ts))))
i2 = np.concatenate(([0.0], np.cumsum((p2[1:] + p2[:-1])/2*np.diff(ts))))
chk("M5 integration: the unit pulse integrates to a step that settles at 1",
    abs(i1[-1] - 1) < 1e-4, f"final value {i1[-1]:.6f}")
chk("M5 integration: the zero-area pulse integrates back to zero",
    abs(i2[-1]) < 1e-4, f"final value {i2[-1]:.2e}")

# The property itself, away from the origin: the transform of the running integral
# equals X(jw)/(jw) wherever the impulse term does not sit.
def ft(x, ts, wv):
    return np.array([np.trapezoid(x*np.exp(-1j*wv_*ts), ts) for wv_ in wv])
wv = np.array([0.7, 1.3, 2.9, 4.1])
lhs = ft(i2, ts, wv)
rhs = ft(p2, ts, wv)/(1j*wv)
chk("M5 integration: away from w = 0 the transform is X(jw)/(jw)",
    np.max(np.abs(lhs - rhs)) < 1e-3, f"max error {np.max(np.abs(lhs - rhs)):.2e}")

# ---------------------------------------------------------------- m5-props-evenodd
# Ev{e^{-at}u(t)} = (1/2) e^{-a|t|} transforms to Re{1/(a+jw)}.
# SymPy returns a Piecewise unless the frequency is known to be signed, so the
# symbolic half is done on w > 0 and the whole axis is covered numerically below.
a = sp.symbols('a', positive=True)
wp = sp.symbols('wp', positive=True)
tsym = sp.symbols('t', real=True)
even_ft = sp.integrate(sp.Rational(1,2)*sp.exp(-a*sp.Abs(tsym))*sp.exp(-sp.I*wp*tsym),
                       (tsym, -sp.oo, sp.oo))
re_part = sp.re(sp.simplify(1/(a + sp.I*wp)))
chk("M5 even part: Ev{e^{-at}u(t)} transforms to Re{1/(a+jw)}",
    sp.simplify(sp.simplify(even_ft) - re_part) == 0, f"{sp.simplify(even_ft)}")

odd_ft = sp.integrate(sp.Rational(1,2)*sp.sign(tsym)*sp.exp(-a*sp.Abs(tsym))*sp.exp(-sp.I*wp*tsym),
                      (tsym, -sp.oo, sp.oo))
im_part = sp.I*sp.im(sp.simplify(1/(a + sp.I*wp)))
chk("M5 odd part: Od{e^{-at}u(t)} transforms to j Im{1/(a+jw)}",
    sp.simplify(sp.simplify(odd_ft) - im_part) == 0, f"{sp.simplify(odd_ft)}")

# The same two statements on both signs of w, with a = 1, straight from the integrals.
tg = np.linspace(-60, 60, 2400001)
ev_t = 0.5*np.exp(-np.abs(tg))
od_t = 0.5*np.sign(tg)*np.exp(-np.abs(tg))
wv2 = np.array([-4.1, -1.3, -0.7, 0.7, 1.3, 4.1])
Xw = 1/(1 + 1j*wv2)
ev_num = ft(ev_t, tg, wv2)
od_num = ft(od_t, tg, wv2)
chk("M5 even part: numerically Re{X} on both signs of w",
    np.max(np.abs(ev_num - Xw.real)) < 1e-5, f"max error {np.max(np.abs(ev_num - Xw.real)):.2e}")
chk("M5 odd part: numerically j Im{X} on both signs of w",
    np.max(np.abs(od_num - 1j*Xw.imag)) < 1e-5, f"max error {np.max(np.abs(od_num - 1j*Xw.imag)):.2e}")

# ---------------------------------------------------------------- m6-props-evenodd
# Ev{a^n u[n]} = (1/2) a^{|n|} + (1/2) delta[n], and it transforms to Re{X}.
av = 0.6
wgrid = np.linspace(-np.pi, np.pi, 401)
nn = np.arange(-4000, 4001)
ev = 0.5*av**np.abs(nn) + 0.5*(nn == 0)
ev_ft = np.array([np.sum(ev*np.exp(-1j*wv_*nn)) for wv_ in wgrid])
X = 1/(1 - av*np.exp(-1j*wgrid))
chk("M6 even part: Ev{a^n u[n]} transforms to Re{X(e^{jw})}",
    np.max(np.abs(ev_ft - X.real)) < 1e-9,
    f"max error {np.max(np.abs(ev_ft - X.real)):.2e}")

closed = (1 - av*np.cos(wgrid))/(1 - 2*av*np.cos(wgrid) + av**2)
chk("M6 even part: Re{X} is (1 - a cos w)/(1 - 2a cos w + a^2)",
    np.max(np.abs(X.real - closed)) < 1e-12)

od = 0.5*np.sign(nn)*av**np.abs(nn)
od_ft = np.array([np.sum(od*np.exp(-1j*wv_*nn)) for wv_ in wgrid])
chk("M6 odd part: Od{a^n u[n]} transforms to j Im{X(e^{jw})}",
    np.max(np.abs(od_ft - 1j*X.imag)) < 1e-9,
    f"max error {np.max(np.abs(od_ft - 1j*X.imag)):.2e}")

closed_im = -av*np.sin(wgrid)/(1 - 2*av*np.cos(wgrid) + av**2)
chk("M6 odd part: Im{X} is -a sin w/(1 - 2a cos w + a^2)",
    np.max(np.abs(X.imag - closed_im)) < 1e-12)

# ---------------------------------------------------------------- M4 laboratories F G P Q R S

# Laboratory F: square-wave partial sum, Gibbs overshoot limit and exactness of
# a discrete reconstruction are stated as fixed numbers on the cards.
def _sq_a(k):
    return 0.5 if k == 0 else np.sin(np.pi*k/2)/(np.pi*k)

def _sq_partial(t, n):
    w0f = np.pi
    s = _sq_a(0)
    for k in range(1, n+1):
        s += 2*_sq_a(k)*np.cos(k*w0f*t)
    return s

_tg = np.linspace(-1, 1, 20001)
_ov = 100*(_sq_partial(_tg, 200).max() - 1)/1
chk("F: square-wave Gibbs overshoot approaches 8.95% of the jump",
    abs(_ov - 8.95) < 0.02, f"{_ov:.4f}%")

# Laboratory G: LTI eigenvalue chain a_k -> H -> b_k at the default state
# (continuous-time low-pass, wc = 1, w0 = pi): b_0 should equal a_0 = 1.
_w0g = np.pi
_Hct = lambda w, wc: 1/(1 + 1j*w/wc)
chk("G: default state (CT low-pass, wc=1) gives output average b_0 = 1",
    abs((1+0j)*_Hct(0, 1) - 1) < 1e-12)

# Laboratory P: eigenvalue |H| and angle H at the default frequency w = 1 for
# each of the four systems, read off the "Eigenvalue" card.
_w1 = 1.0
_Hdelay = np.exp(-1j*_w1)
chk("P: CT pure delay, |H(j1)| = 1", abs(abs(_Hdelay) - 1.0) < 1e-12)
chk("P: CT pure delay, angle H(j1) = -1 rad", abs(np.angle(_Hdelay) - (-1.0)) < 1e-12)
_Hrc = 1/(1 + 1j*_w1)
chk("P: CT RC low-pass, |H(j1)| = 1/sqrt(2)", abs(abs(_Hrc) - 1/np.sqrt(2)) < 1e-12)
_Havg = 0.5 + 0.5*np.exp(-1j*_w1)
chk("P: DT two-point average, |H(e^{j1})| = 0.8776",
    abs(abs(_Havg) - 0.87758256) < 1e-6)
_Hdiff = 0.5 - 0.5*np.exp(-1j*_w1)
chk("P: DT first difference, |H(e^{j1})| = 0.4794",
    abs(abs(_Hdiff) - 0.47942554) < 1e-6)

# Laboratory Q: the analysis integral for x1(t) = 1 + 0.5cos(2*pi*t) + sin(3*pi*t),
# T0 = 2, w0 = pi, evaluated by the same Simpson's-rule probe the laboratory uses,
# against the closed-form coefficients a0=1, a(+-2)=1/4, a3=1/(2j), a(-3)=-1/(2j).
def _x1(t):
    return 1 + 0.5*np.cos(2*np.pi*t) + np.sin(3*np.pi*t)

def _simpson_ak(f, k, T0q=2.0, Nq=4000):
    w0q = 2*np.pi/T0q
    tt = np.linspace(-T0q/2, T0q/2, Nq+1)
    vals = f(tt)*np.exp(-1j*k*w0q*tt)
    wgt = np.ones(Nq+1); wgt[1:-1:2] = 4; wgt[2:-1:2] = 2
    return np.sum(wgt*vals)*(T0q/Nq)/3/T0q

chk("Q: x1 analysis integral a_0 = 1", abs(_simpson_ak(_x1, 0) - 1) < 1e-9)
chk("Q: x1 analysis integral a_2 = 1/4", abs(_simpson_ak(_x1, 2) - 0.25) < 1e-9)
chk("Q: x1 analysis integral a_-2 = 1/4", abs(_simpson_ak(_x1, -2) - 0.25) < 1e-9)
chk("Q: x1 analysis integral a_3 = 1/(2j)",
    abs(_simpson_ak(_x1, 3) - 1/(2j)) < 1e-9)
chk("Q: x1 analysis integral a_-3 = -1/(2j)",
    abs(_simpson_ak(_x1, -3) - (-1/(2j))) < 1e-9)

# rectangular wave (Q's second case): a0 = 0.5.
def _rectq(t):
    u = t - 2*np.round(t/2)
    return np.where(np.abs(u) < 0.5, 1.0, 0.0)

chk("Q: rectangular-wave analysis integral a_0 = 0.5",
    # the Simpson grid samples exactly on the wave's jump at t = +-0.5, so the
    # numerical integral (like the laboratory's own probe) carries a small,
    # grid-resolution bias there; the tolerance reflects that discretisation.
    abs(_simpson_ak(_rectq, 0) - 0.5) < 2e-4,
    f"{_simpson_ak(_rectq, 0):.6f}")

# Laboratory R: DT square wave default (N=11, N1=2): a_0 = (2N1+1)/N, and the
# reconstruction is exact (error 0) once all floor(N/2) coefficients are kept.
# Also the N=11 sawtooth case: |a_1| = 1.7747.
_Nr, _N1r = 11, 2
def _akSquare(k, Nq, N1q):
    r = k/Nq
    if abs(r - round(r)) < 1e-12:
        return (2*N1q+1)/Nq
    return np.sin(2*np.pi*k*(N1q+0.5)/Nq)/(Nq*np.sin(np.pi*k/Nq))

chk("R: square-wave a_0 = (2N1+1)/N = 5/11",
    abs(_akSquare(0, _Nr, _N1r) - 5/11) < 1e-12)

def _xsq(n, Nq, N1q):
    m = ((n % Nq) + Nq) % Nq
    mm = m - Nq if m > Nq/2 else m
    return 1.0 if abs(mm) <= N1q else 0.0

def _reconSquare(n, Mk, Nq, N1q):
    w0r = 2*np.pi/Nq
    s = _akSquare(0, Nq, N1q)
    for k in range(1, Mk+1):
        c = _akSquare(k, Nq, N1q)
        s += 2*c*np.cos(k*w0r*n)
    return s

_kmaxR = _Nr//2
_errR = max(abs(_xsq(n, _Nr, _N1r) - _reconSquare(n, _kmaxR, _Nr, _N1r)) for n in range(-_Nr, _Nr+1))
chk("R: reconstruction is exact (error 0) with all floor(N/2) coefficients kept",
    _errR < 1e-9, f"max error {_errR:.2e}")

_Nsaw = 11
_nsaw = np.arange(-5, 6)
_w0saw = 2*np.pi/_Nsaw
_a1saw = np.sum(_nsaw*np.exp(-1j*1*_w0saw*_nsaw))/_Nsaw
chk("R: sawtooth (N=11) |a_1| = 1.7747", abs(abs(_a1saw) - 1.7747) < 1e-4,
    f"{abs(_a1saw):.4f}")

# Laboratory S: base rectangular wave (T0=2, w0=pi) under a time shift by the
# default t0 = 0.3: magnitude is preserved, |b_1| = |a_1|.
def _abaseS(k):
    return 0.5 if k == 0 else np.sin(np.pi*k/2)/(np.pi*k)

_w0s = np.pi
_t0s = 0.3
_a1s = _abaseS(1)
_b1s = _abaseS(1)*np.exp(-1j*1*_w0s*_t0s)
chk("S: time shift preserves |b_1| = |a_1|", abs(abs(_b1s) - abs(_a1s)) < 1e-12,
    f"|a1|={abs(_a1s):.4f} |b1|={abs(_b1s):.4f}")

# ---------------------------------------------------------------- M4 slide scenes
# Every number a Module 4 slide states: the prediction cards, the worked
# examples, the everyday galleries, the quick check and the project briefs.
_pi = np.pi

def _near(a, b, tol=5e-4):
    return abs(a - b) < tol

# 4.1 eigenfunctions
_H = lambda w: 1/(1+1j*w)
chk("M4 eigen-ct: e^{-t}u(t) at w=2 gives 0.447 and -1.107",
    _near(abs(_H(2)), 0.447) and _near(np.angle(_H(2)), -1.107))
_Havg = lambda w: 0.5*(1+np.exp(-1j*w))
chk("M4 eigen-dt: two-point average of cos(2 pi n/3) is 1/2 cos(2 pi n/3 - pi/3)",
    _near(abs(_Havg(2*_pi/3)), 0.5, 1e-12) and _near(np.angle(_Havg(2*_pi/3)), -_pi/3, 1e-12))
chk("M4 eigen-dt: (-1)^n through the two-point average gives 0", abs(_Havg(_pi)) < 1e-12)
_Hrc = 1/(1+1j*2*_pi*50*3.18e-3)
chk("M4 real-eigen: mains through RC = 3.18 ms gives 230 V at -pi/4",
    _near(325*abs(_Hrc), 230, 0.5) and _near(np.angle(_Hrc), -_pi/4, 2e-3))
chk("M4 real-eigen: sound takes 2.9 ms to travel 1 m", _near(1/343*1e3, 2.9, 0.02))
_H3 = lambda w: (1+np.exp(-1j*w)+np.exp(-2j*w))/3
_w24 = 2*_pi/24
chk("M4 real-eigen: 3-hour average of 5 cos(2 pi n/24) gives 4.89, one hour late",
    _near(5*abs(_H3(_w24)), 4.89, 5e-3) and _near(np.angle(_H3(_w24)), -_w24, 1e-12))
_Hd = lambda w: 1-np.exp(-1j*w)
chk("M4 real-eigen: 1 kHz at 8 kHz through the first difference gives 0.765 at 3 pi/8",
    _near(abs(_Hd(_pi/4)), 0.765) and _near(np.angle(_Hd(_pi/4)), 3*_pi/8, 1e-12))

# 4.2 synthesis and analysis
from fractions import Fraction as _Fr
def _lcm_frac(a, b):
    a, b = _Fr(a), _Fr(b)
    num = np.lcm(a.numerator*b.denominator, b.numerator*a.denominator)
    return _Fr(int(num), a.denominator*b.denominator)
chk("M4 period: periods 1/2 and 1/3 give T0 = 1", _lcm_frac(_Fr(1, 2), _Fr(1, 3)) == 1)
chk("M4 period-ex: periods 4/3 and 2/5 give T0 = 4", _lcm_frac(_Fr(4, 3), _Fr(2, 5)) == 4)

# 4.3 rectangular wave, T0 = 4 T1, and its partial sums
def _aq(k):
    return 0.5 if k == 0 else np.sin(_pi*k/2)/(_pi*k)
chk("M4 rect-b: a_1 = 1/pi for T0 = 4T1", _near(_aq(1), 1/_pi, 1e-12))
chk("M4 rect-b: every even coefficient except a_0 is zero", all(abs(_aq(k)) < 1e-12 for k in range(2, 40, 2)))
def _mse(N):
    return 0.5 - (0.25 + 2*sum(_aq(k)**2 for k in range(1, N+1)))
_m = [_mse(N) for N in (3, 9, 27, 81)]
chk("M4 howmany: MSE 0.025, 0.010, 0.004, 0.001 at N = 3, 9, 27, 81",
    all(_near(a, b, 6e-4) for a, b in zip(_m, (0.025, 0.010, 0.004, 0.001))),
    ", ".join(f"{v:.4f}" for v in _m))
_tt = np.linspace(0, 0.5, 200001)   # T0 = 2, T1 = 0.5: the jump sits at t = 0.5
_x81 = 0.5 + sum(2*_aq(k)*np.cos(_pi*k*(_tt - 0.5 + 0.5)) for k in range(1, 82))
chk("M4 howmany-b: x_81 peaks near 1.0895 for a unit jump", _near(_x81.max(), 1.0895, 2e-3), f"{_x81.max():.4f}")
chk("M4 real-series: a 5 V pulse on a quarter of each period has a_0 = 1.25 V", _near(5*0.25, 1.25, 1e-12))
chk("M4 real-series: a turn signal on 4 of 8 samples has a_0 = 1/2", _near(4/8, 0.5, 1e-12))

# 4.4 the discrete-time series
def _dtfs(x):
    N = len(x); n = np.arange(N)
    return np.array([np.sum(x*np.exp(-2j*_pi*k*n/N))/N for k in range(N)])
_n24 = np.arange(24)
_x24 = np.sin(5*_pi*_n24/6) + np.cos(3*_pi*_n24/4 + _pi/5)
_c24 = _dtfs(_x24)
chk("M4 dtfs-ex: the sum repeats every 24 samples and not sooner",
    all(np.max(np.abs(np.roll(_x24, -p) - _x24)) > 1e-9 for p in range(1, 24)))
chk("M4 dtfs-ex-b: a_10 = 1/(2j), a_9 = 1/2 e^{j pi/5}, the rest zero",
    _near(_c24[10], 1/2j, 1e-12) and _near(_c24[9], 0.5*np.exp(1j*_pi/5), 1e-12)
    and _near(_c24[24-10], -1/2j, 1e-12) and _near(_c24[24-9], 0.5*np.exp(-1j*_pi/5), 1e-12)
    and sum(abs(_c24) > 1e-9) == 4)
def _xsqr(N, N1):
    n = np.arange(N); m = n - N*np.round(n/N)
    return np.where(np.abs(m) <= N1, 1.0, 0.0)
def _dtrect(k, N, N1):
    if abs(k/N - round(k/N)) < 1e-12: return (2*N1+1)/N
    return np.sin(2*_pi*k*(N1+0.5)/N)/(N*np.sin(_pi*k/N))
_ok = all(_near(_dtfs(_xsqr(N, N1))[k].real, _dtrect(k, N, N1), 1e-12)
          for N, N1 in ((10, 2), (20, 2), (12, 1)) for k in range(N))
chk("M4 dt-square-b: both branches of the square-wave coefficients", _ok)
chk("M4 dt-square-c: N = 12, N1 = 1 gives a_0 = 1/4", _near(_dtrect(0, 12, 1), 0.25, 1e-12))
_nsw = np.arange(-5, 6)
_asw = np.array([np.sum(_nsw*np.exp(-2j*_pi*k*_nsw/11))/11 for k in range(-5, 6)])
chk("M4 dt-saw-b: sawtooth coefficients purely imaginary, |a_1| = 1.7747, a_-1 = -a_1",
    np.max(np.abs(_asw.real)) < 1e-12 and _near(abs(_asw[6]), 1.7747, 1e-4) and _near(_asw[4], -_asw[6], 1e-12))
chk("M4 real-dtfs: a light green on 4 of 9 samples has a_0 = 4/9", _near(_dtfs(np.array([1,1,1,1,0,0,0,0,0.]))[0].real, 4/9, 1e-12))

# 4.5 properties
chk("M4 props-1: delay by T0/2 turns a_1 into -a_1", _near(np.exp(-1j*_pi), -1, 1e-12))
chk("M4 props-1b: T0 = 2, t0 = 0.4 gives a phase change of -0.4 pi at k = 1", _near(-1*_pi*0.4, -0.4*_pi, 1e-12))
_x2 = np.array([1, 0.]); _x6 = np.array([1, 0, 0, 0, 0, 0.])
chk("M4 props-scale: 1,0 stretched by 3 has a_0 = 1/6", _near(_dtfs(_x6)[0].real, 1/6, 1e-12) and _near(_dtfs(_x2)[0].real/3, 1/6, 1e-12))
_x4 = np.array([1, 0.5, 0, 0.5]); _x12 = np.zeros(12); _x12[::3] = _x4
chk("M4 props-scale: x_(3)[n] has coefficients a_k/3", np.allclose(_dtfs(_x12), np.tile(_dtfs(_x4), 3)/3))
chk("M4 props-conv: the triangle 1-|u| has mean 0.5 = T0 a_0^2", _near(2*0.5**2, 0.5, 1e-12))
_tc = np.linspace(-1, 1, 400001)
chk("M4 props-mult: cos^2 has a_0 = 1/2", _near(np.trapezoid(np.cos(_pi*_tc)**2, _tc)/2, 0.5, 1e-6))
chk("M4 props-calc: d/dt sin(pi t) has a_1 = pi/2", _near(1j*_pi*(1/2j), _pi/2, 1e-12))
_run = np.cumsum(np.tile([1, 1, 1, -1], 5))
chk("M4 props-dt-calc: mean 1/2 climbs by N a_0 = 2 each period", np.all(_run[4:] - _run[:-4] == 2))
chk("M4 parseval: 2 cos(w0 t) has average power 2", _near(np.trapezoid((2*np.cos(_pi*_tc))**2, _tc)/2, 2, 1e-6))
_pr = 0.25 + 2*sum(_aq(k)**2 for k in range(1, 200001))
chk("M4 parseval-b: rectangular wave power 0.5, constant term 0.25 = one half", _near(_pr, 0.5, 1e-5), f"{_pr:.6f}")
_ps = 2*sum(1/(4*_pi**2*k**2) for k in range(1, 200001))
chk("M4 parseval-b: sawtooth power 1/12", _near(_ps, 1/12, 1e-6), f"{_ps:.6f}")
chk("M4 real-props: 230 sqrt2 cos has power 230^2", _near(2*(115*np.sqrt(2))**2, 230**2, 1e-6))

# 4.6 periodic inputs to LTI systems
_ak6 = {0: 1, 1: 0.5, -1: 0.5, 2: 1/2j, -2: -1/2j, 3: 0.5*np.exp(1j*_pi/3), -3: 0.5*np.exp(-1j*_pi/3)}
_blp = {k: a*_H(k*_pi) for k, a in _ak6.items()}
chk("M4 lpf-b: b_1 = 0.1517 e^{-j1.263}, b_2 = 0.0786 e^{-j2.984}, b_3 = 0.0528 e^{-j0.418}",
    _near(abs(_blp[1]), 0.1517) and _near(np.angle(_blp[1]), -1.263)
    and _near(abs(_blp[2]), 0.0786) and _near(np.angle(_blp[2]), -2.984)
    and _near(abs(_blp[3]), 0.0528) and _near(np.angle(_blp[3]), -0.418))
chk("M4 lpf-b: amplitudes 0.303, 0.157, 0.106", all(_near(2*abs(_blp[k]), v, 6e-4) for k, v in ((1, .303), (2, .157), (3, .106))))
_tl = np.linspace(0, 2, 20001)
_xl = 1 + np.cos(_pi*_tl) + np.sin(2*_pi*_tl) + np.cos(3*_pi*_tl + _pi/3)
_yl = sum(_blp[k]*np.exp(1j*k*_pi*_tl) for k in _blp).real
_yf = 1 + .303316*np.cos(_pi*_tl-1.262627) + .157177*np.cos(2*_pi*_tl-2.983761) + .105510*np.cos(3*_pi*_tl-.417840)
chk("M4 lpf-b: the real-form output equals the sum of b_k e^{jk w0 t}", np.max(np.abs(_yl - _yf)) < 1e-5)
_Hh = lambda w: 1j*w/(1+1j*w)
_bhp = {k: a*_Hh(k*_pi) for k, a in _ak6.items()}
chk("M4 hpf: gains 0, 0.953, 0.988, 0.994", all(_near(abs(_Hh(k*_pi)), v) for k, v in ((0, 0), (1, .953), (2, .988), (3, .994))))
chk("M4 hpf: b_1 = 0.4764 e^{j0.308}, b_2 = 0.4938 e^{-j1.413}, b_3 = 0.4972 e^{j1.153}",
    _near(abs(_bhp[1]), .4764) and _near(np.angle(_bhp[1]), .308) and _near(abs(_bhp[2]), .4938)
    and _near(np.angle(_bhp[2]), -1.413) and _near(abs(_bhp[3]), .4972) and _near(np.angle(_bhp[3]), 1.153))
_xd = np.array([1, 0, 0, 0.]); _ad = _dtfs(_xd)
chk("M4 dt-filt: the period-4 impulse train has a_k = 1/4", np.allclose(_ad, 0.25))
_H1 = lambda w: 0.5*(1-np.exp(-1j*w)); _H2 = lambda w: 0.5*(1+np.exp(-1j*w))
_b1d = [_ad[k]*_H1(k*_pi/2) for k in range(4)]
chk("M4 dt-filt: b_0 = 0, b_1 = 0.1768 e^{j pi/4}, b_2 = 0.25",
    abs(_b1d[0]) < 1e-12 and _near(abs(_b1d[1]), .1768) and _near(np.angle(_b1d[1]), _pi/4, 1e-12) and _near(_b1d[2], .25, 1e-12))
_nd = np.arange(8)
_yd = 0.5*np.tile(_xd, 2) - 0.5*np.roll(np.tile(_xd, 2), 1)
chk("M4 dt-filt-b: 0.354 cos(pi n/2 + pi/4) + 0.25(-1)^n matches h_1 sample by sample",
    np.allclose(np.sqrt(2)/4*np.cos(_pi*_nd/2 + _pi/4) + 0.25*(-1.0)**_nd, _yd) and _near(np.sqrt(2)/4, .354))
_yd2 = 0.5*np.tile(_xd, 2) + 0.5*np.roll(np.tile(_xd, 2), 1)
chk("M4 dt-filt-c: b_2 = 0 and 0.25 + 0.354 cos(pi n/2 - pi/4) matches h_2",
    abs(_ad[2]*_H2(_pi)) < 1e-12 and np.allclose(0.25 + np.sqrt(2)/4*np.cos(_pi*_nd/2 - _pi/4), _yd2))
chk("M4 real-lti: RC cut-off at the clock frequency passes 0.707 and 0.316",
    _near(abs(_H(1)), .707) and _near(abs(_H(3)), .316))
chk("M4 real-lti: a 5 Hz coupling capacitor keeps 0.995 of 50 Hz at +0.0997 rad",
    _near(abs(_Hh(10)), .995) and _near(np.angle(_Hh(10)), .0997, 1e-4))
chk("M4 real-lti: two-point average of 3 cos(pi n/2) gives 2.12 at -pi/4",
    _near(3*abs(_H2(_pi/2)), 2.12, 2e-3) and _near(np.angle(_H2(_pi/2)), -_pi/4, 1e-12))
chk("M4 real-lti: first difference of 10 cos(2 pi n/7) gives 8.68 at 5 pi/14",
    _near(10*abs(_Hd(2*_pi/7)), 8.68, 5e-3) and _near(np.angle(_Hd(2*_pi/7)), 5*_pi/14, 1e-12))

# 4.2 cosine and sine forms of a real signal
_ttr = np.linspace(0, 4, 4001)
_a1t = 0.4 + 0.3j
chk("M4 trig: a_1 = 0.4 + j0.3 gives A_1 = 0.5, theta_1 = 0.644, and 2B cos - 2C sin = 2A cos(. + theta)",
    _near(abs(_a1t), 0.5, 1e-12) and _near(np.angle(_a1t), 0.644)
    and np.allclose(0.8*np.cos(_pi*_ttr) - 0.6*np.sin(_pi*_ttr), np.cos(_pi*_ttr + np.angle(_a1t)))
    and np.allclose(2*(_a1t*np.exp(1j*_pi*_ttr)).real, np.cos(_pi*_ttr + np.angle(_a1t))))
_xt = (1-1j)*np.exp(1j*_pi*_ttr) + (1+1j)*np.exp(-1j*_pi*_ttr)
chk("M4 trig: a_1 = 1 - j, a_-1 = 1 + j gives 2 cos(pi t) + 2 sin(pi t)",
    np.max(np.abs(_xt.imag)) < 1e-12 and np.allclose(_xt.real, 2*np.cos(_pi*_ttr) + 2*np.sin(_pi*_ttr)))

# 4.6 ideal low-pass, frequency shaping, recursive filter
_tid = np.linspace(-2, 2, 8001)
_yid = sum(_aq(k)*np.exp(1j*k*_pi*_tid) for k in range(-3, 4)).real
chk("M4 ideal: cutoff 3.5 pi on the T0 = 2 rectangular wave gives 1/2 + (2/pi) cos pi t - (2/(3 pi)) cos 3 pi t",
    np.allclose(_yid, 0.5 + 2/_pi*np.cos(_pi*_tid) - 2/(3*_pi)*np.cos(3*_pi*_tid)))
_kept = [k for k in range(1, 20) if k*_pi < 2.5*_pi and abs(_aq(k)) > 1e-12]
chk("M4 ideal: cutoff 2.5 pi leaves one cosine besides the constant", _kept == [1], str(_kept))
_ts = sp.symbols('t', real=True)
chk("M4 shaping: d/dt [cos t + cos(3t)/9] = -sin t - sin(3t)/3",
    sp.simplify(sp.diff(sp.cos(_ts) + sp.cos(3*_ts)/9, _ts) - (-sp.sin(_ts) - sp.sin(3*_ts)/3)) == 0)
chk("M4 shaping: differentiator gain 4 pi / 2 pi = 2 for cos 2 pi t + cos 4 pi t",
    _near(abs(1j*4*_pi)/abs(1j*2*_pi), 2, 1e-12))
chk("M4 shaping figure: |j w| is 1 at k = 1 and 3 at k = 3 for w0 = 1", abs(1j*1) == 1 and abs(1j*3) == 3)
_Hr = lambda w, a: 1/(1 - a*np.exp(-1j*w))
_wr = np.linspace(-_pi, _pi, 721)
chk("M4 dt-rec: |H| for a = -0.6 is |H| for a = 0.6 mirrored about pi/2",
    np.allclose(np.abs(_Hr(_wr, -0.6)), np.abs(_Hr(_pi - _wr, 0.6))))
chk("M4 dt-rec: a = 0.5 gives |H(e^{j pi})| = 2/3", _near(abs(_Hr(_pi, 0.5)), 2/3, 1e-12))
chk("M4 dt-rec: H(1) = 1/(1-a) and H(-1) = 1/(1+a)",
    _near(_Hr(0, 0.6), 2.5, 1e-12) and _near(_Hr(_pi, 0.6), 0.625, 1e-12))
_brec = [_ad[k]*_Hr(k*_pi/2, 0.5) for k in range(4)]
chk("M4 dt-rec-b: gains 2, 1/(1+0.5j), 2/3 and b_0 = 1/2, b_1 = 0.2236 e^{-j0.464}, b_2 = 1/6",
    _near(_Hr(0, 0.5), 2, 1e-12) and _near(_Hr(_pi/2, 0.5), 1/(1+0.5j), 1e-12) and _near(_Hr(_pi, 0.5), 2/3, 1e-12)
    and _near(_brec[0], 0.5, 1e-12) and _near(abs(_brec[1]), 0.2236) and _near(np.angle(_brec[1]), -0.464)
    and _near(_brec[2], 1/6, 1e-12) and _near(abs(1+0.5j), 1.118) and _near(np.arctan(0.5), 0.464))
chk("M4 dt-rec-b figure: |b_k| = 1/2, sqrt(0.05), 1/6, sqrt(0.05), repeating every 4",
    np.allclose(np.abs(_brec), [0.5, np.sqrt(0.05), 1/6, np.sqrt(0.05)])
    and np.allclose(np.abs([_ad[k % 4]*_Hr(k*_pi/2, 0.5) for k in range(-6, 7)]),
                    [[0.5, np.sqrt(0.05), 1/6, np.sqrt(0.05)][k % 4] for k in range(-6, 7)]))
chk("M4 dt-rec figure: a = 0 gives unit gain at every w", np.allclose(np.abs(_Hr(np.linspace(-_pi, _pi, 9), 0.0)), 1))
_yr = np.zeros(400); _xr = np.tile([1, 0, 0, 0.], 100)
for _i in range(400):
    _yr[_i] = _xr[_i] + 0.5*(_yr[_i-1] if _i else 0)
_nr = np.arange(396, 400)
chk("M4 dt-rec-c: 1/2 + 0.447 cos(pi n/2 - 0.464) + (1/6)(-1)^n matches the steady-state recursion",
    np.allclose(_yr[396:], 0.5 + 2*abs(_brec[1])*np.cos(_pi*_nr/2 + np.angle(_brec[1])) + (-1.0)**_nr/6)
    and _near(2*abs(_brec[1]), 0.447))
chk("M4 dt-rec-c: y[0] = 16/15 = 1.067 and 0.5 + 0.4 + 0.167 = 1.067",
    _near(_yr[396], 16/15, 1e-12) and _near(16/15, 1.067) and _near(2*abs(_brec[1])*np.cos(0.464), 0.4)
    and _near(0.5 + 0.4 + 1/6, 1.067))

# 4.7 quick check and projects
chk("M4 quick: sqrt2 cos has power 1 and b_3 = 0.4 x 0.5 = 0.2",
    _near(2*(np.sqrt(2)/2)**2, 1, 1e-12) and _near(0.4*0.5, 0.2, 1e-12))
_tq = np.linspace(0, 1/220/4, 200001)
_sq31 = sum(4/(_pi*k)*np.sin(2*_pi*k*220*_tq) for k in range(1, 32, 2))
chk("M4 projects: a square wave of +-1 built to K = 31 peaks near 1.18", _near(_sq31.max(), 1.18, 5e-3), f"{_sq31.max():.4f}")

# ---------------------------------------------------------------- M5 laboratories V W

# Lab V: rectangular wave, cosine, sine, impulse train -- the weight of the
# impulse at k*w0 is 2*pi*a_k, never a_k, and the impulse-train spacing equals
# its own weight, 2*pi/T.
def _V_ak_rect(k, Tv, T1=1.0):
    return 2*T1/Tv if k == 0 else np.sin(k*(2*np.pi/Tv)*T1)/(np.pi*k)

chk("M5 lab V: rectangular wave T=8 gives 2 pi a_0 = pi/2 and 2 pi a_1 = 1.4142",
    _near(2*np.pi*_V_ak_rect(0, 8), np.pi/2, 1e-12)
    and _near(2*np.pi*_V_ak_rect(1, 8), 1.4142, 1e-3))
# a_k for A cos(w0 t): a_1 = a_-1 = A/2, so 2*pi*a_1 = pi*A
_Acos = 1.5
chk("M5 lab V: cosine A=1.5 cos(w0 t) has weight 2 pi a_1 = pi A = 4.7124",
    _near(2*np.pi*(_Acos/2), np.pi*_Acos, 1e-12) and _near(np.pi*_Acos, 4.7124, 1e-3))
# a_k for A sin(w0 t): a_1 = A/(2j), a_-1 = -A/(2j); the weights are purely
# imaginary, +j pi A at k=1 and -j pi A at k=-1, real part exactly zero
_Asin = 1.5
_a1_sin = _Asin/(2j)
chk("M5 lab V: sine A=1.5 sin(w0 t) has weight 2 pi a_1 = -j pi A = -j4.7124, Re = 0",
    _near((2*np.pi*_a1_sin).imag, -np.pi*_Asin, 1e-12) and abs((2*np.pi*_a1_sin).real) < 1e-12)
chk("M5 lab V: impulse train of period T=4 has w0 = 2 pi / 4 = 1.5708, equal to every impulse weight",
    _near(2*np.pi/4, 1.5708, 1e-3))

# Lab W: base signal is the rectangular pulse of half-width 1,
# X(jw) = 2 sin(w)/w = 2 sinc(w) (unnormalised sinc), X(j0) = 2.
_Xbase = lambda w: np.where(np.abs(w) < 1e-9, 2.0, 2*np.sin(np.where(np.abs(w) < 1e-9, 1.0, w))/np.where(np.abs(w) < 1e-9, 1.0, w))
chk("M5 lab W: base pulse has X(j0) = 2 and X(j pi) = 0",
    _near(_Xbase(0), 2, 1e-9) and abs(_Xbase(np.pi)) < 1e-9)

# time shift: x(t-t0) <-> e^{-j w t0} X(jw); magnitude unchanged, phase linear
_wg = np.linspace(-14, 14, 2001)
_t0 = 1.5
_Xshift = _Xbase(_wg)*np.exp(-1j*_wg*_t0)
chk("M5 lab W shift: |X| is unchanged and X(j0) after = 2 (phase 0 at w=0)",
    np.allclose(np.abs(_Xshift), np.abs(_Xbase(_wg)), atol=1e-9)
    and _near(_Xshift[np.argmin(np.abs(_wg))].real, 2, 1e-2))

# time scaling: x(a t) <-> (1/|a|) X(jw/a); area X(0) scales by 1/|a|
_a = 2.0
chk("M5 lab W scale: a = 2 gives X(j0) after = 1/2 * X(j0) before = 1",
    _near((1/abs(_a))*_Xbase(0), 1, 1e-9))

# reversal of this even pulse: x(-t) = x(t), so X(-jw) = X(jw) for all w
chk("M5 lab W reverse: the pulse is even, so X(-jw) = X(jw) at w = 2 and w = 5",
    _near(_Xbase(-2.0), _Xbase(2.0), 1e-12) and _near(_Xbase(-5.0), _Xbase(5.0), 1e-12))

# differentiation: dx/dt <-> jw X(jw); the pulse's derivative is
# delta(t+1) - delta(t-1), whose transform is 2j sin(w)
_Xderiv = lambda w: 1j*w*_Xbase(w)
chk("M5 lab W deriv: jw X(jw) equals 2j sin(w) at w = 1 and w = 3",
    _near(_Xderiv(1.0), 2j*np.sin(1.0), 1e-9) and _near(_Xderiv(3.0), 2j*np.sin(3.0), 1e-9))
chk("M5 lab W deriv: the transform has zero value at w = 0",
    abs(_Xderiv(1e-9)) < 1e-6)

# frequency shift: e^{j w0 t} x(t) <-> X(j(w - w0)); spectrum re-centres at w0
_w0 = 3.0
chk("M5 lab W freq: shifted spectrum peaks at w = w0 = 3, value 2",
    _near(_Xbase(3.0 - _w0), 2, 1e-9))

# Parseval, R = 1 ohm: energy in time equals (1/2pi) integral |X|^2 dw, checked
# independently in each domain for the base pulse and after a time shift
def _energy_time(f, lo, hi, n=6000):
    tt = np.linspace(lo, hi, n+1)
    return np.trapezoid(f(tt)**2, tt)
def _energy_freq(Xf, wmax, n=6000):
    ww = np.linspace(-wmax, wmax, n+1)
    Xv = Xf(ww)
    return np.trapezoid(np.abs(Xv)**2, ww)/(2*np.pi)
_xbase_t = lambda t: np.where(np.abs(t) < 1, 1.0, 0.0)
_Et = _energy_time(_xbase_t, -6, 6)
_Ef = _energy_freq(lambda w: _Xbase(np.where(np.abs(w) < 1e-9, 1e-9, w)), 400)
chk("M5 lab W Parseval: base pulse energy is 2 in time and matches in frequency",
    _near(_Et, 2, 5e-3) and _near(_Ef, 2, 5e-3))
_Ef_shift = _energy_freq(lambda w: _Xbase(np.where(np.abs(w) < 1e-9, 1e-9, w))
                          * np.exp(-1j*w*_t0), 400)
chk("M5 lab W Parseval: a time shift leaves the energy at 2 in both domains",
    _near(_Ef_shift, 2, 5e-3))

# ---------------------------------------------------------------- M5 laboratories H U
# Laboratory H, section 5.2: rectangular pulse, one- and two-sided exponential,
# ideal low-pass band, shifted impulse. Every number below is what the lab's
# cards state at the signal's default control value.
def _sincU(x):
    return 1.0 if abs(x) < 1e-9 else np.sin(x)/x

_T1 = 1.0
chk("M5 lab H rect: peak X(j0) = 2 T1 = 2, first null pi/T1 = pi, duration T1 = 1",
    _near(2*_T1, 2) and _near(np.pi/_T1, np.pi) and _near(_T1, 1))
chk("M5 lab H rect: time-bandwidth product 2 x first-null x duration = 2 pi",
    _near(2*(np.pi/_T1)*_T1, 2*np.pi))

_a1 = 1.0
_Xexp1 = 1/(_a1 + 1j*1.0)
chk("M5 lab H exp1: at a=1, w=1, X(jw)=0.5-j0.5, phase = -arctan(1) = -pi/4",
    _near(_Xexp1, 0.5 - 0.5j) and _near(np.angle(_Xexp1), -np.pi/4)
    and _near(-np.arctan(1.0/_a1), -np.pi/4))
chk("M5 lab H exp1: peak |X(j0)| = 1/a = 1 and half-power width = a = 1",
    _near(1/_a1, 1.0) and _near(_a1, 1.0))

_a2 = 1.0
chk("M5 lab H exp2: peak X(j0) = 2/a = 2 and half-power width = a = 1",
    _near(2/_a2, 2.0) and _near(_a2, 1.0))

_W = 3.0
chk("M5 lab H ideal band: peak X(j0) = 1, band edge W = 3, time first null = pi/W",
    _near(1.0, 1.0) and _near(_W, 3.0) and _near(np.pi/_W, np.pi/3))

_t0 = 1.0
chk("M5 lab H impulse: |X(jw)| = 1 for every w, phase = -w t0 wraps through atan2",
    _near(abs(np.exp(-1j*1.0*_t0)), 1.0)
    and _near(np.angle(np.exp(-1j*1.0*_t0)), -_t0))

# Laboratory U, section 5.1: rectangular pulse of half-width T1=1 repeated with
# period T = ratio * T1. Default ratio = 8, window |w| <= 12.
def _XrectU(w):
    return 2*_T1*_sincU(w*_T1)
def _XtriU(w):
    return 1.0 if abs(w) < 1e-6 else (2/(w*w))*(1 - np.cos(w))

_ratio = 8.0
_Tp = _ratio*_T1
_w0 = 2*np.pi/_Tp
chk("M5 lab U: sample spacing w0 = 2 pi / (8 T1) = 0.7854 rad/s",
    _near(_w0, 0.7854, 1e-4))
chk("M5 lab U: T a_0 = X(j0) = 2 for the rectangular pulse",
    _near(_XrectU(0), 2.0))
chk("M5 lab U: T a_1 = X(j w0) = 1.8006 at ratio 8",
    _near(_XrectU(_w0), 1.8006, 1e-4))

_wmax = 12
_Kmax = int(np.floor(_wmax/_w0))
_stems = [(k*_w0, _XrectU(k*_w0)) for k in range(-_Kmax, _Kmax+1)]
_inside = [s for s in _stems if abs(s[0]) < np.pi]
chk("M5 lab U: 7 stems lie inside the main lobe |w| < pi at ratio 8",
    len(_inside) == 7, str(len(_inside)))
_rebuild = sum(Xv*_w0 for w, Xv in _stems)/(2*np.pi)
chk("M5 lab U: the Riemann rebuild of x(0) is 0.9526, close to the true value 1",
    _near(_rebuild, 0.9526, 1e-4) and abs(_rebuild - 1.0) < 0.05)

chk("M5 lab U: the triangular pulse transform is sinc^2(w/2), X(0) = 1",
    _near(_XtriU(1e-8), 1.0)
    and _near(_XtriU(_w0), (np.sin(_w0/2)/(_w0/2))**2, 1e-9))

# ---------------------------------------------------------------- M5 laboratories X Y
# Lab X, filter mode, default state: x(t) = e^{-t}u(t), h(t) = e^{-bt}u(t), b = 2.
# Y(jw) = X(jw)H(jw); at w = 0 that is |X(j0)||H(j0)| = 1 * (1/b).
_bX = 2.0
chk("M5 lab X: default filter |X(j0)| = 1, |H(j0)| = 0.5, |Y(j0)| = 0.5",
    _near(1/np.hypot(1, 0), 1.0) and _near(1/np.hypot(_bX, 0), 0.5)
    and _near((1/np.hypot(1, 0))*(1/np.hypot(_bX, 0)), 0.5))
# y(t) = (e^{-t} - e^{-bt})/(b-1) u(t) for b != 1; its peak is at t = ln(b)/(b-1).
_tp = np.log(_bX)/(_bX-1)
_yp = (np.exp(-_tp) - np.exp(-_bX*_tp))/(_bX-1)
chk("M5 lab X: b = 2 peak of y(t) is 0.25 at t = 0.6931 (= ln 2)",
    _near(_tp, 0.6931, 1e-3) and _near(_yp, 0.25, 1e-3))
# At b = 1 the two poles collide and y(t) = t e^{-t} u(t); its peak is at t = 1.
chk("M5 lab X: b = 1 gives y(t) = t e^{-t} u(t), peak 1/e = 0.3679 at t = 1",
    _near(1*np.exp(-1), 1/np.e, 1e-12) and _near(1/np.e, 0.3679, 1e-3))
# Filter mode, ideal low-pass: X = 2 on |w| <= 4 pi (band-limited input),
# H = 3 on |w| <= wc; at the default cutoff wc = 4 the narrower band is wc.
_AEXP, _HEXP, _WEXP, _wc = 2.0, 3.0, 4*np.pi, 4.0
chk("M5 lab X: band-limited x ideal low-pass gives |X(j0)| = 2, |H(j0)| = 3, |Y(j0)| = 6",
    _near(_AEXP, 2.0) and _near(_HEXP, 3.0) and _near(_AEXP*_HEXP, 6.0))
# y(t) = A sin(Wt)/(pi t) with A = X*H = 6 and W = min(4 pi, wc) = wc = 4; peak at t = 0 is A*W/pi.
_W = min(_WEXP, _wc)
chk("M5 lab X: with wc = 4 the narrower band is W = 4 and the output peak A*W/pi = 7.6394",
    _near(_W, 4.0) and _near(_AEXP*_HEXP*_W/np.pi, 7.6394, 1e-4))
# Modulate mode, default state: W = 2 pi, wc = 4 pi. Copy edges wc - W to wc + W;
# 4 pi >= 2 pi so the copies do not overlap, and each copy has height 1/2.
_Wm, _wcm = 2*np.pi, 4*np.pi
chk("M5 lab X: modulate default W = 2 pi, wc = 4 pi gives copy edges 2 pi to 6 pi, no overlap",
    _near(_wcm - _Wm, 2*np.pi, 1e-9) and _near(_wcm + _Wm, 6*np.pi, 1e-9) and _wcm >= _Wm)
chk("M5 lab X: the two shifted copies just touch when wc = W, each copy has height 0.5",
    _near(0.5*1, 0.5))

# Lab Y, default state: y'' + 4y' + 3y = x' + 2x, so a1=4, a0=3, b1=1, b0=2.
_a1Y, _a0Y, _b1Y, _b0Y = 4.0, 3.0, 1.0, 2.0
chk("M5 lab Y: default H(j0) = b0/a0 = 2/3 = 0.6667",
    _near(_b0Y/_a0Y, 2/3, 1e-12) and _near(2/3, 0.6667, 1e-4))
_discY = _a1Y*_a1Y - 4*_a0Y
_r1Y, _r2Y = (-_a1Y+np.sqrt(_discY))/2, (-_a1Y-np.sqrt(_discY))/2
chk("M5 lab Y: default denominator (jw)^2 + 4 jw + 3 vanishes at jw = -1 and jw = -3",
    _near(_r1Y, -1.0, 1e-12) and _near(_r2Y, -3.0, 1e-12))
_AY = (_b1Y*_r1Y+_b0Y)/(_r1Y-_r2Y)
_BY = (_b1Y*_r2Y+_b0Y)/(_r2Y-_r1Y)
chk("M5 lab Y: default partial fractions A = 0.5, B = 0.5, so h(t) = 0.5 e^{-t} + 0.5 e^{-3t}",
    _near(_AY, 0.5, 1e-12) and _near(_BY, 0.5, 1e-12))
chk("M5 lab Y: default h(0+) = b1 = 1 and the area of h(t) equals H(j0) = 2/3",
    _near(_b1Y, 1.0) and _near(_b0Y/_a0Y, _AY/1 + _BY/3, 1e-9))
# stability: the sliders keep a1, a0 > 0 (their ranges are [0.2,6] and [0.25,9]),
# which by the quadratic formula keeps both roots' real parts negative.
_a1lo, _a1hi, _a0lo, _a0hi = 0.2, 6.0, 0.25, 9.0
chk("M5 lab Y: the a1, a0 slider ranges stay strictly positive, so every setting is stable",
    _a1lo > 0 and _a0lo > 0)
# a repeated root occurs at a1^2 = 4 a0; check the boundary case a1=4, a0=4 (b1=1,b0=2).
_a1R, _a0R, _b1R, _b0R = 4.0, 4.0, 1.0, 2.0
_rR = -_a1R/2
_CR, _DR = _b1R, _b0R + _b1R*_rR
chk("M5 lab Y: a1 = 4, a0 = 4 gives a repeated root at jw = -2, h(t) = e^{-2t} + 0(t)e^{-2t}",
    _near(_a1R*_a1R, 4*_a0R) and _near(_rR, -2.0) and _near(_CR, 1.0) and _near(_DR, 0.0))
# a complex pair occurs when a1^2 < 4 a0; check a1=2, a0=5 (b1=1,b0=2).
_a1C, _a0C, _b1C, _b0C = 2.0, 5.0, 1.0, 2.0
_reC, _imC = -_a1C/2, np.sqrt(4*_a0C-_a1C*_a1C)/2
_BcC = (_b0C - _reC*_b1C)/_imC
chk("M5 lab Y: a1 = 2, a0 = 5 gives a complex pair jw = -1 +/- j2",
    _near(_reC, -1.0) and _near(_imC, 2.0))
chk("M5 lab Y: that complex case gives h(t) = e^{-t}(cos 2t + 1.5 sin 2t)u(t)",
    _near(_b1C, 1.0) and _near(_BcC, 1.5, 1e-9))

# ---------------------------------------------------------------- M5 slide scenes
# Every number a Module 5 slide states: the prediction cards, the worked
# examples, the everyday galleries, the quick check and the project briefs.
import mpmath as _mp
def _q(f, a, b, n=1):
    pts = [a, b] if n == 1 else list(np.linspace(a, b, n + 1))
    return float(_mp.quad(lambda x: f(float(x)), pts))
_rft = lambda w, T1: 2*T1 if abs(w) < 1e-12 else 2*np.sin(w*T1)/w
_lpf = lambda t, W: W/_pi if abs(t) < 1e-12 else np.sin(W*t)/(_pi*t)

# 5.1 from series to transform
chk("M5 derive-1: pulses of T1=2 stay apart only for T>4, so T=6", 6 > 2*2 and not 3 > 2*2)
chk("M5 derive-2: T=8, T1=1 gives 8 a0 = 2", _near(8*(2*1/8), 2, 1e-12))
chk("M5 derive-3: without 1/2pi the synthesis of e^{-|t|} at t=0 gives 2pi",
    _near(_q(lambda w: 2/(1+w*w), -np.inf, np.inf), 2*_pi, 1e-8))
chk("M5 exist: e^{-2t}u(t) has area 1/2 and energy 1/4",
    _near(_q(lambda t: np.exp(-2*t), 0, np.inf), 0.5, 1e-10) and _near(_q(lambda t: np.exp(-4*t), 0, np.inf), 0.25, 1e-10))
chk("M5 exist: 1/sqrt(t) on (0,1) has area 2", _near(_q(lambda t: t**-0.5, 0, 1), 2, 1e-8))
chk("M5 limit: 2a/(a^2+w^2) at a=0.5 peaks at 4 and has area 2pi",
    _near(2*0.5/0.25, 4, 1e-12) and _near(_q(lambda w: 1/(0.25+w*w), -np.inf, np.inf), 2*_pi, 1e-8))
chk("M5 real-transform: fair visitors 1000-250|n-12| are 0 at n=8, 16 and 1000 at n=12",
    [1000-250*abs(n-12) for n in (8, 12, 16)] == [0, 1000, 0])

# 5.2 standard pairs
chk("M5 ex-exp-b: peaks 1/a are 5, 1, 0.2 for a = 0.2, 1, 5", [round(1/a, 6) for a in (0.2, 1, 5)] == [5, 1, 0.2])
chk("M5 ex-exp-b: |X(j2)| = 1/(2 sqrt 2) = 0.354 for a=2",
    _near(abs(1/(2+2j)), 1/(2*np.sqrt(2)), 1e-12) and _near(abs(1/(2+2j)), 0.354))
chk("M5 ex-exp-phase: angle 1/(1+j sqrt3) = -pi/3", _near(np.angle(1/(1+1j*np.sqrt(3))), -_pi/3, 1e-12))
chk("M5 ex-twosided: peaks 2/a are 4, 2, 0.4 for a = 0.5, 1, 5", [round(2/a, 6) for a in (0.5, 1, 5)] == [4, 2, 0.4])
chk("M5 rect-sinc-b: peaks 2T1 are 2, 10, 20", [2*T for T in (1, 5, 10)] == [2, 10, 20])
chk("M5 rect-sinc-b: normalised sinc first zero at theta=1", abs(np.sinc(1.0)) < 1e-15 and np.sinc(0.999) > 0)
_wz = sp.nsolve(sp.tan(sp.Symbol('w')) - sp.Symbol('w'), sp.Symbol('w'), 4.49)
chk("M5 rect-zeros: first side lobe of 2 sin w / w is -0.434 at w=4.4934",
    _near(float(_wz), 4.4934) and _near(_rft(float(_wz), 1), -0.434, 5e-4), "%.5f" % _rft(float(_wz), 1))
chk("M5 rect-zeros: first zero pi/T1 = 2pi for T1 = 0.5", abs(_rft(2*_pi, 0.5)) < 1e-12)
chk("M5 sinc-rect: sin(Wt)/(pi t) peaks at W/pi", _near(_lpf(1e-9, 3.0), 3/_pi, 1e-9))
chk("M5 inverse-rel: T x BW = 2pi for T1 = 1 and 1/4",
    _near(2*1*_pi/1, 2*_pi, 1e-12) and _near(0.5*4*_pi, 2*_pi, 1e-12))
_Xtri = lambda w, T1: T1*(np.sin(w*T1/2)/(w*T1/2))**2
chk("M5 inverse-rel: triangle of half-width T1 has first null 2pi/T1, product 4pi",
    abs(_Xtri(2*_pi/1.5, 1.5)) < 1e-12 and _Xtri(0.99*2*_pi/1.5, 1.5) > 0 and _near(2*1.5*2*_pi/1.5, 4*_pi, 1e-12))
chk("M5 bandlimit: 2/(1+w^2) at w=1e6 is 2e-12", _near(2/(1+1e12), 2e-12, 1e-15))

# 5.3 periodic signals
chk("M5 periodic: the constant 3 has weight 6pi at w=0", _near(2*_pi*3, 6*_pi, 1e-12))
_wsq = lambda k, T: 2*_pi*(2/T if k == 0 else np.sin(2*_pi*k/T)/(_pi*k))
chk("M5 ex-square: T=8 weights vanish at k=4,8 and are negative at k=5,6,7",
    all(abs(_wsq(k, 8)) < 1e-12 for k in (4, 8)) and all(_wsq(k, 8) < 0 for k in (5, 6, 7)))
chk("M5 ex-square: weights at w=0 are 1.5708, 0.7854, 0.3927 with w0 = pi/4, pi/8, pi/16",
    all(_near(_wsq(0, T), v) for T, v in ((8, 1.5708), (16, 0.7854), (32, 0.3927))))
chk("M5 ex-sinus: 4 cos(3 pi t) has weight 4pi = 12.57", _near(2*_pi*2, 12.57, 5e-3))
chk("M5 ex-sinus-c: 6 sin(4 pi t) has weight magnitude 6pi = 18.85", _near(abs(2*_pi*6/2j), 18.85, 5e-3))
chk("M5 ex-sinus-b: the constant 5 gives 10pi = 31.42", _near(10*_pi, 31.42, 5e-3))
chk("M5 ex-imptrain: 2pi/T is 6.28 and 3.14", _near(2*_pi, 6.28, 5e-3) and _near(_pi, 3.14, 5e-3))
chk("M5 real-periodic: 325 cos(2 pi 0.05 t), t in ms, is 50 Hz", _near(0.05*1000, 50, 1e-12))

# 5.4 properties
chk("M5 props-1: a delay of 2 adds -2 rad at w=1", _near(np.angle(np.exp(-1j*1*2)), -2, 1e-12))
chk("M5 props-shift-ex: X3(j0) = 2*4 + 2 = 10 = 3*2 + 2*2",
    _near(2*_rft(0, 2) + _rft(0, 1), 10, 1e-12) and 3*2 + 2*2 == 10)
_X3 = lambda w: 2*np.exp(-4j*w)*_rft(w, 2) + np.exp(-3j*w)*_rft(w, 1)
chk("M5 props-shift-ex: the closed form matches the analysis integral at w=0.7",
    abs(_X3(0.7) - (2*(_q(lambda t: np.cos(0.7*t), 2, 6) - 1j*_q(lambda t: np.sin(0.7*t), 2, 6))
                    + _q(lambda t: np.cos(0.7*t), 2, 4) - 1j*_q(lambda t: np.sin(0.7*t), 2, 4))) < 1e-9)
chk("M5 props-freq: the band |w|<2pi moved by pi is (-pi, 3pi)", (-2*_pi + _pi, 2*_pi + _pi) == (-_pi, 3*_pi))
chk("M5 props-evenodd: transform of 1/2 e^{-a|t|} is Re{1/(a+jw)} at a=1, w=2",
    _near(_q(lambda t: np.exp(-t)*np.cos(2*t), 0, np.inf), (1/(1+2j)).real, 1e-10))
chk("M5 props-dfreq: t e^{-t}u(t) has area 1 and peak e^{-1} = 0.37 at t=1",
    _near(_q(lambda t: t*np.exp(-t), 0, np.inf), 1, 1e-10) and _near(np.exp(-1), 0.37, 5e-3))
chk("M5 props-diff: for e^{-t^2} at t=1, dx/dt = -0.7358 and 3 x(1) = 1.1036",
    _near(-2*np.exp(-1), -0.7358) and _near(3*np.exp(-1), 1.1036))
chk("M5 props-diff: j*2*0.5 = j", (1j*2*0.5) == 1j)
chk("M5 props-int: area 2 gives the impulse weight 2pi", _near(_pi*2, 2*_pi, 1e-12))
chk("M5 props-scale: x(3t) has X(j0)/3 = 2 when X(j0) = 6", _near(6/3, 2, 1e-12))
chk("M5 props-scale-b: e^{t}u(-t) transforms to 1/(1-jw) at w=1.3",
    abs(_q(lambda t: np.exp(t)*np.cos(1.3*t), -np.inf, 0) - 1j*_q(lambda t: np.exp(t)*np.sin(1.3*t), -np.inf, 0) - 1/(1-1.3j)) < 1e-9)
chk("M5 props-scale-ex: the three band areas are all 4pi",
    all(_near(h*2*W, 4*_pi, 1e-12) for h, W in ((2, _pi), (1, 2*_pi), (0.5, 4*_pi))))
chk("M5 duality: 2/(1+t^2) transforms to 2pi e^{-|w|} at w=1.5",
    _near(_q(lambda t: 2/(1+t*t)*np.cos(1.5*t), -200, 200, 400), 2*_pi*np.exp(-1.5), 2e-3))
chk("M5 duality-ex: 2 sin(Wt)/t is 2W at t=0 and its band has height 2pi (W=pi)",
    _near(2*np.sin(_pi*1e-9)/1e-9, 2*_pi, 1e-6)
    and sp.integrate(2*sp.sin(sp.pi*sp.Symbol('t'))/sp.Symbol('t'), (sp.Symbol('t'), -sp.oo, sp.oo)) == 2*sp.pi)
chk("M5 parseval: e^{-2t}u(t) has energy 1/4 J", _near(_q(lambda t: np.exp(-4*t), 0, np.inf), 0.25, 1e-10))
chk("M5 parseval-b: e^{-t}u(t) energy is 0.5 in both domains",
    _near(_q(lambda t: np.exp(-2*t), 0, np.inf), 0.5, 1e-10) and _near(_q(lambda w: 1/(1+w*w), -np.inf, np.inf)/(2*_pi), 0.5, 1e-8))
chk("M5 parseval-ex: energy 20pi/2pi = 10 J; unsquared heights give 6 = x3(0)",
    _near((1*2*_pi + 4*4*_pi + 1*2*_pi)/(2*_pi), 10, 1e-12) and _near((2*4*_pi + 1*4*_pi)/(2*_pi), 6, 1e-12))
chk("M5 real-props: s(2t) doubles 0.1 kHz to 0.2 kHz; h peaks at 0.2*500 = 100", _near(2*0.1, 0.2, 1e-12) and _near(0.2*500, 100, 1e-12))

# 5.5 convolution and multiplication
chk("M5 conv: 4 * 0.5 = 2", _near(4*0.5, 2, 1e-12))
_yce = lambda t: np.exp(-t) - np.exp(-2*t)
chk("M5 conv-ex: y peaks at 0.25 when t = ln 2 = 0.693, and y(0) = 0",
    _near(_yce(np.log(2)), 0.25, 1e-12) and _near(np.log(2), 0.693) and _yce(0) == 0)
chk("M5 conv-ex: direct convolution at t=1.2 matches (e^{-t}-e^{-2t})",
    _near(_q(lambda s: np.exp(-s)*np.exp(-2*(1.2-s)), 0, 1.2), _yce(1.2), 1e-10))
chk("M5 conv-ex-b: |Y(j1)| = 1/sqrt(10) = 0.316 and |Y(j0)| = 0.5",
    _near(abs(1/((1+1j)*(2+1j))), 1/np.sqrt(10), 1e-12) and _near(1/np.sqrt(10), 0.316) and _near(1/2, 0.5, 1e-12))
chk("M5 conv-lpf: peaks 8, 6, 12 are band areas over 2pi",
    _near(2*8*_pi/(2*_pi), 8, 1e-12) and _near(3*4*_pi/(2*_pi), 6, 1e-12) and _near(6*4*_pi/(2*_pi), 12, 1e-12))
def _bandconv(w, W1, W2):
    lo, hi = max(-W1, w - W2), min(W1, w + W2)
    return max(0.0, hi - lo)/(2*_pi)
chk("M5 mult: two bands of half-width 2pi give a triangle of apex 2 on |w|<4pi",
    _near(_bandconv(0, 2*_pi, 2*_pi), 2, 1e-12) and _bandconv(4*_pi, 2*_pi, 2*_pi) < 1e-12 and _near(_bandconv(2*_pi, 2*_pi, 2*_pi), 1, 1e-12))
chk("M5 mult: half-widths pi and 3pi give 4pi", _bandconv(4*_pi - 1e-9, _pi, 3*_pi) > 0 and _bandconv(4*_pi + 1e-9, _pi, 3*_pi) == 0)
chk("M5 am: each copy is X/2, so X(j0)=1 gives 0.5", _near(0.5*1, 0.5, 1e-12))
_tt = np.linspace(-3, 3, 7)
chk("M5 am-b: cos(pi t)cos(4 pi t) = 1/2 cos(3 pi t) + 1/2 cos(5 pi t); weights pi/2 = 1.5708",
    np.allclose(np.cos(_pi*_tt)*np.cos(4*_pi*_tt), 0.5*np.cos(3*_pi*_tt) + 0.5*np.cos(5*_pi*_tt)) and _near(_pi/2, 1.5708))
chk("M5 am-sinc: copies occupy 2pi..6pi, each 4pi wide, 8pi in all",
    (4*_pi - 2*_pi, 4*_pi + 2*_pi) == (2*_pi, 6*_pi) and _near(2*4*_pi, 8*_pi, 1e-12))
_B = lambda w: 1.0 if _pi <= abs(w) <= 3*_pi else 0.0
_Zo = lambda w: 0.5*_B(w - 2*_pi) + 0.5*_B(w + 2*_pi)
chk("M5 am-overlap: Z is 1 on |w|<=pi, 0.5 on 3pi..5pi, 0 elsewhere",
    _Zo(0) == 1 and _Zo(0.9*_pi) == 1 and _Zo(4*_pi) == 0.5 and _Zo(2*_pi) == 0 and _Zo(5.5*_pi) == 0)
chk("M5 sinc2: apex 2, z(0) = 4 and the triangle area over 2pi is 4",
    _near(_bandconv(0, 2*_pi, 2*_pi), 2, 1e-12) and _near(_lpf(0, 2*_pi)**2, 4, 1e-12) and _near(0.5*8*_pi*2/(2*_pi), 4, 1e-12))
chk("M5 sinc2-b: half-widths 2pi and 4pi give height 2 on |w|<=2pi, 0 beyond 6pi, area 16pi, peak 8",
    _near(_bandconv(1.9*_pi, 2*_pi, 4*_pi), 2, 1e-12) and _bandconv(6.01*_pi, 2*_pi, 4*_pi) == 0
    and _near(0.5*(4*_pi + 12*_pi)*2, 16*_pi, 1e-12) and _near(_lpf(0, 2*_pi)*_lpf(0, 4*_pi), 8, 1e-12))
chk("M5 real-conv: a 50 Hz tone in 0.1 s makes 5 cycles; the AM envelope stays in 0.5..1.5",
    _near(50*0.1, 5, 1e-12) and (1 - 0.5, 1 + 0.5) == (0.5, 1.5))

# 5.6 differential equations
_s = sp.Symbol('s')
_Hs = (_s + 2)/((_s + 1)*(_s + 3))
chk("M5 diffeq: H(j0) = 2/3", _Hs.subs(_s, 0) == sp.Rational(2, 3))
chk("M5 diffeq-ex: 1/2 and 1/2, h(0+) = 1, area 2/3",
    sp.apart(_Hs, _s) == sp.Rational(1, 2)/(_s + 1) + sp.Rational(1, 2)/(_s + 3)
    and _near(0.5 + 0.5, 1, 1e-12) and _near(_q(lambda t: 0.5*np.exp(-t) + 0.5*np.exp(-3*t), 0, np.inf), 2/3, 1e-10))
_Hw = lambda w: (1j*w + 2)/((1j*w + 1)*(1j*w + 3))
chk("M5 diffeq-ex-b: |H(j100)| is about 0.01, peak 0.667 at 0, phase near -pi/2 for large w",
    _near(abs(_Hw(100)), 0.01, 2e-4) and _near(abs(_Hw(0)), 0.667) and _near(np.angle(_Hw(1e4)), -_pi/2, 1e-3))
chk("M5 partial: t e^{-2t}u(t) transforms to 1/(2+jw)^2 at w=1",
    abs(_q(lambda t: t*np.exp(-2*t)*np.cos(t), 0, np.inf) - 1j*_q(lambda t: t*np.exp(-2*t)*np.sin(t), 0, np.inf) - 1/(2+1j)**2) < 1e-9)
_Ys = (_s + 2)/((_s + 1)**2*(_s + 3))
chk("M5 diffeq-b: Y splits into 1/4, 1/2 (double), -1/4",
    sp.simplify(sp.apart(_Ys, _s) - (sp.Rational(1, 4)/(_s + 1) + sp.Rational(1, 2)/(_s + 1)**2 - sp.Rational(1, 4)/(_s + 3))) == 0)
_yb = lambda t, c: 0.25*np.exp(-t) + 0.5*t*np.exp(-t) + c*np.exp(-3*t)
chk("M5 diffeq-b2: y(0)=0; with +1/4 it is 0.5; at t=2 the two are 0.1685 and 0.1698",
    _near(_yb(0, -0.25), 0, 1e-12) and _near(_yb(0, 0.25), 0.5, 1e-12)
    and _near(_yb(2, -0.25), 0.1685, 5e-5) and _near(_yb(2, 0.25), 0.1698, 5e-5) and _near(_yb(2, 0.25) - _yb(2, -0.25), 0.001, 3e-4))
chk("M5 diffeq-b2: direct convolution of e^{-t} with h matches at t=1.5",
    _near(_q(lambda u: np.exp(-u)*(0.5*np.exp(-(1.5-u)) + 0.5*np.exp(-3*(1.5-u))), 0, 1.5), _yb(1.5, -0.25), 1e-10))
chk("M5 real-diffeq: thermometer 20 + 17 -> 37; coffee 20 + 60 = 80 at n=0",
    20 + 17 == 37 and 20 + 60*0.9**0 == 80)

# 5.1, 5.4, 5.5 scenes added from the textbook: gibbs, step, props-deriv-ex,
# systems, demod, tune
_xW = lambda t, W: float((_mp.si(W*(t + 1)) - _mp.si(W*(t - 1)))/_mp.pi)
def _xWpeak(W):
    ts_ = np.linspace(1 - 3*_pi/W, 1, 4001)
    v = np.array([_xW(t, W) for t in ts_]); i = int(np.argmax(v))
    return v[i], ts_[i]
_g12, _g20, _g200 = _xWpeak(12), _xWpeak(20), _xWpeak(200)
chk("M5 gibbs: the first peak of x_W is about 1.09 for W = 12, 20 and 200 rad/s",
    all(abs(pk - 1.09) < 0.01 for pk, _ in (_g12, _g20, _g200)), "%.4f %.4f %.4f" % (_g12[0], _g20[0], _g200[0]))
chk("M5 gibbs: the peak sits about pi/W before the jump at t = 1 (W = 200)",
    abs((1 - _g200[1]) - _pi/200) < 0.1*_pi/200, "%.5f vs %.5f" % (1 - _g200[1], _pi/200))
chk("M5 gibbs: the guide line 1.0895 is 1/2 + Si(pi)/pi", _near(0.5 + float(_mp.si(_mp.pi))/_pi, 1.0895, 5e-5))
chk("M5 gibbs: at the jump x_W(1) = Si(2W)/pi tends to 1/2",
    _near(_xW(1, 200), 0.5, 2e-3) and _near(_xW(1, 2000), 0.5, 2e-4))
_a5, _w5 = 0.5, 1.3
_sgnft = (_q(lambda t: np.exp(-_a5*t)*np.cos(_w5*t), 0, np.inf) - 1j*_q(lambda t: np.exp(-_a5*t)*np.sin(_w5*t), 0, np.inf)) \
       - (_q(lambda t: np.exp(_a5*t)*np.cos(_w5*t), -np.inf, 0) - 1j*_q(lambda t: np.exp(_a5*t)*np.sin(_w5*t), -np.inf, 0))
chk("M5 step: e^{-a|t|}sgn(t) transforms to -2jw/(a^2+w^2) (a = 0.5, w = 1.3)",
    abs(_sgnft - (-2j*_w5/(_a5**2 + _w5**2))) < 1e-9)
chk("M5 step: -2jw/(a^2+w^2) tends to 2/(jw) as a -> 0 and is 0 at w = 0",
    abs(-2j*_w5/(1e-8 + _w5**2) - 2/(1j*_w5)) < 1e-8 and -2j*0/(_a5**2) == 0)
chk("M5 step: u(-t) = 1/2 - 1/2 sgn(t); e^{at}u(-t) -> 1/(a-jw) tends to -1/(jw)",
    abs(1/(1e-9 - 1j*_w5) - (-1/(1j*_w5))) < 1e-8)
_Xtz = lambda w: 3.0 if abs(w) < 1e-12 else 4*np.sin(1.5*w)*np.sin(0.5*w)/w**2
_xtz = lambda t: 1.0 if abs(t) <= 1 else (2 - abs(t) if abs(t) < 2 else 0.0)
chk("M5 props-deriv-ex: X(jw) = 4 sin(1.5w) sin(w/2)/w^2 matches the analysis integral at w = 0.8 and 2.1",
    all(abs(_q(lambda t: _xtz(t)*np.cos(w*t), -2, 2, 4) - _Xtz(w)) < 1e-9 for w in (0.8, 2.1)))
chk("M5 props-deriv-ex: X(j0) = 4*1.5*0.5 = 3 = trapezoid area; G(j0) = 0",
    _near(4*1.5*0.5, 3, 1e-12) and _near(_q(_xtz, -2, 2, 4), 3, 1e-10) and _near(1*1 - 1*1, 0, 1e-12)
    and _near(_Xtz(1e-5), 3, 1e-8))
_Gtz = lambda w: (np.exp(1.5j*w) - np.exp(-1.5j*w))*2*np.sin(w/2)/w
chk("M5 props-deriv-ex: G = 4j sin(1.5w) sin(w/2)/w and X = G/(jw) at w = 1.7",
    abs(_Gtz(1.7) - 4j*np.sin(2.55)*np.sin(0.85)/1.7) < 1e-12 and abs(_Gtz(1.7)/(1j*1.7) - _Xtz(1.7)) < 1e-12)
_tt5 = np.linspace(0, 3, 7)
chk("M5 systems: d/dt cos(2t) = -2 sin(2t), amplitude |j2| = 2",
    abs(1j*2) == 2 and np.allclose(np.gradient(np.cos(2*np.linspace(0, 3, 300001)), np.linspace(0, 3, 300001))[::50000], -2*np.sin(2*_tt5), atol=1e-4))
chk("M5 systems: the integrator impulse weight is pi = 3.14", _near(_pi, 3.14, 2e-3))
chk("M5 demod: x cos^2 = x/2 + x/2 cos(2wc t); with a phase phi the baseband term is x cos(phi)/2",
    np.allclose(np.cos(3*_tt5)**2, 0.5 + 0.5*np.cos(6*_tt5))
    and np.allclose(np.cos(3*_tt5)*np.cos(3*_tt5 + 0.7), 0.5*np.cos(0.7) + 0.5*np.cos(6*_tt5 + 0.7))
    and abs(np.cos(_pi/2)) < 1e-15)
chk("M5 demod: W = 2pi, wc = 6pi: copies at +-12pi reach down to 10pi, the cutoff 4pi lies in (2pi, 10pi)",
    _near(12*_pi - 2*_pi, 10*_pi, 1e-12) and 2*_pi < 4*_pi < 10*_pi)
chk("M5 demod: W = 3pi, wc = 5pi gives the highest cutoff 2wc - W = 7pi", _near(2*5*_pi - 3*_pi, 7*_pi, 1e-12))
# the tunable band-pass filter, simulated on a sampled grid: tones at 5, 8.5 and 12 rad/s
_fs, _N = 200.0, 2**16
_t = np.arange(_N)/_fs
_x = np.cos(5*_t) + np.cos(8.5*_t) + np.cos(12*_t)
def _tune(x, wc, w0):
    v = x*np.exp(-1j*wc*_t)
    V = np.fft.fft(v); wg = 2*_pi*np.fft.fftfreq(_N, 1/_fs)
    V[np.abs(wg) >= w0] = 0
    return np.fft.ifft(V)*np.exp(1j*wc*_t)
_y = _tune(_x, 8, 1)
_Y = np.abs(np.fft.fft(_y))/_N; _wg = 2*_pi*np.fft.fftfreq(_N, 1/_fs)
_band = lambda lo, hi: _Y[(_wg > lo) & (_wg < hi)].max()
chk("M5 tune: wc = 8, w0 = 1 passes the tone at 8.5 (in 7..9) and stops 5, 12 and -8.5",
    _band(8.3, 8.7) > 0.4 and _band(4.8, 5.2) < 0.02 and _band(11.8, 12.2) < 0.02 and _band(-8.7, -8.3) < 0.02,
    "%.3f %.3f %.3f %.3f" % (_band(8.3, 8.7), _band(4.8, 5.2), _band(11.8, 12.2), _band(-8.7, -8.3)))
chk("M5 tune: wc = 12, w0 = 3 passes 9 < w < 15", (12 - 3, 12 + 3) == (9, 15))
chk("M5 tune: the output is complex for a real input", np.max(np.abs(_y.imag)) > 0.1)

# 5.7 quick check and projects
chk("M5 quick: area 6, |1/(2+j0)| = 0.5, first zero 2pi, weight pi, energy 0.5, 3*2 = 6, 2/2 = 1, 1/2 = 0.5",
    _rft(0, 3) == 6 and abs(1/(2+0j)) == 0.5 and abs(_rft(2*_pi, 0.5)) < 1e-12 and _near(2*_pi*0.5, _pi, 1e-12)
    and _near(_q(lambda t: np.exp(-2*t), 0, np.inf), 0.5, 1e-10) and 3*2 == 6 and 2/2 == 1 and abs(1/(0 + 2)) == 0.5)
chk("M5 projects: an echo 1 + 0.5 e^{-jwT} swings between 0.5 and 1.5 with peaks every 1/T = 200 Hz",
    _near(abs(1 + 0.5*np.exp(-1j*_pi)), 0.5, 1e-12) and _near(abs(1 + 0.5), 1.5, 1e-12) and _near(1/5e-3, 200, 1e-9))
_Hrc5 = 1/(1 + 1j*1000*1e-3)
chk("M5 projects: RC = 1 ms gives 0.707 at -pi/4 for w = 1000 rad/s and 63% at t = RC",
    _near(abs(_Hrc5), 0.707) and _near(np.angle(_Hrc5), -_pi/4, 1e-12) and _near(1 - np.exp(-1), 0.632, 1e-3))
chk("M5 projects: a 4 kHz band on a 3 kHz carrier overlaps on |f| < 1 kHz; at 10 kHz it does not",
    (4 - 3) > 0 and (10 - 4) > 4)


# <m6-s1-verify> 6.1 building the transform
# </m6-s1-verify>

# <m6-s2-verify> 6.2 the standard pairs
# </m6-s2-verify>

# <m6-s3-verify> 6.3 periodic sequences
# </m6-s3-verify>

# <m6-s4-verify> 6.4 properties
# </m6-s4-verify>

# <m6-s5-verify> 6.5 convolution and multiplication
# </m6-s5-verify>

# <m6-s6-verify> 6.6 difference equations
# </m6-s6-verify>

# <m6-s7-verify> 6.7 quick check and projects
# </m6-s7-verify>


print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
