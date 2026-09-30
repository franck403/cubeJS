// api.js — GAN smart cube over the Web Bluetooth API (Gen2 / Gen3 / Gen4)
// Works with the "GAN EV3 Robot" page: #connect, #reset-state, #reset-gyro, #cube, .info fields, #timer
// Globals: window.ganCube, window.reset(), window.gm()  (reset/gm are only defined if gan.js did not define them)
// Events on window: gan:connected, gan:disconnected, gan:move, gan:facelets, gan:gyro, gan:battery, gan:solved

const CUBE_MAC = "D6:B4:0A:E0:62:72";

/* ======================================================================
 * Protocol constants
 * ==================================================================== */

const PROTOCOLS = {
  gen2: {
    service: "6e400001-b5a3-f393-e0a9-e50e24dc4179",
    command: "28be4a4a-cd67-11e9-a32f-2a2ae2dbcce4",
    state: "28be4cb6-cd67-11e9-a32f-2a2ae2dbcce4",
    cmdLen: 20,
  },
  gen3: {
    service: "8653000a-43e6-47b7-9cb0-5fc21d4ae340",
    command: "8653000c-43e6-47b7-9cb0-5fc21d4ae340",
    state: "8653000b-43e6-47b7-9cb0-5fc21d4ae340",
    cmdLen: 16,
  },
  gen4: {
    service: "00000010-0000-fff7-fff6-fff5fff4fff0",
    command: "0000fff5-0000-1000-8000-00805f9b34fb",
    state: "0000fff6-0000-1000-8000-00805f9b34fb",
    cmdLen: 20,
  },
};

const GAN_KEY = {
  key: [0x01, 0x02, 0x42, 0x28, 0x31, 0x91, 0x16, 0x07, 0x20, 0x05, 0x18, 0x54, 0x42, 0x11, 0x12, 0x53],
  iv: [0x11, 0x03, 0x32, 0x28, 0x21, 0x01, 0x76, 0x27, 0x20, 0x95, 0x78, 0x14, 0x32, 0x12, 0x02, 0x43],
};

const RESET_PAYLOAD = [0x05, 0x39, 0x77, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab];

const COMMANDS = {
  gen2: {
    hardware: [0x05],
    facelets: [0x04],
    battery: [0x09],
    reset: [0x0a, ...RESET_PAYLOAD],
  },
  gen3: {
    hardware: [0x68, 0x04],
    facelets: [0x68, 0x01],
    battery: [0x68, 0x07],
    reset: [0x68, ...RESET_PAYLOAD],
  },
  gen4: {
    hardware: [0xdf, 0x03, 0x00, 0x00, 0x00],
    facelets: [0xdd, 0x04, 0x00, 0xed, 0x00, 0x00],
    battery: [0xdd, 0x04, 0x00, 0xef, 0x00, 0x00],
    reset: [0xd2, 0x0d, ...RESET_PAYLOAD],
  },
};

// Kociemba facelet order: U R F D L B, 9 stickers each
const FACES = "URFDLB";
const COLORS = { U: "#ffffff", R: "#d62d20", F: "#2ba84a", D: "#ffd500", L: "#ff8c00", B: "#1f5fd6" };

const CORNER_FACELETS = [
  [8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11],
  [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51],
];
const EDGE_FACELETS = [
  [5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25],
  [30, 43], [34, 52], [23, 12], [21, 41], [50, 39], [48, 14],
];

const FACELET_OFFSETS = {
  gen2: { cp: 12, co: 33, ep: 47, eo: 91 },
  gen3: { cp: 40, co: 61, ep: 77, eo: 121 },
  gen4: { cp: 32, co: 53, ep: 69, eo: 113 },
};

const GAN_FACE_CODES = [2, 32, 8, 1, 16, 4]; // gen3/gen4 face bits -> index in URFDLB

/* ======================================================================
 * AES-128 (block encrypt/decrypt, needed because WebCrypto has no raw ECB/CBC-without-padding)
 * ==================================================================== */

