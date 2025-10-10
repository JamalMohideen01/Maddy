export class Graph {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this._nextNodeId = 1;
    this._nextEdgeId = 1;
  }

  addNode(x, y) {
    const node = { id: String(this._nextNodeId++), x, y };
    this.nodes.push(node);
    return node.id;
  }

  addEdge(sourceId, targetId, weight = 1, directed = false) {
    if (sourceId === targetId) return null;
    const id = String(this._nextEdgeId++);
    const edge = { id, sourceId, targetId, weight, directed };
    this.edges.push(edge);
    return id;
  }

  removeNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.edges = this.edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId);
  }

  removeEdge(edgeId) {
    this.edges = this.edges.filter(e => e.id !== edgeId);
  }

  findNodeAt(x, y, radius = 16) {
    for (const n of this.nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy <= radius * radius) return n;
    }
    return null;
  }

  getNeighbors(nodeId, directed = false) {
    const neighbors = new Map();
    for (const e of this.edges) {
      if (e.sourceId === nodeId) {
        neighbors.set(e.targetId, (neighbors.get(e.targetId) || 0) + 1);
        if (!directed && !e.directed) {
          neighbors.set(e.sourceId, (neighbors.get(e.sourceId) || 0) + 0);
        }
      }
      if (!directed && !e.directed) {
        if (e.targetId === nodeId) {
          neighbors.set(e.sourceId, (neighbors.get(e.sourceId) || 0) + 1);
        }
      } else if (directed && e.targetId === nodeId) {
        neighbors.set(e.sourceId, (neighbors.get(e.sourceId) || 0) + 1);
      }
    }
    return neighbors;
  }

  degree(nodeId, directed = false) {
    if (directed) {
      let out = 0, inp = 0;
      for (const e of this.edges) {
        if (e.sourceId === nodeId) out++;
        if (e.targetId === nodeId) inp++;
      }
      return { out, in: inp };
    } else {
      let deg = 0;
      for (const e of this.edges) {
        if (e.directed) continue;
        if (e.sourceId === nodeId || e.targetId === nodeId) deg++;
      }
      return deg;
    }
  }

  serialize() {
    return { nodes: this.nodes.map(n => ({ ...n })), edges: this.edges.map(e => ({ ...e })) };
  }

  setFrom(data) {
    this.nodes = (data.nodes || []).map(n => ({ id: String(n.id), x: n.x, y: n.y }));
    this.edges = (data.edges || []).map(e => ({ id: String(e.id), sourceId: String(e.sourceId), targetId: String(e.targetId), weight: e.weight ?? 1, directed: !!e.directed }));
    // Update ID counters
    this._nextNodeId = this.nodes.reduce((m, n) => Math.max(m, Number(n.id)), 0) + 1;
    this._nextEdgeId = this.edges.reduce((m, e) => Math.max(m, Number(e.id)), 0) + 1;
  }
}
