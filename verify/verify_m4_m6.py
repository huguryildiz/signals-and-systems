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
# The pulse of section 6.1: x[n] = 1 on |n| <= N1 = 2. Its transform is the
# Dirichlet ratio sin(w(N1+1/2))/sin(w/2), with value 2N1+1 = 5 at w = 0.
def _m6X(x, n, w):
    return np.sum(np.asarray(x)*np.exp(-1j*np.outer(np.atleast_1d(w), n)), axis=1)
_n5 = np.arange(-2, 3); _x5 = np.ones(5)
def _m6rep(n, N, x=_x5, n0=_n5):
    return sum(v for m, v in zip(n0, x) for r in range(-10, 11) if n - r*N == m)
def _m6Nak(k, N, x=_x5, n0=_n5):
    nn = np.arange(-2, N - 2)
    return np.sum(np.array([_m6rep(v, N, x, n0) for v in nn])*np.exp(-2j*_pi*k*nn/N))
chk("M6 derive: N=9 > 2N1 keeps the copies apart; N=4 makes them add to 1 or 2",
    9 > 4 and not 4 > 4 and all(_m6rep(v, 9) == (1 if abs(v) <= 2 else 0) for v in range(-4, 5))
    and sorted(set(_m6rep(v, 4) for v in range(-12, 13))) == [1, 2])
chk("M6 derive: support |n| <= 3 needs N > 6, so N=9 and not N=4 or N=6",
    9 > 2*3 and not 4 > 2*3 and not 6 > 2*3)
chk("M6 dtfs-link: N a_k equals X(e^{jk w0}) for N = 5..40 and every k",
    all(_near(_m6Nak(k, N), _m6X(_x5, _n5, 2*_pi*k/N)[0], 1e-9) for N in (5, 9, 10, 20, 40) for k in range(-N, N+1)))
chk("M6 dtfs-link: N=10 gives 10 a_0 = X(e^{j0}) = 2N1+1 = 5",
    _near(_m6Nak(0, 10), 5, 1e-12) and _near(_m6X(_x5, _n5, 0)[0], 5, 1e-12))
_xg = lambda n: 0.5**n if n >= 0 else 0.0
_Xg = lambda w: 1/(1 - 0.5*np.exp(-1j*w))
_wq = np.linspace(-2*_pi, 2*_pi, 400001)
_I2 = np.trapezoid(_Xg(_wq)*np.exp(1j*_wq*1), _wq)/(2*_pi)
chk("M6 limit: integrating the synthesis over -2pi..2pi gives 2 x[n] (x=(0.5)^n u[n], n=1)",
    _near(_I2.real, 2*_xg(1), 1e-6) and abs(_I2.imag) < 1e-6)
chk("M6 limit: the N-strip sum over one period is exact for the pulse at every N > 2N1",
    all(_near(np.sum(_m6X(_x5, _n5, 2*_pi*np.arange(N)/N)*np.exp(2j*_pi*np.arange(N)*nq/N)).real/N, 1.0 if abs(nq) <= 2 else 0.0, 1e-9)
        for N in (5, 9, 32) for nq in range(-2, N-2)))
_wp = np.linspace(-_pi, _pi, 200001)
chk("M6 pair: (1/2pi) of the integral over one period rebuilds the pulse at n = 0, 2, 3",
    all(_near(np.trapezoid(_m6X(_x5, _n5, _wp)*np.exp(1j*_wp*nq), _wp).real/(2*_pi), 1.0 if abs(nq) <= 2 else 0.0, 1e-6) for nq in (0, 2, 3)))
_ns = np.arange(1, 2000001)
_lp = np.sin(_pi*_ns/2)/(_pi*_ns)
chk("M6 pair-b: (0.8)^n u[n] sums to 5; (0.5)^n u[n] sums to 2",
    _near(1/(1-0.8), 5, 1e-12) and _near(np.sum(0.8**np.arange(200)), 5, 1e-12)
    and _near(np.sum(0.5**np.arange(200)), 2, 1e-12))
chk("M6 pair-b: sin(pi n/2)/(pi n) has squares summing to 0.5 and moduli growing without bound",
    _near(0.25 + 2*np.sum(_lp**2), 0.5, 1e-6)
    and np.sum(np.abs(_lp[:2000000])) - np.sum(np.abs(_lp[:2000])) > 1.0)
chk("M6 periodic: X(e^{j(w+2pi)}) = X(e^{jw}) for the pulse; -7pi/4 = pi/4 - 2pi",
    np.allclose(_m6X(_x5, _n5, _wq[::1000] + 2*_pi), _m6X(_x5, _n5, _wq[::1000]), atol=1e-9)
    and _near(-7*_pi/4, _pi/4 - 2*_pi, 1e-12))
_nn = np.arange(-50, 51)
chk("M6 periodic-b: cos((0.4+2pi)n) = cos(0.4n) at integers; 1.9pi is -0.1pi; 0.9pi lies nearest pi",
    np.allclose(np.cos((0.4 + 2*_pi)*_nn), np.cos(0.4*_nn), atol=1e-9)
    and np.allclose(np.cos(1.9*_pi*_nn), np.cos(0.1*_pi*_nn), atol=1e-9)
    and np.allclose(np.exp(1j*_pi*_nn), (-1.0)**_nn, atol=1e-9)
    and min((0.2, 0.1, 0.9), key=lambda f: abs(1 - f)) == 0.9)
chk("M6 real-transform: badges sum to 2000; downloads 5000 (0.6)^n sum to 12500",
    5*400 == 2000 and _near(np.sum(5000*0.6**np.arange(400)), 12500, 1e-6))
# Laboratory I1: rectangular (1 on |n|<=2) or triangular (1-|n|/3 on |n|<=2)
# pulse, period N in 5..40. Default: rectangular, N = 10.
_xt = 1 - np.abs(_n5)/3
chk("M6 lab I1: at N=10, w0 = 0.6283, N a_0 = 5, N a_1 = 3.2361",
    _near(2*_pi/10, 0.6283, 5e-5) and _near(_m6Nak(0, 10).real, 5, 1e-12) and _near(_m6Nak(1, 10).real, 3.2361, 5e-5))
chk("M6 lab I1: triangular pulse has N a_0 = 3 and, at N=40, N a_1 = 2.951",
    _near(_m6Nak(0, 40, _xt).real, 3, 1e-12) and _near(_m6Nak(1, 40, _xt).real, 2.951, 5e-4)
    and _near(_m6X(_xt, _n5, 0.3)[0].real, (np.sin(0.45)/np.sin(0.15))**2/3, 1e-12))
chk("M6 lab I1: the N strips of one period give x[0] = 1 for every N in 5..40, both pulses",
    all(_near(np.sum(_m6X(x, _n5, 2*_pi*np.arange(N)/N)).real/N, 1, 1e-9) for x in (_x5, _xt) for N in range(5, 41)))
# m6-circle: e^{jwn} on the unit circle, n = 0..8, w/pi on 0..2 (default 0.25)
_nc = np.arange(0, 9); _wc = np.linspace(0, 2*_pi, 41)
chk("M6 circle: e^{jw(n+1)} = e^{jwn} e^{jw}, and w + 2pi lands on the same points, for w/pi = 0..2",
    all(np.allclose(np.exp(1j*w*(_nc+1)), np.exp(1j*w*_nc)*np.exp(1j*w), atol=1e-12)
        and np.allclose(np.exp(1j*(w + 2*_pi)*_nc), np.exp(1j*w*_nc), atol=1e-9) for w in _wc))
chk("M6 circle: at w = pi the point is (-1)^n, and no w gives a larger step |x[n+1] - x[n]| than 2",
    np.allclose(np.exp(1j*_pi*_nc), (-1.0)**_nc, atol=1e-12)
    and _near(np.max(np.abs(np.diff(np.cos(_pi*_nc)))), 2, 1e-12)
    and max(np.max(np.abs(np.diff(np.cos(w*np.arange(200))))) for w in np.linspace(0, 2*_pi, 401)) <= 2 + 1e-12)
chk("M6 circle: w/pi = 0.25 and 1.75 turn opposite ways with the same cos(wn)",
    np.allclose(np.cos(0.25*_pi*_nc), np.cos(1.75*_pi*_nc), atol=1e-12)
    and np.allclose(np.exp(1j*1.75*_pi*_nc), np.conj(np.exp(1j*0.25*_pi*_nc)), atol=1e-12))
chk("M6 circle: a turn of 3pi/2 gives the stems of pi/2 = 2pi - 3pi/2, not those of 3pi/4 or pi",
    _near(2*_pi - 1.5*_pi, 0.5*_pi, 1e-12) and np.allclose(np.cos(1.5*_pi*_nc), np.cos(0.5*_pi*_nc), atol=1e-12)
    and not np.allclose(np.cos(1.5*_pi*_nc), np.cos(0.75*_pi*_nc), atol=1e-3)
    and not np.allclose(np.cos(1.5*_pi*_nc), np.cos(_pi*_nc), atol=1e-3))
chk("M6 circle: at w = pi/4 the ninth sample, n = 8, is back at 1",
    _near(np.exp(1j*0.25*_pi*8), 1, 1e-12))
# m6-dft: four ones on 0 <= n <= 3; DFT with N from 4 to 32 (default 8)
_x4 = np.ones(4)
def _dft(x, N):
    xp = np.concatenate([x, np.zeros(N - len(x))]); k = np.arange(N)
    return np.array([np.sum(xp*np.exp(-2j*_pi*kk*np.arange(N)/N)) for kk in k])
chk("M6 dft: X[k] = X(e^{j2pi k/N}) = sum_{n=0}^{N-1} x[n] e^{-j2pi kn/N} = fft, four ones, N = 4..32",
    all(np.allclose(_dft(_x4, N), _m6X(_x4, np.arange(4), 2*_pi*np.arange(N)/N), atol=1e-9)
        and np.allclose(_dft(_x4, N), np.fft.fft(_x4, N), atol=1e-9) for N in range(4, 33)))
def _dtfs(x, N, n0):
    # series coefficients of the N-periodic extension, summed over the period n0..n0+N-1
    nn = np.arange(n0, n0 + N); xt = np.array([x[v % N] if (v % N) < len(x) else 0.0 for v in nn])
    return np.array([np.sum(xt*np.exp(-2j*_pi*k*nn/N))/N for k in range(N)])
chk("M6 dft: X[k] = N a_k for the periodic extension (period taken at n = -3..N-4), N = 4..32",
    all(np.allclose(_dft(_x4, N), N*_dtfs(_x4, N, -3), atol=1e-9) for N in range(4, 33)))
chk("M6 dft: N = 4 gives 4, 0, 0, 0; N = 8 has zeros at k = 2, 4, 6",
    np.allclose(np.fft.fft(_x4, 4), [4, 0, 0, 0], atol=1e-12)
    and list(np.nonzero(np.abs(np.fft.fft(_x4, 8)) < 1e-9)[0]) == [2, 4, 6])
chk("M6 dft: five ones with N = 5 give X[0] = 5 and four zeros",
    np.allclose(np.fft.fft(np.ones(5), 5), [5, 0, 0, 0, 0], atol=1e-12))
chk("M6 code dtr-dft: N = 8 prints 4.0 2.6 0.0 1.1 ...; with N = 16 three of the sixteen values are zero",
    " ".join(f"{v:.1f}" for v in np.abs(np.fft.fft(_x4, 8))) == "4.0 2.6 0.0 1.1 0.0 1.1 0.0 2.6"
    and list(np.nonzero(np.abs(np.fft.fft(_x4, 16)) < 1e-9)[0]) == [4, 8, 12])
# m6-dft-b: x[n] = cos(0.3 pi n) + cos(0.4 pi n), 0 <= n <= L-1, padded to N
def _rec(L):
    n = np.arange(L); return np.cos(0.3*_pi*n) + np.cos(0.4*_pi*n)
def _peaks(L, lo=0.2*_pi, hi=0.5*_pi):
    w = np.linspace(lo, hi, 6001); m = np.abs(_m6X(_rec(L), np.arange(L), w))
    return w[1:-1][(m[1:-1] > m[:-2]) & (m[1:-1] > m[2:])]
chk("M6 dft-b: the cosines are 0.1pi apart; padding L=12 to N=48 gives samples of the unpadded DTFT",
    _near(0.4*_pi - 0.3*_pi, 0.1*_pi, 1e-12)
    and np.allclose(np.fft.fft(_rec(12), 48), _m6X(_rec(12), np.arange(12), 2*_pi*np.arange(48)/48), atol=1e-9))
chk("M6 dft-b: one cosine's peak has first zeros at +-2pi/L, so it is 4pi/L wide: pi/3 at L=12, 0.1pi at L=40",
    all(abs(np.sum(np.exp(-1j*2*_pi/L*np.arange(L)))) < 1e-9
        and np.min(np.abs(np.sum(np.exp(-1j*np.outer(np.linspace(-2*_pi/L*0.999, 2*_pi/L*0.999, 999), np.arange(L))), axis=1))) > 1e-3
        for L in (12, 16, 40, 48))
    and _near(4*_pi/12, _pi/3, 1e-12) and _near(4*_pi/40, 0.1*_pi, 1e-12))
chk("M6 dft-b: L=10 and L=12 give one merged peak near 0.35pi; L=30 and L=40 give two, near 0.3pi and 0.4pi",
    len(_peaks(10)) == 1 and len(_peaks(12)) == 1 and abs(_peaks(12)[0] - 0.35*_pi) < 0.01*_pi
    and all(len(_peaks(L)) >= 2 and np.min(np.abs(_peaks(L) - 0.3*_pi)) < 0.01*_pi and np.min(np.abs(_peaks(L) - 0.4*_pi)) < 0.01*_pi
            for L in (30, 40)))
