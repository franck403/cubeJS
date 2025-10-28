// Corker.js

// Import cubejs scripts inside the worker from jsDelivr
importScripts(
  'https://cdn.jsdelivr.net/gh/ldez/cubejs/lib/cube.js',
  'https://cdn.jsdelivr.net/gh/ldez/cubejs/lib/solve.js'
);

// Initialize solver (slow part, happens in worker)
Cube.initSolver();
postMessage({ type: 'ready' });

// Handle requests from main thread
onmessage = function (e) {
  const { type, state } = e.data;

  if (type === 'solve') {
    console.log("Solve Start")
    const cube = Cube.fromString(state); // reconstruct cube from string
    const solution = cube.solve();
    postMessage({ type: 'solution', solution });
  }
};
