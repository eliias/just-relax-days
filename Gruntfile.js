module.exports = function(grunt) {

  require('time-grunt')(grunt)
  require('load-grunt-tasks')(grunt)

  const config = {
    'dist': './lib',
    'src': './src'
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: config,

    babel: {
      options: {
        sourceMap: false,
        optional: ['runtime'],
        stage: 1
      },
      build: {
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>',
            src: ['**/*.js'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },

    clean: {
      build: ['<%= config.dist %>']
    },

    concurrent: {
      build: ['eslint', 'babel']
    },

    eslint: {
      target: ['<%= config.src %>']
    },

    watch: {
      scripts: {
        files: ['<%= config.src %>/**/*.js'],
        tasks: ['concurrent:build']
      }
    }

  })

  grunt.registerTask('default', ['build'])
  grunt.registerTask('build', [
    'clean',
    'eslint',
    'babel'
  ])

}
