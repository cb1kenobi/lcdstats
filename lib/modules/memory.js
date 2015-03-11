/**
 * Memory module. Displays amount of free and used memory.
 *
 * @module modules/memory
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
	formatSize = require('../util').formatSize;

module.exports.run = run;

function run(config, next) {
	exec('free -b', function (err, stdout, stderr) {
		var lines = stdout.split('\n'),
			total = parseInt(lines[1].split(':')[1].trim().split(/\s+/)[0]),
			used = parseInt(lines[2].split(':')[1].trim().split(/\s+/)[0]);

		next(null, [
			'Mem: ' + formatSize(total - used) + ' free',
			'     ' + formatSize(used) + ' used'
		]);
	});
}
