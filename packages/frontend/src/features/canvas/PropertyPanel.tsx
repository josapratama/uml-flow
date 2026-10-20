import React from "react";
import type { DiagramNode, ClassNode, ERDEntity } from "@uml-editor/shared";
import { PropRow } from "./properties/PropRow";
import { ClassPropertiesSection } from "./properties/ClassPropertiesSection";
import { ERDPropertiesSection } from "./properties/ERDPropertiesSection";
import { useI18n } from "../../i18n";

interface Props {
  node: DiagramNode;
  onClose: () => void;
  onOpenStyle?: () => void;
  onOpenGlobalStyle?: () => void;
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

export function PropertyPanel({
  node,
  onClose,
  onOpenStyle,
  onOpenGlobalStyle,
  onAddAttribute,
  onAddMethod,
  onDeleteAttribute,
  onDeleteMethod,
  onAddERDColumn,
  onDeleteERDColumn,
}: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-surface-2 border-l border-border overflow-y-auto z-20 shadow-xl">
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
          {onOpenStyle && (
            <button
              onClick={onOpenStyle}
              className="px-2 py-1 text-[10px] bg-surface-3 border border-border rounded text-text-muted hover:text-accent hover:border-accent transition-colors"
              title={t("properties.style")}
            >
              🎨 {isId ? "Node Ini" : "This"}
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
      <div className="p-4 space-y-3">
        <PropRow label={t("properties.nodeType")}>
          <span className="px-2 py-0.5 bg-surface-3 rounded text-[11px] text-accent">
            {node.type}
          </span>
        </PropRow>
        <PropRow label={t("properties.nodeName")}>{node.name}</PropRow>
        <PropRow label={isId ? "Posisi" : "Position"}>
          x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
        </PropRow>
        <PropRow label={isId ? "Ukuran" : "Size"}>
          {node.size.width} × {node.size.height}
        </PropRow>

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
    </div>
  );
}
