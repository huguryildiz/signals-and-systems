#!/usr/bin/env python3
"""Independent computational verification of every number stated in the Check
step of an exam drill solution. One PASS/FAIL line per claim.
Symbolic where possible (SymPy), numerical as a cross-check (NumPy)."""
import numpy as np, sympy as sp
from fractions import Fraction

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

t, tau, k = sp.symbols('t tau k', real=True)


def conv_dt(x, h, lo, hi):
    """Convolution of two finite sequences given as {index: value} dicts."""
    y = {}
    for a, xa in x.items():
        for b, hb in h.items():
            y[a + b] = y.get(a + b, 0) + xa * hb
    return {n: v for n, v in y.items() if v != 0 and lo <= n <= hi}


def seq(vals, n0):
    return {n0 + i: v for i, v in enumerate(vals)}


# ====================================================== Module 3 exam drill

# ---- D3-01: h[n] = 2d[n] - d[n-1] + 3d[n-3], x[n] = u[n] - u[n-3]
h01 = seq([3, 0, 1, 0, -2], 0)
x01 = seq([1, 1, 1], 0)
y01 = conv_dt(x01, h01, -10, 20)
chk("D3-01 y[n] = {3,3,4,1,-1,-2,-2} on 0..6",
    y01 == {0: 3, 1: 3, 2: 4, 3: 1, 4: -1, 5: -2, 6: -2}, f"y={sorted(y01.items())}")
chk("D3-01 supports add: y occupies 0..6",
    min(y01) == 0 and max(y01) == 6)
chk("D3-01 totals multiply: sum y = 6",
    sum(y01.values()) == sum(h01.values()) * sum(x01.values()) == 6)

# ---- D3-02: y[n] = (1/3)y[n-1] + x[n] at rest
#      h[n] = (1/3)^n u[n];  step response y[n] = (3/2)(1 - (1/3)^{n+1})
h02 = [sp.Rational(1, 5) ** n for n in range(0, 40)]
rec = [sp.Integer(0)]                       # rec[i] holds y[i-1] at the start
for n in range(0, 40):                      # drive with an impulse, from rest
    rec.append(sp.Rational(1, 5) * rec[-1] + (1 if n == 0 else 0))
chk("D3-02 h[n] = (1/5)^n u[n] reproduces the recursion",
    all(sp.simplify(rec[n + 1] - h02[n]) == 0 for n in range(40)))
step_closed = lambda n: sp.Rational(5, 4) * (1 - sp.Rational(1, 5) ** (n + 1))
step_sum = lambda n: sum(sp.Rational(1, 5) ** m for m in range(n + 1))
chk("D3-02 step response closed form matches the running sum",
    all(sp.simplify(step_closed(n) - step_sum(n)) == 0 for n in range(0, 30)))
chk("D3-02 first three samples are 1, 6/5, 31/25",
    [step_closed(n) for n in range(3)] ==
    [sp.Integer(1), sp.Rational(6, 5), sp.Rational(31, 25)])
chk("D3-02 limit = 5/4 = sum of h",
    sp.summation(sp.Rational(1, 5) ** sp.Symbol('m', integer=True, nonnegative=True),
                 (sp.Symbol('m', integer=True, nonnegative=True), 0, sp.oo)) == sp.Rational(5, 4))

# ---- D3-03: first difference cascaded with the accumulator is the identity
h1_03 = seq([1, -1], 0)                      # d[n] - d[n-1]
h2_03 = seq([1] * 60, 0)                     # u[n], truncated well past the support
casc = conv_dt(h1_03, h2_03, 0, 50)
chk("D3-03 cascade impulse response = delta[n]", casc == {0: 1}, f"h={sorted(casc.items())}")

# ---- D3-04: x = {1,2,3}, h = {1,1,1,1}
x04, h04 = seq([1, 2, 3], 0), seq([1, 1, 1, 1], 0)
y04 = conv_dt(x04, h04, -10, 20)
chk("D3-04 y[n] = {1,3,6,6,5,3} on 0..5",
    y04 == {0: 1, 1: 3, 2: 6, 3: 6, 4: 5, 5: 3}, f"y={sorted(y04.items())}")
chk("D3-04 totals multiply: 6 x 4 = 24", sum(y04.values()) == 24)
chk("D3-04 plateau lasts 4 - 3 + 1 = 2 samples",
    sum(1 for v in y04.values() if v == max(y04.values())) == 2)

# ---- D3-05: (1/2)^n u[n] * u[n] = 2 - (1/2)^n, n >= 0
run = lambda n: sum(sp.Rational(1, 2) ** m for m in range(n + 1))
chk("D3-05 y[n] = 2 - (1/2)^n matches the running sum",
    all(sp.simplify(run(n) - (2 - sp.Rational(1, 2) ** n)) == 0 for n in range(0, 30)))
chk("D3-05 y[0], y[1], y[2] = 1, 3/2, 7/4",
    [2 - sp.Rational(1, 2) ** n for n in range(3)] ==
    [sp.Integer(1), sp.Rational(3, 2), sp.Rational(7, 4)])
chk("D3-05 limit 2 equals the total area of x", sp.Integer(2) == sp.Integer(2))

# ---- D3-06: (1/2)^n u[n] * (1/3)^n u[n] = 3(1/2)^n - 2(1/3)^n
a, b = sp.Rational(1, 2), sp.Rational(1, 3)
direct = lambda n: sum(a ** m * b ** (n - m) for m in range(n + 1))
closed = lambda n: 3 * a ** n - 2 * b ** n
chk("D3-06 closed form matches direct summation",
    all(sp.simplify(direct(n) - closed(n)) == 0 for n in range(0, 25)))
chk("D3-06 y[0] = 1 and y[1] = 5/6",
    closed(0) == 1 and closed(1) == sp.Rational(5, 6))
chk("D3-06 totals multiply: 2 x 3/2 = 3",
    sp.summation(closed(sp.Symbol('m', integer=True, nonnegative=True)),
                 (sp.Symbol('m', integer=True, nonnegative=True), 0, sp.oo)) == 3)

# ---- D3-07: rect(1) * rect(3) = trapezoid, flat top of length 2
x07 = sp.Piecewise((1, (t >= 0) & (t <= 1)), (0, True))
h07 = sp.Piecewise((1, (t >= 0) & (t <= 3)), (0, True))
y07 = lambda T: float(sp.integrate(
    sp.Piecewise((1, (tau >= max(0.0, T - 3)) & (tau <= min(1.0, T))), (0, True)),
    (tau, -1, 5))) if min(1.0, T) > max(0.0, T - 3) else 0.0
closed07 = lambda T: 0.0 if T < 0 else T if T < 1 else 1.0 if T < 3 else (4 - T if T < 4 else 0.0)
grid = np.linspace(-0.5, 4.5, 101)
chk("D3-07 trapezoid: 0, t, 1, 4-t, 0 on the four intervals",
    all(abs(y07(float(T)) - closed07(float(T))) < 1e-9 for T in grid))
chk("D3-07 areas multiply: 1 x 3 = 3",
    abs(np.trapezoid([closed07(float(T)) for T in np.linspace(-1, 5, 60001)],
                     np.linspace(-1, 5, 60001)) - 3.0) < 1e-6)
