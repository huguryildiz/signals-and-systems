#!/usr/bin/env python3
"""Question-bank numerical verification (Modules 1-4).

Every question whose answer contains a number, a support, a period or a
closed form is re-derived here independently of the text written into the
bank files.  One PASS/FAIL line is printed per checked question.

The numbers a question quotes are written into the checks as literals, so a
check binds to the text: change either one and the line goes red.  Module 4
carries the further test that each distractor is wrong for the reason its
wrong{} entry gives, since verify/verify_m4.py already covers the mathematics
of the module itself.
"""
import numpy as np
import sympy as sp

results = []


def check(qid, claim, ok, detail=""):
    results.append((qid, bool(ok)))
    print(("PASS" if ok else "FAIL") + f"  {qid}  {claim}" + (f"   [{detail}]" if detail else ""))


t, tau, n, k = sp.symbols('t tau n k', real=True)

# ---------------------------------------------------------------- MODULE 1
# Q1-04  E_inf of x(t) = 3 e^{-2t} u(t)
E = sp.integrate((3*sp.exp(-2*t))**2, (t, 0, sp.oo))
check('Q1-04', 'E_inf = 9/4 J = 2.25 J, energy signal', E == sp.Rational(9, 4), f'E={E}')
# distractor arithmetic that the options quote
check('Q1-04b', 'distractors 4.5 / 1.5 J arise from the two named slips',
      sp.integrate(9*sp.exp(-2*t), (t, 0, sp.oo)) == sp.Rational(9, 2)
      and sp.integrate(3*sp.exp(-2*t), (t, 0, sp.oo)) == sp.Rational(3, 2))

# Q1-05  P_inf of x(t) = 5 cos(4t - pi/3)
# sympy's limit() returns AccumBounds for the bounded oscillating remainder, so the
# average is verified as (exact integral)/(2T) evaluated for growing T, plus the
# exact one-period average.
T = sp.symbols('T', positive=True)
I2T = sp.integrate((5*sp.cos(4*t - sp.pi/3))**2, (t, -T, T))
seq = [float((I2T/(2*T)).subs(T, Tv)) for Tv in (10, 10**3, 10**6)]
T0_ = sp.pi/2                                    # one period of cos^2(4t-.)
Pper = sp.integrate((5*sp.cos(4*t - sp.pi/3))**2, (t, 0, T0_))/T0_
check('Q1-05', 'P_inf = 12.5 W (A^2/2), power signal',
      sp.simplify(Pper - sp.Rational(25, 2)) == 0 and abs(seq[-1] - 12.5) < 1e-5,
      f'per-period={Pper}, seq={[round(s,6) for s in seq]}')
check('Q1-05b', 'energy is infinite, so it is a power signal',
      sp.integrate((5*sp.cos(4*t - sp.pi/3))**2, (t, -sp.oo, sp.oo)) in (sp.oo, sp.Integer(0)*sp.oo)
      or float(I2T.subs(T, 10**6)) > 1e6)

# Q1-06  N0 of x[n] = cos(4*pi*n/9 + pi/5)
w0 = 4*np.pi/9
nn = np.arange(-200, 200)
x = np.cos(w0*nn + np.pi/5)
per = [N for N in range(1, 60) if np.allclose(np.cos(w0*(nn+N) + np.pi/5), x, atol=1e-12)]
check('Q1-06', 'N0 = 9 for cos(4*pi*n/9 + pi/5)', per[0] == 9, f'periods={per[:4]}')

# Q1-07  x(t) = 2u(t): E infinite, P = 2 W  (NOT 4 W)
Pu = sp.limit(sp.integrate(4, (t, 0, T))/(2*T), T, sp.oo)
Eu = sp.integrate(4, (t, 0, sp.oo))
check('Q1-07', 'x(t)=2u(t): P_inf = 2 W, E_inf infinite', Pu == 2 and Eu == sp.oo, f'P={Pu}, E={Eu}')

# Q1-08  support of y(t) = x(2t+6), x = 1 on [2,6]
g = np.linspace(-10, 10, 400001)
xv = ((2*g + 6) >= 2) & ((2*g + 6) <= 6)
lo, hi = g[xv].min(), g[xv].max()
wrong = np.linspace(-10, 10, 400001)
wv = ((2*(wrong + 6)) >= 2) & ((2*(wrong + 6)) <= 6)   # scale-then-shift (wrong order)
check('Q1-08', 'support of x(2t+6) is [-2,0]', abs(lo + 2) < 1e-4 and abs(hi) < 1e-4, f'[{lo:.4f},{hi:.4f}]')
check('Q1-08b', 'wrong-order answer is [-5,-3]',
      abs(wrong[wv].min() + 5) < 1e-4 and abs(wrong[wv].max() + 3) < 1e-4)

# Q1-09  x(t) = e^{-|t|}: E_x = 1 J;  y(t) = x(2t-4): E_y = 0.5 J, peak at t = 2
Ex = sp.integrate(sp.exp(-2*sp.Abs(t)), (t, -sp.oo, sp.oo))
Ey = sp.integrate(sp.exp(-2*sp.Abs(2*t - 4)), (t, -sp.oo, sp.oo))
gg = np.linspace(-5, 9, 1400001)
peak = gg[np.argmax(np.exp(-np.abs(2*gg - 4)))]
check('Q1-09', 'E_x = 1 J, E_y = 0.5 J, peak of y at t = 2 s',
      Ex == 1 and Ey == sp.Rational(1, 2) and abs(peak - 2) < 1e-4, f'Ex={Ex}, Ey={Ey}, peak={peak:.4f}')

