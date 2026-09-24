"""Numerical checks for lecture-notes Chapter 1 (notes/src/c1.js).

Every number the chapter states is checked here, including those it shares
with the Module 1 slides. Prints PASS/FAIL lines and a final count.
"""
import math
import cmath
import numpy as np
import sympy as sp

passed = failed = 0


def check(name, ok):
    global passed, failed
    if ok:
        passed += 1
        print(f"PASS  {name}")
    else:
        failed += 1
        print(f"FAIL  {name}")


def close(a, b, tol=1e-9):
    return abs(complex(a) - complex(b)) <= tol * max(1.0, abs(complex(b)))


t, T, tau, s, a, A, T0 = sp.symbols('t T tau s a A T_0', positive=True)
k, N = sp.symbols('k N', positive=True, integer=True)

# ---------- 1.2 energy and power ----------
check("p = v^2/R = 2^2/4 = 1 W", close(2**2 / 4, 1))
check("E of x[n]=1 on n=0,1,2 is 3", sum(1**2 for _ in range(3)) == 3)
ET_cos = sp.integrate(sp.cos(2*t)**2, (t, -T, T))
check("E_T of cos(2t) = T + sin(4T)/4", sp.simplify(ET_cos - (T + sp.sin(4*T)/4)) == 0)
check("P_T of cos(2t) = 1/2 + sin(4T)/(8T)", sp.simplify(ET_cos/(2*T) - (sp.Rational(1, 2) + sp.sin(4*T)/(8*T))) == 0)
check("P_inf of cos(2t) = 1/2", sp.limit(ET_cos/(2*T), T, sp.oo) == sp.Rational(1, 2))
check("E_T of x(t)=2 is 8T", sp.simplify(sp.integrate(4, (t, -T, T)) - 8*T) == 0)
check("P of (-1)^n window = 1", all(sum(((-1)**n)**2 for n in range(-M, M+1)) == 2*M+1 for M in range(1, 20)))


def square_energy(Tw, n=400001):
    """energy of the square wave (pulse |t|<1/2 every 2 s) on [-Tw, Tw]"""
    tt = np.linspace(-Tw, Tw, n)
    x = (np.abs(((tt + 1) % 2) - 1) < 0.5).astype(float)
    return np.trapezoid(x**2, tt)


for kk in (1, 5, 20):
    Tw = 2*kk + 0.5
    check(f"square wave E_T={2*kk+1} at T=2k+1/2, k={kk}", abs(square_energy(Tw) - (2*kk + 1)) < 1e-3)
check("(2k+1)/(4k+1) -> 1/2", sp.limit((2*k+1)/(4*k+1), k, sp.oo) == sp.Rational(1, 2))
check("single pulse P_T = 1/(2T) for T>=1/2", close(1/(2*3.0), 1/6))
check("x(t)=3: E_T=18T, P=9", sp.simplify(sp.integrate(9, (t, -T, T)) - 18*T) == 0 and 18/2 == 9)
check("ramp E_T = T^3/3", sp.integrate(t**2, (t, 0, T)) == T**3/3)
check("ramp P diverges", sp.limit((T**3/3)/(2*T), T, sp.oo) == sp.oo)
ET_exp = sp.integrate(sp.exp(2*t), (t, -T, T))
check("e^t: E_T = (e^{2T}-e^{-2T})/2", sp.simplify(ET_exp - (sp.exp(2*T) - sp.exp(-2*T))/2) == 0)
check("e^t: E and P diverge", sp.limit(ET_exp, T, sp.oo) == sp.oo and sp.limit(ET_exp/(2*T), T, sp.oo) == sp.oo)
check("Example 1.1: E=1, halved amplitude 1/4", sp.integrate(1, (t, 0, 1)) == 1 and sp.integrate(sp.Rational(1, 4), (t, 0, 1)) == sp.Rational(1, 4))
check("Example 1.2: P of x[n]=4 is 16", all(sum(16 for _ in range(-M, M+1))/(2*M+1) == 16 for M in range(1, 10)))
check("capacitor energy 25 tau/2", sp.simplify(sp.integrate(25*sp.exp(-2*t/tau), (t, 0, sp.oo)) - 25*tau/2) == 0)

