#!/usr/bin/env python3
"""R8: fail on any banned provenance phrase, and on any figure label that is
mathematics written as something other than LaTeX (R7)."""
import re, sys, glob, os
# The list is matched case-insensitively, so a phrase opening a sentence is
# caught as readily as one inside it. Write each pattern in lower case.
BANNED = [
 r'\bpdf\b', r'in this file', r'this document', r'the document shows',
 r'source notes', r'the source\b', r'original notes', r'the lecture notes (state|say|show)',
 r'uploaded document', r'provided material', r'\bredrawn\b',
 r'reconstructed from', r'based on the original', r'verified against',
 # "Check:" and "Cross-check:" are legitimate steps of a worked example (R7).
 # Only the provenance sense is banned, which is the one that names a source.
 r'cross-check\w*\s+(?:against|with)\b',
 r'the audit', r'editorial enhancement', r'\(source\)', r'\bprovenance\b', r'editorially developed', r'ambiguity',
 r'\bledger\b', r'phase 1\b', r'phase 2\b', r'\bv0\.9\b',
 # A page reference is provenance wherever a student can read it: "p. 15",
 # "pp. 6-7", "page 15", "pages 6 and 7".
 r'\bpp?\.\s*\d', r'\bpages?\s+\d',
]
# strings that are legitimately instructor-only or internal are marked with these markers
EXEMPT_MARKERS = ['data-instr', "t:'instr'", 'instr-panel', 'INSTRUCTOR-ONLY']

SRC_FIELD = re.compile(r"""\bsrc\s*:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")""")

def strip_exempt(line, in_block):
    """Blank out what R3 puts outside the student view, so the sweep reads only
       what a student can read. Two things are exempt, by what they are rather
       than by where they sit: the src: field of a scene, a question or a
       laboratory item, which is the traceability record itself, and any
       comment, which never reaches the artifact. A block comment is tracked
       across lines, because its interior carries no marker of its own."""
    out, i, n = [], 0, len(line)
    while i < n:
        if in_block:
            j = line.find('*/', i)
            if j < 0: return ''.join(out), True
            i, in_block = j + 2, False
            continue
        b = line.find('/*', i)
        # a // that follows a colon is a URL scheme, not a comment
        s = i
        while True:
            s = line.find('//', s)
            if s > 0 and line[s-1] == ':': s += 2; continue
            break
        if b >= 0 and (s < 0 or b < s):
            out.append(line[i:b]); i, in_block = b + 2, True
            continue
        if s >= 0:
            out.append(line[i:s]); return ''.join(out), False
        out.append(line[i:]); break
    return ''.join(out), in_block

def scan(path):
    hits, in_block = [], False
    for i, raw in enumerate(open(path, encoding='utf-8'), 1):
        line, in_block = strip_exempt(SRC_FIELD.sub('src:', raw), in_block)
        if any(m in line for m in EXEMPT_MARKERS): continue
        for b in BANNED:
            if re.search(b, line, re.I):
                hits.append((i, b, raw.strip()[:110]))
                break
    return hits

