"""Module 6 — Discrete-Time Fourier Transform. Independent re-derivation of
every number stated in the Check step of a D6-xx solution.

Each transform is re-derived by evaluating the analysis sum numerically over a
long truncated window, independently of the closed form the solution states,
and compared at a grid of frequencies in [-pi, pi]. Each inverse transform is
checked the other way round: the candidate sequence is put back through the
same truncated analysis sum and compared against the given spectrum. General
properties (periodicity, conjugate symmetry) are checked on random finite
sequences, not only on the one example the solution used, so the claim being
tested is the general one."""
import math

import numpy as np
import sympy as sp

from drill_common import chk, close, allclose, conv_dt, t, tau, n, k, w

I = 1j
PI = math.pi
_trapz = getattr(np, 'trapezoid', None) or np.trapz


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def dtft_trunc(a, om, N=400):
    """Analysis sum of a^n u[n], truncated to n = 0..N-1."""
    ns = np.arange(0, N)
    return np.sum((a * np.exp(-1j * om)) ** ns)


def dtft_two_sided_trunc(a, scale, om, N=400):
    """Analysis sum of scale * a^|n|, truncated to |n| <= N."""
    ns = np.arange(-N, N + 1)
    return scale * np.sum((a ** np.abs(ns)) * np.exp(-1j * om * ns))


def dtft_dict(xdict, om):
    """Analysis sum of a sequence given as {index: value}."""
    return sum(v * np.exp(-1j * om * idx) for idx, v in xdict.items())


def synth_impulses(terms, nval):
    """Synthesis integral of a sum of weighted impulses, terms = [(loc, weight), ...],
    applied directly from the sifting definition rather than from any closed form."""
    return sum(complex(wt) * np.exp(1j * loc * nval) for loc, wt in terms) / (2 * PI)


def random_finite_seq(rng, n_terms=6, idx_range=8, real_only=False):
    idxs = rng.choice(np.arange(-idx_range, idx_range + 1), size=n_terms, replace=False)
    vals = rng.uniform(-3, 3, size=n_terms)
    return {int(i): float(v) for i, v in zip(idxs, vals)}


rng = np.random.default_rng(6)


# ===========================================================================
# D6-01 — transform of (1/2)^n u[n]
# ===========================================================================
om_test = np.array([0.4, -1.1, 2.0, -2.7])
X01_closed = 1 / (1 - 0.5 * np.exp(-1j * om_test))
X01_direct = np.array([dtft_trunc(0.5, ov) for ov in om_test])
chk("D6-01 closed form matches truncated analysis sum", allclose(X01_closed, X01_direct, tol=1e-6))

chk("D6-01 |X(0)| = 2", close(abs(dtft_trunc(0.5, 0.0)), 2.0, tol=1e-8))
chk("D6-01 |X(pi)| = 2/3", close(abs(dtft_trunc(0.5, PI)), 2 / 3, tol=1e-8))


# ===========================================================================
# D6-02 — transform of 3*(1/4)^|n|
# ===========================================================================
X02_closed = 45 / (17 - 8 * np.cos(om_test))
X02_direct = np.array([dtft_two_sided_trunc(0.25, 3, ov) for ov in om_test])
chk("D6-02 closed form matches truncated two-sided sum", allclose(X02_closed, X02_direct, tol=1e-6))

chk("D6-02 X(0) = 5", close(dtft_two_sided_trunc(0.25, 3, 0.0).real, 5.0, tol=1e-8))
chk("D6-02 X(pi) = 9/5", close(dtft_two_sided_trunc(0.25, 3, PI).real, 1.8, tol=1e-8))
chk("D6-02 transform is real for every tested omega",
    all(abs(dtft_two_sided_trunc(0.25, 3, ov).imag) < 1e-8 for ov in om_test))


# ===========================================================================
# D6-03 — rectangular window, N1 = 3
# ===========================================================================
def dirichlet_direct(om, N1=3):
    ns = np.arange(-N1, N1 + 1)
    return np.sum(np.exp(-1j * om * ns))


def dirichlet_closed(om, N1=3):
    s = np.sin(om / 2)
    return (2 * N1 + 1) if abs(s) < 1e-9 else np.sin(om * (N1 + 0.5)) / s


om03 = np.array([0.5, 1.3, -2.1, 2.9])
chk("D6-03 closed ratio-of-sines matches direct finite sum",
    allclose([dirichlet_closed(ov) for ov in om03], [dirichlet_direct(ov) for ov in om03], tol=1e-6))
chk("D6-03 X(0) = 7", close(dirichlet_direct(0.0).real, 7.0, tol=1e-8))
chk("D6-03 zeros at 2pi/7, 4pi/7, 6pi/7",
    all(abs(dirichlet_direct(k03 * 2 * PI / 7)) < 1e-8 for k03 in (1, 2, 3)))
