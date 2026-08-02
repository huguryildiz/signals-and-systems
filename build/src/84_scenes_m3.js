/* ==========================================================================
   Module 3 — Linear Time-Invariant Systems  [Source: 14–21]
   ========================================================================== */
(function(){
const P = PLOT, C = P.COL;
const disc=(f,a,b)=>{const o=[];for(let n=Math.ceil(a);n<=b;n++)o.push([n,f(n)]);return o;};
const convDT=(x,h,n,lo,hi)=>{let s=0;for(let k=lo;k<=hi;k++)s+=x(k)*h(n-k);return s;};

const SC = [

{ id:'m3-open', module:'M3', nav:'Module 3 opening', title:'Linear Time-Invariant Systems', src:'pp. 14–21',
  dark:true, keywords:'module 3 LTI convolution impulse response overview', steps:0, blocks:[
  {t:'eyebrow', text:'Module 3 · Linear Time-Invariant Systems', src:'pp. 14–21'},
  {t:'title', level:1, text:'Describe an LTI system with one response'},
  {t:'lede', text:'This module develops a direct way to find the output of a linear time-invariant system. Such a system is fully described by its response to one unit impulse. Convolution then uses that response to find the output for any input.'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'raw', html:`<div style="margin-top:20px">
      <div style="font-family:var(--mono);font-size:12.5px;letter-spacing:.14em;color:var(--slate);margin-bottom:10px">THE ENTIRE MODULE, IN TWO LINES</div></div>`},
    {t:'eq', tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]', label:'Convolution sum'},
    {t:'eq', tex:'y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau', label:'Convolution integral'},
    {t:'note', kind:'err', head:'Check the system before using convolution', html:'<span style="color:var(--graphite)">Convolution gives the system output only when the system is linear and time invariant. If either property fails, the convolution result is not the output of that system.</span>'}
  ], right:[
    {t:'fig', svg:()=>{
      const a=P.Axes({w:760,h:430,xr:[-1,9],yr:[-0.4,2.4],grid:false,zeroAxes:false,arrows:false,
        pad:{l:20,r:20,t:20,b:20},xticksOverride:[],yticksOverride:[]});
      a.stem(disc(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,9),{color:'#7FC3CE',r:5,width:2.2});
      a.stem(disc(n=>(n>=0&&n<=4)?[1,3,3,3,2][n]*0.5:0,-1,9),{color:'#8FBF8A',r:5,width:2.2});
      return a.svg(); }}
  ]}
]},

{ id:'m3-impulse', module:'M3', nav:'Impulse response', title:'The impulse response', src:'p. 14',
  objective:'Define h and explain why one experiment can characterise a whole system.',
  keywords:'impulse response h[n] h(t) unit impulse characterisation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Foundation', src:'p. 14'},
  {t:'title', text:'One experiment, one function'},
  {t:'cols', ratio:'c-5-7', vcenter:true, left:[
    {t:'note', kind:'def', head:'Definition', html:'The <b>impulse response</b> is the response of the system to a unit impulse:<br>$x[n]=\\delta[n]\\;\\to\\;S\\;\\to\\;y[n]={{sym:ht|h[n]}}$.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'For a general system, this experiment gives only one input-output pair. It does not determine the response to another input.'},
      {t:'note', kind:'ok', head:'Why one response is enough for an LTI system', html:'Time invariance gives the response to every shifted impulse. Linearity gives the response to every weighted sum of those impulses. Module 1 showed that every discrete-time signal can be written as such a sum. Therefore $h[n]$ determines the response to every input.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'How an impulse response is measured', html:'An ideal impulse cannot be produced physically. In practice, measure $h$ with a short pulse, differentiate a measured step response, or use a broadband test sequence. These methods use linearity to estimate the response that an ideal impulse would produce.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:220,items:[
      {t:'arrow',x1:90,y1:110,x2:300,y2:110},{t:'box',x:300,y:70,w:190,h:80,label:'S',tex:true},
      {t:'arrow',x1:490,y1:110,x2:700,y2:110},
      {t:'text',x:195,y:92,label:'x[n]=\\delta[n]',tex:true,fs:17,color:'#14707F'},
      {t:'text',x:195,y:132,label:'unit impulse',fs:12},
      {t:'text',x:600,y:92,label:'y[n]=h[n]',tex:true,fs:17,color:'#C08422'},
      {t:'text',x:600,y:132,label:'impulse response',fs:12}
    ]}), caption:'Apply a unit impulse and record the output $h[n]$. For an LTI system, this function determines every other output.'},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'20px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:520,h:220,xr:[-2,7],yr:[-0.3,1.35],xlabel:'n',pad:{l:46,r:22,t:18,b:32},xtarget:6,ytarget:2});
          a.stem(disc(n=>n===0?1:0,-2,7),{color:C.in}); a.note(6.6,1.16,'\\delta[n]',{anchor:'end',color:C.in,fs:15,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:520,h:220,xr:[-2,7],yr:[-0.3,1.35],xlabel:'n',pad:{l:46,r:22,t:18,b:32},xtarget:6,ytarget:2});
          a.stem(disc(n=>n>=0?Math.pow(0.72,n):0,-2,7),{color:C.h}); a.note(6.6,1.16,'h[n]',{anchor:'end',color:C.h,fs:15,tex:true}); return a.svg(); }}]
      ]}]}
  ]}
]},

