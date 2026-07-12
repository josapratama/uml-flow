import type { Diagram } from "@uml-editor/shared";

interface Props {
  diagram: Diagram | null;
  undoCount: number;
  redoCount: number;
}

/** Bottom status bar showing diagram statistics and save status. */
export function StatusBar({ diagram, undoCount, redoCount }: Props) {
  if (!diagram) return null;

  const nodeCount = diagram.nodes.length;
  const edgeCount = diagram.edges.length;
  const participantCount = diagram.participants?.length || 0;
  const messageCount = diagram.messages?.length || 0;

  return (
    <div className="h-6 bg-surface flex items-center justify-between px-3 text-[10px] text-text-muted border-t border-border shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-accent font-medium">{diagram.type}</span>
        <span>{diagram.name}</span>
        <span className="opacity-50">|</span>
        {diagram.type === "sequence" ? (
          <span>
            {participantCount} participants · {messageCount} messages
          </span>
        ) : (
          <span>
            {nodeCount} nodes · {edgeCount} edges
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {undoCount > 0 && <span>↩ {undoCount}</span>}
        {redoCount > 0 && <span>↪ {redoCount}</span>}
        <span className="text-success">● Saved</span>
      </div>
    </div>
  );
}
