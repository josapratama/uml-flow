import type { Diagram } from "@uml-editor/shared";
import { useI18n } from "../../i18n";

interface Props {
  diagram: Diagram | null;
  undoCount: number;
  redoCount: number;
  snapEnabled?: boolean;
  onSnapToggle?: () => void;
}

/** Bottom status bar showing diagram statistics, grid snap status, and save status. */
export function StatusBar({
  diagram,
  undoCount,
  redoCount,
  snapEnabled,
  onSnapToggle,
}: Props) {
  const { t, locale } = useI18n();
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
            {participantCount} {t("statusBar.participants")} · {messageCount} {t("statusBar.messages")}
          </span>
        ) : (
          <span>
            {nodeCount} {t("statusBar.nodes")} · {edgeCount} {t("statusBar.edges")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onSnapToggle !== undefined && (
          <button
            onClick={onSnapToggle}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              snapEnabled
                ? "text-accent bg-accent/10 hover:bg-accent/20 font-medium"
                : "text-text-muted hover:text-text hover:bg-surface-3"
            }`}
            title={locale === "id" ? "Klik untuk beralih mode Snap Grid (20px)" : "Click to toggle Snap to Grid (20px)"}
          >
            <span>⊞</span>
            <span>Grid: {snapEnabled ? "20px" : (locale === "id" ? "Bebas" : "Free")}</span>
          </button>
        )}
        {undoCount > 0 && <span>↩ {undoCount}</span>}
        {redoCount > 0 && <span>↪ {redoCount}</span>}
        <span className="text-success">● {t("statusBar.saved")}</span>
      </div>
    </div>
  );
}
