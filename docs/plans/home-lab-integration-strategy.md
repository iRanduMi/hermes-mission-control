# Home Lab Integration Strategy

> **Date**: 2026-04-20
> **Author**: Jared Kortje
> **Status**: Active — gradual rollout

## Objective

Gradually integrate Hermes Agent (and its sub-agents) with the home lab Docker services using LLMs, prioritizing security, modularity, and controlled access.

## Architecture

### Integration Layer: MCP (Model Context Protocol)

All service integrations use the MCP pattern — each Docker service exposes an MCP server that wraps its API. Hermes connects to these MCP servers and gets scoped tool access.

**Why MCP?**
- Scoped tool visibility — only explicitly exposed tools are available
- Credential isolation — API keys stay in MCP server config, never in conversation context
- Failure isolation — one MCP server going down doesn't break others
- Auditability — each tool has a clear name and purpose

### Sub-Agent Segmentation

Services are split across specialized agent profiles. Each agent has its own `config.yaml` with only the MCP servers and skills relevant to its domain:

| Agent | Domain | Services |
|-------|--------|----------|
| Home Automation | HomeAssistant, smart devices | lights, switches, sensors, automations |
| Security/NVR | Frigate, Blue Iris | camera status, event clips, motion detection |
| Media | Plex, Jellyfin, download managers | library browsing, playback, metadata |
| Mission Control | Kanban board, Mealie, cron jobs | task management, recipe management, scheduling |

**Principle**: Least privilege. The NVR agent doesn't need Plex credentials. The media agent can't touch smart home controls.

## Security Practices

1. **Per-service API tokens** — not one master key. Each MCP server gets its own scoped token.
2. **Docker network isolation** — MCP servers only reachable on internal Docker network, not exposed to the internet.
3. **Action approval gates** — sensitive operations (door locks, alarm arms, deleting clips) require explicit user confirmation before execution.
4. **Conservative timeouts** — set per-service timeouts on MCP connections to prevent runaway loops from spamming services.
5. **Credential stripping** — Hermes already strips credential-like patterns from error messages before showing them to the LLM (see `native-mcp` skill).

## Configuration Pattern

Each MCP server is configured in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  service_name:
    url: "http://internal-ip:port/mcp"   # internal Docker network only
    timeout: 60                           # per-tool-call timeout
    headers:
      Authorization: "Bearer scoped-token"  # per-service token
```

## Rollout Phases

### Phase 1 — Read-Only Discovery
- Frigate: camera list and status only (no control)
- Plex: library inventory browsing
- HomeAssistant: entity state reading (lights on/off status, sensor values)
- Goal: Verify connectivity, understand data shapes, build familiarity

### Phase 2 — Read + Controlled Actions
- Frigate: event and clip retrieval
- Plex: playback control (play/pause, library browsing during playback)
- HomeAssistant: automation triggers, light/switch control
- **Approval gate**: Sensitive actions (locks, alarms, automations affecting multiple rooms) require explicit confirmation

### Phase 3 — Full Cross-Service Integration
- Smart home triggers from camera events (motion → lights on)
- Media-based notifications (alert feed playback)
- Cross-service automation (multi-service workflows)
- Proactive monitoring and anomaly detection

## Services Under Consideration

| Service | Current Status | Phase | MCP Server Available? |
|---------|---------------|-------|----------------------|
| HomeAssistant | Running | Phase 1 | Yes (community) |
| Frigate NVR | Running (Docker) | Phase 1 | Yes (community) |
| Plex | Running (Docker) | Phase 1 | Yes (community) |
| Blue Iris NVR | Running (Windows 11 VM) | Phase 2 | Custom needed |
| Mealie | **Integrated** | Done | Existing API integration |
| Mission Control | **Integrated** | Done | Existing API |
| Download managers | TBD | Phase 2/3 | TBD |
| Custom Docker services | TBD | As needed | Custom MCP servers |

## Implementation Notes

- Adding/removing MCP servers requires a Hermes restart (no hot-reload)
- MCP tools appear with prefix pattern: `mcp_{server}_{tool}`
- Sub-agent configs should live in separate config files or profiles
- Start with the least critical, most read-only services first