# ---------------------------------------------------------------------------
# R7 figure labels. Every piece of mathematics drawn inside a figure is TeX,
# typeset by texName. The four ways a label reaches a figure are note(), span(),
# an axis name, and a label on a box, an arrow or a free text item in blocks().
# ---------------------------------------------------------------------------
STR = r"'((?:[^'\\]|\\.)*)'"          # one single-quoted JavaScript string
ARG = r"[^,]+,\s*"
LABEL_SITES = [
 ('note',   re.compile(r'\.note\(\s*' + ARG*2 + STR)),
 ('span',   re.compile(r'\.span\(\s*' + ARG*3 + STR)),
 ('xlabel', re.compile(r'xlabel\s*:\s*' + STR)),
 ('ylabel', re.compile(r'ylabel\s*:\s*' + STR)),
 ('block',  re.compile(r"t:'(?:box|text|arrow)'[^\n]*?\blabel\s*:\s*" + STR)),
]
# An axis name is TeX by contract (§7.3); the other three carry tex:true.
ALWAYS_TEX = ('xlabel', 'ylabel')
# Mathematics has no business being spelled with these.
UNICODE_MATH = ('∞', '²', '³', '⁴', 'ⁿ', '₀', '₁', '₂', '₃', 'ₙ', '½', '¼',
                'Σ', 'Π', '∫', '∂', '∇', '√', '−', '±', '×', '÷', '·',
                '≤', '≥', '≈', '≠', '≡', '∝', '⇒', '⇔', '→', '←', '↔', '↦',
                '∈', '∀', '∃', '∞', 'Δ', 'Ω', 'α', 'β', 'γ', 'δ', 'ε', 'θ',
                'λ', 'μ', 'π', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω', 'ˆ', '‖')
# A label stays plain sans-serif only while it is words. These are the marks that
# make it mathematics instead: a function or sequence argument, a relation, a TeX
# token, or a bare symbol standing for a signal or an operator. Ordinary prose
# punctuation is not on the list, so "PATH 1 — combine, then process" and
# "equal?" stay plain, while "x(t)", "T=8", "Ev{x}" and "S" do not.
IS_MATH = re.compile(r'[A-Za-z][\(\[]|[=<>]|[\\^_{}]|^[A-Za-z]$')

def tex_flagged(line, at):
    """tex:true belongs to the option object that follows the label."""
    return 'tex:true' in line[at:] or 'tex: true' in line[at:]

def backslash_runs_odd(s):
    """A TeX backslash survives a JavaScript string only when it is doubled.
       '\\;' is the string ';' and '\\text' is a tab, so an odd run is a lost escape.
       An odd run is legitimate only when it escapes a quote. No figure label
       carries a newline escape, so a lone backslash before n is a lost one too."""
    for m in re.finditer(r'\\+', s):
        if len(m.group()) % 2 == 0: continue
        if s[m.end():m.end()+1] in ("'", '"'): continue
        return True
    return False

def figure_labels(path):
    hits=[]
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        for kind, rx in LABEL_SITES:
            for m in rx.finditer(line):
                lab = m.group(1)
                if not lab: continue
                is_tex = kind in ALWAYS_TEX or tex_flagged(line, m.end())
                def bad(why): hits.append((i, f'{kind}/{why}', lab[:80]))
                for u in UNICODE_MATH:
                    if u in lab:
                        bad(f'unicode {u!r} — write it as LaTeX'); break
                if not is_tex:
                    if IS_MATH.search(lab):
                        bad('mathematics without tex:true')
                    continue
                if backslash_runs_odd(lab):
                    bad('lost backslash — a TeX macro needs \\\\ in a JS string')
                for s in re.finditer(r';', lab):
                    if not re.search(r'\\\\;$', lab[:s.end()]):
                        bad('bare ";" — a lost \\\\; thin space')
                        break
    return hits

# ---------------------------------------------------------------------------
# The textbook anchor. This course's chapter numbers and the textbook's do not
# agree — chapter 5 is the continuous-time transform here and the discrete-time
# one there — so an anchor never reaches a reader as a bare address.
#
# Two shapes are wrong. A section mark of any kind is wrong outright: the
# artifact draws an open book instead and the notes spell `OW`, so a `§` on the
# page is left over from neither. A `CH` followed by a digit is wrong unless the
# `OW` marker stands in front of it, because this course numbers its own
# chapters the same way. Both render without complaint and read as this course's
# own address — the same class of damage as a lost backslash: silent, and wrong.
#
# One line is exempt by name: the sentence that introduces the convention has to
# show the reader the form it is describing.
# ---------------------------------------------------------------------------
MARK    = re.compile(r'(?:§|&sect;)')
CHREF   = re.compile(r'\bCH\s?\d')
ANCHOR_EXEMPT = 'such as <b>CH'

def bare_section_marks(path):
    hits, in_block = [], False
    for i, raw in enumerate(open(path, encoding='utf-8'), 1):
        line, in_block = strip_exempt(SRC_FIELD.sub('src:', raw), in_block)
        if ANCHOR_EXEMPT in line: continue
        if MARK.search(line):
            hits.append((i, 'section mark — the anchor is a book and "CH x.y"', raw.strip()[:110]))
            continue
        for m in CHREF.finditer(line):
            if not re.search(r'\bOW\b(?:</b>)?\s*$', line[:m.start()]):
                hits.append((i, 'textbook reference without its "OW" marker', raw.strip()[:110]))
                break
    return hits

targets = sys.argv[1:] or []
bad = 0
for t in targets:
    for f in (glob.glob(t) if any(c in t for c in '*?') else [t]):
        if not os.path.isfile(f): continue
        m = bare_section_marks(f)
        if m:
            bad += len(m)
            print(f'\n{f}: {len(m)} anchor hit(s)')
            for i, why, s in m[:40]: print(f'  L{i:<5} {why:<46}  {s}')
        h = scan(f)
        if h:
            bad += len(h)
            print(f'\n{f}: {len(h)} hit(s)')
            for i, b, s in h[:40]: print(f'  L{i:<5} /{b}/  {s}')
        g = figure_labels(f)
        if g:
            bad += len(g)
            print(f'\n{f}: {len(g)} figure-label hit(s)')
            for i, why, s in g[:40]: print(f'  L{i:<5} {why:<46}  {s}')
print(f'\nTOTAL VIOLATIONS: {bad}')
sys.exit(1 if bad else 0)
