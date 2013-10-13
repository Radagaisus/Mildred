module.exports = (grunt) ->

  path = require 'path'

  pkg = require './package.json'

  # Load Grunt Dependencies
  for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
    grunt.loadNpmTasks(name)

  modules = [
    'temp/lib/support.js'
    'temp/lib/utils.js'
    'temp/lib/composition.js'
    'temp/composer.js'
    'temp/dispatcher.js'
    'temp/lib/sync_machine.js'
    'temp/lib/helpers.js'
    'temp/lib/history.js'
    'temp/lib/route.js'
    'temp/lib/router.js'
    'temp/models/model.js'
    'temp/models/collection.js'
    'temp/controller/controller.js'
    'temp/views/view.js'
    'temp/views/layout.js'
    'temp/views/collection_view.js'
    'temp/application.js'
  ]

  # Configuration
  # -----------------------------------------------
  grunt.initConfig

    pkg: pkg

    # Clean
    # --------------------------------------------
    clean:
      build: 'build'
      temp: 'temp'
      components: 'components'
      test: ['test/temp*']

    # Compilation
    # --------------------------------------------
    coffee:
      compile:
        files: [
          expand: true
          dest: 'temp/'
          cwd: 'src'
          src: '**/*.coffee'
          ext: '.js'
        ]

      test:
        files: [
          expand: true
          dest: 'test/temp/'
          cwd: 'test/spec'
          src: '**/*.coffee'
          ext: '.js'
        ]

      options:
        bare: true

    # Module naming
    # --------------------------------------------
    copy:
      universal:
        files: [
          expand: true
          dest: 'temp/'
          cwd: 'temp'
          src: 'src/**/*.js'
        ]

        options:
          processContent: (content, path) ->
            name = ///temp/(.*)\.js///.exec(path)[1]
            # data = content
            return content

    # Module concatenation
    # ---------------------------------------------
    concat:
      universal:
        files: [
          dest: 'dist/<%= pkg.name %>.js'
          src: modules
        ]

      options:
        separator: ';'

        banner: '''
        /*!
         * Mildred <%= pkg.version %>
         *
         * Mildred may be freely distributed under the MIT license.
         * For all details and documentation:
         * https://github.com/snird/Mildred
         */
         '''

    # Browser dependencies
    # --------------------
    bower:
      install:
        options:
          targetDir: './test/bower_components'
          cleanup: true

    # Test runner
    # -----------
    mocha:
      index:
        src: ['./test/index.html']
        # options:
        #   grep: 'autoAttach'
        #   mocha:
        #     grep: 'autoAttach'

    # Minify
    # ------
    uglify:
      options:
        mangle: false
      universal:
        files:
          'dist/mildred.min.js': 'dist/mildred.js'

    # Watching for changes
    # ---------------------------------------------
    watch:
      coffee:
        files: ['src/**/*.coffee']
        tasks: [
          'coffee:compile'
          'copy:test'
          'shell:test'
          'mocha'
        ]

      test:
        files: ['test/**/*.coffee'],
        tasks: [
          'shell:test'
          'coffee:test'
          'mocha'
        ]

    # Compiling the tests
    # ---------------------------------------------
    shell:
      test:
        options:
          stdout: true
        command: 'cd test && cake build'


  # Prepare
  # -------
  grunt.registerTask 'prepare', [
    'clean'
    'bower'
    'clean:components'
  ]

  # Build
  # --------------------------------------------
  grunt.registerTask 'build', [
    'coffee:compile'
    'copy:universal'
    'concat:universal'
    'uglify'
  ]

  # Test
  # --------------------------------------------
  grunt.registerTask 'test', ['mocha']

  # Default
  # --------------------------------------------
  grunt.registerTask 'default', [
    'clean'
    'build'
    'test'
  ]
