// This script creates and animates a 3D Rubik's Cube using Three.js.

// Global variables for the scene, camera, renderer, and cubelets
let scene, camera, renderer, cubed = [], animating = false, controls;

// Image loaders for textures.
const logoTexture = new THREE.TextureLoader().load('Gan_cube_brand.webp');

const colors = {
    U: 0xFFFFFF, // White
    D: 0xFFFF00, // Yellow
    L: 0xFF6400, // Orange
    R: 0xFF0000, // Red
    F: 0x00BB00, // Green
    B: 0x0000BB, // Blue
};

// Maps the facelet position from the cube.js string to a 3D color.
// The cube.js string order is U, R, D, L, B, F.
// This function determines the color for a specific face of a given cubelet.
function get3DColor(face, position) {
    const roundTo = (val) => Math.round(val * 10) / 10;
    const x = roundTo(position.x);
    const y = roundTo(position.y);
    const z = roundTo(position.z);
    
    // Map the 3D position to the sticker index in the cube.js string
    let stickerIndex = -1;
    switch (face) {
        case 'U': // White face
            if (y > 0) {
                if (x === -1 && z === 1) stickerIndex = 0; // UBL
                else if (x === 0 && z === 1) stickerIndex = 1; // UB
                else if (x === 1 && z === 1) stickerIndex = 2; // UBR
                else if (x === -1 && z === 0) stickerIndex = 3; // UL
                else if (x === 0 && z === 0) stickerIndex = 4; // U
                else if (x === 1 && z === 0) stickerIndex = 5; // UR
                else if (x === -1 && z === -1) stickerIndex = 6; // UFL
                else if (x === 0 && z === -1) stickerIndex = 7; // UF
                else if (x === 1 && z === -1) stickerIndex = 8; // UFR
            }
            break;
        case 'R': // Red face
            if (x > 0) {
                if (y === 1 && z === 1) stickerIndex = 9; // URB
                else if (y === 0 && z === 1) stickerIndex = 10; // RB
                else if (y === -1 && z === 1) stickerIndex = 11; // DRB
                else if (y === 1 && z === 0) stickerIndex = 12; // UR
                else if (y === 0 && z === 0) stickerIndex = 13; // R
                else if (y === -1 && z === 0) stickerIndex = 14; // DR
                else if (y === 1 && z === -1) stickerIndex = 15; // URF
                else if (y === 0 && z === -1) stickerIndex = 16; // RF
                else if (y === -1 && z === -1) stickerIndex = 17; // DRF
            }
            break;
        case 'F': // Green face
            if (z > 0) {
                if (y === 1 && x === -1) stickerIndex = 18; // UFL
                else if (y === 1 && x === 0) stickerIndex = 19; // UF
                else if (y === 1 && x === 1) stickerIndex = 20; // UFR
                else if (y === 0 && x === -1) stickerIndex = 21; // FL
                else if (y === 0 && x === 0) stickerIndex = 22; // F
                else if (y === 0 && x === 1) stickerIndex = 23; // FR
                else if (y === -1 && x === -1) stickerIndex = 24; // DFL
                else if (y === -1 && x === 0) stickerIndex = 25; // DF
                else if (y === -1 && x === 1) stickerIndex = 26; // DFR
            }
            break;
        case 'D': // Yellow face
            if (y < 0) {
                if (x === -1 && z === -1) stickerIndex = 27; // DBL
                else if (x === 0 && z === -1) stickerIndex = 28; // DB
                else if (x === 1 && z === -1) stickerIndex = 29; // DBR
                else if (x === -1 && z === 0) stickerIndex = 30; // DL
                else if (x === 0 && z === 0) stickerIndex = 31; // D
                else if (x === 1 && z === 0) stickerIndex = 32; // DR
                else if (x === -1 && z === 1) stickerIndex = 33; // DFL
                else if (x === 0 && z === 1) stickerIndex = 34; // DF
                else if (x === 1 && z === 1) stickerIndex = 35; // DFR
            }
            break;
        case 'L': // Orange face
            if (x < 0) {
                if (y === 1 && z === -1) stickerIndex = 36; // ULF
                else if (y === 0 && z === -1) stickerIndex = 37; // LF
                else if (y === -1 && z === -1) stickerIndex = 38; // DLF
                else if (y === 1 && z === 0) stickerIndex = 39; // UL
                else if (y === 0 && z === 0) stickerIndex = 40; // L
                else if (y === -1 && z === 0) stickerIndex = 41; // DL
                else if (y === 1 && z === 1) stickerIndex = 42; // ULB
                else if (y === 0 && z === 1) stickerIndex = 43; // LB
                else if (y === -1 && z === 1) stickerIndex = 44; // DLB
            }
            break;
        case 'B': // Blue face
            if (z < 0) {
                if (y === 1 && x === 1) stickerIndex = 45; // URB
                else if (y === 1 && x === 0) stickerIndex = 46; // UB
                else if (y === 1 && x === -1) stickerIndex = 47; // UBL
                else if (y === 0 && x === 1) stickerIndex = 48; // RB
                else if (y === 0 && x === 0) stickerIndex = 49; // B
                else if (y === 0 && x === -1) stickerIndex = 50; // LB
                else if (y === -1 && x === 1) stickerIndex = 51; // DRB
                else if (y === -1 && x === 0) stickerIndex = 52; // DB
                else if (y === -1 && x === -1) stickerIndex = 53; // DLB
            }
            break;
    }
    
    // The cube object is no longer directly accessed here
    if (stickerIndex !== -1 && window.lastStateString) {
        const stateString = window.lastStateString;
        const facelet = stateString[stickerIndex];
        return colors[facelet];
    }
    
    return 0x000000;
}

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

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add OrbitControls for camera movement
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Non-directional light source
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Build cubelets (3x3x3)
    const cubeletSize = 0.95;
    const offset = 1;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const materials = [
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // right
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // left
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // up
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // down
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // front
                    new THREE.MeshStandardMaterial({ color: 0x000000 }), // back
                ];
                
                const geo = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize);
                const cubelet = new THREE.Mesh(geo, materials);
                cubelet.position.set(x * offset, y * offset, z * offset);
                scene.add(cubelet);
                cubed.push(cubelet);

                // Add black wireframe for definition
                const edges = new THREE.EdgesGeometry(geo);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
                cubelet.add(line);
            }
        }
    }
    
    // Initial render from the logical cube state
    update3DCubeFromState(cube.asString());
    animate3D();
}

