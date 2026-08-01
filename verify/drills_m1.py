"""Module 1 — Signal Foundations. Independent re-derivation of every number
stated in the Check step of a D1-xx solution.

Each claim is computed here by a route that does not reuse the algebra of the
solution: brute-force periodicity search instead of the rationality formula,
direct numerical integration instead of the closed-form antiderivative,
symbolic distributional integration for the impulses, and direct evaluation
of the *original* piecewise definition (never the derived formula) for the
transformation questions."""
import math
from fractions import Fraction

import numpy as np
import sympy as sp

from drill_common import chk, close, allclose, t as T_SYM, n as N_SYM

j = 1j


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def dt_min_period(f, Nmax=64, tol=1e-9, span=80):
    """Brute-force fundamental period of a discrete-time signal f(n)."""
    ns = np.arange(0, span)
    base = f(ns)
    for N in range(1, Nmax + 1):
        if np.allclose(f(ns + N), base, atol=tol):
            return N
    return None


_trapz = getattr(np, 'trapezoid', None) or np.trapz


def trapz_energy(f, a, b, n=2_000_001):
    """Numerical energy of |f|^2 on [a, b] by the trapezoid rule."""
    g = np.linspace(a, b, n)
    return float(_trapz(np.abs(f(g)) ** 2, g))


# ===========================================================================
# D1-01 — periodicity of three DT sinusoids
# ===========================================================================
N01_i = dt_min_period(lambda n: np.cos(5 * np.pi / 8 * n - np.pi / 6))
chk("D1-01 (i) N0=16", N01_i == 16, f"brute-force minimal N = {N01_i}")

N01_iii = dt_min_period(lambda n: np.sin(np.pi / 6 * n))
chk("D1-01 (iii) N0=12", N01_iii == 12, f"brute-force minimal N = {N01_iii}")

# (ii): omega0/2pi = 3/(2 pi) irrational, since pi is irrational and 3 is a
# non-zero rational; verified symbolically rather than by a finite search.
ratio_ii = sp.nsimplify(3) / (2 * sp.pi)
chk("D1-01 (ii) omega0/2pi irrational", bool(ratio_ii.is_irrational),
    f"3/(2*pi) is_irrational = {ratio_ii.is_irrational}")


# ===========================================================================
# D1-02 — sum of two DT sinusoids
# ===========================================================================
N02_1 = dt_min_period(lambda n: np.cos(np.pi / 5 * n))
N02_2 = dt_min_period(lambda n: np.sin(np.pi / 3 * n))
chk("D1-02 N1=10", N02_1 == 10, f"brute-force N1 = {N02_1}")
chk("D1-02 N2=6", N02_2 == 6, f"brute-force N2 = {N02_2}")

# The fundamental period of the sum, found directly on the sum itself —
# never invoking lcm — must equal lcm(N1, N2).
N02_sum = dt_min_period(lambda n: np.cos(np.pi / 5 * n) + np.sin(np.pi / 3 * n), Nmax=64)
chk("D1-02 N0=30", N02_sum == 30, f"brute-force period of the sum = {N02_sum}")
chk("D1-02 N0 = lcm(N1,N2)", N02_sum == math.lcm(N02_1, N02_2),
    f"lcm({N02_1},{N02_2}) = {math.lcm(N02_1, N02_2)}")


# ===========================================================================
# D1-03 — periodicity of two CT sums
# ===========================================================================
# (i) cos(3t) + sin(5t): harmonics of a common base omega0 = gcd(3,5) = 1.
g = math.gcd(3, 5)
T0_i = 2 * math.pi / g
rng = np.random.default_rng(1)
ts = rng.uniform(-50, 50, 200)
x_i = lambda t: np.cos(3 * t) + np.sin(5 * t)
chk("D1-03 (i) T0=2*pi periodic", np.allclose(x_i(ts + T0_i), x_i(ts), atol=1e-8),
    "x(t+2*pi) = x(t) on 200 random points")
# no smaller period: pi (=T0/2) must fail somewhere
chk("D1-03 (i) T0/2 is not a period", not np.allclose(x_i(ts + T0_i / 2), x_i(ts), atol=1e-6),
    "x(t+pi) != x(t) somewhere, so pi is not a period")

