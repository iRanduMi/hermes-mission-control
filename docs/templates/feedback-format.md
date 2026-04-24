# Inter-Agent Feedback Format

## Message Structure
All agent-to-agent messages on task descriptions should follow this format:

```
[<Agent Name>] <Message Type>:
[<TAG>] <content>
[<TAG>] <content>
```

## Tags
| Tag | Purpose |
|-----|---------|
| `[FEEDBACK]` | Specific comments on implementation |
| `[BLOCKERS]` | What's preventing progress |
| `[QUESTIONS]` | Things to clarify before proceeding |
| `[DECISIONS]` | Key decisions made during implementation |
| `[REVIEW]` | Plan or code review findings |
| `[NOTES]` | General implementation notes |

## Example: Implementation Notes
```
[Dex] Implementation Notes:
[FEEDBACK] Added dark mode toggle to header component
[FEEDBACK] Updated CSS variables for theme colors
[DECISIONS] Used CSS variables for theme colors (consistent with V2 design system)
[DECISIONS] Chose to store theme in localStorage vs. server — decided on localStorage for simplicity
[BLOCKERS] None
[QUESTIONS] Should the theme sync across browser tabs?
```

## Example: Plan Review Feedback
```
[Hermes] Plan Review:
[REVIEW] Plan looks solid — ready to implement
[REVIEW] Consider adding error handling for localStorage edge cases
[NOTES] Phase 1 and 2 are clear, Phase 3 needs more detail
```

## Example: Blocker Report
```
[Dex] Blocker Report:
[BLOCKERS] Backend API endpoint not returning expected schema for /api/tasks/{id}
[QUESTIONS] Should I use the PATCH endpoint or create a separate PUT endpoint?
[NOTES] Continuing with current approach while waiting for clarification
```

## Rules
1. Always include agent attribution: `[Hermes]` or `[Dex]`
2. Use one tag per line
3. Keep messages concise and actionable
4. For long-running tasks (>5 message exchanges), move conversation to a separate log file: `docs/logs/<task-slug>.md`
5. Never use plain text without tags — structured format is required
