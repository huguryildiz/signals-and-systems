"""Behavior checks for the advisory changed-mathematics hook."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import derivation_advisor as advisor


def git(root, *args):
    return subprocess.run(["git", *args], cwd=root, text=True, capture_output=True, check=True)


class DerivationAdvisorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        git(self.root, "init", "-q")
        git(self.root, "config", "user.name", "Test")
        git(self.root, "config", "user.email", "test@example.invalid")
        source = self.root / "build/src/82_scenes_m1.js"
        source.parent.mkdir(parents=True)
        source.write_text("const scene = {t:'body', html:'Introduction.'};\n", encoding="utf-8")
        git(self.root, "add", ".")
        git(self.root, "commit", "-qm", "baseline")

    def test_changed_math_is_a_candidate_and_plain_prose_is_not(self):
        source = self.root / "build/src/82_scenes_m1.js"
        source.write_text(
            "const scene = {t:'body', html:'Revised introduction.'};\n"
            "const step = {t:'eq', tex:'E=\\\\int_0^1 1\\\\,\\\\d t=1'};\n",
            encoding="utf-8",
        )
        self.assertEqual(
            [(path, line) for path, line, _ in advisor.changed_math(self.root)],
            [("build/src/82_scenes_m1.js", 2)],
        )

    def test_untracked_notes_math_is_included(self):
        source = self.root / "notes/src/c1.js"
        source.parent.mkdir(parents=True)
        source.write_text("{t:'eq', tex:'P=16'}\n", encoding="utf-8")
        self.assertEqual(advisor.changed_math(self.root)[0][:2], ("notes/src/c1.js", 1))

    def test_same_session_is_reminded_once_per_changed_line(self):
        source = self.root / "build/src/82_scenes_m1.js"
        source.write_text("const step = {t:'eq', tex:'P=16'};\n", encoding="utf-8")
        session = "test-derivation-advisor"
        self.assertIn("build/src/82_scenes_m1.js:1", advisor.advisory_message(self.root, session))
        self.assertIsNone(advisor.advisory_message(self.root, session))
        source.write_text("const step = {t:'eq', tex:'P=32'};\n", encoding="utf-8")
        self.assertIn("build/src/82_scenes_m1.js:1", advisor.advisory_message(self.root, session))


if __name__ == "__main__":
    unittest.main()
