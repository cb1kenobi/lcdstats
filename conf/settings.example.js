'use strict';

module.exports = {
	device: '/dev/ttyUSB0',
	bitrate: 19200,
	refreshInterval: 2000,
	modules: [
		{ name: 'disk', device: '/dev/sda1' },
		// { name: 'mdraid', device: '/dev/md0' },
		{ name: 'memory' },
		{ name: 'sensors' },
		{ name: 'uptime' },
		{ name: 'loadavg' },
		{ name: 'backup', lastBackup: '/var/run/last-backup', backingUp: '/tmp/backing-up' },
		{ name: 'net', interface: 'eth0' }
	],
};
