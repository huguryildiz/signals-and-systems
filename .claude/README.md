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

The tracked `settings.json` enables the small `PreToolUse` guard in `tools/agent_guard.py`
for Claude Code. Codex uses the tracked `.codex/hooks.json` for the same guard.

`reports/` is the only copy of the ambiguity ledger, and it is not in git — back up
the working copy accordingly. The work order stays tracked in
`instructor/PHASE2_HANDOFF.md`; editorial rules R1–R9 live in `rules/content-writing.md`
and `rules/figures-and-math.md`. Current slide-redesign state is in the root `TODO.md`.