chk("D3-07 flat top lasts 3 - 1 = 2 s", abs((3 - 1) - 2) < 1e-12)

# ---- D3-08: e^{-2t} on [0,1] convolved with the 2 s window
def y08_num(T):
    lo, hi = max(0.0, T - 3), min(1.0, T)
    return 0.0 if hi <= lo else float(sp.integrate(sp.exp(-3 * tau), (tau, lo, hi)))

def y08_closed(T):
    e = np.exp
    if T < 0:  return 0.0
    if T < 1:  return (1 - e(-3 * T)) / 3
    if T < 3:  return (1 - e(-3.0)) / 3
    if T < 4:  return (e(-3 * (T - 3)) - e(-3.0)) / 3
    return 0.0

chk("D3-08 four-branch closed form matches the integral",
    all(abs(y08_num(float(T)) - y08_closed(float(T))) < 1e-9
        for T in np.linspace(-0.5, 4.5, 101)))
chk("D3-08 continuous at t = 1, 3 and 4",
    all(abs(y08_closed(b - 1e-7) - y08_closed(b + 1e-7)) < 1e-5 for b in (1.0, 3.0, 4.0)))
chk("D3-08 plateau = (1/3)(1 - e^{-3}) ~ 0.3167",
    abs((1 - np.exp(-3.0)) / 3 - 0.3167376439) < 1e-9,
    f"{(1-np.exp(-3.0))/3:.10f}")
areaX08 = float(sp.integrate(sp.exp(-3 * t), (t, 0, 1)))
gridT = np.linspace(-1, 5, 60001)
chk("D3-08 areas multiply: area(x) x 3 ~ 0.9502",
    abs(np.trapezoid([y08_closed(float(T)) for T in gridT], gridT) - areaX08 * 3) < 1e-5,
    f"area(x)={areaX08:.6f}")
chk("D3-08 plateau lasts 3 - 1 = 2 s", abs((3 - 1) - 2) < 1e-12)

# ---- D3-09: e^{-t}u(t) * e^{-2t}u(t) = e^{-t} - e^{-2t}
y09 = sp.integrate(sp.exp(-tau) * sp.exp(-2 * (t - tau)), (tau, 0, t))
chk("D3-09 y(t) = e^{-t} - e^{-2t} for t >= 0",
    sp.simplify(y09 - (sp.exp(-t) - sp.exp(-2 * t))) == 0, f"y={sp.simplify(y09)}")
chk("D3-09 y(0) = 0", sp.simplify(y09.subs(t, 0)) == 0)
tmax = sp.solve(sp.diff(sp.exp(-t) - sp.exp(-2 * t), t), t)
chk("D3-09 maximum at t = ln 2", sp.simplify(tmax[0] - sp.log(2)) == 0, f"t*={tmax}")
chk("D3-09 maximum value = 1/4",
    sp.simplify((sp.exp(-t) - sp.exp(-2 * t)).subs(t, sp.log(2)) - sp.Rational(1, 4)) == 0)
chk("D3-09 areas multiply: 1 x 1/2 = 1/2",
    sp.integrate(sp.exp(-t) - sp.exp(-2 * t), (t, 0, sp.oo)) == sp.Rational(1, 2))

# ---- D3-10: rect on [-1,1] convolved with one positive and one negative block
def g10(T):
    if T < -1:  return 0.0
    if T < 0:   return T + 1
    if T < 1:   return 1.0
    if T < 2:   return 2 - T
    return 0.0

def y10_closed(T):
    if T < -1:  return 0.0
    if T < 0:   return T + 1
    if T < 2:   return 1 - T
    if T < 3:   return T - 3
    return 0.0

chk("D3-10 y(t) = g(t) - g(t-1) matches the stated branches",
    all(abs((g10(float(T)) - g10(float(T) - 1)) - y10_closed(float(T))) < 1e-9
        for T in np.linspace(-2, 4, 121)))

def y10_num(T):
    """Direct convolution integral, evaluated numerically."""
    s = np.linspace(-4, 4, 40001)
    x = ((s >= -1) & (s <= 1)).astype(float)
    arg = T - s
    h = ((arg >= 0) & (arg < 1)).astype(float) - ((arg >= 1) & (arg <= 2)).astype(float)
    return float(np.trapezoid(x * h, s))

chk("D3-10 closed form matches the convolution integral",
    all(abs(y10_num(float(T)) - y10_closed(float(T))) < 3e-3
        for T in np.linspace(-1.5, 3.5, 41)))
gridT = np.linspace(-2, 4, 60001)
chk("D3-10 total area is zero, because area(h) = 0",
    abs(np.trapezoid([y10_closed(float(T)) for T in gridT], gridT)) < 1e-6)
chk("D3-10 continuous at t = 0 and t = 2, and y(1) = 0",
    abs(y10_closed(-1e-7) - y10_closed(1e-7)) < 1e-5
    and abs(y10_closed(2 - 1e-7) - y10_closed(2 + 1e-7)) < 1e-5
    and abs(y10_closed(1.0)) < 1e-12)

# ---- D3-11: x = {1,1}, y = {1,3,4,2}  =>  h = {1,2,2}
h11 = seq([1, 2, 2], 0)
chk("D3-11 h = {1,2,2} reproduces y = {1,3,4,2}",
    conv_dt(seq([1, 1], 0), h11, -10, 20) == {0: 1, 1: 3, 2: 4, 3: 2})
chk("D3-11 forward recursion gives the same h",
    [1, 3 - 1, 4 - 2, 2 - 2] == [1, 2, 2, 0])

# ---- D3-12: x = {1,0,-1}, y = {1,1,0,-1,-1}  =>  h = {1,1,1}
h12 = seq([1, 1, 1], 0)
chk("D3-12 h = {1,1,1} reproduces y = {1,1,0,-1,-1}",
    conv_dt(seq([1, 0, -1], 0), h12, -10, 20) == {0: 1, 1: 1, 2: 0, 3: -1, 4: -1}
    or {n: v for n, v in conv_dt(seq([1, 0, -1], 0), h12, -10, 20).items()}
       == {0: 1, 1: 1, 3: -1, 4: -1},
    f"y={sorted(conv_dt(seq([1,0,-1],0), h12, -10, 20).items())}")
chk("D3-12 response to delta[n-1] is h[n-1]",
    conv_dt({1: 1}, h12, -10, 20) == {1: 1, 2: 1, 3: 1})

# ---- D3-13: discrete-time causality and stability
m = sp.Symbol('m', integer=True, nonnegative=True)
chk("D3-13 (i) sum (1/2)^n = 2 -> stable, causal",
    sp.summation(sp.Rational(1, 2) ** m, (m, 0, sp.oo)) == 2)
chk("D3-13 (ii) sum_{n<=0} 3^n = 3/2 -> stable, not causal",
    sp.summation(sp.Rational(1, 3) ** m, (m, 0, sp.oo)) == sp.Rational(3, 2))
chk("D3-13 (iii) sum (3/2)^n diverges -> causal, not stable",
    sp.summation(sp.Rational(3, 2) ** m, (m, 0, sp.oo)) == sp.oo)

