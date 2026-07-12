import React, { useState, useRef, useEffect } from "react";

interface Props {
  x: number;
  y: number;
  width: number;
  initialValue: string;
  onSubmit: (value: string) => void;
  onChange?: (value: string) => void;
  onCancel: () => void;
  scale?: number;
}

/**
 * Inline text editor that blends seamlessly with the node.
 * No visible border/box — just a text cursor appearing in place.
 * Looks like editing text directly on the canvas.
 */
export function InlineEditor({
  x,
  y,
  width,
  initialValue,
  onSubmit,
  onChange,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    onChange?.(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const inputWidth = Math.max(width, 100);

  return (
    <foreignObject x={x} y={y - 12} width={inputWidth} height={24}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => onSubmit(value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "100%",
          padding: "0 4px",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          color: "#1e293b",
          backgroundColor: "rgba(255,255,255,0.95)",
          border: "none",
          borderBottom: "none",
          borderRadius: 0,
          outline: "none",
          caretColor: "#6366f1",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      />
    </foreignObject>
  );
}
