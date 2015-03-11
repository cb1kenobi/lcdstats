/**
 * MD RAID module. Checks the health of an MD RAID drive.
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

var fs = require('fs');

module.exports.run = run;

function run(config, next) {
	if (!config.device) {
		return next();
	}

    var device = config.device.split('/').pop(),
        personalitiesRE = /^Personalities/i,
        deviceRE = new RegExp('^' + device + ' : '),
        mdstat = fs.readFileSync('/proc/mdstat').toString().trim();

    // strip the first line and
    if (personalitiesRE.test(mdstat)) {
        mdstat = mdstat.split('\n').slice(1).join('\n');
    }

    var chunk = mdstat.split('\n\n');

    for (var i = 0, len = chunk.length; i < len; i++) {
        if (deviceRE.test(chunk[i])) {
            var lines = chunk[i].split('\n'),
                status = lines[0].substring(lines[0].indexOf(':') + 1).trim().split(' ')[0],
                health = lines[1].split(' ').pop();
            return next(null, [
                device + ': ' + status + ' ' + health
            ]);
        }
    }

    next();
}
