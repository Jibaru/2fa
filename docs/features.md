# Features

## TOTP Code Display

- Entries displayed as cards with **issuer**, **account name**, and a **6-digit code** (formatted as `XXX XXX`).
- A **circular timer** shows remaining seconds (30s period). Turns red when <= 5 seconds.
- Codes refresh automatically every second.
- **Copy button** copies the current code to the clipboard.

## Search

- Real-time filtering by issuer or account name (case-insensitive).
- Sticky search bar at the top of the entry list.

## Add Entry

Two methods available via the floating action button (+):

### Manual Entry
- Form with fields: **Issuer**, **Account Name**, **Secret Key**.
- Requires at least a secret and either an issuer or account name.

### QR Code Import
- See [Importing Accounts](importing.md) for details.

## Delete Entry

- **Swipe left** on a card to reveal the delete zone.
- Releasing past the threshold opens a **confirmation modal**.
- Smooth drag animation with spring-back if cancelled.

## Authentication

### Registration (first launch)
- No `~/.2fa/config.json` exists → registration mode.
- Enter a 16-character password twice (with live character counter).
- Password is hashed with bcrypt and stored in `config.json`.

### Login (subsequent launches)
- Enter the 16-character password.
- Validated against the stored bcrypt hash.
- On success, entries are decrypted and loaded.

## Settings

Accessible via the gear icon in the header.

### Change Password
- Enter current password + new password (twice).
- All stored entries are re-encrypted with the new password.
- bcrypt hash updated in `config.json`.

### Auto-Lock Timer
- Set an inactivity timeout using **days**, **hours**, and **minutes** fields.
- Leave all fields empty to disable.
- The timer resets on any user interaction (click, keypress, scroll).
- When it expires, the app locks and returns to the login screen.

## Lock

- **Lock button** (padlock icon next to the settings gear) immediately locks the app.
- Clears all in-memory entries and returns to the login screen.

## System Tray (Windows)

- The app shows an icon in the **system tray** (bandeja del sistema).
- **Closing the window** (X button) hides it to the tray instead of quitting.
- **Click the tray icon** to restore the window.
- **Right-click the tray icon** for a menu:
  - **Show** — restore the window
  - **Quit** — fully exit the application

## Duplicate Prevention

- When adding or importing entries, the secret is normalized and compared against existing entries.
- Duplicates are silently skipped to avoid storing the same seed twice.
