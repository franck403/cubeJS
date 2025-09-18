let port = null;
let reader = null;
let writer = null;
let readAbort = null;
let SpikeState = false

const connectSound = "from hub import sound\nimport time\nsound.beep(392,120);time.sleep_ms(120)\nsound.beep(494,120);time.sleep_ms(120)\nsound.beep(587,150);time.sleep_ms(150)\nsound.beep(784,200)";
const music = "from hub import sound\nimport time\n\nsound.beep(196, 800) ; time.sleep_ms(850)  # G3\nsound.beep(262, 1000) ; time.sleep_ms(1050)  # C4\nsound.beep(220, 900) ; time.sleep_ms(950)  # A3\nsound.beep(294, 1200) ; time.sleep_ms(1250)  # D4\nsound.beep(247, 1000) ; time.sleep_ms(1050)  # B3\nsound.beep(196, 1500) ; time.sleep_ms(1550)  # G3\nsound.beep(330, 800) ; time.sleep_ms(850)  # E4\nsound.beep(262, 1400) ; time.sleep_ms(1450)  # C4";
//const music = "from hub import sound\nimport time\nsound.beep(262, 400) ; time.sleep_ms(450)  # C4\nsound.beep(262, 400) ; time.sleep_ms(450)  # C4\nsound.beep(392, 400) ; time.sleep_ms(450)  # G4\nsound.beep(392, 400) ; time.sleep_ms(450)  # G4\nsound.beep(440, 400) ; time.sleep_ms(450)  # A4\nsound.beep(440, 400) ; time.sleep_ms(450)  # A4\nsound.beep(392, 800) ; time.sleep_ms(850)  # G4\n\nsound.beep(349, 400) ; time.sleep_ms(450)  # F4\nsound.beep(349, 400) ; time.sleep_ms(450)  # F4\nsound.beep(330, 400) ; time.sleep_ms(450)  # E4\nsound.beep(330, 400) ; time.sleep_ms(450)  # E4\nsound.beep(294, 400) ; time.sleep_ms(450)  # D4\nsound.beep(294, 400) ; time.sleep_ms(450)  # D4\nsound.beep(262, 800) ; time.sleep_ms(850)  # C4";
const startup = `from hub import port\r\nimport motor\r\n`;
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

async function requestAndOpenPort() {
    try {
        left = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0694 }] });
        right = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0694 }] });
    } catch (err) {
        log('Port request cancelled or not allowed:', err?.message || err);
        return;
    }

    try {
        await port.open({ baudRate: 115200 });
        log('Port opened at 115200');
    } catch (err) {
        log('Failed to open port:', err);
        port = null;
        return;
    }

    if (port.writable) {
        writer = port.writable.getWriter();
    }

    await writer.write(new Uint8Array([3]));
    SpikeState = true

    if (port.readable) {
        readAbort = new AbortController();
        const decoder = new TextDecoderStream();
        port.readable.pipeTo(decoder.writable, { signal: readAbort.signal }).catch(e => {/*ignore*/});
        reader = decoder.readable.getReader();
        readLoop();
    }

    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    if (connectBtn) connectBtn.disabled = true;
    if (disconnectBtn) disconnectBtn.disabled = false;
    //await sendLine(connectSound)
}

async function readLoop() {
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                log('Read stream closed');
                break;
            }
            if (value) {
                log('RX:', value);
            }
        }
    } catch (err) {
        log('Read error:', err?.message || err);
    }
}

async function sendLine(text) {
    if (!writer) {
        log('Not connected. Call Connect first.');
        return;
    }
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized);

    try {
        await writer.write(bytes);
        await writer.write(encoder.encode('\r\n'));
        log('TX:', text);
    } catch (err) {
        log('Write error:', err?.message || err);
    }
}

async function disconnectPort() {
    try {
        if (reader) {
            await reader.cancel();
            reader.releaseLock();
            reader = null;
        }
        if (readAbort) {
            try { readAbort.abort(); } catch (e) { }
            readAbort = null;
        }
        if (writer) {
            try { await writer.close(); } catch (e) { }
            writer.releaseLock();
            writer = null;
        }
        if (port) {
            try { await port.close(); } catch (e) { }
            log('Port closed');
            port = null;
        }
    } catch (err) {
        log('Error during disconnect:', err);
    } finally {
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        if (connectBtn) connectBtn.disabled = false;
        if (disconnectBtn) disconnectBtn.disabled = true;
    }
}

async function runMovement(move) {
    // caculate the side
    there = 0
    sideLeft = false;
    if (CLP_LEFT[move]) {
        there += 1
    }

    if (!CLP_RIGHT[move]) {
        there += 1
    }

    if (!there == 2) {
        log(`Error: Movement '${move}' not found in CLP.`);
        return;
    }

    log(`Running movement for '${move}'...`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay to ensure startup commands are processed
    await sendLine(CLP[move]);
    log('Movement command sent.');
}

window.addEventListener("message", (event) => {
    if (event.data == 'STrue') {
        requestAndOpenPort();
    }
});

window.sendLine = sendLine;
window.disconnectSerial = disconnectPort;
window.runMovement = runMovement;
window._spikePort = () => port;

log('Ready. Click Connect.');


function spike() {
    requestAndOpenPort()
}

async function SpikeMove(move, delay = 2000) {
    if (!SpikeState) {return;}
    await sendLine(startup);
    await runMovement(move);
    await new Promise(r => setTimeout(r, delay));
}

async function SpikeCube(moves, delay = 500) {
    if (!SpikeState) {return;}
    console.log(moves)
    await sendLine(startup);

    for (const move of moves) {
        await runMovement(move);
        await new Promise(r => setTimeout(r, delay));
    }
}

function sc() {
    worker.postMessage({ type: 'solve', state: cube.asString() });
}