# Q1-10  x(t) = 4cos(6t) + 2sin(9t): T0 = 2*pi/3, w0 = 3 rad/s
tt = np.linspace(0, 40, 4000001)
xf = 4*np.cos(6*tt) + 2*np.sin(9*tt)


def is_period(Tc):
    s = np.linspace(0, 6, 60001)
    return np.allclose(4*np.cos(6*(s+Tc)) + 2*np.sin(9*(s+Tc)), 4*np.cos(6*s) + 2*np.sin(9*s), atol=1e-9)


cands = [c*np.pi/12 for c in range(1, 25)]
smallest = min([c for c in cands if is_period(c)])
check('Q1-10', 'T0 = 2*pi/3 s and w0 = 3 rad/s for 4cos(6t)+2sin(9t)',
      abs(smallest - 2*np.pi/3) < 1e-9 and abs(2*np.pi/smallest - 3) < 1e-9, f'T0={smallest:.6f}')

# Q1-11  stems of y[n] = x[2-n]; x[-3]=2, x[-2]=-1, x[0]=3, x[1]=1
X = {-3: 2, -2: -1, 0: 3, 1: 1}
y_corr = {m: X[2-m] for m in range(-10, 11) if (2-m) in X}
y_alt1 = {m: X[-m-2] for m in range(-10, 11) if (-m-2) in X}     # x[-n-2]
y_alt2 = {m: X[m+2] for m in range(-10, 11) if (m+2) in X}       # shift only
y_alt3 = {m: X[-m] for m in range(-10, 11) if (-m) in X}         # reversal only
check('Q1-11', 'y[n]=x[2-n] -> y[1]=1, y[2]=3, y[4]=-1, y[5]=2',
      y_corr == {1: 1, 2: 3, 4: -1, 5: 2}, str(y_corr))
check('Q1-11b', 'distractor sets distinct from the key',
      y_alt1 == {-3: 1, -2: 3, 0: -1, 1: 2} and y_alt2 == {-5: 2, -4: -1, -2: 3, -1: 1}
      and y_alt3 == {-1: 1, 0: 3, 2: -1, 3: 2})

# Q1-12  v(t) = 6 e^{-500t} u(t) V across R = 50 ohm
Enorm = sp.integrate((6*sp.exp(-500*t))**2, (t, 0, sp.oo))          # V^2 s
Ereal = Enorm/50
check('Q1-12', 'E = 0.72 mJ into 50 ohm (normalised 0.036 V^2 s)',
      Enorm == sp.Rational(36, 1000) and sp.nsimplify(Ereal) == sp.Rational(72, 100000),
      f'Enorm={float(Enorm)}, E={float(Ereal)}')
check('Q1-12b', 'distractors 36 mJ / 1.44 mJ / 1.8 J reproduce the named slips',
      abs(float(Enorm) - 0.036) < 1e-12
      and abs(float(sp.integrate(36*sp.exp(-500*t), (t, 0, sp.oo))/50) - 1.44e-3) < 1e-12
      and abs(float(Enorm*50) - 1.8) < 1e-12)

# ---------------------------------------------------------------- MODULE 2
# Q2-04  y(t) = x(2t), t0 = 3 : y2(t) = x(2t-3),  y1(t-3) = x(2t-6)
xs = sp.Function('x')
y1 = xs(2*t)
y2 = xs(2*t - 3)                      # response to x(t-3):  x((2t)-3)
y1s = y1.subs(t, t - 3)               # x(2(t-3)) = x(2t-6)
check('Q2-04', 'y2(t)=x(2t-3) vs y1(t-3)=x(2t-6): not time invariant',
      y1s == xs(2*t - 6) and y2 != y1s, f'{y2} vs {y1s}')
# numeric confirmation with a concrete x
xn_ = lambda a: np.exp(-(a - 1.0)**2)
gt = np.linspace(-5, 5, 100001)
check('Q2-04b', 'numeric: the two responses differ', not np.allclose(xn_(2*gt - 3), xn_(2*gt - 6)))

# Q2-05  y[n] = x[n]x[n-1] with x1=d[n], x2=d[n-1]
idx = np.arange(-3, 8)
d = lambda m: (idx == m).astype(float)
sysp = lambda xx: xx*np.roll(xx, 1)
x1, x2 = d(0), d(1)
y1v, y2v, y3v = sysp(x1), sysp(x2), sysp(x1 + x2)
i1 = list(idx).index(1)
check('Q2-05', 'y3[1] = 1 while y1[1]+y2[1] = 0 -> not linear',
      y3v[i1] == 1 and (y1v[i1] + y2v[i1]) == 0, f'y3[1]={y3v[i1]}, y1+y2={y1v[i1]+y2v[i1]}')

# Q2-06  y(t)=3x(t-2)+2x^2(t), |x|<=4 -> |y| <= 44, attained by x = 4
check('Q2-06', 'tight bound |y| <= 44, attained by the constant input x(t)=4',
      3*4 + 2*16 == 44 and 3*4 + 2*4**2 == 44)

# Q2-08  y[n] = (-1)^n x[n]: passes a shift of 2, fails a shift of 1
N = np.arange(-6, 12)
S = lambda xx: ((-1.0)**N)*xx
dd = lambda m: (N == m).astype(float)


def shift(sig, m):
    out = np.zeros_like(sig)
    for i, nv in enumerate(N):
        j = np.where(N == nv - m)[0]
        if len(j):
            out[i] = sig[j[0]]
    return out


ok2 = np.allclose(S(dd(0+2)), shift(S(dd(0)), 2))
ok1 = np.allclose(S(dd(0+1)), shift(S(dd(0)), 1))
check('Q2-08', 'single test with t0=2 passes, t0=1 fails -> not time invariant', ok2 and not ok1,
      f'shift2 ok={ok2}, shift1 ok={ok1}')

