// This script creates and animates a 3D Rubik's Cube using Three.js.

// Global variables for the scene, camera, renderer, and cubelets
let scene, camera, renderer, cubed = [], animating = false, controls;

// Image loaders for textures.
const logoTexture = new THREE.TextureLoader().load('Gan_cube_brand.webp');

const colors = {
    "U": 0xFFFFFF, // White (no change, as it's not in the provided image)
    "D": 0xFDFF16, // Yellow
    "L": 0xFF8B21, // UT orange
    "R": 0xFA2422, // Red
    "F": 0x04D006, // Lime green
    "B": 0x275CFE  // RISD Blue
}

// Maps the facelet position from the cube.js string to a 3D color.
// The cube.js string order is U, R, D, L, B, F.
// This function determines the color for a specific face of a given cubelet.
function get3DColor(face, position) {
    const roundTo = (val) => Math.round(val * 10) / 10;
    const x = roundTo(position.x);
    const y = roundTo(position.y);
    const z = roundTo(position.z);

    let stickerIndex = -1;
    switch (face) {
        case 'U': // White face (top)
            if (y > 0) {
                if (x === -1 && z === -1) stickerIndex = 0;  // ULB
                else if (x === 0 && z === -1) stickerIndex = 1;  // UB
                else if (x === 1 && z === -1) stickerIndex = 2;  // URB
                else if (x === -1 && z === 0) stickerIndex = 3;  // UL
                else if (x === 0 && z === 0) stickerIndex = 4;  // U
                else if (x === 1 && z === 0) stickerIndex = 5;  // UR
                else if (x === -1 && z === 1) stickerIndex = 6;  // ULF
                else if (x === 0 && z === 1) stickerIndex = 7;  // UF
                else if (x === 1 && z === 1) stickerIndex = 8;  // URF
            }
            break;
        case 'F': // Green face (front)
            if (z > 0) {
                if (y === 1 && x === -1) stickerIndex = 18; // ULF
                else if (y === 1 && x === 0) stickerIndex = 19; // UF
                else if (y === 1 && x === 1) stickerIndex = 20; // URF
                else if (y === 0 && x === -1) stickerIndex = 21; // FL
                else if (y === 0 && x === 0) stickerIndex = 22; // F
                else if (y === 0 && x === 1) stickerIndex = 23; // FR
                else if (y === -1 && x === -1) stickerIndex = 24; // DLF
                else if (y === -1 && x === 0) stickerIndex = 25; // DF
                else if (y === -1 && x === 1) stickerIndex = 26; // DRF
            }
            break;
        case 'D': // Yellow face (bottom)
            if (y < 0) {
                if (x === -1 && z === 1) stickerIndex = 27; // DLF
                else if (x === 0 && z === 1) stickerIndex = 28; // DF
                else if (x === 1 && z === 1) stickerIndex = 29; // DRF
                else if (x === -1 && z === 0) stickerIndex = 30; // DL
                else if (x === 0 && z === 0) stickerIndex = 31; // D
                else if (x === 1 && z === 0) stickerIndex = 32; // DR
                else if (x === -1 && z === -1) stickerIndex = 33; // DLB
                else if (x === 0 && z === -1) stickerIndex = 34; // DB
                else if (x === 1 && z === -1) stickerIndex = 35; // DRB
            }
            break;
        case 'R': // Red face (right) FIXED
            if (x > 0) {
                if (y === 1 && z === 1) stickerIndex = 9; // UL 9 -> UR 15 x
                else if (y === 0 && z === 1) stickerIndex = 12; // L 10 -> U 12 x
                else if (y === -1 && z === 1) stickerIndex = 15; // DL 11 -> UL 9
                else if (y === 1 && z === 0) stickerIndex = 10; // U 12 -> L 10 x
                else if (y === 0 && z === 0) stickerIndex = 13; // C 13 ->
                else if (y === -1 && z === 0) stickerIndex = 16; // D 14 -> R 16 x
                else if (y === 1 && z === -1) stickerIndex = 11; // UR 15 -> DL 11
                else if (y === 0 && z === -1) stickerIndex = 14; // R 16 -> D 14 x
                else if (y === -1 && z === -1) stickerIndex = 17; // DR 17 x
            }
            break; case 'L': // Orange face (left) FIXED
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
        case 'B': // Blue face (back)
            if (z < 0) {
                if (y === 1 && x === 1) stickerIndex = 45; // URB
                else if (y === 1 && x === 0) stickerIndex = 46; // UB
                else if (y === 1 && x === -1) stickerIndex = 47; // ULB
                else if (y === 0 && x === 1) stickerIndex = 48; // RB
                else if (y === 0 && x === 0) stickerIndex = 49; // B
                else if (y === 0 && x === -1) stickerIndex = 50; // LB
                else if (y === -1 && x === 1) stickerIndex = 51; // DRB
                else if (y === -1 && x === 0) stickerIndex = 52; // DB
                else if (y === -1 && x === -1) stickerIndex = 53; // DLB
            }
            break;
    }

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
        35,
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

    window.addEventListener('resize', onWindowResize, false);
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
                cubelet.material[0].color.set(get3DColor('R', { x, y, z })); // right
                cubelet.material[1].color.set(get3DColor('L', { x, y, z })); // left
                cubelet.material[2].color.set(get3DColor('U', { x, y, z })); // up
                cubelet.material[3].color.set(get3DColor('D', { x, y, z })); // down
                cubelet.material[4].color.set(get3DColor('F', { x, y, z })); // front
                cubelet.material[5].color.set(get3DColor('B', { x, y, z })); // back

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
 * Normalise une valeur flottante en entier (évite les erreurs d'arrondi).
 */
function snap(val) {
    return Math.round(val);
}

/**
 * Corrige la position et la rotation d'un cubelet après une rotation.
 */
function fixCubelet(c) {
    c.position.x = snap(c.position.x);
    c.position.y = snap(c.position.y);
    c.position.z = snap(c.position.z);

    // Quantifie la rotation à des multiples de 90°
    c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
    c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
    c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
}

/**
 * Détermine l'axe et l'angle pour une face donnée.
 */
function faceConfig(face, clockwise) {
    const angle90 = Math.PI / 2;
    let axis, selector, pivotPos, angle;

    switch (face) {
        case 'U': // Haut
            axis = new THREE.Vector3(0, 1, 0);
            selector = c => snap(c.position.y) === 1;
            pivotPos = { y: 1 };
            angle = clockwise ? -angle90 : angle90;
            break;
        case 'D': // Bas
            axis = new THREE.Vector3(0, -1, 0);
            selector = c => snap(c.position.y) === -1;
            pivotPos = { y: -1 };
            angle = clockwise ? angle90 : -angle90;
            break;
        case 'L': // Gauche
            axis = new THREE.Vector3(-1, 0, 0);
            selector = c => snap(c.position.x) === -1;
            pivotPos = { x: -1 };
            angle = clockwise ? angle90 : -angle90;
            break;
        case 'R': // Droite
            axis = new THREE.Vector3(1, 0, 0);
            selector = c => snap(c.position.x) === 1;
            pivotPos = { x: 1 };
            angle = clockwise ? -angle90 : angle90;
            break;
        case 'F': // Face avant
            axis = new THREE.Vector3(0, 0, 1);
            selector = c => snap(c.position.z) === 1;
            pivotPos = { z: 1 };
            angle = clockwise ? angle90 : -angle90;
            break;
        case 'B': // Face arrière
            axis = new THREE.Vector3(0, 0, -1);
            selector = c => snap(c.position.z) === -1;
            pivotPos = { z: -1 };
            angle = clockwise ? -angle90 : angle90;
            break;
        default:
            throw new Error("Invalid face: " + face);
    }

    return { axis, selector, pivotPos, angle };
}

/**
 * Rotation animée d'une face.
 */
function rotateFace(face, clockwise = true) {
    return new Promise((resolve) => {
        animating = true;

        const { axis, selector, pivotPos, angle } = faceConfig(face, clockwise);

        let pivot = new THREE.Object3D();
        Object.assign(pivot.position, pivotPos);

        const targetCubelets = cubed.filter(selector);
        scene.add(pivot);
        targetCubelets.forEach(c => pivot.attach(c));

        const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        const startQuat = pivot.quaternion.clone();

        const startTime = performance.now();
        const duration = 5;

        function animateRotation() {
            const now = performance.now();
            const t = Math.min(1, (now - startTime) / duration);

            pivot.quaternion.slerpQuaternions(startQuat, targetQuaternion, t);

            if (t < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                pivot.quaternion.copy(targetQuaternion);
                targetCubelets.forEach(c => {
                    scene.attach(c);
                    fixCubelet(c); // corrige position/rotation
                });
                scene.remove(pivot);
                animating = false;
                resolve();
            }
        }
        animateRotation();
    });
}

/**
 * Joue une séquence de mouvements avec animation.
 */
async function animate3DSolution(moves, delay = 200) {
    for (const move of moves) {
        const face = move[0];
        let times = 1;
        let clockwise = true;

        if (move.includes("2")) times = 2;
        if (move.includes("'")) clockwise = false;

        for (let i = 0; i < times; i++) {
            await rotateFace(face, clockwise);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function animate3DSolution2(moves, delay = 200) {
    console.log(moves)
    for (const move of moves) {
        const face = move;
        let times = 1;
        let clockwise = true;

        if (move.contains("2")) times = 2;
        if (move.contains("'")) clockwise = false;

        for (let i = 0; i < times; i++) {
            await rotateFace(face, clockwise);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}



/**
 * Scrambles the cube with a random sequence of moves.
 * @param {string} newStateString The new state string after the scramble.
 */
function scrambleCube() {
    if (animating) return;
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const scrambleMoves = [];
    for (let i = 0; i < 20; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        scrambleMoves.push(move);
    }

    // We can now call animate3DSolution directly and it will handle the state updates.
    animate3DSolution(scrambleMoves);
}

/**
 * Resets the cube to its solved state.
 * @param {string} newStateString The new state string after solving.
 */
function solveCube(newStateString) {
    if (animating) return;

    // Reset the visual cube instantly
    update3DCubeFromState(newStateString);
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
window.scrambleCube = scrambleCube;
window.solveCube = solveCube;
window.animate3D = animate3D
window.resetCube = animate3DSolution2