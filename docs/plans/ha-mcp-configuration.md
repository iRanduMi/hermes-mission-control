# Home Assistant MCP Server (ha-mcp) Configuration

> **Status:** ✅ Configured & verified  
> **Date:** 2026-04-20  
> **Repo:** https://github.com/homeassistant-ai/ha-mcp

## Overview

`ha-mcp` is an unofficial MCP server that exposes **85+ Home Assistant tools** to Hermes Agent, enabling full smart-home control: toggle lights, manage automations, query states, control climate, operate covers, run scripts, interact with input helpers, and more.

## Architecture

```
Hermes Agent (Mac Mini / Box 3)
    └── Built-in MCP Client
            └── ha-mcp (stdio, via uvx)
                    └── Home Assistant HTTP API
                            └── HA on Box 1 (Unraid VM)
```

## Configuration

Located in `~/.hermes/config.yaml` under `mcp_servers`:

```yaml
mcp_servers:
  ha:
    command: "uvx"
    args: ["ha-mcp"]
    env:
      HOMEASSISTANT_URL: "http://homeassistant.tail59733.ts.net:8123"
      HOMEASSISTANT_TOKEN: "<long-lived-access-token>"
    timeout: 120
    connect_timeout: 60
```

### Required Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `HOMEASSISTANT_URL` | `http://homeassistant.tail59733.ts.net:8123` | Nabu Casa URL (or local) |
| `HOMEASSISTANT_TOKEN` | JWT long-lived token | HA UI: Settings → People → Your Name → Long-Lived Access Tokens |

### Token Generation

1. Open Home Assistant UI
2. Go to **Settings → People → (your name)**
3. Scroll to **Long-Lived Access Tokens**
4. Click **Create Token**, name it `Hermes Agent`
5. Copy the token immediately (shown once)

## How It Works

- **Transport:** stdio (Hermes → `uvx ha-mcp`)
- **Protocol:** MCP JSON-RPC 2024-11-05
- **Runtime:** `uvx ha-mcp` — uvx downloads the package on first run, caches it after
- **Tools:** Discovered automatically at Hermes startup and registered as first-class tools

## Verification

Confirmed working on 2026-04-20:

| Check | Status |
|-------|--------|
| `ha-mcp` in `config.yaml` | ✅ Present |
| `HOMEASSISTANT_URL` set | ✅ `http://homeassistant.tail59733.ts.net:8123` |
| `HOMEASSISTANT_TOKEN` set | ✅ JWT token configured |
| ha-mcp process running | ✅ PID visible in `ps` |
| MCP handshake | ✅ Initialize response received |
| Tools list | ✅ Tools returned from HA |
| Hermes restart | ✅ Done — tools available |

To verify manually:
```bash
# Check the process is running
ps aux | grep ha-mcp | grep -v grep

# Check logs for startup
grep "ha-mcp" ~/.hermes/logs/gateway.error.log
```

## Available Tool Categories

The 85+ tools cover all major HA domains:
- **Entity management** — search, get states, query attributes
- **Service calls** — toggle lights, climate, covers, media players
- **Automation control** — trigger, enable/disable automations
- **Script execution** — run HA scripts
- **Scene activation** — turn on scenes
- **Helper management** — input_number, input_select, input_boolean, input_text, input_datetime
- **Area/device operations** — bulk control by area or device
- **Dashboard management** — create/update dashboards via config
- **Logbook & stats** — query logbook entries and entity history

See `ha_get_domain_docs("domain_name")` for tool documentation per HA domain.

## Troubleshooting

### Token expired (401 errors)
Regenerate the token in HA UI and update `HOMEASSISTANT_TOKEN` in `~/.hermes/config.yaml`. Then restart Hermes.

### Connection refused / timeout
- Verify HA is reachable: `curl -s http://homeassistant.tail59733.ts.net:8123/api/environments`
- Check the process is running: `ps aux | grep ha-mcp`
- If stopped, restart Hermes to reconnect

### `uvx` not found
Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
Then restart Hermes.

### Tools not appearing after config change
Hermes auto-reloads MCP servers when `config.yaml` changes. If tools still don't appear:
```bash
# Restart Hermes
hermes gateway restart
```

### MCP server starting but no tools returned
The MCP server may need more time to connect to HA on startup. Check:
```bash
grep "ha-mcp" ~/.hermes/logs/gateway.error.log | tail -10
```
If HA API is unreachable, the server starts but tools list will be empty.

## Related

- **Frigate MCP** — Connected the same way (stdio via custom binary)
- **Home Lab Integration Strategy** — Full rollout plan: Phase 1 read-only → Phase 2 controlled actions → Phase 3 cross-service automation
- **Skill:** `ha-mcp-setup` — Quick setup reference
