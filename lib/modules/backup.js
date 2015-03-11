/**
 * Backup module. Checks for the existance of a file to notify a backup is
 * running, otherwise displays the delta since the last run.
 *
 * @module modules/backup
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
	if (fs.existsSync(config.backingUp)) {
		return next(null, ' BACKUP IN PROGRESS');
	}

	if (!fs.existsSync(config.lastBackup)) {
		return next(null, 'No previous backup');
	}

	var lastBackup = fs.statSync(config.lastBackup).atime,
		lastMinutes = Math.round((Date.now() - lastBackup.getTime()) / 60000),
		lastHours = 0,
		hours = lastBackup.getHours(),
		minutes = lastBackup.getMinutes(),
		suffix = 'am';

	if (lastMinutes > 60) {
		lastHours = Math.floor(lastMinutes / 60);
		lastMinutes = lastMinutes % 60;
	}

	if (hours > 11) {
		suffix = 'pm';
		hours -= 12;
	}

	if (minutes < 10) {
		minutes = '0' + minutes;
	}

	next(null, [
		'Last backup:',
		'  ' + (lastHours ? lastHours + 'h ' : '') + lastMinutes + 'm ago',
		'  ' + (lastBackup.getMonth() + 1) + '/' + lastBackup.getDate() + ' ' + hours + ':' + minutes + suffix
	]);
}