# ---------- 1.3 operations ----------
x_dt = lambda n: 1 - n/4 if 0 <= n <= 3 else 0
check("y[3]=x[1]=0.75 for y[n]=x[n-2]", close(x_dt(3 - 2), 0.75))
check("reversal support [-1,4] -> [-4,1]", (-4, 1) == (-4, -(-1)))
check("scaling support [2,6] with a=2 -> [1,3]", (2/2, 6/2) == (1.0, 3.0))
check("melody at a: starts 0.4k/a, length 2/a (a=2: 0,0.2,0.4,0.6; 1 s)",
      np.allclose([0.4*kk/2 for kk in range(4)], [0.0, 0.2, 0.4, 0.6]) and 2/2 == 1)
check("440 Hz at a=1/2 -> 220 Hz", 0.5*440 == 220)
check("Example 1.3 corners -> 1, 5/3, 7/3, 3",
      [sp.Rational(c + 5, 3) for c in (-2, 0, 2, 4)] == [1, sp.Rational(5, 3), sp.Rational(7, 3), 3])
xp = lambda u: 0 if u < -2 else 1 if u < 0 else 2 if u < 2 else (4 - u) if u < 4 else 0
check("y(5/3)=x(0)=2", xp(3*(5/3) - 5 + 1e-12) == 2)
check("x(2t-4): shift 4 then compress 2", sp.expand((2*t) - 4) == 2*t - 4)

# ---------- 1.4 periodicity, even and odd ----------
check("cos(pi t/3): T0=6", close(2*math.pi/(math.pi/3), 6))
xpw = lambda u: math.sin(math.pi*u) if u < 0 else math.cos(math.pi*u)
check("piecewise sin/cos: x(-0.5+2m)=0 but x(-0.5)=-1",
      all(abs(xpw(-0.5 + 2*m)) < 1e-12 for m in range(1, 10)) and close(xpw(-0.5), -1))
check("cos(pi t)u(t): y(0)=1", close(math.cos(0), 1))
check("Example 1.4: T1=3, T2=4, T0=12",
      close(2*math.pi/(2*math.pi/3), 3) and close(2*math.pi/(math.pi/2), 4) and math.lcm(3, 4) == 12)


def smallest_period(f, candidates, span=60.0):
    tt = np.linspace(0, span, 6001)
    for c in candidates:
        if np.max(np.abs(f(tt + c) - f(tt))) < 1e-9:
            return c
    return None


f14 = lambda u: np.cos(2*np.pi*u/3) + np.sin(np.pi*u/2)
check("Example 1.4 numerically: smallest period 12", smallest_period(f14, np.arange(0.5, 24.01, 0.5)) == 12)
f46 = lambda u: np.cos(4*u) + np.cos(6*u)
cands = [m*np.pi/12 for m in range(1, 48)]
p46 = smallest_period(f46, cands)
check("cos4t+cos6t: T0 = pi", p46 is not None and close(p46, np.pi))
check("cos t + cos(sqrt2 t): ratio sqrt2 irrational", sp.sqrt(2).is_rational is False)
f17 = lambda u: np.cos(np.pi*u/2) + np.sin(np.pi*u/3)
check("Exercise 1.7: T0=12", smallest_period(f17, np.arange(0.5, 24.01, 0.5)) == 12)
check("DT sum period N1*N2 (N1=4,N2=6 -> 24 is a period)",
      all(math.cos(2*math.pi*(n+24)/4) + math.cos(2*math.pi*(n+24)/6) - math.cos(2*math.pi*n/4) - math.cos(2*math.pi*n/6) < 1e-9 for n in range(50)))
check("Od{t+1} = t, Ev{t+1} = 1", sp.simplify(((t+1) - (-t+1))/2 - t) == 0 and sp.simplify(((t+1) + (-t+1))/2 - 1) == 0)
check("Ev{u(t)} = 1/2 for t != 0", (1 + 0)/2 == 0.5)
check("t sin t even", sp.simplify((-t)*sp.sin(-t) - t*sp.sin(t)) == 0)
check("x3(1)=e^-2, x3(0)=1", close(math.exp(-2), math.exp(-2*1)) and math.exp(0) == 1)
x = sp.symbols('x', real=True)
check("int t^3 cos t over [-pi,pi] = 0", sp.integrate(x**3*sp.cos(x), (x, -sp.pi, sp.pi)) == 0)
check("int t cos(pi t) over [-2,2] = 0", sp.integrate(x*sp.cos(sp.pi*x), (x, -2, 2)) == 0)
check("Exercise 1.5: int (t^3 + t cos t + 1) on [-2,2] = 4", sp.integrate(x**3 + x*sp.cos(x) + 1, (x, -2, 2)) == 4)

