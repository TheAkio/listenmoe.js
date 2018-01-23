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
	DISCONNECT: 3001,
	ERROR: 3002,
	READY_TIMEOUT: 3003,
	TIMEOUT: 3004,

	HEARTBEAT_MISSED: 4001,
	INVALID_OPCODE: 4002,
	INVALID_AUTH: 4003,
	ALREADY_AUTHED: 4004,
	PACKET_NEEDS_BODY: 4005,
};
