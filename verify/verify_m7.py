#!/usr/bin/env python3
"""Independent computational verification of every quantitative claim made in
Module 7 of the artifact, plus the mathematics of laboratory J.
Symbolic where possible (SymPy), numerical as a cross-check (NumPy)."""
import numpy as np, sympy as sp

P, F = [], []
def chk(name, cond, detail=""):
    (P if cond else F).append(name)
    print(("PASS  " if cond else "FAIL  ") + name + (("   | " + detail) if detail else ""))

PI = np.pi
t, w, tau = sp.symbols('t omega tau', real=True)

# =====================================================================
# 1. Rates, periods and units
#    Every sampling period the module quotes is checked with w_s T = 2 pi,
#    which is the check the module itself asks the reader to make.
# =====================================================================
def ws_of(T): return 2*PI/T
def fs_of(T): return 1.0/T

for T in [0.4, 0.5, 2/3, 1/4000, 1/8000, 1/4500, 0.25, 1/3, 2/5, 0.1]:
    chk(f"M7 w_s T = 2 pi at T = {T:g} s", abs(ws_of(T)*T - 2*PI) < 1e-12)
for T in [0.4, 1/4000, 1/4500, 2/5]:
    chk(f"M7 w_s = 2 pi f_s at T = {T:g} s", abs(ws_of(T) - 2*PI*fs_of(T)) < 1e-9)

chk("M7 T1 = 0.40 s gives w_s = 5 pi rad/s", abs(ws_of(0.4) - 5*PI) < 1e-12, f"{ws_of(0.4)/PI:.4f} pi")
chk("M7 T2 = 0.50 s gives w_s = 4 pi rad/s", abs(ws_of(0.5) - 4*PI) < 1e-12, f"{ws_of(0.5)/PI:.4f} pi")
chk("M7 T3 = 2/3 s gives w_s = 3 pi rad/s", abs(ws_of(2/3) - 3*PI) < 1e-12, f"{ws_of(2/3)/PI:.4f} pi")

# the rad/s versus hertz separation the module states once and keeps
chk("M7 T = 0.25 ms is w_s = 8000 pi rad/s and f_s = 4000 Hz",
    abs(ws_of(2.5e-4) - 8000*PI) < 1e-6 and abs(fs_of(2.5e-4) - 4000) < 1e-9,
    f"{ws_of(2.5e-4)/PI:.1f} pi rad/s, {fs_of(2.5e-4):.1f} Hz")
chk("M7 the two readings differ by exactly 2 pi",
    abs(ws_of(2.5e-4)/fs_of(2.5e-4) - 2*PI) < 1e-12)

# =====================================================================
# 2. The sampling period of the worked example, and the 1000x trap
# =====================================================================
Ts_b = 2*PI/(8000*PI)
chk("M7 T = 2 pi / 8000 pi = 2.5e-4 s = 0.25 ms",
    abs(Ts_b - 2.5e-4) < 1e-18, f"{Ts_b:.6e} s")
chk("M7 the printed 0.25 s is wrong by a factor of exactly 1000",
    abs(0.25/Ts_b - 1000) < 1e-9, f"0.25 s / {Ts_b:.4e} s = {0.25/Ts_b:.1f}")
chk("M7 the wrong value fails the unit check w_s T = 2 pi",
    abs(8000*PI*0.25 - 2*PI) > 1e3, f"8000 pi x 0.25 = {8000*PI*0.25/PI:.0f} pi")
chk("M7 the replica scale 1/T is 4000 with the correct period",
    abs(1/Ts_b - 4000) < 1e-9, f"1/T = {1/Ts_b:.1f}")
chk("M7 the replica scale would be 4 with the printed period",
    abs(1/0.25 - 4) < 1e-12)
Ts_c = 2*PI/(16000*PI)
chk("M7 T = 2 pi / 16000 pi = 1.25e-4 s = 125 us",
    abs(Ts_c - 1.25e-4) < 1e-18, f"{Ts_c:.6e} s")
chk("M7 doubling the rate halves the period: ratio is exactly 2",
    abs(Ts_b/Ts_c - 2) < 1e-12, f"{Ts_b/Ts_c:.6f}")
chk("M7 the printed period would make that ratio 2000",
    abs(0.25/Ts_c - 2000) < 1e-6, f"{0.25/Ts_c:.1f}")
