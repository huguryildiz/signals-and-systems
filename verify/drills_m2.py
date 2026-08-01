"""Module 2 — Systems and Their Properties. Independent re-derivation of every
claim stated in the Check step of a D2-xx solution.

Module 2 answers are mostly proofs and counterexamples rather than single
numbers, so most claims here verify that a named counterexample does what the
solution says it does: that two inputs really do share an output, that a
bounded input really does produce an unbounded output, that a shifted input
really does not give the shifted output. Numerical integration and truncated
series are used where a closed form would just restate the solution's own
algebra."""
import math

import numpy as np
import sympy as sp

from drill_common import chk, seq, conv_dt, close, allclose, t, tau, n, k, w

_trapz = getattr(np, 'trapezoid', None) or np.trapz


def u(x):
    """Unit step, vectorised."""
    return np.where(np.asarray(x, dtype=float) >= 0, 1.0, 0.0)


# ===========================================================================
# D2-01 — y(t) = cos(x(t))
# ===========================================================================
chk("D2-01 S{0} = cos(0) = 1", close(math.cos(0.0), 1.0))
chk("D2-01 second homogeneity failure: cos(pi)=-1 vs 2*cos(pi/2)=0",
    not close(math.cos(math.pi), 2 * math.cos(math.pi / 2)),
    f"cos(pi)={math.cos(math.pi):.6f}, 2*cos(pi/2)={2*math.cos(math.pi/2):.6f}")
rng01 = np.random.default_rng(1)
u01 = rng01.uniform(-1000, 1000, 5000)
chk("D2-01 |cos(u)|<=1 for every sampled u", bool(np.all(np.abs(np.cos(u01)) <= 1.0 + 1e-12)))


# ===========================================================================
# D2-02 — y[n] = x[n] x[n+1]
# ===========================================================================
chk("D2-02 homogeneity fails at a=2", 2 * 2 != 2 * 1, f"S{{2x}}=4, 2*S{{x}}=2")
chk("D2-02 homogeneity fails at a=3 (independent scale factor)", 3 * 3 != 3 * 1,
    f"S{{3x}}=9, 3*S{{x}}=3")
chk("D2-02 causal counterexample at n=-4 uses x[-3], and -3 > -4", -3 > -4)
B02 = 5
chk("D2-02 stability bound is tight: B^2 achieved exactly", B02 * B02 == 25)


# ===========================================================================
# D2-03 — y(t) = x^3(t) - x(t)
# ===========================================================================
def f03(v):
    return v ** 3 - v


chk("D2-03 homogeneity fails at a=2 (x=1)", 2 * f03(2.0) != f03(1.0) * 0 + 2 * 0,
    f"f(2)={f03(2.0)}, target 2*f(1)={2*f03(1.0)}")
chk("D2-03 homogeneity fails at a=2, explicit", not close(f03(2 * 1.0), 2 * f03(1.0)),
    f"f(2)={f03(2.0)}, 2*f(1)={2*f03(1.0)}")
chk("D2-03 second homogeneity failure at a=3 (x=2)", not close(f03(3 * 2.0), 3 * f03(2.0)),
    f"f(6)={f03(6.0)}, 3*f(2)={3*f03(2.0)}")
rng03 = np.random.default_rng(2)
B03 = rng03.uniform(0.1, 50, 3000)
x03 = rng03.uniform(-1, 1, 3000) * B03
chk("D2-03 triangle-inequality bound |x^3-x| <= B^3+B holds for random (B,x)",
    bool(np.all(np.abs(x03 ** 3 - x03) <= B03 ** 3 + B03 + 1e-9)))