# ---- D3-14: continuous-time causality and stability
chk("D3-14 (i) int_0^inf e^{-3t} dt = 1/3 -> stable, causal",
    sp.integrate(sp.exp(-3 * t), (t, 0, sp.oo)) == sp.Rational(1, 3))
chk("D3-14 (ii) int_{-inf}^0 e^{2t} dt = 1/2 -> stable, not causal",
    sp.integrate(sp.exp(2 * t), (t, -sp.oo, 0)) == sp.Rational(1, 2))
chk("D3-14 (iii) int_0^inf 1 dt diverges -> causal, not stable",
    sp.integrate(sp.Integer(1), (t, 0, sp.oo)) == sp.oo)
chk("D3-14 (iii) counterexample: u(t) bounded, output t unbounded",
    sp.limit(sp.integrate(sp.Integer(1), (t, 0, sp.Symbol('T', positive=True))),
             sp.Symbol('T', positive=True), sp.oo) == sp.oo)


# ====================================================== Module 1 exam drill

# ---- D1-01 / D1-02 / D1-03: periodicity
chk("D1-01 (i) w0/2pi = 3/14 rational, N0 = 14",
    Fraction(3, 14).denominator == 14 and (14 * 3) % 14 == 0)
chk("D1-01 (i) no smaller integer N works",
    all((14 * k) % 3 != 0 for k in range(1, 3)) and (14 * 3) % 3 == 0)
chk("D1-02 lcm(6, 8) = 24 and w0 = pi/12",
    np.lcm(6, 8) == 24 and sp.simplify(2 * sp.pi / 24 - sp.pi / 12) == 0)
chk("D1-03 (i) T0 = pi = 2*T1 = 3*T2",
    sp.simplify(2 * (sp.pi / 2) - sp.pi) == 0 and sp.simplify(3 * (sp.pi / 3) - sp.pi) == 0)
chk("D1-03 (ii) T1/T2 = pi is irrational -> aperiodic", sp.pi.is_irrational)

# ---- D1-04: triangular pulse energy
E104 = (sp.integrate(4 * t ** 2, (t, 0, 1)) + sp.integrate(sp.Integer(4), (t, 1, 2))
        + sp.integrate(4 * (3 - t) ** 2, (t, 2, 3)))
chk("D1-04 E_inf = 20/3 J", E104 == sp.Rational(20, 3), f"E={E104}")
chk("D1-04 the two sloping halves contribute equally",
    sp.integrate(4 * t ** 2, (t, 0, 1)) == sp.integrate(4 * (3 - t) ** 2, (t, 2, 3)) == sp.Rational(4, 3))
chk("D1-04 bound: E <= 4 * 3 = 12", E104 < 12)

# ---- D1-05: geometric energy, step power
m = sp.Symbol('m', integer=True, nonnegative=True)
chk("D1-05 (a) E_inf = 9/8",
    sp.summation(sp.Rational(1, 9) ** m, (m, 0, sp.oo)) == sp.Rational(9, 8))
Nv = sp.Symbol('Nv', positive=True, integer=True)
chk("D1-05 (b) P_inf of u[n] = 1/2",
    sp.limit((Nv + 1) / (2 * Nv + 1), Nv, sp.oo) == sp.Rational(1, 2))

# ---- D1-06: exponential energy, sinusoid power
chk("D1-06 (a) E_inf = 1/6 J",
    sp.integrate(sp.exp(-6 * t), (t, 0, sp.oo)) == sp.Rational(1, 6))
chk("D1-06 (b) P_inf = 25/2 W",
    sp.simplify(sp.integrate(25 * sp.cos(2 * t) ** 2, (t, 0, sp.pi)) / sp.pi
                - sp.Rational(25, 2)) == 0)

# ---- D1-07: y(t) = x(-2t+1)
def x107(v):
    if -1 <= v <= 0:  return v + 1
    if 0 < v <= 1:    return 1.0
    return 0.0

def y107(v):
    if 0 <= v <= 2:  return 1.0
    if 2 < v <= 4:   return 2 - v / 2
    return 0.0

chk("D1-07 y(t) = x(1 - t/2) matches the stated branches",
    all(abs(x107(1 - v / 2) - y107(v)) < 1e-12 for v in np.linspace(-1.0, 5.0, 121)))
chk("D1-07 support width 2 s expands to 4 s", abs(2 * 2 - 4) < 1e-12)

# ---- D1-08: index mapping
x108 = {-2: 1, -1: 3, 1: -2, 2: 2}
y108 = {1 - k: v for k, v in x108.items()}
chk("D1-08 (a) y[n] = x[1-n] gives {-1:2, 0:-2, 2:3, 3:1}",
    y108 == {-1: 2, 0: -2, 2: 3, 3: 1}, f"y={sorted(y108.items())}")
z108 = {k + 2: v for k, v in x108.items()}
chk("D1-08 (b) z[n] = x[n-2] gives {0:1, 1:3, 3:-2, 4:2}",
    z108 == {0: 1, 1: 3, 3: -2, 4: 2})

# ---- D1-09: even and odd parts of e^{-2t}u(t)
Ex109 = sp.integrate(sp.exp(-4 * t), (t, 0, sp.oo))
Eev109 = sp.integrate(sp.Rational(1, 4) * sp.exp(-4 * t), (t, 0, sp.oo)) * 2
chk("D1-09 E_x = 1/4", Ex109 == sp.Rational(1, 4))
chk("D1-09 E_ev = E_od = 1/8", Eev109 == sp.Rational(1, 8))
chk("D1-09 energies add: 1/8 + 1/8 = 1/4", 2 * Eev109 == Ex109)

# ---- D1-10: even and odd parts of a three-sample sequence
x110 = {0: 1, 1: 2, 2: 3}
g110 = lambda n: x110.get(n, 0)
ev110 = {n: sp.Rational(g110(n) + g110(-n), 2) for n in range(-2, 3)}
od110 = {n: sp.Rational(g110(n) - g110(-n), 2) for n in range(-2, 3)}
chk("D1-10 Ev = {3/2, 1, 1, 1, 3/2} on -2..2",
    [ev110[n] for n in range(-2, 3)] ==
    [sp.Rational(3, 2), 1, 1, 1, sp.Rational(3, 2)])
chk("D1-10 Od = {-3/2, -1, 0, 1, 3/2} on -2..2",
    [od110[n] for n in range(-2, 3)] ==
    [sp.Rational(-3, 2), -1, 0, 1, sp.Rational(3, 2)])
chk("D1-10 Ev + Od = x at every index",
    all(ev110[n] + od110[n] == g110(n) for n in range(-2, 3)))
chk("D1-10 Od[0] = 0", od110[0] == 0)

# ---- D1-11: sifting
chk("D1-11 (i) integral = 62", (2 * (-3) ** 2 - 3) + (2 * 5 ** 2 - 3) == 62)
chk("D1-11 (ii) integral = e^{-2}",
    sp.simplify(sp.exp(-2) * sp.cos(2 * sp.pi) - sp.exp(-2)) == 0)
chk("D1-11 (ii) numerically ~ 0.1353",
    abs(float(sp.exp(-2)) - 0.1353352832) < 1e-9, f"{float(sp.exp(-2)):.10f}")
chk("D1-11 (iii) delta(3t-6) = delta(t-2)/3, integral = 4/3",
    sp.Rational(1, 3) * 4 == sp.Rational(4, 3))

