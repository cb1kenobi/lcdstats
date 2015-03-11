/**
 * Load average module. Displays the system load averages for the past minute,
 * 5 minutes, and 15 minutes.
 *
 * @module modules/loadavg
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
	next(null, 'Load: ' + fs.readFileSync('/proc/loadavg').toString().split(' ').slice(0, 3).join(' '));
}