{ id:'m3-representation', module:'M3', nav:'Representation property', title:'Every signal is a sum of impulses', src:'pp. 14–15',
  objective:'Derive the representation property from the sampling property.',
  keywords:'representation property weighted shifted impulses sum delta', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Derivation, step 1 of 2', src:'pp. 14–15'},
  {t:'title', text:'Write a signal as shifted impulses'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'Start from the sampling property of Module 1 and write it out for every shift:'},
    {t:'eq', size:'sm', tex:'\\begin{aligned} x[n]\\delta[n+1]&=x[-1]\\delta[n+1]\\\\ x[n]\\delta[n]&=x[0]\\delta[n]\\\\ x[n]\\delta[n-1]&=x[1]\\delta[n-1]\\\\ x[n]\\delta[n-2]&=x[2]\\delta[n-2] \\end{aligned}',
      label:'Sampling, applied at every shift'},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'\\sum_{k}\\;:\\qquad x[n]\\underbrace{\\left(\\sum_{k=-\\infty}^{\\infty}\\delta[n-k]\\right)}_{=\\,1\\ \\text{for every }n}=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]',
        note:'The bracket equals 1 for every $n$ because exactly one term in the sum is non-zero — the one with $k=n$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', key:true, size:'lg', tex:'x[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,\\delta[n-k]', label:'Representation property',
        note:'Any $x[n]$ can be expressed as a sum of <b>weighted and shifted impulses</b>. The weights are the sample values themselves.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'def', head:'Keep the two indices separate', html:'$n$ is the time index of the resulting signal. $k$ is the summation index that labels each shift. Keep these roles separate when you form the convolution sum, because $k$ changes inside the sum while $n$ selects the output sample.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const x=n=>(n>=0&&n<=3)?[1,2,1,2][n]:0;
      const a=P.Axes({w:820,h:250,xr:[-2,6],yr:[-0.3,2.5],xlabel:'n',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:3});
      a.stem(disc(x,-2,6),{color:C.in}); a.note(5.6,2.25,'x[n]',{anchor:'end',color:C.in,fs:15,tex:true});
      return a.svg(); }},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:2, gap:'12px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:180,xr:[-2,6],yr:[-0.3,2.5],xlabel:'n',pad:{l:42,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n===0?1:0,-2,6),{color:C.mid}); a.note(5.6,2.1,'1\\cdot\\delta[n]',{anchor:'end',color:C.mid,fs:13,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:180,xr:[-2,6],yr:[-0.3,2.5],xlabel:'n',pad:{l:42,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n===1?2:0,-2,6),{color:C.mid}); a.note(5.6,2.1,'2\\cdot\\delta[n-1]',{anchor:'end',color:C.mid,fs:13,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:180,xr:[-2,6],yr:[-0.3,2.5],xlabel:'n',pad:{l:42,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n===2?1:0,-2,6),{color:C.mid}); a.note(5.6,2.1,'1\\cdot\\delta[n-2]',{anchor:'end',color:C.mid,fs:13,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:420,h:180,xr:[-2,6],yr:[-0.3,2.5],xlabel:'n',pad:{l:42,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n===3?2:0,-2,6),{color:C.mid}); a.note(5.6,2.1,'2\\cdot\\delta[n-3]',{anchor:'end',color:C.mid,fs:13,tex:true}); return a.svg(); }}]
      ]},
      {t:'small', html:'The four components sum, sample by sample, to the signal above.'}]}
  ]}
]},

{ id:'m3-convsum', module:'M3', nav:'The convolution sum', title:'Deriving the convolution sum', src:'p. 15',
  objective:'Give the three-line LTI derivation and name where each property is used.',
  keywords:'convolution sum derivation linearity time invariance equivalent forms', steps:4, blocks:[
  {t:'eyebrow', text:'Module 3 · Derivation, step 2 of 2', src:'p. 15'},
  {t:'title', text:'Use the LTI properties to derive convolution'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Start','$x[n]=\\displaystyle\\sum_{k}x[k]\\delta[n-k]\\;\\to\\;S\\;\\to\\;y[n]=\\;?$']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Use time invariance', html:'$\\delta[n]\\to h[n]$, so $\\delta[n-k]\\to h[n-k]$. A shifted impulse gives the shifted impulse response.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Use linearity (homogeneity)', html:'$x[k]$ is a <b>constant</b> with respect to $n$, so $x[k]\\delta[n-k]\\to x[k]h[n-k]$.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'ok', head:'Use linearity (additivity)', html:'The response to the sum is the sum of the responses.'},
      {t:'eq', key:true, size:'lg', tex:'y[n]=\\sum_{k=-\\infty}^{\\infty}x[k]\\,h[n-k]\\;=\\;x[n]*h[n]',
        label:'Convolution sum', note:'{{sym:conv|$*$}} denotes the convolution operator.'}]},
    {t:'reveal', at:4, items:[
      {t:'eq', size:'sm', tex:'\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]\\;\\overset{m=n-k}{=}\\;\\sum_{m=-\\infty}^{\\infty}x[n-m]h[m]\\;=\\;\\sum_{k=-\\infty}^{\\infty}x[n-k]h[k]',
        label:'Equivalent form', note:'Replace the summation index by $m=n-k$. The two forms show that either factor may be chosen as the shifted and reversed signal.'},
      {t:'note', kind:'err', head:'Why the LTI condition is required', html:'The derivation uses time invariance to shift $h$ and linearity to scale and add the responses. If either property fails, this derivation does not apply.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:400,items:[
      {t:'text',x:60,y:36,label:'\\delta[n]',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:130,y1:30,x2:300,y2:30},{t:'box',x:300,y:8,w:110,h:44,label:'S',tex:true},
      {t:'arrow',x1:410,y1:30,x2:560,y2:30},
      {t:'text',x:620,y:36,label:'h[n]',anchor:'start',tex:true,fs:16,color:'#C08422'},
      {t:'text',x:60,y:126,label:'\\delta[n-k]',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:160,y1:120,x2:300,y2:120},{t:'box',x:300,y:98,w:110,h:44,label:'S',tex:true},
      {t:'arrow',x1:410,y1:120,x2:560,y2:120},
      {t:'text',x:620,y:126,label:'h[n-k]',anchor:'start',tex:true,fs:16,color:'#C08422'},
      {t:'text',x:355,y:88,label:'time invariance',fs:12,color:C.slate},
      {t:'text',x:60,y:226,label:'x[k]\\cdot\\delta[n-k]',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:200,y1:220,x2:300,y2:220},{t:'box',x:300,y:198,w:110,h:44,label:'S',tex:true},
      {t:'arrow',x1:410,y1:220,x2:560,y2:220},
      {t:'text',x:620,y:226,label:'x[k]\\cdot h[n-k]',anchor:'start',tex:true,fs:16,color:'#C08422'},
      {t:'text',x:355,y:188,label:'homogeneity',fs:12,color:C.slate},
      {t:'text',x:60,y:336,label:'\\sum_k x[k]\\delta[n-k]',anchor:'start',tex:true,fs:16,color:'#14707F'},
      {t:'arrow',x1:220,y1:330,x2:300,y2:330},{t:'box',x:300,y:308,w:110,h:44,label:'S',tex:true},
      {t:'arrow',x1:410,y1:330,x2:560,y2:330},
      {t:'text',x:620,y:336,label:'\\sum_k x[k]h[n-k]',anchor:'start',tex:true,fs:16,color:'#4A7A46'},
      {t:'text',x:355,y:298,label:'additivity',fs:12,color:C.slate},
      {t:'line',d:'M40 260 h740',color:C.rule}
    ]}), caption:'The diagram shows the complete derivation. Each row applies one property, in the order shown.'}
  ]}
]},

