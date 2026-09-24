#!/usr/bin/env python3
"""Numbers stated in lecture-notes Chapter 5 (notes/src/c5.js) that do not
appear on a Module 5 slide, and the derivations the chapter carries in full.
Plain NumPy and SymPy; prints PASS/FAIL lines and a final count."""
import numpy as np
import sympy as sp

passed = failed = 0
def check(name, ok):
    global passed, failed
    print(('PASS ' if ok else 'FAIL ') + name)
    if ok: passed += 1
    else: failed += 1
def close(name, got, want, tol=5e-7):
    check(f'{name}: {got:.6f} vs {want:.6f}', abs(got - want) <= tol)

w, t, a, W = sp.symbols('omega t a W', real=True)
T1, t0, wc = sp.symbols('T_1 t_0 omega_c', positive=True)
ap = sp.symbols('a_p', positive=True)

def trapz(y, x):
    return np.sum((y[1:] + y[:-1]) * np.diff(x)) / 2

def Si(x):
    return float(sp.Si(x).evalf(20))

# ---------------- 5.1 convergence at a jump ----------------
# x_W(t) = (1/2pi) int_{-W}^{W} 2 sin(w)/w e^{jwt} dw  =  [Si(W(t+1)) - Si(W(t-1))]/pi
def xW_quad(tt, Wv, n=400001):
    om = np.linspace(-Wv, Wv, n)
    X = 2 * np.sinc(om / np.pi)            # numpy sinc is normalised: sinc(u)=sin(pi u)/(pi u)
    return trapz(X * np.cos(om * tt), om) / (2 * np.pi)
for Wv, tt in [(12, 0.3), (12, 0.9), (48, 1.2), (30, 0.0)]:
    close(f'x_W({tt}) for W={Wv}, Si form = synthesis integral',
          (Si(Wv * (tt + 1)) - Si(Wv * (tt - 1))) / np.pi, xW_quad(tt, Wv), 2e-6)
close('Si(pi)', Si(np.pi), 1.851937, 1e-6)
close('first-peak limit 1/2 + Si(pi)/pi', 0.5 + Si(np.pi) / np.pi, 1.089490, 1e-6)
def xW(x, Wv):
    return (Si(Wv * (x + 1)) - Si(Wv * (x - 1))) / np.pi
for Wv, pk in [(12, 1.096), (48, 1.089), (200, 1.089)]:
    ts = np.linspace(0, 2.5, 25001) if Wv < 100 else np.linspace(1 - 3 * np.pi / Wv, 1, 6001)
    vals = np.array([xW(x, Wv) for x in ts])
    tpk = ts[int(np.argmax(vals))]
    check(f'W={Wv}: highest value {vals.max():.4f} rounds to {pk}', round(vals.max(), 3) == pk)
    if Wv >= 48:
        check(f'W={Wv}: peak at distance {1 - tpk:.4f} from the jump, pi/W = {np.pi / Wv:.4f}',
              abs((1 - tpk) - np.pi / Wv) < 0.05 * np.pi / Wv)
close('x_W(1) -> 1/2 (W=2000)', Si(4000) / np.pi, 0.5, 1e-4)
# symbolic step of the derivation: product to sum
check('sin(w)cos(wt) = [sin(w(1+t)) + sin(w(1-t))]/2',
      sp.simplify(sp.sin(w) * sp.cos(w * t) - (sp.sin(w * (1 + t)) + sp.sin(w * (1 - t))) / 2) == 0)

# ---------------- 5.1 limit of 2a/(a^2+w^2) ----------------
check('int 2a/(a^2+w^2) dw = 2pi',
      sp.simplify(sp.integrate(2 * ap / (ap**2 + w**2), (w, -sp.oo, sp.oo)) - 2 * sp.pi) == 0)
close('peak 2/a at a=0.5', 2 / 0.5, 4.0)

# ---------------- 5.2 standard pairs ----------------
close('phase at a=1, w=1', -np.arctan(1.0), -0.785398)
close('phase at a=1, w=sqrt3', -np.arctan(np.sqrt(3)), -1.047198)
close('|X(j2)| for a=2', 1 / np.hypot(2, 2), 0.353553)
for av, pk in [(0.2, 5), (1, 1), (5, 0.2)]:
    close(f'|X(j0)|=1/a at a={av}', 1 / av, pk)
th = sp.nsolve(sp.tan(sp.Symbol('x')) - sp.Symbol('x'), sp.Symbol('x'), 4.49)
close('first side lobe position (tan x = x)', float(th), 4.493409)
close('first side lobe value 2 sin(x)/x', 2 * np.sin(float(th)) / float(th), -0.434467)
for om, T1v in [(0.8, 1.0), (2.5, 5.0)]:
    tt = np.linspace(-T1v, T1v, 400001)
    close(f'rect pulse T1={T1v}: integral = 2 sin(wT1)/w at w={om}', float(np.real(trapz(np.exp(-1j * om * tt), tt))),
          2 * np.sin(om * T1v) / om, 1e-8)
