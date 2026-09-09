Language: English | [Chinese README](./README.zh-CN.md)

# `npx @leibnizhu/codex-web-local`

A lightweight web interface for [Codex](https://github.com/openai/codex) that replicates the desktop UI and runs on top of the Codex `app-server`. It exposes Codex through a web application, allowing you to access your local Codex instance remotely from any browser.

## Prerequisites

- Node.js 24.8.0 or newer (the repository includes an `.nvmrc` pinned to 24.8.0)
- [Codex CLI](https://github.com/openai/codex) installed and available in your `PATH`

## Installation

```bash
# Run directly with npx (no install required)
npx @leibnizhu/codex-web-local

# Or install globally
npm install -g @leibnizhu/codex-web-local
```

## Usage

```
Usage: codex-web-local [options]

Web interface for Codex app-server

Options:
  -p, --port <port>    port to listen on (default: "3000")
  --host <host>        host to bind (default: 127.0.0.1)
  -d, --daemon         run in background (daemon mode)
  --password <pass>    set a specific password
  --no-password        disable password protection
  -V, --version        output the version number
  -h, --help           display help for command
```

## Examples

### Runtime Commands (production/daily usage)

```bash
# Start with auto-generated password on default port 3000
codex-web-local

# Start on a custom port
codex-web-local --port 8080

# Start with a specific password
codex-web-local --password my-secret

# Start without password protection (use only on trusted networks)
codex-web-local --no-password

# Start in daemon mode (run in background)
codex-web-local --daemon

# Start with an explicit bind host (listen on all interfaces; use only with authentication)
codex-web-local --host 0.0.0.0

# Tailscale setup in daemon mode (background)
codex-web-local --host "$(tailscale ip -4)" --port 3000 --daemon

# Show current CLI version
codex-web-local --version
```

### Dev Commands (Vite)

```bash
# Dev mode, expose to LAN
npm run dev -- --host 0.0.0.0

# Dev mode, bind to this machine's Tailscale IPv4
npm run dev -- --host "$(tailscale ip -4)"

# Dev mode in daemon (background)
npm run dev -- --host 0.0.0.0 --daemon
```

When started with password protection (default), the server prints the password to the console. Open the URL in your browser, enter the password, and you're in.
The CLI also checks npm for new versions automatically at startup (at most once every 12 hours).

## PWA Support

- Production builds can be installed as a Progressive Web App from a supported browser.
- The PWA caches only the application shell and static assets. Codex APIs, authentication requests, and event streams always require a network connection.
- `localhost` is treated as a secure context and can be used for local PWA installation.
- Remote devices must access the service through HTTPS provided by Tailscale Serve, a reverse proxy, or another secure tunnel. Plain HTTP over a LAN or Tailscale IP does not provide full PWA support.
- The Vite development server does not register the Service Worker. Use a production build or preview when validating PWA behavior.
- iPhone and iPad layouts target iOS/iPadOS 16+, including safe-area insets, dynamic viewport sizing, touch-friendly controls, and portrait/landscape use.
- Offline mode keeps the application shell visible and shows a connection notice; Codex API calls, authentication, and event streams remain network-only.
- Service Worker updates are checked manually from the sidebar footer and are applied only after the user activates the update.

## UI Highlights

- Composer status bar now shows:
  - current git branch
  - context window usage ring with detailed hover info
  - remaining quota hover card
- Context hover card supports manual compaction via "Compact Now" (calls `thread/compact/start`).
- Thread list uses `name` as the primary title. `preview` is shown in tooltip, not inline on hover.
- You can continue typing while the model is still responding. New sends are queued and auto-sent after the current turn finishes.

## Daemon Notes

- `codex-web-local --daemon` runs the CLI server in background and prints `PID`.
- `npm run dev -- --daemon` runs the Vite dev server in background and prints `PID`.
- To stop a daemon process:

```bash
kill <PID>
```

## Documentation

- Docs index: [docs/README.md](./docs/README.md)
- Mobile PWA runtime notes: [docs/runtime/pwa-mobile.md](./docs/runtime/pwa-mobile.md)
- Contracts guide: [docs/contracts/README.md](./docs/contracts/README.md)
- Chinese app-server doc: [docs/contracts/APP_SERVER_DOCUMENTATION.zh-CN.md](./docs/contracts/APP_SERVER_DOCUMENTATION.zh-CN.md)

## Contributing

Issues and pull requests are welcome! If you have ideas, suggestions, or found a bug, please open an issue on the [GitHub repository](https://github.com/Leibnizhu/codex-web-local/issues).

## License

[MIT](./LICENSE)
