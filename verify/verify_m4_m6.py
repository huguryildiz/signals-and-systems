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

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
