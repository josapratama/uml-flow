import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { highlightCode } from "./syntax-highlight";

interface DSLEditorProps {
  code: string;
  onChange: (code: string) => void;
  onCompile: (code: string) => void;
  errors: any[];
}

export function DSLEditor({
  code,
  onChange,
  onCompile,
  errors,
}: DSLEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Search match count
  const matchCount = useMemo(() => {
    if (!searchTerm) return 0;
    try {
      return (
        code.match(
          new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
        ) || []
      ).length;
    } catch {
      return 0;
    }
  }, [code, searchTerm]);

  const handleReplace = useCallback(() => {
    if (!searchTerm) return;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    onChange(code.replace(new RegExp(escaped, "i"), replaceWith));
  }, [code, searchTerm, replaceWith, onChange]);

  const handleReplaceAll = useCallback(() => {
    if (!searchTerm) return;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    onChange(code.replace(new RegExp(escaped, "gi"), replaceWith));
    setShowSearch(false);
  }, [code, searchTerm, replaceWith, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        onCompile(code);
        return;
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart,
          end = ta.selectionEnd;
        onChange(code.substring(0, start) + "  " + code.substring(end));
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        }, 0);
      }
    },
    [code, onChange, onCompile],
  );

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const highlighted = useMemo(() => highlightCode(code), [code]);
  const lineCount = code.split("\n").length;
  const errorLines = new Set(errors.map((e) => e.line));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 bg-surface-3 border-b border-border">
        <span className="text-xs text-text-muted font-medium">Editor</span>
        <span className="text-[10px] text-text-muted/60">
          Ctrl+Enter to compile
        </span>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-3 border-b border-border">
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find..."
            className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded outline-none text-text"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSearch(false);
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <input
            type="text"
            value={replaceWith}
            onChange={(e) => setReplaceWith(e.target.value)}
            placeholder="Replace..."
            className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded outline-none text-text"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowSearch(false);
            }}
          />
          <span className="text-[10px] text-text-muted min-w-[30px]">
            {matchCount}
          </span>
          <button
            onClick={handleReplace}
            className="px-2 py-0.5 text-[10px] bg-surface-4 border border-border rounded text-text-muted hover:text-text"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            className="px-2 py-0.5 text-[10px] bg-surface-4 border border-border rounded text-text-muted hover:text-text"
          >
            All
          </button>
          <button
            onClick={() => setShowSearch(false)}
            className="text-text-muted hover:text-text text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="py-3 px-2 bg-surface-2 text-text-muted/50 font-mono text-[13px] leading-[1.6] text-right select-none overflow-hidden min-w-[40px]"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={errorLines.has(i + 1) ? "text-error font-bold" : ""}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area with overlay */}
        <div className="code-area">
          <div
            className="code-highlight"
            ref={highlightRef}
            dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
            aria-hidden="true"
          />
          <textarea
            ref={textareaRef}
            className="code-textarea"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