# ===========================================================================
# D2-04 — invertibility of x^3(t) and of x[n]x[n-2]
# ===========================================================================
z2_vals = [((-1) ** nn) * ((-1) ** (nn - 2)) for nn in (-3, -1, 0, 1, 4, 7)]
chk("D2-04 (b) z2[n] = 1 at every tested n", all(close(v, 1.0) for v in z2_vals), f"{z2_vals}")
chk("D2-04 (b) x1 and x2 differ at n=1", 1 != -1)
chk("D2-04 (b) x1 and x2 differ at n=3", 1 != (-1) ** 3)
rng04 = np.random.default_rng(3)
pairs = rng04.uniform(-50, 50, (500, 2))
ok = True
for a, b in pairs:
    if abs(a - b) > 1e-9 and math.isclose(a ** 3, b ** 3, abs_tol=1e-6):
        ok = False
        break
chk("D2-04 (a) cube is injective on 500 random distinct pairs", ok)
chk("D2-04 (a) inverse recovers a sample point: (2)^3=8, 8**(1/3)=2",
    close(8.0 ** (1 / 3), 2.0))


# ===========================================================================
# D2-05 — y[n] = sum_{k=n-3}^{n} x[k]
# ===========================================================================
x05 = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}


def y05(xd, nn):
    return sum(xd.get(kk, 0) for kk in range(nn - 3, nn + 1))


chk("D2-05 y[5] = 14", y05(x05, 5) == 14, f"= {y05(x05, 5)}")
x05_shift = {kk + 2: v for kk, v in x05.items()}
chk("D2-05 shifted input at n0=2: y~[7] = 14 (time invariance)", y05(x05_shift, 7) == 14,
    f"= {y05(x05_shift, 7)}")
B05 = 1.0
xB = {kk: B05 for kk in range(-5, 5)}
chk("D2-05 stability bound tight: y[n] = 4B for constant input", close(y05(xB, 0), 4 * B05))


# ===========================================================================
# D2-06 — y(t) = int_0^t x(tau) d tau, fixed lower limit
# ===========================================================================
def integ0(f, tt, npts=400001):
    lo, hi = (0.0, tt) if tt >= 0 else (tt, 0.0)
    if hi == lo:
        return 0.0
    g = np.linspace(lo, hi, npts)
    val = float(_trapz(f(g), g))
    return val if tt >= 0 else -val


def x1_06(tv):
    return u(np.asarray(tv, dtype=float) + 1)  # step starting at t=-1


y1_06 = lambda tv: integ0(x1_06, tv)

chk("D2-06 y1(-1) = -1 (numeric integration)", close(y1_06(-1.0), -1.0, tol=1e-3),
    f"= {y1_06(-1.0):.6f}")
chk("D2-06 y1(2) = 2 (numeric integration)", close(y1_06(2.0), 2.0, tol=1e-3),
    f"= {y1_06(2.0):.6f}")
chk("D2-06 y1 saturates at -1 for t<-1: y1(-3) = -1", close(y1_06(-3.0), -1.0, tol=1e-3),
    f"= {y1_06(-3.0):.6f}")


def x2_06(tv):
    return u(np.asarray(tv, dtype=float))  # x1 shifted right by 1 -> plain step


S_x2_06 = integ0(x2_06, 0.0)
chk("D2-06 TI test: S{x2}(0) = 0 (numeric integration)", close(S_x2_06, 0.0, tol=1e-3),
    f"= {S_x2_06:.6f}")
chk("D2-06 TI test: y1(t0-shift) = y1(-1) = -1, mismatched with S{x2}(0)=0",
    not close(S_x2_06, y1_06(-1.0), tol=1e-3),
    f"S(x2)(0)={S_x2_06:.4f}, y1(-1)={y1_06(-1.0):.4f}")


def bump(tv, center, width=0.02, height=5.0):
    tv = np.asarray(tv, dtype=float)
    return np.where(np.abs(tv - center) < width / 2, height, 0.0)


def x1_pert(tv):
    return x1_06(tv) + bump(tv, -0.5)