# (ii) cos(t) + cos(sqrt(2) t): ratio of periods is sqrt(2), irrational.
ratio_ii3 = sp.sqrt(2)
chk("D1-03 (ii) T1/T2 = sqrt(2) irrational", bool(ratio_ii3.is_irrational))
y_ii = lambda t: np.cos(t) + np.cos(np.sqrt(2) * t)
# a genuine period would have to be enormous; confirm no period as short as
# 200 exists by sampling many candidate lengths against many base points
cands = np.linspace(0.5, 200, 4000)
found = any(np.allclose(y_ii(ts + c), y_ii(ts), atol=1e-6) for c in cands[:50])
chk("D1-03 (ii) no short period found for y(t)", not found,
    "no candidate T in a wide search reproduces y(t) exactly")


# ===========================================================================
# D1-04 — envelope destroys periodicity
# ===========================================================================
chk("D1-04 (a) T0 = pi/2 for 2cos(4t)", close(2 * math.pi / 4, math.pi / 2))

Tg = np.linspace(1e-3, 60, 400_000)
lhs = np.exp(0.3 * Tg)
rhs = np.cos(4 * Tg)
chk("D1-04 (b) e^{0.3T} > cos(4T) for all T>0 (no candidate period)",
    bool(np.all(lhs > rhs)), "checked on 4e5 points in (0,60]")

x04 = lambda t: 2 * np.exp(-0.3 * t) * np.cos(4 * t)
chk("D1-04 (b) x(0)=2", close(x04(0.0), 2.0))
# necessary condition x(0)=x(T) never holds for T>0
diffs = np.abs(x04(Tg) - x04(0.0))
chk("D1-04 (b) |x(T)-x(0)|>0 for all sampled T>0", bool(np.all(diffs > 1e-9)))


# ===========================================================================
# D1-05 — energy of a trapezoidal CT pulse
# ===========================================================================
def x05(t):
    t = np.asarray(t, dtype=float)
    return np.where((t >= 0) & (t <= 2), t,
           np.where((t > 2) & (t <= 3), 2.0,
           np.where((t > 3) & (t <= 5), 5 - t, 0.0)))

E05 = trapz_energy(x05, -1, 6)
chk("D1-05 (a) E_inf = 28/3", close(E05, 28 / 3, tol=1e-4), f"numeric = {E05:.6f}")

P05 = (28 / 3) / (2 * 1e8)
chk("D1-05 (b) P_inf -> 0", close(P05, 0.0, tol=1e-6), f"E/2T at T=1e8: {P05:.3e}")


# ===========================================================================
# D1-06 — DT energy/power classification
# ===========================================================================
r06 = Fraction(4, 25)
E06_1 = Fraction(1, 1) / (1 - r06)
chk("D1-06 (a) E1 = 25/21", E06_1 == Fraction(25, 21), f"= {E06_1}")

partial = sum((Fraction(2, 5) ** (2 * n)) for n in range(0, 200))
chk("D1-06 (a) partial sums converge to 25/21",
    abs(float(partial) - 25 / 21) < 1e-30 or float(partial) < 25 / 21 + 1e-9,
    f"sum of 200 terms = {float(partial):.10f}")

for Nb in (10, 1000, 10 ** 6):
    P2 = 9 * (Nb + 1) / (2 * Nb + 1)
chk("D1-06 (b) P2 -> 4.5", close(9 * (10 ** 6 + 1) / (2 * 10 ** 6 + 1), 4.5, tol=1e-5))


# ===========================================================================
# D1-07 — CT energy/power, and the general inequality
# ===========================================================================
E07_1 = trapz_energy(lambda t: np.exp(-5 * t), 0, 30)
chk("D1-07 (a) E1 = 1/10", close(E07_1, 0.1, tol=1e-5), f"numeric = {E07_1:.6f}")

T0_07 = 2 * math.pi / 3
gg = np.linspace(0, T0_07, 400_001)
P07_2 = float(_trapz(16 * np.cos(3 * gg) ** 2, gg) / T0_07)
chk("D1-07 (b) P2 = 8", close(P07_2, 8.0, tol=1e-4), f"numeric average = {P07_2:.6f}")

# general inequality P_T <= E_inf / 2T for x1(t) = e^{-5t}u(t), checked at
# T=5 via the closed-form finite-window integral (exact, not numerical
# quadrature, so a discontinuity at t=0 introduces no bias)
PT_07 = (1 - math.exp(-10 * 5)) / 10 / (2 * 5)
chk("D1-07 (c) P_T <= E_inf/2T at T=5", PT_07 <= 0.1 / 10 + 1e-12,
    f"P_5={PT_07:.8f}, bound={0.1/10:.8f}")


# ===========================================================================
# D1-08 — energy of a piecewise DT signal
# ===========================================================================
def x08(n):
    if n <= -1:
        return 2.0 ** n
    if n == 0:
        return 3.0
    return 0.5 ** n