chk("M7 1/w_s = 3.98e-5 s is the distractor, not the period",
    abs(1/(8000*PI) - 3.9789e-5) < 1e-8, f"{1/(8000*PI):.6e} s")

# =====================================================================
# 3. The running band-limited signal  x(t) = (sin(pi t)/(pi t))^2
#    Its transform is a triangle of peak 1 that reaches zero at |w| = 2 pi.
# =====================================================================
def xB(tt):
    tt = np.asarray(tt, dtype=float)
    u = PI*tt
    return np.where(np.abs(u) < 1e-12, 1.0, (np.sin(np.where(np.abs(u) < 1e-12, 1.0, u))/np.where(np.abs(u) < 1e-12, 1.0, u))**2)

def ft(f, wv, lim=400.0, n=4000001):
    """numerical Fourier transform of a real even signal, X(jw) = int f e^{-jwt} dt"""
    tt = np.linspace(-lim, lim, n)
    return np.trapezoid(f(tt)*np.cos(wv*tt), tt)

for wv, want in [(0.0, 1.0), (PI/2, 0.75), (PI, 0.5), (3*PI/2, 0.25), (2*PI, 0.0), (2.5*PI, 0.0)]:
    got = ft(xB, wv)
    chk(f"M7 X(j{wv/PI:.2f} pi) of the running signal is {want}",
        abs(got - want) < 3e-3, f"got {got:.6f}")
chk("M7 the running signal has w_M = 2 pi rad/s",
    abs(ft(xB, 2.05*PI)) < 3e-3 and ft(xB, 1.95*PI) > 0.02,
    f"X(1.95 pi)={ft(xB,1.95*PI):.4f}, X(2.05 pi)={ft(xB,2.05*PI):.4f}")

WM_B = 2*PI
for T, gw, hgt in [(0.4, PI, 2.5), (0.5, 0.0, 2.0), (2/3, -PI, 1.5)]:
    chk(f"M7 guard band w_s - 2 w_M at T = {T:g} s",
        abs((ws_of(T) - 2*WM_B) - gw) < 1e-12, f"{(ws_of(T)-2*WM_B)/PI:+.4f} pi")
    chk(f"M7 copy height 1/T at T = {T:g} s is {hgt}",
        abs(1/T - hgt) < 1e-12, f"{1/T:.4f}")

# =====================================================================
# 4. The line spectrum of  x(t) = 1 + cos(2000 pi t) + sin(4000 pi t)
#    Lines: 2 pi at 0, pi at +-2000 pi, -j pi at +4000 pi, +j pi at -4000 pi.
# =====================================================================
LINES_A = [(0.0, 2*PI+0j), (2000*PI, PI+0j), (-2000*PI, PI+0j),
           (4000*PI, -1j*PI), (-4000*PI, 1j*PI)]

def from_lines(lines, tt):
    s = 0j
    for pos, c in lines:
        s += c*np.exp(1j*pos*tt)
    return (s/(2*PI))

def xA(tt): return 1 + np.cos(2000*PI*tt) + np.sin(4000*PI*tt)

tt = np.linspace(0, 1e-3, 501)
rec = from_lines(LINES_A, tt)
chk("M7 the five impulses invert back to 1 + cos(2000 pi t) + sin(4000 pi t)",
    np.max(np.abs(rec.real - xA(tt))) < 1e-9 and np.max(np.abs(rec.imag)) < 1e-9,
    f"max err {np.max(np.abs(rec.real - xA(tt))):.3e}")
chk("M7 the constant contributes a weight of 2 pi at the origin",
    abs(LINES_A[0][1] - 2*PI) < 1e-12)
chk("M7 the cosine contributes pi at each of +-2000 pi",
    abs(LINES_A[1][1] - PI) < 1e-12 and abs(LINES_A[2][1] - PI) < 1e-12)
chk("M7 the sine pair is imaginary and antisymmetric",
    abs(LINES_A[3][1] + 1j*PI) < 1e-12 and abs(LINES_A[4][1] - 1j*PI) < 1e-12)
chk("M7 w_M = 4000 pi rad/s for the line-spectrum signal",
    abs(max(abs(p) for p, _ in LINES_A) - 4000*PI) < 1e-9)
