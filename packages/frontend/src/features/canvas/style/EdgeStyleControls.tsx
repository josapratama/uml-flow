import React from "react";
import type { EdgeStyle } from "@uml-editor/shared";
import { FONT_OPTIONS, DEFAULT_EDGE_STYLE } from "@uml-editor/shared";
import { Section, ColorPicker } from "./StyleFieldComponents";
import { useI18n } from "../../../i18n";

interface EdgeStyleControlsProps {
  style: EdgeStyle;
  onChange: (s: EdgeStyle) => void;
}

export function EdgeStyleControls({ style, onChange }: EdgeStyleControlsProps) {
  const { t } = useI18n();
  const s = { ...DEFAULT_EDGE_STYLE, ...style };

  return (
    <>
      <Section label={t("style.strokeColor")}>
        <ColorPicker
          value={s.strokeColor!}
          onChange={(v) => onChange({ ...style, strokeColor: v })}
        />
      </Section>

      <Section label={t("style.strokeWidth")}>
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

      <Section label={t("style.labelFont")}>
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

      <Section label={t("style.labelSize")}>
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

      <Section label={t("style.labelColor")}>
        <ColorPicker
          value={s.fontColor!}
          onChange={(v) => onChange({ ...style, fontColor: v })}
        />
      </Section>

      <button
        className="w-full py-1.5 text-xs text-text-muted border border-border rounded hover:bg-surface-3 transition-colors"
        onClick={() => onChange({})}
      >
        {t("style.resetToDefault")}
      </button>
    </>
  );
}