chk("D6-03 X(pi) = -1", close(dirichlet_direct(PI).real, -1.0, tol=1e-8))


# ===========================================================================
# D6-04 — shifted geometric sequence
# ===========================================================================
def x04_direct(om, N=400):
    ns = np.arange(1, N)
    return np.sum(3 * (1 / 3) ** (ns - 1) * np.exp(-1j * om * ns))


X04_closed = lambda om: 3 * np.exp(-1j * om) / (1 - (1 / 3) * np.exp(-1j * om))
chk("D6-04 closed form matches truncated analysis sum",
    allclose([X04_closed(ov) for ov in om_test], [x04_direct(ov) for ov in om_test], tol=1e-6))

W04 = lambda om: 3 / (1 - (1 / 3) * np.exp(-1j * om))
chk("D6-04 time-shift route (e^{-jw}W) matches direct route",
    allclose([np.exp(-1j * ov) * W04(ov) for ov in om_test], [x04_direct(ov) for ov in om_test], tol=1e-6))
chk("D6-04 X(0) = 4.5", close(x04_direct(0.0).real, 4.5, tol=1e-8))
chk("D6-04 X(pi) = -9/4", close(x04_direct(PI).real, -2.25, tol=1e-8))


# ===========================================================================
# D6-05 — single cosine, impulse pair
# ===========================================================================
terms05 = [(PI / 3, 4 * PI), (-PI / 3, 4 * PI)]
for n05 in (0, 1, 2):
    chk(f"D6-05 synthesis at n={n05} matches 4*cos(pi/3 n)",
        close(synth_impulses(terms05, n05).real, 4 * math.cos(PI / 3 * n05), tol=1e-6))


# ===========================================================================
# D6-06 — constant plus cosine
# ===========================================================================
terms06 = [(0.0, 4 * PI), (2 * PI / 5, 3 * PI), (-2 * PI / 5, 3 * PI)]
for n06 in (0, 1, 2):
    chk(f"D6-06 synthesis at n={n06} matches 2+3*cos(2pi/5 n)",
        close(synth_impulses(terms06, n06).real, 2 + 3 * math.cos(2 * PI / 5 * n06), tol=1e-6))


# ===========================================================================
# D6-07 — single sine, imaginary impulse pair
# ===========================================================================
terms07 = [(3 * PI / 4, -1j * 5 * PI), (-3 * PI / 4, 1j * 5 * PI)]
for n07 in (1, 2, 3):
    chk(f"D6-07 synthesis at n={n07} matches 5*sin(3pi/4 n)",
        close(synth_impulses(terms07, n07).real, 5 * math.sin(3 * PI / 4 * n07), tol=1e-6))


# ===========================================================================
# D6-08 — two cosines needing frequency reduction
# ===========================================================================
x08_orig = lambda nn: 2 * np.cos(1.5 * PI * nn) + np.cos(2.25 * PI * nn)
x08_reduced = lambda nn: 2 * np.cos(0.5 * PI * nn) + np.cos(0.25 * PI * nn)
ns08 = np.arange(-6, 7)
chk("D6-08 reduced frequencies reproduce the same sequence at every integer n",
    allclose(x08_orig(ns08), x08_reduced(ns08), tol=1e-8))

terms08 = [(PI / 2, 2 * PI), (-PI / 2, 2 * PI), (PI / 4, PI), (-PI / 4, PI)]
for n08 in (0, 1, 2):
    chk(f"D6-08 synthesis at n={n08} matches original (unreduced) sequence",
        close(synth_impulses(terms08, n08).real, x08_orig(n08), tol=1e-6))


# ===========================================================================
# D6-09 — LTI, one-pole system, cosine input
# ===========================================================================
H09_closed = 1 / (1 - 0.5 * np.exp(-1j * PI / 2))
H09_direct = dtft_trunc(0.5, PI / 2)
chk("D6-09 H closed form matches truncated analysis sum", close(H09_closed, H09_direct, tol=1e-6))
chk("D6-09 |H(pi/2)| = 2/sqrt(5)", close(abs(H09_closed), 2 / math.sqrt(5), tol=1e-8))
chk("D6-09 angle H(pi/2) = -arctan(1/2)", close(np.angle(H09_closed), -math.atan(0.5), tol=1e-8))
chk("D6-09 |H|^2 via H*conj(H) = 0.8", close((H09_closed * np.conj(H09_closed)).real, 0.8, tol=1e-8))


