import React, { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-100 bg-surface-2 border border-border rounded-lg shadow-2xl py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => {
        if (item.separator)
          return <div key={i} className="h-px bg-border my-1" />;
        return (
          <button
            key={i}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => {
              item.action();
              onClose();
            }}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="w-4 text-center text-sm">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
