/**
 * Backup module. Checks for the existance of a file to notify a backup is
 * running, otherwise displays the delta since the last run.
 *
 * @module util
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

module.exports.formatSize = formatSize;
module.exports.spaces = spaces;

var tripletRE = /\B(?=(\d{3})+(?!\d))/g,
	units = ['B', 'KB', 'MB', 'GB', 'TB'];

function formatSize(size, precision) {
	var precision = precision === undefined ? 1 : precision,
		decimals = Math.pow(10, precision) * 1.0,
		size = Math.max(size, 0),
		pow = Math.min(Math.floor((size ? Math.log(size) : 0) / Math.log(1024)), units.length - 1);
	return ((Math.floor(size / Math.pow(1024, pow) * decimals) * 1.0) / decimals).toString().replace(tripletRE, ',') + units[pow];
}

function spaces(n) {
	var s = '';
	for (var i = 0; i < n; i++) {
		s += ' ';
	}
	return s;
}