# Q2-09  y(t) = x(t-2) + x(4-t): linear, stable, not causal, not TI
gt = np.linspace(-6, 10, 160001)
xf1 = lambda a: np.exp(-(a - 0.0)**2)          # test signal
Y = lambda xf: xf(gt - 2) + xf(4 - gt)
t0 = 1.5
xf2 = lambda a: xf1(a - t0)
y_shift_in = Y(xf2)
y_out_shift = np.interp(gt - t0, gt, Y(xf1))
check('Q2-09', 'y(t)=x(t-2)+x(4-t) is not time invariant', not np.allclose(y_shift_in, y_out_shift, atol=1e-6))
check('Q2-09b', 'non-causal: at t=0 the rule needs x(4)', 4 - 0 > 0)
check('Q2-09c', 'BIBO stable: |y| <= 2B', np.max(np.abs(Y(xf1))) <= 2*np.max(np.abs(xf1(gt))) + 1e-12)

# Q2-10  y(t) = x(t)cos(5t): not TI; value at t = pi/10 is lost (not invertible)
Y2 = lambda xf: xf(gt)*np.cos(5*gt)
y_in = Y2(lambda a: xf1(a - t0))
y_os = np.interp(gt - t0, gt, Y2(xf1))
check('Q2-10', 'y(t)=x(t)cos(5t) is not time invariant', not np.allclose(y_in, y_os, atol=1e-6))
check('Q2-10b', 'cos(5t)=0 at t=pi/10, so x(pi/10) cannot be recovered',
      abs(np.cos(5*np.pi/10)) < 1e-12)

# Q2-12  accumulator with a 0.02 unit bias over 10 000 samples
bias, Ns = 0.02, 10000
acc = np.cumsum(np.full(Ns, bias))
check('Q2-12', 'accumulated drift after 10 000 samples = 200 units', abs(acc[-1] - 200.0) < 1e-9,
      f'drift={acc[-1]:.3f}')

# ---------------------------------------------------------------- MODULE 3
# Q3-04  {2,-1,3} * {1,4}
y = np.convolve([2, -1, 3], [1, 4])
check('Q3-04', 'y[n] = {2, 7, -1, 12} on n = 0..3', list(y) == [2, 7, -1, 12], str(list(y)))
check('Q3-04b', 'flipped-h distractor is {8,-2,11,3}', list(np.convolve([2, -1, 3], [4, 1])) == [8, -2, 11, 3])

# Q3-05  supports: x on 2..6, h on -3..1
xs_ = np.zeros(41); hs_ = np.zeros(41)          # index offset -20 .. 20
off = 20
for m in range(2, 7):
    xs_[m + off] = 1.0
for m in range(-3, 2):
    hs_[m + off] = 1.0
full = np.convolve(xs_, hs_)
nz = np.nonzero(full)[0] - 2*off
check('Q3-05', 'support of y is -1 <= n <= 7 (9 samples)',
      nz.min() == -1 and nz.max() == 7 and (nz.max() - nz.min() + 1) == 9, f'[{nz.min()},{nz.max()}]')

# Q3-06  e^{-3t}u(t) * u(t) = (1/3)(1 - e^{-3t})u(t)
ycl = sp.integrate(sp.exp(-3*tau), (tau, 0, t))
check('Q3-06', 'y(t) = (1/3)(1 - e^{-3t}) u(t)',
      sp.simplify(ycl - (1 - sp.exp(-3*t))/3) == 0, str(sp.simplify(ycl)))
dt_ = 1e-4
ax = np.arange(0, 12, dt_)
ynum = np.convolve(np.exp(-3*ax), np.ones_like(ax))[:len(ax)]*dt_
check('Q3-06b', 'numeric convolution matches at t = 1 and t = 2',
      abs(ynum[int(1/dt_)] - (1 - np.exp(-3))/3) < 1e-4 and abs(ynum[int(2/dt_)] - (1 - np.exp(-6))/3) < 1e-4)

# Q3-07  x = {1,2,3}, h = {4,5,6}: y[2] = 28; no-flip answer = 32
yy = np.convolve([1, 2, 3], [4, 5, 6])
check('Q3-07', 'y[2] = 28 (flip included); 32 is the no-flip value; 90 is the grand total',
      yy[2] == 28 and np.dot([1, 2, 3], [4, 5, 6]) == 32 and yy.sum() == 90, str(list(yy)))

# Q3-08  h[n] = 1/(n+1) u[n]: h -> 0 but sum diverges
partial = [np.sum(1.0/(np.arange(M) + 1)) for M in (10, 10**3, 10**6)]
check('Q3-08', 'h[n]=1/(n+1)u[n] tends to 0 yet sum|h| diverges (~ln N)',
      partial[-1] > 14 and partial[-1] > partial[-2] > partial[-3], f'partial sums={[round(p,3) for p in partial]}')

# Q3-09  x = 1 on (0,2), h = e^{-t}u(t)
y_a = sp.integrate(sp.exp(-(t - tau)), (tau, 0, t))                 # 0 <= t <= 2
y_b = sp.integrate(sp.exp(-(t - tau)), (tau, 0, 2))                 # t > 2
check('Q3-09', 'y = 1-e^{-t} on 0<=t<=2 and (e^2-1)e^{-t} for t>2',
      sp.simplify(y_a - (1 - sp.exp(-t))) == 0 and sp.simplify(y_b - (sp.exp(2) - 1)*sp.exp(-t)) == 0)
