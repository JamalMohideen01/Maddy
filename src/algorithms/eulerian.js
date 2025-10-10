function isConnectedUndirected(graph) {
  if (graph.nodes.length === 0) return true;
  const adj = new Map();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    if (e.directed) continue;
    adj.get(e.sourceId)?.push(e.targetId);
    adj.get(e.targetId)?.push(e.sourceId);
  }
  const nonIsolated = new Set();
  for (const [u, vs] of adj.entries()) if (vs.length > 0) nonIsolated.add(u);
  if (nonIsolated.size === 0) return true;
  const start = nonIsolated.values().next().value;
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const v of adj.get(u)) if (!visited.has(v)) stack.push(v);
  }
  for (const u of nonIsolated) if (!visited.has(u)) return false;
  return true;
}

export function analyzeGraph(graph, { directed = false } = {}) {
  // We focus on undirected Eulerian properties for simplicity; ignore directed edges
  const connected = isConnectedUndirected(graph);
  let oddCount = 0;
  for (const n of graph.nodes) {
    const deg = graph.degree(n.id, false);
    if (deg % 2 === 1) oddCount++;
  }
  let eulerianType = 'None';
  if (connected) {
    if (oddCount === 0) eulerianType = 'Circuit (all even degrees)';
    else if (oddCount === 2) eulerianType = 'Trail (exactly two odd vertices)';
    else eulerianType = 'None (odd vertices > 2)';
  } else {
    eulerianType = 'None (disconnected)';
  }
  return { connected, eulerianType };
}

export function findEulerTrailOrCircuit(graph) {
  // Hierholzer's algorithm on the undirected subgraph (ignore directed edges)
  // Build multigraph adjacency with edge ids to track used edges
  const adj = new Map(); // nodeId -> Array<{to, edgeId}>
  for (const n of graph.nodes) adj.set(n.id, []);
  let usableEdgeCount = 0;
  for (const e of graph.edges) {
    if (e.directed) continue;
    adj.get(e.sourceId).push({ to: e.targetId, edgeId: e.id });
    adj.get(e.targetId).push({ to: e.sourceId, edgeId: e.id });
    usableEdgeCount++;
  }
  if (usableEdgeCount === 0) return [];

  // Find start vertex: odd degree if trail, otherwise any with degree > 0
  const degree = new Map();
  for (const n of graph.nodes) degree.set(n.id, 0);
  for (const [u, list] of adj.entries()) degree.set(u, list.length);
  let start = null; let odd = 0;
  for (const [u, deg] of degree.entries()) {
    if (deg % 2 === 1) { odd++; if (!start) start = u; }
    if (!start && deg > 0) start = u;
  }
  if (!start) return [];
  if (odd !== 0 && odd !== 2) return null;

  // Copy adjacency because we'll mutate
  const local = new Map();
  for (const [u, list] of adj.entries()) local.set(u, list.slice());
  const used = new Set();
  const stack = [start];
  const circuit = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    const edges = local.get(u);
    while (edges && edges.length && used.has(edges[edges.length - 1].edgeId)) edges.pop();
    if (!edges || edges.length === 0) {
      circuit.push(u);
      stack.pop();
    } else {
      const { to: v, edgeId } = edges.pop();
      if (used.has(edgeId)) continue;
      used.add(edgeId);
      // remove reverse edge
      const rev = local.get(v);
      for (let i = rev.length - 1; i >= 0; i--) if (rev[i].edgeId === edgeId) { rev.splice(i, 1); break; }
      stack.push(v);
    }
  }
  if (used.size !== usableEdgeCount) return null;
  // Build edge traversal from circuit of vertices
  const edgesInOrder = [];
  for (let i = 1; i < circuit.length; i++) {
    const u = circuit[i - 1], v = circuit[i];
    // find the corresponding edge by scanning original edges and checking if not yet taken
    for (const e of graph.edges) {
      if (e.directed) continue;
      if ((e.sourceId === u && e.targetId === v) || (e.sourceId === v && e.targetId === u)) {
        // Use a multiset count; track via edgesInOrder ids count
        const countInOrder = edgesInOrder.filter(x => x.id === e.id).length;
        if (countInOrder === 0) { edgesInOrder.push(e); break; }
      }
    }
  }
  return edgesInOrder;
}
