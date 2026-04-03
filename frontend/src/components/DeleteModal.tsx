import { EntryWithCode } from "../types";

interface DeleteModalProps {
  entry: EntryWithCode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ entry, onConfirm, onCancel }: DeleteModalProps) {
  const title = entry.issuer || entry.name || "this entry";

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Delete Account
        </h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