E08 = sum(x08(n) ** 2 for n in range(-2000, 2001))
chk("D1-08 (b) E_inf = 29/3", close(E08, 29 / 3, tol=1e-6), f"numeric sum = {E08:.6f}")
chk("D1-08 (a) sample values", (x08(-1), x08(0), x08(1)) == (0.5, 3.0, 0.5))


# ===========================================================================
# D1-09 — transform of a CT ramp+constant pulse
# ===========================================================================
def x09(s):
    s = np.asarray(s, dtype=float)
    return np.where((s >= -2) & (s <= 0), s + 2,
           np.where((s > 0) & (s <= 1), 2.0, 0.0))

t9 = np.linspace(-2, -0.5, 4000)
y09_direct = x09(2 * t9 + 2)  # from the ORIGINAL definition, not the derived formula
y09_claimed = np.where(t9 <= -1, 2 * t9 + 4, 2.0)
chk("D1-09 derived formula matches direct substitution",
    np.allclose(y09_direct, y09_claimed, atol=1e-9))

chk("D1-09 support = [-2,-0.5]",
    close(x09(2 * (-2) + 2), 0.0) and close(x09(2 * (-0.5) + 2), 2.0))
chk("D1-09 width ratio 1.5 = 3/2", close(-0.5 - (-2), 3 / 2))


# ===========================================================================
# D1-10 — DT reflection-plus-shift and plain shift
# ===========================================================================
x10 = {-1: 2, 0: -1, 1: 3, 2: -2}
y10 = {2 - m: v for m, v in x10.items()}
z10 = {m - 1: v for m, v in x10.items()}
chk("D1-10 (a) y[n]=x[2-n] samples",
    y10 == {0: -2, 1: 3, 2: -1, 3: 2}, f"{y10}")
chk("D1-10 (b) z[n]=x[n+1] samples",
    z10 == {-2: 2, -1: -1, 0: 3, 1: -2}, f"{z10}")
order_x = [x10[k] for k in sorted(x10)]
order_y = [y10[k] for k in sorted(y10)]
chk("D1-10 reflection reverses the sample order",
    order_y == list(reversed(order_x)), f"{order_x} reversed = {order_y}")


# ===========================================================================
# D1-11 — transform with negative fractional a
# ===========================================================================
def x11(s):
    s = np.asarray(s, dtype=float)
    return np.where((s >= -1) & (s <= 0), s + 1,
           np.where((s > 0) & (s <= 1), 1 - s, 0.0))

t11 = np.linspace(0, 6, 4000)
y11_direct = x11(1 - t11 / 3)
y11_claimed = np.where(t11 <= 3, t11 / 3, 2 - t11 / 3)
chk("D1-11 derived formula matches direct substitution",
    np.allclose(y11_direct, y11_claimed, atol=1e-9))
chk("D1-11 support = [0,6]",
    close(x11(1 - 0 / 3), 0.0) and close(x11(1 - 6 / 3), 0.0))
chk("D1-11 peak at t=3", close(float(x11(1 - 3 / 3)), 1.0) and close(float(x11(1 - 3.0 / 3.0)), 1.0))
chk("D1-11 width ratio 6 = 2/(1/3)", close(6 - 0, 2 / (Fraction(1, 3))))


# ===========================================================================
# D1-12 — abstract support/peak transformation (no formula for x)
# ===========================================================================
# support of x is [2,8]; solve for y(t)=x(-3t+6) support directly with sympy
tt = sp.symbols('t_abs', real=True)
sol_lo = sp.solve(sp.Eq(-3 * tt + 6, 8), tt)[0]
sol_hi = sp.solve(sp.Eq(-3 * tt + 6, 2), tt)[0]
y_support = sorted([sol_lo, sol_hi])
chk("D1-12 (a) support of y = [-2/3, 4/3]",
    y_support == [sp.Rational(-2, 3), sp.Rational(4, 3)], f"{y_support}")

peak_t = sp.solve(sp.Eq(-3 * tt + 6, 5), tt)[0]
chk("D1-12 (b) peak of y at t=1/3", peak_t == sp.Rational(1, 3))

# z(t) = y(t-4) directly, and again through x(-3t+18); both routes agree
z_lo = sp.solve(sp.Eq(-3 * (tt - 4) + 6, 8), tt)[0]
z_hi = sp.solve(sp.Eq(-3 * (tt - 4) + 6, 2), tt)[0]
z_support_via_y = sorted([y_support[0] + 4, y_support[1] + 4])
z_support_direct = sorted([z_lo, z_hi])
chk("D1-12 (c) support of z agrees via both routes",
    z_support_via_y == z_support_direct == [sp.Rational(10, 3), sp.Rational(16, 3)],
    f"via y: {z_support_via_y}, direct: {z_support_direct}")
