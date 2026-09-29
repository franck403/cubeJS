const local = (() => {
    const SETTINGS = {
        phase1MaxDepth: 12,
        phase2MaxDepth: 18,
        hardMaxLen: 30,
    };

    const N_TWIST = 2187, N_FLIP = 2048, N_SLICE = 495, N_PERM8 = 40320, N_PERM4 = 24;
    const P2_MOVES = [0, 1, 2, 9, 10, 11, 4, 7, 13, 16];
    const MOVE_FACE = m => (m / 3) | 0;
    const IS_G1_MOVE = Array.from({ length: 18 }, (_, m) => MOVE_FACE(m) === 0 || MOVE_FACE(m) === 3 || m % 3 === 1);

    function allowed(last, m) {
        if (last < 0) return true;
        const fl = MOVE_FACE(last), fm = MOVE_FACE(m);
        if (fl === fm) return false;
        if ((fl + 3) % 6 === fm && fl > fm) return false;
        return true;
    }

    function permRank(a, n) {
        let r = 0;
        for (let i = 0; i < n - 1; i++) {
            let c = 0;
            for (let j = i + 1; j < n; j++) if (a[j] < a[i]) c++;
            r = r * (n - i) + c;
        }
        return r;
    }

    function permUnrank(idx, n, out) {
        const d = new Array(n).fill(0);
        for (let i = n - 2; i >= 0; i--) { d[i] = idx % (n - i); idx = (idx / (n - i)) | 0; }
        const pool = []; for (let i = 0; i < n; i++) pool.push(i);
        for (let i = 0; i < n; i++) out[i] = pool.splice(d[i], 1)[0];
        return out;
    }

    function setTwist(c, t) {
        let s = 0;
        for (let i = 6; i >= 0; i--) { c.co[i] = t % 3; s += c.co[i]; t = (t / 3) | 0; }
        c.co[7] = (3 - s % 3) % 3;
    }

    function setFlip(c, t) {
        let s = 0;
        for (let i = 10; i >= 0; i--) { c.eo[i] = t % 2; s += c.eo[i]; t = (t / 2) | 0; }
        c.eo[11] = s % 2;
    }

    function setSliceMask(c, mask) {
        let sl = 8, ot = 0;
        for (let j = 0; j < 12; j++) c.ep[j] = (mask >> j & 1) ? sl++ : ot++;
    }

    function buildPrune(nA, nB, mA, mB, nm, startA, startB) {
        const size = nA * nB, d = new Int8Array(size).fill(-1), q = new Int32Array(size);
        let head = 0, tail = 0;
        q[tail++] = startA * nB + startB; d[q[0]] = 0;
        while (head < tail) {
            const s = q[head++], a = (s / nB) | 0, b = s - a * nB, nd = d[s] + 1;
            for (let m = 0; m < nm; m++) {
                const ns = mA[a * nm + m] * nB + mB[b * nm + m];
                if (d[ns] < 0) { d[ns] = nd; q[tail++] = ns; }
            }
        }
        return d;
    }

    let T = null;
    function init() {
        if (T) return T;
        const MV = Cube.MV, t = {};
        const maskIdx = new Int16Array(4096).fill(-1), maskList = [];
        for (let m = 0; m < 4096; m++) { let b = 0; for (let i = 0; i < 12; i++) if (m >> i & 1) b++; if (b === 4) { maskIdx[m] = maskList.length; maskList.push(m); } }
        t.maskIdx = maskIdx; t.solvedSlice = maskIdx[0xF00];

        const tw = new Int16Array(N_TWIST * 18), fl = new Int16Array(N_FLIP * 18), sl = new Int16Array(N_SLICE * 18);
        const c = new Cube();
        for (let i = 0; i < N_TWIST; i++) {
            setTwist(c, i);
            for (let m = 0; m < 18; m++) { const b = MV[m]; let r = 0; for (let k = 0; k < 7; k++) r = 3 * r + (c.co[b.cp[k]] + b.co[k]) % 3; tw[i * 18 + m] = r; }
        }
        for (let i = 0; i < N_FLIP; i++) {
            setFlip(c, i);
            for (let m = 0; m < 18; m++) { const b = MV[m]; let r = 0; for (let k = 0; k < 11; k++) r = 2 * r + (c.eo[b.ep[k]] + b.eo[k]) % 2; fl[i * 18 + m] = r; }
        }
        for (let i = 0; i < N_SLICE; i++) {
            setSliceMask(c, maskList[i]);
            for (let m = 0; m < 18; m++) { const b = MV[m]; let mask = 0; for (let k = 0; k < 12; k++) if (c.ep[b.ep[k]] >= 8) mask |= 1 << k; sl[i * 18 + m] = maskIdx[mask]; }
        }

        const mc = new Int32Array(N_PERM8 * 10), me = new Int32Array(N_PERM8 * 10), ms = new Int16Array(N_PERM4 * 10);
        const p = new Array(8), q = new Array(8), p4 = new Array(4), q4 = new Array(4);
        for (let i = 0; i < N_PERM8; i++) {
            permUnrank(i, 8, p);
            for (let k = 0; k < 10; k++) {
                const b = MV[P2_MOVES[k]];
                for (let j = 0; j < 8; j++) q[j] = p[b.cp[j]]; mc[i * 10 + k] = permRank(q, 8);
                for (let j = 0; j < 8; j++) q[j] = p[b.ep[j]]; me[i * 10 + k] = permRank(q, 8);
            }
        }
        for (let i = 0; i < N_PERM4; i++) {
            permUnrank(i, 4, p4);
            for (let k = 0; k < 10; k++) { const b = MV[P2_MOVES[k]]; for (let j = 0; j < 4; j++) q4[j] = p4[b.ep[8 + j] - 8]; ms[i * 10 + k] = permRank(q4, 4); }
        }
        t.tw = tw; t.fl = fl; t.sl = sl; t.mc = mc; t.me = me; t.ms = ms;
        t.pTS = buildPrune(N_TWIST, N_SLICE, tw, sl, 18, 0, t.solvedSlice);
        t.pFS = buildPrune(N_FLIP, N_SLICE, fl, sl, 18, 0, t.solvedSlice);
        t.pCS = buildPrune(N_PERM8, N_PERM4, mc, ms, 10, 0, 0);
        t.pES = buildPrune(N_PERM8, N_PERM4, me, ms, 10, 0, 0);
        return (T = t);
    }

    const isTimeout = e => e && (e.name === 'TimeoutError' || e.message === 'timeout');

    function phase2(c, e, s, limit, last, ctx) {
        const { mc, me, ms, pCS, pES } = T, path2 = [];
        function rec(c, e, s, rem, last) {
            ctx.tick();
            if (rem === 0) return c === 0 && e === 0 && s === 0;
            for (let k = 0; k < 10; k++) {
                const m = P2_MOVES[k];
                if (!allowed(last, m)) continue;
                const nc = mc[c * 10 + k], ne = me[e * 10 + k], ns = ms[s * 10 + k];
                if (Math.max(pCS[nc * 24 + ns], pES[ne * 24 + ns]) > rem - 1) continue;
                path2.push(m);
                if (rec(nc, ne, ns, rem - 1, m)) return true;
                path2.pop();
            }
            return false;
        }
        const h0 = Math.max(pCS[c * 24 + s], pES[e * 24 + s]);
        for (let d = h0; d <= limit; d++) { path2.length = 0; if (rec(c, e, s, d, last)) return path2.slice(); }
        return null;
    }

    function solve(cube, ctx) {
        init();
        if (cube.isSolved()) return [];
        const { tw, fl, sl, pTS, pFS, maskIdx, solvedSlice } = T;
        const target = ctx.maxLen || 22;
        const t0 = performance.now();
        const tw0 = cube.twist(), fl0 = cube.flip(), sl0 = maskIdx[cube.sliceMask()];
        const path = [];
        let best = null;

        function tryPhase2(last) {
            const c = cube.clone().moves(path);
            const cc = permRank(c.cp, 8), ee = permRank(c.ep.slice(0, 8), 8), ss = permRank(c.ep.slice(8).map(v => v - 8), 4);
            const limit = Math.min(SETTINGS.phase2MaxDepth, (best ? best.length - 1 : SETTINGS.hardMaxLen) - path.length);
            if (limit < 0) return false;
            const p2 = phase2(cc, ee, ss, limit, last, ctx);
            if (!p2) return false;
            best = path.concat(p2);
            ctx.log('len ' + best.length + ' (p1=' + path.length + ' + p2=' + p2.length + ') @ ' + (performance.now() - t0).toFixed(0) + ' ms');
            return best.length <= target;
        }

        function rec1(t, f, s, rem, last) {
            ctx.tick();
            if (rem === 0) {
                if (t !== 0 || f !== 0 || s !== solvedSlice) return false;
                if (last >= 0 && IS_G1_MOVE[last]) return false;
                return tryPhase2(last);
            }
            for (let m = 0; m < 18; m++) {
                if (!allowed(last, m)) continue;
                const nt = tw[t * 18 + m], nf = fl[f * 18 + m], ns = sl[s * 18 + m];
                if (Math.max(pTS[nt * N_SLICE + ns], pFS[nf * N_SLICE + ns]) > rem - 1) continue;
                path.push(m);
                if (rec1(nt, nf, ns, rem - 1, m)) return true;
                path.pop();
            }
            return false;
        }

        try {
            const h0 = Math.max(pTS[tw0 * N_SLICE + sl0], pFS[fl0 * N_SLICE + sl0]);
            for (let d = h0; d <= SETTINGS.phase1MaxDepth; d++) {
                if (best && d >= best.length) break;
                path.length = 0;
                if (rec1(tw0, fl0, sl0, d, -1)) break;
            }
        } catch (e) {
            if (!isTimeout(e) || !best) throw e;
        }
        if (!best) throw new Error('aucune solution trouvée');
        return best.map(m => Cube.MOVE_NAMES[m]);
    }

    return {
        SETTINGS,
        solve,
        init
    };
})();