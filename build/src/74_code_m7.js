/* ==========================================================================
   Code for Module 7: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program works a signal
   or a sampling rate from the section and prints the number the section
   computes, with the same wording in both languages, so `out` is one text
   for both. MATLAB uses no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M7`)
   that pages through its programs.
   verify/code_check.py runs every entry in both languages and compares
   what it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M7 = {
  /* <m7-s1-bank> */
  'm7-code-sampler':   ['m7s1-samples', 'm7s1-rates', 'm7s1-sum', 'm7s1-guard'],
  /* </m7-s1-bank> */

  /* <m7-s2-bank> */
  'm7-code-nyquist':   ['m7s2-rates', 'm7s2-boundary', 'm7s2-period', 'm7s2-peak', 'm7s2-bandpass'],
  /* </m7-s2-bank> */

  /* <m7-s3-bank> */
  'm7-code-recon':     ['m7s3-interp', 'm7s3-zoh', 'm7s3-foh', 'm7s3-hold', 'm7s3-tone'],
  /* </m7-s3-bank> */

  /* <m7-s4-bank> */
  'm7-code-alias':    ['m7s4-fold', 'm7s4-periods', 'm7s4-two', 'm7s4-aa', 'm7s4-wheel'],
  /* </m7-s4-bank> */

  /* <m7-s5-bank> */
  'm7-code-dtproc':   ['m7s5-map', 'm7s5-lowpass', 'm7s5-diff', 'm7s5-delay', 'm7s5-quant'],
  /* </m7-s5-bank> */

  /* <m7-s6-bank> */
  'm7-code-rate':     ['m7s6-sample', 'm7s6-decim', 'm7s6-interp', 'm7s6-ratio'],
  /* </m7-s6-bank> */
};

