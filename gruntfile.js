module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-stencil');
  grunt.loadNpmTasks('grunt-surround');

  grunt.initConfig({
    'http-server': {
      'dev': {
        root: 'www/',
        port: 8000,
        runInBackground: true,
          open: true,
      }
    },
    surround: {
      options: {
        prepend: function() { return grunt.file.read('src/templates/header.html'); /* '-xxx [[ ' */ },
        append: function() { return grunt.file.read('src/templates/footer.html'); /* ]] yyy-'; */ }
      },
      shaders: {
        expand: true,
        cwd: 'workbench/',
        src: '*.fs',
        dest: 'www/',
        ext: '.html',
      },
    },
    concat: {
      options: {
      },
      depcss: {
        src: [
          'src/js/*.js',
        ],
        dest: 'tmp/toyrunner.js',
      },
    },
    sass: {
      runner: {
        files: {
          'tmp/toyrunner.noap.css': 'src/scss/*.scss',
        }
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'tmp/toyrunner.ap.css': 'tmp/toyrunner.noap.css',
        }
      }
    },
    /*
    ngtemplates: {
      app: {
        cwd: 'src',
        src: 'views/*.html',
        dest: 'tmp/js/generated_templates.js',
        options: {
          htmlmin: { collapseWhitespace: true, collapseBooleanAttributes: false, removeComments: true },
          bootstrap: function(module, script) {
            return 'GeoQuizApp.run([\'$templateCache\', function($templateCache) {' + script + '}]);';
          }
        }
      }
    },
    */
    cssmin: {
      options: {
        keepBreaks: true
      },
      css: {
        src: 'tmp/toyrunner.ap.css',
        dest: 'www/toyrunner.min.css'
      }
    },
    uglify: {
      js: {
        options: {
          mangle: true,
          beautify: false,
          maxLineLen: 200,
        },
        src: 'tmp/toyrunner.js',
        dest: 'www/toyrunner.min.js'
      },
    },
    /*
    browserify: {
      app: {
        src: 'src/js/_browserified.js',
        dest: 'tmp/js/all_browserified.js',
      },
    },
    */
    watch: {
      shaders: {
        files: [ 'workbench/*fs' ],
        tasks: [ 'surround:shaders' ]
      },
      templates: {
        files: [ 'src/templates/*' ],
        tasks: [ 'surround:shaders' ]
      },
      /*
      www: {
        files: [
          'src/js/_browserified.js'
        ],
        tasks: [
          'browserify',
        ],
      },
      */
      js: {
        files: [ 'src/js/*.js' ],
        tasks: [ 'concat', 'uglify' ],
      },
      sass: {
        files: [ 'src/scss/*.scss' ],
        tasks: [ 'sass', 'concat', 'cssmin' ],
      },
      /*
      css: {
        files: [
          'tmp/css/*.css'
        ],
        tasks: [
          'concat:css', 'autoprefixer:dist', 'cssmin:css'
        ],
      },
      */
      www: {
        files: [
          'www/*',
        ],
        tasks: [],
        options: {
          spawn: false,
          livereload: true
        },
      },
    },
  });

  // grunt.registerTask('prepare', ['exec:version', 'exec:prepare']);
  // grunt.registerTask('default', ['exec:version', 'browserify', 'ngtemplates', 'sass', 'concat', 'autoprefixer', /*'uglify',*/ 'cssmin']);
  // grunt.registerTask('dev',     ['exec:version', 'browserify', 'ngtemplates', 'sass', 'concat', 'autoprefixer', /*'uglify',*/ 'cssmin', 'http-server:dev', 'watch']);

  grunt.registerTask('default', ['http-server', 'surround:shaders', 'concat', 'sass', 'autoprefixer', 'cssmin', 'uglify', 'watch']);

};