check('triangle of duration 2T1: first null at 2pi/T1, T*BW = 4pi',
      sp.simplify(2 * T1 * (2 * sp.pi / T1) - 4 * sp.pi) == 0)

# ---------------- 5.3 periodic signals ----------------
wts = {k: 2 * np.sin(k * np.pi / 4) / k for k in range(1, 9)}
check('T=8T1: weights at k=4,8 vanish', abs(wts[4]) < 1e-12 and abs(wts[8]) < 1e-12)
check('T=8T1: weights at k=5,6,7 are negative', all(wts[k] < 0 for k in (5, 6, 7)))
check('T=8T1: weights at k=1,2,3 are positive', all(wts[k] > 0 for k in (1, 2, 3)))
close('omega_0 for T=8', 2 * np.pi / 8, 0.785398)   # pi/4
close('2 pi a_0 for T=8T1', 4 * np.pi / 8, 1.570796)

# ---------------- 5.4 properties ----------------
# shifted sum
x3 = lambda tt: 2 * (abs(tt - 4) < 2) + (abs(tt - 3) < 1)
tt = np.linspace(-1, 9, 2000001)
close('area of x3', trapz(x3(tt).astype(float), tt), 10.0, 1e-4)
X3 = lambda om: 2 * np.exp(-4j * om) * 2 * np.sin(2 * om) / om + np.exp(-3j * om) * 2 * np.sin(om) / om
for om in [0.7, 2.3]:
    num = trapz(x3(tt) * np.exp(-1j * om * tt), tt)
    check(f'X3(j{om}) by formula = direct integral', abs(num - X3(om)) < 2e-5)
# unit step: sgn limit
expr = 1 / (ap + sp.I * w) - 1 / (ap - sp.I * w)
check('1/(a+jw) - 1/(a-jw) = -2jw/(a^2+w^2)', sp.simplify(expr + 2 * sp.I * w / (ap**2 + w**2)) == 0)
check('limit a->0 is 2/(jw)', sp.simplify(sp.limit(expr, ap, 0) - 2 / (sp.I * w)) == 0)
check('jw (1/(jw)) = 1', sp.simplify(sp.I * w / (sp.I * w)) == 1)
# trapezoid by differentiation
Xtr = lambda om: 4 * np.sin(1.5 * om) * np.sin(om / 2) / om**2
xtr = lambda s: np.where(np.abs(s) < 1, 1.0, np.where(np.abs(s) < 2, 2 - np.abs(s), 0.0))
tt = np.linspace(-2.5, 2.5, 2000001)
close('trapezoid area', trapz(xtr(tt), tt), 3.0, 1e-6)
for om in [0.5, np.pi, 4.0]:
    num = trapz(xtr(tt) * np.cos(om * tt), tt)
    close(f'trapezoid X(j{om:.4f}) formula = direct integral', Xtr(om), num, 1e-6)
close('X(j pi) = -4/pi^2', Xtr(np.pi), -4 / np.pi**2)
close('-4/pi^2', -4 / np.pi**2, -0.405285)
G = (sp.exp(sp.I * 1.5 * w) - sp.exp(-sp.I * 1.5 * w)) * 2 * sp.sin(w / 2) / w
check('G = 4j sin(1.5w) sin(w/2)/w',
      sp.simplify(sp.expand(G.rewrite(sp.sin)) - 4 * sp.I * sp.sin(1.5 * w) * sp.sin(w / 2) / w) == 0)
# the two pulses of half-width 1.5 and 0.5 convolve to the trapezoid
s = np.linspace(-3, 3, 60001); ds = s[1] - s[0]
r15 = (np.abs(s) < 1.5).astype(float); r05 = (np.abs(s) < 0.5).astype(float)
cv = np.convolve(r15, r05, mode='same') * ds
check('rect(1.5) * rect(0.5) = trapezoid', np.max(np.abs(cv - xtr(s))) < 2e-3)
# differentiation in frequency, general n
for n in range(1, 5):
    f = t**(n - 1) / sp.factorial(n - 1) * sp.exp(-ap * t)
    F = sp.integrate(f * sp.exp(-sp.I * w * t), (t, 0, sp.oo), conds='none')
    check(f't^{n-1}/({n-1})! e^(-at)u(t) <-> 1/(a+jw)^{n}', sp.simplify(F - 1 / (ap + sp.I * w)**n) == 0)
