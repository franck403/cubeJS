// cube.js
let cube; // keep cube instance global
document.getElementById('res').innerHTML = 'Initializing solver in worker...';

// Draw scrambled cube immediately
function initCube() {
  cube = new Cube();
  cube.move("U F R2 B' D2 L'");
  cube.randomize();

  // Show cube state right away
  document.getElementById('cube').innerHTML = cube.asString();
  drawCube(cube.asString(), 'cubeCanvas');
}
initCube();

// Start the worker
const worker = new Worker('Corker.js');

worker.onmessage = function (e) {
  if (e.data.type === 'ready') {
    document.getElementById('res').innerHTML = 'Solver ready!';

    // Now that solver is ready, send the cube state
    worker.postMessage({ type: 'solve', state: cube.asString() });
  }

  if (e.data.type === 'solution') {
    document.getElementById('res').innerHTML = 'Solution: ' + e.data.solution;

    const moves = e.data.solution.trim().split(/\s+/);
    // Animate the cube solving step by step
    animateSolution(cube, moves, 'cubeCanvas', 600);
  }
};
