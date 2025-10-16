let solves = []
const last = document.getElementById("last")
const best = document.getElementById("best")
const mid =  document.getElementById("mid")
const worst =  document.getElementById("worst")
 
const peer = new Peer('receiver-tab');
 
// Wait for the connection to be open
peer.on('open', (id) => {
    console.log('Receiver peer ID:', id);
});
 
function average(arr) {
    if (arr.length === 0) {
        return 0; // or throw an error if you prefer
    }
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}
 
 
peer.on('connection', (conn) => {
    console.log('Connected to sender');
 
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