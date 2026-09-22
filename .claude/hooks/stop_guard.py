#!/usr/bin/env python3
"""Run the shared prose guard for Claude Code and Codex Stop hooks."""

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GUARD = ROOT / "tools" / "content_guard.py"


def main():
    if not GUARD.is_file():
        print("Content guard is missing: {}".format(GUARD), file=sys.stderr)
        return 2

    result = subprocess.run(
        [sys.executable, str(GUARD), "--source", "--hook"],
        cwd=str(ROOT),
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode:
        print(result.stderr.strip() or "Content guard failed.", file=sys.stderr)
        return 2

    # Both clients accept JSON output; Codex requires it on a successful Stop.
    print(json.dumps({}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