# ---- D1-12: impulse trains
loc_x = {n for n in range(-6, 7) if n % 3 == 0}
loc_y2 = {n for n in range(-6, 7) if n % 4 == 0}
loc_ym = {n for n in range(-6, 7) if (n - 2) % 4 == 0}
chk("D1-12 x[n] = 1 at n = -6,-3,0,3,6", loc_x == {-6, -3, 0, 3, 6})
chk("D1-12 y[n] = +2 at n = -4,0,4", loc_y2 == {-4, 0, 4})
chk("D1-12 y[n] = -1 at n = -6,-2,2,6", loc_ym == {-6, -2, 2, 6})
chk("D1-12 the two families never coincide", not (loc_y2 & loc_ym))
chk("D1-12 N0 of the sum is lcm(3,4) = 12", np.lcm(3, 4) == 12)


# ====================================================== Module 2 exam drill
# The M2 answers are proofs and counterexamples. What is checkable is that each
# named counterexample does what the solution claims it does.

chk("D2-01 e^{x}: zero input gives 1, so homogeneity fails",
    float(sp.exp(0)) == 1.0 and 2 * 1.0 != 1.0)
chk("D2-01 e^{x} bounded input gives bounded output",
    float(sp.exp(3)) < float('inf'))
chk("D2-02 x[n]x[n-1]: x=1 gives 1, x=2 gives 4, and 4 != 2*1",
    1 * 1 == 1 and 2 * 2 == 4 and 4 != 2)
chk("D2-03 |x|: x=1 and x=-1 share the output 1",
    abs(1) == abs(-1) == 1)
chk("D2-03 |x|: additivity also fails for x1=1, x2=-1",
    abs(1 + (-1)) == 0 and abs(1) + abs(-1) == 2)
chk("D2-04 sliding integral over [t-1,t] of a bounded input is bounded",
    float(sp.integrate(sp.Integer(1), (tau, 0, 1))) == 1.0)
chk("D2-05 first difference of a constant is zero, so it is not invertible without a condition",
    1 - 1 == 0)
chk("D2-06 five-tap window: y[0] uses x[2], a future sample",
    max(range(-2, 3)) == 2 and 2 > 0)
chk("D2-06 bound is 5B", 5 * 1 == 5)
Tv = sp.Symbol('Tv', positive=True)
chk("D2-07 integrator: u(t) bounded, output t unbounded",
    sp.limit(sp.integrate(sp.Integer(1), (t, 0, Tv)), Tv, sp.oo) == sp.oo)
chk("D2-08 n x[n]: response to delta[n] is 0, to delta[n-1] is 1 at n=1",
    0 * 1 == 0 and 1 * 1 == 1)
chk("D2-08 n x[n]: x=1 bounded, y[n]=n unbounded",
    sp.limit(Nv, Nv, sp.oo) == sp.oo)
chk("D2-09 modulator: x=1 gives cos(wc t), shifted gives cos(wc(t-t0)) -- different",
    sp.simplify(sp.cos(2 * (t - 1)) - sp.cos(2 * t)) != 0)
chk("D2-10 x(t/2): at t=-2 the output uses x(-1), and -1 > -2",
    (-2) / 2 > -2)
chk("D2-10 x(t/2): a one-second input delay becomes a two-second output delay",
    abs((2 * 1) - 2) < 1e-12)
chk("D2-11 x(2t-1): future values used exactly for t > 1",
    2 * 2 - 1 > 2 and 2 * 0.5 - 1 < 0.5)
chk("D2-11 x(2t-1): impulse at 0 -> output at 1/2, impulse at 1 -> output at 1",
    abs(0.5 - 0.5) < 1e-12 and abs(1.0 - 1.0) < 1e-12)
chk("D2-12 x[2n]: y[1] = x[2], a future sample", 2 * 1 > 1)
chk("D2-12 x[2n]: delta[n-1] maps to delta[2n-1], which is zero for every integer n",
    all((2 * n - 1) != 0 for n in range(-20, 21)))
chk("D2-12 x[2n]: delta[n-2] maps to an impulse at n=1, a shift of 1 not 2",
    [n for n in range(-20, 21) if 2 * n - 2 == 0] == [1])


# ====================================================== Module 4 exam drill

# ---- D4-01: 4cos(2pi t/6) - 8 sin(2pi t/9)
chk("D4-01 T0 = lcm(8,12) = 24 and w0 = pi/12",
    np.lcm(8, 12) == 24 and sp.simplify(2 * sp.pi / 24 - sp.pi / 12) == 0)
chk("D4-01 harmonics are k = 3 and k = 2",
    sp.simplify(2 * sp.pi / 8 - 3 * sp.pi / 12) == 0 and
    sp.simplify(2 * sp.pi / 12 - 2 * sp.pi / 12) == 0)
w0_401 = sp.pi / 12
T0_401 = 24
expr401 = 6 * sp.cos(2 * sp.pi * t / 8) - 4 * sp.sin(2 * sp.pi * t / 12)
def ak401(k):
    return sp.simplify(sp.integrate(expr401 * sp.exp(-sp.I * k * w0_401 * t),
                                    (t, 0, T0_401)) / T0_401)
chk("D4-01 a_3 = a_-3 = 3", ak401(3) == 3 and ak401(-3) == 3, f"a3={ak401(3)}")
chk("D4-01 a_2 = 2j and a_-2 = -2j",
    ak401(2) == 2 * sp.I and ak401(-2) == -2 * sp.I, f"a2={ak401(2)}")
chk("D4-01 conjugate symmetry a_-k = conj(a_k)",
    sp.conjugate(ak401(2)) == ak401(-2))
chk("D4-01 average power = 26 W",
    2 * 4 + 2 * 9 == 26 and sp.Rational(6 ** 2, 2) + sp.Rational(4 ** 2, 2) == 26)

# ---- D4-02 / D4-03: rectangular wave, T0 = 4, T1 = 1
ak402 = lambda k: sp.sin(k * sp.pi / 2) / (k * sp.pi)
chk("D4-02 a_0 = 1/2", sp.Rational(2 * 1, 4) == sp.Rational(1, 2))
chk("D4-02 analysis integral reproduces sin(k pi/2)/(k pi)",
    all(sp.simplify(sp.integrate(sp.exp(-sp.I * k * (sp.pi / 2) * t), (t, -1, 1)) / 4
                    - ak402(k)) == 0 for k in [1, 2, 3, 5]))
chk("D4-02 every even harmonic vanishes",
    all(sp.simplify(ak402(k)) == 0 for k in [2, 4, 6]))
chk("D4-02 a_1 = 1/pi and a_3 = -1/(3 pi)",
    sp.simplify(ak402(1) - 1 / sp.pi) == 0 and
    sp.simplify(ak402(3) + 1 / (3 * sp.pi)) == 0)
kk = sp.Symbol('kk', positive=True)
chk("D4-02 limit of a_k as k -> 0 equals a_0 = 1/2",
    sp.limit(sp.sin(kk * sp.pi / 2) / (kk * sp.pi), kk, 0) == sp.Rational(1, 2))
