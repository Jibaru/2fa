import { useState, useEffect } from "react";
import { ChangePassword, GetAutoLockMinutes, SetAutoLockMinutes } from "../../wailsjs/go/core/AuthHandler";
import TimeInput from "./TimeInput";

function minutesToDHM(total: number): { days: string; hours: string; minutes: string } {
  if (total <= 0) return { days: "", hours: "", minutes: "" };
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  return { days: d > 0 ? String(d) : "", hours: h > 0 ? String(h) : "", minutes: m > 0 ? String(m) : "" };
}

function dhmToMinutes(days: string, hours: string, minutes: string): number {
  const d = parseInt(days) || 0;
  const h = parseInt(hours) || 0;
  const m = parseInt(minutes) || 0;
  return d * 1440 + h * 60 + m;
}

interface SettingsPageProps {
  onBack: () => void;
  onAutoLockChange?: (minutes: number) => void;
}

export default function SettingsPage({ onBack, onAutoLockChange }: SettingsPageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [lockDays, setLockDays] = useState("");
  const [lockHours, setLockHours] = useState("");
  const [lockMinutes, setLockMinutes] = useState("");
  const [lockSaving, setLockSaving] = useState(false);
  const [lockSuccess, setLockSuccess] = useState("");

  useEffect(() => {
    GetAutoLockMinutes().then((m) => {
      const { days, hours, minutes } = minutesToDHM(m);
      setLockDays(days);
      setLockHours(hours);
      setLockMinutes(minutes);
    }).catch(() => {});
  }, []);

  const handleSaveAutoLock = async () => {
    setLockSuccess("");
    const total = dhmToMinutes(lockDays, lockHours, lockMinutes);
    setLockSaving(true);
    try {
      await SetAutoLockMinutes(total);
      onAutoLockChange?.(total);
      setLockSuccess(total === 0 ? "Auto-lock disabled" : "Auto-lock updated");
    } catch {
      setLockSuccess("Failed to save");
    } finally {
      setLockSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (currentPassword.length !== 16) {
      setError("Current password must be 16 characters");
      return;
    }
    if (newPassword.length !== 16) {
      setError("New password must be exactly 16 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await ChangePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(String(err || "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleChangePassword();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Settings</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Change Password Section */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-700">Change Password</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(""); setSuccess(""); }}
                onKeyDown={handleKeyDown}
                maxLength={16}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
                placeholder="Current password"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(""); setSuccess(""); }}
                onKeyDown={handleKeyDown}
                maxLength={16}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
                placeholder="New password (16 characters)"
              />
              <p className={`text-xs text-right mt-1 ${newPassword.length === 16 ? "text-green-500" : "text-gray-400"}`}>
                {newPassword.length}/16
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); setSuccess(""); }}
                onKeyDown={handleKeyDown}
                maxLength={16}
                className="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 transition-all font-mono"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="text-xs text-green-500 text-center">{success}</p>
            )}

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* Auto-Lock Section */}
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-700">Auto-Lock Timer</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Leave all fields empty to never auto-lock</p>

          <TimeInput
            days={lockDays}
            hours={lockHours}
            minutes={lockMinutes}
            onChange={(d, h, m) => { setLockDays(d); setLockHours(h); setLockMinutes(m); setLockSuccess(""); }}
          />

          {lockSuccess && (
            <p className="text-xs text-green-500 text-center mt-3">{lockSuccess}</p>
          )}

          <button
            onClick={handleSaveAutoLock}
            disabled={lockSaving}
            className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            {lockSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
