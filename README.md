# 2FA

This is a 2FA desktop app that uses:

- Wails
- Typescript
- React
- Go

## UI

Tailwind CSS UI (latest version)
The UI should look like the photo `image.png`

It should show a list of devices with the title and code.
Each one should have a "timer" in circle form.
Also each one should have a copy button.
At the top of the list should exists a search bar.

We could delete each tile by dragging it to the left. It should show a simple modal to confirm deletion.

Store the seeds inside `HOME/.2fa/data.json`

Move the logic inside `core` folder. You could create many handlers for each action like: adding new 2fa, deleting one, listing with search, etc.

The `App` struct should dont have any action, you have to create new ones and attach it in main.go.

## Another important feature

- Must have a way to import codes from Google Authenticator Export QR Codes. It must allow to scan a QR via webcam or looking at a file.
