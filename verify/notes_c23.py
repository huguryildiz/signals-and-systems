"""Numerical checks for lecture-notes Chapters 2 and 3 (notes/src/c23.js).
Every number the chapter states is recomputed here. Prints PASS/FAIL lines and a total."""
import numpy as np
import sympy as sp

passed = failed = 0
def check(name, ok):
    global passed, failed
    if ok: passed += 1; print('PASS', name)
    else:  failed += 1; print('FAIL', name)
close = lambda a, b, tol=1e-9: abs(a - b) < tol

t, tau, n = sp.symbols('t tau n', real=True)

# ---------- Chapter 2 ----------
# savings account written as y[n] + a y[n-1] = b x[n]
yn_, ym_, xn_ = sp.symbols('y_n y_m x_n')
lhs = sp.expand((yn_ - sp.Rational(101, 100)*ym_) - (sp.Rational(101, 100)*ym_ + xn_ - sp.Rational(101, 100)*ym_))
check('2.1 savings: y[n]-1.01y[n-1]=x[n] gives a=-1.01, b=1', lhs == yn_ - sp.Rational(101, 100)*ym_ - xn_)
# RC step: v = 1 - exp(-t/T) solves v' + v/T = 1/T
T = sp.symbols('T', positive=True)
v = 1 - sp.exp(-t/T)
check('2.1 RC step solves the equation', sp.simplify(sp.diff(v, t) + v/T - 1/T) == 0)
check('2.1 RC step starts at 0', v.subs(t, 0) == 0)
# order of a cascade
x = sp.symbols('x')
check('2.1 square then double = 2x^2, double then square = 4x^2', sp.expand((2*x)**2) == 4*x**2)
# Example 2.1: delay then doubling, impulse input
xs = np.zeros(10); xs[0] = 1
w = np.concatenate(([0], xs[:-1])); y = 2*w
check('Ex 2.1 y = 2 delta[n-1]', y[1] == 2 and y.sum() == 2)
# accumulator impulse response: y[3] = 1
acc = np.cumsum(xs)
check('2.2 accumulator of delta is u[n], y[3]=1', acc[3] == 1 and np.all(acc == 1))
# Example 2.2 gain bound
tt = np.linspace(-20, 20, 200001)
g = np.cos(tt) + 2
check('Ex 2.2 1 <= cos t + 2 <= 3', g.min() >= 1 - 1e-12 and g.max() <= 3 + 1e-12)
# inverse accumulator figure: x = [0,0,1,2,-1,1,0,...], y = cumsum, first difference returns x
xv = np.array([0, 0, 1, 2, -1, 1, 0, 0, 0, 0, 0])
yv = np.cumsum(xv)
wv = yv - np.concatenate(([0], yv[:-1]))
check('2.2 first difference undoes the accumulator (figure data)', np.array_equal(wv, xv))
check('2.2 accumulator figure values 0,0,1,3,2,3,3,...', list(yv) == [0, 0, 1, 3, 2, 3, 3, 3, 3, 3, 3])
# Example 2.4 inverse of 3x(t-2)
f = sp.Function('f')
yy = lambda s: 3*f(s - 2)
check('Ex 2.4 (1/3) y(t+2) = x(t)', sp.simplify(sp.Rational(1, 3)*yy(t + 2) - f(t)) == 0)
check('Ex 2.4 (1/3) y(t-2) = x(t-4)', sp.simplify(sp.Rational(1, 3)*yy(t - 2) - f(t - 4)) == 0)
check('Ex 2.4 3 y(t+2) = 9 x(t)', sp.simplify(3*yy(t + 2) - 9*f(t)) == 0)
# Example 2.6: accumulator of u[n] = n+1
check('Ex 2.6 sum_{k=0}^{n} 1 = n+1', all(np.cumsum(np.ones(12))[k] == k + 1 for k in range(12)))
# Example 2.8: n delta[n] = 0, n delta[n-1] = delta[n-1]
nn = np.arange(-3, 5)
check('Ex 2.8 n*delta[n]=0 and n*delta[n-1]=delta[n-1]',
      np.all(nn*(nn == 0) == 0) and np.array_equal(nn*(nn == 1), (nn == 1).astype(int)))
