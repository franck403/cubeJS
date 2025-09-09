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