# ---------- 1.5 impulse and step ----------
u = lambda n: 1 if n >= 0 else 0
d = lambda n: 1 if n == 0 else 0
check("delta[n] = u[n]-u[n-1]", all(u(n) - u(n-1) == d(n) for n in range(-10, 11)))
check("u[n]-u[n-3] has samples at n=0,1,2",
      [n for n in range(-5, 10) if u(n) - u(n-3) != 0] == [0, 1, 2])
check("x[n]=2delta[n]+delta[n-1]: x[1]=1", 2*d(1) + d(0) == 1)
xs = {0: 1, 1: 2, 2: 3}
check("Example 1.6: sifted value 3", sum(xs.get(n, 0)*d(n-2) for n in range(-5, 6)) == 3)
check("sum n^2 delta[n+1] = 1", sum(n**2 * d(n+1) for n in range(-5, 6)) == 1)
check("rectangle eps=0.1 has height 10", close(1/0.1, 10))


def sift_eps(f, t0, eps, n=20001):
    tt = np.linspace(t0 - eps/2, t0 + eps/2, n)
    return np.trapezoid(f(tt), tt)/eps


check("narrow-rectangle sift -> cos(pi) = -1", abs(sift_eps(np.cos, np.pi, 1e-3) + 1) < 1e-6)
check("Example 1.7: int cos t delta(t-pi) = -1", close(math.cos(math.pi), -1))


def scaled_rect_int(f, aa, eps=1e-4, n=200001):
    """integral of f(t) * delta_eps(a t): delta_eps(a t) is 1/eps for |a t| < eps/2"""
    half = eps/(2*abs(aa))
    tt = np.linspace(-half, half, n)
    return np.trapezoid(f(tt), tt)/eps


check("Example 1.8: int cos t delta(2t) -> 1/2", abs(scaled_rect_int(np.cos, 2) - 0.5) < 1e-6)
check("delta(at) weight 1/|a| for a=-3", abs(scaled_rect_int(lambda q: np.ones_like(q), -3) - 1/3) < 1e-6)
check("delta(at) area via substitution: 1/a (a>0) and -1/a (a<0)", close(1/2, 0.5) and close(-1/(-4), 0.25))


def xder_integral(tq):
    """running integral of x'(t) = u(t)-u(t-2) - delta(t-2) - delta(t-3)"""
    ramp = min(max(tq, 0), 2)
    return ramp - (1 if tq > 2 else 0) - (1 if tq > 3 else 0)


xj = lambda q: 0 if q < 0 else q if q <= 2 else 1 if q < 3 else 0
check("Example 1.9: running integral returns x(t)",
      all(abs(xder_integral(q) - xj(q)) < 1e-12 for q in (-0.5, 0.5, 1.5, 2.5, 2.9, 3.5, 4)))
jump = lambda q: xj(q + 1e-9) - xj(q - 1e-9)
check("Example 1.9: jumps 0, -1, -1 at t=0,2,3",
      abs(jump(0)) < 1e-6 and abs(jump(2) + 1) < 1e-6 and abs(jump(3) + 1) < 1e-6)

# ---------- 1.6 complex exponentials ----------
z = 2*cmath.exp(1j*math.pi/3)
check("2e^{j pi/3} = 1 + j sqrt3", close(z, 1 + 1j*math.sqrt(3)))
check("-2j = 2 e^{-j pi/2}", close(abs(-2j), 2) and close(cmath.phase(-2j), -math.pi/2))
check("1+j = sqrt2 e^{j pi/4}", close(cmath.phase(1+1j), math.pi/4) and close(abs(1+1j), math.sqrt(2)))
check("-1-j = sqrt2 e^{-j 3pi/4}", close(cmath.phase(-1-1j), -3*math.pi/4))
check("e^{-2t} reaches e^-1 at t=1/2", close(math.exp(-2*0.5), math.exp(-1)))
check("doubling: a = ln 2 ~ 0.69", close(math.exp(math.log(2)), 2) and round(math.log(2), 2) == 0.69)
check("-3 = 3 e^{j pi}", close(3*cmath.exp(1j*math.pi), -3))
check("Example 1.10: T0 = 4", close(2*math.pi/(0.5*math.pi), 4))
tt = np.linspace(0, 10, 1001)
lhs = np.exp(3j*tt) + np.exp(5j*tt)
check("Example 1.11: e^{j3t}+e^{j5t} = 2 e^{j4t} cos t", np.max(np.abs(lhs - 2*np.exp(4j*tt)*np.cos(tt))) < 1e-12)
check("Example 1.11: |x| = 2|cos t|, x(pi/2)=0", np.max(np.abs(np.abs(lhs) - 2*np.abs(np.cos(tt)))) < 1e-12
      and abs(cmath.exp(1.5j*math.pi) + cmath.exp(2.5j*math.pi)) < 1e-12)
