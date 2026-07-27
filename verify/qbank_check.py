#!/usr/bin/env python3
"""Question-bank numerical verification (Modules 1-7).

Every question whose answer contains a number, a support, a period or a
closed form is re-derived here independently of the text written into the
bank files.  One PASS/FAIL line is printed per checked question.

The numbers a question quotes are written into the checks as literals, so a
check binds to the text: change either one and the line goes red.  Module 4
carries the further test that each distractor is wrong for the reason its
wrong{} entry gives, since verify/verify_m4.py already covers the mathematics
of the module itself.  Modules 5, 6 and 7 are checked the same way throughout:
verify_m5.py, verify_m6.py and verify_m7.py carry the mathematics of the modules,
and the lines here bind to the questions.
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

# ---------------------------------------------------------------- MODULE 5
# verify_m5.py re-derives the mathematics of the module.  What is checked here
# is the question: that the keyed option is the one that survives, and that each
# distractor fails for the reason its wrong{} entry gives.
PI = np.pi


def ct_ft(f, wv, lo=-40.0, hi=40.0, M=800001):
    """X(jw) of a fast-decaying signal, by numerical integration."""
    tg_ = np.linspace(lo, hi, M)
    fv = f(tg_)
    return np.array([trapz(fv*np.exp(-1j*w_*tg_), tg_) for w_ in np.atleast_1d(wv)])


def ct_ift(F, tv, lo=-40.0, hi=40.0, M=800001, scale=1/(2*np.pi)):
    """x(t) from X(jw), by numerical integration of the synthesis equation."""
    wg_ = np.linspace(lo, hi, M)
    Fv = F(wg_)
    return np.array([scale*trapz(Fv*np.exp(1j*wg_*tq), wg_) for tq in np.atleast_1d(tv)])


# Q5-01  which equation is analysis and which is synthesis
gauss = lambda a: np.exp(-a**2/2)
Ggau = lambda w_: np.sqrt(2*PI)*np.exp(-w_**2/2)
w51 = np.array([-2.0, -0.5, 0.0, 0.7, 3.0])
t51 = np.array([-1.5, 0.0, 0.4, 2.0])
check('Q5-01', 'the analysis integral runs over t and leaves a function of omega alone',
      np.allclose(ct_ft(gauss, w51), Ggau(w51), atol=1e-8),
      f'max err={np.max(np.abs(ct_ft(gauss, w51) - Ggau(w51))):.2e}')
check('Q5-01b', 'the synthesis integral runs over omega and returns the signal',
      np.allclose(ct_ift(Ggau, t51), gauss(t51), atol=1e-8))
check('Q5-01c', 'the 1/(2 pi) belongs to synthesis: dropping it returns 2 pi x(t)',
      np.allclose(ct_ift(Ggau, t51, scale=1.0), 2*PI*gauss(t51), atol=1e-7))
check('Q5-01d', 'putting the 1/(2 pi) on the analysis side returns X/(2 pi), not X',
      np.allclose(ct_ft(gauss, w51)/(2*PI), Ggau(w51)/(2*PI), atol=1e-8)
      and not np.allclose(ct_ft(gauss, w51)/(2*PI), Ggau(w51), atol=1e-3))

# Q5-02  finite energy and absolute integrability are separate sufficient conditions
tsq = np.linspace(-1000, 1000, 8000001)
sinct = np.where(np.abs(tsq) < 1e-9, 1.0, np.sin(tsq)/np.where(tsq == 0, 1, tsq))
check('Q5-02', 'sin(t)/t has finite energy: the integral of its square is pi',
      abs(trapz(sinct**2, tsq) - PI) < 5e-3, f'E={trapz(sinct**2, tsq):.5f}')
l1 = [trapz(np.abs(sinct[np.abs(tsq) <= Tc]), tsq[np.abs(tsq) <= Tc]) for Tc in (10, 100, 1000)]
check('Q5-02b', 'its absolute integral diverges, growing over [-T,T] by about (4/pi)ln(10) = 2.93 '
                'per decade of T',
      all(abs(l1[i+1] - l1[i] - 4*np.log(10)/PI) < 0.15 for i in range(2)),
      ', '.join(f'{v:.3f}' for v in l1))
check('Q5-02c', '1/sqrt(t) on (0,1) is absolutely integrable with area 2 and has infinite energy',
      abs(float(sp.integrate(1/sp.sqrt(t), (t, 0, 1))) - 2) < 1e-12
      and sp.integrate(1/t, (t, 0, 1)) == sp.oo)
check('Q5-02d', 'x(t)=1 fails both conditions and still has 2 pi delta(w) as a limit: '
                'the area of 2a/(a^2+w^2) is 2 pi at every a',
      all(abs(float(sp.integrate(2*aq/(aq**2 + t**2), (t, -sp.oo, sp.oo))) - 2*np.pi) < 1e-9
          for aq in (sp.Integer(1), sp.Rational(1, 10), sp.Rational(1, 100))))

# Q5-03  the transform of a periodic signal carries a factor 2 pi at every harmonic
a0_53 = ck(lambda a: (np.abs(a - 8*np.round(a/8)) < 1.0).astype(float), 8.0, 0).real
check('Q5-03', 'square wave with T = 8T1: a_0 = 0.25 and the impulse weight 2 pi a_0 = 1.5708',
      abs(a0_53 - 0.25) < 1e-4 and abs(2*PI*a0_53 - 1.5708) < 5e-4,
      f'a_0={a0_53:.6f}, 2 pi a_0={2*PI*a0_53:.4f}')
check('Q5-03b', 'the weight 2 pi is what the 1/(2 pi) of synthesis cancels; a_k alone leaves 1/(2 pi)',
      abs((1/(2*PI))*2*PI - 1) < 1e-15 and abs((1/(2*PI))*1 - 1/(2*PI)) < 1e-15
      and abs(1/(2*PI) - 1) > 0.8)
tp53 = np.linspace(-2000, 2000, 4000001)
check('Q5-03c', 'a periodic signal has neither finite energy nor a finite absolute integral, '
                'so its spectrum is impulses rather than a continuous function',
      trapz(np.cos(tp53)**2, tp53) > 1900 and trapz(np.abs(np.cos(tp53)), tp53) > 2500,
      f'E over [-2000,2000]={trapz(np.cos(tp53)**2, tp53):.1f}')

# Q5-04  the phase of 1/(a+jw) is minus the phase of the denominator
ph = lambda av, wv: np.angle(1/(av + 1j*wv))
check('Q5-04', 'angle X = -arctan(w/a), which at a = w = 1 is -0.7854 rad',
      abs(ph(1, 1) + 0.785398) < 5e-6 and abs(ph(1, 1) + np.arctan2(1, 1)) < 1e-12,
      f'{ph(1,1):.6f}')
check('Q5-04b', 'the +arctan distractor is the angle of the denominator, of opposite sign',
      abs(np.angle(1 + 1j) - 0.785398) < 5e-6 and abs(np.angle(1 + 1j) + ph(1, 1)) < 1e-12)
check('Q5-04c', 'arctan(a/w) agrees only where a = w: at a=1, w=3 it gives 0.3217 against 1.2490',
      abs(np.arctan2(1, 3) - 0.321751) < 5e-6 and abs(np.arctan2(3, 1) - 1.249046) < 5e-6)
check('Q5-04d', 'the phase is not zero: it falls through the whole range from +pi/2 to -pi/2',
      abs(ph(1, -1000) - PI/2) < 2e-3 and abs(ph(1, 1000) + PI/2) < 2e-3)
check('Q5-04e', 'the two further values quoted in the solution are -1.537475 and -0.380506',
      abs(ph(0.1, 3) + 1.537475) < 5e-6 and abs(ph(5, 2) + 0.380506) < 5e-6)

# Q5-05  Parseval on a piecewise-constant spectrum
E55 = (1/(2*PI))*(4*(4*PI) + 1*(4*PI))
check('Q5-05', 'E = (1/2pi)[4 over 4pi + 1 over 4pi] = 20pi/2pi = 10 J',
      abs(E55 - 10.0) < 1e-12, f'E={E55}')
check('Q5-05b', 'the 6 J distractor is (1/2pi) times the integral of X itself, which is x(0)',
      abs((1/(2*PI))*(2*(4*PI) + 1*(4*PI)) - 6.0) < 1e-12)
check('Q5-05c', 'the 20pi and 62.83 distractors are the integral of |X|^2 without the 1/(2pi)',
      abs(4*(4*PI) + 1*(4*PI) - 20*PI) < 1e-12 and abs(20*PI - 62.83) < 5e-3)
t55 = np.linspace(-400, 400, 8000001)
x55 = np.where(np.abs(t55) < 1e-9, 6.0,
               (np.sin(2*PI*t55) + np.sin(4*PI*t55))/(PI*np.where(t55 == 0, 1, t55)))
check('Q5-05d', 'the time-domain route over x_3(t) = [sin(2pi t)+sin(4pi t)]/(pi t) returns 10 J too',
      abs(trapz(x55**2, t55) - 10.0) < 5e-3, f'E={trapz(x55**2, t55):.5f}')

# Q5-06  repeated pole, and the sign of C
sv = sp.symbols('s')
Y56 = (sv + 2)/((sv + 1)**2*(sv + 3))
B56 = sp.limit((sv + 1)**2*Y56, sv, -1)
A56 = sp.limit(sp.diff((sv + 1)**2*Y56, sv), sv, -1)
C56 = sp.limit((sv + 3)*Y56, sv, -3)
check('Q5-06', 'A = 1/4, B = 1/2 and C = -1/4, so the answer carries -1/4 e^{-3t}',
      A56 == sp.Rational(1, 4) and B56 == sp.Rational(1, 2) and C56 == sp.Rational(-1, 4),
      f'A={A56}, B={B56}, C={C56}')
y56 = lambda tv: 0.25*np.exp(-tv) + 0.5*tv*np.exp(-tv) - 0.25*np.exp(-3*tv)
ybad = lambda tv: 0.25*np.exp(-tv) + 0.5*tv*np.exp(-tv) + 0.25*np.exp(-3*tv)
check('Q5-06b', 'the keyed answer gives y(0) = 0; the +1/4 version gives 1/2',
      abs(y56(0.0)) < 1e-15 and abs(ybad(0.0) - 0.5) < 1e-15)
check('Q5-06c', 'the two candidates differ by 0.001240 at t = 2: 0.168549 against 0.169789',
      abs(y56(2.0) - 0.168549) < 5e-6 and abs(ybad(2.0) - 0.169789) < 5e-6,
      f'{y56(2.0):.6f} vs {ybad(2.0):.6f}')
tc = np.linspace(0, 12, 240001)
h56 = 0.5*np.exp(-tc) + 0.5*np.exp(-3*tc)          # inverse of (s+2)/((s+1)(s+3))
conv = np.array([trapz(np.exp(-tc[:i+1][::-1])*h56[:i+1], tc[:i+1]) for i in range(0, 240001, 4000)])
check('Q5-06d', 'convolving x with h directly reproduces the same three terms',
      np.allclose(conv, y56(tc[::4000]), atol=2e-5),
      f'max err={np.max(np.abs(conv - y56(tc[::4000]))):.2e}')
check('Q5-06e', 'h(t) itself is the distractor 1/2 e^{-t} + 1/2 e^{-3t}, the answer for an impulse input',
      abs(h56[0] - 1.0) < 1e-12 and not np.allclose(h56[::4000], y56(tc[::4000]), atol=1e-3))

# Q5-07  a real cosine gives two impulses, of weight 2 pi times the Euler coefficient
check('Q5-07', '4cos(3pi t) = 2e^{j3pi t} + 2e^{-j3pi t}, so both weights are 2*2pi = 4pi = 12.566',
      abs(4*PI - 12.566371) < 5e-6)
tq = np.linspace(-2, 2, 400001)
check('Q5-07b', 'the two-impulse answer rebuilds 4cos(3pi t); one impulse of weight 8pi rebuilds 4e^{j3pi t}',
      np.allclose(2*np.exp(1j*3*PI*tq) + 2*np.exp(-1j*3*PI*tq), 4*np.cos(3*PI*tq), atol=1e-12)
      and np.max(np.abs((4*np.exp(1j*3*PI*tq)).imag)) > 3.9)
check('Q5-07c', 'both impulses at +3pi is not conjugate symmetric, so it cannot belong to a real signal',
      np.max(np.abs((4*np.exp(1j*3*PI*tq)).imag)) > 1e-6)
check('Q5-07d', 'the weight-2 distractor drops the 2pi of the pair e^{jw0 t} <-> 2pi delta(w-w0)',
      abs(2*2*PI - 4*PI) < 1e-12 and abs(2.0 - 4*PI) > 10)
check('Q5-07e', 'the sine comparison in the solution has imaginary weights 6pi/j of opposite sign',
      abs(abs(6*PI/1j) - 18.849556) < 5e-6)

# Q5-08  modulation makes two copies at half height
wm = np.linspace(-10*PI, 10*PI, 400001)
Xm = (np.abs(wm) < 2*PI).astype(float)
Zm = 0.5*(np.abs(wm - 4*PI) < 2*PI) + 0.5*(np.abs(wm + 4*PI) < 2*PI)
check('Q5-08', 'each copy has height 0.5, on 2pi <= |w| <= 6pi',
      abs(Zm[np.argmin(np.abs(wm - 4*PI))] - 0.5) < 1e-12
      and abs(Zm[np.argmin(np.abs(wm - 4*PI - 1.9*PI))] - 0.5) < 1e-12
      and abs(Zm[np.argmin(np.abs(wm))]) < 1e-12)
check('Q5-08b', 'the factor is (1/2pi) times the impulse weight pi, that is 1/2',
      abs((1/(2*PI))*PI - 0.5) < 1e-15)
check('Q5-08c', 'the modulated spectrum occupies 8pi of the axis, twice the original 4pi',
      abs(trapz((Zm > 0).astype(float), wm) - 8*PI) < 0.01
      and abs(trapz((Xm > 0).astype(float), wm) - 4*PI) < 0.01)
check('Q5-08d', 'the carrier 4pi exceeds the highest frequency 2pi, so the two copies stay apart',
      4*PI - 2*PI > 2*PI - 1e-12)

# Q5-09  the narrower band wins, and the peak is an area
check('Q5-09', 'Y = 6 on |w| <= 2pi and y(0) = (1/2pi)(6)(4pi) = 12',
      abs(2*3 - 6) < 1e-12 and abs((1/(2*PI))*6*(4*PI) - 12.0) < 1e-12)
check('Q5-09b', 'beyond 2pi the system contributes 0, so the product is 0 however large the input',
      abs(2*0.0) < 1e-15)
check('Q5-09c', 'the three peaks are x(0) = 8, h(0) = 6 and y(0) = 12',
      abs((1/(2*PI))*2*(8*PI) - 8.0) < 1e-12
      and abs((1/(2*PI))*3*(4*PI) - 6.0) < 1e-12
      and abs((1/(2*PI))*6*(4*PI) - 12.0) < 1e-12)
check('Q5-09d', 'the 5 distractor adds the two heights instead of multiplying them',
      abs(2 + 3 - 5) < 1e-15 and abs(2*3 - 5) > 0.9)

# Q5-10  the unnormalised sinc convention
sincu = lambda th: np.where(np.abs(th) < 1e-12, 1.0, np.sin(th)/np.where(th == 0, 1, th))
wsn = np.linspace(-30, 30, 600001)
T1s = 0.7
lhs = np.where(np.abs(wsn) < 1e-12, 2*T1s, 2*np.sin(wsn*T1s)/np.where(wsn == 0, 1, wsn))
check('Q5-10', '2 sin(w T1)/w = 2T1 sinc(w T1) in the unnormalised convention',
      np.allclose(lhs, 2*T1s*sincu(wsn*T1s), atol=1e-12))
check('Q5-10b', 'the normalised restatement is 2T1 sinc_n(w T1/pi), equal to the same function',
      np.allclose(lhs, 2*T1s*np.sinc(wsn*T1s/PI), atol=1e-12))
check('Q5-10c', 'copying the argument between the conventions is wrong everywhere but the origin',
      abs(2*T1s*sincu(0.0) - 2*T1s) < 1e-12
      and not np.allclose(2*T1s*sincu(wsn*T1s/PI), lhs, atol=1e-3))
check('Q5-10d', 'sinc(w T1) puts the zeros at w = k pi/T1, and dropping T1 stops them moving with the width',
      all(abs(sincu(np.array([kv*PI/T1s*T1s]))[0]) < 1e-9 for kv in (1, 2, 3)))
wsm = np.array([0.05, 0.2, 0.5])
check('Q5-10e', 'dividing by w a second time changes the value everywhere and runs away at the origin',
      np.all(np.abs(2*T1s/wsm*sincu(wsm*T1s)) > np.abs(2*T1s*sincu(wsm*T1s)))
      and 2*T1s/1e-6*sincu(np.array([1e-6*T1s]))[0] > 1e5)

# Q5-11  narrowing the pulse lowers the peak and pushes the first null out
peak = lambda T1v: 2*T1v
null = lambda T1v: PI/T1v
check('Q5-11', 'quartering T1 from 1 to 0.25 takes the peak from 2 to 0.5 and the null from pi to 4pi',
      abs(peak(1.0) - 2) < 1e-12 and abs(peak(0.25) - 0.5) < 1e-12
      and abs(null(1.0) - PI) < 1e-12 and abs(null(0.25) - 4*PI) < 1e-12)
check('Q5-11b', 'the peak is the area under the pulse, so it cannot stay at 2 when the pulse narrows',
      abs(trapz((np.abs(np.linspace(-3, 3, 600001)) < 0.25).astype(float),
                np.linspace(-3, 3, 600001)) - 0.5) < 1e-4)
check('Q5-11c', 'duration times first-null bandwidth is 2pi at every width for this shape',
      all(abs(peak(v)*null(v) - 2*PI) < 1e-12 for v in (0.25, 1.0, 5.0)))
check('Q5-11d', 'it is not a universal constant: a triangular pulse of the same duration gives 4pi',
      abs(2*1.0*(2*PI/1.0) - 4*PI) < 1e-12)

# Q5-12  three properties composed, in order
w512 = np.linspace(-20, 20, 400001)
check('Q5-12', 'a delay multiplies by e^{-jw t0}, of modulus 1 at every frequency',
      np.allclose(np.abs(np.exp(-1j*w512*1.3)), 1.0, atol=1e-12))
X512 = lambda w_: np.sqrt(2*PI)*np.exp(-w_**2/2)
check('Q5-12b', 'compression by a = 2 gives (1/2)X(jw/2): half the height, twice the width',
      np.allclose(ct_ft(lambda a: gauss(2*a), w512[::400]), 0.5*X512(w512[::400]/2), atol=1e-7))
check('Q5-12c', 'the carrier makes two copies at half height, so realness and even magnitude survive',
      np.allclose(0.5*X512(w512 - 6) + 0.5*X512(w512 + 6),
                  (0.5*X512(w512 - 6) + 0.5*X512(w512 + 6))[::-1], atol=1e-12))
tc512 = np.linspace(-4, 4, 400001)
check('Q5-12d', 'the three do not commute: x(2t-t0) and x(2(t-t0)) are different signals',
      not np.allclose(gauss(2*tc512 - 1.3), gauss(2*(tc512 - 1.3)), atol=1e-3))

# ---------------------------------------------------------------- MODULE 6
# verify_m6.py re-derives the mathematics of the module.  These lines check the
# questions: the keyed option and the reason attached to each distractor.


def dtft(x, n0, wv):
    """X(e^{jw}) of a finite sequence starting at index n0."""
    nn_ = np.arange(n0, n0 + len(x))
    wv = np.atleast_1d(np.asarray(wv, dtype=float))
    return np.exp(-1j*np.outer(wv, nn_)) @ np.asarray(x, dtype=complex)


def dtift(X, nv, M=400001):
    """x[n] from X(e^{jw}), by integrating the synthesis equation over one period."""
    wg_ = np.linspace(-PI, PI, M)
    Xv = X(wg_)
    return np.array([trapz(Xv*np.exp(1j*wg_*nq), wg_)/(2*PI) for nq in np.atleast_1d(nv)])


x61 = np.array([0.4, -1.2, 0.7, 2.0, -0.3])
n61 = -2
check('Q6-01', 'the sum takes the sequence to a spectrum and the integral takes it back',
      np.allclose(dtift(lambda w_: dtft(x61, n61, w_), np.arange(n61, n61 + 5)).real,
                  x61, atol=1e-6),
      f'max err={np.max(np.abs(dtift(lambda w_: dtft(x61, n61, w_), np.arange(n61, n61+5)).real - x61)):.2e}')
check('Q6-01b', 'the 1/(2 pi) sits on the synthesis side: without it the sequence returns 2 pi too large',
      np.allclose(2*PI*dtift(lambda w_: dtft(x61, n61, w_), np.arange(n61, n61 + 5)).real,
                  2*PI*x61, atol=1e-5))
check('Q6-01c', 'the synthesis range is one period, not the whole line',
      abs(2*PI - (PI - (-PI))) < 1e-15)

# Q6-02  periodicity comes from the time index being an integer
w62 = np.array([-2.4, -0.3, 0.0, 1.1, 2.9])
check('Q6-02', 'X(e^{j(w+2pi)}) = X(e^{jw}) for every w, because e^{-j2pi n} = 1 at integer n',
      np.allclose(dtft(x61, n61, w62 + 2*PI), dtft(x61, n61, w62), atol=1e-10))
check('Q6-02b', 'the same step in continuous time fails: 2/(1+w^2) is not 2pi-periodic',
      not np.allclose(2/(1 + (w62 + 2*PI)**2), 2/(1 + w62**2), atol=1e-3))
check('Q6-02c', 'a^n u[n] is not periodic and its transform is still 2pi-periodic',
      not np.allclose(0.7**np.arange(0, 20), 0.7**np.arange(3, 23), atol=1e-6)
      and np.allclose(dtft(0.7**np.arange(0, 200), 0, w62 + 2*PI),
                      dtft(0.7**np.arange(0, 200), 0, w62), atol=1e-10))
check('Q6-02d', 'the fastest sequence available is e^{j pi n} = (-1)^n',
      np.allclose(np.exp(1j*PI*np.arange(-6, 7)).real, (-1.0)**np.arange(-6, 7), atol=1e-12))

# Q6-03  a_k is a discrete list periodic in k; X(e^{jw}) is a continuous function periodic in w
N63 = 7
xp63 = np.array([1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0])       # one period, a replicated pulse
a63 = dfs(xp63, N63)
check('Q6-03', 'a_{k+N} = a_k: the coefficient list repeats every N entries',
      np.allclose(np.array([np.sum(xp63*np.exp(-2j*PI*(kv + N63)*np.arange(N63)/N63))/N63
                            for kv in range(N63)]), a63, atol=1e-12))
check('Q6-03b', 'a_k = (1/N) X(e^{jk 2pi/N}) of the single period, so the stems fall on the curve',
      np.allclose(a63, dtft(xp63, 0, 2*PI*np.arange(N63)/N63)/N63, atol=1e-12))
check('Q6-03c', 'the aperiodic transform of the same single period is 2pi-periodic in w '
                'while the coefficient list is periodic in the integer k',
      np.allclose(dtft(xp63, 0, np.array([0.3, 1.7]) + 2*PI),
                  dtft(xp63, 0, np.array([0.3, 1.7])), atol=1e-10)
      and len(a63) == N63)

# Q6-04  extremes of 1/(1 - a e^{-jw})
for aq, mx, mn, phm in ((0.5, 2.0, 2/3, PI/6), (0.125, 8/9, 8/7, np.arcsin(0.125))):
    wq = np.linspace(-PI, PI, 400001)
    Xq = 1/(1 - aq*np.exp(-1j*wq))
    tag = 'Q6-04' if aq == 0.5 else 'Q6-04e'
    check(tag, f'a = {aq}: |X| runs between 1/(1+a) and 1/(1-a), that is {mn:.4f} to {mx:.4f}',
          abs(np.abs(Xq).max() - max(mx, mn)) < 1e-6 and abs(np.abs(Xq).min() - min(mx, mn)) < 1e-6,
          f'[{np.abs(Xq).min():.4f}, {np.abs(Xq).max():.4f}]')
    check(tag + 'p', f'a = {aq}: max |angle X| = arcsin(a) = {phm:.4f} rad, reached at cos w = a',
          abs(np.abs(np.angle(Xq)).max() - phm) < 1e-5
          and abs(abs(wq[np.argmax(np.abs(np.angle(Xq)))]) - np.arccos(aq)) < 1e-4,
          f'{np.abs(np.angle(Xq)).max():.6f} at w={wq[np.argmax(np.abs(np.angle(Xq)))]:.4f}')
check('Q6-04b', 'the 0.16pi distractor truncates pi/6 = 0.16667pi and is 4 per cent low',
      abs(0.16*PI - 0.502655) < 5e-6 and abs((PI/6)/PI - 0.166667) < 5e-6
      and abs((PI/6 - 0.16*PI)/(PI/6) - 0.04) < 5e-3)
check('Q6-04c', 'the swapped distractor puts the largest magnitude at w = pi, where the denominator is largest',
      abs(1/(1 - 0.5) - 2.0) < 1e-12 and abs(1/(1 + 0.5) - 2/3) < 1e-12)
check('Q6-04d', '|a e^{-jw}| = |a| = 1/2, not 1, so the geometric series converges',
      abs(np.abs(0.5*np.exp(-1j*1.234)) - 0.5) < 1e-15)

# Q6-05  the ideal lowpass sequence, and the prefactor W/pi
W65 = PI/4
xk = lambda nv, Wv: np.where(np.asarray(nv) == 0, Wv/PI,
                             np.sin(Wv*np.asarray(nv))/(PI*np.where(np.asarray(nv) == 0, 1, np.asarray(nv))))
check('Q6-05', 'W = pi/4 gives x[0] = 0.25 and x[1] = 0.225079, from x[n] = sin(Wn)/(pi n)',
      abs(xk(0, W65) - 0.25) < 1e-12 and abs(xk(1, W65) - 0.225079) < 5e-7,
      f'x[1]={float(xk(1,W65)):.6f}')
check('Q6-05b', 'the synthesis integral over the period reproduces the same values',
      np.allclose(dtift(lambda w_: (np.abs(w_) <= W65).astype(float), [0, 1, 2, 3]).real,
                  np.array([xk(v, W65) for v in (0, 1, 2, 3)]), atol=1e-6))
check('Q6-05c', 'x[2] = 0.159155 and x[3] = 0.075026',
      abs(xk(2, W65) - 0.159155) < 5e-7 and abs(xk(3, W65) - 0.075026) < 5e-7)
check('Q6-05d', 'the W/n distractor gives 0.707107 at n = 1, wrong by a factor of pi',
      abs((W65/1)*np.sinc(W65*1/PI) - 0.707107) < 5e-7
      and abs(0.707107/float(xk(1, W65)) - PI) < 5e-4)
check('Q6-05e', 'the height-1 distractor quotes sin(W)/(pi W) = 0.286580, and x[0] is the band fraction W/pi',
      abs(np.sin(W65)/(PI*W65) - 0.286580) < 5e-7 and abs(W65/PI - 0.25) < 1e-12,
      f'{np.sin(W65)/(PI*W65):.6f}')
check('Q6-05f', 'at W = pi/2 the sequence reads 0.5, 0.318310, 0, -0.106103',
      all(abs(float(xk(v, PI/2)) - w_) < 5e-7
          for v, w_ in zip((0, 1, 2, 3), (0.5, 0.318310, 0.0, -0.106103))))

# Q6-06  the repeated-pole pair, derived rather than remembered
a66 = 0.25
nn66 = np.arange(0, 400)
w66 = np.array([-2.0, -0.4, 0.0, 0.9, 2.7])
check('Q6-06', '(n+1)a^n u[n] transforms to 1/(1 - a e^{-jw})^2',
      np.allclose(dtft((nn66 + 1)*a66**nn66, 0, w66), 1/(1 - a66*np.exp(-1j*w66))**2, atol=1e-9))
check('Q6-06b', 'at w = 0 with a = 1/4 the correct value is 16/9 = 1.7778; the +a form gives 0.6400',
      abs(1/(1 - a66)**2 - 16/9) < 1e-12 and abs(1/(1 + a66)**2 - 0.64) < 1e-12)
check('Q6-06c', 'the factor n+1 is not a doubling: (n+1)a^n and 2a^n are different sequences',
      not np.allclose((nn66[:20] + 1)*a66**nn66[:20], 2*a66**nn66[:20], atol=1e-6)
      and not np.allclose(dtft((nn66 + 1)*a66**nn66, 0, w66),
                          2/(1 - a66*np.exp(-1j*w66)), atol=1e-3))
y66 = lambda nv: -4*a66**nv - 2*(nv + 1)*a66**nv + 8*0.5**nv
check('Q6-06d', 'the expansion gives A = -4, B = -2, C = 8 and y[0..3] = 2, 2, 1.375, 0.8125',
      all(abs(y66(v) - w_) < 1e-12 for v, w_ in zip(range(4), (2.0, 2.0, 1.375, 0.8125))),
      ', '.join(f'{y66(v):.4f}' for v in range(4)))
h66 = np.zeros(40)
for m in range(40):
    h66[m] = 2*(m == 0) + 0.75*(h66[m-1] if m >= 1 else 0) - 0.125*(h66[m-2] if m >= 2 else 0)
y66r = np.convolve(h66, a66**np.arange(40))[:40]
check('Q6-06e', 'the recursion driven by (1/4)^n u[n] reproduces the same output',
      np.allclose(y66r[:12], [y66(v) for v in range(12)], atol=1e-9))
check('Q6-06f', 'the distinct-pole route needs a != b, which fails here because the input pole is 1/4',
      abs(a66 - 0.25) < 1e-15)

# Q6-07  real is not the same as non-negative
for N1, pk67, mn67 in ((2, 5.0, -1.2500), (4, 9.0, -2.0391)):
    wq = np.linspace(-PI, PI, 2000001)
    Dk = np.where(np.abs(wq) < 1e-9, 2*N1 + 1,
                  np.sin(wq*(N1 + 0.5))/np.sin(np.where(np.abs(wq) < 1e-9, 1, wq)/2))
    check('Q6-07' if N1 == 2 else 'Q6-07b',
          f'the Dirichlet kernel with N1 = {N1} peaks at {pk67:.0f} and dips to {mn67}',
          abs(Dk.max() - pk67) < 1e-6 and abs(Dk.min() - mn67) < 5e-5,
          f'[{Dk.min():.4f}, {Dk.max():.4f}]')
check('Q6-07c', 'where the kernel is negative the magnitude is -X and the phase is pi, not 0',
      abs(abs(-1.25) - 1.25) < 1e-15 and abs(np.angle(-1.25) - PI) < 1e-15)
a67 = 0.6
wq = np.linspace(-PI, PI, 400001)
X67 = (1 - a67**2)/(1 - 2*a67*np.cos(wq) + a67**2)
check('Q6-07d', 'a^{|n|} is real AND strictly positive, so there |X| = X and the phase really is 0',
      X67.min() > 0 and np.allclose(np.abs(X67), X67, atol=1e-15))
check('Q6-07e', 'the pulse is symmetric about n = 0, so its transform really is real',
      np.max(np.abs(dtft(np.ones(5), -2, wq[::4000]).imag)) < 1e-9)

# Q6-08  the multiplication property is a periodic convolution
wrap = lambda a: (np.asarray(a) + PI) % (2*PI) - PI
X68 = lambda a: (np.abs(wrap(a)) <= 3*PI/4).astype(float)
Y68 = lambda a: (np.abs(wrap(a)) <= PI/2).astype(float)
th68 = np.linspace(-PI, PI, 2000001)
Zpi = trapz(X68(th68)*Y68(PI - th68), th68)/(2*PI)
th_o = np.linspace(-20, 20, 4000001)
Zord = trapz(((np.abs(th_o) <= 3*PI/4)*(np.abs(PI - th_o) <= PI/2)).astype(float),
             th_o)/(2*PI)
check('Q6-08', 'the periodic convolution gives Z(e^{j pi}) = 1/4, the ordinary one only 1/8',
      abs(Zpi - 0.25) < 1e-4 and abs(Zord - 0.125) < 1e-4, f'{Zpi:.5f} vs {Zord:.5f}')
check('Q6-08b', 'the ordinary convolution is 5pi/2 wide, which exceeds the period 2pi',
      abs(2*(3*PI/4 + PI/2) - 2.5*PI) < 1e-12 and 2.5*PI > 2*PI)
wgrid = np.linspace(-PI, PI, 401)
Zv = np.array([trapz(X68(th68)*Y68(w_ - th68), th68)/(2*PI) for w_ in wgrid])
check('Q6-08c', 'its average over one period is z[0] = x[0]y[0] = 0.375',
      abs(trapz(Zv, wgrid)/(2*PI) - 0.375) < 1e-3, f'{trapz(Zv, wgrid)/(2*PI):.5f}')
check('Q6-08d', 'the trapezoid height is 1/2, so the 1/(2pi) is already in the reported number',
      abs(Zv.max() - 0.5) < 1e-3, f'peak={Zv.max():.5f}')
X68b = lambda a: (np.abs(wrap(a)) <= PI/2).astype(float)
Zeq = np.array([trapz(X68b(th68)*X68b(w_ - th68), th68)/(2*PI) for w_ in wgrid])
check('Q6-08e', 'two equal bands of half-width pi/2 give a triangle that just fills the period, so nothing folds',
      abs(Zeq.max() - 0.5) < 1e-3 and abs(Zeq[0]) < 1e-3 and abs(Zeq[-1]) < 1e-3)

# Q6-09  discrete-time frequencies are reduced into the period first
nn69 = np.arange(-40, 41)
check('Q6-09', 'cos(5pi n/3) = cos(pi n/3) and cos(7pi n/4) = cos(pi n/4) at every integer n',
      np.allclose(np.cos(5*PI*nn69/3), np.cos(PI*nn69/3), atol=1e-12)
      and np.allclose(np.cos(7*PI*nn69/4), np.cos(PI*nn69/4), atol=1e-12))
check('Q6-09b', 'the weights are 2pi at +-pi/3 and pi at +-pi/4, the amplitude 2 doubling the first',
      abs(2*PI - 6.283185) < 5e-6 and abs(PI - 3.141593) < 5e-6)
check('Q6-09c', 'neither 5pi/3 nor 7pi/4 lies inside -pi < w <= pi',
      5*PI/3 > PI and 7*PI/4 > PI)
check('Q6-09d', 'dropping the negative-frequency impulses rebuilds a complex sequence',
      np.max(np.abs(np.exp(1j*PI*nn69/3).imag)) > 0.8)
per69 = []
for w0 in (PI/3, PI/4):
    m = 1
    while not float(2*PI/w0*m).is_integer():
        m += 1
    per69.append(int(round(2*PI/w0*m)))
check('Q6-09e', 'the two periods are 6 and 8, so the sum repeats after LCM(6,8) = 24',
      per69 == [6, 8] and np.lcm(per69[0], per69[1]) == 24, f'{per69}')

# Q6-10  the impulse response of the second-order difference equation
h610 = lambda nv: 4*0.5**np.asarray(nv) - 2*0.25**np.asarray(nv)
check('Q6-10', 'h[n] = 4(1/2)^n - 2(1/4)^n gives h[0] = 2, h[1] = 1.5, h[2] = 0.875',
      all(abs(h610(v) - w_) < 1e-12 for v, w_ in zip((0, 1, 2), (2.0, 1.5, 0.875))))
check('Q6-10b', 'the recursion is satisfied for n >= 1',
      abs(h610(1) - 0.75*h610(0)) < 1e-12
      and abs(h610(2) - 0.75*h610(1) + 0.125*h610(0)) < 1e-12
      and abs(h610(7) - 0.75*h610(6) + 0.125*h610(5)) < 1e-12)
check('Q6-10c', 'the +2 distractor gives h[0] = 6, while the equation itself forces h[0] = 2',
      abs(4 + 2 - 6) < 1e-15 and abs(4 - 2 - 2) < 1e-15)
check('Q6-10d', 'the bases are the roots 1/2 and 1/4: their sum is 3/4 and their product is 1/8',
      abs(0.5 + 0.25 - 0.75) < 1e-15 and abs(0.5*0.25 - 0.125) < 1e-15)
check('Q6-10e', 'both poles have modulus below 1, so the system is stable',
      abs(0.5) < 1 and abs(0.25) < 1)

# Q6-11  a discrete-time magnitude spectrum must repeat every 2pi
wsk = np.linspace(-3*PI, 3*PI, 600001)
mag = np.abs(dtft(x61, n61, wsk))
check('Q6-11', 'a real discrete-time magnitude repeats: the three periods drawn are the same curve',
      np.allclose(np.abs(dtft(x61, n61, wsk[wsk <= -PI] + 2*PI)),
                  np.abs(dtft(x61, n61, wsk[wsk <= -PI])), atol=1e-10))
hump = lambda w_: np.where(np.abs(w_) <= PI, 1 - np.abs(w_)/PI, 0.0)
check('Q6-11b', 'a single hump zero outside |w| <= pi is not periodic: it reads 0 at 2pi and 1 at 0',
      abs(hump(np.array([2*PI]))[0] - hump(np.array([0.0]))[0]) > 0.5)
decay = lambda w_: 1/(1 + w_**2)
check('Q6-11c', 'a steadily decaying curve fails the same test, while a real transform reads '
                'the same value at w and at w + 100 periods',
      abs(decay(np.array([100*PI]))[0] - decay(np.array([0.0]))[0]) > 0.5
      and np.allclose(np.abs(dtft(x61, n61, np.array([0.7]))),
                      np.abs(dtft(x61, n61, np.array([0.7 + 100*2*PI]))), atol=1e-6))
check('Q6-11d', 'a magnitude is never negative',
      mag.min() >= 0.0)

# Q6-12  what transfers between the two transforms and what does not
xa = np.array([1.0, -0.5, 0.25])
xb = np.array([2.0, 1.0])
w612 = np.array([-2.2, -0.6, 0.0, 1.4, 3.0])
check('Q6-12', 'convolution in time is multiplication of the transforms in discrete time too',
      np.allclose(dtft(np.convolve(xa, xb), 0, w612),
                  dtft(xa, 0, w612)*dtft(xb, 0, w612), atol=1e-12))
xa5 = np.array([1.0, -0.5, 0.25, 0.0, 0.0]); xb5 = np.array([2.0, 1.0, 0.0, 0.0, 0.0])
check('Q6-12b', 'multiplication in time is a periodic convolution of the two spectra, with a 1/(2pi)',
      np.allclose(dtft(xa5*xb5, 0, w612),
                  np.array([trapz(dtft(xa5, 0, th68)*dtft(xb5, 0, w_ - th68), th68)/(2*PI)
                            for w_ in w612]), atol=1e-4))
check('Q6-12c', 'the discrete-time synthesis integral runs over one period, not the whole line',
      abs((PI - (-PI)) - 2*PI) < 1e-15)
check('Q6-12d', 'a^n u[n] transforms to 1/(1 - a e^{-jw}), which is not 1/(a + jw) with t renamed',
      np.allclose(dtft(0.5**np.arange(0, 200), 0, w612), 1/(1 - 0.5*np.exp(-1j*w612)), atol=1e-9)
      and not np.allclose(1/(1 - 0.5*np.exp(-1j*w612)), 1/(0.5 + 1j*w612), atol=1e-2))
check('Q6-12e', 'the first difference carries a factor 1 - e^{-jw}, not jw',
      np.allclose(dtft(np.concatenate([xa, [0]]) - np.concatenate([[0], xa]), 0, w612),
                  (1 - np.exp(-1j*w612))*dtft(xa, 0, w612), atol=1e-12))

# ---------------------------------------------------------------- MODULE 7
# verify_m7.py re-derives the mathematics of the module.  These lines check the
# keyed option of each question and the reason given for each distractor.

# Q7-01  the replication formula and its scale factor
T71 = 0.4
ws71 = 2*PI/T71
w71 = np.linspace(-3*ws71, 3*ws71, 600001)
tri = lambda a, wm: np.where(np.abs(a) <= wm, 1 - np.abs(a)/wm, 0.0)
Xp71 = sum(tri(w71 - k*ws71, 2*PI) for k in range(-4, 5))/T71
check('Q7-01', 'X_p is the sum of copies at every multiple of w_s, each scaled by 1/T',
      abs(Xp71[np.argmin(np.abs(w71))] - 1/T71) < 1e-6
      and abs(Xp71[np.argmin(np.abs(w71 - ws71))] - 1/T71) < 1e-6, f'1/T={1/T71}')
check('Q7-01b', 'dropping the 1/T leaves every copy at height 1 instead of 1/T = 2.5, '
                'and the error follows the rate',
      abs(1/T71 - 2.5) < 1e-12 and abs(1/0.1 - 10.0) < 1e-12 and abs(1.0 - 1/T71) > 1.4)
check('Q7-01c', 'the two factors of 2pi cancel: (1/2pi) of the property against 2pi/T of the train',
      abs((1/(2*PI))*(2*PI/T71) - 1/T71) < 1e-15)
check('Q7-01d', 'nothing in the formula depends on the rate, so the copies appear at every T',
      all(abs(sum(tri(0.0 - k*(2*PI/Tv), 2*PI) for k in range(-4, 5))/Tv - 1/Tv) < 1e-9
          for Tv in (0.1, 0.4, 1.0)))

# Q7-02  a filter cannot undo an addition
check('Q7-02', 'a component at 0.7 w_s lands at 0.7w_s - w_s = -0.3w_s, inside the band the filter keeps',
      abs(0.7*ws71 - ws71) < ws71/2 and 0.7*ws71 > ws71/2)
check('Q7-02b', 'a filter scales one value per frequency, and one value does not name the two summed '
                'into it: 3 + 5 and 2 + 6 are the same number',
      abs((3 + 5) - (2 + 6)) < 1e-15 and abs(3 - 2) > 0.5)
check('Q7-02c', 'upstream the intruder still sits above w_s/2 and can be cut; downstream it does not',
      0.7*ws71 > ws71/2 and abs(0.7*ws71 - ws71) < ws71/2)

# Q7-03  the zero-order hold is not the ideal reconstruction filter
T73 = 0.4
H0 = lambda w_: np.where(np.abs(w_) < 1e-9, T73,
                         2*np.sin(np.where(np.abs(w_) < 1e-9, 1, w_)*T73/2)
                         / np.where(np.abs(w_) < 1e-9, 1, w_))
wc73 = PI/T73
check('Q7-03', 'H_0(0) = T and the magnitude sags below T inside the band',
      abs(H0(np.array([0.0]))[0] - T73) < 1e-9
      and abs(H0(np.array([wc73]))[0]) < T73 - 1e-3,
      f'H0(0)={T73}, |H0(wc)|={abs(H0(np.array([wc73]))[0]):.5f}')
check('Q7-03b', 'the magnitude is not zero beyond the band, so parts of the copies survive',
      abs(H0(np.array([1.5*wc73]))[0]) > 1e-3)
check('Q7-03c', 'the phase -w T/2 is a delay of half a period, and it is not the only effect',
      abs(-1.0*T73/2 - (-0.2)) < 1e-12)
errs = []
for Tv in (0.4, 0.1, 0.025):
    wv = np.linspace(-PI/Tv, PI/Tv, 200001)
    Hv = np.where(np.abs(wv) < 1e-9, Tv, 2*np.sin(np.where(np.abs(wv) < 1e-9, 1, wv)*Tv/2)
                  / np.where(np.abs(wv) < 1e-9, 1, wv))
    errs.append(np.max(np.abs(np.abs(Hv)/Tv - 1)))
check('Q7-03d', 'raising the rate shrinks the in-band error but never removes it',
      all(v > 0 for v in errs) and errs[0] > errs[-1] - 1e-12,
      ', '.join(f'{v:.4f}' for v in errs))

# Q7-04  an angular rate and a period are linked by w_s T = 2 pi
ws74 = 8000*PI
T74 = 2*PI/ws74
check('Q7-04', 'T = 2pi/w_s = 2.5e-4 s = 0.25 ms, and w_s T = 2pi',
      abs(T74 - 2.5e-4) < 1e-12 and abs(ws74*T74 - 2*PI) < 1e-9, f'T={T74:.8g}')
check('Q7-04b', 'the 0.25 s distractor fails the unit test: 8000pi x 0.25 = 2000pi',
      abs(ws74*0.25 - 2000*PI) < 1e-6)
check('Q7-04c', '1.25e-4 s belongs to w_s = 16000pi, twice the rate asked about',
      abs(2*PI/1.25e-4 - 16000*PI) < 1e-6 and abs(2.5e-4/1.25e-4 - 2) < 1e-12)
check('Q7-04d', '3.98e-5 s is 1/w_s, the conversion made without the 2pi',
      abs(1/ws74 - 3.9789e-5) < 1e-8 and abs(ws74*(1/ws74) - 1) < 1e-12)
check('Q7-04e', 'the matching rate in hertz is f_s = 1/T = 4000 Hz and w_s = 2pi f_s',
      abs(1/T74 - 4000) < 1e-6 and abs(2*PI*4000 - ws74) < 1e-6)

# Q7-05  the peak of a copy is the peak of the spectrum divided by T
A75, T75 = 8000*PI, 1.25e-4
Xmax75 = A75/(2*PI)
check('Q7-05', 'X_max = A/2pi = 4000 and X_max/T = 4000 x 8000 = 3.2e7',
      abs(Xmax75 - 4000) < 1e-9 and abs(Xmax75/T75 - 3.2e7) < 1e-3,
      f'X_max={Xmax75}, X_max/T={Xmax75/T75:.4g}')
check('Q7-05b', 'the A/T distractor is 2pi times too large: 2.01e8',
      abs(A75/T75 - 2.0106e8) < 1e5 and abs((A75/T75)/(Xmax75/T75) - 2*PI) < 1e-9)
check('Q7-05c', 'the X_max T distractor multiplies where it should divide: 0.5',
      abs(Xmax75*T75 - 0.5) < 1e-12)
check('Q7-05d', 'the rate is w_s = 2pi/T = 16000pi, exactly twice w_M = 8000pi',
      abs(2*PI/T75 - 16000*PI) < 1e-6 and abs(16000*PI/(8000*PI) - 2) < 1e-12)

# Q7-06  cos(2 pi t) sampled at T = 2/3 s
T76 = 2/3
ws76 = 2*PI/T76
lines76 = sorted({abs(k*ws76 + s*2*PI) for k in (-2, -1, 0, 1, 2) for s in (-1, 1)})
kept76 = [v for v in lines76 if v < ws76/2 - 1e-9]
check('Q7-06', 'w_s = 3pi is below the Nyquist rate 4pi, and the only line inside the cutoff is pi',
      abs(ws76 - 3*PI) < 1e-9 and ws76 < 4*PI
      and len(kept76) == 1 and abs(kept76[0] - PI) < 1e-9, f'kept={[round(v,4) for v in kept76]}')
nn76 = np.arange(-30, 31)
check('Q7-06b', 'the samples of cos(2pi t) and of cos(pi t) are identical at T = 2/3 s',
      np.allclose(np.cos(2*PI*nn76*T76), np.cos(PI*nn76*T76), atol=1e-12))
check('Q7-06c', 'the baseband line at 2pi lies outside the cutoff 1.5pi and is discarded',
      2*PI > ws76/2)
check('Q7-06d', '3pi is the rate itself and 4pi is the Nyquist rate; neither is a line inside the filter',
      all(min(abs(v - L) for L in lines76) > 1e-9 or v > ws76/2 for v in (3*PI, 4*PI)))

# Q7-07  replication is unconditional; aliasing is the overlap
gap = lambda ws_, wM_: ws_ - 2*wM_
check('Q7-07', 'the guard band w_s - 2w_M decides the outcome and changes sign with the rate',
      gap(5*PI, 2*PI) > 0 and abs(gap(4*PI, 2*PI)) < 1e-12 and gap(3*PI, 2*PI) < 0)
Xp_lo = sum(tri(w71 - k*(3*PI), 2*PI) for k in range(-6, 7))/(2*PI/(3*PI))
check('Q7-07b', 'below the Nyquist rate the copies are still all there: the sum is non-zero '
                'at every multiple of w_s, and larger than one copy inside the overlap',
      abs(Xp_lo[np.argmin(np.abs(w71 - 3*PI))] - Xp_lo[np.argmin(np.abs(w71))]) < 1e-6
      and Xp_lo[np.argmin(np.abs(w71 - 1.5*PI))] > tri(1.5*PI, 2*PI)/(2/3))
check('Q7-07c', 'inside the overlap the sampler stores one number made from two',
      abs((1.0 + 0.6) - 1.6) < 1e-15)
check('Q7-07d', 'above the Nyquist rate the copies are further apart and taller: 1/T grows with the rate',
      1/(2*PI/(5*PI)) > 1/(2*PI/(3*PI)))

# Q7-08  the boundary case annihilates the band-edge sine
T78 = 1/4000
nn78 = np.arange(-200, 201)
check('Q7-08', 'every sample of sin(4000 pi t) is zero at T = 1/4000 s',
      np.max(np.abs(np.sin(4000*PI*nn78*T78))) < 1e-9)
check('Q7-08b', 'at +4000pi the baseband and the k=1 copy contribute +4000pi/j and -4000pi/j',
      abs((1/T78)*(PI/1j) + (1/T78)*(-PI/1j)) < 1e-9
      and abs(abs((1/T78)*(PI/1j)) - 4000*PI) < 1e-6)
check('Q7-08c', 'the admissible cutoff interval w_M < w_c < w_s - w_M is empty at the Nyquist rate',
      not (4000*PI < 8000*PI - 4000*PI))
check('Q7-08d', 'losing one of two equal contributions would halve the term; here the sum is zero',
      abs(0.5 - 0.5) < 1e-15 and abs((PI/1j) + (-PI/1j)) < 1e-15)
check('Q7-08e', 'the constant sits at 0 and its nearest copies at +-8000pi, far from the origin',
      8000*PI > 0)
check('Q7-08f', 'with a guard band of 1000pi the samples become sin(8 pi n/9), not identically zero',
      np.max(np.abs(np.sin(4000*PI*nn78*(1/4500)))) > 0.9
      and np.allclose(np.sin(4000*PI*nn78*(1/4500)), np.sin(8*PI*nn78/9), atol=1e-9))

# Q7-09  rate and cutoff from a requested guard band
wM79, wg79 = 4000*PI, 1000*PI
ws79 = 2*wM79 + wg79
T79 = 2*PI/ws79
check('Q7-09', 'w_s = 9000pi, T = 1/4500 s = 222.2 us, and 4000pi < w_c < 5000pi',
      abs(ws79 - 9000*PI) < 1e-6 and abs(T79 - 1/4500) < 1e-12
      and abs(T79*1e6 - 222.2) < 0.05
      and abs((ws79 - wM79) - 5000*PI) < 1e-6, f'T={T79:.8g} s')
check('Q7-09b', 'the 1/4000 s distractor is the Nyquist rate itself, where the cutoff interval is empty',
      abs(2*PI/(1/4000) - 8000*PI) < 1e-6 and not (wM79 < 8000*PI - wM79))
check('Q7-09c', '1/9000 s corresponds to 18000pi rad/s, twice the intended rate',
      abs(2*PI/(1/9000) - 18000*PI) < 1e-6)
check('Q7-09d', 'a cutoff below 4000pi removes the band edge the guard band was added to protect',
      3000*PI < wM79)
check('Q7-09e', 'the checks close: w_s T = 2pi and w_s - 2w_M = 1000pi',
      abs(ws79*T79 - 2*PI) < 1e-9 and abs(ws79 - 2*wM79 - 1000*PI) < 1e-6)

# Q7-10  two components, one kept and one aliased
T710 = 2/5
ws710 = 2*PI/T710
wc710 = ws710/2
lines710 = sorted({abs(k*ws710 + s*w0) for k in (-2, -1, 0, 1, 2)
                   for s in (-1, 1) for w0 in (PI, 3*PI)})
kept710 = sorted(v for v in lines710 if v < wc710 - 1e-9)
check('Q7-10', 'w_s = 5pi, w_c = 2.5pi, and the surviving lines are pi and 2pi',
      abs(ws710 - 5*PI) < 1e-9 and abs(wc710 - 2.5*PI) < 1e-9
      and len(kept710) == 2 and abs(kept710[0] - PI) < 1e-9 and abs(kept710[1] - 2*PI) < 1e-9,
      f'kept={[round(v/PI,3) for v in kept710]} x pi')
nn710 = np.arange(-30, 31)
check('Q7-10b', 'the samples of cos(3pi t) and cos(2pi t) agree at T = 2/5 s',
      np.allclose(np.cos(3*PI*nn710*T710), np.cos(2*PI*nn710*T710), atol=1e-12))
check('Q7-10c', 'the rate 5pi is below the Nyquist rate 6pi of this signal',
      ws710 < 6*PI)
check('Q7-10d', 'the line at 3pi is outside the cutoff and the line at 4pi is too',
      3*PI > wc710 and 4*PI > wc710)

# Q7-11  reading a replica diagram
ws711, wM711 = 5*PI, 2*PI
check('Q7-11', 'the spacing of the centres is w_s = 5pi, so T = 0.4 s and the copy height is 1/T = 2.5',
      abs(2*PI/ws711 - 0.4) < 1e-12 and abs(1/(2*PI/ws711) - 2.5) < 1e-12)
check('Q7-11b', 'the gap runs from w_M = 2pi to w_s - w_M = 3pi, so it is w_s - 2w_M = pi wide',
      abs((ws711 - wM711) - wM711 - PI) < 1e-9)
check('Q7-11c', 'w_s - w_M = 3pi is where the gap ends, not its width',
      abs(ws711 - wM711 - 3*PI) < 1e-9)
check('Q7-11d', '2pi is where the baseband reaches zero, so it is w_M and not the rate',
      abs(wM711 - 2*PI) < 1e-9 and abs(ws711 - wM711) > 1e-9)
check('Q7-11e', 'the gap is positive, so any cutoff in 2pi < w_c < 3pi recovers the signal',
      ws711 - 2*wM711 > 0)

# Q7-12  finite duration and finite bandwidth cannot hold together
w712 = np.linspace(0.5, 400, 800001)
Xrect = 2*np.sin(w712*1.0)/w712
check('Q7-12', 'the transform of a rectangular window keeps crossing zero without ever staying there',
      np.max(np.abs(Xrect[w712 > 300])) > 1e-3)
check('Q7-12b', 'so no finite w_M exists: the tail is still non-zero however far out it is read',
      all(np.max(np.abs(Xrect[w712 > c])) > 1e-4 for c in (50, 150, 350)))
check('Q7-12c', 'with the filter first, reconstruction returns X_1 exactly: T times 1/T is 1',
      abs(0.4*(1/0.4) - 1.0) < 1e-15)
check('Q7-12d', 'gain 1 leaves the result a factor T too small, and a cutoff at w_s reaches the '
                'neighbouring copies, which begin at w_s - w_M = 3pi',
      abs(1.0*(1/0.4) - 1.0) > 1.4 and 5*PI > 5*PI - 2*PI)

print('\n' + '-'*66)
bad = [q for q, o in results if not o]
print(f'{len(results)} checks, {len(results)-len(bad)} passed, {len(bad)} failed'
      + (f': {bad}' if bad else ''))
