import { useEffect, useState } from "react";
import { GetEntryQR } from "../../wailsjs/go/core/EntryHandler";
import { EntryWithCode } from "../types";

interface QRModalProps {
  entry: EntryWithCode;
  onClose: () => void;
}

export default function QRModal({ entry, onClose }: QRModalProps) {
  const [qrData, setQrData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    GetEntryQR(entry.id)
      .then(setQrData)
      .catch((err: any) => setError(String(err || "Failed to generate QR")));
  }, [entry.id]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-gray-800 text-center mb-1">
          {entry.issuer || entry.name}
        </h3>
        {entry.issuer && entry.name && (
          <p className="text-xs text-gray-400 text-center mb-4">{entry.name}</p>
        )}

        <div className="flex items-center justify-center min-h-[256px]">
          {error ? (
            <p className="text-xs text-red-500 text-center">{error}</p>
          ) : qrData ? (
            <img src={qrData} alt="QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3 mb-4">
          Scan with another authenticator app
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
