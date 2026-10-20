import React from "react";
import type { NodeStyle } from "@uml-editor/shared";
import { FONT_OPTIONS, DEFAULT_NODE_STYLE } from "@uml-editor/shared";
import { PALETTE_PRESETS } from "../../../config/palettePresets";
import { Section, ColorPicker, ToggleBtn } from "./StyleFieldComponents";
import { useI18n } from "../../../i18n";

interface NodeStyleControlsProps {
  style: NodeStyle;
  onChange: (s: NodeStyle) => void;
}

export function NodeStyleControls({ style, onChange }: NodeStyleControlsProps) {
  const { t } = useI18n();
  const s = { ...DEFAULT_NODE_STYLE, ...style };

  return (
    <>
      {/* 1-Click Curated Palettes */}
      <Section label={t("style.curatedPalettes")}>
        <div className="grid grid-cols-2 gap-1.5">
          {PALETTE_PRESETS.map((pal) => (
            <button
              key={pal.name}
              type="button"
              onClick={() =>
                onChange({
                  ...style,
                  backgroundColor: pal.bg,
                  borderColor: pal.border,
                  fontColor: pal.font,
                })
              }
              className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-surface-3 hover:border-accent text-left transition-all active:scale-95 group"
              title={`${t("style.applyThemeTitle")} ${pal.name}`}
            >
              <div
                className="w-3.5 h-3.5 rounded-sm border shrink-0 shadow-2xs"
                style={{ backgroundColor: pal.bg, borderColor: pal.border }}
              />
              <span className="text-[11px] font-medium text-text truncate group-hover:text-accent">
                {pal.label}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Font Family */}
      <Section label={t("style.fontFamily")}>
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
      <Section label={t("style.fontSize")}>
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
      <Section label={t("style.fontStyle")}>
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
      <Section label={t("style.fontColor")}>
        <ColorPicker
          value={s.fontColor!}
          onChange={(v) => onChange({ ...style, fontColor: v })}
        />
      </Section>

      {/* Background Color */}
      <Section label={t("style.background")}>
        <ColorPicker
          value={s.backgroundColor!}
          onChange={(v) => onChange({ ...style, backgroundColor: v })}
        />
      </Section>

      {/* Border Color */}
      <Section label={t("style.borderColor")}>
        <ColorPicker
          value={s.borderColor!}
          onChange={(v) => onChange({ ...style, borderColor: v })}
        />
      </Section>

      {/* Border Width */}
      <Section label={t("style.borderWidth")}>
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
      <Section label={t("style.borderStyle")}>
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
      <Section label={t("style.cornerRadius")}>
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
      <Section label={t("style.opacity")}>
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
        {t("style.resetToDefault")}
      </button>
    </>
  );
}
