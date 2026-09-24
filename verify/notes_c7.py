"""Numerical checks for the numbers stated in notes/src/c7.js (Chapter 7,
sampling and aliasing) that are not already on a Module 7 slide, and for the
derivations the chapter writes out. Plain NumPy. Prints one PASS/FAIL line per
check and a final count."""
from math import gcd
import numpy as np

PI = np.pi
res = []


def chk(name, ok, info=""):
    res.append(bool(ok))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{info}]" if str(info) else ""))


def near(a, b, tol=5e-4):
    return abs(a - b) < tol


def integ(f, a, b, n=200001):
    x = np.linspace(a, b, n)
    return np.trapezoid(f(x), x)


def fold(f0, fs):
    return abs(f0 - fs * np.floor(f0 / fs + 0.5))


def sinc(u):
    u = np.asarray(u, dtype=float)
    return np.where(np.abs(u) < 1e-12, 1.0, np.sin(u) / np.where(np.abs(u) < 1e-12, 1, u))


# ------------------------------------------------------------------ 7.1
xB = lambda t: sinc(PI * np.asarray(t)) ** 2
chk("7.1 running signal: x(1) = 0, and T = 0.2 puts t = 1 at n = 5", near(xB(1.0), 0, 1e-12) and round(1 / 0.2) == 5)
# its transform is a triangle of peak 1 reaching zero at 2 pi
w = np.array([0, PI, 1.5 * PI, 2 * PI, 2.5 * PI])
Xw = [integ(lambda t: xB(t) * np.cos(wi * t), -400, 400, 1600001) for wi in w]
chk("7.1 running signal: X(jw) = 1 - |w|/(2 pi) on |w| <= 2 pi, 0 beyond",
    np.allclose(Xw, np.maximum(0, 1 - w / (2 * PI)), atol=2e-3), np.round(Xw, 4))
chk("7.1 sensor at 200 Hz: omega_s = 400 pi and omega_s T = 2 pi", near(2 * PI * 200, 400 * PI, 1e-9) and near(400 * PI / 200, 2 * PI, 1e-12))
T = 0.1
M = 1000  # one period of the train on M points; the impulse has area 1, height M/T
ak = [np.sum(np.r_[M / T, np.zeros(M - 1)] * np.exp(-2j * PI * k * np.arange(M) / M)) * (T / M) / T for k in range(4)]
chk("7.1 impulse-train series: a_k = 1/T for every k (discretised period)", np.allclose(np.array(ak) * T, 1))
chk("7.1 T = 0.1 s: impulses of P(jw) are 20 pi rad/s apart", near(2 * PI / 0.1, 20 * PI, 1e-9))
chk("7.1 T = 0.4 s: omega_s = 5 pi, weight 2 pi/T = 5 pi, copy height 1/T = 2.5",
    near(2 * PI / 0.4, 5 * PI, 1e-9) and near(1 / 0.4, 2.5, 1e-12))
chk("7.1 X(j0) = 2, T = 0.05: X_p(j0) = 40", near(2 / 0.05, 40, 1e-9))
chk("7.1 guard band 8 pi - 2*3 pi = 2 pi", near(8 * PI - 6 * PI, 2 * PI, 1e-12))
# sampled spectrum: the DTFT of the samples times T equals the sum of shifted copies (T = 0.4)
T = 0.4
n = np.arange(-4000, 4001)
xs = xB(n * T)
for wt in (0.3 * PI, 1.7 * PI, 2.5 * PI, 3.4 * PI):
    Xp = np.sum(xs * np.cos(wt * n * T))
    Xs = sum(max(0, 1 - abs(wt - k * 2 * PI / T) / (2 * PI)) for k in range(-5, 6)) / T
    ok = near(Xp, Xs, 5e-3)
    if not ok:
        break
chk("7.1 X_p(jw) = (1/T) sum_k X(j(w - k w_s)) at T = 0.4 s", ok)

# ------------------------------------------------------------------ 7.2
chk("7.2 overlap at w_s = 3.5 pi: from 1.5 pi to 2 pi, width 2 w_M - w_s = 0.5 pi",
    near(3.5 * PI - 2 * PI, 1.5 * PI, 1e-12) and near(4 * PI - 3.5 * PI, 0.5 * PI, 1e-12))
chk("7.2 w_s = 3.4 pi: X_p = X/T alone on |w| < 1.4 pi", near(3.4 * PI - 2 * PI, 1.4 * PI, 1e-12))
chk("7.2 w_M = 2 pi, w_s = 7 pi: cutoff interval (2 pi, 5 pi) holds 4 pi only of {1.5, 4, 5.5} pi",
    [2 < c < 5 for c in (1.5, 4, 5.5)] == [False, True, False])
