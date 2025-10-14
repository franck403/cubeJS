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
                    <button onclick='handleMove("U\\\'")'>U'</button>
                    <button onclick='handleMove("U2")'>U2</button>
                    <button onclick='handleMove("L")'>L</button>
                    <button onclick='handleMove("L\\\'")'>L'</button>
                    <button onclick='handleMove("L2")'>L2</button>
                    <button onclick='handleMove("F")'>F</button>
                    <button onclick='handleMove("F\\\'")'>F'</button>
                    <button onclick='handleMove("F2")'>F2</button>
                    <button onclick='handleMove("R")'>R</button>
                    <button onclick='handleMove("R\\\'")'>R'</button>
                    <button onclick='handleMove("R2")'>R2</button>
                    <button onclick='handleMove("B")'>B</button>
                    <button onclick='handleMove("B\\\'")'>B'</button>
                    <button onclick='handleMove("B2")'>B2</button>
                    <button onclick='handleMove("D")'>D</button>
                    <button onclick='handleMove("D\\\'")'>D'</button>
                    <button onclick='handleMove("D2")'>D2</button>
                </div>
                <div class="log" id="movement-log"></div>
            `);

            // Define handleMove in the global scope for onclick
            window.handleMove = (move) => {
                try {
                    if (window.SpikeMove && typeof window.SpikeMove === 'function') {
                        window.SpikeMove(move);
                        this._log(`<span class="success">Executed: ${move}</span>`);
                    } else {
                        throw new Error("SpikeMove is not defined or not a function.");
                    }
                } catch (error) {
                    this._log(`<span class="error">Error: ${error.message}</span>`);
                }
            };
        }
        _log(message) {
            const logEl = this._$el.find('#movement-log');
            logEl.append(`<div>${message}</div>`);
            logEl.scrollTop(logEl[0].scrollHeight);
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
