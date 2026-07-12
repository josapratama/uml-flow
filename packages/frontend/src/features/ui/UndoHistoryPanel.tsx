interface Props {
  isOpen: boolean;
  onClose: () => void;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
}

/** Undo/redo history panel with real stack sizes and action buttons. */
export function UndoHistoryPanel({
  isOpen,
  onClose,
  undoCount,
  redoCount,
  onUndo,
  onRedo,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-56 bg-surface-2 border-r border-border z-20 shadow-xl flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text">History</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-text"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Undo stack */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              Undo Stack
            </span>
            <span className="text-[10px] text-accent font-mono">
              {undoCount}
            </span>
          </div>
          {undoCount === 0 ? (
            <div className="text-[11px] text-text-muted/50 italic px-1">
              No undo history
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* Most recent action at top */}
              <div className="flex items-center gap-2 px-2 py-1.5 bg-accent/10 border border-accent/20 rounded text-[11px] text-text">
                <span className="text-accent text-xs">↩</span>
                <span className="font-medium">Current state</span>
              </div>
              {Array.from({ length: Math.min(undoCount, 9) }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1 bg-surface-3 rounded text-[11px] text-text-muted"
                  style={{ opacity: 1 - i * 0.08 }}
                >
                  <span className="text-text-muted/60 text-xs">↩</span>
                  <span>State {undoCount - i}</span>
                </div>
              ))}
              {undoCount > 9 && (
                <div className="text-[10px] text-text-muted/40 px-2 py-0.5">
                  +{undoCount - 9} older states
                </div>
              )}
            </div>
          )}
        </div>

        {/* Redo stack */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              Redo Stack
            </span>
            <span className="text-[10px] text-accent font-mono">
              {redoCount}
            </span>
          </div>
          {redoCount === 0 ? (
            <div className="text-[11px] text-text-muted/50 italic px-1">
              No redo history
            </div>
          ) : (
            <div className="space-y-0.5">
              {Array.from({ length: Math.min(redoCount, 5) }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-1 bg-surface-3 rounded text-[11px] text-text-muted"
                >
                  <span className="text-accent/60 text-xs">↪</span>
                  <span>Redo {i + 1}</span>
                </div>
              ))}
              {redoCount > 5 && (
                <div className="text-[10px] text-text-muted/40 px-2 py-0.5">
                  +{redoCount - 5} more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="border-t border-border pt-3 space-y-1">
          <div className="text-[10px] text-text-muted/60">Shortcuts</div>
          <div className="text-[10px] text-text-muted flex justify-between">
            <span>Undo</span>
            <kbd className="font-mono bg-surface-3 px-1 rounded">Ctrl+Z</kbd>
          </div>
          <div className="text-[10px] text-text-muted flex justify-between">
            <span>Redo</span>
            <kbd className="font-mono bg-surface-3 px-1 rounded">Ctrl+Y</kbd>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <button
          onClick={onUndo}
          disabled={undoCount === 0}
          className="flex-1 py-1.5 text-xs bg-surface-3 border border-border rounded text-text-muted hover:text-text hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={redoCount === 0}
          className="flex-1 py-1.5 text-xs bg-surface-3 border border-border rounded text-text-muted hover:text-text hover:border-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↪ Redo
        </button>
      </div>
    </div>
  );
}
