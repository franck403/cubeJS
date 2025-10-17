eruda.add(function (eruda) {
    class MovementTester extends eruda.Tool {
        constructor() {
            super();
            this.name = 'Movement Store';
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
                    max-height: 80%;
                    overflow-y: auto;
                    font-size: 12px;
                    background: #f9f9f9;                    
                    display: flex;
                    flex-direction: column-reverse;
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
                <div class="title">Movement store</div>
                <div class="log" id="current-movement-logs"></div>
                <div class="log" id="movement-log"></div>
            `);
            var lastedStore = []
            setInterval(() => {
                const currentEl = this._$el.find('#current-movement-logs')[0];
                const logEl = this._$el.find('#movement-log')[0];
            
                currentEl.textContent = JSON.stringify(store);
            
                if (JSON.stringify(lastedStore) === JSON.stringify(store)) return;
            
                let result = store.slice();
                for (let x of lastedStore) {
                    let i = result.indexOf(x);
                    if (i !== -1) result.splice(i, 1);
                }
            
                const shouldStick = logEl.scrollTop + logEl.clientHeight >= logEl.scrollHeight - 5;
                const div = document.createElement('div');
                div.textContent = JSON.stringify(result);
                logEl.appendChild(div);
            
                if (shouldStick) logEl.scrollTop = logEl.scrollHeight;
            
                lastedStore = store.slice();
                Soupdate()
            }, 50);
        }
        _log(message) {
            const logEl = this._$el.find('#movement-log');
            logEl.append(`<div>${message}</div>`);
            logEl.scrollHeight = logEl.scrollHeight;
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
