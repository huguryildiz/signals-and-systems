# Local working area

This folder is ignored by git. Only the agent instructions and guards are tracked:
this README, `settings.json`, `rules/`, and `hooks/`. Everything else is a local
working record and never leaves this machine.

| Folder | Tracked | What goes in it |
|---|---|---|
| `rules/` | yes | path-scoped content, figure, notes/PDF, source-audit, and build instructions; `CLAUDE.md` routes Codex to the relevant file |
| `hooks/` | yes | the shared `PreToolUse` guard, the Stop guard, and their behavior tests |
| `prompts/` | no | the production prompt, the paste-in project instructions, delegation briefs |
| `plans/` | no | session plans, slide-redesign kickoffs and reports, step-by-step checklists |
| `reports/` | no | instructor-only records: the Phase 1 report and the Phase 2 audit (ambiguity ledger A-01…A-21) |
| `audit/` | no | page inventories of the source material and the scripts that build them |
| `specs/` | no | design specs written before a larger change |
| `reference/` | no | `gates.md` (what each gate covers), `derivation-review.md` (the manual derivation checklist), `history.md` (how the course reached its state), `archive/` (earlier instruction files), and the approved slide mockup |
| `notes/` | no | session notes and scratch findings |

The tracked `settings.json` and the repository's `.codex/hooks.json` both run
`hooks/agent_guard.py` before a tool call; it blocks common `npm install` calls
and direct edits to `dist/`. `hooks/stop_guard.py` and `tools/derivation_advisor.py`
are currently not wired to any hook and can be run by hand. Codex requires the user
to review and trust a new hook definition before it runs. These agent hooks do not
run in CI.

`reports/` and `reference/history.md` exist only on this machine; back up the
working copy accordingly. Editorial rules R1–R9 live in `rules/content-writing.md`
and `rules/figures-and-math.md`. Current work and release state are in the root
`TODO.md`, which is also local.
