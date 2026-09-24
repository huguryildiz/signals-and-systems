/* ==========================================================================
   Code for Module 6: programs in MATLAB and Python
   One entry a program, keyed by a short name. Each program works a sequence
   or system from the section and prints the number the section computes,
   with the same wording in both languages, so `out` is one text for both.
   MATLAB uses no toolbox; Python uses NumPy and Matplotlib only.
   `title`, `what` and `try` are student text and go through md(); the code
   is plain text. Each section closes with a code page (`CODE_BANKS_M6`)
   that pages through its programs.
   verify/code_check.py runs every entry in both languages and compares
   what it prints with `out`.
   ========================================================================== */
const CODE_BANKS_M6 = {
  /* <m6-s1-bank> */
  'm6-code-transform': ['dtr-samples', 'dtr-analysis', 'dtr-riemann', 'dtr-period', 'dtr-dft'],
  /* </m6-s1-bank> */

  /* <m6-s2-bank> */
  'm6-code-pairs':     ['dpr-shift',  'dpr-anun',    'dpr-rect',    'dpr-lpf'],
  /* </m6-s2-bank> */

  /* <m6-s3-bank> */
  'm6-code-periodic': ['dpe-cexp', 'dpe-sq', 'dpe-imp', 'dpe-cos'],
  /* </m6-s3-bank> */

  /* <m6-s4-bank> */
  'm6-code-props':     ['dpp-shift', 'dpp-expand', 'dpp-diff', 'dpp-parseval'],
  /* </m6-s4-bank> */

    /* <m6-s5-bank> */
  'm6-code-conv':      ['dcv-exp',    'dcv-lpf',     'dcv-mult',    'dcv-mod'],
  /* </m6-s5-bank> */

  /* <m6-s6-bank> */
  'm6-code-diffeq':    ['dde-h',      'dde-partial', 'dde-pair',    'dde-output'],
  /* </m6-s6-bank> */
};

