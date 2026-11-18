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

      {/* Sequence Return - open chevron arrow (UML 2.5 standard) */}
      <marker
        id="arrow-sequence-return"
        markerWidth="12"
        markerHeight="12"
        refX="2"
        refY="6"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 2 2 L 10 6 L 2 10"
          fill="none"
          stroke={markerStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>

      {/* ERD Crow's Foot markers (Martin / Information Engineering Standard) */}
      {/* Exactly One (||) */}
      <marker
        id="arrow-one-to-one"
        markerWidth="18"
        markerHeight="16"
        refX="16"
        refY="8"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <line x1="6" y1="3" x2="6" y2="13" stroke={markerStroke} strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="3" x2="12" y2="13" stroke={markerStroke} strokeWidth="2" strokeLinecap="round" />
      </marker>

      {/* One or Many (>|) */}
      <marker
        id="arrow-one-to-many"
        markerWidth="20"
        markerHeight="16"
        refX="18"
        refY="8"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <line x1="5" y1="3" x2="5" y2="13" stroke={markerStroke} strokeWidth="2" strokeLinecap="round" />
        <path
          d="M 18 8 L 6 2 M 18 8 L 6 14 M 18 8 L 5 8"
          fill="none"
          stroke={markerStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </marker>

      {/* Zero or Many (>o) */}
      <marker
        id="arrow-zero-to-many"
        markerWidth="22"
        markerHeight="16"
        refX="20"
        refY="8"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <circle cx="5" cy="8" r="3.5" fill={hollowFill} stroke={markerStroke} strokeWidth="1.5" />
        <path
          d="M 20 8 L 10 2 M 20 8 L 10 14 M 20 8 L 9 8"
          fill="none"
          stroke={markerStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </marker>

      {/* Zero or One (|o) */}
      <marker
        id="arrow-zero-to-one"
        markerWidth="20"
        markerHeight="16"
        refX="18"
        refY="8"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <circle cx="6" cy="8" r="3.5" fill={hollowFill} stroke={markerStroke} strokeWidth="1.5" />
        <line x1="14" y1="3" x2="14" y2="13" stroke={markerStroke} strokeWidth="2" strokeLinecap="round" />
      </marker>

      {/* Many-to-many (Crow's foot) */}
      <marker
        id="arrow-many-to-many"
        markerWidth="22"
        markerHeight="16"
        refX="20"
        refY="8"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <circle cx="5" cy="8" r="3.5" fill={hollowFill} stroke={markerStroke} strokeWidth="1.5" />
        <path
          d="M 20 8 L 10 2 M 20 8 L 10 14 M 20 8 L 9 8"
          fill="none"
          stroke={markerStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </marker>
    </>
  );
}
