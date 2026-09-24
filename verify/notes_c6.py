"""Numerical checks for the numbers stated in notes/src/c6.js (Chapter 6, the
discrete-time Fourier transform) that are not already on a Module 6 slide.
Plain NumPy. Prints one PASS/FAIL line per check and a final count."""
import numpy as np

PI = np.pi
res = []


def chk(name, ok, info=""):
    res.append(bool(ok))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{info}]" if str(info) else ""))


def near(a, b, tol=5e-5):
    return abs(a - b) < tol


def dtft(x, w, n0=0):
    n = np.arange(len(x)) + n0
    return np.array([np.sum(np.asarray(x) * np.exp(-1j * wi * n)) for wi in np.atleast_1d(w)])


def dirich(w, N1):
    s = np.sin(w / 2)
    return np.where(np.abs(s) < 1e-12, 2 * N1 + 1, np.sin(w * (N1 + 0.5)) / np.where(np.abs(s) < 1e-12, 1, s))


# ---------------------------------------------------------------- 6.1
# rectangular window 1 on 0..L-1: W = e^{-jw(L-1)/2} sin(wL/2)/sin(w/2)
w = np.linspace(0.013, 6.2, 400)
ok = True
for L in (4, 12, 16, 32):
    W = dtft(np.ones(L), w)
    ok &= np.allclose(W, np.exp(-1j * w * (L - 1) / 2) * np.sin(w * L / 2) / np.sin(w / 2))
chk("6.1 W(e^{jw}) of 1 on 0..L-1 = e^{-jw(L-1)/2} sin(wL/2)/sin(w/2)", ok)

# four ones: |X[k]| at N = 8 and N = 4
X8 = np.abs(np.fft.fft(np.ones(4), 8))
chk("Ex 6.1 N=8: |X[k]| = 4, 2.6131, 0, 1.0824, 0, 1.0824, 0, 2.6131",
    np.allclose(X8, [4, 2.6131, 0, 1.0824, 0, 1.0824, 0, 2.6131], atol=5e-5), np.round(X8, 4))
X8f = np.abs(dtft(np.ones(4), 2 * PI * np.arange(8) / 8))
chk("Ex 6.1 the fft values are the DTFT at w_k = 2 pi k / N", np.allclose(X8, X8f))
X4 = np.fft.fft(np.ones(4), 4)
chk("Ex 6.1 N=4: X[k] = 4, 0, 0, 0", np.allclose(X4, [4, 0, 0, 0]))
X5 = np.fft.fft(np.ones(5), 5)
chk("6.1 five ones, N=5: X[0]=5 and X[1..4]=0", np.allclose(X5, [5, 0, 0, 0, 0]))
# a_k of the periodic extension equals X[k]/N
xt = np.ones(4)
ak = np.array([np.mean(xt * np.exp(-1j * 2 * PI * k * np.arange(4) / 4)) for k in range(4)])
chk("6.1 periodic extension of four ones with N=4 is the constant 1: a_k = X[k]/4 = 1,0,0,0",
    np.allclose(ak, X4 / 4) and np.allclose(ak, [1, 0, 0, 0]))

# zero padding: same curve, more samples
x = np.cos(0.3 * PI * np.arange(12)) + np.cos(0.4 * PI * np.arange(12))
Xp = np.fft.fft(x, 48)
chk("6.1 zero padding to N=48 samples the same DTFT at 2 pi k/48",
    np.allclose(Xp, dtft(x, 2 * PI * np.arange(48) / 48)))


def npeaks(L):
    x = np.cos(0.3 * PI * np.arange(L)) + np.cos(0.4 * PI * np.arange(L))
    ww = np.linspace(0.2 * PI, 0.5 * PI, 6001)
    m = np.abs(dtft(x, ww))
    pk = (m[1:-1] > m[:-2]) & (m[1:-1] > m[2:]) & (m[1:-1] > 0.5 * m.max())
    return int(np.sum(pk))


chk("6.1 two cosines 0.3pi and 0.4pi: one main peak (above half the largest) in 0.2pi..0.5pi at L=10 and L=12, two at L=30 and L=40",
    npeaks(10) == 1 and npeaks(12) == 1 and npeaks(30) == 2 and npeaks(40) == 2,
    f"{npeaks(10)}, {npeaks(12)}, {npeaks(30)}, {npeaks(40)}")
