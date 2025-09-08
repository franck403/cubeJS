// visual3d.js
// This script creates and animates a 3D Rubik's Cube using Three.js.

// Global variables for the scene, camera, renderer, and cubelets
let scene, camera, renderer, cubelets = [], animating = false, controls;

// Image loaders for textures
// Note: This assumes 'Gan_cube_brand.webp' is in the same directory as the HTML file.
const logoGan = new THREE.TextureLoader().load('Gan_cube_brand.webp');

/**
 * Initializes the 3D cube scene, camera, and renderer.
 * @param {string} containerId The ID of the HTML container for the 3D scene.
 */
function init3DCube(containerId = "cube3d") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("3D cube container not found");
    return;
  }

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // Set background to black

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Add OrbitControls for camera movement
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // smooth camera movement
  controls.dampingFactor = 0.25;

  // Add lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

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
          new THREE.MeshStandardMaterial({ color: x === 1 ? colors.R : 0x000000 }), // right
          new THREE.MeshStandardMaterial({ color: x === -1 ? colors.L : 0x000000 }), // left
          new THREE.MeshStandardMaterial({ color: y === 1 ? colors.U : 0x000000, map: y === 1 && x === 0 && z === 0 ? logoGan : null }), // up (white)
          new THREE.MeshStandardMaterial({ color: y === -1 ? colors.D : 0x000000 }), // down
          new THREE.MeshStandardMaterial({ color: z === 1 ? colors.F : 0x000000 }), // front
          new THREE.MeshStandardMaterial({ color: z === -1 ? colors.B : 0x000000 }), // back
        ];
        const geo = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize);
        const cubelet = new THREE.Mesh(geo, materials);
        cubelet.position.set(x * offset, y * offset, z * offset);
        scene.add(cubelet);
        cubelets.push(cubelet);

        // Add black wireframe for definition
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        cubelet.add(line);
      }
    }
  }

  animate3D();
}

/**
 * The main animation loop for the 3D scene.
 */
function animate3D() {
  requestAnimationFrame(animate3D);
  controls.update(); // Update controls
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
