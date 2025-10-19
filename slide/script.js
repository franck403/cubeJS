let solves = []
const last = document.getElementById("last")
const best = document.getElementById("best")
const mid = document.getElementById("mid")
const worst = document.getElementById("worst")
let peer = new Peer('receiver-tab-test', {
	config: {'iceServers': [
	  { url: 'stun:stun.l.google.com:19302' }
	]}
});
let conn

function average(arr) {
    if (arr.length === 0) {
        return 0; // or throw an error if you prefer
    }
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

// Wait for the connection to be open
peer.on('open', (id) => {
    console.log('PEER OPEN: Receiver peer ID:', id);
    peer.on('connection', (con) => {
        conn = con;
        console.log('PEER CONN: Connecting to sender');
        conn.on('open', () => {
            console.log('PEER CONN: Connected to sender');

            // Listen for data (time in seconds)
            conn.on('data', (data) => {
                solves.push(data);
                last.innerText = data + " sec";
                if (data < parseFloat(best.innerText) || best.innerText === "0.000 sec") {
                    best.innerText = data + " sec";
                }
                if (data > parseFloat(worst.innerText) || worst.innerText === "0.000 sec") {
                    worst.innerText = data + " sec";
                }
                const nMid = average(solves);
                mid.innerText = nMid.toFixed(3) + " sec";
            });
        });
    });
});

let isErudaOpen = false;

document.addEventListener("keydown", (e) => {
    if (e.key === '#') {
        isErudaOpen ? window.eruda.hide() : window.eruda.show();
        isErudaOpen = !isErudaOpen;
    }
});
