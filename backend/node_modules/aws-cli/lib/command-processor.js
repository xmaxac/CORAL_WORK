
'use strict';

var processors = [];

function add(processor) {
	if (typeof processor !== 'function') {
		throw new Error('processor must be a function');
	}

	processors.push(processor);
}

function execute(commandName, args, next) {

	var index, result;

	for (index = 0; index < processors.length; index++) {
		result = processors[index](commandName, args, next);
		if (!result || !result.status || result.status === 'nf') {
			continue;
		}

		return result;
	}
}

module.exports = {
	add: add,
	execute: execute
};