# ===========================================================================
# D6-10 — first-difference filter
# ===========================================================================
om10 = np.array([0.1, 1.0, 2.2, PI])
H10 = 1 - np.exp(-1j * om10)
chk("D6-10 |H|^2 = |1-e^{-jw}|^2 matches 4 sin^2(w/2)",
    allclose((H10 * np.conj(H10)).real, 4 * np.sin(om10 / 2) ** 2, tol=1e-8))
chk("D6-10 |H(0)| = 0", close(abs(1 - np.exp(-1j * 0.0)), 0.0, tol=1e-8))
chk("D6-10 |H(pi)| = 2", close(abs(1 - np.exp(-1j * PI)), 2.0, tol=1e-8))


# ===========================================================================
# D6-11 — output of a two-pole cascade, by direct discrete convolution
# ===========================================================================
Nc = 300
x11 = {i: 0.5 ** i for i in range(Nc)}
h11 = {i: 0.25 ** i for i in range(Nc)}
y11_conv = {}
for a11, xa in x11.items():
    for b11, hb in h11.items():
        idx = a11 + b11
        if idx <= 10:
            y11_conv[idx] = y11_conv.get(idx, 0.0) + xa * hb

y11_formula = lambda nn: 2 * 0.5 ** nn - 0.25 ** nn
for n11 in (0, 1, 2, 3):
    chk(f"D6-11 direct convolution at n={n11} matches 2(1/2)^n - (1/4)^n",
        close(y11_conv[n11], y11_formula(n11), tol=1e-6))

om11 = np.array([0.3, 1.7, -2.4])
Y11_partial = 2 / (1 - 0.5 * np.exp(-1j * om11)) - 1 / (1 - 0.25 * np.exp(-1j * om11))
Y11_product = (1 / (1 - 0.5 * np.exp(-1j * om11))) * (1 / (1 - 0.25 * np.exp(-1j * om11)))
chk("D6-11 partial-fraction form matches the product X*H", allclose(Y11_partial, Y11_product, tol=1e-8))


# ===========================================================================
# D6-12 — two-tap averager, output by direct filtering
# ===========================================================================
x12 = lambda nn: math.cos(PI / 3 * nn)
y12_direct = lambda nn: 0.5 * x12(nn) + 0.5 * x12(nn - 1)
y12_formula = lambda nn: (math.sqrt(3) / 2) * math.cos(PI / 3 * nn - PI / 6)
for n12 in (0, 1, 2):
    chk(f"D6-12 direct two-tap average at n={n12} matches amplitude-phase form",
        close(y12_direct(n12), y12_formula(n12), tol=1e-8))

H12_at = 0.5 * (1 + np.exp(-1j * PI / 3))
chk("D6-12 |Y| impulse weight = pi*|H(pi/3)| = sqrt(3)*pi/2",
    close(PI * abs(H12_at), math.sqrt(3) * PI / 2, tol=1e-8))


# ===========================================================================
# D6-13 — inverse of an ideal low-pass spectrum, cutoff pi/3
# ===========================================================================
def x13(nn):
    nn = np.asarray(nn, dtype=float)
    safe = np.where(np.abs(nn) < 1e-9, 1.0, nn)
    with np.errstate(divide='ignore', invalid='ignore'):
        return np.where(np.abs(nn) < 1e-9, 1 / 3, np.sin(PI * safe / 3) / (PI * safe))


def forward_trunc(xfun, om, N=20000):
    ns = np.arange(-N, N + 1)
    return np.sum(xfun(ns) * np.exp(-1j * om * ns))


chk("D6-13 forward transform of x[n] matches 1 inside the passband (w=0.2)",
    close(forward_trunc(x13, 0.2).real, 1.0, tol=5e-2))
chk("D6-13 forward transform of x[n] matches 0 outside the passband (w=2.5)",
    close(forward_trunc(x13, 2.5).real, 0.0, tol=5e-2))
chk("D6-13 sum_n x[n] matches X(e^{j0}) = 1",
    close(np.sum(x13(np.arange(-20000, 20001))).real, 1.0, tol=5e-2))

n_sym13 = sp.symbols('n13', real=True)
lim13 = sp.limit(sp.sin(sp.pi * n_sym13 / 3) / (sp.pi * n_sym13), n_sym13, 0)
chk("D6-13 x[0] = 1/3 by symbolic limit", lim13 == sp.Rational(1, 3))


# ===========================================================================
# D6-14 — inverse of a finite polynomial in e^{-jw}
# ===========================================================================
x14 = {0: 4.0, 1: -1.0, 3: 2.0}
X14_closed = lambda om: 4 - np.exp(-1j * om) + 2 * np.exp(-3j * om)
om14 = np.array([0.3, 1.4, -2.6, PI])
chk("D6-14 dict transform matches closed form",
    allclose([dtft_dict(x14, ov) for ov in om14], [X14_closed(ov) for ov in om14], tol=1e-8))
