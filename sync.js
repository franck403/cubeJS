async function sleep2(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sleep(miliseconds) {
    const currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

// Copy MAC address
function copy_mac() {
    const mac = document.getElementById("mac");
    mac.select();
    mac.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(mac.innerText);
}

// --- Store moves ---
var moves = [];

// Wait for the cube iframe to load
document.getElementById('cube-view').onload = function () {
    // Reset moves on load (clear state)
    moves = [];

    const iframeWindow = document.getElementById('cube-view').contentWindow;

    var macs = "D6:B4:0A:E0:62:72";
    iframeWindow.prompt = function (...args) {
        console.log(...args);
        return macs
    };

    if (iframeWindow) {
        const originalLog = iframeWindow.console.log;
        iframeWindow.console.log = function (...args) {
            originalLog.apply(console, args);
            if (args[1] && args[1].type === "MOVE") {
                const move1 = args[1].move;
                moves.push(move1);
                move(move1)
            }
        }
    }
};


// --- Send inverse moves ---
function reset2() {
    resetCube()
}

const reversedMoves = new Set(["D", "L", "F"]);

// --- Perform moves (no colors) ---
async function move(mov) {
    moves.push(mov)
    cube.move(mov)
    console.log(mov);
    let clockwise = !mov.endsWith("'");;
    let face = mov.replace("'", "");
    if (reversedMoves.has(face)) {
        clockwise = !clockwise;
    }
    await window.rotateFace(face, clockwise);
}
window.mover = move

var ifr = document.getElementById('cube-view')
const targetFrame = window.top.frames[0];

function connect() {
    targetFrame.postMessage('connect')
}

function reset() {
    reset2()
    targetFrame.postMessage('reset')
}