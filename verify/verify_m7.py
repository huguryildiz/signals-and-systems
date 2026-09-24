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

# <m7-s1-verify> 7.1 the sampler and the sampled spectrum
WM1 = 2*PI                                   # the running signal: w_M = 2 pi rad/s
def s1_x(tt):
    tt = np.asarray(tt, dtype=float); u = PI*tt
    safe = np.where(np.abs(u) < 1e-12, 1.0, u)
    return np.where(np.abs(u) < 1e-12, 1.0, (np.sin(safe)/safe)**2)
def s1_X(wv):                                # its transform: a triangle of peak 1
    wv = np.asarray(wv, dtype=float)
    return np.where(np.abs(wv) <= WM1, 1 - np.abs(wv)/WM1, 0.0)
def s1_Xp_copies(wv, T, K=40):               # (1/T) sum_k X(j(w - k w_s))
    return sum(s1_X(wv - k*2*PI/T) for k in range(-K, K+1))/T
def s1_Xp_samples(wv, T, N=200000):          # transform of sum_n x(nT) delta(t - nT)
    n = np.arange(-N, N+1)
    return float(np.real(np.sum(s1_x(n*T)*np.exp(-1j*wv*n*T))))

# m7-sampler: the frames use T = 0.25 s; the prediction card
chk("7.1 sampler: cos(2 pi t) at t = 0.5 s is -1, the weight of that impulse",
    abs(np.cos(2*PI*0.5) + 1) < 1e-12)
chk("7.1 sampler: t = 0.5 s is a sampling instant for T = 0.25 s (n = 2)",
    abs(0.5/0.25 - 2) < 1e-12)
# sifting, symbolically: x(t) delta(t - nT) = x(nT) delta(t - nT) under the integral
nT = sp.symbols('nT', real=True)
chk("7.1 sampler: int x(t) delta(t - nT) dt = x(nT) (sifting)",
    sp.integrate(sp.cos(t)*sp.DiracDelta(t - nT), (t, -sp.oo, sp.oo)) == sp.cos(nT))

# m7-sampler-b: the prediction card, T = 0.2 s
first_zero = next(n for n in range(1, 50) if abs(s1_x(n*0.2)) < 1e-20)
chk("7.1 sampler-b: with T = 0.2 s the first zero sample after n = 0 is n = 5",
    first_zero == 5, f"n = {first_zero}")
chk("7.1 sampler-b: x(t) is zero at every nonzero integer t and nowhere else among the samples",
    all(abs(s1_x(k)) < 1e-20 for k in [1, 2, 3]) and all(s1_x(n*0.2) > 1e-6 for n in range(1, 5)))
chk("7.1 sampler-b: T = 0.25 s puts the first zero at n = 4 (code page, T = 0.25)",
    next(n for n in range(1, 50) if abs(s1_x(n*0.25)) < 1e-20) == 4)
chk("7.1 code try: T = 0.125 s puts the first zero at n = 8",
    next(n for n in range(1, 50) if abs(s1_x(n*0.125)) < 1e-20) == 8)
for n, want in [(0, 1.0), (1, 0.8106), (2, 0.4053), (3, 0.0901), (4, 0.0)]:
    chk(f"7.1 code: x[{n}] = x({n}*0.25) = {want:.4f}", abs(float(s1_x(n*0.25)) - want) < 5e-5)

# m7-rates: the live readout (T in ms), the error card and the prediction
for Tm in [0.1, 0.25, 0.5, 1.0]:
    T = Tm*1e-3
    chk(f"7.1 rates: T = {Tm} ms gives w_s = {2000/Tm:g} pi rad/s and f_s = {1000/Tm:g} Hz",
        abs(2*PI/T - 2000/Tm*PI) < 1e-6 and abs(1/T - 1000/Tm) < 1e-9)
chk("7.1 rates: cos(w_s t) has period T (one turn of 2 pi between samples)",
    abs(np.cos(2*PI/0.25e-3*(0.3e-3 + 0.25e-3)) - np.cos(2*PI/0.25e-3*0.3e-3)) < 1e-9)
chk("7.1 rates: 200 samples per second is w_s = 400 pi rad/s", abs(2*PI*200 - 400*PI) < 1e-9)
chk("7.1 rates: T = 0.25 ms gives 4 samples per ms", abs(1e-3/0.25e-3 - 4) < 1e-12)
chk("7.1 code try: T = 0.5 ms gives 4000 pi rad/s and 2000 Hz",
    abs(2*PI/0.5e-3 - 4000*PI) < 1e-6 and abs(1/0.5e-3 - 2000) < 1e-9)

# m7-freq: the transform of the impulse train, the slider range and the prediction
chk("7.1 freq: T = 0.4 s gives w_s = 5 pi and impulse weight 2 pi/T = 5 pi",
    abs(2*PI/0.4 - 5*PI) < 1e-12)
chk("7.1 freq: T = 0.1 s puts the impulses of P 20 pi rad/s apart", abs(2*PI/0.1 - 20*PI) < 1e-9)
chk("7.1 freq: over T in [0.25, 1] s the weight 2 pi/T stays in [2 pi, 8 pi], inside the drawn range 34",
    abs(2*PI/1 - 2*PI) < 1e-12 and 2*PI/0.25 < 34 - 1.5)
# numerically: the Fourier series of the impulse train has every coefficient 1/T,
# so P(jw) = (2 pi / T) sum_k delta(w - k w_s)
Tt = 0.4; tt = np.linspace(-Tt/2, Tt/2, 400001)
g = np.exp(-tt**2/(2*(1e-4)**2))/(np.sqrt(2*PI)*1e-4)         # a narrow unit-area pulse
ak = [np.trapezoid(g*np.exp(-1j*k*2*PI/Tt*tt), tt)/Tt for k in (0, 1, 3)]
chk("7.1 freq: every series coefficient of p(t) is 1/T, so each impulse of P has weight 2 pi/T",
    all(abs(a - 1/Tt) < 1e-3 for a in ak), ", ".join(f"{abs(a):.4f}" for a in ak))

# m7-freq-b: the derivation, the frames and the prediction
Ts_ = sp.symbols('T', positive=True)
chk("7.1 freq-b: (1/2pi)(2pi/T) = 1/T", sp.simplify(1/(2*sp.pi)*2*sp.pi/Ts_ - 1/Ts_) == 0)
chk("7.1 freq-b: T = 0.4 s gives 1/T = 2.5", abs(1/0.4 - 2.5) < 1e-12)
chk("7.1 freq-b: X(j0) = 2 and T = 0.05 s give X_p(j0) = 40", abs(2/0.05 - 40) < 1e-12)
for wv in [0.0, PI, 2.5*PI, 4*PI, 5*PI]:
    a_, b_ = s1_Xp_samples(wv, 0.4), float(s1_Xp_copies(wv, 0.4))
    chk(f"7.1 freq-b: at w = {wv/PI:.1f} pi the samples and the copies give the same X_p (T = 0.4)",
        abs(a_ - b_) < 1e-4, f"{a_:.6f} vs {b_:.6f}")
chk("7.1 code: X_p(j pi) = X_p(j 4 pi) = 1.25 and X_p(j 2.5 pi) = 0 at T = 0.4 s",
    abs(float(s1_Xp_copies(PI, 0.4)) - 1.25) < 1e-12 and abs(float(s1_Xp_copies(4*PI, 0.4)) - 1.25) < 1e-12
    and abs(float(s1_Xp_copies(2.5*PI, 0.4))) < 1e-12)
chk("7.1 code try: T = 0.25 s gives X_p(j pi) = 2", abs(float(s1_Xp_copies(PI, 0.25)) - 2.0) < 1e-12)

# m7-replicas: the slider range stays above the Nyquist rate; the prediction
chk("7.1 replicas: over T in [0.25, 0.48] s every rate is above 4 pi, so the copies stay apart",
    2*PI/0.48 > 2*WM1 and 2*PI/0.25 > 2*WM1, f"w_s from {2/0.48:.3f} pi to {2/0.25:.0f} pi")
chk("7.1 replicas: halving T doubles both the spacing 2 pi/T and the height 1/T",
    sp.simplify((2*sp.pi/(Ts_/2))/(2*sp.pi/Ts_)) == 2 and sp.simplify((1/(Ts_/2))/(1/Ts_)) == 2)

# m7-three: the three frames and the prediction
for ws_pi, gap_pi, pk in [(5, 1, 2.5), (4, 0, 2.0), (3, -1, 1.5)]:
    chk(f"7.1 three: w_s = {ws_pi} pi gives guard band {gap_pi} pi and copy height {pk}",
        abs((ws_pi*PI - 2*WM1) - gap_pi*PI) < 1e-12 and abs(ws_pi*PI/(2*PI) - pk) < 1e-12)
chk("7.1 three: at w_s = 3 pi the sum of the copies peaks at 1.5 and dips to 0.75",
    abs(float(s1_Xp_copies(0.0, 2/3)) - 1.5) < 1e-12 and abs(float(s1_Xp_copies(1.5*PI, 2/3)) - 0.75) < 1e-12)
chk("7.1 three: at w_s = 4 pi the copies touch at 2 pi, where both are zero",
    abs(float(s1_X(2*PI))) < 1e-12 and abs(float(s1_X(2*PI - 4*PI))) < 1e-12)
chk("7.1 three: w_M = 3 pi and w_s = 8 pi give a guard band of 2 pi", abs(8*PI - 2*3*PI - 2*PI) < 1e-12)
chk("7.1 code: T = 0.4, 0.5, 2/3 s give guard bands pi, 0 and -pi",
    all(abs((2*PI/T - 2*WM1) - g*PI) < 1e-12 for T, g in [(0.4, 1), (0.5, 0), (2/3, -1)]))
chk("7.1 code try: T = 0.25 s gives a guard band of 4 pi", abs(2*PI/0.25 - 2*WM1 - 4*PI) < 1e-12)

# m7-real-sampler: the four rates and the samples per change
chk("7.1 gallery: once a minute is T = 60 s, f_s = 1/60 Hz", abs(1/60 - 1/60.0) < 1e-15)
chk("7.1 gallery: 44.1 kHz is T = 22.7 us", abs(1/44100 - 22.68e-6) < 1e-8, f"{1e6/44100:.2f} us")
chk("7.1 gallery: 500 samples/s is T = 2 ms", abs(1/500 - 2e-3) < 1e-15)
chk("7.1 gallery: a 2 kHz tone at 44.1 kHz gets about 22 samples a cycle", round(44100/2000) == 22, f"{44100/2000:.2f}")
chk("7.1 gallery: a 1 Hz pendulum at 24 frames/s gets 24 frames a swing", 24/1 == 24)
chk("7.1 gallery: 20 sin(4 pi t), t in ms, is a 2 kHz tone", abs(4*PI/(2*PI)*1000 - 2000) < 1e-9)
chk("7.1 gallery: the cooling oven starts at 180 C and ends near 33 C after 20 min",
    abs(20 + 160 - 180) < 1e-12 and abs(20 + 160*np.exp(-20/8) - 33.13) < 0.01)

# Laboratory J1: default T = 0.25 s, both spectra, and the boundary at T = 0.5 s
T0 = 0.25
chk("LabJ1 T = 0.25 s: w_s = 8 pi, f_s = 4 Hz, 1/T = 4, guard band 4 pi",
    abs(2*PI/T0 - 8*PI) < 1e-12 and abs(1/T0 - 4) < 1e-12 and abs(2*PI/T0 - 2*WM1 - 4*PI) < 1e-12)
chk("LabJ1 the copies touch at T = 0.5 s: w_s = 2 w_M = 4 pi, guard band 0",
    abs(2*PI/0.5 - 4*PI) < 1e-12 and abs(2*PI/0.5 - 2*WM1) < 1e-12)
chk("LabJ1 at the slider end T = 0.8 s the guard band is -1.5 pi (overlap)",
    abs((2*PI/0.8 - 2*WM1) + 1.5*PI) < 1e-12)
chk("LabJ1 at the slider start T = 0.12 s the first copy sits at 16.67 pi, inside the drawn 18 pi",
    abs(2/0.12 - 16.6667) < 1e-3 and 2/0.12 - 2 < 18)
tt2 = np.linspace(-400, 400, 4000001)
xr = np.where(np.abs(tt2) < 1e-12, 2.0, np.sin(2*PI*tt2)/(PI*np.where(np.abs(tt2) < 1e-12, 1.0, tt2)))
for wv, want in [(0.0, 1.0), (PI, 1.0), (1.5*PI, 1.0), (2.5*PI, 0.0), (3*PI, 0.0)]:
    got = np.trapezoid(xr*np.cos(wv*tt2), tt2)
    chk(f"LabJ1 sin(2 pi t)/(pi t) has X(j{wv/PI:.1f} pi) = {want} (rectangle of height 1, |w| < 2 pi)",
        abs(got - want) < 2e-2, f"got {got:.4f}")
chk("LabJ1 sin(2 pi t)/(pi t) is 2 at t = 0", abs(2*PI/PI - 2) < 1e-12)
# </m7-s1-verify>

# <m7-s2-verify> 7.2 aliasing and the sampling theorem
# Every number stated by the 7.2 slides, predictions, gallery and laboratory J2
# that is not already checked in sections 1-10 above.
_s2wM = 2*PI                                   # the running triangle, rad/s
def _s2tri(w, wm, pk):
    return np.where(np.abs(w) <= wm, pk*(1 - np.abs(w)/wm), 0.0)
def _s2rep(w, wm, pk, ws, K=8):
    return sum(_s2tri(w - k*ws, wm, pk) for k in range(-K, K + 1))
def _s2ov(ws, wm=_s2wM):
    """the overlap interval of copies 0 and 1, and its width (ws >= wm)"""
    return (ws - wm, wm, max(0.0, 2*wm - ws))
def _s2both(w, wm, ws):
    """True where the baseband and a neighbouring copy are both non-zero"""
    return (np.abs(w) < wm) & ((np.abs(w - ws) < wm) | (np.abs(w + ws) < wm))

# m7-aliasing: copies 1/T = ws/2pi tall; default 2.6 pi; prediction at 3.5 pi
chk("M7 7.2 aliasing: at w_s = 2.6 pi each copy is 1/T = 1.3 tall", abs(2.6*PI/(2*PI) - 1.3) < 1e-12)
_lo, _hi, _wd = _s2ov(2.6*PI)
chk("M7 7.2 aliasing: at w_s = 2.6 pi the overlap runs from 0.6 pi to 2 pi",
    abs(_lo - 0.6*PI) < 1e-12 and abs(_hi - 2*PI) < 1e-12)
_lo, _hi, _wd = _s2ov(3.5*PI)
chk("M7 7.2 aliasing prediction: at w_s = 3.5 pi the overlap runs 1.5 pi to 2 pi, width 0.5 pi",
    abs(_lo - 1.5*PI) < 1e-12 and abs(_hi - 2*PI) < 1e-12 and abs(_wd - 0.5*PI) < 1e-12)
_w = np.linspace(-6*PI, 6*PI, 240001)
_m = _s2both(_w, _s2wM, 3.5*PI) & (_w > 0) & (_w < 3.5*PI)
chk("M7 7.2 aliasing prediction: the measured overlap near w_s/2 is 0.5 pi wide",
    abs((_w[_m].max() - _w[_m].min()) - 0.5*PI) < 1e-3)
chk("M7 7.2 aliasing: overlap exists exactly when w_s < 2 w_M (checked on a grid of rates)",
    all((_s2ov(k*PI/10)[2] > 0) == (k*PI/10 < 4*PI - 1e-12) for k in range(20, 61)))
_ws = 2.6*PI; _pk = _ws/(2*PI)
_u = np.linspace(0.6*PI + 1e-6, 2*PI - 1e-6, 50)
chk("M7 7.2 aliasing: inside the overlap the stored sum is flat at pk (2 - w_s/w_M) = 0.91",
    np.allclose(_s2rep(_u, _s2wM, _pk, _ws), _pk*(2 - _ws/_s2wM)) and abs(_pk*(2 - _ws/_s2wM) - 0.91) < 1e-12)

# m7-aliasing-b: prediction at 3.4 pi
chk("M7 7.2 aliasing-b prediction: at w_s = 3.4 pi the nearest copy starts at 1.4 pi",
    abs(3.4*PI - _s2wM - 1.4*PI) < 1e-12)
_w = np.linspace(-2*PI, 2*PI, 400001)
_alone = ~_s2both(_w, _s2wM, 3.4*PI) & (np.abs(_w) < _s2wM)
chk("M7 7.2 aliasing-b prediction: X_p = X/T alone exactly on |w| < 1.4 pi",
    abs(np.abs(_w[_alone]).max() - 1.4*PI) < 1e-4)

# m7-theorem: omega_s = 6 pi, T = 1/3, copies 3 tall, default cutoff 3 pi; prediction at 7 pi
chk("M7 7.2 theorem: w_s = 6 pi gives T = 1/3 s and copies 3 tall",
    abs(2*PI/(6*PI) - 1/3) < 1e-15 and abs(1/(1/3) - 3) < 1e-12)
chk("M7 7.2 theorem: the admissible cutoffs at w_s = 6 pi are 2 pi < w_c < 4 pi, and 3 pi is inside",
    2*PI < 3*PI < 6*PI - 2*PI)
_w = np.linspace(-3*PI, 3*PI, 60001)
_rec = np.where(np.abs(_w) < 3*PI, (1/3)*_s2rep(_w, _s2wM, 3, 6*PI), 0)
chk("M7 7.2 theorem: gain T and cutoff 3 pi return X(jw) exactly at w_s = 6 pi",
    np.allclose(_rec, _s2tri(_w, _s2wM, 1)))