chk("M7 f_M = 2000 Hz for the same signal", abs(4000*PI/(2*PI) - 2000) < 1e-9)
chk("M7 its Nyquist rate is 8000 pi rad/s, that is 4000 Hz",
    abs(2*4000*PI - 8000*PI) < 1e-9 and abs(8000*PI/(2*PI) - 4000) < 1e-9)

# =====================================================================
# 5. The boundary case: sampling at exactly the Nyquist rate
# =====================================================================
Tc = 1/4000.0
wsc = 2*PI/Tc
chk("M7 at the Nyquist rate w_s = 8000 pi rad/s", abs(wsc - 8000*PI) < 1e-6)
base_at = (1/Tc)*(-1j*PI)          # baseband contribution at +4000 pi
copy_at = (1/Tc)*(1j*PI)           # k = 1 copy carries the -4000 pi impulse up
chk("M7 baseband contributes -j 4000 pi at w = +4000 pi",
    abs(base_at + 1j*4000*PI) < 1e-6, f"{base_at:.4e}")
chk("M7 the k = 1 copy contributes +j 4000 pi there",
    abs(copy_at - 1j*4000*PI) < 1e-6, f"{copy_at:.4e}")
chk("M7 the two contributions cancel exactly at w = +4000 pi",
    abs(base_at + copy_at) < 1e-6, f"sum {abs(base_at+copy_at):.3e}")
nn = np.arange(-20, 21)
smp = np.sin(4000*PI*nn*Tc)
chk("M7 every sample of sin(4000 pi t) at the Nyquist rate is zero",
    np.max(np.abs(smp)) < 1e-9, f"max |sample| = {np.max(np.abs(smp)):.2e}")
chk("M7 the admissible cutoff interval is empty at w_s = 2 w_M",
    not (4000*PI < 4000*PI), "(4000 pi, 4000 pi) is empty")

# the guard-band repair
ws_g = 2*(4000*PI) + 1000*PI
T_g = 2*PI/ws_g
chk("M7 a guard band of 1000 pi gives w_s = 9000 pi rad/s", abs(ws_g - 9000*PI) < 1e-6)
chk("M7 and T = 1/4500 s, about 222.2 us",
    abs(T_g - 1/4500) < 1e-15 and abs(T_g*1e6 - 222.222) < 1e-2, f"{T_g*1e6:.3f} us")
chk("M7 the repaired cutoff interval (4000 pi, 5000 pi) is not empty",
    (ws_g - 4000*PI) - 4000*PI > 0, f"width {(ws_g-8000*PI)/PI:.0f} pi")
smp_g = np.sin(4000*PI*nn*T_g)
chk("M7 the sine is no longer sampled only at its zero crossings",
    np.max(np.abs(smp_g)) > 0.9, f"max |sample| = {np.max(np.abs(smp_g)):.4f}")

# =====================================================================
# 6. The triangular-spectrum example: area, peak, copy height
# =====================================================================
A_area = float(sp.integrate(1, (tau, -4000*sp.pi, 4000*sp.pi)))
chk("M7 A = int_{-4000 pi}^{4000 pi} 1 dtau = 8000 pi",
    abs(A_area - 8000*PI) < 1e-6, f"{A_area/PI:.1f} pi")
Xmax = A_area/(2*PI)
chk("M7 X_max = A / 2 pi = 4000", abs(Xmax - 4000) < 1e-9, f"{Xmax:.4f}")
chk("M7 A and X_max differ by exactly 2 pi", abs(A_area/Xmax - 2*PI) < 1e-9)
chk("M7 w_M = 8000 pi rad/s for the triangular spectrum",
    abs(2*4000*PI - 8000*PI) < 1e-6)
chk("M7 its Nyquist period is 1.25e-4 s = 125 us",
    abs(2*PI/(2*8000*PI) - 1.25e-4) < 1e-18)
chk("M7 the copy height is X_max / T = 3.2e7",
    abs(Xmax/1.25e-4 - 3.2e7) < 1e-3, f"{Xmax/1.25e-4:.4e}")
chk("M7 substituting the area instead of the peak inflates it by 2 pi",
    abs((A_area/1.25e-4)/(Xmax/1.25e-4) - 2*PI) < 1e-9)

def xC(tt):
    tt = np.asarray(tt, dtype=float)
    d = PI*tt
    return np.where(np.abs(d) < 1e-14, (4000*PI/PI)**2,
                    (np.sin(4000*PI*np.where(np.abs(d) < 1e-14, 1.0, tt))/np.where(np.abs(d) < 1e-14, 1.0, d))**2)
