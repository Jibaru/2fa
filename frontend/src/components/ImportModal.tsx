import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ImportModalProps {
  onImport: (uri: string) => void;
  onClose: () => void;
}

export default function ImportModal({ onImport, onClose }: ImportModalProps) {
  const [mode, setMode] = useState<"choose" | "webcam" | "file">("choose");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Start webcam scanner AFTER the #qr-reader div is rendered in the DOM
  useEffect(() => {
    if (mode !== "webcam") return;

    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    setScanning(true);
    setError("");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          scannerRef.current = null;
          setScanning(false);
          onImport(decodedText);
        },
        () => {}
      )
      .catch((err: any) => {
        if (!cancelled) {
          setScanning(false);
          setError(String(err?.message || err || "Unknown camera error"));
        }
      });

    return () => {
      cancelled = true;
      // Only stop if handleClose hasn't already cleaned up
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
        scanner.stop().catch(() => {});
      }
    };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    try {
      const scanner = new Html5Qrcode("qr-file-reader");
      const result = await scanner.scanFile(file, true);
      await scanner.clear();
      onImport(result);
    } catch (err) {
      setError("Could not read QR code from the image. Make sure it's a valid QR code." + err);
    }
  };

  const handleClose = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        await s.stop();
      } catch {
        // scanner may not have been fully started
      }
      try {
        s.clear();
      } catch {
        // ignore
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800 text-center mb-5">
          Import QR Code
        </h3>

        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("webcam")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Scan with webcam</p>
                <p className="text-xs text-gray-400">Point camera at QR code</p>
              </div>
            </button>
            <button
              onClick={() => setMode("file")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Import from file</p>
                <p className="text-xs text-gray-400">Select a QR code image</p>
              </div>
            </button>
            <button
              onClick={handleClose}
              className="w-full mt-1 py-2.5 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {mode === "webcam" && (
          <div>
            <div
              id="qr-reader"
              className="w-full rounded-xl overflow-hidden"
            />
            {scanning && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Point your camera at the QR code...
              </p>
            )}
            {error && (
              <p className="text-xs text-red-500 text-center mt-3">{error}</p>
            )}
            <button
              onClick={handleClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {mode === "file" && (
          <div>
            <div id="qr-file-reader" className="hidden" />
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">Click to select an image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            {error && (
              <p className="text-xs text-red-500 text-center mt-3">{error}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setMode("choose"); setError(""); }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
