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
let scLenght = 20;
let debug = false;
let deg = 95;
let dog = 180
let u = 0
let f = 0
let l = 0
let r = 0
let b = 0
let d = 0

let u1 = 0
let f1 = 0
let l1 = 0
let r1 = 0
let b1 = 0
let d1 = 0


let u2 = 0
let f2 = 0
let l2 = 0
let r2 = 0
let b2 = 0
let d2 = 0

let cb = 5; // back deg corr
let cd = 5; // down deg corr

let lb = localStorage.lb || 0;
let ld = localStorage.ld || 0;

var silence = false

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
debug = new URLSearchParams(window.location.search).get('debug') === 'true';

if (debug) {
  console.log('Debug mode enabled');
} else {
  console.log('Debug mode disabled add ?debug=true in url to enable');
}

// LEFT side ports: A, C, E

/*
const CLP_LEFT = {
    "U":  "motor.run_for_degrees(port.E, -${deg}, 1110)",
    "U'": "motor.run_for_degrees(port.E, ${deg}, 1110)",
    "U2": "motor.run_for_degrees(port.E, ${dog}, 1110)",

    "L":  "motor.run_for_degrees(port.C, -${deg}, 1110)",
    "L'": "motor.run_for_degrees(port.C, ${deg}, 1110)",
    "L2": "motor.run_for_degrees(port.C, ${dog}, 1110)",

    "F":  "motor.run_for_degrees(port.A, -${deg}, 1110)",
    "F'": "motor.run_for_degrees(port.A, ${deg}, 1110)",
    "F2": "motor.run_for_degrees(port.A, ${dog}, 1110)",
};
// RIGHT side ports: B, D, F
const CLP_RIGHT = {
    "R":  "motor.run_for_degrees(port.D, -${deg}, 1110)",
    "R'": "motor.run_for_degrees(port.D, ${deg}, 1110)",
    "R2": "motor.run_for_degrees(port.D, ${dog}, 1110)",

    "B":  "motor.run_for_degrees(port.F, -${deg}, 1110)",
    "B'": "motor.run_for_degrees(port.F, ${deg}, 1110)",
    "B2": "motor.run_for_degrees(port.F, ${dog}, 1110)",

    "D":  "motor.run_for_degrees(port.B, -${deg}, 1110)",
    "D'": "motor.run_for_degrees(port.B, ${deg}, 1110)",
    "D2": "motor.run_for_degrees(port.B, ${dog}, 1110)",
};*/

