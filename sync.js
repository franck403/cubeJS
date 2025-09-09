document.addEventListener('DOMContentLoaded', function() {
    let moves = [];

    // Listen for messages from the iframe
    window.addEventListener('message', function(event) {
        if (event.data.type === "MOVE") {
            moves.push(event.data.move);
            console.log("Move detected:", event.data.move);
        } else if (event.data === "Reset state") {
            moves = [];
            console.log("Reset state");
            document.getElementById("solution").textContent = "Moves will appear here.";
        } else if (event.data.type === "Get Moves") {
            console.log("Got Moves");
        } else if (event.data === "Connect First") {
            console.log("Connect first");
        }
    });

    // Optional: Auto-refresh logic
    let lastFileContent = '';
    function checkForUpdates() {
        fetch('solve.js')
            .then(r => r.text())
            .then(data => {
                if (data !== lastFileContent && data.search('Repl') === -1) {
                    lastFileContent = data;
                    if (navigator.onLine) {
                        document.getElementById('update').textContent =
                            'Update detected! Refreshing in 2 seconds...';
                        setTimeout(() => location.reload(), 2000);
                    }
                }
            })
            .catch(console.error);
    }

    // Uncomment to enable auto-refresh
    setInterval(checkForUpdates, 30000);
});