chk("M7 7.2 theorem slider: cutoffs below 2 pi cut the baseband, above 4 pi pass part of a copy",
    _s2tri(np.array([1.9*PI]), _s2wM, 1)[0] > 0 and _s2rep(np.array([4.1*PI]), _s2wM, 3, 6*PI)[0] > 0)
chk("M7 7.2 theorem prediction: at w_s = 7 pi the interval is 2 pi < w_c < 5 pi",
    abs(7*PI - _s2wM - 5*PI) < 1e-12)
chk("M7 7.2 theorem prediction: 4 pi lies inside; 1.5 pi and 5.5 pi do not",
    (2*PI < 4*PI < 5*PI) and not (2*PI < 1.5*PI < 5*PI) and not (2*PI < 5.5*PI < 5*PI))

# m7-theorem-b: the interval closes; prediction with a transition band of pi
for _k, _wd in [(6, 2), (5, 1), (4, 0)]:
    chk(f"M7 7.2 theorem-b: at w_s = {_k} pi the cutoff interval is {_wd} pi wide",
        abs((_k*PI - _s2wM) - _s2wM - _wd*PI) < 1e-12)
chk("M7 7.2 theorem-b: at w_s = 2 w_M the interval w_M < w_c < w_M is empty",
    not any(_s2wM < c < 4*PI - _s2wM for c in np.linspace(0, 4*PI, 4001)))
chk("M7 7.2 theorem-b prediction: a gap of pi needs w_s - 4 pi >= pi, so w_s >= 5 pi",
    abs((4*PI + PI) - 5*PI) < 1e-12 and (4.5*PI - 4*PI) < PI and (4*PI - 4*PI) < PI)

# m7-boundary: the sine lines of j X_p at +-4000 pi, from the copies k = 0, +-1
_T = 1/4000; _ws = 8000*PI
_lines = {}
for _k in (-1, 0, 1):
    for _w0, _c in [(4000*PI, PI/1j), (-4000*PI, -PI/1j)]:
        _p = round((_w0 + _k*_ws)/PI)
        _lines[_p] = _lines.get(_p, 0) + _c/_T
chk("M7 7.2 boundary: j times the k = 0 line at +4000 pi is +4000 pi, the k = 1 line brought there is -4000 pi",
    abs(1j*(PI/1j)/_T - 4000*PI) < 1e-6 and abs(1j*(-PI/1j)/_T + 4000*PI) < 1e-6)
chk("M7 7.2 boundary: the sine lines at +-4000 pi add to zero",
    abs(_lines[4000]) < 1e-6 and abs(_lines[-4000]) < 1e-6)
chk("M7 7.2 boundary: the copies k = +-1 move a line by w_s = 8000 pi, from -4000 pi to +4000 pi",
    abs(-4000*PI + _ws - 4000*PI) < 1e-9)

# m7-boundary-b: samples at the zeros, the repair, the cosine prediction, the slider
_n = np.arange(0, 200)
chk("M7 7.2 boundary-b: with T = 1/4000 s every sample sin(pi n) is zero (n = 0..199)",
    np.max(np.abs(np.sin(4000*PI*_n/4000))) < 1e-10)
chk("M7 7.2 boundary-b: w_s = 2 w_M + 1000 pi = 9000 pi and T = 1/4500 s = 222.2 us",
    abs(8000*PI + 1000*PI - 9000*PI) < 1e-9 and abs(2*PI/(9000*PI) - 1/4500) < 1e-15
    and abs(1e6/4500 - 222.2) < 0.05)
chk("M7 7.2 boundary-b: at 9000 pi the largest sample is sin(4 pi/9) = 0.9848",
    abs(np.max(np.abs(np.sin(4000*PI*_n/4500))) - np.sin(4*PI/9)) < 1e-12 and abs(np.sin(4*PI/9) - 0.9848) < 5e-5)
chk("M7 7.2 boundary-b prediction: cos(4000 pi n/4000) = cos(pi n) = (-1)^n",
    np.allclose(np.cos(4000*PI*_n/4000), (-1.0)**_n))
chk("M7 7.2 boundary-b slider: 8000 pi to 10000 pi rad/s is 4000 to 5000 samples a second (500 v Hz)",
    abs(8*1000*PI/(2*PI) - 500*8) < 1e-9 and abs(10*1000*PI/(2*PI) - 500*10) < 1e-9)
chk("M7 7.2 boundary-b slider: every rate above 8000 pi on the slider gives a non-zero sample",
    all(np.max(np.abs(np.sin(4000*PI*_n/(500*v)))) > 0.3 for v in np.arange(8.25, 10.01, 0.25)))
chk("M7 7.2 boundary-b: the tone sin(4000 pi t) is 2 kHz", abs(4000*PI/(2*PI) - 2000) < 1e-9)

# m7-ex-rates, m7-ex-rates-b
chk("M7 7.2 ex-rates: only T1 = 0.40 s leaves a positive guard band",
    [2*PI/T - 4*PI > 1e-12 for T in (0.4, 0.5, 2/3)] == [True, False, False])
chk("M7 7.2 ex-rates: at T3 = 2/3 s the copies overlap by pi rad/s",
    abs(_s2ov(3*PI)[2] - PI) < 1e-12)
chk("M7 7.2 ex-rates-b: w_s T = 2 pi for 5 pi x 0.4, 4 pi x 0.5, 3 pi x 2/3",
    all(abs(a*b - 2*PI) < 1e-12 for a, b in [(5*PI, 0.4), (4*PI, 0.5), (3*PI, 2/3)]))
chk("M7 7.2 ex-rates-b: spacing falls from 5 pi to 3 pi and height from 2.5 to 1.5",
    abs(2*PI/0.4 - 5*PI) < 1e-12 and abs(2*PI/(2/3) - 3*PI) < 1e-12 and abs(1/0.4 - 2.5) < 1e-12 and abs(1.5 - 1/(2/3)) < 1e-12)
chk("M7 7.2 ex-rates-b prediction: T = 0.25 s gives w_s = 8 pi and a guard band of 4 pi",
    abs(2*PI/0.25 - 8*PI) < 1e-12 and abs(2*PI/0.25 - 4*PI - 4*PI) < 1e-12)

# m7-ex-73a-b: hertz, the inversion check, the prediction
chk("M7 7.2 ex-73a-b: 4000 pi rad/s is 2000 Hz and 8000 pi rad/s is 4000 Hz",
    abs(4000*PI/(2*PI) - 2000) < 1e-9 and abs(8000*PI/(2*PI) - 4000) < 1e-9)
chk("M7 7.2 ex-73a-b: x(t) = 1 + cos(2000 pi t) + sin(4000 pi t) repeats every 1 ms",
    np.allclose(1 + np.cos(2000*PI*(_n*1e-5 + 1e-3)) + np.sin(4000*PI*(_n*1e-5 + 1e-3)),
                1 + np.cos(2000*PI*_n*1e-5) + np.sin(4000*PI*_n*1e-5)))
chk("M7 7.2 ex-73a-b: the figure ticks 0.25, 0.75, 1.25, 1.75 ms sit where x(t) = 1",
    np.allclose(1 + np.cos(2000*PI*np.array([2.5e-4, 7.5e-4, 1.25e-3, 1.75e-3]))
                + np.sin(4000*PI*np.array([2.5e-4, 7.5e-4, 1.25e-3, 1.75e-3])), 1))
_tt, _s2w = sp.symbols('t omega', real=True)
chk("M7 7.2 ex-73a-b check: (pi/(2 pi j)) 2j sin(4000 pi t) = sin(4000 pi t)",
    sp.simplify(sp.pi/(2*sp.pi*sp.I)*2*sp.I*sp.sin(4000*sp.pi*_tt) - sp.sin(4000*sp.pi*_tt)) == 0)
chk("M7 7.2 ex-73a-b prediction: sin(6000 pi t) moves the Nyquist rate to 12000 pi rad/s",
    abs(2*max(0, 2000*PI, 6000*PI) - 12000*PI) < 1e-9)

# m7-ex-73b: the sinc signal of part (b), its rectangle and its copies
_W = 4000*sp.pi
chk("M7 7.2 ex-73b: (1/2pi) int_{-4000pi}^{4000pi} e^{jwt} dw = sin(4000 pi t)/(pi t)",
    sp.simplify(sp.integrate(sp.exp(sp.I*_s2w*_tt), (_s2w, -_W, _W), conds='none').rewrite(sp.sin)/(2*sp.pi)
                - sp.sin(_W*_tt)/(sp.pi*_tt)) == 0)
chk("M7 7.2 ex-73b: at the Nyquist rate the copies of the rectangle stand 1/T = 4000 tall and touch at +-4000 pi",
    abs(1/(2*PI/(8000*PI)) - 4000) < 1e-9 and abs((8000*PI - 4000*PI) - 4000*PI) < 1e-9)
chk("M7 7.2 ex-73b: f_s = 1/T = 4000 Hz", abs(1/2.5e-4 - 4000) < 1e-9)
chk("M7 7.2 ex-73b prediction: 1/w_s = 39.8 us is the distractor",
    abs(1/(8000*PI)*1e6 - 39.8) < 0.05)

# m7-ex-73b-b
chk("M7 7.2 ex-73b-b: 0.25 s is four samples a second", abs(1/0.25 - 4) < 1e-12)
chk("M7 7.2 ex-73b-b: T = 0.25 s later is 500 cycles of a 2000 Hz tone", abs(0.25*2000 - 500) < 1e-9)
chk("M7 7.2 ex-73b-b: the sample instants every 0.25 ms fall on cos(4000 pi t) = +-1",
    np.allclose(np.abs(np.cos(4000*PI*np.arange(9)*2.5e-4)), 1))
chk("M7 7.2 ex-73b-b prediction: w_s = 12000 pi gives T = 1/6000 s = 166.7 us",
    abs(2*PI/(12000*PI) - 1/6000) < 1e-15 and abs(1e6/6000 - 166.7) < 0.05)
chk("M7 7.2 ex-73b-b prediction: 1/w_s = 26.5 us and 0.1667 s are the distractors",
    abs(1e6/(12000*PI) - 26.5) < 0.05 and abs(1000/6000 - 0.1667) < 5e-5)

# m7-ex-73c: the scrubber and the peak
def _s2area(shift, Wr=4000*PI):
    """area of the overlap of two unit rectangles of half-width Wr, one shifted"""
    return max(0.0, 2*Wr - abs(shift))
chk("M7 7.2 ex-73c: the overlap area at zero shift is 8000 pi and X(j0) = 4000",
    abs(_s2area(0) - 8000*PI) < 1e-9 and abs(_s2area(0)/(2*PI) - 4000) < 1e-9)
chk("M7 7.2 ex-73c slider: X(jw) = (8000 - 1000|v|) pi / 2 pi, 2000 at the default -4000 pi",
    all(abs(_s2area(v*1000*PI)/(2*PI) - max(0, 8000 - 1000*abs(v))/2) < 1e-9 for v in np.arange(-10, 10.01, 0.5))
    and abs(_s2area(-4000*PI)/(2*PI) - 2000) < 1e-9)
_dw = 10*PI; _g = -6000*PI + _dw*(np.arange(1200) + 0.5)
_R = (np.abs(_g) <= 4000*PI).astype(float)
_Xc = np.convolve(_R, _R)*_dw/(2*PI)
chk("M7 7.2 ex-73c: the numerical convolution peaks at 4000 and ends at 8000 pi",
    abs(_Xc.max() - 4000) < 1e-6 and abs((_Xc > 1e-9).sum()*_dw - 16000*PI) < 2*_dw)

# m7-ex-73c-b
chk("M7 7.2 ex-73c-b: w_M = 2 x 4000 pi and T = 2 pi / 16000 pi = 125 us",
    abs(2*4000*PI - 8000*PI) < 1e-9 and abs(2*PI/(16000*PI) - 125e-6) < 1e-18)
chk("M7 7.2 ex-73c-b: 125 us is half of 0.25 ms, and w_s T = 16000 pi x 1.25e-4 = 2 pi",
    abs(0.25e-3/125e-6 - 2) < 1e-12 and abs(16000*PI*1.25e-4 - 2*PI) < 1e-12)
chk("M7 7.2 ex-73c-b prediction: at 32000 pi, X_max/T = 4000 x 16000 = 6.4e7",
    abs(4000/(2*PI/(32000*PI)) - 6.4e7) < 1e-3 and abs(4000*16000 - 6.4e7) < 1e-6)
chk("M7 7.2 ex-73c-b: the distractors 3.2e7 and 1.6e7 are the Nyquist-rate height and its half",
    abs(4000*8000 - 3.2e7) < 1e-6 and abs(3.2e7/2 - 1.6e7) < 1e-6)

# m7-real-nyquist: the four everyday rates
chk("M7 7.2 gallery: telephone 2 x 3.4 kHz = 6.8 kHz < 8 kHz", abs(2*3.4 - 6.8) < 1e-12 and 6.8 < 8)
chk("M7 7.2 gallery: 2 pi 0.5 = pi and 2 pi 3.4 = 6.8 pi (t in ms, f in kHz)",
    abs(2*PI*0.5 - PI) < 1e-12 and abs(2*PI*3.4 - 6.8*PI) < 1e-12)
chk("M7 7.2 gallery: CD 44.1 kHz against 2 x 20 kHz, 2.2 samples a cycle of 20 kHz, cos(40 pi t)",
    44.1 > 40 and abs(round(44.1/20, 1) - 2.2) < 1e-12 and abs(2*PI*20 - 40*PI) < 1e-12)
chk("M7 7.2 gallery: heart rate 0.2 Hz < 0.5 Hz and 2 pi 0.2 = 0.4 pi",
    0.2 < 0.5 and abs(2*PI*0.2 - 0.4*PI) < 1e-12)
chk("M7 7.2 gallery: temperature 1/24 per hour < 0.5 per hour and 2 pi (t - 15)/24 = pi (t - 15)/12",
    1/24 < 0.5 and abs(2*PI/24 - PI/12) < 1e-12)
chk("M7 7.2 gallery: margins 8 - 6.8 = 1.2 kHz and 44.1 - 40 = 4.1 kHz, both positive",
    abs(8 - 6.8 - 1.2) < 1e-12 and abs(44.1 - 40 - 4.1) < 1e-9)

# Laboratory J2: the slider, the presets and the line spectrum
_U = PI/5
chk("LabJ2 the slider runs k = 11..40 in steps of pi/5: 2.2 pi to 8 pi rad/s, Nyquist rate at k = 20",
    abs(11*_U - 2.2*PI) < 1e-12 and abs(40*_U - 8*PI) < 1e-12 and abs(20*_U - 4*PI) < 1e-12)
chk("LabJ2 presets T1, T2, T3 are k = 25, 20, 15, that is 5 pi, 4 pi, 3 pi",
    all(abs(k*_U - 2*PI/T) < 1e-12 for k, T in [(25, 0.4), (20, 0.5), (15, 2/3)]))
chk("LabJ2 at every slider step w_s >= w_M, so only neighbouring copies overlap",
    all(k*_U >= _s2wM for k in range(11, 41)))
chk("LabJ2 overlap width 2 w_M - w_s matches the measured overlap at every overlapping step",
    all(abs(_s2ov(k*_U)[2] - (4*PI - k*_U)) < 1e-12 for k in range(11, 20)))
chk("LabJ2 the gap from w_M to w_s - w_M is (k - 10) pi/5 - w_M wide",
    all(abs((k*_U - _s2wM) - (k - 10)*_U) < 1e-12 for k in range(11, 41)))
_lines = [(0, 2*PI), (PI, PI), (-PI, PI), (2*PI, PI/1j), (-2*PI, -PI/1j)]
chk("LabJ2 the three-line signal 1 + cos(pi t) + sin(2 pi t) has these five lines and w_M = 2 pi",
    max(abs(p) for p, _ in _lines) == 2*PI
    and np.allclose(sum(c*np.exp(1j*p*_n*0.01) for p, c in _lines)/(2*PI),
                    1 + np.cos(PI*_n*0.01) + np.sin(2*PI*_n*0.01)))
def _s2agg(ws, span=10*PI):
    agg = {}
    K = int(np.ceil(span/ws)) + 1
    for k in range(-K, K + 1):
        for p, c in _lines:
            q = round((p + k*ws)/(PI/1000))
            agg[q] = agg.get(q, 0) + c*ws/(2*PI)
    return agg
_a = _s2agg(4*PI)
chk("LabJ2 at the Nyquist rate the sine lines at +-2 pi cancel",
    abs(_a[round(2*PI/(PI/1000))]) < 1e-9 and abs(_a[round(-2*PI/(PI/1000))]) < 1e-9)
_a = _s2agg(3*PI)
chk("LabJ2 at T3 the cosine copy lands on w_M: 3 pi - pi = 2 pi, and |sum| = sqrt(2) pi/T",
    abs(3*PI - PI - 2*PI) < 1e-12 and abs(abs(_a[round(2*PI/(PI/1000))]) - np.sqrt(2)*PI*1.5) < 1e-9)
chk("LabJ2 copy height 1/T = w_s/2pi is 2.5, 2 and 1.5 at the presets",
    all(abs(k*_U/(2*PI) - h) < 1e-12 for k, h in [(25, 2.5), (20, 2), (15, 1.5)]))

# --- m7-bandpass: the band 8 pi < |w| < 10 pi, width B = 2 pi (beyond the source)
def _s2bp(ws, L=8*PI, H=10*PI):
    """the slide's verdict: 1 apart, 0 touching, -1 overlapping"""
    B = H - L
    if ws < 2*B - 1e-9:
        return -1
    m = lambda x: x - np.floor(x/ws)*ws
    d = m(m(-H) - m(L)); g = min(d, ws - d) - B
    return 1 if g > 1e-9 else (0 if g > -1e-9 else -1)