const CODE_M6 = {

/* <m6-s1-code> */
'dtr-samples': {
  title:'Scaled coefficients are samples of the DTFT',
  what:'Computes $N\\,a_1$ for the pulse that is $1$ on $|n|\\le2$, repeated with period $N=9$ and $N=20$, and compares it with $X(e^{j\\omega_0})$ at $\\omega_0=2\\pi/N$.',
  try:'Change $N$ to $40$. Predict whether $Na_1$ moves toward $X(e^{j0})=5$ or away from it.',
  out:'N=9:  N*a1 = 2.8794   X(e^{jw0}) = 2.8794\nN=20:  N*a1 = 4.5201   X(e^{jw0}) = 4.5201',
  m:`% pulse x[n] = 1 on |n| <= N1, N1 = 2: N*a_1 for N = 9 and N = 20
N1 = 2;
n  = -N1:N1;                          % one period holds the whole pulse
x  = ones(1, 2*N1+1);
for N = [9 20]
    w0  = 2*pi/N;
    Na1 = sum(x .* exp(-1j*w0*n));    % N*a_1, no division by N
    X   = sin(w0*(N1+0.5))/sin(w0/2); % X(e^{jw}) at w = w0
    fprintf('N=%d:  N*a1 = %.4f   X(e^{jw0}) = %.4f\\n', N, real(Na1), X)
end

w = linspace(-2*pi, 2*pi, 801);
X = zeros(1, 801);
for m = n
    X = X + exp(-1j*w*m);             % the analysis sum, term by term
end
plot(w/pi, real(X), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('X(e^{jw})')
xticks(-2:1:2); xticklabels({'-2\\pi','-\\pi','0','\\pi','2\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# pulse x[n] = 1 on |n| <= N1, N1 = 2: N*a_1 for N = 9 and N = 20
N1 = 2
n = np.arange(-N1, N1+1)              # one period holds the whole pulse
x = np.ones(2*N1+1)
for N in [9, 20]:
    w0 = 2*np.pi/N
    Na1 = np.sum(x * np.exp(-1j*w0*n))      # N*a_1, no division by N
    X = np.sin(w0*(N1+0.5))/np.sin(w0/2)    # X(e^{jw}) at w = w0
    print(f'N={N}:  N*a1 = {Na1.real:.4f}   X(e^{{jw0}}) = {X:.4f}')

w = np.linspace(-2*np.pi, 2*np.pi, 801)
X = sum(np.exp(-1j*w*m) for m in n)   # the analysis sum, term by term
plt.plot(w/np.pi, X.real, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(e^{j\\omega})$')
plt.xticks(np.arange(-2, 3), [r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$'])
plt.grid(True)
plt.show()`},

'dtr-analysis': {
  title:'The analysis sum, computed numerically',
  what:'Evaluates $X(e^{j\\omega})=\\sum_{n=0}^{\\infty}(0.5)^{n}e^{-j\\omega n}$ at $\\omega=\\pi/3$ by a long finite sum and compares it with the closed form $1/(1-0.5e^{-j\\omega})$.',
  try:'Change $\\omega$ to $\\pi$. Predict the imaginary part before you run it.',
  out:'numeric = 1.0000 - 0.5774j\nformula = 1.0000 - 0.5774j',
  m:`% X(e^{jw}) = sum_n (0.5)^n exp(-j w n), x[n] = (0.5)^n u[n], w = pi/3
w = pi/3;
n = 0:59;                        % (0.5)^60 is below 1e-18
x = 0.5.^n;

Xnum = sum(x .* exp(-1j*w*n));
Xfor = 1/(1 - 0.5*exp(-1j*w));
fprintf('numeric = %.4f - %.4fj\\n', real(Xnum), abs(imag(Xnum)))
fprintf('formula = %.4f - %.4fj\\n', real(Xfor), abs(imag(Xfor)))

wv = linspace(-2*pi, 2*pi, 801);
plot(wv/pi, abs(1./(1 - 0.5*exp(-1j*wv))), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('|X(e^{jw})|')
xticks(-2:1:2); xticklabels({'-2\\pi','-\\pi','0','\\pi','2\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# X(e^{jw}) = sum_n (0.5)^n exp(-j w n), x[n] = (0.5)^n u[n], w = pi/3
w = np.pi/3
n = np.arange(60)                # (0.5)^60 is below 1e-18
x = 0.5**n

Xnum = np.sum(x * np.exp(-1j*w*n))
Xfor = 1/(1 - 0.5*np.exp(-1j*w))
print(f'numeric = {Xnum.real:.4f} - {abs(Xnum.imag):.4f}j')
print(f'formula = {Xfor.real:.4f} - {abs(Xfor.imag):.4f}j')

wv = np.linspace(-2*np.pi, 2*np.pi, 801)
plt.plot(wv/np.pi, np.abs(1/(1 - 0.5*np.exp(-1j*wv))), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|X(e^{j\\omega})|$')
plt.xticks(np.arange(-2, 3), [r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$'])
plt.grid(True)
plt.show()`},

'dtr-riemann': {
  title:'Rebuilding a sample from the synthesis sum',
  what:'Sums $\\frac{1}{2\\pi}\\sum_{k=0}^{N-1}X(e^{jk\\omega_0})e^{jk\\omega_0n}\\,\\omega_0$ for $x[n]=(0.5)^{n}u[n]$ at $n=2$. The sum approaches $x[2]=0.25$ as $N$ grows.',
  try:'Change $n$ to $-1$, where $x[n]=0$. Predict whether the sum at $N=8$ is exactly zero.',
  out:'N=8: sum = 0.2510\nN=64: sum = 0.2500',
  m:`% x[n] = (0.5)^n u[n], x[2] = 0.25: the sum over one period of N strips
n = 2;
for N = [8 64]
    w0 = 2*pi/N;
    k  = 0:N-1;                          % N strips cover one period
    Xk = 1 ./ (1 - 0.5*exp(-1j*k*w0));   % X(e^{jw}) at w = k*w0
    s  = sum(Xk .* exp(1j*k*w0*n)) * w0 / (2*pi);
    fprintf('N=%d: sum = %.4f\\n', N, real(s))
end

N = 16; w0 = 2*pi/N; k = 0:N-1;
Xk = 1 ./ (1 - 0.5*exp(-1j*k*w0));
stem(k*w0/pi, abs(Xk), 'filled'), grid on
xlabel('frequency (rad/sample)'), ylabel('|X(e^{jkw0})|')
xticks(0:0.5:1.5); xticklabels({'0','\\pi/2','\\pi','3\\pi/2'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = (0.5)^n u[n], x[2] = 0.25: the sum over one period of N strips
n = 2
for N in [8, 64]:
    w0 = 2*np.pi/N
    k = np.arange(N)                          # N strips cover one period
    Xk = 1/(1 - 0.5*np.exp(-1j*k*w0))         # X(e^{jw}) at w = k*w0
    s = np.sum(Xk * np.exp(1j*k*w0*n)) * w0 / (2*np.pi)
    print(f'N={N}: sum = {s.real:.4f}')

N = 16; w0 = 2*np.pi/N; k = np.arange(N)
Xk = 1/(1 - 0.5*np.exp(-1j*k*w0))
plt.stem(k*w0/np.pi, np.abs(Xk))
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|X(e^{jk\\omega_0})|$')
plt.xticks(np.arange(0, 1.6, 0.5), ['0', r'$\\pi/2$', r'$\\pi$', r'$3\\pi/2$'])
plt.grid(True)
plt.show()`},

'dtr-period': {
  title:'The transform repeats every 2π',
  what:'Evaluates the analysis sum of the pulse that is $1$ on $|n|\\le2$ at $\\omega=0.9$ and at $\\omega=0.9+2\\pi$, and draws three periods of $X(e^{j\\omega})$.',
  try:'Add $4\\pi$ instead of $2\\pi$. Predict the second value before you run it.',
  out:'at w = 0.9:       X = 1.7888\nat w = 0.9 + 2pi: X = 1.7888',
  m:`% pulse x[n] = 1 on |n| <= 2: X(e^{jw}) at w and at w + 2*pi
n = -2:2;
x = ones(1, 5);
w = 0.9;
X1 = sum(x .* exp(-1j*w*n));
X2 = sum(x .* exp(-1j*(w + 2*pi)*n));   % exp(-j*2*pi*n) = 1 at integer n
fprintf('at w = 0.9:       X = %.4f\\n', real(X1))
fprintf('at w = 0.9 + 2pi: X = %.4f\\n', real(X2))

wv = linspace(-3*pi, 3*pi, 1201);
X = zeros(1, 1201);
for m = n
    X = X + exp(-1j*wv*m);
end
plot(wv/pi, real(X), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('X(e^{jw})')
xticks(-3:1:3); xticklabels({'-3\\pi','-2\\pi','-\\pi','0','\\pi','2\\pi','3\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# pulse x[n] = 1 on |n| <= 2: X(e^{jw}) at w and at w + 2*pi
n = np.arange(-2, 3)
x = np.ones(5)
w = 0.9
X1 = np.sum(x * np.exp(-1j*w*n))
X2 = np.sum(x * np.exp(-1j*(w + 2*np.pi)*n))   # exp(-j*2*pi*n) = 1 at integer n
print(f'at w = 0.9:       X = {X1.real:.4f}')
print(f'at w = 0.9 + 2pi: X = {X2.real:.4f}')

wv = np.linspace(-3*np.pi, 3*np.pi, 1201)
X = sum(np.exp(-1j*wv*m) for m in n)
plt.plot(wv/np.pi, X.real, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(e^{j\\omega})$')
plt.xticks(np.arange(-3, 4), [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$'])
plt.grid(True)
plt.show()`},
'dtr-dft': {
  title:'The DFT is the DTFT, sampled',
  what:'Takes the DFT of four ones, $x[n]=1$ for $0\\le n\\le3$, with fft at $N=4$ and, padded with zeros, at $N=8$. It compares each value with the DTFT sum at $\\omega_k=2\\pi k/N$ and prints the largest difference.',
  try:'Change $N=8$ to $N=16$. Predict how many of the sixteen values are zero before you run it.',
  out:'N=4: |X[k]| = 4.0 0.0 0.0 0.0\n     largest difference = 0.0000\nN=8: |X[k]| = 4.0 2.6 0.0 1.1 0.0 1.1 0.0 2.6\n     largest difference = 0.0000',
  m:`% x[n] = 1 on 0 <= n <= 3, padded with zeros to N points
x = ones(1, 4);
n = 0:3;
for N = [4 8]
    Xk = fft(x, N);                        % the DFT: fft pads x to N points
    wk = 2*pi*(0:N-1)/N;                   % omega_k = 2*pi*k/N
    Xw = sum(x(:) .* exp(-1j*n(:)*wk));    % the DTFT at omega_k
    fprintf('N=%d: |X[k]| =%s\\n', N, sprintf(' %.1f', abs(Xk)))
    fprintf('     largest difference = %.4f\\n', max(abs(Xk - Xw)))
end

w = linspace(0, 2*pi, 801);
X = sum(exp(-1j*n(:)*w));                  % the DTFT of the four ones
plot(w/pi, abs(X), 'LineWidth', 1.5), hold on, grid on
stem((0:31)/16, abs(fft(x, 32)), 'filled')   % N = 32
xlabel('frequency (rad/sample)'), ylabel('|X(e^{jw})|')
xticks(0:0.5:2); xticklabels({'0','\\pi/2','\\pi','3\\pi/2','2\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 1 on 0 <= n <= 3, padded with zeros to N points
x = np.ones(4)
for N in [4, 8]:
    Xk = np.fft.fft(x, N)                 # the DFT: fft pads x to N points
    wk = 2*np.pi*np.arange(N)/N           # omega_k = 2*pi*k/N
    Xw = sum(x[n]*np.exp(-1j*wk*n) for n in range(4))   # the DTFT at omega_k
    print(f'N={N}: |X[k]| =' + ''.join(f' {v:.1f}' for v in np.abs(Xk)))
    print(f'     largest difference = {np.max(np.abs(Xk - Xw)):.4f}')

w = np.linspace(0, 2*np.pi, 801)
X = sum(np.exp(-1j*w*n) for n in range(4))   # the DTFT of the four ones
plt.plot(w/np.pi, np.abs(X), linewidth=1.5)
plt.stem(np.arange(32)/16, np.abs(np.fft.fft(x, 32)))   # N = 32
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|X(e^{j\\omega})|$')
plt.xticks(np.arange(0, 2.1, 0.5), ['0', r'$\\pi/2$', r'$\\pi$', r'$3\\pi/2$', r'$2\\pi$'])
plt.grid(True)
plt.show()`},
/* </m6-s1-code> */

/* <m6-s2-code> */
'dpr-shift': {
  title:'The shifted unit sample',
  what:'Evaluates the analysis sum of $x[n]=\\delta[n-3]$ at $\\omega=1$ and compares its angle with $-n_0\\omega$. It then plots the phase, folded into $(-\\pi,\\pi]$, over three periods.',
  try:'Change $\\omega$ to $1.5$. Predict the printed angle: $-4.5$ rad is outside $(-\\pi,\\pi]$, so add $2\\pi$.',
  out:'|X| = 1.0000   angle X = -3.0000 rad\n-n0*w = -3.0000 rad',
  m:`% x[n] = delta[n - n0], n0 = 3: the analysis sum at w = 1
n0 = 3;  w = 1;
n  = -10:10;
x  = double(n == n0);
X  = sum(x .* exp(-1j*w*n));
fprintf('|X| = %.4f   angle X = %.4f rad\\n', abs(X), angle(X))
fprintf('-n0*w = %.4f rad\\n', -n0*w)

% the phase over three periods: a sawtooth of period 2*pi/n0
wv = linspace(-3*pi, 3*pi, 3000);
plot(wv/pi, angle(exp(-1j*wv*n0)), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('angle X (rad)')
xticks(-3:1:3); xticklabels({'-3\\pi','-2\\pi','-\\pi','0','\\pi','2\\pi','3\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = delta[n - n0], n0 = 3: the analysis sum at w = 1
n0, w = 3, 1
n = np.arange(-10, 11)
x = (n == n0).astype(float)
X = np.sum(x * np.exp(-1j*w*n))
print(f'|X| = {abs(X):.4f}   angle X = {np.angle(X):.4f} rad')
print(f'-n0*w = {-n0*w:.4f} rad')

# the phase over three periods: a sawtooth of period 2*pi/n0
wv = np.linspace(-3*np.pi, 3*np.pi, 3000)
plt.plot(wv/np.pi, np.angle(np.exp(-1j*wv*n0)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$\\angle X(e^{j\\omega})$')
plt.xticks(np.arange(-3, 4), [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$'])
plt.grid(True)
plt.show()`},

'dpr-anun': {
  title:'The one-sided exponential and its extremes',
  what:'Sums $a^{n}e^{-j\\omega n}$ for $a=0.5$ and $n=0,\\dots,60$ over one period. It prints the largest and smallest $|X|$ and the largest $|\\angle X|$ next to $1/(1-a)$, $1/(1+a)$ and $\\arcsin a$.',
  try:'Change $a$ to $-0.5$. Predict which printed numbers change: the extremes move in $\\omega$, but the values depend only on $|a|$.',
  out:'|X| largest = 2.0000   1/(1-a) = 2.0000\n|X| smallest = 0.6667   1/(1+a) = 0.6667\nlargest |angle X| = 0.5236   arcsin(a) = 0.5236',
  m:`% x[n] = a^n u[n], a = 0.5: the sum up to n = 60 (a^60 < 1e-18)
a = 0.5;
n = 0:60;
w = linspace(-pi, pi, 2001);
X = sum((a.^n) .* exp(-1j*w(:)*n), 2);

fprintf('|X| largest = %.4f   1/(1-a) = %.4f\\n', max(abs(X)), 1/(1-a))
fprintf('|X| smallest = %.4f   1/(1+a) = %.4f\\n', min(abs(X)), 1/(1+a))
fprintf('largest |angle X| = %.4f   arcsin(a) = %.4f\\n', max(abs(angle(X))), asin(a))

plot(w/pi, abs(X), 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('|X|')
xticks(-1:0.5:1); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = a^n u[n], a = 0.5: the sum up to n = 60 (a^60 < 1e-18)
a = 0.5
n = np.arange(0, 61)
w = np.linspace(-np.pi, np.pi, 2001)
X = np.sum(a**n * np.exp(-1j*np.outer(w, n)), axis=1)

print(f'|X| largest = {np.max(abs(X)):.4f}   1/(1-a) = {1/(1-a):.4f}')
print(f'|X| smallest = {np.min(abs(X)):.4f}   1/(1+a) = {1/(1+a):.4f}')
print(f'largest |angle X| = {np.max(abs(np.angle(X))):.4f}   arcsin(a) = {np.arcsin(a):.4f}')

plt.plot(w/np.pi, abs(X), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|X(e^{j\\omega})|$')
plt.xticks(np.arange(-1, 1.1, 0.5), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$'])
plt.grid(True)
plt.show()`},

'dpr-rect': {
  title:'The rectangular sequence and the Dirichlet kernel',
  what:'For $N_1=2$, compares the sum of $e^{-j\\omega n}$ over $|n|\\le N_1$ with $\\sin(\\omega(N_1+\\frac12))/\\sin(\\omega/2)$ at $\\omega=1$. It prints the value $2N_1+1$ at $\\omega=0$ and the least value over one period.',
  try:'Change $N_1$ to $4$. Predict the value at $\\omega=0$ before you run it.',
  out:'sum at w=1: 1.2483   kernel: 1.2483\nX at w=0: 5\nleast value = -1.2500',
  m:`% x[n] = 1 on |n| <= N1, N1 = 2: the sum against the Dirichlet kernel
N1 = 2;
n  = -N1:N1;
w  = 1;
Xsum = sum(exp(-1j*w*n));
Xker = sin(w*(N1 + 0.5)) / sin(w/2);
fprintf('sum at w=1: %.4f   kernel: %.4f\\n', real(Xsum), Xker)
fprintf('X at w=0: %d\\n', length(n))

% the sum over one period has no 0/0 at w = 0
wv = linspace(-pi, pi, 20001);
Xv = real(sum(exp(-1j*wv(:)*n), 2));
fprintf('least value = %.4f\\n', min(Xv))

plot(wv/pi, Xv, 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('X')
xticks(-1:0.5:1); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 1 on |n| <= N1, N1 = 2: the sum against the Dirichlet kernel
N1 = 2
n = np.arange(-N1, N1 + 1)
w = 1
Xsum = np.sum(np.exp(-1j*w*n))
Xker = np.sin(w*(N1 + 0.5)) / np.sin(w/2)
print(f'sum at w=1: {Xsum.real:.4f}   kernel: {Xker:.4f}')
print(f'X at w=0: {len(n)}')

# the sum over one period has no 0/0 at w = 0
wv = np.linspace(-np.pi, np.pi, 20001)
Xv = np.sum(np.exp(-1j*np.outer(wv, n)), axis=1).real
print(f'least value = {np.min(Xv):.4f}')

plt.plot(wv/np.pi, Xv, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$X(e^{j\\omega})$')
plt.xticks(np.arange(-1, 1.1, 0.5), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$']); plt.grid(True)
plt.show()`},

'dpr-lpf': {
  title:'Inverting the ideal low-pass band',
  what:'For $W=\\pi/4$, evaluates the synthesis integral $\\frac{1}{2\\pi}\\int_{-W}^{W}e^{j\\omega n}\\,\\d\\omega$ numerically for $n=0,\\dots,3$ and compares it with $\\sin(Wn)/(\\pi n)$ and $x[0]=W/\\pi$.',
  try:'Change $W$ to $\\pi/2$. Predict $x[2]$ before you run it: $\\sin(\\pi)=0$.',
  out:'n=0: integral = 0.2500   formula = 0.2500\nn=1: integral = 0.2251   formula = 0.2251\nn=2: integral = 0.1592   formula = 0.1592\nn=3: integral = 0.0750   formula = 0.0750',
  m:`% ideal low-pass band, W = pi/4: the synthesis integral against sin(Wn)/(pi n)
W  = pi/4;
N  = 20000;
dw = 2*W/N;
w  = -W + dw*((0:N-1) + 0.5);          % midpoints across the band
for n = 0:3
    xnum = real(sum(exp(1j*w*n))) * dw / (2*pi);
    if n == 0, xf = W/pi; else, xf = sin(W*n)/(pi*n); end
    fprintf('n=%d: integral = %.4f   formula = %.4f\\n', n, xnum, xf)
end

k  = -16:16;
xk = sin(W*k) ./ (pi*k);  xk(k == 0) = W/pi;
stem(k, xk, 'filled'), grid on
xlabel('n'), ylabel('x[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# ideal low-pass band, W = pi/4: the synthesis integral against sin(Wn)/(pi n)
W = np.pi/4
N = 20000
dw = 2*W/N
w = -W + dw*(np.arange(N) + 0.5)        # midpoints across the band
for n in range(4):
    xnum = np.sum(np.exp(1j*w*n)).real * dw / (2*np.pi)
    xf = W/np.pi if n == 0 else np.sin(W*n)/(np.pi*n)
    print(f'n={n}: integral = {xnum:.4f}   formula = {xf:.4f}')

k = np.arange(-16, 17)
xk = np.where(k == 0, W/np.pi, np.sin(W*k)/(np.pi*np.where(k == 0, 1, k)))
plt.stem(k, xk)
plt.xlabel(r'$n$'); plt.ylabel(r'$x[n]$')
plt.grid(True)
plt.show()`},
/* </m6-s2-code> */

/* <m6-s3-code> */
'dpe-cexp': {
  title:'Reduce a frequency into one period',
  what:'Brings $\\omega_0=9\\pi/4$ into $-\\pi<\\omega\\le\\pi$ and checks that $e^{j(9\\pi/4)n}$ and $e^{j(\\pi/4)n}$ agree at every integer $n$ from $-20$ to $20$.',
  try:'Change $\\omega_0$ to $7\\pi/4$. Predict the reduced frequency before you run it.',
  out:'reduced frequency = 0.7854\nlargest difference = 0.0000',
  m:`% e^{j w0 n} with w0 = 9pi/4: reduce w0 into (-pi, pi]
w0 = 9*pi/4;
r = w0 - 2*pi*round(w0/(2*pi));
if r <= -pi, r = r + 2*pi; end
fprintf('reduced frequency = %.4f\\n', r)

n = -20:20;
d = max(abs(exp(1j*w0*n) - exp(1j*r*n)));
fprintf('largest difference = %.4f\\n', d)

stem(n, real(exp(1j*w0*n)), 'filled'), grid on
xlabel('n'), ylabel('Re x[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# e^{j w0 n} with w0 = 9pi/4: reduce w0 into (-pi, pi]
w0 = 9*np.pi/4
r = w0 - 2*np.pi*np.round(w0/(2*np.pi))
if r <= -np.pi: r = r + 2*np.pi
print(f'reduced frequency = {r:.4f}')

n = np.arange(-20, 21)
d = np.max(np.abs(np.exp(1j*w0*n) - np.exp(1j*r*n)))
print(f'largest difference = {d:.4f}')

plt.stem(n, np.real(np.exp(1j*w0*n)))
plt.xlabel(r'$n$'); plt.ylabel(r'$\\mathrm{Re}\\{x[n]\\}$')
plt.grid(True)
plt.show()`},

'dpe-sq': {
  title:'Impulse weights of a square wave',
  what:'Finds $a_k$ of the square wave $N=10$, $N_1=2$ with the analysis sum of the series, then prints the weights $2\\pi a_k$ at $k=0$, $1$ and $3$.',
  try:'Change $N$ to $20$. Predict the weight at $k=0$ before you run it.',
  out:'2*pi*a_0 = 3.1416\n2*pi*a_1 = 2.0333\n2*pi*a_3 = -0.7766',
  m:`% square wave: 1 on |n| <= N1 in each period N
N = 10;  N1 = 2;
n = 0:N-1;
x = double(abs(n - N*round(n/N)) <= N1);
a = zeros(1, N);
for k = 0:N-1
    a(k+1) = real(sum(x .* exp(-1j*2*pi*k*n/N))) / N;
end
fprintf('2*pi*a_0 = %.4f\\n', 2*pi*a(1))
fprintf('2*pi*a_1 = %.4f\\n', 2*pi*a(2))
fprintf('2*pi*a_3 = %.4f\\n', 2*pi*a(4))

stem(2*pi*n/N, 2*pi*a, 'filled'), grid on
xlabel('frequency (rad/sample)'), ylabel('2 pi a_k')
xticks(0:pi/2:1.5*pi); xticklabels({'0','\\pi/2','\\pi','3\\pi/2'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# square wave: 1 on |n| <= N1 in each period N
N, N1 = 10, 2
n = np.arange(N)
x = (np.abs(n - N*np.round(n/N)) <= N1).astype(float)
a = np.array([np.sum(x*np.exp(-1j*2*np.pi*k*n/N)).real/N for k in range(N)])
print(f'2*pi*a_0 = {2*np.pi*a[0]:.4f}')
print(f'2*pi*a_1 = {2*np.pi*a[1]:.4f}')
print(f'2*pi*a_3 = {2*np.pi*a[3]:.4f}')

plt.stem(2*np.pi*n/N, 2*np.pi*a)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$2\\pi a_k$')
plt.xticks(np.arange(0, 1.6*np.pi, np.pi/2), ['0', r'$\\pi/2$', r'$\\pi$', r'$3\\pi/2$'])
plt.grid(True)
plt.show()`},

'dpe-imp': {
  title:'The unit-sample train has equal weights',
  what:'Finds $a_k$ of a unit sample every $N=5$ indices. Every weight is $2\\pi/N$, and the weights of one period add to $2\\pi$.',
  try:'Change $N$ to $10$. Predict both printed numbers before you run it.',
  out:'smallest weight = 1.2566\nlargest weight = 1.2566\nsum over one period = 6.2832',
  m:`% a unit sample every N indices
N = 5;
n = 0:N-1;
x = double(mod(n, N) == 0);
w = zeros(1, N);
for k = 0:N-1
    w(k+1) = 2*pi*real(sum(x .* exp(-1j*2*pi*k*n/N))) / N;
end
fprintf('smallest weight = %.4f\\n', min(w))
fprintf('largest weight = %.4f\\n', max(w))
fprintf('sum over one period = %.4f\\n', sum(w))

stem(2*pi*n/N, w, 'filled'), grid on
xlabel('frequency (rad/sample)'), ylabel('2 pi a_k')
xticks(0:pi/2:1.5*pi); xticklabels({'0','\\pi/2','\\pi','3\\pi/2'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# a unit sample every N indices
N = 5
n = np.arange(N)
x = (n % N == 0).astype(float)
w = np.array([2*np.pi*np.sum(x*np.exp(-1j*2*np.pi*k*n/N)).real/N for k in range(N)])
print(f'smallest weight = {w.min():.4f}')
print(f'largest weight = {w.max():.4f}')
print(f'sum over one period = {w.sum():.4f}')

plt.stem(2*np.pi*n/N, w)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$2\\pi a_k$')
plt.xticks(np.arange(0, 1.6*np.pi, np.pi/2), ['0', r'$\\pi/2$', r'$\\pi$', r'$3\\pi/2$'])
plt.grid(True)
plt.show()`},

'dpe-cos': {
  title:'Two cosines and their period',
  what:'Reduces $5\\pi/3$ and $7\\pi/4$ into $-\\pi<\\omega\\le\\pi$, then searches for the smallest $N$ with $x[n+N]=x[n]$ for $x[n]=2\\cos(5\\pi n/3)+\\cos(7\\pi n/4)$.',
  try:'Change the second frequency to $3\\pi/2$. Predict the period before you run it.',
  out:'first reduced = -1.0472\nsecond reduced = -0.7854\nfundamental period = 24',
  m:`% x[n] = 2cos(5pi n/3) + cos(7pi n/4)
w = [5*pi/3, 7*pi/4];
r = w - 2*pi*round(w/(2*pi));
fprintf('first reduced = %.4f\\n', r(1))
fprintf('second reduced = %.4f\\n', r(2))

x = @(n) 2*cos(w(1)*n) + cos(w(2)*n);
n = 0:99;
N0 = 1;
while max(abs(x(n + N0) - x(n))) > 1e-9
    N0 = N0 + 1;
end
fprintf('fundamental period = %d\\n', N0)
stem(0:30, x(0:30), 'filled'), grid on
xlabel('n'), ylabel('x[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 2cos(5pi n/3) + cos(7pi n/4)
w = np.array([5*np.pi/3, 7*np.pi/4])
r = w - 2*np.pi*np.round(w/(2*np.pi))
print(f'first reduced = {r[0]:.4f}')
print(f'second reduced = {r[1]:.4f}')

x = lambda n: 2*np.cos(w[0]*n) + np.cos(w[1]*n)
n = np.arange(100)
N0 = 1
while np.max(np.abs(x(n + N0) - x(n))) > 1e-9:
    N0 = N0 + 1
print(f'fundamental period = {N0}')
plt.stem(np.arange(31), x(np.arange(31)))
plt.xlabel(r'$n$'); plt.ylabel(r'$x[n]$')
plt.grid(True)
plt.show()`},
/* </m6-s3-code> */

/* <m6-s4-code> */
'dpp-shift': {
  title:'A delay changes only the phase',
  what:'Delays $(0.5)^{n}u[n]$ by $n_0=2$ and evaluates both transforms at $\\omega=0.5$ from the analysis sum. The magnitudes agree, and the phase changes by $-\\omega n_0=-1$.',
  try:'Change the delay to $n_0=3$. Predict the phase change before you run it.',
  out:'magnitude difference = 0.0000\nphase change = -1.0000',
  m:`% x[n] = 0.5^n u[n] and its delay y[n] = x[n-2], at w = 0.5
n0 = 2;  w = 0.5;
n  = 0:59;
x  = 0.5.^n;
X  = sum(x .* exp(-1j*w*n));
Y  = sum(x .* exp(-1j*w*(n + n0)));   % y[n] = x[n-n0] sits at n + n0
fprintf('magnitude difference = %.4f\\n', abs(abs(Y) - abs(X)))
fprintf('phase change = %.4f\\n', angle(Y/X))

stem(n, x, 'filled'), hold on
stem(n + n0, x), hold off, xlim([-1 12]), grid on
xlabel('n'), legend('x[n]', 'x[n-2]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 0.5^n u[n] and its delay y[n] = x[n-2], at w = 0.5
n0, w = 2, 0.5
n = np.arange(60)
x = 0.5**n
X = np.sum(x * np.exp(-1j*w*n))
Y = np.sum(x * np.exp(-1j*w*(n + n0)))  # y[n] = x[n-n0] sits at n + n0
print(f'magnitude difference = {abs(abs(Y) - abs(X)):.4f}')
print(f'phase change = {np.angle(Y/X):.4f}')

plt.stem(n, x, label=r'$x[n]$')
plt.stem(n + n0, x, linefmt='C1-', markerfmt='C1o', label=r'$x[n-2]$')
plt.xlim(-1, 12); plt.xlabel(r'$n$'); plt.legend()
plt.grid(True)
plt.show()`},

'dpp-expand': {
  title:'Expansion compresses the spectrum',
  what:'Expands the five-point pulse $y[n]=1$ on $0\\le n\\le4$ by $k=2$ and evaluates $|Y_{(2)}(e^{j\\omega})|$. It is $5$ at both $\\omega=0$ and $\\omega=\\pi$, because the spectrum now repeats every $\\pi$.',
  try:'Change $k$ to $3$. Predict the three printed values before you run it.',
  out:'|Y2| at w = 0: 5.0000\n|Y2| at w = pi: 5.0000\n|Y2| at w = pi/2: 1.0000',
  m:`% y[n] = 1 on 0 <= n <= 4, expanded by k = 2
k  = 2;
n  = 0:4;
m  = k*n;                               % where the expanded samples sit
Y2 = @(w) abs(sum(exp(-1j*w*m)));
fprintf('|Y2| at w = 0: %.4f\\n', Y2(0))
fprintf('|Y2| at w = pi: %.4f\\n', Y2(pi))
fprintf('|Y2| at w = pi/2: %.4f\\n', Y2(pi/2))

w  = linspace(-3*pi, 3*pi, 2001);
Yw = zeros(size(w));
for i = 1:numel(w), Yw(i) = Y2(w(i)); end
plot(w/pi, Yw, 'LineWidth', 1.5), grid on
xlabel('frequency (rad/sample)'), ylabel('|Y_{(2)}|')
xticks(-3:1:3); xticklabels({'-3\\pi','-2\\pi','-\\pi','0','\\pi','2\\pi','3\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] = 1 on 0 <= n <= 4, expanded by k = 2
k = 2
n = np.arange(5)
m = k*n                                 # where the expanded samples sit
Y2 = lambda w: abs(np.sum(np.exp(-1j*w*m)))
print(f'|Y2| at w = 0: {Y2(0):.4f}')
print(f'|Y2| at w = pi: {Y2(np.pi):.4f}')
print(f'|Y2| at w = pi/2: {Y2(np.pi/2):.4f}')

w = np.linspace(-3*np.pi, 3*np.pi, 2001)
plt.plot(w/np.pi, [Y2(v) for v in w], linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|Y_{(2)}(e^{j\\omega})|$')
plt.xticks(np.arange(-3, 4), [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$'])
plt.grid(True)
plt.show()`},

'dpp-diff': {
  title:'The first difference removes the average',
  what:'Takes the first difference of $(0.5)^{n}u[n]$ and divides the two transforms. The ratio is $|1-e^{-j\\omega}|$: $0$ at $\\omega=0$ and $2$ at $\\omega=\\pi$.',
  try:'Replace $0.5$ by $-0.5$. Predict the two factors before you run it.',
  out:'factor at w = 0: 0.0000\nfactor at w = pi: 2.0000',
  m:`% x[n] = 0.5^n u[n] and its first difference y[n] = x[n] - x[n-1]
n  = 0:60;
x  = 0.5.^n;
y  = x - [0, x(1:end-1)];              % x[n-1] is x moved one place right
DT = @(s, w) sum(s .* exp(-1j*w*n));   % analysis sum at one frequency
fprintf('factor at w = 0: %.4f\\n', abs(DT(y, 0)) / abs(DT(x, 0)))
fprintf('factor at w = pi: %.4f\\n', abs(DT(y, pi)) / abs(DT(x, pi)))

stem(n, x, 'filled'), hold on
stem(n, y), hold off, xlim([-1 10]), grid on
xlabel('n'), legend('x[n]', 'x[n]-x[n-1]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 0.5^n u[n] and its first difference y[n] = x[n] - x[n-1]
n = np.arange(61)
x = 0.5**n
y = x - np.concatenate(([0], x[:-1]))  # x[n-1] is x moved one place right
DT = lambda s, w: np.sum(s * np.exp(-1j*w*n))   # analysis sum at one frequency
print(f'factor at w = 0: {abs(DT(y, 0)) / abs(DT(x, 0)):.4f}')
print(f'factor at w = pi: {abs(DT(y, np.pi)) / abs(DT(x, np.pi)):.4f}')

plt.stem(n, x, label=r'$x[n]$')
plt.stem(n, y, linefmt='C1-', markerfmt='C1o', label=r'$x[n]-x[n-1]$')
plt.xlim(-1, 10); plt.xlabel(r'$n$'); plt.legend()
plt.grid(True)
plt.show()`},

'dpp-parseval': {
  title:'Parseval over one period',
  what:'Computes the energy of $(0.5)^{n}u[n]$ as $\\sum_n|x[n]|^{2}$ and as $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}|X(e^{j\\omega})|^{2}\\,d\\omega$. Both give $4/3$.',
  try:'Change $a$ to $0.8$. Predict the energy before you run it.',
  out:'energy from the sum = 1.3333\nenergy from the integral = 1.3333',
  m:`% x[n] = 0.5^n u[n]: energy as a sum and over one period of |X|^2
a  = 0.5;
n  = 0:80;
x  = a.^n;
fprintf('energy from the sum = %.4f\\n', sum(abs(x).^2))

N  = 4096;
w  = -pi + 2*pi*(0:N-1)/N;              % one period, evenly spaced
X2 = 1 ./ abs(1 - a*exp(-1j*w)).^2;
fprintf('energy from the integral = %.4f\\n', mean(X2))   % mean = integral / 2pi

plot(w, X2, 'LineWidth', 1.5), xlim([-pi pi]), grid on
xlabel('frequency (rad/sample)'), ylabel('|X|^2')
xticks(-pi:pi/2:pi); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = 0.5^n u[n]: energy as a sum and over one period of |X|^2
a = 0.5
n = np.arange(81)
x = a**n
print(f'energy from the sum = {np.sum(np.abs(x)**2):.4f}')

N = 4096
w = -np.pi + 2*np.pi*np.arange(N)/N     # one period, evenly spaced
X2 = 1 / np.abs(1 - a*np.exp(-1j*w))**2
print(f'energy from the integral = {np.mean(X2):.4f}')   # mean = integral / 2pi

plt.plot(w, X2, linewidth=1.5)
plt.xlim(-np.pi, np.pi)
plt.xlabel(r'$\\omega$ (rad/sample)'); plt.ylabel(r'$|X(e^{j\\omega})|^2$')
plt.xticks(np.arange(-np.pi, np.pi+0.01, np.pi/2), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$'])
plt.grid(True)
plt.show()`},

/* </m6-s4-code> */

/* <m6-s5-code> */
'dcv-exp': {
  title:'Convolution of two exponential sequences',
  what:'Convolves $x[n]=(\\tfrac12)^{n}u[n]$ with $h[n]=(\\tfrac14)^{n}u[n]$ and compares the result with $y[n]=\\dfrac{a^{n+1}-b^{n+1}}{a-b}$.',
  try:'Change $b$ to $0.5$, equal to $a$. Predict whether the closed form still matches before you run it.',
  out:'y[0..3] = 1.0000 0.7500 0.4375 0.2344\nmatches the closed form: 1',
  m:`% x[n] = (1/2)^n u[n], h[n] = (1/4)^n u[n]: y = x*h
a = 0.5;  b = 0.25;
n = 0:40;
x = a.^n;  h = b.^n;
y = conv(x, h);
y = y(1:numel(n));                         % keep n = 0..40
yform = (a.^(n+1) - b.^(n+1)) / (a - b);
fprintf('y[0..3] = %.4f %.4f %.4f %.4f\\n', y(1), y(2), y(3), y(4))
fprintf('matches the closed form: %d\\n', max(abs(y - yform)) < 1e-12)

stem(n(1:13), y(1:13), 'filled'), grid on
xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = (1/2)^n u[n], h[n] = (1/4)^n u[n]: y = x*h
a, b = 0.5, 0.25
n = np.arange(41)
x = a**n; h = b**n
y = np.convolve(x, h)[:n.size]             # keep n = 0..40
yform = (a**(n+1) - b**(n+1)) / (a - b)
print(f'y[0..3] = {y[0]:.4f} {y[1]:.4f} {y[2]:.4f} {y[3]:.4f}')
print(f'matches the closed form: {int(np.max(np.abs(y - yform)) < 1e-12)}')

plt.stem(n[:13], y[:13])
plt.xlabel(r'$n$'); plt.ylabel(r'$y[n]$')
plt.grid(True)
plt.show()`},

'dcv-lpf': {
  title:'A stepped spectrum through an ideal low-pass filter',
  what:'Multiplies the stepped $X(e^{j\\omega})$ by an ideal low-pass $H(e^{j\\omega})$ with cutoff $\\pi/2$ over one period, inverts the product with the synthesis sum and compares with $y[n]=\\dfrac{\\sin(\\pi n/2)}{\\pi n}+\\dfrac{\\sin(\\pi n/4)}{\\pi n}$.',
  try:'Change the cutoff of $H$ to $3\\pi/4$. Predict $y[0]$ before you run it.',
  out:'y[0] = 0.7500   formula 0.7500\ny[1] = 0.5434   formula 0.5434\ny[2] = 0.1592   formula 0.1592',
  m:`% Y = X H: X = 2 on |w|<=pi/4, 1 on pi/4<|w|<=3pi/4; H = 1 on |w|<=pi/2
M  = 4096;
dw = 2*pi/M;
w  = -pi + dw*((0:M-1) + 0.5);             % midpoints of one period
X  = 2*(abs(w) <= pi/4) + (abs(w) > pi/4 & abs(w) <= 3*pi/4);
H  = double(abs(w) <= pi/2);
Y  = X .* H;
for n = 0:2
    yn = real(sum(Y .* exp(1j*w*n))) * dw / (2*pi);   % synthesis sum
    yc = 1/2 + 1/4;
    if n ~= 0, yc = sin(pi*n/2)/(pi*n) + sin(pi*n/4)/(pi*n); end
    fprintf('y[%d] = %.4f   formula %.4f\\n', n, yn, yc)
end

plot(w, Y, 'LineWidth', 1.5), grid on
xlabel('w (rad/sample)'), ylabel('Y')
xticks(-pi:pi/2:pi); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# Y = X H: X = 2 on |w|<=pi/4, 1 on pi/4<|w|<=3pi/4; H = 1 on |w|<=pi/2
M = 4096
dw = 2*np.pi/M
w = -np.pi + dw*(np.arange(M) + 0.5)       # midpoints of one period
X = 2*(np.abs(w) <= np.pi/4) + ((np.abs(w) > np.pi/4) & (np.abs(w) <= 3*np.pi/4))
H = (np.abs(w) <= np.pi/2).astype(float)
Y = X * H
for n in range(3):
    yn = np.real(np.sum(Y * np.exp(1j*w*n))) * dw / (2*np.pi)   # synthesis sum
    yc = 1/2 + 1/4
    if n != 0: yc = np.sin(np.pi*n/2)/(np.pi*n) + np.sin(np.pi*n/4)/(np.pi*n)
    print(f'y[{n}] = {yn:.4f}   formula {yc:.4f}')

plt.plot(w, Y, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$Y(e^{j\\omega})$')
plt.xticks(np.arange(-np.pi, np.pi+0.01, np.pi/2), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$'])
plt.grid(True)
plt.show()`},

'dcv-mult': {
  title:'A periodic convolution over one period',
  what:'Samples bands of half-width $3\\pi/4$ and $\\pi/2$ over one period and forms $Z=\\tfrac{1}{2\\pi}X\\circledast Y$ as a circular sum. It prints $Z$ at $0$, $3\\pi/4$ and $\\pi$, and checks the area against $z[0]=x[0]\\,y[0]$.',
  try:'Change the half-width of $X$ to $\\pi/4$. Predict the value at $\\pi$ before you run it.',
  out:'Z at 0     = 0.5000\nZ at 3pi/4 = 0.2500\nZ at pi    = 0.2500\narea/(2pi) = 0.3750   x[0]*y[0] = 0.3750',
  m:`% periodic convolution of two bands: half-widths 3pi/4 and pi/2
M  = 2^14;
dw = 2*pi/M;
m  = 0:M-1;                                % w = m*dw covers one period
X  = double(m < 3*M/8 | m >= M - 3*M/8);   % band of half-width 3pi/4
Y  = double(m < M/4 | m >= M - M/4);       % band of half-width pi/2
Z  = real(ifft(fft(X) .* fft(Y))) * dw / (2*pi);   % circular sum
fprintf('Z at 0     = %.4f\\n', Z(1))
fprintf('Z at 3pi/4 = %.4f\\n', Z(3*M/8 + 1))
fprintf('Z at pi    = %.4f\\n', Z(M/2 + 1))
fprintf('area/(2pi) = %.4f   x[0]*y[0] = %.4f\\n', sum(Z)*dw/(2*pi), 0.75*0.5)

w = m*dw;  w(w >= pi) = w(w >= pi) - 2*pi;
plot(w, Z, '.'), grid on
xlabel('w (rad/sample)'), ylabel('Z')
xticks(-pi:pi/2:pi); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# periodic convolution of two bands: half-widths 3pi/4 and pi/2
M = 2**14
dw = 2*np.pi/M
m = np.arange(M)                           # w = m*dw covers one period
X = ((m < 3*M//8) | (m >= M - 3*M//8)).astype(float)   # half-width 3pi/4
Y = ((m < M//4) | (m >= M - M//4)).astype(float)       # half-width pi/2
Z = np.real(np.fft.ifft(np.fft.fft(X) * np.fft.fft(Y))) * dw / (2*np.pi)
print(f'Z at 0     = {Z[0]:.4f}')
print(f'Z at 3pi/4 = {Z[3*M//8]:.4f}')
print(f'Z at pi    = {Z[M//2]:.4f}')
print(f'area/(2pi) = {Z.sum()*dw/(2*np.pi):.4f}   x[0]*y[0] = {0.75*0.5:.4f}')

w = np.where(m*dw >= np.pi, m*dw - 2*np.pi, m*dw)
plt.plot(w, Z, '.')
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$Z(e^{j\\omega})$')
plt.xticks(np.arange(-np.pi, np.pi+0.01, np.pi/2), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$'])
plt.grid(True)
plt.show()`},

'dcv-mod': {
  title:'Modulation by a cosine, sample by sample',
  what:'Builds $Z(e^{j\\omega})=\\tfrac12X\\bigl(e^{j(\\omega-\\omega_0)}\\bigr)+\\tfrac12X\\bigl(e^{j(\\omega+\\omega_0)}\\bigr)$ for a band of half-width $\\pi/4$ and $\\omega_0=\\pi/3$, inverts it and compares $z[n]$ with $x[n]\\cos(\\omega_0n)$.',
  try:'Change $\\omega_0$ to $\\pi/8$. Predict whether $z[0]$ changes before you run it.',
  out:'upper band: 0.2618 to 1.8326 rad\nz[0] = 0.2500   x[0]cos(w0 n) = 0.2500\nz[3] = -0.0750   x[3]cos(w0 n) = -0.0750',
  m:`% x[n] = sin(pi n/4)/(pi n) times cos(w0 n), w0 = pi/3
W = pi/4;  w0 = pi/3;
fprintf('upper band: %.4f to %.4f rad\\n', w0 - W, w0 + W)
M  = 4800;
dw = 2*pi/M;
w  = -pi + dw*((0:M-1) + 0.5);             % midpoints of one period
inband = @(v) abs(mod(v + pi, 2*pi) - pi) <= W;
Z  = 0.5*inband(w - w0) + 0.5*inband(w + w0);   % two copies of height 1/2
for n = [0 3]
    zn = real(sum(Z .* exp(1j*w*n))) * dw / (2*pi);   % synthesis sum
    xn = W/pi;
    if n ~= 0, xn = sin(W*n)/(pi*n); end
    fprintf('z[%d] = %.4f   x[%d]cos(w0 n) = %.4f\\n', n, zn, n, xn*cos(w0*n))
end

plot(w, Z, 'LineWidth', 1.5), grid on
xlabel('w (rad/sample)'), ylabel('Z')
xticks(-pi:pi/2:pi); xticklabels({'-\\pi','-\\pi/2','0','\\pi/2','\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# x[n] = sin(pi n/4)/(pi n) times cos(w0 n), w0 = pi/3
W, w0 = np.pi/4, np.pi/3
print(f'upper band: {w0 - W:.4f} to {w0 + W:.4f} rad')
M = 4800
dw = 2*np.pi/M
w = -np.pi + dw*(np.arange(M) + 0.5)       # midpoints of one period
inband = lambda v: np.abs(np.mod(v + np.pi, 2*np.pi) - np.pi) <= W
Z = 0.5*inband(w - w0) + 0.5*inband(w + w0)    # two copies of height 1/2
for n in (0, 3):
    zn = np.real(np.sum(Z * np.exp(1j*w*n))) * dw / (2*np.pi)   # synthesis sum
    xn = W/np.pi
    if n != 0: xn = np.sin(W*n)/(np.pi*n)
    print(f'z[{n}] = {zn:.4f}   x[{n}]cos(w0 n) = {xn*np.cos(w0*n):.4f}')

plt.plot(w, Z, linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$Z(e^{j\\omega})$')
plt.xticks(np.arange(-np.pi, np.pi+0.01, np.pi/2), [r'$-\\pi$', r'$-\\pi/2$', '0', r'$\\pi/2$', r'$\\pi$']); plt.grid(True)
plt.show()`},
/* </m6-s5-code> */

/* <m6-s6-code> */
'dde-h': {
  title:'The frequency response of a difference equation',
  what:'Forms $H(e^{j\\omega})$ from $y[n]-\\tfrac34y[n-1]+\\tfrac18y[n-2]=2x[n]$, prints $H(e^{j0})$ and $|H(e^{j\\pi})|$, and checks that a shift by $2\\pi$ changes nothing.',
  try:'Predict $|H(e^{j\\pi})|$ before you run it: at $\\omega=\\pi$, $e^{-j\\omega}=-1$.',
  out:'H(e^j0) = 5.3333\n|H(e^jpi)| = 1.0667\nlargest change after a shift by 2pi = 0.0000',
  m:`% y[n] - 3/4 y[n-1] + 1/8 y[n-2] = 2 x[n]
% H(e^jw) = 2 / (1 - 3/4 e^-jw + 1/8 e^-j2w)
H = @(w) 2 ./ (1 - 0.75*exp(-1j*w) + 0.125*exp(-2j*w));
fprintf('H(e^j0) = %.4f\\n', real(H(0)))
fprintf('|H(e^jpi)| = %.4f\\n', abs(H(pi)))

w = linspace(-3*pi, 3*pi, 1201);
d = max(abs(H(w + 2*pi) - H(w)));
fprintf('largest change after a shift by 2pi = %.4f\\n', d)

plot(w, abs(H(w)), 'LineWidth', 1.5), grid on
xlabel('w (rad/sample)'), ylabel('|H|')
xticks(pi*(-3:3)); xticklabels({'-3\\pi','-2\\pi','-\\pi','0','\\pi','2\\pi','3\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] - 3/4 y[n-1] + 1/8 y[n-2] = 2 x[n]
# H(e^jw) = 2 / (1 - 3/4 e^-jw + 1/8 e^-j2w)
def H(w):
    return 2 / (1 - 0.75*np.exp(-1j*w) + 0.125*np.exp(-2j*w))

print(f'H(e^j0) = {H(0).real:.4f}')
print(f'|H(e^jpi)| = {abs(H(np.pi)):.4f}')

w = np.linspace(-3*np.pi, 3*np.pi, 1201)
d = np.max(np.abs(H(w + 2*np.pi) - H(w)))
print(f'largest change after a shift by 2pi = {d:.4f}')

plt.plot(w, np.abs(H(w)), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|H(e^{j\\omega})|$')
plt.xticks(np.pi*np.arange(-3, 4), [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$']); plt.grid(True)
plt.show()`},

'dde-partial': {
  title:'Partial fractions and the recursion agree',
  what:'Finds $A=4$ and $B=-2$ by the cover-up rule and compares $4(\\tfrac12)^{n}-2(\\tfrac14)^{n}$ with the recursion run on $\\delta[n]$.',
  try:'Predict $h[0]$ from $A+B$ before you run it.',
  out:'A = 4.0000, B = -2.0000\nh[0], h[1], h[2] = 2.0000, 1.5000, 0.8750\nlargest difference = 0.0000',
  m:`% partial fractions of 2 / ((1 - z/2)(1 - z/4)), z = e^-jw
A = 2 / (1 - 2/4);          % cover up (1 - z/2), set z = 2
B = 2 / (1 - 4/2);          % cover up (1 - z/4), set z = 4
fprintf('A = %.4f, B = %.4f\\n', A, B)

N = 30;  n = 0:N-1;
h = zeros(1, N);            % run the recursion with x[n] = delta[n]
for k = 1:N
    h(k) = 2*(k == 1);
    if k > 1, h(k) = h(k) + 0.75*h(k-1); end
    if k > 2, h(k) = h(k) - 0.125*h(k-2); end
end
hc = A*0.5.^n + B*0.25.^n;
fprintf('h[0], h[1], h[2] = %.4f, %.4f, %.4f\\n', h(1), h(2), h(3))
fprintf('largest difference = %.4f\\n', max(abs(h - hc)))

stem(n, h), grid on, xlabel('n'), ylabel('h[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# partial fractions of 2 / ((1 - z/2)(1 - z/4)), z = e^-jw
A = 2 / (1 - 2/4)           # cover up (1 - z/2), set z = 2
B = 2 / (1 - 4/2)           # cover up (1 - z/4), set z = 4
print(f'A = {A:.4f}, B = {B:.4f}')

N = 30; n = np.arange(N)
h = np.zeros(N)             # run the recursion with x[n] = delta[n]
for k in range(N):
    h[k] = 2*(k == 0)
    if k > 0: h[k] += 0.75*h[k-1]
    if k > 1: h[k] -= 0.125*h[k-2]
hc = A*0.5**n + B*0.25**n
print(f'h[0], h[1], h[2] = {h[0]:.4f}, {h[1]:.4f}, {h[2]:.4f}')
print(f'largest difference = {np.max(np.abs(h - hc)):.4f}')

plt.stem(n, h)
plt.xlabel(r'$n$'); plt.ylabel(r'$h[n]$'); plt.grid(True)
plt.show()`},

'dde-pair': {
  title:'The repeated-pole pair, summed',
  what:'Sums $(n+1)(\\tfrac14)^{n}$ and evaluates its DTFT over three periods, then compares both with $1/(1-\\tfrac14e^{-j\\omega})^{2}$.',
  try:'Change $a$ to $0.5$. Predict the sum before you run it.',
  out:'sum of (n+1)a^n = 1.7778\n1/(1-a)^2 = 1.7778\nwith the sign reversed, 1/(1+a)^2 = 0.6400\nlargest difference from the pair = 0.0000',
  m:`% (n+1) a^n u[n] <-> 1/(1 - a e^-jw)^2, checked with a = 1/4
a = 0.25;  n = 0:200;
x = (n + 1) .* a.^n;
fprintf('sum of (n+1)a^n = %.4f\\n', sum(x))
fprintf('1/(1-a)^2 = %.4f\\n', 1/(1 - a)^2)
fprintf('with the sign reversed, 1/(1+a)^2 = %.4f\\n', 1/(1 + a)^2)

w = linspace(-3*pi, 3*pi, 601);
X = zeros(size(w));
for k = 1:numel(n)
    X = X + x(k)*exp(-1j*w*n(k));
end
d = max(abs(X - 1./(1 - a*exp(-1j*w)).^2));
fprintf('largest difference from the pair = %.4f\\n', d)

plot(w, abs(X), 'LineWidth', 1.5), grid on
xlabel('w (rad/sample)'), ylabel('|X|')
xticks(pi*(-3:3)); xticklabels({'-3\\pi','-2\\pi','-\\pi','0','\\pi','2\\pi','3\\pi'})`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# (n+1) a^n u[n] <-> 1/(1 - a e^-jw)^2, checked with a = 1/4
a = 0.25; n = np.arange(201)
x = (n + 1) * a**n
print(f'sum of (n+1)a^n = {np.sum(x):.4f}')
print(f'1/(1-a)^2 = {1/(1 - a)**2:.4f}')
print(f'with the sign reversed, 1/(1+a)^2 = {1/(1 + a)**2:.4f}')

w = np.linspace(-3*np.pi, 3*np.pi, 601)
X = np.zeros(w.size, dtype=complex)
for k in range(n.size):
    X += x[k]*np.exp(-1j*w*n[k])
d = np.max(np.abs(X - 1/(1 - a*np.exp(-1j*w))**2))
print(f'largest difference from the pair = {d:.4f}')

plt.plot(w, np.abs(X), linewidth=1.5)
plt.xlabel(r'$\\omega$'); plt.ylabel(r'$|X(e^{j\\omega})|$')
plt.xticks(np.pi*np.arange(-3, 4), [r'$-3\\pi$', r'$-2\\pi$', r'$-\\pi$', '0', r'$\\pi$', r'$2\\pi$', r'$3\\pi$']); plt.grid(True)
plt.show()`},

'dde-output': {
  title:'The output of the repeated-pole example',
  what:'Runs the recursion with input $(\\tfrac14)^{n}u[n]$ and compares the result with $-4(\\tfrac14)^{n}-2(n+1)(\\tfrac14)^{n}+8(\\tfrac12)^{n}$.',
  try:'Predict the sum of $y[n]$ from $H(e^{j0})\\,X(e^{j0})$ before you run it.',
  out:'y[0..3] = 2.0000, 2.0000, 1.3750, 0.8125\nlargest difference = 0.0000\nsum of y[n] = 7.1111',
  m:`% y[n] - 3/4 y[n-1] + 1/8 y[n-2] = 2 x[n], with x[n] = (1/4)^n u[n]
N = 40;  n = 0:N-1;
x = 0.25.^n;
y = zeros(1, N);
for k = 1:N
    y(k) = 2*x(k);
    if k > 1, y(k) = y(k) + 0.75*y(k-1); end
    if k > 2, y(k) = y(k) - 0.125*y(k-2); end
end
yc = -4*0.25.^n - 2*(n + 1).*0.25.^n + 8*0.5.^n;
fprintf('y[0..3] = %.4f, %.4f, %.4f, %.4f\\n', y(1), y(2), y(3), y(4))
fprintf('largest difference = %.4f\\n', max(abs(y - yc)))
fprintf('sum of y[n] = %.4f\\n', sum(y))

stem(n, y), grid on, xlabel('n'), ylabel('y[n]')`,
  py:`import numpy as np
import matplotlib.pyplot as plt

# y[n] - 3/4 y[n-1] + 1/8 y[n-2] = 2 x[n], with x[n] = (1/4)^n u[n]
N = 40; n = np.arange(N)
x = 0.25**n
y = np.zeros(N)
for k in range(N):
    y[k] = 2*x[k]
    if k > 0: y[k] += 0.75*y[k-1]
    if k > 1: y[k] -= 0.125*y[k-2]
yc = -4*0.25**n - 2*(n + 1)*0.25**n + 8*0.5**n
print(f'y[0..3] = {y[0]:.4f}, {y[1]:.4f}, {y[2]:.4f}, {y[3]:.4f}')
print(f'largest difference = {np.max(np.abs(y - yc)):.4f}')
print(f'sum of y[n] = {np.sum(y):.4f}')

plt.stem(n, y)
plt.xlabel(r'$n$'); plt.ylabel(r'$y[n]$'); plt.grid(True)
plt.show()`}
/* </m6-s6-code> */

};
