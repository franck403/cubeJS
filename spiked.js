// spiked.js is a layer for spike.js
async function sendPythonCode(port, code) {
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();

    // Ensure proper formatting:
    // 1. Convert all tabs to 4 spaces
    // 2. Add empty line at end of each function
    code = code.replace(/\t/g, '    ').replace(/\r/g, '');

    // Split into lines
    const lines = code.split('\n');

    for (const line of lines) {
        // Skip lines with only whitespace? No, send them to end block
        const data = encoder.encode(line + '\n');
        await writer.write(data);

        // Small delay helps MicroPython parse correctly
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    writer.releaseLock();
    console.log('Code sent!');
}

async function loadPy(file) {
    try {
        const response = await fetch(`/python/${file}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
        }
        const code = await response.text();
        return code;
    } catch (err) {
        console.error(err);
        return null;
    }
}