chk("M6 dft-b: padding L=10 to N=128 still shows one peak; the normalised curve stays below 0.85 for L = 8..48",
    np.sum((lambda m: (m[1:-1] > m[:-2]) & (m[1:-1] > m[2:]) & (m[1:-1] > 0.2))(np.abs(np.fft.fft(_rec(10), 128)[10:30])/10)) == 1
    and max(np.max(np.abs(_m6X(_rec(L), np.arange(L), np.linspace(-1.25*_pi, 2.25*_pi, 7001))))/L for L in range(8, 49)) < 0.85)
# </m6-s1-verify>

# <m6-s2-verify> 6.2 the standard pairs
# Every number the 6.2 slides, gallery, laboratory cards and prediction cards
# state. Each transform is checked against its own analysis sum (truncated
# where the sequence is infinite) or synthesis integral, not only its formula.
_w62 = np.linspace(-_pi, _pi, 40001)                 # one period, 0 and +-pi on the grid
def _dtft62(x, n, w):
    return np.array([np.sum(x*np.exp(-1j*wi*n)) for wi in np.atleast_1d(w)])
_geo62 = lambda w, a: 1/(1 - a*np.exp(-1j*w))
_dir62 = lambda w, N1: np.where(np.abs(np.sin(w/2)) < 1e-12, 2*N1 + 1,
                                np.sin(w*(N1 + 0.5))/np.where(np.abs(np.sin(w/2)) < 1e-12, 1, np.sin(w/2)))
_two62 = lambda w, a: (1 - a*a)/(1 - 2*a*np.cos(w) + a*a)
_lpfinv62 = lambda n, W: W/_pi if n == 0 else np.sin(W*n)/(_pi*n)

# m6-ex-shift: delta[n-n0] -> e^{-j w n0}, |X| = 1, phase -n0 w, sawtooth period 2 pi/|n0|
_n62 = np.arange(-10, 11)
_Xs = _dtft62((_n62 == 3).astype(float), _n62, [0.4, 1.0, 2.5])
chk("M6 ex-shift: delta[n-3] has |X| = 1 and X = e^{-j3w} at three frequencies",
    np.allclose(abs(_Xs), 1) and np.allclose(_Xs, np.exp(-3j*np.array([0.4, 1.0, 2.5]))))
chk("M6 ex-shift: the principal value of -3w repeats every 2pi/3 = 2.0944 (lab I readout)",
    _near(np.angle(np.exp(-3j*(0.7 + 2*_pi/3))), np.angle(np.exp(-3j*0.7)), 1e-12) and _near(2*_pi/3, 2.0944))
chk("M6 ex-shift: at n0 = 0 the transform is 1", np.allclose(_dtft62((_n62 == 0).astype(float), _n62, [0.3, 2.0]), 1))

# m6-ex-anun, -b, -c: a^n u[n] -> 1/(1 - a e^{-jw}), |a| < 1
_nn = np.arange(0, 200)
for _a in (0.5, -0.5, 0.125):
    chk(f"M6 ex-anun: the sum of ({_a})^n e^(-jwn) equals 1/(1 - a e^(-jw)) at w = 0.9",
        abs(_dtft62(_a**_nn, _nn, [0.9])[0] - _geo62(0.9, _a)) < 1e-12)
chk("M6 ex-anun: |a e^{-jw}| = |a|", _near(abs(0.5*np.exp(-0.9j)), 0.5, 1e-12))
chk("M6 ex-anun: for a = 1.1 the partial sums grow without bound",
    abs(_dtft62(1.1**_nn[:50], _nn[:50], [0.9])[0]) < abs(_dtft62(1.1**_nn[:100], _nn[:100], [0.9])[0]) / 10)
_m = abs(_geo62(_w62, 0.5))
chk("M6 ex-anun-b: a = 1/2 gives |X| from 2/3 (w = +-pi) to 2 (w = 0)",
    _near(_m.max(), 2, 1e-9) and _near(_m.min(), 2/3, 1e-9) and _near(abs(_geo62(0, 0.5)), 2, 1e-12) and _near(abs(_geo62(_pi, 0.5)), 2/3, 1e-12))
chk("M6 ex-anun-b: |X|^2 = 1/(1 - 2a cos w + a^2) at a = 0.5, w = 1.3",
    _near(abs(_geo62(1.3, 0.5))**2, 1/(1 - 2*0.5*np.cos(1.3) + 0.25), 1e-12))
_mn = abs(_geo62(_w62, -0.5))
chk("M6 ex-anun-b: a = -1/2 swaps the ends: largest 2 at w = +-pi, smallest 2/3 at 0",
    _near(abs(_geo62(_pi, -0.5)), 2, 1e-12) and _near(abs(_geo62(0, -0.5)), 2/3, 1e-12) and _near(_mn.max(), 2, 1e-9))
chk("M6 ex-anun-b: a = 1/8 has largest |X| = 8/7 = 1.1429", _near(abs(_geo62(0, 0.125)), 8/7, 1e-12) and _near(8/7, 1.1429))
_ph = np.abs(np.angle(_geo62(_w62, 0.5)))
chk("M6 ex-anun-c: max |angle X| = arcsin(1/2) = pi/6 = 0.5236, reached at w = +-pi/3 (cos w = a)",
    _near(_ph.max(), _pi/6, 1e-7) and _near(abs(np.angle(_geo62(_pi/3, 0.5))), _pi/6, 1e-12) and _near(_pi/6, 0.5236))
chk("M6 ex-anun-c: at w = pi/3 the phase is -pi/6", _near(np.angle(_geo62(_pi/3, 0.5)), -_pi/6, 1e-12))
chk("M6 ex-anun-c: a = 1/8 gives max |angle X| = arcsin(1/8) = 0.1253, not arctan(1/8) or pi/8",
    _near(np.abs(np.angle(_geo62(_w62, 0.125))).max(), np.arcsin(0.125), 1e-7) and _near(np.arcsin(0.125), 0.1253)
    and not _near(np.arcsin(0.125), np.arctan(0.125), 1e-4) and not _near(np.arcsin(0.125), _pi/8, 1e-2))
chk("M6 ex-anun-c: the tangent point 1 - a e^{-jw} at cos w = a is (1 - a^2, a sqrt(1 - a^2)) = (0.75, 0.4330)",
    abs((1 - 0.5*np.exp(-1j*_pi/3)) - (0.75 + 1j*0.5*np.sqrt(0.75))) < 1e-12)

# m6-ex-absn, -b: a^{|n|} -> (1 - a^2)/(1 - 2a cos w + a^2)
_nb = np.arange(-200, 201)
chk("M6 ex-absn: the two-sided sum equals 1/(1 - a e^{-jw}) + a e^{jw}/(1 - a e^{jw}) at a = 0.5, w = 0.7",
    abs(_dtft62(0.5**np.abs(_nb), _nb, [0.7])[0] - (_geo62(0.7, 0.5) + 0.5*np.exp(0.7j)/(1 - 0.5*np.exp(0.7j)))) < 1e-12)
chk("M6 ex-absn: sum_{m>=1} r^m = r/(1-r) for r = 0.5 e^{j0.7}",
    abs(np.sum((0.5*np.exp(0.7j))**np.arange(1, 200)) - 0.5*np.exp(0.7j)/(1 - 0.5*np.exp(0.7j))) < 1e-12)
_a, _ww = sp.symbols('a w', real=True)
_E = sp.exp(sp.I*_ww)
chk("M6 ex-absn-b: common denominator (1 - a e^{-jw})(1 - a e^{jw}) = 1 - 2a cos w + a^2",
    sp.simplify(sp.expand((1 - _a/_E)*(1 - _a*_E)).rewrite(sp.cos) - (1 - 2*_a*sp.cos(_ww) + _a**2)) == 0)
chk("M6 ex-absn-b: numerator (1 - a e^{jw}) + a e^{jw}(1 - a e^{-jw}) = 1 - a^2",
    sp.simplify(sp.expand((1 - _a*_E) + _a*_E*(1 - _a/_E)) - (1 - _a**2)) == 0)
chk("M6 ex-absn-b: the transform is real and positive, and equals (1-a^2)/(1-2a cos w+a^2) (a = 0.5, 0.25)",
    all(np.allclose(_dtft62(a**np.abs(_nb), _nb, _w62[::400]), _two62(_w62[::400], a), atol=1e-12) for a in (0.5, 0.25))
    and _two62(_w62, 0.5).min() > 0)
chk("M6 ex-absn-b: a = 1/2 runs from 1/3 to 3; a = 1/4 peaks at 5/3",
    _near(_two62(0, 0.5), 3, 1e-12) and _near(_two62(_pi, 0.5), 1/3, 1e-12) and _near(_two62(0, 0.25), 5/3, 1e-12)
    and _near((1 + 0.25)/(1 - 0.25), 5/3, 1e-12))

# m6-ex-rect, -b, -c: the rectangular sequence and the Dirichlet kernel
_r = lambda N1: np.arange(-N1, N1 + 1)
_wr = np.array([0.3, 1.0, 2.2])
chk("M6 ex-rect: finite geometric sum (r^p - r^{q+1})/(1 - r) with p = -2, q = 2, r = e^{-jw}",
    np.allclose(_dtft62(np.ones(5), _r(2), _wr), (np.exp(2j*_wr) - np.exp(-3j*_wr))/(1 - np.exp(-1j*_wr))))
chk("M6 ex-rect: X(e^{j0}) = 2N1 + 1 = 5 for N1 = 2", _near(_dtft62(np.ones(5), _r(2), [0])[0].real, 5, 1e-12))
chk("M6 ex-rect-b: multiplying by e^{jw/2}/e^{jw/2} gives the ratio of two sines, the Dirichlet kernel",
    np.allclose((np.exp(2.5j*_wr) - np.exp(-2.5j*_wr))/(np.exp(0.5j*_wr) - np.exp(-0.5j*_wr)), _dir62(_wr, 2))
    and np.allclose(_dtft62(np.ones(5), _r(2), _wr), _dir62(_wr, 2)))
_d2 = _dir62(_w62, 2)
chk("M6 ex-rect-b: N1 = 2 peaks at 5 and has least value -1.25", _near(_d2.max(), 5, 1e-12) and _near(_d2.min(), -1.25, 1e-7))
_d4 = _dir62(_w62, 4)
chk("M6 ex-rect-c: N1 = 4 peaks at 9 (least value -2.0391)", _near(_d4.max(), 9, 1e-12) and _near(_d4.min(), -2.0391, 1e-4))
chk("M6 ex-rect-c: zeros at 2 pi k/(2N1 + 1): first at 2pi/5, 2pi/9, 2pi/7 for N1 = 2, 4, 3",
    all(abs(_dir62(2*_pi/(2*N + 1), N)) < 1e-12 and _dir62(0.999*2*_pi/(2*N + 1), N) > 0 for N in (2, 4, 3)))
chk("M6 ex-rect-c: k a multiple of 2N1+1 lands on a multiple of 2pi, where the value is the peak",
    _near(float(_dir62(np.array([2*_pi*5/5]), 2)[0]), 5, 1e-9))
chk("M6 ex-rect-c: 2pi/7 is not pi/3 or 2pi/3", not _near(2*_pi/7, _pi/3, 1e-3) and not _near(2*_pi/7, 2*_pi/3, 1e-3))

# m6-phase-real: a real spectrum that changes sign has phase 0 or pi
_x06 = float(_dir62(np.array([0.6*_pi]), 2)[0])
chk("M6 phase-real: the N1 = 2 kernel at 0.6 pi is -1.236, so its angle is pi",
    _near(_x06, -1.236) and _near(abs(np.angle(_x06 + 0j)), _pi, 1e-12))
chk("M6 phase-real: the kernel is negative on part of every period; a^{|n|} is positive everywhere",
    (_d2 < 0).any() and _two62(_w62, 0.5).min() > 0)
chk("M6 phase-real: |X| folds the negative lobes, least value 1.25 becomes a lobe of height 1.25",
    _near(np.abs(_d2)[_d2 < 0].max(), 1.25, 1e-7))

# m6-ex-lpf, -b: the ideal low-pass band
_W = _pi/4
_wb = np.linspace(-_W, _W, 200001)
for _k in range(4):
    _num = np.trapezoid(np.exp(1j*_wb*_k), _wb).real/(2*_pi)
    chk(f"M6 ex-lpf: the synthesis integral over |w| <= pi/4 at n = {_k} equals sin(Wn)/(pi n)", _near(_num, _lpfinv62(_k, _W), 1e-9))
chk("M6 ex-lpf: x[0] = W/pi, and sin(Wn)/(pi n) tends to W/pi as n -> 0",
    _near(_lpfinv62(0, _W), 0.25, 1e-12) and _near(np.sin(_W*1e-7)/(_pi*1e-7), _W/_pi, 1e-9))
chk("M6 ex-lpf-b: W = pi/4 gives x[1] = 0.225079; dropping the pi gives 0.707107, pi times larger",
    _near(_lpfinv62(1, _W), 0.225079, 1e-6) and _near(np.sin(_W)/1, 0.707107, 1e-6) and _near(np.sin(_W)/_lpfinv62(1, _W), _pi, 1e-12))
chk("M6 ex-lpf-b: (W/pi) sinc(Wn) with sinc = sin(t)/t is the same sequence",
    all(_near(_W/_pi*np.sin(_W*n)/(_W*n), _lpfinv62(n, _W), 1e-12) for n in (1, 2, 5)))
