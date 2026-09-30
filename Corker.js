importScripts(
  './lc.js',
  './ls.js',
  './localSolver.js'
);

Cube.initSolver();

// ---- compat shim: give localSolver the Cube API it expects ----
(function () {
  if (Cube.MV && Cube.MOVE_NAMES) return;

  const FACES = 'URFDLB', SUF = ['', '2', "'"];
  const NAMES = [];
  for (let f = 0; f < 6; f++) for (let s = 0; s < 3; s++) NAMES.push(FACES[f] + SUF[s]);

  // MV[m] = the state cubejs produces by applying move m to a solved cube.
  // Composing with (state[move.src] + move.ori) % n is exactly cubejs's
  // multiply rule, so the local tables agree with the standard solver.
  const MV = NAMES.map(name => {
    const c = new Cube();
    c.move(name);
    return {
      cp: c.cp.slice(), co: c.co.slice(),
      ep: c.ep.slice(), eo: c.eo.slice()
    };
  });

  Cube.MV = MV;
  Cube.MOVE_NAMES = NAMES;

  Cube.prototype.twist = function () {
    let r = 0;
    for (let i = 0; i < 7; i++) r = 3 * r + this.co[i];
    return r;
  };
  Cube.prototype.flip = function () {
    let r = 0;
    for (let i = 0; i < 11; i++) r = 2 * r + this.eo[i];
    return r;
  };
  Cube.prototype.sliceMask = function () {
    let m = 0;
    for (let j = 0; j < 12; j++) if (this.ep[j] >= 8) m |= 1 << j;
    return m;
  };
  Cube.prototype.moves = function (idxs) {
    for (let i = 0; i < idxs.length; i++) this.move(NAMES[idxs[i]]);
    return this;
  };
})();

// Warm up the local solver's pruning tables at load time (takes ~1-2s once),
// so the table build is NOT counted inside the timed solve call.
local.init();

postMessage({ type: 'ready' });

onmessage = function (e) {
  const { type, state, maxLen } = e.data;
  if (type !== 'solve') return;

  const cube1 = Cube.fromString(state);
  const cube2 = Cube.fromString(state);

  let rawRes1 = null, time1 = Infinity;
  try {
    const t0 = performance.now();
    rawRes1 = cube1.solve();
    time1 = performance.now() - t0;
  } catch (err) {}

  let res2 = null, time2 = Infinity;
  try {
    // Hard 100ms budget: aborts the search at the threshold;
    // localSolver returns the best solution found so far on timeout.
    const budget = 100;
    const deadline = performance.now() + budget;
    const timeoutErr = new Error('timeout');
    timeoutErr.name = 'TimeoutError';
    let ticks = 0;
    const ctx = {
      maxLen: maxLen || 22,
      tick() {
        if ((++ticks & 255) === 0 && performance.now() > deadline) throw timeoutErr;
      },
      log: () => {}
    };
    const t0 = performance.now();
    res2 = local.solve(cube2, ctx);
    time2 = performance.now() - t0;
  } catch (err) {}

  const moves1 = rawRes1 && typeof rawRes1 === 'string' && rawRes1.trim().length > 0
    ? rawRes1.trim().split(/\s+/)
    : null;
  const moves2 = res2 && Array.isArray(res2) && res2.length > 0 ? res2 : null;

  const v1 = moves1 && time1 < 100;
  const v2 = moves2 && time2 < 100;

  let chosen = '', reason = '', finalSolution = null;
  const formatLocal = r => Array.isArray(r) ? r.join(' ') : r;

  if (v1 && v2) {
    if (moves2.length <= moves1.length) {
      chosen = 'local'; finalSolution = formatLocal(res2);
      reason = `both under 100ms (local: ${time2.toFixed(1)}ms, std: ${time1.toFixed(1)}ms), local has fewer or equal moves (${moves2.length} vs ${moves1.length})`;
    } else {
      chosen = 'standard'; finalSolution = rawRes1;
      reason = `both under 100ms (std: ${time1.toFixed(1)}ms, local: ${time2.toFixed(1)}ms), standard has fewer moves (${moves1.length} vs ${moves2.length})`;
    }
  } else if (v2) {
    chosen = 'local'; finalSolution = formatLocal(res2);
    reason = `only local finished under 100ms (${time2.toFixed(1)}ms vs std: ${time1.toFixed(1)}ms)`;
  } else if (v1) {
    chosen = 'standard'; finalSolution = rawRes1;
    reason = `only standard finished under 100ms (${time1.toFixed(1)}ms vs local: ${time2.toFixed(1)}ms)`;
  } else if (moves1 && moves2) {
    if (moves2.length <= moves1.length) {
      chosen = 'local'; finalSolution = formatLocal(res2);
      reason = `neither under 100ms, local fallback has fewer or equal moves (${moves2.length} vs ${moves1.length})`;
    } else {
      chosen = 'standard'; finalSolution = rawRes1;
      reason = `neither under 100ms, standard fallback has fewer moves (${moves1.length} vs ${moves2.length})`;
    }
  } else if (moves2) {
    chosen = 'local'; finalSolution = formatLocal(res2);
    reason = 'only local returned a solution';
  } else if (moves1) {
    chosen = 'standard'; finalSolution = rawRes1;
    reason = 'only standard returned a solution';
  }

  console.log(`Solver chosen: ${chosen} | Reason: ${reason}`);

  if (finalSolution) {
    postMessage({ type: 'solution', solution: finalSolution });
  } else {
    postMessage({ type: 'error', message: 'aucune solution trouvée' });
  }
};