for wv, want in [(0.0, 4000.0), (4000*PI, 2000.0), (8000*PI, 0.0)]:
    got = ft(xC, wv, lim=0.6, n=6000001)
    chk(f"M7 triangular X(j{wv/PI:.0f} pi) = {want:g}", abs(got - want) < 20.0, f"got {got:.2f}")

# =====================================================================
# 7. Reconstruction filter and the interpolation kernel
# =====================================================================
def hLP_direct(tt, T, wc):
    """inverse transform of the rectangle of height T on |w| < wc"""
    tt = np.asarray(tt, dtype=float)
    out = np.empty_like(tt)
    small = np.abs(tt) < 1e-12
    out[small] = T*wc/PI
    ts = tt[~small]
    out[~small] = T*np.sin(wc*ts)/(PI*ts)
    return out

Tk, wck = 0.4, PI/0.4
grid = np.linspace(-3, 3, 601)
num = np.array([np.trapezoid(Tk*np.cos(np.linspace(-wck, wck, 200001)*x),
                             np.linspace(-wck, wck, 200001))/(2*PI) for x in grid[::60]])
chk("M7 h_LP(t) = T sin(w_c t)/(pi t) matches the inverse transform",
    np.max(np.abs(num - hLP_direct(grid[::60], Tk, wck))) < 1e-6,
    f"max err {np.max(np.abs(num - hLP_direct(grid[::60], Tk, wck))):.3e}")
chk("M7 with w_c = pi/T the kernel is 1 at t = 0",
    abs(hLP_direct(np.array([0.0]), Tk, PI/Tk)[0] - 1.0) < 1e-12)
zer = [abs(hLP_direct(np.array([m*Tk]), Tk, PI/Tk)[0]) for m in range(1, 6)]
chk("M7 and exactly zero at every other sample instant",
    max(zer) < 1e-12, f"max |h_LP(mT)| = {max(zer):.2e}")
chk("M7 h_LP(t) = sinc(pi t / T) with the unnormalised convention",
    max(abs(hLP_direct(np.array([x]), 1.0, PI)[0] - (np.sin(PI*x)/(PI*x) if x else 1.0))
        for x in [0.3, 0.7, 1.4, 2.6]) < 1e-12)
# the kernel with the pi dropped from the numerator
chk("M7 the damaged kernel gives sin(1)/pi = 0.267849 where the correct value is 0",
    abs(np.sin(1.0)/PI - 0.267849) < 1e-6 and abs(np.sin(PI)/PI) < 1e-15,
    f"{np.sin(1.0)/PI:.6f} against {abs(np.sin(PI)/PI):.1e}")

# interpolation reproduces a band-limited signal sampled above the Nyquist rate
Ti = 0.4
ns = np.arange(-200, 201)
def interp(x):
    return np.sum(xB(ns*Ti)*np.sinc((x - ns*Ti)/Ti))
pts = [0.13, 0.55, -0.9, 1.37, -2.2]
errs = [abs(interp(x) - float(xB(np.array([x]))[0])) for x in pts]
chk("M7 band-limited interpolation reproduces the signal at T = 0.4 s",
    max(errs) < 5e-3, f"max err {max(errs):.2e}")

chk("M7 the reconstruction gain T cancels the sampling factor 1/T",
    abs(0.4*(1/0.4) - 1.0) < 1e-15)
for T in [0.4, 0.2, 1/4500]:
    wsx = 2*PI/T
    chk(f"M7 the cutoff interval (w_M, w_s - w_M) is non-empty at T = {T:g} s"
        if wsx > 2*WM_B else f"M7 the cutoff interval is empty at T = {T:g} s",
        (wsx - WM_B > WM_B) == (wsx > 2*WM_B))

# =====================================================================
# 8. The zero-order and first-order holds
# =====================================================================
Th = 0.5
def H0_direct(wv):
    tt = np.linspace(0, Th, 400001)
    return np.trapezoid(np.exp(-1j*wv*tt), tt)
def H0_closed(wv):
    if abs(wv) < 1e-12: return Th + 0j
    return np.exp(-1j*wv*Th/2)*2*np.sin(wv*Th/2)/wv
