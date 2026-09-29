importScripts(
  'https://cdn.jsdelivr.net/gh/ldez/cubejs/lib/cube.js',
  'https://cdn.jsdelivr.net/gh/ldez/cubejs/lib/solve.js',
  './localSolver.js'
);

Cube.prototype.clone = function() {
  return new Cube(this);
};

Cube.prototype.moves = function(path) {
  for (let i = 0; i < path.length; i++) {
    this.move(Cube.MOVE_NAMES[path[i]]);
  }
  return this;
};

Cube.prototype.twist = function() {
  let r = 0;
  for (let k = 0; k < 7; k++) {
    r = 3 * r + this.co[k];
  }
  return r;
};

Cube.prototype.flip = function() {
  let r = 0;
  for (let k = 0; k < 11; k++) {
    r = 2 * r + this.eo[k];
  }
  return r;
};

Cube.prototype.sliceMask = function() {
  let mask = 0;
  for (let k = 0; k < 12; k++) {
    if (this.ep[k] >= 8) {
      mask |= (1 << k);
    }
  }
  return mask;
};

Cube.initSolver();
postMessage({ type: 'ready' });

onmessage = function (e) {
  const { type, state, maxLen } = e.data;

  if (type === 'solve') {
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
      const ctx = {
        maxLen: maxLen || 22,
        tick: () => {},
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

    let chosen = '';
    let reason = '';
    let finalSolution = null;

    const formatLocal = r => Array.isArray(r) ? r.join(' ') : r;

    if (v1 && v2) {
      if (moves2.length <= moves1.length) {
        chosen = 'local';
        finalSolution = formatLocal(res2);
        reason = `both under 100ms (local: ${time2.toFixed(1)}ms, std: ${time1.toFixed(1)}ms), local has fewer or equal moves (${moves2.length} vs ${moves1.length})`;
      } else {
        chosen = 'standard';
        finalSolution = rawRes1;
        reason = `both under 100ms (std: ${time1.toFixed(1)}ms, local: ${time2.toFixed(1)}ms), standard has fewer moves (${moves1.length} vs ${moves2.length})`;
      }
    } else if (v2) {
      chosen = 'local';
      finalSolution = formatLocal(res2);
      reason = `only local finished under 100ms (${time2.toFixed(1)}ms vs std: ${time1.toFixed(1)}ms)`;
    } else if (v1) {
      chosen = 'standard';
      finalSolution = rawRes1;
      reason = `only standard finished under 100ms (${time1.toFixed(1)}ms vs local: ${time2.toFixed(1)}ms)`;
    } else {
      if (moves1 && moves2) {
        if (moves2.length <= moves1.length) {
          chosen = 'local';
          finalSolution = formatLocal(res2);
          reason = `neither under 100ms, local fallback has fewer or equal moves (${moves2.length} vs ${moves1.length})`;
        } else {
          chosen = 'standard';
          finalSolution = rawRes1;
          reason = `neither under 100ms, standard fallback has fewer moves (${moves1.length} vs ${moves2.length})`;
        }
      } else if (moves2) {
        chosen = 'local';
        finalSolution = formatLocal(res2);
        reason = 'only local returned a solution';
      } else if (moves1) {
        chosen = 'standard';
        finalSolution = rawRes1;
        reason = 'only standard returned a solution';
      }
    }

    postMessage({ type: 'log', message: `Solver chosen: ${chosen} | Reason: ${reason}` });

    if (finalSolution) {
      postMessage({ type: 'solution', solution: finalSolution });
    } else {
      postMessage({ type: 'error', message: 'aucune solution trouvée' });
    }
  }
};