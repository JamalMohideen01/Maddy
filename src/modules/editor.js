import { RADIUS } from './render.js';

export function enableEditor(canvas, graph, redraw, opts) {
  let state = { tool: 'move', draggedNodeId: null, edgeStartNodeId: null };

  function setToolFromUI() {
    const tool = document.querySelector('input[name="tool"]:checked')?.value || 'move';
    state.tool = tool;
  }

  document.querySelectorAll('input[name="tool"]').forEach(el => el.addEventListener('change', setToolFromUI));
  setToolFromUI();

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getMousePos(e);
    const node = graph.findNodeAt(x, y, RADIUS + 4);

    if (state.tool === 'move') {
      if (node) {
        state.draggedNodeId = node.id;
      }
    } else if (state.tool === 'add-node') {
      graph.addNode(x, y);
      redraw();
    } else if (state.tool === 'add-edge') {
      if (node) {
        if (!state.edgeStartNodeId) {
          state.edgeStartNodeId = node.id;
        } else if (state.edgeStartNodeId !== node.id) {
          const directed = opts.getDirected();
          const startNode = graph.nodes.find(n => n.id === state.edgeStartNodeId);
          const endNode = node;
          const dist = startNode && endNode ? Math.hypot(endNode.x - startNode.x, endNode.y - startNode.y) : 0;
          const weight = opts.getWeighted() ? Math.max(1, Math.round(dist / 50)) : 1;
          graph.addEdge(state.edgeStartNodeId, node.id, weight, directed);
          state.edgeStartNodeId = null;
          redraw();
        }
      }
    } else if (state.tool === 'delete') {
      if (node) {
        graph.removeNode(node.id);
        redraw();
        return;
      }
      // Try delete an edge by proximity
      let closestEdge = null; let minDist = 12;
      for (const e of graph.edges) {
        const s = graph.nodes.find(n => n.id === e.sourceId);
        const t = graph.nodes.find(n => n.id === e.targetId);
        if (!s || !t) continue;
        const dist = pointToSegmentDistance({x, y}, s, t);
        if (dist < minDist) { minDist = dist; closestEdge = e; }
      }
      if (closestEdge) {
        graph.removeEdge(closestEdge.id);
        redraw();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (state.tool === 'move' && state.draggedNodeId) {
      const { x, y } = getMousePos(e);
      const node = graph.nodes.find(n => n.id === state.draggedNodeId);
      if (!node) return;
      node.x = x; node.y = y;
      redraw();
    }
  });

  canvas.addEventListener('mouseup', () => {
    state.draggedNodeId = null;
  });
}

function pointToSegmentDistance(p, v, w) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}
