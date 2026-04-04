# Importing Accounts

## Supported Formats

| Format                        | Description                              |
|-------------------------------|------------------------------------------|
| `otpauth://totp/...`         | Standard single-account TOTP URI         |
| `otpauth://hotp/...`         | Standard single-account HOTP URI         |
| `otpauth-migration://offline?data=...` | Google Authenticator bulk export |

## From Google Authenticator

1. Open Google Authenticator on your phone.
2. Tap the **three dots** menu > **Transfer accounts** > **Export accounts**.
3. Select the accounts to export. Google generates one or more QR codes.
4. In the 2FA app, click **+** > **Import QR Code**.

### Scan with Webcam
- Choose **Scan with webcam** and point the camera at each QR code on your phone screen.
- Each QR code is processed immediately. Repeat for every page.

### Import from File
- Screenshot each QR code page on your phone.
- Transfer the screenshots to your computer.
- Choose **Import from file** and select each screenshot.

The app tries three decoding strategies for file imports:

1. **Direct scan** — html5-qrcode (zxing) on the raw image.
2. **Preprocessed scan** — normalizes the image to 1200px with white padding and retries.
3. **jsQR fallback** — loads pixels to a canvas and decodes with the jsQR library. Handles dense QR codes from large batch exports.

## Manual Entry

If you have the secret key (base32 string) from a service's 2FA setup page:

1. Click **+** > **Add manually**.
2. Fill in:
   - **Issuer** — the service name (e.g., "GitHub")
   - **Account Name** — your username or email
   - **Secret Key** — the base32 secret (e.g., `JBSWY3DPEHPK3PXP`)
3. Click **Add**.

## From JSON File (Export/Import)

The app can export and import all accounts as a plain JSON file via **Settings > Export / Import**.

### Export
1. Go to **Settings** (gear icon).
2. Click **Export**. A save dialog opens.
3. Choose a location. The file is saved as unencrypted JSON.

### Import
1. Go to **Settings** (gear icon).
2. Click **Import**. A file dialog opens.
3. Select a `.json` file previously exported by the app.

### JSON Format

```json
[
  {
    "issuer": "GitHub",
    "name": "user@example.com",
    "secret": "JBSWY3DPEHPK3PXP"
  }
]
```

The exported file does **not** include internal IDs — new UUIDs are generated on import.

> **Warning:** The exported file contains **unencrypted secrets**. Store it securely and delete it after use.

## Duplicate Handling

When importing (QR or JSON), the app normalizes each secret (strips spaces/dashes, case-insensitive comparison) and skips any entry whose secret already exists. This means re-scanning the same QR code or re-importing the same file won't create duplicates.
