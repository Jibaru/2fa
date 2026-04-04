# 2FA Authenticator - Documentation

A desktop TOTP authenticator built with **Wails** (Go + React + TypeScript), styled with Tailwind CSS. Stores encrypted seeds locally and supports importing from Google Authenticator.

## Table of Contents

- [Setup & Build](setup.md)
- [Architecture](architecture.md)
- [Features](features.md)
- [Security](security.md)
- [Importing Accounts](importing.md)

## Quick Overview

| Aspect        | Detail                                   |
|---------------|------------------------------------------|
| Backend       | Go 1.25, Wails v2                        |
| Frontend      | React 18, TypeScript, Tailwind CSS 3     |
| Encryption    | AES-128-GCM                              |
| TOTP          | RFC 6238 (HMAC-SHA1, 30s, 6 digits)     |
| Storage       | `~/.2fa/data.json` (encrypted)           |
| Config        | `~/.2fa/config.json` (bcrypt hash + settings) |
| Platform      | Windows (system tray support)            |

## File Structure

```
2fa/
├── main.go                     # Entry point, Wails wiring
├── app.go                      # Minimal App struct
├── core/
│   ├── models.go               # Entry, EntryWithCode
│   ├── auth.go                 # Registration, login, password change, auto-lock
│   ├── storage.go              # Encrypted CRUD for entries
│   ├── crypto.go               # AES-128-GCM encrypt/decrypt
│   ├── totp.go                 # TOTP code generation
│   ├── entries.go              # EntryHandler (list, add, delete, QR, export/import)
│   ├── importer.go             # ImportHandler (otpauth + migration URIs)
│   ├── migration.go            # Google Authenticator protobuf decoder
│   └── tray.go                 # System tray manager
├── frontend/
│   └── src/
│       ├── App.tsx             # Main container, auth gating, auto-lock
│       ├── types.ts            # TypeScript interfaces
│       └── components/
│           ├── AuthScreen.tsx   # Login / Register
│           ├── TOTPCard.tsx     # Entry card with swipe-to-delete
│           ├── CircularTimer.tsx# Countdown ring
│           ├── SearchBar.tsx    # Filter entries
│           ├── AddModal.tsx     # Manual entry or import
│           ├── ImportModal.tsx  # Webcam / file QR scanning
│           ├── QRModal.tsx      # Display entry QR code
│           ├── DeleteModal.tsx  # Confirm deletion
│           ├── SettingsPage.tsx # Password change + auto-lock
│           └── TimeInput.tsx    # Days:Hours:Minutes picker
└── build/
    └── windows/
        └── icon.ico            # App + tray icon
```
