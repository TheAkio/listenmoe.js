'use strict';

const { EventEmitter } = require('events');

const WebSocket = require('./WebSocket');
const { Gateway, CloseCodes } = require('./Constants');

class ListenMoeJS extends EventEmitter {
	constructor(token) {
		super();

		this._socket = new WebSocket(Gateway.latest, token);

		this._data = null;

		this._socket.on('message', (pkt) => {
			if (!pkt.t && !pkt.d) return;

			switch (pkt.t) {
				case 'TRACK_UPDATE':
					this._data = pkt.d;
					this.emit('updateTrack', this._data);
					break;
			}
		});

		this._socket.on('error', (...args) => {
			this.emit('error', ...args);
		});
	}

	setGateway(gw) {
		this._socket.url = gw;
	}

	connect() {
		this._socket.connect();
	}

	disconnect() {
		this._socket.disconnect();
	}

	getPing() {
		return this._socket.ping;
	}

	getLatencyData() {
		return this._socket.latencyData;
	}

	getCurrentTrack() {
		return this._data;
	}
}

function listenMoeJS(...args) {
	return new ListenMoeJS(...args);
}

listenMoeJS.ListenMoeJS = ListenMoeJS;
listenMoeJS.Gateway = Gateway;
listenMoeJS.CloseCodes = CloseCodes;

module.exports = listenMoeJS;