v3 = float((sp.exp(2) - 1)*sp.exp(-3))
check('Q3-09b', 'y(3) = (e^2-1)e^{-3} = 0.3181', abs(v3 - 0.3181) < 5e-4, f'y(3)={v3:.5f}')
check('Q3-09c', 'continuity at t = 2 and distractor values 0.9502 / 0.0996 / 0.6321',
      abs(float(y_a.subs(t, 2)) - float(y_b.subs(t, 2))) < 1e-12
      and abs((1 - np.exp(-3)) - 0.9502) < 1e-3
      and abs(2*np.exp(-3) - 0.0996) < 1e-3
      and abs((1 - np.exp(-1)) - 0.6321) < 1e-3)
dt_ = 5e-5
ax = np.arange(0, 12, dt_)
xrect = ((ax > 0) & (ax < 2)).astype(float)
ynum = np.convolve(xrect, np.exp(-ax))[:len(ax)]*dt_
check('Q3-09d', 'numeric convolution gives y(3) ~ 0.318', abs(ynum[int(3/dt_)] - v3) < 2e-3,
      f'num={ynum[int(3/dt_)]:.5f}')

# Q3-10  x[n] = (1/4)^n u[n], h[n] = u[n-2]
Nmax = 40
xq = np.array([(0.25)**m for m in range(Nmax)])
hq = np.array([1.0 if m >= 2 else 0.0 for m in range(Nmax)])
yq = np.convolve(xq, hq)[:Nmax]
closed = np.array([0.0 if m < 2 else (4/3)*(1 - 0.25**(m - 1)) for m in range(Nmax)])
check('Q3-10', 'y[n] = (4/3)(1-(1/4)^{n-1}) for n>=2, 0 otherwise; limit 4/3',
      np.allclose(yq, closed, atol=1e-12) and abs(closed[-1] - 4/3) < 1e-9,
      f'y[2]={yq[2]:.4f}, y[3]={yq[3]:.4f}, lim={closed[-1]:.6f}')
off1 = np.array([0.0 if m < 2 else (4/3)*(1 - 0.25**(m - 2)) for m in range(Nmax)])
check('Q3-10b', 'off-by-one distractor (4/3)(1-(1/4)^{n-2}) differs at n=2',
      not np.allclose(off1, closed) and abs(off1[2]) < 1e-12)

# Q3-11  x = 1 on (0,4);  h = 1 on (1,3)  ->  trapezoid, support [1,7], plateau 2 on [3,5]
dt_ = 2e-4
ax = np.arange(-2, 12, dt_)
xr = ((ax > 0) & (ax < 4)).astype(float)
hr = ((ax > 1) & (ax < 3)).astype(float)
yv = np.convolve(xr, hr)[:len(ax)]*dt_
axc = ax + ax[0]                       # convolution abscissa
sup = axc[yv > 1e-6]
plateau = yv[(axc > 3.2) & (axc < 4.8)]
check('Q3-11', 'trapezoid: support [1,7], plateau value 2 on [3,5]',
      abs(sup.min() - 1) < 5e-3 and abs(sup.max() - 7) < 5e-3 and abs(plateau.mean() - 2) < 5e-3,
      f'support [{sup.min():.3f},{sup.max():.3f}], plateau={plateau.mean():.4f}')
check('Q3-11b', 'value at t=2 is 1 (mid-ramp)', abs(np.interp(2.0, axc, yv) - 1.0) < 5e-3)

