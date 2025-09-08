let scene, camera, renderer, cubelets = [], animating = false;

function init3DCube(containerId = "cube3d") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("3D cube container not found");
    return;
  }

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

  // Build cubelets (3x3x3)
  const colors = {
    U: 0xffffff, // white
    D: 0xffff00, // yellow
    L: 0xff8000, // orange
    R: 0xff0000, // red
    F: 0x00ff00, // green
    B: 0x0000ff, // blue
  };

  const cubeletSize = 0.95;
  const offset = 1;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const materials = [
          new THREE.MeshBasicMaterial({ color: colors.R }), // right
          new THREE.MeshBasicMaterial({ color: colors.L }), // left
          new THREE.MeshBasicMaterial({ color: colors.U }), // up
          new THREE.MeshBasicMaterial({ color: colors.D }), // down
          new THREE.MeshBasicMaterial({ color: colors.F }), // front
          new THREE.MeshBasicMaterial({ color: colors.B }), // back
        ];
        const geo = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize);
        const cubelet = new THREE.Mesh(geo, materials);
        cubelet.position.set(x * offset, y * offset, z * offset);
        scene.add(cubelet);
        cubelets.push(cubelet);
      }
    }
  }

  animate3D();
}

function animate3D() {
  requestAnimationFrame(animate3D);
  renderer.render(scene, camera);
}

// Basic move rotation (stub — expand to real rotations)
function rotateFace(face, clockwise = true) {
  if (animating) return;
  animating = true;

  // TODO: Select cubelets on that face and animate rotation
  console.log("Rotating face:", face, "clockwise:", clockwise);

  setTimeout(() => {
    animating = false;
  }, 500); // placeholder
}

function animate3DSolution(moves, delay = 600) {
  let i = 0;
  function step() {
    if (i >= moves.length) return;
    const move = moves[i];
    const face = move[0]; // U, R, F, etc.
    const clockwise = !move.includes("'");
    rotateFace(face, clockwise);
    i++;
    setTimeout(step, delay);
  }
  step();
}

// Expose globally
window.init3DCube = init3DCube;
window.animate3DSolution = animate3DSolution;
