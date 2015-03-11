/**
 * Network module. Displays network interface IP address and bandwidth usage.
 *
 * @module modules/net
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

var exec = require('child_process').exec,
	spaces = require('../util').spaces,
	addressRE = /inet addr\:(\S*)/,
	rxRE = /RX bytes\:(\S*)/,
	txRE = /TX bytes\:(\S*)/,
	ifaces = {};

module.exports.init = init;
module.exports.run = run;

function init(config) {
	ifaces[config.interface] = {
		error: null,
		address: '',
		lastRX: 0,
		lastTX: 0,
		inbound: '',
		outbound: ''
	};

	setInterval(function () { query(config) }, 1000);
	query(config);
}

function run(config, next) {
	var name = config.interface,
		s = spaces(name.length + 2);

	if (!ifaces[name]) {
		return next(null, name + ' not found');
	}

	if (ifaces[name].error) {
		return next(null, name + ' error');
	}

	next(null, [
		name + ': ' + ifaces[name].address,
		s + ifaces[name].inbound,
		s + ifaces[name].outbound
	]);
}

function query(config) {
	var name = config.interface;
	exec('ifconfig ' + name, function (err, stdout, stderr) {
		var iface = ifaces[name];
		iface.error = err;
		if (!err) {
			iface.address = stdout.match(addressRE)[1];

			var rx = parseInt(stdout.match(rxRE)[1]),
				tx = parseInt(stdout.match(txRE)[1]);

			if (iface.lastRX) {
				iface.inbound = format(rx - iface.lastRX) + ' in';
				iface.outbound = format(tx - iface.lastTX) + ' out';
			}

			iface.lastRX = rx;
			iface.lastTX = tx;
		}
	});
}

function format(n) {
	n /= 1024;
	if (n > 1024) {
		return (Math.round((n / 1024) * 10) / 10) + 'MB/s';
	}
	return (Math.round(n * 10) / 10) + 'KB/s';
}
