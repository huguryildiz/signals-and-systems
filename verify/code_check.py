#!/usr/bin/env python3
"""Run every code entry that a figure offers (`fig.code`, build/src/7?_code_m*.js)
in MATLAB and in Python, and compare what each prints with the entry's `out`.

Python needs NumPy and Matplotlib; the project venv has neither Matplotlib nor a
need for it, so run this with an interpreter that has both, for example
/usr/bin/python3 on this machine. MATLAB is found through $MATLAB or the usual
macOS install path; if none is found, the MATLAB half is reported as SKIP."""
import glob, json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = sorted(glob.glob(os.path.join(ROOT, 'build', 'src', '7?_code_m*.js')))

def load(path):
    js = ("const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');"
          "const name=src.match(/const (CODE_M\\d+)/)[1];"
          "console.log(JSON.stringify(eval(src+';'+name)));")
    return json.loads(subprocess.check_output(['node', '-e', js, path]))

def matlab_bin():
    if os.environ.get('MATLAB'): return os.environ['MATLAB']
    hits = sorted(glob.glob('/Applications/MATLAB_R*.app/bin/matlab'))
    return hits[-1] if hits else None

P, F, S = [], [], []
def chk(name, got, want):
    ok = got.strip() == want.strip()
    (P if ok else F).append(name)
    print(("PASS  " if ok else "FAIL  ") + name + ("" if ok else f"\n      want: {want!r}\n      got:  {got!r}"))

# Optional arguments name key prefixes; only those entries are run.
ONLY = sys.argv[1:]
ML = matlab_bin()
tmp = tempfile.mkdtemp()
for f in FILES:
    for sid, e in load(f).items():
        if ONLY and not any(sid.startswith(p) for p in ONLY): continue
        r = subprocess.run([sys.executable, '-c', e['py']], capture_output=True, text=True,
                           env=dict(os.environ, MPLBACKEND='Agg'))
        chk(f"{sid} · Python", r.stdout if r.returncode == 0 else r.stderr, e['out'])
        if not ML:
            S.append(sid); print(f"SKIP  {sid} · MATLAB (not found)"); continue
        mf = os.path.join(tmp, 'snippet.m')
        with open(mf, 'w') as h: h.write(e['m'])
        r = subprocess.run([ML, '-batch', f"set(0,'DefaultFigureVisible','off'); run('{mf}')"],
                           capture_output=True, text=True)
        chk(f"{sid} · MATLAB", r.stdout if r.returncode == 0 else r.stdout + r.stderr, e['out'])

print(f"\n{len(P)} passed, {len(F)} failed, {len(S)} skipped")
sys.exit(1 if F else 0)
