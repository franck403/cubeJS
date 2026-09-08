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

let deg = 95;  // Moves x 1
let deg1 = 90; // Same face, same direction, seen again later in the sequence
let dog = 180; // Moves x 2

let lb = localStorage.lb || 0;
let ld = localStorage.ld || 0;

var silence = true;

let timerInterval = null;

window.sleeped = 160;

let nxt;
let wrong;

let leftFaces = ['U', 'L', 'F'];
let leftPorts = ['A', 'C', 'E'];
let rightFaces = ['R', 'B', 'D'];
let rightPorts = ['D', 'F', 'B'];
let largeFaces = ['D', 'B'];

let cor = 5;
let acc = 100000000;
let dec = 1000;

// MOTION CONFIRMATION TUNING
// Instead of trusting a fixed sleep, we now ask the hub for the real
// motor position after every move and wait until it actually matches
// the target (within a tolerance) before sending the next command.
// This is what fixes drift (positions never landing at the same spot)
// and truncated moves (a "90 deg" turn that lands at 45 deg because the
// next command interrupted it).
//
// SPEED PROFILES
// "normal" = safe/reliable tuning (what we validated the confirm-loop with).
// "fast"   = tight tolerance/timeout + higher velocity/accel, tuned to fit
//            a 22-move sequence under ~6s. Toggle with toggleSpeed() or the
//            "v" key. Fast trades a little settle precision for speed, so
//            if you start seeing skipped/half-turned moves again, that's
//            the first thing to back off (see tuning notes below).
const SPEED_PROFILES = {
    normal: {
        posToleranceDeg: 3,     // settle tolerance
        posPollIntervalMs: 25,  // how often we ask the hub for position
        posTimeoutMs: 1500,     // give up waiting after this long
        moveVelocity: 720,      // deg/s target speed
        moveAccel: 3000,        // ramp up
        moveDecel: 2500,        // ramp down
        pacingFloorMs: 120,     // min visual/audible pacing after confirm
    },
    fast: {
        posToleranceDeg: 6,     // looser: confirm sooner, still catches real stalls
        posPollIntervalMs: 12,  // poll more often so we notice "arrived" faster
        posTimeoutMs: 500,      // don't let one stuck move eat the whole budget
        moveVelocity: 1400,     // near max useful speed for these small turns
        moveAccel: 9000,        // snappier ramp - short moves barely reach cruise speed anyway
        moveDecel: 7000,        // stop harder; higher tolerance absorbs the extra overshoot
        pacingFloorMs: 20,      // basically no artificial floor, confirm loop paces it
    },
};

let currentSpeedMode = 'normal';

function getSpeedProfile() {
    return SPEED_PROFILES[currentSpeedMode];
}

/**
 * Switches between "normal" (reliable) and "fast" (tight timing, tuned for
 * ~22 moves under 6s) speed profiles. Call with no args to flip, or pass
 * 'normal'/'fast' to set explicitly. Safe to call mid-idle; don't call
 * while a sequence is running (scSecure guards against that anyway - the
 * new profile takes effect on the NEXT spikeCube()/spikeMove() call).
 */
function toggleSpeed(mode) {
    if (mode === 'normal' || mode === 'fast') {
        currentSpeedMode = mode;
    } else {
        currentSpeedMode = currentSpeedMode === 'normal' ? 'fast' : 'normal';
    }
    log(`Speed mode: ${currentSpeedMode}`);
    const badge = document.getElementById('speedMode');
    if (badge) badge.textContent = currentSpeedMode.toUpperCase();
    return currentSpeedMode;
}

// KILL SWITCH

let killed = false;

const sexyMove1 = ["R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'"];
const sexyMove2 = ["L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2"];
const sexyMove3 = ["R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2"];
const cubecube = ["F", "L", "F", "U'", "R", "U", "F2", "L2,", "U'", "L'", "B", "D'", "B'" ,"L2","U"]

