let leftPort,   rightPort   = null;
let leftWriter, rightWriter = null;
let leftReader, rightReader = null;
let leftAbort,  rightAbort  = null;

var store = [];

let SpikeState = { left: false, right: false };

let scSecure        = false;
let solveSecure     = false;
let fullscreenstate = false;
let spinState       = false;
let bcState         = false;

let scLenght = 20;

let deg = 95;  // Moves x 1
let dog = 180; // Moves x 2

let u  = 0, f  = 0, l  = 0, r  = 0, b  = 0, d  = 0;
let u1 = 0, f1 = 0, l1 = 0, r1 = 0, b1 = 0, d1 = 0;
let u2 = 0, f2 = 0, l2 = 0, r2 = 0, b2 = 0, d2 = 0;

let cb = 3; // back deg corr
let cd = 3; // down deg corr

let lb = localStorage.lb || 0;
let ld = localStorage.ld || 0;

var silence = false;

let timerInterval = null;

window.sleeped = 170;

const sexyMove1 = ["R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'"];
const sexyMove2 = ["L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2"];
const sexyMove3 = ["R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2"];

const startup = "cor=1.5\n\nimport motor\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear();\nmotor.motor_set_high_resolution_mode(port.A, True);\nmotor.motor_set_high_resolution_mode(port.B, True);\nmotor.motor_set_high_resolution_mode(port.C, True);\nmotor.motor_set_high_resolution_mode(port.D, True);\nmotor.motor_set_high_resolution_mode(port.E, True);\nmotor.motor_set_high_resolution_mode(port.F, True)";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const scrambleSound = "sound.beep(784,100);time.sleep_ms(100);sound.beep(659,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(494,150);time.sleep_ms(150);sound.beep(392,200)";
const solveSound = "sound.beep(392,100);time.sleep_ms(100);sound.beep(494,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(659,150);time.sleep_ms(150);sound.beep(784,200);time.sleep_ms(200);sound.beep(988,300)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 950) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
const getBattery = `import hub\n\nprint("Ba" + str(hub.battery_voltage()))`
const clearDisplay = `light_matrix.clear();\n`

let CLP_LEFT;
let CLP_RIGHT;

// =========================================================================================================

// COMMANDS