const SBOX = new Uint8Array(256);
const ISBOX = new Uint8Array(256);
(() => {
  const rotl = (x, s) => ((x << s) | (x >> (8 - s))) & 0xff;
  let p = 1, q = 1;
  do {
    p = (p ^ (p << 1) ^ (p & 0x80 ? 0x1b : 0)) & 0xff;
    q ^= q << 1; q &= 0xff;
    q ^= q << 2; q &= 0xff;
    q ^= q << 4; q &= 0xff;
    if (q & 0x80) q ^= 0x09;
    const x = q ^ rotl(q, 1) ^ rotl(q, 2) ^ rotl(q, 3) ^ rotl(q, 4);
    SBOX[p] = (x ^ 0x63) & 0xff;
  } while (p !== 1);
  SBOX[0] = 0x63;
  for (let i = 0; i < 256; i++) ISBOX[SBOX[i]] = i;
})();

const xt = (x) => ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff;
const gmul = (a, b) => {
  let r = 0;
  while (b) {
    if (b & 1) r ^= a;
    a = xt(a);
    b >>= 1;
  }
  return r;
};

function expandKey(key) {
  const w = new Uint8Array(176);
  w.set(key);
  let rc = 1;
  for (let i = 16; i < 176; i += 4) {
    let t0 = w[i - 4], t1 = w[i - 3], t2 = w[i - 2], t3 = w[i - 1];
    if (i % 16 === 0) {
      [t0, t1, t2, t3] = [SBOX[t1] ^ rc, SBOX[t2], SBOX[t3], SBOX[t0]];
      rc = xt(rc);
    }
    w[i] = w[i - 16] ^ t0;
    w[i + 1] = w[i - 15] ^ t1;
    w[i + 2] = w[i - 14] ^ t2;
    w[i + 3] = w[i - 13] ^ t3;
  }
  return w;
}

function addRoundKey(s, w, r) {
  for (let i = 0; i < 16; i++) s[i] ^= w[r * 16 + i];
}

function aesEncryptBlock(input, w) {
  const s = Uint8Array.from(input);
  addRoundKey(s, w, 0);
  for (let r = 1; r <= 10; r++) {
    for (let i = 0; i < 16; i++) s[i] = SBOX[s[i]];
    const t = s.slice();
    for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) s[row + 4 * c] = t[row + 4 * ((c + row) % 4)];
    if (r < 10) {
      for (let c = 0; c < 4; c++) {
        const a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
        s[4 * c] = xt(a0) ^ (xt(a1) ^ a1) ^ a2 ^ a3;
        s[4 * c + 1] = a0 ^ xt(a1) ^ (xt(a2) ^ a2) ^ a3;
        s[4 * c + 2] = a0 ^ a1 ^ xt(a2) ^ (xt(a3) ^ a3);
        s[4 * c + 3] = (xt(a0) ^ a0) ^ a1 ^ a2 ^ xt(a3);
      }
    }
    addRoundKey(s, w, r);
  }
  return s;
}

