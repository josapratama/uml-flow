import { useMemo, useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { useI18n } from "../../i18n";

interface Props {
  diagram: Diagram;
  viewOffsetX: number;
  viewOffsetY: number;
  viewScale: number;
  containerWidth: number;
  containerHeight: number;
  theme?: CanvasTheme;
}

const MINIMAP_W = 120;
const MINIMAP_H = 75;

export function Minimap({
  diagram,
  viewOffsetX,
  viewOffsetY,
  viewScale,
  containerWidth,
  containerHeight,
  theme = "light",
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const bounds = useMemo(() => {
    const allPositions: { x: number; y: number; w: number; h: number }[] = [];
    for (const n of diagram.nodes) {
      allPositions.push({
        x: n.position.x,
        y: n.position.y,
        w: n.size.width,
        h: n.size.height,
      });
    }
    for (const p of diagram.participants || []) {
      allPositions.push({
        x: p.position.x - 40,
        y: p.position.y - 20,
        w: 80,
        h: 40,
      });
    }
    // For sequence: extend bounds to cover lifelines
    if (diagram.type === "sequence" && diagram.messages?.length) {
      const msgCount = diagram.messages.length;
      const lifelineEnd = 100 + (msgCount + 2) * 50 + 40;
      for (const p of diagram.participants || []) {
        allPositions.push({
          x: p.position.x - 5,
          y: 90,
          w: 10,
          h: lifelineEnd - 90,
        });
      }
    }
    if (allPositions.length === 0)
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of allPositions) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + p.w);
      maxY = Math.max(maxY, p.y + p.h);
    }
    const pad = 50;
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
    };
  }, [diagram.nodes, diagram.participants, diagram.messages, diagram.type]);

  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const scaleX = MINIMAP_W / worldW;
  const scaleY = MINIMAP_H / worldH;
  const s = Math.min(scaleX, scaleY);

  const vpX = (-viewOffsetX / viewScale - bounds.minX) * s;
  const vpY = (-viewOffsetY / viewScale - bounds.minY) * s;
  const vpW = (containerWidth / viewScale) * s;
  const vpH = (containerHeight / viewScale) * s;

  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === "dark";
  const bgClass = isDark
    ? "bg-surface-2/95 border-border text-text"
    : "bg-white/95 border-slate-200 text-slate-800";
  const nodeColor = isDark ? "#818cf8" : "#6366f1";
  const vpStroke = isDark ? "#a5b4fc" : "#6366f1";

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={`absolute bottom-3 right-3 z-10 px-2.5 py-1 text-xs font-medium rounded-lg shadow-md border backdrop-blur-md flex items-center gap-1.5 transition-all ${
          isDark
            ? "bg-surface-2/90 hover:bg-surface-3 text-text-muted hover:text-text border-border"
            : "bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 border-slate-200"
        }`}
        title={isId ? "Tampilkan minimap diagram" : "Show diagram minimap"}
      >
        <span>🗺️</span>
        <span className="text-[11px]">Minimap</span>
      </button>
    );
  }

  return (
    <div
      className={`absolute bottom-3 right-3 z-10 ${bgClass} border rounded-xl shadow-lg overflow-hidden backdrop-blur-md transition-all`}
    >
      <div className="flex items-center justify-between px-2 py-1 border-b border-border/40 text-[9px] font-semibold text-text-muted select-none">
        <span>MINIMAP</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-text-muted hover:text-text px-1 rounded hover:bg-surface-3 text-xs leading-none"
          title={isId ? "Minimalkan peta" : "Minimize map"}
        >
          −
        </button>
      </div>
      <svg width={MINIMAP_W} height={MINIMAP_H}>
        {/* Nodes */}
        {diagram.nodes.map((n) => (
          <rect
            key={n.id}
            x={(n.position.x - bounds.minX) * s}
            y={(n.position.y - bounds.minY) * s}
            width={n.size.width * s}
            height={n.size.height * s}
            fill={nodeColor}
            opacity="0.3"
            rx="1"
          />
        ))}
        {/* Participants (sequence) */}
        {(diagram.participants || []).map((p) => (
          <g key={`mp_${p.id}`}>
            <rect
              x={(p.position.x - 30 - bounds.minX) * s}
              y={(p.position.y - 10 - bounds.minY) * s}
              width={60 * s}
              height={20 * s}
              fill={nodeColor}
              opacity="0.4"
              rx="1"
            />
            {/* Lifeline */}
            <line
              x1={(p.position.x - bounds.minX) * s}
              y1={(p.position.y + 10 - bounds.minY) * s}
              x2={(p.position.x - bounds.minX) * s}
              y2={MINIMAP_H - 10}
              stroke={nodeColor}
              strokeWidth="0.5"
              opacity="0.3"
              strokeDasharray="2,1"
            />
          </g>
        ))}
        {/* Viewport indicator */}
        <rect
          x={vpX}
          y={vpY}
          width={vpW}
          height={vpH}
          fill="none"
          stroke={vpStroke}
          strokeWidth="1.5"
          rx="1"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
