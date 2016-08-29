'use strict';

var cluster = require('cluster'),
	http = require('http'),
	nopt = require("nopt"),
	ProgressBar = require('progress'),
	fs = require('fs'),
	cpus = require('os').cpus();

var dates = ['2009-05-05a.zip', '2009-05-07a.zip', '2009-05-08a.zip', '2009-05-09a.zip'];

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < cpus.length; i++) {
		cluster.fork();
	}

	cluster.on('online', (worker) => {
		console.log('online worker', worker.id);
	});

	cluster.on('listening', (address) => {
		console.log(address);
	});

	cluster.on('exit', function (worker, code, signal) {
		console.log('worker ', worker.process.pid, 'died:', signal);
	});

	cluster.on('message', (msg) => {
		var worker = cluster.worker;
		if (msg === 'download') {
			var uri = 'content/' + dates[worker.id - 1];
			var options = {
				protocol: 'http:',
				// @ TODO auth
				method: 'GET',
				host: 'theartofblowjob.com',
				path: uri,
			};
			// console.log('worker request options:', options);
			http.request(options, (res) => {
				console.log(worker.id, res.statusCode, uri);
				worker.disconnect();
			});
		}
	});

} else {

	process.send('download');
	// Workers can share any TCP connection
	// http.createServer((req, res) => {
	// 	console.log(uris[cluster.worker.id - 1]);
	// 	res.writeHead(200);
	// 	res.end('hello world\n');
	// }).listen(8001);
}

// var uri = "http://dhKSFJ3Y:P5UXJ6A@theartofblowjob.com/content/";
// var files = dates.map((d) => {
// 	return uri.toString() + `${d}.zip`;
// });


// http://:@theartofblowjob.com/content/2007-05-21.zip
// var date = '2009-05-07';
// var uri = "http://dhKSFJ3Y:P5UXJ6A@theartofblowjob.com/content/" + date + '.zip';
// var known = {
// 		'username': String,
// 		'password': String
// 	},
// 	short = {
// 		'u': ['--username'],
// 		'p': ['--password']
// 	};
// var parsed = nopt(known, short, process.argv, 2);
// // console.log(parsed);
//
// // process.exit();
//
// // request.get(url + '/content/' + date + '.zip').pipe(fs.createWriteStream('./downloads/' + date + '.zip'));
// var req = http.get(uri, function (response) {
// 	var len = parseInt(response.headers['content-length'], 10);
// 	var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
// 		complete: '=',
// 		incomplete: ' ',
// 		width: 20,
// 		total: len
// 	});
//
// 	var body = "";
// 	var cur = 0;
//
// 	response.on('data', function (chunk) {
// 		bar.tick(chunk.length);
// 	});
//
// 	response.on('data2', function (chunk) {
// 		body += chunk;
// 		cur += chunk.length;
// 		var percent = (100 * cur / len).toFixed(2);
// 		console.log(percent);
// 		if (percent % 20 === 0) {
// 			console.log('20 precent more ');
// 		}
// 	});
//
// 	response.on('end', function () {
// 		fs.writeFile('./downloads/' + date + '.zip', body, {}, function () {
// 			console.log('done!');
// 		});
// 	});
//
// 	req.on('error', function (err) {
// 		console.error(err);
// 	});
// });
//
//
//
// function download(url, callback, encoding){
// 		var request = http.get(url, function(response) {
// 			if (encoding){
// 				response.setEncoding(encoding);
// 			}
// 			var len = parseInt(response.headers['content-length'], 10);
// 			var body = "";
// 			var cur = 0;
// 			var obj = document.getElementById('js-progress');
// 			var total = len / 1048576; //1048576 - bytes in  1Megabyte
//
// 			response.on("data", function(chunk) {
// 				body += chunk;
// 				cur += chunk.length;
// 				obj.innerHTML = "Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb";
// 			});
//
// 			response.on("end", function() {
// 				callback(body);
// 				obj.innerHTML = "Downloading complete";
// 			});
//
// 			request.on("error", function(e){
// 				console.log("Error: " + e.message);
// 			});
//
// 		});
// 	};
