# Setup & Build

## Prerequisites

- [Go](https://go.dev/dl/) >= 1.21
- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/installation)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

Install the Wails CLI:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Verify:

```bash
wails doctor
```

## Install Dependencies

```bash
# Go modules
go mod tidy

# Frontend packages
cd frontend && pnpm install
```

## Development

```bash
wails dev
```

This starts:
- Vite dev server with hot reload for the frontend
- Go backend with live recompilation

## Production Build

```bash
wails build
```

Output binary: `build/bin/2fa.exe` (Windows).

## Data Location

The app stores all data in the user's home directory:

```
~/.2fa/
├── config.json    # bcrypt password hash + auto-lock setting
└── data.json      # AES-128-GCM encrypted TOTP entries
```

To reset the app completely, delete the `~/.2fa/` directory.
