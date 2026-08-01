"""Module 3 — Linear Time-Invariant Systems. Independent re-derivation of every
number stated in the Check step of a D3-xx solution.

Every convolution is recomputed here with `conv_dt` or `conv_ct` from
`drill_common`, brute force against the closed forms or tables the solutions
state — never by re-running the algebra of the solution itself. Deconvolution
questions are checked by reconvolving the recovered impulse response with the
given input and comparing every sample of the result against the given
output, which is the one route that never touches the forward-solving steps
used to find that impulse response in the first place."""
import math

import numpy as np
import sympy as sp

from drill_common import chk, seq, conv_dt, conv_ct, close, allclose, t, tau, n, k, w

j = 1j


# ===========================================================================
# D3-01 — FIR impulse response, then convolve with a rectangular input
# ===========================================================================
h01 = seq([2, -1, 0, 3], 0)
x01 = seq([1, 1, 1], 0)
y01 = conv_dt(x01, h01)
chk("D3-01 (a) h[n] table", h01 == {0: 2, 1: -1, 3: 3},
    f"{h01}")
chk("D3-01 (b) y[n] table", y01 == {0: 2, 1: 1, 2: 1, 3: 2, 4: 3, 5: 3},
    f"{y01}")
chk("D3-01 support width 0..5 (3+4-1)", max(y01) - min(y01) == 5, f"{min(y01)}..{max(y01)}")
chk("D3-01 sums multiply: sum(h)*sum(x) = sum(y)",
    sum(h01.values()) * sum(x01.values()) == sum(y01.values()),
    f"{sum(h01.values())}*{sum(x01.values())} = {sum(y01.values())}")


# ===========================================================================
# D3-02 — first-order recursion, step response, limit
# ===========================================================================
a02 = 0.25
h02_closed = {nn: a02 ** nn for nn in range(0, 8)}
# iterate h from the recursion itself, independently of the closed form
h02_iter, prev = {}, 0.0
for nn in range(0, 8):
    xn = 1.0 if nn == 0 else 0.0
    hv = a02 * prev + xn
    h02_iter[nn] = hv
    prev = hv
chk("D3-02 (a) iterated h[n] matches (1/4)^n", allclose(list(h02_iter.values()), list(h02_closed.values())),
    f"iter={list(h02_iter.values())[:4]}")

# step response by iterating the recursion directly with x[n]=u[n]
y02_iter, prev = {}, 0.0
for nn in range(0, 12):
    yv = a02 * prev + 1.0
    y02_iter[nn] = yv
    prev = yv
y02_closed = {nn: (4 / 3) * (1 - a02 ** (nn + 1)) for nn in range(0, 12)}
chk("D3-02 (b) iterated step response matches closed form", allclose(list(y02_iter.values()), list(y02_closed.values())),
    f"y[0..3] iter={[round(y02_iter[i],6) for i in range(4)]}")
chk("D3-02 (c) limit = 4/3", close(y02_closed[11], 4 / 3, tol=1e-4), f"y[11]={y02_closed[11]:.6f}")
chk("D3-02 DC gain sum(h) = 4/3", close(1 / (1 - a02), 4 / 3))


# ===========================================================================
# D3-03 — non-causal second-difference filter
# ===========================================================================
h03 = seq([1, -2, 1], -1)
x03 = seq([1, 1, 1], -1)
y03 = conv_dt(x03, h03)
expected03 = {-2: 1, -1: -1, 1: -1, 2: 1}  # y[0]=0 is dropped by conv_dt's nonzero filter
chk("D3-03 (b) y[n] table (y[0]=0 implicitly)", y03 == expected03, f"{y03}")
chk("D3-03 (c) sum(h)=0", sum(h03.values()) == 0)
chk("D3-03 (c) sum(y) = sum(h)*sum(x) = 0", sum(y03.values()) == sum(h03.values()) * sum(x03.values()) == 0)
# direct value at n=0 from the original relation, not the table
x03fn = lambda nn: 1.0 if -1 <= nn <= 1 else 0.0
chk("D3-03 Check: y[0] = x[1]-2x[0]+x[-1] = 0", close(x03fn(1) - 2 * x03fn(0) + x03fn(-1), 0.0))


