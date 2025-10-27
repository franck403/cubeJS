// This script creates and animates a 3D Rubik's Cube using Three.js.

let scene, camera, renderer, cubed = [], animating = false, controls, sdr = false;
let currentFrontFace = 'F';
const logoTexture = new THREE.TextureLoader().load('Gan_cube_brand.webp');

const colors = {
    U: 0xFFFFFF, // White
    D: 0xFFFF00, // Yellow
    L: 0xFF8000, // Orange
    R: 0xFF0000, // Red
    F: 0x00FF00, // Green
    B: 0x0000FF  // Blue
};

// === Get color for each facelet ===
function get3DColor(face, position) {
    const round = v => Math.round(v * 10) / 10;
    const x = round(position.x), y = round(position.y), z = round(position.z);
    let i = -1;

    switch (face) {
        case 'U': if (y > 0) i = [0,1,2,3,4,5,6,7,8][(z+1)*3+(x+1)]; break;
        case 'R': if (x > 0) i = 9; break;
        case 'F': if (z > 0) i = 18; break;
        case 'D': if (y < 0) i = 27; break;
        case 'L': if (x < 0) i = 36; break;
        case 'B': if (z < 0) i = 45; break;
    }

    if (i !== -1 && window.lastStateString) {
        const s = window.lastStateString[i];
        return colors[s] || 0x000000;
    }
    return 0x000000;
}

// === Build new state ===
function newState(nState) {
    console.log("Building new cube:", nState);
    cube = new Cube(nState);
    while (scene.children.length) scene.remove(scene.children[0]);
    init3DCube();
    update3DCubeFromState(nState);
    window.lastStateString = nState;
}

// === Reset cube to solved state ===
function resetCube() {
    if (sdr) return;
    sdr = true;

    const solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    newState(solved);
    renderer.clear();
    renderer.resetState();

    setTimeout(() => { sdr = false; }, 2000);
}

// === Recover cube from localStorage ===
function recover() {
    if (sdr) return;
    sdr = true;

    try {
        const saved = localStorage.getItem('cube');
        if (!saved) throw new Error("No saved state.");
        const parsed = JSON.parse(saved);
        const state = typeof parsed === 'string' ? parsed : parsed.state || null;
        if (!state || state.length !== 54) throw new Error("Corrupted save.");
        newState(state);
        update3DCubeFromState(state);
        console.log("Recovered cube:", state);
    } catch (err) {
        console.error("Recover failed:", err.message);
    } finally {
        setTimeout(() => { sdr = false; }, 2000);
    }
}

// === Initialize Three.js Scene ===
function init3DCube(containerId = "cube3d") {
    const container = document.getElementById(containerId);
    if (!container) return console.error("Container not found");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const materials = Array(6).fill().map(() => new THREE.MeshStandardMaterial({ color: 0x000000 }));
                const cubelet = new THREE.Mesh(geo, materials);
                cubelet.position.set(x, y, z);
                scene.add(cubelet);
                cubed.push(cubelet);
                cubelet.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x000000 })));
            }
        }
    }

    const initial = window.lastStateString || 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    update3DCubeFromState(initial);
    window.addEventListener('resize', onWindowResize, false);
    animate3D();
}

// === Update cube visuals ===
function update3DCubeFromState(state) {
    window.lastStateString = state;
    let i = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const c = cubed[i++];
                c.material[0].color.set(get3DColor('R', { x, y, z }));
                c.material[1].color.set(get3DColor('L', { x, y, z }));
                c.material[2].color.set(get3DColor('U', { x, y, z }));
                c.material[3].color.set(get3DColor('D', { x, y, z }));
                c.material[4].color.set(get3DColor('F', { x, y, z }));
                c.material[5].color.set(get3DColor('B', { x, y, z }));
            }
        }
    }
}

// === Animation loop ===
function animate3D() {
    requestAnimationFrame(animate3D);
    controls.update();
    renderer.render(scene, camera);
}

// === Window resize ===
function onWindowResize() {
    const c = document.getElementById("cube3d");
    camera.aspect = c.clientWidth / c.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(c.clientWidth, c.clientHeight);
}

// === Rotation logic ===
function snap(v) { return Math.round(v); }

function fixCubelet(c) {
    c.position.x = snap(c.position.x);
    c.position.y = snap(c.position.y);
    c.position.z = snap(c.position.z);
    c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
    c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
    c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
}

function faceConfig(face, cw) {
    const a = Math.PI / 2;
    switch (face) {
        case 'U': return { axis: new THREE.Vector3(0, 1, 0), selector: c => snap(c.position.y) === 1, angle: cw ? -a : a };
        case 'D': return { axis: new THREE.Vector3(0, -1, 0), selector: c => snap(c.position.y) === -1, angle: cw ? a : -a };
        case 'L': return { axis: new THREE.Vector3(-1, 0, 0), selector: c => snap(c.position.x) === -1, angle: cw ? a : -a };
        case 'R': return { axis: new THREE.Vector3(1, 0, 0), selector: c => snap(c.position.x) === 1, angle: cw ? -a : a };
        case 'F': return { axis: new THREE.Vector3(0, 0, 1), selector: c => snap(c.position.z) === 1, angle: cw ? a : -a };
        case 'B': return { axis: new THREE.Vector3(0, 0, -1), selector: c => snap(c.position.z) === -1, angle: cw ? -a : a };
        default: throw new Error("Invalid face");
    }
}

async function rotateFace(face, cw = true) {
    animating = true;
    const { axis, selector, angle } = faceConfig(face, cw);
    const pivot = new THREE.Object3D();
    const layer = cubed.filter(selector);
    scene.add(pivot);
    layer.forEach(c => pivot.attach(c));

    const target = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    pivot.quaternion.multiply(target);
    layer.forEach(c => { scene.attach(c); fixCubelet(c); });
    scene.remove(pivot);

    animating = false;
    currentFrontFace = face;
    localStorage.setItem('cube', JSON.stringify(window.lastStateString));
}

async function animate3DSolution(moves, delay = 200) {
    for (const move of moves) {
        const face = move[0];
        const cw = !move.includes("'");
        const times = move.includes("2") ? 2 : 1;
        for (let i = 0; i < times; i++) {
            await rotateFace(face, cw);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

// === Scramble & Solve ===
function scrambleCube() {
    if (animating) return;
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const seq = Array.from({ length: 20 }, () => moves[Math.floor(Math.random() * 6)]);
    animate3DSolution(seq);
}

function solveCube(state) {
    if (animating) return;
    update3DCubeFromState(state);
}

// === Debug ===
function logCubeString() {
    console.log("Cube state:", window.lastStateString || "N/A");
}

// === Expose globally ===
window.init3DCube = init3DCube;
window.logCubeString = logCubeString;
window.rotateFace = rotateFace;
window.update3DCubeFromState = update3DCubeFromState;
window.animate3DSolution = animate3DSolution;
window.scrambleCube = scrambleCube;
window.solveCube = solveCube;
window.animate3D = animate3D;
window.resetCube = resetCube;
window.recover = recover;
