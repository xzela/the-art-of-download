'use strict';

var cluster = require('cluster'),
	os = require('os');

var list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

if (cluster.isMaster) {
	for (var i = 0; i < os.cpus().length; ++i) {
		cluster.fork();
	}
	cluster.on('online', (worker) => {
		console.log(`${worker.id} is online!`);
	});

	cluster.on('message', (worker, msg) => {
		if (list.length > 0) {
			var thing = list.pop();
			console.log(`worker: ${worker.id} hears message: ${msg.message}`);
			console.log(`worker: ${worker.id} works on ${thing}`);
			worker.disconnect();
			return;
		}
		console.log(`worker: ${worker.id} has nothing to do!`);
		worker.disconnect();
	});

	cluster.on('exit', (deadWorker) => {
		console.log(`${deadWorker.id} has died`);
		if (list.length > 0) {
			var worker = cluster.fork();
			console.log(`${worker.id} has been born`);
		}
	});
} else {
	process.send({message: 'process'});
}
