'use strict';

const { EventEmitter } = require('events');

const WebSocket = require('./WebSocket');
const { OPCodes, CloseCodes } = require('./Constants');

class ListenMoeV4 extends EventEmitter {
	/**
	 * Creates a ListenMoeV4 object
	 *
	 * @param {string?} token A JWT from listen.moe
	 */
	constructor(token) {
		super();

		this._socket = new WebSocket('wss://listen.moe/gateway', token);
		this._socket.forwardEvents(this);

		this._data = null;

		this.on('message', (pkt) => {
			if (!pkt.t && !pkt.d) return;

			switch (pkt.t) {
				case 'TRACK_UPDATE':
					this._data = pkt.d;
					this.emit('updateTrack', this._data);
					break;
			}
		});
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

function ListenMoeJS(...args) {
	return new ListenMoeV4(...args);
}

ListenMoeJS.ListenMoeJS = ListenMoeV4;
ListenMoeJS.OPCodes = OPCodes;
ListenMoeJS.CloseCodes = CloseCodes;

module.exports = ListenMoeJS;
