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
 after:'Commutative, distributive and associative. Supports add. Total areas or total sums multiply.'},
{t:'h2', num:'A.6', text:'Symbols'},
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