# ===========================================================================
# D3-04 — cascade and parallel interconnection
# ===========================================================================
h1_04 = seq([1, 1], 0)
h2_04 = seq([1, -1], 0)
hc_04 = conv_dt(h1_04, h2_04)
hc_04_rev = conv_dt(h2_04, h1_04)
hp_04 = {kk: h1_04.get(kk, 0) + h2_04.get(kk, 0) for kk in set(h1_04) | set(h2_04)}
hp_04 = {kk: v for kk, v in hp_04.items() if v != 0}
resp_04 = conv_dt(hp_04, {4: 3})
chk("D3-04 (b) h_c = delta[n]-delta[n-2]", hc_04 == {0: 1, 2: -1}, f"{hc_04}")
chk("D3-04 (c) h_p = 2*delta[n]", hp_04 == {0: 2}, f"{hp_04}")
chk("D3-04 (c) response to 3*delta[n-4] is 6*delta[n-4]", resp_04 == {4: 6}, f"{resp_04}")
chk("D3-04 Check: cascade is commutative (h2*h1 = h1*h2)", hc_04_rev == hc_04, f"{hc_04_rev}")
chk("D3-04 Check: sum(h1)*sum(h2) = sum(h_c) = 0",
    sum(h1_04.values()) * sum(h2_04.values()) == sum(hc_04.values()) == 0)


# ===========================================================================
# D3-05 — convolution sum: first-difference filter on a ramp pulse
# ===========================================================================
x05 = seq([1, 2, 3], 0)
h05 = seq([1, -1], 0)
y05 = conv_dt(x05, h05)
chk("D3-05 (a) y[n] table", y05 == {0: 1, 1: 1, 2: 1, 3: -3}, f"{y05}")
chk("D3-05 (b) largest-magnitude sample is y[3]=-3", max(y05, key=lambda kk: abs(y05[kk])) == 3
    and y05[3] == -3, f"{y05}")
chk("D3-05 support width 0..3 (3+2-1)", max(y05) - min(y05) == 3)
chk("D3-05 sum(y) = sum(h)*sum(x) = 0", sum(y05.values()) == sum(h05.values()) * sum(x05.values()) == 0)


# ===========================================================================
# D3-06 — convolution sum: two-tap averager on a triangular pulse
# ===========================================================================
x06 = seq([1, 2, 3, 2, 1], -2)
h06 = seq([1, 1], 0)
y06 = conv_dt(x06, h06)
chk("D3-06 (a) y[n] table", y06 == {-2: 1, -1: 3, 0: 5, 1: 5, 2: 3, 3: 1}, f"{y06}")
chk("D3-06 (b) symmetric about n=0.5: y[-2]=y[3], y[-1]=y[2], y[0]=y[1]",
    y06[-2] == y06[3] and y06[-1] == y06[2] and y06[0] == y06[1])
chk("D3-06 sum(y) = sum(h)*sum(x) = 18", sum(y06.values()) == sum(h06.values()) * sum(x06.values()) == 18)


# ===========================================================================
# D3-07 — convolution sum: weighted 3-tap smoother on a rectangular pulse
# ===========================================================================
x07 = seq([1, 1, 1, 1], 0)
h07 = seq([1, 2, 1], 0)
y07 = conv_dt(x07, h07)
chk("D3-07 (a) y[n] table", y07 == {0: 1, 1: 3, 2: 4, 3: 4, 4: 3, 5: 1}, f"{y07}")
chk("D3-07 (b) peak = sum(h) = 4, at n=2 and n=3",
    max(y07.values()) == sum(h07.values()) == 4 and y07[2] == 4 and y07[3] == 4)
chk("D3-07 palindrome: y[n] = y[5-n]", all(y07.get(kk, 0) == y07.get(5 - kk, 0) for kk in range(0, 6)))
chk("D3-07 sum(y) = sum(h)*sum(x) = 16", sum(y07.values()) == sum(h07.values()) * sum(x07.values()) == 16)


# ===========================================================================
# D3-08 — convolution sum: central-difference operator, and its shortcut
# ===========================================================================
x08 = seq([2, -1, 3], 0)
h08 = seq([1, 0, -1], -1)  # h[n] = delta[n+1] - delta[n-1]: nonzero at n=-1 and n=+1
y08 = conv_dt(x08, h08)
chk("D3-08 (a) y[n] table", y08 == {-1: 2, 0: -1, 1: 1, 2: 1, 3: -3}, f"{y08}")
shortcut08 = {nn: x08.get(nn + 1, 0) - x08.get(nn - 1, 0) for nn in range(-2, 5)}
shortcut08 = {kk: v for kk, v in shortcut08.items() if v != 0}
chk("D3-08 (b) shortcut x[n+1]-x[n-1] matches the full sum", shortcut08 == y08, f"{shortcut08}")
chk("D3-08 sum(y) = sum(h)*sum(x) = 0", sum(y08.values()) == sum(h08.values()) * sum(x08.values()) == 0)


