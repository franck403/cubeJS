let cube; // keep cube instance global
document.getElementById('res').innerHTML = 'Initializing solver in worker...';
let loader = document.getElementById('load');

// Draw scrambled cube immediately
function initCube() {
  cube = new Cube();
  //cube.randomize()
  // Show cube state right away
  document.getElementById('cube').innerHTML = cube.asString();
  init3DCube("cube3d"); // start 3D cube
}
initCube();

// Start the worker
setTimeout(()=> {
  try {
    if (loader) loader.remove()
  } catch {}
},10000)
const worker = new Worker('Corker.js');

worker.onmessage = function (e) {
  if (e.data.type === 'ready') {
    document.getElementById('res').innerHTML = 'Solver ready!';
    loader.remove();
  }

  if (e.data.type === 'solution') {
    document.getElementById("res").innerHTML =
      "Solution: " + e.data.solution;

    const moves = e.data.solution.trim().split(/\s+/);

    // animate3DSolution2(moves, 10);
    console.info("Start Solve")
    var fnc = async () => {
      if (!silence) {
        await sendLine(leftWriter, solveSound);
      }
      await spikeCube(moves)
      console.info("End Solve")
    }
    fnc()
  }
};