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
let moves = [];

// Wait for the cube iframe to load
document.getElementById('cube-view').onload = function () {
    // Reset moves on load (clear state)
    moves = [];

    const iframeWindow = document.getElementById('cube-view').contentWindow;

    const mac = 'AB:12:34:60:7E:DA';
    iframeWindow.prompt = function (...args) {
        console.log(...args);
        return mac;
    };

    if (iframeWindow) {
        const originalLog = iframeWindow.console.log;
        iframeWindow.console.log = function (...args) {
            originalLog.apply(console, args);
            if (args[1] && args[1].type === "MOVE") {
                const move1 = args[1].move;
                moves.push(move1); // store as plain text
                console.log("Stored move:", move1);
                move(move1)
            }
        }
    }
};

// Helper: get copy of moves as text array
function getMoves() {
    return [...moves];
}

// --- Send inverse moves ---
function send() {
    if (moves.length === 0) {
        console.warn("No moves to send");
        return;
    }

    const reversed = [...moves].reverse(); // non-destructive reverse
    reversed.forEach(mov => {
        let rmov;
        switch (mov) {
            case "R":  rmov = "R'"; break;
            case "R'": rmov = "R"; break;
            case "F":  rmov = "F'"; break;
            case "F'": rmov = "F"; break;
            case "L":  rmov = "L'"; break;
            case "L'": rmov = "L"; break;
            case "B":  rmov = "B'"; break;
            case "B'": rmov = "B"; break;
            case "D":  rmov = "D'"; break;
            case "D'": rmov = "D"; break;
            case "U":  rmov = "U'"; break;
            case "U'": rmov = "U"; break;
            default:
                console.warn("Invalid move:", mov);
                return;
        }
        console.log("Inverse Move:", rmov);
        move(rmov);
    });
}

const reversedMoves = new Set(["D", "L"]);

// --- Perform moves (no colors) ---
async function move(mov) {
    console.log("Executing move:", mov);
    let clockwise = !mov.endsWith("'");;
    let face = mov.replace("'", "");
    if (reversedMoves.has(face)) {
        clockwise = !clockwise;
    }
    await window.rotateFace(face, clockwise);
}

var ifr = document.getElementById('cube-view')
const targetFrame = window.top.frames[0];

function connect() {
    targetFrame.postMessage('connect')
}

function reset() {
    targetFrame.postMessage('reset')
}