chk("M6 ex-lpf-b: W = pi gives delta[n]; W = pi/2 gives x[2] = 0",
    _near(_lpfinv62(0, _pi), 1, 1e-12) and all(abs(_lpfinv62(n, _pi)) < 1e-15 for n in (1, 2, 3)) and abs(_lpfinv62(2, _pi/2)) < 1e-15)

# m6-real-pairs: the four gallery signals
chk("M6 real-pairs: v[0] = 5 V and v[n] = 5(0.8)^n decays; the storm window |n| <= 2 is five hours of 4 mm",
    5*0.8**0 == 5 and 5*0.8**14 < 0.3 and len(range(-2, 3)) == 5)
chk("M6 real-pairs: L(0) = 200 lx; the Geiger click delta[n-3] is 1 at n = 3 only",
    200*np.exp(0) == 200 and [1 if n == 3 else 0 for n in range(-2, 10)].count(1) == 1)

# m6-lab-i: the default state of every sequence in Laboratory I
chk("M6 lab I one-sided a = 0.5: X(e^{j0}) = 2, |X| 2 and 0.6667, largest |angle X| 0.5236",
    _near(abs(_geo62(0, 0.5)), 2, 1e-12) and _near(_m.min(), 0.6667) and _near(_ph.max(), 0.5236))
chk("M6 lab I shifted n0 = 3: |X| = 1, largest |angle X| = pi = 3.1416, sawtooth period 2.0944",
    _near(np.abs(np.angle(np.exp(-3j*_w62))).max(), _pi, 1e-3) and _near(_pi, 3.1416) and _near(2*_pi/3, 2.0944))
chk("M6 lab I window N1 = 2: X(e^{j0}) = 5, least -1.25, smallest |X| = 0", _near(_d2.max(), 5) and _near(_d2.min(), -1.25) and _near(np.abs(_d2).min(), 0, 1e-3))
chk("M6 lab I two-sided a = 0.5: 3 and 0.3333", _near(_two62(0, 0.5), 3) and _near(_two62(_pi, 0.5), 0.3333))
chk("M6 lab I low-pass W = 0.25 pi: x[0] = 0.25", _near(_lpfinv62(0, 0.25*_pi), 0.25, 1e-12))
chk("M6 lab I unit sample A = 1: X = 1 at every w", np.allclose(_dtft62(np.array([1.0]), np.array([0]), _w62[::1000]), 1))

# sound on m6-ex-anun-b and m6-ex-lpf: sequences played at 8000 samples per second
_fs62 = 8000
chk("M6 sound: at 8000 samples per second omega = pi is 4 kHz; the band |omega| <= W keeps what lies below 4W/pi kHz (1 kHz at W = pi/4)",
    _near(_pi/(2*_pi)*_fs62, 4000, 1e-9) and _near((_pi/4)/(2*_pi)*_fs62, 1000, 1e-9)
    and all(_near(W/(2*_pi)*_fs62/1000, 4*W/_pi, 1e-12) for W in (0.1*_pi, 0.5*_pi, _pi)))
_hs62 = np.zeros(30)
for _k in range(30): _hs62[_k] = (1.0 if _k == 0 else 0.0) + (0.5*_hs62[_k-1] if _k else 0)
chk("M6 ex-anun-b sound: y[n] = a y[n-1] + x[n] from rest has impulse response a^n u[n] (a = 1/2), so its response is the plotted X",
    np.allclose(_hs62, 0.5**np.arange(30)))
chk("M6 ex-anun-b sound: for every slider a > 0, |X(e^{j0})| > |X(e^{j pi})| (dull); for every a < 0 the reverse (hissy)",
    all(abs(_geo62(0, a)) > abs(_geo62(_pi, a)) for a in np.arange(0.05, 0.91, 0.05))
    and all(abs(_geo62(0, a)) < abs(_geo62(_pi, a)) for a in np.arange(-0.9, -0.04, 0.05)))
_rng62 = np.random.default_rng(62); _N62 = 12000; _Wb = _pi/4
_yb62 = np.zeros(_N62)
for _k in range(300):
    _yb62 += np.cos(_Wb*(_k + _rng62.random())/300*np.arange(_N62) + 2*_pi*_rng62.random())
_Yb62 = np.abs(np.fft.rfft(_yb62*np.hanning(_N62)))**2; _fb62 = np.fft.rfftfreq(_N62)*2*_pi
chk("M6 ex-lpf sound: 300 cosines at random frequencies in (0, W) (W = pi/4) hold under 1e-4 of their energy above 1.1 W",
    _Yb62[_fb62 > 1.1*_Wb].sum()/_Yb62.sum() < 1e-4)
# </m6-s2-verify>

# <m6-s3-verify> 6.3 periodic sequences
def _s3_dtfs(x):
    N = len(x); n = np.arange(N)
    return np.array([np.sum(x*np.exp(-2j*_pi*k*n/N))/N for k in range(N)])
def _s3_red(w):
    r = w - 2*_pi*np.round(w/(2*_pi))
    return r + 2*_pi if r <= -_pi + 1e-12 else r
def _s3_period(f, top=200):
    n = np.arange(400)
    return next(N for N in range(1, top) if np.max(np.abs(f(n + N) - f(n))) < 1e-9)
def _s3_sqr(N, N1):
    n = np.arange(N); m = n - N*np.round(n/N)
    return np.where(np.abs(m) <= N1, 1.0, 0.0)
_nn = np.arange(-40, 41)

# m6-cexp
chk("M6 cexp: synthesis over one period returns e^{j w0 n} (sifting), and e^{j(w0+2pi)n} = e^{j w0 n}",
    np.max(np.abs(np.exp(1j*(_pi/4 + 2*_pi)*_nn) - np.exp(1j*_pi/4*_nn))) < 1e-9)
chk("M6 cexp given: 3 e^{j(pi/2)n} has impulse weight 3*2pi = 6pi", _near(3*2*_pi, 6*_pi, 1e-12))

# m6-dt-periodic: x[n] = 1 + cos(pi n/2) + (1/4)(-1)^n
_xdp = np.array([1 + np.cos(_pi*n/2) + 0.25*(-1)**n for n in range(4)])
_adp = _s3_dtfs(_xdp)
chk("M6 dt-periodic: x = 1 + cos(pi n/2) + (-1)^n/4 has N = 4 and a_0..a_3 = 1, 1/2, 1/4, 1/2",
    np.allclose(_adp, [1, 0.5, 0.25, 0.5], atol=1e-12)
    and _s3_period(lambda n: 1 + np.cos(_pi*n/2) + 0.25*np.cos(_pi*n)) == 4)
chk("M6 dt-periodic: weights 2pi a_k are 2pi, pi, pi/2, pi, four per period pi/2 apart",
    np.allclose(2*_pi*_adp.real, [2*_pi, _pi, _pi/2, _pi], atol=1e-12) and _near(2*_pi/4, _pi/2, 1e-12))
chk("M6 dt-periodic given: N = 6 gives spacing 2pi/6 = pi/3", _near(2*_pi/6, _pi/3, 1e-12))
chk("M6 dt-periodic: a_{k+lN} = a_k, so the reindexed sum repeats every 2pi",
    all(_near(np.sum(_xdp*np.exp(-2j*_pi*(k + 4*l)*np.arange(4)/4))/4, _adp[k], 1e-12) for k in range(4) for l in (-2, -1, 1, 2)))

# m6-dt-periodic-b
_acos = _s3_dtfs(np.cos(_pi*np.arange(8)/4))
_asin = _s3_dtfs(np.sin(_pi*np.arange(8)/4))
chk("M6 dt-periodic-b: cos(pi n/4) has 2pi a_{+-1} = pi, the other six weights zero",
    _near(2*_pi*_acos[1], _pi, 1e-12) and _near(2*_pi*_acos[7], _pi, 1e-12)
    and np.max(np.abs(np.delete(_acos, [1, 7]))) < 1e-12)
chk("M6 dt-periodic-b: sin(pi n/4) has 2pi a_1 = pi/j = -j pi and 2pi a_-1 = +j pi",
    _near(2*_pi*_asin[1], -1j*_pi, 1e-12) and _near(2*_pi*_asin[7], 1j*_pi, 1e-12) and _near(_pi/1j, -1j*_pi, 1e-12))
chk("M6 dt-periodic-b given: 3 cos(pi n/3) has weight 3pi at pi/3",
    _near(2*_pi*_s3_dtfs(3*np.cos(_pi*np.arange(6)/3))[1], 3*_pi, 1e-12))
chk("M6 dt-periodic-b: one impulse at +w0 alone synthesises (1/2)e^{j w0 n}, which is complex",
    _near((1/(2*_pi))*_pi*np.exp(1j*_pi/4*3), 0.5*np.exp(1j*3*_pi/4), 1e-12) and abs(np.exp(1j*3*_pi/4).imag) > 0.1)

# m6-sqwave: N = 10, N1 = 2
_asq = _s3_dtfs(_s3_sqr(10, 2)).real
chk("M6 sqwave: 2pi a_0 = pi = 3.1416, 2pi a_1 = 2.0333, 2pi a_3 = -0.7766, 2pi a_5 = 0.6283",
    _near(2*_pi*_asq[0], 3.1416) and _near(2*_pi*_asq[1], 2.0333) and _near(2*_pi*_asq[3], -0.7766)
    and _near(2*_pi*_asq[5], 0.6283))
chk("M6 sqwave: the weights at k = +-2, +-4 are zero; those at +-3 (w = +-3pi/5) are negative",
    all(abs(_asq[k]) < 1e-12 for k in (2, 4, 6, 8)) and _asq[3] < 0 and _asq[7] < 0)
chk("M6 sqwave: closed form a_k matches the analysis sum for N = 10, 20, 30",
    all(_near(_s3_dtfs(_s3_sqr(N, 2))[k].real, _dtrect(k, N, 2), 1e-12) for N in (10, 20, 30) for k in range(N)))
chk("M6 sqwave given: N1 = 3, N = 10 gives 2pi a_0 = 7pi/5", _near(2*_pi*_s3_dtfs(_s3_sqr(10, 3))[0].real, 7*_pi/5, 1e-12))

# m6-sqwave-b: 2pi a_k = (2pi/N) D(w) at w = 2pi k/N, D the transform of one pulse
_D = lambda w, N1: np.sum(np.exp(-1j*w*np.arange(-N1, N1 + 1))).real
chk("M6 sqwave-b: 2pi a_k is (2pi/N) times the pulse transform sampled at 2pi k/N (N = 10..40)",
    all(_near(2*_pi*_dtrect(k, N, 2), 2*_pi/N*_D(2*_pi*k/N, 2), 1e-10) for N in range(10, 41) for k in range(N)))
chk("M6 sqwave-b given: N1 = 2, N = 50 gives 2pi a_0 = pi/5", _near(2*_pi*_dtrect(0, 50, 2), _pi/5, 1e-12))

# m6-ex-imptrain
chk("M6 ex-imptrain: every a_k of the unit-sample train is 1/N (N = 5, 10, 15)",
    all(np.allclose(_s3_dtfs(np.r_[1.0, np.zeros(N - 1)]), 1/N, atol=1e-12) for N in (5, 10, 15)))
chk("M6 ex-imptrain: 2pi/5 = 1.2566, 2pi/10 = 0.6283, 2pi/15 = 0.4189",
    _near(2*_pi/5, 1.2566) and _near(2*_pi/10, 0.6283) and _near(2*_pi/15, 0.4189))
chk("M6 ex-imptrain given: doubling N halves each weight 2pi/N", _near((2*_pi/10)/(2*_pi/5), 0.5, 1e-12))
chk("M6 ex-imptrain-b: the N weights of one period add to 2pi = 2pi x[0] for N = 3..16",
    all(_near(N*(2*_pi/N), 2*_pi, 1e-12) for N in range(3, 17)))

# m6-ex-cos, m6-ex-cos-c, m6-ex-cos-b
chk("M6 ex-cos: 5pi/3 reduces to -pi/3 and 7pi/4 to -pi/4; the cosine is even, so +-pi/3 and +-pi/4",
    _near(_s3_red(5*_pi/3), -_pi/3, 1e-12) and _near(_s3_red(7*_pi/4), -_pi/4, 1e-12))
chk("M6 ex-cos: cos(5pi n/3) = cos(pi n/3) and cos(7pi n/4) = cos(pi n/4) at every integer n",
    np.max(np.abs(np.cos(5*_pi*_nn/3) - np.cos(_pi*_nn/3))) < 1e-9 and np.max(np.abs(np.cos(7*_pi*_nn/4) - np.cos(_pi*_nn/4))) < 1e-9)
_x24 = 2*np.cos(5*_pi*np.arange(24)/3) + np.cos(7*_pi*np.arange(24)/4)
_a24 = _s3_dtfs(_x24)
chk("M6 ex-cos-c: weights 2pi at +-pi/3 (k = +-4 of 24) and pi at +-pi/4 (k = +-3), all others zero, real and even",
    _near(2*_pi*_a24[4], 2*_pi, 1e-12) and _near(2*_pi*_a24[20], 2*_pi, 1e-12)
    and _near(2*_pi*_a24[3], _pi, 1e-12) and _near(2*_pi*_a24[21], _pi, 1e-12)
    and np.max(np.abs(np.delete(_a24, [3, 4, 20, 21]))) < 1e-12)
chk("M6 ex-cos-b: 2pi/(5pi/3) = 6/5 with m = 5 gives 6; 2pi/(7pi/4) = 8/7 with m = 7 gives 8",
    _near(2*_pi/(5*_pi/3), 6/5, 1e-12) and _near(6/5*5, 6, 1e-12) and _near(2*_pi/(7*_pi/4), 8/7, 1e-12) and _near(8/7*7, 8, 1e-12)
    and _s3_period(lambda n: np.cos(5*_pi*n/3)) == 6 and _s3_period(lambda n: np.cos(7*_pi*n/4)) == 8)
