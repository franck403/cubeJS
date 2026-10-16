let leftPort, rightPort = null;
let leftWriter, rightWriter = null;
let leftReader, rightReader = null;
let leftAbort, rightAbort = null;

var store = [];

let SpikeState = { left: false, right: false };

let scSecure = false;
let solveSecure = false;
let fullscreenstate = false;
let spinState = false;
let bcState = false;


let scLenght = 20;

let deg = 90;  // Moves x 1
let dog = 180; // Moves x 2

let intSolve = 100;
let intScramble = 100;

let intSolveFast = 0;

let u = 0, f = 0, l = 0, r = 0, b = 0, d = 0;
let u1 = 0, f1 = 0, l1 = 0, r1 = 0, b1 = 0, d1 = 0;
let u2 = 0, f2 = 0, l2 = 0, r2 = 0, b2 = 0, d2 = 0;

var silence = true;

let timerInterval = null;

window.sleeped = intSolve;

let nxt;
let wrong;

const sexyMove1 = ["R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'"];
const sexyMove2 = ["L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2"];
const sexyMove3 = ["R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2"];
const cubecube = ["F", "L", "F", "U'", "R", "U", "F2", "L2", "U'", "L'", "B", "D'", "B'", "L2", "U"]

const startup = "cor=1.5\n\nimport motor\n\nimport runloop\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear();\n\n";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const scrambleSound = "sound.beep(784,100);time.sleep_ms(100);sound.beep(659,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(494,150);time.sleep_ms(150);sound.beep(392,200)";
const solveSound = "sound.beep(392,100);time.sleep_ms(100);sound.beep(494,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(659,150);time.sleep_ms(150);sound.beep(784,200);time.sleep_ms(200);sound.beep(988,300)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 950) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
const getBattery = `import hub\nprint("Ba" + str(hub.battery_voltage()))`
const clearDisplay = `light_matrix.clear();\n`

let CLP_LEFT;
let CLP_RIGHT;

let AbortRun = false;

// =========================================================================================================

// COMMANDS

let acel = 100000
let decel = acel

