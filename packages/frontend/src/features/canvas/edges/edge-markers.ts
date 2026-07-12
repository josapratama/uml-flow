/**
 * Returns the marker length (in px) for a given edge type.
 * Used to offset the line endpoint so the arrow tip lands at the node border.
 */
export function getMarkerLength(type: string): number {
  switch (type) {
    case "inheritance":
    case "realization":
      return 14;
    case "association":
    case "dependency":
    case "include":
    case "extend":
    case "one-to-many":
    case "many-to-many":
      return 12;
    case "aggregation":
    case "composition":
      return 17;
    case "flow":
    case "transition":
      return 10;
    default:
      return 0;
  }
}

/** Check if edge type uses a dashed stroke. */
export function isDashedEdge(type: string): boolean {
  return ["dependency", "realization", "include", "extend"].includes(type);
}

/** Check if edge type has marker at start (diamond shapes). */
export function hasStartMarker(type: string): boolean {
  return ["aggregation", "composition"].includes(type);
}

/** Get the marker URL for an edge type. */
export function getMarkerEnd(type: string): string | undefined {
  return hasStartMarker(type) ? undefined : `url(#arrow-${type})`;
}

/** Get the marker-start URL for an edge type. */
export function getMarkerStart(type: string): string | undefined {
  return hasStartMarker(type) ? `url(#arrow-${type})` : undefined;
}
