'use strict';

// eslint-disable-next-line no-undef
const WS = typeof window !== 'undefined' ? window.WebSocket : require('uws');

const { EventEmitter } = require('events');

const { OPCodes, CloseCodes } = require('./Constants');

class WebSocket extends EventEmitter {
	constructor(url, token) {
		super();

		this.url = url;
		this.token = token;

		this.cli = null;
		this.heartbeat = null;

		this.autoReconnect = true;
		this.reconnect = null;

		this.connected = false;
		this.ready = false;

		this._latency = [null, null, null, null, null];
	}

	get ping() {
		const clean = this._latency.filter(l => !!l);
		return clean.reduce((a, b) => a + b, 0) / clean.length;
	}

	get latencyData() {
		return this._latency.filter(l => !!l);
	}

	connect() {
		if (this.cli) this.cli.removeAllListeners();

		this.cli = new WS(this.url);

		this.cli.on('open', this.onOpen.bind(this));
		this.cli.on('message', this.onMessage.bind(this));
		this.cli.on('error', this.onError.bind(this));
		this.cli.on('close', this.onClose.bind(this));
	}

	close(code, reason) {
		this.stopHeartbeat();

		this.connected = false;
		this.ready = false;

		this.cli.terminate();
		this.emit('close', { code, reason });
	}

	disconnect() {
		this.autoReconnect = false;
		this.close(CloseCodes.MANUAL, 'Connection was manually closed.');
	}

	startHeartbeat(ms) {
		if (this.heartbeat) return;
		ms = parseInt(ms) > 1000 ? parseInt(ms) : 1000;
		this.heartbeat = setInterval(() => {
			this.sendHeartbeat();
		}, ms);
	}

	stopHeartbeat() {
		if (!this.heartbeat) return;
		clearInterval(this.heartbeat);
	}

	sendHeartbeat() {
		if (!this.cli || !this.connected) return;

		this.emit('heartbeat');

		const handleLatency = () => {
			this._latency.pop();

			const latencyEnd = process.hrtime(latencyStart);
			const nanoseconds = (latencyEnd[0] * 1e9) + latencyEnd[1];
			const milliseconds = nanoseconds / 1e6;

			this._latency.unshift(milliseconds);
		};

		const handleReply = () => {
			handleLatency();
			this.removeListener('hback', handleReply);
			clearTimeout(timer);
		};

		const timer = setTimeout(() => {
			handleLatency();
			this.removeListener('hback', handleReply);
			this.close(CloseCodes.TIMEOUT, 'Client didn\'t send HBACK inbetween 5 seconds.');
		}, 5 * 1000);

		this.once('hback', handleReply);

		const latencyStart = process.hrtime();

		this.sendJSON({
			op: OPCodes.HEARTBEAT,
		});
	}

	send(raw) {
		return this.cli.send(raw);
	}

	sendJSON(ob) {
		this.emit('raw', { dir: 'out', pkt: ob });
		return this.send(JSON.stringify(ob));
	}

	onOpen() {
		this.connected = true;
		this.ready = false;

		this.sendJSON({
			op: OPCodes.IDENTIFY,
			d: { auth: this.token ? `Bearer ${this.token}` : '' },
		});

		this.emit('open');
	}

	onMessage(d) {
		let pkt = null;
		try {
			pkt = JSON.parse(d.toString());
		} catch (e) {
			return;
		}

		this.emit('raw', { dir: 'in', pkt });

		if (pkt.op == null) return;

		switch (pkt.op) {
			case OPCodes.IDENTIFY:
				if (!pkt.d || !pkt.d.heartbeat) {
					this.onError(new Error('Server sent invalid HELLO packet.'));
					return;
				}

				this.sendHeartbeat();
				this.startHeartbeat(pkt.d.heartbeat);

				this.ready = true;

				this.emit('ready', pkt);
				break;
			case OPCodes.HBACK:
				this.emit('hback');
				break;
			case OPCodes.MESSAGE_IN:
				this.emit('message', pkt);
				break;
		}
	}

	onError(err) {
		this.stopHeartbeat();

		this.connected = false;
		this.ready = false;

		this.emit('error', err);
		this.emit('close', { code: CloseCodes.ERROR, reason: err ? err.message ? err.message : JSON.stringify(err) : err, error: err });

		this.doReconnect();
	}

	onClose() {
		this.stopHeartbeat();

		this.connected = false;
		this.ready = false;

		this.emit('close', { code: CloseCodes.BY_PEER, reason: 'Connection was closed by peer.' });

		this.doReconnect();
	}

	doReconnect() {
		if (!this.reconnect && this.autoReconnect) {
			this.reconnect = setTimeout(() => {
				this.reconnect = null;
				this.connect();
			}, 5 * 1000);
		}
	}
}

module.exports = WebSocket;
