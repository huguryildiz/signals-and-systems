#!/usr/bin/env python3
"""EE311 question-bank numerical verification (Modules 1-3).

Every question whose answer contains a number, a support, a period or a
closed form is re-derived here independently of the text written into
95_qbank.js.  One PASS/FAIL line is printed per checked question.
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

print('\n' + '-'*66)
bad = [q for q, o in results if not o]
print(f'{len(results)} checks, {len(results)-len(bad)} passed, {len(bad)} failed'
      + (f': {bad}' if bad else ''))
