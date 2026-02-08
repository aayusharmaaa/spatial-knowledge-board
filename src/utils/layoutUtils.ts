/**
 * Layout utilities for note positioning
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Generate a clean grid layout that spreads notes across the canvas.
 * Notes are placed in columns (masonry-style) centered at origin (0,0).
 */
export function generateMasonryLayout(
  count: number,
  containerWidth: number = 5000,
  _containerHeight: number = 4000,
  cardWidth: number = 280,
  cardHeight: number = 180,
  gap: number = 40
): Point[] {
  const points: Point[] = [];
  const cols = Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));
  const colHeights: number[] = new Array(cols).fill(0);

  const totalGridWidth = cols * (cardWidth + gap) - gap;
  const startX = -totalGridWidth / 2 + cardWidth / 2;

  for (let i = 0; i < count; i++) {
    // Find the shortest column
    let shortestCol = 0;
    for (let j = 1; j < cols; j++) {
      if (colHeights[j] < colHeights[shortestCol]) {
        shortestCol = j;
      }
    }

    const x = startX + shortestCol * (cardWidth + gap);
    const y = colHeights[shortestCol] + cardHeight / 2;

    colHeights[shortestCol] += cardHeight + gap;
    points.push({ x, y });
  }

  // Center vertically: shift all points so the grid is centered at y=0
  const maxHeight = Math.max(...colHeights);
  const yOffset = -maxHeight / 2;
  for (const p of points) {
    p.y += yOffset;
  }

  return points;
}