/*
const CLP_LEFT = {
    // Face U
    "U": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U'": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "U2": "motor.run_to_absolute_position(port.A, (motor.absolute_position(port.A) + (motor.absolute_position(port.A) - round(motor.absolute_position(port.A) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face L
    "L": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L'": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "L2": "motor.run_to_absolute_position(port.C, (motor.absolute_position(port.C) + (motor.absolute_position(port.C) - round(motor.absolute_position(port.C) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face F
    "F": "motor.run_to_absolute_position(port.E,  (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F'": "motor.run_to_absolute_position(port.E, (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "F2": "motor.run_to_absolute_position(port.E, (motor.absolute_position(port.E) + (motor.absolute_position(port.E) - round(motor.absolute_position(port.E) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};

const CLP_RIGHT = {
    // Face R
    "R": "motor.run_to_absolute_position(port.D,  (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R'": "motor.run_to_absolute_position(port.D, (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "R2": "motor.run_to_absolute_position(port.D, (motor.absolute_position(port.D) + (motor.absolute_position(port.D) - round(motor.absolute_position(port.D) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face B
    "B": "motor.run_to_absolute_position(port.F,  (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B'": "motor.run_to_absolute_position(port.F, (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "B2": "motor.run_to_absolute_position(port.F, (motor.absolute_position(port.F) + (motor.absolute_position(port.F) - round(motor.absolute_position(port.F) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",

    // Face D
    "D": "motor.run_to_absolute_position(port.B,  (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 95) * 95) * -2) - ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D'": "motor.run_to_absolute_position(port.B, (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 95) * 95) * -2) + ${deg}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
    "D2": "motor.run_to_absolute_position(port.B, (motor.absolute_position(port.B) + (motor.absolute_position(port.B) - round(motor.absolute_position(port.B) / 95) * 95) * -2) + ${dog}, 1110, stop=motor.SMART_BRAKE, acceleration=100000000, deceleration=100000000);\n",
};
*/
let CLP_LEFT;
let CLP_RIGHT;

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
function generateScramble(n = 20) {
    const result = [];
    for (let i = 0; i < n; i++) {
        let m;
        do m = ALL_MOVES[Math.random() * ALL_MOVES.length | 0];
        while (i && m[0] === result[i - 1][0]);
        result.push(m);
    }
    return result;
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
    console.log(`No ${side} port found, retrying in 5s`);
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

async function FullConnect() {
    scSecure = false
    if (!ganCubePresent()) {
        await spike(true)
        connect()
    } else {
        await spike(false)
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

function areBothSpikesConnected() {
    return SpikeState.left && SpikeState.right && leftPort && rightPort;
}

async function startReading(which, reader) {
    if (!reader) return;
    (async () => {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    //log(`RX [${which}]:`, value);
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


/*async function runMovement(move, sleep = 220, noCube = false) {
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
}*/

async function runMovement(move, sleep = 220, noCube = false) {
    if (!move || typeof move !== "string") return log(`Invalid move ${move}`);
    if (move.startsWith("B")) {
        if (move.endsWith("2") || move.endsWith("'")) {
            b = lb === 1 ? cb : 0;
            b1 = b;
            b2 = b;
            lb = 2;
            localStorage.lb = lb
            console.warn(`B - 1 - ${b}`);
        } else {
            b = lb === 2 ? cb : 0;
            b1 = b;
            b2 = b;
            lb = 1;
            localStorage.lb = lb
            console.warn(`B - 2 - ${b}`);
        }
    } else if (move.startsWith("D")) {
        if (move.endsWith("2") || move.endsWith("'")) {
            d = ld === 1 ? cd : 0;
            d1 = d;
            d2 = d;
            ld = 2;
            localStorage.ld = ld
            console.error(`D - 1 - ${d}`);
        } else {
            d = ld === 2 ? cd : 0;
            d1 = d;
            d2 = d;
            ld = 1;
            localStorage.ld = ld
            console.error(`D - 2 - ${d}`);
        }
    }
    regen();
    const cmd = CLP_LEFT[move] || CLP_RIGHT[move];
    const writer = CLP_LEFT[move] ? leftWriter : rightWriter;
    if (debug) {
        console.info(cmd)
    }
    const wait = (move.startsWith("B") || move.startsWith("D") ? sleep + 40 : sleep) * (move.endsWith("2") ? 2 : 1);
    if (!cmd || !writer) await new Promise(r => setTimeout(r, 1));

    if (!noCube) {
        await sendLine(writer, cmd);
        await sendLine(leftWriter, `light_matrix.write("${move[0]}",100)`);
        const sym = move.endsWith("'") ? "'" : move.endsWith("2") ? "2" : "";
        await sendLine(rightWriter, `light_matrix.write("${sym}",100)`);
    } else window.mover(move);

    await new Promise(r => setTimeout(r, wait));
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
    for (const w of [rightWriter, leftWriter]) {
        await sendLine(w, getBattery);
        await new Promise(r => setTimeout(r, 200));
    }
    await Promise.all([sendLine(leftWriter, clearDisplay), sendLine(rightWriter, clearDisplay)]);
    ganB();
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
var Soupdate = () => {
    if (!scSecure && store.length != 0) {
        var toPlay = store.shift()
        try {
            SpikeMove(toPlay)
        } catch { }
    }
}

async function playMove(move) {
    regen()
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
        if (fa !== fb) { out.push(a); }
        if (a === b) { out.push(fa + "2"); i++; }
        if (a.includes("'") !== b.includes("'")) { i++; }
        if (a.includes("2") || b.includes("2")) {
            out.push((a.includes("2") ^ b.includes("'")) ? fa + "'" : fa);
            i++;
        } else out.push(a);
    }
    return out;
}

window.sleeped = 170;

async function SpikeCube(moves, sleeped = 180) {
    regen()
    if (scSecure) return;
    scSecure = true;
    const noCube = ganCubePresent();
    const sleep = sleeped || window.sleeped;
    moves = simplifyMoves(moves);

    const lenStr = String(moves.length).padStart(2, "0");
    await Promise.all([
        sendLine(leftWriter, `light_matrix.write("${lenStr[0]}",100)`),
        sendLine(rightWriter, `light_matrix.write("${lenStr[1]}",100)`)
    ]);

    await new Promise(r => setTimeout(r, 2000));
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
    if (areBothSpikesConnected()) {
        stopTimer(start);
    }
    await new Promise(r => setTimeout(r, 200));
    await updateBatteries();
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
        if (!silence) {
            await sendLine(leftWriter, scrambleSound);
        }
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
        const ctrlKeys = ['c', 'v', 'z', 'f', 'w', 't', 's'];
        if (e.ctrlKey && ctrlKeys.includes(e.key)) {return;}
        const fn = keyboard[e.key] || keyboard[e.key.toLowerCase()];
        const fn2 = keyToCubeMove[e.key] || keyToCubeMove[e.key.toLowerCase()]
        if (fn) {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation()
            fn()
        };
        if (fn2) {
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
});


// Connection to a broadcast channel
const bc = new BroadcastChannel(localStorage.bc);
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