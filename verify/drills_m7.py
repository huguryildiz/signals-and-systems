"""Module 7 — Sampling and Aliasing. Independent re-derivation of every number
stated in the Check step of a D7-xx solution.

Every omega_M is re-derived from the signal itself, never by re-typing the
route the solution took: for a sum or a product of sinusoids, by sympy's own
product-to-sum expansion (TR8) rather than by hand-applied identities; for a
sinc-type signal, by a direct numerical Fourier integral that locates the
edge of the spectrum; for a product or a convolution of two band-limited
signals, by actually carrying out that operation numerically in the time
domain (an FFT-based convolution, or a plain pointwise product) and reading
the edge of the *result's* spectrum off an FFT — the multiplication/
convolution duality itself is never invoked. Where two frequencies are
claimed to alias onto each other, their sample sequences are compared
directly over a long run of n."""
import numpy as np
import sympy as sp
from sympy.simplify.fu import TR8

from drill_common import chk, close, allclose, t, tau, n, k, w

PI = np.pi
j = 1j


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def freqs_present(expr, tsym):
    """Every angular frequency present in a sum of sinusoids, found purely by
    sympy's product-to-sum expansion, plus whether a non-zero constant term
    is present."""
    e = TR8(sp.expand(expr))
    fs, dc = set(), False
    for term in sp.Add.make_args(sp.expand(e)):
        trigs = term.atoms(sp.cos, sp.sin)
        if not trigs:
            if sp.simplify(term) != 0:
                dc = True
            continue
        for atom in trigs:
            fs.add(sp.Abs(sp.diff(atom.args[0], tsym)))
    return fs, dc


def sinc_sig(W):
    """x(t) = sin(W t) / (pi t), the unnormalised-sinc lowpass of cutoff W."""
    def f(tt):
        tt = np.asarray(tt, dtype=float)
        safe = np.where(np.abs(tt) < 1e-12, 1.0, tt)
        out = np.sin(W * tt) / (PI * safe)
        return np.where(np.abs(tt) < 1e-12, W / PI, out)
    return f


def ft_scaled(f, wv, Wscale, Lfactor=1500, npts=1_500_001):
    """Numerical CTFT, X(jw) = int f(t) cos(w t) dt, windowed and resolved
    relative to a representative frequency scale of the problem."""
    lim = Lfactor / Wscale
    tt = np.linspace(-lim, lim, npts)
    return np.trapezoid(f(tt) * np.cos(wv * tt), tt)


def fft_conv_or_mul(W1, W2, mode, Lfactor=4000, N=1 << 21):
    """Realise x1, x2 as concrete unnormalised-sinc signals of cutoffs W1, W2,
    carry out the named time-domain operation on the actual sampled signals,
    and return the spectrum of the *result* read off an FFT. Never uses the
    multiplication/convolution-duality property that the question tests."""
    lim = Lfactor / min(W1, W2)
    dt = 2 * lim / N
    tt = -lim + dt * np.arange(N)
    x1, x2 = sinc_sig(W1)(tt), sinc_sig(W2)(tt)
    if mode == 'mul':
        y = x1 * x2
    else:
        y = np.fft.irfft(np.fft.rfft(x1) * np.fft.rfft(x2), n=N) * dt
        y = np.fft.fftshift(y)
    Y = np.fft.rfft(y) * dt
    freqs = 2 * PI * np.fft.rfftfreq(N, d=dt)
    return freqs, np.abs(Y)


def edge_ratio(freqs, mag, wv):
    idx = np.argmin(np.abs(freqs - wv))
    return mag[idx] / mag[0]


def tri_np(wv, wm, pk=1.0):
    wv = np.asarray(wv, dtype=float)
    return np.where(np.abs(wv) <= wm, pk * (1 - np.abs(wv) / wm), 0.0)


