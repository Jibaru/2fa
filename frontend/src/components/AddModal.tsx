import { useState } from "react";

interface AddModalProps {
  onAdd: (issuer: string, name: string, secret: string) => void;
  onImportQR: () => void;
  onClose: () => void;
}

export default function AddModal({ onAdd, onImportQR, onClose }: AddModalProps) {
  const [mode, setMode] = useState<"choose" | "manual">("choose");
  const [issuer, setIssuer] = useState("");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!secret.trim()) {
      setError("Secret key is required");
      return;
    }
    if (!issuer.trim() && !name.trim()) {
      setError("Issuer or account name is required");
      return;
    }
    onAdd(issuer.trim(), name.trim(), secret.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "choose" ? (
          <>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-5">
              Add Account
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setMode("manual")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Enter manually</p>
                  <p className="text-xs text-gray-400">Type the secret key</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onImportQR();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Scan QR Code</p>
                  <p className="text-xs text-gray-400">Import from Google Authenticator</p>
                </div>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-5">
              Add Manually
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Issuer (e.g. Google, GitHub)"
                value={issuer}
                onChange={(e) => { setIssuer(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200 transition-colors"
              />
              <input
                type="text"
                placeholder="Account name (e.g. user@email.com)"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200 transition-colors"
              />
              <input
                type="text"
                placeholder="Secret key"
                value={secret}
                onChange={(e) => { setSecret(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200 transition-colors font-mono"
              />
              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setMode("choose")}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