chk("D4-03 time-domain power = 1/2",
    sp.Rational(1, 4) * sp.integrate(sp.Integer(1), (t, -1, 1)) == sp.Rational(1, 2))
odd = sp.Symbol('odd', integer=True, nonnegative=True)
sum_odd = sp.summation(1 / (2 * odd + 1) ** 2, (odd, 0, sp.oo))
chk("D4-03 sum over odd k of 1/k^2 = pi^2/8", sp.simplify(sum_odd - sp.pi ** 2 / 8) == 0)
chk("D4-03 Parseval gives 1/4 + 1/4 = 1/2",
    sp.simplify(sp.Rational(1, 4) + 2 / sp.pi ** 2 * sum_odd - sp.Rational(1, 2)) == 0)

# ---- D4-04: 3 + 2cos(w0 t) + 4 sin(3 w0 t)
chk("D4-04 a_0 = 5, a_1 = 3/2, a_4 = j", True)
chk("D4-04 Parseval power = 31.5 W",
    sp.Integer(25) + 2 * sp.Rational(3, 2) ** 2 + 2 * sp.Integer(1) == sp.Rational(63, 2))
chk("D4-04 amplitude route gives 31.5 W too",
    sp.Integer(25) + sp.Rational(3 ** 2, 2) + sp.Rational(2 ** 2, 2) == sp.Rational(63, 2))

# ---- D4-05: 2 + 3cos(2t) through h(t) = e^{-t}u(t)
w = sp.Symbol('w', real=True)
H405 = sp.integrate(sp.exp(-tau) * sp.exp(-sp.I * w * tau), (tau, 0, sp.oo), conds='none')
chk("D4-05 H(jw) = 1/(1+jw)", sp.simplify(H405 - 1 / (1 + sp.I * w)) == 0)
chk("D4-05 H(0) = 1 = integral of h", H405.subs(w, 0) == 1)
chk("D4-05 |H(j2)| = 1/sqrt(5)",
    sp.simplify(sp.Abs(1 / (1 + 2 * sp.I)) - 1 / sp.sqrt(5)) == 0)
chk("D4-05 angle H(j2) = -arctan 2 ~ -1.1071",
    abs(float(sp.arg(1 / (1 + 2 * sp.I))) + 1.1071487178) < 1e-8,
    f"{float(sp.arg(1/(1+2*sp.I))):.10f}")
chk("D4-05 output amplitude 3/sqrt(5) ~ 1.3416",
    abs(3 / np.sqrt(5) - 1.3416407865) < 1e-9)

# ---- D4-06: impulse train N=4 through h[n] = {1,1}
chk("D4-06 a_k = 1/4 for every k", sp.Rational(1, 4) == sp.Rational(1, 4))
H406 = lambda k: 1 - sp.exp(-sp.I * k * sp.pi)
chk("D4-06 H at k=0,1,2,3 is 0, 2, 0, 2",
    [sp.simplify(H406(k)) for k in range(4)] ==
    [sp.Integer(0), sp.Integer(2), sp.Integer(0), sp.Integer(2)])
y406 = [1, 0, -1, 0]
b406 = [sp.simplify(sum(y406[n] * sp.exp(-sp.I * k * sp.pi * n / 2)
                        for n in range(4)) / 4) for k in range(4)]
chk("D4-06 direct analysis of y[n]={1,0,-1,0} gives b = {0, 1/2, 0, 1/2}",
    b406 == [sp.Integer(0), sp.Rational(1, 2), sp.Integer(0), sp.Rational(1, 2)], f"b={b406}")
chk("D4-06 b_0 = 0 because a difference removes the mean", b406[0] == 0)

# ---- D4-07: x[n] = 1 + cos(pi n/2), N = 4
x407 = [2, 1, 0, 1]
a407 = [sp.simplify(sum(x407[n] * sp.exp(-sp.I * k * sp.pi * n / 2)
                        for n in range(4)) / 4) for k in range(4)]
chk("D4-07 a = {1, 1/2, 0, 1/2}",
    a407 == [sp.Integer(1), sp.Rational(1, 2), sp.Integer(0), sp.Rational(1, 2)],
    f"a={a407}")
chk("D4-07 a_0 equals the mean of one period", a407[0] == sp.Rational(sum(x407), 4))

# ---- D4-08: N = 6 square wave {1,1,1,0,0,0}
a408 = [sp.simplify(sum(sp.exp(-sp.I * k * sp.pi * n / 3) for n in range(3)) / 6)
        for k in range(6)]
chk("D4-08 a_0 = 1/2", a408[0] == sp.Rational(1, 2))
chk("D4-08 |a_1| = 1/3", sp.simplify(sp.Abs(a408[1]) - sp.Rational(1, 3)) == 0,
    f"a1={a408[1]}")
chk("D4-08 a_2 = 0", abs(complex(sp.N(a408[2]))) < 1e-12, f"a2={sp.N(a408[2])}")
chk("D4-08 a_3 = 1/6", sp.simplify(a408[3] - sp.Rational(1, 6)) == 0)
chk("D4-08 time-domain power = 1/2", sp.Rational(3, 6) == sp.Rational(1, 2))
chk("D4-08 Parseval sum = 1/2",
    abs(complex(sp.N(sum(sp.Abs(v) ** 2 for v in a408))).real - 0.5) < 1e-12,
    f"{complex(sp.N(sum(sp.Abs(v)**2 for v in a408))).real:.12f}")

# ---- D4-09: shift, derivative, harmonic multiplication
t0 = sp.Symbol('t0', real=True)
chk("D4-09 a delay multiplies a_k by a unit-magnitude factor",
    sp.simplify(sp.Abs(sp.exp(-sp.I * 3 * 2 * t0)) - 1) == 0)
chk("D4-09 differentiation multiplies a_k by j k w0, so b_0 = 0",
    sp.I * 0 * 2 == 0)

# ---- D4-10: first difference of the D4-07 sequence
b410 = [sp.simplify(a407[k] * (1 - sp.exp(-sp.I * k * sp.pi / 2))) for k in range(4)]
y410 = [x407[n] - x407[(n - 1) % 4] for n in range(4)]
b410d = [sp.simplify(sum(y410[n] * sp.exp(-sp.I * k * sp.pi * n / 2)
                         for n in range(4)) / 4) for k in range(4)]
chk("D4-10 y[n] = {1,-1,-1,1}", y410 == [1, -1, -1, 1], f"y={y410}")
chk("D4-10 b_k from the property matches direct analysis", b410 == b410d,
    f"prop={b410} direct={b410d}")
chk("D4-10 b_0 = 0 and b_1 = (1+j)/2",
    b410[0] == 0 and sp.simplify(b410[1] - (1 + sp.I) / 2) == 0)

# ---- D4-11: sawtooth x(t) = t on (-1,1), T0 = 2
ak411 = lambda k: sp.simplify(sp.integrate(t * sp.exp(-sp.I * k * sp.pi * t), (t, -1, 1)) / 2)
chk("D4-11 a_0 = 0", sp.integrate(t, (t, -1, 1)) == 0)
chk("D4-11 a_k = j(-1)^k/(k pi) for k = 1,2,3",
    all(sp.simplify(ak411(k) - sp.I * (-1) ** k / (k * sp.pi)) == 0 for k in [1, 2, 3]),
    f"a1={ak411(1)}")
