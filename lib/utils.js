'use strict';

var path = require('path');
var grunt = require('spm-grunt');
var http = require('http');
var fs = require('fs');

/**
 *
 * @returns {string}
 */
function getDate() {
	var date = new Date();

	return date.getFullYear() + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '_' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + '_' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '_' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
}

/**
 *
 * @param arr
 * @param search
 * @returns {boolean}
 */
function isInArray(arr, search) {
	if (typeof arr == 'object' && typeof arr.length == 'number') {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == search) {
				return true;
			}
		}
	}

	return false;
}

/**
 *
 * @param content
 * @returns {*}
 */
function md5(content) {
	var crypto = require('crypto');

	return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/**
 *
 * @param reg
 * @returns {*}
 */
function escapeRegexp(reg) {
	if (typeof reg == 'string') {
		reg = reg.replace(/[\$|\{|\}|\(|\)|\\.]/ig, function ($0) {
			return '\\' + $0;
		});
	}

	return reg;
}

/**
 *
 * @param path
 * @returns {string}
 */
function normalizePath(path) {
	if (typeof path == 'string') {
		return path.replace(/[\\|\\\\|//|////]/ig, '/');
	}

	return path;
}


/**
 *
 * @param argv
 * @param search
 * @returns {boolean}
 */
function hasArgument(argv, search) {
	var ret = false;

	for (var i = 0; i < argv.length; i++) {
		if (argv[i] == search) {
			ret = true;
			break;
		}
	}
	return ret;
}

/**
 *
 * @param logKey
 * @param logValue
 */
function formatLogInfo(logKey, logValue) {
	grunt.log.writeln('log_info_start ' + '=======================');
	grunt.log.writeln(logKey + ' ' + logValue);
	grunt.log.writeln('log_info_end ' + '=======================');
}

function errorHandler(errorInfo) {
	grunt.log.error(errorInfo);
	process.exit();
}

/**
 * 下载文件
 * @param url
 * @param localPath
 * @param successCallback
 * @param refreshCallback
 */
function downloadFile(url,localPath, successCallback, refreshCallback) {
    http.get(url, function(res) {
        var data = '';

        res.on('data', function(chunk) {
            data += chunk.toString();
        });

        res.on('end', function() {
            var md5Str = md5(data);
			//console.log(md5Str)

            if(url.indexOf(cutOutMD5(md5Str)) > -1){
                successCallback();
            }else{
				//refresh前需要检测本地的文件MD5值是否正确，如果本地MD5值不正确的话，则取消刷新，并退出进程
				var fileContent = fs.readFileSync(localPath).toString();
				var fileMd5 = md5(fileContent);
				if(url.indexOf(cutOutMD5(fileMd5)) == -1){
					grunt.log.writeln('check: file ' + localPath + ' md5 fail!');
					process.exit();
				}
                refreshCallback();
            }
        });
    }).on('error', function() {
        grunt.log.error('downloadFile Error! URL: ', url);

        process.exit();
    });
}

/**
 * 获取本地调试下的静态资源前缀
 * @returns {RegExp}
 */
function getRegexpStaticFilesPrefix(){
    global.debugDomain.lastIndex = 0;
    return global.debugDomain;
}

/**
 * 截取文件MD5前7位
 * @param md5Str
 * @returns {string}
 */
function cutOutMD5(md5Str){
    return md5Str.substr(0, 7);
}

exports.cutOutMD5 = cutOutMD5;
exports.getRegexpStaticFilesPrefix = getRegexpStaticFilesPrefix;

exports.getDate = getDate;
exports.isInArray = isInArray;
exports.md5 = md5;
exports.escapeRegexp = escapeRegexp;
exports.normalizePath = normalizePath;
exports.hasArgument = hasArgument;
exports.formatLogInfo = formatLogInfo;
exports.errorHandler = errorHandler;
exports.downloadFile = downloadFile;