const CODE_M7 = {

/* <m7-s1-code> */
'm7s1-samples': {
  title:'Samples of the running signal',
  what:'Samples $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^{2}$ every $T=0.25$ s and prints $x[n]=x(nT)$ for $n=0,\\dots,4$.',
  try:'Change $T$ to $0.125$. Predict the first $n>0$ at which $x[n]=0$ before you run it.',
  out:'x[0..4] = 1.0000 0.8106 0.4053 0.0901 0.0000\nfirst zero after n = 0: n = 4',
  m:`% samples of x(t) = (sin(pi t)/(pi t))^2 taken every T = 0.25 s
T = 0.25;
x = @(t) (sin(pi*t+eps)./(pi*t+eps)).^2;   % eps avoids 0/0 at t = 0

n  = 0:4;
xn = x(n*T);                               % x[n] = x(nT)
fprintf('x[0..4] = %s\\n', strtrim(sprintf('%.4f ', xn)))
fprintf('first zero after n = 0: n = %d\\n', round(1/T))

t  = linspace(-2, 2, 801);
nn = -8:8;
plot(t, x(t), '--'), hold on
stem(nn*T, x(nn*T), 'filled')
xlabel('t (s)'), ylabel('x(t) and x(nT)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# samples of x(t) = (sin(pi t)/(pi t))^2 taken every T = 0.25 s
T = 0.25
eps = np.finfo(float).eps
x = lambda t: (np.sin(np.pi*t+eps)/(np.pi*t+eps))**2   # eps avoids 0/0 at t = 0

n = np.arange(5)
xn = x(n*T)                                # x[n] = x(nT)
print('x[0..4] = ' + ' '.join(f'{v:.4f}' for v in xn))
print(f'first zero after n = 0: n = {round(1/T)}')

t = np.linspace(-2, 2, 801)
nn = np.arange(-8, 9)
plt.plot(t, x(t), '--')
plt.stem(nn*T, x(nn*T))
plt.xlabel(r'$t$ (s)'); plt.ylabel(r'$x(t)$ and $x(nT)$')
plt.show()`},

'm7s1-rates': {
  title:'One period, two rates',
  what:'Converts $T=0.25$ ms into $\\omega_s$ in rad/s and $f_s$ in Hz, and checks $\\omega_sT=2\\pi$ and $f_sT=1$.',
  try:'Change $T$ to $0.5$ ms. Predict both rates before you run it.',
  out:'ws = 8000*pi rad/s   fs = 4000 Hz\ncheck: ws*T = 2.0000*pi   fs*T = 1.0000\nsamples per ms: 4',
  m:`% one sampling period, two rates: T = 0.25 ms
T  = 0.25e-3;                 % sampling period in seconds
ws = 2*pi/T;                  % sampling angular frequency, rad/s
fs = 1/T;                     % sampling frequency, Hz
fprintf('ws = %.0f*pi rad/s   fs = %.0f Hz\\n', ws/pi, fs)
fprintf('check: ws*T = %.4f*pi   fs*T = %.4f\\n', ws*T/pi, fs*T)
fprintf('samples per ms: %d\\n', round(1e-3*fs))

t = linspace(0, 2e-3, 2001);  % 2 ms
n = 0:round(2e-3*fs);
plot(t*1e3, cos(ws*t)), hold on
stem(n*T*1e3, ones(size(n)), 'filled')
xlabel('t (ms)'), ylabel('cos(w_s t) and p(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# one sampling period, two rates: T = 0.25 ms
T = 0.25e-3                   # sampling period in seconds
ws = 2*np.pi/T                # sampling angular frequency, rad/s
fs = 1/T                      # sampling frequency, Hz
print(f'ws = {ws/np.pi:.0f}*pi rad/s   fs = {fs:.0f} Hz')
print(f'check: ws*T = {ws*T/np.pi:.4f}*pi   fs*T = {fs*T:.4f}')
print(f'samples per ms: {round(1e-3*fs)}')

t = np.linspace(0, 2e-3, 2001)   # 2 ms
n = np.arange(round(2e-3*fs)+1)
plt.plot(t*1e3, np.cos(ws*t))
plt.stem(n*T*1e3, np.ones(len(n)))
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$\\cos(\\omega_s t)$ and $p(t)$')
plt.show()`},

'm7s1-sum': {
  title:'The sampled spectrum, two ways',
  what:'With $T=0.4$ s, computes $X_p(j\\omega)$ from the samples, $\\sum_n x(nT)e^{-j\\omega nT}$, and from the copies, $\\frac{1}{T}\\sum_k X(j(\\omega-k\\omega_s))$, at $\\omega=\\pi$, $2.5\\pi$ and $4\\pi$.',
  try:'Change $T$ to $0.25$. Predict the value at $\\omega=\\pi$ before you run it.',
  out:'w = 1.0 pi: from samples 1.2500   from copies 1.2500\nw = 2.5 pi: from samples 0.0000   from copies 0.0000\nw = 4.0 pi: from samples 1.2500   from copies 1.2500',
  m:`% X_p(jw) two ways, x(t) = (sin(pi t)/(pi t))^2, T = 0.4 s
T  = 0.4;  ws = 2*pi/T;  wM = 2*pi;
x  = @(t) (sin(pi*t+eps)./(pi*t+eps)).^2;
X  = @(w) max(0, 1 - abs(w)/wM);          % triangle, zero beyond wM
n  = -100000:100000;                       % samples x(nT)
k  = -5:5;                                 % copies at k*ws
for w = [1 2.5 4]*pi
    Xs = real(sum(x(n*T) .* exp(-1j*w*n*T)));   % transform of the samples
    Xc = sum(X(w - k*ws)) / T;                   % (1/T) sum of the copies
    fprintf('w = %.1f pi: from samples %.4f   from copies %.4f\\n', w/pi, abs(Xs), Xc)
end

w  = linspace(-12*pi, 12*pi, 2401);
Xp = zeros(size(w));
for kk = k
    Xp = Xp + X(w - kk*ws)/T;
end
plot(w, Xp), xlabel('ω (rad/s)'), ylabel('X_p(jω)')
xticks((-10:5:10)*pi), xticklabels({'-10π', '-5π', '0', '5π', '10π'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X_p(jw) two ways, x(t) = (sin(pi t)/(pi t))^2, T = 0.4 s
T = 0.4; ws = 2*np.pi/T; wM = 2*np.pi
eps = np.finfo(float).eps
x = lambda t: (np.sin(np.pi*t+eps)/(np.pi*t+eps))**2
X = lambda w: np.maximum(0, 1 - np.abs(w)/wM)   # triangle, zero beyond wM
n = np.arange(-100000, 100001)                  # samples x(nT)
k = np.arange(-5, 6)                            # copies at k*ws
for w in np.array([1, 2.5, 4])*np.pi:
    Xs = np.sum(x(n*T) * np.exp(-1j*w*n*T)).real   # transform of the samples
    Xc = np.sum(X(w - k*ws)) / T                    # (1/T) sum of the copies
    print(f'w = {w/np.pi:.1f} pi: from samples {abs(Xs):.4f}   from copies {Xc:.4f}')

w = np.linspace(-12*np.pi, 12*np.pi, 2401)
Xp = sum(X(w - kk*ws)/T for kk in k)
plt.plot(w, Xp)
plt.xticks(np.arange(-10, 11, 5)*np.pi, [rf'\${m}\\pi$' if m else '0' for m in range(-10, 11, 5)])
plt.xlabel(r'$\\omega$ (rad/s)'); plt.ylabel(r'$X_p(j\\omega)$')
plt.show()`},

'm7s1-guard': {
  title:'Guard band at three rates',
  what:'For $\\omega_M=2\\pi$ rad/s and $T=0.4$, $0.5$ and $2/3$ s, prints $\\omega_s$ and the guard band $\\omega_s-2\\omega_M$, and draws the three sampled spectra.',
  try:'Add $T=0.25$ s to the list. Predict its guard band before you run it.',
  out:'T = 0.40 s: ws = 5.00 pi, guard = 1.00 pi rad/s\nT = 0.50 s: ws = 4.00 pi, guard = 0.00 pi rad/s\nT = 0.67 s: ws = 3.00 pi, guard = -1.00 pi rad/s',
  m:`% guard band ws - 2*wM for three sampling periods, wM = 2*pi rad/s
wM = 2*pi;
w  = linspace(-10*pi, 10*pi, 2001);
X  = @(w) max(0, 1 - abs(w)/wM);          % one triangular spectrum
Ts = [0.4 0.5 2/3];
for i = 1:3
    T  = Ts(i);  ws = 2*pi/T;
    fprintf('T = %.2f s: ws = %.2f pi, guard = %.2f pi rad/s\\n', T, ws/pi, (ws-2*wM)/pi)
    Xp = zeros(size(w));
    for k = -4:4
        Xp = Xp + X(w - k*ws)/T;          % copies at k*ws, each 1/T tall
    end
    subplot(3, 1, i), plot(w, Xp), ylabel('X_p(jω)')
    xticks((-8:4:8)*pi), xticklabels({'-8π', '-4π', '0', '4π', '8π'})
end
xlabel('ω (rad/s)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# guard band ws - 2*wM for three sampling periods, wM = 2*pi rad/s
wM = 2*np.pi
w = np.linspace(-10*np.pi, 10*np.pi, 2001)
X = lambda w: np.maximum(0, 1 - np.abs(w)/wM)   # one triangular spectrum
fig, ax = plt.subplots(3, 1, sharex=True)
for i, T in enumerate([0.4, 0.5, 2/3]):
    ws = 2*np.pi/T
    print(f'T = {T:.2f} s: ws = {ws/np.pi:.2f} pi, guard = {(ws-2*wM)/np.pi:.2f} pi rad/s')
    Xp = sum(X(w - k*ws)/T for k in range(-4, 5))   # copies at k*ws, each 1/T tall
    ax[i].plot(w, Xp)
    ax[i].set_ylabel(r'$X_p(j\\omega)$')
ax[2].set_xticks(np.arange(-8, 9, 4)*np.pi)
ax[2].set_xticklabels([rf'\${m}\\pi$' if m else '0' for m in range(-8, 9, 4)])
ax[2].set_xlabel(r'$\\omega$ (rad/s)')
plt.show()`},
/* </m7-s1-code> */

/* <m7-s2-code> */
'm7s2-rates': {
  title:'One signal at three sampling periods',
  what:'Takes the triangle spectrum with $\\omega_M=2\\pi$ rad/s and prints the rate $\\omega_s=2\\pi/T$, the guard band $\\omega_s-2\\omega_M$, the overlap width and the copy height $1/T$ for $T_1$, $T_2$ and $T_3$. It then draws $X_p(j\\omega)$ at $T_3$.',
  try:'Add the period $T=0.25$ s to the list. Predict its guard band and $1/T$ before you run it.',
  out:'T (s)  w_s (pi)  guard (pi)  overlap (pi)    1/T\n 0.40      5.00       +1.00          0.00   2.50\n 0.50      4.00       +0.00          0.00   2.00\n 0.67      3.00       -1.00          1.00   1.50',
  m:`% one signal, w_M = 2 pi rad/s, sampled at three periods
wM = 2*pi;
fprintf('T (s)  w_s (pi)  guard (pi)  overlap (pi)    1/T\\n')
for T = [0.4 0.5 2/3]
    ws = 2*pi/T;                          % sampling rate, rad/s
    guard = ws - 2*wM;                    % guard band
    overlap = max(0, 2*wM - ws);          % width of each overlap
    fprintf('%5.2f  %8.2f  %+10.2f  %12.2f  %5.2f\\n', T, ws/pi, guard/pi, overlap/pi, 1/T)
end

w = linspace(-8*pi, 8*pi, 4001);  T = 2/3;  ws = 2*pi/T;
Xp = zeros(size(w));
for k = -4:4
    Xp = Xp + max(0, 1 - abs(w - k*ws)/wM) / T;   % copy k, height 1/T
end
plot(w, Xp), grid on
xticks((-6:3:6)*pi), xticklabels({'-6π', '-3π', '0', '3π', '6π'})
xlabel('ω (rad/s)'), ylabel('X_p(jω)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# one signal, w_M = 2 pi rad/s, sampled at three periods
wM = 2*np.pi
print('T (s)  w_s (pi)  guard (pi)  overlap (pi)    1/T')
for T in [0.4, 0.5, 2/3]:
    ws = 2*np.pi/T                        # sampling rate, rad/s
    guard = ws - 2*wM                     # guard band
    overlap = max(0.0, 2*wM - ws)         # width of each overlap
    print(f'{T:5.2f}  {ws/np.pi:8.2f}  {guard/np.pi:+10.2f}  {overlap/np.pi:12.2f}  {1/T:5.2f}')

w = np.linspace(-8*np.pi, 8*np.pi, 4001); T = 2/3; ws = 2*np.pi/T
Xp = sum(np.maximum(0, 1 - np.abs(w - k*ws)/wM)/T for k in range(-4, 5))
plt.plot(w, Xp)
plt.xticks(np.arange(-6, 7, 3)*np.pi, [rf'\${m}\\pi$' if m else '0' for m in range(-6, 7, 3)])
plt.xlabel(r'$\\omega$ (rad/s)'); plt.ylabel(r'$X_p(j\\omega)$')
plt.grid(True)
plt.show()`},

'm7s2-boundary': {
  title:'The band-edge sine at the Nyquist rate',
  what:'Samples $\\sin(4000\\pi t)$ at $\\omega_s=8000\\pi$ and at $9000\\pi$ rad/s and prints the largest sample of each. It then samples $\\cos(4000\\pi t)$ at $8000\\pi$ rad/s.',
  try:'Change the second rate to $8500\\pi$ rad/s. Predict whether the largest sample is still $0$ before you run it.',
  out:'w_s = 8000 pi: largest |sample| of the sine = 0.0000\nw_s = 9000 pi: largest |sample| of the sine = 0.9848\ncosine at w_s = 8000 pi: +1 -1 +1 -1',
  m:`% the band-edge term sin(4000 pi t), sampled at two rates
n = 0:40;
for ws = [8000*pi 9000*pi]
    T = 2*pi/ws;                          % sampling period, s
    m = max(abs(sin(4000*pi*n*T)));       % largest sample of the sine
    fprintf('w_s = %d pi: largest |sample| of the sine = %.4f\\n', round(ws/pi), m)
end
T = 1/4000;
c = cos(4000*pi*n*T);                     % the cosine at the same rate
fprintf('cosine at w_s = 8000 pi: %+.0f %+.0f %+.0f %+.0f\\n', c(1:4))

t = linspace(0, 1.6e-3, 1601);
plot(t*1e3, sin(4000*pi*t)), hold on
stem(n(1:7)*T*1e3, sin(4000*pi*n(1:7)*T), 'filled'), grid on
xlabel('t (ms)'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the band-edge term sin(4000 pi t), sampled at two rates
n = np.arange(41)
for ws in [8000*np.pi, 9000*np.pi]:
    T = 2*np.pi/ws                        # sampling period, s
    m = np.max(np.abs(np.sin(4000*np.pi*n*T)))   # largest sample of the sine
    print(f'w_s = {round(ws/np.pi)} pi: largest |sample| of the sine = {m:.4f}')
T = 1/4000
c = np.cos(4000*np.pi*n*T)                # the cosine at the same rate
print('cosine at w_s = 8000 pi: ' + ' '.join(f'{v:+.0f}' for v in c[:4]))

t = np.linspace(0, 1.6e-3, 1601)
plt.plot(t*1e3, np.sin(4000*np.pi*t))
plt.stem(n[:7]*T*1e3, np.sin(4000*np.pi*n[:7]*T))
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'm7s2-period': {
  title:'Nyquist rate and sampling period of a line spectrum',
  what:'Reads $\\omega_M$ off the lines of $x(t)=1+\\cos(2000\\pi t)+\\sin(4000\\pi t)$, then prints the Nyquist rate in rad/s and in hertz, the period $T$ with the check $\\omega_sT=2\\pi$, and the scale $1/T$ of the copies.',
  try:'Change the last line to $6000\\pi$. Predict the new $T$ in ms before you run it.',
  out:'w_M = 4000 pi rad/s, f_M = 2000 Hz\nNyquist rate = 8000 pi rad/s = 4000 Hz\nT = 0.2500 ms, w_s T = 2.0000 pi\ncopy scale 1/T = 4000',
  m:`% Nyquist rate and period: x(t) = 1 + cos(2000 pi t) + sin(4000 pi t)
w = [0 2000*pi 4000*pi];                  % positive line positions, rad/s
wM = max(w);                              % highest angular frequency
ws = 2*wM;                                % Nyquist rate
T = 2*pi/ws;                              % sampling period, s
fprintf('w_M = %d pi rad/s, f_M = %d Hz\\n', round(wM/pi), round(wM/(2*pi)))
fprintf('Nyquist rate = %d pi rad/s = %d Hz\\n', round(ws/pi), round(ws/(2*pi)))
fprintf('T = %.4f ms, w_s T = %.4f pi\\n', T*1e3, ws*T/pi)
fprintf('copy scale 1/T = %d\\n', round(1/T))

t = linspace(0, 2e-3, 2001);
nT = (0:8)*T;
plot(t*1e3, 1 + cos(2000*pi*t) + sin(4000*pi*t)), hold on
stem(nT*1e3, 1 + cos(2000*pi*nT) + sin(4000*pi*nT), 'filled'), grid on
xlabel('t (ms)'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# Nyquist rate and period: x(t) = 1 + cos(2000 pi t) + sin(4000 pi t)
w = np.array([0, 2000*np.pi, 4000*np.pi]) # positive line positions, rad/s
wM = w.max()                              # highest angular frequency
ws = 2*wM                                 # Nyquist rate
T = 2*np.pi/ws                            # sampling period, s
print(f'w_M = {round(wM/np.pi)} pi rad/s, f_M = {round(wM/(2*np.pi))} Hz')
print(f'Nyquist rate = {round(ws/np.pi)} pi rad/s = {round(ws/(2*np.pi))} Hz')
print(f'T = {T*1e3:.4f} ms, w_s T = {ws*T/np.pi:.4f} pi')
print(f'copy scale 1/T = {round(1/T)}')

t = np.linspace(0, 2e-3, 2001)
nT = np.arange(9)*T
plt.plot(t*1e3, 1 + np.cos(2000*np.pi*t) + np.sin(4000*np.pi*t))
plt.stem(nT*1e3, 1 + np.cos(2000*np.pi*nT) + np.sin(4000*np.pi*nT))
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x(t)$'); plt.grid(True)
plt.show()`},

'm7s2-peak': {
  title:'Area and peak of the triangular spectrum',
  what:'Convolves two rectangles of height 1 on $|\\omega|\\le4000\\pi$ on a frequency grid. It prints the overlap area $A$ at zero shift, the peak $X_{\\max}=A/2\\pi$, the Nyquist period and the height $X_{\\max}/T$ of one copy.',
  try:'Halve the rectangle to $|\\omega|\\le2000\\pi$. Predict the new peak and the new period before you run it.',
  out:'area A = 8000.0 pi\npeak X(0) = 4000.0\nT = 125.0 us, copy height = 3.20e+07',
  m:`% x(t) = (sin(4000 pi t)/(pi t))^2: X = (1/2pi) R*R, R = 1 on |w| <= 4000 pi
dw = 10*pi;                               % frequency step, rad/s
w = -6000*pi + dw*((0:1199) + 0.5);       % midpoints of the grid
R = double(abs(w) <= 4000*pi);            % the rectangle
A = sum(R .* R) * dw;                     % overlap area at zero shift
Xmax = A / (2*pi);                        % peak of X
wM = 2*4000*pi;                           % the triangle ends at twice the half-width
T = 2*pi/(2*wM);                          % Nyquist period, s
fprintf('area A = %.1f pi\\n', A/pi)
fprintf('peak X(0) = %.1f\\n', Xmax)
fprintf('T = %.1f us, copy height = %.2e\\n', T*1e6, Xmax/T)

X = conv(R, R) * dw / (2*pi);             % the triangle
wx = 2*w(1) + dw*(0:numel(X)-1);
plot(wx, X), grid on
xticks((-8000:4000:8000)*pi), xticklabels({'-8000π', '-4000π', '0', '4000π', '8000π'})
xlabel('ω (rad/s)'), ylabel('X(jω)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = (sin(4000 pi t)/(pi t))^2: X = (1/2pi) R*R, R = 1 on |w| <= 4000 pi
dw = 10*np.pi                             # frequency step, rad/s
w = -6000*np.pi + dw*(np.arange(1200) + 0.5)   # midpoints of the grid
R = (np.abs(w) <= 4000*np.pi).astype(float)    # the rectangle
A = np.sum(R*R)*dw                        # overlap area at zero shift
Xmax = A/(2*np.pi)                        # peak of X
wM = 2*4000*np.pi                         # the triangle ends at twice the half-width
T = 2*np.pi/(2*wM)                        # Nyquist period, s
print(f'area A = {A/np.pi:.1f} pi')
print(f'peak X(0) = {Xmax:.1f}')
print(f'T = {T*1e6:.1f} us, copy height = {Xmax/T:.2e}')

X = np.convolve(R, R)*dw/(2*np.pi)        # the triangle
wx = 2*w[0] + dw*np.arange(X.size)
plt.plot(wx, X); plt.grid(True)
plt.xticks(np.arange(-8000, 8001, 4000)*np.pi, [rf'\${m}\\pi$' if m else '0' for m in range(-8000, 8001, 4000)])
plt.xlabel(r'$\\omega$ (rad/s)'); plt.ylabel(r'$X(j\\omega)$')
plt.show()`},

'm7s2-bandpass': {
  title:'Band-pass sampling: which rates fit',
  what:'Takes the band $8\\pi<|\\omega|<10\\pi$ rad/s, of width $B=2\\pi$, and tests six sampling rates. For each it prints whether the copies of the band stay apart, touch or overlap. It then draws where the copies land at $\\omega_s=7\\pi$ rad/s.',
  try:'Add the rate $8.5\\pi$ rad/s, which lies between two working rates. Predict its verdict before you run it.',
  out:'w_s =  4.0 pi: copies touching\nw_s =  7.0 pi: copies apart\nw_s =  9.0 pi: copies overlapping\nw_s = 12.0 pi: copies apart\nw_s = 17.0 pi: copies overlapping\nw_s = 22.0 pi: copies apart',
  m:`% the band 8 pi < |w| < 10 pi, width B = 2 pi: where do its copies land?
wL = 8*pi;  wH = 10*pi;  B = wH - wL;
v = {'overlapping', 'touching', 'apart'};
for ws = [4 7 9 12 17 22]*pi
    d = mod(mod(-wH, ws) - mod(wL, ws), ws);   % start to start, modulo w_s
    g = min(d, ws - d) - B;                    % room left between the copies
    fprintf('w_s = %4.1f pi: copies %s\\n', ws/pi, v{2 + (g > 1e-9) - (g < -1e-9)})
end

w = linspace(-12*pi, 12*pi, 4801);  ws = 7*pi;  X = zeros(size(w));
for k = -4:4
    X = X + (abs(w - k*ws) > wL & abs(w - k*ws) < wH);   % copy k, both halves
end
plot(w/pi, X), grid on
xticks(-12:4:12), xticklabels({'-12\\pi','-8\\pi','-4\\pi','0','4\\pi','8\\pi','12\\pi'})
xlabel('\\omega (rad/s)'), ylabel('T X_p(j\\omega)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the band 8 pi < |w| < 10 pi, width B = 2 pi: where do its copies land?
wL, wH = 8*np.pi, 10*np.pi
B = wH - wL
v = ['overlapping', 'touching', 'apart']
for ws in np.array([4, 7, 9, 12, 17, 22])*np.pi:
    d = ((-wH) % ws - wL % ws) % ws       # start to start, modulo w_s
    g = min(d, ws - d) - B                # room left between the copies
    print(f'w_s = {ws/np.pi:4.1f} pi: copies {v[1 + (g > 1e-9) - (g < -1e-9)]}')

w = np.linspace(-12*np.pi, 12*np.pi, 4801); ws = 7*np.pi
X = sum((np.abs(w - k*ws) > wL) & (np.abs(w - k*ws) < wH) for k in range(-4, 5))
plt.plot(w/np.pi, X)
plt.xticks(range(-12, 13, 4), [r'$%d\\pi$' % k if k else '0' for k in range(-12, 13, 4)])
plt.xlabel(r'$\\omega$ (rad/s)'); plt.ylabel(r'$T X_p(j\\omega)$'); plt.grid(True)
plt.show()`},
/* </m7-s2-code> */

/* <m7-s3-code> */
'm7s3-interp': {
  title:'Band-limited interpolation between two samples',
  what:'Samples $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^2$ with $T=0.25$ s and rebuilds $x_r(0.1)$ from $801$ samples, each weighting the kernel $\\operatorname{sinc}\\bigl(\\pi(t-nT)/T\\bigr)$ with the unnormalised $\\operatorname{sinc}\\theta=\\sin\\theta/\\theta$.',
  try:'Change $T$ to $0.5$ s, so that $\\omega_s=2\\omega_M$. Predict whether $x_r(0.1)$ still equals $x(0.1)$ to four decimals.',
  out:'x_r(0.1) = 0.9675   x(0.1) = 0.9675',
  m:`% x(t) = (sin(pi t)/(pi t))^2 has wM = 2 pi rad/s; sample it with T = 0.25 s
snc = @(u) (sin(u) + (u == 0)) ./ (u + (u == 0));   % unnormalised sinc
x   = @(t) snc(pi*t).^2;
T   = 0.25;
n   = -400:400;
t0  = 0.1;                                  % a time between two samples
xr  = sum(x(n*T) .* snc(pi*(t0 - n*T)/T));
fprintf('x_r(0.1) = %.4f   x(0.1) = %.4f\\n', xr, x(t0))

t   = linspace(-2, 2, 401);
xrt = zeros(size(t));
for k = 1:numel(t)
    xrt(k) = sum(x(n*T) .* snc(pi*(t(k) - n*T)/T));
end
plot(t, x(t), '--', t, xrt), grid on
xlabel('t (s)'), ylabel('x_r(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = (sin(pi t)/(pi t))^2 has wM = 2 pi rad/s; sample it with T = 0.25 s
snc = lambda u: (np.sin(u) + (u == 0)) / (u + (u == 0))   # unnormalised sinc
x = lambda t: snc(np.pi*t)**2
T = 0.25
n = np.arange(-400, 401)
t0 = 0.1                                   # a time between two samples
xr = np.sum(x(n*T) * snc(np.pi*(t0 - n*T)/T))
print(f'x_r(0.1) = {xr:.4f}   x(0.1) = {x(t0):.4f}')

t = np.linspace(-2, 2, 401)
xrt = [np.sum(x(n*T) * snc(np.pi*(tk - n*T)/T)) for tk in t]
plt.plot(t, x(t), '--', t, xrt)
plt.xlabel('$t$ (s)'); plt.ylabel('$x_r(t)$'); plt.grid(True)
plt.show()`},

'm7s3-zoh': {
  title:'The largest gap of a zero-order hold',
  what:'Holds each sample of $x(t)=\\bigl(\\sin(\\pi t)/(\\pi t)\\bigr)^2$ until the next one, for $T=0.2$ s and $T=0.1$ s, and prints the largest gap between the staircase $x_0(t)$ and $x(t)$.',
  try:'Add $T=0.05$ s to the list. Predict the largest gap before you run it.',
  out:'T = 0.2 s: largest ZOH gap = 0.3181\nT = 0.1 s: largest ZOH gap = 0.1674',
  m:`% zero-order hold of x(t) = (sin(pi t)/(pi t))^2 at two sampling periods
snc = @(u) (sin(u) + (u == 0)) ./ (u + (u == 0));   % unnormalised sinc
x   = @(t) snc(pi*t).^2;
t   = ((0:59999) + 0.5)/10000 - 3;           % a fine grid on (-3, 3) s
for T = [0.2 0.1]
    x0  = x(floor(t/T)*T);                  % hold the sample at the start of each tread
    gap = max(abs(x0 - x(t)));
    fprintf('T = %.1f s: largest ZOH gap = %.4f\\n', T, gap)
end

plot(t, x(t), '--', t, x0), grid on
xlabel('t (s)'), ylabel('x_0(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# zero-order hold of x(t) = (sin(pi t)/(pi t))^2 at two sampling periods
snc = lambda u: (np.sin(u) + (u == 0)) / (u + (u == 0))   # unnormalised sinc
x = lambda t: snc(np.pi*t)**2
t = (np.arange(60000) + 0.5)/10000 - 3     # a fine grid on (-3, 3) s
for T in [0.2, 0.1]:
    x0 = x(np.floor(t/T)*T)                # hold the sample at the start of each tread
    gap = np.max(np.abs(x0 - x(t)))
    print(f'T = {T:.1f} s: largest ZOH gap = {gap:.4f}')

plt.plot(t, x(t), '--', t, x0)
plt.xlabel('$t$ (s)'); plt.ylabel('$x_0(t)$'); plt.grid(True)
plt.show()`},

'm7s3-foh': {
  title:'The largest gap of a first-order hold',
  what:'Joins the samples of the same $x(t)$ by straight lines, for $T=0.2$ s and $T=0.1$ s, and prints the largest gap between $x_1(t)$ and $x(t)$.',
  try:'Compare with the zero-order hold program. Predict which hold gains more when $T$ is halved.',
  out:'T = 0.2 s: largest FOH gap = 0.0300\nT = 0.1 s: largest FOH gap = 0.0080',
  m:`% first-order hold: the samples of x(t) = (sin(pi t)/(pi t))^2 joined by lines
snc = @(u) (sin(u) + (u == 0)) ./ (u + (u == 0));   % unnormalised sinc
x   = @(t) snc(pi*t).^2;
t   = ((0:59999) + 0.5)/10000 - 3;           % a fine grid on (-3, 3) s
for T = [0.2 0.1]
    nT  = (-40:40)*T;                       % sample instants, beyond both ends
    x1  = interp1(nT, x(nT), t);            % straight lines between samples
    gap = max(abs(x1 - x(t)));
    fprintf('T = %.1f s: largest FOH gap = %.4f\\n', T, gap)
end

plot(t, x(t), '--', t, x1), grid on
xlabel('t (s)'), ylabel('x_1(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# first-order hold: the samples of x(t) = (sin(pi t)/(pi t))^2 joined by lines
snc = lambda u: (np.sin(u) + (u == 0)) / (u + (u == 0))   # unnormalised sinc
x = lambda t: snc(np.pi*t)**2
t = (np.arange(60000) + 0.5)/10000 - 3     # a fine grid on (-3, 3) s
for T in [0.2, 0.1]:
    nT = np.arange(-40, 41)*T              # sample instants, beyond both ends
    x1 = np.interp(t, nT, x(nT))           # straight lines between samples
    gap = np.max(np.abs(x1 - x(t)))
    print(f'T = {T:.1f} s: largest FOH gap = {gap:.4f}')

plt.plot(t, x(t), '--', t, x1)
plt.xlabel('$t$ (s)'); plt.ylabel('$x_1(t)$'); plt.grid(True)
plt.show()`},

'm7s3-hold': {
  title:'The two holds at the band edge',
  what:'Evaluates $|H_0(j\\omega)|$ and $H_1(j\\omega)$ at $\\omega_s/2$ for $T=0.5$ s, divided by $T$, and the boost $T/|H_0|$ a compensator needs there.',
  try:'Change $T$ to $0.1$ s. Predict whether the three printed numbers change.',
  out:'at w_s/2:  |H0|/T = 0.6366   H1/T = 0.4053\ncompensator boost at w_s/2 = 1.5708',
  m:`% frequency responses of the two holds with T = 0.5 s, read at w_s/2
T  = 0.5;
ws = 2*pi/T;
H0 = @(w) abs(2*sin(w*T/2)./w);             % zero-order hold, magnitude
H1 = @(w) (sin(w*T/2)./(w/2)).^2/T;         % first-order hold
we = ws/2;
fprintf('at w_s/2:  |H0|/T = %.4f   H1/T = %.4f\\n', H0(we)/T, H1(we)/T)
fprintf('compensator boost at w_s/2 = %.4f\\n', T/H0(we))

w = linspace(0.01, 3*ws, 600);
plot(w, H0(w), '--', w, H1(w)), grid on
xticks((0:2:12)*pi), xticklabels({'0', '2π', '4π', '6π', '8π', '10π', '12π'})
xlabel('ω (rad/s)'), ylabel('magnitude')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# frequency responses of the two holds with T = 0.5 s, read at w_s/2
T = 0.5
ws = 2*np.pi/T
H0 = lambda w: np.abs(2*np.sin(w*T/2)/w)       # zero-order hold, magnitude
H1 = lambda w: (np.sin(w*T/2)/(w/2))**2/T      # first-order hold
we = ws/2
print(f'at w_s/2:  |H0|/T = {H0(we)/T:.4f}   H1/T = {H1(we)/T:.4f}')
print(f'compensator boost at w_s/2 = {T/H0(we):.4f}')

w = np.linspace(0.01, 3*ws, 600)
plt.plot(w, H0(w), '--', w, H1(w))
plt.xticks(np.arange(0, 13, 2)*np.pi, [rf'\${m}\\pi$' if m else '0' for m in range(0, 13, 2)])
plt.xlabel(r'$\\omega$ (rad/s)'); plt.ylabel('magnitude'); plt.grid(True)
plt.show()`},

'm7s3-tone': {
  title:'Measuring the buzz of a held tone',
  what:'Holds a $300$ Hz tone at $f_s=2000$ Hz, takes the FFT of one second of the staircase and compares the copy at $1700$ Hz with the tone. The formula $f_0/(f_s-f_0)$ predicts the same level.',
  try:'Change $f_s$ to $8000$. Predict the level of the copy at $7700$ Hz before you run it.',
  out:'copy at 1700 Hz / tone = 0.1765\nf0/(fs-f0) = 0.1765',
  m:`% a 300 Hz tone held at fs = 2000 Hz: measure the first copy with an FFT
f0 = 300; fs = 2000; up = 500;              % the staircase is drawn at up*fs points/s
k  = 0:fs*up-1;                             % one second
x0 = cos(2*pi*f0*floor(k/up)/fs);           % each sample held for up points
X  = abs(fft(x0));                          % bin m+1 is m Hz, since the record is 1 s
fprintf('copy at %d Hz / tone = %.4f\\n', fs-f0, X(fs-f0+1)/X(f0+1))
fprintf('f0/(fs-f0) = %.4f\\n', f0/(fs-f0))

f = 0:5999;
plot(f, X(1:6000)/X(f0+1)), grid on
xlabel('f (Hz)'), ylabel('level')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a 300 Hz tone held at fs = 2000 Hz: measure the first copy with an FFT
f0, fs, up = 300, 2000, 500                # the staircase is drawn at up*fs points/s
k = np.arange(fs*up)                       # one second
x0 = np.cos(2*np.pi*f0*np.floor(k/up)/fs)  # each sample held for up points
X = np.abs(np.fft.fft(x0))                 # bin m is m Hz, since the record is 1 s
print(f'copy at {fs-f0} Hz / tone = {X[fs-f0]/X[f0]:.4f}')
print(f'f0/(fs-f0) = {f0/(fs-f0):.4f}')

f = np.arange(6000)
plt.plot(f, X[:6000]/X[f0])
plt.xlabel('$f$ (Hz)'); plt.ylabel('level'); plt.grid(True)
plt.show()`},
/* </m7-s3-code> */

/* <m7-s4-code> */
'm7s4-fold': {
  title:'The frequency a sampled tone comes back at',
  what:'Samples a $4$ kHz tone at $f_s=6$ kHz, folds its frequency into $0\\le f\\le f_s/2$, and checks that the tone and the folded tone give the same samples.',
  try:'Change $f_0$ to $5000$ Hz. Predict the alias frequency before you run it.',
  out:'alias frequency = 2.0 kHz\nsamples agree: yes',
  m:`% a tone f0 sampled at fs: the frequency its samples describe
f0 = 4000;  fs = 6000;               % Hz
k  = floor(f0/fs + 0.5);             % the nearest multiple of fs
fa = abs(f0 - k*fs);                 % folded into [0, fs/2]
n  = 0:11;
x  = cos(2*pi*f0*n/fs);              % samples of the tone
xa = cos(2*pi*fa*n/fs);              % samples of the folded tone
s  = {'no', 'yes'};
fprintf('alias frequency = %.1f kHz\\n', fa/1000)
fprintf('samples agree: %s\\n', s{1 + (max(abs(x - xa)) < 1e-9)})

t = linspace(0, 2e-3, 2001);
plot(t*1e3, cos(2*pi*f0*t), '--', t*1e3, cos(2*pi*fa*t), n/fs*1e3, x, 'o')
grid on, xlabel('t (ms)'), ylabel('x(t), x_r(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a tone f0 sampled at fs: the frequency its samples describe
f0 = 4000; fs = 6000                 # Hz
k = np.floor(f0/fs + 0.5)            # the nearest multiple of fs
fa = abs(f0 - k*fs)                  # folded into [0, fs/2]
n = np.arange(12)
x = np.cos(2*np.pi*f0*n/fs)          # samples of the tone
xa = np.cos(2*np.pi*fa*n/fs)         # samples of the folded tone
print(f'alias frequency = {fa/1000:.1f} kHz')
print('samples agree:', ['no', 'yes'][int(np.max(np.abs(x - xa)) < 1e-9)])

t = np.linspace(0, 2e-3, 2001)
plt.plot(t*1e3, np.cos(2*np.pi*f0*t), '--', t*1e3, np.cos(2*np.pi*fa*t))
plt.plot(n/fs*1e3, x, 'o')
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x(t),\\ x_r(t)$'); plt.grid(True)
plt.show()`},

'm7s4-periods': {
  title:'Three sampling periods for one cosine',
  what:'Samples $x(t)=\\cos(2\\pi t)$ with $T=1/4$, $1/3$ and $2/3$ s, and prints $\\omega_s$ and the line the filter keeps, both in multiples of $\\pi$ rad/s.',
  try:'Add the period $T=0.8$ s to the list. Predict where its line is kept before you run it.',
  out:'T = 0.2500 s: ws = 8.0 pi, x_r at 2.0 pi rad/s\nT = 0.3333 s: ws = 6.0 pi, x_r at 2.0 pi rad/s\nT = 0.6667 s: ws = 3.0 pi, x_r at 1.0 pi rad/s',
  m:`% x(t) = cos(2 pi t): w0 = 2 pi rad/s, Nyquist rate 4 pi rad/s
w0 = 2*pi;
for T = [1/4 1/3 2/3]
    ws = 2*pi/T;                     % sampling rate in rad/s
    k  = floor(w0/ws + 0.5);         % the nearest multiple of ws
    wr = abs(w0 - k*ws);             % the line inside |w| < ws/2
    fprintf('T = %.4f s: ws = %.1f pi, x_r at %.1f pi rad/s\\n', T, ws/pi, wr/pi)
end

T = 2/3;  n = 0:6;
t = linspace(0, 4, 2001);
plot(t, cos(2*pi*t), '--', t, cos(pi*t), n*T, cos(2*pi*n*T), 'o')
grid on, xlabel('t (s)'), ylabel('x(t), x_r(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(2 pi t): w0 = 2 pi rad/s, Nyquist rate 4 pi rad/s
w0 = 2*np.pi
for T in [1/4, 1/3, 2/3]:
    ws = 2*np.pi/T                   # sampling rate in rad/s
    k = np.floor(w0/ws + 0.5)        # the nearest multiple of ws
    wr = abs(w0 - k*ws)              # the line inside |w| < ws/2
    print(f'T = {T:.4f} s: ws = {ws/np.pi:.1f} pi, x_r at {wr/np.pi:.1f} pi rad/s')

T = 2/3; n = np.arange(7)
t = np.linspace(0, 4, 2001)
plt.plot(t, np.cos(2*np.pi*t), '--', t, np.cos(np.pi*t))
plt.plot(n*T, np.cos(2*np.pi*n*T), 'o')
plt.xlabel(r'$t$ (s)'); plt.ylabel(r'$x(t),\\ x_r(t)$'); plt.grid(True)
plt.show()`},

'm7s4-two': {
  title:'Partial aliasing of two cosines',
  what:'Samples $\\cos(\\pi t)+\\cos(3\\pi t)$ at $T=2/5$ s, finds where each component is kept, and checks that $x_r(t)$ passes through every sample.',
  try:'Change $T$ to $1/2$ s. Predict where the component at $3\\pi$ returns before you run it.',
  out:'component 1 pi rad/s returns at 1 pi rad/s\ncomponent 3 pi rad/s returns at 2 pi rad/s\nsamples agree: yes',
  m:`% x(t) = cos(pi t) + cos(3 pi t) sampled at T = 2/5 s
T  = 2/5;  ws = 2*pi/T;              % 5 pi rad/s
w  = [pi 3*pi];                      % the two components
k  = floor(w/ws + 0.5);
wr = abs(w - k*ws);                  % where each one is kept
fprintf('component %.0f pi rad/s returns at %.0f pi rad/s\\n', [w; wr]/pi)
n  = 0:10;
x  = cos(w(1)*n*T) + cos(w(2)*n*T);
xr = cos(wr(1)*n*T) + cos(wr(2)*n*T);
s  = {'no', 'yes'};
fprintf('samples agree: %s\\n', s{1 + (max(abs(x - xr)) < 1e-9)})

t = linspace(0, 4, 2001);
plot(t, cos(w(1)*t) + cos(w(2)*t), '--', t, cos(wr(1)*t) + cos(wr(2)*t), n*T, x, 'o')
grid on, xlabel('t (s)'), ylabel('x(t), x_r(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(pi t) + cos(3 pi t) sampled at T = 2/5 s
T = 2/5; ws = 2*np.pi/T              # 5 pi rad/s
w = np.array([np.pi, 3*np.pi])       # the two components
k = np.floor(w/ws + 0.5)
wr = np.abs(w - k*ws)                # where each one is kept
for a, b in zip(w/np.pi, wr/np.pi):
    print(f'component {a:.0f} pi rad/s returns at {b:.0f} pi rad/s')
n = np.arange(11)
x = np.cos(w[0]*n*T) + np.cos(w[1]*n*T)
xr = np.cos(wr[0]*n*T) + np.cos(wr[1]*n*T)
print('samples agree:', ['no', 'yes'][int(np.max(np.abs(x - xr)) < 1e-9)])

t = np.linspace(0, 4, 2001)
plt.plot(t, np.cos(w[0]*t) + np.cos(w[1]*t), '--', t, np.cos(wr[0]*t) + np.cos(wr[1]*t))
plt.plot(n*T, x, 'o'); plt.xlabel(r'$t$ (s)'); plt.ylabel(r'$x(t),\\ x_r(t)$')
plt.grid(True); plt.show()`},

'm7s4-aa': {
  title:'The error with and without an anti-aliasing filter',
  what:'Averages $e^{2}(t)$ over one period of $2$ s for the two errors of the two-cosine example: $\\cos(3\\pi t)-\\cos(2\\pi t)$ with no filter, $\\cos(3\\pi t)$ with the filter first.',
  try:'Replace $\\cos(2\\pi t)$ in the first error by $\\cos(\\pi t)$. Predict the first mean-square error before you run it.',
  out:'no filter:      mean-square error = 1.0000\nfiltered first: mean-square error = 0.5000',
  m:`% mean-square error over one period of 2 s, with and without the filter
T0 = 2;                              % one period of both errors, s
N  = 200000;  dt = T0/N;
t  = ((0:N-1) + 0.5)*dt;             % the midpoints of N steps
e1 = cos(3*pi*t) - cos(2*pi*t);      % no filter: x(t) - x_r(t)
e2 = cos(3*pi*t);                    % the filter first
fprintf('no filter:      mean-square error = %.4f\\n', mean(e1.^2))
fprintf('filtered first: mean-square error = %.4f\\n', mean(e2.^2))

plot(t, e1, t, e2), grid on
xlabel('t (s)'), ylabel('e(t)'), legend('no filter', 'filtered first')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# mean-square error over one period of 2 s, with and without the filter
T0 = 2                               # one period of both errors, s
N = 200000; dt = T0/N
t = (np.arange(N) + 0.5)*dt          # the midpoints of N steps
e1 = np.cos(3*np.pi*t) - np.cos(2*np.pi*t)   # no filter: x(t) - x_r(t)
e2 = np.cos(3*np.pi*t)                       # the filter first
print(f'no filter:      mean-square error = {np.mean(e1**2):.4f}')
print(f'filtered first: mean-square error = {np.mean(e2**2):.4f}')

plt.plot(t, e1, label='no filter'); plt.plot(t, e2, label='filtered first')
plt.xlabel(r'$t$ (s)'); plt.ylabel(r'$e(t)$'); plt.legend(); plt.grid(True)
plt.show()`},

'm7s4-wheel': {
  title:'A wheel filmed at two frame rates',
  what:'A spoke turns at $9$ revolutions per second. The program takes the turn between two frames the shorter way round and prints the rotation seen at $10$ and at $20$ frames per second.',
  try:'Add the frame rate $9$ to the list. Predict what the film shows before you run it.',
  out:'10 frames/s: seen -1.0 rev/s\n20 frames/s: seen 9.0 rev/s',
  m:`% a spoke at 9 rev/s filmed at 10 and at 20 frames per second
r = 9;                               % revolutions per second
for fs = [10 20]
    u    = r/fs;                     % turns between two frames
    step = u - floor(u + 0.5);       % the shorter way round
    fprintf('%d frames/s: seen %.1f rev/s\\n', fs, step*fs)
end

fs = 10;  n = 0:10;
theta = 2*pi*(r/fs)*n;               % the true angle at each frame
seen  = angle(exp(1j*theta));        % the angle the frame shows
stem(n, seen), grid on
xlabel('frame n'), ylabel('angle seen (rad)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a spoke at 9 rev/s filmed at 10 and at 20 frames per second
r = 9                                # revolutions per second
for fs in [10, 20]:
    u = r/fs                         # turns between two frames
    step = u - np.floor(u + 0.5)     # the shorter way round
    print(f'{fs} frames/s: seen {step*fs:.1f} rev/s')

fs = 10; n = np.arange(11)
theta = 2*np.pi*(r/fs)*n             # the true angle at each frame
seen = np.angle(np.exp(1j*theta))    # the angle the frame shows
plt.stem(n, seen)
plt.xlabel(r'frame $n$'); plt.ylabel(r'angle seen (rad)'); plt.grid(True)
plt.show()`},
/* </m7-s4-code> */

/* <m7-s5-code> */
'm7s5-map': {
  title:'The band edge on the $\\Omega$ axis',
  what:'Takes a signal whose spectrum ends at $\\omega_M=2\\pi$ rad/s, maps the band edge to $\\Omega_M=\\omega_M T$ for four sampling periods, and says when the copies of $X_d(e^{j\\Omega})$ overlap. The plot draws $T\\,X_d(e^{j\\Omega})$ over three periods for $T=0.25$ s.',
  try:'Add $T=0.6$ s to the list. Predict $\\Omega_M$ and whether the copies overlap before you run it.',
  out:'T = 0.10 s: Omega_M = 0.20 pi, overlap: no\nT = 0.25 s: Omega_M = 0.50 pi, overlap: no\nT = 0.50 s: Omega_M = 1.00 pi, overlap: no\nT = 0.70 s: Omega_M = 1.40 pi, overlap: yes',
  m:`% x_c(t) with a triangle spectrum that ends at wM = 2 pi rad/s
wM = 2*pi;  s = {'no', 'yes'};
for T = [0.1 0.25 0.5 0.7]
    OM = wM*T;                       % the band edge on the Omega axis
    fprintf('T = %.2f s: Omega_M = %.2f pi, overlap: %s\\n', T, OM/pi, s{1 + (OM > pi)})
end

T = 0.25;  W = linspace(-3*pi, 3*pi, 2001);  Xd = 0*W;
for k = -2:2                         % one copy every 2 pi
    Xd = Xd + max(0, 1 - abs(W - 2*pi*k)/(wM*T));
end
plot(W, Xd), grid on
xticks(-3*pi:pi:3*pi), xticklabels({'-3π','-2π','-π','0','π','2π','3π'})
xlabel('Ω (rad/sample)'), ylabel('T X_d(e^{jΩ})')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x_c(t) with a triangle spectrum that ends at wM = 2 pi rad/s
wM = 2*np.pi
for T in [0.1, 0.25, 0.5, 0.7]:
    OM = wM*T                        # the band edge on the Omega axis
    s = ['no', 'yes'][int(OM > np.pi)]
    print(f'T = {T:.2f} s: Omega_M = {OM/np.pi:.2f} pi, overlap: {s}')

T = 0.25; W = np.linspace(-3*np.pi, 3*np.pi, 2001)
Xd = sum(np.maximum(0, 1 - np.abs(W - 2*np.pi*k)/(wM*T)) for k in range(-2, 3))
plt.plot(W, Xd); plt.grid(True)
plt.xticks(np.arange(-3, 4)*np.pi,
           [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$'])
plt.xlabel(r'$\\Omega$ (rad/sample)'); plt.ylabel(r'$T\\,X_d(e^{j\\Omega})$')
plt.show()`},

'm7s5-lowpass': {
  title:'A digital low-pass run at 8 kHz',
  what:'Runs an ideal low-pass with $\\Omega_c=\\pi/4$ at $f_s=8$ kHz, prints the equivalent cutoff $\\omega_c=\\Omega_c/T$ and $f_c=(\\Omega_c/2\\pi)f_s$, and filters a $500$ Hz plus $2$ kHz input through the DFT.',
  try:'Change $f_s$ to $16000$. Predict the new $f_c$, and whether the $2$ kHz tone now passes, before you run it.',
  out:'equivalent cutoff = 2000 pi rad/s = 1000 Hz\ny_d[n] is the 500 Hz tone: yes',
  m:`% an ideal digital low-pass, Omega_c = pi/4, run at fs = 8 kHz
fs = 8000;  T = 1/fs;  Wc = pi/4;
fprintf('equivalent cutoff = %.0f pi rad/s = %.0f Hz\\n', Wc/T/pi, Wc/(2*pi)*fs)
N = 800;  n = 0:N-1;
x = cos(2*pi*500*n*T) + cos(2*pi*2000*n*T);    % 500 Hz and 2 kHz
W = 2*pi*n/N;  W(W >= pi) = W(W >= pi) - 2*pi; % DFT bins on [-pi, pi)
y = real(ifft(fft(x) .* (abs(W) < Wc)));       % H_d = 1 for |Omega| < Omega_c
s = {'no', 'yes'};
fprintf('y_d[n] is the 500 Hz tone: %s\\n', s{1 + (max(abs(y - cos(2*pi*500*n*T))) < 1e-9)})

m = 1:40;
plot(n(m)*T*1e3, x(m), 'o--', n(m)*T*1e3, y(m), 's-')
grid on, xlabel('t (ms)'), ylabel('x_d[n], y_d[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# an ideal digital low-pass, Omega_c = pi/4, run at fs = 8 kHz
fs = 8000; T = 1/fs; Wc = np.pi/4
print(f'equivalent cutoff = {Wc/T/np.pi:.0f} pi rad/s = {Wc/(2*np.pi)*fs:.0f} Hz')
N = 800; n = np.arange(N)
x = np.cos(2*np.pi*500*n*T) + np.cos(2*np.pi*2000*n*T)    # 500 Hz and 2 kHz
W = 2*np.pi*n/N; W[W >= np.pi] -= 2*np.pi                 # DFT bins on [-pi, pi)
y = np.real(np.fft.ifft(np.fft.fft(x)*(np.abs(W) < Wc)))  # H_d = 1 for |Omega| < Omega_c
ok = np.max(np.abs(y - np.cos(2*np.pi*500*n*T))) < 1e-9
print('y_d[n] is the 500 Hz tone:', ['no', 'yes'][int(ok)])

t = n[:40]*T*1e3
plt.plot(t, x[:40], 'o--', t, y[:40], 's-')
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x_d[n],\\ y_d[n]$'); plt.grid(True)
plt.show()`},

'm7s5-diff': {
  title:'A differentiator made of numbers',
  what:'Applies $H_d(e^{j\\Omega})=j\\Omega/T$ on $|\\Omega|<\\pi$ to the samples of a $100$ Hz sine at $f_s=1$ kHz, prints the amplitude of the slope, and checks it against $dx_c/dt$ at $t=nT$.',
  try:'Change the tone to $200$ Hz. Predict the slope amplitude in 1/s before you run it.',
  out:'slope amplitude = 628.3 per s = 0.628 per ms\ny_d[n] = dx_c/dt at t = nT: yes',
  m:`% the band-limited differentiator H_d = j Omega/T on |Omega| < pi
fs = 1000;  T = 1/fs;  N = 100;  n = 0:N-1;
x = sin(2*pi*100*n*T);                          % a 100 Hz tone
W = 2*pi*n/N;  W(W >= pi) = W(W >= pi) - 2*pi; % DFT bins on [-pi, pi)
y = real(ifft(fft(x) .* (1j*W/T)));
a = max(abs(y));
fprintf('slope amplitude = %.1f per s = %.3f per ms\\n', a, a/1000)
s = {'no', 'yes'};
d = 2*pi*100*cos(2*pi*100*n*T);                 % dx_c/dt at t = nT
fprintf('y_d[n] = dx_c/dt at t = nT: %s\\n', s{1 + (max(abs(y - d)) < 1e-6)})

plot(n*T*1e3, x, 'o--', n*T*1e3, y/a, 's-')
grid on, xlabel('t (ms)'), ylabel('x_d[n], y_d[n]/628.3')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the band-limited differentiator H_d = j Omega/T on |Omega| < pi
fs = 1000; T = 1/fs; N = 100; n = np.arange(N)
x = np.sin(2*np.pi*100*n*T)                     # a 100 Hz tone
W = 2*np.pi*n/N; W[W >= np.pi] -= 2*np.pi       # DFT bins on [-pi, pi)
y = np.real(np.fft.ifft(np.fft.fft(x)*(1j*W/T)))
a = np.max(np.abs(y))
print(f'slope amplitude = {a:.1f} per s = {a/1000:.3f} per ms')
d = 2*np.pi*100*np.cos(2*np.pi*100*n*T)         # dx_c/dt at t = nT
print('y_d[n] = dx_c/dt at t = nT:', ['no', 'yes'][int(np.max(np.abs(y - d)) < 1e-6)])

plt.plot(n*T*1e3, x, 'o--', n*T*1e3, y/a, 's-')
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x_d[n],\\ y_d[n]/628.3$'); plt.grid(True)
plt.show()`},

'm7s5-delay': {
  title:'Half a sample of delay',
  what:'Applies $H_d(e^{j\\Omega})=e^{-j\\Omega/2}$ to the samples of $\\cos(2\\pi\\cdot 250\\,t)$ at $T=1$ ms, and checks that the new samples are $x_c\\big((n-\\tfrac12)T\\big)$, values that fall between the old ones.',
  try:'Change the delay to $e^{-j\\Omega/4}$. Predict $y_d[0]$ before you run it.',
  out:'y_d[0] = 0.707\ny_d[n] = x_c((n - 1/2)T): yes',
  m:`% the half-sample delay H_d = exp(-j Omega/2) on |Omega| < pi
T = 1e-3;  N = 40;  n = 0:N-1;
x = cos(2*pi*250*n*T);                          % samples of a 250 Hz tone
W = 2*pi*n/N;  W(W >= pi) = W(W >= pi) - 2*pi; % DFT bins on [-pi, pi)
y = real(ifft(fft(x) .* exp(-1j*W/2)));
fprintf('y_d[0] = %.3f\\n', y(1))
s = {'no', 'yes'};
xh = cos(2*pi*250*(n - 0.5)*T);                 % x_c at the midpoints
fprintf('y_d[n] = x_c((n - 1/2)T): %s\\n', s{1 + (max(abs(y - xh)) < 1e-9)})

t = linspace(0, 12e-3, 1201);  m = 1:13;
plot(t*1e3, cos(2*pi*250*t), '--', n(m), x(m), 'o', n(m) - 0.5, y(m), 's')
grid on, xlabel('t (ms)'), ylabel('x_c(t), x_d[n], y_d[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the half-sample delay H_d = exp(-j Omega/2) on |Omega| < pi
T = 1e-3; N = 40; n = np.arange(N)
x = np.cos(2*np.pi*250*n*T)                     # samples of a 250 Hz tone
W = 2*np.pi*n/N; W[W >= np.pi] -= 2*np.pi       # DFT bins on [-pi, pi)
y = np.real(np.fft.ifft(np.fft.fft(x)*np.exp(-1j*W/2)))
print(f'y_d[0] = {y[0]:.3f}')
xh = np.cos(2*np.pi*250*(n - 0.5)*T)            # x_c at the midpoints
print('y_d[n] = x_c((n - 1/2)T):', ['no', 'yes'][int(np.max(np.abs(y - xh)) < 1e-9)])

t = np.linspace(0, 12e-3, 1201); m = np.arange(13)
plt.plot(t*1e3, np.cos(2*np.pi*250*t), '--', m, x[m], 'o', m - 0.5, y[m], 's')
plt.xlabel(r'$t$ (ms)'); plt.ylabel(r'$x_c(t),\\ x_d[n],\\ y_d[n]$'); plt.grid(True)
plt.show()`},

'm7s5-quant': {
  title:'Six decibels a bit',
  what:'Quantizes a full-scale sine with $B=3$, $8$ and $16$ bits (step $\\Delta=2/2^B$), measures the signal-to-noise ratio on $200\\,000$ samples, and prints it next to the rule $6.02B+1.76$ dB.',
  try:'Add $B=1$ to the list. Predict whether the rule still holds to within $1$ dB before you run it.',
  out:'B =  3 bits: SNR = 19.1 dB, rule 6.02B + 1.76 = 19.8 dB\nB =  8 bits: SNR = 49.8 dB, rule 6.02B + 1.76 = 49.9 dB\nB = 16 bits: SNR = 98.1 dB, rule 6.02B + 1.76 = 98.1 dB',
  m:`% a mid-rise quantizer with B bits on [-1, 1], step D = 2/2^B
n = 0:199999;
x = sin(2*pi*0.0123456789*n);                   % a full-scale sine
for B = [3 8 16]
    D = 2/2^B;
    xq = min(max(D*(floor(x/D) + 0.5), -1 + D/2), 1 - D/2);
    snr = 10*log10(sum(x.^2)/sum((xq - x).^2));
    fprintf('B = %2d bits: SNR = %.1f dB, rule 6.02B + 1.76 = %.1f dB\\n', B, snr, 6.02*B + 1.76)
end

D = 2/2^3;  m = 1:82;                           % one period at B = 3
plot(m - 1, x(m), '--', m - 1, min(max(D*(floor(x(m)/D) + 0.5), -1 + D/2), 1 - D/2), '.-')
grid on, xlabel('n'), ylabel('x[n], x_q[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a mid-rise quantizer with B bits on [-1, 1], step D = 2/2^B
n = np.arange(200000)
x = np.sin(2*np.pi*0.0123456789*n)              # a full-scale sine
Q = lambda x, D: np.clip(D*(np.floor(x/D) + 0.5), -1 + D/2, 1 - D/2)
for B in [3, 8, 16]:
    D = 2/2**B
    snr = 10*np.log10(np.sum(x**2)/np.sum((Q(x, D) - x)**2))
    print(f'B = {B:2d} bits: SNR = {snr:.1f} dB, rule 6.02B + 1.76 = {6.02*B + 1.76:.1f} dB')

m = np.arange(82)                               # one period at B = 3
plt.plot(m, x[m], '--', m, Q(x[m], 2/2**3), '.-')
plt.xlabel(r'$n$'); plt.ylabel(r'$x[n],\\ x_q[n]$'); plt.grid(True)
plt.show()`},
/* </m7-s5-code> */

/* <m7-s6-code> */
'm7s6-sample': {
  title:'The height of the copies',
  what:'Samples the running sequence $x[n]=\\bigl(\\sin(\\pi n/8)/(\\pi n/8)\\bigr)^{2}$ with $N=3$, adds up $x[n]$ and $x_p[n]$ to get their transforms at $\\omega=0$, and draws $X_p(e^{j\\omega})$ over three periods.',
  try:'Change $N$ to $4$. Predict $X_p(e^{j0})$ before you run it.',
  out:'X(e^{j0})   = 8.0000\nX_p(e^{j0}) = 2.6667 = X(e^{j0})/N',
  m:`% the running sequence sampled with N = 3: the height of the copies
N = 3;
n = -600000:600000;
x = ones(size(n));  k = n ~= 0;
x(k) = (sin(pi*n(k)/8)./(pi*n(k)/8)).^2;   % x[n], with x[0] = 1
xp = x.*(mod(n, N) == 0);                  % one every N samples
fprintf('X(e^{j0})   = %.4f\\n', sum(x))
fprintf('X_p(e^{j0}) = %.4f = X(e^{j0})/N\\n', sum(xp))

w = linspace(-3*pi, 3*pi, 1201);  Xp = zeros(size(w));
for m = -60:60                             % X_p is real and even
    Xp = Xp + xp(n == m)*cos(w*m);
end
plot(w, Xp), grid on, xlabel('ω'), ylabel('X_p(e^{jω})')
xticks(-3*pi:pi:3*pi)
xticklabels({'-3π', '-2π', '-π', '0', 'π', '2π', '3π'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the running sequence sampled with N = 3: the height of the copies
N = 3
n = np.arange(-600000, 600001)
x = np.sinc(n/8)**2                        # (sin(pi n/8)/(pi n/8))^2, x[0] = 1
xp = x*(n % N == 0)                        # one every N samples
print(f'X(e^{{j0}})   = {x.sum():.4f}')
print(f'X_p(e^{{j0}}) = {xp.sum():.4f} = X(e^{{j0}})/N')

w = np.linspace(-3*np.pi, 3*np.pi, 1201); m = np.arange(-60, 61)
Xp = np.cos(np.outer(w, m)) @ xp[np.abs(n) <= 60]   # X_p is real and even
plt.plot(w, Xp); plt.grid(True)
plt.xticks(np.arange(-3, 4)*np.pi,
           [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$'])
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X_p(e^{j\\omega})$')
plt.show()`},

'm7s6-decim': {
  title:'Decimation with and without the prefilter',
  what:'Decimates one second of $500$ Hz plus $3$ kHz, sampled at $8$ kHz, by $N=2$, and lists the tones in each result, with and without a low-pass at $\\pi/N$ first.',
  try:'Change the second tone to $\\cos(5\\pi n/8)$, that is $2.5$ kHz. Predict where it lands without the prefilter before you run it.',
  out:'no prefilter: 500 1000 Hz\nprefilter: 500 Hz',
  m:`% 500 Hz + 3 kHz at 8 kHz, decimated by N = 2 with and without a prefilter
fs = 8000;  N = 2;  n = 0:fs-1;              % one second
x = cos(pi*n/8) + cos(3*pi*n/4);
f = 0:fs-1;                                  % bins of 1 Hz
H = double(f < fs/(2*N) | f > fs - fs/(2*N));   % ideal low-pass at pi/N
xf = real(ifft(fft(x).*H));
ys = {x(1:N:end), xf(1:N:end)};  s = {'no prefilter:', 'prefilter:'};
for i = 1:2
    Y = abs(fft(ys{i}));  L = numel(ys{i});
    k = find(Y(1:L/2) > L/4) - 1;            % the tones, in Hz
    fprintf('%s', s{i}); fprintf(' %d', k*fs/N/L); fprintf(' Hz\\n')
    subplot(2, 1, i), plot((0:L/2-1)*fs/N/L, Y(1:L/2)), ylabel('|Y|')
end
xlabel('f (Hz)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# 500 Hz + 3 kHz at 8 kHz, decimated by N = 2 with and without a prefilter
fs = 8000; N = 2; n = np.arange(fs)          # one second
x = np.cos(np.pi*n/8) + np.cos(3*np.pi*n/4)
f = np.arange(fs)                            # bins of 1 Hz
H = (f < fs/(2*N)) | (f > fs - fs/(2*N))     # ideal low-pass at pi/N
xf = np.real(np.fft.ifft(np.fft.fft(x)*H))
for i, (y, s) in enumerate([(x[::N], 'no prefilter:'), (xf[::N], 'prefilter:')]):
    Y = np.abs(np.fft.fft(y)); L = len(y)
    k = np.nonzero(Y[:L//2] > L/4)[0]        # the tones, in Hz
    print(s, ' '.join(str(int(v*fs/N/L)) for v in k), 'Hz')
    plt.subplot(2, 1, i+1); plt.plot(np.arange(L//2)*fs/N/L, Y[:L//2])
    plt.ylabel(r'$|Y|$')
plt.xlabel(r'$f$ (Hz)')
plt.show()`},

'm7s6-interp': {
  title:'Interpolation: images and the filter',
  what:'Puts one zero between the samples of a $500$ Hz tone at $4$ kHz, lists the tones before and after a low-pass of gain $2$ and cutoff $\\pi/2$, and checks that the old samples are kept.',
  try:'Change the tone to $\\cos(\\pi n/2)$, that is $1$ kHz. Predict where its image appears before you run it.',
  out:'zeros inserted: 500 3500 Hz\nafter the filter: 500 Hz\nold samples kept: yes',
  m:`% a 500 Hz tone at 4 kHz, interpolated by N = 2
fs = 4000;  N = 2;  n = 0:fs-1;  L = N*fs;
xb = cos(pi*n/4);                            % x_b[n]
xe = zeros(1, L);  xe(1:N:end) = xb;         % N - 1 zeros in each gap
f = 0:L-1;                                   % bins of 1 Hz at 8 kHz
H = N*double(f < L/(2*N) | f > L - L/(2*N)); % gain N, cutoff pi/N
y = real(ifft(fft(xe).*H));
vs = {xe, y};  s = {'zeros inserted:', 'after the filter:'};  yn = {'no', 'yes'};
for i = 1:2
    Y = abs(fft(vs{i}));
    fprintf('%s', s{i}); fprintf(' %d', find(Y(1:L/2) > L/8) - 1); fprintf(' Hz\\n')
end
fprintf('old samples kept: %s\\n', yn{1 + (max(abs(y(1:N:end) - xb)) < 1e-9)})
stem(0:39, y(1:40)), hold on, stem(0:N:39, xb(1:20)), hold off
xlabel('n'), ylabel('y[n]'), grid on`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a 500 Hz tone at 4 kHz, interpolated by N = 2
fs = 4000; N = 2; n = np.arange(fs); L = N*fs
xb = np.cos(np.pi*n/4)                       # x_b[n]
xe = np.zeros(L); xe[::N] = xb               # N - 1 zeros in each gap
f = np.arange(L)                             # bins of 1 Hz at 8 kHz
H = N*((f < L/(2*N)) | (f > L - L/(2*N)))    # gain N, cutoff pi/N
y = np.real(np.fft.ifft(np.fft.fft(xe)*H))
for v, s in [(xe, 'zeros inserted:'), (y, 'after the filter:')]:
    Y = np.abs(np.fft.fft(v))
    print(s, ' '.join(str(k) for k in np.nonzero(Y[:L//2] > L/8)[0]), 'Hz')
print('old samples kept:', ['no', 'yes'][int(np.max(np.abs(y[::N] - xb)) < 1e-9)])

plt.stem(np.arange(40), y[:40]); plt.stem(np.arange(0, 40, N), xb[:20], markerfmt='o')
plt.xlabel(r'$n$'); plt.ylabel(r'$y[n]$'); plt.grid(True)
plt.show()`},

'm7s6-ratio': {
  title:'A rate change by $L/M$',
  what:'Finds $L$ and $M$ for $48$ kHz to $44.1$ kHz from the greatest common divisor, then runs the chain up by $3$, filter, down by $2$ on $x[n]=\\cos(\\pi n/5)$.',
  try:'Change fin to $32000$ Hz. Predict $L$ and $M$ before you run it.',
  out:'gcd = 300, L = 147, M = 160\nfilter rate = 7056 kHz, cutoff = pi/160\ny[m] = cos(2 pi m/15): yes',
  m:`% from fin to fout: up by L, filter, down by M
fin = 48000;  fout = 44100;
g = gcd(fout, fin);  L = fout/g;  M = fin/g;
fprintf('gcd = %d, L = %d, M = %d\\n', g, L, M)
fprintf('filter rate = %d kHz, cutoff = pi/%d\\n', fin*L/1000, max(L, M))

% the same chain with L/M = 3/2 on x[n] = cos(pi n/5), three periods
x = cos(pi*(0:29)/5);
v = zeros(1, 90);  v(1:3:end) = x;           % up by 3
f = 0:89;  H = 3*double(f < 15 | f > 75);    % gain 3, cutoff pi/3
v = real(ifft(fft(v).*H));
y = v(1:2:end);                              % down by 2
s = {'no', 'yes'};
fprintf('y[m] = cos(2 pi m/15): %s\\n', s{1 + (max(abs(y - cos(2*pi*(0:44)/15))) < 1e-9)})
stem((0:44)*2/3, y), hold on, stem(0:29, x), hold off
xlabel('t/T'), ylabel('x[n], y[m]'), grid on`,
  py:`import numpy as np
import matplotlib.pyplot as plt
from math import gcd

# from fin to fout: up by L, filter, down by M
fin = 48000; fout = 44100
g = gcd(fout, fin); L = fout//g; M = fin//g
print(f'gcd = {g}, L = {L}, M = {M}')
print(f'filter rate = {fin*L//1000} kHz, cutoff = pi/{max(L, M)}')

# the same chain with L/M = 3/2 on x[n] = cos(pi n/5), three periods
x = np.cos(np.pi*np.arange(30)/5)
v = np.zeros(90); v[::3] = x                 # up by 3
f = np.arange(90); H = 3*((f < 15) | (f > 75))   # gain 3, cutoff pi/3
v = np.real(np.fft.ifft(np.fft.fft(v)*H))
y = v[::2]                                   # down by 2
print('y[m] = cos(2 pi m/15):', ['no', 'yes'][int(np.max(np.abs(y - np.cos(2*np.pi*np.arange(45)/15))) < 1e-9)])
plt.stem(np.arange(45)*2/3, y); plt.stem(np.arange(30), x, markerfmt='o')
plt.xlabel(r'$t/T$'); plt.ylabel(r'$x[n],\\ y[m]$'); plt.grid(True)
plt.show()`},
/* </m7-s6-code> */

};
