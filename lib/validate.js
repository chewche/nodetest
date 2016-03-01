'use strict';

var fs = require('fs');
var path = require('path');
var file = require('./file');
var utils = require('./utils');
var async = require('async');

/**
 *
 * @param dir
 * @param list
 * @param extension
 * @returns {*}
 */
function init(options) {
	var webappDirectory = options.webappDirectory;
	global.webappDirectory = webappDirectory;

	global.debugDomain = typeof options.debugDomain == 'string' ? options.debugDomain : /\$\{.+?\}/ig;
	
	var templateDirPath = path.join(global.webappDirectory, '/src/main/webapp/WEB-INF/view/');

	var staticFilesDirectory = options.staticFilesDirectory;

	global.staticDirectory = utils.normalizePath(staticFilesDirectory);

	

	//根据静态文件KEY获取文件CDN地址的服务器端（Java）的函数名称
	global.staticFilesMapFunctionName = typeof options.staticMapFunction == 'string' ? options.staticMapFunction : '$StaticUrl.getUrl';

	global.debugDomain = typeof options.debugDomain == 'string' ? options.debugDomain : /\$\{.+?\}/ig;

	global.deployDomain = typeof options.deployDomain == 'string' ? options.deployDomain : 'http://cache.soso.com/';

	global.imgDeployDomain = typeof options.imgDeployDomain == 'string' ? options.imgDeployDomain : 'http://soso.qstatic.com/';

	global.srcPrefix = '/src/';

	global.deployPrefix = '/deploy/';

	global.cdnRootDirName = typeof options.cdnRootDirName == 'string' ? options.cdnRootDirName.replace(/[\\|\/]/ig, '') : 'wenwen';

	global.seaModulesDirName = typeof options.seaModulesDirectory == 'string' ? options.seaModulesDirectory.replace(/[\\|\/]/ig, '') : 'sea_modules';

	global.local = utils.hasArgument(process.argv, '--local') ? true : false;

	//获取webapp文件数组
	global.templateSrcFileList = file.getAllFilesByDir(path.join(templateDirPath, 'src'), [], ['.vm', '.html', '.jetx']);

	global.debugDomain = typeof options.debugDomain == 'string' ? options.debugDomain : /\$\{.+?\}/ig;

	//存放http方式引用的js
	global.seaModulesBuildList = [];

	//存放use方式引用的js
	global.jsCompileList = [];

	//获取static文件
	_getJSCompileList();
	
}

var seaModulesCacheList = {};

function _getJSCompileList(){
	async.map(global.templateSrcFileList, function(itemPath, callback){
		//获取script的src属性值
		var regexScriptSrc = /<script[\s\S\w\W]{1,}?src\="([\s\S\w\W]{1,}?)"[\s\S\w\W]{0,}?><\/script>/gi;
		var regexpSeajsuse = /seajs\.use\(['"](.{1,}?)['"]\)/gi;

		var tplContent = fs.readFileSync(itemPath).toString();

		tplContent.replace(regexScriptSrc, function($0, $src){
			if($src.indexOf('http') != 0){

				var regexpStaticFilesPrefix = utils.getRegexpStaticFilesPrefix();

				if(!seaModulesCacheList[$src.replace(regexpStaticFilesPrefix, '').replace('/src/js/', '')]){
					global.seaModulesBuildList.push($src.replace(regexpStaticFilesPrefix, '').replace('/src/js/', ''));
					seaModulesCacheList[$src.replace(regexpStaticFilesPrefix, '').replace('/src/js/', '')] = true;
				}

			}
		});

		tplContent.replace(regexpSeajsuse, function($0, $src){
			if ($src && $src.indexOf('page/') > -1) {
				global.jsCompileList.push($src.substr($src.indexOf('page/'), $src.length - 1) + '.js');
			}
		});

	}, function(err, results){
		if(err){
			throw err;
		}
		var endTime = new Date();
		console.log(endTime-global.taskStartTime);
	});
}

exports.init = init;