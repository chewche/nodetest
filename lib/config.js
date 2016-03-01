'use strict';

var grunt = require('spm-grunt');
var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var _ = grunt.util._;

var jsBuildList = [];

function getConfig() {
    var deployConfig = {};

	var data;

	if (global.staticDirectory) {
        deployConfig.output = {};
        deployConfig.src = path.join(global.staticDirectory, 'src/js', global.cdnRootDirName);
        deployConfig.outputDir = global.seaModulesDirName;
        deployConfig.dist = path.join(global.staticDirectory, 'deploy/js', deployConfig.outputDir, global.cdnRootDirName);
        deployConfig.alias = global.alias || {};

        for (var j = 0; j < global.jsCompileList.length; j++) {
            var jsPageFilesDir = deployConfig.src;
            var jsRelativePath = global.jsCompileList[j];

            if (fs.existsSync(path.join(jsPageFilesDir, jsRelativePath))) {
                jsBuildList.push(jsRelativePath);
            }
        }

        global.finalJSBuildList = jsBuildList;

        utils.formatLogInfo('jsBuildList', jsBuildList.toString());

        deployConfig.output.relative = jsBuildList;

        deployConfig.output.webEditorThemeList = global.buildWebEditor ? global.webEditorThemeList : [];
		
		data = {
			transport: {
				spm: _transportConfig(deployConfig)
			},
            concat: {
                relative: _concatRelativeConfig(deployConfig)
            },
			"uglify-js": {
				target: {}
			}
		}
	}

	return data;
}

exports.getConfig = getConfig;



/**
 * transport:spm
 * @param deployConfig
 * @returns {Array}
 */

function _transportConfig(deployConfig) {
    var transport = require('grunt-cmd-transport');
    var script = transport.script.init(grunt);
    var style = transport.style.init(grunt);
    var text = transport.text.init(grunt);
    var template = transport.template.init(grunt);

    return {
        options: {
            idleading: global.cdnRootDirName + '/',
            paths: [deployConfig.outputDir],
            alias: deployConfig.alias || {},
            parsers: {
                '.js': [script.jsParser],
                '.css': [style.css2jsParser],
                '.tpl': [text.html2jsParser],
                '.html': [text.html2jsParser],
                '.handlebars': [template.handlebarsParser]
            },
            handlebars: {
                id: deployConfig.alias.handlebars || 'handlebars',
                knownHelpers: [],
                knownHelpersOnly: false
            },
            debug: false
        },
        files: _getTransportFiles(deployConfig)
    };
}

/**
 * @param deployConfig
 * @returns {Array}
 */
function _getTransportFiles(deployConfig) {
    var list = [];
    var cacheList = {};

    var fileList = fs.readdirSync(deployConfig.src);

    for (var i = fileList.length - 1; i >= 0; i--) {
        var fileName = fileList[i];

        var filePath = path.join(deployConfig.src, fileName);

        var stat = fs.statSync(filePath);

        if (!stat.isDirectory()) {
            continue;
        }

        if (fileName == 'page') {
            for (var j = 0; j < jsBuildList.length; j++) {
                var key = path.dirname(jsBuildList[j]).split('/')[1];
                var src = fileName + '/' + key + '/**/*';

                if(key.toString() == 'qunapp'){
                    if(jsBuildList[j].indexOf('qunapp' + '/pc') > -1){
                        src = fileName + '/' + key + '/pc' + '/**/*';
                        key = key + '/pc';
                    }else if(jsBuildList[j].indexOf('qunapp' + '/mobile') > -1){
                        src = fileName + '/' + key + '/mobile' + '/**/*';
                        key = key + '/mobile';
                    }
                }

                if (!cacheList[src]) {
                    list.push({
                        cwd: deployConfig.src,
                        expand: true,
                        src: fileName + '/' + key + '/**/*',
                        filter: function (filepath) {
                            // exclude outputDir dir
                            return grunt.file.isFile(filepath) && !grunt.file.doesPathContain(deployConfig.outputDir, filepath);
                        },
                        dest: global.staticDirectory + '/.deploy/src'
                    });
                    cacheList[src] = true;

                    if(key == 'qunapp/pc' || key == 'qunapp/mobile'){
                        if (!cacheList['qunapp/s']) {
                            list.push({
                                cwd: deployConfig.src,
                                expand: true,
                                src: fileName + '/' + 'qunapp/s' + '/**/*',
                                filter: function (filepath) {
                                    // exclude outputDir dir
                                    return grunt.file.isFile(filepath) && !grunt.file.doesPathContain(deployConfig.outputDir, filepath);
                                },
                                dest: global.staticDirectory + '/.deploy/src'
                            });
                            cacheList['qunapp/s'] = true;
                        }
                    }
                }
            }
        }else {
            var src = fileName + '/**/*';
            if (!cacheList[src]) {
                list.push({
                    cwd: deployConfig.src,
                    expand: true,
                    src: src,
                    filter: function (filepath) {
                        // exclude outputDir dir
                        return grunt.file.isFile(filepath) && !grunt.file.doesPathContain(deployConfig.outputDir, filepath);
                    },
                    dest: global.staticDirectory + '/.deploy/src'
                });
                cacheList[src] = true;
            }
        }
    }

    return list;
}


/**
 * concat:relative
 * support format:
 * ["main.js", {"xx.js": ["xx.js", "templates/*.html.js"]}]
 * @param deployConfig
 * @returns {Object}
 */
function _concatRelativeConfig(deployConfig) {
    var files = {};
    (deployConfig.output.relative || deployConfig.output || []).forEach(function (f) {
        if (_.isString(f)) {
            files[global.staticDirectory + '/.deploy/dist/' + f] = global.staticDirectory + '/.deploy/src/' + f;
        } else {
            var filename = _.keys(f)[0];
            files[global.staticDirectory + '/.deploy/dist/' + filename] = f[filename].map(function (path) {
                return global.staticDirectory + '/.deploy/src/' + path;
            });
        }
    });

    return {
        options: {
            include: 'relative'
        },
        files: files
    };
}