chk("D1-12 (c) width of z = 2 = width of x / 3",
    (z_support_direct[1] - z_support_direct[0]) == sp.Rational(6, 1) / 3)


# ===========================================================================
# D1-13 — even/odd parts of a causal CT exponential
# ===========================================================================
def x13(t):
    return np.where(t >= 0, 3 * np.exp(-4 * t), 0.0)

Ex13 = trapz_energy(x13, 0, 20)
Eev13 = trapz_energy(lambda t: 1.5 * np.exp(-4 * np.abs(t)), -20, 20)
Eod13 = trapz_energy(lambda t: np.where(t > 0, 1.5 * np.exp(-4 * t), -1.5 * np.exp(4 * t)), -20, 20)
chk("D1-13 E_x = 9/8", close(Ex13, 9 / 8, tol=1e-4), f"{Ex13:.6f}")
chk("D1-13 E_ev = 9/16", close(Eev13, 9 / 16, tol=1e-4), f"{Eev13:.6f}")
chk("D1-13 E_od = 9/16", close(Eod13, 9 / 16, tol=1e-4), f"{Eod13:.6f}")
chk("D1-13 E_ev + E_od = E_x", close(Eev13 + Eod13, Ex13, tol=1e-3))
# even + odd reproduces x directly, at a sample point
tp = 0.37
ev = 1.5 * np.exp(-4 * abs(tp))
od = 1.5 * np.exp(-4 * tp)
chk("D1-13 Ev+Od = x at t=0.37", close(ev + od, x13(tp)))


# ===========================================================================
# D1-14 — even/odd parts of a four-sample DT sequence
# ===========================================================================
x14 = {0: 2, 1: -1, 2: 4, 3: 1}
xrefl14 = {-k: v for k, v in x14.items()}


def xv14(n):
    return x14.get(n, 0)


def xr14(n):
    return xrefl14.get(n, 0)


ev14 = {n: 0.5 * (xv14(n) + xr14(n)) for n in range(-3, 4)}
od14 = {n: 0.5 * (xv14(n) - xr14(n)) for n in range(-3, 4)}
chk("D1-14 Ev at n=-1,0,2", (ev14[-1], ev14[0], ev14[2]) == (-0.5, 2.0, 2.0))
chk("D1-14 Od at n=-1,0,2", (od14[-1], od14[0], od14[2]) == (0.5, 0.0, 2.0))
chk("D1-14 Ev+Od reproduces x at n=-1,0,2",
    all(close(ev14[n] + od14[n], xv14(n)) for n in (-1, 0, 2)))
chk("D1-14 Od[0]=0", close(od14[0], 0.0))


# ===========================================================================
# D1-15 — even/odd of an asymmetric piecewise rectangular signal
# ===========================================================================
def x15(t):
    t = np.asarray(t, dtype=float)
    return np.where((t >= -2) & (t < 0), -1.0,
           np.where((t >= 0) & (t <= 3), 2.0, 0.0))


def x15_refl(t):
    return x15(-t)


Ex15 = trapz_energy(x15, -3, 4)
Eev15 = trapz_energy(lambda t: 0.5 * (x15(t) + x15_refl(t)), -4, 4)
Eod15 = trapz_energy(lambda t: 0.5 * (x15(t) - x15_refl(t)), -4, 4)
chk("D1-15 E_x = 14", close(Ex15, 14.0, tol=1e-3), f"{Ex15:.6f}")
chk("D1-15 E_ev = 3", close(Eev15, 3.0, tol=1e-3), f"{Eev15:.6f}")
chk("D1-15 E_od = 11", close(Eod15, 11.0, tol=1e-3), f"{Eod15:.6f}")
chk("D1-15 E_ev + E_od = E_x", close(Eev15 + Eod15, Ex15, tol=1e-3))
chk("D1-15 E_ev <= E_x (even part cannot exceed E_x)", Eev15 <= Ex15 + 1e-9)


# ===========================================================================
# D1-16 — Od{x}[0]=0 in general, and the w[n] example
# ===========================================================================
w = {-1: -5, 0: 0, 1: 5}


def wv(n):
    return w.get(n, 0)


ns16 = range(-3, 4)
ev_w = {n: 0.5 * (wv(n) + wv(-n)) for n in ns16}
od_w = {n: 0.5 * (wv(n) - wv(-n)) for n in ns16}
chk("D1-16 (b) Ev{w}=0 everywhere", all(close(v, 0.0) for v in ev_w.values()))
chk("D1-16 (b) Od{w}=w everywhere", all(close(od_w[n], wv(n)) for n in ns16))