def _s2bp_count(ws, L=8*PI, H=10*PI, span=30*PI, N=300001):
    """brute force: how many copies of the two halves cover each point of a grid"""
    w = np.linspace(-span, span, N); cnt = np.zeros_like(w)
    K = int(np.ceil((span + H)/ws)) + 1
    for k in range(-K, K + 1):
        c = w - k*ws
        cnt += ((c > L + 1e-9) & (c < H - 1e-9)).astype(float) + ((-c > L + 1e-9) & (-c < H - 1e-9)).astype(float)
    return w, cnt
_bL, _bH = 8*PI, 10*PI; _bB = _bH - _bL
chk("M7 7.2 bandpass: B = 2 pi, the lower edge 8 pi is 4B, 2B = 4 pi and 2 w_H = 20 pi, five times 4 pi",
    abs(_bB - 2*PI) < 1e-12 and abs(_bL - 4*_bB) < 1e-12 and abs(2*_bB - 4*PI) < 1e-12
    and abs(2*_bH - 20*PI) < 1e-12 and abs(2*_bH/(2*_bB) - 5) < 1e-12)
chk("M7 7.2 bandpass: at 4 pi, [8 pi, 10 pi] - 2 w_s = [0, 2 pi] and [-10 pi, -8 pi] + 3 w_s = [2 pi, 4 pi]",
    abs(8*PI - 2*4*PI) < 1e-12 and abs(10*PI - 2*4*PI - 2*PI) < 1e-12
    and abs(-10*PI + 3*4*PI - 2*PI) < 1e-12 and abs(-8*PI + 3*4*PI - 4*PI) < 1e-12)
_w, _c = _s2bp_count(4*PI)
chk("M7 7.2 bandpass: at w_s = 4 pi the copies fill the axis with no overlap (one copy almost everywhere)",
    _c.max() == 1 and np.mean(_c == 1) > 0.999)
_band = (np.abs(_w) > _bL + 1e-6) & (np.abs(_w) < _bH - 1e-6)
_k0 = ((_w > _bL) & (_w < _bH)) | ((-_w > _bL) & (-_w < _bH))
chk("M7 7.2 bandpass: inside 8 pi < |w| < 10 pi only the band itself (k = 0) is present, so a band-pass filter returns x(t)",
    np.all(_c[_band] == 1) and np.all(_k0[_band]))
_grid = np.round(np.arange(3, 22.0001, 0.1), 10)
chk("M7 7.2 bandpass: the slider verdict agrees with a brute-force count at every slider step 3..22 pi",
    all((_s2bp(v*PI) < 0) == (_s2bp_count(v*PI)[1].max() >= 2) for v in _grid))
chk("M7 7.2 bandpass: verdicts 4 pi touch, 7 pi apart, 9 pi overlap, 12 pi apart, 17 pi overlap, 22 pi apart",
    [_s2bp(v*PI) for v in [4, 7, 9, 12, 17, 22]] == [0, 1, -1, 1, -1, 1])
_W = [(4, 4), (5, 16/3), (20/3, 8), (10, 16), (20, 23)]
_fine = np.arange(3, 23.0001, 0.001)
chk("M7 7.2 bandpass: the copies fit exactly on 4 pi, [5, 16/3] pi, [20/3, 8] pi, [10, 16] pi and from 20 pi up",
    all((_s2bp(v*PI) >= 0) == any(p - 1e-9 <= v <= q + 1e-9 for p, q in _W) for v in _fine)
    and all(_s2bp(v*PI) == 0 for v in [4, 5, 16/3, 20/3, 8, 10, 16, 20]))
chk("M7 7.2 bandpass: the window ends read 5.33 pi = 16/3 pi and 6.67 pi = 20/3 pi",
    f"{16/3:.2f}" == "5.33" and f"{20/3:.2f}" == "6.67")
chk("M7 7.2 bandpass: the default slider value 4 pi shows the copies touching", _s2bp(4*PI) == 0)
_lo = [v for v in np.arange(0.5, 30.0001, 0.01) if _s2bp(v*PI, 12*PI, 14*PI) >= 0]
chk("M7 7.2 bandpass prediction: for 12 pi < |w| < 14 pi (lower edge 6B) the lowest fitting rate is 4 pi = 2B",
    abs(12*PI - 6*2*PI) < 1e-12 and abs(_lo[0] - 4) < 1e-9 and _s2bp(4*PI, 12*PI, 14*PI) == 0
    and _s2bp_count(4*PI, 12*PI, 14*PI)[1].max() == 1 and abs(2*14 - 28) < 1e-12)
chk("M7 7.2 bandpass code: the six printed verdicts are touching, apart, overlapping, apart, overlapping, apart",
    [{1: 'apart', 0: 'touching', -1: 'overlapping'}[_s2bp(v*PI)] for v in [4, 7, 9, 12, 17, 22]]
    == ['touching', 'apart', 'overlapping', 'apart', 'overlapping', 'apart'])
# </m7-s2-verify>

# <m7-s3-verify> 7.3 reconstruction
# Every number the 7.3 slides, the gallery and Laboratory J state. The
# kernel, the two hold responses and the compensator are also checked as
# formulas in sections 7 and 8 above.
def s3_x(tt):
    """the running signal (sin(pi t)/(pi t))^2"""
    u = PI*np.asarray(tt, dtype=float)
    z = np.abs(u) < 1e-12
    return ((np.sin(u) + z)/(u + z))**2
def s3_sinc(u):
    """unnormalised sinc, sin(u)/u"""
    u = np.asarray(u, dtype=float)
    z = np.abs(u) < 1e-12
    return (np.sin(u) + z)/(u + z)
def s3_interp(tt, T, N=400, wt=None):
    """band-limited interpolation with w_c = pi/T; wt(n) weights each term"""
    n = np.arange(-N, N+1)
    w = np.ones(n.size) if wt is None else np.array([wt(k) for k in n], dtype=float)
    return np.array([np.sum(w*s3_x(n*T)*s3_sinc(PI*(t0 - n*T)/T)) for t0 in np.atleast_1d(tt)])
s3_grid = (np.arange(60000) + 0.5)/10000 - 3          # the fine grid of the code page

# ---- m7-recon: the figure and the prediction
chk("M7s3 recon: T = 1/3 s gives w_s = 6 pi rad/s and copies of height 1/T = 3",
    abs(2*PI/(1/3) - 6*PI) < 1e-12 and abs(1/(1/3) - 3) < 1e-12)
chk("M7s3 recon: the cutoff 3 pi lies in (w_M, w_s - w_M) = (2 pi, 4 pi)",
    2*PI < 3*PI < 6*PI - 2*PI)
lo, hi = 2*PI, 10*PI - 2*PI
chk("M7s3 recon Given: w_M = 2 pi, w_s = 10 pi gives the interval (2 pi, 8 pi)",
    abs(lo - 2*PI) < 1e-12 and abs(hi - 8*PI) < 1e-12)
chk("M7s3 recon Given: only 5 pi of pi, 5 pi, 9 pi lies in it",
    [lo < c < hi for c in (PI, 5*PI, 9*PI)] == [False, True, False])
Tg = 0.25
chk("M7s3 recon: a filter of gain 1 returns x(t)/T (the baseband copy is X/T)",
    abs(1*(1/Tg)*1.0 - 1.0/Tg) < 1e-15 and abs(Tg*(1/Tg) - 1) < 1e-15)

# ---- m7-recon-b: the chain in time
chk("M7s3 recon-b: T = 0.25 s gives w_c = pi/T = 4 pi rad/s, inside (2 pi, 6 pi)",
    abs(PI/0.25 - 4*PI) < 1e-12 and 2*PI < 4*PI < 8*PI - 2*PI)
pts = np.array([0.13, -0.41, 0.88, 1.37])
chk("M7s3 recon-b: the filter output lies on x(t) at T = 0.25 s",
    np.max(np.abs(s3_interp(pts, 0.25) - s3_x(pts))) < 1e-5,
    f"max err {np.max(np.abs(s3_interp(pts, 0.25) - s3_x(pts))):.2e}")
chk("M7s3 recon-b Given: t = nT + T/2 is never a sample instant, so x_p(t) = 0 there",
    all(abs(((n*0.25 + 0.125)/0.25) - round((n*0.25 + 0.125)/0.25)) > 0.4 for n in range(-8, 9)))

# ---- m7-interp: the kernels one pair at a time, and the doubled sample
tt = np.linspace(-1.5, 1.5, 61)
full = s3_interp(tt, 0.25)
chk("M7s3 interp: every term together lands on x(t), T = 0.25 s",
    np.max(np.abs(full - s3_x(tt))) < 1e-5, f"max err {np.max(np.abs(full - s3_x(tt))):.2e}")
part = [np.max(np.abs(s3_interp(tt, 0.25, wt=lambda k, m=m: 1.0 if abs(k) <= m else 0.0) - s3_x(tt)))
        for m in (0, 1, 2, 3)]
chk("M7s3 interp: each added pair n = 0, +-1, +-2, +-3 brings the sum closer to x(t)",
    all(part[i+1] < part[i] for i in range(3)), " > ".join(f"{p:.4f}" for p in part))
chk("M7s3 interp: the sample values drawn at T = 0.25 s are 1, 0.811, 0.405, 0.090",
    np.allclose(s3_x(np.array([0, .25, .5, .75])), [1, 0.8106, 0.4053, 0.0901], atol=5e-4))
d = s3_interp(tt, 0.25, wt=lambda k: 2.0 if k == 0 else 1.0) - full
chk("M7s3 interp Given: doubling x(0) adds exactly x(0) h_LP(t)",
    np.max(np.abs(d - s3_x(0.0)*s3_sinc(PI*tt/0.25))) < 1e-12)
chk("M7s3 interp: the added kernel spreads over all t (non-zero between samples)",
    abs(s3_sinc(PI*0.1/0.25)) > 0.5)

# ---- m7-interp-b: the kernel at any cutoff, and the choice pi/T
for c in (0.5, 1.0, 1.5, 2.0):
    wc = c*PI                                                  # T = 1
    num = np.trapezoid(np.ones(200001), np.linspace(-wc, wc, 200001))/(2*PI)
    chk(f"M7s3 interp-b: h_LP(0) = T w_c / pi = {c:g} at w_c = {c:g} pi/T", abs(num - c) < 1e-9)
chk("M7s3 interp-b Given: w_c = 1.5 pi/T gives h_LP(0) = 1.5, not 1 or 1.5 T",
    abs(0.3*(1.5*PI/0.3)/PI - 1.5) < 1e-12)
ok = True
for wM, ws in [(2*PI, 5*PI), (1.0, 3.0), (3.0, 6.5)]:
    ok &= abs(ws/2 - (wM + (ws - wM))/2) < 1e-12 and (wM < ws/2 < ws - wM) == (wM < ws/2)
chk("M7s3 interp-b: pi/T = w_s/2 is the middle of (w_M, w_s - w_M), inside iff w_M < w_s/2", ok)
chk("M7s3 interp-b: with w_c = pi/T the kernel is 1 at 0 and 0 at every other mT",
    abs(s3_sinc(0.0) - 1) < 1e-15 and max(abs(s3_sinc(PI*m)) for m in range(1, 6)) < 1e-15)

# ---- m7-interp-c: the kernel with the pi dropped
bad = lambda u: 1/PI if abs(u) < 1e-12 else np.sin(u)/(PI*u)
chk("M7s3 interp-c: the damaged kernel is sin(1)/pi = 0.267849 at t = T",
    abs(bad(1.0) - 0.267849) < 1e-6)
chk("M7s3 interp-c Given: the damaged kernel at t = 0 is 1/pi = 0.318",
    abs(bad(1e-9) - 1/PI) < 1e-9 and abs(1/PI - 0.318) < 5e-4)
chk("M7s3 interp-c: its zeros are at t = m pi T, not at the sample instants",
    abs(bad(PI)) < 1e-15 and min(abs(bad(m)) for m in range(1, 5)) > 1e-3)

# ---- m7-zoh and m7-foh: the largest gap, and how it scales with T
def s3_gap(T, kind):
    if kind == 'zoh':
        y = s3_x(np.floor(s3_grid/T)*T)
    else:
        nT = np.arange(-40, 41)*T
        y = np.interp(s3_grid, nT, s3_x(nT))
    return float(np.max(np.abs(y - s3_x(s3_grid))))
gz = [s3_gap(0.2, 'zoh'), s3_gap(0.1, 'zoh')]
gf = [s3_gap(0.2, 'foh'), s3_gap(0.1, 'foh')]
chk("M7s3 zoh: largest ZOH gap 0.3181 at T = 0.2 s and 0.1674 at T = 0.1 s",
    abs(gz[0] - 0.3181) < 5e-5 and abs(gz[1] - 0.1674) < 5e-5, f"{gz[0]:.4f}, {gz[1]:.4f}")
chk("M7s3 zoh Given: halving T about halves the ZOH gap (ratio in 0.4 to 0.6)",
    0.4 < gz[1]/gz[0] < 0.6, f"ratio {gz[1]/gz[0]:.3f}")
chk("M7s3 foh: largest FOH gap 0.0300 at T = 0.2 s and 0.0080 at T = 0.1 s",
    abs(gf[0] - 0.0300) < 5e-5 and abs(gf[1] - 0.0080) < 5e-5, f"{gf[0]:.4f}, {gf[1]:.4f}")
chk("M7s3 foh Given: halving T about quarters the FOH gap (ratio in 0.2 to 0.3)",
    0.2 < gf[1]/gf[0] < 0.3, f"ratio {gf[1]/gf[0]:.3f}")
chk("M7s3 foh: the straight lines beat the staircase at the same T",
    gf[0] < gz[0] and gf[1] < gz[1])

# ---- m7-zoh-b: reading |H_0|
H0m = lambda w, T: T if abs(w) < 1e-12 else abs(2*np.sin(w*T/2)/w)
H1v = lambda w, T: T if abs(w) < 1e-12 else (np.sin(w*T/2)/(w/2))**2/T
chk("M7s3 zoh-b: T = 0.5 s gives w_s = 4 pi and w_s/2 = 2 pi rad/s",
    abs(2*PI/0.5 - 4*PI) < 1e-12)
chk("M7s3 zoh-b: |H_0(w_s/2)| = 2T/pi = 0.64 T",
    abs(H0m(PI/0.5, 0.5)/0.5 - 2/PI) < 1e-12 and abs(2/PI - 0.64) < 5e-3, f"{2/PI:.4f}")
chk("M7s3 zoh-b Given: T = 0.1 s puts the first zero at 2 pi/T = 20 pi rad/s",
    abs(H0m(20*PI, 0.1)) < 1e-12 and min(H0m(w, 0.1) for w in np.linspace(0.1, 20*PI - 0.1, 4000)) > 1e-6)
chk("M7s3 zoh-b Given: 10 pi and pi/10 rad/s are not zeros of H_0 at T = 0.1 s",
    H0m(10*PI, 0.1) > 1e-3 and H0m(PI/10, 0.1) > 1e-3)

# ---- m7-zoh-hear: the level of the first copy of a held tone
Hf = lambda f, fs: abs(np.sin(PI*f/fs))/(PI*f)
for fs, want in [(2000, 0.18), (8000, 0.04)]:
    r = Hf(fs - 300, fs)/Hf(300, fs)
    chk(f"M7s3 zoh-hear: at f_s = {fs} Hz the first copy is 300/{fs-300} = {r:.4f}, about {want}",
        abs(r - 300/(fs - 300)) < 1e-12 and abs(r - want) < 5e-3)
up = 100
k = np.arange(2000*up)
X = np.abs(np.fft.fft(np.cos(2*PI*300*np.floor(k/up)/2000)))
chk("M7s3 zoh-hear: an FFT of one second of the held tone agrees with f0/(fs - f0)",
    abs(X[1700]/X[300] - 300/1700) < 1e-3, f"{X[1700]/X[300]:.5f} against {300/1700:.5f}")
chk("M7s3 zoh-hear: the next copies sit at f_s + 300 and 2 f_s - 300 Hz",
    X[2300]/X[300] > 0.05 and X[3700]/X[300] > 0.05 and X[1000]/X[300] < 1e-9)

# ---- m7-zoh-c: the compensator's boost
boost = lambda w, T: T*w/(2*np.sin(w*T/2))
chk("M7s3 zoh-c: the boost T/|H_0| rises from 1 to pi/2 = 1.57 across |w| < pi/T",
    abs(boost(1e-6, 0.5) - 1) < 1e-9 and abs(boost(PI/0.5, 0.5) - PI/2) < 1e-12 and abs(PI/2 - 1.57) < 1e-3)
chk("M7s3 zoh-c Given: with the band stopped at w_s/4 the largest boost is pi/(2 sqrt 2) = 1.11 < pi/2",
    abs(boost(PI/(2*0.5), 0.5) - PI/(2*np.sqrt(2))) < 1e-12 and abs(PI/(2*np.sqrt(2)) - 1.11) < 5e-3
    and PI/(2*np.sqrt(2)) < PI/2)

# ---- m7-foh-b: the triangle
Tt = 0.5
tau = np.linspace(-2, 2, 400001)
g = lambda s: (np.abs(s) <= Tt/2).astype(float)
for t0, want in [(0.0, 0.5), (0.1, 0.4), (0.3, 0.2), (0.6, 0.0)]:
    val = np.trapezoid(g(tau)*g(t0 - tau), tau)
    chk(f"M7s3 foh-b: (g*g)({t0:g}) = T - |t| = {want:g} with T = 0.5 s", abs(val - want) < 1e-4, f"{val:.5f}")
