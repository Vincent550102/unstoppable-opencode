# Unstoppable OpenCode

Auto-continue plugin for [OpenCode](https://opencode.ai) - automatically sends "continue" when the agent stops, keeping it working until the task is complete.

## Installation

### Option 1: Local Installation (Recommended)

Copy the plugin file to your project's plugin directory:

```bash
mkdir -p .opencode/plugins
curl -o .opencode/plugins/auto-continue.ts \
  https://raw.githubusercontent.com/Vincent550102/unstoppable-opencode/main/.opencode/plugins/auto-continue.ts
```

### Option 2: Global Installation

Install for all projects:

```bash
mkdir -p ~/.config/opencode/plugins
curl -o ~/.config/opencode/plugins/auto-continue.ts \
  https://raw.githubusercontent.com/Vincent550102/unstoppable-opencode/main/.opencode/plugins/auto-continue.ts
```

### Option 3: Manual Installation

1. Download `auto-continue.ts` from this repository
2. Place it in `.opencode/plugins/` (project-level) or `~/.config/opencode/plugins/` (global)

## Configuration

Edit the constants at the top of `auto-continue.ts`:

```typescript
const MAX_CONTINUES = 0        // 0 = unlimited, or set a limit (e.g., 5)
const CONTINUE_MESSAGE = "continue"
const COOLDOWN_MS = 1000       // Minimum ms between continues
```

| Option | Default | Description |
|--------|---------|-------------|
| `MAX_CONTINUES` | `0` | Maximum auto-continues per session. Set to `0` for unlimited. |
| `CONTINUE_MESSAGE` | `"continue"` | Message sent to the agent |
| `COOLDOWN_MS` | `1000` | Cooldown between continues (prevents rapid loops) |

## How It Works

1. Plugin listens for `session.idle` events (fired when agent stops)
2. When triggered, sends the configured message to resume the agent
3. Tracks continue count per session to respect limits
4. Cooldown prevents rapid-fire continues

## Safety Features

- **Cooldown**: 1 second minimum between continues
- **Per-session tracking**: Each session has independent state
- **Optional limit**: Set `MAX_CONTINUES` to prevent infinite loops
- **Logging**: All actions logged for debugging (`opencode logs`)

## Use Cases

- Long-running tasks that require multiple iterations
- Autonomous coding sessions
- Batch processing with minimal intervention

## Requirements

- OpenCode v1.0+

## License

MIT
