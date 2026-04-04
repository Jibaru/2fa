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

## Duplicate Handling

When importing, the app normalizes each secret (strips spaces/dashes, case-insensitive comparison) and skips any entry whose secret already exists. This means re-scanning the same QR code won't create duplicates.
