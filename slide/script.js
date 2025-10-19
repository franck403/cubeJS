let solves = []
const last = document.getElementById("last")
const best = document.getElementById("best")
const mid = document.getElementById("mid")
const worst = document.getElementById("worst")

function average(arr) {
    if (arr.length === 0) {
        return 0; // or throw an error if you prefer
    }
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

let isErudaOpen = false;

document.addEventListener("keydown", (e) => {
    if (e.key === '#') {
        isErudaOpen ? window.eruda.hide() : window.eruda.show();
        isErudaOpen = !isErudaOpen;
    }
});

const bc = new BroadcastChannel("test_channel");

bc.onmessage = (event) => {
    console.log(event);
    let data = event.data
    if (typeof data != Number && typeof data != typeof 1.0) {
        return;
    }
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
};