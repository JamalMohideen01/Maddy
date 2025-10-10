const NODE_R = 14;
const COLORS = {
  node: '#dce8ff',
  edge: '#7aa2f7',
  edgeDir: '#8bd3dd',
  edgeHL: '#a7ff83',
  text: '#9fb3d9',
  bg: '#0c1427'
};

export function renderGraph(ctx, graph, highlight = {}) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const highlightedEdges = highlight.edges || new Set();
  const highlightedNodes = highlight.nodes || new Set();

  // Edges
  for (const e of graph.edges) {
    const s = graph.nodes.find(n => n.id === e.sourceId);
    const t = graph.nodes.find(n => n.id === e.targetId);
    if (!s || !t) continue;

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const angle = Math.atan2(dy, dx);
    const sx = s.x + Math.cos(angle) * NODE_R;
    const sy = s.y + Math.sin(angle) * NODE_R;
    const tx = t.x - Math.cos(angle) * NODE_R;
    const ty = t.y - Math.sin(angle) * NODE_R;

    ctx.strokeStyle = highlightedEdges.has(e.id) ? COLORS.edgeHL : (e.directed ? COLORS.edgeDir : COLORS.edge);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    if (e.directed) {
      // Arrow head
      const headLen = 10; const headAngle = Math.PI / 7;
      const hx = tx; const hy = ty;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - headLen * Math.cos(angle - headAngle), hy - headLen * Math.sin(angle - headAngle));
      ctx.lineTo(hx - headLen * Math.cos(angle + headAngle), hy - headLen * Math.sin(angle + headAngle));
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }

    if (e.weight !== 1) {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      ctx.fillStyle = COLORS.text;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(e.weight), mx, my);
    }
  }

  // Nodes
  for (const n of graph.nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = highlightedNodes.has(n.id) ? COLORS.edgeHL : COLORS.node;
    ctx.fill();
    ctx.strokeStyle = '#2a3c70';
    ctx.stroke();

    ctx.fillStyle = '#0b1220';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.id, n.x, n.y);
  }

  ctx.restore();
}

export const RADIUS = NODE_R;