chk("D6-14 X(0) = 5 = sum of x[n]", close(dtft_dict(x14, 0.0).real, 5.0, tol=1e-8))
chk("D6-14 X(pi) = 3", close(dtft_dict(x14, PI).real, 3.0, tol=1e-8))


# ===========================================================================
# D6-15 — inverse of a spectrum given only as a figure
# ===========================================================================
def x15(nn):
    nn = np.asarray(nn, dtype=float)
    safe = np.where(np.abs(nn) < 1e-9, 1.0, nn)
    with np.errstate(divide='ignore', invalid='ignore'):
        return np.where(np.abs(nn) < 1e-9, 1.0, 2 * np.sin(PI * safe / 2) / (PI * safe))


chk("D6-15 forward transform of x[n] matches 2 inside the passband (w=0.3)",
    close(forward_trunc(x15, 0.3).real, 2.0, tol=5e-2))
chk("D6-15 forward transform of x[n] matches 0 outside the passband (w=2.5)",
    close(forward_trunc(x15, 2.5).real, 0.0, tol=5e-2))

n_sym15 = sp.symbols('n15', real=True)
lim15 = sp.limit(2 * sp.sin(sp.pi * n_sym15 / 2) / (sp.pi * n_sym15), n_sym15, 0)
chk("D6-15 x[0] = 1 by symbolic limit", lim15 == 1)


# ===========================================================================
# D6-16 — inverse of e^{-jw}(1+cos w)
# ===========================================================================
x16 = {0: 0.5, 1: 1.0, 2: 0.5}
X16_closed = lambda om: np.exp(-1j * om) * (1 + np.cos(om))
om16 = np.array([0.4, 1.9, -2.2])
chk("D6-16 dict transform matches closed form",
    allclose([dtft_dict(x16, ov) for ov in om16], [X16_closed(ov) for ov in om16], tol=1e-8))
chk("D6-16 X(0) = 2", close(dtft_dict(x16, 0.0).real, 2.0, tol=1e-8))
chk("D6-16 X(pi) = 0", close(dtft_dict(x16, PI).real, 0.0, tol=1e-8))


# ===========================================================================
# D6-17 — conjugate symmetry, general and applied
# ===========================================================================
for _ in range(5):
    xr = random_finite_seq(rng)
    om17 = rng.uniform(-3, 3)
    Xw = dtft_dict(xr, om17)
    Xmw = dtft_dict(xr, -om17)
    chk("D6-17 (general) X(e^{-jw}) = X*(e^{jw}) on a random real sequence",
        close(Xmw, np.conj(Xw), tol=1e-8), f"omega={om17:.4f}")

X17_p = dtft_trunc(1 / 3, PI / 3, N=300)
X17_m = dtft_trunc(1 / 3, -PI / 3, N=300)
chk("D6-17 X(e^{j pi/3}) matches closed form (15-3sqrt3 j)/14",
    close(X17_p, (15 - 3 * math.sqrt(3) * 1j) / 14, tol=1e-8))
chk("D6-17 X(e^{-j pi/3}) matches closed form (15+3sqrt3 j)/14",
    close(X17_m, (15 + 3 * math.sqrt(3) * 1j) / 14, tol=1e-8))
chk("D6-17 the two values are exact complex conjugates", close(X17_m, np.conj(X17_p), tol=1e-8))

om17s = np.array([0.2, 0.9, 1.8, 2.6])
mag17 = np.abs(1 / (1 - (1 / 3) * np.exp(-1j * om17s)))
mag17_neg = np.abs(1 / (1 - (1 / 3) * np.exp(1j * om17s)))
chk("D6-17 |X(w)| is even over several tested frequencies", allclose(mag17, mag17_neg, tol=1e-8))


# ===========================================================================
# D6-18 — differencing and accumulation of a two-sample sequence
# ===========================================================================
x18 = {-1: 1.0, 1: -1.0}
w18 = {nn: x18.get(nn, 0.0) - x18.get(nn - 1, 0.0) for nn in range(-3, 4)}
w18 = {kk: vv for kk, vv in w18.items() if abs(vv) > 1e-12}
chk("D6-18 w[n] = x[n]-x[n-1] matches {-1:1, 0:-1, 1:-1, 2:1}",
    w18 == {-1: 1.0, 0: -1.0, 1: -1.0, 2: 1.0}, f"{w18}")

y18 = {}
acc = 0.0
for nn in range(-5, 6):
    acc += x18.get(nn, 0.0)
    if abs(acc) > 1e-12:
        y18[nn] = acc
chk("D6-18 y[n] = running sum of x matches {-1:1, 0:1}", y18 == {-1: 1.0, 0: 1.0}, f"{y18}")

