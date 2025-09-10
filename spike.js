
let port = null;
let reader = null;
let writer = null;
let readAbort = null;

// motor.run(port.A, 1000)
const startup = `from hub import port\r\nimport motor\r\n`
const CLP = { /* Look up table for what to run*/
    "U" : "motor.run_for_degrees(Port.A,90,1110)",
    "U'" :"motor.run_for_degrees(Port.A,-90,1110)",
    "B" : "motor.run_for_degrees(Port.B,90,1110)",
    "B'" :"motor.run_for_degrees(Port.B,-90,1110)",
    "D" : "motor.run_for_degrees(Port.D,90,1110)",
    "D'" :"motor.run_for_degrees(Port.D,-90,1110)",
    "F" : "motor.run_for_degrees(Port.F,90,1110)",
    "F'" :"motor.run_for_degrees(Port.F,-90,1110)",
    "L" : "motor.run_for_degrees(Port.E,90,1110)",
    "L'" :"motor.run_for_degrees(Port.E,-90,1110)",
    "R" : "motor.run_for_degrees(Port.C,90,1110)",
    "R'" :"motor.run_for_degrees(Port.C,-90,1110)",
}

function log(...args) {
    console.log(...args);
    logEl.textContent += args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n';
    logEl.scrollTop = logEl.scrollHeight;
}

async function requestAndOpenPort() {
    // Optional: filter by LEGO vendor id (decimal 1684), but filter may prevent the picker showing other ports
    // const filters = [{ usbVendorId: 1684 }];
    try {
        port = await navigator.serial.requestPort(); // or: requestPort({ filters })
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

    // Setup writer
    if (port.writable) {
        writer = port.writable.getWriter();
    }

    // Setup reader loop (text decoding)
    if (port.readable) {
        readAbort = new AbortController();
        const decoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(decoder.writable, { signal: readAbort.signal }).catch(e => {/*ignore*/ });
        reader = decoder.readable.getReader();
        readLoop();
    }

    // UI state
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    sendBtn.disabled = false;
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
                // value is a chunk of text
                log('RX:', value);
            }
        }
    } catch (err) {
        log('Read error:', err?.message || err);
    } finally {
        // cleanup handled elsewhere
    }
}

// Send a line (ensures \r\n line endings)
async function sendLine(text) {
    if (!writer) {
        log('Not connected. Call Connect first.');
        return;
    }
    // Normalize endings to CRLF, because Spike REPL often expects CRLF
    const normalized = text.replace(/\r?\n/g, '\r\n');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(normalized + '\r\n'); // ensure a final CRLF
    try {
        await writer.write(bytes);
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
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
    }
}

// Hook UI
window.addEventListener("message", (event) => {
    if (event.data == 'STrue') {
        requestAndOpenPort()
    }
});
//sendBtn.addEventListener('click', () => sendLine(lineInput.value));

// Expose sendLine globally so you can call it from console:
window.sendLine = sendLine;
window.disconnectSerial = disconnectPort;
window._spikePort = () => port; // debug helper

// Small note in UI:
log('Ready. Click Connect. After connecting you can call sendLine("your text") from console or use the input above.');
