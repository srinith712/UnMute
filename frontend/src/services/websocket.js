const WS_BASE_URL = process.env.REACT_APP_WS_URL;

if (!WS_BASE_URL) {
    throw new Error(
        '[UnMute] REACT_APP_WS_URL is not set. ' +
        'Create a .env.development file with REACT_APP_WS_URL=process.env.REACT_APP_WS_URL'
    );
}

/**
 * WebSocket client with auto-reconnect, ping/pong, and message queuing.
 * Provides a clean API to the rest of the app.
 */
class WebSocketService {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.handlers = {};       // event → [callbacks]
        this.msgQueue = [];       // messages queued while disconnected
        this.reconnectTimer = null;
        this.reconnectDelay = 2000;
        this.maxReconnects = 5;
        this.reconnectCount = 0;
        this.pingInterval = null;
        this.intentionalClose = false;
    }

    /* ── Connect ──────────────────────────────────────────────────── */
    connect(roomId) {
        this.roomId = roomId;
        this.intentionalClose = false;
        const token = localStorage.getItem('unmute_token') || '';
        const url = `${WS_BASE_URL}/gd/${roomId}?token=${token}`;

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.reconnectCount = 0;
            this.reconnectDelay = 2000;
            this._emit('connected', { roomId });
            this._flushQueue();
            this._startPing();
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'pong') return;
                this._emit('message', data);
                if (data.type) this._emit(data.type, data);
            } catch {
                this._emit('message', { raw: event.data });
            }
        };

        this.socket.onclose = (event) => {
            this._stopPing();
            this._emit('disconnected', { code: event.code, reason: event.reason });
            if (!this.intentionalClose && this.reconnectCount < this.maxReconnects) {
                this._scheduleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            this._emit('error', error);
        };
    }

    /* ── Disconnect ───────────────────────────────────────────────── */
    disconnect() {
        this.intentionalClose = true;
        this._stopPing();
        clearTimeout(this.reconnectTimer);
        if (this.socket) {
            this.socket.close(1000, 'User left');
            this.socket = null;
        }
        this.roomId = null;
        this.msgQueue = [];
    }

    /* ── Send message ─────────────────────────────────────────────── */
    send(type, payload = {}) {
        const msg = JSON.stringify({ type, payload, ts: Date.now() });
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
        } else {
            this.msgQueue.push(msg);
        }
    }

    /* ── Event subscription ───────────────────────────────────────── */
    on(event, callback) {
        if (!this.handlers[event]) this.handlers[event] = [];
        this.handlers[event].push(callback);
        return () => this.off(event, callback); // returns unsubscribe function
    }

    off(event, callback) {
        if (!this.handlers[event]) return;
        this.handlers[event] = this.handlers[event].filter(cb => cb !== callback);
    }

    /* ── Connection state ─────────────────────────────────────────── */
    get isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    get state() {
        if (!this.socket) return 'closed';
        const states = { 0: 'connecting', 1: 'open', 2: 'closing', 3: 'closed' };
        return states[this.socket.readyState] || 'unknown';
    }

    /* ── Private helpers ──────────────────────────────────────────── */
    _emit(event, data) {
        (this.handlers[event] || []).forEach(cb => {
            try { cb(data); } catch (e) { console.error('WS handler error', e); }
        });
    }

    _flushQueue() {
        while (this.msgQueue.length && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(this.msgQueue.shift());
        }
    }

    _scheduleReconnect() {
        this.reconnectCount++;
        this._emit('reconnecting', { attempt: this.reconnectCount, delay: this.reconnectDelay });
        this.reconnectTimer = setTimeout(() => {
            if (this.roomId) this.connect(this.roomId);
        }, this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15000);
    }

    _startPing() {
        this.pingInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 25000);
    }

    _stopPing() {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
    }
}

/* Export a singleton */
const wsService = new WebSocketService();
export default wsService;
