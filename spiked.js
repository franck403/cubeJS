// spiked.js is a layer for spike.js
async function sendPythonCode(port, code) {
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();

    // Split into lines
    const lines = code.split('\n');
    var tabLeft = 0
    var data = ""

    for (const line of lines) {
        // Skip lines with only whitespace? No, send them to end block
        if (line.split('\t').length <= tabLeft) {
            data = encoder.encode(line + '\n');
            tabLeft = line.split('\t').length
        } else {
            data = encoder.encode(line + "\r".repeat(tabLeft) + '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
            tabLeft = line.split('\t').length
        }
        console.log(line)
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