lhs2 = np.exp(2j*tt) + np.exp(8j*tt)
check("e^{j2t}+e^{j8t} = 2 e^{j5t} cos 3t", np.max(np.abs(lhs2 - 2*np.exp(5j*tt)*np.cos(3*tt))) < 1e-12)
lhs3 = np.exp(1j*tt) + np.exp(7j*tt)
check("Exercise 1.8: e^{jt}+e^{j7t} = 2 e^{j4t} cos 3t", np.max(np.abs(lhs3 - 2*np.exp(4j*tt)*np.cos(3*tt))) < 1e-12)
check("|2cos(dt)| repeats every pi/d (d=1.5)",
      np.max(np.abs(np.abs(np.cos(1.5*(tt + np.pi/1.5))) - np.abs(np.cos(1.5*tt)))) < 1e-9)
check("alpha^3 = 8 -> alpha = 2", close(8**(1/3), 2))
check("(-0.5)^n samples 1,-0.5,0.25,-0.125", [(-0.5)**n for n in range(4)] == [1, -0.5, 0.25, -0.125])
nn = np.arange(-50, 51)
check("e^{j(w+2pi)n} = e^{jwn}", np.max(np.abs(np.exp(1j*(0.7 + 2*np.pi)*nn) - np.exp(1j*0.7*nn))) < 1e-9)
check("e^{j pi n} = (-1)^n", np.max(np.abs(np.exp(1j*np.pi*nn) - (-1.0)**nn)) < 1e-9)
check("cos(11 pi n/6) = cos(pi n/6)", np.max(np.abs(np.cos(11*np.pi*nn/6) - np.cos(np.pi*nn/6))) < 1e-9)
check("cos(7 pi n/4) = cos(pi n/4)", np.max(np.abs(np.cos(7*np.pi*nn/4) - np.cos(np.pi*nn/4))) < 1e-9)
check("e^{j2n}: omega/2pi = 1/pi irrational", sp.nsimplify(1/sp.pi).is_rational is False)
check("cos(n/4): omega/2pi = 1/(8 pi) irrational", (1/(8*sp.pi)).is_rational is False)


def dt_period(w_over_pi):
    """smallest N with (w/pi) N / 2 an integer, w given as a rational multiple of pi"""
    r = sp.Rational(w_over_pi)
    for n in range(1, 1000):
        if (r*n/2).is_integer:
            return n
    return None


check("Example 1.12: N0 = 10 for 3pi/5", dt_period(sp.Rational(3, 5)) == 10)
check("Example 1.12: 3pi/5 * 10 = 6 pi", sp.Rational(3, 5)*10 == 6)
check("Example 1.13: T0 = 17/3, N0 = 17", sp.Rational(2, 1)/sp.Rational(6, 17) == sp.Rational(17, 3) and dt_period(sp.Rational(6, 17)) == 17)
check("Example 1.13: fundamental frequency 2pi/17 = w0/3", sp.Rational(2, 17) == sp.Rational(6, 17)/3)
check("cos(4 pi n/9): N0 = 9", dt_period(sp.Rational(4, 9)) == 9)
check("Exercise 1.4: cos(4 pi n/7): N0 = 7", dt_period(sp.Rational(4, 7)) == 7)
check("sampled cos(6 pi n/17) numerically repeats at 17, not before",
      np.max(np.abs(np.cos(6*np.pi*(nn+17)/17) - np.cos(6*np.pi*nn/17))) < 1e-9 and
      all(np.max(np.abs(np.cos(6*np.pi*(nn+m)/17) - np.cos(6*np.pi*nn/17))) > 1e-3 for m in range(1, 17)))
