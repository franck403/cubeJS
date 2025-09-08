// This script creates and animates a 3D Rubik's Cube using Three.js.

// Global variables for the scene, camera, renderer, and cubelets
let scene, camera, renderer, cubed = [], animating = false, controls;

// Image loaders for textures.
const logoTexture = new THREE.TextureLoader().load('Gan_cube_brand.webp');

const colors = {
    U: 0xFFFFFF, // White
    D: 0xEBFF0F, // Yellow
    L: 0xFF870F, // Orange
    R: 0xA60202, // Red
    F: 0x00fc04, // Green
    B: 0x13138A, // Blue
};

// Standard cube state data structure
const initialCubeState = [];
const cubeletSize = 0.95;
const offset = 1;
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const materials = [
                { color: x === 1 ? colors.R : 0x000000, face: 'R' },
                { color: x === -1 ? colors.L : 0x000000, face: 'L' },
                { color: y === 1 ? colors.U : 0x000000, face: 'U', map: y === 1 && x === 0 && z === 0 ? logoTexture : null },
                { color: y === -1 ? colors.D : 0x000000, face: 'D' },
                { color: z === 1 ? colors.F : 0x000000, face: 'F' },
                { color: z === -1 ? colors.B : 0x000000, face: 'B' }
            ];
            initialCubeState.push({
                position: new THREE.Vector3(x * offset, y * offset, z * offset),
                rotation: new THREE.Quaternion(),
                originalPosition: new THREE.Vector3(x * offset, y * offset, z * offset),
                materials: materials
            });
        }
    }
}

/**
 * Initializes the 3D cube scene, camera, and renderer.
 * @param {string} containerId The ID of the HTML container for the 3D scene.
 * @param {Array} initialCube The initial state of the cube to render.
 */
function init3DCube(containerId = "cube3d", initialCube = initialCubeState) {
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

    // Build cubelets from the cube parameter
    cubed = initialCube.map(cubeletData => {
        const materials = cubeletData.materials.map(mat => new THREE.MeshStandardMaterial(mat));
        const geo = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize);
        const cubelet = new THREE.Mesh(geo, materials);
        cubelet.position.copy(cubeletData.position);
        cubelet.quaternion.copy(cubeletData.rotation);
        scene.add(cubelet);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        cubelet.add(line);
        return cubelet;
    });

    window.addEventListener('resize', onWindowResize, false);
    animate3D();
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
 * Rotates a specific face of the cube.
 * @param {string} face The face to rotate ('U', 'D', 'L', 'R', 'F', 'B').
 * @param {boolean} clockwise True for clockwise, false for counter-clockwise.
 */
function rotateFace(face, clockwise = true) {
    if (animating) return;
    animating = true;

    let axis, targetCubelets;
    const epsilon = 0.1;

    switch (face) {
        case 'U':
            axis = new THREE.Vector3(0, 1, 0);
            targetCubelets = cubed.filter(c => c.position.y > epsilon);
            break;
        case 'D':
            axis = new THREE.Vector3(0, -1, 0);
            targetCubelets = cubed.filter(c => c.position.y < -epsilon);
            break;
        case 'L':
            axis = new THREE.Vector3(-1, 0, 0);
            targetCubelets = cubed.filter(c => c.position.x < -epsilon);
            break;
        case 'R':
            axis = new THREE.Vector3(1, 0, 0);
            targetCubelets = cubed.filter(c => c.position.x > epsilon);
            break;
        case 'F':
            axis = new THREE.Vector3(0, 0, 1);
            targetCubelets = cubed.filter(c => c.position.z > epsilon);
            break;
        case 'B':
            axis = new THREE.Vector3(0, 0, -1);
            targetCubelets = cubed.filter(c => c.position.z < -epsilon);
            break;
        default:
            console.error("Invalid face:", face);
            animating = false;
            return;
    }

    const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    const initialQuaternions = targetCubelets.map(c => c.quaternion.clone());
    const startTime = performance.now();
    const duration = 500;

    function animateRotation() {
        const now = performance.now();
        const progress = Math.min(1, (now - startTime) / duration);

        targetCubelets.forEach((c, index) => {
            c.quaternion.slerpQuaternions(initialQuaternions[index], rotationQuaternion, progress);
            
            if (progress === 1) {
                 const tempQuaternion = new THREE.Quaternion().copy(initialQuaternions[index]);
                 tempQuaternion.premultiply(rotationQuaternion);
                 c.quaternion.copy(tempQuaternion);

                 c.position.applyQuaternion(rotationQuaternion);
                 c.position.x = Math.round(c.position.x);
                 c.position.y = Math.round(c.position.y);
                 c.position.z = Math.round(c.position.z);
            }
        });

        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            animating = false;
        }
    }
    animateRotation();
}

/**
 * Animates a sequence of cube moves.
 * @param {Array} moves An array of moves, e.g., ['R', 'U', 'R\''].
 * @param {number} delay The delay between each move in milliseconds.
 */
function animate3DSolution(moves, delay = 600) {
    let i = 0;
    function step() {
        if (i >= moves.length) return;
        const move = moves[i];
        const face = move[0];
        const clockwise = !move.includes("'");
        rotateFace(face, clockwise);
        i++;
        setTimeout(() => {
            if (i < moves.length) {
                step();
            }
        }, delay);
    }
    step();
}

/**
 * Scrambles the cube with a random sequence of moves.
 */
function scrambleCube() {
    if (animating) return;
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const scrambleMoves = [];
    for (let i = 0; i < 20; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        scrambleMoves.push(move);
    }
    animate3DSolution(scrambleMoves);
}

/**
 * Resets the cube to its solved state.
 */
function solveCube() {
    if (animating) return;
    cubed.forEach(c => {
        scene.remove(c);
    });
    init3DCube();
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
window.animate3DSolution = animate3DSolution;
window.scrambleCube = scrambleCube;
window.solveCube = solveCube;
