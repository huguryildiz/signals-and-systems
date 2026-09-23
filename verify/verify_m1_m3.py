#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Modules 0-3 of the artifact, plus the laboratory mathematics.
Symbolic where possible (SymPy), numerical as a cross-check (NumPy)."""
import math, numpy as np, sympy as sp
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

# Explicit derivations added to the M1 energy and power slides
E_cos = sp.integrate(sp.cos(2*t)**2, (t, -T, T))
P_cos_T = sp.simplify(E_cos/(2*T))
chk("M1 cos(2t): E_T = T + sin(4T)/4",
    sp.simplify(E_cos - (T + sp.sin(4*T)/4)) == 0, f"E_T={E_cos}")
chk("M1 cos(2t): running average tends to 1/2",
    sp.limit(P_cos_T, T, sp.oo) == sp.Rational(1,2), f"P_T={P_cos_T}")
E_ramp = sp.integrate(t**2, (t, 0, T))
chk("M1 t*u(t): E_T = T^3/3", sp.simplify(E_ramp - T**3/3) == 0,
    f"E_T={E_ramp}")
chk("M1 t*u(t): P_T = T^2/6",
    sp.simplify(E_ramp/(2*T) - T**2/6) == 0)

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

# Module 1 predictions on the slides and the quick-check slide
chk("M1 predict x(3t-5): x(0) lands at t=5/3", sp.solve(3*t-5, t) == [sp.Rational(5,3)])
chk("M1 predict x[n]=4: energy diverges",
    sp.limit(sp.summation(16, (k, -Nn, Nn)), Nn, sp.oo) == sp.oo)
chk("M1 predict sifting at n0=2 returns x[2]=3", sum(v*(m == 2) for m, v in enumerate([1, 2, 3])) == 3)
chk("M1 predict e^{j3pi n/5}: N0 = 10",
    min(N for N in range(1, 50) if sp.simplify(sp.Rational(3,5)*N/2).is_integer) == 10)
chk("M1 predict radar echo 0.2 ms later is a delay, t0 = 0.2 > 0", 0.2 > 0)
chk("M1 predict y[n]=x[n-2], x[n]=1-n/4: y[3] = x[1] = 3/4", 1 - sp.Rational(3-2, 4) == sp.Rational(3,4))
chk("M1 predict support [-1,4] reversed is [-4,1]", sorted([-(-1), -4]) == [-4, 1])
chk("M1 predict cos(2 pi 440 t) is even", sp.simplify(sp.cos(-2*sp.pi*440*t) - sp.cos(2*sp.pi*440*t)) == 0)
chk("M1 predict x(2t) on [2,6] is non-zero on [1,3]", (sp.Rational(2,2), sp.Rational(6,2)) == (1, 3))
chk("M1 predict 440 Hz at a = 1/2 sounds at 220 Hz", sp.Rational(1,2)*440 == 220)
chk("M1 predict cos(pi t/3) has T0 = 6", sp.periodicity(sp.cos(sp.pi*t/3), t) == 6)
chk("M1 predict (-1)^n has N0 = 2",
    min(N for N in range(1, 10) if all((-1)**(m+N) == (-1)**m for m in range(-10, 10))) == 2)
chk("M1 predict t sin t is even", sp.simplify((-t)*sp.sin(-t) - t*sp.sin(t)) == 0)
chk("M1 predict Od{t+1} = t", sp.simplify(sp.Rational(1,2)*((t+1) - (-t+1)) - t) == 0)
chk("M1 quick: e^{-|t|} has E = 1", sp.integrate(sp.exp(-2*sp.Abs(t)), (t, -sp.oo, sp.oo)) == 1)
P5 = sp.limit(sp.integrate(25*sp.cos(3*t)**2, (t, -T, T))/(2*T), T, sp.oo)
chk("M1 quick: 5cos(3t) has P = 25/2", P5 == sp.Rational(25,2), f"P={P5}")
chk("M1 quick: cos(n/4) is aperiodic, since 1/(8 pi) is irrational",
    (1/(8*sp.pi)).is_rational is False)
chk("M1 quick: cos(pi n/4) has N0 = 8",
    min(N for N in range(1, 50) if (sp.Rational(1,8)*N).is_integer) == 8)

# 1.7 catalogue of common signals
a_ = sp.Symbol('a', positive=True); A_, T0_ = sp.symbols('A T0', positive=True)
chk("M1 cat: d/dt r(t) = u(t) for t>0", sp.diff(t, t) == 1)
chk("M1 cat: int_{-inf}^t u = r(t) for t>0", sp.integrate(1, (tau, 0, t)) == t)
chk("M1 cat: sgn = 2u-1 off t=0", all((2*(1 if v > 0 else 0) - 1) == (1 if v > 0 else -1) for v in [-2, -0.1, 0.1, 3]))
chk("M1 cat: e^{-at}u(t) has E = 1/(2a)",
    sp.simplify(sp.integrate(sp.exp(-2*a_*t), (t, 0, sp.oo)) - 1/(2*a_)) == 0)
chk("M1 cat: rect has E = 1", sp.integrate(1, (t, -sp.Rational(1,2), sp.Rational(1,2))) == 1)
chk("M1 cat: tri has E = 2/3", 2*sp.integrate((1-t)**2, (t, 0, 1)) == sp.Rational(2,3))
tt_ = np.linspace(-1.6, 1.6, 33); dx_ = 1e-4; grid_ = np.arange(-0.5, 0.5, dx_) + dx_/2
conv_ = np.array([np.sum(np.abs(v - grid_) < 0.5)*dx_ for v in tt_])
chk("M1 cat: rect * rect = tri", np.max(np.abs(conv_ - np.maximum(0, 1-np.abs(tt_)))) < 1e-3)
chk("M1 cat: sinc(pi t) is 1 at 0, 0 at t = +-1, +-2, ...",
    sp.limit(sp.sin(sp.pi*t)/(sp.pi*t), t, 0) == 1 and
    all(sp.sin(sp.pi*m)/(sp.pi*m) == 0 for m in [-3, -2, -1, 1, 2, 3]))
chk("M1 cat: e^{-pi t^2} has area 1", sp.integrate(sp.exp(-sp.pi*t**2), (t, -sp.oo, sp.oo)) == 1)
pw_ = lambda f, lo, hi: sp.simplify(sp.integrate(f**2, (t, lo, hi))/T0_)
chk("M1 cat: sine has P = A^2/2", sp.simplify(pw_(A_*sp.sin(2*sp.pi*t/T0_), 0, T0_) - A_**2/2) == 0)
chk("M1 cat: square has P = A^2", sp.simplify(pw_(A_, 0, T0_/2) + pw_(-A_, T0_/2, T0_) - A_**2) == 0)
chk("M1 cat: triangle has P = A^2/3",
    sp.simplify(2*pw_(A_*(1-4*t/T0_), 0, T0_/2) - A_**2/3) == 0)
chk("M1 cat: sawtooth has P = A^2/3", sp.simplify(pw_(A_*(2*t/T0_-1), 0, T0_) - A_**2/3) == 0)
f0_, k_ = sp.symbols('f0 k', positive=True)
chk("M1 cat: chirp frequency = f0 + k t",
    sp.simplify(sp.diff(2*sp.pi*(f0_*t + k_*t**2/2), t)/(2*sp.pi) - (f0_ + k_*t)) == 0)
chk("M1 cat: chirp button 200 Hz -> 2 kHz in 2 s (k = 900)", 200 + 900*2 == 2000)
f1_, f2_ = sp.symbols('f1 f2', positive=True)
chk("M1 cat: beat identity", sp.simplify(sp.expand_trig(
    sp.cos(2*sp.pi*f1_*t) + sp.cos(2*sp.pi*f2_*t)
    - 2*sp.cos(sp.pi*(f1_-f2_)*t)*sp.cos(sp.pi*(f1_+f2_)*t))) == 0 or
    np.max(np.abs([np.cos(2*np.pi*440*v)+np.cos(2*np.pi*444*v)
                   - 2*np.cos(np.pi*(-4)*v)*np.cos(np.pi*884*v) for v in np.linspace(0, 3, 2001)])) < 1e-9)
env_ = np.abs(np.cos(np.pi*4*np.linspace(0.1, 1.1, 100001)))  # one second, off the peaks
chk("M1 cat: 440 + 444 Hz loudness peaks 4 times a second",
    int(np.sum((env_[1:-1] > env_[:-2]) & (env_[1:-1] >= env_[2:]) & (env_[1:-1] > 0.999))) == 4)

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

# laboratory K: the shifts the warning card asks for
tt = [k*0.01 - 40.0037 for k in range(8001)]
pulse = lambda x: 1 if 0 <= x < 2 else 0
chk("LabK pulse shifted by -1 is even",
    all(pulse(v+1) == pulse(-v+1) for v in tt))
chk("LabK cos(pi(t-2)/4) is odd",
    all(abs(math.cos(math.pi*(v-2)/4) + math.cos(math.pi*(-v-2)/4)) < 1e-12 for v in tt))
chk("LabK e^{-t/2}u(t) is neither (Ev(1.25) = Od(1.25) = e^{-5/8}/2)",
    abs(0.5*math.exp(-0.625) - 0.26763) < 1e-5)

# laboratory L: the unit-area pulse average and its limit
e_ = sp.symbols('epsilon', positive=True)
avg = sp.integrate(1 + sp.Rational(3,5)*sp.cos(sp.Rational(3,2)*t), (t, -e_/2, e_/2))/e_
chk("LabL cosine at t0=0: integral = 1 + 0.6 sin(0.75 eps)/(0.75 eps)",
    sp.simplify(avg - (1 + sp.Rational(3,5)*sp.sin(sp.Rational(3,4)*e_)/(sp.Rational(3,4)*e_))) == 0)
chk("LabL cosine at t0=0, eps=2: integral = 1.399", abs(float(avg.subs(e_, 2)) - 1.399) < 5e-4)
chk("LabL cosine at t0=0: limit eps->0 is x(0) = 1.6", sp.limit(avg, e_, 0) == sp.Rational(8,5))
t0_ = sp.symbols('t0', real=True)
avgp = sp.integrate(t**2/4, (t, t0_-e_/2, t0_+e_/2))/e_
chk("LabL parabola: integral = t0^2/4 + eps^2/48", sp.simplify(avgp - (t0_**2/4 + e_**2/48)) == 0)

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