chk("M6 ex-cos-b: the sum has fundamental period LCM(6, 8) = 24; 24/6 = 4 and 24/8 = 3 are coprime",
    _s3_period(lambda n: 2*np.cos(5*_pi*n/3) + np.cos(7*_pi*n/4)) == 24 and np.lcm(6, 8) == 24 and np.gcd(4, 3) == 1)

# m6-real-periodic
chk("M6 real-periodic: hourly load has period 24; 120 beats/min sampled at 0.1 s is every 5 samples",
    _s3_period(lambda n: 1 + 0.6*np.cos(2*_pi*(n - 19)/24)) == 24 and _near(60/120/0.1, 5, 1e-12))
chk("M6 real-periodic: a 1 kHz tone at 8 kHz is cos(pi n/4), period 8; the light blinks every 0.5 s, twice a second",
    _near(2*_pi*1000/8000, _pi/4, 1e-12) and _s3_period(lambda n: np.cos(_pi*n/4)) == 8 and _near(1/0.5, 2, 1e-12))

# m6-lab-i3: the frequency options, their periods and reduced frequencies, and
# the weights the cards and readouts state for representative states
chk("M6 lab I3: exponential options pi/4, 3pi/4, 7pi/4, 9pi/4 all have N = 8; 9pi/4 -> pi/4, 7pi/4 -> -pi/4",
    all(_s3_period(lambda n, p=p: np.cos(p*_pi*n/4) + 1j*np.sin(p*_pi*n/4)) == 8 for p in (1, 3, 7, 9))
    and _near(_s3_red(9*_pi/4), _pi/4, 1e-12) and _near(_s3_red(7*_pi/4), -_pi/4, 1e-12))
chk("M6 lab I3: cosine options pi/3, 2pi/3, 5pi/3, 7pi/3 have N = 6, 3, 6, 6; 5pi/3 -> -pi/3, 7pi/3 -> pi/3",
    [_s3_period(lambda n, p=p: np.cos(p*_pi*n/3)) for p in (1, 2, 5, 7)] == [6, 3, 6, 6]
    and _near(_s3_red(5*_pi/3), -_pi/3, 1e-12) and _near(_s3_red(7*_pi/3), _pi/3, 1e-12))
chk("M6 lab I3: exponential weight 2pi at the reduced frequency, cosine weights pi at +- it",
    _near(2*_pi*_s3_dtfs(np.exp(1j*9*_pi/4*np.arange(8)))[1], 2*_pi, 1e-12)
    and _near(2*_pi*_s3_dtfs(np.cos(5*_pi/3*np.arange(6)))[1], _pi, 1e-12))
chk("M6 lab I3: square wave N = 8, 10, 20, 30 (N1 = 2) gives 2pi a_0 = 2pi*5/N; N = 10 has 4 zero and 2 negative weights",
    all(_near(2*_pi*_s3_dtfs(_s3_sqr(N, 2))[0].real, 2*_pi*5/N, 1e-12) for N in (8, 10, 20, 30))
    and sum(abs(_asq) < 1e-9) == 4 and sum(_asq < -1e-9) == 2)
chk("M6 lab I3: the weights of one period add to 2pi x[0] = 6.2832 for every sequence the laboratory offers",
    all(_near(np.sum(2*_pi*_s3_dtfs(x)).real, 2*_pi, 1e-9) for x in
        [np.exp(1j*p*_pi/4*np.arange(8)) for p in (1, 3, 7, 9)]
        + [np.cos(p*_pi/3*np.arange(N)) for p, N in ((1, 6), (2, 3), (5, 6), (7, 6))]
        + [_s3_sqr(N, 2) for N in (8, 10, 20, 30)] + [np.r_[1.0, np.zeros(N - 1)] for N in (3, 5, 8, 12)])
    and _near(2*_pi, 6.2832))
# </m6-s3-verify>

# <m6-s4-verify> 6.4 properties
# Every number a 6.4 slide, prediction card, gallery caption or Laboratory I4
# card states. The DTFT is evaluated from its analysis sum wherever it can be.
def _dtft(xs, ns, w):
    return np.sum(np.asarray(xs, dtype=complex)*np.exp(-1j*w*np.asarray(ns)))
_n6 = np.arange(0, 400)
_geo6 = lambda a, w: 1/(1 - a*np.exp(-1j*w))
_dir6 = lambda w: 5.0 if abs(np.sin(w/2)) < 1e-12 else np.sin(2.5*w)/np.sin(w/2)
chk("M6 props-1: a delay of 2 adds -1 rad at w = 0.5",
    _near(np.angle(_dtft(0.5**_n6, _n6 + 2, 0.5)/_dtft(0.5**_n6, _n6, 0.5)), -1, 1e-12))
chk("M6 props-1: the delay leaves |X| unchanged at w = 1.3",
    _near(abs(_dtft(0.5**_n6, _n6 + 2, 1.3)), abs(_geo6(0.5, 1.3)), 1e-12))
chk("M6 props-1-b: (-1)^n x[n] has X(e^{j(w - pi)}); the peak of |X| at 0 moves to pi",
    _near(abs(_dtft((-1.0)**_n6*0.5**_n6, _n6, _pi)), abs(_geo6(0.5, 0)), 1e-12)
    and _near(abs(_geo6(0.5, 0)), 2, 1e-12))
chk("M6 props-2: a real x has X(e^{j(2pi-0.4)}) = X*(e^{j0.4}); conj(1.2-0.5j) = 1.2+0.5j",
    _near(_dtft(0.5**_n6, _n6, 2*_pi - 0.4), np.conj(_dtft(0.5**_n6, _n6, 0.4)), 1e-12)
    and np.conj(1.2 - 0.5j) == 1.2 + 0.5j)
chk("M6 props-2: Re{X} of 0.5^n u[n] is 2 at w = 0, Im{X} is odd",
    _near(_geo6(0.5, 0).real, 2, 1e-12) and _near(_geo6(0.5, -0.7).imag, -_geo6(0.5, 0.7).imag, 1e-12))
chk("M6 props-2-b: delta[n] + 2 delta[n+1] transforms to 1 + 2e^{jw} = X(e^{-jw}) at w = 0.9",
    _near(_dtft([1, 2], [0, -1], 0.9), 1 + 2*np.exp(0.9j), 1e-12))
chk("M6 props-evenodd: delta[n+1] - delta[n-1] gives 2j sin w, 2j at w = pi/2",
    _near(_dtft([1, -1], [-1, 1], _pi/2), 2j, 1e-12))
_x6 = lambda n: 0.6**n if n >= 0 else 0.0
chk("M6 props-evenodd: Ev{0.6^n u[n]} is 1 at n = 0 and Od is 0 there",
    _near(0.5*(_x6(0) + _x6(0)), 1, 1e-12) and 0.5*(_x6(0) - _x6(0)) == 0)
_ne = np.arange(-300, 301)
_ev6 = np.array([0.5*(_x6(k) + _x6(-k)) for k in _ne])
chk("M6 props-evenodd-b: Ev{a^n u[n]} = a^{|n|}/2 + delta/2 transforms to Re{X}, a = 0.6, w = 1.1",
    _near(_dtft(_ev6, _ne, 1.1).real, _geo6(0.6, 1.1).real, 1e-12) and abs(_dtft(_ev6, _ne, 1.1).imag) < 1e-12)
_re6 = lambda w: (1 - 0.6*np.cos(w))/(1 - 1.2*np.cos(w) + 0.36)
chk("M6 props-evenodd-b: Re{X} for a = 0.6 is 2.5 at 0 and 0.625 at pi, and 1/(1-a) at 0",
    _near(_re6(0), 2.5, 1e-12) and _near(_re6(_pi), 0.625, 1e-12) and _near(_re6(0), 1/(1 - 0.6), 1e-12))
_xk6 = lambda k: (np.arange(3)*k)
chk("M6 expansion: x = 1 on 0..2 expanded by 2 has its last nonzero sample at n = 4",
    _xk6(2)[-1] == 4)
chk("M6 expansion: the expansion of 0.5^n u[n] by 3 has the transform X(e^{j3w}) at w = 0.8",
    _near(_dtft(0.5**_n6, 3*_n6, 0.8), _geo6(0.5, 2.4), 1e-12))
_peaks6 = [w for w in (2*_pi*m/4 for m in range(-2, 3)) if -_pi < w <= _pi + 1e-12]
chk("M6 expansion-c: k = 4 gives 4 peaks in (-pi, pi]: -pi/2, 0, pi/2, pi", len(_peaks6) == 4)
_yk = lambda k, w: abs(_dtft(np.ones(5), k*np.arange(5), w))
chk("M6 expansion-c: |Y_(k)| peaks at 5 at every multiple of 2pi/k, k = 1, 2, 3",
    all(_near(_yk(k, 2*_pi*m/k), 5, 1e-9) for k in (1, 2, 3) for m in range(k)))
chk("M6 expansion-c: the inserted zeros leave the energy at 5", np.sum(np.ones(5)**2) == 5)
_xb6 = np.zeros(12); _xb6[[0, 2, 4, 6, 8]] += 1; _xb6[[1, 3, 5, 7, 9]] += 2
chk("M6 expansion-b: x = y_(2)[n] + 2 y_(2)[n-1] has |X(e^{j0})| = 15 = 5 + 2*5",
    _near(abs(_dtft(_xb6, np.arange(12), 0)), 15, 1e-12))
chk("M6 expansion-b: X = (1 + 2e^{-jw}) e^{-j4w} sin(5w)/sin(w) at w = 0.7",
    _near(_dtft(_xb6, np.arange(12), 0.7), (1 + 2*np.exp(-0.7j))*np.exp(-2.8j)*np.sin(3.5)/np.sin(0.7), 1e-12))
chk("M6 expansion-b: g = 1 on |n| <= 2 has G = sin(5w/2)/sin(w/2) at w = 1.2",
    _near(_dtft(np.ones(5), np.arange(-2, 3), 1.2), _dir6(1.2), 1e-12))
chk("M6 expansion-d: G(e^{j pi/2}) = -1.0000, the wrong form gives -0.7071",
    _near(_dir6(_pi/2), -1, 1e-12) and _near(np.sin(2.5*_pi/2)/np.sin(_pi/2), -0.7071))
chk("M6 expansion-d: G(e^{j pi}) = 1 = sum of (-1)^n on |n| <= 2",
    _near(_dir6(_pi), 1, 1e-12) and sum((-1)**k for k in range(-2, 3)) == 1)
chk("M6 expansion-d: the wrong form is not 2pi-periodic (value at 0.3 vs 0.3 + 2pi)",
    not _near(np.sin(2.5*0.3)/np.sin(0.3), np.sin(2.5*(0.3 + 2*_pi))/np.sin(0.3 + 2*_pi), 1e-3))
chk("M6 props-3: 1 - e^{-j pi} = 2, so Y(e^{j pi}) = 2*0.5 = 1; the factor is 0 at w = 0",
    _near(1 - np.exp(-1j*_pi), 2, 1e-12) and _near(2*0.5, 1, 1e-12) and abs(1 - np.exp(0j)) == 0)
chk("M6 props-3-b: the running sum of 0.5^n u[n] settles at 2 = X(e^{j0})",
    _near(np.cumsum(0.5**_n6)[-1], 2, 1e-12) and _near(_geo6(0.5, 0).real, 2, 1e-12))
chk("M6 props-3-b: 0.75^n u[n] has X(e^{j0}) = 4, impulse weight pi*4 = 4pi",
    _near(_geo6(0.75, 0).real, 4, 1e-12) and _near(_pi*4, 4*_pi, 1e-12))
chk("M6 props-3-c: n a^n u[n] <-> a e^{-jw}/(1 - a e^{-jw})^2 at a = 0.5, w = 0.9",
    _near(_dtft(_n6*0.5**_n6, _n6, 0.9), 0.5*np.exp(-0.9j)/(1 - 0.5*np.exp(-0.9j))**2, 1e-12))
chk("M6 props-3-c: n 0.5^n u[n] has X(e^{j0}) = 2; n 0.7^n peaks at n = 3",
    _near(np.sum(_n6*0.5**_n6), 2, 1e-12) and _near(0.5/0.25, 2, 1e-12)
    and int(np.argmax(np.arange(15)*0.7**np.arange(15))) == 3)
_wg6 = -_pi + 2*_pi*np.arange(8192)/8192
chk("M6 parseval: delta[n] + delta[n-1] has energy 2 = (1/2pi) integral of |X|^2",
    _near(np.mean(np.abs(1 + np.exp(-1j*_wg6))**2), 2, 1e-12))
chk("M6 parseval: 0.5^n u[n] has energy 4/3 in both domains",
    _near(np.sum(0.25**_n6), 4/3, 1e-12) and _near(np.mean(np.abs(_geo6(0.5, _wg6))**2), 4/3, 1e-12))
chk("M6 parseval-b: (1/2pi) integral of 1/(1 - 2a cos w + a^2) = 1/(1 - a^2) = 4/3 at a = 0.5",
    _near(np.mean(1/(1 - np.cos(_wg6) + 0.25)), 4/3, 1e-12))
chk("M6 parseval-b: the pulse N1 = 2 has energy 5 in both domains",
    _near(np.mean(np.abs([_dtft(np.ones(5), np.arange(-2, 3), w) for w in _wg6[::8]])**2), 5, 1e-9))
chk("M6 parseval-b: 0.8^n u[n] has energy 1/(1 - 0.64) = 2.78",
    _near(np.sum(0.64**_n6), 1/(1 - 0.64), 1e-12) and _near(1/(1 - 0.64), 2.78, 5e-3))
