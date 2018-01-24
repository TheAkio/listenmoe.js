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

		const handleIncomingTrack = (pkt) => {
			this.emit('updateData', pkt.d);
			if (this._data && pkt.d.song.id === this._data.song.id) {
				this._data = pkt.d;
			} else {
				// I want the data to be update before the event is emitted
				this._data = pkt.d;
				this.emit('updateTrack', this._data);
			}

			if (pkt.t === 'TRACK_UPDATE_REQUEST') {
				this.emit('trackUpdateResponse', this._data);
			}
		};

		this.on('message', (pkt) => {
			if (!pkt.t && !pkt.d) return;

			switch (pkt.t) {
				case 'TRACK_UPDATE':
				case 'TRACK_UPDATE_REQUEST':
					handleIncomingTrack(pkt);
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

	fetchTrack() {
		return new Promise((resolve, reject) => {
			const func = (d) => {
				clearTimeout(timeout);
				resolve(d);
			};

			const timeout = setTimeout(() => {
				this.removeListener('trackUpdateResponse', func);
				reject(new Error('Track request took too long'));
			}, 5000);

			this.once('trackUpdateResponse', func);
			this._socket.sendJSON({ op: 2 });
		});
	}
}

function ListenMoeJS(...args) {
	return new ListenMoeV4(...args);
}

ListenMoeJS.ListenMoeJS = ListenMoeV4;
ListenMoeJS.OPCodes = OPCodes;
ListenMoeJS.CloseCodes = CloseCodes;

module.exports = ListenMoeJS;