# ===========================================================================
# D3-09 — CT convolution: exponential * rectangular pulse
# ===========================================================================
def x09(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt >= 0, np.exp(-tt), 0.0)


def h09(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where((tt >= 0) & (tt <= 2), 1.0, 0.0)


ts09 = [0.5, 1.0, 1.5, 3.0, 5.0]
y09_num = conv_ct(x09, h09, ts09, lo=-5, hi=25, npts=1_500_001)
y09_closed = np.array([1 - math.exp(-tv) if tv < 2 else math.exp(-tv) * (math.exp(2) - 1) for tv in ts09])
chk("D3-09 (a),(b) conv_ct matches closed form", allclose(y09_num, y09_closed, tol=1e-3),
    f"num={y09_num}, closed={y09_closed}")

# continuity at t=2, both branches
b_lo = 1 - math.exp(-2.0)
b_hi = math.exp(-2.0) * (math.exp(2) - 1)
chk("D3-09 (c) both branches agree at t=2", close(b_lo, b_hi, tol=1e-9), f"{b_lo} vs {b_hi}")

# Check step: y(t) = s(t) - s(t-2), s(t) the step response of x alone (distributive property)
s09 = lambda tv: (1 - math.exp(-tv)) if tv >= 0 else 0.0
for tv in [0.7, 1.9, 2.4, 4.0]:
    via_dist = s09(tv) - s09(tv - 2)
    direct = (1 - math.exp(-tv)) if tv < 2 else math.exp(-tv) * (math.exp(2) - 1)
    chk(f"D3-09 Check: s(t)-s(t-2) = y(t) at t={tv}", close(via_dist, direct, tol=1e-9),
        f"{via_dist:.6f} vs {direct:.6f}")


# ===========================================================================
# D3-10 — CT convolution: two rectangular pulses of unequal width
# ===========================================================================
def x10(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where((tt > 0) & (tt < 2), 1.0, 0.0)


def h10(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where((tt > 0) & (tt < 3), 1.0, 0.0)


def y10_closed(tv):
    if tv < 0:
        return 0.0
    if tv < 2:
        return tv
    if tv < 3:
        return 2.0
    if tv < 5:
        return 5 - tv
    return 0.0


ts10 = [1.0, 2.5, 4.0]
y10_num = conv_ct(x10, h10, ts10, lo=-2, hi=8, npts=1_500_001)
chk("D3-10 (b) conv_ct matches closed form", allclose(y10_num, [y10_closed(tv) for tv in ts10], tol=1e-3),
    f"num={y10_num}")

# continuity at all four boundaries
for tv in [0.0, 2.0, 3.0, 5.0]:
    left = y10_closed(tv - 1e-6)
    right = y10_closed(tv + 1e-6)
    chk(f"D3-10 Check: continuous at t={tv}", close(left, right, tol=1e-4), f"{left:.5f} vs {right:.5f}")

tt10 = np.linspace(-1, 6, 2_000_001)
area10 = float(np.trapezoid(np.array([y10_closed(v) for v in tt10]), tt10))
chk("D3-10 (c) total area = 2*3 = 6", close(area10, 6.0, tol=1e-3), f"area={area10:.6f}")
peak10 = max(y10_closed(tv) for tv in np.linspace(0, 5, 5001))
chk("D3-10 peak = min(2,3) = 2", close(peak10, 2.0, tol=1e-6), f"peak={peak10:.6f}")


# ===========================================================================
# D3-11 — CT convolution: two causal exponentials with different rates
# ===========================================================================
def x11(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt >= 0, np.exp(-2 * tt), 0.0)


def h11(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt >= 0, np.exp(-3 * tt), 0.0)


ts11 = [0.0, 0.4, math.log(1.5), 1.0, 2.0]
y11_num = conv_ct(x11, h11, ts11, lo=-2, hi=25, npts=1_500_001)
y11_closed = np.array([math.exp(-2 * tv) - math.exp(-3 * tv) if tv >= 0 else 0.0 for tv in ts11])
chk("D3-11 (a) conv_ct matches e^-2t - e^-3t", allclose(y11_num, y11_closed, tol=1e-3),
    f"num={y11_num}, closed={y11_closed}")

# peak location and value, via sympy calculus, independent of the numeric integrator
tv_sym = sp.symbols('tv_sym', real=True, positive=True)
y11_sym = sp.exp(-2 * tv_sym) - sp.exp(-3 * tv_sym)
dy11 = sp.diff(y11_sym, tv_sym)
tstar_sol = sp.solve(sp.Eq(dy11, 0), tv_sym)
tstar = [s for s in tstar_sol if s.is_real][0]
chk("D3-11 (b) t* = ln(3/2)", sp.simplify(tstar - sp.log(sp.Rational(3, 2))) == 0, f"t*={tstar}")
peak_val = sp.simplify(y11_sym.subs(tv_sym, tstar))
chk("D3-11 (b) peak value = 4/27", sp.nsimplify(peak_val) == sp.Rational(4, 27), f"peak={peak_val}")
y11_at0 = sp.integrate(sp.exp(-2 * tau) * sp.exp(-3 * (0 - tau)), (tau, 0, 0))
chk("D3-11 (c) y(0) = 0, integrated directly over the zero-length interval [0,0]", y11_at0 == 0, f"{y11_at0}")


# ===========================================================================
# D3-12 — CT convolution: anti-causal exponential * delayed step
# ===========================================================================
def x12(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt <= 0, np.exp(3 * tt), 0.0)


def h12(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt >= 2, 1.0, 0.0)


def y12_closed(tv):
    if tv < 2:
        return (1 / 3) * math.exp(3 * (tv - 2))
    return 1 / 3


ts12 = [0.0, 1.0, 2.0, 3.0, 5.0]
y12_num = conv_ct(x12, h12, ts12, lo=-30, hi=10, npts=2_500_001)
chk("D3-12 (a),(b) conv_ct matches closed form", allclose(y12_num, [y12_closed(tv) for tv in ts12], tol=1e-3),
    f"num={y12_num}")
chk("D3-12 (c) branches agree at t=2", close(y12_closed(2 - 1e-9), y12_closed(2 + 1e-9), tol=1e-6))

# Check: total area of x equals the settled level
area_x12 = float(sp.integrate(sp.exp(3 * tau), (tau, -sp.oo, 0)))
chk("D3-12 Check: total area of x = 1/3 = settled level", close(area_x12, 1 / 3, tol=1e-9), f"area={area_x12}")
# branch (a) increasing: derivative positive everywhere
tv12 = np.linspace(-10, 1.999, 200_000)
deriv12 = np.exp(3 * (tv12 - 2))
chk("D3-12 Check: branch (a) strictly increasing (derivative > 0)", bool(np.all(deriv12 > 0)))


# ===========================================================================
# D3-13 — deconvolution, negative-index input
# ===========================================================================
x13g = seq([2, 1], -1)
y13g_given = seq([2, 5, 0, -1], -1)
h13g_recovered = seq([1, 2, -1], 0)
y13g_reconv = conv_dt(x13g, h13g_recovered)
chk("D3-13 reconvolving recovered h with x reproduces every given y sample",
    y13g_reconv == y13g_given, f"{y13g_reconv}")
chk("D3-13 support width matches: -1..2 (2+3-1)", max(y13g_given) - min(y13g_given) == 3)
chk("D3-13 sum(x)*sum(h) = sum(y)",
    sum(x13g.values()) * sum(h13g_recovered.values()) == sum(y13g_given.values()),
    f"{sum(x13g.values())}*{sum(h13g_recovered.values())} = {sum(y13g_given.values())}")


# ===========================================================================
# D3-14 — deconvolution, second variant
# ===========================================================================
x14g = seq([1, 2], 0)
y14g_given = seq([2, 3, 1, 6], 0)
h14g_recovered = seq([2, -1, 3], 0)
y14g_reconv = conv_dt(x14g, h14g_recovered)
chk("D3-14 reconvolving recovered h with x reproduces every given y sample",
    y14g_reconv == y14g_given, f"{y14g_reconv}")
chk("D3-14 support width matches: 0..3 (2+3-1)", max(y14g_given) - min(y14g_given) == 3)
chk("D3-14 sum(x)*sum(h) = sum(y)",
    sum(x14g.values()) * sum(h14g_recovered.values()) == sum(y14g_given.values()),
    f"{sum(x14g.values())}*{sum(h14g_recovered.values())} = {sum(y14g_given.values())}")


# ===========================================================================
# D3-15 — inverse system, h*g = delta
# ===========================================================================
h15 = seq([1, -0.5], 0)
g15 = {nn: 0.5 ** nn for nn in range(0, 40)}
y15 = conv_dt(h15, g15, lo=-100, hi=100)
chk("D3-15 (a) g[n] = (1/2)^n for n=0..4",
    allclose([g15[nn] for nn in range(5)], [0.5 ** nn for nn in range(5)], tol=1e-12))
chk("D3-15 (b) g is stable: sum |g| = 2", close(sum(abs(v) for v in g15.values()) + sum(0.5 ** m for m in range(40, 200)), 2.0, tol=1e-6),
    f"sum={sum(abs(v) for v in g15.values()):.6f}")
chk("D3-15 (c) h*g = delta[n] at n=0,1,2 (away from truncation)",
    close(y15.get(0, 0), 1.0) and close(y15.get(1, 0), 0.0) and close(y15.get(2, 0), 0.0),
    f"y[0..2]={[round(y15.get(nn,0),9) for nn in range(3)]}")


# ===========================================================================
# D3-16 — step-input deconvolution via first difference
# ===========================================================================
y16_table = {-1: 0.0, 0: 2.0, 1: 3.0, 2: 3.0, 3: 5.0, 4: 5.0}
h16_recovered = {nn: y16_table[nn] - y16_table.get(nn - 1, 0.0) for nn in range(0, 4)}
chk("D3-16 (b) h[n] = y[n]-y[n-1] gives 2,1,0,2",
    h16_recovered == {0: 2.0, 1: 1.0, 2: 0.0, 3: 2.0}, f"{h16_recovered}")
chk("D3-16 (c) sum(h) = plateau of y = 5",
    close(sum(h16_recovered.values()), y16_table[4]) and close(y16_table[3], y16_table[4]))
# reconstruct running sum from h and confirm it reproduces the table
running = {}
acc = 0.0
for nn in range(0, 5):
    acc += h16_recovered.get(nn, 0.0)
    running[nn] = acc
chk("D3-16 Check: running sum of recovered h reproduces the table",
    all(close(running[nn], y16_table[nn]) for nn in range(0, 4)), f"{running}")


# ===========================================================================
# D3-17 — causality/stability independence, DT
# ===========================================================================
h1_17 = lambda nn: 2.0 ** nn if nn >= 0 else 0.0
h2_17 = lambda nn: (1 / 3) ** abs(nn)

chk("D3-17 (a) h1 causal: zero for n<0", all(h1_17(nn) == 0 for nn in range(-10, 0)))
partial_h1 = sum(2.0 ** nn for nn in range(0, 60))
chk("D3-17 (a) h1 unstable: partial sum to N=60 exceeds 1e17", partial_h1 > 1e17, f"partial={partial_h1:.3e}")
chk("D3-17 (b) h2 not causal: h2[-1] != 0", h2_17(-1) != 0, f"h2[-1]={h2_17(-1)}")
sum_h2 = 1 + 2 * sum((1 / 3) ** nn for nn in range(1, 200))
chk("D3-17 (b) h2 stable: sum |h2| = 2", close(sum_h2, 2.0, tol=1e-9), f"sum={sum_h2:.9f}")

# Check: bounded-in, unbounded-out for h1 with x[n]=u[n]
y17_iter = {}
acc17 = 0.0
for nn in range(0, 40):
    acc17 += h1_17(nn)
    y17_iter[nn] = acc17
y17_closed = {nn: 2.0 ** (nn + 1) - 1 for nn in range(0, 40)}
chk("D3-17 Check: y[n] = 2^(n+1)-1 for x=u[n] on h1, and it is unbounded",
    allclose(list(y17_iter.values()), list(y17_closed.values())) and y17_closed[39] > 1e11,
    f"y[39]={y17_closed[39]:.3e}")


# ===========================================================================
# D3-18 — causality/stability, CT, with an explicit BIBO check
# ===========================================================================
stability_integral_18 = sp.integrate(sp.exp(2 * t), (t, -sp.oo, 0))
chk("D3-18 (b) stability integral = 1/2", stability_integral_18 == sp.Rational(1, 2), f"{stability_integral_18}")


def x18(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt >= 0, 1.0, 0.0)


def h18(tt):
    tt = np.asarray(tt, dtype=float)
    return np.where(tt <= 0, np.exp(2 * tt), 0.0)


def y18_closed(tv):
    return 0.5 * math.exp(2 * tv) if tv < 0 else 0.5


ts18 = [-2.0, -1.0, -0.3, 0.0, 1.0, 3.0]
y18_num = conv_ct(x18, h18, ts18, lo=-30, hi=10, npts=2_000_001)
chk("D3-18 (c) conv_ct matches closed form", allclose(y18_num, [y18_closed(tv) for tv in ts18], tol=1e-3),
    f"num={y18_num}")
chk("D3-18 Check: |y(t)| <= 1/2 for all t (BIBO bound)",
    all(y18_closed(tv) <= 0.5 + 1e-9 for tv in np.linspace(-20, 20, 20001)))


# ===========================================================================
# D3-19 — DT step response and its relation to h
# ===========================================================================
s19_closed = {nn: (1 - 0.6 ** (nn + 1)) / 0.4 for nn in range(0, 12)}
s19_iter, prev19 = {}, 0.0
for nn in range(0, 12):
    v = 0.6 * prev19 + 1.0
    s19_iter[nn] = v
    prev19 = v
chk("D3-19 (a) iterated step response matches closed form", allclose(list(s19_iter.values()), list(s19_closed.values())),
    f"s[0..3] iter={[round(s19_iter[i],6) for i in range(4)]}")

h19_recovered = {nn: s19_closed[nn] - s19_closed.get(nn - 1, 0.0) for nn in range(0, 8)}
h19_expected = {nn: 0.6 ** nn for nn in range(0, 8)}
chk("D3-19 (b) h[n]=s[n]-s[n-1] reproduces (0.6)^n", allclose(list(h19_recovered.values()), list(h19_expected.values())),
    f"{list(h19_recovered.values())[:4]}")
nn_sym = sp.symbols('nn_sym', integer=True, positive=True)
lim19 = sp.limit((1 - sp.Rational(3, 5) ** (nn_sym + 1)) / sp.Rational(2, 5), nn_sym, sp.oo)
chk("D3-19 (c) limit s[n] -> 2.5 = sum(h)", lim19 == sp.Rational(5, 2), f"limit={lim19}")


# ===========================================================================
# D3-20 — CT step response and its relation to h
# ===========================================================================
tv20 = sp.symbols('tv20', real=True)
s20_expr = sp.integrate(sp.exp(-4 * tau), (tau, 0, tv20))
chk("D3-20 (a) s(t) = (1-e^-4t)/4", sp.simplify(s20_expr - (1 - sp.exp(-4 * tv20)) / 4) == 0, f"{s20_expr}")

ds20 = sp.diff(s20_expr, tv20)
chk("D3-20 (b) ds/dt = e^-4t = h(t) for t>0", sp.simplify(ds20 - sp.exp(-4 * tv20)) == 0, f"{ds20}")

lim20 = sp.limit(s20_expr, tv20, sp.oo)
chk("D3-20 (c) limit s(t) -> 1/4", lim20 == sp.Rational(1, 4), f"{lim20}")
area20 = sp.integrate(sp.exp(-4 * t), (t, 0, sp.oo))
chk("D3-20 (c) total area under h = 1/4 = limit", area20 == sp.Rational(1, 4), f"{area20}")

# Check: numeric value at t=1/4 for both s and its derivative
s20_num = float((1 - math.exp(-1)) / 4)
h20_num = float(math.exp(-1))
grid20 = np.linspace(0, 0.25, 400_001)
s20_trapz = float(np.trapezoid(np.exp(-4 * grid20), grid20))
chk("D3-20 Check: s(1/4) matches direct numerical integration of h", close(s20_num, s20_trapz, tol=1e-6),
    f"closed={s20_num:.6f}, trapz={s20_trapz:.6f}")
chk("D3-20 Check: h(1/4) approx 0.368 matches ds/dt at t=1/4", close(h20_num, float(ds20.subs(tv20, sp.Rational(1, 4))), tol=1e-9),
    f"{h20_num:.6f}")
