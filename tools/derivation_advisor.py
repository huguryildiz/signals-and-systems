#!/usr/bin/env python3
"""Advisory hook for changed course mathematics; never a derivation verdict."""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HUNK = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")
MATH = re.compile(r"\$|\\\\(?:begin|int|sum|frac|dfrac|lim|omega)|\btex\s*:|\bderiv(?:ation|e|ed|ing)\b", re.I)
SOURCE = re.compile(r"^(?:build/src/(?:70_labs|8\d_[^/]+|9\d_[^/]+)\.js|notes/src/[^/]+\.js|instructor/.+\.(?:js|md))$")


def changed_math(root: Path):
    """Return changed authored math lines; generated dist files are excluded."""
    try:
        result = subprocess.run(
            ["git", "-c", "core.quotePath=false", "diff", "--no-ext-diff", "--unified=0", "HEAD", "--", "build/src", "notes/src", "instructor"],
            cwd=root, text=True, capture_output=True, check=True, timeout=5,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return []

    found = []
    path = None
    number = 0
    for line in result.stdout.splitlines():
        if line.startswith("+++ b/"):
            candidate = line[6:]
            path = candidate if SOURCE.fullmatch(candidate) else None
        elif line.startswith("+++ /dev/null"):
            path = None
        elif match := HUNK.match(line):
            number = int(match.group(1))
        elif line.startswith("+") and not line.startswith("+++"):
            content = line[1:]
            if path and MATH.search(content):
                found.append((path, number, content.strip()))
            number += 1
        elif line.startswith(" "):
            number += 1

    # Include untracked authored sources that a new module may introduce.
    try:
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard", "--", "build/src", "notes/src", "instructor"],
            cwd=root, text=True, capture_output=True, check=True, timeout=5,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return found
    for name in untracked.stdout.splitlines():
        if not SOURCE.fullmatch(name):
            continue
        try:
            lines = (root / name).read_text(encoding="utf-8").splitlines()
        except OSError:
            continue
        found.extend((name, i, line.strip()) for i, line in enumerate(lines, 1) if MATH.search(line))
    return found


def advisory_message(root: Path, session_id: str | None = None):
    candidates = changed_math(root)
    if not candidates:
        return None

    if session_id:
        cache_dir = Path(tempfile.gettempdir()) / "signals-and-systems-derivation-advisor"
        cache_name = hashlib.sha256((str(root.resolve()) + ":" + session_id).encode()).hexdigest() + ".json"
        cache = cache_dir / cache_name
        try:
            seen = set(json.loads(cache.read_text(encoding="utf-8")))
        except (OSError, ValueError, TypeError):
            seen = set()
        new = []
        for path, number, content in candidates:
            key = hashlib.sha256((path + "\n" + content).encode()).hexdigest()
            if key not in seen:
                seen.add(key)
                new.append((path, number, content))
        if not new:
            return None
        try:
            cache_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
            temporary = cache.with_suffix(".tmp")
            temporary.write_text(json.dumps(sorted(seen)), encoding="utf-8")
            os.replace(temporary, cache)
        except OSError:
            pass  # A reminder must never block work when the cache is unavailable.
        candidates = new

    locations = ", ".join(f"{path}:{number}" for path, number, _ in candidates[:8])
    extra = f" (+{len(candidates) - 8} more)" if len(candidates) > 8 else ""
    return (
        f"Changed mathematical content needs derivation review: {locations}{extra}. "
        "Follow the governing definition through substitutions, limits or indices, "
        "calculation and algebra; compare the slide sequence with the lecture notes. "
        "This is a candidate list, not a correctness or completeness verdict. "
        "See .claude/reference/derivation-review.md."
    )


def main():
    try:
        event = json.loads(sys.stdin.read() or "{}")
    except (ValueError, OSError):
        event = {}
    session_id = event.get("session_id") if isinstance(event, dict) else None
    message = advisory_message(ROOT, session_id if isinstance(session_id, str) else None)
    print(json.dumps({"systemMessage": message} if message else {}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