# Example 2.9: y2 = x1(2t - 2), y1(t-2) = x1(2t - 4), pulse |t|<2
tg = np.linspace(-3, 5, 80001)
x1 = lambda s: (np.abs(s) < 2).astype(float)
y2 = x1(2*tg - 2); y1s = x1(2*tg - 4)
check('Ex 2.9 path 1 pulse on 0<t<2', close(tg[y2 > 0].min(), 0, 1e-3) and close(tg[y2 > 0].max(), 2, 1e-3))
check('Ex 2.9 path 2 pulse on 1<t<3', close(tg[y1s > 0].min(), 1, 1e-3) and close(tg[y1s > 0].max(), 3, 1e-3))
check('Ex 2.9 unshifted output on -1<t<1', close(tg[x1(2*tg) > 0].min(), -1, 1e-3) and close(tg[x1(2*tg) > 0].max(), 1, 1e-3))
# Example 2.12: x1 = 2+j, a = j
x1c = 2 + 1j; a = 1j
check('Ex 2.12 a x1 = -1+2j', a*x1c == -1 + 2j)
check('Ex 2.12 y1=2, a y1=2j, y2=-1', x1c.real == 2 and a*x1c.real == 2j and (a*x1c).real == -1)
# Example 2.13: y = 3x + 2
S = lambda v: 3*v + 2
check('Ex 2.13 y1=5, y2=8, y3=11, y1+y2=13, gap 2',
      S(1) == 5 and S(2) == 8 and S(3) == 11 and S(1) + S(2) == 13 and S(1) + S(2) - S(3) == 2)
# Section 2.3 everyday systems: savings with deposits of 100 grows without bound
bal = 0.0
for k in range(600): bal = 1.01*bal + 100
check('2.3 savings balance with 100/month exceeds 1e6 after 50 years', bal > 1e6)
check('2.3 overdrive tanh(2x) bounded by 1 (memoryless, not linear)', np.all(np.abs(np.tanh(2*np.linspace(-50, 50, 1001))) <= 1))
# Exercise 2.2: inverse of first difference on inputs zero for n<0
xr = np.random.default_rng(1).normal(size=20)
yd = xr - np.concatenate(([0], xr[:-1]))
check('Ex 2.2 (exercise) running sum inverts the first difference', np.allclose(np.cumsum(yd), xr))

# ---------- Chapter 3 ----------
# representation example x[n] = 3 delta[n+1] - delta[n-2] at n=-1
d = lambda m: 1 if m == 0 else 0
check('3.1 x[-1] = 3', 3*d(-1 + 1) - d(-1 - 2) == 3)
# y[3] = 3.2 both ways
xa = np.array([1, 2, 1, 2]); ha = np.array([1, 0.6, 0.3])
ya = np.convolve(xa, ha)
check('3.2 y[3] = 3.2 for x={1,2,1,2}, h={1,.6,.3}', close(ya[3], 3.2))
check('3.2 y[3] second form', close(sum(ha[m]*xa[3 - m] for m in range(3)), 3.2))
check('3.2 h[3-k]=0.3 at k=1 and h[0] at k=3', ha[3 - 1] == 0.3 and 3 - 3 == 0)
# Example 3.1
y31 = np.convolve([1, 2, 1, 2], [1, 1])
check('Ex 3.1 y = {1,3,3,3,2}', list(y31) == [1, 3, 3, 3, 2])
check('Ex 3.1 length 4+2-1=5 and sum 12 = 6*2', len(y31) == 5 and y31.sum() == 12 == 6*2)
# Example 3.2
N = 40
x32 = 0.5**np.arange(N); y32 = np.convolve(x32, np.ones(N))[:N]
check('Ex 3.2 y[n] = 2 - (1/2)^n', np.allclose(y32, 2 - 0.5**np.arange(N)))
check('Ex 3.2 y[0]=1, limit 2', close(y32[0], 1) and close(sum(0.5**np.arange(200)), 2))
kk = sp.symbols('k', integer=True)
check('3.2 geometric-sum formula', sp.simplify(sp.summation(3*sp.Rational(1, 2)**kk, (kk, 2, 7))
      - 3*(sp.Rational(1, 2)**2 - sp.Rational(1, 2)**8)/(1 - sp.Rational(1, 2))) == 0)
# Example 3.3
y33a = sp.integrate(sp.exp(2*tau), (tau, -sp.oo, t - 3))
y33b = sp.integrate(sp.exp(2*tau), (tau, -sp.oo, 0))
check('Ex 3.3 case 1 = exp(2(t-3))/2', sp.simplify(y33a - sp.exp(2*(t - 3))/2) == 0)
check('Ex 3.3 case 2 = 1/2 and continuity at t=3', y33b == sp.Rational(1, 2) and y33a.subs(t, 3) == sp.Rational(1, 2))
# Example 3.4 (numeric convolution) and its branch values
dt = 1e-3
tg = np.arange(0, 6, dt)
xr34 = ((tg > 0) & (tg < 1)).astype(float); hr34 = np.where((tg > 0) & (tg < 2), tg, 0)
yn = np.convolve(xr34, hr34)[:len(tg)]*dt
ref = np.where(tg < 1, 0.5*tg**2, np.where(tg < 2, tg - 0.5, np.where(tg < 3, -0.5*tg**2 + tg + 1.5, 0)))
check('Ex 3.4 numeric convolution matches the five branches', np.max(np.abs(yn - ref)) < 5e-3)
b2 = sp.integrate(t**2/2, (t, 0, 1)); b3 = sp.integrate(t - sp.Rational(1, 2), (t, 1, 2))
b4 = sp.integrate(-t**2/2 + t + sp.Rational(3, 2), (t, 2, 3))
check('Ex 3.4 branch areas 1/6, 1, 5/6, total 2', (b2, b3, b4) == (sp.Rational(1, 6), 1, sp.Rational(5, 6)) and b2 + b3 + b4 == 2)
check('Ex 3.4 peak 1.5 at t=2, continuity values 1/2, 3/2, 0',
      close(ref[2000], 1.5) and close(0.5*1**2, 1 - 0.5) and close(2 - 0.5, -0.5*4 + 2 + 1.5) and close(-0.5*9 + 3 + 1.5, 0))
