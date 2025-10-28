var moves = [];

// Wait for the cube iframe to load
document.getElementById('cube-view').onload = function () {
    // Reset moves on load (clear state)
    moves = [];

    const iframeWindow = document.getElementById('cube-view').contentWindow;

    var macs = "AB:12:34:60:7E:DA";
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
    window.hs(move);
}
window.mover = move

var ifr = document.getElementById('cube-view')
const targetFrame = window.top.frames[0];