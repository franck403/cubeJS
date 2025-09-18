let leftPort = null;
let rightPort = null;
let leftWriter = null;
let rightWriter = null;
let leftReader = null;
let rightReader = null;
let leftAbort = null;
let rightAbort = null;
let SpikeState = { left: false, right: false };

const startup = "import motor\n\nfrom hub import port, light_matrix, sound\n\n import time";
const connectSound = "sound.beep(392,120);time.sleep_ms(120);sound.beep(494,120);time.sleep_ms(120);sound.beep(587,150);time.sleep_ms(150);sound.beep(784,200)";
const music = "sound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 900) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";

// python/Spike1matrix.py
const spike1matrixPy = `from hub import light_matrix, port\nimport motor\nlights={port.A:[(0,y)for y in range(5)],port.C:[(x,0)for x in range(5)],port.E:[(i,i)for i in range(5)]}\ndef layer(motor_port,rotation,speed):motor.run_for_degrees(motor_port,rotation,speed);[light_matrix.set_pixel(x,y,0)for(x,y)in lights.get(motor_port,[])];[light_matrix.set_pixel(x,y,100)for(x,y)in lights.get(motor_port,[])]`

// python/Spike2matrix.py
const spike2matrixPy = `from hub import light_matrix, port\nimport motor\nlights={port.B:[(4,y)for y in range(5)],port.D:[(x,4)for x in range(5)],port.F:[(x,4-x)for x in range(5)]}\ndef layer(motor_port,rotation,speed):motor.run_for_degrees(motor_port,rotation,speed);[light_matrix.set_pixel(x,y,0)for(x,y)in lights.get(motor_port,[])];[light_matrix.set_pixel(x,y,100)for(x,y)in lights.get(motor_port,[])]`

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
        writer = port.writable.getWriter();
        reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
        abortCtrl = new AbortController();

        // save depending on side
        if (which === "left") {
            leftPort = port;
            leftWriter = writer;
            leftReader = reader;
            leftAbort = abortCtrl;
            SpikeState.left = true;
            await sendPythonCode(await loadPy('spike!matrix.py'))
        } else {
            rightPort = port;
            rightWriter = writer;
            rightReader = reader;
            rightAbort = abortCtrl;
            SpikeState.right = true;
            await sendPythonCode(await loadPy('spike2matrix.py'))
        }

        // send imports + then connect sound separately
        await sendLine(writer, startup);
        await sendLine(writer, connectSound);


        log(`${which} Spike connected`);
    } catch (err) {
        log(`Error opening ${which} Spike:`, err?.message || err);
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
}

async function SpikeMove(move, delay = 2000) {
    if (!SpikeState.left && !SpikeState.right) return;
    await runMovement(move);
    await new Promise(r => setTimeout(r, delay));
}

async function SpikeCube(moves, delay = 500) {
    if (!SpikeState.left && !SpikeState.right) return;
    console.log(moves);
    for (const move of moves) {
        await runMovement(move);
        await new Promise(r => setTimeout(r, delay));
    }
}

// hook for cube solver worker
function sc() {
    worker.postMessage({ type: 'solve', state: cube.asString() });
}

log("Ready. Use openSpike('left') and openSpike('right') to connect.");