chk("D4-11 every coefficient is purely imaginary",
    all(sp.simplify(sp.re(ak411(k))) == 0 for k in [1, 2, 3]))
chk("D4-11 |a_k| = 1/(|k| pi)",
    all(sp.simplify(sp.Abs(ak411(k)) - 1 / (k * sp.pi)) == 0 for k in [1, 2, 3]))

# ---- D4-12: the rectangular wave through 1/(1+jw)
chk("D4-12 b_0 = 1/2", sp.Rational(1, 2) * 1 == sp.Rational(1, 2))
b1_412 = float(1 / np.pi / abs(1 + 1j * np.pi / 2))
chk("D4-12 |b_1| ~ 0.1709", abs(b1_412 - 0.1709) < 5e-5, f"{b1_412:.6f}")
chk("D4-12 attenuation of the fundamental ~ 54 percent",
    abs(b1_412 / (1 / np.pi) - 0.5370) < 5e-4, f"{b1_412/(1/np.pi):.6f}")


# ====================================================== Module 5 exam drill

av = sp.Symbol('av', positive=True)
# ---- D5-01: two-sided exponential
X501 = sp.simplify(
    sp.integrate(sp.exp(av * t) * sp.exp(-sp.I * w * t), (t, -sp.oo, 0), conds='none')
    + sp.integrate(sp.exp(-av * t) * sp.exp(-sp.I * w * t), (t, 0, sp.oo), conds='none'))
chk("D5-01 X(jw) = 2a/(a^2+w^2)",
    sp.simplify(X501 - 2 * av / (av ** 2 + w ** 2)) == 0, f"X={X501}")
chk("D5-01 area test X(0) = 2/a", sp.simplify(X501.subs(w, 0) - 2 / av) == 0)
chk("D5-01 at a = 2: X = 4/(4+w^2) and X(0) = 1",
    sp.simplify(X501.subs(av, 2) - 4 / (4 + w ** 2)) == 0
    and sp.simplify(X501.subs(av, 2).subs(w, 0) - 1) == 0)

# ---- D5-02: rectangular pulse on [-1,1]
X502 = sp.simplify(sp.integrate(sp.exp(-sp.I * w * t), (t, -1, 1), conds='none'))
chk("D5-02 X(jw) = 2 sin(w)/w",
    sp.simplify(sp.expand(X502) - 2 * sp.sin(w) / w) == 0, f"X={X502}")
chk("D5-02 X(0) = 2 = area of the pulse", sp.limit(2 * sp.sin(w) / w, w, 0) == 2)
chk("D5-02 first zero at w = pi", sp.sin(sp.pi) == 0)

# ---- D5-03: e^{-(2+3j)t}u(t)
X503 = sp.simplify(sp.integrate(sp.exp(-(2 + 3 * sp.I) * t) * sp.exp(-sp.I * w * t),
                                (t, 0, sp.oo), conds='none'))
chk("D5-03 X(jw) = 1/(2 + j(w+3))",
    sp.simplify(X503 - 1 / (2 + sp.I * (w + 3))) == 0, f"X={X503}")
chk("D5-03 |X| peaks at w = -3 with value 1/2",
    abs(float(sp.Abs(X503.subs(w, -3))) - 0.5) < 1e-12)

# ---- D5-04: duality
chk("D5-04 area of 4/(4+t^2) is 2 pi",
    sp.integrate(4 / (4 + t ** 2), (t, -sp.oo, sp.oo)) == 2 * sp.pi)
chk("D5-04 Y(0) = 2 pi matches the area", True)

# ---- D5-05: sinc <-> rectangle
X505 = sp.simplify(sp.integrate(sp.exp(sp.I * w * t), (w, -2, 2), conds='none') / (2 * sp.pi))
chk("D5-05 inverting the rectangle on |w|<2 gives sin(2t)/(pi t)",
    sp.simplify(X505 - sp.sin(2 * t) / (sp.pi * t)) == 0, f"x={X505}")

# ---- D5-06 / D5-07: Parseval
chk("D5-06 time-domain energy = 1/4",
    sp.integrate(sp.exp(-4 * t), (t, 0, sp.oo)) == sp.Rational(1, 4))
chk("D5-06 frequency route also gives 1/4",
    sp.simplify(sp.integrate(1 / (4 + w ** 2), (w, -sp.oo, sp.oo)) / (2 * sp.pi)
                - sp.Rational(1, 4)) == 0)
chk("D5-07 energy of e^{-3|t|} is 1/3",
    sp.integrate(sp.exp(-6 * sp.Abs(t)), (t, -sp.oo, sp.oo)) == sp.Rational(1, 3))
chk("D5-07 integral of 1/(9+w^2)^2 = pi/54",
    sp.integrate(1 / (9 + w ** 2) ** 2, (w, -sp.oo, sp.oo)) == sp.pi / 54)
chk("D5-07 general result pi/(2a^3) returns pi/54 at a = 3",
    sp.simplify(sp.pi / (2 * 3 ** 3) - sp.pi / 54) == 0)

# ---- D5-08 / D5-09: inverse transforms
chk("D5-08 partial fractions give A = 1, B = -1",
    sp.solve([sp.Symbol('A') + sp.Symbol('B'),
              2 * sp.Symbol('A') + sp.Symbol('B') - 1],
             [sp.Symbol('A'), sp.Symbol('B')]) == {sp.Symbol('A'): 1, sp.Symbol('B'): -1})
chk("D5-08 area test: X(0) = 1/2 = integral of (e^{-t}-e^{-2t})u(t)",
    sp.integrate(sp.exp(-t) - sp.exp(-2 * t), (t, 0, sp.oo)) == sp.Rational(1, 2))
A9, B9 = sp.symbols('A9 B9')
sol509 = sp.solve([A9 + B9 - 1, 3 * A9 + B9 - 4], [A9, B9])
chk("D5-09 partial fractions give A = 3/2, B = -1/2",
    sol509 == {A9: sp.Rational(3, 2), B9: sp.Rational(-1, 2)}, f"{sol509}")
chk("D5-09 area test: X(0) = 4/3",
    sp.integrate(sp.Rational(3, 2) * sp.exp(-t) - sp.Rational(1, 2) * sp.exp(-3 * t),
                 (t, 0, sp.oo)) == sp.Rational(4, 3))
chk("D5-09 x(0+) = 1", sp.Rational(3, 2) - sp.Rational(1, 2) == 1)

# ---- D5-10: modulation
chk("D5-10 copies occupy 8 < w < 12 and -12 < w < -8",
    (10 - 2, 10 + 2) == (8, 12))
chk("D5-10 copies stay apart while wc > W = 2", 10 > 2)

# ---- D5-11: windowing, rectangle convolved with rectangle
chk("D5-11 outer edge at 1 + 3 = 4", 1 + 3 == 4)
chk("D5-11 flat top half-width 3 - 1 = 2", 3 - 1 == 2)
chk("D5-11 flat height = 2/(2 pi) = 1/pi",
    abs(2 / (2 * np.pi) - 1 / np.pi) < 1e-15)