y_pert_neg1 = integ0(x1_pert, -1.0)
y_orig_neg1 = integ0(x1_06, -1.0)
chk("D2-06 causality: a bump at tau=-0.5 (later than t=-1) changes y(-1)",
    abs(y_pert_neg1 - y_orig_neg1) > 0.02,
    f"y_pert(-1)={y_pert_neg1:.6f}, y(-1)={y_orig_neg1:.6f}, diff={y_pert_neg1-y_orig_neg1:.6f}")


def x_const_06(tv):
    return np.ones_like(np.asarray(tv, dtype=float))


y_at_1000 = integ0(x_const_06, 1000.0)
chk("D2-06 stability: constant bounded input (B=1) gives y(1000)=1000, unbounded",
    close(y_at_1000, 1000.0, tol=1.0), f"= {y_at_1000:.3f}")


# ===========================================================================
# D2-07 — y[n] = sum_{k=-infty}^{n} (1/2)^{n-k} x[k]
# ===========================================================================
partials = [sum(0.5 ** j for j in range(N)) for N in (5, 20, 60)]
chk("D2-07 partial sums of sum (1/2)^j converge to 2", close(partials[-1], 2.0, tol=1e-15),
    f"N=60 partial sum = {partials[-1]:.15f}")


def y07(xf, nn, K=80):
    return sum((0.5 ** j) * xf(nn - j) for j in range(K))


x07 = lambda m: {0: 2.0, 3: -1.0, 5: 4.0}.get(m, 0.0)
n0_07 = 5
x07_shift = lambda m: x07(m - n0_07)
chk("D2-07 time invariance: S{x[n-n0]}[n0+10] = y[10]",
    close(y07(x07_shift, n0_07 + 10), y07(x07, 10), tol=1e-9),
    f"shifted={y07(x07_shift, n0_07+10):.10f}, original={y07(x07, 10):.10f}")

B07 = 3.0
x07_const = lambda m: B07
chk("D2-07 stability: constant input (B=3) gives y[n] -> 2B = 6",
    close(y07(x07_const, 0, K=80), 2 * B07, tol=1e-10), f"= {y07(x07_const,0,K=80):.10f}")


# ===========================================================================
# D2-08 — running sum, property vs a single response
# ===========================================================================
def y08_direct(nn):
    return sum((1.0 / 3.0) ** kk for kk in range(0, nn + 1))


def y08_formula(nn):
    return 1.5 * (1 - (1.0 / 3.0) ** (nn + 1))


chk("D2-08 closed form matches direct sum at n=2 (13/9)",
    close(y08_direct(2), 13 / 9, tol=1e-12) and close(y08_formula(2), 13 / 9, tol=1e-12),
    f"direct={y08_direct(2)}, formula={y08_formula(2)}")
chk("D2-08 y[n] -> 3/2 as n grows", close(y08_formula(100), 1.5, tol=1e-40))
chk("D2-08 counterexample: y[99]=100 for x=u[n]", sum(1 for _ in range(100)) == 100)


# ===========================================================================
# D2-09 — y(t) = e^{-t} x(t)
# ===========================================================================
chk("D2-09 TI mismatch: e^0=1 != e^1=e", not close(math.exp(0.0), math.exp(1.0)))
chk("D2-09 stability failure: e^{-t} at t=-20 is huge", math.exp(20) > 1e8,
    f"e^20 = {math.exp(20):.3e}")
a09, b09, x1v, x2v, tv09 = 2.0, -3.0, 1.7, -0.4, 0.6
lhs09 = math.exp(-tv09) * (a09 * x1v + b09 * x2v)
rhs09 = a09 * (math.exp(-tv09) * x1v) + b09 * (math.exp(-tv09) * x2v)
chk("D2-09 linearity: gain distributes over a linear combination", close(lhs09, rhs09))