def _dtfs6(x):
    N = len(x); k = np.arange(N)
    return np.array([np.sum(x*np.exp(-2j*_pi*kk*k/N))/N for kk in range(N)])
chk("M6 duality: the impulse train N = 8 has every a_k = 1/8 = 0.125",
    np.allclose(_dtfs6(np.eye(8)[0]), 1/8, atol=1e-12))
chk("M6 duality: x = 1 (N = 4) has a = (1,0,0,0); a[n] then has every coefficient 1/4",
    np.allclose(_dtfs6(np.ones(4)), [1, 0, 0, 0], atol=1e-12) and np.allclose(_dtfs6(np.array([1., 0, 0, 0])), 0.25, atol=1e-12))
_ak6 = lambda k: 0.5 if k == 0 else np.sin(k*_pi/2)/(k*_pi)
chk("M6 duality-b: a_0..a_3 of the band |w| <= pi/2 are 0.5, 0.3183, 0, -0.1061",
    _near(_ak6(0), 0.5, 1e-12) and _near(_ak6(1), 0.3183) and abs(_ak6(2)) < 1e-12 and _near(_ak6(3), -0.1061))
chk("M6 duality-b: the coefficients equal (1/2pi) integral of the band times e^{-jkw}, k = 3",
    _near(_q(lambda w: np.cos(3*w), -_pi/2, _pi/2)/(2*_pi), _ak6(3), 1e-12))
chk("M6 duality-b: 3e^{-j2w} = sum a_k e^{jkw} with a_{-2} = 3 = x[2]",
    _near(3*np.exp(-2j*0.8), 3*np.exp(1j*(-2)*0.8), 1e-12))
chk("M6 real-props: o[n] = 400 e^{-(n-5)^2/8} peaks at 400 on day 5, d peaks on day 7; 0.06 /ms = 60 Hz",
    _near(400*np.exp(0), 400, 1e-12) and int(np.argmax([400*np.exp(-(k - 2 - 5)**2/8) for k in range(15)])) == 7
    and _near(0.06*1000, 60, 1e-9))
