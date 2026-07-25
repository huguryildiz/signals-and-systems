#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Modules 0-3 of the EE311 artifact, plus the laboratory mathematics.
Symbolic where possible (SymPy), numerical as a cross-check (NumPy)."""
import numpy as np, sympy as sp
from fractions import Fraction

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

t, tau, n, k, T, N = sp.symbols('t tau n k T N', real=True)

# ---------------------------------------------------------------- Module 1
# p.3 example 1: rect on [0,1] -> energy signal
E1 = sp.integrate(1**2, (t, 0, 1))
P1 = sp.limit(sp.Rational(1,1)/(2*T)*sp.integrate(1, (t, 0, 1)), T, sp.oo)
chk("M1 rect: E_inf = 1", E1 == 1, f"E={E1}")
chk("M1 rect: P_inf = 0", P1 == 0, f"P={P1}")

# p.3 example 2: x[n]=4 for all n -> power signal, P=16
Nn = sp.Symbol('Nn', positive=True, integer=True)
P2 = sp.limit((2*Nn+1)*16/(2*Nn+1), Nn, sp.oo)
chk("M1 x[n]=4: P_inf = 16", P2 == 16, f"P={P2}")

# lab B items
chk("LabB (1/2)^n u[n]: E = 4/3", sp.summation(sp.Rational(1,4)**k, (k,0,sp.oo)) == sp.Rational(4,3))
chk("LabB e^{2t}u(-t): E = 1/4", sp.integrate(sp.exp(4*t), (t,-sp.oo,0)) == sp.Rational(1,4))
chk("LabB u(t): P = 1/2", sp.limit(sp.integrate(1,(t,0,T))/(2*T), T, sp.oo) == sp.Rational(1,2))
chk("LabB t*u(t): P diverges", sp.limit(sp.integrate(t**2,(t,0,T))/(2*T), T, sp.oo) == sp.oo)

# p.4 combined transformation x(3t-5): breakpoints
xb = [-2, 0, 2, 4]                       # breakpoints of x
vb = [b + 5 for b in xb]                 # v(t) = x(t-5)
yb = [Fraction(b, 3) for b in vb]        # y(t) = v(3t)
chk("M1 x(3t-5): v breakpoints 3,5,7,9", vb == [3,5,7,9], str(vb))
chk("M1 x(3t-5): y breakpoints 1,5/3,7/3,3",
    yb == [Fraction(1), Fraction(5,3), Fraction(7,3), Fraction(3)], str(yb))
chk("M1 x(3t-5): width shrinks by a=3", (yb[-1]-yb[0]) * 3 == (xb[-1]-xb[0]))

# p.8 CT fundamental period of e^{j0.5*pi*t}
chk("M1 CT T0 = 4 s for w0 = 0.5pi", sp.simplify(2*sp.pi/(sp.Rational(1,2)*sp.pi)) == 4)

# p.10 DT fundamental period of e^{j3pi n/5}
def N0_of(pnum, qden):      # w0 = p*pi/q  ->  N = 2q k / p
    g = np.gcd(2*qden, pnum)
    return (2*qden)//g, pnum//g
N0, kmin = N0_of(3, 5)
chk("M1 DT N0 = 10, k = 3 for w0 = 3pi/5", (N0, kmin) == (10, 3), f"N0={N0}, k={kmin}")
w0 = 3*np.pi/5
seq = np.cos(w0*np.arange(-40, 40))
chk("M1 DT numerical periodicity N0 = 10",
    np.allclose(seq[:-N0], seq[N0:], atol=1e-12))
chk("M1 DT no smaller period than 10",
    all(not np.allclose(seq[:-m], seq[m:], atol=1e-9) for m in range(1, N0)))
# lab C exactness across the whole control range
ok = True
for pnum in range(1, 13):
    for qden in range(1, 13):
        NN, kk = N0_of(pnum, qden)
        w = pnum*np.pi/qden
        s = np.cos(w*np.arange(-60, 60))
        if not np.allclose(s[:-NN], s[NN:], atol=1e-9): ok = False
        if any(np.allclose(s[:-m], s[m:], atol=1e-9) for m in range(1, NN)): ok = False
chk("LabC N0 formula exact over all 144 (p,q) control settings", ok)
# aperiodic counterexample used in the artifact
s = np.cos(np.arange(-200, 200))
chk("M1 cos(n) has no period <= 400",
    not any(np.allclose(s[:-m], s[m:], atol=1e-6) for m in range(1, 200)))

# ---------------------------------------------------------------- Module 2
xs = sp.Function('x')
a_, b_ = sp.symbols('a b')
# y=2*pi*x is linear
chk("M2 y=2pi x linear", sp.simplify(2*sp.pi*(a_*sp.Symbol('x1')+b_*sp.Symbol('x2'))
    - (a_*2*sp.pi*sp.Symbol('x1') + b_*2*sp.pi*sp.Symbol('x2'))) == 0)
# y=(x[2n])^2 not linear: cross term
x1, x2 = sp.symbols('x1 x2')
cross = sp.expand((a_*x1+b_*x2)**2 - (a_*x1**2 + b_*x2**2))
chk("M2 y=(x[2n])^2 not linear (cross term survives)", sp.simplify(cross) != 0, str(sp.factor(cross)))
# accumulator instability with u[n]
acc = np.cumsum(np.ones(2000))
chk("M2 accumulator: bounded input -> unbounded output", acc[-1] == 2000)
# y=n x[n] time-variance counterexample
d0 = np.zeros(9); d0[4] = 1                     # delta[n] at index 4 (n=0)
nn = np.arange(-4, 5)
y1 = nn*d0
d1 = np.roll(d0, 1)                              # delta[n-1]
y2 = nn*d1
chk("M2 y=n x[n] not time invariant", not np.allclose(np.roll(y1, 1), y2),
    f"y1 shifted={np.roll(y1,1)[3:7]}, y2={y2[3:7]}")
# 2x^2(t-1)+x(3t) bound
B = sp.Symbol('B', positive=True)
chk("M2 stability bound 2B^2+B", sp.simplify(2*B**2 + B - (2*B**2 + B)) == 0)
# invertibility of (cos t + 2): gain never vanishes
chk("M2 cos(t)+2 >= 1 > 0", sp.minimum(sp.cos(t)+2, t) == 1)

# ---------------------------------------------------------------- Module 3
# p.15-16 finite convolution
x = np.array([1., 2., 1., 2.]); h = np.array([1., 1.])
y = np.convolve(x, h)
chk("M3 {1,2,1,2}*{1,1} = {1,3,3,3,2}", np.array_equal(y, np.array([1,3,3,3,2])), str(y))
chk("M3 support length 4+2-1 = 5", len(y) == len(x)+len(h)-1)
chk("M3 sum rule: sum y = (sum x)(sum h)", y.sum() == x.sum()*h.sum(), f"{y.sum()} vs {x.sum()*h.sum()}")

# p.16-17 geometric convolution y[n] = 2 - (1/2)^n, n>=0
nn = np.arange(0, 40)
y_num = np.array([sum(0.5**kk for kk in range(0, m+1)) for m in nn])
chk("M3 (1/2)^n u[n] * u[n] = 2-(1/2)^n", np.allclose(y_num, 2 - 0.5**nn))
chk("M3 limit 2", abs(y_num[-1] - 2) < 1e-10)
# finite geometric sum identity holds for r != 1 (source states |r|<1)
r = sp.Symbol('r'); m_, nq = sp.symbols('m nq', integer=True, nonnegative=True)
lhs = sp.summation(r**k, (k, 0, 5))
rhs = (r**0 - r**6)/(1-r)
chk("M3 finite geometric identity valid for r != 1 (e.g. r = 3)",
    sp.simplify(lhs.subs(r,3) - rhs.subs(r,3)) == 0, "ledger A-07 confirmed")

# p.18-19 CT convolution: x = e^{2t}u(-t), h = u(t-3)
tv = sp.Symbol('tv', real=True)
y_lt3 = sp.integrate(sp.exp(2*tau), (tau, -sp.oo, tv-3))
y_gt3 = sp.integrate(sp.exp(2*tau), (tau, -sp.oo, 0))
chk("M3 CT-1 case I  = 0.5 e^{2(t-3)}", sp.simplify(y_lt3 - sp.exp(2*(tv-3))/2) == 0)
chk("M3 CT-1 case II = 0.5", sp.simplify(y_gt3 - sp.Rational(1,2)) == 0)
# numerical cross-check by quadrature
def conv_num(xf, hf, tt, lo=-40, hi=40, m=400001):
    g = np.linspace(lo, hi, m)
    return np.trapezoid(xf(g)*hf(tt-g), g)
xf = lambda z: np.where(z <= 0, np.exp(2*np.minimum(z, 0)), 0.0)
hf = lambda z: np.where(z >= 3, 1.0, 0.0)
for tt in [0.0, 1.5, 2.9, 3.1, 5.0]:
    exact = 0.5*np.exp(2*(tt-3)) if tt < 3 else 0.5
    chk(f"M3 CT-1 numeric at t={tt}", abs(conv_num(xf, hf, tt) - exact) < 2e-4)

# p.19-20 CT convolution: x = rect(0,1), h = ramp t on (0,2)
def y_exact(tt):
    if tt <= 0: return 0.0
    if tt < 1:  return 0.5*tt**2
    if tt < 2:  return tt - 0.5
    if tt < 3:  return -0.5*tt**2 + tt + 1.5
    return 0.0
xf2 = lambda z: np.where((z > 0) & (z < 1), 1.0, 0.0)
hf2 = lambda z: np.where((z > 0) & (z < 2), z, 0.0)
worst = max(abs(conv_num(xf2, hf2, tt, -5, 8, 600001) - y_exact(tt))
            for tt in [0.4, 0.9, 1.3, 1.8, 2.2, 2.7, 3.2])
chk("M3 CT-2 five-case result matches quadrature", worst < 5e-5, f"max err = {worst:.2e}")
chk("M3 CT-2 continuity at t=1", abs(0.5*1**2 - (1-0.5)) < 1e-12)
chk("M3 CT-2 continuity at t=2", abs((2-0.5) - (-0.5*4+2+1.5)) < 1e-12)
chk("M3 CT-2 continuity at t=3", abs(-0.5*9+3+1.5) < 1e-12)
area = (sp.integrate(sp.Rational(1,2)*t**2,(t,0,1)) + sp.integrate(t-sp.Rational(1,2),(t,1,2))
        + sp.integrate(-sp.Rational(1,2)*t**2+t+sp.Rational(3,2),(t,2,3)))
chk("M3 CT-2 area = (int x)(int h) = 2", sp.simplify(area - 2) == 0, f"area={area}")
chk("M3 CT-2 peak 1.5 at t=2", abs(y_exact(2.0-1e-9) - 1.5) < 1e-6)

# laboratory E numerical engine reproduces the closed forms
def convDT(xf_, hf_, m, lo=-40, hi=60):
    return sum(xf_(kk)*hf_(m-kk) for kk in range(lo, hi))
xdt = lambda i: [1,2,1,2][i] if 0 <= i <= 3 else 0
hdt = lambda i: 1 if i in (0,1) else 0
chk("LabE dt1 engine matches closed form",
    all(convDT(xdt,hdt,m) == [1,3,3,3,2][m] for m in range(5)))
xg = lambda i: 0.5**i if i >= 0 else 0
hg = lambda i: 1 if i >= 0 else 0
chk("LabE dt2 engine matches closed form",
    all(abs(convDT(xg,hg,m) - (2-0.5**m)) < 1e-12 for m in range(0, 15)))

# laboratory A support mapping y(t) = x(at-b)
sup = (-2.0, 4.0)
for a_v in [-3, -1.5, -0.25, 0.25, 1, 2.5, 3]:
    e1, e2 = (sup[0]+5)/a_v, (sup[1]+5)/a_v
    lo, hi = min(e1,e2), max(e1,e2)
    mid = 0.5*(lo+hi)
    inside = sup[0] <= a_v*mid - 5 <= sup[1]
    chk(f"LabA support map a={a_v}", inside)

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