function aesDecryptBlock(input, w) {
  const s = Uint8Array.from(input);
  addRoundKey(s, w, 10);
  for (let r = 9; r >= 0; r--) {
    const t = s.slice();
    for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) s[row + 4 * ((c + row) % 4)] = t[row + 4 * c];
    for (let i = 0; i < 16; i++) s[i] = ISBOX[s[i]];
    addRoundKey(s, w, r);
    if (r > 0) {
      for (let c = 0; c < 4; c++) {
        const a0 = s[4 * c], a1 = s[4 * c + 1], a2 = s[4 * c + 2], a3 = s[4 * c + 3];
        s[4 * c] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
        s[4 * c + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
        s[4 * c + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
        s[4 * c + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
      }
    }
  }
  return s;
}

/* GAN cipher: AES-128-CBC on the first 16 bytes and on the last 16 bytes, key/iv salted with the reversed MAC */
class GanCipher {
  constructor(mac) {
    const salt = mac.split(":").map((h) => parseInt(h, 16)).reverse();
    const key = GAN_KEY.key.slice();
    const iv = GAN_KEY.iv.slice();
    for (let i = 0; i < 6; i++) {
      key[i] = (key[i] + salt[i]) % 255;
      iv[i] = (iv[i] + salt[i]) % 255;
    }
    this.w = expandKey(Uint8Array.from(key));
    this.iv = Uint8Array.from(iv);
  }

  _enc(block) {
    const x = block.map((b, i) => b ^ this.iv[i]);
    return aesEncryptBlock(x, this.w);
  }

  _dec(block) {
    const out = aesDecryptBlock(block, this.w);
    for (let i = 0; i < 16; i++) out[i] ^= this.iv[i];
    return out;
  }

  encrypt(data) {
    const d = Uint8Array.from(data);
    if (d.length < 16) throw new Error("GAN message must be >= 16 bytes");
    d.set(this._enc(d.slice(0, 16)), 0);
    if (d.length > 16) {
      const off = d.length - 16;
      d.set(this._enc(d.slice(off)), off);
    }
    return d;
  }

  decrypt(data) {
    const d = Uint8Array.from(data);
    if (d.length < 16) return d;
    if (d.length > 16) {
      const off = d.length - 16;
      d.set(this._dec(d.slice(off)), off);
    }
    d.set(this._dec(d.slice(0, 16)), 0);
    return d;
  }
}

/* ======================================================================
 * Bit reader
 * ==================================================================== */

class Bits {
  constructor(bytes) {
    this.bytes = bytes;
    this.s = Array.from(bytes, (b) => b.toString(2).padStart(8, "0")).join("");
  }
  word(start, len) {
    if (start + len > this.s.length) return 0;
    return parseInt(this.s.substr(start, len), 2);
  }
  le(start, len) {
    let v = 0;
    const n = len >> 3, o = start >> 3;
    for (let i = 0; i < n; i++) v += (this.bytes[o + i] || 0) * 2 ** (8 * i);
    return v;
  }
}

/* ======================================================================
 * Cube model (54 stickers, Kociemba indexing) — geometric move permutations
 * ==================================================================== */

const STICKERS = [];
(() => {
  const add = (n, fn) => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) STICKERS.push({ p: fn(r, c), n });
  };
  add([0, 1, 0], (r, c) => [c - 1, 1, r - 1]);   // U
  add([1, 0, 0], (r, c) => [1, 1 - r, 1 - c]);   // R
  add([0, 0, 1], (r, c) => [c - 1, 1 - r, 1]);   // F
  add([0, -1, 0], (r, c) => [c - 1, -1, 1 - r]); // D
  add([-1, 0, 0], (r, c) => [-1, 1 - r, c - 1]); // L
  add([0, 0, -1], (r, c) => [1 - c, 1 - r, -1]); // B
})();

const FACE_NORMALS = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [0, -1, 0], [-1, 0, 0], [0, 0, -1]];

const MOVE_PERMS = (() => {
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // clockwise seen from outside = -90° around the outward normal: v' = -(n x v) + n (n . v)
  const rot = (v, n) => {
    const c = cross(n, v), d = dot(n, v);
    return [-c[0] + n[0] * d, -c[1] + n[1] * d, -c[2] + n[2] * d];
  };
  const key = (p, n) => p.join(",") + "|" + n.join(",");
  const index = new Map(STICKERS.map((s, i) => [key(s.p, s.n), i]));
  return FACE_NORMALS.map((n) => {
    const perm = Array.from({ length: 54 }, (_, i) => i);
    STICKERS.forEach((s, i) => {
      if (dot(s.p, n) === 1) perm[i] = index.get(key(rot(s.p, n), rot(s.n, n)));
    });
    return perm;
  });
})();

