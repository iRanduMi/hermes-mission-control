# Scarf v2.0.0 — Installation & Configuration Plan

## Overview

**Scarf** is a native macOS companion app for the Hermes AI agent. It provides a GUI for monitoring, chatting with, and configuring Hermes instances. Version 2.0 adds **multi-server management** — manage your local `~/.hermes/` plus any number of remote Hermes installations reached over SSH, all from one app.

**Key facts:**
- macOS 14.6+ (Sonoma) only
- Ships via GitHub Releases (not App Store — needs direct file access)
- Free and open source (MIT license)
- Auto-updates via Sparkle
- Requires Hermes agent v0.6.0+ installed on each target host

---

## Prerequisites

| Item | Details |
|------|---------|
| **OS** | macOS 14.6+ (Sonoma) |
| **Hermes (local)** | v0.9.0+ recommended at `~/.hermes/` |
| **Hermes (remote)** | v0.9.0+ at `~/.hermes/` on each remote host |
| **Remote requirements** | SSH access (key-based), `sqlite3` on remote, `hermes` CLI in PATH |

---

## Phase 1: Install Scarf (Local)

### Step 1 — Download the app

**For Apple Silicon (M1/M2/M3/M4) — smaller download:**
```
https://github.com/awizemann/scarf/releases/download/v2.0.0/Scarf-v2.0.0-ARM64.zip
```

**For Universal (Apple Silicon + Intel):**
```
https://github.com/awizemann/scarf/releases/download/v2.0.0/Scarf-v2.0.0-Universal.zip
```

### Step 2 — Install

1. Extract the `.zip`
2. Drag `Scarf.app` to `/Applications/`
3. Unquarantine (first time only, if Gatekeeper complains):
   ```bash
   xattr -d com.apple.quarantine /Applications/Scarf.app
   ```
4. Launch `Scarf.app` — it's Developer ID signed + notarized, should open cleanly.

### Step 3 — Verify auto-update

Scarf uses Sparkle for updates. First launch will check the `appcast.xml` on the `gh-pages` branch. Subsequent updates are automatic.

---

## Phase 2: Configure Local Server

### Step 1 — Verify local Hermes installation

Confirm Hermes is installed and the CLI is working:
```bash
hermes --version
# Should show v0.9.0 or later
```

Confirm `~/.hermes/` directory exists:
```bash
ls ~/.hermes/config.yaml ~/.hermes/.env 2>/dev/null
```

### Step 2 — Add local server in Scarf

1. Open Scarf
2. Go to **Manage Servers** (or File → Open Server)
3. The local `~/.hermes/` should be synthesized automatically — no manual entry needed
4. If not visible, use **Add Server** → Local mode (if available)

### Step 3 — Verify connection

- Open a chat window — should connect to local Hermes
- Check the Dashboard for system health, token usage, and recent sessions
- Verify Memory Viewer can read `MEMORY.md` and `USER.md`

---

## Phase 3: Configure Remote Servers (Optional)

### Step 1 — Prepare the remote host

On each remote server (e.g., your Box 1 Unraid VM, Box 2 Fedora machine, etc.):

1. **Install Hermes agent** (v0.9.0+):
   ```bash
   # Clone and install
   git clone https://github.com/hermes-ai/hermes-agent.git ~/.hermes-agent
   cd ~/.hermes-agent
   # Follow standard install procedure (venv, dependencies, etc.)
   ```

2. **Ensure `hermes` CLI is in PATH**:
   ```bash
   which hermes
   # Should resolve to the installed binary
   ```

3. **Ensure `sqlite3` is installed** (for atomic DB snapshots):
   ```bash
   sqlite3 --version
   ```

4. **Configure SSH** (if not already done):
   - Add an entry to your local `~/.ssh/config`:
     ```
     Host my-server
         HostName <IP-or-hostname>
         User <username>
         IdentityFile ~/.ssh/id_ed25519
         ForwardAgent yes
     ```

