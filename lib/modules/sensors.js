/**
 * Sensors module. Requires lmsensors to be installed.
 *
 *    apt-get install lm-sensors
 *
 * @module modules/sensors
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

var executable = null,
	exec = require('child_process').exec,
	cpuFanRE = /CPU FAN Speed\:\s+(\d+ RPM)/,
	chassisFanRE = /CHASSIS FAN Speed\:\s+(\d+ RPM)/,
	cpuTempRE = /CPU Temperature\:\s+\+([^\s]*)/,
	mbTempRE = /MB Temperature\:\s+\+([^\s]*)/;

module.exports.init = init;
module.exports.run = run;

function init(config, next) {
	exec('which sensors', function (err, stdout, stderr) {
		executable = err ? null : stdout.trim();
		next();
	});
}

function run(config, next) {
	if (executable) {
		exec(executable, function (err, stdout, stderr) {
			if (err) {
				return next(null, 'lmsensors error: ' + err.code);
			}

			var cpuFan = stdout.match(cpuFanRE)[1].replace(' ', ''),
				chassisFan = stdout.match(chassisFanRE)[1].replace(' ', ''),
				cpuTemp = stdout.match(cpuTempRE)[1].replace('°', ''),
				mbTemp = stdout.match(mbTempRE)[1].replace('°', '');

			next(null, [
				'CPU: ' + cpuTemp + ' ' + cpuFan,
				'MB:  ' + mbTemp + ' ' + chassisFan
			]);
		});
	} else {
		next(null, 'No lmsensors');
	}
}
