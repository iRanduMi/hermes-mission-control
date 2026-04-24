# Dual Model Agent Profiles for Hermes

> **Date**: 2026-04-23  
> **Status**: Planning  
> **Goal**: Configure two distinct Hermes agent profiles — **hermes** (35B-A3B, default) for fast general chat and **dex** (27B-Dense) for deep technical tasks — each using a different local model on the Strix Halo box with completely isolated Telegram sessions.

---

## Background

The Strix Halo box runs two separate inference backends:

| Model | Backend | Port | Use Case |
|-------|---------|------|----------|
| `Qwen3.6-35B-A3B` (MoE) | **llama.cpp** | 8080 | **Fast** — daily chat, quick tasks |
| `qwen/qwen3.6-27b` (Dense) | **LM Studio** | 1234 | **Smart** — code, reasoning, planning |

Currently all Hermes sessions use the 35B-A3B MoE via `extra.Qwen3.6-35B-A3B-Q4_K_M-GGUF` (llama.cpp, port 8080).

---

## Architecture Decision

**Two Hermes agent profiles** (fully separate instances), each with its own model, sessions, and memory.

This approach:
- Keeps models, sessions, and memory **completely separate**
- Allows **different system prompts** per profile
- Enables **different toolsets/skills** per profile
- Each profile runs as an independent Hermes process with its own gateway

### Profile Roles

| Profile | Bot | Model | When to Use |
|---------|-----|-------|-------------|
| **hermes** (default) | "Hermes" | Qwen3.6-35B-A3B via **llama.cpp** (port 8080) | Daily chat, quick tasks, home lab queries, casual conversation |
| **dex** | "Dex" | Qwen3.6-27B via **LM Studio** (port 1234) | Code review, architecture planning, complex reasoning, documentation, deep technical work |

### Telegram Routing

Telegram access is available on both profiles. There are two approaches:

**Approach A: Single bot, manual switch (simpler)**
- One Telegram bot ("Hermes") connects to the main Hermes gateway
- In Telegram: switch models mid-session with `/model dex` or `/model hermes`
- Same bot, same chat, model changes on the fly
- Downside: both models share the same Telegram session context

**Approach B: Two bots, channel-based routing (cleaner isolation)**
- Bot 1 ("**Hermes**") → always `hermes` profile — for daily use
- Bot 2 ("**Dex**") → always `dex` profile — for deep work
- Different bot tokens, completely separate sessions and memories
- User chooses which bot to message based on task type
- Upfront cost: create a second Telegram bot via @BotFather (username: `@dexbot` or similar)

**Recommended: Approach B** for clean separation.

## Implementation Plan

### Phase 1: Backend Verification

1. **Verify the llama.cpp 35B-A3B endpoint** is stable
   - Test `http://100.81.101.124:8080/v1/models` — confirm model ID is `extra.Qwen3.6-35B-A3B-Q4_K_M-GGUF`
   
2. **Verify LM Studio 27B-Dense endpoint** is responding
   - Test `http://192.168.0.8:1234/v1/models` — confirm `qwen/qwen3.6-27b` is listed
   - Confirm it's the Dense variant (not MoE) — check model info for architecture
   - Test a chat completion to confirm it responds

### Phase 2: Provider Configuration

Add/verify two provider entries in `~/.hermes/config.yaml`:

```yaml
providers:
  hermes:                      # rename from current default
    name: hermes
    base_url: http://100.81.101.124:8080/v1
    model: extra.Qwen3.6-35B-A3B-Q4_K_M-GGUF
  dex:                         # new provider for 27B-Dense via LM Studio
    name: dex
    base_url: http://192.168.0.8:1234/v1
    model: qwen/qwen3.6-27b
  lmstudio_aux:                # keep existing aux provider (7B for compression)
    name: lmstudio_aux
    base_url: http://100.81.101.124:1234/v1
    model: extra.Qwen2.5-7B-Instruct-GGUF
```

### Phase 3: Create Profiles