# ===========================================================================
# D7-01 — Nyquist rate of a sum of two cosines
# ===========================================================================
t01 = sp.symbols('t01', real=True)
x01 = sp.cos(40 * sp.pi * t01) + sp.cos(90 * sp.pi * t01)
fs01, dc01 = freqs_present(x01, t01)
wM01 = max(fs01)
chk("D7-01 frequencies present = {40pi, 90pi}", fs01 == {40 * sp.pi, 90 * sp.pi}, f"{fs01}")
chk("D7-01 wM = 90 pi rad/s", wM01 == 90 * sp.pi)
chk("D7-01 Nyquist rate = 180 pi rad/s = 90 Hz",
    close(2 * float(wM01), 180 * PI) and close(2 * float(wM01) / (2 * PI), 90))
chk("D7-01 T_max = pi/wM = 1/90 s", close(PI / float(wM01), 1 / 90))


# ===========================================================================
# D7-02 — Nyquist rate of a product of two cosines
# ===========================================================================
t02 = sp.symbols('t02', real=True)
x02 = sp.cos(30 * sp.pi * t02) * sp.cos(80 * sp.pi * t02)
fs02, dc02 = freqs_present(x02, t02)
wM02 = max(fs02)
chk("D7-02 product reduces to frequencies {50pi, 110pi}", fs02 == {50 * sp.pi, 110 * sp.pi}, f"{fs02}")
chk("D7-02 wM = 110 pi rad/s", wM02 == 110 * sp.pi)
chk("D7-02 Nyquist rate = 220 pi rad/s = 110 Hz",
    close(2 * float(wM02), 220 * PI) and close(float(wM02) * 2 / (2 * PI), 110))
chk("D7-02 wM is not 80 pi (neither original frequency survives)", 80 * sp.pi not in fs02)


# ===========================================================================
# D7-03 — Nyquist rate of a sine-times-cosine product
# ===========================================================================
t03 = sp.symbols('t03', real=True)
x03 = sp.sin(50 * sp.pi * t03) * sp.cos(30 * sp.pi * t03)
fs03, dc03 = freqs_present(x03, t03)
wM03 = max(fs03)
chk("D7-03 product reduces to frequencies {20pi, 80pi}", fs03 == {20 * sp.pi, 80 * sp.pi}, f"{fs03}")
chk("D7-03 wM = 80 pi rad/s", wM03 == 80 * sp.pi)
chk("D7-03 Nyquist rate = 160 pi rad/s = 80 Hz",
    close(2 * float(wM03), 160 * PI) and close(float(wM03) / PI, 80))


# ===========================================================================
# D7-04 — Nyquist rate of x(t) + x(t)^2
# ===========================================================================
t04 = sp.symbols('t04', real=True)
x04base = sp.cos(20 * sp.pi * t04) + sp.cos(70 * sp.pi * t04)
y04 = x04base + x04base ** 2
fs04, dc04 = freqs_present(y04, t04)
wM04 = max(fs04)
chk("D7-04 frequencies present = {0,20pi,40pi,50pi,70pi,90pi,140pi}",
    fs04 == {20 * sp.pi, 40 * sp.pi, 50 * sp.pi, 70 * sp.pi, 90 * sp.pi, 140 * sp.pi} and dc04,
    f"{fs04}, dc={dc04}")
chk("D7-04 wM = 140 pi rad/s", wM04 == 140 * sp.pi)
chk("D7-04 Nyquist rate = 280 pi rad/s = 140 Hz",
    close(2 * float(wM04), 280 * PI) and close(float(wM04) * 2 / (2 * PI), 140))
chk("D7-04 squaring doubles the bandwidth of x alone (70pi -> 140pi)",
    wM04 == 2 * 70 * sp.pi)


# ===========================================================================
# D7-05 — bandwidth of a plain sinc
# ===========================================================================
W05 = 300 * PI
sig05 = sinc_sig(W05)
val_peak05 = ft_scaled(sig05, 0.0, W05)
val_below05 = ft_scaled(sig05, 0.9 * W05, W05)
val_above05 = ft_scaled(sig05, 1.1 * W05, W05)
chk("D7-05 X(j0) = 1", close(val_peak05, 1.0, tol=0.01), f"{val_peak05:.5f}")
chk("D7-05 X(j*0.9*wM) is essentially 1 (inside the band)", close(val_below05, 1.0, tol=0.02), f"{val_below05:.5f}")
chk("D7-05 X(j*1.1*wM) is essentially 0 (outside the band)", abs(val_above05) < 0.01, f"{val_above05:.5f}")


