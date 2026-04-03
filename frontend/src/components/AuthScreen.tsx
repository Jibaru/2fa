import { useState, useEffect } from "react";
import { IsNewUser, Register, Login } from "../../wailsjs/go/core/AuthHandler";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    IsNewUser().then(setIsNew).catch(() => setIsNew(true));
  }, []);

  const handleRegister = async () => {
    setError("");
    if (password.length !== 16) {
      setError("Password must be exactly 16 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await Register(password);
      onAuthenticated();
    } catch (err: any) {
      setError(String(err || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (password.length !== 16) {
      setError("Password must be exactly 16 characters");
      return;
    }
    setLoading(true);
    try {
      await Login(password);
      onAuthenticated();
    } catch (err: any) {
      setError(String(err || "Invalid password"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isNew) handleRegister();
      else handleLogin();
    }
  };

  if (isNew === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">
        {isNew ? "Create Password" : "Welcome Back"}
      </h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        {isNew
          ? "Set a 16-character password to encrypt your accounts"
          : "Enter your 16-character password to unlock"}
      </p>

      <div className="w-full max-w-sm space-y-3">
        <input
          type="password"
          placeholder="Password (16 characters)"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          maxLength={16}
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200 transition-colors font-mono"
          autoFocus
        />
        <p className={`text-xs text-right ${password.length === 16 ? "text-green-500" : "text-gray-400"}`}>
          {password.length}/16
        </p>

        {isNew && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            maxLength={16}
            className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-200 transition-colors font-mono"
          />
        )}

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={isNew ? handleRegister : handleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : isNew ? "Create & Unlock" : "Unlock"}
        </button>
      </div>
    </div>
  );
}
