import React from "react";

export function ArrowDefs({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const isDark = theme === "dark";
  const markerStroke = isDark ? "#cbd5e1" : "#555";
  const markerFill = isDark ? "#cbd5e1" : "#555";
  const hollowFill = isDark ? "#12121f" : "white";

  return (
    <>
      {/* Inheritance - hollow triangle */}
      <marker
        id="arrow-inheritance"
        markerWidth="16"
        markerHeight="16"
        refX="2"
        refY="8"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 14 8 L 2 14 Z"
          fill={hollowFill}
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>

      {/* Realization - hollow triangle */}
      <marker
        id="arrow-realization"
        markerWidth="16"
        markerHeight="16"
        refX="2"
        refY="8"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 14 8 L 2 14 Z"
          fill={hollowFill}
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>

      {/* Association - open arrow */}
      <marker
        id="arrow-association"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 12 7 L 2 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>

      {/* Dependency - open arrow */}
      <marker
        id="arrow-dependency"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 12 7 L 2 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>

      {/* Aggregation - hollow diamond (at source) */}
      <marker
        id="arrow-aggregation"
        markerWidth="18"
        markerHeight="14"
        refX="1"
        refY="7"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 1 7 L 9 1 L 17 7 L 9 13 Z"
          fill={hollowFill}
          stroke={markerStroke}
          strokeWidth="1.5"
        />
      </marker>

      {/* Composition - filled diamond (at source) */}
      <marker
        id="arrow-composition"
        markerWidth="18"
        markerHeight="14"
        refX="1"
        refY="7"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 1 7 L 9 1 L 17 7 L 9 13 Z"
          fill={markerFill}
          stroke={markerStroke}
          strokeWidth="1.5"
        />
      </marker>

      {/* Flow - filled arrow (activity/flowchart) */}
      <marker
        id="arrow-flow"
        markerWidth="12"
        markerHeight="12"
        refX="2"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M 2 2 L 10 6 L 2 10 Z" fill={markerFill} />
      </marker>

      {/* Transition - filled arrow (state) */}
      <marker
        id="arrow-transition"
        markerWidth="12"
        markerHeight="12"
        refX="2"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path d="M 2 2 L 10 6 L 2 10 Z" fill={markerFill} />
      </marker>

      {/* Include/Extend */}
      <marker
        id="arrow-include"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 12 7 L 2 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>
      <marker
        id="arrow-extend"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 12 7 L 2 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>

      {/* ERD markers */}
      <marker
        id="arrow-one-to-one"
        markerWidth="1"
        markerHeight="1"
        refX="0"
        refY="0"
        orient="auto"
      >
        <path d="" />
      </marker>
      <marker
        id="arrow-one-to-many"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 6 2 L 12 7 L 6 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>
      <marker
        id="arrow-many-to-many"
        markerWidth="14"
        markerHeight="14"
        refX="2"
        refY="7"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 6 2 L 12 7 L 6 12"
          fill="none"
          stroke={markerStroke}
          strokeWidth="2"
        />
      </marker>
    </>
  );
}