# ===========================================================================
# D7-06 — bandwidth of a squared sinc (triangle)
# ===========================================================================
W06 = 100 * PI
sig06 = lambda tt: sinc_sig(W06)(tt) ** 2
peak06 = ft_scaled(sig06, 0.0, W06)
mid06 = ft_scaled(sig06, W06, W06)          # half-way to the edge 2*W06
below06 = ft_scaled(sig06, 1.9 * W06, W06)  # just inside 2*W06
above06 = ft_scaled(sig06, 2.1 * W06, W06)  # just past 2*W06
chk("D7-06 X(j0) = 100 (peak)", close(peak06, 100.0, tol=1.0), f"{peak06:.4f}")
chk("D7-06 X(j*wM_unsquared) = 50 (linear taper at the half-way point)",
    close(mid06, 50.0, tol=1.0), f"{mid06:.4f}")
chk("D7-06 just inside 2*100pi the spectrum is small but non-zero",
    0.5 < below06 < 15.0, f"{below06:.4f}")
chk("D7-06 just past 2*100pi = 200pi the spectrum is ~0", abs(above06) < 1.0, f"{above06:.4f}")


# ===========================================================================
# D7-07 — bandwidth of a sum of two sincs
# ===========================================================================
W1_07, W2_07 = 180 * PI, 500 * PI
sig07 = lambda tt: sinc_sig(W1_07)(tt) + sinc_sig(W2_07)(tt)
low07 = ft_scaled(sig07, 0.5 * W1_07, W2_07)
mid07 = ft_scaled(sig07, 0.5 * (W1_07 + W2_07), W2_07)
high07 = ft_scaled(sig07, 1.05 * W2_07, W2_07)
chk("D7-07 level = 2 for |w| < 180pi", close(low07, 2.0, tol=0.02), f"{low07:.5f}")
chk("D7-07 level = 1 for 180pi < |w| < 500pi", close(mid07, 1.0, tol=0.02), f"{mid07:.5f}")
chk("D7-07 level = 0 for |w| > 500pi", abs(high07) < 0.01, f"{high07:.5f}")
chk("D7-07 wM = 500pi is the wider term, not 180pi+500pi", 500 * PI < W1_07 + W2_07)


# ===========================================================================
# D7-08 — bandwidth of a squared sinc plus a plain sinc
# ===========================================================================
Wsq08, Wpl08 = 140 * PI, 90 * PI
sig08 = lambda tt: sinc_sig(Wsq08)(tt) ** 2 + sinc_sig(Wpl08)(tt)
below08 = ft_scaled(sig08, 0.9 * 2 * Wsq08, Wsq08)
above08 = ft_scaled(sig08, 1.05 * 2 * Wsq08, Wsq08)
chk("D7-08 just below 280pi the spectrum is clearly non-zero", below08 > 5.0, f"{below08:.4f}")
chk("D7-08 just above 280pi the spectrum is ~0", abs(above08) < 1.0, f"{above08:.4f}")
chk("D7-08 bandwidth is max(280pi, 90pi) = 280pi, not their sum 370pi",
    max(2 * Wsq08, Wpl08) == 2 * Wsq08 and 2 * Wsq08 != 2 * Wsq08 + Wpl08)


# ===========================================================================
# D7-09 / D7-10 — bandwidth after a convolution and after a product,
# realised numerically on concrete band-limited (sinc) signals
# ===========================================================================
W1_9, W2_9 = 70 * PI, 190 * PI
fr_conv, mg_conv = fft_conv_or_mul(W1_9, W2_9, 'conv')
fr_mul9, mg_mul9 = fft_conv_or_mul(W1_9, W2_9, 'mul')

