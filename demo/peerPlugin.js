eruda.add(function (eruda) {
    const { evalCss } = eruda.util;

    class PeerJSInspector extends eruda.Tool {
        constructor() {
            super();
            this.name = 'PeerJS';
            this.style = evalCss(`
                .eruda-peerjs {
                    padding: 10px;
                    font-family: monospace;
                }
                .eruda-peerjs button {
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    padding: 5px 10px;
                    cursor: pointer;
                    margin-right: 6px;
                }
                .eruda-peerjs button:hover {
                    background: #1976D2;
                }
                .eruda-peerjs .section {
                    margin-bottom: 10px;
                }
                .eruda-peerjs .log {
                    border: 1px solid #ccc;
                    padding: 6px;
                    font-size: 12px;
                    background: #fafafa;
                    height: 180px;
                    overflow-y: auto;
                }
                .eruda-peerjs select, .eruda-peerjs input {
                    font-family: monospace;
                    padding: 4px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                }
            `);
            this.peer = null;
            this.connections = {};
        }

        init($el) {
            super.init($el);
            this._$el = $el;
            this._$el.addClass('eruda-peerjs');
            this._$el.html(`
                <div class="section">
                    <strong>PeerJS Inspector</strong><br>
                    <input class="peer-id" placeholder="Peer ID or blank to autodetect">
                    <button class="attach">Attach</button>
                    <input class="create-opts" placeholder='Create options JSON'>
                    <button class="create">Create Peer</button>
                </div>
                <div class="section">
                    <div><strong>Peer Info</strong></div>
                    <div class="info"></div>
                </div>
                <div class="section">
                    <div><strong>Connections</strong></div>
                    <div class="conns"></div>
                </div>
                <div class="section">
                    <div><strong>Controls</strong></div>
                    <select class="target"></select>
                    <input class="msg" placeholder="message text or JSON">
                    <button class="send">Send</button>
                    <button class="close">Close</button>
                </div>
                <div class="section">
                    <div><strong>Events</strong></div>
                    <div class="log"></div>
                </div>
            `);

            this._bindUI();
            this._log('PeerJS inspector ready');
        }

        show() {
            this._$el.show();
        }

        hide() {
            this._$el.hide();
        }

        destroy() {
            super.destroy();
            evalCss.remove(this.style);
        }

        _bindUI() {
            const el = this._$el;
            el.find('.attach').on('click', () => this._attachClicked());
            el.find('.create').on('click', () => this._createClicked());
            el.find('.send').on('click', () => this._sendClicked());
            el.find('.close').on('click', () => this._closeClicked());
        }

        _log(text, data) {
            const box = this._$el.find('.log')[0];
            const line = document.createElement('div');
            line.textContent = `[${new Date().toLocaleTimeString()}] ${text}` + (data ? ' ' + JSON.stringify(data) : '');
            box.appendChild(line);
            box.scrollTop = box.scrollHeight;
        }

        _updateInfo() {
            const infoBox = this._$el.find('.info');
            if (!this.peer) {
                infoBox.html('No Peer attached.');
                return;
            }
            infoBox.html(`
                id: ${this.peer.id || '—'}<br>
                disconnected: ${!!this.peer.disconnected}<br>
                destroyed: ${!!this.peer.destroyed}<br>
                connections: ${Object.keys(this.connections).length}
            `);
        }

        _updateConns() {
            const conBox = this._$el.find('.conns');
            const sel = this._$el.find('.target');
            conBox.html('');
            sel.html('');
            Object.entries(this.connections).forEach(([k, c]) => {
                const row = document.createElement('div');
                row.textContent = `${k} (${c.type})`;
                conBox[0].appendChild(row);
                const opt = document.createElement('option');
                opt.value = k;
                opt.textContent = k;
                sel[0].appendChild(opt);
            });
        }

        _attachClicked() {
            const val = this._$el.find('.peer-id').val().trim();
            if (!val && window.peer) {
                this._attachPeer(window.peer);
                this._log('Attached to window.peer');
                return;
            }
            for (const k in window) {
                const v = window[k];
                if (v && v.id === val && typeof v.on === 'function') {
                    this._attachPeer(v);
                    this._log(`Attached to peer ${val}`);
                    return;
                }
            }
            this._log('Peer not found.');
        }

        _createClicked() {
            if (typeof Peer === 'undefined') {
                this._log('PeerJS not loaded.');
                return;
            }
            let opts = {};
            const txt = this._$el.find('.create-opts').val().trim();
            if (txt) {
                try { opts = JSON.parse(txt); } catch (e) {
                    this._log('Invalid JSON in create options.');
                    return;
                }
            }
            try {
                const p = new Peer(opts);
                window.peer = p;
                this._attachPeer(p);
                this._log('New Peer created.');
            } catch (e) {
                this._log('Peer creation failed: ' + e.message);
            }
        }

        _attachPeer(peer) {
            this.peer = peer;
            this.connections = {};
            this._updateInfo();

            peer.on('open', id => {
                this._log('Peer open', id);
                this._updateInfo();
            });
            peer.on('error', err => this._log('Peer error', err.message));
            peer.on('connection', conn => this._registerData(conn));
            peer.on('call', call => this._registerCall(call));
        }

        _registerData(conn) {
            const id = `data:${conn.peer}`;
            this.connections[id] = { type: 'data', conn };
            this._updateConns();
            this._log('Data connection', { id });
            conn.on('open', () => this._log('Data open', id));
            conn.on('data', d => this._log('Data recv', d));
            conn.on('close', () => {
                delete this.connections[id];
                this._updateConns();
                this._log('Data closed', id);
            });
            conn.on('error', e => this._log('Data error', e.message));
        }

        _registerCall(call) {
            const id = `media:${call.peer}`;
            this.connections[id] = { type: 'media', conn: call };
            this._updateConns();
            this._log('Media call', { id });
            call.on('stream', s => this._log('Stream received', { id }));
            call.on('close', () => {
                delete this.connections[id];
                this._updateConns();
                this._log('Call closed', id);
            });
            call.on('error', e => this._log('Call error', e.message));
        }

        _sendClicked() {
            const target = this._$el.find('.target').val();
            const msg = this._$el.find('.msg').val();
            if (!target || !this.connections[target]) {
                this._log('No target.');
                return;
            }
            const c = this.connections[target];
            if (c.type !== 'data') {
                this._log('Only data connections can send.');
                return;
            }
            let payload = msg;
            try { payload = JSON.parse(msg); } catch {}
            try {
                c.conn.send(payload);
                this._log('Sent', payload);
            } catch (e) {
                this._log('Send error', e.message);
            }
        }

        _closeClicked() {
            const target = this._$el.find('.target').val();
            if (!target || !this.connections[target]) {
                this._log('No target to close.');
                return;
            }
            try {
                this.connections[target].conn.close();
                this._log('Closed connection', target);
            } catch (e) {
                this._log('Close error', e.message);
            }
        }
    }

    return new PeerJSInspector();
});
