import { Graph } from './modules/graph.js';
import { renderGraph } from './modules/render.js';
import { enableEditor } from './modules/editor.js';
import { analyzeGraph, findEulerTrailOrCircuit } from './algorithms/eulerian.js';
import { findHamiltonPath, findHamiltonCycle } from './algorithms/hamiltonian.js';
import { examples } from './modules/examples.js';

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const graph = new Graph();

function updateStats() {
  document.getElementById('vertexCount').value = String(graph.nodes.length);
  document.getElementById('edgeCount').value = String(graph.edges.length);
  const { connected, eulerianType } = analyzeGraph(graph, {
    directed: document.getElementById('directedToggle').checked,
  });
  const connectedEl = document.getElementById('connected');
  connectedEl.value = connected ? 'Yes' : 'No';
  connectedEl.className = connected ? 'good' : 'bad';

  const eulerEl = document.getElementById('eulerian');
  eulerEl.value = eulerianType;
  eulerEl.className = /^Circuit|^Trail/.test(eulerianType) ? 'good' : 'bad';
  // Hamiltonian is NP-complete; we won't compute automatically for large graphs
  document.getElementById('hamiltonian').value = graph.nodes.length <= 12 ? 'Check via buttons' : 'Too large';
}

function redraw(highlight = {}) {
  renderGraph(ctx, graph, highlight);
  updateStats();
}

// Editor
enableEditor(canvas, graph, redraw, {
  getDirected: () => document.getElementById('directedToggle').checked,
  getWeighted: () => document.getElementById('weightedToggle').checked,
});

// Buttons
function setGraph(g) {
  graph.setFrom(g);
  redraw();
}

document.getElementById('newGraphBtn').addEventListener('click', () => setGraph({ nodes: [], edges: [] }));
document.getElementById('randomGraphBtn').addEventListener('click', () => setGraph(examples.random()));
document.getElementById('gridGraphBtn').addEventListener('click', () => setGraph(examples.grid()));
document.getElementById('k5GraphBtn').addEventListener('click', () => setGraph(examples.k5()));
document.getElementById('k33GraphBtn').addEventListener('click', () => setGraph(examples.k33()));
document.getElementById('treeGraphBtn').addEventListener('click', () => setGraph(examples.tree()));

document.getElementById('findEulerTrailBtn').addEventListener('click', () => {
  const result = findEulerTrailOrCircuit(graph);
  if (result && result.length) {
    const pathEdges = new Set(result.map(e => e.id));
    redraw({ edges: pathEdges });
  } else if (result && result.length === 0) {
    // Trivial case: no usable undirected edges
    redraw();
  } else {
    redraw();
    alert('No Euler trail/circuit found.');
  }
});

document.getElementById('findHamiltonPathBtn').addEventListener('click', () => {
  if (graph.nodes.length > 16) {
    alert('Graph too large for exhaustive Hamilton path search.');
    return;
  }
  const path = findHamiltonPath(graph);
  if (path) {
    redraw({ nodes: new Set(path) });
  } else {
    redraw();
    alert('No Hamilton path found.');
  }
});

document.getElementById('findHamiltonCycleBtn').addEventListener('click', () => {
  if (graph.nodes.length > 16) {
    alert('Graph too large for exhaustive Hamilton cycle search.');
    return;
  }
  const cycle = findHamiltonCycle(graph);
  if (cycle) {
    redraw({ nodes: new Set(cycle) });
  } else {
    redraw();
    alert('No Hamilton cycle found.');
  }
});

// Import/Export
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const exportArea = document.getElementById('exportArea');

exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(graph.serialize(), null, 2);
  exportArea.value = data;
});

importInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    graph.setFrom(data);
    redraw();
  } catch (err) {
    alert('Invalid JSON');
  }
});

// Initial example
setGraph(examples.grid());
redraw();