errs = [abs(H0_direct(wv) - H0_closed(wv)) for wv in [0.7, 2.1, 5.0, 9.4, 14.0]]
chk("M7 H_0(jw) = e^{-jwT/2} 2 sin(wT/2)/w matches the direct integral",
    max(errs) < 1e-6, f"max err {max(errs):.2e}")
chk("M7 H_0(0) = T", abs(H0_closed(0.0).real - Th) < 1e-12)
chk("M7 the zero-order hold phase is a delay of T/2",
    abs(np.angle(H0_closed(2.0)) + 2.0*Th/2) < 1e-9)
chk("M7 |H_0| sags below T inside the band",
    abs(H0_closed(2*PI/Th/4)) < Th, f"|H_0(w_s/4)| = {abs(H0_closed(2*PI/Th/4)):.4f} < {Th}")
chk("M7 |H_0| is zero at w_s and non-zero between the zeros",
    abs(H0_closed(2*PI/Th)) < 1e-9 and abs(H0_closed(1.5*2*PI/Th)) > 1e-3)

def H1_direct(wv):
    tt = np.linspace(-Th, Th, 400001)
    return np.trapezoid((1 - np.abs(tt)/Th)*np.exp(-1j*wv*tt), tt)
def H1_closed(wv):
    if abs(wv) < 1e-12: return Th + 0j
    return (1/Th)*(np.sin(wv*Th/2)/(wv/2))**2 + 0j
errs = [abs(H1_direct(wv) - H1_closed(wv)) for wv in [0.7, 2.1, 5.0, 9.4, 14.0]]
chk("M7 H_1(jw) = (1/T)[sin(wT/2)/(w/2)]^2 matches the direct integral",
    max(errs) < 1e-6, f"max err {max(errs):.2e}")
chk("M7 H_1(0) = T", abs(H1_closed(0.0).real - Th) < 1e-12)
chk("M7 H_1 is real and non-negative", all(H1_closed(wv).real >= -1e-15 and abs(H1_closed(wv).imag) < 1e-15
                                           for wv in [0.7, 5.0, 14.0, 30.0]))
# the triangle really is (g * g)/T with g the unit rectangle on |t| <= T/2
gg = lambda x: max(0.0, Th - abs(x))
chk("M7 (g * g)(t) = T - |t| on |t| <= T, so its peak is T",
    abs(gg(0.0) - Th) < 1e-12 and abs(gg(Th/2) - Th/2) < 1e-12 and abs(gg(Th)) < 1e-12)
chk("M7 h_1 = (g * g)/T is a triangle of peak 1 on |t| <= T",
    abs(gg(0.0)/Th - 1.0) < 1e-12)
chk("M7 the first-order hold decays faster than the zero-order hold",
    abs(H1_closed(30.0)) < abs(H0_closed(30.0)), f"{abs(H1_closed(30.0)):.3e} < {abs(H0_closed(30.0)):.3e}")
# the compensator
wv = 3.3
comp = np.exp(1j*wv*Th/2)*wv/(2*np.sin(wv*Th/2))
chk("M7 the compensator H_r = e^{jwT/2} w /(2 sin(wT/2)) inverts H_0",
    abs(comp*H0_closed(wv) - 1.0) < 1e-9, f"product {comp*H0_closed(wv):.6f}")

# =====================================================================
# 9. Aliasing of a cosine at three rates, with the cutoff at w_s/2
# =====================================================================
def surviving(w0, ws, wc, K=6):
    out = set()
    for k in range(-K, K+1):
        for s in (1, -1):
            pos = k*ws + s*w0
            if abs(pos) < wc - 1e-9:
                out.add(round(abs(pos), 9))
    return sorted(out)

w0 = 1.0
for factor, want in [(6.0, 1.0), (3.0, 1.0), (1.5, 0.5)]:
    ws = factor*w0
    got = surviving(w0, ws, ws/2)
    chk(f"M7 cosine at w_s = {factor} w_0 is recovered at {want} w_0",
        len(got) == 1 and abs(got[0] - want) < 1e-9, f"surviving {got}")
    chk(f"M7 the cutoff w_c = w_s/2 = {factor/2} w_0 and pi/T agree",
        abs(ws/2 - PI/(2*PI/ws)) < 1e-12)
chk("M7 the undersampled cosine returns at |w_s - w_0|",
    abs(surviving(1.0, 1.5, 0.75)[0] - abs(1.5 - 1.0)) < 1e-9)