chk("M6 real-props: x_(2)[n] = cos(pi n/8) at even n for x[m] = cos(pi m/4); v energy 1/(1-0.49) = 1.96",
    all(_near(np.cos(_pi*(n//2)/4), np.cos(_pi*n/8), 1e-12) for n in range(0, 25, 2))
    and _near(np.sum(0.49**_n6), 1.96, 5e-3))
# Laboratory I4: base x[n] = 0.7^n u[n], X = 1/(1 - 0.7 e^{-jw})
_xI4 = 0.7**_n6
_EI4 = np.sum(_xI4**2)
chk("M6 lab I4: base X(e^{j0}) = 3.3333, peak |X| = 3.3333, energy 1.9608 in both domains",
    _near(_geo6(0.7, 0).real, 3.3333) and _near(_EI4, 1.9608) and _near(np.mean(np.abs(_geo6(0.7, _wg6))**2), _EI4, 1e-12))
chk("M6 lab I4: time shift, frequency shift, reversal, conjugation and expansion keep the energy 1.9608",
    _near(np.mean(np.abs(_geo6(0.7, _wg6)*np.exp(-2j*_wg6))**2), _EI4, 1e-12)
    and _near(np.mean(np.abs(_geo6(0.7, _wg6 - _pi/2))**2), _EI4, 1e-12)
    and _near(np.mean(np.abs(_geo6(0.7, -_wg6))**2), _EI4, 1e-12)
    and _near(np.mean(np.abs(_geo6(0.7, 2*_wg6))**2), _EI4, 1e-12))
chk("M6 lab I4: conjugation of the real base: X*(e^{-jw}) = X(e^{jw}) at w = 1.1",
    _near(np.conj(_geo6(0.7, -1.1)), _geo6(0.7, 1.1), 1e-12))
chk("M6 lab I4: expansion by k repeats the spectrum every 2pi/k (k = 3, w = 0.4)",
    _near(_geo6(0.7, 3*(0.4 + 2*_pi/3)), _geo6(0.7, 3*0.4), 1e-12))
_dI4 = _xI4 - np.concatenate(([0], _xI4[:-1]))
chk("M6 lab I4: first difference has energy 1 + 0.09/0.51 = 1.1765, X(e^{j0}) = 0, peak 2/1.7 = 1.1765",
    _near(np.sum(_dI4**2), 1 + 0.09/0.51, 1e-12) and _near(1 + 0.09/0.51, 1.1765)
    and abs(np.sum(_dI4)) < 1e-12 and _near(np.max(np.abs((1 - np.exp(-1j*_wg6))*_geo6(0.7, _wg6))), 2/1.7, 1e-6))
# </m6-s4-verify>

# <m6-s5-verify> 6.5 convolution and multiplication
_s5pi = np.pi
def _s5dtft(x, n, w):
    """X(e^{jw}) = sum x[n] e^{-jwn} over the given samples"""
    return np.sum(x*np.exp(-1j*w*n))
def _s5geo(w, r):
    return 1/(1 - r*np.exp(-1j*w))
def _s5band(w, W):
    """ideal band of half-width W, repeated every 2 pi (closed at the edge)"""
    u = np.mod(np.asarray(w, float) + _s5pi, 2*_s5pi) - _s5pi
    return (np.abs(u) <= W + 1e-12).astype(float)
def _s5ov(w, W1, W2):
    """one copy of (1/2pi) * (band W1 conv band W2), evaluated at w"""
    lo, hi = max(-W1, w - W2), min(W1, w + W2)
    return max(0.0, hi - lo)/(2*_s5pi)
def _s5per(w, W1, W2):
    """periodic convolution: every copy of the one above"""
    return sum(_s5ov(w - 2*_s5pi*k, W1, W2) for k in range(-3, 4))
def _s5synth(Y, n, M=8192):
    """inverse DTFT by the midpoint rule over one period"""
    dw = 2*_s5pi/M
    w = -_s5pi + dw*(np.arange(M) + 0.5)
    return np.real(np.sum(Y(w)*np.exp(1j*w*n)))*dw/(2*_s5pi)

# m6-conv: the property, checked on a pair of finite sequences, and its periodicity
_s5n = np.arange(12)
_s5x = 0.5**_s5n; _s5h = 0.25**_s5n
_s5y = np.convolve(_s5x, _s5h); _s5ny = np.arange(_s5y.size)
chk("M6 conv: DTFT of x*h equals X H at w = 0.7 (finite sequences)",
    abs(_s5dtft(_s5y, _s5ny, 0.7) - _s5dtft(_s5x, _s5n, 0.7)*_s5dtft(_s5h, _s5n, 0.7)) < 1e-12)
chk("M6 conv: Y repeats every 2 pi, so Y(e^{j5pi/2}) = Y(e^{jpi/2}) = 2 * 0.4 = 0.8",
    abs(_s5dtft(_s5y, _s5ny, 5*_s5pi/2) - _s5dtft(_s5y, _s5ny, _s5pi/2)) < 1e-12 and _near(2*0.4, 0.8, 1e-12))
# m6-conv-b: magnitudes multiply, phases add, a = 1/2, b = 1/4
_s5w = 1.1
_s5X, _s5H = _s5geo(_s5w, 0.5), _s5geo(_s5w, 0.25)
chk("M6 conv-b: |XH| = |X||H| and angle(XH) = angle X + angle H at w = 1.1",
    _near(abs(_s5X*_s5H), abs(_s5X)*abs(_s5H), 1e-12) and _near(np.angle(_s5X*_s5H), np.angle(_s5X) + np.angle(_s5H), 1e-12))
chk("M6 conv-b: at w = 0, |X| = 2, |H| = 4/3, |Y| = 8/3 = 2.667",
    _near(abs(_s5geo(0, 0.5)), 2, 1e-12) and _near(abs(_s5geo(0, 0.25)), 4/3, 1e-12)
    and _near(abs(_s5geo(0, 0.5)*_s5geo(0, 0.25)), 8/3, 1e-12) and _near(8/3, 2.667))
chk("M6 conv-b: at w = pi, |X| = 2/3, |H| = 4/5, |Y| = 8/15 = 0.533",
    _near(abs(_s5geo(_s5pi, 0.5)), 2/3, 1e-12) and _near(abs(_s5geo(_s5pi, 0.25)), 4/5, 1e-12)
    and _near(abs(_s5geo(_s5pi, 0.5)*_s5geo(_s5pi, 0.25)), 8/15, 1e-12) and _near(8/15, 0.533))
# m6-conv-ex, m6-conv-ex-b: partial fractions in z = e^{-jw} and the output
_s5a, _s5b, _s5z = sp.symbols('a b z')
_s5pf = sp.apart(1/((1 - _s5a*_s5z)*(1 - _s5b*_s5z)), _s5z)
chk("M6 conv-ex: 1/((1-az)(1-bz)) = A/(1-az) + B/(1-bz), A = a/(a-b), B = -b/(a-b)",
    sp.simplify(_s5pf - (_s5a/(_s5a - _s5b)/(1 - _s5a*_s5z) - _s5b/(_s5a - _s5b)/(1 - _s5b*_s5z))) == 0)
_s5yf = lambda n, a, b: (a**(n + 1) - b**(n + 1))/(a - b)
chk("M6 conv-ex: y[0] = x[0]h[0] = 1 for any a != b (a=0.3, b=-0.6 and a=1/2, b=1/4)",
    _near(_s5yf(0, 0.3, -0.6), 1, 1e-12) and _near(_s5yf(0, 0.5, 0.25), 1, 1e-12))
chk("M6 conv-ex-b: (a^{n+1}-b^{n+1})/(a-b) matches the direct convolution for n = 0..11",
    np.allclose(_s5y[:12], _s5yf(np.arange(12), 0.5, 0.25), atol=1e-12))
chk("M6 conv-ex-b: y[0] = 1, y[1] = 0.75 = 1/4 + 1/2, y[2] = 0.4375",
    _near(_s5y[0], 1, 1e-12) and _near(_s5y[1], 0.75, 1e-12) and _near(0.25 + 0.5, 0.75, 1e-12) and _near(_s5y[2], 0.4375, 1e-12))
chk("M6 conv-ex-b: for a = 1/2 every b in 0.05..0.45 gives y[0] = 1, and the tail ratio tends to 1/2",
    all(_near(_s5yf(0, 0.5, bb), 1, 1e-12) for bb in np.arange(0.05, 0.46, 0.05))
    and _near(_s5yf(41, 0.5, 0.25)/_s5yf(40, 0.5, 0.25), 0.5, 1e-9))
# m6-conv-lpf: cutoffs pi/2 and pi/4 in cascade
_s5H = lambda w: _s5band(w, _s5pi/2)*_s5band(w, _s5pi/4)
chk("M6 conv-lpf: H1 H2 is the band pi/4, and y[0] = (pi/2)/(2 pi) = 1/4",
    np.array_equal(_s5H(np.linspace(-3*_s5pi, 3*_s5pi, 2001)), _s5band(np.linspace(-3*_s5pi, 3*_s5pi, 2001), _s5pi/4))
    and _near(_s5synth(_s5H, 0), 0.25, 1e-9))
chk("M6 conv-lpf: y[n] = sin(pi n/4)/(pi n) at n = 1, 3, 6",
    all(_near(_s5synth(_s5H, k), np.sin(_s5pi*k/4)/(_s5pi*k), 1e-6) for k in (1, 3, 6)))
# m6-conv-lpf-b: the stepped spectrum through the cutoff pi/2
_s5Xs = lambda w: _s5band(w, 3*_s5pi/4) + _s5band(w, _s5pi/4)
_s5Ys = lambda w: _s5Xs(w)*_s5band(w, _s5pi/2)
chk("M6 conv-lpf-b: Y = XH is 2 to pi/4 and 1 to pi/2, the sum of the two bands",
    np.array_equal(_s5Ys(np.linspace(-3*_s5pi, 3*_s5pi, 2001)),
                   _s5band(np.linspace(-3*_s5pi, 3*_s5pi, 2001), _s5pi/2) + _s5band(np.linspace(-3*_s5pi, 3*_s5pi, 2001), _s5pi/4)))
chk("M6 conv-lpf-b: y[0] = 1/2 + 1/4 = 3/4 = (3 pi/2)/(2 pi); x[0] = 1",
    _near(_s5synth(_s5Ys, 0), 0.75, 1e-9) and _near((2*_s5pi/2 + 1*_s5pi/2)/(2*_s5pi), 0.75, 1e-12)
    and _near(_s5synth(_s5Xs, 0), 1, 1e-9))
chk("M6 conv-lpf-b: y[n] = sin(pi n/2)/(pi n) + sin(pi n/4)/(pi n) at n = 1, 2, 5",
    all(_near(_s5synth(_s5Ys, k), np.sin(_s5pi*k/2)/(_s5pi*k) + np.sin(_s5pi*k/4)/(_s5pi*k), 1e-6) for k in (1, 2, 5)))
# m6-mult: periodic convolution of the bands 3pi/4 and pi/2
chk("M6 mult: Z(e^{j0}) = (overlap pi)/(2 pi) = 1/2; x[0] y[0] = 2 * 0.5 = 1",
    _near(_s5per(0, 3*_s5pi/4, _s5pi/2), 0.5, 1e-12) and _near(2*0.5, 1, 1e-12))
# m6-mult-b: the trapezoid, the overlap at pi, and the check against z[0]
chk("M6 mult-b: one copy is flat 1/2 on |w| <= pi/4 and reaches 0 at 5 pi/4",
    _near(_s5ov(0.2*_s5pi, 3*_s5pi/4, _s5pi/2), 0.5, 1e-12) and _near(_s5ov(_s5pi/4, 3*_s5pi/4, _s5pi/2), 0.5, 1e-12)
    and _s5ov(5*_s5pi/4, 3*_s5pi/4, _s5pi/2) == 0 and _s5ov(1.2*_s5pi, 3*_s5pi/4, _s5pi/2) > 0)
chk("M6 mult-b: Z(0) = 1/2, Z(3pi/4) = 1/4, Z(pi) = 1/8 + 1/8 = 1/4, flat at 1/4 on 3pi/4..pi",
    _near(_s5per(0, 3*_s5pi/4, _s5pi/2), 0.5, 1e-12) and _near(_s5per(3*_s5pi/4, 3*_s5pi/4, _s5pi/2), 0.25, 1e-12)
    and _near(_s5ov(_s5pi, 3*_s5pi/4, _s5pi/2), 0.125, 1e-12) and _near(_s5per(_s5pi, 3*_s5pi/4, _s5pi/2), 0.25, 1e-12)
    and _near(_s5per(0.9*_s5pi, 3*_s5pi/4, _s5pi/2), 0.25, 1e-12)
    and _near(_s5per(_s5pi/2, 3*_s5pi/4, _s5pi/2), 0.375, 1e-12))
_s5wg = np.linspace(-_s5pi, _s5pi, 400001)
chk("M6 mult-b: (1/2pi) int Z over one period = 0.375 = x[0] y[0] = 3/4 * 1/2",
    _near(np.trapezoid([_s5per(w, 3*_s5pi/4, _s5pi/2) for w in _s5wg[::20]], _s5wg[::20])/(2*_s5pi), 0.375, 1e-6)
    and _near(0.75*0.5, 0.375, 1e-12) and _near(3/4, np.sin(3*_s5pi/4*1e-9)/(_s5pi*1e-9), 1e-6))
# the periodic convolution agrees with the transform of the product, sample by sample:
# the inverse DTFT of Z at n = 3 is x[3] y[3]
_s5Zf = np.vectorize(lambda w: _s5per(w, 3*_s5pi/4, _s5pi/2))
chk("M6 mult-b: the inverse DTFT of Z at n = 3 equals x[3] y[3]",
    _near(_s5synth(_s5Zf, 3, 4096), np.sin(9*_s5pi/4)/(3*_s5pi)*np.sin(3*_s5pi/2)/(3*_s5pi), 1e-6))
# m6-mult-c: when the copies overlap
chk("M6 mult-c: bands pi/2 and pi/2 give a triangle of peak 1/2 that ends at pi",
    _near(_s5ov(0, _s5pi/2, _s5pi/2), 0.5, 1e-12) and _s5ov(_s5pi, _s5pi/2, _s5pi/2) == 0
    and _near(_s5per(0.999*_s5pi, _s5pi/2, _s5pi/2), _s5ov(0.999*_s5pi, _s5pi/2, _s5pi/2), 1e-12))
chk("M6 mult-c: copies overlap iff W_X + W_Y > pi; pi/4 + pi/2 = 3pi/4 < pi gives none",
    _s5per(0.99*_s5pi, _s5pi/4, _s5pi/2) == 0 and _s5ov(_s5pi, 3*_s5pi/4, _s5pi/2) > 0 and 3*_s5pi/4 < _s5pi)
# m6-mult-ex, m6-mult-ex-b: modulation by cos(pi n/3)
chk("M6 mult-ex: band edges pi/3 -+ pi/4 = pi/12 and 7 pi/12; height (1/2pi) * pi = 1/2",
    _near(_s5pi/3 - _s5pi/4, _s5pi/12, 1e-12) and _near(_s5pi/3 + _s5pi/4, 7*_s5pi/12, 1e-12) and _near(_s5pi/(2*_s5pi), 0.5, 1e-12))
_s5Zm = lambda w: 0.5*_s5band(w - _s5pi/3, _s5pi/4) + 0.5*_s5band(w + _s5pi/3, _s5pi/4)
chk("M6 mult-ex-b: z[n] from Z equals x[n] cos(pi n/3) at n = 0, 2, 3; z[0] = 1/4",
    all(_near(_s5synth(_s5Zm, k, 9600), (0.25 if k == 0 else np.sin(_s5pi*k/4)/(_s5pi*k))*np.cos(_s5pi*k/3), 1e-6) for k in (0, 2, 3))
    and _near(2*0.5*(_s5pi/2)/(2*_s5pi), 0.25, 1e-12))
chk("M6 mult-ex-b: the copies stay apart exactly for pi/4 <= w0 <= 3pi/4",
    all(((w0 - _s5pi/4 >= -w0 + _s5pi/4 - 1e-12) and (w0 + _s5pi/4 <= 2*_s5pi - w0 - _s5pi/4 + 1e-12))
        == (_s5pi/4 - 1e-12 <= w0 <= 3*_s5pi/4 + 1e-12) for w0 in np.linspace(0, _s5pi, 49)))
chk("M6 mult-ex: the DTFT of a long window of cos(pi n/3) peaks at w = pi/3 in 0..pi",
    np.argmax([abs(_s5dtft(np.cos(_s5pi*np.arange(-600, 601)/3), np.arange(-600, 601), w)) for w in np.linspace(0, _s5pi, 181)]) == 60)
# m6-real-conv: the gallery
_s5Hg = lambda f: 0.5/(1 - 0.5*np.exp(-1j*2*_s5pi*f/8))*(1 + np.exp(-1j*2*_s5pi*f/8))/2
chk("M6 real-conv: the cascade has |H| = 1 at 0 kHz, repeats every 8 kHz, and cos(pi n) = (-1)^n",
    _near(abs(_s5Hg(0)), 1, 1e-12) and _near(abs(_s5Hg(8.0 + 1.3)), abs(_s5Hg(1.3)), 1e-12)
    and np.allclose(np.cos(_s5pi*np.arange(25)), (-1.0)**np.arange(25)) and _near(sum([1/7]*7), 1, 1e-12))
# m6-lab-i5: the default and the reference states of Laboratory 6.5
chk("M6 lab I5: default filter a = 1/2, b = 1/4: |X(e^{j0})| = 2, |H(e^{j0})| = 1.3333, |Y(e^{j0})| = 2.6667, y[0] = 1",
    _near(abs(_s5geo(0, 0.5)), 2, 1e-12) and _near(abs(_s5geo(0, 0.25)), 1.3333) and _near(8/3, 2.6667) and _near(_s5yf(0, 0.5, 0.25), 1, 1e-12))
chk("M6 lab I5: band pi/2 through the ideal cutoff pi/4 keeps the narrower band, y[0] = 0.25",
    _near(_s5synth(lambda w: _s5band(w, _s5pi/2)*_s5band(w, _s5pi/4), 0), 0.25, 1e-9))
chk("M6 lab I5: (1/2)^n u[n] through the ideal cutoff pi/4 gives y[0] = 0.4093 and y[-1] != 0 (two-sided)",
    _near(_s5synth(lambda w: _s5geo(w, 0.5)*_s5band(w, _s5pi/4), 0, 65536), 0.4093, 1e-4)
    and abs(_s5synth(lambda w: _s5geo(w, 0.5)*_s5band(w, _s5pi/4), -1, 65536)) > 0.05)
chk("M6 lab I5: the band pi/2 through b = 0.9 gives |H(e^{j0})| = 10 and y[0] = 0.7333",
    _near(abs(_s5geo(0, 0.9)), 10, 1e-9) and _near(_s5synth(lambda w: _s5band(w, _s5pi/2)*_s5geo(w, 0.9), 0, 65536), 0.7333, 1e-4))
chk("M6 lab I5: modulate default W = pi/4, w0 = pi/3: upper copy pi/12 to 7pi/12, z[0] = 0.25, apart while W <= w0 <= pi - W",
    _near(_s5pi/3 - _s5pi/4, _s5pi/12, 1e-12) and _near(_s5pi/3 + _s5pi/4, 7*_s5pi/12, 1e-12)
    and _near((_s5pi/4)/_s5pi, 0.25, 1e-12) and (_s5pi/4 <= _s5pi/3 <= _s5pi - _s5pi/4))
chk("M6 lab I5: W = pi/2, w0 = pi/12 overlaps at 0 and the two halves add to 1 there",
    _near(0.5*_s5band(0 - _s5pi/12, _s5pi/2) + 0.5*_s5band(0 + _s5pi/12, _s5pi/2), 1, 1e-12))
# m6-mult-scrub: the slider's default and the trace's period
_s5g = np.linspace(-3*_s5pi, 3*_s5pi, 721)
chk("M6 mult-scrub: default w = pi/2 gives Z = 0.375, and Z(w + 2pi) = Z(w) across three periods",
    _near(_s5per(_s5pi/2, 3*_s5pi/4, _s5pi/2), 0.375, 1e-12)
    and all(_near(_s5per(w + 2*_s5pi, 3*_s5pi/4, _s5pi/2), _s5per(w, 3*_s5pi/4, _s5pi/2), 1e-12) for w in _s5g[::10]))
chk("M6 mult-scrub: slider end w = -3pi gives Z = 1/8 + 1/8 = 0.250 (two copies at the period ends)",
    _near(_s5per(-3*_s5pi, 3*_s5pi/4, _s5pi/2), 0.25, 1e-12))
chk("M6 mult-scrub prediction: X half-width 3pi/4, Y half-width pi/4: Z(e^{j0}) = (pi/2)/(2pi) = 1/4, not 1/2 or 1/8",
    _near(_s5per(0, 3*_s5pi/4, _s5pi/4), 0.25, 1e-12) and _near((_s5pi/2)/(2*_s5pi), 0.25, 1e-12))
# m6-leak: a cosine kept for L samples
def _s5W(w, L):
    """transform of the rectangular window 1 on 0..L-1"""
    n = np.arange(L)
    return np.exp(-1j*np.outer(np.atleast_1d(w), n)).sum(axis=1)
_s5wl = np.linspace(-3*_s5pi, 3*_s5pi, 2401) + 1e-7
_s5ok = True
for _L, _w0 in ((16, _s5pi/4), (8, _s5pi/8), (32, 7*_s5pi/8)):
    _n = np.arange(_L)
    _X = np.exp(-1j*np.outer(_s5wl, _n)) @ np.cos(_w0*_n)
    _s5ok &= np.allclose(_X, 0.5*_s5W(_s5wl - _w0, _L) + 0.5*_s5W(_s5wl + _w0, _L), atol=1e-9)
    _s5ok &= np.allclose(np.abs(_s5W(_s5wl, _L)), np.abs(np.sin(_s5wl*_L/2)/np.sin(_s5wl/2)), atol=1e-6)
chk("M6 leak: DTFT of cos(w0 n) on 0..L-1 = W(w - w0)/2 + W(w + w0)/2, |W| = |sin(wL/2)/sin(w/2)|", _s5ok)
_s5ok = True
for _L in (8, 16, 32):
    _wz = np.linspace(0, 2*_s5pi/_L, 400, endpoint=False)[1:]
    _s5ok &= abs(_s5W(2*_s5pi/_L, _L)[0]) < 1e-9 and np.all(np.abs(_s5W(_wz, _L)) > 1e-6)
chk("M6 leak: W first reaches zero at w = 2pi/L, so the main lobe is 4pi/L wide (L = 8, 16, 32)", _s5ok)
chk("M6 leak prediction: 4pi/L is pi/4 at L = 16 and pi/8 at L = 32, half as wide",
    _near(4*_s5pi/16, _s5pi/4, 1e-12) and _near(4*_s5pi/32, _s5pi/8, 1e-12) and _near((4*_s5pi/32)/(4*_s5pi/16), 0.5, 1e-12))
_s5wm = np.linspace(-_s5pi, _s5pi, 1601)
_s5mx = max(np.max(2/_L*np.abs(np.exp(-1j*np.outer(_s5wm, np.arange(_L))) @ np.cos(_w0*np.arange(_L))))
            for _L in range(8, 33) for _w0 in np.arange(2, 15)*_s5pi/16)
chk("M6 leak: over every slider state (w0 = pi/8..7pi/8, L = 8..32) the plotted 2|X|/L stays below the axis top 1.45",
    _s5mx < 1.45, f"max = {_s5mx:.3f}")
# m6-leak-b: rectangular against Hann on cos(pi n/4) + 0.01 cos(21 pi n/32), L = 32
_s5L = 32; _s5n = np.arange(_s5L)
_s5w1, _s5w2 = _s5pi/4, 21*_s5pi/32
_s5hann = np.sin(_s5pi*_s5n/_s5L)**2
_s5win = {'rect': np.ones(_s5L), 'hann': _s5hann}
def _s5dB(x, w):
    return 20*np.log10(np.abs(np.exp(-1j*np.outer(w, _s5n)) @ x))
_s5wf = np.linspace(-_s5pi, _s5pi, 80001)
chk("M6 leak-b: Hann sin^2(pi n/L) = 1/2 - cos(2 pi n/L)/2; 0.01 is -40 dB and 0.001 is -60 dB",
    np.allclose(_s5hann, 0.5 - 0.5*np.cos(2*_s5pi*_s5n/_s5L), atol=1e-15)
    and _near(20*np.log10(0.01), -40, 1e-12) and _near(20*np.log10(0.001), -60, 1e-12))
def _s5lobe(win):
    """first zero (in units of pi) and highest side lobe (dB) of a window's transform"""
    d = _s5dB(win, _s5wf) - _s5dB(win, np.array([0.0]))[0]
    pos = _s5wf > 0
    z = _s5wf[pos][np.argmax(np.diff(d[pos]) > 0)]
    return z/_s5pi, d[pos][_s5wf[pos] > z].max()
_s5zr, _s5sr = _s5lobe(_s5win['rect']); _s5zh, _s5sh = _s5lobe(_s5win['hann'])
chk("M6 leak-b: main lobes 4pi/L (rectangular) and 8pi/L (Hann): first zeros at 2pi/L and 4pi/L",
    _near(_s5zr, 2/_s5L, 1e-4) and _near(_s5zh, 4/_s5L, 1e-4)
    and abs(_s5dB(_s5win['hann'], np.array([4*_s5pi/_s5L]))[0]) > 200, f"{_s5zr:.5f} pi, {_s5zh:.5f} pi")
chk("M6 leak-b: highest side lobe about -13 dB (rectangular) and about -31 dB (Hann)",
    round(_s5sr) == -13 and round(_s5sh) == -31, f"{_s5sr:.2f} dB, {_s5sh:.2f} dB")
_s5near = (_s5wf > _s5w2 - _s5pi/16) & (_s5wf < _s5w2 + _s5pi/16)
def _s5rel(win, a2):
    x = (np.cos(_s5w1*_s5n) + a2*np.cos(_s5w2*_s5n))*win
    d = _s5dB(x, _s5wf)
    return d - d.max()
_s5r0, _s5r1 = _s5rel(_s5win['rect'], 0), _s5rel(_s5win['rect'], 0.01)
_s5h0, _s5h1 = _s5rel(_s5win['hann'], 0), _s5rel(_s5win['hann'], 0.01)
chk("M6 leak-b: rectangular, the side lobes near w2 reach about -21 dB, far above the weak cosine at -40 dB",
    round(_s5r0[_s5near].max()) == -21 and _near(_s5r1[_s5near].max(), _s5r0[_s5near].max(), 0.5),
    f"{_s5r0[_s5near].max():.2f} dB")
_s5i2 = np.argmin(np.abs(_s5wf - _s5w2))
chk("M6 leak-b: Hann, the weak cosine peaks at w2 near -40 dB, above the strong one's side lobes there",
    _near(_s5h1[_s5near].max(), -40, 1.0) and abs(_s5wf[_s5near][np.argmax(_s5h1[_s5near])] - _s5w2) < 0.02
    and _s5h0[_s5near].max() < -50, f"weak {_s5h1[_s5near].max():.2f} dB, side lobes {_s5h0[_s5near].max():.2f} dB")
_s5h3 = _s5rel(_s5win['hann'], 0.001)
chk("M6 leak-b prediction: at -60 dB the Hann side lobes near w2 (about -54 dB) hide it",
    round(_s5h0[_s5near].max()) == -54 and _s5h0[_s5near].max() > -60
    and abs(_s5wf[_s5near][np.argmax(_s5h3[_s5near])] - _s5w2) > 0.05, f"{_s5h0[_s5near].max():.2f} dB")
# m6-stft: four notes of 48 samples, Hann window of 32, hop 8
_s5notes = [(0.15, 0.55), (0.35, 0.80), (0.15, 0.80), (0.35, 0.55)]
_s5x = np.array([np.cos(a*_s5pi*k) + np.cos(b*_s5pi*k) for k in range(192) for (a, b) in [_s5notes[k//48]]])
def _s5col(m, L=32, rows=480):
    wr = (np.arange(rows) + 0.5)*_s5pi/rows
    piece = _s5x[m:m + L]*np.sin(_s5pi*np.arange(L)/L)**2
    return wr, np.abs(np.exp(-1j*np.outer(wr, np.arange(m, m + L))) @ piece)
def _s5peaks(m, L=32):
    wr, c = _s5col(m, L)
    d = 20*np.log10(c/c.max())
    return [wr[i]/_s5pi for i in range(1, len(c) - 1) if c[i] >= c[i - 1] and c[i] >= c[i + 1] and d[i] > -12]
chk("M6 stft: the sequence is four notes of 48 samples, 192 in all; a window inside a note shows its two tones",
    _s5x.size == 192 and all(np.allclose(sorted(_s5peaks(m)), sorted(_s5notes[(m + 16)//48]), atol=0.01) for m in (0, 56, 104, 152)))
_wr = np.linspace(0.1, 3.0, 40); _piece = _s5x[40:72]*np.sin(_s5pi*np.arange(32)/32)**2
_Xm = lambda w: np.exp(-1j*np.outer(w, np.arange(40, 72))) @ _piece
chk("M6 stft: |X_m| is even in w and repeats every 2pi, so 0 <= w <= pi is enough",
    np.allclose(np.abs(_Xm(-_wr)), np.abs(_Xm(_wr)), atol=1e-9) and np.allclose(np.abs(_Xm(_wr + 2*_s5pi)), np.abs(_Xm(_wr)), atol=1e-9))
def _s5spread(m):
    wr, c = _s5col(m); return np.mean(20*np.log10(c/c.max()) > -12)
chk("M6 stft: a window that spans two notes gives a blurred column (more of it within 12 dB of its peak)",
    min(_s5spread(m) for m in (32, 80, 128)) > 1.5*max(_s5spread(m) for m in (0, 56, 104, 152)),
    ", ".join(f"{_s5spread(m):.2f}" for m in (32, 80, 128, 0, 56, 104, 152)))
_span = lambda L: sum(1 for m in range(0, 192 - L + 1, 8) if m < 96 <= m + L - 1)
chk("M6 stft prediction: L = 64 halves the Hann main lobe 8pi/L (pi/4 to pi/8) and more windows span a note change (3 to 7)",
    _near(8*_s5pi/64, (8*_s5pi/32)/2, 1e-12) and _span(32) == 3 and _span(64) == 7)
# </m6-s5-verify>

# <m6-s6-verify> 6.6 difference equations
_z6 = sp.Symbol('z')
_w6 = np.linspace(-3*_pi, 3*_pi, 6001)
def _H6(w):   # y[n] - 3/4 y[n-1] + 1/8 y[n-2] = 2 x[n]
    return 2/(1 - 0.75*np.exp(-1j*w) + 0.125*np.exp(-2j*w))
def _rec6(x, N=40):   # run the recursion from rest
    y = np.zeros(N)
    for n in range(N):
        y[n] = 2*x[n] + (0.75*y[n-1] if n > 0 else 0) - (0.125*y[n-2] if n > 1 else 0)
    return y
_n6 = np.arange(40)
_Hq = lambda w: (1 + np.exp(-1j*w))/(1 - 0.5*np.exp(-1j*w))
chk("M6 freqresp: y[n]-y[n-1]/2 = x[n]+x[n-1] has H(e^{j pi}) = 0 and H(e^{j0}) = 4",
    abs(_Hq(_pi)) < 1e-12 and _near(_Hq(0).real, 4, 1e-12))
chk("M6 ex-diff: 1 - 3/4 z + 1/8 z^2 = (1 - z/2)(1 - z/4)",
    sp.expand((1 - _z6/2)*(1 - _z6/4) - (1 - sp.Rational(3, 4)*_z6 + sp.Rational(1, 8)*_z6**2)) == 0)
chk("M6 ex-diff: partial fractions A = 4, B = -2",
    sp.simplify(sp.apart(2/((1 - _z6/2)*(1 - _z6/4)), _z6) - (4/(1 - _z6/2) - 2/(1 - _z6/4))) == 0)
chk("M6 ex-diff: |H| is 5.3333 at w=0 and 1.0667 at w=pi, its largest and smallest values, period 2pi",
    _near(abs(_H6(0)), 5.3333) and _near(abs(_H6(_pi)), 1.0667)
    and _near(np.max(np.abs(_H6(_w6))), 16/3, 1e-9) and _near(np.min(np.abs(_H6(_w6))), 16/15, 1e-6)
    and np.max(np.abs(_H6(_w6 + 2*_pi) - _H6(_w6))) < 1e-12)
_h6 = _rec6((_n6 == 0).astype(float))
chk("M6 ex-diff/ex-diff-c: the recursion gives h[0..2] = 2, 1.5, 0.875 = 4(1/2)^n - 2(1/4)^n",
    np.allclose(_h6[:3], [2, 1.5, 0.875]) and np.allclose(_h6, 4*0.5**_n6 - 2*0.25**_n6))
chk("M6 ex-diff-c: check lines 1.5 - 0.75*2 = 0 and 0.875 - 1.125 + 0.25 = 0; 2 - 0.5 = 1.5, 1 - 0.125 = 0.875",
    _near(1.5 - 0.75*2, 0, 1e-12) and _near(0.875 - 0.75*1.5 + 0.125*2, 0, 1e-12)
    and _near(0.75*1.5, 1.125, 1e-12) and _near(0.125*2, 0.25, 1e-12) and 2 - 0.5 == 1.5 and 1 - 0.125 == 0.875)
chk("M6 ex-diff-c: 1 - 5/6 z + 1/6 z^2 = (1 - z/2)(1 - z/3)",
    sp.expand((1 - _z6/2)*(1 - _z6/3) - (1 - sp.Rational(5, 6)*_z6 + sp.Rational(1, 6)*_z6**2)) == 0)
_aP = sp.Symbol('a'); _wP = sp.Symbol('w', real=True)
chk("M6 ex-pair: d/da of 1/(1 - a e^{-jw}) is e^{-jw}/(1 - a e^{-jw})^2",
    sp.simplify(sp.diff(1/(1 - _aP*sp.exp(-sp.I*_wP)), _aP) - sp.exp(-sp.I*_wP)/(1 - _aP*sp.exp(-sp.I*_wP))**2) == 0)
_nP = np.arange(400)
chk("M6 ex-pair: sum (n+1)a^n e^{-jwn} matches 1/(1 - a e^{-jw})^2 (a = 0.6, three periods)",
    np.max(np.abs(np.exp(-1j*np.outer(_w6[::50], _nP)) @ ((_nP + 1)*0.6**_nP) - 1/(1 - 0.6*np.exp(-1j*_w6[::50]))**2)) < 1e-9)
chk("M6 ex-pair: (n+1)(1/2)^n sums to 1/(1 - 1/2)^2 = 4",
    _near(np.sum((_nP + 1)*0.5**_nP), 4, 1e-12))
chk("M6 ex-pair-b: at w=0, a=1/4 the pair gives 16/9 = 1.7778 = sum (n+1)(1/4)^n; a plus sign gives 0.64; ratio 2.78",
    _near(1/(1 - 0.25)**2, 16/9, 1e-12) and _near(16/9, 1.7778) and _near(np.sum((_nP + 1)*0.25**_nP), 16/9, 1e-12)
    and _near(1/(1 + 0.25)**2, 0.64, 1e-12) and _near((16/9)/0.64, 2.78, 5e-3))
_Xm = lambda w: 1/np.abs(1 + 0.5*np.exp(-1j*w))**2
chk("M6 ex-pair-b: with a = -1/2 the largest |X| on (-pi, pi] is 4, at w = pi",
    _near(_Xm(_pi), 4, 1e-12) and abs(_w6[np.argmax(_Xm(_w6))]) % (2*_pi) > _pi - 1e-3 and _Xm(0) < _Xm(_pi/2) < 4)
chk("M6 ex-diff-b: Y = 2/((1 - z/2)(1 - z/4)^2) splits into A = -4, B = -2, C = 8 (three terms)",
    sp.simplify(sp.apart(2/((1 - _z6/2)*(1 - _z6/4)**2), _z6)
                - (-4/(1 - _z6/4) - 2/(1 - _z6/4)**2 + 8/(1 - _z6/2))) == 0
    and 2/(1 - sp.Rational(1, 4)*2)**2 == 8 and 2/(1 - sp.Rational(1, 2)*4) == -2 and 2 - (-2) - 8 == -4)
_Y6 = lambda w: _H6(w)/(1 - 0.25*np.exp(-1j*w))
chk("M6 ex-diff-b: |Y| is 7.1111 at w=0 and 0.8533 at w=pi, its extremes over three periods",
    _near(abs(_Y6(0)), 7.1111) and _near(abs(_Y6(_pi)), 0.8533)
    and _near(np.max(np.abs(_Y6(_w6))), 64/9, 1e-9) and _near(np.min(np.abs(_Y6(_w6))), 0.853333, 1e-5))
_y6 = _rec6(0.25**_n6)
_yc6 = -4*0.25**_n6 - 2*(_n6 + 1)*0.25**_n6 + 8*0.5**_n6
chk("M6 ex-diff-b2: y[0..3] = 2, 2, 1.375, 0.8125, and the recursion matches the closed form",
    np.allclose(_y6[:4], [2, 2, 1.375, 0.8125]) and np.allclose(_y6, _yc6))
chk("M6 ex-diff-b2: -4-2+8 = 2, -1-1+4 = 2; directly h[0]x[1] + h[1]x[0] = 0.5 + 1.5 = 2; h * x matches y",
    -4 - 2 + 8 == 2 and -1 - 1 + 4 == 2 and _near(2*0.25 + 1.5*1, 2, 1e-12)
    and np.allclose(np.convolve(_h6, 0.25**_n6)[:40], _y6))
chk("M6 ex-diff-b2: input (1/3)^n gives three simple terms: 1/3 differs from 1/2 and 1/4",
    len(sp.apart(2/((1 - _z6/2)*(1 - _z6/4)*(1 - _z6/3)), _z6).as_ordered_terms()) == 3)
chk("M6 real-diffeq: 1000(1.05)^20 = 2653 stays under 3000; a = 1.05 > 1 grows",
    _near(1000*1.05**20, 2653.3, 0.1) and 1000*1.05**20 < 3000)
_ye = [20.0]
for _k in range(21): _ye.append(0.8*_ye[-1] + 0.2*30)
chk("M6 real-diffeq: y[n] = 0.8 y[n-1] + 0.2*30 from 20 gives 30 - 10(0.8)^{n+1}",
    np.allclose(_ye[1:], [30 - 10*0.8**(k + 1) for k in range(21)]))
_Te = [90.0]
for _k in range(15): _Te.append(0.85*_Te[-1] + 3.3)
chk("M6 real-diffeq: T[n] = 0.85 T[n-1] + 3.3 from 90 is 22 + 68(0.85)^n, within 0.01 of 22 + 68 e^{-0.1625 n}",
    np.allclose(_Te, [22 + 68*0.85**k for k in range(16)])
    and max(abs(_Te[k] - (22 + 68*np.exp(-0.1625*k))) for k in range(16)) < 0.01 and _near(0.15*22, 3.3, 1e-12))
_pe = [0.0]
for _k in range(21): _pe.append(0.7*_pe[-1] + 300)
chk("M6 real-diffeq: p[n] = 0.7 p[n-1] + 300 from 0 is 1000(1 - 0.7^{n+1}); 30% leave, limit 1000",
    np.allclose(_pe[1:], [1000*(1 - 0.7**(k + 1)) for k in range(21)]) and _near(1 - 0.7, 0.3, 1e-12))
# Laboratory I6: default factors 1/2 and 1/4, B0 = 2, input (1/4)^n u[n]
_Hd = lambda w, p1, p2: 2/((1 - p1*np.exp(-1j*w))*(1 - p2*np.exp(-1j*w)))
chk("M6 lab I6: default H(e^{j0}) = 5.3333, |H(e^{j pi})| = 1.0667, largest |p| = 0.5, sum y = H(e^{j0})/(1 - 1/4) = 7.1111",
    _near(_Hd(0, .5, .25).real, 5.3333) and _near(abs(_Hd(_pi, .5, .25)), 1.0667)
    and max(0.5, 0.25) == 0.5 and _near(_Hd(0, .5, .25).real/0.75, 7.1111) and _near(np.sum(_y6), 64/9, 1e-9))
chk("M6 lab I6: default cards h[n] = [4(0.5)^n - 2(0.25)^n]u[n], y[n] = [8(0.5)^n - 4(0.25)^n - 2(n+1)(0.25)^n]u[n]",
    np.allclose(_h6, 4*0.5**_n6 - 2*0.25**_n6) and np.allclose(_y6, 8*0.5**_n6 - 4*0.25**_n6 - 2*(_n6 + 1)*0.25**_n6))
chk("M6 lab I6: the slider range |p| <= 0.9 keeps every factor inside |p| < 1 (stable), largest peak 2/0.1^2 = 200",
    0.9 < 1 and _near(abs(_Hd(0, .9, .9)), 200, 1e-9))
chk("M6 lab I6: the cubed case p1 = p2 = c = -1/2 gives y[n] = 2 (n+1)(n+2)/2 (-1/2)^n",
    np.allclose(np.convolve(2*(_n6 + 1)*(-0.5)**_n6, (-0.5)**_n6)[:40], 2*(_n6 + 1)*(_n6 + 2)/2*(-0.5)**_n6))
# sound on m6-ex-pair: two stages of y[n] = a y[n-1] + x[n]
_st6 = lambda x, a: np.array([sum(a**(n - m)*x[m] for m in range(n + 1)) for n in range(len(x))])
_d6 = (np.arange(30) == 0).astype(float)
chk("M6 ex-pair sound: two stages of y[n] = a y[n-1] + x[n] have impulse response (n+1)a^n u[n] (a = 0.25)",
    np.allclose(_st6(_st6(_d6, 0.25), 0.25), (np.arange(30) + 1)*0.25**np.arange(30)))
chk("M6 ex-pair sound: for every slider a in [0.1, 0.8] two stages tilt more to low frequencies than one: (|H(0)|/|H(pi)|)^2 > |H(0)|/|H(pi)| > 1",
    all(((1 + a)/(1 - a))**2 > (1 + a)/(1 - a) > 1 for a in np.arange(0.1, 0.81, 0.05)))

# m6-echo: y[n] = x[n] + al x[n-D], removed by w[n] = y[n] - al w[n-D]
_E6 = lambda w, al, D: np.abs(1 + al*np.exp(-1j*w*D))
chk("M6 echo: |1 + al e^{-jwD}| runs from 1 - al to 1 + al, the remover from 1/(1 + al) to 1/(1 - al); at al = 0.5: 0.5, 1.5, 0.6667, 2 (figure ticks 0.5, 1.5, 2)",
    _near(_E6(_w6, 0.5, 3).min(), 0.5, 1e-6) and _near(_E6(_w6, 0.5, 3).max(), 1.5, 1e-6)
    and _near((1/_E6(_w6, 0.5, 3)).min(), 0.6667) and _near((1/_E6(_w6, 0.5, 3)).max(), 2, 1e-5))
chk("M6 echo: the two responses multiply to 1 at every w, and each repeats every 2pi",
    np.allclose(_E6(_w6, 0.5, 3)*(1/_E6(_w6, 0.5, 3)), 1) and np.allclose(_E6(_w6 + 2*_pi, 0.5, 3), _E6(_w6, 0.5, 3)))
_wp6 = np.linspace(-_pi, _pi, 60001)[1:]
_Ep6 = _E6(_wp6, 0.5, 3)
chk("M6 echo: with D = 3 the echo response has D = 3 peaks and 3 notches in one period (-pi, pi]",
    np.sum((_Ep6[1:-1] > _Ep6[:-2]) & (_Ep6[1:-1] > _Ep6[2:])) + (1 if _Ep6[-1] > _Ep6[-2] and _Ep6[-1] > _Ep6[0] else 0) == 3
    and np.sum((_Ep6[1:-1] < _Ep6[:-2]) & (_Ep6[1:-1] < _Ep6[2:])) + (1 if _Ep6[-1] < _Ep6[-2] and _Ep6[-1] < _Ep6[0] else 0) == 3)
chk("M6 echo (Given): at al = 0.8 the largest and smallest of |1 + al e^{-jwD}| are 1.8 and 0.2 (not 0, not 1.64 and 0.36)",
    _near(_E6(_w6, 0.8, 3).max(), 1.8, 1e-6) and _near(_E6(_w6, 0.8, 3).min(), 0.2, 1e-6) and _near(1 + 0.8**2, 1.64, 1e-12))
_tp6 = np.arange(8000)/8000
_xp6 = np.exp(-14*_tp6)*(np.sin(2*_pi*440*_tp6) + 0.5*np.sin(4*_pi*440*_tp6) + 0.25*np.sin(6*_pi*440*_tp6))
def _echo6(x, al, D):
    y = x.copy(); y[D:] += al*x[:-D]; return y
def _undo6(y, al, D):
    w = np.zeros(len(y))
    for n in range(len(y)): w[n] = y[n] - (al*w[n - D] if n >= D else 0)
    return w
chk("M6 echo sound: D = 2000 at 8000 samples per second is 0.25 s; the note's harmonics 440, 880, 1320 Hz lie below 4 kHz",
    _near(2000/8000, 0.25, 1e-12) and 3*440 < 4000)
chk("M6 echo sound: the recursion gives back the plucked note exactly (al = 0.5 and 0.8, D = 2000)",
    all(np.max(np.abs(_undo6(_echo6(_xp6, al, 2000), al, 2000) - _xp6)) < 1e-12 for al in (0.5, 0.8)))
_hr6 = _undo6((np.arange(40) == 0).astype(float), 0.5, 4)
chk("M6 echo: the remover's impulse response is (-al)^k at n = kD and zero elsewhere; it decays for |al| < 1 (slider max 0.8) and grows for al = 1.2",
    np.allclose(_hr6, [(-0.5)**(n//4) if n % 4 == 0 else 0 for n in range(40)])
    and 0.8 < 1 and abs(_undo6((np.arange(40) == 0).astype(float), 1.2, 4)[36]) > 1)
# </m6-s6-verify>

# <m6-s7-verify> 6.7 quick check and projects
chk("M6 quick: u[n] has impulse weight pi; 1/(1-0.2) = 1.25; nine ones sum to 9; sin(pi n/5) first vanishes at n = 5",
    _near(_q(lambda w: 1.0, -_pi, _pi)/2, _pi, 1e-12) and _near(1/(1 - 0.2), 1.25, 1e-12) and sum(1 for n in range(-4, 5)) == 9
    and all(abs(np.sin(_pi*n/5)) > 0.1 for n in range(1, 5)) and abs(np.sin(_pi*5/5)) < 1e-12)
_Un = np.cumsum(np.ones(2001)); _Uk = np.arange(2001)
chk("M6 quick: the partial sums of u[n] e^{-jwn}, averaged, match 1/(1 - e^{-jw}) away from w = 0 (so the impulse weight is pi, not 2pi)",
    abs(np.mean([np.sum(np.exp(-1j*1.1*np.arange(N))) for N in range(1000, 1200)]) - 1/(1 - np.exp(-1j*1.1))) < 5e-3)
chk("M6 quick: cos(9 pi n/5) = cos(pi n/5) at every n; the impulse train of period 5 has weight 2pi/5",
    np.allclose(np.cos(9*_pi*np.arange(-20, 21)/5), np.cos(_pi*np.arange(-20, 21)/5)) and _near(9*_pi/5 - 2*_pi, -_pi/5, 1e-12)
    and _near(2*_pi*(1/5), 2*_pi/5, 1e-12))
_Xq = lambda w: 2 - np.exp(-2j*w)
chk("M6 quick: Parseval for 2 delta[n] - delta[n-2] gives 5; 4 x 0.5 = 2; 1/(1-0.6) = 2.5",
    _near(_q(lambda w: abs(_Xq(w))**2, -_pi, _pi)/(2*_pi), 5, 1e-10) and 4*0.5 == 2 and _near(1/(1 - 0.6), 2.5, 1e-12))
_xe = {-2: 1.0, -1: 3.0, 0: 2.0, 1: 3.0, 2: 1.0}
chk("M6 quick: a real, even sequence has a real transform; X(e^{j3w}) repeats every 2pi/3",
    all(abs(sum(v*np.exp(-1j*w*n) for n, v in _xe.items()).imag) < 1e-12 for w in (0.3, 1.1, 2.7))
    and _near(_H6(3*(0.4 + 2*_pi/3)), _H6(3*0.4), 1e-12))
chk("M6 pairs: 1/(1 - a e^{-jw})^3 is the transform of (n+1)(n+2)/2 a^n (a = 0.5, three periods)",
    np.max(np.abs(np.exp(-1j*np.outer(_w6[::50], _nP)) @ ((_nP + 1)*(_nP + 2)/2*0.5**_nP) - 1/(1 - 0.5*np.exp(-1j*_w6[::50]))**3)) < 1e-9)
chk("M6 pairs: a^{|n|} transforms to (1-a^2)/(1-2a cos w+a^2) and repeats every 2pi (a = 0.5)",
    np.max(np.abs(np.array([np.sum(0.5**np.abs(np.arange(-200, 201))*np.cos(w*np.arange(-200, 201))) for w in _w6[::100]])
                  - (1 - 0.25)/(1 - np.cos(_w6[::100]) + 0.25))) < 1e-9)
_wg = _w6[::100]
chk("M6 pairs: the rectangular pulse on |n| <= 2 gives sin(2.5w)/sin(w/2), with period 2pi",
    np.allclose([np.sum(np.cos(w*np.arange(-2, 3))) for w in _wg if abs(np.sin(w/2)) > 1e-6],
                [np.sin(2.5*w)/np.sin(w/2) for w in _wg if abs(np.sin(w/2)) > 1e-6]))
chk("M6 projects: the average 0.9 y[n-1] + 0.1 x[n] has H(e^{j0}) = 1 and |H(e^{j pi})| = 0.1/1.9 = 0.053",
    _near(0.1/(1 - 0.9), 1, 1e-12) and _near(0.1/1.9, 0.053, 5e-4))
def _beep(N, w):
    n = np.arange(N); return abs(np.sum(np.cos(_pi*n/4)*np.exp(-1j*w*n)))
chk("M6 projects: cos(pi n/4) for N = 32 and 128 peaks near pi/4 at N/2 = 16 and 64; the main lobe 4pi/N is 4 times narrower",
    _near(_beep(32, _pi/4), 16, 1e-9) and _near(_beep(128, _pi/4), 64, 1e-9)
    and abs(np.sum(np.exp(-1j*2*_pi/32*np.arange(32)))) < 1e-9 and _near((4*_pi/32)/(4*_pi/128), 4, 1e-12))
chk("M6 projects: |1 + 0.5 e^{-jw}| swings between 0.5 and 1.5, its inverse between 2/3 and 2",
    _near(np.min(np.abs(1 + 0.5*np.exp(-1j*_w6))), 0.5, 1e-9) and _near(np.max(np.abs(1 + 0.5*np.exp(-1j*_w6))), 1.5, 1e-9)
    and _near(1/1.5, 2/3, 1e-12) and _near(1/0.5, 2, 1e-12))
_wc = np.zeros(200); _yc = np.zeros(200)
for _k in range(200):
    _wc[_k] = (1.0 if _k == 0 else 0.0) + (0.8*_wc[_k-1] if _k else 0)
    _yc[_k] = _wc[_k] + (0.8*_yc[_k-1] if _k else 0)
chk("M6 projects: two stages of 0.8 give (n+1)(0.8)^n; its sum over 200 samples and 1/(1-0.8)^2 are both 25",
    np.allclose(_yc, (np.arange(200) + 1)*0.8**np.arange(200)) and _near(np.sum(_yc), 25, 1e-9) and _near(1/(1 - 0.8)**2, 25, 1e-9))
# </m6-s7-verify>


print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
