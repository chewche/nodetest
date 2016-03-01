//包装函数
module.exports = function(grunt) {

	//任务配置，所有插件的配置信息
	grunt.initConfig({
	
		//获取 package.json 的信息
		pkg: grunt.file.readJSON('package.json'),

		// uglify插件的配置信息
		uglify: {
			options: {
				stripBanners: true,
				banner: '/*! <%=pkg.name%>-<%=pkg.version%>.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: '../src/**/*.js',
				dest: '../bulid/<%=pkg.name%>-<%=pkg.version%>.min.js'
			}
		},

		// jshint插件的配置信息
		jshint: {
			options: {
				globals: {
					"boss":      true,
					"node":      true,
					"eqeqeq":    true,
					"strict":    true,
					"newcap":    false,
					"undef":     true,
					"unused":    true,
					"onecase":   true,
					"console":	 true,
					"jQuery":	 true,
					"module":	 true,
					"lastsemic": true
				}
			},
			build: {
				build: ['Gruntfile.js', '../src/**/*.js']
			}
		},

		//watch 插件的配置信息
		watch: {
			build: {
				files: ['<%= uglify.build.src %>'],
				tasks: ['jshint', 'uglify'],
				options: { spawn: false}
			}
		}

	});

	//告诉grunt我们将使用插件
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//告诉grunt当我们在终端中输入grunt时需要做些什么（注意先后顺序）
	grunt.registerTask('default', ['jshint', 'uglify']);

};