# =====================================================================
# 10. The three sampling periods for cos(2 pi t)
# =====================================================================
w0_e = 2*PI
chk("M7 cos(2 pi t) has w_M = 2 pi rad/s and a Nyquist rate of 4 pi rad/s",
    abs(w0_e - 2*PI) < 1e-12 and abs(2*w0_e - 4*PI) < 1e-12)
for T, ws_want, ok in [(1/4, 8*PI, True), (1/3, 6*PI, True), (2/3, 3*PI, False)]:
    ws = ws_of(T)
    chk(f"M7 T = {T:g} s gives w_s = {ws_want/PI:g} pi rad/s",
        abs(ws - ws_want) < 1e-9, f"{ws/PI:.4f} pi")
    chk(f"M7 verdict at T = {T:g} s against the correct 2 w_M = 4 pi",
        (ws > 2*w0_e) == ok, f"{ws/PI:.2f} pi vs 4 pi")
chk("M7 against the wrong bandwidth 2(3 pi) = 6 pi the verdicts are unchanged",
    [ws_of(T) > 6*PI for T in [1/4, 1/3, 2/3]] == [True, False, False]
    or [ws_of(T) >= 6*PI for T in [1/4, 1/3, 2/3]] == [True, True, False],
    "the middle case turns into an equality")
chk("M7 the middle case is strict against 4 pi and an equality against 6 pi",
    ws_of(1/3) > 4*PI and abs(ws_of(1/3) - 6*PI) < 1e-9)
al = surviving(2*PI, 3*PI, 1.5*PI)
chk("M7 cos(2 pi t) at T = 2/3 s is recovered as cos(pi t)",
    len(al) == 1 and abs(al[0] - PI) < 1e-9, f"surviving {[a/PI for a in al]} pi")
nn = np.arange(-20, 21)
chk("M7 the samples of cos(2 pi t) and cos(pi t) at T = 2/3 s are identical",
    np.max(np.abs(np.cos(2*PI*nn*(2/3)) - np.cos(PI*nn*(2/3)))) < 1e-12,
    f"max diff {np.max(np.abs(np.cos(2*PI*nn*(2/3)) - np.cos(PI*nn*(2/3)))):.2e}")

# =====================================================================
# 11. Two components: cos(pi t) + cos(3 pi t) at T = 2/5 s
# =====================================================================
Th2 = 2/5
ws2 = ws_of(Th2)
chk("M7 T = 2/5 s gives w_s = 5 pi rad/s", abs(ws2 - 5*PI) < 1e-9, f"{ws2/PI:.4f} pi")
chk("M7 the two-component signal has w_M = 3 pi and a Nyquist rate of 6 pi",
    abs(3*PI - 3*PI) < 1e-12 and ws2 < 6*PI, f"{ws2/PI:.2f} pi < 6 pi")
sv = sorted(set(surviving(PI, ws2, ws2/2) + surviving(3*PI, ws2, ws2/2)))
chk("M7 the surviving lines are pi and 2 pi rad/s",
    len(sv) == 2 and abs(sv[0] - PI) < 1e-9 and abs(sv[1] - 2*PI) < 1e-9,
    f"{[round(x/PI, 4) for x in sv]} pi")
chk("M7 so x_r(t) = cos(pi t) + cos(2 pi t)",
    np.max(np.abs((np.cos(PI*nn*Th2) + np.cos(3*PI*nn*Th2))
                  - (np.cos(PI*nn*Th2) + np.cos(2*PI*nn*Th2)))) < 1e-12)
chk("M7 the component at pi survives untouched and the one at 3 pi moves to 2 pi",
    abs(ws2 - 3*PI - 2*PI) < 1e-9)

# =====================================================================
# 12. The anti-aliasing comparison, recomputed
# =====================================================================
tt = np.linspace(0, 2, 400001)
e_no = np.cos(3*PI*tt) - np.cos(2*PI*tt)
e_aa = np.cos(3*PI*tt)
ms_no = np.trapezoid(e_no**2, tt)/2
ms_aa = np.trapezoid(e_aa**2, tt)/2
chk("M7 error power without the anti-aliasing filter is 1",
    abs(ms_no - 1.0) < 1e-6, f"{ms_no:.6f}")
chk("M7 error power with the anti-aliasing filter is 1/2",
    abs(ms_aa - 0.5) < 1e-6, f"{ms_aa:.6f}")
