import React from "react";
import { COLOR_PRESETS } from "@uml-editor/shared";

export function Section({
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

export function ColorPicker({
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

export function ToggleBtn({
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