chk("Ex 6.1 sin(pi/8) = 0.38268 and sin(3pi/8) = 0.92388", near(np.sin(PI / 8), 0.38268) and near(np.sin(3 * PI / 8), 0.92388))
chk("6.1 main lobe 4pi/L: pi/3 at L=12, 0.1pi at L=40, 0.1333pi at L=30",
    near(4 * PI / 12, PI / 3, 1e-12) and near(4 * PI / 40, 0.1 * PI, 1e-12) and near(4 / 30, 0.1333, 1e-4))

# existence
chk("6.1 sum of (0.8)^n u[n] is 5", near(sum(0.8 ** n for n in range(2000)), 5, 1e-9))
n = np.arange(1, 2_000_001)
xs = np.sin(PI * n / 2) / (PI * n)
E = 0.25 + 2 * np.sum(xs ** 2)
chk("6.1 energy of sin(pi n/2)/(pi n) is 1/2", near(E, 0.5, 1e-6), f"{E:.7f}")
chk("6.1 for odd n, |sin(pi n/2)/(pi n)| = 1/(pi|n|)",
    np.allclose(np.abs(xs[::2]), 1 / (PI * n[::2])))
partial = [np.sum(np.abs(xs[:N])) for N in (10**3, 10**5, 2 * 10**6 - 1)]
chk("6.1 the moduli of sin(pi n/2)/(pi n) grow like ln(N)/(2 pi) without bound",
    partial[0] < partial[1] < partial[2] and near(partial[2] - partial[1], np.log(20) / (2 * PI), 1e-3), np.round(partial, 3))
chk("6.1 (0.5)^n u[n]: sum of moduli is 2", near(sum(0.5 ** n for n in range(200)), 2, 1e-12))

# unit circle
nn = np.arange(0, 20)
chk("6.1 cos((2pi - w)n) = cos(wn) at every integer n (w = 0.25pi, 1.2)",
    all(np.allclose(np.cos((2 * PI - ww) * nn), np.cos(ww * nn)) for ww in (0.25 * PI, 1.2)))
chk("6.1 a turn of 3pi/2 per step gives the stems of a turn of pi/2",
    np.allclose(np.cos(1.5 * PI * nn), np.cos(0.5 * PI * nn)))

# ---------------------------------------------------------------- 6.2
ww = np.linspace(-PI, PI, 200001)
chk("Ex 6.5 least value of the kernel: -1.2500 for N1=2 and -2.0391 for N1=4",
    near(dirich(ww, 2).min(), -1.25, 1e-4) and near(dirich(ww, 4).min(), -2.0391, 1e-4),
    f"{dirich(ww, 2).min():.5f}, {dirich(ww, 4).min():.5f}")
chk("Ex 6.5 first zeros 2pi/5 (N1=2), 2pi/9 (N1=4), 2pi/7 (N1=3)",
    abs(dirich(np.array([2 * PI / 5]), 2)[0]) < 1e-12 and abs(dirich(np.array([2 * PI / 9]), 4)[0]) < 1e-12
    and abs(dirich(np.array([2 * PI / 7]), 3)[0]) < 1e-12)
chk("Ex 6.5 2pi/9 over 2pi/5 is 5/9 = 0.5556, not 1/2", near((2 * PI / 9) / (2 * PI / 5), 5 / 9, 1e-12))
chk("6.2 kernel N1=2 at 0.6pi is -1.236", near(dirich(np.array([0.6 * PI]), 2)[0], -1.2361, 1e-4))
chk("Ex 6.6 W = pi: sin(pi n)/(pi n) is delta[n]",
    all(abs(np.sin(PI * k) / (PI * k)) < 1e-15 for k in range(1, 20)))
chk("Ex 6.6 W = pi/4 values 0.25, 0.225079, 0.159155, 0.075026",
    np.allclose([0.25] + [np.sin(PI / 4 * k) / (PI * k) for k in (1, 2, 3)],
                [0.25, 0.225079, 0.159155, 0.075026], atol=5e-7))
