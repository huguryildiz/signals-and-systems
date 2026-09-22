"""Behavior checks for the small Claude Code and Codex PreToolUse guard."""

import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GUARD = ROOT / "tools" / "agent_guard.py"


def invoke(tool, tool_input, cwd=ROOT):
    event = {"tool_name": tool, "tool_input": tool_input, "cwd": str(cwd)}
    return subprocess.run(
        [sys.executable, str(GUARD)],
        input=json.dumps(event),
        text=True,
        capture_output=True,
        cwd=str(ROOT),
        check=False,
    )


class AgentGuardTests(unittest.TestCase):
    def test_blocks_npm_install_variants(self):
        for command in ("npm install", "cd build && npm ci", "npm i", "bash -lc 'npm install'"):
            with self.subTest(command=command):
                self.assertEqual(invoke("Bash", {"command": command}).returncode, 2)

    def test_allows_build_and_quoted_mention(self):
        for command in ("cd build && node build.js", "echo 'npm install'"):
            with self.subTest(command=command):
                self.assertEqual(invoke("Bash", {"command": command}).returncode, 0)

    def test_blocks_direct_dist_edit_tools(self):
        for tool in ("Write", "Edit"):
            with self.subTest(tool=tool):
                self.assertEqual(
                    invoke(tool, {"file_path": str(ROOT / "dist" / "Signals_and_Systems.html")}).returncode,
                    2,
                )
        self.assertEqual(invoke("Write", {"file_path": str(ROOT / "build" / "src" / "10_style.css")}).returncode, 0)

    def test_blocks_codex_patch_to_dist(self):
        patch = "*** Begin Patch\n*** Update File: dist/Signals_and_Systems.html\n*** End Patch"
        self.assertEqual(invoke("apply_patch", {"command": patch}).returncode, 2)
        safe = "*** Begin Patch\n*** Update File: build/src/10_style.css\n*** End Patch"
        self.assertEqual(invoke("apply_patch", {"command": safe}).returncode, 0)

    def test_rejects_invalid_json(self):
        result = subprocess.run([sys.executable, str(GUARD)], input="not json", text=True, capture_output=True, check=False)
        self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main()