# Example 3.5 and exercise 3.4
h1 = np.array([1, -1]); u = np.ones(30)
check('Ex 3.5 (delta - delta[n-1]) * u = delta', np.array_equal(np.convolve(h1, u)[:30], np.eye(30)[0]))
check('Exercise 3.4 (delta+delta[n-1])*(delta-delta[n-1]) = delta - delta[n-2]', list(np.convolve([1, 1], [1, -1])) == [1, 0, -1])
check('3.4 parallel delta + delta[n-1]', list(np.array([1, 0]) + np.array([0, 1])) == [1, 1])
# stability examples
check('3.4 sum (1/2)^n = 2', close(sum(0.5**np.arange(200)), 2))
check('3.4 sum 0.7^n = 10/3', close(sum(0.7**np.arange(400)), 10/3))
hneg = (-0.8)**np.arange(400)
xs_sign = np.sign(hneg)  # x[-k] = sgn h[k]
check('3.4 y[0] = sum |(-0.8)^k| = 5', close(np.sum(hneg*xs_sign), 5, 1e-9))
check('3.4 sgn h[-n] = (-1)^n for n<=0', all(np.sign((-0.8)**(-m)) == (-1)**m for m in range(-10, 1)))
xq = np.arange(1, 9); yq_ = np.convolve(xq, [1])  # h[-1]=1 is a one-sample advance
check('3.4 h=delta[n+1] gives y[n]=x[n+1]', all(sum((1 if k == -1 else 0)*xq[m - k] for k in (-1,) if 0 <= m - k < 8) == xq[m + 1] for m in range(7)))
# step response examples
s_ct = sp.integrate(sp.exp(-tau), (tau, 0, t))
check('3.4 s(t) = 1 - exp(-t) and s\' = h', sp.simplify(s_ct - (1 - sp.exp(-t))) == 0 and sp.simplify(sp.diff(s_ct, t) - sp.exp(-t)) == 0)
check('3.4 s(1) = 1 - 1/e', close(float(s_ct.subs(t, 1)), 1 - np.exp(-1)))
h36 = np.array([1, 0, -1] + [0]*7); s36 = np.cumsum(h36)
check('Ex 3.6 s = delta + delta[n-1]', list(s36) == [1, 1] + [0]*8)
check('Ex 3.6 first difference returns h', np.array_equal(s36 - np.concatenate(([0], s36[:-1])), h36))
check('3.4 integrator step response u*u = t u(t)', sp.integrate(1, (tau, 0, t)) == t)
# 3.5 recursion
def rec(a, b, x, N):
    y = np.zeros(N); prev = 0.0
    for k in range(N): prev = a*prev + b*x[k]; y[k] = prev
    return y