{ id:'m3-steps', module:'M3', nav:'Flip, shift, multiply, add', title:'The four mechanical steps', src:'p. 15',
  objective:'Name the procedure and explain the role of the flip.',
  keywords:'flip shift multiply add steps of convolution procedure correlation', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Procedure', src:'p. 15'},
  {t:'title', text:'Compute convolution in four named moves'},
  {t:'cols', ratio:'c-5-7', vcenter:true, left:[
    {t:'note', kind:'def', head:'Steps of convolution', html:'<b>(1) Flip.</b> Reverse $h[k]$ to obtain $h[-k]$.<br><b>(2) Shift.</b> Displace it by $n$ to obtain $h[n-k]$.<br><b>(3) Multiply and add.</b> Form $x[k]h[n-k]$ and sum over $k$.<br>Repeat for every $n$.'},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'warn', head:'Construct the shifted response in a fixed order', html:'Treat $k$ as the variable in $h[n-k]=h\\bigl(-(k-n)\\bigr)$. First shift $h[k]$ by $n$. Then reverse it in $k$ by using the scale factor $-1$. This is the shift-then-scale procedure from Module 1.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'err', head:'Do not omit the reversal', html:'Using an unreversed $h$ gives $\\sum_k x[k]h[k-n]$. This is the <b>cross-correlation</b> of $x$ and $h$, not their convolution. A symmetric $h$ can hide the error because reversal does not change it. Use an asymmetric example to check the construction.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
      const a=P.Axes({w:820,h:200,xr:[-5,7],yr:[-0.25,1.3],xlabel:'k',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:2});
      a.stem(disc(h,-5,7),{color:C.h}); a.note(6.6,1.14,'h[k]',{anchor:'end',color:C.h,fs:15,tex:true}); return a.svg(); },
      caption:'<b>Given.</b> An asymmetric impulse response. Only an asymmetric one exposes a missing flip.'},
    {t:'fig', frame:true, svg:()=>{
      const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
      const a=P.Axes({w:820,h:200,xr:[-5,7],yr:[-0.25,1.3],xlabel:'k',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:2});
      a.stem(disc(k=>h(-k),-5,7),{color:C.mid}); a.note(6.6,1.14,'h[-k]\\;\\text{— step 1, flip}',{anchor:'end',color:C.mid,fs:15,tex:true}); return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const h=k=>(k>=0&&k<=2)?[1,0.6,0.3][k]:0;
      const a=P.Axes({w:820,h:200,xr:[-5,7],yr:[-0.25,1.3],xlabel:'k',pad:{l:48,r:24,t:18,b:32},xtarget:9,ytarget:2});
      a.stem(disc(k=>h(3-k),-5,7),{color:C.out}); a.vline(3,{color:C.coral});
      a.note(6.6,1.14,'h[n-k]\\;\\text{at }n=3\\;\\text{— step 2, shift}',{anchor:'end',color:C.out,fs:15,tex:true}); return a.svg(); },
      caption:'The reversed response is positioned so that its first sample is at $k=n$. For a causal $h$, its remaining samples lie at $k<n$.'}
  ]}
]},

{ id:'m3-ex-dt1', module:'M3', nav:'Worked example · finite sequences', title:'Worked example — two finite sequences', src:'pp. 15–16',
  objective:'Reproduce the definition example with the superposition method and verify.',
  keywords:'example convolution finite sequences superposition shifted impulse responses', steps:1, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 15–16'},
  {t:'title', text:'Convolution as superposition'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\{1,2,1,2\\}$ for $n=0,1,2,3$;  $h[n]=\\{1,1\\}$ for $n=0,1$. Both zero elsewhere.'],
      ['Find','$y[n]=x[n]*h[n]$; determine and plot.'],
      ['Method','Because $x$ has four non-zero samples, expand the convolution sum into four terms. Each term is a shifted copy of $h$ weighted by the corresponding sample of $x$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'eq', size:'sm', tex:'y[n]=x[0]h[n]+x[1]h[n-1]+x[2]h[n-2]+x[3]h[n-3]=h[n]+2h[n-1]+h[n-2]+2h[n-3]'},
      {t:'small', html:'The expression contains four copies of $h$. Each copy has the delay and weight set by one sample of $x$. The four panels show these terms before they are added.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'6px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:46,r:22,t:14,b:28},xtarget:7,ytarget:2});
        a.stem(disc(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,6),{color:C.in}); a.note(5.6,2.1,'x[n]',{anchor:'end',color:C.in,fs:14,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:170,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:46,r:22,t:14,b:28},xtarget:7,ytarget:2});
        a.stem(disc(n=>(n>=0&&n<=1)?1:0,-1,6),{color:C.h}); a.note(5.6,2.1,'h[n]',{anchor:'end',color:C.h,fs:14,tex:true}); return a.svg(); }}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'grid', cols:2, gap:'8px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
          a.stem(disc(n=>(n>=0&&n<=1)?1:0,-1,6),{color:C.mid,r:3}); a.note(5.6,2.0,'h[n]',{anchor:'end',color:C.mid,fs:12,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
          a.stem(disc(n=>(n>=1&&n<=2)?2:0,-1,6),{color:C.mid,r:3}); a.note(5.6,2.0,'2h[n-1]',{anchor:'end',color:C.mid,fs:12,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
          a.stem(disc(n=>(n>=2&&n<=3)?1:0,-1,6),{color:C.mid,r:3}); a.note(5.6,2.0,'h[n-2]',{anchor:'end',color:C.mid,fs:12,tex:true}); return a.svg(); }}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
          a.stem(disc(n=>(n>=3&&n<=4)?2:0,-1,6),{color:C.mid,r:3}); a.note(5.6,2.0,'2h[n-3]',{anchor:'end',color:C.mid,fs:12,tex:true}); return a.svg(); }}]
      ]}]}
  ]}
]},

{ id:'m3-ex-dt1-b', module:'M3', nav:'Worked example · adding the copies', title:'Worked example — adding the four copies', src:'pp. 15–16',
  objective:'Add the shifted impulse responses and check the result two ways.',
  keywords:'convolution superposition sum support length moving sum commutativity', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 15–16'},
  {t:'title', text:'Adding the copies, and checking the answer'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\{1,2,1,2\\}$ on $n=0,\\dots,3$ and $h[n]=\\{1,1\\}$ on $n=0,1$.'],
      ['Find','$y[n]=x[n]*h[n]$.'],
      ['Method','The previous step wrote $y[n]$ as $h[n]+2h[n-1]+h[n-2]+2h[n-3]$. Add these four shifted copies at each value of $n$.']
    ]},
    {t:'eq', key:true, tex:'y[n]=\\delta[n]+3\\delta[n-1]+3\\delta[n-2]+3\\delta[n-3]+2\\delta[n-4]',
      label:'Solution', note:'That is $y=\\{1,3,3,3,2\\}$ on $n=0,\\dots,4$.'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Check 1','<b>Support.</b> $[0,3]+[0,1]=[0,4]$, a length of $4+2-1=5$ samples ✓'],
        ['Check 2','<b>Sum.</b> $\\sum y=12$, and $(\\sum x)(\\sum h)=6\\cdot2=12$ ✓'],
        ['Interpretation','$h=\\{1,1\\}$ forms a two-point moving sum. Each output sample is the sum of two adjacent input samples. This gives $1$, $1+2$, $2+1$, $1+2$, $2$, which matches the result.']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Exercise', html:'Verify the result with the equivalent form $y[n]=\\sum_k h[k]x[n-k]$, which reverses $x$ instead of $h$. Commutativity requires both forms to give the same output.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:240,xr:[-1,6],yr:[-0.4,3.8],xlabel:'n',ylabel:'y[n]',pad:{l:54,r:22,t:28,b:32},xtarget:7,ytarget:3});
      a.stem(disc(n=>(n>=0&&n<=4)?[1,3,3,3,2][n]:0,-1,6),{color:C.out});
      return a.svg(); },
      caption:'The four shifted copies add, sample by sample, to $y=\\{1,3,3,3,2\\}$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:200,xr:[-1,6],yr:[-0.3,2.4],xlabel:'n',ylabel:'x[n]',pad:{l:54,r:22,t:26,b:30},xtarget:7,ytarget:2});
        a.stem(disc(n=>(n>=0&&n<=3)?[1,2,1,2][n]:0,-1,6),{color:C.in});
        return a.svg(); },
        caption:'The input again, for the moving-sum reading: adjacent pairs of these samples are the output samples.'}]}
  ]}
]},