chk("Ex 6.6 W = pi/2 values 0.5, 0.318310, 0, -0.106103",
    np.allclose([0.5] + [np.sin(PI / 2 * k) / (PI * k) for k in (1, 2, 3)],
                [0.5, 0.318310, 0, -0.106103], atol=5e-7))
chk("Ex 6.6 the wrong prefactor sin(Wn)/n gives 0.707107 at n=1, W=pi/4",
    near(np.sin(PI / 4), 0.707107, 5e-7))
chk("Ex 6.4 a=1/2: (1+a)/(1-a) = 3 and (1-a)/(1+a) = 1/3", near(1.5 / 0.5, 3, 1e-12) and near(0.5 / 1.5, 1 / 3, 1e-12))
phi = -np.arctan2(0.5 * np.sin(ww), 1 - 0.5 * np.cos(ww))
chk("Ex 6.3 a=1/2: max |phase| = pi/6 = 0.5236 at w = +-pi/3",
    near(np.abs(phi).max(), PI / 6, 1e-6) and near(abs(ww[np.argmax(phi)]), PI / 3, 1e-4))
chk("Ex 6.3 a=1/8: arcsin(1/8) = 0.1253, 8/7 = 1.1429, 8/9 = 0.8889",
    near(np.arcsin(1 / 8), 0.1253) and near(8 / 7, 1.1429) and near(8 / 9, 0.8889))

# ---------------------------------------------------------------- 6.3
N = 4
x = np.array([1 + np.cos(PI * k / 2) + 0.25 * (-1) ** k for k in range(N)])
ak = np.array([np.mean(x * np.exp(-1j * 2 * PI * k * np.arange(N) / N)) for k in range(N)])
chk("Ex 6.7 1 + cos(pi n/2) + (1/4)(-1)^n: a_0..a_3 = 1, 1/2, 1/4, 1/2", np.allclose(ak, [1, 0.5, 0.25, 0.5]))
chk("Ex 6.7 x[0] = 2.25 = a_0 + a_1 + a_2 + a_3", near(x[0], 2.25, 1e-12) and near(ak.sum().real, 2.25, 1e-12))


def sq_ak(k, N, N1):
    if k % N == 0:
        return (2 * N1 + 1) / N
    return np.sin(2 * PI * k * (N1 + 0.5) / N) / (N * np.sin(PI * k / N))


def sq_ak_direct(k, N, N1):
    return np.mean([np.exp(-1j * 2 * PI * k * n / N) for n in range(-N1, N1 + 1)]) * (2 * N1 + 1) / N


chk("Ex 6.8 closed form matches the analysis sum (N=10, N1=2, k=0..9)",
    all(near(sq_ak(k, 10, 2), sq_ak_direct(k, 10, 2).real, 1e-12) for k in range(10)))
chk("Ex 6.8 a_1 = 0.32361, a_3 = -0.12361, a_2 = a_4 = 0, a_5 = 0.1",
    near(sq_ak(1, 10, 2), 0.32361) and near(sq_ak(3, 10, 2), -0.12361)
    and abs(sq_ak(2, 10, 2)) < 1e-12 and abs(sq_ak(4, 10, 2)) < 1e-12 and near(sq_ak(5, 10, 2), 0.1, 1e-12))
chk("Ex 6.8 sin(pi/10) = 0.30902 and sin(3pi/10) = 0.80902",
    near(np.sin(PI / 10), 0.30902) and near(np.sin(3 * PI / 10), 0.80902))
chk("Ex 6.8 weights 2pi a_k: pi, 2.0333, -0.7766, 0.6283",
    near(2 * PI * sq_ak(0, 10, 2), PI, 1e-12) and near(2 * PI * sq_ak(1, 10, 2), 2.0333)
    and near(2 * PI * sq_ak(3, 10, 2), -0.7766) and near(2 * PI * sq_ak(5, 10, 2), 0.6283))
chk("Ex 6.9 impulse-train weights 2pi/5, 2pi/10, 2pi/15 = 1.2566, 0.6283, 0.4189",
    near(2 * PI / 5, 1.2566) and near(2 * PI / 10, 0.6283) and near(2 * PI / 15, 0.4189))
