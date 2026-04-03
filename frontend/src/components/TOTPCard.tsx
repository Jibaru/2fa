import { useRef, useState, useCallback } from "react";
import { EntryWithCode } from "../types";
import CircularTimer from "./CircularTimer";

interface TOTPCardProps {
  entry: EntryWithCode;
  onCopy: () => void;
  onDelete: () => void;
}

export default function TOTPCard({ entry, onCopy, onDelete }: TOTPCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const formattedCode =
    entry.code.slice(0, 3) + " " + entry.code.slice(3);

  const title = entry.issuer
    ? entry.name
      ? `${entry.issuer} (${entry.name})`
      : entry.issuer
    : entry.name || "Unknown";

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [onCopy]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      startXRef.current = e.clientX;
      currentXRef.current = 0;
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const diff = e.clientX - startXRef.current;
      if (diff < 0) {
        const clamped = Math.max(diff, -120);
        currentXRef.current = clamped;
        setTranslateX(clamped);
      }
    },
    [dragging]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    if (currentXRef.current < -60) {
      onDelete();
    }
    setTranslateX(0);
  }, [onDelete]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white font-semibold px-6 w-28">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </div>

      <div
        className="relative bg-white px-4 py-4 border-b border-gray-100 cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging ? "none" : "transform 0.3s ease",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 truncate">{title}</p>
            <p className="text-3xl font-bold text-gray-800 tracking-wider mt-0.5">
              {formattedCode}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              title="Copy code"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <CircularTimer remaining={entry.remaining} period={entry.period} />
          </div>
        </div>
      </div>
    </div>
  );
}
