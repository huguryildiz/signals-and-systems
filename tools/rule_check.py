#!/usr/bin/env python3
"""R8: fail on any banned provenance phrase in student-facing content."""
import re, sys, glob, os
BANNED = [
 r'\bPDF\b', r'\bpdf\b', r'in this file', r'this document', r'the document shows',
 r'source notes', r'the source\b', r'original notes', r'the lecture notes (state|say|show)',
 r'uploaded document', r'provided material', r'\bRedrawn\b', r'\bredrawn\b',
 r'reconstructed from', r'based on the original', r'verified against', r'cross-check',
 r'the audit', r'editorial enhancement', r'\(source\)', r'\(Source\)', r'\bprovenance\b', r'editorially developed', r'ambiguity',
 r'\bledger\b', r'Phase 1', r'Phase 2', r'\bv0\.9\b',
]
# strings that are legitimately instructor-only or internal are marked with these markers
EXEMPT_MARKERS = ['data-instr', "t:'instr'", 'instr-panel', 'INSTRUCTOR-ONLY']
def scan(path):
    hits=[]
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        if any(m in line for m in EXEMPT_MARKERS): continue
        for b in BANNED:
            if re.search(b, line):
                hits.append((i, b, line.strip()[:110]))
                break
    return hits
targets = sys.argv[1:] or []
bad = 0
for t in targets:
    for f in (glob.glob(t) if any(c in t for c in '*?') else [t]):
        if not os.path.isfile(f): continue
        h = scan(f)
        if h:
            bad += len(h)
            print(f'\n{f}: {len(h)} hit(s)')
            for i, b, s in h[:40]: print(f'  L{i:<5} /{b}/  {s}')
print(f'\nTOTAL VIOLATIONS: {bad}')
sys.exit(1 if bad else 0)
