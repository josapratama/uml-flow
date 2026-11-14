import React, { useState, useRef } from "react";
import type { AnnotationTool } from "./AnnotationToolbar";

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface AnnotationStroke {
  id: string;
  tool: AnnotationTool;
  color: string;
  width: number;
  points: AnnotationPoint[];
}

interface Props {
  strokes: AnnotationStroke[];
  isAnnotating: boolean;
  activeTool: AnnotationTool;
  activeColor: string;
  onAddStroke: (stroke: AnnotationStroke) => void;
  viewScale: number;
  viewOffsetX: number;
  viewOffsetY: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function pointsToPath(points: AnnotationPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function AnnotationLayer({
  strokes,
  isAnnotating,
  activeTool,
  activeColor,
  onAddStroke,
  viewScale,
  viewOffsetX,
  viewOffsetY,
  svgRef,
}: Props) {
  const [currentPoints, setCurrentPoints] = useState<AnnotationPoint[]>([]);
  const isDrawingRef = useRef(false);

  const getCanvasCoords = (e: React.PointerEvent): AnnotationPoint | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewOffsetX) / viewScale;
    const y = (e.clientY - rect.top - viewOffsetY) / viewScale;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isAnnotating || e.button !== 0) return;
    const pt = getCanvasCoords(e);
    if (!pt) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    setCurrentPoints([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !isAnnotating) return;
    const pt = getCanvasCoords(e);
    if (!pt) return;
    setCurrentPoints((prev) => [...prev, pt]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}

    if (currentPoints.length > 0) {
      const stroke: AnnotationStroke = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        tool: activeTool,
        color: activeColor,
        width: activeTool === "highlighter" ? 14 : 3,
        points: currentPoints,
      };
      onAddStroke(stroke);
    }
    setCurrentPoints([]);
  };

  return (
    <g className="annotation-layer-container">
      {/* Existing strokes rendered in SVG coordinate space */}
      <g className="annotation-strokes">
        {strokes.map((s) => {
          const pathD = pointsToPath(s.points);
          const isHighlight = s.tool === "highlighter";
          return (
            <path
              key={s.id}
              d={pathD}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={isHighlight ? 0.45 : 0.95}
              style={{ pointerEvents: "none" }}
            />
          );
        })}

        {/* Current stroke in progress */}
        {currentPoints.length > 0 && (
          <path
            d={pointsToPath(currentPoints)}
            stroke={activeColor}
            strokeWidth={activeTool === "highlighter" ? 14 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={activeTool === "highlighter" ? 0.45 : 0.95}
            style={{ pointerEvents: "none" }}
          />
        )}
      </g>

      {/* Transparent overlay for pointer capture when annotating */}
      {isAnnotating && (
        <rect
          x={-50000}
          y={-50000}
          width={100000}
          height={100000}
          fill="transparent"
          style={{ cursor: activeTool === "highlighter" ? "crosshair" : "crosshair", pointerEvents: "all" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}
    </g>
  );
}