// motor.absolute_position(port.A)
// motor.absolute_position(port.A)
function regen() {
    CLP_LEFT = {
        // Face U
        "U": `motor.run_to_absolute_position(port.A,  motor.absolute_position(port.A) - ${deg + u}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "U'": `motor.run_to_absolute_position(port.A, motor.absolute_position(port.A) + ${deg + u1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "U2": `motor.run_to_absolute_position(port.A, motor.absolute_position(port.A) + ${dog + u2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,

        // Face L
        "L": `motor.run_to_absolute_position(port.C,  motor.absolute_position(port.C) - ${deg + l}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "L'": `motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + ${deg + l1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "L2": `motor.run_to_absolute_position(port.C, motor.absolute_position(port.C) + ${dog + l2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,

        // Face F
        "F": `motor.run_to_absolute_position(port.E,  motor.absolute_position(port.E) - ${deg + f}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "F'": `motor.run_to_absolute_position(port.E, motor.absolute_position(port.E) + ${deg + f1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "F2": `motor.run_to_absolute_position(port.E, motor.absolute_position(port.E) + ${dog + f2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
    };

    CLP_RIGHT = {
        // Face R
        "R": `motor.run_to_absolute_position(port.B,  motor.absolute_position(port.B) - ${deg + r}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "R'": `motor.run_to_absolute_position(port.B, motor.absolute_position(port.B) + ${deg + r1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "R2": `motor.run_to_absolute_position(port.B, motor.absolute_position(port.B) + ${dog + r2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,

        // Face B
        "B": `motor.run_to_absolute_position(port.F,  motor.absolute_position(port.F) - ${deg + b}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "B'": `motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + ${deg + b1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "B2": `motor.run_to_absolute_position(port.F, motor.absolute_position(port.F) + ${dog + b2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,

        // Face D
        "D": `motor.run_to_absolute_position(port.D,  motor.absolute_position(port.D) - ${deg + d}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "D'": `motor.run_to_absolute_position(port.D, motor.absolute_position(port.D) + ${deg + d1}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
        "D2": `motor.run_to_absolute_position(port.D, motor.absolute_position(port.D) + ${dog + d2}, 1000, stop=motor.SMART_COAST, acceleration=${acel}, deceleration=${decel});\n`,
    };
}

const waiting = { left: null, right: null };
const LineWaiting = { left: null, right: null };

regen();

async function sleepT(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const ALL_MOVES = Object.keys({ ...CLP_LEFT, ...CLP_RIGHT });

// DEFAULT

// Faces that share an axis (opposite faces)
const AXIS = { U: 'UD', D: 'UD', R: 'LR', L: 'LR', F: 'FB', B: 'FB' };

/**
 * Generate a random scramble with no same-face or same-axis-triple sequences
 * @param {number} length - number of moves
 * @returns {string[]} - array of move notations
 */
function generateScramble(length = 20) {
    const result = [];
    while (result.length < length) {
        const m = ALL_MOVES[Math.random() * ALL_MOVES.length | 0];
        const face = m[0];

        if (result.length >= 1) {
            const prev = result[result.length - 1][0];
            // Reject same face: U U', U U2, U U
            if (face === prev) continue;
            // Reject three moves in a row on the same axis: U D U
            if (result.length >= 2 &&
                AXIS[face] === AXIS[prev] &&
                AXIS[result[result.length - 2][0]] === AXIS[face]) continue;
        }

        result.push(m);
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

function showFullscreenMessage(text, callback) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');

        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            zIndex: '999999',
            userSelect: 'none'
        });

        overlay.textContent = text;

        overlay.addEventListener('click', async function onClick() {
            overlay.remove();
            if (typeof callback === 'function') {
                await callback();
            }
            resolve();
        });

        document.body.appendChild(overlay);
    });
}


// CONNECTIONS
async function openSpike(which) {
    let port, writer, reader, abortCtrl;
    try {
        let port = null;
        try {
            port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0694 }] });
        } catch {
            await showFullscreenMessage('CLICK')
            port = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0694 }] });
        }
        await port.open({ baudRate: 115200 });

        reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
        if (port.writable) {
            writer = port.writable.getWriter();
        }

        port.addEventListener('disconnect', () => {
            if (which === "left") {
                leftPort = leftWriter = leftReader = null;
                SpikeState.left = false;
            } else {
                rightPort = rightWriter = rightReader = null;
                SpikeState.right = false;
            }
        })

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
        SerialCmd(which, reader);

        await sendLine(writer, startup);
        if (!silence) {
            await sendLine(writer, connectSound);
        }

        log(`${which} Spike connected`);
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
    }
}


async function spike(cubeed) {
    await openSpike('left')
    await openSpike('right')
}

const sendLineQueues = { left: Promise.resolve(), right: Promise.resolve() };
const WaitQ = {
    left: [],
    right: []
};

let QLock = false;

async function sendLine(writer, text, timeoutMs = 5000) {
    const which = leftWriter === writer ? 'left' : 'right';

    if (LineWaiting[which] != null && QLock) {
        WaitQ[which].push([writer, text, timeoutMs]);
        return 'QUEUED';
    }

    const job = sendLineQueues[which].then(() => new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            LineWaiting[which] = null;
            resolve('TIMEOUT');
        }, timeoutMs);

        LineWaiting[which] = (reply) => {
            clearTimeout(timer);
            LineWaiting[which] = null;
            resolve(reply);
        };

        try {
            _sendLine(writer, text + '\n\nprint("SDOK");\n\n');
        } catch (err) {
            clearTimeout(timer);
            LineWaiting[which] = null;
            reject(err);
        }
    }));

    sendLineQueues[which] = job.catch(() => { });

    try {
        return await job;
    } finally {
        // Drain only this side's queue
        const info = WaitQ[which].shift();

        if (info !== undefined) {
            sendLine(info[0], info[1], info[2]);
        }
    }
}

async function sendLineCatch(which) {
    // Drain only this side's queue
    const info = WaitQ[which].shift();

    if (info !== undefined) {
        sendLine(info[0], info[1], info[2]);
    }
}

async function _sendLine(writer, text) {
    console.debug(`TX: ${text}`);
    if (!writer) return;
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized);
    await writer.write(bytes);
    await writer.write(encoder.encode('\r\n'));
}

const queues = { left: Promise.resolve(), right: Promise.resolve() };

let jobCounter = 0;

// Turns plain motor lines into an async function that runs on the hub.
// Motor calls get `await`, and every line is indented under the function.

function wrapForRunloop(textDirty) {
    const name = `job_${++jobCounter}`;

    const body = textDirty
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .filter(line => line.trim() !== '')
        .map(line => {
            // Add await to motor.run_*() calls unless already awaited
            return line.replace(
                /(?<![\w.])motor\.(run_\w+)\s*\(/g,
                'await motor.$1('
            );
        })
        .map(line => '    ' + line.trim())
        .join('\n');

    const pythonSource =
        'import runloop\n' +
        `async def ${name}():\n` +
        (body || '    pass') + '\n' +
        `runloop.run(${name}())`;

    // Safely encode Python source as a Python string literal
    const encoded = JSON.stringify(pythonSource);

    return `exec(${encoded});\n\n`;
}

async function waitOnVar(source, wantedValue, timeout = 0) {
    const start = Date.now();
    const isGetter = typeof source === 'function';
    const read = isGetter ? source : () => globalThis[source];
    const label = isGetter ? 'value' : `"${source}"`;

    while (read() !== wantedValue) {
        if (timeout && Date.now() - start >= timeout) {
            throw new Error(
                `waitOnVar: timeout waiting for ${label} to become ${String(wantedValue)}`
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
}

async function sendLineWait(which, writer, textDirty, timeoutMs = 5000) {
    QLock = true;
    const text = wrapForRunloop(textDirty);
    if (LineWaiting[which] != null) {
        timeoutMs += 2000;
        await waitOnVar(() => LineWaiting[which], null, 5000);
    }
    const job = queues[which].then(() => new Promise((resolve) => {
        const timer = setTimeout(() => {
            waiting[which] = null;
            resolve('TIMEOUT');
        }, timeoutMs);

        waiting[which] = (reply) => {
            clearTimeout(timer);
            resolve(reply);
        };

        _sendLine(writer, text);
    }));

    // Keep the queue moving even if this job fails.
    queues[which] = job.catch(() => { });
    // prevent lines from being 
    QLock = false;
    sendLineCatch(which)
    return job;
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
    return b.document.getElementById("batteryLevel").value != "- n/a -"
}

function areBothSpikesConnected() {
    return SpikeState.left && SpikeState.right && leftPort && rightPort;
}

// serial command readers
const buffers = { left: '', right: '' };

async function SerialCmd(which, reader) {
    scSecure = true;
    if (!reader) return;
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let combinedvalue = null;
        if (value.indexOf('\n') == -1) {
            // skip iteration and append to the buffer
            buffers[which] += value
            continue
        } else {
            combinedvalue = buffers[which] + value.slice(0, value.lastIndexOf('\n'))
            buffers[which] = value.slice(value.lastIndexOf('\n') + 1, value.length)
        }

        console.log(`${which} RX: ${combinedvalue}`)

        combinedvalue.split('\n').forEach(elementDirty => {
            var element = elementDirty.trim()
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
            } else if (element == 'HELP' || element == 'STOP') {
                const finish = waiting[which];
                waiting[which] = null;
                if (finish) finish(element);
            } else if (element.startsWith('cl')) {
                CubeLoaded = Number(element.replace('cl', '')) > 0 ? true : false
                if (CubeLoaded) {
                    console.info(`Cube in: true`)
                } else {
                    console.warn(`Cube in: false`)
                }
            } else if (element == 'OK') {
                const finish = waiting[which];
                waiting[which] = null;
                if (finish) finish(element);
            } else if (element == 'SDOK') {
                const finish = LineWaiting[which];
                LineWaiting[which] = null;
                if (finish) finish(element);
            } else {
            }
        });
    }
}

let CubeLoaded = false

let lastCubeLoaded = null; // remembers previous state
let watcherDASDA;

function watchCube(gltfAction) {
    clearInterval(watcherDASDA);
    watcherDASDA = setInterval(() => {
        // first run: just remember it, don't fire
        if (lastCubeLoaded === null) {
            lastCubeLoaded = CubeLoaded;
            return;
        }

        // only act when it actually changed
        if (CubeLoaded !== lastCubeLoaded) {
            lastCubeLoaded = CubeLoaded;

            if (CubeLoaded) {
                console.warn('Cube in: true → reverse');
                goToFrame(300)
                gltfAction.timeScale = -1;
                gltfAction.play();
                gltfAction.paused = false;
            } else {
                console.info('Cube in: false → forward');
                gltfAction.reset();
                gltfAction.timeScale = 1;
                gltfAction.play();
            }
        }
    }, 100);
};


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

let d4 = 5


// MOVE STORE
async function runMovement(move, sleep = 220) {
    if (!move || typeof move !== "string") return log(`Invalid move ${move}`);
    if (AbortRun) return 'FAIL';
    regen()
    const cmd = CLP_LEFT[move] || CLP_RIGHT[move];
    const writer = CLP_LEFT[move] ? leftWriter : rightWriter;
    const wait = (move.startsWith("B") || move.startsWith("D") ? sleep + 5 : sleep) * (move.endsWith("2") ? 2 : 1);
    const which = CLP_LEFT[move] ? 'left' : 'right';
    if (!cmd || !writer) return;
    if (SpikeState.left && SpikeState.right && ganCubePresent()) {
        const moveReply = await sendLineWait(which, writer, cmd + "print('OK')");
        if (moveReply !== 'OK') {
            log(`${which} move ${move} failed: ${moveReply}`);
            AbortRun = true;
            await stopAll('move failed')
            return 'FAIL';
        }
        const mov = move.charAt(0);
        const sym = move.charAt(1);
        await sleepT(10)
        await sendLine(leftWriter, `light_matrix.write("${mov}",100);\n\n`);
        await sendLine(rightWriter, `light_matrix.write("${sym}",100);\n\n`);
        let side = cmd.slice(36, 37)
        let alignLines = `
p = motor.absolute_position(port.${side})
c = round(p / 90) * 90
motor.run_to_absolute_position(port.${side}, c, 800, acceleration=10000, deceleration=9000, direction=motor.SHORTEST_PATH)
p = motor.absolute_position(port.${side})
print('STOP' if abs(p - round(p / 90) * 90) > ${d4} else 'OK')
`;
        const alignReply = await sendLineWait(which, writer, alignLines);
        if (alignReply !== 'OK') {
            log(`${which} move ${move} failed: ${alignReply}`);
            await stopAll('align failed');
            return ['FAIL', which, writer, alignLines];
        } else {
            await sleepT(wait);
        }
    } else if (!ganCubePresent()) {
        await sleepT(sleep)
        if (move.endsWith('2')) {
            window.mover(move.replace('2', ''))
            window.mover(move.replace('2', ''))
        } else {
            window.mover(move)
        }
    }
}

async function resetMotors() {
    if (!SpikeState.left && !SpikeState.right) {
        log("No Spike connected");
        return;
    }
    scSecure = true;
    log("Resetting motors to home position...");

    // Reset all motors on the left side
    let bettew = 4000
    if (SpikeState.left) {
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.A, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.C, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.E, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
        await sleepT(bettew)
    }

    // Reset all motors on the right side
    if (SpikeState.right) {
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.D, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.F, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.B, 0, 50, direction=motor.SHORTEST_PATH, stop=motor.BRAKE, acceleration=1000, deceleration=1000000);");
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

// Ports on each hub, same as your wiggle uses
const PORTS = { left: ['A', 'C', 'E'], right: ['B', 'D', 'F'] };

async function wiggle(which) {
    const writer = which === 'left' ? leftWriter : rightWriter;
    const lines = [];

    for (const p of PORTS[which]) {
        lines.push(`motor.run_for_degrees(port.${p}, 3, 500)`);
        lines.push(`motor.run_for_degrees(port.${p}, -3, 500)`);
        lines.push(`a = motor.absolute_position(port.${p}); c = round(a / 90) * 90`);
        lines.push(`motor.run_to_absolute_position(port.${p}, c, 500, direction=motor.SHORTEST_PATH)`);
    }
    lines.push(`print('OK')`);

    return sendLineWait(which, writer, lines.join('\n'), 8000);
}


// Stops every motor on both hubs and cancels any move that is waiting.
async function stopAll(reason = 'manual') {
    AbortRun = true;

    for (const which of ['left', 'right']) {
        const writer = which === 'left' ? leftWriter : rightWriter;
        if (!writer) continue;

        // Ctrl-C interrupts the program running on the hub (same byte openSpike sends)
        await writer.write(new Uint8Array([3]));

        // Brake every port on this hub
        const stopLine = PORTS[which]
            .map(p => `motor.stop(port.${p}, stop=motor.BRAKE)`)
            .join('; ');
        await sendLine(writer, stopLine);

        // Finish any move that is waiting for a reply, so it returns 'STOP' now
        const pending = waiting[which];
        waiting[which] = null;
        if (pending) pending('STOP');
    }

    log(`All motors stopped: ${reason}`);
}

setInterval(() => {
    if (!scSecure && SpikeState.left && SpikeState.right) {
        sendLine(leftWriter, "import color_sensor;import color; print('cl' + str(color_sensor.color(port.B)));\n\n")
    }
}, 2000)

async function spikeCube(moves, sleeped) {
    AbortRun = false
    regen()
    moves = simplifyMoves(moves);
    console.info(moves)
    if (scSecure) return console.warn("NO SPAM !!!");
    scSecure = true;
    const sleep = sleeped || window.sleeped;
    console.log(sleep)

    await Promise.all([wiggle('left'), wiggle('right')]);

    await sleepT(2000)

    const lenStr = String(moves.length).padStart(2, "0");
    await Promise.all([
        sendLine(leftWriter, `light_matrix.write("${lenStr[0]}",100)`),
        sendLine(rightWriter, `light_matrix.write("${lenStr[1]}",100)`)
    ]);

    await sleepT(2000)
    const start = new Date();
    startTimer(start);

    async function rnMovementWrapper(move, sleep) {
        let r = await runMovement(move, sleep);
        let g = Array.isArray(r) ? r[1] : r
        if (g == 'FAIL') {
            await Promise.all([wiggle('left'), wiggle('right')]);
            // if g is a array then run the cmd to realign
            let cont = Array.isArray(r) ? await sendLineWait(r[2], r[3], r[4]) : null;
            if (cont !== 'OK') {
                AbortRun = true
            } else {
                await sleepT(10)
            }
        }
    }

    for (let i = 0; i < moves.length; i++) {
        const m = moves[i], n = moves[i + 1];
        if (AbortRun) {
            break
        }
        if (isOpposite(m, n)) {
            await Promise.all([
                rnMovementWrapper(m, sleep),
                rnMovementWrapper(n, sleep)
            ]);
            i++;
        } else await rnMovementWrapper(m, sleep);
    }
    stopTimer(start);

    await sleepT(200)

    await Promise.all([wiggle('left'), wiggle('right')]);

    await sleepT(2000)
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
        if (elapsed >= 20) {
            stopTimer(startTime, false)
            scSecure = false; // spam fix
        }
    }, 1);
}

function stopTimer(startTime, post = true) {
    if (timerInterval) {
        try {
            let elapsed = ((new Date() - startTime) / 1000).toFixed(3);
            if (post) {
                bc.postMessage(Number(elapsed));
            }
        } catch { }
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// SIMPLIFY MOVES

const oppositeFace = { U: "D", D: "U", F: "B", B: "F", L: "R", R: "L" };
const normalize = (m) => m?.replace(/2|'/g, "");
const isOpposite = (a, b) => normalize(a) && normalize(b) && oppositeFace[normalize(a)] === normalize(b);

function simplifyMoves(moves) {
    const SUFFIX = { 1: "", 2: "2", 3: "'" };
    const qt = m => (m.endsWith("2") ? 2 : m.endsWith("'") ? 3 : 1);
    const out = [];
    for (const m of moves) {
        const face = m[0];
        const last = out[out.length - 1];
        if (last && last[0] === face) {
            out.pop();
            const total = (qt(last) + qt(m)) % 4;
            if (total) out.push(face + SUFFIX[total]);
        } else {
            out.push(m);
        }
    }
    return out;
}

function rvsMove(move) {
    if (!move) return;
    const lastChar = move[move.length - 1];
    const face = move[0];
    if (lastChar === "'") {
        return face; // R' → R
    } else if (lastChar === "2") {
        return move; // R2 → R2
    } else {
        return face + "'"; // R → R'
    }
}

// NAVBAR

async function fullConnect() {
    scSecure = false
    if (!ganCubePresent()) {
        await spike(true)
        await showFullscreenMessage('click')
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
        await spikeCube(moves, intScramble)
        console.info("End Scramble")
    }
}

async function startCube() {
    console.info("Start Cube")
    await spikeCube(['U2', "U2"], window.sleeped)
}

async function idiot() {
    if (window.sleeped != intSolveFast) {
        window.sleeped = intSolveFast
        document.body.classList.add('fast')
    } else {
        window.sleeped = intSolve
        document.body.classList.remove('fast')
    }
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

let LOPSX = false

async function ToogleLN() {
    if (LOPSX) {
        LOPSX = false;
        document.getElementById('stB').classList.add('da')
        document.getElementById('stB').classList.remove('ds')
    } else {
        LOPSX = true;
        document.getElementById('stB').classList.remove('da')
        document.getElementById('stB').classList.add('ds')
        ln()
    }
}

async function ln() {
    while (LOPSX) {
        await spikeCube(sexyMove1, 200)
    }
}

async function stopLN() {
    LOPSX = false;
    document.getElementById('stB').classList.add('da')
    document.getElementById('stB').classList.remove('ds')
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

async function cubecubes() {
    console.log("Start CUBECUBE")
    await spikeCube(cubecube, 200)
    console.log("End CUBECUBE")
}

let still = [];
async function solve2ndCube(mvs) {
    if (!bc) return console.warn("No bc connection found");
    if (!mvs || mvs.length === 0) return console.warn("No moves for 2nd cube");
    window.dontMove = true;
    nxt.classList.add("active")
    console.info("Starting 2nd cube solve");
    console.info("Moves: " + mvs.join(","));
    still = [...mvs];
    nxt.innerHTML = still[0];
    await new Promise((resolve) => {
        const onMove = (e) => {
            const data = e.data;
            if (typeof data !== "string" || !data.startsWith("Move: ")) return;

            const move = data.replace("Move: ", "").trim();
            const expected = still[0];
            const next = still[1];

            if (move === expected) {
                still.shift();
                if (still.length !== 0) {
                    console.info(`Next: ${next}`);
                    nxt.innerHTML = next;
                    if (wrong) {
                        nxt.classList.remove("wrong");
                        wrong = false;
                    }
                }
            } else {
                const rvs = rvsMove(move);
                console.warn(`No: ${move}, do: ${rvs}, expected: ${expected}`);
                still.push(rvs);
                nxt.innerHTML = rvs;
                nxt.classList.add("wrong");
                wrong = true;
            }

            if (still.length === 0) {
                bc.removeEventListener("message", onMove); // detach when done
                resolve();
            }
        };

        bc.addEventListener("message", onMove);
    });

    window.dontMove = false;
    nxt.classList.remove("active")
    console.info("2nd cube solved");
}

// KEYBOARD MAPPIMG
nxt = document.getElementById("nxt");

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
        "r": reset, // defined in a other file
        "enter": solve,
        "w": startCube,
        "s": spin,
        "f": fullscreen,
        "x": () => { Promise.all([wiggle('left'), wiggle('right')]) },
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
            console.log(`%cS    ec:  ${move}`, 'color:#eb34d8;');
            playMove(move);
        }
        else {
            console.debug("Unknown message from Slide tab: ", data)
        }
    }
});

// BROADCAST

const bc = new BroadcastChannel(localStorage.bc);