chk("D7-09 wM(convolution) = min(70pi,190pi) = 70pi (arithmetic)", min(W1_9, W2_9) == 70 * PI)
chk("D7-09 numerically: below 70pi the convolution's spectrum is non-negligible",
    edge_ratio(fr_conv, mg_conv, 0.8 * W1_9) > 0.5,
    f"ratio={edge_ratio(fr_conv, mg_conv, 0.8*W1_9):.4f}")
chk("D7-09 numerically: above 70pi the convolution's spectrum is ~0",
    edge_ratio(fr_conv, mg_conv, 1.2 * W1_9) < 0.02,
    f"ratio={edge_ratio(fr_conv, mg_conv, 1.2*W1_9):.4f}")
chk("D7-09 Nyquist rate = 140pi rad/s = 70 Hz", close(2 * W1_9, 140 * PI))

chk("D7-10 wM(product) = 70pi+190pi = 260pi (arithmetic)", W1_9 + W2_9 == 260 * PI)
chk("D7-10 numerically: below 260pi the product's spectrum is non-negligible",
    edge_ratio(fr_mul9, mg_mul9, 0.85 * (W1_9 + W2_9)) > 0.05,
    f"ratio={edge_ratio(fr_mul9, mg_mul9, 0.85*(W1_9+W2_9)):.4f}")
chk("D7-10 numerically: above 260pi the product's spectrum is ~0",
    edge_ratio(fr_mul9, mg_mul9, 1.05 * (W1_9 + W2_9)) < 0.01,
    f"ratio={edge_ratio(fr_mul9, mg_mul9, 1.05*(W1_9+W2_9)):.4f}")
chk("D7-10 Nyquist rate = 520pi rad/s = 260 Hz", close(2 * (W1_9 + W2_9), 520 * PI))


# ===========================================================================
# D7-11 — bandwidth of a sinc modulated by a carrier
# ===========================================================================
W11, wc11 = 60 * PI, 400 * PI
sig11 = lambda tt: sinc_sig(W11)(tt) * np.cos(wc11 * tt)
origin11 = ft_scaled(sig11, 0.0, wc11)
inband11 = ft_scaled(sig11, wc11, wc11)
below_in11 = ft_scaled(sig11, 0.98 * (wc11 - W11), wc11)
above_in11 = ft_scaled(sig11, 1.02 * (wc11 - W11), wc11)
below_out11 = ft_scaled(sig11, 0.98 * (wc11 + W11), wc11)
above_out11 = ft_scaled(sig11, 1.02 * (wc11 + W11), wc11)
chk("D7-11 no energy near the origin", abs(origin11) < 0.01, f"{origin11:.5f}")
chk("D7-11 magnitude ~0.5 at the carrier itself", close(inband11, 0.5, tol=0.02), f"{inband11:.5f}")
chk("D7-11 just below the inner edge 340pi is ~0, just above it is ~0.5",
    abs(below_in11) < 0.03 and close(above_in11, 0.5, tol=0.05),
    f"{below_in11:.4f}, {above_in11:.4f}")
chk("D7-11 just below the outer edge 460pi is ~0.5, just above it is ~0",
    close(below_out11, 0.5, tol=0.05) and abs(above_out11) < 0.03,
    f"{below_out11:.4f}, {above_out11:.4f}")
chk("D7-11 wM = wc + W = 460pi rad/s, Nyquist rate 920pi rad/s = 460 Hz",
    close(wc11 + W11, 460 * PI) and close(2 * (wc11 + W11) / (2 * PI), 460))


# ===========================================================================
# D7-12 — bandwidth of a product, then a guard band
# ===========================================================================
W1_12, W2_12, wg12 = 50 * PI, 130 * PI, 20 * PI
fr_mul12, mg_mul12 = fft_conv_or_mul(W1_12, W2_12, 'mul')
wM12 = W1_12 + W2_12
chk("D7-12 wM(product) = 50pi+130pi = 180pi (arithmetic)", wM12 == 180 * PI)
chk("D7-12 numerically: below 180pi the product's spectrum is non-negligible",
    edge_ratio(fr_mul12, mg_mul12, 0.85 * wM12) > 0.05,
    f"ratio={edge_ratio(fr_mul12, mg_mul12, 0.85*wM12):.4f}")
