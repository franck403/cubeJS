let leftPort = null;
let rightPort = null;
let leftWriter = null;
let rightWriter = null;
let leftReader = null;
let rightReader = null;
let leftAbort = null;
let rightAbort = null;
let SpikeState = { left: false, right: false };

const startup = "import motor\n\nfrom hub import port, light_matrix, sound\n\nimport time\n\nlayer = motor.run_for_degrees\n\nlight_matrix.clear()";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 900) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";

// LEFT side ports: A, C, E
const CLP_LEFT = {
    "U":  "motor.run_for_degrees(port.E, 90, 500)",
    "U'": "motor.run_for_degrees(port.E, -90, 500)",
    "U2": "motor.run_for_degrees(port.E, 180, 500)",

    "L":  "motor.run_for_degrees(port.C, 90, 500)",
    "L'": "motor.run_for_degrees(port.C, -90, 500)",
    "L2": "motor.run_for_degrees(port.C, 180, 500)",

    "F":  "motor.run_for_degrees(port.A, 90, 500)",
    "F'": "motor.run_for_degrees(port.A, -90, 500)",
    "F2": "motor.run_for_degrees(port.A, 180, 500)",
};

// RIGHT side ports: B, D, F
const CLP_RIGHT = {
    "R":  "motor.run_for_degrees(port.D, 90, 500)",
    "R'": "motor.run_for_degrees(port.D, -90, 500)",
    "R2": "motor.run_for_degrees(port.D, 180, 500)",

    "B":  "motor.run_for_degrees(port.F, 90, 500)",
    "B'": "motor.run_for_degrees(port.F, -90, 500)",
    "B2": "motor.run_for_degrees(port.F, 180, 500)",

    "D":  "motor.run_for_degrees(port.B, 90, 500)",
    "D'": "motor.run_for_degrees(port.B, -90, 500)",
    "D2": "motor.run_for_degrees(port.B, 180, 500)",
};

// run all
// SpikeCube(['U','L','F','R','B','D'])

// SpikeCube(['U2','L2','F2','R2','B2','D2'])

// SpikeCube(["U", "L2", "F'", "R", "D2", "B", "U'", "R2", "L", "D", "F2", "B'", "U2", "L'", "D", "R2", "F'", "B2", "U'", "D'"])


function log(...args) {
    console.info(...args);
    const logEl = document.getElementById('log');
    if (logEl) {
        logEl.textContent += args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
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
            }
        } catch (err) {
            log(`RX error [${which}]:`, err?.message || err);
        }
    })();
}


async function runMovement(move) {
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
    sendLine(leftWriter,`light_matrix.write("${move.charAt(0)}",100)`)

    if (move.endsWith("'")) {
        sendLine(rightWriter,'light_matrix.write("\'",100)') 
        await new Promise(r => setTimeout(r, 900));
    } else if (move.endsWith("2")) {
        sendLine(rightWriter,'light_matrix.write("2",100)') 
        await new Promise(r => setTimeout(r, 1100));
    } else {
        sendLine(rightWriter,'light_matrix.write("",100)') 
        await new Promise(r => setTimeout(r, 800));
    }
}

async function SpikeMove(move) {
    if (!SpikeState.left && !SpikeState.right) return;
    await runMovement(move);
}

async function SpikeCube(moves) {
    if (!SpikeState.left && !SpikeState.right) return;
    console.log(moves);
    sendLine(leftWriter,`light_matrix.write("${String(moves.length).charAt(0)}",100)`)
    sendLine(rightWriter,`light_matrix.write("${String(moves.length).charAt(1)}",100)`)
    await new Promise(r => setTimeout(r, 2000));
    for (const move of moves) {
        await runMovement(move);
    }
}

// hook for cube solver worker
function sc() {
    worker.postMessage({ type: 'solve', state: cube.asString() });
}

log("Ready. Use openSpike('left') and openSpike('right') to connect.");
