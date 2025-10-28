let solves = [];
const last = document.getElementById("last");
const best = document.getElementById("best");
const mid = document.getElementById("mid");
const worst = document.getElementById("worst");

function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

let isErudaOpen = false;
const bc = new BroadcastChannel(localStorage.bc);

let timerInterval = null;
let lastStartTime = null;

function startTimer(startTime) {
  lastStartTime = startTime;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(3);
    last.textContent = `${elapsed} S`;
  }, 1);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  lastStartTime = null;
}

const style = document.createElement("style");
style.textContent = `
  .active-flash {
    box-shadow: 0 0 30px 8px rgba(255, 255, 255, 0.3);
    transform: scale(1.02);
    transition: all 0.15s ease;
  }
`;
document.head.appendChild(style);

function down(e) {
  const map = { q: ".gan", a: ".js", z: ".spike", x: ".times" };
  const target = document.querySelector(map[e.key]);
  console.log(target)
  if (target) target.classList.add("active-flash");

  if (e.key === "#") {
    isErudaOpen ? window.eruda.hide() : window.eruda.show();
    isErudaOpen = !isErudaOpen;
  }
}

function up(e) {
  const map = { q: ".gan", a: ".js", z: ".spike", x: ".times" };
  const target = document.querySelector(map[e.key]);
  if (target) target.classList.remove("active-flash");
}

document.addEventListener("keydown", down);
document.addEventListener("keyup", up);

bc.onmessage = (e) => {
  const data = e.data;

  if (typeof data === "string") {
    if (data.startsWith("last")) return startTimer(new Date(data.slice(4)));
    if (data.startsWith("key")) return down({ key: data.slice(3) });
    if (data.startsWith("ked")) return up({ key: data.slice(3) });
  }

  if (typeof data !== "number") return;

  stopTimer();
  solves.push(data);

  last.textContent = `${data} sec`;

  const bestVal = parseFloat(best.textContent) || Infinity;
  const worstVal = parseFloat(worst.textContent) || 0;

  if (data < bestVal) best.textContent = `${data} sec`;
  if (data > worstVal) worst.textContent = `${data} sec`;

  mid.textContent = `${average(solves).toFixed(3)} sec`;
};

function hs(move) {
  bc.postMessage(`Move: ${move}`)
}

var ifr = document.getElementById('cube-view')
const targetFrame = window.top.frames[0];

function connect() {
  targetFrame.postMessage('connect')
}

function reset() {
  reset2()
  targetFrame.postMessage('reset')
}
window.hs = hs;

setInterval(() => bc.postMessage(true), 100);