{ id:'m3-ex-dt2', module:'M3', nav:'Worked example · geometric', title:'Worked example — an infinite-length case', src:'pp. 16–17',
  objective:'Work the geometric example, including the case split and the series condition.',
  keywords:'geometric series convolution u[n] (1/2)^n case split limit', steps:4, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 16–17'},
  {t:'title', text:'When the overlap never ends'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x[n]=\\left(\\tfrac12\\right)^{n}u[n]$ and $h[n]=u[n]$.'],
      ['Find','$y[n]=x[n]*h[n]$; determine and plot.'],
      ['Method','Use $y[n]=\\sum_k x[k]h[n-k]$ because the support conditions give the limits directly. Build $h[n-k]$ by shifting and reversing $h$: it is 1 for $k\\le n$. Then split the calculation according to the sign of $n$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Case I · n negative', html:'Take $n<0$. Then $x[k]$ lives on $k\\ge0$, $h[n-k]$ on $k\\le n<0$. The two supports do not overlap, so every product is zero:<br>$y[n]=0$ for $n<0$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Case II · n zero or positive', html:'Take $n\\ge0$. The overlap is $0\\le k\\le n$, so $\\displaystyle y[n]=\\sum_{k=0}^{n}\\left(\\tfrac12\\right)^{k}$.'},
      {t:'eq', size:'sm', tex:'\\sum_{k=m}^{n}a\\,r^{k}=\\frac{a\\bigl(r^{m}-r^{n+1}\\bigr)}{1-r}',
        label:'Finite geometric sum',
        note:'The finite sum requires only $r\\neq1$. The condition $|r|<1$ is needed only for the <em>infinite</em> sum.'},
      {t:'eq', key:true, tex:'y[n]=\\left(2-\\left(\\tfrac12\\right)^{n}\\right)u[n]', label:'Solution'}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Sanity check 1','$y[0]=2-1=1$, and directly $y[0]=x[0]h[0]=1$. ✓'],
        ['Sanity check 2','As $n\\to\\infty$, $y[n]\\to2=\\sum_{k\\ge0}(1/2)^{k}$, so the accumulator has summed the entire input. ✓'],
        ['Interpretation','$h[n]=u[n]$ is the accumulator from Module 2, so convolution with it forms the running sum of the input. This input is absolutely summable, so its running sum converges. The accumulator is still not BIBO stable: stability requires a bounded output for every bounded input, not only for this input.']
      ]}]}
  ], right:[
    {t:'grid', cols:1, gap:'6px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-2,11],yr:[-0.2,1.3],xlabel:'n',pad:{l:46,r:22,t:14,b:28},xtarget:7,ytarget:2});
        a.stem(disc(n=>n>=0?Math.pow(0.5,n):0,-2,11),{color:C.in}); a.note(10.6,1.14,'x[n]',{anchor:'end',color:C.in,fs:14,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-2,11],yr:[-0.2,1.3],xlabel:'n',pad:{l:46,r:22,t:14,b:28},xtarget:7,ytarget:2});
        a.stem(disc(n=>n>=0?1:0,-2,11),{color:C.h}); a.note(10.6,1.14,'h[n]=u[n]',{anchor:'end',color:C.h,fs:14,tex:true}); return a.svg(); }}]
    ]},
    {t:'reveal', at:3, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:250,xr:[-2,11],yr:[-0.2,2.4],xlabel:'n',pad:{l:48,r:22,t:18,b:32},xtarget:7,ytarget:3});
        a.stem(disc(n=>n>=0?2-Math.pow(0.5,n):0,-2,11),{color:C.out});
        a.hline(2,{color:C.coral,dash:'3 5'});
        a.note(10.6,2.18,'y[n]\\to 2',{anchor:'end',color:C.coral,fs:15,tex:true});
        return a.svg(); },
        caption:'The running sum climbs to 2, the total of all the input samples.'}]}
  ]}
]},

{ id:'m3-convint', module:'M3', nav:'The convolution integral', title:'The convolution integral', src:'pp. 17–18',
  objective:'Transfer the derivation to continuous time.',
  keywords:'convolution integral continuous time sifting delta even', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Continuous time', src:'pp. 17–18'},
  {t:'title', text:'The same argument, with an integral'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:'The continuous-time derivation serves the same purpose as the discrete-time derivation: it writes the input as shifted impulses before applying the LTI properties. Start with the sifting property and exchange the variable names:'},
    {t:'eq', size:'sm', tex:'x(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(\\tau-t)\\,\\d\\tau=\\int_{-\\infty}^{\\infty}x(\\tau)\\,\\delta(t-\\tau)\\,\\d\\tau',
      note:'The last step uses $\\delta(t)=\\delta(-t)$: the impulse is an even distribution.'},
    {t:'reveal', at:1, items:[
      {t:'body', html:'This is the continuous-time representation property. It expresses $x$ as continuously indexed weighted impulses. Apply time invariance, homogeneity, and additivity in the same order as in the discrete-time derivation:'},
      {t:'eq', key:true, size:'lg', tex:'y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,\\d\\tau\\;=\\;x(t)*h(t)',
        label:'Convolution integral'},
      {t:'eq', tex:'y(t)=\\int_{-\\infty}^{\\infty}h(\\tau)\\,x(t-\\tau)\\,\\d\\tau', label:'Equivalent form',
        note:'This equivalent form follows by changing the integration variable. Choose the form that makes the support conditions easier to write.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'warn', head:'Build the reversed and shifted response explicitly', html:'Use $\\tau$ as the variable in $h(t-\\tau)$. Apply the shift first and the reversal second. For example, first form $v(t)=\\delta(t+5)$ and then form $y(t)=v(-t)=\\delta(-t+5)$. The result is an impulse at $t=5$. Writing these two moves prevents a sign error in the integration limits.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:230,xr:[-8,8],yr:[-0.25,1.35],xlabel:'t',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.impulse(-5,1,{color:C.mid,labelText:'1'});
      a.note(-5,1.22,'v(t)=\\delta(t+5)',{anchor:'middle',color:C.mid,fs:14,tex:true});
      return a.svg(); }},
    {t:'fig', frame:true, svg:()=>{
      const a=P.Axes({w:820,h:230,xr:[-8,8],yr:[-0.25,1.35],xlabel:'t',pad:{l:48,r:24,t:20,b:34},xtarget:9,ytarget:2});
      a.impulse(5,1,{color:C.out,labelText:'1'});
      a.note(5,1.22,'y(t)=v(-t)=\\delta(-t+5)',{anchor:'middle',color:C.out,fs:14,tex:true});
      return a.svg(); },
      caption:'The impulse ends up at $t=+5$, not $t=-5$.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:820,h:250,xr:[-1,7],yr:[-0.15,1.2],xlabel:'\\tau',pad:{l:48,r:24,t:20,b:34},xtarget:8,ytarget:2});
        const x=t=>(t>0&&t<4)?0.9*Math.exp(-0.4*t)*(1-Math.exp(-3*t)):0;
        a.curve(x,{color:C.in});
        [0.6,1.4,2.2,3.0].forEach(t0=>a.impulse(t0,x(t0),{color:C.coral,label:false,width:1.5}));
        a.note(6.6,1.05,'x(\\tau)\\;\\text{as a continuum of impulses}',{anchor:'end',color:C.muted,fs:14,tex:true});
        return a.svg(); },
        caption:'The continuous-time representation property, illustrated. Each impulse carries the weight $x(\\tau)\\d\\tau$. The system responds to each one with $h(t-\\tau)$, and the integral adds those responses.'}]}
  ]}
]},

