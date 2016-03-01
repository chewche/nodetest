//��װ����
module.exports = function(grunt) {

	//�������ã����в����������Ϣ
	grunt.initConfig({
	
		//��ȡ package.json ����Ϣ
		pkg: grunt.file.readJSON('package.json'),

		// uglify�����������Ϣ
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

		// jshint�����������Ϣ
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

		//watch �����������Ϣ
		watch: {
			build: {
				files: ['<%= uglify.build.src %>'],
				tasks: ['jshint', 'uglify'],
				options: { spawn: false}
			}
		}

	});

	//����grunt���ǽ�ʹ�ò��
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//����grunt���������ն�������gruntʱ��Ҫ��Щʲô��ע���Ⱥ�˳��
	grunt.registerTask('default', ['jshint', 'uglify']);

};