chk("M7s3 foh-b: the triangle has peak T = 0.5 and h_1 = (g*g)/T has peak 1",
    abs(Tt - 0.5) < 1e-15 and abs(Tt/Tt - 1) < 1e-15)
chk("M7s3 foh-b Given: T = 0.2 s gives h_1(0.1) = 1 - 0.1/0.2 = 0.5",
    abs((1 - 0.1/0.2) - 0.5) < 1e-15)
nT = np.arange(-20, 21)*0.2
tri1 = lambda s, T: np.maximum(0.0, 1 - np.abs(s)/T)
ts = np.linspace(-2, 2, 801)
lin = np.array([np.sum(s3_x(nT)*tri1(t0 - nT, 0.2)) for t0 in ts])
chk("M7s3 foh-b: the sum of triangles x(nT) h_1(t - nT) is the straight-line join",
    np.max(np.abs(lin - np.interp(ts, nT, s3_x(nT)))) < 1e-12)

# ---- m7-foh-c: the two holds compared, T = 0.5 s
chk("M7s3 foh-c: H_1(w_s/2) = 4T/pi^2 = 0.41 T and |H_0(w_s/2)| = 0.64 T",
    abs(H1v(2*PI, 0.5)/0.5 - 4/PI**2) < 1e-12 and abs(4/PI**2 - 0.41) < 5e-3)
chk("M7s3 foh-c: both holds start at T", abs(H0m(0, 0.5) - 0.5) < 1e-15 and abs(H1v(0, 0.5) - 0.5) < 1e-15)
chk("M7s3 foh-c Given: |H_0(j6pi)| = 1/(3 pi) = 0.106 is larger than H_1(j6pi) = 2/(9 pi^2) = 0.023",
    abs(H0m(6*PI, 0.5) - 1/(3*PI)) < 1e-12 and abs(H1v(6*PI, 0.5) - 2/(9*PI**2)) < 1e-12
    and abs(1/(3*PI) - 0.106) < 5e-4 and abs(2/(9*PI**2) - 0.023) < 5e-4 and H0m(6*PI, 0.5) > H1v(6*PI, 0.5))
peaks0 = [H0m((2*k+1)*PI/0.5, 0.5) for k in (2, 4)]
peaks1 = [H1v((2*k+1)*PI/0.5, 0.5) for k in (2, 4)]
chk("M7s3 foh-c: the side lobes fall as 1/w for the ZOH and 1/w^2 for the FOH",
    abs(peaks0[0]/peaks0[1] - 9/5) < 1e-9 and abs(peaks1[0]/peaks1[1] - (9/5)**2) < 1e-9)

# ---- m7-perfect: the pulse, its transform, and the prediction
wv = np.array([0.7, 3.1, 9.4])
num = np.array([np.trapezoid(np.cos(w*np.linspace(-0.5, 0.5, 200001)), np.linspace(-0.5, 0.5, 200001)) for w in wv])
chk("M7s3 perfect: the pulse on |t| <= 0.5 s has X(jw) = 2 sin(w/2)/w",
    np.max(np.abs(num - 2*np.sin(wv/2)/wv)) < 1e-9)
chk("M7s3 perfect: its zeros are isolated points 2 pi k, not an interval",
    all(abs(2*np.sin(w/2)/w) > 1e-4 for w in np.linspace(2*PI + 0.01, 4*PI - 0.01, 500)))
chk("M7s3 perfect: T = 0.25 s gives copies of height 1/T = 4, w_s = 8 pi rad/s",
    abs(1/0.25 - 4) < 1e-15 and abs(2*PI/0.25 - 8*PI) < 1e-12)
chk("M7s3 perfect Given: cos(10 pi t) has w_M = 10 pi, so any w_s > 20 pi rad/s recovers it",
    abs(2*10*PI - 20*PI) < 1e-12)

# ---- m7-real-recon: the gallery
chk("M7s3 gallery: a 16 kHz rate holds for T = 62.5 us, an 8 kHz rate samples every 125 us",
    abs(1/16000 - 62.5e-6) < 1e-15 and abs(1/8000 - 125e-6) < 1e-15)
tt = np.linspace(0.0003, 0.0019, 9)
n = np.arange(-4000, 4001)
yr = np.array([np.sum(np.sin(2*PI*1000*n/8000)*s3_sinc(PI*(t0*8000 - n))) for t0 in tt])
chk("M7s3 gallery: the 8 kHz samples of a 1 kHz tone interpolate back to sin(2 pi 1000 t)",
    np.max(np.abs(yr - np.sin(2*PI*1000*tt))) < 2e-3, f"max err {np.max(np.abs(yr - np.sin(2*PI*1000*tt))):.1e}")
bn = 100*(1 - 0.7**np.arange(15))
chk("M7s3 gallery: b[n] = 100(1 - 0.7^n) % starts at 0 and stays below 100",
    bn[0] == 0 and bn.max() < 100 and bn[-1] > 99)
th = 18 + 6*np.sin(2*PI*(3*np.arange(9) - 9)/24)
chk("M7s3 gallery: the 3-hourly readings lie between 12 and 24 degrees C, peak at 15 h",
    th.min() >= 12 - 1e-9 and abs(th.max() - 24) < 1e-9 and 3*int(np.argmax(th)) == 15)

# ---- Laboratory J (key J), 74_labs_m7.js: x(t) = 1 + cos(wM t/2) + sin(wM t), fM = 3 Hz
def labJ_lines(wM):
    return [(0.0, 2*PI+0j), (wM/2, PI+0j), (-wM/2, PI+0j), (wM, -1j*PI), (-wM, 1j*PI)]
def labJ_replicas(wM, ws):
    span = max(2.4*ws, 3.2*wM)
    K = min(60, int(np.ceil(span/ws)) + 1)
    tol, agg = ws*1e-9, {}
    for k in range(-K, K+1):
        for p0, c in labJ_lines(wM):
            p = p0 + k*ws
            if abs(p) > span: continue
            key = round(p/tol)
            agg[key] = (p, agg[key][1] + c) if key in agg else (p, c)
    return list(agg.values())
labJ_x = lambda t, wM: 1 + np.cos(wM*t/2) + np.sin(wM*t)
def labJ_rec(fS, mode, wM=2*PI*3):
    ws, Ts = 2*PI*fS, 1/fS
    if mode == 'ideal':
        keep = [(p, c) for p, c in labJ_replicas(wM, ws) if abs(p) < ws/2 - 1e-9]
        return lambda t: sum(c.real*np.cos(p*t) - c.imag*np.sin(p*t) for p, c in keep)/(2*PI)
    if mode == 'zoh':
        return lambda t: labJ_x(np.floor(t/Ts)*Ts, wM)
    return lambda t: (1 - (t/Ts - np.floor(t/Ts)))*labJ_x(np.floor(t/Ts)*Ts, wM) \
        + (t/Ts - np.floor(t/Ts))*labJ_x((np.floor(t/Ts) + 1)*Ts, wM)
def labJ_rms(fS, mode, wM=2*PI*3):
    win = 4*PI/(wM/2); t = win*np.arange(1600)/1600
    return float(np.sqrt(np.mean((labJ_rec(fS, mode)(t) - labJ_x(t, wM))**2)))
labJ_fold = lambda w0, ws: abs(((w0 + ws/2) % ws + ws) % ws - ws/2)
wMJ = 2*PI*3
chk("LabJ the signal has w_M = 6 pi rad/s (f_M = 3 Hz), and the error window is 4/3 s",
    abs(wMJ - 6*PI) < 1e-12 and abs(4*PI/(wMJ/2) - 4/3) < 1e-12)
chk("LabJ oversampling (12 Hz): w_s = 75.40 rad/s, guard band 12 pi = 37.70 rad/s",
    abs(2*PI*12 - 75.398) < 1e-3 and abs(2*PI*12 - 2*wMJ - 37.699) < 1e-3)
chk("LabJ oversampling, ideal filter: the error is 0", labJ_rms(12, 'ideal') < 1e-9,
    f"rms {labJ_rms(12, 'ideal'):.1e}")
chk("LabJ critical (6 Hz): w_s = 2 w_M and every sample of sin(6 pi t) is zero",
    abs(2*PI*6 - 2*wMJ) < 1e-12 and np.max(np.abs(np.sin(6*PI*np.arange(-30, 31)/6))) < 1e-12)
chk("LabJ critical, ideal filter: the band-edge sine is lost, error 1/sqrt 2 = 0.7071",
    abs(labJ_rms(6, 'ideal') - 1/np.sqrt(2)) < 1e-6, f"rms {labJ_rms(6, 'ideal'):.6f}")
chk("LabJ critical: the band edge folds onto the cutoff (the 'lost' verdict)",
    abs(labJ_fold(wMJ, 2*PI*6) - PI*6) < 1e-9)
chk("LabJ undersampling (4.5 Hz): guard band -3 pi rad/s",
    abs((2*PI*4.5 - 2*wMJ) + 3*PI) < 1e-9)
chk("LabJ undersampling: the 3 Hz term returns at 1.5 Hz, the 1.5 Hz term stays",
    abs(labJ_fold(wMJ, 2*PI*4.5)/(2*PI) - 1.5) < 1e-9 and abs(labJ_fold(wMJ/2, 2*PI*4.5) - wMJ/2) < 1e-9)
chk("LabJ undersampling, ideal filter: error exactly 1", abs(labJ_rms(4.5, 'ideal') - 1) < 1e-6,
    f"rms {labJ_rms(4.5, 'ideal'):.6f}")
ez, ef = labJ_rms(12, 'zoh'), labJ_rms(12, 'foh')
chk("LabJ at 12 Hz both holds leave a non-zero error, the first-order hold the smaller",
    ez > 1e-2 and ef > 1e-3 and ef < ez, f"zoh {ez:.4f}, foh {ef:.4f}")
chk("LabJ the hold errors shrink as the rate rises (12 Hz to 30 Hz)",
    labJ_rms(30, 'zoh') < ez and labJ_rms(30, 'foh') < ef)
chk("LabJ every preset and method gives a finite error",
    all(np.isfinite(labJ_rms(f, m)) for f in (12, 6, 4.5) for m in ('ideal', 'zoh', 'foh')))
# </m7-s3-verify>

# <m7-s4-verify> 7.4 aliasing in practice
# The numbers of section 7.4: the slides, their prediction cards, the
# gallery captions and the fixed numbers of Laboratory J4. A kept line is
# one strictly inside |w| < ws/2, the filter of the slides.
def s4_fold(f0, fs):
    return abs(f0 - fs*np.floor(f0/fs + 0.5))
def s4_kept(ws, comps, K=6):
    out = set()
    for k in range(-K, K+1):
        for w0 in comps:
            for sg in (1, -1):
                pos = k*ws + sg*w0
                if abs(pos) < ws/2 - 1e-9:
                    out.add(round(pos/PI, 9))
    return sorted(out)
def s4_same(f1, f2, T, N=60):
    n = np.arange(-N, N+1)
    return np.max(np.abs(f1(n*T) - f2(n*T))) < 1e-9

# --- m7-alias-cos: w0 = 2 pi, three rates, cutoff ws/2
w0 = 2*PI
for r, keep in [(6, [-1.0, 1.0]), (3, [-1.0, 1.0]), (1.5, [-0.5, 0.5])]:
    got = [v/2 for v in s4_kept(r*w0, [w0])]   # in multiples of w0
    chk(f"7.4 ws = {r} w0: cutoff {r/2} w0 keeps {keep} w0", got == keep, str(got))
chk("7.4 at ws = 1.5 w0 the kept line is ws - w0 = 0.5 w0", abs((1.5 - 1) - 0.5) < 1e-12)
chk("7.4 at ws = 3 w0 the copy lines 2 w0 and 4 w0 lie outside 1.5 w0",
    2 > 1.5 and 4 > 1.5)
# --- m7-alias-cos-b: fs = 6 kHz
chk("7.4 f0 = 4 kHz at fs = 6 kHz returns at 2 kHz", abs(s4_fold(4, 6) - 2) < 1e-12)
chk("7.4 the 4 kHz and 2 kHz tones share every sample at 6 kHz",
    s4_same(lambda t: np.cos(2*PI*4*t), lambda t: np.cos(2*PI*2*t), 1/6))
chk("7.4 prediction: f0 = 5 kHz at fs = 6 kHz returns at 1 kHz", abs(s4_fold(5, 6) - 1) < 1e-12)
chk("7.4 prediction: only +-1 kHz lies inside |f| < 3 kHz",
    [v*PI/(2*PI) for v in s4_kept(2*PI*6, [2*PI*5])] == [-1.0, 1.0])
chk("7.4 the slider range 0.5..5.5 kHz crosses fs/2 = 3 kHz", 0.5 < 3 < 5.5)
for f in np.arange(0.5, 5.51, 0.1):
    fa = s4_fold(f, 6)
    if not (0 <= fa <= 3 + 1e-9 and s4_same(lambda t: np.cos(2*PI*f*t), lambda t: np.cos(2*PI*fa*t), 1/6)):
        chk(f"7.4 fold of {f:.1f} kHz at 6 kHz", False); break
else:
    chk("7.4 every slider tone folds into [0, 3] kHz with the same samples", True)
# --- m7-ex-alias: x = cos(2 pi t), Nyquist rate 4 pi
for T, wsx, wcx, wr in [(1/4, 8, 4, 2), (1/3, 6, 3, 2), (2/3, 3, 1.5, 1)]:
    ws = 2*PI/T
    kept = s4_kept(ws, [2*PI])
    chk(f"7.4 T = {T:.4f} s: ws = {wsx} pi, wc = {wcx} pi, x_r at {wr} pi",
        abs(ws/PI - wsx) < 1e-9 and abs(ws/2/PI - wcx) < 1e-9 and kept == [-wr, wr], str(kept))
chk("7.4 T1 and T2 exceed the Nyquist rate 4 pi, T3 does not",
    2*PI/(1/4) > 4*PI and 2*PI/(1/3) > 4*PI and 2*PI/(2/3) < 4*PI)
chk("7.4 against 6 pi the second row would be the boundary 6 pi >= 6 pi", abs(2*PI/(1/3) - 6*PI) < 1e-9)
chk("7.4 cos(4 pi n/3) = cos(2 pi n/3) for every n",
    s4_same(lambda t: np.cos(2*PI*t), lambda t: np.cos(PI*t), 2/3))
chk("7.4 prediction: T = 0.8 s gives ws = 2.5 pi and wc = 1.25 pi",
    abs(2*PI/0.8 - 2.5*PI) < 1e-9)
chk("7.4 prediction: at T = 0.8 s the filter returns cos(0.5 pi t)",
    s4_kept(2*PI/0.8, [2*PI]) == [-0.5, 0.5]
    and s4_same(lambda t: np.cos(2*PI*t), lambda t: np.cos(0.5*PI*t), 0.8))
# --- m7-hw-alias: cos(pi t) + cos(3 pi t) at T = 2/5
chk("7.4 T = 2/5 s gives ws = 5 pi < 6 pi and wc = 2.5 pi",
    abs(2*PI/0.4 - 5*PI) < 1e-9 and 5*PI < 6*PI)
chk("7.4 the kept lines at T = 2/5 s are +-pi and +-2 pi",
    s4_kept(5*PI, [PI, 3*PI]) == [-2.0, -1.0, 1.0, 2.0])
chk("7.4 3 pi and ws - pi = 4 pi lie outside 2.5 pi", 3 > 2.5 and 4 > 2.5)
chk("7.4 cos(pi t)+cos(3 pi t) and cos(pi t)+cos(2 pi t) share every sample at T = 2/5",
    s4_same(lambda t: np.cos(PI*t)+np.cos(3*PI*t), lambda t: np.cos(PI*t)+np.cos(2*PI*t), 0.4))
chk("7.4 cos(6 pi n/5) = cos(4 pi n/5) for every n",
    s4_same(lambda t: np.cos(3*PI*t), lambda t: np.cos(2*PI*t), 0.4))
chk("7.4 prediction: at T = 1/2 s the copy line 4 pi - 3 pi lands on pi, so x_r = 2 cos(pi t)",
    s4_kept(4*PI, [PI, 3*PI]) == [-1.0, 1.0] and abs(4*PI - 3*PI - PI) < 1e-12
    and s4_same(lambda t: np.cos(PI*t)+np.cos(3*PI*t), lambda t: 2*np.cos(PI*t), 0.5))
# --- m7-antialias: triangle to 3 pi, ws = 4 pi, H_AA keeps |w| < wa
def s4_X(w): return np.maximum(0, 1 - np.abs(w)/(3*PI))
def s4_Xr(w, wa):
    Y = lambda u: np.where(np.abs(u) < wa, s4_X(u), 0.0)
    s = sum(Y(w - k*4*PI) for k in range(-2, 3))
    return np.where(np.abs(w) < 2*PI, s, 0.0)
def s4_E(wa, N=600000):
    h = 6*PI/N; w = -3*PI + (np.arange(N) + 0.5)*h
    return float(np.sum((s4_X(w) - s4_Xr(w, wa))**2)*h/(2*PI))
E3, E2, E1 = s4_E(3*PI), s4_E(2*PI), s4_E(PI)
chk("7.4 no anti-aliasing filter (wa = 3 pi): error energy 2/27 = 0.074",
    abs(E3 - 2/27) < 1e-6 and f"{E3:.3f}" == "0.074", f"{E3:.6f}")
