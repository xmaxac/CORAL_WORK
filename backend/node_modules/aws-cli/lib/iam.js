/**
 * @description Command Processor for IAM Commands
 *
 * @copyright Copyright (C) Ian Kelly
 */


'use strict';


var checkArgs = require('./check-args');
var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');

var iam = new aws.IAM();

function serverCertDel(args, next) {

	var request, arg;

	arg = checkArgs(args, '-s', 'string');

	if (arg) {

		request = iam.deleteServerCertificate({
			ServerCertificateName: arg
		});

		request
			.on('error', function (response) {

				console.log(response);
				return next({
					status: 'error',
					response: response
				});

			})
			.on('success', function (response) {

				console.log(response);
				return next({
					status: 'ok',
					response: response
				});

			})
			.send();
			
	} else {

		return next({
			status: 'failed',
			error: 'bad arguments'
		});
	}
}

function execute(commandName, args, next) {

	switch (commandName) {
	case 'iam-servercertdel':
		return serverCertDel(args, next);
	}

	return {
		'status': 'nf'
	};
}

module.exports = execute;