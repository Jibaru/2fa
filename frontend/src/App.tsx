import { useState, useEffect, useCallback } from "react";
import { EntryWithCode } from "./types";
import SearchBar from "./components/SearchBar";
import TOTPCard from "./components/TOTPCard";
import DeleteModal from "./components/DeleteModal";
import AddModal from "./components/AddModal";
import ImportModal from "./components/ImportModal";
import AuthScreen from "./components/AuthScreen";
import { GetEntries, AddEntry, DeleteEntry } from "../wailsjs/go/core/EntryHandler";
import { ImportFromURI } from "../wailsjs/go/core/ImportHandler";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<EntryWithCode[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EntryWithCode | null>(null);

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

  if (!authenticated) {
    return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
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
