'use strict';

var cluster = require('cluster'),
	http = require('http'),
	fs = require('fs'),
	cpus = require('os').cpus();

// first date to start with

var username = process.argv[2];
var password = process.argv[3];
var firstDate = process.argv[4] || '2009-01-01';

if (username === undefined || password === undefined) {
	throw new Error('`username` and `password` are required!');
}

var date = firstDate;
var dates = [];

// helper function to add day to a date
function addDays(date, num) {
	var n = new Date(date);
	n.setDate(n.getDate() + num);
	return n;
}
// populate the date list
while(Date.parse(new Date(date)) <= Date.parse(new Date())) {
	date = addDays(date, 1);
	dates.push(date.toISOString().substr(0, 10));
}
if (cluster.isMaster) {
	// Fork workers by cpu halves.
	for (var i = 0; i < cpus.length / 2; i++) {
		cluster.fork();
	}

	cluster.on('online', (worker) => {
		console.log(`${worker.id} is online!`);
	});

	cluster.on('message', (worker) => {
		if (dates.length <= 0) {
			console.log(`worker: ${worker.id} has nothing to do!`);
			worker.disconnect();
			return;
		}
		// console.log('date length is:', dates.length, msg);
		var file = dates.pop() + '.zip';
		var uri = '/content/' + file;
		var options = {
			protocol: 'http:',
			auth: username + ':' + password,
			method: 'GET',
			host: 'theartofblowjob.com',
			path: uri,
		};

		var callback = function (response) {

			if (response.statusCode !== 200) {
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
				var percent = (100 * cur / len).toFixed(2);
				console.log(worker.id, file, percent);
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