{ id:'m3-ex-ct1', module:'M3', nav:'Worked example · CT case split', title:'Worked example — a two-case convolution', src:'pp. 18–19',
  objective:'Set up the exponential/step example and read the limits of both cases off the overlap.',
  keywords:'continuous convolution example e^{2t}u(-t) u(t-3) cases limits', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 18–19'},
  {t:'title', text:'Reading the limits off the overlap'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.'],
      ['Find','$y(t)=x(t)*h(t)$; determine and plot.'],
      ['Method','Use $y(t)=\\int x(\\tau)h(t-\\tau)\\d\\tau$ because the two support conditions give the integration limit. Here $x(\\tau)$ is non-zero for $\\tau\\le0$, and $h(t-\\tau)=u(t-\\tau-3)$ is non-zero for $\\tau\\le t-3$. Their overlap ends at $\\min(0,\\,t-3)$, so the active upper limit changes at $t=3$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Case I · before 3 seconds', html:'Here $t<3$, so $t-3<0$ and the binding limit is $t-3$:<br>$y(t)=\\displaystyle\\int_{-\\infty}^{t-3}e^{2\\tau}\\,\\d\\tau=\\left[\\tfrac12 e^{2\\tau}\\right]_{-\\infty}^{t-3}=\\tfrac12 e^{2(t-3)}$.'}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'def', head:'Case II · after 3 seconds', html:'Here $t>3$, so the binding limit is 0 and the whole of $x$ is covered:<br>$y(t)=\\displaystyle\\int_{-\\infty}^{0}e^{2\\tau}\\,\\d\\tau=\\tfrac12$.'}]}
  ], right:[
    {t:'grid', cols:1, gap:'6px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:150,xr:[-6,8],yr:[-0.1,1.2],xlabel:'t',pad:{l:48,r:22,t:14,b:28},xtarget:8,ytarget:2});
        a.curve(t=>t<=0?Math.exp(2*t):0,{color:C.in}); a.note(7.6,1.05,'x(t)',{anchor:'end',color:C.in,fs:14,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:150,xr:[-6,8],yr:[-0.1,1.2],xlabel:'t',pad:{l:48,r:22,t:14,b:28},xtarget:8,ytarget:2});
        a.curve(t=>t>=3?1:0,{color:C.h}); a.note(2.7,0.55,'h(t)=u(t-3)',{anchor:'end',color:C.h,fs:14,tex:true}); return a.svg(); }}]
    ]},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:166,xr:[-6,8],yr:[-0.1,1.25],xlabel:'\\tau',pad:{l:46,r:20,t:14,b:28},xtarget:8,ytarget:2});
        const t=1.2;
        a.area(τ=>τ<=Math.min(0,t-3)?Math.exp(2*τ):0,-6,Math.min(0,t-3),{color:'rgba(20,112,127,.2)'});
        a.curve(τ=>τ<=0?Math.exp(2*τ):0,{color:C.in});
        a.curve(τ=>τ<=t-3?1:0,{color:C.h});
        a.vline(t-3,{color:C.coral});
        a.note(t-3-0.18,1.14,'\\tau=t-3',{anchor:'end',color:C.coral,fs:13,tex:true});
        a.note(7.6,1.05,'\\text{Case I}:\\;t<3',{anchor:'end',color:C.muted,fs:14,tex:true});
        return a.svg(); },
        caption:'Case I. The shaded area ends at $\\tau=t-3$, left of the origin.'}]},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:166,xr:[-6,8],yr:[-0.1,1.25],xlabel:'\\tau',pad:{l:46,r:20,t:14,b:28},xtarget:8,ytarget:2});
        const t=5.5;
        a.area(τ=>τ<=0?Math.exp(2*τ):0,-6,0,{color:'rgba(74,122,70,.2)'});
        a.curve(τ=>τ<=0?Math.exp(2*τ):0,{color:C.in});
        a.curve(τ=>τ<=t-3?1:0,{color:C.h});
        a.vline(t-3,{color:C.coral});
        a.note(7.6,1.05,'\\text{Case II}:\\;t>3',{anchor:'end',color:C.muted,fs:14,tex:true});
        return a.svg(); },
        caption:'Case II. The step has passed the whole of $x$, so the area stops growing.'}]}
  ]}
]},