x1 = lambda n: 2 * np.cos(5 * PI * n / 3)
x2 = lambda n: np.cos(7 * PI * n / 4)
nn = np.arange(0, 200)
per = [P for P in range(1, 100) if np.allclose(x1(nn + P) + x2(nn + P), x1(nn) + x2(nn))]
chk("Ex 6.10 fundamental period of the two cosines is 24", per[0] == 24, per[0])

# ---------------------------------------------------------------- 6.4
chk("6.4 delay by 2 at w = 0.5 adds -1 rad", near(-0.5 * 2, -1, 1e-12))
chk("6.4 X(e^{j(2pi-0.4)}) = conj X(e^{j0.4}) for a real sequence (checked on (0.5)^n u[n])",
    np.allclose(dtft(0.5 ** np.arange(80), 2 * PI - 0.4), np.conj(dtft(0.5 ** np.arange(80), 0.4))))
chk("6.4 delta[n+1] - delta[n-1] has X = 2j sin w, 2j at pi/2",
    np.allclose(dtft([1, 0, -1], PI / 2, n0=-1), 2j))
a = 0.6
Re0 = (1 - a) / (1 - 2 * a + a * a); Repi = (1 + a) / (1 + 2 * a + a * a)
chk("Ex 6.11 a = 0.6: Re X = 2.5 at w=0 and 0.625 at w=pi", near(Re0, 2.5, 1e-12) and near(Repi, 0.625, 1e-12))
xe = np.array([0.5 * a ** abs(k) + (0.5 if k == 0 else 0) for k in range(-80, 81)])
ww = np.linspace(-PI, PI, 101)
chk("Ex 6.11 transform of Ev{a^n u[n]} equals Re{1/(1 - a e^{-jw})}",
    np.allclose(dtft(xe, ww, n0=-80), np.real(1 / (1 - a * np.exp(-1j * ww))), atol=1e-12))
chk("6.4 running sum of (0.5)^n u[n] is 2 - (0.5)^n and settles at 2",
    all(near(sum(0.5 ** m for m in range(k + 1)), 2 - 0.5 ** k, 1e-12) for k in range(20)))
chk("6.4 accumulation of (0.75)^n u[n]: impulse weight pi X(e^{j0}) = 4 pi", near(PI / (1 - 0.75), 4 * PI, 1e-12))
chk("6.4 n (0.5)^n u[n]: sum is 2 = a/(1-a)^2",
    near(sum(k * 0.5 ** k for k in range(200)), 2, 1e-12) and near(0.5 / 0.25, 2, 1e-12))
ww = np.linspace(-3, 3, 61)
chk("6.4 n a^n u[n] <-> a e^{-jw}/(1 - a e^{-jw})^2 (a = 0.7)",
    np.allclose(dtft(np.arange(300) * 0.7 ** np.arange(300), ww),
                0.7 * np.exp(-1j * ww) / (1 - 0.7 * np.exp(-1j * ww)) ** 2, atol=1e-10))
chk("6.4 expansion by 4 puts peaks at -pi/2, 0, pi/2, pi in (-pi, pi]",
    np.allclose(np.abs(dtft(np.kron(np.ones(5), [1, 0, 0, 0])[:17], np.array([-PI / 2, 0, PI / 2, PI]))), 5))
chk("Ex 6.12 sum of x[n] is 15; the wrong form gives -0.7071 at pi/2 and about 1000 at pi - 1e-3",
    near(np.sin(5 * PI / 4) / np.sin(PI / 2), -0.7071) and abs(np.sin(2.5 * (PI - 1e-3)) / np.sin(PI - 1e-3) - 1000) < 1)
Eg = 1 / (1 - 0.25)
I = np.trapezoid(1 / (1 - 2 * 0.5 * np.cos(np.linspace(-PI, PI, 200001)) + 0.25), np.linspace(-PI, PI, 200001)) / (2 * PI)
chk("6.4 Parseval for (0.5)^n u[n]: both sides 4/3", near(Eg, 4 / 3, 1e-12) and near(I, 4 / 3, 1e-8), f"{I:.9f}")
wg = np.linspace(-PI, PI, 400001)
I5 = np.trapezoid(dirich(wg, 2) ** 2, wg) / (2 * PI)
chk("6.4 Parseval for the pulse N1=2: both sides 5", near(I5, 5, 1e-6), f"{I5:.7f}")
chk("6.4 (0.8)^n u[n] energy 1/(1-0.64) = 2.78", near(1 / (1 - 0.64), 2.7778))
chk("6.4 duality: impulse train with N=8 has a_k = 1/8 = 0.125",
    np.allclose([np.mean(np.array([1, 0, 0, 0, 0, 0, 0, 0]) * np.exp(-1j * 2 * PI * k * np.arange(8) / 8)) for k in range(8)], 0.125))