chk("7.2 gap >= pi with w_M = 2 pi needs w_s >= 5 pi", near(4 * PI + PI, 5 * PI, 1e-12))
# Example 7.1
T = 1 / 4000
nn = np.arange(0, 400)
chk("Ex 7.1 T = 2 pi/(8000 pi) = 0.25 ms, 1/T = 4000", near(2 * PI / (8000 * PI), 2.5e-4, 1e-15) and near(1 / T, 4000, 1e-9))
chk("Ex 7.1 sin(4000 pi n T) = 0 for every n", np.allclose(np.sin(4000 * PI * nn * T), 0, atol=1e-9))
chk("Ex 7.1 cos(4000 pi n T) = (-1)^n", np.allclose(np.cos(4000 * PI * nn * T), (-1.0) ** nn))
chk("Ex 7.1 weights at +4000 pi: 4000 pi/j - 4000 pi/j = 0", near((PI / 1j) / T + (-(PI / 1j)) / T, 0, 1e-9))
chk("Ex 7.1 cosine line at -2000 pi moves to 6000 pi", near(-2000 + 8000, 6000, 1e-12))
chk("Ex 7.1 repair: 9000 pi rad/s gives T = 1/4500 s = 222.2 us, interval (4000 pi, 5000 pi)",
    near(2 * PI / (9000 * PI) * 1e6, 222.2, 0.05) and near(9000 - 4000, 5000, 1e-12))
# Example 7.3: the line spectrum inverts to x(t)
t = np.linspace(0, 0.002, 7)
xr = (2 * PI / (2 * PI)) + (PI / (2 * PI)) * 2 * np.cos(2000 * PI * t) + (PI / (2 * PI * 1j)) * 2j * np.sin(4000 * PI * t)
chk("Ex 7.3 inverting the five impulses returns 1 + cos(2000 pi t) + sin(4000 pi t)",
    np.allclose(xr, 1 + np.cos(2000 * PI * t) + np.sin(4000 * PI * t)))
chk("Ex 7.3 f_M = 2000 Hz, Nyquist 8000 pi rad/s = 4000 Hz; period of x is 1 ms",
    near(4000 * PI / (2 * PI), 2000, 1e-9) and near(8000 * PI / (2 * PI), 4000, 1e-9)
    and np.allclose(1 + np.cos(2000 * PI * (t + 1e-3)) + np.sin(4000 * PI * (t + 1e-3)), 1 + np.cos(2000 * PI * t) + np.sin(4000 * PI * t)))
# Example 7.4
W = 4000 * PI
tt = np.array([1e-5, 7e-5, 2.3e-4])
inv = [integ(lambda w: np.cos(w * ti) / (2 * PI), -W, W) for ti in tt]
chk("Ex 7.4 inverse of the unit rectangle on |w| <= W is sin(Wt)/(pi t)", np.allclose(inv, np.sin(W * tt) / (PI * tt), rtol=1e-6))
chk("Ex 7.4 T = 0.25 ms; with 0.25 s, w_s T = 2000 pi and 1/T = 4", near(8000 * PI * 0.25, 2000 * PI, 1e-9) and near(1 / 0.25, 4, 1e-12))
chk("Ex 7.4 16000 pi rad/s gives 125 us, half of 0.25 ms", near(2 * PI / (16000 * PI), 125e-6, 1e-15) and near(2.5e-4 / 125e-6, 2, 1e-12))
chk("Ex 7.4 0.25 s at 2000 Hz is 500 cycles", near(0.25 * 2000, 500, 1e-12))
# Example 7.5
A = 2 * W
chk("Ex 7.5 A = 2W = 8000 pi, X_max = A/2pi = 4000", near(A, 8000 * PI, 1e-9) and near(A / (2 * PI), 4000, 1e-9))
ww = np.array([0, 2000 * PI, 5000 * PI, 8000 * PI])
RR = [integ(lambda th: ((np.abs(th) <= W) & (np.abs(wi - th) <= W)).astype(float), -3 * W, 3 * W, 1200001) for wi in ww]
chk("Ex 7.5 [R*R](w) = 2W - |w| on |w| <= 2W", np.allclose(RR, np.maximum(0, 2 * W - ww), rtol=1e-4), np.round(np.array(RR) / PI))
chk("Ex 7.5 w_M = 8000 pi, T = 125 us, copy height 3.2e7", near(2 * PI / (2 * 8000 * PI), 125e-6, 1e-15) and near(4000 * 8000, 3.2e7, 1e-6))
# band-pass sampling windows for 8 pi < |w| < 10 pi
wL, wH = 8 * PI, 10 * PI
B = wH - wL


def fits(ws):
    # a copy of the negative band fits between positive-band copies (touching allowed)
    for m in range(0, 40):
        if (m + 1) * ws >= 2 * wH - 1e-9 and m * ws <= 2 * wL + 1e-9:
            return True
    return False


def overlap_free(ws, N=4000):
    w = np.linspace(-40 * PI, 40 * PI, N * 20 + 1)
    cnt = np.zeros_like(w)
    for k in range(-40, 41):
        for s in (1, -1):
            c = s * (w - k * ws)
            cnt += ((c > wL + 1e-7) & (c < wH - 1e-7))
    return cnt.max() <= 1