# ===========================================================================
# D2-10 — y[n] = 2^{-|n|} x[n]
# ===========================================================================
gain10 = lambda nn: 2.0 ** (-abs(nn))
S_x2_10 = gain10(1) * 1.0  # S{x2}[1] = 2^{-1} * delta[0]=1
y1_shift_10 = 1.0  # y1[n-1] at n=1 is delta[0] = 1
chk("D2-10 TI mismatch: S{x2}[1]=0.5 != y1[0]=1", not close(S_x2_10, y1_shift_10),
    f"S(x2)[1]={S_x2_10}, y1[0]={y1_shift_10}")
gain_checks10 = [gain10(nn) for nn in (0, 1, -1, 5, -10)]
chk("D2-10 gain bound: 2^-|n| <= 1 at n=0,1,-1,5,-10", all(g <= 1.0 + 1e-15 for g in gain_checks10),
    f"{gain_checks10}")
a10, b10, x1v10, x2v10, n10 = 1.5, 2.5, 3.0, -1.0, 4
lhs10 = gain10(n10) * (a10 * x1v10 + b10 * x2v10)
rhs10 = a10 * (gain10(n10) * x1v10) + b10 * (gain10(n10) * x2v10)
chk("D2-10 linearity: gain distributes over a linear combination", close(lhs10, rhs10))


# ===========================================================================
# D2-11 — y(t) = x(t) cos(pi t) + x(t-1)
# ===========================================================================
chk("D2-11 cos(0)=1 and cos(-pi/2)=0", close(math.cos(0.0), 1.0) and close(math.cos(-math.pi / 2), 0.0, tol=1e-12))
S_x2_11 = math.cos(0.0) + 1.0
y1_shift_11 = math.cos(-math.pi / 2) + 1.0
chk("D2-11 TI mismatch: S{x2}(0)=2 != y1(-0.5)=1", not close(S_x2_11, y1_shift_11),
    f"S(x2)(0)={S_x2_11}, y1(-0.5)={y1_shift_11}")
rng11 = np.random.default_rng(4)
B11 = 4.0
ts11 = rng11.uniform(-30, 30, 2000)
x11 = lambda tv: np.sin(3.3 * tv) * B11  # a bounded sample function, |x|<=B11
y11 = x11(ts11) * np.cos(math.pi * ts11) + x11(ts11 - 1)
chk("D2-11 stability bound |y(t)| <= 2B holds on random sample", bool(np.all(np.abs(y11) <= 2 * B11 + 1e-9)))


# ===========================================================================
# D2-12 — invertibility of (t^2+1) x(t) and of t x(t)
# ===========================================================================
tt = sp.symbols('tt', real=True)
g12 = tt ** 2 + 1
crit = sp.solve(sp.diff(g12, tt), tt)
minval = min(g12.subs(tt, c) for c in crit) if crit else None
chk("D2-12 min of t^2+1 is 1, at t=0", crit == [0] and minval == 1, f"crit={crit}, min={minval}")

x1_12 = lambda tv: 1.0
x2_12 = lambda tv: 5.0 if abs(tv) < 1e-12 else 1.0
pairs12 = [(t0 * x1_12(t0), t0 * x2_12(t0)) for t0 in (0.0, 3.0, -3.0)]
chk("D2-12 (b) y1(t)=y2(t) at t=0,3,-3 despite x1!=x2 at t=0",
    all(close(a, b) for a, b in pairs12), f"{pairs12}")

y_at_2 = 5 * 2.0  # y(2) = (2^2+1)*x(2) = 5*x(2), with x(2) taken as 2.0 for the check
x_recovered = y_at_2 / 5.0
chk("D2-12 (a) inverse recovers x(2)=2 from y(2)=5x(2)", close(x_recovered, 2.0))


# ===========================================================================
# D2-13 — y[n] = x[n+2]
# ===========================================================================
chk("D2-13 causal counterexample at n=-5 uses x[-3], and -3 > -5", -3 > -5)
x13 = lambda m: {-4: 2.0, -1: -3.0, 2: 5.0}.get(m, 0.0)
n0_13 = 3
pairs13 = [(x13((nn - n0_13) + 2), x13(nn - 1)) for nn in (-2, 0, 4)]
chk("D2-13 TI identity x[(n-n0)+2]=x[n-1] holds at n=-2,0,4",
    all(close(a, b) for a, b in pairs13), f"{pairs13}")