{ id:'m3-ex-ct1-b', module:'M3', nav:'Worked example · the two branches', title:'Worked example — assembling the two branches', src:'pp. 18–19',
  objective:'Assemble the two cases into one answer and check it three ways.',
  keywords:'continuous convolution example solution continuity final value delayed integrator', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 18–19'},
  {t:'title', text:'One answer, three checks'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=e^{2t}u(-t)$ and $h(t)=u(t-3)$.'],
      ['Find','Combine the two convolution cases into one expression for $y(t)$.'],
      ['Method','The overlap ends at $t-3$ for $t<3$ and at $0$ for $t>3$. Use the two integrals already evaluated, then check their common boundary and final value.'],
      ['Role of the reversal','$h(t-\\tau)$ is non-zero for $\\tau\\le t-3$, so its support extends to the left. This condition fixes the side on which the integration interval lies.']
    ]},
    {t:'eq', key:true, tex:'y(t)=\\begin{cases}0.5\\,e^{2(t-3)},& t<3\\\\[2pt] 0.5,& t>3\\end{cases}', label:'Solution'},
    {t:'reveal', at:1, items:[
      {t:'wex', rows:[
        ['Check 1','<b>Continuity.</b> Both branches give $0.5$ at $t=3$. A convolution of bounded, integrable signals cannot jump. ✓'],
        ['Check 2','<b>Final value.</b> $y(\\infty)=\\int_{-\\infty}^{\\infty}x(\\tau)\\d\\tau\\cdot 1=\\tfrac12$, the total area of $x$. ✓'],
        ['Check 3','<b>Growth direction.</b> Below three seconds the answer rises like $e^{2t}$ and above it stays flat. A branch that kept growing after $t=3$ would mean the step was still collecting new area, which it is not. ✓']
      ]}]},
    {t:'reveal', at:2, items:[
      {t:'note', kind:'ok', head:'Interpret the result', html:'Because $h$ is a step delayed to $t=3$, the system integrates the input up to time $t-3$. Before $t=3$, that upper limit moves through the support of $x$, so the output grows. After $t=3$, the integral contains the full support of $x$, so the output remains constant.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:230,xr:[-1,7],yr:[-0.05,0.6],xlabel:'t',ylabel:'y(t)',pad:{l:56,r:22,t:26,b:32},xtarget:8,ytarget:3});
      a.curve(t=>t<3?0.5*Math.exp(2*(t-3)):0.5,{color:C.out});
      a.point(3,0.5,{color:C.coral});
      return a.svg(); },
      caption:'The two branches meet at $t=3$, where both give $0.5$. The marked point is the join, not a jump.'},
    {t:'reveal', at:1, items:[
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:210,xr:[-6,8],yr:[-0.1,1.25],xlabel:'\\tau',pad:{l:50,r:22,t:20,b:30},xtarget:8,ytarget:2});
        a.area(τ=>τ<=0?Math.exp(2*τ):0,-6,0,{color:'rgba(74,122,70,.2)'});
        a.curve(τ=>τ<=0?Math.exp(2*τ):0,{color:C.in});
        a.note(7.6,1.05,'\\text{total area}=\\tfrac12',{anchor:'end',color:C.muted,fs:14,tex:true});
        return a.svg(); },
        caption:'The whole area under $x$ is $\\tfrac12$, which is the value the output settles at.'}]}
  ]}
]},

{ id:'m3-ex-ct2', module:'M3', nav:'Worked example · five cases', title:'Worked example — a five-case convolution', src:'pp. 19–20',
  objective:'Work the rect ∗ ramp example, listing every case boundary and verifying continuity.',
  keywords:'piecewise convolution five cases rectangular ramp boundaries continuity', steps:4, blocks:[
  {t:'eyebrow', text:'Module 3 · Worked example', src:'pp. 19–20'},
  {t:'title', text:'Where the case boundaries come from'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'wex', rows:[
      ['Given','$x(t)=1$ on $0<t<1$ (zero elsewhere);  $h(t)=t$ on $0<t<2$ (zero elsewhere).'],
      ['Find','$y(t)=x(t)*h(t)$; determine and plot.'],
      ['Method','Use $y(t)=\\int h(\\tau)x(t-\\tau)\\d\\tau$. This form reverses the rectangle, whose constant height makes the overlap limits easy to identify. Its support becomes $[t-1,\\,t]$, a window of width 1 that moves across the ramp on $[0,2]$.']
    ]},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'def', head:'Find every case boundary before integrating', html:'The moving window has edges $t-1$ and $t$. The fixed ramp has edges $0$ and $2$. Set each moving edge equal to each fixed edge. This gives $t=0,\\,1,\\,2,\\,3$, which divides the calculation into five cases.'}]},
    {t:'reveal', at:2, items:[
      {t:'wex', rows:[
        ['Case I','For $t<0$ there is no overlap, so $y(t)=0$.'],
        ['Case II','For $0<t<1$: $y(t)=\\displaystyle\\int_{0}^{t}\\tau\\,\\d\\tau=\\tfrac12 t^{2}$.'],
        ['Case III','For $1<t<2$: $y(t)=\\displaystyle\\int_{t-1}^{t}\\tau\\,\\d\\tau=\\tfrac{t^{2}-(t-1)^{2}}{2}=t-\\tfrac12$.'],
        ['Case IV','For $2<t<3$: $y(t)=\\displaystyle\\int_{t-1}^{2}\\tau\\,\\d\\tau=\\tfrac{4-(t-1)^{2}}{2}=-\\tfrac12 t^{2}+t+\\tfrac32$.'],
        ['Case V','For $t>3$ there is no overlap, so $y(t)=0$.']
      ]}]},
    {t:'reveal', at:4, items:[
      {t:'wex', rows:[
        ['Checks','<b>Continuity:</b> $t=1\\to0.5$, $t=2\\to1.5$, $t=3\\to0$, from both sides ✓ &nbsp;·&nbsp; <b>Support:</b> $[0,1]+[0,2]=[0,3]$ ✓ &nbsp;·&nbsp; <b>Area:</b> $\\tfrac16+1+\\tfrac56=2=(\\int x)(\\int h)$ ✓'],
        ['Interpretation','A unit-width rectangle forms a one-second moving integral without normalisation. The output rises quadratically while the overlap grows, changes linearly while the full window lies on the ramp, and falls while the overlap shrinks.']
      ]},
      {t:'instr', head:'Exercise', html:'Repeat with $x(t)=1$ on $0<t<3$ and the same $h$. The window is now <em>wider</em> than the ramp, which changes the middle case. That tests whether the boundary list was understood rather than memorised.'}]}
  ], right:[
    {t:'grid', cols:2, gap:'12px', items:[
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-0.5,3.5],yr:[-0.15,2.3],xlabel:'t',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
        a.curve(t=>(t>0&&t<1)?1:0,{color:C.in}); a.note(3.3,2.0,'x(t)',{anchor:'end',color:C.in,fs:13,tex:true}); return a.svg(); }}],
      [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:410,h:150,xr:[-0.5,3.5],yr:[-0.15,2.3],xlabel:'t',pad:{l:40,r:16,t:12,b:26},xtarget:4,ytarget:2});
        a.curve(t=>(t>0&&t<2)?t:0,{color:C.h}); a.note(3.3,2.0,'h(t)',{anchor:'end',color:C.h,fs:13,tex:true}); return a.svg(); }}]
    ]},
    {t:'reveal', at:2, items:[
      {t:'grid', cols:3, gap:'10px', items:[
        [0.6,'II'],[1.5,'III'],[2.5,'IV']
      ].map(([tv,lab])=>[{t:'fig', frame:true, svg:()=>{
        const a=P.Axes({w:400,h:158,xr:[-1.2,3.6],yr:[-0.2,2.3],xlabel:'\\tau',pad:{l:38,r:14,t:12,b:26},xtarget:4,ytarget:2});
        const lo=Math.max(0,tv-1), hi=Math.min(2,tv);
        if(hi>lo) a.area(τ=>τ,lo,hi,{color:'rgba(190,85,57,.2)'});
        a.curve(τ=>(τ>0&&τ<2)?τ:0,{color:C.h});
        a.curve(τ=>(τ>tv-1&&τ<tv)?1:0,{color:C.in});
        a.note(3.4,2.05,'CASE '+lab,{anchor:'end',color:C.coral,fs:13});
        return a.svg(); }}])},
      ]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, size:'sm',
        tex:'y(t)=\\begin{cases}0,&t<0\\\\ 0.5\\,t^{2},&0<t<1\\\\ t-0.5,&1<t<2\\\\ -0.5\\,t^{2}+t+1.5,&2<t<3\\\\ 0,&t>3\\end{cases}', label:'Solution'},
      {t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:820,h:180,xr:[-0.5,3.5],yr:[-0.15,1.75],xlabel:'t',pad:{l:48,r:20,t:14,b:28},xtarget:5,ytarget:3});
        a.curve(t=> t<0?0 : t<1?0.5*t*t : t<2?t-0.5 : t<3?(-0.5*t*t+t+1.5) : 0,{color:C.out,n:1400});
        [1,2,3].forEach(b=>a.vline(b,{color:C.muted,opacity:.5}));
        a.point(2,1.5,{color:C.coral});
        a.note(3.35,1.6,'y(t)',{anchor:'end',color:C.out,fs:15,tex:true});
        return a.svg(); },
        caption:'The output peaks at $1.5$, and the peak falls at $t=2$.'}]}
  ]}
]},