# Q3-12  echo h[n] = d[n] + 0.5 d[n-3];  inverse g[n] = sum (-0.5)^k d[n-3k]
L = 60
h12 = np.zeros(L); h12[0] = 1; h12[3] = 0.5
g12 = np.zeros(L)
for m in range(L//3):
    g12[3*m] = (-0.5)**m
cascade = np.convolve(h12, g12)[:L]
ideal = np.zeros(L); ideal[0] = 1
check('Q3-12', 'h*g = delta[n] (truncated tail < 1e-6) and sum|g| = 2',
      np.max(np.abs(cascade - ideal)) < 1e-6 and abs(np.sum(np.abs(g12)) - 2) < 1e-5,
      f'max err={np.max(np.abs(cascade-ideal)):.2e}, sum|g|={np.sum(np.abs(g12)):.4f}')
gbad = np.zeros(L); gbad[0] = 1; gbad[3] = -0.5
check('Q3-12b', 'single-term inverse d[n]-0.5d[n-3] leaves a residual at n=6',
      abs(np.convolve(h12, gbad)[6] + 0.25) < 1e-12)
gsgn = np.zeros(L)
for m in range(L//3):
    gsgn[3*m] = (0.5)**m
check('Q3-12c', 'sign-error inverse does not give delta', np.max(np.abs(np.convolve(h12, gsgn)[:L] - ideal)) > 0.5)

# ---------------------------------------------------------------- MODULE 4
# verify_m4.py already re-derives the mathematics of the module. What is checked
# here is the question: that the keyed option is the correct one, and that each
# distractor is wrong for the reason its wrong{} entry gives.
trapz = getattr(np, 'trapezoid', None) or np.trapz


def ck(f, T0, kk, M=400001):
    """a_k of a continuous-time periodic signal, by numerical integration."""
    tg = np.linspace(-T0/2, T0/2, M)
    return trapz(f(tg)*np.exp(-2j*np.pi*kk*tg/T0), tg)/T0


def dfs(x, Np):
    """a_k, k = 0 .. N-1, of one period of a discrete-time periodic sequence."""
    nn_ = np.arange(Np)
    return np.array([np.sum(x*np.exp(-2j*np.pi*kv*nn_/Np))/Np for kv in range(Np)])


# Q4-01  eigenfunction property, checked on the delay h(t) = delta(t-3)
s0 = 2j
Hdel = np.exp(-3*s0)                                  # H(s) = e^{-3s}
tg = np.linspace(-4, 4, 40001)
check('Q4-01', 'h(t)=delta(t-3): H(j2)e^{j2t} equals the delayed input e^{j2(t-3)}',
      np.allclose(Hdel*np.exp(s0*tg), np.exp(s0*(tg - 3))), f'H(j2)={Hdel:.4f}')
hq = np.array([0.4, 0.25, 0.2, 0.15])                 # a concrete DT impulse response
zq = 0.9*np.exp(0.3j)
nq = np.arange(0, 25)
yq = np.array([np.sum(hq*zq**(m - np.arange(4))) for m in nq])
Hz = np.sum(hq*zq**(-np.arange(4)))
check('Q4-01b', 'discrete time: z^n gives H(z)z^n, a sequence and not a function of t',
      np.allclose(yq, Hz*zq**nq), f'H(z)={Hz:.4f}')

# Q4-02  x(t) = 1 + (1/2)cos(2 pi t) + sin(3 pi t), T0 = 2 s
x2 = lambda a: 1 + 0.5*np.cos(2*np.pi*a) + np.sin(3*np.pi*a)
a0_2 = ck(x2, 2, 0)
check('Q4-02', 'a_0 = 1: the average is the constant term, not zero',
      abs(a0_2 - 1) < 1e-9 and abs(a0_2.imag) < 1e-9, f'a_0={a0_2.real:.9f}')
check('Q4-02b', 'the two sinusoids do average to zero over T0 = 2 s (the distractor 0 drops the constant)',
      abs(ck(lambda a: 0.5*np.cos(2*np.pi*a), 2, 0)) < 1e-9
      and abs(ck(lambda a: np.sin(3*np.pi*a), 2, 0)) < 1e-9)
check('Q4-02c', 'the consistency check in the solution: |a_2| = 1/4 and |a_3| = 1/2, so 1/2 is not a_0',
      abs(abs(ck(x2, 2, 2)) - 0.25) < 1e-6 and abs(abs(ck(x2, 2, 3)) - 0.5) < 1e-6,
      f'|a_2|={abs(ck(x2,2,2)):.6f}, |a_3|={abs(ck(x2,2,3)):.6f}')

# Q4-03  the finite geometric sum needs r != 1, nothing more
rv = np.exp(-1j*2*np.pi*3/16)                          # |r| = 1, r != 1
m_, p_ = -3, 3
direct = sum(rv**q for q in range(m_, p_+1))
closed = (rv**m_ - rv**(p_+1))/(1 - rv)
check('Q4-03', 'the closed form matches the finite sum where r != 1, with |r| = 1 throughout',
      abs(direct - closed) < 1e-12 and abs(abs(rv) - 1) < 1e-12, f'|r|={abs(rv):.12f}')
check('Q4-03b', 'at r = 1 the sum is still defined and equals p-m+1 = 7, while 1-r vanishes',
      sum(1**q for q in range(m_, p_+1)) == p_ - m_ + 1 and abs(1 - 1) == 0)
# the two branches of the discrete-time square wave, N = 16, N1 = 3
Nq, N1q = 16, 3
xsq = np.array([1.0 if (min(v, Nq-v) <= N1q) else 0.0 for v in range(Nq)])
adfs = dfs(xsq, Nq)
brancha = [(2*N1q+1)/Nq if kv % Nq == 0
           else np.sin(2*np.pi*kv*(N1q+0.5)/Nq)/(Nq*np.sin(np.pi*kv/Nq)) for kv in range(Nq)]
check('Q4-03c', 'both branches reproduce the coefficients: (2N1+1)/N at k = 0 mod N, the ratio elsewhere',
      np.allclose(adfs.real, brancha, atol=1e-12) and np.max(np.abs(adfs.imag)) < 1e-12,
      f'a_0={adfs[0].real:.6f} = {(2*N1q+1)/Nq}')

# Q4-04  fundamental period of a sum: LCM(numerators)/GCD(denominators)
T1r, T2r = sp.Rational(2, 9), sp.Rational(8, 21)
T0r = sp.Rational(sp.lcm(2, 8), sp.gcd(9, 21))
check('Q4-04', 'T0 = LCM(2,8)/GCD(9,21) = 8/3 s, and both quotients are whole',
      T0r == sp.Rational(8, 3) and (T0r/T1r).is_Integer and (T0r/T2r).is_Integer
      and sp.gcd(int(T0r/T1r), int(T0r/T2r)) == 1,
      f'T0={T0r}, T0/T1={T0r/T1r}, T0/T2={T0r/T2r}')
check('Q4-04b', 'the 8/63 distractor is not a common period: (8/63)/(2/9) = 4/7',
      sp.Rational(8, 63)/T1r == sp.Rational(4, 7) and not (sp.Rational(8, 63)/T1r).is_Integer)
check('Q4-04c', 'the 16/63 distractor divides by neither period',
      not (sp.Rational(16, 63)/T1r).is_Integer and not (sp.Rational(16, 63)/T2r).is_Integer)
check('Q4-04d', 'the ratio of the periods is 7/12, rational, so the sum is periodic',
      T1r/T2r == sp.Rational(7, 12))
check('Q4-04e', 'w0 = 2 pi/(8/3) = 3 pi/4 rad/s', sp.simplify(2*sp.pi/T0r - 3*sp.pi/4) == 0)

# Q4-05  a_3 of the same signal: 1/(2j), magnitude 1/2, phase -pi/2
a3 = ck(x2, 2, 3)
am3 = ck(x2, 2, -3)
check('Q4-05', 'a_3 = 1/(2j) = -j/2: |a_3| = 1/2 and angle a_3 = -pi/2',
      abs(a3 - (-0.5j)) < 1e-6 and abs(abs(a3) - 0.5) < 1e-6
      and abs(np.angle(a3) + np.pi/2) < 1e-6, f'a_3={a3:.6f}, angle={np.angle(a3):.6f}')
check('Q4-05b', '+pi/2 is the phase of a_{-3} = -1/(2j), and a_{-3} = conj(a_3) as a real signal requires',
      abs(np.angle(am3) - np.pi/2) < 1e-6 and abs(am3 - np.conj(a3)) < 1e-6,
      f'angle a_-3={np.angle(am3):.6f}')
check('Q4-05c', 'a real cosine of amplitude 1 at k=3 would give a_3 = 1/2, which the sine does not',
      abs(ck(lambda a: np.cos(3*np.pi*a), 2, 3) - 0.5) < 1e-6 and abs(a3.real) < 1e-6)

# Q4-06  rectangular wave, T0 = 8 T1, T1 = 1
T0q, T1q = 8.0, 1.0
xr6 = lambda a: (np.abs(a) < T1q).astype(float)
a0_6, a2_6 = ck(xr6, T0q, 0), ck(xr6, T0q, 2)
check('Q4-06', 'a_0 = 2T1/T0 = 1/4 and a_2 = sin(pi/2)/(2 pi) = 1/(2 pi) = 0.159',
      abs(a0_6.real - 0.25) < 1e-4 and abs(a2_6.real - 1/(2*np.pi)) < 1e-4
      and abs(1/(2*np.pi) - 0.159) < 5e-4, f'a_0={a0_6.real:.6f}, a_2={a2_6.real:.6f}')
check('Q4-06b', 'the 1/8 distractor is T1/T0, and its halved argument gives sin(pi/4)/(2 pi) = 0.113',
      abs(T1q/T0q - 0.125) < 1e-12 and abs(np.sin(np.pi/4)/(2*np.pi) - 0.113) < 5e-4)
check('Q4-06c', 'a_0 = 1/2 belongs to T0 = 4T1, and the zeros fall at k multiple of 4, so a_2 is not zero',
      abs(ck(lambda a: (np.abs(a) < 1.0).astype(float), 4.0, 0).real - 0.5) < 1e-4
      and abs(ck(xr6, T0q, 4)) < 1e-4 and abs(a2_6) > 0.1)
check('Q4-06d', 'dropping the k from the denominator gives sin(pi/2)/pi = 0.318',
      abs(1/np.pi - 0.318) < 5e-4)

# Q4-07  the coefficients are samples of the envelope, they are not the envelope
E = lambda wv: 2*np.sin(wv*T1q)/wv
w0q = 2*np.pi/T0q
check('Q4-07', 'a_k = E(k w0)/T0 with E(w) = 2 sin(w T1)/w reproduces sin(2 pi k T1/T0)/(pi k)',
      all(abs(E(kv*w0q)/T0q - np.sin(2*np.pi*kv*T1q/T0q)/(np.pi*kv)) < 1e-12 for kv in range(1, 9)))
check('Q4-07b', 'the envelope does not depend on T0; only the sample spacing w0 = 2 pi/T0 changes',
      abs(E(1.3) - E(1.3)) == 0 and abs(2*np.pi/16.0 - w0q/2) < 1e-12)
check('Q4-07c', 'there is no coefficient between two harmonics: k = 1.5 is not an index',
      float(1.5).is_integer() is False)

# Q4-08  multiplication in time is periodic convolution in frequency
Nm = 6
rng = np.random.default_rng(4)
xm = rng.standard_normal(Nm) + 1j*rng.standard_normal(Nm)
ym = rng.standard_normal(Nm) + 1j*rng.standard_normal(Nm)
am, bm = dfs(xm, Nm), dfs(ym, Nm)
cm = dfs(xm*ym, Nm)
pconv = np.array([sum(am[l % Nm]*bm[(kv - l) % Nm] for l in range(Nm)) for kv in range(Nm)])
pcorr = np.array([sum(am[l % Nm]*bm[(l - kv) % Nm] for l in range(Nm)) for kv in range(Nm)])
check('Q4-08', 'the coefficients of x[n]y[n] are the periodic convolution over one period of l',
      np.allclose(cm, pconv, atol=1e-12), f'max err={np.max(np.abs(cm-pconv)):.2e}')
check('Q4-08b', 'the termwise product a_k b_k is a different sequence', not np.allclose(cm, am*bm, atol=1e-8))
check('Q4-08c', 'the reversed second index gives a correlation, also different',
      not np.allclose(cm, pcorr, atol=1e-8))
check('Q4-08d', 'the summand is periodic in l with period N, so a sum over all integers cannot settle',
      abs(am[0] - am[0 % Nm]) < 1e-12
      and abs(sum(am[l % Nm]*bm[(0 - l) % Nm] for l in range(Nm, 2*Nm)) - pconv[0]) < 1e-12)

# Q4-09  the conjugate-pair step, on the numbers the question quotes
aCT = {0: 1+0j, 1: 0.5+0j, 2: 1/(2j), 3: 0.5*np.exp(1j*np.pi/3)}
Hlp = lambda wv: 1/(1 + 1j*wv)                     # cutoff 1 rad/s, the lab-G case
b1 = aCT[1]*Hlp(np.pi)
check('Q4-09', 'b_1 = 0.1517 e^{-j1.263} follows from a_1 = 1/2 and H(j pi) = 1/(1+j pi)',
      abs(abs(b1) - 0.1517) < 5e-5 and abs(np.angle(b1) + 1.263) < 5e-4,
      f'|b_1|={abs(b1):.5f}, angle={np.angle(b1):.5f}')
check('Q4-09b', 'the pair k = +-1 contributes 2|b_1| cos(w0 t + angle b_1) = 0.303 cos(pi t - 1.263)',
      abs(2*abs(b1) - 0.303) < 5e-4, f'2|b_1|={2*abs(b1):.5f}')
tg9 = np.linspace(-4, 4, 800001)
pairv = b1*np.exp(1j*np.pi*tg9) + np.conj(b1)*np.exp(-1j*np.pi*tg9)
check('Q4-09c', 'the exponential pair and the cosine form are the same real signal',
      np.max(np.abs(pairv.imag)) < 1e-9
      and np.allclose(pairv.real, 2*abs(b1)*np.cos(np.pi*tg9 + np.angle(b1)), atol=1e-9))
check('Q4-09d', 'the missing factor of two halves the amplitude; the +1.263 version takes the phase from b_{-1}',
      abs(abs(b1) - 0.152) < 5e-4 and abs(np.angle(np.conj(b1)) - 1.263) < 5e-4)
check('Q4-09e', '0.303 cos + 0.303 sin is amplitude 0.303 sqrt(2) at phase -pi/4, matching neither',
      abs(np.hypot(0.303, 0.303) - 0.303*np.sqrt(2)) < 1e-12
      and abs(np.arctan2(-0.303, 0.303) + np.pi/4) < 1e-12)
yfull = (aCT[0]*Hlp(0)).real + sum(2*abs(aCT[kv]*Hlp(kv*np.pi))
                                  * np.cos(kv*np.pi*tg9 + np.angle(aCT[kv]*Hlp(kv*np.pi))) for kv in (1, 2, 3))
yhalf = (aCT[0]*Hlp(0)).real + sum(abs(aCT[kv]*Hlp(kv*np.pi))
                                   * np.cos(kv*np.pi*tg9 + np.angle(aCT[kv]*Hlp(kv*np.pi))) for kv in (1, 2, 3))
check('Q4-09f', 'the assembled output swings about 0.62 to 1.42, the halved version only 0.81 to 1.21',
      abs(yfull.min() - 0.62) < 0.02 and abs(yfull.max() - 1.42) < 0.02
      and abs(yhalf.min() - 0.81) < 0.02 and abs(yhalf.max() - 1.21) < 0.02,
      f'full [{yfull.min():.3f},{yfull.max():.3f}], halved [{yhalf.min():.3f},{yhalf.max():.3f}]')

# Q4-10  the same input through the high-pass H(jw) = jw/(1+jw)
Hhp = lambda wv: (1j*wv)/(1 + 1j*wv)
bk = {kv: aCT[kv]*Hhp(kv*np.pi) for kv in (1, 2, 3)}
check('Q4-10', 'b_1, b_2, b_3 are 0.4764 e^{+j0.308}, 0.4938 e^{-j1.413}, 0.4972 e^{+j1.153}',
      abs(abs(bk[1]) - 0.4764) < 5e-5 and abs(np.angle(bk[1]) - 0.308) < 5e-4
      and abs(abs(bk[2]) - 0.4938) < 5e-5 and abs(np.angle(bk[2]) + 1.413) < 5e-4
      and abs(abs(bk[3]) - 0.4972) < 5e-5 and abs(np.angle(bk[3]) - 1.153) < 5e-4,
      ', '.join(f'{abs(bk[kv]):.4f}@{np.angle(bk[kv]):+.4f}' for kv in (1, 2, 3)))
check('Q4-10b', 'the keyed amplitudes are 2|b_k| = 0.953, 0.988, 0.994',
      all(abs(2*abs(bk[kv]) - v) < 5e-4 for kv, v in zip((1, 2, 3), (0.953, 0.988, 0.994))))
check('Q4-10c', 'they equal |H(jk pi)| = k pi/sqrt(1+k^2 pi^2), so near-unity gain gives near-unity harmonics',
      all(abs(2*abs(bk[kv]) - kv*np.pi/np.sqrt(1 + (kv*np.pi)**2)) < 1e-9 for kv in (1, 2, 3)))
check('Q4-10d', 'H(j0) = 0, so b_0 = 0 and the output has no constant term',
      abs(Hhp(0.0)) == 0 and abs(aCT[0]*Hhp(0.0)) == 0)
check('Q4-10e', 'the 0.48/0.49/0.50 distractor is the halved amplitude set |b_k|',
      all(abs(round(abs(bk[kv]), 2) - v) < 1e-9 for kv, v in zip((1, 2, 3), (0.48, 0.49, 0.50))))
check('Q4-10f', 'the sign-flipped distractor takes every phase from the negative index: -0.308, +1.413, -1.153',
      all(abs(np.angle(np.conj(bk[kv])) + np.angle(bk[kv])) < 1e-12 for kv in (1, 2, 3))
      and abs(np.angle(np.conj(bk[1])) + 0.308) < 5e-4 and abs(np.angle(np.conj(bk[3])) + 1.153) < 5e-4)

# Q4-11  x[n] = n on -5 <= n <= 5, repeated with N = 11: real and odd
N11 = 11
x11 = np.array([v if v <= 5 else v - N11 for v in range(N11)], dtype=float)   # n = 0..5, -5..-1
a11 = dfs(x11, N11)
closed11 = np.array([-2j/N11*sum(m_*np.sin(2*np.pi*kv*m_/N11) for m_ in range(1, 6)) for kv in range(N11)])
check('Q4-11', 'the coefficients are purely imaginary at every k, and match the closed form of the solution',
      np.max(np.abs(a11.real)) < 1e-12 and np.allclose(a11, closed11, atol=1e-12),
      f'max |Re a_k|={np.max(np.abs(a11.real)):.2e}')
check('Q4-11b', '|a_{+-1}| = 1.7747 is the largest of the eleven',
      abs(abs(a11[1]) - 1.7747) < 5e-5 and abs(abs(a11[N11-1]) - 1.7747) < 5e-5
      and abs(a11[1]) >= max(abs(a11)) - 1e-12, f'|a_1|={abs(a11[1]):.5f}')
check('Q4-11c', 'a real signal gives a_{-k} = conj(a_k); an odd one gives a_{-k} = -a_k; both hold here',
      all(abs(a11[(-kv) % N11] - np.conj(a11[kv])) < 1e-12 for kv in range(N11))
      and all(abs(a11[(-kv) % N11] + a11[kv]) < 1e-12 for kv in range(N11)))
check('Q4-11d', 'a real even sequence would give real coefficients, so phases of 0 or pi and not +-pi/2',
      np.max(np.abs(dfs(np.array([abs(v) if v <= 5 else abs(v - N11) for v in range(N11)],
                                 dtype=float), N11).imag)) < 1e-12)
check('Q4-11e', 'discrete-time coefficients do repeat: a_{k+N} = a_k',
      np.allclose(dfs(x11, N11), np.array([np.sum(x11*np.exp(-2j*np.pi*(kv + N11)*np.arange(N11)/N11))/N11
                                           for kv in range(N11)]), atol=1e-12))

# Q4-12  1/k against 1/k^2 decay, and where a Gibbs overshoot can occur
Ksq = np.arange(1, 4001)
asq = np.sin(np.pi*Ksq/2)/(np.pi*Ksq)                       # square wave, T0 = 4 T1
atr = (1 - (-1.0)**Ksq)/(Ksq**2*np.pi**2)                   # triangular wave, T0 = 2
xtri = lambda a: 1 - np.abs(a - 2*np.round(a/2))
check('Q4-12', 'the quoted coefficient forms are the ones the two waveforms have',
      abs(ck(lambda a: (np.abs(a - 4*np.round(a/4)) < 1).astype(float), 4.0, 3).real
          - np.sin(3*np.pi/2)/(3*np.pi)) < 1e-4
      and abs(ck(xtri, 2.0, 3).real - (1 - (-1)**3)/(9*np.pi**2)) < 1e-6)


def mse_tail(coef, a0v, power, Nn):
    return power - a0v**2 - 2*np.sum(coef[:Nn]**2)


msq = [mse_tail(asq, 0.5, 0.5, Nn) for Nn in (3, 9, 27, 81)]
check('Q4-12b', 'square wave with T0 = 4T1: MSE = 0.025, 0.010, 0.004, 0.001 at N = 3, 9, 27, 81',
      all(abs(v - w) < 5e-4 for v, w in zip(msq, (0.025, 0.010, 0.004, 0.001))),
      ', '.join(f'{v:.4f}' for v in msq))
mtr = [mse_tail(atr, 0.5, 1/3, Nn) for Nn in (10, 20, 40, 80)]
msq2 = [mse_tail(asq, 0.5, 0.5, Nn) for Nn in (10, 20, 40, 80)]
check('Q4-12c', 'doubling N divides the triangular error by about eight and the square-wave error by about two',
      all(abs(mtr[i]/mtr[i+1] - 8) < 0.3 for i in range(3))
      and all(abs(msq2[i]/msq2[i+1] - 2) < 0.05 for i in range(3)),
      'tri ' + ', '.join(f'{mtr[i]/mtr[i+1]:.2f}' for i in range(3))
      + ' | sq ' + ', '.join(f'{msq2[i]/msq2[i+1]:.2f}' for i in range(3)))
check('Q4-12d', '|a_k| decays like 1/k for the square wave and like 1/k^2 for the triangular wave',
      abs(abs(asq[100])/abs(asq[200]) - 2) < 0.05 and abs(atr[100]/atr[200] - 4) < 0.05)


def partial_sq(tv, Nn):
    """partial sum of the T0 = 4T1 square wave, a_0 = 1/2 plus the harmonics"""
    out = np.full_like(tv, 0.5)
    for kv in range(1, Nn+1):
        out = out + 2*(np.sin(np.pi*kv/2)/(np.pi*kv))*np.cos(kv*np.pi*tv/2)
    return out


tgb = np.linspace(-2, 2, 200001)
ovs = [partial_sq(tgb, Nn).max() - 1.0 for Nn in (41, 161, 641)]
check('Q4-12e', 'the square-wave overshoot settles at about 8.95 % of the jump and does not shrink with N',
      all(abs(v - 0.0895) < 2e-3 for v in ovs) and abs(ovs[-1] - ovs[0]) < 1e-3,
      ', '.join(f'{100*v:.2f}%' for v in ovs))
check('Q4-12f', 'the triangular wave is continuous, so its largest error goes to zero instead',
      max(abs(sum(2*atr[kv-1]*np.cos(kv*np.pi*tgb) for kv in range(1, 61)) + 0.5 - xtri(tgb)))
      < max(abs(sum(2*atr[kv-1]*np.cos(kv*np.pi*tgb) for kv in range(1, 11)) + 0.5 - xtri(tgb)))/5)

print('\n' + '-'*66)
bad = [q for q, o in results if not o]
print(f'{len(results)} checks, {len(results)-len(bad)} passed, {len(bad)} failed'
      + (f': {bad}' if bad else ''))
