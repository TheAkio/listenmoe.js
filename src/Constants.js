'use strict';

module.exports.Gateway = {
	v4: 'wss://listen.moe/gateway',
};

module.exports.Gateway.latest = module.exports.Gateway.v4;

module.exports.OPCodes = {
	// OP 0 goes in both directions
	IDENTIFY: 0,
	MESSAGE_IN: 1,
	MESSAGE_OUT: 2,
	HEARTBEAT: 9,
	HBACK: 10,
};

module.exports.CloseCodes = {
	MANUAL: 0,
	BY_PEER: 1,
	ERROR: 2,
	TIMEOUT: 3,
};
