eruda.add(function (eruda) {
    class MovementTester extends eruda.Tool {
        constructor() {
            super();
            this.name = 'Movement Tester';
            this.style = eruda.util.evalCss(`
                .eruda-movement-tester {
                    padding: 10px;
                    font-family: monospace;
                }
                .eruda-movement-tester .title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-align: center;
                }
                .eruda-movement-tester .button-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 5px;
                    margin-bottom: 10px;
                }
                .eruda-movement-tester button {
                    padding: 8px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    background: #4CAF50;
                    color: white;
                }
                .eruda-movement-tester button:hover {
                    background: #45a049;
                }
                .eruda-movement-tester .log {
                    margin-top: 10px;
                    padding: 5px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    max-height: 100px;
                    overflow-y: auto;
                    font-size: 12px;
                    background: #f9f9f9;
                }
                .eruda-movement-tester .error {
                    color: red;
                }
                .eruda-movement-tester .success {
                    color: green;
                }
            `);
        }
        init($el) {
            super.init($el);
            this._$el = $el;
            this._$el.addClass('eruda-movement-tester');
            this._$el.html(`
                <div class="title">Movement Tester</div>
                <div class="button-grid">
                    <button onclick='handleMove("U")'>U</button>
                    <button onclick='handleMove("U",true)'>U'</button>
                    <button onclick='handleMove("U2")'>U2</button>
                    <button onclick='handleMove("L")'>L</button>
                    <button onclick='handleMove("L",true)'>L'</button>
                    <button onclick='handleMove("L2")'>L2</button>
                    <button onclick='handleMove("F")'>F</button>
                    <button onclick='handleMove("F",true)'>F'</button>
                    <button onclick='handleMove("F2")'>F2</button>
                    <button onclick='handleMove("R")'>R</button>
                    <button onclick='handleMove("R",true)'>R'</button>
                    <button onclick='handleMove("R2")'>R2</button>
                    <button onclick='handleMove("B")'>B</button>
                    <button onclick='handleMove("B",true)'>B'</button>
                    <button onclick='handleMove("B2")'>B2</button>
                    <button onclick='handleMove("D")'>D</button>
                    <button onclick='handleMove("D",true)'>D'</button>
                    <button onclick='handleMove("D2")'>D2</button>
                </div>
                <div class="log" id="movement-log"></div>
            `);

            // Define handleMove in the global scope for onclick
            window.handleMove = (move,reverse) => {
                try {
                    if (reverse) {
                        playMove(move + "'");
                        this._log(`<span class="success">Executed: ${move + "'"}</span>`);
                    } else {
                        playMove(move);
                        this._log(`<span class="success">Executed: ${move}</span>`);
                    }
                } catch (error) {
                    this._log(`<span class="error">Error: ${error.message}</span>`);
                }
            };
        }
        _log(message) {
            const logEl = this._$el.find('#movement-log');
            logEl.append(`<div>${message}</div>`);
            logEl.scrollTop = logEl.scrollHeight;
        }
        show() {
            this._$el.show();
        }
        hide() {
            this._$el.hide();
        }
        destroy() {
            super.destroy();
            eruda.util.evalCss.remove(this.style);
            delete window.handleMove; // Clean up
        }
    }
    return new MovementTester();
});


eruda.add(function (eruda) {
    class SpikeCMD extends eruda.Tool {
        constructor() {
            super();
            this.name = 'Spike CMD';

            this.style = eruda.util.evalCss(`
                .eruda-spike-cmd {
                    padding: 10px;
                    font-family: monospace;
                }

                .eruda-spike-cmd .title {
                    text-align: center;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .eruda-spike-cmd .input {
                    display: flex;
                    gap: 5px;
                }

                .eruda-spike-cmd input {
                    flex: 1;
                    padding: 6px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }

                .eruda-spike-cmd button {
                    padding: 6px 10px;
                    border: none;
                    border-radius: 4px;
                    background: #2196F3;
                    color: white;
                    cursor: pointer;
                }

                .eruda-spike-cmd button:hover {
                    background: #1976D2;
                }

                .eruda-spike-cmd .log {
                    margin-top: 10px;
                    max-height: 150px;
                    overflow-y: auto;
                    background: #111;
                    color: #0f0;
                    padding: 5px;
                    font-size: 12px;
                }

                .eruda-spike-cmd .err { color: red; }
                .eruda-spike-cmd .ok { color: #0f0; }
            `);
        }

        init($el) {
            super.init($el);
            this._$el = $el;
            this._$el.addClass('eruda-spike-cmd');

            this._$el.html(`
                <div class="title">Spike CMD</div>

                <div class="input">
                    <input id="cmd-input" placeholder='ex: R U R\' | left:print("hi") | scramble'>
                    <button id="run">Run</button>
                </div>

                <div class="log" id="cmd-log"></div>
            `);

            const input = this._$el.find('#cmd-input');
            const btn = this._$el.find('#run');

            btn.on('click', () => this._run(input.val()));
            input.on('keydown', (e) => {
                if (e.key === 'Enter') this._run(input.val());
            });
        }

        async _run(cmd) {
            if (!cmd) return;

            this._log(`> ${cmd}`);

            try {
                cmd = cmd.trim();

                // =========================
                // BUILT-IN COMMANDS
                // =========================
                if (cmd === 'scramble') {
                    await scramble();
                    return this._ok('Scramble started');
                }

                if (cmd === 'solve') {
                    solve();
                    return this._ok('Solve requested');
                }

                if (cmd === 'reset') {
                    await resetMotors();
                    return this._ok('Motors reset');
                }

                if (cmd === 'connect') {
                    await fullConnect();
                    return this._ok('Connecting...');
                }

                // =========================
                // SEND RAW TO SPIKE
                // =========================
                if (cmd.startsWith('left:')) {
                    const code = cmd.slice(5);
                    await sendLine(leftWriter, code);
                    return this._ok('Sent to LEFT');
                }

                if (cmd.startsWith('right:')) {
                    const code = cmd.slice(6);
                    await sendLine(rightWriter, code);
                    return this._ok('Sent to RIGHT');
                }

                // =========================
                // ARRAY EXEC
                // =========================
                if (cmd.startsWith('[')) {
                    const arr = eval(cmd); // expects ["R","U"]
                    await spikeCube(arr);
                    return this._ok('Sequence executed');
                }

                // =========================
                // SINGLE OR MULTI MOVES
                // =========================
                const moves = cmd.split(/\s+/);

                if (moves.length === 1) {
                    await spikeMove(moves[0]);
                    return this._ok(`Move ${moves[0]}`);
                } else {
                    await spikeCube(moves);
                    return this._ok(`Moves: ${moves.join(' ')}`);
                }

            } catch (err) {
                this._err(err.message || err);
            }
        }

        _log(msg) {
            const el = this._$el.find('#cmd-log');
            el.append(`<div>${msg}</div>`);
            el.scrollTop(el[0].scrollHeight);
        }

        _ok(msg) {
            this._log(`<span class="ok">${msg}</span>`);
        }

        _err(msg) {
            this._log(`<span class="err">${msg}</span>`);
        }

        show() { this._$el.show(); }
        hide() { this._$el.hide(); }

        destroy() {
            super.destroy();
            eruda.util.evalCss.remove(this.style);
        }
    }

    return new SpikeCMD();
});