

'use strict';


module.exports = function (args, name, type) {

	var allArgs, firstArg;

	if (!args || typeof args !== 'object') {
		return null;
	}

	allArgs = args[name];

	if (!Array.isArray(allArgs)) {
		return null;
	}

	var firstArg = args[name][0];

	if (typeof firstArg !== type) {
		return null;
	}

	return firstArg;
}