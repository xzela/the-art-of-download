'use strict';

var // request = require('request'),
	http = require('http'),
	nopt = require("nopt"),
	fs = require('fs');
// http://:@theartofblowjob.com/content/2007-05-21.zip
var date = '2009-05-05';
var uri = "http://@theartofblowjob.com/content/" + date + '.zip';
var known = {
		'username': String,
		'password': String
	},
	short = {
		'u': ['--username'],
		'p': ['--password']
	};
var parsed = nopt(known, short, process.argv, 2);
console.log(parsed);

process.exit();

// request.get(url + '/content/' + date + '.zip').pipe(fs.createWriteStream('./downloads/' + date + '.zip'));
var req = http.get(uri, function (response) {
	process.exit();
	var len = parseInt(response.headers['content-length'], 10);
	var body = "";
	var cur = 0;
	response.on('data', function (chunk) {
		body += chunk;
		cur += chunk.length;
		console.log((100.0 * cur / len).toFixed(2));
	});

	response.on('end', function () {
		fs.writeFile('./downloads/' + date + '.zip', body, {}, function () {
			console.log('done!');
		});
	});

	req.on('error', function (err) {
		console.error(err);
	});
});



function download(url, callback, encoding){
		var request = http.get(url, function(response) {
			if (encoding){
				response.setEncoding(encoding);
			}
			var len = parseInt(response.headers['content-length'], 10);
			var body = "";
			var cur = 0;
			var obj = document.getElementById('js-progress');
			var total = len / 1048576; //1048576 - bytes in  1Megabyte

			response.on("data", function(chunk) {
				body += chunk;
				cur += chunk.length;
				obj.innerHTML = "Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb";
			});

			response.on("end", function() {
				callback(body);
				obj.innerHTML = "Downloading complete";
			});

			request.on("error", function(e){
				console.log("Error: " + e.message);
			});

		});
	};
