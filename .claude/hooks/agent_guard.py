#!/usr/bin/env python3
"""Small repository PreToolUse guard.

This checks agent tool requests, not manual shell activity or generated build output.
Exit 2 blocks a request in both clients.
"""

import json
import re
import shlex
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
PATCH_PATH = re.compile(r"^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$")
SEPARATORS = {";", "&&", "||", "|", "&", "(", ")", "\n"}
INSTALL_SUBCOMMANDS = {"install", "i", "ci"}
SHELLS = {"bash", "zsh", "sh"}


def is_dist_path(raw_path, cwd):
    if not isinstance(raw_path, str) or not raw_path:
        return False
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = Path(cwd) / candidate
    try:
        candidate.resolve().relative_to(DIST.resolve())
        return True
    except ValueError:
        return False


def command_installs_packages(command):
    if not isinstance(command, str) or not command:
        return False
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|()\n")
        lexer.whitespace = " \t\r"
        lexer.whitespace_split = True
        lexer.commenters = ""
        tokens = list(lexer)
    except ValueError:
        return False

    segment = []
    for token in tokens + [";"]:
        if token in SEPARATORS:
            if segment_installs_packages(segment):
                return True
            segment = []
        else:
            segment.append(token)
    return False


def segment_installs_packages(words):
    words = list(words)
    while words and (re.match(r"^[A-Za-z_][A-Za-z_0-9]*=", words[0]) or words[0] in {"env", "command", "sudo", "exec"}):
        words.pop(0)
    if not words:
        return False

    executable = Path(words[0]).name
    if executable == "npm":
        return any(word in INSTALL_SUBCOMMANDS for word in words[1:])
    if executable in SHELLS:
        for index, word in enumerate(words[1:], 1):
            if word.startswith("-") and "c" in word and index + 1 < len(words):
                return command_installs_packages(words[index + 1])
    return False


def block_reason(event):
    tool = event.get("tool_name")
    tool_input = event.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        return "Invalid tool input for project guard."
    cwd = event.get("cwd") or str(ROOT)

    if tool == "Bash" and command_installs_packages(tool_input.get("command")):
        return "Dependency installation is disabled for this repository; use the vendored dependencies."

    if tool in {"Write", "Edit", "MultiEdit"} and is_dist_path(tool_input.get("file_path"), cwd):
        return "Do not edit dist/ directly; rebuild it from source."

    if tool == "apply_patch":
        patch = tool_input.get("command")
        if isinstance(patch, str):
            for line in patch.splitlines():
                match = PATCH_PATH.match(line)
                if match and is_dist_path(match.group(1).strip(), cwd):
                    return "Do not edit dist/ directly; rebuild it from source."
    return None


def main():
    try:
        event = json.load(sys.stdin)
        if not isinstance(event, dict):
            raise ValueError("Hook input must be a JSON object")
    except (ValueError, json.JSONDecodeError) as error:
        print("Project guard could not read the tool request: {}".format(error), file=sys.stderr)
        return 2

    reason = block_reason(event)
    if reason:
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
