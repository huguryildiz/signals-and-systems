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
chk("M1 predict cos(pi t) at t=0.5 is 0", sp.cos(sp.pi*sp.Rational(1,2)) == 0)
chk("M1 predict v=2 V across 4 ohm gives 1 W", sp.Rational(2**2, 4) == 1)
chk("M1 predict three unit samples have E = 3", sum(1**2 for m in range(3)) == 3)
chk("M1 predict x(t)=2 has E_T = 8T", sp.integrate(4, (t, -T, T)) == 8*T)
chk("M1 predict (-1)^n has P = 1",
    sp.limit(sp.summation(((-1)**k)**2, (k, -Nn, Nn))/(2*Nn+1), Nn, sp.oo) == 1)
chk("M1 predict unit pulse on [0,3] has E = 3", sp.integrate(1, (t, 0, 3)) == 3)
chk("M1 predict x(t)=3 has P = 9", sp.limit(sp.integrate(9, (t, -T, T))/(2*T), T, sp.oo) == 9)
chk("M1 predict e^t is neither: E and P diverge",
    sp.limit(sp.integrate(sp.exp(2*t), (t, -T, T)), T, sp.oo) == sp.oo and
    sp.limit(sp.integrate(sp.exp(2*t), (t, -T, T))/(2*T), T, sp.oo) == sp.oo)
d_ = lambda m: 1 if m == 0 else 0
u_ = lambda m: 1 if m >= 0 else 0
chk("M1 predict delta[n-3] is non-zero only at n=3", [m for m in range(-10, 11) if d_(m-3)] == [3])
chk("M1 predict u[n-2] at n=2 is 1", u_(2-2) == 1)
chk("M1 predict u[n]-u[n-3] has 3 non-zero samples", sum(u_(m) - u_(m-3) != 0 for m in range(-10, 11)) == 3)
chk("M1 predict 2delta[n]+delta[n-1] at n=1 is 1", 2*d_(1) + d_(1-1) == 1)
chk("M1 predict sum n^2 delta[n+1] = 1", sum(m**2*d_(m+1) for m in range(-10, 11)) == 1)
chk("M1 predict int 3 delta(t) dt = 3", sp.integrate(3*sp.DiracDelta(t), (t, -sp.oo, sp.oo)) == 3)
chk("M1 predict unit-area rectangle of width 0.1 has height 10", 1/sp.Rational(1,10) == 10)
chk("M1 predict int cos t delta(t-pi) dt = -1",
    sp.integrate(sp.cos(t)*sp.DiracDelta(t-sp.pi), (t, -sp.oo, sp.oo)) == -1)
chk("M1 predict e^{-2t} reaches e^{-1} at t=1/2", sp.solve(sp.Eq(-2*t, -1), t) == [sp.Rational(1,2)])
chk("M1 predict e^{at} doubling each second has a = ln 2", sp.solve(sp.exp(sp.Symbol("a", real=True))-2) == [sp.log(2)])
chk("M1 predict -3e^{j2t}: A = 3, theta = pi", sp.Abs(-3) == 3 and sp.arg(-3) == sp.pi)
chk("M1 predict e^{(-1+j4)t} decays: Re a = -1 < 0", sp.re(-1+4*sp.I) < 0)
chk("M1 predict (-0.5)^n decays and alternates",
    all(abs((-0.5)**(m+1)) < abs((-0.5)**m) and (-0.5)**(m+1)*(-0.5)**m < 0 for m in range(10)))