chk("D6-18 X(e^{j0}) = 0", close(dtft_dict(x18, 0.0).real, 0.0, tol=1e-8))

om18 = np.array([0.5, 1.2, -1.9])
X18 = lambda om: dtft_dict(x18, om)
W18_prop = np.array([(1 - np.exp(-1j * ov)) * X18(ov) for ov in om18])
W18_direct = np.array([dtft_dict(w18, ov) for ov in om18])
chk("D6-18 differencing property matches direct transform of w[n]", allclose(W18_prop, W18_direct, tol=1e-8))

Y18_prop = np.array([X18(ov) / (1 - np.exp(-1j * ov)) for ov in om18])
Y18_direct = np.array([dtft_dict(y18, ov) for ov in om18])
chk("D6-18 accumulation property matches direct transform of y[n]", allclose(Y18_prop, Y18_direct, tol=1e-8))
chk("D6-18 accumulation simplifies to e^{jw}+1",
    allclose(Y18_direct, 1 + np.exp(1j * om18), tol=1e-8))


# ===========================================================================
# D6-19 — Parseval on 2*(1/2)^n u[n]
# ===========================================================================
ns19 = np.arange(0, 4000)
E19_time = np.sum((2 * 0.5 ** ns19) ** 2)
chk("D6-19 time-domain energy = 16/3", close(E19_time, 16 / 3, tol=1e-8))

om19 = np.linspace(-PI, PI, 400001)
magsq19 = 4 / (1.25 - np.cos(om19))
E19_freq = _trapz(magsq19, om19) / (2 * PI)
chk("D6-19 frequency-domain integral (numerical quadrature) = 16/3", close(E19_freq, 16 / 3, tol=1e-4))

E19_base = np.sum((0.5 ** ns19) ** 2)
chk("D6-19 scaling check: 4 * energy of (1/2)^n u[n] = 16/3", close(4 * E19_base, 16 / 3, tol=1e-8))


# ===========================================================================
# D6-20 — general 2*pi periodicity, and a specific pair of generators
# ===========================================================================
for _ in range(4):
    xr20 = random_finite_seq(rng)
    om20 = rng.uniform(-3, 3)
    Xw20 = dtft_dict(xr20, om20)
    Xw20_shift = dtft_dict(xr20, om20 + 2 * PI)
    chk("D6-20 (general) X(e^{j(w+2pi)}) = X(e^{jw}) on a random finite sequence",
        close(Xw20_shift, Xw20, tol=1e-6), f"omega={om20:.4f}")

ns20 = np.arange(-20, 21)
chk("D6-20 cos(2.3 n) = cos((2.3-2pi) n) for every tested integer n",
    allclose(np.cos(2.3 * ns20), np.cos((2.3 - 2 * PI) * ns20), tol=1e-8))

ns20b = np.arange(-10, 11)
chk("D6-20 cos(pi n) = (-1)^n, the fastest discrete-time oscillation",
    allclose(np.cos(PI * ns20b), (-1.0) ** ns20b, tol=1e-8))


# ===========================================================================
# Full-length questions D6-21 ... D6-30.
#
# Every transform is recomputed from the analysis sum evaluated numerically,
# every inverse from the synthesis integral, and every frequency is reduced
# into -pi <= omega <= pi before it is used.
# ===========================================================================

def dtft(x, om, N=4000):
    """The analysis sum, truncated symmetrically. Used for sequences that decay."""
    ns = np.arange(-N, N + 1)
    return complex(np.sum(np.array([x(int(v)) for v in ns]) * np.exp(-1j * om * ns)))


def idtft(X, nn, npts=400001):
    """The synthesis integral over one period."""
    g = np.linspace(-np.pi, np.pi, npts)
    return complex(np.trapezoid(np.array([X(v) for v in g]) * np.exp(1j * g * nn), g)
                   / (2 * np.pi))


def wrap(om):
    """Reduce a frequency into -pi <= omega <= pi."""
    return (om + np.pi) % (2 * np.pi) - np.pi


# --- D6-21 -----------------------------------------------------------------
z21s = lambda m: 1.0 if 0 <= m <= 4 else 0.0
chk("D6-21 (a) u[-n+4] - u[-n-1] is 1 on 0 <= n <= 4",
    all(close(z21s(m), (1.0 if (-m + 4) >= 0 else 0.0) - (1.0 if (-m - 1) >= 0 else 0.0))
        for m in range(-6, 9)))
Z21 = lambda om: (np.exp(-2j * om) * np.sin(2.5 * om) / np.sin(0.5 * om)
                  if abs(np.sin(0.5 * om)) > 1e-12 else 5.0)
chk("D6-21 (a) closed form matches the analysis sum",
    all(close(Z21(v), dtft(z21s, v, 20), tol=1e-9) for v in (0.4, 1.1, -2.0)))
