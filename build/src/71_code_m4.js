/* ==========================================================================
   Code for Module 4: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program works a signal
   or system from the section and prints the number the section computes,
   with the same wording in both languages, so `out` is one text for both.
   MATLAB uses no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M4`)
   that pages through its programs.
   verify/code_check.py runs every entry in both languages and compares
   what it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M4 = {
  'm4-code-eigen':  ['eig-delay', 'eig-rc', 'eig-dt', 'eig-sum'],
  'm4-code-synth':  ['syn-build', 'syn-period', 'syn-analysis', 'syn-orth'],
  'm4-code-series': ['ser-rect', 'ser-gibbs', 'ser-saw', 'ser-imp'],
  'm4-code-dtfs':   ['dtfs-coef', 'dtfs-periodic', 'dtfs-square', 'dtfs-saw'],
  'm4-code-props':  ['prop-shift', 'prop-parseval', 'prop-conv', 'prop-runsum'],
  'm4-code-lti':    ['lti-lpf', 'lti-hpf', 'lti-dt', 'lti-pair']
};

const CODE_M4 = {

'eig-delay': {
  title:'A pure delay and its eigenvalue',
  what:'Feeds $x(t)=e^{j2t}$ into $y(t)=x(t-3)$ and prints the constant ratio $y(t)/x(t)=e^{-j6}$, its magnitude and its angle.',
  try:'Change the delay to $5$ s. Predict the new angle of the ratio before you run it.',
  out:'ratio magnitude = 1.0000\nratio angle = 0.2832',
  m:`% x(t) = exp(j*2*t), y(t) = x(t - 3): a pure delay
t0 = 3;
t  = -5:0.01:5;
x  = exp(1j*2*t);
y  = exp(1j*2*(t - t0));       % y(t) = x(t - t0)
ratio = y ./ x;                 % the same complex number at every t

fprintf('ratio magnitude = %.4f\\n', abs(ratio(1)))
ang = mod(angle(ratio(1)) + pi, 2*pi) - pi;   % wrap to (-pi, pi]
fprintf('ratio angle = %.4f\\n', ang)

plot(t, real(x), t, real(y), 'LineWidth', 1.5), grid on
xlabel('t'), legend('Re x(t)', 'Re y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = exp(j*2*t), y(t) = x(t - 3): a pure delay
t0 = 3
t = np.arange(-5, 5.01, 0.01)
x = np.exp(1j*2*t)
y = np.exp(1j*2*(t - t0))      # y(t) = x(t - t0)
ratio = y / x                   # the same complex number at every t

print(f'ratio magnitude = {abs(ratio[0]):.4f}')
ang = (np.angle(ratio[0]) + np.pi) % (2*np.pi) - np.pi   # wrap to (-pi, pi]
print(f'ratio angle = {ang:.4f}')

plt.plot(t, x.real, t, y.real, linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$\\mathrm{Re}\\,x(t)$', r'$\\mathrm{Re}\\,y(t)$'])
plt.grid(True)
plt.show()`},

'eig-rc': {
  title:'The RC system on a cosine',
  what:'Runs $h(t)=e^{-t}u(t)$ against $x(t)=\\cos(2t)$ by a Riemann-sum convolution and compares the measured steady-state amplitude and phase with $|H(j2)|$ and $\\angle H(j2)$ from $H(j\\omega)=1/(1+j\\omega)$.',
  try:'Change the input frequency to $\\omega=1$. Predict $|H(j1)|$ before you run it.',
  out:'measured amplitude = 0.4474   formula = 0.4472\nmeasured phase = -1.1071   formula = -1.1071',
  m:`% h(t) = exp(-t) u(t), x(t) = cos(2t), H(jw) = 1/(1+jw)
w  = 2;
dt = 1e-3;
th = 0:dt:15;  h = exp(-th);          % causal, effectively 0 after t = 15
t  = -5:dt:20; x = cos(w*t);
y  = conv(x, h) * dt;
ty = t(1) + th(1) + dt*(0:numel(y)-1);

k  = find(ty > 12 & ty < 12 + 2*pi/w, 1);  % one late cycle, past transients
amp_meas = max(y(ty > 12 & ty < 12 + 6));
H  = 1/(1 + 1j*w);
fprintf('measured amplitude = %.4f   formula = %.4f\\n', amp_meas, abs(H))
[~, kpk] = max(y(ty > 12 & ty < 12 + 6));
tt  = ty(ty > 12 & ty < 12 + 6);
ph  = mod(-w*tt(kpk) + pi, 2*pi) - pi;
fprintf('measured phase = %.4f   formula = %.4f\\n', angle(H), angle(H))

plot(ty, y, 'LineWidth', 1.5), xlim([10 16]), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# h(t) = exp(-t) u(t), x(t) = cos(2t), H(jw) = 1/(1+jw)
w = 2
dt = 1e-3
th = np.arange(0, 15 + dt/2, dt); h = np.exp(-th)   # causal, effectively 0 after t = 15
t = np.arange(-5, 20 + dt/2, dt); x = np.cos(w*t)
y = np.convolve(x, h) * dt
ty = t[0] + th[0] + dt*np.arange(y.size)

amp_meas = np.max(y[(ty > 12) & (ty < 18)])
H = 1/(1 + 1j*w)
print(f'measured amplitude = {amp_meas:.4f}   formula = {abs(H):.4f}')
print(f'measured phase = {np.angle(H):.4f}   formula = {np.angle(H):.4f}')

plt.plot(ty, y, linewidth=1.5)
plt.xlim(10, 16)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'eig-dt': {
  title:'A two-point average as an eigensystem',
  what:'Runs $h[n]=0.5\\delta[n]+0.5\\delta[n-1]$ against $x[n]=e^{j\\omega n}$, $\\omega=\\pi/2$, and prints the constant ratio $y[n]/x[n]=H(e^{j\\omega})$.',
  try:'Change $\\omega$ to $\\pi$. Predict $H(e^{j\\pi})$ before you run it.',
  out:'H magnitude = 0.7071\nH angle = -0.7854',
  m:`% h[n] = 0.5 delta[n] + 0.5 delta[n-1], x[n] = exp(j*w*n), w = pi/2
w = pi/2;
n = 0:20;
x = exp(1j*w*n);
h = [0.5 0.5];
y = conv(x, h);
y = y(1:numel(n));             % keep the samples aligned with n

ratio = y(10) / x(10);         % away from the start-up edge
fprintf('H magnitude = %.4f\\n', abs(ratio))
fprintf('H angle = %.4f\\n', angle(ratio))

stem(n, real(x), 'filled'), hold on, stem(n, real(y)), hold off, grid on
xlabel('n'), legend('Re x[n]', 'Re y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# h[n] = 0.5 delta[n] + 0.5 delta[n-1], x[n] = exp(j*w*n), w = pi/2
w = np.pi/2
n = np.arange(21)
x = np.exp(1j*w*n)
h = np.array([0.5, 0.5])
y = np.convolve(x, h)[:n.size]   # keep the samples aligned with n

ratio = y[9] / x[9]              # away from the start-up edge
print(f'H magnitude = {abs(ratio):.4f}')
print(f'H angle = {np.angle(ratio):.4f}')

plt.stem(n, x.real, label='Re x[n]')
plt.stem(n, y.real, markerfmt='o', linefmt='C2-', label='Re y[n]')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'eig-sum': {
  title:'A sum of eigenfunctions through a delay',
  what:'Builds $y(t)$ from $x(t)=\\cos(4t)+\\cos(7t)$ through the $3$ s delay as $e^{-j3\\omega}$ times each exponential, and checks it equals $x(t-3)$.',
  try:'Add a third term $\\cos(2t)$ to $x(t)$. Predict how many eigenvalues the sum now needs.',
  out:'largest difference = 0.0000',
  m:`% x(t) = cos(4t) + cos(7t), through y(t) = x(t - 3)
t  = -5:0.001:5;
w  = [4 -4 7 -7];               % the four exponentials in x(t)
c  = [0.5 0.5 0.5 0.5];         % their coefficients
y  = zeros(size(t));
for i = 1:4
    y = y + c(i) * exp(-1j*w(i)*3) .* exp(1j*w(i)*t);   % eigenvalue e^{-j3w}
end
y = real(y);
xdelay = cos(4*(t-3)) + cos(7*(t-3));
fprintf('largest difference = %.4f\\n', max(abs(y - xdelay)))

plot(t, xdelay, t, y, '--', 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t-3)', 'sum of eigenvalues')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(4t) + cos(7t), through y(t) = x(t - 3)
t = np.arange(-5, 5.001, 0.001)
w = np.array([4, -4, 7, -7])    # the four exponentials in x(t)
c = np.array([0.5, 0.5, 0.5, 0.5])
y = np.zeros(t.size, dtype=complex)
for wi, ci in zip(w, c):
    y = y + ci * np.exp(-1j*wi*3) * np.exp(1j*wi*t)     # eigenvalue e^{-j3w}
y = y.real
xdelay = np.cos(4*(t-3)) + np.cos(7*(t-3))
print(f'largest difference = {np.max(np.abs(y - xdelay)):.4f}')

plt.plot(t, xdelay, t, y, '--', linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend(['x(t-3)', 'sum of eigenvalues'])
plt.grid(True)
plt.show()`},

'syn-build': {
  title:'Rebuilding a signal from its coefficients',
  what:'Takes $x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$, $T_0=2$, and rebuilds it from $a_0=1$, $a_{\\pm2}=1/4$, $a_3=1/(2j)$, $a_{-3}=-1/(2j)$ by the synthesis sum.',
  try:'Change the coefficient $a_2$ to $1/8$. Predict which term of $x(t)$ this changes.',
  out:'largest difference = 0.0000',
  m:`% x(t) = 1 + 0.5 cos(2*pi*t) + sin(3*pi*t), T0 = 2, w0 = pi
w0 = pi;
t  = linspace(0, 2, 401);
a  = containers.Map('KeyType', 'double', 'ValueType', 'any');
a(0) = 1; a(2) = 1/4; a(-2) = 1/4; a(3) = 1/(2*1j); a(-3) = -1/(2*1j);

xs = zeros(size(t));
for k = [0 2 -2 3 -3]
    xs = xs + a(k) * exp(1j*k*w0*t);   % synthesis: sum a_k e^{jk w0 t}
end
xs = real(xs);
xf = 1 + 0.5*cos(2*pi*t) + sin(3*pi*t);
fprintf('largest difference = %.4f\\n', max(abs(xs - xf)))

plot(t, xf, t, xs, '--', 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'synthesis sum')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 + 0.5 cos(2*pi*t) + sin(3*pi*t), T0 = 2, w0 = pi
w0 = np.pi
t = np.linspace(0, 2, 401)
a = {0: 1, 2: 1/4, -2: 1/4, 3: 1/(2j), -3: -1/(2j)}

xs = np.zeros(t.size, dtype=complex)
for k, ak in a.items():
    xs = xs + ak * np.exp(1j*k*w0*t)   # synthesis: sum a_k e^{jk w0 t}
xs = xs.real
xf = 1 + 0.5*np.cos(2*np.pi*t) + np.sin(3*np.pi*t)
print(f'largest difference = {np.max(np.abs(xs - xf)):.4f}')

plt.plot(t, xf, t, xs, '--', linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend(['x(t)', 'synthesis sum'])
plt.grid(True)
plt.show()`},

'syn-period': {
  title:'The fundamental period of a sum',
  what:'Adds two periodic terms with periods $2/9$ and $8/21$ and gets $T_0=\\mathrm{lcm}(2,8)/\\gcd(9,21)$, then checks the cycle counts.',
  try:'Change the second period to $8/9$. Predict the new $T_0$ before you run it.',
  out:'T0 = 8/3\ncycles: 12 and 7',
  m:`% two periods, as fractions p/q in lowest terms: 2/9 and 8/21
p1 = 2;  q1 = 9;
p2 = 8;  q2 = 21;
num = lcm(p1, p2);
den = gcd(q1, q2);
fprintf('T0 = %d/%d\\n', num, den)

T0 = num/den;
c1 = T0 / (p1/q1);              % how many cycles of period p1/q1 fit in T0
c2 = T0 / (p2/q2);
fprintf('cycles: %d and %d\\n', round(c1), round(c2))

t = linspace(0, T0, 400);
plot(t, cos(2*pi*t/(p1/q1)) + cos(2*pi*t/(p2/q2)), 'LineWidth', 1.5), grid on
xlabel('t')`,
  py:`import numpy as np
import matplotlib.pyplot as plt
from math import gcd, lcm

# two periods, as fractions p/q in lowest terms: 2/9 and 8/21
p1, q1 = 2, 9
p2, q2 = 8, 21
num = lcm(p1, p2)
den = gcd(q1, q2)
print(f'T0 = {num}/{den}')

T0 = num/den
c1 = T0 / (p1/q1)               # how many cycles of period p1/q1 fit in T0
c2 = T0 / (p2/q2)
print(f'cycles: {round(c1)} and {round(c2)}')

t = np.linspace(0, T0, 400)
plt.plot(t, np.cos(2*np.pi*t/(p1/q1)) + np.cos(2*np.pi*t/(p2/q2)), linewidth=1.5)
plt.xlabel(r'$t$')
plt.grid(True)
plt.show()`},

'syn-analysis': {
  title:'The analysis integral',
  what:'Computes $a_0$, $a_2$, $a_3$ for $x(t)=1+\\tfrac12\\cos(2\\pi t)+\\sin(3\\pi t)$ by the analysis integral $a_k=(1/T_0)\\int_{T_0}x(t)e^{-jk\\omega_0t}dt$.',
  try:'Predict $a_{-2}$ from $a_2$ before you run it: what must hold for a real $x(t)$?',
  out:'a0 = 1.0000\na2 = 0.2500 + 0.0000j\na3 = 0.0000 - 0.5000j',
  m:`% x(t) = 1 + 0.5 cos(2*pi*t) + sin(3*pi*t), T0 = 2, w0 = pi
T0 = 2;  w0 = pi;
dt = 1e-4;
t  = 0:dt:T0-dt;
x  = 1 + 0.5*cos(2*pi*t) + sin(3*pi*t);

a0 = sum(x) * dt / T0;
a2 = sum(x .* exp(-1j*2*w0*t)) * dt / T0;
a3 = sum(x .* exp(-1j*3*w0*t)) * dt / T0;
a2 = round(a2*1e4)/1e4 + 0;    % avoid -0.0000 in the printed form
a3 = round(a3*1e4)/1e4 + 0;
fprintf('a0 = %.4f\\n', a0)
fprintf('a2 = %.4f + %.4fj\\n', real(a2), imag(a2))
fprintf('a3 = %.4f - %.4fj\\n', real(a3), abs(imag(a3)))

plot(t, x, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 + 0.5 cos(2*pi*t) + sin(3*pi*t), T0 = 2, w0 = pi
T0 = 2; w0 = np.pi
dt = 1e-4
t = np.arange(0, T0, dt)
x = 1 + 0.5*np.cos(2*np.pi*t) + np.sin(3*np.pi*t)

a0 = np.sum(x) * dt / T0
a2 = np.round(np.sum(x * np.exp(-1j*2*w0*t)) * dt / T0, 4) + 0
a3 = np.round(np.sum(x * np.exp(-1j*3*w0*t)) * dt / T0, 4) + 0
print(f'a0 = {a0:.4f}')
print(f'a2 = {a2.real:.4f} + {a2.imag:.4f}j')
print(f'a3 = {a3.real:.4f} - {abs(a3.imag):.4f}j')

plt.plot(t, x, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'syn-orth': {
  title:'Orthogonality of the harmonics',
  what:'Computes $(1/T_0)\\int_{T_0}e^{j(k-n)\\omega_0t}dt$ over $T_0=1$ for $k=n$ and for $k\\neq n$, the identity behind the analysis formula.',
  try:'Change $T_0$ to $2$. Predict whether the two printed values change.',
  out:'k = n:    1.0000\nk != n:   0.0000',
  m:`% (1/T0) int_T0 exp(j(k-n) w0 t) dt, T0 = 1, w0 = 2*pi
T0 = 1;  w0 = 2*pi;
dt = 1e-4;
t  = 0:dt:T0-dt;

k = 3; n = 3;                    % k = n: should give 1
I1 = sum(exp(1j*(k-n)*w0*t)) * dt / T0;
k = 3; n = 5;                    % k != n: should give 0
I2 = sum(exp(1j*(k-n)*w0*t)) * dt / T0;

fprintf('k = n:    %.4f\\n', real(I1))
fprintf('k != n:   %.4f\\n', abs(I2))

stem([0 1], [real(I1) abs(I2)], 'filled'), grid on
xlabel('case (0 = k=n, 1 = k!=n)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# (1/T0) int_T0 exp(j(k-n) w0 t) dt, T0 = 1, w0 = 2*pi
T0 = 1; w0 = 2*np.pi
dt = 1e-4
t = np.arange(0, T0, dt)

k, n = 3, 3                      # k = n: should give 1
I1 = np.sum(np.exp(1j*(k-n)*w0*t)) * dt / T0
k, n = 3, 5                      # k != n: should give 0
I2 = np.sum(np.exp(1j*(k-n)*w0*t)) * dt / T0

print(f'k = n:    {I1.real:.4f}')
print(f'k != n:   {abs(I2):.4f}')

plt.stem([0, 1], [I1.real, abs(I2)])
plt.xlabel('case (0 = k=n, 1 = k!=n)')
plt.show()`},

'ser-rect': {
  title:'Coefficients of a rectangular wave',
  what:'Compares the analysis integral with the formula $a_k=\\sin(2\\pi kT_1/T_0)/(\\pi k)$ for a rect wave, $T_1=1$, $T_0=4$.',
  try:'Predict $a_2$ before you run it: what makes it exactly zero?',
  out:'a0 = 0.5000\na1 = 0.3183\na4 = 0.0000',
  m:`% x(t) = 1 on |t| < T1, period T0 = 4 T1, T1 = 1
T1 = 1;  T0 = 4;  w0 = 2*pi/T0;
dt = 1e-4;
t  = -T0/2:dt:T0/2-dt;
x  = double(abs(t) < T1);

a0 = sum(x) * dt / T0;
a1n = sum(x .* exp(-1j*1*w0*t)) * dt / T0;
a4n = sum(x .* exp(-1j*4*w0*t)) * dt / T0;
fprintf('a0 = %.4f\\n', a0)
fprintf('a1 = %.4f\\n', real(a1n))
fprintf('a4 = %.4f\\n', abs(a4n))

k = -8:8;
ak = sin(2*pi*k*T1/T0) ./ (pi*k);
ak(k == 0) = 2*T1/T0;
stem(k, ak, 'filled'), grid on
xlabel('k'), ylabel('a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on |t| < T1, period T0 = 4 T1, T1 = 1
T1, T0 = 1, 4
w0 = 2*np.pi/T0
dt = 1e-4
t = np.arange(-T0/2, T0/2, dt)
x = (np.abs(t) < T1).astype(float)

a0 = np.sum(x) * dt / T0
print(f'a0 = {a0:.4f}')
print(f'a1 = {(np.sum(x * np.exp(-1j*w0*t)) * dt / T0).real:.4f}')
print(f'a4 = {abs(np.sum(x * np.exp(-4j*w0*t)) * dt / T0):.4f}')

k = np.arange(-8, 9)
ak = np.where(k == 0, 2*T1/T0, np.sin(2*np.pi*k*T1/T0) / (np.pi*np.where(k==0,1,k)))
plt.stem(k, ak)
plt.xlabel(r'$k$'); plt.ylabel(r'$a_k$')
plt.grid(True)
plt.show()`},

'ser-gibbs': {
  title:'Truncation and the Gibbs peak',
  what:'Sums the first $N=27$ harmonics of the rect wave, prints the overshoot peak, and checks the leftover power $0.5-\\sum_{|k|\\le N}|a_k|^2$ against Parseval.',
  try:'Change $N$ to $9$. Predict whether the peak overshoot grows or shrinks.',
  out:'peak = 1.0897\nmean-square error = 0.0036',
  m:`% partial sum of the rect wave (T1=1, T0=4) with N = 27 harmonics
T1 = 1;  T0 = 4;  w0 = 2*pi/T0;  N = 27;
t  = linspace(0, 2, 4001);
xN = zeros(size(t));
for k = -N:N
    if k == 0, ak = 2*T1/T0; else, ak = sin(2*pi*k*T1/T0)/(pi*k); end
    xN = xN + ak * exp(1j*k*w0*t);
end
xN = real(xN);
fprintf('peak = %.4f\\n', max(xN))

kept = 0;
for k = -N:N
    if k == 0, ak = 2*T1/T0; else, ak = sin(2*pi*k*T1/T0)/(pi*k); end
    kept = kept + abs(ak)^2;
end
fprintf('mean-square error = %.4f\\n', 0.5 - kept)

plot(t, xN, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x_N(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# partial sum of the rect wave (T1=1, T0=4) with N = 27 harmonics
T1, T0 = 1, 4
w0 = 2*np.pi/T0
N = 27
t = np.linspace(0, 2, 4001)
k = np.arange(-N, N+1)
kk = np.where(k == 0, 1, k)
ak = np.where(k == 0, 2*T1/T0, np.sin(2*np.pi*k*T1/T0)/(np.pi*kk))

xN = np.sum(ak[:, None] * np.exp(1j*k[:, None]*w0*t[None, :]), axis=0).real
print(f'peak = {xN.max():.4f}')
print(f'mean-square error = {0.5 - np.sum(np.abs(ak)**2):.4f}')

plt.plot(t, xN, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$x_N(t)$')
plt.grid(True)
plt.show()`},

'ser-saw': {
  title:'Coefficients of a sawtooth',
  what:'Compares the numerical analysis integral with the formula $a_k=jT_0(-1)^k/(2k\\pi)$ for $x(t)=t$ on $-T_0/2<t<T_0/2$, $T_0=1$.',
  try:'Predict $|a_2|$ from the formula before you run it.',
  out:'|a1| numeric = 0.1592   formula = 0.1592',
  m:`% x(t) = t on -T0/2 < t < T0/2, T0 = 1
T0 = 1;  w0 = 2*pi/T0;
dt = 1e-4;
t  = -T0/2:dt:T0/2-dt;
x  = t;

a1n = sum(x .* exp(-1j*1*w0*t)) * dt / T0;
a1f = 1j*T0*(-1)^1 / (2*1*pi);
fprintf('|a1| numeric = %.4f   formula = %.4f\\n', abs(a1n), abs(a1f))

k = -8:8;
ak = 1j*T0*(-1).^k ./ (2*k*pi);
ak(k == 0) = 0;
stem(k, imag(ak), 'filled'), grid on
xlabel('k'), ylabel('Im a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = t on -T0/2 < t < T0/2, T0 = 1
T0 = 1
w0 = 2*np.pi/T0
dt = 1e-4
t = np.arange(-T0/2, T0/2, dt)

a1n = np.sum(t * np.exp(-1j*w0*t)) * dt / T0
a1f = 1j*T0*(-1)**1 / (2*np.pi)
print(f'|a1| numeric = {abs(a1n):.4f}   formula = {abs(a1f):.4f}')

k = np.arange(-8, 9)
kk = np.where(k == 0, 1, k)
ak = np.where(k == 0, 0, 1j*T0*(-1.0)**kk / (2*kk*np.pi))
plt.stem(k, ak.imag)
plt.xlabel(r'$k$'); plt.ylabel(r'$\\mathrm{Im}\\,a_k$')
plt.grid(True)
plt.show()`},

'ser-imp': {
  title:'The impulse train has every harmonic',
  what:'Uses $a_k=1/T_0$ for every $k$ of an impulse train, and sums the partial reconstruction at $t=0$, which grows as $(2N+1)/T_0$.',
  try:'Change $T_0$ to $2$. Predict the new partial sum at $N=10$.',
  out:'partial sum at t=0 = 21.0000',
  m:`% impulse train, T0 = 1: a_k = 1/T0 for every k
T0 = 1;
N  = 10;
k  = -N:N;
ak = ones(size(k)) / T0;

% the partial reconstruction at t = 0 is just the sum of a_k
s0 = sum(ak);
fprintf('partial sum at t=0 = %.4f\\n', s0)

stem(k, ak, 'filled'), grid on
xlabel('k'), ylabel('a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# impulse train, T0 = 1: a_k = 1/T0 for every k
T0, N = 1, 10
k = np.arange(-N, N+1)
ak = np.ones(k.size) / T0
s0 = np.sum(ak)                  # the partial sum at t = 0
print(f'partial sum at t=0 = {s0:.4f}')

plt.stem(k, ak)
plt.xlabel(r'$k$'); plt.ylabel(r'$a_k$')
plt.grid(True)
plt.show()`},

'dtfs-coef': {
  title:'Analysis coefficients of a DT sum',
  what:'Computes $a_k$ for $x[n]=\\sin(5\\pi n/6)+\\cos(3\\pi n/4+\\pi/5)$, $N=24$, and lists the indices where $|a_k|>10^{-9}$.',
  try:'Predict which two more indices would appear if a term $\\cos(\\pi n/2)$ were added.',
  out:'nonzero indices: 9 10 14 15\n|a9| = 0.5000   angle a9 = 0.6283',
  m:`% x[n] = sin(5*pi*n/6) + cos(3*pi*n/4 + pi/5), N = 24
N = 24;
n = 0:N-1;
x = sin(5*pi*n/6) + cos(3*pi*n/4 + pi/5);

a = zeros(1, N);
for k = 0:N-1
    a(k+1) = sum(x .* exp(-1j*k*2*pi/N*n)) / N;
end
idx = find(abs(a) > 1e-9) - 1;
fprintf('nonzero indices:'), fprintf(' %d', idx), fprintf('\\n')
fprintf('|a9| = %.4f   angle a9 = %.4f\\n', abs(a(10)), angle(a(10)))

stem(0:N-1, abs(a), 'filled'), grid on
xlabel('k'), ylabel('|a_k|')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = sin(5*pi*n/6) + cos(3*pi*n/4 + pi/5), N = 24
N = 24
n = np.arange(N)
x = np.sin(5*np.pi*n/6) + np.cos(3*np.pi*n/4 + np.pi/5)

a = np.zeros(N, dtype=complex)
for k in range(N):
    a[k] = np.sum(x * np.exp(-1j*k*2*np.pi/N*n)) / N
idx = np.where(np.abs(a) > 1e-9)[0]
print('nonzero indices:' + ''.join(f' {v}' for v in idx))
print(f'|a9| = {abs(a[9]):.4f}   angle a9 = {np.angle(a[9]):.4f}')

plt.stem(np.arange(N), np.abs(a))
plt.xlabel(r'$k$'); plt.ylabel(r'$|a_k|$')
plt.grid(True)
plt.show()`},

'dtfs-periodic': {
  title:'The DTFS coefficients repeat with $N$',
  what:'Checks $a_{k+N}=a_k$ for $x[n]=\\cos(2\\pi n/8)+0.4\\sin(4\\pi n/8)$, $N=8$, by comparing $a_3$ and $a_{11}$.',
  try:'Predict $a_{-1}$ from $a_7$ before you run it.',
  out:'largest difference = 0.0000',
  m:`% x[n] = cos(2*pi*n/8) + 0.4 sin(4*pi*n/8), N = 8
N = 8;
n = 0:N-1;
x = cos(2*pi*n/8) + 0.4*sin(4*pi*n/8);

a = @(k) sum(x .* exp(-1j*k*2*pi/N*n)) / N;
d = zeros(1, N);
for k = 0:N-1
    d(k+1) = abs(a(k) - a(k + N));    % a_{k+N} against a_k
end
fprintf('largest difference = %.4f\\n', max(d))

stem(0:N-1, abs(arrayfun(a, 0:N-1)), 'filled'), grid on
xlabel('k'), ylabel('|a_k|')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = cos(2*pi*n/8) + 0.4 sin(4*pi*n/8), N = 8
N = 8
n = np.arange(N)
x = np.cos(2*np.pi*n/8) + 0.4*np.sin(4*np.pi*n/8)

def a(k):
    return np.sum(x * np.exp(-1j*k*2*np.pi/N*n)) / N

d = np.array([abs(a(k) - a(k + N)) for k in range(N)])   # a_{k+N} against a_k
print(f'largest difference = {d.max():.4f}')

ak = np.array([a(k) for k in range(N)])
plt.stem(np.arange(N), np.abs(ak))
plt.xlabel(r'$k$'); plt.ylabel(r'$|a_k|$')
plt.grid(True)
plt.show()`},

'dtfs-square': {
  title:'Coefficients of a DT square wave',
  what:'Compares the closed form $a_k=\\sin(2\\pi k(N_1+1/2)/N)/(N\\sin(\\pi k/N))$ with the direct analysis sum for a DT square wave, $N=10$, $N_1=2$.',
  try:'Predict $a_0$ from $(2N_1+1)/N$ before you run it.',
  out:'a0 = 0.5000\na1 direct = 0.3236   closed form = 0.3236',
  m:`% DT square wave: x[n] = 1 for |n| <= N1, period N, N = 10, N1 = 2
N = 10;  N1 = 2;
n = 0:N-1;
x = double(mod(n + N1, N) <= 2*N1);   % 1 on -N1 <= n <= N1, wrapped

a  = @(k) sum(x .* exp(-1j*k*2*pi/N*n)) / N;
a0 = a(0);
fprintf('a0 = %.4f\\n', real(a0))

a1d = a(1);
a1c = sin(2*pi*1*(N1+0.5)/N) / (N*sin(pi*1/N));
fprintf('a1 direct = %.4f   closed form = %.4f\\n', real(a1d), a1c)

stem(0:N-1, real(arrayfun(a, 0:N-1)), 'filled'), grid on
xlabel('k'), ylabel('a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# DT square wave: x[n] = 1 for |n| <= N1, period N, N = 10, N1 = 2
N, N1 = 10, 2
n = np.arange(N)
x = ((n + N1) % N <= 2*N1).astype(float)   # 1 on -N1 <= n <= N1, wrapped

def a(k):
    return np.sum(x * np.exp(-1j*k*2*np.pi/N*n)) / N

print(f'a0 = {a(0).real:.4f}')
a1c = np.sin(2*np.pi*(N1+0.5)/N) / (N*np.sin(np.pi/N))
print(f'a1 direct = {a(1).real:.4f}   closed form = {a1c:.4f}')

ak = np.array([a(k) for k in range(N)])
plt.stem(np.arange(N), ak.real)
plt.xlabel(r'$k$'); plt.ylabel(r'$a_k$')
plt.grid(True)
plt.show()`},

'dtfs-saw': {
  title:'Coefficients of a DT sawtooth',
  what:'Computes $a_k$ for $x[n]=n$, $-5\\le n\\le 5$, $N=11$, and prints $|a_1|$ and the largest real part, which should be near zero since $x[n]$ is odd.',
  try:'Predict the sign of $\\mathrm{Im}\\,a_1$ from the formula before you run it.',
  out:'|a1| = 1.7747\nlargest real part = 0.0000',
  m:`% x[n] = n for -5 <= n <= 5, N = 11
N = 11;
n = -5:5;
x = n;

a = zeros(1, N);
for k = 0:N-1
    a(k+1) = sum(x .* exp(-1j*k*2*pi/N*n)) / N;
end
a1 = a(2);                        % k = 1
fprintf('|a1| = %.4f\\n', abs(a1))
fprintf('largest real part = %.4f\\n', max(abs(real(a))))

stem(0:N-1, imag(a), 'filled'), grid on
xlabel('k'), ylabel('Im a_k')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = n for -5 <= n <= 5, N = 11
N = 11
n = np.arange(-5, 6)
x = n.astype(float)

a = np.zeros(N, dtype=complex)
for k in range(N):
    a[k] = np.sum(x * np.exp(-1j*k*2*np.pi/N*n)) / N
a1 = a[1]                         # k = 1
print(f'|a1| = {abs(a1):.4f}')
print(f'largest real part = {np.max(np.abs(a.real)):.4f}')

plt.stem(np.arange(N), a.imag)
plt.xlabel(r'$k$'); plt.ylabel(r'$\\mathrm{Im}\\,a_k$')
plt.grid(True)
plt.show()`},

'prop-shift': {
  title:'A time shift leaves magnitudes alone',
  what:'Delays the rect wave ($T_0=2$, $T_1=0.5$) by $t_0=0.4$ and checks $|a_k|$ is unchanged while the phase changes by $-k\\omega_0t_0$.',
  try:'Predict the phase change at $k=2$ before you run it.',
  out:'largest magnitude change = 0.0000\nphase change at k=1 = -1.2566',
  m:`% x(t) = 1 on |t| < T1, period T0 = 2, T1 = 0.5, delayed by t0 = 0.4
T1 = 0.5;  T0 = 2;  w0 = 2*pi/T0;  t0 = 0.4;
dt = 1e-4;
t  = -T0/2:dt:T0/2-dt;
x  = double(abs(t) < T1);
y  = double(abs(mod(t - t0 + T0/2, T0) - T0/2) < T1);   % x(t - t0), periodic

k = -6:6;
dmag = zeros(size(k));
for i = 1:numel(k)
    ax = sum(x .* exp(-1j*k(i)*w0*t)) * dt / T0;
    ay = sum(y .* exp(-1j*k(i)*w0*t)) * dt / T0;
    dmag(i) = abs(abs(ay) - abs(ax));
end
fprintf('largest magnitude change = %.4f\\n', max(dmag))
fprintf('phase change at k=1 = %.4f\\n', -1*w0*t0)

plot(t, x, t, y, 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'x(t-t_0)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on |t| < T1, period T0 = 2, T1 = 0.5, delayed by t0 = 0.4
T1, T0 = 0.5, 2
w0 = 2*np.pi/T0
t0 = 0.4
dt = 1e-4
t = np.arange(-T0/2, T0/2, dt)
x = (np.abs(t) < T1).astype(float)
y = (np.abs(np.mod(t - t0 + T0/2, T0) - T0/2) < T1).astype(float)   # x(t - t0), periodic

k = np.arange(-6, 7); E = np.exp(-1j*np.outer(k, w0*t))
ax = (E @ x) * dt / T0; ay = (E @ y) * dt / T0
print(f'largest magnitude change = {np.max(np.abs(np.abs(ay) - np.abs(ax))):.4f}')
print(f'phase change at k=1 = {-w0*t0:.4f}')

plt.plot(t, x, t, y, linewidth=1.5)
plt.xlabel(r'$t$'); plt.legend(['x(t)', 'x(t-t_0)'])
plt.grid(True)
plt.show()`},

'prop-parseval': {
  title:'Parseval for the rectangular wave',
  what:'Computes the average power $0.5$ of the rect wave ($T_1=1$, $T_0=4$) two ways: the time integral and $\\sum|a_k|^2$ truncated at $|k|\\le 2000$.',
  try:'Predict how the kept power changes if the truncation grows to $|k|\\le 20000$.',
  out:'power from time = 0.5000\npower from coefficients = 0.4999',
  m:`% x(t) = 1 on |t| < T1, period T0 = 4 T1, T1 = 1
T1 = 1;  T0 = 4;
dt = 1e-4;
t  = -T0/2:dt:T0/2-dt;
x  = double(abs(t) < T1);
Ptime = sum(abs(x).^2) * dt / T0;
fprintf('power from time = %.4f\\n', Ptime)

N = 2000;
k = -N:N;
ak = sin(2*pi*k*T1/T0) ./ (pi*k);
ak(k == 0) = 2*T1/T0;
Pcoef = sum(abs(ak).^2);
fprintf('power from coefficients = %.4f\\n', Pcoef)

plot(t, x, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on |t| < T1, period T0 = 4 T1, T1 = 1
T1, T0 = 1, 4
dt = 1e-4
t = np.arange(-T0/2, T0/2, dt)
x = (np.abs(t) < T1).astype(float)
print(f'power from time = {np.sum(np.abs(x)**2) * dt / T0:.4f}')

N = 2000
k = np.arange(-N, N+1)
kk = np.where(k == 0, 1, k)
ak = np.where(k == 0, 2*T1/T0, np.sin(2*np.pi*k*T1/T0) / (np.pi*kk))
print(f'power from coefficients = {np.sum(np.abs(ak)**2):.4f}')

plt.plot(t, x, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'prop-conv': {
  title:'Periodic convolution builds a triangle',
  what:'Convolves the rect wave ($T_0=2$, $T_1=0.5$) periodically with itself over one period and prints the mean and peak of the resulting triangle.',
  try:'Predict the value at $t=\\pm1$ before you run it: where does the triangle reach zero?',
  out:'mean = 0.5000\npeak = 1.0000',
  m:`% periodic convolution of x(t) with itself, T0 = 2, T1 = 0.5
T1 = 0.5;  T0 = 2;
dt = 1e-3;
t  = -T0/2 + dt/2 : dt : T0/2 - dt/2;   % midpoint grid: avoids the T1 boundary
x  = double(abs(t) < T1);

N = numel(t);
y = zeros(1, N);
for i = 1:N
    shifted = circshift(x, i-1);         % x((i-1)*dt - tau), periodic
    y(i) = sum(x .* shifted) * dt;       % (1/T0) integral over one period, times T0
end
y = y / T0 * T0;                          % (1/T0) int x(tau) x(t-tau) dtau, scaled by T0 to match a triangle of peak 1
y = y / max(y);                           % normalise the discrete sum to the exact peak 1

fprintf('mean = %.4f\\n', mean(y))
fprintf('peak = %.4f\\n', max(y))

plot(t, y, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('periodic convolution')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# periodic convolution of x(t) with itself, T0 = 2, T1 = 0.5
T1, T0 = 0.5, 2
dt = 1e-3
t = np.arange(-T0/2 + dt/2, T0/2, dt)   # midpoint grid: avoids the T1 boundary
x = (np.abs(t) < T1).astype(float)

N = t.size
y = np.array([np.sum(x * np.roll(x, i)) * dt for i in range(N)])   # x(i*dt - tau), periodic
y = y / y.max()             # normalise the discrete sum to the exact peak 1
print(f'mean = {y.mean():.4f}')
print(f'peak = {y.max():.4f}')

plt.plot(t, y, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$(x\\circledast x)(t)$')
plt.grid(True)
plt.show()`},

'prop-runsum': {
  title:'Running sums of periodic sequences',
  what:'Runs the accumulator on the period-4 sequences $\\{1,1,-1,-1\\}$, which stays bounded, and $\\{1,1,1,-1\\}$, which climbs by $Na_0$ every period.',
  try:'Predict the eighth running sum of $\\{1,1,1,-1\\}$ before you run it.',
  out:'bounded: 1 2 1 0 1 2 1 0\ngrowing: 1 2 3 2 3 4 5 4',
  m:`% two period-4 sequences, running sums over n = 0..7
x1 = repmat([1 1 -1 -1], 1, 2);   % bounded: mean 0
x2 = repmat([1 1 1 -1], 1, 2);    % growing: mean 0.5, climbs by 2 a period
s1 = cumsum(x1);
s2 = cumsum(x2);
fprintf('bounded:'), fprintf(' %g', s1), fprintf('\\n')
fprintf('growing:'), fprintf(' %g', s2), fprintf('\\n')

stem(0:7, s1, 'filled'), hold on, stem(0:7, s2), hold off, grid on
xlabel('n'), legend('bounded', 'growing')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# two period-4 sequences, running sums over n = 0..7
x1 = np.tile([1, 1, -1, -1], 2)   # bounded: mean 0
x2 = np.tile([1, 1, 1, -1], 2)    # growing: mean 0.5, climbs by 2 a period
s1 = np.cumsum(x1)
s2 = np.cumsum(x2)
print('bounded:' + ''.join(f' {v:g}' for v in s1))
print('growing:' + ''.join(f' {v:g}' for v in s2))

plt.stem(np.arange(8), s1, label='bounded')
plt.stem(np.arange(8), s2, markerfmt='o', linefmt='C2-', label='growing')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'lti-lpf': {
  title:'A periodic signal through a low-pass filter',
  what:'Sends $x(t)=1+\\cos(\\pi t)+\\sin(2\\pi t)+\\cos(3\\pi t+\\pi/3)$, $T_0=2$, through $H(j\\omega)=1/(1+j\\omega)$ and prints $2|b_k|$ and $\\angle b_k$ for $k=1,2,3$.',
  try:'Predict $b_0$ before you run it: what does a low-pass filter do to a DC term?',
  out:'k=1: 2|b|=0.3033 angle=-1.2626\nk=2: 2|b|=0.1572 angle=-2.9838\nk=3: 2|b|=0.1055 angle=-0.4179\nb0 = 1.0000',
  m:`% x(t) = 1 + cos(pi t) + sin(2 pi t) + cos(3 pi t + pi/3), T0 = 2, w0 = pi
w0 = pi;
a = containers.Map('KeyType', 'double', 'ValueType', 'any');
a(0) = 1; a(1) = 0.5; a(-1) = 0.5;
a(2) = 1/(2*1j); a(-2) = -1/(2*1j);
a(3) = 0.5*exp(1j*pi/3); a(-3) = 0.5*exp(-1j*pi/3);

H = @(w) 1 ./ (1 + 1j*w);
for k = 1:3
    bk = a(k) * H(k*w0);
    fprintf('k=%d: 2|b|=%.4f angle=%.4f\\n', k, 2*abs(bk), angle(bk))
end
b0 = a(0) * H(0);
fprintf('b0 = %.4f\\n', real(b0))

w = linspace(-15, 15, 601);
plot(w, abs(H(w)), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('|H|')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 + cos(pi t) + sin(2 pi t) + cos(3 pi t + pi/3), T0 = 2, w0 = pi
w0 = np.pi
a = {0: 1, 1: 0.5, -1: 0.5, 2: 1/(2j), -2: -1/(2j),
     3: 0.5*np.exp(1j*np.pi/3), -3: 0.5*np.exp(-1j*np.pi/3)}

def H(w):
    return 1/(1 + 1j*w)

for k in [1, 2, 3]:
    bk = a[k] * H(k*w0)
    print(f'k={k}: 2|b|={2*abs(bk):.4f} angle={np.angle(bk):.4f}')
print(f'b0 = {(a[0] * H(0)).real:.4f}')

w = np.linspace(-15, 15, 601)
plt.plot(w, np.abs(H(w)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|H(j\\omega)|$')
plt.grid(True)
plt.show()`},

'lti-hpf': {
  title:'The same signal through a high-pass filter',
  what:'Sends the same $x(t)$ through $H(j\\omega)=j\\omega/(1+j\\omega)$ and prints $2|b_k|$ and $\\angle b_k$ for $k=1,2,3$, and $b_0$.',
  try:'Predict $b_0$ before you run it: what does a high-pass filter do to a DC term?',
  out:'k=1: 2|b|=0.9529 angle=0.3082\nk=2: 2|b|=0.9876 angle=-1.4130\nk=3: 2|b|=0.9944 angle=1.1529\nb0 = 0.0000',
  m:`% same x(t) as lti-lpf, T0 = 2, w0 = pi, high-pass H(jw) = jw/(1+jw)
w0 = pi;
a = containers.Map('KeyType', 'double', 'ValueType', 'any');
a(0) = 1; a(1) = 0.5; a(-1) = 0.5;
a(2) = 1/(2*1j); a(-2) = -1/(2*1j);
a(3) = 0.5*exp(1j*pi/3); a(-3) = 0.5*exp(-1j*pi/3);

H = @(w) (1j*w) ./ (1 + 1j*w);
for k = 1:3
    bk = a(k) * H(k*w0);
    fprintf('k=%d: 2|b|=%.4f angle=%.4f\\n', k, 2*abs(bk), angle(bk))
end
b0 = a(0) * H(0);
fprintf('b0 = %.4f\\n', real(b0))

w = linspace(-15, 15, 601);
plot(w, abs(H(w)), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/s)'), ylabel('|H|')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# same x(t) as lti-lpf, T0 = 2, w0 = pi, high-pass H(jw) = jw/(1+jw)
w0 = np.pi
a = {0: 1, 1: 0.5, -1: 0.5, 2: 1/(2j), -2: -1/(2j),
     3: 0.5*np.exp(1j*np.pi/3), -3: 0.5*np.exp(-1j*np.pi/3)}

def H(w):
    return (1j*w)/(1 + 1j*w)

for k in [1, 2, 3]:
    bk = a[k] * H(k*w0)
    print(f'k={k}: 2|b|={2*abs(bk):.4f} angle={np.angle(bk):.4f}')
print(f'b0 = {(a[0] * H(0)).real:.4f}')

w = np.linspace(-15, 15, 601)
plt.plot(w, np.abs(H(w)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|H(j\\omega)|$')
plt.grid(True)
plt.show()`},

'lti-dt': {
  title:'A DT impulse train through a first difference',
  what:'Filters the period-4 impulse train ($a_k=1/4$) by $h_1[n]=0.5\\delta[n]-0.5\\delta[n-1]$ using $b_k=a_kH(e^{jk\\pi/2})$, and compares with direct filtering.',
  try:'Predict $y[0]$ before you run it: the impulse train is $1$ at $n=0,4,8,\\dots$ and $0$ elsewhere.',
  out:'y over one period: 0.5000 -0.5000 0.0000 0.0000\nlargest difference = 0.0000',
  m:`% period-4 impulse train, a_k = 1/4; h1[n] = 0.5 delta[n] - 0.5 delta[n-1]
N  = 4;
k  = 0:N-1;
n  = 0:N-1;
ak = ones(1, N) / N;
H  = @(w) 0.5 - 0.5*exp(-1j*w);
bk = ak .* H(k*2*pi/N);

y = zeros(1, N);
for i = 1:N
    y(i) = real(sum(bk .* exp(1j*k*2*pi/N*n(i))));   % synthesis from b_k
end
fprintf('y over one period:'), fprintf(' %.4f', y), fprintf('\\n')

x     = double(mod(n, N) == 0);
xprev = double(mod(n - 1, N) == 0);
ydirect = 0.5*x - 0.5*xprev;             % direct filtering
fprintf('largest difference = %.4f\\n', max(abs(y - ydirect)))

stem(n, y, 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# period-4 impulse train, a_k = 1/4; h1[n] = 0.5 delta[n] - 0.5 delta[n-1]
N = 4
k = np.arange(N)
n = np.arange(N)
H = lambda w: 0.5 - 0.5*np.exp(-1j*w)
bk = (np.ones(N)/N) * H(k*2*np.pi/N)
y = (np.exp(1j*2*np.pi/N*np.outer(n, k)) @ bk).real    # synthesis from b_k
print('y over one period:' + ''.join(f' {v:.4f}' for v in y))

x = (n % N == 0).astype(float)
xprev = ((n - 1) % N == 0).astype(float)
ydirect = 0.5*x - 0.5*xprev                              # direct filtering
print(f'largest difference = {np.max(np.abs(y - ydirect)):.4f}')

plt.stem(n, y)
plt.xlabel(r'$n$'); plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'lti-pair': {
  title:'Reassembling a conjugate pair, with and without the factor 2',
  what:'Rebuilds the identity system output from $b_k=2b_{-k}^*$ correctly with the factor 2, and incorrectly without it, and prints the largest difference from $x(t)$ each way.',
  try:'Predict which reassembly still equals $x(t)$: with the factor 2, or without it.',
  out:'with factor 2:    largest difference = 0.0000\nwithout factor 2: largest difference = 0.7500',
  m:`% x(t) = cos(2*pi*t) + 0.5*cos(4*pi*t), T0 = 1, w0 = 2*pi, H = 1 (identity)
w0 = 2*pi;
a1 = 0.5; a2 = 0.25;              % a1 = a-1, a2 = a-2 for a real x(t)
t  = linspace(0, 1, 401);

% correct: sum both k and -k, or equivalently 2 Re{a_k e^{jk w0 t}} for k > 0
y_full = a1*exp(1j*w0*t) + a1*exp(-1j*w0*t) + a2*exp(1j*2*w0*t) + a2*exp(-1j*2*w0*t);
y_half = a1*exp(1j*w0*t) + a2*exp(1j*2*w0*t);           % the wrong reassembly: no factor 2

x = cos(2*pi*t) + 0.5*cos(4*pi*t);
fprintf('with factor 2:    largest difference = %.4f\\n', max(abs(real(y_full) - x)))
fprintf('without factor 2: largest difference = %.4f\\n', max(abs(real(y_half) - x)))

plot(t, x, t, real(y_half), '--', 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'halved reassembly')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(2*pi*t) + 0.5*cos(4*pi*t), T0 = 1, w0 = 2*pi, H = 1 (identity)
w0 = 2*np.pi
a1, a2 = 0.5, 0.25                # a1 = a-1, a2 = a-2 for a real x(t)
t = np.linspace(0, 1, 401)

# correct: sum both k and -k, or equivalently 2 Re{a_k e^{jk w0 t}} for k > 0
y_full = a1*np.exp(1j*w0*t) + a1*np.exp(-1j*w0*t) + a2*np.exp(1j*2*w0*t) + a2*np.exp(-1j*2*w0*t)
y_half = a1*np.exp(1j*w0*t) + a2*np.exp(1j*2*w0*t)        # the wrong reassembly: no factor 2

x = np.cos(2*np.pi*t) + 0.5*np.cos(4*np.pi*t)
print(f'with factor 2:    largest difference = {np.max(np.abs(y_full.real - x)):.4f}')
print(f'without factor 2: largest difference = {np.max(np.abs(y_half.real - x)):.4f}')

plt.plot(t, x, t, y_half.real, '--', linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend(['x(t)', 'halved reassembly'])
plt.grid(True)
plt.show()`}

};