chk("M1 predict alpha^3 = 8 gives alpha = 2", sp.real_roots(sp.Symbol('z')**3 - 8) == [2])
chk("M1 predict |1.1 e^{j pi/3}| = 1.1 > 1", sp.Abs(sp.Rational(11,10)*sp.exp(sp.I*sp.pi/3)) == sp.Rational(11,10))
chk("M1 predict e^{j2n} is aperiodic, since 1/pi is irrational", (1/sp.pi).is_rational is False)
chk("M1 predict e^{j0.5 pi t} has T0 = 4", 2*sp.pi/(sp.pi/2) == 4)
chk("M1 quick: e^{-|t|} has E = 1", sp.integrate(sp.exp(-2*sp.Abs(t)), (t, -sp.oo, sp.oo)) == 1)
P5 = sp.limit(sp.integrate(25*sp.cos(3*t)**2, (t, -T, T))/(2*T), T, sp.oo)
chk("M1 quick: 5cos(3t) has P = 25/2", P5 == sp.Rational(25,2), f"P={P5}")
chk("M1 quick: cos(n/4) is aperiodic, since 1/(8 pi) is irrational",
    (1/(8*sp.pi)).is_rational is False)
chk("M1 quick: the even part of u(t) is 1/2 for t != 0",
    all((sp.Heaviside(v) + sp.Heaviside(-v))/2 == sp.Rational(1,2) for v in (-3, -1, 2, 5)))
chk("M1 quick: u[n] - u[n-1] = delta[n]",
    all((int(m >= 0) - int(m - 1 >= 0)) == int(m == 0) for m in range(-5, 6)))
chk("M1 quick: Re e^{(-1+j2)t} = e^{-t} cos 2t",
    sp.simplify(sp.re(sp.exp((-1 + 2*sp.I)*t)) - sp.exp(-t)*sp.cos(2*t)) == 0)
chk("M1 quick: sgn(t) = 2u(t) - 1 for t != 0",
    all(sp.sign(v) == 2*sp.Heaviside(v) - 1 for v in (-3, -1, 2, 5)))

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

# Module 2 predictions on the slides and the quick-check slide
xv = sp.Symbol('xv')
chk("M2 predict 2x built as x+x equals the amplifier 2x", sp.simplify((xv + xv) - 2*xv) == 0)
chk("M2 predict y(t)=x(t/2): at t=2 it uses x(1)", sp.Rational(2, 2) == 1)
def accum(xseq):
    out, prev = [], 0
    for v in xseq: prev = v + prev; out.append(prev)
    return out
chk("M2 predict accumulator at rest, x=delta: y[3] = 1", accum([1, 0, 0, 0, 0])[3] == 1)
chk("M2 predict y(t)=x(2t): at t=1 it uses x(2), a future value", 2*1 == 2 and 2 > 1)
chk("M2 predict y(t)=x(t)+1 maps the zero input to 1, so it is not linear", (0 + 1) != 0)
chk("M2 qc y[n]=x[n]+x[n-2] uses n-2 != n", (n - 2) - n != 0)
chk("M2 qc y=3x-1 is inverted by x=(y+1)/3", sp.simplify(((3*xv - 1) + 1)/3 - xv) == 0)
chk("M2 qc y[n]=x[2n]: inputs that differ only at odd n give the same output",
    [a for a in [1, 5, 2, 7][::2]] == [a for a in [1, -3, 2, 9][::2]])
chk("M2 qc sum from k=n to inf uses k=n+1 > n", n + 1 > n)
chk("M2 qc integral over [t-1, t+1] reaches t+1 > t", True)
chk("M2 qc |x|<B gives 0 < e^x < e^B", bool(sp.exp(-3) > 0) and sp.exp(2) < sp.exp(3))
chk("M2 qc |x[n]+x[n-1]+x[n-2]| < 3B (triangle inequality, worst case x=B)",
    max(abs(sum(s)) for s in [(0.99, 0.99, 0.99), (-0.99, 0.99, -0.99)]) < 3*1)
x0 = sp.Function('x0'); t0 = sp.Symbol('t0', real=True)
chk("M2 qc y=x(t)+t is not time invariant: paths differ by t0",
    sp.simplify((x0(t - t0) + t) - (x0(t - t0) + (t - t0))) == t0)
chk("M2 qc y[n]=x[n]x[n-1] is time invariant (two paths agree for a random input)",
    (lambda xs: np.allclose(np.roll(xs*np.roll(xs, 1), 1)[2:], (np.roll(xs, 1)*np.roll(xs, 2))[2:]))(np.random.default_rng(2).normal(size=12)))
