import React, { useEffect, useState } from "react";
import type { DiagramNode, ClassNode, ERDEntity } from "@uml-editor/shared";
import { PropRow } from "./properties/PropRow";
import { ClassPropertiesSection } from "./properties/ClassPropertiesSection";
import { ERDPropertiesSection } from "./properties/ERDPropertiesSection";
import { useI18n } from "../../i18n";

interface Props {
  node: DiagramNode;
  onClose: () => void;
  /** Which tab is active. "style" renders `styleSlot`. */
  tab?: "props" | "style";
  onTabChange?: (tab: "props" | "style") => void;
  styleSlot?: React.ReactNode;
  onOpenStyle?: () => void;
  onOpenGlobalStyle?: () => void;
  onUpdateNode?: (
    nodeId: string,
    patch: { name?: string; width?: number; height?: number },
  ) => void;
  onAutoFit?: (nodeId: string) => void;
  onApplyStyleToType?: (nodeId: string) => void;
  onAddAttribute?: (
    nodeId: string,
    name: string,
    type: string,
    visibility: string,
  ) => void;
  onAddMethod?: (
    nodeId: string,
    name: string,
    returnType: string,
    visibility: string,
  ) => void;
  onDeleteAttribute?: (nodeId: string, index: number) => void;
  onDeleteMethod?: (nodeId: string, index: number) => void;
  onAddERDColumn?: (
    nodeId: string,
    name: string,
    type: string,
    isPK: boolean,
    isFK: boolean,
    isNullable: boolean,
  ) => void;
  onDeleteERDColumn?: (nodeId: string, index: number) => void;
}

const inputCls =
  "w-full px-2 py-1.5 bg-surface-3 border border-border rounded text-xs text-text outline-none focus:border-accent transition-colors";

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(Math.round(value)));
  useEffect(() => setDraft(String(Math.round(value))), [value]);
  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0 && Math.round(n) !== Math.round(value)) onCommit(n);
    else setDraft(String(Math.round(value)));
  };
  return (
    <label className="flex-1 min-w-0">
      <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
        {label}
      </span>
      <input
        type="number"
        min={20}
        className={inputCls}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </label>
  );
}

export function PropertyPanel({
  node,
  onClose,
  tab = "props",
  onTabChange,
  styleSlot,
  onOpenStyle,
  onOpenGlobalStyle,
  onUpdateNode,
  onAutoFit,
  onApplyStyleToType,
  onAddAttribute,
  onAddMethod,
  onDeleteAttribute,
  onDeleteMethod,
  onAddERDColumn,
  onDeleteERDColumn,
}: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const isClassOrErd = "attributes" in node;
  const [nameDraft, setNameDraft] = useState(node.name);
  useEffect(() => setNameDraft(node.name), [node.id, node.name]);

  const commitName = () => {
    if (!onUpdateNode) return;
    if (nameDraft.trim() && nameDraft.trim() !== node.name)
      onUpdateNode(node.id, { name: nameDraft });
    else setNameDraft(node.name);
  };

  const tabBtn = (id: "props" | "style", label: string) => (
    <button
      type="button"
      onClick={() => (id === "style" ? onOpenStyle?.() : onTabChange?.("props"))}
      className={`flex-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
        tab === id
          ? "border-accent text-accent"
          : "border-transparent text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute z-20 bg-surface-2 shadow-xl overflow-y-auto right-0 left-0 bottom-0 max-h-[55vh] border-t border-border rounded-t-xl md:left-auto md:top-0 md:max-h-none md:w-72 md:rounded-none md:border-t-0 md:border-l">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">{t("properties.title")}</h3>
        <div className="flex gap-1">
          {onOpenGlobalStyle && (
            <button
              onClick={onOpenGlobalStyle}
              className="px-2 py-1 text-[10px] bg-surface-3 border border-border rounded text-text-muted hover:text-accent hover:border-accent transition-colors"
              title={t("properties.globalStyle")}
            >
              🌐 {isId ? "Semua" : "All"}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex border-b border-border px-2">
        {tabBtn("props", isId ? "Properti" : "Properties")}
        {tabBtn("style", isId ? "🎨 Style" : "🎨 Style")}
      </div>

      {tab === "style" ? (
        <div className="p-4 space-y-4">
          {styleSlot}
          {onApplyStyleToType && (
            <button
              type="button"
              onClick={() => onApplyStyleToType(node.id)}
              className="w-full py-1.5 text-xs text-accent border border-accent/40 rounded hover:bg-accent/10 transition-colors"
            >
              {isId
                ? `Terapkan style ini ke semua node "${node.type}"`
                : `Apply this style to all "${node.type}" nodes`}
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <PropRow label={t("properties.nodeType")}>
            <span className="px-2 py-0.5 bg-surface-3 rounded text-[11px] text-accent">
              {node.type}
            </span>
            {(node as any).alias && (
              <span className="ml-1.5 px-2 py-0.5 bg-surface-3 rounded text-[11px] text-text-muted font-mono">
                {(node as any).alias}
              </span>
            )}
          </PropRow>

          <PropRow label={t("properties.nodeName")}>
            {onUpdateNode && !isClassOrErd ? (
              <textarea
                className={`${inputCls} resize-y min-h-[64px] leading-snug`}
                rows={Math.min(8, Math.max(2, nameDraft.split("\n").length + 1))}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) (e.target as HTMLTextAreaElement).blur();
                  if (e.key === "Escape") setNameDraft(node.name);
                }}
                placeholder={isId ? "Baris pertama = judul. Enter = baris baru" : "First line = title. Enter = new line"}
              />
            ) : (
              <span className="whitespace-pre-wrap break-words">{node.name}</span>
            )}
          </PropRow>

          <PropRow label={isId ? "Posisi" : "Position"}>
            x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
          </PropRow>

          <div>
            <div className="flex gap-2">
              <NumberField
                label={isId ? "Lebar" : "Width"}
                value={node.size.width}
                onCommit={(v) => onUpdateNode?.(node.id, { width: v })}
              />
              <NumberField
                label={isId ? "Tinggi" : "Height"}
                value={node.size.height}
                onCommit={(v) => onUpdateNode?.(node.id, { height: v })}
              />
            </div>
            {onAutoFit && (
              <button
                type="button"
                onClick={() => onAutoFit(node.id)}
                className="mt-2 w-full py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-3 hover:text-accent hover:border-accent transition-colors"
                title={isId ? "Sesuaikan ukuran dengan isi teks" : "Fit size to text"}
              >
                ⤢ {isId ? "Auto-fit ukuran" : "Auto-fit size"}
              </button>
            )}
          </div>

          {"attributes" in node && "methods" in node && (
            <ClassPropertiesSection
              node={node as ClassNode}
              onAddAttribute={onAddAttribute}
              onAddMethod={onAddMethod}
              onDeleteAttribute={onDeleteAttribute}
              onDeleteMethod={onDeleteMethod}
            />
          )}
          {"attributes" in node && !("methods" in node) && (
            <ERDPropertiesSection
              node={node as ERDEntity}
              onAddColumn={onAddERDColumn}
              onDeleteColumn={onDeleteERDColumn}
            />
          )}
        </div>
      )}
    </div>
  );
}