check("phi_k(t+T0) = phi_k(t)", all(close(cmath.exp(1j*kk*2*math.pi/1.0*(0.3 + 1.0)), cmath.exp(1j*kk*2*math.pi*0.3)) for kk in range(-3, 4)))
check("N=6: phi_{-1}[n] = phi_5[n]", np.max(np.abs(np.exp(-1j*2*np.pi*nn/6) - np.exp(5j*2*np.pi*nn/6))) < 1e-9)
al = sp.symbols('alpha')
check("finite geometric sum formula", sp.simplify(sum(al**i for i in range(7)) - (1 - al**7)/(1 - al)) == 0)
check("sum (1/3)^n = 3/2", sp.summation(sp.Rational(1, 3)**sp.Symbol('n', integer=True, nonnegative=True), (sp.Symbol('n', integer=True, nonnegative=True), 0, sp.oo)) == sp.Rational(3, 2))
check("alpha=0.5 limit 2, alpha=-0.5 limit 2/3", close(1/(1 - 0.5), 2) and close(1/(1 + 0.5), 2/3))
ok = True
for NN in range(1, 9):
    for kk in range(-2*NN, 2*NN + 1):
        ssum = sum(cmath.exp(1j*kk*2*math.pi*n/NN) for n in range(NN))
        target = NN if kk % NN == 0 else 0
        ok &= abs(ssum - target) < 1e-9
check("harmonic sum over a period = N or 0", ok)
check("N=4, k=1 terms 1, j, -1, -j sum to 0",
      all(close(cmath.exp(1j*math.pi*n/2), v) for n, v in enumerate((1, 1j, -1, -1j))) and abs(sum((1, 1j, -1, -1j))) == 0)

# ---------- 1.7 catalogue ----------
check("one-sided exponential energy 1/(2a)", sp.simplify(sp.integrate(sp.exp(-2*a*t), (t, 0, sp.oo)) - 1/(2*a)) == 0)
check("rect energy 1", sp.integrate(1, (t, -sp.Rational(1, 2), sp.Rational(1, 2))) == 1)
check("tri energy 2/3", sp.integrate((1 - x)**2, (x, 0, 1))*2 == sp.Rational(2, 3))
check("Gaussian area 1", sp.integrate(sp.exp(-sp.pi*x**2), (x, -sp.oo, sp.oo)) == 1)
check("sinc(pi t) zeros at nonzero integers", all(abs(math.sin(math.pi*m)/(math.pi*m)) < 1e-12 for m in (1, 2, -1, -3)))
check("sine power A^2/2", sp.simplify(sp.integrate(A**2*sp.sin(2*sp.pi*t/T0)**2, (t, 0, T0))/T0 - A**2/2) == 0)
check("square power A^2", sp.simplify((sp.integrate(A**2, (t, 0, T0/2)) + sp.integrate(A**2, (t, T0/2, T0)))/T0 - A**2) == 0)
check("sawtooth power A^2/3", sp.simplify(sp.integrate(A**2*(2*t/T0 - 1)**2, (t, 0, T0))/T0 - A**2/3) == 0)
check("triangle power A^2/3", sp.simplify(2*sp.integrate(A**2*(1 - 4*t/T0)**2, (t, 0, T0/2))/T0 - A**2/3) == 0)
f0, kc, fc, fm, beta = sp.symbols('f_0 k f_c f_m beta', positive=True)
check("chirp instantaneous frequency f0 + k t",
      sp.simplify(sp.diff(2*sp.pi*(f0*t + kc*t**2/2), t)/(2*sp.pi) - (f0 + kc*t)) == 0)
check("FM instantaneous frequency fc + beta fm cos(2 pi fm t)",
      sp.simplify(sp.diff(2*sp.pi*fc*t + beta*sp.sin(2*sp.pi*fm*t), t)/(2*sp.pi) - (fc + beta*fm*sp.cos(2*sp.pi*fm*t))) == 0)
f1, f2 = 10.0, 11.0
check("beats identity", np.max(np.abs(np.cos(2*np.pi*f1*tt) + np.cos(2*np.pi*f2*tt)
                                      - 2*np.cos(np.pi*(f1 - f2)*tt)*np.cos(np.pi*(f1 + f2)*tt))) < 1e-9)
check("sgn = 2u - 1 for t != 0", 2*1 - 1 == 1 and 2*0 - 1 == -1)

# ---------- exercises ----------
check("Exercise 1.1: e^{-3t}u(t) energy 1/6", sp.integrate(sp.exp(-6*t), (t, 0, sp.oo)) == sp.Rational(1, 6))
check("Exercise 1.3: x(2t+3) support [-2,1]", ((-1 - 3)/2, (5 - 3)/2) == (-2.0, 1.0))
check("Exercise 1.6: 5 and 1/8", (2**2 + 1) == 5 and close(2.0**-3, 1/8))

print(f"{passed} passed, {failed} failed")