const startup = "import motor\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear();\nmotor.motor_set_high_resolution_mode(port.A, True);\nmotor.motor_set_high_resolution_mode(port.B, True);\nmotor.motor_set_high_resolution_mode(port.C, True);\nmotor.motor_set_high_resolution_mode(port.D, True);\nmotor.motor_set_high_resolution_mode(port.E, True);\nmotor.motor_set_high_resolution_mode(port.F, True)\n\ncor=1.5";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const scrambleSound = "sound.beep(784,100);time.sleep_ms(100);sound.beep(659,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(494,150);time.sleep_ms(150);sound.beep(392,200)";
const solveSound = "sound.beep(392,100);time.sleep_ms(100);sound.beep(494,100);time.sleep_ms(100);sound.beep(587,100);time.sleep_ms(100);sound.beep(659,150);time.sleep_ms(150);sound.beep(784,200);time.sleep_ms(200);sound.beep(988,300)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 950) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
const getBattery = `import hub\n\nprint("Ba" + str(hub.battery_voltage()))`
const clearDisplay = `light_matrix.clear();\n`

// =========================================================================================================

// COMMANDS

async function sleepT(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DEFAULT

// All 18 standard quarter/half turns, one entry per face+modifier.
const ALL_MOVES = ['U', "U'", 'U2', 'D', "D'", 'D2', 'L', "L'", 'L2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'B', "B'", 'B2'];

/**
 * Generate a random scramble table
 * @param {number} length - number of moves
 * @returns {string[]} - array of move notations
 */
function generateScramble(length = 20) {
    const result = [];
    let lastFace = null;
    for (let i = 0; i < length; i++) {
        let m;
        do m = ALL_MOVES[Math.random() * ALL_MOVES.length | 0];
        while (m.charAt(0) === lastFace);
        result.push(m);
        lastFace = m.charAt(0);
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

        log(`${which} Spike port opened`);

        // Everything below (startup script, RX listener, connect sound) is
        // setup work that does NOT need to block the caller. The caller's
        // only job here is to get requestPort() shown and the port opened,
        // so the SECOND popup (for the other hub) can show up right away
        // instead of waiting on startup/sendLine round-trips. This is what
        // was causing the second popup to appear inconsistently/late.
        (async () => {
            try {
                await sendLine(writer, startup);

                // start listening for RX
                batteryRead(which, reader);

                if (!silence) {
                    await sendLine(writer, connectSound);
                }

                log(`${which} Spike connected`);
            } catch (err) {
                log(`Error setting up ${which} Spike:`, err?.message || err);
            }
        })();
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
    }
}

/**
 * Reconnects to all previously authorized Spike ports. No identity check —
 * ports are assigned left/right in whatever order navigator.serial.getPorts()
 * returns them (i.e. plug order / grant order).
 */
async function reconnectSpike(side) {
    const ports = await navigator.serial.getPorts();
    const candidates = ports.filter(p => p !== leftPort && p !== rightPort);

    for (const p of candidates) {
        const openSide = !SpikeState.left ? 'left' : (!SpikeState.right ? 'right' : null);
        if (!openSide) break;

        try {
            await p.open({ baudRate: 115200 });

            const decoderStream = new TextDecoderStream();
            p.readable.pipeTo(decoderStream.writable);
            const reader = decoderStream.readable.getReader();

            const encoderStream = new TextEncoderStream();
            encoderStream.readable.pipeTo(p.writable);
            const writer = encoderStream.writable.getWriter();

            await writer.write(new Uint8Array([3]));
            await sleepT(100);

            await assignSpikeSide(openSide, p, writer, reader);
            log(`${openSide} reconnected`);
        } catch {
            try { await p.close(); } catch { }
        }
    }

    if (!SpikeState.left || !SpikeState.right) {
        const missing = !SpikeState.left && !SpikeState.right ? 'left/right' : (!SpikeState.left ? 'left' : 'right');
        log(`No ${missing} port found, retrying in 5s`);
        setTimeout(() => reconnectSpike(side), 5000);
    }
}

// FIX: this used to only wire up state + call the undefined `autoReconnectLoop`,
// which threw immediately and skipped sending `startup` and starting the RX
// reader (batteryRead). That's why reconnect gave you: no motor movement
// (no `motor` import / high-res mode on the hub), no RX/TX log (batteryRead,
// which contains the RX error logging, was never started), and no sound.
async function assignSpikeSide(side, port, writer, reader) {
    if (side === 'left') {
        leftPort = port;
        leftWriter = writer;
        leftReader = reader;
        SpikeState.left = true;
    } else {
        rightPort = port;
        rightWriter = writer;
        rightReader = reader;
        SpikeState.right = true;
    }

    // Run the same setup openSpike() does, so reconnect behaves identically
    // to a fresh connect.
    await sendLine(writer, startup);

    // Start listening for RX on this port (battery reports, etc.)
    batteryRead(side, reader);

    if (!silence) {
        await sendLine(writer, connectSound);
    }
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

// Per-side buffer of raw text lines coming off the hub UART, and a map of
// pending "waiting for a position reading" promises keyed by port letter.
// batteryRead() used to be the only RX consumer; now it also demuxes
// position replies (prefixed "Po") so waitForPosition() can resolve them.
const pendingPositionResolvers = { left: {}, right: {} };
let rxLineBuffer = { left: '', right: '' };

async function batteryRead(which, reader) {
    if (!reader) return;
    (async () => {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    log(`RX [${which}]:`, value);
                    rxLineBuffer[which] += value;
                    let lines = rxLineBuffer[which].split('\n');
                    rxLineBuffer[which] = lines.pop(); // keep last partial line in buffer

                    lines.forEach(element => {
                        element = element.trim();
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
                        } else if (element.startsWith('Po')) {
                            // Format expected from the hub: "Po<port><value>" e.g. "PoA1234"
                            const port = element.charAt(2);
                            const posValue = parseInt(element.slice(3), 10);
                            if (!Number.isNaN(posValue)) {
                                const resolver = pendingPositionResolvers[which][port];
                                if (resolver) resolver(posValue);
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

// Tracks, per face (U/D/L/R/F/B), the last non-double direction we ran and
// whether we've already used the "first" (deg) angle for that direction.
// Reset at the start of every spikeCube() run.
let faceMoveHistory = {};

function resetFaceMoveHistory() {
    faceMoveHistory = {};
}

/**
 * Picks the rotation angle (in degrees, unsigned) for a quarter turn (no '2')
 * of the given face+direction. First time this face is turned in this
 * direction during the current sequence: deg (95). If that same face is
 * turned again later in the SAME direction (separated by other moves):
 * deg1 (90). If it comes back in the OTHER direction, it resets and counts
 * as a fresh "first time" (95) for that new direction.
 */
function pickQuarterTurnDeg(face, dirKey) {
    const prev = faceMoveHistory[face];
    let angle;
    if (prev && prev.dir === dirKey) {
        angle = deg1;
    } else {
        angle = deg;
    }
    faceMoveHistory[face] = { dir: dirKey };
    return angle;
}

/**
 * Waits until the hub reports the given port's absolute position is within
 * POS_TOLERANCE_DEG of targetPos, or POS_TIMEOUT_MS elapses.
 *
 * This is THE fix for the drift/45-instead-of-90 problem: previously we
 * just slept a fixed amount of JS time and assumed the move had finished.
 * If the hub was still moving (or had stalled) when the next command was
 * sent, the in-flight run_to_absolute_position() gets superseded/aborted
 * partway through — that's why you'd see a move stop at 45deg instead of
 * 90deg, and why error accumulates over a sequence (never "resets").
 *
 * Requires the hub to actually send back its position. We ask for it with
 * a "Po<port><value>" print after every move (see buildMoveCommand below).
 */
function waitForPosition(which, port, targetPos, timeoutMs = POS_TIMEOUT_MS) {
    return new Promise((resolve) => {
        let settled = false;
        const cleanup = () => {
            delete pendingPositionResolvers[which][port];
            clearInterval(pollTimer);
            clearTimeout(timeoutTimer);
        };

        const onReading = (actualPos) => {
            if (settled) return;
            if (Math.abs(actualPos - targetPos) <= POS_TOLERANCE_DEG) {
                settled = true;
                cleanup();
                resolve({ ok: true, actualPos });
            }
            // else: keep waiting, the next reading (triggered by pollTimer)
            // may be closer once the motor finishes settling.
        };

        pendingPositionResolvers[which][port] = onReading;

        const writer = which === 'left' ? leftWriter : rightWriter;
        const pollTimer = setInterval(() => {
            sendLine(writer, `print("Po${port}" + str(motor.absolute_position(port.${port})))`);
        }, POS_POLL_INTERVAL_MS);

        const timeoutTimer = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve({ ok: false, actualPos: null });
        }, timeoutMs);

        // fire the first poll immediately instead of waiting one interval
        sendLine(writer, `print("Po${port}" + str(motor.absolute_position(port.${port})))`);
    });
}

async function runMovement(move, sleep = 220, noCube = false) {
    if (!move || typeof move !== 'string') return console.log(`Invalid move ${move}`);

    const face = move.charAt(0);
    const sym = move.charAt(1) || '';

    const left = leftFaces.includes(face);
    const idx = left ? leftFaces.indexOf(face) : rightFaces.indexOf(face);

    const port = left ? leftPorts[idx] : rightPorts[idx];

    const c = largeFaces.includes(face) ? cor : 0;

    let deg0;
    if (sym === '2') {
        deg0 = dog + c;
    } else {
        // dirKey distinguishes clockwise ("") from counter-clockwise ("'")
        const dirKey = sym === "'" ? "'" : "";
        const quarterDeg = pickQuarterTurnDeg(face, dirKey);
        deg0 = (sym === "'" ? -quarterDeg : quarterDeg) + c;
    }

    const wait =
        (largeFaces.includes(face) ? sleep + 40 : sleep) *
        (move.endsWith('2') ? 2 : 1);

    const which = left ? 'left' : 'right';
    const writer = left ? leftWriter : rightWriter;

    if (noCube) return console.warn('Cube Not Connected');

    // We need to know the target absolute position (not just the relative
    // delta) so we can confirm the hub actually reached it. We ask the hub
    // for its CURRENT position first, compute the target in JS, send the
    // move, then poll until it's confirmed. This replaces the old
    // "compute delta inline in the Python string + hope" approach.
    const currentPos = await readPositionOnce(which, port);
    const targetPos = (currentPos ?? 0) - deg0;

    const cmd =
        `motor.run_to_absolute_position(port.${port}, ${targetPos}, ${MOVE_VELOCITY}, acceleration=${MOVE_ACCEL}, deceleration=${MOVE_DECEL});\n`;

    await sendLine(writer, cmd);
    await sendLine(leftWriter, `light_matrix.write("${face}",100)`);
    await sendLine(rightWriter, `light_matrix.write("${sym}",100)`);

    // Confirm the motor actually landed on target before returning. This
    // is the core fix: no more fixed-sleep guessing, no more silently
    // truncated turns, no more compounding drift across a sequence.
    const result = await waitForPosition(which, port, targetPos);
    if (!result.ok) {
        log(`WARN: ${move} on port ${port} (${which}) did not confirm position within ${POS_TIMEOUT_MS}ms - possible stall/skip`);
        // Best-effort nudge: re-issue the same target once. If it still
        // fails we move on rather than hang the whole sequence forever.
        await sendLine(writer, cmd);
        await waitForPosition(which, port, targetPos, 800);
    }

    // Still respect a minimum visual/audible pacing between moves so the
    // light matrix + sound don't overlap awkwardly, but this is now a
    // floor, not the thing we rely on for correctness.
    await sleepT(Math.min(wait, 120));
}

/**
 * Single-shot read of a port's current absolute position, bypassing the
 * polling loop in waitForPosition. Used to compute the target position
 * for the NEXT move from ground truth instead of trusting a value we
 * calculated in JS and never verified.
 */
function readPositionOnce(which, port, timeoutMs = 500) {
    return new Promise((resolve) => {
        let settled = false;
        pendingPositionResolvers[which][port] = (actualPos) => {
            if (settled) return;
            settled = true;
            delete pendingPositionResolvers[which][port];
            resolve(actualPos);
        };
        const writer = which === 'left' ? leftWriter : rightWriter;
        sendLine(writer, `print("Po${port}" + str(motor.absolute_position(port.${port})))`);
        setTimeout(() => {
            if (settled) return;
            settled = true;
            delete pendingPositionResolvers[which][port];
            resolve(null);
        }, timeoutMs);
    });
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
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.A, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.C, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(leftWriter, "motor.run_to_absolute_position(port.E, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
    }

    // Reset all motors on the right side
    if (SpikeState.right) {
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.D, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.F, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
        await sleepT(bettew)
        await sendLine(rightWriter, "motor.run_to_absolute_position(port.B, 0, 50, direction=motor.SHORTEST_PATH, acceleration=1000, deceleration=1000);");
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

async function spikeCube(moves, sleeped = 150) {

    moves = simplifyMoves(moves);
    console.info(moves)
    if (scSecure) return console.warn("NO SPAM !!!");
    scSecure = true;
    resetFaceMoveHistory();
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
    console.log(window.moves)
    // NOTE: moves are now always run sequentially (no more Promise.all
    // pairing for opposite-face moves). Running two run_to_absolute_position
    // confirmations concurrently on left+right is still fine (different
    // hubs, independent UART), so isOpposite() moves on different sides
    // still effectively overlap because runMovement's own awaits only
    // block on THAT port's confirmation. What we removed is starting a
    // move before the previous one on the SAME side was confirmed done,
    // which was the main source of truncated/drifted turns.
    for (let i = 0; i < moves.length; i++) {
        if (killed) break;
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

// KILL SWITCH

async function kill() {
    killed = true;
    scSecure = true;   // block runMovement/spikeMove/spikeCube from sending anything new
    solveSecure = true;
    store.length = 0;  // wipe any queued keyboard moves

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const stopCmd = (p) => `motor.stop(port.${p});`;
    const allPorts = ['A', 'B', 'C', 'D', 'E', 'F'];

    await Promise.all([
        ...(leftWriter ? allPorts.map(p => sendLine(leftWriter, stopCmd(p))) : []),
        ...(rightWriter ? allPorts.map(p => sendLine(rightWriter, stopCmd(p))) : [])
    ]);

    await Promise.all([
        sendLine(leftWriter, `light_matrix.write("O",100)`),
        sendLine(rightWriter, `light_matrix.write("K",100)`)
    ]);

    log("KILLED - all motors stopped");

    // release the lock shortly after, so the app isn't stuck dead forever
    setTimeout(() => {
        killed = false;
        scSecure = false;
        solveSecure = false;
    }, 1000);
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
        await spikeCube(moves, 200)
        console.info("End Scramble")
    }
}

async function startCube() {
    console.info("Start Cube")
    await spikeCube(['U', "U'"], 290)
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
    await spikeCube(sexyMove1, 190)
    console.log("End Sexy Move 1")
}

async function sexyMoves2() {
    console.log("Start Sexy Move 2")
    await spikeCube(sexyMove2, 190)
    console.log("End Sexy Move 2")
}

async function sexyMoves3() {
    console.log("Start Sexy Move 3")
    await spikeCube(sexyMove3, 190)
    console.log("End Sexy Move 3")
}


async function cubecubes() {
    console.log("Start cubecube Move 3")
    await spikeCube(cubecube, 190)
    console.log("End cubecube Move 3")
}
// KEYBOARD MAPPIMG

document.addEventListener('DOMContentLoaded', () => {
    nxt = document.getElementById("nxt");
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
        "backspace": scramble,
        "delete": kill
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
        console.log(data)
        if (data == true) {
            document.getElementById('timerBlock').style.display = 'none'
            bcState = true;
        } else if (data == false) {
            document.getElementById('timerBlock').style.display = 'block'
        } else if (data.startsWith("Move: ") && !window.dontMove) {
            let move = data.replace("Move: ", "");
            console.log(`%cSec:  ${move}`, 'color:#eb34d8;');
            playMove(move);
        } else if (typeof data !== "string" || data.startsWith("Watch: ")) {
            command = data.replace('Watch: ','')
            console.log(command)
            switch (command) {
                case "solve":
                  console.log("Solving");
                  solve();
                  break;
                case "scramble":
                  console.log("Scrambling");
                  scramble();
                  break;
                case "move1":
                  console.log("Move 1");
                  sexyMoves1();
                  break;
                case "move2":
                  console.log("Move 2");
                  sexyMoves2();
                  break;
                case "move3":
                  console.log("Move 3");
                  sexyMoves3();
                  break;
                case "kill":
                  console.log("Kill");
                  kill();
                  break;
                default:
                    try {
                        globalThis[command]();
                    } catch {
                        console.log("Invalid move");
                    }
              }
        } else {
            console.debug("Unknown message from Slide tab: ", data)
        }
    }
});

// BROADCAST
localStorage.bc = 'app_channel'
const bc = new BroadcastChannel(localStorage.bc);