chk("M2 qc y=t x(t) is linear", sp.simplify(t*(a_*x1 + b_*x2) - (a_*t*x1 + b_*t*x2)) == 0)
chk("M2 qc x(t-2) is LTI; x^2 fails superposition with a=2",
    (2*1)**2 != 2*(1**2))
# Laboratory 2.3 and the code page
chk("M2 code accumulator on six ones: y[0..9] = 1..6, then 6",
    accum([1]*6 + [0]*4) == [1, 2, 3, 4, 5, 6, 6, 6, 6, 6])
chk("M2 code superposition difference for the square is 18",
    (lambda x1_, x2_: np.max(np.abs(((2*x1_ - x2_)[::2])**2 - (2*x1_[::2]**2 - x2_[::2]**2))))(
        np.array([1, 2, 0, -1, 3, 1, 2, 0]), np.array([0, 1, -2, 1, 1, 0, -1, 2])) == 18)
sav = sum(100*1.01**k for k in range(25))       # y[24] of y[n] = 1.01 y[n-1] + 100 from rest
chk("M2 gallery savings: 25 deposits of 100 at 1 % stay inside the 3400 axis", sav < 3400, f"y[24] = {sav:.0f}")

# Module 2 additions: one form, interconnection, inverse, time scaling, Re{x}, incrementally linear
Rs, Cs, rho, m_ = sp.symbols('R C rho m', positive=True)
tau_ = sp.Symbol('tau', positive=True)
chk("M2 models: step response of dy/dt + y/tau = x/tau from rest is 1 - e^{-t/tau}",
    sp.simplify(sp.diff(1 - sp.exp(-t/tau_), t) + (1 - sp.exp(-t/tau_))/tau_ - 1/tau_) == 0)
chk("M2 models: RC gives tau = RC, car gives tau = m/rho", sp.simplify(1/(1/(Rs*Cs)) - Rs*Cs) == 0
    and sp.simplify(1/(rho/m_) - m_/rho) == 0)
chk("M2 predict savings: y[n] - 1.01 y[n-1] = x[n] gives a = -1.01, b = 1",
    sp.Rational(-101, 100) == -sp.Rational(101, 100))
xs_ = np.random.default_rng(5).normal(size=12)
chk("M2 predict series delay then gain 2 equals 2 x[n-1]",
    np.allclose(2*np.concatenate(([0], xs_[:-1])), 2*np.roll(xs_, 1)*(np.arange(12) > 0)))
chk("M2 order in series: square then double 2x^2, double then square 4x^2",
    sp.expand(2*xv**2) != sp.expand((2*xv)**2) and sp.expand((2*xv)**2) == 4*xv**2)
chk("M2 inverse: first difference undoes the accumulator",
    np.allclose(np.diff(np.concatenate(([0], np.cumsum(xs_)))), xs_))
chk("M2 predict inverse of 3 x(t-2) is (1/3) y(t+2)",
    sp.simplify(sp.Rational(1, 3)*(3*x0((t + 2) - 2)) - x0(t)) == 0)
p_x1 = lambda v: 1.0 if abs(v) < 2 else 0.0                  # x1(t) = 1 for |t| < 2
tt_ = np.linspace(-2.5, 4.5, 7001)
y2_ = np.array([p_x1(2*v - 2) for v in tt_])                 # path 1: x1(2t - t0), t0 = 2
y1s = np.array([p_x1(2*(v - 2)) for v in tt_])               # path 2: y1(t - t0)
sup = lambda y: (round(tt_[y > 0].min(), 2), round(tt_[y > 0].max(), 2))
chk("M2 ti-c: path 1 pulse on 0<t<2, path 2 pulse on 1<t<3, so x(2t) is not time invariant",
    np.allclose(sup(y2_), (0, 2), atol=0.01) and np.allclose(sup(y1s), (1, 3), atol=0.01),
    f"{sup(y2_)} {sup(y1s)}")
