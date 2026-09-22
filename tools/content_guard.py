#!/usr/bin/env python3
"""R4 student-facing prose guard.

The guard turns the unambiguous part of the no-ai-slop editorial policy into a
deterministic check. It deliberately reports context-dependent style signals as
warnings: technical prose may legitimately contain them.

Use ``--source`` for authored course files, ``--artifacts`` after rebuilding,
and ``--hook`` for the quiet Stop-hook form.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SOURCE_GLOBS = (
    "build/src/80_content_core.js",
    "build/src/81_scenes_m0.js",
    "build/src/82_scenes_m1.js",
    "build/src/83_scenes_m2.js",
    "build/src/84_scenes_m3.js",
    "build/src/85_scenes_m4.js",
    "build/src/86_scenes_m5.js",
    "build/src/87_scenes_m6.js",
    "build/src/88_scenes_m7.js",
    "build/src/91_scenes_end.js",
    "build/src/92_drill_m1.js",
    "build/src/93_drill_m2.js",
    "build/src/94_drill_m3.js",
    "build/src/95_drill_m4.js",
    "build/src/96_drill_m5.js",
    "build/src/97_drill_m6.js",
    "build/src/98_drill_m7.js",
    "build/src/70_labs.js",
    "notes/src/*.js",
)

HARD_RULES = (
    (
        "banned AI-slop word",
        re.compile(
            r"\b(?:delve|foster|leverag\w*|utili[sz]\w*|facilitat\w*|"
            r"empower\w*|streamlin\w*|robust|cutting-edge|paradigm\s+shift|"
            r"game\s+changer|this\s+is\s+huge|this\s+changes\s+everything|"
            r"tapestry|realm|beacon|multifaceted|meticulous|intricate|paramount|"
            r"transformative|elevat\w*|embark\w*|supercharg\w*|harness\w*|"
            r"ever-evolving)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "throat-clearing opener",
        re.compile(
            r"\b(?:here['’]s\s+the\s+thing|here['’]s\s+what\s+i\s+mean|"
            r"let\s+me\s+be\s+clear|i['’]ll\s+be\s+honest|"
            r"the\s+uncomfortable\s+truth\s+is)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "faux-insight setup",
        re.compile(
            r"\b(?:this\s+is\s+the\s+part\s+most\s+people\s+skip|"
            r"what\s+most\s+people\s+get\s+wrong|"
            r"here['’]s\s+what\s+nobody\s+tells\s+you|"
            r"the\s+part\s+everyone\s+misses)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "importance puffery",
        re.compile(
            r"\b(?:stands\s+as\s+a\s+testament|marks\s+a\s+pivotal\s+moment|"
            r"plays\s+a\s+vital\s+role|solidifies\s+its\s+position|"
            r"underscores\s+its\s+significance)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "weasel attribution",
        re.compile(
            r"\b(?:experts\s+agree|industry\s+reports\s+suggest|many\s+argue|"
            r"widely\s+regarded\s+as|studies\s+show)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "rhetorical setup",
        re.compile(r"\b(?:what\s+if\s+i\s+told\s+you|think\s+about\s+it|plot\s+twist)\b", re.IGNORECASE),
    ),
)

WARNING_RULES = (
    (
        "empty phrase; inspect whether it delays the point",
        re.compile(
            r"\b(?:it['’]s\s+worth\s+noting|it['’]s\s+important\s+to\s+note|"
            r"at\s+the\s+end\s+of\s+the\s+day|when\s+it\s+comes\s+to|"
            r"at\s+its\s+core|in\s+today['’]s\s+world|in\s+the\s+age\s+of|"
            r"in\s+the\s+world\s+of|the\s+reality\s+is|the\s+truth\s+is|"
            r"in\s+terms\s+of|with\s+regard\s+to|in\s+order\s+to|"
            r"going\s+forward|in\s+this\s+article|let['’]s\s+dive\s+in)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "empty adverb; inspect whether it adds meaning",
        re.compile(
            r"\b(?:just|literally|honestly|simply|actually|truly|fundamentally|"
            r"importantly|crucially|inherently|inevitably)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "binary contrast; state the positive claim directly where possible",
        re.compile(r"\bnot\s+just\b[^.!?]{0,120}\bbut\b|\bquestion\s+isn['’]t\b", re.IGNORECASE),
    ),
    (
        "superficial -ing clause; state the concrete consequence",
        re.compile(r",\s*(?:highlighting|underscoring|reflecting|showcasing)\b", re.IGNORECASE),
    ),
    (
        "fake-strong verb; prefer a direct verb where possible",
        re.compile(r"\b(?:serves\s+as\s+a|plays\s+the\s+role\s+of)\b", re.IGNORECASE),
    ),
    (
        "summary or dramatic ending; inspect the local sentence",
        re.compile(r"(?:^|[.!?]\s+)(?:in\s+conclusion|ultimately)\b", re.IGNORECASE),
    ),
    (
        "negative listing; state the positive claim directly",
        re.compile(r"\bnot\s+[^.!?]{0,50}[.!?]\s*not\s+[^.!?]{0,50}[.!?]\s*(?:a|an)\s+\w+", re.IGNORECASE),
    ),
)


def iter_source_files(root: Path):
    seen: set[Path] = set()
    for pattern in SOURCE_GLOBS:
        paths = [root / pattern] if "*" not in pattern else sorted(root.glob(pattern))
        for path in paths:
            if path.is_file() and path not in seen:
                seen.add(path)
                yield path


def strip_js_comments(line: str, in_block: bool) -> tuple[str, bool]:
    """Remove comments without treating student-facing comments as content."""
    out: list[str] = []
    i = 0
    while i < len(line):
        if in_block:
            end = line.find("*/", i)
            if end < 0:
                return "".join(out), True
            i, in_block = end + 2, False
            continue

        block = line.find("/*", i)
        slash = line.find("//", i)
        if slash >= 0 and line[max(i, slash - 1):slash] == ":":
            slash = line.find("//", slash + 2)
        if block >= 0 and (slash < 0 or block < slash):
            out.append(line[i:block])
            i, in_block = block + 2, True
            continue
        if slash >= 0:
            out.append(line[i:slash])
            return "".join(out), False
        out.append(line[i:])
        break
    return "".join(out), in_block


def scan_lines(lines, label: str, strip_comments: bool = False):
    hard = []
    warnings = []
    in_block = False
    for number, raw in enumerate(lines, 1):
        line = raw
        if strip_comments:
            line, in_block = strip_js_comments(raw, in_block)
        for name, pattern in HARD_RULES:
            match = pattern.search(line)
            if match:
                hard.append((label, number, name, raw.strip(), match.group(0)))
        for name, pattern in WARNING_RULES:
            match = pattern.search(line)
            if match:
                warnings.append((label, number, name, raw.strip(), match.group(0)))
    return hard, warnings


def scan_sources(root: Path):
    hard = []
    warnings = []
    for path in iter_source_files(root):
        h, w = scan_lines(path.read_text(encoding="utf-8", errors="ignore").splitlines(), str(path.relative_to(root)), True)
        hard.extend(h)
        warnings.extend(w)
    return hard, warnings


def scan_artifacts(root: Path):
    hard = []
    warnings = []
    html = root / "dist/Signals_and_Systems.html"
    if html.is_file():
        h, w = scan_lines(html.read_text(encoding="utf-8", errors="ignore").splitlines(), str(html.relative_to(root)), True)
        hard.extend(h)
        warnings.extend(w)

    pdf = root / "dist/Lecture_Notes.pdf"
    if pdf.is_file():
        try:
            result = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], text=True, capture_output=True, check=True)
        except (OSError, subprocess.CalledProcessError) as exc:
            hard.append((str(pdf.relative_to(root)), 0, "PDF extraction failed", str(exc), "pdftotext"))
        else:
            h, w = scan_lines(result.stdout.splitlines(), str(pdf.relative_to(root)), False)
            hard.extend(h)
            warnings.extend(w)
    return hard, warnings


def print_findings(title: str, findings, stream):
    if not findings:
        return
    print(title, file=stream)
    for path, number, name, line, match in findings:
        location = f"{path}:{number}" if number else path
        print(f"  {location} [{name}] {match!r}: {line[:240]}", file=stream)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", action="store_true", help="scan authored student-facing source")
    parser.add_argument("--artifacts", action="store_true", help="scan generated HTML and PDF")
    parser.add_argument("--hook", action="store_true", help="quiet Stop-hook mode: print only hard failures")
    args = parser.parse_args(argv)

    if not args.source and not args.artifacts:
        args.source = True

    hard = []
    warnings = []
    if args.source:
        h, w = scan_sources(ROOT)
        hard.extend(h)
        warnings.extend(w)
    if args.artifacts:
        h, w = scan_artifacts(ROOT)
        hard.extend(h)
        warnings.extend(w)

    if hard:
        print_findings("CONTENT GUARD: hard failures", hard, sys.stderr)
    if warnings and not args.hook:
        print_findings("CONTENT GUARD: review warnings", warnings, sys.stdout)

    if hard:
        print(f"CONTENT GUARD: FAIL ({len(hard)} hard failure(s))", file=sys.stderr)
        return 1
    if not args.hook:
        print(f"CONTENT GUARD: PASS ({len(warnings)} review warning(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