chk("D7-12 numerically: above 180pi the product's spectrum is ~0",
    edge_ratio(fr_mul12, mg_mul12, 1.05 * wM12) < 0.01,
    f"ratio={edge_ratio(fr_mul12, mg_mul12, 1.05*wM12):.4f}")
chk("D7-12 ideal minimum rate = 360pi rad/s = 180 Hz",
    close(2 * wM12, 360 * PI) and close(2 * wM12 / (2 * PI), 180))
chk("D7-12 with the guard band, minimum rate = 380pi rad/s = 190 Hz",
    close(2 * wM12 + wg12, 380 * PI) and close((2 * wM12 + wg12) / (2 * PI), 190))
chk("D7-12 setting the guard band to zero recovers the ideal rate",
    close(2 * wM12 + 0, 2 * wM12))


# ===========================================================================
# D7-13 — copies of a given triangular spectrum, oversampled
# ===========================================================================
WM13, T13 = 50 * PI, 1 / 300
ws13 = 2 * PI / T13
chk("D7-13 wM = 50 pi rad/s (read off the given figure)", close(WM13, 50 * PI))
chk("D7-13 ws = 2pi/T = 600 pi rad/s", close(ws13, 600 * PI))
chk("D7-13 fs = 300 Hz", close(ws13 / (2 * PI), 300))
chk("D7-13 guard band = ws - 2wM = 500 pi rad/s", close(ws13 - 2 * WM13, 500 * PI))


# ===========================================================================
# D7-14 — undersampling: overlap of the baseband and its neighbour
# ===========================================================================
WM14, ws14 = 90 * PI, 140 * PI
chk("D7-14 undersampled: ws < 2wM", ws14 < 2 * WM14)
grid14 = np.linspace(-10 * PI, 300 * PI, 400_001)
base14 = tri_np(grid14, WM14)
copy1_14 = tri_np(grid14 - ws14, WM14)
mask14 = (base14 > 1e-9) & (copy1_14 > 1e-9)
lo14, hi14 = grid14[mask14].min(), grid14[mask14].max()
chk("D7-14 the overlap interval found geometrically is [50pi,90pi]",
    close(lo14, ws14 - WM14, tol=0.05) and close(hi14, WM14, tol=0.05),
    f"[{lo14/PI:.4f},{hi14/PI:.4f}] pi")
chk("D7-14 overlap width = 2wM - ws = 40 pi rad/s (read off the grid, not the formula)",
    close(hi14 - lo14, 2 * WM14 - ws14, tol=0.05), f"{(hi14-lo14)/PI:.4f} pi")


# ===========================================================================
# D7-15 — apparent frequency of an undersampled cosine
# ===========================================================================
f0_15, fs15 = 450.0, 800.0
chk("D7-15 Nyquist rate 900 Hz > fs = 800 Hz: aliasing expected", 2 * f0_15 > fs15)
alias15 = abs(f0_15 - fs15)
chk("D7-15 apparent frequency = 350 Hz", close(alias15, 350.0))
nn15 = np.arange(0, 20000)
s_true15 = np.cos(2 * PI * f0_15 * nn15 / fs15)
s_alias15 = np.cos(2 * PI * alias15 * nn15 / fs15)
chk("D7-15 samples of 450 Hz and of 350 Hz coincide at fs=800Hz over 20000 samples",
    np.max(np.abs(s_true15 - s_alias15)) < 1e-9,
    f"max diff = {np.max(np.abs(s_true15-s_alias15)):.2e}")
chk("D7-15 350 Hz lies inside [0, fs/2] = [0,400] Hz", 0 <= alias15 <= fs15 / 2)


