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
                    grid-template-columns: repeat(3, 1fr);
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
            `);
        }
        init($el) {
            super.init($el);
            this._$el = $el;
            this._$el.addClass('eruda-movement-tester');
            this._$el.html(`
                <div class="title">Movement Tester</div>
                <div class="button-grid">
                    <!-- Left Side -->
                    <button onclick="window.SpikeMove('U')">U</button>
                    <button onclick="window.SpikeMove('U\'')">U'</button>
                    <button onclick="window.SpikeMove('U2')">U2</button>
                    <button onclick="window.SpikeMove('L')">L</button>
                    <button onclick="window.SpikeMove('L\'')">L'</button>
                    <button onclick="window.SpikeMove('L2')">L2</button>
                    <button onclick="window.SpikeMove('F')">F</button>
                    <button onclick="window.SpikeMove('F\'')">F'</button>
                    <button onclick="window.SpikeMove('F2')">F2</button>
                    <!-- Right Side -->
                    <button onclick="window.SpikeMove('R')">R</button>
                    <button onclick="window.SpikeMove('R\'')">R'</button>
                    <button onclick="window.SpikeMove('R2')">R2</button>
                    <button onclick="window.SpikeMove('B')">B</button>
                    <button onclick="window.SpikeMove('B\'')">B'</button>
                    <button onclick="window.SpikeMove('B2')">B2</button>
                    <button onclick="window.SpikeMove('D')">D</button>
                    <button onclick="window.SpikeMove('D\'')">D'</button>
                    <button onclick="window.SpikeMove('D2')">D2</button>
                </div>
                <div class="log" id="movement-log"></div>
            `);
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
        }
    }
    return new MovementTester();
});
