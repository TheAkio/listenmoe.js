'use strict';
/* global describe, it */

/**
 * This might be a pretty bad test because it depends on the damn WebSocket working properly
 * This is mainly for me just checking if things work out in general
 */

const assert = require('assert');

const { ListenMoeJS } = require('../src/index');
const listenMoeJs = require('../src/index');

let moe = null;

describe('ListenMoe.js', () => {
	it('should initialize via constructor', () => {
		moe = new ListenMoeJS();
	});
	it('should initialize via function', () => {
		moe = listenMoeJs();
		moe = new listenMoeJs();
		moe.on('error', () => {
			// Ignore
		});
	});
	it('should connect to the websocket', () => {
		assert(!!moe);
		return new Promise((resolve) => {
			moe._socket.once('open', () => {
				resolve();
			});

			moe.connect();
		});
	}).timeout(15000);
	it('should have a track or receive one', () => {
		assert(!!moe);
		assert(moe._socket.connected);
		return new Promise((resolve) => {
			if (!moe.getCurrentTrack()) {
				moe.once('updateTrack', () => {
					resolve();
				});
			} else {
				resolve();
			}
		});
	});
	it('should close the connection', () => {
		assert(!!moe);
		assert(moe._socket.connected);
		return new Promise((resolve) => {
			moe._socket.on('close', () => {
				resolve();
			});

			moe.disconnect();
		});
	});
});
