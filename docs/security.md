# Security Model

## Password

- The password must be **exactly 16 characters** (enforced on both frontend and backend).
- The raw password bytes are used directly as the **AES-128 key** (16 bytes = 128 bits).
- A **bcrypt hash** (DefaultCost) of the password is stored in `~/.2fa/config.json` for login verification.
- The plaintext password is never written to disk.

## Encryption

All TOTP secrets are encrypted at rest using **AES-128-GCM**:

| Property  | Value                                      |
|-----------|--------------------------------------------|
| Algorithm | AES-128-GCM (Galois/Counter Mode)          |
| Key       | 16-byte password (used directly)           |
| Nonce     | 12 bytes, randomly generated per operation |
| Output    | Base64(`nonce \|\| ciphertext \|\| GCM tag`) |

### Encrypt flow

1. Generate 12 random bytes (nonce)
2. `AES-GCM.Seal(nonce, nonce, plaintext, nil)` → `nonce || ciphertext || tag`
3. Base64-encode the result
4. Write to `~/.2fa/data.json`

### Decrypt flow

1. Base64-decode the stored string
2. Split: first 12 bytes = nonce, rest = ciphertext + tag
3. `AES-GCM.Open(nil, nonce, ciphertext, nil)` → plaintext JSON
4. Unmarshal into `[]Entry`

## Password Change (Re-keying)

When the user changes their password:

1. Verify old password against bcrypt hash
2. `Storage.ReKey(newKey)`:
   - Sets the new key in memory
   - Re-encrypts all entries with the new key
   - Writes the updated ciphertext to `data.json`
3. Generate new bcrypt hash and update `config.json`

This is atomic — if re-encryption fails, the old key and data remain intact.

## File Permissions

| Path                | Permission | Description                    |
|---------------------|------------|--------------------------------|
| `~/.2fa/`           | `0700`     | Directory: user-only access    |
| `~/.2fa/data.json`  | `0600`     | Encrypted entries              |
| `~/.2fa/config.json`| `0600`     | bcrypt hash + auto-lock config |

## Auto-Lock

- Configurable inactivity timeout (days, hours, minutes).
- Monitors `pointerdown`, `keydown`, and `scroll` events.
- When the timer expires, the app clears all in-memory entries and returns to the login screen.
- Setting the timer to 0 (all fields empty) disables auto-lock.

## Network Isolation

The app makes **zero network requests**. All processing (TOTP generation, QR decoding, encryption) happens locally. Wails serves the frontend from embedded assets — no external HTTP calls.

## Threat Model Summary

| Threat                         | Mitigation                                           |
|--------------------------------|------------------------------------------------------|
| Disk theft                     | AES-128-GCM encryption of `data.json`                |
| Password brute-force           | bcrypt with DefaultCost (10 rounds)                  |
| Memory dump                    | Auto-lock clears entries from React state            |
| Unattended session             | Configurable auto-lock timer                         |
| Man-in-the-middle              | No network communication                             |
| Unauthorized file access       | `0700`/`0600` file permissions                       |
