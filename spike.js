let port = null;
let reader = null;
let writer = null;
let readAbort = null;
let SpikeState = false

const startup = `from hub import port\r\nimport motor\r\n`;
const CLP = {
    "R":  "motor.run_for_degrees(port.A, 90, 1110)",
    "R'": "motor.run_for_degrees(port.A, -90, 1110)",
    "R2": "motor.run_for_degrees(port.A, 180, 1110)",

    "U":  "motor.run_for_degrees(port.B, 90, 1110)",
    "U'": "motor.run_for_degrees(port.B, -90, 1110)",
    "U2": "motor.run_for_degrees(port.B, 180, 1110)",

    "L":  "motor.run_for_degrees(port.C, 90, 1110)",
    "L'": "motor.run_for_degrees(port.C, -90, 1110)",
    "L2": "motor.run_for_degrees(port.C, 180, 1110)",

    "B":  "motor.run_for_degrees(port.D, 90, 1110)",
    "B'": "motor.run_for_degrees(port.D, -90, 1110)",
    "B2": "motor.run_for_degrees(port.D, 180, 1110)",

    "D":  "motor.run_for_degrees(port.E, 90, 1110)",
    "D'": "motor.run_for_degrees(port.E, -90, 1110)",
    "D2": "motor.run_for_degrees(port.E, 180, 1110)",

    "F":  "motor.run_for_degrees(port.F, 90, 1110)",
    "F'": "motor.run_for_degrees(port.F, -90, 1110)",
    "F2": "motor.run_for_degrees(port.F, 180, 1110)",
};

function log(...args) {
    console.log(...args);
    const logEl = document.getElementById('log');
    if (logEl) {
        logEl.textContent += args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

async function requestAndOpenPort() {
    try {
        port = await navigator.serial.requestPort();
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
    if (!CLP[move]) {
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

async function SpikeCube(moves, delay = 2000) {
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