function buildAdj(graph) {
  const adj = new Map();
  for (const n of graph.nodes) adj.set(n.id, new Set());
  for (const e of graph.edges) {
    if (e.directed) continue; // Keep undirected for Hamiltonian exploration
    adj.get(e.sourceId).add(e.targetId);
    adj.get(e.targetId).add(e.sourceId);
  }
  return adj;
}

export function findHamiltonPath(graph) {
  const adj = buildAdj(graph);
  const nodes = graph.nodes.map(n => n.id);
  const N = nodes.length;
  if (N === 0) return [];
  const visited = new Set();
  const path = [];

  function dfs(u) {
    path.push(u);
    if (path.length === N) return true;
    visited.add(u);
    for (const v of adj.get(u)) {
      if (!visited.has(v)) {
        if (dfs(v)) return true;
      }
    }
    visited.delete(u);
    path.pop();
    return false;
  }

  for (const start of nodes) {
    visited.clear(); path.length = 0;
    if (dfs(start)) return path.slice();
  }
  return null;
}

export function findHamiltonCycle(graph) {
  const adj = buildAdj(graph);
  const nodes = graph.nodes.map(n => n.id);
  const N = nodes.length;
  if (N < 3) return null;
  const start = nodes[0];
  const visited = new Set([start]);
  const path = [start];

  function dfs(u) {
    if (path.length === N) {
      if (adj.get(u).has(start)) return true;
      return false;
    }
    for (const v of adj.get(u)) {
      if (!visited.has(v)) {
        visited.add(v);
        path.push(v);
        if (dfs(v)) return true;
        path.pop();
        visited.delete(v);
      }
    }
    return false;
  }

  if (dfs(start)) return path.slice();
  return null;
}