wins = [(2 * wH / n, (2 * wL / (n - 1) if n > 1 else np.inf)) for n in range(1, int(wH // B) + 1)]
chk("7.2 band-pass: w_H/B = 5 windows: [20 pi, inf), [10 pi,16 pi], [20pi/3, 8 pi], [5 pi,16pi/3], [4 pi,4 pi]",
    np.allclose(np.array(wins)[:, 0] / PI, [20, 10, 20 / 3, 5, 4]) and np.allclose(np.array(wins)[1:, 1] / PI, [16, 8, 16 / 3, 4]))
grid = np.arange(3, 22.01, 0.25) * PI
agree = all(fits(ws) == any(lo - 1e-9 <= ws <= hi + 1e-9 for lo, hi in wins) for ws in grid)
chk("7.2 band-pass: the window formula agrees with a direct fit test on 3 pi..22 pi", agree)
chk("7.2 band-pass: a direct count of copies finds no overlap at 4 pi, 7 pi, 12 pi and overlap at 9 pi",
    overlap_free(4 * PI) and overlap_free(7 * PI) and overlap_free(12 * PI) and not overlap_free(9 * PI))
chk("7.2 band-pass: n = 6 window is empty (n <= w_H/B)", 2 * wH / 6 > 2 * wL / 5)
chk("Ex 7.6 at 4 pi: 8..10 pi - 2 w_s = 0..2 pi and -10..-8 pi + 3 w_s = 2..4 pi",
    near(8 * PI - 8 * PI, 0, 1e-12) and near(10 * PI - 8 * PI, 2 * PI, 1e-12) and near(-10 * PI + 12 * PI, 2 * PI, 1e-12) and near(-8 * PI + 12 * PI, 4 * PI, 1e-12))
chk("Ex 7.6 band 12..14 pi: w_H/B = 7 and window n = 7 is the point 4 pi",
    near(14 / 2, 7, 1e-12) and near(2 * 14 * PI / 7, 4 * PI, 1e-12) and near(2 * 12 * PI / 6, 4 * PI, 1e-12))

# ------------------------------------------------------------------ 7.3
chk("7.3 w_M = 2 pi, w_s = 10 pi: cutoff interval (2 pi, 8 pi)", near(10 - 2, 8, 1e-12))
for T in (0.25, 1.0):
    wc = PI / T
    h0 = integ(lambda w: T * np.ones_like(w) / (2 * PI), -wc, wc)
    ok = near(h0, T * wc / PI, 1e-9) and near(h0, 1, 1e-9)
chk("7.3 h_LP(0) = T w_c/pi = 1 at w_c = pi/T", ok)
chk("7.3 w_c = 1.5 pi/T: h_LP(0) = 1.5", near(1.5 * PI / PI, 1.5, 1e-12))
chk("7.3 w_c = pi/T is the midpoint (w_M + w_s - w_M)/2 = w_s/2", near((2 * PI + 6 * PI - 2 * PI) / 2, 3 * PI, 1e-12))
chk("7.3 dropped pi: sin(1)/pi = 0.267849, limit at 0 is 1/pi = 0.318", near(np.sin(1) / PI, 0.267849, 1e-6) and near(1 / PI, 0.318, 5e-4))
# interpolation reproduces the running signal
T = 0.25
nn = np.arange(-4000, 4001)
tq = np.array([0.13, 0.61, 1.37])
xr = [np.sum(xB(nn * T) * sinc(PI * (ti - nn * T) / T)) for ti in tq]
chk("7.3 sum_n x(nT) sinc(pi(t-nT)/T) = x(t) for the running signal, T = 0.25 s", np.allclose(xr, xB(tq), atol=2e-4))
# zero-order hold
T = 0.5
wv = np.array([0.7, 2.1, 5.3])
H0i = [integ(lambda t: np.exp(-1j * wi * t), 0, T) for wi in wv]
chk("7.3 H_0(jw) = e^{-jwT/2} 2 sin(wT/2)/w", np.allclose(H0i, np.exp(-1j * wv * T / 2) * 2 * np.sin(wv * T / 2) / wv, atol=1e-8))
chk("7.3 |H_0| at pi/T = 2T/pi = 0.64 T", near(2 * np.sin(PI / 2) / (PI / T) / T, 2 / PI, 1e-12) and near(2 / PI, 0.64, 0.005))
chk("7.3 first zero of |H_0| at w_s; T = 0.1 gives 20 pi", near(np.sin((2 * PI / 0.1) * 0.1 / 2), 0, 1e-12) and near(2 * PI / 0.1, 20 * PI, 1e-9))
# hold level ratio
for f0, fs, val in ((300, 2000, 0.18), (300, 8000, 0.039)):
    H = lambda f: abs(np.sin(PI * f / fs)) / (PI * f)
    ok = near(H(fs - f0) / H(f0), f0 / (fs - f0), 1e-12) and near(f0 / (fs - f0), val, 0.005)
    chk(f"Ex 7.7 f0 = {f0}, fs = {fs}: copy level ratio f0/(fs-f0) = {val}", ok, round(f0 / (fs - f0), 4))
# compensator
T = 0.5
wb = np.linspace(1e-6, PI / T, 2001)
boost = T * wb / (2 * np.sin(wb * T / 2))
chk("7.3 compensator boost rises from 1 to pi/2 at the band edge", near(boost[0], 1, 1e-6) and near(boost[-1], PI / 2, 1e-9) and np.all(np.diff(boost) > 0))
chk("7.3 compensator at w_s/4: pi/(2 sqrt 2) = 1.11", near((PI / 2) / (2 * np.sin(PI / 4)), PI / (2 * np.sqrt(2)), 1e-12) and near(PI / (2 * np.sqrt(2)), 1.11, 0.005))
# hold errors: ZOH ~ |x'| T, FOH ~ |x''| T^2 / 8
g = lambda t: np.cos(2 * PI * t)
def zoh_err(T):
    t = np.linspace(0, 1, 200001)
    return np.max(np.abs(g(t) - g(np.floor(t / T + 1e-12) * T)))
def foh_err(T):
    t = np.linspace(0, 1, 200001)
    n = np.floor(t / T + 1e-12)
    x1 = g(n * T) + (t - n * T) / T * (g((n + 1) * T) - g(n * T))
    return np.max(np.abs(g(t) - x1))
r0 = zoh_err(0.1) / zoh_err(0.05)
r1 = foh_err(0.1) / foh_err(0.05)
chk("7.3 halving T about halves the ZOH error and quarters the FOH error", 1.8 < r0 < 2.2 and 3.7 < r1 < 4.3, (round(r0, 3), round(r1, 3)))
chk("7.3 FOH error of cos(2 pi t) is close to |x''| T^2/8 = (2 pi)^2 T^2/8", near(foh_err(0.05), (2 * PI) ** 2 * 0.05 ** 2 / 8, 1e-3), round(foh_err(0.05), 5))
# first-order hold
T = 0.2
tt = np.array([0, 0.05, 0.1, 0.17])
gg = [integ(lambda tau: ((np.abs(tau) <= T / 2) & (np.abs(ti - tau) <= T / 2)).astype(float), -T, T + 0.2, 400001) for ti in tt]
chk("7.3 (g*g)(t) = T - |t|, and h_1(0.1) = 0.5 with T = 0.2", np.allclose(gg, T - tt, atol=1e-5) and near(1 - 0.1 / 0.2, 0.5, 1e-12))
T = 0.5
xs = np.array([0.3, -0.8, 1.1, 0.4])
h1 = lambda t: np.maximum(0, 1 - np.abs(t) / T)
tq = np.array([0.6, 0.77, 0.95])
lin = [sum(xs[k] * h1(ti - k * T) for k in range(4)) for ti in tq]
ref = [xs[1] + (ti - T) / T * (xs[2] - xs[1]) for ti in tq]
chk("7.3 sum of triangles = straight line between neighbouring samples", np.allclose(lin, ref))
wv = np.array([0.9, 3.3, 6 * PI])
H1i = [integ(lambda t: h1(t) * np.cos(wi * t), -T, T) for wi in wv]
chk("7.3 H_1(jw) = (1/T)[sin(wT/2)/(w/2)]^2", np.allclose(H1i, (np.sin(wv * T / 2) / (wv / 2)) ** 2 / T, atol=1e-7))
chk("7.3 H_1 at pi/T = 4T/pi^2 = 0.41 T", near((np.sin(PI / 2) / (PI / (2 * T))) ** 2 / T / T, 4 / PI ** 2, 1e-12) and near(4 / PI ** 2, 0.41, 0.006))
chk("7.3 T = 0.5, w = 6 pi: |H_0| = 1/(3 pi) = 0.106, H_1 = 2/(9 pi^2) = 0.023",
    near(abs(2 * np.sin(1.5 * PI) / (6 * PI)), 1 / (3 * PI), 1e-12) and near(1 / (3 * PI), 0.106, 5e-4)
    and near((np.sin(1.5 * PI) / (3 * PI)) ** 2 / 0.5, 2 / (9 * PI ** 2), 1e-12) and near(2 / (9 * PI ** 2), 0.023, 5e-4))
T1 = 0.5
wv = np.array([0.8, 2.9, 7.7])
Xr = [integ(lambda t: np.cos(wi * t), -T1, T1) for wi in wv]
chk("7.3 rectangular pulse: X(jw) = 2 sin(w T1)/w", np.allclose(Xr, 2 * np.sin(wv * T1) / wv, atol=1e-8))

# ------------------------------------------------------------------ 7.4
chk("7.4 fs = 6 kHz: 4 kHz -> 2 kHz, 5 kHz -> 1 kHz", near(fold(4, 6), 2, 1e-12) and near(fold(5, 6), 1, 1e-12))
fs = 6.0
ok = True
for f0 in np.linspace(0.05, 20, 400):
    k = np.floor(f0 / fs + 0.5)
    lines = np.array([kk * fs + s * f0 for kk in range(-10, 11) for s in (1, -1)])
    inside = lines[np.abs(lines) < fs / 2 - 1e-9]
    if len(inside) and not np.allclose(np.sort(np.abs(inside)), abs(f0 - k * fs)):
        ok = False
chk("7.4 the kept pair is +-|f0 - k fs| with k the integer nearest f0/fs", ok)
chk("7.4 w_s - w_0 fails above 3 w_s/2: f0 = 10, fs = 6 gives 2, not |6 - 10| = 4", near(fold(10, 6), 2, 1e-12) and not near(abs(6 - 10), 2, 1e-12))
ts = np.linspace(0, 3, 31)
chk("7.4 chirp at fs = 4 kHz: heard pitch 2 kHz at t = 1, 0 at t = 2, 2 kHz at t = 3",
    near(fold(2.0, 4), 2, 1e-12) and near(fold(4.0, 4), 0, 1e-12) and near(fold(6.0, 4), 2, 1e-12))
chk("7.4 chirp heard pitch: 2000t, 4000-2000t, 2000t-4000 on the three intervals",
    all(near(fold(2 * t, 4) * 1000, [2000 * t, 4000 - 2000 * t, 2000 * t - 4000][min(int(t), 2)], 1e-6) for t in ts if abs(t - round(t)) > 1e-9))
dph = np.gradient(2 * PI * 1000 * ts ** 2, ts) / (2 * PI)
chk("7.4 chirp instantaneous frequency = 2000 t Hz", np.allclose(dph[1:-1], 2000 * ts[1:-1], rtol=1e-6))
chk("Ex 7.11 fs = 3 kHz: tone 4 kHz at t = 2 s heard at 1 kHz", near(fold(4, 3), 1, 1e-12))
nn = np.arange(0, 60)
chk("Ex 7.8 T = 2/3: cos(2 pi n T) = cos(pi n T)", np.allclose(np.cos(2 * PI * nn * 2 / 3), np.cos(PI * nn * 2 / 3)))
chk("Ex 7.8 T = 0.8: w_s = 2.5 pi, alias 0.5 pi, samples agree",
    near(2 * PI / 0.8, 2.5 * PI, 1e-9) and np.allclose(np.cos(2 * PI * nn * 0.8), np.cos(0.5 * PI * nn * 0.8)))
chk("Ex 7.9 T = 2/5: cos(3 pi n T) = cos(2 pi n T)", np.allclose(np.cos(3 * PI * nn * 0.4), np.cos(2 * PI * nn * 0.4)))
chk("Ex 7.9 T = 1/2: cos(pi n T) + cos(3 pi n T) = 2 cos(pi n T)", np.allclose(np.cos(PI * nn / 2) + np.cos(3 * PI * nn / 2), 2 * np.cos(PI * nn / 2)))
# Example 7.10: error energies of the triangle
Bt, WS = 3 * PI, 4 * PI
X = lambda w: np.maximum(0, 1 - np.abs(w) / Bt)
def Xr(w, wa):
    s = sum(np.where(np.abs(w - k * WS) < wa, X(w - k * WS), 0) for k in range(-2, 3))
    return np.where(np.abs(w) < WS / 2, s, 0)
E = {m: integ(lambda w: (X(w) - Xr(w, m * PI)) ** 2, -Bt, Bt, 1200001) / (2 * PI) for m in (3, 2, 1)}
chk("Ex 7.10 error energy 2/27 = 0.074 with no filter", near(E[3], 2 / 27, 1e-5) and near(2 / 27, 0.074, 5e-4), round(E[3], 6))
chk("Ex 7.10 error energy 1/27 = 0.037 with w_a = 2 pi (halves)", near(E[2], 1 / 27, 1e-5) and near(1 / 27, 0.037, 5e-4), round(E[2], 6))
chk("Ex 7.10 error energy 8/27 = 0.296 with w_a = pi", near(E[1], 8 / 27, 1e-5) and near(8 / 27, 0.296, 5e-4), round(E[1], 6))
chk("Ex 7.10 each partial integral is pi/27", near(integ(lambda w: ((w - PI) / (3 * PI)) ** 2, PI, 2 * PI), PI / 27, 1e-8))
t = np.linspace(0, 2, 400001)
m1 = np.trapezoid((np.cos(3 * PI * t) - np.cos(2 * PI * t)) ** 2, t) / 2
m2 = np.trapezoid(np.cos(3 * PI * t) ** 2, t) / 2
chk("7.4 two cosines: mean-square error 1 without, 1/2 with the filter", near(m1, 1, 1e-6) and near(m2, 0.5, 1e-6))
chk("Ex 7.11 transition widths 0, 2.05, 4 kHz; Delta = 3 needs 46 kHz; telephone 0.6 kHz",
    near(40 / 2 - 20, 0, 1e-12) and near(44.1 / 2 - 20, 2.05, 1e-9) and near(48 / 2 - 20, 4, 1e-12)
    and near(2 * (20 + 3), 46, 1e-12) and near(8 / 2 - 3.4, 0.6, 1e-9))
nn = np.arange(0, 30)
chk("Ex 7.12 frames of e^{j 18 pi t} at 10 Hz equal e^{-j 2 pi n/10}", np.allclose(np.exp(1j * 18 * PI * nn / 10), np.exp(-1j * 2 * PI * nn / 10)))
seen = lambda r, fs: (r / fs - np.floor(r / fs + 0.5)) * fs
chk("Ex 7.12 seen rotation: 9 at 10 fps -> -1; at 9 fps -> 0; at 20 fps -> 9; 25 at 24 fps -> +1; 23 at 24 -> -1",
    near(seen(9, 10), -1, 1e-12) and near(seen(9, 9), 0, 1e-12) and near(seen(9, 20), 9, 1e-12)
    and near(seen(25, 24), 1, 1e-12) and near(seen(23, 24), -1, 1e-12))
chk("7.4 stripes 9 cycles/mm at 10/mm recorded at 1 cycle/mm", near(fold(9, 10), 1, 1e-12))
chk("7.4 moire: 1.0 and 1.1 mm beat every 11 mm; 1.0 and 1.25 mm every 5 mm; f2 = 0.909",
    near(1 / (1 - 1 / 1.1), 11, 1e-9) and near(1 / (1 - 1 / 1.25), 5, 1e-9) and near(1 / 1.1, 0.909, 5e-4))

# ------------------------------------------------------------------ 7.5
chk("7.5 Omega_M = w_M T: 0.4 pi, 0.5 pi, 1.2 pi for T = 0.2, 0.25, 0.6",
    np.allclose([2 * PI * T for T in (0.2, 0.25, 0.6)], [0.4 * PI, 0.5 * PI, 1.2 * PI]))
T = 0.25
nn = np.arange(-6000, 6001)
xs = xB(nn * T)
ok = True
for Om in (0.2 * PI, 0.9 * PI, 2.3 * PI):
    Xd = np.sum(xs * np.cos(Om * nn))
    ref = sum(max(0, 1 - abs((Om - 2 * PI * k) / T) / (2 * PI)) for k in range(-4, 5)) / T
    ok &= near(Xd, ref, 5e-3)
chk("7.5 X_d(e^{jOmega}) = (1/T) sum_k X_c(j(Omega - 2 pi k)/T), running signal, T = 0.25", ok)
Om = np.linspace(-PI, PI, 9)
Hd = 0.25 * np.exp(1j * Om) + 0.5 + 0.25 * np.exp(-1j * Om)
chk("7.5 three-point average: H_d = (1 + cos Omega)/2", np.allclose(Hd, 0.5 * (1 + np.cos(Om))))
chk("7.5 three-point average, T = 0.25: H_eff(j 2 pi) = 0.5; 6 pi > 4 pi gives 0", near(0.5 * (1 + np.cos(2 * PI * 0.25)), 0.5, 1e-12) and 6 * PI > PI / 0.25)
chk("Ex 7.13 Omega_c = pi/4: 2000 pi rad/s and 1 kHz at 8 kHz; 5.5125 kHz at 44.1 kHz; pi/2 at 16 kHz is 4 kHz",
    near(PI / 4 * 8000, 2000 * PI, 1e-9) and near(PI / 4 * 8000 / (2 * PI), 1000, 1e-9)
    and near((PI / 4) / (2 * PI) * 44.1, 5.5125, 1e-9) and near((PI / 2) / (2 * PI) * 16, 4, 1e-12))
chk("7.5 differentiator, T = 0.25: |H_d| at pi/2 is 2 pi, at pi is 4 pi", near((PI / 2) / 0.25, 2 * PI, 1e-12) and near(PI / 0.25, 4 * PI, 1e-12))
# differentiator on a tone, fs = 1 kHz
T = 1e-3
for f0 in (100.0,):
    O0 = 2 * PI * f0 * T
    n = np.arange(0, 50)
    X1 = np.exp(1j * O0 * n) / 2
    yd = (1j * O0 / T) * X1 + (-1j * O0 / T) * np.conj(X1)
    ok = np.allclose(yd.real, -(2 * PI * f0) * np.sin(2 * PI * f0 * n * T)) and np.allclose(yd.imag, 0)
chk("Ex 7.14 y_d[n] = -w_0 sin(w_0 n T) for f0 = 100 Hz; peak 200 pi = 628.3 /s = 0.628 /ms",
    ok and near(200 * PI, 628.3, 0.05) and near(200 * PI / 1000, 0.628, 5e-4))
n = np.arange(0, 50)
chk("Ex 7.14 f0 = 700 Hz: Omega_0 = 1.4 pi, cos(1.4 pi n) = cos(0.6 pi n), alias 300 Hz, peak 600 pi = 1885 /s",
    near(2 * PI * 700 * T, 1.4 * PI, 1e-12) and np.allclose(np.cos(1.4 * PI * n), np.cos(0.6 * PI * n))
    and near(fold(700, 1000), 300, 1e-9) and near(600 * PI, 1885, 0.5))
chk("7.5 half-sample delay: y_d[0] = cos(-pi/4) = 0.707 for 250 Hz at T = 1 ms",
    near(np.cos(2 * PI * 250 * (-0.0005)), np.cos(-PI / 4), 1e-12) and near(np.cos(PI / 4), 0.707, 5e-4))
nn = np.arange(-6, 7)
hint = [integ(lambda O: np.cos(O * (k - 0.5)), -PI, PI) / (2 * PI) for k in nn]
chk("7.5 half-sample delay: h[n] = (1/2pi) int e^{-jO/2} e^{jOn} = sin(pi(n-1/2))/(pi(n-1/2))",
    np.allclose(hint, np.sin(PI * (nn - 0.5)) / (PI * (nn - 0.5)), atol=1e-8))
chk("7.5 half-sample delay: sin(pi(n-1/2)) = (-1)^{n+1}; h[0] = h[1] = 2/pi",
    np.allclose(np.sin(PI * (nn - 0.5)), (-1.0) ** (nn + 1)) and near(np.sin(-PI / 2) / (-PI / 2), 2 / PI, 1e-12) and near(np.sin(PI / 2) / (PI / 2), 2 / PI, 1e-12))
T = 1.0
xc = lambda t: np.where(np.abs(t) < 1e-12, 1 / T, np.sin(PI * t / T) / (PI * np.where(np.abs(t) < 1e-12, 1, t)))
chk("7.5 sinc-input route: samples are delta[n]/T and T x_c(nT - T/2) = h[n]",
    np.allclose(xc(nn * T), np.where(nn == 0, 1 / T, 0), atol=1e-12) and np.allclose(T * xc(nn * T - T / 2), np.sin(PI * (nn - 0.5)) / (PI * (nn - 0.5))))
# quantization
chk("7.5 B = 4: Delta = 1/8, |e| <= 1/16", near(2 / 2 ** 4, 1 / 8, 1e-15) and near(1 / 16, 0.0625, 1e-15))
Dl = 0.1
chk("7.5 uniform error on +-Delta/2 has mean square Delta^2/12", near(integ(lambda e: e ** 2, -Dl / 2, Dl / 2) / Dl, Dl ** 2 / 12, 1e-12))
snr = lambda B: 10 * np.log10(1.5 * 2 ** (2 * B))
chk("7.5 SNR = 10 log10(1.5 * 2^{2B}) = 1.76 + 6.02 B", near(10 * np.log10(1.5), 1.76, 5e-3) and near(20 * np.log10(2), 6.02, 5e-3))
chk("7.5 rule values 19.8, 49.9, 98.1 dB at 3, 8, 16 bits", near(snr(3), 19.8, 0.05) and near(snr(8), 49.9, 0.05) and near(snr(16), 98.1, 0.05))


def q(x, B):
    D = 2 / 2 ** B
    return np.clip(D * (np.floor(x / D) + 0.5), -1 + D / 2, 1 - D / 2)


x = np.sin(2 * PI * 0.0123456789 * np.arange(200000))
meas = {B: 10 * np.log10(np.sum(x ** 2) / np.sum((q(x, B) - x) ** 2)) for B in range(1, 17)}
chk("7.5 measured SNR within 1 dB of the rule from 3 bits up", all(abs(meas[B] - snr(B)) < 1 for B in range(3, 17)),
    {B: round(meas[B], 1) for B in (3, 8, 16)})
chk("7.5 quantized error never exceeds Delta/2 (B = 3)", np.max(np.abs(q(x, 3) - x)) <= 0.125 + 1e-12)
chk("7.5 12 -> 14 bits adds 12.04 dB; 4 -> 12 bits adds 48.2 dB", near(snr(14) - snr(12), 12.04, 0.01) and near(snr(12) - snr(4), 48.2, 0.05))

# ------------------------------------------------------------------ 7.6
x6 = lambda n: sinc(PI * np.asarray(n, dtype=float) / 8) ** 2
nn = np.arange(-20000, 20001)
w = np.array([0, PI / 8, PI / 5, PI / 4, 0.4 * PI])
X6 = [np.sum(x6(nn) * np.cos(wi * nn)) for wi in w]
chk("7.6 running sequence: X = (32/pi)(pi/4 - |w|), peak 8, zero at pi/4",
    np.allclose(X6, np.maximum(0, 32 / PI * (PI / 4 - w)), atol=2e-3), np.round(X6, 3))
chk("7.6 sin(pi n/8)/(pi n/8) = 8 sin(W n)/(pi n), W = pi/8", np.allclose(sinc(PI * np.arange(1, 9) / 8), 8 * np.sin(PI / 8 * np.arange(1, 9)) / (PI * np.arange(1, 9))))
chk("7.6 x_p[4] = 0 for N = 3", 4 % 3 != 0)
for N in (3, 4):
    p = np.zeros(N); p[0] = 1
    ak = np.fft.fft(p) / N
    ok = np.allclose(ak, 1 / N)
chk("7.6 impulse train of period N: a_k = 1/N; weights 2 pi/N = pi/2 for N = 4", ok and near(2 * PI / 4, PI / 2, 1e-15))
# sampled-sequence spectrum
N = 3
xp = np.where(nn % N == 0, x6(nn), 0)
ok = True
for wi in (0.1, 0.9, 2.2):
    lhs = np.sum(xp * np.exp(-1j * wi * nn))
    Xf = lambda v: max(0, 32 / PI * (PI / 4 - abs((v + PI) % (2 * PI) - PI)))
    rhs = sum(Xf(wi - 2 * PI * k / N) for k in range(N)) / N
    ok &= near(lhs.real, rhs, 3e-3) and near(lhs.imag, 0, 1e-6)
chk("7.6 X_p(e^{jw}) = (1/N) sum_{k<N} X(e^{j(w - 2 pi k/N)}), N = 3", ok)
chk("7.6 no aliasing needs w_M < pi/N: running sequence N = 3 apart, 4 touching, 5 overlapping; 2pi/7 band gives N = 3",
    PI / 4 < PI / 3 and near(PI / 4, PI / 4) and PI / 4 > PI / 5 and max(N for N in range(1, 10) if 2 * PI / 7 < PI / N) == 3)
chk("7.6 N = 2 recovery cutoff interval (pi/4, 3 pi/4) contains pi/2", PI / 4 < PI / 2 < 3 * PI / 4)
chk("7.6 x[n] = n, N = 4: x_b[2] = 8", np.arange(12)[2 * 4] == 8)
# decimation spectrum
N = 3
nb = np.arange(-7000, 7001)
xb = x6(N * nb)
ok = True
for wi in (0.2, 1.1, 2.0):
    lhs = np.sum(xb * np.cos(wi * nb))
    rhs = np.sum(xp * np.cos((wi / N) * nn))
    ok &= near(lhs, rhs, 1e-6)
chk("7.6 X_b(e^{jw}) = X_p(e^{jw/N}), N = 3", ok)
chk("7.6 band edge N w_M: 3 pi/4 for N = 3, pi/2 for N = 2", near(3 * PI / 4, 3 * (PI / 4)) and near(2 * (PI / 4), PI / 2))
wrap = lambda v: (v + PI) % (2 * PI) - PI
chk("Ex 7.15 500 Hz and 3 kHz at 8 kHz are pi/8 and 3 pi/4", near(2 * PI * 500 / 8000, PI / 8, 1e-15) and near(2 * PI * 3000 / 8000, 3 * PI / 4, 1e-15))
chk("Ex 7.15 N = 2: 3 pi/2 wraps to -pi/2 = 1 kHz at 4 kHz; pi/4 = 500 Hz",
    near(wrap(3 * PI / 2), -PI / 2, 1e-12) and near((PI / 2) / (2 * PI) * 4000, 1000, 1e-9) and near((PI / 4) / (2 * PI) * 4000, 500, 1e-9))
nd = np.arange(0, 40)
chk("Ex 7.15 N = 2 in time: cos(3 pi (2n)/4) = cos(pi n/2), the 1 kHz tone at 4 kHz", np.allclose(np.cos(3 * PI * 2 * nd / 4), np.cos(PI * nd / 2)))
chk("Ex 7.15 N = 4: 500 Hz -> pi/2 kept; 3 kHz -> 3 pi = pi, 1 kHz at 2 kHz",
    near(4 * PI / 8, PI / 2, 1e-15) and near(abs(wrap(3 * PI)), PI, 1e-12) and near(fold(3000, 2000), 1000, 1e-9))
# interpolation
for N in (2, 3, 4):
    k = np.arange(-8, 9)
    hk = [integ(lambda w: N * np.cos(w * kk), -PI / N, PI / N) / (2 * PI) for kk in k * N]
    ok = np.allclose(hk, np.where(k == 0, 1, 0), atol=1e-8)
    hn = [integ(lambda w: N * np.cos(w * n), -PI / N, PI / N) / (2 * PI) for n in range(1, 6)]
    ok &= np.allclose(hn, sinc(PI * np.arange(1, 6) / N), atol=1e-8)
chk("7.6 interpolation filter: h[n] = sinc(pi n/N), h[0] = 1, h[kN] = 0", ok)
xbs = np.cos(PI * np.arange(-3000, 3001) / 4)
N = 2
xe = np.zeros(2 * len(xbs) - 1); xe[::2] = xbs
ne = np.arange(-len(xbs) + 1, len(xbs))
ok = True
for wi in (0.3, 1.2):
    ok &= near(np.sum(xe * np.cos(wi * ne)), np.sum(xbs * np.cos(N * wi * np.arange(-3000, 3001))), 1e-6)
chk("7.6 x_(N)[n] <-> X_b(e^{jNw})", ok)
chk("Ex 7.16 images of pi/4 at N = 2 lie at +-7 pi/8, i.e. 3500 Hz at 8 kHz; wanted at 500 Hz",
    near(wrap((-PI / 4 + 2 * PI) / 2), 7 * PI / 8, 1e-12) and near((7 * PI / 8) / (2 * PI) * 8000, 3500, 1e-9) and near((PI / 8) / (2 * PI) * 8000, 500, 1e-9))
chk("Ex 7.16 N = 4: one period of 2 pi holds 4 copies", near(2 * PI / (2 * PI / 4), 4, 1e-12))
chk("Ex 7.17 44100 = 2^2 3^2 5^2 7^2, 48000 = 2^7 3 5^3, gcd 300",
    2 ** 2 * 3 ** 2 * 5 ** 2 * 7 ** 2 == 44100 and 2 ** 7 * 3 * 5 ** 3 == 48000 and gcd(44100, 48000) == 300 == 2 ** 2 * 3 * 5 ** 2)
chk("Ex 7.17 L/M = 147/160, filter at 7056 kHz, cutoff pi/160, 48*147/160 = 44.1",
    44100 // 300 == 147 and 48000 // 300 == 160 and 48 * 147 == 7056 and near(min(PI / 147, PI / 160), PI / 160) and near(48 * 147 / 160, 44.1, 1e-12))

p, f = sum(res), len(res) - sum(res)
print(f"{p} passed, {f} failed")