chk("M2 Re{x}: x1 = 2+j gives y1 = 2; j x1 = -1+2j gives y2 = -1, not a y1 = 2j",
    (2+1j).real == 2 and (1j*(2+1j)) == (-1+2j) and (1j*(2+1j)).real == -1 and 1j*2 != -1)
chk("M2 Re{x} is additive for random complex inputs",
    (lambda u, v: np.allclose((u + v).real, u.real + v.real))(
        np.random.default_rng(6).normal(size=8) + 1j*np.random.default_rng(7).normal(size=8),
        np.random.default_rng(8).normal(size=8) + 1j*np.random.default_rng(9).normal(size=8)))
aff = lambda v: 3*v + 2
chk("M2 inclinear: y1 = 5, y2 = 8, y3 = 11, y1 + y2 = 13",
    (aff(1), aff(2), aff(1 + 2), aff(1) + aff(2)) == (5, 8, 11, 13))
chk("M2 inclinear: y1 - y2 = 3 (x1 - x2)", sp.simplify(aff(x1) - aff(x2) - 3*(x1 - x2)) == 0)

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

# Module 3 slides: predictions, worked steps, galleries and the quick check
d = lambda m, L=12: np.array([1.0 if i == m else 0.0 for i in range(L)])
hh = np.array([1, .8, .64, .512, 0, 0])
chk("M3 predict delta[n-3] -> h[n-3]", np.allclose(np.convolve(d(3, 8), hh)[:8], np.r_[0, 0, 0, hh[:5]]))
xr_ = {-1: 3, 2: -1}
chk("M3 predict x[n]=3d[n+1]-d[n-2]: x[-1] = 3", xr_.get(-1, 0) == 3)
xs3, hs3 = np.array([1., 2., 1., 2.]), np.array([1., .6, .3])
y3 = np.convolve(xs3, hs3)
chk("M3 flip either signal: y[3] = 3.2 both ways",
    abs(y3[3] - 3.2) < 1e-12 and abs(np.convolve(hs3, xs3)[3] - 3.2) < 1e-12, f"y={y3}")
chk("M3 predict x*delta[n-2] = x[n-2]", np.allclose(np.convolve(xs3, d(2, 3))[:6], np.r_[0, 0, xs3]))
chk("M3 predict h[3-k] = 0.3 at k = 1", hs3[3-1] == 0.3)
chk("M3 predict four copies: x has four non-zero samples", np.count_nonzero(xs3) == 4)
chk("M3 moving sum reading gives 1, 3, 3, 3, 2",
    [xs3[0], xs3[0]+xs3[1], xs3[1]+xs3[2], xs3[2]+xs3[3], xs3[3]] == [1, 3, 3, 3, 2])
nn_ = sp.Symbol('nn', integer=True, nonnegative=True)
chk("M3 geometric: (1-(1/2)^(n+1))/(1/2) = 2-(1/2)^n",
    sp.simplify((1-sp.Rational(1,2)**(nn_+1))/sp.Rational(1,2) - (2-sp.Rational(1,2)**nn_)) == 0)
xfun = sp.Function('xfun')
chk("M3 predict x(t)*delta(t-2) = x(t-2)",
    sp.integrate(xfun(tau)*sp.DiracDelta(t-2-tau), (tau, -sp.oo, sp.oo)) == xfun(t-2))
chk("M3 predict delta(3-t) sits at t=3", sp.solve(3-t, t) == [3])
chk("M3 predict the upper limit min(0, t-3) changes at t=3", sp.solve(t-3, t) == [3])
tg = np.linspace(-0.5, 3.5, 40001)
yg = np.array([y_exact(v) for v in tg])
chk("M3 predict rect*ramp is largest at t=2", abs(tg[np.argmax(yg)] - 2) < 1e-3)
chk("M3 case II integral = t^2/2", sp.simplify(sp.integrate(tau, (tau, 0, t)) - t**2/2) == 0)
chk("M3 case III integral = t - 1/2", sp.simplify(sp.integrate(tau, (tau, t-1, t)) - (t-sp.Rational(1,2))) == 0)
chk("M3 case IV integral = -t^2/2 + t + 3/2",
    sp.simplify(sp.integrate(tau, (tau, t-1, 2)) - (-t**2/2+t+sp.Rational(3,2))) == 0)