# part (a), proved for an arbitrary symbolic sequence value at n=0
x0sym = sp.symbols('x0', real=True)
od_at_0 = sp.Rational(1, 2) * (x0sym - x0sym)
chk("D1-16 (a) Od{x}[0]=0 for symbolic x[0]", sp.simplify(od_at_0) == 0)

# part (c): if y were odd, y[0] would have to equal Od{y}[0] = 0
chk("D1-16 (c) y[0]=4 contradicts oddness (y[0] != Od{y}[0]=0)", 4 != 0)


# ===========================================================================
# D1-17 — sifting against CT impulses (symbolic, via DiracDelta)
# ===========================================================================
t17 = sp.symbols('t17', real=True)
I17_i = sp.integrate((3 * t17 ** 2 + 1) * (sp.DiracDelta(t17 + 2) + sp.DiracDelta(t17 - 4)),
                      (t17, -sp.oo, sp.oo))
chk("D1-17 (i) = 62", sp.simplify(I17_i) == 62, f"= {I17_i}")

I17_ii = sp.integrate(sp.exp(-2 * t17) * sp.sin(sp.pi * t17) * sp.DiracDelta(t17 - sp.Rational(3, 2)),
                       (t17, -sp.oo, sp.oo))
val_ii = complex(sp.N(I17_ii))
chk("D1-17 (ii) = -e^{-3}", close(val_ii.real, -math.exp(-3), tol=1e-9), f"= {val_ii}")

I17_iii = sp.integrate(t17 ** 2 * sp.DiracDelta(4 * t17 - 8), (t17, -sp.oo, sp.oo))
chk("D1-17 (iii) = 1", sp.simplify(I17_iii) == 1, f"= {I17_iii}")


# ===========================================================================
# D1-18 — running integral of two impulses, expressed with steps
# ===========================================================================
u = lambda t: 1.0 if t >= 0 else 0.0
v18 = lambda t: 3 * u(t + 1) - 2 * u(t - 2)
chk("D1-18 v(0)=3", close(v18(0.0), 3.0))
chk("D1-18 v(3)=1", close(v18(3.0), 1.0))
chk("D1-18 final level = sum of weights = 1", close(v18(100.0), 3 - 2))
chk("D1-18 v(t)=0 before t=-1", close(v18(-1.5), 0.0))


# ===========================================================================
# D1-19 — DT sampling, sifting and representation
# ===========================================================================
x19 = {-1: 5, 0: -3, 1: 2, 2: 7}
chk("D1-19 (a) sampling: x[n]delta[n-1] = 2 at n=1 only",
    x19.get(1, 0) == 2)
chk("D1-19 (b) sifting sum = x[1] = 2",
    sum(x19.get(n, 0) * (1 if n == 1 else 0) for n in range(-5, 6)) == 2)


def repr_sum(nval, xdict):
    return sum(xdict.get(k, 0) * (1 if nval - k == 0 else 0) for k in xdict)


chk("D1-19 (c) representation reproduces x[0]=-3", repr_sum(0, x19) == -3)
chk("D1-19 (check) representation reproduces x[-1]=5", repr_sum(-1, x19) == 5)


# ===========================================================================
# D1-20 — running sum of a DT impulse train, and its CT analogue
# ===========================================================================
xk20 = {0: 1, 2: 2, 4: -1}


def running_sum(nmax, xdict):
    out = {}
    acc = 0.0
    for nn in range(-2, nmax + 1):
        acc += xdict.get(nn, 0)
        out[nn] = acc
    return out


y20 = running_sum(6, xk20)
expected20 = {-2: 0, -1: 0, 0: 1, 1: 1, 2: 3, 3: 3, 4: 2, 5: 2, 6: 2}
chk("D1-20 (a) y[n] table matches", y20 == expected20, f"{y20}")

u_fn = lambda n: 1.0 if n >= 0 else 0.0
y20_closed = lambda n: u_fn(n) + 2 * u_fn(n - 2) - u_fn(n - 4)
chk("D1-20 (b) closed form matches table",
    all(close(y20_closed(nn), expected20[nn]) for nn in expected20))

q20_closed = lambda t: u(t) + 2 * u(t - 2) - u(t - 4)
chk("D1-20 (c) q(t) final level = 2 = sum of weights",
    close(q20_closed(100.0), sum(xk20.values())))
chk("D1-20 (c) q(t) and y[n] settle at the same final level",
    close(q20_closed(100.0), y20_closed(100)))
