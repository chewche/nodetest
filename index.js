'use strict';

/*
var http = require('http');
var url = require('url');
var util = require('util');

var httprequest = require('./lib/httprequest');

http.createServer(function(req, res) {

	//post
	var post = '';  
	req.on('data', function(chunk) {
		post += chunk;
	});  
	req.on('end', function() {
		post = querystring.parse(post);
		res.end(util.inspect(post));
	});

	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<h1>Node.js</h1>');
	res.write(httprequest.contents);
	res.write('<p></p>');

	//get
	res.end(util.inspect(url.parse(req.url, true)));

}).listen(3000);
console.log("HTTP server is listening at port 3000.");





var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
event.on('some_event', function(){
	console.log('<p>some_event</p>');
});
setTimeout(function(){
	event.emit('some_event');
}, 1000);



exports.hello = function(){
	console.log('hello ');
	console.log(process.argv);
}
*/


var path = require('path');
var grunt = require('spm-grunt');
var getConfig = require('./lib/config').getConfig;
var validate = require('./lib/validate');
var utils = require('./lib/utils.js');
//console.log(process.argv);

exports = module.exports = function (options) {
	global.taskStartTime = new Date();

	validate.init(options);

	grunt.invokeTask('build', options, function(grunt) {
		var config = getConfig(options);
		loadTasks(grunt);
		grunt.initConfig(config);

		if (utils.hasArgument(process.argv, '-d')) {
			grunt.option('stack', true);
			grunt.option('debug', true);
		}
		
		var taskList = [];

		if (global.staticDirectory) {
			taskList.push(
				//'clean:static_dist',
				//'css-compile-dist',
				'transport:spm', // src/* -> .build/src/*
				'concat:relative' // .build/src/* -> .build/dist/*.js
			);
		}
		
		if (global.staticDirectory) {
			taskList.push(
				'uglify-js' // .build/dist/*.js -> .build/dist/*.js
				//'md5-js', // .build/dist/*.js -> dist/*-md5.js
				//'md5-sea_modules'
			);
		}
		console.log(taskList);

		grunt.registerInitTask('build', taskList);

	});

}

function loadTasks(grunt) {
	// load built-in tasks
	[
		'grunt-cmd-transport',
		'grunt-cmd-concat',
		'grunt-contrib-uglify'
	].forEach(function (task) {
		var taskdir = path.join(__dirname, 'node_modules', task, 'tasks');
		if (grunt.file.exists(taskdir)) {
			grunt.loadTasks(taskdir);
		}
	});

	grunt.loadTasks(path.join(__dirname, 'tasks'));
}

exports.loadTasks = loadTasks;
exports.getConfig = getConfig;


