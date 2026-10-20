import React from "react";

export function SvgInlineInput({
  x,
  y,
  width,
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  x: number;
  y: number;
  width: number;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <foreignObject x={x} y={y - 12} width={width} height={24}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onCommit}
        autoFocus
        style={{
          width: "100%",
          height: "100%",
          fontSize: "11px",
          textAlign: "center",
          border: "1px solid #6366f1",
          borderRadius: "3px",
          outline: "none",
          padding: "0 4px",
          background: "white",
          color: "#333",
        }}
      />
    </foreignObject>
  );
}
