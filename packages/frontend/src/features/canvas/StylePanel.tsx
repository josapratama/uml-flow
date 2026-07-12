import React from "react";
import type { NodeStyle, EdgeStyle } from "@uml-editor/shared";
import {
  FONT_OPTIONS,
  FONT_SIZES,
  COLOR_PRESETS,
  DEFAULT_NODE_STYLE,
  DEFAULT_EDGE_STYLE,
} from "@uml-editor/shared";

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

export function StylePanel(props: Props) {
  const { type, onClose } = props;
  const title =
    (props as any).title || (type === "node" ? "Node Style" : "Edge Style");

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

function NodeStyleControls({
  style,
  onChange,
}: {
  style: NodeStyle;
  onChange: (s: NodeStyle) => void;
}) {
  const s = { ...DEFAULT_NODE_STYLE, ...style };

  return (
    <>
      {/* Font Family */}
      <Section label="Font Family">
        <select
          className="w-full px-2 py-1.5 bg-surface-3 border border-border rounded text-xs text-text outline-none"
          value={s.fontFamily}
          onChange={(e) => onChange({ ...style, fontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </Section>

      {/* Font Size */}
      <Section label="Font Size">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="9"
            max="24"
            value={s.fontSize}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, fontSize: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {s.fontSize}px
          </span>
        </div>
      </Section>

      {/* Font Weight & Style */}
      <Section label="Font Style">
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.fontWeight === "bold"}
            onClick={() =>
              onChange({
                ...style,
                fontWeight: s.fontWeight === "bold" ? "normal" : "bold",
              })
            }
          >
            B
          </ToggleBtn>
          <ToggleBtn
            active={s.fontStyle === "italic"}
            onClick={() =>
              onChange({
                ...style,
                fontStyle: s.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          >
            I
          </ToggleBtn>
        </div>
      </Section>

      {/* Font Color */}
      <Section label="Font Color">
        <ColorPicker
          value={s.fontColor!}
          onChange={(v) => onChange({ ...style, fontColor: v })}
        />
      </Section>

      {/* Background Color */}
      <Section label="Background">
        <ColorPicker
          value={s.backgroundColor!}
          onChange={(v) => onChange({ ...style, backgroundColor: v })}
        />
      </Section>

      {/* Border Color */}
      <Section label="Border Color">
        <ColorPicker
          value={s.borderColor!}
          onChange={(v) => onChange({ ...style, borderColor: v })}
        />
      </Section>

      {/* Border Width */}
      <Section label="Border Width">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={s.borderWidth}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, borderWidth: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {s.borderWidth}px
          </span>
        </div>
      </Section>

      {/* Border Style */}
      <Section label="Border Style">
        <div className="flex gap-1.5">
          {(["solid", "dashed", "dotted", "none"] as const).map((bs) => (
            <button
              key={bs}
              className={`flex-1 py-1.5 text-[10px] rounded border transition-all ${
                (s as any).borderStyle === bs
                  ? "bg-accent/20 border-accent text-accent font-medium"
                  : "bg-surface-3 border-border text-text-muted hover:text-text"
              }`}
              onClick={() => onChange({ ...style, borderStyle: bs })}
            >
              {bs}
            </button>
          ))}
        </div>
      </Section>

      {/* Border Radius */}
      <Section label="Corner Radius">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="20"
            value={s.borderRadius}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, borderRadius: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {s.borderRadius}px
          </span>
        </div>
      </Section>

      {/* Opacity */}
      <Section label="Opacity">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={s.opacity}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, opacity: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {Math.round(s.opacity! * 100)}%
          </span>
        </div>
      </Section>

      {/* Reset */}
      <button
        className="w-full py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-3 transition-colors"
        onClick={() => onChange({})}
      >
        Reset to Default
      </button>
    </>
  );
}

function EdgeStyleControls({
  style,
  onChange,
}: {
  style: EdgeStyle;
  onChange: (s: EdgeStyle) => void;
}) {
  const s = { ...DEFAULT_EDGE_STYLE, ...style };

  return (
    <>
      <Section label="Stroke Color">
        <ColorPicker
          value={s.strokeColor!}
          onChange={(v) => onChange({ ...style, strokeColor: v })}
        />
      </Section>

      <Section label="Stroke Width">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={s.strokeWidth}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, strokeWidth: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {s.strokeWidth}px
          </span>
        </div>
      </Section>

      <Section label="Label Font">
        <select
          className="w-full px-2 py-1.5 bg-surface-3 border border-border rounded text-xs text-text outline-none"
          value={s.fontFamily}
          onChange={(e) => onChange({ ...style, fontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </Section>

      <Section label="Label Size">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="9"
            max="18"
            value={s.fontSize}
            className="flex-1 accent-accent"
            onChange={(e) =>
              onChange({ ...style, fontSize: Number(e.target.value) })
            }
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {s.fontSize}px
          </span>
        </div>
      </Section>

      <Section label="Label Color">
        <ColorPicker
          value={s.fontColor!}
          onChange={(v) => onChange({ ...style, fontColor: v })}
        />
      </Section>

      <button
        className="w-full py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-3 transition-colors"
        onClick={() => onChange({})}
      >
        Reset to Default
      </button>
    </>
  );
}

// --- Shared UI components ---

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 bg-surface-3 border border-border rounded text-xs text-text font-mono outline-none"
        />
      </div>
      <div className="grid grid-cols-10 gap-1">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            className={`w-5 h-5 rounded-sm border ${value === c ? "border-accent ring-1 ring-accent" : "border-border"}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

function ToggleBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-bold transition-all ${
        active
          ? "bg-accent/20 border-accent text-accent"
          : "bg-surface-3 border-border text-text-muted hover:text-text"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
