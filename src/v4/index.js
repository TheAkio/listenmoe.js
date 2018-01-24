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

	/**
	 * Connects to the listen.moe WebSocket
	 * Auto-Reconnect is handled automatically
	 */
	connect() {
		this._socket.connect();
	}

	/**
	 * Disconnects from the listen.moe WebSocket
	 */
	disconnect() {
		this._socket.disconnect();
	}

	/**
	 * Returns the average ping to the WebSocket
	 * @returns {number} The ping in milliseconds
	*/
	getPing() {
		return this._socket.ping;
	}

	/**
	 * Returns the last 5 pings
	 * @returns {number[]} An array of pings in milliseconds
	 */
	getLatencyData() {
		return this._socket.latencyData;
	}

	/**
	 * Returns the current track
	 * @returns {any} The current track from the WebSocket
	 */
	getCurrentTrack() {
		return this._data;
	}

	/**
	 * Fetches the current track from the listen.moe WebSocket
	 * @returns {Promise<any>} A promise that resolves with the track data when the data is received
	 */
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
			try {
				this._socket.sendJSON({ op: 2 });
			} catch (e) {
				clearTimeout(timeout);
				this.removeListener('trackUpdateResponse', func);
				reject(e);
			}
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