chk("7.4 wa = ws/2 = 2 pi: error energy 1/27 = 0.037",
    abs(E2 - 1/27) < 1e-6 and f"{E2:.3f}" == "0.037", f"{E2:.6f}")
chk("7.4 the filter at ws/2 halves the error energy", abs(E3/E2 - 2) < 1e-4, f"{E3/E2:.5f}")
chk("7.4 prediction: wa = pi gives a larger error energy, 8/27", abs(E1 - 8/27) < 1e-6 and E1 > E2, f"{E1:.6f}")
chk("7.4 wa = ws/2 is the smallest error on the slider range",
    min(s4_E(v*PI, 60000) for v in np.arange(1, 3.01, 0.1)) >= s4_E(2*PI, 60000) - 1e-9)
chk("7.4 X reaches 3 pi, beyond ws/2 = 2 pi for ws = 4 pi", 3*PI > 4*PI/2)
# --- m7-antialias-b: mean-square errors over one period of 2 s
tt = (np.arange(400000) + 0.5)*(2/400000)
e1 = np.cos(3*PI*tt) - np.cos(2*PI*tt); e2 = np.cos(3*PI*tt)
chk("7.4 mean-square error with no filter is 1", abs(np.mean(e1**2) - 1) < 1e-9, f"{np.mean(e1**2):.9f}")
chk("7.4 mean-square error filtered first is 1/2", abs(np.mean(e2**2) - 0.5) < 1e-9)
chk("7.4 the cross term averages to zero: mean of cos(pi t) + cos(5 pi t) over 2 s",
    abs(np.mean(np.cos(PI*tt) + np.cos(5*PI*tt))) < 1e-9)
chk("7.4 2 cos(3 pi t) cos(2 pi t) = cos(pi t) + cos(5 pi t)",
    np.max(np.abs(2*np.cos(3*PI*tt)*np.cos(2*PI*tt) - np.cos(PI*tt) - np.cos(5*PI*tt))) < 1e-9)
chk("7.4 a low-pass at 2.5 pi keeps pi and removes 3 pi", PI < 2.5*PI < 3*PI)
# --- m7-temporal / -b: 9 rev/s at 10 frames/s
def s4_seen(r, fs):
    u = r/fs; return (u - np.floor(u + 0.5))*fs
chk("7.4 9 rev/s at 10 frames/s is seen as 1 rev/s backwards", abs(s4_seen(9, 10) + 1) < 1e-9)
chk("7.4 ws = 20 pi < 2 w0 = 36 pi, and w0 - ws = -2 pi rad/s",
    20*PI < 36*PI and abs(18*PI - 20*PI + 2*PI) < 1e-12)
chk("7.4 e^{j 18 pi n/10} = e^{-j 2 pi n/10}: the kept line is at -2 pi rad/s",
    s4_same(lambda t: np.exp(1j*18*PI*t), lambda t: np.exp(-1j*2*PI*t), 0.1))
chk("7.4 cos(18 pi n/10) = cos(2 pi n/10) for every n",
    s4_same(lambda t: np.cos(18*PI*t), lambda t: np.cos(2*PI*t), 0.1))
for n in range(1, 6):
    turn = 0.9*n; back = -(turn - np.floor(turn + 0.5))
    chk(f"7.4 frame {n}: {turn:.1f} turns on, seen {0.1*n:.1f} turn back", abs(back - 0.1*n) < 1e-9)
chk("7.4 at 20 frames/s: 40 pi > 36 pi and 9 rev/s forwards", 40*PI > 36*PI and abs(s4_seen(9, 20) - 9) < 1e-9)
chk("7.4 at 9 frames/s the spoke stands still", abs(s4_seen(9, 9)) < 1e-9)
chk("7.4 above 18 frames/s the rotation is seen forwards at 9 rev/s",
    all(abs(s4_seen(9, fs) - 9) < 1e-9 for fs in np.arange(18.5, 30.01, 0.5)))
chk("7.4 the frame-rate slider default 10 gives the red 1 Hz curve", abs(s4_fold(9, 10) - 1) < 1e-12)
chk("7.4 prediction: 25 rev/s at 24 frames/s is seen as 1 rev/s forwards",
    abs(s4_seen(25, 24) - 1) < 1e-9 and abs(25/24 - 1 - 1/24) < 1e-12)
# --- m7-spatial / -b
chk("7.4 9 cycles/mm on 10 points/mm: 18 > 10, recorded at 1 cycle/mm",
    2*9 > 10 and abs(s4_fold(9, 10) - 1) < 1e-12)
chk("7.4 the 9 and 1 cycle/mm stripes agree at every grid point",
    s4_same(lambda x: 0.5 + 0.5*np.cos(2*PI*9*x), lambda x: 0.5 + 0.5*np.cos(2*PI*x), 0.1))
chk("7.4 f2 = 1/1.1 = 0.909 cycles/mm", f"{1/1.1:.3f}" == "0.909")
chk("7.4 beat period 1/(1 - 1/1.1) = 1.1/0.1 = 11 mm",
    abs(1/(1 - 1/1.1) - 11) < 1e-9 and abs(1.1/0.1 - 11) < 1e-9)
chk("7.4 prediction: stripes of 1.0 and 1.25 mm beat every 5 mm",
    abs(1/1.25 - 0.8) < 1e-12 and abs(1/(1 - 0.8) - 5) < 1e-9)
chk("7.4 the moire slider range 1.05..1.30 mm keeps a whole beat on 24 mm",
    all(p/(p - 1) <= 24 for p in np.arange(1.05, 1.3001, 0.01)))
# --- m7-real-alias
chk("7.4 gallery: 23 rev/s at 24 frames/s steps 1/24 turn back, phi[n] = 2 pi n/24 for n = 0..11",
    all(abs(-2*PI*s4_seen(23, 24)*n/24 - 2*PI*n/24) < 1e-9 for n in range(12)))
chk("7.4 gallery: 9 stripes/cm at 10 pixels/cm lie on cos(2 pi x)",
    s4_same(lambda x: np.cos(2*PI*9*x), lambda x: np.cos(2*PI*x), 0.1))
chk("7.4 gallery: 50 Hz mains flicker at 2 x 50 = 100 Hz", 2*50 == 100)
chk("7.4 gallery: 100 Hz at 24 frames/s is seen at 4 Hz, same samples",
    abs(s4_fold(100, 24) - 4) < 1e-9
    and s4_same(lambda t: 0.5 - 0.5*np.cos(2*PI*100*t), lambda t: 0.5 - 0.5*np.cos(2*PI*4*t), 1/24))
chk("7.4 gallery: 7 kHz at 8 kHz is heard at 1 kHz, cos(2 pi 7n/8) = cos(2 pi n/8)",
    abs(s4_fold(7, 8) - 1) < 1e-12
    and s4_same(lambda t: np.cos(2*PI*7*t), lambda t: np.cos(2*PI*t), 1/8))
# --- Laboratory J4: defaults f0 = 5 kHz, fs = 8 kHz
chk("LabJ4 default: k = 1 and fa = |5 - 8| = 3 kHz",
    np.floor(5/8 + 0.5) == 1 and abs(s4_fold(5, 8) - 3) < 1e-12)
chk("LabJ4 default: fs/2 = 4 kHz and 5 > 4, so the tone aliases", 8/2 == 4 and 5 > 4)
chk("LabJ4 the folding diagram is fa <= fs/2 with period fs on the slider grid",
    all(0 <= s4_fold(f, fs) <= fs/2 + 1e-9 and abs(s4_fold(f + fs, fs) - s4_fold(f, fs)) < 1e-9
        for f in np.arange(0.2, 12.01, 0.1) for fs in np.arange(2, 12.01, 0.5)))
chk("LabJ4 every slider tone and its fold share the samples",
    all(s4_same(lambda t: np.cos(2*PI*f*t), lambda t: np.cos(2*PI*s4_fold(f, fs)*t), 1/fs, 20)
        for f in np.arange(0.2, 12.01, 0.3) for fs in np.arange(2, 12.01, 1.0)))
chk("LabJ4 a tone at or below fs/2 folds to itself",
    all(abs(s4_fold(f, fs) - f) < 1e-9 for fs in np.arange(2, 12.01, 0.5)
        for f in np.arange(0.2, fs/2 + 1e-9, 0.1)))

# --- m7-chirp: x(t) = cos(2 pi 1000 t^2) sampled at 4 kHz (beyond the source)
_ts = sp.symbols('t', positive=True)
_fi = sp.diff(2*sp.pi*1000*_ts**2, _ts)/(2*sp.pi)
chk("M7 7.4 chirp: f(t) = (1/2 pi) d/dt (2 pi 1000 t^2) = 2000 t Hz", sp.simplify(_fi - 2000*_ts) == 0)
chk("M7 7.4 chirp: in 3 s it rises from 0 to 6 kHz, 2 kHz each second",
    _fi.subs(_ts, 0) == 0 and _fi.subs(_ts, 3) == 6000 and _fi.subs(_ts, 1) == 2000)
_tt = np.linspace(0, 3, 30001); _fa = np.array([s4_fold(2*x, 4) for x in _tt])
_d = np.diff(_fa)
chk("M7 7.4 chirp: at f_s = 4 kHz the heard pitch rises on 0 < t < 1 s, falls on 1 < t < 2 s, rises on 2 < t < 3 s",
    np.all(_d[_tt[:-1] < 1 - 1e-6] > 0) and np.all(_d[(_tt[:-1] > 1 + 1e-6) & (_tt[:-1] < 2 - 1e-6)] < 0)
    and np.all(_d[_tt[:-1] > 2 + 1e-6] > 0))
chk("M7 7.4 chirp: heard 2 kHz = f_s/2 at t = 1 s, 0 at t = 2 s where f = f_s, 2 kHz again at t = 3 s",
    s4_fold(2, 4) == 2 and s4_fold(4, 4) == 0 and 2*2 == 4 and s4_fold(6, 4) == 2 and 4/2 == 2)
chk("M7 7.4 chirp: the heard pitch stays in the kept band 0..2 kHz", _fa.min() >= 0 and _fa.max() <= 2 + 1e-12)
chk("M7 7.4 chirp: default t = 1.5 s gives the tone at 3 kHz, heard at 1 kHz", 2*1.5 == 3 and s4_fold(3, 4) == 1)
chk("M7 7.4 chirp prediction: at f_s = 3 kHz, t = 2 s, the 4 kHz tone is heard at |4 - 3| = 1 kHz, inside 0..1.5 kHz",
    2*2 == 4 and s4_fold(4, 3) == 1 and 1 <= 3/2)
def _s4rec(x, fs, t, L=32):
    """the slide's playback: sum x[n] sinc(pi(fs t - n)) under the taper (1 - (d/L)^2)^2"""
    N = int(np.ceil(3*fs)); xs = x(np.arange(N + 1)/fs)
    u = t*fs; n0 = np.floor(u).astype(int); y = np.zeros_like(t)
    for j in range(-L + 1, L + 1):
        n = n0 + j; ok = (n >= 0) & (n <= N); d = u - n
        with np.errstate(divide='ignore', invalid='ignore'):
            k = np.where(np.abs(d) < 1e-12, 1.0, np.sin(PI*d)/(PI*d))
        y += np.where(ok, xs[np.clip(n, 0, N)]*(1 - (d/L)**2)**2*k, 0.0)
    return y
_ch = lambda t: np.cos(2*PI*1000*t**2)
_sr = 48000
def _peak(tc, fs=4000):
    t = tc - 0.05 + np.arange(int(0.1*_sr))/_sr
    y = _s4rec(_ch, fs, t)*np.hanning(t.size)
    F = np.abs(np.fft.rfft(y, 8*t.size)); fr = np.fft.rfftfreq(8*t.size, 1/_sr)
    return fr[np.argmax(F)]
_pk = {tc: _peak(tc) for tc in [0.5, 0.75, 1.5, 2.5, 2.75]}
chk("M7 7.4 chirp sound: the played x_r(t) peaks at the folded pitch (1, 1.5, 1, 1, 1.5 kHz at t = 0.5, 0.75, 1.5, 2.5, 2.75 s)",
    all(abs(_pk[tc] - 1000*s4_fold(2*tc, 4)) < 25 for tc in _pk), str({k: round(v) for k, v in _pk.items()}))
_tn = np.arange(1, 11999)/4000
chk("M7 7.4 chirp sound: the played x_r(t) passes through every sample x(n/4000)",
    np.max(np.abs(_s4rec(_ch, 4000, _tn) - _ch(_tn))) < 1e-9)

# --- m7-aa-band, m7-aa-band-b: the transition band and 44.1 kHz (beyond the source)
_D, _fs = sp.symbols('Delta f_s', positive=True)
chk("M7 7.4 aa-band: f_s - (20 + D) >= 20 + D  <=>  f_s >= 2(20 + D) = 40 + 2D kHz",
    sp.solve(sp.Eq(_fs - (20 + _D), 20 + _D), _fs) == [40 + 2*_D] and sp.expand(2*(20 + _D)) == 40 + 2*_D)
def _s4ov(D, fs=44.1, N=200001):
    """largest sum of the baseband and the copy at fs, from the trapezoids on a grid"""
    f = np.linspace(0, fs, N)
    tr = lambda g: np.clip((20 + D - np.abs(g))/D, 0, 1) if D > 0 else (np.abs(g) <= 20).astype(float)
    both = (tr(f) > 1e-12) & (tr(f - fs) > 1e-12)
    return both.any()
chk("M7 7.4 aa-band: at f_s = 44.1 kHz the copies overlap exactly when D > 2.05 kHz, on the slider grid 0..5",
    all(_s4ov(D) == (D > 2.05 + 1e-9) for D in np.round(np.arange(0, 5.0001, 0.05), 10)))
chk("M7 7.4 aa-band: the default D = 2.05 kHz needs f_s >= 40 + 4.1 = 44.1 kHz", abs(40 + 2*2.05 - 44.1) < 1e-12)
chk("M7 7.4 aa-band: the copy at f_s = 44.1 starts at 44.1 - 22.05 = 22.05 = f_s/2 when D = 2.05",
    abs(44.1 - (20 + 2.05) - 22.05) < 1e-12 and abs(44.1/2 - 22.05) < 1e-12)
chk("M7 7.4 aa-band prediction: D = 3 kHz needs f_s >= 2(20 + 3) = 46 kHz, and 44.1 kHz overlaps",
    2*(20 + 3) == 46 and _s4ov(3.0) and not _s4ov(3.0, fs=46))
chk("M7 7.4 aa-band-b: D = f_s/2 - 20 gives 0, 2.05 (22.05 - 20) and 4 (24 - 20) kHz at 40, 44.1, 48 kHz",
    40/2 - 20 == 0 and abs(44.1/2 - 20 - 2.05) < 1e-12 and 48/2 - 20 == 4 and abs(44.1/2 - 22.05) < 1e-12)
chk("M7 7.4 aa-band-b: the frames D = 0, 2.05, 4 land on 40, 44.1, 48 kHz, inside the axis 38..51.5",
    [round(40 + 2*D, 10) for D in [0, 2.05, 4]] == [40, 44.1, 48] and 40 + 2*5.25 <= 51.5)
chk("M7 7.4 aa-band-b prediction: a telephone at 8 kHz keeping 3.4 kHz leaves D = 4 - 3.4 = 0.6 kHz",
    abs(8/2 - 3.4 - 0.6) < 1e-12 and abs(8 - 3.4 - 4.6) < 1e-12 and abs(2*0.6 - 1.2) < 1e-12)
# </m7-s4-verify>

# <m7-s5-verify> 7.5 discrete-time processing of continuous-time signals
# Notation of the section: omega in rad/s, Omega = omega T in rad/sample.
_T5 = 0.25                                     # the worked T of the section
_wM5 = 2*PI                                    # band edge of the running signal
def _tri5(w): return np.maximum(0, 1 - np.abs(w)/_wM5)

# the frequency map and the band edge
chk("M7 7.5 w_s T = 2 pi at T = 0.25, 0.2 and 0.5 s", all(abs(ws_of(T)*T - 2*PI) < 1e-12 for T in [0.25, 0.2, 0.5]))
chk("M7 7.5 Omega_M = w_M T: 0.5 pi at T = 0.25 s, 0.4 pi at T = 0.2 s", abs(_wM5*0.25 - PI/2) < 1e-12 and abs(_wM5*0.2 - 0.4*PI) < 1e-12)
chk("M7 7.5 the copies of X_d overlap once T passes 0.5 s (Omega_M > pi)",
    [_wM5*T > PI + 1e-12 for T in [0.1, 0.25, 0.5, 0.51, 0.7]] == [False, False, False, True, True])
chk("M7 7.5 at T = 0.5 s the copy k = 1 sits at Omega = 2 pi", abs(ws_of(0.5)*0.5 - 2*PI) < 1e-12)
chk("M7 7.5 Omega = pi corresponds to omega = pi/T = 4 pi rad/s at T = 0.25 s", abs(PI/_T5 - 4*PI) < 1e-12)
# X_d(e^{jOmega}) = X_p(j Omega/T) = (1/T) sum_k X_c(j(Omega - 2 pi k)/T), checked on a grid
_W = np.linspace(-3*PI, 3*PI, 1201)
_Xd = sum(_tri5((_W - 2*PI*k)/_T5) for k in range(-4, 5))/_T5
_Xp = sum(_tri5(_W/_T5 - k*ws_of(_T5)) for k in range(-4, 5))/_T5
chk("M7 7.5 X_d(e^{jOmega}) = X_p(j Omega/T), both sums agree", np.max(np.abs(_Xd - _Xp)) < 1e-12)
chk("M7 7.5 X_d is periodic in 2 pi", np.allclose(sum(_tri5((_W + 2*PI - 2*PI*k)/_T5) for k in range(-5, 6)),
                                               sum(_tri5((_W - 2*PI*k)/_T5) for k in range(-5, 6))))
