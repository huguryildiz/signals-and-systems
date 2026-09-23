/* ==========================================================================
   Code for Module 1: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program draws a signal
   from the section and prints the number the section computes, with the same
   wording in both languages, so `out` is one text for both. MATLAB uses no
   toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M1`) that
   pages through its programs; a figure may open one with `code:'<key>'`.
   verify/code_check.py runs every entry in both languages and compares what
   it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M1 = {
  'm1-code-energy':   ['energy-pulse', 'power-cos', 'power-const-dt'],
  'm1-code-ops':      ['ops-shift', 'ops-dt', 'ops-scale', 'ops-combined'],
  'm1-code-periodic': ['periodic-sum', 'evenodd-parts', 'evenodd-dt'],
  'm1-code-impulse':  ['impulse-diff-sum', 'impulse-dt-sift', 'impulse-ct-sift'],
  'm1-code-cexp':     ['cexp-ct-period', 'cexp-envelope', 'cexp-dt-period', 'cexp-dt-aperiodic']
};

const CODE_M1 = {

'power-cos': {
  title:'Average power of $\\cos(2t)$',
  what:'Computes the energy $E_T$ of $x(t)=\\cos(2t)$ in the window $[-T,T]$ and the average power $E_T/2T$ for longer and longer windows.',
  try:'Make it $3\\cos(2t)$. Predict the average power for large $T$ before you run it.',
  out:'T =    1   E_T =   0.81   P_T = 0.405\nT =   10   E_T =  10.19   P_T = 0.509\nT =  100   E_T =  99.79   P_T = 0.499',
  m:`% x(t) = cos(2t): the energy in [-T, T] grows, the average power settles
dt = 1e-4;
for T = [1 10 100]
    t  = -T:dt:T;
    ET = sum(abs(cos(2*t)).^2) * dt;
    fprintf('T = %4g   E_T = %6.2f   P_T = %.3f\\n', T, ET, ET/(2*T))
end

t = -5:dt:5;
plot(t, cos(2*t), 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(2t): the energy in [-T, T] grows, the average power settles
dt = 1e-4
for T in [1, 10, 100]:
    t = np.arange(-T, T + dt/2, dt)
    ET = np.sum(np.abs(np.cos(2*t))**2) * dt
    print(f'T = {T:4g}   E_T = {ET:6.2f}   P_T = {ET/(2*T):.3f}')

t = np.arange(-5, 5 + dt/2, dt)
plt.plot(t, np.cos(2*t), linewidth=1.5)
plt.xlabel(r'$t$')
plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'power-const-dt': {
  title:'A constant sequence',
  what:'Takes $x[n]=4$ for every $n$ and computes the energy $E_N$ in $-N\\le n\\le N$ and the average power $E_N/(2N+1)$.',
  try:'Use $x[n]=(1/2)^n$ for $n\\ge 0$ and $0$ otherwise. Predict what happens to $E_N$ and to the power as $N$ grows.',
  out:'N =   10   E_N =    336   P_N = 16.00\nN =  100   E_N =   3216   P_N = 16.00\nN = 1000   E_N =  32016   P_N = 16.00',
  m:`% x[n] = 4 for every n
for N = [10 100 1000]
    n  = -N:N;
    x  = 4 * ones(size(n));
    EN = sum(abs(x).^2);
    fprintf('N = %4d   E_N = %6d   P_N = %.2f\\n', N, EN, EN/(2*N + 1))
end

n = -10:10;
stem(n, 4*ones(size(n)), 'filled'), grid on
xlabel('n'), ylabel('x[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 4 for every n
for N in [10, 100, 1000]:
    n = np.arange(-N, N + 1)
    x = 4 * np.ones(n.size)
    EN = np.sum(np.abs(x)**2)
    print(f'N = {N:4d}   E_N = {EN:6.0f}   P_N = {EN/(2*N + 1):.2f}')

n = np.arange(-10, 11)
plt.stem(n, 4*np.ones(n.size))
plt.xlabel(r'$n$')
plt.ylabel(r'$x[n]$')
plt.grid(True)
plt.show()`},

'periodic-sum': {
  title:'The period of a sum',
  what:'Adds two cosines with periods 3 and 4, then tries $T=0.5,1,1.5,\\dots$ and keeps the first $T$ with $x(t+T)=x(t)$ for every $t$.',
  try:'Change the second period from 4 to 5. Predict $T_0$ before you run it.',
  out:'T0 = 12',
  m:`% x(t) = cos(2*pi*t/3) + cos(2*pi*t/4): periods 3 and 4
x = @(t) cos(2*pi*t/3) + cos(2*pi*t/4);
t = linspace(0, 24, 2401);

% the first candidate T that repeats x at every t
for T = 0.5:0.5:24
    if max(abs(x(t + T) - x(t))) < 1e-9, break, end
end
fprintf('T0 = %g\\n', T)

plot(t, x(t), 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(2*pi*t/3) + cos(2*pi*t/4): periods 3 and 4
def x(t):
    return np.cos(2*np.pi*t/3) + np.cos(2*np.pi*t/4)

t = np.linspace(0, 24, 2401)

# the first candidate T that repeats x at every t
T0 = next(T for T in np.arange(0.5, 24.5, 0.5)
          if np.max(np.abs(x(t + T) - x(t))) < 1e-9)
print(f'T0 = {T0:g}')

plt.plot(t, x(t), linewidth=1.5)
plt.xlabel(r'$t$')
plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'evenodd-parts': {
  title:'Even and odd parts of a pulse',
  what:'Builds $\\Ev\\{x(t)\\}$ and $\\Od\\{x(t)\\}$ for the unit pulse on $0<t<1$ and checks that they add back to $x(t)$.',
  try:'Move the pulse to $1<t<2$. Predict the even part at $t=1.5$ and at $t=-1.5$.',
  out:'Ev at t = 0.5: 0.50   Od at t = -0.5: -0.50\nlargest |Ev + Od - x| = 0',
  m:`% x(t) = 1 on 0 < t < 1, and 0 elsewhere
x  = @(t) double(t > 0 & t < 1);
Ev = @(t) (x(t) + x(-t)) / 2;     % even part
Od = @(t) (x(t) - x(-t)) / 2;     % odd part

fprintf('Ev at t = 0.5: %.2f   Od at t = -0.5: %.2f\\n', Ev(0.5), Od(-0.5))
t = linspace(-2, 2, 4001);
fprintf('largest |Ev + Od - x| = %g\\n', max(abs(Ev(t) + Od(t) - x(t))))

subplot(3,1,1), plot(t, x(t)),  ylabel('x(t)')
subplot(3,1,2), plot(t, Ev(t)), ylabel('Ev')
subplot(3,1,3), plot(t, Od(t)), ylabel('Od'), xlabel('t')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 0 < t < 1, and 0 elsewhere
def x(t):
    return ((t > 0) & (t < 1)).astype(float)

def Ev(t): return (x(t) + x(-t)) / 2    # even part
def Od(t): return (x(t) - x(-t)) / 2    # odd part

print(f'Ev at t = 0.5: {Ev(np.array(0.5)):.2f}   Od at t = -0.5: {Od(np.array(-0.5)):.2f}')
t = np.linspace(-2, 2, 4001)
print(f'largest |Ev + Od - x| = {np.max(np.abs(Ev(t) + Od(t) - x(t))):g}')

fig, ax = plt.subplots(3, 1, sharex=True)
ax[0].plot(t, x(t));  ax[0].set_ylabel(r'$x(t)$')
ax[1].plot(t, Ev(t)); ax[1].set_ylabel(r'$\\mathcal{E}v$')
ax[2].plot(t, Od(t)); ax[2].set_ylabel(r'$\\mathcal{O}dd$')
ax[2].set_xlabel(r'$t$')
plt.show()`},

'evenodd-dt': {
  title:'Even and odd parts of a sequence',
  what:'Takes $x[0]=1$, $x[1]=2$, $x[2]=3$ and lists the even and odd parts for $-2\\le n\\le 2$.',
  try:'Change $x[0]$ to $5$. Predict which entries of each part change, and what the odd part is at $n=0$.',
  out:'n  = -2 -1 0 1 2\nEv = 1.5 1 1 1 1.5\nOd = -1.5 -1 0 1 1.5',
  m:`% x[n] = 1, 2, 3 at n = 0, 1, 2, and 0 elsewhere
x  = @(n) (n == 0)*1 + (n == 1)*2 + (n == 2)*3;
n  = -2:2;
xe = (x(n) + x(-n)) / 2;           % even part
xo = (x(n) - x(-n)) / 2;           % odd part

fprintf('n  =%s\\n', sprintf(' %g', n))
fprintf('Ev =%s\\n', sprintf(' %g', xe))
fprintf('Od =%s\\n', sprintf(' %g', xo))

subplot(2,1,1), stem(n, xe, 'filled'), ylabel('Ev')
subplot(2,1,2), stem(n, xo, 'filled'), ylabel('Od'), xlabel('n')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 1, 2, 3 at n = 0, 1, 2, and 0 elsewhere
def x(n):
    return (n == 0)*1 + (n == 1)*2 + (n == 2)*3

n = np.arange(-2, 3)
xe = (x(n) + x(-n)) / 2            # even part
xo = (x(n) - x(-n)) / 2            # odd part

print('n  =', *n)
print('Ev =', *[f'{v:g}' for v in xe])
print('Od =', *[f'{v:g}' for v in xo])

fig, ax = plt.subplots(2, 1, sharex=True)
ax[0].stem(n, xe); ax[0].set_ylabel(r'$\\mathcal{E}v$')
ax[1].stem(n, xo); ax[1].set_ylabel(r'$\\mathcal{O}dd$')
ax[1].set_xlabel(r'$n$')
plt.show()`},

'impulse-diff-sum': {
  title:'Running sum and first difference',
  what:'Builds $\\delta[n]$, takes its running sum to get $u[n]$, then takes the first difference of $u[n]$ to get $\\delta[n]$ back.',
  try:'Take the running sum of $u[n]$ instead. Predict its value at $n=3$.',
  out:'n             = -5 -4 -3 -2 -1 0 1 2 3 4 5\nu[n]          = 0 0 0 0 0 1 1 1 1 1 1\nu[n] - u[n-1] = 0 0 0 0 0 1 0 0 0 0 0',
  m:`n = -5:5;
d = double(n == 0);          % delta[n]
u = cumsum(d);               % running sum: u[n]
du = u - [0, u(1:end-1)];    % first difference: u[n] - u[n-1]

fprintf('n             =%s\\n', sprintf(' %g', n))
fprintf('u[n]          =%s\\n', sprintf(' %g', u))
fprintf('u[n] - u[n-1] =%s\\n', sprintf(' %g', du))

subplot(2,1,1), stem(n, u, 'filled'), ylabel('u[n]')
subplot(2,1,2), stem(n, du, 'filled'), ylabel('u[n] - u[n-1]'), xlabel('n')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

n = np.arange(-5, 6)
d = (n == 0).astype(int)     # delta[n]
u = np.cumsum(d)             # running sum: u[n]
du = u - np.r_[0, u[:-1]]    # first difference: u[n] - u[n-1]

print('n             =', *n)
print('u[n]          =', *u)
print('u[n] - u[n-1] =', *du)

fig, ax = plt.subplots(2, 1, sharex=True)
ax[0].stem(n, u);  ax[0].set_ylabel(r'$u[n]$')
ax[1].stem(n, du); ax[1].set_ylabel(r'$u[n]-u[n-1]$')
ax[1].set_xlabel(r'$n$')
plt.show()`},

'impulse-dt-sift': {
  title:'Sifting in discrete time',
  what:'Multiplies $x[n]$ by $\\delta[n-2]$, which keeps one sample, and sums the product to get $x[2]$.',
  try:'Set $n_0=1$. Predict the product sequence and the sum before you run it.',
  out:'x[n] delta[n-2] = 0 0 0 3 0 0 0\nsum = 3',
  m:`% x[n] = 1, 2, 3 at n = 0, 1, 2, and 0 elsewhere
n  = -1:5;
x  = (n == 0)*1 + (n == 1)*2 + (n == 2)*3;
n0 = 2;
d  = double(n == n0);        % delta[n - n0]

p = x .* d;                  % the product keeps x[n0] only
fprintf('x[n] delta[n-%d] =%s\\n', n0, sprintf(' %g', p))
fprintf('sum = %g\\n', sum(p))

stem(n, p, 'filled'), grid on
xlabel('n'), ylabel('x[n] \\delta[n-2]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 1, 2, 3 at n = 0, 1, 2, and 0 elsewhere
n = np.arange(-1, 6)
x = (n == 0)*1 + (n == 1)*2 + (n == 2)*3
n0 = 2
d = (n == n0).astype(int)    # delta[n - n0]

p = x * d                    # the product keeps x[n0] only
print(f'x[n] delta[n-{n0}] =', *p)
print('sum =', p.sum())

plt.stem(n, p)
plt.xlabel(r'$n$')
plt.ylabel(r'$x[n]\\,\\delta[n-2]$')
plt.grid(True)
plt.show()`},

'impulse-ct-sift': {
  title:'Sifting with a narrowing pulse',
  what:'Replaces $\\delta(t-t_0)$ by a pulse of width $\\varepsilon$ and height $1/\\varepsilon$ centred on $t_0=1$, and integrates $x(t)=\\cos t$ against it as $\\varepsilon$ shrinks.',
  try:'Move the pulse to $t_0=0$. Predict the value the integrals approach.',
  out:'eps = 0.50   integral = 0.535\neps = 0.10   integral = 0.540\neps = 0.01   integral = 0.540\nx(t0) = 0.540',
  m:`% x(t) = cos(t); the pulse has width eps, height 1/eps, centre t0
dt = 1e-5;
t  = -2:dt:4;
t0 = 1;
for e = [0.5 0.1 0.01]
    d = double(abs(t - t0) < e/2);
    d = d / (sum(d) * dt);              % height about 1/eps, area exactly 1
    I = sum(cos(t) .* d) * dt;
    fprintf('eps = %.2f   integral = %.3f\\n', e, I)
end
fprintf('x(t0) = %.3f\\n', cos(t0))

plot(t, cos(t), t, (abs(t - t0) < 0.25)/0.5, 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'pulse, eps = 0.5')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = cos(t); the pulse has width eps, height 1/eps, centre t0
dt = 1e-5
t = np.arange(-2, 4 + dt/2, dt)
t0 = 1
for e in [0.5, 0.1, 0.01]:
    d = (np.abs(t - t0) < e/2).astype(float)
    d = d / (np.sum(d) * dt)            # height about 1/eps, area exactly 1
    I = np.sum(np.cos(t) * d) * dt
    print(f'eps = {e:.2f}   integral = {I:.3f}')
print(f'x(t0) = {np.cos(t0):.3f}')

plt.plot(t, np.cos(t), t, (np.abs(t - t0) < 0.25)/0.5, linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$x(t)$', r'pulse, $\\varepsilon=0.5$'])
plt.grid(True)
plt.show()`},

'cexp-ct-period': {
  title:'The period of $e^{j0.5\\pi t}$',
  what:'Plots the real and imaginary parts of $x(t)=e^{j0.5\\pi t}$, computes $T_0=2\\pi/\\omega_0$ and checks that $x(t+T_0)=x(t)$.',
  try:'Set $\\omega_0=3\\pi$. Predict $T_0$ before you run it.',
  out:'T0 = 4\nlargest |x(t + T0) - x(t)| = 0.000',
  m:`% x(t) = exp(j*w0*t) with w0 = 0.5*pi rad/s
w0 = 0.5*pi;
x  = @(t) exp(1j*w0*t);
T0 = 2*pi / w0;
fprintf('T0 = %g\\n', T0)

t = linspace(0, 12, 1201);
fprintf('largest |x(t + T0) - x(t)| = %.3f\\n', max(abs(x(t + T0) - x(t))))

plot(t, real(x(t)), t, imag(x(t)), 'LineWidth', 1.5), grid on
xlabel('t'), legend('Re x(t)', 'Im x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = exp(j*w0*t) with w0 = 0.5*pi rad/s
w0 = 0.5*np.pi
def x(t):
    return np.exp(1j*w0*t)

T0 = 2*np.pi / w0
print(f'T0 = {T0:g}')

t = np.linspace(0, 12, 1201)
print(f'largest |x(t + T0) - x(t)| = {np.max(np.abs(x(t + T0) - x(t))):.3f}')

plt.plot(t, x(t).real, t, x(t).imag, linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$\\mathrm{Re}\\,x(t)$', r'$\\mathrm{Im}\\,x(t)$'])
plt.grid(True)
plt.show()`},

'cexp-envelope': {
  title:'A decaying sinusoid and its envelope',
  what:'Draws $\\operatorname{Re}\\{x(t)\\}=Ae^{rt}\\cos(\\omega_0t)$ with $A=2$, $r=-0.5$, $\\omega_0=2\\pi$, inside the envelope $\\pm Ae^{rt}$.',
  try:'Set $r=0.25$. Predict the envelope value at $t=2$, then run it.',
  out:'envelope at t = 2: 0.736\ninside the envelope: yes',
  m:`% x(t) = A exp((r + j*w0) t), with A = 2, r = -0.5, w0 = 2*pi
A = 2;  r = -0.5;  w0 = 2*pi;
t   = linspace(0, 5, 2001);
x   = A * exp((r + 1j*w0) * t);
env = A * exp(r*t);

fprintf('envelope at t = 2: %.3f\\n', A*exp(2*r))
inside = all(abs(real(x)) <= env + 1e-12);
fprintf('inside the envelope: %s\\n', string(inside).replace('true','yes').replace('false','no'))

plot(t, real(x), t, env, '--', t, -env, '--', 'LineWidth', 1.5), grid on
xlabel('t'), legend('Re x(t)', '+A e^{rt}', '-A e^{rt}')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = A exp((r + j*w0) t), with A = 2, r = -0.5, w0 = 2*pi
A, r, w0 = 2, -0.5, 2*np.pi
t = np.linspace(0, 5, 2001)
x = A * np.exp((r + 1j*w0) * t)
env = A * np.exp(r*t)

print(f'envelope at t = 2: {A*np.exp(2*r):.3f}')
inside = np.all(np.abs(x.real) <= env + 1e-12)
print('inside the envelope:', 'yes' if inside else 'no')

plt.plot(t, x.real, t, env, '--', t, -env, '--', linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$\\mathrm{Re}\\,x(t)$', r'$+Ae^{rt}$', r'$-Ae^{rt}$'])
plt.grid(True)
plt.show()`},

'cexp-dt-aperiodic': {
  title:'A sequence that never repeats',
  what:'Searches $N=1,\\dots,1000$ for a period of $x[n]=\\cos(n)$. Here $\\omega_0/2\\pi=1/(2\\pi)$ is irrational, so no $N$ works.',
  try:'Change $\\cos(n)$ to $\\cos(\\pi n/4)$. Predict $N_0$ before you run it.',
  out:'no period up to N = 1000',
  m:`% x[n] = cos(w0*n) with w0 = 1 rad/sample
w0 = 1;
n  = 0:200;
x  = @(n) cos(w0*n);

N0 = 0;
for N = 1:1000
    if max(abs(x(n + N) - x(n))) < 1e-9, N0 = N; break, end
end
if N0 > 0, fprintf('N0 = %d\\n', N0)
else,      fprintf('no period up to N = 1000\\n')
end

stem(0:40, x(0:40), 'filled'), grid on
xlabel('n'), ylabel('x[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = cos(w0*n) with w0 = 1 rad/sample
w0 = 1
n = np.arange(0, 201)
def x(n):
    return np.cos(w0*n)

N0 = next((N for N in range(1, 1001)
           if np.max(np.abs(x(n + N) - x(n))) < 1e-9), 0)
print(f'N0 = {N0}' if N0 else 'no period up to N = 1000')

m = np.arange(0, 41)
plt.stem(m, x(m))
plt.xlabel(r'$n$')
plt.ylabel(r'$x[n]$')
plt.grid(True)
plt.show()`},

'ops-shift': {
  title:'Shifting a triangle',
  what:'Draws the triangle $x(t)$ and the shifted copy $x(t-t_0)$, then finds where the peak of the copy lies.',
  try:'Set $t_0=-2$. Predict where the peak moves, then run it.',
  out:'the peak of x(t - 3) is at t = 3.00',
  m:`% x(t): a triangle of height 1 on -1 <= t <= 1
x = @(t) max(1 - abs(t), 0);

t  = linspace(-5, 5, 1001);
t0 = 3;                          % delay by t0 seconds
y  = x(t - t0);

[~, k] = max(y);
fprintf('the peak of x(t - %g) is at t = %.2f\\n', t0, t(k))

plot(t, x(t), t, y, 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'x(t - t_0)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t): a triangle of height 1 on -1 <= t <= 1
def x(t):
    return np.maximum(1 - np.abs(t), 0)

t = np.linspace(-5, 5, 1001)
t0 = 3                           # delay by t0 seconds
y = x(t - t0)

k = np.argmax(y)
print(f'the peak of x(t - {t0:g}) is at t = {t[k]:.2f}')

plt.plot(t, x(t), t, y, linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$x(t)$', r'$x(t-t_0)$'])
plt.grid(True)
plt.show()`},

'ops-dt': {
  title:'Shift and reversal in discrete time',
  what:'Builds $x[n]=1-n/4$ for $n=0,\\dots,3$, then lists where $x[n-2]$ and $x[-n]$ are nonzero.',
  try:'Change the shift to $x[n+1]$. Predict its nonzero samples first.',
  out:'x[n-2] is nonzero for n = 2 3 4 5\nx[-n]  is nonzero for n = -3 -2 -1 0',
  m:`% x[n] = 1 - n/4 for n = 0, 1, 2, 3, and 0 elsewhere
x = @(n) (1 - n/4) .* (n >= 0 & n <= 3);

n  = -7:7;
n0 = 2;
y  = x(n - n0);                  % shift right by n0
r  = x(-n);                      % reverse

fprintf('x[n-%d] is nonzero for n =%s\\n', n0, sprintf(' %d', n(y ~= 0)))
fprintf('x[-n]  is nonzero for n =%s\\n', sprintf(' %d', n(r ~= 0)))

subplot(3,1,1), stem(n, x(n), 'filled'), ylabel('x[n]')
subplot(3,1,2), stem(n, y, 'filled'), ylabel('x[n-2]')
subplot(3,1,3), stem(n, r, 'filled'), ylabel('x[-n]'), xlabel('n')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 1 - n/4 for n = 0, 1, 2, 3, and 0 elsewhere
def x(n):
    return (1 - n/4) * ((n >= 0) & (n <= 3))

n = np.arange(-7, 8)
n0 = 2
y = x(n - n0)                    # shift right by n0
r = x(-n)                        # reverse

print(f'x[n-{n0}] is nonzero for n =', *n[y != 0])
print('x[-n]  is nonzero for n =', *n[r != 0])

fig, ax = plt.subplots(3, 1, sharex=True)
ax[0].stem(n, x(n)); ax[0].set_ylabel(r'$x[n]$')
ax[1].stem(n, y);    ax[1].set_ylabel(r'$x[n-2]$')
ax[2].stem(n, r);    ax[2].set_ylabel(r'$x[-n]$')
ax[2].set_xlabel(r'$n$')
plt.show()`},

'ops-scale': {
  title:'Compressing a pulse',
  what:'Draws the pulse on $1\\le t\\le 3$ and $x(at)$, and prints the interval where $x(at)$ is nonzero.',
  try:'Set $a=0.5$. Predict the new interval and its width, then run it.',
  out:'x(2t) is nonzero for 0.50 <= t <= 1.50, width 1.00',
  m:`% x(t) = 1 on 1 <= t <= 3, and 0 elsewhere
x = @(t) double(t >= 1 & t <= 3);

a = 2;                           % a > 1 compresses, a < 1 stretches
t = linspace(-1, 7, 1601);

% x(at) is 1 where 1 <= a*t <= 3, that is 1/a <= t <= 3/a
lo = 1/a;  hi = 3/a;
fprintf('x(%gt) is nonzero for %.2f <= t <= %.2f, width %.2f\\n', a, lo, hi, hi - lo)

plot(t, x(t), t, x(a*t), 'LineWidth', 1.5), grid on
ylim([-0.2 1.4]), xlabel('t'), legend('x(t)', 'x(at)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 1 <= t <= 3, and 0 elsewhere
def x(t):
    return ((t >= 1) & (t <= 3)).astype(float)

a = 2                            # a > 1 compresses, a < 1 stretches
t = np.linspace(-1, 7, 1601)

# x(at) is 1 where 1 <= a*t <= 3, that is 1/a <= t <= 3/a
lo, hi = 1/a, 3/a
print(f'x({a:g}t) is nonzero for {lo:.2f} <= t <= {hi:.2f}, width {hi - lo:.2f}')

plt.plot(t, x(t), t, x(a*t), linewidth=1.5)
plt.ylim(-0.2, 1.4)
plt.xlabel(r'$t$')
plt.legend([r'$x(t)$', r'$x(at)$'])
plt.grid(True)
plt.show()`},

'energy-pulse': {
  title:'Energy and power of a pulse',
  what:'Computes the total energy of $x(t)=1$ on $0\\le t\\le 1$ as a sum, and the average power over longer and longer windows.',
  try:'Make the pulse twice as tall. Predict $E_\\infty$ before you run it.',
  out:'E = 1.000\nP = 0.0500  0.0050  0.0005',
  m:`% x(t) = 1 on 0 <= t <= 1, and 0 elsewhere
dt = 1e-4;
t  = -2:dt:3;
x  = double(t >= 0 & t <= 1);

% Total energy: the integral of |x(t)|^2, as a sum
E = sum(abs(x).^2) * dt;
fprintf('E = %.3f\\n', E)

% Average power over [-T, T]: x is zero outside [0, 1],
% so the integral is E for every T >= 1
T = [10 100 1000];
P = E ./ (2*T);
fprintf('P = %.4f  %.4f  %.4f\\n', P)

plot(t, x, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('x(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 0 <= t <= 1, and 0 elsewhere
dt = 1e-4
t = np.arange(-2, 3 + dt, dt)
x = ((t >= 0) & (t <= 1)).astype(float)

# Total energy: the integral of |x(t)|^2, as a sum
E = np.sum(np.abs(x)**2) * dt
print(f'E = {E:.3f}')

# Average power over [-T, T]: x is zero outside [0, 1],
# so the integral is E for every T >= 1
T = np.array([10, 100, 1000])
P = E / (2*T)
print('P = ' + '  '.join(f'{p:.4f}' for p in P))

plt.plot(t, x, linewidth=1.5)
plt.xlabel(r'$t$')
plt.ylabel(r'$x(t)$')
plt.grid(True)
plt.show()`},

'ops-combined': {
  title:'Plotting $x(3t-5)$',
  what:'Draws $x(t)$ and $y(t)=x(3t-5)$, and maps each corner $c$ of $x(t)$ to the time $t=(c+5)/3$.',
  try:'Change the argument to $x(2t+1)$. Predict where the corners land, then run it.',
  out:'corners land at t = 1.0000  1.6667  2.3333  3.0000',
  m:`% x(t), the dashed signal on the slide
x = @(t) 1*(t >= -2 & t < 0) + 2*(t >= 0 & t < 2) ...
       + (4 - t).*(t >= 2 & t < 4);

t = linspace(-3, 10, 2601);
y = x(3*t - 5);            % shift right by 5, then compress by 3

% Each corner c of x(t) lands where 3t - 5 = c
c  = [-2 0 2 4];
tc = (c + 5) / 3;
fprintf('corners land at t = %.4f  %.4f  %.4f  %.4f\\n', tc)

plot(t, x(t), '--', t, y, 'LineWidth', 1.5), grid on
xlabel('t'), legend('x(t)', 'y(t) = x(3t-5)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t), the dashed signal on the slide
def x(t):
    return (1*((t >= -2) & (t < 0)) + 2*((t >= 0) & (t < 2))
            + (4 - t)*((t >= 2) & (t < 4)))

t = np.linspace(-3, 10, 2601)
y = x(3*t - 5)             # shift right by 5, then compress by 3

# Each corner c of x(t) lands where 3t - 5 = c
c = np.array([-2, 0, 2, 4])
tc = (c + 5) / 3
print('corners land at t = ' + '  '.join(f'{v:.4f}' for v in tc))

plt.plot(t, x(t), '--', t, y, linewidth=1.5)
plt.xlabel(r'$t$')
plt.legend([r'$x(t)$', r'$y(t)=x(3t-5)$'])
plt.grid(True)
plt.show()`},

'cexp-dt-period': {
  title:'The period of $e^{j3\\pi n/5}$',
  what:'Plots the real part of $x[n]=e^{j3\\pi n/5}$ and searches for the smallest $N>0$ with $x[n+N]=x[n]$.',
  try:'Set $\\omega_0=3\\pi/7$. Predict $N_0$ from $N=2\\pi k/\\omega_0$, then run it.',
  out:'N0 = 10',
  m:`% x[n] = exp(j*3*pi*n/5)
n  = -20:20;
w0 = 3*pi/5;
x  = exp(1j*w0*n);

% The smallest N > 0 with x[n+N] = x[n] for every n
for N = 1:40
    if abs(exp(1j*w0*N) - 1) < 1e-9, break, end
end
fprintf('N0 = %d\\n', N)

stem(n, real(x), 'filled'), grid on
xlabel('n'), ylabel('Re\\{x[n]\\}')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = exp(j*3*pi*n/5)
n = np.arange(-20, 21)
w0 = 3*np.pi/5
x = np.exp(1j*w0*n)

# The smallest N > 0 with x[n+N] = x[n] for every n
N0 = next(N for N in range(1, 41) if abs(np.exp(1j*w0*N) - 1) < 1e-9)
print(f'N0 = {N0}')

plt.stem(n, x.real)
plt.xlabel(r'$n$')
plt.ylabel(r'$\\mathrm{Re}\\{x[n]\\}$')
plt.grid(True)
plt.show()`}

};