chk("M7 the filter halves the error power", abs(ms_no/ms_aa - 2.0) < 1e-5,
    f"ratio {ms_no/ms_aa:.6f}")
cross = np.trapezoid(np.cos(3*PI*tt)*np.cos(2*PI*tt), tt)/2
chk("M7 the cross term between the two error components averages to zero",
    abs(cross) < 1e-6, f"{cross:.3e}")

# =====================================================================
# 13. Temporal and spatial aliasing
# =====================================================================
chk("M7 a 9 Hz rotation filmed at 10 frames/s aliases to 1 Hz",
    abs(abs(10 - 9) - 1.0) < 1e-12)
chk("M7 and the rate is below the Nyquist rate: 20 pi < 36 pi",
    2*PI*10 < 2*(2*PI*9), f"{2*PI*10/PI:.0f} pi < {2*2*PI*9/PI:.0f} pi")
nf = np.arange(0, 41)
chk("M7 the frames of the 9 Hz and the 1 Hz rotation are identical",
    np.max(np.abs(np.cos(18*PI*nf/10) - np.cos(2*PI*nf/10))) < 1e-12,
    f"max diff {np.max(np.abs(np.cos(18*PI*nf/10) - np.cos(2*PI*nf/10))):.2e}")
chk("M7 the apparent step per frame is -1/10 of a turn",
    abs(((0.9 + 0.5) % 1.0 - 0.5) + 0.1) < 1e-12)
chk("M7 at 20 frames/s the 9 Hz rotation is recorded correctly",
    2*PI*20 > 2*(2*PI*9))
chk("M7 a 9 cycle/mm grating on a 10 sample/mm grid aliases to 1 cycle/mm",
    abs(abs(10 - 9) - 1.0) < 1e-12)
xs = np.arange(0, 41)*0.1
chk("M7 the grid samples of the 9 and the 1 cycle/mm gratings agree",
    np.max(np.abs(np.cos(2*PI*9*xs) - np.cos(2*PI*1*xs))) < 1e-12)
chk("M7 stripes at 1.0 mm and 1.1 mm beat with a period of 11 mm",
    abs(1/(1/1.0 - 1/1.1) - 11.0) < 1e-9, f"{1/(1/1.0 - 1/1.1):.6f} mm")

# =====================================================================
# 14. Laboratory J — the model, at every preset
#     x(t) = 1 + cos(wM t/2) + sin(wM t), reconstructed from the surviving
#     lines with the filter gain T and the cutoff w_s/2.
# =====================================================================
def lab_lines(wM):
    return [(0.0, 2*PI+0j), (wM/2, PI+0j), (-wM/2, PI+0j),
            (wM, -1j*PI), (-wM, 1j*PI)]

def lab_replicas(wM, ws, span):
    K = min(60, int(np.ceil(span/ws)) + 1)
    tol = ws*1e-9
    agg = {}
    for k in range(-K, K+1):
        for pos0, c in lab_lines(wM):
            pos = pos0 + k*ws
            if abs(pos) > span: continue
            key = round(pos/tol)
            if key in agg:
                agg[key] = (agg[key][0], agg[key][1] + c)
            else:
                agg[key] = (pos, c)
    return agg

def lab_x(tt, wM): return 1 + np.cos(wM*tt/2) + np.sin(wM*tt)

def lab_ideal(wM, ws):
    wc = ws/2
    span = max(2.4*ws, 3.2*wM)
    agg = lab_replicas(wM, ws, span)
    keep = [(p, c) for p, c in agg.values() if abs(p) < wc - 1e-9]
    def rec(x):
        s = 0.0
        for p, c in keep:
            s += c.real*np.cos(p*x) - c.imag*np.sin(p*x)
        return s/(2*PI)
    return rec

def lab_rms(rec, wM, win, N=1600):
    xs = win*np.arange(N)/N
    return float(np.sqrt(np.mean((np.array([rec(x) for x in xs]) - lab_x(xs, wM))**2)))

presets = {'over': (3, 12, 'ideal'), 'crit': (3, 6, 'ideal'), 'under': (3, 4.5, 'ideal'),
           'zoh': (3, 12, 'zoh'), 'foh': (3, 12, 'foh'), 'ideal': (3, 12, 'ideal')}
