// cube.js
let cube; // keep cube instance global
document.getElementById('res').innerHTML = 'Initializing solver in worker...';

// Draw scrambled cube immediately
function initCube() {
  cube = new Cube();
  cube.move("R U R' U'");

  // Show cube state right away
  document.getElementById('cube').innerHTML = cube.asString();
  drawCube(cube.asString(), 'cubeCanvas');
}
initCube();

// Start the worker
const worker = new Worker('Corker.js');

init3DCube("cube3d"); // start 3D cube

worker.onmessage = function (e) {
  if (e.data.type === "solution") {
    document.getElementById("res").innerHTML =
      "Solution: " + e.data.solution;

    const moves = e.data.solution.trim().split(/\s+/);

    // 2D animation
    animateSolution(cube, moves, "cubeCanvas", 600);

    // 3D animation
    animate3DSolution(moves, 800);
  }
};

/*
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

*/