const SOLVED = Array.from("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

function applyMove(state, face, prime) {
  const perm = MOVE_PERMS[face];
  const out = state.slice();
  for (let i = 0; i < 54; i++) {
    if (prime) out[i] = state[perm[i]];
    else out[perm[i]] = state[i];
  }
  return out;
}

function isSolved(state) {
  for (let f = 0; f < 6; f++) {
    const c = state[f * 9 + 4];
    for (let i = 0; i < 9; i++) if (state[f * 9 + i] !== c) return false;
  }
  return true;
}

function cubiesToFacelets(cp, co, ep, eo) {
  const f = [];
  for (let i = 0; i < 54; i++) f[i] = FACES[Math.floor(i / 9)];
  for (let i = 0; i < 8; i++)
    for (let p = 0; p < 3; p++)
      f[CORNER_FACELETS[i][(p + co[i]) % 3]] = FACES[Math.floor(CORNER_FACELETS[cp[i]][p] / 9)];
  for (let i = 0; i < 12; i++)
    for (let p = 0; p < 2; p++)
      f[EDGE_FACELETS[i][(p + eo[i]) % 2]] = FACES[Math.floor(EDGE_FACELETS[ep[i]][p] / 9)];
  return f;
}

function readCubies(m, o) {
  const cp = [], co = [], ep = [], eo = [];
  const sum = (a, b) => a + b;
  for (let i = 0; i < 7; i++) {
    cp.push(m.word(o.cp + 3 * i, 3));
    co.push(m.word(o.co + 2 * i, 2));
  }
  for (let i = 0; i < 11; i++) {
    ep.push(m.word(o.ep + 4 * i, 4));
    eo.push(m.word(o.eo + i, 1));
  }
  cp.push(28 - cp.reduce(sum, 0));
  co.push((3 - (co.reduce(sum, 0) % 3)) % 3);
  ep.push(66 - ep.reduce(sum, 0));
  eo.push((2 - (eo.reduce(sum, 0) % 2)) % 2);
  // sanity check: wrong MAC / key gives garbage
  if (new Set(cp).size !== 8 || cp.some((x) => x < 0 || x > 7)) return null;
  if (new Set(ep).size !== 12 || ep.some((x) => x < 0 || x > 11)) return null;
  return cubiesToFacelets(cp, co, ep, eo);
}

/* ======================================================================
 * UI helpers
 * ==================================================================== */

const $ = (id) => document.getElementById(id);
const setVal = (id, v) => {
  const e = $(id);
  if (e) e.value = v;
};
const fire = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

const CELL = 22;
const canvas = document.createElement("canvas");
canvas.width = CELL * 12;
canvas.height = CELL * 9;
canvas.style.maxWidth = "100%";
const movesBox = document.createElement("div");
movesBox.id = "moves";
movesBox.style.cssText = "font-family:monospace;word-break:break-word;margin:8px 0;min-height:1.2em;";

function mountUI() {
  const cubeEl = $("cube");
  if (cubeEl) cubeEl.appendChild(canvas);
  const timerEl = $("timer");
  if (timerEl && timerEl.parentNode) timerEl.parentNode.insertBefore(movesBox, timerEl);
}

function render() {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const layout = { U: [3, 0], R: [6, 3], F: [3, 3], D: [3, 6], L: [0, 3], B: [9, 3] };
  for (let f = 0; f < 6; f++) {
    const [ox, oy] = layout[FACES[f]];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = COLORS[state[f * 9 + r * 3 + c]] || "#888";
        ctx.fillRect((ox + c) * CELL + 1, (oy + r) * CELL + 1, CELL - 2, CELL - 2);
      }
  }
}

function fmtTime(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = Math.floor(ms % 1000);
  return `${m}:${String(s).padStart(2, "0")}.${String(r).padStart(3, "0")}`;
}

/* ======================================================================
 * Runtime state
 * ==================================================================== */

let state = SOLVED.slice();
const moves = [];

let device = null;
let server = null;
let cmdChar = null;
let stateChar = null;
let gen = null;
let cipher = null;
let connected = false;
let lastSerial = -1;
let sendQueue = Promise.resolve();

let cubeClock = 0;      // cube-side accumulated time (gen2)
let skewBase = null;    // {cube, local}
let gyroRef = null;     // inverse reference quaternion for "Reset Gyro"
let lastQuat = null;

const timer = { running: false, start: 0, raf: 0 };

