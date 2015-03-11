# lcdstats

Displays system information on a [CrystalFontz 634 4x20 LCD display](https://www.crystalfontz.com/products/select_kit.html).

![lcdstats](https://www.evernote.com/shard/s75/sh/124401d9-7a08-4327-b56d-a12fdcf4d865/4f003193277eb686/res/ecb525a6-0468-41b0-adf2-ea0aaa4921c3/lcdstats.png?resizeSmall&width=832)

* Disk usage
* Memory usage
* Fan speed and temperature
* Backup status
* Uptime
* CPU load
* Network I/O
* IP address
* Smart hard drive
* MD RAID health

# Requirements

* [Ubuntu](http://www.ubuntu.com)-based Linux distro (others may work)
* [io.js](https://iojs.org) v1.0+ or [Node.js](https://nodejs.org/) v0.10+
* GCC
* lm-sensors (optional)

# Installation

```bash
sudo apt-get install build-essential lm-sensors
sudo npm install -g lcdstats
```

To start lcdstats during boot, it is recommended that you use the handy dandy
[upstarter](https://www.npmjs.com/package/upstarter) npm module.

```bash
cd /usr/local/lib/node_modules/lcdstats
sudo npm install -g upstarter
sudo upstarter
```

Upstarter will prompt you for a bunch of questions:

```
Upstart service name (lcdstats):
Command(s) to run: (hit enter twice when done)
lcdstats

Upstart service description (System info marquee designed for LCD displays):
Log output to /var/log/upstart? (y/n): n
System user to run under (root):
Set max file descriptors (1000000):
Working directory for process (/files/lcdstats): /tmp
Respawn automatically? (y/n): y
```

Finally start the service:

``` bash
sudo service lcdstats start
```

# Configuration

Copy the `conf/settings.example.js` file to `conf/settings.js`, then edit it and
configure which modules you want to display.

```javascript
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
```

You may have more than one of a specific module. For example, you can have two
modules set for displaying `/dev/sda1` and `/dev/sdb1`.

# Debug

You run lcdstats in a sort of "debug" mode by specifying the `--debug` flag:

```bash
lcdstats --debug
```

# License

(The MIT License)

Copyright (c) 2013-2015 Chris Barber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