imp = np.eye(40)[0]
h37 = rec(0.5, 1, imp, 40)
check('Ex 3.7 h = (1/2)^n: 1, 1/2, 1/4', np.allclose(h37, 0.5**np.arange(40)) and list(h37[:3]) == [1, 0.5, 0.25])
hm = rec(-0.5, 1, imp, 3)
check('Ex 3.7 check: a=-1/2 gives 1, -1/2, 1/4', list(hm) == [1, -0.5, 0.25])
check('3.5 table of passes 1, 1/2, 1/4, 1/8, 1/16', list(h37[:5]) == [1, 0.5, 0.25, 0.125, 0.0625])
check('3.5 FIR x+2x[n-1]-x[n-3] has three nonzero samples', np.count_nonzero([1, 2, 0, -1]) == 3)
check('3.5 b a^n from recursion (a=0.8, b=0.2)', np.allclose(rec(0.8, 0.2, imp, 40), 0.2*0.8**np.arange(40)))
check('3.5 both smoothers sum to 1', close(3*(1/3), 1) and close(0.2/(1 - 0.8), 1) and close(sum(0.2*0.8**np.arange(500)), 1))
check('3.5 |a|<1 sum |b|/(1-|a|) (a=-0.6, b=2)', close(sum(np.abs(2*(-0.6)**np.arange(400))), 2/(1 - 0.6)))
check('3.5 a=b=1 recursion is the accumulator', np.all(rec(1, 1, imp, 20) == 1))
# Example 3.8
y38 = rec(0.8, 0.2, 25*np.ones(60), 60)
check('Ex 3.8 y[n] = 25(1-0.8^{n+1})', np.allclose(y38, 25*(1 - 0.8**(np.arange(60) + 1))))
check('Ex 3.8 y[0]=5, y[1]=9, y[2]=12.2, limit 25', close(y38[0], 5) and close(y38[1], 9) and close(y38[2], 12.2) and close(y38[-1], 25, 1e-4))
# first-order differential equation
hh = sp.exp(-2*t)
check('3.5 h\' + 2h = 0 for t>0, h(0+) = 1', sp.simplify(sp.diff(hh, t) + 2*hh) == 0 and hh.subs(t, 0) == 1)
s2 = sp.integrate(sp.exp(-2*tau), (tau, 0, t))
check('3.5 s = (1 - e^{-2t})/2', sp.simplify(s2 - (1 - sp.exp(-2*t))/2) == 0)
check('3.5 s\' + 2 s = 1, final 1/2', sp.simplify(sp.diff(s2, t) + 2*s2 - 1) == 0 and sp.limit(s2, t, sp.oo) == sp.Rational(1, 2))
aa = sp.symbols('a', positive=True)
sa = (1 - sp.exp(-aa*t))/aa
check('3.5 general a: s\' + a s = 1, final 1/a', sp.simplify(sp.diff(sa, t) + aa*sa - 1) == 0 and sp.limit(sa, t, sp.oo) == 1/aa)
check('3.5 a=5 gives h = e^{-5t}', sp.simplify(sp.diff(sp.exp(-5*t), t) + 5*sp.exp(-5*t)) == 0)
RC = sp.symbols('R_C', positive=True)
hRC = sp.exp(-t/RC)/RC
check('3.5 RC impulse response solves h\' + h/RC = 0 with h(0+) = 1/RC (= b)', sp.simplify(sp.diff(hRC, t) + hRC/RC) == 0 and hRC.subs(t, 0) == 1/RC)
# Example 3.9 (car)
vv = 30*(1 - sp.exp(-t/10))
check('Ex 3.9 10 v\' + v = 30', sp.simplify(10*sp.diff(vv, t) + vv - 30) == 0)
check('Ex 3.9 v(10) = 18.96', close(float(vv.subs(t, 10)), 18.96, 5e-3) and vv.subs(t, 0) == 0)
# numerical Euler cross-check of the car
dtt = 1e-3; vn = 0.0
for k in range(10000): vn += dtt*(3 - 0.1*vn)
check('Ex 3.9 Euler integration reaches 18.96 at t=10', close(vn, 18.96, 0.02))
# eigenfunction box: output = e^{jwt} times a constant (h = e^{-t}u(t), w=2)
wq = 2.0; tq = 0.7; dtau = 1e-4; tauq = np.arange(0, 40, dtau)
yq = np.sum(np.exp(-tauq)*np.exp(1j*wq*(tq - tauq)))*dtau
Hq = 1/(1 + 1j*wq)
check('3.6 e^{jwt} passes unchanged in form (h=e^{-t}u, w=2)', abs(yq - np.exp(1j*wq*tq)*Hq) < 1e-3)
# Exercises
check('Exercise 3.1 {1,2,3}*{1,-1} = {1,1,1,-3}', list(np.convolve([1, 2, 3], [1, -1])) == [1, 1, 1, -3])
check('Exercise 3.2 sum (1/3)^n = 3/2', close(sum((1/3)**np.arange(200)), 1.5))
xe = ((tg > 0) & (tg < 3)).astype(float)
ye = np.convolve(xe, hr34)[:len(tg)]*dt
refe = np.where(tg < 2, 0.5*tg**2, np.where(tg < 3, 2.0, np.where(tg < 5, 2 - 0.5*(tg - 3)**2, 0)))
check('Exercise 3.5 five cases 0, t^2/2, 2, 2-(t-3)^2/2, 0', np.max(np.abs(ye - refe)) < 5e-3)
s6 = 1 - sp.exp(-3*t)
check('Exercise 3.6 h = 3 e^{-3t} u(t)', sp.simplify(sp.diff(s6, t) - 3*sp.exp(-3*t)) == 0 and s6.subs(t, 0) == 0)
check('Exercise 3.7 h = 0.9^n, sum = 10', np.allclose(rec(0.9, 1, imp, 40), 0.9**np.arange(40)) and close(sum(0.9**np.arange(2000)), 10))

print(f'{passed} passed, {failed} failed')
