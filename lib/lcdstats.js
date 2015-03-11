/**
 * The main lcdstats control logic. Loads the config file, initializes each
 * module, then continuously calls each module's run function.
 *
 * @module lcdstats
 *
 * @copyright
 * Copyright (c) Copyright (c) 2013-2015 Chris Barber
 *
 * @license
 * Licensed under the terms of the MIT License
 * Please see the LICENSE included with this distribution for details.
 */

'use strict';

if (process.platform !== 'linux') {
	console.error('Sorry, Linux only\n');
	process.exit(1);
}

if (!process.env.SUDO_UID) {
	console.error('You must be root in order for lcdstats to open LCD\'s USB device\n');
	process.exit(1);
}

var async = require('async'),
	config = require("../conf/settings.js"),
	lcd = require("../build/Release/lcdserial"),
	debug = process.argv.indexOf('--debug') !== -1,
	modules = [];

async.eachSeries(config.modules, function (cfg, next) {
	// load the module and initialize it
	var m = require("./modules/" + cfg.name);
	modules.push({
		module: m,
		config: cfg
	});
	if (typeof m.init !== 'function') {
		return next();
	}
	if (m.init.length >= 2) {
		m.init(cfg, next);
	} else {
		m.init(cfg);
		next();
	}
}, function (err) {
	if (err) {
		console.error(err + '\n');
		process.exit(1);
	}

	lcd.connect(config.device, config.bitrate);

	var lines = [],
		moduleIndex = 0;

	(function run() {
		async.whilst(
			function () { return lines.length < 4; },
			function (next) {
				var m = modules[moduleIndex++];
				if (moduleIndex >= modules.length) {
					moduleIndex = 0;
				}

				if (typeof m.module.run !== 'function') {
					return next();
				}

				if (m.module.run.length > 1) {
					m.module.run(m.config, then);
				} else {
					then(null, m.module.run(m.config));
				}

				function then(err, result) {
					if (!err && result) {
						if (Array.isArray(result)) {
							lines = lines.concat(result);
						} else if (typeof result === 'string') {
							lines.push(result);
						}
					}
					next();
				}
			},
			function (err) {
				// render!
				for (var i = 0, len = Math.min(4, lines.length); i < len; i++) {
					debug && console.log(lines[i]);
					lcd.printLine(i, lines[i]);
				}
				lines.shift();
				debug && console.log('********************')

				setTimeout(run, config.refreshInterval);
			}
		);
	})();
});
