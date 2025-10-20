let leftPort = null;
let rightPort = null;
let leftWriter = null;
let rightWriter = null;
let leftReader = null;
let rightReader = null;
let leftAbort = null;
let rightAbort = null;
let SpikeState = { left: false, right: false };
let scSecure = false
let SolveSecure = false
let scLenght = 30;



const sexyMove1 = ["R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'"];
const sexyMove2 = ["L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2"];
const sexyMove3 = ["R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2"];

const startup = "cor=1.5\n\nimport motor\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear();\nmotor.motor_set_high_resolution_mode(port.A, True);\nmotor.motor_set_high_resolution_mode(port.B, True);\nmotor.motor_set_high_resolution_mode(port.C, True);\nmotor.motor_set_high_resolution_mode(port.D, True);\nmotor.motor_set_high_resolution_mode(port.E, True);\nmotor.motor_set_high_resolution_mode(port.F, True)";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 900) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
const getBattery = `import hub\n\nprint("Ba" + str(hub.battery_voltage()))`
const clearDisplay = `light_matrix.clear();\n`

// LEFT side ports: A, C, E

/*
const CLP_LEFT = {
    "U":  "motor.run_for_degrees(port.E, -90, 1110)",
    "U'": "motor.run_for_degrees(port.E, 90, 1110)",
    "U2": "motor.run_for_degrees(port.E, 180, 1110)",

    "L":  "motor.run_for_degrees(port.C, -90, 1110)",
    "L'": "motor.run_for_degrees(port.C, 90, 1110)",
    "L2": "motor.run_for_degrees(port.C, 180, 1110)",

    "F":  "motor.run_for_degrees(port.A, -90, 1110)",
    "F'": "motor.run_for_degrees(port.A, 90, 1110)",
    "F2": "motor.run_for_degrees(port.A, 180, 1110)",
};
// RIGHT side ports: B, D, F
const CLP_RIGHT = {
    "R":  "motor.run_for_degrees(port.D, -90, 1110)",
    "R'": "motor.run_for_degrees(port.D, 90, 1110)",
    "R2": "motor.run_for_degrees(port.D, 180, 1110)",

    "B":  "motor.run_for_degrees(port.F, -90, 1110)",
    "B'": "motor.run_for_degrees(port.F, 90, 1110)",
    "B2": "motor.run_for_degrees(port.F, 180, 1110)",

    "D":  "motor.run_for_degrees(port.B, -90, 1110)",
    "D'": "motor.run_for_degrees(port.B, 90, 1110)",
    "D2": "motor.run_for_degrees(port.B, 180, 1110)",
};*/

/*
const CLP_LEFT = {
    // Face U
    "U": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U'": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U2": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face L
    "L": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L'": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L2": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face F
    "F": "motor.run_to_absolute_position(port.E,  (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F'": "motor.run_to_absolute_position(port.E, (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F2": "motor.run_to_absolute_position(port.E, (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};

const CLP_RIGHT = {
    // Face R
    "R": "motor.run_to_absolute_position(port.D,  (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R'": "motor.run_to_absolute_position(port.D, (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R2": "motor.run_to_absolute_position(port.D, (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face B
    "B": "motor.run_to_absolute_position(port.F,  (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B'": "motor.run_to_absolute_position(port.F, (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B2": "motor.run_to_absolute_position(port.F, (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face D
    "D": "motor.run_to_absolute_position(port.B,  (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 90) * 90) * -2) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D'": "motor.run_to_absolute_position(port.B, (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 90) * 90) * -2) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D2": "motor.run_to_absolute_position(port.B, (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 90) * 90) * -2) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};
*/