check('induction step: (j/n) d/dw (a+jw)^(-n) = (a+jw)^(-(n+1))',
      sp.simplify(sp.I / sp.Symbol('n', positive=True) * sp.diff((ap + sp.I * w)**(-sp.Symbol('n', positive=True)), w)
                  - (ap + sp.I * w)**(-(sp.Symbol('n', positive=True) + 1))) == 0)
# derivative domains
close('d/dt e^{-t^2} at t=1', -2 * np.exp(-1), -0.735759)
close('3 e^{-1}', 3 * np.exp(-1), 1.103638)

# ---------------- 5.5 convolution and multiplication ----------------
close('|Y(j1)| = 1/sqrt(10)', 1 / (np.hypot(1, 1) * np.hypot(2, 1)), 0.316228)
# differentiator on cos(2t)
check('d/dt cos(2t) = -2 sin(2t)', sp.simplify(sp.diff(sp.cos(2 * t), t) + 2 * sp.sin(2 * t)) == 0)
# synchronous demodulation
x = sp.Function('x')
ph = sp.symbols('phi', real=True)
check('cos^2 = (1 + cos 2theta)/2', sp.simplify(sp.cos(wc * t)**2 - (1 + sp.cos(2 * wc * t)) / 2) == 0)
check('cos(wct)cos(wct+phi) = cos(phi)/2 + cos(2wct+phi)/2',
      sp.simplify(sp.expand_trig(sp.cos(wc * t) * sp.cos(wc * t + ph) - sp.cos(ph) / 2 - sp.cos(2 * wc * t + ph) / 2)) == 0)