/* ======================================================================
 * Timer
 * ==================================================================== */

function timerTick() {
  if (!timer.running) return;
  const t = $("timer");
  if (t) t.textContent = fmtTime(Date.now() - timer.start);
  timer.raf = requestAnimationFrame(timerTick);
}

function timerStart(ts) {
  timer.running = true;
  timer.start = ts;
  cancelAnimationFrame(timer.raf);
  timerTick();
}

function timerStop(ts) {
  if (!timer.running) return;
  timer.running = false;
  cancelAnimationFrame(timer.raf);
  const elapsed = ts - timer.start;
  const t = $("timer");
  if (t) t.textContent = fmtTime(elapsed);
  fire("gan:solved", { time: elapsed });
}

function timerReset() {
  timer.running = false;
  cancelAnimationFrame(timer.raf);
  const t = $("timer");
  if (t) t.textContent = "0:00.000";
}

/* ======================================================================
 * Event handlers (protocol independent)
 * ==================================================================== */

function onMove(face, dir, ts, cubeTs) {
  const name = FACES[face] + (dir ? "'" : "");
  const wasSolved = isSolved(state);
  state = applyMove(state, face, !!dir);
  moves.push(name);
  movesBox.textContent = moves.join(" ");

  if (cubeTs != null) {
    if (!skewBase) skewBase = { cube: cubeTs, local: ts };
    const skew = cubeTs - skewBase.cube - (ts - skewBase.local);
    setVal("skew", `${skew >= 0 ? "+" : ""}${Math.round(skew)} ms`);
  }

  if (!timer.running && wasSolved) timerStart(ts);
  if (timer.running && isSolved(state)) timerStop(ts);

  render();
  fire("gan:move", { move: name, face: FACES[face], prime: !!dir, timestamp: ts, facelets: state.join("") });
}

function onFacelets(facelets, serial) {
  state = facelets;
  lastSerial = serial;
  if (timer.running && isSolved(state)) timerStop(Date.now());
  render();
  fire("gan:facelets", { facelets: state.join(""), serial });
}

function onGyro(q, v) {
  lastQuat = q;
  let out = q;
  if (gyroRef) out = quatMul(gyroRef, q);
  setVal("quaternion", `${out.x.toFixed(3)}, ${out.y.toFixed(3)}, ${out.z.toFixed(3)}, ${out.w.toFixed(3)}`);
  if (v) setVal("velocity", `${v.x}, ${v.y}, ${v.z}`);
  fire("gan:gyro", { quaternion: out, velocity: v });
}

function onBattery(level) {
  level = Math.min(100, level);
  setVal("batteryLevel", `${level}%`);
  fire("gan:battery", { level });
}

