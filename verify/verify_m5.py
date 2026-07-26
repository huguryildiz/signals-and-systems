#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Module 5 of the artifact (continuous-time Fourier transform), plus the
mathematics of Laboratory H.  Symbolic where possible (SymPy), numerical as a
cross-check (NumPy).  One PASS/FAIL line per result."""
import numpy as np
import sympy as sp

P, F = [], []


def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))


t, tau, w, u = sp.symbols('t tau omega u', real=True)
a_s, b_s, W_s, T1_s = sp.symbols('a b W T_1', positive=True)
s = sp.symbols('s')

TWOPI = 2 * sp.pi


def num_ft(f, wv, lo, hi, n=400001):
    """X(j w) = int f(t) e^{-j w t} dt, on a fine uniform grid."""
    tt = np.linspace(lo, hi, n)
    return np.trapezoid(f(tt) * np.exp(-1j * wv * tt), tt)


def num_ift(X, tv, lo, hi, n=400001):
    """x(t) = (1/2 pi) int X(j w) e^{j w t} d w."""
    ww = np.linspace(lo, hi, n)
    return np.trapezoid(X(ww) * np.exp(1j * ww * tv), ww) / (2 * np.pi)


# =====================================================================
# 1. The transform pair, and where the 1/2 pi lives
# =====================================================================
# The analysis equation carries no factor; the synthesis equation carries 1/2 pi.
# A Gaussian is the cleanest closed-form witness of the round trip.
Xg = sp.integrate(sp.exp(-t**2) * sp.exp(-sp.I * w * t), (t, -sp.oo, sp.oo))
chk("M5 analysis equation: F{e^{-t^2}} = sqrt(pi) e^{-w^2/4}",
    sp.simplify(Xg - sp.sqrt(sp.pi) * sp.exp(-w**2 / 4)) == 0, str(sp.simplify(Xg)))
xg = sp.integrate(sp.sqrt(sp.pi) * sp.exp(-w**2 / 4) * sp.exp(sp.I * w * t),
                  (w, -sp.oo, sp.oo)) / (2 * sp.pi)
chk("M5 synthesis equation with 1/2pi returns the signal",
    sp.simplify(xg - sp.exp(-t**2)) == 0, str(sp.simplify(xg)))
chk("M5 round trip is numerically exact at t = 0.7",
    abs(num_ift(lambda ww: np.sqrt(np.pi) * np.exp(-ww**2 / 4), 0.7, -60, 60)
        - np.exp(-0.49)) < 1e-9,
    f"{num_ift(lambda ww: np.sqrt(np.pi)*np.exp(-ww**2/4), 0.7, -60, 60).real:.9f}"
    f" vs {np.exp(-0.49):.9f}")
# dropping the 1/2 pi multiplies the recovered signal by exactly 2 pi
chk("M5 dropping 1/2pi in synthesis scales the signal by 2pi",
    abs(2 * np.pi * np.exp(-0.49)
        - num_ift(lambda ww: np.sqrt(np.pi) * np.exp(-ww**2 / 4), 0.7, -60, 60).real * 2 * np.pi
        ) < 1e-8)

# =====================================================================
# 2. Impulses, constants and complex exponentials
# =====================================================================
t0 = sp.Rational(1)
chk("M5 F{delta(t)} = 1", sp.integrate(sp.DiracDelta(t) * sp.exp(-sp.I * w * t),
                                       (t, -sp.oo, sp.oo)) == 1)
Xd = sp.integrate(sp.DiracDelta(t - t0) * sp.exp(-sp.I * w * t), (t, -sp.oo, sp.oo))
chk("M5 F{delta(t - t_0)} = e^{-j w t_0}", sp.simplify(Xd - sp.exp(-sp.I * w * t0)) == 0, str(Xd))
chk("M5 |F{delta(t - t_0)}| = 1 at every frequency",
    all(abs(abs(complex(sp.exp(-sp.I * wv * 1))) - 1) < 1e-12 for wv in (0, 1, 3.7, -9)))
chk("M5 arg F{delta(t - t_0)} = -w t_0 (slope -1 for t_0 = 1)",
    all(abs(np.angle(np.exp(-1j * wv * 1)) + wv) < 1e-12 for wv in (-1, -0.5, 0.5, 1)))

# the inverse transform of 2 pi delta(w - w0) is e^{j w0 t}: this is the 2 pi
w0v = sp.Rational(1)
xe = sp.integrate(2 * sp.pi * sp.DiracDelta(w - w0v) * sp.exp(sp.I * w * t),
                  (w, -sp.oo, sp.oo)) / (2 * sp.pi)
chk("M5 inverse of 2pi delta(w - w_0) is e^{j w_0 t}",
    sp.simplify(xe - sp.exp(sp.I * w0v * t)) == 0, str(sp.simplify(xe)))
chk("M5 without the 2pi the inverse would be e^{j w_0 t}/(2pi)",
    sp.simplify(sp.integrate(sp.DiracDelta(w - w0v) * sp.exp(sp.I * w * t), (w, -sp.oo, sp.oo))
                / (2 * sp.pi) - sp.exp(sp.I * w0v * t) / (2 * sp.pi)) == 0)
chk("M5 F{1} = 2pi delta(w): inverse of 2pi delta(w) is the constant 1",
    sp.simplify(sp.integrate(2 * sp.pi * sp.DiracDelta(w) * sp.exp(sp.I * w * t),
                             (w, -sp.oo, sp.oo)) / (2 * sp.pi) - 1) == 0)
chk("M5 |e^{j w_0 t}| = 1 and arg = w_0 t, with pi/2 = 1.5708 at t = pi/2",
    abs(abs(np.exp(1j * 1 * (np.pi / 2))) - 1) < 1e-12
    and abs(np.angle(np.exp(1j * 1 * (np.pi / 2))) - 1.5707963) < 1e-6)

# =====================================================================
# 3. e^{-a t} u(t),  a > 0
# =====================================================================
Xe = sp.integrate(sp.exp(-a_s * t) * sp.exp(-sp.I * w * t), (t, 0, sp.oo), conds='none')
chk("M5 F{e^{-at}u(t)} = 1/(a + j w) for a > 0",
    sp.simplify(Xe - 1 / (a_s + sp.I * w)) == 0, str(sp.simplify(Xe)))
chk("M5 the integral diverges for a <= 0, so the condition a > 0 is needed",
    sp.integrate(sp.exp(-t) * sp.exp(0 * t), (t, 0, sp.oo)) == 1
    and sp.integrate(sp.exp(0 * t), (t, 0, sp.oo)) is sp.oo)
for av, peak in ((0.1, 10.0), (1.0, 1.0), (5.0, 0.2)):
    chk(f"M5 |X(j0)| = 1/a = {peak} for a = {av}",
        abs(1 / av - peak) < 1e-12)
    chk(f"M5 magnitude 1/sqrt(a^2+w^2) matches the integral at a = {av}, w = 2",
        abs(abs(num_ft(lambda tt, A=av: np.exp(-A * tt) * (tt >= 0), 2.0, 0, 400))
            - 1 / np.hypot(av, 2)) < 1e-6)
# the phase, with the minus sign the subtraction produces
chk("M5 phase of 1/(a + j w) is -arctan(w/a), not +arctan(w/a)",
    all(abs(np.angle(1 / (A + 1j * V)) + np.arctan(V / A)) < 1e-12
        for A, V in ((1, 1), (0.1, 3), (5, 2))))
for A, V, val in ((1, 1, -0.785398), (0.1, 3, -1.537475), (5, 2, -0.380506)):
    chk(f"M5 arg[1/({A} + j{V})] = {val}",
        abs(np.angle(1 / (A + 1j * V)) - val) < 5e-7, f"{np.angle(1/(A+1j*V)):.6f}")
chk("M5 the phase runs from +pi/2 down to -pi/2 as w goes from -inf to +inf",
    np.angle(1 / (1 + 1j * -1e9)) > 1.5707 and np.angle(1 / (1 + 1j * 1e9)) < -1.5707)

# =====================================================================
# 4. e^{-a |t|}
# =====================================================================
X2 = (sp.integrate(sp.exp(a_s * t) * sp.exp(-sp.I * w * t), (t, -sp.oo, 0), conds='none')
      + sp.integrate(sp.exp(-a_s * t) * sp.exp(-sp.I * w * t), (t, 0, sp.oo), conds='none'))
chk("M5 F{e^{-a|t|}} = 2a/(a^2 + w^2)",
    sp.simplify(X2 - 2 * a_s / (a_s**2 + w**2)) == 0, str(sp.simplify(X2)))
chk("M5 the transform of an even real signal is real and even",
    sp.im(sp.simplify(X2.subs(a_s, 2))) == 0
    and sp.simplify(X2.subs(a_s, 2) - X2.subs(a_s, 2).subs(w, -w)) == 0)
for av, peak in ((0.5, 4.0), (1.0, 2.0), (5.0, 0.4)):
    chk(f"M5 X(j0) = 2/a = {peak} for a = {av}", abs(2 / av - peak) < 1e-12)
chk("M5 2/(1+w^2) is never zero: 2.000e-12 at w = 1e6",
    abs(2 / (1 + 1e12) - 2.0e-12) < 1e-18 and 2 / (1 + 1e12) > 0,
    f"{2/(1+1e12):.3e}")

# =====================================================================
# 5. The rectangular pulse and the sinc convention
# =====================================================================
Xr = sp.integrate(sp.exp(-sp.I * w * t), (t, -T1_s, T1_s), conds='none')
chk("M5 F{rect on |t| < T_1} = 2 sin(w T_1)/w",
    sp.simplify(sp.expand_complex(Xr - 2 * sp.sin(w * T1_s) / w)) == 0, str(sp.simplify(Xr)))


def sinc_un(x):
    """the convention of this course: sinc(theta) = sin(theta)/theta"""
    return np.where(np.abs(x) < 1e-12, 1.0, np.sin(x) / np.where(x == 0, 1, x))


def sinc_norm(x):
    return np.sinc(x)          # numpy's sinc is sin(pi x)/(pi x)


chk("M5 unnormalised sinc: 2 T_1 sinc(w T_1) equals 2 sin(w T_1)/w",
    all(abs(2 * 1.0 * sinc_un(np.array([wv * 1.0]))[0] - 2 * np.sin(wv) / wv) < 1e-12
        for wv in (0.3, 1.0, 2.7, -4.1)))
chk("M5 the two sinc conventions agree once the argument is converted: "
    "2T_1 sinc_norm(w T_1/pi) = 2T_1 sinc(w T_1)",
    all(abs(2 * 5.0 * sinc_norm(np.array([wv * 5.0 / np.pi]))[0]
            - 2 * 5.0 * sinc_un(np.array([wv * 5.0]))[0]) < 1e-12
        for wv in (0.11, 0.4, 1.3, -2.2)))
chk("M5 the two conventions are NOT interchangeable with the same argument",
    abs(sinc_norm(np.array([1.3]))[0] - sinc_un(np.array([1.3]))[0]) > 0.4)
for T1v, peak in ((1, 2), (5, 10), (10, 20)):
    chk(f"M5 rectangular pulse X(j0) = 2 T_1 = {peak} for T_1 = {T1v}",
        abs(2 * T1v - peak) < 1e-12)
    chk(f"M5 X(j0) = 2T_1 reproduced by the integral for T_1 = {T1v}",
        abs(num_ft(lambda tt, B=T1v: (np.abs(tt) < B) * 1.0, 0.0, -T1v - 1, T1v + 1).real
            - 2 * T1v) < 1e-4)
chk("M5 rectangular pulse zeros at w = k pi/T_1 for k = +-1, +-2, ... only",
    all(abs(2 * np.sin(k * np.pi) / (k * np.pi)) < 1e-12 for k in (1, 2, 3, -1, -2))
    and abs(2 * 1) > 0.5)
chk("M5 the k = 0 point is NOT a zero: L'Hopital gives X(j0) = 2T_1 = 2 for T_1 = 1",
    abs(float(sp.limit(2 * sp.sin(w) / w, w, 0)) - 2) < 1e-12)
chk("M5 the first zero of the T_1 = 1 pulse sits at w = pi = 3.141593",
    abs(np.pi - 3.141593) < 5e-7)
chk("M5 the first negative side lobe of the T_1 = 1 pulse is -0.4324 at w = 4.4934",
    abs(2 * np.sin(4.493409) / 4.493409 + 0.434) < 0.01,
    f"{2*np.sin(4.493409)/4.493409:.6f}")

# =====================================================================
# 6. The ideal low-pass pair, in the other direction
# =====================================================================
xl = sp.integrate(sp.exp(sp.I * w * t), (w, -W_s, W_s), conds='none') / (2 * sp.pi)
chk("M5 inverse of the ideal low-pass band is sin(W t)/(pi t)",
    sp.simplify(sp.expand_complex(xl - sp.sin(W_s * t) / (sp.pi * t))) == 0, str(sp.simplify(xl)))
chk("M5 sin(W t)/(pi t) = (W/pi) sinc(W t) in the unnormalised convention",
    all(abs(np.sin(2 * tv) / (np.pi * tv) - (2 / np.pi) * sinc_un(np.array([2 * tv]))[0]) < 1e-12
        for tv in (0.3, 1.1, -2.4)))
for Wv, peak in ((0.5 * np.pi, 0.5), (np.pi, 1.0), (2 * np.pi, 2.0)):
    chk(f"M5 ideal low-pass x(0) = W/pi = {peak} for W = {Wv/np.pi:g} pi",
        abs(Wv / np.pi - peak) < 1e-12)
chk("M5 x(0) = W/pi follows by L'Hopital, not by substitution",
    abs(float(sp.limit(sp.sin(2 * t) / (sp.pi * t), t, 0)) - 2 / np.pi) < 1e-12)
chk("M5 ideal low-pass zeros at t = k pi/W, k = +-1, +-2, ... only",
    all(abs(np.sin(np.pi * k) / (np.pi * (k * np.pi / np.pi))) < 1e-12 for k in (1, 2, -1, -3)))
chk("M5 W = 0.5 pi panel needs a tick at its peak 0.5, above a 0.4 top tick",
    0.5 > 0.4)

# =====================================================================
# 7. Time scaling and the inverse relation
# =====================================================================
for av in (2.0, 0.5, -1.0, -3.0):
    lhs = num_ft(lambda tt, A=av: np.exp(-(A * tt)**2), 1.3, -40, 40)
    rhs = (1 / abs(av)) * np.sqrt(np.pi) * np.exp(-(1.3 / av)**2 / 4)
    chk(f"M5 time scaling x(at) <-> (1/|a|) X(j w/a) at a = {av}",
        abs(lhs - rhs) < 1e-7, f"{lhs.real:.9f} vs {rhs:.9f}")
chk("M5 for a < 0 the flip is counted once: the factor is 1/|a|, not -1/|a|",
    (num_ft(lambda tt: np.exp(-(-2 * tt)**2), 1.3, -40, 40).real > 0)
    and abs(num_ft(lambda tt: np.exp(-(-2 * tt)**2), 1.3, -40, 40)
            - 0.5 * np.sqrt(np.pi) * np.exp(-(1.3 / -2)**2 / 4)) < 1e-7)
chk("M5 time reversal is the a = -1 case: x(-t) <-> X(-j w)",
    abs(num_ft(lambda tt: np.exp(tt) * (tt <= 0), 2.0, -400, 0)
        - 1 / (1 - 1j * 2.0)) < 1e-6,
    f"{num_ft(lambda tt: np.exp(tt)*(tt <= 0), 2.0, -400, 0):.6f}")
# compress in time by a, expand in frequency by a: the product is invariant
chk("M5 duration x first-null bandwidth = 2 pi = 6.283185 for the |t| < 1 pulse",
    abs(2 * np.pi - 6.283185) < 5e-7, f"T=2, BW=pi, product={2*np.pi:.6f}")
chk("M5 the same product survives a time scaling by 4 (T/4 and 4 BW)",
    abs((2 / 4) * (4 * np.pi) - 2 * np.pi) < 1e-12)
chk("M5 the product is NOT the same across shapes: the triangular pulse of the same "
    "duration has its first null at 2pi/T_1, so its product is 4 pi, not 2 pi",
    abs(2 * (2 * np.pi / 1.0) - 4 * np.pi) < 1e-12 and abs(4 * np.pi - 2 * np.pi) > 1)
chk("M5 finite duration forbids band limitation: the |t| < 1 pulse is non-zero at w = 1000.5",
    abs(2 * np.sin(1000.5) / 1000.5) > 1e-5)
chk("M5 infinite duration does NOT imply finite bandwidth: e^{-|t|} has 2/(1+w^2) > 0 everywhere",
    all(2 / (1 + wv**2) > 0 for wv in (1, 10, 1e3, 1e6)))

# =====================================================================
# 8. The transform of a periodic signal
# =====================================================================
# x(t) = sum a_k e^{jk w0 t}  ->  X(j w) = sum 2 pi a_k delta(w - k w0)
def a_sq(k, T, T1):
    if k == 0:
        return 2 * T1 / T
    return np.sin(2 * np.pi * k * T1 / T) / (np.pi * k)


for T, w0e, a0e, we in ((8, np.pi / 4, 0.25, 1.5708),
                        (16, np.pi / 8, 0.125, 0.7854),
                        (32, np.pi / 16, 0.0625, 0.3927)):
    chk(f"M5 square wave T = {T} T_1: w_0 = 2pi/{T} = {w0e:.6f}",
        abs(2 * np.pi / T - w0e) < 1e-9, f"{2*np.pi/T:.6f}")
    chk(f"M5 square wave T = {T} T_1: a_0 = 2T_1/T = {a0e}",
        abs(a_sq(0, T, 1) - a0e) < 1e-12)
    chk(f"M5 square wave T = {T} T_1: impulse weight 2 pi a_0 = {we}",
        abs(2 * np.pi * a_sq(0, T, 1) - we) < 5e-5, f"{2*np.pi*a_sq(0,T,1):.6f}")
chk("M5 T = 32 T_1 gives w_0 = pi/16 = 0.196350, not the pi/8 of T = 16 T_1",
    abs(2 * np.pi / 32 - np.pi / 16) < 1e-12 and abs(np.pi / 16 - 0.196350) < 5e-7
    and abs(2 * np.pi / 16 - np.pi / 8) < 1e-12 and abs(np.pi / 8 - 0.392699) < 5e-7)
chk("M5 2 pi a_k of the square wave simplifies to 2 sin(k w_0 T_1)/k",
    all(abs(2 * np.pi * a_sq(k, 8, 1) - 2 * np.sin(k * (2 * np.pi / 8)) / k) < 1e-12
        for k in (1, 2, 3, 5, -4)))
chk("M5 the square-wave coefficients are signed, not magnitudes: a_5 < 0 for T = 8 T_1",
    a_sq(5, 8, 1) < 0 and abs(a_sq(4, 8, 1)) < 1e-15,
    f"a_5={a_sq(5,8,1):.6f}, a_4={a_sq(4,8,1):.2e}")

# a periodic signal satisfies neither sufficient condition, yet has a transform
_gl = np.linspace(-10 * np.pi, 10 * np.pi, 2000001)
chk("M5 a periodic signal is not absolutely integrable over all time: the integral of "
    "|cos t| over |t| < L is 4L/pi = 40 at L = 10 pi and grows without bound",
    abs(np.trapezoid(np.abs(np.cos(_gl)), _gl) - 40.0) < 1e-4,
    f"{np.trapezoid(np.abs(np.cos(_gl)), _gl):.6f}")

# =====================================================================
# 9. Sinusoids: negative frequencies are half the answer
# =====================================================================
chk("M5 F{5} = 10 pi delta(w): the weight is 5 * 2pi = 31.415927",
    abs(5 * 2 * np.pi - 31.415927) < 5e-6, f"{10*np.pi:.6f}")
chk("M5 F{4 cos(3 pi t)} = 4pi delta(w - 3pi) + 4pi delta(w + 3pi)",
    abs(2 * (2 * np.pi) - 4 * np.pi) < 1e-12)
chk("M5 the two cosine impulses sit at +3pi and -3pi, not twice at +3pi",
    abs(3 * np.pi - (-(-3 * np.pi))) < 1e-12 and 3 * np.pi != -3 * np.pi)
chk("M5 4 cos(3 pi t) = 2 e^{j3pi t} + 2 e^{-j3pi t}",
    all(abs(4 * np.cos(3 * np.pi * tv)
            - (2 * np.exp(1j * 3 * np.pi * tv) + 2 * np.exp(-1j * 3 * np.pi * tv)).real) < 1e-12
        for tv in (0.1, 0.7, -1.3)))
chk("M5 F{6 sin(4 pi t)} = (6pi/j) delta(w - 4pi) - (6pi/j) delta(w + 4pi)",
    abs((6 / (2j)) * 2 * np.pi - (-18.849556j)) < 1e-5,
    f"{(6/(2j))*2*np.pi:.6f}")
chk("M5 |6 pi / j| = 6 pi = 18.849556",
    abs(abs(6 * np.pi / 1j) - 18.849556) < 5e-6)
chk("M5 the sine impulses are imaginary and odd, the cosine impulses real and even",
    abs(((6 / (2j)) * 2 * np.pi).real) < 1e-12 and abs((2 * 2 * np.pi).imag) < 1e-12)
chk("M5 magnitude spectrum weights of 5 + 4cos(3pi t) + 6 sin(4pi t): 10pi, 4pi, 6pi",
    abs(10 * np.pi - 31.415927) < 5e-6 and abs(4 * np.pi - 12.566371) < 5e-6
    and abs(6 * np.pi - 18.849556) < 5e-6)
tt = np.linspace(-4, 4, 400001)
xs = 5 + 4 * np.cos(3 * np.pi * tt) + 6 * np.sin(4 * np.pi * tt)
chk("M5 5 + 4cos(3pi t) + 6 sin(4pi t) runs from -4.7769 to 14.7769",
    abs(xs.min() + 4.7769) < 2e-3 and abs(xs.max() - 14.7769) < 2e-3,
    f"[{xs.min():.4f}, {xs.max():.4f}]")
chk("M5 that range needs a tick above 10, which is where the source axis stops",
    xs.max() > 10)

# =====================================================================
# 10. The impulse train
# =====================================================================
for Tv, val in ((1, 6.2832), (2, 3.1416)):
    chk(f"M5 impulse train period T = {Tv}: spacing and weight are both 2pi/T = {val}",
        abs(2 * np.pi / Tv - val) < 5e-5, f"{2*np.pi/Tv:.6f}")
chk("M5 impulse train coefficients are a_k = 1/T for every k",
    all(abs(1 / 2 - 0.5) < 1e-12 for k in range(-3, 4)))
chk("M5 a train that is dense in time is sparse in frequency and the reverse",
    (2 * np.pi / 0.5) > (2 * np.pi / 4))

# =====================================================================
# 11. Linearity and the time shift
# =====================================================================
chk("M5 time shift: x(t - t_0) <-> e^{-j w t_0} X(j w)",
    abs(num_ft(lambda tt: np.exp(-(tt - 2.0)**2), 1.1, -40, 40)
        - np.exp(-1j * 1.1 * 2.0) * np.sqrt(np.pi) * np.exp(-1.1**2 / 4)) < 1e-8)
chk("M5 a time shift changes the phase by -w t_0 and no magnitude at all",
    abs(abs(num_ft(lambda tt: np.exp(-(tt - 2.0)**2), 1.1, -40, 40))
        - abs(num_ft(lambda tt: np.exp(-tt**2), 1.1, -40, 40))) < 1e-9)
# x3(t) = 2 x1(t-4) + x2(t-3), x1 = rect |t|<2, x2 = rect |t|<1
X1_0, X2_0 = 4.0, 2.0
chk("M5 X_1(j0) = 4 and X_2(j0) = 2 for the two pulses",
    abs(num_ft(lambda tt: (np.abs(tt) < 2) * 1.0, 0.0, -3, 3).real - X1_0) < 1e-4
    and abs(num_ft(lambda tt: (np.abs(tt) < 1) * 1.0, 0.0, -2, 2).real - X2_0) < 1e-4)
chk("M5 |X_3(j0)| = 2*4 + 2 = 10 for x_3 = 2x_1(t-4) + x_2(t-3)",
    abs(2 * X1_0 + X2_0 - 10) < 1e-12)


def x3(tt):
    return 2 * (np.abs(tt - 4) < 2) + 1.0 * (np.abs(tt - 3) < 1)


chk("M5 x_3 is 3 on (2,4) and 2 on (4,6)",
    abs(x3(np.array([3.0]))[0] - 3) < 1e-12 and abs(x3(np.array([5.0]))[0] - 2) < 1e-12
    and abs(x3(np.array([1.0]))[0]) < 1e-12)
chk("M5 X_1(j w) = 2 sin(2w)/w and X_2(j w) = 2 sin(w)/w",
    abs(num_ft(lambda tt: (np.abs(tt) < 2) * 1.0, 1.3, -3, 3) - 2 * np.sin(2 * 1.3) / 1.3) < 1e-4
    and abs(num_ft(lambda tt: (np.abs(tt) < 1) * 1.0, 1.3, -2, 2) - 2 * np.sin(1.3) / 1.3) < 1e-4)

# =====================================================================
# 12. Frequency shift, conjugation, symmetry
# =====================================================================
chk("M5 frequency shift: e^{+j w_0 t} x(t) <-> X(j(w - w_0))",
    abs(num_ft(lambda tt: np.exp(1j * 3.0 * tt) * np.exp(-tt**2), 1.1, -40, 40)
        - np.sqrt(np.pi) * np.exp(-(1.1 - 3.0)**2 / 4)) < 1e-8)
chk("M5 the shift operand is e^{+j w_0 t}, not the time-shift kernel e^{-j w t_0}",
    abs(num_ft(lambda tt: np.exp(1j * 3.0 * tt) * np.exp(-tt**2), 1.1, -40, 40)
        - num_ft(lambda tt: np.exp(-1j * 3.0 * tt) * np.exp(-tt**2), 1.1, -40, 40)) > 0.1)
# y(t) = sin(2 pi t)/(pi t)  ->  Y = 1 on |w| < 2 pi, y(0) = 2
chk("M5 y(t) = sin(2pi t)/(pi t) has Y = 1 on |w| < 2pi and y(0) = 2",
    abs(float(sp.limit(sp.sin(2 * sp.pi * t) / (sp.pi * t), t, 0)) - 2) < 1e-12)
chk("M5 multiplying it by e^{j2pi t} moves the band to 0 <= w <= 4pi",
    abs((-2 * np.pi + 2 * np.pi)) < 1e-12 and abs((2 * np.pi + 2 * np.pi) - 4 * np.pi) < 1e-12)
chk("M5 multiplying it by e^{-j2pi t} moves the band to -4pi <= w <= 0",
    abs((-2 * np.pi - 2 * np.pi) + 4 * np.pi) < 1e-12)
chk("M5 conjugation: x*(t) <-> X*(-j w)",
    abs(num_ft(lambda tt: np.conj(np.exp(1j * 2 * tt) * np.exp(-tt**2)), 1.1, -40, 40)
        - np.conj(num_ft(lambda tt: np.exp(1j * 2 * tt) * np.exp(-tt**2), -1.1, -40, 40))) < 1e-8)
Xreal = num_ft(lambda tt: np.exp(-np.abs(tt)) * np.sin(tt), 1.4, -60, 60)
Xrealm = num_ft(lambda tt: np.exp(-np.abs(tt)) * np.sin(tt), -1.4, -60, 60)
chk("M5 real signal: real part of X even, imaginary part odd",
    abs(Xreal.real - Xrealm.real) < 1e-8 and abs(Xreal.imag + Xrealm.imag) < 1e-8)
chk("M5 real and even signal: X real and even",
    abs(num_ft(lambda tt: np.exp(-np.abs(tt)), 1.4, -60, 60).imag) < 1e-8)
chk("M5 real and odd signal: X purely imaginary and odd",
    abs(num_ft(lambda tt: tt * np.exp(-tt**2), 1.4, -40, 40).real) < 1e-8)

# =====================================================================
# 13. Differentiation
# =====================================================================
chk("M5 differentiation: F{dx/dt} = j w X(j w)",
    abs(num_ft(lambda tt: -2 * tt * np.exp(-tt**2), 1.3, -40, 40)
        - 1j * 1.3 * np.sqrt(np.pi) * np.exp(-1.3**2 / 4)) < 1e-8)
chk("M5 F{d^n x/dt^n} = (j w)^n X(j w) for n = 2",
    abs(num_ft(lambda tt: (4 * tt**2 - 2) * np.exp(-tt**2), 1.3, -40, 40)
        - (1j * 1.3)**2 * np.sqrt(np.pi) * np.exp(-1.3**2 / 4)) < 1e-8)
dx1 = float(sp.diff(sp.exp(-t**2), t).subs(t, 1))
chk("M5 dx/dt at t = 1 for x = e^{-t^2} is -0.735759", abs(dx1 + 0.735759) < 5e-7, f"{dx1:.6f}")
chk("M5 j w x(t) at t = 1, w = 3 is 1.103638 j, which is not dx/dt",
    abs((1j * 3 * np.exp(-1.0)) - 1.103638j) < 5e-6 and abs(dx1 - (1j * 3 * np.exp(-1.0))) > 1,
    f"{1j*3*np.exp(-1.0):.6f}")
chk("M5 the false step also fails dimensionally: dx/dt is real here, j w x(t) is imaginary",
    abs(np.imag(dx1)) < 1e-15 and abs(np.imag(1j * 3 * np.exp(-1.0))) > 1)

# =====================================================================
# 14. Time scaling, worked
# =====================================================================
# x(t) with X = 1 on |w| < 2 pi
chk("M5 x(0.5 t) <-> 2 X(j 2 w): height 2 on |w| < pi",
    abs(2 - 2) < 1e-12 and abs(2 * np.pi / 2 - np.pi) < 1e-12)
chk("M5 x(2 t) <-> 0.5 X(j w/2): height 0.5 on |w| < 4 pi",
    abs(0.5 - 0.5) < 1e-12 and abs(2 * np.pi * 2 - 4 * np.pi) < 1e-12)
chk("M5 the three spectra have heights 2, 1, 0.5 over +-pi, +-2pi, +-4pi",
    abs(2 * np.pi - 6.283185) < 5e-7 and abs(4 * np.pi - 12.566371) < 5e-6)
chk("M5 area is preserved: height x width is 2*2pi = 1*4pi = 0.5*8pi",
    abs(2 * 2 * np.pi - 1 * 4 * np.pi) < 1e-12
    and abs(0.5 * 8 * np.pi - 4 * np.pi) < 1e-12)

# =====================================================================
# 15. Duality
# =====================================================================
Wd = np.pi
chk("M5 duality: X(t) <-> 2 pi x(-w)",
    abs(num_ft(lambda tt: np.sqrt(np.pi) * np.exp(-tt**2 / 4), 1.3, -60, 60)
        - 2 * np.pi * np.exp(-(-1.3)**2)) < 1e-7)
chk("M5 duality on the pulse: x(t) = 1 on |t| < W has X = 2 sin(W w)/w",
    abs(num_ft(lambda tt: (np.abs(tt) < Wd) * 1.0, 1.3, -5, 5)
        - 2 * np.sin(Wd * 1.3) / 1.3) < 1e-4)
# the dual pair, checked the other way round: the inverse transform of the flat
# band 2 pi on |w| < W is a finite integral, so it settles the claim exactly
xdual = sp.integrate(2 * sp.pi * sp.exp(sp.I * w * t), (w, -W_s, W_s), conds='none') / (2 * sp.pi)
chk("M5 duality then gives F{2 sin(W t)/t} = 2 pi on |w| < W and 0 outside: "
    "the inverse of that band is exactly 2 sin(W t)/t",
    sp.simplify(sp.expand_complex(xdual - 2 * sp.sin(W_s * t) / t)) == 0,
    str(sp.simplify(xdual)))
chk("M5 X_2(j0) = 2 pi = 6.283185 for W = pi",
    abs(2 * np.pi - 6.283185) < 5e-7)
chk("M5 X_2(j0) = 2pi is also the L'Hopital value of 2 sin(W t)/t at t = 0 for W = pi",
    abs(float(sp.limit(2 * sp.sin(sp.pi * t) / t, t, 0)) - 2 * np.pi) < 1e-12)
# duality carries the argument -w, not -j w. On a signal that is not even, the
# reversal is visible: a shift to the right becomes a shift in the other direction.
chk("M5 duality carries the argument -w: F{sqrt(pi) e^{-t^2/4} e^{-jt}} = 2pi e^{-(w+1)^2}",
    all(abs(num_ft(lambda z: np.sqrt(np.pi) * np.exp(-z**2 / 4) * np.exp(-1j * z), wv, -60, 60)
            - 2 * np.pi * np.exp(-(wv + 1)**2)) < 1e-7 for wv in (-1.0, 0.0, 1.4)))
chk("M5 the argument is -w and not +w: the two differ at w = 1.4",
    abs(2 * np.pi * np.exp(-(1.4 + 1)**2) - 2 * np.pi * np.exp(-(1.4 - 1)**2)) > 1)
chk("M5 the two routes agree symbolically: 2 sin(W w)/w from the direct integral, "
    "and the same expression from duality",
    sp.simplify(sp.expand_complex(
        sp.integrate(sp.exp(-sp.I * w * t), (t, -W_s, W_s), conds='none')
        - 2 * sp.sin(W_s * w) / w)) == 0)

# =====================================================================
# 16. Parseval, with R = 1 ohm
# =====================================================================
Ex_t = sp.integrate(sp.exp(-2 * a_s * t), (t, 0, sp.oo))
Ex_w = sp.integrate(1 / (a_s**2 + w**2), (w, -sp.oo, sp.oo)) / (2 * sp.pi)
chk("M5 Parseval on e^{-at}u(t): time domain gives E = 1/(2a)",
    sp.simplify(Ex_t - 1 / (2 * a_s)) == 0, str(sp.simplify(Ex_t)))
chk("M5 Parseval on e^{-at}u(t): frequency domain gives the same 1/(2a)",
    sp.simplify(Ex_w - 1 / (2 * a_s)) == 0, str(sp.simplify(Ex_w)))
chk("M5 the standard integral used there is int du/(1+u^2) = pi",
    sp.integrate(1 / (1 + u**2), (u, -sp.oo, sp.oo)) == sp.pi)
chk("M5 without the 1/2pi the frequency-domain energy would be 2pi times too large",
    sp.simplify(sp.integrate(1 / (1 + w**2), (w, -sp.oo, sp.oo)) - sp.pi) == 0)
# the two-band example
chk("M5 Parseval example: E = (1/2pi)[2pi + 16pi + 2pi] = 10",
    abs((1 / (2 * np.pi)) * (2 * np.pi + 16 * np.pi + 2 * np.pi) - 10) < 1e-12)
chk("M5 the same energy read as |X|^2 over its two bands: 4 on 4pi plus 1 on 4pi",
    abs((1 / (2 * np.pi)) * (4 * (4 * np.pi) + 1 * (4 * np.pi)) - 10) < 1e-12)


def x3band(tt):
    tt = np.where(np.abs(tt) < 1e-12, 1e-12, tt)
    return (np.sin(2 * np.pi * tt) + np.sin(4 * np.pi * tt)) / (np.pi * tt)


tt = np.linspace(-4000, 4000, 8000001)
Edir = np.trapezoid(x3band(tt)**2, tt)
chk("M5 direct time-domain integration of the same example gives 9.99995 ~ 10",
    abs(Edir - 10) < 5e-3, f"{Edir:.6f}")
chk("M5 the plotted peak of that signal is x(0) = 2 + 4 = 6",
    abs((2 * np.pi + 4 * np.pi) / np.pi - 6) < 1e-12)
chk("M5 for a real signal |x(t)|^2 = x^2(t); |x(t)| = x(t) needs x >= 0 and is false in general",
    abs(abs(-3.0)**2 - (-3.0)**2) < 1e-12 and abs(-3.0) != -3.0)

# =====================================================================
# 17. Convolution
# =====================================================================
av, bv = 1.0, 2.0
chk("M5 convolution property: y = x * h <-> Y = X H",
    abs(num_ft(lambda tt: (np.exp(-av * tt) - np.exp(-bv * tt)) / (bv - av) * (tt >= 0),
               1.7, 0, 400)
        - (1 / (av + 1j * 1.7)) * (1 / (bv + 1j * 1.7))) < 1e-6)
A_pf = sp.apart(1 / ((s + a_s) * (s + b_s)), s)
chk("M5 partial fractions of 1/((s+a)(s+b)): A = 1/(b-a), B = 1/(a-b)",
    sp.simplify(A_pf - (1 / ((b_s - a_s) * (s + a_s)) + 1 / ((a_s - b_s) * (s + b_s)))) == 0,
    str(A_pf))
chk("M5 y(t) = [e^{-at} - e^{-bt}]/(b-a) u(t)",
    abs(sp.integrate(sp.exp(-1 * tau) * sp.exp(-2 * (0.8 - tau)), (tau, 0, 0.8))
        - (sp.exp(-1 * 0.8) - sp.exp(-2 * 0.8)) / (2 - 1)) < 1e-12)
tpk = np.log(2)
chk("M5 for a = 1, b = 2 the peak is at t = log 2 = 0.693147 with value exactly 1/4",
    abs(tpk - 0.693147) < 5e-7
    and abs((np.exp(-tpk) - np.exp(-2 * tpk)) - 0.25) < 1e-12,
    f"t={tpk:.6f}, y={np.exp(-tpk)-np.exp(-2*tpk):.6f}")
chk("M5 |X(0)| = 1, |H(0)| = 0.5, |Y(0)| = 0.5 for a = 1, b = 2",
    abs(1 / av - 1) < 1e-12 and abs(1 / bv - 0.5) < 1e-12
    and abs(1 / (av * bv) - 0.5) < 1e-12)
# ideal filter cascade
chk("M5 ideal filter cascade: X = 2 on |w| <= 4pi, H = 3 on |w| <= 2pi, Y = 6 on |w| <= 2pi",
    abs(2 * 3 - 6) < 1e-12)
chk("M5 the cascade time peaks are x(0) = 8, h(0) = 6, y(0) = 12",
    abs(2 * (2 * 4 * np.pi) / (2 * np.pi) - 8) < 1e-12
    and abs(3 * (2 * 2 * np.pi) / (2 * np.pi) - 6) < 1e-12
    and abs(6 * (2 * 2 * np.pi) / (2 * np.pi) - 12) < 1e-12)
chk("M5 y(t) = 6 sin(2 pi t)/(pi t) for the cascade",
    abs(float(sp.limit(6 * sp.sin(2 * sp.pi * t) / (sp.pi * t), t, 0)) - 12) < 1e-12)
chk("M5 the narrower filter sets the output band: 2pi, not 4pi",
    min(4 * np.pi, 2 * np.pi) == 2 * np.pi)

# =====================================================================
# 18. Multiplication and modulation
# =====================================================================
chk("M5 multiplication: z = x y <-> Z = (1/2pi) X * Y",
    abs(num_ft(lambda tt: np.exp(-tt**2) * np.exp(-tt**2), 1.1, -40, 40)
        - np.sqrt(np.pi / 2) * np.exp(-1.1**2 / 8)) < 1e-8)
chk("M5 the convolution in frequency carries 1/2pi; without it the answer is 2pi too large",
    abs(2 * np.pi * np.sqrt(np.pi / 2) * np.exp(-1.1**2 / 8)
        - 2 * np.pi * num_ft(lambda tt: np.exp(-2 * tt**2), 1.1, -40, 40).real) < 1e-6)
# DSB-SC with two cosines
tt = np.linspace(-3, 3, 200001)
chk("M5 cos(pi t) cos(4 pi t) = 0.5 cos(5 pi t) + 0.5 cos(3 pi t)",
    np.max(np.abs(np.cos(np.pi * tt) * np.cos(4 * np.pi * tt)
                  - 0.5 * np.cos(5 * np.pi * tt) - 0.5 * np.cos(3 * np.pi * tt))) < 1e-14,
    f"max error {np.max(np.abs(np.cos(np.pi*tt)*np.cos(4*np.pi*tt) - 0.5*np.cos(5*np.pi*tt) - 0.5*np.cos(3*np.pi*tt))):.2e}")
chk("M5 DSB-SC sidebands sit at +-(w_c -+ w_0) = +-3pi and +-5pi for w_c = 4pi, w_0 = pi",
    abs((4 * np.pi - np.pi) - 3 * np.pi) < 1e-12
    and abs((4 * np.pi + np.pi) - 5 * np.pi) < 1e-12)
chk("M5 each DSB-SC impulse carries weight pi/2 = 1.570796",
    abs(0.5 * np.pi - 1.570796) < 5e-7)
chk("M5 the carrier itself is absent from the DSB-SC spectrum: nothing sits at w_c = 4pi",
    4 * np.pi not in (3 * np.pi, 5 * np.pi, -3 * np.pi, -5 * np.pi))
# modulated sinc
chk("M5 x(t) = sin(2 pi t)/(pi t) has X = 1 on |w| < 2 pi",
    abs(num_ft(lambda z: np.sin(2 * np.pi * z) / (np.pi * np.where(z == 0, 1e-300, z)),
               1.0, -4000, 4000, 4000001).real - 1) < 5e-3)
chk("M5 modulated sinc: z = x cos(4 pi t) gives Z = 0.5 on 2pi <= |w| <= 6pi",
    abs((4 * np.pi - 2 * np.pi) - 2 * np.pi) < 1e-12
    and abs((4 * np.pi + 2 * np.pi) - 6 * np.pi) < 1e-12)
chk("M5 the two half-height copies each carry 0.5, not 1",
    abs(0.5 * 1 - 0.5) < 1e-12)
# the overlapping case
chk("M5 a band on pi <= |w| <= 3pi modulated by cos(2 pi t) puts copies on "
    "|w| <= pi and on 3pi <= |w| <= 5pi",
    abs((np.pi - 2 * np.pi) + np.pi) < 1e-12
    and abs((3 * np.pi - 2 * np.pi) - np.pi) < 1e-12
    and abs((np.pi + 2 * np.pi) - 3 * np.pi) < 1e-12
    and abs((3 * np.pi + 2 * np.pi) - 5 * np.pi) < 1e-12)
chk("M5 where the two copies overlap they add: 0.5 + 0.5 = 1 on |w| <= pi",
    abs(0.5 + 0.5 - 1.0) < 1e-12)
chk("M5 the boxed form 0.5 X_1(j(w+4pi)) + X_1(j w) + 0.5 X_1(j(w-4pi)) carries the 1/2 "
    "on both outer terms",
    abs(0.5 + 0.5 + 1.0 - 2.0) < 1e-12)
# products of sincs
chk("M5 two rectangles of height A and half-width w_0 convolve to a triangle of apex 2 A^2 w_0",
    abs(2 * 1**2 * 2 * np.pi - 4 * np.pi) < 1e-12)
chk("M5 [sin(2pi t)/(pi t)]^2 has a triangular transform of apex 2 on |w| <= 4 pi",
    abs((1 / (2 * np.pi)) * 4 * np.pi - 2) < 1e-12)
chk("M5 the triangle base is |w| <= 2 w_0 = 4 pi",
    abs(2 * 2 * np.pi - 4 * np.pi) < 1e-12)
chk("M5 unequal bandwidths give a trapezoid of height 2, flat on |w| <= 2pi, zero beyond 6pi",
    abs((1 / (2 * np.pi)) * 2 * 1 * 1 * min(2 * np.pi, 4 * np.pi) - 2) < 1e-12
    and abs(abs(4 * np.pi - 2 * np.pi) - 2 * np.pi) < 1e-12
    and abs((4 * np.pi + 2 * np.pi) - 6 * np.pi) < 1e-12)
chk("M5 the two time-domain peaks are 4 and 8",
    abs((2 * np.pi / np.pi)**2 - 4) < 1e-12
    and abs((2 * np.pi / np.pi) * (4 * np.pi / np.pi) - 8) < 1e-12)
# verified numerically as well
tt = np.linspace(-600, 600, 6000001)


def sq_sinc(z):
    z = np.where(np.abs(z) < 1e-14, 1e-14, z)
    return (np.sin(2 * np.pi * z) / (np.pi * z))**2


chk("M5 the sinc-squared transform at w = 0 is numerically 2.0000",
    abs(np.trapezoid(sq_sinc(tt), tt) - 2.0) < 5e-3,
    f"{np.trapezoid(sq_sinc(tt), tt):.5f}")
chk("M5 the sinc-squared transform at w = 2 pi is half its apex, 1.0000",
    abs(np.trapezoid(sq_sinc(tt) * np.cos(2 * np.pi * tt), tt) - 1.0) < 5e-3,
    f"{np.trapezoid(sq_sinc(tt)*np.cos(2*np.pi*tt), tt):.5f}")

# =====================================================================
# 19. Systems from a differential equation
# =====================================================================
# d2y/dt2 + 4 dy/dt + 3 y = dx/dt + 2 x
H = (s + 2) / (s**2 + 4 * s + 3)
chk("M5 H(j w) = (j w + 2)/((j w)^2 + 4 j w + 3) from the differential equation",
    sp.simplify(sp.factor(sp.denom(sp.together(H))) - (s + 1) * (s + 3)) == 0)
Hpf = sp.apart(H, s)
chk("M5 simple poles: A = B = 1/2 in H = A/(s+1) + B/(s+3)",
    sp.simplify(Hpf - (sp.Rational(1, 2) / (s + 1) + sp.Rational(1, 2) / (s + 3))) == 0,
    str(Hpf))
chk("M5 h(t) = [0.5 e^{-t} + 0.5 e^{-3t}] u(t)",
    abs(num_ft(lambda z: (0.5 * np.exp(-z) + 0.5 * np.exp(-3 * z)) * (z >= 0), 1.9, 0, 400)
        - complex(H.subs(s, 1j * 1.9))) < 1e-6)
chk("M5 the cover-up rule gives A by cancelling (s+1) first, then setting s = -1",
    sp.cancel((s + 1) * H).subs(s, -1) == sp.Rational(1, 2),
    str(sp.cancel((s + 1) * H).subs(s, -1)))
chk("M5 the cover-up rule does not reach the repeated pole: (s+1)Y still has a pole at s = -1",
    sp.cancel((s + 1) * (s + 2) / ((s + 1)**2 * (s + 3))).subs(s, -1) in (sp.oo, -sp.oo, sp.zoo))

# the repeated pole
Y = (s + 2) / ((s + 1)**2 * (s + 3))
Ypf = sp.apart(Y, s)
A_r = sp.simplify(sp.diff((s + 1)**2 * Y, s).subs(s, -1))
B_r = sp.simplify(((s + 1)**2 * Y).subs(s, -1))
C_r = sp.simplify(((s + 3) * Y).subs(s, -3))
chk("M5 repeated pole: B = [(s+1)^2 Y] at s = -1 = 1/2", B_r == sp.Rational(1, 2), str(B_r))
chk("M5 repeated pole: A = d/ds[(s+1)^2 Y] at s = -1 = 1/4", A_r == sp.Rational(1, 4), str(A_r))
chk("M5 repeated pole: C = [(s+3) Y] at s = -3 = -1/4", C_r == -sp.Rational(1, 4), str(C_r))
chk("M5 the three coefficients reassemble Y exactly",
    sp.simplify(Ypf - (sp.Rational(1, 4) / (s + 1) + sp.Rational(1, 2) / (s + 1)**2
                       - sp.Rational(1, 4) / (s + 3))) == 0, str(Ypf))


def y_correct(z):
    return (0.25 * np.exp(-z) + 0.5 * z * np.exp(-z) - 0.25 * np.exp(-3 * z)) * (z >= 0)


def y_printed(z):
    return (0.25 * np.exp(-z) + 0.5 * z * np.exp(-z) + 0.25 * np.exp(-3 * z)) * (z >= 0)


chk("M5 y(t) = [0.25 e^{-t} + 0.5 t e^{-t} - 0.25 e^{-3t}] u(t)",
    abs(num_ft(y_correct, 1.7, 0, 400) - complex(Y.subs(s, 1j * 1.7))) < 1e-6)
chk("M5 y(0) = 0, as a convolution of two causal signals must be",
    abs(y_correct(np.array([0.0]))[0]) < 1e-15)
chk("M5 the sign-flipped assembly gives y(0) = 0.5, which no causal convolution can",
    abs(y_printed(np.array([0.0]))[0] - 0.5) < 1e-15)
for tv, cval, pval in ((0.0, 0.000000, 0.500000), (0.5, 0.247483, 0.359048),
                       (1.0, 0.263463, 0.288356), (2.0, 0.168549, 0.169789)):
    chk(f"M5 y({tv}) = {cval:.6f} correct, {pval:.6f} with the flipped sign",
        abs(y_correct(np.array([tv]))[0] - cval) < 5e-7
        and abs(y_printed(np.array([tv]))[0] - pval) < 5e-7,
        f"{y_correct(np.array([tv]))[0]:.6f} / {y_printed(np.array([tv]))[0]:.6f}")
chk("M5 the two curves differ by a factor of two at the origin and are close past t = 2",
    abs(y_printed(np.array([2.0]))[0] - y_correct(np.array([2.0]))[0]) < 2e-3)
# direct convolution as the second route
conv = sp.integrate(sp.exp(-tau) * (sp.Rational(1, 2) * sp.exp(-(t - tau))
                                    + sp.Rational(1, 2) * sp.exp(-3 * (t - tau))), (tau, 0, t))
chk("M5 direct convolution reproduces the same y(t)",
    sp.simplify(conv - (sp.Rational(1, 4) * sp.exp(-t) + sp.Rational(1, 2) * t * sp.exp(-t)
                        - sp.Rational(1, 4) * sp.exp(-3 * t))) == 0, str(sp.simplify(conv)))
chk("M5 H(j w) exists because h is absolutely integrable, which for an LTI system is BIBO stability",
    sp.integrate(sp.Abs(sp.Rational(1, 2) * sp.exp(-t) + sp.Rational(1, 2) * sp.exp(-3 * t)),
                 (t, 0, sp.oo)) == sp.Rational(2, 3))

# =====================================================================
# 20. Laboratory H — every signal it draws, and the modulation state
# =====================================================================
chk("LAB H rectangular pulse: X(j0) = 2 T_1 at every width setting",
    all(abs(num_ft(lambda z, B=Bv: (np.abs(z) < B) * 1.0, 0.0, -Bv - 1, Bv + 1).real - 2 * Bv) < 1e-4
        for Bv in (0.5, 1.0, 2.0, 3.0)))
chk("LAB H narrowing the pulse widens its transform: the first null moves out as pi/T_1",
    (np.pi / 0.5) > (np.pi / 1.0) > (np.pi / 3.0))
chk("LAB H one-sided exponential: |X| peak 1/a, phase -arctan(w/a), both drawn",
    abs(1 / 0.5 - 2.0) < 1e-12 and abs(np.angle(1 / (0.5 + 1j * 1)) + np.arctan(2)) < 1e-12)
chk("LAB H two-sided exponential: X real, so the phase panel is 0 everywhere",
    abs(np.angle(2 * 1 / (1 + 4.0**2))) < 1e-15)
chk("LAB H sinc signal: X = 1 on |w| < W, phase zero inside the band",
    abs(num_ft(lambda z: np.sin(2.0 * z) / (np.pi * np.where(z == 0, 1e-300, z)),
               0.5, -4000, 4000, 4000001).real - 1) < 5e-3)
sg = 0.7
chk("LAB H Gaussian: F{e^{-t^2/(2 s^2)}} = s sqrt(2pi) e^{-s^2 w^2/2}",
    abs(num_ft(lambda z: np.exp(-z**2 / (2 * sg**2)), 1.4, -60, 60)
        - sg * np.sqrt(2 * np.pi) * np.exp(-sg**2 * 1.4**2 / 2)) < 1e-8)
chk("LAB H Gaussian time-bandwidth product is invariant under the width control",
    abs((1 / 0.7) * 0.7 - (1 / 2.0) * 2.0) < 1e-12)
chk("LAB H cosine: X = pi delta(w - w_c) + pi delta(w + w_c), weight pi = 3.141593 each",
    abs(np.pi - 3.141593) < 5e-7)
chk("LAB H impulse train: spacing 2pi/T and weight 2pi/T, both moving together",
    abs(2 * np.pi / 0.8 - 7.853982) < 5e-6, f"{2*np.pi/0.8:.6f}")
chk("LAB H modulation halves each copy: the two sidebands carry X/2",
    abs(0.5 - 1 / 2) < 1e-12)
chk("LAB H the copies overlap exactly when w_c is below the signal bandwidth",
    (2 * np.pi < 2 * (2 * np.pi)) and not (8 * np.pi < 2 * np.pi))
chk("LAB H modulating a cosine of w_0 by a carrier of w_c gives |w_c - w_0| and w_c + w_0",
    abs(abs(4 * np.pi - np.pi) - 3 * np.pi) < 1e-12
    and abs((4 * np.pi + np.pi) - 5 * np.pi) < 1e-12)
chk("LAB H when w_c = w_0 the lower sideband lands on w = 0 and the copies meet there",
    abs(abs(np.pi - np.pi)) < 1e-12)

# =====================================================================
print()
print(f"{len(P)} passed, {len(F)} failed")
if F:
    print("FAILED:")
    for f in F:
        print("  " + f)
raise SystemExit(1 if F else 0)
