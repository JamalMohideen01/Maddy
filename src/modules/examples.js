import { Graph } from './graph.js';

function fromAdjacency(coords, edges, directed = false) {
  const g = new Graph();
  for (const [x, y] of coords) g.addNode(x, y);
  for (const [u, v] of edges) g.addEdge(String(u), String(v), 1, directed);
  return g.serialize();
}

export const examples = {
  grid() {
    const coords = [];
    const cols = 4, rows = 3, spacing = 180, offsetX = 140, offsetY = 120;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        coords.push([offsetX + c * spacing, offsetY + r * spacing]);
      }
    }
    const edges = [];
    const idx = (r, c) => r * cols + c + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols) edges.push([idx(r, c), idx(r, c + 1)]);
        if (r + 1 < rows) edges.push([idx(r, c), idx(r + 1, c)]);
      }
    }
    return fromAdjacency(coords, edges);
  },
  k5() {
    const R = 220, cx = 520, cy = 300;
    const coords = Array.from({ length: 5 }, (_, i) => [
      cx + R * Math.cos((i / 5) * Math.PI * 2),
      cy + R * Math.sin((i / 5) * Math.PI * 2)
    ]);
    const edges = [];
    for (let i = 1; i <= 5; i++) {
      for (let j = i + 1; j <= 5; j++) edges.push([i, j]);
    }
    return fromAdjacency(coords, edges);
  },
  k33() {
    const left = [[260, 180], [260, 320], [260, 460]];
    const right = [[760, 180], [760, 320], [760, 460]];
    const coords = [...left, ...right];
    const edges = [];
    for (let i = 1; i <= 3; i++) {
      for (let j = 4; j <= 6; j++) edges.push([i, j]);
    }
    return fromAdjacency(coords, edges);
  },
  tree() {
    const coords = [[520,120],[320,260],[720,260],[240,420],[400,420],[640,420],[800,420]];
    const edges = [[1,2],[1,3],[2,4],[2,5],[3,6],[3,7]];
    return fromAdjacency(coords, edges);
  },
  random(n = 10, p = 0.25) {
    const coords = [];
    const cx = 520, cy = 300, R = 250;
    n = Math.min(24, Math.max(2, n));
    for (let i = 0; i < n; i++) {
      coords.push([
        cx + R * Math.cos((i / n) * Math.PI * 2),
        cy + R * Math.sin((i / n) * Math.PI * 2)
      ]);
    }
    const edges = [];
    for (let i = 1; i <= n; i++) {
      for (let j = i + 1; j <= n; j++) {
        if (Math.random() < p) edges.push([i, j]);
      }
    }
    return fromAdjacency(coords, edges);
  }
};
