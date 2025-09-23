// spiked.js is a layer for spike.js
async function sendPythonCode(port, code) {
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();

    // Split into lines
    const lines = code.replace(/[\t]?#[\w \/\\()’'"→-]*\n/g,'').split('\n');
    var data = ""
    let result = ""    

    for (var line of lines) {
        line = line.replace(/\n\t+/g,';') + ';'
        line = line.replace(/({);|(\[);|(\)):;/g,'$1')
        line = line.replaceAll(';;',';')
        data = encoder.encode(line);
        result += line;
    }
    while (true) {
        result = result.replaceAll(';;',';')
        if (result == result.replaceAll(';;',';')) {
            break
        }
    }
    await writer.write(result);

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