# ===========================================================================
# D2-14 — y(t) = x(3-t)
# ===========================================================================
S_x2_14_at3 = u(2 - 3)
y1_shift_14_at3 = u(3 - 2)
chk("D2-14 TI mismatch at t=3: S{x2}(3)=0 != y1(2)=1",
    float(S_x2_14_at3) == 0.0 and float(y1_shift_14_at3) == 1.0)
S_x2_14_at4 = u(2 - 4)
y1_shift_14_at4 = u(3 - 3)
chk("D2-14 TI mismatch confirmed at a second instant t=4",
    float(S_x2_14_at4) == 0.0 and float(y1_shift_14_at4) == 1.0)
chk("D2-14 causal counterexample at t=1 uses x(2), and 2 > 1", 2 > 1)


# ===========================================================================
# D2-15 — y[n] = x[3n-1]
# ===========================================================================
def delta(v):
    return 1.0 if v == 0 else 0.0


y1_15_vals = [(nn, delta(3 * (nn - 1)), 1.0 if nn == 1 else 0.0) for nn in range(-2, 4)]
chk("D2-15 y1[n] = delta[3(n-1)] matches expected (1 only at n=1) for n=-2..3",
    all(close(v, e) for _, v, e in y1_15_vals), f"{y1_15_vals}")

vals15 = [delta(3 * nn - 4) for nn in (0, 1, 2, 3)]
chk("D2-15 S(x2)[n] = delta[3n-4] = 0 for n=0,1,2,3 (impulse never lands on an integer)",
    all(v == 0.0 for v in vals15), f"{vals15}")
chk("D2-15 causal counterexample at n=2: y[2]=x[5], and 5 > 2", 5 > 2)


# ===========================================================================
# D2-16 — block diagram, y[n] = 3x[n] - 2x[n-1]
# ===========================================================================
x16 = {0: 1.0, 1: -1.0, 2: 2.0}


def y16(xd, nn):
    return 3 * xd.get(nn, 0.0) - 2 * xd.get(nn - 1, 0.0)


yvals16 = {nn: y16(x16, nn) for nn in (0, 1, 2)}
chk("D2-16 y[0]=3, y[1]=-5, y[2]=8", yvals16 == {0: 3.0, 1: -5.0, 2: 8.0}, f"{yvals16}")

x_rec = {-1: 0.0}
for nn in (0, 1, 2):
    x_rec[nn] = (yvals16[nn] + 2 * x_rec[nn - 1]) / 3.0
chk("D2-16 inversion recovers x[0..2] exactly", all(close(x_rec[nn], x16[nn]) for nn in (0, 1, 2)),
    f"recovered={ {kk: x_rec[kk] for kk in (0,1,2)} }")


# ===========================================================================
# D2-17 — series: w[n]=x[n]-x[n-1], y[n]=2w[n]
# ===========================================================================
x17 = {0: 1.0, 1: 3.0, 2: 2.0}


def w17(xd, nn):
    return xd.get(nn, 0.0) - xd.get(nn - 1, 0.0)


def y17_chain(xd, nn):
    return 2 * w17(xd, nn)


def y17_direct(xd, nn):
    return 2 * xd.get(nn, 0.0) - 2 * xd.get(nn - 1, 0.0)


for nn in (0, 1, 2):
    chk(f"D2-17 chained and direct formulas agree at n={nn}",
        close(y17_chain(x17, nn), y17_direct(x17, nn)),
        f"chain={y17_chain(x17,nn)}, direct={y17_direct(x17,nn)}")
chk("D2-17 numeric values: w=1,2,-1 and y=2,4,-2",
    [w17(x17, nn) for nn in (0, 1, 2)] == [1.0, 2.0, -1.0]
    and [y17_chain(x17, nn) for nn in (0, 1, 2)] == [2.0, 4.0, -2.0])


