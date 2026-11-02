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
  fontColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
}

/**
 * Inline text editor that blends seamlessly with the node.
 * No visible border/box — transparent background with a crisp blinking caret.
 * Looks and feels like editing text directly on the canvas.
 */
export function InlineEditor({
  x,
  y,
  width,
  initialValue,
  onSubmit,
  onChange,
  onCancel,
  fontColor,
  fontSize,
  fontFamily,
  fontWeight,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Place caret at the end of the text without solid selection block
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
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
    <foreignObject x={x} y={y - 12} width={inputWidth} height={24} style={{ overflow: "visible" }}>
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
          height: "24px",
          lineHeight: "24px",
          boxSizing: "border-box",
          margin: 0,
          padding: "0 2px",
          fontSize: `${fontSize || 13}px`,
          fontWeight: fontWeight || 600,
          fontFamily: fontFamily || "Inter, system-ui, sans-serif",
          textAlign: "center",
          color: fontColor || "#f1f5f9",
          backgroundColor: "transparent",
          background: "transparent",
          border: "none",
          borderBottom: "none",
          borderRadius: 0,
          outline: "none",
          caretColor: "#38bdf8",
          boxShadow: "none",
        }}
      />
    </foreignObject>
  );
}
