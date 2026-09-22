#!/usr/bin/env python3
"""Focused regression tests for the student-facing prose guard."""

import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import content_guard as guard  # noqa: E402


class ContentGuardTests(unittest.TestCase):
    def test_unambiguous_slop_is_hard_failure(self):
        hard, _ = guard.scan_lines(["The method leverages a robust framework."], "fixture")
        self.assertEqual(len(hard), 1)
        self.assertEqual(hard[0][2], "banned AI-slop word")

    def test_context_dependent_word_is_warning_only(self):
        hard, warnings = guard.scan_lines(["The result is simply the ratio of widths."], "fixture")
        self.assertEqual(hard, [])
        self.assertEqual(len(warnings), 1)

    def test_comments_are_not_student_facing_content(self):
        hard, warnings = guard.scan_lines(["/* leverage */ The ratio is in terms of h."], "fixture", True)
        self.assertEqual(hard, [])
        self.assertEqual(len(warnings), 1)


if __name__ == "__main__":
    unittest.main()
