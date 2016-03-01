'use strict';

module.exports = function (grunt) {

	var fs = require('fs');
	var async = require('async');
	var UglifyJS = require("uglify-js");

	grunt.registerMultiTask('uglify-js', function (item) {
		var startTime = new Date();
		var done = this.async();
		async.map(global.jsCompileList, function (item, callback) {
			fs.readFile(global.staticDirectory + '/.deploy/dist/' + item, function(err, data){
				console.log(11);
				if(err){
					throw err;
				}
				var uglifyJSStartTime = new Date();
				var result = UglifyJS.minify(data.toString(), {fromString: true});
				var uglifyJSEndTime = new Date();
				grunt.log.writeln('file: ' + '.deploy/dist/' + item + ' minified, spend time ' + (uglifyJSEndTime - uglifyJSStartTime) + ' ms!');
				var uglifyJSWriteStartTime = new Date();
				fs.writeFile(global.staticDirectory + '/.deploy/dist/' + item, result.code, function(err){
					if(err){
						throw err;
					}
					var uglifyJSWriteEndTime = new Date();
					grunt.log.writeln('file: ' + '.deploy/dist/' + item + ' wrote, spend time ' + (uglifyJSWriteEndTime - uglifyJSWriteStartTime) + ' ms!');
					callback();
				});
			});
		}, function (err) {
			if (err) {
				throw err;
			}
			done();
			var endTime = new Date();
			grunt.log.writeln('complete: uglify js success, spend time ' + (endTime - startTime) + ' ms!');
		});
		
	});

	//grunt.log.writeln('===templateSrcFileList====');
	//console.log(global.templateSrcFileList);
	//grunt.log.writeln('===seaModulesBuildList====');
	//console.log(global.seaModulesBuildList);
	//grunt.log.writeln('====jsCompileList===');
	//console.log(global.jsCompileList);

}