# DTFT of the samples against the copy sum, at a few Omega
_n5 = np.arange(-4000, 4001)
_xs = np.sinc(_n5*_T5)**2                      # x_c(t) = sinc^2(t): triangle spectrum, w_M = 2 pi, X_c(0) = 1
_Wt = np.array([0, PI/4, PI/2, 0.9*PI])
_dtft = np.array([np.sum(_xs*np.exp(-1j*Wv*_n5)).real for Wv in _Wt])
chk("M7 7.5 DTFT of x_c(nT) equals (1/T) sum_k X_c(j(Omega - 2 pi k)/T) (sinc^2 input, T = 0.25 s)",
    np.allclose(_dtft, sum(_tri5((_Wt - 2*PI*k)/_T5) for k in range(-3, 4))/_T5, atol=1e-3), f"{_dtft}")

# the equivalent system, with the three-point average H_d = (1 + cos Omega)/2
_W = sp.symbols('Omega', real=True)
_Havg = sp.Rational(1, 4)*sp.exp(sp.I*_W) + sp.Rational(1, 2) + sp.Rational(1, 4)*sp.exp(-sp.I*_W)
chk("M7 7.5 (1/4, 1/2, 1/4) average has H_d = (1 + cos Omega)/2", sp.simplify(sp.expand_complex(_Havg) - (1 + sp.cos(_W))/2) == 0)
_wg = np.linspace(-4*PI + 1e-6, 4*PI - 1e-6, 801)             # |omega| < omega_s/2 at T = 0.25 s
_TXd = sum(_tri5((_wg*_T5 - 2*PI*k)/_T5) for k in range(-4, 5))  # T X_d(e^{j omega T})
_Hg = 0.5*(1 + np.cos(_wg*_T5))
chk("M7 7.5 H_eff(j omega) = H_d(e^{j omega T}): T H_d X_d(e^{j omega T}) = H_d X_c(j omega) inside the band",
    np.allclose(_Hg*_TXd, _Hg*_tri5(_wg)))
chk("M7 7.5 at T = 0.25 s, omega_s/2 = 4 pi and omega = 6 pi is removed", abs(ws_of(_T5)/2 - 4*PI) < 1e-12 and 6*PI > ws_of(_T5)/2)
chk("M7 7.5 H_d(e^{j omega T}) at omega = 6 pi is 1/2, which D/C discards", abs(0.5*(1 + np.cos(6*PI*_T5)) - 0.5) < 1e-12)

# a digital cutoff in hertz
def _fc(Wc, fs): return Wc/(2*PI)*fs
chk("M7 7.5 Omega_c = pi/4 at 8 kHz: omega_c = 2000 pi rad/s, f_c = 1 kHz",
    abs((PI/4)*8000 - 2000*PI) < 1e-9 and abs(_fc(PI/4, 8000) - 1000) < 1e-9)
chk("M7 7.5 Omega_c = pi/4 at 44.1 kHz: f_c = 5.5125 kHz", abs(_fc(PI/4, 44100) - 5512.5) < 1e-9)
chk("M7 7.5 Omega_c = pi/4 gives f_c = f_s/8 at every rate", all(abs(_fc(PI/4, f) - f/8) < 1e-9 for f in [4000, 8000, 16000, 48000]))
chk("M7 7.5 Omega_c = pi/2 at 16 kHz: f_c = (1/4)16 = 4 kHz", abs(_fc(PI/2, 16000) - 4000) < 1e-9)

# the digital differentiator
chk("M7 7.5 differentiator: |H_d| = |Omega|/T ramps to pi/T = 4 pi at T = 0.25 s", abs(PI/_T5 - 4*PI) < 1e-12)
chk("M7 7.5 differentiator: |H_d| at Omega = pi/2, T = 0.25 s is 2 pi", abs((PI/2)/_T5 - 2*PI) < 1e-12)
chk("M7 7.5 differentiator: H_d jumps from j pi/T to -j pi/T across Omega = pi (periodic extension)",
    abs(1j*PI/_T5 - 1j*(PI - 2*PI)/_T5 - 2j*PI/_T5) < 1e-12)
_om0 = 2*PI*100
chk("M7 7.5 100 Hz tone: omega_0 = 200 pi = 628.3 rad/s, peak 0.628 per ms",
    abs(_om0 - 200*PI) < 1e-12 and round(_om0, 1) == 628.3 and round(_om0/1000, 3) == 0.628)
_Om0 = _om0/1000; _n = np.arange(50)
chk("M7 7.5 one tone: (Omega_0/T) cos(Omega_0 n + pi/2) = -omega_0 sin(omega_0 n T)",
    np.allclose(_Om0*1000*np.cos(_Om0*_n + PI/2), -_om0*np.sin(_om0*_n/1000)))
chk("M7 7.5 700 Hz at 1 kHz folds to 300 Hz, so y_c peaks at 2 pi 300 = 1885 s^-1, not 2 pi 700",
    abs(abs(700 - 1000*np.floor(700/1000 + 0.5)) - 300) < 1e-12 and round(2*PI*300) == 1885)
chk("M7 7.5 the band edge of the tone slide is f_s/2 = 500 Hz", 1000/2 == 500)
_N = 100; _nn = np.arange(_N); _Wb = 2*PI*_nn/_N; _Wb[_Wb >= PI] -= 2*PI
_y = np.real(np.fft.ifft(np.fft.fft(np.sin(_om0*_nn/1000))*(1j*_Wb*1000)))
chk("M7 7.5 j Omega/T on the samples of a 100 Hz sine at 1 kHz gives dx_c/dt at nT (DFT)",
    np.allclose(_y, _om0*np.cos(_om0*_nn/1000), atol=1e-6))

# the half-sample delay
chk("M7 7.5 half delay: e^{-j (Omega/T)(T/2)} = e^{-j Omega/2}, |H_d| = 1",
    sp.simplify(sp.exp(-sp.I*(_W/sp.Symbol('T', positive=True))*(sp.Symbol('T', positive=True)/2)) - sp.exp(-sp.I*_W/2)) == 0)
chk("M7 7.5 half delay: cos(2 pi 250 t), T = 1 ms: y_d[0] = cos(-pi/4) = 0.707",
    abs(np.cos(2*PI*250*(-0.5e-3)) - np.cos(-PI/4)) < 1e-12 and round(np.cos(PI/4), 3) == 0.707)
_N = 40; _nn = np.arange(_N); _Wb = 2*PI*_nn/_N; _Wb[_Wb >= PI] -= 2*PI
_y = np.real(np.fft.ifft(np.fft.fft(np.cos(2*PI*250*_nn*1e-3))*np.exp(-1j*_Wb/2)))
chk("M7 7.5 e^{-j Omega/2} on the samples gives x_c((n - 1/2)T) (DFT)", np.allclose(_y, np.cos(2*PI*250*(_nn - 0.5)*1e-3)))
chk("M7 7.5 sinc input sin(pi t/T)/(pi t) has samples (1/T) delta[n]",
    abs(1/_T5 - 4) < 1e-12 and all(abs(np.sin(PI*k)/(PI*k*_T5)) < 1e-12 for k in range(1, 8)))
_nh = np.arange(-6, 8)
_h = np.sin(PI*(_nh - 0.5))/(PI*(_nh - 0.5))
chk("M7 7.5 h[n] = T x_c(nT - T/2) = sin(pi(n - 1/2))/(pi(n - 1/2))",
    np.allclose(_h, _T5*np.sin(PI*(_nh*_T5 - _T5/2)/_T5)/(PI*(_nh*_T5 - _T5/2))))
chk("M7 7.5 sin(pi(n - 1/2)) = (-1)^{n+1}, so h[n] is never zero", np.allclose(np.sin(PI*(_nh - 0.5)), (-1.0)**(_nh + 1)) and np.all(np.abs(_h) > 0))
chk("M7 7.5 h[0] = h[1] = 2/pi", abs(_h[_nh == 0][0] - 2/PI) < 1e-12 and abs(_h[_nh == 1][0] - 2/PI) < 1e-12)
chk("M7 7.5 h[n] decays like 1/n: |h[n]| (n - 1/2) pi = 1", np.allclose(np.abs(_h)*PI*np.abs(_nh - 0.5), 1))
_Hh = np.array([np.sum(np.sin(PI*(np.arange(-20000, 20001) - 0.5))/(PI*(np.arange(-20000, 20001) - 0.5))*np.exp(-1j*Wv*np.arange(-20000, 20001))) for Wv in [0.3, 1.2, 2.5]])
chk("M7 7.5 the DTFT of h[n] is e^{-j Omega/2} (40001 terms)", np.allclose(_Hh, np.exp(-1j*np.array([0.3, 1.2, 2.5])/2), atol=2e-3), f"{np.abs(_Hh - np.exp(-1j*np.array([0.3, 1.2, 2.5])/2))}")

# quantization
def _q5(x, B):
    D = 2/2**B
    return np.clip(D*(np.floor(x/D) + 0.5), -1 + D/2, 1 - D/2)
chk("M7 7.5 B bits over [-1, 1]: 2^B levels, Delta = 2/2^B", all(len(np.unique(_q5(np.linspace(-1, 1, 200001), B))) == 2**B for B in [1, 2, 3, 4, 8]))
chk("M7 7.5 B = 3: Delta = 1/4; B = 4: Delta = 1/8, |e| <= 1/16",
    2/2**3 == 0.25 and 2/2**4 == 1/8 and np.max(np.abs(_q5(np.linspace(-1, 1, 200001), 4) - np.linspace(-1, 1, 200001))) <= 1/16 + 1e-12)
_e, _D = sp.symbols('e Delta', positive=True)
chk("M7 7.5 noise power (1/Delta) int e^2 de over [-Delta/2, Delta/2] = Delta^2/12",
    sp.simplify(sp.integrate(_e**2, (_e, -_D/2, _D/2))/_D - _D**2/12) == 0)
_Bs = sp.symbols('B', positive=True, integer=True)
chk("M7 7.5 SNR = 10 log10((1/2)/(Delta^2/12)) = 10 log10(1.5 * 2^(2B)) with Delta = 2/2^B",
    sp.simplify(sp.Rational(1, 2)/((2/2**_Bs)**2/12) - sp.Rational(3, 2)*2**(2*_Bs)) == 0)
chk("M7 7.5 10 log10 1.5 = 1.76 dB and 20 log10 2 = 6.02 dB", round(10*np.log10(1.5), 2) == 1.76 and round(20*np.log10(2), 2) == 6.02)
_rule = lambda B: 6.02*B + 1.76
chk("M7 7.5 rule: 19.8 dB at 3 bits, 49.9 at 8, 98.1 at 16",
    [round(_rule(B), 1) for B in [3, 8, 16]] == [19.8, 49.9, 98.1])
_x = np.sin(2*PI*0.0123456789*np.arange(200000))
_snr = {B: 10*np.log10(np.sum(_x**2)/np.sum((_q5(_x, B) - _x)**2)) for B in [1, 2, 3, 4, 8, 12, 16]}
chk("M7 7.5 measured SNR lies within 1 dB of the rule from 3 bits up",
    all(abs(_snr[B] - _rule(B)) < 1 for B in [3, 4, 8, 12, 16]), ", ".join(f"B={B}: {_snr[B]:.2f}" for B in _snr))
chk("M7 7.5 measured SNR at 1 bit is more than 1 dB from the rule", abs(_snr[1] - _rule(1)) > 1, f"{_snr[1]:.2f} vs {_rule(1):.2f}")
_x8 = _x                                        # the figure uses the same 200 000 samples
chk("M7 7.5 the figure dots (every B) stay within 1 dB of the rule from 3 bits up",
    all(abs(10*np.log10(np.sum(_x8**2)/np.sum((_q5(_x8, B) - _x8)**2)) - _rule(B)) < 1 for B in range(3, 17)))
chk("M7 7.5 12 to 14 bits adds 2 x 6.02 = 12 dB", round(_rule(14) - _rule(12)) == 12)
chk("M7 7.5 the quantization figure: a 1 kHz sine is sin(2 pi t) with t in ms, 16 samples a cycle at 16 kHz", 1000*1e-3 == 1 and 16000/1000 == 16)

# the gallery
_n = np.arange(0, 21)
chk("M7 7.5 gallery phone: 800 Hz at 8 kHz is Omega = 0.2 pi and 50 Hz is 0.0125 pi, both inside |Omega| < pi",
    abs(2*PI*800/8000 - 0.2*PI) < 1e-12 and abs(2*PI*50/8000 - 0.0125*PI) < 1e-12)
chk("M7 7.5 gallery phone: y[n] = sin(2 pi 800 n/8000) is the 800 Hz part of x(t) = sin(2 pi 800 t) + 0.8 sin(2 pi 50 t) at t = n/8000 s (n/8 ms)",
    np.allclose(np.sin(2*PI*0.8*(_n/8)), np.sin(2*PI*800*_n/8000)))
chk("M7 7.5 gallery equaliser: gain 2 at 100 Hz and 1 at 1 kHz turns cos(2 pi 100 t) + cos(2 pi 1000 t) into 2 cos(2 pi 100 t) + cos(2 pi 1000 t); both under 24 kHz",
    max(100, 1000) < 48000/2)
_z = lambda W: np.sum(np.exp(-1j*W*np.arange(4)))/4
chk("M7 7.5 gallery ABS: the four-sample average has zeros at Omega = pi/2 and pi", abs(_z(PI/2)) < 1e-12 and abs(_z(PI)) < 1e-12 and abs(_z(0) - 1) < 1e-12)
chk("M7 7.5 gallery ABS: at f_s = 400 Hz, Omega = pi/2 and pi are 100 Hz and 200 Hz", abs(PI/2/(2*PI)*400 - 100) < 1e-12 and abs(PI/(2*PI)*400 - 200) < 1e-12)
_Ta = 1/400; _t = np.arange(3, 21)*_Ta
_v = lambda t: 20 - 8*t + 1.5*np.sin(2*PI*100*t)
_ya = sum(_v(_t - k*_Ta) for k in range(4))/4
chk("M7 7.5 gallery ABS: y[n] = (1/4) sum v[n-k] removes the 100 Hz ripple and keeps the ramp (delayed by 1.5 T)",
    np.allclose(_ya, 20 - 8*(_t - 1.5*_Ta)), f"max dev {np.max(np.abs(_ya - (20 - 8*(_t - 1.5*_Ta)))):.1e}")
chk("M7 7.5 gallery ABS: the curve and y[n] stay inside the drawn range 17.8 to 24.8 m/s on 0 to 0.05 s",
    np.min(_v(np.linspace(0, 0.05, 5001))) > 17.8 and np.max(_v(np.linspace(0, 0.05, 5001))) < 24.8)
_Hc = lambda W: 5 - 4*np.cos(W)
chk("M7 7.5 gallery camera: y[n] = 5b[n] - 2(b[n-1] + b[n+1]) keeps flat regions (gain 1 at Omega = 0) and boosts fine detail (gain 9 at pi)",
    abs(_Hc(0) - 1) < 1e-12 and abs(_Hc(PI) - 9) < 1e-12)

# laboratory J5: the readouts at the default state (f1 = 1, f2 = 3, fs = 8 kHz, Omega_c = 0.5 pi)
_fsL = 8000; _wcL = 0.5
chk("M7 7.5 lab J5 default: equivalent omega_c = 4000 pi rad/s, f_c = 2000 Hz, f_s/2 = 4 kHz",
    abs(_wcL*PI*_fsL - 4000*PI) < 1e-9 and abs(_fc(_wcL*PI, _fsL) - 2000) < 1e-9 and _fsL/2 == 4000)
chk("M7 7.5 lab J5 default: 1 kHz passes (Omega = 0.25 pi < 0.5 pi), 3 kHz is removed (0.75 pi), both band-limited",
    2*PI*1000/_fsL < _wcL*PI < 2*PI*3000/_fsL and 3000 < _fsL/2)
chk("M7 7.5 lab J5: band edge omega_s/2 = pi f_s = 8000 pi rad/s at 8 kHz; differentiator gain at 1 kHz = 2000 pi s^-1; delay T/2 = 62.5 us",
    abs(PI*_fsL - 8000*PI) < 1e-9 and abs(2*PI*1000 - 2000*PI) < 1e-9 and abs(0.5/_fsL*1e6 - 62.5) < 1e-9)
_foldL = lambda f, fs: abs(f - fs*np.floor(f/fs + 0.5))
chk("M7 7.5 lab J5: a 5 kHz tone at 8 kHz is not band-limited and reaches the filter as 3 kHz; 4 kHz sits on the band edge",
    abs(_foldL(5, 8) - 3) < 1e-12 and 5 > 8/2 and abs(_foldL(4, 8) - 4) < 1e-12)
# </m7-s5-verify>

