/* ==========================================================================
   Code for Module 3: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program works a signal
   or system from the section and prints the number the section computes,
   with the same wording in both languages, so `out` is one text for both.
   MATLAB uses no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M3`)
   that pages through its programs.
   verify/code_check.py runs every entry in both languages and compares
   what it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M3 = {
  'm3-code-impulse': ['imp-measure', 'imp-predict', 'imp-represent', 'imp-not-lti'],
  'm3-code-convsum': ['conv-finite', 'conv-loop', 'conv-geometric', 'conv-correlation'],
  'm3-code-convint': ['int-rect-ramp', 'int-exp-step', 'int-area', 'int-step'],
  'm3-code-props':   ['prop-commute', 'prop-parallel', 'prop-cascade', 'prop-stable', 'prop-step'],
  'm3-code-diffeq':  ['de-recursion', 'de-step', 'de-euler']
};

const CODE_M3 = {

'imp-measure': {
  title:'Measuring the impulse response',
  what:'Runs the rule $y[n]=x[n]+0.5x[n-1]+0.25x[n-2]$, at rest before $n=0$, on $x[n]=\\delta[n]$ and prints $h[n]$.',
  try:'Change the rule to $y[n]=x[n]-0.5x[n-1]$. Predict $h[1]$ before you run it.',
  out:'h[n] for n = 0..5: 1 0.5 0.25 0 0 0',
  m:`% y[n] = x[n] + 0.5 x[n-1] + 0.25 x[n-2], at rest before n = 0
n = 0:5;
x = double(n == 0);              % delta[n]
h = zeros(size(n));
for k = 1:numel(n)
    xk  = x(k);
    xk1 = 0; if k > 1, xk1 = x(k-1); end
    xk2 = 0; if k > 2, xk2 = x(k-2); end
    h(k) = xk + 0.5*xk1 + 0.25*xk2;
end
fprintf('h[n] for n = 0..5:'), fprintf(' %g', h), fprintf('\\n')

stem(n, h, 'filled'), grid on
xlabel('n'), ylabel('h[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = x[n] + 0.5 x[n-1] + 0.25 x[n-2], at rest before n = 0
n = np.arange(6)
x = (n == 0).astype(float)       # delta[n]
h = np.zeros(n.size)
for k in range(n.size):
    xk  = x[k]
    xk1 = x[k-1] if k > 0 else 0
    xk2 = x[k-2] if k > 1 else 0
    h[k] = xk + 0.5*xk1 + 0.25*xk2
print('h[n] for n = 0..5:' + ''.join(f' {v:g}' for v in h))

plt.stem(n, h)
plt.xlabel(r'$n$')
plt.ylabel(r'$h[n]$')
plt.grid(True)
plt.show()`},

'imp-predict': {
  title:'One impulse response, every input',
  what:'Predicts the response to $x[n]=2\\delta[n]+\\delta[n-1]$ as $2h[n]+h[n-1]$, then runs the same system and compares.',
  try:'Change the input to $x[n]=\\delta[n]+2\\delta[n-1]$. Predict the new prediction at $n=1$.',
  out:'predicted: 2 2 1 0.25 0 0 0 0\ntrue:      2 2 1 0.25 0 0 0 0\nlargest difference = 0',
  m:`% h[n] from imp-measure, and the prediction 2 h[n] + h[n-1]
n = 0:7;
h = zeros(size(n)); h(1) = 1; h(2) = 0.5; h(3) = 0.25;
pred = 2*h + [0, h(1:end-1)];

x = 2*double(n == 0) + double(n == 1);   % x[n] = 2 delta[n] + delta[n-1]
tru = zeros(size(n));
for k = 1:numel(n)
    xk  = x(k);
    xk1 = 0; if k > 1, xk1 = x(k-1); end
    xk2 = 0; if k > 2, xk2 = x(k-2); end
    tru(k) = xk + 0.5*xk1 + 0.25*xk2;
end
fprintf('predicted:'), fprintf(' %g', pred), fprintf('\\n')
fprintf('true:     '), fprintf(' %g', tru), fprintf('\\n')
fprintf('largest difference = %g\\n', max(abs(pred - tru)))

stem(n, pred, 'filled'), hold on, stem(n, tru), hold off, grid on
xlabel('n'), legend('predicted', 'true')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# h[n] from imp-measure, and the prediction 2 h[n] + h[n-1]
n = np.arange(8)
h = np.zeros(n.size); h[0] = 1; h[1] = 0.5; h[2] = 0.25
pred = 2*h + np.r_[0, h[:-1]]

x = 2*(n == 0).astype(float) + (n == 1).astype(float)   # 2 delta[n] + delta[n-1]
x1 = np.r_[0, x[:-1]]; x2 = np.r_[0, 0, x[:-2]]
tru = x + 0.5*x1 + 0.25*x2
print('predicted:' + ''.join(f' {v:g}' for v in pred))
print('true:     ' + ''.join(f' {v:g}' for v in tru))
print(f'largest difference = {np.max(np.abs(pred - tru)):g}')

plt.stem(n, pred, label='predicted')
plt.stem(n, tru, markerfmt='o', linefmt='C2-', label='true')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'imp-represent': {
  title:'A signal as a sum of impulses',
  what:'Writes $x[n]=\\{1,2,1,2\\}$ on $n=0,\\dots,3$ as $\\sum_k x[k]\\delta[n-k]$ and checks the sum rebuilds $x[n]$.',
  try:'Change $x[2]$ to $0$. Predict which term drops out.',
  out:'weight 1 at k = 0\nweight 2 at k = 1\nweight 1 at k = 2\nweight 2 at k = 3\nreconstruction error = 0',
  m:`% x[n] = {1, 2, 1, 2} on n = 0..3, as a sum of weighted shifted impulses
n = 0:3;
x = [1 2 1 2];

recon = zeros(size(n));
for k = 0:3
    fprintf('weight %g at k = %d\\n', x(k+1), k)
    recon = recon + x(k+1) * double(n == k);   % x[k] delta[n-k]
end
fprintf('reconstruction error = %g\\n', max(abs(recon - x)))

stem(n, x, 'filled'), hold on, stem(n, recon), hold off, grid on
xlabel('n'), legend('x[n]', 'reconstruction')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = {1, 2, 1, 2} on n = 0..3, as a sum of weighted shifted impulses
n = np.arange(4)
x = np.array([1, 2, 1, 2])

recon = np.zeros(n.size)
for k in range(4):
    print(f'weight {x[k]:g} at k = {k}')
    recon = recon + x[k] * (n == k).astype(float)   # x[k] delta[n-k]
print(f'reconstruction error = {np.max(np.abs(recon - x)):g}')

plt.stem(n, x, label=r'$x[n]$')
plt.stem(n, recon, markerfmt='o', linefmt='C2-', label='reconstruction')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'imp-not-lti': {
  title:'The squarer is not LTI',
  what:'Measures the "impulse response" of $y[n]=x^2[n]$ with $\\delta[n]$, predicts $2h[n]+h[n-1]$, and compares with the true output.',
  try:'Predict $h[n]$ for the squarer before you run it: is it the same as an LTI system with $h[0]=1$?',
  out:'h[n] = delta[n]\npredicted: 2 1 0 0 0 0 0 0\ntrue:      4 1 0 0 0 0 0 0\nlargest difference = 2',
  m:`% y[n] = x[n]^2 (the squarer): measure h with delta[n]
n = 0:7;
d = double(n == 0);
h = d.^2;                        % h[n] = delta[n]
fprintf('h[n] = delta[n]\\n')

pred = 2*h + [0, h(1:end-1)];    % predicted as if the squarer were LTI
x = 2*double(n == 0) + double(n == 1);
tru = x.^2;                      % the true output of the squarer
fprintf('predicted:'), fprintf(' %g', pred), fprintf('\\n')
fprintf('true:     '), fprintf(' %g', tru), fprintf('\\n')
fprintf('largest difference = %g\\n', max(abs(pred - tru)))

stem(n, pred, 'filled'), hold on, stem(n, tru), hold off, grid on
xlabel('n'), legend('predicted', 'true')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = x[n]^2 (the squarer): measure h with delta[n]
n = np.arange(8)
d = (n == 0).astype(float)
h = d**2                         # h[n] = delta[n]
print('h[n] = delta[n]')

pred = 2*h + np.r_[0, h[:-1]]    # predicted as if the squarer were LTI
x = 2*(n == 0).astype(float) + (n == 1).astype(float)
tru = x**2                       # the true output of the squarer
print('predicted:' + ''.join(f' {v:g}' for v in pred))
print('true:     ' + ''.join(f' {v:g}' for v in tru))
print(f'largest difference = {np.max(np.abs(pred - tru)):g}')

plt.stem(n, pred, label='predicted')
plt.stem(n, tru, markerfmt='o', linefmt='C2-', label='true')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'conv-finite': {
  title:'Convolving two short sequences',
  what:'Convolves $x[n]=\\{1,2,1,2\\}$ with $h[n]=\\{1,1\\}$ using the built-in routine and checks its length and total.',
  try:'Change $h$ to $\\{1,1,1\\}$. Predict the new length before you run it.',
  out:'y[n] for n = 0..4: 1 3 3 3 2\nlength = 5\nsum check: 12 = 6 x 2',
  m:`% y[n] = x[n] * h[n], with x = {1,2,1,2} and h = {1,1}
x = [1 2 1 2];
h = [1 1];
y = conv(x, h);

fprintf('y[n] for n = 0..4:'), fprintf(' %g', y), fprintf('\\n')
fprintf('length = %d\\n', numel(y))
fprintf('sum check: %g = %g x %g\\n', sum(y), sum(x), sum(h))

stem(0:numel(y)-1, y, 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = x[n] * h[n], with x = {1,2,1,2} and h = {1,1}
x = np.array([1, 2, 1, 2])
h = np.array([1, 1])
y = np.convolve(x, h)

print('y[n] for n = 0..4:' + ''.join(f' {v:g}' for v in y))
print(f'length = {y.size}')
print(f'sum check: {y.sum():g} = {x.sum():g} x {h.sum():g}')

plt.stem(np.arange(y.size), y)
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'conv-loop': {
  title:'Convolution as flip, shift, multiply, add',
  what:'Computes the same $y[n]=x[n]*h[n]$ with a double loop over $n$ and $k$, following the flip-shift-multiply-add steps.',
  try:'Predict which $k$ contribute to $y[2]$ before you run it, then check the loop against your list.',
  out:'y[n] for n = 0..4: 1 3 3 3 2\nlargest difference from conv = 0',
  m:`% the same convolution, written out as flip, shift, multiply, add
x = [1 2 1 2];  Nx = numel(x);
h = [1 1];      Nh = numel(h);
Ny = Nx + Nh - 1;
y = zeros(1, Ny);
for n = 0:Ny-1
    s = 0;
    for k = 0:Nx-1
        if (n - k) >= 0 && (n - k) < Nh   % h[n-k], flipped and shifted
            s = s + x(k+1) * h(n-k+1);
        end
    end
    y(n+1) = s;
end
fprintf('y[n] for n = 0..4:'), fprintf(' %g', y), fprintf('\\n')
fprintf('largest difference from conv = %g\\n', max(abs(y - conv(x, h))))

stem(0:Ny-1, y, 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the same convolution, written out as flip, shift, multiply, add
x = np.array([1, 2, 1, 2]); Nx = x.size
h = np.array([1, 1]);       Nh = h.size
Ny = Nx + Nh - 1
y = np.zeros(Ny)
for n in range(Ny):
    y[n] = sum(x[k] * h[n - k] for k in range(Nx) if 0 <= n - k < Nh)
print('y[n] for n = 0..4:' + ''.join(f' {v:g}' for v in y))
print(f'largest difference from conv = {np.max(np.abs(y - np.convolve(x, h))):g}')

plt.stem(np.arange(Ny), y)
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'conv-geometric': {
  title:'Convolving a geometric input with a step',
  what:'Convolves $x[n]=(1/2)^n u[n]$ with $h[n]=u[n]$, kept for $n=0,\\dots,29$, and compares with the exact $y[n]=2-(1/2)^n$.',
  try:'Change $h[n]$ to $(1/3)^n u[n]$. Predict whether $y[n]$ still tends to a constant.',
  out:'y[n] for n = 0..5: 1.0000 1.5000 1.7500 1.8750 1.9375 1.9688\nlargest error = 0.0000',
  m:`% x[n] = (1/2)^n u[n], h[n] = u[n], kept for n = 0..29
n  = 0:29;
x  = (0.5).^n;
h  = ones(size(n));
y  = conv(x, h);

fprintf('y[n] for n = 0..5:'), fprintf(' %.4f', y(1:6)), fprintf('\\n')
exact = 2 - (0.5).^n;
fprintf('largest error = %.4f\\n', max(abs(y(1:numel(n)) - exact)))

stem(n, y(1:numel(n)), 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = (1/2)^n u[n], h[n] = u[n], kept for n = 0..29
n = np.arange(30)
x = 0.5**n
h = np.ones(n.size)
y = np.convolve(x, h)

print('y[n] for n = 0..5:' + ''.join(f' {v:.4f}' for v in y[:6]))
exact = 2 - 0.5**n
print(f'largest error = {np.max(np.abs(y[:n.size] - exact)):.4f}')

plt.stem(n, y[:n.size])
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'conv-correlation': {
  title:'Convolution needs the flip',
  what:'Compares $y[n]=\\sum_k x[k]h[n-k]$ with the unflipped sum $\\sum_k x[k]h[k-n]$, using the asymmetric $h=\\{1,0.6,0.3\\}$ and $x=\\{1,2,1,2\\}$.',
  try:'Predict whether the two sequences could ever agree for an asymmetric $h$.',
  out:'convolution,   n = 0..5:  1.0 2.6 2.5 3.2 1.5 0.6\nunflipped sum, n = -2..3: 0.3 1.2 2.5 3.2 2.2 2.0\nthey differ',
  m:`% h = {1, 0.6, 0.3} (k = 0..2) and x = {1, 2, 1, 2} (k = 0..3)
h = [1 0.6 0.3];
x = [1 2 1 2];
k = 0:3;

yconv = conv(x, h);                        % correct: flip, shift, multiply, add
fprintf('convolution,   n = 0..5: '), fprintf(' %.1f', yconv), fprintf('\\n')

n = -2:3;                                  % the unflipped sum, sum_k x[k] h[k-n]
r = zeros(size(n));
for i = 1:numel(n)
    idx = k - n(i);
    ok  = idx >= 0 & idx < 3;
    r(i) = sum(x(k(ok)+1) .* h(idx(ok)+1));
end
fprintf('unflipped sum, n = -2..3:'), fprintf(' %.1f', r), fprintf('\\n')
fprintf('they differ\\n')

stem(0:5, yconv, 'filled'), hold on, stem(n, r), hold off, grid on
xlabel('n'), legend('convolution', 'unflipped sum')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# h = {1, 0.6, 0.3} (k = 0..2) and x = {1, 2, 1, 2} (k = 0..3)
h = np.array([1, 0.6, 0.3])
x = np.array([1, 2, 1, 2])
k = np.arange(4)
yconv = np.convolve(x, h)                  # correct: flip, shift, multiply, add
print('convolution,   n = 0..5: ' + ''.join(f' {v:.1f}' for v in yconv))

n = np.arange(-2, 4)                       # the unflipped sum, sum_k x[k] h[k-n]
r = np.zeros(n.size)
for i, ni in enumerate(n):
    idx = k - ni; ok = (idx >= 0) & (idx < 3)
    r[i] = np.sum(x[k[ok]] * h[idx[ok]])
print('unflipped sum, n = -2..3:' + ''.join(f' {v:.1f}' for v in r))
print('they differ')
plt.stem(np.arange(6), yconv, label='convolution')
plt.stem(n, r, markerfmt='o', linefmt='C2-', label='unflipped sum')
plt.xlabel(r'$n$'); plt.legend()
plt.show()`},

'int-rect-ramp': {
  title:'A rectangle convolved with a ramp',
  what:'Computes $y(t)=x(t)*h(t)$ for $x(t)=1$ on $0<t<1$ and $h(t)=t$ on $0<t<2$, as the Riemann sum $y\\approx dt\\cdot\\mathrm{conv}(x,h)$.',
  try:'Predict $y(1)$ from the case $1<t<2$ formula $t-1/2$ before you run it.',
  out:'y(0.5) = 0.125\ny(1.5) = 1.000\ny(2.5) = 0.875\npeak = 1.500 at t = 2.000',
  m:`% x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2
dt = 0.001;
N  = round(7/dt);
t  = -2 + dt*((0:N-1) + 0.5);     % midpoint grid: keeps the corners centred
x  = double(t > 0 & t < 1);
h  = t .* (t > 0 & t < 2);
y  = conv(x, h) * dt;
ty = 2*t(1) + dt*(0:numel(y)-1);

idx = @(tv) round((tv - ty(1)) / dt) + 1;
fprintf('y(0.5) = %.3f\\n', y(idx(0.5)))
fprintf('y(1.5) = %.3f\\n', y(idx(1.5)))
fprintf('y(2.5) = %.3f\\n', y(idx(2.5)))
[pk, k] = max(y);
fprintf('peak = %.3f at t = %.3f\\n', pk, ty(k))

plot(ty, y, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2
dt = 0.001
N = round(7/dt)
t = -2 + dt*(np.arange(N) + 0.5)   # midpoint grid: keeps the corners centred
x = ((t > 0) & (t < 1)).astype(float)
h = t * ((t > 0) & (t < 2))
y = np.convolve(x, h) * dt
ty = 2*t[0] + dt*np.arange(y.size)
idx = lambda tv: round((tv - ty[0]) / dt)
print(f'y(0.5) = {y[idx(0.5)]:.3f}')
print(f'y(1.5) = {y[idx(1.5)]:.3f}')
print(f'y(2.5) = {y[idx(2.5)]:.3f}')
k = np.argmax(y)
print(f'peak = {y[k]:.3f} at t = {ty[k]:.3f}')
plt.plot(ty, y, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'int-exp-step': {
  title:'A decaying input into a delayed step',
  what:'Computes $y(t)=x(t)*h(t)$ for $x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$ on a grid wide enough to hold the error to three decimals.',
  try:'Predict $y(3)$ from the two branches $\\tfrac12e^{2(t-3)}$ and $\\tfrac12$ before you run it.',
  out:'y(2) = 0.068\ny(3) = 0.500\ny(6) = 0.500',
  m:`% x(t) = exp(2t) u(-t), h(t) = u(t-3)
dt = 1e-4;
t  = -8:dt:15;                   % wide enough that the sum is accurate to 3 decimals
x  = double(t <= 0) .* exp(2*t);
h  = double(t >= 3);
y  = conv(x, h) * dt;
ty = 2*t(1) + dt*(0:numel(y)-1);

idx = @(tv) round((tv - ty(1)) / dt) + 1;
fprintf('y(2) = %.3f\\n', y(idx(2)))
fprintf('y(3) = %.3f\\n', y(idx(3)))
fprintf('y(6) = %.3f\\n', y(idx(6)))

tp = -2:0.01:8;
plot(tp, 0.5*exp(2*(min(tp,3)-3)) .* (tp<3) + 0.5*(tp>=3), 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = exp(2t) u(-t), h(t) = u(t-3)
dt = 1e-4
t = np.arange(-8, 15 + dt/2, dt)   # wide enough that the sum is accurate to 3 decimals
x = (t <= 0).astype(float) * np.exp(2*t)
h = (t >= 3).astype(float)
y = np.convolve(x, h) * dt
ty = 2*t[0] + dt*np.arange(y.size)
idx = lambda tv: round((tv - ty[0]) / dt)
print(f'y(2) = {y[idx(2)]:.3f}')
print(f'y(3) = {y[idx(3)]:.3f}')
print(f'y(6) = {y[idx(6)]:.3f}')

tp = np.arange(-2, 8, 0.01)
plt.plot(tp, np.where(tp < 3, 0.5*np.exp(2*(tp - 3)), 0.5), linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'int-area': {
  title:'The area of a convolution',
  what:'For the rectangle and ramp of the section, prints the area of $y(t)$ against the product of the areas of $x(t)$ and $h(t)$.',
  try:'Predict the area of $y$ if $h(t)$ were doubled, then check it against the printed product.',
  out:'area of y = 2.000\n(area of x)(area of h) = 2.000',
  m:`% x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2
dt = 0.001;
N  = round(7/dt);
t  = -2 + dt*((0:N-1) + 0.5);     % midpoint grid: keeps the corners centred
x  = double(t > 0 & t < 1);
h  = t .* (t > 0 & t < 2);
y  = conv(x, h) * dt;

area_y = sum(y) * dt;
area_x = sum(x) * dt;
area_h = sum(h) * dt;
fprintf('area of y = %.3f\\n', area_y)
fprintf('(area of x)(area of h) = %.3f\\n', area_x * area_h)

ty = 2*t(1) + dt*(0:numel(y)-1);
plot(ty, y, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2
dt = 0.001
N = round(7/dt)
t = -2 + dt*(np.arange(N) + 0.5)   # midpoint grid: keeps the corners centred
x = ((t > 0) & (t < 1)).astype(float)
h = t * ((t > 0) & (t < 2))
y = np.convolve(x, h) * dt
area_y = np.sum(y) * dt
area_x = np.sum(x) * dt
area_h = np.sum(h) * dt
print(f'area of y = {area_y:.3f}')
print(f'(area of x)(area of h) = {area_x * area_h:.3f}')

ty = 2*t[0] + dt*np.arange(y.size)
plt.plot(ty, y, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'int-step': {
  title:'The effect of the step size',
  what:'Recomputes the rectangle-ramp convolution for $dt=0.1,0.01,0.001$ and prints the error of the peak value against the exact $1.5$.',
  try:'Predict how the error changes when $dt$ is divided by 10 again.',
  out:'dt = 0.1000   peak = 1.3500   error = 0.1500\ndt = 0.0100   peak = 1.4850   error = 0.0150\ndt = 0.0010   peak = 1.4985   error = 0.0015',
  m:`% x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2: the peak is exactly 1.5
for dt = [0.1 0.01 0.001]
    t = -2:dt:5;
    x = double(t > 0 & t < 1);
    h = t .* (t > 0 & t < 2);
    y = conv(x, h) * dt;
    pk = max(y);
    fprintf('dt = %.4f   peak = %.4f   error = %.4f\\n', dt, pk, abs(pk - 1.5))
end

t = -2:0.001:5;
x = double(t > 0 & t < 1);
h = t .* (t > 0 & t < 2);
y = conv(x, h) * 0.001;
plot(2*t(1) + 0.001*(0:numel(y)-1), y, 'LineWidth', 1.5), grid on
xlabel('t'), ylabel('y(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x(t) = 1 on 0 < t < 1, h(t) = t on 0 < t < 2: the peak is exactly 1.5
for dt in [0.1, 0.01, 0.001]:
    t = np.round(np.arange(-2, 5 + dt/2, dt), 10)   # the same grid as MATLAB's -2:dt:5
    x = ((t > 0) & (t < 1)).astype(float)
    h = t * ((t > 0) & (t < 2))
    y = np.convolve(x, h) * dt
    pk = np.max(y)
    print(f'dt = {dt:.4f}   peak = {pk:.4f}   error = {abs(pk - 1.5):.4f}')

dt = 0.001
t = np.round(np.arange(-2, 5 + dt/2, dt), 10)
x = ((t > 0) & (t < 1)).astype(float)
h = t * ((t > 0) & (t < 2))
y = np.convolve(x, h) * dt
plt.plot(2*t[0] + dt*np.arange(y.size), y, linewidth=1.5)
plt.xlabel(r'$t$'); plt.ylabel(r'$y(t)$')
plt.grid(True)
plt.show()`},

'prop-commute': {
  title:'Convolution is commutative',
  what:'Compares $x[n]*h[n]$ with $h[n]*x[n]$ for $x=\\{1,2,1,2\\}$ and the asymmetric $h=\\{1,0.6,0.3\\}$.',
  try:'Predict the difference before you run it: does the order of the arguments to conv matter?',
  out:'largest difference = 0',
  m:`% x*h versus h*x, for an asymmetric h
x = [1 2 1 2];
h = [1 0.6 0.3];
y1 = conv(x, h);           % x first, h second
y2 = conv(h, x);           % h first, x second
d  = max(abs(y1 - y2));
fprintf('largest difference = %g\\n', d)

stem(0:numel(y1)-1, y1, 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x*h versus h*x, for an asymmetric h
x = np.array([1, 2, 1, 2])
h = np.array([1, 0.6, 0.3])
y1 = np.convolve(x, h)
y2 = np.convolve(h, x)
print(f'largest difference = {np.max(np.abs(y1 - y2)):g}')

plt.stem(np.arange(y1.size), y1)
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'prop-parallel': {
  title:'Two systems in parallel',
  what:'Compares $x*h_1+x*h_2$ with $x*(h_1+h_2)$ for $h_1=\\{1,1\\}$ and $h_2=\\{1,-1\\}$, and prints the combined impulse response.',
  try:'Predict $h_1+h_2$ before you run it, then check it against the printed line.',
  out:'largest difference = 0\ncombined h = 2 0',
  m:`% two systems in parallel: outputs added, or one system with h1 + h2
x  = [1 2 1 2];
h1 = [1 1];
h2 = [1 -1];
y1 = conv(x, h1) + conv(x, h2);
y2 = conv(x, h1 + h2);
fprintf('largest difference = %g\\n', max(abs(y1 - y2)))
fprintf('combined h ='), fprintf(' %g', h1 + h2), fprintf('\\n')

stem(0:numel(y1)-1, y1, 'filled'), hold on, stem(0:numel(y2)-1, y2), hold off, grid on
xlabel('n'), legend('parallel', 'combined')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# two systems in parallel: outputs added, or one system with h1 + h2
x  = np.array([1, 2, 1, 2])
h1 = np.array([1, 1])
h2 = np.array([1, -1])
y1 = np.convolve(x, h1) + np.convolve(x, h2)
y2 = np.convolve(x, h1 + h2)
print(f'largest difference = {np.max(np.abs(y1 - y2)):g}')
print('combined h =' + ''.join(f' {v:g}' for v in (h1 + h2)))

plt.stem(np.arange(y1.size), y1, label='parallel')
plt.stem(np.arange(y2.size), y2, markerfmt='o', linefmt='C2-', label='combined')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'prop-cascade': {
  title:'Two systems in cascade are inverses',
  what:'Cascades the first difference $h_1=\\{1,-1\\}$ with a truncated accumulator $h_2$, ten ones, and prints $h_1*h_2$.',
  try:'Predict $h_1*h_2$ before you run it: what does a first difference undo?',
  out:'h1*h2 = 1 0 0 0 0 0 0 0 0 0 -1\non n = 0..9 this is delta[n]: the cascade is the identity system there',
  m:`% h1: first difference. h2: an accumulator truncated to 10 samples
h1 = [1 -1];
h2 = ones(1, 10);
n  = 0:numel(h1) + numel(h2) - 2;
hc = conv(h1, h2);         % the cascade impulse response
fprintf('h1*h2 ='), fprintf(' %g', hc), fprintf('\\n')
fprintf('on n = 0..9 this is delta[n]: the cascade is the identity system there\\n')

stem(n, hc, 'filled'), grid on
xlabel('n'), ylabel('(h_1 * h_2)[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# h1: first difference. h2: an accumulator truncated to 10 samples
h1 = np.array([1, -1])
h2 = np.ones(10)
hc = np.convolve(h1, h2)
print('h1*h2 =' + ''.join(f' {v:g}' for v in hc))
print('on n = 0..9 this is delta[n]: the cascade is the identity system there')

plt.stem(np.arange(hc.size), hc)
plt.xlabel(r'$n$')
plt.ylabel(r'$(h_1*h_2)[n]$')
plt.grid(True)
plt.show()`},

'prop-stable': {
  title:'Absolute summability and stability',
  what:'Sums $|h[k]|$ for $N=10,100,1000$ terms, for the stable $h[n]=0.7^n u[n]$ and the unstable $h[n]=u[n]$.',
  try:'Predict the N = 1000 row for $h[n]=0.7^n u[n]$ from $1/(1-0.7)$ before you run it.',
  out:'N =   10   sum|0.7^n| = 3.239   sum|u[n]| =   10\nN =  100   sum|0.7^n| = 3.333   sum|u[n]| =  100\nN = 1000   sum|0.7^n| = 3.333   sum|u[n]| = 1000',
  m:`% partial sums of |h[k]|, for a stable and an unstable h
for N = [10 100 1000]
    n  = 0:N-1;
    h1 = 0.7.^n;              % stable: tends to 1/(1-0.7) = 3.333
    h2 = ones(size(n));       % unstable: grows as N
    fprintf('N = %4d   sum|0.7^n| = %.3f   sum|u[n]| = %4d\\n', N, sum(abs(h1)), sum(abs(h2)))
end

n = 0:20;
stem(n, 0.7.^n, 'filled'), grid on
xlabel('n'), ylabel('h[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# partial sums of |h[k]|, for a stable and an unstable h
for N in [10, 100, 1000]:
    n = np.arange(N)
    h1 = 0.7**n                # stable: tends to 1/(1-0.7) = 3.333
    h2 = np.ones(n.size)       # unstable: grows as N
    print(f'N = {N:4d}   sum|0.7^n| = {np.sum(np.abs(h1)):.3f}   sum|u[n]| = {np.sum(np.abs(h2)):4.0f}')

n = np.arange(21)
plt.stem(n, 0.7**n)
plt.xlabel(r'$n$')
plt.ylabel(r'$h[n]$')
plt.grid(True)
plt.show()`},

'prop-step': {
  title:'The step response is a running sum',
  what:'Builds the step response of $h[n]=0.8^n u[n]$ as a running sum of $h$, then takes its first difference to get $h$ back.',
  try:'Predict $s[29]$ from $\\sum_n h[n]=1/(1-0.8)$ before you run it.',
  out:'s[0..4] = 1.0000 1.8000 2.4400 2.9520 3.3616\ns[29] = 4.9938, and the sum of h is 1/(1-0.8) = 5.0000\ns[n]-s[n-1] at n = 1..4: 0.8000 0.6400 0.5120 0.4096',
  m:`% step response of h[n] = 0.8^n u[n] as a running sum of h
n = 0:29;
h = 0.8.^n;
s = cumsum(h);               % s[n] = h[0] + h[1] + ... + h[n]
fprintf('s[0..4] ='), fprintf(' %.4f', s(1:5)), fprintf('\\n')
fprintf('s[29] = %.4f, and the sum of h is 1/(1-0.8) = %.4f\\n', s(end), 1/(1-0.8))
d = diff(s);                 % first difference: s[n] - s[n-1]
fprintf('s[n]-s[n-1] at n = 1..4:'), fprintf(' %.4f', d(1:4)), fprintf('\\n')

stem(n, s, 'filled'), grid on
xlabel('n'), ylabel('s[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# step response of h[n] = 0.8^n u[n] as a running sum of h
n = np.arange(30)
h = 0.8**n
s = np.cumsum(h)             # s[n] = h[0] + h[1] + ... + h[n]
print('s[0..4] =' + ''.join(f' {v:.4f}' for v in s[:5]))
print(f's[29] = {s[-1]:.4f}, and the sum of h is 1/(1-0.8) = {1/(1-0.8):.4f}')
d = np.diff(s)               # first difference: s[n] - s[n-1]
print('s[n]-s[n-1] at n = 1..4:' + ''.join(f' {v:.4f}' for v in d[:4]))

plt.stem(n, s)
plt.xlabel(r'$n$')
plt.ylabel(r'$s[n]$')
plt.grid(True)
plt.show()`},

'de-recursion': {
  title:'The impulse response by recursion',
  what:'Runs $y[n]=0.5\\,y[n-1]+x[n]$ from rest with $x[n]=\\delta[n]$ and prints the first six samples beside $0.5^n$.',
  try:'Change the gain 0.5 to $-0.5$. Predict the sign of $h[3]$ before you run it.',
  out:'h[0..5] = 1.00000 0.50000 0.25000 0.12500 0.06250 0.03125\n0.5^n    = 1.00000 0.50000 0.25000 0.12500 0.06250 0.03125',
  m:`% y[n] = 0.5 y[n-1] + x[n], at rest, with x[n] = delta[n]
N = 10;
x = [1 zeros(1, N-1)];       % delta[n] on n = 0..N-1
y = zeros(1, N);
prev = 0;                    % initial rest: y[-1] = 0
for k = 1:N
    y(k) = 0.5*prev + x(k);
    prev = y(k);
end
fprintf('h[0..5] ='), fprintf(' %.5f', y(1:6)), fprintf('\\n')
fprintf('0.5^n    ='), fprintf(' %.5f', 0.5.^(0:5)), fprintf('\\n')

stem(0:N-1, y, 'filled'), grid on
xlabel('n'), ylabel('h[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = 0.5 y[n-1] + x[n], at rest, with x[n] = delta[n]
N = 10
x = np.r_[1.0, np.zeros(N-1)]    # delta[n] on n = 0..N-1
y = np.zeros(N)
prev = 0.0                       # initial rest: y[-1] = 0
for k in range(N):
    y[k] = 0.5*prev + x[k]
    prev = y[k]
print('h[0..5] =' + ''.join(f' {v:.5f}' for v in y[:6]))
print('0.5^n    =' + ''.join(f' {v:.5f}' for v in 0.5**np.arange(6)))

plt.stem(np.arange(N), y)
plt.xlabel(r'$n$')
plt.ylabel(r'$h[n]$')
plt.grid(True)
plt.show()`},

'de-step': {
  title:'The step response two ways',
  what:'Finds the response of $y[n]=0.5\\,y[n-1]+x[n]$ to $u[n]$ by the recursion and by the convolution $u*h$, and prints both.',
  try:'Predict the level the output settles at from $\\sum_n h[n]$ before you run it.',
  out:'recursion   y[0..3] = 1.0000 1.5000 1.7500 1.8750\nconvolution y[0..3] = 1.0000 1.5000 1.7500 1.8750\ny[19] = 2.0000, and the limit is 1/(1-0.5) = 2.0000',
  m:`% response of y[n] = 0.5 y[n-1] + x[n] to x[n] = u[n], two ways
N = 20; n = 0:N-1;
x = ones(1, N);              % u[n] on n = 0..N-1
y = zeros(1, N); prev = 0;   % initial rest
for k = 1:N
    y(k) = 0.5*prev + x(k); prev = y(k);
end
h  = 0.5.^n;                 % the impulse response
yc = conv(x, h); yc = yc(1:N);
fprintf('recursion   y[0..3] ='), fprintf(' %.4f', y(1:4)), fprintf('\\n')
fprintf('convolution y[0..3] ='), fprintf(' %.4f', yc(1:4)), fprintf('\\n')
fprintf('y[19] = %.4f, and the limit is 1/(1-0.5) = %.4f\\n', y(N), 1/(1-0.5))

stem(n, y, 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# response of y[n] = 0.5 y[n-1] + x[n] to x[n] = u[n], two ways
N = 20; n = np.arange(N)
x = np.ones(N)               # u[n] on n = 0..N-1
y = np.zeros(N); prev = 0.0  # initial rest
for k in range(N):
    y[k] = 0.5*prev + x[k]; prev = y[k]
h = 0.5**n                   # the impulse response
yc = np.convolve(x, h)[:N]
print('recursion   y[0..3] =' + ''.join(f' {v:.4f}' for v in y[:4]))
print('convolution y[0..3] =' + ''.join(f' {v:.4f}' for v in yc[:4]))
print(f'y[19] = {y[N-1]:.4f}, and the limit is 1/(1-0.5) = {1/(1-0.5):.4f}')

plt.stem(n, y)
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'de-euler': {
  title:'A differential equation, one small step at a time',
  what:'Replaces the integrator of $\\frac{\\d y}{\\d t}+2y=x$ by small steps of length $T$, runs it with $x=u(t)$, and compares $y(1)$ with $s(1)=\\tfrac12\\bigl(1-e^{-2}\\bigr)$.',
  try:'Predict how far $y(1)$ moves from $s(1)$ each time $T$ is divided by 10, then run it.',
  out:'T = 0.100   y(1) = 0.4463\nT = 0.010   y(1) = 0.4337\nT = 0.001   y(1) = 0.4325\nexact       s(1) = 0.4323',
  m:`% dy/dt + 2 y = x with x = u(t), at rest, as a difference equation:
% y(t+T) = y(t) + T*(x(t) - 2*y(t)), the integrator one step at a time
for T = [0.1 0.01 0.001]
    y = 0;                   % initial rest: y(0) = 0
    for k = 1:round(1/T)
        y = y + T*(1 - 2*y); % x(t) = 1 for t >= 0
    end
    fprintf('T = %5.3f   y(1) = %.4f\\n', T, y)
end
fprintf('exact       s(1) = %.4f\\n', 0.5*(1 - exp(-2)))

t = 0:0.01:3;
plot(t, 0.5*(1 - exp(-2*t))), grid on
xlabel('t'), ylabel('s(t)')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# dy/dt + 2 y = x with x = u(t), at rest, as a difference equation:
# y(t+T) = y(t) + T*(x(t) - 2*y(t)), the integrator one step at a time
for T in [0.1, 0.01, 0.001]:
    y = 0.0                  # initial rest: y(0) = 0
    for k in range(round(1/T)):
        y = y + T*(1 - 2*y)  # x(t) = 1 for t >= 0
    print(f'T = {T:5.3f}   y(1) = {y:.4f}')
print(f'exact       s(1) = {0.5*(1 - np.exp(-2)):.4f}')

t = np.arange(0, 3.001, 0.01)
plt.plot(t, 0.5*(1 - np.exp(-2*t)))
plt.xlabel(r'$t$')
plt.ylabel(r'$s(t)$')
plt.grid(True)
plt.show()`}
};
