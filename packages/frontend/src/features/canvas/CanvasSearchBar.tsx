import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Diagram, DiagramNode } from "@uml-editor/shared";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onSelectNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
}

export function CanvasSearchBar({
  isOpen,
  onClose,
  diagram,
  onSelectNode,
  onFocusNode,
}: Props) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery("");
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Find matching nodes based on query
  const matches: DiagramNode[] = useMemo(() => {
    if (!diagram || !query.trim()) return [];
    const q = query.trim().toLowerCase();

    return (diagram.nodes || []).filter((node) => {
      // Check node name
      if (node.name && node.name.toLowerCase().includes(q)) return true;
      // Check node id
      if (node.id && node.id.toLowerCase().includes(q)) return true;

      // Check class attributes/methods
      if ("attributes" in node && Array.isArray((node as any).attributes)) {
        const hasAttr = (node as any).attributes.some(
          (a: any) =>
            a.name?.toLowerCase().includes(q) ||
            a.type?.toLowerCase().includes(q),
        );
        if (hasAttr) return true;
      }
      if ("methods" in node && Array.isArray((node as any).methods)) {
        const hasMethod = (node as any).methods.some(
          (m: any) =>
            m.name?.toLowerCase().includes(q) ||
            m.returnType?.toLowerCase().includes(q),
        );
        if (hasMethod) return true;
      }

      return false;
    });
  }, [diagram, query]);

  // Navigate to current match
  useEffect(() => {
    if (matches.length > 0) {
      const clampedIndex = Math.min(currentIndex, matches.length - 1);
      const target = matches[clampedIndex];
      if (target) {
        onSelectNode(target.id);
        onFocusNode(target.id);
      }
    }
  }, [matches, currentIndex, onSelectNode, onFocusNode]);

  const handleNext = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2/95 backdrop-blur-md border border-border/80 rounded-xl shadow-2xl text-xs">
        {/* Search Icon */}
        <span className="text-text-muted text-sm select-none">🔍</span>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari node, class, entity, atau method..."
          className="w-56 sm:w-72 bg-transparent text-text placeholder:text-text-muted/60 outline-none text-xs font-medium"
        />

        {/* Clear query button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setCurrentIndex(0);
              inputRef.current?.focus();
            }}
            className="w-4 h-4 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-[10px]"
            title="Clear search"
          >
            ×
          </button>
        )}

        {/* Matches Badge */}
        {query.trim() && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              matches.length > 0
                ? "bg-accent/15 text-accent font-semibold"
                : "bg-red-500/15 text-red-400 font-semibold"
            }`}
          >
            {matches.length > 0
              ? `${currentIndex + 1}/${matches.length}`
              : "0 hasil"}
          </span>
        )}

        <div className="w-px h-4 bg-border/60 mx-0.5" />

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          disabled={matches.length <= 1}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Match Sebelumnya (Shift+Enter / ↑)"
        >
          ▲
        </button>
        <button
          onClick={handleNext}
          disabled={matches.length <= 1}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Match Berikutnya (Enter / ↓)"
        >
          ▼
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
          title="Tutup Pencarian (Esc)"
        >
          ×
        </button>
      </div>
    </div>
  );
}