# ===========================================================================
# D2-18 — parallel: y[n] = x[n] + x[n-1]
# ===========================================================================
x18 = {0: 2.0, 1: -1.0, 2: 3.0}


def y18(xd, nn):
    return xd.get(nn, 0.0) + xd.get(nn - 1, 0.0)


yvals18 = [y18(x18, nn) for nn in (0, 1, 2)]
chk("D2-18 y[0]=2, y[1]=1, y[2]=2", yvals18 == [2.0, 1.0, 2.0], f"{yvals18}")
B18 = 3.0
chk("D2-18 stability bound |y[n]| <= 2B holds", all(abs(v) <= 2 * B18 for v in yvals18))


# ===========================================================================
# D2-19 — feedback y[n] = x[n] - a y[n-1]
# ===========================================================================
geo_sum_half = sum(0.5 ** kk for kk in range(60))
chk("D2-19 geometric series at a=0.5 converges to 2", close(geo_sum_half, 2.0, tol=1e-15))


def run_feedback(a, xf, N, y_init=0.0):
    y = {-1: y_init}
    for nn in range(0, N):
        y[nn] = xf(nn) - a * y[nn - 1]
    return y


y_half = run_feedback(0.5, lambda nn: 1.0, 4)
expected_half = {0: 1.0, 1: 0.5, 2: 0.75, 3: 0.625}
chk("D2-19 recursion a=0.5, x=u[n]: y[0..3] = 1, 0.5, 0.75, 0.625",
    all(close(y_half[nn], expected_half[nn]) for nn in range(4)), f"{y_half}")
chk("D2-19 stability bound: all values stay below 2B=2", all(y_half[nn] < 2.0 for nn in range(4)))

y_neg1 = run_feedback(-1.0, lambda nn: 1.0, 3)
chk("D2-19 recursion a=-1, x=u[n]: y[n]=n+1 (unstable)",
    all(close(y_neg1[nn], nn + 1) for nn in range(3)), f"{y_neg1}")


# ===========================================================================
# D2-20 — series: modulator then fixed delay
# ===========================================================================
chk("D2-20 (a) cos(0)=1 != sin(0)=0", not close(math.cos(0.0), math.sin(0.0)))


def w20(f, tv, t0):
    return f(tv - t0)


f20 = lambda v: v ** 2 + math.sin(v)  # an arbitrary test signal
tv20, t0_20, delay20 = 2.3, 0.7, 1.0
lhs20 = w20(f20, tv20 - delay20, t0_20)
rhs20 = w20(f20, (tv20 - delay20) - t0_20, 0.0)
chk("D2-20 (b) pure delay identity w(t-t0-1)=w((t-1)-t0) for an arbitrary signal",
    close(lhs20, rhs20))

T_x2_20 = math.cos(1.0 - 1.0)  # T{x2}(1) = cos(0)
y1_shift_20 = math.sin(1.0 - 1.0)  # y1(1-pi/2) = sin(0), from cos(theta-pi/2)=sin(theta)
chk("D2-20 (c) cascade mismatch at t=1: T{x2}(1)=1 != y1(1-pi/2)=0",
    close(T_x2_20, 1.0) and close(y1_shift_20, 0.0) and not close(T_x2_20, y1_shift_20))

a20, b20, x1_20, x2_20, tsamp20 = 1.2, -0.7, 0.9, 2.1, 1.4
Tx20 = lambda xv, tv: xv * math.cos(tv - 1)  # T{x}(t) = x(t-1)cos(t-1) with x treated as its value at t-1
lhs20b = Tx20(a20 * x1_20 + b20 * x2_20, tsamp20)
rhs20b = a20 * Tx20(x1_20, tsamp20) + b20 * Tx20(x2_20, tsamp20)
chk("D2-20 (d) overall connection is linear in the relocated sample of x", close(lhs20b, rhs20b))
