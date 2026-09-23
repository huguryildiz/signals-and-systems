/* ==========================================================================
   Code for Module 2: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program applies a system
   from the module and prints the number the property test computes, with the
   same wording in both languages, so `out` is one text for both. MATLAB uses
   no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. The module closes its teaching with one code page
   (`CODE_BANKS_M2`) that pages through the programs.
   verify/code_check.py runs every entry in both languages and compares what
   it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M2 = {
  'm2-code-props': ['props-memory', 'props-stable', 'props-ti', 'props-linear']
};

const CODE_M2 = {

'props-memory': {
  title:'Feedback gives memory',
  what:'Runs the accumulator $y[n]=x[n]+y[n-1]$ from rest on a pulse of six ones and prints the output.',
  try:'Make the input $x[n]=\\delta[n]$. Predict $y[9]$ before you run it.',
  out:'y[n] for n = 0..9: 1 2 3 4 5 6 6 6 6 6\nmemory: y[9] = 6 although x[9] = 0',
  m:`% accumulator y[n] = x[n] + y[n-1], at rest before n = 0
n = 0:9;
x = double(n <= 5);            % a pulse of six ones
y = zeros(size(n));
prev = 0;                      % initial rest: y[-1] = 0
for k = 1:numel(n)
    y(k) = x(k) + prev;
    prev = y(k);
end
fprintf('y[n] for n = 0..9:'), fprintf(' %d', y), fprintf('\\n')
fprintf('memory: y[9] = %d although x[9] = %d\\n', y(end), x(end))

stem(n, x, 'filled'), hold on, stem(n, y), hold off, grid on
xlabel('n'), legend('x[n]', 'y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# accumulator y[n] = x[n] + y[n-1], at rest before n = 0
n = np.arange(10)
x = (n <= 5).astype(int)       # a pulse of six ones
y = np.zeros(n.size, dtype=int)
prev = 0                       # initial rest: y[-1] = 0
for k in range(n.size):
    y[k] = x[k] + prev
    prev = y[k]
print('y[n] for n = 0..9:' + ''.join(f' {v}' for v in y))
print(f'memory: y[9] = {y[-1]} although x[9] = {x[-1]}')

plt.stem(n, x, label=r'$x[n]$')
plt.stem(n, y, markerfmt='o', linefmt='C2-', label=r'$y[n]$')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'props-stable': {
  title:'A bounded input, an unbounded output',
  what:'Feeds the bounded input $x[n]=u[n]$ into the accumulator and prints the largest input and output values for longer and longer runs.',
  try:'Use $x[n]=(-1)^{n}$ instead. Predict the largest output for large $N$.',
  out:'N =   10   max|x| = 1   max|y| = 11\nN =  100   max|x| = 1   max|y| = 101\nN = 1000   max|x| = 1   max|y| = 1001',
  m:`% the accumulator with the bounded input x[n] = u[n]
for N = [10 100 1000]
    n = 0:N;
    x = ones(size(n));         % |x[n]| <= 1
    y = cumsum(x);             % y[n] = sum of x[k] for k <= n
    fprintf('N = %4d   max|x| = %d   max|y| = %d\\n', N, max(abs(x)), max(abs(y)))
end

n = 0:20;
stem(n, cumsum(ones(size(n))), 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# the accumulator with the bounded input x[n] = u[n]
for N in [10, 100, 1000]:
    n = np.arange(N + 1)
    x = np.ones(n.size, dtype=int)   # |x[n]| <= 1
    y = np.cumsum(x)                 # y[n] = sum of x[k] for k <= n
    print(f'N = {N:4d}   max|x| = {np.max(np.abs(x))}   max|y| = {np.max(np.abs(y))}')

n = np.arange(21)
plt.stem(n, np.cumsum(np.ones(n.size)))
plt.xlabel(r'$n$')
plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'props-ti': {
  title:'The two paths for $y[n]=n\\,x[n]$',
  what:'Applies $y[n]=n\\,x[n]$ to $\\delta[n]$ and to $\\delta[n-1]$, then compares the shifted output with the output of the shifted input.',
  try:'Replace the rule by $y[n]=2x[n]$. Predict the largest difference.',
  out:'path 1: 0 0 0 0 1 0 0 0\npath 2: 0 0 0 0 0 0 0 0\nlargest difference = 1',
  m:`% y[n] = n x[n]: shift the input, or shift the output
n  = -3:4;
x1 = double(n == 0);           % delta[n]
y1 = n .* x1;                  % = 0 at every n
x2 = double(n == 1);           % delta[n-1], the input shifted by 1
y2 = n .* x2;                  % path 1: shift, then apply
p2 = [0, y1(1:end-1)];         % path 2: y1[n-1]
fprintf('path 1:'), fprintf(' %d', y2), fprintf('\\n')
fprintf('path 2:'), fprintf(' %d', p2), fprintf('\\n')
fprintf('largest difference = %d\\n', max(abs(y2 - p2)))

stem(n, y2, 'filled'), hold on, stem(n, p2), hold off, grid on
xlabel('n'), legend('path 1', 'path 2')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = n x[n]: shift the input, or shift the output
n = np.arange(-3, 5)
x1 = (n == 0).astype(int)      # delta[n]
y1 = n * x1                    # = 0 at every n
x2 = (n == 1).astype(int)      # delta[n-1], the input shifted by 1
y2 = n * x2                    # path 1: shift, then apply
p2 = np.concatenate(([0], y1[:-1]))   # path 2: y1[n-1]
print('path 1:' + ''.join(f' {v}' for v in y2))
print('path 2:' + ''.join(f' {v}' for v in p2))
print(f'largest difference = {np.max(np.abs(y2 - p2))}')

plt.stem(n, y2, label='path 1')
plt.stem(n, p2, markerfmt='o', linefmt='C2-', label='path 2')
plt.xlabel(r'$n$')
plt.legend()
plt.show()`},

'props-linear': {
  title:'The superposition test',
  what:'Compares $S\\{ax_1+bx_2\\}$ with $aS\\{x_1\\}+bS\\{x_2\\}$ for the square $y[n]=\\bigl(x[2n]\\bigr)^{2}$ and for the gain $y[n]=2\\pi\\,x[n]$.',
  try:'Remove the square, so that $S_1$ only keeps $x[2n]$. Predict its largest difference.',
  out:'square: largest difference = 18.0000\ngain:   largest difference = 0.0000',
  m:`% superposition test for a square and for a gain
x1 = [1 2 0 -1 3 1 2 0];
x2 = [0 1 -2 1 1 0 -1 2];
a = 2;  b = -1;
S1 = @(x) x(1:2:end).^2;       % y[n] = (x[2n])^2, for n = 0..3
S2 = @(x) 2*pi*x;              % y[n] = 2 pi x[n]
d1 = S1(a*x1 + b*x2) - (a*S1(x1) + b*S1(x2));
d2 = S2(a*x1 + b*x2) - (a*S2(x1) + b*S2(x2));
fprintf('square: largest difference = %.4f\\n', max(abs(d1)))
fprintf('gain:   largest difference = %.4f\\n', max(abs(d2)))

stem(0:3, d1, 'filled'), grid on
xlabel('n'), ylabel('y_3[n] - (a y_1[n] + b y_2[n])')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# superposition test for a square and for a gain
x1 = np.array([1, 2, 0, -1, 3, 1, 2, 0])
x2 = np.array([0, 1, -2, 1, 1, 0, -1, 2])
a, b = 2, -1
S1 = lambda x: x[::2]**2       # y[n] = (x[2n])^2, for n = 0..3
S2 = lambda x: 2*np.pi*x       # y[n] = 2 pi x[n]
d1 = S1(a*x1 + b*x2) - (a*S1(x1) + b*S1(x2))
d2 = S2(a*x1 + b*x2) - (a*S2(x1) + b*S2(x2))
print(f'square: largest difference = {np.max(np.abs(d1)):.4f}')
print(f'gain:   largest difference = {np.max(np.abs(d2)):.4f}')

plt.stem(np.arange(4), d1)
plt.xlabel(r'$n$')
plt.ylabel(r'$y_3[n]-(a\\,y_1[n]+b\\,y_2[n])$')
plt.grid(True)
plt.show()`}
};