/**
 * Updates the 3D cube's visual representation based on the logical state string.
 * This function rebuilds the cube to reflect a given state.
 * @param {string} stateString The state of the cube as a 54-character string.
 */
function update3DCubeFromState(stateString) {
  window.lastStateString = stateString;
  let cubeletIndex = 0;
  const cubeletSize = 0.95;
  const offset = 1;

  for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
              const cubelet = cubed[cubeletIndex];
              
              // Update material colors based on cube.js state
              cubelet.material[0].color.set(get3DColor('R', {x, y, z})); // right
              cubelet.material[1].color.set(get3DColor('L', {x, y, z})); // left
              cubelet.material[2].color.set(get3DColor('U', {x, y, z})); // up
              cubelet.material[3].color.set(get3DColor('D', {x, y, z})); // down
              cubelet.material[4].color.set(get3DColor('F', {x, y, z})); // front
              cubelet.material[5].color.set(get3DColor('B', {x, y, z})); // back
              
              // Apply logo texture to center white face
              if (x === 0 && y === 1 && z === 0) {
                  cubelet.material[2].map = logoTexture;
              }
              
              cubeletIndex++;
          }
      }
  }
}

/**
 * The main animation loop for the 3D scene.
 */
function animate3D() {
    requestAnimationFrame(animate3D);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * Rotates a specific face of the cube with animation.
 * @param {string} face The face to rotate ('U', 'D', 'L', 'R', 'F', 'B').
 * @param {boolean} clockwise True for clockwise, false for counter-clockwise.
 * @returns {Promise<void>} A promise that resolves when the animation is complete.
 */
function rotateFace(face, clockwise = true) {
    return new Promise((resolve) => {
        if (animating) {
            resolve();
            return;
        }
        animating = true;
    
        let axis, targetCubelets;
        let pivot = new THREE.Object3D();
    
        switch (face) {
            case 'U':
                axis = new THREE.Vector3(0, 1, 0);
                targetCubelets = cubed.filter(c => Math.round(c.position.y) === 1);
                pivot.position.y = 1;
                break;
            case 'D':
                axis = new THREE.Vector3(0, -1, 0);
                targetCubelets = cubed.filter(c => Math.round(c.position.y) === -1);
                pivot.position.y = -1;
                break;
            case 'L':
                axis = new THREE.Vector3(-1, 0, 0);
                targetCubelets = cubed.filter(c => Math.round(c.position.x) === -1);
                pivot.position.x = -1;
                break;
            case 'R':
                axis = new THREE.Vector3(1, 0, 0);
                targetCubelets = cubed.filter(c => Math.round(c.position.x) === 1);
                pivot.position.x = 1;
                break;
            case 'F':
                axis = new THREE.Vector3(0, 0, 1);
                targetCubelets = cubed.filter(c => Math.round(c.position.z) === 1);
                pivot.position.z = 1;
                break;
            case 'B':
                axis = new THREE.Vector3(0, 0, -1);
                targetCubelets = cubed.filter(c => Math.round(c.position.z) === -1);
                pivot.position.z = -1;
                break;
            default:
                console.error("Invalid face:", face);
                animating = false;
                resolve();
                return;
        }
    
        scene.add(pivot);
        targetCubelets.forEach(c => pivot.attach(c));
    
        const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
        const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        const startTime = performance.now();
        const duration = 200; // Animation duration in milliseconds
    
        function animateRotation() {
            const now = performance.now();
            const progress = Math.min(1, (now - startTime) / duration);
            
            pivot.quaternion.slerp(targetQuaternion, progress);
    
            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                pivot.quaternion.copy(targetQuaternion);
                targetCubelets.forEach(c => scene.attach(c));
                scene.remove(pivot);
                animating = false;
                resolve();
            }
        }
        animateRotation();
    });
}


/**
 * Animates a sequence of cube moves.
 * @param {Array} moves An array of moves, e.g., ['R', 'U', 'R\''].
 * @param {number} delay The delay between each move in milliseconds.
 */
async function animate3DSolution(moves, delay = 200) {
    if (animating) return;
    for (const move of moves) {
        if (animating) return;
        
        // Logical move
        //cube.move(move);

        // Visual animation
        const face = move[0];
        const clockwise = !move.includes("'");
        await rotateFace(face, clockwise);
        
        // Update state after each animation
        //update3DCubeFromState(cube.asString());
        
        // Add delay between moves
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

/**
 * Logs the string representation of the cube's state to the console.
 */
function logCubeString() {
    if (window.lastStateString) {
        console.log("Cube state string:", window.lastStateString);
    } else {
        console.error("Cube state string not available.");
    }
}

/**
 * Handles window resizing to keep the scene responsive.
 */
function onWindowResize() {
    const container = document.getElementById("cube3d");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Expose globally
window.init3DCube = init3DCube;
window.logCubeString = logCubeString;
window.rotateFace = rotateFace;
window.update3DCubeFromState = update3DCubeFromState;
window.animate3DSolution = animate3DSolution;
