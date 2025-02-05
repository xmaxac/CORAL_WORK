#!/usr/bin/env node

/**
 *
 * @description cli for aws
 *
 * @author Ian Kelly
 * @copyright Copyright (C) Ian Kelly
 *
 * @license http://opensource.org/licenses/MIT The MIT License
 * 
 */

'use strict';

var Operetta = new require('operetta').Operetta,
	operetta = new Operetta(),
	iam = require('../lib/iam'),
	commands = require('../lib/command-processor');

commands.add(iam);

operetta.parameters('-s', 's');

operetta.start(function (values) {
	commands.execute(values.positional[0], values, function (response) {
		console.log('done');
		console.log(response);
	});
});



