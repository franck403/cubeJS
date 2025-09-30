function gm() {
    if (document.getElementById("connect").innerHTML === "Disconnect") {
        console.log('Get Moves');
    } else {
        console.log('Connect First');
    }
}

function reset() {
    if (document.getElementById("connect").innerHTML === "Disconnect") {
        console.log('Reset State');
    } else {
        console.log('Connect First');
    }
}

window.addEventListener("message", (event) => {
    console.log(`Received message: ${event.data}`);
    if (event.data == 'connect') {
        document.getElementById('connect').click()
    } else if (event.data == 'reset') {
        document.getElementById('reset-state').click()
    } else if (event.data == 'state') {
        window.parent.postMessage('S' + document.getElementById("connect").innerHTML === "Disconnect")
    }
});