# DTFS duality: coefficients of the sequence a[n] are x[-k]/N (a random periodic x, N = 6)
rng = np.random.default_rng(6)
x = rng.normal(size=6) + 1j * rng.normal(size=6)
A = np.array([np.mean(x * np.exp(-1j * 2 * PI * k * np.arange(6) / 6)) for k in range(6)])
B = np.array([np.mean(A * np.exp(-1j * 2 * PI * k * np.arange(6) / 6)) for k in range(6)])
chk("6.4 DTFS duality: coefficients of a[n] are x[-k]/N", np.allclose(B, x[(-np.arange(6)) % 6] / 6))
akb = [0.5] + [np.sin(k * PI / 2) / (k * PI) for k in (1, 2, 3)]
chk("6.4 band |w| <= pi/2 as a series: 0.5, 0.3183, 0, -0.1061",
    np.allclose(akb, [0.5, 0.3183, 0, -0.1061], atol=5e-5))

# ---------------------------------------------------------------- 6.5
chk("Ex 6.13 |Y| = 8/3 = 2.6667 at w=0 and 8/15 = 0.5333 at w=pi",
    near(1 / (0.5 * 0.75), 2.6667) and near(1 / (1.5 * 1.25), 0.5333))
yv = [4 * (0.5 ** (k + 1) - 0.25 ** (k + 1)) for k in range(4)]
yc = np.convolve(0.5 ** np.arange(10), 0.25 ** np.arange(10))[:4]
chk("Ex 6.13 y[0..3] = 1, 0.75, 0.4375, 0.234375 and match direct convolution",
    np.allclose(yv, [1, 0.75, 0.4375, 0.234375]) and np.allclose(yv, yc))


def rectconv(w, W1, W2):
    lo, hi = max(w - W1, -W2), min(w + W1, W2)
    return (hi - lo) / (2 * PI) if hi > lo else 0.0


def perconv(w, W1, W2):
    return sum(rectconv(w - 2 * PI * k, W1, W2) for k in range(-3, 4))


chk("Ex 6.16 Z(0) = 1/2, Z(3pi/4) = 1/4, Z(pi) = 1/8 + 1/8",
    near(perconv(0, .75 * PI, .5 * PI), .5, 1e-12) and near(perconv(.75 * PI, .75 * PI, .5 * PI), .25, 1e-12)
    and near(rectconv(PI, .75 * PI, .5 * PI), .125, 1e-12) and near(perconv(PI, .75 * PI, .5 * PI), .25, 1e-12))
wz = np.linspace(-PI, PI, 200001)
Iz = np.trapezoid([perconv(v, .75 * PI, .5 * PI) for v in wz[::10]], wz[::10]) / (2 * PI)
chk("Ex 6.16 (1/2pi) integral of Z over one period is 3/8 = x[0] y[0]", near(Iz, 0.375, 1e-5), f"{Iz:.6f}")
chk("6.5 Y narrowed to pi/4: Z(0) = 1/4", near(perconv(0, .75 * PI, .25 * PI), .25, 1e-12))
chk("6.5 Z repeats every 2pi", all(near(perconv(v, .75 * PI, .5 * PI), perconv(v + 2 * PI, .75 * PI, .5 * PI), 1e-12)
                                   for v in np.linspace(-PI, PI, 37)))
chk("6.5 equal bands pi/2 and pi/2: the triangle reaches zero at +-pi",
    near(perconv(PI, .5 * PI, .5 * PI), 0, 1e-12) and near(perconv(0, .5 * PI, .5 * PI), .5, 1e-12))


