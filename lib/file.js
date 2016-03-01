'use strict';

var path = require('path');
var grunt = require('spm-grunt');
var http = require('http');
var fs = require('fs');
var utils = require('./utils');


/**
 *
 * @param dir
 * @param list
 * @param extension
 * @returns {*}
 */
function getAllFilesByDir(dir, list, extension) {
	if (!(list instanceof Array)) {
		list = [];
	}

	var fileList = fs.readdirSync(dir);

	for (var i = fileList.length - 1; i >= 0; i--) {
		var filePath = path.join(dir, fileList[i]);

		var stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			getAllFilesByDir(filePath, list, extension);
		} else {
			if (utils.isInArray(extension, path.extname(filePath))) {
				list.push(utils.normalizePath(filePath));
			}
		}
	}
	//console.log(list);

	return list;
}

exports.getAllFilesByDir = getAllFilesByDir;