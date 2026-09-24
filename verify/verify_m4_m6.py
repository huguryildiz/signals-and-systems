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

# 4.7 quick check and projects
chk("M4 quick: sqrt2 cos has power 1 and b_3 = 0.4 x 0.5 = 0.2",
    _near(2*(np.sqrt(2)/2)**2, 1, 1e-12) and _near(0.4*0.5, 0.2, 1e-12))
_tq = np.linspace(0, 1/220/4, 200001)
_sq31 = sum(4/(_pi*k)*np.sin(2*_pi*k*220*_tq) for k in range(1, 32, 2))
chk("M4 projects: a square wave of +-1 built to K = 31 peaks near 1.18", _near(_sq31.max(), 1.18, 5e-3), f"{_sq31.max():.4f}")

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