### Step 2 — Add remote server in Scarf

1. In Scarf: **File → Open Server → Add Server**
2. Fill in the connection details:
   - **Host**: `my-server` (or `user@host:port`)
   - **User**: SSH username
   - **Port**: 22 (or custom)
   - **Identity file**: optional (falls back to `~/.ssh/config`)
   - **Remote home**: optional (if `~/.hermes/` differs on remote)
3. Save — Scarf will test the SSH connection

### Step 3 — Verify remote connection

1. Open a new window (File → Open Server → pick the remote)
2. The two windows run side-by-side with independent state
3. Check:
   - Dashboard loads remote system health
   - Sessions browser shows remote session history
   - Chat works over ACP (Agent Client Protocol over SSH)
   - File watcher reflects remote `state.db` changes

---

## Phase 4: Configure Messenger Platforms via GUI

Scarf v1.6+ includes a **native GUI for all 13 messaging platforms** — no more hand-editing `.env`:

| Platform | Setup |
|----------|-------|
| Telegram | Bot token via GUI form |
| Discord | Bot token + gateway intent |
| Slack | Bot token + app credentials |
| WhatsApp | QR scan via inline SwiftTerm terminal |
| Signal | QR scan + signal-cli daemon |
| Home Assistant | API key |
| iMessage | Native (macOS only) |
| Email/Matrix/Mattermost/Feishu |各自的配置表单 |
| Webhook | Endpoint + secret |
| CLI | N/A |

**Configuration writes to:**
- `~/.hermes/.env` for credentials
- `~/.hermes/config.yaml` for behavior toggles

---

## Phase 5: Verify All Features

### Monitor Tab
- [ ] Dashboard shows health + token usage + cost tracking
- [ ] Insights shows analytics (token breakdown, model stats, heatmaps)
- [ ] Sessions browser lists conversations with search
- [ ] Activity feed shows recent tool execution

### Inter Tab
- [ ] Live Chat works (Rich Chat mode with streaming)
- [ ] Terminal mode works with ANSI colors
- [ ] Memory Viewer reads/writes MEMORY.md and USER.md
- [ ] Skills Browser shows installed skills + Hub integration
- [ ] Platform setup GUI works for your messenger
- [ ] Personalities list/edit SOUL.md
- [ ] Quick Commands editor works
- [ ] Credential Pools shows configured providers
- [ ] Plugins can be installed/removed
- [ ] Webhooks can be created/tested
- [ ] Profiles can be created/switched

### Multi-Server (v2.0)
- [ ] Local server is active
- [ ] Remote server(s) are configured and connected
- [ ] Windows for each server show independent state
- [ ] Window-state restoration works (quit + relaunch)
- [ ] Status icon shows summary across servers

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Application is damaged" error | `xattr -d com.apple.quarantine /Applications/Scarf.app` |
| Remote WAL errors | Ensure `sqlite3` is installed on remote host |
| SSH connection fails | Verify `~/.ssh/config`, key auth, and that `hermes` is in remote PATH |
| Sessions not showing | Check that remote `state.db` is accessible; verify file watcher ticks in logs |
| Auto-update fails | Check Sparkle appcast on `gh-pages` branch; verify network access |
| ACP chat doesn't work | Ensure `hermes acp` is runnable on remote; check SSH `-T` tunnel |

---

## Notes

- **No Windows/Linux version** yet — community requested but not available
- **App Store not supported** — Scarf needs direct file access which App Sandbox forbids
- **Window management** — each window is bound to one server; open multiple windows for side-by-side comparison
- **Scarf does NOT replace Hermes** — it's a companion GUI. Hermes still runs as the CLI/backend agent
- **Donations accepted** via [Buy Me a Coffee](https://www.buymeacoffee.com/awizemann)

---

*Plan created from Reddit post: https://www.reddit.com/r/hermesagent/comments/1sq3vc9*
*Source: https://github.com/awizemann/scarf*