def mod_overlap(w0):
    up = (w0 - PI / 4, w0 + PI / 4)
    mirror = (-w0 - PI / 4, -w0 + PI / 4)
    nxt = (2 * PI - w0 - PI / 4, 2 * PI - w0 + PI / 4)
    return up[0] < mirror[1] - 1e-12 or nxt[0] < up[1] - 1e-12


chk("Ex 6.17 bands stay apart exactly for pi/4 <= w0 <= 3pi/4",
    all(not mod_overlap(v) for v in np.linspace(PI / 4, 3 * PI / 4, 51))
    and mod_overlap(0.2 * PI) and mod_overlap(0.8 * PI))
chk("Ex 6.17 edges pi/12 and 7pi/12; z[0] = 1/4",
    near(PI / 3 - PI / 4, PI / 12, 1e-12) and near(PI / 3 + PI / 4, 7 * PI / 12, 1e-12) and near((PI / 2) / (2 * PI), .25, 1e-12))

# leakage and Hann
L = 32
n = np.arange(L)
hann = np.sin(PI * n / L) ** 2
chk("6.5 Hann sin^2(pi n/L) = 1/2 - cos(2 pi n/L)/2", np.allclose(hann, 0.5 - 0.5 * np.cos(2 * PI * n / L)))
ww = np.linspace(0.01, 3, 50)
Wr = lambda v: dtft(np.ones(L), v)
chk("6.5 Hann transform = W/2 - W(w - 2pi/L)/4 - W(w + 2pi/L)/4",
    np.allclose(dtft(hann, ww), 0.5 * Wr(ww) - 0.25 * Wr(ww - 2 * PI / L) - 0.25 * Wr(ww + 2 * PI / L)))
chk("6.5 Hann: |value| at 2pi/L is L/4 = 8, and 0 at 4pi/L",
    near(abs(dtft(hann, 2 * PI / L)[0]), L / 4, 1e-9) and abs(dtft(hann, 4 * PI / L)[0]) < 1e-9)
wf = np.linspace(1e-4, 0.95 * 4 * PI / L, 20001)
chk("6.5 Hann has no zero between 0 and 4pi/L (L = 32)", np.abs(dtft(hann, wf)).min() > 0.1,
    f"min {np.abs(dtft(hann, wf)).min():.3f}")
chk("6.5 cosine window: X = W(w-w0)/2 + W(w+w0)/2 (w0 = pi/4, L = 16)",
    np.allclose(dtft(np.cos(PI / 4 * np.arange(16)), ww),
                0.5 * dtft(np.ones(16), ww - PI / 4) + 0.5 * dtft(np.ones(16), ww + PI / 4)))
chk("6.5 20 log10(0.01) = -40 dB, 20 log10(0.001) = -60 dB",
    near(20 * np.log10(0.01), -40, 1e-12) and near(20 * np.log10(0.001), -60, 1e-12))
chk("6.5 spectrogram: Hann main lobe 8pi/L is pi/4 at L = 32 and pi/8 at L = 64",
    near(8 * PI / 32, PI / 4, 1e-12) and near(8 * PI / 64, PI / 8, 1e-12))

# ---------------------------------------------------------------- 6.6
H = lambda v: 2 / (1 - 0.75 * np.exp(-1j * v) + 0.125 * np.exp(-2j * v))
chk("Ex 6.18 |H| = 5.3333 at 0 and 1.0667 at pi", near(abs(H(0)), 5.3333) and near(abs(H(PI)), 1.0667))
h = [4 * 0.5 ** k - 2 * 0.25 ** k for k in range(3)]
chk("Ex 6.18 h[0..2] = 2, 1.5, 0.875", np.allclose(h, [2, 1.5, 0.875]))
chk("6.6 y[n] - y[n-1]/2 = x[n] + x[n-1]: H(e^{j pi}) = 0", abs((1 + np.exp(-1j * PI)) / (1 - 0.5 * np.exp(-1j * PI))) < 1e-15)
ww = np.linspace(-3, 3, 41)
a = 0.25
chk("6.6 n a^n u[n] + a^n u[n] transforms to 1/(1 - a e^{-jw})^2",
    np.allclose(a * np.exp(-1j * ww) / (1 - a * np.exp(-1j * ww)) ** 2 + 1 / (1 - a * np.exp(-1j * ww)),
                1 / (1 - a * np.exp(-1j * ww)) ** 2))