{ id:'m3-lab-e', module:'M3', nav:'Laboratory E · Convolution', title:'Laboratory E — Graphical Convolution Explorer', src:'pp. 15–20',
  objective:'See flip, shift, multiply and accumulate for four source cases.',
  keywords:'laboratory convolution explorer flip shift multiply overlap', steps:0, blocks:[
  {t:'eyebrow', text:'Interactive laboratory E', src:'pp. 15–20'},
  {t:'title', text:'Convolution, one shift at a time'},
  {t:'lede', text:'This laboratory shows the four convolution examples from the module. Move the shift control. At each position, compare the overlap, the product, and the accumulated output. Note the positions where an overlap edge changes; these are the case boundaries used in the calculation.'},
  {t:'lab', id:'E'}
]},

{ id:'m3-props', module:'M3', nav:'Convolution properties', title:'Properties of convolution', src:'p. 20',
  objective:'State commutativity, distributivity and associativity with their interconnection meanings.',
  keywords:'commutative distributive associative parallel cascade interconnection', steps:3, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'p. 20'},
  {t:'title', text:'Use convolution properties to combine LTI systems'},
  {t:'cols', ratio:'c-5-7', left:[
    {t:'eq', tex:'x[n]*h[n]=h[n]*x[n],\\qquad x(t)*h(t)=h(t)*x(t)', label:'(1) Commutative',
      note:'The two forms are equal, so choose the factor whose reversal gives simpler support conditions. The input and impulse response have different physical roles, but convolution treats them symmetrically.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'x*(h_1+h_2)=x*h_1+x*h_2', label:'(2) Distributive',
        note:'Two systems in <b>parallel</b>, outputs summed, are equivalent to one system with impulse response $h_1+h_2$.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'x*(h_1*h_2)=(x*h_1)*h_2', label:'(3) Associative',
        note:'Two systems in <b>cascade</b> are equivalent to one system with impulse response $h_1*h_2$. Together with commutativity, this means the order of the cascade does not matter. It holds for LTI systems only.'}]},
    {t:'reveal', at:3, items:[
      {t:'note', kind:'err', head:'Do not reorder systems that are not LTI', html:'For example, a saturating amplifier followed by a filter is not generally equivalent to the filter followed by the amplifier. The convolution properties justify reordering only when both systems are linear and time invariant.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:860,h:210,items:[
      {t:'arrow',x1:40,y1:105,x2:140,y2:105},
      {t:'line',d:'M140 105 v-45 h30 M140 105 v45 h30'},
      {t:'box',x:170,y:38,w:120,h:44,label:'h_1',tex:true},{t:'box',x:170,y:128,w:120,h:44,label:'h_2',tex:true},
      {t:'line',d:'M290 60 h60 M290 150 h60'},
      {t:'line',d:'M350 60 v45 M350 150 v-45'},
      {t:'sum',x:365,y:105},
      {t:'arrow',x1:379,y1:105,x2:470,y2:105},
      {t:'text',x:520,y:112,label:'\\equiv',tex:true,fs:26},
      {t:'arrow',x1:560,y1:105,x2:640,y2:105},
      {t:'box',x:640,y:83,w:150,h:44,label:'h_1+h_2',tex:true},
      {t:'arrow',x1:790,y1:105,x2:840,y2:105}
    ]}), caption:'Distributive property: parallel interconnection.'},
    {t:'reveal', at:2, items:[
      {t:'fig', frame:true, svg:()=>P.blocks({w:860,h:150,items:[
        {t:'arrow',x1:40,y1:75,x2:130,y2:75},{t:'box',x:130,y:53,w:110,h:44,label:'h_1',tex:true},
        {t:'arrow',x1:240,y1:75,x2:320,y2:75},{t:'box',x:320,y:53,w:110,h:44,label:'h_2',tex:true},
        {t:'arrow',x1:430,y1:75,x2:500,y2:75},
        {t:'text',x:545,y:82,label:'\\equiv',tex:true,fs:26},
        {t:'arrow',x1:585,y1:75,x2:655,y2:75},
        {t:'box',x:655,y:53,w:150,h:44,label:'h_1*h_2',tex:true},
        {t:'arrow',x1:805,y1:75,x2:850,y2:75}
      ]}), caption:'Associative property: cascade interconnection.'}]}
  ]}
]},