const CLP_LEFT = {
    // Face U
    "U": "motor.run_to_absolute_position(port.A,  motor.absolute_position(port.A)- 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U'": "motor.run_to_absolute_position(port.A, motor.absolute_position(port.A)+ 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U2": "motor.run_to_absolute_position(port.A, motor.absolute_position(port.A)+ 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face L
    "L": "motor.run_to_absolute_position(port.C,  motor.absolute_position(port.C) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L'": "motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L2": "motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face F
    "F": "motor.run_to_absolute_position(port.E,  motor.absolute_position(port.E)- 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F'": "motor.run_to_absolute_position(port.E, motor.absolute_position(port.E)+ 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F2": "motor.run_to_absolute_position(port.E, motor.absolute_position(port.E)+ 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};

const CLP_RIGHT = {
    // Face R
    "R": "motor.run_to_absolute_position(port.D,  motor.absolute_position(port.D)- 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R'": "motor.run_to_absolute_position(port.D, motor.absolute_position(port.D)+ 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R2": "motor.run_to_absolute_position(port.D, motor.absolute_position(port.D)+ 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face B
    "B": "motor.run_to_absolute_position(port.F,  motor.absolute_position(port.F) - 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B'": "motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B2": "motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face D
    "D": "motor.run_to_absolute_position(port.B,  motor.absolute_position(port.B)- 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D'": "motor.run_to_absolute_position(port.B, motor.absolute_position(port.B)+ 90, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D2": "motor.run_to_absolute_position(port.B, motor.absolute_position(port.B)+ 180, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};


// Merge into one pool
const ALL_MOVES = Object.keys({ ...CLP_LEFT, ...CLP_RIGHT });

// run all
// SpikeCube(['U','L','F','R','B','D'])

// SpikeCube(['U2','L2','F2','R2','B2','D2'])

// SpikeCube(["U", "L2", "F'", "R", "D2", "B", "U'", "R2", "L", "D", "F2", "B'", "U2", "L'", "D", "R2", "F'", "B2", "U'", "D'"])

/**
 * Generate a random scramble table
 * @param {number} count - number of moves
 * @returns {string[]} - array of move notations
 */
function generateScramble(count = 20) {
    const scramble = [];

    for (let i = 0; i < count; i++) {
        let move;
        do {
            move = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
        } while (i > 0 && move[0] === scramble[i - 1][0]);
        // avoids repeating same face twice in a row (e.g., "U" then "U'")

        scramble.push(move);
    }

    return scramble;
}

function log(...args) {
    console.info(...args);
    const logEl = document.getElementById('log');
    if (logEl) {
        logEl.textContent += args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

/**
 * Calculate battery percentage given current voltage.
 * @param {number} voltage Current voltage (e.g. in millivolts or volts)
 * @param {number} minVolt Voltage corresponding to 0% (dead)
 * @param {number} maxVolt Voltage corresponding to 100% (full)
 * @returns {number} Battery percentage (clamped between 0 and 100)
 */
function batteryPercentage(voltage, minVolt, maxVolt) {
    if (voltage <= minVolt) return 0;
    if (voltage >= maxVolt) return 100;
    console.warn(voltage)
    console.warn(Math.round(((voltage - minVolt) / (maxVolt - minVolt)) * 100))
    return Math.round(((voltage - minVolt) / (maxVolt - minVolt)) * 100);
}


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
        startReading(which, reader);

        await sendLine(writer, startup);
        await sendLine(writer, connectSound);

        log(`${which} Spike connected`);
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
    }
}

async function spike() {
    await openSpike('left')
    await openSpike('right')
}

async function FullConnect() {
    scSecure = false
    await spike()
    if (document.getElementById('FC').innerHTML != '<i class="fa-solid fa-plug-circle-exclamation"></i>') {
        connect()
    }
}

async function sendLine(writer, text) {
    if (!writer) return;
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized);
    await writer.write(bytes);
    await writer.write(encoder.encode('\r\n'));
    log("TX:", text);
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

async function startReading(which, reader) {
    if (!reader) return;
    (async () => {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    log(`RX [${which}]:`, value);
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


async function runMovement(move, sleep = 220, noCube = false) {
    // Validate input
    if (!move || typeof move !== 'string') {
        log(`Error: Invalid move '${move}'`);
        return;
    }

    // Determine command and writer
    let cmd, writer;
    if (CLP_LEFT[move]) {
        cmd = CLP_LEFT[move];
        writer = leftWriter;
    } else if (CLP_RIGHT[move]) {
        cmd = CLP_RIGHT[move];
        writer = rightWriter;
    } else {
        log(`Error: Movement '${move}' not found or no Spike connected`);
        return;
    }

    // Handle cube movement
    if (!noCube) {
        log(`Running move '${move}'`);
        await sendLine(writer, cmd);
        await sendLine(leftWriter, `light_matrix.write("${move.charAt(0)}",100)`);

        // Adjust wait time for B/D moves
        const waitTimer = (move.startsWith('B') || move.startsWith('D')) ? sleep + 40 : sleep;

        // Handle move suffix (', 2, or none)
        if (move.endsWith("'")) {
            await sendLine(rightWriter, 'light_matrix.write("\'",100)');
        } else if (move.endsWith("2")) {
            await sendLine(rightWriter, 'light_matrix.write("2",100)');
        } else {
            await sendLine(rightWriter, 'light_matrix.write("",100)');
        }

        // Wait based on move suffix
        const waitMultiplier = move.endsWith("'") ? 1 : move.endsWith("2") ? 2 : 1;
        await new Promise(r => setTimeout(r, waitTimer * waitMultiplier));
    } else {
        // No cube: use window.mover
        window.mover(move);
        const waitTimer = (move.startsWith('B') || move.startsWith('D')) ? sleep + 40 : sleep;
        const waitMultiplier = move.endsWith("'") ? 1 : move.endsWith("2") ? 2 : 1;
        await new Promise(r => setTimeout(r, waitTimer * waitMultiplier));
    }
}

function ganCubePresent() {
    var b = document.getElementById('cube-view').contentWindow;
    //return b.document.getElementById("batteryLevel").value == "- n/a -"
    return false
}

function ganB() {
    var b = document.getElementById('cube-view').contentWindow;
    var batteryLevel = parseInt(b.document.getElementById('batteryLevel').value, 10);
    var ganBatterie = document.getElementById('ganBatterie');

    // Remove all existing battery classes
    ganBatterie.classList.remove('icon-battery-0', 'icon-battery-25', 'icon-battery-50', 'icon-battery-75', 'icon-battery-100', 'fa-solid', 'fa-xmark');

    // Map the battery level to the closest icon class
    let iconClass;
    if (batteryLevel === 0) {
        iconClass = 'icon-battery-0';
    } else if (batteryLevel <= 25) {
        iconClass = 'icon-battery-25';
    } else if (batteryLevel <= 50) {
        iconClass = 'icon-battery-50';
    } else if (batteryLevel <= 75) {
        iconClass = 'icon-battery-75';
    } else {
        iconClass = 'icon-battery-100';
    }

    // Add the appropriate battery class
    ganBatterie.classList.add(iconClass);
}

async function updateBatteries() {
    await sendLine(rightWriter, getBattery)
    await new Promise(r => setTimeout(r, 200));
    await sendLine(leftWriter, getBattery)
    await new Promise(r => setTimeout(r, 200));
    await sendLine(leftWriter, clearDisplay)
    await sendLine(rightWriter, clearDisplay)
    ganB()
}

async function SpikeMove(move) {
    if (scSecure) {
        return
    }
    scSecure = true
    if (!SpikeState.left && !SpikeState.right) {
        scSecure = false
        return
    };
    await runMovement(move);
    updateBatteries()
    scSecure = false
}

var store = []
var Soupdate= () => {
    if (!scSecure && store.length != 0) {
        var toPlay = store.shift()
        try {
            SpikeMove(toPlay)
        } catch { }
    }
}

async function playMove(move) {
    store.push(move)
    console.log(move)
}

let timerInterval = null;

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

const oppositeFace = { U: "D", D: "U", F: "B", B: "F", L: "R", R: "L" };
const normalize = m => m?.replace(/2|'/g, "");
const isOpposite = (a, b) => normalize(a) && normalize(b) && oppositeFace[normalize(a)] === normalize(b);

function simplifyMoves(moves) {
    const out = [];
    for (let i = 0; i < moves.length; i++) {
        const a = moves[i], b = moves[i + 1];
        if (!b) return [...out, a];
        const fa = normalize(a), fb = normalize(b);
        if (fa !== fb) { out.push(a); continue; }
        if (a === b) { out.push(fa + "2"); i++; continue; }
        if (a.includes("'") !== b.includes("'")) { i++; continue; }
        if (a.includes("2") || b.includes("2")) {
            out.push((a.includes("2") ^ b.includes("'")) ? fa + "'" : fa);
            i++;
        } else out.push(a);
    }
    return out;
}

window.sleeped = 180;

async function SpikeCube(moves, sleeped = 180) {
    //if (scSecure || !SpikeState.left || !SpikeState.right) return;
    if (scSecure) return;
    scSecure = true;
    const noCube = ganCubePresent();
    const sleep = sleeped === 180 ? window.sleeped : sleeped;
    moves = simplifyMoves(moves);

    const lenStr = String(moves.length).padStart(2, "0");
    sendLine(leftWriter, `light_matrix.write("${lenStr[0]}",100)`);
    sendLine(rightWriter, `light_matrix.write("${lenStr[1]}",100)`);

    await new Promise(r => setTimeout(r, 2001));
    const start = new Date();
    startTimer(start)

    for (let i = 0; i < moves.length; i++) {
        const m = moves[i]
        const n = moves[i + 1];
        if (isOpposite(m, n)) {
            console.log(m,n)
            runMovement(m, sleep, noCube);
            await runMovement(n, sleep + 10, noCube);
            i++;
        } else await runMovement(m, sleep, noCube);
    }

    stopTimer(start);
    await new Promise(r => setTimeout(r, 200));
    updateBatteries();
    scSecure = false;
}


// hook for cube solver worker
function sc() {
    if (!SolveSecure) {
        SolveSecure = true
        worker.postMessage({ type: 'solve', state: cube.asString() });
        setTimeout(() => {
            SolveSecure = false
        }, 6001)
    }
}

log("Ready. Use openSpike('left') and openSpike('right') to connect.");

async function scramble() {
    if (!scSecure) {
        var moves = generateScramble(scLenght)
        SpikeCube(moves, 300)
    }
}

async function leb() {
    for (let i = 0; i <= 15; i++) {
        await scramble()
        await new Promise(r => setTimeout(r, 15000));
        sc()
        await new Promise(r => setTimeout(r, 100000000));
    }
}

function StartCube() {
    SpikeCube(['U2'], 300)
}

let SpinState = true
async function spin() {
    if (SpinState) {
        SpinState = false
        await sendLine(leftWriter, 'motor.run(port.A, 50)')
    } else {
        SpinState = true
        await sendLine(leftWriter, 'motor.stop(port.A)')
    }
}

let fullscreenstate = false;

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

document.addEventListener("fullscreenchange", (event) => {
    if (!document.fullscreenElement) {
        document.getElementById('full').innerHTML = `<i class="fa-solid fa-expand"></i>`;
        fullscreenstate = false;
    }
    if (document.fullscreenElement) {
        document.getElementById('full').innerHTML = `<i class="fa-solid fa-compress"></i>`;
        fullscreenstate = true;
    }
});

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
        await new Promise(resolve => setTimeout(resolve, bettew));
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.C, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await new Promise(resolve => setTimeout(resolve, bettew));
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.E, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await new Promise(resolve => setTimeout(resolve, bettew));
    }

    // Reset all motors on the right side
    if (SpikeState.right) {
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.D, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await new Promise(resolve => setTimeout(resolve, bettew));
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.F, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await new Promise(resolve => setTimeout(resolve, bettew));
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.B, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000);");
        await new Promise(resolve => setTimeout(resolve, bettew));
    }

    log("Motors reset complete");
    scSecure = false;
}

function sexyMoves1() {
    SpikeCube(sexyMove1, 200)
}
function sexyMoves2() {
    SpikeCube(sexyMove2, 200)
}
function sexyMoves3() {
    SpikeCube(sexyMove3, 200)
}

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
        "c": FullConnect,
        "r": reset,
        "enter": sc,
        "w": StartCube,
        "s": spin,
        "f": fullscreen,
        "backspace": scramble
    }
    document.body.addEventListener('keydown', (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
        console.log('Key pressed:', event.key);
        const fn = keyboard[e.key] || keyboard[e.key.toLowerCase()];
        const fn2 = keyToCubeMove[e.key] || keyToCubeMove[e.key.toLowerCase()]
        if (fn) {
            console.log('working')
            fn()
        };
        if (fn2) {
            playMove(fn2)
        };
    });
});


// Connection to a broadcast channel
const bc = new BroadcastChannel("test_channel");
// Example of sending of a very simple message
bc.postMessage("This is a test message.");

bc.onmessage = (event) => {
    var data = event.data
    if (data == true) {
        document.getElementById('timerBlock').style.display = 'none'
    } else if (data == false) {
        document.getElementById('timerBlock').style.display = 'block'
    }
}