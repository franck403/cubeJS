let leftPort = null;
let rightPort = null;
let leftWriter = null;
let rightWriter = null;
let leftReader = null;
let rightReader = null;
let leftAbort = null;
let rightAbort = null;
let SpikeState = { left: false, right: false };

const startup = "import motor\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear()\n\nmotor.motor_set_high_resolution_mode(port.A, True)\n\nmotor.motor_set_high_resolution_mode(port.B, True)\n\nmotor.motor_set_high_resolution_mode(port.C, True)\n\nmotor.motor_set_high_resolution_mode(port.D, True)\n\nmotor.motor_set_high_resolution_mode(port.E, True)\n\nmotor.motor_set_high_resolution_mode(port.F, True)";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 900) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
const getBattery = `import hub\n\nprint("Ba" + str(hub.battery_voltage()))`
const clearDisplay = `light_matrix.clear()\n\n`

// LEFT side ports: A, C, E
const CLP_LEFT = {
    "U":  "motor.run_for_degrees(port.E, -90, 1100)",
    "U'": "motor.run_for_degrees(port.E, 90, 1100)",
    "U2": "motor.run_for_degrees(port.E, 180, 1100)",

    "L":  "motor.run_for_degrees(port.C, -90, 1100)",
    "L'": "motor.run_for_degrees(port.C, 90, 1100)",
    "L2": "motor.run_for_degrees(port.C, 180, 1100)",

    "F":  "motor.run_for_degrees(port.A, -90, 1100)",
    "F'": "motor.run_for_degrees(port.A, 90, 1100)",
    "F2": "motor.run_for_degrees(port.A, 180, 1100)",
};

// RIGHT side ports: B, D, F
const CLP_RIGHT = {
    "R":  "motor.run_for_degrees(port.D, -90, 500)",
    "R'": "motor.run_for_degrees(port.D, 90, 500)",
    "R2": "motor.run_for_degrees(port.D, 180, 500)",

    "B":  "motor.run_for_degrees(port.F, -90, 500)",
    "B'": "motor.run_for_degrees(port.F, 90, 500)",
    "B2": "motor.run_for_degrees(port.F, 180, 500)",

    "D":  "motor.run_for_degrees(port.B, -90, 600)",
    "D'": "motor.run_for_degrees(port.B, 90, 600)",
    "D2": "motor.run_for_degrees(port.B, 180, 600)",
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
        //await sendLine(writer, connectSound);

        log(`${which} Spike connected`);
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
    }
}

async function spike() {
    await openSpike('left')
    await openSpike('right')
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
            try { await writer.close(); } catch (e) {}
            writer.releaseLock();
        }
        if (port) {
            try { await port.close(); } catch (e) {}
        }

        if (which === "left") {
            leftPort = leftWriter = leftReader = null;
            SpikeState.left = false;
        } else {
            rightPort = rightWriter = rightReader = null;
            SpikeState.right = false;
        }

        log(`${which} Spike disconnected`);
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
                }
                value.split('\n').forEach(element => {
                    console.log(element)
                    if (element.startsWith('Ba')) {
                        console.log('got battery update', value.replace('Ba',''))
                        document.getElementById(which).innerText = (batteryPercentage(parseFloat(value.replace('Ba',''))/1000, 6.0, 8.4)) + '%'
                    }                        
                });
            }
        } catch (err) {
            log(`RX error [${which}]:`, err?.message || err);
        }
    })();
}


async function runMovement(move,sleep=220) {
    let cmd = null;
    let writer = null;

    if (CLP_LEFT[move]) {
        cmd = CLP_LEFT[move];
        writer = leftWriter;
    } else if (CLP_RIGHT[move]) {
        cmd = CLP_RIGHT[move];
        writer = rightWriter;
    }

    if (!cmd || !writer) {
        log(`Error: Movement '${move}' not found or no Spike connected`);
        return;
    }

    log(`Running move '${move}'`);
    await sendLine(writer, cmd);
    await sendLine(leftWriter,`light_matrix.write("${move.charAt(0)}",100)`)
    var waitTimer = sleep
    if (move.endsWith("'")) {
        await sendLine(rightWriter,'light_matrix.write("\'",100)') 
        await new Promise(r => setTimeout(r, waitTimer));
    } else if (move.endsWith("2")) {
        await sendLine(rightWriter,'light_matrix.write("2",100)') 
        await new Promise(r => setTimeout(r, waitTimer*2));
    } else {
        await sendLine(rightWriter,'light_matrix.write("",100)') 
        await new Promise(r => setTimeout(r, waitTimer));
    }
}

async function updateBatteries() {
    await sendLine(rightWriter,getBattery) 
    await new Promise(r => setTimeout(r, 200));
    await sendLine(leftWriter,getBattery) 
    await new Promise(r => setTimeout(r, 200));
    await sendLine(leftWriter,clearDisplay)
    await sendLine(rightWriter,clearDisplay)
    const targetFrame = window.top.frames[0];    
    targetFrame.postMessage('batteryLevel')
} 

async function SpikeMove(move) {
    if (!SpikeState.left && !SpikeState.right) return;
    await runMovement(move);
    updateBatteries()
}

async function SpikeCube(moves, sleep = 180) {
    var timerStarted = new Date();
    if (!SpikeState.left && !SpikeState.right) return;
    console.log(moves);

    sendLine(leftWriter, `light_matrix.write("${String(moves.length).charAt(0)}",100)`);
    sendLine(rightWriter, `light_matrix.write("${String(moves.length).charAt(1)}",100)`);

    await new Promise(r => setTimeout(r, 2000));

    for (const move of moves) {
        await runMovement(move, sleep);
    }

    updateBatteries();

    let elapsed = (new Date() - timerStarted) / 1000; // convert ms → seconds
    alert(elapsed.toFixed(2) + "s"); // keep 2 decimals
}


// hook for cube solver worker
function sc() {
    worker.postMessage({ type: 'solve', state: cube.asString() });
}

log("Ready. Use openSpike('left') and openSpike('right') to connect.");

async function scramble() {
    var moves = generateScramble(20)
    SpikeCube(moves,450)    
}

async function leb() {
    for (let i;i<=15;i++) {
        await scramble()
        await new Promise(r => setTimeout(r, 200));
        sc()
        await new Promise(r => setTimeout(r, 10000));
    }
}

function StartCube() {
    SpikeCube(['U','U','U','U'],450)
}

let SpinState = true
async function spin() {
    if (SpinState) {
        SpinState = false
        await sendLine(leftWriter,'motor.run(port.E, 150)')
    } else {
        SpinState = true
        await sendLine(leftWriter,'motor.stop(port.E)')
    }
}