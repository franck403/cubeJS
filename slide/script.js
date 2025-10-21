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


let timerInterval = null;
let lastStartTime = null;

function startTimer(startTime) {
    lastStartTime = startTime
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let elapsed = ((new Date() - startTime) / 1000).toFixed(3);
        document.getElementById('last').innerHTML = elapsed + 'S';
    }, 1);
}
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        lastStartTime = null;
    }
}

bc.onmessage = e => {
    const data = e.data;
    console.log(e.data)
    if (typeof data === "string" && data.startsWith("last")) {
        return startTimer(new Date(data.slice(4)));
    }
    if (typeof data !== "number") return;
    stopTimer()

    solves.push(data);
    last.innerText = `${data} sec`;

    const bestVal = parseFloat(best.innerText) || Infinity;
    const worstVal = parseFloat(worst.innerText) || 0;

    if (data < bestVal) best.innerText = `${data} sec`;
    if (data > worstVal) worst.innerText = `${data} sec`;

    mid.innerText = `${average(solves).toFixed(3)} sec`;
};


setInterval(()=> {
    bc.postMessage(true)
},100)

const style = document.createElement('style');
style.textContent = `
  .active-flash {
    box-shadow: 0 0 30px 8px rgba(255, 255, 255, 0.3);
    transform: scale(1.02);
    transition: all 0.15s ease;
  }
`;
document.head.appendChild(style);

// Handle key press / release
document.addEventListener('keydown', (e) => {
  let target;
  if (e.key === '1') target = document.querySelector('.gan');
  if (e.key === '2') target = document.querySelector('.js');
  if (e.key === '3') target = document.querySelector('.spike');
  if (e.key === '4') target = document.querySelector('.times');
  if (target) target.classList.add('active-flash');
});

document.addEventListener('keyup', (e) => {
  let target;
  if (e.key === '1') target = document.querySelector('.gan');
  if (e.key === '2') target = document.querySelector('.js');
  if (e.key === '3') target = document.querySelector('.spike');
  if (e.key === '4') target = document.querySelector('.times');
  if (target) target.classList.remove('active-flash');
});
