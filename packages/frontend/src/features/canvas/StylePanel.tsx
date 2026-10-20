import React from "react";
import type { NodeStyle, EdgeStyle } from "@uml-editor/shared";
import { PALETTE_PRESETS } from "../../config/palettePresets";
import { NodeStyleControls } from "./style/NodeStyleControls";
import { EdgeStyleControls } from "./style/EdgeStyleControls";

interface NodeStylePanelProps {
  type: "node";
  style: NodeStyle;
  onChange: (style: NodeStyle) => void;
  onClose: () => void;
  title?: string;
}

interface EdgeStylePanelProps {
  type: "edge";
  style: EdgeStyle;
  onChange: (style: EdgeStyle) => void;
  onClose: () => void;
  title?: string;
}

type Props = NodeStylePanelProps | EdgeStylePanelProps;

// Export for backwards compatibility
export const CURATED_PALETTES = PALETTE_PRESETS;

import { useI18n } from "../../i18n";

export function StylePanel(props: Props) {
  const { type, onClose } = props;
  const { t } = useI18n();
  const title =
    (props as any).title || (type === "node" ? t("style.nodeStyle") : t("style.edgeStyle"));

  return (
    <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface-2 border-r border-border overflow-y-auto z-20 shadow-xl">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text">{title}</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text"
        >
          ×
        </button>
      </div>
      <div className="p-4 space-y-4">
        {type === "node" ? (
          <NodeStyleControls
            style={(props as NodeStylePanelProps).style}
            onChange={(props as NodeStylePanelProps).onChange}
          />
        ) : (
          <EdgeStyleControls
            style={(props as EdgeStylePanelProps).style}
            onChange={(props as EdgeStylePanelProps).onChange}
          />
        )}
      </div>
    </div>
  );
}
