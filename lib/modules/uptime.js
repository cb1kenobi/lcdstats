/**
 * Uptime module. Displays how long the system has been powered on.
 *
 * @module modules/uptime
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

var fs = require('fs');

module.exports.run = run;

function run(config, next) {
	var seconds = fs.readFileSync('/proc/uptime').toString().split(' ')[0],
		minutes = 0,
		hours = 0,
		days = 0,
		s = 'Uptime: ';

	if (seconds > 60) {
		minutes = Math.floor(seconds / 60);
		seconds %= 60;
	}

	if (minutes > 60) {
		hours = Math.floor(minutes / 60);
		minutes %= 60;
	}

	if (hours > 24) {
		days = Math.floor(hours / 24);
		hours %= 24;
	}

	days && (s += days + 'd ');
	hours && (s += hours + 'h ');
	minutes && (s += minutes + 'm');

	next(null, s);
}