1. **`hermes` profile** — rename current default to `hermes` (or keep as-is, it's already the default)

2. **`dex` profile** — create from `hermes` then customize:
   ```bash
   hermes profile create dex --clone hermes
   ```
   
3. **Customize `dex` config** (`~/.hermes/profiles/dex/config.yaml`):
   - `model.provider: dex`
   - `model.model: qwen/qwen3.6-27b`
   - Add a specialist system prompt (see Phase 4)
   - Optionally increase `max_turns` for deeper reasoning

### Phase 4: System Prompt Differentiation

**hermes** (existing, default personality):
- Friendly, concise
- Default personality settings
- Standard toolset

**dex** (new):
- "You are a technical specialist focused on depth and accuracy. Provide thorough analysis, detailed code examples, and consider edge cases. Prioritize correctness over speed."
- Higher `max_turns` (e.g., 120 vs 90)
- Load additional technical skills by default (codebase-inspection, github-code-review, etc.)

### Phase 5: Telegram Routing (Approach B — Two bots)

1. **Create second Telegram bot via @BotFather**
   - Display name: "Dex"
   - Username: `@dexbot` (or similar available username)
   - Save the bot token

2. **Configure dex profile's Telegram gateway**
   - In `~/.hermes/profiles/dex/config.yaml`, add/update the `telegram:` section
   - Set the bot token for the new "Dex" bot
   - The dex gateway will always use the `dex` model/provider

3. **Keep hermes profile's Telegram gateway unchanged**
   - Current "Hermes" bot continues on its existing token
   - Always uses the `hermes` model/provider

### Phase 6: CLI Workflow

| Command | Result |
|---------|--------|
| `hermes` | Starts `hermes` profile (default) |
| `hermes -p dex` | Starts `dex` profile |
| `hermes profile use dex` | Makes dex the sticky default |
| `hermes profile use hermes` | Switches back to hermes default |

### Phase 7: Auxiliary Provider Alignment

Update auxiliary services per profile:
- **Vision**: Keep `hermes` (35B-A3B) — image understanding doesn't need full 27B depth
- **Compression**: Keep `lmstudio_aux` (7B) — fast enough for text compression
- **Title generation**: Keep `hermes` — brief summaries don't need depth
- **Delegation (sub-agents)**: Consider using `dex` for complex sub-agent tasks

---

## Files to Modify

| File | Change |
|------|--------|
| `~/.hermes/config.yaml` | Rename providers to `generalist`/`specialist`, update model references |
| `~/.hermes/profiles/specialist/config.yaml` | New profile config (created via `hermes profile create`) |
| `~/.hermes/profiles/specialist/` | New profile directory (sessions, memories, etc.) |
| `~/hermes-mission-control/docs/plans/dual-model-agent-profiles.md` | This doc (reference) |

---

## Verification Checklist

- [ ] Both llama.cpp (port 8080) and LM Studio (port 1234) endpoints respond correctly
- [ ] `generalist` provider works as the default in `config.yaml`
- [ ] `specialist` provider responds correctly
- [ ] `hermes profile create specialist --clone generalist` succeeds
- [ ] `hermes -p specialist` starts with 27B-Dense model
- [ ] `hermes -p generalist` starts with 35B-A3B model
- [ ] System prompts are distinct and effective in each profile
- [ ] Vision/compression/title services still work in both profiles
- [ ] Telegram bot connects and responds in both profiles
- [ ] No regressions in existing MCP server connections

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| 27B-Dense OOM on Strix Halo | Monitor VRAM/RAM usage; fall back to 35B-A3B if needed |
| Slower inference on dense model | Acceptable — it's a specialist for complex tasks, not speed |
| LM Studio hot-unload issues | Keep both models loaded; don't unload between profile switches |
| Config version mismatch | Backup config before changes; test with `hermes doctor` |
| Telegram profile routing complexity | Start with Approach A (single bot), add Approach B later |
| Profile memory isolation leaks | Verify sessions are truly isolated after creation |

---

## Future Extensions

- Add a **benchmark script** to quantitatively compare both models on shared prompts
- Add **auto-profiling** based on detected task type (e.g., detect code → auto-switch to specialist)
- **Approach B** (two Telegram bots) — add a second bot for dedicated deep-work access
- Add a **third "ultra-fast" profile** using the 7B model for simple queries
- Integrate with Mission Control Kanban to log which profile was used per task