# <m7-s6-verify> 7.6 decimation and interpolation
# The numbers of section 7.6: the slides, their prediction cards, the sound
# figures, the gallery captions and the fixed numbers of Laboratory J6.
# The running sequence is x[n] = (sin(pi n/8)/(pi n/8))^2 with x[0] = 1; its
# transform is a triangle of peak 8 reaching zero at |w| = pi/4.
from math import gcd as s6_gcd
from fractions import Fraction as s6_F
s6_M = 400000
s6_n = np.arange(-s6_M, s6_M + 1)
s6_x = np.sinc(s6_n/8)**2
def s6_wrap(wv): return wv - 2*PI*np.round(wv/(2*PI))
def s6_tri(wv, W=PI/4, pk=8.0): return np.maximum(0.0, pk*(1 - np.abs(s6_wrap(wv))/W))
def s6_dtft(x, n, wv): return float(np.sum(x*np.cos(wv*n)))       # x real and even
# --- the running sequence and its transform
chk("7.6 x[0] = 1 for the running sequence", abs(s6_x[s6_M] - 1) < 1e-15)
for wv in [0, PI/16, PI/8, 3*PI/16, PI/4, PI/2, PI]:
    got = s6_dtft(s6_x, s6_n, wv)
    chk(f"7.6 X(e^(j{wv/PI:.4f} pi)) of the running sequence is the triangle {s6_tri(wv):.4f}",
        abs(got - s6_tri(wv)) < 2e-4, f"got {got:.6f}")
chk("7.6 the running sequence is zero at n = +-8, +-16 (the time axis of the figures)",
    np.max(np.abs(s6_x[s6_M + np.array([-16, -8, 8, 16])])) < 1e-12)
# --- m7-dtsamp: x_p[n] = x[n] p[n] keeps x at multiples of N and is zero elsewhere
for N in [3, 4]:
    xp = s6_x*(s6_n % N == 0)
    chk(f"7.6 N = {N}: x_p[n] = x[n] at n = kN and 0 elsewhere",
        np.all(xp[s6_n % N == 0] == s6_x[s6_n % N == 0]) and np.all(xp[s6_n % N != 0] == 0))
chk("7.6 prediction: (0.5)^|n| sampled with N = 3 gives x_p[4] = 0", 4 % 3 != 0)
chk("7.6 prediction: the distractors (0.5)^4 = 0.0625 and (0.5)^3 = 0.125 are the values x[4], x[3]",
    abs(0.5**4 - 0.0625) < 1e-15 and abs(0.5**3 - 0.125) < 1e-15)
# --- m7-dtsamp-b: the sampling sequence in frequency
for N in [3, 4, 5]:
    pn = (s6_n % N == 0).astype(float)
    # the transform of p[n] is (2 pi/N) sum_k delta(w - 2 pi k/N): its synthesis at
    # n = 0 over one period gives (1/2 pi) * N * (2 pi/N) = 1 = p[0]
    chk(f"7.6 N = {N}: {N} impulses of weight 2pi/N = {2*PI/N:.4f} in a period give p[0] = 1",
        abs(N*(2*PI/N)/(2*PI) - 1) < 1e-15 and pn[s6_M] == 1)
chk("7.6 prediction: N = 4 gives each impulse of P the weight 2 pi/4 = pi/2", abs(2*PI/4 - PI/2) < 1e-15)
chk("7.6 N = 3: w_s = 2 pi/3; copies centred at 2pi/3 and 4pi/3; height 8/3",
    abs(2*PI/3*2 - 4*PI/3) < 1e-15 and abs(8/3 - 2.6667) < 1e-4)
chk("7.6 Step 3: (1/2pi)(2pi/N) = 1/N", sp.simplify(sp.Rational(1, 2)/sp.pi*2*sp.pi/sp.Symbol('N') - 1/sp.Symbol('N')) == 0)
# --- m7-dtsamp-c: the key result, checked on the running sequence
def s6_Xp_formula(wv, N):
    return sum(s6_tri(wv - 2*PI*k/N) for k in range(N))/N
for N in [3, 5]:
    xp = s6_x*(s6_n % N == 0)
    for wv in [0, PI/8, PI/5, PI/4, 2*PI/3, 0.9*PI]:
        got = s6_dtft(xp, s6_n, wv); want = s6_Xp_formula(wv, N)
        if abs(got - want) > 3e-4:
            chk(f"7.6 X_p = (1/N) sum_k X(e^(j(w - k ws))) at N = {N}, w = {wv/PI:.3f} pi", False, f"{got} vs {want}"); break
    else:
        chk(f"7.6 key result: X_p(e^jw) = (1/N) sum_(k=0)^(N-1) X(e^(j(w - 2pi k/N))) holds for N = {N}", True)
for N, over in [(2, False), (3, False), (4, False), (5, True), (6, True)]:
    chk(f"7.6 slider N = {N}: pi/N = {PI/N:.4f} {'<' if over else '>='} w_M = pi/4, overlap = {over}",
        (PI/4 > PI/N + 1e-12) == over)
chk("7.6 N = 4 is the edge: w_M = pi/N, and the copies meet where X = 0", abs(PI/4 - PI/4) < 1e-15 and s6_tri(PI/4) == 0)
chk("7.6 N = 3: pi/3 > pi/4; N = 5: pi/5 < pi/4", PI/3 > PI/4 > PI/5)
Nmax = max(N for N in range(1, 50) if 2*PI/7 < PI/N)
chk("7.6 prediction: X = 0 for 2pi/7 <= |w| <= pi allows N < 3.5, so N = 3", Nmax == 3 and abs(PI/(2*PI/7) - 3.5) < 1e-12)
chk("7.6 w_s > 2 w_M <=> 2pi/N > 2 w_M <=> w_M < pi/N (symbolic)",
    sp.simplify(2*sp.pi/sp.Symbol('N', positive=True)/2 - sp.pi/sp.Symbol('N', positive=True)) == 0)
# --- m7-dtsamp-rec: gain N, cutoff pi/N recovers X
for N in [2, 3]:
    ok = True
    for wv in np.linspace(-PI, PI, 721):
        Hr = N if abs(wv) < PI/N else 0
        if abs(Hr*s6_Xp_formula(wv, N) - s6_tri(wv)) > 1e-12: ok = False; break
    chk(f"7.6 N = {N}: N * X_p * (|w| < pi/N) = X over a whole period", ok)
chk("7.6 N = 3: pi/3 lies in (w_M, w_s - w_M) = (pi/4, 5pi/12)", PI/4 < PI/3 < 2*PI/3 - PI/4)
chk("7.6 with no aliasing pi/N always lies in (w_M, 2pi/N - w_M)",
    all(W < PI/N < 2*PI/N - W for N in range(2, 7) for W in np.linspace(0.01, PI/N - 1e-3, 20)))
chk("7.6 prediction: N = 2, w_M = pi/4 needs pi/4 < w_c < 3pi/4: pi/2 inside, pi/8 and 7pi/8 outside",
    PI/4 < PI/2 < 3*PI/4 and not (PI/4 < PI/8 < 3*PI/4) and not (PI/4 < 7*PI/8 < 3*PI/4))
# time domain: x_p filtered by h[n] = 3 sin(pi n/3)/(pi n) returns x[n] (N = 3)
_k = np.arange(-60000, 60001); _xk = np.sinc(3*_k/8)**2
for n0 in [0, 1, 2, 5]:
    d = n0 - 3*_k
    h = np.where(d == 0, 1.0, 3*np.sin(PI*d/3)/(PI*np.where(d == 0, 1, d)))
    chk(f"7.6 N = 3: the filtered samples give x_r[{n0}] = x[{n0}] = {np.sinc(n0/8)**2:.5f}",
        abs(np.sum(_xk*h) - np.sinc(n0/8)**2) < 1e-4, f"{np.sum(_xk*h):.6f}")
# --- m7-decim and m7-decim-b
chk("7.6 prediction: x[n] = n, N = 4 gives x_b[2] = x[8] = 8", list(range(12))[2*4] == 8)
chk("7.6 x_b[n] = x_p[nN] = x[nN] for the running sequence, N = 3",
    np.all((s6_x*(s6_n % 3 == 0))[s6_M + 3*np.arange(-50, 51)] == s6_x[s6_M + 3*np.arange(-50, 51)]))
_xb = np.sinc(3*np.arange(-100000, 100001)/8)**2; _nb = np.arange(-100000, 100001)
for wv in [0, PI/4, PI/2, 3*PI/4, PI]:
    chk(f"7.6 X_b(e^(j{wv/PI:.2f} pi)) = X_p(e^(j w/3)) for N = 3",
        abs(s6_dtft(_xb, _nb, wv) - s6_Xp_formula(wv/3, 3)) < 5e-4, f"{s6_dtft(_xb, _nb, wv):.5f} vs {s6_Xp_formula(wv/3, 3):.5f}")
chk("7.6 N = 3: the band pi/4 widens to 3pi/4 and the copies 2pi/3, 4pi/3 move to 2pi, 4pi",
    abs(3*PI/4 - 3*(PI/4)) < 1e-15 and abs(3*(2*PI/3) - 2*PI) < 1e-12 and abs(3*(4*PI/3) - 4*PI) < 1e-12)
chk("7.6 Step 2: w k = (w/N)(kN)", sp.simplify(sp.Symbol('w')*sp.Symbol('k') - (sp.Symbol('w')/sp.Symbol('N'))*(sp.Symbol('k')*sp.Symbol('N'))) == 0)
chk("7.6 prediction: N = 2, w_M = pi/4 gives the band edge N w_M = pi/2", abs(2*PI/4 - PI/2) < 1e-15)
# --- m7-decim-c: 500 Hz + 3 kHz at 8 kHz
fs1 = 8000
chk("7.6 500 Hz at 8 kHz is w = pi/8, 3 kHz is w = 3pi/4",
    abs(2*PI*500/fs1 - PI/8) < 1e-15 and abs(2*PI*3000/fs1 - 3*PI/4) < 1e-15)
_m = np.arange(0, 400)
_xd = np.cos(PI*2*_m/8) + np.cos(3*PI*2*_m/4)
chk("7.6 decimated by 2: x[2m] = cos(pi m/4) + cos(pi m/2), i.e. 500 Hz and 1 kHz at 4 kHz",
    np.max(np.abs(_xd - (np.cos(PI*_m/4) + np.cos(PI*_m/2)))) < 1e-9
    and abs(PI/4*4000/(2*PI) - 500) < 1e-9 and abs(PI/2*4000/(2*PI) - 1000) < 1e-9)
chk("7.6 2 * 3pi/4 = 3pi/2, which is -pi/2 in the next period", abs(s6_wrap(2*3*PI/4) + PI/2) < 1e-12)
chk("7.6 the prefilter at pi/2 keeps pi/8 and removes 3pi/4", PI/8 < PI/2 < 3*PI/4)
chk("7.6 prefiltered then decimated: cos(pi (2m)/8) = cos(pi m/4), 500 Hz alone",
    np.max(np.abs(np.cos(PI*2*_m/8) - np.cos(PI*_m/4))) < 1e-12)
chk("7.6 a tone line keeps the weight pi after decimation: (1/N) * pi * N = pi", abs((1/2)*PI*2 - PI) < 1e-15)
chk("7.6 prediction: N = 4 gives the rate 2 kHz; 4 pi/8 = pi/2 < pi keeps 500 Hz; 4 * 3pi/4 = 3pi does not",
    fs1/4 == 2000 and 4*PI/8 < PI and 4*3*PI/4 >= PI and abs(PI/2*2000/(2*PI) - 500) < 1e-9)
# --- m7-upsamp
_nb2 = np.arange(-30000, 30001)
_xb2 = np.sinc(_nb2/8)**2
for n0 in [1, 2, 4, 7]:
    d = n0 - 3*_nb2
    h = np.where(d == 0, 1.0, 3*np.sin(PI*d/3)/(PI*np.where(d == 0, 1, d)))
    chk(f"7.6 N = 3: the low-pass fills y[{n0}] = (sin(pi n/24)/(pi n/24))^2 = {np.sinc(n0/24)**2:.5f}",
        abs(np.sum(_xb2*h) - np.sinc(n0/24)**2) < 2e-4, f"{np.sum(_xb2*h):.6f}")
chk("7.6 h[n] = N sin(pi n/N)/(pi n) is 1 at n = 0 and 0 at the other multiples of N, so y[kN] = x_b[k]",
    all(abs(3*np.sin(PI*k*3/3)/(PI*k*3)) < 1e-15 for k in range(1, 20)) and abs(np.sinc(0) - 1) < 1e-15)
