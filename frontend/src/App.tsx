import { useState, useEffect, useCallback, useRef } from "react";
import { EntryWithCode } from "./types";
import SearchBar from "./components/SearchBar";
import TOTPCard from "./components/TOTPCard";
import DeleteModal from "./components/DeleteModal";
import AddModal from "./components/AddModal";
import ImportModal from "./components/ImportModal";
import AuthScreen from "./components/AuthScreen";
import SettingsPage from "./components/SettingsPage";
import { GetEntries, AddEntry, DeleteEntry } from "../wailsjs/go/core/EntryHandler";
import { ImportFromURI } from "../wailsjs/go/core/ImportHandler";
import { GetAutoLockMinutes } from "../wailsjs/go/core/AuthHandler";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<EntryWithCode[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EntryWithCode | null>(null);
  const [page, setPage] = useState<"main" | "settings">("main");
  const [autoLockMinutes, setAutoLockMinutes] = useState(0);
  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoLock = useCallback(() => {
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    if (autoLockMinutes > 0) {
      autoLockTimer.current = setTimeout(() => {
        setAuthenticated(false);
        setEntries([]);
        setSearch("");
        setPage("main");
      }, autoLockMinutes * 60 * 1000);
    }
  }, [autoLockMinutes]);

  useEffect(() => {
    if (!authenticated) {
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
      return;
    }
    GetAutoLockMinutes().then(setAutoLockMinutes).catch(() => {});
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || autoLockMinutes <= 0) return;
    resetAutoLock();
    const events = ["pointerdown", "keydown", "scroll"];
    const handler = () => resetAutoLock();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [authenticated, autoLockMinutes, resetAutoLock]);

  const refresh = useCallback(async () => {
    try {
      const result = await GetEntries(search);
      setEntries(result || []);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    }
  }, [search]);

  useEffect(() => {
    if (!authenticated) return;
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh, authenticated]);

  const handleAdd = async (issuer: string, name: string, secret: string) => {
    try {
      await AddEntry(issuer, name, secret);
      setShowAddModal(false);
      refresh();
    } catch (err) {
      console.error("Failed to add entry:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await DeleteEntry(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleImport = async (uri: string) => {
    try {
      const count = await ImportFromURI(uri);
      setShowImportModal(false);
      refresh();
      if (count > 0) {
        console.log(`Imported ${count} account(s)`);
      }
    } catch (err) {
      console.error("Failed to import:", err);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(console.error);
  };

  const handleLock = () => {
    setAuthenticated(false);
    setEntries([]);
    setSearch("");
    setPage("main");
  };

  if (!authenticated) {
    return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (page === "settings") {
    return <SettingsPage onBack={() => setPage("main")} onAutoLockChange={setAutoLockMinutes} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-lg font-bold text-gray-800">2FA Authenticator</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLock}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Lock"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          <button
            onClick={() => setPage("settings")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="text-xs mt-1">Tap + to add your first 2FA account</p>
          </div>
        ) : (
          entries.map((entry) => (
            <TOTPCard
              key={entry.id}
              entry={entry}
              onCopy={() => handleCopy(entry.code)}
              onDelete={() => setDeleteTarget(entry)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors active:scale-95"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modals */}
      {showAddModal && (
        <AddModal
          onAdd={handleAdd}
          onImportQR={() => { setShowAddModal(false); setShowImportModal(true); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showImportModal && (
        <ImportModal
          onImport={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          entry={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default App;