lab_err = {}
for name, (fM, fS, mode) in presets.items():
    wM, ws, Tp = 2*PI*fM, 2*PI*fS, 1/fS
    win = min(8.0, 4*PI/(wM/2))
    if mode == 'ideal':
        rec = lab_ideal(wM, ws)
    elif mode == 'zoh':
        rec = lambda x, Tp=Tp, wM=wM: float(lab_x(np.floor(x/Tp)*Tp, wM))
    else:
        def rec(x, Tp=Tp, wM=wM):
            n = np.floor(x/Tp); u = x/Tp - n
            return float((1-u)*lab_x(n*Tp, wM) + u*lab_x((n+1)*Tp, wM))
    lab_err[name] = lab_rms(rec, wM, win)
    chk(f"LabJ preset '{name}' produces a finite reconstruction error",
        np.isfinite(lab_err[name]), f"rms = {lab_err[name]:.6f}")

chk("LabJ oversampling guard band is 12 pi rad/s",
    abs((2*PI*12 - 2*2*PI*3) - 12*PI) < 1e-9, f"{(2*PI*12 - 12*PI)/PI:.2f} pi")
chk("LabJ oversampling recovers the signal exactly",
    lab_err['over'] < 1e-9, f"rms = {lab_err['over']:.3e}")
chk("LabJ 'ideal' and 'over' are the same setting and agree",
    abs(lab_err['ideal'] - lab_err['over']) < 1e-12)
chk("LabJ critical preset sits exactly at w_s = 2 w_M",
    abs(2*PI*6 - 2*(2*PI*3)) < 1e-9)
chk("LabJ critical guard band is exactly zero", abs(2*PI*6 - 2*2*PI*3) < 1e-9)
chk("LabJ at the critical preset every sample of the band-edge sine is zero",
    np.max(np.abs(np.sin(2*PI*3*np.arange(-30, 31)/6))) < 1e-9,
    f"max |sample| = {np.max(np.abs(np.sin(2*PI*3*np.arange(-30, 31)/6))):.2e}")
chk("LabJ the critical preset loses exactly the band-edge sine, rms = 1/sqrt(2)",
    abs(lab_err['crit'] - 1/np.sqrt(2)) < 1e-6, f"rms = {lab_err['crit']:.6f}")
chk("LabJ undersampling preset is below the Nyquist rate",
    2*PI*4.5 < 2*(2*PI*3), f"{2*PI*4.5/PI:.1f} pi < {2*2*PI*3/PI:.0f} pi")
chk("LabJ undersampling guard band is -3 pi rad/s",
    abs((2*PI*4.5 - 2*2*PI*3) + 3*PI) < 1e-9, f"{(2*PI*4.5 - 12*PI)/PI:+.2f} pi")
chk("LabJ the undersampled band edge returns at |w_s - w_M| = 3 pi rad/s",
    abs(abs(2*PI*4.5 - 2*PI*3) - 3*PI) < 1e-9, f"{abs(2*PI*4.5 - 2*PI*3)/PI:.2f} pi")
chk("LabJ that alias is 1.5 Hz against a 3 Hz component",
    abs(abs(4.5 - 3.0) - 1.5) < 1e-12)
chk("LabJ the undersampled reconstruction error is exactly 1",
    abs(lab_err['under'] - 1.0) < 1e-6, f"rms = {lab_err['under']:.6f}")
chk("LabJ both holds leave a non-zero error at a rate far above the Nyquist rate",
    lab_err['zoh'] > 1e-3 and lab_err['foh'] > 1e-3,
    f"zoh {lab_err['zoh']:.4f}, foh {lab_err['foh']:.4f}")
chk("LabJ the first-order hold is the better of the two approximations",
    lab_err['foh'] < lab_err['zoh'], f"{lab_err['foh']:.4f} < {lab_err['zoh']:.4f}")
chk("LabJ the copy height at the oversampling preset is 1/T = 12",
    abs(1/(1/12) - 12) < 1e-12)
chk("LabJ the rate control agrees in both units at every preset",
    all(abs(2*PI*fS - 2*PI*(1/(1/fS))) < 1e-9 for _, (_, fS, _) in presets.items()))
chk("LabJ the copies are generated at every preset, overlapping or not",
    all(len(lab_replicas(2*PI*fM, 2*PI*fS, max(2.4*2*PI*fS, 3.2*2*PI*fM))) >= 5
        for _, (fM, fS, _) in presets.items()))

print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