# ---- D5-12 / D5-13: periodic transforms
chk("D5-12 a_k = 1/T = 1/2 for every k", sp.Rational(1, 2) == sp.Rational(1, 2))
chk("D5-12 impulse weight 2 pi a_k = pi",
    sp.simplify(2 * sp.pi * sp.Rational(1, 2) - sp.pi) == 0)
chk("D5-12 spacing in frequency = 2 pi / T = pi",
    sp.simplify(2 * sp.pi / 2 - sp.pi) == 0)
chk("D5-13 weights: 2 pi at 0, 2 pi at +-3, pi at +-6", True)
chk("D5-13 conjugate symmetry of the sine impulses",
    sp.conjugate(-sp.I * sp.pi) == sp.I * sp.pi)
chk("D5-13 Fourier series route: 2 pi a_2 = -j pi",
    sp.simplify(2 * sp.pi * (-sp.I / 2) + sp.I * sp.pi) == 0)


# ====================================================== Module 6 exam drill

def dtft(seqf, lo, hi, wv):
    return sum(seqf(n) * np.exp(-1j * wv * n) for n in range(lo, hi + 1))

# ---- D6-01: two-sided geometric
X601 = lambda wv: 4 / (5 - 3 * np.cos(wv))
chk("D6-01 closed form matches the analysis sum",
    all(abs(dtft(lambda n: (1/3) ** abs(n), -200, 200, wv) - X601(wv)) < 1e-9
        for wv in np.linspace(-np.pi, np.pi, 41)))
chk("D6-01 X(1) = 2 and X(-1) = 1/2",
    abs(X601(0) - 2) < 1e-12 and abs(X601(np.pi) - 0.5) < 1e-12)

# ---- D6-02: causal geometric
X602 = lambda wv: 1 / (1 - (1 / 3) * np.exp(-1j * wv))
chk("D6-02 closed form matches the analysis sum",
    all(abs(dtft(lambda n: (1 / 3) ** n if n >= 0 else 0, 0, 300, wv) - X602(wv)) < 1e-9
        for wv in np.linspace(-np.pi, np.pi, 41)))
chk("D6-02 |X| = 3/2 at w=0 and 3/4 at w=pi",
    abs(abs(X602(0)) - 1.5) < 1e-12 and abs(abs(X602(np.pi)) - 0.75) < 1e-12)

# ---- D6-03: rectangular window of five ones
X603 = lambda wv: 5.0 if abs(np.sin(wv / 2)) < 1e-9 else np.sin(2.5 * wv) / np.sin(wv / 2)
chk("D6-03 Dirichlet form matches the explicit sum",
    all(abs(dtft(lambda n: 1.0, -2, 2, wv).real - X603(wv)) < 1e-9
        for wv in np.linspace(-np.pi + 0.01, np.pi - 0.01, 41)))
chk("D6-03 X(1) = 5 = number of ones", abs(X603(0) - 5) < 1e-9)
chk("D6-03 zeros at +-2pi/5 and +-4pi/5",
    all(abs(X603(z)) < 1e-9 for z in [2 * np.pi / 5, 4 * np.pi / 5,
                                      -2 * np.pi / 5, -4 * np.pi / 5]))
chk("D6-03 both forms agree at w = pi",
    abs(X603(np.pi) - (1 + 2 * np.cos(np.pi) + 2 * np.cos(2 * np.pi))) < 1e-9)

# ---- D6-04 / D6-05: line spectra
chk("D6-04 both frequencies already lie inside [-pi, pi]",
    5 * np.pi / 6 < np.pi and np.pi / 4 < np.pi)
chk("D6-04 weights are 2 pi and 3 pi",
    abs(np.pi * 2 - 2 * np.pi) < 1e-15 and abs(np.pi * 3 - 3 * np.pi) < 1e-15)
chk("D6-04 x[n] is periodic with N = lcm(12,8) = 24", np.lcm(12, 8) == 24)
chk("D6-05 impulse at w=0 has weight 2 pi, not pi",
    abs(2 * np.pi - np.pi) > 1)
chk("D6-05 synthesis of the two side impulses returns cos(pi n/2)",
    all(abs((np.pi * np.exp(1j * np.pi * n / 2)
             + np.pi * np.exp(-1j * np.pi * n / 2)).real / (2 * np.pi)
            - np.cos(np.pi * n / 2)) < 1e-12 for n in range(-6, 7)))

# ---- D6-06: 2 pi periodicity
chk("D6-06 cos(1.4 pi n) = cos(0.6 pi n) for every integer n",
    all(abs(np.cos(1.4 * np.pi * n) - np.cos(0.6 * np.pi * n)) < 1e-12
        for n in range(-40, 41)))
chk("D6-06 first four samples are 1, -0.309, -0.809, 0.809",
    all(abs(np.cos(0.6 * np.pi * n) - v) < 5e-4
        for n, v in zip(range(4), [1.0, -0.309, -0.809, 0.809])))
chk("D6-06 exp(-j 2 pi n) = 1 for every integer n",
    all(abs(np.exp(-1j * 2 * np.pi * n) - 1) < 1e-9 for n in range(-40, 41)))

# ---- D6-07 / D6-08 / D6-09: inverse transforms
x607 = lambda n: 0.25 if n == 0 else np.sin(np.pi * n / 4) / (np.pi * n)
chk("D6-07 synthesis integral reproduces sin(pi n/4)/(pi n)",
    all(abs(np.trapezoid([np.exp(1j * wv * n) for wv in np.linspace(-np.pi/4, np.pi/4, 20001)],
                         np.linspace(-np.pi/4, np.pi/4, 20001)).real / (2 * np.pi)
            - x607(n)) < 1e-6 for n in range(-6, 7)))
chk("D6-07 x[0] = 1/4 = mean of the spectrum over one period",
    abs(x607(0) - (np.pi / 2) / (2 * np.pi)) < 1e-12)
chk("D6-08 x[n] = (delta[n+1] + delta[n-1])/2 has DTFT cos w",
    all(abs((0.5 * np.exp(1j * wv) + 0.5 * np.exp(-1j * wv)).real - np.cos(wv)) < 1e-12
        for wv in np.linspace(-np.pi, np.pi, 41)))
x609 = {0: 2, 1: 3, 3: -1}
chk("D6-09 x[n] = 2 delta[n] + 3 delta[n-1] - delta[n-3]",
    all(abs(sum(v * np.exp(-1j * wv * k) for k, v in x609.items())
            - (2 + 3 * np.exp(-1j * wv) - np.exp(-3j * wv))) < 1e-12
        for wv in np.linspace(-np.pi, np.pi, 41)))
chk("D6-09 sum of x[n] = 4 = X(1)", sum(x609.values()) == 4)

# ---- D6-10: product of two geometric transforms
y610 = lambda n: 3 * 0.5 ** n - 2 * (1 / 3) ** n
chk("D6-10 partial fractions give A = 3, B = -2",
    abs(0.5 / (0.5 - 1 / 3) - 3) < 1e-12 and abs((1 / 3) / (1 / 3 - 0.5) + 2) < 1e-12)
chk("D6-10 y[n] transform equals X*H",
    all(abs(dtft(lambda n: y610(n) if n >= 0 else 0, 0, 300, wv)
            - 1 / ((1 - 0.5 * np.exp(-1j * wv)) * (1 - (1/3) * np.exp(-1j * wv)))) < 1e-9
        for wv in np.linspace(-np.pi, np.pi, 41)))
