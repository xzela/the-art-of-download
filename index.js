'use strict';

var // request = require('request'),
	http = require('http'),
	nopt = require("nopt"),
	ProgressBar = require('progress'),
	fs = require('fs');
// http://:@theartofblowjob.com/content/2007-05-21.zip
var date = '2009-05-07';
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
// console.log(parsed);

// process.exit();

// request.get(url + '/content/' + date + '.zip').pipe(fs.createWriteStream('./downloads/' + date + '.zip'));
var req = http.get(uri, function (response) {
	var len = parseInt(response.headers['content-length'], 10);
	var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
		complete: '=',
		incomplete: ' ',
		width: 20,
		total: len
	});

	var body = "";
	var cur = 0;

	response.on('data', function (chunk) {
		bar.tick(chunk.length);
	});

	response.on('data2', function (chunk) {
		body += chunk;
		cur += chunk.length;
		var percent = (100 * cur / len).toFixed(2);
		console.log(percent);
		if (percent % 20 === 0) {
			console.log('20 precent more ');
		}
	});

	response.on('end', function () {
		fs.writeFile('./downloads/' + date + '.zip', body, {}, function () {
			console.log('done!');
		});
	});

	response.on('error', function (err) {
		console.error(err);
	});
});