chk("7.6 y[3m] = x_b[m] for the figure", np.max(np.abs(np.sinc(3*np.arange(-6, 7)/24)**2 - np.sinc(np.arange(-6, 7)/8)**2)) < 1e-15)
chk("7.6 prediction: N = 4 puts N - 1 = 3 zeros in each gap", 4 - 1 == 3)
# --- m7-upsamp-b: cos(pi n/4) at 4 kHz, up by 2
_n = np.arange(0, 400)
_xe = np.where(_n % 2 == 0, np.cos(PI*(_n//2)/4), 0.0)
chk("7.6 zeros inserted: x_(2)[n] = 0.5 cos(pi n/8) + 0.5 cos(7pi n/8)",
    np.max(np.abs(_xe - (0.5*np.cos(PI*_n/8) + 0.5*np.cos(7*PI*_n/8)))) < 1e-12)
chk("7.6 at 8 kHz, pi/8 is 500 Hz and 7pi/8 is 3.5 kHz; at 4 kHz, pi/4 is 500 Hz",
    abs(PI/8*8000/(2*PI) - 500) < 1e-9 and abs(7*PI/8*8000/(2*PI) - 3500) < 1e-9 and abs(PI/4*4000/(2*PI) - 500) < 1e-9)
chk("7.6 compressed by 2: pi/4 + 2pi m moves to pi/8 + pi m, and m = +-1 gives the images +-7pi/8",
    abs((PI/4 + 2*PI)/2 - 9*PI/8) < 1e-12 and abs(s6_wrap(9*PI/8) + 7*PI/8) < 1e-12)
chk("7.6 the filter of gain 2 keeps 0.5 cos(pi n/8) and returns cos(pi n/8)", abs(2*0.5 - 1) < 1e-15 and PI/8 < PI/2 < 7*PI/8)
chk("7.6 X_b(e^(jNw)) repeats every 2pi/N (N = 2: pi)", abs(s6_tri(2*(0.3 + PI)) - s6_tri(2*0.3)) < 1e-12)
chk("7.6 prediction: N = 4 puts 4 copies in a period, the wanted one and 3 images", 2*PI/(2*PI/4) == 4)
# --- m7-rational
chk("7.6 gcd(44100, 48000) = 300", s6_gcd(44100, 48000) == 300)
chk("7.6 44100/48000 = 147/160, so L = 147, M = 160", s6_F(44100, 48000) == s6_F(147, 160) and 44100//300 == 147 and 48000//300 == 160)
chk("7.6 the filter runs at 48 * 147 = 7056 kHz", 48*147 == 7056)
chk("7.6 its cutoff is min(pi/147, pi/160) = pi/160", min(PI/147, PI/160) == PI/160)
chk("7.6 prediction: 44.1 kHz to 48 kHz uses L/M = 48000/44100 = 160/147", s6_F(48000, 44100) == s6_F(160, 147))
_x3 = np.cos(PI*np.arange(30)/5); _v = np.zeros(90); _v[::3] = _x3
_H = 3*((np.arange(90) < 15) | (np.arange(90) > 75)); _v = np.real(np.fft.ifft(np.fft.fft(_v)*_H))
chk("7.6 L/M = 3/2 on cos(pi n/5): up 3, filter, down 2 gives y[m] = cos(2pi m/15)",
    np.max(np.abs(_v[::2] - np.cos(2*PI*np.arange(45)/15))) < 1e-9)
chk("7.6 L/M = 3/2: the output sits at t = 2m/3, three samples in every two units", s6_F(2, 3)*3 == 2)
chk("7.6 L/M = 3/2: cutoff min(pi/3, pi/2) = pi/3, the bins 15 and 75 of 90", min(PI/3, PI/2) == PI/3 and 90*(1/3)/2 == 15)
# --- m7-real-rate: the factors and formulas of the gallery
chk("7.6 gallery: the four factors are 147/160, 1/4, 4 and 1/10",
    s6_F(44100, 48000) == s6_F(147, 160) and s6_F(1, 4) == s6_F(8, 32) and 120//30 == 4 and s6_F(1, 10) == s6_F(10, 100))
chk("7.6 gallery: 30 to 120 frames/s puts 4 - 1 = 3 new frames in each gap", 120//30 - 1 == 3)
_bi = lambda x: 0.5 + 0.25*np.cos(2*PI*x/32) + 0.15*np.cos(2*PI*x/3)
_bt = np.array([np.mean(_bi(4*m + np.arange(4))) for m in range(8)])
chk("7.6 gallery: the mean of four keeps the 3-pixel stripes at a quarter of their depth or less",
    np.max(np.abs(_bt - np.array([np.mean(0.5 + 0.25*np.cos(2*PI*(4*m + np.arange(4))/32)) for m in range(8)]))) <= 0.15/4 + 1e-12)
chk("7.6 gallery: a 1 kHz tone at 44.1 kHz has 44.1 samples a period (45 stems over 1 ms)", abs(44100/1000 - 44.1) < 1e-12)
_th = lambda n: 1.2 + 0.8*np.sin(2*PI*n/200) + 0.5*np.cos(2*PI*0.37*n)
_att = abs(np.sum(np.exp(2j*PI*0.37*np.arange(10))))/10
chk("7.6 gallery: the mean of ten cuts the 0.37 Hz wobble to about 9 % (0.5 -> 0.044 C)",
    abs(_att - 0.0881) < 5e-4, f"{_att:.4f}")
# --- Laboratory J6: its formulas and the fixed numbers its cards state
def s6_xt(n, W): return W/(2*PI)*np.sinc(W*n/(2*PI))**2
def s6_xtc(n, W, c):
    if c >= W - 1e-12: return s6_xt(n, W)
    if n == 0: return (c - c*c/(2*W))/PI
    return (np.sin(c*n)/n - (c*np.sin(c*n)/n + (np.cos(c*n) - 1)/(n*n))/W)/PI
_w = np.linspace(0, PI, 200001)
for W, c, n0 in [(0.9*PI, PI/5, 0), (0.9*PI, PI/5, 3), (0.5*PI, PI/3, 7), (0.3*PI, PI/2, 4)]:
    num = np.trapezoid(np.maximum(0, 1 - _w/W)*(_w < c)*np.cos(_w*n0), _w)/PI
    chk(f"J6 the cut triangle in closed form: W = {W/PI:.1f} pi, c = {c/PI:.3f} pi, n = {n0}",
        abs(num - s6_xtc(n0, W, c)) < 2e-5, f"{num:.7f} vs {s6_xtc(n0, W, c):.7f}")
for W in [0.1*PI, 0.3*PI, 0.9*PI]:
    num = np.trapezoid(np.maximum(0, 1 - _w/W)*np.cos(_w*5), _w)/PI
    chk(f"J6 x[n] = (W/2pi)(sin(Wn/2)/(Wn/2))^2 has the triangle of peak 1 to W = {W/PI:.1f} pi",
        abs(num - s6_xt(5, W)) < 1e-6)
chk("J6 x[0] = W/2pi: 0.15 at the default W = 0.3 pi", abs(s6_xt(0, 0.3*PI) - 0.15) < 1e-15)
chk("J6 default: N w_M = 3 * 0.3 pi = 0.9 pi < pi, clean; pi/N = 0.33 pi", abs(3*0.3 - 0.9) < 1e-15 and 0.9 < 1 and round(1/3, 2) == 0.33)
# interpolation with the filter returns x at n/N (band-limited interpolation)
for W, N, n0 in [(0.6*PI, 3, 2), (0.9*PI, 5, 7)]:
    kk = np.arange(-40000, 40001); d = n0 - N*kk
    h = np.where(d == 0, 1.0, N*np.sin(PI*d/N)/(PI*np.where(d == 0, 1, d)))
    chk(f"J6 interpolation with the filter: y[{n0}] = x({n0}/{N}) for W = {W/PI:.1f} pi",
        abs(np.sum(s6_xt(kk, W)*h) - s6_xt(n0/N, W)) < 1e-5)
chk("J6 slider grid: N w_M = pi happens at (0.5, 2), (0.25, 4), (0.2, 5): the edge verdict",
    all(abs(W*N - 1) < 1e-12 for W, N in [(0.5, 2), (0.25, 4), (0.2, 5)]))
chk("J6 images: a period holds the wanted copy and N - 1 images", all(len([k for k in range(N) if k % N]) == N - 1 for N in range(2, 6)))
chk("J6 two tones cos(w_M n/2) + cos(w_M n): decimation lands each at wrap(N w)",
    np.max(np.abs(np.cos(0.7*PI*3*np.arange(50)) - np.cos(s6_wrap(0.7*PI*3)*np.arange(50)))) < 1e-9)
# --- the code page
chk("7.6 code: sum of x[n] = 8.0000 and of x_p[n] (N = 3) = 2.6667",
    f"{np.sum(np.sinc(np.arange(-600000, 600001)/8)**2):.4f}" == "8.0000"
    and f"{np.sum(np.sinc(3*np.arange(-200000, 200001)/8)**2):.4f}" == "2.6667")
chk("7.6 code try: N = 4 gives X_p(e^j0) = 8/4 = 2", abs(np.sum(np.sinc(4*np.arange(-150000, 150001)/8)**2) - 2) < 1e-4)
chk("7.6 code try: 2.5 kHz at 8 kHz decimated by 2 lands at 4000 - 2500 = 1500 Hz",
    abs(abs(s6_wrap(2*5*PI/8))*4000/(2*PI) - 1500) < 1e-9)
chk("7.6 code try: a 1 kHz tone at 4 kHz put up by 2 has its image at 8000/2 + ... = 3000 Hz",
    abs((PI - (PI/2)/2)*8000/(2*PI) - 3000) < 1e-9)
chk("7.6 code try: fin = 32000 gives gcd 100, L = 441, M = 320", s6_gcd(44100, 32000) == 100 and 44100//100 == 441 and 32000//100 == 320)
# </m7-s6-verify>

# <m7-s7-verify> 7.7 quick check and projects
# --- summary table: H_0(j0) = H_1(j0) = T, and the interpolation kernel with
#     w_c = pi/T is sin(pi t/T)/(pi t/T)
for _T in (0.1, 0.5, 1e-3):
    _w = 1e-7
    _H0 = np.exp(-1j*_w*_T/2)*2*np.sin(_w*_T/2)/_w
    _H1 = (1/_T)*(np.sin(_w*_T/2)/(_w/2))**2
    chk(f"M7 table: H_0(j0) = H_1(j0) = T at T = {_T:g} s", abs(_H0 - _T) < 1e-6*_T and abs(_H1 - _T) < 1e-6*_T)
_tt = np.linspace(-3.3, 3.3, 661); _tt = _tt[np.abs(_tt) > 1e-9]
chk("M7 table: T sin(w_c t)/(pi t) with w_c = pi/T is sin(pi t/T)/(pi t/T) (T = 0.5)",
    np.allclose(0.5*np.sin(PI/0.5*_tt)/(PI*_tt), np.sin(PI*_tt/0.5)/(PI*_tt/0.5)))
_ok = True
for _w0, _ws in [(1.5*PI, 2*PI), (3*PI, 5*PI), (10*PI, 16*PI), (18*PI, 20*PI)]:
    _n = np.arange(-40, 41); _T = 2*PI/_ws
    _ok &= _ws/2 < _w0 < _ws and np.allclose(np.cos(_w0*_n*_T), np.cos((_ws - _w0)*_n*_T)) and abs(_ws - _w0) < _ws/2
chk("M7 table: for w_s/2 < w_0 < w_s the samples of cos(w_0 t) equal those of cos((w_s - w_0) t), which lies below w_c = w_s/2", _ok)

# --- summary table, new rows
# band-pass sampling: a band kB < |w| < (k+1)B sampled at w_s = 2B; the copies of its
# two halves tile the axis once (they touch only at the edges)
_ok = True
_B = 2*PI; _wg = np.linspace(-9.7*_B, 9.7*_B, 200001); _wg = _wg[np.abs(np.remainder(_wg, _B)) > 1e-3*_B]
for _k in range(1, 7):
    _cnt = np.zeros_like(_wg)
    for _m in range(-30, 31):
        _u = np.abs(_wg - _m*2*_B)
        _cnt += (_u > _k*_B) & (_u < (_k + 1)*_B)
    _ok &= np.all(_cnt == 1)
chk("M7 table: a band kB < |w| < (k+1)B (k = 1..6) sampled at w_s = 2B: its copies cover the axis exactly once", _ok)
_t = sp.symbols('t', real=True)
chk("M7 table: a chirp cos(phi(t)) has frequency (1/2 pi) d phi/dt; phi = 2 pi 1000 t^2 gives 2000 t Hz",
    sp.simplify(sp.diff(2*sp.pi*1000*_t**2, _t)/(2*sp.pi) - 2000*_t) == 0)
_ok = True
for _fM in (3.4, 20.0):
    for _D in np.linspace(0, 5, 51):
        for _fs in np.linspace(2*_fM, 2*_fM + 12, 241):
            _ok &= ((_fs - (_fM + _D) >= _fM + _D - 1e-12) == (_fs >= 2*(_fM + _D) - 1e-12))
chk("M7 table: the copy at f_s starts at f_s - (f_M + Delta), clear of f_M + Delta exactly when f_s >= 2(f_M + Delta)", _ok)
_Tq = 0.5
_env = lambda a, b: np.max((1/_Tq)*(np.sin(np.linspace(a, b, 20001)*_Tq/2)/(np.linspace(a, b, 20001)/2))**2)
chk("M7 synthesis: far above the band |H_1| falls off like 1/w^2 (doubling w divides the envelope by 4)",
    abs(_env(400*PI, 404*PI)/_env(800*PI, 804*PI) - 4) < 0.05,
    f"ratio {_env(400*PI, 404*PI)/_env(800*PI, 804*PI):.4f}")

# --- quick check (m7-qc0 ... m7-qc11)
chk("M7 quick 0: T = 0.1 ms gives f_s = 10 kHz and w_s = 20000 pi rad/s",
    abs(fs_of(1e-4) - 1e4) < 1e-6 and abs(ws_of(1e-4) - 20000*PI) < 1e-6)
chk("M7 quick 1: T = 0.2 s scales a peak of 1 to 1/T = 5", abs(1/0.2 - 5) < 1e-12)
chk("M7 quick 2: cos(300 pi t) + cos(700 pi t) has w_M = 700 pi and Nyquist rate 1400 pi rad/s",
    max(300*PI, 700*PI) == 700*PI and abs(2*700*PI - 1400*PI) < 1e-9)
_n = np.arange(-50, 51)
chk("M7 quick 3: sin(50 pi t) sampled at w_s = 100 pi (T = 0.02 s) is zero at every sample",
    abs(2*PI/(100*PI) - 0.02) < 1e-15 and np.max(np.abs(np.sin(50*PI*_n*0.02))) < 1e-12)
chk("M7 quick 4: w_M = 3 pi, w_s = 10 pi admits 5 pi but not 2 pi or 8 pi",
    3*PI < 5*PI < 10*PI - 3*PI and not (3*PI < 2*PI) and not (8*PI < 10*PI - 3*PI))
_wq = np.linspace(1, 2*PI/1e-3 + 50, 200001)
_H0q = np.abs(2*np.sin(_wq*1e-3/2)/_wq)
chk("M7 quick 5: T = 1 ms: |H_0| first reaches zero at w_s = 2000 pi rad/s",
    abs(_wq[np.argmin(_H0q[_wq < 2*PI/1e-3 + 50])] - 2000*PI) < 0.1 and np.all(_H0q[_wq < 1900*PI] > 1e-6),
    f"first zero at {_wq[np.argmin(_H0q)]/PI:.2f} pi")
_n = np.arange(-40, 41); _T = 2*PI/(16*PI)
_lines = sorted({round(abs(k*16*PI + s*10*PI)/PI, 9) for k in range(-4, 5) for s in (1, -1)})
chk("M7 quick 6: cos(10 pi t) at w_s = 16 pi: only the copy line 6 pi lies inside w_c = 8 pi; the samples equal those of cos(6 pi t)",
    [l for l in _lines if l < 8] == [6.0] and np.allclose(np.cos(10*PI*_n*_T), np.cos(6*PI*_n*_T)))
_adv = 23/24; _seen = (_adv + 0.5) % 1 - 0.5
chk("M7 quick 7: 23 rev/s at 24 frames/s advances 23/24 turn a frame, seen as -1/24 turn, i.e. -1 rev/s",
    abs(_seen + 1/24) < 1e-12 and abs(_seen*24 + 1) < 1e-12
    and np.allclose(np.cos(2*PI*23*np.arange(48)/24), np.cos(2*PI*(-1)*np.arange(48)/24)))
# a digital low-pass with Omega_c = pi/3 at 48 kHz: f_c = (Omega_c/2 pi) f_s; a 7.9 kHz tone
# passes, an 8.1 kHz tone is stopped
_Wc = PI/3; _fsq = 48000
chk("M7 quick 8: Omega_c = pi/3 at f_s = 48 kHz cuts off at f_c = (1/6)(48 kHz) = 8 kHz (not 16 or 24)",
    abs(_Wc/(2*PI)*_fsq - 8000) < 1e-9 and 2*PI*7900/_fsq < _Wc < 2*PI*8100/_fsq)
def _q7(x, B):
    D = 2/2**B
    return np.clip(D*(np.floor(x/D) + 0.5), -1 + D/2, 1 - D/2)
_x = np.sin(2*PI*0.0123456789*np.arange(200000))
_s10 = 10*np.log10(np.sum(_x**2)/np.sum((_q7(_x, 10) - _x)**2))
chk("M7 quick 9: 10 bits give 6.02*10 + 1.76 = 61.96, about 62 dB; measured on a full-scale sine it rounds to 62 dB",
    round(6.02*10 + 1.76) == 62 and round(_s10) == 62, f"measured {_s10:.2f} dB")
# decimation by 3 of a sequence band-limited to pi/8: X_b(e^{jw}) = X_p(e^{jw/3}) ends at 3 pi/8
_nn = np.arange(-4000, 4001)
_xs = np.sinc(_nn/16)**2                    # (sin(pi n/16)/(pi n/16))^2: a triangle spectrum ending at pi/8
_xb = _xs[_nn % 3 == 0]; _nb = _nn[_nn % 3 == 0]//3
_Xb = lambda w: np.abs(np.sum(_xb*np.exp(-1j*w*_nb)))
chk("M7 quick 10: w_M = pi/8 decimated by N = 3 gives the band edge N w_M = 3 pi/8 < pi (no aliasing)",
    abs(3*PI/8 - 3*(PI/8)) < 1e-15 and 3*PI/8 < PI and _Xb(0.30*PI) > 1e-2 and _Xb(0.40*PI) < 1e-3*_Xb(0),
    f"|X_b| at 0.30 pi {_Xb(0.30*PI):.3e}, at 0.40 pi {_Xb(0.40*PI):.2e}")
chk("M7 quick 11: 32 kHz to 48 kHz is L/M = 3/2; the one low-pass cuts off at min(pi/3, pi/2) = pi/3",
    abs(48000/32000 - 3/2) < 1e-15 and min(PI/3, PI/2) == PI/3)

# --- projects
_fs0 = 48000; _t0 = np.arange(_fs0)/_fs0
def _peak_hz(f0):
    x = np.cos(2*PI*f0*_t0)[::3]; X = np.abs(np.fft.rfft(x)); return np.argmax(X)*16000/len(x)
chk("M7 projects: 11 kHz at 48 kHz, every third sample kept (16 kHz), peaks at 16 - 11 = 5 kHz; 6 kHz (< f_s/2 = 8 kHz) stays at 6 kHz",
    abs(48000/3 - 16000) < 1e-9 and abs(_peak_hz(11000) - 5000) < 1.5 and abs(_peak_hz(6000) - 6000) < 1.5 and 16000/2 == 8000,
    f"{_peak_hz(11000):.1f} Hz, {_peak_hz(6000):.1f} Hz")
_m = np.arange(0, 101); _x = _m/20
_cellavg = np.array([np.mean(np.cos(2*PI*19*np.linspace(a, a + 0.05, 2001))) for a in _x[:40]])
chk("M7 projects: 19 cycles/mm on a 20 samples/mm grid reads as 1 cycle/mm; cell averaging first leaves about 5 % of the depth",
    np.allclose(np.cos(2*PI*19*_x), np.cos(2*PI*1*_x)) and abs(np.sin(PI*19/20)/(PI*19/20) - 0.05) < 0.005
    and abs(np.max(np.abs(_cellavg)) - np.sin(PI*19/20)/(PI*19/20)) < 2e-3,
    f"factor {np.sin(PI*19/20)/(PI*19/20):.4f}, measured {np.max(np.abs(_cellavg)):.4f}")
_app = [((r/30 + 0.5) % 1 - 0.5)*30 for r in (28, 30, 32)]
chk("M7 projects: at 30 frames/s, 28, 30 and 32 rev/s appear as -2, 0 and +2 rev/s",
    np.allclose(_app, [-2, 0, 2]), f"{_app}")
def _zoh_rms(T):
    tt = np.linspace(-1, 1, 400001)[:-1]
    s = np.cos(2*PI*np.floor(tt/T + 1e-9)*T)
    return np.sqrt(np.mean((s - np.cos(2*PI*tt))**2)), s, tt
_e1, _s1, _t1 = _zoh_rms(0.1); _e2, _, _ = _zoh_rms(0.05)
_c1 = 2*np.mean(_s1*np.exp(-2j*PI*_t1))
_n = np.arange(-200, 201); _ti = np.linspace(-1, 1, 1001)
_xr = np.array([np.sum(np.cos(2*PI*_n*0.1)*np.sinc((u - _n*0.1)/0.1)) for u in _ti])
chk("M7 projects: cos(2 pi t), T = 0.1 s: the staircase lags by T/2 with RMS error near 0.25, halving T gives about 0.13; the sinc sum (|n| <= 200) stays within 1e-4 on |t| <= 1 s",
    abs(_e1 - 0.25) < 0.01 and abs(_e2 - 0.13) < 0.005 and abs(np.angle(_c1) + 2*PI*0.05) < 1e-3
    and np.max(np.abs(_xr - np.cos(2*PI*_ti))) < 1e-4,
    f"RMS {_e1:.4f} and {_e2:.4f}, phase {np.angle(_c1):.4f} vs {-2*PI*0.05:.4f}, sinc max err {np.max(np.abs(_xr - np.cos(2*PI*_ti))):.2e}")
_nq = np.arange(16000); _xq = np.sin(2*PI*441*_nq/8000)
_sq = {B: 10*np.log10(np.sum(_xq**2)/np.sum((_q7(_xq, B) - _xq)**2)) for B in range(2, 13)}
chk("M7 projects: 441 Hz at 8 kHz for 2 s, rounded to B bits: from 3 bits up the SNR is within 1 dB of 6.02 B + 1.76; at 8 bits near 50 dB",
    all(abs(_sq[B] - (6.02*B + 1.76)) < 1 for B in range(3, 13)) and abs(_sq[8] - 50) < 0.5 and len(_nq) == 2*8000,
    ", ".join(f"B={B}: {_sq[B]:.2f}" for B in _sq))
# </m7-s7-verify>


print("\n%d passed, %d failed" % (len(P), len(F)))
if F:
    print("FAILURES:", F)