# ===========================================================================
# D7-16 — two components alias onto the same apparent frequency
# ===========================================================================
f1_16, f2_16, fs16 = 150.0, 350.0, 500.0
chk("D7-16 150 Hz stays unchanged (below fs/2 = 250 Hz)", f1_16 < fs16 / 2)
chk("D7-16 350 Hz aliases to 150 Hz", close(abs(f2_16 - fs16), f1_16))
nn16 = np.arange(0, 20000)
x_true16 = np.cos(2 * PI * f1_16 * nn16 / fs16) + np.cos(2 * PI * f2_16 * nn16 / fs16)
x_claim16 = 2 * np.cos(2 * PI * f1_16 * nn16 / fs16)
chk("D7-16 samples equal 2*cos(2*pi*150*n/500) over 20000 samples",
    np.max(np.abs(x_true16 - x_claim16)) < 1e-9,
    f"max diff = {np.max(np.abs(x_true16-x_claim16)):.2e}")
f3_16 = 650.0
chk("D7-16 650 Hz also aliases to 150 Hz", close(abs(f3_16 - fs16), f1_16))
s3_16 = np.cos(2 * PI * f3_16 * nn16 / fs16)
s1_16 = np.cos(2 * PI * f1_16 * nn16 / fs16)
chk("D7-16 650 Hz samples coincide with 150 Hz samples over 20000 samples",
    np.max(np.abs(s3_16 - s1_16)) < 1e-9, f"max diff = {np.max(np.abs(s3_16-s1_16)):.2e}")


# ===========================================================================
# D7-17 — band-limited interpolation formula
# ===========================================================================
T17 = 0.4e-3
wc17 = PI / T17
chk("D7-17 wc = pi/T = 2500 pi rad/s", close(wc17, 2500 * PI))


def hLP17(tv):
    tv = np.asarray(tv, dtype=float)
    safe = np.where(np.abs(tv) < 1e-15, 1.0, tv)
    out = T17 * np.sin(wc17 * tv) / (PI * safe)
    return np.where(np.abs(tv) < 1e-15, T17 * wc17 / PI, out)


chk("D7-17 h_LP(0) = 1", close(hLP17(np.array([0.0]))[0], 1.0))
chk("D7-17 h_LP(T) = 0", abs(hLP17(np.array([T17]))[0]) < 1e-9)
chk("D7-17 h_LP(t) matches sinc(pi t/T), independently, via numpy's own sinc",
    close(hLP17(np.array([0.37 * T17]))[0], np.sinc(0.37)))
xrT17 = 3 * hLP17(np.array([T17]))[0] - 2 * hLP17(np.array([0.0]))[0]
chk("D7-17 x_r(T) = -2, matching the given sample x(T)", close(xrT17, -2.0))
xr15_17 = 3 * hLP17(np.array([1.5 * T17]))[0] - 2 * hLP17(np.array([0.5 * T17]))[0]
chk("D7-17 x_r(1.5T) = -6/pi", close(xr15_17, -6 / PI))


# ===========================================================================
# D7-18 — zero-order hold: gain at the origin and at pi/T
# ===========================================================================
def H0_direct(wv, Tv):
    tt = np.linspace(0, Tv, 400_001)
    return np.trapezoid(np.exp(-1j * wv * tt), tt)


def H0_closed(wv, Tv):
    if abs(wv) < 1e-12:
        return Tv + 0j
    return np.exp(-1j * wv * Tv / 2) * 2 * np.sin(wv * Tv / 2) / wv


T18 = 2.5e-4
errs18 = [abs(H0_direct(wv, T18) - H0_closed(wv, T18)) for wv in [500.0, 3000.0, 8000.0, 4000 * PI]]
chk("D7-18 H0(jw) closed form matches the direct integral", max(errs18) < 1e-6, f"max err {max(errs18):.2e}")
chk("D7-18 H0(0) = T", close(H0_closed(0.0, T18).real, T18))
w18 = PI / T18
chk("D7-18 pi/T = 4000 pi rad/s", close(w18, 4000 * PI))
mag18 = abs(H0_closed(w18, T18))
chk("D7-18 |H0(j pi/T)| = 2T/pi", close(mag18, 2 * T18 / PI))
chk("D7-18 that magnitude is 2/pi of the ideal gain T", close(mag18 / T18, 2 / PI))
for Tv in [1e-3, 5e-5]:
    wv = PI / Tv
    chk(f"D7-18 the ratio 2/pi at w=pi/T holds at T={Tv:g}s too, independent of T",
        close(abs(H0_closed(wv, Tv)) / Tv, 2 / PI))