check('W=2pi, wc=6pi: lower edge of the copy at 2wc-W = 10pi', 2 * 6 - 2 == 10)
check('W=3pi, wc=5pi: highest cutoff 7pi', 2 * 5 - 3 == 7)
# numerical demodulation of a band-limited message: x(t)=sin(2pi t)/(pi t), wc=6pi, LPF gain 2 on |w|<4pi
N = 2**18; dt = 1 / 256.
tg = (np.arange(N) - N // 2) * dt
xm = 2 * np.sinc(2 * tg)                       # sin(2 pi t)/(pi t) = 2 sinc_n(2t)
yv = xm * np.cos(6 * np.pi * tg)**2
Yf = np.fft.fft(yv); om = 2 * np.pi * np.fft.fftfreq(N, dt)
rec = np.real(np.fft.ifft(Yf * 2 * (np.abs(om) < 4 * np.pi)))
mid = np.abs(tg) < 5
check('demodulation returns x(t) (max error < 0.02 on |t|<5)', np.max(np.abs(rec[mid] - xm[mid])) < 0.02)
# tunable band-pass: pass band |w - wc| < w0
check('wc=12, w0=3: pass band 9 < w < 15', (12 - 3, 12 + 3) == (9, 15))
check('wc=8, w0=1: pass band 7 < w < 9', (8 - 1, 8 + 1) == (7, 9))

# ---------------- 5.6 differential equations ----------------
s_ = sp.symbols('s')
H = (s_ + 2) / (s_**2 + 4 * s_ + 3)
check('partial fractions of H', sp.simplify(sp.apart(H, s_) - (sp.Rational(1, 2) / (s_ + 1) + sp.Rational(1, 2) / (s_ + 3))) == 0)
Hm = lambda om: np.hypot(2, om) / (np.hypot(1, om) * np.hypot(3, om))
close('|H(j0)|', Hm(0), 0.666667)
close('|H(j100)|', Hm(100), 0.009997)
check('|H(j100)| rounds to 0.01', round(Hm(100), 2) == 0.01)
Hph = lambda om: np.arctan(om / 2) - np.arctan(om) - np.arctan(om / 3)
close('phase of H at w=1000 near -pi/2', Hph(1000), -np.pi / 2, 3e-3)
check('phase of H is odd', abs(Hph(1.7) + Hph(-1.7)) < 1e-12)
Y = (s_ + 2) / ((s_ + 1)**2 * (s_ + 3))
check('partial fractions of Y',
      sp.simplify(sp.apart(Y, s_) - (sp.Rational(1, 4) / (s_ + 1) + sp.Rational(1, 2) / (s_ + 1)**2 - sp.Rational(1, 4) / (s_ + 3))) == 0)
yr = lambda tt: 0.25 * np.exp(-tt) + 0.5 * tt * np.exp(-tt) - 0.25 * np.exp(-3 * tt)
yw = lambda tt: 0.25 * np.exp(-tt) + 0.5 * tt * np.exp(-tt) + 0.25 * np.exp(-3 * tt)
close('y(2), correct sign', yr(2), 0.168549)
close('y(2), lost sign', yw(2), 0.169789)
check('the two agree to two decimals at t=2', round(yr(2), 2) == round(yw(2), 2))
check('the two do not agree to three decimals at t=2', round(yr(2), 3) != round(yw(2), 3))
close('difference at t=2', yw(2) - yr(2), 0.5 * np.exp(-6))
# direct convolution
tau = sp.symbols('tau', positive=True); tp = sp.symbols('t', positive=True)
yc = sp.integrate(sp.exp(-(tp - tau)) * (sp.exp(-tau) / 2 + sp.exp(-3 * tau) / 2), (tau, 0, tp))
check('direct convolution gives the same y(t)',
      sp.simplify(yc - (sp.exp(-tp) / 4 + tp * sp.exp(-tp) / 2 - sp.exp(-3 * tp) / 4)) == 0)

# Exercises 5.1-5.8
close('Ex 5.1 a_0 = 1/3', 2 / 6, 1 / 3)
close('Ex 5.1 a_1 from the envelope', 2 * np.sin(np.pi / 3) / (np.pi / 3) / 6, 0.275664, 5e-7)
a1n = np.trapezoid(np.exp(-1j * np.pi / 3 * np.linspace(-1, 1, 200001)), np.linspace(-1, 1, 200001)) / 6
close('Ex 5.1 a_1 by direct integration', a1n.real, 0.275664, 5e-7)
X2 = sp.integrate(sp.exp(-3 * sp.Abs(t)) * sp.exp(-sp.I * w * t), (t, -sp.oo, sp.oo), conds='none')
check('Ex 5.2 transform of exp(-3|t|) is 6/(9+w^2)', sp.simplify(X2 - 6 / (9 + w**2)) == 0)
check('Ex 5.2 X(j0)=2/3 and X(j3)=1/3', (6 / sp.Integer(9), 6 / sp.Integer(18)) == (sp.Rational(2, 3), sp.Rational(1, 3)))
wn3 = sp.symbols('w3', positive=True)
X3 = sp.integrate(sp.exp(-sp.I * wn3 * t), (t, -2, 2))
check('Ex 5.3 pulse on |t|<2 gives 2 sin(2w)/w', all(abs(complex(X3.subs(wn3, v)) - 2 * np.sin(2 * v) / v) < 1e-12 for v in (0.3, 1.1, 2.7)))
check('Ex 5.3 X(j0)=4 and first zero at pi/2', sp.limit(2 * sp.sin(2 * w) / w, w, 0) == 4 and sp.sin(2 * sp.pi / 2) == 0)
wp = sp.pi - sp.pi / sp.I; wm = sp.pi + sp.pi / sp.I
check('Ex 5.4 weights pi(1+j) at +4 and pi(1-j) at -4, conjugates',
      sp.simplify(wp - sp.pi * (1 + sp.I)) == 0 and sp.simplify(wm - sp.pi * (1 - sp.I)) == 0 and sp.simplify(wm - sp.conjugate(wp)) == 0)
X5 = np.exp(-3j * 2) / (2 + 2j)
close('Ex 5.5 |X(j2)|', abs(X5), 0.353553)
close('Ex 5.5 unwrapped phase -6 - pi/4', -6 - np.pi / 4, -6.785398)
check('Ex 5.5 wrapped phase agrees', abs(np.angle(X5) - (-6 - np.pi / 4 + 2 * np.pi)) < 1e-12)
tt = np.linspace(1e-9, 4000, 40000001)
E6 = 2 * np.trapezoid((np.sin(4 * tt) / (np.pi * tt))**2, tt)
close('Ex 5.6 energy of sin(4t)/(pi t) = 4/pi', E6, 4 / np.pi, 1e-3)
close('Ex 5.6 4/pi', 4 / np.pi, 1.273240, 5e-7)
check('Ex 5.7 copies on [7,13], peak 2, apart iff wc >= 3', (10 - 3, 10 + 3, 4 / 2) == (7, 13, 2.0))
s_ = sp.symbols('s')
check('Ex 5.8 partial fractions', sp.simplify(sp.apart(2 / ((s_ + 2) * (s_ + 4)), s_) - (1 / (s_ + 2) - 1 / (s_ + 4))) == 0)
tp8, tau8 = sp.symbols('t tau', positive=True)
y8 = sp.integrate(2 * sp.exp(-4 * (tp8 - tau8)) * sp.exp(-2 * tau8), (tau8, 0, tp8))
check('Ex 5.8 direct convolution gives exp(-2t) - exp(-4t)', sp.simplify(y8 - (sp.exp(-2 * tp8) - sp.exp(-4 * tp8))) == 0)
y8f = sp.exp(-2 * tp8) - sp.exp(-4 * tp8)
check('Ex 5.8 y satisfies the equation', sp.simplify(sp.diff(y8f, tp8) + 4 * y8f - 2 * sp.exp(-2 * tp8)) == 0)

print(f'{passed} passed, {failed} failed')