function regen() {
    CLP_LEFT = {
        // Face U
        "U": `motor.run_to_absolute_position(port.A,  motor.absolute_position(port.A)- ${deg + u}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "U'": `motor.run_to_absolute_position(port.A, motor.absolute_position(port.A)+ ${deg + u1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "U2": `motor.run_to_absolute_position(port.A, motor.absolute_position(port.A)+ ${dog + u2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,

        // Face L
        "L": `motor.run_to_absolute_position(port.C,  motor.absolute_position(port.C) - ${deg + l}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "L'": `motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + ${deg + l1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "L2": `motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + ${dog + l2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,

        // Face F
        "F": `motor.run_to_absolute_position(port.E,  motor.absolute_position(port.E)- ${deg + f}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "F'": `motor.run_to_absolute_position(port.E, motor.absolute_position(port.E)+ ${deg + f1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "F2": `motor.run_to_absolute_position(port.E, motor.absolute_position(port.E)+ ${dog + f2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
    };

    CLP_RIGHT = {
        // Face R
        "R": `motor.run_to_absolute_position(port.D,  motor.absolute_position(port.D)- ${deg + r}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "R'": `motor.run_to_absolute_position(port.D, motor.absolute_position(port.D)+ ${deg + r1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "R2": `motor.run_to_absolute_position(port.D, motor.absolute_position(port.D)+ ${dog + r2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,

        // Face B
        "B": `motor.run_to_absolute_position(port.F,  motor.absolute_position(port.F) - ${deg + b}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "B'": `motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + ${deg + b1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "B2": `motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + ${dog + b2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,

        // Face D
        "D": `motor.run_to_absolute_position(port.B,  motor.absolute_position(port.B)- ${deg + d}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "D'": `motor.run_to_absolute_position(port.B, motor.absolute_position(port.B)+ ${deg + d1}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
        "D2": `motor.run_to_absolute_position(port.B, motor.absolute_position(port.B)+ ${dog + d2}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n`,
    };
}

regen();

async function sleepT(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ALL_MOVES = Object.keys({ ...CLP_LEFT, ...CLP_RIGHT });

// DEFAULT

/**
 * Generate a random scramble table
 * @param {number} count - number of moves
 * @returns {string[]} - array of move notations
 */
function generateScramble(length = 20) {
    const result = [];
    let last
    for (let i = 0; i < length; i++) {
        let m;
        do m = ALL_MOVES[Math.random() * ALL_MOVES.length | 0];
        while (i && m[0] === result[i - 1][0]);
        if (!last) {
            result.push(m);
            last = m;
        } else if (!last.startsWith(m.charAt(0))) {
            result.push(m);
            last = m;
        }
    }
    return result;
}

function log(...args) {
    console.info(...args);
    const logEl = document.getElementById('log');
    if (logEl) {
        logEl.textContent += args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ') + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

// CONNECTIONS

async function openSpike(which) {
    let port, writer, reader, abortCtrl;
    try {
        port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0694 }] });
        await port.open({ baudRate: 115200 });

        reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
        if (port.writable) {
            writer = port.writable.getWriter();
        }

        await writer.write(new Uint8Array([3]));

        abortCtrl = new AbortController();

        if (which === "left") {
            leftPort = port;
            leftWriter = writer;
            leftReader = reader;
            leftAbort = abortCtrl;
            SpikeState.left = true;
        } else {
            rightPort = port;
            rightWriter = writer;
            rightReader = reader;
            rightAbort = abortCtrl;
            SpikeState.right = true;
        }

        // start listening for RX
        batteryRead(which, reader);

        await sendLine(writer, startup);
        if (!silence) {
            await sendLine(writer, connectSound);
        }

        log(`${which} Spike connected`);
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
    }
}

async function reconnectSpike(side) {
    const filters = []; // optional: restrict by vendorId/productId
    const ports = await navigator.serial.getPorts();
    for (const p of ports) {
        try {
            await p.open({ baudRate: 115200 });
            const encoder = new TextEncoderStream();
            encoder.readable.pipeTo(p.writable);
            const writer = encoder.writable.getWriter();

            if (side === 'left') leftWriter = writer;
            if (side === 'right') rightWriter = writer;

            SpikeState[side] = p;
            console.log(`${side} reconnected`);
            const textDecoder = new TextDecoderStream();
            p.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();
            autoReconnectLoop(side, p, reader);
            return;
        } catch {
            try { await p.close(); } catch { }
        }
    }
    console.info(`No ${side} port found, retrying in 5s`);
    setTimeout(() => reconnectSpike(side), 5000);
}

async function spike(cubeed) {
    if (cubeed) {
        await openSpike('left')
        await openSpike('right')
    } else {
        await reconnectSpike('left')
        await reconnectSpike('right')
    }
}

async function sendLine(writer, text) {
    console.debug(text);
    if (!writer) return;
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized);
    await writer.write(bytes);
    await writer.write(encoder.encode('\r\n'));
}

async function disconnectSpike(which) {
    try {
        let port = which === "left" ? leftPort : rightPort;
        let writer = which === "left" ? leftWriter : rightWriter;
        let reader = which === "left" ? leftReader : rightReader;

        if (reader) {
            await reader.cancel();
            reader.releaseLock();
        }
        if (writer) {
            try { await writer.close(); } catch (e) { }
            writer.releaseLock();
        }
        if (port) {
            try { await port.close(); } catch (e) { }
        }

        if (which === "left") {
            leftPort = leftWriter = leftReader = null;
            SpikeState.left = false;
        } else {
            rightPort = rightWriter = rightReader = null;
            SpikeState.right = false;
        }

        log(`${which} Spike disconnected`);
        document.getElementById('FC').innerHTML = '<i class="fa-solid fa-plug-circle-exclamation"></i>'
    } catch (err) {
        log("Disconnect error:", err);
    }
}

// CHECKUPS

function ganCubePresent() {
    var b = document.getElementById('cube-view').contentWindow;
    //return b.document.getElementById("batteryLevel").value == "- n/a -"
    return false
}

function areBothSpikesConnected() {
    return SpikeState.left && SpikeState.right && leftPort && rightPort;
}

// BATTERIES

async function batteryRead(which, reader) {
    if (!reader) return;
    (async () => {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    value.split('\n').forEach(element => {
                        if (element.startsWith('Ba')) {
                            const batteryValue = parseFloat(element.replace('Ba', '')) / 1000;
                            const batteryPercentageValue = batteryPercentage(batteryValue, 6.0, 8.4);
                            // Update the battery icon for the correct side
                            const batteryIcon = document.getElementById(`${which}`);
                            if (batteryIcon) {
                                // Remove all existing battery classes
                                batteryIcon.classList.remove(
                                    'icon-battery-0',
                                    'icon-battery-25',
                                    'icon-battery-50',
                                    'icon-battery-75',
                                    'icon-battery-100',
                                    'fa-solid',
                                    'fa-xmark'
                                );
                                // Map the battery level to the closest icon class
                                let iconClass;
                                if (batteryPercentageValue == 0) {
                                    iconClass = 'icon-battery-0';
                                } else if (batteryPercentageValue <= 25) {
                                    iconClass = 'icon-battery-25';
                                } else if (batteryPercentageValue <= 50) {
                                    iconClass = 'icon-battery-50';
                                } else if (batteryPercentageValue <= 75) {
                                    iconClass = 'icon-battery-75';
                                } else {
                                    iconClass = 'icon-battery-100';
                                }
                                // Add the appropriate battery class
                                batteryIcon.classList.add(iconClass);
                            }
                        }
                    });
                }
            }
        } catch (err) {
            log(`RX error [${which}]:`, err?.message || err);
        }
    })();
}

function batteryPercentage(voltage, minVolt, maxVolt) {
    if (voltage <= minVolt) return 0;
    if (voltage >= maxVolt) return 100;
    console.info(voltage)
    console.info(Math.round(((voltage - minVolt) / (maxVolt - minVolt)) * 100))
    return Math.round(((voltage - minVolt) / (maxVolt - minVolt)) * 100);
}

function ganB() {
    var b = document.getElementById('cube-view').contentWindow;
    var batteryLevel = parseInt(b.document.getElementById('batteryLevel').value, 10);
    var ganBatterie = document.getElementById('ganBatterie');

    ganBatterie.classList.remove('icon-battery-0', 'icon-battery-25', 'icon-battery-50', 'icon-battery-75', 'icon-battery-100', 'fa-solid', 'fa-xmark');

    let iconClass;
    if (batteryLevel === 0) {
        iconClass = 'icon-battery-0';
    } else if (batteryLevel <= 25) {
        iconClass = 'icon-battery-25';
    } else if (batteryLevel <= 50) {
        iconClass = 'icon-battery-50';
    } else if (batteryLevel <= 75) {
        iconClass = 'icon-battery-75';
    } else if (batteryLevel >= 75) {
        iconClass = 'icon-battery-100';
    } else {
        return ganBatterie.classList.add('fa-solid', 'fa-xmark');
    }

    ganBatterie.classList.add(iconClass);
}

async function updateBatteries() {
    for (const w of [rightWriter, leftWriter]) {
        await sendLine(w, getBattery);
        await sleepT(200)
    }
    await Promise.all([sendLine(leftWriter, clearDisplay), sendLine(rightWriter, clearDisplay)]);
    ganB();
}

// MOVE

async function runMovement(move, sleep = 220, noCube = false) {
    if (!move || typeof move !== "string") return log(`Invalid move ${move}`);
    degCorrection(move);
    const cmd = CLP_LEFT[move] || CLP_RIGHT[move];
    const writer = CLP_LEFT[move] ? leftWriter : rightWriter;
    const wait = (move.startsWith("B") || move.startsWith("D") ? sleep + 40 : sleep) * (move.endsWith("2") ? 2 : 1);
    if (!cmd || !writer) await sleepT(1);
    if (noCube) return console.warn("Cube Not Connected");
    await sendLine(writer, cmd);
    const mov = move.charAt(0);
    const sym = move.charAt(1);
    await sendLine(leftWriter,  `light_matrix.write("${mov}",100)`);
    await sendLine(rightWriter, `light_matrix.write("${sym}",100)`);
    await sleepT(wait);
}

function degCorrection(move) {
    if (move.startsWith("B")) {
        if (move.endsWith("2") || move.endsWith("'")) {
            b = lb === 1 ? cb : 0;
            b1 = b;
            b2 = b;
            lb = 2;
            localStorage.lb = lb
            console.debug(`B - 1 - ${b}`);
        } else {
            b = lb === 2 ? cb : 0;
            b1 = b;
            b2 = b;
            lb = 1;
            localStorage.lb = lb
            console.debug(`B - 2 - ${b}`);
        }
    } else if (move.startsWith("D")) {
        if (move.endsWith("2") || move.endsWith("'")) {
            d = ld === 1 ? cd : 0;
            d1 = d;
            d2 = d;
            ld = 2;
            localStorage.ld = ld
            console.debug(`D - 1 - ${d}`);
        } else {
            d = ld === 2 ? cd : 0;
            d1 = d;
            d2 = d;
            ld = 1;
            localStorage.ld = ld
            console.debug(`D - 2 - ${d}`);
        }
    }
    regen();
}

async function resetMotors() {
    if (!SpikeState.left && !SpikeState.right) {
        log("No Spike connected");
        return;
    }
    scSecure = true;
    log("Resetting motors to home position...");

    // Reset all motors on the left side
    bettew = 4000
    if (SpikeState.left) {
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.A, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.C, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.E, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
    }

    // Reset all motors on the right side
    if (SpikeState.right) {
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.D, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.F, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.B, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
    }

    log("Motors reset complete");
    scSecure = false;
}

async function spikeMove(move) {
    if (scSecure) {
        return
    }
    scSecure = true
    if (!SpikeState.left && !SpikeState.right) {
        scSecure = false
        return
    };
    await runMovement(move);
    await Promise.all([sendLine(leftWriter, clearDisplay), sendLine(rightWriter, clearDisplay)]);
    scSecure = false
}

async function spikeCube(moves, sleeped = 180) {
    regen()
    moves = simplifyMoves(moves);
    console.info(moves)
    if (scSecure) return console.warn("NO SPAM !!!");
    scSecure = true;
    const noCube = ganCubePresent();
    if (noCube) return console.warn("Cube Not Connected")
    const sleep = sleeped || window.sleeped;

    const lenStr = String(moves.length).padStart(2, "0");
    await Promise.all([
        sendLine(leftWriter, `light_matrix.write("${lenStr[0]}",100)`),
        sendLine(rightWriter, `light_matrix.write("${lenStr[1]}",100)`)
    ]);

    await sleepT(2000)
    const start = new Date();
    startTimer(start);

    for (let i = 0; i < moves.length; i++) {
        const m = moves[i], n = moves[i + 1];
        if (isOpposite(m, n)) {
            await Promise.all([
                runMovement(m, sleep, noCube),
                runMovement(n, sleep + 10, noCube)
            ]);
            i++;
        } else await runMovement(m, sleep, noCube);
    }
    if (areBothSpikesConnected() || debug) {
        stopTimer(start);
    }
    await sleepT(200)
    await updateBatteries();
    scSecure = false;
}

// KEYBOARD MOVES

var Soupdate = () => {
    if (!scSecure && store.length != 0) {
        var toPlay = store.shift()
        try {
            spikeMove(toPlay)
        } catch { }
    }
}

async function playMove(move) {
    regen()
    store.push(move)
}

// TIMER

function startTimer(startTime) {
    bc.postMessage("last" + startTime.toString());
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let elapsed = ((new Date() - startTime) / 1000).toFixed(3);
        document.getElementById('timer').innerHTML = '<i class="fa-solid fa-clock"></i> : ' + elapsed + 'S';
    }, 1);
}

function stopTimer(startTime) {
    if (timerInterval) {
        clearInterval(timerInterval);
        try {
            let elapsed = ((new Date() - startTime) / 1000).toFixed(3);
            bc.postMessage(Number(elapsed));
        } catch {

        }
        timerInterval = null;

    }
}

// SIMPLIFY MOVES

const oppositeFace = { U: "D", D: "U", F: "B", B: "F", L: "R", R: "L" };
const normalize = (m) => m?.replace(/2|'/g, "");
const isOpposite = (a, b) => normalize(a) && normalize(b) && oppositeFace[normalize(a)] === normalize(b);

function simplifyMoves(moves) {
    const out = [];
    for (let i = 0; i < moves.length; i++) {
        const a = moves[i];
        const b = moves[i + 1];

        if (!b) {
            out.push(a);
            continue;
        }

        const fa = normalize(a);
        const fb = normalize(b);

        if (fa === fb && !a.includes("'") && !b.includes("'")) {
            out.push(fa + "2");
            i++;
        } else if (fa === fb && a.includes("'") !== b.includes("'")) {
            i++;
        } else if (oppositeFace[fa] === fb) {
            out.push(a);
        } else if (fa === fb && (a.includes("2") || b.includes("2"))) {
            const isA2 = a.includes("2");
            const isBPrime = b.includes("'");
            out.push(isA2 ? (isBPrime ? fa : fa + "'") : (isBPrime ? fa + "'" : fa + "2"));
            i++;
        } else {
            out.push(a);
        }
    }
    return out;
}

// NAVBAR

async function fullConnect() {
    scSecure = false
    if (!ganCubePresent()) {
        await spike(true)
        connect()
    } else {
        await spike(false)
    }
    await updateBatteries()
}

function solve() {
    if (!solveSecure) {
        solveSecure = true
        worker.postMessage({ type: 'solve', state: cube.asString() });
        setTimeout(() => {
            solveSecure = false
        }, 6001)
    }
}

async function scramble() {
    if (!scSecure) {
        console.info("Start Scramble")
        var moves = generateScramble(scLenght)
        if (!silence) {
            await sendLine(leftWriter, scrambleSound);
        }
        await spikeCube(moves, 300)
        console.info("End Scramble")
    }
}

async function startCube() {
    console.info("Start Cube")
    await spikeCube(['U', "U'"], 300)
}

async function spin() {
    if (!spinState) {
        console.info("Start Spin")
        spinState = true
        await sendLine(leftWriter, 'motor.run(port.A, 50)')
    } else {
        console.info("End Spin")
        spinState = false
        await sendLine(leftWriter, 'motor.stop(port.A)')
    }
}

// FULLSCREEN

function fullscreen() {
    if (!fullscreenstate) {
        document.getElementById('cube3d').requestFullscreen()
            .then(() => {
                document.getElementById('full').innerHTML = `<i class="fa-solid fa-compress"></i>`;
            })
            .catch(err => {
                console.error("Error attempting to enable fullscreen:", err);
            });
        fullscreenstate = true;
    } else {
        document.exitFullscreen()
            .then(() => {
                document.getElementById('full').innerHTML = `<i class="fa-solid fa-expand"></i>`;
            })
        fullscreenstate = false;
    }
}

document.addEventListener("fullscreenchange", (e) => {
    if (!document.fullscreenElement) {
        document.getElementById('full').innerHTML = `<i class="fa-solid fa-expand"></i>`;
        fullscreenstate = false;
    }
    if (document.fullscreenElement) {
        document.getElementById('full').innerHTML = `<i class="fa-solid fa-compress"></i>`;
        fullscreenstate = true;
    }
});

// SEXY MOVES

async function sexyMoves1() {
    console.log("Start Sexy Move 1")
    await spikeCube(sexyMove1, 200)
    console.log("End Sexy Move 1")
}

async function sexyMoves2() {
    console.log("Start Sexy Move 2")
    await spikeCube(sexyMove2, 200)
    console.log("End Sexy Move 2")
}

async function sexyMoves3() {
    console.log("Start Sexy Move 3")
    await spikeCube(sexyMove3, 200)
    console.log("End Sexy Move 3")
}

async function solve2ndCube(mvs) {
    if (!bc) return console.warn("No bc connection found");
    if (!mvs || mvs.length === 0) return console.warn("No moves for 2nd cube");

    window.dontMove = true;
    console.info("Starting 2nd cube solve");
    console.info("Moves: ", mvs);
    let still = [...mvs];
    await new Promise((resolve) => {
        bc.onmessage = (e) => {
            const data = e.data;
            if (typeof data !== "string" || !data.startsWith("Move: ")) return;

            const move = data.replace("Move: ,", "").trim();
            const expected = still[0];
            const next = still[1]

            if (move === expected) {
                still.shift();
                if (still.length !== 0) console.info(`Next: ${next}`);
            } else {
                console.warn(`No: ${move}, expected: ${expected}`);
                console.info(`Correct move: `, )
            }

            if (still.length === 0) {
                resolve();
            }
        };
    });

    window.dontMove = false;
    console.info("2nd cube solved");
}

// KEYBOARD MAPPIMG

document.addEventListener('DOMContentLoaded', () => {
    const keyToCubeMove = {
        5: 'U',
        t: "U'",
        g: 'U2',
        6: 'R',
        y: "R'",
        h: 'R2',
        7: 'F',
        u: "F'",
        j: 'F2',
        8: 'L',
        i: "L'",
        k: 'L2',
        9: 'D',
        o: "D'",
        l: 'D2',
        0: 'B',
        p: "B'",
        ';': 'B2',
    };
    let keyboard = {
        "1": sexyMoves1,
        "2": sexyMoves2,
        "3": sexyMoves3,
        "c": fullConnect,
        "r": reset,
        "enter": solve,
        "w": startCube,
        "s": spin,
        "f": fullscreen,
        "backspace": scramble
    }
    document.body.addEventListener('keydown', (e) => {
        const ctrlKeys = ['c', 'v', 'z', 'f', 'w', 't', 's', 'r', 'x', 'a', 'l'];
        if (e.ctrlKey && ctrlKeys.includes(e.key)) return;
        const fn = keyboard[e.key] || keyboard[e.key.toLowerCase()];
        const fn2 = keyToCubeMove[e.key] || keyToCubeMove[e.key.toLowerCase()]
        if (fn) {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation()
            fn()
        } else if (fn2) {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation()
            playMove(fn2)
        };
        bc.postMessage('key' + e.key)
    });
    document.body.addEventListener('keyup', (e) => {
        bc.postMessage('ked' + e.key)
    });

    bc.postMessage("Connected");

    bc.onmessage = (e) => {
    var data = e.data
    if (data == true) {
        document.getElementById('timerBlock').style.display = 'none'
        bcState = true;
    } else if (data == false) {
        document.getElementById('timerBlock').style.display = 'block'
    } else if (data.startsWith("Move: ") && !window.dontMove) {
        let move = data.replace("Move: ", "");
        console.log(`%cSec:  ${move}`, 'color:#eb34d8;');
        playMove(move);
    } 
    else {
        console.debug("Unknown message from Slide tab: ", data)
    }
}
});

// BROADCAST

const bc = new BroadcastChannel(localStorage.bc);