/* ==========================================================================
   Code for Module 5: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program works a signal
   or system from the section and prints the number the section computes,
   with the same wording in both languages, so `out` is one text for both.
   MATLAB uses no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M5`)
   that pages through its programs.
   verify/code_check.py runs every entry in both languages and compares
   what it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M5 = {
  'm5-code-transform': ['tr-series',  'tr-analysis', 'tr-riemann',  'tr-exist'],
  'm5-code-pairs':     ['pr-rect',    'pr-phase',    'pr-zeros',    'pr-tbp'],
  'm5-code-periodic':  ['pe-rect',    'pe-cos',      'pe-mixed',    'pe-imp'],
  'm5-code-props':     ['pp-shift',   'pp-scale',    'pp-parseval', 'pp-shiftex'],
  'm5-code-conv':      ['cv-exp',     'cv-lpf',      'cv-am',       'cv-sinc2'],
  'm5-code-diffeq':    ['de-h',       'de-simple',   'de-repeat',   'de-ode']
};

const CODE_M5 = {

'tr-series': {
  title:'Scaled coefficients converge to the transform',
  what:'Computes $T\\,a_k$ for the rectangular pulse ($T_1=1$) at $T=4$ and $T=16$ and compares it with $X(j\\omega_0)=2\\sin(\\omega_0T_1)/\\omega_0$ at $\\omega_0=2\\pi/T$.',
  try:'Change $T$ to $64$. Predict whether $Ta_1$ moves closer to or further from $X(j\\omega_0)$.',
  out:'T=4:  T*a1 = 1.2732   X(jw0) = 1.2732\nT=16:  T*a1 = 1.9489   X(jw0) = 1.9490',
  m:`% rect pulse, T1 = 1: T*a_k at k = 1, for T = 4 and T = 16
T1 = 1;
for T = [4 16]
    w0 = 2*pi/T;
    dt = 1e-4;
    N  = round(T/dt);
    t  = -T/2 + dt*(0:N-1);          % explicit sample count, matched to Python
    x  = double(abs(t) < T1);
    Tak = sum(x .* exp(-1j*1*w0*t)) * dt;   % T*a_1, no division by T
    Xw0 = 2*sin(w0*T1)/w0;                   % X(jw) at w = w0
    fprintf('T=%d:  T*a1 = %.4f   X(jw0) = %.4f\\n', T, real(Tak), Xw0)
end

w = linspace(-10, 10, 800);
plot(w, 2*sin(w*T1)./w, 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# rect pulse, T1 = 1: T*a_k at k = 1, for T = 4 and T = 16
T1 = 1
for T in [4, 16]:
    w0 = 2*np.pi/T
    dt = 1e-4
    N = round(T/dt)
    t = -T/2 + dt*np.arange(N)        # explicit sample count, matched to MATLAB
    x = (np.abs(t) < T1).astype(float)
    Tak = np.sum(x * np.exp(-1j*w0*t)) * dt   # T*a_1, no division by T
    Xw0 = 2*np.sin(w0*T1)/w0                   # X(jw) at w = w0
    print(f'T={T}:  T*a1 = {Tak.real:.4f}   X(jw0) = {Xw0:.4f}')

w = np.linspace(-10, 10, 800)
plt.plot(w, 2*np.sin(w*T1)/w, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(j\\omega)$')
plt.grid(True)
plt.show()`},

'tr-analysis': {
  title:'The analysis integral, computed numerically',
  what:'Evaluates $X(j\\omega)=\\int_0^\\infty e^{-t}e^{-j\\omega t}\\,dt$ at $\\omega=1$ by a Riemann sum and compares it with the closed form $1/(1+j\\omega)$.',
  try:'Change $\\omega$ to $2$. Predict the real part of $1/(1+j\\omega)$ before you run it.',
  out:'numeric = 0.5001 - 0.5000j\nformula = 0.5000 - 0.5000j',
  m:`% X(jw) = int_0^inf exp(-t) exp(-j w t) dt, w = 1, x(t) = exp(-t) u(t)
w  = 1;
dt = 1e-4;
t  = 0:dt:30;                    % effectively infinite for this decay
x  = exp(-t);

Xnum = sum(x .* exp(-1j*w*t)) * dt;
Xfor = 1/(1 + 1j*w);
fprintf('numeric = %.4f - %.4fj\\n', real(Xnum), abs(imag(Xnum)))
fprintf('formula = %.4f - %.4fj\\n', real(Xfor), abs(imag(Xfor)))

plot(t, x, 'LineWidth', 1.5), xlim([0 10]), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X(jw) = int_0^inf exp(-t) exp(-j w t) dt, w = 1, x(t) = exp(-t) u(t)
w = 1
dt = 1e-4
t = np.arange(0, 30, dt)         # effectively infinite for this decay
x = np.exp(-t)

Xnum = np.sum(x * np.exp(-1j*w*t)) * dt
Xfor = 1/(1 + 1j*w)
print(f'numeric = {Xnum.real:.4f} - {abs(Xnum.imag):.4f}j')
print(f'formula = {Xfor.real:.4f} - {abs(Xfor.imag):.4f}j')

plt.plot(t, x, linewidth=1.5)
plt.xlim(0, 10)
plt.xlabel(r'$t$'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'tr-riemann': {
  title:'Rebuilding a sample from the synthesis sum',
  what:'Sums $(1/2\\pi)\\sum_kX(jk\\omega_0)e^{jk\\omega_0t}\\omega_0$ for the rect pulse at $t=0$, and shows the sum approaching $x(0)=1$ as $\\omega_0$ shrinks.',
  try:'Change $t$ to $0.5$, inside the pulse. Predict whether the sum still approaches $1$.',
  out:'w0=0.6283: sum = 0.9881\nw0=0.0628: sum = 0.9974',
  m:`% rect pulse, T1 = 1, x(0) = 1: Riemann sum at t = 0 for two spacings
T1 = 1;
t  = 0;
for w0 = [0.2*pi 0.02*pi]
    K = round(30/w0);
    k = -K:K;
    Xk = 2*sin(k*w0*T1) ./ (k*w0);
    Xk(k == 0) = 2*T1;
    s = sum(Xk .* exp(1j*k*w0*t)) * w0 / (2*pi);
    fprintf('w0=%.4f: sum = %.4f\\n', w0, real(s))
end

k = -50:50; w0 = 0.2*pi;
Xk = 2*sin(k*w0*T1) ./ (k*w0); Xk(k==0) = 2*T1;
stem(k*w0, Xk, 'filled'), grid on
xlabel('frequency (rad/s)'), ylabel('X(jkw0)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# rect pulse, T1 = 1, x(0) = 1: Riemann sum at t = 0 for two spacings
T1 = 1
t = 0
for w0 in [0.2*np.pi, 0.02*np.pi]:
    K = round(30/w0)
    k = np.arange(-K, K+1)
    kk = np.where(k == 0, 1, k)
    Xk = np.where(k == 0, 2*T1, 2*np.sin(kk*w0*T1)/(kk*w0))
    s = np.sum(Xk * np.exp(1j*k*w0*t)) * w0 / (2*np.pi)
    print(f'w0={w0:.4f}: sum = {s.real:.4f}')

k = np.arange(-50, 51); w0 = 0.2*np.pi
kk = np.where(k == 0, 1, k)
Xk = np.where(k == 0, 2*T1, 2*np.sin(kk*w0*T1)/(kk*w0))
plt.stem(k*w0, Xk)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(jk\\omega_0)$')
plt.grid(True)
plt.show()`},

'tr-exist': {
  title:'Finite energy without finite area',
  what:'Checks the two existence conditions on $x(t)=\\sin(t)/t$: its energy $\\int|x|^2\\,dt$ converges over growing windows while its area $\\int|x|\\,dt$ keeps growing.',
  try:'Predict which one stabilises first as the window widens: the energy or the area.',
  out:'window=100: energy = 3.1316   area = 8.0934\nwindow=1000: energy = 3.1406   area = 11.0207',
  m:`% x(t) = sin(t)/t: energy converges, area (Dirichlet condition) does not
dt = 1e-3;
for W = [100 1000]
    N = round(2*W/dt) + 1;
    t = -W + dt*(0:N-1);              % explicit sample count, matched to Python
    x = sin(t) ./ t;  x(t == 0) = 1;      % sinc(0) = 1
    E = sum(abs(x).^2) * dt;
    A = sum(abs(x)) * dt;
    fprintf('window=%d: energy = %.4f   area = %.4f\\n', W, E, A)
end

t = -30:0.01:30; x = sin(t)./t; x(t==0) = 1;
plot(t, x, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('sin(t)/t')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = sin(t)/t: energy converges, area (Dirichlet condition) does not
dt = 1e-3
for W in [100, 1000]:
    N = round(2*W/dt) + 1
    t = -W + dt*np.arange(N)          # explicit sample count, matched to MATLAB
    tt = np.where(t == 0, 1, t)
    x = np.where(t == 0, 1.0, np.sin(tt)/tt)   # sinc(0) = 1
    E = np.sum(np.abs(x)**2) * dt
    A = np.sum(np.abs(x)) * dt
    print(f'window={W}: energy = {E:.4f}   area = {A:.4f}')

t = np.arange(-30, 30, 0.01)
tt = np.where(t == 0, 1, t)
x = np.where(t == 0, 1.0, np.sin(tt)/tt)
plt.plot(t, x, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$\\sin(t)/t$')
plt.grid(True)
plt.show()`},

'pr-rect': {
  title:'The rectangular pulse and the unnormalised sinc',
  what:'Computes $X(j\\omega)$ of the pulse $|t|<T_1$ numerically and compares it with $2T_1\\operatorname{sinc}(\\omega T_1)$, $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$, the unnormalised sinc used in this course.',
  try:'Change $T_1$ to $2$. Predict the new peak $X(j0)=2T_1$ before you run it.',
  out:'numeric X(j2) = 0.9093   formula = 0.9093',
  m:`% x(t) = 1 on |t| < T1, T1 = 1, w = 2: numeric vs 2*T1*sinc(w*T1)
% sinc here is unnormalised: sinc(theta) = sin(theta)/theta
T1 = 1;  w = 2;
dt = 1e-4;
t  = -5:dt:5;
x  = double(abs(t) < T1);
Xnum = sum(x .* exp(-1j*w*t)) * dt;

theta = w*T1;
sinc_u = sin(theta)/theta;               % NOT MATLAB's sinc(), which is normalised
Xfor = 2*T1*sinc_u;
fprintf('numeric X(j2) = %.4f   formula = %.4f\\n', real(Xnum), Xfor)

wv = linspace(-12, 12, 1200);
plot(wv, 2*T1*sin(wv*T1)./(wv*T1), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on |t| < T1, T1 = 1, w = 2: numeric vs 2*T1*sinc(w*T1)
# sinc here is unnormalised: sinc(theta) = sin(theta)/theta
T1, w = 1, 2
dt = 1e-4
t = np.arange(-5, 5, dt)
x = (np.abs(t) < T1).astype(float)
Xnum = np.sum(x * np.exp(-1j*w*t)) * dt

theta = w*T1
sinc_u = np.sin(theta)/theta             # NOT np.sinc(), which is normalised
Xfor = 2*T1*sinc_u
print(f'numeric X(j2) = {Xnum.real:.4f}   formula = {Xfor:.4f}')

wv = np.linspace(-12, 12, 1200)
plt.plot(wv, 2*T1*np.sin(wv*T1)/(wv*T1), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(j\\omega)$')
plt.grid(True)
plt.show()`},

'pr-phase': {
  title:'The phase of a one-sided exponential',
  what:'Computes the phase of $X(j\\omega)=1/(a+j\\omega)$ at $\\omega=1$, $a=1$: $\\angle X=-\\arctan(\\omega/a)$.',
  try:'Change $\\omega$ to $-1$. Predict the sign of the phase before you run it.',
  out:'phase = -0.7854\n-arctan(w/a) = -0.7854',
  m:`% X(jw) = 1/(a + jw), a = 1, w = 1: phase = -arctan(w/a)
a = 1;  w = 1;
X   = 1/(a + 1j*w);
ph  = angle(X);
phf = -atan(w/a);                % the closed form
fprintf('phase = %.4f\\n', ph)
fprintf('-arctan(w/a) = %.4f\\n', phf)

wv = linspace(-6, 6, 600);
plot(wv, angle(1./(a + 1j*wv)), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('angle X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X(jw) = 1/(a + jw), a = 1, w = 1: phase = -arctan(w/a)
a, w = 1, 1
X = 1/(a + 1j*w)
ph = np.angle(X)
phf = -np.arctan(w/a)            # the closed form
print(f'phase = {ph:.4f}')
print(f'-arctan(w/a) = {phf:.4f}')

wv = np.linspace(-6, 6, 600)
plt.plot(wv, np.angle(1/(a + 1j*wv)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$\\angle X(j\\omega)$')
plt.grid(True)
plt.show()`},

'pr-zeros': {
  title:'The first zero and the first side lobe of a sinc',
  what:'Finds the first zero of $X(j\\omega)=2\\sin(\\omega)/\\omega$ ($T_1=1$) at $\\omega=\\pi$ and the depth of the first side lobe near $\\omega=4.4934$.',
  try:'Predict the location of the second zero before you run it: it is another $\\pi$ further out.',
  out:'first zero = 3.1416\nfirst side lobe = -0.4345 at w = 4.4934',
  m:`% X(jw) = 2 sin(w)/w, T1 = 1: first zero at pi, first side lobe near 4.4934
w  = linspace(0.01, 8, 200000);
X  = 2*sin(w)./w;

fprintf('first zero = %.4f\\n', pi)

mask = (w > pi) & (w < 2*pi);
[lobe, idx] = min(X(mask));
wm = w(mask);
fprintf('first side lobe = %.4f at w = %.4f\\n', lobe, wm(idx))

plot(w, X, 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X(jw) = 2 sin(w)/w, T1 = 1: first zero at pi, first side lobe near 4.4934
w = np.linspace(0.01, 8, 200000)
X = 2*np.sin(w)/w

print(f'first zero = {np.pi:.4f}')

mask = (w > np.pi) & (w < 2*np.pi)
idx = np.argmin(X[mask])
lobe = X[mask][idx]
wm = w[mask][idx]
print(f'first side lobe = {lobe:.4f} at w = {wm:.4f}')

plt.plot(w, X, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(j\\omega)$')
plt.grid(True)
plt.show()`},

'pr-tbp': {
  title:'The time-bandwidth product stays fixed',
  what:'Computes the product of the pulse half-width $T_1$ and its first null $\\pi/T_1$ for $T_1=1$ and $T_1=0.25$: both equal $\\pi$.',
  try:'Predict the product for $T_1=4$ before you run it.',
  out:'T1=1.00: first null = 3.1416   product = 3.1416\nT1=0.25: first null = 12.5664   product = 3.1416',
  m:`% rect pulse: first null of 2*sin(w*T1)/w is at w = pi/T1
for T1 = [1 0.25]
    null1 = pi/T1;
    prod  = T1*null1;
    fprintf('T1=%.2f: first null = %.4f   product = %.4f\\n', T1, null1, prod)
end

w = linspace(0.01, 15, 2000);
plot(w, 2*sin(w*0.25)./w, 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# rect pulse: first null of 2*sin(w*T1)/w is at w = pi/T1
for T1 in [1, 0.25]:
    null1 = np.pi/T1
    prod = T1*null1
    print(f'T1={T1:.2f}: first null = {null1:.4f}   product = {prod:.4f}')

w = np.linspace(0.01, 15, 2000)
plt.plot(w, 2*np.sin(w*0.25)/w, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(j\\omega)$')
plt.grid(True)
plt.show()`},

'pe-rect': {
  title:'Impulse weights of a periodic rectangular wave',
  what:'Computes the weight $2\\pi a_0$ and the harmonic spacing $\\omega_0$ for the rectangular wave $T=8T_1$, $T_1=1$, and checks $2\\pi a_0=1.5708$.',
  try:'Change $T$ to $16T_1$. Predict the new spacing before you run it.',
  out:'spacing = 0.7854\nweight at origin = 1.5708',
  m:`% rect wave, T1 = 1, T = 8*T1: spacing w0 and weight 2*pi*a0
T1 = 1;  T = 8*T1;
w0 = 2*pi/T;
a0 = 2*T1/T;
fprintf('spacing = %.4f\\n', w0)
fprintf('weight at origin = %.4f\\n', 2*pi*a0)

k = -6:6;
ak = sin(2*pi*k*T1/T) ./ (pi*k); ak(k==0) = a0;
stem(k*w0, 2*pi*ak, 'filled'), grid on
xlabel('frequency (rad/s)'), ylabel('2 pi a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# rect wave, T1 = 1, T = 8*T1: spacing w0 and weight 2*pi*a0
T1 = 1; T = 8*T1
w0 = 2*np.pi/T
a0 = 2*T1/T
print(f'spacing = {w0:.4f}')
print(f'weight at origin = {2*np.pi*a0:.4f}')

k = np.arange(-6, 7)
kk = np.where(k == 0, 1, k)
ak = np.where(k == 0, a0, np.sin(2*np.pi*kk*T1/T)/(np.pi*kk))
plt.stem(k*w0, 2*np.pi*ak)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$2\\pi a_k$')
plt.grid(True)
plt.show()`},

'pe-cos': {
  title:'Impulse weights of a cosine',
  what:'Transforms $4\\cos(3\\pi t)$ and prints the two impulse weights $4\\pi$ at $\\omega=\\pm3\\pi$.',
  try:'Change the amplitude to $6$. Predict the new weight before you run it.',
  out:'weight at +3pi = 12.5664\nweight at -3pi = 12.5664\nsum of both weights = 25.1327',
  m:`% 4*cos(3*pi*t) -> 4*pi*delta(w - 3pi) + 4*pi*delta(w + 3pi)
A = 4;  w1 = 3*pi;
weight = A*pi;
fprintf('weight at +3pi = %.4f\\n', weight)
fprintf('weight at -3pi = %.4f\\n', weight)
fprintf('sum of both weights = %.4f\\n', 2*weight)

t = linspace(-2, 2, 800);
plot(t, A*cos(w1*t), 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('4cos(3 pi t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# 4*cos(3*pi*t) -> 4*pi*delta(w - 3pi) + 4*pi*delta(w + 3pi)
A, w1 = 4, 3*np.pi
weight = A*np.pi
print(f'weight at +3pi = {weight:.4f}')
print(f'weight at -3pi = {weight:.4f}')
print(f'sum of both weights = {2*weight:.4f}')

t = np.linspace(-2, 2, 800)
plt.plot(t, A*np.cos(w1*t), linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$4\\cos(3\\pi t)$')
plt.grid(True)
plt.show()`},

'pe-mixed': {
  title:'The line spectrum of a mixed signal',
  what:'Computes the five impulse magnitudes and phases of $5+4\\cos(3\\pi t)+6\\sin(4\\pi t)$: $10\\pi$ at $\\omega=0$, $4\\pi$ at $\\pm3\\pi$, $6\\pi$ at $\\pm4\\pi$.',
  try:'Predict the phase at $\\omega=-4\\pi$ before you run it: the sine term gives $\\pm\\pi/2$.',
  out:'|X| at 0 = 31.4159, phase = 0.0000\n|X| at 3pi = 12.5664, phase = 0.0000\n|X| at 4pi = 18.8496, phase = -1.5708',
  m:`% x(t) = 5 + 4cos(3 pi t) + 6 sin(4 pi t): magnitudes and phases
w0m = 5*2*pi;                    % weight 5*2*pi*delta(w)
w3  = 4*pi;                      % weight 4*pi at +-3pi (real)
w4  = 6*pi/1j;                   % weight 6*pi/j at +4pi (imaginary)

fprintf('|X| at 0 = %.4f, phase = %.4f\\n', abs(w0m), angle(w0m))
fprintf('|X| at 3pi = %.4f, phase = %.4f\\n', abs(w3), angle(w3))
fprintf('|X| at 4pi = %.4f, phase = %.4f\\n', abs(w4), angle(w4))

t = linspace(-2, 2, 1600);
plot(t, 5 + 4*cos(3*pi*t) + 6*sin(4*pi*t), 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 5 + 4cos(3 pi t) + 6 sin(4 pi t): magnitudes and phases
w0m = 5*2*np.pi                  # weight 5*2*pi*delta(w)
w3 = 4*np.pi                     # weight 4*pi at +-3pi (real)
w4 = 6*np.pi/1j                  # weight 6*pi/j at +4pi (imaginary)

print(f'|X| at 0 = {abs(w0m):.4f}, phase = {np.angle(w0m):.4f}')
print(f'|X| at 3pi = {abs(w3):.4f}, phase = {np.angle(w3):.4f}')
print(f'|X| at 4pi = {abs(w4):.4f}, phase = {np.angle(w4):.4f}')

t = np.linspace(-2, 2, 1600)
plt.plot(t, 5 + 4*np.cos(3*np.pi*t) + 6*np.sin(4*np.pi*t), linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'pe-imp': {
  title:'The impulse train transforms into an impulse train',
  what:'Prints the spacing and weight $2\\pi/T$ of the transform of $\\sum_k\\delta(t-kT)$ for $T=1$ and $T=2$.',
  try:'Predict both numbers for $T=4$ before you run it.',
  out:'T=1: spacing = 6.2832   weight = 6.2832\nT=1: spacing*T = 6.2832\nT=2: spacing = 3.1416   weight = 3.1416\nT=2: spacing*T = 6.2832',
  m:`% impulse train, period T: spacing = weight = 2*pi/T
for T = [1 2]
    v = 2*pi/T;
    fprintf('T=%d: spacing = %.4f   weight = %.4f\\n', T, v, v)
    fprintf('T=%d: spacing*T = %.4f\\n', T, v*T)
end

k = -4:4; T = 1;
stem(k*2*pi/T, (2*pi/T)*ones(size(k)), 'filled'), grid on
xlabel('frequency (rad/s)'), ylabel('X(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# impulse train, period T: spacing = weight = 2*pi/T
for T in [1, 2]:
    v = 2*np.pi/T
    print(f'T={T}: spacing = {v:.4f}   weight = {v:.4f}')
    print(f'T={T}: spacing*T = {v*T:.4f}')

k = np.arange(-4, 5); T = 1
plt.stem(k*2*np.pi/T, (2*np.pi/T)*np.ones(k.size))
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(j\\omega)$')
plt.grid(True)
plt.show()`},

'pp-shift': {
  title:'A time shift leaves the magnitude alone',
  what:'Delays the pulse $|t|<1$ by $t_0=3$ and checks $|X(j\\omega)|$ is unchanged while the phase gains $-\\omega t_0$, at $\\omega=1$.',
  try:'Predict the phase change at $\\omega=2$ before you run it.',
  out:'magnitude difference = 0.0000\nphase change = -3.0000',
  m:`% x(t) = 1 on |t| < 1, delayed by t0 = 3, checked at w = 1
T1 = 1;  t0 = 3;  w = 1;
dt = 1e-4;
t  = -10:dt:10;
x  = double(abs(t) < T1);
y  = double(abs(t - t0) < T1);

Xx = sum(x .* exp(-1j*w*t)) * dt;
Xy = sum(y .* exp(-1j*w*t)) * dt;
fprintf('magnitude difference = %.4f\\n', abs(abs(Xy) - abs(Xx)))
fprintf('phase change = %.4f\\n', -w*t0)

plot(t, x, t, y, 'LineWidth', 1.5), xlim([-3 6]), grid on
xlabel('t'), legend('x(t)', 'x(t-t_0)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on |t| < 1, delayed by t0 = 3, checked at w = 1
T1, t0, w = 1, 3, 1
dt = 1e-4
t = np.arange(-10, 10, dt)
x = (np.abs(t) < T1).astype(float)
y = (np.abs(t - t0) < T1).astype(float)

Xx = np.sum(x * np.exp(-1j*w*t)) * dt
Xy = np.sum(y * np.exp(-1j*w*t)) * dt
print(f'magnitude difference = {abs(abs(Xy) - abs(Xx)):.4f}')
print(f'phase change = {-w*t0:.4f}')

plt.plot(t, x, t, y, linewidth=1.5)
plt.xlim(-3, 6)
plt.xlabel(r'$t$'); plt.legend(['x(t)', 'x(t-t_0)'])
plt.grid(True)
plt.show()`},

'pp-scale': {
  title:'Time scaling: half the height, twice the width',
  what:'Scales the band $|\\omega|<2\\pi$ by $x(2t)\\leftrightarrow0.5X(j\\omega/2)$ and checks the new band edge $4\\pi$ and height $0.5$.',
  try:'Change the scale factor to $0.5$. Predict the new band edge before you run it.',
  out:'new height = 0.5000\nnew band edge = 12.5664',
  m:`% X(jw) = 1 on |w| < 2*pi: scale x(2t) -> 0.5*X(jw/2)
a = 2;  W = 2*pi;
newHeight = 1/abs(a);
newEdge   = a*W;
fprintf('new height = %.4f\\n', newHeight)
fprintf('new band edge = %.4f\\n', newEdge)

w = linspace(-15, 15, 1000);
plot(w, newHeight*(abs(w) < newEdge), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('0.5X(jw/2)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X(jw) = 1 on |w| < 2*pi: scale x(2t) -> 0.5*X(jw/2)
a, W = 2, 2*np.pi
newHeight = 1/abs(a)
newEdge = a*W
print(f'new height = {newHeight:.4f}')
print(f'new band edge = {newEdge:.4f}')

w = np.linspace(-15, 15, 1000)
plt.plot(w, newHeight*(np.abs(w) < newEdge), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$0.5X(j\\omega/2)$')
plt.grid(True)
plt.show()`},

'pp-parseval': {
  title:'Parseval for the one-sided exponential',
  what:'Computes the energy of $e^{-t}u(t)$ two ways: $\\int|x(t)|^2\\,dt$ and $(1/2\\pi)\\int|X(j\\omega)|^2\\,d\\omega$, both equal to $0.5$.',
  try:'Change the decay rate to $a=2$. Predict the new energy before you run it.',
  out:'energy from time = 0.5001\nenergy from frequency = 0.4999',
  m:`% x(t) = exp(-t) u(t): energy in time and in frequency, a = 1
a  = 1;
dt = 1e-4;
t  = 0:dt:30;
x  = exp(-a*t);
Et = sum(x.^2) * dt;
fprintf('energy from time = %.4f\\n', Et)

w  = -4000:0.02:4000;
Ef = sum(1./(a^2 + w.^2)) * 0.02 / (2*pi);
fprintf('energy from frequency = %.4f\\n', Ef)

plot(t, x, 'LineWidth', 1.5), xlim([0 6]), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = exp(-t) u(t): energy in time and in frequency, a = 1
a = 1
dt = 1e-4
t = np.arange(0, 30, dt)
x = np.exp(-a*t)
Et = np.sum(x**2) * dt
print(f'energy from time = {Et:.4f}')

w = np.arange(-4000, 4000, 0.02)
Ef = np.sum(1/(a**2 + w**2)) * 0.02 / (2*np.pi)
print(f'energy from frequency = {Ef:.4f}')

plt.plot(t, x, linewidth=1.5)
plt.xlim(0, 6)
plt.xlabel(r'$t$'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'pp-shiftex': {
  title:'The value at the origin is the area',
  what:'Builds $x_3(t)=2x_1(t-4)+x_2(t-3)$ from two pulses and checks $X_3(j0)=10$ against the shaded area under $x_3$.',
  try:'Predict $X_3(j0)$ if the factor 2 in front of $x_1$ became 3.',
  out:'X3(j0) from transform = 9.9997\nX3(j0) from area = 10.0000',
  m:`% x3(t) = 2*x1(t-4) + x2(t-3), x1 = rect(|t|<2), x2 = rect(|t|<1)
dt = 1e-4;
N  = round(12/dt);
t  = -2 + dt*(0:N-1);             % explicit sample count, matched to Python
x1 = double(abs(t-4) < 2);
x2 = double(abs(t-3) < 1);
x3 = 2*x1 + x2;

X3_0 = sum(x3) * dt;              % X3(j0) = integral of x3
fprintf('X3(j0) from transform = %.4f\\n', X3_0)
fprintf('X3(j0) from area = %.4f\\n', 3*2 + 2*2)   % 3 on 2<t<4, 2 on 4<t<6

plot(t, x3, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x_3(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x3(t) = 2*x1(t-4) + x2(t-3), x1 = rect(|t|<2), x2 = rect(|t|<1)
dt = 1e-4
N = round(12/dt)
t = -2 + dt*np.arange(N)          # explicit sample count, matched to MATLAB
x1 = (np.abs(t-4) < 2).astype(float)
x2 = (np.abs(t-3) < 1).astype(float)
x3 = 2*x1 + x2

X3_0 = np.sum(x3) * dt            # X3(j0) = integral of x3
print(f'X3(j0) from transform = {X3_0:.4f}')
print(f'X3(j0) from area = {3*2 + 2*2:.4f}')   # 3 on 2<t<4, 2 on 4<t<6

plt.plot(t, x3, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$x_3(t)$')
plt.grid(True)
plt.show()`},

'cv-exp': {
  title:'Convolution of two exponentials',
  what:'Convolves $e^{-t}u(t)$ and $e^{-2t}u(t)$ numerically and checks the result against $e^{-t}-e^{-2t}$, peak $0.25$ at $t=\\ln2$.',
  try:'Change the second decay rate to $b=3$. Predict the new peak location before you run it.',
  out:'peak = 0.2500 at t = 0.6930\nlargest difference = 0.0001',
  m:`% x(t) = exp(-t) u(t), h(t) = exp(-2t) u(t): y = x*h
a = 1;  b = 2;
dt = 1e-4;
t  = 0:dt:15;
x  = exp(-a*t);  h = exp(-b*t);
y  = conv(x, h) * dt;
ty = dt*(0:numel(y)-1);
[pk, idx] = max(y);
fprintf('peak = %.4f at t = %.4f\\n', pk, ty(idx))
yform = exp(-a*ty) - exp(-b*ty);
fprintf('largest difference = %.4f\\n', max(abs(y(1:numel(ty)) - yform)))

plot(ty, y, 'LineWidth', 1.5), xlim([0 6]), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = exp(-t) u(t), h(t) = exp(-2t) u(t): y = x*h
a, b = 1, 2
dt = 1e-4
t = np.arange(0, 15, dt)
x = np.exp(-a*t); h = np.exp(-b*t)
y = np.convolve(x, h) * dt
ty = dt*np.arange(y.size)
idx = np.argmax(y)
print(f'peak = {y[idx]:.4f} at t = {ty[idx]:.4f}')
yform = np.exp(-a*ty) - np.exp(-b*ty)
print(f'largest difference = {np.max(np.abs(y - yform)):.4f}')

plt.plot(ty, y, linewidth=1.5)
plt.xlim(0, 6)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'cv-lpf': {
  title:'Two ideal low-pass filters in cascade',
  what:'Multiplies $X(j\\omega)=2$ on $|\\omega|\\le4\\pi$ by $H(j\\omega)=3$ on $|\\omega|\\le2\\pi$ and checks the three peaks $x(0)=8$, $h(0)=6$, $y(0)=12$.',
  try:'Change the system height to $H=5$. Predict the new output peak before you run it.',
  out:'x(0) = 8.0000\nh(0) = 6.0000\ny(0) = 12.0000',
  m:`% X = 2 on |w|<=4pi, H = 3 on |w|<=2pi: cascade, peaks = area/(2*pi)
Ax = 2;  Wx = 4*pi;
Ah = 3;  Wh = 2*pi;
Ay = Ax*Ah;  Wy = min(Wx, Wh);

x0 = Ax*2*Wx/(2*pi);
h0 = Ah*2*Wh/(2*pi);
y0 = Ay*2*Wy/(2*pi);
fprintf('x(0) = %.4f\\n', x0)
fprintf('h(0) = %.4f\\n', h0)
fprintf('y(0) = %.4f\\n', y0)

w = linspace(-15, 15, 1000);
plot(w, Ay*(abs(w) <= Wy), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('Y(jw)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X = 2 on |w|<=4pi, H = 3 on |w|<=2pi: cascade, peaks = area/(2*pi)
Ax, Wx = 2, 4*np.pi
Ah, Wh = 3, 2*np.pi
Ay, Wy = Ax*Ah, min(Wx, Wh)

x0 = Ax*2*Wx/(2*np.pi)
h0 = Ah*2*Wh/(2*np.pi)
y0 = Ay*2*Wy/(2*np.pi)
print(f'x(0) = {x0:.4f}')
print(f'h(0) = {h0:.4f}')
print(f'y(0) = {y0:.4f}')

w = np.linspace(-15, 15, 1000)
plt.plot(w, Ay*(np.abs(w) <= Wy), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$Y(j\\omega)$')
plt.grid(True)
plt.show()`},

'cv-am': {
  title:'Amplitude modulation, product to sum',
  what:'Modulates $\\cos(\\pi t)$ by the carrier $\\cos(4\\pi t)$ and checks the two sideband frequencies $3\\pi$, $5\\pi$ with weight $\\pi/2$ each.',
  try:'Change the carrier to $\\cos(6\\pi t)$. Predict the new sideband frequencies.',
  out:'sidebands at 9.4248 and 15.7080\nweight at 9.4248 = 1.5708\nweight at 15.7080 = 1.5708',
  m:`% x(t) = cos(pi t), carrier cos(4 pi t): product-to-sum sidebands
wm = pi;  wc = 4*pi;
fprintf('sidebands at %.4f and %.4f\\n', wc - wm, wc + wm)
fprintf('weight at %.4f = %.4f\\n', wc - wm, pi/2)
fprintf('weight at %.4f = %.4f\\n', wc + wm, pi/2)

t = linspace(-2, 2, 2000);
z = cos(wm*t) .* cos(wc*t);
plot(t, z, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('z(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(pi t), carrier cos(4 pi t): product-to-sum sidebands
wm, wc = np.pi, 4*np.pi
print(f'sidebands at {wc - wm:.4f} and {wc + wm:.4f}')
print(f'weight at {wc - wm:.4f} = {np.pi/2:.4f}')
print(f'weight at {wc + wm:.4f} = {np.pi/2:.4f}')

t = np.linspace(-2, 2, 2000)
z = np.cos(wm*t) * np.cos(wc*t)
plt.plot(t, z, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$z(t)$')
plt.grid(True)
plt.show()`},

'cv-sinc2': {
  title:'The square of a sinc, and its transform triangle',
  what:'Evaluates $z(t)=\\sin(2\\pi t)/(\\pi t)$ squared at $t=0$, $z(0)=4$, and shows the triangle its transform forms, with apex $2$.',
  try:'Change the band edge to $\\pi$ instead of $2\\pi$. Predict the new value $z(0)$.',
  out:'z(0) = 4.0000\ntriangle apex = 2.0000',
  m:`% z(t) = [sin(2 pi t)/(pi t)]^2: z(0) and the triangle apex in frequency
W = 2*pi;
z0 = (W/pi)^2;
fprintf('z(0) = %.4f\\n', z0)
apex = W/pi;
fprintf('triangle apex = %.4f\\n', apex)

t = linspace(-3, 3, 3000); t(t==0) = 1e-9;
z = (sin(W*t)./(pi*t)).^2;
plot(t, z, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('z(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# z(t) = [sin(2 pi t)/(pi t)]^2: z(0) and the triangle apex in frequency
W = 2*np.pi
z0 = (W/np.pi)**2
print(f'z(0) = {z0:.4f}')
apex = W/np.pi
print(f'triangle apex = {apex:.4f}')

t = np.linspace(-3, 3, 3000)
t = np.where(t == 0, 1e-9, t)
z = (np.sin(W*t)/(np.pi*t))**2
plt.plot(t, z, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$z(t)$')
plt.grid(True)
plt.show()`},

'de-h': {
  title:'The frequency response of a differential equation',
  what:'Forms $H(j\\omega)=(j\\omega+2)/((j\\omega+1)(j\\omega+3))$ from the differential equation of this section and prints $H(j0)$, $|H(j1)|$ and $\\angle H(j1)$.',
  try:'Predict $H(j0)$ from the formula before you run it: set $\\omega=0$.',
  out:'H(j0) = 0.6667\n|H(j1)| = 0.5000\nangle H(j1) = -0.6435\n|H(j100)| = 0.0100',
  m:`% H(jw) = (jw+2) / ((jw+1)(jw+3)), from y'' + 4y' + 3y = x' + 2x
H = @(w) (1j*w + 2) ./ ((1j*w + 1) .* (1j*w + 3));
fprintf('H(j0) = %.4f\\n', real(H(0)))
fprintf('|H(j1)| = %.4f\\n', abs(H(1)))
fprintf('angle H(j1) = %.4f\\n', angle(H(1)))
fprintf('|H(j100)| = %.4f\\n', abs(H(100)))

w = linspace(-10, 10, 1000);
plot(w, abs(H(w)), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('|H(jw)|')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# H(jw) = (jw+2) / ((jw+1)(jw+3)), from y'' + 4y' + 3y = x' + 2x
def H(w):
    return (1j*w + 2) / ((1j*w + 1) * (1j*w + 3))

print(f'H(j0) = {H(0).real:.4f}')
print(f'|H(j1)| = {abs(H(1)):.4f}')
print(f'angle H(j1) = {np.angle(H(1)):.4f}')
print(f'|H(j100)| = {abs(H(100)):.4f}')

w = np.linspace(-10, 10, 1000)
plt.plot(w, np.abs(H(w)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|H(j\\omega)|$')
plt.grid(True)
plt.show()`},

'de-simple': {
  title:'Partial fractions with simple poles',
  what:'Splits $H(j\\omega)=(j\\omega+2)/((j\\omega+1)(j\\omega+3))$ by the cover-up rule, $A=B=0.5$, and checks $\\int_0^\\infty h(t)\\,dt=2/3$ numerically.',
  try:'Predict $h(0)$ from $A+B$ before you run it.',
  out:'A = 0.5000, B = 0.5000\narea = 0.6667',
  m:`% H(jw) = (jw+2)/((jw+1)(jw+3)) = A/(jw+1) + B/(jw+3)
% cover-up: A = (s+2)/(s+3) at s=-1, B = (s+2)/(s+1) at s=-3
A = (-1+2)/(-1+3);
B = (-3+2)/(-3+1);
fprintf('A = %.4f, B = %.4f\\n', A, B)

dt = 1e-4;  t = 0:dt:30;
h  = A*exp(-t) + B*exp(-3*t);
fprintf('area = %.4f\\n', sum(h)*dt)

plot(t, h, 'LineWidth', 1.5), xlim([0 6]), grid on
xlabel('t'), ylabel('h(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# H(jw) = (jw+2)/((jw+1)(jw+3)) = A/(jw+1) + B/(jw+3)
# cover-up: A = (s+2)/(s+3) at s=-1, B = (s+2)/(s+1) at s=-3
A = (-1+2)/(-1+3)
B = (-3+2)/(-3+1)
print(f'A = {A:.4f}, B = {B:.4f}')

dt = 1e-4; t = np.arange(0, 30, dt)
h = A*np.exp(-t) + B*np.exp(-3*t)
print(f'area = {np.sum(h)*dt:.4f}')

plt.plot(t, h, linewidth=1.5)
plt.xlim(0, 6)
plt.xlabel(r'$t$'); plt.ylabel(r'$h(t)$')
plt.grid(True)
plt.show()`},

'de-repeat': {
  title:'A repeated pole brings a factor of $t$',
  what:'Builds $y(t)=0.25e^{-t}+0.5te^{-t}-0.25e^{-3t}$ from the repeated-pole example, checks $y(0)=0$, and verifies it by direct convolution.',
  try:'Predict $y(0)$ if the last coefficient were $+0.25$ instead of $-0.25$.',
  out:'y(0) = 0.0000\nlargest difference from convolution = 0.0001',
  m:`% y(t) = 0.25 exp(-t) + 0.5 t exp(-t) - 0.25 exp(-3t)
dt = 1e-4;  t = 0:dt:15;
y  = 0.25*exp(-t) + 0.5*t.*exp(-t) - 0.25*exp(-3*t);
fprintf('y(0) = %.4f\\n', y(1))

x = exp(-t);                          % x(t) = exp(-t) u(t)
h = 0.5*exp(-t) + 0.5*exp(-3*t);      % h(t) from the simple-pole example
yc = conv(x, h) * dt;
yc = yc(1:numel(t));
fprintf('largest difference from convolution = %.4f\\n', max(abs(y - yc)))

plot(t, y, 'LineWidth', 1.5), xlim([0 6]), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y(t) = 0.25 exp(-t) + 0.5 t exp(-t) - 0.25 exp(-3t)
dt = 1e-4; t = np.arange(0, 15, dt)
y = 0.25*np.exp(-t) + 0.5*t*np.exp(-t) - 0.25*np.exp(-3*t)
print(f'y(0) = {y[0]:.4f}')

x = np.exp(-t)                        # x(t) = exp(-t) u(t)
h = 0.5*np.exp(-t) + 0.5*np.exp(-3*t) # h(t) from the simple-pole example
yc = np.convolve(x, h) * dt
yc = yc[:t.size]
print(f'largest difference from convolution = {np.max(np.abs(y - yc)):.4f}')

plt.plot(t, y, linewidth=1.5)
plt.xlim(0, 6)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'de-ode': {
  title:'Simulating the differential equation by a time step',
  what:'Steps the differential equation $\\ddot{y}+4\\dot{y}+3y=\\dot{x}+2x$ forward as a state-space system with a narrow pulse input, and compares the result with the impulse response $h(t)=0.5e^{-t}+0.5e^{-3t}$.',
  try:'Predict whether a narrower input pulse brings the simulation closer to $h(t)$.',
  out:'largest difference from h(t) = 0.0032',
  m:`% y'' + 4y' + 3y = x' + 2x, as z1' = z2 + x, z2' = -3z1 - 4z2 - 2x, y = z1
a1 = 4;  a0 = 3;  b1 = 1;  b0 = 2;  c1 = b0 - a1*b1;
dt = 1e-4;  N = round(15/dt);
t  = (0:N-1)*dt;
eps_ = 0.01;
x  = double(t < eps_) / eps_;         % a narrow pulse approximating an impulse

y = zeros(1, N);  z1 = 0;  z2 = 0;
for n = 1:N
    y(n) = z1;
    dz1 = z2 + b1*x(n);
    dz2 = -a0*z1 - a1*z2 + c1*x(n);
    z1 = z1 + dz1*dt;
    z2 = z2 + dz2*dt;
end

h = 0.5*exp(-t) + 0.5*exp(-3*t);
fprintf('largest difference from h(t) = %.4f\\n', max(abs(y(t>0.5) - h(t>0.5))))

plot(t, y, t, h, '--', 'LineWidth', 1.5), xlim([0 6]), grid on
xlabel('t'), legend('simulated y(t)', 'h(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y'' + 4y' + 3y = x' + 2x, as z1' = z2 + x, z2' = -3z1 - 4z2 - 2x, y = z1
a1, a0, b1, b0 = 4, 3, 1, 2; c1 = b0 - a1*b1
dt = 1e-4; N = round(15/dt)
t = np.arange(N)*dt; eps_ = 0.01
x = (t < eps_).astype(float) / eps_   # a narrow pulse approximating an impulse
y = np.zeros(N); z1, z2 = 0.0, 0.0
for n in range(N):
    y[n] = z1
    dz1 = z2 + b1*x[n]; dz2 = -a0*z1 - a1*z2 + c1*x[n]
    z1 += dz1*dt; z2 += dz2*dt

h = 0.5*np.exp(-t) + 0.5*np.exp(-3*t)
d = np.max(np.abs(y[t>0.5] - h[t>0.5]))
print(f'largest difference from h(t) = {d:.4f}')

plt.plot(t, y, t, h, '--', linewidth=1.5)
plt.xlim(0, 6); plt.xlabel(r'$t$'); plt.legend(['simulated y(t)', 'h(t)']); plt.grid(True)
plt.show()`}

};
