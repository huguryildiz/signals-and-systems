# Local working area

Most of this working area stays outside git. Selected instruction and routing files,
including the slide kickoff, are tracked; prompts, reports, working plans, and
source-audit records stay local.

| Folder | What goes in it |
|---|---|
| `prompts/` | the production prompt, the paste-in project instructions, delegation briefs |
| `reports/` | instructor-only records: the Phase 1 report and the Phase 2 audit (ambiguity ledger A-01…A-21) |
| `plans/` | session plans, work orders in progress, step-by-step checklists |
| `notes/` | session notes, scratch findings, anything not yet worth a record |
| `reference/` | what `CLAUDE.md` points to: `gates.md` (what each gate covers), `history.md` (how the course reached its state), `archive/` (the full instruction files as they stood on 2026-09-21), and the approved slide mockup |
| `rules/` | path-scoped content, figure, notes/PDF, source-audit, and build instructions; `CLAUDE.md` routes Codex to the relevant file |
| `hooks/` | shared `PreToolUse` and Stop guards, and behavior tests |

The tracked `settings.json` enables Claude Code hooks. The repository's
`.codex/hooks.json` enables the corresponding Codex hooks. Both call the same
`PreToolUse` guard in `hooks/agent_guard.py`; their `PostToolUse` hooks call
`tools/derivation_advisor.py` to list changed mathematics without blocking.
Their Stop hooks call `hooks/stop_guard.py`, which runs the student-facing prose
guard and any remaining derivation reminder. Codex
requires the user to review and trust a new hook definition before it runs.
These agent hooks do not run in CI. Working records remain under `.claude/`.

`reports/` is the only copy of the ambiguity ledger, and it is not in git — back up
the working copy accordingly. The work order stays tracked in
`instructor/PHASE2_HANDOFF.md`; editorial rules R1–R9 live in `rules/content-writing.md`
and `rules/figures-and-math.md`. Current slide-redesign state is in the root `TODO.md`.
