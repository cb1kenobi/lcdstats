/**
 * Disk module. Reports total disk space, amount free, and amount used.
 *
 * @module modules/disk
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
	spaces = require('../util').spaces;

module.exports.run = run;

function run(config, next) {
	if (!config.device) {
		return next();
	}

	exec('df -H ' + config.device, function (err, stdout, stderr) {
		if (err) {
			return next(null, [ config.device, '  not mounted' ]);
		}

		var lines = stdout.split('\n'),
			info = lines.length && lines[1].split(/\s+/);

		if (!info || info.length < 5) {
			return next();
		}

		next(null, [
			info[5] + ': ' + info[1] + ' total',
			'  ' + info[3] + ' free',
			'  ' + info[2] + ' used (' + info[4] + ')'
		]);
	});
}