{ id:'m3-lti-props', module:'M3', nav:'LTI property criteria', title:'The six properties, re-expressed in $h$', src:'p. 21',
  objective:'Give the impulse-response criterion for each system property.',
  keywords:'LTI memoryless invertible causal stable absolutely summable integrable criteria', steps:4, blocks:[
  {t:'eyebrow', text:'Module 3 · Properties of LTI systems', src:'p. 21'},
  {t:'title', text:'Test an LTI system by examining its impulse response'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'eq', tex:'h(t)=a\\,\\delta(t)\\quad\\text{or}\\quad h[n]=a\\,\\delta[n],\\qquad a\\in\\mathbb{C}',
      label:'(4) Memoryless ⟺',
        note:'Substitution gives $y[n]=\\sum_k x[k]\\,a\\,\\delta[n-k]=a\\,x[n]$, so the output depends only on the current input. A non-zero value of $h$ away from the origin introduces dependence on another time.'},
    {t:'reveal', at:1, items:[
      {t:'eq', tex:'h(t)*g(t)=\\delta(t)\\quad\\text{or}\\quad h[n]*g[n]=\\delta[n]', label:'(5) Invertible ⟺',
        note:'$g$ is the impulse response of the <b>inverse system</b>, and $\\delta$ is the identity system. The cascade $x\\to h\\to g$ returns $x$ exactly.'}]},
    {t:'reveal', at:2, items:[
      {t:'eq', tex:'h(t)=0\\ \\text{for}\\ t<0\\quad\\text{or}\\quad h[n]=0\\ \\text{for}\\ n<0', label:'(6) Causal ⟺',
        note:'Proof: the sum reduces to $y[n]=\\sum_{k\\ge0}h[k]x[n-k]=h[0]x[n]+h[1]x[n-1]+\\cdots$, which uses the present and the past only.'}]},
    {t:'reveal', at:3, items:[
      {t:'eq', key:true, tex:'\\sum_{k=-\\infty}^{\\infty}\\bigl|h[k]\\bigr|<\\infty\\qquad\\text{or}\\qquad\\int_{-\\infty}^{\\infty}\\bigl|h(t)\\bigr|\\,\\d t<\\infty',
        label:'(7) BIBO stable ⟺', note:'Absolutely summable / absolutely integrable.'},
      {t:'eq', size:'sm', tex:'\\bigl|y[n]\\bigr|=\\Bigl|\\sum_k h[k]x[n-k]\\Bigr|\\;\\le\\;\\sum_k\\bigl|h[k]\\bigr|\\,\\bigl|x[n-k]\\bigr|\\;\\le\\;B\\sum_k\\bigl|h[k]\\bigr|<\\infty',
        label:'Proof of sufficiency', note:'Triangle inequality, then the bound $|x|\\le B$.'}]},
    {t:'reveal', at:4, items:[
      {t:'note', kind:'warn', head:'Separate the two directions of the stability result', html:'The inequality above proves sufficiency: absolute summability implies BIBO stability. For necessity, choose the bounded input $x[n]=\\operatorname{sgn}h[-n]$. It gives $y[0]=\\sum_k|h[k]|$, so BIBO stability requires this sum to be finite.'}]}
  ], right:[
    {t:'fig', frame:true, svg:()=>P.blocks({w:820,h:150,items:[
      {t:'arrow',x1:40,y1:75,x2:150,y2:75},{t:'box',x:150,y:53,w:120,h:44,label:'h[n]',tex:true},
      {t:'arrow',x1:270,y1:75,x2:380,y2:75},{t:'box',x:380,y:53,w:120,h:44,label:'g[n]',tex:true},
      {t:'arrow',x1:500,y1:75,x2:610,y2:75},
      {t:'text',x:95,y:62,label:'x[n]',tex:true,fs:15},{t:'text',x:325,y:62,label:'y[n]',tex:true,fs:15},
      {t:'text',x:660,y:80,label:'x[n]',tex:true,fs:15},
      {t:'text',x:440,y:130,label:'inverse system',fs:12,color:C.slate}
    ]}), caption:'Invertibility as a cascade that reduces to the identity, $h*g=\\delta$.'},
    {t:'reveal', at:3, items:[
      {t:'grid', cols:2, gap:'16px', items:[
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:400,h:200,xr:[-2,10],yr:[-0.25,1.2],xlabel:'n',pad:{l:44,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n>=0?Math.pow(0.7,n):0,-2,10),{color:C.out,r:3}); return a.svg(); },
          caption:'$h[n]=0.7^{\\,n}u[n]$: $\\sum|h|=1/0.3<\\infty$ ⇒ <b>stable</b>, and causal.'}],
        [{t:'fig', frame:true, svg:()=>{ const a=P.Axes({w:400,h:200,xr:[-2,10],yr:[-0.25,1.2],xlabel:'n',pad:{l:44,r:18,t:16,b:30},xtarget:5,ytarget:2});
          a.stem(disc(n=>n>=0?1:0,-2,10),{color:C.err,r:3}); return a.svg(); },
          caption:'$h[n]=u[n]$ (accumulator): $\\sum|h|\\to\\infty$ ⇒ <b>not stable</b>, though still causal.'}]
      ]}]}
  ]}
]},

{ id:'m3-synth', module:'M3', nav:'Module 3 synthesis', title:'Module 3 — what to carry forward', src:'pp. 14–21',
  dark:true, objective:'Consolidate and open the door to the frequency domain.',
  keywords:'synthesis summary module 3 eigenfunction preview convolution checklist', steps:2, blocks:[
  {t:'eyebrow', text:'Module 3 · Synthesis', src:'pp. 14–21'},
  {t:'title', text:'Use one complete convolution procedure'},
  {t:'cols', ratio:'c-6-6', left:[
    {t:'body', html:`<p style="color:var(--graphite)"><b>1.</b> Confirm the system is LTI. Nothing below is valid otherwise.</p>
      <p style="color:var(--graphite)"><b>2.</b> Choose which signal to flip — the simpler one.</p>
      <p style="color:var(--graphite)"><b>3.</b> Write the support of each factor as an inequality in the dummy variable.</p>
      <p style="color:var(--graphite)"><b>4.</b> Equate the moving edges with the fixed edges to list <em>every</em> case boundary before integrating anything.</p>
      <p style="color:var(--graphite)"><b>5.</b> Integrate or sum case by case.</p>
      <p style="color:var(--graphite)"><b>6.</b> Check continuity at each boundary, check that supports add, and check that total area (or total sum) multiplies.</p>`},
    {t:'reveal', at:1, items:[
      {t:'note', kind:'ok', head:'Use each final check for a specific purpose', html:'<span style="color:var(--graphite)">A mismatch at a case boundary indicates an incorrect limit. An incorrect output support indicates an error in a shift, reversal, or support condition. An incorrect total area or sum indicates an error in the integrand or summand.</span>'}]}
  ], right:[
    {t:'raw', html:'<p class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>Where Module 4 begins</p>'},
    {t:'lede', text:'Convolution applies to every input of an LTI system, but piecewise calculations become long. Module 4 therefore asks whether some inputs pass through an LTI system without changing form.'},
    {t:'reveal', at:2, items:[
      {t:'body', html:`<p style="color:var(--graphite)">There is. Put $x(t)=e^{st}$ into the convolution integral:</p>`},
      {t:'eq', plain:true, tex:'y(t)=\\int h(\\tau)e^{s(t-\\tau)}\\d\\tau=e^{st}\\underbrace{\\int h(\\tau)e^{-s\\tau}\\d\\tau}_{\\text{a number, }H(s)}'},
      {t:'body', html:`<p style="color:var(--graphite)">The output has the same form as the input and differs only by the constant $H(s)$. A function with this property is called an <b>eigenfunction</b> of the system. Complex exponentials are eigenfunctions of LTI systems, and Modules 4 to 7 develop the consequences of this result.</p>`}]}
  ]}
]}
];
window.SCENES_M3 = SC;
})();
