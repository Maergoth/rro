export const CARDINAL_EDGES = ["north", "east", "south", "west"] as const;

export type CardinalEdge = typeof CARDINAL_EDGES[number];
export type WallSegmentAxis = "horizontal" | "vertical";

export interface WallLocation {
  x: number;
  y: number;
  edge: CardinalEdge;
}

export interface CanonicalWallSegment {
  axis: WallSegmentAxis;
  x: number;
  y: number;
}

export function isCardinalEdge(value: unknown): value is CardinalEdge {
  return CARDINAL_EDGES.includes(value as CardinalEdge);
}

/**
 * Returns the one physical grid-line segment represented by a cell edge.
 * Opposite descriptions of a shared edge intentionally resolve to the same
 * value: (x,y,north) === (x,y-1,south), and likewise east/west.
 */
export function canonicalWallSegment(x: number, y: number, edge: CardinalEdge): CanonicalWallSegment {
  switch (edge) {
    case "north": return { axis: "horizontal", x, y };
    case "east": return { axis: "vertical", x: x + 1, y };
    case "south": return { axis: "horizontal", x, y: y + 1 };
    case "west": return { axis: "vertical", x, y };
  }
}

export function canonicalWallSegmentKey(x: number, y: number, edge: CardinalEdge): string {
  const segment = canonicalWallSegment(x, y, edge);
  return `${segment.axis}:${segment.x}:${segment.y}`;
}

export function mirroredWallLocation(x: number, y: number, edge: CardinalEdge): WallLocation {
  switch (edge) {
    case "north": return { x, y: y - 1, edge: "south" };
    case "east": return { x: x + 1, y, edge: "west" };
    case "south": return { x, y: y + 1, edge: "north" };
    case "west": return { x: x - 1, y, edge: "east" };
  }
}