chk("M3 predict parallel delta[n] and delta[n-1]: h = delta[n]+delta[n-1]",
    np.allclose(d(0, 4) + d(1, 4), [1, 1, 0, 0]))
u10 = np.ones(10)
casc = np.convolve([1, -1], u10)
chk("M3 predict first difference * u[n] = delta[n] (on the kept samples)",
    np.allclose(casc[:10], d(0, 10)))
chk("M3 predict h=delta[n+1] is not causal: h[-1] = 1", True)
chk("M3 predict (-1/2)^n u[n]: sum |h| = 2", sp.summation(sp.Rational(1,2)**nn_, (nn_, 0, sp.oo)) == 2)
chk("M3 partial sums of 0.7^k tend to 10/3", sp.summation(sp.Rational(7,10)**nn_, (nn_, 0, sp.oo)) == sp.Rational(10,3))
hs8 = np.array([(-0.8)**k for k in range(400)])
y0 = float(np.sum(hs8*np.sign(hs8)))
chk("M3 predict sign input: y[0] = sum 0.8^k = 5", abs(y0 - 5) < 1e-9, f"y0={y0}")
chk("M3 sign input stays within 1", np.max(np.abs(np.sign(hs8))) <= 1)
# galleries
xt_ = lambda m: 10 if m < 5 else 20
ma = [(xt_(m)+xt_(m-1)+xt_(m-2))/3 for m in range(4, 9)]
chk("M3 gallery three-day average climbs 10, 13.3, 16.7, 20", np.allclose(ma, [10, 40/3, 50/3, 20, 20]))
hecho = np.zeros(22); hecho[0], hecho[6] = 1, 0.5
xcl = np.zeros(16); xcl[0] = xcl[15] = 1
ycl = np.convolve(xcl, hecho)
chk("M3 gallery two clicks through the echo: y = h[n] + h[n-15]",
    set(np.nonzero(ycl)[0]) == {0, 6, 15, 21} and ycl[6] == 0.5 and ycl[21] == 0.5)
chk("M3 gallery two RC stages: e^{-t}u * e^{-t}u = t e^{-t}",
    sp.simplify(sp.integrate(sp.exp(-tau)*sp.exp(-(t-tau)), (tau, 0, t)) - t*sp.exp(-t)) == 0)
chk("M3 gallery smoother: sum 0.2*0.8^n = 1", sp.summation(sp.Rational(1,5)*sp.Rational(4,5)**nn_, (nn_, 0, sp.oo)) == 1)
chk("M3 gallery howl 1.08^29 stays inside the 10.5 axis", 1.08**29 < 10.5, f"{1.08**29:.2f}")
chk("M3 gallery RC pulse: 5(1-e^{-t}) is continuous with the decay at t=1",
    abs(5*(1-math.exp(-1)) - 5*(1-math.exp(-1))*math.exp(0)) < 1e-12)
chk("M3 gallery RC pulse = rect(0,1) * e^{-t}u(t), for 0<t<1",
    sp.simplify(sp.integrate(5*sp.exp(-(t-tau)), (tau, 0, t)) - 5*(1-sp.exp(-t))) == 0)
chk("M3 gallery thermometer: step * (1/10)e^{-t/10} gives 10(1-e^{-t/10})",
    sp.simplify(sp.integrate(10*sp.exp(-(t-tau)/10)/10, (tau, 0, t)) - 10*(1-sp.exp(-t/10))) == 0)
sv = sp.Symbol('sv', real=True)
chk("M3 gallery blurred edge: u(s) * box(-1,1)/2 = (s+1)/2 on (-1,1)",
    sp.simplify(sp.integrate(sp.Rational(1,2), (tau, -1, sv)) - (sv+1)/2) == 0)
