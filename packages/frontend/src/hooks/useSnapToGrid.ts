/**
 * Snaps a coordinate to the nearest grid point.
 */
export function snapToGrid(value: number, gridSize: number = 20): number {
  return Math.round(value / gridSize) * gridSize;
}
