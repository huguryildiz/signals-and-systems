/* Course notes — Appendix A, summary of formulas */
(function(){
const P=PLOT, C=P.COL;
const D=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const ax=o=>P.Axes(Object.assign({w:700,h:200,pad:{l:44,r:20,t:16,b:30},xtarget:8,ytarget:3},o));

window.CA = [

{t:'h1', num:'APPENDIX A', text:'Summary of formulas'},
{t:'h2', num:'A.1', text:'Energy and power'},
{t:'table', head:['Quantity','Continuous time','Discrete time'], rows:[
 ['Total energy','$E_\\infty=\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\d t$','$E_\\infty=\\sum_{n=-\\infty}^{\\infty}|x[n]|^{2}$'],
 ['Average power','$P_\\infty=\\lim\\limits_{T\\to\\infty}\\frac{1}{2T}\\int_{-T}^{T}|x(t)|^{2}\\d t$','$P_\\infty=\\lim\\limits_{N\\to\\infty}\\frac{1}{2N+1}\\sum_{n=-N}^{N}|x[n]|^{2}$'],
 ['Energy signal','$E_\\infty<\\infty$, $P_\\infty=0$','same'],
 ['Power signal','$E_\\infty\\to\\infty$, $0<P_\\infty<\\infty$','same']
]},
{t:'h2', num:'A.2', text:'Operations and periodicity'},
{t:'table', head:['Item','Statement'], rows:[
 ['Shift','$x(t-t_0)$: delay if $t_0>0$, advance if $t_0<0$'],
 ['Reversal','$x(-t)$, $x[-n]$'],
 ['Scaling','$y(t)=x(at)$: compressed if $a>1$, stretched if $0<a<1$; support divided by $a$'],
 ['Combination','$x(at-b)$: shift by $b$ first, then scale by $a$'],
 ['Periodicity','$x(t)=x(t+T)$; $x[n]=x[n+N]$ with $N$ an integer'],
 ['Fundamental frequency','$\\omega_0=2\\pi/T_0=2\\pi/N_0$'],
 ['Even and odd','$\\Ev\\{x\\}=\\tfrac12[x(t)+x(-t)]$, $\\Od\\{x\\}=\\tfrac12[x(t)-x(-t)]$']
]},
{t:'h2', num:'A.3', text:'Impulses and steps'},
{t:'table', head:['Item','Continuous time','Discrete time'], rows:[
 ['Step and impulse','$\\delta(t)=\\frac{\\d}{\\d t}u(t)$, $u(t)=\\int_{-\\infty}^{t}\\delta(\\tau)\\d\\tau$','$\\delta[n]=u[n]-u[n-1]$, $u[n]=\\sum_{k=0}^{\\infty}\\delta[n-k]$'],
 ['Sampling','$x(t)\\delta(t-t_0)=x(t_0)\\delta(t-t_0)$','$x[n]\\delta[n-n_0]=x[n_0]\\delta[n-n_0]$'],
 ['Sifting','$x(t_0)=\\int_{-\\infty}^{\\infty}x(t)\\delta(t-t_0)\\d t$','$x[n_0]=\\sum_{n}x[n]\\delta[n-n_0]$'],
 ['Representation','$x(t)=\\int x(\\tau)\\delta(t-\\tau)\\d\\tau$','$x[n]=\\sum_{k}x[k]\\delta[n-k]$']
]},
{t:'h2', num:'A.4', text:'Complex exponentials'},
{t:'table', head:['Item','Statement'], rows:[
 ['Continuous time','$x(t)=Ce^{at}$; with $C=Ae^{j\\theta}$ and $a=r+j\\omega_0$: $x(t)=Ae^{rt}e^{j(\\omega_0t+\\theta)}$'],
 ['Period','$T_0=2\\pi/\\omega_0$, always periodic for $\\omega_0\\neq0$'],
 ['Discrete time','$x[n]=C\\alpha^{n}$ with $\\alpha=e^{\\beta}$; growth boundary at $|\\alpha|=1$'],
 ['Period','$N=\\frac{2\\pi}{\\omega_0}k$; periodic only if $\\omega_0/2\\pi\\in\\mathbb{Q}$'],
 ['Frequency wrap-around','$e^{j(\\omega_0+2\\pi)n}=e^{j\\omega_0 n}$']
]},
{t:'h2', num:'A.5', text:'Systems and convolution'},
{t:'table', head:['Property','General criterion','LTI criterion in terms of $h$'], rows:[
 ['Memoryless','output at $t$ uses only input at $t$','$h(t)=a\\delta(t)$ or $h[n]=a\\delta[n]$'],
 ['Invertible','distinct inputs give distinct outputs','$h*g=\\delta$ for some $g$'],
 ['Causal','output uses only $\\tau\\le t$','$h(t)=0$ for $t<0$; $h[n]=0$ for $n<0$'],
 ['BIBO stable','bounded input gives bounded output','$\\int|h|\\,\\d t<\\infty$; $\\sum_k|h[k]|<\\infty$'],
 ['Time invariant','$x(t-t_0)\\to y(t-t_0)$','—'],
 ['Linear','$ax_1+bx_2\\to ay_1+by_2$','—']
]},
{t:'eqbox', cap:'Convolution',
 tex:['y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]','y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)\\,\\d\\tau'],
 after:'Convolution is commutative, distributive, and associative. The output support is the sum of the input supports. The total areas, or the total sums in discrete time, multiply.'},
{t:'page'},
{t:'h2', num:'A.7', text:'Fourier series properties'},
{t:'p', text:'A periodic signal of period $T_0$ with $\\omega_0=2\\pi/T_0$, or a periodic sequence of period $N$ with $\\omega_0=2\\pi/N$. In both columns $x\\leftrightarrow a_k$ and $y\\leftrightarrow b_k$.'},
{t:'table', head:['Property','Continuous time','Discrete time'], rows:[
 ['Linearity','$Ax(t)+By(t)\\leftrightarrow Aa_k+Bb_k$','$Ax[n]+By[n]\\leftrightarrow Aa_k+Bb_k$'],
 ['Time shift','$x(t-t_0)\\leftrightarrow a_ke^{-jk\\omega_0t_0}$','$x[n-n_0]\\leftrightarrow a_ke^{-jk(2\\pi/N)n_0}$'],
 ['Frequency shift','$e^{jM\\omega_0t}x(t)\\leftrightarrow a_{k-M}$','$e^{jM(2\\pi/N)n}x[n]\\leftrightarrow a_{k-M}$'],
 ['Conjugation','$x^{*}(t)\\leftrightarrow a_{-k}^{*}$','$x^{*}[n]\\leftrightarrow a_{-k}^{*}$'],
 ['Time reversal','$x(-t)\\leftrightarrow a_{-k}$','$x[-n]\\leftrightarrow a_{-k}$'],
 ['Time scaling','$x(\\alpha t)$, $\\alpha>0$: $a_k$, period $T_0/\\alpha$','$x_{(m)}[n]$: $\\frac{1}{m}a_k$, period $mN$'],
 ['Periodic convolution','$\\int_{T_0}x(\\tau)y(t-\\tau)\\d\\tau\\leftrightarrow T_0a_kb_k$','$\\sum_{r=\\langle N\\rangle}x[r]y[n-r]\\leftrightarrow Na_kb_k$'],
 ['Multiplication','$x(t)y(t)\\leftrightarrow\\sum_{\\ell=-\\infty}^{\\infty}a_\\ell b_{k-\\ell}$','$x[n]y[n]\\leftrightarrow\\sum_{\\ell=\\langle N\\rangle}a_\\ell b_{k-\\ell}$'],
 ['Derivative or difference','$\\d x/\\d t\\leftrightarrow jk\\omega_0a_k$','$x[n]-x[n-1]\\leftrightarrow(1-e^{-jk(2\\pi/N)})a_k$'],
 ['Integral or running sum','$\\int_{-\\infty}^{t}x\\,\\d\\tau\\leftrightarrow\\frac{a_k}{jk\\omega_0}$, only if $a_0=0$','$\\sum_{r=-\\infty}^{n}x[r]\\leftrightarrow\\frac{a_k}{1-e^{-jk(2\\pi/N)}}$, only if $a_0=0$'],
 ['Real signal','$a_k=a_{-k}^{*}$; $|a_k|$ even, $\\angle a_k$ odd','same'],
 ['Real and even','$a_k$ real and even','same'],
 ['Real and odd','$a_k$ purely imaginary and odd','same'],
 ['Even-odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{a_k\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{a_k\\}$','same'],
 ['Parseval','$\\frac{1}{T_0}\\int_{T_0}|x|^{2}\\d t=\\sum_{k}|a_k|^{2}$','$\\frac{1}{N}\\sum_{n=\\langle N\\rangle}|x|^{2}=\\sum_{k=\\langle N\\rangle}|a_k|^{2}$']
]},
{t:'p', text:'The two columns differ in three rows because discrete-time coefficients repeat, $a_k=a_{k+N}$. For multiplication, the discrete-time sum therefore covers one period instead of all integers. Time expansion carries the factor $\\frac{1}{m}$ because the average uses $m$ times as many samples. Discrete time also uses a first difference where continuous time uses a derivative. At $k=0$, integration or accumulation requires zero mean; otherwise the result grows without bound.'},

{t:'h2', num:'A.8', text:'Continuous-time Fourier transform'},
{t:'table', head:['Property','Statement'], rows:[
 ['Linearity','$ax_1(t)+bx_2(t)\\leftrightarrow aX_1(j\\omega)+bX_2(j\\omega)$'],
 ['Time shift','$x(t-t_0)\\leftrightarrow e^{-j\\omega t_0}X(j\\omega)$'],
 ['Frequency shift','$e^{j\\omega_0t}x(t)\\leftrightarrow X(j(\\omega-\\omega_0))$'],
 ['Conjugation','$x^{*}(t)\\leftrightarrow X^{*}(-j\\omega)$'],
 ['Time reversal','$x(-t)\\leftrightarrow X(-j\\omega)$'],
 ['Time and frequency scaling','$x(at)\\leftrightarrow\\frac{1}{|a|}X(j\\omega/a)$'],
 ['Convolution','$x(t)*h(t)\\leftrightarrow X(j\\omega)H(j\\omega)$'],
 ['Multiplication','$x(t)y(t)\\leftrightarrow\\frac{1}{2\\pi}X(j\\omega)*Y(j\\omega)$'],
 ['Differentiation in time','$\\d^{n}x/\\d t^{n}\\leftrightarrow(j\\omega)^{n}X(j\\omega)$'],
 ['Integration','$\\int_{-\\infty}^{t}x(\\tau)\\d\\tau\\leftrightarrow\\frac{1}{j\\omega}X(j\\omega)+\\pi X(0)\\delta(\\omega)$'],
 ['Differentiation in frequency','$t\\,x(t)\\leftrightarrow j\\,\\d X(j\\omega)/\\d\\omega$'],
 ['Duality','$X(t)\\leftrightarrow2\\pi x(-\\omega)$'],
 ['Real signal','$X(-j\\omega)=X^{*}(j\\omega)$; $|X|$ even, $\\angle X$ odd'],
 ['Real and even','$X(j\\omega)$ real and even'],
 ['Real and odd','$X(j\\omega)$ purely imaginary and odd'],
 ['Even-odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
 ['Parseval','$\\int_{-\\infty}^{\\infty}|x(t)|^{2}\\d t=\\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty}|X(j\\omega)|^{2}\\d\\omega$']
]},
{t:'table', head:['Signal','Transform'], rows:[
 ['$\\delta(t)$','$1$'],
 ['$\\delta(t-t_0)$','$e^{-j\\omega t_0}$'],
 ['$u(t)$','$\\frac{1}{j\\omega}+\\pi\\delta(\\omega)$'],
 ['$e^{-at}u(t)$, $a>0$','$\\frac{1}{a+j\\omega}$'],
 ['$te^{-at}u(t)$, $a>0$','$\\frac{1}{(a+j\\omega)^{2}}$'],
 ['$\\frac{t^{n-1}}{(n-1)!}e^{-at}u(t)$, $a>0$','$\\frac{1}{(a+j\\omega)^{n}}$'],
 ['$e^{-a|t|}$, $a>0$','$\\frac{2a}{a^{2}+\\omega^{2}}$'],
 ['$1$ on $|t|<T_1$, $0$ beyond','$\\frac{2\\sin(\\omega T_1)}{\\omega}=2T_1\\operatorname{sinc}(\\omega T_1)$'],
 ['$\\frac{\\sin(Wt)}{\\pi t}=\\frac{W}{\\pi}\\operatorname{sinc}(Wt)$','$1$ on $|\\omega|<W$, $0$ beyond'],
 ['$1$','$2\\pi\\delta(\\omega)$'],
 ['$e^{j\\omega_0t}$','$2\\pi\\delta(\\omega-\\omega_0)$'],
 ['$\\cos\\omega_0t$','$\\pi\\delta(\\omega-\\omega_0)+\\pi\\delta(\\omega+\\omega_0)$'],
 ['$\\sin\\omega_0t$','$\\frac{\\pi}{j}\\delta(\\omega-\\omega_0)-\\frac{\\pi}{j}\\delta(\\omega+\\omega_0)$'],
 ['$\\sum_k a_ke^{jk\\omega_0t}$','$\\sum_k2\\pi a_k\\delta(\\omega-k\\omega_0)$'],
 ['Square wave: $1$ on $|t|<T_1$, $0$ on $T_1<|t|\\le T/2$','$\\sum_k\\frac{2\\sin(k\\omega_0T_1)}{k}\\delta(\\omega-k\\omega_0)$'],
 ['$\\sum_k\\delta(t-kT)$','$\\frac{2\\pi}{T}\\sum_k\\delta(\\omega-\\frac{2\\pi k}{T})$']
]},
{t:'p', text:'This table uses the unnormalised definition $\\operatorname{sinc}(\\theta)=\\sin\\theta/\\theta$. The normalised convention divides the argument by $\\pi$. Convert the argument when moving between conventions; otherwise the result loses a factor of $\\pi$. The exponential pairs require $a>0$.'},

{t:'h2', num:'A.9', text:'Discrete-time Fourier transform'},
{t:'table', head:['Property','Statement'], rows:[
 ['Linearity','$ax_1[n]+bx_2[n]\\leftrightarrow aX_1(e^{j\\omega})+bX_2(e^{j\\omega})$'],
 ['Time shift','$x[n-n_0]\\leftrightarrow e^{-j\\omega n_0}X(e^{j\\omega})$'],
 ['Frequency shift','$e^{j\\omega_0n}x[n]\\leftrightarrow X(e^{j(\\omega-\\omega_0)})$'],
 ['Conjugation','$x^{*}[n]\\leftrightarrow X^{*}(e^{-j\\omega})$'],
 ['Time reversal','$x[-n]\\leftrightarrow X(e^{-j\\omega})$'],
 ['Time expansion','$x_{(k)}[n]\\leftrightarrow X(e^{jk\\omega})$'],
 ['Convolution','$x[n]*h[n]\\leftrightarrow X(e^{j\\omega})H(e^{j\\omega})$'],
 ['Multiplication','$x[n]y[n]\\leftrightarrow\\frac{1}{2\\pi}\\int_{2\\pi}X(e^{j\\theta})Y(e^{j(\\omega-\\theta)})\\d\\theta$'],
 ['Differencing in time','$x[n]-x[n-1]\\leftrightarrow(1-e^{-j\\omega})X(e^{j\\omega})$'],
 ['Accumulation','$\\sum_{m=-\\infty}^{n}x[m]\\leftrightarrow\\frac{X(e^{j\\omega})}{1-e^{-j\\omega}}+\\pi X(e^{j0})\\sum_k\\delta(\\omega-2\\pi k)$'],
 ['Differentiation in frequency','$n\\,x[n]\\leftrightarrow j\\,\\d X(e^{j\\omega})/\\d\\omega$'],
 ['Real sequence','$X(e^{-j\\omega})=X^{*}(e^{j\\omega})$; $|X|$ even, $\\angle X$ odd'],
 ['Real and even','$X(e^{j\\omega})$ real and even'],
 ['Real and odd','$X(e^{j\\omega})$ purely imaginary and odd'],
 ['Even-odd parts','$\\Ev\\{x\\}\\leftrightarrow\\operatorname{Re}\\{X\\}$, $\\Od\\{x\\}\\leftrightarrow j\\operatorname{Im}\\{X\\}$'],
 ['Parseval','$\\sum_n|x[n]|^{2}=\\frac{1}{2\\pi}\\int_{2\\pi}|X(e^{j\\omega})|^{2}\\d\\omega$']
]},
{t:'table', head:['Sequence','Transform'], rows:[
 ['$\\delta[n]$','$1$'],
 ['$\\delta[n-n_0]$','$e^{-j\\omega n_0}$'],
 ['$u[n]$','$\\frac{1}{1-e^{-j\\omega}}+\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
 ['$a^{n}u[n]$, $|a|<1$','$\\frac{1}{1-ae^{-j\\omega}}$'],
 ['$(n+1)a^{n}u[n]$, $|a|<1$','$\\frac{1}{(1-ae^{-j\\omega})^{2}}$'],
 ['$\\frac{(n+r-1)!}{n!(r-1)!}a^{n}u[n]$, $|a|<1$','$\\frac{1}{(1-ae^{-j\\omega})^{r}}$'],
 ['$a^{|n|}$, $|a|<1$','$\\frac{1-a^{2}}{1-2a\\cos\\omega+a^{2}}$'],
 ['$1$ on $|n|\\le N_1$, $0$ beyond','$\\frac{\\sin(\\omega(N_1+\\frac12))}{\\sin(\\omega/2)}$'],
 ['$\\frac{\\sin(Wn)}{\\pi n}$, $0<W<\\pi$','$1$ on $|\\omega|\\le W$, $0$ on $W<|\\omega|\\le\\pi$'],
 ['$1$','$2\\pi\\sum_k\\delta(\\omega-2\\pi k)$'],
 ['$e^{j\\omega_0n}$','$2\\pi\\sum_k\\delta(\\omega-\\omega_0-2\\pi k)$'],
 ['$\\cos\\omega_0n$','$\\pi\\sum_k[\\delta(\\omega-\\omega_0-2\\pi k)+\\delta(\\omega+\\omega_0-2\\pi k)]$'],
 ['$\\sin\\omega_0n$','$\\frac{\\pi}{j}\\sum_k[\\delta(\\omega-\\omega_0-2\\pi k)-\\delta(\\omega+\\omega_0-2\\pi k)]$'],
 ['$\\sum_{k=\\langle N\\rangle}a_ke^{jk(2\\pi/N)n}$','$2\\pi\\sum_k a_k\\delta(\\omega-\\frac{2\\pi k}{N})$'],
 ['$\\sum_k\\delta[n-kN]$','$\\frac{2\\pi}{N}\\sum_k\\delta(\\omega-\\frac{2\\pi k}{N})$']
]},
{t:'p', text:'Every transform in this section is periodic in $\\omega$ with period $2\\pi$ because the time index is discrete. A periodic sequence has discrete spectral coefficients, while an aperiodic sequence has a continuous spectrum. In each case, discreteness in one domain produces periodicity in the other.'},

{t:'h2', num:'A.10', text:'Symbols'},
{t:'table', head:['Symbol','Meaning'], rows:[
 ['$x(t)$, $x[n]$','input signal, continuous and discrete time'],
 ['$y(t)$, $y[n]$','output signal'],
 ['$h(t)$, $h[n]$','impulse response of a linear time-invariant system'],
 ['$\\delta(t)$, $\\delta[n]$','unit impulse'],
 ['$u(t)$, $u[n]$','unit step'],
 ['$E_\\infty$, $P_\\infty$','total energy and average power over all time'],
 ['$T_0$, $N_0$','fundamental period'],
 ['$\\omega_0$','fundamental angular frequency, rad/s or rad/sample'],
 ['$*$','convolution'],
 ['$j$','imaginary unit, $j^{2}=-1$']
]}
];
})();
