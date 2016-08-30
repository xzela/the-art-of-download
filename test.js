'use strict';

var cluster = require('cluster'),
	http = require('http'),
	nopt = require("nopt"),
	ProgressBar = require('progress'),
	Writable = require('stream').Writable,
	fs = require('fs'),
	cpus = require('os').cpus();

var dates = ['2016-07-15a.zip',
			'2009-05-07.zip',
			'2015-03-13.zip',
			'2015-03-04.zip',
			'2015-01-30.zip',
			'2014-12-25.zip',
			'2014-11-21.zip'];

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < cpus.length; i++) {
		cluster.fork();
	}

	cluster.on('online', (worker) => {
		console.log(`${worker.id} is online!`);
	});

	cluster.on('message', (worker, msg) => {
		if (dates.length <= 0) {
			console.log(`worker: ${worker.id} has nothing to do!`);
			worker.disconnect();
			return;
		}
		console.log('date length is:', dates.length, msg);
		var file = dates.pop();
		var uri = '/content/' + file;
		var options = {
			protocol: 'http:',
			// @TODO auth here!
			method: 'GET',
			host: 'theartofblowjob.com',
			path: uri,
		};

		var callback = function (response) {
			if (response.statusCode !== 200) {
				// console.log('file not found', uri);
				worker.disconnect();
				return;
			}
			var len = parseInt(response.headers['content-length'], 10);
			var cur = 0;
			console.log(`${worker.id} downloading file ${file}`);
			var opts = {
				flags: 'w',
				efaultEncoding: 'binary'
			};
			var dest = fs.createWriteStream('./downloads/' + file, opts);

			response.on('data', (chunk) => {
				if (!chunk) {
					return;
				}
				dest.write(chunk);
				cur += chunk.length;
				var percent = Math.round(100 * cur / len);
				if (percent % 10 === 0) {
					console.log(worker.id, file, percent);
				}
			});

			response.on('end', () => {
				worker.disconnect();
			});

			dest.on('end', () => {
				// worker.send({message: 'try again'});
			});
		};
		http.get(options, callback);
	});

	cluster.on('exit', (dead) => {
		console.log(`${dead.id} has died`);
		if (dates.length > 0) {
			console.log(`more work to do spinning up new worker....`);
			var worker = cluster.fork();
			console.log(`${worker.id} has been born`);
		}
	});

} else {
	process.send({message: 'download'});
}