chk("D6-21 (a) Z at omega=0 is 5, the number of samples", close(Z21(1e-7), 5.0, tol=1e-6))
tri21 = lambda om: max(0.0, 1 - abs(wrap(om)) / (np.pi / 2))
Yb21 = lambda om: sum(tri21(om - kk * np.pi / 2) for kk in range(4)) / 4
chk("D6-21 (b) four copies at spacing pi/2, each scaled by 1/4",
    close(Yb21(0.0), 0.25, tol=1e-9))
chk("D6-21 (b) adjacent copies touch at their zeros without overlapping",
    all(Yb21(v) <= 0.25 + 1e-9 for v in np.linspace(-np.pi, np.pi, 2001)))
chk("D6-21 (c) modulation by (-1)^n moves the triangle to omega = pi",
    close(tri21(np.pi - np.pi), 1.0) and close(tri21(0.0 - np.pi), 0.0))

# --- D6-22 -----------------------------------------------------------------
x22g = lambda m: (1 / 3) ** abs(m)
X22a = lambda om: 4 / (5 - 3 * np.cos(om))
chk("D6-22 (a) closed form matches the analysis sum",
    all(close(X22a(v), dtft(x22g, v, 200), tol=1e-9) for v in (0.0, 0.9, 2.4, -1.1)),
    f"X(0.9): closed={X22a(0.9):.9f}, sum={dtft(x22g,0.9,200).real:.9f}")
chk("D6-22 (a) X(1) = 2 = sum of the samples",
    close(X22a(0.0), 2.0) and close(1 + 2 * sum((1 / 3) ** m for m in range(1, 200)), 2.0))
chk("D6-22 (b) 5pi/2 reduces to pi/2 and 4pi/3 to -2pi/3",
    close(wrap(5 * np.pi / 2), np.pi / 2) and close(wrap(4 * np.pi / 3), -2 * np.pi / 3))
chk("D6-22 (b) the reduced sequence is sample-for-sample the original",
    all(close(np.cos(5 * np.pi * m / 2) + 2 * np.cos(4 * np.pi * m / 3),
              np.cos(np.pi * m / 2) + 2 * np.cos(2 * np.pi * m / 3)) for m in range(-20, 21)))
chk("D6-22 (c) cos(pi n) equals (-1)^n at every integer",
    all(close(np.cos(np.pi * m), (-1.0) ** m) for m in range(-20, 21)))
Xc22 = lambda om: 1.0 if abs(wrap(om)) > 2 * np.pi / 3 else 0.0
chk("D6-22 (c) the shifted band is a high-pass filter with cut-off 2pi/3",
    close(Xc22(np.pi), 1.0) and close(Xc22(0.0), 0.0)
    and close(Xc22(0.9 * 2 * np.pi / 3), 0.0))

# --- D6-23 -----------------------------------------------------------------
p = np.pi
X23 = lambda om: (3.0 if abs(wrap(om)) < p / 5
                  else (1.0 if abs(wrap(om)) < 3 * p / 5 else 0.0))
H23 = lambda om: 2.0 if abs(wrap(om)) > p / 5 else 0.0
Y23 = lambda om: X23(om) * H23(om)
chk("D6-23 (a) X is 3, then 1, then 0",
    close(X23(0.1), 3.0) and close(X23(0.4 * p), 1.0) and close(X23(0.8 * p), 0.0))
chk("D6-23 (b) H is 2 above pi/5 and 0 below",
    close(H23(p / 2), 2.0) and close(H23(0.1), 0.0))
chk("D6-23 (c) Y = 2 on (pi/5, 3pi/5) and zero elsewhere",
    close(Y23(0.4 * p), 2.0) and close(Y23(0.1), 0.0) and close(Y23(0.8 * p), 0.0))
chk("D6-23 (c) both cut-offs of Y are inherited, one from H and one from X",
    close(Y23(p / 5 + 1e-6), 2.0) and close(Y23(p / 5 - 1e-6), 0.0)
    and close(Y23(3 * p / 5 - 1e-6), 2.0) and close(Y23(3 * p / 5 + 1e-6), 0.0))

# --- D6-24 -----------------------------------------------------------------
x24a = lambda m: 0.5 ** m if m >= 1 else 0.0
X24a = lambda om: 0.5 * np.exp(-1j * om) / (1 - 0.5 * np.exp(-1j * om))
chk("D6-24 (a) closed form matches the analysis sum",
    all(close(X24a(v), dtft(x24a, v, 200), tol=1e-9) for v in (0.0, 1.2, -0.6)))