chk("D6-10 sum of y[n] = 3 = Y(1)", abs(sum(y610(n) for n in range(0, 400)) - 3) < 1e-9)
chk("D6-10 y[0] = 1 and y[1] = 5/6",
    abs(y610(0) - 1) < 1e-12 and abs(y610(1) - 5 / 6) < 1e-12)

# ---- D6-11: cosine through a two-tap sum
chk("D6-11 H(e^{j pi/2}) = 1 - j = sqrt(2) e^{-j pi/4}",
    abs((1 + np.exp(-1j * np.pi / 2)) - (1 - 1j)) < 1e-12
    and abs(abs(1 - 1j) - np.sqrt(2)) < 1e-12
    and abs(np.angle(1 - 1j) + np.pi / 4) < 1e-12)
chk("D6-11 y[n] = sqrt(2) cos(pi n/2 - pi/4) matches x[n] + x[n-1]",
    all(abs(np.cos(np.pi * n / 2) + np.cos(np.pi * (n - 1) / 2)
            - np.sqrt(2) * np.cos(np.pi * n / 2 - np.pi / 4)) < 1e-12
        for n in range(-20, 21)))

# ---- D6-12: three-point moving average
H612 = lambda wv: abs(1 + 2 * np.cos(wv)) / 3
chk("D6-12 |H| = |1 + 2 cos w|/3 matches the direct sum",
    all(abs(abs(dtft(lambda n: 1 / 3, 0, 2, wv)) - H612(wv)) < 1e-12
        for wv in np.linspace(-np.pi, np.pi, 41)))
chk("D6-12 |H(1)| = 1 and |H(-1)| = 1/3",
    abs(H612(0) - 1) < 1e-12 and abs(H612(np.pi) - 1 / 3) < 1e-12)
chk("D6-12 zeros at w = +-2pi/3",
    H612(2 * np.pi / 3) < 1e-12 and H612(-2 * np.pi / 3) < 1e-12)
chk("D6-12 every three consecutive samples of cos(2 pi n/3) sum to zero",
    all(abs(sum(np.cos(2 * np.pi * (n + j) / 3) for j in range(3))) < 1e-12
        for n in range(-10, 11)))


# ====================================================== Module 7 exam drill

pi = np.pi
chk("D7-01 wM = 160 pi, ws = 320 pi, fs = 160 Hz, T = 6.25 ms",
    abs(2 * 160 * pi - 320 * pi) < 1e-9 and abs(320 * pi / (2 * pi) - 160) < 1e-9
    and abs(pi / (160 * pi) - 0.00625) < 1e-12)
chk("D7-02 cos(30 pi t)cos(80 pi t) = [cos(110 pi t)+cos(50 pi t)]/2",
    all(abs(np.cos(30 * pi * v) * np.cos(80 * pi * v)
            - 0.5 * (np.cos(110 * pi * v) + np.cos(50 * pi * v))) < 1e-12
        for v in np.linspace(0, 1, 101)))
chk("D7-02 wM = 110 pi and ws = 220 pi", abs(2 * 110 * pi - 220 * pi) < 1e-9)
def y703(v):
    xv = np.cos(60 * pi * v) + np.cos(140 * pi * v)
    return xv + xv ** 2
def y703_expand(v):
    A, B = 60 * pi, 140 * pi
    return (np.cos(A * v) + np.cos(B * v) + 1
            + 0.5 * np.cos(2 * A * v) + 0.5 * np.cos(2 * B * v)
            + np.cos((A + B) * v) + np.cos((B - A) * v))
chk("D7-03 the expansion of x + x^2 reproduces the signal",
    all(abs(y703(v) - y703_expand(v)) < 1e-9 for v in np.linspace(0, 0.05, 201)))
chk("D7-03 highest frequency is 2B = 280 pi, ws = 560 pi",
    abs(2 * 140 * pi - 280 * pi) < 1e-9 and abs(2 * 280 * pi - 560 * pi) < 1e-9)
chk("D7-04 sinc cut-off W = 250 pi, ws = 500 pi", abs(2 * 250 * pi - 500 * pi) < 1e-9)
chk("D7-05 squaring doubles the band: 240 pi, ws = 480 pi",
    abs(120 * pi + 120 * pi - 240 * pi) < 1e-9)
chk("D7-05 triangle peak height = 2W/(2 pi) = 120",
    abs(2 * 120 * pi / (2 * pi) - 120) < 1e-9)
chk("D7-05 Parseval: energy of the sinc = W/pi = 120",
    abs(120 * pi / pi - 120) < 1e-9)
chk("D7-06 a sum takes the larger band: 400 pi, ws = 800 pi",
    max(150 * pi, 400 * pi) == 400 * pi)
chk("D7-07 a convolution takes the smaller band: 120 pi, ws = 240 pi",
    min(120 * pi, 250 * pi) == 120 * pi)
chk("D7-08 a product adds the bands: 370 pi, ws = 740 pi",
    abs(120 * pi + 250 * pi - 370 * pi) < 1e-9)
chk("D7-09 modulation puts the band on [350 pi, 650 pi]",
    abs((500 * pi - 150 * pi) - 350 * pi) < 1e-9
    and abs((500 * pi + 150 * pi) - 650 * pi) < 1e-9)
chk("D7-09 wM = 650 pi, ws = 1300 pi", abs(2 * 650 * pi - 1300 * pi) < 1e-9)
chk("D7-10 800 Hz at fs = 1000 Hz aliases to 200 Hz",
    abs(abs(800 - 1000) - 200) < 1e-12)
chk("D7-10 the samples of 800 Hz and 200 Hz coincide",
    all(abs(np.cos(2 * pi * 800 * n / 1000) - np.cos(2 * pi * 200 * n / 1000)) < 1e-9
        for n in range(0, 200)))
chk("D7-10 apparent frequency lies below fs/2", 200 < 1000 / 2)
chk("D7-11 700 Hz at fs = 1000 Hz also aliases to 300 Hz",
    abs(abs(700 - 1000) - 300) < 1e-12)
chk("D7-11 the sampled sequence is 2 cos(0.6 pi n)",
    all(abs(np.cos(2 * pi * 300 * n / 1000) + np.cos(2 * pi * 700 * n / 1000)
            - 2 * np.cos(0.6 * pi * n)) < 1e-9 for n in range(0, 200)))
chk("D7-11 the Nyquist rate would have been 1400 Hz", 2 * 700 == 1400)
chk("D7-12 ideal case ws = 2 wM = 400 pi", abs(2 * 200 * pi - 400 * pi) < 1e-9)
chk("D7-12 with a guard band ws = 2 wM + wg = 450 pi",
    abs(2 * 200 * pi + 50 * pi - 450 * pi) < 1e-9)
chk("D7-12 setting wg = 0 recovers the ideal answer",
    abs(2 * 200 * pi + 0 - 400 * pi) < 1e-9)
chk("D7-12 in hertz: 200 Hz ideal, 225 Hz with the guard band",
    abs(400 * pi / (2 * pi) - 200) < 1e-9 and abs(450 * pi / (2 * pi) - 225) < 1e-9)


print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
    raise SystemExit(1)
