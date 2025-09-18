let port1 = null;
let port2 = null;

let reader1 = null;
let reader2 = null;

let spike1 = null;
let spike2 = null;

let readAbort1 = null;
let readAbort2 = null;

let Spike1State = false;
let Spike2State = false;

const startup = `from hub import port light_matrix\r\nimport motor\r\n`;
const hub1 = ['A', 'B', 'C'];
const hub2 = ['D', 'E', 'F'];
const hub1Moves = ['R', 'U', 'L'];
const hub2Moves = ['B', 'D', 'F'];
const speed = 1110;

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
        port1 = await navigator.serial.requestPort();
        port2 = await navigator.serial.requestPort();
    } catch (err) {
        log('Port request cancelled or not allowed:', err?.message || err);
        return;
    }

    try {
        await port1.open({ baudRate: 115200 });
        await port2.open({ baudRate: 115200 });
        log('Ports opened at 115200');
    } catch (err) {
        log('Failed to open ports:', err);
        port1 = null;
        port2 = null;
        return;
    }

    if (port1.writable) {
        spike1 = port1.writable.getWriter();
    }
    if (port2.writable) {
        spike2 = port2.writable.getWriter();
    }

    await spike1.write(new Uint8Array([3]));
    Spike1State = true;
    await spike2.write(new Uint8Array([3]));
    Spike2State = true;

    if (port1.readable) {
        readAbort1 = new AbortController();
        const decoder = new TextDecoderStream();
        port1.readable.pipeTo(decoder.writable, { signal: readAbort1.signal }).catch(() => {});
        reader1 = decoder.readable.getReader();
        readLoop(reader1);
    }

    if (port2.readable) {
        readAbort2 = new AbortController();
        const decoder = new TextDecoderStream();
        port2.readable.pipeTo(decoder.writable, { signal: readAbort2.signal }).catch(() => {});
        reader2 = decoder.readable.getReader();
        readLoop(reader2);
    }

    // Send startup code to both hubs once
    await sendLine(startup, spike1);
    await sendLine(startup, spike2);

    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    if (connectBtn) connectBtn.disabled = true;
    if (disconnectBtn) disconnectBtn.disabled = false;
}

async function readLoop(reader) {
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

async function sendLine(text, spike) {
    if (!spike) {
        log('Not connected. Call Connect first.');
        return;
    }
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized);

    try {
        await spike.write(bytes);
        await spike.write(encoder.encode('\r\n'));
        log('TX:', text);
    } catch (err) {
        log('Write error:', err?.message || err);
    }
}

async function disconnectPort() {
    try {
        // Spike 1
        if (reader1) {
            await reader1.cancel();
            reader1.releaseLock();
            reader1 = null;
        }
        if (readAbort1) {
            try { readAbort1.abort(); } catch (e) {}
            readAbort1 = null;
        }
        if (spike1) {
            spike1.releaseLock();
            spike1 = null;
        }
        if (port1) {
            try { await port1.close(); } catch (e) {}
            log('Spike 1 port closed');
            port1 = null;
        }
        Spike1State = false;

        // Spike 2
        if (reader2) {
            await reader2.cancel();
            reader2.releaseLock();
            reader2 = null;
        }
        if (readAbort2) {
            try { readAbort2.abort(); } catch (e) {}
            readAbort2 = null;
        }
        if (spike2) {
            spike2.releaseLock();
            spike2 = null;
        }
        if (port2) {
            try { await port2.close(); } catch (e) {}
            log('Spike 2 port closed');
            port2 = null;
        }
        Spike2State = false;

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
    const base = move[0];          // e.g. "R"
    const modifier = move.slice(1); // "", "2", or "'"

    let port, spike;
    if (hub1Moves.includes(base)) {
        port = hub1[hub1Moves.indexOf(base)];
        spike = 1;
    } else if (hub2Moves.includes(base)) {
        port = hub2[hub2Moves.indexOf(base)];
        spike = 2;
    }

    if (!port) return;

    let degrees = 0;
    if (modifier === "") degrees = 90;
    else if (modifier === "2") degrees = 180;
    else if (modifier === "'") degrees = -90;

    const cmd = `motor.run_for_degrees(port.${port}, ${degrees}, ${speed})`;
    const matrix1 = `light_matrix.show("${base}")`;
    const matrix2 = `light_matrix.show("${modifier}")`;
    const clearMatrix = `light_matrix.clear()`;

    if (spike === 1) {
        log(`Running '${move}' on Spike 1`);
        await new Promise(r => setTimeout(r, 300));
        await sendLine(matrix1, spike1);
        await sendLine(matrix2, spike2);
        await sendLine(cmd, spike1);
        log('Movement command sent.');
        await sendLine(clearMatrix, spike1);
        await sendLine(clearMatrix, spike2);
    } else if (spike === 2) {
        log(`Running '${move}' on Spike 2`);
        await new Promise(r => setTimeout(r, 300));
        await sendLine(matrix1, spike1);
        await sendLine(matrix2, spike2);
        await sendLine(cmd, spike2);
        log('Movement command sent.');
        await sendLine(clearMatrix, spike1);
        await sendLine(clearMatrix, spike2);
    }
}

window.addEventListener("message", (event) => {
    if (event.data === 'STrue') {
        requestAndOpenPort();
    }
});

window.sendLine = sendLine;
window.disconnectSerial = disconnectPort;
window.runMovement = runMovement;
window._spikePorts = () => ({ port1, port2 });

log('Ready. Click Connect.');

function spike() {
    requestAndOpenPort();
}

async function SpikeMove(move, delay = 2000) {
    if (!Spike1State || !Spike2State) return;
    await runMovement(move);
    await new Promise(r => setTimeout(r, delay));
}

async function SpikeCube(moves, delay = 500) {
    if (!Spike1State && !Spike2State) return;

    for (const move of moves) {
        await runMovement(move);
        await new Promise(r => setTimeout(r, delay));
    }
}

function sc() {
    worker.postMessage({ type: 'solve', state: cube.asString() });
}
