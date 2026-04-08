/* WebSocket Service */

const WS_BASE_URL =
    process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

/* Service */
class WebSocketService {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.handlers = {};
        this.queue = [];
        this.reconnectAttempts = 0;
        this.maxReconnects = 5;
        this.intentionalClose = false;
    }

    /* Connect */
    connect(roomId) {
        this.roomId = roomId;
        this.intentionalClose = false;

        const token = localStorage.getItem('unmute_token') || '';
        const url = `${WS_BASE_URL}/gd/${roomId}?token=${token}`;

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this._emit('connected');
            this._flushQueue();
        };

        this.socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                this._emit('message', data);
            } catch {
                this._emit('message', { raw: e.data });
            }
        };

        this.socket.onclose = () => {
            this._emit('disconnected');

            if (!this.intentionalClose && this.reconnectAttempts < this.maxReconnects) {
                this.reconnectAttempts++;
                setTimeout(() => this.connect(this.roomId), 2000);
            }
        };

        this.socket.onerror = (err) => {
            this._emit('error', err);
        };
    }

    /* Disconnect */
    disconnect() {
        this.intentionalClose = true;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.roomId = null;
        this.queue = [];
    }

    /* Send */
    send(type, payload = {}) {
        const msg = JSON.stringify({ type, payload });

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
        } else {
            this.queue.push(msg);
        }
    }

    /* Events */
    on(event, cb) {
        if (!this.handlers[event]) this.handlers[event] = [];
        this.handlers[event].push(cb);
    }

    _emit(event, data) {
        (this.handlers[event] || []).forEach(cb => cb(data));
    }

    _flushQueue() {
        while (this.queue.length && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(this.queue.shift());
        }
    }
}

/* Singleton */
const wsService = new WebSocketService();
export default wsService;