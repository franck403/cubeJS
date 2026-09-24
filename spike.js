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
let dog = 180; // Moves x 2

let intSolve = 500;
let intScramble = 500;

let intSolveFast = 170;

let u = 5, f = 5, l = 5, r = 5, b = 5, d = 8;
let u1 = 5, f1 = 5, l1 = 5, r1 = 5, b1 = 6, d1 = 11;
let u2 = 0, f2 = 0, l2 = 0, r2 = 0, b2 = 10, d2 = 8;

let cb = 3; // back deg corr
let cd = 3; // down deg corr

let lb = localStorage.lb || 0;
let ld = localStorage.ld || 0;

var silence = true;

let timerInterval = null;

window.sleeped = 300;

let nxt;
let wrong;

const sexyMove1 = ["R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'", "R", "U", "R'", "U'"];
const sexyMove2 = ["L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2", "L", "F", "U", "F", "R", "F2"];
const sexyMove3 = ["R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2", "R2", "L2", "U2"];
const cubecube = ["F", "L", "F", "U'", "R", "U", "F2", "L2", "U'", "L'", "B", "D'", "B'", "L2", "U"]

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

let acel = 5000
let decel = acel/2

//p = port.A\\n await motor.run_to_relative_position(p, round(motor.relative_position(p) / 90) * 90, 500)
// round((round(motor.absolute_position(port.A)) / 90) * 90)
// motor.absolute_position(port.A)
function regen() {
    CLP_LEFT = {
        // Face U
        "U": `motor.run_to_absolute_position(port.A,  round((round(motor.absolute_position(port.A)) / 90) * 90) - ${deg + u}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "U'": `motor.run_to_absolute_position(port.A, round((round(motor.absolute_position(port.A)) / 90) * 90) + ${deg + u1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "U2": `motor.run_to_absolute_position(port.A, round((round(motor.absolute_position(port.A)) / 90) * 90) + ${dog + u2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,

        // Face L
        "L": `motor.run_to_absolute_position(port.C,  round((round(motor.absolute_position(port.C)) / 90) * 90) - ${deg + l}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "L'": `motor.run_to_absolute_position(port.C, round((round(motor.absolute_position(port.C)) / 90) * 90) + ${deg + l1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "L2": `motor.run_to_absolute_position(port.C, round((round(motor.absolute_position(port.C)) / 90) * 90) + ${dog + l2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,

        // Face F
        "F": `motor.run_to_absolute_position(port.E,  round((round(motor.absolute_position(port.E)) / 90) * 90) - ${deg + f}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "F'": `motor.run_to_absolute_position(port.E, round((round(motor.absolute_position(port.E)) / 90) * 90) + ${deg + f1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "F2": `motor.run_to_absolute_position(port.E, round((round(motor.absolute_position(port.E)) / 90) * 90) + ${dog + f2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
    };

    CLP_RIGHT = {
        // Face R
        "R": `motor.run_to_absolute_position(port.B,  round((round(motor.absolute_position(port.B)) / 90) * 90) - ${deg + r}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "R'": `motor.run_to_absolute_position(port.B, round((round(motor.absolute_position(port.B)) / 90) * 90) + ${deg + r1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "R2": `motor.run_to_absolute_position(port.B, round((round(motor.absolute_position(port.B)) / 90) * 90) + ${dog + r2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,

        // Face B
        "B": `motor.run_to_absolute_position(port.F,  round((round(motor.absolute_position(port.F)) / 90) * 90) - ${deg + b}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "B'": `motor.run_to_absolute_position(port.F, round((round(motor.absolute_position(port.F)) / 90) * 90) + ${deg + b1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "B2": `motor.run_to_absolute_position(port.F, round((round(motor.absolute_position(port.F)) / 90) * 90) + ${dog + b2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,

        // Face D
        "D": `motor.run_to_absolute_position(port.D,  round((round(motor.absolute_position(port.D)) / 90) * 90) - ${deg + d}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "D'": `motor.run_to_absolute_position(port.D, round((round(motor.absolute_position(port.D)) / 90) * 90) + ${deg + d1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
        "D2": `motor.run_to_absolute_position(port.D, round((round(motor.absolute_position(port.D)) / 90) * 90) + ${dog + d2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel});\n`,
    };
}

/*
function regen() {
    CLP_LEFT = {
        "U": `async def move_u():\n    await motor.run_for_degrees(port.A, -(${deg + u}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.A, round(motor.relative_position(port.A) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "U'": `async def move_u_prime():\n    await motor.run_for_degrees(port.A, ${deg + u1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.A, round(motor.relative_position(port.A) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "U2": `async def move_u2():\n    await motor.run_for_degrees(port.A, ${dog + u2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.A, round(motor.relative_position(port.A) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,

        "L": `async def move_l():\n    await motor.run_for_degrees(port.C, -(${deg + l}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.C, round(motor.relative_position(port.C) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "L'": `async def move_l_prime():\n    await motor.run_for_degrees(port.C, ${deg + l1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.C, round(motor.relative_position(port.C) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "L2": `async def move_l2():\n    await motor.run_for_degrees(port.C, ${dog + l2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.C, round(motor.relative_position(port.C) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,

        "F": `async def move_f():\n    await motor.run_for_degrees(port.E, -(${deg + f}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.E, round(motor.relative_position(port.E) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "F'": `async def move_f_prime():\n    await motor.run_for_degrees(port.E, ${deg + f1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.E, round(motor.relative_position(port.E) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "F2": `async def move_f2():\n    await motor.run_for_degrees(port.E, ${dog + f2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.E, round(motor.relative_position(port.E) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
    };

    CLP_RIGHT = {
        "R": `async def move_r():\n    await motor.run_for_degrees(port.B, -(${deg + r}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.B, round(motor.relative_position(port.B) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "R'": `async def move_r_prime():\n    await motor.run_for_degrees(port.B, ${deg + r1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.B, round(motor.relative_position(port.B) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "R2": `async def move_r2():\n    await motor.run_for_degrees(port.B, ${dog + r2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.B, round(motor.relative_position(port.B) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,

        "B": `async def move_b():\n    await motor.run_for_degrees(port.F, -(${deg + b}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.F, round(motor.relative_position(port.F) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "B'": `async def move_b_prime():\n    await motor.run_for_degrees(port.F, ${deg + b1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.F, round(motor.relative_position(port.F) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "B2": `async def move_b2():\n    await motor.run_for_degrees(port.F, ${dog + b2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.F, round(motor.relative_position(port.F) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,

        "D": `async def move_d():\n    await motor.run_for_degrees(port.D, -(${deg + d}), 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.D, round(motor.relative_position(port.D) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "D'": `async def move_d_prime():\n    await motor.run_for_degrees(port.D, ${deg + d1}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.D, round(motor.relative_position(port.D) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
        "D2": `async def move_d2():\n    await motor.run_for_degrees(port.D, ${dog + d2}, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n    await motor.run_to_relative_position(port.D, round(motor.relative_position(port.D) / 90) * 90, 1000, stop=motor.SMART_BRAKE, acceleration=${acel}, deceleration=${decel})\n`,
    };
}*/

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
        await port.open({ baudRate: 115200});

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

async function SerialL(readable) {
    while (true) {
        const { value, done } = await reader.read();
        console.log(value);
    }
}

async function spike(cubeed) {
    await openSpike('left')
    await openSpike('right')
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
                } else {
                    console.log(value)
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
// MOVE STORE
let lastMove = {
    u : '', 
    l : '', 
    f : '', 
    r : '', 
    b : '',
    d : '',
}

function sameSideFixer(move) {
    lm = lastMove[move.slice(0,1)]
    lastMove[move.slice(0,1)] = move
    if (lm == move) {
        return 90
    } else {
        return 95
    }
    return deg
}

async function runMovement(move, sleep = 220, noCube = false) {
    if (!move || typeof move !== "string") return log(`Invalid move ${move}`);
    deg = sameSideFixer(move)
    degCorrection(move);
    const cmd = CLP_LEFT[move] || CLP_RIGHT[move];
    const writer = CLP_LEFT[move] ? leftWriter : rightWriter;
    const wait = (move.startsWith("B") || move.startsWith("D") ? sleep + 5 : sleep) * (move.endsWith("2") ? 2 : 1);
    if (!cmd || !writer) await sleepT(1);
    if (noCube) return console.warn("Cube Not Connected");
    await sendLine(writer, cmd);
    sleepT(180)
    /*motor.run_to_absolute_position(port.A*/
    let side = cmd.slice(36,37)
    await sendLine(writer, `motor.run_to_absolute_position(port.${side},  round((round(motor.absolute_position(port.A)) / 90) * 90), 1000, stop=motor.SMART_BRAKE, acceleration=10000, deceleration=9000);\n`)
    const mov = move.charAt(0);
    const sym = move.charAt(1);
    await sendLine(leftWriter, `light_matrix.write("${mov}",100);\n`);
    await sendLine(rightWriter, `light_matrix.write("${sym}",100);\n`);
    await sleepT(wait - 180);
    deg = 95
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

async function wiggle() {
    const cmd = `exec("import runloop\\nasync def _w():\\n    for p in [port.A, port.B, port.C, port.D, port.E, port.F]:\\n        try:\\n            await motor.run_for_degrees(p, 3, 500)\\n            await motor.run_for_degrees(p, -3, 500)\\n            pos = motor.relative_position(p)\\n            target = round(pos / 90) * 90\\n            await motor.run_to_relative_position(p, target, 500)\\n        except Exception as e:\\n            print(p, e)\\nrunloop.run(_w())")`;
    await Promise.all([sendLine(leftWriter, cmd), sendLine(rightWriter, cmd)]);
}


async function spikeCube(moves, sleeped) {
    regen()
    moves = simplifyMoves(moves);
    console.info(moves)
    if (scSecure) return console.warn("NO SPAM !!!");
    scSecure = true;
    const noCube = ganCubePresent();
    if (noCube) return console.warn("Cube Not Connected")
    const sleep = sleeped || window.sleeped;
    console.log(sleep)

    await wiggle();

    await sleepT(2000)

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
                runMovement(n, sleep /*+ 10*/, noCube)
            ]);
            i++;
        } else await runMovement(m, sleep, noCube);
    }
    stopTimer(start);

    await sleepT(200)

    await wiggle();

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
        showFullscreenMessage('click')
        connect()
        showFullscreenMessage('click')
        await spike(true)
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
        decel = 10000
        acel = 5000
        document.body.classList.add('fast')
    } else {
        window.sleeped = intSolve
        decel = 1000
        acel = 1000
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
        bc.onmessage = (e) => {
            const data = e.data;
            if (typeof data !== "string" || !data.startsWith("Move: ")) return;

            const move = data.replace("Move: ", "").trim();
            const expected = still[0];
            console.log(expected)
            const next = still[1]

            if (move === expected) {
                still.shift();
                if (still.length !== 0) {
                    console.info(`Next: ${next}`);
                    nxt.innerHTML = next;
                    if (wrong) {
                        nxt.classList.remove("wrong")
                        wrong = false;
                    }
                }
            } else {
                const rvs = rvsMove(move)
                console.warn(`No: ${move}, do: ${rvs}, expected: ${expected}`)
                still.push(rvs)
                nxt.innerHTML = rvs;
                nxt.classList.add("wrong")
                wrong = true;
            }

            if (still.length === 0) {
                resolve();
            }
        };
    });

    window.dontMove = false;
    nxt.clasList.remove("active")
    console.info("2nd cube solved");
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
        "x": wiggle,
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