function quatMul(a, b) {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

/* ======================================================================
 * Protocol parsers
 * ==================================================================== */

function parseGen2(m) {
  const type = m.word(0, 4);
  if (type === 0x01) {
    // gyro
    const dq = (v) => ((1 - (v >> 15) * 2) * (v & 0x7fff)) / 0x7fff;
    const dv = (v) => (1 - (v >> 3) * 2) * (v & 0x7);
    onGyro(
      { w: dq(m.word(4, 16)), x: dq(m.word(20, 16)), y: dq(m.word(36, 16)), z: dq(m.word(52, 16)) },
      { x: dv(m.word(68, 4)), y: dv(m.word(72, 4)), z: dv(m.word(76, 4)) }
    );
  } else if (type === 0x02) {
    // moves (up to 7 buffered per packet)
    if (lastSerial === -1) return;
    const serial = m.word(4, 8);
    const raw = (serial - lastSerial) & 0xff;
    if (raw === 0) return;
    const diff = Math.min(raw, 7);
    lastSerial = serial;
    if (raw > 7) requestFacelets(); // missed moves, resync
    const list = [];
    for (let i = 0; i < diff; i++) {
      const mv = m.word(12 + 5 * i, 5);
      list.push({ face: mv >> 1, dir: mv & 1, elapsed: m.word(47 + 16 * i, 16) });
    }
    const now = Date.now();
    for (let i = diff - 1; i >= 0; i--) {
      let newer = 0;
      for (let j = 0; j < i; j++) newer += list[j].elapsed;
      cubeClock += list[i].elapsed;
      if (list[i].face > 5) continue;
      onMove(list[i].face, list[i].dir, now - newer, cubeClock);
    }
  } else if (type === 0x04) {
    const f = readCubies(m, FACELET_OFFSETS.gen2);
    if (f) onFacelets(f, m.word(4, 8));
  } else if (type === 0x05) {
    setVal("hardwareVersion", `${m.word(8, 8)}.${m.word(16, 8)}`);
    setVal("softwareVersion", `${m.word(24, 8)}.${m.word(32, 8)}`);
    let name = "";
    for (let i = 0; i < 8; i++) name += String.fromCharCode(m.word(40 + 8 * i, 8));
    setVal("hardwareName", name.replace(/[^\x20-\x7e]/g, "").trim() || "- n/a -");
    const gyro = m.word(104, 1) === 1;
    setVal("gyroSupported", gyro ? "Yes" : "No");
    const rg = $("reset-gyro");
    if (rg) rg.style.display = gyro ? "" : "none";
  } else if (type === 0x09) {
    onBattery(m.word(8, 8));
  }
}

function moveLE(serial, face, dir, cubeTs) {
  if (lastSerial === -1) return;
  const diff = (serial - lastSerial) & 0xffff;
  if (diff === 0) return;
  lastSerial = serial;
  if (diff > 1) requestFacelets();
  if (face < 0) return;
  onMove(face, dir, Date.now(), cubeTs);
}

function parseGen3(m) {
  if (m.word(0, 8) !== 0x55) return;
  const type = m.word(16, 8);
  if (type === 0x01) {
    moveLE(m.le(56, 16), GAN_FACE_CODES.indexOf(m.word(74, 6)), m.word(72, 2), m.le(24, 32));
  } else if (type === 0x02) {
    const f = readCubies(m, FACELET_OFFSETS.gen3);
    if (f) onFacelets(f, m.le(24, 16));
  } else if (type === 0x10) {
    onBattery(m.word(24, 8));
  }
}

function parseGen4(m) {
  const type = m.word(0, 8);
  if (type === 0x01) {
    moveLE(m.le(48, 16), GAN_FACE_CODES.indexOf(m.word(66, 6)), m.word(64, 2), m.le(16, 32));
  } else if (type === 0xed) {
    const f = readCubies(m, FACELET_OFFSETS.gen4);
    if (f) onFacelets(f, m.le(16, 16));
  } else if (type === 0xef) {
    onBattery(m.word(24, 8));
  }
}

const PARSERS = { gen2: parseGen2, gen3: parseGen3, gen4: parseGen4 };

function onNotify(ev) {
  const dv = ev.target.value;
  const raw = new Uint8Array(dv.buffer.slice(dv.byteOffset, dv.byteOffset + dv.byteLength));
  if (raw.length < 16 || !cipher) return;
  try {
    PARSERS[gen](new Bits(cipher.decrypt(raw)));
  } catch (e) {
    console.warn("GAN parse error", e);
  }
}

/* ======================================================================
 * Commands
 * ==================================================================== */

function sendCommand(bytes) {
  sendQueue = sendQueue
    .then(async () => {
      if (!cmdChar) return;
      const msg = new Uint8Array(PROTOCOLS[gen].cmdLen);
      msg.set(bytes);
      const enc = cipher.encrypt(msg);
      if (cmdChar.writeValueWithResponse) await cmdChar.writeValueWithResponse(enc);
      else await cmdChar.writeValue(enc);
    })
    .catch((e) => console.warn("GAN write failed", e));
  return sendQueue;
}

const requestFacelets = () => sendCommand(COMMANDS[gen].facelets);
const requestHardware = () => sendCommand(COMMANDS[gen].hardware);
const requestBattery = () => sendCommand(COMMANDS[gen].battery);

/* ======================================================================
 * Connection
 * ==================================================================== */

async function connect() {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth is not available (use Chrome/Edge over https or localhost).");
    return;
  }
  const btn = $("connect");
  try {
    if (btn) btn.textContent = "Connecting...";
    device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "GAN" }, { namePrefix: "MG" }, { namePrefix: "AiCube" }],
      optionalServices: Object.values(PROTOCOLS).map((p) => p.service),
    });
    device.addEventListener("gattserverdisconnected", onDisconnected);
    server = await device.gatt.connect();

    let service = null;
    for (const [g, p] of Object.entries(PROTOCOLS)) {
      try {
        service = await server.getPrimaryService(p.service);
        gen = g;
        break;
      } catch (_) {
        /* try next generation */
      }
    }
    if (!service) throw new Error("No supported GAN service found on this device");

    const p = PROTOCOLS[gen];
    cipher = new GanCipher(CUBE_MAC);
    cmdChar = await service.getCharacteristic(p.command);
    stateChar = await service.getCharacteristic(p.state);
    stateChar.addEventListener("characteristicvaluechanged", onNotify);
    await stateChar.startNotifications();

    connected = true;
    lastSerial = -1;
    cubeClock = 0;
    skewBase = null;

    setVal("deviceName", device.name || "- n/a -");
    setVal("deviceMAC", CUBE_MAC);
    if (gen !== "gen2") setVal("gyroSupported", "No");
    const info = document.querySelector(".info");
    if (info) info.style.removeProperty("display");
    if (btn) btn.textContent = "Disconnect";

    await requestHardware();
    await requestFacelets();
    await requestBattery();
    fire("gan:connected", { name: device.name, mac: CUBE_MAC, generation: gen });
  } catch (e) {
    console.error("GAN connect error:", e);
    if (device && device.gatt && device.gatt.connected) device.gatt.disconnect();
    connected = false;
    if (btn) btn.textContent = "Connect";
    if (e && e.name !== "NotFoundError") alert("Connection failed: " + (e.message || e));
  }
}

