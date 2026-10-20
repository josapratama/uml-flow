import React, { useEffect, useRef, useState, useLayoutEffect } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode | string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  children?: ContextMenuItem[];
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x, y });
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const submenuTimerRef = useRef<any>(null);

  // Auto-clamp to viewport boundaries
  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const padding = 10;
    let nextX = x;
    let nextY = y;

    if (x + rect.width > window.innerWidth - padding) {
      nextX = Math.max(padding, window.innerWidth - rect.width - padding);
    }
    if (y + rect.height > window.innerHeight - padding) {
      nextY = Math.max(padding, window.innerHeight - rect.height - padding);
    }

    setCoords({ x: nextX, y: nextY });
  }, [x, y]);

  // Click outside and escape handling
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
      if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    };
  }, [onClose]);

  const handleItemHover = (index: number, hasChildren: boolean) => {
    if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    if (hasChildren) {
      setActiveSubmenu(index);
    } else {
      submenuTimerRef.current = setTimeout(() => {
        setActiveSubmenu(null);
      }, 150);
    }
  };

  return (
    <div
      ref={ref}
      className="fixed z-100 bg-surface-2/95 backdrop-blur-md border border-border/80 rounded-xl shadow-2xl py-1.5 min-w-[200px] text-xs select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ left: coords.x, top: coords.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="h-px bg-border/60 my-1 mx-1.5" />;
        }

        const hasSubmenu = !!(item.children && item.children.length > 0);
        const isSubmenuOpen = activeSubmenu === i;

        return (
          <div
            key={i}
            className="relative px-1"
            onMouseEnter={() => handleItemHover(i, hasSubmenu)}
          >
            <button
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                item.disabled
                  ? "opacity-35 cursor-not-allowed text-text-muted"
                  : item.danger
                  ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  : isSubmenuOpen
                  ? "bg-surface-3 text-text"
                  : "text-text hover:bg-surface-3 hover:text-text"
              }`}
              onClick={() => {
                if (item.disabled) return;
                if (!hasSubmenu && item.action) {
                  item.action();
                  onClose();
                }
              }}
              disabled={item.disabled}
            >
              <div className="flex items-center gap-2 truncate">
                {item.icon && (
                  <span className="w-4 flex items-center justify-center text-sm shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                {item.shortcut && (
                  <span className="text-[10px] font-mono text-text-muted/60 bg-surface-4/60 px-1.5 py-0.5 rounded border border-border/40">
                    {item.shortcut}
                  </span>
                )}
                {hasSubmenu && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="opacity-50"
                  >
                    <path
                      d="M3.5 2 L6.5 5 L3.5 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Submenu */}
            {hasSubmenu && isSubmenuOpen && (
              <Submenu
                items={item.children!}
                onClose={onClose}
                parentRect={ref.current?.getBoundingClientRect()}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Submenu({
  items,
  onClose,
  parentRect,
}: {
  items: ContextMenuItem[];
  onClose: () => void;
  parentRect?: DOMRect;
}) {
  const subRef = useRef<HTMLDivElement>(null);
  const [alignLeft, setAlignLeft] = useState(false);

  useLayoutEffect(() => {
    if (!subRef.current || !parentRect) return;
    const rect = subRef.current.getBoundingClientRect();
    // If overflowing right side, flip to left of parent menu
    if (parentRect.right + rect.width > window.innerWidth - 10) {
      setAlignLeft(true);
    }
  }, [parentRect]);

  return (
    <div
      ref={subRef}
      className={`absolute top-0 z-110 bg-surface-2/95 backdrop-blur-md border border-border/80 rounded-xl shadow-2xl py-1.5 min-w-[170px] text-xs select-none animate-in fade-in zoom-in-95 duration-100 ${
        alignLeft ? "right-full mr-1" : "left-full ml-1"
      }`}
    >
      {items.map((subItem, si) => {
        if (subItem.separator) {
          return <div key={si} className="h-px bg-border/60 my-1 mx-1.5" />;
        }
        return (
          <div key={si} className="px-1">
            <button
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                subItem.disabled
                  ? "opacity-35 cursor-not-allowed text-text-muted"
                  : subItem.danger
                  ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  : "text-text hover:bg-surface-3 hover:text-text"
              }`}
              onClick={() => {
                if (subItem.disabled) return;
                if (subItem.action) {
                  subItem.action();
                  onClose();
                }
              }}
              disabled={subItem.disabled}
            >
              <div className="flex items-center gap-2 truncate">
                {subItem.icon && (
                  <span className="w-4 flex items-center justify-center text-sm shrink-0">
                    {subItem.icon}
                  </span>
                )}
                <span className="font-medium truncate">{subItem.label}</span>
              </div>
              {subItem.shortcut && (
                <span className="text-[10px] font-mono text-text-muted/60 bg-surface-4/60 px-1.5 py-0.5 rounded border border-border/40 ml-2">
                  {subItem.shortcut}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
