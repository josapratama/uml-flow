import React, { useEffect, useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import { useI18n } from "../../i18n";

interface Props {
  diagram: Diagram;
  edgeId: string;
  onClose: () => void;
  onLabelEdit: (edgeId: string, label: string) => void;
  onTypeChange: (edgeId: string, type: string) => void;
  onReverse: (edgeId: string) => void;
  onOpenStyle: () => void;
}

const EDGE_TYPES = [
  "association",
  "dependency",
  "inheritance",
  "realization",
  "aggregation",
  "composition",
  "flow",
  "include",
  "extend",
];

const inputCls =
  "w-full px-2 py-1.5 bg-surface-3 border border-border rounded text-xs text-text outline-none focus:border-accent transition-colors";

export function EdgePropertyPanel({
  diagram,
  edgeId,
  onClose,
  onLabelEdit,
  onTypeChange,
  onReverse,
  onOpenStyle,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const edge = diagram.edges.find((e) => e.id === edgeId);
  const currentLabel = (edge as any)?.label?.text ?? (edge as any)?.condition ?? "";
  const [draft, setDraft] = useState(currentLabel);
  useEffect(() => setDraft(currentLabel), [edgeId, currentLabel]);
  if (!edge) return null;

  const name = (id: string) => diagram.nodes.find((n) => n.id === id)?.name ?? id;
  const short = (s: string) => (s.length > 38 ? s.slice(0, 36) + "…" : s);
  const types = EDGE_TYPES.includes(edge.type) ? EDGE_TYPES : [edge.type, ...EDGE_TYPES];

  return (
    <div className="absolute z-20 bg-surface-2 shadow-xl overflow-y-auto right-0 left-0 bottom-0 max-h-[55vh] border-t border-border rounded-t-xl md:left-auto md:top-0 md:max-h-none md:w-72 md:rounded-none md:border-t-0 md:border-l">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">
          {isId ? "Properti Relasi" : "Edge Properties"}
        </h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text transition-colors"
        >
          ×
        </button>
      </div>
      <div className="p-4 space-y-3 text-xs text-text">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
            {isId ? "Dari → Ke" : "From → To"}
          </div>
          <div className="break-words">
            {short(name(edge.source))} <span className="text-accent">→</span> {short(name(edge.target))}
          </div>
          <button
            type="button"
            onClick={() => onReverse(edge.id)}
            className="mt-2 w-full py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-3 hover:text-accent hover:border-accent transition-colors"
          >
            ⇄ {isId ? "Balik arah" : "Reverse direction"}
          </button>
        </div>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
            {isId ? "Label / Kondisi" : "Label / Condition"}
          </span>
          <input
            className={inputCls}
            value={draft}
            placeholder={isId ? "mis. Ya / Tidak" : "e.g. Yes / No"}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => draft !== currentLabel && onLabelEdit(edge.id, draft)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
            {isId ? "Tipe relasi" : "Relation type"}
          </span>
          <select
            className={inputCls}
            value={edge.type}
            onChange={(e) => onTypeChange(edge.id, e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onOpenStyle}
          className="w-full py-1.5 text-xs text-accent border border-accent/40 rounded hover:bg-accent/10 transition-colors"
        >
          🎨 {isId ? "Style garis" : "Line style"}
        </button>
      </div>
    </div>
  );
}