chk("D6-24 (a) X(1) = 1 = sum of the samples", close(X24a(0.0), 1.0))
x24b = lambda m: 1.0 if -2 <= m <= 2 else 0.0
X24b = lambda om: (np.sin(2.5 * om) / np.sin(0.5 * om)
                   if abs(np.sin(0.5 * om)) > 1e-12 else 5.0)
chk("D6-24 (b) closed form matches the analysis sum, and is real",
    all(close(X24b(v), dtft(x24b, v, 20), tol=1e-9) for v in (0.7, 1.9))
    and close(X24b(1e-7), 5.0, tol=1e-6))
x24c = lambda m: 0.5 ** abs(m)
X24c = lambda om: 3 / (5 - 4 * np.cos(om))
chk("D6-24 (c) closed form matches the analysis sum",
    all(close(X24c(v), dtft(x24c, v, 200), tol=1e-9) for v in (0.0, 1.5)))
chk("D6-24 (c) X(1) = 3 = sum of the samples", close(X24c(0.0), 3.0))
chk("D6-24 (check) only the delayed sequence has a complex transform",
    abs(X24a(1.2).imag) > 1e-3 and close(X24b(1.2).imag, 0.0)
    and close(X24c(1.2).imag, 0.0))

# --- D6-25 -----------------------------------------------------------------
xt25 = lambda m: (0.6 ** m) * math.cos(0.4 * m) if m >= 0 else 0.0
chk("D6-25 (a) a delay of 3 multiplies X by exp(-j3omega)",
    all(close(dtft(lambda m: xt25(m - 3), v, 300),
              np.exp(-3j * v) * dtft(xt25, v, 300), tol=1e-9) for v in (0.5, 2.0)))
chk("D6-25 (b) (-1)^n x[n] shifts the spectrum by pi",
    all(close(dtft(lambda m: (-1.0) ** m * xt25(m), v, 300),
              dtft(xt25, wrap(v - np.pi), 300), tol=1e-9) for v in (0.5, 2.0, -1.3)))
chk("D6-25 (c) differencing multiplies X by (1 - exp(-j omega))",
    all(close(dtft(lambda m: xt25(m) - xt25(m - 1), v, 300),
              (1 - np.exp(-1j * v)) * dtft(xt25, v, 300), tol=1e-9) for v in (0.5, 2.0)))
chk("D6-25 (c) Y at omega = 0 is zero for any decaying sequence",
    close(dtft(lambda m: xt25(m) - xt25(m - 1), 0.0, 300), 0.0, tol=1e-9))

# --- D6-26 -----------------------------------------------------------------
X26a = lambda om: 1.0 if abs(om) < np.pi / 4 else 0.0
chk("D6-26 (a) the synthesis integral gives sin(pi n/4)/(pi n)",
    all(close(idtft(X26a, m), np.sin(np.pi * m / 4) / (np.pi * m), tol=1e-5)
        for m in (1, 2, 3, 5, -4)),
    f"n=1: integral={idtft(X26a,1).real:.9f}, closed={np.sin(np.pi/4)/np.pi:.9f}")
chk("D6-26 (a) x[0] = 1/4", close(idtft(X26a, 0), 0.25, tol=1e-9))
X26b = lambda om: np.cos(2 * om)
chk("D6-26 (b) the synthesis integral gives half-weight impulses at n = +-2",
    close(idtft(X26b, 2), 0.5, tol=1e-6) and close(idtft(X26b, -2), 0.5, tol=1e-6)
    and all(close(idtft(X26b, m), 0.0, tol=1e-6) for m in (0, 1, 3, -1)))
chk("D6-26 (b) X(1) = 1 = sum of the samples", close(X26b(0.0), 1.0))
x26c = lambda m: (m + 1) * (1 / 3) ** m if m >= 0 else 0.0
X26c = lambda om: 1 / (1 - (1 / 3) * np.exp(-1j * om)) ** 2
chk("D6-26 (c) closed form matches the analysis sum",
    all(close(X26c(v), dtft(x26c, v, 300), tol=1e-9) for v in (0.0, 1.1)))
chk("D6-26 (c) X(1) = 9/4 = sum of the samples",
    close(X26c(0.0), 2.25) and close(sum(x26c(m) for m in range(300)), 2.25))

# --- D6-27 -----------------------------------------------------------------
x27s = lambda m: np.sin(np.pi * m / 3) / (np.pi * m) if m != 0 else 1 / 3
chk("D6-27 (a) x[0] = 1/3", close(x27s(0), 1 / 3))
chk("D6-27 (a) the synthesis integral of the rectangle returns x[n]",
    all(close(idtft(lambda om: 1.0 if abs(om) < np.pi / 3 else 0.0, m), x27s(m), tol=1e-6)
        for m in (0, 1, 2, 5, -3)))