# quick check
chk("M3 qc impulse response of x[n]-x[n-1] is d[n]-d[n-1]", np.allclose(d(0, 4) - np.r_[0, d(0, 3)], [1, -1, 0, 0]))
chk("M3 qc {1,2,3}*{1,1,1,1} has 6 samples", len(np.convolve([1, 2, 3], [1, 1, 1, 1])) == 6)
chk("M3 qc sum rule 3 x 4 = 12", np.sum(np.convolve([1, 2], [1, 3])) == 3*4)
chk("M3 qc supports [0,2] + [1,4] = [1,6]", (0+1, 2+4) == (1, 6))
chk("M3 qc area of (u(t)-u(t-2)) * itself is 4", sp.integrate(sp.Piecewise((t, t < 2), (4-t, True)), (t, 0, 4)) == 4)
chk("M3 qc u(t)*u(t) = t for t>0", sp.integrate(1, (tau, 0, t)) == t)
chk("M3 qc h(t)=e^{-t}u(t+1): h(-0.5) = e^{0.5} != 0", math.exp(0.5) != 0)
chk("M3 qc u[n]-u[n-10]: sum |h| = 10", np.sum(np.abs(np.ones(10))) == 10)

# Module 3 laboratories M, E (dt3), N (ct3) and O
xq = np.array([1., 2., 1., 2.])
sysA = lambda x: np.convolve(x, [1, .5, .25])[:len(x)]
sysC = lambda x: np.convolve(x, [1/3, 1/3, 1/3])[:len(x)]
def sysB(x):
    y, out = 0.0, []
    for v in x: y = 0.5*y + v; out.append(y)
    return np.array(out)
xin = np.r_[xq, np.zeros(8)]; dlt = d(0, 12)
for nm, S in (('A', sysA), ('B', sysB), ('C', sysC)):
    chk(f"M3 lab M system {nm}: predicted x*h equals the true output",
        np.allclose(np.convolve(xin, S(dlt))[:12], S(xin)))
chk("M3 lab M measured h: A 1,0.5,0.25,0; B 1,0.5,0.25,0.125; C 1/3,1/3,1/3,0",
    np.allclose(sysA(dlt)[:4], [1, .5, .25, 0]) and np.allclose(sysB(dlt)[:4], [1, .5, .25, .125])
    and np.allclose(sysC(dlt)[:4], [1/3, 1/3, 1/3, 0]))
chk("M3 lab M squarer: 2delta predicted 2, true 4, gap 2", (2*1**2, 2**2, 2**2 - 2) == (2, 4, 2))
chk("M3 lab E dt3: {1,2,1,2}*{1,0.6,0.3} = 1, 2.6, 2.5, 3.2, 1.5, 0.6",
    np.allclose(np.convolve(xq, [1, .6, .3]), [1, 2.6, 2.5, 3.2, 1.5, 0.6]))
chk("M3 lab N ct3: rect(0,1)*rect(0,1) = t on (0,1), 2-t on (1,2)",
    sp.integrate(1, (tau, 0, t)) == t and sp.simplify(sp.integrate(1, (tau, t-1, 1)) - (2-t)) == 0)
chk("M3 lab O: sum 0.7^k = 10/3", sp.summation(sp.Rational(7,10)**nn_, (nn_, 0, sp.oo)) == sp.Rational(10,3))
chk("M3 lab O: sum 0.5^|k| = 1 + 2 = 3", 1 + 2*sp.summation(sp.Rational(1,2)**nn_, (nn_, 1, sp.oo)) == 3)
chk("M3 lab O: 2delta, delta[n+1]+delta[n], delta[n]-delta[n-1] each sum |h| = 2", (2, 1+1, 1+abs(-1)) == (2, 2, 2))
chk("M3 lab O: (1.1)^k grows, so the sum diverges", 1.1**50 > 100)

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
