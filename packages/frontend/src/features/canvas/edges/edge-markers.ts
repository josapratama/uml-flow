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
      return 12;
    case "one-to-one":
      return 16;
    case "one-to-many":
      return 18;
    case "many-to-many":
      return 20;
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

/** Check if edge type has marker at start (aggregation, composition, and ERD relations). */
export function hasStartMarker(type: string): boolean {
  return ["aggregation", "composition", "one-to-one", "one-to-many", "many-to-many"].includes(type);
}

/** Get the marker URL for an edge type. */
export function getMarkerEnd(type: string): string | undefined {
  if (type === "aggregation" || type === "composition") return undefined;
  return `url(#arrow-${type})`;
}

/** Get the marker-start URL for an edge type. */
export function getMarkerStart(type: string): string | undefined {
  if (type === "aggregation" || type === "composition") {
    return `url(#arrow-${type})`;
  }
  if (type === "one-to-one" || type === "one-to-many") {
    return `url(#arrow-one-to-one)`;
  }
  if (type === "many-to-many") {
    return `url(#arrow-one-to-many)`;
  }
  return undefined;
}