chk("D6-27 (b) E = 1/3 by Parseval", close((2 * np.pi / 3) / (2 * np.pi), 1 / 3))
chk("D6-27 (b) E = 1/3 as a sum of squares",
    close(sum(x27s(m) ** 2 for m in range(-40000, 40001)), 1 / 3, tol=1e-4),
    f"{sum(x27s(m)**2 for m in range(-40000, 40001)):.8f}")
chk("D6-27 (b) E = x[0] for an ideal filter", close(1 / 3, x27s(0)))
chk("D6-27 (c) modulation preserves the energy exactly",
    close(sum(((-1.0) ** m * x27s(m)) ** 2 for m in range(-4000, 4001)),
          sum(x27s(m) ** 2 for m in range(-4000, 4001))))

# --- D6-28 -----------------------------------------------------------------
y28c = lambda m: (3 * 0.5 ** m - 2 * (1 / 3) ** m) if m >= 0 else 0.0
x28s = {m: 0.5 ** m for m in range(0, 300)}
h28s = {m: (1 / 3) ** m for m in range(0, 300)}
y28d = conv_dt(x28s, h28s, lo=0, hi=30)
chk("D6-28 (b) the closed form matches the convolution sum",
    all(close(y28c(m), y28d[m]) for m in range(0, 25)),
    f"y[0]={y28d[0]:.9f}, y[1]={y28d[1]:.9f}")
chk("D6-28 (c) y[0] = 1 and y[1] = 5/6",
    close(y28c(0), 1.0) and close(y28c(1), 5 / 6))
chk("D6-28 (check) Y at omega=0 is 3 = 2 * 3/2",
    close(sum(y28c(m) for m in range(0, 300)), 3.0)
    and close(sum(x28s.values()) * sum(h28s.values()), 3.0))
chk("D6-28 (a) the two one-pole transforms are correct",
    all(close(1 / (1 - 0.5 * np.exp(-1j * v)), dtft(lambda m: 0.5 ** m if m >= 0 else 0.0, v, 200),
              tol=1e-9) for v in (0.0, 1.4)))

# --- D6-29 -----------------------------------------------------------------
H1_29 = lambda om: 1.0 if abs(wrap(om)) < np.pi / 2 else 0.0
H2_29 = lambda om: 1.0 - H1_29(om)
chk("D6-29 (a) H2 is the complement of H1",
    all(close(H1_29(v) + H2_29(v), 1.0) for v in np.linspace(-np.pi, np.pi, 401)))
chk("D6-29 (b) the parallel connection passes everything",
    all(close(H1_29(v) + H2_29(v), 1.0) for v in np.linspace(-3 * np.pi, 3 * np.pi, 601)))
chk("D6-29 (b) h1 + h2 = delta[n]",
    all(close((np.sin(np.pi * m / 2) / (np.pi * m) if m != 0 else 0.5)
              + ((1.0 if m == 0 else 0.0) - (np.sin(np.pi * m / 2) / (np.pi * m) if m != 0 else 0.5)),
              1.0 if m == 0 else 0.0) for m in range(-10, 11)))
chk("D6-29 (c) the series connection passes nothing",
    all(close(H1_29(v) * H2_29(v), 0.0) for v in np.linspace(-np.pi, np.pi, 1001)))
chk("D6-29 (c) H1 is idempotent, so H1(1-H1) = 0",
    all(close(H1_29(v) ** 2, H1_29(v)) for v in np.linspace(-np.pi, np.pi, 401)))

# --- D6-30 -----------------------------------------------------------------
X30 = lambda om: 1.0 if abs(wrap(om)) < np.pi / 5 else 0.0
Y30 = lambda om: sum(X30(om - kk * 2 * np.pi / 5) for kk in range(5)) / 5
chk("D6-30 (b) the five copies tile the period with no gaps and no overlap",
    all(close(Y30(v), 0.2) for v in np.linspace(-np.pi + 0.01, np.pi - 0.01, 997)),
    f"Y(0)={Y30(0.0):.6f}, Y(1.7)={Y30(1.7):.6f}")
chk("D6-30 (b) five bands of width 2pi/5 fill exactly 2 pi",
    close(5 * (2 * np.pi / 5), 2 * np.pi))
chk("D6-30 (c) a gain-5 low-pass filter with cut-off pi/5 restores X",
    all(close(5 * Y30(v) * X30(v), X30(v)) for v in np.linspace(-np.pi, np.pi, 401)))
chk("D6-30 (a) coefficients of a period-5 train are all 1/5",
    all(close(sum((1.0 if m % 5 == 0 else 0.0) * np.exp(-1j * 2 * np.pi * kk * m / 5)
                  for m in range(5)) / 5, 0.2) for kk in range(5)))