function onDisconnected() {
  connected = false;
  cmdChar = null;
  stateChar = null;
  lastSerial = -1;
  const btn = $("connect");
  if (btn) btn.textContent = "Connect";
  fire("gan:disconnected", {});
}

function disconnect() {
  if (device && device.gatt && device.gatt.connected) device.gatt.disconnect();
  else onDisconnected();
}

async function resetState() {
  state = SOLVED.slice();
  moves.length = 0;
  movesBox.textContent = "";
  timerReset();
  render();
  if (connected) await sendCommand(COMMANDS[gen].reset);
  fire("gan:facelets", { facelets: state.join(""), serial: lastSerial });
}

function getMoves() {
  const s = moves.join(" ");
  console.log(s);
  return s;
}

function resetGyro() {
  if (!lastQuat) return;
  const q = lastQuat;
  gyroRef = { w: q.w, x: -q.x, y: -q.y, z: -q.z }; // conjugate of a unit quaternion
}

/* ======================================================================
 * Boot
 * ==================================================================== */

function boot() {
  mountUI();
  render();
  setVal("deviceMAC", CUBE_MAC);

  const btn = $("connect");
  if (btn) btn.addEventListener("click", () => (connected ? disconnect() : connect()));
  const rg = $("reset-gyro");
  if (rg) rg.addEventListener("click", resetGyro);
  const tm = $("timer");
  if (tm) tm.addEventListener("click", timerReset);

  if (typeof window.reset !== "function") window.reset = resetState;
  if (typeof window.gm !== "function") window.gm = getMoves;

  window.ganCube = {
    MAC: CUBE_MAC,
    connect,
    disconnect,
    reset: resetState,
    getMoves,
    resetGyro,
    requestFacelets: () => connected && requestFacelets(),
    requestBattery: () => connected && requestBattery(),
    get moves() { return moves.slice(); },
    get facelets() { return state.join(""); }, // Kociemba string (URFDLB)
    get solved() { return isSolved(state); },
    get connected() { return connected; },
    get generation() { return gen; },
  };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();