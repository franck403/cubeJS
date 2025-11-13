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
      await solve2ndCube(moves);
    }
    fnc()
  }
};

const cursorCube = document.getElementById('cursorCube');
const load = document.getElementById('mouseLoad');

// Cursor follow + rotation
if (!window.debug) {
  document.addEventListener('mousemove', (e) => {
    const xRatio = e.clientX / window.innerWidth;
    const yRatio = e.clientY / window.innerHeight;
    const rotX = (yRatio - 0.5) * 360;
    const rotY = (xRatio - 0.5) * 360;

    document.documentElement.style.setProperty('--rot-x', `${rotX}deg`);
    document.documentElement.style.setProperty('--rot-y', `${rotY}deg`);
    document.body.style.cursor = "none";

    cursorCube.style.left = e.clientX + 'px';
    cursorCube.style.top = e.clientY + 'px';
  });
} else {
  cursorCube.style.display = "none";
}

// Drop cube every 3s
setInterval(() => {
    const clone = cursorCube.cloneNode(true);
    clone.classList.add('dropCube');
    const rect = cursorCube.getBoundingClientRect();
    clone.style.left = rect.left + rect.width / 2 + 'px';
    clone.style.top = rect.top + rect.height / 2 + 'px';
    //load.appendChild(clone);
    setTimeout(() => clone.remove(), 2500);
}, 100);
