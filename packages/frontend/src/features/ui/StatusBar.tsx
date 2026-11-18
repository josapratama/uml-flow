import { useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { useI18n } from "../../i18n";
import { validateDiagramNodes } from "../../services/diagram-validator";

interface Props {
  diagram: Diagram | null;
  undoCount: number;
  redoCount: number;
  snapEnabled?: boolean;
  onSnapToggle?: () => void;
  onOpenMetrics?: () => void;
}

/** Bottom status bar showing diagram statistics, grid snap status, and save status. */
export function StatusBar({
  diagram,
  undoCount,
  redoCount,
  snapEnabled,
  onSnapToggle,
  onOpenMetrics,
}: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  const warnings = useMemo(() => {
    if (!diagram) return [];
    return validateDiagramNodes(diagram, locale);
  }, [diagram, locale]);

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
        <span className="opacity-50">|</span>
        <button
          onClick={onOpenMetrics}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
            warnings.length === 0
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          }`}
          title={
            warnings.length === 0
              ? isId
                ? "Kesehatan Diagram: 100% Sempurna (Klik untuk periksa metrik & kompleksitas)"
                : "Diagram Health: 100% Optimal (Click for metrics & complexity)"
              : isId
              ? `${warnings.length} catatan kesehatan diagram ditemukan (Klik untuk analisis & perbaikan)`
              : `${warnings.length} diagram health warnings found (Click to review)`
          }
        >
          <span>{warnings.length === 0 ? "🩺" : "⚠️"}</span>
          <span>
            {warnings.length === 0
              ? isId
                ? "100% Sehat"
                : "100% Optimal"
              : `${warnings.length} ${isId ? "Catatan" : "Warnings"}`}
          </span>
        </button>
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