# ===========================================================================
# D7-19 — anti-aliasing filter placed before versus after the sampler
# ===========================================================================
fs19 = 100.0
nn19 = np.arange(0, 20000)
s50_19 = np.cos(50 * PI * nn19 / fs19)
s60_19 = np.cos(60 * PI * nn19 / fs19)
s140_19 = np.cos(140 * PI * nn19 / fs19)
chk("D7-19 without a filter, the 140pi term's samples equal the 60pi term's samples",
    np.max(np.abs(s140_19 - s60_19)) < 1e-9, f"max diff = {np.max(np.abs(s140_19-s60_19)):.2e}")
xr_nf19 = s50_19 + s60_19
x_true19 = s50_19 + s140_19
chk("D7-19 the no-filter reconstruction's samples equal the true signal's samples",
    np.max(np.abs(xr_nf19 - x_true19)) < 1e-9)

t19 = np.linspace(0, 10.0, 4_000_001)


def e_nf19(tt):
    return np.cos(140 * PI * tt) - np.cos(60 * PI * tt)


def e_f19(tt):
    return np.cos(140 * PI * tt)


ms_nf19 = np.trapezoid(e_nf19(t19) ** 2, t19) / 10.0
ms_f19 = np.trapezoid(e_f19(t19) ** 2, t19) / 10.0
chk("D7-19 mean-square error without the filter is ~1", close(ms_nf19, 1.0, tol=5e-3), f"{ms_nf19:.5f}")
chk("D7-19 mean-square error with the filter is ~1/2", close(ms_f19, 0.5, tol=5e-3), f"{ms_f19:.5f}")
chk("D7-19 filtering first roughly halves the error power", ms_f19 < 0.6 * ms_nf19)


# ===========================================================================
# D7-20 — sampling exactly at the Nyquist rate, then a guard band
# ===========================================================================
wM20, ws20, T20 = 3600 * PI, 7200 * PI, 1 / 3600
chk("D7-20 wM = max(0,1200pi,3600pi) = 3600 pi rad/s", wM20 == max(0.0, 1200 * PI, 3600 * PI))
chk("D7-20 ws = 2 wM = 7200 pi rad/s", close(ws20, 2 * wM20))
chk("D7-20 T = 2pi/ws = 1/3600 s", close(T20, 2 * PI / ws20))

nn20 = np.arange(-200, 201)
samples_sin20 = np.sin(3600 * PI * nn20 * T20)
chk("D7-20 sin(3600 pi t) sampled at T=1/3600 s is zero at every n",
    np.max(np.abs(samples_sin20)) < 1e-9, f"max |sample| = {np.max(np.abs(samples_sin20)):.2e}")

x_full20 = 5 + 3 * np.cos(1200 * PI * nn20 * T20) + 6 * np.sin(3600 * PI * nn20 * T20)
x_reduced20 = 5 + 3 * np.cos(1200 * PI * nn20 * T20)
chk("D7-20 the full signal's samples equal the sine-free reduced signal's samples",
    np.max(np.abs(x_full20 - x_reduced20)) < 1e-9,
    f"max diff = {np.max(np.abs(x_full20-x_reduced20)):.2e}")

baseband_weight20 = (1 / T20) * (6 * PI / j)
copy1_weight20 = (1 / T20) * (-6 * PI / j)
chk("D7-20 baseband and k=1-copy weights cancel exactly at w=3600pi",
    abs(baseband_weight20 + copy1_weight20) < 1e-6,
    f"sum={baseband_weight20+copy1_weight20}")

wg20 = 400 * PI
ws20_guard = 2 * wM20 + wg20
chk("D7-20 guard-band rate = 7600 pi rad/s = 3800 Hz",
    close(ws20_guard, 7600 * PI) and close(ws20_guard / (2 * PI), 3800))
chk("D7-20 setting the guard band to zero recovers ws from part (a)",
    close(2 * wM20 + 0, ws20))