chk("6.6 repeated pole a = 1/4 at w=0: 16/9 = 1.7778; plus sign 0.64",
    near((1 - 0.25) ** -2, 1.7778) and near((1.25) ** -2, 0.64, 1e-12))
from math import comb
nn = np.arange(400)
chk("6.6 pole of order r = 3: C(n+2, 2) a^n u[n] <-> 1/(1 - a e^{-jw})^3 (a = 0.6)",
    np.allclose(dtft(np.array([comb(k + 2, 2) for k in nn]) * 0.6 ** nn, ww), 1 / (1 - 0.6 * np.exp(-1j * ww)) ** 3, atol=1e-8))
g1 = np.zeros(60); g2 = np.zeros(60)
for k in range(60):
    g1[k] = (1.0 if k == 0 else 0.0) + (0.8 * g1[k - 1] if k else 0)
    g2[k] = g1[k] + (0.8 * g2[k - 1] if k else 0)
chk("6.6 two identical stages y[n] = a y[n-1] + x[n] have impulse response (n+1) a^n u[n]",
    np.allclose(g2, (np.arange(60) + 1) * 0.8 ** np.arange(60)))
yo = [-4 * 0.25 ** k - 2 * (k + 1) * 0.25 ** k + 8 * 0.5 ** k for k in range(4)]
hh = np.array([4 * 0.5 ** k - 2 * 0.25 ** k for k in range(40)])
yc = np.convolve(hh, 0.25 ** np.arange(40))[:4]
chk("Ex 6.19 y[0..3] = 2, 2, 1.375, 0.8125 and match direct convolution",
    np.allclose(yo, [2, 2, 1.375, 0.8125]) and np.allclose(yo, yc))
chk("Ex 6.19 |Y| = 7.1111 at 0 and 0.8533 at pi",
    near(2 / (0.5 * 0.75 ** 2), 7.1111) and near(2 / (1.5 * 1.25 ** 2), 0.8533))
for al in (0.5, 0.8):
    ww = np.linspace(-PI, PI, 60001)
    E = np.abs(1 + al * np.exp(-1j * ww * 3))
    chk(f"Ex 6.20 echo alpha = {al}: |H| between {1 - al:.1f} and {1 + al:.1f}; inverse between {1 / (1 + al):.4f} and {1 / (1 - al):.4f}",
        near(E.max(), 1 + al, 1e-9) and near(E.min(), 1 - al, 1e-6))
D, al = 3, 0.5
x = np.random.default_rng(1).normal(size=60)
y = x + al * np.concatenate([np.zeros(D), x[:-D]])
wv = np.zeros_like(y)
for k in range(len(y)):
    wv[k] = y[k] - (al * wv[k - D] if k >= D else 0)
chk("Ex 6.20 the recursion w[n] = y[n] - alpha w[n-D] returns x[n]", np.allclose(wv, x))
imp = np.zeros(30); imp[0] = 1
g = np.zeros(30)
for k in range(30):
    g[k] = imp[k] - (al * g[k - D] if k >= D else 0)
chk("Ex 6.20 its impulse response is (-alpha)^k at n = kD", np.allclose(g[::D], (-al) ** np.arange(10)) and
    np.allclose(np.delete(g, np.arange(0, 30, D)), 0))
chk("Ex 6.20 alpha = 0.8: inverse between 1/1.8 = 0.5556 and 1/0.2 = 5", near(1 / 1.8, 0.5556) and near(1 / 0.2, 5, 1e-12))
chk("Ex 6.20 alpha = 1/2: inverse swings between 2/3 and 2", near(1 / 1.5, 2 / 3, 1e-12) and near(1 / 0.5, 2, 1e-12))
chk("6.6 y[n] - (5/6) y[n-1] + (1/6) y[n-2]: factors 1/2 and 1/3",
    near(0.5 + 1 / 3, 5 / 6, 1e-12) and near(0.5 / 3, 1 / 6, 1e-12))

p, f = sum(res), len(res) - sum(res)
print(f"{p} passed, {f} failed")
